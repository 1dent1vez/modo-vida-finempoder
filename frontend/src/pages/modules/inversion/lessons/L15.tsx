import { useEffect, useState } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import { useAuth } from '../../../../store/auth';

const INSTRUMENTOS_SIM = [
  { key: 'cetes28',        nombre: 'CETES 28 días',                   tasaAnual: 0.100, riesgo: 1, emoji: '🔵' },
  { key: 'cetes91',        nombre: 'CETES 91 días',                   tasaAnual: 0.102, riesgo: 1, emoji: '🔵' },
  { key: 'fondoDeuda',     nombre: 'Fondo de deuda gubernamental',     tasaAnual: 0.090, riesgo: 2, emoji: '🟡' },
  { key: 'fondoBalanceado',nombre: 'Fondo balanceado',                 tasaAnual: 0.110, riesgo: 3, emoji: '🟡' },
  { key: 'bimbo',          nombre: 'Acciones Bimbo (consumo)',         tasaAnual: 0.12,  riesgo: 4, emoji: '🔴' },
  { key: 'amovil',         nombre: 'Acciones América Móvil (telecom)', tasaAnual: 0.11,  riesgo: 4, emoji: '🔴' },
  { key: 'banorte',        nombre: 'Acciones Banorte (financiero)',    tasaAnual: 0.13,  riesgo: 4, emoji: '🔴' },
];

const EVENTOS_TRIM = [
  [
    { desc: 'Banxico sube tasas de interés 0.25%', impacto: { cetes28: 0.005, cetes91: 0.005, fondoDeuda: 0.003, fondoBalanceado: 0, bimbo: -0.02, amovil: -0.015, banorte: 0.01 } },
    { desc: 'Buen desempeño económico general (+1.2%)', impacto: { cetes28: 0, cetes91: 0, fondoDeuda: 0, fondoBalanceado: 0.03, bimbo: 0.05, amovil: 0.04, banorte: 0.03 } },
  ],
  [
    { desc: 'Caída del mercado de acciones (-15%)', impacto: { cetes28: 0, cetes91: 0, fondoDeuda: 0, fondoBalanceado: -0.05, bimbo: -0.15, amovil: -0.12, banorte: -0.14 } },
    { desc: 'Inflación mayor de lo esperado (+5.2%)', impacto: { cetes28: 0.002, cetes91: 0.003, fondoDeuda: 0.001, fondoBalanceado: -0.01, bimbo: -0.02, amovil: -0.01, banorte: -0.01 } },
  ],
  [
    { desc: 'Buen trimestre corporativo (+8% acciones)', impacto: { cetes28: 0, cetes91: 0, fondoDeuda: 0, fondoBalanceado: 0.04, bimbo: 0.08, amovil: 0.07, banorte: 0.06 } },
    { desc: 'Devaluación del peso (-3%)', impacto: { cetes28: 0.001, cetes91: 0.001, fondoDeuda: 0.001, fondoBalanceado: -0.02, bimbo: -0.03, amovil: 0.02, banorte: -0.01 } },
  ],
  [
    { desc: 'Recuperación del mercado (+10%)', impacto: { cetes28: 0, cetes91: 0, fondoDeuda: 0, fondoBalanceado: 0.05, bimbo: 0.10, amovil: 0.08, banorte: 0.09 } },
    { desc: 'Tasas estables — fin de ciclo alcista', impacto: { cetes28: 0, cetes91: 0, fondoDeuda: 0.002, fondoBalanceado: 0.01, bimbo: 0.02, amovil: 0.02, banorte: 0.02 } },
  ],
];

type PortafolioKey = typeof INSTRUMENTOS_SIM[number]['key'];
type Portafolio = Record<PortafolioKey, number>;

const INFLACION_SIM = 0.04;
const BADGES_PROGRAMA = [
  { emoji: '💰', nombre: 'Presupuesto Pro',       modulo: 'Módulo 1' },
  { emoji: '🌱', nombre: 'Ahorrador Constante',   modulo: 'Módulo 2' },
  { emoji: '📈', nombre: 'Inversionista Prudente', modulo: 'Módulo 3' },
];
const RECURSOS = [
  { nombre: 'CONDUSEF.gob.mx', url: 'https://www.condusef.gob.mx', desc: 'Educación financiera y protección al usuario' },
  { nombre: 'cetesdirecto.com', url: 'https://www.cetesdirecto.com', desc: 'Compra CETES desde $100' },
  { nombre: 'CNBV.gob.mx', url: 'https://www.cnbv.gob.mx', desc: 'Verifica instituciones financieras reguladas' },
  { nombre: 'IPAB.gob.mx', url: 'https://www.ipab.org.mx', desc: 'Protección del ahorro bancario' },
  { nombre: 'INEGI.gob.mx (INPC)', url: 'https://www.inegi.org.mx', desc: 'Inflación mensual oficial de México' },
];

const infoColor  = 'var(--color-brand-info)';
const infoBg     = 'var(--color-brand-info-bg)';
const warnColor  = 'var(--color-brand-warning)';
const warnBg     = 'var(--color-brand-warning-bg)';
const successColor = 'var(--color-brand-success)';
const successBg    = 'var(--color-brand-success-bg)';
const errorColor = 'var(--color-brand-error)';

const riesgoColor = (r: number) => r <= 2 ? successColor : r === 3 ? warnColor : errorColor;

export default function L15() {
  const userName = useAuth((s) => s.user?.name);
  const [step, setStep] = useState(0);
  const [perfilRiesgo, setPerfilRiesgo] = useState<string>('moderado');
  const [capitalInicial, setCapitalInicial] = useState(5000);
  const [planData, setPlanData] = useState<{ instrumento?: string; plazoMeses?: number } | null>(null);

  const [portafolio, setPortafolio] = useState<Portafolio>({
    cetes28: 40, cetes91: 0, fondoDeuda: 20, fondoBalanceado: 25, bimbo: 5, amovil: 5, banorte: 5,
  });

  const [trimestreActual, setTrimestreActual] = useState(0);
  const [eventoActual, setEventoActual] = useState<{ desc: string; impacto: Partial<Portafolio> } | null>(null);
  const [historial, setHistorial] = useState<{ trimestre: number; evento: string; decision: string; valorPortafolio: number }[]>([]);
  const [valorPortafolio, setValorPortafolio] = useState(5000);
  const [decisionTomada, setDecisionTomada] = useState<string | null>(null);
  const [simulacionCompleta, setSimulacionCompleta] = useState(false);
  const [badgeDesbloqueado, setBadgeDesbloqueado] = useState(false);

  useEffect(() => {
    const load = async () => {
      const perfil = await lessonDataRepository.load<{ perfil: string }>('inversion', 'l08_perfil_riesgo');
      if (perfil?.perfil) setPerfilRiesgo(perfil.perfil);
      const capital = await lessonDataRepository.load<{ capital: number }>('inversion', 'l04_capital');
      if (capital?.capital && capital.capital > 0) setCapitalInicial(Math.min(capital.capital, 5000));
      const plan = await lessonDataRepository.load<{ instrumento?: string; plazoMeses?: number }>('inversion', 'l13_plan');
      if (plan) setPlanData(plan);
    };
    void load();
  }, []);

  const totalPct = Object.values(portafolio).reduce((a, b) => a + b, 0);
  const instrumentosUsados = INSTRUMENTOS_SIM.filter((inst) => portafolio[inst.key as PortafolioKey] > 0).length;
  const maxConcentracion = Math.max(...Object.values(portafolio));
  const concentradoDeMas = maxConcentracion > 70;
  const diversificadoMinimo = instrumentosUsados >= 2;
  const porcentajeAcciones = ['bimbo', 'amovil', 'banorte'].reduce((acc, k) => acc + (portafolio[k as PortafolioKey] ?? 0), 0);
  const perfilAdvierte = perfilRiesgo === 'conservador' && porcentajeAcciones > 30;
  const portafolioValido = diversificadoMinimo && !concentradoDeMas && Math.abs(totalPct - 100) <= 1;

  const setPct = (key: PortafolioKey, val: number) => {
    setPortafolio((prev) => {
      const clamped = Math.max(0, Math.min(100, val));
      const otros = Object.keys(prev).filter((k) => k !== key) as PortafolioKey[];
      const resto = 100 - clamped;
      const sumOtros = otros.reduce((a, k) => a + (prev[k] ?? 0), 0);
      const updated: Portafolio = { ...prev, [key]: clamped };
      if (sumOtros > 0) {
        otros.forEach((k) => { updated[k] = Math.round(((prev[k] ?? 0) / sumOtros) * resto); });
        const suma = Object.values(updated).reduce((a, b) => a + b, 0);
        if (suma !== 100) {
          const otroFix = otros.find((k) => updated[k]! + (100 - suma) >= 0);
          if (otroFix) updated[otroFix] = updated[otroFix]! + (100 - suma);
        }
      }
      return updated;
    });
  };

  const iniciarTrimestre = (num: number) => {
    const eventosTrim = EVENTOS_TRIM[num] ?? EVENTOS_TRIM[0]!;
    const idx = Math.floor(Math.random() * eventosTrim.length);
    setEventoActual(eventosTrim[idx]!);
    setDecisionTomada(null);
    setTrimestreActual(num);
  };

  const tomarDecision = (decision: string) => {
    if (!eventoActual) return;
    setDecisionTomada(decision);
    let nuevoValor = valorPortafolio;
    if (decision !== 'vender') {
      const impacto = eventoActual.impacto;
      const impactoTotal = INSTRUMENTOS_SIM.reduce((acc, inst) => {
        const pct = (portafolio[inst.key as PortafolioKey] ?? 0) / 100;
        const imp = (impacto as Record<string, number>)[inst.key] ?? 0;
        return acc + pct * imp;
      }, 0);
      nuevoValor = valorPortafolio * (1 + impactoTotal + inst_rendimiento_base(portafolio) / 4);
    } else {
      nuevoValor = valorPortafolio * 0.98;
    }
    setValorPortafolio(nuevoValor);
    setHistorial((prev) => [...prev, { trimestre: trimestreActual + 1, evento: eventoActual.desc, decision, valorPortafolio: nuevoValor }]);
  };

  function inst_rendimiento_base(p: Portafolio): number {
    return INSTRUMENTOS_SIM.reduce((acc, inst) => {
      const pct = (p[inst.key as PortafolioKey] ?? 0) / 100;
      return acc + pct * (inst.tasaAnual / 4);
    }, 0);
  }

  const avanzarTrimestre = () => {
    if (trimestreActual < 3) iniciarTrimestre(trimestreActual + 1);
    else { setSimulacionCompleta(true); setStep(5); }
  };

  const rendimientoFinal = ((valorPortafolio - capitalInicial) / capitalInicial) * 100;
  const superoInflacion = rendimientoFinal > INFLACION_SIM * 100;

  const handleDesbloquear = async () => {
    await lessonDataRepository.save('inversion', 'l15_resultado', { valorFinal: valorPortafolio, rendimiento: rendimientoFinal, superoInflacion, historial, badgeDesbloqueadoEn: new Date().toISOString() });
    setBadgeDesbloqueado(true);
    setStep(6);
  };

  const progressStepPct = step === 0 ? 0 : step === 1 ? 15 : step === 2 ? 30 : step <= 4 ? 30 + trimestreActual * 15 : step === 5 ? 90 : 100;

  return (
    <LessonShell
      id="L15"
      title="Reto final: Tu primera inversión simulada"
      completion={{ ready: simulacionCompleta }}
    >
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full transition-all" style={{ width: `${progressStepPct}%`, backgroundColor: infoColor }} />
        </div>

        {/* Pantalla 0 — Apertura */}
        {step === 0 && (
          <div className="space-y-6">
            <FECard variant="flat" className="text-center py-8 border-[3px]" style={{ backgroundColor: warnBg, borderColor: warnColor }}>
              <p className="text-4xl">🏆</p>
              <p className="text-xl font-extrabold mt-2">¡El reto final de FinEmpoder!</p>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">15 lecciones de inversión culminan aquí</p>
            </FECard>
            <FinniMessage variant="coach" title="¡Llegaste al reto final!" message="En este módulo aprendiste todo lo que necesitas para tomar tu primera decisión de inversión informada. Ahora vas a demostrar que lo entendiste — sin riesgo real, pero con decisiones reales." />
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="font-bold mb-2">El reto:</p>
              <p className="text-sm mb-2">Tienes <strong>${capitalInicial.toLocaleString()} virtuales</strong> y <strong>12 meses simulados</strong> (4 trimestres). Tu misión:</p>
              <div className="space-y-1">
                <p className="text-sm">✓ Construir un portafolio que supere la inflación ({(INFLACION_SIM * 100).toFixed(0)}%)</p>
                <p className="text-sm">✓ Sea coherente con tu perfil: <strong>{perfilRiesgo}</strong></p>
                <p className="text-sm">✓ Diversificar en al menos 2 instrumentos</p>
                <p className="text-sm">✓ Tomar decisiones trimestrales ante eventos del mercado</p>
              </div>
            </FECard>
            {planData?.instrumento && (
              <FECard variant="flat" className="border" style={{ backgroundColor: infoBg, borderColor: infoColor }}>
                <p className="text-xs font-bold">Desde tu plan (L13):</p>
                <p className="text-xs">Instrumento preferido: <strong>{planData.instrumento}</strong></p>
              </FECard>
            )}
            <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: infoColor }} onClick={() => setStep(1)}>
              ¡Construir mi portafolio! →
            </button>
          </div>
        )}

        {/* Pantalla 1 — Construcción del portafolio */}
        {step === 1 && (
          <div className="space-y-6">
            <p className="text-lg font-bold">Construye tu portafolio</p>
            <p className="text-sm text-[var(--color-text-secondary)]">Distribuye 100% de tu capital entre los instrumentos disponibles:</p>
            {perfilAdvierte && (
              <div className="p-3 rounded-xl border" style={{ backgroundColor: warnBg, borderColor: warnColor }}>
                <p className="text-xs font-bold text-amber-700">⚠️ Tu perfil es conservador pero tienes {porcentajeAcciones}% en acciones. Considera reducirlo.</p>
              </div>
            )}
            <div className="space-y-3">
              {INSTRUMENTOS_SIM.map((inst) => {
                const pct = portafolio[inst.key as PortafolioKey] ?? 0;
                return (
                  <div key={inst.key} className="p-3 rounded-xl border border-[var(--color-neutral-200)] bg-white">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-bold">{inst.emoji} {inst.nombre}</p>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border" style={{ color: successColor, borderColor: successColor }}>
                          {(inst.tasaAnual * 100).toFixed(1)}%/año
                        </span>
                        <span className="font-extrabold text-sm min-w-[36px] text-right" style={{ color: '#D97706' }}>{pct}%</span>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <button className="px-2 py-1 rounded-lg text-xs border border-[var(--color-neutral-200)] font-bold disabled:opacity-30" onClick={() => setPct(inst.key as PortafolioKey, pct - 5)} disabled={pct <= 0}>-5</button>
                      <div className="flex-1 bg-[var(--color-neutral-100)] rounded-full h-2">
                        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: riesgoColor(inst.riesgo) }} />
                      </div>
                      <button className="px-2 py-1 rounded-lg text-xs border border-[var(--color-neutral-200)] font-bold" onClick={() => setPct(inst.key as PortafolioKey, pct + 5)}>+5</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-3 rounded-xl border-2 flex flex-wrap gap-2" style={{ backgroundColor: portafolioValido ? successBg : 'var(--color-brand-error-bg)', borderColor: portafolioValido ? successColor : errorColor }}>
              {[
                { label: `Total: ${totalPct}%`, ok: Math.abs(totalPct - 100) <= 1 },
                { label: `Instrumentos: ${instrumentosUsados} ≥ 2 ${diversificadoMinimo ? '✓' : '✗'}`, ok: diversificadoMinimo },
                { label: concentradoDeMas ? '⚠ Muy concentrado' : '✓ Diversificado', ok: !concentradoDeMas },
              ].map(({ label, ok }) => (
                <span key={label} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: ok ? successBg : 'var(--color-brand-error-bg)', color: ok ? '#059669' : '#DC2626', border: `1px solid ${ok ? successColor : errorColor}` }}>
                  {label}
                </span>
              ))}
            </div>
            <button
              className="w-full min-h-11 text-white rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: infoColor }}
              disabled={!portafolioValido}
              onClick={() => { setStep(2); iniciarTrimestre(0); }}
            >
              {portafolioValido ? '¡Iniciar simulación! →' : 'Ajusta el portafolio primero'}
            </button>
          </div>
        )}

        {/* Pantallas 2-4 — Trimestres */}
        {step >= 2 && step <= 4 && eventoActual && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-lg font-bold">Trimestre {trimestreActual + 1}/4</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: infoBg, color: infoColor, border: `1px solid ${infoColor}` }}>
                Portafolio: ${valorPortafolio.toFixed(0)}
              </span>
            </div>
            <div className="p-4 rounded-2xl border-2" style={{ backgroundColor: infoBg, borderColor: infoColor }}>
              <p className="text-xs font-bold" style={{ color: infoColor }}>EVENTO DEL TRIMESTRE:</p>
              <p className="font-bold mt-1">{eventoActual.desc}</p>
            </div>
            {!decisionTomada ? (
              <div className="space-y-4">
                <p className="text-sm font-bold">¿Qué decides hacer?</p>
                {[
                  { key: 'mantener',    label: 'Mantener — confío en mi estrategia',   color: warnColor,    bg: warnBg },
                  { key: 'rebalancear', label: 'Rebalancear — ajustar distribución',    color: infoColor,    bg: infoBg },
                  { key: 'vender',      label: 'Vender parte — reducir exposición',     color: errorColor,   bg: 'var(--color-brand-error-bg)' },
                ].map((dec) => (
                  <button
                    key={dec.key}
                    className="w-full py-3 px-4 rounded-xl text-left text-sm font-semibold border-2 transition-colors"
                    style={{ borderColor: dec.color, color: dec.color }}
                    onClick={() => tomarDecision(dec.key)}
                  >
                    {dec.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl border" style={{ backgroundColor: successBg, borderColor: successColor }}>
                  <p className="text-sm font-bold">Decisión: {decisionTomada}</p>
                  <p className="text-xl font-black" style={{ color: '#059669' }}>Portafolio: ${valorPortafolio.toFixed(0)}</p>
                  <p className="text-xs" style={{ color: valorPortafolio > capitalInicial ? successColor : errorColor }}>
                    {valorPortafolio > capitalInicial ? '📈' : '📉'} {((valorPortafolio - capitalInicial) / capitalInicial * 100).toFixed(1)}% vs capital inicial
                  </p>
                </div>
                <FinniMessage
                  variant="coach"
                  title="Evaluación de Finni"
                  message={decisionTomada === 'mantener' ? 'Mantuviste la calma. Eso es exactamente lo que hace un inversionista prudente.' : decisionTomada === 'rebalancear' ? 'Rebalancear con criterio es una estrategia válida. Lo importante es que fue una decisión informada.' : 'Vender por pánico suele ser la peor decisión. Pero a veces proteger el capital es válido — depende del contexto.'}
                />
                <button
                  className="w-full min-h-11 text-white rounded-xl font-semibold text-sm"
                  style={{ backgroundColor: infoColor }}
                  onClick={() => {
                    if (trimestreActual < 3) { avanzarTrimestre(); setStep(step < 4 ? step + 1 : 4); }
                    else { setSimulacionCompleta(true); setStep(5); }
                  }}
                >
                  {trimestreActual < 3 ? `Avanzar a trimestre ${trimestreActual + 2} →` : 'Ver resultados finales →'}
                </button>
              </div>
            )}
            {historial.length > 0 && (
              <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
                <p className="text-xs font-bold mb-1">Historial:</p>
                {historial.map((h) => (
                  <div key={h.trimestre} className="flex justify-between py-1 border-b border-[var(--color-neutral-200)]">
                    <span className="text-xs">T{h.trimestre}: {h.decision}</span>
                    <span className="text-xs font-bold">${h.valorPortafolio.toFixed(0)}</span>
                  </div>
                ))}
              </FECard>
            )}
          </div>
        )}

        {/* Pantalla 5 — Resultados finales */}
        {step === 5 && simulacionCompleta && (
          <div className="space-y-6">
            <p className="text-lg font-bold">Resultados de los 12 meses</p>
            <div className="p-6 rounded-2xl text-center border-[3px]" style={{ backgroundColor: superoInflacion ? successBg : warnBg, borderColor: superoInflacion ? successColor : warnColor }}>
              <p className="text-4xl">{superoInflacion ? '🏆' : '📊'}</p>
              <p className="text-2xl font-black mt-2">${valorPortafolio.toFixed(0)}</p>
              <p className="text-base">Rendimiento: <strong>{rendimientoFinal.toFixed(2)}%</strong> en 12 meses</p>
              <span className="inline-flex items-center mt-2 px-3 py-1 rounded-full text-sm font-bold" style={{ backgroundColor: superoInflacion ? successBg : warnBg, color: superoInflacion ? '#059669' : '#D97706', border: `1px solid ${superoInflacion ? successColor : warnColor}` }}>
                {superoInflacion ? `✅ Superaste la inflación (${(INFLACION_SIM * 100).toFixed(0)}%)` : `⚠️ No superaste la inflación (${(INFLACION_SIM * 100).toFixed(0)}%)`}
              </span>
            </div>
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="font-bold mb-2">Análisis de tus decisiones trimestrales:</p>
              {historial.map((h) => (
                <div key={h.trimestre} className="py-2 border-b border-[var(--color-neutral-200)]">
                  <p className="text-sm font-bold">T{h.trimestre}: {h.evento}</p>
                  <p className="text-sm">Decisión: <strong>{h.decision}</strong> → Portafolio: ${h.valorPortafolio.toFixed(0)}</p>
                </div>
              ))}
            </FECard>
            <FinniMessage variant="coach" title="Áreas de mejora" message={superoInflacion ? 'Tomaste buenas decisiones bajo presión. Ahora aplica esto en el mundo real.' : 'No superaste la inflación esta vez — pero identificaste los errores. Eso ya es un gran avance.'} />
            <button
              className="w-full min-h-11 text-white rounded-xl font-semibold text-sm disabled:opacity-50"
              style={{ backgroundColor: infoColor }}
              onClick={() => void handleDesbloquear()}
              disabled={badgeDesbloqueado}
            >
              🏆 Desbloquear badge "Inversionista Prudente 📈"
            </button>
          </div>
        )}

        {/* Pantalla 6 — Badge + Cierre épico */}
        {step === 6 && badgeDesbloqueado && (
          <div className="space-y-6">
            <FECard variant="flat" className="text-center py-8 border-[3px]" style={{ backgroundColor: warnBg, borderColor: warnColor }}>
              <div className="flex justify-center gap-6 mb-4">
                {BADGES_PROGRAMA.map((badge) => (
                  <div key={badge.nombre} className="text-center">
                    <p className="text-3xl">{badge.emoji}</p>
                    <p className="text-xs font-bold block">{badge.nombre}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{badge.modulo}</p>
                  </div>
                ))}
              </div>
              <p className="text-5xl mb-2">🏆</p>
              <p className="text-xl font-extrabold">Inversionista Prudente 📈</p>
              <p className="text-sm text-[var(--color-text-secondary)]">Badge desbloqueado · Módulo 3 completado</p>
            </FECard>

            <FECard variant="flat" className="text-center py-6 border-2" style={{ backgroundColor: successBg, borderColor: successColor }}>
              <p className="text-lg font-extrabold mb-2">¡{userName ? `${userName}, l` : 'L'}o lograste! 🎉</p>
              <p className="mb-3">Completaste los 3 módulos de FinEmpoder.</p>
              <p className="text-sm text-[var(--color-text-secondary)] mb-2"><strong>Presupuestación</strong>, <strong>Ahorro</strong>, <strong>Inversión</strong> — las tres bases de una vida financiera sólida.</p>
              <p className="text-sm italic">"Pero el verdadero aprendizaje comienza ahora, cuando apliques esto en tu vida real. Cada decisión financiera que tomes a partir de hoy será diferente. Más consciente. Más tuya."</p>
            </FECard>

            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="font-bold mb-3">Estadísticas del programa completo:</p>
              <div className="space-y-2">
                {[
                  { label: 'Lecciones completadas', val: '45 lecciones (3 módulos)' },
                  { label: 'Badges desbloqueados', val: '💰 🌱 📈 (3/3)' },
                  { label: 'Rendimiento en simulador', val: `${rendimientoFinal >= 0 ? '+' : ''}${rendimientoFinal.toFixed(2)}%`, color: rendimientoFinal >= 0 ? '#059669' : '#DC2626' },
                  { label: 'Inflación superada', val: superoInflacion ? 'Sí ✅' : 'No — sigue practicando', color: superoInflacion ? '#059669' : '#D97706' },
                ].map(({ label, val, color }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>
                    <span className="text-sm font-bold" style={{ color }}>{val}</span>
                  </div>
                ))}
              </div>
            </FECard>

            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="font-bold mb-2">Recursos para continuar aprendiendo:</p>
              <div className="space-y-2">
                {RECURSOS.map((r) => (
                  <div key={r.nombre}>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold" style={{ color: warnColor }}>
                      {r.nombre}
                    </a>
                    <p className="text-xs text-[var(--color-text-secondary)]">{r.desc}</p>
                  </div>
                ))}
              </div>
            </FECard>

            <div className="p-4 rounded-2xl text-center" style={{ backgroundColor: infoBg }}>
              <p className="text-sm font-extrabold mb-1">"Gracias por confiar en FinEmpoder."</p>
              <p className="text-sm italic">"Ahora ve y haz que tu dinero trabaje para ti."</p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-2">— Finni 🤖</p>
            </div>
          </div>
        )}
      </div>
    </LessonShell>
  );
}
