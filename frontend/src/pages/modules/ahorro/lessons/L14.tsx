import { useState, useEffect, useMemo } from 'react';

import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

const successColor = 'var(--color-brand-success)';
const successBg    = 'var(--color-brand-success-bg)';
const warnColor    = 'var(--color-brand-warning)';
const warnBg       = 'var(--color-brand-warning-bg)';
const errorColor   = 'var(--color-brand-error)';
const errorBg      = 'var(--color-brand-error-bg)';
const infoColor    = 'var(--color-brand-info)';
const infoBg       = 'var(--color-brand-info-bg)';

type MetaData = { nombre?: string; monto?: number; aportacionMensual?: number } | null;
type PlanData = { totalPlanado?: number; horizon?: number } | null;
type RetoData = { totalAcumulado?: number; dayAmounts?: number[] } | null;
type QuizAnswer = string | null;

const PREGUNTAS = [
  { id: 1, tipo: 'opcion',       pregunta: '¿Que significa "pagarte primero a ti mismo"?',                                  opciones: ['A) Gastar en lo que quieres antes que en necesidades', 'B) Apartar el ahorro antes de gastar', 'C) Invertir en tu educacion primero'], correcta: 'B) Apartar el ahorro antes de gastar',                                      feedback: 'Pagarte primero significa que el ahorro va antes que cualquier gasto.' },
  { id: 2, tipo: 'vf',           pregunta: 'El ahorro informal no tiene ninguna ventaja.',                                   opciones: ['Verdadero', 'Falso'],                                                                                                             correcta: 'Falso',                                                                       feedback: 'El ahorro informal tiene ventaja en acceso inmediato, aunque carece de proteccion.' },
  { id: 3, tipo: 'opcion',       pregunta: '¿Que protege el IPAB?',                                                         opciones: ['A) Inversiones en bolsa', 'B) Depositos en bancos autorizados hasta ~3 millones de pesos', 'C) Fondos de inversion'],             correcta: 'B) Depositos en bancos autorizados hasta ~3 millones de pesos',              feedback: 'El IPAB protege depositos bancarios en instituciones autorizadas hasta ~3 millones.' },
  { id: 4, tipo: 'situacion',    pregunta: 'Tu ingreso varia entre $800 y $3,500 al mes. ¿Mejor estrategia de ahorro?',     opciones: ['A) Ahorrar un monto fijo de $300 siempre', 'B) Ahorrar un porcentaje fijo (ej. 20%) de lo que ganes', 'C) Ahorrar solo en meses buenos'], correcta: 'B) Ahorrar un porcentaje fijo (ej. 20%) de lo que ganes',                  feedback: 'El porcentaje fijo se adapta automaticamente a lo que ganes cada mes.' },
  { id: 5, tipo: 'completar',    pregunta: 'El interes compuesto gana interes sobre el capital MAS ___.',                   opciones: ['A) Las comisiones bancarias', 'B) Los intereses anteriores', 'C) El saldo minimo'],                                              correcta: 'B) Los intereses anteriores',                                                 feedback: 'Eso es exactamente el interes compuesto: intereses que generan mas intereses.' },
  { id: 6, tipo: 'opcion',       pregunta: '¿Cuantos meses de gastos basicos recomienda tener en un fondo de emergencias si tienes apoyo familiar?', opciones: ['A) 1 mes', 'B) 3 meses', 'C) 12 meses'],                                                            correcta: 'B) 3 meses',                                                                  feedback: 'Con apoyo familiar, 3 meses es la meta minima recomendada para el fondo.' },
  { id: 7, tipo: 'vf',           pregunta: 'Una meta de ahorro especifica ayuda a ahorrar mas.',                             opciones: ['Verdadero', 'Falso'],                                                                                                             correcta: 'Verdadero',                                                                   feedback: 'Con meta especifica se ahorra en promedio 3 veces mas. No es motivacion, es estructura.' },
  { id: 8, tipo: 'opcion',       pregunta: '¿Cual NO esta cubierto por el IPAB?',                                           opciones: ['A) Cuenta de ahorro en banco autorizado', 'B) Inversiones en bolsa', 'C) Cuenta de cheques'],                                 correcta: 'B) Inversiones en bolsa',                                                     feedback: 'Las inversiones en bolsa no son depositos bancarios, por lo que el IPAB no las cubre.' },
  { id: 9, tipo: 'autoevaluacion', pregunta: '¿Como calificarias tu habito de ahorro en este modulo?',                      opciones: ['1 — Practicamente no ahorre', '2 — Ahorre un poco', '3 — Ahorre regular', '4 — Ahorre con constancia', '5 — Supere mi meta'], correcta: null,                                                                          feedback: 'La autoevaluacion honesta es el primer paso para mejorar.' },
  { id: 10, tipo: 'situacion',   pregunta: 'Rodrigo quiere ahorrar $6,000 en 6 meses. ¿Cuanto debe apartar por mes?',       opciones: ['A) $500', 'B) $750', 'C) $1,000'],                                                                                               correcta: 'C) $1,000',                                                                   feedback: '$6,000 ÷ 6 meses = $1,000 por mes.' },
];

export default function L14() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [metaData, setMetaData] = useState<MetaData>(null);
  const [planData, setPlanData] = useState<PlanData>(null);
  const [retoData, setRetoData] = useState<RetoData>(null);
  const [answers, setAnswers] = useState<Record<number, QuizAnswer>>({});

  useEffect(() => {
    const load = async () => {
      const meta = await lessonDataRepository.load<MetaData>('ahorro', 'l5_meta');
      const plan = await lessonDataRepository.load<PlanData>('ahorro', 'l6_plan');
      const reto = await lessonDataRepository.load<RetoData>('ahorro', 'l11_reto');
      setMetaData(meta); setPlanData(plan); setRetoData(reto);
      setLoading(false);
    };
    void load();
  }, []);

  const totalAcumulado = retoData?.totalAcumulado ?? 0;
  const totalPlanado = planData?.totalPlanado ?? 0;
  const pctMeta = metaData?.monto && metaData.monto > 0 ? Math.min(100, (totalAcumulado / metaData.monto) * 100) : 0;
  const diasConsec = retoData?.dayAmounts?.length ?? 0;
  const quizDone = PREGUNTAS.every((p) => answers[p.id] !== undefined);

  const score = useMemo(() => {
    return PREGUNTAS.filter((p) => p.tipo === 'autoevaluacion' || answers[p.id] === p.correcta).length;
  }, [answers]);

  const pctScore = score / PREGUNTAS.length;
  const badgeUnlocked = pctScore >= 0.7;
  const progress = step === 0 ? 0 : step === 1 ? 33 : step === 2 ? 66 : 100;

  if (loading) {
    return (
      <LessonShell id="L14" title="Evalua tu habito de ahorro" completion={{ ready: false }}>
        <p className="text-sm text-[var(--color-text-secondary)]">Cargando estadisticas...</p>
      </LessonShell>
    );
  }

  return (
    <LessonShell id="L14" title="Evalua tu habito de ahorro" completion={{ ready: quizDone, score: pctScore }}>
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: successColor }} />
        </div>

        {/* Pantalla 0 — Estadisticas del modulo */}
        {step === 0 && (
          <div className="space-y-6">
            <FinniMessage variant="coach" title="¡Casi llegamos al final del Modulo 2!" message="Primero vamos a ver tus estadisticas del modulo. Luego el quiz. Las dos cosas van a sorprenderte." />
            <p className="font-bold">Tus estadisticas del modulo:</p>
            <div className="space-y-3">
              <FECard variant="flat" className="border" style={{ backgroundColor: successBg, borderColor: successColor }}>
                <div className="flex justify-between">
                  <p className="text-sm">Total ahorrado en el modulo:</p>
                  <p className="text-sm font-bold" style={{ color: '#059669' }}>${totalAcumulado.toLocaleString()}</p>
                </div>
              </FECard>
              <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
                <div className="flex justify-between items-center">
                  <p className="text-sm">Dias con registro consecutivo:</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: diasConsec >= 3 ? successBg : warnBg, color: diasConsec >= 3 ? '#059669' : '#D97706', border: `1px solid ${diasConsec >= 3 ? successColor : warnColor}` }}>
                    {diasConsec} dias
                  </span>
                </div>
              </FECard>
              <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
                <p className="text-sm mb-1">Progreso hacia la meta: {pctMeta.toFixed(0)}%{metaData?.nombre ? ` — "${metaData.nombre}"` : ''}</p>
                <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2">
                  <div className="h-2 rounded-full transition-all" style={{ width: `${pctMeta}%`, backgroundColor: successColor }} />
                </div>
              </FECard>
              <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
                <div className="flex justify-between">
                  <p className="text-sm">Plan inicial:</p>
                  <p className="text-sm">${totalPlanado.toLocaleString()} planeados</p>
                </div>
                {totalPlanado > 0 && (
                  <p className="text-xs mt-1" style={{ color: totalAcumulado >= totalPlanado * 0.5 ? '#059669' : '#D97706' }}>
                    {totalAcumulado >= totalPlanado * 0.5 ? '✅ En camino' : '⚠️ Por debajo del plan'}
                  </p>
                )}
              </FECard>
            </div>
            <FinniMessage variant="coach" title="Mira todo lo que hiciste" message="Esas son tus decisiones, no las mias." />
            <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => setStep(1)}>
              Empezar el quiz de 10 preguntas →
            </button>
          </div>
        )}

        {/* Pantalla 1 — Quiz de 10 preguntas */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="font-bold">Quiz de 10 preguntas</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: successBg, color: '#059669', border: `1px solid ${successColor}` }}>
                {Object.keys(answers).length}/10
              </span>
            </div>
            <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2">
              <div className="h-2 rounded-full transition-all" style={{ width: `${(Object.keys(answers).length / 10) * 100}%`, backgroundColor: successColor }} />
            </div>
            <div className="space-y-4">
              {PREGUNTAS.map((p) => {
                const ans = answers[p.id];
                const isCorrect = p.tipo === 'autoevaluacion' ? true : ans === p.correcta;
                return (
                  <FECard
                    key={p.id}
                    variant="flat"
                    className="border"
                    style={{ borderColor: ans !== undefined ? (isCorrect ? successColor : errorColor) : 'var(--color-neutral-200)' }}
                  >
                    <p className="text-sm font-bold mb-2">{p.id}. {p.pregunta}</p>
                    <div className="space-y-2">
                      {p.opciones.map((opt) => {
                        const isSelected = ans === opt;
                        let style: React.CSSProperties = { borderColor: successColor, color: successColor };
                        if (ans !== undefined) {
                          if (p.tipo === 'autoevaluacion' && isSelected) style = { backgroundColor: successBg, borderColor: successColor, color: '#059669' };
                          else if (isSelected && isCorrect) style = { backgroundColor: successBg, borderColor: successColor, color: '#059669' };
                          else if (isSelected && !isCorrect) style = { backgroundColor: errorBg, borderColor: errorColor, color: '#DC2626' };
                          else style = { borderColor: 'var(--color-neutral-200)', color: 'var(--color-text-secondary)' };
                        } else {
                          style = isSelected ? { backgroundColor: successBg, borderColor: successColor, color: '#059669' } : { borderColor: successColor, color: successColor };
                        }
                        return (
                          <button
                            key={opt}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold border transition-colors disabled:cursor-not-allowed"
                            style={style}
                            disabled={ans !== undefined}
                            onClick={() => {
                              if (ans === undefined) setAnswers((prev) => ({ ...prev, [p.id]: opt }));
                            }}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {ans !== undefined && (
                      <p className="text-xs mt-2" style={{ color: isCorrect ? '#059669' : '#DC2626' }}>
                        {isCorrect ? '✅ ' : '❌ '}{p.feedback}
                      </p>
                    )}
                  </FECard>
                );
              })}
            </div>
            {quizDone && (
              <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => setStep(2)}>
                Ver resultado →
              </button>
            )}
          </div>
        )}

        {/* Pantalla 2 — Resultado */}
        {step === 2 && (
          <div className="space-y-6">
            <FECard
              variant="flat"
              className="text-center py-6 border-2"
              style={{
                backgroundColor: badgeUnlocked ? warnBg : infoBg,
                borderColor: badgeUnlocked ? warnColor : infoColor,
              }}
            >
              {badgeUnlocked && <p className="text-5xl mb-2">🏆</p>}
              <p className="text-2xl font-bold mt-1">{score}/10</p>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                {badgeUnlocked ? 'Badge "Evaluado 📊" desbloqueado' : `${(pctScore * 100).toFixed(0)}% — necesitas 70% para el badge`}
              </p>
            </FECard>
            <FinniMessage
              variant="success"
              title={badgeUnlocked ? '¡Badge Evaluado desbloqueado!' : 'Buen intento'}
              message={badgeUnlocked ? 'Demostraste que entiendes los conceptos clave del ahorro.' : 'Puedes repasar las lecciones con mas errores. El aprendizaje es el objetivo.'}
            />
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="text-sm font-bold mb-2">Tus respuestas:</p>
              <div className="flex flex-wrap gap-2">
                {PREGUNTAS.map((p) => {
                  const ans = answers[p.id];
                  const isCorrect = p.tipo === 'autoevaluacion' ? true : ans === p.correcta;
                  return (
                    <span
                      key={p.id}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ backgroundColor: isCorrect ? successBg : errorBg, color: isCorrect ? '#059669' : '#DC2626', border: `1px solid ${isCorrect ? successColor : errorColor}` }}
                    >
                      P{p.id}
                    </span>
                  );
                })}
              </div>
            </FECard>
          </div>
        )}
      </div>
    </LessonShell>
  );
}
