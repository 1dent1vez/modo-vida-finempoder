import { useState, useEffect, useMemo } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

type Horizon = 1 | 3 | 6;
type MetaData = { nombre?: string; monto?: number; aportacionMensual?: number } | null;

const successColor = 'var(--color-brand-success)';
const successBg = 'var(--color-brand-success-bg)';
const infoColor = 'var(--color-brand-info)';
const infoBg = 'var(--color-brand-info-bg)';

const HORIZON_WEEKS: Record<Horizon, number> = { 1: 4, 3: 13, 6: 26 };
const PLAN_DESCRIPTIONS: Record<Horizon, { title: string; desc: string }> = {
  1: { title: 'Plan 1 mes', desc: 'Para metas pequeñas o fondo de emergencias inicial. Requiere disciplina alta.' },
  3: { title: 'Plan 3 meses', desc: 'El mas recomendado para comenzar. Permite ajustes y tiene resultados visibles.' },
  6: { title: 'Plan 6 meses', desc: 'Para metas medianas. Requiere constancia. La clave es la automatizacion.' },
};

export default function L06() {
  const [step, setStep] = useState(0);
  const [horizon, setHorizon] = useState<Horizon | null>(null);
  const [metaData, setMetaData] = useState<MetaData>(null);
  const [weekAmounts, setWeekAmounts] = useState<Record<number, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const meta = await lessonDataRepository.load<MetaData>('ahorro', 'l5_meta');
      setMetaData(meta);
    };
    void load();
  }, []);

  const numWeeks = horizon ? HORIZON_WEEKS[horizon] : 0;
  const totalPlanado = useMemo(() => Object.values(weekAmounts).reduce((sum, v) => sum + (parseFloat(v) || 0), 0), [weekAmounts]);
  const weeksWithAmount = Object.values(weekAmounts).filter((v) => parseFloat(v) > 0).length;
  const requiredFilled = Math.ceil(numWeeks * 0.8);
  const canComplete = horizon !== null && weeksWithAmount >= requiredFilled && saved;

  const handleWeekChange = (week: number, val: string) => setWeekAmounts((prev) => ({ ...prev, [week]: val }));

  const handleSave = async () => {
    await lessonDataRepository.save('ahorro', 'l6_plan', { horizon, numWeeks, weekAmounts, totalPlanado, savedAt: new Date().toISOString() });
    setSaved(true);
    setStep(3);
  };

  const metaMonto = metaData?.monto ?? 0;
  const pctAlcanzado = metaMonto > 0 ? Math.min(100, (totalPlanado / metaMonto) * 100) : 0;
  const progress = step === 0 ? 0 : step === 1 ? 25 : step === 2 ? 60 : 100;

  return (
    <LessonShell id="L06" title="Tu plan de ahorro: 1, 3 o 6 meses" completion={{ ready: canComplete }}>
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: successColor }} />
        </div>

        {/* Pantalla 0 — Apertura */}
        {step === 0 && (
          <div className="space-y-6">
            <FinniMessage variant="coach" title="El plan es el como" message="Tener una meta es el que. El plan es el como. Hoy vamos a construir tu plan de ahorro semana a semana." />
            <div className="space-y-3">
              {([1, 3, 6] as Horizon[]).map((h) => (
                <FECard key={h} variant="flat" className="border border-[var(--color-neutral-200)]">
                  <p className="font-bold text-sm">{PLAN_DESCRIPTIONS[h].title}</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">{PLAN_DESCRIPTIONS[h].desc}</p>
                </FECard>
              ))}
            </div>
            <FinniMessage variant="coach" title="El plan perfecto no existe" message="El plan que tu realmente vas a seguir, ese existe. Empecemos por ahi." />
            <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => setStep(1)}>
              Elegir mi horizonte →
            </button>
          </div>
        )}

        {/* Pantalla 1 — Selector de horizonte */}
        {step === 1 && (
          <div className="space-y-6">
            <p className="font-bold">¿Cuanto tiempo dura tu plan?</p>
            {metaData?.nombre && (
              <FECard variant="flat" className="border" style={{ borderColor: infoColor, backgroundColor: infoBg }}>
                <p className="text-xs">Tu meta: <b>{metaData.nombre}</b> — ${metaData.monto?.toLocaleString()}</p>
              </FECard>
            )}
            <div className="space-y-3">
              {([1, 3, 6] as Horizon[]).map((h) => (
                <button
                  key={h}
                  onClick={() => setHorizon(h)}
                  className="w-full text-left px-4 py-3 rounded-xl border-2 transition-colors"
                  style={{
                    borderColor: successColor,
                    backgroundColor: horizon === h ? successColor : 'transparent',
                    color: horizon === h ? 'white' : 'inherit',
                  }}
                >
                  <p className="font-bold text-sm">{PLAN_DESCRIPTIONS[h].title}</p>
                  <p className="text-xs opacity-80">{HORIZON_WEEKS[h]} semanas</p>
                </button>
              ))}
            </div>
            {horizon && (
              <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => setStep(2)}>
                Construir mi calendario ({HORIZON_WEEKS[horizon]} semanas) →
              </button>
            )}
          </div>
        )}

        {/* Pantalla 2 — Calendario semanal */}
        {step === 2 && horizon && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="font-bold">Asigna un monto a cada semana:</p>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: weeksWithAmount >= requiredFilled ? successBg : 'var(--color-neutral-100)',
                  color: weeksWithAmount >= requiredFilled ? '#059669' : 'var(--color-text-secondary)',
                  border: `1px solid ${weeksWithAmount >= requiredFilled ? successColor : 'var(--color-neutral-200)'}`,
                }}
              >
                {weeksWithAmount}/{numWeeks} sem
              </span>
            </div>

            {metaMonto > 0 && (
              <FECard variant="flat" className="border" style={{ borderColor: successColor }}>
                <p className="text-xs text-[var(--color-text-secondary)]">Progreso hacia la meta: ${totalPlanado.toLocaleString()} / ${metaMonto.toLocaleString()}</p>
                <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mt-1">
                  <div className="h-2 rounded-full transition-all" style={{ width: `${pctAlcanzado}%`, backgroundColor: successColor }} />
                </div>
                <p className="text-xs mt-1" style={{ color: '#059669' }}>{pctAlcanzado.toFixed(0)}% planeado</p>
              </FECard>
            )}

            <div className="space-y-2">
              {Array.from({ length: numWeeks }, (_, i) => i + 1).map((week) => (
                <div key={week} className="flex gap-3 items-center">
                  <span className="text-xs text-[var(--color-text-secondary)] min-w-[72px]">Semana {week}</span>
                  <input
                    type="number"
                    placeholder="$0"
                    min={0}
                    step={50}
                    value={weekAmounts[week] ?? ''}
                    onChange={(e) => handleWeekChange(week, e.target.value)}
                    className="flex-1 border border-[var(--color-neutral-200)] rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-success)]"
                  />
                </div>
              ))}
            </div>

            <FECard variant="flat" className="text-center" style={{ backgroundColor: successBg }}>
              <p className="font-bold text-sm">Total planeado: ${totalPlanado.toLocaleString()}</p>
            </FECard>

            {weeksWithAmount >= requiredFilled && (
              <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => void handleSave()}>
                Guardar mi plan →
              </button>
            )}
          </div>
        )}

        {/* Pantalla 3 — Confirmacion */}
        {step === 3 && (
          <div className="space-y-6">
            <FECard variant="flat" className="text-center py-4 border-2" style={{ backgroundColor: successBg, borderColor: successColor }}>
              <p className="text-2xl font-bold">✅ Plan guardado</p>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">{horizon && PLAN_DESCRIPTIONS[horizon].title} · ${totalPlanado.toLocaleString()} planeados</p>
            </FECard>
            <FinniMessage variant="success" title="Tu plan esta listo" message="Cada semana recibirás un aviso para aportar a tu meta. La constancia es lo que distingue a quien ahorra de quien intenta ahorrar." />
          </div>
        )}
      </div>
    </LessonShell>
  );
}
