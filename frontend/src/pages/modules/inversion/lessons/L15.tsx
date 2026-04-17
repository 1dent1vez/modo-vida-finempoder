import { useEffect, useState } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade,
  Chip, Paper, Link,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import { useAuth } from '../../../../store/auth';

// Instrumentos disponibles en el simulador
const INSTRUMENTOS_SIM = [
  { key: 'cetes28', nombre: 'CETES 28 días', tasaAnual: 0.100, riesgo: 1, emoji: '🔵' },
  { key: 'cetes91', nombre: 'CETES 91 días', tasaAnual: 0.102, riesgo: 1, emoji: '🔵' },
  { key: 'fondoDeuda', nombre: 'Fondo de deuda gubernamental', tasaAnual: 0.090, riesgo: 2, emoji: '🟡' },
  { key: 'fondoBalanceado', nombre: 'Fondo balanceado', tasaAnual: 0.110, riesgo: 3, emoji: '🟡' },
  { key: 'bimbo', nombre: 'Acciones Bimbo (consumo)', tasaAnual: 0.12, riesgo: 4, emoji: '🔴' },
  { key: 'amovil', nombre: 'Acciones América Móvil (telecom)', tasaAnual: 0.11, riesgo: 4, emoji: '🔴' },
  { key: 'banorte', nombre: 'Acciones Banorte (financiero)', tasaAnual: 0.13, riesgo: 4, emoji: '🔴' },
];

// Eventos trimestrales aleatorios
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
  { emoji: '💰', nombre: 'Presupuesto Pro', modulo: 'Módulo 1' },
  { emoji: '🌱', nombre: 'Ahorrador Constante', modulo: 'Módulo 2' },
  { emoji: '📈', nombre: 'Inversionista Prudente', modulo: 'Módulo 3' },
];

const RECURSOS = [
  { nombre: 'CONDUSEF.gob.mx', url: 'https://www.condusef.gob.mx', desc: 'Educación financiera y protección al usuario' },
  { nombre: 'cetesdirecto.com', url: 'https://www.cetesdirecto.com', desc: 'Compra CETES desde $100' },
  { nombre: 'CNBV.gob.mx', url: 'https://www.cnbv.gob.mx', desc: 'Verifica instituciones financieras reguladas' },
  { nombre: 'IPAB.gob.mx', url: 'https://www.ipab.org.mx', desc: 'Protección del ahorro bancario' },
  { nombre: 'INEGI.gob.mx (INPC)', url: 'https://www.inegi.org.mx', desc: 'Inflación mensual oficial de México' },
];

export default function L15() {
  const userName = useAuth((s) => s.user?.name);
  const [step, setStep] = useState(0);

  // Config desde Dexie
  const [perfilRiesgo, setPerfilRiesgo] = useState<string>('moderado');
  const [capitalInicial, setCapitalInicial] = useState(5000);
  const [planData, setPlanData] = useState<{ instrumento?: string; plazoMeses?: number } | null>(null);

  // Portafolio del usuario
  const [portafolio, setPortafolio] = useState<Portafolio>({
    cetes28: 40, cetes91: 0, fondoDeuda: 20, fondoBalanceado: 25, bimbo: 5, amovil: 5, banorte: 5,
  });

  // Simulación por trimestres
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

  // Validaciones del portafolio
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
        otros.forEach((k) => {
          updated[k] = Math.round(((prev[k] ?? 0) / sumOtros) * resto);
        });
        // Fix rounding
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

    // Calcular nuevo valor según el evento y la decisión
    let nuevoValor = valorPortafolio;
    const impacto = eventoActual.impacto;

    if (decision !== 'vender') {
      // Aplicar impacto del evento al portafolio
      const impactoTotal = INSTRUMENTOS_SIM.reduce((acc, inst) => {
        const pct = (portafolio[inst.key as PortafolioKey] ?? 0) / 100;
        const imp = (impacto as Record<string, number>)[inst.key] ?? 0;
        return acc + pct * imp;
      }, 0);
      nuevoValor = valorPortafolio * (1 + impactoTotal + (inst_rendimiento_base(portafolio) / 4));
    } else {
      // Vender = pierde un poco pero evita el peor escenario
      nuevoValor = valorPortafolio * 0.98;
    }

    setValorPortafolio(nuevoValor);
    setHistorial((prev) => [
      ...prev,
      {
        trimestre: trimestreActual + 1,
        evento: eventoActual.desc,
        decision,
        valorPortafolio: nuevoValor,
      },
    ]);
  };

  function inst_rendimiento_base(p: Portafolio): number {
    return INSTRUMENTOS_SIM.reduce((acc, inst) => {
      const pct = (p[inst.key as PortafolioKey] ?? 0) / 100;
      return acc + pct * (inst.tasaAnual / 4);
    }, 0);
  }

  const avanzarTrimestre = () => {
    if (trimestreActual < 3) {
      iniciarTrimestre(trimestreActual + 1);
    } else {
      setSimulacionCompleta(true);
      setStep(5);
    }
  };

  const rendimientoFinal = ((valorPortafolio - capitalInicial) / capitalInicial) * 100;
  const superoInflacion = rendimientoFinal > INFLACION_SIM * 100;

  const handleDesbloquear = async () => {
    await lessonDataRepository.save('inversion', 'l15_resultado', {
      valorFinal: valorPortafolio,
      rendimiento: rendimientoFinal,
      superoInflacion,
      historial,
      badgeDesbloqueadoEn: new Date().toISOString(),
    });
    setBadgeDesbloqueado(true);
    setStep(6);
  };

  return (
    <LessonShell
      id="L15"
      title="Reto final: Tu primera inversión simulada"
      completion={{ ready: simulacionCompleta }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={step === 0 ? 0 : step === 1 ? 15 : step === 2 ? 30 : step <= 4 ? 30 + trimestreActual * 15 : step === 5 ? 90 : 100}
          color="info"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {/* Pantalla 0 — Apertura épica */}
        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FECard variant="flat" sx={{ bgcolor: 'warning.light', border: 3, borderColor: 'warning.main', textAlign: 'center', py: 4 }}>
                <Typography variant="h2">🏆</Typography>
                <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>¡El reto final de FinEmpoder!</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  15 lecciones de inversión culminan aquí
                </Typography>
              </FECard>
              <FinniMessage
                variant="coach"
                title="¡Llegaste al reto final!"
                message="En este módulo aprendiste todo lo que necesitas para tomar tu primera decisión de inversión informada. Ahora vas a demostrar que lo entendiste — sin riesgo real, pero con decisiones reales."
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography fontWeight={700} sx={{ mb: 1 }}>El reto:</Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Tienes <b>${capitalInicial.toLocaleString()} virtuales</b> y <b>12 meses simulados</b> (4 trimestres). Tu misión:
                </Typography>
                <Stack spacing={0.5} sx={{ mt: 1 }}>
                  <Typography variant="body2">✓ Construir un portafolio que supere la inflación ({(INFLACION_SIM * 100).toFixed(0)}%)</Typography>
                  <Typography variant="body2">✓ Sea coherente con tu perfil: <b>{perfilRiesgo}</b></Typography>
                  <Typography variant="body2">✓ Diversificar en al menos 2 instrumentos</Typography>
                  <Typography variant="body2">✓ Tomar decisiones trimestrales ante eventos del mercado</Typography>
                </Stack>
              </FECard>
              {planData?.instrumento && (
                <FECard variant="flat" sx={{ bgcolor: 'info.light', border: 1, borderColor: 'info.main' }}>
                  <Typography variant="caption" fontWeight={700}>Desde tu plan (L13):</Typography>
                  <Typography variant="caption" display="block">Instrumento preferido: <b>{planData.instrumento}</b></Typography>
                </FECard>
              )}
              <Button fullWidth variant="contained" color="info" size="large" onClick={() => setStep(1)}>
                ¡Construir mi portafolio! →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 1 — Construcción del portafolio */}
        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="h4" fontWeight={700}>Construye tu portafolio</Typography>
              <Typography variant="body2" color="text.secondary">
                Distribuye 100% de tu capital entre los instrumentos disponibles:
              </Typography>
              {perfilAdvierte && (
                <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: 'warning.light', border: 1, borderColor: 'warning.main' }}>
                  <Typography variant="caption" color="warning.dark" fontWeight={700}>
                    ⚠️ Tu perfil es conservador pero tienes {porcentajeAcciones}% en acciones. Considera reducirlo.
                  </Typography>
                </Paper>
              )}
              <Stack spacing={1.5}>
                {INSTRUMENTOS_SIM.map((inst) => {
                  const pct = portafolio[inst.key as PortafolioKey] ?? 0;
                  return (
                    <Paper key={inst.key} sx={{ p: 2, borderRadius: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={700}>{inst.emoji} {inst.nombre}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip size="small" label={`${(inst.tasaAnual * 100).toFixed(1)}%/año`} color="success" variant="outlined" />
                          <Typography fontWeight={800} color="warning.dark" sx={{ minWidth: 36, textAlign: 'right' }}>{pct}%</Typography>
                        </Stack>
                      </Stack>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Button size="small" onClick={() => setPct(inst.key as PortafolioKey, pct - 5)} disabled={pct <= 0}>-5</Button>
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          color={inst.riesgo <= 2 ? 'success' : inst.riesgo === 3 ? 'warning' : 'error'}
                          sx={{ flex: 1, height: 8, borderRadius: 4 }}
                        />
                        <Button size="small" onClick={() => setPct(inst.key as PortafolioKey, pct + 5)}>+5</Button>
                      </Box>
                    </Paper>
                  );
                })}
              </Stack>
              <Paper
                sx={{
                  p: 2, borderRadius: 2,
                  bgcolor: portafolioValido ? 'success.light' : 'error.light',
                  border: 2,
                  borderColor: portafolioValido ? 'success.main' : 'error.main',
                }}
              >
                <Stack direction="row" justifyContent="space-between" flexWrap="wrap" useFlexGap>
                  <Chip label={`Total: ${totalPct}%`} color={Math.abs(totalPct - 100) <= 1 ? 'success' : 'error'} size="small" />
                  <Chip label={`Instrumentos: ${instrumentosUsados} ≥ 2 ${diversificadoMinimo ? '✓' : '✗'}`} color={diversificadoMinimo ? 'success' : 'error'} size="small" />
                  <Chip label={concentradoDeMas ? '⚠ Muy concentrado' : '✓ Diversificado'} color={concentradoDeMas ? 'error' : 'success'} size="small" />
                </Stack>
              </Paper>
              <Button
                fullWidth
                variant="contained"
                color="info"
                size="large"
                disabled={!portafolioValido}
                onClick={() => { setStep(2); iniciarTrimestre(0); }}
              >
                {portafolioValido ? '¡Iniciar simulación! →' : 'Ajusta el portafolio primero'}
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantallas 2-4 — Trimestres de la simulación */}
        {step >= 2 && step <= 4 && eventoActual && (
          <Fade in>
            <Stack spacing={3}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h4" fontWeight={700}>Trimestre {trimestreActual + 1}/4</Typography>
                <Chip label={`Portafolio: $${valorPortafolio.toFixed(0)}`} color="info" />
              </Stack>
              <Paper sx={{ p: 2, borderRadius: 3, bgcolor: 'info.light', border: 2, borderColor: 'info.main' }}>
                <Typography variant="caption" fontWeight={700} color="info.dark">EVENTO DEL TRIMESTRE:</Typography>
                <Typography variant="body1" fontWeight={700} sx={{ mt: 0.5 }}>{eventoActual.desc}</Typography>
              </Paper>
              {!decisionTomada ? (
                <Stack spacing={2}>
                  <Typography variant="body2" fontWeight={700}>¿Qué decides hacer?</Typography>
                  {[
                    { key: 'mantener', label: 'Mantener — confío en mi estrategia', color: 'warning' as const },
                    { key: 'rebalancear', label: 'Rebalancear — ajustar distribución', color: 'info' as const },
                    { key: 'vender', label: 'Vender parte — reducir exposición', color: 'error' as const },
                  ].map((dec) => (
                    <Button
                      key={dec.key}
                      variant="outlined"
                      color={dec.color}
                      size="large"
                      onClick={() => tomarDecision(dec.key)}
                      sx={{ justifyContent: 'flex-start', textTransform: 'none', py: 1.5 }}
                    >
                      {dec.label}
                    </Button>
                  ))}
                </Stack>
              ) : (
                <Fade in>
                  <Stack spacing={2}>
                    <Paper sx={{ p: 2, borderRadius: 3, bgcolor: 'success.light', border: 1, borderColor: 'success.main' }}>
                      <Typography variant="body2" fontWeight={700}>Decisión: {decisionTomada}</Typography>
                      <Typography variant="h5" fontWeight={900} color="success.dark">
                        Portafolio: ${valorPortafolio.toFixed(0)}
                      </Typography>
                      <Typography variant="caption" color={valorPortafolio > capitalInicial ? 'success.main' : 'error.main'}>
                        {valorPortafolio > capitalInicial ? '📈' : '📉'} {((valorPortafolio - capitalInicial) / capitalInicial * 100).toFixed(1)}% vs capital inicial
                      </Typography>
                    </Paper>
                    <FinniMessage
                      variant="coach"
                      title="Evaluación de Finni"
                      message={
                        decisionTomada === 'mantener'
                          ? 'Mantuviste la calma. Eso es exactamente lo que hace un inversionista prudente.'
                          : decisionTomada === 'rebalancear'
                            ? 'Rebalancear con criterio es una estrategia válida. Lo importante es que fue una decisión informada.'
                            : 'Vender por pánico suele ser la peor decisión. Pero a veces proteger el capital es válido — depende del contexto.'
                      }
                    />
                    <Button
                      fullWidth
                      variant="contained"
                      color="info"
                      size="large"
                      onClick={() => {
                        if (trimestreActual < 3) {
                          avanzarTrimestre();
                          setStep(step < 4 ? step + 1 : 4);
                        } else {
                          setSimulacionCompleta(true);
                          setStep(5);
                        }
                      }}
                    >
                      {trimestreActual < 3 ? `Avanzar a trimestre ${trimestreActual + 2} →` : 'Ver resultados finales →'}
                    </Button>
                  </Stack>
                </Fade>
              )}
              {/* Historial */}
              {historial.length > 0 && (
                <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                  <Typography variant="caption" fontWeight={700}>Historial:</Typography>
                  {historial.map((h) => (
                    <Stack key={h.trimestre} direction="row" justifyContent="space-between" sx={{ py: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="caption">T{h.trimestre}: {h.decision}</Typography>
                      <Typography variant="caption" fontWeight={700}>${h.valorPortafolio.toFixed(0)}</Typography>
                    </Stack>
                  ))}
                </FECard>
              )}
            </Stack>
          </Fade>
        )}

        {/* Pantalla 5 — Resultados finales */}
        {step === 5 && simulacionCompleta && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="h4" fontWeight={700}>Resultados de los 12 meses</Typography>
              <Paper
                sx={{
                  p: 3, borderRadius: 3, textAlign: 'center',
                  bgcolor: superoInflacion ? 'success.light' : 'warning.light',
                  border: 3,
                  borderColor: superoInflacion ? 'success.main' : 'warning.main',
                }}
              >
                <Typography variant="h2">{superoInflacion ? '🏆' : '📊'}</Typography>
                <Typography variant="h4" fontWeight={900} sx={{ mt: 1 }}>
                  ${valorPortafolio.toFixed(0)}
                </Typography>
                <Typography variant="body1">
                  Rendimiento: <b>{rendimientoFinal.toFixed(2)}%</b> en 12 meses
                </Typography>
                <Chip
                  label={superoInflacion ? `✅ Superaste la inflación (${(INFLACION_SIM * 100).toFixed(0)}%)` : `⚠️ No superaste la inflación (${(INFLACION_SIM * 100).toFixed(0)}%)`}
                  color={superoInflacion ? 'success' : 'warning'}
                  sx={{ mt: 1 }}
                />
              </Paper>
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography fontWeight={700} sx={{ mb: 1 }}>Análisis de tus 3 decisiones trimestrales:</Typography>
                {historial.map((h) => (
                  <Stack key={h.trimestre} sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" fontWeight={700}>T{h.trimestre}: {h.evento}</Typography>
                    <Typography variant="body2">Decisión: <b>{h.decision}</b> → Portafolio: ${h.valorPortafolio.toFixed(0)}</Typography>
                  </Stack>
                ))}
              </FECard>
              <FinniMessage
                variant="coach"
                title="Áreas de mejora"
                message={
                  superoInflacion
                    ? 'Tomaste buenas decisiones bajo presión. Ahora aplica esto en el mundo real.'
                    : 'No superaste la inflación esta vez — pero identificaste los errores. Eso ya es un gran avance.'
                }
              />
              <Button
                fullWidth
                variant="contained"
                color="info"
                size="large"
                onClick={() => void handleDesbloquear()}
                disabled={badgeDesbloqueado}
              >
                🏆 Desbloquear badge "Inversionista Prudente 📈"
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 6 — Badge + Cierre épico de FinEmpoder */}
        {step === 6 && badgeDesbloqueado && (
          <Fade in>
            <Stack spacing={3}>
              {/* Los 3 badges juntos */}
              <FECard variant="flat" sx={{ textAlign: 'center', py: 4, bgcolor: 'warning.light', border: 3, borderColor: 'warning.main' }}>
                <Stack direction="row" justifyContent="center" spacing={2} sx={{ mb: 2 }}>
                  {BADGES_PROGRAMA.map((badge) => (
                    <Box key={badge.nombre} textAlign="center">
                      <Typography variant="h3">{badge.emoji}</Typography>
                      <Typography variant="caption" fontWeight={700} display="block">{badge.nombre}</Typography>
                      <Typography variant="caption" color="text.secondary">{badge.modulo}</Typography>
                    </Box>
                  ))}
                </Stack>
                <EmojiEventsIcon sx={{ fontSize: 56, color: 'warning.main', mb: 1 }} />
                <Typography variant="h4" fontWeight={800}>Inversionista Prudente 📈</Typography>
                <Typography variant="body2" color="text.secondary">Badge desbloqueado · Módulo 3 completado</Typography>
              </FECard>

              {/* Mensaje final de Finni */}
              <FECard variant="flat" sx={{ bgcolor: 'success.light', border: 2, borderColor: 'success.main', textAlign: 'center', py: 3 }}>
                <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
                  ¡{userName ? `${userName}, l` : 'L'}o lograste! 🎉
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5 }}>
                  Completaste los 3 módulos de FinEmpoder.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <b>Presupuestación</b>, <b>Ahorro</b>, <b>Inversión</b> — las tres bases de una vida financiera sólida.
                </Typography>
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                  "Pero el verdadero aprendizaje comienza ahora, cuando apliques esto en tu vida real.
                  Cada decisión financiera que tomes a partir de hoy será diferente. Más consciente. Más tuya."
                </Typography>
              </FECard>

              {/* Estadísticas del programa */}
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography fontWeight={700} sx={{ mb: 1.5 }}>Estadísticas del programa completo:</Typography>
                <Stack spacing={0.75}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Lecciones completadas</Typography>
                    <Typography variant="body2" fontWeight={700}>45 lecciones (3 módulos)</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Badges desbloqueados</Typography>
                    <Typography variant="body2" fontWeight={700}>💰 🌱 📈 (3/3)</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Rendimiento en simulador</Typography>
                    <Typography variant="body2" fontWeight={700} color={rendimientoFinal >= 0 ? 'success.main' : 'error.main'}>
                      {rendimientoFinal >= 0 ? '+' : ''}{rendimientoFinal.toFixed(2)}%
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Inflación superada</Typography>
                    <Typography variant="body2" fontWeight={700} color={superoInflacion ? 'success.main' : 'warning.main'}>
                      {superoInflacion ? 'Sí ✅' : 'No — sigue practicando'}
                    </Typography>
                  </Stack>
                </Stack>
              </FECard>

              {/* Recursos para continuar */}
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography fontWeight={700} sx={{ mb: 1 }}>Recursos para continuar aprendiendo:</Typography>
                <Stack spacing={1}>
                  {RECURSOS.map((r) => (
                    <Stack key={r.nombre} direction="row" spacing={1.5} alignItems="flex-start">
                      <Box sx={{ flex: 1 }}>
                        <Link
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                          color="warning.main"
                          fontWeight={700}
                          variant="body2"
                        >
                          {r.nombre}
                        </Link>
                        <Typography variant="caption" display="block" color="text.secondary">{r.desc}</Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </FECard>

              <Paper sx={{ p: 2, borderRadius: 3, bgcolor: 'info.light', textAlign: 'center' }}>
                <Typography variant="body2" fontWeight={800} sx={{ mb: 0.5 }}>
                  "Gracias por confiar en FinEmpoder."
                </Typography>
                <Typography variant="body2" fontStyle="italic">
                  "Ahora ve y haz que tu dinero trabaje para ti."
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  — Finni 🤖
                </Typography>
              </Paper>
            </Stack>
          </Fade>
        )}
      </Box>
    </LessonShell>
  );
}
