import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

type GastoType = 'racional' | 'emocional' | 'impulsivo';

const SITUACIONES: { id: string; desc: string; correct: GastoType; explicacion: string }[] = [
  {
    id: 's1',
    desc: 'Comprar uniforme de deporte para la clase ($400)',
    correct: 'racional',
    explicacion: 'Es una necesidad para la clase. Decisión racional y planificada.',
  },
  {
    id: 's2',
    desc: 'Comprar café gourmet después de reprobar un examen ($85)',
    correct: 'emocional',
    explicacion: 'Es una respuesta emocional al estrés. Puede ser válido si es consciente.',
  },
  {
    id: 's3',
    desc: 'Adelantar un regalo de cumpleaños a un amigo porque te sientes mal ($300)',
    correct: 'impulsivo',
    explicacion: 'Mezcla de emoción e impulso. Considera si cabe en tu presupuesto.',
  },
  {
    id: 's4',
    desc: 'Comprar app de productividad en oferta que nunca usarás ($99)',
    correct: 'impulsivo',
    explicacion: 'Clásico gasto impulsivo activado por una oferta. La oferta no justifica la compra.',
  },
  {
    id: 's5',
    desc: 'Salir a comer con amigos para celebrar una calificación ($200)',
    correct: 'emocional',
    explicacion: 'Gasto emocional planificado. Si entra en tu presupuesto de deseos, está bien.',
  },
];

const ESTRATEGIAS = [
  'Esperar 24 horas antes de cualquier compra no planeada',
  'Preguntarme: "¿Lo compraría si me sintiera bien?"',
  'Fijar un límite mensual para gastos emocionales',
];

const TRIGGERS: { id: string; label: string }[] = [
  { id: 'estres', label: 'Cuando estoy estresado' },
  { id: 'aburrido', label: 'Cuando estoy aburrido' },
  { id: 'celebrando', label: 'Cuando estoy celebrando' },
  { id: 'amigos', label: 'Con amigos' },
  { id: 'online', label: 'Comprando en línea' },
  { id: 'ofertas', label: 'Viendo ofertas' },
];

export default function L08() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, GastoType>>({});
  const [lastFeedback, setLastFeedback] = useState<{ id: string; userAnswer: GastoType } | null>(null);
  const [triggers, setTriggers] = useState<Set<string>>(new Set());
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');

  const quizDone = SITUACIONES.every((s) => answers[s.id] !== undefined);
  const canComplete = quizDone && selectedStrategy !== null;

  const answerSituacion = (id: string, type: GastoType) => {
    if (answers[id]) return;
    setAnswers((prev) => ({ ...prev, [id]: type }));
    setLastFeedback({ id, userAnswer: type });
  };

  const toggleTrigger = (id: string) => {
    setTriggers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    if (canComplete) {
      void lessonDataRepository.save('presupuesto', 'l8_strategy', {
        strategy: selectedStrategy,
        triggers: Array.from(triggers),
      });
    }
  }, [canComplete, selectedStrategy, triggers]);

  const getSituacion = (id: string) => SITUACIONES.find((s) => s.id === id);
  const progressValue = step === 0 ? 0 : step === 1 ? 25 : step === 2 ? 60 : step === 3 ? 80 : 100;

  return (
    <LessonShell
      id="L08"
      title="Cuando el corazón gasta y la cartera llora"
      completion={{ ready: canComplete }}
    >
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full bg-[var(--color-brand-warning)] transition-all" style={{ width: `${progressValue}%` }} />
        </div>

        {step === 0 && (
          <div className="space-y-3">
            <FinniMessage
              variant="coach"
              title="El gasto emocional"
              message="¿Alguna vez compraste algo solo porque estabas estresado, aburrido o querías 'darte un gusto'? Eso tiene nombre: gasto emocional. Y no es malo en sí… siempre que lo conozcas."
            />
            <div className="space-y-2">
              {[
                { title: 'Situación 1 — Valeria', desc: 'Reprobó un examen → fue al mall → compró ropa que no necesitaba → culpa post-compra.' },
                { title: 'Situación 2 — Diego', desc: 'Vio oferta de videojuego → compra impulsiva → lo jugó 2 horas → lo olvidó.' },
              ].map((s) => (
                <FECard key={s.title} variant="flat" className="border border-[var(--color-brand-warning)]">
                  <p className="font-bold text-sm">{s.title}</p>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">{s.desc}</p>
                </FECard>
              ))}
            </div>
            <FinniMessage
              variant="coach"
              title="La pregunta clave"
              message="No es '¿puedo pagarlo?', sino '¿lo compraría si me sintiera bien?'"
            />
            <button
              className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm"
              onClick={() => setStep(1)}
            >
              Quiz: ¿Racional, emocional o impulsivo? →
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm">
              Para cada situación, elige: <b>Racional</b>, <b>Emocional</b> o <b>Impulsivo</b>.
              No hay una sola respuesta: Finni explica los matices.
            </p>
            <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2">
              <div className="h-2 rounded-full bg-[var(--color-brand-warning)] transition-all" style={{ width: `${(Object.keys(answers).length / SITUACIONES.length) * 100}%` }} />
            </div>
            <div className="space-y-2">
              {SITUACIONES.map((s) => (
                <FECard
                  key={s.id}
                  variant="flat"
                  className={cn(
                    'border',
                    answers[s.id]
                      ? 'bg-[var(--color-brand-success)]/10 border-[var(--color-brand-success)]'
                      : 'border-[var(--color-neutral-200)]'
                  )}
                >
                  <p className="font-bold text-sm mb-2">{s.desc}</p>
                  {!answers[s.id] ? (
                    <div className="flex flex-wrap gap-2">
                      {(['racional', 'emocional', 'impulsivo'] as GastoType[]).map((type) => (
                        <button
                          key={type}
                          onClick={() => answerSituacion(s.id, type)}
                          className="px-3 py-1 rounded-full text-sm font-semibold border border-[var(--color-neutral-200)] text-[var(--color-text-secondary)] cursor-pointer"
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--color-text-secondary)] italic">
                      Tu respuesta: <b>{answers[s.id]}</b> · {s.explicacion}
                    </p>
                  )}
                </FECard>
              ))}
            </div>

            {lastFeedback && answers[lastFeedback.id] && (
              <FECard variant="flat" className="bg-[var(--color-brand-info)]/10 border border-[var(--color-brand-info)]">
                <p className="font-bold text-sm">Finni explica:</p>
                <p className="text-sm">{getSituacion(lastFeedback.id)?.explicacion}</p>
              </FECard>
            )}

            {quizDone && (
              <button
                className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm"
                onClick={() => setStep(2)}
              >
                Autoevaluación →
              </button>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <p className="font-bold">
              ¿Cuándo es más probable que hagas gastos emocionales?
            </p>
            <div className="flex flex-wrap gap-2">
              {TRIGGERS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => toggleTrigger(t.id)}
                  className={cn(
                    'px-3 py-1 rounded-full text-sm font-semibold border transition-colors',
                    triggers.has(t.id)
                      ? 'bg-[var(--color-brand-warning)] text-white border-[var(--color-brand-warning)]'
                      : 'border-[var(--color-neutral-200)] text-[var(--color-text-secondary)]'
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button
              className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm"
              onClick={() => setStep(3)}
            >
              Elegir mi estrategia →
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <FinniMessage
              variant="coach"
              title="Estrategias anti-gasto-impulsivo"
              message="Elige 1 estrategia para practicar esta semana. La que más resuene contigo."
            />
            <div className="space-y-2">
              {ESTRATEGIAS.map((e) => (
                <FECard
                  key={e}
                  variant="flat"
                  className={cn(
                    'border-2 cursor-pointer transition-colors',
                    selectedStrategy === e
                      ? 'border-[var(--color-brand-warning)] bg-[var(--color-brand-warning)]/10'
                      : 'border-[var(--color-neutral-200)]'
                  )}
                  onClick={() => setSelectedStrategy(e)}
                  role="button"
                  tabIndex={0}
                >
                  <p className={selectedStrategy === e ? 'font-bold text-sm' : 'text-sm'}>
                    {selectedStrategy === e ? '✓ ' : ''}{e}
                  </p>
                </FECard>
              ))}
            </div>
            {selectedStrategy && (
              <div className="space-y-2">
                <p className="text-sm">
                  Escribe tu nombre para "firmar" tu compromiso (opcional):
                </p>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[var(--color-text-secondary)]">Tu nombre</label>
                  <input
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full rounded-xl border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
                  />
                </div>
                <FinniMessage
                  variant="success"
                  title="Conocerte es el primer paso"
                  message={`${nombre ? nombre + ', c' : 'C'}onocerte es el primer paso para gastar mejor.`}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </LessonShell>
  );
}
