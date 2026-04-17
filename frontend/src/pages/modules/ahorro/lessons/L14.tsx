import { useState, useEffect, useMemo } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade, Chip,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

type MetaData = { nombre?: string; monto?: number; aportacionMensual?: number } | null;
type PlanData = { totalPlanado?: number; horizon?: number } | null;
type RetoData = { totalAcumulado?: number; dayAmounts?: number[] } | null;

type QuizAnswer = string | null;

const PREGUNTAS = [
  {
    id: 1, tipo: 'opcion',
    pregunta: '¿Que significa "pagarte primero a ti mismo"?',
    opciones: ['A) Gastar en lo que quieres antes que en necesidades', 'B) Apartar el ahorro antes de gastar', 'C) Invertir en tu educacion primero'],
    correcta: 'B) Apartar el ahorro antes de gastar',
    feedback: 'Pagarte primero significa que el ahorro va antes que cualquier gasto.',
  },
  {
    id: 2, tipo: 'vf',
    pregunta: 'El ahorro informal no tiene ninguna ventaja.',
    opciones: ['Verdadero', 'Falso'],
    correcta: 'Falso',
    feedback: 'El ahorro informal tiene ventaja en acceso inmediato, aunque carece de proteccion.',
  },
  {
    id: 3, tipo: 'opcion',
    pregunta: '¿Que protege el IPAB?',
    opciones: ['A) Inversiones en bolsa', 'B) Depositos en bancos autorizados hasta ~3 millones de pesos', 'C) Fondos de inversion'],
    correcta: 'B) Depositos en bancos autorizados hasta ~3 millones de pesos',
    feedback: 'El IPAB protege depositos bancarios en instituciones autorizadas hasta ~3 millones.',
  },
  {
    id: 4, tipo: 'situacion',
    pregunta: 'Tu ingreso varia entre $800 y $3,500 al mes. ¿Mejor estrategia de ahorro?',
    opciones: ['A) Ahorrar un monto fijo de $300 siempre', 'B) Ahorrar un porcentaje fijo (ej. 20%) de lo que ganes', 'C) Ahorrar solo en meses buenos'],
    correcta: 'B) Ahorrar un porcentaje fijo (ej. 20%) de lo que ganes',
    feedback: 'El porcentaje fijo se adapta automaticamente a lo que ganes cada mes.',
  },
  {
    id: 5, tipo: 'completar',
    pregunta: 'El interes compuesto gana interes sobre el capital MAS ___.',
    opciones: ['A) Las comisiones bancarias', 'B) Los intereses anteriores', 'C) El saldo minimo'],
    correcta: 'B) Los intereses anteriores',
    feedback: 'Eso es exactamente el interes compuesto: intereses que generan mas intereses.',
  },
  {
    id: 6, tipo: 'opcion',
    pregunta: '¿Cuantos meses de gastos basicos recomienda tener en un fondo de emergencias si tienes apoyo familiar?',
    opciones: ['A) 1 mes', 'B) 3 meses', 'C) 12 meses'],
    correcta: 'B) 3 meses',
    feedback: 'Con apoyo familiar, 3 meses es la meta minima recomendada para el fondo.',
  },
  {
    id: 7, tipo: 'vf',
    pregunta: 'Una meta de ahorro especifica ayuda a ahorrar mas.',
    opciones: ['Verdadero', 'Falso'],
    correcta: 'Verdadero',
    feedback: 'Con meta especifica se ahorra en promedio 3 veces mas. No es motivacion, es estructura.',
  },
  {
    id: 8, tipo: 'opcion',
    pregunta: '¿Cual NO esta cubierto por el IPAB?',
    opciones: ['A) Cuenta de ahorro en banco autorizado', 'B) Inversiones en bolsa', 'C) Cuenta de cheques'],
    correcta: 'B) Inversiones en bolsa',
    feedback: 'Las inversiones en bolsa no son depositos bancarios, por lo que el IPAB no las cubre.',
  },
  {
    id: 9, tipo: 'autoevaluacion',
    pregunta: '¿Como calificarias tu habito de ahorro en este modulo?',
    opciones: ['1 — Practicamente no ahorre', '2 — Ahorre un poco', '3 — Ahorre regular', '4 — Ahorre con constancia', '5 — Supere mi meta'],
    correcta: null, // autoevaluacion, siempre correcta
    feedback: 'La autoevaluacion honesta es el primer paso para mejorar.',
  },
  {
    id: 10, tipo: 'situacion',
    pregunta: 'Rodrigo quiere ahorrar $6,000 en 6 meses. ¿Cuanto debe apartar por mes?',
    opciones: ['A) $500', 'B) $750', 'C) $1,000'],
    correcta: 'C) $1,000',
    feedback: '$6,000 ÷ 6 meses = $1,000 por mes.',
  },
];

export default function L14() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [metaData, setMetaData] = useState<MetaData>(null);
  const [planData, setPlanData] = useState<PlanData>(null);
  const [retoData, setRetoData] = useState<RetoData>(null);
  const [answers, setAnswers] = useState<Record<number, QuizAnswer>>({});

  useEffect(() => {
    const load = async () => {
      const meta = await lessonDataRepository.load<MetaData>('ahorro', 'l5_meta');
      const plan = await lessonDataRepository.load<PlanData>('ahorro', 'l6_plan');
      const reto = await lessonDataRepository.load<RetoData>('ahorro', 'l11_reto');
      setMetaData(meta);
      setPlanData(plan);
      setRetoData(reto);
      setLoading(false);
    };
    void load();
  }, []);

  const totalAcumulado = retoData?.totalAcumulado ?? 0;
  const totalPlanado = planData?.totalPlanado ?? 0;
  const pctMeta = metaData?.monto && metaData.monto > 0 ? Math.min(100, (totalAcumulado / metaData.monto) * 100) : 0;
  const diasConsec = retoData?.dayAmounts?.length ?? 0;

  const quizDone = PREGUNTAS.every((p) => answers[p.id] !== undefined);

  const score = useMemo(() => {
    return PREGUNTAS.filter((p) => {
      if (p.tipo === 'autoevaluacion') return true; // siempre cuenta
      return answers[p.id] === p.correcta;
    }).length;
  }, [answers]);

  const pctScore = score / PREGUNTAS.length;
  const badgeUnlocked = pctScore >= 0.7;

  const progress = step === 0 ? 0 : step === 1 ? 33 : step === 2 ? 66 : 100;

  if (loading) {
    return (
      <LessonShell id="L14" title="Evalua tu habito de ahorro" completion={{ ready: false }}>
        <Typography variant="body2" color="text.secondary">Cargando estadisticas...</Typography>
      </LessonShell>
    );
  }

  return (
    <LessonShell
      id="L14"
      title="Evalua tu habito de ahorro"
      completion={{ ready: quizDone, score: pctScore }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          color="success"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {/* Pantalla 0 — Estadisticas del modulo */}
        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="coach"
                title="¡Casi llegamos al final del Modulo 2!"
                message="Primero vamos a ver tus estadisticas del modulo. Luego el quiz. Las dos cosas van a sorprenderte."
              />
              <Typography variant="body1" fontWeight={700}>Tus estadisticas del modulo:</Typography>
              <Stack spacing={1.5}>
                <FECard variant="flat" sx={{ border: 1, borderColor: 'success.main', bgcolor: 'success.light' }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Total ahorrado en el modulo:</Typography>
                    <Typography variant="body2" fontWeight={700} color="success.dark">
                      ${totalAcumulado.toLocaleString()}
                    </Typography>
                  </Stack>
                </FECard>
                <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Dias con registro consecutivo:</Typography>
                    <Chip label={`${diasConsec} dias`} color={diasConsec >= 3 ? 'success' : 'warning'} size="small" />
                  </Stack>
                </FECard>
                <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Progreso hacia la meta: {pctMeta.toFixed(0)}%
                    {metaData?.nombre ? ` — "${metaData.nombre}"` : ''}
                  </Typography>
                  <LinearProgress variant="determinate" value={pctMeta} color="success" sx={{ height: 8, borderRadius: 4 }} />
                </FECard>
                <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Plan inicial:</Typography>
                    <Typography variant="body2">${totalPlanado.toLocaleString()} planeados</Typography>
                  </Stack>
                  {totalPlanado > 0 && (
                    <Typography variant="caption" color={totalAcumulado >= totalPlanado * 0.5 ? 'success.dark' : 'warning.dark'}>
                      {totalAcumulado >= totalPlanado * 0.5 ? '✅ En camino' : '⚠️ Por debajo del plan'}
                    </Typography>
                  )}
                </FECard>
              </Stack>
              <FinniMessage
                variant="coach"
                title="Mira todo lo que hiciste"
                message="Esas son tus decisiones, no las mias."
              />
              <Button fullWidth variant="contained" color="success" size="large" onClick={() => setStep(1)}>
                Empezar el quiz de 10 preguntas →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 1 — Quiz de 10 preguntas */}
        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body1" fontWeight={700}>Quiz de 10 preguntas</Typography>
                <Chip label={`${Object.keys(answers).length}/10`} color="success" size="small" />
              </Stack>
              <LinearProgress
                variant="determinate"
                value={(Object.keys(answers).length / 10) * 100}
                color="success"
                sx={{ height: 8, borderRadius: 4 }}
              />

              <Stack spacing={2}>
                {PREGUNTAS.map((p) => {
                  const ans = answers[p.id];
                  const isCorrect = p.tipo === 'autoevaluacion' ? true : ans === p.correcta;
                  return (
                    <FECard
                      key={p.id}
                      variant="flat"
                      sx={{
                        border: 1,
                        borderColor: ans ? (isCorrect ? 'success.main' : 'error.main') : 'divider',
                      }}
                    >
                      <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                        {p.id}. {p.pregunta}
                      </Typography>
                      <Stack spacing={0.75}>
                        {p.opciones.map((opt) => (
                          <Button
                            key={opt}
                            size="small"
                            variant={ans === opt ? 'contained' : 'outlined'}
                            color={ans === opt ? (p.tipo === 'autoevaluacion' ? 'success' : isCorrect && opt === p.correcta ? 'success' : 'error') : 'inherit'}
                            onClick={() => {
                              if (!ans) setAnswers((prev) => ({ ...prev, [p.id]: opt }));
                            }}
                            disabled={!!ans}
                            sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                          >
                            {opt}
                          </Button>
                        ))}
                      </Stack>
                      {ans && (
                        <Fade in>
                          <Typography
                            variant="caption"
                            sx={{ display: 'block', mt: 0.75, color: isCorrect ? 'success.dark' : 'error.dark' }}
                          >
                            {isCorrect ? '✅ ' : '❌ '}{p.feedback}
                          </Typography>
                        </Fade>
                      )}
                    </FECard>
                  );
                })}
              </Stack>

              {quizDone && (
                <Fade in>
                  <Button fullWidth variant="contained" color="success" size="large" onClick={() => setStep(2)}>
                    Ver resultado →
                  </Button>
                </Fade>
              )}
            </Stack>
          </Fade>
        )}

        {/* Pantalla 2 — Resultado */}
        {step === 2 && (
          <Fade in>
            <Stack spacing={3}>
              <FECard
                variant="flat"
                sx={{
                  textAlign: 'center', py: 3,
                  bgcolor: badgeUnlocked ? 'warning.light' : 'info.light',
                  border: 2,
                  borderColor: badgeUnlocked ? 'warning.main' : 'info.main',
                }}
              >
                {badgeUnlocked && <EmojiEventsIcon sx={{ fontSize: 56, color: 'warning.main' }} />}
                <Typography variant="h3" sx={{ mt: badgeUnlocked ? 1 : 0 }}>{score}/10</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {badgeUnlocked ? 'Badge "Evaluado 📊" desbloqueado' : `${(pctScore * 100).toFixed(0)}% — necesitas 70% para el badge`}
                </Typography>
              </FECard>

              <FinniMessage
                variant="success"
                title={badgeUnlocked ? '¡Badge Evaluado desbloqueado!' : 'Buen intento'}
                message={
                  badgeUnlocked
                    ? 'Demostraste que entiendes los conceptos clave del ahorro.'
                    : 'Puedes repasar las lecciones con mas errores. El aprendizaje es el objetivo.'
                }
              />

              {/* Mapa de aciertos */}
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                  Tus respuestas:
                </Typography>
                <Stack direction="row" spacing={0.75} flexWrap="wrap">
                  {PREGUNTAS.map((p) => {
                    const ans = answers[p.id];
                    const isCorrect = p.tipo === 'autoevaluacion' ? true : ans === p.correcta;
                    return (
                      <Chip
                        key={p.id}
                        label={`P${p.id}`}
                        color={isCorrect ? 'success' : 'error'}
                        size="small"
                        sx={{ mb: 0.5 }}
                      />
                    );
                  })}
                </Stack>
              </FECard>
            </Stack>
          </Fade>
        )}
      </Box>
    </LessonShell>
  );
}
