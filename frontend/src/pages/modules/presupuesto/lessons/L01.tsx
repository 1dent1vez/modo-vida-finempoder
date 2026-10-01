import { useEffect, useRef, useState } from 'react';
import LessonShell from '../LessonShell';
import ActivityFrame, {
  ActivityLoadError,
  ActivityLoading,
} from '../../../../module-kit/activities/ActivityFrame';
import {
  initialSpendingAwareness,
  parseSpendingAwareness,
  type SpendingAwarenessDraft,
} from '../../../../module-kit/activities/spendingAwarenessModel';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import { useAuth } from '../../../../store/auth';
import '../../../../module-kit/activities/classification.css';
import '../../../../module-kit/activities/spending-awareness.css';

const KEY = 'l1_spending_awareness:v1';
const EXPECTATIONS = ['Menos de 3 días', 'Una semana', 'Dos semanas', 'Me sobró algo'];
const DAYS = [
  { day: 'Lunes', event: 'Ingreso del ejemplo', balance: 2000 },
  { day: 'Martes', event: 'Transporte y café', balance: 1925 },
  { day: 'Miércoles', event: 'Comida y streaming', balance: 1616 },
  { day: 'Jueves', event: 'Salida con amistades', balance: 1266 },
  { day: 'Viernes', event: 'Impresiones y snack', balance: 1171 },
  { day: 'Fin de semana', event: 'Gastos sin registrar', balance: 771 },
];
const ITEMS = [
  { id: 'transporte', label: 'Transporte habitual · $30' },
  { id: 'streaming', label: 'Suscripción de streaming · $189' },
  { id: 'salida', label: 'Salida con amistades · $350' },
  { id: 'impresiones', label: 'Impresiones para una tarea · $60' },
  { id: 'varios', label: 'Gastos sin registrar · $400' },
];
const IDS = new Set(ITEMS.map((item) => item.id));

export default function L01() {
  const userId = useAuth((state) => state.user?.id ?? 'local');
  return <SpendingAwarenessSession key={userId} />;
}

function SpendingAwarenessSession() {
  const [draft, setDraft] = useState<SpendingAwarenessDraft>(initialSpendingAwareness);
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
        setDraft(parseSpendingAwareness(raw, IDS) ?? initialSpendingAwareness());
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

  const answered = Object.keys(draft.classifications).length;
  const allAnswered = answered === ITEMS.length;
  const persist = async (stage: SpendingAwarenessDraft['stage']) => {
    if (
      lock.current ||
      (stage !== 'observe' && !draft.expectation) ||
      (['review', 'complete'].includes(stage) && !allAnswered)
    )
      return;
    lock.current = true;
    setBusy(true);
    setError(null);
    const next = { ...draft, stage };
    try {
      if (stage === 'complete') {
        await lessonDataRepository.saveBatch('presupuesto', [
          {
            key: 'l1_spending_awareness',
            data: {
              expectation: draft.expectation,
              classifications: draft.classifications,
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
      if (mounted.current) setError('No pudimos guardar esta parte. Tu trabajo sigue en pantalla.');
    } finally {
      lock.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  const change = (patch: Partial<SpendingAwarenessDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setDirty(true);
    setCue(null);
  };
  const stageIndex = { observe: 0, classify: 1, review: 2, complete: 2 }[draft.stage];
  const advice =
    draft.stage === 'observe'
      ? {
          title: 'Primero observa, luego ajusta',
          text: 'No tienes que recordar cada compra propia. Este recorrido usa una semana ficticia para descubrir el patrón.',
          tone: 'info' as const,
        }
      : draft.stage === 'classify'
        ? {
            title: 'Planear no significa dejar de disfrutar',
            text: 'Un gasto puede ser válido y estar planeado. La claridad está en decidirlo antes de pagarlo.',
            tone: 'review' as const,
          }
        : {
            title: 'Ya encontraste el punto de control',
            text: 'Registrar y planear convierte un saldo confuso en decisiones que puedes revisar.',
            tone: 'success' as const,
          };

  return (
    <LessonShell
      id="L01"
      title="¿A dónde se fue mi quincena?"
      showGreeting={false}
      completion={{ ready: draft.stage === 'complete', score: 100 }}
    >
      {loading ? (
        <ActivityLoading message="Recuperando tu recorrido…" />
      ) : loadError ? (
        <ActivityLoadError
          message="No pudimos recuperar esta lección."
          onRetry={() => setRetry((value) => value + 1)}
        />
      ) : (
        <ActivityFrame
          label="Recorrido de conciencia de gasto"
          className="spending-awareness"
          busy={busy}
          title={
            draft.stage === 'observe'
              ? 'Sigue el dinero durante una semana.'
              : draft.stage === 'classify'
                ? '¿Qué se decidió antes de gastar?'
                : 'Tu primera regla de presupuesto.'
          }
          description="Observa una semana ficticia, distingue lo planeado y cierra con una regla que puedas repetir."
          progressLabel="Etapas completadas"
          progressValue={stageIndex}
          progressMax={2}
          stepLabel={`Paso ${stageIndex + 1} de 3`}
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
                  ? 'Recorrido guardado.'
                  : 'Tu último avance está guardado en este dispositivo.'
          }
          actions={
            <div className="sa-actions">
              {draft.stage === 'observe' && (
                <button
                  className="ca-primary"
                  disabled={busy || !draft.expectation}
                  onClick={() => void persist('classify')}
                >
                  Clasificar gastos
                </button>
              )}
              {draft.stage === 'classify' && (
                <button
                  className="ca-primary"
                  disabled={busy || !allAnswered}
                  onClick={() => void persist('review')}
                >
                  Revisar patrón
                </button>
              )}
              {draft.stage === 'review' && (
                <>
                  <button
                    className="sa-choice"
                    disabled={busy}
                    onClick={() => change({ stage: 'classify' })}
                  >
                    Ajustar respuestas
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
          {draft.stage === 'observe' && (
            <>
              <div className="sa-question">
                <h3>¿Cuánto suele durarte el dinero disponible?</h3>
                <div className="sa-options">
                  {EXPECTATIONS.map((option) => (
                    <button
                      key={option}
                      className="sa-choice"
                      aria-pressed={draft.expectation === option}
                      onClick={() => change({ expectation: option })}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <div className="sa-timeline">
                {DAYS.map((item) => (
                  <div className="sa-day" key={item.day}>
                    <strong>{item.day}</strong>
                    <span>{item.event}</span>
                    <strong>${item.balance.toLocaleString('es-MX')}</strong>
                  </div>
                ))}
              </div>
            </>
          )}
          {draft.stage === 'classify' && (
            <div>
              {ITEMS.map((item) => (
                <div className="sa-item" key={item.id}>
                  <p>{item.label}</p>
                  <div className="sa-classify">
                    <button
                      aria-pressed={draft.classifications[item.id] === 'planned'}
                      onClick={() =>
                        change({
                          classifications: { ...draft.classifications, [item.id]: 'planned' },
                        })
                      }
                    >
                      Lo planeé
                    </button>
                    <button
                      aria-pressed={draft.classifications[item.id] === 'unplanned'}
                      onClick={() =>
                        change({
                          classifications: { ...draft.classifications, [item.id]: 'unplanned' },
                        })
                      }
                    >
                      No lo planeé
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {(draft.stage === 'review' || draft.stage === 'complete') && (
            <div className="sa-review">
              <h3>Claridad antes de restricción</h3>
              <p>
                Clasificaste {answered} gastos del ejemplo. Un presupuesto sirve para anticipar,
                registrar y revisar; no para prohibir cada gusto.
              </p>
              <p>
                <strong>Próxima práctica:</strong> anota un gasto durante tres días y marca si
                estaba previsto.
              </p>
            </div>
          )}
        </ActivityFrame>
      )}
    </LessonShell>
  );
}
