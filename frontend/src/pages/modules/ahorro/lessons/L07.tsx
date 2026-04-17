import { useState, useMemo } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade, Chip, TextField,
} from '@mui/material';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

type IngresoType = 'fijo' | 'variable' | 'mixto' | null;
type Estrategia = 'porcentaje' | 'doble_fondo' | 'mes_base' | null;

const ESTRATEGIAS = [
  {
    id: 'porcentaje' as const,
    title: 'Estrategia 1 — Porcentaje fijo',
    desc: 'Ahorra siempre el mismo porcentaje de lo que ganes.',
    ejemplo: 'Si ganas $3,000 apartas 20% ($600). Si ganas $1,500, apartas 20% ($300). Siempre proporcionado.',
    emoji: '%',
  },
  {
    id: 'doble_fondo' as const,
    title: 'Estrategia 2 — Doble fondo',
    desc: 'Dos cuentas: una de ahorro fija (minimo garantizado) y una variable (lo extra de meses buenos).',
    ejemplo: 'Fondo A: $300/mes siempre. Fondo B: cualquier extra que llegue ese mes.',
    emoji: '🏦',
  },
  {
    id: 'mes_base' as const,
    title: 'Estrategia 3 — Mes base',
    desc: 'Calcula tu ingreso minimo de los ultimos 3 meses. Basa tu plan en ese numero.',
    ejemplo: 'Si en 3 meses ganaste $1,500, $2,200 y $1,800, tu base es $1,500. Lo extra, ahorra de inmediato.',
    emoji: '📊',
  },
];

const CASOS = [
  {
    nombre: 'Laura',
    tipo: 'Mesada fija de $2,000/mes',
    estrategia: 'Porcentaje fijo: aparta $400 (20%) el dia que llega la mesada.',
  },
  {
    nombre: 'Rodrigo',
    tipo: 'Tutorias: gana entre $800 y $3,500 segun el mes',
    estrategia: 'Mes base ($800) + porcentaje del excedente. Automatiza el minimo.',
  },
];

export default function L07() {
  const [step, setStep] = useState(0);
  const [ingresoType, setIngresoType] = useState<IngresoType>(null);
  const [ingreso1, setIngreso1] = useState('');
  const [ingreso2, setIngreso2] = useState('');
  const [ingreso3, setIngreso3] = useState('');
  const [estrategia, setEstrategia] = useState<Estrategia>(null);
  const [confirmed, setConfirmed] = useState(false);

  const nums = [ingreso1, ingreso2, ingreso3].map((v) => parseFloat(v) || 0);
  const ingresoBase = nums.length === 3 ? Math.min(...nums) : 0;
  const ingresoPromedio = nums.length === 3 ? nums.reduce((a, b) => a + b, 0) / 3 : 0;
  const ahorroPorcentaje = useMemo(() => ingresoBase * 0.2, [ingresoBase]);
  const ahorroPorcentajeProm = useMemo(() => ingresoPromedio * 0.2, [ingresoPromedio]);

  const calcHasData = nums.every((n) => n > 0);

  const canComplete = estrategia !== null && confirmed;

  const handleConfirm = async () => {
    await lessonDataRepository.save('ahorro', 'l7_estrategia', {
      ingresoType,
      estrategia,
      ingresoBase: calcHasData ? ingresoBase : null,
      savedAt: new Date().toISOString(),
    });
    setConfirmed(true);
    setStep(4);
  };

  const progress = step === 0 ? 0 : step === 1 ? 20 : step === 2 ? 50 : step === 3 ? 75 : 100;

  return (
    <LessonShell
      id="L07"
      title="Cuando tu ingreso es impredecible"
      completion={{ ready: canComplete }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          color="success"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {/* Pantalla 0 — Apertura */}
        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="coach"
                title="Bienvenido al club de ingresos variables"
                message="¿Haces freelance, tutorias, ventas o cualquier trabajo donde no sabes exactamente cuanto recibiras este mes? Hay formas de ahorrar igual."
              />
              <Stack spacing={2}>
                {ESTRATEGIAS.map((e) => (
                  <FECard key={e.id} variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                    <Typography variant="body2" fontWeight={700}>{e.emoji} {e.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{e.desc}</Typography>
                    <Typography variant="caption" color="success.dark" sx={{ mt: 0.5, display: 'block' }}>
                      Ejemplo: {e.ejemplo}
                    </Typography>
                  </FECard>
                ))}
              </Stack>
              <FinniMessage
                variant="coach"
                title="La clave es la automatizacion"
                message="El ahorro manual depende de la fuerza de voluntad. El automatico, no."
              />
              <Button fullWidth variant="contained" color="success" size="large" onClick={() => setStep(1)}>
                ¿Cual es mi perfil? →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 1 — Identificacion */}
        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="body1" fontWeight={700}>¿Como es tu ingreso este semestre?</Typography>
              <Stack spacing={1.5}>
                {[
                  { key: 'fijo' as const, label: 'Fijo (mesada, beca constante)', desc: 'Sabes exactamente cuanto recibiras cada mes' },
                  { key: 'variable' as const, label: 'Variable (freelance, ventas, tutorias)', desc: 'El monto cambia cada mes' },
                  { key: 'mixto' as const, label: 'Mixto (algo fijo + algo variable)', desc: 'Una base fija mas ingresos extras' },
                ].map((o) => (
                  <Button
                    key={o.key}
                    variant={ingresoType === o.key ? 'contained' : 'outlined'}
                    color="success"
                    onClick={() => setIngresoType(o.key)}
                    sx={{ justifyContent: 'flex-start', textTransform: 'none', flexDirection: 'column', alignItems: 'flex-start', py: 1.5 }}
                  >
                    <Typography variant="body2" fontWeight={700}>{o.label}</Typography>
                    <Typography variant="caption">{o.desc}</Typography>
                  </Button>
                ))}
              </Stack>
              {ingresoType && (
                <Fade in>
                  <Button fullWidth variant="contained" color="success" size="large" onClick={() => setStep(2)}>
                    Ver casos de estudio →
                  </Button>
                </Fade>
              )}
            </Stack>
          </Fade>
        )}

        {/* Pantalla 2 — Casos + calculadora */}
        {step === 2 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="body1" fontWeight={700}>Casos de estudio:</Typography>
              {CASOS.map((c) => (
                <FECard key={c.nombre} variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                  <Typography variant="body2" fontWeight={700}>{c.nombre}</Typography>
                  <Typography variant="caption" color="text.secondary">{c.tipo}</Typography>
                  <Typography variant="body2" color="success.dark" sx={{ mt: 0.5 }}>→ {c.estrategia}</Typography>
                </FECard>
              ))}

              <FECard variant="flat" sx={{ border: 1, borderColor: 'success.light' }}>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                  Calculadora — ingresa tus ultimos 3 ingresos:
                </Typography>
                <Stack spacing={1}>
                  {[['Mes 1', ingreso1, setIngreso1], ['Mes 2', ingreso2, setIngreso2], ['Mes 3', ingreso3, setIngreso3]].map(([label, val, setter]) => (
                    <TextField
                      key={label as string}
                      label={label as string}
                      size="small"
                      type="number"
                      value={val as string}
                      onChange={(e) => (setter as (v: string) => void)(e.target.value)}
                      inputProps={{ min: 0 }}
                    />
                  ))}
                </Stack>
                {calcHasData && (
                  <Fade in>
                    <Stack spacing={0.5} sx={{ mt: 1.5 }}>
                      <Typography variant="body2">Ingreso base (minimo): <b>${ingresoBase.toLocaleString()}</b></Typography>
                      <Typography variant="body2">Promedio: <b>${ingresoPromedio.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</b></Typography>
                      <Typography variant="body2" color="success.dark">Ahorro recomendado (20% del base): <b>${ahorroPorcentaje.toFixed(0)}/mes</b></Typography>
                      <Typography variant="body2" color="success.dark">Ahorro del promedio (20%): <b>${ahorroPorcentajeProm.toFixed(0)}/mes</b></Typography>
                    </Stack>
                  </Fade>
                )}
              </FECard>

              <Button fullWidth variant="contained" color="success" size="large" onClick={() => setStep(3)}>
                Elegir mi estrategia →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 3 — Compromiso */}
        {step === 3 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="body1" fontWeight={700}>¿Cual estrategia vas a usar este mes?</Typography>
              <Stack spacing={1.5}>
                {ESTRATEGIAS.map((e) => (
                  <Button
                    key={e.id}
                    variant={estrategia === e.id ? 'contained' : 'outlined'}
                    color="success"
                    onClick={() => setEstrategia(e.id)}
                    sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                  >
                    {e.emoji} {e.title.replace('Estrategia 1 — ', '').replace('Estrategia 2 — ', '').replace('Estrategia 3 — ', '')}
                  </Button>
                ))}
              </Stack>
              {estrategia && (
                <Fade in>
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    size="large"
                    onClick={() => void handleConfirm()}
                  >
                    Confirmar mi estrategia →
                  </Button>
                </Fade>
              )}
            </Stack>
          </Fade>
        )}

        {/* Pantalla 4 — Confirmacion */}
        {step === 4 && (
          <Fade in>
            <Stack spacing={3}>
              <FECard variant="flat" sx={{ bgcolor: 'success.light', border: 2, borderColor: 'success.main', textAlign: 'center', py: 2 }}>
                <Typography variant="h4">✅ Estrategia elegida</Typography>
                <Chip
                  label={ESTRATEGIAS.find((e) => e.id === estrategia)?.title ?? ''}
                  color="success"
                  sx={{ mt: 1 }}
                />
              </FECard>
              <FinniMessage
                variant="success"
                title="Sin importar tu ingreso, puedes ahorrar"
                message="La clave no es cuanto ganas, sino que el ahorro sea lo primero que apartras."
              />
            </Stack>
          </Fade>
        )}
      </Box>
    </LessonShell>
  );
}
