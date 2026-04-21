import { cn } from '@/lib/utils';
import { useState } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';

const HISTORIAS = [
  {
    nombre: 'Sofía',
    resumen: 'Perdió su trabajo part-time de golpe.',
    acciones: 'Revisó su presupuesto, identificó gastos prescindibles, activó su fondo de emergencias.',
  },
  {
    nombre: 'Andrés',
    resumen: 'No recibió su beca este mes por error administrativo.',
    acciones: 'Negoció plazos con servicios, buscó ingreso alternativo temporal, evitó contraer deudas.',
  },
  {
    nombre: 'Luisa',
    resumen: 'Su familia redujo la mesada.',
    acciones: 'Ajustó su regla 50-30-20, priorizó necesidades básicas, comunicó la situación abiertamente.',
  },
];

const CLAVES = [
  'Revisa tu presupuesto de inmediato al saber de la crisis.',
  'Identifica los gastos prescindibles antes de endeudarte.',
  'El fondo de emergencias existe exactamente para esto.',
  'Negociar plazos es mejor que no pagar.',
  'Buscar ingreso alternativo es siempre una opción válida.',
];

type QuizPreg = {
  pregunta: string;
  opciones: string[];
  correcta: number;
  ref: string;
};

const QUIZ: QuizPreg[] = [
  {
    pregunta: '¿Cuál fue lo primero que hizo Sofía al perder su trabajo?',
    opciones: ['Pedir dinero prestado', 'Revisar su presupuesto', 'Buscar un crédito'],
    correcta: 1,
    ref: 'Historia de Sofía',
  },
  {
    pregunta: '¿Qué evitó hacer Andrés durante la crisis?',
    opciones: ['Buscar ingreso alternativo', 'Negociar plazos', 'Contraer deudas'],
    correcta: 2,
    ref: 'Historia de Andrés',
  },
  {
    pregunta: 'Cuando el ingreso baja, ¿qué se debe priorizar primero?',
    opciones: ['Gastos de entretenimiento', 'Necesidades básicas', 'Suscripciones mensuales'],
    correcta: 1,
    ref: 'Historia de Luisa',
  },
  {
    pregunta: '¿Qué distingue a alguien financieramente preparado en una crisis?',
    opciones: ['Tener muchas deudas disponibles', 'Saber qué hacer cuando el ingreso baja', 'Gastar más para compensar'],
    correcta: 1,
    ref: 'Introducción de Finni',
  },
  {
    pregunta: 'Según el micro-podcast, las decisiones en crisis deben ser:',
    opciones: ['Lentas y muy analizadas', 'Rápidas y bien informadas', 'Delegadas a otra persona'],
    correcta: 1,
    ref: 'Narrador del podcast',
  },
];

export default function L10() {
  const [step, setStep] = useState(0);
  const [readProgress, setReadProgress] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showFeedback, setShowFeedback] = useState<Record<number, boolean>>({});

  const allRead = readProgress >= HISTORIAS.length;
  const quizDone = Object.keys(quizAnswers).length === QUIZ.length;
  const correctCount = QUIZ.filter((q, i) => quizAnswers[i] === q.correcta).length;
  const score = Math.round((correctCount / QUIZ.length) * 100);

  const markRead = () => {
    if (readProgress < HISTORIAS.length) {
      setReadProgress((p) => p + 1);
    }
  };

  const answerQuiz = (qi: number, oi: number) => {
    if (quizAnswers[qi] !== undefined) return;
    setQuizAnswers((prev) => ({ ...prev, [qi]: oi }));
    setShowFeedback((prev) => ({ ...prev, [qi]: true }));
  };

  const progressValue = step === 0 ? 0 : step === 1 ? 30 : step === 2 ? 65 : 100;

  return (
    <LessonShell
      id="L10"
      title="Finanzas en tiempos difíciles"
      completion={{ ready: quizDone, score }}
    >
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full bg-[var(--color-brand-warning)] transition-all" style={{ width: `${progressValue}%` }} />
        </div>

        {step === 0 && (
          <div className="space-y-3">
            <FinniMessage
              variant="coach"
              title="No todo mes es igual"
              message="A veces el ingreso baja, los gastos suben o pasan imprevistos. Lo que distingue a alguien financieramente preparado es saber qué hacer cuando eso pasa."
            />
            <FECard variant="flat" className="bg-[var(--color-brand-info)]/10 border border-[var(--color-brand-info)]">
              <p className="font-bold text-sm mb-2">🎙️ Micro-podcast — 3 historias reales</p>
              <p className="text-sm">
                Lee las historias de Sofía, Andrés y Luisa para ver cómo gestionaron una crisis financiera.
                Al final habrá un test de comprensión.
              </p>
            </FECard>
            <button
              className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm"
              onClick={() => setStep(1)}
            >
              Leer las historias →
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2">
              <div className="h-2 rounded-full bg-[var(--color-brand-info)] transition-all" style={{ width: `${(readProgress / HISTORIAS.length) * 100}%` }} />
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Historia {Math.min(readProgress + 1, HISTORIAS.length)}/{HISTORIAS.length}
            </p>

            {readProgress < HISTORIAS.length && (
              <div className="space-y-2" key={readProgress}>
                <FECard variant="flat" className="bg-[var(--color-brand-info)]/10 border-2 border-[var(--color-brand-info)]">
                  <p className="text-sm text-[var(--color-text-secondary)]">Historia {readProgress + 1}</p>
                  <p className="font-bold text-base">{HISTORIAS[readProgress].nombre}</p>
                  <p className="text-sm mt-2">{HISTORIAS[readProgress].resumen}</p>
                  <p className="text-sm mt-2 italic text-[var(--color-text-secondary)]">
                    Lo que hizo: {HISTORIAS[readProgress].acciones}
                  </p>
                </FECard>
                <button
                  className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm"
                  onClick={markRead}
                >
                  {readProgress < HISTORIAS.length - 1 ? 'Siguiente historia →' : 'Ver puntos clave →'}
                </button>
              </div>
            )}

            {allRead && (
              <div className="space-y-2">
                <p className="font-bold">5 puntos clave del podcast:</p>
                {CLAVES.map((c, i) => (
                  <FECard key={i} variant="flat" className="border border-[var(--color-brand-info)]/30">
                    <p className="text-sm">
                      <b>{i + 1}.</b> {c}
                    </p>
                  </FECard>
                ))}
                <FinniMessage
                  variant="coach"
                  title="Narrador"
                  message="En crisis financieras, las decisiones rápidas y bien informadas marcan la diferencia entre sobrevivir el mes y endeudarse."
                />
                <button
                  className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm"
                  onClick={() => setStep(2)}
                >
                  Responder el test →
                </button>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <p className="font-bold">
              Test de comprensión — 5 preguntas
            </p>
            {QUIZ.map((q, qi) => (
              <FECard
                key={qi}
                variant="flat"
                className={cn(
                  'border',
                  quizAnswers[qi] !== undefined
                    ? quizAnswers[qi] === q.correcta ? 'border-[var(--color-brand-success)]' : 'border-[var(--color-brand-error)]'
                    : 'border-[var(--color-neutral-200)]'
                )}
              >
                <p className="font-bold text-sm mb-2">
                  {qi + 1}. {q.pregunta}
                </p>
                <div className="space-y-1">
                  {q.opciones.map((op, oi) => {
                    const answered = quizAnswers[qi] !== undefined;
                    const isSelected = quizAnswers[qi] === oi;
                    const isCorrect = oi === q.correcta;
                    return (
                      <button
                        key={oi}
                        onClick={() => answerQuiz(qi, oi)}
                        disabled={answered}
                        className={cn(
                          'w-full text-left text-sm px-3 py-2 rounded-xl border transition-colors disabled:cursor-not-allowed',
                          answered && isCorrect ? 'bg-[var(--color-brand-success)] text-white border-[var(--color-brand-success)]'
                            : answered && isSelected && !isCorrect ? 'bg-[var(--color-brand-error)] text-white border-[var(--color-brand-error)]'
                            : isSelected ? 'bg-[var(--color-brand-warning)] text-white border-[var(--color-brand-warning)]'
                            : 'border-[var(--color-neutral-200)]'
                        )}
                      >
                        {op}
                      </button>
                    );
                  })}
                </div>
                {showFeedback[qi] && (
                  <p className="text-xs text-[var(--color-text-secondary)] mt-2 block">
                    {quizAnswers[qi] === q.correcta ? '✅ Correcto!' : '❌ Incorrecto.'} Ref: {q.ref}
                  </p>
                )}
              </FECard>
            ))}
            {quizDone && (
              <div className="space-y-2">
                <FECard
                  variant="flat"
                  className={cn('text-center', score >= 80 ? 'bg-[var(--color-brand-success)]/10' : 'bg-[var(--color-brand-warning)]/10')}
                >
                  <p className="font-bold text-base">{correctCount}/5 respuestas correctas</p>
                  <p className="text-sm">{score}% de aciertos</p>
                </FECard>
                <button
                  className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm"
                  onClick={() => setStep(3)}
                >
                  Ver aplicación personal →
                </button>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <FinniMessage
              variant="success"
              title="¡Lección completada!"
              message="Ahora sabes cómo reaccionar ante una crisis financiera. La preparación marca la diferencia."
            />
            <FECard variant="flat" className="border border-[var(--color-brand-warning)]">
              <p className="font-bold mb-2">2 acciones que puedes tomar hoy:</p>
              <div className="space-y-1">
                <p className="text-sm">1. Revisa si tienes al menos 1 mes de gastos guardado como fondo de emergencias.</p>
                <p className="text-sm">2. Identifica 1 gasto que podrías recortar si tu ingreso bajara de repente.</p>
              </div>
            </FECard>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-[var(--color-neutral-200)] font-semibold">CONDUSEF: Finanzas en Crisis</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-[var(--color-neutral-200)] font-semibold">condusef.gob.mx</span>
            </div>
          </div>
        )}
      </div>
    </LessonShell>
  );
}
