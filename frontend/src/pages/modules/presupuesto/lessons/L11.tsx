import { useState } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade, Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';

const HERRAMIENTAS = [
  {
    id: 'condusef',
    nombre: 'App Presupuesto Familiar CONDUSEF',
    emoji: '🏛️',
    tipo: 'Oficial',
    descripcion: 'Oficial del gobierno, gratuita, sin publicidad, sin datos bancarios.',
    pros: ['Gratuita', 'Sin publicidad', 'Oficial y confiable'],
  },
  {
    id: 'fintonic',
    nombre: 'Fintonic',
    emoji: '🔗',
    tipo: 'Sincronización bancaria',
    descripcion: 'Se conecta a tu cuenta bancaria y categoriza automáticamente tus gastos.',
    pros: ['Automático', 'Análisis avanzado', 'Alertas de gastos'],
  },
  {
    id: 'sheets',
    nombre: 'Google Sheets con plantilla',
    emoji: '📊',
    tipo: 'Flexible',
    descripcion: 'Flexible, sin datos personales en una app, personalizable al 100%.',
    pros: ['Total control', 'Sin app', 'Personalizable'],
  },
  {
    id: 'finempoder',
    nombre: 'FinEmpoder (esta PWA)',
    emoji: '🎓',
    tipo: 'Integrada',
    descripcion: 'Integra tu aprendizaje con tu registro real. Disponible offline.',
    pros: ['Integra aprendizaje', 'Offline', 'Gamificada'],
  },
];

const PASOS_TUTORIAL = [
  { id: 'ingreso', desc: 'Agregar un ingreso real al registro', finni: '¡Bien! Tu primer ingreso está registrado.' },
  { id: 'gasto', desc: 'Registrar un gasto de hoy', finni: 'Perfecto. Un gasto en el registro.' },
  { id: 'categoria', desc: 'Categorizarlo correctamente (ej: Alimentación)', finni: '¡Bien categorizado!' },
  { id: 'balance', desc: 'Ver el balance actual de tu cuenta', finni: 'Ves el resumen de entradas y salidas.' },
  { id: 'recordatorio', desc: 'Activar un recordatorio de registro', finni: '¡Listo! El recordatorio está activo.' },
];

export default function L11() {
  const [step, setStep] = useState(0);
  const [favoritas, setFavoritas] = useState<Set<string>>(new Set());
  const [tutorialStep, setTutorialStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const allTutorialDone = PASOS_TUTORIAL.every((p) => completedSteps.has(p.id));

  const toggleFavorita = (id: string) => {
    setFavoritas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const completarPaso = () => {
    const paso = PASOS_TUTORIAL[tutorialStep];
    if (!paso) return;
    setCompletedSteps((prev) => new Set([...prev, paso.id]));
    if (tutorialStep < PASOS_TUTORIAL.length - 1) {
      setTutorialStep((i) => i + 1);
    } else {
      setStep(3);
    }
  };

  return (
    <LessonShell
      id="L11"
      title="Tu presupuesto en la palma de la mano"
      completion={{ ready: allTutorialDone }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={step === 0 ? 0 : step === 1 ? 25 : step === 2 ? 55 : 100}
          color="warning"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="coach"
                title="Tu smartphone, tu mejor aliado"
                message="Registrar gastos en papel está bien. Pero si tienes un smartphone, puedes hacer algo más poderoso: que tu dinero se registre y analice casi solo."
              />
              <Button fullWidth variant="contained" color="warning" size="large" onClick={() => setStep(1)}>
                Ver herramientas disponibles →
              </Button>
            </Stack>
          </Fade>
        )}

        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="body1" fontWeight={700}>Opciones gratuitas en México:</Typography>
              <Typography variant="body2" color="text.secondary">
                Toca las que te llamen la atención para marcarlas como favoritas.
              </Typography>
              <Stack spacing={2}>
                {HERRAMIENTAS.map((h) => (
                  <FECard
                    key={h.id}
                    variant="flat"
                    sx={{
                      border: 2,
                      borderColor: favoritas.has(h.id) ? 'warning.main' : 'divider',
                      bgcolor: favoritas.has(h.id) ? 'warning.light' : 'background.paper',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => toggleFavorita(h.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Typography variant="h2">{h.emoji}</Typography>
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body1" fontWeight={700}>{h.nombre}</Typography>
                          {favoritas.has(h.id) && <CheckCircleIcon color="warning" fontSize="small" />}
                        </Stack>
                        <Chip label={h.tipo} size="small" sx={{ mt: 0.5, mb: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">{h.descripcion}</Typography>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                          {h.pros.map((p) => <Chip key={p} label={p} size="small" variant="outlined" />)}
                        </Stack>
                      </Box>
                    </Stack>
                  </FECard>
                ))}
              </Stack>
              <Button fullWidth variant="contained" color="warning" size="large" onClick={() => setStep(2)}>
                Tutorial de FinEmpoder →
              </Button>
            </Stack>
          </Fade>
        )}

        {step === 2 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="body1" fontWeight={700}>
                Tutorial interactivo de FinEmpoder
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completa las 5 acciones para desbloquear la lección.
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(completedSteps.size / PASOS_TUTORIAL.length) * 100}
                color="warning"
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Stack spacing={1.5}>
                {PASOS_TUTORIAL.map((p, i) => {
                  const done = completedSteps.has(p.id);
                  const isCurrent = i === tutorialStep;
                  return (
                    <FECard
                      key={p.id}
                      variant="flat"
                      sx={{
                        border: 2,
                        borderColor: done ? 'success.main' : isCurrent ? 'warning.main' : 'divider',
                        bgcolor: done ? 'success.light' : isCurrent ? 'warning.light' : 'background.paper',
                        opacity: !done && !isCurrent ? 0.5 : 1,
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="body2" sx={{ minWidth: 24, fontWeight: 700 }}>
                          {done ? '✅' : isCurrent ? '👉' : `${i + 1}.`}
                        </Typography>
                        <Typography variant="body2" fontWeight={isCurrent ? 700 : 400}>
                          {p.desc}
                        </Typography>
                      </Stack>
                      {isCurrent && (
                        <Fade in>
                          <Stack spacing={1} sx={{ mt: 1.5 }}>
                            <FECard variant="flat" sx={{ bgcolor: 'info.light' }}>
                              <Typography variant="caption">
                                💡 Finni: "{p.finni}"
                              </Typography>
                            </FECard>
                            <Button
                              fullWidth
                              variant="contained"
                              color="warning"
                              size="small"
                              onClick={completarPaso}
                            >
                              ✓ Marcar como hecho
                            </Button>
                          </Stack>
                        </Fade>
                      )}
                    </FECard>
                  );
                })}
              </Stack>
            </Stack>
          </Fade>
        )}

        {step === 3 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="success"
                title="¡5/5 acciones completadas!"
                message="Ya tienes tus primeros registros reales en FinEmpoder. ¡Eso es un hábito que empieza hoy!"
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'warning.main' }}>
                <Typography variant="body1" fontWeight={700} sx={{ mb: 1 }}>Mini-reto:</Typography>
                <Typography variant="body2">
                  Registra <b>todos tus gastos de mañana</b> usando tu herramienta favorita.
                  Vuelve a FinEmpoder al final del día y compara.
                </Typography>
              </FECard>
            </Stack>
          </Fade>
        )}
      </Box>
    </LessonShell>
  );
}
