import { useEffect, useState } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

type Instrumento = 'cetes' | 'fondoBalanceado' | 'acciones';
type Portafolio = Record<Instrumento, number>;

const INSTRUMENTOS: { key: Instrumento; nombre: string; rendimiento: number; riesgo: string; emoji: string }[] = [
  { key: 'cetes', nombre: 'CETES (deuda)', rendimiento: 0.10, riesgo: 'Bajo', emoji: '🔵' },
  { key: 'fondoBalanceado', nombre: 'Fondo balanceado', rendimiento: 0.08, riesgo: 'Medio', emoji: '🟡' },
  { key: 'acciones', nombre: 'Acciones BMV', rendimiento: 0.12, riesgo: 'Alto', emoji: '🔴' },
];

function calcRendimientoPortafolio(p: Portafolio): number {
  const total = p.cetes + p.fondoBalanceado + p.acciones;
  if (total === 0) return 0;
  return INSTRUMENTOS.reduce((acc, inst) => acc + (p[inst.key] / total) * inst.rendimiento, 0) * 100;
}

const infoColor = 'var(--color-brand-info)';
const infoBg = 'var(--color-brand-info-bg)';
const successColor = 'var(--color-brand-success)';
const successBg = 'var(--color-brand-success-bg)';
const errorColor = 'var(--color-brand-error)';
const errorBg = 'var(--color-brand-error-bg)';
const warnColor = 'var(--color-brand-warning)';
const warnBg = 'var(--color-brand-warning-bg)';

export default function L09() {
  const [step, setStep] = useState(0);
  const [portafolio, setPortafolio] = useState<Portafolio>({ cetes: 400, fondoBalanceado: 300, acciones: 300 });
  const [portafolioConfirmado, setPortafolioConfirmado] = useState(false);
  const [perfilGuardado, setPerfilGuardado] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await lessonDataRepository.load<{ perfil: string }>('inversion', 'l08_perfil_riesgo');
      if (data?.perfil) setPerfilGuardado(data.perfil);
    };
    void load();
  }, []);

  const total = portafolio.cetes + portafolio.fondoBalanceado + portafolio.acciones;
  const concentracion = Math.max(...Object.values(portafolio)) / total * 100;
  const esDiversificado = concentracion <= 70;
  const rendimientoEst = calcRendimientoPortafolio(portafolio);

  const sugerenciaSegunPerfil = () => {
    if (perfilGuardado === 'conservador') return '70% CETES · 20% Fondo balanceado · 10% Acciones';
    if (perfilGuardado === 'agresivo') return '20% CETES · 30% Fondo balanceado · 50% Acciones';
    return '40% CETES · 35% Fondo balanceado · 25% Acciones';
  };

  const setInstPct = (key: Instrumento, pct: number) => {
    setPortafolio((prev) => {
      const otros = Object.keys(prev).filter((k) => k !== key) as Instrumento[];
      const totalOtros = total - prev[key];
      const newVal = Math.round((pct / 100) * total);
      const diff = newVal - prev[key];
      const updated = { ...prev, [key]: newVal };
      if (diff !== 0 && totalOtros > 0) {
        const factor = (total - newVal) / totalOtros;
        otros.forEach((k) => {
          updated[k] = Math.max(0, Math.round(prev[k] * factor));
        });
        const suma = Object.values(updated).reduce((a, b) => a + b, 0);
        if (suma !== total) {
          const ajuste = total - suma;
          const otroAjustar = otros.find((k) => updated[k] + ajuste >= 0);
          if (otroAjustar) updated[otroAjustar] += ajuste;
        }
      }
      return updated;
    });
  };

  const progress = (step / 2) * 100;

  return (
    <LessonShell
      id="L09"
      title="No pongas todos los huevos en la misma canasta: diversificación"
      completion={{ ready: portafolioConfirmado }}
    >
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: infoColor }} />
        </div>

        {/* Pantalla 0 — Concepto + tipos */}
        {step === 0 && (
          <div className="space-y-6">
            <FinniMessage
              variant="coach"
              title="La analogía de las canastas"
              message="Imagina que llevas 12 huevos en una canasta. Tropiezas. Pierdes los 12. Ahora imagina que los llevas en 4 canastas de 3 huevos. Tropiezas. Pierdes 3. Eso es la diversificación."
            />
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="font-bold mb-2">¿Qué es diversificar?</p>
              <p className="text-sm mb-4">
                Distribuir tu dinero en diferentes tipos de inversión para que si una baja, las otras amortigüen la pérdida.
              </p>
              <div className="space-y-2">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold text-white mb-1" style={{ backgroundColor: errorColor }}>❌ No diversificado</span>
                  <p className="text-sm">100% en acciones de una sola empresa. Si quiebra, pierdes todo.</p>
                </div>
                <div>
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold text-white mb-1" style={{ backgroundColor: successColor }}>✅ Diversificado</span>
                  <p className="text-sm">50% CETES + 30% fondo balanceado + 20% acciones de diferentes sectores.</p>
                </div>
              </div>
              <p className="text-sm mt-4 italic text-[var(--color-text-secondary)]">
                "Con $1,000 puedes tener CETES y un fondo de inversión. Eso ya es diversificación."
              </p>
            </FECard>
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="font-bold mb-2">3 tipos de diversificación</p>
              {[
                { tipo: 'Por instrumento', ej: 'CETES + fondos + acciones' },
                { tipo: 'Por plazo', ej: 'CETES 28 días (corto) + fondos a 1 año (mediano)' },
                { tipo: 'Por sector', ej: 'Tecnología + salud + consumo básico (para acciones)' },
              ].map((t) => (
                <div key={t.tipo} className="py-2 border-b border-[var(--color-neutral-200)] last:border-0">
                  <p className="text-sm font-bold">{t.tipo}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{t.ej}</p>
                </div>
              ))}
            </FECard>
            <div className="p-4 rounded-2xl border-2" style={{ borderColor: warnColor, backgroundColor: warnBg }}>
              <p className="font-bold mb-2">Año adverso en el mercado:</p>
              <div className="flex gap-4">
                <div className="flex-1">
                  <p className="text-xs font-bold">Portafolio concentrado (100% una acción)</p>
                  <p className="text-2xl font-black" style={{ color: errorColor }}>-40%</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold">Portafolio diversificado</p>
                  <p className="text-2xl font-black" style={{ color: successColor }}>-12%</p>
                </div>
              </div>
            </div>
            <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: infoColor }} onClick={() => setStep(1)}>
              Construir mi portafolio →
            </button>
          </div>
        )}

        {/* Pantalla 1 — Constructor de portafolio */}
        {step === 1 && (
          <div className="space-y-6">
            <p className="text-2xl font-bold">Constructor de portafolio</p>
            <p className="text-sm text-[var(--color-text-secondary)]">Distribuye $1,000 virtuales entre los instrumentos:</p>
            {perfilGuardado && (
              <FECard variant="flat" className="border" style={{ backgroundColor: infoBg, borderColor: infoColor }}>
                <p className="text-xs font-bold">Sugerencia según tu perfil ({perfilGuardado}):</p>
                <p className="text-xs">{sugerenciaSegunPerfil()}</p>
              </FECard>
            )}
            <div className="space-y-4">
              {INSTRUMENTOS.map((inst) => {
                const pct = Math.round((portafolio[inst.key] / total) * 100);
                return (
                  <div key={inst.key} className="p-4 rounded-2xl bg-white border border-[var(--color-neutral-200)]">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-bold">{inst.emoji} {inst.nombre}</p>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold border" style={{ borderColor: successColor, color: successColor }}>{inst.rendimiento * 100}%/año</span>
                        <p className="font-black" style={{ color: warnColor }}>{pct}%</p>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0} max={100} step={5}
                      value={pct}
                      onChange={(e) => setInstPct(inst.key, Number(e.target.value))}
                      className="w-full accent-[var(--color-brand-info)]"
                    />
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      Riesgo: {inst.riesgo} · ${portafolio[inst.key].toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
            <FECard
              variant="flat"
              className="border-2"
              style={{
                borderColor: esDiversificado ? successColor : errorColor,
                backgroundColor: esDiversificado ? successBg : errorBg,
              }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">Rendimiento estimado</p>
                  <p className="text-2xl font-black">{rendimientoEst.toFixed(1)}% anual</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">Diversificación</p>
                  <span
                    className="inline-block mt-1 px-3 py-1 rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: esDiversificado ? successColor : errorColor }}
                  >
                    {esDiversificado ? '✅ Diversificado' : '⚠️ Muy concentrado'}
                  </span>
                </div>
              </div>
              {!esDiversificado && (
                <p className="text-xs mt-2" style={{ color: errorColor }}>
                  Tu portafolio está concentrado ({Math.round(concentracion)}% en un solo instrumento). Considera diversificar.
                </p>
              )}
            </FECard>
            <FECard variant="flat" className="border" style={{ backgroundColor: infoBg, borderColor: infoColor }}>
              <p className="text-xs font-bold">Regla "100 menos tu edad":</p>
              <p className="text-xs">Si tienes 22 años: máximo 78% en renta variable (100 - 22 = 78). El resto en instrumentos de deuda más seguros.</p>
            </FECard>
            <button
              className="w-full min-h-11 text-white rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: infoColor }}
              disabled={!esDiversificado}
              onClick={() => setPortafolioConfirmado(true)}
            >
              {portafolioConfirmado
                ? '✅ Portafolio guardado'
                : esDiversificado
                  ? 'Confirmar portafolio diversificado'
                  : 'Diversifica primero (máx. 70% en un instrumento)'}
            </button>
            {portafolioConfirmado && (
              <FinniMessage
                variant="success"
                title="¡Portafolio diversificado confirmado!"
                message="Ahora sabes cómo distribuir tu dinero para reducir riesgo sin sacrificar rendimiento. Este es el pensamiento del inversionista prudente."
              />
            )}
          </div>
        )}
      </div>
    </LessonShell>
  );
}
