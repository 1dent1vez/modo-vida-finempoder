import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

const CONCEPTOS_CLAVE = [
  { emoji: '🐜', titulo: 'Gasto hormiga', desc: 'Pequeñas compras automáticas que suman mucho al mes.' },
  { emoji: '📊', titulo: 'Ingresos fijos vs variables', desc: 'Planea diferente para cada tipo de ingreso.' },
  { emoji: '⚖️', titulo: 'Regla 50-30-20', desc: 'Necesidades / Deseos / Ahorro.' },
  { emoji: '📝', titulo: 'Registro de gastos', desc: 'Lo que no mides, no puedes mejorar.' },
  { emoji: '📅', titulo: 'Balance mensual', desc: 'Ingresos menos gastos: el termómetro de tu mes.' },
  { emoji: '⚡', titulo: 'Priorización en crisis', desc: 'Urgente+Necesario primero.' },
  { emoji: '💭', titulo: 'Gasto emocional', desc: '¿Lo comprarías si te sintieras bien?' },
  { emoji: '🎯', titulo: 'Meta SMART', desc: 'Específica, Medible, Alcanzable, Relevante, Temporal.' },
  { emoji: '🏛️', titulo: 'Herramientas', desc: 'App CONDUSEF, Sheets, FinEmpoder.' },
];

type BudgetData = { totalIngresos?: number; totalGastos?: number; balance?: number } | null;

export default function L15() {
  const [step, setStep] = useState(0);
  const [budgetData, setBudgetData] = useState<BudgetData>(null);
  const [compromisos, setCompromisos] = useState(['', '', '']);
  const [notifDay, setNotifDay] = useState('');
  const [notifHour, setNotifHour] = useState('');
  const [badgeUnlocked, setBadgeUnlocked] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await lessonDataRepository.load<BudgetData>('presupuesto', 'l12_budget');
      setBudgetData(data);
    };
    void load();
  }, []);

  const compromisosFull = compromisos.every((c) => c.trim().length >= 5);
  const presupuestoConfirmado = !!budgetData?.totalIngresos;
  const canComplete = compromisosFull && presupuestoConfirmado;

  const updateCompromiso = (i: number, val: string) => {
    setCompromisos((prev) => prev.map((c, idx) => (idx === i ? val : c)));
  };

  const handleUnlock = async () => {
    await lessonDataRepository.save('presupuesto', 'l15_compromisos', {
      compromisos,
      notifDay,
      notifHour,
      unlockedAt: new Date().toISOString(),
    });
    setBadgeUnlocked(true);
    setStep(5);
  };

  const progressValue = step === 0 ? 0 : step === 1 ? 15 : step === 2 ? 40 : step === 3 ? 65 : step === 4 ? 85 : 100;

  return (
    <LessonShell
      id="L15"
      title="Reto final: Tu presupuesto de este mes, en serio"
      completion={{ ready: canComplete }}
    >
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full bg-[var(--color-brand-warning)] transition-all" style={{ width: `${progressValue}%` }} />
        </div>

        {step === 0 && (
          <div className="space-y-3">
            <FECard variant="flat" className="bg-[var(--color-brand-warning)]/10 border-2 border-[var(--color-brand-warning)] text-center py-6">
              <p className="text-4xl">🎉</p>
              <p className="font-bold text-base mt-2">¡El reto final!</p>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                Todo lo que aprendiste en este módulo culmina aquí.
              </p>
            </FECard>
            <FinniMessage
              variant="coach"
              title="No es un ejercicio"
              message="Es tu presupuesto real de este mes. Al completar el reto, desbloqueas el badge 'Presupuesto Pro 💰' y accedes al Módulo 2: Ahorro."
            />
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="font-bold mb-2">El reto tiene 3 partes:</p>
              {[
                'Parte 1: Confirma tu presupuesto de L12',
                'Parte 2: Establece 3 compromisos concretos',
                'Parte 3: Activa notificaciones de seguimiento',
              ].map((p) => (
                <p key={p} className="text-sm py-1">✓ {p}</p>
              ))}
            </FECard>
            <button
              className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm"
              onClick={() => setStep(1)}
            >
              ¡Empezar el reto! →
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <p className="font-bold text-base">Parte 1: Tu presupuesto del mes</p>
            {presupuestoConfirmado ? (
              <div className="space-y-2">
                <FECard variant="flat" className="bg-[var(--color-brand-success)]/10 border-2 border-[var(--color-brand-success)]">
                  <p className="font-bold mb-2">
                    ✅ Presupuesto confirmado desde Lección 12
                  </p>
                  <div className="space-y-1">
                    <p className="text-sm">Ingresos: <b>${(budgetData?.totalIngresos ?? 0).toLocaleString()}</b></p>
                    <p className="text-sm">Gastos: <b>${(budgetData?.totalGastos ?? 0).toLocaleString()}</b></p>
                    <p className="text-sm">
                      Balance: <b style={{ color: (budgetData?.balance ?? 0) >= 0 ? 'green' : 'red' }}>
                        {(budgetData?.balance ?? 0) >= 0 ? '+' : ''}${(budgetData?.balance ?? 0).toLocaleString()}
                      </b>
                    </p>
                  </div>
                </FECard>
                <FinniMessage
                  variant="coach"
                  title="Validación"
                  message="Tu presupuesto tiene datos reales. ¡Pasemos a los compromisos!"
                />
                <button
                  className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm"
                  onClick={() => setStep(2)}
                >
                  Parte 2: Compromisos →
                </button>
              </div>
            ) : (
              <FinniMessage
                variant="coach"
                title="Necesitas completar L12 primero"
                message="Ve a la Lección 12 y construye tu presupuesto real. Luego regresa aquí para el reto final."
              />
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <p className="font-bold text-base">Parte 2: Tus 3 compromisos</p>
            <FinniMessage
              variant="coach"
              title="Sé específico"
              message="Un compromiso vago ('gastaré menos') no funciona. Uno específico ('no gastaré más de $X en cafetería esta semana') sí."
            />
            <FECard variant="flat" className="border border-[var(--color-brand-info)] bg-[var(--color-brand-info)]/10">
              <p className="text-xs font-bold">Ejemplos de Finni:</p>
              <p className="text-xs block">• "Esta semana no gastaré más de $X en cafetería"</p>
              <p className="text-xs block">• "Registraré todos mis gastos cada noche antes de dormir"</p>
              <p className="text-xs block">• "Destinaré $X a mi meta de ahorro el día que llegue mi mesada"</p>
            </FECard>
            <div className="space-y-2">
              {compromisos.map((c, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <label className="text-xs text-[var(--color-text-secondary)]">Compromiso #{i + 1}</label>
                  <textarea
                    value={c}
                    onChange={(e) => updateCompromiso(i, e.target.value)}
                    placeholder={`Mi compromiso #${i + 1}...`}
                    rows={2}
                    className="w-full rounded-xl border border-[var(--color-neutral-200)] p-3 text-sm resize-none"
                  />
                </div>
              ))}
            </div>
            {compromisosFull && (
              <button
                className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm"
                onClick={() => setStep(3)}
              >
                Parte 3: Notificaciones →
              </button>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <p className="font-bold text-base">Parte 3: Recordatorio semanal</p>
            <FinniMessage
              variant="coach"
              title="El seguimiento es clave"
              message="Un presupuesto sin revisión semanal es como un GPS que nunca recalcula. ¿Cuándo quieres que Finni te recuerde revisar?"
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[var(--color-text-secondary)]">Día de la semana</label>
              <select
                value={notifDay}
                onChange={(e) => setNotifDay(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              >
                <option value="">Seleccionar...</option>
                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[var(--color-text-secondary)]">Hora</label>
              <select
                value={notifHour}
                onChange={(e) => setNotifHour(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              >
                <option value="">Seleccionar...</option>
                {['8:00 AM', '10:00 AM', '12:00 PM', '6:00 PM', '8:00 PM', '10:00 PM'].map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
            {notifDay && notifHour && (
              <FECard variant="flat" className="bg-[var(--color-brand-info)]/10 border border-[var(--color-brand-info)]">
                <p className="text-sm">
                  📲 Recordatorio: cada <b>{notifDay}</b> a las <b>{notifHour}</b> — "¿Cómo vas con tu presupuesto esta semana?"
                </p>
              </FECard>
            )}
            <button
              className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm"
              onClick={() => setStep(4)}
            >
              ¡Listo! Desbloquear badge →
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <p className="font-bold text-base">Resumen del reto</p>
            <FECard variant="flat" className="border border-[var(--color-brand-success)] bg-[var(--color-brand-success)]/10">
              <p className="font-bold text-sm mb-2">✅ Partes completadas:</p>
              <p className="text-sm">1. Presupuesto real confirmado</p>
              <p className="text-sm">2. 3 compromisos específicos establecidos</p>
              <p className="text-sm">3. Recordatorio semanal configurado{notifDay ? `: ${notifDay} ${notifHour}` : ''}</p>
            </FECard>
            <FinniMessage
              variant="coach"
              title="¿Todo listo?"
              message="Al confirmar, tu badge 'Presupuesto Pro 💰' se desbloqueará y podrás acceder al Módulo 2: Ahorro."
            />
            <button
              className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => void handleUnlock()}
              disabled={!canComplete}
            >
              🏆 ¡Desbloquear Presupuesto Pro!
            </button>
          </div>
        )}

        {step === 5 && badgeUnlocked && (
          <div className="space-y-3">
            <FECard variant="flat" className="text-center py-8 bg-[var(--color-brand-warning)]/10 border-[3px] border-[var(--color-brand-warning)]">
              <Trophy className="mx-auto text-[var(--color-brand-warning)]" size={72} />
              <p className="text-2xl font-bold mt-2">Presupuesto Pro 💰</p>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                Badge desbloqueado · Módulo 1 completado
              </p>
            </FECard>
            <FinniMessage
              variant="success"
              title="¡Lo lograste!"
              message="Ahora eres alguien que tiene un presupuesto. Eso ya te pone adelante de la mayoría."
            />
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="font-bold mb-3">Lo que aprendiste en Módulo 1:</p>
              <div className="space-y-2">
                {CONCEPTOS_CLAVE.map((c) => (
                  <div key={c.titulo} className="flex items-start gap-3">
                    <p className="text-sm">{c.emoji}</p>
                    <div>
                      <p className="font-bold text-sm">{c.titulo}</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">{c.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FECard>
            <a
              href="/app/ahorro"
              className="block w-full min-h-11 bg-[var(--color-brand-success)] text-white rounded-xl font-semibold text-sm text-center leading-11"
            >
              🌱 Comenzar Módulo 2: Ahorro
            </a>
          </div>
        )}
      </div>
    </LessonShell>
  );
}
