// FinEmpoder — Pantalla de Ligas (F4-LIGAS).
// Guest ve una invitación a crear cuenta; con sesión, el usuario crea ligas
// (con código de invitación), se une con código y ve el ranking semanal
// (lunes-domingo local). Sin emojis y con voz cercana, como el resto de la app.
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clipboard, Check, ChevronDown, X } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card } from '@/shared/components/ui/card';
import { Spinner } from '@/shared/components/Spinner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/store/auth';
import { useLeagues, type League, type LeagueMetric } from '@/store/leagues';
import { useNotifications } from '@/store/notifications';
import { db } from '@/db/finempoderDb';
import { supabase } from '@/lib/supabase';
import {
  generateInviteCode,
  isValidInviteCode,
  normalizeInviteCode,
  weekStartISO,
} from '@/lib/leagueCode';
import { waMeUrl } from '@/lib/shareAchievement';
import { syncWeeklyProgress } from '@/lib/leagueSync';

export type RankingRow = {
  user_id: string;
  name: string;
  metric_value: number;
  position: number;
};

const METRIC_LABELS: Record<LeagueMetric, string> = {
  lessons: 'Lecciones',
  xp: 'XP',
  streak: 'Racha',
};

const METRIC_OPTIONS: Array<{ value: LeagueMetric; label: string }> = [
  { value: 'lessons', label: 'Lecciones' },
  { value: 'xp', label: 'XP' },
  { value: 'streak', label: 'Racha' },
];

/** Medallas de colores sin emojis: 1º oro (warning), 2º plata (info), 3º bronce (success). */
const MEDAL_CLASS: Record<number, string> = {
  1: 'text-[var(--color-status-warning)]',
  2: 'text-[var(--color-status-info)]',
  3: 'text-[var(--color-status-success)]',
};

function formatPosition(position: number): string {
  return position <= 3 ? `${position}º` : String(position);
}

function formatMetricValue(metric: LeagueMetric, value: number): string {
  switch (metric) {
    case 'lessons':
      return `${value} lecciones`;
    case 'xp':
      return `${value} XP`;
    case 'streak':
      return `${value} días`;
  }
}

/* ------------------- caché Dexie del ranking (offline) ------------------- */

const CACHE_MODULE = 'ligas';
const rankingCacheKey = (leagueId: string, weekStart: string) => `league-ranking:${leagueId}:${weekStart}`;

async function readCachedRanking(
  userId: string,
  leagueId: string,
  weekStart: string
): Promise<RankingRow[] | null> {
  const row = await db.userLessonData
    .where({ userId, moduleId: CACHE_MODULE, key: rankingCacheKey(leagueId, weekStart) })
    .first();
  return row ? (row.data as RankingRow[]) : null;
}

async function writeCachedRanking(
  userId: string,
  leagueId: string,
  weekStart: string,
  rows: RankingRow[]
): Promise<void> {
  const now = new Date().toISOString();
  const existing = await db.userLessonData
    .where({ userId, moduleId: CACHE_MODULE, key: rankingCacheKey(leagueId, weekStart) })
    .first();
  if (existing) {
    await db.userLessonData.update(existing.id!, { data: rows, updatedAt: now });
  } else {
    await db.userLessonData.add({
      userId,
      moduleId: CACHE_MODULE,
      key: rankingCacheKey(leagueId, weekStart),
      data: rows,
      updatedAt: now,
    });
  }
}

/* ------------------- utilidades de portapapeles ------------------- */

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // cae al fallback
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  } catch {
    return false;
  }
}

function CopyCodeButton({
  code,
  label,
  text,
}: {
  code: string;
  label: string;
  /** Texto del botón; si no se pasa, se muestra el código (tarjeta de liga). */
  text?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={label}
      onClick={async () => {
        await copyText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-sm font-semibold transition-colors',
        copied
          ? 'border-[var(--color-brand-success)] text-[var(--color-brand-success)]'
          : 'border-[var(--color-neutral-200)] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]'
      )}
    >
      {copied ? <Check size={14} /> : <Clipboard size={14} />}
      {copied ? 'Copiado' : (text ?? code)}
    </button>
  );
}

/* ------------------- tarjeta de liga ------------------- */

function LeagueCard({
  league,
  userId,
  expanded,
  onToggle,
  rows,
  loading,
}: {
  league: League;
  userId: string;
  expanded: boolean;
  onToggle: () => void;
  rows: RankingRow[];
  loading: boolean;
}) {
  const myRow = rows.find((r) => r.user_id === userId);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 p-4">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="min-w-0 flex-1 text-left"
        >
          <h3 className="truncate text-base font-bold">{league.name}</h3>
          <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
            Reto de la semana: {METRIC_LABELS[league.metric]}
          </p>
          <span className="mt-1.5 inline-block text-xs text-[var(--color-text-muted)]">
            Tu posición: {myRow ? formatPosition(myRow.position) : 'Sin datos esta semana'}
          </span>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          <CopyCodeButton code={league.invite_code} label={`Copiar código ${league.invite_code}`} />
          <button
            type="button"
            onClick={onToggle}
            aria-label={expanded ? 'Ocultar ranking' : 'Ver ranking'}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--color-neutral-100)]"
          >
            <ChevronDown
              size={18}
              className={cn(
                'text-[var(--color-neutral-400)] transition-transform',
                expanded && 'rotate-180'
              )}
            />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[var(--color-neutral-100)] px-4 py-3">
          {loading && rows.length === 0 ? (
            <div className="flex justify-center py-6">
              <Spinner size="md" />
            </div>
          ) : rows.length === 0 ? (
            <p className="py-4 text-center text-sm text-[var(--color-text-muted)]">
              Aún no hay puntajes esta semana
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-[var(--color-text-muted)]">
                  <th className="py-1.5 pr-2 font-medium">Posición</th>
                  <th className="py-1.5 pr-2 font-medium">Participante</th>
                  <th className="py-1.5 text-right font-medium">Semana</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const isMe = row.user_id === userId;
                  const medal = row.position >= 1 && row.position <= 3;
                  return (
                    <tr
                      key={row.user_id}
                      data-testid={`ranking-row-${row.user_id}`}
                      className={cn(
                        isMe && 'bg-[var(--color-brand-secondary)] font-bold text-[var(--color-brand-text-on-secondary)]'
                      )}
                    >
                      <td className={cn('py-2 pr-2', medal && 'font-extrabold', medal && MEDAL_CLASS[row.position])}>
                        {formatPosition(row.position)}
                      </td>
                      <td className="py-2 pr-2">{row.name?.trim() || 'Usuario'}</td>
                      <td className="py-2 text-right">
                        {formatMetricValue(league.metric, row.metric_value)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </Card>
  );
}

/* ------------------- pantalla ------------------- */

export default function LigasPage() {
  const token = useAuth((s) => s.token);
  const userId = useAuth((s) => s.user?.id);
  const { leagues, loading, loaded, error, load, refresh } = useLeagues();
  const enqueue = useNotifications((s) => s.enqueue);
  const navigate = useNavigate();

  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [created, setCreated] = useState<League | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rankings, setRankings] = useState<Record<string, RankingRow[]>>({});
  const [rankingLoading, setRankingLoading] = useState<Record<string, boolean>>({});

  const guest = !token || !userId || userId === 'local';

  const fetchRanking = useCallback(
    async (uid: string, leagueId: string, weekStart: string) => {
      setRankingLoading((s) => ({ ...s, [leagueId]: true }));
      try {
        const { data, error } = await supabase.rpc('get_league_ranking', {
          p_league_id: leagueId,
          p_week_start: weekStart,
        });
        if (error) throw error;
        const rows = (data ?? []) as RankingRow[];
        setRankings((s) => ({ ...s, [leagueId]: rows }));
        await writeCachedRanking(uid, leagueId, weekStart, rows);
      } catch {
        // Red caída: mostramos la caché Dexie si existe; sin bloquear la UI.
        const cached = await readCachedRanking(uid, leagueId, weekStart);
        if (cached) setRankings((s) => ({ ...s, [leagueId]: cached }));
      } finally {
        setRankingLoading((s) => ({ ...s, [leagueId]: false }));
      }
    },
    []
  );

  const syncAll = useCallback(
    async (uid: string) => {
      const current = useLeagues.getState().leagues;
      await syncWeeklyProgress(uid, current);
      const weekStart = weekStartISO(new Date());
      await Promise.all(current.map((league) => fetchRanking(uid, league.id, weekStart)));
    },
    [fetchRanking]
  );

  // Al abrir la pestaña: cargar ligas, sincronizar la semana y refrescar rankings.
  useEffect(() => {
    if (guest) return;
    let cancelled = false;
    (async () => {
      await load(userId);
      if (cancelled) return;
      await syncAll(userId);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, userId, load]);

  // guest ya retornó arriba; aquí userId siempre existe.
  const uid: string = userId ?? '';

  const handleCreate = async (name: string, metric: LeagueMetric) => {
    const trimmed = name.trim();
    const code = generateInviteCode();
    const { error: insertError } = await supabase.from('leagues').insert({
      name: trimmed,
      invite_code: code,
      owner_id: uid,
      metric,
    });
    if (insertError) throw insertError;
    // El dueño se inscribe vía join_league (inserta su league_members) para
    // que las políticas RLS le permitan leer su propia liga.
    const { data: leagueId, error: joinError } = await supabase.rpc('join_league', {
      p_invite_code: code,
    });
    if (joinError || !leagueId) throw joinError ?? new Error('sin league_id');
    const { data: league, error: fetchError } = await supabase
      .from('leagues')
      .select('*')
      .eq('id', leagueId)
      .single();
    if (fetchError || !league) throw fetchError ?? new Error('sin liga');
    setCreated(league);
    setCreateOpen(false);
    enqueue('Liga creada', 'success');
    await refresh();
    await syncWeeklyProgress(uid, [league]);
    await fetchRanking(uid, league.id, weekStartISO(new Date()));
  };

  const handleJoin = async (rawCode: string) => {
    const code = normalizeInviteCode(rawCode);
    if (!isValidInviteCode(code)) return 'Ese código no es válido';
    const { data: leagueId, error } = await supabase.rpc('join_league', { p_invite_code: code });
    if (error || !leagueId) return 'Ese código no es válido';
    setJoinOpen(false);
    enqueue('Te uniste a la liga', 'success');
    await refresh();
    const joined = useLeagues.getState().leagues.find((l) => l.id === leagueId);
    if (joined) {
      setExpandedId(joined.id);
      await syncWeeklyProgress(uid, [joined]);
      await fetchRanking(uid, joined.id, weekStartISO(new Date()));
    }
    return null;
  };

  /* ---------- guest ---------- */
  if (guest) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-app)]">
        <PageHeader title="Ligas" subtitle="Retos semanales con tu comunidad" />
        <div className="p-4">
          <Card className="p-8 text-center">
            <Users className="mx-auto h-10 w-10 text-[var(--color-neutral-300)]" />
            <h2 className="mt-4 text-lg font-bold">Las ligas necesitan cuenta</h2>
            <p className="mx-auto mt-1 max-w-xs text-sm leading-relaxed text-[var(--color-text-secondary)]">
              Las ligas guardan tu avance en la nube para competir con tu comunidad.
              Entra con tu correo y crea la tuya o únete con un código.
            </p>
            <Button className="mt-6" onClick={() => navigate('/auth')}>
              Entrar con tu correo
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  /* ---------- carga inicial ---------- */
  if (loading && !loaded && leagues.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-app)]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-app)] pb-24">
      <PageHeader title="Ligas" subtitle="Retos semanales con tu comunidad" />

      <div className="p-4 space-y-4">
        {error && (
          <p className="rounded-lg bg-[var(--color-status-warningBg)] px-3 py-2 text-xs text-[var(--color-status-warning)]">
            {error}
          </p>
        )}

        {leagues.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-brand-secondary)]">
              <Users className="h-8 w-8 text-[var(--color-neutral-400)]" />
            </div>
            <h2 className="mt-4 text-lg font-bold">Aún no estás en una liga</h2>
            <p className="mt-1 max-w-xs text-sm text-[var(--color-text-secondary)]">
              Crea una liga con tu comunidad o únete con el código que te compartan.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button onClick={() => setCreateOpen(true)}>Crear liga</Button>
              <Button variant="secondary" onClick={() => setJoinOpen(true)}>
                Unirme con código
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-3">
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                Crear liga
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setJoinOpen(true)}>
                Unirme con código
              </Button>
            </div>

            {leagues.map((league) => (
              <LeagueCard
                key={league.id}
                league={league}
                userId={userId}
                expanded={expandedId === league.id}
                onToggle={() => setExpandedId((prev) => (prev === league.id ? null : league.id))}
                rows={rankings[league.id] ?? []}
                loading={rankingLoading[league.id] ?? false}
              />
            ))}
          </>
        )}
      </div>

      {/* Modal: crear liga */}
      {createOpen && (
        <CreateLeagueModal
          onSubmit={async (name, metric) => {
            try {
              await handleCreate(name, metric);
            } catch {
              enqueue('No pudimos crear tu liga. Intenta de nuevo.', 'error');
            }
          }}
          onClose={() => setCreateOpen(false)}
        />
      )}

      {/* Modal: unirme con código */}
      {joinOpen && (
        <JoinLeagueModal
          onSubmit={async (rawCode) => {
            try {
              const errorMsg = await handleJoin(rawCode);
              return errorMsg;
            } catch {
              return 'No pudimos validar el código. Revisa tu conexión.';
            }
          }}
          onClose={() => setJoinOpen(false)}
        />
      )}

      {/* Éxito: liga creada con su código */}
      {created && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="Liga creada"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-[var(--shadow-lg)]">
            <h2 className="text-lg font-extrabold">Liga creada</h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              {created.name} está lista. Comparte el código con tu comunidad.
            </p>
            <p className="mt-6 font-mono text-4xl font-extrabold tracking-widest text-[var(--color-brand-primary)]">
              {created.invite_code}
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <CopyCodeButton code={created.invite_code} label="Copiar código" text="Copiar código" />
              <Button
                variant="secondary"
                onClick={() => window.open(waMeUrl(`Únete a mi liga en FinEMPODER con el código ${created.invite_code}`), '_blank')}
              >
                Compartir código
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setCreated(null);
                  setExpandedId(created.id);
                }}
              >
                Ver liga
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------- modales ------------------- */

function CreateLeagueModal({
  onSubmit,
  onClose,
}: {
  onSubmit: (name: string, metric: LeagueMetric) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [metric, setMetric] = useState<LeagueMetric>('lessons');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 3 || trimmed.length > 40) {
      setError('El nombre debe tener entre 3 y 40 caracteres');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSubmit(trimmed, metric);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Crear liga"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-[var(--shadow-lg)]">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-extrabold">Crear liga</h2>
            <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
              Elige el reto semanal y comparte el código.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--color-neutral-100)]"
          >
            <X size={18} />
          </button>
        </div>

        <Input
          label="Nombre de la liga"
          value={name}
          maxLength={40}
          placeholder="Ej. Ahorro con la banda"
          onChange={(e) => setName(e.target.value)}
          error={error ?? undefined}
        />

        <div className="mt-4">
          <span className="block text-sm font-medium text-[var(--color-text-primary)]">Reto semanal</span>
          <div className="mt-2 flex gap-2">
            {METRIC_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMetric(opt.value)}
                aria-pressed={metric === opt.value}
                className={cn(
                  'flex-1 rounded-xl border-2 px-2 py-2 text-sm font-semibold transition-colors',
                  metric === opt.value
                    ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-info-bg)] text-[var(--color-brand-primary)]'
                    : 'border-[var(--color-neutral-200)] text-[var(--color-text-secondary)]'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <Button className="mt-5 w-full min-h-11" onClick={submit} disabled={busy}>
          {busy ? 'Creando...' : 'Crear'}
        </Button>
      </div>
    </div>
  );
}

function JoinLeagueModal({
  onSubmit,
  onClose,
}: {
  onSubmit: (rawCode: string) => Promise<string | null>;
  onClose: () => void;
}) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (code.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const errorMsg = await onSubmit(code);
      if (errorMsg) setError(errorMsg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Unirme con código"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-[var(--shadow-lg)]">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-extrabold">Unirme con código</h2>
            <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
              Pide el código a quien organiza la liga.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--color-neutral-100)]"
          >
            <X size={18} />
          </button>
        </div>

        <Input
          label="Código"
          value={code}
          maxLength={6}
          placeholder="ABC234"
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          error={error ?? undefined}
        />

        <Button className="mt-5 w-full min-h-11" onClick={submit} disabled={busy}>
          {busy ? 'Buscando...' : 'Unirme'}
        </Button>
      </div>
    </div>
  );
}
