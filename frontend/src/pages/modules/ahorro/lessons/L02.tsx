import { useState } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade, Chip,
} from '@mui/material';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';

type Choice = 'informal' | 'formal' | null;

const SCENARIOS = [
  {
    id: 1,
    text: '¿Llego la quincena de la tanda pero tu amigo no tiene el dinero?',
    best: 'formal' as const,
    feedback: 'Con ahorro informal dependes de terceros. El ahorro formal no falla.',
  },
  {
    id: 2,
    text: '¿Tu banco quebro?',
    best: 'formal' as const,
    feedback: 'El IPAB protege hasta ~3 millones en bancos autorizados. El cochinito, no.',
  },
  {
    id: 3,
    text: '¿Emergencia medica a media noche?',
    best: 'informal' as const,
    feedback: 'El acceso inmediato es la ventaja del ahorro informal en casos urgentes.',
  },
  {
    id: 4,
    text: '¿Te robaron en casa?',
    best: 'formal' as const,
    feedback: 'El ahorro formal no esta en tu casa. El robo no lo afecta.',
  },
  {
    id: 5,
    text: '¿Quieres ver cuanto llevas ahorrando?',
    best: 'formal' as const,
    feedback: 'El banco registra todo automaticamente. El cochinito no.',
  },
];

const PRODUCTOS = [
  'BBVA Libreta (sin comision con saldo minimo)',
  'Santander Zero (sin comision)',
  'Hey Banco (rendimiento adicional)',
];

export default function L02() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Choice>>({});
  const [showFeedback, setShowFeedback] = useState<Record<number, boolean>>({});

  const answered = Object.values(answers).filter(Boolean).length;
  const allDone = answered === SCENARIOS.length;

  const choose = (id: number, choice: Choice) => {
    if (answers[id]) return;
    setAnswers((prev) => ({ ...prev, [id]: choice }));
    setShowFeedback((prev) => ({ ...prev, [id]: true }));
  };

  const progress = step === 0 ? 0 : step === 1 ? 33 : step === 2 ? 66 : 100;

  return (
    <LessonShell
      id="L02"
      title="Cochinito vs banco: ahorro informal y formal"
      completion={{ ready: allDone }}
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
                title="Hoy vamos a comparar"
                message="¿Guardas dinero en tu cuarto? ¿Participas en tandas con amigos? No hay nada malo con eso… pero hay algo mejor."
              />
              <Stack spacing={2}>
                <FECard variant="flat" sx={{ border: 2, borderColor: 'warning.main' }}>
                  <Typography variant="body1" fontWeight={700} sx={{ mb: 1 }}>
                    🐷 Ahorro Informal
                  </Typography>
                  <Stack spacing={0.5}>
                    <Typography variant="body2">Formas: alcancia, debajo del colchon, tandas</Typography>
                    <Typography variant="body2" color="success.main">✅ Acceso inmediato, sin tramites</Typography>
                    <Typography variant="body2" color="error.main">❌ Robo, gasto impulsivo, cero proteccion legal</Typography>
                  </Stack>
                </FECard>
                <FECard variant="flat" sx={{ border: 2, borderColor: 'success.main' }}>
                  <Typography variant="body1" fontWeight={700} sx={{ mb: 1 }}>
                    🏦 Ahorro Formal
                  </Typography>
                  <Stack spacing={0.5}>
                    <Typography variant="body2">Formas: cuenta de ahorro, CETES, nomina</Typography>
                    <Typography variant="body2" color="success.main">✅ Rendimiento, proteccion IPAB (~3M), historial</Typography>
                    <Typography variant="body2" color="error.main">❌ Comisiones si no es la cuenta correcta</Typography>
                  </Stack>
                </FECard>
              </Stack>
              <FinniMessage
                variant="coach"
                title="La tanda puede ser parte de tu estrategia"
                message="Pero no puede ser tu unica estrategia."
              />
              <Button fullWidth variant="contained" color="success" size="large" onClick={() => setStep(1)}>
                Jugar los 5 escenarios →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 1 — Mini-juego */}
        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="body1" fontWeight={700}>
                ¿Informal o Formal? Toca tu eleccion en cada situacion.
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(answered / SCENARIOS.length) * 100}
                color="success"
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Stack spacing={2}>
                {SCENARIOS.map((sc) => {
                  const ans = answers[sc.id];
                  const isCorrect = ans === sc.best;
                  return (
                    <FECard
                      key={sc.id}
                      variant="flat"
                      sx={{
                        border: 1,
                        borderColor: ans
                          ? isCorrect ? 'success.main' : 'error.main'
                          : 'divider',
                        bgcolor: ans
                          ? isCorrect ? 'success.light' : 'error.light'
                          : 'background.paper',
                      }}
                    >
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                        {sc.id}. {sc.text}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant={ans === 'informal' ? 'contained' : 'outlined'}
                          color="warning"
                          onClick={() => choose(sc.id, 'informal')}
                          disabled={!!ans}
                          sx={{ textTransform: 'none' }}
                        >
                          🐷 Informal
                        </Button>
                        <Button
                          size="small"
                          variant={ans === 'formal' ? 'contained' : 'outlined'}
                          color="success"
                          onClick={() => choose(sc.id, 'formal')}
                          disabled={!!ans}
                          sx={{ textTransform: 'none' }}
                        >
                          🏦 Formal
                        </Button>
                      </Stack>
                      {showFeedback[sc.id] && (
                        <Fade in>
                          <Typography
                            variant="caption"
                            sx={{ display: 'block', mt: 1, color: isCorrect ? 'success.dark' : 'error.dark' }}
                          >
                            {isCorrect ? '✅ ' : '❌ '}{sc.feedback}
                          </Typography>
                        </Fade>
                      )}
                    </FECard>
                  );
                })}
              </Stack>
              {allDone && (
                <Fade in>
                  <Button fullWidth variant="contained" color="success" size="large" onClick={() => setStep(2)}>
                    Ver la estrategia ideal →
                  </Button>
                </Fade>
              )}
            </Stack>
          </Fade>
        )}

        {/* Pantalla 2 — Resultado y recomendacion */}
        {step === 2 && (
          <Fade in>
            <Stack spacing={3}>
              <FECard variant="flat" sx={{ bgcolor: 'success.light', border: 2, borderColor: 'success.main', textAlign: 'center', py: 2 }}>
                <Typography variant="h4">Estrategia ideal: combina ambos</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Informal para emergencias inmediatas · Formal para crecer y protegerte
                </Typography>
              </FECard>
              <FinniMessage
                variant="coach"
                title="Finni te recomienda"
                message="Empieza con una cuenta sin comisiones. Con $0 de saldo minimo puedes abrir hoy mismo."
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                  Cuentas sin comisiones para comenzar:
                </Typography>
                <Stack spacing={0.75}>
                  {PRODUCTOS.map((p) => (
                    <Chip key={p} label={p} size="small" color="success" variant="outlined" />
                  ))}
                </Stack>
              </FECard>
            </Stack>
          </Fade>
        )}
      </Box>
    </LessonShell>
  );
}
