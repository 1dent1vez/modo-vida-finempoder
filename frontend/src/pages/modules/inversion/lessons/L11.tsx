import { useState } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';

const TIPOS_COMISION = [
  { tipo: 'Por administración', desc: 'Cobro anual del fondo por gestionar tu dinero.', ejemplo: '2% anual' },
  { tipo: 'Por compra/venta', desc: 'Al entrar o salir de algunos fondos.', ejemplo: '1% de entrada' },
  { tipo: 'Por custodia', desc: 'En algunos brokers por mantener tus acciones.', ejemplo: '0.5% anual' },
  { tipo: 'Spread', desc: 'Diferencia entre precio de compra y venta en divisas y algunos instrumentos.', ejemplo: 'Variable' },
];

const FONDOS_FICTICIOS = [
  { nombre: 'Fondo A', rendimientoBruto: 10, comision: 0.5 },
  { nombre: 'Fondo B', rendimientoBruto: 10, comision: 2.0 },
  { nombre: 'Fondo C', rendimientoBruto: 10, comision: 3.5 },
];

const ISR_RETENCION = 0.15;

function calcRendimientoNeto(bruto: number, comision: number, isr: number): number {
  const despuesComision = bruto - comision;
  const impuesto = despuesComision * (isr / 100);
  return despuesComision - impuesto;
}

function calcCrecimiento(monto: number, tasa: number, anios: number): number {
  return monto * Math.pow(1 + tasa / 100, anios);
}

const infoColor = 'var(--color-brand-info)';
const infoBg = 'var(--color-brand-info-bg)';
const successColor = 'var(--color-brand-success)';
const successBg = 'var(--color-brand-success-bg)';
const errorColor = 'var(--color-brand-error)';
const errorBg = 'var(--color-brand-error-bg)';

export default function L11() {
  const [step, setStep] = useState(0);
  const [monto, setMonto] = useState(10000);
  const [rendimientoBruto, setRendimientoBruto] = useState(10);
  const [comisionAdmin, setComisionAdmin] = useState(2);
  const [plazo, setPlazo] = useState(5);
  const [calculado, setCalculado] = useState(false);
  const [simulacroHecho, setSimulacroHecho] = useState(false);
  const [respuestaSimulacro, setRespuestaSimulacro] = useState<string[]>(['', '', '']);

  const rendiNeto = calcRendimientoNeto(rendimientoBruto, comisionAdmin, ISR_RETENCION);
  const crecimientoBruto = calcCrecimiento(monto, rendimientoBruto, plazo);
  const crecimientoNeto = calcCrecimiento(monto, rendiNeto, plazo);
  const diferencia = crecimientoBruto - crecimientoNeto;

  const simulacroListo = respuestaSimulacro.every((r) => r.trim().length >= 3);

  const progress = (step / 2) * 100;

  return (
    <LessonShell
      id="L11"
      title="Las comisiones se comen tus ganancias: cómo detectarlas"
      completion={{ ready: calculado && simulacroHecho }}
    >
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: infoColor }} />
        </div>

        {/* Pantalla 0 — Tipos de comisiones + ISR */}
        {step === 0 && (
          <div className="space-y-6">
            <FinniMessage
              variant="coach"
              title="El rendimiento que anuncian no es lo que recibes"
              message='Te dijeron que el fondo tiene un rendimiento del 10% anual. ¡Genial! Pero nadie te mencionó las comisiones. Al final del año, puede que solo hayas ganado el 6%. Hoy aprendemos a leer la letra chica.'
            />
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="font-bold mb-4">Tipos de comisiones</p>
              <div className="space-y-3">
                {TIPOS_COMISION.map((c) => (
                  <div key={c.tipo} className="flex justify-between items-start pb-3 border-b border-[var(--color-neutral-200)] last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-bold">{c.tipo}</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">{c.desc}</p>
                    </div>
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold border flex-shrink-0" style={{ borderColor: infoColor, color: infoColor }}>{c.ejemplo}</span>
                  </div>
                ))}
              </div>
            </FECard>
            <FECard variant="flat" className="border" style={{ backgroundColor: infoBg, borderColor: infoColor }}>
              <p className="font-bold mb-1">ISR (Impuesto sobre Rendimientos)</p>
              <p className="text-sm">
                Los rendimientos de inversiones en México pagan ISR. En CETES es automático
                (retención de ~0.15% en 2024 — ya viene descontado). En acciones, debes declarar.
              </p>
              <p className="text-sm mt-2 italic">
                "No es para asustarte. Es para que tus cálculos sean realistas desde el principio."
              </p>
            </FECard>
            <FinniMessage
              variant="coach"
              title="Ninguna comisión es mala per se"
              message="Lo malo es no saberla antes de invertir. Siempre pregunta: ¿cuál es el costo total anual de esta inversión?"
            />
            <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: infoColor }} onClick={() => setStep(1)}>
              Calculadora de comisiones →
            </button>
          </div>
        )}

        {/* Pantalla 1 — Calculadora + comparador + simulacro */}
        {step === 1 && (
          <div className="space-y-6">
            <p className="text-2xl font-bold">Calculadora de rendimiento neto</p>
            <div className="space-y-3">
              {[
                { label: 'Monto de inversión ($)', value: monto, onChange: (v: number) => setMonto(Math.max(0, v)), min: 0, step: 1000 },
                { label: 'Rendimiento bruto anunciado (%)', value: rendimientoBruto, onChange: (v: number) => setRendimientoBruto(Math.max(0, Math.min(50, v))), min: 0, step: 0.5 },
                { label: 'Comisión de administración anual (%)', value: comisionAdmin, onChange: (v: number) => setComisionAdmin(Math.max(0, Math.min(10, v))), min: 0, step: 0.5 },
                { label: 'Plazo (años)', value: plazo, onChange: (v: number) => setPlazo(Math.max(1, Math.min(30, v))), min: 1, step: 1 },
              ].map(({ label, value, onChange, min, step: s }) => (
                <div key={label}>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">{label}</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    min={min}
                    step={s}
                    className="w-full border border-[var(--color-neutral-200)] rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <div className="flex-1 p-3 rounded-2xl bg-[var(--color-neutral-100)]">
                <p className="text-xs text-[var(--color-text-secondary)]">Rendimiento bruto</p>
                <p className="text-xl font-black">{rendimientoBruto}%</p>
                <p className="text-xs">Recibirías: ${crecimientoBruto.toFixed(0)}</p>
              </div>
              <div className="flex-1 p-3 rounded-2xl border-2" style={{ borderColor: successColor, backgroundColor: successBg }}>
                <p className="text-xs text-[var(--color-text-secondary)]">Rendimiento neto real</p>
                <p className="text-xl font-black" style={{ color: successColor }}>{rendiNeto.toFixed(2)}%</p>
                <p className="text-xs">Recibirías: ${crecimientoNeto.toFixed(0)}</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl border-2" style={{ borderColor: errorColor, backgroundColor: errorBg }}>
              <p className="text-xs font-bold" style={{ color: errorColor }}>Impacto de comisiones en {plazo} años:</p>
              <p className="text-2xl font-black" style={{ color: errorColor }}>-${diferencia.toFixed(0)}</p>
              <p className="text-xs">Eso es real. Las comisiones importan.</p>
            </div>
            {!calculado && (
              <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: infoColor }} onClick={() => setCalculado(true)}>
                ✅ Confirmar cálculo
              </button>
            )}

            {calculado && (
              <div className="space-y-6">
                <p className="text-xl font-bold">Comparador: 3 fondos, mismo rendimiento bruto</p>
                <div className="space-y-3">
                  {FONDOS_FICTICIOS.map((f) => {
                    const neto = calcRendimientoNeto(f.rendimientoBruto, f.comision, ISR_RETENCION);
                    const chipColor = f.comision <= 1 ? successColor : f.comision <= 2 ? 'var(--color-brand-warning)' : errorColor;
                    return (
                      <div key={f.nombre} className="p-3 rounded-2xl bg-white border border-[var(--color-neutral-200)] flex justify-between items-center">
                        <div>
                          <p className="font-bold">{f.nombre}</p>
                          <p className="text-xs text-[var(--color-text-secondary)]">Bruto: {f.rendimientoBruto}% · Comisión: {f.comision}%</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: chipColor }}>
                          Neto: {neto.toFixed(2)}%
                        </span>
                      </div>
                    );
                  })}
                </div>

                <p className="text-xl font-bold">Simulacro: las 3 preguntas clave</p>
                <p className="text-sm text-[var(--color-text-secondary)]">Practica formulando las preguntas que siempre debes hacer antes de invertir:</p>
                {[
                  'Escribe cómo preguntarías: "¿Cuál es el rendimiento bruto?"',
                  'Escribe cómo preguntarías: "¿Cuáles son las comisiones totales?"',
                  'Escribe cómo preguntarías: "¿Cuánto ISR se retiene?"',
                ].map((pregunta, i) => (
                  <FECard key={i} variant="flat" className="border" style={{ borderColor: respuestaSimulacro[i].trim().length >= 3 ? successColor : 'var(--color-neutral-200)' }}>
                    <p className="text-sm mb-2">{pregunta}</p>
                    <input
                      type="text"
                      placeholder="Tu pregunta al asesor..."
                      value={respuestaSimulacro[i]}
                      onChange={(e) => setRespuestaSimulacro((prev) => prev.map((r, idx) => idx === i ? e.target.value : r))}
                      className="w-full border border-[var(--color-neutral-200)] rounded-xl px-4 py-2.5 text-sm"
                    />
                  </FECard>
                ))}
                {simulacroListo && !simulacroHecho && (
                  <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: infoColor }} onClick={() => setSimulacroHecho(true)}>
                    ✅ Completar simulacro
                  </button>
                )}
                {simulacroHecho && (
                  <FinniMessage
                    variant="success"
                    title="¡Simulacro completado!"
                    message="Ahora sabes las 3 preguntas que siempre debes hacer antes de invertir. Ese hábito puede ahorrarte miles de pesos."
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </LessonShell>
  );
}
