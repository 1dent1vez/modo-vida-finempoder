import { useEffect, useRef, useState } from 'react';
import LessonShell from '../LessonShell';
import ActivityFrame, {
  ActivityLoadError,
  ActivityLoading,
} from '../../../../module-kit/activities/ActivityFrame';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import '../../../../module-kit/activities/classification.css';
import '../../../../module-kit/activities/savings-protection.css';

type Stage = 'learn' | 'verify' | 'quiz' | 'review' | 'complete';
type Draft = {
  version: 1;
  stage: Stage;
  checked: string[];
  question: number;
  pending: number | null;
  answers: Record<number, number>;
};
const KEY = 'savings_l10:ipab:v1';
const CHECKS = [
  {
    id: 'institution',
    title: '1. Institución',
    text: 'Confirma que la institución aparezca en los registros oficiales aplicables.',
  },
  {
    id: 'product',
    title: '2. Producto',
    text: 'Identifica si el tipo de depósito está cubierto y bajo qué condiciones.',
  },
  {
    id: 'limit',
    title: '3. Límite vigente',
    text: 'Consulta el límite en UDIs y su equivalencia actual directamente en la fuente oficial.',
  },
];
const QUESTIONS = [
  {
    text: '¿Abrir una cuenta garantiza por sí solo la protección del IPAB?',
    options: [
      'Sí, toda cuenta está cubierta',
      'No, depende de la institución, el producto y las condiciones',
    ],
    correct: 1,
    feedback:
      'El nombre comercial de una cuenta no basta. Hay que verificar institución y producto.',
  },
  {
    text: '¿Dónde consultarías el límite vigente y los productos protegidos?',
    options: ['En una publicación antigua', 'En los canales oficiales del IPAB'],
    correct: 1,
    feedback:
      'La equivalencia en pesos cambia con la UDI; la fuente oficial permite consultar el dato vigente.',
  },
] as const;
const initial = (): Draft => ({
  version: 1,
  stage: 'learn',
  checked: [],
  question: 0,
  pending: null,
  answers: {},
});
function parse(raw: unknown): Draft | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as Draft;
  if (
    value.version !== 1 ||
    !['learn', 'verify', 'quiz', 'review', 'complete'].includes(value.stage) ||
    !Array.isArray(value.checked) ||
    value.checked.some((id) => !CHECKS.some((item) => item.id === id)) ||
    !Number.isInteger(value.question) ||
    value.question < 0 ||
    value.question > 1 ||
    (value.pending !== null && ![0, 1].includes(value.pending)) ||
    !value.answers ||
    (['review', 'complete'].includes(value.stage) && Object.keys(value.answers).length !== 2)
  )
    return null;
  return value;
}
export default function L10() {
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
            key: 'l10_ipab_verification',
            data: {
              checklist: next.checked,
              answers: next.answers,
              sourcePolicy: 'official-current',
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
      if (mounted.current) setError('No pudimos guardar. Tu avance sigue en pantalla.');
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  if (loading)
    return (
      <LessonShell id="L10" title="Protección de depósitos" completion={{ ready: false }}>
        <ActivityLoading />
      </LessonShell>
    );
  if (loadError)
    return (
      <LessonShell id="L10" title="Protección de depósitos" completion={{ ready: false }}>
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
      stage: last ? 'review' : 'quiz',
    });
  };
  return (
    <LessonShell
      id="L10"
      title="El IPAB: el guardián de tu dinero"
      showGreeting={false}
      completion={{ ready: draft.stage === 'complete', score: 100 }}
    >
      <ActivityFrame
        label="Ruta de verificación IPAB"
        className="savings-protection"
        busy={busy}
        title={
          reviewing
            ? 'Conserva una ruta que no caduca.'
            : draft.stage === 'quiz'
              ? 'Comprueba la ruta de verificación.'
              : draft.stage === 'verify'
                ? 'Verifica tres cosas por separado.'
                : 'La protección depende de condiciones.'
        }
        description="Aprende a verificar información vigente sin memorizar una equivalencia en pesos que cambia."
        progressLabel="Etapas completadas"
        progressValue={
          draft.stage === 'learn'
            ? 0
            : draft.stage === 'verify'
              ? 1
              : draft.stage === 'quiz'
                ? 2 + Object.keys(draft.answers).length
                : 4
        }
        progressMax={4}
        stepLabel={
          reviewing
            ? 'Paso 4 de 4 · Revisar'
            : draft.stage === 'quiz'
              ? `Paso 3 de 4 · Pregunta ${draft.question + 1} de 2`
              : draft.stage === 'verify'
                ? 'Paso 2 de 4 · Verificar'
                : 'Paso 1 de 4 · Comprender'
        }
        focusKey={`${draft.stage}-${draft.question}`}
        advice={{
          title:
            feedback === null
              ? 'El dato vigente vive en la fuente oficial'
              : feedback
                ? 'Ruta correcta'
                : 'Evita memorizar una cifra aislada',
          text:
            feedback === null
              ? 'El IPAB publica información sobre instituciones, productos protegidos y el límite aplicable. Revisa sus canales oficiales antes de decidir.'
              : question.feedback,
          tone: feedback === null ? 'info' : feedback ? 'success' : 'review',
        }}
        adviceCue={cue}
        error={error}
        status={busy ? 'Guardando…' : dirty ? 'Cambios sin guardar.' : 'Tu avance está guardado.'}
        actions={
          <div className="spr-actions">
            {draft.stage === 'learn' && (
              <button
                className="ca-primary"
                onClick={() => void persist({ ...draft, stage: 'verify' })}
              >
                Aprender la ruta
              </button>
            )}
            {draft.stage === 'verify' && (
              <button
                className="ca-primary"
                disabled={draft.checked.length !== CHECKS.length || busy}
                onClick={() => void persist({ ...draft, stage: 'quiz' })}
              >
                Comprobar lo aprendido
              </button>
            )}
            {draft.stage === 'quiz' && (
              <button
                className="ca-primary"
                disabled={draft.pending === null || busy}
                onClick={confirm}
              >
                {draft.question === 1 ? 'Confirmar y revisar' : 'Confirmar respuesta'}
              </button>
            )}
            {draft.stage === 'review' && (
              <button
                className="ca-primary"
                onClick={() => void persist({ ...draft, stage: 'complete' }, true)}
              >
                Guardar ruta y terminar
              </button>
            )}
          </div>
        }
      >
        {draft.stage === 'learn' && (
          <section className="spr-definition">
            <span>IPAB</span>
            <h3>Protección al ahorro bancario en México</h3>
            <p>
              La protección aplica a determinados depósitos en instituciones bancarias cubiertas,
              conforme a límites y condiciones vigentes. No equivale a una garantía sobre cualquier
              producto financiero.
            </p>
          </section>
        )}
        {draft.stage === 'verify' && (
          <section className="spr-checks">
            {CHECKS.map((item) => (
              <label key={item.id}>
                <input
                  type="checkbox"
                  checked={draft.checked.includes(item.id)}
                  onChange={() => {
                    setDraft((value) => ({
                      ...value,
                      checked: value.checked.includes(item.id)
                        ? value.checked.filter((id) => id !== item.id)
                        : [...value.checked, item.id],
                    }));
                    setDirty(true);
                  }}
                />
                <span>
                  <strong>{item.title}</strong>
                  {item.text}
                </span>
              </label>
            ))}
            <p>Fuente de consulta: sitio y materiales oficiales del IPAB.</p>
          </section>
        )}
        {draft.stage === 'quiz' && (
          <section className="spr-question">
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
          <section className="spr-review">
            <span>Ruta guardada</span>
            <h3>Institución → producto → límite vigente</h3>
            <p>
              Repite estas tres verificaciones cuando abras o cambies una cuenta. La equivalencia en
              pesos puede variar.
            </p>
          </section>
        )}
      </ActivityFrame>
    </LessonShell>
  );
}
