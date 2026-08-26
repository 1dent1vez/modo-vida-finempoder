import { useEffect, useState } from 'react';

import { Check, Trophy } from 'lucide-react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import { useLessonResume } from '../../../../features/lessons/hooks/useLessonResume';
import { LessonResumeBanner } from '../../../../features/lessons/components/LessonResumeBanner';
import { daysAgoLocalKey, localDayKey } from '../../../../lib/localDate';

const successColor = 'var(--color-brand-success)';
const successBg    = 'var(--color-brand-success-bg)';
const warnColor    = 'var(--color-brand-warning)';
const warnBg       = 'var(--color-brand-warning-bg)';

const FINNI_MSGS = [
  '¡Primer día completado! Ya llevas {monto} hacia tu meta.',
  '¡Dos días de ahorro! Estás construyendo algo real.',
  '¡Lo lograste! Tres días de ahorro. Eso ya es el inicio de un hábito real.',
];

const MAX_DAYS = 3;

type RetoPayload = {
  days?: string[];
  dayAmounts?: number[];
  totalAcumulado?: number;
  completedAt?: string;
  completadoViaLegacy?: boolean;
};

type RetoMigrado = {
  days: string[];
  dayAmounts: number[];
  totalAcumulado: number;
  completadoViaLegacy: boolean;
};

function formatFecha(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

/**
 * Migración del payload viejo de 'l11_reto' (sin campo days).
 * El código anterior solo persistía al completar 3/3, así que un payload con
 * completedAt ya es un reto completado: se respeta sin inventar fechas
 * (completadoViaLegacy). Si aparecen 1-2 montos sin completedAt (caso
 * defensivo que el código viejo nunca escribía), se migran como fechas
 * ESTIMADAS hacia atrás (hoy-1, hoy-2), no reales: documentado en
 * F5_PROMESAS.md. Con 'days' presente (payload nuevo) se usa tal cual.
 */
function migrarPayload(p: RetoPayload | null): RetoMigrado {
  const dayAmounts = p?.dayAmounts ?? [];
  const totalAcumulado = p?.totalAcumulado ?? 0;
  if (!p) return { days: [], dayAmounts, totalAcumulado, completadoViaLegacy: false };
  if (Array.isArray(p.days) && p.days.length > 0) {
    return { days: p.days, dayAmounts, totalAcumulado, completadoViaLegacy: false };
  }
  if (p.completedAt || dayAmounts.length >= MAX_DAYS) {
    return { days: [], dayAmounts, totalAcumulado, completadoViaLegacy: true };
  }
  const days = dayAmounts.map((_, i) => daysAgoLocalKey(i + 1));
  return { days, dayAmounts, totalAcumulado, completadoViaLegacy: false };
}

export default function L11() {
  const [step, setStep] = useState(0);

  const resume = useLessonResume('ahorro', 'L11');
  const [resumeHandled, setResumeHandled] = useState(false);

  useEffect(() => {
    if (step > 0) resume.save({ step });
  }, [step, resume]);
  const [accepted, setAccepted] = useState(false);
  const [days, setDays] = useState<string[]>([]);
  const [dayAmounts, setDayAmounts] = useState<number[]>([]);
  const [completadoViaLegacy, setCompletadoViaLegacy] = useState(false);
  const [montoInput, setMontoInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [badgeUnlocked, setBadgeUnlocked] = useState(false);
  const [extendReto, setExtendReto] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const p = await lessonDataRepository.load<RetoPayload>('ahorro', 'l11_reto');
      const migrado = migrarPayload(p);
      setDays(migrado.days);
      setDayAmounts(migrado.dayAmounts);
      setCompletadoViaLegacy(migrado.completadoViaLegacy);
      if (migrado.completadoViaLegacy) {
        setBadgeUnlocked(true);
        setStep(3);
      }
      setLoaded(true);
    };
    void load();
  }, []);

  const completedCount = completadoViaLegacy ? MAX_DAYS : days.length;
  const allDone = completadoViaLegacy || days.length >= MAX_DAYS;
  const totalAcumulado = dayAmounts.reduce((sum, v) => sum + v, 0);
  const hoy = localDayKey(new Date());
  const hoyCompletado = days.includes(hoy);

  const completeDay = async () => {
    const idx = days.length;
    if (idx >= MAX_DAYS) return;
    const monto = parseFloat(montoInput) || 0;
    if (monto <= 0) return;
    if (hoyCompletado) return;
    setSaving(true);
    setSaveError('');
    try {
      const newDays = [...days, hoy];
      const newAmounts = [...dayAmounts, monto];
      const total = newAmounts.reduce((sum, v) => sum + v, 0);
      const payload: RetoPayload = {
        days: newDays,
        dayAmounts: newAmounts,
        totalAcumulado: total,
      };
      if (newDays.length >= MAX_DAYS) {
        payload.completedAt = new Date().toISOString();
      }
      await lessonDataRepository.save('ahorro', 'l11_reto', payload);
      setDays(newDays);
      setDayAmounts(newAmounts);
      setMontoInput('');
      if (newDays.length >= MAX_DAYS) {
        setBadgeUnlocked(true);
        setStep(3);
      }
    } catch {
      setSaveError('No pudimos guardar tu ahorro. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const progress = step === 0 ? 0 : step === 1 ? 25 : step === 2 ? 50 : 100;

  if (!loaded) {
    return (
      <LessonShell id="L11" title="Micro-reto: ahorra en 3 días" completion={{ ready: false }}>
        <p className="text-sm text-[var(--color-text-secondary)]">Cargando tu reto...</p>
      </LessonShell>
    );
  }

  return (
    <LessonShell id="L11" title="Micro-reto: ahorra en 3 días" completion={{ ready: allDone }}>
      <div className="p-1">
        {resume.hasSaved && !resumeHandled && !allDone && (
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
            <FinniMessage variant="coach" title="¡Es hora de pasar a la práctica!" message="Este micro-reto es simple: aparta algo un día a la vez. No importa si son $10 o $100. Completa 3 días y el hábito empieza a formarse." />
            <FECard variant="flat" className="border" style={{ borderColor: successColor }}>
              <p className="font-bold mb-2">Cómo funciona el reto:</p>
              <div className="space-y-1">
                <p className="text-sm">1. Aparta un monto (el que puedas) un día</p>
                <p className="text-sm">2. Regístralo aquí en FinEmpoder</p>
                <p className="text-sm">3. Repite hasta completar 3 días</p>
              </div>
              <span className="inline-flex items-center mt-3 px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: warnBg, color: warnColor, border: `1px solid ${warnColor}` }}>
                Badge: Constancia de 3
              </span>
            </FECard>
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="text-sm font-bold mb-1">Reglas:</p>
              <p className="text-sm">• No hay monto mínimo. $5 cuenta.</p>
              <p className="text-sm">• Puede ser transferencia, alcancía física, o efectivo.</p>
              <p className="text-sm">• Los 3 días no tienen que ser seguidos: completa uno por día.</p>
            </FECard>
            <button
              className="w-full min-h-11 text-white rounded-xl font-semibold text-sm"
              style={{ backgroundColor: successColor }}
              onClick={() => { setAccepted(true); setStep(1); }}
            >
              Acepto el reto →
            </button>
          </div>
        )}

        {/* Pantalla 1 — Contador de días */}
        {accepted && step >= 1 && step < 3 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="font-bold">Tu progreso:</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: completedCount === 3 ? successBg : completedCount > 0 ? warnBg : 'var(--color-neutral-100)', color: completedCount === 3 ? successColor : completedCount > 0 ? warnColor : 'var(--color-text-secondary)', border: `1px solid ${completedCount === 3 ? successColor : completedCount > 0 ? warnColor : 'var(--color-neutral-200)'}` }}>
                {completedCount}/3 días
              </span>
            </div>
            <FECard variant="flat" className="text-center py-4 border-2" style={{ backgroundColor: successBg, borderColor: successColor }}>
              <p className="text-4xl font-extrabold">{completedCount}/3</p>
              <p className="text-sm text-[var(--color-text-secondary)]">días de ahorro</p>
            </FECard>
            {saveError && (
              <FinniMessage
                variant="error"
                title="No pudimos guardar"
                message={saveError}
              />
            )}
            <div className="space-y-4">
              {[0, 1, 2].map((idx) => {
                const completado = days[idx] !== undefined;
                const esActivo = !completadoViaLegacy && idx === days.length;
                return (
                  <FECard
                    key={idx}
                    variant="flat"
                    className="border"
                    style={{
                      borderColor: completado ? successColor : esActivo ? warnColor : 'var(--color-neutral-200)',
                      backgroundColor: completado ? successBg : 'white',
                    }}
                  >
                    {completado ? (
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-bold">Día {idx + 1}/3 completado</p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: successBg, color: successColor, border: `1px solid ${successColor}` }}>Completado</span>
                        </div>
                        <p className="text-xs text-[var(--color-text-secondary)]">Apartado el {formatFecha(days[idx])}</p>
                        <p className="text-sm" style={{ color: successColor }}>${(dayAmounts[idx] ?? 0).toLocaleString()} apartados</p>
                        <p className="text-sm italic">{FINNI_MSGS[idx]?.replace('{monto}', `$${(dayAmounts[idx] ?? 0).toLocaleString()}`)}</p>
                      </div>
                    ) : esActivo ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-bold">Día {idx + 1}/3</p>
                          {hoyCompletado && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: warnBg, color: warnColor, border: `1px solid ${warnColor}` }}>Pendiente</span>
                          )}
                        </div>
                        {hoyCompletado ? (
                          <p className="text-xs text-[var(--color-text-secondary)]">
                            Vuelve mañana para el día {idx + 1}
                          </p>
                        ) : (
                          <>
                            <p className="text-xs text-[var(--color-text-secondary)]">
                              Día {idx + 1}/3: toca completar (guarda tu ahorro del día)
                            </p>
                            <div className="flex gap-3">
                              <input
                                type="number"
                                min={1}
                                placeholder="$0"
                                value={montoInput}
                                onChange={(e) => setMontoInput(e.target.value)}
                                className="flex-1 border border-[var(--color-neutral-200)] rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-success)]"
                              />
                              <button
                                aria-label={`Completar día ${idx + 1}`}
                                className="px-4 py-2 text-white rounded-lg text-sm font-bold disabled:opacity-40"
                                style={{ backgroundColor: successColor }}
                                onClick={() => void completeDay()}
                                disabled={!montoInput || parseFloat(montoInput) <= 0 || saving}
                              >
                                <Check className="h-5 w-5" aria-hidden="true" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm font-bold">Día {idx + 1}/3</p>
                    )}
                  </FECard>
                );
              })}
            </div>
            {completedCount > 0 && !allDone && (
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
              <Trophy className="h-12 w-12 mx-auto mb-2" aria-hidden="true" />
              <p className="text-2xl font-bold mt-1">Constancia de 3</p>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">Badge desbloqueado · 3 días de ahorro</p>
              <p className="font-bold mt-2">Total ahorrado: ${totalAcumulado.toLocaleString()}</p>
            </FECard>
            <FinniMessage variant="success" title="3 días de ahorro. Eso ya es el inicio de un hábito real." message="La ciencia dice que los hábitos comienzan a formarse con repetición constante. Acabas de dar el primer paso." />
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
