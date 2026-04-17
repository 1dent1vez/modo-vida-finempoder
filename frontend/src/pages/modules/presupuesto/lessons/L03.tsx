import { useState, useEffect } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade,
  Chip, TextField,
} from '@mui/material';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

const GASTOS_HORMIGA = [
  { id: 'cafe', label: 'Café matutino', amount: 45, emoji: '☕' },
  { id: 'musica', label: 'App de música', amount: 29, emoji: '🎵' },
  { id: 'propina', label: 'Propina en taquería', amount: 20, emoji: '🌮' },
  { id: 'papas', label: 'Papas en máquina', amount: 22, emoji: '🍟' },
  { id: 'parking', label: 'Estacionamiento extra', amount: 30, emoji: '🅿️' },
  { id: 'agua', label: 'Agua embotellada', amount: 18, emoji: '💧' },
  { id: 'juego', label: 'Videojuego en oferta', amount: 99, emoji: '🎮' },
  { id: 'snack', label: 'Snack convenience store', amount: 35, emoji: '🍫' },
  { id: 'saldo', label: 'Recarga de saldo', amount: 50, emoji: '📱' },
  { id: 'impresiones', label: 'Impresiones extra', amount: 25, emoji: '🖨️' },
];

type PersonalGasto = { nombre: string; monto: string };

export default function L03() {
  const [step, setStep] = useState(0);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [personalGastos, setPersonalGastos] = useState<PersonalGasto[]>([
    { nombre: '', monto: '' },
    { nombre: '', monto: '' },
    { nombre: '', monto: '' },
  ]);

  const totalFound = GASTOS_HORMIGA.filter((g) => found.has(g.id)).reduce((a, g) => a + g.amount, 0);
  const allFound = found.size === GASTOS_HORMIGA.length;

  const personalTotal = personalGastos.reduce((a, g) => a + (parseFloat(g.monto) || 0), 0);
  const personalValid = personalGastos.every((g) => g.nombre.trim().length > 0 && parseFloat(g.monto) > 0);

  const grandTotal = totalFound + personalTotal;
  const monthly = grandTotal * 4;
  const yearly = grandTotal * 52;

  const toggleFound = (id: string) => {
    setFound((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    if (personalValid) {
      void lessonDataRepository.save('presupuesto', 'l3_gastos_hormiga', {
        gameGastos: GASTOS_HORMIGA.filter((g) => found.has(g.id)),
        personalGastos,
        totalWeekly: grandTotal,
        totalMonthly: monthly,
      });
    }
  }, [personalValid, found, personalGastos, grandTotal, monthly]);

  return (
    <LessonShell
      id="L03"
      title="El gasto hormiga: el ladrón silencioso"
      completion={{ ready: allFound && personalValid }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={step === 0 ? 0 : step === 1 ? 25 : step === 2 ? 60 : step === 3 ? 80 : 100}
          color="warning"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {/* Pantalla 0 — Apertura */}
        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FECard variant="flat" sx={{ textAlign: 'center', py: 3, bgcolor: 'warning.light' }}>
                <Typography variant="h2">👜 → 💸</Typography>
                <Typography variant="body1" fontWeight={700} sx={{ mt: 1 }}>
                  Cartera llena el lunes → vacía el viernes
                </Typography>
              </FECard>
              <FinniMessage
                variant="coach"
                title="¿Tienes un ladrón en tu rutina?"
                message="No te roba de golpe. Te roba de a poquito. Todos los días. Se llama gasto hormiga."
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'warning.main' }}>
                <Typography variant="body2">
                  El gasto hormiga es cualquier compra <b>pequeña, recurrente y casi automática</b> que hacemos sin pensarlo.
                  Un café de $45, una descarga de $19, un antojito de $35…
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Solos no parecen gran cosa. Pero sumados al mes, pueden comerse entre{' '}
                  <b>$500 y $1,500 pesos</b> de tu presupuesto.
                </Typography>
              </FECard>
              <FinniMessage
                variant="coach"
                title="La clave"
                message="El problema no es el café. El problema es que no lo tienes en tu presupuesto."
              />
              <Button fullWidth variant="contained" color="warning" size="large" onClick={() => setStep(1)}>
                ¡A encontrar los gastos hormiga! →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 1 — Mini-juego */}
        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="body1">
                Toca todos los gastos hormiga que encuentres en tu semana universitaria. ¡Hay 10!
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(found.size / GASTOS_HORMIGA.length) * 100}
                color="warning"
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" color="text.secondary" textAlign="center">
                {found.size}/10 gastos identificados
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1.5} useFlexGap>
                {GASTOS_HORMIGA.map((g) => (
                  <Chip
                    key={g.id}
                    label={`${g.emoji} ${g.label} $${g.amount}`}
                    onClick={() => toggleFound(g.id)}
                    color={found.has(g.id) ? 'warning' : 'default'}
                    variant={found.has(g.id) ? 'filled' : 'outlined'}
                    sx={{ fontWeight: 600, cursor: 'pointer', minHeight: 40 }}
                  />
                ))}
              </Stack>
              {found.size > 0 && (
                <FECard variant="flat" sx={{ bgcolor: 'warning.light' }}>
                  <Typography variant="body2" fontWeight={700}>
                    Total encontrado esta semana: <b>${totalFound}</b>
                  </Typography>
                </FECard>
              )}
              {allFound && (
                <Fade in>
                  <Button fullWidth variant="contained" color="warning" size="large" onClick={() => setStep(2)}>
                    Ver cuánto suma al mes →
                  </Button>
                </Fade>
              )}
            </Stack>
          </Fade>
        )}

        {/* Pantalla 2 — Calculadora */}
        {step === 2 && (
          <Fade in>
            <Stack spacing={3}>
              <FECard variant="flat" sx={{ bgcolor: 'warning.light', textAlign: 'center' }}>
                <Typography variant="h4" sx={{ mb: 1 }}>Cálculo automático</Typography>
                <Typography variant="body2">Total gastos hormiga/semana: <b>${totalFound}</b></Typography>
                <Typography variant="body2">Al mes (x4): <b>${totalFound * 4}</b></Typography>
                <Typography variant="body2">Al año (x52): <b>${totalFound * 52}</b></Typography>
              </FECard>
              <FinniMessage
                variant="coach"
                title="Ahora los tuyos"
                message="Ingresa tus 3 gastos hormiga reales (los que haces casi automáticamente)."
              />
              <Stack spacing={2}>
                {personalGastos.map((g, i) => (
                  <FECard key={i} variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                    <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                      Gasto hormiga #{i + 1}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <TextField
                        label="¿Cuál es?"
                        value={g.nombre}
                        onChange={(e) => {
                          const next = [...personalGastos];
                          next[i] = { ...next[i], nombre: e.target.value };
                          setPersonalGastos(next);
                        }}
                        size="small"
                        sx={{ flex: 2 }}
                      />
                      <TextField
                        label="$monto"
                        type="number"
                        value={g.monto}
                        onChange={(e) => {
                          const next = [...personalGastos];
                          next[i] = { ...next[i], monto: e.target.value };
                          setPersonalGastos(next);
                        }}
                        size="small"
                        sx={{ flex: 1 }}
                        inputProps={{ min: 0 }}
                      />
                    </Stack>
                  </FECard>
                ))}
              </Stack>
              {personalTotal > 0 && (
                <FECard variant="flat" sx={{ bgcolor: 'error.light' }}>
                  <Typography variant="body2" fontWeight={700}>
                    Tus gastos hormiga/semana: <b>${personalTotal}</b>
                  </Typography>
                  <Typography variant="body2">
                    Total combinado/semana: <b>${grandTotal}</b> | Mes: <b>${monthly}</b> | Año: <b>${yearly}</b>
                  </Typography>
                </FECard>
              )}
              {personalValid && (
                <Fade in>
                  <Button fullWidth variant="contained" color="warning" size="large" onClick={() => setStep(3)}>
                    Reflexión final →
                  </Button>
                </Fade>
              )}
            </Stack>
          </Fade>
        )}

        {/* Pantalla 3 — Reflexión y cierre */}
        {step === 3 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="success"
                title="¡Ladrón identificado! 🐜"
                message={`Identificaste $${grandTotal} en gastos hormiga por semana. Eso es $${monthly} al mes que podrías redirigir.`}
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                  ¿Cuáles eliminarías sin extrañarlos?
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1} useFlexGap>
                  {[...GASTOS_HORMIGA.filter((g) => found.has(g.id)), ...personalGastos.filter((g) => g.nombre).map((g) => ({ id: g.nombre, label: g.nombre, emoji: '💸', amount: parseFloat(g.monto) || 0 }))].map((g) => (
                    <Chip key={g.id} label={`${g.emoji} ${g.label}`} size="small" variant="outlined" />
                  ))}
                </Stack>
              </FECard>
              <FinniMessage
                variant="coach"
                title="Recuerda"
                message="No se trata de eliminar todo. Se trata de hacerlos conscientes y decidir cuáles valen la pena."
              />
            </Stack>
          </Fade>
        )}
      </Box>
    </LessonShell>
  );
}
