import { useState } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade,
  TextField, Paper, Chip,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';

const FICHAS = [
  {
    nombre: 'CETES',
    frente: {
      plazo: '28, 91, 182 o 364 días',
      tasa: '~10% anual (referencial)',
      minimo: '$100 pesos',
      donde: 'cetesdirecto.com (sin intermediarios)',
      riesgo: '⭐⭐☆☆☆ — Muy bajo',
    },
    reverso: 'Desventajas: si retiras antes del plazo puedes perder algo del rendimiento. La tasa es fija — no se beneficia de alzas del mercado.',
  },
  {
    nombre: 'BONDES',
    frente: {
      plazo: '3-5 años',
      tasa: 'Variable (ligada a TIIE)',
      minimo: '$100 pesos',
      donde: 'cetesdirecto.com',
      riesgo: '⭐⭐☆☆☆ — Bajo',
    },
    reverso: 'Tasa variable significa que puede subir o bajar con el mercado. Plazo largo — no ideal si necesitas liquidez pronto.',
  },
  {
    nombre: 'PRLV',
    frente: {
      plazo: 'Plazo fijo (días a meses)',
      tasa: 'Garantizada',
      minimo: 'Varía por banco',
      donde: 'Bancos comerciales',
      riesgo: '⭐⭐☆☆☆ — Bajo (IPAB)',
    },
    reverso: 'Ofrecidos por bancos, no directamente del gobierno. Protegidos por IPAB hasta 400,000 UDIS. Rendimientos algo menores que CETES.',
  },
];

const MONTOS_SIMULACION = [100, 500, 1000];
const PLAZOS = [28, 91];
const TASA_ANUAL = 0.10;

function calcRendimiento(monto: number, plazo: number): number {
  return monto * TASA_ANUAL * (plazo / 365);
}

export default function L06() {
  const [step, setStep] = useState(0);
  const [flipped, setFlipped] = useState<boolean[]>([false, false, false]);
  const [montoSim, setMontoSim] = useState<number | 'custom'>(100);
  const [customMonto, setCustomMonto] = useState(200);
  const [plazoSim, setPlazoSim] = useState(28);
  const [simulado, setSimulado] = useState(false);

  const allFlipped = flipped.every(Boolean);
  const montoReal = montoSim === 'custom' ? customMonto : montoSim;
  const rendimiento = calcRendimiento(montoReal, plazoSim);

  const flipCard = (i: number) => {
    setFlipped((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  };

  return (
    <LessonShell
      id="L06"
      title="CETES, BONDES y PRLV: la inversión del gobierno mexicano"
      completion={{ ready: simulado }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={(step / 3) * 100}
          color="info"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {/* Pantalla 0 — CETES en detalle */}
        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="coach"
                title="Puedes prestarle dinero al gobierno mexicano"
                message="¿Sabías que puedes prestarle dinero al gobierno mexicano y cobrarle intereses? Eso exactamente son los CETES. Y puedes empezar con $100."
              />
              <FECard variant="flat" sx={{ bgcolor: 'warning.light', border: 2, borderColor: 'warning.main' }}>
                <Typography fontWeight={800} sx={{ mb: 1.5 }}>CETES — Los datos que importan:</Typography>
                <Stack spacing={1}>
                  {[
                    { label: 'Plazos disponibles', valor: '28, 91, 182 o 364 días' },
                    { label: 'Dónde comprar', valor: 'cetesdirecto.com (sin comisiones)' },
                    { label: 'Monto mínimo', valor: '$100 pesos' },
                    { label: 'Riesgo', valor: 'Muy bajo — respaldado por el Banco de México' },
                    { label: 'Cómo funciona', valor: 'Le prestas dinero al gobierno por X días. Al vencer recibes tu dinero + intereses.' },
                  ].map((row) => (
                    <Stack key={row.label} direction="row" spacing={2} justifyContent="space-between" sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">{row.label}</Typography>
                      <Typography variant="caption" fontWeight={700} textAlign="right" sx={{ maxWidth: '60%' }}>{row.valor}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </FECard>
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography fontWeight={700} sx={{ mb: 1 }}>BONDES y PRLV (variantes)</Typography>
                <Stack spacing={1.5}>
                  <Box>
                    <Chip size="small" label="BONDES" color="info" sx={{ mb: 0.5 }} />
                    <Typography variant="body2">Similar a CETES pero a plazos más largos (3-5 años). Tasa variable ligada a TIIE.</Typography>
                  </Box>
                  <Box>
                    <Chip size="small" label="PRLV" color="success" sx={{ mb: 0.5 }} />
                    <Typography variant="body2">Ofrecidos por bancos. Plazo fijo, tasa garantizada, protegidos por IPAB.</Typography>
                  </Box>
                </Stack>
                <FinniMessage
                  variant="coach"
                  title="Para un primer acercamiento"
                  message="Los CETES son la puerta de entrada más segura y accesible. Empezar con ellos es la decisión correcta."
                />
              </FECard>
              <Button fullWidth variant="contained" color="info" size="large" onClick={() => setStep(1)}>
                Ver mini-fichas →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 1 — Mini-fichas flip */}
        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="h4" fontWeight={700}>Mini-fichas: toca para voltear</Typography>
              <Stack spacing={2}>
                {FICHAS.map((ficha, i) => (
                  <Paper
                    key={ficha.nombre}
                    onClick={() => flipCard(i)}
                    sx={{
                      p: 2, borderRadius: 3, cursor: 'pointer',
                      border: 2, borderColor: flipped[i] ? 'info.main' : 'warning.main',
                      bgcolor: flipped[i] ? 'info.light' : 'warning.light',
                      transition: 'all 0.3s',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography fontWeight={800}>{ficha.nombre}</Typography>
                      <Chip size="small" label={flipped[i] ? 'Desventajas' : 'Características'} color={flipped[i] ? 'info' : 'warning'} />
                    </Stack>
                    {!flipped[i] ? (
                      <Stack spacing={0.5}>
                        <Typography variant="caption"><b>Plazo:</b> {ficha.frente.plazo}</Typography>
                        <Typography variant="caption"><b>Tasa:</b> {ficha.frente.tasa}</Typography>
                        <Typography variant="caption"><b>Mínimo:</b> {ficha.frente.minimo}</Typography>
                        <Typography variant="caption"><b>Riesgo:</b> {ficha.frente.riesgo}</Typography>
                      </Stack>
                    ) : (
                      <Typography variant="body2">{ficha.reverso}</Typography>
                    )}
                  </Paper>
                ))}
              </Stack>
              {!allFlipped && (
                <Typography variant="caption" color="text.secondary" textAlign="center">
                  Voltea las 3 fichas para continuar
                </Typography>
              )}
              {allFlipped && (
                <Fade in>
                  <Button fullWidth variant="contained" color="info" size="large" onClick={() => setStep(2)}>
                    Simular compra de CETES →
                  </Button>
                </Fade>
              )}
            </Stack>
          </Fade>
        )}

        {/* Pantalla 2 — Simulación de compra + alerta fiscal */}
        {step === 2 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="h4" fontWeight={700}>Simulador de compra de CETES</Typography>
              <FECard variant="flat" sx={{ border: 1, borderColor: 'warning.main' }}>
                <Typography fontWeight={700} sx={{ mb: 1.5 }}>Paso 1: Elige tu monto</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                  {MONTOS_SIMULACION.map((m) => (
                    <Chip
                      key={m}
                      label={`$${m}`}
                      onClick={() => setMontoSim(m)}
                      variant={montoSim === m ? 'filled' : 'outlined'}
                      color={montoSim === m ? 'warning' : 'default'}
                    />
                  ))}
                  <Chip
                    label="Otro monto"
                    onClick={() => setMontoSim('custom')}
                    variant={montoSim === 'custom' ? 'filled' : 'outlined'}
                    color={montoSim === 'custom' ? 'warning' : 'default'}
                  />
                </Stack>
                {montoSim === 'custom' && (
                  <TextField
                    size="small"
                    type="number"
                    label="Monto (mín. $100)"
                    value={customMonto}
                    onChange={(e) => setCustomMonto(Math.max(100, Number(e.target.value)))}
                    inputProps={{ min: 100, step: 100 }}
                    sx={{ mb: 1 }}
                  />
                )}
                <Typography fontWeight={700} sx={{ mb: 1, mt: 1 }}>Paso 2: Elige el plazo</Typography>
                <Stack direction="row" spacing={1}>
                  {PLAZOS.map((p) => (
                    <Chip
                      key={p}
                      label={`${p} días`}
                      onClick={() => setPlazoSim(p)}
                      variant={plazoSim === p ? 'filled' : 'outlined'}
                      color={plazoSim === p ? 'warning' : 'default'}
                    />
                  ))}
                </Stack>
              </FECard>
              <FECard variant="flat" sx={{ bgcolor: 'success.light', border: 2, borderColor: 'success.main' }}>
                <Typography variant="body2">Paso 3: Tu rendimiento estimado</Typography>
                <Typography variant="caption" color="text.secondary">(Tasa referencial: {(TASA_ANUAL * 100).toFixed(1)}% anual)</Typography>
                <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Inviertes</Typography>
                    <Typography variant="h6" fontWeight={800}>${montoReal.toLocaleString()}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Ganas en {plazoSim} días</Typography>
                    <Typography variant="h6" fontWeight={800} color="success.dark">+${rendimiento.toFixed(2)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Recibes al vencimiento</Typography>
                    <Typography variant="h6" fontWeight={800}>${(montoReal + rendimiento).toFixed(2)}</Typography>
                  </Box>
                </Stack>
              </FECard>
              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.100' }}>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <InfoOutlinedIcon fontSize="small" color="action" sx={{ mt: 0.2 }} />
                  <Box>
                    <Typography variant="caption" fontWeight={700}>Alerta fiscal</Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Los rendimientos de CETES pagan ISR (retención automática ~0.15% en 2024). Ya viene descontado — sin sorpresas.
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
              <FinniMessage
                variant="coach"
                title="Puedes hacer tu primera inversión real con $100"
                message="Ve a cetesdirecto.com, crea tu cuenta (es gratis) y haz tu primera compra. Es más fácil de lo que parece."
              />
              {!simulado ? (
                <Button fullWidth variant="contained" color="info" size="large" onClick={() => setSimulado(true)}>
                  ✅ Confirmar compra virtual
                </Button>
              ) : (
                <Fade in>
                  <FECard variant="flat" sx={{ bgcolor: 'success.light', border: 2, borderColor: 'success.main', textAlign: 'center' }}>
                    <Typography variant="h2">🎉</Typography>
                    <Typography fontWeight={800}>¡Compra virtual completada!</Typography>
                    <Typography variant="body2">
                      Compraste ${montoReal} en CETES a {plazoSim} días. En el mercado real recibirías ${(montoReal + rendimiento).toFixed(2)}.
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
