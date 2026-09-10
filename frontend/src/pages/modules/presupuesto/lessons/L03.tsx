import { useEffect, useRef, useState } from 'react';
import LessonShell from '../LessonShell';
import ActivityFrame, {
  ActivityLoadError,
  ActivityLoading,
} from '../../../../module-kit/activities/ActivityFrame';
import {
  initialMicroExpense,
  parseMicroExpense,
  type MicroExpenseDraft,
} from '../../../../module-kit/activities/microExpenseModel';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import { useAuth } from '../../../../store/auth';
import '../../../../module-kit/activities/classification.css';
import '../../../../module-kit/activities/micro-expense.css';

const KEY = 'l3_gastos_hormiga:v1';
const EXAMPLES = [
  { id: 'cafe', label: 'Café fuera de casa', detail: '$45 · 3 veces por semana', weekly: 135 },
  { id: 'snack', label: 'Snack por impulso', detail: '$35 · 4 veces por semana', weekly: 140 },
  { id: 'delivery', label: 'Costo de envío', detail: '$49 · 2 veces por semana', weekly: 98 },
  { id: 'app', label: 'Suscripción poco usada', detail: '$99 · una vez al mes', weekly: 25 },
  { id: 'agua', label: 'Agua embotellada', detail: '$18 · 5 veces por semana', weekly: 90 },
  { id: 'comision', label: 'Comisión evitable', detail: '$30 · 2 veces por semana', weekly: 60 },
];
const VALID_IDS = new Set(EXAMPLES.map((item) => item.id));
const money = (value: number) =>
  value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

export default function L03() {
  const userId = useAuth((state) => state.user?.id ?? 'local');
  return <MicroExpenseSession key={userId} />;
}

function MicroExpenseSession() {
  const [draft, setDraft] = useState<MicroExpenseDraft>(initialMicroExpense);
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
    void lessonDataRepository
      .load('presupuesto', KEY)
      .then((raw) => {
        if (!active) return;
        setDraft(parseMicroExpense(raw, VALID_IDS) ?? initialMicroExpense());
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

  const chosen = EXAMPLES.filter((item) => draft.selected.includes(item.id));
  const weekly = chosen.reduce((sum, item) => sum + item.weekly, 0);
  const ready = draft.selected.length >= 3;
  const toggle = (id: string) => {
    if (draft.stage !== 'observe') return;
    setDraft((current) => ({
      ...current,
      selected: current.selected.includes(id)
        ? current.selected.filter((value) => value !== id)
        : [...current.selected, id],
    }));
    setDirty(true);
    setCue(null);
  };
  const persist = async (stage: MicroExpenseDraft['stage']) => {
    if (lock.current || (stage !== 'observe' && !ready)) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    const next = { ...draft, stage };
    try {
      if (stage === 'complete') {
        await lessonDataRepository.saveBatch('presupuesto', [
          {
            key: 'l3_gastos_hormiga',
            data: {
              gameGastos: chosen,
              personalGastos: [],
              totalWeekly: weekly,
              totalMonthly: weekly * 4,
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
        setCue(stage === 'review' ? 'review' : null);
      }
    } catch {
      if (mounted.current) setError('No pudimos guardar tu selección. Intenta de nuevo.');
    } finally {
      lock.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  const reviewing = draft.stage !== 'observe';
  const advice = reviewing
    ? {
        title: 'Decidir vale más que prohibir',
        text: 'Elige cuáles gastos sí disfrutas y cuáles prefieres redirigir a una meta.',
        tone: 'success' as const,
      }
    : ready
      ? {
          title: 'Ya encontraste un patrón',
          text: 'Ahora mira el efecto acumulado. No necesitas eliminar todo para recuperar margen.',
          tone: 'success' as const,
        }
      : {
          title: 'Busca repetición y piloto automático',
          text: 'El monto pequeño no basta: observa qué se repite y qué compras sin decidirlo.',
          tone: 'info' as const,
        };

  return (
    <LessonShell
      id="L03"
      title="Gastos fijos, variables y hormiga"
      showGreeting={false}
      completion={{ ready: draft.stage === 'complete', score: 100 }}
    >
      {loading ? (
        <ActivityLoading message="Recuperando tu observación…" />
      ) : loadError ? (
        <ActivityLoadError
          message="No pudimos recuperar tu actividad."
          onRetry={() => setRetry((value) => value + 1)}
        />
      ) : (
        <ActivityFrame
          label="Laboratorio de gastos hormiga"
          className="micro-expense"
          busy={busy}
          title={
            reviewing
              ? 'Mira el impacto antes de decidir.'
              : '¿Cuáles podrían pasar desapercibidos?'
          }
          description="Elige al menos tres ejemplos que podrían repetirse en una semana. No tienes que compartir gastos personales."
          progressLabel="Ejemplos observados"
          progressValue={Math.min(draft.selected.length, 3)}
          progressMax={3}
          stepLabel={reviewing ? 'Paso 2 de 2 · Decidir' : 'Paso 1 de 2 · Observar'}
          focusKey={draft.stage}
          advice={advice}
          adviceCue={cue}
          error={error}
          status={
            busy
              ? 'Guardando…'
              : dirty
                ? 'Cambios sin guardar.'
                : draft.stage === 'complete'
                  ? 'Actividad guardada.'
                  : 'Tu selección se guarda en este dispositivo.'
          }
          actions={
            <div className="me-actions">
              {draft.stage === 'observe' && (
                <button
                  className="me-secondary"
                  disabled={busy || !ready}
                  onClick={() => void persist('observe')}
                >
                  Guardar borrador
                </button>
              )}
              {draft.stage === 'observe' && (
                <button
                  className="ca-primary"
                  disabled={busy || !ready}
                  onClick={() => void persist('review')}
                >
                  Ver impacto
                </button>
              )}
              {draft.stage === 'review' && (
                <button
                  className="me-secondary"
                  disabled={busy}
                  onClick={() => {
                    setDraft((current) => ({ ...current, stage: 'observe' }));
                    setDirty(true);
                  }}
                >
                  Ajustar selección
                </button>
              )}
              {draft.stage === 'review' && (
                <button
                  className="ca-primary"
                  disabled={busy}
                  onClick={() => void persist('complete')}
                >
                  Guardar y terminar
                </button>
              )}
            </div>
          }
        >
          {!reviewing ? (
            <div className="me-grid">
              {EXAMPLES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="me-option"
                  aria-pressed={draft.selected.includes(item.id)}
                  onClick={() => toggle(item.id)}
                >
                  <strong>{item.label}</strong>
                  <span>{item.detail}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="me-review">
              <h3>Tu selección de ejemplo</h3>
              <ul>
                {chosen.map((item) => (
                  <li key={item.id}>
                    {item.label}: {money(item.weekly)} por semana
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="me-impact" aria-live="polite">
            <div>
              <span>Semana</span>
              <strong>{money(weekly)}</strong>
            </div>
            <div>
              <span>Mes aproximado</span>
              <strong>{money(weekly * 4)}</strong>
            </div>
            <div>
              <span>Año aproximado</span>
              <strong>{money(weekly * 52)}</strong>
            </div>
          </div>
          <p className="me-note">
            Son ejemplos para practicar. El cálculo usa cuatro semanas por mes y no representa tus
            gastos reales.
          </p>
        </ActivityFrame>
      )}
    </LessonShell>
  );
}
