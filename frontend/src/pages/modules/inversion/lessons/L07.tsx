import { useState } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

const PLATAFORMAS = [
  { nombre: 'GBM+', minimo: '$200', tipo: 'Acciones + fondos', regulada: true },
  { nombre: 'Kuspit', minimo: '$500', tipo: 'Acciones + fondos', regulada: true },
  { nombre: 'Bursanet', minimo: '$200', tipo: 'Acciones + fondos', regulada: true },
  { nombre: 'Flink', minimo: '$1', tipo: 'Micro-inversión', regulada: true },
  { nombre: 'Nu Inversiones', minimo: '$1', tipo: 'Fondos', regulada: true },
];

const QUIZ = [
  { pregunta: '¿Qué es un fondo de inversión?', opciones: ['Una cuenta de ahorro bancaria', 'Un grupo de personas que invierten colectivamente', 'Un préstamo al banco'], correcta: 1 },
  { pregunta: '¿Qué pasa si la empresa en cuya acción invertiste tiene problemas?', opciones: ['Recibes el dinero garantizado', 'El valor de tu acción puede bajar', 'El gobierno te protege'], correcta: 1 },
  { pregunta: '¿Cuál es el organismo que regula los fondos en México?', opciones: ['SAT', 'CNBV', 'IMSS'], correcta: 1 },
  { pregunta: '¿Los fondos balanceados mezclan deuda y acciones?', opciones: ['Falso', 'Verdadero'], correcta: 1 },
  { pregunta: '¿Desde cuánto puedes invertir en BMV con plataformas fintech?', opciones: ['$10,000', '$5,000', '$200-$500'], correcta: 2 },
];

const infoColor = 'var(--color-brand-info)';
const infoBg = 'var(--color-brand-info-bg)';
const successColor = 'var(--color-brand-success)';
const successBg = 'var(--color-brand-success-bg)';
const warnColor = 'var(--color-brand-warning)';
const warnBg = 'var(--color-brand-warning-bg)';
const errorColor = 'var(--color-brand-error)';

export default function L07() {
  const [step, setStep] = useState(0);
  const [audioLeido, setAudioLeido] = useState(false);
  const [pausaRespuesta, setPausaRespuesta] = useState('');
  const [respuestas, setRespuestas] = useState<(number | null)[]>(Array(5).fill(null));
  const [plataformasInteres, setPlataformasInteres] = useState<string[]>([]);
  const [guardado, setGuardado] = useState(false);

  const aciertos = respuestas.filter((r, i) => r === QUIZ[i]!.correcta).length;
  const quizCompleto = respuestas.every((r) => r !== null);
  const score = quizCompleto ? aciertos / 5 : 0;

  const togglePlataforma = (nombre: string) => {
    setPlataformasInteres((prev) => prev.includes(nombre) ? prev.filter((p) => p !== nombre) : [...prev, nombre]);
  };

  const handleGuardar = async () => {
    await lessonDataRepository.save('inversion', 'l07_plataformas', { plataformas: plataformasInteres });
    setGuardado(true);
  };

  return (
    <LessonShell id="L07" title="Fondos de inversión y Bolsa: cuando muchos invierten juntos" completion={{ ready: quizCompleto && guardado, score }}>
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full transition-all" style={{ width: `${(step / 2) * 100}%`, backgroundColor: infoColor }} />
        </div>

        {/* Pantalla 0 — Explicación */}
        {step === 0 && (
          <div className="space-y-6">
            <FinniMessage variant="coach" title="¿Quieres invertir en muchas empresas a la vez?" message="Los fondos de inversión hacen eso por ti. Hoy entendemos cómo funcionan los fondos y la bolsa." />
            <FECard variant="flat" className="border" style={{ borderColor: warnColor, backgroundColor: warnBg }}>
              <p className="font-extrabold mb-2">Fondos de Inversión — La olla común 🍲</p>
              <div className="space-y-3">
                <p className="text-sm">Imagina que tú y 999 personas más juntan $1,000 cada uno. Ahora tienen $1 millón para invertir. Un gestor profesional decide dónde y cómo. Las ganancias (y pérdidas) se distribuyen proporcionalmente.</p>
                <p className="text-sm">Los fondos pueden invertir en <b>deuda</b> (más seguros), en <b>acciones</b> (más riesgo y potencial), o una mezcla de ambos (<b>balanceados</b>).</p>
                <p className="text-sm">En México, los fondos regulados por la CNBV son accesibles desde $1,000-$5,000. Algunos desde $100 con plataformas fintech.</p>
              </div>
            </FECard>

            {!audioLeido ? (
              <div className="space-y-4">
                <FECard variant="flat" className="border" style={{ borderColor: infoColor, backgroundColor: infoBg }}>
                  <p className="font-bold mb-2">⏸ Pausa interactiva</p>
                  <p className="text-sm mb-2">¿Qué te parece más atractivo hasta ahora: fondos o acciones? ¿Por qué?</p>
                  <textarea
                    value={pausaRespuesta}
                    onChange={(e) => setPausaRespuesta(e.target.value)}
                    rows={2}
                    placeholder="Escribe tu reflexión..."
                    className="w-full border border-[var(--color-neutral-200)] rounded-xl px-4 py-2.5 text-sm resize-none"
                  />
                </FECard>
                {pausaRespuesta.trim().length >= 5 && (
                  <button className="w-full min-h-11 rounded-xl font-semibold text-sm border-2" style={{ borderColor: infoColor, color: infoColor }} onClick={() => setAudioLeido(true)}>
                    Continuar con la BMV →
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <FECard variant="flat" className="border" style={{ borderColor: successColor, backgroundColor: successBg }}>
                  <p className="font-extrabold mb-2">La Bolsa Mexicana de Valores (BMV) 📊</p>
                  <div className="space-y-3">
                    <p className="text-sm">La BMV es el mercado donde se compran y venden acciones de empresas mexicanas. Cuando compras una acción, eres propietario de una pequeña parte de esa empresa.</p>
                    <p className="text-sm">Si la empresa crece y genera utilidades, el valor de tu acción sube. Si tiene problemas, baja. A diferencia de los CETES, <b>no hay rendimiento garantizado</b>.</p>
                    <p className="text-sm">Puedes invertir en acciones de la BMV desde plataformas como GBM+, Kuspit o Bursanet desde $200-$500 pesos.</p>
                  </div>
                </FECard>
                <div className="p-4 rounded-xl bg-white border border-[var(--color-neutral-200)]">
                  <p className="font-bold mb-2">Fondos vs Acciones individuales</p>
                  <div className="space-y-0.5">
                    {[
                      { aspecto: 'Gestión', fondos: 'Profesional (gestor)', acciones: 'Tú decides' },
                      { aspecto: 'Diversificación', fondos: 'Automática', acciones: 'Manual' },
                      { aspecto: 'Monto mínimo', fondos: '$100-$5,000', acciones: '~$200' },
                      { aspecto: 'Comisiones', fondos: '1-2% anual', acciones: 'Por operación' },
                    ].map((row) => (
                      <div key={row.aspecto} className="flex py-1.5 border-b border-[var(--color-neutral-200)]">
                        <p className="text-xs font-bold w-[35%]">{row.aspecto}</p>
                        <p className="text-xs w-[32.5%]" style={{ color: '#B45309' }}>{row.fondos}</p>
                        <p className="text-xs w-[32.5%]" style={{ color: '#059669' }}>{row.acciones}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: infoColor }} onClick={() => setStep(1)}>
                  Quiz y plataformas →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Pantalla 1 — Quiz + plataformas */}
        {step === 1 && (
          <div className="space-y-6">
            <p className="text-2xl font-bold">Quiz de comprensión</p>
            <div className="space-y-4">
              {QUIZ.map((q, qi) => {
                const resp = respuestas[qi];
                const respondido = resp !== null;
                const correcto = resp === q.correcta;
                return (
                  <FECard key={qi} variant="flat" className="border" style={{ borderColor: respondido ? (correcto ? successColor : errorColor) : 'var(--color-border)' }}>
                    <p className="text-sm font-bold mb-2">{qi + 1}. {q.pregunta}</p>
                    <div className="space-y-2">
                      {q.opciones.map((op, oi) => (
                        <button
                          key={oi}
                          onClick={() => { if (!respondido) setRespuestas((prev) => prev.map((r, i) => i === qi ? oi : r)); }}
                          disabled={respondido}
                          className="w-full text-left px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors disabled:cursor-default"
                          style={{
                            borderColor: resp === oi ? (oi === q.correcta ? successColor : errorColor) : (respondido ? 'var(--color-neutral-200)' : warnColor),
                            backgroundColor: resp === oi ? (oi === q.correcta ? successBg : 'var(--color-brand-error-bg)') : 'transparent',
                          }}
                        >
                          {op}
                        </button>
                      ))}
                    </div>
                    {respondido && (
                      <p className="text-xs mt-1.5" style={{ color: correcto ? successColor : errorColor }}>
                        {correcto ? '✓ Correcto' : `✗ La respuesta correcta era: "${q.opciones[q.correcta]}"`}
                      </p>
                    )}
                  </FECard>
                );
              })}
            </div>
            {quizCompleto && (
              <div className="space-y-4">
                <FECard variant="flat" className="border-2 text-center" style={{ borderColor: aciertos >= 4 ? successColor : infoColor, backgroundColor: aciertos >= 4 ? successBg : infoBg }}>
                  <p className="font-extrabold">{aciertos}/5 correctas</p>
                </FECard>
                <p className="text-xl font-bold">Plataformas autorizadas por CNBV</p>
                <p className="text-sm text-[var(--color-text-secondary)]">Marca las que te generan interés:</p>
                <div className="space-y-3">
                  {PLATAFORMAS.map((p) => (
                    <div
                      key={p.nombre}
                      onClick={() => togglePlataforma(p.nombre)}
                      className="p-4 rounded-xl border-2 cursor-pointer transition-all"
                      style={{
                        borderColor: plataformasInteres.includes(p.nombre) ? warnColor : 'var(--color-border)',
                        backgroundColor: plataformasInteres.includes(p.nombre) ? warnBg : 'var(--color-neutral-50)',
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold">{p.nombre}</p>
                          <p className="text-xs text-[var(--color-text-secondary)]">{p.tipo} · Desde {p.minimo}</p>
                        </div>
                        <div className="flex gap-2">
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: successColor }}>CNBV ✓</span>
                          {plataformasInteres.includes(p.nombre) && <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: infoColor }}>★ Interés</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <FinniMessage variant="coach" title="Fondos y bolsa son para plazos medianos-largos" message="La clave es entender en qué estás entrando antes de hacerlo. ¡Ya lo entiendes!" />
                <button
                  className="w-full min-h-11 text-white rounded-xl font-semibold text-sm disabled:opacity-50"
                  style={{ backgroundColor: infoColor }}
                  onClick={() => void handleGuardar()}
                  disabled={guardado}
                >
                  {guardado ? '✅ Intereses guardados — lección completada' : 'Guardar mis plataformas de interés'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </LessonShell>
  );
}
