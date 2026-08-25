import { useEffect, useState } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { useLessonResume } from '../../../../features/lessons/hooks/useLessonResume';
import { LessonResumeBanner } from '../../../../features/lessons/components/LessonResumeBanner';
import { MX, fmtFecha } from '@/lib/datos-mx';

type Choice = 'informal' | 'formal' | null;

const successColor = 'var(--color-brand-success)';
const successBg = 'var(--color-brand-success-bg)';
const errorColor = 'var(--color-brand-error)';
const errorBg = 'var(--color-brand-error-bg)';
const warnColor = 'var(--color-brand-warning)';

const SCENARIOS = [
  { id: 1, text: '¿Llegó la quincena de la tanda pero tu amigo no tiene el dinero?', best: 'formal' as const, feedback: 'Con ahorro informal dependes de terceros. El ahorro formal no falla.' },
  { id: 2, text: '¿Tu banco quebró?', best: 'formal' as const, feedback: `El IPAB protege hasta ≈ $3.5 millones (${fmtFecha(MX.ipab)}) en bancos autorizados. El cochinito, no.` },
  { id: 3, text: '¿Emergencia médica a medianoche?', best: 'informal' as const, feedback: 'El acceso inmediato es la ventaja del ahorro informal en casos urgentes.' },
  { id: 4, text: '¿Te robaron en casa?', best: 'formal' as const, feedback: 'El ahorro formal no está en tu casa. El robo no lo afecta.' },
  { id: 5, text: '¿Quieres ver cuánto llevas ahorrando?', best: 'formal' as const, feedback: 'El banco registra todo automáticamente. El cochinito no.' },
];

const PRODUCTOS = [
  'BBVA Libreta (sin comisión con saldo mínimo)',
  'Santander Zero (sin comisión)',
  'Hey Banco (rendimiento adicional)',
];

export default function L02() {
  const [step, setStep] = useState(0);

  const resume = useLessonResume('ahorro', 'L02');
  const [resumeHandled, setResumeHandled] = useState(false);

  useEffect(() => {
    if (step > 0) resume.save({ step });
  }, [step, resume]);
  const [answers, setAnswers] = useState<Record<number, Choice>>({});
  const [showFeedback, setShowFeedback] = useState<Record<number, boolean>>({});

  const answered = Object.values(answers).filter(Boolean).length;
  const allDone = answered === SCENARIOS.length;

  const choose = (id: number, choice: Choice) => {
    if (answers[id]) return;
    setAnswers((prev) => ({ ...prev, [id]: choice }));
    setShowFeedback((prev) => ({ ...prev, [id]: true }));
  };

  const progress = step === 0 ? 0 : step === 1 ? 33 : step === 2 ? 66 : 100;

  return (
    <LessonShell id="L02" title="Cochinito vs banco: ahorro informal y formal" completion={{ ready: allDone }}>
      <div className="p-1">
        {resume.hasSaved && !resumeHandled && (
          <LessonResumeBanner
            step={resume.savedStep ?? 0}
            onContinue={() => {
              const snapshot = resume.accept();
              if (snapshot) setStep(snapshot.step);
              setResumeHandled(true);
            }}
            onRestart={() => {
              resume.ignore();
              setResumeHandled(true);
            }}
          />
        )}
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: successColor }} />
        </div>

        {/* Pantalla 0 — Apertura */}
        {step === 0 && (
          <div className="space-y-6">
            <FinniMessage variant="coach" title="Hoy vamos a comparar" message="¿Guardas dinero en tu cuarto? ¿Participas en tandas con amigos? No hay nada malo con eso… pero hay algo mejor." />
            <div className="space-y-3">
              <FECard variant="flat" className="border-2" style={{ borderColor: warnColor }}>
                <p className="font-bold mb-2">Ahorro Informal</p>
                <div className="space-y-1">
                  <p className="text-sm">Formas: alcancía, debajo del colchón, tandas</p>
                  <p className="text-sm" style={{ color: successColor }}>Acceso inmediato, sin trámites</p>
                  <p className="text-sm" style={{ color: errorColor }}>Robo, gasto impulsivo, cero protección legal</p>
                </div>
              </FECard>
              <FECard variant="flat" className="border-2" style={{ borderColor: successColor }}>
                <p className="font-bold mb-2">Ahorro Formal</p>
                <div className="space-y-1">
                  <p className="text-sm">Formas: cuenta de ahorro, CETES, nómina</p>
                  <p className="text-sm" style={{ color: successColor }}>Rendimiento, protección IPAB (≈ $3.5M, {fmtFecha(MX.ipab)}), historial</p>
                  <p className="text-sm" style={{ color: errorColor }}>Comisiones si no es la cuenta correcta</p>
                </div>
              </FECard>
            </div>
            <FinniMessage variant="coach" title="La tanda puede ser parte de tu estrategia" message="Pero no puede ser tu única estrategia." />
            <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => setStep(1)}>
              Jugar los 5 escenarios →
            </button>
          </div>
        )}

        {/* Pantalla 1 — Mini-juego */}
        {step === 1 && (
          <div className="space-y-6">
            <p className="font-bold">¿Informal o Formal? Toca tu elección en cada situación.</p>
            <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2">
              <div className="h-2 rounded-full transition-all" style={{ width: `${(answered / SCENARIOS.length) * 100}%`, backgroundColor: successColor }} />
            </div>
            <div className="space-y-3">
              {SCENARIOS.map((sc) => {
                const ans = answers[sc.id];
                const isCorrect = ans === sc.best;
                return (
                  <FECard
                    key={sc.id}
                    variant="flat"
                    className="border"
                    style={{
                      borderColor: ans ? (isCorrect ? successColor : errorColor) : 'var(--color-neutral-200)',
                      backgroundColor: ans ? (isCorrect ? successBg : errorBg) : 'white',
                    }}
                  >
                    <p className="text-sm font-semibold mb-2">{sc.id}. {sc.text}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => choose(sc.id, 'informal')}
                        disabled={!!ans}
                        className="px-3 py-1.5 rounded-lg text-sm font-bold border-2 disabled:cursor-default transition-colors"
                        style={{
                          borderColor: warnColor,
                          backgroundColor: ans === 'informal' ? warnColor : 'transparent',
                          color: ans === 'informal' ? 'white' : warnColor,
                        }}
                      >
                        Informal
                      </button>
                      <button
                        onClick={() => choose(sc.id, 'formal')}
                        disabled={!!ans}
                        className="px-3 py-1.5 rounded-lg text-sm font-bold border-2 disabled:cursor-default transition-colors"
                        style={{
                          borderColor: successColor,
                          backgroundColor: ans === 'formal' ? successColor : 'transparent',
                          color: ans === 'formal' ? 'white' : successColor,
                        }}
                      >
                        Formal
                      </button>
                    </div>
                    {showFeedback[sc.id] && (
                      <p className="text-xs mt-2" style={{ color: isCorrect ? successColor : errorColor }}>
                        {sc.feedback}
                      </p>
                    )}
                  </FECard>
                );
              })}
            </div>
            {allDone && (
              <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => setStep(2)}>
                Ver la estrategia ideal →
              </button>
            )}
          </div>
        )}

        {/* Pantalla 2 — Resultado */}
        {step === 2 && (
          <div className="space-y-6">
            <FECard variant="flat" className="text-center py-4 border-2" style={{ backgroundColor: successBg, borderColor: successColor }}>
              <p className="text-xl font-bold">Estrategia ideal: combina ambos</p>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">Informal para emergencias inmediatas · Formal para crecer y protegerte</p>
            </FECard>
            <FinniMessage variant="coach" title="Finni te recomienda" message="Empieza con una cuenta sin comisiones. Con $0 de saldo mínimo puedes abrir hoy mismo." />
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="font-bold mb-2">Cuentas sin comisiones para comenzar:</p>
              <div className="space-y-1">
                {PRODUCTOS.map((p) => (
                  <span key={p} className="block px-3 py-1 rounded-full text-xs font-semibold border" style={{ borderColor: successColor, color: successColor }}>{p}</span>
                ))}
              </div>
            </FECard>
          </div>
        )}
      </div>
    </LessonShell>
  );
}
