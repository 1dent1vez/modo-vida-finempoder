import { useEffect, useRef, useState } from 'react';
import LessonShell from '../LessonShell';
import ActivityFrame, {
  ActivityLoadError,
  ActivityLoading,
} from '../../../../module-kit/activities/ActivityFrame';
import {
  initialEmotional,
  parseEmotional,
  type EmotionalDraft,
  type SpendingLens,
} from '../../../../module-kit/activities/emotionalSpendingModel';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import { useAuth } from '../../../../store/auth';
import '../../../../module-kit/activities/classification.css';
import '../../../../module-kit/activities/emotional-spending.css';
const KEY = 'l8_awareness:v1';
// eslint-disable-next-line react-refresh/only-export-components -- scenarios exported for lesson contract tests
export const EMOTIONAL_SCENARIOS = [
  {
    id: 'uniform',
    title: 'Uniforme para una clase',
    text: 'Cuesta $400 y se necesita la próxima semana.',
    lens: 'planned',
    context:
      'La necesidad y la fecha permiten anticiparlo. Planearlo evita confundir urgencia con impulso.',
  },
  {
    id: 'coffee',
    title: 'Café después de un examen difícil',
    text: 'Cuesta $85 y aparece como forma de aliviar el estrés.',
    lens: 'emotional',
    context:
      'La emoción influye en la compra. Puede ser válida si se reconoce y cabe en el presupuesto.',
  },
  {
    id: 'offer',
    title: 'App en oferta que no estaba prevista',
    text: 'Cuesta $189 y la promoción termina hoy.',
    lens: 'impulsive',
    context:
      'La urgencia de la oferta empuja a decidir rápido. Esperar ayuda a comprobar si existe una necesidad real.',
  },
  {
    id: 'celebration',
    title: 'Comida para celebrar un logro',
    text: 'Cuesta $200 y estaba contemplada en el presupuesto de deseos.',
    lens: 'planned',
    context:
      'Una emoción no convierte automáticamente el gasto en problema. Aquí hubo intención y espacio previsto.',
  },
] as const;
const TRIGGERS = [
  ['stress', 'Estrés'],
  ['boredom', 'Aburrimiento'],
  ['celebration', 'Celebración'],
  ['offers', 'Ofertas'],
] as const;
const STRATEGIES = [
  'Esperar 24 horas antes de una compra no prevista',
  'Nombrar la emoción antes de pagar',
  'Definir un monto mensual para gustos',
] as const;
const scenarioIds = new Set(EMOTIONAL_SCENARIOS.map((item) => item.id));
const triggerIds = new Set(TRIGGERS.map(([id]) => id));
const strategies = new Set<string>(STRATEGIES);
export default function L08() {
  const userId = useAuth((state) => state.user?.id ?? 'local');
  return <EmotionalSession key={userId} />;
}
function EmotionalSession() {
  const [draft, setDraft] = useState<EmotionalDraft>(initialEmotional);
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
        setDraft(parseEmotional(raw, scenarioIds, triggerIds, strategies) ?? initialEmotional());
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
  const current = EMOTIONAL_SCENARIOS[draft.index];
  const answered = Object.keys(draft.answers).length;
  const persist = async (next: EmotionalDraft, final = false) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    try {
      if (final) {
        await lessonDataRepository.saveBatch('presupuesto', [
          {
            key: 'l8_strategy',
            data: {
              strategy: next.strategy,
              triggers: next.triggers,
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
      }
    } catch {
      if (mounted.current) setError('No pudimos guardar. Tus decisiones siguen en pantalla.');
    } finally {
      lock.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  const confirmScenario = () => {
    if (!draft.pending) return;
    const answers = { ...draft.answers, [current.id]: draft.pending };
    const last = draft.index === EMOTIONAL_SCENARIOS.length - 1;
    void persist({
      ...draft,
      answers,
      pending: null,
      index: last ? draft.index : draft.index + 1,
      stage: last ? 'strategy' : 'scenarios',
    });
  };
  const toggleTrigger = (id: string) => {
    setDraft((value) => ({
      ...value,
      triggers: value.triggers.includes(id)
        ? value.triggers.filter((item) => item !== id)
        : [...value.triggers, id],
    }));
    setDirty(true);
  };
  const reviewing = draft.stage === 'review' || draft.stage === 'complete';
  const advice = draft.pending
    ? {
        title: draft.pending === current.lens ? 'Buena lectura del contexto' : 'Mira el matiz',
        text: current.context,
        tone: draft.pending === current.lens ? ('success' as const) : ('review' as const),
      }
    : {
        title: 'La emoción aporta contexto',
        text: 'Observa necesidad, intención y espacio en el presupuesto antes de etiquetar una compra.',
        tone: 'info' as const,
      };
  return (
    <LessonShell
      id="L08"
      title="Reconoce el gasto emocional"
      showGreeting={false}
      completion={{ ready: draft.stage === 'complete', score: 100 }}
    >
      {loading ? (
        <ActivityLoading message="Recuperando tu práctica…" />
      ) : loadError ? (
        <ActivityLoadError
          message="No pudimos recuperar tus decisiones."
          onRetry={() => setRetry((value) => value + 1)}
        />
      ) : (
        <ActivityFrame
          label="Práctica de gasto emocional"
          className="emotional-spending"
          busy={busy}
          title={
            reviewing
              ? 'Revisa tu estrategia.'
              : draft.stage === 'strategy'
                ? 'Elige una pausa que puedas practicar.'
                : 'Lee el contexto antes de etiquetar.'
          }
          description="Clasifica situaciones ficticias. Tus detonantes personales son opcionales."
          progressLabel="Escenarios confirmados"
          progressValue={answered}
          progressMax={EMOTIONAL_SCENARIOS.length}
          stepLabel={
            reviewing
              ? 'Paso 3 de 3 · Revisar'
              : draft.stage === 'strategy'
                ? 'Paso 2 de 3 · Preparar'
                : `Caso ${draft.index + 1} de ${EMOTIONAL_SCENARIOS.length}`
          }
          focusKey={`${draft.stage}-${draft.index}`}
          advice={advice}
          adviceCue={cue}
          error={error}
          status={
            busy
              ? 'Guardando…'
              : dirty
                ? 'Cambios sin guardar.'
                : `${answered} de ${EMOTIONAL_SCENARIOS.length} casos guardados.`
          }
          actions={
            <div className="es-actions">
              {draft.stage === 'scenarios' && (
                <button
                  className="ca-primary"
                  disabled={busy || !draft.pending}
                  onClick={confirmScenario}
                >
                  Confirmar lectura
                </button>
              )}
              {draft.stage === 'strategy' && (
                <button
                  className="ca-primary"
                  disabled={busy || !draft.strategy}
                  onClick={() => void persist({ ...draft, stage: 'review' })}
                >
                  Guardar y revisar
                </button>
              )}
              {draft.stage === 'review' && (
                <>
                  <button
                    className="es-secondary"
                    onClick={() => {
                      setDraft((value) => ({ ...value, stage: 'strategy' }));
                      setDirty(true);
                    }}
                  >
                    Ajustar estrategia
                  </button>
                  <button
                    className="ca-primary"
                    disabled={busy}
                    onClick={() => void persist({ ...draft, stage: 'complete' }, true)}
                  >
                    Guardar y terminar
                  </button>
                </>
              )}
            </div>
          }
        >
          {draft.stage === 'scenarios' && (
            <article className="es-card">
              <h3>{current.title}</h3>
              <p>{current.text}</p>
              <div className="es-options">
                {(
                  [
                    ['planned', 'Planeado'],
                    ['emotional', 'Influido por la emoción'],
                    ['impulsive', 'Impulsivo'],
                  ] as [SpendingLens, string][]
                ).map(([value, label]) => (
                  <button
                    key={value}
                    className="es-option"
                    aria-pressed={draft.pending === value}
                    onClick={() => {
                      setDraft((state) => ({ ...state, pending: value }));
                      setDirty(true);
                      setCue(`${current.id}-${value}`);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </article>
          )}
          {draft.stage === 'strategy' && (
            <>
              <p>Si quieres, marca situaciones que reconoces. Puedes continuar sin compartirlas.</p>
              <div className="es-tags">
                {TRIGGERS.map(([id, label]) => (
                  <button
                    key={id}
                    className="es-option"
                    aria-pressed={draft.triggers.includes(id)}
                    onClick={() => toggleTrigger(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <h3>Elige una estrategia</h3>
              <div className="es-options">
                {STRATEGIES.map((strategy) => (
                  <button
                    key={strategy}
                    className="es-option"
                    aria-pressed={draft.strategy === strategy}
                    onClick={() => {
                      setDraft((value) => ({ ...value, strategy }));
                      setDirty(true);
                    }}
                  >
                    {strategy}
                  </button>
                ))}
              </div>
            </>
          )}
          {reviewing && (
            <div className="es-review">
              <div>
                <strong>Estrategia</strong>
                <p>{draft.strategy}</p>
              </div>
              <div>
                <strong>Detonantes compartidos</strong>
                <p>
                  {draft.triggers.length
                    ? draft.triggers
                        .map((id) => TRIGGERS.find(([value]) => value === id)?.[1])
                        .join(', ')
                    : 'Ninguno; esta parte era opcional.'}
                </p>
              </div>
            </div>
          )}
        </ActivityFrame>
      )}
    </LessonShell>
  );
}
