import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

const EXAMPLES = [
  { label: '$1,500', amount: 1500 },
  { label: '$2,500', amount: 2500 },
  { label: '$3,000', amount: 3000 },
  { label: '$5,000', amount: 5000 },
];

export default function L05() {
  const [step, setStep] = useState(0);
  const [income, setIncome] = useState(2500);
  const [incomeText, setIncomeText] = useState('2500');
  const [necesidades, setNecesidades] = useState(50);
  const [deseos, setDeseos] = useState(30);
  const [ahorro, setAhorro] = useState(20);
  const [interacted, setInteracted] = useState(false);

  const total = necesidades + deseos + ahorro;
  const overBudget = total > 100;

  const diff = Math.abs(necesidades - 50) + Math.abs(deseos - 30) + Math.abs(ahorro - 20);
  const score = Math.max(0, Math.round(100 - diff * 2));

  const montoNecesidades = Math.round((income * necesidades) / 100);
  const montoDeseos = Math.round((income * deseos) / 100);
  const montoAhorro = Math.round((income * ahorro) / 100);

  const handleNecesidades = (v: number) => {
    setNecesidades(v);
    const rem = 100 - v;
    const d = Math.min(deseos, rem);
    setDeseos(d);
    setAhorro(Math.max(0, rem - d));
    setInteracted(true);
  };

  const handleDeseos = (v: number) => {
    setDeseos(v);
    setAhorro(Math.max(0, 100 - necesidades - v));
    setInteracted(true);
  };

  const handleAhorro = (v: number) => {
    setAhorro(v);
    setInteracted(true);
  };

  useEffect(() => {
    if (interacted) {
      void lessonDataRepository.save('presupuesto', 'l5_distribution', {
        income,
        necesidades,
        deseos,
        ahorro,
        score,
      });
    }
  }, [interacted, income, necesidades, deseos, ahorro, score]);

  const canComplete = interacted && !overBudget;
  const progressValue = step === 0 ? 0 : step === 1 ? 40 : 100;

  return (
    <LessonShell
      id="L05"
      title="La regla 50-30-20: divide y vencerás"
      completion={{ ready: canComplete, score }}
    >
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full bg-[var(--color-brand-warning)] transition-all" style={{ width: `${progressValue}%` }} />
        </div>

        {step === 0 && (
          <div className="space-y-3">
            <FECard variant="flat" className="text-center py-6">
              <p className="text-4xl">💵</p>
              <p className="font-bold text-base mt-2">
                Tu ingreso dividido en 3 partes
              </p>
            </FECard>
            <FinniMessage
              variant="coach"
              title="La regla 50-30-20"
              message="Existe una regla simple que puede cambiar tu forma de ver el dinero. Aplica aunque ganes $1,500 o $5,000."
            />
            <div className="space-y-2">
              {[
                { pct: '50%', color: 'var(--color-brand-success)', label: 'Necesidades', desc: 'Renta (si aplica), comida, transporte, materiales escolares.' },
                { pct: '30%', color: 'var(--color-brand-warning)', label: 'Deseos', desc: 'Salidas, entretenimiento, ropa, apps.' },
                { pct: '20%', color: 'var(--color-brand-info)', label: 'Ahorro o deudas', desc: 'Fondo de emergencias, meta de ahorro, pago de crédito.' },
              ].map((b) => (
                <FECard key={b.label} variant="flat" style={{ borderColor: b.color }} className="border-2">
                  <div className="flex items-center gap-3">
                    <p className="text-2xl font-bold min-w-12" style={{ color: b.color }}>{b.pct}</p>
                    <div>
                      <p className="font-bold">{b.label}</p>
                      <p className="text-sm text-[var(--color-text-secondary)]">{b.desc}</p>
                    </div>
                  </div>
                </FECard>
              ))}
            </div>
            <FinniMessage
              variant="coach"
              title="Ojo"
              message="Estos porcentajes son un punto de partida. Si vives con tus papás, quizás tus necesidades son menores y puedes ahorrar más. Adáptala a tu realidad."
            />
            <button
              className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm"
              onClick={() => setStep(1)}
            >
              ¡A personalizar! →
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <p className="font-bold text-base">Tu distribución personalizada</p>

            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="font-bold text-sm mb-2">¿Cuánto recibes al mes? (pesos)</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {EXAMPLES.map((e) => (
                  <button
                    key={e.label}
                    onClick={() => { setIncome(e.amount); setIncomeText(String(e.amount)); }}
                    className={cn(
                      'px-3 py-1 rounded-lg text-sm font-semibold border transition-colors',
                      income === e.amount && incomeText === String(e.amount)
                        ? 'bg-[var(--color-brand-warning)] text-white border-[var(--color-brand-warning)]'
                        : 'border-[var(--color-brand-warning)] text-[var(--color-brand-warning)]'
                    )}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--color-text-secondary)]">O ingresa tu monto</label>
                <input
                  type="number"
                  value={incomeText}
                  onChange={(e) => {
                    setIncomeText(e.target.value);
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v) && v > 0) setIncome(v);
                  }}
                  min={0}
                  className="w-full rounded-xl border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
                />
              </div>
            </FECard>

            {overBudget && (
              <FECard variant="flat" className="bg-[var(--color-brand-error)]/10 border border-[var(--color-brand-error)]">
                <p className="font-bold text-sm text-[var(--color-brand-error)]">
                  ⚠️ ¡Ojo! Estás planeando gastar más de lo que tienes. Total: {necesidades + deseos + ahorro}%
                </p>
              </FECard>
            )}

            <FECard variant="flat" className="border border-[var(--color-brand-success)]">
              <div className="flex justify-between">
                <p className="font-bold text-sm">🟢 Necesidades</p>
                <p className="font-bold text-sm">{necesidades}% = ${montoNecesidades.toLocaleString()}</p>
              </div>
              <input
                type="range"
                value={necesidades}
                onChange={(e) => handleNecesidades(Number(e.target.value))}
                min={0}
                max={100}
                className="w-full accent-[var(--color-brand-success)] mt-2"
                aria-label="Porcentaje necesidades"
              />
            </FECard>

            <FECard variant="flat" className="border border-[var(--color-brand-warning)]">
              <div className="flex justify-between">
                <p className="font-bold text-sm">🟡 Deseos</p>
                <p className="font-bold text-sm">{deseos}% = ${montoDeseos.toLocaleString()}</p>
              </div>
              <input
                type="range"
                value={deseos}
                onChange={(e) => handleDeseos(Number(e.target.value))}
                min={0}
                max={100 - necesidades}
                className="w-full accent-[var(--color-brand-warning)] mt-2"
                aria-label="Porcentaje deseos"
              />
            </FECard>

            <FECard variant="flat" className="border border-[var(--color-brand-info)]">
              <div className="flex justify-between">
                <p className="font-bold text-sm">🔵 Ahorro</p>
                <p className="font-bold text-sm">{ahorro}% = ${montoAhorro.toLocaleString()}</p>
              </div>
              <input
                type="range"
                value={ahorro}
                onChange={(e) => handleAhorro(Number(e.target.value))}
                min={0}
                max={100 - necesidades - deseos}
                className="w-full accent-[var(--color-brand-info)] mt-2"
                aria-label="Porcentaje ahorro"
              />
            </FECard>

            <FECard
              variant="flat"
              className={total === 100 ? 'bg-[var(--color-brand-success)]/10' : 'bg-[var(--color-brand-warning)]/10'}
            >
              <p className="font-bold text-sm">
                Total: {necesidades + deseos + ahorro}% {total === 100 ? '✅' : '⚠️'}
              </p>
            </FECard>

            {interacted && !overBudget && (
              <FinniMessage
                variant="success"
                title="¡Tu punto de partida listo!"
                message="En la lección 12 lo convertiremos en tu presupuesto real."
              />
            )}
          </div>
        )}
      </div>
    </LessonShell>
  );
}
