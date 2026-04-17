import { useState } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade, Chip,
} from '@mui/material';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';

const HISTORIAS = [
  {
    nombre: 'Sofía',
    resumen: 'Perdió su trabajo part-time de golpe.',
    acciones: 'Revisó su presupuesto, identificó gastos prescindibles, activó su fondo de emergencias.',
  },
  {
    nombre: 'Andrés',
    resumen: 'No recibió su beca este mes por error administrativo.',
    acciones: 'Negoció plazos con servicios, buscó ingreso alternativo temporal, evitó contraer deudas.',
  },
  {
    nombre: 'Luisa',
    resumen: 'Su familia redujo la mesada.',
    acciones: 'Ajustó su regla 50-30-20, priorizó necesidades básicas, comunicó la situación abiertamente.',
  },
];

const CLAVES = [
  'Revisa tu presupuesto de inmediato al saber de la crisis.',
  'Identifica los gastos prescindibles antes de endeudarte.',
  'El fondo de emergencias existe exactamente para esto.',
  'Negociar plazos es mejor que no pagar.',
  'Buscar ingreso alternativo es siempre una opción válida.',
];

type QuizPreg = {
  pregunta: string;
  opciones: string[];
  correcta: number;
  ref: string;
};

const QUIZ: QuizPreg[] = [
  {
    pregunta: '¿Cuál fue lo primero que hizo Sofía al perder su trabajo?',
    opciones: ['Pedir dinero prestado', 'Revisar su presupuesto', 'Buscar un crédito'],
    correcta: 1,
    ref: 'Historia de Sofía',
  },
  {
    pregunta: '¿Qué evitó hacer Andrés durante la crisis?',
    opciones: ['Buscar ingreso alternativo', 'Negociar plazos', 'Contraer deudas'],
    correcta: 2,
    ref: 'Historia de Andrés',
  },
  {
    pregunta: 'Cuando el ingreso baja, ¿qué se debe priorizar primero?',
    opciones: ['Gastos de entretenimiento', 'Necesidades básicas', 'Suscripciones mensuales'],
    correcta: 1,
    ref: 'Historia de Luisa',
  },
  {
    pregunta: '¿Qué distingue a alguien financieramente preparado en una crisis?',
    opciones: ['Tener muchas deudas disponibles', 'Saber qué hacer cuando el ingreso baja', 'Gastar más para compensar'],
    correcta: 1,
    ref: 'Introducción de Finni',
  },
  {
    pregunta: 'Según el micro-podcast, las decisiones en crisis deben ser:',
    opciones: ['Lentas y muy analizadas', 'Rápidas y bien informadas', 'Delegadas a otra persona'],
    correcta: 1,
    ref: 'Narrador del podcast',
  },
];

export default function L10() {
  const [step, setStep] = useState(0);
  const [readProgress, setReadProgress] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showFeedback, setShowFeedback] = useState<Record<number, boolean>>({});

  const allRead = readProgress >= HISTORIAS.length;
  const quizDone = Object.keys(quizAnswers).length === QUIZ.length;
  const correctCount = QUIZ.filter((q, i) => quizAnswers[i] === q.correcta).length;
  const score = Math.round((correctCount / QUIZ.length) * 100);

  const markRead = () => {
    if (readProgress < HISTORIAS.length) {
      setReadProgress((p) => p + 1);
    }
  };

  const answerQuiz = (qi: number, oi: number) => {
    if (quizAnswers[qi] !== undefined) return;
    setQuizAnswers((prev) => ({ ...prev, [qi]: oi }));
    setShowFeedback((prev) => ({ ...prev, [qi]: true }));
  };

  return (
    <LessonShell
      id="L10"
      title="Finanzas en tiempos difíciles"
      completion={{ ready: quizDone, score }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={step === 0 ? 0 : step === 1 ? 30 : step === 2 ? 65 : 100}
          color="warning"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="coach"
                title="No todo mes es igual"
                message="A veces el ingreso baja, los gastos suben o pasan imprevistos. Lo que distingue a alguien financieramente preparado es saber qué hacer cuando eso pasa."
              />
              <FECard variant="flat" sx={{ bgcolor: 'info.light', border: 1, borderColor: 'info.main' }}>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>🎙️ Micro-podcast — 3 historias reales</Typography>
                <Typography variant="body2">
                  Lee las historias de Sofía, Andrés y Luisa para ver cómo gestionaron una crisis financiera.
                  Al final habrá un test de comprensión.
                </Typography>
              </FECard>
              <Button fullWidth variant="contained" color="warning" size="large" onClick={() => setStep(1)}>
                Leer las historias →
              </Button>
            </Stack>
          </Fade>
        )}

        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <LinearProgress
                variant="determinate"
                value={(readProgress / HISTORIAS.length) * 100}
                color="info"
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" color="text.secondary">
                Historia {Math.min(readProgress + 1, HISTORIAS.length)}/{HISTORIAS.length}
              </Typography>

              {readProgress < HISTORIAS.length && (
                <Fade in key={readProgress}>
                  <Stack spacing={2}>
                    <FECard variant="flat" sx={{ bgcolor: 'info.light', border: 2, borderColor: 'info.main' }}>
                      <Typography variant="body2" color="text.secondary">Historia {readProgress + 1}</Typography>
                      <Typography variant="h4">{HISTORIAS[readProgress].nombre}</Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>{HISTORIAS[readProgress].resumen}</Typography>
                      <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', color: 'text.secondary' }}>
                        Lo que hizo: {HISTORIAS[readProgress].acciones}
                      </Typography>
                    </FECard>
                    <Button fullWidth variant="contained" color="primary" size="large" onClick={markRead}>
                      {readProgress < HISTORIAS.length - 1 ? 'Siguiente historia →' : 'Ver puntos clave →'}
                    </Button>
                  </Stack>
                </Fade>
              )}

              {allRead && (
                <Fade in>
                  <Stack spacing={2}>
                    <Typography variant="body1" fontWeight={700}>5 puntos clave del podcast:</Typography>
                    {CLAVES.map((c, i) => (
                      <FECard key={i} variant="flat" sx={{ border: 1, borderColor: 'info.light' }}>
                        <Typography variant="body2">
                          <b>{i + 1}.</b> {c}
                        </Typography>
                      </FECard>
                    ))}
                    <FinniMessage
                      variant="coach"
                      title="Narrador"
                      message="En crisis financieras, las decisiones rápidas y bien informadas marcan la diferencia entre sobrevivir el mes y endeudarse."
                    />
                    <Button fullWidth variant="contained" color="warning" size="large" onClick={() => setStep(2)}>
                      Responder el test →
                    </Button>
                  </Stack>
                </Fade>
              )}
            </Stack>
          </Fade>
        )}

        {step === 2 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="body1" fontWeight={700}>
                Test de comprensión — 5 preguntas
              </Typography>
              {QUIZ.map((q, qi) => (
                <FECard key={qi} variant="flat" sx={{ border: 1, borderColor: quizAnswers[qi] !== undefined ? (quizAnswers[qi] === q.correcta ? 'success.main' : 'error.main') : 'divider' }}>
                  <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                    {qi + 1}. {q.pregunta}
                  </Typography>
                  <Stack spacing={1}>
                    {q.opciones.map((op, oi) => {
                      const answered = quizAnswers[qi] !== undefined;
                      const isSelected = quizAnswers[qi] === oi;
                      const isCorrect = oi === q.correcta;
                      return (
                        <Button
                          key={oi}
                          fullWidth
                          variant={isSelected ? 'contained' : 'outlined'}
                          size="small"
                          onClick={() => answerQuiz(qi, oi)}
                          disabled={answered}
                          sx={{
                            textAlign: 'left',
                            justifyContent: 'flex-start',
                            textTransform: 'none',
                            ...(answered && isCorrect && { bgcolor: 'success.main', color: 'white', '&.Mui-disabled': { bgcolor: 'success.main', color: 'white' } }),
                            ...(answered && isSelected && !isCorrect && { bgcolor: 'error.main', color: 'white', '&.Mui-disabled': { bgcolor: 'error.main', color: 'white' } }),
                          }}
                        >
                          {op}
                        </Button>
                      );
                    })}
                  </Stack>
                  {showFeedback[qi] && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {quizAnswers[qi] === q.correcta ? '✅ Correcto!' : '❌ Incorrecto.'} Ref: {q.ref}
                    </Typography>
                  )}
                </FECard>
              ))}
              {quizDone && (
                <Fade in>
                  <Stack spacing={2}>
                    <FECard variant="flat" sx={{ bgcolor: score >= 80 ? 'success.light' : 'warning.light', textAlign: 'center' }}>
                      <Typography variant="h4">{correctCount}/5 respuestas correctas</Typography>
                      <Typography variant="body2">{score}% de aciertos</Typography>
                    </FECard>
                    <Button fullWidth variant="contained" color="warning" size="large" onClick={() => setStep(3)}>
                      Ver aplicación personal →
                    </Button>
                  </Stack>
                </Fade>
              )}
            </Stack>
          </Fade>
        )}

        {step === 3 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="success"
                title="¡Lección completada!"
                message="Ahora sabes cómo reaccionar ante una crisis financiera. La preparación marca la diferencia."
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'warning.main' }}>
                <Typography variant="body1" fontWeight={700} sx={{ mb: 1 }}>2 acciones que puedes tomar hoy:</Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">1. Revisa si tienes al menos 1 mes de gastos guardado como fondo de emergencias.</Typography>
                  <Typography variant="body2">2. Identifica 1 gasto que podrías recortar si tu ingreso bajara de repente.</Typography>
                </Stack>
              </FECard>
              <Stack direction="row" flexWrap="wrap" gap={1} useFlexGap>
                <Chip label="CONDUSEF: Finanzas en Crisis" variant="outlined" size="small" />
                <Chip label="condusef.gob.mx" variant="outlined" size="small" />
              </Stack>
            </Stack>
          </Fade>
        )}
      </Box>
    </LessonShell>
  );
}
