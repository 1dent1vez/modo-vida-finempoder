import { useState } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade,
} from '@mui/material';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';

type Pregunta = {
  texto: string;
  tipo: 'multiple' | 'verdadero_falso' | 'completar';
  opciones?: string[];
  correcta: number;
  explicacion: string;
  leccion: string;
};

const PREGUNTAS: Pregunta[] = [
  {
    texto: '¿Qué es el gasto hormiga?',
    tipo: 'multiple',
    opciones: [
      'Un gasto grande e imprevisto',
      'Una compra pequeña, recurrente y casi automática',
      'El ahorro mínimo mensual',
    ],
    correcta: 1,
    explicacion: 'El gasto hormiga es pequeño, recurrente y automático. Solo, no parece gran cosa; sumado al mes puede ser $500-$1,500.',
    leccion: 'Lección 3',
  },
  {
    texto: 'Verdadero o Falso: "Un ingreso variable es menos valioso que uno fijo"',
    tipo: 'verdadero_falso',
    opciones: ['Verdadero', 'Falso'],
    correcta: 1,
    explicacion: 'Falso. Ambos son igualmente válidos. La diferencia está en cómo los planeas, no en su valor.',
    leccion: 'Lección 2',
  },
  {
    texto: 'La regla 50-30-20 asigna al ahorro o pago de deudas:',
    tipo: 'multiple',
    opciones: ['10%', '30%', '20%'],
    correcta: 2,
    explicacion: '20% va a ahorro o pago de deudas. 50% a necesidades y 30% a deseos.',
    leccion: 'Lección 5',
  },
  {
    texto: 'Con $320 y 12 días para tu mesada, ¿qué priorizas primero?',
    tipo: 'multiple',
    opciones: [
      'La salida con amigos del sábado',
      'El transporte para llegar al TecToluca',
      'Renovar tu suscripción de streaming',
    ],
    correcta: 1,
    explicacion: 'El transporte es una necesidad básica para llegar a clases. Se prioriza sobre deseos o entretenimiento.',
    leccion: 'Lección 7',
  },
  {
    texto: 'Completa: Balance = Ingresos __ Gastos',
    tipo: 'completar',
    opciones: ['+ (más)', '- (menos)', '× (por)'],
    correcta: 1,
    explicacion: 'Balance = Ingresos MENOS Gastos. Si da positivo es superávit; si da negativo, es déficit.',
    leccion: 'Lección 6',
  },
  {
    texto: 'El gasto emocional impulsivo se puede reducir preguntándose:',
    tipo: 'multiple',
    opciones: [
      '"¿Tengo suficiente saldo en mi tarjeta?"',
      '"¿Lo compraría si me sintiera bien?"',
      '"¿Está en oferta?"',
    ],
    correcta: 1,
    explicacion: 'Preguntarse si lo comprarías sin el estado emocional ayuda a separar la necesidad real del impulso.',
    leccion: 'Lección 8',
  },
  {
    texto: 'Verdadero o Falso: "Un presupuesto imperfecto es mejor que ninguno"',
    tipo: 'verdadero_falso',
    opciones: ['Verdadero', 'Falso'],
    correcta: 0,
    explicacion: 'Verdadero. Empezar con un presupuesto aproximado y mejorarlo es mejor que no tener ninguno.',
    leccion: 'Lección 12',
  },
  {
    texto: 'Una meta SMART es: Específica, Medible, Alcanzable, Relevante y ___',
    tipo: 'completar',
    opciones: ['Territorial', 'Temporal', 'Total'],
    correcta: 1,
    explicacion: 'T = Temporal: toda meta SMART tiene una fecha límite clara para lograrla.',
    leccion: 'Lección 9',
  },
  {
    texto: 'Sofía perdió su trabajo. ¿Cuál fue su primer paso?',
    tipo: 'multiple',
    opciones: [
      'Pedir un crédito de emergencia',
      'Revisar su presupuesto e identificar gastos prescindibles',
      'Llamar a sus papás para que le mandaran dinero',
    ],
    correcta: 1,
    explicacion: 'Revisar el presupuesto primero es la decisión más inteligente: te da claridad antes de actuar.',
    leccion: 'Lección 10',
  },
  {
    texto: '¿Cuál herramienta es oficial de CONDUSEF?',
    tipo: 'multiple',
    opciones: [
      'Fintonic',
      'Google Sheets',
      'App Presupuesto Familiar',
    ],
    correcta: 2,
    explicacion: 'La App Presupuesto Familiar es oficial de CONDUSEF: gratuita, sin publicidad y sin pedir datos bancarios.',
    leccion: 'Lección 11',
  },
];

export default function L14() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const quizDone = Object.keys(answers).length === PREGUNTAS.length;
  const correctCount = PREGUNTAS.filter((q, i) => answers[i] === q.correcta).length;
  const score = Math.round((correctCount / PREGUNTAS.length) * 100);

  const answer = (qi: number, oi: number) => {
    if (answers[qi] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [qi]: oi }));
  };

  return (
    <LessonShell
      id="L14"
      title="¿Tú controlas tu dinero o él te controla a ti?"
      completion={{ ready: quizDone, score }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={step === 0 ? 0 : step === 1 ? (Object.keys(answers).length / PREGUNTAS.length) * 90 : 100}
          color="warning"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="coach"
                title="¡Llegaste a la penúltima lección!"
                message="Antes del reto final, vamos a ver qué tanto absorbiste. No es examen: es una radiografía de tu aprendizaje."
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'warning.main', bgcolor: 'warning.light' }}>
                <Typography variant="body1" fontWeight={700}>10 preguntas</Typography>
                <Typography variant="body2" color="text.secondary">
                  Mezcla de conceptos, situaciones y aplicaciones prácticas. Por cada respuesta recibirás retroalimentación inmediata.
                </Typography>
              </FECard>
              <FinniMessage
                variant="coach"
                title="Tranquilo"
                message="Si algo no quedó claro, cada explicación te dirá en qué lección puedes reforzarlo."
              />
              <Button fullWidth variant="contained" color="warning" size="large" onClick={() => setStep(1)}>
                ¡Comenzar! →
              </Button>
            </Stack>
          </Fade>
        )}

        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="body2" color="text.secondary">
                {Object.keys(answers).length}/{PREGUNTAS.length} respondidas
              </Typography>
              {PREGUNTAS.map((q, qi) => {
                const answered = answers[qi] !== undefined;
                const isCorrect = answered && answers[qi] === q.correcta;
                return (
                  <FECard
                    key={qi}
                    variant="flat"
                    sx={{
                      border: 2,
                      borderColor: answered ? (isCorrect ? 'success.main' : 'error.main') : 'divider',
                      bgcolor: answered ? (isCorrect ? 'success.light' : 'error.light') : 'background.paper',
                    }}
                  >
                    <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                      {qi + 1}. {q.texto}
                    </Typography>
                    {q.tipo === 'completar' && !answered && (
                      <Stack spacing={1} sx={{ mb: 1 }}>
                        {q.opciones?.map((op, oi) => (
                          <Button
                            key={oi}
                            fullWidth
                            variant="outlined"
                            color="warning"
                            size="small"
                            onClick={() => answer(qi, oi)}
                            sx={{ textAlign: 'left', justifyContent: 'flex-start', textTransform: 'none' }}
                          >
                            {op}
                          </Button>
                        ))}
                      </Stack>
                    )}
                    {q.tipo !== 'completar' && !answered && (
                      <Stack spacing={1}>
                        {q.opciones?.map((op, oi) => (
                          <Button
                            key={oi}
                            fullWidth
                            variant="outlined"
                            size="small"
                            onClick={() => answer(qi, oi)}
                            sx={{ textAlign: 'left', justifyContent: 'flex-start', textTransform: 'none', borderColor: 'warning.main' }}
                          >
                            {q.tipo === 'verdadero_falso' ? '' : `${['a', 'b', 'c'][oi]}) `}{op}
                          </Button>
                        ))}
                      </Stack>
                    )}
                    {answered && (
                      <Stack spacing={0.5}>
                        <Typography variant="body2" fontWeight={700}>
                          {isCorrect ? '✅ Correcto' : '❌ Incorrecto'} — Tu respuesta: {q.opciones?.[answers[qi]]}
                        </Typography>
                        {!isCorrect && (
                          <Typography variant="body2">
                            Respuesta correcta: <b>{q.opciones?.[q.correcta]}</b>
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          {q.explicacion} (Ref: {q.leccion})
                        </Typography>
                      </Stack>
                    )}
                  </FECard>
                );
              })}
              {quizDone && (
                <Fade in>
                  <Button fullWidth variant="contained" color="warning" size="large" onClick={() => setStep(2)}>
                    Ver resultado final →
                  </Button>
                </Fade>
              )}
            </Stack>
          </Fade>
        )}

        {step === 2 && (
          <Fade in>
            <Stack spacing={3}>
              <FECard variant="flat" sx={{ bgcolor: score >= 80 ? 'success.light' : score >= 60 ? 'warning.light' : 'error.light', border: 2, borderColor: score >= 80 ? 'success.main' : score >= 60 ? 'warning.main' : 'error.main', textAlign: 'center', py: 2 }}>
                <Typography variant="h2">{correctCount}/10</Typography>
                <Typography variant="body1" fontWeight={700}>{score}% de aciertos</Typography>
              </FECard>
              <FinniMessage
                variant={score >= 80 ? 'success' : 'coach'}
                title={score >= 80 ? '¡Excelente dominio!' : score >= 60 ? '¡Buen trabajo!' : 'Sigue practicando'}
                message={
                  score >= 80
                    ? 'Dominas los conceptos del módulo. ¡Estás listo para el reto final!'
                    : score >= 60
                    ? 'Buen nivel. Revisa las preguntas marcadas en rojo antes del reto final.'
                    : 'Algunos conceptos necesitan refuerzo. Repasa las lecciones señaladas.'
                }
              />
              {score < 80 && (
                <FECard variant="flat" sx={{ border: 1, borderColor: 'warning.main' }}>
                  <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>Lecciones a reforzar:</Typography>
                  {PREGUNTAS.filter((q, i) => answers[i] !== q.correcta).map((q, i) => (
                    <Typography key={i} variant="body2">• {q.leccion}: {q.texto.slice(0, 50)}...</Typography>
                  ))}
                </FECard>
              )}
            </Stack>
          </Fade>
        )}
      </Box>
    </LessonShell>
  );
}
