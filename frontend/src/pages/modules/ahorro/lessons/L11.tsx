import { useState } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade, Chip, TextField,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

const FINNI_MSGS = [
  '¡Primer dia completado! Ya llevas {monto} hacia tu meta.',
  '¡Dos dias seguidos! Estas construyendo algo real.',
  '¡Lo lograste! Tres dias seguidos. Eso ya es el inicio de un habito real.',
];

export default function L11() {
  const [step, setStep] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const [dayAmounts, setDayAmounts] = useState<string[]>(['', '', '']);
  const [dayCompleted, setDayCompleted] = useState<boolean[]>([false, false, false]);
  const [badgeUnlocked, setBadgeUnlocked] = useState(false);
  const [extendReto, setExtendReto] = useState(false);

  const completedDays = dayCompleted.filter(Boolean).length;
  const allDone = completedDays === 3;
  const totalAcumulado = dayAmounts.reduce((sum, v) => sum + (parseFloat(v) || 0), 0);

  const completeDay = async (idx: number) => {
    const amount = parseFloat(dayAmounts[idx]) || 0;
    if (amount <= 0) return;

    const newCompleted = [...dayCompleted];
    newCompleted[idx] = true;
    setDayCompleted(newCompleted);

    if (newCompleted.filter(Boolean).length === 3) {
      const total = dayAmounts.reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
      await lessonDataRepository.save('ahorro', 'l11_reto', {
        dayAmounts: dayAmounts.map((v) => parseFloat(v) || 0),
        totalAcumulado: total,
        completedAt: new Date().toISOString(),
      });
      setBadgeUnlocked(true);
      setStep(3);
    }
  };

  const progress = step === 0 ? 0 : step === 1 ? 25 : step === 2 ? 50 : 100;

  return (
    <LessonShell
      id="L11"
      title="Micro-reto: ahorra 3 dias seguidos"
      completion={{ ready: allDone }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          color="success"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {/* Pantalla 0 — Apertura motivacional */}
        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="coach"
                title="¡Es hora de pasar a la practica!"
                message="Este micro-reto es simple: aparta algo cada dia durante 3 dias. No importa si son $10 o $100. Lo que importa es el habito."
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'success.main' }}>
                <Typography variant="body1" fontWeight={700} sx={{ mb: 1 }}>Como funciona el reto:</Typography>
                <Stack spacing={0.75}>
                  <Typography variant="body2">1. Aparta un monto (el que puedas) cada dia</Typography>
                  <Typography variant="body2">2. Registralo aqui en FinEmpoder</Typography>
                  <Typography variant="body2">3. Recibe confirmacion de Finni</Typography>
                </Stack>
                <Chip label="Badge: Constancia de 3 🔥" color="warning" sx={{ mt: 1.5 }} />
              </FECard>
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>Reglas:</Typography>
                <Typography variant="body2">• No hay monto minimo. $5 cuenta.</Typography>
                <Typography variant="body2">• Puede ser transferencia, alcancia fisica, o efectivo.</Typography>
                <Typography variant="body2">• Si fallas un dia, el contador reinicia. Sin culpa.</Typography>
              </FECard>
              <Button
                fullWidth
                variant="contained"
                color="success"
                size="large"
                onClick={() => { setAccepted(true); setStep(1); }}
              >
                ✅ Acepto el reto →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 1 — Contador de dias */}
        {accepted && step >= 1 && step < 3 && (
          <Fade in>
            <Stack spacing={3}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body1" fontWeight={700}>Tu progreso:</Typography>
                <Chip
                  label={`${completedDays}/3 dias`}
                  color={completedDays === 3 ? 'success' : completedDays > 0 ? 'warning' : 'default'}
                />
              </Stack>

              {/* Contador circular visual */}
              <FECard variant="flat" sx={{ textAlign: 'center', py: 2, border: 2, borderColor: 'success.main', bgcolor: 'success.light' }}>
                <Typography variant="h2">{completedDays}/3</Typography>
                <Typography variant="body2" color="text.secondary">dias consecutivos</Typography>
              </FECard>

              {/* Registros por dia */}
              <Stack spacing={2}>
                {[0, 1, 2].map((idx) => (
                  <FECard
                    key={idx}
                    variant="flat"
                    sx={{
                      border: 1,
                      borderColor: dayCompleted[idx] ? 'success.main' : idx === completedDays ? 'warning.main' : 'divider',
                      bgcolor: dayCompleted[idx] ? 'success.light' : 'background.paper',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="body2" fontWeight={700}>Dia {idx + 1}</Typography>
                      {dayCompleted[idx] && <Chip label="✅ Completado" color="success" size="small" />}
                    </Stack>

                    {dayCompleted[idx] ? (
                      <Stack spacing={0.5}>
                        <Typography variant="body2" color="success.dark">
                          ${parseFloat(dayAmounts[idx] || '0').toLocaleString()} apartados
                        </Typography>
                        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                          {FINNI_MSGS[idx].replace('{monto}', `$${parseFloat(dayAmounts[idx] || '0').toLocaleString()}`)}
                        </Typography>
                      </Stack>
                    ) : idx === completedDays ? (
                      <Stack spacing={1}>
                        <Typography variant="caption" color="text.secondary">
                          ¿Cuanto apartas hoy?
                        </Typography>
                        <Stack direction="row" spacing={1.5}>
                          <TextField
                            size="small"
                            type="number"
                            placeholder="$0"
                            value={dayAmounts[idx]}
                            onChange={(e) => {
                              const updated = [...dayAmounts];
                              updated[idx] = e.target.value;
                              setDayAmounts(updated);
                            }}
                            inputProps={{ min: 1 }}
                            sx={{ flex: 1 }}
                          />
                          <Button
                            variant="contained"
                            color="success"
                            onClick={() => void completeDay(idx)}
                            disabled={!dayAmounts[idx] || parseFloat(dayAmounts[idx]) <= 0}
                          >
                            ✓
                          </Button>
                        </Stack>
                      </Stack>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Completa el dia {idx} primero
                      </Typography>
                    )}
                  </FECard>
                ))}
              </Stack>

              {completedDays > 0 && !allDone && (
                <FECard variant="flat" sx={{ bgcolor: 'success.light', border: 1, borderColor: 'success.main', textAlign: 'center' }}>
                  <Typography variant="body2" fontWeight={700}>
                    Total acumulado: ${totalAcumulado.toLocaleString()}
                  </Typography>
                </FECard>
              )}
            </Stack>
          </Fade>
        )}

        {/* Pantalla 3 — Badge desbloqueado */}
        {step === 3 && badgeUnlocked && (
          <Fade in>
            <Stack spacing={3}>
              <FECard variant="flat" sx={{ textAlign: 'center', py: 4, bgcolor: 'warning.light', border: 3, borderColor: 'warning.main' }}>
                <EmojiEventsIcon sx={{ fontSize: 72, color: 'warning.main' }} />
                <Typography variant="h3" sx={{ mt: 1 }}>Constancia de 3 🔥</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Badge desbloqueado · 3 dias consecutivos
                </Typography>
                <Typography variant="body1" fontWeight={700} sx={{ mt: 1 }}>
                  Total ahorrado: ${totalAcumulado.toLocaleString()}
                </Typography>
              </FECard>
              <FinniMessage
                variant="success"
                title="3 dias seguidos. Eso ya es el inicio de un habito real."
                message="La ciencia dice que los habitos comienzan a formarse con repeticion constante. Acabas de dar el primer paso."
              />
              {!extendReto && (
                <FECard variant="flat" sx={{ border: 1, borderColor: 'success.main' }}>
                  <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                    ¿Quieres continuar el reto 7 dias mas?
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button variant="contained" color="success" onClick={() => setExtendReto(true)} sx={{ flex: 1 }}>
                      ¡Si, continuar!
                    </Button>
                    <Button variant="outlined" color="inherit" sx={{ flex: 1 }}>
                      No por ahora
                    </Button>
                  </Stack>
                </FECard>
              )}
              {extendReto && (
                <Fade in>
                  <FECard variant="flat" sx={{ border: 1, borderColor: 'success.main', bgcolor: 'success.light', textAlign: 'center' }}>
                    <Typography variant="body2" fontWeight={700}>
                      ¡Excelente! Sigue registrando tus ahorros en las proximas lecciones.
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
