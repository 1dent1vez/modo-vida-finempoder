import { useEffect, useRef, useState } from 'react';
import LessonShell from '../LessonShell';
import ActivityFrame, {
  ActivityLoadError,
  ActivityLoading,
} from '../../../../module-kit/activities/ActivityFrame';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import { useAuth } from '../../../../store/auth';
import '../../../../module-kit/activities/classification.css';
import '../../../../module-kit/activities/budgetFeedback.css';

type Budget = {
  pctFijos?: number;
  pctVariables?: number;
  pctAhorro?: number;
  balance?: number;
  totalIngresos?: number;
};
export type BudgetInsight = {
  id: string;
  label: string;
  value: string;
  explanation: string;
  action: string;
};
const EXAMPLE: Budget = {
  pctFijos: 52,
  pctVariables: 28,
  pctAhorro: 10,
  balance: 300,
  totalIngresos: 5000,
};
const KEY = 'l13_feedback:v1';

// eslint-disable-next-line react-refresh/only-export-components -- pure builder exported for lesson contract tests
export function buildBudgetInsights(data: Budget): BudgetInsight[] {
  const income = Math.max(0, Number(data.totalIngresos) || 0);
  const balance = Number(data.balance) || 0;
  const fixed = Math.max(0, Number(data.pctFijos) || 0);
  const variable = Math.max(0, Number(data.pctVariables) || 0);
  const saving = Math.max(0, Number(data.pctAhorro) || 0);
  return [
    {
      id: 'balance',
      label: 'Margen del mes',
      value: `${balance >= 0 ? '+' : '−'}$${Math.abs(balance).toLocaleString()}`,
      explanation:
        balance >= 0
          ? 'Tus ingresos cubren lo registrado y dejan margen.'
          : 'Lo registrado supera el ingreso del mes.',
      action:
        balance >= 0
          ? 'Decide cuánto del margen quieres conservar.'
          : 'Revisa primero un gasto aplazable o una cantidad ajustable.',
    },
    {
      id: 'fixed',
      label: 'Compromisos fijos',
      value: `${fixed}% del ingreso`,
      explanation: 'Esta proporción muestra cuánto ingreso ya tiene un destino recurrente.',
      action:
        fixed > 60
          ? 'Comprueba si algún servicio o compromiso admite ajuste.'
          : 'Anota qué pagos cambiarían si tu ingreso bajara.',
    },
    {
      id: 'variable',
      label: 'Gastos variables',
      value: `${variable}% del ingreso`,
      explanation:
        'Aquí pueden convivir necesidades y deseos; el porcentaje por sí solo no los distingue.',
      action: 'Revisa la categoría variable más grande antes de decidir un recorte.',
    },
    {
      id: 'saving',
      label: 'Ahorro planeado',
      value: `${saving}% del ingreso`,
      explanation:
        saving > 0
          ? 'Ya reservaste una parte del ingreso dentro del plan.'
          : 'Este presupuesto todavía no reserva una cantidad para ahorro.',
      action:
        saving > 0
          ? 'Valida que la cantidad sea sostenible durante el mes.'
          : `Prueba una cantidad pequeña sin dejar el balance negativo${income ? ` sobre tus $${income.toLocaleString()} de ingreso` : ''}.`,
    },
  ];
}

type Draft = {
  version: 1;
  stage: 'insights' | 'priority' | 'review' | 'complete';
  index: number;
  priority: string | null;
  example: boolean;
};
const initial = (): Draft => ({
  version: 1,
  stage: 'insights',
  index: 0,
  priority: null,
  example: false,
});
function parse(raw: unknown): Draft | null {
  if (!raw || typeof raw !== 'object') return null;
  const v = raw as Draft;
  if (
    v.version !== 1 ||
    !['insights', 'priority', 'review', 'complete'].includes(v.stage) ||
    !Number.isInteger(v.index) ||
    v.index < 0 ||
    v.index > 3 ||
    (v.priority !== null && !['balance', 'fixed', 'variable', 'saving'].includes(v.priority)) ||
    (['review', 'complete'].includes(v.stage) && !v.priority)
  )
    return null;
  return v;
}

export default function L13() {
  const userId = useAuth((state) => state.user?.id ?? 'local');
  return <FeedbackSession key={userId} />;
}
function FeedbackSession() {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [missing, setMissing] = useState(false);
  const [draft, setDraft] = useState<Draft>(initial);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cue, setCue] = useState<string | null>(null);
  const mounted = useRef(true);
  const lock = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(false);
    void Promise.all([
      lessonDataRepository.load<Budget>('presupuesto', 'l12_budget'),
      lessonDataRepository.load('presupuesto', KEY),
    ])
      .then(([savedBudget, savedDraft]) => {
        if (!active) return;
        const restored = parse(savedDraft) ?? initial();
        setDraft(restored);
        if (savedBudget) setBudget(savedBudget);
        else if (restored.example) setBudget(EXAMPLE);
        else setMissing(true);
        setLoading(false);
      })
      .catch(() => {
        if (active) {
          setLoadError(true);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [retry]);
  const persist = async (next: Draft, final = false) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    try {
      if (final) {
        await lessonDataRepository.saveBatch('presupuesto', [
          {
            key: 'l13_feedback',
            data: {
              priority: next.priority,
              example: next.example,
            },
          },
          { key: KEY, data: next },
        ]);
      } else {
        await lessonDataRepository.save('presupuesto', KEY, next);
      }
      if (mounted.current) {
        setDraft(next);
        setDirty(false);
      }
    } catch {
      if (mounted.current) setError('No pudimos guardar. Tu selección sigue en pantalla.');
    } finally {
      lock.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  if (loading)
    return (
      <LessonShell id="L13" title="Finni analiza tu presupuesto" completion={{ ready: false }}>
        <ActivityLoading message="Preparando tus señales…" />
      </LessonShell>
    );
  if (loadError)
    return (
      <LessonShell id="L13" title="Finni analiza tu presupuesto" completion={{ ready: false }}>
        <ActivityLoadError
          message="No pudimos recuperar el presupuesto."
          onRetry={() => setRetry((v) => v + 1)}
        />
      </LessonShell>
    );
  if (missing || !budget)
    return (
      <LessonShell id="L13" title="Finni analiza tu presupuesto" completion={{ ready: false }}>
        <div className="ca-load">
          <p>No encontramos un presupuesto guardado de L12.</p>
          <button
            onClick={() => {
              setMissing(false);
              setBudget(EXAMPLE);
              setDraft((v) => ({ ...v, example: true }));
              setDirty(true);
            }}
          >
            Practicar con un ejemplo ficticio
          </button>
        </div>
      </LessonShell>
    );
  const insights = buildBudgetInsights(budget);
  const insight = insights[draft.index];
  const reviewing = draft.stage === 'review' || draft.stage === 'complete';
  const priority = insights.find((item) => item.id === draft.priority);
  const advice = {
    title: draft.stage === 'insights' ? insight.label : 'Una prioridad a la vez',
    text:
      draft.stage === 'insights'
        ? insight.action
        : 'Elige la señal que te resulte más útil revisar; no hay una calificación universal para todos los presupuestos.',
    tone: 'info' as const,
  };
  return (
    <LessonShell
      id="L13"
      title="Finni analiza tu presupuesto"
      showGreeting={false}
      completion={{ ready: draft.stage === 'complete', score: 100 }}
    >
      <ActivityFrame
        label="Lectura guiada del presupuesto"
        className="budget-feedback"
        busy={busy}
        title={
          reviewing
            ? 'Revisa la señal que elegiste.'
            : draft.stage === 'priority'
              ? 'Elige dónde quieres empezar.'
              : 'Lee una señal a la vez.'
        }
        description={
          draft.example
            ? 'Estás practicando con un presupuesto ficticio.'
            : 'Finni usa el presupuesto que guardaste en L12.'
        }
        progressLabel="Señales revisadas"
        progressValue={draft.stage === 'insights' ? draft.index : 4}
        progressMax={4}
        stepLabel={
          reviewing
            ? 'Paso 3 de 3 · Revisar'
            : draft.stage === 'priority'
              ? 'Paso 2 de 3 · Priorizar'
              : `Paso 1 de 3 · Señal ${draft.index + 1} de 4`
        }
        focusKey={`${draft.stage}-${draft.index}`}
        advice={advice}
        adviceCue={cue}
        error={error}
        status={busy ? 'Guardando…' : dirty ? 'Cambios sin guardar.' : 'Tu avance está guardado.'}
        actions={
          <div className="bf-actions">
            {draft.stage === 'insights' && (
              <button
                className="ca-primary"
                disabled={busy}
                onClick={() =>
                  void persist({
                    ...draft,
                    index: draft.index === 3 ? 3 : draft.index + 1,
                    stage: draft.index === 3 ? 'priority' : 'insights',
                  })
                }
              >
                {draft.index === 3 ? 'Elegir una prioridad' : 'Siguiente señal'}
              </button>
            )}
            {draft.stage === 'priority' && (
              <button
                className="ca-primary"
                disabled={busy || !draft.priority}
                onClick={() => void persist({ ...draft, stage: 'review' })}
              >
                Guardar y revisar
              </button>
            )}
            {draft.stage === 'review' && (
              <>
                <button
                  className="bf-secondary"
                  onClick={() => {
                    setDraft((v) => ({ ...v, stage: 'priority' }));
                    setDirty(true);
                  }}
                >
                  Cambiar prioridad
                </button>
                <button
                  className="ca-primary"
                  disabled={busy}
                  onClick={() => void persist({ ...draft, stage: 'complete' }, true)}
                >
                  Guardar y terminar
                </button>
              </>
            )}
          </div>
        }
      >
        {draft.stage === 'insights' && (
          <section className="bf-panel">
            <span className="bf-value">{insight.value}</span>
            <h3>{insight.label}</h3>
            <p>{insight.explanation}</p>
          </section>
        )}
        {draft.stage === 'priority' && (
          <div className="bf-grid">
            {insights.map((item) => (
              <button
                key={item.id}
                className="bf-card"
                aria-pressed={draft.priority === item.id}
                onClick={() => {
                  setDraft((v) => ({ ...v, priority: item.id }));
                  setDirty(true);
                  setCue(item.id);
                }}
              >
                <strong>{item.label}</strong>
                <span>{item.action}</span>
              </button>
            ))}
          </div>
        )}
        {reviewing && (
          <section className="bf-panel">
            <span className="bf-value">{priority?.value}</span>
            <h3>{priority?.label}</h3>
            <p>{priority?.action}</p>
          </section>
        )}
      </ActivityFrame>
    </LessonShell>
  );
}
