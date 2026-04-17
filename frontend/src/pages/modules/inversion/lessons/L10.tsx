import { useState } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade,
  Chip, Paper, TextField,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';

const SENALES = [
  { emoji: '🚨', titulo: 'Rendimientos garantizados muy altos', desc: 'Si te ofrecen 20% mensual o más, es una estafa. No existe inversión legal con ese rendimiento garantizado en México.' },
  { emoji: '🚨', titulo: 'Urgencia artificial', desc: '"Solo por hoy", "oferta exclusiva", "cierra hoy o pierdes el cupo". La presión de tiempo es una técnica de manipulación.' },
  { emoji: '🚨', titulo: 'No puedo explicarte cómo funciona', desc: 'Si no entiendes cómo genera el rendimiento, no inviertas. Un instrumento legítimo siempre se puede explicar.' },
  { emoji: '🚨', titulo: 'No está regulada por CNBV', desc: 'En México, todas las instituciones que captan inversiones deben estar autorizadas por la CNBV. Verifica siempre.' },
  { emoji: '🚨', titulo: 'Reclutamiento de más inversores', desc: 'Si te piden traer amigos para obtener más rendimiento: es un esquema Ponzi. Tus amigos también perderán.' },
];

const CASOS = [
  {
    titulo: 'Plataforma cripto con 15% mensual garantizado',
    descripcion: 'Plataforma de cripto que promete 15% mensual garantizado. Tiene app, página web profesional y testimonios de "usuarios felices".',
    senales: ['Rendimiento imposible (180% anual)', 'Sin registro CNBV', 'Testimonios no verificables'],
    resultado: 'La plataforma desapareció. Pérdida total del capital de todos los inversores.',
    decisiones: ['Invertiría', 'No invertiría'],
    correcta: 1,
  },
  {
    titulo: 'Fondo exclusivo sin regulación',
    descripcion: 'Un amigo te invita a una "inversión exclusiva" en un fondo que no está en la lista de la CNBV. Solo hay cupo para 10 personas más.',
    senales: ['Urgencia artificial (cupo limitado)', 'Sin regulación CNBV', 'Acceso por invitación (señal de Ponzi)'],
    resultado: 'El amigo también perdió — fue una víctima más del esquema.',
    decisiones: ['Invertiría', 'No invertiría'],
    correcta: 1,
  },
  {
    titulo: 'App con 3% semanal "sin riesgo"',
    descripcion: 'App con rendimiento del 3% semanal "sin riesgo", descargable en Google Play, con 50,000 descargas.',
    senales: ['Rendimiento imposible (156% anual)', 'Cero riesgo declarado es imposible', 'Sin regulación confirmable'],
    resultado: 'La app desapareció después de 4 meses llevándose todo el dinero.',
    decisiones: ['Invertiría', 'No invertiría'],
    correcta: 1,
  },
];

export default function L10() {
  const [step, setStep] = useState(0);
  const [senal, setSenal] = useState<number | null>(null);
  const [respuestasCasos, setRespuestasCasos] = useState<(number | null)[]>(Array(3).fill(null));
  const [razonesUsuario, setRazonesUsuario] = useState<string[]>(['', '', '']);
  const [casoActivo, setCasoActivo] = useState(0);

  const casosCompletos = respuestasCasos.every((r) => r !== null);

  const responderCaso = (ci: number, di: number) => {
    setRespuestasCasos((prev) => prev.map((r, i) => (i === ci ? di : r)));
  };

  const updateRazon = (i: number, val: string) => {
    setRazonesUsuario((prev) => prev.map((r, idx) => (idx === i ? val : r)));
  };

  return (
    <LessonShell
      id="L10"
      title="Cuidado: no todo lo que brilla es inversión"
      completion={{ ready: casosCompletos }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={(step / 2) * 100}
          color="info"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {/* Pantalla 0 — Las 5 señales de alerta */}
        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <Paper sx={{ p: 2, borderRadius: 3, bgcolor: 'error.light', border: 2, borderColor: 'error.main' }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <WarningAmberIcon color="error" />
                  <Typography fontWeight={800} color="error.dark">Alerta</Typography>
                </Stack>
                <Typography variant="body2">
                  Cada año, miles de mexicanos pierden sus ahorros en esquemas fraudulentos que prometen rendimientos imposibles.
                  Hoy aprendes a detectarlos antes de caer.
                </Typography>
              </Paper>
              <Typography variant="h4" fontWeight={700}>Las 5 señales de fraude</Typography>
              <Typography variant="body2" color="text.secondary">Toca cada señal para leer más:</Typography>
              <Stack spacing={1.5}>
                {SENALES.map((s, i) => (
                  <Paper
                    key={i}
                    onClick={() => setSenal(senal === i ? null : i)}
                    sx={{
                      p: 2, borderRadius: 3, cursor: 'pointer',
                      border: 2, borderColor: senal === i ? 'error.main' : 'error.light',
                      bgcolor: senal === i ? 'error.light' : 'background.paper',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Typography variant="body1" sx={{ flexShrink: 0 }}>{s.emoji}</Typography>
                      <Box>
                        <Typography variant="body2" fontWeight={700}>{s.titulo}</Typography>
                        {senal === i && (
                          <Fade in>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{s.desc}</Typography>
                          </Fade>
                        )}
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
              <FECard variant="flat" sx={{ bgcolor: 'error.light', border: 2, borderColor: 'error.main', textAlign: 'center' }}>
                <Typography fontWeight={800}>Si suena demasiado bueno para ser verdad, no es verdad.</Typography>
              </FECard>
              <Button fullWidth variant="contained" color="error" size="large" onClick={() => setStep(1)}>
                Practicar con casos reales →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 1 — Casos interactivos */}
        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="h4" fontWeight={700}>¿Lo harías o no?</Typography>
              <Typography variant="body2" color="text.secondary">3 casos basados en fraudes reales en México:</Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                {CASOS.map((_, i) => (
                  <Chip
                    key={i}
                    label={`Caso ${i + 1}`}
                    onClick={() => setCasoActivo(i)}
                    variant={casoActivo === i ? 'filled' : 'outlined'}
                    color={respuestasCasos[i] !== null ? (respuestasCasos[i] === CASOS[i]!.correcta ? 'success' : 'error') : casoActivo === i ? 'warning' : 'default'}
                  />
                ))}
              </Stack>
              {CASOS.map((caso, ci) => {
                const resp = respuestasCasos[ci];
                const respondido = resp !== null;
                const correcto = resp === caso.correcta;
                return (
                  <Box key={ci} sx={{ display: casoActivo === ci ? 'block' : 'none' }}>
                    <FECard variant="flat" sx={{ border: 1, borderColor: respondido ? (correcto ? 'success.main' : 'error.main') : 'divider' }}>
                      <Typography fontWeight={700} sx={{ mb: 1 }}>{caso.titulo}</Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>{caso.descripcion}</Typography>
                      {!respondido ? (
                        <Stack spacing={1.5}>
                          <TextField
                            fullWidth
                            size="small"
                            multiline
                            rows={2}
                            placeholder="¿Por qué tomarías esta decisión?"
                            value={razonesUsuario[ci]}
                            onChange={(e) => updateRazon(ci, e.target.value)}
                          />
                          <Stack direction="row" spacing={1}>
                            {caso.decisiones.map((d, di) => (
                              <Button
                                key={di}
                                variant="outlined"
                                color={di === 0 ? 'success' : 'error'}
                                onClick={() => responderCaso(ci, di)}
                                sx={{ flex: 1 }}
                              >
                                {d}
                              </Button>
                            ))}
                          </Stack>
                        </Stack>
                      ) : (
                        <Fade in>
                          <Stack spacing={2}>
                            <Chip
                              label={correcto ? '✅ Decisión correcta' : '❌ Esta era una trampa'}
                              color={correcto ? 'success' : 'error'}
                            />
                            <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: 'grey.100' }}>
                              <Typography variant="caption" fontWeight={700}>Señales de alerta:</Typography>
                              {caso.senales.map((s) => (
                                <Typography key={s} variant="caption" display="block" color="error.main">🚨 {s}</Typography>
                              ))}
                            </Paper>
                            <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: 'error.light' }}>
                              <Typography variant="caption" fontWeight={700}>Lo que ocurrió:</Typography>
                              <Typography variant="caption" display="block">{caso.resultado}</Typography>
                            </Paper>
                            {ci < CASOS.length - 1 && (
                              <Button variant="outlined" color="info" onClick={() => setCasoActivo(ci + 1)}>
                                Siguiente caso →
                              </Button>
                            )}
                          </Stack>
                        </Fade>
                      )}
                    </FECard>
                  </Box>
                );
              })}
              {casosCompletos && (
                <Fade in>
                  <Stack spacing={2}>
                    <FECard variant="flat" sx={{ bgcolor: 'success.light', border: 2, borderColor: 'success.main', textAlign: 'center' }}>
                      <Typography variant="h3">🛡️</Typography>
                      <Typography fontWeight={800}>¡Los 3 casos completados!</Typography>
                      <Typography variant="body2">Ya sabes detectar fraudes financieros. Ese conocimiento vale más que cualquier inversión.</Typography>
                    </FECard>
                    <FinniMessage
                      variant="coach"
                      title="¿Tienes alguna inversión activa que no estás seguro si es legítima?"
                      message="Verifica en CNBV.gob.mx antes de aportar más dinero. Si no está en el registro, no inviertas."
                    />
                    <Paper sx={{ p: 2, borderRadius: 3, bgcolor: 'info.light' }}>
                      <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>Recursos para reportar fraudes:</Typography>
                      <Typography variant="body2">📞 CONDUSEF: 800-999-8080</Typography>
                      <Typography variant="body2">🌐 CNBV.gob.mx → Verificar institución</Typography>
                    </Paper>
                  </Stack>
                </Fade>
              )}
            </Stack>
          </Fade>
        )}
      </Box>
    </LessonShell>
  );
}
