import { useEffect, useState } from 'react';

import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import { useLessonResume } from '../../../../features/lessons/hooks/useLessonResume';
import { LessonResumeBanner } from '../../../../features/lessons/components/LessonResumeBanner';

const successColor = 'var(--color-brand-success)';
const successBg    = 'var(--color-brand-success-bg)';
const warnColor    = 'var(--color-brand-warning)';
const warnBg       = 'var(--color-brand-warning-bg)';

const FINNI_MSGS = [
  '¡Primer día completado! Ya llevas {monto} hacia tu meta.',
  '¡Dos días seguidos! Estás construyendo algo real.',
  '¡Lo lograste! Tres días seguidos. Eso ya es el inicio de un hábito real.',
];

export default function L11() {
  const [step, setStep] = useState(0);

  const resume = useLessonResume('ahorro', 'L11');
  const [resumeHandled, setResumeHandled] = useState(false);

  useEffect(() => {
    if (step > 0) resume.save({ step });
  }, [step, resume]);
  const [accepted, setAccepted] = useState(false);
  const [dayAmounts, setDayAmounts] = useState<string[]>(['', '', '']);
  const [dayCompleted, setDayCompleted] = useState<boolean[]>([false, false, false]);
  const [badgeUnlocked, setBadgeUnlocked] = useState(false);
  const [extendReto, setExtendReto] = useState(false);

  const completedDays = dayCompleted.filter(Boolean).length;
  const allDone = completedDays === 3;
  const totalAcumulado = dayAmounts.reduce((sum, v) => sum + (parseFloat(v) || 0), 0);

  const completeDay = async (idx: number) => {
    const amount = parseFloat(dayAmounts[idx] ?? '') || 0;
    if (amount <= 0) return;
    const newCompleted = [...dayCompleted];
    newCompleted[idx] = true;
    setDayCompleted(newCompleted);
    if (newCompleted.filter(Boolean).length === 3) {
      const total = dayAmounts.reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
      await lessonDataRepository.save('ahorro', 'l11_reto', { dayAmounts: dayAmounts.map((v) => parseFloat(v) || 0), totalAcumulado: total, completedAt: new Date().toISOString() });
      setBadgeUnlocked(true);
      setStep(3);
    }
  };

  const progress = step === 0 ? 0 : step === 1 ? 25 : step === 2 ? 50 : 100;

  return (
    <LessonShell id="L11" title="Micro-reto: ahorra 3 días seguidos" completion={{ ready: allDone }}>
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

        {/* Pantalla 0 — Apertura motivacional */}
        {step === 0 && (
          <div className="space-y-6">
            <FinniMessage variant="coach" title="¡Es hora de pasar a la práctica!" message="Este micro-reto es simple: aparta algo cada día durante 3 días. No importa si son $10 o $100. Lo que importa es el hábito." />
            <FECard variant="flat" className="border" style={{ borderColor: successColor }}>
              <p className="font-bold mb-2">Cómo funciona el reto:</p>
              <div className="space-y-1">
                <p className="text-sm">1. Aparta un monto (el que puedas) cada día</p>
                <p className="text-sm">2. Regístralo aquí en FinEmpoder</p>
                <p className="text-sm">3. Recibe confirmación de Finni</p>
              </div>
              <span className="inline-flex items-center mt-3 px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: warnBg, color: warnColor, border: `1px solid ${warnColor}` }}>
                Badge: Constancia de 3 🔥
              </span>
            </FECard>
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="text-sm font-bold mb-1">Reglas:</p>
              <p className="text-sm">• No hay monto mínimo. $5 cuenta.</p>
              <p className="text-sm">• Puede ser transferencia, alcancía física, o efectivo.</p>
              <p className="text-sm">• Si fallas un día, el contador reinicia. Sin culpa.</p>
            </FECard>
            <button
              className="w-full min-h-11 text-white rounded-xl font-semibold text-sm"
              style={{ backgroundColor: successColor }}
              onClick={() => { setAccepted(true); setStep(1); }}
            >
              ✅ Acepto el reto →
            </button>
          </div>
        )}

        {/* Pantalla 1 — Contador de días */}
        {accepted && step >= 1 && step < 3 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="font-bold">Tu progreso:</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: completedDays === 3 ? successBg : completedDays > 0 ? warnBg : 'var(--color-neutral-100)', color: completedDays === 3 ? successColor : completedDays > 0 ? warnColor : 'var(--color-text-secondary)', border: `1px solid ${completedDays === 3 ? successColor : completedDays > 0 ? warnColor : 'var(--color-neutral-200)'}` }}>
                {completedDays}/3 días
              </span>
            </div>
            <FECard variant="flat" className="text-center py-4 border-2" style={{ backgroundColor: successBg, borderColor: successColor }}>
              <p className="text-4xl font-extrabold">{completedDays}/3</p>
              <p className="text-sm text-[var(--color-text-secondary)]">días consecutivos</p>
            </FECard>
            <div className="space-y-4">
              {[0, 1, 2].map((idx) => (
                <FECard
                  key={idx}
                  variant="flat"
                  className="border"
                  style={{
                    borderColor: dayCompleted[idx] ? successColor : idx === completedDays ? warnColor : 'var(--color-neutral-200)',
                    backgroundColor: dayCompleted[idx] ? successBg : 'white',
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-bold">Día {idx + 1}</p>
                    {dayCompleted[idx] && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: successBg, color: successColor, border: `1px solid ${successColor}` }}>✅ Completado</span>
                    )}
                  </div>
                  {dayCompleted[idx] ? (
                    <div className="space-y-1">
                      <p className="text-sm" style={{ color: successColor }}>${parseFloat(dayAmounts[idx] || '0').toLocaleString()} apartados</p>
                      <p className="text-sm italic">{FINNI_MSGS[idx]?.replace('{monto}', `$${parseFloat(dayAmounts[idx] || '0').toLocaleString()}`)}</p>
                    </div>
                  ) : idx === completedDays ? (
                    <div className="space-y-2">
                      <p className="text-xs text-[var(--color-text-secondary)]">¿Cuánto apartas hoy?</p>
                      <div className="flex gap-3">
                        <input
                          type="number"
                          min={1}
                          placeholder="$0"
                          value={dayAmounts[idx]}
                          onChange={(e) => {
                            const updated = [...dayAmounts];
                            updated[idx] = e.target.value;
                            setDayAmounts(updated);
                          }}
                          className="flex-1 border border-[var(--color-neutral-200)] rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-success)]"
                        />
                        <button
                          className="px-4 py-2 text-white rounded-lg text-sm font-bold disabled:opacity-40"
                          style={{ backgroundColor: successColor }}
                          onClick={() => void completeDay(idx)}
                          disabled={!dayAmounts[idx] || parseFloat(dayAmounts[idx]!) <= 0}
                        >
                          ✓
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--color-text-secondary)]">Completa el día {idx} primero</p>
                  )}
                </FECard>
              ))}
            </div>
            {completedDays > 0 && !allDone && (
              <FECard variant="flat" className="text-center border" style={{ backgroundColor: successBg, borderColor: successColor }}>
                <p className="text-sm font-bold">Total acumulado: ${totalAcumulado.toLocaleString()}</p>
              </FECard>
            )}
          </div>
        )}

        {/* Pantalla 3 — Badge desbloqueado */}
        {step === 3 && badgeUnlocked && (
          <div className="space-y-6">
            <FECard variant="flat" className="text-center py-8 border-[3px]" style={{ backgroundColor: warnBg, borderColor: warnColor }}>
              <p className="text-6xl mb-2">🏆</p>
              <p className="text-2xl font-bold mt-1">Constancia de 3 🔥</p>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">Badge desbloqueado · 3 días consecutivos</p>
              <p className="font-bold mt-2">Total ahorrado: ${totalAcumulado.toLocaleString()}</p>
            </FECard>
            <FinniMessage variant="success" title="3 días seguidos. Eso ya es el inicio de un hábito real." message="La ciencia dice que los hábitos comienzan a formarse con repetición constante. Acabas de dar el primer paso." />
            {!extendReto && (
              <FECard variant="flat" className="border" style={{ borderColor: successColor }}>
                <p className="text-sm font-bold mb-2">¿Quieres continuar el reto 7 días más?</p>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: successColor }} onClick={() => setExtendReto(true)}>¡Sí, continuar!</button>
                  <button className="flex-1 py-2 rounded-xl text-sm font-semibold border border-[var(--color-neutral-200)] text-[var(--color-text-secondary)]">No por ahora</button>
                </div>
              </FECard>
            )}
            {extendReto && (
              <FECard variant="flat" className="text-center border" style={{ backgroundColor: successBg, borderColor: successColor }}>
                <p className="text-sm font-bold">¡Excelente! Sigue registrando tus ahorros en las próximas lecciones.</p>
              </FECard>
            )}
          </div>
        )}
      </div>
    </LessonShell>
  );
}
