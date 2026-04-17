import { useState } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade,
  Slider, Chip, Paper,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';

const CONCEPTOS = [
  {
    nombre: 'Rendimiento',
    emoji: '📈',
    color: 'success',
    def: 'El dinero extra que genera tu inversión. Se expresa en % anual.',
    ejemplo: '8% anual sobre $10,000 = $800 al año.',
    analogia: 'El sueldo que le pagas al dinero por trabajar para ti.',
    nota: 'El rendimiento pasado no garantiza el futuro.',
  },
  {
    nombre: 'Riesgo',
    emoji: '⚠️',
    color: 'error',
    def: 'La posibilidad de que la inversión no genere lo esperado o que pierdas parte del capital.',
    ejemplo: 'A mayor rendimiento esperado, generalmente mayor riesgo.',
    analogia: 'La velocidad del coche — más rápido puedes llegar, pero también más puedes lastimarte.',
    nota: 'El riesgo no es malo. Es algo que se gestiona con conocimiento.',
  },
  {
    nombre: 'Plazo',
    emoji: '⏳',
    color: 'warning',
    def: 'El tiempo que tu dinero permanecerá invertido.',
    ejemplo: 'A mayor plazo, mayor potencial de rendimiento y mayor capacidad de recuperarse ante caídas.',
    analogia: 'Dejar fermentar el pan — necesita tiempo para crecer bien.',
    nota: 'Las inversiones a largo plazo históricamente superan a las de corto plazo.',
  },
  {
    nombre: 'Liquidez',
    emoji: '💧',
    color: 'info',
    def: 'Qué tan rápido puedes convertir tu inversión en efectivo sin perder valor.',
    ejemplo: 'Una cuenta bancaria tiene alta liquidez. Un bien inmueble, baja.',
    analogia: 'Hielo vs agua — el hielo tarda en convertirse en efectivo.',
    nota: 'Mayor liquidez generalmente implica menor rendimiento.',
  },
];

const QUIZ = [
  {
    pregunta: '¿Qué significa que una inversión tenga alta liquidez?',
    opciones: ['Que da mucho rendimiento', 'Que puedes convertirla en efectivo rápido', 'Que es muy segura'],
    correcta: 1,
  },
  {
    pregunta: 'A mayor rendimiento esperado, generalmente el riesgo es:',
    opciones: ['Menor', 'Mayor', 'Igual'],
    correcta: 1,
  },
  {
    pregunta: '¿Cuál tiene más liquidez?',
    opciones: ['Una casa', 'CETES', 'Un fondo a 5 años'],
    correcta: 1,
  },
  {
    pregunta: 'Te ofrecen 15% mensual garantizado sin riesgo. ¿Qué es?',
    opciones: ['Una gran oportunidad de inversión', 'Una señal de fraude'],
    correcta: 1,
  },
];

export default function L03() {
  const [step, setStep] = useState(0);
  const [expandido, setExpandido] = useState<number | null>(null);
  const [riesgoSlider, setRiesgoSlider] = useState(50);
  const [respuestas, setRespuestas] = useState<(number | null)[]>(Array(4).fill(null));

  const aciertos = respuestas.filter((r, i) => r === QUIZ[i]!.correcta).length;
  const quizCompleto = respuestas.every((r) => r !== null);
  const score = quizCompleto ? aciertos / 4 : 0;

  const rendimientoEstimado = Math.round(2 + (riesgoSlider / 100) * 15);

  const responder = (qi: number, oi: number) => {
    setRespuestas((prev) => prev.map((r, i) => (i === qi ? oi : r)));
  };

  return (
    <LessonShell
      id="L03"
      title="El alfabeto del inversionista: rendimiento, riesgo, plazo y liquidez"
      completion={{ ready: quizCompleto, score }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={(step / 2) * 100}
          color="info"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {/* Pantalla 0 — Los 4 conceptos */}
        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="coach"
                title="El vocabulario del inversionista"
                message="Antes de hablar de productos de inversión, necesitas el vocabulario. No para sonar inteligente en reuniones — para entender lo que estás firmando."
              />
              <Typography variant="h4" fontWeight={700}>Los 4 conceptos clave</Typography>
              <Typography variant="body2" color="text.secondary">Toca cada concepto para expandirlo:</Typography>
              <Stack spacing={2}>
                {CONCEPTOS.map((c, i) => (
                  <Paper
                    key={c.nombre}
                    sx={{ borderRadius: 3, overflow: 'hidden', border: 2, borderColor: expandido === i ? `${c.color}.main` : 'divider' }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={2}
                      sx={{ p: 2, cursor: 'pointer', bgcolor: expandido === i ? `${c.color}.light` : 'grey.50' }}
                      onClick={() => setExpandido(expandido === i ? null : i)}
                    >
                      <Typography variant="h5">{c.emoji}</Typography>
                      <Typography variant="body1" fontWeight={800}>{c.nombre}</Typography>
                    </Stack>
                    {expandido === i && (
                      <Fade in>
                        <Box sx={{ p: 2 }}>
                          <Typography variant="body2" sx={{ mb: 1 }}><b>Definición:</b> {c.def}</Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}><b>Ejemplo:</b> {c.ejemplo}</Typography>
                          <FECard variant="flat" sx={{ bgcolor: 'info.light', border: 1, borderColor: 'info.main' }}>
                            <Typography variant="caption"><b>Analogía:</b> {c.analogia}</Typography>
                          </FECard>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>⚡ {c.nota}</Typography>
                        </Box>
                      </Fade>
                    )}
                  </Paper>
                ))}
              </Stack>
              <Button fullWidth variant="contained" color="info" size="large" onClick={() => setStep(1)}>
                Ver relaciones y alerta antifraude →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 1 — Slider de relaciones + alerta antifraude */}
        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="h4" fontWeight={700}>La tensión entre las 4 variables</Typography>
              <FECard variant="flat" sx={{ border: 1, borderColor: 'warning.main' }}>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>Mueve el nivel de riesgo y observa el impacto:</Typography>
                <Slider
                  value={riesgoSlider}
                  onChange={(_, v) => setRiesgoSlider(Number(v))}
                  color="info"
                  valueLabelDisplay="auto"
                  sx={{ mb: 2 }}
                />
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip label={`Riesgo: ${riesgoSlider < 33 ? 'Bajo' : riesgoSlider < 66 ? 'Medio' : 'Alto'}`} color={riesgoSlider < 33 ? 'success' : riesgoSlider < 66 ? 'warning' : 'error'} />
                  <Chip label={`Rendimiento: ~${rendimientoEstimado}% anual`} color="info" />
                  <Chip label={`Liquidez: ${riesgoSlider > 66 ? 'Media' : 'Alta'}`} />
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                  {riesgoSlider < 33 ? 'Ejemplo: CETES — bajo riesgo, bajo rendimiento, alta liquidez.' :
                   riesgoSlider < 66 ? 'Ejemplo: Fondo balanceado — riesgo medio, rendimiento moderado.' :
                   'Ejemplo: Acciones BMV — alto riesgo, alto potencial, liquidez media.'}
                </Typography>
              </FECard>
              <Paper sx={{ p: 2, borderRadius: 3, bgcolor: 'error.light', border: 2, borderColor: 'error.main' }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <WarningAmberIcon color="error" />
                  <Typography fontWeight={800} color="error.dark">Alerta antifraude</Typography>
                </Stack>
                <Typography variant="body2" fontWeight={700}>Si te ofrecen esto combinado, es fraude:</Typography>
                <Typography variant="body2">🚨 Rendimiento garantizado alto + cero riesgo + liquidez inmediata</Typography>
                <Typography variant="body2" sx={{ mt: 1, color: 'error.dark' }}>
                  Ejemplos en México: esquemas Ponzi de cripto, tandas fraudulentas, apps sin regulación CNBV.
                </Typography>
              </Paper>
              <Button fullWidth variant="contained" color="info" size="large" onClick={() => setStep(2)}>
                Test rápido de 4 preguntas →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 2 — Quiz */}
        {step === 2 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="h4" fontWeight={700}>Test rápido</Typography>
              <Stack spacing={3}>
                {QUIZ.map((q, qi) => {
                  const resp = respuestas[qi];
                  const respondido = resp !== null;
                  const correcto = resp === q.correcta;
                  return (
                    <FECard key={qi} variant="flat" sx={{ border: 1, borderColor: respondido ? (correcto ? 'success.main' : 'error.main') : 'divider' }}>
                      <Typography variant="body2" fontWeight={700} sx={{ mb: 1.5 }}>
                        {qi + 1}. {q.pregunta}
                      </Typography>
                      <Stack spacing={1}>
                        {q.opciones.map((op, oi) => (
                          <Button
                            key={oi}
                            size="small"
                            variant={resp === oi ? 'contained' : 'outlined'}
                            color={respondido ? (oi === q.correcta ? 'success' : resp === oi ? 'error' : 'inherit') : 'warning'}
                            onClick={() => { if (!respondido) responder(qi, oi); }}
                            sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                          >
                            {op}
                          </Button>
                        ))}
                      </Stack>
                      {respondido && (
                        <Fade in>
                          <Typography variant="caption" color={correcto ? 'success.main' : 'error.main'} sx={{ mt: 1, display: 'block' }}>
                            {correcto ? '✓ Correcto' : `✗ La respuesta correcta era: "${q.opciones[q.correcta]}"`}
                          </Typography>
                        </Fade>
                      )}
                    </FECard>
                  );
                })}
              </Stack>
              {quizCompleto && (
                <Fade in>
                  <FECard variant="flat" sx={{ bgcolor: aciertos >= 3 ? 'success.light' : 'info.light', border: 2, borderColor: aciertos >= 3 ? 'success.main' : 'info.main', textAlign: 'center' }}>
                    <Typography variant="h4">{aciertos >= 3 ? '🎯' : '📚'}</Typography>
                    <Typography fontWeight={800}>{aciertos}/4 correctas</Typography>
                    <Typography variant="body2">
                      {aciertos === 4 ? '¡Perfecto! Dominas el vocabulario del inversionista.' :
                       aciertos >= 3 ? '¡Muy bien! Tienes las bases sólidas.' :
                       'Repasa los conceptos — el vocabulario es la base de todo.'}
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
