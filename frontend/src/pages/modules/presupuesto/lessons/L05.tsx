import { useState, useEffect } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade,
  Slider, TextField,
} from '@mui/material';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

const EXAMPLES = [
  { label: '$1,500', amount: 1500 },
  { label: '$2,500', amount: 2500 },
  { label: '$3,000', amount: 3000 },
  { label: '$5,000', amount: 5000 },
];

export default function L05() {
  const [step, setStep] = useState(0);
  const [income, setIncome] = useState(2500);
  const [incomeText, setIncomeText] = useState('2500');
  const [necesidades, setNecesidades] = useState(50);
  const [deseos, setDeseos] = useState(30);
  const [ahorro, setAhorro] = useState(20);
  const [interacted, setInteracted] = useState(false);

  const total = necesidades + deseos + ahorro;
  const overBudget = total > 100;

  // How close to ideal 50-30-20
  const diff = Math.abs(necesidades - 50) + Math.abs(deseos - 30) + Math.abs(ahorro - 20);
  const score = Math.max(0, Math.round(100 - diff * 2));

  const montoNecesidades = Math.round((income * necesidades) / 100);
  const montoDeseos = Math.round((income * deseos) / 100);
  const montoAhorro = Math.round((income * ahorro) / 100);

  const handleNecesidades = (_: Event, val: number | number[]) => {
    const v = val as number;
    setNecesidades(v);
    const rem = 100 - v;
    const d = Math.min(deseos, rem);
    setDeseos(d);
    setAhorro(Math.max(0, rem - d));
    setInteracted(true);
  };

  const handleDeseos = (_: Event, val: number | number[]) => {
    const v = val as number;
    setDeseos(v);
    setAhorro(Math.max(0, 100 - necesidades - v));
    setInteracted(true);
  };

  const handleAhorro = (_: Event, val: number | number[]) => {
    setAhorro(val as number);
    setInteracted(true);
  };

  useEffect(() => {
    if (interacted) {
      void lessonDataRepository.save('presupuesto', 'l5_distribution', {
        income,
        necesidades,
        deseos,
        ahorro,
        score,
      });
    }
  }, [interacted, income, necesidades, deseos, ahorro, score]);

  const canComplete = interacted && !overBudget;

  return (
    <LessonShell
      id="L05"
      title="La regla 50-30-20: divide y vencerás"
      completion={{ ready: canComplete, score }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={step === 0 ? 0 : step === 1 ? 40 : 100}
          color="warning"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FECard variant="flat" sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="h2">💵</Typography>
                <Typography variant="h4" sx={{ mt: 1 }}>
                  Tu ingreso dividido en 3 partes
                </Typography>
              </FECard>
              <FinniMessage
                variant="coach"
                title="La regla 50-30-20"
                message="Existe una regla simple que puede cambiar tu forma de ver el dinero. Aplica aunque ganes $1,500 o $5,000."
              />
              <Stack spacing={2}>
                {[
                  { pct: '50%', color: 'success.main', label: 'Necesidades', desc: 'Renta (si aplica), comida, transporte, materiales escolares.' },
                  { pct: '30%', color: 'warning.main', label: 'Deseos', desc: 'Salidas, entretenimiento, ropa, apps.' },
                  { pct: '20%', color: 'info.main', label: 'Ahorro o deudas', desc: 'Fondo de emergencias, meta de ahorro, pago de crédito.' },
                ].map((b) => (
                  <FECard key={b.label} variant="flat" sx={{ border: 2, borderColor: b.color }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="h3" sx={{ color: b.color, minWidth: 48 }}>{b.pct}</Typography>
                      <Box>
                        <Typography variant="body1" fontWeight={700}>{b.label}</Typography>
                        <Typography variant="body2" color="text.secondary">{b.desc}</Typography>
                      </Box>
                    </Stack>
                  </FECard>
                ))}
              </Stack>
              <FinniMessage
                variant="coach"
                title="Ojo"
                message="Estos porcentajes son un punto de partida. Si vives con tus papás, quizás tus necesidades son menores y puedes ahorrar más. Adáptala a tu realidad."
              />
              <Button fullWidth variant="contained" color="warning" size="large" onClick={() => setStep(1)}>
                ¡A personalizar! →
              </Button>
            </Stack>
          </Fade>
        )}

        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="h4">Tu distribución personalizada</Typography>

              {/* Income selector */}
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                  ¿Cuánto recibes al mes? (pesos)
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
                  {EXAMPLES.map((e) => (
                    <Button
                      key={e.label}
                      size="small"
                      variant={income === e.amount && incomeText === String(e.amount) ? 'contained' : 'outlined'}
                      color="warning"
                      onClick={() => { setIncome(e.amount); setIncomeText(String(e.amount)); }}
                      sx={{ minWidth: 64 }}
                    >
                      {e.label}
                    </Button>
                  ))}
                </Stack>
                <TextField
                  label="O ingresa tu monto"
                  type="number"
                  value={incomeText}
                  onChange={(e) => {
                    setIncomeText(e.target.value);
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v) && v > 0) setIncome(v);
                  }}
                  size="small"
                  fullWidth
                  inputProps={{ min: 0 }}
                />
              </FECard>

              {/* Sliders */}
              {overBudget && (
                <Fade in>
                  <FECard variant="flat" sx={{ bgcolor: 'error.light', border: 1, borderColor: 'error.main' }}>
                    <Typography variant="body2" fontWeight={700} color="error.main">
                      ⚠️ ¡Ojo! Estás planeando gastar más de lo que tienes. Total: {necesidades + deseos + ahorro}%
                    </Typography>
                  </FECard>
                </Fade>
              )}

              <FECard variant="flat" sx={{ border: 1, borderColor: 'success.main' }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" fontWeight={700}>🟢 Necesidades</Typography>
                  <Typography variant="body2" fontWeight={700}>{necesidades}% = ${montoNecesidades.toLocaleString()}</Typography>
                </Stack>
                <Slider
                  value={necesidades}
                  onChange={handleNecesidades}
                  min={0}
                  max={100}
                  sx={{ color: 'success.main' }}
                  aria-label="Porcentaje necesidades"
                />
              </FECard>

              <FECard variant="flat" sx={{ border: 1, borderColor: 'warning.main' }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" fontWeight={700}>🟡 Deseos</Typography>
                  <Typography variant="body2" fontWeight={700}>{deseos}% = ${montoDeseos.toLocaleString()}</Typography>
                </Stack>
                <Slider
                  value={deseos}
                  onChange={handleDeseos}
                  min={0}
                  max={100 - necesidades}
                  sx={{ color: 'warning.main' }}
                  aria-label="Porcentaje deseos"
                />
              </FECard>

              <FECard variant="flat" sx={{ border: 1, borderColor: 'info.main' }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" fontWeight={700}>🔵 Ahorro</Typography>
                  <Typography variant="body2" fontWeight={700}>{ahorro}% = ${montoAhorro.toLocaleString()}</Typography>
                </Stack>
                <Slider
                  value={ahorro}
                  onChange={handleAhorro}
                  min={0}
                  max={100 - necesidades - deseos}
                  sx={{ color: 'info.main' }}
                  aria-label="Porcentaje ahorro"
                />
              </FECard>

              <FECard variant="flat" sx={{ bgcolor: total === 100 ? 'success.light' : 'warning.light' }}>
                <Typography variant="body2" fontWeight={700}>
                  Total: {necesidades + deseos + ahorro}% {total === 100 ? '✅' : '⚠️'}
                </Typography>
              </FECard>

              {interacted && !overBudget && (
                <Fade in>
                  <FinniMessage
                    variant="success"
                    title="¡Tu punto de partida listo!"
                    message="En la lección 12 lo convertiremos en tu presupuesto real."
                  />
                </Fade>
              )}
            </Stack>
          </Fade>
        )}
      </Box>
    </LessonShell>
  );
}
