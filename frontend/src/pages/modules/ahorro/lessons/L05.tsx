import { useEffect, useMemo, useRef, useState } from 'react';
import LessonShell from '../LessonShell';
import ActivityFrame, {
  ActivityLoadError,
  ActivityLoading,
} from '../../../../module-kit/activities/ActivityFrame';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import '../../../../module-kit/activities/classification.css';
import '../../../../module-kit/activities/savings-plan.css';

type Stage = 'purpose' | 'define' | 'review' | 'complete';
type Draft = { version: 1; stage: Stage; name: string; amount: string; contribution: string };
type PreviousGoal = { queQuieres?: string; monto?: number; aportacionMensual?: number } | null;
const KEY = 'savings_l5:goal:v1';
const IDEAS = [
  'Fondo para imprevistos',
  'Herramienta de trabajo',
  'Curso o certificación',
  'Viaje o experiencia',
];
const initial = (): Draft => ({
  version: 1,
  stage: 'purpose',
  name: '',
  amount: '',
  contribution: '',
});
function parse(raw: unknown): Draft | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as Draft;
  if (
    value.version !== 1 ||
    !['purpose', 'define', 'review', 'complete'].includes(value.stage) ||
    typeof value.name !== 'string' ||
    typeof value.amount !== 'string' ||
    typeof value.contribution !== 'string' ||
    (['review', 'complete'].includes(value.stage) &&
      (value.name.trim().length < 3 ||
        !(Number(value.amount) > 0) ||
        !(Number(value.contribution) > 0)))
  )
    return null;
  return value;
}

export default function L05() {
  const [draft, setDraft] = useState<Draft>(initial);
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
      lessonDataRepository.load<PreviousGoal>('presupuesto', 'l9_smart_goal'),
    ])
      .then(([saved, previous]) => {
        if (!mounted.current) return;
        const restored = parse(saved);
        setDraft(
          restored ?? {
            ...initial(),
            name: previous?.queQuieres ?? '',
            amount: previous?.monto ? String(previous.monto) : '',
            contribution: previous?.aportacionMensual ? String(previous.aportacionMensual) : '',
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
  const amount = Number(draft.amount) || 0;
  const contribution = Number(draft.contribution) || 0;
  const months = useMemo(
    () => (amount > 0 && contribution > 0 ? Math.ceil(amount / contribution) : 0),
    [amount, contribution],
  );
  const valid = draft.name.trim().length >= 3 && amount > 0 && contribution > 0;
  const persist = async (next: Draft, final = false) => {
    setBusy(true);
    setError(null);
    try {
      if (final) {
        await lessonDataRepository.saveBatch('ahorro', [
          {
            key: 'l5_meta',
            data: {
              nombre: next.name.trim(),
              monto: Number(next.amount),
              aportacionMensual: Number(next.contribution),
              mesesEstimados: Math.ceil(Number(next.amount) / Number(next.contribution)),
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
      if (mounted.current) setError('No pudimos guardar. Tu meta sigue en pantalla.');
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  if (loading)
    return (
      <LessonShell id="L05" title="Define tu meta" completion={{ ready: false }}>
        <ActivityLoading />
      </LessonShell>
    );
  if (loadError)
    return (
      <LessonShell id="L05" title="Define tu meta" completion={{ ready: false }}>
        <ActivityLoadError
          message="No pudimos recuperar tus datos."
          onRetry={() => setAttempt((value) => value + 1)}
        />
      </LessonShell>
    );
  const reviewing = draft.stage === 'review' || draft.stage === 'complete';
  return (
    <LessonShell
      id="L05"
      title="Ponle nombre a tu ahorro: define tu meta"
      showGreeting={false}
      completion={{ ready: draft.stage === 'complete', score: 100 }}
    >
      <ActivityFrame
        label="Constructor de meta de ahorro"
        className="savings-plan"
        busy={busy}
        title={
          reviewing
            ? 'Revisa una meta que puedas ajustar.'
            : draft.stage === 'define'
              ? 'Convierte el propósito en números.'
              : 'Dale un propósito concreto a tu ahorro.'
        }
        description="Define qué quieres lograr, cuánto requiere y qué aportación puedes probar."
        progressLabel="Etapas completadas"
        progressValue={draft.stage === 'purpose' ? 0 : draft.stage === 'define' ? 1 : 2}
        progressMax={2}
        stepLabel={
          reviewing
            ? 'Paso 3 de 3 · Revisar'
            : draft.stage === 'define'
              ? 'Paso 2 de 3 · Definir'
              : 'Paso 1 de 3 · Elegir propósito'
        }
        focusKey={draft.stage}
        advice={{
          title: 'Una meta es una referencia, no una deuda',
          text: 'Si la aportación no cabe en un mes, puedes reducirla o extender el plazo sin abandonar el propósito.',
          tone: 'info',
        }}
        adviceCue={null}
        error={error}
        status={busy ? 'Guardando…' : dirty ? 'Cambios sin guardar.' : 'Tu avance está guardado.'}
        actions={
          <div className="sp-actions">
            {draft.stage === 'purpose' && (
              <button
                className="ca-primary"
                disabled={draft.name.trim().length < 3}
                onClick={() => void persist({ ...draft, stage: 'define' })}
              >
                Definir monto y ritmo
              </button>
            )}
            {draft.stage === 'define' && (
              <button
                className="ca-primary"
                disabled={!valid || busy}
                onClick={() => void persist({ ...draft, stage: 'review' })}
              >
                Revisar mi meta
              </button>
            )}
            {draft.stage === 'review' && (
              <>
                <button
                  className="sp-secondary"
                  onClick={() => {
                    setDraft((value) => ({ ...value, stage: 'define' }));
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
        {draft.stage === 'purpose' && (
          <section className="sp-purpose">
            <label htmlFor="goal-name">Mi meta es</label>
            <input
              id="goal-name"
              value={draft.name}
              maxLength={80}
              placeholder="Ej. Fondo para imprevistos"
              onChange={(event) => {
                setDraft((value) => ({ ...value, name: event.target.value }));
                setDirty(true);
              }}
            />
            <div className="sp-ideas" aria-label="Ideas de metas">
              {IDEAS.map((idea) => (
                <button
                  key={idea}
                  type="button"
                  onClick={() => {
                    setDraft((value) => ({ ...value, name: idea }));
                    setDirty(true);
                  }}
                >
                  {idea}
                </button>
              ))}
            </div>
          </section>
        )}
        {draft.stage === 'define' && (
          <section className="sp-form">
            <label>
              ¿Cuánto requiere tu meta?
              <span className="sp-money">
                <b>$</b>
                <input
                  aria-label="Monto de la meta"
                  type="number"
                  min="1"
                  value={draft.amount}
                  onChange={(event) => {
                    setDraft((value) => ({ ...value, amount: event.target.value }));
                    setDirty(true);
                  }}
                />
              </span>
            </label>
            <label>
              ¿Cuánto puedes probar por mes?
              <span className="sp-money">
                <b>$</b>
                <input
                  aria-label="Aportación mensual"
                  type="number"
                  min="1"
                  value={draft.contribution}
                  onChange={(event) => {
                    setDraft((value) => ({ ...value, contribution: event.target.value }));
                    setDirty(true);
                  }}
                />
              </span>
            </label>
            {months > 0 && (
              <div className="sp-result">
                <span>Tiempo estimado con aportaciones constantes</span>
                <strong>
                  {months} {months === 1 ? 'mes' : 'meses'}
                </strong>
                <small>Estimación simple; no incluye rendimientos ni pausas.</small>
              </div>
            )}
          </section>
        )}
        {reviewing && (
          <section className="sp-review">
            <span>Tu meta</span>
            <h3>{draft.name}</h3>
            <strong>${amount.toLocaleString()}</strong>
            <p>
              ${contribution.toLocaleString()} al mes · aproximadamente {months}{' '}
              {months === 1 ? 'mes' : 'meses'}.
            </p>
          </section>
        )}
      </ActivityFrame>
    </LessonShell>
  );
}
