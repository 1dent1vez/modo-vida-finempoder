import { useEffect, useMemo, useRef, useState } from 'react';
import LessonShell from '../LessonShell';
import ActivityFrame, {
  ActivityLoadError,
  ActivityLoading,
} from '../../../../module-kit/activities/ActivityFrame';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import '../../../../module-kit/activities/classification.css';
import '../../../../module-kit/activities/savings-protection.css';

type Stage = 'identify' | 'size' | 'review' | 'complete';
type Draft = {
  version: 1;
  stage: Stage;
  situations: string[];
  essentials: string;
  months: number;
  contribution: string;
  rule: 'essential' | 'unexpected' | 'both' | null;
};
const KEY = 'savings_l8:emergency:v1';
const SITUATIONS = [
  { id: 'health', label: 'Gasto de salud no planeado' },
  { id: 'income', label: 'Interrupción temporal de ingreso' },
  { id: 'repair', label: 'Reparación necesaria' },
  { id: 'care', label: 'Apoyo urgente a alguien a mi cargo' },
];
const initial = (): Draft => ({
  version: 1,
  stage: 'identify',
  situations: [],
  essentials: '',
  months: 1,
  contribution: '',
  rule: null,
});
function parse(raw: unknown): Draft | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as Draft;
  if (
    value.version !== 1 ||
    !['identify', 'size', 'review', 'complete'].includes(value.stage) ||
    !Array.isArray(value.situations) ||
    value.situations.some((id) => !SITUATIONS.some((item) => item.id === id)) ||
    typeof value.essentials !== 'string' ||
    !Number.isInteger(value.months) ||
    value.months < 1 ||
    value.months > 6 ||
    typeof value.contribution !== 'string' ||
    (value.rule !== null && !['essential', 'unexpected', 'both'].includes(value.rule)) ||
    (['review', 'complete'].includes(value.stage) &&
      (!(Number(value.essentials) > 0) || !(Number(value.contribution) > 0) || !value.rule))
  )
    return null;
  return value;
}
export default function L08() {
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
  const essentials = Number(draft.essentials) || 0;
  const contribution = Number(draft.contribution) || 0;
  const target = essentials * draft.months;
  const buildMonths = useMemo(
    () => (target > 0 && contribution > 0 ? Math.ceil(target / contribution) : 0),
    [target, contribution],
  );
  const valid = essentials > 0 && contribution > 0 && !!draft.rule;
  const persist = async (next: Draft, final = false) => {
    setBusy(true);
    setError(null);
    try {
      if (final) {
        const targetAmount = Number(next.essentials) * next.months;
        await lessonDataRepository.saveBatch('ahorro', [
          {
            key: 'l8_fondo',
            data: {
              gastosMensuales: Number(next.essentials),
              aportacionMensual: Number(next.contribution),
              mesesCobertura: next.months,
              metaObjetivo: targetAmount,
              metaMinima: targetAmount,
              metaIdeal: targetAmount,
              mesesMinima: Math.ceil(targetAmount / Number(next.contribution)),
              situaciones: next.situations,
              reglaUso: next.rule,
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
      if (mounted.current) setError('No pudimos guardar. Tu cálculo sigue en pantalla.');
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  if (loading)
    return (
      <LessonShell id="L08" title="Fondo de emergencias" completion={{ ready: false }}>
        <ActivityLoading />
      </LessonShell>
    );
  if (loadError)
    return (
      <LessonShell id="L08" title="Fondo de emergencias" completion={{ ready: false }}>
        <ActivityLoadError
          message="No pudimos recuperar tu avance."
          onRetry={() => setAttempt((value) => value + 1)}
        />
      </LessonShell>
    );
  const reviewing = draft.stage === 'review' || draft.stage === 'complete';
  return (
    <LessonShell
      id="L08"
      title="Tu red de seguridad: fondo de emergencias"
      showGreeting={false}
      completion={{ ready: draft.stage === 'complete', score: 100 }}
    >
      <ActivityFrame
        label="Constructor de fondo de emergencias"
        className="savings-protection"
        busy={busy}
        title={
          reviewing
            ? 'Revisa tu primera referencia.'
            : draft.stage === 'size'
              ? 'Define el tamaño y una regla de uso.'
              : 'Identifica qué necesita tu red.'
        }
        description="Construye una referencia personal a partir de gastos esenciales, sin imponer una meta universal."
        progressLabel="Etapas completadas"
        progressValue={draft.stage === 'identify' ? 0 : draft.stage === 'size' ? 1 : 2}
        progressMax={2}
        stepLabel={
          reviewing
            ? 'Paso 3 de 3 · Revisar'
            : draft.stage === 'size'
              ? 'Paso 2 de 3 · Calcular'
              : 'Paso 1 de 3 · Identificar'
        }
        focusKey={draft.stage}
        advice={{
          title: 'Puedes empezar por una capa pequeña',
          text: 'Un primer objetivo puede cubrir un imprevisto frecuente y crecer después. El número de meses depende de tu contexto.',
          tone: 'info',
        }}
        adviceCue={null}
        error={error}
        status={busy ? 'Guardando…' : dirty ? 'Cambios sin guardar.' : 'Tu avance está guardado.'}
        actions={
          <div className="spr-actions">
            {draft.stage === 'identify' && (
              <button
                className="ca-primary"
                onClick={() => void persist({ ...draft, stage: 'size' })}
              >
                Calcular mi referencia
              </button>
            )}
            {draft.stage === 'size' && (
              <button
                className="ca-primary"
                disabled={!valid || busy}
                onClick={() => void persist({ ...draft, stage: 'review' })}
              >
                Revisar mi fondo
              </button>
            )}
            {draft.stage === 'review' && (
              <>
                <button
                  className="spr-secondary"
                  onClick={() => {
                    setDraft((value) => ({ ...value, stage: 'size' }));
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
        {draft.stage === 'identify' && (
          <section className="spr-select">
            <p>¿Qué situaciones quieres contemplar? Puedes continuar sin elegir ninguna.</p>
            {SITUATIONS.map((item) => (
              <label key={item.id}>
                <input
                  type="checkbox"
                  checked={draft.situations.includes(item.id)}
                  onChange={() => {
                    setDraft((value) => ({
                      ...value,
                      situations: value.situations.includes(item.id)
                        ? value.situations.filter((id) => id !== item.id)
                        : [...value.situations, item.id],
                    }));
                    setDirty(true);
                  }}
                />
                {item.label}
              </label>
            ))}
          </section>
        )}
        {draft.stage === 'size' && (
          <section className="spr-form">
            <label>
              Gastos esenciales de un mes
              <span className="spr-money">
                <b>$</b>
                <input
                  aria-label="Gastos esenciales mensuales"
                  type="number"
                  min="1"
                  value={draft.essentials}
                  onChange={(event) => {
                    setDraft((value) => ({ ...value, essentials: event.target.value }));
                    setDirty(true);
                  }}
                />
              </span>
            </label>
            <label>
              Meses de cobertura para esta etapa: <strong>{draft.months}</strong>
              <input
                aria-label="Meses de cobertura"
                type="range"
                min="1"
                max="6"
                value={draft.months}
                onChange={(event) => {
                  setDraft((value) => ({ ...value, months: Number(event.target.value) }));
                  setDirty(true);
                }}
              />
            </label>
            <label>
              Aportación mensual posible
              <span className="spr-money">
                <b>$</b>
                <input
                  aria-label="Aportación mensual al fondo"
                  type="number"
                  min="1"
                  value={draft.contribution}
                  onChange={(event) => {
                    setDraft((value) => ({ ...value, contribution: event.target.value }));
                    setDirty(true);
                  }}
                />
              </span>
            </label>
            {target > 0 && contribution > 0 && (
              <div className="spr-result">
                <span>Referencia del fondo</span>
                <strong>${target.toLocaleString()}</strong>
                <small>
                  Aproximadamente {buildMonths} {buildMonths === 1 ? 'mes' : 'meses'} para
                  construirlo.
                </small>
              </div>
            )}
            <fieldset>
              <legend>Usaré el fondo cuando el gasto sea:</legend>
              <label>
                <input
                  type="radio"
                  name="rule"
                  checked={draft.rule === 'essential'}
                  onChange={() => {
                    setDraft((value) => ({ ...value, rule: 'essential' }));
                    setDirty(true);
                  }}
                />
                Necesario para cubrir algo esencial
              </label>
              <label>
                <input
                  type="radio"
                  name="rule"
                  checked={draft.rule === 'unexpected'}
                  onChange={() => {
                    setDraft((value) => ({ ...value, rule: 'unexpected' }));
                    setDirty(true);
                  }}
                />
                Imprevisto y difícil de posponer
              </label>
              <label>
                <input
                  type="radio"
                  name="rule"
                  checked={draft.rule === 'both'}
                  onChange={() => {
                    setDraft((value) => ({ ...value, rule: 'both' }));
                    setDirty(true);
                  }}
                />
                Ambas condiciones
              </label>
            </fieldset>
          </section>
        )}
        {reviewing && (
          <section className="spr-review">
            <span>Tu primera referencia</span>
            <h3>${target.toLocaleString()}</h3>
            <p>
              {draft.months} {draft.months === 1 ? 'mes' : 'meses'} de gastos esenciales · $
              {contribution.toLocaleString()} al mes · plazo estimado de {buildMonths}{' '}
              {buildMonths === 1 ? 'mes' : 'meses'}.
            </p>
          </section>
        )}
      </ActivityFrame>
    </LessonShell>
  );
}
