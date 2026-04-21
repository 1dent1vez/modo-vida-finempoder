import { useState, useEffect, useMemo } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

type BudgetData = { totalIngresos?: number; pctAhorro?: number } | null;
type MetaData = { nombre?: string; aportacionMensual?: number } | null;

const SITUACIONES = [
  { id: 1, label: 'Laptop descompuesta', costo: '$3,000–$8,000' },
  { id: 2, label: 'Mes sin beca/mesada', costo: '$1,500–$3,000' },
  { id: 3, label: 'Emergencia medica', costo: '$2,000–$10,000' },
  { id: 4, label: 'Falla de transporte personal', costo: '$1,000–$5,000' },
  { id: 5, label: 'Perdida de trabajo part-time', costo: '$800–$3,500/mes' },
];

const successColor = 'var(--color-brand-success)';
const successBg = 'var(--color-brand-success-bg)';
const warnColor = 'var(--color-brand-warning)';
const warnBg = 'var(--color-brand-warning-bg)';
const infoColor = 'var(--color-brand-info)';
const infoBg = 'var(--color-brand-info-bg)';

export default function L08() {
  const [step, setStep] = useState(0);
  const [budgetData, setBudgetData] = useState<BudgetData>(null);
  const [metaData, setMetaData] = useState<MetaData>(null);
  const [selectedSituaciones, setSelectedSituaciones] = useState<Set<number>>(new Set());
  const [gastosMensuales, setGastosMensuales] = useState('');
  const [aportacion, setAportacion] = useState('');
  const [calculado, setCalculado] = useState(false);

  useEffect(() => {
    const load = async () => {
      const budget = await lessonDataRepository.load<BudgetData>('presupuesto', 'l12_budget');
      const meta = await lessonDataRepository.load<MetaData>('ahorro', 'l5_meta');
      setBudgetData(budget);
      setMetaData(meta);
      if (budget?.totalIngresos) {
        setGastosMensuales(String(Math.round(budget.totalIngresos * 0.8)));
      }
    };
    void load();
  }, []);

  const gastosNum = parseFloat(gastosMensuales) || 0;
  const aportNum = parseFloat(aportacion) || 0;

  const metaMinima = useMemo(() => gastosNum * 3, [gastosNum]);
  const metaIdeal = useMemo(() => gastosNum * 6, [gastosNum]);
  const mesesMinima = useMemo(() => (aportNum > 0 ? Math.ceil(metaMinima / aportNum) : 0), [metaMinima, aportNum]);
  const mesesIdeal = useMemo(() => (aportNum > 0 ? Math.ceil(metaIdeal / aportNum) : 0), [metaIdeal, aportNum]);

  const toggleSituacion = (id: number) => {
    setSelectedSituaciones((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const canCalculate = gastosNum > 0 && aportNum > 0;

  const handleCalcular = async () => {
    await lessonDataRepository.save('ahorro', 'l8_fondo', {
      gastosMensuales: gastosNum,
      aportacionMensual: aportNum,
      metaMinima,
      metaIdeal,
      mesesMinima,
      mesesIdeal,
      savedAt: new Date().toISOString(),
    });
    setCalculado(true);
    setStep(3);
  };

  const progress = step === 0 ? 0 : step === 1 ? 25 : step === 2 ? 60 : 100;

  return (
    <LessonShell id="L08" title="Tu red de seguridad: fondo de emergencias" completion={{ ready: calculado }}>
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: successColor }} />
        </div>

        {/* Pantalla 0 — Apertura */}
        {step === 0 && (
          <div className="space-y-6">
            <FinniMessage variant="coach" title="El fondo de emergencias es tu red" message="Imagina que mañana se descompone tu laptop justo antes de examenes. ¿Tienes algo guardado para eso? El fondo de emergencias es esa red que atrapa antes del desastre." />
            <FECard variant="flat" className="border" style={{ borderColor: successColor }}>
              <p className="text-sm font-bold mb-2">¿Que es un fondo de emergencias?</p>
              <p className="text-sm">Dinero guardado especificamente para imprevistos. No es para el viaje, no es para la tele nueva. Es para cuando la vida sorprende.</p>
              <div className="mt-3 space-y-1">
                <p className="text-xs" style={{ color: '#059669' }}>✅ 3 meses de gastos basicos — si tienes apoyo familiar</p>
                <p className="text-xs" style={{ color: '#059669' }}>✅ 6 meses — si eres mas independiente</p>
              </div>
            </FECard>
            <FECard variant="flat" className="border" style={{ borderColor: infoColor, backgroundColor: infoBg }}>
              <p className="text-xs font-bold">¿Donde guardarlo?</p>
              <p className="text-sm">Cuenta separada, accesible pero no tan facil de retirar. CETES a 28 dias o cuenta con rendimiento son opciones ideales.</p>
            </FECard>
            <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => setStep(1)}>
              ¿Que situaciones te preocupan? →
            </button>
          </div>
        )}

        {/* Pantalla 1 — Tarjetas de situaciones */}
        {step === 1 && (
          <div className="space-y-6">
            <p className="text-base font-bold">Toca las situaciones que te han pasado o podrian pasarte:</p>
            <div className="space-y-3">
              {SITUACIONES.map((s) => (
                <FECard
                  key={s.id}
                  variant="flat"
                  className="border cursor-pointer"
                  style={{
                    borderColor: selectedSituaciones.has(s.id) ? warnColor : 'var(--color-border)',
                    backgroundColor: selectedSituaciones.has(s.id) ? warnBg : 'white',
                  }}
                  onClick={() => toggleSituacion(s.id)}
                  role="checkbox"
                  tabIndex={0}
                >
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold">{selectedSituaciones.has(s.id) ? '⚠️' : '○'} {s.label}</p>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold border" style={{ borderColor: warnColor, color: warnColor }}>{s.costo}</span>
                  </div>
                </FECard>
              ))}
            </div>
            {selectedSituaciones.size > 0 && (
              <FECard variant="flat" className="border" style={{ borderColor: warnColor, backgroundColor: warnBg }}>
                <p className="text-sm font-bold">{selectedSituaciones.size} situacion(es) identificadas. El fondo de emergencias te protege de estas.</p>
              </FECard>
            )}
            <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => setStep(2)}>
              Calcular mi fondo →
            </button>
          </div>
        )}

        {/* Pantalla 2 — Calculadora */}
        {step === 2 && (
          <div className="space-y-6">
            <p className="text-base font-bold">Calculadora del fondo de emergencias:</p>
            {budgetData?.totalIngresos && (
              <FECard variant="flat" className="border" style={{ borderColor: infoColor, backgroundColor: infoBg }}>
                <p className="text-xs">Datos de tu presupuesto (M1-L12) precargados</p>
              </FECard>
            )}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-[var(--color-text-primary)]">Tus gastos basicos mensuales ($)</label>
              <input type="number" value={gastosMensuales} onChange={(e) => setGastosMensuales(e.target.value)} min={0} className="w-full border border-[var(--color-neutral-200)] rounded-xl px-4 py-2.5 text-sm" />
              <p className="text-xs text-[var(--color-text-secondary)]">Lo minimo para vivir un mes dificil: comida, transporte, servicios</p>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-[var(--color-text-primary)]">¿Cuanto puedes apartar mensualmente? ($)</label>
              <input type="number" value={aportacion} onChange={(e) => setAportacion(e.target.value)} min={0} className="w-full border border-[var(--color-neutral-200)] rounded-xl px-4 py-2.5 text-sm" />
            </div>
            {canCalculate && (
              <div className="space-y-3">
                <FECard variant="flat" className="border-2" style={{ borderColor: successColor, backgroundColor: successBg }}>
                  <p className="text-sm font-bold">Meta minima (3 meses):</p>
                  <p className="text-3xl font-black">${metaMinima.toLocaleString()}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">Lo alcanzas en {mesesMinima} meses apartando ${aportNum.toLocaleString()}/mes</p>
                </FECard>
                <FECard variant="flat" className="border" style={{ borderColor: warnColor, backgroundColor: warnBg }}>
                  <p className="text-sm font-bold">Meta ideal (6 meses):</p>
                  <p className="text-3xl font-black">${metaIdeal.toLocaleString()}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">Lo alcanzas en {mesesIdeal} meses</p>
                </FECard>
              </div>
            )}
            {metaData?.nombre && (
              <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
                <p className="text-xs text-[var(--color-text-secondary)]">💡 Finni recomienda: primero el fondo minimo (${metaMinima.toLocaleString()}), luego tu meta de "{metaData.nombre}"</p>
              </FECard>
            )}
            {canCalculate && (
              <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => void handleCalcular()}>
                Guardar mi meta del fondo →
              </button>
            )}
          </div>
        )}

        {/* Pantalla 3 — Confirmacion */}
        {step === 3 && (
          <div className="space-y-6">
            <FECard variant="flat" className="border-2 text-center py-4" style={{ borderColor: successColor, backgroundColor: successBg }}>
              <p className="text-3xl">🛡️ Fondo de emergencias</p>
              <div className="flex gap-2 justify-center mt-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: successColor }}>Meta minima: ${metaMinima.toLocaleString()}</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: warnColor }}>Meta ideal: ${metaIdeal.toLocaleString()}</span>
              </div>
            </FECard>
            <FinniMessage variant="success" title="No necesitas llegar de golpe" message="Construye el fondo gradualmente. Incluso $500 ahorrados ya te protegen de pequeños imprevistos." />
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="text-sm font-bold">Donde guardarlo:</p>
              {aportNum < 500
                ? <p className="text-sm">Cuenta de ahorro basica (sin comisiones)</p>
                : <p className="text-sm">CETES a 28 dias — cetesdirecto.com (rendimiento adicional)</p>
              }
            </FECard>
          </div>
        )}
      </div>
    </LessonShell>
  );
}
