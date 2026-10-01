import { Router } from 'express';
import { z } from 'zod';
import { authGuard } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/requireRole.js';
import { supabase } from '../lib/supabase.js';
import { MODULES, TOTAL_PER_MODULE } from '../config/modules.js';
import { checked } from '../newsletter/store.js';
import { newsletterConfig, paymentsReady, httpError } from '../newsletter/providers.js';

export const adminRouter = Router();
adminRouter.use(authGuard, requireRole('admin'));

adminRouter.get('/me', (req, res) => {
  res.setHeader('Cache-Control', 'private, no-store');
  res.json({ id: req.user!.sub, role: 'admin' });
});

adminRouter.get('/overview', async (_req, res) => {
  res.setHeader('Cache-Control', 'private, no-store');
  const statuses = ['draft', 'approved', 'scheduled', 'sending', 'failed'] as const;
  const [accountResult, progressResult, membershipResult, ...editionResults] = await Promise.all([
    supabase.auth.admin.listUsers({ page: 1, perPage: 1 }),
    supabase.from('lesson_progress').select('id', { count: 'exact', head: true }).eq('completed', true),
    supabase.from('newsletter_memberships').select('user_id', { count: 'exact', head: true }),
    ...statuses.map(status => supabase.from('newsletter_editions').select('id', { count: 'exact', head: true }).eq('status', status)),
  ]);
  if (accountResult.error) throw httpError(503, 'No se pudo consultar el total de cuentas.');
  for (const result of [progressResult, membershipResult, ...editionResults]) {
    if (result.error) throw httpError(503, 'No se pudo consultar el resumen administrativo.');
  }
  const editions = checked(await supabase.from('newsletter_editions')
    .select('id,title,status,scheduled_at,delivery_status,delivery_error,created_at')
    .order('created_at', { ascending: false }).limit(8));
  const c = newsletterConfig();
  res.json({
    metrics: {
      accounts: accountResult.data.total ?? 0,
      completedLessons: progressResult.count ?? 0,
      newsletterMembers: membershipResult.count ?? 0,
      ...Object.fromEntries(statuses.map((status, index) => [status, editionResults[index]?.count ?? 0])),
    },
    editions,
    modules: MODULES.map(id => ({ id, lessons: TOTAL_PER_MODULE })),
    services: {
      api: true,
      newsletter: c.NEWSLETTER_ENABLED === 'true',
      payments: paymentsReady(),
      email: !!(c.RESEND_API_KEY && c.NEWSLETTER_FROM && c.RESEND_NEWSLETTER_SEGMENT_ID),
      editorialAi: !!c.OPENAI_API_KEY,
      publicationJob: c.NEWSLETTER_CRON_SECRET.length >= 32,
    },
  });
});

adminRouter.get('/users', async (req, res) => {
  res.setHeader('Cache-Control', 'private, no-store');
  const page = z.coerce.number().int().min(1).max(10000).parse(req.query.page ?? 1);
  const perPage = 25;
  const result = await supabase.auth.admin.listUsers({ page, perPage });
  if (result.error) throw httpError(503, 'No se pudieron consultar las cuentas.');
  const users = result.data.users;
  const ids = users.map(user => user.id);
  const profiles = ids.length ? checked(await supabase.from('profiles').select('id,name,role').in('id', ids)) : [];
  const byId = new Map((profiles ?? []).map(profile => [profile.id, profile]));
  res.json({ page, perPage, total: result.data.total ?? users.length, users: users.map(user => ({
    id: user.id,
    email: user.email ?? null,
    name: byId.get(user.id)?.name ?? null,
    role: byId.get(user.id)?.role ?? 'student',
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at ?? null,
    emailConfirmed: !!user.email_confirmed_at,
  })) });
});
