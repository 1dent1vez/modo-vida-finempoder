import { useEffect, useRef, useState } from 'react';
import LessonShell from '../LessonShell';
import ActivityFrame, {
  ActivityLoadError,
  ActivityLoading,
} from '../../../../module-kit/activities/ActivityFrame';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import '../../../../module-kit/activities/classification.css';
import '../../../../module-kit/activities/savings-habits.css';

type Stage = 'observe' | 'classify' | 'choose' | 'review' | 'complete';
type Kind = 'ally' | 'friction';
type Draft = {
  version: 1;
  stage: Stage;
  item: number;
  pending: Kind | null;
  answers: Record<number, Kind>;
  friction: string | null;
  ally: string | null;
};
const KEY = 'savings_l4:habits:v1';
const ITEMS: { id: string; label: string; correct: Kind; feedback: string }[] = [
  {
    id: 'auto',
    label: 'Separar una cantidad planeada al recibir ingresos',
    correct: 'ally',
    feedback: 'Una regla ligada al momento de ingreso reduce decisiones repetidas.',
  },
  {
    id: 'offers',
    label: 'Mantener activas alertas de ofertas que no buscas',
    correct: 'friction',
    feedback: 'Las señales de compra pueden interrumpir una meta; silenciarlas crea distancia.',
  },
  {
    id: 'visible',
    label: 'Tener una meta clara y revisar su avance con una frecuencia definida',
    correct: 'ally',
    feedback: 'Una meta visible y una revisión acordada ayudan a sostener el propósito.',
  },
  {
    id: 'mixed',
    label: 'Mezclar el ahorro con el dinero de uso cotidiano',
    correct: 'friction',
    feedback:
      'Sin una separación clara es más difícil saber qué cantidad está disponible para gastar.',
  },
];
const FRICTIONS = [
  { id: 'offers', label: 'Alertas y compras impulsivas' },
  { id: 'mixed', label: 'Dinero mezclado' },
  { id: 'social', label: 'Planes sociales fuera de presupuesto' },
];
const ALLIES = [
  { id: 'silence', label: 'Silenciar alertas de compra' },
  { id: 'separate', label: 'Separar el ahorro al recibir ingresos' },
  { id: 'alternative', label: 'Proponer una alternativa de menor costo' },
];
const initial = (): Draft => ({
  version: 1,
  stage: 'observe',
  item: 0,
  pending: null,
  answers: {},
  friction: null,
  ally: null,
});
function parse(raw: unknown): Draft | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as Draft;
  if (
    value.version !== 1 ||
    !['observe', 'classify', 'choose', 'review', 'complete'].includes(value.stage) ||
    !Number.isInteger(value.item) ||
    value.item < 0 ||
    value.item >= ITEMS.length ||
    (value.pending !== null && !['ally', 'friction'].includes(value.pending)) ||
    !value.answers ||
    (value.friction !== null && !FRICTIONS.some((item) => item.id === value.friction)) ||
    (value.ally !== null && !ALLIES.some((item) => item.id === value.ally)) ||
    (['review', 'complete'].includes(value.stage) && (!value.friction || !value.ally))
  )
    return null;
  return value;
}

export default function L04() {
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
  }, [attempt]);
  const persist = async (next: Draft, final = false) => {
    setBusy(true);
    setError(null);
    try {
      if (final) {
        await lessonDataRepository.saveBatch('ahorro', [
          {
            key: 'l4_aliados',
            data: {
              answers: next.answers,
              saboteador: next.friction,
              aliadoElegido: next.ally,
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
      <LessonShell id="L04" title="Aliados y fricciones" completion={{ ready: false }}>
        <ActivityLoading />
      </LessonShell>
    );
  if (loadError)
    return (
      <LessonShell id="L04" title="Aliados y fricciones" completion={{ ready: false }}>
        <ActivityLoadError
          message="No pudimos recuperar tu avance."
          onRetry={() => setAttempt((value) => value + 1)}
        />
      </LessonShell>
    );
  const current = ITEMS[draft.item];
  const feedback = draft.pending === null ? null : draft.pending === current.correct;
  const reviewing = draft.stage === 'review' || draft.stage === 'complete';
  const confirm = () => {
    if (!draft.pending) return;
    const answers = { ...draft.answers, [draft.item]: draft.pending };
    const last = draft.item === ITEMS.length - 1;
    void persist({
      ...draft,
      answers,
      pending: null,
      item: last ? draft.item : draft.item + 1,
      stage: last ? 'choose' : 'classify',
    });
  };
  return (
    <LessonShell
      id="L04"
      title="Aliados y saboteadores del ahorro"
      showGreeting={false}
      completion={{ ready: draft.stage === 'complete', score: 100 }}
    >
      <ActivityFrame
        label="Diseñador de hábitos de ahorro"
        className="savings-habits"
        busy={busy}
        title={
          reviewing
            ? 'Revisa tu ajuste.'
            : draft.stage === 'choose'
              ? 'Diseña una respuesta pequeña.'
              : draft.stage === 'classify'
                ? 'Detecta qué facilita o dificulta.'
                : 'Tu entorno también decide.'
        }
        description="Reconoce señales de tu entorno y elige un ajuste que puedas probar esta semana."
        progressLabel="Etapas completadas"
        progressValue={
          draft.stage === 'observe'
            ? 0
            : draft.stage === 'classify'
              ? 1 + Object.keys(draft.answers).length
              : draft.stage === 'choose'
                ? 5
                : 6
        }
        progressMax={6}
        stepLabel={
          reviewing
            ? 'Paso 4 de 4 · Revisar'
            : draft.stage === 'choose'
              ? 'Paso 3 de 4 · Elegir un ajuste'
              : draft.stage === 'classify'
                ? `Paso 2 de 4 · Señal ${draft.item + 1} de ${ITEMS.length}`
                : 'Paso 1 de 4 · Observar'
        }
        focusKey={`${draft.stage}-${draft.item}`}
        advice={{
          title:
            feedback === null
              ? 'Cambia el entorno, no solo la intención'
              : feedback
                ? 'Buena lectura'
                : 'Mira el efecto',
          text:
            feedback === null
              ? 'Un aliado vuelve la conducta más fácil; una fricción la interrumpe o la vuelve confusa.'
              : current.feedback,
          tone: feedback === null ? 'info' : feedback ? 'success' : 'review',
        }}
        adviceCue={cue}
        error={error}
        status={busy ? 'Guardando…' : dirty ? 'Cambios sin guardar.' : 'Tu avance está guardado.'}
        actions={
          <div className="sh-actions">
            {draft.stage === 'observe' && (
              <button
                className="ca-primary"
                onClick={() => void persist({ ...draft, stage: 'classify' })}
              >
                Detectar señales
              </button>
            )}
            {draft.stage === 'classify' && (
              <button className="ca-primary" disabled={!draft.pending || busy} onClick={confirm}>
                {draft.item === ITEMS.length - 1 ? 'Confirmar y elegir ajuste' : 'Confirmar señal'}
              </button>
            )}
            {draft.stage === 'choose' && (
              <button
                className="ca-primary"
                disabled={!draft.friction || !draft.ally || busy}
                onClick={() => void persist({ ...draft, stage: 'review' })}
              >
                Revisar mi ajuste
              </button>
            )}
            {draft.stage === 'review' && (
              <>
                <button
                  className="sh-secondary"
                  onClick={() => {
                    setDraft((value) => ({ ...value, stage: 'choose' }));
                    setDirty(true);
                  }}
                >
                  Cambiar ajuste
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
        {draft.stage === 'observe' && (
          <section className="sh-observe">
            <strong>Intención</strong>
            <span aria-hidden="true">→</span>
            <strong>Señal del entorno</strong>
            <span aria-hidden="true">→</span>
            <strong>Acción más fácil o más difícil</strong>
            <p>
              La práctica consiste en modificar una señal concreta, sin culparte por tener que usar
              fuerza de voluntad.
            </p>
          </section>
        )}
        {draft.stage === 'classify' && (
          <section className="sh-card">
            <span>Señal</span>
            <h3>{current.label}</h3>
            <div role="group" aria-label="Clasifica la señal">
              <button
                aria-pressed={draft.pending === 'ally'}
                className={draft.pending === 'ally' ? 'is-selected' : ''}
                onClick={() => {
                  setDraft((value) => ({ ...value, pending: 'ally' }));
                  setCue(`${current.id}: aliado`);
                  setDirty(true);
                }}
              >
                Aliado
              </button>
              <button
                aria-pressed={draft.pending === 'friction'}
                className={draft.pending === 'friction' ? 'is-selected' : ''}
                onClick={() => {
                  setDraft((value) => ({ ...value, pending: 'friction' }));
                  setCue(`${current.id}: fricción`);
                  setDirty(true);
                }}
              >
                Fricción
              </button>
            </div>
          </section>
        )}
        {draft.stage === 'choose' && (
          <section className="sh-choose">
            <fieldset>
              <legend>Una fricción que reconozco:</legend>
              {FRICTIONS.map((item) => (
                <label key={item.id}>
                  <input
                    type="radio"
                    name="friction"
                    checked={draft.friction === item.id}
                    onChange={() => {
                      setDraft((value) => ({ ...value, friction: item.id }));
                      setDirty(true);
                    }}
                  />
                  {item.label}
                </label>
              ))}
            </fieldset>
            <fieldset>
              <legend>Un aliado que probaré esta semana:</legend>
              {ALLIES.map((item) => (
                <label key={item.id}>
                  <input
                    type="radio"
                    name="ally"
                    checked={draft.ally === item.id}
                    onChange={() => {
                      setDraft((value) => ({ ...value, ally: item.id }));
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
          <section className="sh-review">
            <span>Tu experimento de una semana</span>
            <h3>{ALLIES.find((item) => item.id === draft.ally)?.label}</h3>
            <p>
              Lo probarás frente a:{' '}
              {FRICTIONS.find((item) => item.id === draft.friction)?.label.toLowerCase()}. Al final
              de la semana podrás decidir si te ayudó o necesitas otro ajuste.
            </p>
          </section>
        )}
      </ActivityFrame>
    </LessonShell>
  );
}
