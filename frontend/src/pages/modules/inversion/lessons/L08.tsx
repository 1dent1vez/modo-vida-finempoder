import { useState } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade,
  Paper, Chip,
} from '@mui/material';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

type PerfilTipo = 'conservador' | 'moderado' | 'agresivo';

const PERFILES = {
  conservador: {
    nombre: 'Conservador',
    emoji: '🛡️',
    desc: 'Prioriza no perder dinero sobre ganar mucho. Prefiere rendimientos bajos pero seguros.',
    instrumentos: ['CETES 28 días', 'Depósito bancario sin comisión', 'Fondo de deuda gubernamental'],
    fortaleza: 'Alta estabilidad, baja ansiedad, ideal para plazos cortos.',
    riesgo: 'Puede perder poder adquisitivo frente a la inflación si los rendimientos son bajos.',
    color: 'success',
  },
  moderado: {
    nombre: 'Moderado',
    emoji: '⚖️',
    desc: 'Acepta algo de riesgo a cambio de mayores rendimientos. Mezcla deuda y acciones.',
    instrumentos: ['Fondo balanceado CNBV', 'CETES 91 días + fondo de acciones', 'FIBRAs'],
    fortaleza: 'Balance entre seguridad y crecimiento. Horizonte mediano.',
    riesgo: 'Puede ver caídas temporales. Requiere paciencia para esperar la recuperación.',
    color: 'warning',
  },
  agresivo: {
    nombre: 'Agresivo (Dinámico)',
    emoji: '🚀',
    desc: 'Acepta pérdidas temporales por el potencial de ganar más a largo plazo. Alta tolerancia.',
    instrumentos: ['Acciones BMV via GBM+', 'Fondo de renta variable', 'ETFs internacionales vía plataforma autorizada'],
    fortaleza: 'Mayor potencial de rendimiento a largo plazo.',
    riesgo: 'Alta volatilidad. Puede ver pérdidas significativas a corto plazo.',
    color: 'error',
  },
};

const PREGUNTAS = [
  {
    texto: '¿Cómo reaccionarías si tu inversión bajara un 15%?',
    opciones: ['Vendería de inmediato', 'Esperaría a que se recupere', 'Compraría más aprovechando el precio'],
    pesos: [1, 2, 3],
  },
  {
    texto: '¿Para cuándo necesitas el dinero que invertirías?',
    opciones: ['Menos de 1 año', '1-3 años', 'Más de 3 años'],
    pesos: [1, 2, 3],
  },
  {
    texto: '¿Cuánto de tu patrimonio puedes poner en riesgo?',
    opciones: ['Muy poco', 'Algo', 'Una parte significativa'],
    pesos: [1, 2, 3],
  },
  {
    texto: '¿Tienes fondo de emergencias cubierto?',
    opciones: ['No', 'Parcialmente', 'Sí, completo'],
    pesos: [1, 2, 3],
  },
  {
    texto: '¿Cómo describirías tu conocimiento financiero actual?',
    opciones: ['Básico', 'Intermedio', 'Avanzado'],
    pesos: [1, 2, 3],
  },
  {
    texto: '¿Ganar $500 seguros o apostar a $1,500 con 50% de probabilidad?',
    opciones: ['Los $500 seguros', 'Depende del contexto', 'La apuesta'],
    pesos: [1, 2, 3],
  },
  {
    texto: '¿Con qué frecuencia revisarías tu inversión?',
    opciones: ['Todos los días', 'Una vez al mes', 'Pocas veces al año'],
    pesos: [1, 2, 3],
  },
  {
    texto: '¿Cuál es tu objetivo principal al invertir?',
    opciones: ['Proteger de la inflación', 'Crecer moderadamente', 'Maximizar rendimiento'],
    pesos: [1, 2, 3],
  },
];

function calcularPerfil(respuestas: (number | null)[]): PerfilTipo {
  const total = respuestas.reduce<number>((acc, r, i) => {
    if (r === null) return acc;
    return acc + (PREGUNTAS[i]!.pesos[r] ?? 1);
  }, 0);
  if (total <= 12) return 'conservador';
  if (total <= 19) return 'moderado';
  return 'agresivo';
}

export default function L08() {
  const [step, setStep] = useState(0);
  const [respuestas, setRespuestas] = useState<(number | null)[]>(Array(8).fill(null));
  const [guardado, setGuardado] = useState(false);

  const respondidas = respuestas.filter((r) => r !== null).length;
  const cuestionarioCompleto = respuestas.every((r) => r !== null);
  const perfil = cuestionarioCompleto ? calcularPerfil(respuestas) : null;
  const perfilData = perfil ? PERFILES[perfil] : null;
  const nivelRiesgo = respondidas > 0
    ? Math.round((respuestas.reduce<number>((acc, r, i) => acc + (r !== null ? (PREGUNTAS[i]!.pesos[r] ?? 1) : 1.5), 0) / (8 * 3)) * 100)
    : 0;

  const responder = (qi: number, oi: number) => {
    setRespuestas((prev) => prev.map((r, i) => (i === qi ? oi : r)));
  };

  const handleGuardar = async () => {
    if (!perfil) return;
    await lessonDataRepository.save('inversion', 'l08_perfil_riesgo', {
      perfil,
      respuestas,
      guardadoEn: new Date().toISOString(),
    });
    setGuardado(true);
  };

  return (
    <LessonShell
      id="L08"
      title="¿Qué tipo de inversionista eres? Conoce tu perfil"
      completion={{ ready: cuestionarioCompleto && guardado }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={(step / 2) * 100}
          color="info"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {/* Pantalla 0 — Los 3 perfiles */}
        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="coach"
                title="¿Cómo reaccionarías si tu inversión bajara un 20%?"
                message="¿Dormirías tranquilo? ¿Venderías de pánico? La respuesta define tu perfil de inversionista. Hoy lo descubrimos."
              />
              <Typography variant="h4" fontWeight={700}>Los 3 perfiles de inversionista</Typography>
              <Stack spacing={2}>
                {(Object.entries(PERFILES) as [PerfilTipo, typeof PERFILES['conservador']][]).map(([key, p]) => (
                  <FECard key={key} variant="flat" sx={{ border: 2, borderColor: `${p.color}.main`, bgcolor: `${p.color}.light` }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="h5">{p.emoji}</Typography>
                      <Typography fontWeight={800}>{p.nombre}</Typography>
                    </Stack>
                    <Typography variant="body2">{p.desc}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      Instrumentos típicos: {p.instrumentos[0]}
                    </Typography>
                  </FECard>
                ))}
              </Stack>
              <FECard variant="flat" sx={{ bgcolor: 'info.light', border: 1, borderColor: 'info.main' }}>
                <Typography variant="body2" fontWeight={700}>No hay perfil mejor que otro.</Typography>
                <Typography variant="body2">
                  El problema no es ser conservador o agresivo: el problema es invertir en instrumentos
                  que no corresponden a tu perfil.
                </Typography>
              </FECard>
              <Button fullWidth variant="contained" color="info" size="large" onClick={() => setStep(1)}>
                Iniciar cuestionario →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 1 — Cuestionario */}
        {step === 1 && !cuestionarioCompleto && (
          <Fade in>
            <Stack spacing={3}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" fontWeight={700}>Cuestionario de perfil</Typography>
                <Chip label={`${respondidas}/8`} color="info" />
              </Stack>
              {/* Termómetro de riesgo */}
              <FECard variant="flat" sx={{ border: 1, borderColor: 'warning.main' }}>
                <Typography variant="caption" fontWeight={700}>Termómetro de riesgo:</Typography>
                <LinearProgress
                  variant="determinate"
                  value={nivelRiesgo}
                  color={nivelRiesgo < 40 ? 'success' : nivelRiesgo < 65 ? 'warning' : 'error'}
                  sx={{ mt: 0.5, height: 12, borderRadius: 6 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {nivelRiesgo < 40 ? 'Perfil conservador' : nivelRiesgo < 65 ? 'Perfil moderado' : 'Perfil agresivo'}
                </Typography>
              </FECard>
              <Stack spacing={2}>
                {PREGUNTAS.map((q, qi) => {
                  const resp = respuestas[qi];
                  return (
                    <Paper key={qi} sx={{ p: 2, borderRadius: 3, border: 1, borderColor: resp !== null ? 'warning.main' : 'divider' }}>
                      <Typography variant="body2" fontWeight={700} sx={{ mb: 1.5 }}>
                        {qi + 1}. {q.texto}
                      </Typography>
                      <Stack spacing={1}>
                        {q.opciones.map((op, oi) => (
                          <Button
                            key={oi}
                            size="small"
                            variant={resp === oi ? 'contained' : 'outlined'}
                            color="info"
                            onClick={() => responder(qi, oi)}
                            sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                          >
                            {op}
                          </Button>
                        ))}
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            </Stack>
          </Fade>
        )}

        {/* Pantalla resultado */}
        {cuestionarioCompleto && perfilData && (
          <Fade in>
            <Stack spacing={3}>
              <FECard
                variant="flat"
                sx={{
                  textAlign: 'center',
                  border: 3,
                  borderColor: `${perfilData.color}.main`,
                  bgcolor: `${perfilData.color}.light`,
                  py: 3,
                }}
              >
                <Typography variant="h2">{perfilData.emoji}</Typography>
                <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                  Perfil: {perfilData.nombre}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>{perfilData.desc}</Typography>
              </FECard>
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography fontWeight={700} sx={{ mb: 1 }}>Instrumentos recomendados para ti:</Typography>
                <Stack spacing={1}>
                  {perfilData.instrumentos.map((inst) => (
                    <Chip key={inst} label={inst} color={perfilData.color as 'success' | 'warning' | 'error'} variant="outlined" />
                  ))}
                </Stack>
              </FECard>
              <Stack direction="row" spacing={2}>
                <FECard variant="flat" sx={{ flex: 1, bgcolor: 'success.light', border: 1, borderColor: 'success.main' }}>
                  <Typography variant="caption" fontWeight={700}>Fortaleza</Typography>
                  <Typography variant="body2">{perfilData.fortaleza}</Typography>
                </FECard>
                <FECard variant="flat" sx={{ flex: 1, bgcolor: 'error.light', border: 1, borderColor: 'error.main' }}>
                  <Typography variant="caption" fontWeight={700}>A vigilar</Typography>
                  <Typography variant="body2">{perfilData.riesgo}</Typography>
                </FECard>
              </Stack>
              <FECard variant="flat" sx={{ bgcolor: 'warning.light', border: 1, borderColor: 'warning.main' }}>
                <Typography variant="caption" color="warning.dark" fontWeight={700}>
                  ⚡ Este perfil se guardará y se usará en las lecciones 9, 13, 14 y 15.
                </Typography>
              </FECard>
              <Button
                fullWidth
                variant="contained"
                color="info"
                size="large"
                onClick={() => void handleGuardar()}
                disabled={guardado}
              >
                {guardado ? `✅ Perfil guardado: ${perfilData.nombre}` : 'Guardar mi perfil de inversionista'}
              </Button>
            </Stack>
          </Fade>
        )}
      </Box>
    </LessonShell>
  );
}
