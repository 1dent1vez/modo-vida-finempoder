import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

type IncomeType = 'fijo' | 'variable';

const ITEMS: { id: string; label: string; correct: IncomeType }[] = [
  { id: 'pronabes', label: 'Beca PRONABES', correct: 'fijo' },
  { id: 'mesada', label: 'Mesada semanal de papás', correct: 'fijo' },
  { id: 'apuntes', label: 'Venta de apuntes', correct: 'variable' },
  { id: 'cafe', label: 'Trabajo en café escolar', correct: 'fijo' },
  { id: 'cumple', label: 'Regalo de cumpleaños', correct: 'variable' },
  { id: 'logo', label: 'Pago por diseño de logo', correct: 'variable' },
  { id: 'fonacot', label: 'FONACOT de papás', correct: 'variable' },
  { id: 'tutorias', label: 'Ingreso por tutorías', correct: 'variable' },
];

const FEEDBACK: Record<string, string> = {
  pronabes: 'La beca PRONABES llega cada mes con monto fijo.',
  mesada: 'La mesada regular es predecible: entra igual cada semana.',
  apuntes: 'Las ventas varían según la demanda. ¡Es variable!',
  cafe: 'Un trabajo con horario y sueldo definido es fijo.',
  cumple: 'Los regalos no llegan todos los meses, son variables.',
  logo: 'El pago por proyecto cambia. Es ingreso variable.',
  fonacot: 'El crédito FONACOT puede variar con cuotas distintas.',
  tutorias: 'Las tutorías dependen de cuántos alumnos consigas.',
};

export default function L02() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, IncomeType | null>>({});
  const [lastFeedback, setLastFeedback] = useState<{ id: string; correct: boolean } | null>(null);

  const assigned = Object.values(answers).filter(Boolean).length;
  const allDone = ITEMS.every((item) => answers[item.id] !== undefined);
  const correctCount = ITEMS.filter((item) => answers[item.id] === item.correct).length;
  const score = Math.round((correctCount / ITEMS.length) * 100);

  const classify = (type: IncomeType) => {
    if (!selected) return;
    const item = ITEMS.find((i) => i.id === selected);
    if (!item) return;
    const isCorrect = item.correct === type;
    setAnswers((prev) => ({ ...prev, [selected]: type }));
    setLastFeedback({ id: selected, correct: isCorrect });
    setSelected(null);
  };

  useEffect(() => {
    if (allDone) {
      void lessonDataRepository.save('presupuesto', 'l2_incomes', {
        items: ITEMS.map((i) => ({ id: i.id, label: i.label, type: answers[i.id] })),
        correctCount,
        score,
      });
    }
  }, [allDone, answers, correctCount, score]);

  const unassigned = ITEMS.filter((i) => answers[i.id] === undefined);
  const progressValue = step === 0 ? 0 : step === 1 ? 40 : 100;

  return (
    <LessonShell
      id="L02"
      title="Tu dinero tiene nombre: ingresos fijos y variables"
      completion={{ ready: allDone, score }}
    >
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full bg-[var(--color-brand-warning)] transition-all" style={{ width: `${progressValue}%` }} />
        </div>

        {step === 0 && (
          <div className="space-y-3">
            <FinniMessage
              variant="coach"
              title="Finni explica 💡"
              message="Antes de hacer un presupuesto, necesitas saber con qué cuentas. ¿Toda tu lana llega el mismo día y en la misma cantidad? ¿O depende del mes?"
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <FECard variant="flat" className="flex-1 border-2 border-[var(--color-brand-success)]">
                <p className="font-bold text-base mb-2">📅 Ingresos Fijos</p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Llegan con regularidad y en cantidad conocida: beca mensual, mesada, trabajo con sueldo fijo.
                </p>
              </FECard>
              <FECard variant="flat" className="flex-1 border-2 border-[var(--color-brand-warning)]">
                <p className="font-bold text-base mb-2">📊 Ingresos Variables</p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Llegan a veces sí, a veces no, o en cantidades distintas: freelance, ventas, propinas, proyectos.
                </p>
              </FECard>
            </div>
            <FinniMessage
              variant="coach"
              title="Clave"
              message="Ambos son válidos. La diferencia es cómo los planeas."
            />
            <button
              className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm"
              onClick={() => setStep(1)}
            >
              ¡A clasificar! →
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm">
              Toca una tarjeta y luego elige si es <b>Fijo</b> o <b>Variable</b>.
            </p>
            <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2">
              <div className="h-2 rounded-full bg-[var(--color-brand-warning)] transition-all" style={{ width: `${(assigned / ITEMS.length) * 100}%` }} />
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {assigned}/{ITEMS.length} clasificados
            </p>

            {unassigned.length > 0 && (
              <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
                <p className="font-bold text-sm mb-3">Por clasificar:</p>
                <div className="flex flex-wrap gap-2">
                  {unassigned.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelected(selected === item.id ? null : item.id)}
                      className={cn(
                        'px-3 py-2 rounded-full text-sm font-semibold border transition-colors min-h-9',
                        selected === item.id
                          ? 'bg-[var(--color-brand-warning)] text-white border-[var(--color-brand-warning)]'
                          : 'border-[var(--color-neutral-200)] text-[var(--color-text-secondary)]'
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </FECard>
            )}

            {selected && (
              <div className="flex gap-2">
                <button
                  className="flex-1 min-h-11 bg-[var(--color-brand-success)] text-white rounded-xl font-bold text-sm"
                  onClick={() => classify('fijo')}
                >
                  📅 Fijo
                </button>
                <button
                  className="flex-1 min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-bold text-sm"
                  onClick={() => classify('variable')}
                >
                  📊 Variable
                </button>
              </div>
            )}

            {lastFeedback && (
              <FECard
                variant="flat"
                className={cn(
                  'border',
                  lastFeedback.correct
                    ? 'bg-[var(--color-brand-success)]/10 border-[var(--color-brand-success)]'
                    : 'bg-[var(--color-brand-warning)]/10 border-[var(--color-brand-warning)]'
                )}
              >
                <p className="font-bold text-sm">{lastFeedback.correct ? '✅ Correcto' : '⚠️ Casi'}</p>
                <p className="text-sm">{FEEDBACK[lastFeedback.id]}</p>
              </FECard>
            )}

            {Object.keys(answers).length > 0 && (
              <div className="space-y-2">
                {(['fijo', 'variable'] as IncomeType[]).map((type) => {
                  const items = ITEMS.filter((i) => answers[i.id] === type);
                  if (items.length === 0) return null;
                  return (
                    <FECard
                      key={type}
                      variant="flat"
                      className={type === 'fijo' ? 'bg-[var(--color-brand-success)]/10' : 'bg-[var(--color-brand-warning)]/10'}
                    >
                      <p className="font-bold text-sm mb-2">
                        {type === 'fijo' ? '📅 Fijos' : '📊 Variables'}:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {items.map((i) => (
                          <span key={i.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-[var(--color-neutral-200)] font-semibold">
                            {i.label}
                          </span>
                        ))}
                      </div>
                    </FECard>
                  );
                })}
              </div>
            )}

            {allDone && (
              <div className="space-y-2">
                <FECard variant="flat" className="bg-[var(--color-brand-success)]/10 border-2 border-[var(--color-brand-success)] text-center">
                  <p className="font-bold text-base">Ingresos Clasificados ✓</p>
                  <p className="font-bold">
                    {correctCount}/8 correctos ({score}%)
                  </p>
                </FECard>
                <FinniMessage
                  variant="success"
                  title="¡Bien hecho!"
                  message="Conocer tus ingresos es el primer paso. En la Lección 12 usaremos esta info para tu presupuesto real."
                />
              </div>
            )}
          </div>
        )}
      </div>
    </LessonShell>
  );
}
