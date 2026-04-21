import { useState } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';

const infoColor = 'var(--color-brand-info)';

type ConceptoColor = 'success' | 'error' | 'warning' | 'info';

const CONCEPTOS: { nombre: string; emoji: string; color: ConceptoColor; def: string; ejemplo: string; analogia: string; nota: string }[] = [
  { nombre: 'Rendimiento', emoji: '📈', color: 'success', def: 'El dinero extra que genera tu inversión. Se expresa en % anual.', ejemplo: '8% anual sobre $10,000 = $800 al año.', analogia: 'El sueldo que le pagas al dinero por trabajar para ti.', nota: 'El rendimiento pasado no garantiza el futuro.' },
  { nombre: 'Riesgo', emoji: '⚠️', color: 'error', def: 'La posibilidad de que la inversión no genere lo esperado o que pierdas parte del capital.', ejemplo: 'A mayor rendimiento esperado, generalmente mayor riesgo.', analogia: 'La velocidad del coche — más rápido puedes llegar, pero también más puedes lastimarte.', nota: 'El riesgo no es malo. Es algo que se gestiona con conocimiento.' },
  { nombre: 'Plazo', emoji: '⏳', color: 'warning', def: 'El tiempo que tu dinero permanecerá invertido.', ejemplo: 'A mayor plazo, mayor potencial de rendimiento y mayor capacidad de recuperarse ante caídas.', analogia: 'Dejar fermentar el pan — necesita tiempo para crecer bien.', nota: 'Las inversiones a largo plazo históricamente superan a las de corto plazo.' },
  { nombre: 'Liquidez', emoji: '💧', color: 'info', def: 'Qué tan rápido puedes convertir tu inversión en efectivo sin perder valor.', ejemplo: 'Una cuenta bancaria tiene alta liquidez. Un bien inmueble, baja.', analogia: 'Hielo vs agua — el hielo tarda en convertirse en efectivo.', nota: 'Mayor liquidez generalmente implica menor rendimiento.' },
];

const colorVars: Record<ConceptoColor, { bg: string; border: string; text: string }> = {
  success: { bg: 'var(--color-brand-success-bg)', border: 'var(--color-brand-success)', text: '#059669' },
  error:   { bg: 'var(--color-brand-error-bg)',   border: 'var(--color-brand-error)',   text: '#DC2626' },
  warning: { bg: 'var(--color-brand-warning-bg)', border: 'var(--color-brand-warning)', text: '#D97706' },
  info:    { bg: 'var(--color-brand-info-bg)',     border: 'var(--color-brand-info)',    text: '#4B73F0' },
};

const QUIZ = [
  { pregunta: '¿Qué significa que una inversión tenga alta liquidez?', opciones: ['Que da mucho rendimiento', 'Que puedes convertirla en efectivo rápido', 'Que es muy segura'], correcta: 1 },
  { pregunta: 'A mayor rendimiento esperado, generalmente el riesgo es:', opciones: ['Menor', 'Mayor', 'Igual'], correcta: 1 },
  { pregunta: '¿Cuál tiene más liquidez?', opciones: ['Una casa', 'CETES', 'Un fondo a 5 años'], correcta: 1 },
  { pregunta: 'Te ofrecen 15% mensual garantizado sin riesgo. ¿Qué es?', opciones: ['Una gran oportunidad de inversión', 'Una señal de fraude'], correcta: 1 },
];

export default function L03() {
  const [step, setStep] = useState(0);
  const [expandido, setExpandido] = useState<number | null>(null);
  const [riesgoSlider, setRiesgoSlider] = useState(50);
  const [respuestas, setRespuestas] = useState<(number | null)[]>(Array(4).fill(null));

  const aciertos = respuestas.filter((r, i) => r === QUIZ[i]!.correcta).length;
  const quizCompleto = respuestas.every((r) => r !== null);
  const score = quizCompleto ? aciertos / 4 : 0;
  const rendimientoEstimado = Math.round(2 + (riesgoSlider / 100) * 15);

  const responder = (qi: number, oi: number) => {
    setRespuestas((prev) => prev.map((r, i) => (i === qi ? oi : r)));
  };

  const progressPct = (step / 2) * 100;
  const riesgoLabel = riesgoSlider < 33 ? 'Bajo' : riesgoSlider < 66 ? 'Medio' : 'Alto';
  const riesgoChipColor = riesgoSlider < 33 ? colorVars.success : riesgoSlider < 66 ? colorVars.warning : colorVars.error;

  return (
    <LessonShell
      id="L03"
      title="El alfabeto del inversionista: rendimiento, riesgo, plazo y liquidez"
      completion={{ ready: quizCompleto, score }}
    >
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full transition-all" style={{ width: `${progressPct}%`, backgroundColor: infoColor }} />
        </div>

        {/* Pantalla 0 — Los 4 conceptos */}
        {step === 0 && (
          <div className="space-y-6">
            <FinniMessage
              variant="coach"
              title="El vocabulario del inversionista"
              message="Antes de hablar de productos de inversión, necesitas el vocabulario. No para sonar inteligente en reuniones — para entender lo que estás firmando."
            />
            <p className="text-lg font-bold">Los 4 conceptos clave</p>
            <p className="text-sm text-[var(--color-text-secondary)]">Toca cada concepto para expandirlo:</p>
            <div className="space-y-4">
              {CONCEPTOS.map((c, i) => {
                const cv = colorVars[c.color];
                const isOpen = expandido === i;
                return (
                  <div
                    key={c.nombre}
                    className="rounded-2xl overflow-hidden border-2 transition-colors"
                    style={{ borderColor: isOpen ? cv.border : 'var(--color-neutral-200)' }}
                  >
                    <button
                      className="w-full flex items-center gap-3 p-3 text-left transition-colors"
                      style={{ backgroundColor: isOpen ? cv.bg : '#F9FAFB' }}
                      onClick={() => setExpandido(isOpen ? null : i)}
                    >
                      <span className="text-xl">{c.emoji}</span>
                      <span className="font-extrabold">{c.nombre}</span>
                    </button>
                    {isOpen && (
                      <div className="p-3 space-y-2">
                        <p className="text-sm"><strong>Definición:</strong> {c.def}</p>
                        <p className="text-sm"><strong>Ejemplo:</strong> {c.ejemplo}</p>
                        <div className="p-2 rounded-lg" style={{ backgroundColor: colorVars.info.bg, border: `1px solid ${colorVars.info.border}` }}>
                          <span className="text-xs"><strong>Analogía:</strong> {c.analogia}</span>
                        </div>
                        <span className="text-xs text-[var(--color-text-secondary)] block">⚡ {c.nota}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <button
              className="w-full min-h-11 text-white rounded-xl font-semibold text-sm"
              style={{ backgroundColor: infoColor }}
              onClick={() => setStep(1)}
            >
              Ver relaciones y alerta antifraude →
            </button>
          </div>
        )}

        {/* Pantalla 1 — Slider de relaciones + alerta antifraude */}
        {step === 1 && (
          <div className="space-y-6">
            <p className="text-lg font-bold">La tensión entre las 4 variables</p>
            <FECard variant="flat" className="border border-[var(--color-brand-warning)]">
              <p className="text-sm font-bold mb-2">Mueve el nivel de riesgo y observa el impacto:</p>
              <input
                type="range"
                min={0}
                max={100}
                value={riesgoSlider}
                onChange={(e) => setRiesgoSlider(Number(e.target.value))}
                className="w-full mb-4 accent-[var(--color-brand-info)]"
              />
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: riesgoChipColor.bg, color: riesgoChipColor.text }}>
                  Riesgo: {riesgoLabel}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: colorVars.info.bg, color: colorVars.info.text }}>
                  Rendimiento: ~{rendimientoEstimado}% anual
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-[var(--color-neutral-100)] text-[var(--color-text-secondary)]">
                  Liquidez: {riesgoSlider > 66 ? 'Media' : 'Alta'}
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                {riesgoSlider < 33
                  ? 'Ejemplo: CETES — bajo riesgo, bajo rendimiento, alta liquidez.'
                  : riesgoSlider < 66
                  ? 'Ejemplo: Fondo balanceado — riesgo medio, rendimiento moderado.'
                  : 'Ejemplo: Acciones BMV — alto riesgo, alto potencial, liquidez media.'}
              </p>
            </FECard>
            <div className="rounded-2xl p-4 border-2" style={{ backgroundColor: colorVars.error.bg, borderColor: colorVars.error.border }}>
              <div className="flex items-center gap-2 mb-2">
                <span>⚠️</span>
                <p className="font-extrabold" style={{ color: colorVars.error.text }}>Alerta antifraude</p>
              </div>
              <p className="text-sm font-bold">Si te ofrecen esto combinado, es fraude:</p>
              <p className="text-sm">🚨 Rendimiento garantizado alto + cero riesgo + liquidez inmediata</p>
              <p className="text-sm mt-2" style={{ color: colorVars.error.text }}>
                Ejemplos en México: esquemas Ponzi de cripto, tandas fraudulentas, apps sin regulación CNBV.
              </p>
            </div>
            <button
              className="w-full min-h-11 text-white rounded-xl font-semibold text-sm"
              style={{ backgroundColor: infoColor }}
              onClick={() => setStep(2)}
            >
              Test rápido de 4 preguntas →
            </button>
          </div>
        )}

        {/* Pantalla 2 — Quiz */}
        {step === 2 && (
          <div className="space-y-6">
            <p className="text-lg font-bold">Test rápido</p>
            <div className="space-y-6">
              {QUIZ.map((q, qi) => {
                const resp = respuestas[qi];
                const respondido = resp !== null;
                const correcto = resp === q.correcta;
                return (
                  <FECard
                    key={qi}
                    variant="flat"
                    className="border"
                    style={{ borderColor: respondido ? (correcto ? 'var(--color-brand-success)' : 'var(--color-brand-error)') : 'var(--color-neutral-200)' }}
                  >
                    <p className="text-sm font-bold mb-3">{qi + 1}. {q.pregunta}</p>
                    <div className="space-y-2">
                      {q.opciones.map((op, oi) => {
                        const isSelected = resp === oi;
                        const isCorrect = oi === q.correcta;
                        let bg = 'transparent';
                        let borderColor = infoColor;
                        let textColor = infoColor;
                        if (respondido) {
                          if (isCorrect) { bg = colorVars.success.bg; borderColor = colorVars.success.border; textColor = colorVars.success.text; }
                          else if (isSelected) { bg = colorVars.error.bg; borderColor = colorVars.error.border; textColor = colorVars.error.text; }
                          else { bg = 'transparent'; borderColor = 'var(--color-neutral-200)'; textColor = 'var(--color-text-secondary)'; }
                        } else if (isSelected) {
                          bg = colorVars.info.bg;
                        }
                        return (
                          <button
                            key={oi}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium border transition-colors"
                            style={{ backgroundColor: bg, borderColor, color: textColor }}
                            onClick={() => { if (!respondido) responder(qi, oi); }}
                            disabled={respondido}
                          >
                            {op}
                          </button>
                        );
                      })}
                    </div>
                    {respondido && (
                      <p className="text-xs mt-2" style={{ color: correcto ? colorVars.success.text : colorVars.error.text }}>
                        {correcto ? '✓ Correcto' : `✗ La respuesta correcta era: "${q.opciones[q.correcta]}"`}
                      </p>
                    )}
                  </FECard>
                );
              })}
            </div>
            {quizCompleto && (
              <FECard
                variant="flat"
                className="text-center border-2"
                style={{
                  backgroundColor: aciertos >= 3 ? colorVars.success.bg : colorVars.info.bg,
                  borderColor: aciertos >= 3 ? colorVars.success.border : colorVars.info.border,
                }}
              >
                <p className="text-2xl">{aciertos >= 3 ? '🎯' : '📚'}</p>
                <p className="font-extrabold">{aciertos}/4 correctas</p>
                <p className="text-sm">
                  {aciertos === 4 ? '¡Perfecto! Dominas el vocabulario del inversionista.'
                    : aciertos >= 3 ? '¡Muy bien! Tienes las bases sólidas.'
                    : 'Repasa los conceptos — el vocabulario es la base de todo.'}
                </p>
              </FECard>
            )}
          </div>
        )}
      </div>
    </LessonShell>
  );
}
