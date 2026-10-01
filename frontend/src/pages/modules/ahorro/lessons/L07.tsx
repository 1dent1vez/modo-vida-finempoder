import { useEffect, useMemo, useRef, useState } from 'react';
import LessonShell from '../LessonShell';
import ActivityFrame, {
  ActivityLoadError,
  ActivityLoading,
} from '../../../../module-kit/activities/ActivityFrame';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import { LessonRange } from '../../../../module-kit/components/activities';
import '../../../../module-kit/activities/classification.css';
import '../../../../module-kit/activities/savings-plan.css';

type IncomeType = 'fixed' | 'variable' | 'mixed';
type Strategy = 'percentage' | 'base-extra' | 'minimum';
type Stage = 'profile' | 'reference' | 'strategy' | 'review' | 'complete';
type Draft = {
  version: 1;
  stage: Stage;
  incomeType: IncomeType | null;
  incomes: [string, string, string];
  percent: number;
  strategy: Strategy | null;
};
const KEY = 'savings_l7:variable:v1';
const PROFILES: { id: IncomeType; label: string; help: string }[] = [
  { id: 'fixed', label: 'Principalmente fijo', help: 'El monto cambia poco entre periodos.' },
  {
    id: 'variable',
    label: 'Principalmente variable',
    help: 'El monto cambia según ventas, proyectos o temporadas.',
  },
  { id: 'mixed', label: 'Mixto', help: 'Combina una base con entradas variables.' },
];
const STRATEGIES: { id: Strategy; label: string; help: string }[] = [
  {
    id: 'percentage',
    label: 'Porcentaje de cada ingreso',
    help: 'La aportación sube o baja con lo que recibes.',
  },
  {
    id: 'base-extra',
    label: 'Base pequeña más una parte del extra',
    help: 'Separa una cantidad mínima y ajusta en periodos mejores.',
  },
  {
    id: 'minimum',
    label: 'Plan desde el ingreso menor',
    help: 'Usa una referencia prudente de periodos recientes.',
  },
];
const initial = (): Draft => ({
  version: 1,
  stage: 'profile',
  incomeType: null,
  incomes: ['', '', ''],
  percent: 10,
  strategy: null,
});
function parse(raw: unknown): Draft | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as Draft;
  if (
    value.version !== 1 ||
    !['profile', 'reference', 'strategy', 'review', 'complete'].includes(value.stage) ||
    (value.incomeType !== null && !['fixed', 'variable', 'mixed'].includes(value.incomeType)) ||
    !Array.isArray(value.incomes) ||
    value.incomes.length !== 3 ||
    value.incomes.some((item) => typeof item !== 'string') ||
    !Number.isFinite(value.percent) ||
    value.percent < 1 ||
    value.percent > 30 ||
    (value.strategy !== null &&
      !['percentage', 'base-extra', 'minimum'].includes(value.strategy)) ||
    (['review', 'complete'].includes(value.stage) &&
      (!value.incomeType || !value.strategy || value.incomes.some((item) => !(Number(item) > 0))))
  )
    return null;
  return value;
}

export default function L07() {
  const [draft, setDraft] = useState<Draft>(initial);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  const numbers = draft.incomes.map((item) => Number(item) || 0);
  const hasReference = numbers.every((item) => item > 0);
  const base = hasReference ? Math.min(...numbers) : 0;
  const average = hasReference ? numbers.reduce((sum, item) => sum + item, 0) / numbers.length : 0;
  const sample = useMemo(() => (base * draft.percent) / 100, [base, draft.percent]);
  const persist = async (next: Draft, final = false) => {
    setBusy(true);
    setError(null);
    try {
      if (final) {
        await lessonDataRepository.saveBatch('ahorro', [
          {
            key: 'l7_estrategia',
            data: {
              ingresoType: next.incomeType,
              estrategia: next.strategy,
              ingresoBase: Math.min(...next.incomes.map(Number)),
              porcentaje: next.percent,
              ingresosReferencia: next.incomes.map(Number),
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
      if (mounted.current) setError('No pudimos guardar. Tu estrategia sigue en pantalla.');
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  if (loading)
    return (
      <LessonShell id="L07" title="Ingreso impredecible" completion={{ ready: false }}>
        <ActivityLoading />
      </LessonShell>
    );
  if (loadError)
    return (
      <LessonShell id="L07" title="Ingreso impredecible" completion={{ ready: false }}>
        <ActivityLoadError
          message="No pudimos recuperar tu avance."
          onRetry={() => setAttempt((value) => value + 1)}
        />
      </LessonShell>
    );
  const reviewing = draft.stage === 'review' || draft.stage === 'complete';
  return (
    <LessonShell
      id="L07"
      title="Cuando tu ingreso es impredecible"
      showGreeting={false}
      completion={{ ready: draft.stage === 'complete', score: 100 }}
    >
      <ActivityFrame
        label="Plan para ingresos variables"
        className="savings-plan"
        busy={busy}
        title={
          reviewing
            ? 'Revisa una regla flexible.'
            : draft.stage === 'strategy'
              ? 'Elige cómo vas a ajustar.'
              : draft.stage === 'reference'
                ? 'Construye una referencia prudente.'
                : 'Describe cómo cambia tu ingreso.'
        }
        description="Usa tres periodos recientes para explorar una regla que se adapte a meses distintos."
        progressLabel="Etapas completadas"
        progressValue={
          draft.stage === 'profile'
            ? 0
            : draft.stage === 'reference'
              ? 1
              : draft.stage === 'strategy'
                ? 2
                : 3
        }
        progressMax={3}
        stepLabel={
          reviewing
            ? 'Paso 4 de 4 · Revisar'
            : draft.stage === 'strategy'
              ? 'Paso 3 de 4 · Elegir estrategia'
              : draft.stage === 'reference'
                ? 'Paso 2 de 4 · Estimar'
                : 'Paso 1 de 4 · Identificar'
        }
        focusKey={draft.stage}
        advice={{
          title: 'La variación necesita margen',
          text: 'Los tres periodos son una referencia breve, no una predicción. Ajusta la regla cuando cambie tu realidad.',
          tone: 'info',
        }}
        adviceCue={null}
        error={error}
        status={busy ? 'Guardando…' : dirty ? 'Cambios sin guardar.' : 'Tu avance está guardado.'}
        actions={
          <div className="sp-actions">
            {draft.stage === 'profile' && (
              <button
                className="ca-primary"
                disabled={!draft.incomeType}
                onClick={() => void persist({ ...draft, stage: 'reference' })}
              >
                Crear referencia
              </button>
            )}
            {draft.stage === 'reference' && (
              <button
                className="ca-primary"
                disabled={!hasReference || busy}
                onClick={() => void persist({ ...draft, stage: 'strategy' })}
              >
                Elegir estrategia
              </button>
            )}
            {draft.stage === 'strategy' && (
              <button
                className="ca-primary"
                disabled={!draft.strategy || busy}
                onClick={() => void persist({ ...draft, stage: 'review' })}
              >
                Revisar mi regla
              </button>
            )}
            {draft.stage === 'review' && (
              <>
                <button
                  className="sp-secondary"
                  onClick={() => {
                    setDraft((value) => ({ ...value, stage: 'strategy' }));
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
        {draft.stage === 'profile' && (
          <section className="sp-horizons">
            {PROFILES.map((item) => (
              <button
                key={item.id}
                className={draft.incomeType === item.id ? 'is-selected' : ''}
                aria-pressed={draft.incomeType === item.id}
                onClick={() => {
                  setDraft((value) => ({ ...value, incomeType: item.id }));
                  setDirty(true);
                }}
              >
                <strong>{item.label}</strong>
                <span>{item.help}</span>
              </button>
            ))}
          </section>
        )}
        {draft.stage === 'reference' && (
          <section className="sp-form">
            <fieldset>
              <legend>Tres ingresos recientes</legend>
              {draft.incomes.map((value, index) => (
                <label key={index}>
                  Periodo {index + 1}
                  <span className="sp-money">
                    <b>$</b>
                    <input
                      aria-label={`Ingreso del periodo ${index + 1}`}
                      type="number"
                      min="1"
                      value={value}
                      onChange={(event) => {
                        const incomes = [...draft.incomes] as Draft['incomes'];
                        incomes[index] = event.target.value;
                        setDraft((current) => ({ ...current, incomes }));
                        setDirty(true);
                      }}
                    />
                  </span>
                </label>
              ))}
            </fieldset>
            {hasReference && (
              <div className="sp-metrics">
                <div>
                  <span>Menor ingreso</span>
                  <strong>${base.toLocaleString()}</strong>
                </div>
                <div>
                  <span>Promedio</span>
                  <strong>
                    ${average.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </strong>
                </div>
              </div>
            )}
            <LessonRange
              label="Porcentaje para explorar:"
              display={`${draft.percent}%`}
              min={1}
              max={30}
              value={draft.percent}
              onChange={(percent) => {
                setDraft((value) => ({ ...value, percent }));
                setDirty(true);
              }}
            />
            {hasReference && (
              <p className="sp-note">
                Con el menor ingreso de la muestra, {draft.percent}% serían aproximadamente $
                {sample.toLocaleString(undefined, { maximumFractionDigits: 0 })}. Tú decides si cabe
                después de cubrir necesidades y compromisos.
              </p>
            )}
          </section>
        )}
        {draft.stage === 'strategy' && (
          <section className="sp-horizons">
            {STRATEGIES.map((item) => (
              <button
                key={item.id}
                className={draft.strategy === item.id ? 'is-selected' : ''}
                aria-pressed={draft.strategy === item.id}
                onClick={() => {
                  setDraft((value) => ({ ...value, strategy: item.id }));
                  setDirty(true);
                }}
              >
                <strong>{item.label}</strong>
                <span>{item.help}</span>
              </button>
            ))}
          </section>
        )}
        {reviewing && (
          <section className="sp-review">
            <span>Tu regla inicial</span>
            <h3>{STRATEGIES.find((item) => item.id === draft.strategy)?.label}</h3>
            <strong>{draft.percent}% como referencia ajustable</strong>
            <p>
              La muestra va de ${base.toLocaleString()} a ${Math.max(...numbers).toLocaleString()}.
              Revisarás la regla cuando cambien tus ingresos o tus gastos necesarios.
            </p>
          </section>
        )}
      </ActivityFrame>
    </LessonShell>
  );
}
