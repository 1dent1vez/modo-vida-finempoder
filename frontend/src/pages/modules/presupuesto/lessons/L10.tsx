import { useEffect, useRef, useState } from 'react';
import LessonShell from '../LessonShell';
import ActivityFrame, {
  ActivityLoadError,
  ActivityLoading,
} from '../../../../module-kit/activities/ActivityFrame';
import {
  initialCrisisDraft,
  parseCrisisDraft,
  type CrisisDraft,
} from '../../../../module-kit/activities/crisisResponseModel';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import { useAuth } from '../../../../store/auth';
import '../../../../module-kit/activities/classification.css';
import '../../../../module-kit/activities/crisis-response.css';

const KEY = 'l10_crisis_response:v1';
// eslint-disable-next-line react-refresh/only-export-components -- stories exported for lesson contract tests
export const CRISIS_STORIES = [
  {
    id: 'sofia',
    name: 'Sofía',
    situation: 'Su ingreso temporal se detuvo antes de terminar el mes.',
    response:
      'Calculó cuánto tenía disponible, protegió comida y transporte, y pausó gastos aplazables.',
    lesson: 'Primero ubica los recursos disponibles y protege lo esencial.',
  },
  {
    id: 'andres',
    name: 'Andrés',
    situation: 'Un pago esperado se retrasó por un error administrativo.',
    response:
      'Contactó temprano a sus proveedores, pidió nuevas fechas y evitó compromisos que no podía cubrir.',
    lesson: 'Comunicarte antes del vencimiento abre más opciones.',
  },
  {
    id: 'luisa',
    name: 'Luisa',
    situation: 'El ingreso disponible de su hogar bajó durante varias semanas.',
    response:
      'Ajustó el presupuesto con su familia y acordaron qué reducir mientras se estabilizaban.',
    lesson: 'Un ajuste compartido ayuda a convertir la incertidumbre en decisiones concretas.',
  },
] as const;
// eslint-disable-next-line react-refresh/only-export-components -- checks exported for lesson contract tests
export const CRISIS_CHECKS = [
  {
    id: 'first',
    question: 'Si un ingreso se detiene hoy, ¿qué conviene hacer primero?',
    options: [
      'Solicitar crédito de inmediato',
      'Revisar recursos y gastos esenciales',
      'Ignorar los pagos hasta fin de mes',
    ],
    correct: 1,
    feedback:
      'Conocer lo disponible y proteger lo esencial permite decidir con datos antes de asumir nuevas obligaciones.',
  },
  {
    id: 'due-date',
    question: 'Si no podrás cubrir un pago en su fecha, ¿qué acción ayuda más?',
    options: [
      'Contactar al proveedor antes del vencimiento',
      'Esperar a recibir un cobro',
      'Cubrirlo con otra deuda sin comparar',
    ],
    correct: 0,
    feedback: 'Hablar temprano permite conocer prórrogas o convenios y evaluar sus condiciones.',
  },
  {
    id: 'cut',
    question: '¿Qué gasto revisarías antes durante un ajuste temporal?',
    options: [
      'Alimentación básica',
      'Medicamentos necesarios',
      'Una suscripción que puede pausarse',
    ],
    correct: 2,
    feedback: 'Empieza por gastos aplazables; las necesidades básicas requieren protección.',
  },
] as const;
const PLANS = [
  { id: 'map', label: 'Haré una lista de recursos y gastos esenciales' },
  { id: 'contact', label: 'Anotaré a quién contactar antes de un vencimiento' },
  { id: 'pause', label: 'Identificaré un gasto aplazable que pueda pausar' },
] as const;
const questionIds = new Set(CRISIS_CHECKS.map((item) => item.id));
const planIds = new Set(PLANS.map((item) => item.id));

export default function L10() {
  const userId = useAuth((state) => state.user?.id ?? 'local');
  return <CrisisSession key={userId} />;
}
function CrisisSession() {
  const [draft, setDraft] = useState<CrisisDraft>(initialCrisisDraft);
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
        setDraft(
          parseCrisisDraft(raw, CRISIS_STORIES.length, questionIds, planIds) ??
            initialCrisisDraft(),
        );
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
  const persist = async (next: CrisisDraft, final = false) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    try {
      if (final) {
        await lessonDataRepository.saveBatch('presupuesto', [
          {
            key: 'l10_crisis_plan',
            data: {
              plan: next.plan,
              answers: next.answers,
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
      if (mounted.current) setError('No pudimos guardar. Tu elección sigue en pantalla.');
    } finally {
      lock.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  const story = CRISIS_STORIES[draft.storyIndex];
  const check = CRISIS_CHECKS[draft.checkIndex];
  const answered = Object.keys(draft.answers).length;
  const reviewing = draft.stage === 'review' || draft.stage === 'complete';
  const selectedPlan = PLANS.find((item) => item.id === draft.plan);
  const feedback = draft.pendingAnswer === null ? null : draft.pendingAnswer === check.correct;
  const advice =
    feedback === null
      ? {
          title: 'Decide con orden',
          text: 'Ubica lo disponible, protege lo esencial y comunica cualquier dificultad a tiempo.',
          tone: 'info' as const,
        }
      : {
          title: feedback ? 'La prioridad está clara' : 'Revisa el orden',
          text: check.feedback,
          tone: feedback ? ('success' as const) : ('review' as const),
        };
  const confirmStory = () => {
    const last = draft.storyIndex === CRISIS_STORIES.length - 1;
    void persist({
      ...draft,
      storyIndex: last ? draft.storyIndex : draft.storyIndex + 1,
      stage: last ? 'check' : 'stories',
    });
  };
  const confirmCheck = () => {
    if (draft.pendingAnswer === null) return;
    const answers = { ...draft.answers, [check.id]: draft.pendingAnswer };
    const last = draft.checkIndex === CRISIS_CHECKS.length - 1;
    void persist({
      ...draft,
      answers,
      pendingAnswer: null,
      checkIndex: last ? draft.checkIndex : draft.checkIndex + 1,
      stage: last ? 'plan' : 'check',
    });
  };
  return (
    <LessonShell
      id="L10"
      title="Finanzas en tiempos difíciles"
      showGreeting={false}
      completion={{ ready: draft.stage === 'complete', score: 100 }}
    >
      {loading ? (
        <ActivityLoading message="Recuperando tu práctica…" />
      ) : loadError ? (
        <ActivityLoadError
          message="No pudimos recuperar tu avance."
          onRetry={() => setRetry((value) => value + 1)}
        />
      ) : (
        <ActivityFrame
          label="Práctica para responder a una reducción de ingresos"
          className="crisis-response"
          busy={busy}
          title={
            reviewing
              ? 'Revisa tu primer paso.'
              : draft.stage === 'plan'
                ? 'Elige una acción que puedas preparar.'
                : draft.stage === 'check'
                  ? 'Pon a prueba el orden de respuesta.'
                  : 'Observa cómo cambia cada decisión.'
          }
          description="Trabaja con casos ficticios; no necesitas compartir datos financieros personales."
          progressLabel="Etapas completadas"
          progressValue={
            draft.stage === 'stories'
              ? draft.storyIndex
              : draft.stage === 'check'
                ? 3 + answered
                : draft.stage === 'plan'
                  ? 6
                  : 7
          }
          progressMax={7}
          stepLabel={
            reviewing
              ? 'Paso 4 de 4 · Revisar'
              : draft.stage === 'plan'
                ? 'Paso 3 de 4 · Preparar'
                : draft.stage === 'check'
                  ? `Paso 2 de 4 · Pregunta ${draft.checkIndex + 1} de 3`
                  : `Paso 1 de 4 · Caso ${draft.storyIndex + 1} de 3`
          }
          focusKey={`${draft.stage}-${draft.storyIndex}-${draft.checkIndex}`}
          advice={advice}
          adviceCue={cue}
          error={error}
          status={busy ? 'Guardando…' : dirty ? 'Cambios sin guardar.' : 'Tu avance está guardado.'}
          actions={
            <div className="cr-actions">
              {draft.stage === 'stories' && (
                <button className="ca-primary" disabled={busy} onClick={confirmStory}>
                  {draft.storyIndex === 2 ? 'Comprobar lo aprendido' : 'Siguiente caso'}
                </button>
              )}
              {draft.stage === 'check' && (
                <button
                  className="ca-primary"
                  disabled={busy || draft.pendingAnswer === null}
                  onClick={confirmCheck}
                >
                  Confirmar respuesta
                </button>
              )}
              {draft.stage === 'plan' && (
                <button
                  className="ca-primary"
                  disabled={busy || !draft.plan}
                  onClick={() => void persist({ ...draft, stage: 'review' })}
                >
                  Guardar y revisar
                </button>
              )}
              {draft.stage === 'review' && (
                <>
                  <button
                    className="cr-secondary"
                    onClick={() => {
                      setDraft((value) => ({ ...value, stage: 'plan' }));
                      setDirty(true);
                    }}
                  >
                    Ajustar acción
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
          {draft.stage === 'stories' && (
            <article className="cr-card">
              <p className="cr-eyebrow">Caso ficticio · {story.name}</p>
              <h3>{story.situation}</h3>
              <div className="cr-response">
                <strong>Qué hizo</strong>
                <p>{story.response}</p>
                <strong>Idea útil</strong>
                <p>{story.lesson}</p>
              </div>
            </article>
          )}
          {draft.stage === 'check' && (
            <article className="cr-card">
              <p className="cr-eyebrow">Decisión {draft.checkIndex + 1}</p>
              <h3>{check.question}</h3>
              <div className="cr-options">
                {check.options.map((option, index) => (
                  <button
                    key={option}
                    className="cr-option"
                    aria-pressed={draft.pendingAnswer === index}
                    onClick={() => {
                      setDraft((value) => ({ ...value, pendingAnswer: index }));
                      setDirty(true);
                      setCue(`${check.id}-${index}`);
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </article>
          )}
          {draft.stage === 'plan' && (
            <section className="cr-plan">
              <h3>¿Qué primer paso quieres dejar preparado?</h3>
              <p>
                Elige uno para practicar. Esto no programa recordatorios ni contacta a terceros.
              </p>
              <div className="cr-options">
                {PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    className="cr-option"
                    aria-pressed={draft.plan === plan.id}
                    onClick={() => {
                      setDraft((value) => ({ ...value, plan: plan.id }));
                      setDirty(true);
                    }}
                  >
                    {plan.label}
                  </button>
                ))}
              </div>
            </section>
          )}
          {reviewing && (
            <section className="cr-plan">
              <p className="cr-eyebrow">Tu respuesta inicial</p>
              <h3>{selectedPlan?.label}</h3>
              <p>
                Si una dificultad ocurre, vuelve a tus cantidades reales y revisa las condiciones
                antes de aceptar un convenio o crédito.
              </p>
            </section>
          )}
        </ActivityFrame>
      )}
    </LessonShell>
  );
}
