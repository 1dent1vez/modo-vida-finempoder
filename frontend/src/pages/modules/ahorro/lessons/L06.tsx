import { useEffect, useMemo, useRef, useState } from 'react';
import LessonShell from '../LessonShell';
import ActivityFrame, {
  ActivityLoadError,
  ActivityLoading,
} from '../../../../module-kit/activities/ActivityFrame';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import '../../../../module-kit/activities/classification.css';
import '../../../../module-kit/activities/savings-plan.css';

type Horizon = 1 | 3 | 6;
type Stage = 'compare' | 'build' | 'review' | 'complete';
type Draft = {
  version: 1;
  stage: Stage;
  horizon: Horizon | null;
  monthly: string;
  fallback: 'reduce' | 'extend' | 'pause' | null;
};
type Meta = { nombre?: string; monto?: number; aportacionMensual?: number } | null;
const KEY = 'savings_l6:plan:v1';
const HORIZONS: { id: Horizon; label: string; help: string }[] = [
  { id: 1, label: '1 mes', help: 'Para probar una regla breve.' },
  { id: 3, label: '3 meses', help: 'Para observar y ajustar el ritmo.' },
  { id: 6, label: '6 meses', help: 'Para sostener una meta más larga.' },
];
const FALLBACKS = [
  { id: 'reduce' as const, label: 'Reducir la aportación ese periodo' },
  { id: 'extend' as const, label: 'Extender el plazo de la meta' },
  { id: 'pause' as const, label: 'Pausar y retomar en la siguiente fecha' },
];
const initial = (): Draft => ({
  version: 1,
  stage: 'compare',
  horizon: null,
  monthly: '',
  fallback: null,
});
function parse(raw: unknown): Draft | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as Draft;
  if (
    value.version !== 1 ||
    !['compare', 'build', 'review', 'complete'].includes(value.stage) ||
    (value.horizon !== null && ![1, 3, 6].includes(value.horizon)) ||
    typeof value.monthly !== 'string' ||
    (value.fallback !== null && !['reduce', 'extend', 'pause'].includes(value.fallback)) ||
    (['review', 'complete'].includes(value.stage) &&
      (!value.horizon || !value.fallback || !(Number(value.monthly) > 0)))
  )
    return null;
  return value;
}

export default function L06() {
  const [draft, setDraft] = useState<Draft>(initial);
  const [meta, setMeta] = useState<Meta>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    setLoading(true);
    setLoadError(false);
    void Promise.all([
      lessonDataRepository.load('ahorro', KEY),
      lessonDataRepository.load<Meta>('ahorro', 'l5_meta'),
    ])
      .then(([saved, goal]) => {
        if (!mounted.current) return;
        setMeta(goal);
        const restored = parse(saved);
        setDraft(
          restored ?? {
            ...initial(),
            monthly: goal?.aportacionMensual ? String(goal.aportacionMensual) : '',
          },
        );
        setLoading(false);
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
  const monthly = Number(draft.monthly) || 0;
  const months = draft.horizon ?? 0;
  const total = useMemo(() => monthly * months, [monthly, months]);
  const valid = !!draft.horizon && monthly > 0 && !!draft.fallback;
  const persist = async (next: Draft, final = false) => {
    setBusy(true);
    setError(null);
    try {
      if (final) {
        await lessonDataRepository.saveBatch('ahorro', [
          {
            key: 'l6_plan',
            data: {
              horizon: next.horizon,
              numWeeks: next.horizon ? next.horizon * 4 : 0,
              aportacionMensual: Number(next.monthly),
              totalPlanado: Number(next.monthly) * (next.horizon ?? 0),
              fallback: next.fallback,
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
      if (mounted.current) setError('No pudimos guardar. Tu plan sigue en pantalla.');
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  if (loading)
    return (
      <LessonShell id="L06" title="Tu plan de ahorro" completion={{ ready: false }}>
        <ActivityLoading />
      </LessonShell>
    );
  if (loadError)
    return (
      <LessonShell id="L06" title="Tu plan de ahorro" completion={{ ready: false }}>
        <ActivityLoadError
          message="No pudimos recuperar tu meta."
          onRetry={() => setAttempt((value) => value + 1)}
        />
      </LessonShell>
    );
  const reviewing = draft.stage === 'review' || draft.stage === 'complete';
  return (
    <LessonShell
      id="L06"
      title="Tu plan de ahorro: 1, 3 o 6 meses"
      showGreeting={false}
      completion={{ ready: draft.stage === 'complete', score: 100 }}
    >
      <ActivityFrame
        label="Constructor de plan de ahorro"
        className="savings-plan"
        busy={busy}
        title={
          reviewing
            ? 'Revisa un plan con margen de ajuste.'
            : draft.stage === 'build'
              ? 'Define ritmo y plan alterno.'
              : 'Elige un horizonte para probar.'
        }
        description="Construye una regla mensual sin llenar un calendario completo."
        progressLabel="Etapas completadas"
        progressValue={draft.stage === 'compare' ? 0 : draft.stage === 'build' ? 1 : 2}
        progressMax={2}
        stepLabel={
          reviewing
            ? 'Paso 3 de 3 · Revisar'
            : draft.stage === 'build'
              ? 'Paso 2 de 3 · Construir'
              : 'Paso 1 de 3 · Comparar'
        }
        focusKey={draft.stage}
        advice={{
          title: 'Un plan sostenible incluye cambios',
          text: 'Definir qué harás en un mes difícil evita convertir una pausa en abandono.',
          tone: 'info',
        }}
        adviceCue={null}
        error={error}
        status={busy ? 'Guardando…' : dirty ? 'Cambios sin guardar.' : 'Tu avance está guardado.'}
        actions={
          <div className="sp-actions">
            {draft.stage === 'compare' && (
              <button
                className="ca-primary"
                disabled={!draft.horizon}
                onClick={() => void persist({ ...draft, stage: 'build' })}
              >
                Construir este plan
              </button>
            )}
            {draft.stage === 'build' && (
              <button
                className="ca-primary"
                disabled={!valid || busy}
                onClick={() => void persist({ ...draft, stage: 'review' })}
              >
                Revisar mi plan
              </button>
            )}
            {draft.stage === 'review' && (
              <>
                <button
                  className="sp-secondary"
                  onClick={() => {
                    setDraft((value) => ({ ...value, stage: 'build' }));
                    setDirty(true);
                  }}
                >
                  Ajustar
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
        {draft.stage === 'compare' && (
          <section className="sp-horizons">
            {meta?.nombre && (
              <p>
                Meta actual: <strong>{meta.nombre}</strong>
                {meta.monto ? ` · $${meta.monto.toLocaleString()}` : ''}
              </p>
            )}
            {HORIZONS.map((item) => (
              <button
                key={item.id}
                className={draft.horizon === item.id ? 'is-selected' : ''}
                aria-pressed={draft.horizon === item.id}
                onClick={() => {
                  setDraft((value) => ({ ...value, horizon: item.id }));
                  setDirty(true);
                }}
              >
                <strong>{item.label}</strong>
                <span>{item.help}</span>
              </button>
            ))}
          </section>
        )}
        {draft.stage === 'build' && (
          <section className="sp-form">
            <label>
              Aportación mensual que probaré
              <span className="sp-money">
                <b>$</b>
                <input
                  aria-label="Aportación mensual del plan"
                  type="number"
                  min="1"
                  value={draft.monthly}
                  onChange={(event) => {
                    setDraft((value) => ({ ...value, monthly: event.target.value }));
                    setDirty(true);
                  }}
                />
              </span>
            </label>
            {monthly > 0 && (
              <div className="sp-result">
                <span>
                  Total planeado en {months} {months === 1 ? 'mes' : 'meses'}
                </span>
                <strong>${total.toLocaleString()}</strong>
                {meta?.monto && (
                  <small>
                    {Math.min(100, (total / meta.monto) * 100).toFixed(0)}% de la meta actual
                  </small>
                )}
              </div>
            )}
            <fieldset>
              <legend>Si un mes no cabe, voy a:</legend>
              {FALLBACKS.map((item) => (
                <label key={item.id}>
                  <input
                    type="radio"
                    name="fallback"
                    checked={draft.fallback === item.id}
                    onChange={() => {
                      setDraft((value) => ({ ...value, fallback: item.id }));
                      setDirty(true);
                    }}
                  />
                  {item.label}
                </label>
              ))}
            </fieldset>
          </section>
        )}
        {reviewing && (
          <section className="sp-review">
            <span>Tu primer ciclo</span>
            <h3>
              {draft.horizon} {draft.horizon === 1 ? 'mes' : 'meses'}
            </h3>
            <strong>${monthly.toLocaleString()} al mes</strong>
            <p>
              Total planeado: ${total.toLocaleString()}. Si cambia tu capacidad:{' '}
              {FALLBACKS.find((item) => item.id === draft.fallback)?.label.toLowerCase()}.
            </p>
          </section>
        )}
      </ActivityFrame>
    </LessonShell>
  );
}
