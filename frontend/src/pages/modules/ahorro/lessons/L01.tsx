import { useEffect, useRef, useState } from 'react';
import LessonShell from '../LessonShell';
import ActivityFrame, {
  ActivityLoadError,
  ActivityLoading,
} from '../../../../module-kit/activities/ActivityFrame';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import '../../../../module-kit/activities/classification.css';
import '../../../../module-kit/activities/savings-first.css';

type Stage = 'compare' | 'project' | 'quiz' | 'review' | 'complete';
type Draft = {
  version: 1;
  stage: Stage;
  weekly: number;
  question: number;
  pending: number | null;
  answers: Record<number, number>;
};
const KEY = 'savings_l1:first:v1';
const QUESTIONS = [
  {
    text: '¿Qué significa “ahorrar primero” en esta práctica?',
    options: [
      'Guardar únicamente lo que sobre',
      'Separar una cantidad planeada antes de otros gastos ajustables',
      'Evitar cualquier gasto durante el mes',
    ],
    correct: 1,
    feedback:
      'La intención es asignar una cantidad desde el inicio, sin descuidar necesidades ni compromisos.',
  },
  {
    text: '¿Qué muestra esta proyección?',
    options: [
      'Una garantía de rendimiento',
      'Una suma simple si se mantiene la aportación',
      'El saldo real de una cuenta bancaria',
    ],
    correct: 1,
    feedback: 'La cifra suma aportaciones; no incluye intereses, inflación, pausas ni comisiones.',
  },
] as const;
const initial = (): Draft => ({
  version: 1,
  stage: 'compare',
  weekly: 100,
  question: 0,
  pending: null,
  answers: {},
});
function parse(raw: unknown): Draft | null {
  if (!raw || typeof raw !== 'object') return null;
  const v = raw as Draft;
  if (
    v.version !== 1 ||
    !['compare', 'project', 'quiz', 'review', 'complete'].includes(v.stage) ||
    !Number.isFinite(v.weekly) ||
    v.weekly < 50 ||
    v.weekly > 1000 ||
    !Number.isInteger(v.question) ||
    v.question < 0 ||
    v.question > 1 ||
    (v.pending !== null && ![0, 1, 2].includes(v.pending)) ||
    !v.answers ||
    (['review', 'complete'].includes(v.stage) && Object.keys(v.answers).length !== 2)
  )
    return null;
  return v;
}

export default function L01() {
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
            key: 'l1_savings_first',
            data: {
              weekly: next.weekly,
              answers: next.answers,
              projectionType: 'simple-contributions',
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
      if (mounted.current) setError('No pudimos guardar. Tu elección sigue en pantalla.');
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  const q = QUESTIONS[draft.question];
  const feedback = draft.pending === null ? null : draft.pending === q.correct;
  const reviewing = draft.stage === 'review' || draft.stage === 'complete';
  const confirmQuestion = () => {
    if (draft.pending === null) return;
    const answers = { ...draft.answers, [draft.question]: draft.pending };
    const last = draft.question === 1;
    void persist({
      ...draft,
      answers,
      pending: null,
      question: last ? 1 : 1,
      stage: last ? 'review' : 'quiz',
    });
  };
  if (loading)
    return (
      <LessonShell id="L01" title="Ahorro primero" completion={{ ready: false }}>
        <ActivityLoading />
      </LessonShell>
    );
  if (loadError)
    return (
      <LessonShell id="L01" title="Ahorro primero" completion={{ ready: false }}>
        <ActivityLoadError
          message="No pudimos recuperar tu avance. Revisa tu conexión e inténtalo de nuevo."
          onRetry={() => setLoadAttempt((value) => value + 1)}
        />
      </LessonShell>
    );
  return (
    <LessonShell
      id="L01"
      title="Ahorro primero: el hábito que cambia todo"
      showGreeting={false}
      completion={{ ready: draft.stage === 'complete', score: 100 }}
    >
      <ActivityFrame
        label="Práctica de ahorro primero"
        className="savings-first"
        busy={busy}
        title={
          reviewing
            ? 'Revisa tu punto de partida.'
            : draft.stage === 'quiz'
              ? 'Comprueba la idea principal.'
              : draft.stage === 'project'
                ? 'Explora una aportación posible.'
                : 'Compara el orden de las decisiones.'
        }
        description="Trabaja con un ejemplo y una proyección simple; puedes cambiar el monto."
        progressLabel="Etapas completadas"
        progressValue={
          draft.stage === 'compare'
            ? 0
            : draft.stage === 'project'
              ? 1
              : draft.stage === 'quiz'
                ? 2 + Object.keys(draft.answers).length
                : 4
        }
        progressMax={4}
        stepLabel={
          reviewing
            ? 'Paso 4 de 4 · Revisar'
            : draft.stage === 'quiz'
              ? `Paso 3 de 4 · Pregunta ${draft.question + 1} de 2`
              : draft.stage === 'project'
                ? 'Paso 2 de 4 · Proyectar'
                : 'Paso 1 de 4 · Comparar'
        }
        focusKey={`${draft.stage}-${draft.question}`}
        advice={{
          title:
            feedback === null
              ? 'La constancia admite ajustes'
              : feedback
                ? 'Lectura correcta'
                : 'Mira el matiz',
          text:
            feedback === null
              ? 'Separar primero ayuda cuando la cantidad respeta tus necesidades y puede sostenerse.'
              : q.feedback,
          tone: feedback === null ? 'info' : feedback ? 'success' : 'review',
        }}
        adviceCue={cue}
        error={error}
        status={busy ? 'Guardando…' : dirty ? 'Cambios sin guardar.' : 'Tu avance está guardado.'}
        actions={
          <div className="sf-actions">
            {draft.stage === 'compare' && (
              <button
                className="ca-primary"
                onClick={() => void persist({ ...draft, stage: 'project' })}
              >
                Explorar una aportación
              </button>
            )}
            {draft.stage === 'project' && (
              <button
                className="ca-primary"
                onClick={() => void persist({ ...draft, stage: 'quiz' })}
              >
                Comprobar lo aprendido
              </button>
            )}
            {draft.stage === 'quiz' && (
              <button
                className="ca-primary"
                disabled={busy || draft.pending === null}
                onClick={confirmQuestion}
              >
                {draft.question === 1 ? 'Confirmar y revisar' : 'Confirmar respuesta'}
              </button>
            )}
            {draft.stage === 'review' && (
              <>
                <button
                  className="sf-secondary"
                  onClick={() => {
                    setDraft((v) => ({ ...v, stage: 'project' }));
                    setDirty(true);
                  }}
                >
                  Ajustar monto
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
          <section className="sf-card">
            <h3>Ejemplo: llegan $2,000</h3>
            <div className="sf-compare">
              <div>
                <strong>Gastar y esperar</strong>
                <p>El ahorro depende de que quede dinero al final.</p>
              </div>
              <div>
                <strong>Separar una cantidad planeada</strong>
                <p>El resto disponible queda claro desde el inicio.</p>
              </div>
            </div>
          </section>
        )}
        {draft.stage === 'project' && (
          <section className="sf-card">
            <label htmlFor="weekly-saving">
              <strong>Aportación semanal: ${draft.weekly}</strong>
            </label>
            <input
              id="weekly-saving"
              type="range"
              min="50"
              max="1000"
              step="50"
              value={draft.weekly}
              onChange={(e) => {
                setDraft((v) => ({ ...v, weekly: Number(e.target.value) }));
                setDirty(true);
              }}
            />
            <div className="sf-projection">
              {[13, 26, 52].map((weeks) => (
                <div key={weeks}>
                  <strong>${(draft.weekly * weeks).toLocaleString()}</strong>
                  <span>{weeks} semanas</span>
                </div>
              ))}
            </div>
            <p>Es una suma simple de aportaciones, sin rendimiento.</p>
          </section>
        )}
        {draft.stage === 'quiz' && (
          <section className="sf-card">
            <h3>{q.text}</h3>
            <div className="sf-options">
              {q.options.map((option, index) => (
                <button
                  key={option}
                  className="sf-option"
                  aria-pressed={draft.pending === index}
                  onClick={() => {
                    setDraft((v) => ({ ...v, pending: index }));
                    setDirty(true);
                    setCue(`${draft.question}-${index}`);
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </section>
        )}
        {reviewing && (
          <section className="sf-card">
            <h3>${draft.weekly} por semana</h3>
            <p>
              En 52 semanas sumarían ${(draft.weekly * 52).toLocaleString()} si mantuvieras todas
              las aportaciones. Puedes ajustar la cantidad cuando cambie tu situación.
            </p>
          </section>
        )}
      </ActivityFrame>
    </LessonShell>
  );
}
