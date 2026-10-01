import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, RotateCcw, Scale, WalletCards } from 'lucide-react';
import LessonShell from '../LessonShell';
import ActivityFrame, {
  ActivityLoadError,
  ActivityLoading,
} from '../../../../module-kit/activities/ActivityFrame';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import { useAuth } from '../../../../store/auth';
import {
  decisionScore,
  initialDecision,
  parseDecision,
  type DecisionDraft,
  type DecisionScenario,
} from '../../../../module-kit/activities/decisionModel';
import '../../../../module-kit/activities/classification.css';
import '../../../../module-kit/activities/decision-scenario.css';

// eslint-disable-next-line react-refresh/only-export-components -- scenarios exported for lesson contract tests
export const CRISIS_SCENARIOS: DecisionScenario[] = [
  {
    id: 'transport',
    title: 'Tu transporte del mes se terminó antes de tiempo',
    context:
      'Necesitas $300 para tus traslados y tienes $320 disponibles para los próximos 12 días.',
    options: [
      {
        id: 'cancel-dinner',
        label: 'Cancelar una cena planeada de $300',
        consequence: 'Conservas el dinero del transporte y pospones una salida.',
        liquidity: '$20 después de cubrir el transporte',
        tradeoff: 'Renuncias a la cena por ahora.',
        principle: 'Mover dinero de un deseo a una necesidad protege tu operación diaria.',
        score: 90,
      },
      {
        id: 'pause-streaming',
        label: 'Pausar streaming y buscar otros $111',
        consequence: 'Libera $189, pero todavía debes ajustar otra partida.',
        liquidity: '$209 disponibles; faltan $111',
        tradeoff: 'Necesitas una segunda decisión.',
        principle: 'Una solución parcial sirve si reconoces claramente lo que todavía falta.',
        score: 75,
      },
      {
        id: 'postpone-clothes',
        label: 'Posponer una compra de ropa de $300',
        consequence: 'Cubres el transporte sin tocar comida ni adquirir deuda.',
        liquidity: '$20 después de cubrir el transporte',
        tradeoff: 'La compra de ropa espera.',
        principle: 'Primero protege la necesidad y mueve un gasto que puede esperar.',
        score: 100,
      },
    ],
  },
  {
    id: 'printing',
    title: 'Necesitas imprimir un documento mañana',
    context: 'La impresión cuesta $80 y forma parte de una entrega importante. Aún tienes $320.',
    options: [
      {
        id: 'borrow',
        label: 'Pedir $80 prestados',
        consequence: 'Resuelves hoy, pero agregas un pago futuro.',
        liquidity: '$320 hoy y una deuda de $80',
        tradeoff: 'Tu siguiente ingreso ya tendrá un compromiso.',
        principle: 'Antes de endeudarte, compara si existe un gasto prescindible que puedas mover.',
        score: 65,
      },
      {
        id: 'food',
        label: 'Tomar $80 del dinero de comida',
        consequence: 'Cumples la entrega, pero reduces una necesidad durante la semana.',
        liquidity: '$240 disponibles',
        tradeoff: 'Tendrás menos margen para alimentos.',
        principle: 'Resolver algo urgente puede crear otra presión si recortas una necesidad.',
        score: 70,
      },
      {
        id: 'subscription',
        label: 'Cancelar una suscripción de $189',
        consequence: 'Cubres la impresión y conservas $109 del recorte.',
        liquidity: '$240 disponibles y $109 liberados',
        tradeoff: 'Pierdes temporalmente la suscripción.',
        principle: 'Recortar un deseo puede resolver lo urgente sin comprometer otra necesidad.',
        score: 100,
      },
    ],
  },
  {
    id: 'concert',
    title: 'Sale a la venta un concierto que deseas',
    context:
      'El boleto cuesta $350. Tienes $320 y no hay otro ingreso confirmado antes de la venta.',
    options: [
      {
        id: 'borrow-30',
        label: 'Pedir $30 prestados y comprarlo',
        consequence: 'Obtienes el boleto, quedas sin liquidez y sumas una deuda.',
        liquidity: '$0 y deuda de $30',
        tradeoff: 'No queda margen para un imprevisto.',
        principle: 'Un deseo que consume todo el saldo aumenta tu vulnerabilidad ante otro cambio.',
        score: 45,
      },
      {
        id: 'skip',
        label: 'No comprarlo y conservar el saldo',
        consequence: 'Mantienes margen para necesidades e imprevistos.',
        liquidity: '$320 disponibles',
        tradeoff: 'Te pierdes esta ocasión.',
        principle: 'Conservar margen también es una decisión válida cuando el gasto no cabe.',
        score: 90,
      },
      {
        id: 'search',
        label: 'Buscar una opción oficial más barata',
        consequence: 'Exploras otra ruta sin comprometer dinero todavía.',
        liquidity: '$320 mientras comparas',
        tradeoff: 'Puede que no encuentres una opción segura.',
        principle:
          'Comparar alternativas verificadas antes de pagar protege tu dinero y tu margen.',
        score: 100,
      },
    ],
  },
];

const KEY = 'l7_decisions:v1';
export default function L07() {
  const userId = useAuth((state) => state.user?.id ?? 'local');
  return <DecisionSession key={userId} />;
}

function DecisionSession() {
  const [state, setState] = useState(initialDecision);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);
  const inFlight = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(false);
    void lessonDataRepository
      .load('presupuesto', KEY)
      .then((raw) => {
        if (!active) return;
        setState(parseDecision(raw, CRISIS_SCENARIOS) ?? initialDecision());
        setLoading(false);
      })
      .catch(() => {
        if (active) {
          setLoading(false);
          setLoadError(true);
        }
      });
    return () => {
      active = false;
    };
  }, [retry]);
  const persist = async (next: DecisionDraft) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    try {
      if (next.completed) {
        await lessonDataRepository.saveBatch('presupuesto', [
          {
            key: 'l7_decisions',
            data: {
              decisions: next.decisions,
              score: decisionScore(next, CRISIS_SCENARIOS),
            },
          },
          { key: KEY, data: next },
        ]);
      } else {
        await lessonDataRepository.save('presupuesto', KEY, next);
      }
      if (!mounted.current) return;
      if (mounted.current) setState(next);
    } catch {
      if (mounted.current) setError('No pudimos guardar esta decisión. Intenta de nuevo.');
    } finally {
      inFlight.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  const scenario = CRISIS_SCENARIOS[state.index];
  const selected = scenario?.options.find((option) => option.id === state.selectedId);
  const summary = state.index === CRISIS_SCENARIOS.length;
  const score = decisionScore(state, CRISIS_SCENARIOS);
  const advice = summary
    ? {
        title: 'Ya tienes un método',
        text: 'Protege necesidades, calcula lo que queda y revisa el costo futuro antes de confirmar.',
        tone: 'success' as const,
      }
    : state.revealed && selected
      ? { title: 'Mira el intercambio', text: selected.principle, tone: 'review' as const }
      : {
          title: 'Haz visibles las consecuencias',
          text: 'Antes de elegir, compara qué necesidad proteges, cuánto dinero queda y qué compromiso aparece después.',
        };
  const confirm = () => {
    if (!scenario || !selected) return;
    void persist({
      ...state,
      decisions: { ...state.decisions, [scenario.id]: selected.id },
      index: state.index + 1,
      selectedId: null,
      revealed: false,
    });
  };
  return (
    <LessonShell
      id="L07"
      title="Ajusta tu presupuesto ante un imprevisto"
      showGreeting={false}
      completion={{ ready: !loading && !loadError && state.completed, score }}
    >
      {loading ? (
        <ActivityLoading message="Recuperando tus decisiones…" />
      ) : loadError ? (
        <ActivityLoadError
          message="No pudimos recuperar tus decisiones."
          onRetry={() => setRetry((value) => value + 1)}
        />
      ) : (
        <ActivityFrame
          label="Escenarios de decisiones"
          className="decision-activity"
          busy={busy}
          title={
            summary ? 'Revisa cómo tomaste tus decisiones.' : 'Decide sin perder de vista el mes.'
          }
          description={
            summary
              ? 'Los resultados muestran los intercambios que aceptaste.'
              : 'Compara liquidez, necesidades y compromisos antes de confirmar.'
          }
          stepLabel={
            summary
              ? 'Tres escenarios revisados'
              : `Escenario ${state.index + 1} de ${CRISIS_SCENARIOS.length}`
          }
          progressLabel="Escenarios confirmados"
          progressValue={state.index}
          progressMax={CRISIS_SCENARIOS.length}
          focusKey={state.index}
          advice={advice}
          adviceCue={
            state.revealed ? `${state.index}-${state.selectedId}` : summary ? 'summary' : null
          }
          error={error}
          status={
            busy
              ? 'Guardando tu decisión…'
              : state.completed
                ? 'Decisiones guardadas.'
                : 'Confirmaremos cada decisión antes de avanzar.'
          }
          actions={
            !state.completed && (
              <button
                className="ca-primary"
                disabled={busy || (state.started && !summary && !state.selectedId)}
                onClick={() =>
                  !state.started
                    ? void persist({ ...state, started: true })
                    : summary
                      ? void persist({ ...state, completed: true })
                      : state.revealed
                        ? confirm()
                        : void persist({ ...state, revealed: true })
                }
              >
                {!state.started
                  ? 'Comenzar escenarios'
                  : summary
                    ? 'Guardar y terminar'
                    : state.revealed
                      ? state.index === CRISIS_SCENARIOS.length - 1
                        ? 'Confirmar y revisar'
                        : 'Confirmar decisión'
                      : 'Ver consecuencia'}
                <ArrowRight size={18} />
              </button>
            )
          }
        >
          {!state.started ? (
            <div className="decision-intro">
              <div className="decision-balance">
                <WalletCards aria-hidden="true" />
                <strong>$320 disponibles</strong>
                <span>12 días hasta el siguiente ingreso del ejemplo</span>
              </div>
              <p>
                Vas a resolver tres situaciones ficticias. No existe una respuesta perfecta para
                todas las personas: aquí practicarás cómo comparar el efecto de cada opción.
              </p>
              <ul>
                <li>
                  <Check />
                  Protege lo necesario.
                </li>
                <li>
                  <Check />
                  Calcula cuánto queda.
                </li>
                <li>
                  <Check />
                  Observa deuda y compromisos futuros.
                </li>
              </ul>
            </div>
          ) : summary ? (
            <div className="decision-summary">
              <Scale size={38} aria-hidden="true" />
              <h3>Tus decisiones y sus intercambios</h3>
              <p>
                Resultado orientativo: {score}/100. La puntuación compara protección de necesidades,
                liquidez y deuda dentro de estos ejemplos.
              </p>
              <ol>
                {CRISIS_SCENARIOS.map((item) => {
                  const option = item.options.find(
                    (candidate) => candidate.id === state.decisions[item.id],
                  );
                  return (
                    <li key={item.id}>
                      <span>{item.title}</span>
                      <strong>{option?.label}</strong>
                      <small>{option?.liquidity}</small>
                    </li>
                  );
                })}
              </ol>
              <p>
                Tu método para un imprevisto: identifica la necesidad, calcula el saldo posterior y
                compara alternativas antes de adquirir una deuda.
              </p>
            </div>
          ) : (
            scenario && (
              <div className="decision-work">
                <article className="decision-case">
                  <h3>{scenario.title}</h3>
                  <p>{scenario.context}</p>
                  <div>
                    <span>Saldo del ejemplo</span>
                    <strong>$320</strong>
                  </div>
                </article>
                <div
                  className="decision-options"
                  role="radiogroup"
                  aria-label="Opciones de decisión"
                >
                  {scenario.options.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={state.selectedId === option.id}
                      disabled={busy || state.revealed}
                      onClick={() => setState({ ...state, selectedId: option.id, revealed: false })}
                    >
                      <span>{option.label}</span>
                      {state.selectedId === option.id && <Check size={18} aria-hidden="true" />}
                    </button>
                  ))}
                </div>
                {state.revealed && selected && (
                  <div className="decision-consequence" role="status">
                    <h3>Esto cambiaría</h3>
                    <p>{selected.consequence}</p>
                    <dl>
                      <div>
                        <dt>Liquidez</dt>
                        <dd>{selected.liquidity}</dd>
                      </div>
                      <div>
                        <dt>Intercambio</dt>
                        <dd>{selected.tradeoff}</dd>
                      </div>
                    </dl>
                    <button
                      className="decision-reconsider"
                      disabled={busy}
                      onClick={() => setState({ ...state, revealed: false })}
                    >
                      <RotateCcw size={17} />
                      Reconsiderar
                    </button>
                  </div>
                )}
              </div>
            )
          )}
        </ActivityFrame>
      )}
    </LessonShell>
  );
}
