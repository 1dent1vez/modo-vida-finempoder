import { useEffect, useRef, useState } from 'react';
import LessonShell from '../LessonShell';
import ActivityFrame, {
  ActivityLoadError,
  ActivityLoading,
} from '../../../../module-kit/activities/ActivityFrame';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import '../../../../module-kit/activities/classification.css';
import '../../../../module-kit/activities/savings-progress.css';

type Stage = 'evidence' | 'reflect' | 'review' | 'complete';
type Source = {
  meta?: { nombre?: string; monto?: number };
  plan?: { totalPlanado?: number; horizon?: number };
  challenge?: {
    days?: string[];
    dayAmounts?: number[];
    totalAcumulado?: number;
    completedAt?: string;
  };
};
type Draft = { version: 1; stage: Stage; viewed: string[]; difficulty: string; adjustment: string };
const KEY = 'savings_l13:review:v1';
const CARD_IDS = ['goal', 'plan', 'days', 'amount'];
const initial = (): Draft => ({
  version: 1,
  stage: 'evidence',
  viewed: [],
  difficulty: '',
  adjustment: '',
});
function parse(raw: unknown): Draft | null {
  if (!raw || typeof raw !== 'object') return null;
  const v = raw as Draft;
  if (
    v.version !== 1 ||
    !['evidence', 'reflect', 'review', 'complete'].includes(v.stage) ||
    !Array.isArray(v.viewed) ||
    v.viewed.some((id) => !CARD_IDS.includes(id)) ||
    typeof v.difficulty !== 'string' ||
    typeof v.adjustment !== 'string' ||
    (['review', 'complete'].includes(v.stage) &&
      (v.difficulty.trim().length < 3 || v.adjustment.trim().length < 3))
  )
    return null;
  return v;
}
const money = (v: number) => v.toLocaleString('es-MX', { maximumFractionDigits: 0 });

export default function L13() {
  const [source, setSource] = useState<Source>({});
  const [draft, setDraft] = useState<Draft>(initial);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cue, setCue] = useState<string | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    setLoading(true);
    setLoadError(false);
    void Promise.all([
      lessonDataRepository.load('ahorro', 'l5_meta'),
      lessonDataRepository.load('ahorro', 'l6_plan'),
      lessonDataRepository.load('ahorro', 'l11_reto'),
      lessonDataRepository.load('ahorro', KEY),
    ])
      .then(([meta, plan, challenge, saved]) => {
        if (mounted.current) {
          setSource({
            meta: meta as Source['meta'],
            plan: plan as Source['plan'],
            challenge: challenge as Source['challenge'],
          });
          setDraft(parse(saved) ?? initial());
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted.current) {
          setLoading(false);
          setLoadError(true);
        }
      });
    return () => {
      mounted.current = false;
    };
  }, [attempt]);
  const persist = async (next: Draft, final = false) => {
    setBusy(true);
    setError(null);
    try {
      if (final) {
        await lessonDataRepository.saveBatch('ahorro', [
          {
            key: 'l13_dificultad',
            data: {
              dificultad: next.difficulty,
              ajuste: next.adjustment,
              savedAt: new Date().toISOString(),
            },
          },
          { key: KEY, data: next },
        ]);
      } else {
        await lessonDataRepository.save('ahorro', KEY, next);
      }
      if (mounted.current) {
        setDraft(next);
        setDirty(false);
      }
    } catch {
      if (mounted.current) setError('No pudimos guardar. Tu revisión sigue en pantalla.');
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  if (loading)
    return (
      <LessonShell id="L13" title="Seguimiento con Finni" completion={{ ready: false }}>
        <ActivityLoading />
      </LessonShell>
    );
  if (loadError)
    return (
      <LessonShell id="L13" title="Seguimiento con Finni" completion={{ ready: false }}>
        <ActivityLoadError
          message="No pudimos recuperar tus registros."
          onRetry={() => setAttempt((v) => v + 1)}
        />
      </LessonShell>
    );
  const dayCount =
    source.challenge?.days?.length ??
    source.challenge?.dayAmounts?.length ??
    (source.challenge?.completedAt ? 3 : 0);
  const amount =
    source.challenge?.totalAcumulado ??
    (source.challenge?.dayAmounts ?? []).reduce((sum, value) => sum + value, 0);
  const cards = [
    {
      id: 'goal',
      label: 'Meta de referencia',
      value: source.meta?.nombre || 'Sin meta guardada',
      detail: source.meta?.monto
        ? `Monto de referencia: $${money(source.meta.monto)}`
        : 'Puedes crear una meta cuando tengas suficiente información.',
    },
    {
      id: 'plan',
      label: 'Plan disponible',
      value: source.plan ? 'Con datos' : 'Sin datos',
      detail: source.plan?.horizon
        ? `Horizonte registrado: ${source.plan.horizon} meses.`
        : 'No hay un plan previo para comparar.',
    },
    {
      id: 'days',
      label: 'Días registrados',
      value: `${dayCount} día${dayCount === 1 ? '' : 's'}`,
      detail: 'Cuenta registros disponibles; no califica tu constancia.',
    },
    {
      id: 'amount',
      label: 'Monto registrado',
      value: `$${money(amount)}`,
      detail: 'Es evidencia registrada, no una evaluación de tu capacidad.',
    },
  ];
  const reviewing = draft.stage === 'review' || draft.stage === 'complete';
  const view = (id: string) => {
    setDraft((v) => ({ ...v, viewed: v.viewed.includes(id) ? v.viewed : [...v.viewed, id] }));
    setCue(cards.find((card) => card.id === id)?.detail ?? null);
    setDirty(true);
  };
  return (
    <LessonShell
      id="L13"
      title="Finni dice: cómo vas con tu ahorro"
      showGreeting={false}
      completion={{ ready: draft.stage === 'complete', score: 100 }}
    >
      <ActivityFrame
        label="Revisión de evidencia de ahorro"
        className="savings-progress"
        busy={busy}
        title={
          reviewing
            ? 'Elige un ajuste que sí puedas probar.'
            : draft.stage === 'reflect'
              ? 'Convierte la observación en un cambio pequeño.'
              : 'Mira tus registros sin convertirlos en una calificación.'
        }
        description="Finni organiza la evidencia disponible y te ayuda a decidir el siguiente paso."
        progressLabel="Etapas completadas"
        progressValue={draft.stage === 'evidence' ? 0 : draft.stage === 'reflect' ? 1 : 2}
        progressMax={2}
        stepLabel={
          reviewing
            ? 'Paso 3 de 3 · Revisar'
            : draft.stage === 'reflect'
              ? 'Paso 2 de 3 · Ajustar'
              : 'Paso 1 de 3 · Observar'
        }
        focusKey={draft.stage}
        advice={{
          title:
            draft.stage === 'evidence'
              ? 'Los datos describen, no juzgan'
              : 'Haz el ajuste específico',
          text:
            draft.stage === 'evidence'
              ? 'Abre cada tarjeta. Si falta información, eso solo indica qué dato podrías registrar después.'
              : 'Elige un cambio pequeño que puedas probar esta semana y revisar después.',
          tone: 'info',
        }}
        adviceCue={cue}
        error={error}
        status={busy ? 'Guardando…' : dirty ? 'Cambios sin guardar.' : 'Tu avance está guardado.'}
        actions={
          <div className="spg-actions">
            {draft.stage === 'evidence' && (
              <button
                className="ca-primary"
                disabled={draft.viewed.length !== cards.length || busy}
                onClick={() => void persist({ ...draft, stage: 'reflect' })}
              >
                Elegir un ajuste
              </button>
            )}
            {draft.stage === 'reflect' && (
              <button
                className="ca-primary"
                disabled={
                  draft.difficulty.trim().length < 3 || draft.adjustment.trim().length < 3 || busy
                }
                onClick={() => void persist({ ...draft, stage: 'review' })}
              >
                Revisar respuesta
              </button>
            )}
            {draft.stage === 'review' && (
              <>
                <button
                  className="spg-secondary"
                  onClick={() => {
                    setDraft((v) => ({ ...v, stage: 'reflect' }));
                    setDirty(true);
                  }}
                >
                  Editar
                </button>
                <button
                  className="ca-primary"
                  onClick={() => void persist({ ...draft, stage: 'complete' }, true)}
                >
                  Guardar y terminar
                </button>
              </>
            )}
          </div>
        }
      >
        {draft.stage === 'evidence' && (
          <section className="spg-evidence">
            {cards.map((card) => (
              <button
                key={card.id}
                className={draft.viewed.includes(card.id) ? 'is-viewed' : ''}
                onClick={() => view(card.id)}
              >
                <span>{card.label}</span>
                <strong>{card.value}</strong>
                <small>
                  {draft.viewed.includes(card.id) ? card.detail : 'Toca para ver el contexto'}
                </small>
              </button>
            ))}
          </section>
        )}
        {draft.stage === 'reflect' && (
          <section className="spg-reflect">
            <label>
              ¿Qué está dificultando ahorrar esta semana?
              <textarea
                value={draft.difficulty}
                rows={3}
                placeholder="Por ejemplo: olvidé separar el dinero al recibirlo"
                onChange={(e) => {
                  setDraft((v) => ({ ...v, difficulty: e.target.value }));
                  setDirty(true);
                }}
              />
            </label>
            <label>
              ¿Qué ajuste pequeño probarás?
              <textarea
                value={draft.adjustment}
                rows={3}
                placeholder="Por ejemplo: programar un recordatorio el día de pago"
                onChange={(e) => {
                  setDraft((v) => ({ ...v, adjustment: e.target.value }));
                  setDirty(true);
                }}
              />
            </label>
          </section>
        )}
        {reviewing && (
          <section className="spg-review">
            <span>Próximo experimento</span>
            <h3>{draft.adjustment}</h3>
            <p>Dificultad observada: {draft.difficulty}</p>
            <small>Después podrás revisar si este ajuste te ayudó y cambiarlo sin culpa.</small>
          </section>
        )}
      </ActivityFrame>
    </LessonShell>
  );
}
