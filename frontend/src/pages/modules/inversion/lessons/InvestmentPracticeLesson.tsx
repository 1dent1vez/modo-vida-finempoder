import { useEffect, useRef, useState } from 'react';
import LessonShell from '../LessonShell';
import ActivityFrame, {
  ActivityLoadError,
  ActivityLoading,
} from '../../../../module-kit/activities/ActivityFrame';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import '../../../../module-kit/activities/classification.css';
import '../../../../module-kit/activities/investment-foundations.css';
export type PracticeConfig = {
  id: string;
  title: string;
  label: string;
  headings: [string, string, string, string];
  description: string;
  cards: { id: string; name: string; text: string }[];
  prompt: string;
  options: string[];
  questions: { q: string; o: string[]; a: number; feedback: string }[];
  reviewTitle: string;
  reviewText: string;
  key: string;
  resultKey: string;
  defaultAdvice: string;
};
type Stage = 'discover' | 'apply' | 'check' | 'review' | 'complete';
type Draft = {
  version: 1;
  stage: Stage;
  viewed: string[];
  choice: string | null;
  note: string;
  answers: (number | null)[];
};
const initial = (n: number): Draft => ({
  version: 1,
  stage: 'discover',
  viewed: [],
  choice: null,
  note: '',
  answers: Array(n).fill(null),
});
function parse(x: unknown, n: number): Draft | null {
  if (!x || typeof x !== 'object') return null;
  const v = x as Draft;
  return v.version === 1 &&
    ['discover', 'apply', 'check', 'review', 'complete'].includes(v.stage) &&
    Array.isArray(v.viewed) &&
    Array.isArray(v.answers) &&
    v.answers.length === n &&
    typeof v.note === 'string'
    ? v
    : null;
}
export default function InvestmentPracticeLesson({ config: c }: { config: PracticeConfig }) {
  const [d, setD] = useState(() => initial(c.questions.length));
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cue, setCue] = useState<string | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    setLoading(true);
    setFailed(false);
    void lessonDataRepository
      .load('inversion', c.key)
      .then((x) => {
        if (mounted.current) {
          setD(parse(x, c.questions.length) ?? initial(c.questions.length));
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted.current) {
          setLoading(false);
          setFailed(true);
        }
      });
    return () => {
      mounted.current = false;
    };
  }, [attempt, c.key, c.questions.length]);
  const save = async (n: Draft, final = false) => {
    setBusy(true);
    setError(null);
    try {
      if (final) {
        await lessonDataRepository.saveBatch('inversion', [
          {
            key: c.resultKey,
            data: { choice: n.choice, note: n.note, answers: n.answers, conceptsViewed: n.viewed },
          },
          { key: c.key, data: n },
        ]);
      } else {
        await lessonDataRepository.save('inversion', c.key, n);
      }
      if (mounted.current) setD(n);
    } catch {
      if (mounted.current) setError('No pudimos guardar. Tu trabajo sigue en pantalla.');
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  const correct = d.answers.filter((x, i) => x === c.questions[i]!.a).length;
  const review = d.stage === 'review' || d.stage === 'complete';
  if (loading)
    return (
      <LessonShell id={c.id} title={c.title} completion={{ ready: false }}>
        <ActivityLoading />
      </LessonShell>
    );
  if (failed)
    return (
      <LessonShell id={c.id} title={c.title} completion={{ ready: false }}>
        <ActivityLoadError
          message="No pudimos recuperar tu avance."
          onRetry={() => setAttempt((x) => x + 1)}
        />
      </LessonShell>
    );
  return (
    <LessonShell
      id={c.id}
      title={c.title}
      showGreeting={false}
      completion={{ ready: d.stage === 'complete', score: correct / c.questions.length }}
    >
      <ActivityFrame
        label={c.label}
        className="investment-foundations"
        busy={busy}
        title={
          review
            ? c.headings[3]
            : d.stage === 'check'
              ? c.headings[2]
              : d.stage === 'apply'
                ? c.headings[1]
                : c.headings[0]
        }
        description={c.description}
        progressLabel="Etapas completadas"
        progressValue={
          d.stage === 'discover' ? 0 : d.stage === 'apply' ? 1 : d.stage === 'check' ? 2 : 3
        }
        progressMax={3}
        stepLabel={
          review
            ? 'Paso 4 de 4 · Revisar'
            : d.stage === 'check'
              ? 'Paso 3 de 4 · Comprobar'
              : d.stage === 'apply'
                ? 'Paso 2 de 4 · Aplicar'
                : 'Paso 1 de 4 · Explorar'
        }
        focusKey={d.stage}
        advice={{
          title: 'Finni te acompaña',
          text: cue ?? c.defaultAdvice,
          tone: correct === c.questions.length ? 'success' : 'info',
        }}
        adviceCue={cue}
        error={error}
        status={busy ? 'Guardando…' : 'Tu avance está guardado.'}
        actions={
          <div className="if-actions">
            {d.stage === 'discover' && (
              <button
                className="ca-primary"
                disabled={d.viewed.length < c.cards.length}
                onClick={() => void save({ ...d, stage: 'apply' })}
              >
                Aplicar criterios
              </button>
            )}
            {d.stage === 'apply' && (
              <button
                className="ca-primary"
                disabled={!d.choice || d.note.trim().length < 5}
                onClick={() => void save({ ...d, stage: 'check' })}
              >
                Comprobar decisiones
              </button>
            )}
            {d.stage === 'check' && (
              <button
                className="ca-primary"
                disabled={d.answers.some((x) => x === null)}
                onClick={() => void save({ ...d, stage: 'review' })}
              >
                Revisar aprendizaje
              </button>
            )}
            {d.stage === 'review' && (
              <button
                className="ca-primary"
                onClick={() => void save({ ...d, stage: 'complete' }, true)}
              >
                Guardar y terminar
              </button>
            )}
          </div>
        }
      >
        {d.stage === 'discover' && (
          <section className="if-grid">
            {c.cards.map((x) => (
              <button
                key={x.id}
                className={d.viewed.includes(x.id) ? 'is-viewed' : ''}
                onClick={() => {
                  setD((v) => ({
                    ...v,
                    viewed: v.viewed.includes(x.id) ? v.viewed : [...v.viewed, x.id],
                  }));
                  setCue(x.text);
                }}
              >
                <span>{x.name}</span>
                <small>{d.viewed.includes(x.id) ? x.text : 'Toca para descubrir'}</small>
              </button>
            ))}
          </section>
        )}
        {d.stage === 'apply' && (
          <section className="if-form">
            <div className="if-options">
              <h3>{c.prompt}</h3>
              {c.options.map((x) => (
                <button
                  key={x}
                  className={d.choice === x ? 'is-selected' : ''}
                  onClick={() => {
                    setD({ ...d, choice: x });
                    setCue(x);
                  }}
                >
                  {x}
                </button>
              ))}
            </div>
            <label>
              Explica qué revisarías
              <textarea
                value={d.note}
                onChange={(e) => setD({ ...d, note: e.target.value })}
                placeholder="Escribe tu criterio…"
              />
            </label>
          </section>
        )}
        {d.stage === 'check' && (
          <section className="if-options">
            {c.questions.map((q, i) => (
              <div className="if-case" key={q.q}>
                <h3>{q.q}</h3>
                {q.o.map((x, j) => (
                  <button
                    key={x}
                    className={d.answers[i] === j ? 'is-selected' : ''}
                    onClick={() => {
                      setD((v) => ({ ...v, answers: v.answers.map((a, k) => (k === i ? j : a)) }));
                      setCue(j === q.a ? q.feedback : 'Revisa las condiciones antes de concluir.');
                    }}
                  >
                    {x}
                  </button>
                ))}
              </div>
            ))}
          </section>
        )}
        {review && (
          <section className="if-review">
            <span>Resultado revisable</span>
            <h3>{c.reviewTitle}</h3>
            <p>{c.reviewText}</p>
            <p>Tu criterio: {d.note}</p>
          </section>
        )}
      </ActivityFrame>
    </LessonShell>
  );
}
