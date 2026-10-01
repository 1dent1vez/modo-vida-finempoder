-- Additive migration. All billing/editorial writes are server-only.
create table public.newsletter_memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  status text not null default 'none',
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  paid_until timestamptz,
  pilot_until timestamptz,
  cancel_at_period_end boolean not null default false,
  email_enabled boolean not null default false,
  accepted_at timestamptz,
  terms_version text,
  last_event_created bigint not null default 0,
  checkout_id text,
  checkout_key uuid,
  checkout_expires_at timestamptz,
  updated_at timestamptz not null default now()
);
create table public.newsletter_editions (
  id uuid primary key default gen_random_uuid(),
  title text not null, summary text not null, category text not null,
  body text not null, sources jsonb not null default '[]', author text not null,
  is_sample boolean not null default false,
  status text not null default 'draft' check (status in ('draft','approved','scheduled','sending','published','failed')),
  version integer not null default 1,
  approved_by uuid references auth.users(id), approved_at timestamptz,
  scheduled_at timestamptz, published_at timestamptz,
  broadcast_id text, delivery_status text, delivery_error text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index on public.newsletter_editions(status, scheduled_at);
create table public.newsletter_events (
  event_id text primary key, created_at timestamptz not null default now()
);
alter table public.newsletter_memberships enable row level security;
alter table public.newsletter_editions enable row level security;
alter table public.newsletter_events enable row level security;
revoke all on public.newsletter_memberships, public.newsletter_editions, public.newsletter_events from anon, authenticated;
grant all on public.newsletter_memberships, public.newsletter_editions, public.newsletter_events to service_role;

-- Atomically deduplicate provider events and preserve the latest known paid period.
create function public.newsletter_apply_event(p_event_id text, p_created bigint, p_user uuid,
  p_subscription text, p_status text, p_paid_until timestamptz, p_cancel boolean)
returns void language plpgsql security definer set search_path = '' as $$
declare existing public.newsletter_memberships;
begin
  select * into existing from public.newsletter_memberships where user_id = p_user for update;
  if not found then raise exception 'Unknown newsletter member'; end if;
  if exists(select 1 from public.newsletter_events where event_id = p_event_id) then return; end if;
  if p_created >= existing.last_event_created then
    update public.newsletter_memberships set
      stripe_subscription_id = p_subscription, status = p_status,
      paid_until = greatest(paid_until, p_paid_until),
      cancel_at_period_end = p_cancel, last_event_created = p_created, updated_at = now()
    where user_id = p_user;
  end if;
  insert into public.newsletter_events(event_id) values (p_event_id) on conflict do nothing;
end $$;
revoke all on function public.newsletter_apply_event(text,bigint,uuid,text,text,timestamptz,boolean) from public, anon, authenticated;
grant execute on function public.newsletter_apply_event(text,bigint,uuid,text,text,timestamptz,boolean) to service_role;

create function public.newsletter_checkout_claim(p_user uuid)
returns table(request_key uuid, expires_at timestamptz) language plpgsql security definer set search_path = '' as $$
begin
  perform 1 from public.newsletter_memberships where user_id = p_user for update;
  update public.newsletter_memberships set checkout_key = gen_random_uuid(),
    checkout_expires_at = date_trunc('second', now()) + interval '1 hour', checkout_id = null
    where user_id = p_user and (checkout_key is null or checkout_expires_at <= now());
  return query select checkout_key, checkout_expires_at from public.newsletter_memberships where user_id = p_user;
end $$;
revoke all on function public.newsletter_checkout_claim(uuid) from public, anon, authenticated;
grant execute on function public.newsletter_checkout_claim(uuid) to service_role;

create function public.newsletter_claim_publication(p_id uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(490003);
  if exists(select 1 from public.newsletter_editions where status in ('sending','failed')) then return false; end if;
  update public.newsletter_editions set status = 'sending', delivery_status = 'preparing'
    where id = p_id and status = 'scheduled' and approved_at is not null and scheduled_at <= now();
  return found;
end $$;
revoke all on function public.newsletter_claim_publication(uuid) from public, anon, authenticated;
grant execute on function public.newsletter_claim_publication(uuid) to service_role;

-- Never seed a paid article or grant access automatically.
