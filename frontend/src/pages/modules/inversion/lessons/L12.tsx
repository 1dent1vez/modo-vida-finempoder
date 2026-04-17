import { useState } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade,
  TextField, Paper, Chip,
} from '@mui/material';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';

// Dato referencial INEGI 2024
const INFLACION_MEXICO_2024 = 4.66;

const HISTORICO = [
  { año: '2020', cetes: 4.5, inflacion: 3.15 },
  { año: '2021', cetes: 4.4, inflacion: 7.36 },
  { año: '2022', cetes: 9.5, inflacion: 8.7 },
  { año: '2023', cetes: 11.2, inflacion: 4.66 },
  { año: '2024', cetes: 10.0, inflacion: 4.66 },
];

export default function L12() {
  const [step, setStep] = useState(0);
  const [rendimientoUsuario, setRendimientoUsuario] = useState(10);
  const [inflacionUsuario, setInflacionUsuario] = useState(INFLACION_MEXICO_2024);
  const [montoCalc, setMontoCalc] = useState(10000);
  const [calculado, setCalculado] = useState(false);

  const rendimientoReal = rendimientoUsuario - inflacionUsuario;
  const gananciaNominal = montoCalc * (rendimientoUsuario / 100);
  const gananciaReal = montoCalc * (rendimientoReal / 100);

  const escenario = rendimientoReal > 0 ? 'positivo' : rendimientoReal === 0 ? 'empate' : 'negativo';

  return (
    <LessonShell
      id="L12"
      title="Inflación: el enemigo silencioso del rendimiento"
      completion={{ ready: calculado }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={(step / 2) * 100}
          color="info"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {/* Pantalla 0 — Concepto de inflación */}
        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FECard variant="flat" sx={{ bgcolor: 'error.light', border: 2, borderColor: 'error.main', textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={800}>⚠️ Situación real</Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  Tu inversión ganó el 5% este año. ¡Genial! Pero la inflación fue del 5.5%.
                </Typography>
                <Typography variant="body1" fontWeight={800} color="error.main" sx={{ mt: 0.5 }}>
                  Felicidades: perdiste poder adquisitivo aunque ganaste dinero.
                </Typography>
                <Typography variant="caption" color="text.secondary">Eso se llama rendimiento real negativo.</Typography>
              </FECard>
              <FinniMessage
                variant="coach"
                title="La inflación es el enemigo silencioso"
                message="La inflación es el aumento general de precios. Si la inflación es del 5%, lo que hoy cuesta $100 costará $105 el año que viene."
              />
              <FECard variant="flat" sx={{ bgcolor: 'warning.light', border: 1, borderColor: 'warning.main' }}>
                <Typography fontWeight={800} sx={{ mb: 1 }}>Fórmula simple (aproximada):</Typography>
                <Typography variant="h6" fontWeight={900} color="warning.dark">
                  Rendimiento real = Rendimiento nominal − Inflación
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Ejemplo: inversión al 7% con inflación del 5% = Rendimiento real del <b>2%</b>
                </Typography>
              </FECard>
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography fontWeight={700} sx={{ mb: 1 }}>Poder adquisitivo: el impacto visual</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Ejemplo con $10,000 y un año con inflación 5.5%:
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Paper sx={{ p: 1.5, borderRadius: 2, flex: 1, bgcolor: 'grey.100' }}>
                    <Typography variant="caption" color="text.secondary">Sin invertir</Typography>
                    <Typography variant="h6" fontWeight={800}>$10,000</Typography>
                    <Typography variant="caption" color="error.main">Compra lo que antes compraban $9,479</Typography>
                  </Paper>
                  <Paper sx={{ p: 1.5, borderRadius: 2, flex: 1, bgcolor: 'success.light' }}>
                    <Typography variant="caption" color="text.secondary">Al 5% anual</Typography>
                    <Typography variant="h6" fontWeight={800}>$10,500</Typography>
                    <Typography variant="caption" color="error.main">Poder real: $9,953 (aún pierdes un poco)</Typography>
                  </Paper>
                </Stack>
              </FECard>
              <FECard variant="flat" sx={{ border: 1, borderColor: 'info.main', bgcolor: 'info.light' }}>
                <Typography variant="body2" fontWeight={700}>El INPC (Índice Nacional de Precios al Consumidor)</Typography>
                <Typography variant="body2">
                  Mide la inflación en México. Puedes consultarlo en INEGI.gob.mx. Dato actual referencial: <b>{INFLACION_MEXICO_2024}%</b>
                </Typography>
              </FECard>
              <Button fullWidth variant="contained" color="info" size="large" onClick={() => setStep(1)}>
                Calculadora y datos históricos →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 1 — Calculadora + histórico */}
        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="h4" fontWeight={700}>Calculadora de rendimiento real</Typography>
              <Stack spacing={2}>
                <TextField
                  label="Rendimiento de mi inversión (%)"
                  type="number"
                  value={rendimientoUsuario}
                  onChange={(e) => setRendimientoUsuario(Number(e.target.value))}
                  size="small"
                  inputProps={{ step: 0.5 }}
                />
                <TextField
                  label={`Inflación actual de México (% INEGI — referencia: ${INFLACION_MEXICO_2024}%)`}
                  type="number"
                  value={inflacionUsuario}
                  onChange={(e) => setInflacionUsuario(Number(e.target.value))}
                  size="small"
                  inputProps={{ step: 0.1 }}
                />
                <TextField
                  label="Monto de inversión ($)"
                  type="number"
                  value={montoCalc}
                  onChange={(e) => setMontoCalc(Math.max(0, Number(e.target.value)))}
                  size="small"
                  inputProps={{ min: 0, step: 1000 }}
                />
              </Stack>
              <Paper
                sx={{
                  p: 2, borderRadius: 3,
                  bgcolor: escenario === 'positivo' ? 'success.light' : escenario === 'negativo' ? 'error.light' : 'warning.light',
                  border: 2,
                  borderColor: escenario === 'positivo' ? 'success.main' : escenario === 'negativo' ? 'error.main' : 'warning.main',
                }}
              >
                <Typography variant="body2">Rendimiento real:</Typography>
                <Typography variant="h4" fontWeight={900}>
                  {rendimientoReal >= 0 ? '+' : ''}{rendimientoReal.toFixed(2)}%
                </Typography>
                <Chip
                  label={escenario === 'positivo' ? '✅ Ganas en términos reales' : escenario === 'negativo' ? '❌ Pérdida real de poder adquisitivo' : '⚠️ Empate — ni ganas ni pierdes'}
                  color={escenario === 'positivo' ? 'success' : escenario === 'negativo' ? 'error' : 'warning'}
                  sx={{ mt: 1 }}
                />
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Ganancia nominal</Typography>
                    <Typography variant="body2" fontWeight={700}>${gananciaNominal.toFixed(0)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Ganancia real</Typography>
                    <Typography variant="body2" fontWeight={700} color={gananciaReal >= 0 ? 'success.main' : 'error.main'}>
                      {gananciaReal >= 0 ? '+' : ''}${gananciaReal.toFixed(0)}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              <Typography variant="h5" fontWeight={700}>Histórico: CETES vs Inflación en México</Typography>
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                {HISTORICO.map((dato) => {
                  const real = dato.cetes - dato.inflacion;
                  return (
                    <Stack key={dato.año} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="body2" fontWeight={700}>{dato.año}</Typography>
                      <Typography variant="caption">CETES: {dato.cetes}%</Typography>
                      <Typography variant="caption">Inflación: {dato.inflacion}%</Typography>
                      <Chip size="small" label={`Real: ${real >= 0 ? '+' : ''}${real.toFixed(1)}%`} color={real >= 0 ? 'success' : 'error'} />
                    </Stack>
                  );
                })}
              </FECard>

              <FinniMessage
                variant="coach"
                title="Ahora cuando veas un rendimiento, la primera pregunta es:"
                message={`¿Es mayor que la inflación actual (${INFLACION_MEXICO_2024}%)? Si no lo supera, en términos reales estás perdiendo poder adquisitivo.`}
              />
              {!calculado && (
                <Button fullWidth variant="contained" color="info" size="large" onClick={() => setCalculado(true)}>
                  ✅ Confirmar cálculo personal
                </Button>
              )}
              {calculado && (
                <Fade in>
                  <FECard variant="flat" sx={{ bgcolor: 'success.light', border: 2, borderColor: 'success.main', textAlign: 'center' }}>
                    <Typography variant="h3">📊</Typography>
                    <Typography fontWeight={800}>¡Calculadora completada!</Typography>
                    <Typography variant="body2">
                      Tu rendimiento real es del {rendimientoReal.toFixed(2)}%.{' '}
                      {escenario === 'positivo' ? 'Estás ganando en términos reales.' : '¡Busca inversiones que superen la inflación!'}
                    </Typography>
                  </FECard>
                </Fade>
              )}
            </Stack>
          </Fade>
        )}
      </Box>
    </LessonShell>
  );
}
