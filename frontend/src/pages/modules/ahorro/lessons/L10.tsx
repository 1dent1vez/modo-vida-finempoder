import { useState } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';

type Q = 'a' | 'b' | 'c' | null;

const CUBRE = [
  { label: 'Cuentas de ahorro', si: true },
  { label: 'Cuentas de cheques', si: true },
  { label: 'Depositos a plazo', si: true },
  { label: 'Depositos en UDIs', si: true },
  { label: 'Inversiones en bolsa', si: false },
  { label: 'Seguros de vida', si: false },
  { label: 'SIEFOREs (AFORE)', si: false },
  { label: 'Pagares con rendimiento pre-2010', si: false },
];

const TIMELINE = [
  { dia: 'Dia 1', evento: 'Tu banco cierra sus puertas.' },
  { dia: 'Dia 30', evento: 'El IPAB interviene y audita las cuentas.' },
  { dia: 'Dia 90', evento: 'Recibes tu dinero de vuelta (hasta el limite protegido).' },
];

const successColor = 'var(--color-brand-success)';
const successBg = 'var(--color-brand-success-bg)';
const errorColor = 'var(--color-brand-error)';
const errorBg = 'var(--color-brand-error-bg)';

export default function L10() {
  const [step, setStep] = useState(0);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [q1, setQ1] = useState<Q>(null);
  const [q2, setQ2] = useState<Q>(null);
  const [q3, setQ3] = useState<Q>(null);
  const [q4, setQ4] = useState<Q>(null);

  const quizDone = q1 !== null && q2 !== null && q3 !== null && q4 !== null;
  const score = [q1 === 'b', q2 === 'b', q3 === 'b', q4 === 'a'].filter(Boolean).length;

  const toggleExpanded = (i: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const progress = step === 0 ? 0 : step === 1 ? 25 : step === 2 ? 60 : step === 3 ? 80 : 100;

  const quizItems = [
    { q: q1, set: setQ1, correct: 'b', question: '1. ¿Cuanto protege el IPAB por persona por banco?', opts: [{ key: 'a', label: 'A) $500,000' }, { key: 'b', label: 'B) ~3 millones de pesos' }, { key: 'c', label: 'C) Sin limite' }], fb: { ok: '¡Correcto! 400,000 UDIs ≈ 3 millones.', fail: 'Son ~3 millones (400,000 UDIs).' } },
    { q: q2, set: setQ2, correct: 'b', question: '2. ¿El IPAB cubre las inversiones en bolsa?', opts: [{ key: 'a', label: 'A) Si' }, { key: 'b', label: 'B) No' }], fb: { ok: '¡Correcto! Solo depositos en cuentas bancarias autorizadas.', fail: 'Las inversiones en bolsa NO estan cubiertas por el IPAB.' } },
    { q: q3, set: setQ3, correct: 'b', question: '3. ¿Que organismo supervisa los bancos en Mexico?', opts: [{ key: 'a', label: 'A) SAT' }, { key: 'b', label: 'B) CNBV' }, { key: 'c', label: 'C) IMSS' }], fb: { ok: '¡Correcto! Comision Nacional Bancaria y de Valores.', fail: 'Es la CNBV — Comision Nacional Bancaria y de Valores.' } },
    { q: q4, set: setQ4, correct: 'a', question: '4. Tienes $80,000 en cuenta de ahorro en un banco autorizado que quiebra. ¿Estarias cubierto?', opts: [{ key: 'a', label: 'A) Si, estoy dentro del limite IPAB' }, { key: 'b', label: 'B) No, lo perderia todo' }], fb: { ok: '¡Correcto! $80,000 esta muy por debajo del limite.', fail: '$80,000 esta muy por debajo del limite de ~3 millones.' } },
  ];

  return (
    <LessonShell id="L10" title="El IPAB: el guardian de tu dinero" completion={{ ready: quizDone, score: score / 4 }}>
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: successColor }} />
        </div>

        {/* Pantalla 0 — Apertura */}
        {step === 0 && (
          <div className="space-y-6">
            <FinniMessage variant="coach" title="¿Y si mañana tu banco cerrara?" message="¿Perderias todo tu dinero? La respuesta depende de donde tengas ese dinero. Si esta en un banco autorizado… estas protegido." />
            <FECard variant="flat" className="border-2" style={{ borderColor: successColor, backgroundColor: successBg }}>
              <p className="text-base font-bold mb-2">El IPAB</p>
              <p className="text-sm">Instituto para la Proteccion al Ahorro Bancario — es el organismo del gobierno mexicano que garantiza tus depositos bancarios.</p>
              <p className="text-sm mt-2">Protege hasta <b>400,000 UDIs por persona por banco</b> (≈ 3 millones de pesos en 2024).</p>
              <p className="text-sm mt-2" style={{ color: '#059669' }}>No importa si el banco quiebra mañana: si tu saldo esta por debajo del limite, lo recuperas.</p>
            </FECard>
            <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => setStep(1)}>
              ¿Que cubre y que NO? →
            </button>
          </div>
        )}

        {/* Pantalla 1 — Que cubre y timeline */}
        {step === 1 && (
          <div className="space-y-6">
            <p className="text-base font-bold">Productos bancarios — ¿cubiertos?</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Toca cada uno para mas detalle. Clave: solo bancos autorizados y supervisados por la CNBV.</p>
            <div className="space-y-2">
              {CUBRE.map((item, i) => (
                <FECard
                  key={i}
                  variant="flat"
                  className="border cursor-pointer"
                  style={{
                    borderColor: item.si ? successColor : errorColor,
                    backgroundColor: expanded.has(i) ? (item.si ? successBg : errorBg) : 'white',
                  }}
                  onClick={() => toggleExpanded(i)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold">{item.label}</p>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: item.si ? successColor : errorColor }}>
                      {item.si ? 'SI cubre' : 'NO cubre'}
                    </span>
                  </div>
                  {expanded.has(i) && (
                    <p className="text-xs mt-1.5" style={{ color: item.si ? '#059669' : '#DC2626' }}>
                      {item.si
                        ? 'Protegido hasta el limite del IPAB en bancos autorizados.'
                        : 'Este producto no esta garantizado por el IPAB. Verifica antes de invertir.'}
                    </p>
                  )}
                </FECard>
              ))}
            </div>

            <p className="text-base font-bold mt-2">¿Que pasa si mi banco quiebra?</p>
            <div className="space-y-3">
              {TIMELINE.map((t, i) => (
                <FECard key={i} variant="flat" className="border" style={{ borderColor: successBg }}>
                  <div className="flex gap-4 items-center">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white shrink-0" style={{ backgroundColor: successColor }}>{t.dia}</span>
                    <p className="text-sm">{t.evento}</p>
                  </div>
                </FECard>
              ))}
            </div>

            <FinniMessage variant="coach" title="Dato de confianza" message="Desde 1999, el IPAB ha protegido a miles de ahorradores en Mexico. Tu dinero esta mas seguro de lo que crees." />
            <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => setStep(2)}>
              Quiz de 4 preguntas →
            </button>
          </div>
        )}

        {/* Pantalla 2 — Quiz */}
        {step === 2 && (
          <div className="space-y-6">
            <p className="text-2xl font-bold">Quiz: El IPAB</p>
            {quizItems.map(({ q, set, correct, question, opts, fb }, idx) => {
              if (idx > 0 && quizItems[idx - 1]!.q === null) return null;
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
              <FinniMessage variant="success" title={`${score}/4 correctas`} message="Accion pendiente: verifica que tu banco este registrado en el IPAB hoy en ipab.gob.mx" />
            )}
          </div>
        )}
      </div>
    </LessonShell>
  );
}
