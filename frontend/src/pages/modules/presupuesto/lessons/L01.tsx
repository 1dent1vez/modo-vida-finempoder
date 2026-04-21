import { cn } from '@/lib/utils';
import { useState } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';

type Classification = 'planned' | 'unplanned' | null;

const WEEK_EVENTS = [
  { day: 'Lunes', desc: 'Cobro beca/mesada', amount: 2000, isIncome: true },
  { day: 'Martes', desc: 'Café + transporte', amount: -75 },
  { day: 'Miércoles', desc: 'Comida rápida + Netflix', amount: -219 },
  { day: 'Jueves', desc: 'Salida con amigos', amount: -350 },
  { day: 'Viernes', desc: 'Impresiones + snack', amount: -95 },
  { day: 'Sábado', desc: 'Gastos varios', amount: -200 },
  { day: 'Domingo', desc: 'Gastos varios', amount: -200 },
];

const GASTOS = [
  { id: 'cafe', label: 'Café $45 + transporte $30' },
  { id: 'comida', label: 'Comida rápida $120' },
  { id: 'netflix', label: 'Netflix $99' },
  { id: 'amigos', label: 'Salida con amigos $350' },
  { id: 'impresiones', label: 'Impresiones $60' },
  { id: 'snack', label: 'Snack $35' },
  { id: 'varios', label: 'Gastos varios $400' },
];

export default function L01() {
  const [step, setStep] = useState(0);
  const [quincenaAnswer, setQuincenaAnswer] = useState<string | null>(null);
  const [classifications, setClassifications] = useState<Record<string, Classification>>({});

  const allClassified = GASTOS.every((g) => classifications[g.id] !== undefined && classifications[g.id] !== null);

  const classify = (id: string, val: Classification) => {
    setClassifications((prev) => ({ ...prev, [id]: val }));
  };

  let balance = 0;
  const timeline = WEEK_EVENTS.map((e) => {
    balance += e.amount;
    return { ...e, balance };
  });
  const maxBalance = 2000;

  const progressValue = step === 0 ? 0 : step === 1 ? 33 : step === 2 ? 66 : 100;

  return (
    <LessonShell
      id="L01"
      title="¿A dónde se fue mi quincena?"
      completion={{ ready: allClassified }}
    >
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full bg-[var(--color-brand-warning)] transition-all" style={{ width: `${progressValue}%` }} />
        </div>

        {step === 0 && (
          <div className="space-y-3">
            <FinniMessage
              variant="coach"
              title="¡Hola! Soy Finni 👋"
              message="Oye… ¿ya es martes y tu tarjeta dice $47? Tranqui, a casi todos nos ha pasado. Hoy vamos a resolver el misterio más común entre universitarios: ¿a dónde se va el dinero?"
            />
            <FECard variant="flat" className="border border-[var(--color-brand-warning)]">
              <p className="font-bold text-base mb-2">
                ¿Cuánto tiempo te duró la última quincena o semana?
              </p>
              <div className="space-y-2">
                {['Menos de 3 días', 'Una semana', 'Dos semanas', 'Me sobró algo'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setQuincenaAnswer(opt)}
                    className={cn(
                      'w-full text-left px-4 py-2 rounded-xl text-sm font-semibold border transition-colors',
                      quincenaAnswer === opt
                        ? 'bg-[var(--color-brand-warning)] text-white border-[var(--color-brand-warning)]'
                        : 'border-[var(--color-brand-warning)] text-[var(--color-brand-warning)]'
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </FECard>
            {quincenaAnswer && (
              <button
                className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm"
                onClick={() => setStep(1)}
              >
                Ver cómo se va el dinero →
              </button>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <p className="font-bold text-base">Una semana en tu bolsillo 📅</p>
            <div className="space-y-2">
              {timeline.map((event) => (
                <FECard key={event.day} variant="flat" className="p-3">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-bold text-sm">{event.day}</p>
                    <p className={cn('font-bold text-sm', event.isIncome ? 'text-[var(--color-brand-success)]' : 'text-[var(--color-brand-error)]')}>
                      {event.amount > 0 ? `+$${event.amount}` : `-$${Math.abs(event.amount)}`}
                    </p>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)]">{event.desc}</p>
                  <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mt-2">
                    <div
                      className={cn('h-2 rounded-full transition-all', event.balance > 500 ? 'bg-[var(--color-brand-success)]' : event.balance > 100 ? 'bg-[var(--color-brand-warning)]' : 'bg-[var(--color-brand-error)]')}
                      style={{ width: `${Math.max(0, (event.balance / maxBalance) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)]">Saldo: ${event.balance}</p>
                </FECard>
              ))}
            </div>
            <FinniMessage
              variant="coach"
              title="¿Ves el patrón?"
              message="Gastos pequeños, gastos grandes, gastos que ni recuerdas. Y de repente: cero."
            />
            <button
              className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm"
              onClick={() => setStep(2)}
            >
              ¿Cuáles planeaste? →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <FinniMessage
              variant="coach"
              title="¿Reconoces alguno?"
              message="¿Cuántos de estos gastos planeaste y cuántos llegaron solos? Toca cada uno y clasifícalo."
            />
            <div className="space-y-2">
              {GASTOS.map((g) => (
                <FECard key={g.id} variant="flat" className="p-3 border border-[var(--color-neutral-200)]">
                  <p className="font-semibold text-sm mb-2">{g.label}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => classify(g.id, 'planned')}
                      className={cn(
                        'px-3 py-1 rounded-full text-sm font-semibold border transition-colors',
                        classifications[g.id] === 'planned'
                          ? 'bg-[var(--color-brand-success)] text-white border-[var(--color-brand-success)]'
                          : 'border-[var(--color-neutral-200)] text-[var(--color-text-secondary)]'
                      )}
                    >
                      Lo planeé ✓
                    </button>
                    <button
                      onClick={() => classify(g.id, 'unplanned')}
                      className={cn(
                        'px-3 py-1 rounded-full text-sm font-semibold border transition-colors',
                        classifications[g.id] === 'unplanned'
                          ? 'bg-[var(--color-brand-warning)] text-white border-[var(--color-brand-warning)]'
                          : 'border-[var(--color-neutral-200)] text-[var(--color-text-secondary)]'
                      )}
                    >
                      No lo planeé
                    </button>
                  </div>
                </FECard>
              ))}
            </div>
            {allClassified && (
              <button
                className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm"
                onClick={() => setStep(3)}
              >
                Ver el dato clave →
              </button>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <FECard variant="flat" className="bg-[var(--color-brand-warning)]/10 border-2 border-[var(--color-brand-warning)] text-center py-6">
              <p className="text-4xl mb-2">68%</p>
              <p className="font-bold">
                de los universitarios no sabe exactamente cuánto gasta al mes.
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">Fuente: CONDUSEF</p>
            </FECard>
            <FECard variant="flat" className="text-center py-4">
              <p className="font-bold text-base italic text-[var(--color-brand-warning)]">
                "Un presupuesto no te quita libertad. Te da claridad."
              </p>
            </FECard>
            <FinniMessage
              variant="success"
              title="¿Ves el patrón?"
              message="Cuando no planeamos, el dinero planea por nosotros. En las siguientes lecciones vamos a cambiar eso."
            />
          </div>
        )}
      </div>
    </LessonShell>
  );
}
