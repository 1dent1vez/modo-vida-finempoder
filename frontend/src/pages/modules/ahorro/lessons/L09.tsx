import { useState } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';

type MapChoice = 'ahorro' | 'seguro' | 'ambos' | null;
type Q = 'a' | 'b' | 'c' | null;

const SITUACIONES = [
  { id: 1, text: 'Laptop descompuesta antes de examenes ($5,000)', correct: 'ahorro' as const, exp: 'Ahorro: este importe cabe en un buen fondo de emergencias.' },
  { id: 2, text: 'Hospitalizacion de emergencia ($20,000)', correct: 'seguro' as const, exp: 'Seguro: un evento tan grande esta fuera del alcance de la mayoria de fondos.' },
  { id: 3, text: 'Mes sin ingreso por enfermedad', correct: 'ambos' as const, exp: 'Ambos: el seguro cubre el evento, el fondo cubre la brecha mientras el seguro responde.' },
  { id: 4, text: 'Multa inesperada ($500)', correct: 'ahorro' as const, exp: 'Ahorro: pequeño imprevisible que tu fondo cubre facilmente.' },
  { id: 5, text: 'Accidente de transito', correct: 'seguro' as const, exp: 'Seguro: responsabilidad civil y danos pueden superar cualquier fondo.' },
  { id: 6, text: 'Perdida de beca por 2 meses', correct: 'ambos' as const, exp: 'Ambos: fondo para los primeros meses, seguro de desempleo para mayor duracion.' },
];

const SEGUROS = [
  { label: 'Gastos medicos mayores', desc: 'Disponible en algunas universidades publicas' },
  { label: 'IMSS', desc: 'Si tienes trabajo formal o a traves de tus padres' },
  { label: 'Seguro de viajero', desc: 'Para intercambios o viajes largos' },
  { label: 'Seguro de gadgets', desc: 'Para laptop o celular si es tu herramienta de trabajo' },
];

const successColor = 'var(--color-brand-success)';
const successBg = 'var(--color-brand-success-bg)';
const errorColor = 'var(--color-brand-error)';
const errorBg = 'var(--color-brand-error-bg)';
const infoColor = 'var(--color-brand-info)';
const infoBg = 'var(--color-brand-info-bg)';

const OPT_LABELS: Record<string, string> = {
  ahorro: '💰 Ahorro',
  seguro: '🛡️ Seguro',
  ambos: '✅ Ambos',
};

export default function L09() {
  const [step, setStep] = useState(0);
  const [mapAnswers, setMapAnswers] = useState<Record<number, MapChoice>>({});
  const [showMapFeedback, setShowMapFeedback] = useState<Record<number, boolean>>({});
  const [q1, setQ1] = useState<Q>(null);
  const [q2, setQ2] = useState<Q>(null);
  const [q3, setQ3] = useState<Q>(null);

  const mapDone = Object.values(mapAnswers).filter(Boolean).length === SITUACIONES.length;
  const quizDone = q1 !== null && q2 !== null && q3 !== null;
  const score = [q1 === 'b', q2 === 'a', q3 === 'b'].filter(Boolean).length;

  const chooseMap = (id: number, choice: MapChoice) => {
    if (mapAnswers[id]) return;
    setMapAnswers((prev) => ({ ...prev, [id]: choice }));
    setShowMapFeedback((prev) => ({ ...prev, [id]: true }));
  };

  const progress = step === 0 ? 0 : step === 1 ? 25 : step === 2 ? 60 : step === 3 ? 80 : 100;

  const quizOpts = [
    { q: q1, set: setQ1, correct: 'b', opts: [{ key: 'a', label: 'A) Solo el fondo de emergencias' }, { key: 'b', label: 'B) Un seguro medico' }, { key: 'c', label: 'C) Pedir prestado' }], question: '1. Una emergencia medica de $25,000. ¿Que conviene?', fb: { ok: 'Correcto. Para gastos tan grandes, el seguro es indispensable.', fail: 'Un seguro medico es el mas adecuado para montos elevados.' } },
    { q: q2, set: setQ2, correct: 'a', opts: [{ key: 'a', label: 'A) Mi fondo de emergencias' }, { key: 'b', label: 'B) Un seguro' }, { key: 'c', label: 'C) Una tarjeta de credito' }], question: '2. Una multa de $400. ¿Que usas?', fb: { ok: 'Correcto. Para imprevistos pequeños, el fondo es perfecto.', fail: 'Para imprevistos pequeños usa el fondo de emergencias.' } },
    { q: q3, set: setQ3, correct: 'b', opts: [{ key: 'a', label: 'A) Solo el fondo de emergencias' }, { key: 'b', label: 'B) Fondo para los primeros meses + seguro de desempleo si disponible' }, { key: 'c', label: 'C) Solo el seguro' }], question: '3. Perdiste tu trabajo part-time por 4 meses. ¿La mejor estrategia?', fb: { ok: 'Correcto. La dupla ahorro + seguro es la estrategia optima.', fail: 'La combinacion de ambos es la estrategia mas solida.' } },
  ];

  return (
    <LessonShell id="L09" title="Ahorro y seguros: la dupla de la tranquilidad" completion={{ ready: mapDone && quizDone, score: score / 3 }}>
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: successColor }} />
        </div>

        {/* Pantalla 0 — Apertura */}
        {step === 0 && (
          <div className="space-y-6">
            <FinniMessage variant="coach" title="La dupla imbatible" message="El ahorro te protege de lo que ya sabes que podria pasar. El seguro te protege de lo que no imaginas que podria pasar. Juntos son imbatibles." />
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="text-sm font-bold mb-2">Situacion 1 — Carlos:</p>
              <p className="text-sm">Tiene $3,000 en fondo de emergencias. Se enferma, gasto medico $8,000.</p>
              <p className="text-sm mt-1" style={{ color: errorColor }}>Sin seguro → vacia el fondo y sigue debiendo $5,000.</p>
              <p className="text-sm" style={{ color: successColor }}>Con seguro medico estudiantil → paga $500 deducible, fondo intacto.</p>
            </FECard>
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="text-sm font-bold mb-2">Situacion 2 — Mariana:</p>
              <p className="text-sm">Tiene seguro de desempleo estudiantil. Pierde trabajo part-time.</p>
              <p className="text-sm mt-1" style={{ color: successColor }}>El seguro cubre 3 meses de ingreso basico. Fondo intacto para otra situacion.</p>
            </FECard>
            <FECard variant="flat" className="border" style={{ borderColor: infoColor, backgroundColor: infoBg }}>
              <p className="text-sm font-bold mb-2">Seguros basicos para universitarios:</p>
              {SEGUROS.map((s) => (
                <div key={s.label} className="flex gap-2 items-start mb-1">
                  <p className="text-sm">•</p>
                  <div>
                    <p className="text-sm font-semibold">{s.label}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{s.desc}</p>
                  </div>
                </div>
              ))}
            </FECard>
            <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => setStep(1)}>
              Mapa de situaciones →
            </button>
          </div>
        )}

        {/* Pantalla 1 — Mapa de 6 situaciones */}
        {step === 1 && (
          <div className="space-y-6">
            <p className="text-base font-bold">¿Que herramienta usarias en cada situacion?</p>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: successColor }}>
              {Object.values(mapAnswers).filter(Boolean).length}/{SITUACIONES.length}
            </span>
            <div className="space-y-4 mt-2">
              {SITUACIONES.map((s) => {
                const ans = mapAnswers[s.id];
                const isCorrect = ans === s.correct;
                return (
                  <FECard
                    key={s.id}
                    variant="flat"
                    className="border"
                    style={{
                      borderColor: ans ? (isCorrect ? successColor : errorColor) : 'var(--color-border)',
                      backgroundColor: ans ? (isCorrect ? successBg : errorBg) : 'white',
                    }}
                  >
                    <p className="text-sm font-semibold mb-2">{s.text}</p>
                    <div className="flex flex-wrap gap-2">
                      {(['ahorro', 'seguro', 'ambos'] as const).map((opt) => (
                        <button
                          key={opt}
                          onClick={() => chooseMap(s.id, opt)}
                          disabled={!!ans}
                          className="px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition-colors disabled:cursor-default"
                          style={{
                            borderColor: ans === opt ? (isCorrect ? successColor : errorColor) : 'var(--color-neutral-300)',
                            backgroundColor: ans === opt ? (isCorrect ? successBg : errorBg) : 'transparent',
                          }}
                        >
                          {OPT_LABELS[opt]}
                        </button>
                      ))}
                    </div>
                    {showMapFeedback[s.id] && (
                      <p className="text-xs mt-2" style={{ color: isCorrect ? '#059669' : '#DC2626' }}>
                        {isCorrect ? '✅ ' : '❌ '}{s.exp}
                      </p>
                    )}
                  </FECard>
                );
              })}
            </div>
            {mapDone && (
              <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => setStep(2)}>
                Quiz rapido →
              </button>
            )}
          </div>
        )}

        {/* Pantalla 2 — Quiz 3 preguntas */}
        {step === 2 && (
          <div className="space-y-6">
            <p className="text-2xl font-bold">Quiz: ¿cuando conviene cada uno?</p>
            {quizOpts.map(({ q, set, correct, opts, question, fb }, idx) => {
              if (idx > 0 && quizOpts[idx - 1]!.q === null) return null;
              return (
                <FECard key={idx} variant="flat" className="border border-[var(--color-neutral-200)]">
                  <p className="text-base font-bold mb-3">{question}</p>
                  <div className="space-y-2">
                    {opts.map((o) => (
                      <button
                        key={o.key}
                        onClick={() => { if (!q) set(o.key as Q); }}
                        disabled={q !== null}
                        className="w-full text-left px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors disabled:cursor-default"
                        style={{
                          borderColor: q === o.key ? (o.key === correct ? successColor : errorColor) : 'var(--color-neutral-200)',
                          backgroundColor: q === o.key ? (o.key === correct ? successBg : errorBg) : 'transparent',
                        }}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                  {q && (
                    <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: q === correct ? successColor : errorColor }}>
                      {q === correct ? fb.ok : fb.fail}
                    </span>
                  )}
                </FECard>
              );
            })}
            {quizDone && (
              <FinniMessage variant="success" title={`${score}/3 correctas`} message="No necesitas el seguro perfecto. Necesitas empezar con el mas basico que puedas costear." />
            )}
          </div>
        )}
      </div>
    </LessonShell>
  );
}
