import { useState } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';

function calcInvested(principal: number, rate: number, years: number) {
  return principal * Math.pow(1 + rate, years);
}
function calcInflationReal(principal: number, inflacion: number, years: number) {
  return principal / Math.pow(1 + inflacion, years);
}

const MYTHS = [
  { mito: 'Necesito mucho dinero para invertir', realidad: 'Puedes empezar con $100 en CETES. No hay mínimo imposible.' },
  { mito: 'Invertir es muy riesgoso', realidad: 'El riesgo se gestiona con conocimiento y diversificación. No toda inversión es especulativa.' },
  { mito: 'Es muy complicado', realidad: 'Existen instrumentos diseñados para principiantes como CETES y fondos de deuda.' },
  { mito: 'Es para cuando sea grande', realidad: 'El tiempo es tu mayor aliado — cada año que esperas, cuesta dinero real.' },
];

const VOCAB = [
  { term: 'Inversión', def: 'Poner tu dinero en algo con la expectativa de que genere más dinero con el tiempo.' },
  { term: 'Rendimiento', def: 'El dinero extra que genera tu inversión, expresado en porcentaje anual.' },
  { term: 'Riesgo', def: 'La posibilidad de que la inversión no genere lo esperado — algo que se gestiona, no se ignora.' },
];

const infoColor = 'var(--color-brand-info)';
const infoBg = 'var(--color-brand-info-bg)';
const successColor = 'var(--color-brand-success)';
const successBg = 'var(--color-brand-success-bg)';
const warnColor = 'var(--color-brand-warning)';
const warnBg = 'var(--color-brand-warning-bg)';
const errorBg = 'var(--color-brand-error-bg)';
const errorColor = 'var(--color-brand-error)';

export default function L01() {
  const [step, setStep] = useState(0);
  const [calibracion, setCalibracion] = useState<string | null>(null);
  const [years, setYears] = useState(10);
  const [flipped, setFlipped] = useState<boolean[]>([false, false, false, false]);
  const [vocabVisto, setVocabVisto] = useState(false);

  const allFlipped = flipped.every(Boolean);
  const ready = allFlipped && vocabVisto;

  const flip = (i: number) => setFlipped((prev) => prev.map((v, idx) => (idx === i ? true : v)));

  const invested = calcInvested(5000, 0.06, years);
  const savedReal = calcInflationReal(5000, 0.055, years);

  return (
    <LessonShell id="L01" title="Invertir no es para ricos: qué significa poner tu dinero a trabajar" completion={{ ready }}>
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full transition-all" style={{ width: `${(step / 4) * 100}%`, backgroundColor: infoColor }} />
        </div>

        {/* Pantalla 0 — Calibración */}
        {step === 0 && (
          <div className="space-y-6">
            <FinniMessage variant="coach" title="Terminamos con el mito" message="¿Cuántas veces escuchaste que invertir es para gente rica, para expertos, o para cuando seas mayor? Hoy terminamos con eso. Invertir es para cualquiera que entienda cómo funciona." />
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="text-base font-bold mb-4">¿Has invertido alguna vez?</p>
              <div className="space-y-3">
                {['Nunca', 'No sé si lo que tengo cuenta', 'Una vez pero no entendí bien', 'Sí, regularmente'].map((op) => (
                  <button
                    key={op}
                    onClick={() => setCalibracion(op)}
                    className="w-full text-left px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors"
                    style={{
                      borderColor: infoColor,
                      backgroundColor: calibracion === op ? infoColor : 'transparent',
                      color: calibracion === op ? 'white' : 'inherit',
                    }}
                  >
                    {op}
                  </button>
                ))}
              </div>
            </FECard>
            {calibracion && (
              <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: infoColor }} onClick={() => setStep(1)}>
                Continuar →
              </button>
            )}
          </div>
        )}

        {/* Pantalla 1 — Comparativa con slider */}
        {step === 1 && (
          <div className="space-y-6">
            <p className="text-2xl font-bold">¿Qué pasa con $5,000 en el tiempo?</p>
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="text-sm font-bold mb-2">Arrastra para ver la diferencia en {years} año{years !== 1 ? 's' : ''}:</p>
              <input type="range" min={1} max={20} step={1} value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full mb-4 accent-[var(--color-brand-info)]" />
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-[var(--color-neutral-100)]">
                  <p className="text-xs text-[var(--color-text-secondary)]">LÍNEA A — Dinero guardado en efectivo</p>
                  <p className="text-xl font-extrabold">$5,000</p>
                  <p className="text-xs" style={{ color: errorColor }}>Pero la inflación erosionó su valor real a ${savedReal.toFixed(0)}</p>
                </div>
                <div className="p-4 rounded-xl border-2" style={{ borderColor: warnColor, backgroundColor: warnBg }}>
                  <p className="text-xs text-[var(--color-text-secondary)]">LÍNEA B — Dinero invertido al 6% anual</p>
                  <p className="text-xl font-extrabold" style={{ color: '#B45309' }}>${invested.toFixed(0)}</p>
                  <p className="text-xs" style={{ color: successColor }}>Ganaste ${(invested - 5000).toFixed(0)} extra</p>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: errorBg }}>
                  <p className="text-xs text-[var(--color-text-secondary)]">LÍNEA C — Diferencia real</p>
                  <p className="text-xl font-extrabold" style={{ color: '#DC2626' }}>${(invested - savedReal).toFixed(0)} de ventaja al invertir</p>
                </div>
              </div>
              <p className="text-sm mt-4 italic">"La diferencia no es suerte. Es el tiempo y el conocimiento."</p>
            </FECard>
            <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: infoColor }} onClick={() => setStep(2)}>
              Ver los mitos →
            </button>
          </div>
        )}

        {/* Pantalla 2 — Mitos vs Realidades */}
        {step === 2 && (
          <div className="space-y-6">
            <p className="text-2xl font-bold">Mitos vs Realidades</p>
            <p className="text-sm text-[var(--color-text-secondary)]">Toca cada tarjeta para revelar la realidad:</p>
            <div className="space-y-4">
              {MYTHS.map((m, i) => (
                <div
                  key={i}
                  onClick={() => flip(i)}
                  className="p-4 rounded-2xl border-2 cursor-pointer transition-all"
                  style={{
                    borderColor: flipped[i] ? successColor : warnColor,
                    backgroundColor: flipped[i] ? successBg : warnBg,
                  }}
                >
                  {!flipped[i] ? (
                    <>
                      <p className="text-xs font-bold" style={{ color: '#B45309' }}>MITO</p>
                      <p className="text-base font-bold">"{m.mito}"</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">Toca para ver la realidad</p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-bold" style={{ color: '#059669' }}>✅ REALIDAD</p>
                      <p className="text-base font-bold">{m.realidad}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
            {allFlipped && (
              <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: infoColor }} onClick={() => setStep(3)}>
                Ver el vocabulario base →
              </button>
            )}
          </div>
        )}

        {/* Pantalla 3 — Vocabulario base */}
        {step === 3 && (
          <div className="space-y-6">
            <p className="text-2xl font-bold">Vocabulario base</p>
            <div className="space-y-4">
              {VOCAB.map((v) => (
                <FECard key={v.term} variant="flat" className="border" style={{ borderColor: warnColor }}>
                  <p className="text-base font-extrabold" style={{ color: '#B45309' }}>{v.term}</p>
                  <p className="text-sm">{v.def}</p>
                </FECard>
              ))}
            </div>
            <FECard variant="flat" className="border" style={{ borderColor: infoColor, backgroundColor: infoBg }}>
              <p className="text-sm font-bold">Diferencia clave con el ahorro:</p>
              <p className="text-sm">El ahorro protege tu dinero. La inversión lo hace crecer (asumiendo cierto riesgo).</p>
            </FECard>
            <FinniMessage variant="coach" title="¡Y eso es todo el vocabulario que necesitas para empezar!" message="En este módulo vas a aprender a tomar decisiones de inversión informadas. No vas a ser Warren Buffett, pero vas a dejar de tener miedo." />
            {!vocabVisto ? (
              <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: infoColor }} onClick={() => setVocabVisto(true)}>
                ¡Entendido! Marcar como visto
              </button>
            ) : (
              <FECard variant="flat" className="border-2 text-center py-4" style={{ borderColor: successColor, backgroundColor: successBg }}>
                <p className="text-4xl">🎉</p>
                <p className="text-base font-bold">¡Lección 1 completada! Ya tienes las bases para invertir con criterio.</p>
              </FECard>
            )}
          </div>
        )}
      </div>
    </LessonShell>
  );
}
