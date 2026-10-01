import { useEffect, useMemo, useRef, useState } from 'react';
import LessonShell from '../LessonShell';
import ActivityFrame, {
  ActivityLoadError,
  ActivityLoading,
} from '../../../../module-kit/activities/ActivityFrame';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import { LessonRange } from '../../../../module-kit/components/activities';
import '../../../../module-kit/activities/classification.css';
import '../../../../module-kit/activities/savings-progress.css';

type Stage = 'learn' | 'simulate' | 'check' | 'review' | 'complete';
type Draft = {
  version: 1;
  stage: Stage;
  capital: number;
  monthly: number;
  rate: number;
  years: number;
  answer: number | null;
};
const KEY = 'savings_l12:compound:v1';
const initial = (): Draft => ({
  version: 1,
  stage: 'learn',
  capital: 1000,
  monthly: 200,
  rate: 5,
  years: 5,
  answer: null,
});
function parse(raw: unknown): Draft | null {
  if (!raw || typeof raw !== 'object') return null;
  const v = raw as Draft;
  if (
    v.version !== 1 ||
    !['learn', 'simulate', 'check', 'review', 'complete'].includes(v.stage) ||
    ![v.capital, v.monthly, v.rate, v.years].every(Number.isFinite) ||
    v.capital < 0 ||
    v.monthly < 0 ||
    v.rate < 0 ||
    v.rate > 15 ||
    v.years < 1 ||
    v.years > 20 ||
    (v.answer !== null && ![0, 1, 2].includes(v.answer))
  )
    return null;
  return v;
}
function compound(capital: number, monthly: number, rate: number, years: number) {
  const months = years * 12;
  const r = rate / 1200;
  if (!r) return capital + monthly * months;
  return capital * (1 + r) ** months + monthly * (((1 + r) ** months - 1) / r);
}
const money = (value: number) => Math.round(value).toLocaleString('es-MX');

export default function L12() {
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
            key: 'l12_compound_scenario',
            data: {
              capital: next.capital,
              monthly: next.monthly,
              illustrativeAnnualRate: next.rate,
              years: next.years,
              projectedBalance: compound(next.capital, next.monthly, next.rate, next.years),
              assumptions: ['monthly-compounding', 'constant-rate', 'before-fees-taxes-inflation'],
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
      if (mounted.current) setError('No pudimos guardar. Tu escenario sigue en pantalla.');
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  const projected = useMemo(
    () => compound(draft.capital, draft.monthly, draft.rate, draft.years),
    [draft],
  );
  const contributed = draft.capital + draft.monthly * draft.years * 12;
  const growth = Math.max(0, projected - contributed);
  const reviewing = draft.stage === 'review' || draft.stage === 'complete';
  const correct = draft.answer === 1;
  const update = (field: 'capital' | 'monthly' | 'rate' | 'years', value: number) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setDirty(true);
  };
  if (loading)
    return (
      <LessonShell id="L12" title="Interés compuesto" completion={{ ready: false }}>
        <ActivityLoading />
      </LessonShell>
    );
  if (loadError)
    return (
      <LessonShell id="L12" title="Interés compuesto" completion={{ ready: false }}>
        <ActivityLoadError
          message="No pudimos recuperar tu escenario."
          onRetry={() => setAttempt((v) => v + 1)}
        />
      </LessonShell>
    );
  return (
    <LessonShell
      id="L12"
      title="El dinero que se multiplica: interés compuesto"
      showGreeting={false}
      completion={{ ready: draft.stage === 'complete', score: 100 }}
    >
      <ActivityFrame
        label="Laboratorio de interés compuesto"
        className="savings-progress"
        busy={busy}
        title={
          reviewing
            ? 'Guarda el escenario y sus supuestos.'
            : draft.stage === 'check'
              ? 'Comprueba qué significa el resultado.'
              : draft.stage === 'simulate'
                ? 'Mueve una variable a la vez.'
                : 'El rendimiento también puede generar rendimiento.'
        }
        description="Explora una proyección educativa con una tasa hipotética, sin promesas de resultado."
        progressLabel="Etapas completadas"
        progressValue={
          draft.stage === 'learn'
            ? 0
            : draft.stage === 'simulate'
              ? 1
              : draft.stage === 'check'
                ? 2
                : 3
        }
        progressMax={3}
        stepLabel={
          reviewing
            ? 'Paso 4 de 4 · Revisar'
            : draft.stage === 'check'
              ? 'Paso 3 de 4 · Interpretar'
              : draft.stage === 'simulate'
                ? 'Paso 2 de 4 · Simular'
                : 'Paso 1 de 4 · Comprender'
        }
        focusKey={draft.stage}
        advice={{
          title:
            draft.stage === 'check' && draft.answer !== null
              ? correct
                ? 'Lectura correcta'
                : 'Revisa los supuestos'
              : 'Finni pone la proyección en contexto',
          text:
            draft.stage === 'check' && draft.answer !== null
              ? 'Una proyección depende de sus supuestos. El resultado real puede cambiar por tasas, comisiones, impuestos, inflación y movimientos del mercado.'
              : 'Prueba escenarios, pero verifica las condiciones reales del producto antes de tomar una decisión.',
          tone:
            draft.stage === 'check' && draft.answer !== null
              ? correct
                ? 'success'
                : 'review'
              : 'info',
        }}
        adviceCue={cue}
        error={error}
        status={busy ? 'Guardando…' : dirty ? 'Cambios sin guardar.' : 'Tu avance está guardado.'}
        actions={
          <div className="spg-actions">
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
                onClick={() => void persist({ ...draft, stage: 'check' })}
              >
                Interpretar resultado
              </button>
            )}
            {draft.stage === 'check' && (
              <button
                className="ca-primary"
                disabled={draft.answer === null || busy}
                onClick={() => void persist({ ...draft, stage: 'review' })}
              >
                Revisar escenario
              </button>
            )}
            {draft.stage === 'review' && (
              <>
                <button
                  className="spg-secondary"
                  onClick={() => {
                    setDraft((v) => ({ ...v, stage: 'simulate' }));
                    setDirty(true);
                  }}
                >
                  Ajustar
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
          <section className="spg-concept">
            <article>
              <span>Sin rendimiento</span>
              <strong>$1,000 + aportaciones</strong>
              <p>El saldo crece con lo que tú agregas.</p>
            </article>
            <article>
              <span>Con capitalización</span>
              <strong>Saldo + rendimiento</strong>
              <p>Cada periodo parte del saldo acumulado.</p>
            </article>
            <p>
              Una tasa constante sirve para explorar. No describe por sí sola un producto ni
              garantiza un resultado.
            </p>
          </section>
        )}
        {draft.stage === 'simulate' && (
          <section className="spg-simulator">
            <LessonRange
              label="Capital inicial"
              display={`$${money(draft.capital)}`}
              min={0}
              max={50000}
              step={500}
              value={draft.capital}
              onChange={(value) => update('capital', value)}
            />
            <LessonRange
              label="Aportación mensual"
              display={`$${money(draft.monthly)}`}
              min={0}
              max={5000}
              step={100}
              value={draft.monthly}
              onChange={(value) => update('monthly', value)}
            />
            <LessonRange
              label="Tasa anual hipotética"
              display={`${draft.rate}%`}
              min={0}
              max={15}
              step={0.5}
              value={draft.rate}
              onChange={(value) => update('rate', value)}
            />
            <LessonRange
              label="Plazo"
              display={`${draft.years} años`}
              min={1}
              max={20}
              value={draft.years}
              onChange={(value) => update('years', value)}
            />
            <div className="spg-result">
              <span>Saldo proyectado</span>
              <strong>${money(projected)}</strong>
              <small>
                ${money(contributed)} aportados · ${money(growth)} de crecimiento hipotético
              </small>
            </div>
            <p className="spg-note">
              Supone tasa constante y capitalización mensual. No incluye comisiones, impuestos,
              inflación ni variaciones de mercado.
            </p>
          </section>
        )}
        {draft.stage === 'check' && (
          <section className="spg-question">
            <h3>¿Qué afirma esta proyección?</h3>
            {[
              'Que recibiré exactamente ese monto',
              'Que ese sería el resultado si se cumplieran los supuestos',
              'Que cualquier producto ofrece esa tasa',
            ].map((option, index) => (
              <button
                key={option}
                className={draft.answer === index ? 'is-selected' : ''}
                aria-pressed={draft.answer === index}
                onClick={() => {
                  setDraft((v) => ({ ...v, answer: index }));
                  setCue(option);
                  setDirty(true);
                }}
              >
                {option}
              </button>
            ))}
          </section>
        )}
        {reviewing && (
          <section className="spg-review">
            <span>Escenario educativo</span>
            <h3>
              ${money(projected)} en {draft.years} años
            </h3>
            <p>
              ${money(draft.capital)} iniciales + ${money(draft.monthly)} al mes · tasa anual
              hipotética de {draft.rate}%.
            </p>
            <small>
              Resultado condicionado a los supuestos mostrados; no es una promesa de rendimiento.
            </small>
          </section>
        )}
      </ActivityFrame>
    </LessonShell>
  );
}
