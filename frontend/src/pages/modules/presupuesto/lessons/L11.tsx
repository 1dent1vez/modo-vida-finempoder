import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { BarChart3, Circle, GraduationCap, Landmark, Link } from 'lucide-react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import { useLessonResume } from '../../../../features/lessons/hooks/useLessonResume';
import { LessonResumeBanner } from '../../../../features/lessons/components/LessonResumeBanner';

const HERRAMIENTAS = [
  {
    id: 'condusef',
    nombre: 'App Presupuesto Familiar CONDUSEF',
    icon: Landmark,
    tipo: 'Oficial',
    descripcion: 'Oficial del gobierno, gratuita, sin publicidad, sin datos bancarios.',
    pros: ['Gratuita', 'Sin publicidad', 'Oficial y confiable'],
  },
  {
    id: 'fintonic',
    nombre: 'Fintonic',
    icon: Link,
    tipo: 'Sincronización bancaria',
    descripcion: 'Se conecta a tu cuenta bancaria y categoriza automáticamente tus gastos.',
    pros: ['Automático', 'Análisis avanzado', 'Alertas de gastos'],
  },
  {
    id: 'sheets',
    nombre: 'Google Sheets con plantilla',
    icon: BarChart3,
    tipo: 'Flexible',
    descripcion: 'Flexible, sin datos personales en una app, personalizable al 100%.',
    pros: ['Total control', 'Sin app', 'Personalizable'],
  },
  {
    id: 'finempoder',
    nombre: 'FinEmpoder (esta PWA)',
    icon: GraduationCap,
    tipo: 'Integrada',
    descripcion: 'Integra tu aprendizaje con tu registro real. Disponible offline.',
    pros: ['Integra aprendizaje', 'Offline', 'Gamificada'],
  },
];

const PASOS_TUTORIAL = [
  { id: 'herramientas', desc: 'Elige al menos una herramienta para registrar tus gastos', finni: '¡Bien! Con esa herramienta tendrás tu registro a la mano.' },
  { id: 'metodo', desc: 'Elige tu método: ¿qué app usarás primero?', finni: 'Perfecto. Ese será tu punto de partida para registrar.' },
  { id: 'senal', desc: 'Define tu señal de registro diario', finni: '¡Listo! Tu señal queda guardada.' },
];

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const HORAS = ['8:00 AM', '10:00 AM', '12:00 PM', '6:00 PM', '8:00 PM', '10:00 PM'];

type Opciones = {
  herramientas: string[];
  metodo: string;
  senal: { dia: string; hora: string } | null;
};

const OPCIONES_VACIAS: Opciones = { herramientas: [], metodo: '', senal: null };

export default function L11() {
  const [step, setStep] = useState(0);

  const resume = useLessonResume('presupuesto', 'L11');
  const [resumeHandled, setResumeHandled] = useState(false);

  useEffect(() => {
    if (step > 0) resume.save({ step });
  }, [step, resume]);
  const [opciones, setOpciones] = useState<Opciones>(OPCIONES_VACIAS);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await lessonDataRepository.load<Opciones & { updatedAt?: string }>('presupuesto', 'l11_opciones');
      if (data) {
        setOpciones({
          herramientas: Array.isArray(data.herramientas) ? data.herramientas : [],
          metodo: typeof data.metodo === 'string' ? data.metodo : '',
          senal: data.senal?.dia && data.senal?.hora ? data.senal : null,
        });
        const done = new Set<string>();
        if (Array.isArray(data.herramientas) && data.herramientas.length > 0) done.add('herramientas');
        if (typeof data.metodo === 'string' && data.metodo.trim().length > 0) done.add('metodo');
        if (data.senal?.dia && data.senal?.hora) done.add('senal');
        setCompletedSteps(done);
      }
      setLoaded(true);
    };
    void load();
  }, []);

  const allTutorialDone = PASOS_TUTORIAL.every((p) => completedSteps.has(p.id));

  const toggleHerramienta = (id: string) => {
    setOpciones((prev) => ({
      ...prev,
      herramientas: prev.herramientas.includes(id)
        ? prev.herramientas.filter((h) => h !== id)
        : [...prev.herramientas, id],
    }));
  };

  const validaPaso = (id: string): boolean => {
    if (id === 'herramientas') return opciones.herramientas.length >= 1;
    if (id === 'metodo') return opciones.metodo.trim().length > 0;
    if (id === 'senal') return !!opciones.senal?.dia && !!opciones.senal?.hora;
    return false;
  };

  const avanzarPaso = async () => {
    const paso = PASOS_TUTORIAL[tutorialStep];
    if (!paso || !validaPaso(paso.id)) return;
    setSaving(true);
    setSaveError('');
    try {
      await lessonDataRepository.save('presupuesto', 'l11_opciones', {
        ...opciones,
        metodo: opciones.metodo.trim(),
        updatedAt: new Date().toISOString(),
      });
      const next = new Set(completedSteps);
      next.add(paso.id);
      setCompletedSteps(next);
      if (tutorialStep < PASOS_TUTORIAL.length - 1) {
        setTutorialStep((i) => i + 1);
      } else {
        setStep(2);
      }
    } catch {
      setSaveError('No pudimos guardar tus opciones. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const progressValue = step === 0 ? 0 : step === 1 ? 55 : 100;

  if (!loaded) {
    return (
      <LessonShell id="L11" title="Tu presupuesto en la palma de la mano" completion={{ ready: false }}>
        <p className="text-sm text-[var(--color-text-secondary)]">Cargando tus opciones...</p>
      </LessonShell>
    );
  }

  return (
    <LessonShell
      id="L11"
      title="Tu presupuesto en la palma de la mano"
      completion={{ ready: allTutorialDone }}
    >
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
              Comenzar tutorial →
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <p className="font-bold">
              Tutorial: tu registro en 3 pasos
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Completa los 3 pasos para desbloquear la lección.
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
                        {done ? <CheckCircle className="h-4 w-4 text-[var(--color-brand-success)]" aria-hidden="true" /> : isCurrent ? <Circle className="h-4 w-4 text-[var(--color-brand-warning)]" aria-hidden="true" /> : `${i + 1}.`}
                      </p>
                      <p className={cn('text-sm', isCurrent ? 'font-bold' : '')}>
                        {p.desc}
                      </p>
                    </div>
                    {isCurrent && (
                      <div className="space-y-3 mt-3">
                        {p.id === 'herramientas' && (
                          <>
                            <p className="text-xs text-[var(--color-text-secondary)]">
                              Toca al menos una herramienta:
                            </p>
                            <div className="space-y-2">
                              {HERRAMIENTAS.map((h) => (
                                <FECard
                                  key={h.id}
                                  variant="flat"
                                  className={cn(
                                    'border-2 cursor-pointer transition-all',
                                    opciones.herramientas.includes(h.id)
                                      ? 'border-[var(--color-brand-warning)] bg-[var(--color-brand-warning)]/10'
                                      : 'border-[var(--color-neutral-200)]'
                                  )}
                                  onClick={() => toggleHerramienta(h.id)}
                                  role="button"
                                  tabIndex={0}
                                >
                                  <div className="flex items-start gap-3">
                                    <h.icon className="h-9 w-9 mx-auto text-[var(--color-brand-primary)]" aria-hidden="true" />
                                    <div className="flex-1">
                                      <div className="flex justify-between items-center">
                                        <p className="font-bold">{h.nombre}</p>
                                        {opciones.herramientas.includes(h.id) && <CheckCircle className="text-[var(--color-brand-warning)]" size={18} />}
                                      </div>
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-[var(--color-neutral-200)] font-semibold mt-1 mb-1">
                                        {h.tipo}
                                      </span>
                                      <p className="text-sm text-[var(--color-text-secondary)]">{h.descripcion}</p>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {h.pros.map((pro) => (
                                          <span key={pro} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-[var(--color-neutral-200)] font-semibold">
                                            {pro}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </FECard>
                              ))}
                            </div>
                          </>
                        )}
                        {p.id === 'metodo' && (
                          <div className="flex flex-col gap-1">
                            <label htmlFor="l11-metodo" className="text-xs text-[var(--color-text-secondary)]">
                              ¿Qué app usarás primero?
                            </label>
                            <input
                              id="l11-metodo"
                              value={opciones.metodo}
                              maxLength={80}
                              onChange={(e) => setOpciones((prev) => ({ ...prev, metodo: e.target.value }))}
                              placeholder="Ej: Google Sheets"
                              className="w-full rounded-xl border border-[var(--color-neutral-200)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-warning)]"
                            />
                          </div>
                        )}
                        {p.id === 'senal' && (
                          <>
                            <FinniMessage
                              variant="coach"
                              title="Tu señal, no un aviso nuestro"
                              message="Elige cuándo registrarás tus gastos. Es tu señal, no la nuestra: si quieres que te avise, pon una alarma en tu teléfono. FinEmpoder no envía notificaciones todavía."
                            />
                            <div className="flex flex-col gap-1">
                              <label htmlFor="l11-senal-dia" className="text-xs text-[var(--color-text-secondary)]">Día de la semana</label>
                              <select
                                id="l11-senal-dia"
                                value={opciones.senal?.dia ?? ''}
                                onChange={(e) => setOpciones((prev) => ({ ...prev, senal: { dia: e.target.value, hora: prev.senal?.hora ?? '' } }))}
                                className="w-full rounded-xl border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
                              >
                                <option value="">Seleccionar...</option>
                                {DIAS_SEMANA.map((d) => (
                                  <option key={d} value={d}>{d}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex flex-col gap-1">
                              <label htmlFor="l11-senal-hora" className="text-xs text-[var(--color-text-secondary)]">Hora</label>
                              <select
                                id="l11-senal-hora"
                                value={opciones.senal?.hora ?? ''}
                                onChange={(e) => setOpciones((prev) => ({ ...prev, senal: { dia: prev.senal?.dia ?? '', hora: e.target.value } }))}
                                className="w-full rounded-xl border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
                              >
                                <option value="">Seleccionar...</option>
                                {HORAS.map((h) => (
                                  <option key={h} value={h}>{h}</option>
                                ))}
                              </select>
                            </div>
                          </>
                        )}
                        <FECard variant="flat" className="bg-[var(--color-brand-info)]/10">
                          <p className="text-xs">
                            Finni: "{p.finni}"
                          </p>
                        </FECard>
                        {saveError && (
                          <FinniMessage
                            variant="error"
                            title="No pudimos guardar"
                            message={saveError}
                          />
                        )}
                        <button
                          className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => void avanzarPaso()}
                          disabled={saving || !validaPaso(p.id)}
                        >
                          {i === PASOS_TUTORIAL.length - 1 ? 'Terminar tutorial →' : 'Siguiente →'}
                        </button>
                      </div>
                    )}
                  </FECard>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <FinniMessage
              variant="success"
              title="¡3/3 pasos completados!"
              message="Ya elegiste tus herramientas, tu método y tu señal de registro. El hábito empieza con tu primer registro real."
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
