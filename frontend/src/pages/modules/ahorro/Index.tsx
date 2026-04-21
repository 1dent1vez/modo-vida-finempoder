import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SAVINGS_LESSONS } from './lessonFlow';

const warnColor = 'var(--color-brand-warning)';
const successColor = 'var(--color-brand-success)';
const infoColor = 'var(--color-brand-info)';

export default function AhorroIndex() {
  const nav = useNavigate();
  const [goalName, setGoalName] = useState('Fondo de emergencia');
  const [goalAmount, setGoalAmount] = useState(3000);
  const [months, setMonths] = useState(6);
  const [autoDay, setAutoDay] = useState(15);
  const [autoAmount, setAutoAmount] = useState(500);
  const [channel, setChannel] = useState<'transfer' | 'efectivo'>('transfer');

  const monthlyNeeded = useMemo(() => (months > 0 ? goalAmount / months : 0), [goalAmount, months]);
  const coverage = Math.min(100, Math.round((autoAmount / monthlyNeeded) * 100 || 0));
  const paceOk = coverage >= 100;

  const handleApplyPreset = (amount: number, m: number) => {
    setGoalAmount(amount);
    setMonths(m);
    setAutoAmount(Math.round(amount / m));
  };

  return (
    <div className="p-4 pb-24 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">💰</span>
        <p className="text-lg font-extrabold">Plan rapido de ahorro</p>
      </div>

      {/* Meta */}
      <div className="p-4 rounded-2xl border border-[var(--color-neutral-200)]" style={{ borderLeft: `6px solid ${warnColor}` }}>
        <p className="font-bold mb-3">Define tu meta</p>
        <div className="space-y-3">
          <div>
            <input
              type="text"
              placeholder="Meta"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              className="w-full border border-[var(--color-neutral-200)] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-warning)]"
            />
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">Ejemplo: laptop, mudanza, fondo de emergencia</p>
          </div>
          <input
            type="number"
            placeholder="Monto objetivo (MXN)"
            min={0}
            step={100}
            value={goalAmount}
            onChange={(e) => setGoalAmount(Number(e.target.value))}
            className="w-full border border-[var(--color-neutral-200)] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-warning)]"
          />
          <div>
            <p className="text-sm text-[var(--color-text-secondary)] mb-1">Meses para lograrlo: {months}</p>
            <input
              type="range"
              min={1}
              max={12}
              step={1}
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              className="w-full accent-[var(--color-brand-warning)]"
            />
          </div>
          <p className="font-bold">Necesitas ahorrar ~${monthlyNeeded.toFixed(2)} al mes.</p>
        </div>
      </div>

      {/* Depositos */}
      <div className="p-4 rounded-2xl border border-[var(--color-neutral-200)]" style={{ borderLeft: `6px solid ${infoColor}` }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">⏰</span>
          <p className="font-bold">Programa tus depositos</p>
        </div>
        <div className="space-y-3">
          <select
            value={autoDay}
            onChange={(e) => setAutoDay(Number(e.target.value))}
            className="w-full border border-[var(--color-neutral-200)] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-info)] bg-white"
          >
            {[1, 5, 10, 15, 20, 25].map((d) => (
              <option key={d} value={d}>Dia {d} de cada mes</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Monto automatico (MXN)"
            min={0}
            step={50}
            value={autoAmount}
            onChange={(e) => setAutoAmount(Number(e.target.value))}
            className="w-full border border-[var(--color-neutral-200)] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-info)]"
          />
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as 'transfer' | 'efectivo')}
            className="w-full border border-[var(--color-neutral-200)] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-info)] bg-white"
          >
            <option value="transfer">Transferencia programada</option>
            <option value="efectivo">Deposito en efectivo con recordatorio</option>
          </select>
          <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{ width: `${coverage}%`, backgroundColor: paceOk ? successColor : warnColor }}
            />
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">Cubres {coverage}% de lo necesario cada mes.</p>
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold"
            style={{
              backgroundColor: paceOk ? 'var(--color-brand-success-bg)' : 'var(--color-brand-warning-bg)',
              color: paceOk ? '#059669' : '#D97706',
              border: `1px solid ${paceOk ? successColor : warnColor}`,
            }}
          >
            {paceOk ? 'Estas en ruta a la meta' : 'Sube un poco tu deposito'}
          </span>
        </div>
      </div>

      {/* Atajos */}
      <div className="p-4 rounded-2xl border border-[var(--color-neutral-200)] space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">✨</span>
          <p className="font-bold">Atajos</p>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)]">Selecciona un atajo para precargar meta y frecuencia.</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Ahorro rapido: $1500 en 3 meses', amount: 1500, m: 3 },
            { label: 'Fondo 1-3-6: $6000 en 6 meses', amount: 6000, m: 6 },
            { label: 'Meta grande: $12000 en 10 meses', amount: 12000, m: 10 },
          ].map((p) => (
            <button
              key={p.label}
              onClick={() => handleApplyPreset(p.amount, p.m)}
              className="px-3 py-1 rounded-full text-xs font-semibold border border-[var(--color-neutral-200)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand-warning)] hover:text-[var(--color-brand-warning)] transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>

        <hr className="border-[var(--color-neutral-200)]" />

        <div className="space-y-2">
          <p className="font-bold">Da el siguiente paso</p>
          <p className="text-sm text-[var(--color-text-secondary)]">Continua con las lecciones para desbloquear guias y simuladores de ahorro.</p>
          <button
            onClick={() => nav('/app/ahorro')}
            className="min-h-10 px-5 text-white rounded-xl font-semibold text-sm"
            style={{ backgroundColor: warnColor }}
          >
            Ver lecciones
          </button>
          <div className="flex flex-wrap gap-2 mt-1">
            {SAVINGS_LESSONS.slice(0, 3).map((l) => (
              <span key={l.id} className="px-2 py-0.5 rounded-full text-xs border border-[var(--color-neutral-200)] text-[var(--color-text-secondary)]">
                {l.id} - {l.title}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
