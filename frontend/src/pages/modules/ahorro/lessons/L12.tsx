import { useState, useEffect, useMemo } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade, Chip, TextField, Slider,
} from '@mui/material';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

type MetaData = { nombre?: string; monto?: number; aportacionMensual?: number } | null;

const TASAS = [
  { label: 'Cuenta ahorro basica', value: 3 },
  { label: 'CETES', value: 8 },
  { label: 'Fondos de inversion', value: 10 },
  { label: 'Acciones (estimado)', value: 15 },
];

function calcCompuesto(capital: number, mensual: number, tasaAnual: number, anos: number): number {
  const r = tasaAnual / 100 / 12;
  const n = anos * 12;
  if (r === 0) return capital + mensual * n;
  return capital * Math.pow(1 + r, n) + mensual * ((Math.pow(1 + r, n) - 1) / r);
}

function calcSimple(capital: number, mensual: number, tasaAnual: number, anos: number): number {
  return capital * (1 + tasaAnual / 100 * anos) + mensual * anos * 12;
}

export default function L12() {
  const [step, setStep] = useState(0);
  const [metaData, setMetaData] = useState<MetaData>(null);
  const [capital, setCapital] = useState(1000);
  const [aportMensual, setAportMensual] = useState(200);
  const [tasaIdx, setTasaIdx] = useState(1);
  const [anos, setAnos] = useState(5);
  const [used, setUsed] = useState(false);

  useEffect(() => {
    const load = async () => {
      const meta = await lessonDataRepository.load<MetaData>('ahorro', 'l5_meta');
      setMetaData(meta);
    };
    void load();
  }, []);

  const tasa = TASAS[tasaIdx]?.value ?? 8;

  const resultado1 = useMemo(() => calcCompuesto(capital, aportMensual, tasa, 1), [capital, aportMensual, tasa]);
  const resultado3 = useMemo(() => calcCompuesto(capital, aportMensual, tasa, 3), [capital, aportMensual, tasa]);
  const resultado5 = useMemo(() => calcCompuesto(capital, aportMensual, tasa, anos), [capital, aportMensual, tasa, anos]);

  const simple5 = useMemo(() => calcSimple(capital, aportMensual, tasa, anos), [capital, aportMensual, tasa, anos]);

  // Meses para alcanzar la meta
  const mesesMeta = useMemo(() => {
    if (!metaData?.monto || metaData.monto <= capital) return null;
    const r = tasa / 100 / 12;
    if (r === 0) return Math.ceil((metaData.monto - capital) / aportMensual);
    let n = 0;
    let total = capital;
    while (total < metaData.monto && n < 600) {
      total = total * (1 + r) + aportMensual;
      n++;
    }
    return n;
  }, [metaData, capital, aportMensual, tasa]);

  const progress = step === 0 ? 0 : step === 1 ? 33 : step === 2 ? 66 : 100;

  return (
    <LessonShell
      id="L12"
      title="El dinero que se multiplica: interes compuesto"
      completion={{ ready: used }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          color="success"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {/* Pantalla 0 — Explicacion visual */}
        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="coach"
                title="La octava maravilla del mundo"
                message='Einstein dijo que el interes compuesto es la octava maravilla del mundo. Quien lo entiende, lo gana. Quien no, lo paga.'
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>Interes simple:</Typography>
                <Typography variant="body2">Ganas interes solo sobre tu capital original.</Typography>
                <Typography variant="caption" color="text.secondary">$1,000 al 5% anual = $50 al año, siempre.</Typography>
              </FECard>
              <FECard variant="flat" sx={{ border: 2, borderColor: 'success.main', bgcolor: 'success.light' }}>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>Interes compuesto:</Typography>
                <Typography variant="body2">Ganas interes sobre tu capital MAS los intereses anteriores.</Typography>
                <Stack spacing={0.5} sx={{ mt: 1 }}>
                  <Typography variant="caption">Año 1: $1,000 → +$50 → total <b>$1,050</b></Typography>
                  <Typography variant="caption">Año 2: $1,050 → +$52.50 → total <b>$1,102.50</b></Typography>
                  <Typography variant="caption">Año 3: $1,102.50 → +$55.13 → total <b>$1,157.63</b></Typography>
                </Stack>
              </FECard>

              {/* Comparacion animada: mismos parametros */}
              <FECard variant="flat" sx={{ border: 1, borderColor: 'info.main' }}>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>$1,000 al 5% — comparacion:</Typography>
                <Stack spacing={1}>
                  {[1, 5, 10].map((yr) => {
                    const comp = calcCompuesto(1000, 0, 5, yr);
                    const simp = calcSimple(1000, 0, 5, yr);
                    return (
                      <Stack key={yr} direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption">{yr} {yr === 1 ? 'año' : 'años'}:</Typography>
                        <Stack direction="row" spacing={1}>
                          <Chip label={`Simple $${simp.toFixed(0)}`} size="small" color="warning" variant="outlined" />
                          <Chip label={`Compuesto $${comp.toFixed(0)}`} size="small" color="success" />
                        </Stack>
                      </Stack>
                    );
                  })}
                </Stack>
              </FECard>

              <FinniMessage
                variant="coach"
                title="El ingrediente secreto es el tiempo"
                message="Entre mas pronto empieces, mas trabaja el compuesto por ti."
              />
              <Button fullWidth variant="contained" color="success" size="large" onClick={() => setStep(1)}>
                Usar el simulador →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 1 — Simulador */}
        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="body1" fontWeight={700}>Simulador de interes compuesto:</Typography>

              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption">Capital inicial: <b>${capital.toLocaleString()}</b></Typography>
                    <Slider value={capital} onChange={(_, v) => { setCapital(v as number); setUsed(true); }}
                      min={0} max={50000} step={500} color="success" />
                  </Box>
                  <Box>
                    <Typography variant="caption">Aportacion mensual: <b>${aportMensual.toLocaleString()}</b></Typography>
                    <Slider value={aportMensual} onChange={(_, v) => { setAportMensual(v as number); setUsed(true); }}
                      min={0} max={5000} step={100} color="success" />
                  </Box>
                  <Box>
                    <Typography variant="caption">Plazo: <b>{anos} {anos === 1 ? 'año' : 'años'}</b></Typography>
                    <Slider value={anos} onChange={(_, v) => { setAnos(v as number); setUsed(true); }}
                      min={1} max={20} step={1} color="success" />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ mb: 0.5 }}>Tasa de rendimiento:</Typography>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap">
                      {TASAS.map((t, i) => (
                        <Chip key={i} label={`${t.value}% — ${t.label}`} size="small"
                          color={tasaIdx === i ? 'success' : 'default'}
                          onClick={() => { setTasaIdx(i); setUsed(true); }}
                          sx={{ cursor: 'pointer', mb: 0.5 }}
                        />
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              </FECard>

              {/* Resultados */}
              <FECard variant="flat" sx={{ border: 2, borderColor: 'success.main', bgcolor: 'success.light' }}>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>Con interes compuesto al {tasa}%:</Typography>
                <Stack spacing={0.75}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">1 año:</Typography>
                    <Typography variant="body2" fontWeight={700}>${resultado1.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">3 años:</Typography>
                    <Typography variant="body2" fontWeight={700}>${resultado3.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">{anos} años:</Typography>
                    <Typography variant="body2" fontWeight={700} color="success.dark">${resultado5.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</Typography>
                  </Stack>
                </Stack>
                <Stack direction="row" justifyContent="space-between" sx={{ mt: 1.5, pt: 1, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary">Vs interes simple ({anos}a):</Typography>
                  <Typography variant="caption">${simple5.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</Typography>
                </Stack>
                <Typography variant="caption" color="success.dark">
                  Diferencia: +${(resultado5 - simple5).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} solo por el compuesto
                </Typography>
              </FECard>

              {metaData?.nombre && mesesMeta !== null && (
                <Fade in>
                  <FECard variant="flat" sx={{ border: 1, borderColor: 'info.main', bgcolor: 'info.light' }}>
                    <Typography variant="body2">
                      Con {tasa}% de rendimiento, alcanzas tu meta de "{metaData.nombre}" (${metaData.monto?.toLocaleString()}) en <b>~{mesesMeta} meses</b>.
                    </Typography>
                  </FECard>
                </Fade>
              )}

              {used && (
                <Fade in>
                  <Button fullWidth variant="contained" color="success" size="large" onClick={() => setStep(2)}>
                    Ver el cierre →
                  </Button>
                </Fade>
              )}
            </Stack>
          </Fade>
        )}

        {/* Pantalla 2 — Cierre */}
        {step === 2 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="success"
                title="El mejor momento para empezar fue ayer"
                message="El segundo mejor momento es hoy. Con los numeros que ves, cada mes que pasa sin empezar es dinero que no trabajara para ti."
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'success.main', bgcolor: 'success.light', textAlign: 'center', py: 2 }}>
                <Typography variant="h4">Tu simulacion:</Typography>
                <Typography variant="body1">
                  ${capital.toLocaleString()} capital + ${aportMensual.toLocaleString()}/mes al {tasa}% durante {anos} años
                </Typography>
                <Typography variant="h4" color="success.dark" sx={{ mt: 1 }}>
                  = ${resultado5.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                </Typography>
              </FECard>
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <TextField
                  label="Capital inicial"
                  size="small"
                  type="number"
                  value={capital}
                  onChange={(e) => setCapital(Number(e.target.value))}
                  inputProps={{ min: 0 }}
                  fullWidth
                  sx={{ mb: 1 }}
                />
                <Typography variant="caption" color="text.secondary">
                  Ajusta para explorar diferentes escenarios
                </Typography>
              </FECard>
            </Stack>
          </Fade>
        )}
      </Box>
    </LessonShell>
  );
}
