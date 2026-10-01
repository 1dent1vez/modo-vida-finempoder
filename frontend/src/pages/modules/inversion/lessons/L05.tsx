import { useEffect, useRef, useState } from 'react';
import LessonShell from '../LessonShell';
import ActivityFrame, {
  ActivityLoadError,
  ActivityLoading,
} from '../../../../module-kit/activities/ActivityFrame';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import '../../../../module-kit/activities/classification.css';
import '../../../../module-kit/activities/investment-foundations.css';
type Stage = 'map' | 'compare' | 'check' | 'review' | 'complete';
type Draft = {
  version: 1;
  stage: Stage;
  viewed: string[];
  selected: string[];
  answers: (number | null)[];
};
const KEY = 'investment_l5:instrument-map:v1';
const initial = (): Draft => ({
  version: 1,
  stage: 'map',
  viewed: [],
  selected: [],
  answers: [null, null, null],
});
const ITEMS = [
  {
    id: 'debt',
    name: 'Deuda',
    desc: 'Representa una obligación de pago del emisor. Debes revisar quién emite, plazo, tasa, liquidez y riesgo de incumplimiento.',
  },
  {
    id: 'equity',
    name: 'Participación',
    desc: 'Representa propiedad o exposición a activos cuyo valor puede subir o bajar. No promete recuperar el capital.',
  },
  {
    id: 'fund',
    name: 'Fondo colectivo',
    desc: 'Agrupa recursos bajo una estrategia. Debes revisar cartera, administración, costos, valuación y retiros.',
  },
  {
    id: 'real',
    name: 'Activo real listado',
    desc: 'Puede dar exposición a inmuebles u otros activos mediante valores negociables; conserva riesgos de mercado y operación.',
  },
];
const Q = [
  {
    q: '¿Qué permite comparar instrumentos de familias distintas?',
    o: ['El color de la app', 'Riesgo, plazo, liquidez, costos y documentos', 'Solo el mínimo'],
    a: 1,
  },
  {
    q: 'Un fondo colectivo…',
    o: ['Siempre es de bajo riesgo', 'Puede seguir estrategias distintas', 'Garantiza ganancias'],
    a: 1,
  },
  {
    q: '¿Dónde confirmas datos vigentes?',
    o: [
      'En una captura antigua',
      'En documentos oficiales y registros aplicables',
      'En publicidad',
    ],
    a: 1,
  },
];
function parse(x: unknown): Draft | null {
  if (!x || typeof x !== 'object') return null;
  const v = x as Draft;
  return v.version === 1 &&
    ['map', 'compare', 'check', 'review', 'complete'].includes(v.stage) &&
    Array.isArray(v.viewed) &&
    Array.isArray(v.selected) &&
    Array.isArray(v.answers)
    ? v
    : null;
}
export default function L05() {
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
            key: 'l05_instrument_map',
            data: {
              familiesCompared: n.selected,
              answers: n.answers,
            },
          },
          { key: KEY, data: n },
        ]);
      } else {
        await lessonDataRepository.save('inversion', KEY, n);
      }
      if (mounted.current) setD(n);
    } catch {
      if (mounted.current) setError('No pudimos guardar. Tu mapa sigue en pantalla.');
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  const score = d.answers.filter((x, i) => x === Q[i]!.a).length / 3;
  const review = d.stage === 'review' || d.stage === 'complete';
  if (loading)
    return (
      <LessonShell id="L05" title="Familias de instrumentos" completion={{ ready: false }}>
        <ActivityLoading />
      </LessonShell>
    );
  if (failed)
    return (
      <LessonShell id="L05" title="Familias de instrumentos" completion={{ ready: false }}>
        <ActivityLoadError
          message="No pudimos recuperar tu avance."
          onRetry={() => setAttempt((x) => x + 1)}
        />
      </LessonShell>
    );
  return (
    <LessonShell
      id="L05"
      title="Familias de instrumentos"
      showGreeting={false}
      completion={{ ready: d.stage === 'complete', score }}
    >
      <ActivityFrame
        label="Mapa de instrumentos"
        className="investment-foundations"
        busy={busy}
        title={
          review
            ? 'Conserva un método de comparación.'
            : d.stage === 'check'
              ? 'Reconoce sin memorizar marcas.'
              : d.stage === 'compare'
                ? 'Compara familias con la misma regla.'
                : 'Primero entiende la estructura.'
        }
        description="Explora familias de instrumentos sin convertir ejemplos en recomendaciones."
        progressLabel="Etapas completadas"
        progressValue={
          d.stage === 'map' ? 0 : d.stage === 'compare' ? 1 : d.stage === 'check' ? 2 : 3
        }
        progressMax={3}
        stepLabel={
          review
            ? 'Paso 4 de 4 · Revisar'
            : d.stage === 'check'
              ? 'Paso 3 de 4 · Comprobar'
              : d.stage === 'compare'
                ? 'Paso 2 de 4 · Comparar'
                : 'Paso 1 de 4 · Explorar'
        }
        focusKey={d.stage}
        advice={{
          title: 'Finni evita etiquetas rápidas',
          text:
            cue ??
            'Una familia no tiene un nivel fijo de riesgo, rendimiento o liquidez. Las condiciones específicas importan.',
          tone: score === 1 ? 'success' : 'info',
        }}
        adviceCue={cue}
        error={error}
        status={busy ? 'Guardando…' : 'Tu avance está guardado.'}
        actions={
          <div className="if-actions">
            {d.stage === 'map' && (
              <button
                className="ca-primary"
                disabled={d.viewed.length < 4}
                onClick={() => void save({ ...d, stage: 'compare' })}
              >
                Comparar dos familias
              </button>
            )}
            {d.stage === 'compare' && (
              <button
                className="ca-primary"
                disabled={d.selected.length !== 2}
                onClick={() => void save({ ...d, stage: 'check' })}
              >
                Comprobar lectura
              </button>
            )}
            {d.stage === 'check' && (
              <button
                className="ca-primary"
                disabled={d.answers.some((x) => x === null)}
                onClick={() => void save({ ...d, stage: 'review' })}
              >
                Revisar método
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
        {d.stage === 'map' && (
          <section className="if-grid">
            {ITEMS.map((x) => (
              <button
                key={x.id}
                className={d.viewed.includes(x.id) ? 'is-viewed' : ''}
                onClick={() => {
                  setD((v) => ({
                    ...v,
                    viewed: v.viewed.includes(x.id) ? v.viewed : [...v.viewed, x.id],
                  }));
                  setCue(x.desc);
                }}
              >
                <span>{x.name}</span>
                <small>{d.viewed.includes(x.id) ? x.desc : 'Toca para descubrir'}</small>
              </button>
            ))}
          </section>
        )}
        {d.stage === 'compare' && (
          <section className="if-options">
            <h3>Elige dos familias</h3>
            {ITEMS.map((x) => (
              <button
                key={x.id}
                className={d.selected.includes(x.id) ? 'is-selected' : ''}
                onClick={() =>
                  setD((v) => ({
                    ...v,
                    selected: v.selected.includes(x.id)
                      ? v.selected.filter((y) => y !== x.id)
                      : v.selected.length < 2
                        ? [...v.selected, x.id]
                        : [v.selected[1]!, x.id],
                  }))
                }
              >
                {x.name}
              </button>
            ))}
            {d.selected.length === 2 && (
              <div className="if-review">
                <p>
                  Para ambas revisarás emisor, riesgo, plazo, liquidez, costos, valuación y
                  documentos vigentes.
                </p>
              </div>
            )}
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
                      setCue(j === q.a ? 'Lectura completa.' : 'Revisa el criterio común.');
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
            <span>Método guardable</span>
            <h3>Compararé condiciones, no etiquetas.</h3>
            <p>Confirmaré datos vigentes en documentos oficiales y registros aplicables.</p>
          </section>
        )}
      </ActivityFrame>
    </LessonShell>
  );
}
