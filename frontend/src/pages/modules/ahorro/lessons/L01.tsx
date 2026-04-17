import { useState } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade, Chip, Slider,
} from '@mui/material';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';

type BridgeAnswer = 'nada' | 'algo' | 'planeado' | null;
type ReflexAnswer = 'a' | 'b' | 'depende' | null;
type Quiz1 = 'a' | 'b' | 'c' | null;
type Quiz2 = 'a' | 'b' | 'c' | null;

const RUTAS = [
  {
    id: 'a',
    label: 'RUTA A — Gasto primero',
    color: 'error.main',
    steps: ['Dinero llega', 'Gastos necesidades', 'Gastos deseos', 'Intento de ahorro', '$0 ahorrado'],
    proyeccion: { m3: 0, m6: 0, m12: 0 },
    emoji: '❌',
  },
  {
    id: 'b',
    label: 'RUTA B — Ahorro primero',
    color: 'success.main',
    steps: ['Dinero llega', 'Aparta ahorro YA', 'Gasta el resto', 'Ahorro constante'],
    proyeccion: { m3: 1300, m6: 2600, m12: 5200 },
    emoji: '✅',
  },
];

export default function L01() {
  const [step, setStep] = useState(0);
  const [bridge, setBridge] = useState<BridgeAnswer>(null);
  const [rutaExpanded, setRutaExpanded] = useState<string | null>(null);
  const [reflex, setReflex] = useState<ReflexAnswer>(null);
  const [monto, setMonto] = useState(100);
  const [q1, setQ1] = useState<Quiz1>(null);
  const [q2, setQ2] = useState<Quiz2>(null);

  const quizDone = q1 !== null && q2 !== null;
  const progress = step === 0 ? 0 : step === 1 ? 25 : step === 2 ? 50 : step === 3 ? 75 : 100;

  return (
    <LessonShell
      id="L01"
      title="Ahorro primero: el habito que cambia todo"
      completion={{ ready: quizDone }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          color="success"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {/* Pantalla 0 — Bienvenida + pregunta puente M1 */}
        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="coach"
                title="¡Bienvenido al Modulo 2!"
                message="En el modulo anterior construiste tu presupuesto. Ahora vamos a hacer que ese dinero trabaje para ti, no solo para sobrevivir el mes."
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'success.main' }}>
                <Typography variant="body1" fontWeight={700} sx={{ mb: 1.5 }}>
                  ¿Cuanto lograste ahorrar el mes pasado?
                </Typography>
                <Stack spacing={1}>
                  {[
                    { key: 'nada', label: 'Nada' },
                    { key: 'algo', label: 'Algo' },
                    { key: 'planeado', label: 'Lo que planee' },
                  ].map((o) => (
                    <Button
                      key={o.key}
                      variant={bridge === o.key ? 'contained' : 'outlined'}
                      color="success"
                      onClick={() => setBridge(o.key as BridgeAnswer)}
                      sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                    >
                      {o.label}
                    </Button>
                  ))}
                </Stack>
              </FECard>
              {bridge && (
                <Fade in>
                  <Button fullWidth variant="contained" color="success" size="large" onClick={() => setStep(1)}>
                    Ver la diferencia →
                  </Button>
                </Fade>
              )}
            </Stack>
          </Fade>
        )}

        {/* Pantalla 1 — Animacion dos rutas */}
        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                "La diferencia no esta en el monto. Esta en el orden. Cuando ahorras primero, el ahorro deja de ser opcional."
              </Typography>
              <Stack spacing={2}>
                {RUTAS.map((r) => (
                  <FECard
                    key={r.id}
                    variant="flat"
                    sx={{
                      border: 2,
                      borderColor: r.color,
                      cursor: 'pointer',
                      bgcolor: rutaExpanded === r.id ? (r.id === 'a' ? 'error.light' : 'success.light') : 'background.paper',
                    }}
                    onClick={() => setRutaExpanded(rutaExpanded === r.id ? null : r.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography fontWeight={700} color={r.color}>
                        {r.emoji} {r.label}
                      </Typography>
                      <Typography variant="caption">{rutaExpanded === r.id ? '▲' : '▼'}</Typography>
                    </Stack>
                    {rutaExpanded === r.id && (
                      <Fade in>
                        <Stack spacing={1} sx={{ mt: 1.5 }}>
                          {r.steps.map((s, i) => (
                            <Typography key={i} variant="body2">
                              {i + 1}. {s}
                            </Typography>
                          ))}
                          <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                            <Chip label={`3 meses: $${r.proyeccion.m3.toLocaleString()}`} size="small" color={r.id === 'b' ? 'success' : 'error'} />
                            <Chip label={`6 meses: $${r.proyeccion.m6.toLocaleString()}`} size="small" color={r.id === 'b' ? 'success' : 'error'} />
                            <Chip label={`12 meses: $${r.proyeccion.m12.toLocaleString()}`} size="small" color={r.id === 'b' ? 'success' : 'error'} />
                          </Stack>
                        </Stack>
                      </Fade>
                    )}
                  </FECard>
                ))}
              </Stack>
              <FinniMessage
                variant="coach"
                title="La Ruta B tiene un nombre"
                message="Pagarte primero a ti mismo. Es el habito mas poderoso de las finanzas personales."
              />
              <Button fullWidth variant="contained" color="success" size="large" onClick={() => setStep(2)}>
                Reflexionar →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 2 — Reflexion + slider */}
        {step === 2 && (
          <Fade in>
            <Stack spacing={3}>
              <FECard variant="flat" sx={{ border: 1, borderColor: 'success.main' }}>
                <Typography variant="body1" fontWeight={700} sx={{ mb: 1.5 }}>
                  ¿En cual de las dos rutas te identificas normalmente?
                </Typography>
                <Stack spacing={1}>
                  {[
                    { key: 'a', label: 'Ruta A — primero gasto' },
                    { key: 'b', label: 'Ruta B — primero ahorro' },
                    { key: 'depende', label: 'Depende del mes' },
                  ].map((o) => (
                    <Button
                      key={o.key}
                      variant={reflex === o.key ? 'contained' : 'outlined'}
                      color="success"
                      onClick={() => setReflex(o.key as ReflexAnswer)}
                      sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                    >
                      {o.label}
                    </Button>
                  ))}
                </Stack>
              </FECard>

              <FECard variant="flat" sx={{ border: 1, borderColor: 'success.light' }}>
                <Typography variant="body1" fontWeight={700} sx={{ mb: 0.5 }}>
                  Tu proyeccion personalizada
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Si apartas ${monto}/semana desde hoy...
                </Typography>
                <Slider
                  value={monto}
                  onChange={(_, v) => setMonto(v as number)}
                  min={50}
                  max={1000}
                  step={50}
                  color="success"
                  sx={{ my: 2 }}
                />
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip label={`1 ano: $${(monto * 52).toLocaleString()}`} color="success" size="small" />
                  <Chip label={`5 anos: $${(monto * 52 * 5).toLocaleString()}`} color="success" size="small" />
                  <Chip label={`10 anos: $${(monto * 52 * 10).toLocaleString()}`} color="success" size="small" />
                </Stack>
              </FECard>

              {reflex && (
                <Fade in>
                  <Button fullWidth variant="contained" color="success" size="large" onClick={() => setStep(3)}>
                    Quiz rapido →
                  </Button>
                </Fade>
              )}
            </Stack>
          </Fade>
        )}

        {/* Pantalla 3 — Quiz de 2 preguntas */}
        {step === 3 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="h4">Quiz rapido 🧠</Typography>

              {/* Pregunta 1 */}
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography variant="body1" fontWeight={700} sx={{ mb: 1.5 }}>
                  1. ¿Que es el ahorro?
                </Typography>
                <Stack spacing={1}>
                  {[
                    { key: 'a', label: 'A) Guardar lo que sobra' },
                    { key: 'b', label: 'B) Apartar una parte antes de gastar' },
                    { key: 'c', label: 'C) No gastar nada' },
                  ].map((o) => (
                    <Button
                      key={o.key}
                      variant={q1 === o.key ? 'contained' : 'outlined'}
                      color={q1 === o.key ? (o.key === 'b' ? 'success' : 'error') : 'inherit'}
                      onClick={() => setQ1(o.key as Quiz1)}
                      sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                      disabled={q1 !== null}
                    >
                      {o.label}
                    </Button>
                  ))}
                </Stack>
                {q1 && (
                  <Chip
                    sx={{ mt: 1 }}
                    color={q1 === 'b' ? 'success' : 'error'}
                    label={q1 === 'b' ? '¡Correcto! Ahorrar es separar intencionalmente.' : 'El ahorro es planificado, no lo que sobra.'}
                  />
                )}
              </FECard>

              {/* Pregunta 2 */}
              {q1 && (
                <Fade in>
                  <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                    <Typography variant="body1" fontWeight={700} sx={{ mb: 1.5 }}>
                      2. ¿Cuando se ahorra mas facilmente?
                    </Typography>
                    <Stack spacing={1}>
                      {[
                        { key: 'a', label: 'A) Cuando sobra dinero' },
                        { key: 'b', label: 'B) Cuando se automatiza' },
                        { key: 'c', label: 'C) Cuando el ingreso es alto' },
                      ].map((o) => (
                        <Button
                          key={o.key}
                          variant={q2 === o.key ? 'contained' : 'outlined'}
                          color={q2 === o.key ? (o.key === 'b' ? 'success' : 'error') : 'inherit'}
                          onClick={() => setQ2(o.key as Quiz2)}
                          sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                          disabled={q2 !== null}
                        >
                          {o.label}
                        </Button>
                      ))}
                    </Stack>
                    {q2 && (
                      <Chip
                        sx={{ mt: 1 }}
                        color={q2 === 'b' ? 'success' : 'error'}
                        label={q2 === 'b' ? '¡Correcto! La automatizacion elimina la fuerza de voluntad.' : 'La automatizacion es la clave, no el monto.'}
                      />
                    )}
                  </FECard>
                </Fade>
              )}

              {quizDone && (
                <Fade in>
                  <FinniMessage
                    variant="success"
                    title="En este modulo vas a construir tu habito"
                    message="Empieza con lo que puedas, no con lo que idealmente quisieras."
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
