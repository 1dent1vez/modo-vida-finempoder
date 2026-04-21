import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

const METHODS = [
  { id: 'libreta', label: 'Libreta o agenda', emoji: '📓', pro: 'Rápido, sin batería, lo de toda la vida.' },
  { id: 'excel', label: 'Hoja de cálculo (Excel/Sheets)', emoji: '📊', pro: 'Más organizado, ideal para análisis mensual.' },
  { id: 'app', label: 'App especializada', emoji: '📱', pro: 'Práctica, con categorías automáticas y alertas.' },
];

const CATEGORIAS = ['Alimentación', 'Transporte', 'Educación', 'Entretenimiento', 'Varios'];
const PAGOS = ['Efectivo', 'Tarjeta', 'App de pago', 'Transferencia'];

const MOMENTOS = [
  { id: 'desayuno', time: '8:00 AM', evento: 'Desayuno', detalle: 'Tacos en la entrada', monto: 65, categoria: 'Alimentación' },
  { id: 'transporte', time: '8:45 AM', evento: 'Transporte', detalle: 'Camión al TecToluca', monto: 22, categoria: 'Transporte' },
  { id: 'almuerzo', time: '1:30 PM', evento: 'Almuerzo', detalle: 'Comedor escolar', monto: 95, categoria: 'Alimentación' },
  { id: 'fotocopia', time: '3:00 PM', evento: 'Fotocopia', detalle: 'Papelería', monto: 14, categoria: 'Educación' },
  { id: 'cafe', time: '5:00 PM', evento: 'Café tarde', detalle: 'Cafetería del campus', monto: 52, categoria: 'Alimentación' },
];

type RegistroEntry = { categoria: string; metodoPago: string };

export default function L04() {
  const [step, setStep] = useState(0);
  const [preferredMethod, setPreferredMethod] = useState<string | null>(null);
  const [momentoIdx, setMomentoIdx] = useState(0);
  const [registros, setRegistros] = useState<Record<string, RegistroEntry>>({});
  const [currentCategoria, setCurrentCategoria] = useState('');
  const [currentMetodo, setCurrentMetodo] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const allRegistered = MOMENTOS.every((m) => registros[m.id] !== undefined);
  const totalGasto = MOMENTOS.reduce((a, m) => a + m.monto, 0);

  const registrarGasto = () => {
    const momento = MOMENTOS[momentoIdx];
    if (!currentCategoria || !currentMetodo) return;
    const isCorrectCat = currentCategoria === momento.categoria;
    setRegistros((prev) => ({ ...prev, [momento.id]: { categoria: currentCategoria, metodoPago: currentMetodo } }));
    setFeedback(
      isCorrectCat
        ? '¡Bien categorizado!'
        : `Ojo: ese va en "${momento.categoria}", no "${currentCategoria}"`
    );
    setTimeout(() => {
      setFeedback(null);
      if (momentoIdx < MOMENTOS.length - 1) {
        setMomentoIdx((i) => i + 1);
        setCurrentCategoria('');
        setCurrentMetodo('');
      } else {
        setStep(3);
      }
    }, 1500);
  };

  useEffect(() => {
    if (preferredMethod) {
      void lessonDataRepository.save('presupuesto', 'l4_method', { method: preferredMethod });
    }
  }, [preferredMethod]);

  const currentMomento = MOMENTOS[momentoIdx];
  const progressValue = step === 0 ? 0 : step === 1 ? 25 : step === 2 ? 50 : 100;

  return (
    <LessonShell
      id="L04"
      title="Registra sin morir en el intento"
      completion={{ ready: allRegistered }}
    >
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full bg-[var(--color-brand-warning)] transition-all" style={{ width: `${progressValue}%` }} />
        </div>

        {step === 0 && (
          <div className="space-y-3">
            <FinniMessage
              variant="coach"
              title="¿Intentaste anotar gastos y lo dejaste al tercer día?"
              message="Sí, a todos nos pasó. Hoy vamos a hacerlo de forma que sí dure."
            />
            <div className="space-y-2">
              {METHODS.map((m) => (
                <FECard
                  key={m.id}
                  variant="flat"
                  className={cn(
                    'border-2 cursor-pointer transition-colors',
                    preferredMethod === m.id
                      ? 'border-[var(--color-brand-warning)] bg-[var(--color-brand-warning)]/10'
                      : 'border-[var(--color-neutral-200)]'
                  )}
                  onClick={() => setPreferredMethod(m.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-center gap-3">
                    <p className="text-4xl">{m.emoji}</p>
                    <div className="flex-1">
                      <p className="font-bold">{m.label}</p>
                      <p className="text-sm text-[var(--color-text-secondary)]">{m.pro}</p>
                    </div>
                    {preferredMethod === m.id && <CheckCircle className="text-[var(--color-brand-warning)] ml-auto" size={20} />}
                  </div>
                </FECard>
              ))}
            </div>
            <FinniMessage
              variant="coach"
              title="Clave"
              message="No hay una mejor que otra. Hay una que tú realmente usarás. Esa es la mejor."
            />
            {preferredMethod && (
              <button
                className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm"
                onClick={() => setStep(1)}
              >
                ¡Practicar con Mariana! →
              </button>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <FECard variant="flat" className="bg-[var(--color-brand-warning)]/10 text-center py-4">
              <p className="font-bold text-base">El día de Mariana 📚</p>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Mariana es estudiante de 2do semestre. Registra sus 5 gastos del día.
              </p>
            </FECard>
            <p className="text-sm">
              Para cada gasto, elige la <b>categoría</b> y el <b>método de pago</b>. Finni te orientará si te equivocas.
            </p>
            <button
              className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm"
              onClick={() => setStep(2)}
            >
              ¡Empezar! →
            </button>
          </div>
        )}

        {step === 2 && currentMomento && (
          <div className="space-y-3" key={currentMomento.id}>
            <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2">
              <div className="h-2 rounded-full bg-[var(--color-brand-warning)] transition-all" style={{ width: `${(momentoIdx / MOMENTOS.length) * 100}%` }} />
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Gasto {momentoIdx + 1}/{MOMENTOS.length}
            </p>
            <FECard variant="flat" className="border-2 border-[var(--color-brand-warning)] bg-[var(--color-brand-warning)]/10">
              <div className="flex justify-between items-center">
                <p className="text-sm text-[var(--color-text-secondary)]">{currentMomento.time}</p>
                <p className="font-bold text-[var(--color-brand-warning)]">${currentMomento.monto}</p>
              </div>
              <p className="font-bold text-base mt-1">{currentMomento.evento}</p>
              <p className="text-sm text-[var(--color-text-secondary)]">{currentMomento.detalle}</p>
            </FECard>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[var(--color-text-secondary)]">Categoría</label>
              <select
                value={currentCategoria}
                onChange={(e) => setCurrentCategoria(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              >
                <option value="">Seleccionar...</option>
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[var(--color-text-secondary)]">Método de pago</label>
              <select
                value={currentMetodo}
                onChange={(e) => setCurrentMetodo(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              >
                <option value="">Seleccionar...</option>
                {PAGOS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            {feedback && (
              <FECard
                variant="flat"
                className={feedback.startsWith('¡') ? 'bg-[var(--color-brand-success)]/10' : 'bg-[var(--color-brand-warning)]/10'}
              >
                <p className="font-bold text-sm">
                  {feedback.startsWith('¡') ? '✅' : 'ℹ️'} {feedback}
                </p>
              </FECard>
            )}
            {!feedback && (
              <button
                className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!currentCategoria || !currentMetodo}
                onClick={registrarGasto}
              >
                Registrar gasto
              </button>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <FinniMessage
              variant="success"
              title="¡Día registrado!"
              message="Así se ve un registro completo. ¿Ves qué útil es tenerlo categorizado?"
            />
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="font-bold text-base mb-4">Resumen del día de Mariana</p>
              <div className="space-y-2">
                {MOMENTOS.map((m) => (
                  <div key={m.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm">{m.evento}</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {registros[m.id]?.categoria ?? m.categoria} · {registros[m.id]?.metodoPago ?? '—'}
                      </p>
                    </div>
                    <p className="font-bold text-sm text-[var(--color-brand-warning)]">${m.monto}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 pt-3 border-t border-[var(--color-neutral-200)]">
                <p className="font-bold">Total del día</p>
                <p className="font-bold text-[var(--color-brand-warning)]">${totalGasto}</p>
              </div>
            </FECard>
            <FinniMessage
              variant="coach"
              title="Tu reto"
              message="¿Te animas a registrar tus gastos de hoy en la vida real? Con tu método favorito."
            />
          </div>
        )}
      </div>
    </LessonShell>
  );
}
