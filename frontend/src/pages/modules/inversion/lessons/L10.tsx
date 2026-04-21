import { cn } from '@/lib/utils';
import { useState } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';

const errorColor = 'var(--color-brand-error)';
const errorBg    = 'var(--color-brand-error-bg)';
const successColor = 'var(--color-brand-success)';
const successBg    = 'var(--color-brand-success-bg)';
const infoColor  = 'var(--color-brand-info)';
const infoBg     = 'var(--color-brand-info-bg)';
const warnColor  = 'var(--color-brand-warning)';
const warnBg     = 'var(--color-brand-warning-bg)';

const SENALES = [
  { emoji: '🚨', titulo: 'Rendimientos garantizados muy altos', desc: 'Si te ofrecen 20% mensual o más, es una estafa. No existe inversión legal con ese rendimiento garantizado en México.' },
  { emoji: '🚨', titulo: 'Urgencia artificial', desc: '"Solo por hoy", "oferta exclusiva", "cierra hoy o pierdes el cupo". La presión de tiempo es una técnica de manipulación.' },
  { emoji: '🚨', titulo: 'No puedo explicarte cómo funciona', desc: 'Si no entiendes cómo genera el rendimiento, no inviertas. Un instrumento legítimo siempre se puede explicar.' },
  { emoji: '🚨', titulo: 'No está regulada por CNBV', desc: 'En México, todas las instituciones que captan inversiones deben estar autorizadas por la CNBV. Verifica siempre.' },
  { emoji: '🚨', titulo: 'Reclutamiento de más inversores', desc: 'Si te piden traer amigos para obtener más rendimiento: es un esquema Ponzi. Tus amigos también perderán.' },
];

const CASOS = [
  { titulo: 'Plataforma cripto con 15% mensual garantizado', descripcion: 'Plataforma de cripto que promete 15% mensual garantizado. Tiene app, página web profesional y testimonios de "usuarios felices".', senales: ['Rendimiento imposible (180% anual)', 'Sin registro CNBV', 'Testimonios no verificables'], resultado: 'La plataforma desapareció. Pérdida total del capital de todos los inversores.', decisiones: ['Invertiría', 'No invertiría'], correcta: 1 },
  { titulo: 'Fondo exclusivo sin regulación', descripcion: 'Un amigo te invita a una "inversión exclusiva" en un fondo que no está en la lista de la CNBV. Solo hay cupo para 10 personas más.', senales: ['Urgencia artificial (cupo limitado)', 'Sin regulación CNBV', 'Acceso por invitación (señal de Ponzi)'], resultado: 'El amigo también perdió — fue una víctima más del esquema.', decisiones: ['Invertiría', 'No invertiría'], correcta: 1 },
  { titulo: 'App con 3% semanal "sin riesgo"', descripcion: 'App con rendimiento del 3% semanal "sin riesgo", descargable en Google Play, con 50,000 descargas.', senales: ['Rendimiento imposible (156% anual)', 'Cero riesgo declarado es imposible', 'Sin regulación confirmable'], resultado: 'La app desapareció después de 4 meses llevándose todo el dinero.', decisiones: ['Invertiría', 'No invertiría'], correcta: 1 },
];

export default function L10() {
  const [step, setStep] = useState(0);
  const [senal, setSenal] = useState<number | null>(null);
  const [respuestasCasos, setRespuestasCasos] = useState<(number | null)[]>(Array(3).fill(null));
  const [razonesUsuario, setRazonesUsuario] = useState<string[]>(['', '', '']);
  const [casoActivo, setCasoActivo] = useState(0);

  const casosCompletos = respuestasCasos.every((r) => r !== null);

  const responderCaso = (ci: number, di: number) => {
    setRespuestasCasos((prev) => prev.map((r, i) => (i === ci ? di : r)));
  };
  const updateRazon = (i: number, val: string) => {
    setRazonesUsuario((prev) => prev.map((r, idx) => (idx === i ? val : r)));
  };

  const progressPct = (step / 2) * 100;

  return (
    <LessonShell
      id="L10"
      title="Cuidado: no todo lo que brilla es inversión"
      completion={{ ready: casosCompletos }}
    >
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full transition-all" style={{ width: `${progressPct}%`, backgroundColor: infoColor }} />
        </div>

        {/* Pantalla 0 — Las 5 señales de alerta */}
        {step === 0 && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl border-2" style={{ backgroundColor: errorBg, borderColor: errorColor }}>
              <div className="flex items-center gap-2 mb-2">
                <span>⚠️</span>
                <p className="font-extrabold" style={{ color: '#DC2626' }}>Alerta</p>
              </div>
              <p className="text-sm">
                Cada año, miles de mexicanos pierden sus ahorros en esquemas fraudulentos que prometen rendimientos imposibles. Hoy aprendes a detectarlos antes de caer.
              </p>
            </div>
            <p className="text-lg font-bold">Las 5 señales de fraude</p>
            <p className="text-sm text-[var(--color-text-secondary)]">Toca cada señal para leer más:</p>
            <div className="space-y-3">
              {SENALES.map((s, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl border-2 cursor-pointer transition-all"
                  style={{
                    borderColor: senal === i ? errorColor : errorBg,
                    backgroundColor: senal === i ? errorBg : 'white',
                  }}
                  onClick={() => setSenal(senal === i ? null : i)}
                >
                  <div className="flex gap-3 items-start">
                    <span className="shrink-0">{s.emoji}</span>
                    <div>
                      <p className="text-sm font-bold">{s.titulo}</p>
                      {senal === i && (
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">{s.desc}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <FECard variant="flat" className="text-center border-2" style={{ backgroundColor: errorBg, borderColor: errorColor }}>
              <p className="font-extrabold">Si suena demasiado bueno para ser verdad, no es verdad.</p>
            </FECard>
            <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: errorColor }} onClick={() => setStep(1)}>
              Practicar con casos reales →
            </button>
          </div>
        )}

        {/* Pantalla 1 — Casos interactivos */}
        {step === 1 && (
          <div className="space-y-6">
            <p className="text-lg font-bold">¿Lo harías o no?</p>
            <p className="text-sm text-[var(--color-text-secondary)]">3 casos basados en fraudes reales en México:</p>
            <div className="flex gap-2 mb-2">
              {CASOS.map((_, i) => {
                const resp = respuestasCasos[i];
                const done = resp !== null;
                const correcto = done && resp === CASOS[i]!.correcta;
                return (
                  <button
                    key={i}
                    className="px-3 py-1 rounded-full text-xs font-bold border transition-colors"
                    style={{
                      backgroundColor: done ? (correcto ? successBg : errorBg) : casoActivo === i ? warnBg : 'transparent',
                      borderColor: done ? (correcto ? successColor : errorColor) : casoActivo === i ? warnColor : 'var(--color-neutral-200)',
                      color: done ? (correcto ? '#059669' : '#DC2626') : casoActivo === i ? '#D97706' : 'var(--color-text-secondary)',
                    }}
                    onClick={() => setCasoActivo(i)}
                  >
                    Caso {i + 1}
                  </button>
                );
              })}
            </div>
            {CASOS.map((caso, ci) => {
              const resp = respuestasCasos[ci];
              const respondido = resp !== null;
              const correcto = resp === caso.correcta;
              return (
                <div key={ci} className={cn(casoActivo !== ci && 'hidden')}>
                  <FECard
                    variant="flat"
                    className="border"
                    style={{ borderColor: respondido ? (correcto ? successColor : errorColor) : 'var(--color-neutral-200)' }}
                  >
                    <p className="font-bold mb-2">{caso.titulo}</p>
                    <p className="text-sm mb-4">{caso.descripcion}</p>
                    {!respondido ? (
                      <div className="space-y-3">
                        <textarea
                          className="w-full border border-[var(--color-neutral-200)] rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-info)]"
                          rows={2}
                          placeholder="¿Por qué tomarías esta decisión?"
                          value={razonesUsuario[ci]}
                          onChange={(e) => updateRazon(ci, e.target.value)}
                        />
                        <div className="flex gap-2">
                          {caso.decisiones.map((d, di) => (
                            <button
                              key={di}
                              className="flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors"
                              style={di === 0
                                ? { borderColor: successColor, color: successColor }
                                : { borderColor: errorColor, color: errorColor }}
                              onClick={() => responderCaso(ci, di)}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <span
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold"
                          style={correcto ? { backgroundColor: successBg, color: '#059669' } : { backgroundColor: errorBg, color: '#DC2626' }}
                        >
                          {correcto ? '✅ Decisión correcta' : '❌ Esta era una trampa'}
                        </span>
                        <div className="p-3 rounded-xl bg-gray-100">
                          <p className="text-xs font-bold">Señales de alerta:</p>
                          {caso.senales.map((s) => (
                            <p key={s} className="text-xs" style={{ color: errorColor }}>🚨 {s}</p>
                          ))}
                        </div>
                        <div className="p-3 rounded-xl" style={{ backgroundColor: errorBg }}>
                          <p className="text-xs font-bold">Lo que ocurrió:</p>
                          <p className="text-xs">{caso.resultado}</p>
                        </div>
                        {ci < CASOS.length - 1 && (
                          <button
                            className="w-full py-2 rounded-xl text-sm font-semibold border"
                            style={{ borderColor: infoColor, color: infoColor }}
                            onClick={() => setCasoActivo(ci + 1)}
                          >
                            Siguiente caso →
                          </button>
                        )}
                      </div>
                    )}
                  </FECard>
                </div>
              );
            })}
            {casosCompletos && (
              <div className="space-y-4">
                <FECard variant="flat" className="text-center border-2" style={{ backgroundColor: successBg, borderColor: successColor }}>
                  <p className="text-2xl">🛡️</p>
                  <p className="font-extrabold">¡Los 3 casos completados!</p>
                  <p className="text-sm">Ya sabes detectar fraudes financieros. Ese conocimiento vale más que cualquier inversión.</p>
                </FECard>
                <FinniMessage
                  variant="coach"
                  title="¿Tienes alguna inversión activa que no estás seguro si es legítima?"
                  message="Verifica en CNBV.gob.mx antes de aportar más dinero. Si no está en el registro, no inviertas."
                />
                <div className="p-4 rounded-2xl" style={{ backgroundColor: infoBg }}>
                  <p className="text-sm font-bold mb-1">Recursos para reportar fraudes:</p>
                  <p className="text-sm">📞 CONDUSEF: 800-999-8080</p>
                  <p className="text-sm">🌐 CNBV.gob.mx → Verificar institución</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </LessonShell>
  );
}
