import { useState, useEffect } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade,
  TextField, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

const CONCEPTOS_CLAVE = [
  { emoji: '🐜', titulo: 'Gasto hormiga', desc: 'Pequeñas compras automáticas que suman mucho al mes.' },
  { emoji: '📊', titulo: 'Ingresos fijos vs variables', desc: 'Planea diferente para cada tipo de ingreso.' },
  { emoji: '⚖️', titulo: 'Regla 50-30-20', desc: 'Necesidades / Deseos / Ahorro.' },
  { emoji: '📝', titulo: 'Registro de gastos', desc: 'Lo que no mides, no puedes mejorar.' },
  { emoji: '📅', titulo: 'Balance mensual', desc: 'Ingresos menos gastos: el termómetro de tu mes.' },
  { emoji: '⚡', titulo: 'Priorización en crisis', desc: 'Urgente+Necesario primero.' },
  { emoji: '💭', titulo: 'Gasto emocional', desc: '¿Lo comprarías si te sintieras bien?' },
  { emoji: '🎯', titulo: 'Meta SMART', desc: 'Específica, Medible, Alcanzable, Relevante, Temporal.' },
  { emoji: '🏛️', titulo: 'Herramientas', desc: 'App CONDUSEF, Sheets, FinEmpoder.' },
];

type BudgetData = { totalIngresos?: number; totalGastos?: number; balance?: number } | null;

export default function L15() {
  const [step, setStep] = useState(0);
  const [budgetData, setBudgetData] = useState<BudgetData>(null);
  const [compromisos, setCompromisos] = useState(['', '', '']);
  const [notifDay, setNotifDay] = useState('');
  const [notifHour, setNotifHour] = useState('');
  const [badgeUnlocked, setBadgeUnlocked] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await lessonDataRepository.load<BudgetData>('presupuesto', 'l12_budget');
      setBudgetData(data);
    };
    void load();
  }, []);

  const compromisosFull = compromisos.every((c) => c.trim().length >= 5);
  const presupuestoConfirmado = !!budgetData?.totalIngresos;
  const canComplete = compromisosFull && presupuestoConfirmado;

  const updateCompromiso = (i: number, val: string) => {
    setCompromisos((prev) => prev.map((c, idx) => (idx === i ? val : c)));
  };

  const handleUnlock = async () => {
    await lessonDataRepository.save('presupuesto', 'l15_compromisos', {
      compromisos,
      notifDay,
      notifHour,
      unlockedAt: new Date().toISOString(),
    });
    setBadgeUnlocked(true);
    setStep(5);
  };

  return (
    <LessonShell
      id="L15"
      title="Reto final: Tu presupuesto de este mes, en serio"
      completion={{ ready: canComplete }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={step === 0 ? 0 : step === 1 ? 15 : step === 2 ? 40 : step === 3 ? 65 : step === 4 ? 85 : 100}
          color="warning"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {/* Pantalla 0 — Apertura motivacional */}
        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FECard variant="flat" sx={{ bgcolor: 'warning.light', border: 2, borderColor: 'warning.main', textAlign: 'center', py: 3 }}>
                <Typography variant="h2">🎉</Typography>
                <Typography variant="h4" sx={{ mt: 1 }}>¡El reto final!</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Todo lo que aprendiste en este módulo culmina aquí.
                </Typography>
              </FECard>
              <FinniMessage
                variant="coach"
                title="No es un ejercicio"
                message="Es tu presupuesto real de este mes. Al completar el reto, desbloqueas el badge 'Presupuesto Pro 💰' y accedes al Módulo 2: Ahorro."
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography variant="body1" fontWeight={700} sx={{ mb: 1 }}>El reto tiene 3 partes:</Typography>
                {[
                  'Parte 1: Confirma tu presupuesto de L12',
                  'Parte 2: Establece 3 compromisos concretos',
                  'Parte 3: Activa notificaciones de seguimiento',
                ].map((p) => (
                  <Typography key={p} variant="body2" sx={{ py: 0.5 }}>✓ {p}</Typography>
                ))}
              </FECard>
              <Button fullWidth variant="contained" color="warning" size="large" onClick={() => setStep(1)}>
                ¡Empezar el reto! →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 1 — Parte 1: Presupuesto */}
        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="h4">Parte 1: Tu presupuesto del mes</Typography>
              {presupuestoConfirmado ? (
                <Fade in>
                  <Stack spacing={2}>
                    <FECard variant="flat" sx={{ bgcolor: 'success.light', border: 2, borderColor: 'success.main' }}>
                      <Typography variant="body1" fontWeight={700} sx={{ mb: 1 }}>
                        ✅ Presupuesto confirmado desde Lección 12
                      </Typography>
                      <Stack spacing={0.5}>
                        <Typography variant="body2">Ingresos: <b>${(budgetData?.totalIngresos ?? 0).toLocaleString()}</b></Typography>
                        <Typography variant="body2">Gastos: <b>${(budgetData?.totalGastos ?? 0).toLocaleString()}</b></Typography>
                        <Typography variant="body2">
                          Balance: <b style={{ color: (budgetData?.balance ?? 0) >= 0 ? 'green' : 'red' }}>
                            {(budgetData?.balance ?? 0) >= 0 ? '+' : ''}${(budgetData?.balance ?? 0).toLocaleString()}
                          </b>
                        </Typography>
                      </Stack>
                    </FECard>
                    <FinniMessage
                      variant="coach"
                      title="Validación"
                      message="Tu presupuesto tiene datos reales. ¡Pasemos a los compromisos!"
                    />
                    <Button fullWidth variant="contained" color="warning" size="large" onClick={() => setStep(2)}>
                      Parte 2: Compromisos →
                    </Button>
                  </Stack>
                </Fade>
              ) : (
                <Stack spacing={2}>
                  <FinniMessage
                    variant="coach"
                    title="Necesitas completar L12 primero"
                    message="Ve a la Lección 12 y construye tu presupuesto real. Luego regresa aquí para el reto final."
                  />
                </Stack>
              )}
            </Stack>
          </Fade>
        )}

        {/* Pantalla 2 — Parte 2: Compromisos */}
        {step === 2 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="h4">Parte 2: Tus 3 compromisos</Typography>
              <FinniMessage
                variant="coach"
                title="Sé específico"
                message="Un compromiso vago ('gastaré menos') no funciona. Uno específico ('no gastaré más de $X en cafetería esta semana') sí."
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'info.main', bgcolor: 'info.light' }}>
                <Typography variant="caption" fontWeight={700}>Ejemplos de Finni:</Typography>
                <Typography variant="caption" display="block">• "Esta semana no gastaré más de $X en cafetería"</Typography>
                <Typography variant="caption" display="block">• "Registraré todos mis gastos cada noche antes de dormir"</Typography>
                <Typography variant="caption" display="block">• "Destinaré $X a mi meta de ahorro el día que llegue mi mesada"</Typography>
              </FECard>
              <Stack spacing={2}>
                {compromisos.map((c, i) => (
                  <TextField
                    key={i}
                    label={`Compromiso #${i + 1}`}
                    value={c}
                    onChange={(e) => updateCompromiso(i, e.target.value)}
                    size="small"
                    fullWidth
                    placeholder={`Mi compromiso #${i + 1}...`}
                    multiline
                    rows={2}
                  />
                ))}
              </Stack>
              {compromisosFull && (
                <Fade in>
                  <Button fullWidth variant="contained" color="warning" size="large" onClick={() => setStep(3)}>
                    Parte 3: Notificaciones →
                  </Button>
                </Fade>
              )}
            </Stack>
          </Fade>
        )}

        {/* Pantalla 3 — Parte 3: Notificaciones */}
        {step === 3 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="h4">Parte 3: Recordatorio semanal</Typography>
              <FinniMessage
                variant="coach"
                title="El seguimiento es clave"
                message="Un presupuesto sin revisión semanal es como un GPS que nunca recalcula. ¿Cuándo quieres que Finni te recuerde revisar?"
              />
              <FormControl fullWidth size="small">
                <InputLabel>Día de la semana</InputLabel>
                <Select value={notifDay} onChange={(e) => setNotifDay(e.target.value)} label="Día de la semana">
                  {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((d) => (
                    <MenuItem key={d} value={d}>{d}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Hora</InputLabel>
                <Select value={notifHour} onChange={(e) => setNotifHour(e.target.value)} label="Hora">
                  {['8:00 AM', '10:00 AM', '12:00 PM', '6:00 PM', '8:00 PM', '10:00 PM'].map((h) => (
                    <MenuItem key={h} value={h}>{h}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              {notifDay && notifHour && (
                <Fade in>
                  <FECard variant="flat" sx={{ bgcolor: 'info.light', border: 1, borderColor: 'info.main' }}>
                    <Typography variant="body2">
                      📲 Recordatorio: cada <b>{notifDay}</b> a las <b>{notifHour}</b> — "¿Cómo vas con tu presupuesto esta semana?"
                    </Typography>
                  </FECard>
                </Fade>
              )}
              <Button
                fullWidth
                variant="contained"
                color="warning"
                size="large"
                onClick={() => setStep(4)}
              >
                ¡Listo! Desbloquear badge →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 4 — Confirmación final */}
        {step === 4 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="h4">Resumen del reto</Typography>
              <FECard variant="flat" sx={{ border: 1, borderColor: 'success.main', bgcolor: 'success.light' }}>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>✅ Partes completadas:</Typography>
                <Typography variant="body2">1. Presupuesto real confirmado</Typography>
                <Typography variant="body2">2. 3 compromisos específicos establecidos</Typography>
                <Typography variant="body2">3. Recordatorio semanal configurado{notifDay ? `: ${notifDay} ${notifHour}` : ''}</Typography>
              </FECard>
              <FinniMessage
                variant="coach"
                title="¿Todo listo?"
                message="Al confirmar, tu badge 'Presupuesto Pro 💰' se desbloqueará y podrás acceder al Módulo 2: Ahorro."
              />
              <Button
                fullWidth
                variant="contained"
                color="warning"
                size="large"
                onClick={() => void handleUnlock()}
                disabled={!canComplete}
              >
                🏆 ¡Desbloquear Presupuesto Pro!
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 5 — Badge desbloqueado */}
        {step === 5 && badgeUnlocked && (
          <Fade in>
            <Stack spacing={3}>
              <FECard variant="flat" sx={{ textAlign: 'center', py: 4, bgcolor: 'warning.light', border: 3, borderColor: 'warning.main' }}>
                <EmojiEventsIcon sx={{ fontSize: 72, color: 'warning.main' }} />
                <Typography variant="h3" sx={{ mt: 1 }}>Presupuesto Pro 💰</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Badge desbloqueado · Módulo 1 completado
                </Typography>
              </FECard>
              <FinniMessage
                variant="success"
                title="¡Lo lograste!"
                message="Ahora eres alguien que tiene un presupuesto. Eso ya te pone adelante de la mayoría."
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography variant="body1" fontWeight={700} sx={{ mb: 1.5 }}>Lo que aprendiste en Módulo 1:</Typography>
                <Stack spacing={1}>
                  {CONCEPTOS_CLAVE.map((c) => (
                    <Stack key={c.titulo} direction="row" spacing={1.5} alignItems="flex-start">
                      <Typography variant="body2">{c.emoji}</Typography>
                      <Box>
                        <Typography variant="body2" fontWeight={700}>{c.titulo}</Typography>
                        <Typography variant="caption" color="text.secondary">{c.desc}</Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </FECard>
              <Button
                fullWidth
                variant="contained"
                color="success"
                size="large"
                href="/app/ahorro"
              >
                🌱 Comenzar Módulo 2: Ahorro
              </Button>
            </Stack>
          </Fade>
        )}
      </Box>
    </LessonShell>
  );
}
