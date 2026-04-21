import { useState } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

type PerfilTipo = 'conservador' | 'moderado' | 'agresivo';

const PERFILES = {
  conservador: { nombre: 'Conservador', emoji: '🛡️', desc: 'Prioriza no perder dinero sobre ganar mucho. Prefiere rendimientos bajos pero seguros.', instrumentos: ['CETES 28 días', 'Depósito bancario sin comisión', 'Fondo de deuda gubernamental'], fortaleza: 'Alta estabilidad, baja ansiedad, ideal para plazos cortos.', riesgo: 'Puede perder poder adquisitivo frente a la inflación si los rendimientos son bajos.', color: 'success' as const },
  moderado: { nombre: 'Moderado', emoji: '⚖️', desc: 'Acepta algo de riesgo a cambio de mayores rendimientos. Mezcla deuda y acciones.', instrumentos: ['Fondo balanceado CNBV', 'CETES 91 días + fondo de acciones', 'FIBRAs'], fortaleza: 'Balance entre seguridad y crecimiento. Horizonte mediano.', riesgo: 'Puede ver caídas temporales. Requiere paciencia para esperar la recuperación.', color: 'warning' as const },
  agresivo: { nombre: 'Agresivo (Dinámico)', emoji: '🚀', desc: 'Acepta pérdidas temporales por el potencial de ganar más a largo plazo. Alta tolerancia.', instrumentos: ['Acciones BMV via GBM+', 'Fondo de renta variable', 'ETFs internacionales vía plataforma autorizada'], fortaleza: 'Mayor potencial de rendimiento a largo plazo.', riesgo: 'Alta volatilidad. Puede ver pérdidas significativas a corto plazo.', color: 'error' as const },
};

const PREGUNTAS = [
  { texto: '¿Cómo reaccionarías si tu inversión bajara un 15%?', opciones: ['Vendería de inmediato', 'Esperaría a que se recupere', 'Compraría más aprovechando el precio'], pesos: [1, 2, 3] },
  { texto: '¿Para cuándo necesitas el dinero que invertirías?', opciones: ['Menos de 1 año', '1-3 años', 'Más de 3 años'], pesos: [1, 2, 3] },
  { texto: '¿Cuánto de tu patrimonio puedes poner en riesgo?', opciones: ['Muy poco', 'Algo', 'Una parte significativa'], pesos: [1, 2, 3] },
  { texto: '¿Tienes fondo de emergencias cubierto?', opciones: ['No', 'Parcialmente', 'Sí, completo'], pesos: [1, 2, 3] },
  { texto: '¿Cómo describirías tu conocimiento financiero actual?', opciones: ['Básico', 'Intermedio', 'Avanzado'], pesos: [1, 2, 3] },
  { texto: '¿Ganar $500 seguros o apostar a $1,500 con 50% de probabilidad?', opciones: ['Los $500 seguros', 'Depende del contexto', 'La apuesta'], pesos: [1, 2, 3] },
  { texto: '¿Con qué frecuencia revisarías tu inversión?', opciones: ['Todos los días', 'Una vez al mes', 'Pocas veces al año'], pesos: [1, 2, 3] },
  { texto: '¿Cuál es tu objetivo principal al invertir?', opciones: ['Proteger de la inflación', 'Crecer moderadamente', 'Maximizar rendimiento'], pesos: [1, 2, 3] },
];

const COLOR_MAP = {
  success: { main: 'var(--color-brand-success)', bg: 'var(--color-brand-success-bg)' },
  warning: { main: 'var(--color-brand-warning)', bg: 'var(--color-brand-warning-bg)' },
  error:   { main: 'var(--color-brand-error)',   bg: 'var(--color-brand-error-bg)' },
};

const infoColor = 'var(--color-brand-info)';
const infoBg = 'var(--color-brand-info-bg)';

function calcularPerfil(respuestas: (number | null)[]): PerfilTipo {
  const total = respuestas.reduce<number>((acc, r, i) => {
    if (r === null) return acc;
    return acc + (PREGUNTAS[i]!.pesos[r] ?? 1);
  }, 0);
  if (total <= 12) return 'conservador';
  if (total <= 19) return 'moderado';
  return 'agresivo';
}

export default function L08() {
  const [step, setStep] = useState(0);
  const [respuestas, setRespuestas] = useState<(number | null)[]>(Array(8).fill(null));
  const [guardado, setGuardado] = useState(false);

  const respondidas = respuestas.filter((r) => r !== null).length;
  const cuestionarioCompleto = respuestas.every((r) => r !== null);
  const perfil = cuestionarioCompleto ? calcularPerfil(respuestas) : null;
  const perfilData = perfil ? PERFILES[perfil] : null;
  const nivelRiesgo = respondidas > 0
    ? Math.round((respuestas.reduce<number>((acc, r, i) => acc + (r !== null ? (PREGUNTAS[i]!.pesos[r] ?? 1) : 1.5), 0) / (8 * 3)) * 100)
    : 0;

  const responder = (qi: number, oi: number) => setRespuestas((prev) => prev.map((r, i) => (i === qi ? oi : r)));

  const handleGuardar = async () => {
    if (!perfil) return;
    await lessonDataRepository.save('inversion', 'l08_perfil_riesgo', { perfil, respuestas, guardadoEn: new Date().toISOString() });
    setGuardado(true);
  };

  return (
    <LessonShell id="L08" title="¿Qué tipo de inversionista eres? Conoce tu perfil" completion={{ ready: cuestionarioCompleto && guardado }}>
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full transition-all" style={{ width: `${(step / 2) * 100}%`, backgroundColor: infoColor }} />
        </div>

        {/* Pantalla 0 — Los 3 perfiles */}
        {step === 0 && (
          <div className="space-y-6">
            <FinniMessage variant="coach" title="¿Cómo reaccionarías si tu inversión bajara un 20%?" message="¿Dormirías tranquilo? ¿Venderías de pánico? La respuesta define tu perfil de inversionista. Hoy lo descubrimos." />
            <p className="text-2xl font-bold">Los 3 perfiles de inversionista</p>
            <div className="space-y-4">
              {(Object.entries(PERFILES) as [PerfilTipo, typeof PERFILES['conservador']][]).map(([key, p]) => {
                const c = COLOR_MAP[p.color];
                return (
                  <FECard key={key} variant="flat" className="border-2" style={{ borderColor: c.main, backgroundColor: c.bg }}>
                    <div className="flex gap-3 items-center mb-2">
                      <p className="text-2xl">{p.emoji}</p>
                      <p className="font-extrabold">{p.nombre}</p>
                    </div>
                    <p className="text-sm">{p.desc}</p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">Instrumentos típicos: {p.instrumentos[0]}</p>
                  </FECard>
                );
              })}
            </div>
            <FECard variant="flat" className="border" style={{ borderColor: infoColor, backgroundColor: infoBg }}>
              <p className="text-sm font-bold">No hay perfil mejor que otro.</p>
              <p className="text-sm">El problema no es ser conservador o agresivo: el problema es invertir en instrumentos que no corresponden a tu perfil.</p>
            </FECard>
            <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: infoColor }} onClick={() => setStep(1)}>
              Iniciar cuestionario →
            </button>
          </div>
        )}

        {/* Pantalla 1 — Cuestionario */}
        {step === 1 && !cuestionarioCompleto && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-xl font-bold">Cuestionario de perfil</p>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: infoColor }}>{respondidas}/8</span>
            </div>
            <FECard variant="flat" className="border" style={{ borderColor: 'var(--color-brand-warning)' }}>
              <p className="text-xs font-bold">Termómetro de riesgo:</p>
              <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-3 mt-1">
                <div className="h-3 rounded-full transition-all" style={{ width: `${nivelRiesgo}%`, backgroundColor: nivelRiesgo < 40 ? 'var(--color-brand-success)' : nivelRiesgo < 65 ? 'var(--color-brand-warning)' : 'var(--color-brand-error)' }} />
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">{nivelRiesgo < 40 ? 'Perfil conservador' : nivelRiesgo < 65 ? 'Perfil moderado' : 'Perfil agresivo'}</p>
            </FECard>
            <div className="space-y-4">
              {PREGUNTAS.map((q, qi) => {
                const resp = respuestas[qi];
                return (
                  <div key={qi} className="p-4 rounded-xl border" style={{ borderColor: resp !== null ? 'var(--color-brand-warning)' : 'var(--color-border)' }}>
                    <p className="text-sm font-bold mb-3">{qi + 1}. {q.texto}</p>
                    <div className="space-y-2">
                      {q.opciones.map((op, oi) => (
                        <button
                          key={oi}
                          onClick={() => responder(qi, oi)}
                          className="w-full text-left px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors"
                          style={{
                            borderColor: infoColor,
                            backgroundColor: resp === oi ? infoColor : 'transparent',
                            color: resp === oi ? 'white' : 'inherit',
                          }}
                        >
                          {op}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Resultado */}
        {cuestionarioCompleto && perfilData && (
          <div className="space-y-6">
            {(() => {
              const c = COLOR_MAP[perfilData.color];
              return (
                <>
                  <FECard variant="flat" className="border-[3px] text-center py-6" style={{ borderColor: c.main, backgroundColor: c.bg }}>
                    <p className="text-5xl">{perfilData.emoji}</p>
                    <p className="text-2xl font-extrabold mt-2">Perfil: {perfilData.nombre}</p>
                    <p className="text-sm mt-2">{perfilData.desc}</p>
                  </FECard>
                  <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
                    <p className="font-bold mb-2">Instrumentos recomendados para ti:</p>
                    <div className="space-y-2">
                      {perfilData.instrumentos.map((inst) => (
                        <span key={inst} className="inline-block mr-2 mb-1 px-3 py-1 rounded-full text-xs font-bold border-2" style={{ borderColor: c.main, color: c.main }}>{inst}</span>
                      ))}
                    </div>
                  </FECard>
                  <div className="flex gap-4">
                    <FECard variant="flat" className="flex-1 border" style={{ borderColor: 'var(--color-brand-success)', backgroundColor: 'var(--color-brand-success-bg)' }}>
                      <p className="text-xs font-bold">Fortaleza</p>
                      <p className="text-sm">{perfilData.fortaleza}</p>
                    </FECard>
                    <FECard variant="flat" className="flex-1 border" style={{ borderColor: 'var(--color-brand-error)', backgroundColor: 'var(--color-brand-error-bg)' }}>
                      <p className="text-xs font-bold">A vigilar</p>
                      <p className="text-sm">{perfilData.riesgo}</p>
                    </FECard>
                  </div>
                  <FECard variant="flat" className="border" style={{ borderColor: 'var(--color-brand-warning)', backgroundColor: 'var(--color-brand-warning-bg)' }}>
                    <p className="text-xs font-bold" style={{ color: '#B45309' }}>⚡ Este perfil se guardará y se usará en las lecciones 9, 13, 14 y 15.</p>
                  </FECard>
                  <button
                    className="w-full min-h-11 text-white rounded-xl font-semibold text-sm disabled:opacity-50"
                    style={{ backgroundColor: infoColor }}
                    onClick={() => void handleGuardar()}
                    disabled={guardado}
                  >
                    {guardado ? `✅ Perfil guardado: ${perfilData.nombre}` : 'Guardar mi perfil de inversionista'}
                  </button>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </LessonShell>
  );
}
