import { cn } from '@/lib/utils';
import { useState } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';

const infoColor    = 'var(--color-brand-info)';
const infoBg       = 'var(--color-brand-info-bg)';
const warnColor    = 'var(--color-brand-warning)';
const warnBg       = 'var(--color-brand-warning-bg)';
const successColor = 'var(--color-brand-success)';
const successBg    = 'var(--color-brand-success-bg)';

const FICHAS = [
  { nombre: 'CETES', frente: { plazo: '28, 91, 182 o 364 días', tasa: '~10% anual (referencial)', minimo: '$100 pesos', donde: 'cetesdirecto.com (sin intermediarios)', riesgo: '⭐⭐☆☆☆ — Muy bajo' }, reverso: 'Desventajas: si retiras antes del plazo puedes perder algo del rendimiento. La tasa es fija — no se beneficia de alzas del mercado.' },
  { nombre: 'BONDES', frente: { plazo: '3-5 años', tasa: 'Variable (ligada a TIIE)', minimo: '$100 pesos', donde: 'cetesdirecto.com', riesgo: '⭐⭐☆☆☆ — Bajo' }, reverso: 'Tasa variable significa que puede subir o bajar con el mercado. Plazo largo — no ideal si necesitas liquidez pronto.' },
  { nombre: 'PRLV', frente: { plazo: 'Plazo fijo (días a meses)', tasa: 'Garantizada', minimo: 'Varía por banco', donde: 'Bancos comerciales', riesgo: '⭐⭐☆☆☆ — Bajo (IPAB)' }, reverso: 'Ofrecidos por bancos, no directamente del gobierno. Protegidos por IPAB hasta 400,000 UDIS. Rendimientos algo menores que CETES.' },
];

const MONTOS_SIMULACION = [100, 500, 1000];
const PLAZOS = [28, 91];
const TASA_ANUAL = 0.10;

function calcRendimiento(monto: number, plazo: number): number {
  return monto * TASA_ANUAL * (plazo / 365);
}

export default function L06() {
  const [step, setStep] = useState(0);
  const [flipped, setFlipped] = useState<boolean[]>([false, false, false]);
  const [montoSim, setMontoSim] = useState<number | 'custom'>(100);
  const [customMonto, setCustomMonto] = useState(200);
  const [plazoSim, setPlazoSim] = useState(28);
  const [simulado, setSimulado] = useState(false);

  const allFlipped = flipped.every(Boolean);
  const montoReal = montoSim === 'custom' ? customMonto : montoSim;
  const rendimiento = calcRendimiento(montoReal, plazoSim);

  const flipCard = (i: number) => {
    setFlipped((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  };

  const progressPct = (step / 3) * 100;

  return (
    <LessonShell
      id="L06"
      title="CETES, BONDES y PRLV: la inversión del gobierno mexicano"
      completion={{ ready: simulado }}
    >
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full transition-all" style={{ width: `${progressPct}%`, backgroundColor: infoColor }} />
        </div>

        {/* Pantalla 0 — CETES en detalle */}
        {step === 0 && (
          <div className="space-y-6">
            <FinniMessage
              variant="coach"
              title="Puedes prestarle dinero al gobierno mexicano"
              message="¿Sabías que puedes prestarle dinero al gobierno mexicano y cobrarle intereses? Eso exactamente son los CETES. Y puedes empezar con $100."
            />
            <FECard variant="flat" className="border-2" style={{ backgroundColor: warnBg, borderColor: warnColor }}>
              <p className="font-extrabold mb-3">CETES — Los datos que importan:</p>
              <div className="space-y-2">
                {[
                  { label: 'Plazos disponibles', valor: '28, 91, 182 o 364 días' },
                  { label: 'Dónde comprar', valor: 'cetesdirecto.com (sin comisiones)' },
                  { label: 'Monto mínimo', valor: '$100 pesos' },
                  { label: 'Riesgo', valor: 'Muy bajo — respaldado por el Banco de México' },
                  { label: 'Cómo funciona', valor: 'Le prestas dinero al gobierno por X días. Al vencer recibes tu dinero + intereses.' },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between border-b border-[var(--color-neutral-200)] pb-1">
                    <span className="text-xs text-[var(--color-text-secondary)]">{row.label}</span>
                    <span className="text-xs font-bold text-right max-w-[60%]">{row.valor}</span>
                  </div>
                ))}
              </div>
            </FECard>
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="font-bold mb-2">BONDES y PRLV (variantes)</p>
              <div className="space-y-3">
                <div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold mb-1" style={{ backgroundColor: infoBg, color: infoColor }}>BONDES</span>
                  <p className="text-sm">Similar a CETES pero a plazos más largos (3-5 años). Tasa variable ligada a TIIE.</p>
                </div>
                <div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold mb-1" style={{ backgroundColor: successBg, color: successColor }}>PRLV</span>
                  <p className="text-sm">Ofrecidos por bancos. Plazo fijo, tasa garantizada, protegidos por IPAB.</p>
                </div>
              </div>
              <FinniMessage
                variant="coach"
                title="Para un primer acercamiento"
                message="Los CETES son la puerta de entrada más segura y accesible. Empezar con ellos es la decisión correcta."
              />
            </FECard>
            <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: infoColor }} onClick={() => setStep(1)}>
              Ver mini-fichas →
            </button>
          </div>
        )}

        {/* Pantalla 1 — Mini-fichas flip */}
        {step === 1 && (
          <div className="space-y-6">
            <p className="text-lg font-bold">Mini-fichas: toca para voltear</p>
            <div className="space-y-4">
              {FICHAS.map((ficha, i) => {
                const isFlipped = flipped[i];
                return (
                  <div
                    key={ficha.nombre}
                    className="p-4 rounded-2xl cursor-pointer border-2 transition-all duration-300"
                    style={{
                      borderColor: isFlipped ? infoColor : warnColor,
                      backgroundColor: isFlipped ? infoBg : warnBg,
                    }}
                    onClick={() => flipCard(i)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-extrabold">{ficha.nombre}</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: isFlipped ? infoBg : warnBg, color: isFlipped ? infoColor : warnColor, border: `1px solid ${isFlipped ? infoColor : warnColor}` }}>
                        {isFlipped ? 'Desventajas' : 'Características'}
                      </span>
                    </div>
                    {!isFlipped ? (
                      <div className="space-y-1">
                        <p className="text-xs"><strong>Plazo:</strong> {ficha.frente.plazo}</p>
                        <p className="text-xs"><strong>Tasa:</strong> {ficha.frente.tasa}</p>
                        <p className="text-xs"><strong>Mínimo:</strong> {ficha.frente.minimo}</p>
                        <p className="text-xs"><strong>Riesgo:</strong> {ficha.frente.riesgo}</p>
                      </div>
                    ) : (
                      <p className="text-sm">{ficha.reverso}</p>
                    )}
                  </div>
                );
              })}
            </div>
            {!allFlipped && (
              <p className="text-xs text-[var(--color-text-secondary)] text-center">Voltea las 3 fichas para continuar</p>
            )}
            {allFlipped && (
              <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: infoColor }} onClick={() => setStep(2)}>
                Simular compra de CETES →
              </button>
            )}
          </div>
        )}

        {/* Pantalla 2 — Simulación de compra + alerta fiscal */}
        {step === 2 && (
          <div className="space-y-6">
            <p className="text-lg font-bold">Simulador de compra de CETES</p>
            <FECard variant="flat" className="border border-[var(--color-brand-warning)]">
              <p className="font-bold mb-3">Paso 1: Elige tu monto</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {MONTOS_SIMULACION.map((m) => (
                  <button
                    key={m}
                    className={cn(
                      'px-3 py-1 rounded-full text-sm font-semibold border transition-colors',
                      montoSim === m ? 'text-white' : 'bg-transparent'
                    )}
                    style={montoSim === m ? { backgroundColor: warnColor, borderColor: warnColor } : { borderColor: warnColor, color: warnColor }}
                    onClick={() => setMontoSim(m)}
                  >
                    ${m}
                  </button>
                ))}
                <button
                  className={cn('px-3 py-1 rounded-full text-sm font-semibold border transition-colors', montoSim === 'custom' ? 'text-white' : 'bg-transparent')}
                  style={montoSim === 'custom' ? { backgroundColor: warnColor, borderColor: warnColor } : { borderColor: warnColor, color: warnColor }}
                  onClick={() => setMontoSim('custom')}
                >
                  Otro monto
                </button>
              </div>
              {montoSim === 'custom' && (
                <input
                  type="number"
                  min={100}
                  step={100}
                  value={customMonto}
                  onChange={(e) => setCustomMonto(Math.max(100, Number(e.target.value)))}
                  className="w-full border border-[var(--color-neutral-200)] rounded-lg p-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-info)]"
                  placeholder="Monto (mín. $100)"
                />
              )}
              <p className="font-bold mt-3 mb-2">Paso 2: Elige el plazo</p>
              <div className="flex gap-2">
                {PLAZOS.map((p) => (
                  <button
                    key={p}
                    className={cn('px-3 py-1 rounded-full text-sm font-semibold border transition-colors', plazoSim === p ? 'text-white' : 'bg-transparent')}
                    style={plazoSim === p ? { backgroundColor: warnColor, borderColor: warnColor } : { borderColor: warnColor, color: warnColor }}
                    onClick={() => setPlazoSim(p)}
                  >
                    {p} días
                  </button>
                ))}
              </div>
            </FECard>
            <FECard variant="flat" className="border-2" style={{ backgroundColor: successBg, borderColor: successColor }}>
              <p className="text-sm">Paso 3: Tu rendimiento estimado</p>
              <p className="text-xs text-[var(--color-text-secondary)]">(Tasa referencial: {(TASA_ANUAL * 100).toFixed(1)}% anual)</p>
              <div className="flex justify-between mt-2">
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)]">Inviertes</p>
                  <p className="text-base font-extrabold">${montoReal.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)]">Ganas en {plazoSim} días</p>
                  <p className="text-base font-extrabold" style={{ color: '#059669' }}>+${rendimiento.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)]">Recibes al vencimiento</p>
                  <p className="text-base font-extrabold">${(montoReal + rendimiento).toFixed(2)}</p>
                </div>
              </div>
            </FECard>
            <div className="p-3 rounded-xl bg-gray-100 flex gap-2 items-start">
              <span className="text-sm">ℹ️</span>
              <div>
                <p className="text-xs font-bold">Alerta fiscal</p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Los rendimientos de CETES pagan ISR (retención automática ~0.15% en 2024). Ya viene descontado — sin sorpresas.
                </p>
              </div>
            </div>
            <FinniMessage
              variant="coach"
              title="Puedes hacer tu primera inversión real con $100"
              message="Ve a cetesdirecto.com, crea tu cuenta (es gratis) y haz tu primera compra. Es más fácil de lo que parece."
            />
            {!simulado ? (
              <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: infoColor }} onClick={() => setSimulado(true)}>
                ✅ Confirmar compra virtual
              </button>
            ) : (
              <FECard variant="flat" className="text-center border-2" style={{ backgroundColor: successBg, borderColor: successColor }}>
                <p className="text-4xl">🎉</p>
                <p className="font-extrabold">¡Compra virtual completada!</p>
                <p className="text-sm">
                  Compraste ${montoReal} en CETES a {plazoSim} días. En el mercado real recibirías ${(montoReal + rendimiento).toFixed(2)}.
                </p>
              </FECard>
            )}
          </div>
        )}
      </div>
    </LessonShell>
  );
}
