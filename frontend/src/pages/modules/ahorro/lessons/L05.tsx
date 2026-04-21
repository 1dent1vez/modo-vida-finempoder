import { useState, useEffect, useMemo } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

type SmartGoal = { queQuieres?: string; monto?: number; aportacionMensual?: number } | null;

const successColor = 'var(--color-brand-success)';
const successBg = 'var(--color-brand-success-bg)';
const infoColor = 'var(--color-brand-info)';
const infoBg = 'var(--color-brand-info-bg)';

const CATEGORIAS = [
  { label: 'Laptop', min: 8000, max: 15000, emoji: '💻' },
  { label: 'Viaje de graduacion', min: 5000, max: 12000, emoji: '✈️' },
  { label: 'Fondo de emergencias', min: 3000, max: 6000, emoji: '🛡️' },
  { label: 'Curso o certificacion', min: 2000, max: 5000, emoji: '📚' },
  { label: 'Celular', min: 4000, max: 10000, emoji: '📱' },
  { label: 'La mia (personalizada)', min: 0, max: 0, emoji: '🎯' },
];

export default function L05() {
  const [step, setStep] = useState(0);
  const [smartGoal, setSmartGoal] = useState<SmartGoal>(null);
  const [meta, setMeta] = useState('');
  const [monto, setMonto] = useState('');
  const [fechaObj, setFechaObj] = useState('');
  const [aportacion, setAportacion] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const prev = await lessonDataRepository.load<SmartGoal>('presupuesto', 'l9_smart_goal');
      setSmartGoal(prev);
      if (prev?.queQuieres) setMeta(prev.queQuieres);
      if (prev?.monto) setMonto(String(prev.monto));
      if (prev?.aportacionMensual) setAportacion(String(prev.aportacionMensual));
      setLoading(false);
    };
    void load();
  }, []);

  const montoNum = parseFloat(monto) || 0;
  const aportNum = parseFloat(aportacion) || 0;

  const fechaCalculada = useMemo(() => {
    if (!montoNum || !aportNum || aportNum <= 0) return null;
    const meses = Math.ceil(montoNum / aportNum);
    const fecha = new Date();
    fecha.setMonth(fecha.getMonth() + meses);
    return { meses, fecha: fecha.toLocaleDateString('es-MX', { year: 'numeric', month: 'long' }) };
  }, [montoNum, aportNum]);

  const fechaObjDate = fechaObj ? new Date(fechaObj) : null;
  const mesesHastaFecha = fechaObjDate ? Math.max(1, Math.ceil((fechaObjDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30))) : null;
  const aportNecesaria = mesesHastaFecha && montoNum ? Math.ceil(montoNum / mesesHastaFecha) : null;

  const formValid = meta.trim().length >= 3 && montoNum > 0 && aportNum > 0;

  const handleSave = async () => {
    await lessonDataRepository.save('ahorro', 'l5_meta', { nombre: meta, monto: montoNum, fechaObj, aportacionMensual: aportNum, fechaCalculada: fechaCalculada?.fecha, savedAt: new Date().toISOString() });
    setStep(3);
  };

  const progress = step === 0 ? 0 : step === 1 ? 33 : step === 2 ? 66 : 100;

  if (loading) {
    return (
      <LessonShell id="L05" title="Ponle nombre a tu ahorro: define tu meta" completion={{ ready: false }}>
        <p className="text-sm text-[var(--color-text-secondary)]">Cargando datos...</p>
      </LessonShell>
    );
  }

  return (
    <LessonShell id="L05" title="Ponle nombre a tu ahorro: define tu meta" completion={{ ready: formValid }}>
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: successColor }} />
        </div>

        {/* Pantalla 0 — Apertura */}
        {step === 0 && (
          <div className="space-y-6">
            <FinniMessage variant="coach" title="El ahorro sin nombre no dura" message="¿Para que estas ahorrando? Si respondes 'para el futuro' o 'por si acaso', necesitamos trabajar eso." />
            <FECard variant="flat" className="border" style={{ borderColor: successColor, backgroundColor: successBg }}>
              <p className="font-bold text-sm">Dato:</p>
              <p className="text-sm">Las personas con una meta especifica ahorran en promedio <b>3 veces mas</b> que quienes ahorran "en general". No es motivacion. Es estructura.</p>
            </FECard>
            {smartGoal?.queQuieres && (
              <FECard variant="flat" className="border" style={{ borderColor: infoColor, backgroundColor: infoBg }}>
                <p className="text-xs font-bold">De tu modulo anterior:</p>
                <p className="text-sm">Meta: {smartGoal.queQuieres}</p>
                {smartGoal.monto && <p className="text-sm">Monto: ${smartGoal.monto.toLocaleString()}</p>}
              </FECard>
            )}
            <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => setStep(1)}>
              Ver metas comunes →
            </button>
          </div>
        )}

        {/* Pantalla 1 — Galeria */}
        {step === 1 && (
          <div className="space-y-6">
            <p className="font-bold">Metas comunes entre universitarios — toca una para preseleccionarla:</p>
            <div className="space-y-2">
              {CATEGORIAS.map((cat) => {
                const isSelected = meta === cat.label || (cat.label === 'La mia (personalizada)' && !CATEGORIAS.slice(0, -1).some((c) => c.label === meta));
                return (
                  <FECard
                    key={cat.label}
                    variant="flat"
                    className="border cursor-pointer"
                    style={{ borderColor: isSelected ? successColor : 'var(--color-neutral-200)' }}
                    onClick={() => {
                      if (cat.label !== 'La mia (personalizada)') {
                        setMeta(cat.label);
                        if (cat.min > 0) setMonto(String(Math.round((cat.min + cat.max) / 2)));
                      } else {
                        setMeta('');
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-semibold">{cat.emoji} {cat.label}</p>
                      {cat.min > 0 && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full border" style={{ borderColor: successColor, color: '#059669' }}>
                          ${cat.min.toLocaleString()}-${cat.max.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </FECard>
                );
              })}
            </div>
            <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => setStep(2)}>
              Definir mi meta →
            </button>
          </div>
        )}

        {/* Pantalla 2 — Formulario */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="font-bold">Define tu meta de ahorro:</p>
            <input
              type="text"
              placeholder="¿Cual es tu meta de ahorro? Ej: Laptop para la escuela"
              value={meta}
              onChange={(e) => setMeta(e.target.value)}
              className="w-full border border-[var(--color-neutral-200)] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-success)]"
            />
            <input
              type="number"
              placeholder="¿Cuanto dinero necesitas exactamente? ($)"
              min={0}
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full border border-[var(--color-neutral-200)] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-success)]"
            />
            <input
              type="date"
              value={fechaObj}
              onChange={(e) => setFechaObj(e.target.value)}
              className="w-full border border-[var(--color-neutral-200)] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-success)]"
            />
            <input
              type="number"
              placeholder="¿Cuanto puedes apartar por mes? ($)"
              min={0}
              value={aportacion}
              onChange={(e) => setAportacion(e.target.value)}
              className="w-full border border-[var(--color-neutral-200)] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-success)]"
            />

            {fechaCalculada && aportNum > 0 && (
              <FECard variant="flat" className="border" style={{ borderColor: successColor, backgroundColor: successBg }}>
                <p className="font-bold text-sm mb-1">¡A ese ritmo, alcanzas tu meta en {fechaCalculada.meses} meses!</p>
                <p className="text-xs text-[var(--color-text-secondary)]">Fecha estimada: {fechaCalculada.fecha}</p>
                {aportNecesaria && aportNecesaria !== aportNum && (
                  <p className="text-xs mt-1" style={{ color: '#D97706' }}>Para llegar a tu fecha objetivo necesitas apartar ${aportNecesaria.toLocaleString()}/mes.</p>
                )}
              </FECard>
            )}

            {formValid && (
              <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => void handleSave()}>
                Guardar mi meta →
              </button>
            )}
          </div>
        )}

        {/* Pantalla 3 — Confirmacion */}
        {step === 3 && (
          <div className="space-y-6">
            <FECard variant="flat" className="text-center py-4 border-2" style={{ backgroundColor: successBg, borderColor: successColor }}>
              <p className="text-2xl font-bold">🎯 Meta guardada</p>
              <p className="font-bold mt-2">{meta}</p>
              <div className="flex justify-center gap-2 mt-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-sm font-bold text-white" style={{ backgroundColor: successColor }}>${montoNum.toLocaleString()}</span>
                <span className="px-3 py-1 rounded-full text-sm font-bold border" style={{ borderColor: successColor, color: '#059669' }}>${aportNum.toLocaleString()}/mes</span>
              </div>
            </FECard>
            <FinniMessage variant="success" title="Tu meta esta guardada" message="En la proxima leccion construiremos el plan semana a semana." />
          </div>
        )}
      </div>
    </LessonShell>
  );
}
