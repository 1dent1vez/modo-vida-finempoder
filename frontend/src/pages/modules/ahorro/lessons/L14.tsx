import { useEffect, useRef, useState } from 'react';
import LessonShell from '../LessonShell';
import ActivityFrame, {
  ActivityLoadError,
  ActivityLoading,
} from '../../../../module-kit/activities/ActivityFrame';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import '../../../../module-kit/activities/classification.css';
import '../../../../module-kit/activities/savings-progress.css';

type Stage = 'intro' | 'quiz' | 'review' | 'complete';
type Draft = {
  version: 1;
  stage: Stage;
  question: number;
  pending: number | null;
  answers: Record<number, number>;
};
const KEY = 'savings_l14:quiz:v1';
const QUESTIONS = [
  {
    text: '¿Qué significa “pagarte primero”?',
    options: [
      'Apartar ahorro antes de distribuir el resto',
      'Comprar algo personal antes de pagar necesidades',
      'Invertir sin conservar liquidez',
    ],
    correct: 0,
    feedback:
      'Se trata de incluir el ahorro desde el inicio de la distribución, con un monto que puedas sostener.',
  },
  {
    text: '¿Qué criterio distingue mejor una opción formal de ahorro?',
    options: [
      'Siempre ofrece el mayor rendimiento',
      'Tiene una institución, contrato y registro verificables',
      'Nunca tiene costos ni condiciones',
    ],
    correct: 1,
    feedback:
      'Conviene verificar institución, producto, costos, acceso, contrato y protección aplicable.',
  },
  {
    text: 'Si tus ingresos varían, ¿qué estrategia puede adaptarse mejor?',
    options: [
      'Una regla flexible basada en cada ingreso',
      'La misma cantidad aunque falte para lo esencial',
      'Ahorrar solo cuando sobre por casualidad',
    ],
    correct: 0,
    feedback:
      'Una regla flexible puede adaptarse, siempre que proteja primero gastos esenciales y compromisos.',
  },
  {
    text: '¿Qué significa una proyección con interés compuesto?',
    options: [
      'Una promesa del saldo final',
      'Un escenario condicionado a tasa, plazo y aportaciones',
      'Una garantía para cualquier producto',
    ],
    correct: 1,
    feedback:
      'El resultado depende de supuestos y puede cambiar por comisiones, impuestos, inflación, tasa y mercado.',
  },
  {
    text: '¿Cómo verificas la protección de un depósito?',
    options: [
      'Memorizando una cifra en pesos',
      'Revisando institución, producto y límite vigente en la fuente oficial',
      'Confiando solo en el nombre comercial',
    ],
    correct: 1,
    feedback:
      'La ruta estable es institución, producto y límite vigente; la equivalencia puede cambiar.',
  },
] as const;
const initial = (): Draft => ({
  version: 1,
  stage: 'intro',
  question: 0,
  pending: null,
  answers: {},
});
function parse(raw: unknown): Draft | null {
  if (!raw || typeof raw !== 'object') return null;
  const v = raw as Draft;
  if (
    v.version !== 1 ||
    !['intro', 'quiz', 'review', 'complete'].includes(v.stage) ||
    !Number.isInteger(v.question) ||
    v.question < 0 ||
    v.question >= QUESTIONS.length ||
    (v.pending !== null && ![0, 1, 2].includes(v.pending)) ||
    !v.answers ||
    (['review', 'complete'].includes(v.stage) && Object.keys(v.answers).length !== QUESTIONS.length)
  )
    return null;
  return v;
}

export default function L14() {
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
            key: 'l14_quiz_result',
            data: {
              answers: next.answers,
              score: QUESTIONS.filter((item, index) => next.answers[index] === item.correct).length,
              total: QUESTIONS.length,
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
      if (mounted.current) setError('No pudimos guardar. Tus respuestas siguen en pantalla.');
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  if (loading)
    return (
      <LessonShell id="L14" title="Evalúa lo aprendido" completion={{ ready: false }}>
        <ActivityLoading />
      </LessonShell>
    );
  if (loadError)
    return (
      <LessonShell id="L14" title="Evalúa lo aprendido" completion={{ ready: false }}>
        <ActivityLoadError
          message="No pudimos recuperar tus respuestas."
          onRetry={() => setAttempt((value) => value + 1)}
        />
      </LessonShell>
    );
  const current = QUESTIONS[draft.question];
  const feedback = draft.pending === null ? null : draft.pending === current.correct;
  const score = QUESTIONS.filter((item, index) => draft.answers[index] === item.correct).length;
  const reviewing = draft.stage === 'review' || draft.stage === 'complete';
  const confirm = () => {
    if (draft.pending === null) return;
    const answers = { ...draft.answers, [draft.question]: draft.pending };
    const last = draft.question === QUESTIONS.length - 1;
    void persist({
      ...draft,
      answers,
      pending: null,
      question: last ? draft.question : draft.question + 1,
      stage: last ? 'review' : 'quiz',
    });
  };
  return (
    <LessonShell
      id="L14"
      title="Evalúa lo aprendido sobre ahorro"
      showGreeting={false}
      completion={{ ready: draft.stage === 'complete', score: score / QUESTIONS.length }}
    >
      <ActivityFrame
        label="Quiz de criterios de ahorro"
        className="savings-progress"
        busy={busy}
        title={
          reviewing
            ? 'Revisa lo que ya puedes decidir.'
            : draft.stage === 'quiz'
              ? 'Elige y recibe contexto inmediato.'
              : 'Comprueba cinco criterios útiles.'
        }
        description="Responde una situación por pantalla. Puedes reconsiderar antes de confirmar."
        progressLabel="Preguntas respondidas"
        progressValue={Object.keys(draft.answers).length}
        progressMax={QUESTIONS.length}
        stepLabel={
          reviewing
            ? 'Revisión final'
            : draft.stage === 'quiz'
              ? `Pregunta ${draft.question + 1} de ${QUESTIONS.length}`
              : 'Antes de empezar'
        }
        focusKey={`${draft.stage}-${draft.question}`}
        advice={{
          title:
            feedback === null
              ? 'Finni te acompaña'
              : feedback
                ? 'Criterio bien aplicado'
                : 'Mira la condición que falta',
          text:
            feedback === null
              ? 'Busca la opción que conserva capacidad de ajuste y pide verificar las condiciones reales.'
              : current.feedback,
          tone: feedback === null ? 'info' : feedback ? 'success' : 'review',
        }}
        adviceCue={cue}
        error={error}
        status={
          busy ? 'Guardando…' : dirty ? 'Respuesta sin confirmar.' : 'Tu avance está guardado.'
        }
        actions={
          <div className="spg-actions">
            {draft.stage === 'intro' && (
              <button
                className="ca-primary"
                onClick={() => void persist({ ...draft, stage: 'quiz' })}
              >
                Empezar evaluación
              </button>
            )}
            {draft.stage === 'quiz' && (
              <button
                className="ca-primary"
                disabled={draft.pending === null || busy}
                onClick={confirm}
              >
                {draft.question === QUESTIONS.length - 1
                  ? 'Confirmar y revisar'
                  : 'Confirmar respuesta'}
              </button>
            )}
            {draft.stage === 'review' && (
              <button
                className="ca-primary"
                onClick={() => void persist({ ...draft, stage: 'complete' }, true)}
              >
                Guardar resultado y terminar
              </button>
            )}
          </div>
        }
      >
        {draft.stage === 'intro' && (
          <section className="spg-concept">
            <article>
              <span>Formato</span>
              <strong>5 decisiones breves</strong>
              <p>Una pregunta por pantalla.</p>
            </article>
            <article>
              <span>Objetivo</span>
              <strong>Aplicar criterios</strong>
              <p>El puntaje muestra aprendizaje, no valor personal.</p>
            </article>
          </section>
        )}
        {draft.stage === 'quiz' && (
          <section className="spg-question">
            <h3>{current.text}</h3>
            {current.options.map((option, index) => (
              <button
                key={option}
                className={draft.pending === index ? 'is-selected' : ''}
                aria-pressed={draft.pending === index}
                onClick={() => {
                  setDraft((value) => ({ ...value, pending: index }));
                  setCue(option);
                  setDirty(true);
                }}
              >
                {option}
              </button>
            ))}
          </section>
        )}
        {reviewing && (
          <section className="spg-review">
            <span>Resultado</span>
            <h3>
              {score} de {QUESTIONS.length} criterios aplicados
            </h3>
            <p>
              Puedes volver a las lecciones cuando quieras. El resultado queda guardado solo al
              cerrar.
            </p>
          </section>
        )}
      </ActivityFrame>
    </LessonShell>
  );
}
