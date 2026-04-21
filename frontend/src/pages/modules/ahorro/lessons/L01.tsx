import { useState } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';

type BridgeAnswer = 'nada' | 'algo' | 'planeado' | null;
type ReflexAnswer = 'a' | 'b' | 'depende' | null;
type Quiz1 = 'a' | 'b' | 'c' | null;
type Quiz2 = 'a' | 'b' | 'c' | null;

const successColor = 'var(--color-brand-success)';
const successBg = 'var(--color-brand-success-bg)';
const errorColor = 'var(--color-brand-error)';
const errorBg = 'var(--color-brand-error-bg)';

const RUTAS = [
  {
    id: 'a',
    label: 'RUTA A — Gasto primero',
    borderColor: errorColor,
    bgExpanded: errorBg,
    steps: ['Dinero llega', 'Gastos necesidades', 'Gastos deseos', 'Intento de ahorro', '$0 ahorrado'],
    proyeccion: { m3: 0, m6: 0, m12: 0 },
    emoji: '❌',
    chipColor: errorColor,
  },
  {
    id: 'b',
    label: 'RUTA B — Ahorro primero',
    borderColor: successColor,
    bgExpanded: successBg,
    steps: ['Dinero llega', 'Aparta ahorro YA', 'Gasta el resto', 'Ahorro constante'],
    proyeccion: { m3: 1300, m6: 2600, m12: 5200 },
    emoji: '✅',
    chipColor: successColor,
  },
];

export default function L01() {
  const [step, setStep] = useState(0);
  const [bridge, setBridge] = useState<BridgeAnswer>(null);
  const [rutaExpanded, setRutaExpanded] = useState<string | null>(null);
  const [reflex, setReflex] = useState<ReflexAnswer>(null);
  const [monto, setMonto] = useState(100);
  const [q1, setQ1] = useState<Quiz1>(null);
  const [q2, setQ2] = useState<Quiz2>(null);

  const quizDone = q1 !== null && q2 !== null;
  const progress = step === 0 ? 0 : step === 1 ? 25 : step === 2 ? 50 : step === 3 ? 75 : 100;

  return (
    <LessonShell id="L01" title="Ahorro primero: el habito que cambia todo" completion={{ ready: quizDone }}>
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: successColor }} />
        </div>

        {/* Pantalla 0 — Bienvenida + pregunta puente */}
        {step === 0 && (
          <div className="space-y-6">
            <FinniMessage variant="coach" title="¡Bienvenido al Modulo 2!" message="En el modulo anterior construiste tu presupuesto. Ahora vamos a hacer que ese dinero trabaje para ti, no solo para sobrevivir el mes." />
            <FECard variant="flat" className="border-2" style={{ borderColor: successColor }}>
              <p className="font-bold mb-3">¿Cuanto lograste ahorrar el mes pasado?</p>
              <div className="space-y-2">
                {[
                  { key: 'nada', label: 'Nada' },
                  { key: 'algo', label: 'Algo' },
                  { key: 'planeado', label: 'Lo que planee' },
                ].map((o) => (
                  <button
                    key={o.key}
                    onClick={() => setBridge(o.key as BridgeAnswer)}
                    className="w-full text-left px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors"
                    style={{
                      borderColor: successColor,
                      backgroundColor: bridge === o.key ? successColor : 'transparent',
                      color: bridge === o.key ? 'white' : 'inherit',
                    }}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </FECard>
            {bridge && (
              <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => setStep(1)}>
                Ver la diferencia →
              </button>
            )}
          </div>
        )}

        {/* Pantalla 1 — Dos rutas */}
        {step === 1 && (
          <div className="space-y-6">
            <p className="text-sm text-[var(--color-text-secondary)] italic">"La diferencia no esta en el monto. Esta en el orden. Cuando ahorras primero, el ahorro deja de ser opcional."</p>
            <div className="space-y-3">
              {RUTAS.map((r) => (
                <FECard
                  key={r.id}
                  variant="flat"
                  className="border-2 cursor-pointer"
                  style={{
                    borderColor: r.borderColor,
                    backgroundColor: rutaExpanded === r.id ? r.bgExpanded : 'white',
                  }}
                  onClick={() => setRutaExpanded(rutaExpanded === r.id ? null : r.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex justify-between items-center">
                    <p className="font-bold" style={{ color: r.borderColor }}>{r.emoji} {r.label}</p>
                    <span className="text-xs">{rutaExpanded === r.id ? '▲' : '▼'}</span>
                  </div>
                  {rutaExpanded === r.id && (
                    <div className="space-y-1 mt-3">
                      {r.steps.map((s, i) => <p key={i} className="text-sm">{i + 1}. {s}</p>)}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {[
                          { label: `3 meses: $${r.proyeccion.m3.toLocaleString()}` },
                          { label: `6 meses: $${r.proyeccion.m6.toLocaleString()}` },
                          { label: `12 meses: $${r.proyeccion.m12.toLocaleString()}` },
                        ].map(({ label }) => (
                          <span key={label} className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: r.chipColor }}>{label}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </FECard>
              ))}
            </div>
            <FinniMessage variant="coach" title="La Ruta B tiene un nombre" message="Pagarte primero a ti mismo. Es el habito mas poderoso de las finanzas personales." />
            <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => setStep(2)}>
              Reflexionar →
            </button>
          </div>
        )}

        {/* Pantalla 2 — Reflexion + slider */}
        {step === 2 && (
          <div className="space-y-6">
            <FECard variant="flat" className="border-2" style={{ borderColor: successColor }}>
              <p className="font-bold mb-3">¿En cual de las dos rutas te identificas normalmente?</p>
              <div className="space-y-2">
                {[
                  { key: 'a', label: 'Ruta A — primero gasto' },
                  { key: 'b', label: 'Ruta B — primero ahorro' },
                  { key: 'depende', label: 'Depende del mes' },
                ].map((o) => (
                  <button
                    key={o.key}
                    onClick={() => setReflex(o.key as ReflexAnswer)}
                    className="w-full text-left px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors"
                    style={{
                      borderColor: successColor,
                      backgroundColor: reflex === o.key ? successColor : 'transparent',
                      color: reflex === o.key ? 'white' : 'inherit',
                    }}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </FECard>

            <FECard variant="flat" className="border" style={{ borderColor: successColor }}>
              <p className="font-bold mb-1">Tu proyeccion personalizada</p>
              <p className="text-xs text-[var(--color-text-secondary)]">Si apartas ${monto}/semana desde hoy...</p>
              <input
                type="range"
                min={50}
                max={1000}
                step={50}
                value={monto}
                onChange={(e) => setMonto(Number(e.target.value))}
                className="w-full my-4 accent-[var(--color-brand-success)]"
              />
              <div className="flex flex-wrap gap-1">
                {[
                  `1 ano: $${(monto * 52).toLocaleString()}`,
                  `5 anos: $${(monto * 52 * 5).toLocaleString()}`,
                  `10 anos: $${(monto * 52 * 10).toLocaleString()}`,
                ].map((label) => (
                  <span key={label} className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: successColor }}>{label}</span>
                ))}
              </div>
            </FECard>

            {reflex && (
              <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => setStep(3)}>
                Quiz rapido →
              </button>
            )}
          </div>
        )}

        {/* Pantalla 3 — Quiz */}
        {step === 3 && (
          <div className="space-y-6">
            <p className="text-2xl font-bold">Quiz rapido 🧠</p>

            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="font-bold mb-3">1. ¿Que es el ahorro?</p>
              <div className="space-y-2">
                {[
                  { key: 'a', label: 'A) Guardar lo que sobra' },
                  { key: 'b', label: 'B) Apartar una parte antes de gastar' },
                  { key: 'c', label: 'C) No gastar nada' },
                ].map((o) => (
                  <button
                    key={o.key}
                    onClick={() => { if (!q1) setQ1(o.key as Quiz1); }}
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
                  {q1 === 'b' ? '✅ ¡Correcto! Ahorrar es separar intencionalmente.' : '❌ El ahorro es planificado, no lo que sobra.'}
                </p>
              )}
            </FECard>

            {q1 && (
              <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
                <p className="font-bold mb-3">2. ¿Cuando se ahorra mas facilmente?</p>
                <div className="space-y-2">
                  {[
                    { key: 'a', label: 'A) Cuando sobra dinero' },
                    { key: 'b', label: 'B) Cuando se automatiza' },
                    { key: 'c', label: 'C) Cuando el ingreso es alto' },
                  ].map((o) => (
                    <button
                      key={o.key}
                      onClick={() => { if (!q2) setQ2(o.key as Quiz2); }}
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
                    {q2 === 'b' ? '✅ ¡Correcto! La automatizacion elimina la fuerza de voluntad.' : '❌ La automatizacion es la clave, no el monto.'}
                  </p>
                )}
              </FECard>
            )}

            {quizDone && (
              <FinniMessage variant="success" title="En este modulo vas a construir tu habito" message="Empieza con lo que puedas, no con lo que idealmente quisieras." />
            )}
          </div>
        )}
      </div>
    </LessonShell>
  );
}
