import { useState } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

type Classification = 'aliado' | 'saboteador' | null;

const successColor = 'var(--color-brand-success)';
const successBg = 'var(--color-brand-success-bg)';
const errorColor = 'var(--color-brand-error)';
const errorBg = 'var(--color-brand-error-bg)';
const warnColor = 'var(--color-brand-warning)';
const warnBg = 'var(--color-brand-warning-bg)';

const CARDS: { id: string; label: string; correct: 'aliado' | 'saboteador'; tip: string }[] = [
  { id: 'c1', label: 'Transferencia automatica el dia de cobro', correct: 'aliado', tip: 'Si lo haces manual, es mas probable que lo pospongas.' },
  { id: 'c2', label: 'Meta clara y visible (foto en pantalla de bloqueo)', correct: 'aliado', tip: 'Una imagen concreta activa la motivacion de continuar.' },
  { id: 'c3', label: 'Notificaciones de progreso de ahorro', correct: 'aliado', tip: 'Ver que llevas $500 de $2,000 activa la motivacion.' },
  { id: 'c4', label: 'Amigos con cultura de ahorro', correct: 'aliado', tip: 'El entorno social influye mas de lo que creemos.' },
  { id: 'c5', label: 'Cuenta de ahorro separada de la del gasto diario', correct: 'aliado', tip: 'Lo que no ves facilmente, no lo gastas.' },
  { id: 'c6', label: 'Notificaciones de ofertas y compras en linea', correct: 'saboteador', tip: 'Activan el gasto impulsivo. Desactivarlas ayuda mucho.' },
  { id: 'c7', label: 'Amigos que siempre proponen planes costosos', correct: 'saboteador', tip: 'La presion social puede boicotear el mejor plan.' },
  { id: 'c8', label: 'No tener una meta concreta ("ahorro para algo algun dia")', correct: 'saboteador', tip: 'El ahorro sin nombre no dura. Necesita proposito.' },
  { id: 'c9', label: 'Mezclar el ahorro con el dinero del gasto cotidiano', correct: 'saboteador', tip: 'El dinero mezclado siempre termina en gasto.' },
  { id: 'c10', label: 'Revisar el saldo del ahorro muy seguido', correct: 'saboteador', tip: 'La tentacion de tocarlo aumenta cada vez que lo ves.' },
];

const ACCIONES: Record<string, string> = {
  c6: 'Desactiva las notificaciones de apps de compra en tu celular hoy.',
  c7: 'Propone al menos una alternativa economica cuando salgas con amigos.',
  c8: 'Completa la Leccion 5 hoy para darle nombre a tu meta.',
  c9: 'Abre una cuenta separada exclusiva para ahorro esta semana.',
  c10: 'Revisa tu saldo de ahorro solo una vez por semana.',
};

export default function L04() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Classification>>({});
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});
  const [saboteadoresCheck, setSaboteadoresCheck] = useState<Set<string>>(new Set());
  const [aliadoElegido, setAliadoElegido] = useState('');

  const answered = Object.values(answers).filter(Boolean).length;
  const allClassified = answered === CARDS.length;
  const aliadosCards = CARDS.filter((c) => c.correct === 'aliado');

  const classify = (id: string, val: Classification) => {
    if (answers[id]) return;
    setAnswers((prev) => ({ ...prev, [id]: val }));
    setShowFeedback((prev) => ({ ...prev, [id]: true }));
  };

  const toggleSaboteador = (id: string) => {
    setSaboteadoresCheck((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const mySaboteadores = Array.from(saboteadoresCheck).filter((id) => ACCIONES[id]);
  const canComplete = allClassified && aliadoElegido.trim().length > 0;

  const handleSave = async () => {
    await lessonDataRepository.save('ahorro', 'l4_aliados', { aliadoElegido, saboteadores: Array.from(saboteadoresCheck), savedAt: new Date().toISOString() });
    setStep(3);
  };

  const progress = step === 0 ? 0 : step === 1 ? 33 : step === 2 ? 66 : 100;

  return (
    <LessonShell id="L04" title="Aliados y saboteadores del ahorro" completion={{ ready: canComplete }}>
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: successColor }} />
        </div>

        {/* Pantalla 0 — Apertura */}
        {step === 0 && (
          <div className="space-y-6">
            <FinniMessage variant="coach" title="Ahorrar es una decision de comportamiento" message="Hay cosas en tu vida que te ayudan a ahorrar… y otras que trabajan en tu contra sin que lo notes." />
            <FECard variant="flat" className="border" style={{ borderColor: successColor }}>
              <p className="text-sm">En esta leccion vas a clasificar 10 tarjetas: <b>aliados</b> (te ayudan) vs <b>saboteadores</b> (te boicotean). Luego veras cuales tienes en tu vida.</p>
            </FECard>
            <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => setStep(1)}>
              Clasificar las 10 tarjetas →
            </button>
          </div>
        )}

        {/* Pantalla 1 — Clasificar tarjetas */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="font-bold">Clasifica cada tarjeta:</p>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: successColor }}>{answered}/{CARDS.length}</span>
            </div>
            <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2">
              <div className="h-2 rounded-full transition-all" style={{ width: `${(answered / CARDS.length) * 100}%`, backgroundColor: successColor }} />
            </div>
            <div className="space-y-3">
              {CARDS.map((c) => {
                const ans = answers[c.id];
                const isCorrect = ans === c.correct;
                return (
                  <FECard
                    key={c.id}
                    variant="flat"
                    className="border"
                    style={{
                      borderColor: ans ? (isCorrect ? successColor : errorColor) : 'var(--color-neutral-200)',
                      backgroundColor: ans ? (isCorrect ? successBg : errorBg) : 'white',
                    }}
                  >
                    <p className="text-sm font-semibold mb-2">{c.label}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => classify(c.id, 'aliado')}
                        disabled={!!ans}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border-2 disabled:cursor-default transition-colors"
                        style={{ borderColor: successColor, backgroundColor: ans === 'aliado' ? successColor : 'transparent', color: ans === 'aliado' ? 'white' : '#059669' }}
                      >
                        ✅ Aliado
                      </button>
                      <button
                        onClick={() => classify(c.id, 'saboteador')}
                        disabled={!!ans}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border-2 disabled:cursor-default transition-colors"
                        style={{ borderColor: errorColor, backgroundColor: ans === 'saboteador' ? errorColor : 'transparent', color: ans === 'saboteador' ? 'white' : '#DC2626' }}
                      >
                        ❌ Saboteador
                      </button>
                    </div>
                    {showFeedback[c.id] && (
                      <p className="text-xs mt-1" style={{ color: isCorrect ? '#059669' : '#DC2626' }}>
                        {isCorrect ? '✅ Correcto. ' : `❌ Es un ${c.correct}. `}{c.tip}
                      </p>
                    )}
                  </FECard>
                );
              })}
            </div>
            {allClassified && (
              <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => setStep(2)}>
                Mi autoevaluacion →
              </button>
            )}
          </div>
        )}

        {/* Pantalla 2 — Autoevaluacion + compromiso */}
        {step === 2 && (
          <div className="space-y-6">
            <p className="font-bold">¿Cuales saboteadores tienes en tu vida ahora?</p>
            <div className="space-y-2">
              {CARDS.filter((c) => c.correct === 'saboteador').map((c) => (
                <FECard
                  key={c.id}
                  variant="flat"
                  className="border cursor-pointer"
                  style={{
                    borderColor: saboteadoresCheck.has(c.id) ? errorColor : 'var(--color-neutral-200)',
                    backgroundColor: saboteadoresCheck.has(c.id) ? errorBg : 'white',
                  }}
                  onClick={() => toggleSaboteador(c.id)}
                  role="checkbox"
                  tabIndex={0}
                >
                  <p className="text-sm">{saboteadoresCheck.has(c.id) ? '☑' : '☐'} {c.label}</p>
                </FECard>
              ))}
            </div>

            {mySaboteadores.length > 0 && (
              <FECard variant="flat" className="border" style={{ borderColor: warnColor, backgroundColor: warnBg }}>
                <p className="font-bold text-sm mb-2">Plan de accion de Finni:</p>
                <div className="space-y-1">
                  {mySaboteadores.map((id) => (
                    <p key={id} className="text-sm">→ {ACCIONES[id]}</p>
                  ))}
                </div>
              </FECard>
            )}

            <p className="font-bold mt-2">Elige 1 aliado que vas a activar esta semana:</p>
            <div className="space-y-2">
              {aliadosCards.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setAliadoElegido(c.id)}
                  className="w-full text-left px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors"
                  style={{
                    borderColor: successColor,
                    backgroundColor: aliadoElegido === c.id ? successColor : 'transparent',
                    color: aliadoElegido === c.id ? 'white' : 'inherit',
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {aliadoElegido && (
              <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => void handleSave()}>
                Guardar mi compromiso →
              </button>
            )}
          </div>
        )}

        {/* Pantalla 3 — Cierre */}
        {step === 3 && (
          <div className="space-y-6">
            <FinniMessage variant="success" title="Tu perfil de ahorrador esta guardado" message="Conoces tus aliados y tus saboteadores. Eso ya es una ventaja enorme sobre quien ni siquiera los identifica." />
            <FECard variant="flat" className="border" style={{ borderColor: successColor, backgroundColor: successBg }}>
              <p className="font-bold text-sm">Tu aliado esta semana:</p>
              <p className="text-sm">{aliadosCards.find((c) => c.id === aliadoElegido)?.label ?? aliadoElegido}</p>
            </FECard>
          </div>
        )}
      </div>
    </LessonShell>
  );
}
