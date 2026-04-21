import { useState, useMemo } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';

type Q1 = 'a' | 'b' | 'c' | null;
type Q2 = 'a' | 'b' | 'c' | null;

const successColor = 'var(--color-brand-success)';
const successBg = 'var(--color-brand-success-bg)';
const errorColor = 'var(--color-brand-error)';
const errorBg = 'var(--color-brand-error-bg)';

const BENEFICIOS = [
  { title: 'Rendimientos', example: '$5,000 al 3% = $150 anuales sin hacer nada', detail: 'El banco te paga por dejarle usar tu dinero temporalmente. Es tu derecho, no un regalo.' },
  { title: 'Proteccion IPAB', example: 'Hasta ~3 millones de pesos garantizados por el gobierno', detail: 'Si tu banco quiebra, el IPAB te devuelve tu dinero. No pasa con tu alcancia.' },
  { title: 'Historial financiero', example: 'Tener cuenta activa mejora tu perfil para creditos futuros', detail: 'Los bancos y empleadores verifican tu historial. Una cuenta activa construye tu reputacion.' },
  { title: 'Disciplina automatica', example: '"Lo que no ves, no lo gastas"', detail: 'Separar el ahorro en cuenta diferente hace que no lo toques por impulso.' },
];

const TASAS_REF = [3, 5, 8, 10];

const AUDIO_SCRIPT = [
  '"Los intereses son el pago que el banco te hace por dejarle usar tu dinero temporalmente. No es un regalo: es tu derecho."',
  '"Si tienes $5,000 en una cuenta con 3% de rendimiento anual, al año tendras $5,150. Sin mover un dedo."',
  '"Ahora imagina que esos $150 tambien generan interes el siguiente año. Eso se llama interes compuesto, y lo veremos mas a fondo en la Leccion 12."',
  '"El IPAB protege tus depositos en bancos autorizados hasta 400,000 UDIs (aproximadamente 3 millones de pesos). Si tu banco quiebra, el gobierno te regresa tu dinero."',
];

export default function L03() {
  const [step, setStep] = useState(0);
  const [audioRead, setAudioRead] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [monto, setMonto] = useState('5000');
  const [tasa, setTasa] = useState(3);
  const [plazo, setPlazo] = useState('12');
  const [q1, setQ1] = useState<Q1>(null);
  const [q2, setQ2] = useState<Q2>(null);

  const montoNum = parseFloat(monto) || 0;
  const plazoNum = parseInt(plazo) || 0;
  const resultado = useMemo(() => montoNum * Math.pow(1 + tasa / 100 / 12, plazoNum), [montoNum, tasa, plazoNum]);

  const quizDone = q1 !== null && q2 !== null;
  const score = [q1 === 'b', q2 === 'b'].filter(Boolean).length;

  const toggleExpanded = (i: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const progress = step === 0 ? 0 : step === 1 ? 25 : step === 2 ? 60 : step === 3 ? 80 : 100;

  return (
    <LessonShell id="L03" title="Tu dinero en el banco trabaja por ti" completion={{ ready: audioRead && quizDone, score: score / 2 }}>
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: successColor }} />
        </div>

        {/* Pantalla 0 — Apertura */}
        {step === 0 && (
          <div className="space-y-6">
            <FinniMessage variant="coach" title="Tu dinero puede generar dinero" message="¿Sabias que tu dinero en el banco puede generar dinero sin que hagas nada? No mucho, pero algo. Y ese algo, sumado mes a mes, importa." />
            <FECard variant="flat" className="border" style={{ borderColor: successColor, backgroundColor: successBg }}>
              <p className="font-bold text-sm mb-1">Ejemplo rapido:</p>
              <p className="text-sm">$5,000 al 3% anual = <b>$5,150</b> al final del año. Sin hacer nada.</p>
            </FECard>
            <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => setStep(1)}>
              Ver la explicacion completa →
            </button>
          </div>
        )}

        {/* Pantalla 1 — Transcripcion */}
        {step === 1 && (
          <div className="space-y-6">
            <p className="font-bold">Finni explica (transcripcion):</p>
            <div className="space-y-3">
              {AUDIO_SCRIPT.map((line, i) => (
                <FECard key={i} variant="flat" className="border border-[var(--color-neutral-200)]">
                  <p className="text-sm italic">{line}</p>
                </FECard>
              ))}
            </div>
            <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => { setAudioRead(true); setStep(2); }}>
              Entendido — ver los 4 beneficios →
            </button>
          </div>
        )}

        {/* Pantalla 2 — Beneficios + calculadora */}
        {step === 2 && (
          <div className="space-y-6">
            <p className="font-bold">4 beneficios del ahorro formal — toca cada uno:</p>
            <div className="space-y-3">
              {BENEFICIOS.map((b, i) => (
                <FECard
                  key={i}
                  variant="flat"
                  className="border cursor-pointer"
                  style={{ borderColor: expanded.has(i) ? successColor : 'var(--color-neutral-200)' }}
                  onClick={() => toggleExpanded(i)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-bold">{b.title}</p>
                    <span className="text-xs">{expanded.has(i) ? '▲' : '▼'}</span>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)]">{b.example}</p>
                  {expanded.has(i) && <p className="text-sm mt-2" style={{ color: '#059669' }}>{b.detail}</p>}
                </FECard>
              ))}
            </div>

            <FECard variant="flat" className="border" style={{ borderColor: successColor }}>
              <p className="font-bold text-sm mb-3">Calculadora basica</p>
              <div className="space-y-3">
                <input
                  type="number"
                  placeholder="Monto inicial ($)"
                  min={0}
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  className="w-full border border-[var(--color-neutral-200)] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-success)]"
                />
                <p className="text-xs text-[var(--color-text-secondary)]">Tasa de rendimiento:</p>
                <div className="flex flex-wrap gap-2">
                  {TASAS_REF.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTasa(t)}
                      className="px-3 py-1 rounded-full text-xs font-bold border-2 transition-colors"
                      style={{
                        borderColor: successColor,
                        backgroundColor: tasa === t ? successColor : 'transparent',
                        color: tasa === t ? 'white' : '#059669',
                      }}
                    >
                      {t}%
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  placeholder="Plazo (meses)"
                  min={1}
                  max={60}
                  value={plazo}
                  onChange={(e) => setPlazo(e.target.value)}
                  className="w-full border border-[var(--color-neutral-200)] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-success)]"
                />
                {montoNum > 0 && plazoNum > 0 && (
                  <FECard variant="flat" className="text-center py-3" style={{ backgroundColor: successBg }}>
                    <p className="text-xs text-[var(--color-text-secondary)]">Al final tendrias:</p>
                    <p className="text-2xl font-extrabold" style={{ color: '#059669' }}>
                      ${resultado.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    </p>
                  </FECard>
                )}
              </div>
            </FECard>

            <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => setStep(3)}>
              Quiz de cierre →
            </button>
          </div>
        )}

        {/* Pantalla 3 — Quiz */}
        {step === 3 && (
          <div className="space-y-6">
            <p className="text-2xl font-bold">Quiz de comprension</p>

            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="font-bold mb-3">1. ¿Cuanto protege el IPAB por persona por banco?</p>
              <div className="space-y-2">
                {[
                  { key: 'a', label: 'A) $500,000' },
                  { key: 'b', label: 'B) ~3 millones de pesos' },
                  { key: 'c', label: 'C) Todo el saldo sin limite' },
                ].map((o) => (
                  <button
                    key={o.key}
                    onClick={() => { if (!q1) setQ1(o.key as Q1); }}
                    disabled={q1 !== null}
                    className="w-full text-left px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors disabled:cursor-default"
                    style={{
                      borderColor: q1 === o.key ? (o.key === 'b' ? successColor : errorColor) : 'var(--color-neutral-200)',
                      backgroundColor: q1 === o.key ? (o.key === 'b' ? successBg : errorBg) : 'transparent',
                    }}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              {q1 && (
                <p className="text-xs mt-2 font-semibold" style={{ color: q1 === 'b' ? '#059669' : '#DC2626' }}>
                  {q1 === 'b' ? '✅ ¡Correcto! Hasta 400,000 UDIs ≈ 3 millones.' : '❌ Son ~3 millones de pesos (400,000 UDIs).'}
                </p>
              )}
            </FECard>

            {q1 && (
              <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
                <p className="font-bold mb-3">2. ¿Que es el interes que ganas en tu cuenta de ahorro?</p>
                <div className="space-y-2">
                  {[
                    { key: 'a', label: 'A) Un favor del banco' },
                    { key: 'b', label: 'B) El pago por usar tu dinero' },
                    { key: 'c', label: 'C) Un impuesto' },
                  ].map((o) => (
                    <button
                      key={o.key}
                      onClick={() => { if (!q2) setQ2(o.key as Q2); }}
                      disabled={q2 !== null}
                      className="w-full text-left px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors disabled:cursor-default"
                      style={{
                        borderColor: q2 === o.key ? (o.key === 'b' ? successColor : errorColor) : 'var(--color-neutral-200)',
                        backgroundColor: q2 === o.key ? (o.key === 'b' ? successBg : errorBg) : 'transparent',
                      }}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                {q2 && (
                  <p className="text-xs mt-2 font-semibold" style={{ color: q2 === 'b' ? '#059669' : '#DC2626' }}>
                    {q2 === 'b' ? '✅ ¡Correcto! Es tu derecho, no un regalo.' : '❌ El banco te paga porque usa tu dinero. Es tu derecho.'}
                  </p>
                )}
              </FECard>
            )}

            {quizDone && (
              <FinniMessage variant="success" title={`${score}/2 correctas`} message="Verifica que tu banco este registrado en el IPAB: ipab.gob.mx" />
            )}
          </div>
        )}
      </div>
    </LessonShell>
  );
}
