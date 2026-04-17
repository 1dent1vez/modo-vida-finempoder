import { useState, useEffect } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade, TextField,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

type MetaData = { nombre?: string; monto?: number; aportacionMensual?: number } | null;
type PlanData = { totalPlanado?: number; horizon?: number } | null;
type RetoData = { totalAcumulado?: number; dayAmounts?: number[] } | null;

const CONCEPTOS_CLAVE = [
  { emoji: '🔄', titulo: 'Ahorro primero', desc: 'Apartar antes de gastar es el habito mas poderoso.' },
  { emoji: '🏦', titulo: 'Ahorro formal', desc: 'Proteccion IPAB + rendimientos + historial financiero.' },
  { emoji: '🎯', titulo: 'Meta con nombre', desc: 'El ahorro sin proposito no dura.' },
  { emoji: '📅', titulo: 'Plan semanal', desc: 'La constancia supera la cantidad.' },
  { emoji: '💹', titulo: 'Interes compuesto', desc: 'El tiempo es tu mejor aliado para crecer.' },
  { emoji: '🛡️', titulo: 'Fondo de emergencias', desc: 'Tu red de seguridad antes de invertir.' },
];

export default function L15() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [metaData, setMetaData] = useState<MetaData>(null);
  const [planData, setPlanData] = useState<PlanData>(null);
  const [retoData, setRetoData] = useState<RetoData>(null);

  // Parte 1 — Monto total
  const [montoTotal, setMontoTotal] = useState('');
  const [montoConfirmado, setMontoConfirmado] = useState(false);

  // Parte 2 — Autoevaluacion
  const [semanasHabito, setSemanasHabito] = useState('');
  const [masDificil, setMasDificil] = useState('');
  const [cambiaria, setCambiaria] = useState('');

  // Parte 3 — Proxima meta
  const [proximaMeta, setProximaMeta] = useState('');
  const [badgeUnlocked, setBadgeUnlocked] = useState(false);

  useEffect(() => {
    const load = async () => {
      const meta = await lessonDataRepository.load<MetaData>('ahorro', 'l5_meta');
      const plan = await lessonDataRepository.load<PlanData>('ahorro', 'l6_plan');
      const reto = await lessonDataRepository.load<RetoData>('ahorro', 'l11_reto');
      setMetaData(meta);
      setPlanData(plan);
      setRetoData(reto);
      if (reto?.totalAcumulado) setMontoTotal(String(reto.totalAcumulado));
      setLoading(false);
    };
    void load();
  }, []);

  const totalAcumulado = retoData?.totalAcumulado ?? 0;
  const totalPlanado = planData?.totalPlanado ?? 0;
  const montoNum = parseFloat(montoTotal) || 0;
  const autoEvalValid = semanasHabito.trim().length > 0 && masDificil.trim().length >= 5 && cambiaria.trim().length >= 5;
  const canComplete = montoConfirmado && autoEvalValid;

  const handleUnlock = async () => {
    await lessonDataRepository.save('ahorro', 'l15_cierre', {
      montoTotalAhorrado: montoNum,
      semanasHabito,
      masDificil,
      cambiaria,
      proximaMeta,
      savedAt: new Date().toISOString(),
    });
    setBadgeUnlocked(true);
    setStep(5);
  };

  const progress = step === 0 ? 0 : step === 1 ? 15 : step === 2 ? 35 : step === 3 ? 60 : step === 4 ? 85 : 100;

  if (loading) {
    return (
      <LessonShell id="L15" title="Reto final: cierra tu modulo de ahorro" completion={{ ready: false }}>
        <Typography variant="body2" color="text.secondary">Cargando datos...</Typography>
      </LessonShell>
    );
  }

  return (
    <LessonShell
      id="L15"
      title="Reto final: cierra tu modulo de ahorro"
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
              <FECard variant="flat" sx={{ bgcolor: 'success.light', border: 2, borderColor: 'success.main', textAlign: 'center', py: 3 }}>
                <Typography variant="h2">🌱</Typography>
                <Typography variant="h4" sx={{ mt: 1 }}>¡El reto final!</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Modulo 2 · Ahorro
                </Typography>
              </FECard>
              <FinniMessage
                variant="coach"
                title="Hoy no solo cierras el modulo"
                message="Demuestras que el habito de ahorro ya es parte de ti."
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>En este modulo:</Typography>
                {[
                  '✅ Definiste tu meta de ahorro con proposito y plazo',
                  '✅ Construiste tu plan semana a semana',
                  '✅ Conociste las herramientas del ahorro formal en Mexico',
                  '✅ Completaste el micro-reto de 3 dias',
                  '✅ Aprendiste sobre interes compuesto, IPAB y seguros',
                  '✅ Registraste tu ahorro de forma constante',
                ].map((item) => (
                  <Typography key={item} variant="body2" sx={{ py: 0.25 }}>{item}</Typography>
                ))}
              </FECard>
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>El reto tiene 3 partes:</Typography>
                <Typography variant="body2">Parte 1: Confirma tu monto total ahorrado</Typography>
                <Typography variant="body2">Parte 2: Autoevaluacion honesta (3 preguntas)</Typography>
                <Typography variant="body2">Parte 3: Define tu proxima meta + acceso a Modulo 3</Typography>
              </FECard>
              <Button fullWidth variant="contained" color="success" size="large" onClick={() => setStep(1)}>
                ¡Empezar el reto final! →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 1 — Parte 1: Monto total */}
        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="h4">Parte 1: Tu ahorro del modulo</Typography>
              {totalAcumulado > 0 && (
                <FECard variant="flat" sx={{ border: 1, borderColor: 'success.main', bgcolor: 'success.light' }}>
                  <Typography variant="body2" fontWeight={700}>
                    ✅ Datos del micro-reto precargados: ${totalAcumulado.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Puedes ajustar si ahorraste mas por otros medios
                  </Typography>
                </FECard>
              )}
              <TextField
                label="Monto total ahorrado durante el modulo ($)"
                type="number"
                value={montoTotal}
                onChange={(e) => setMontoTotal(e.target.value)}
                fullWidth
                size="small"
                helperText="Cualquier monto es valido. Lo importante es el habito."
                inputProps={{ min: 0 }}
              />
              {metaData?.nombre && (
                <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                  <Typography variant="caption">Tu meta: "{metaData.nombre}" — ${metaData.monto?.toLocaleString()}</Typography>
                  {metaData.monto && montoNum > 0 && (
                    <Typography variant="caption" color="success.dark" display="block">
                      Avance: {Math.min(100, (montoNum / metaData.monto) * 100).toFixed(0)}% de tu meta
                    </Typography>
                  )}
                </FECard>
              )}
              {parseFloat(montoTotal) >= 0 && montoTotal !== '' && (
                <Fade in>
                  <Button
                    fullWidth variant="contained" color="success" size="large"
                    onClick={() => { setMontoConfirmado(true); setStep(2); }}
                  >
                    Confirmar y continuar →
                  </Button>
                </Fade>
              )}
            </Stack>
          </Fade>
        )}

        {/* Pantalla 2 — Parte 2: Autoevaluacion */}
        {step === 2 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="h4">Parte 2: Autoevaluacion honesta</Typography>
              <FinniMessage
                variant="coach"
                title="No hay respuestas incorrectas"
                message="Esta autoevaluacion es solo para ti. La honestidad te ayuda a mejorar."
              />
              <Stack spacing={1}>
                {[
                  { label: '¿Cuantas semanas mantuviste el habito?', val: semanasHabito, set: setSemanasHabito, placeholder: 'Ej: 3 semanas, o "no lo segui formalmente"' },
                  { label: '¿Que te resulto mas dificil?', val: masDificil, set: setMasDificil, placeholder: 'Describe tu mayor reto...' },
                  { label: '¿Que cambiarias para el proximo mes?', val: cambiaria, set: setCambiaria, placeholder: 'Un ajuste concreto...' },
                ].map((field) => (
                  <TextField
                    key={field.label}
                    label={field.label}
                    multiline
                    rows={2}
                    value={field.val}
                    onChange={(e) => field.set(e.target.value)}
                    fullWidth
                    placeholder={field.placeholder}
                    size="small"
                  />
                ))}
              </Stack>
              {autoEvalValid && (
                <Fade in>
                  <Button fullWidth variant="contained" color="success" size="large" onClick={() => setStep(3)}>
                    Parte 3: Proxima meta →
                  </Button>
                </Fade>
              )}
            </Stack>
          </Fade>
        )}

        {/* Pantalla 3 — Parte 3: Proxima meta + M3 */}
        {step === 3 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="h4">Parte 3: Tu proxima meta</Typography>
              <FinniMessage
                variant="coach"
                title="El Modulo 3 te espera"
                message="¿Podrias invertir parte de ese ahorro? En el Modulo 3 de Inversion te mostraremos como hacer crecer lo que ahorras."
              />
              <TextField
                label="Meta de ahorro para el siguiente mes"
                value={proximaMeta}
                onChange={(e) => setProximaMeta(e.target.value)}
                fullWidth
                size="small"
                placeholder="Ej: Seguir ahorrando para mi laptop..."
              />
              <Button fullWidth variant="contained" color="success" size="large" onClick={() => setStep(4)}>
                Ver resumen final →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 4 — Resumen + boton de desbloqueo */}
        {step === 4 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="h4">Resumen del reto</Typography>
              <FECard variant="flat" sx={{ border: 1, borderColor: 'success.main', bgcolor: 'success.light' }}>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>✅ Partes completadas:</Typography>
                <Typography variant="body2">1. Monto total confirmado: ${montoNum.toLocaleString()}</Typography>
                <Typography variant="body2">2. Autoevaluacion completada ({semanasHabito})</Typography>
                <Typography variant="body2">3. Proxima meta definida{proximaMeta ? `: "${proximaMeta}"` : ''}</Typography>
              </FECard>
              {totalPlanado > 0 && (
                <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption">Planeado:</Typography>
                    <Typography variant="caption">${totalPlanado.toLocaleString()}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption">Real:</Typography>
                    <Typography variant="caption" color={montoNum >= totalPlanado * 0.5 ? 'success.main' : 'warning.main'}>
                      ${montoNum.toLocaleString()}
                    </Typography>
                  </Stack>
                </FECard>
              )}
              <Button
                fullWidth
                variant="contained"
                color="success"
                size="large"
                onClick={() => void handleUnlock()}
                disabled={!canComplete}
              >
                🌱 ¡Desbloquear Ahorrador Constante!
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 5 — Badge desbloqueado */}
        {step === 5 && badgeUnlocked && (
          <Fade in>
            <Stack spacing={3}>
              <FECard variant="flat" sx={{ textAlign: 'center', py: 4, bgcolor: 'success.light', border: 3, borderColor: 'success.main' }}>
                <EmojiEventsIcon sx={{ fontSize: 72, color: 'success.main' }} />
                <Typography variant="h3" sx={{ mt: 1 }}>Ahorrador Constante 🌱</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Badge desbloqueado · Modulo 2 completado
                </Typography>
              </FECard>
              <FinniMessage
                variant="success"
                title="¡Lo lograste!"
                message="Ahora tienes un habito que muchos adultos nunca desarrollan. Eso vale mas que cualquier cantidad que hayas ahorrado."
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1.5 }}>
                  Lo que aprendiste en Modulo 2:
                </Typography>
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
                href="/app/inversion"
              >
                📈 Comenzar Modulo 3: Inversion
              </Button>
            </Stack>
          </Fade>
        )}
      </Box>
    </LessonShell>
  );
}
