import { useState } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade,
  Slider, Paper,
} from '@mui/material';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';

function calcInvested(principal: number, rate: number, years: number) {
  return principal * Math.pow(1 + rate, years);
}
function calcInflationReal(principal: number, inflacion: number, years: number) {
  return principal / Math.pow(1 + inflacion, years);
}

const MYTHS = [
  {
    mito: 'Necesito mucho dinero para invertir',
    realidad: 'Puedes empezar con $100 en CETES. No hay mínimo imposible.',
  },
  {
    mito: 'Invertir es muy riesgoso',
    realidad: 'El riesgo se gestiona con conocimiento y diversificación. No toda inversión es especulativa.',
  },
  {
    mito: 'Es muy complicado',
    realidad: 'Existen instrumentos diseñados para principiantes como CETES y fondos de deuda.',
  },
  {
    mito: 'Es para cuando sea grande',
    realidad: 'El tiempo es tu mayor aliado — cada año que esperas, cuesta dinero real.',
  },
];

const VOCAB = [
  {
    term: 'Inversión',
    def: 'Poner tu dinero en algo con la expectativa de que genere más dinero con el tiempo.',
  },
  {
    term: 'Rendimiento',
    def: 'El dinero extra que genera tu inversión, expresado en porcentaje anual.',
  },
  {
    term: 'Riesgo',
    def: 'La posibilidad de que la inversión no genere lo esperado — algo que se gestiona, no se ignora.',
  },
];

export default function L01() {
  const [step, setStep] = useState(0);
  const [calibracion, setCalibracion] = useState<string | null>(null);
  const [years, setYears] = useState(10);
  const [flipped, setFlipped] = useState<boolean[]>([false, false, false, false]);
  const [vocabVisto, setVocabVisto] = useState(false);

  const allFlipped = flipped.every(Boolean);
  const ready = allFlipped && vocabVisto;

  const flip = (i: number) => {
    setFlipped((prev) => prev.map((v, idx) => (idx === i ? true : v)));
  };

  const invested = calcInvested(5000, 0.06, years);
  const savedReal = calcInflationReal(5000, 0.055, years);

  return (
    <LessonShell
      id="L01"
      title="Invertir no es para ricos: qué significa poner tu dinero a trabajar"
      completion={{ ready }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={(step / 4) * 100}
          color="info"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {/* Pantalla 0 — Calibración */}
        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="coach"
                title="Terminamos con el mito"
                message="¿Cuántas veces escuchaste que invertir es para gente rica, para expertos, o para cuando seas mayor? Hoy terminamos con eso. Invertir es para cualquiera que entienda cómo funciona."
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography variant="body1" fontWeight={700} sx={{ mb: 2 }}>
                  ¿Has invertido alguna vez?
                </Typography>
                <Stack spacing={1.5}>
                  {[
                    'Nunca',
                    'No sé si lo que tengo cuenta',
                    'Una vez pero no entendí bien',
                    'Sí, regularmente',
                  ].map((op) => (
                    <Button
                      key={op}
                      variant={calibracion === op ? 'contained' : 'outlined'}
                      color="info"
                      onClick={() => setCalibracion(op)}
                      sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                    >
                      {op}
                    </Button>
                  ))}
                </Stack>
              </FECard>
              {calibracion && (
                <Fade in>
                  <Button fullWidth variant="contained" color="info" size="large" onClick={() => setStep(1)}>
                    Continuar →
                  </Button>
                </Fade>
              )}
            </Stack>
          </Fade>
        )}

        {/* Pantalla 1 — Animación comparativa con deslizador */}
        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="h4" fontWeight={700}>
                ¿Qué pasa con $5,000 en el tiempo?
              </Typography>
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                  Arrastra para ver la diferencia en {years} año{years !== 1 ? 's' : ''}:
                </Typography>
                <Slider
                  value={years}
                  min={1}
                  max={20}
                  step={1}
                  onChange={(_, v) => setYears(Number(v))}
                  color="info"
                  valueLabelDisplay="auto"
                  sx={{ mb: 2 }}
                />
                <Stack spacing={1.5}>
                  <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.100' }}>
                    <Typography variant="caption" color="text.secondary">LÍNEA A — Dinero guardado en efectivo</Typography>
                    <Typography variant="h6" fontWeight={800}>$5,000</Typography>
                    <Typography variant="caption" color="error.main">
                      Pero la inflación erosionó su valor real a ${savedReal.toFixed(0)}
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'warning.light', border: 2, borderColor: 'warning.main' }}>
                    <Typography variant="caption" color="text.secondary">LÍNEA B — Dinero invertido al 6% anual</Typography>
                    <Typography variant="h6" fontWeight={800} color="warning.dark">
                      ${invested.toFixed(0)}
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      Ganaste ${(invested - 5000).toFixed(0)} extra
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'error.light' }}>
                    <Typography variant="caption" color="text.secondary">LÍNEA C — Diferencia real</Typography>
                    <Typography variant="h6" fontWeight={800} color="error.dark">
                      ${(invested - savedReal).toFixed(0)} de ventaja al invertir
                    </Typography>
                  </Paper>
                </Stack>
                <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                  "La diferencia no es suerte. Es el tiempo y el conocimiento."
                </Typography>
              </FECard>
              <Button fullWidth variant="contained" color="info" size="large" onClick={() => setStep(2)}>
                Ver los mitos →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 2 — Mitos vs Realidades */}
        {step === 2 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="h4" fontWeight={700}>
                Mitos vs Realidades
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toca cada tarjeta para revelar la realidad:
              </Typography>
              <Stack spacing={2}>
                {MYTHS.map((m, i) => (
                  <Paper
                    key={i}
                    onClick={() => flip(i)}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      cursor: 'pointer',
                      border: 2,
                      borderColor: flipped[i] ? 'success.main' : 'warning.main',
                      bgcolor: flipped[i] ? 'success.light' : 'warning.light',
                      transition: 'all 0.3s',
                    }}
                  >
                    {!flipped[i] ? (
                      <>
                        <Typography variant="caption" color="warning.dark" fontWeight={700}>MITO</Typography>
                        <Typography variant="body1" fontWeight={700}>"{m.mito}"</Typography>
                        <Typography variant="caption" color="text.secondary">Toca para ver la realidad</Typography>
                      </>
                    ) : (
                      <>
                        <Typography variant="caption" color="success.dark" fontWeight={700}>✅ REALIDAD</Typography>
                        <Typography variant="body1" fontWeight={700}>{m.realidad}</Typography>
                      </>
                    )}
                  </Paper>
                ))}
              </Stack>
              {allFlipped && (
                <Fade in>
                  <Button fullWidth variant="contained" color="info" size="large" onClick={() => setStep(3)}>
                    Ver el vocabulario base →
                  </Button>
                </Fade>
              )}
            </Stack>
          </Fade>
        )}

        {/* Pantalla 3 — Vocabulario base */}
        {step === 3 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="h4" fontWeight={700}>
                Vocabulario base
              </Typography>
              <Stack spacing={2}>
                {VOCAB.map((v) => (
                  <FECard key={v.term} variant="flat" sx={{ border: 1, borderColor: 'warning.main' }}>
                    <Typography variant="body1" fontWeight={800} color="warning.dark">{v.term}</Typography>
                    <Typography variant="body2">{v.def}</Typography>
                  </FECard>
                ))}
              </Stack>
              <FECard variant="flat" sx={{ bgcolor: 'info.light', border: 1, borderColor: 'info.main' }}>
                <Typography variant="body2" fontWeight={700}>Diferencia clave con el ahorro:</Typography>
                <Typography variant="body2">
                  El ahorro protege tu dinero. La inversión lo hace crecer (asumiendo cierto riesgo).
                </Typography>
              </FECard>
              <FinniMessage
                variant="coach"
                title="¡Y eso es todo el vocabulario que necesitas para empezar!"
                message="En este módulo vas a aprender a tomar decisiones de inversión informadas. No vas a ser Warren Buffett, pero vas a dejar de tener miedo."
              />
              {!vocabVisto ? (
                <Button
                  fullWidth
                  variant="contained"
                  color="info"
                  size="large"
                  onClick={() => setVocabVisto(true)}
                >
                  ¡Entendido! Marcar como visto
                </Button>
              ) : (
                <Fade in>
                  <FECard variant="flat" sx={{ textAlign: 'center', bgcolor: 'success.light', border: 2, borderColor: 'success.main' }}>
                    <Typography variant="h2">🎉</Typography>
                    <Typography variant="body1" fontWeight={700}>
                      ¡Lección 1 completada! Ya tienes las bases para invertir con criterio.
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
