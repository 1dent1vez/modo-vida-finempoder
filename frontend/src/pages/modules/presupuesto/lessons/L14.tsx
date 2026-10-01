import { useEffect, useRef, useState } from 'react';
import LessonShell from '../LessonShell';
import ActivityFrame, { ActivityLoading } from '../../../../module-kit/activities/ActivityFrame';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import '../../../../module-kit/activities/classification.css';
import '../../../../module-kit/activities/emotional-spending.css';

type Pregunta = {
  texto: string;
  tipo: 'multiple' | 'verdadero_falso' | 'completar';
  opciones?: string[];
  correcta: number;
  explicacion: string;
  leccion: string;
};

// eslint-disable-next-line react-refresh/only-export-components -- questions exported for lesson contract tests
export const PREGUNTAS: Pregunta[] = [
  {
    texto: '¿Qué es el gasto hormiga?',
    tipo: 'multiple',
    opciones: [
      'Un gasto grande e imprevisto',
      'Una compra pequeña, recurrente y casi automática',
      'El ahorro mínimo mensual',
    ],
    correcta: 1,
    explicacion:
      'El gasto hormiga suele ser pequeño, recurrente y poco consciente. Al acumularse puede ocupar una parte relevante del presupuesto.',
    leccion: 'Lección 3',
  },
  {
    texto: 'Verdadero o Falso: "Un ingreso variable es menos valioso que uno fijo"',
    tipo: 'verdadero_falso',
    opciones: ['Verdadero', 'Falso'],
    correcta: 1,
    explicacion:
      'Falso. Ambos son igualmente válidos. La diferencia está en cómo los planeas, no en su valor.',
    leccion: 'Lección 2',
  },
  {
    texto: 'La regla 50-30-20 asigna al ahorro o pago de deudas:',
    tipo: 'multiple',
    opciones: ['10%', '30%', '20%'],
    correcta: 2,
    explicacion: '20% va a ahorro o pago de deudas. 50% a necesidades y 30% a deseos.',
    leccion: 'Lección 5',
  },
  {
    texto: 'Con $320 y 12 días para tu próximo ingreso, ¿qué priorizas primero?',
    tipo: 'multiple',
    opciones: [
      'La salida con amigos del sábado',
      'El transporte para llegar al trabajo o la escuela',
      'Renovar tu suscripción de streaming',
    ],
    correcta: 1,
    explicacion:
      'El transporte es una necesidad básica para llegar al trabajo o la escuela. Se prioriza sobre deseos o entretenimiento.',
    leccion: 'Lección 7',
  },
  {
    texto: 'Completa: Balance = Ingresos __ Gastos',
    tipo: 'completar',
    opciones: ['+ (más)', '- (menos)', '× (por)'],
    correcta: 1,
    explicacion:
      'Balance = Ingresos MENOS Gastos. Si da positivo es superávit; si da negativo, es déficit.',
    leccion: 'Lección 6',
  },
  {
    texto: 'El gasto emocional impulsivo se puede reducir preguntándose:',
    tipo: 'multiple',
    opciones: [
      '"¿Tengo suficiente saldo en mi tarjeta?"',
      '"¿Lo compraría si me sintiera bien?"',
      '"¿Está en oferta?"',
    ],
    correcta: 1,
    explicacion:
      'Preguntarse si lo comprarías sin el estado emocional ayuda a separar la necesidad real del impulso.',
    leccion: 'Lección 8',
  },
  {
    texto: 'Verdadero o Falso: "Un presupuesto imperfecto es mejor que ninguno"',
    tipo: 'verdadero_falso',
    opciones: ['Verdadero', 'Falso'],
    correcta: 0,
    explicacion:
      'Verdadero. Empezar con un presupuesto aproximado y mejorarlo es mejor que no tener ninguno.',
    leccion: 'Lección 12',
  },
  {
    texto: 'Una meta SMART es: Específica, Medible, Alcanzable, Relevante y ___',
    tipo: 'completar',
    opciones: ['Territorial', 'Temporal', 'Total'],
    correcta: 1,
    explicacion: 'T = Temporal: toda meta SMART tiene una fecha límite clara para lograrla.',
    leccion: 'Lección 9',
  },
  {
    texto: 'Sofía perdió su trabajo. ¿Cuál fue su primer paso?',
    tipo: 'multiple',
    opciones: [
      'Pedir un crédito de emergencia',
      'Revisar su presupuesto e identificar gastos prescindibles',
      'Llamar a sus papás para que le mandaran dinero',
    ],
    correcta: 1,
    explicacion:
      'Revisar el presupuesto primero es la decisión más inteligente: te da claridad antes de actuar.',
    leccion: 'Lección 10',
  },
  {
    texto: '¿Cuál herramienta es oficial de CONDUSEF?',
    tipo: 'multiple',
    opciones: ['Fintonic', 'Google Sheets', 'App Presupuesto Familiar'],
    correcta: 2,
    explicacion:
      'La App Presupuesto Familiar es oficial de CONDUSEF: gratuita, sin publicidad y sin pedir datos bancarios.',
    leccion: 'Lección 11',
  },
];

export default function L14() {
  const [index, setIndex] = useState(0);
  const [pending, setPending] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [stage, setStage] = useState<'quiz' | 'review' | 'complete'>('quiz');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    void lessonDataRepository
      .load<{
        index?: number;
        answers?: Record<number, number>;
        stage?: 'quiz' | 'review' | 'complete';
      }>('presupuesto', 'l14_quiz:v1')
      .then((saved) => {
        if (saved) {
          setIndex(Math.min(9, saved.index ?? 0));
          setAnswers(saved.answers ?? {});
          setStage(saved.stage ?? 'quiz');
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => {
      mounted.current = false;
    };
  }, []);
  const correctCount = PREGUNTAS.filter((q, i) => answers[i] === q.correcta).length;
  const score = Math.round((correctCount / PREGUNTAS.length) * 100);
  const q = PREGUNTAS[index];
  const feedback = pending === null ? null : pending === q.correcta;
  const save = async (
    nextIndex: number,
    nextAnswers: Record<number, number>,
    nextStage: 'quiz' | 'review' | 'complete',
  ) => {
    setBusy(true);
    setError(null);
    try {
      await lessonDataRepository.save('presupuesto', 'l14_quiz:v1', {
        index: nextIndex,
        answers: nextAnswers,
        stage: nextStage,
      });
      if (mounted.current) {
        setIndex(nextIndex);
        setAnswers(nextAnswers);
        setStage(nextStage);
        setPending(null);
      }
    } catch {
      if (mounted.current) setError('No pudimos guardar. Tu respuesta sigue en pantalla.');
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  const confirm = () => {
    if (pending === null) return;
    const next = { ...answers, [index]: pending };
    const last = index === PREGUNTAS.length - 1;
    void save(last ? index : index + 1, next, last ? 'review' : 'quiz');
  };
  if (loading)
    return (
      <LessonShell id="L14" title="Comprueba lo aprendido" completion={{ ready: false }}>
        <ActivityLoading />
      </LessonShell>
    );
  return (
    <LessonShell
      id="L14"
      title="Comprueba lo aprendido"
      showGreeting={false}
      completion={{ ready: stage === 'complete', score }}
    >
      <ActivityFrame
        label="Evaluación del módulo"
        className="emotional-spending"
        busy={busy}
        title={stage === 'quiz' ? 'Resuelve una pregunta a la vez.' : 'Revisa tu resultado.'}
        description="Puedes cambiar tu elección después de leer la explicación de Finni y antes de confirmarla."
        progressLabel="Preguntas respondidas"
        progressValue={Object.keys(answers).length}
        progressMax={PREGUNTAS.length}
        stepLabel={
          stage === 'quiz'
            ? `Pregunta ${index + 1} de ${PREGUNTAS.length} · ${q.leccion}`
            : 'Resultado y cierre'
        }
        focusKey={`${stage}-${index}`}
        advice={{
          title:
            feedback === null
              ? 'Piensa antes de confirmar'
              : feedback
                ? 'Concepto claro'
                : 'Aquí tienes la pista',
          text:
            feedback === null ? 'Elige una opción para recibir una explicación.' : q.explicacion,
          tone: feedback === null ? 'info' : feedback ? 'success' : 'review',
        }}
        adviceCue={pending === null ? null : `${index}-${pending}`}
        error={error}
        status={
          busy
            ? 'Guardando…'
            : stage === 'quiz' && pending !== null
              ? 'Elección sin confirmar.'
              : 'Tu avance está guardado.'
        }
        actions={
          <div className="es-actions">
            {stage === 'quiz' && (
              <button className="ca-primary" disabled={busy || pending === null} onClick={confirm}>
                {index === 9 ? 'Confirmar y revisar' : 'Confirmar respuesta'}
              </button>
            )}
            {stage === 'review' && (
              <button
                className="ca-primary"
                disabled={busy}
                onClick={() => void save(index, answers, 'complete')}
              >
                Guardar y terminar
              </button>
            )}
          </div>
        }
      >
        {stage === 'quiz' ? (
          <article className="es-card">
            <h3>{q.texto}</h3>
            <div className="es-options">
              {q.opciones?.map((option, optionIndex) => (
                <button
                  key={option}
                  className="es-option"
                  aria-pressed={pending === optionIndex}
                  onClick={() => setPending(optionIndex)}
                >
                  {option}
                </button>
              ))}
            </div>
          </article>
        ) : (
          <section className="es-card">
            <h3>
              {correctCount} de {PREGUNTAS.length} respuestas correctas
            </h3>
            <p>
              {score}% de aciertos. Las explicaciones forman parte de la práctica; el resultado
              sirve para decidir qué repasar.
            </p>
            {score < 100 && (
              <p>
                Revisa:{' '}
                {[
                  ...new Set(
                    PREGUNTAS.filter((item, i) => answers[i] !== item.correcta).map(
                      (item) => item.leccion,
                    ),
                  ),
                ].join(', ')}
                .
              </p>
            )}
          </section>
        )}
      </ActivityFrame>
    </LessonShell>
  );
}
