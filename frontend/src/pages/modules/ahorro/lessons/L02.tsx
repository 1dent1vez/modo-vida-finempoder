import { useEffect, useRef, useState } from 'react';
import LessonShell from '../LessonShell';
import ActivityFrame, {
  ActivityLoadError,
  ActivityLoading,
} from '../../../../module-kit/activities/ActivityFrame';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import '../../../../module-kit/activities/classification.css';
import '../../../../module-kit/activities/savings-options.css';

type Stage = 'criteria' | 'practice' | 'plan' | 'review' | 'complete';
type Option = 'informal' | 'formal' | 'combined';
type Priority = 'access' | 'protection' | 'discipline';
type Draft = {
  version: 1;
  stage: Stage;
  scenario: number;
  pending: Option | null;
  answers: Record<number, Option>;
  plan: Option | null;
  priority: Priority | null;
};

const KEY = 'savings_l2:options:v1';
const OPTIONS: { id: Option; label: string }[] = [
  { id: 'informal', label: 'Informal' },
  { id: 'formal', label: 'Formal' },
  { id: 'combined', label: 'Combinado' },
];
const SCENARIOS: { title: string; text: string; best: Option; feedback: string }[] = [
  {
    title: 'Fondo para imprevistos',
    text: 'Quieres consultar movimientos y reducir la exposición del dinero a pérdida o robo en casa.',
    best: 'formal',
    feedback:
      'Una opción formal puede aportar registro y protección física. Antes de elegirla, revisa acceso, comisiones y condiciones de la institución.',
  },
  {
    title: 'Meta con apoyo del grupo',
    text: 'Una tanda te ayuda a ser constante, pero el resultado depende de que todas las personas cumplan.',
    best: 'informal',
    feedback:
      'La tanda es ahorro informal: puede apoyar la disciplina, aunque añade dependencia de terceros y no sustituye un fondo disponible.',
  },
  {
    title: 'Acceso y resguardo',
    text: 'Quieres una cantidad pequeña a la mano y mantener el resto fuera de casa, con movimientos consultables.',
    best: 'combined',
    feedback:
      'Combinar puede atender necesidades distintas. Define cuánto dejar disponible y dónde resguardar el resto para no duplicar riesgos.',
  },
];
const PRIORITIES: { id: Priority; label: string; help: string }[] = [
  {
    id: 'access',
    label: 'Acceso oportuno',
    help: 'Poder usar el dinero cuando cumple su propósito.',
  },
  {
    id: 'protection',
    label: 'Protección',
    help: 'Reducir riesgos de pérdida, robo o incumplimiento.',
  },
  {
    id: 'discipline',
    label: 'Constancia',
    help: 'Sostener el hábito con una regla que puedas cumplir.',
  },
];
const initial = (): Draft => ({
  version: 1,
  stage: 'criteria',
  scenario: 0,
  pending: null,
  answers: {},
  plan: null,
  priority: null,
});

function parse(raw: unknown): Draft | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as Draft;
  const validOptions = ['informal', 'formal', 'combined'];
  const validPriorities = ['access', 'protection', 'discipline'];
  if (
    value.version !== 1 ||
    !['criteria', 'practice', 'plan', 'review', 'complete'].includes(value.stage) ||
    !Number.isInteger(value.scenario) ||
    value.scenario < 0 ||
    value.scenario >= SCENARIOS.length ||
    (value.pending !== null && !validOptions.includes(value.pending)) ||
    !value.answers ||
    (value.plan !== null && !validOptions.includes(value.plan)) ||
    (value.priority !== null && !validPriorities.includes(value.priority)) ||
    (['review', 'complete'].includes(value.stage) && (!value.plan || !value.priority))
  )
    return null;
  return value;
}

export default function L02() {
  const [draft, setDraft] = useState<Draft>(initial);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cue, setCue] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    setLoading(true);
    setLoadError(false);
    void lessonDataRepository
      .load('ahorro', KEY)
      .then((raw) => {
        if (mounted.current) {
          setDraft(parse(raw) ?? initial());
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
  }, [loadAttempt]);

  const persist = async (next: Draft, final = false) => {
    setBusy(true);
    setError(null);
    try {
      if (final) {
        await lessonDataRepository.saveBatch('ahorro', [
          {
            key: 'l2_savings_options',
            data: {
              answers: next.answers,
              plan: next.plan,
              priority: next.priority,
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
      if (mounted.current) setError('No pudimos guardar. Tus elecciones siguen en pantalla.');
    } finally {
      if (mounted.current) setBusy(false);
    }
  };

  if (loading)
    return (
      <LessonShell id="L02" title="Ahorro informal y formal" completion={{ ready: false }}>
        <ActivityLoading />
      </LessonShell>
    );
  if (loadError)
    return (
      <LessonShell id="L02" title="Ahorro informal y formal" completion={{ ready: false }}>
        <ActivityLoadError
          message="No pudimos recuperar tu avance. Inténtalo de nuevo."
          onRetry={() => setLoadAttempt((value) => value + 1)}
        />
      </LessonShell>
    );

  const current = SCENARIOS[draft.scenario];
  const matched = draft.pending === current.best;
  const reviewing = draft.stage === 'review' || draft.stage === 'complete';
  const advice =
    draft.stage === 'practice' && draft.pending
      ? {
          title: matched ? 'El criterio encaja' : 'Revisa el propósito',
          text: current.feedback,
          tone: matched ? ('success' as const) : ('review' as const),
        }
      : {
          title: 'No existe una opción universal',
          text: 'Compara el propósito, el acceso, los riesgos, los costos y la dependencia de otras personas.',
          tone: 'info' as const,
        };
  const confirmScenario = () => {
    if (!draft.pending) return;
    const answers = { ...draft.answers, [draft.scenario]: draft.pending };
    const last = draft.scenario === SCENARIOS.length - 1;
    void persist({
      ...draft,
      answers,
      pending: null,
      scenario: last ? draft.scenario : draft.scenario + 1,
      stage: last ? 'plan' : 'practice',
    });
  };

  return (
    <LessonShell
      id="L02"
      title="Cochinito vs banco: ahorro informal y formal"
      showGreeting={false}
      completion={{ ready: draft.stage === 'complete', score: 100 }}
    >
      <ActivityFrame
        label="Comparador de opciones de ahorro"
        className="savings-options"
        busy={busy}
        title={
          reviewing
            ? 'Revisa tu estrategia.'
            : draft.stage === 'plan'
              ? 'Construye una regla personal.'
              : draft.stage === 'practice'
                ? 'Elige según la situación.'
                : 'Compara con criterios, no con etiquetas.'
        }
        description="Explora ventajas y riesgos antes de decidir dónde guardar tu dinero."
        progressLabel="Etapas completadas"
        progressValue={
          draft.stage === 'criteria'
            ? 0
            : draft.stage === 'practice'
              ? 1 + Object.keys(draft.answers).length
              : draft.stage === 'plan'
                ? 4
                : 5
        }
        progressMax={5}
        stepLabel={
          reviewing
            ? 'Paso 4 de 4 · Revisar'
            : draft.stage === 'plan'
              ? 'Paso 3 de 4 · Crear una regla'
              : draft.stage === 'practice'
                ? `Paso 2 de 4 · Caso ${draft.scenario + 1} de ${SCENARIOS.length}`
                : 'Paso 1 de 4 · Conocer criterios'
        }
        focusKey={`${draft.stage}-${draft.scenario}`}
        advice={advice}
        adviceCue={cue}
        error={error}
        status={busy ? 'Guardando…' : dirty ? 'Cambios sin guardar.' : 'Tu avance está guardado.'}
        actions={
          <div className="so-actions">
            {draft.stage === 'criteria' && (
              <button
                className="ca-primary"
                onClick={() => void persist({ ...draft, stage: 'practice' })}
              >
                Practicar con casos
              </button>
            )}
            {draft.stage === 'practice' && (
              <button
                className="ca-primary"
                disabled={!draft.pending || busy}
                onClick={confirmScenario}
              >
                {draft.scenario === SCENARIOS.length - 1
                  ? 'Confirmar y crear mi regla'
                  : 'Confirmar caso'}
              </button>
            )}
            {draft.stage === 'plan' && (
              <button
                className="ca-primary"
                disabled={!draft.plan || !draft.priority || busy}
                onClick={() => void persist({ ...draft, stage: 'review' })}
              >
                Revisar estrategia
              </button>
            )}
            {draft.stage === 'review' && (
              <>
                <button
                  className="so-secondary"
                  onClick={() => {
                    setDraft((value) => ({ ...value, stage: 'plan' }));
                    setDirty(true);
                  }}
                >
                  Ajustar estrategia
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
        {draft.stage === 'criteria' && (
          <section className="so-grid" aria-label="Criterios para comparar">
            <article>
              <strong>Acceso</strong>
              <p>Cuándo y cómo puedes disponer del dinero.</p>
            </article>
            <article>
              <strong>Protección</strong>
              <p>Qué riesgos existen y qué respaldo aplica.</p>
            </article>
            <article>
              <strong>Costo y registro</strong>
              <p>Comisiones, condiciones y movimientos consultables.</p>
            </article>
            <article>
              <strong>Dependencia</strong>
              <p>Si recuperar el dinero requiere que alguien más cumpla.</p>
            </article>
          </section>
        )}
        {draft.stage === 'practice' && (
          <section className="so-case">
            <span>Situación</span>
            <h3>{current.title}</h3>
            <p>{current.text}</p>
            <div className="so-options" role="group" aria-label="Elige una opción">
              {OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={draft.pending === option.id ? 'is-selected' : ''}
                  aria-pressed={draft.pending === option.id}
                  onClick={() => {
                    setDraft((value) => ({ ...value, pending: option.id }));
                    setCue(`${current.title}: ${option.label}`);
                    setDirty(true);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>
        )}
        {draft.stage === 'plan' && (
          <section className="so-plan">
            <fieldset>
              <legend>Para mi ahorro planeado usaré principalmente:</legend>
              <div className="so-choice-list">
                {OPTIONS.map((option) => (
                  <label key={option.id}>
                    <input
                      type="radio"
                      name="plan"
                      checked={draft.plan === option.id}
                      onChange={() => {
                        setDraft((value) => ({ ...value, plan: option.id }));
                        setDirty(true);
                      }}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>Mi criterio principal será:</legend>
              <div className="so-priorities">
                {PRIORITIES.map((priority) => (
                  <label key={priority.id}>
                    <input
                      type="radio"
                      name="priority"
                      checked={draft.priority === priority.id}
                      onChange={() => {
                        setDraft((value) => ({ ...value, priority: priority.id }));
                        setDirty(true);
                      }}
                    />
                    <span>
                      <strong>{priority.label}</strong>
                      {priority.help}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <p className="so-note">
              Antes de contratar un producto, verifica costos, disponibilidad y la protección
              aplicable en una fuente oficial.
            </p>
          </section>
        )}
        {reviewing && (
          <section className="so-review">
            <span>Tu regla inicial</span>
            <h3>{OPTIONS.find((option) => option.id === draft.plan)?.label}</h3>
            <p>
              Priorizarás{' '}
              <strong>
                {PRIORITIES.find((priority) => priority.id === draft.priority)?.label.toLowerCase()}
              </strong>
              . Puedes ajustar esta regla cuando cambien tu meta o tus circunstancias.
            </p>
          </section>
        )}
      </ActivityFrame>
    </LessonShell>
  );
}
