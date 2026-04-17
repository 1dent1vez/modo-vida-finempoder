import { useState, useEffect } from 'react';
import {
  Box, Stack, Typography, Chip, LinearProgress, Fade, Button,
} from '@mui/material';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

type IncomeType = 'fijo' | 'variable';

const ITEMS: { id: string; label: string; correct: IncomeType }[] = [
  { id: 'pronabes', label: 'Beca PRONABES', correct: 'fijo' },
  { id: 'mesada', label: 'Mesada semanal de papás', correct: 'fijo' },
  { id: 'apuntes', label: 'Venta de apuntes', correct: 'variable' },
  { id: 'cafe', label: 'Trabajo en café escolar', correct: 'fijo' },
  { id: 'cumple', label: 'Regalo de cumpleaños', correct: 'variable' },
  { id: 'logo', label: 'Pago por diseño de logo', correct: 'variable' },
  { id: 'fonacot', label: 'FONACOT de papás', correct: 'variable' },
  { id: 'tutorias', label: 'Ingreso por tutorías', correct: 'variable' },
];

const FEEDBACK: Record<string, string> = {
  pronabes: 'La beca PRONABES llega cada mes con monto fijo.',
  mesada: 'La mesada regular es predecible: entra igual cada semana.',
  apuntes: 'Las ventas varían según la demanda. ¡Es variable!',
  cafe: 'Un trabajo con horario y sueldo definido es fijo.',
  cumple: 'Los regalos no llegan todos los meses, son variables.',
  logo: 'El pago por proyecto cambia. Es ingreso variable.',
  fonacot: 'El crédito FONACOT puede variar con cuotas distintas.',
  tutorias: 'Las tutorías dependen de cuántos alumnos consigas.',
};

export default function L02() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, IncomeType | null>>({});
  const [lastFeedback, setLastFeedback] = useState<{ id: string; correct: boolean } | null>(null);

  const assigned = Object.values(answers).filter(Boolean).length;
  const allDone = ITEMS.every((item) => answers[item.id] !== undefined);
  const correctCount = ITEMS.filter((item) => answers[item.id] === item.correct).length;
  const score = Math.round((correctCount / ITEMS.length) * 100);

  const classify = (type: IncomeType) => {
    if (!selected) return;
    const item = ITEMS.find((i) => i.id === selected);
    if (!item) return;
    const isCorrect = item.correct === type;
    setAnswers((prev) => ({ ...prev, [selected]: type }));
    setLastFeedback({ id: selected, correct: isCorrect });
    setSelected(null);
  };

  useEffect(() => {
    if (allDone) {
      void lessonDataRepository.save('presupuesto', 'l2_incomes', {
        items: ITEMS.map((i) => ({ id: i.id, label: i.label, type: answers[i.id] })),
        correctCount,
        score,
      });
    }
  }, [allDone, answers, correctCount, score]);

  const unassigned = ITEMS.filter((i) => answers[i.id] === undefined);

  return (
    <LessonShell
      id="L02"
      title="Tu dinero tiene nombre: ingresos fijos y variables"
      completion={{ ready: allDone, score }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={step === 0 ? 0 : step === 1 ? 40 : 100}
          color="warning"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {/* Pantalla 0 — Explicación */}
        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="coach"
                title="Finni explica 💡"
                message="Antes de hacer un presupuesto, necesitas saber con qué cuentas. ¿Toda tu lana llega el mismo día y en la misma cantidad? ¿O depende del mes?"
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FECard variant="flat" sx={{ flex: 1, border: 2, borderColor: 'success.main' }}>
                  <Typography variant="h4" sx={{ mb: 1 }}>📅 Ingresos Fijos</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Llegan con regularidad y en cantidad conocida: beca mensual, mesada, trabajo con sueldo fijo.
                  </Typography>
                </FECard>
                <FECard variant="flat" sx={{ flex: 1, border: 2, borderColor: 'warning.main' }}>
                  <Typography variant="h4" sx={{ mb: 1 }}>📊 Ingresos Variables</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Llegan a veces sí, a veces no, o en cantidades distintas: freelance, ventas, propinas, proyectos.
                  </Typography>
                </FECard>
              </Stack>
              <FinniMessage
                variant="coach"
                title="Clave"
                message="Ambos son válidos. La diferencia es cómo los planeas."
              />
              <Button fullWidth variant="contained" color="warning" size="large" onClick={() => setStep(1)}>
                ¡A clasificar! →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 1 — Actividad */}
        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="body1">
                Toca una tarjeta y luego elige si es <b>Fijo</b> o <b>Variable</b>.
              </Typography>

              <LinearProgress
                variant="determinate"
                value={(assigned / ITEMS.length) * 100}
                color="warning"
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" color="text.secondary">
                {assigned}/{ITEMS.length} clasificados
              </Typography>

              {/* Cards to classify */}
              {unassigned.length > 0 && (
                <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                  <Typography variant="body2" fontWeight={700} sx={{ mb: 1.5 }}>
                    Por clasificar:
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1} useFlexGap>
                    {unassigned.map((item) => (
                      <Chip
                        key={item.id}
                        label={item.label}
                        onClick={() => setSelected(selected === item.id ? null : item.id)}
                        color={selected === item.id ? 'warning' : 'default'}
                        variant={selected === item.id ? 'filled' : 'outlined'}
                        sx={{ fontWeight: 600, cursor: 'pointer', minHeight: 36 }}
                      />
                    ))}
                  </Stack>
                </FECard>
              )}

              {/* Classification buttons */}
              {selected && (
                <Fade in>
                  <Stack direction="row" spacing={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      onClick={() => classify('fijo')}
                      sx={{ fontWeight: 700 }}
                    >
                      📅 Fijo
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      color="warning"
                      onClick={() => classify('variable')}
                      sx={{ fontWeight: 700 }}
                    >
                      📊 Variable
                    </Button>
                  </Stack>
                </Fade>
              )}

              {/* Feedback */}
              {lastFeedback && (
                <Fade in>
                  <FECard
                    variant="flat"
                    sx={{
                      bgcolor: lastFeedback.correct ? 'success.light' : 'warning.light',
                      border: 1,
                      borderColor: lastFeedback.correct ? 'success.main' : 'warning.main',
                    }}
                  >
                    <Typography variant="body2" fontWeight={700}>
                      {lastFeedback.correct ? '✅ Correcto' : '⚠️ Casi'}
                    </Typography>
                    <Typography variant="body2">{FEEDBACK[lastFeedback.id]}</Typography>
                  </FECard>
                </Fade>
              )}

              {/* Classified items */}
              {Object.keys(answers).length > 0 && (
                <Stack spacing={1}>
                  {(['fijo', 'variable'] as IncomeType[]).map((type) => {
                    const items = ITEMS.filter((i) => answers[i.id] === type);
                    if (items.length === 0) return null;
                    return (
                      <FECard key={type} variant="flat" sx={{ bgcolor: type === 'fijo' ? 'success.light' : 'warning.light' }}>
                        <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                          {type === 'fijo' ? '📅 Fijos' : '📊 Variables'}:
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" gap={1} useFlexGap>
                          {items.map((i) => (
                            <Chip key={i.id} label={i.label} size="small" />
                          ))}
                        </Stack>
                      </FECard>
                    );
                  })}
                </Stack>
              )}

              {/* Resultado */}
              {allDone && (
                <Fade in>
                  <Stack spacing={2}>
                    <FECard variant="flat" sx={{ bgcolor: 'success.light', border: 2, borderColor: 'success.main', textAlign: 'center' }}>
                      <Typography variant="h4">Ingresos Clasificados ✓</Typography>
                      <Typography variant="body1" fontWeight={700}>
                        {correctCount}/8 correctos ({score}%)
                      </Typography>
                    </FECard>
                    <FinniMessage
                      variant="success"
                      title="¡Bien hecho!"
                      message="Conocer tus ingresos es el primer paso. En la Lección 12 usaremos esta info para tu presupuesto real."
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
