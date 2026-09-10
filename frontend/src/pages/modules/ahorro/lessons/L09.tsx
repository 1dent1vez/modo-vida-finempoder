import { useEffect, useRef, useState } from 'react';
import LessonShell from '../LessonShell';
import ActivityFrame, {
  ActivityLoadError,
  ActivityLoading,
} from '../../../../module-kit/activities/ActivityFrame';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import '../../../../module-kit/activities/classification.css';
import '../../../../module-kit/activities/savings-protection.css';

type Tool = 'savings' | 'insurance' | 'both';
type Stage = 'compare' | 'cases' | 'action' | 'review' | 'complete';
type Draft = {
  version: 1;
  stage: Stage;
  caseIndex: number;
  pending: Tool | null;
  answers: Record<number, Tool>;
  action: string | null;
};
const KEY = 'savings_l9:coverage:v1';
const TOOLS: { id: Tool; label: string }[] = [
  { id: 'savings', label: 'Ahorro' },
  { id: 'insurance', label: 'Seguro' },
  { id: 'both', label: 'Ambos' },
];
const CASES = [
  {
    title: 'Reparación necesaria y manejable',
    text: 'El costo cabe en el fondo y no existe una cobertura contratada para ese evento.',
    best: 'savings' as Tool,
    feedback:
      'El ahorro aporta liquidez para gastos manejables. Después conviene reconstruir el fondo gradualmente.',
  },
  {
    title: 'Evento de alto impacto con cobertura',
    text: 'Una póliza vigente contempla el evento, pero tiene deducible y tiempos de respuesta.',
    best: 'both' as Tool,
    feedback:
      'La cobertura puede absorber parte del impacto y el ahorro puede cubrir deducible, exclusiones o el tiempo de respuesta.',
  },
  {
    title: 'Evento fuera de la póliza',
    text: 'El contrato excluye expresamente la situación que ocurrió.',
    best: 'savings' as Tool,
    feedback:
      'La palabra “seguro” no garantiza cobertura. Mandan las condiciones, exclusiones, límites y vigencia del contrato.',
  },
];
const ACTIONS = [
  { id: 'coverage', label: 'Confirmar qué eventos cubre' },
  { id: 'cost', label: 'Revisar deducible y otros costos' },
  { id: 'contact', label: 'Guardar el canal para solicitar apoyo' },
];
const initial = (): Draft => ({
  version: 1,
  stage: 'compare',
  caseIndex: 0,
  pending: null,
  answers: {},
  action: null,
});
function parse(raw: unknown): Draft | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as Draft;
  if (
    value.version !== 1 ||
    !['compare', 'cases', 'action', 'review', 'complete'].includes(value.stage) ||
    !Number.isInteger(value.caseIndex) ||
    value.caseIndex < 0 ||
    value.caseIndex >= CASES.length ||
    (value.pending !== null && !['savings', 'insurance', 'both'].includes(value.pending)) ||
    !value.answers ||
    (value.action !== null && !ACTIONS.some((item) => item.id === value.action)) ||
    (['review', 'complete'].includes(value.stage) && !value.action)
  )
    return null;
  return value;
}
export default function L09() {
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
            key: 'l9_ahorro_seguro',
            data: {
              answers: next.answers,
              action: next.action,
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
      if (mounted.current) setError('No pudimos guardar. Tus elecciones siguen en pantalla.');
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  if (loading)
    return (
      <LessonShell id="L09" title="Ahorro y seguros" completion={{ ready: false }}>
        <ActivityLoading />
      </LessonShell>
    );
  if (loadError)
    return (
      <LessonShell id="L09" title="Ahorro y seguros" completion={{ ready: false }}>
        <ActivityLoadError
          message="No pudimos recuperar tu avance."
          onRetry={() => setAttempt((value) => value + 1)}
        />
      </LessonShell>
    );
  const current = CASES[draft.caseIndex];
  const feedback = draft.pending === null ? null : draft.pending === current.best;
  const reviewing = draft.stage === 'review' || draft.stage === 'complete';
  const confirm = () => {
    if (!draft.pending) return;
    const answers = { ...draft.answers, [draft.caseIndex]: draft.pending };
    const last = draft.caseIndex === CASES.length - 1;
    void persist({
      ...draft,
      answers,
      pending: null,
      caseIndex: last ? draft.caseIndex : draft.caseIndex + 1,
      stage: last ? 'action' : 'cases',
    });
  };
  return (
    <LessonShell
      id="L09"
      title="Ahorro y seguros: la dupla de la tranquilidad"
      showGreeting={false}
      completion={{ ready: draft.stage === 'complete', score: 100 }}
    >
      <ActivityFrame
        label="Mapa de ahorro y cobertura"
        className="savings-protection"
        busy={busy}
        title={
          reviewing
            ? 'Revisa tu próximo paso.'
            : draft.stage === 'action'
              ? 'Convierte la comparación en una acción.'
              : draft.stage === 'cases'
                ? 'Lee el evento y también el contrato.'
                : 'Distingue liquidez de cobertura.'
        }
        description="Practica cuándo puede ayudar el ahorro, una cobertura vigente o la combinación de ambos."
        progressLabel="Etapas completadas"
        progressValue={
          draft.stage === 'compare'
            ? 0
            : draft.stage === 'cases'
              ? 1 + Object.keys(draft.answers).length
              : draft.stage === 'action'
                ? 4
                : 5
        }
        progressMax={5}
        stepLabel={
          reviewing
            ? 'Paso 4 de 4 · Revisar'
            : draft.stage === 'action'
              ? 'Paso 3 de 4 · Elegir acción'
              : draft.stage === 'cases'
                ? `Paso 2 de 4 · Caso ${draft.caseIndex + 1} de ${CASES.length}`
                : 'Paso 1 de 4 · Comparar'
        }
        focusKey={`${draft.stage}-${draft.caseIndex}`}
        advice={{
          title:
            feedback === null
              ? 'Una póliza es un contrato'
              : feedback
                ? 'El criterio encaja'
                : 'Falta una condición',
          text:
            feedback === null
              ? 'Antes de contar con un seguro, revisa vigencia, eventos cubiertos, exclusiones, límites y costos.'
              : current.feedback,
          tone: feedback === null ? 'info' : feedback ? 'success' : 'review',
        }}
        adviceCue={cue}
        error={error}
        status={busy ? 'Guardando…' : dirty ? 'Cambios sin guardar.' : 'Tu avance está guardado.'}
        actions={
          <div className="spr-actions">
            {draft.stage === 'compare' && (
              <button
                className="ca-primary"
                onClick={() => void persist({ ...draft, stage: 'cases' })}
              >
                Practicar con casos
              </button>
            )}
            {draft.stage === 'cases' && (
              <button className="ca-primary" disabled={!draft.pending || busy} onClick={confirm}>
                {draft.caseIndex === CASES.length - 1
                  ? 'Confirmar y elegir acción'
                  : 'Confirmar caso'}
              </button>
            )}
            {draft.stage === 'action' && (
              <button
                className="ca-primary"
                disabled={!draft.action || busy}
                onClick={() => void persist({ ...draft, stage: 'review' })}
              >
                Revisar mi acción
              </button>
            )}
            {draft.stage === 'review' && (
              <>
                <button
                  className="spr-secondary"
                  onClick={() => {
                    setDraft((value) => ({ ...value, stage: 'action' }));
                    setDirty(true);
                  }}
                >
                  Cambiar
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
        {draft.stage === 'compare' && (
          <section className="spr-compare">
            <article>
              <span>Ahorro</span>
              <strong>Dinero disponible</strong>
              <p>Puede atender un gasto hasta el monto acumulado.</p>
            </article>
            <article>
              <span>Seguro</span>
              <strong>Cobertura contratada</strong>
              <p>Responde solo según condiciones, límites y vigencia.</p>
            </article>
            <article>
              <span>Combinación</span>
              <strong>Capas distintas</strong>
              <p>El ahorro puede cubrir costos o tiempos que la póliza no absorbe.</p>
            </article>
          </section>
        )}
        {draft.stage === 'cases' && (
          <section className="spr-case">
            <span>Situación</span>
            <h3>{current.title}</h3>
            <p>{current.text}</p>
            <div role="group" aria-label="Elige una herramienta">
              {TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  className={draft.pending === tool.id ? 'is-selected' : ''}
                  aria-pressed={draft.pending === tool.id}
                  onClick={() => {
                    setDraft((value) => ({ ...value, pending: tool.id }));
                    setCue(`${current.title}: ${tool.label}`);
                    setDirty(true);
                  }}
                >
                  {tool.label}
                </button>
              ))}
            </div>
          </section>
        )}
        {draft.stage === 'action' && (
          <section className="spr-select">
            <p>Si ya tienes una póliza, ¿qué revisarás primero?</p>
            {ACTIONS.map((item) => (
              <label key={item.id}>
                <input
                  type="radio"
                  name="action"
                  checked={draft.action === item.id}
                  onChange={() => {
                    setDraft((value) => ({ ...value, action: item.id }));
                    setDirty(true);
                  }}
                />
                {item.label}
              </label>
            ))}
          </section>
        )}
        {reviewing && (
          <section className="spr-review">
            <span>Tu próximo paso</span>
            <h3>{ACTIONS.find((item) => item.id === draft.action)?.label}</h3>
            <p>
              Haz la revisión directamente en la carátula, condiciones o canal oficial de tu
              cobertura.
            </p>
          </section>
        )}
      </ActivityFrame>
    </LessonShell>
  );
}
