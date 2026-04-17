import { useState } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade, Chip,
} from '@mui/material';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';

type Classification = 'planned' | 'unplanned' | null;

const WEEK_EVENTS = [
  { day: 'Lunes', desc: 'Cobro beca/mesada', amount: 2000, isIncome: true },
  { day: 'Martes', desc: 'Café + transporte', amount: -75 },
  { day: 'Miércoles', desc: 'Comida rápida + Netflix', amount: -219 },
  { day: 'Jueves', desc: 'Salida con amigos', amount: -350 },
  { day: 'Viernes', desc: 'Impresiones + snack', amount: -95 },
  { day: 'Sábado', desc: 'Gastos varios', amount: -200 },
  { day: 'Domingo', desc: 'Gastos varios', amount: -200 },
];

const GASTOS = [
  { id: 'cafe', label: 'Café $45 + transporte $30' },
  { id: 'comida', label: 'Comida rápida $120' },
  { id: 'netflix', label: 'Netflix $99' },
  { id: 'amigos', label: 'Salida con amigos $350' },
  { id: 'impresiones', label: 'Impresiones $60' },
  { id: 'snack', label: 'Snack $35' },
  { id: 'varios', label: 'Gastos varios $400' },
];

export default function L01() {
  const [step, setStep] = useState(0);
  const [quincenaAnswer, setQuincenaAnswer] = useState<string | null>(null);
  const [classifications, setClassifications] = useState<Record<string, Classification>>({});

  const allClassified = GASTOS.every((g) => classifications[g.id] !== undefined && classifications[g.id] !== null);

  const classify = (id: string, val: Classification) => {
    setClassifications((prev) => ({ ...prev, [id]: val }));
  };

  // Running balance for timeline
  let balance = 0;
  const timeline = WEEK_EVENTS.map((e) => {
    balance += e.amount;
    return { ...e, balance };
  });
  const maxBalance = 2000;

  return (
    <LessonShell
      id="L01"
      title="¿A dónde se fue mi quincena?"
      completion={{ ready: allClassified }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={step === 0 ? 0 : step === 1 ? 33 : step === 2 ? 66 : 100}
          color="warning"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {/* Pantalla 0 — Apertura con Finni */}
        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="coach"
                title="¡Hola! Soy Finni 👋"
                message="Oye… ¿ya es martes y tu tarjeta dice $47? Tranqui, a casi todos nos ha pasado. Hoy vamos a resolver el misterio más común entre universitarios: ¿a dónde se va el dinero?"
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'warning.main' }}>
                <Typography variant="h4" sx={{ mb: 2 }}>
                  ¿Cuánto tiempo te duró la última quincena o semana?
                </Typography>
                <Stack spacing={1.5}>
                  {['Menos de 3 días', 'Una semana', 'Dos semanas', 'Me sobró algo'].map((opt) => (
                    <Button
                      key={opt}
                      variant={quincenaAnswer === opt ? 'contained' : 'outlined'}
                      color="warning"
                      onClick={() => setQuincenaAnswer(opt)}
                      sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                    >
                      {opt}
                    </Button>
                  ))}
                </Stack>
              </FECard>
              {quincenaAnswer && (
                <Fade in>
                  <Button
                    fullWidth
                    variant="contained"
                    color="warning"
                    size="large"
                    onClick={() => setStep(1)}
                  >
                    Ver cómo se va el dinero →
                  </Button>
                </Fade>
              )}
            </Stack>
          </Fade>
        )}

        {/* Pantalla 1 — Línea de tiempo visual */}
        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="h4">Una semana en tu bolsillo 📅</Typography>
              <Stack spacing={1}>
                {timeline.map((event) => (
                  <FECard key={event.day} variant="flat" sx={{ p: 1.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={700}>{event.day}</Typography>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color={event.isIncome ? 'success.main' : 'error.main'}
                      >
                        {event.isIncome ? '+' : ''}{event.amount > 0 ? `+$${event.amount}` : `-$${Math.abs(event.amount)}`}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">{event.desc}</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.max(0, (event.balance / maxBalance) * 100)}
                      color={event.balance > 500 ? 'success' : event.balance > 100 ? 'warning' : 'error'}
                      sx={{ mt: 1, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Saldo: ${event.balance}
                    </Typography>
                  </FECard>
                ))}
              </Stack>
              <FinniMessage
                variant="coach"
                title="¿Ves el patrón?"
                message="Gastos pequeños, gastos grandes, gastos que ni recuerdas. Y de repente: cero."
              />
              <Button fullWidth variant="contained" color="warning" size="large" onClick={() => setStep(2)}>
                ¿Cuáles planeaste? →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 2 — Clasificación */}
        {step === 2 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="coach"
                title="¿Reconoces alguno?"
                message="¿Cuántos de estos gastos planeaste y cuántos llegaron solos? Toca cada uno y clasifícalo."
              />
              <Stack spacing={2}>
                {GASTOS.map((g) => (
                  <FECard key={g.id} variant="flat" sx={{ p: 1.5, border: 1, borderColor: 'divider' }}>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                      {g.label}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        label="Lo planeé ✓"
                        color={classifications[g.id] === 'planned' ? 'success' : 'default'}
                        onClick={() => classify(g.id, 'planned')}
                        sx={{ cursor: 'pointer', fontWeight: 600 }}
                      />
                      <Chip
                        label="No lo planeé"
                        color={classifications[g.id] === 'unplanned' ? 'warning' : 'default'}
                        onClick={() => classify(g.id, 'unplanned')}
                        sx={{ cursor: 'pointer', fontWeight: 600 }}
                      />
                    </Stack>
                  </FECard>
                ))}
              </Stack>
              {allClassified && (
                <Fade in>
                  <Button fullWidth variant="contained" color="warning" size="large" onClick={() => setStep(3)}>
                    Ver el dato clave →
                  </Button>
                </Fade>
              )}
            </Stack>
          </Fade>
        )}

        {/* Pantalla 3 — Dato clave + cierre */}
        {step === 3 && (
          <Fade in>
            <Stack spacing={3}>
              <FECard variant="flat" sx={{ bgcolor: 'warning.light', border: 2, borderColor: 'warning.main', textAlign: 'center', py: 3 }}>
                <Typography variant="h2" sx={{ mb: 1 }}>68%</Typography>
                <Typography variant="body1" fontWeight={700}>
                  de los universitarios no sabe exactamente cuánto gasta al mes.
                </Typography>
                <Typography variant="caption" color="text.secondary">Fuente: CONDUSEF</Typography>
              </FECard>
              <FECard variant="flat" sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" sx={{ fontStyle: 'italic', color: 'warning.dark' }}>
                  "Un presupuesto no te quita libertad. Te da claridad."
                </Typography>
              </FECard>
              <FinniMessage
                variant="success"
                title="¿Ves el patrón?"
                message="Cuando no planeamos, el dinero planea por nosotros. En las siguientes lecciones vamos a cambiar eso."
              />
            </Stack>
          </Fade>
        )}
      </Box>
    </LessonShell>
  );
}
