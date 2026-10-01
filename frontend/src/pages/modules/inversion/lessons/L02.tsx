import { useEffect, useRef, useState } from 'react';
import LessonShell from '../LessonShell';
import ActivityFrame, {
  ActivityLoadError,
  ActivityLoading,
} from '../../../../module-kit/activities/ActivityFrame';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import '../../../../module-kit/activities/classification.css';
import '../../../../module-kit/activities/investment-foundations.css';

type Stage = 'compare' | 'practice' | 'apply' | 'review' | 'complete';
type Draft = {
  version: 1;
  stage: Stage;
  viewed: string[];
  answers: (number | null)[];
  goal: string;
  priority: string | null;
};
const KEY = 'investment_l2:compare:v1';
const initial = (): Draft => ({
  version: 1,
  stage: 'compare',
  viewed: [],
  answers: [null, null, null],
  goal: '',
  priority: null,
});
const CRITERIA = [
  ['Disponibilidad', '¿Cuándo necesitas usar el dinero?'],
  ['Incertidumbre', '¿Cuánta variación puedes asumir?'],
  ['Condiciones', '¿Qué costos, restricciones y protecciones aplican?'],
  ['Propósito', '¿Buscas disponibilidad o aceptar incertidumbre por un rendimiento posible?'],
];
const CASES = [
  {
    q: 'El dinero cubre una reparación inesperada y debe estar disponible.',
    a: 0,
    opts: ['Priorizar disponibilidad', 'Aceptar variación'],
    why: 'La necesidad inmediata vuelve central la disponibilidad.',
  },
  {
    q: 'Una meta no tiene fecha fija y la persona acepta que el valor pueda bajar.',
    a: 1,
    opts: ['Solo importa el plazo', 'Comparar alternativas y riesgos'],
    why: 'El plazo por sí solo no decide; también cuentan riesgo, liquidez y condiciones.',
  },
  {
    q: 'Dos opciones anuncian el mismo rendimiento.',
    a: 1,
    opts: ['Son equivalentes', 'Falta comparar costos y condiciones'],
    why: 'Un porcentaje aislado no permite decidir.',
  },
];
function parse(x: unknown): Draft | null {
  if (!x || typeof x !== 'object') return null;
  const v = x as Draft;
  return v.version === 1 &&
    ['compare', 'practice', 'apply', 'review', 'complete'].includes(v.stage) &&
    Array.isArray(v.viewed) &&
    Array.isArray(v.answers) &&
    v.answers.length === 3 &&
    typeof v.goal === 'string'
    ? v
    : null;
}
export default function L02() {
  const [d, setD] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cue, setCue] = useState<string | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    setLoading(true);
    setLoadError(false);
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
          setLoadError(true);
        }
      });
    return () => {
      mounted.current = false;
    };
  }, [attempt]);
  const save = async (next: Draft, final = false) => {
    setBusy(true);
    setError(null);
    try {
      if (final) {
        await lessonDataRepository.saveBatch('inversion', [
          {
            key: 'l02_comparison',
            data: {
              goal: next.goal,
              priority: next.priority,
              answers: next.answers,
            },
          },
          { key: KEY, data: next },
        ]);
      } else {
        await lessonDataRepository.save('inversion', KEY, next);
      }
      if (mounted.current) setD(next);
    } catch {
      if (mounted.current) setError('No pudimos guardar. Tus respuestas siguen en pantalla.');
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  const correct = d.answers.filter((x, i) => x === CASES[i]!.a).length;
  const review = d.stage === 'review' || d.stage === 'complete';
  if (loading)
    return (
      <LessonShell id="L02" title="Ahorro e inversión" completion={{ ready: false }}>
        <ActivityLoading />
      </LessonShell>
    );
  if (loadError)
    return (
      <LessonShell id="L02" title="Ahorro e inversión" completion={{ ready: false }}>
        <ActivityLoadError
          message="No pudimos recuperar tu avance."
          onRetry={() => setAttempt((x) => x + 1)}
        />
      </LessonShell>
    );
  return (
    <LessonShell
      id="L02"
      title="Ahorro e inversión"
      showGreeting={false}
      completion={{ ready: d.stage === 'complete', score: correct / 3 }}
    >
      <ActivityFrame
        label="Comparador de decisiones"
        busy={busy}
        className="investment-foundations"
        title={
          review
            ? 'Conserva tus criterios.'
            : d.stage === 'apply'
              ? 'Aplica sin convertirlo en recomendación.'
              : d.stage === 'practice'
                ? 'Decide con contexto.'
                : 'No existe una frontera universal.'
        }
        description="Compara disponibilidad, incertidumbre, propósito y condiciones antes de elegir."
        progressLabel="Etapas completadas"
        progressValue={
          d.stage === 'compare' ? 0 : d.stage === 'practice' ? 1 : d.stage === 'apply' ? 2 : 3
        }
        progressMax={3}
        stepLabel={
          review
            ? 'Paso 4 de 4 · Revisar'
            : d.stage === 'apply'
              ? 'Paso 3 de 4 · Aplicar'
              : d.stage === 'practice'
                ? 'Paso 2 de 4 · Practicar'
                : 'Paso 1 de 4 · Comparar'
        }
        focusKey={d.stage}
        advice={{
          title: 'Finni compara condiciones',
          text: cue ?? 'El nombre del producto no sustituye revisar sus condiciones.',
          tone: correct === 3 ? 'success' : 'info',
        }}
        adviceCue={cue}
        error={error}
        status={busy ? 'Guardando…' : 'Tu avance está guardado.'}
        actions={
          <div className="if-actions">
            {d.stage === 'compare' && (
              <button
                className="ca-primary"
                disabled={d.viewed.length < 4}
                onClick={() => void save({ ...d, stage: 'practice' })}
              >
                Practicar decisiones
              </button>
            )}
            {d.stage === 'practice' && (
              <button
                className="ca-primary"
                disabled={d.answers.some((x) => x === null)}
                onClick={() => void save({ ...d, stage: 'apply' })}
              >
                Aplicar a una meta
              </button>
            )}
            {d.stage === 'apply' && (
              <button
                className="ca-primary"
                disabled={d.goal.trim().length < 5 || !d.priority}
                onClick={() => void save({ ...d, stage: 'review' })}
              >
                Revisar criterios
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
        {d.stage === 'compare' && (
          <section className="if-grid">
            {CRITERIA.map(([name, text]) => (
              <button
                key={name}
                className={d.viewed.includes(name) ? 'is-viewed' : ''}
                onClick={() => {
                  setD((v) => ({
                    ...v,
                    viewed: v.viewed.includes(name) ? v.viewed : [...v.viewed, name],
                  }));
                  setCue(text);
                }}
              >
                <span>{name}</span>
                <small>{d.viewed.includes(name) ? text : 'Toca para descubrir'}</small>
              </button>
            ))}
          </section>
        )}
        {d.stage === 'practice' && (
          <section className="if-options">
            {CASES.map((c, i) => (
              <div className="if-case" key={c.q}>
                <h3>{c.q}</h3>
                {c.opts.map((o, j) => (
                  <button
                    key={o}
                    className={d.answers[i] === j ? 'is-selected' : ''}
                    onClick={() => {
                      setD((v) => ({ ...v, answers: v.answers.map((x, k) => (k === i ? j : x)) }));
                      setCue(c.why);
                    }}
                  >
                    {o}
                  </button>
                ))}
              </div>
            ))}
          </section>
        )}
        {d.stage === 'apply' && (
          <section className="if-form">
            <label>
              Describe una meta
              <input
                value={d.goal}
                onChange={(e) => setD({ ...d, goal: e.target.value })}
                placeholder="Ej. una meta flexible"
              />
            </label>
            <div className="if-options">
              <h3>¿Qué condición pesa más hoy?</h3>
              {[
                'Disponibilidad',
                'Evitar variaciones',
                'Aceptar variaciones',
                'Todavía necesito investigar',
              ].map((x) => (
                <button
                  key={x}
                  className={d.priority === x ? 'is-selected' : ''}
                  onClick={() => setD({ ...d, priority: x })}
                >
                  {x}
                </button>
              ))}
            </div>
          </section>
        )}
        {review && (
          <section className="if-review">
            <span>Mi comparación</span>
            <h3>{d.goal}</h3>
            <p>
              Prioridad actual: {d.priority}. Revisaré plazo, liquidez, riesgo, costos y
              condiciones.
            </p>
          </section>
        )}
      </ActivityFrame>
    </LessonShell>
  );
}
