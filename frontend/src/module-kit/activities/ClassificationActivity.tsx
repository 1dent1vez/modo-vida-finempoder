import { useMemo } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Grip,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import ActivityFrame from './ActivityFrame';
import type {
  ClassificationCategory,
  ClassificationItem,
  ClassificationState,
} from './classificationModel';
import './classification.css';
export default function ClassificationActivity({
  items,
  state,
  busy,
  error,
  onChange,
}: {
  items: ClassificationItem[];
  state: ClassificationState;
  busy: boolean;
  error: string | null;
  onChange: (state: ClassificationState) => void;
}) {
  const focusKey = useMemo(() => `${state.index}-${state.started}`, [state.index, state.started]);
  const item = items[state.index];
  const reviewed = state.index === items.length;
  const correct = state.selected === item?.category;
  const choose = (category: ClassificationCategory) => {
    if (!busy && !(state.checked && correct))
      onChange({ ...state, selected: category, checked: false });
  };
  const check = () => {
    if (!state.selected) return;
    onChange({
      ...state,
      checked: true,
      firstAnswers:
        state.firstAnswers.length > state.index
          ? state.firstAnswers
          : [...state.firstAnswers, state.selected],
    });
  };
  const next = () => onChange({ ...state, index: state.index + 1, selected: null, checked: false });
  const score = items.filter((it, i) => state.firstAnswers[i] === it.category).length;
  const advice = reviewed
    ? {
        title: 'Ya sabes qué mirar',
        text: 'Antes de planear, revisa cuánto recibirás y cuándo. Un ingreso fijo tampoco es para siempre: fíjate hasta cuándo está confirmado.',
        tone: 'success' as const,
      }
    : state.checked
      ? {
          title: correct ? 'Así es' : 'Revisa una pista',
          text: correct
            ? item.explanation
            : 'Vuelve a mirar el monto y la frecuencia de este ejemplo. Si alguno cambia, es variable. Puedes ajustar tu respuesta.',
          tone: correct ? ('success' as const) : ('review' as const),
        }
      : {
          title: 'Mira el monto y la frecuencia',
          text: 'Un ingreso fijo tiene una cantidad y una frecuencia definidas. Si alguna de las dos cambia, clasifícalo como variable.',
        };
  return (
    <ActivityFrame
      label="Clasificación de ingresos"
      busy={busy}
      title={reviewed ? 'Cada ingreso tiene su lugar.' : 'Cada ingreso, en su lugar.'}
      description="Reconoce con qué dinero puedes contar antes de hacer tu presupuesto."
      stepLabel={reviewed ? 'Revisión completa' : `${state.index + 1} de ${items.length} ingresos`}
      progressLabel="Ingresos revisados"
      progressValue={state.index}
      progressMax={items.length}
      focusKey={focusKey}
      advice={advice}
      adviceCue={reviewed ? 'reviewed' : state.checked ? `${state.index}-${state.selected}` : null}
      error={error ? `${error} Vuelve a pulsar la misma acción para reintentar.` : null}
      status={
        busy
          ? 'Guardando tu avance…'
          : state.completed
            ? 'Actividad guardada.'
            : state.started
              ? 'Tus respuestas se guardan al avanzar.'
              : 'Puedes salir y retomar esta práctica.'
      }
      actions={
        !state.completed && (
          <button
            className="ca-primary"
            type="button"
            disabled={busy || (state.started && !reviewed && state.selected === null)}
            onClick={() =>
              !state.started
                ? onChange({ ...state, started: true })
                : reviewed
                  ? onChange({ ...state, completed: true })
                  : state.checked && correct
                    ? next()
                    : check()
            }
          >
            {!state.started
              ? 'Comenzar clasificación'
              : reviewed
                ? 'Guardar y terminar'
                : state.checked && correct
                  ? state.index === items.length - 1
                    ? 'Revisar lo aprendido'
                    : 'Siguiente ingreso'
                  : 'Comprobar'}
            <ArrowRight size={18} />
          </button>
        )
      }
    >
      {!state.started ? (
        <div className="ca-intro">
          <p>
            Algunos ingresos llegan con un monto y una frecuencia conocidos. Otros cambian o
            aparecen de vez en cuando.
          </p>
          <dl>
            <div>
              <dt>
                <ShieldCheck size={23} />
                Fijo
              </dt>
              <dd>Monto y frecuencia definidos.</dd>
            </div>
            <div>
              <dt>
                <SlidersHorizontal size={23} />
                Variable
              </dt>
              <dd>Monto o frecuencia cambian.</dd>
            </div>
          </dl>
          <p>
            Clasifica {items.length} situaciones. Finni te dará pistas y podrás corregir antes de
            avanzar.
          </p>
        </div>
      ) : reviewed ? (
        <div className="ca-summary">
          <CheckCircle2 size={42} aria-hidden="true" />
          <h3>Revisaste los {items.length} ingresos.</h3>
          <p>
            {score} de {items.length} correctos en tu primer intento.{' '}
            {score === items.length
              ? 'Reconociste el patrón en cada situación.'
              : 'Las correcciones te ayudaron a revisar el resto.'}
          </p>
          <ul>
            {items.map((it) => (
              <li key={it.id}>
                <span>{it.title}</span>
                <strong>{it.category === 'fijo' ? 'Fijo' : 'Variable'}</strong>
              </li>
            ))}
          </ul>
          <p>
            Ahora puedes planear con lo que está confirmado y ser más prudente con lo que varía.
          </p>
        </div>
      ) : (
        <div className="ca-work">
          <div>
            <article
              className="ca-ticket"
              draggable={!busy && !(state.checked && correct)}
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', item.id);
                e.dataTransfer.effectAllowed = 'move';
              }}
            >
              <div>
                <Grip size={20} aria-hidden="true" />
              </div>
              <h3>{item.title}</h3>
              <p>Ejemplo: {item.context}</p>
              <span>¿Con qué certeza puedes contar con este ingreso?</span>
            </article>
            <p className="ca-instruction">Arrastra la tarjeta o toca un destino.</p>
            <div className="ca-targets">
              {(['fijo', 'variable'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  disabled={busy || (state.checked && correct)}
                  aria-pressed={state.selected === type}
                  onClick={() => choose(type)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.getData('text/plain') === item.id) choose(type);
                  }}
                >
                  <span>
                    {type === 'fijo' ? <ShieldCheck size={25} /> : <SlidersHorizontal size={25} />}
                  </span>
                  <strong>Ingreso {type}</strong>
                  <small>
                    {type === 'fijo'
                      ? 'Monto y frecuencia definidos'
                      : 'Monto o frecuencia cambian'}
                  </small>
                  {state.selected === type && <Check className="ca-selected" size={17} />}
                </button>
              ))}
            </div>
          </div>
          <aside className="ca-reviewed">
            <h3>
              Lo que ya revisaste{' '}
              <span>
                {state.index}/{items.length}
              </span>
            </h3>
            {state.index === 0 ? (
              <p>Aquí aparecerán los ingresos revisados.</p>
            ) : (
              <ul>
                {items.slice(0, state.index).map((it) => (
                  <li key={it.id}>
                    <Check size={16} />
                    <span>{it.title}</span>
                    <small>{it.category}</small>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      )}
    </ActivityFrame>
  );
}
