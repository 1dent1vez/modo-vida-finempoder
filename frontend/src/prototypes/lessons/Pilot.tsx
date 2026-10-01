import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import FinniAssistant from '../../shared/components/finni/FinniAssistant';
import type { FinniAdvice } from '../../shared/components/finni/FinniAssistant';
import {
  ArrowDown,
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  ChevronDown,
  CircleHelp,
  Coins,
  Grip,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Wallet,
  X,
} from 'lucide-react';
import { cases, incomeItems, initialState, money, restore, STORAGE_KEY } from './model';
import type { Activity, Category, PilotState } from './model';

const activities: {
  id: Activity;
  title: string;
  verb: string;
  icon: typeof Coins;
  lesson: string;
}[] = [
  {
    id: 'clasifica',
    title: 'Cada ingreso, en su lugar',
    verb: 'Clasifica',
    icon: Coins,
    lesson: 'Ingresos fijos y variables',
  },
  {
    id: 'experimenta',
    title: 'Haz espacio para tu ahorro',
    verb: 'Experimenta',
    icon: SlidersHorizontal,
    lesson: 'Distribución del presupuesto',
  },
  {
    id: 'decide',
    title: 'Tu plan también puede cambiar',
    verb: 'Decide',
    icon: ShieldCheck,
    lesson: 'Decisiones ante imprevistos',
  },
];
function Action({
  children,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button className="pilot-primary" onClick={onClick} disabled={disabled}>
      {children}
      <ArrowRight size={19} aria-hidden="true" />
    </button>
  );
}
function readSaved() {
  try {
    return restore(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}
export default function Pilot() {
  const [state, setState] = useState<PilotState>(() => readSaved() ?? initialState());
  const [resumed, setResumed] = useState(() => readSaved() !== null);
  const [storageError, setStorageError] = useState(false);
  const [help, setHelp] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [saved, setSaved] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const focusKey = `${state.activity}-${state.classified.length}-${state.scenario}-${state.done.includes(state.activity)}`;
  useEffect(() => {
    heading.current?.focus();
  }, [focusKey]);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setStorageError(false);
      setSaved(true);
    } catch {
      setStorageError(true);
      setSaved(false);
    }
  }, [state]);
  const update = (patch: Partial<PilotState>) => setState((s) => ({ ...s, ...patch }));
  const finish = (activity: Activity) =>
    setState((s) => ({ ...s, done: [...new Set([...s.done, activity])] }));
  const navigate = (activity: Activity) => {
    update({ activity });
    setHelp(false);
  };
  const resetActivity = () => {
    const fresh = initialState();
    const patch =
      state.activity === 'clasifica'
        ? { classified: fresh.classified, selected: null, checked: false }
        : state.activity === 'experimenta'
          ? {
              needs: fresh.needs,
              wants: fresh.wants,
              simulationAnswer: null,
              simulationChecked: false,
            }
          : { scenario: 0, choice: null, revealed: false, decisions: [] };
    update({ ...patch, done: state.done.filter((a) => a !== state.activity) });
  };
  const current = activities.find((a) => a.id === state.activity)!;
  const completed = state.done.includes(state.activity);
  const item = incomeItems[Math.min(state.classified.length, 5)];
  const correct = state.selected === item.category;
  const savings = 6000 - state.needs - state.wants;
  const budgetValid = state.needs >= 3000 && savings >= 1500;
  const scenario = cases[state.scenario];
  const consequence = state.choice === null ? null : scenario.choices[state.choice];
  const progress = completed
    ? 100
    : state.activity === 'clasifica'
      ? (state.classified.length / 6) * 100
      : state.activity === 'experimenta'
        ? state.simulationChecked
          ? 75
          : state.wants !== 1800 || state.needs !== 3000
            ? 40
            : 0
        : (state.scenario / 3) * 100;
  const chooseCategory = (category: Category) => {
    if (!(state.checked && correct)) update({ selected: category, checked: false });
    setDragging(false);
  };
  const numericUpdate = (key: 'needs' | 'wants', value: string) => {
    const n = Number(value);
    const normalized = Number.isFinite(n)
      ? Math.max(key === 'needs' ? 2500 : 0, Math.min(key === 'needs' ? 4500 : 3000, Math.round(n)))
      : state[key];
    update({ [key]: normalized, simulationChecked: false, simulationAnswer: null });
    return normalized;
  };
  let advice: FinniAdvice = {
    title: 'Una pista',
    text: 'Fíjate en el monto y en la frecuencia. Un ingreso fijo tiene ambos definidos; uno variable puede cambiar.',
  };
  let cue: string | null = null;
  if (state.activity === 'clasifica' && state.checked) {
    advice = {
      title: correct ? 'Así es' : 'Revisa una pista',
      text: correct
        ? item.explanation
        : '¿Sabes cuánto llegará y cada cuándo? Revisa la descripción del ingreso y prueba otro destino.',
      tone: correct ? 'success' : 'review',
    };
    cue = `class-${state.classified.length}-${state.selected}`;
  } else if (state.activity === 'experimenta') {
    const wrong = state.simulationAnswer !== null && state.simulationAnswer !== 0;
    advice = wrong
      ? {
          title: 'Mira el ingreso',
          text: 'Sigues teniendo $6,000. El dinero extra para ahorrar sale de cambiar cómo lo repartes, no de un ingreso nuevo.',
          tone: 'review',
        }
      : savings < 0
        ? {
            title: 'El plan necesita un ajuste',
            text: `Tus gastos superan tu ingreso en ${money(-savings)}. Prueba reducir un gasto flexible.`,
            tone: 'review',
          }
        : budgetValid
          ? {
              title: 'Ya hiciste espacio',
              text: `Ahora puedes apartar ${money(savings)}. Antes de terminar, identifica qué decisión hizo posible ese cambio.`,
              tone: 'success',
            }
          : {
              title: 'Probemos con los gustos',
              text: 'Mantén $3,000 para tus básicos. ¿Qué pasa si bajas de $1,800 a $1,500 el monto para gustos?',
            };
    if (wrong) cue = `budget-answer-${state.simulationAnswer}`;
    else if (savings < 0) cue = 'budget-deficit';
    else if (budgetValid) cue = 'budget-ready';
  } else if (state.activity === 'decide') {
    advice = {
      title: consequence && state.revealed ? 'Antes de decidir' : 'Mira los dos lados',
      text:
        consequence && state.revealed
          ? consequence.lesson
          : 'Compara lo que resuelves hoy con lo que tendrás que ajustar después. Puedes explorar otra opción antes de seguir.',
    };
    if (state.revealed) cue = `decision-${state.scenario}-${state.choice}`;
  }
  if (completed) {
    advice = {
      title: 'Esto ya es tuyo',
      text: 'Te llevas una forma de decidir mejor. Puedes repetir la práctica o probar otra actividad cuando quieras.',
      tone: 'success',
    };
    cue = `complete-${state.activity}`;
  }
  return (
    <div className="lesson-pilot">
      <header className="pilot-topbar">
        <a href="/piloto.html" className="pilot-brand" aria-label="FinEmpoder, inicio del piloto">
          <span className="brand-symbol">
            <Coins size={24} />
          </span>
          FinEmpoder<span className="brand-dot">.</span>
        </a>
        <span className="pilot-mode">Laboratorio de lecciones</span>
        <span className="sandbox-label">
          <ShieldCheck size={16} />
          Práctica con datos de ejemplo
        </span>
      </header>
      <div className="pilot-container">
        <nav className="pilot-nav" aria-label="Actividades del piloto">
          {activities.map((a, i) => (
            <button
              key={a.id}
              aria-current={a.id === state.activity ? 'step' : undefined}
              className={a.id === state.activity ? 'active' : ''}
              onClick={() => navigate(a.id)}
            >
              <span className="nav-number">
                {state.done.includes(a.id) ? <Check size={16} /> : i + 1}
              </span>
              <a.icon size={18} aria-hidden="true" />
              <span>{a.verb}</span>
            </button>
          ))}
        </nav>
        {resumed && (
          <div className="pilot-resume">
            <span>Retomaste tu práctica con tus respuestas anteriores.</span>
            <button aria-label="Cerrar aviso de reanudación" onClick={() => setResumed(false)}>
              <X size={18} />
            </button>
          </div>
        )}
        <main id="actividad" className="pilot-workspace">
          <div className="activity-topline">
            <span>
              Presupuesto <span aria-hidden="true">/</span> {current.lesson}
            </span>
            <button
              className="pilot-help"
              aria-label="Cómo funciona"
              aria-expanded={help}
              aria-controls="pilot-help-content"
              onClick={() => setHelp(!help)}
            >
              <CircleHelp size={18} />
              <span>Cómo funciona</span>
            </button>
          </div>
          <div
            className="pilot-progress"
            role="progressbar"
            aria-label="Progreso de esta actividad"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ transform: `scaleX(${progress / 100})` }} />
          </div>
          {help && (
            <div id="pilot-help-content" className="pilot-help-content">
              {state.activity === 'clasifica'
                ? 'Arrastra el ingreso a un destino o toca uno de los dos botones. Comprueba tu elección; si hace falta, cámbiala y vuelve a intentarlo.'
                : state.activity === 'experimenta'
                  ? 'Mueve los controles o escribe un monto. El ahorro es lo que queda de los $6,000. Busca apartar al menos $1,500 y mantener $3,000 para necesidades.'
                  : 'Elige una decisión y observa qué cambia. Puedes explorar otra opción antes de pasar al siguiente caso. No hay una puntuación: importa comprender el efecto.'}
            </div>
          )}
          <div className="activity-heading">
            <div>
              <h1 ref={heading} tabIndex={-1}>
                {completed ? 'Esto ya te lo llevas.' : current.title}
              </h1>
              <p>
                {completed
                  ? 'Una herramienta más para decidir con tu dinero.'
                  : state.activity === 'clasifica'
                    ? 'Reconoce con qué dinero puedes contar cada mes.'
                    : state.activity === 'experimenta'
                      ? 'Prueba un reparto y mira cómo cambia lo que puedes apartar.'
                      : 'Lo importante es entender qué cambia con cada decisión.'}
              </p>
            </div>
            <span className="activity-position">
              {completed
                ? 'Completada'
                : state.activity === 'clasifica'
                  ? `${state.classified.length + 1} de 6 ingresos`
                  : state.activity === 'experimenta'
                    ? 'Un presupuesto, varias posibilidades'
                    : `Caso ${state.scenario + 1} de 3`}
            </span>
          </div>
          {completed ? (
            <section className="pilot-completion">
              <div className="completion-seal">
                <CheckCircle2 size={46} />
              </div>
              <h2>
                {state.activity === 'clasifica'
                  ? 'Sabes qué ingresos son constantes.'
                  : state.activity === 'experimenta'
                    ? `Encontraste ${money(savings)} para ahorrar.`
                    : 'Probaste decisiones y sus consecuencias.'}
              </h2>
              <p>
                {state.activity === 'clasifica'
                  ? 'Clasificaste seis ingresos. La frecuencia y la certeza del monto te ayudan a armar un plan más realista.'
                  : state.activity === 'experimenta'
                    ? `Conservaste ${money(state.needs)} para necesidades y destinaste ${money(state.wants)} a gustos. Este reparto es un ejemplo que puedes seguir explorando.`
                    : 'Ante un imprevisto, puedes comparar lo que resuelves hoy con lo que comprometes después.'}
              </p>
              {state.activity === 'decide' && (
                <ul className="decision-summary">
                  {state.decisions.map((d, i) => (
                    <li key={i}>
                      <span>Caso {i + 1}</span>
                      <strong>{cases[i].choices[d].title}</strong>
                    </li>
                  ))}
                </ul>
              )}
              <div className="completion-actions">
                <Action
                  onClick={() =>
                    navigate(
                      activities[(activities.findIndex((a) => a.id === state.activity) + 1) % 3].id,
                    )
                  }
                >
                  {state.done.length === 3 ? 'Volver a explorar' : 'Probar otra actividad'}
                </Action>
                <button className="pilot-text-button" onClick={resetActivity}>
                  <RotateCcw size={17} />
                  Repetir esta práctica
                </button>
              </div>
            </section>
          ) : state.activity === 'clasifica' ? (
            <div className="activity-grid classify-grid">
              <section className="classification-stage" aria-label="Clasificar ingreso">
                <div className="income-stack">
                  <div
                    className="income-ticket"
                    draggable={!(state.checked && correct)}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', 'finempoder-income');
                      e.dataTransfer.effectAllowed = 'move';
                      setDragging(true);
                    }}
                    onDragEnd={() => setDragging(false)}
                  >
                    <div className="ticket-top">
                      <span>
                        <Wallet size={19} />
                        Ingreso de ejemplo
                      </span>
                      <Grip size={19} aria-hidden="true" />
                    </div>
                    <h2>{item.name}</h2>
                    <strong className="ticket-amount">{money(item.amount)}</strong>
                    <p>{item.context}</p>
                    <div className="ticket-bottom">
                      <span>¿Fijo o variable?</span>
                      <ArrowDown size={18} />
                    </div>
                  </div>
                </div>
                <p className="drop-instruction">Arrastra el ingreso o toca su destino.</p>
                <div className="drop-targets">
                  {(['fijo', 'variable'] as const).map((category) => (
                    <button
                      key={category}
                      className={`drop-target ${state.selected === category ? 'selected' : ''} ${dragging ? 'accepting' : ''}`}
                      aria-pressed={state.selected === category}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.getData('text/plain') === 'finempoder-income')
                          chooseCategory(category);
                      }}
                      onClick={() => chooseCategory(category)}
                      disabled={state.checked && correct}
                    >
                      <span className="target-symbol">
                        {category === 'fijo' ? (
                          <ShieldCheck size={25} />
                        ) : (
                          <SlidersHorizontal size={25} />
                        )}
                      </span>
                      <strong>{category === 'fijo' ? 'Ingreso fijo' : 'Ingreso variable'}</strong>
                      <span>
                        {category === 'fijo'
                          ? 'Monto y frecuencia definidos'
                          : 'Monto o frecuencia cambian'}
                      </span>
                      {state.selected === category && <Check className="target-check" size={19} />}
                    </button>
                  ))}
                </div>
              </section>
              <aside className="activity-side">
                <div className="side-intro">
                  <span className="small-icon">
                    <Coins size={21} />
                  </span>
                  <h2>Tu plan empieza aquí.</h2>
                  <p>
                    Un ingreso puede llegar seguido y aun así cambiar de cantidad. Fíjate en las dos
                    cosas.
                  </p>
                </div>
                <div className="classified-list">
                  <h3>
                    Ingresos revisados <span>{state.classified.length}/6</span>
                  </h3>
                  {state.classified.length === 0 ? (
                    <p className="empty-list">
                      Aquí aparecerán los ingresos que hayas clasificado.
                    </p>
                  ) : (
                    incomeItems.slice(0, state.classified.length).map((it, i) => (
                      <div key={it.name}>
                        <Check size={16} />
                        <span>{it.name}</span>
                        <b>{state.classified[i] === 'fijo' ? 'Fijo' : 'Variable'}</b>
                      </div>
                    ))
                  )}
                </div>
              </aside>
            </div>
          ) : state.activity === 'experimenta' ? (
            <div className="activity-grid simulator-grid">
              <section className="budget-controls">
                <div className="mobile-budget-summary" aria-live="polite">
                  <span>{savings < 0 ? 'Falta cubrir' : 'Disponible para ahorrar'}</span>
                  <strong>{money(Math.abs(savings))}</strong>
                </div>
                <div className="budget-goal">
                  <Sparkles size={22} />
                  <p>
                    <strong>Tu reto: apartar $300 más.</strong>
                    <span>
                      Conserva al menos $3,000 para necesidades y llega a $1,500 de ahorro.
                    </span>
                  </p>
                </div>
                {(
                  [
                    {
                      key: 'needs',
                      label: 'Necesidades',
                      note: 'Transporte, comida y otros básicos',
                      min: 2500,
                      max: 4500,
                    },
                    {
                      key: 'wants',
                      label: 'Gustos',
                      note: 'Salidas, compras y entretenimiento',
                      min: 0,
                      max: 3000,
                    },
                  ] as const
                ).map((field) => (
                  <div className={`budget-field ${field.key}`} key={field.key}>
                    <div>
                      <label htmlFor={`${field.key}-number`}>{field.label}</label>
                      <div className="money-input">
                        <span aria-hidden="true">$</span>
                        <input
                          id={`${field.key}-number`}
                          type="number"
                          min={field.min}
                          max={field.max}
                          step={100}
                          key={`${field.key}-${state[field.key]}`}
                          defaultValue={state[field.key]}
                          onBlur={(e) => {
                            e.currentTarget.value = String(
                              numericUpdate(field.key, e.currentTarget.value),
                            );
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') e.currentTarget.blur();
                          }}
                        />
                      </div>
                    </div>
                    <p>{field.note}</p>
                    <input
                      aria-label={`Ajustar ${field.label.toLowerCase()}`}
                      type="range"
                      min={field.min}
                      max={field.max}
                      step={100}
                      value={state[field.key]}
                      onChange={(e) => numericUpdate(field.key, e.target.value)}
                    />
                    <div className="range-labels">
                      <span>{money(field.min)}</span>
                      <span>{money(field.max)}</span>
                    </div>
                  </div>
                ))}
                <button
                  className="pilot-text-button"
                  onClick={() =>
                    update({
                      needs: 3000,
                      wants: 1800,
                      simulationChecked: false,
                      simulationAnswer: null,
                    })
                  }
                >
                  <RotateCcw size={16} />
                  Volver al reparto inicial
                </button>
                {state.simulationChecked && (
                  <fieldset className="transfer-question">
                    <legend>¿De dónde salió el ahorro adicional?</legend>
                    {[
                      'De redistribuir el mismo ingreso',
                      'De recibir un ingreso nuevo',
                      'De una ganancia garantizada',
                    ].map((t, i) => (
                      <label key={t}>
                        <input
                          type="radio"
                          name="interpretation"
                          checked={state.simulationAnswer === i}
                          onChange={() => update({ simulationAnswer: i })}
                        />
                        {t}
                      </label>
                    ))}
                  </fieldset>
                )}
              </section>
              <aside className="budget-result">
                <div className="budget-result-top">
                  <Wallet size={23} />
                  <span>Tu mes en una mirada</span>
                </div>
                <p>
                  Ingreso del ejemplo <strong>$6,000</strong>
                </p>
                <div className="budget-bar" aria-hidden="true">
                  <span className="needs-part" style={{ flex: state.needs }} />
                  <span className="wants-part" style={{ flex: state.wants }} />
                  <span className="savings-part" style={{ flex: Math.max(0, savings) }} />
                </div>
                <dl>
                  <div>
                    <dt>
                      <i className="dot-needs" />
                      Necesidades
                    </dt>
                    <dd>{money(state.needs)}</dd>
                  </div>
                  <div>
                    <dt>
                      <i className="dot-wants" />
                      Gustos
                    </dt>
                    <dd>{money(state.wants)}</dd>
                  </div>
                </dl>
                <div className={`savings-total ${savings < 0 ? 'deficit' : ''}`}>
                  <span>{savings < 0 ? 'Te falta cubrir' : 'Te queda para ahorrar'}</span>
                  <strong>{money(Math.abs(savings))}</strong>
                  <span>
                    {savings < 0
                      ? 'Tus gastos superan los $6,000 de ingreso.'
                      : `${savings >= 1200 ? '+' : '−'}${money(Math.abs(savings - 1200))} frente al reparto inicial`}
                  </span>
                </div>
                <div className="goal-status">
                  <span>
                    {state.needs >= 3000 ? <CheckCircle2 size={17} /> : <Circle size={17} />}
                    {state.needs >= 3000 ? 'Necesidades cubiertas' : 'Revisa los gastos básicos'}
                  </span>
                  <span>
                    {savings >= 1500 ? <CheckCircle2 size={17} /> : <Circle size={17} />}
                    {savings >= 1500
                      ? 'Meta de ahorro alcanzada'
                      : `Faltan ${money(1500 - savings)} para la meta`}
                  </span>
                </div>
              </aside>
            </div>
          ) : (
            <div className="activity-grid decision-grid">
              <section className="scenario-stage">
                <div className="scenario-story">
                  <span className="scenario-icon">
                    <ShieldCheck size={27} />
                  </span>
                  <h2>{scenario.title}</h2>
                  <p>{scenario.detail}</p>
                  <div className="scenario-cost">
                    <span>{scenario.label}</span>
                    <strong>{money(scenario.amount)}</strong>
                  </div>
                </div>
                <fieldset className="scenario-choices">
                  <legend>¿Qué harías en este caso?</legend>
                  {scenario.choices.map((choice, i) => (
                    <label className={state.choice === i ? 'selected' : ''} key={choice.title}>
                      <input
                        type="radio"
                        name="decision"
                        checked={state.choice === i}
                        onChange={() => update({ choice: i, revealed: false })}
                      />
                      <span>
                        <strong>{choice.title}</strong>
                        <span>{choice.detail}</span>
                      </span>
                    </label>
                  ))}
                </fieldset>
              </section>
              <aside className="consequence-panel">
                {state.revealed && consequence ? (
                  <>
                    <span className="small-icon">
                      <ArrowRight size={23} />
                    </span>
                    <h2>Esto cambiaría.</h2>
                    <strong className="consequence-result">{consequence.after}</strong>
                    <p>{consequence.effect}</p>
                    <button
                      className="pilot-text-button"
                      onClick={() => update({ choice: null, revealed: false })}
                    >
                      <RotateCcw size={16} />
                      Explorar otra opción
                    </button>
                  </>
                ) : (
                  <>
                    <div className="comparison-symbol">
                      <ArrowRight size={31} />
                    </div>
                    <h2>Cada decisión mueve algo.</h2>
                    <p>
                      Elige una opción para ver qué resuelves hoy y qué tendrías que ajustar
                      después.
                    </p>
                    <div className="consequence-placeholder">
                      <span>Tu decisión</span>
                      <ChevronDown size={20} />
                      <span>Lo que cambia</span>
                      <ChevronDown size={20} />
                      <span>Una idea para llevarte</span>
                    </div>
                  </>
                )}
              </aside>
            </div>
          )}
          <FinniAssistant
            key={`${state.activity}-${state.classified.length}-${state.scenario}`}
            advice={advice}
            cue={cue}
          />
          {!completed && (
            <footer className="activity-footer">
              <span>
                {state.activity === 'clasifica'
                  ? state.selected === null
                    ? 'Elige un destino para continuar.'
                    : state.checked && correct
                      ? 'Ingreso revisado. Sigamos.'
                      : 'Puedes cambiar tu elección.'
                  : state.activity === 'experimenta'
                    ? budgetValid
                      ? 'Tu reparto cumple el reto.'
                      : 'Ajusta tu reparto para alcanzar el reto.'
                    : state.revealed
                      ? 'Puedes explorar otra opción antes de seguir.'
                      : 'Elige una opción para ver qué cambia.'}
              </span>
              {state.activity === 'clasifica' ? (
                <Action
                  disabled={state.selected === null}
                  onClick={() => {
                    if (state.checked && correct) {
                      const classified = [...state.classified, state.selected!];
                      update({
                        classified,
                        selected: null,
                        checked: false,
                        ...(classified.length === 6
                          ? { done: [...new Set([...state.done, 'clasifica' as const])] }
                          : {}),
                      });
                    } else update({ checked: true });
                  }}
                >
                  {state.checked && correct
                    ? state.classified.length === 5
                      ? 'Terminar clasificación'
                      : 'Siguiente ingreso'
                    : 'Comprobar'}
                </Action>
              ) : state.activity === 'experimenta' ? (
                <Action
                  disabled={
                    !budgetValid || (state.simulationChecked && state.simulationAnswer !== 0)
                  }
                  onClick={() =>
                    state.simulationChecked
                      ? finish('experimenta')
                      : update({ simulationChecked: true })
                  }
                >
                  {state.simulationChecked ? 'Guardar este aprendizaje' : 'Revisar mi reparto'}
                </Action>
              ) : (
                <Action
                  disabled={state.choice === null}
                  onClick={() => {
                    if (!state.revealed) update({ revealed: true });
                    else {
                      const decisions = [
                        ...state.decisions.slice(0, state.scenario),
                        state.choice!,
                      ];
                      update(
                        state.scenario === 2
                          ? { decisions, done: [...new Set([...state.done, 'decide' as const])] }
                          : {
                              decisions,
                              scenario: state.scenario + 1,
                              choice: null,
                              revealed: false,
                            },
                      );
                    }
                  }}
                >
                  {state.revealed
                    ? state.scenario === 2
                      ? 'Ver lo que aprendí'
                      : 'Siguiente caso'
                    : 'Ver consecuencia'}
                </Action>
              )}
            </footer>
          )}
        </main>
        <footer className="pilot-bottom">
          <span>
            {storageError
              ? 'No pudimos guardar en este navegador. Tu práctica sigue disponible mientras no cierres la página.'
              : saved
                ? 'Práctica guardada en este navegador.'
                : 'Preparando tu práctica…'}
          </span>
          <span>{state.done.length} de 3 actividades completadas</span>
          <button
            className="pilot-text-button"
            onClick={() => {
              setState(initialState());
              setResumed(false);
              setHelp(false);
            }}
          >
            <RotateCcw size={15} />
            Reiniciar piloto
          </button>
        </footer>
        <a className="pilot-back" href="/piloto.html?preview=404">
          Ver página 404
        </a>
        <p className="pilot-disclaimer">
          Este espacio de prueba no cambia tus lecciones, tus registros financieros ni tus XP.
        </p>
      </div>
    </div>
  );
}
