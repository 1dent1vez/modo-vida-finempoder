import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

const GASTOS_HORMIGA = [
  { id: 'cafe', label: 'Café matutino', amount: 45, emoji: '☕' },
  { id: 'musica', label: 'App de música', amount: 29, emoji: '🎵' },
  { id: 'propina', label: 'Propina en taquería', amount: 20, emoji: '🌮' },
  { id: 'papas', label: 'Papas en máquina', amount: 22, emoji: '🍟' },
  { id: 'parking', label: 'Estacionamiento extra', amount: 30, emoji: '🅿️' },
  { id: 'agua', label: 'Agua embotellada', amount: 18, emoji: '💧' },
  { id: 'juego', label: 'Videojuego en oferta', amount: 99, emoji: '🎮' },
  { id: 'snack', label: 'Snack convenience store', amount: 35, emoji: '🍫' },
  { id: 'saldo', label: 'Recarga de saldo', amount: 50, emoji: '📱' },
  { id: 'impresiones', label: 'Impresiones extra', amount: 25, emoji: '🖨️' },
];

type PersonalGasto = { nombre: string; monto: string };

export default function L03() {
  const [step, setStep] = useState(0);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [personalGastos, setPersonalGastos] = useState<PersonalGasto[]>([
    { nombre: '', monto: '' },
    { nombre: '', monto: '' },
    { nombre: '', monto: '' },
  ]);

  const totalFound = GASTOS_HORMIGA.filter((g) => found.has(g.id)).reduce((a, g) => a + g.amount, 0);
  const allFound = found.size === GASTOS_HORMIGA.length;

  const personalTotal = personalGastos.reduce((a, g) => a + (parseFloat(g.monto) || 0), 0);
  const personalValid = personalGastos.every((g) => g.nombre.trim().length > 0 && parseFloat(g.monto) > 0);

  const grandTotal = totalFound + personalTotal;
  const monthly = grandTotal * 4;
  const yearly = grandTotal * 52;

  const toggleFound = (id: string) => {
    setFound((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    if (personalValid) {
      void lessonDataRepository.save('presupuesto', 'l3_gastos_hormiga', {
        gameGastos: GASTOS_HORMIGA.filter((g) => found.has(g.id)),
        personalGastos,
        totalWeekly: grandTotal,
        totalMonthly: monthly,
      });
    }
  }, [personalValid, found, personalGastos, grandTotal, monthly]);

  const progressValue = step === 0 ? 0 : step === 1 ? 25 : step === 2 ? 60 : step === 3 ? 80 : 100;

  return (
    <LessonShell
      id="L03"
      title="El gasto hormiga: el ladrón silencioso"
      completion={{ ready: allFound && personalValid }}
    >
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full bg-[var(--color-brand-warning)] transition-all" style={{ width: `${progressValue}%` }} />
        </div>

        {step === 0 && (
          <div className="space-y-3">
            <FECard variant="flat" className="text-center py-6 bg-[var(--color-brand-warning)]/10">
              <p className="text-4xl">👜 → 💸</p>
              <p className="font-bold mt-2">
                Cartera llena el lunes → vacía el viernes
              </p>
            </FECard>
            <FinniMessage
              variant="coach"
              title="¿Tienes un ladrón en tu rutina?"
              message="No te roba de golpe. Te roba de a poquito. Todos los días. Se llama gasto hormiga."
            />
            <FECard variant="flat" className="border border-[var(--color-brand-warning)]">
              <p className="text-sm">
                El gasto hormiga es cualquier compra <b>pequeña, recurrente y casi automática</b> que hacemos sin pensarlo.
                Un café de $45, una descarga de $19, un antojito de $35…
              </p>
              <p className="text-sm mt-2">
                Solos no parecen gran cosa. Pero sumados al mes, pueden comerse entre{' '}
                <b>$500 y $1,500 pesos</b> de tu presupuesto.
              </p>
            </FECard>
            <FinniMessage
              variant="coach"
              title="La clave"
              message="El problema no es el café. El problema es que no lo tienes en tu presupuesto."
            />
            <button
              className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm"
              onClick={() => setStep(1)}
            >
              ¡A encontrar los gastos hormiga! →
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm">
              Toca todos los gastos hormiga que encuentres en tu semana universitaria. ¡Hay 10!
            </p>
            <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2">
              <div className="h-2 rounded-full bg-[var(--color-brand-warning)] transition-all" style={{ width: `${(found.size / GASTOS_HORMIGA.length) * 100}%` }} />
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] text-center">
              {found.size}/10 gastos identificados
            </p>
            <div className="flex flex-wrap gap-3">
              {GASTOS_HORMIGA.map((g) => (
                <button
                  key={g.id}
                  onClick={() => toggleFound(g.id)}
                  className={cn(
                    'px-3 py-2 rounded-full text-sm font-semibold border transition-colors min-h-10',
                    found.has(g.id)
                      ? 'bg-[var(--color-brand-warning)] text-white border-[var(--color-brand-warning)]'
                      : 'border-[var(--color-neutral-200)] text-[var(--color-text-secondary)]'
                  )}
                >
                  {g.emoji} {g.label} ${g.amount}
                </button>
              ))}
            </div>
            {found.size > 0 && (
              <FECard variant="flat" className="bg-[var(--color-brand-warning)]/10">
                <p className="font-bold text-sm">
                  Total encontrado esta semana: <b>${totalFound}</b>
                </p>
              </FECard>
            )}
            {allFound && (
              <button
                className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm"
                onClick={() => setStep(2)}
              >
                Ver cuánto suma al mes →
              </button>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <FECard variant="flat" className="bg-[var(--color-brand-warning)]/10 text-center">
              <p className="font-bold text-base mb-2">Cálculo automático</p>
              <p className="text-sm">Total gastos hormiga/semana: <b>${totalFound}</b></p>
              <p className="text-sm">Al mes (x4): <b>${totalFound * 4}</b></p>
              <p className="text-sm">Al año (x52): <b>${totalFound * 52}</b></p>
            </FECard>
            <FinniMessage
              variant="coach"
              title="Ahora los tuyos"
              message="Ingresa tus 3 gastos hormiga reales (los que haces casi automáticamente)."
            />
            <div className="space-y-2">
              {personalGastos.map((g, i) => (
                <FECard key={i} variant="flat" className="border border-[var(--color-neutral-200)]">
                  <p className="font-bold text-sm mb-2">Gasto hormiga #{i + 1}</p>
                  <div className="flex gap-2">
                    <div className="flex flex-col gap-1 flex-[2]">
                      <label className="text-xs text-[var(--color-text-secondary)]">¿Cuál es?</label>
                      <input
                        value={g.nombre}
                        onChange={(e) => {
                          const next = [...personalGastos];
                          next[i] = { ...next[i], nombre: e.target.value };
                          setPersonalGastos(next);
                        }}
                        className="w-full rounded-xl border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                      <label className="text-xs text-[var(--color-text-secondary)]">$monto</label>
                      <input
                        type="number"
                        value={g.monto}
                        onChange={(e) => {
                          const next = [...personalGastos];
                          next[i] = { ...next[i], monto: e.target.value };
                          setPersonalGastos(next);
                        }}
                        min={0}
                        className="w-full rounded-xl border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </FECard>
              ))}
            </div>
            {personalTotal > 0 && (
              <FECard variant="flat" className="bg-[var(--color-brand-error)]/10">
                <p className="font-bold text-sm">
                  Tus gastos hormiga/semana: <b>${personalTotal}</b>
                </p>
                <p className="text-sm">
                  Total combinado/semana: <b>${grandTotal}</b> | Mes: <b>${monthly}</b> | Año: <b>${yearly}</b>
                </p>
              </FECard>
            )}
            {personalValid && (
              <button
                className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm"
                onClick={() => setStep(3)}
              >
                Reflexión final →
              </button>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <FinniMessage
              variant="success"
              title="¡Ladrón identificado! 🐜"
              message={`Identificaste $${grandTotal} en gastos hormiga por semana. Eso es $${monthly} al mes que podrías redirigir.`}
            />
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="font-bold text-sm mb-2">
                ¿Cuáles eliminarías sin extrañarlos?
              </p>
              <div className="flex flex-wrap gap-2">
                {[...GASTOS_HORMIGA.filter((g) => found.has(g.id)), ...personalGastos.filter((g) => g.nombre).map((g) => ({ id: g.nombre, label: g.nombre, emoji: '💸', amount: parseFloat(g.monto) || 0 }))].map((g) => (
                  <span key={g.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-[var(--color-neutral-200)] font-semibold">
                    {g.emoji} {g.label}
                  </span>
                ))}
              </div>
            </FECard>
            <FinniMessage
              variant="coach"
              title="Recuerda"
              message="No se trata de eliminar todo. Se trata de hacerlos conscientes y decidir cuáles valen la pena."
            />
          </div>
        )}
      </div>
    </LessonShell>
  );
}
