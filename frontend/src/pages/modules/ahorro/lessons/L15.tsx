import { useEffect, useRef, useState } from 'react';
import LessonShell from '../LessonShell';
import ActivityFrame, {
  ActivityLoadError,
  ActivityLoading,
} from '../../../../module-kit/activities/ActivityFrame';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import '../../../../module-kit/activities/classification.css';
import '../../../../module-kit/activities/savings-progress.css';
type Stage = 'recap' | 'evidence' | 'reflect' | 'next' | 'review' | 'complete';
type Draft = {
  version: 1;
  stage: Stage;
  amount: string;
  weeks: string;
  difficulty: string;
  adjustment: string;
  nextGoal: string;
};
type Source = {
  challenge?: { totalAcumulado?: number };
  goal?: { nombre?: string; monto?: number };
};
const KEY = 'savings_l15:closure:v1';
const initial = (amount = ''): Draft => ({
  version: 1,
  stage: 'recap',
  amount,
  weeks: '',
  difficulty: '',
  adjustment: '',
  nextGoal: '',
});
function parse(raw: unknown): Draft | null {
  if (!raw || typeof raw !== 'object') return null;
  const v = raw as Draft;
  if (
    v.version !== 1 ||
    !['recap', 'evidence', 'reflect', 'next', 'review', 'complete'].includes(v.stage) ||
    ['amount', 'weeks', 'difficulty', 'adjustment', 'nextGoal'].some(
      (key) => typeof v[key as keyof Draft] !== 'string',
    )
  )
    return null;
  return v;
}
export default function L15() {
  const [source, setSource] = useState<Source>({});
  const [draft, setDraft] = useState<Draft>(() => initial());
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
    void Promise.all([
      lessonDataRepository.load('ahorro', 'l11_reto'),
      lessonDataRepository.load('ahorro', 'l5_meta'),
      lessonDataRepository.load('ahorro', KEY),
    ])
      .then(([challenge, goal, saved]) => {
        if (!mounted.current) return;
        const data = { challenge: challenge as Source['challenge'], goal: goal as Source['goal'] };
        setSource(data);
        setDraft(
          parse(saved) ??
            initial(data.challenge?.totalAcumulado ? String(data.challenge.totalAcumulado) : ''),
        );
        setLoading(false);
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
            key: 'l15_cierre',
            data: {
              montoTotalAhorrado: Number(next.amount),
              semanasHabito: next.weeks,
              masDificil: next.difficulty,
              cambiaria: next.adjustment,
              proximaMeta: next.nextGoal,
              savedAt: new Date().toISOString(),
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
      if (mounted.current) setError('No pudimos guardar. Tu cierre sigue en pantalla.');
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  const update = (
    field: 'amount' | 'weeks' | 'difficulty' | 'adjustment' | 'nextGoal',
    value: string,
  ) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setDirty(true);
  };
  if (loading)
    return (
      <LessonShell id="L15" title="Cierre del módulo de ahorro" completion={{ ready: false }}>
        <ActivityLoading />
      </LessonShell>
    );
  if (loadError)
    return (
      <LessonShell id="L15" title="Cierre del módulo de ahorro" completion={{ ready: false }}>
        <ActivityLoadError
          message="No pudimos recuperar tu recorrido."
          onRetry={() => setAttempt((value) => value + 1)}
        />
      </LessonShell>
    );
  const stageNumber =
    draft.stage === 'recap'
      ? 0
      : draft.stage === 'evidence'
        ? 1
        : draft.stage === 'reflect'
          ? 2
          : draft.stage === 'next'
            ? 3
            : 4;
  const reviewing = draft.stage === 'review' || draft.stage === 'complete';
  return (
    <LessonShell
      id="L15"
      title="Reto final: cierra tu módulo de ahorro"
      showGreeting={false}
      completion={{ ready: draft.stage === 'complete', score: 100 }}
    >
      <ActivityFrame
        label="Cierre personal de ahorro"
        className="savings-progress"
        busy={busy}
        title={
          reviewing
            ? 'Tu cierre queda listo para guardar.'
            : draft.stage === 'next'
              ? 'Define un siguiente paso pequeño.'
              : draft.stage === 'reflect'
                ? 'Observa qué ayudó y qué cambiarás.'
                : draft.stage === 'evidence'
                  ? 'Confirma únicamente lo que registraste.'
                  : 'Integra lo aprendido en una decisión.'
        }
        description="Reúne evidencia, reflexión y un próximo paso sin comparar tu avance con el de otras personas."
        progressLabel="Etapas completadas"
        progressValue={stageNumber}
        progressMax={4}
        stepLabel={reviewing ? 'Paso 5 de 5 · Revisar' : `Paso ${stageNumber + 1} de 5`}
        focusKey={draft.stage}
        advice={{
          title: reviewing ? 'Tu plan puede cambiar' : 'Finni cierra contigo',
          text: reviewing
            ? 'Guardar este cierre no congela tus decisiones. Puedes ajustar tu hábito cuando cambien tus ingresos o prioridades.'
            : 'Usa datos que reconozcas y escribe un ajuste que puedas probar. Cualquier monto válido aporta información.',
          tone: reviewing ? 'success' : 'info',
        }}
        adviceCue={cue}
        error={error}
        status={busy ? 'Guardando…' : dirty ? 'Cambios sin guardar.' : 'Tu avance está guardado.'}
        actions={
          <div className="spg-actions">
            {draft.stage === 'recap' && (
              <button
                className="ca-primary"
                onClick={() => void persist({ ...draft, stage: 'evidence' })}
              >
                Empezar mi cierre
              </button>
            )}
            {draft.stage === 'evidence' && (
              <button
                className="ca-primary"
                disabled={draft.amount === '' || Number(draft.amount) < 0 || busy}
                onClick={() => void persist({ ...draft, stage: 'reflect' })}
              >
                Confirmar evidencia
              </button>
            )}
            {draft.stage === 'reflect' && (
              <button
                className="ca-primary"
                disabled={
                  draft.weeks.trim().length < 1 ||
                  draft.difficulty.trim().length < 3 ||
                  draft.adjustment.trim().length < 3 ||
                  busy
                }
                onClick={() => void persist({ ...draft, stage: 'next' })}
              >
                Definir siguiente paso
              </button>
            )}
            {draft.stage === 'next' && (
              <button
                className="ca-primary"
                disabled={draft.nextGoal.trim().length < 3 || busy}
                onClick={() => void persist({ ...draft, stage: 'review' })}
              >
                Revisar mi cierre
              </button>
            )}
            {draft.stage === 'review' && (
              <>
                <button
                  className="spg-secondary"
                  onClick={() => {
                    setDraft((value) => ({ ...value, stage: 'evidence' }));
                    setDirty(true);
                  }}
                >
                  Editar
                </button>
                <button
                  className="ca-primary"
                  onClick={() => void persist({ ...draft, stage: 'complete' }, true)}
                >
                  Guardar y completar módulo
                </button>
              </>
            )}
          </div>
        }
      >
        {draft.stage === 'recap' && (
          <section className="spg-concept">
            <article>
              <span>Evidencia</span>
              <strong>Lo que registraste</strong>
              <p>Monto y tiempo descritos por ti.</p>
            </article>
            <article>
              <span>Decisión</span>
              <strong>Lo que probarás después</strong>
              <p>Un ajuste y una meta revisables.</p>
            </article>
          </section>
        )}
        {draft.stage === 'evidence' && (
          <section className="spg-reflect">
            <label>
              Monto que reconoces haber ahorrado
              <input
                aria-label="Monto ahorrado"
                type="number"
                min="0"
                value={draft.amount}
                onChange={(event) => update('amount', event.target.value)}
              />
            </label>
            {source.challenge?.totalAcumulado !== undefined && (
              <p>
                Registro del micro-reto: ${source.challenge.totalAcumulado.toLocaleString('es-MX')}.
              </p>
            )}
            {source.goal?.nombre && (
              <p>
                Meta anterior: {source.goal.nombre}
                {source.goal.monto ? ` · $${source.goal.monto.toLocaleString('es-MX')}` : ''}.
              </p>
            )}
          </section>
        )}
        {draft.stage === 'reflect' && (
          <section className="spg-reflect">
            <label>
              ¿Durante cuántas semanas practicaste el hábito?
              <input
                value={draft.weeks}
                onChange={(event) => update('weeks', event.target.value)}
              />
            </label>
            <label>
              ¿Qué fue difícil?
              <textarea
                rows={2}
                value={draft.difficulty}
                onChange={(event) => update('difficulty', event.target.value)}
              />
            </label>
            <label>
              ¿Qué ajuste probarás?
              <textarea
                rows={2}
                value={draft.adjustment}
                onChange={(event) => update('adjustment', event.target.value)}
              />
            </label>
          </section>
        )}
        {draft.stage === 'next' && (
          <section className="spg-reflect">
            <label>
              Mi siguiente meta o práctica
              <textarea
                rows={3}
                placeholder="Por ejemplo: separar una cantidad posible el próximo día de ingreso"
                value={draft.nextGoal}
                onChange={(event) => {
                  update('nextGoal', event.target.value);
                  setCue('Hazla concreta y fácil de revisar.');
                }}
              />
            </label>
          </section>
        )}
        {reviewing && (
          <section className="spg-review">
            <span>Cierre del módulo</span>
            <h3>{draft.nextGoal}</h3>
            <p>
              Registraste ${Number(draft.amount).toLocaleString('es-MX')} y practicarás este ajuste:{' '}
              {draft.adjustment}
            </p>
            <small>
              La cantidad no determina el logro; completar el módulo significa haber construido una
              ruta que puedes revisar.
            </small>
          </section>
        )}
      </ActivityFrame>
    </LessonShell>
  );
}
