import { useEffect, useMemo, useRef, useState } from 'react';
import LessonShell from '../LessonShell';
import ActivityFrame, {
  ActivityLoadError,
  ActivityLoading,
} from '../../../../module-kit/activities/ActivityFrame';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import { LessonRange } from '../../../../module-kit/components/activities';
import '../../../../module-kit/activities/classification.css';
import '../../../../module-kit/activities/investment-foundations.css';
type Stage = 'read' | 'simulate' | 'verify' | 'review' | 'complete';
type Draft = {
  version: 1;
  stage: Stage;
  viewed: string[];
  amount: number;
  days: number;
  rate: number;
  checks: string[];
};
const KEY = 'investment_l6:debt-sheet:v1';
const initial = (): Draft => ({
  version: 1,
  stage: 'read',
  viewed: [],
  amount: 1000,
  days: 90,
  rate: 8,
  checks: [],
});
const FIELDS = [
  ['Emisor', '¿Quién asume la obligación de pago?'],
  ['Plazo', '¿Cuándo vence y qué pasa si necesitas salir antes?'],
  ['Tasa', '¿Es fija, variable, bruta, neta o solo una referencia?'],
  ['Costos e impuestos', '¿Qué reduce el resultado estimado?'],
  ['Liquidez', '¿Cómo y cuándo puedes recuperar el dinero?'],
  ['Riesgos', '¿Qué escenarios pueden cambiar el resultado?'],
];
function parse(x: unknown): Draft | null {
  if (!x || typeof x !== 'object') return null;
  const v = x as Draft;
  return v.version === 1 &&
    ['read', 'simulate', 'verify', 'review', 'complete'].includes(v.stage) &&
    Array.isArray(v.viewed) &&
    Array.isArray(v.checks) &&
    [v.amount, v.days, v.rate].every(Number.isFinite)
    ? v
    : null;
}
export default function L06() {
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
  const gross = useMemo(() => d.amount * (d.rate / 100) * (d.days / 365), [d]);
  const save = async (n: Draft, final = false) => {
    setBusy(true);
    setError(null);
    try {
      if (final) {
        await lessonDataRepository.saveBatch('inversion', [
          {
            key: 'l06_debt_reading',
            data: {
              hypotheticalScenario: {
                amount: n.amount,
                days: n.days,
                annualRate: n.rate,
                grossEstimate: gross,
              },
              verification: n.checks,
            },
          },
          { key: KEY, data: n },
        ]);
      } else {
        await lessonDataRepository.save('inversion', KEY, n);
      }
      if (mounted.current) setD(n);
    } catch {
      if (mounted.current) setError('No pudimos guardar. El escenario sigue en pantalla.');
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  const review = d.stage === 'review' || d.stage === 'complete';
  if (loading)
    return (
      <LessonShell id="L06" title="Cómo leer un instrumento de deuda" completion={{ ready: false }}>
        <ActivityLoading />
      </LessonShell>
    );
  if (failed)
    return (
      <LessonShell id="L06" title="Cómo leer un instrumento de deuda" completion={{ ready: false }}>
        <ActivityLoadError
          message="No pudimos recuperar tu avance."
          onRetry={() => setAttempt((x) => x + 1)}
        />
      </LessonShell>
    );
  return (
    <LessonShell
      id="L06"
      title="Cómo leer un instrumento de deuda"
      showGreeting={false}
      completion={{ ready: d.stage === 'complete' }}
    >
      <ActivityFrame
        label="Lector de ficha"
        className="investment-foundations"
        busy={busy}
        title={
          review
            ? 'Guarda la lista de verificación.'
            : d.stage === 'verify'
              ? 'Separa cálculo y contratación.'
              : d.stage === 'simulate'
                ? 'Usa supuestos editables.'
                : 'Una ficha clara empieza con preguntas.'
        }
        description="Aprende a leer deuda sin depender de tasas, mínimos o plataformas que pueden cambiar."
        progressLabel="Etapas completadas"
        progressValue={
          d.stage === 'read' ? 0 : d.stage === 'simulate' ? 1 : d.stage === 'verify' ? 2 : 3
        }
        progressMax={3}
        stepLabel={
          review
            ? 'Paso 4 de 4 · Revisar'
            : d.stage === 'verify'
              ? 'Paso 3 de 4 · Verificar'
              : d.stage === 'simulate'
                ? 'Paso 2 de 4 · Simular'
                : 'Paso 1 de 4 · Leer'
        }
        focusKey={d.stage}
        advice={{
          title: 'Finni distingue estimación y oferta',
          text:
            cue ??
            'La simulación usa interés simple y no incluye impuestos, comisiones, reinversión ni cambios de tasa.',
          tone: d.checks.length === 3 ? 'success' : 'info',
        }}
        adviceCue={cue}
        error={error}
        status={busy ? 'Guardando…' : 'Tu avance está guardado.'}
        actions={
          <div className="if-actions">
            {d.stage === 'read' && (
              <button
                className="ca-primary"
                disabled={d.viewed.length < 6}
                onClick={() => void save({ ...d, stage: 'simulate' })}
              >
                Abrir simulador
              </button>
            )}
            {d.stage === 'simulate' && (
              <button className="ca-primary" onClick={() => void save({ ...d, stage: 'verify' })}>
                Preparar verificación
              </button>
            )}
            {d.stage === 'verify' && (
              <button
                className="ca-primary"
                disabled={d.checks.length < 3}
                onClick={() => void save({ ...d, stage: 'review' })}
              >
                Revisar ficha
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
        {d.stage === 'read' && (
          <section className="if-grid">
            {FIELDS.map(([x, t]) => (
              <button
                key={x}
                className={d.viewed.includes(x) ? 'is-viewed' : ''}
                onClick={() => {
                  setD((v) => ({
                    ...v,
                    viewed: v.viewed.includes(x) ? v.viewed : [...v.viewed, x],
                  }));
                  setCue(t);
                }}
              >
                <span>{x}</span>
                <small>{d.viewed.includes(x) ? t : 'Toca para descubrir'}</small>
              </button>
            ))}
          </section>
        )}
        {d.stage === 'simulate' && (
          <section className="if-simulator">
            <LessonRange
              label="Monto hipotético"
              display={`$${d.amount.toLocaleString('es-MX')}`}
              min={100}
              max={10000}
              step={100}
              value={d.amount}
              onChange={(amount) => setD({ ...d, amount })}
            />
            <LessonRange
              label="Plazo hipotético"
              display={`${d.days} días`}
              min={30}
              max={365}
              step={5}
              value={d.days}
              onChange={(days) => setD({ ...d, days })}
            />
            <LessonRange
              label="Tasa anual hipotética"
              display={`${d.rate}%`}
              min={0}
              max={20}
              value={d.rate}
              onChange={(rate) => setD({ ...d, rate })}
            />
            <div className="if-result">
              <span>Interés bruto estimado</span>
              <strong>${gross.toFixed(2)}</strong>
              <small>Ejercicio con interés simple; no representa una oferta.</small>
            </div>
          </section>
        )}
        {d.stage === 'verify' && (
          <section className="if-options">
            <h3>Antes de contratar, marca las tres acciones</h3>
            {[
              'Leer el documento vigente',
              'Confirmar al emisor y su registro',
              'Comparar costos, liquidez y riesgos',
            ].map((x) => (
              <button
                key={x}
                className={d.checks.includes(x) ? 'is-selected' : ''}
                onClick={() =>
                  setD((v) => ({
                    ...v,
                    checks: v.checks.includes(x)
                      ? v.checks.filter((y) => y !== x)
                      : [...v.checks, x],
                  }))
                }
              >
                {x}
              </button>
            ))}
          </section>
        )}
        {review && (
          <section className="if-review">
            <span>Lista de verificación</span>
            <h3>El cálculo ilustra; los documentos definen.</h3>
            <p>
              Confirmaré emisor, plazo, tasa, liquidez, riesgos, costos e impuestos con información
              vigente.
            </p>
          </section>
        )}
      </ActivityFrame>
    </LessonShell>
  );
}
