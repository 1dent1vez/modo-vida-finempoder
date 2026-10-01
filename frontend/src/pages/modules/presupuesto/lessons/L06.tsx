import { useEffect, useRef, useState } from 'react';
import LessonShell from '../LessonShell';
import ActivityFrame, {
  ActivityLoadError,
  ActivityLoading,
} from '../../../../module-kit/activities/ActivityFrame';
import {
  balanceOf,
  initialBalance,
  parseBalance,
  type BalanceDraft,
} from '../../../../module-kit/activities/balanceCalculatorModel';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import { useAuth } from '../../../../store/auth';
import '../../../../module-kit/activities/classification.css';
import '../../../../module-kit/activities/balance-calculator.css';

const KEY = 'l6_balance:v1';
const money = (value: number) =>
  value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
export default function L06() {
  const userId = useAuth((state) => state.user?.id ?? 'local');
  return <BalanceSession key={userId} />;
}

function BalanceSession() {
  const [draft, setDraft] = useState<BalanceDraft>(initialBalance);
  const [incomeText, setIncomeText] = useState('3000');
  const [expensesText, setExpensesText] = useState('2280');
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
        const saved = parseBalance(raw) ?? initialBalance();
        setDraft(saved);
        setIncomeText(String(saved.income));
        setExpensesText(String(saved.expenses));
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
  const income = Number(incomeText);
  const expenses = Number(expensesText);
  const valid =
    [incomeText, expensesText].every((value) => value.trim() !== '') &&
    [income, expenses].every((value) => Number.isFinite(value) && value >= 0 && value <= 10000000);
  const live = { ...draft, income: valid ? income : 0, expenses: valid ? expenses : 0 };
  const balance = balanceOf(live);
  const state = balance > 0 ? 'surplus' : balance < 0 ? 'deficit' : 'balanced';
  const update = (field: 'income' | 'expenses', value: string) => {
    if (field === 'income') setIncomeText(value);
    else setExpensesText(value);
    setDraft((current) => ({ ...current, interacted: true }));
    setDirty(true);
    setCue(null);
  };
  const persist = async (stage: BalanceDraft['stage']) => {
    if (lock.current || !valid || !draft.interacted) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    const next = { ...draft, income, expenses, stage };
    try {
      if (stage === 'complete') {
        await lessonDataRepository.saveBatch('presupuesto', [
          {
            key: 'l6_balance_result',
            data: {
              income,
              expenses,
              balance,
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
        setCue(stage);
      }
    } catch {
      if (mounted.current)
        setError('No pudimos guardar el cálculo. Tus cantidades siguen en pantalla.');
    } finally {
      lock.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  const reviewing = draft.stage !== 'calculate';
  const advice =
    state === 'deficit'
      ? {
          title: 'El déficit es una señal',
          text: `En este ejemplo faltan ${money(Math.abs(balance))}. Revisa primero gastos ajustables y evita cubrir una diferencia recurrente con deuda.`,
          tone: 'review' as const,
        }
      : state === 'surplus'
        ? {
            title: 'Dale trabajo al excedente',
            text: `Quedan ${money(balance)}. Decide cuánto irá a ahorro, deuda o una meta antes de que se diluya.`,
            tone: 'success' as const,
          }
        : {
            title: 'Sin margen para imprevistos',
            text: 'El balance está en cero. Considera crear una pequeña reserva dentro del presupuesto.',
            tone: 'info' as const,
          };

  return (
    <LessonShell
      id="L06"
      title="Calcula tu balance mensual"
      showGreeting={false}
      completion={{ ready: draft.stage === 'complete', score: 100 }}
    >
      {loading ? (
        <ActivityLoading message="Recuperando tu cálculo…" />
      ) : loadError ? (
        <ActivityLoadError
          message="No pudimos recuperar tu balance."
          onRetry={() => setRetry((value) => value + 1)}
        />
      ) : (
        <ActivityFrame
          label="Calculadora de balance mensual"
          className="balance-calculator"
          busy={busy}
          title={
            reviewing
              ? 'Revisa qué significa el resultado.'
              : 'Cambia el caso y observa el balance.'
          }
          description="Usa cantidades ficticias. Ingresos menos gastos es igual al balance del mes."
          progressLabel="Etapas completadas"
          progressValue={reviewing ? 1 : 0}
          progressMax={1}
          stepLabel={reviewing ? 'Paso 2 de 2 · Interpretar' : 'Paso 1 de 2 · Calcular'}
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
                  ? 'Balance guardado.'
                  : 'Último cálculo guardado en este dispositivo.'
          }
          actions={
            <div className="bc-actions">
              {draft.stage === 'calculate' && (
                <>
                  <button
                    className="bc-secondary"
                    disabled={busy || !valid || !draft.interacted}
                    onClick={() => void persist('calculate')}
                  >
                    Guardar borrador
                  </button>
                  <button
                    className="ca-primary"
                    disabled={busy || !valid || !draft.interacted}
                    onClick={() => void persist('review')}
                  >
                    Guardar y revisar
                  </button>
                </>
              )}
              {draft.stage === 'review' && (
                <>
                  <button
                    className="bc-secondary"
                    disabled={busy}
                    onClick={() => {
                      setDraft((current) => ({ ...current, stage: 'calculate' }));
                      setDirty(true);
                    }}
                  >
                    Ajustar cantidades
                  </button>
                  <button
                    className="ca-primary"
                    disabled={busy}
                    onClick={() => void persist('complete')}
                  >
                    Guardar y terminar
                  </button>
                </>
              )}
            </div>
          }
        >
          {!reviewing && (
            <div className="bc-form">
              <label>
                Ingresos mensuales del ejemplo (MXN)
                <input
                  inputMode="decimal"
                  value={incomeText}
                  onChange={(event) => update('income', event.target.value)}
                />
              </label>
              <label>
                Gastos mensuales del ejemplo (MXN)
                <input
                  inputMode="decimal"
                  value={expensesText}
                  onChange={(event) => update('expenses', event.target.value)}
                />
              </label>
            </div>
          )}
          <div className="bc-equation" aria-live="polite">
            <div>
              <span>Ingresos</span>
              <strong>{valid ? money(income) : '—'}</strong>
            </div>
            <b>−</b>
            <div>
              <span>Gastos</span>
              <strong>{valid ? money(expenses) : '—'}</strong>
            </div>
            <b>=</b>
            <div className="bc-result" data-state={state}>
              <span>Balance</span>
              <strong>{valid ? money(balance) : '—'}</strong>
            </div>
          </div>
          {reviewing && (
            <div className="bc-reading">
              <h3>
                {state === 'surplus'
                  ? 'Hay superávit'
                  : state === 'deficit'
                    ? 'Hay déficit'
                    : 'El balance está en cero'}
              </h3>
              <p>{advice.text}</p>
              <p>Este ejercicio no modifica tu presupuesto personal.</p>
            </div>
          )}
        </ActivityFrame>
      )}
    </LessonShell>
  );
}
