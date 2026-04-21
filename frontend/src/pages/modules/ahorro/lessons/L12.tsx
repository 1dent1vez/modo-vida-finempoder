import { useState, useEffect, useMemo } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

type MetaData = { nombre?: string; monto?: number; aportacionMensual?: number } | null;

const TASAS = [
  { label: 'Cuenta ahorro basica', value: 3 },
  { label: 'CETES', value: 8 },
  { label: 'Fondos de inversion', value: 10 },
  { label: 'Acciones (estimado)', value: 15 },
];

const successColor = 'var(--color-brand-success)';
const successBg = 'var(--color-brand-success-bg)';
const warnColor = 'var(--color-brand-warning)';
const infoColor = 'var(--color-brand-info)';
const infoBg = 'var(--color-brand-info-bg)';

function calcCompuesto(capital: number, mensual: number, tasaAnual: number, anos: number): number {
  const r = tasaAnual / 100 / 12;
  const n = anos * 12;
  if (r === 0) return capital + mensual * n;
  return capital * Math.pow(1 + r, n) + mensual * ((Math.pow(1 + r, n) - 1) / r);
}

function calcSimple(capital: number, mensual: number, tasaAnual: number, anos: number): number {
  return capital * (1 + tasaAnual / 100 * anos) + mensual * anos * 12;
}

const fmt = (n: number) => n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export default function L12() {
  const [step, setStep] = useState(0);
  const [metaData, setMetaData] = useState<MetaData>(null);
  const [capital, setCapital] = useState(1000);
  const [aportMensual, setAportMensual] = useState(200);
  const [tasaIdx, setTasaIdx] = useState(1);
  const [anos, setAnos] = useState(5);
  const [used, setUsed] = useState(false);

  useEffect(() => {
    const load = async () => {
      const meta = await lessonDataRepository.load<MetaData>('ahorro', 'l5_meta');
      setMetaData(meta);
    };
    void load();
  }, []);

  const tasa = TASAS[tasaIdx]?.value ?? 8;

  const resultado1 = useMemo(() => calcCompuesto(capital, aportMensual, tasa, 1), [capital, aportMensual, tasa]);
  const resultado3 = useMemo(() => calcCompuesto(capital, aportMensual, tasa, 3), [capital, aportMensual, tasa]);
  const resultado5 = useMemo(() => calcCompuesto(capital, aportMensual, tasa, anos), [capital, aportMensual, tasa, anos]);
  const simple5 = useMemo(() => calcSimple(capital, aportMensual, tasa, anos), [capital, aportMensual, tasa, anos]);

  const mesesMeta = useMemo(() => {
    if (!metaData?.monto || metaData.monto <= capital) return null;
    const r = tasa / 100 / 12;
    if (r === 0) return Math.ceil((metaData.monto - capital) / aportMensual);
    let n = 0;
    let total = capital;
    while (total < metaData.monto && n < 600) {
      total = total * (1 + r) + aportMensual;
      n++;
    }
    return n;
  }, [metaData, capital, aportMensual, tasa]);

  const progress = step === 0 ? 0 : step === 1 ? 33 : step === 2 ? 66 : 100;

  return (
    <LessonShell id="L12" title="El dinero que se multiplica: interes compuesto" completion={{ ready: used }}>
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: successColor }} />
        </div>

        {/* Pantalla 0 — Explicacion visual */}
        {step === 0 && (
          <div className="space-y-6">
            <FinniMessage variant="coach" title="La octava maravilla del mundo" message='Einstein dijo que el interes compuesto es la octava maravilla del mundo. Quien lo entiende, lo gana. Quien no, lo paga.' />
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="text-sm font-bold mb-2">Interes simple:</p>
              <p className="text-sm">Ganas interes solo sobre tu capital original.</p>
              <p className="text-xs text-[var(--color-text-secondary)]">$1,000 al 5% anual = $50 al año, siempre.</p>
            </FECard>
            <FECard variant="flat" className="border-2" style={{ borderColor: successColor, backgroundColor: successBg }}>
              <p className="text-sm font-bold mb-2">Interes compuesto:</p>
              <p className="text-sm">Ganas interes sobre tu capital MAS los intereses anteriores.</p>
              <div className="mt-2 space-y-0.5">
                <p className="text-xs">Año 1: $1,000 → +$50 → total <b>$1,050</b></p>
                <p className="text-xs">Año 2: $1,050 → +$52.50 → total <b>$1,102.50</b></p>
                <p className="text-xs">Año 3: $1,102.50 → +$55.13 → total <b>$1,157.63</b></p>
              </div>
            </FECard>
            <FECard variant="flat" className="border" style={{ borderColor: infoColor }}>
              <p className="text-sm font-bold mb-2">$1,000 al 5% — comparacion:</p>
              <div className="space-y-2">
                {[1, 5, 10].map((yr) => {
                  const comp = calcCompuesto(1000, 0, 5, yr);
                  const simp = calcSimple(1000, 0, 5, yr);
                  return (
                    <div key={yr} className="flex justify-between items-center">
                      <p className="text-xs">{yr} {yr === 1 ? 'año' : 'años'}:</p>
                      <div className="flex gap-2">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold border" style={{ borderColor: warnColor, color: warnColor }}>Simple ${simp.toFixed(0)}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: successColor }}>Compuesto ${comp.toFixed(0)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </FECard>
            <FinniMessage variant="coach" title="El ingrediente secreto es el tiempo" message="Entre mas pronto empieces, mas trabaja el compuesto por ti." />
            <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => setStep(1)}>
              Usar el simulador →
            </button>
          </div>
        )}

        {/* Pantalla 1 — Simulador */}
        {step === 1 && (
          <div className="space-y-6">
            <p className="text-base font-bold">Simulador de interes compuesto:</p>
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <div className="space-y-4">
                <div>
                  <p className="text-xs mb-1">Capital inicial: <b>${capital.toLocaleString()}</b></p>
                  <input type="range" min={0} max={50000} step={500} value={capital} onChange={(e) => { setCapital(Number(e.target.value)); setUsed(true); }} className="w-full accent-[var(--color-brand-success)]" />
                </div>
                <div>
                  <p className="text-xs mb-1">Aportacion mensual: <b>${aportMensual.toLocaleString()}</b></p>
                  <input type="range" min={0} max={5000} step={100} value={aportMensual} onChange={(e) => { setAportMensual(Number(e.target.value)); setUsed(true); }} className="w-full accent-[var(--color-brand-success)]" />
                </div>
                <div>
                  <p className="text-xs mb-1">Plazo: <b>{anos} {anos === 1 ? 'año' : 'años'}</b></p>
                  <input type="range" min={1} max={20} step={1} value={anos} onChange={(e) => { setAnos(Number(e.target.value)); setUsed(true); }} className="w-full accent-[var(--color-brand-success)]" />
                </div>
                <div>
                  <p className="text-xs mb-2">Tasa de rendimiento:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {TASAS.map((t, i) => (
                      <button
                        key={i}
                        onClick={() => { setTasaIdx(i); setUsed(true); }}
                        className="px-2 py-0.5 rounded-full text-xs font-bold transition-colors"
                        style={{
                          backgroundColor: tasaIdx === i ? successColor : 'transparent',
                          color: tasaIdx === i ? 'white' : 'inherit',
                          border: `2px solid ${successColor}`,
                        }}
                      >
                        {t.value}% — {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </FECard>

            <FECard variant="flat" className="border-2" style={{ borderColor: successColor, backgroundColor: successBg }}>
              <p className="text-sm font-bold mb-2">Con interes compuesto al {tasa}%:</p>
              <div className="space-y-1.5">
                <div className="flex justify-between"><p className="text-sm">1 año:</p><p className="text-sm font-bold">${fmt(resultado1)}</p></div>
                <div className="flex justify-between"><p className="text-sm">3 años:</p><p className="text-sm font-bold">${fmt(resultado3)}</p></div>
                <div className="flex justify-between"><p className="text-sm">{anos} años:</p><p className="text-sm font-bold" style={{ color: '#059669' }}>${fmt(resultado5)}</p></div>
              </div>
              <div className="flex justify-between mt-3 pt-2 border-t border-[var(--color-neutral-200)]">
                <p className="text-xs text-[var(--color-text-secondary)]">Vs interes simple ({anos}a):</p>
                <p className="text-xs">${fmt(simple5)}</p>
              </div>
              <p className="text-xs" style={{ color: '#059669' }}>Diferencia: +${fmt(resultado5 - simple5)} solo por el compuesto</p>
            </FECard>

            {metaData?.nombre && mesesMeta !== null && (
              <FECard variant="flat" className="border" style={{ borderColor: infoColor, backgroundColor: infoBg }}>
                <p className="text-sm">Con {tasa}% de rendimiento, alcanzas tu meta de "{metaData.nombre}" (${metaData.monto?.toLocaleString()}) en <b>~{mesesMeta} meses</b>.</p>
              </FECard>
            )}

            {used && (
              <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => setStep(2)}>
                Ver el cierre →
              </button>
            )}
          </div>
        )}

        {/* Pantalla 2 — Cierre */}
        {step === 2 && (
          <div className="space-y-6">
            <FinniMessage variant="success" title="El mejor momento para empezar fue ayer" message="El segundo mejor momento es hoy. Con los numeros que ves, cada mes que pasa sin empezar es dinero que no trabajara para ti." />
            <FECard variant="flat" className="border text-center py-4" style={{ borderColor: successColor, backgroundColor: successBg }}>
              <p className="text-2xl font-bold">Tu simulacion:</p>
              <p className="text-base">${capital.toLocaleString()} capital + ${aportMensual.toLocaleString()}/mes al {tasa}% durante {anos} años</p>
              <p className="text-2xl font-bold mt-2" style={{ color: '#059669' }}>= ${fmt(resultado5)}</p>
            </FECard>
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[var(--color-text-primary)]">Capital inicial</label>
                <input type="number" value={capital} min={0} onChange={(e) => setCapital(Number(e.target.value))} className="w-full border border-[var(--color-neutral-200)] rounded-xl px-4 py-2.5 text-sm" />
                <p className="text-xs text-[var(--color-text-secondary)]">Ajusta para explorar diferentes escenarios</p>
              </div>
            </FECard>
          </div>
        )}
      </div>
    </LessonShell>
  );
}
