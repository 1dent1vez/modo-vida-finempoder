import { cn } from '@/lib/utils';
import { useState } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';

type Opcion = { id: string; label: string; consecuencia: string; score: number };

const ESCENARIOS: {
  id: string;
  situacion: string;
  contexto: string;
  opciones: Opcion[];
}[] = [
  {
    id: 'A',
    situacion: 'Se acabó el pase del metro ($300)',
    contexto: 'Tienes $320 y faltan 12 días para tu próxima mesada.',
    opciones: [
      { id: 'a1', label: 'Cancelar cena con amigos del viernes', consecuencia: 'Ahorraste $300. Te quedaste sin salida del viernes.', score: 70 },
      { id: 'a2', label: 'Pausar streaming este mes', consecuencia: 'Ahorraste $99. Aún necesitas $201 más.', score: 50 },
      { id: 'a3', label: 'No comprar ropa nueva que tenías planeada', consecuencia: 'Ahorraste $300. Solución sin sacrificar necesidades. ✅', score: 100 },
    ],
  },
  {
    id: 'B',
    situacion: 'Examen sorpresa: necesitas imprimir urgente ($80)',
    contexto: 'Tienes $320 disponibles. El examen es mañana.',
    opciones: [
      { id: 'b1', label: 'Pedir prestado a un amigo', consecuencia: 'Resuelves el problema hoy. Recuerda pagar después.', score: 70 },
      { id: 'b2', label: 'Usar parte del presupuesto de comida', consecuencia: 'Pagas las impresiones pero comerás más sencillo esta semana.', score: 80 },
      { id: 'b3', label: 'Cancelar suscripción mensual del momento', consecuencia: 'Tienes $99 disponibles de inmediato. Cubre el gasto. ✅', score: 100 },
    ],
  },
  {
    id: 'C',
    situacion: 'Concierto de tu artista favorito ($350)',
    contexto: 'Tienes solo $320 en el banco. El boleto vence mañana.',
    opciones: [
      { id: 'c1', label: 'Ir: pides $30 prestados y vas', consecuencia: 'Disfrutas el concierto pero quedas en $0 y con deuda.', score: 40 },
      { id: 'c2', label: 'No ir: guardas tu dinero para necesidades', consecuencia: 'Tomas una decisión financieramente sana. Te pierdes el concierto.', score: 90 },
      { id: 'c3', label: 'Buscar si hay boletos más baratos o reventa', consecuencia: 'Explorar opciones es siempre válido antes de decidir. ✅', score: 100 },
    ],
  },
];

export default function L07() {
  const [step, setStep] = useState(0);
  const [escenarioIdx, setEscenarioIdx] = useState(0);
  const [decisions, setDecisions] = useState<Record<string, Opcion>>({});
  const [showConsequence, setShowConsequence] = useState(false);

  const allDone = Object.keys(decisions).length === ESCENARIOS.length;
  const avgScore = allDone
    ? Math.round(Object.values(decisions).reduce((a, d) => a + d.score, 0) / ESCENARIOS.length)
    : 0;

  const currentEscenario = ESCENARIOS[escenarioIdx];
  const currentDecision = currentEscenario ? decisions[currentEscenario.id] : null;

  const choose = (opcion: Opcion) => {
    if (!currentEscenario || decisions[currentEscenario.id]) return;
    setDecisions((prev) => ({ ...prev, [currentEscenario.id]: opcion }));
    setShowConsequence(true);
  };

  const nextScenario = () => {
    setShowConsequence(false);
    if (escenarioIdx < ESCENARIOS.length - 1) {
      setEscenarioIdx((i) => i + 1);
    } else {
      setStep(2);
    }
  };

  const progressValue = step === 0 ? 0 : step === 1 ? ((escenarioIdx + (currentDecision ? 1 : 0)) / ESCENARIOS.length) * 80 : 100;

  return (
    <LessonShell
      id="L07"
      title="Priorizar o morir: ajusta tu presupuesto en crisis"
      completion={{ ready: allDone, score: avgScore }}
    >
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full bg-[var(--color-brand-warning)] transition-all" style={{ width: `${progressValue}%` }} />
        </div>

        {step === 0 && (
          <div className="space-y-3">
            <FECard variant="flat" className="bg-[var(--color-brand-warning)]/10 border-2 border-[var(--color-brand-warning)] text-center py-4">
              <p className="font-bold">💬 Mensaje bancario</p>
              <p className="font-bold text-base mt-2">Saldo disponible: $320</p>
              <p className="text-sm text-[var(--color-text-secondary)]">Faltan 12 días para tu próxima mesada.</p>
            </FECard>
            <FinniMessage
              variant="coach"
              title="Tiempo de decidir"
              message="Este mes pasó algo inesperado y el dinero no alcanzó. Ahora tienes que decidir. ¿Cómo priorizas?"
            />
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="font-bold mb-2">Matriz de priorización:</p>
              <div className="flex gap-2">
                <FECard variant="flat" className="flex-1 bg-[var(--color-brand-error)]/10 text-center">
                  <p className="text-xs font-bold">⚡ Urgente + Necesario</p>
                  <p className="text-xs block">→ Actúa ya</p>
                </FECard>
                <FECard variant="flat" className="flex-1 bg-[var(--color-brand-warning)]/10 text-center">
                  <p className="text-xs font-bold">📅 Necesario + No urgente</p>
                  <p className="text-xs block">→ Planifica</p>
                </FECard>
              </div>
              <div className="flex gap-2 mt-2">
                <FECard variant="flat" className="flex-1 bg-[var(--color-brand-info)]/10 text-center">
                  <p className="text-xs font-bold">⚡ Urgente + Prescindible</p>
                  <p className="text-xs block">→ Delega o pospón</p>
                </FECard>
                <FECard variant="flat" className="flex-1 bg-[var(--color-brand-success)]/10 text-center">
                  <p className="text-xs font-bold">✂️ Prescindible + No urgente</p>
                  <p className="text-xs block">→ Elimina</p>
                </FECard>
              </div>
            </FECard>
            <button
              className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm"
              onClick={() => setStep(1)}
            >
              ¡A los escenarios! →
            </button>
          </div>
        )}

        {step === 1 && currentEscenario && (
          <div className="space-y-3" key={currentEscenario.id}>
            <FECard variant="flat" className="bg-[var(--color-brand-error)]/10 border-2 border-[var(--color-brand-error)]">
              <p className="text-sm text-[var(--color-text-secondary)]">Escenario {currentEscenario.id}</p>
              <p className="font-bold text-base">{currentEscenario.situacion}</p>
              <p className="text-sm mt-1">{currentEscenario.contexto}</p>
            </FECard>

            {!currentDecision && (
              <div className="space-y-2">
                {currentEscenario.opciones.map((op) => (
                  <button
                    key={op.id}
                    onClick={() => choose(op)}
                    className="w-full text-left border border-[var(--color-brand-warning)] text-[var(--color-brand-warning)] rounded-xl px-4 py-3 text-sm"
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            )}

            {currentDecision && showConsequence && (
              <div className="space-y-2">
                <FECard
                  variant="flat"
                  className={cn(
                    'border',
                    currentDecision.score >= 90
                      ? 'bg-[var(--color-brand-success)]/10 border-[var(--color-neutral-200)]'
                      : currentDecision.score >= 70
                      ? 'bg-[var(--color-brand-warning)]/10 border-[var(--color-neutral-200)]'
                      : 'bg-[var(--color-brand-info)]/10 border-[var(--color-neutral-200)]'
                  )}
                >
                  <p className="font-bold text-sm">Tu decisión:</p>
                  <p className="text-sm">{currentDecision.label}</p>
                  <p className="text-sm mt-2 italic">{currentDecision.consecuencia}</p>
                </FECard>
                <FinniMessage
                  variant="coach"
                  title="Finni valida"
                  message={
                    currentDecision.score >= 90
                      ? 'Excelente decisión financiera. Priorizaste sin sacrificar necesidades.'
                      : currentDecision.score >= 70
                      ? 'Buena decisión. Hay opciones aún más óptimas, pero esta funciona.'
                      : 'Decisión comprensible. Considera las consecuencias a largo plazo.'
                  }
                />
                <button
                  className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm"
                  onClick={nextScenario}
                >
                  {escenarioIdx < ESCENARIOS.length - 1 ? 'Siguiente escenario →' : 'Ver resultado final →'}
                </button>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <FinniMessage
              variant="success"
              title="¡3 escenarios completados!"
              message={`Tu puntuación promedio: ${avgScore}/100. ${avgScore >= 90 ? '¡Excelente toma de decisiones!' : avgScore >= 70 ? 'Buenas decisiones. Sigue practicando.' : 'Buen primer intento. Con práctica mejorarás.'}`}
            />
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="font-bold mb-3">Principios que aplicaste:</p>
              <div className="space-y-2">
                {[
                  '1. Separar lo urgente+necesario de lo prescindible',
                  '2. Buscar recortes en deseos antes que en necesidades',
                  '3. Explorar alternativas antes de endeudarse',
                ].map((p) => (
                  <p key={p} className="text-sm">✓ {p}</p>
                ))}
              </div>
            </FECard>
          </div>
        )}
      </div>
    </LessonShell>
  );
}
