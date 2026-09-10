import { useEffect, useRef, useState } from 'react';
import LessonShell from '../LessonShell';
import ActivityFrame, {
  ActivityLoadError,
  ActivityLoading,
} from '../../../../module-kit/activities/ActivityFrame';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import '../../../../module-kit/activities/classification.css';
import '../../../../module-kit/activities/investment-foundations.css';

type Stage = 'discover' | 'connect' | 'check' | 'review' | 'complete';
type Draft = {
  version: 1;
  stage: Stage;
  viewed: string[];
  scenario: string | null;
  answers: (number | null)[];
};
const KEY = 'investment_l3:vocabulary:v1';
const initial = (): Draft => ({
  version: 1,
  stage: 'discover',
  viewed: [],
  scenario: null,
  answers: [null, null, null],
});
const TERMS = [
  {
    id: 'return',
    name: 'Rendimiento',
    text: 'Cambio porcentual del valor durante un periodo. Puede ser positivo o negativo.',
  },
  {
    id: 'risk',
    name: 'Riesgo',
    text: 'Posibilidad de que el resultado sea distinto del esperado, incluida una pérdida.',
  },
  {
    id: 'term',
    name: 'Plazo',
    text: 'Tiempo previsto para mantener el dinero antes de necesitarlo.',
  },
  {
    id: 'liquidity',
    name: 'Liquidez',
    text: 'Facilidad, tiempo y condiciones para convertir un activo en dinero disponible.',
  },
  {
    id: 'cost',
    name: 'Costos',
    text: 'Comisiones, impuestos u otros cargos que pueden reducir el resultado.',
  },
];
const CHECK = [
  {
    q: 'Una opción permite retirar rápido, pero cobra por hacerlo. ¿Qué debes revisar?',
    o: ['Solo el rendimiento', 'Liquidez y condiciones', 'Solo el nombre'],
    a: 1,
  },
  {
    q: '¿Qué describe mejor el riesgo?',
    o: ['Una tasa alta', 'Un resultado distinto al esperado', 'Una pérdida segura'],
    a: 1,
  },
  {
    q: 'Te prometen rendimiento alto, fijo y sin riesgo. ¿Qué conviene hacer?',
    o: [
      'Depositar de inmediato',
      'Verificar entidad, condiciones y alertas',
      'Ignorar los documentos',
    ],
    a: 1,
  },
];
function parse(x: unknown): Draft | null {
  if (!x || typeof x !== 'object') return null;
  const v = x as Draft;
  return v.version === 1 &&
    ['discover', 'connect', 'check', 'review', 'complete'].includes(v.stage) &&
    Array.isArray(v.viewed) &&
    Array.isArray(v.answers) &&
    v.answers.length === 3
    ? v
    : null;
}
export default function L03() {
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
  const save = async (next: Draft, final = false) => {
    setBusy(true);
    setError(null);
    try {
      if (final) {
        await lessonDataRepository.saveBatch('inversion', [
          {
            key: 'l03_vocabulary',
            data: {
              scenario: next.scenario,
              answers: next.answers,
              termsViewed: next.viewed,
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
  const score = d.answers.filter((x, i) => x === CHECK[i]!.a).length / 3;
  const review = d.stage === 'review' || d.stage === 'complete';
  if (loading)
    return (
      <LessonShell id="L03" title="Variables de una inversión" completion={{ ready: false }}>
        <ActivityLoading />
      </LessonShell>
    );
  if (failed)
    return (
      <LessonShell id="L03" title="Variables de una inversión" completion={{ ready: false }}>
        <ActivityLoadError
          message="No pudimos recuperar tu avance."
          onRetry={() => setAttempt((x) => x + 1)}
        />
      </LessonShell>
    );
  return (
    <LessonShell
      id="L03"
      title="Variables de una inversión"
      showGreeting={false}
      completion={{ ready: d.stage === 'complete', score }}
    >
      <ActivityFrame
        label="Laboratorio de conceptos"
        className="investment-foundations"
        busy={busy}
        title={
          review
            ? 'Conserva el mapa completo.'
            : d.stage === 'check'
              ? 'Comprueba cómo lees las condiciones.'
              : d.stage === 'connect'
                ? 'Las variables se relacionan, pero no se predicen entre sí.'
                : 'Cinco preguntas antes de comparar.'
        }
        description="Lee rendimiento, riesgo, plazo, liquidez y costos como un conjunto."
        progressLabel="Etapas completadas"
        progressValue={
          d.stage === 'discover' ? 0 : d.stage === 'connect' ? 1 : d.stage === 'check' ? 2 : 3
        }
        progressMax={3}
        stepLabel={
          review
            ? 'Paso 4 de 4 · Revisar'
            : d.stage === 'check'
              ? 'Paso 3 de 4 · Comprobar'
              : d.stage === 'connect'
                ? 'Paso 2 de 4 · Conectar'
                : 'Paso 1 de 4 · Descubrir'
        }
        focusKey={d.stage}
        advice={{
          title: 'Finni lee la letra completa',
          text:
            cue ??
            'Un nivel de riesgo no permite calcular automáticamente un rendimiento ni una liquidez.',
          tone: score === 1 ? 'success' : 'info',
        }}
        adviceCue={cue}
        error={error}
        status={busy ? 'Guardando…' : 'Tu avance está guardado.'}
        actions={
          <div className="if-actions">
            {d.stage === 'discover' && (
              <button
                className="ca-primary"
                disabled={d.viewed.length < 5}
                onClick={() => void save({ ...d, stage: 'connect' })}
              >
                Conectar variables
              </button>
            )}
            {d.stage === 'connect' && (
              <button
                className="ca-primary"
                disabled={!d.scenario}
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
                Revisar mapa
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
            {TERMS.map((t) => (
              <button
                key={t.id}
                className={d.viewed.includes(t.id) ? 'is-viewed' : ''}
                onClick={() => {
                  setD((v) => ({
                    ...v,
                    viewed: v.viewed.includes(t.id) ? v.viewed : [...v.viewed, t.id],
                  }));
                  setCue(t.text);
                }}
              >
                <span>{t.name}</span>
                <small>{d.viewed.includes(t.id) ? t.text : 'Toca para descubrir'}</small>
              </button>
            ))}
          </section>
        )}
        {d.stage === 'connect' && (
          <section className="if-options">
            <h3>Una opción anuncia mayor rendimiento esperado. ¿Qué puedes concluir?</h3>
            {[
              'Que siempre conviene',
              'Que debes revisar las demás variables',
              'Que tendrá poca liquidez',
            ].map((x) => (
              <button
                key={x}
                className={d.scenario === x ? 'is-selected' : ''}
                onClick={() => {
                  setD({ ...d, scenario: x });
                  setCue(
                    x === 'Que debes revisar las demás variables'
                      ? 'Correcto: el anuncio no resuelve riesgo, plazo, liquidez ni costos.'
                      : 'Ese dato no basta para inferir las demás condiciones.',
                  );
                }}
              >
                {x}
              </button>
            ))}
          </section>
        )}
        {d.stage === 'check' && (
          <section className="if-options">
            {CHECK.map((q, i) => (
              <div className="if-case" key={q.q}>
                <h3>{q.q}</h3>
                {q.o.map((x, j) => (
                  <button
                    key={x}
                    className={d.answers[i] === j ? 'is-selected' : ''}
                    onClick={() => {
                      setD((v) => ({ ...v, answers: v.answers.map((a, k) => (k === i ? j : a)) }));
                      setCue(
                        j === q.a
                          ? 'Lectura completa.'
                          : 'Revisa qué variable describe la situación.',
                      );
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
            <span>Mapa de lectura</span>
            <h3>Un porcentaje nunca cuenta toda la historia.</h3>
            <p>Compararé rendimiento, riesgo, plazo, liquidez, costos y documentos verificables.</p>
          </section>
        )}
      </ActivityFrame>
    </LessonShell>
  );
}
