import { useState, useEffect } from 'react';
import { CalendarDays, Landmark, Leaf, Repeat, Shield, Target, TrendingUp, Trophy } from 'lucide-react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import { useLessonResume } from '../../../../features/lessons/hooks/useLessonResume';
import { LessonResumeBanner } from '../../../../features/lessons/components/LessonResumeBanner';

const successColor = 'var(--color-brand-success)';
const successBg    = 'var(--color-brand-success-bg)';
const warnColor    = 'var(--color-brand-warning)';

type MetaData = { nombre?: string; monto?: number; aportacionMensual?: number } | null;
type PlanData = { totalPlanado?: number; horizon?: number } | null;
type RetoData = { totalAcumulado?: number; dayAmounts?: number[] } | null;

const CONCEPTOS_CLAVE = [
  { icon: Repeat, titulo: 'Ahorro primero',    desc: 'Apartar antes de gastar es el hábito más poderoso.' },
  { icon: Landmark, titulo: 'Ahorro formal',     desc: 'Protección IPAB + rendimientos + historial financiero.' },
  { icon: Target, titulo: 'Meta con nombre',   desc: 'El ahorro sin propósito no dura.' },
  { icon: CalendarDays, titulo: 'Plan semanal',      desc: 'La constancia supera la cantidad.' },
  { icon: TrendingUp, titulo: 'Interes compuesto', desc: 'El tiempo es tu mejor aliado para crecer.' },
  { icon: Shield, titulo: 'Fondo de emergencias', desc: 'Tu red de seguridad antes de invertir.' },
];

export default function L15() {
  const [step, setStep] = useState(0);

  const resume = useLessonResume('ahorro', 'L15');
  const [resumeHandled, setResumeHandled] = useState(false);

  useEffect(() => {
    if (step > 0) resume.save({ step });
  }, [step, resume]);
  const [loading, setLoading] = useState(true);
  const [metaData, setMetaData] = useState<MetaData>(null);
  const [planData, setPlanData] = useState<PlanData>(null);
  const [retoData, setRetoData] = useState<RetoData>(null);

  const [montoTotal, setMontoTotal] = useState('');
  const [montoConfirmado, setMontoConfirmado] = useState(false);
  const [semanasHabito, setSemanasHabito] = useState('');
  const [masDificil, setMasDificil] = useState('');
  const [cambiaria, setCambiaria] = useState('');
  const [proximaMeta, setProximaMeta] = useState('');
  const [badgeUnlocked, setBadgeUnlocked] = useState(false);

  useEffect(() => {
    const load = async () => {
      const meta = await lessonDataRepository.load<MetaData>('ahorro', 'l5_meta');
      const plan = await lessonDataRepository.load<PlanData>('ahorro', 'l6_plan');
      const reto = await lessonDataRepository.load<RetoData>('ahorro', 'l11_reto');
      setMetaData(meta); setPlanData(plan); setRetoData(reto);
      if (reto?.totalAcumulado) setMontoTotal(String(reto.totalAcumulado));
      setLoading(false);
    };
    void load();
  }, []);

  const totalAcumulado = retoData?.totalAcumulado ?? 0;
  const totalPlanado = planData?.totalPlanado ?? 0;
  const montoNum = parseFloat(montoTotal) || 0;
  const autoEvalValid = semanasHabito.trim().length > 0 && masDificil.trim().length >= 5 && cambiaria.trim().length >= 5;
  const canComplete = montoConfirmado && autoEvalValid;

  const handleUnlock = async () => {
    await lessonDataRepository.save('ahorro', 'l15_cierre', { montoTotalAhorrado: montoNum, semanasHabito, masDificil, cambiaria, proximaMeta, savedAt: new Date().toISOString() });
    setBadgeUnlocked(true);
    setStep(5);
  };

  const progress = step === 0 ? 0 : step === 1 ? 15 : step === 2 ? 35 : step === 3 ? 60 : step === 4 ? 85 : 100;

  if (loading) {
    return (
      <LessonShell id="L15" title="Reto final: cierra tu módulo de ahorro" completion={{ ready: false }}>
        <p className="text-sm text-[var(--color-text-secondary)]">Cargando datos...</p>
      </LessonShell>
    );
  }

  return (
    <LessonShell id="L15" title="Reto final: cierra tu módulo de ahorro" completion={{ ready: canComplete }}>
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
            <FECard variant="flat" className="text-center py-6 border-2" style={{ backgroundColor: successBg, borderColor: successColor }}>
              <Leaf className="h-10 w-10 mx-auto text-[var(--color-brand-success)]" aria-hidden="true" />
              <p className="text-xl font-bold mt-2">¡El reto final!</p>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">Módulo 2 · Ahorro</p>
            </FECard>
            <FinniMessage variant="coach" title="Hoy no solo cierras el módulo" message="Demuestras que el hábito de ahorro ya es parte de ti." />
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="text-sm font-bold mb-2">En este módulo:</p>
              {[
                'Definiste tu meta de ahorro con propósito y plazo',
                'Construiste tu plan semana a semana',
                'Conociste las herramientas del ahorro formal en México',
                'Completaste el micro-reto de 3 días',
                'Aprendiste sobre interés compuesto, IPAB y seguros',
                'Registraste tu ahorro de forma constante',
              ].map((item) => <p key={item} className="text-sm py-0.5">{item}</p>)}
            </FECard>
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="text-sm font-bold mb-1">El reto tiene 3 partes:</p>
              <p className="text-sm">Parte 1: Confirma tu monto total ahorrado</p>
              <p className="text-sm">Parte 2: Autoevaluación honesta (3 preguntas)</p>
              <p className="text-sm">Parte 3: Define tu próxima meta + acceso a Módulo 3</p>
            </FECard>
            <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => setStep(1)}>
              ¡Empezar el reto final! →
            </button>
          </div>
        )}

        {/* Pantalla 1 — Parte 1: Monto total */}
        {step === 1 && (
          <div className="space-y-6">
            <p className="text-xl font-bold">Parte 1: Tu ahorro del módulo</p>
            {totalAcumulado > 0 && (
              <FECard variant="flat" className="border" style={{ backgroundColor: successBg, borderColor: successColor }}>
                <p className="text-sm font-bold">Datos del micro-reto precargados: ${totalAcumulado.toLocaleString()}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">Puedes ajustar si ahorraste más por otros medios</p>
              </FECard>
            )}
            <input
              type="number"
              min={0}
              placeholder="Monto total ahorrado durante el módulo ($)"
              value={montoTotal}
              onChange={(e) => setMontoTotal(e.target.value)}
              className="w-full border border-[var(--color-neutral-200)] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-success)]"
            />
            <p className="text-xs text-[var(--color-text-secondary)] -mt-4">Cualquier monto es válido. Lo importante es el hábito.</p>
            {metaData?.nombre && (
              <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
                <p className="text-xs">Tu meta: "{metaData.nombre}" — ${metaData.monto?.toLocaleString()}</p>
                {metaData.monto && montoNum > 0 && (
                  <p className="text-xs" style={{ color: successColor }}>Avance: {Math.min(100, (montoNum / metaData.monto) * 100).toFixed(0)}% de tu meta</p>
                )}
              </FECard>
            )}
            {parseFloat(montoTotal) >= 0 && montoTotal !== '' && (
              <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => { setMontoConfirmado(true); setStep(2); }}>
                Confirmar y continuar →
              </button>
            )}
          </div>
        )}

        {/* Pantalla 2 — Parte 2: Autoevaluación */}
        {step === 2 && (
          <div className="space-y-6">
            <p className="text-xl font-bold">Parte 2: Autoevaluación honesta</p>
            <FinniMessage variant="coach" title="No hay respuestas incorrectas" message="Esta autoevaluación es solo para ti. La honestidad te ayuda a mejorar." />
            <div className="space-y-3">
              {[
                { label: '¿Cuántas semanas mantuviste el hábito?', val: semanasHabito, set: setSemanasHabito, placeholder: 'Ej: 3 semanas, o "no lo seguí formalmente"', multiline: false },
                { label: '¿Qué te resultó más difícil?', val: masDificil, set: setMasDificil, placeholder: 'Describe tu mayor reto...', multiline: true },
                { label: '¿Qué cambiarías para el próximo mes?', val: cambiaria, set: setCambiaria, placeholder: 'Un ajuste concreto...', multiline: true },
              ].map((field) =>
                field.multiline ? (
                  <textarea
                    key={field.label}
                    rows={2}
                    placeholder={field.placeholder}
                    value={field.val}
                    onChange={(e) => field.set(e.target.value)}
                    className="w-full border border-[var(--color-neutral-200)] rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-success)]"
                  />
                ) : (
                  <input
                    key={field.label}
                    type="text"
                    placeholder={field.placeholder}
                    value={field.val}
                    onChange={(e) => field.set(e.target.value)}
                    className="w-full border border-[var(--color-neutral-200)] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-success)]"
                  />
                )
              )}
            </div>
            {autoEvalValid && (
              <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => setStep(3)}>
                Parte 3: Próxima meta →
              </button>
            )}
          </div>
        )}

        {/* Pantalla 3 — Parte 3: Próxima meta + M3 */}
        {step === 3 && (
          <div className="space-y-6">
            <p className="text-xl font-bold">Parte 3: Tu próxima meta</p>
            <FinniMessage variant="coach" title="El Módulo 3 te espera" message="¿Podrías invertir parte de ese ahorro? En el Módulo 3 de Inversión te mostraremos cómo hacer crecer lo que ahorras." />
            <input
              type="text"
              placeholder="Ej: Seguir ahorrando para mi laptop..."
              value={proximaMeta}
              onChange={(e) => setProximaMeta(e.target.value)}
              className="w-full border border-[var(--color-neutral-200)] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-success)]"
            />
            <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => setStep(4)}>
              Ver resumen final →
            </button>
          </div>
        )}

        {/* Pantalla 4 — Resumen + boton de desbloqueo */}
        {step === 4 && (
          <div className="space-y-6">
            <p className="text-xl font-bold">Resumen del reto</p>
            <FECard variant="flat" className="border" style={{ backgroundColor: successBg, borderColor: successColor }}>
              <p className="text-sm font-bold mb-2">Partes completadas:</p>
              <p className="text-sm">1. Monto total confirmado: ${montoNum.toLocaleString()}</p>
              <p className="text-sm">2. Autoevaluación completada ({semanasHabito})</p>
              <p className="text-sm">3. Próxima meta definida{proximaMeta ? `: "${proximaMeta}"` : ''}</p>
            </FECard>
            {totalPlanado > 0 && (
              <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
                <div className="flex justify-between">
                  <span className="text-xs">Planeado:</span>
                  <span className="text-xs">${totalPlanado.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs">Real:</span>
                  <span className="text-xs font-bold" style={{ color: montoNum >= totalPlanado * 0.5 ? successColor : warnColor }}>${montoNum.toLocaleString()}</span>
                </div>
              </FECard>
            )}
            <button
              className="w-full min-h-11 text-white rounded-xl font-semibold text-sm disabled:opacity-50"
              style={{ backgroundColor: successColor }}
              onClick={() => void handleUnlock()}
              disabled={!canComplete}
            >
              ¡Desbloquear Ahorrador Constante!
            </button>
          </div>
        )}

        {/* Pantalla 5 — Badge desbloqueado */}
        {step === 5 && badgeUnlocked && (
          <div className="space-y-6">
            <FECard variant="flat" className="text-center py-8 border-[3px]" style={{ backgroundColor: successBg, borderColor: successColor }}>
              <Trophy className="h-12 w-12 mx-auto mb-2" aria-hidden="true" />
              <p className="text-2xl font-bold mt-1">Ahorrador Constante</p>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">Badge desbloqueado · Módulo 2 completado</p>
            </FECard>
            <FinniMessage variant="success" title="¡Lo lograste!" message="Ahora tienes un hábito que muchos adultos nunca desarrollan. Eso vale más que cualquier cantidad que hayas ahorrado." />
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="font-bold mb-3">Lo que aprendiste en Módulo 2:</p>
              <div className="space-y-2">
                {CONCEPTOS_CLAVE.map((c) => (
                  <div key={c.titulo} className="flex gap-3 items-start">
                    <c.icon className="h-5 w-5 text-[var(--color-brand-success)]" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-bold">{c.titulo}</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">{c.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FECard>
            <a
              href="/app/inversion"
              className="block w-full min-h-11 text-white rounded-xl font-semibold text-sm text-center leading-[44px]"
              style={{ backgroundColor: successColor }}
            >
              Comenzar Módulo 3: Inversión
            </a>
          </div>
        )}
      </div>
    </LessonShell>
  );
}
