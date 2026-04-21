import { useState, useEffect } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

const successColor = 'var(--color-brand-success)';
const successBg    = 'var(--color-brand-success-bg)';

type MetaData = { nombre?: string; monto?: number; aportacionMensual?: number } | null;
type PlanData = { totalPlanado?: number; horizon?: number } | null;
type RetoData = { totalAcumulado?: number; dayAmounts?: number[] } | null;

const CONCEPTOS_CLAVE = [
  { emoji: '🔄', titulo: 'Ahorro primero',    desc: 'Apartar antes de gastar es el habito mas poderoso.' },
  { emoji: '🏦', titulo: 'Ahorro formal',     desc: 'Proteccion IPAB + rendimientos + historial financiero.' },
  { emoji: '🎯', titulo: 'Meta con nombre',   desc: 'El ahorro sin proposito no dura.' },
  { emoji: '📅', titulo: 'Plan semanal',      desc: 'La constancia supera la cantidad.' },
  { emoji: '💹', titulo: 'Interes compuesto', desc: 'El tiempo es tu mejor aliado para crecer.' },
  { emoji: '🛡️', titulo: 'Fondo de emergencias', desc: 'Tu red de seguridad antes de invertir.' },
];

export default function L15() {
  const [step, setStep] = useState(0);
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
      <LessonShell id="L15" title="Reto final: cierra tu modulo de ahorro" completion={{ ready: false }}>
        <p className="text-sm text-[var(--color-text-secondary)]">Cargando datos...</p>
      </LessonShell>
    );
  }

  return (
    <LessonShell id="L15" title="Reto final: cierra tu modulo de ahorro" completion={{ ready: canComplete }}>
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: successColor }} />
        </div>

        {/* Pantalla 0 — Apertura */}
        {step === 0 && (
          <div className="space-y-6">
            <FECard variant="flat" className="text-center py-6 border-2" style={{ backgroundColor: successBg, borderColor: successColor }}>
              <p className="text-4xl">🌱</p>
              <p className="text-xl font-bold mt-2">¡El reto final!</p>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">Modulo 2 · Ahorro</p>
            </FECard>
            <FinniMessage variant="coach" title="Hoy no solo cierras el modulo" message="Demuestras que el habito de ahorro ya es parte de ti." />
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="text-sm font-bold mb-2">En este modulo:</p>
              {[
                '✅ Definiste tu meta de ahorro con proposito y plazo',
                '✅ Construiste tu plan semana a semana',
                '✅ Conociste las herramientas del ahorro formal en Mexico',
                '✅ Completaste el micro-reto de 3 dias',
                '✅ Aprendiste sobre interes compuesto, IPAB y seguros',
                '✅ Registraste tu ahorro de forma constante',
              ].map((item) => <p key={item} className="text-sm py-0.5">{item}</p>)}
            </FECard>
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="text-sm font-bold mb-1">El reto tiene 3 partes:</p>
              <p className="text-sm">Parte 1: Confirma tu monto total ahorrado</p>
              <p className="text-sm">Parte 2: Autoevaluacion honesta (3 preguntas)</p>
              <p className="text-sm">Parte 3: Define tu proxima meta + acceso a Modulo 3</p>
            </FECard>
            <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => setStep(1)}>
              ¡Empezar el reto final! →
            </button>
          </div>
        )}

        {/* Pantalla 1 — Parte 1: Monto total */}
        {step === 1 && (
          <div className="space-y-6">
            <p className="text-xl font-bold">Parte 1: Tu ahorro del modulo</p>
            {totalAcumulado > 0 && (
              <FECard variant="flat" className="border" style={{ backgroundColor: successBg, borderColor: successColor }}>
                <p className="text-sm font-bold">✅ Datos del micro-reto precargados: ${totalAcumulado.toLocaleString()}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">Puedes ajustar si ahorraste mas por otros medios</p>
              </FECard>
            )}
            <input
              type="number"
              min={0}
              placeholder="Monto total ahorrado durante el modulo ($)"
              value={montoTotal}
              onChange={(e) => setMontoTotal(e.target.value)}
              className="w-full border border-[var(--color-neutral-200)] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-success)]"
            />
            <p className="text-xs text-[var(--color-text-secondary)] -mt-4">Cualquier monto es valido. Lo importante es el habito.</p>
            {metaData?.nombre && (
              <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
                <p className="text-xs">Tu meta: "{metaData.nombre}" — ${metaData.monto?.toLocaleString()}</p>
                {metaData.monto && montoNum > 0 && (
                  <p className="text-xs" style={{ color: '#059669' }}>Avance: {Math.min(100, (montoNum / metaData.monto) * 100).toFixed(0)}% de tu meta</p>
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

        {/* Pantalla 2 — Parte 2: Autoevaluacion */}
        {step === 2 && (
          <div className="space-y-6">
            <p className="text-xl font-bold">Parte 2: Autoevaluacion honesta</p>
            <FinniMessage variant="coach" title="No hay respuestas incorrectas" message="Esta autoevaluacion es solo para ti. La honestidad te ayuda a mejorar." />
            <div className="space-y-3">
              {[
                { label: '¿Cuantas semanas mantuviste el habito?', val: semanasHabito, set: setSemanasHabito, placeholder: 'Ej: 3 semanas, o "no lo segui formalmente"', multiline: false },
                { label: '¿Que te resulto mas dificil?', val: masDificil, set: setMasDificil, placeholder: 'Describe tu mayor reto...', multiline: true },
                { label: '¿Que cambiarias para el proximo mes?', val: cambiaria, set: setCambiaria, placeholder: 'Un ajuste concreto...', multiline: true },
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
                Parte 3: Proxima meta →
              </button>
            )}
          </div>
        )}

        {/* Pantalla 3 — Parte 3: Proxima meta + M3 */}
        {step === 3 && (
          <div className="space-y-6">
            <p className="text-xl font-bold">Parte 3: Tu proxima meta</p>
            <FinniMessage variant="coach" title="El Modulo 3 te espera" message="¿Podrias invertir parte de ese ahorro? En el Modulo 3 de Inversion te mostraremos como hacer crecer lo que ahorras." />
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
              <p className="text-sm font-bold mb-2">✅ Partes completadas:</p>
              <p className="text-sm">1. Monto total confirmado: ${montoNum.toLocaleString()}</p>
              <p className="text-sm">2. Autoevaluacion completada ({semanasHabito})</p>
              <p className="text-sm">3. Proxima meta definida{proximaMeta ? `: "${proximaMeta}"` : ''}</p>
            </FECard>
            {totalPlanado > 0 && (
              <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
                <div className="flex justify-between">
                  <span className="text-xs">Planeado:</span>
                  <span className="text-xs">${totalPlanado.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs">Real:</span>
                  <span className="text-xs font-bold" style={{ color: montoNum >= totalPlanado * 0.5 ? '#059669' : '#D97706' }}>${montoNum.toLocaleString()}</span>
                </div>
              </FECard>
            )}
            <button
              className="w-full min-h-11 text-white rounded-xl font-semibold text-sm disabled:opacity-50"
              style={{ backgroundColor: successColor }}
              onClick={() => void handleUnlock()}
              disabled={!canComplete}
            >
              🌱 ¡Desbloquear Ahorrador Constante!
            </button>
          </div>
        )}

        {/* Pantalla 5 — Badge desbloqueado */}
        {step === 5 && badgeUnlocked && (
          <div className="space-y-6">
            <FECard variant="flat" className="text-center py-8 border-[3px]" style={{ backgroundColor: successBg, borderColor: successColor }}>
              <p className="text-6xl mb-2">🏆</p>
              <p className="text-2xl font-bold mt-1">Ahorrador Constante 🌱</p>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">Badge desbloqueado · Modulo 2 completado</p>
            </FECard>
            <FinniMessage variant="success" title="¡Lo lograste!" message="Ahora tienes un habito que muchos adultos nunca desarrollan. Eso vale mas que cualquier cantidad que hayas ahorrado." />
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="font-bold mb-3">Lo que aprendiste en Modulo 2:</p>
              <div className="space-y-2">
                {CONCEPTOS_CLAVE.map((c) => (
                  <div key={c.titulo} className="flex gap-3 items-start">
                    <span className="text-base">{c.emoji}</span>
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
              📈 Comenzar Modulo 3: Inversion
            </a>
          </div>
        )}
      </div>
    </LessonShell>
  );
}
