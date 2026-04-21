import { cn } from '@/lib/utils';
import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';

const HERRAMIENTAS = [
  {
    id: 'condusef',
    nombre: 'App Presupuesto Familiar CONDUSEF',
    emoji: '🏛️',
    tipo: 'Oficial',
    descripcion: 'Oficial del gobierno, gratuita, sin publicidad, sin datos bancarios.',
    pros: ['Gratuita', 'Sin publicidad', 'Oficial y confiable'],
  },
  {
    id: 'fintonic',
    nombre: 'Fintonic',
    emoji: '🔗',
    tipo: 'Sincronización bancaria',
    descripcion: 'Se conecta a tu cuenta bancaria y categoriza automáticamente tus gastos.',
    pros: ['Automático', 'Análisis avanzado', 'Alertas de gastos'],
  },
  {
    id: 'sheets',
    nombre: 'Google Sheets con plantilla',
    emoji: '📊',
    tipo: 'Flexible',
    descripcion: 'Flexible, sin datos personales en una app, personalizable al 100%.',
    pros: ['Total control', 'Sin app', 'Personalizable'],
  },
  {
    id: 'finempoder',
    nombre: 'FinEmpoder (esta PWA)',
    emoji: '🎓',
    tipo: 'Integrada',
    descripcion: 'Integra tu aprendizaje con tu registro real. Disponible offline.',
    pros: ['Integra aprendizaje', 'Offline', 'Gamificada'],
  },
];

const PASOS_TUTORIAL = [
  { id: 'ingreso', desc: 'Agregar un ingreso real al registro', finni: '¡Bien! Tu primer ingreso está registrado.' },
  { id: 'gasto', desc: 'Registrar un gasto de hoy', finni: 'Perfecto. Un gasto en el registro.' },
  { id: 'categoria', desc: 'Categorizarlo correctamente (ej: Alimentación)', finni: '¡Bien categorizado!' },
  { id: 'balance', desc: 'Ver el balance actual de tu cuenta', finni: 'Ves el resumen de entradas y salidas.' },
  { id: 'recordatorio', desc: 'Activar un recordatorio de registro', finni: '¡Listo! El recordatorio está activo.' },
];

export default function L11() {
  const [step, setStep] = useState(0);
  const [favoritas, setFavoritas] = useState<Set<string>>(new Set());
  const [tutorialStep, setTutorialStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const allTutorialDone = PASOS_TUTORIAL.every((p) => completedSteps.has(p.id));

  const toggleFavorita = (id: string) => {
    setFavoritas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const completarPaso = () => {
    const paso = PASOS_TUTORIAL[tutorialStep];
    if (!paso) return;
    setCompletedSteps((prev) => new Set([...prev, paso.id]));
    if (tutorialStep < PASOS_TUTORIAL.length - 1) {
      setTutorialStep((i) => i + 1);
    } else {
      setStep(3);
    }
  };

  const progressValue = step === 0 ? 0 : step === 1 ? 25 : step === 2 ? 55 : 100;

  return (
    <LessonShell
      id="L11"
      title="Tu presupuesto en la palma de la mano"
      completion={{ ready: allTutorialDone }}
    >
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full bg-[var(--color-brand-warning)] transition-all" style={{ width: `${progressValue}%` }} />
        </div>

        {step === 0 && (
          <div className="space-y-3">
            <FinniMessage
              variant="coach"
              title="Tu smartphone, tu mejor aliado"
              message="Registrar gastos en papel está bien. Pero si tienes un smartphone, puedes hacer algo más poderoso: que tu dinero se registre y analice casi solo."
            />
            <button
              className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm"
              onClick={() => setStep(1)}
            >
              Ver herramientas disponibles →
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <p className="font-bold">Opciones gratuitas en México:</p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Toca las que te llamen la atención para marcarlas como favoritas.
            </p>
            <div className="space-y-2">
              {HERRAMIENTAS.map((h) => (
                <FECard
                  key={h.id}
                  variant="flat"
                  className={cn(
                    'border-2 cursor-pointer transition-all',
                    favoritas.has(h.id)
                      ? 'border-[var(--color-brand-warning)] bg-[var(--color-brand-warning)]/10'
                      : 'border-[var(--color-neutral-200)]'
                  )}
                  onClick={() => toggleFavorita(h.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-start gap-3">
                    <p className="text-4xl">{h.emoji}</p>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="font-bold">{h.nombre}</p>
                        {favoritas.has(h.id) && <CheckCircle className="text-[var(--color-brand-warning)]" size={18} />}
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-[var(--color-neutral-200)] font-semibold mt-1 mb-1">
                        {h.tipo}
                      </span>
                      <p className="text-sm text-[var(--color-text-secondary)]">{h.descripcion}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {h.pros.map((p) => (
                          <span key={p} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-[var(--color-neutral-200)] font-semibold">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </FECard>
              ))}
            </div>
            <button
              className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm"
              onClick={() => setStep(2)}
            >
              Tutorial de FinEmpoder →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <p className="font-bold">
              Tutorial interactivo de FinEmpoder
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Completa las 5 acciones para desbloquear la lección.
            </p>
            <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2">
              <div className="h-2 rounded-full bg-[var(--color-brand-warning)] transition-all" style={{ width: `${(completedSteps.size / PASOS_TUTORIAL.length) * 100}%` }} />
            </div>
            <div className="space-y-3">
              {PASOS_TUTORIAL.map((p, i) => {
                const done = completedSteps.has(p.id);
                const isCurrent = i === tutorialStep;
                return (
                  <FECard
                    key={p.id}
                    variant="flat"
                    className={cn(
                      'border-2 transition-colors',
                      done ? 'border-[var(--color-brand-success)] bg-[var(--color-brand-success)]/10'
                        : isCurrent ? 'border-[var(--color-brand-warning)] bg-[var(--color-brand-warning)]/10'
                        : 'border-[var(--color-neutral-200)] opacity-50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-bold min-w-6">
                        {done ? '✅' : isCurrent ? '👉' : `${i + 1}.`}
                      </p>
                      <p className={cn('text-sm', isCurrent ? 'font-bold' : '')}>
                        {p.desc}
                      </p>
                    </div>
                    {isCurrent && (
                      <div className="space-y-2 mt-3">
                        <FECard variant="flat" className="bg-[var(--color-brand-info)]/10">
                          <p className="text-xs">
                            💡 Finni: "{p.finni}"
                          </p>
                        </FECard>
                        <button
                          className="w-full min-h-9 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm"
                          onClick={completarPaso}
                        >
                          ✓ Marcar como hecho
                        </button>
                      </div>
                    )}
                  </FECard>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <FinniMessage
              variant="success"
              title="¡5/5 acciones completadas!"
              message="Ya tienes tus primeros registros reales en FinEmpoder. ¡Eso es un hábito que empieza hoy!"
            />
            <FECard variant="flat" className="border border-[var(--color-brand-warning)]">
              <p className="font-bold mb-2">Mini-reto:</p>
              <p className="text-sm">
                Registra <b>todos tus gastos de mañana</b> usando tu herramienta favorita.
                Vuelve a FinEmpoder al final del día y compara.
              </p>
            </FECard>
          </div>
        )}
      </div>
    </LessonShell>
  );
}
