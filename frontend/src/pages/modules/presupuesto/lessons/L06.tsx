import { useState } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';

const INGRESOS_ROBERTO = [
  { label: 'Beca PRONABES', monto: 1800 },
  { label: 'Mesada de papás', monto: 800 },
  { label: 'Tutorías (este mes)', monto: 400 },
];

const GASTOS_ROBERTO = [
  { label: 'Comida', monto: 850 },
  { label: 'Transporte', monto: 320 },
  { label: 'Materiales', monto: 180 },
  { label: 'Entretenimiento', monto: 650 },
  { label: 'Otros', monto: 280 },
];

const TOTAL_INGRESOS = INGRESOS_ROBERTO.reduce((a, i) => a + i.monto, 0);
const TOTAL_GASTOS = GASTOS_ROBERTO.reduce((a, g) => a + g.monto, 0);
const BALANCE = TOTAL_INGRESOS - TOTAL_GASTOS;

export default function L06() {
  const [step, setStep] = useState(0);
  const [pasoRoberto, setPasoRoberto] = useState(0);

  const allStepsDone = pasoRoberto >= 3;
  const progressValue = step === 0 ? 0 : step === 1 ? 40 : 100;

  return (
    <LessonShell
      id="L06"
      title="¿Quedaste en números rojos? Calcula tu balance mensual"
      completion={{ ready: allStepsDone }}
    >
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full bg-[var(--color-brand-warning)] transition-all" style={{ width: `${progressValue}%` }} />
        </div>

        {step === 0 && (
          <div className="space-y-3">
            <FinniMessage
              variant="coach"
              title="Finni con calculadora 🧮"
              message="¿Sabes si este mes gastaste más de lo que ganaste? No asumir, calcular. Esa es la diferencia entre saber y creer que sabes."
            />
            <FECard variant="flat" className="border border-[var(--color-brand-warning)]">
              <p className="font-bold mb-2">Conceptos clave:</p>
              <div className="space-y-2">
                <p className="text-sm">
                  📊 <b>Balance mensual</b> = Ingresos totales − Gastos totales
                </p>
                <p className="text-sm font-semibold text-[var(--color-brand-success)]">
                  ✅ Superávit: sobra dinero → ¿lo estás ahorrando o gastando después?
                </p>
                <p className="text-sm font-semibold text-[var(--color-brand-error)]">
                  ❌ Déficit: gastaste más de lo que entraste → ¿es temporal o tu patrón normal?
                </p>
              </div>
            </FECard>
            <FinniMessage
              variant="coach"
              title="Clave"
              message="Ninguno de los dos es bueno o malo por sí solo. Lo importante es saberlo y actuar."
            />
            <button
              className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm"
              onClick={() => setStep(1)}
            >
              ¡Calcular con Roberto! →
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <FECard variant="flat" className="bg-[var(--color-brand-warning)]/10 text-center py-3">
              <p className="font-bold text-base">El mes de Roberto 🎓</p>
              <p className="text-sm text-[var(--color-text-secondary)]">Estudiante de 3er semestre</p>
            </FECard>

            {pasoRoberto === 0 && (
              <div className="space-y-2">
                <p className="font-bold">Paso 1: Suma los ingresos de Roberto</p>
                <div className="space-y-2">
                  {INGRESOS_ROBERTO.map((i, idx) => (
                    <FECard key={idx} variant="flat" className="border border-[var(--color-brand-success)]/30">
                      <div className="flex justify-between">
                        <p className="text-sm">{i.label}</p>
                        <p className="font-bold text-sm text-[var(--color-brand-success)]">+${i.monto.toLocaleString()}</p>
                      </div>
                    </FECard>
                  ))}
                </div>
                <FECard variant="flat" className="bg-[var(--color-brand-success)]/10 border-2 border-[var(--color-brand-success)]">
                  <div className="flex justify-between">
                    <p className="font-bold">Total ingresos</p>
                    <p className="font-bold text-[var(--color-brand-success)]">${TOTAL_INGRESOS.toLocaleString()}</p>
                  </div>
                </FECard>
                <button
                  className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm"
                  onClick={() => setPasoRoberto(1)}
                >
                  Ver gastos →
                </button>
              </div>
            )}

            {pasoRoberto === 1 && (
              <div className="space-y-2">
                <p className="font-bold">Paso 2: Suma los gastos del mes</p>
                <div className="space-y-2">
                  {GASTOS_ROBERTO.map((g, idx) => (
                    <FECard key={idx} variant="flat" className="border border-[var(--color-brand-error)]/30">
                      <div className="flex justify-between">
                        <p className="text-sm">{g.label}</p>
                        <p className="font-bold text-sm text-[var(--color-brand-error)]">-${g.monto.toLocaleString()}</p>
                      </div>
                    </FECard>
                  ))}
                </div>
                <FECard variant="flat" className="bg-[var(--color-brand-error)]/10 border-2 border-[var(--color-brand-error)]">
                  <div className="flex justify-between">
                    <p className="font-bold">Total gastos</p>
                    <p className="font-bold text-[var(--color-brand-error)]">${TOTAL_GASTOS.toLocaleString()}</p>
                  </div>
                </FECard>
                <button
                  className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm"
                  onClick={() => setPasoRoberto(2)}
                >
                  Calcular balance →
                </button>
              </div>
            )}

            {pasoRoberto === 2 && (
              <div className="space-y-2">
                <p className="font-bold">Paso 3: Balance de Roberto</p>
                <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-sm">Ingresos</p>
                      <p className="font-bold text-sm text-[var(--color-brand-success)]">+${TOTAL_INGRESOS.toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm">Gastos</p>
                      <p className="font-bold text-sm text-[var(--color-brand-error)]">-${TOTAL_GASTOS.toLocaleString()}</p>
                    </div>
                  </div>
                </FECard>
                <FECard variant="flat" className="bg-[var(--color-brand-success)]/10 border-2 border-[var(--color-brand-success)] text-center py-4">
                  <p className="text-2xl font-bold text-[var(--color-brand-success)]">${BALANCE.toLocaleString()}</p>
                  <p className="font-bold text-[var(--color-brand-success)]">Superávit ✓</p>
                </FECard>
                <FinniMessage
                  variant="success"
                  title="¡Bien Roberto!"
                  message="Tiene $720 de superávit. Finni le recomienda destinarlo a su fondo de ahorro o meta financiera."
                />
                <button
                  className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm"
                  onClick={() => { setPasoRoberto(3); setStep(2); }}
                >
                  Ver mi propio balance →
                </button>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <FinniMessage
              variant="coach"
              title="¿Y tú?"
              message="¿Quieres calcular tu balance real de este mes? En la lección 12 construiremos tu presupuesto completo con tus datos reales."
            />
            <FECard variant="flat" className="border border-[var(--color-brand-warning)] bg-[var(--color-brand-warning)]/10 p-4">
              <p className="font-bold">Fórmula para tu balance:</p>
              <p className="text-sm mt-2">
                Total de lo que recibiste este mes<br />
                <b>menos</b><br />
                Total de lo que gastaste este mes<br />
                <b>=</b> Tu balance
              </p>
            </FECard>
            <FinniMessage
              variant="success"
              title="Lección completada"
              message="Ya sabes cómo calcular tu balance mensual. ¡Ese es el primer paso para tomar control de tu dinero!"
            />
          </div>
        )}
      </div>
    </LessonShell>
  );
}
