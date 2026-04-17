import { useState } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade,
  TextField, Paper, Chip,
} from '@mui/material';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';

const TIPOS_COMISION = [
  { tipo: 'Por administración', desc: 'Cobro anual del fondo por gestionar tu dinero.', ejemplo: '2% anual' },
  { tipo: 'Por compra/venta', desc: 'Al entrar o salir de algunos fondos.', ejemplo: '1% de entrada' },
  { tipo: 'Por custodia', desc: 'En algunos brokers por mantener tus acciones.', ejemplo: '0.5% anual' },
  { tipo: 'Spread', desc: 'Diferencia entre precio de compra y venta en divisas y algunos instrumentos.', ejemplo: 'Variable' },
];

const FONDOS_FICTICIOS = [
  { nombre: 'Fondo A', rendimientoBruto: 10, comision: 0.5 },
  { nombre: 'Fondo B', rendimientoBruto: 10, comision: 2.0 },
  { nombre: 'Fondo C', rendimientoBruto: 10, comision: 3.5 },
];

const ISR_RETENCION = 0.15;

function calcRendimientoNeto(bruto: number, comision: number, isr: number): number {
  const despuesComision = bruto - comision;
  const impuesto = despuesComision * (isr / 100);
  return despuesComision - impuesto;
}

function calcCrecimiento(monto: number, tasa: number, anios: number): number {
  return monto * Math.pow(1 + tasa / 100, anios);
}

export default function L11() {
  const [step, setStep] = useState(0);
  const [monto, setMonto] = useState(10000);
  const [rendimientoBruto, setRendimientoBruto] = useState(10);
  const [comisionAdmin, setComisionAdmin] = useState(2);
  const [plazo, setPlazo] = useState(5);
  const [calculado, setCalculado] = useState(false);
  const [simulacroHecho, setSimulacroHecho] = useState(false);
  const [respuestaSimulacro, setRespuestaSimulacro] = useState<string[]>(['', '', '']);

  const rendiNeto = calcRendimientoNeto(rendimientoBruto, comisionAdmin, ISR_RETENCION);
  const crecimientoBruto = calcCrecimiento(monto, rendimientoBruto, plazo);
  const crecimientoNeto = calcCrecimiento(monto, rendiNeto, plazo);
  const diferencia = crecimientoBruto - crecimientoNeto;

  const simulacroListo = respuestaSimulacro.every((r) => r.trim().length >= 3);

  return (
    <LessonShell
      id="L11"
      title="Las comisiones se comen tus ganancias: cómo detectarlas"
      completion={{ ready: calculado && simulacroHecho }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={(step / 2) * 100}
          color="info"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {/* Pantalla 0 — Tipos de comisiones + ISR */}
        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="coach"
                title="El rendimiento que anuncian no es lo que recibes"
                message='Te dijeron que el fondo tiene un rendimiento del 10% anual. ¡Genial! Pero nadie te mencionó las comisiones. Al final del año, puede que solo hayas ganado el 6%. Hoy aprendemos a leer la letra chica.'
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography fontWeight={700} sx={{ mb: 1.5 }}>Tipos de comisiones</Typography>
                <Stack spacing={1.5}>
                  {TIPOS_COMISION.map((c) => (
                    <Stack key={c.tipo} direction="row" justifyContent="space-between" sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={700}>{c.tipo}</Typography>
                        <Typography variant="caption" color="text.secondary">{c.desc}</Typography>
                      </Box>
                      <Chip size="small" label={c.ejemplo} color="info" variant="outlined" />
                    </Stack>
                  ))}
                </Stack>
              </FECard>
              <FECard variant="flat" sx={{ bgcolor: 'info.light', border: 1, borderColor: 'info.main' }}>
                <Typography fontWeight={700} sx={{ mb: 0.5 }}>ISR (Impuesto sobre Rendimientos)</Typography>
                <Typography variant="body2">
                  Los rendimientos de inversiones en México pagan ISR. En CETES es automático
                  (retención de ~0.15% en 2024 — ya viene descontado). En acciones, debes declarar.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                  "No es para asustarte. Es para que tus cálculos sean realistas desde el principio."
                </Typography>
              </FECard>
              <FinniMessage
                variant="coach"
                title="Ninguna comisión es mala per se"
                message="Lo malo es no saberla antes de invertir. Siempre pregunta: ¿cuál es el costo total anual de esta inversión?"
              />
              <Button fullWidth variant="contained" color="info" size="large" onClick={() => setStep(1)}>
                Calculadora de comisiones →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 1 — Calculadora + comparador + simulacro */}
        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="h4" fontWeight={700}>Calculadora de rendimiento neto</Typography>
              <Stack spacing={2}>
                <TextField
                  label="Monto de inversión ($)"
                  type="number"
                  value={monto}
                  onChange={(e) => setMonto(Math.max(0, Number(e.target.value)))}
                  size="small"
                  inputProps={{ min: 0, step: 1000 }}
                />
                <TextField
                  label="Rendimiento bruto anunciado (%)"
                  type="number"
                  value={rendimientoBruto}
                  onChange={(e) => setRendimientoBruto(Math.max(0, Math.min(50, Number(e.target.value))))}
                  size="small"
                  inputProps={{ min: 0, max: 50, step: 0.5 }}
                />
                <TextField
                  label="Comisión de administración anual (%)"
                  type="number"
                  value={comisionAdmin}
                  onChange={(e) => setComisionAdmin(Math.max(0, Math.min(10, Number(e.target.value))))}
                  size="small"
                  inputProps={{ min: 0, max: 10, step: 0.5 }}
                />
                <TextField
                  label="Plazo (años)"
                  type="number"
                  value={plazo}
                  onChange={(e) => setPlazo(Math.max(1, Math.min(30, Number(e.target.value))))}
                  size="small"
                  inputProps={{ min: 1, max: 30, step: 1 }}
                />
              </Stack>
              <Stack direction="row" spacing={2}>
                <Paper sx={{ p: 2, borderRadius: 2, flex: 1, bgcolor: 'grey.100' }}>
                  <Typography variant="caption" color="text.secondary">Rendimiento bruto</Typography>
                  <Typography variant="h6" fontWeight={800}>{rendimientoBruto}%</Typography>
                  <Typography variant="caption">Recibirías: ${crecimientoBruto.toFixed(0)}</Typography>
                </Paper>
                <Paper sx={{ p: 2, borderRadius: 2, flex: 1, bgcolor: 'success.light', border: 1, borderColor: 'success.main' }}>
                  <Typography variant="caption" color="text.secondary">Rendimiento neto real</Typography>
                  <Typography variant="h6" fontWeight={800} color="success.dark">{rendiNeto.toFixed(2)}%</Typography>
                  <Typography variant="caption">Recibirías: ${crecimientoNeto.toFixed(0)}</Typography>
                </Paper>
              </Stack>
              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'error.light', border: 1, borderColor: 'error.main' }}>
                <Typography variant="caption" fontWeight={700} color="error.dark">Impacto de comisiones en {plazo} años:</Typography>
                <Typography variant="h5" fontWeight={900} color="error.dark">-${diferencia.toFixed(0)}</Typography>
                <Typography variant="caption">Eso es real. Las comisiones importan.</Typography>
              </Paper>
              {!calculado && (
                <Button fullWidth variant="contained" color="info" onClick={() => setCalculado(true)}>
                  ✅ Confirmar cálculo
                </Button>
              )}

              {calculado && (
                <Fade in>
                  <Stack spacing={3}>
                    <Typography variant="h5" fontWeight={700}>Comparador: 3 fondos, mismo rendimiento bruto</Typography>
                    <Stack spacing={1.5}>
                      {FONDOS_FICTICIOS.map((f) => {
                        const neto = calcRendimientoNeto(f.rendimientoBruto, f.comision, ISR_RETENCION);
                        return (
                          <Paper key={f.nombre} sx={{ p: 2, borderRadius: 2 }}>
                            <Stack direction="row" justifyContent="space-between">
                              <Box>
                                <Typography fontWeight={700}>{f.nombre}</Typography>
                                <Typography variant="caption" color="text.secondary">Bruto: {f.rendimientoBruto}% · Comisión: {f.comision}%</Typography>
                              </Box>
                              <Chip label={`Neto: ${neto.toFixed(2)}%`} color={f.comision <= 1 ? 'success' : f.comision <= 2 ? 'warning' : 'error'} />
                            </Stack>
                          </Paper>
                        );
                      })}
                    </Stack>

                    <Typography variant="h5" fontWeight={700}>Simulacro: las 3 preguntas clave</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Practica formulando las preguntas que siempre debes hacer antes de invertir:
                    </Typography>
                    {[
                      'Escribe cómo preguntarías: "¿Cuál es el rendimiento bruto?"',
                      'Escribe cómo preguntarías: "¿Cuáles son las comisiones totales?"',
                      'Escribe cómo preguntarías: "¿Cuánto ISR se retiene?"',
                    ].map((pregunta, i) => (
                      <FECard key={i} variant="flat" sx={{ border: 1, borderColor: respuestaSimulacro[i].trim().length >= 3 ? 'success.main' : 'divider' }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>{pregunta}</Typography>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Tu pregunta al asesor..."
                          value={respuestaSimulacro[i]}
                          onChange={(e) => setRespuestaSimulacro((prev) => prev.map((r, idx) => idx === i ? e.target.value : r))}
                        />
                      </FECard>
                    ))}
                    {simulacroListo && !simulacroHecho && (
                      <Fade in>
                        <Button fullWidth variant="contained" color="info" onClick={() => setSimulacroHecho(true)}>
                          ✅ Completar simulacro
                        </Button>
                      </Fade>
                    )}
                    {simulacroHecho && (
                      <Fade in>
                        <FinniMessage
                          variant="success"
                          title="¡Simulacro completado!"
                          message="Ahora sabes las 3 preguntas que siempre debes hacer antes de invertir. Ese hábito puede ahorrarte miles de pesos."
                        />
                      </Fade>
                    )}
                  </Stack>
                </Fade>
              )}
            </Stack>
          </Fade>
        )}
      </Box>
    </LessonShell>
  );
}
