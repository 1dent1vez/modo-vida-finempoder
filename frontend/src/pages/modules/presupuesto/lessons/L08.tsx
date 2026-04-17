import { useState, useEffect } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade,
  Chip, TextField,
} from '@mui/material';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

type GastoType = 'racional' | 'emocional' | 'impulsivo';

const SITUACIONES: { id: string; desc: string; correct: GastoType; explicacion: string }[] = [
  {
    id: 's1',
    desc: 'Comprar uniforme de deporte para la clase ($400)',
    correct: 'racional',
    explicacion: 'Es una necesidad para la clase. Decisión racional y planificada.',
  },
  {
    id: 's2',
    desc: 'Comprar café gourmet después de reprobar un examen ($85)',
    correct: 'emocional',
    explicacion: 'Es una respuesta emocional al estrés. Puede ser válido si es consciente.',
  },
  {
    id: 's3',
    desc: 'Adelantar un regalo de cumpleaños a un amigo porque te sientes mal ($300)',
    correct: 'impulsivo',
    explicacion: 'Mezcla de emoción e impulso. Considera si cabe en tu presupuesto.',
  },
  {
    id: 's4',
    desc: 'Comprar app de productividad en oferta que nunca usarás ($99)',
    correct: 'impulsivo',
    explicacion: 'Clásico gasto impulsivo activado por una oferta. La oferta no justifica la compra.',
  },
  {
    id: 's5',
    desc: 'Salir a comer con amigos para celebrar una calificación ($200)',
    correct: 'emocional',
    explicacion: 'Gasto emocional planificado. Si entra en tu presupuesto de deseos, está bien.',
  },
];

const ESTRATEGIAS = [
  'Esperar 24 horas antes de cualquier compra no planeada',
  'Preguntarme: "¿Lo compraría si me sintiera bien?"',
  'Fijar un límite mensual para gastos emocionales',
];

const TRIGGERS: { id: string; label: string }[] = [
  { id: 'estres', label: 'Cuando estoy estresado' },
  { id: 'aburrido', label: 'Cuando estoy aburrido' },
  { id: 'celebrando', label: 'Cuando estoy celebrando' },
  { id: 'amigos', label: 'Con amigos' },
  { id: 'online', label: 'Comprando en línea' },
  { id: 'ofertas', label: 'Viendo ofertas' },
];

export default function L08() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, GastoType>>({});
  const [lastFeedback, setLastFeedback] = useState<{ id: string; userAnswer: GastoType } | null>(null);
  const [triggers, setTriggers] = useState<Set<string>>(new Set());
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');

  const quizDone = SITUACIONES.every((s) => answers[s.id] !== undefined);
  const canComplete = quizDone && selectedStrategy !== null;

  const answerSituacion = (id: string, type: GastoType) => {
    if (answers[id]) return;
    setAnswers((prev) => ({ ...prev, [id]: type }));
    setLastFeedback({ id, userAnswer: type });
  };

  const toggleTrigger = (id: string) => {
    setTriggers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    if (canComplete) {
      void lessonDataRepository.save('presupuesto', 'l8_strategy', {
        strategy: selectedStrategy,
        triggers: Array.from(triggers),
      });
    }
  }, [canComplete, selectedStrategy, triggers]);

  const getSituacion = (id: string) => SITUACIONES.find((s) => s.id === id);

  return (
    <LessonShell
      id="L08"
      title="Cuando el corazón gasta y la cartera llora"
      completion={{ ready: canComplete }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={step === 0 ? 0 : step === 1 ? 25 : step === 2 ? 60 : step === 3 ? 80 : 100}
          color="warning"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="coach"
                title="El gasto emocional"
                message="¿Alguna vez compraste algo solo porque estabas estresado, aburrido o querías 'darte un gusto'? Eso tiene nombre: gasto emocional. Y no es malo en sí… siempre que lo conozcas."
              />
              <Stack spacing={2}>
                {[
                  { title: 'Situación 1 — Valeria', desc: 'Reprobó un examen → fue al mall → compró ropa que no necesitaba → culpa post-compra.' },
                  { title: 'Situación 2 — Diego', desc: 'Vio oferta de videojuego → compra impulsiva → lo jugó 2 horas → lo olvidó.' },
                ].map((s) => (
                  <FECard key={s.title} variant="flat" sx={{ border: 1, borderColor: 'warning.main' }}>
                    <Typography variant="body2" fontWeight={700}>{s.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{s.desc}</Typography>
                  </FECard>
                ))}
              </Stack>
              <FinniMessage
                variant="coach"
                title="La pregunta clave"
                message="No es '¿puedo pagarlo?', sino '¿lo compraría si me sintiera bien?'"
              />
              <Button fullWidth variant="contained" color="warning" size="large" onClick={() => setStep(1)}>
                Quiz: ¿Racional, emocional o impulsivo? →
              </Button>
            </Stack>
          </Fade>
        )}

        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="body1">
                Para cada situación, elige: <b>Racional</b>, <b>Emocional</b> o <b>Impulsivo</b>.
                No hay una sola respuesta: Finni explica los matices.
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(Object.keys(answers).length / SITUACIONES.length) * 100}
                color="warning"
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Stack spacing={2}>
                {SITUACIONES.map((s) => (
                  <FECard
                    key={s.id}
                    variant="flat"
                    sx={{
                      border: 1,
                      borderColor: answers[s.id] ? 'success.main' : 'divider',
                      bgcolor: answers[s.id] ? 'success.light' : 'background.paper',
                    }}
                  >
                    <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>{s.desc}</Typography>
                    {!answers[s.id] ? (
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {(['racional', 'emocional', 'impulsivo'] as GastoType[]).map((type) => (
                          <Chip
                            key={type}
                            label={type.charAt(0).toUpperCase() + type.slice(1)}
                            onClick={() => answerSituacion(s.id, type)}
                            variant="outlined"
                            sx={{ cursor: 'pointer', fontWeight: 600 }}
                          />
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Tu respuesta: <b>{answers[s.id]}</b> · {s.explicacion}
                      </Typography>
                    )}
                  </FECard>
                ))}
              </Stack>

              {lastFeedback && answers[lastFeedback.id] && (
                <Fade in>
                  <FECard variant="flat" sx={{ bgcolor: 'info.light', border: 1, borderColor: 'info.main' }}>
                    <Typography variant="body2" fontWeight={700}>Finni explica:</Typography>
                    <Typography variant="body2">{getSituacion(lastFeedback.id)?.explicacion}</Typography>
                  </FECard>
                </Fade>
              )}

              {quizDone && (
                <Fade in>
                  <Button fullWidth variant="contained" color="warning" size="large" onClick={() => setStep(2)}>
                    Autoevaluación →
                  </Button>
                </Fade>
              )}
            </Stack>
          </Fade>
        )}

        {step === 2 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="body1" fontWeight={700}>
                ¿Cuándo es más probable que hagas gastos emocionales?
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1} useFlexGap>
                {TRIGGERS.map((t) => (
                  <Chip
                    key={t.id}
                    label={t.label}
                    onClick={() => toggleTrigger(t.id)}
                    color={triggers.has(t.id) ? 'warning' : 'default'}
                    variant={triggers.has(t.id) ? 'filled' : 'outlined'}
                    sx={{ cursor: 'pointer', fontWeight: 600 }}
                  />
                ))}
              </Stack>
              <Button fullWidth variant="contained" color="warning" size="large" onClick={() => setStep(3)}>
                Elegir mi estrategia →
              </Button>
            </Stack>
          </Fade>
        )}

        {step === 3 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="coach"
                title="Estrategias anti-gasto-impulsivo"
                message="Elige 1 estrategia para practicar esta semana. La que más resuene contigo."
              />
              <Stack spacing={2}>
                {ESTRATEGIAS.map((e) => (
                  <FECard
                    key={e}
                    variant="flat"
                    sx={{
                      border: 2,
                      borderColor: selectedStrategy === e ? 'warning.main' : 'divider',
                      bgcolor: selectedStrategy === e ? 'warning.light' : 'background.paper',
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelectedStrategy(e)}
                    role="button"
                    tabIndex={0}
                  >
                    <Typography variant="body2" fontWeight={selectedStrategy === e ? 700 : 400}>
                      {selectedStrategy === e ? '✓ ' : ''}{e}
                    </Typography>
                  </FECard>
                ))}
              </Stack>
              {selectedStrategy && (
                <Fade in>
                  <Stack spacing={2}>
                    <Typography variant="body2">
                      Escribe tu nombre para "firmar" tu compromiso (opcional):
                    </Typography>
                    <TextField
                      label="Tu nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      size="small"
                      fullWidth
                    />
                    <FinniMessage
                      variant="success"
                      title="Conocerte es el primer paso"
                      message={`${nombre ? nombre + ', c' : 'C'}onocerte es el primer paso para gastar mejor.`}
                    />
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
