import { useEffect, useRef, useState } from 'react';
import LessonShell from '../LessonShell';
import ActivityFrame, {
  ActivityLoadError,
  ActivityLoading,
} from '../../../../module-kit/activities/ActivityFrame';
import {
  initialSmartGoal,
  monthlyContribution,
  parseSmartGoal,
  validSmartGoal,
  type SmartGoalDraft,
} from '../../../../module-kit/activities/smartGoalModel';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import { useAuth } from '../../../../store/auth';
import '../../../../module-kit/activities/classification.css';
import '../../../../module-kit/activities/smart-goal.css';
const KEY = 'l9_smart_goal:v1';
const EXAMPLE: SmartGoalDraft = {
  version: 1,
  stage: 'build',
  goal: 'Crear un fondo para reparar mi bicicleta',
  amount: 3600,
  months: 6,
  reason: 'Quiero mantener mi transporte funcionando',
  feasibility: 'fits',
  example: true,
};
const money = (value: number) =>
  value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
export default function L09() {
  const userId = useAuth((state) => state.user?.id ?? 'local');
  return <GoalSession key={userId} />;
}
function GoalSession() {
  const [draft, setDraft] = useState<SmartGoalDraft>(initialSmartGoal);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cue, setCue] = useState<string | null>(null);
  const mounted = useRef(true);
  const lock = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(false);
    void lessonDataRepository
      .load('presupuesto', KEY)
      .then((raw) => {
        if (!active) return;
        setDraft(parseSmartGoal(raw) ?? initialSmartGoal());
        setLoading(false);
      })
      .catch(() => {
        if (active) {
          setLoadError(true);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [retry]);
  const contribution = monthlyContribution(draft);
  const valid = validSmartGoal(draft);
  const reviewing = draft.stage !== 'build';
  const change = (patch: Partial<SmartGoalDraft>) => {
    setDraft((current) => ({ ...current, ...patch, example: patch.example ?? false }));
    setDirty(true);
    setCue(null);
  };
  const persist = async (stage: SmartGoalDraft['stage']) => {
    if (lock.current || !valid) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    const next = { ...draft, stage };
    const metaText = `Quiero ${draft.goal} reuniendo ${money(draft.amount)} en ${draft.months} meses, con ${money(contribution)} al mes. Porque: ${draft.reason}.`;
    try {
      if (stage === 'complete') {
        await lessonDataRepository.saveBatch('presupuesto', [
          {
            key: 'l9_smart_goal',
            data: {
              queQuieres: draft.goal,
              monto: draft.amount,
              porQue: draft.reason,
              plazoMeses: draft.months,
              aporteMensual: contribution,
              metaText,
              feasibility: draft.feasibility,
              example: draft.example,
            },
          },
          { key: KEY, data: next },
        ]);
      } else {
        await lessonDataRepository.save('presupuesto', KEY, next);
      }
      if (mounted.current) {
        setDraft(next);
        setDirty(false);
        setCue(stage);
      }
    } catch {
      if (mounted.current) setError('No pudimos guardar la meta. Tus cambios siguen en pantalla.');
    } finally {
      lock.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  const advice =
    draft.feasibility === 'adjust'
      ? {
          title: 'Ajustar también es planear',
          text: 'Aumenta el plazo o reduce el monto hasta que el aporte mensual tenga sentido para ti.',
          tone: 'review' as const,
        }
      : {
          title: 'Tú defines qué es alcanzable',
          text: 'La app calcula el aporte. La viabilidad depende de tu presupuesto y puede cambiar con el tiempo.',
          tone: valid ? ('success' as const) : ('info' as const),
        };
  return (
    <LessonShell
      id="L09"
      title="Construye una meta SMART"
      showGreeting={false}
      completion={{ ready: draft.stage === 'complete', score: 100 }}
    >
      {loading ? (
        <ActivityLoading message="Recuperando tu meta…" />
      ) : loadError ? (
        <ActivityLoadError
          message="No pudimos recuperar tu meta."
          onRetry={() => setRetry((value) => value + 1)}
        />
      ) : (
        <ActivityFrame
          label="Constructor de meta SMART"
          className="smart-goal"
          busy={busy}
          title={
            reviewing ? 'Revisa tu meta antes de guardarla.' : 'Convierte una intención en un plan.'
          }
          description="Puedes crear una meta propia o practicar con un ejemplo ficticio."
          progressLabel="Etapas completadas"
          progressValue={reviewing ? 1 : 0}
          progressMax={1}
          stepLabel={reviewing ? 'Paso 2 de 2 · Revisar' : 'Paso 1 de 2 · Construir'}
          focusKey={draft.stage}
          advice={advice}
          adviceCue={cue}
          error={error}
          status={
            busy
              ? 'Guardando…'
              : dirty
                ? 'Cambios sin guardar.'
                : draft.stage === 'complete'
                  ? 'Meta guardada.'
                  : 'Tu último borrador está guardado en este dispositivo.'
          }
          actions={
            <div className="sg-actions">
              {draft.stage === 'build' && (
                <>
                  <button
                    className="sg-secondary"
                    onClick={() => {
                      setDraft(EXAMPLE);
                      setDirty(true);
                    }}
                  >
                    Usar ejemplo
                  </button>
                  <button
                    className="sg-secondary"
                    disabled={busy || !valid}
                    onClick={() => void persist('build')}
                  >
                    Guardar borrador
                  </button>
                  <button
                    className="ca-primary"
                    disabled={busy || !valid}
                    onClick={() => void persist('review')}
                  >
                    Guardar y revisar
                  </button>
                </>
              )}
              {draft.stage === 'review' && (
                <>
                  <button className="sg-secondary" onClick={() => change({ stage: 'build' })}>
                    Ajustar meta
                  </button>
                  <button
                    className="ca-primary"
                    disabled={busy}
                    onClick={() => void persist('complete')}
                  >
                    Guardar y terminar
                  </button>
                </>
              )}
            </div>
          }
        >
          {!reviewing && (
            <div className="sg-form">
              <label>
                ¿Qué quieres lograr?
                <input
                  value={draft.goal}
                  onChange={(event) => change({ goal: event.target.value })}
                />
              </label>
              <div className="sg-pair">
                <label>
                  Monto objetivo (MXN)
                  <input
                    type="number"
                    min="1"
                    value={draft.amount || ''}
                    onChange={(event) => change({ amount: Number(event.target.value) })}
                  />
                </label>
                <label>
                  Plazo en meses
                  <input
                    type="number"
                    min="1"
                    max="36"
                    value={draft.months}
                    onChange={(event) => change({ months: Number(event.target.value) })}
                  />
                </label>
              </div>
              <label>
                ¿Por qué es importante?
                <textarea
                  rows={3}
                  value={draft.reason}
                  onChange={(event) => change({ reason: event.target.value })}
                />
              </label>
              <div>
                <p>¿El aporte mensual cabe en el presupuesto?</p>
                <div className="sg-options">
                  {[
                    ['fits', 'Sí, cabe'],
                    ['adjust', 'Necesito ajustarlo'],
                    ['unsure', 'Aún no lo sé'],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      className="sg-option"
                      aria-pressed={draft.feasibility === value}
                      onClick={() =>
                        change({ feasibility: value as SmartGoalDraft['feasibility'] })
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="sg-preview">
            <span>Aporte mensual aproximado</span>
            <strong>{money(contribution)}</strong>
            <p>{draft.goal || 'Completa la meta para construir tu tarjeta.'}</p>
            {reviewing && (
              <p>
                {draft.reason} · {draft.months} meses ·{' '}
                {draft.feasibility === 'fits'
                  ? 'Cabe en el presupuesto'
                  : draft.feasibility === 'adjust'
                    ? 'Requiere ajuste'
                    : 'Viabilidad por confirmar'}
              </p>
            )}
          </div>
        </ActivityFrame>
      )}
    </LessonShell>
  );
}
