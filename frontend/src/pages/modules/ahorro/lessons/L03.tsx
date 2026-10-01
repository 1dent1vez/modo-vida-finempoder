import { useEffect, useMemo, useRef, useState } from 'react';
import LessonShell from '../LessonShell';
import ActivityFrame, {
  ActivityLoadError,
  ActivityLoading,
} from '../../../../module-kit/activities/ActivityFrame';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import { LessonRange } from '../../../../module-kit/components/activities';
import '../../../../module-kit/activities/classification.css';
import '../../../../module-kit/activities/savings-return.css';

type Stage = 'learn' | 'simulate' | 'check' | 'review' | 'complete';
type Draft = {
  version: 1;
  stage: Stage;
  amount: number;
  rate: number;
  months: number;
  question: number;
  pending: number | null;
  answers: Record<number, number>;
  verify: string | null;
};
const KEY = 'savings_l3:return:v1';
const QUESTIONS = [
  {
    text: '¿La cifra del simulador garantiza ese resultado?',
    options: ['Sí, porque usa una fórmula', 'No, es una estimación con supuestos'],
    correct: 1,
    feedback:
      'La tasa, los costos, los impuestos y las condiciones reales pueden cambiar el resultado.',
  },
  {
    text: '¿Qué debes revisar antes de elegir dónde ahorrar?',
    options: ['Solo la tasa anunciada', 'Tasa, costos, acceso, condiciones y protección aplicable'],
    correct: 1,
    feedback: 'Una tasa aislada no permite comparar el resultado ni la disponibilidad del dinero.',
  },
] as const;
const VERIFY = [
  { id: 'conditions', label: 'Condiciones y costos' },
  { id: 'access', label: 'Disponibilidad del dinero' },
  { id: 'protection', label: 'Institución y protección aplicable' },
];
const initial = (): Draft => ({
  version: 1,
  stage: 'learn',
  amount: 5000,
  rate: 3,
  months: 12,
  question: 0,
  pending: null,
  answers: {},
  verify: null,
});
function parse(raw: unknown): Draft | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as Draft;
  if (
    value.version !== 1 ||
    !['learn', 'simulate', 'check', 'review', 'complete'].includes(value.stage) ||
    !Number.isFinite(value.amount) ||
    value.amount < 500 ||
    value.amount > 50000 ||
    !Number.isFinite(value.rate) ||
    value.rate < 0 ||
    value.rate > 15 ||
    !Number.isInteger(value.months) ||
    value.months < 3 ||
    value.months > 60 ||
    !Number.isInteger(value.question) ||
    value.question < 0 ||
    value.question > 1 ||
    (value.pending !== null && ![0, 1].includes(value.pending)) ||
    !value.answers ||
    (value.verify !== null && !VERIFY.some((item) => item.id === value.verify)) ||
    (['review', 'complete'].includes(value.stage) && !value.verify)
  )
    return null;
  return value;
}

export default function L03() {
  const [draft, setDraft] = useState<Draft>(initial);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cue, setCue] = useState<string | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    setLoading(true);
    setLoadError(false);
    void lessonDataRepository
      .load('ahorro', KEY)
      .then((raw) => {
        if (mounted.current) {
          setDraft(parse(raw) ?? initial());
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted.current) {
          setLoading(false);
          setLoadError(true);
        }
      });
    return () => {
      mounted.current = false;
    };
  }, [attempt]);
  const persist = async (next: Draft, final = false) => {
    setBusy(true);
    setError(null);
    try {
      if (final) {
        await lessonDataRepository.saveBatch('ahorro', [
          {
            key: 'l3_savings_return',
            data: {
              amount: next.amount,
              rate: next.rate,
              months: next.months,
              answers: next.answers,
              verify: next.verify,
              model: 'monthly-compounding-illustration',
            },
          },
          { key: KEY, data: next },
        ]);
      } else {
        await lessonDataRepository.save('ahorro', KEY, next);
      }
      if (mounted.current) {
        setDraft(next);
        setDirty(false);
      }
    } catch {
      if (mounted.current) setError('No pudimos guardar. Tus cambios siguen en pantalla.');
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  const estimate = useMemo(
    () => draft.amount * Math.pow(1 + draft.rate / 100 / 12, draft.months),
    [draft.amount, draft.rate, draft.months],
  );
  if (loading)
    return (
      <LessonShell id="L03" title="Cómo crece tu ahorro" completion={{ ready: false }}>
        <ActivityLoading />
      </LessonShell>
    );
  if (loadError)
    return (
      <LessonShell id="L03" title="Cómo crece tu ahorro" completion={{ ready: false }}>
        <ActivityLoadError
          message="No pudimos recuperar tu avance."
          onRetry={() => setAttempt((value) => value + 1)}
        />
      </LessonShell>
    );
  const question = QUESTIONS[draft.question];
  const feedback = draft.pending === null ? null : draft.pending === question.correct;
  const reviewing = draft.stage === 'review' || draft.stage === 'complete';
  const confirm = () => {
    if (draft.pending === null) return;
    const answers = { ...draft.answers, [draft.question]: draft.pending };
    const last = draft.question === 1;
    void persist({
      ...draft,
      answers,
      pending: null,
      question: last ? 1 : 1,
      stage: last ? 'review' : 'check',
    });
  };
  return (
    <LessonShell
      id="L03"
      title="Tu dinero en el banco trabaja por ti"
      showGreeting={false}
      completion={{ ready: draft.stage === 'complete', score: 100 }}
    >
      <ActivityFrame
        label="Simulador de rendimiento"
        className="savings-return"
        busy={busy}
        title={
          reviewing
            ? 'Revisa lo que vas a verificar.'
            : draft.stage === 'check'
              ? 'Distingue estimación de promesa.'
              : draft.stage === 'simulate'
                ? 'Cambia los supuestos.'
                : 'Entiende de dónde sale el rendimiento.'
        }
        description="Observa cómo una tasa ilustrativa puede cambiar un saldo con el tiempo."
        progressLabel="Etapas completadas"
        progressValue={
          draft.stage === 'learn'
            ? 0
            : draft.stage === 'simulate'
              ? 1
              : draft.stage === 'check'
                ? 2 + Object.keys(draft.answers).length
                : 4
        }
        progressMax={4}
        stepLabel={
          reviewing
            ? 'Paso 4 de 4 · Revisar'
            : draft.stage === 'check'
              ? `Paso 3 de 4 · Pregunta ${draft.question + 1} de 2`
              : draft.stage === 'simulate'
                ? 'Paso 2 de 4 · Simular'
                : 'Paso 1 de 4 · Comprender'
        }
        focusKey={`${draft.stage}-${draft.question}`}
        advice={{
          title:
            feedback === null
              ? 'La tasa es solo un supuesto'
              : feedback
                ? 'Lectura correcta'
                : 'Revisa el alcance',
          text:
            feedback === null
              ? 'El rendimiento depende del producto y sus condiciones; puede ser cero y cambiar con el tiempo.'
              : question.feedback,
          tone: feedback === null ? 'info' : feedback ? 'success' : 'review',
        }}
        adviceCue={cue}
        error={error}
        status={busy ? 'Guardando…' : dirty ? 'Cambios sin guardar.' : 'Tu avance está guardado.'}
        actions={
          <div className="sr-actions">
            {draft.stage === 'learn' && (
              <button
                className="ca-primary"
                onClick={() => void persist({ ...draft, stage: 'simulate' })}
              >
                Abrir simulador
              </button>
            )}
            {draft.stage === 'simulate' && (
              <button
                className="ca-primary"
                disabled={!draft.verify}
                onClick={() => void persist({ ...draft, stage: 'check' })}
              >
                Comprobar lo aprendido
              </button>
            )}
            {draft.stage === 'check' && (
              <button
                className="ca-primary"
                disabled={draft.pending === null || busy}
                onClick={confirm}
              >
                {draft.question === 1 ? 'Confirmar y revisar' : 'Confirmar respuesta'}
              </button>
            )}
            {draft.stage === 'review' && (
              <>
                <button
                  className="sr-secondary"
                  onClick={() => {
                    setDraft((value) => ({ ...value, stage: 'simulate' }));
                    setDirty(true);
                  }}
                >
                  Ajustar simulación
                </button>
                <button
                  className="ca-primary"
                  onClick={() => void persist({ ...draft, stage: 'complete' }, true)}
                >
                  Guardar y terminar
                </button>
              </>
            )}
          </div>
        }
      >
        {draft.stage === 'learn' && (
          <section className="sr-concept">
            <div>
              <strong>Saldo inicial</strong>
              <span>${draft.amount.toLocaleString()}</span>
            </div>
            <span aria-hidden="true">+</span>
            <div>
              <strong>Rendimiento estimado</strong>
              <span>según tasa y tiempo</span>
            </div>
            <span aria-hidden="true">=</span>
            <div>
              <strong>Saldo estimado</strong>
              <span>antes de costos e impuestos</span>
            </div>
          </section>
        )}
        {draft.stage === 'simulate' && (
          <section className="sr-simulator">
            <LessonRange
              label="Monto inicial:"
              display={`$${draft.amount.toLocaleString()}`}
              min={500}
              max={50000}
              step={500}
              value={draft.amount}
              onChange={(amount) => {
                setDraft((value) => ({ ...value, amount }));
                setDirty(true);
              }}
            />
            <LessonRange
              label="Tasa anual ilustrativa:"
              display={`${draft.rate}%`}
              min={0}
              max={15}
              step={0.5}
              value={draft.rate}
              onChange={(rate) => {
                setDraft((value) => ({ ...value, rate }));
                setDirty(true);
              }}
            />
            <LessonRange
              label="Plazo:"
              display={`${draft.months} meses`}
              min={3}
              max={60}
              step={3}
              value={draft.months}
              onChange={(months) => {
                setDraft((value) => ({ ...value, months }));
                setDirty(true);
              }}
            />
            <div className="sr-result">
              <span>Saldo estimado</span>
              <strong>${estimate.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
              <small>
                Ganancia estimada: $
                {(estimate - draft.amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </small>
            </div>
            <fieldset>
              <legend>Lo primero que verificaré:</legend>
              {VERIFY.map((item) => (
                <label key={item.id}>
                  <input
                    type="radio"
                    name="verify"
                    checked={draft.verify === item.id}
                    onChange={() => {
                      setDraft((value) => ({ ...value, verify: item.id }));
                      setDirty(true);
                    }}
                  />
                  {item.label}
                </label>
              ))}
            </fieldset>
            <p className="sr-note">
              Estimación educativa con capitalización mensual. No incluye comisiones, impuestos,
              inflación ni cambios de tasa.
            </p>
          </section>
        )}
        {draft.stage === 'check' && (
          <section className="sr-question">
            <h3>{question.text}</h3>
            {question.options.map((option, index) => (
              <button
                key={option}
                className={draft.pending === index ? 'is-selected' : ''}
                aria-pressed={draft.pending === index}
                onClick={() => {
                  setDraft((value) => ({ ...value, pending: index }));
                  setCue(`Pregunta ${draft.question + 1}: ${option}`);
                  setDirty(true);
                }}
              >
                {option}
              </button>
            ))}
          </section>
        )}
        {reviewing && (
          <section className="sr-review">
            <span>Tu simulación</span>
            <strong>
              ${draft.amount.toLocaleString()} → $
              {estimate.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </strong>
            <p>
              Con {draft.rate}% anual ilustrativo durante {draft.months} meses. Verificarás:{' '}
              {VERIFY.find((item) => item.id === draft.verify)?.label.toLowerCase()}.
            </p>
          </section>
        )}
      </ActivityFrame>
    </LessonShell>
  );
}
