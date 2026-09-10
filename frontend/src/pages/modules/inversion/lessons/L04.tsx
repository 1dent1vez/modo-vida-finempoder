import { useEffect, useMemo, useRef, useState } from 'react';
import LessonShell from '../LessonShell';
import ActivityFrame, {
  ActivityLoadError,
  ActivityLoading,
} from '../../../../module-kit/activities/ActivityFrame';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import '../../../../module-kit/activities/classification.css';
import '../../../../module-kit/activities/investment-foundations.css';

type Stage = 'reflect' | 'estimate' | 'stress' | 'review' | 'complete';
type Draft = {
  version: 1;
  stage: Stage;
  checks: (string | null)[];
  income: number;
  essentials: number;
  commitments: number;
  reserve: number;
  stress: string | null;
  note: string;
};
const KEY = 'investment_l4:capacity:v1';
const initial = (): Draft => ({
  version: 1,
  stage: 'reflect',
  checks: [null, null, null],
  income: 5000,
  essentials: 3200,
  commitments: 900,
  reserve: 500,
  stress: null,
  note: '',
});
const QUESTIONS = [
  '¿Tus gastos esenciales del periodo están cubiertos?',
  '¿Separaste obligaciones y deudas próximas?',
  '¿Tienes acceso a dinero para una urgencia?',
];
function parse(x: unknown): Draft | null {
  if (!x || typeof x !== 'object') return null;
  const v = x as Draft;
  return v.version === 1 &&
    ['reflect', 'estimate', 'stress', 'review', 'complete'].includes(v.stage) &&
    Array.isArray(v.checks) &&
    v.checks.length === 3 &&
    [v.income, v.essentials, v.commitments, v.reserve].every(Number.isFinite) &&
    typeof v.note === 'string'
    ? v
    : null;
}
const money = (x: number) => Math.max(0, Math.round(x)).toLocaleString('es-MX');
export default function L04() {
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
  const available = useMemo(
    () => Math.max(0, d.income - d.essentials - d.commitments - d.reserve),
    [d],
  );
  const save = async (next: Draft, final = false) => {
    setBusy(true);
    setError(null);
    try {
      if (final) {
        await lessonDataRepository.saveBatch('inversion', [
          {
            key: 'l04_capacity',
            data: {
              selfCheck: next.checks,
              monthlyEstimate: {
                income: next.income,
                essentials: next.essentials,
                commitments: next.commitments,
                reserve: next.reserve,
                remainder: available,
              },
              stressResponse: next.stress,
              note: next.note,
            },
          },
          { key: KEY, data: next },
        ]);
      } else {
        await lessonDataRepository.save('inversion', KEY, next);
      }
      if (mounted.current) setD(next);
    } catch {
      if (mounted.current) setError('No pudimos guardar. Tus datos siguen en pantalla.');
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  const review = d.stage === 'review' || d.stage === 'complete';
  const caution =
    d.checks.includes('no') || d.checks.includes('unsure') || d.stress === 'Necesitaría retirarlo';
  if (loading)
    return (
      <LessonShell id="L04" title="Capacidad antes de invertir" completion={{ ready: false }}>
        <ActivityLoading />
      </LessonShell>
    );
  if (failed)
    return (
      <LessonShell id="L04" title="Capacidad antes de invertir" completion={{ ready: false }}>
        <ActivityLoadError
          message="No pudimos recuperar tu avance."
          onRetry={() => setAttempt((x) => x + 1)}
        />
      </LessonShell>
    );
  return (
    <LessonShell
      id="L04"
      title="Capacidad antes de invertir"
      showGreeting={false}
      completion={{ ready: d.stage === 'complete' }}
    >
      <ActivityFrame
        label="Autoevaluación de capacidad"
        className="investment-foundations"
        busy={busy}
        title={
          review
            ? 'Guarda una fotografía, no un permiso.'
            : d.stage === 'stress'
              ? 'Prueba el resultado con una caída.'
              : d.stage === 'estimate'
                ? 'Estima sin convertir el sobrante en recomendación.'
                : 'Primero revisa tu estabilidad cotidiana.'
        }
        description="Ordena compromisos y observa tu margen sin declarar si debes invertir."
        progressLabel="Etapas completadas"
        progressValue={
          d.stage === 'reflect' ? 0 : d.stage === 'estimate' ? 1 : d.stage === 'stress' ? 2 : 3
        }
        progressMax={3}
        stepLabel={
          review
            ? 'Paso 4 de 4 · Revisar'
            : d.stage === 'stress'
              ? 'Paso 3 de 4 · Probar'
              : d.stage === 'estimate'
                ? 'Paso 2 de 4 · Estimar'
                : 'Paso 1 de 4 · Reflexionar'
        }
        focusKey={d.stage}
        advice={{
          title: caution ? 'Finni detecta una tensión' : 'Finni mantiene abierta la decisión',
          text:
            cue ??
            (caution
              ? 'Tu respuesta sugiere que conviene revisar liquidez, obligaciones o reserva antes de comprometer dinero.'
              : 'Un remanente matemático no demuestra por sí solo que invertir sea adecuado.'),
          tone: caution ? 'review' : 'info',
        }}
        adviceCue={cue}
        error={error}
        status={busy ? 'Guardando…' : 'Tu avance está guardado.'}
        actions={
          <div className="if-actions">
            {d.stage === 'reflect' && (
              <button
                className="ca-primary"
                disabled={d.checks.some((x) => x === null)}
                onClick={() => void save({ ...d, stage: 'estimate' })}
              >
                Estimar margen
              </button>
            )}
            {d.stage === 'estimate' && (
              <button className="ca-primary" onClick={() => void save({ ...d, stage: 'stress' })}>
                Probar un imprevisto
              </button>
            )}
            {d.stage === 'stress' && (
              <button
                className="ca-primary"
                disabled={!d.stress || d.note.trim().length < 5}
                onClick={() => void save({ ...d, stage: 'review' })}
              >
                Revisar fotografía
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
        {d.stage === 'reflect' && (
          <section className="if-options">
            {QUESTIONS.map((q, i) => (
              <div className="if-case" key={q}>
                <h3>{q}</h3>
                {[
                  ['Sí', 'yes'],
                  ['No', 'no'],
                  ['No estoy seguro', 'unsure'],
                ].map(([label, value]) => (
                  <button
                    key={value}
                    className={d.checks[i] === value ? 'is-selected' : ''}
                    onClick={() => {
                      setD((v) => ({
                        ...v,
                        checks: v.checks.map((a, k) => (k === i ? value : a)),
                      }));
                      setCue(q);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ))}
          </section>
        )}
        {d.stage === 'estimate' && (
          <section className="if-form">
            {[
              ['Ingreso del periodo', 'income'],
              ['Gastos esenciales', 'essentials'],
              ['Obligaciones y deudas', 'commitments'],
              ['Aporte a reserva', 'reserve'],
            ].map(([label, key]) => (
              <label key={key}>
                {label}
                <input
                  type="number"
                  min="0"
                  value={d[key as keyof Draft] as number}
                  onChange={(e) => setD({ ...d, [key]: Math.max(0, Number(e.target.value)) })}
                />
              </label>
            ))}
            <div className="if-result">
              <span>Remanente estimado</span>
              <strong>${money(available)}</strong>
              <small>Es una resta educativa; no es capital recomendado para invertir.</small>
            </div>
          </section>
        )}
        {d.stage === 'stress' && (
          <section className="if-form">
            <div className="if-options">
              <h3>Si ese dinero bajara 20% y surgiera un gasto inesperado…</h3>
              {['Podría mantenerlo', 'Necesitaría retirarlo', 'No lo sé todavía'].map((x) => (
                <button
                  key={x}
                  className={d.stress === x ? 'is-selected' : ''}
                  onClick={() => {
                    setD({ ...d, stress: x });
                    setCue(x);
                  }}
                >
                  {x}
                </button>
              ))}
            </div>
            <label>
              ¿Qué revisarías antes de decidir?
              <textarea
                value={d.note}
                onChange={(e) => setD({ ...d, note: e.target.value })}
                placeholder="Liquidez, deudas, reserva, documentos…"
              />
            </label>
          </section>
        )}
        {review && (
          <section className="if-review">
            <span>Fotografía personal</span>
            <h3>Remanente estimado: ${money(available)}</h3>
            <p>
              {caution
                ? 'Detectaste una condición que merece revisión antes de comprometer dinero.'
                : 'No detectaste una tensión inmediata en este ejercicio; aún debes investigar riesgos y condiciones.'}
            </p>
            <p>{d.note}</p>
          </section>
        )}
      </ActivityFrame>
    </LessonShell>
  );
}
