import { useState } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';

// Dato referencial INEGI 2024
const INFLACION_MEXICO_2024 = 4.66;

const HISTORICO = [
  { año: '2020', cetes: 4.5, inflacion: 3.15 },
  { año: '2021', cetes: 4.4, inflacion: 7.36 },
  { año: '2022', cetes: 9.5, inflacion: 8.7 },
  { año: '2023', cetes: 11.2, inflacion: 4.66 },
  { año: '2024', cetes: 10.0, inflacion: 4.66 },
];

const infoColor = 'var(--color-brand-info)';
const infoBg = 'var(--color-brand-info-bg)';
const successColor = 'var(--color-brand-success)';
const successBg = 'var(--color-brand-success-bg)';
const errorColor = 'var(--color-brand-error)';
const errorBg = 'var(--color-brand-error-bg)';
const warnColor = 'var(--color-brand-warning)';
const warnBg = 'var(--color-brand-warning-bg)';

export default function L12() {
  const [step, setStep] = useState(0);
  const [rendimientoUsuario, setRendimientoUsuario] = useState(10);
  const [inflacionUsuario, setInflacionUsuario] = useState(INFLACION_MEXICO_2024);
  const [montoCalc, setMontoCalc] = useState(10000);
  const [calculado, setCalculado] = useState(false);

  const rendimientoReal = rendimientoUsuario - inflacionUsuario;
  const gananciaNominal = montoCalc * (rendimientoUsuario / 100);
  const gananciaReal = montoCalc * (rendimientoReal / 100);

  const escenario = rendimientoReal > 0 ? 'positivo' : rendimientoReal === 0 ? 'empate' : 'negativo';

  const scenarioBgColor = escenario === 'positivo' ? successBg : escenario === 'negativo' ? errorBg : warnBg;
  const scenarioBorderColor = escenario === 'positivo' ? successColor : escenario === 'negativo' ? errorColor : warnColor;
  const scenarioChipBg = escenario === 'positivo' ? successColor : escenario === 'negativo' ? errorColor : warnColor;

  const progress = (step / 2) * 100;

  return (
    <LessonShell
      id="L12"
      title="Inflación: el enemigo silencioso del rendimiento"
      completion={{ ready: calculado }}
    >
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: infoColor }} />
        </div>

        {/* Pantalla 0 — Concepto de inflación */}
        {step === 0 && (
          <div className="space-y-6">
            <FECard variant="flat" className="border-2 text-center" style={{ borderColor: errorColor, backgroundColor: errorBg }}>
              <p className="text-xl font-black">⚠️ Situación real</p>
              <p className="text-sm mt-2">
                Tu inversión ganó el 5% este año. ¡Genial! Pero la inflación fue del 5.5%.
              </p>
              <p className="text-sm font-black mt-1" style={{ color: errorColor }}>
                Felicidades: perdiste poder adquisitivo aunque ganaste dinero.
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">Eso se llama rendimiento real negativo.</p>
            </FECard>
            <FinniMessage
              variant="coach"
              title="La inflación es el enemigo silencioso"
              message="La inflación es el aumento general de precios. Si la inflación es del 5%, lo que hoy cuesta $100 costará $105 el año que viene."
            />
            <FECard variant="flat" className="border-2" style={{ borderColor: warnColor, backgroundColor: warnBg }}>
              <p className="font-black mb-1">Fórmula simple (aproximada):</p>
              <p className="text-xl font-black" style={{ color: warnColor }}>
                Rendimiento real = Rendimiento nominal − Inflación
              </p>
              <p className="text-sm mt-2">
                Ejemplo: inversión al 7% con inflación del 5% = Rendimiento real del <b>2%</b>
              </p>
            </FECard>
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="font-bold mb-2">Poder adquisitivo: el impacto visual</p>
              <p className="text-sm mb-3">Ejemplo con $10,000 y un año con inflación 5.5%:</p>
              <div className="flex gap-3">
                <div className="flex-1 p-3 rounded-2xl bg-[var(--color-neutral-100)]">
                  <p className="text-xs text-[var(--color-text-secondary)]">Sin invertir</p>
                  <p className="text-xl font-black">$10,000</p>
                  <p className="text-xs" style={{ color: errorColor }}>Compra lo que antes compraban $9,479</p>
                </div>
                <div className="flex-1 p-3 rounded-2xl" style={{ backgroundColor: successBg }}>
                  <p className="text-xs text-[var(--color-text-secondary)]">Al 5% anual</p>
                  <p className="text-xl font-black">$10,500</p>
                  <p className="text-xs" style={{ color: errorColor }}>Poder real: $9,953 (aún pierdes un poco)</p>
                </div>
              </div>
            </FECard>
            <FECard variant="flat" className="border" style={{ borderColor: infoColor, backgroundColor: infoBg }}>
              <p className="text-sm font-bold">El INPC (Índice Nacional de Precios al Consumidor)</p>
              <p className="text-sm">
                Mide la inflación en México. Puedes consultarlo en INEGI.gob.mx. Dato actual referencial: <b>{INFLACION_MEXICO_2024}%</b>
              </p>
            </FECard>
            <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: infoColor }} onClick={() => setStep(1)}>
              Calculadora y datos históricos →
            </button>
          </div>
        )}

        {/* Pantalla 1 — Calculadora + histórico */}
        {step === 1 && (
          <div className="space-y-6">
            <p className="text-2xl font-bold">Calculadora de rendimiento real</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Rendimiento de mi inversión (%)</label>
                <input
                  type="number"
                  value={rendimientoUsuario}
                  onChange={(e) => setRendimientoUsuario(Number(e.target.value))}
                  step={0.5}
                  className="w-full border border-[var(--color-neutral-200)] rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                  Inflación actual de México (% INEGI — referencia: {INFLACION_MEXICO_2024}%)
                </label>
                <input
                  type="number"
                  value={inflacionUsuario}
                  onChange={(e) => setInflacionUsuario(Number(e.target.value))}
                  step={0.1}
                  className="w-full border border-[var(--color-neutral-200)] rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Monto de inversión ($)</label>
                <input
                  type="number"
                  value={montoCalc}
                  onChange={(e) => setMontoCalc(Math.max(0, Number(e.target.value)))}
                  min={0}
                  step={1000}
                  className="w-full border border-[var(--color-neutral-200)] rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl border-2" style={{ borderColor: scenarioBorderColor, backgroundColor: scenarioBgColor }}>
              <p className="text-sm">Rendimiento real:</p>
              <p className="text-3xl font-black">
                {rendimientoReal >= 0 ? '+' : ''}{rendimientoReal.toFixed(2)}%
              </p>
              <span className="inline-block mt-2 px-3 py-1 rounded-full text-sm font-bold text-white" style={{ backgroundColor: scenarioChipBg }}>
                {escenario === 'positivo' ? '✅ Ganas en términos reales' : escenario === 'negativo' ? '❌ Pérdida real de poder adquisitivo' : '⚠️ Empate — ni ganas ni pierdes'}
              </span>
              <div className="flex gap-6 mt-3">
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)]">Ganancia nominal</p>
                  <p className="text-sm font-bold">${gananciaNominal.toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)]">Ganancia real</p>
                  <p className="text-sm font-bold" style={{ color: gananciaReal >= 0 ? successColor : errorColor }}>
                    {gananciaReal >= 0 ? '+' : ''}${gananciaReal.toFixed(0)}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xl font-bold">Histórico: CETES vs Inflación en México</p>
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              {HISTORICO.map((dato) => {
                const real = dato.cetes - dato.inflacion;
                return (
                  <div key={dato.año} className="flex justify-between items-center py-2 border-b border-[var(--color-neutral-200)] last:border-0">
                    <p className="text-sm font-bold">{dato.año}</p>
                    <p className="text-xs">CETES: {dato.cetes}%</p>
                    <p className="text-xs">Inflación: {dato.inflacion}%</p>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: real >= 0 ? successColor : errorColor }}>
                      Real: {real >= 0 ? '+' : ''}{real.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </FECard>

            <FinniMessage
              variant="coach"
              title="Ahora cuando veas un rendimiento, la primera pregunta es:"
              message={`¿Es mayor que la inflación actual (${INFLACION_MEXICO_2024}%)? Si no lo supera, en términos reales estás perdiendo poder adquisitivo.`}
            />
            {!calculado && (
              <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: infoColor }} onClick={() => setCalculado(true)}>
                ✅ Confirmar cálculo personal
              </button>
            )}
            {calculado && (
              <FECard variant="flat" className="border-2 text-center py-4" style={{ borderColor: successColor, backgroundColor: successBg }}>
                <p className="text-4xl">📊</p>
                <p className="font-black">¡Calculadora completada!</p>
                <p className="text-sm">
                  Tu rendimiento real es del {rendimientoReal.toFixed(2)}%.{' '}
                  {escenario === 'positivo' ? 'Estás ganando en términos reales.' : '¡Busca inversiones que superen la inflación!'}
                </p>
              </FECard>
            )}
          </div>
        )}
      </div>
    </LessonShell>
  );
}
