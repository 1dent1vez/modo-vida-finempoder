import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

type BudgetData = {
  pctFijos?: number;
  pctVariables?: number;
  pctAhorro?: number;
  balance?: number;
  totalIngresos?: number;
} | null;

type SemaforoItem = {
  label: string;
  value: string;
  color: 'success' | 'warning' | 'error';
  consejo: string;
};

function calcSemaforo(data: BudgetData): SemaforoItem[] {
  if (!data) {
    return [
      { label: 'Gastos fijos', value: 'Sin datos', color: 'warning', consejo: 'Completa la lección 12 para obtener tu análisis.' },
      { label: 'Gastos variables', value: 'Sin datos', color: 'warning', consejo: 'Completa la lección 12 para obtener tu análisis.' },
      { label: 'Ahorro', value: 'Sin datos', color: 'warning', consejo: 'Completa la lección 12 para obtener tu análisis.' },
      { label: 'Entretenimiento', value: 'Sin datos', color: 'warning', consejo: 'Completa la lección 12 para obtener tu análisis.' },
      { label: 'Balance general', value: 'Sin datos', color: 'warning', consejo: 'Completa la lección 12 para obtener tu análisis.' },
    ];
  }

  const fijos = data.pctFijos ?? 0;
  const variables = data.pctVariables ?? 0;
  const ahorro = data.pctAhorro ?? 0;
  const balance = data.balance ?? 0;

  return [
    {
      label: 'Gastos fijos',
      value: `${fijos}% del ingreso`,
      color: fijos <= 50 ? 'success' : fijos <= 60 ? 'warning' : 'error',
      consejo:
        fijos <= 50
          ? '¡Excelente! Tus gastos fijos están dentro del 50% recomendado.'
          : fijos <= 60
          ? 'Tus gastos fijos son un poco altos. Considera renegociar algún servicio.'
          : 'Tus gastos fijos superan el 50%. Revisa si hay suscripciones o compromisos que puedas reducir.',
    },
    {
      label: 'Gastos variables',
      value: `${variables}% del ingreso`,
      color: variables <= 30 ? 'success' : variables <= 40 ? 'warning' : 'error',
      consejo:
        variables <= 30
          ? 'Bien controlado. Tus variables están dentro del 30% ideal.'
          : variables <= 40
          ? 'Un poco por encima del 30%. Identifica qué categoría puedes recortar.'
          : 'Tus gastos variables son altos. Revisa el ítem más grande y pregunta si es realmente necesario.',
    },
    {
      label: 'Ahorro',
      value: `${ahorro}% del ingreso`,
      color: ahorro >= 20 ? 'success' : ahorro >= 10 ? 'warning' : 'error',
      consejo:
        ahorro >= 20
          ? '¡Perfecto! Estás ahorrando el 20% o más. Así se construye patrimonio.'
          : ahorro >= 10
          ? 'Buen inicio. Intenta llegar al 20% aumentando poco a poco.'
          : ahorro > 0
          ? 'Cualquier ahorro cuenta. Sube gradualmente hasta llegar al 10% primero.'
          : 'No tienes ahorro contemplado. Aunque sea $100 al mes ya marca la diferencia.',
    },
    {
      label: 'Entretenimiento / ocio',
      value: variables <= 15 ? 'Razonable' : variables <= 25 ? 'Moderado' : 'Alto',
      color: variables <= 15 ? 'success' : variables <= 25 ? 'warning' : 'error',
      consejo:
        variables <= 15
          ? 'Tu nivel de ocio es adecuado para un contexto estudiantil.'
          : 'Considera si todo el gasto variable es entretenimiento o si hay necesidades mezcladas.',
    },
    {
      label: 'Balance general',
      value: `${balance >= 0 ? '+' : ''}$${balance.toLocaleString()}`,
      color: balance >= 0 ? 'success' : balance >= -200 ? 'warning' : 'error',
      consejo:
        balance >= 0
          ? '¡Tu presupuesto está en superávit! Ese excedente va directo al ahorro.'
          : balance >= -200
          ? 'Pequeño déficit. Con 1-2 ajustes puedes llegar al equilibrio.'
          : 'Déficit significativo. Revisa los 2-3 gastos más grandes y pregunta si se pueden reducir.',
    },
  ];
}

const COLOR_MAP = {
  success: { border: 'border-[var(--color-brand-success)]', bg: 'bg-[var(--color-brand-success)]/10', chip: 'bg-[var(--color-brand-success)]/10 text-[var(--color-brand-success)]' },
  warning: { border: 'border-[var(--color-brand-warning)]', bg: 'bg-[var(--color-brand-warning)]/10', chip: 'bg-[var(--color-brand-warning)]/10 text-[var(--color-brand-warning)]' },
  error: { border: 'border-[var(--color-brand-error)]', bg: 'bg-[var(--color-brand-error)]/10', chip: 'bg-[var(--color-brand-error)]/10 text-[var(--color-brand-error)]' },
};

export default function L13() {
  const [step, setStep] = useState(0);
  const [semaforo, setSemaforo] = useState<SemaforoItem[]>([]);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [allViewed, setAllViewed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await lessonDataRepository.load<BudgetData>('presupuesto', 'l12_budget');
      setSemaforo(calcSemaforo(data));
      setLoading(false);
    };
    void load();
  }, []);

  const toggleExpanded = (i: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
    if (expanded.size + 1 >= semaforo.length) {
      setAllViewed(true);
    }
  };

  const stars = semaforo.filter((s) => s.color === 'success').length;
  const starMsg =
    stars === 5
      ? '¡Presupuesto impecable! Eres de los pocos que realmente planea.'
      : stars >= 3
      ? 'Muy buen trabajo. Con estos ajustes, tu presupuesto será sólido.'
      : '¡Un primer presupuesto siempre es así! Lo importante es que ya empezaste.';

  if (loading) {
    return (
      <LessonShell id="L13" title="Finni te da su veredicto" completion={{ ready: false }}>
        <p className="text-sm text-[var(--color-text-secondary)]">Cargando tu presupuesto...</p>
      </LessonShell>
    );
  }

  const progressValue = step === 0 ? 0 : step === 1 ? 40 : 100;

  return (
    <LessonShell
      id="L13"
      title="Finni te da su veredicto: ¿cómo vas?"
      completion={{ ready: allViewed || expanded.size >= semaforo.length }}
    >
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full bg-[var(--color-brand-warning)] transition-all" style={{ width: `${progressValue}%` }} />
        </div>

        {step === 0 && (
          <div className="space-y-3">
            <FinniMessage
              variant="coach"
              title="¡Ya tienes tu presupuesto!"
              message="Déjame analizarlo. Voy a ser honesto contigo: lo que funciona bien, lo celebramos. Lo que necesita ajuste, te lo digo con respeto."
            />
            <FECard variant="flat" className="bg-[var(--color-brand-warning)]/10 border border-[var(--color-brand-warning)] text-center py-4">
              <p className="text-sm text-[var(--color-text-secondary)]">Analizando...</p>
              <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mt-2">
                <div className="h-2 rounded-full bg-[var(--color-brand-warning)] transition-all w-3/4" />
              </div>
            </FECard>
            <button
              className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm"
              onClick={() => setStep(1)}
            >
              Ver el reporte semáforo →
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <p className="font-bold">
              Reporte semáforo de Finni 🚦
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Toca cada indicador para ver el análisis completo.
            </p>
            <div className="space-y-2">
              {semaforo.map((s, i) => {
                const colors = COLOR_MAP[s.color];
                return (
                  <FECard
                    key={i}
                    variant="flat"
                    className={cn('border-2 cursor-pointer transition-colors', colors.border, expanded.has(i) ? colors.bg : '')}
                    onClick={() => { toggleExpanded(i); if (expanded.size + 1 >= semaforo.length) setAllViewed(true); }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-sm">{s.label}</p>
                      <div className="flex items-center gap-2">
                        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold', colors.chip)}>
                          {s.value}
                        </span>
                        <p className="text-xs">{expanded.has(i) ? '▲' : '▼'}</p>
                      </div>
                    </div>
                    {expanded.has(i) && (
                      <p className="text-sm mt-2 italic">
                        {s.consejo}
                      </p>
                    )}
                  </FECard>
                );
              })}
            </div>
            {(allViewed || expanded.size >= semaforo.length) && (
              <button
                className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm"
                onClick={() => setStep(2)}
              >
                Ver calificación final →
              </button>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <FECard variant="flat" className="bg-[var(--color-brand-warning)]/10 border-2 border-[var(--color-brand-warning)] text-center py-4">
              <p className="text-4xl">
                {'⭐'.repeat(stars)}{'☆'.repeat(5 - stars)}
              </p>
              <p className="font-bold text-base mt-2">{stars}/5 indicadores en verde</p>
            </FECard>
            <FinniMessage
              variant="success"
              title="Veredicto de Finni"
              message={starMsg}
            />
          </div>
        )}
      </div>
    </LessonShell>
  );
}
