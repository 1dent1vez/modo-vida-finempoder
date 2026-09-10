import { useEffect, useRef, useState } from 'react';
import LessonShell from '../LessonShell';
import ActivityFrame, {
  ActivityLoadError,
  ActivityLoading,
} from '../../../../module-kit/activities/ActivityFrame';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import { useAuth } from '../../../../store/auth';
import {
  budgetTotal,
  initialBudget,
  parseBudget,
  type BudgetDraft,
} from '../../../../module-kit/activities/budgetLabModel';
import '../../../../module-kit/activities/classification.css';
import '../../../../module-kit/activities/budget-lab.css';

const KEY = 'l5_lab:v1';
const groups = [
  {
    key: 'necesidades',
    title: 'Necesidades',
    example: 'Comida, transporte y vivienda.',
    reference: 50,
  },
  { key: 'deseos', title: 'Deseos', example: 'Salidas, entretenimiento y gustos.', reference: 30 },
  {
    key: 'ahorro',
    title: 'Ahorro o deudas',
    example: 'Tu meta, fondo de emergencia o pago de deuda.',
    reference: 20,
  },
] as const;
const money = (n: number) => n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
export default function L05() {
  const userId = useAuth((s) => s.user?.id ?? 'local');
  return <BudgetSession key={userId} />;
}
function BudgetSession() {
  const [draft, setDraft] = useState(initialBudget);
  const [incomeText, setIncomeText] = useState('2500');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cue, setCue] = useState<string | null>(null);
  const lock = useRef(false);
  const mounted = useRef(true);
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
        const saved = parseBudget(raw) ?? initialBudget();
        setDraft(saved);
        setIncomeText(String(saved.income));
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
  const validIncome =
    incomeText.trim() !== '' &&
    Number.isFinite(income) &&
    income > 0 &&
    income <= 10000000 &&
    Math.abs(income * 100 - Math.round(income * 100)) < 0.00001;
  const total = budgetTotal(draft);
  const editable = draft.stage === 'edit';
  const review = draft.stage === 'review' || draft.stage === 'complete';
  const balance = total > 100 ? 'over' : total < 100 ? 'under' : 'balanced';
  useEffect(() => {
    if (editable && balance !== 'balanced') setCue(`balance-${balance}`);
  }, [editable, balance]);
  const persist = async (stage: BudgetDraft['stage']) => {
    if (lock.current || !validIncome) return;
    if ((stage === 'review' || stage === 'complete') && (total !== 100 || !draft.interacted))
      return;
    lock.current = true;
    setBusy(true);
    setError(null);
    const next = { ...draft, income, stage };
    try {
      if (stage === 'complete') {
        await lessonDataRepository.saveBatch('presupuesto', [
          {
            key: 'l5_distribution',
            data: {
              income,
              necesidades: next.necesidades,
              deseos: next.deseos,
              ahorro: next.ahorro,
              score: 100,
            },
          },
          { key: KEY, data: next },
        ]);
      } else {
        await lessonDataRepository.save('presupuesto', KEY, next);
      }
      if (!mounted.current) return;
      if (mounted.current) {
        setDraft(next);
        setDirty(false);
        setCue(stage === 'review' ? 'review' : null);
      }
    } catch {
      if (mounted.current)
        setError(
          'No pudimos guardar. Conservamos tus cambios en esta pantalla; vuelve a intentarlo.',
        );
    } finally {
      lock.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  const advice =
    total > 100
      ? {
          title: 'Hay más planes que dinero',
          text: `Asignaste ${total}%. Reduce ${total - 100} puntos entre las categorías para volver al 100%.`,
          tone: 'review' as const,
        }
      : total < 100
        ? {
            title: 'Todavía queda dinero por asignar',
            text: `Faltan ${100 - total} puntos. Decide a qué categoría los destinarás antes de revisar.`,
            tone: 'review' as const,
          }
        : {
            title: review ? 'Cada peso tiene un destino' : 'Observa qué cambia',
            text: '50-30-20 es una referencia. Ajusta los porcentajes a tu situación y observa cuánto recibe cada categoría.',
            tone: 'success' as const,
          };
  const change = (key: 'necesidades' | 'deseos' | 'ahorro', value: number) => {
    setDraft((s) => ({ ...s, [key]: value, interacted: true }));
    setDirty(true);
    setCue(null);
  };
  return (
    <LessonShell
      id="L05"
      title="La regla 50-30-20: divide y vencerás"
      showGreeting={false}
      completion={{ ready: !loading && !loadError && draft.stage === 'complete', score: 100 }}
    >
      {loading ? (
        <ActivityLoading message="Recuperando tu laboratorio…" />
      ) : loadError ? (
        <ActivityLoadError
          message="No pudimos recuperar tu reparto."
          onRetry={() => setRetry((r) => r + 1)}
        />
      ) : (
        <ActivityFrame
          label="Laboratorio de presupuesto"
          className="budget-lab"
          busy={busy}
          title={review ? 'Tu reparto, antes de seguir.' : 'Dale un destino a cada peso.'}
          description="Explora la regla 50-30-20 y construye un reparto que sume 100%."
          advice={advice}
          adviceCue={cue}
          error={error}
          status={
            busy
              ? 'Guardando tu reparto…'
              : dirty
                ? 'Cambios sin guardar.'
                : draft.stage === 'intro'
                  ? 'Explora y guarda tu propio reparto.'
                  : 'Último reparto guardado en este dispositivo.'
          }
          actions={
            <div className="bl-actions">
              {editable && (
                <>
                  <button
                    className="bl-secondary"
                    disabled={busy || !validIncome}
                    onClick={() => void persist('edit')}
                  >
                    Guardar borrador
                  </button>
                  <button
                    className="bl-secondary"
                    disabled={busy}
                    onClick={() => setCue(`check-${Date.now()}`)}
                  >
                    Consultar a Finni
                  </button>
                </>
              )}
              {draft.stage === 'review' && (
                <button
                  className="bl-secondary"
                  disabled={busy}
                  onClick={() => void persist('edit')}
                >
                  Ajustar reparto
                </button>
              )}
              {draft.stage !== 'complete' && (
                <button
                  className="ca-primary"
                  disabled={
                    busy || !validIncome || (editable && (total !== 100 || !draft.interacted))
                  }
                  onClick={() =>
                    void persist(
                      draft.stage === 'intro' ? 'edit' : editable ? 'review' : 'complete',
                    )
                  }
                >
                  {draft.stage === 'intro'
                    ? 'Abrir laboratorio'
                    : editable
                      ? 'Guardar y revisar'
                      : 'Guardar y terminar'}
                </button>
              )}
            </div>
          }
        >
          {draft.stage === 'intro' ? (
            <div className="ca-intro">
              <p>
                Usaremos un ingreso mensual de ejemplo. Puedes cambiarlo: no necesitas compartir tus
                ingresos reales.
              </p>
              <dl className="bl-definitions">
                {groups.map((g) => (
                  <div key={g.key}>
                    <dt>
                      {g.reference}% · {g.title}
                    </dt>
                    <dd>{g.example}</dd>
                  </div>
                ))}
              </dl>
              <p>
                Es un punto de partida, no una obligación. Mueve los controles para ver qué aumenta
                y qué disminuye; después revisa tu decisión.
              </p>
            </div>
          ) : (
            <>
              <div className="bl-layout">
                <div>
                  {editable ? (
                    <div className="bl-income">
                      <label htmlFor="lab-income">Ingreso mensual de ejemplo (MXN)</label>
                      <input
                        id="lab-income"
                        type="number"
                        min="0.01"
                        max="10000000"
                        step="0.01"
                        value={incomeText}
                        disabled={busy}
                        aria-invalid={!validIncome}
                        aria-describedby={!validIncome ? 'income-error' : undefined}
                        onChange={(e) => {
                          setIncomeText(e.target.value);
                          setDirty(true);
                          setCue(null);
                        }}
                      />
                      {!validIncome && (
                        <p id="income-error" role="alert">
                          Escribe un monto mayor que cero, hasta 10 millones, con máximo dos
                          decimales.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p>
                      Ingreso mensual de ejemplo: <strong>{money(draft.income)}</strong>
                    </p>
                  )}
                  {groups.map((g) => (
                    <div className="bl-group" key={g.key}>
                      <div className="bl-group-title">
                        <label htmlFor={`lab-${g.key}`}>{g.title}</label>
                        <strong>{draft[g.key]}%</strong>
                      </div>
                      <p>{g.example}</p>
                      {editable && (
                        <input
                          id={`lab-${g.key}`}
                          type="range"
                          min="0"
                          max="100"
                          value={draft[g.key]}
                          disabled={busy}
                          onChange={(e) => change(g.key, Number(e.target.value))}
                        />
                      )}
                      <div className="bl-comparison">
                        <strong>{validIncome ? money((income * draft[g.key]) / 100) : '—'}</strong>
                        <span>Referencia: {g.reference}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <aside className="bl-balance" aria-label="Balance del reparto">
                  <h3>Así queda tu mes</h3>
                  <div className="bl-bar" aria-hidden="true">
                    {groups.map((g) => (
                      <span
                        key={g.key}
                        className={`bl-${g.key}`}
                        style={{ width: `${(draft[g.key] / Math.max(100, total)) * 100}%` }}
                      />
                    ))}
                  </div>
                  <p className="bl-total">
                    Asignado: <strong>{total}%</strong>
                  </p>
                  <p role="status">
                    {total === 100
                      ? 'Reparto completo: no sobra ni falta porcentaje.'
                      : total > 100
                        ? `Te excediste por ${total - 100} puntos.`
                        : `Quedan ${100 - total} puntos por asignar.`}
                  </p>
                  {validIncome && (
                    <p>
                      {total > 100 ? 'Faltaría' : 'Sin asignar'}:{' '}
                      <strong>{money(Math.abs((income * (100 - total)) / 100))}</strong>
                    </p>
                  )}
                  <p>
                    Los controles son independientes: tú decides de dónde quitar y a dónde mover.
                  </p>
                  {editable && (
                    <button
                      className="bl-secondary"
                      disabled={busy}
                      onClick={() => {
                        setDraft((s) => ({
                          ...s,
                          necesidades: 50,
                          deseos: 30,
                          ahorro: 20,
                          interacted: true,
                        }));
                        setDirty(true);
                        setCue(null);
                      }}
                    >
                      Aplicar 50-30-20
                    </button>
                  )}
                </aside>
              </div>
              {review && (
                <p className="bl-review">
                  Revisa los montos. Al terminar, este reparto estará disponible para construir tu
                  presupuesto en L12.
                </p>
              )}
            </>
          )}
        </ActivityFrame>
      )}
    </LessonShell>
  );
}
