import { useEffect, useRef, useState } from 'react';
import LessonShell from '../LessonShell';
import ActivityFrame, {
  ActivityLoadError,
  ActivityLoading,
} from '../../../../module-kit/activities/ActivityFrame';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import '../../../../module-kit/activities/classification.css';
import '../../../../module-kit/activities/investment-foundations.css';
type Stage = 'model' | 'inspect' | 'check' | 'review' | 'complete';
type Draft = {
  version: 1;
  stage: Stage;
  viewed: string[];
  choice: string | null;
  answers: (number | null)[];
  question: string;
};
const KEY = 'investment_l7:collective-vs-direct:v1';
const initial = (): Draft => ({
  version: 1,
  stage: 'model',
  viewed: [],
  choice: null,
  answers: [null, null, null],
  question: '',
});
const MODELS = [
  {
    id: 'fund',
    name: 'Vehículo colectivo',
    text: 'Un administrador ejecuta una estrategia con recursos de varias personas. Revisa mandato, cartera, costos, valuación y retiros.',
  },
  {
    id: 'direct',
    name: 'Participación directa',
    text: 'La persona elige valores específicos y asume la gestión de selección, concentración, costos y seguimiento.',
  },
];
const Q = [
  {
    q: '¿Un vehículo colectivo elimina el riesgo?',
    o: ['Sí', 'No; depende de su estrategia y activos'],
    a: 1,
  },
  {
    q: '¿Qué reduce la concentración?',
    o: ['Distribuir exposición entre distintos activos', 'Comprar una sola empresa'],
    a: 0,
  },
  {
    q: '¿Una plataforma disponible hoy garantiza regulación futura?',
    o: ['Sí', 'No; hay que verificar registros vigentes'],
    a: 1,
  },
];
function parse(x: unknown): Draft | null {
  if (!x || typeof x !== 'object') return null;
  const v = x as Draft;
  return v.version === 1 &&
    ['model', 'inspect', 'check', 'review', 'complete'].includes(v.stage) &&
    Array.isArray(v.viewed) &&
    Array.isArray(v.answers) &&
    typeof v.question === 'string'
    ? v
    : null;
}
export default function L07() {
  const [d, setD] = useState(initial);
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
      .load('inversion', KEY)
      .then((x) => {
        if (mounted.current) {
          setD(parse(x) ?? initial());
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
  }, [attempt]);
  const save = async (n: Draft, final = false) => {
    setBusy(true);
    setError(null);
    try {
      if (final) {
        await lessonDataRepository.saveBatch('inversion', [
          {
            key: 'l07_models',
            data: {
              modelToInvestigate: n.choice,
              answers: n.answers,
              question: n.question,
            },
          },
          { key: KEY, data: n },
        ]);
      } else {
        await lessonDataRepository.save('inversion', KEY, n);
      }
      if (mounted.current) setD(n);
    } catch {
      if (mounted.current) setError('No pudimos guardar. Tu análisis sigue en pantalla.');
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  const score = d.answers.filter((x, i) => x === Q[i]!.a).length / 3;
  const review = d.stage === 'review' || d.stage === 'complete';
  if (loading)
    return (
      <LessonShell
        id="L07"
        title="Vehículos colectivos y participación directa"
        completion={{ ready: false }}
      >
        <ActivityLoading />
      </LessonShell>
    );
  if (failed)
    return (
      <LessonShell
        id="L07"
        title="Vehículos colectivos y participación directa"
        completion={{ ready: false }}
      >
        <ActivityLoadError
          message="No pudimos recuperar tu avance."
          onRetry={() => setAttempt((x) => x + 1)}
        />
      </LessonShell>
    );
  return (
    <LessonShell
      id="L07"
      title="Vehículos colectivos y participación directa"
      showGreeting={false}
      completion={{ ready: d.stage === 'complete', score }}
    >
      <ActivityFrame
        label="Comparador de modelos"
        className="investment-foundations"
        busy={busy}
        title={
          review
            ? 'Conserva una pregunta para investigar.'
            : d.stage === 'check'
              ? 'Comprueba las diferencias.'
              : d.stage === 'inspect'
                ? 'Mira dentro antes de elegir.'
                : 'Dos maneras de obtener exposición.'
        }
        description="Compara gestión colectiva y selección directa sin promocionar plataformas."
        progressLabel="Etapas completadas"
        progressValue={
          d.stage === 'model' ? 0 : d.stage === 'inspect' ? 1 : d.stage === 'check' ? 2 : 3
        }
        progressMax={3}
        stepLabel={
          review
            ? 'Paso 4 de 4 · Revisar'
            : d.stage === 'check'
              ? 'Paso 3 de 4 · Comprobar'
              : d.stage === 'inspect'
                ? 'Paso 2 de 4 · Investigar'
                : 'Paso 1 de 4 · Comparar'
        }
        focusKey={d.stage}
        advice={{
          title: 'Finni pregunta qué hay dentro',
          text:
            cue ??
            '“Fondo”, “acción” o “plataforma” no describen por sí solos diversificación, costos, liquidez ni regulación.',
          tone: score === 1 ? 'success' : 'info',
        }}
        adviceCue={cue}
        error={error}
        status={busy ? 'Guardando…' : 'Tu avance está guardado.'}
        actions={
          <div className="if-actions">
            {d.stage === 'model' && (
              <button
                className="ca-primary"
                disabled={d.viewed.length < 2}
                onClick={() => void save({ ...d, stage: 'inspect' })}
              >
                Preparar investigación
              </button>
            )}
            {d.stage === 'inspect' && (
              <button
                className="ca-primary"
                disabled={!d.choice || d.question.trim().length < 5}
                onClick={() => void save({ ...d, stage: 'check' })}
              >
                Comprobar diferencias
              </button>
            )}
            {d.stage === 'check' && (
              <button
                className="ca-primary"
                disabled={d.answers.some((x) => x === null)}
                onClick={() => void save({ ...d, stage: 'review' })}
              >
                Revisar análisis
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
        {d.stage === 'model' && (
          <section className="if-grid">
            {MODELS.map((x) => (
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
        {d.stage === 'inspect' && (
          <section className="if-form">
            <div className="if-options">
              <h3>¿Qué modelo quieres investigar?</h3>
              {MODELS.map((x) => (
                <button
                  key={x.id}
                  className={d.choice === x.id ? 'is-selected' : ''}
                  onClick={() => setD({ ...d, choice: x.id })}
                >
                  {x.name}
                </button>
              ))}
            </div>
            <label>
              Escribe una pregunta para comparar
              <input
                value={d.question}
                onChange={(e) => setD({ ...d, question: e.target.value })}
                placeholder="Ej. ¿Qué costos y activos contiene?"
              />
            </label>
          </section>
        )}
        {d.stage === 'check' && (
          <section className="if-options">
            {Q.map((q, i) => (
              <div className="if-case" key={q.q}>
                <h3>{q.q}</h3>
                {q.o.map((x, j) => (
                  <button
                    key={x}
                    className={d.answers[i] === j ? 'is-selected' : ''}
                    onClick={() => {
                      setD((v) => ({ ...v, answers: v.answers.map((a, k) => (k === i ? j : a)) }));
                      setCue(j === q.a ? 'Correcto.' : 'Revisa el alcance de esa afirmación.');
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
            <span>Pregunta guardada</span>
            <h3>{d.question}</h3>
            <p>
              Verificaré estrategia, activos, concentración, costos, liquidez y registro vigente
              antes de elegir.
            </p>
          </section>
        )}
      </ActivityFrame>
    </LessonShell>
  );
}
