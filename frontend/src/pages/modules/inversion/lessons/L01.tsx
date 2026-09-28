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

type Stage = 'calibrate' | 'explore' | 'concepts' | 'review' | 'complete';
type Draft = {
  version: 1;
  stage: Stage;
  experience: string | null;
  years: number;
  rate: number;
  inflation: number;
  viewed: string[];
  answer: number | null;
};
const KEY = 'investment_l1:foundations:v1';
const CONCEPTS = [
  {
    id: 'return',
    term: 'Rendimiento',
    text: 'Cambio en el valor de una inversión durante un periodo. Puede ser positivo o negativo.',
  },
  {
    id: 'risk',
    term: 'Riesgo',
    text: 'Posibilidad de obtener un resultado distinto al esperado, incluida una pérdida.',
  },
  {
    id: 'term',
    term: 'Plazo',
    text: 'Tiempo durante el cual puedes mantener el dinero sin necesitarlo.',
  },
  {
    id: 'liquidity',
    term: 'Liquidez',
    text: 'Facilidad y condiciones para convertir un instrumento en dinero disponible.',
  },
];
const initial = (): Draft => ({
  version: 1,
  stage: 'calibrate',
  experience: null,
  years: 5,
  rate: 5,
  inflation: 4,
  viewed: [],
  answer: null,
});
function parse(raw: unknown): Draft | null {
  if (!raw || typeof raw !== 'object') return null;
  const v = raw as Draft;
  if (
    v.version !== 1 ||
    !['calibrate', 'explore', 'concepts', 'review', 'complete'].includes(v.stage) ||
    (v.experience !== null && typeof v.experience !== 'string') ||
    !Number.isFinite(v.years) ||
    v.years < 1 ||
    v.years > 20 ||
    !Number.isFinite(v.rate) ||
    v.rate < -10 ||
    v.rate > 15 ||
    !Number.isFinite(v.inflation) ||
    v.inflation < 0 ||
    v.inflation > 15 ||
    !Array.isArray(v.viewed) ||
    v.viewed.some((id) => !CONCEPTS.some((item) => item.id === id)) ||
    (v.answer !== null && ![0, 1, 2].includes(v.answer))
  )
    return null;
  return v;
}
const money = (value: number) => Math.round(value).toLocaleString('es-MX');
export default function L01() {
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
      .load('inversion', KEY)
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
        await lessonDataRepository.saveBatch('inversion', [
          {
            key: 'l01_foundations',
            data: {
              experience: next.experience,
              scenario: {
                years: next.years,
                hypotheticalAnnualReturn: next.rate,
                hypotheticalInflation: next.inflation,
              },
              conceptsViewed: next.viewed,
              answer: next.answer,
            },
          },
          { key: KEY, data: next },
        ]);
      } else {
        await lessonDataRepository.save('inversion', KEY, next);
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
  const nominal = useMemo(
    () => 5000 * (1 + draft.rate / 100) ** draft.years,
    [draft.rate, draft.years],
  );
  const real = useMemo(
    () => nominal / (1 + draft.inflation / 100) ** draft.years,
    [nominal, draft.inflation, draft.years],
  );
  const reviewing = draft.stage === 'review' || draft.stage === 'complete';
  const correct = draft.answer === 1;
  if (loading)
    return (
      <LessonShell id="L01" title="Qué significa invertir" completion={{ ready: false }}>
        <ActivityLoading />
      </LessonShell>
    );
  if (loadError)
    return (
      <LessonShell id="L01" title="Qué significa invertir" completion={{ ready: false }}>
        <ActivityLoadError
          message="No pudimos recuperar tu avance."
          onRetry={() => setAttempt((value) => value + 1)}
        />
      </LessonShell>
    );
  return (
    <LessonShell
      id="L01"
      title="Qué significa invertir"
      showGreeting={false}
      completion={{ ready: draft.stage === 'complete', score: 100 }}
    >
      <ActivityFrame
        label="Fundamentos de inversión"
        className="investment-foundations"
        busy={busy}
        title={
          reviewing
            ? 'Conserva una definición útil.'
            : draft.stage === 'concepts'
              ? 'Cuatro variables viajan juntas.'
              : draft.stage === 'explore'
                ? 'Explora supuestos, no promesas.'
                : 'Invertir implica una expectativa y una incertidumbre.'
        }
        description="Distingue crecimiento nominal, poder de compra y riesgo antes de conocer productos."
        progressLabel="Etapas completadas"
        progressValue={
          draft.stage === 'calibrate'
            ? 0
            : draft.stage === 'explore'
              ? 1
              : draft.stage === 'concepts'
                ? 2
                : 3
        }
        progressMax={3}
        stepLabel={
          reviewing
            ? 'Paso 4 de 4 · Revisar'
            : draft.stage === 'concepts'
              ? 'Paso 3 de 4 · Conectar'
              : draft.stage === 'explore'
                ? 'Paso 2 de 4 · Explorar'
                : 'Paso 1 de 4 · Ubicarte'
        }
        focusKey={draft.stage}
        advice={{
          title:
            draft.stage === 'concepts' && draft.answer !== null
              ? correct
                ? 'Lectura completa'
                : 'El rendimiento no viaja solo'
              : 'Finni pone límites al ejemplo',
          text:
            draft.stage === 'concepts' && draft.answer !== null
              ? 'Para comparar opciones necesitas mirar rendimiento, riesgo, plazo, liquidez y costos en conjunto.'
              : 'Las tasas de esta pantalla son hipótesis educativas. Un resultado real puede subir, bajar o no compensar la inflación.',
          tone:
            draft.stage === 'concepts' && draft.answer !== null
              ? correct
                ? 'success'
                : 'review'
              : 'info',
        }}
        adviceCue={cue}
        error={error}
        status={busy ? 'Guardando…' : dirty ? 'Cambios sin guardar.' : 'Tu avance está guardado.'}
        actions={
          <div className="if-actions">
            {draft.stage === 'calibrate' && (
              <button
                className="ca-primary"
                disabled={!draft.experience || busy}
                onClick={() => void persist({ ...draft, stage: 'explore' })}
              >
                Explorar un escenario
              </button>
            )}
            {draft.stage === 'explore' && (
              <button
                className="ca-primary"
                onClick={() => void persist({ ...draft, stage: 'concepts' })}
              >
                Conectar las variables
              </button>
            )}
            {draft.stage === 'concepts' && (
              <button
                className="ca-primary"
                disabled={draft.viewed.length !== CONCEPTS.length || draft.answer === null || busy}
                onClick={() => void persist({ ...draft, stage: 'review' })}
              >
                Revisar definición
              </button>
            )}
            {draft.stage === 'review' && (
              <button
                className="ca-primary"
                onClick={() => void persist({ ...draft, stage: 'complete' }, true)}
              >
                Guardar y terminar
              </button>
            )}
          </div>
        }
      >
        {draft.stage === 'calibrate' && (
          <section className="if-options">
            <h3>¿Qué experiencia reconoces?</h3>
            {[
              'Nunca he invertido',
              'No sé si algo que tengo cuenta',
              'Ya probé algún instrumento',
              'Invierto con regularidad',
            ].map((option) => (
              <button
                key={option}
                className={draft.experience === option ? 'is-selected' : ''}
                aria-pressed={draft.experience === option}
                onClick={() => {
                  setDraft((value) => ({ ...value, experience: option }));
                  setDirty(true);
                }}
              >
                {option}
              </button>
            ))}
          </section>
        )}
        {draft.stage === 'explore' && (
          <section className="if-simulator">
            <LessonRange
              label="Plazo"
              display={`${draft.years} años`}
              min={1}
              max={20}
              value={draft.years}
              onChange={(years) => {
                setDraft((value) => ({ ...value, years }));
                setDirty(true);
              }}
            />
            <LessonRange
              label="Rendimiento anual hipotético"
              display={`${draft.rate}%`}
              min={-10}
              max={15}
              step={1}
              value={draft.rate}
              onChange={(rate) => {
                setDraft((value) => ({ ...value, rate }));
                setDirty(true);
              }}
            />
            <LessonRange
              label="Inflación anual hipotética"
              display={`${draft.inflation}%`}
              min={0}
              max={15}
              step={1}
              value={draft.inflation}
              onChange={(inflation) => {
                setDraft((value) => ({ ...value, inflation }));
                setDirty(true);
              }}
            />
            <div className="if-result">
              <span>Saldo nominal del escenario</span>
              <strong>${money(nominal)}</strong>
              <small>Poder de compra estimado en dinero de hoy: ${money(real)}</small>
            </div>
            <p>
              Modelo simplificado con tasas constantes, sin impuestos, comisiones ni variaciones de
              mercado.
            </p>
          </section>
        )}
        {draft.stage === 'concepts' && (
          <>
            <section className="if-grid">
              {CONCEPTS.map((item) => (
                <button
                  key={item.id}
                  className={draft.viewed.includes(item.id) ? 'is-viewed' : ''}
                  onClick={() => {
                    setDraft((value) => ({
                      ...value,
                      viewed: value.viewed.includes(item.id)
                        ? value.viewed
                        : [...value.viewed, item.id],
                    }));
                    setCue(item.text);
                    setDirty(true);
                  }}
                >
                  <span>{item.term}</span>
                  <small>
                    {draft.viewed.includes(item.id) ? item.text : 'Toca para descubrir'}
                  </small>
                </button>
              ))}
            </section>
            <section className="if-options">
              <h3>¿Qué debes comparar antes de invertir?</h3>
              {[
                'Solo el rendimiento anunciado',
                'Rendimiento, riesgo, plazo, liquidez y costos',
                'Solo el monto mínimo',
              ].map((option, index) => (
                <button
                  key={option}
                  className={draft.answer === index ? 'is-selected' : ''}
                  aria-pressed={draft.answer === index}
                  onClick={() => {
                    setDraft((value) => ({ ...value, answer: index }));
                    setCue(option);
                    setDirty(true);
                  }}
                >
                  {option}
                </button>
              ))}
            </section>
          </>
        )}
        {reviewing && (
          <section className="if-review">
            <span>Definición guardable</span>
            <h3>
              Invertir es asignar dinero a un instrumento con expectativa de rendimiento y
              posibilidad de obtener un resultado distinto.
            </h3>
            <p>
              Antes de decidir, compara riesgo, plazo, liquidez, costos y condiciones verificables.
            </p>
          </section>
        )}
      </ActivityFrame>
    </LessonShell>
  );
}
