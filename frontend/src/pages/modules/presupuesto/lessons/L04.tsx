import { useEffect, useRef, useState } from 'react';
import LessonShell from '../LessonShell';
import ActivityFrame, {
  ActivityLoadError,
  ActivityLoading,
} from '../../../../module-kit/activities/ActivityFrame';
import {
  initialExpenseRegistration,
  parseExpenseRegistration,
  type ExpenseRecord,
  type ExpenseRegistrationDraft,
} from '../../../../module-kit/activities/expenseRegistrationModel';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import { useAuth } from '../../../../store/auth';
import '../../../../module-kit/activities/classification.css';
import '../../../../module-kit/activities/expense-registration.css';

const KEY = 'l4_registration:v1';
const METHODS = [
  { id: 'libreta', label: 'Libreta o agenda', detail: 'Directa, sin batería y fácil de llevar.' },
  { id: 'hoja', label: 'Hoja de cálculo', detail: 'Ordena y compara el mes con más detalle.' },
  { id: 'app', label: 'App especializada', detail: 'Agiliza categorías y consultas frecuentes.' },
];
const EXPENSES = [
  {
    id: 'desayuno',
    time: '8:00',
    title: 'Tacos en la entrada',
    amount: 65,
    category: 'Alimentación',
  },
  {
    id: 'transporte',
    time: '8:45',
    title: 'Camión a la oficina',
    amount: 22,
    category: 'Transporte',
  },
  {
    id: 'almuerzo',
    time: '13:30',
    title: 'Comedor de la oficina',
    amount: 95,
    category: 'Alimentación',
  },
  {
    id: 'fotocopia',
    time: '15:00',
    title: 'Fotocopias para clase',
    amount: 14,
    category: 'Educación',
  },
  { id: 'cafe', time: '17:00', title: 'Café de la tarde', amount: 52, category: 'Alimentación' },
];
const CATEGORIES = ['Alimentación', 'Transporte', 'Educación', 'Entretenimiento', 'Varios'];
const PAYMENTS = ['Efectivo', 'Tarjeta', 'App de pago', 'Transferencia'];
const IDS = new Set(EXPENSES.map((item) => item.id));
const METHOD_IDS = new Set(METHODS.map((item) => item.id));

export default function L04() {
  const userId = useAuth((state) => state.user?.id ?? 'local');
  return <RegistrationSession key={userId} />;
}

function RegistrationSession() {
  const [draft, setDraft] = useState<ExpenseRegistrationDraft>(initialExpenseRegistration);
  const [category, setCategory] = useState('');
  const [payment, setPayment] = useState('');
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);
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
        setDraft(parseExpenseRegistration(raw, IDS, METHOD_IDS) ?? initialExpenseRegistration());
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

  const current = EXPENSES[draft.index];
  const persist = async (next: ExpenseRegistrationDraft, final = false) => {
    if (lock.current) return false;
    lock.current = true;
    setBusy(true);
    setError(null);
    try {
      if (final) {
        await lessonDataRepository.saveBatch('presupuesto', [
          { key: 'l4_method', data: { method: next.method } },
          {
            key: 'l4_records',
            data: {
              records: next.records,
              total: EXPENSES.reduce((sum, item) => sum + item.amount, 0),
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
      return true;
    } catch {
      if (mounted.current) setError('No pudimos guardar el registro. Conservamos lo que elegiste.');
      return false;
    } finally {
      lock.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  const submitRecord = async () => {
    if (!category || !payment || !current) return;
    const correct = category === current.category;
    setFeedback({
      correct,
      text: correct
        ? 'Categoría correcta. Ya puedes guardar este movimiento.'
        : `Este ejemplo corresponde a ${current.category}. Corrige la categoría para continuar.`,
    });
    setCue(`${current.id}-${correct}`);
    if (!correct) return;
    const records = {
      ...draft.records,
      [current.id]: { category, payment, correct } satisfies ExpenseRecord,
    };
    const last = draft.index === EXPENSES.length - 1;
    const next = {
      ...draft,
      records,
      index: last ? draft.index : draft.index + 1,
      stage: last ? ('review' as const) : ('practice' as const),
    };
    if (await persist(next)) {
      setCategory('');
      setPayment('');
      setFeedback(null);
    }
  };
  const stageNumber = draft.stage === 'method' ? 0 : draft.stage === 'practice' ? 1 : 2;
  const advice = feedback
    ? {
        title: feedback.correct ? 'Registro listo' : 'Revisa la categoría',
        text: feedback.text,
        tone: feedback.correct ? ('success' as const) : ('review' as const),
      }
    : {
        title: 'Registra en el momento',
        text: 'Categoría y forma de pago bastan para empezar. La constancia importa más que la herramienta.',
        tone: 'info' as const,
      };

  return (
    <LessonShell
      id="L04"
      title="Registra sin morir en el intento"
      showGreeting={false}
      completion={{ ready: draft.stage === 'complete', score: 100 }}
    >
      {loading ? (
        <ActivityLoading message="Recuperando tu práctica…" />
      ) : loadError ? (
        <ActivityLoadError
          message="No pudimos recuperar tus registros."
          onRetry={() => setRetry((value) => value + 1)}
        />
      ) : (
        <ActivityFrame
          label="Tutorial de registro de gastos"
          className="expense-registration"
          busy={busy}
          title={
            draft.stage === 'method'
              ? 'Elige un método que sí usarías.'
              : draft.stage === 'practice'
                ? 'Registra el día de Mariana.'
                : 'Revisa el registro completo.'
          }
          description="Practica con datos ficticios y confirma cada movimiento antes de avanzar."
          progressLabel="Movimientos registrados"
          progressValue={Object.keys(draft.records).length}
          progressMax={EXPENSES.length}
          stepLabel={`Paso ${stageNumber + 1} de 3`}
          focusKey={`${draft.stage}-${draft.index}`}
          advice={advice}
          adviceCue={cue}
          error={error}
          status={
            busy
              ? 'Guardando…'
              : dirty
                ? 'Cambios sin guardar.'
                : `${Object.keys(draft.records).length} de ${EXPENSES.length} movimientos guardados.`
          }
          actions={
            <div className="er-actions">
              {draft.stage === 'method' && (
                <button
                  className="ca-primary"
                  disabled={busy || !draft.method}
                  onClick={() => void persist({ ...draft, stage: 'practice' })}
                >
                  Comenzar práctica
                </button>
              )}
              {draft.stage === 'practice' && (
                <button
                  className="ca-primary"
                  disabled={busy || !category || !payment}
                  onClick={() => void submitRecord()}
                >
                  Comprobar y guardar
                </button>
              )}
              {draft.stage === 'review' && (
                <button
                  className="ca-primary"
                  disabled={busy}
                  onClick={() => void persist({ ...draft, stage: 'complete' }, true)}
                >
                  Guardar y terminar
                </button>
              )}
            </div>
          }
        >
          {draft.stage === 'method' && (
            <div className="er-methods">
              {METHODS.map((method) => (
                <button
                  key={method.id}
                  className="er-method"
                  aria-pressed={draft.method === method.id}
                  onClick={() => {
                    setDraft((value) => ({ ...value, method: method.id }));
                    setDirty(true);
                  }}
                >
                  <strong>{method.label}</strong>
                  <span>{method.detail}</span>
                </button>
              ))}
            </div>
          )}
          {draft.stage === 'practice' && current && (
            <>
              <article className="er-ticket">
                <header>
                  <span>{current.time}</span>
                  <strong>${current.amount}</strong>
                </header>
                <h3>{current.title}</h3>
                <span>Movimiento ficticio</span>
              </article>
              <div className="er-form">
                <label>
                  Categoría
                  <select
                    value={category}
                    onChange={(event) => {
                      setCategory(event.target.value);
                      setFeedback(null);
                    }}
                  >
                    <option value="">Selecciona</option>
                    {CATEGORIES.map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Forma de pago
                  <select value={payment} onChange={(event) => setPayment(event.target.value)}>
                    <option value="">Selecciona</option>
                    {PAYMENTS.map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </label>
              </div>
              {feedback && (
                <p className="er-feedback" data-correct={feedback.correct}>
                  {feedback.text}
                </p>
              )}
            </>
          )}
          {(draft.stage === 'review' || draft.stage === 'complete') && (
            <div className="er-summary">
              {EXPENSES.map((item) => (
                <div className="er-row" key={item.id}>
                  <div>
                    <strong>{item.title}</strong>
                    <span>
                      {draft.records[item.id]?.category} · {draft.records[item.id]?.payment}
                    </span>
                  </div>
                  <strong>${item.amount}</strong>
                </div>
              ))}
            </div>
          )}
        </ActivityFrame>
      )}
    </LessonShell>
  );
}
