import { useState, useEffect } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

type MetaData = { nombre?: string; monto?: number; aportacionMensual?: number } | null;
type PlanData = { totalPlanado?: number; horizon?: number } | null;
type RetoData = { totalAcumulado?: number; dayAmounts?: number[] } | null;
type IndicadorColor = 'success' | 'warning' | 'error';

type Indicador = {
  label: string;
  valor: string;
  color: IndicadorColor;
  comentario: string;
};

const COLOR_MAP: Record<IndicadorColor, { main: string; bg: string; dark: string }> = {
  success: { main: 'var(--color-brand-success)', bg: 'var(--color-brand-success-bg)', dark: '#059669' },
  warning: { main: 'var(--color-brand-warning)', bg: 'var(--color-brand-warning-bg)', dark: '#B45309' },
  error:   { main: 'var(--color-brand-error)',   bg: 'var(--color-brand-error-bg)',   dark: '#DC2626' },
};

function buildIndicadores(meta: MetaData, plan: PlanData, reto: RetoData): Indicador[] {
  const montoMeta = meta?.monto ?? 0;
  const totalAcumulado = reto?.totalAcumulado ?? 0;
  const totalPlanado = plan?.totalPlanado ?? 0;
  const pct = montoMeta > 0 ? Math.min(100, (totalAcumulado / montoMeta) * 100) : 0;

  const dayAmounts = reto?.dayAmounts ?? [];
  const consistencia: IndicadorColor = dayAmounts.length >= 3 ? 'success' : dayAmounts.length >= 1 ? 'warning' : 'error';
  const progreso: IndicadorColor = pct >= 50 ? 'success' : pct >= 20 ? 'warning' : 'error';
  const promedio = dayAmounts.length > 0 ? totalAcumulado / dayAmounts.length : 0;
  const promedioColor: IndicadorColor = promedio >= (meta?.aportacionMensual ?? 0) * 0.8 ? 'success' : promedio > 0 ? 'warning' : 'error';
  const tendenciaColor: IndicadorColor = totalAcumulado >= totalPlanado * 0.5 ? 'success' : totalAcumulado > 0 ? 'warning' : 'error';

  return [
    {
      label: 'Consistencia',
      valor: `${dayAmounts.length} dias registrados`,
      color: consistencia,
      comentario: consistencia === 'success' ? 'Completaste los 3 dias del micro-reto. Excelente consistencia.' : consistencia === 'warning' ? 'Has empezado. Sigue registrando para consolidar el habito.' : 'Aun no has registrado ahorro. ¿Que necesita cambiar para que funcione?',
    },
    {
      label: 'Progreso hacia la meta',
      valor: `${pct.toFixed(0)}% de "${meta?.nombre ?? 'tu meta'}"`,
      color: progreso,
      comentario: progreso === 'success' ? '¡Vas en tiempo! Un ajuste pequeño y lo logras.' : progreso === 'warning' ? 'Has avanzado. Con constancia llegas.' : 'Aun no has acumulado ahorro hacia la meta. Cada peso cuenta.',
    },
    {
      label: 'Monto promedio',
      valor: promedio > 0 ? `$${promedio.toFixed(0)}/dia` : 'Sin datos',
      color: promedioColor,
      comentario: promedioColor === 'success' ? 'Tu promedio esta cerca o supera lo planeado. ¡Sigue asi!' : promedioColor === 'warning' ? 'Tu promedio es menor al planeado pero ya hay avance.' : 'Comienza a registrar ahorros diarios para ver tu promedio.',
    },
    {
      label: 'Tendencia',
      valor: tendenciaColor === 'success' ? 'Al alza' : tendenciaColor === 'warning' ? 'Estable' : 'Sin registro',
      color: tendenciaColor,
      comentario: tendenciaColor === 'success' ? 'Tu ritmo de ahorro se mantiene o mejora. Excelente.' : tendenciaColor === 'warning' ? 'Hay avance pero puedes acelerar el ritmo.' : 'Empieza el reto de 3 dias para ver tu tendencia.',
    },
  ];
}

export default function L13() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [allViewed, setAllViewed] = useState(false);
  const [dificultad, setDificultad] = useState('');
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    const load = async () => {
      const meta = await lessonDataRepository.load<MetaData>('ahorro', 'l5_meta');
      const plan = await lessonDataRepository.load<PlanData>('ahorro', 'l6_plan');
      const reto = await lessonDataRepository.load<RetoData>('ahorro', 'l11_reto');
      setIndicadores(buildIndicadores(meta, plan, reto));
      setLoading(false);
    };
    void load();
  }, []);

  const toggleExpanded = (i: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      if (next.size >= 4) setAllViewed(true);
      return next;
    });
  };

  const handleSave = async () => {
    await lessonDataRepository.save('ahorro', 'l13_dificultad', {
      dificultad,
      savedAt: new Date().toISOString(),
    });
    setAnswered(true);
    setStep(2);
  };

  const progress = step === 0 ? 0 : step === 1 ? 50 : 100;

  if (loading) {
    return (
      <LessonShell id="L13" title="Finni dice: como vas con tu ahorro" completion={{ ready: false }}>
        <p className="text-sm text-[var(--color-text-secondary)]">Cargando tu progreso...</p>
      </LessonShell>
    );
  }

  return (
    <LessonShell id="L13" title="Finni dice: como vas con tu ahorro" completion={{ ready: allViewed && answered }}>
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: 'var(--color-brand-success)' }} />
        </div>

        {/* Pantalla 0 — Dashboard de progreso */}
        {step === 0 && (
          <div className="space-y-6">
            <FinniMessage variant="coach" title="Revision de habito" message="Es momento de ver como vas con tu habito de ahorro. No para juzgar, sino para ayudarte a llegar a tu meta." />
            <p className="text-base font-bold">4 indicadores — toca cada uno para ver el analisis:</p>
            <div className="space-y-4">
              {indicadores.map((ind, i) => {
                const c = COLOR_MAP[ind.color];
                return (
                  <FECard
                    key={i}
                    variant="flat"
                    className="border-2 cursor-pointer"
                    style={{
                      borderColor: c.main,
                      backgroundColor: expanded.has(i) ? c.bg : 'white',
                    }}
                    onClick={() => toggleExpanded(i)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-bold">{ind.label}</p>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: c.main }}>{ind.valor}</span>
                        <span className="text-xs">{expanded.has(i) ? '▲' : '▼'}</span>
                      </div>
                    </div>
                    {expanded.has(i) && (
                      <p className="text-sm mt-2 italic" style={{ color: c.dark }}>{ind.comentario}</p>
                    )}
                  </FECard>
                );
              })}
            </div>
            {(allViewed || expanded.size >= 4) && (
              <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: 'var(--color-brand-success)' }} onClick={() => setStep(1)}>
                Responder la pregunta de Finni →
              </button>
            )}
          </div>
        )}

        {/* Pantalla 1 — Pregunta abierta */}
        {step === 1 && (
          <div className="space-y-6">
            <FinniMessage variant="coach" title="Una pregunta honesta" message="¿Hay algo que te este dificultando ahorrar esta semana? No te preguntes por que fallaste — preguntate que necesita cambiar para que funcione." />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-[var(--color-text-primary)]">Tu respuesta (privada, solo para ti)</label>
              <textarea
                value={dificultad}
                onChange={(e) => setDificultad(e.target.value)}
                rows={4}
                placeholder="Puede ser un gasto inesperado, un cambio de rutina, o simplemente que olvidaste..."
                className="w-full border border-[var(--color-neutral-200)] rounded-xl px-4 py-2.5 text-sm resize-none"
              />
            </div>
            <button
              className="w-full min-h-11 text-white rounded-xl font-semibold text-sm disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-brand-success)' }}
              onClick={() => void handleSave()}
              disabled={dificultad.trim().length < 3}
            >
              Guardar y cerrar la revision →
            </button>
          </div>
        )}

        {/* Pantalla 2 — Cierre */}
        {step === 2 && answered && (
          <div className="space-y-6">
            <FinniMessage variant="success" title="Revision completada" message="Conoces donde estas. Eso ya es un paso enorme. El siguiente paso es hacer un ajuste, por pequeño que sea." />
            <FECard variant="flat" className="border" style={{ borderColor: 'var(--color-brand-success)', backgroundColor: 'var(--color-brand-success-bg)' }}>
              <p className="text-sm font-bold mb-2">Estado general:</p>
              <div className="space-y-2">
                {indicadores.map((ind, i) => {
                  const c = COLOR_MAP[ind.color];
                  return (
                    <div key={i} className="flex gap-2 items-center">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: c.main }}>{ind.label}</span>
                    </div>
                  );
                })}
              </div>
            </FECard>
          </div>
        )}
      </div>
    </LessonShell>
  );
}
