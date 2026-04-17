import { useState, useEffect } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade,
  Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

const METHODS = [
  { id: 'libreta', label: 'Libreta o agenda', emoji: '📓', pro: 'Rápido, sin batería, lo de toda la vida.' },
  { id: 'excel', label: 'Hoja de cálculo (Excel/Sheets)', emoji: '📊', pro: 'Más organizado, ideal para análisis mensual.' },
  { id: 'app', label: 'App especializada', emoji: '📱', pro: 'Práctica, con categorías automáticas y alertas.' },
];

const CATEGORIAS = ['Alimentación', 'Transporte', 'Educación', 'Entretenimiento', 'Varios'];
const PAGOS = ['Efectivo', 'Tarjeta', 'App de pago', 'Transferencia'];

const MOMENTOS = [
  { id: 'desayuno', time: '8:00 AM', evento: 'Desayuno', detalle: 'Tacos en la entrada', monto: 65, categoria: 'Alimentación' },
  { id: 'transporte', time: '8:45 AM', evento: 'Transporte', detalle: 'Camión al TecToluca', monto: 22, categoria: 'Transporte' },
  { id: 'almuerzo', time: '1:30 PM', evento: 'Almuerzo', detalle: 'Comedor escolar', monto: 95, categoria: 'Alimentación' },
  { id: 'fotocopia', time: '3:00 PM', evento: 'Fotocopia', detalle: 'Papelería', monto: 14, categoria: 'Educación' },
  { id: 'cafe', time: '5:00 PM', evento: 'Café tarde', detalle: 'Cafetería del campus', monto: 52, categoria: 'Alimentación' },
];

type RegistroEntry = { categoria: string; metodoPago: string };

export default function L04() {
  const [step, setStep] = useState(0);
  const [preferredMethod, setPreferredMethod] = useState<string | null>(null);
  const [momentoIdx, setMomentoIdx] = useState(0);
  const [registros, setRegistros] = useState<Record<string, RegistroEntry>>({});
  const [currentCategoria, setCurrentCategoria] = useState('');
  const [currentMetodo, setCurrentMetodo] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const allRegistered = MOMENTOS.every((m) => registros[m.id] !== undefined);
  const totalGasto = MOMENTOS.reduce((a, m) => a + m.monto, 0);

  const registrarGasto = () => {
    const momento = MOMENTOS[momentoIdx];
    if (!currentCategoria || !currentMetodo) return;
    const isCorrectCat = currentCategoria === momento.categoria;
    setRegistros((prev) => ({ ...prev, [momento.id]: { categoria: currentCategoria, metodoPago: currentMetodo } }));
    setFeedback(
      isCorrectCat
        ? '¡Bien categorizado!'
        : `Ojo: ese va en "${momento.categoria}", no "${currentCategoria}"`
    );
    setTimeout(() => {
      setFeedback(null);
      if (momentoIdx < MOMENTOS.length - 1) {
        setMomentoIdx((i) => i + 1);
        setCurrentCategoria('');
        setCurrentMetodo('');
      } else {
        setStep(3);
      }
    }, 1500);
  };

  useEffect(() => {
    if (preferredMethod) {
      void lessonDataRepository.save('presupuesto', 'l4_method', { method: preferredMethod });
    }
  }, [preferredMethod]);

  const currentMomento = MOMENTOS[momentoIdx];

  return (
    <LessonShell
      id="L04"
      title="Registra sin morir en el intento"
      completion={{ ready: allRegistered }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={step === 0 ? 0 : step === 1 ? 25 : step === 2 ? 50 : 100}
          color="warning"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="coach"
                title="¿Intentaste anotar gastos y lo dejaste al tercer día?"
                message="Sí, a todos nos pasó. Hoy vamos a hacerlo de forma que sí dure."
              />
              <Stack spacing={2}>
                {METHODS.map((m) => (
                  <FECard
                    key={m.id}
                    variant="flat"
                    sx={{
                      border: 2,
                      borderColor: preferredMethod === m.id ? 'warning.main' : 'divider',
                      bgcolor: preferredMethod === m.id ? 'warning.light' : 'background.paper',
                      cursor: 'pointer',
                    }}
                    onClick={() => setPreferredMethod(m.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="h2">{m.emoji}</Typography>
                      <Box>
                        <Typography variant="body1" fontWeight={700}>{m.label}</Typography>
                        <Typography variant="body2" color="text.secondary">{m.pro}</Typography>
                      </Box>
                      {preferredMethod === m.id && <CheckCircleIcon color="warning" sx={{ ml: 'auto' }} />}
                    </Stack>
                  </FECard>
                ))}
              </Stack>
              <FinniMessage
                variant="coach"
                title="Clave"
                message="No hay una mejor que otra. Hay una que tú realmente usarás. Esa es la mejor."
              />
              {preferredMethod && (
                <Fade in>
                  <Button fullWidth variant="contained" color="warning" size="large" onClick={() => setStep(1)}>
                    ¡Practicar con Mariana! →
                  </Button>
                </Fade>
              )}
            </Stack>
          </Fade>
        )}

        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <FECard variant="flat" sx={{ bgcolor: 'warning.light', textAlign: 'center', py: 2 }}>
                <Typography variant="h4">El día de Mariana 📚</Typography>
                <Typography variant="body2" color="text.secondary">
                  Mariana es estudiante de 2do semestre. Registra sus 5 gastos del día.
                </Typography>
              </FECard>
              <Typography variant="body2">
                Para cada gasto, elige la <b>categoría</b> y el <b>método de pago</b>. Finni te orientará si te equivocas.
              </Typography>
              <Button fullWidth variant="contained" color="warning" size="large" onClick={() => setStep(2)}>
                ¡Empezar! →
              </Button>
            </Stack>
          </Fade>
        )}

        {step === 2 && currentMomento && (
          <Fade in key={currentMomento.id}>
            <Stack spacing={3}>
              <LinearProgress
                variant="determinate"
                value={(momentoIdx / MOMENTOS.length) * 100}
                color="warning"
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" color="text.secondary">
                Gasto {momentoIdx + 1}/{MOMENTOS.length}
              </Typography>
              <FECard variant="flat" sx={{ border: 2, borderColor: 'warning.main', bgcolor: 'warning.light' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">{currentMomento.time}</Typography>
                  <Typography variant="h4" color="warning.dark">${currentMomento.monto}</Typography>
                </Stack>
                <Typography variant="h4" sx={{ mt: 0.5 }}>{currentMomento.evento}</Typography>
                <Typography variant="body2" color="text.secondary">{currentMomento.detalle}</Typography>
              </FECard>
              <FormControl fullWidth size="small">
                <InputLabel>Categoría</InputLabel>
                <Select value={currentCategoria} onChange={(e) => setCurrentCategoria(e.target.value)} label="Categoría">
                  {CATEGORIAS.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Método de pago</InputLabel>
                <Select value={currentMetodo} onChange={(e) => setCurrentMetodo(e.target.value)} label="Método de pago">
                  {PAGOS.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                </Select>
              </FormControl>
              {feedback && (
                <Fade in>
                  <FECard variant="flat" sx={{ bgcolor: feedback.startsWith('¡') ? 'success.light' : 'warning.light' }}>
                    <Typography variant="body2" fontWeight={700}>
                      {feedback.startsWith('¡') ? '✅' : 'ℹ️'} {feedback}
                    </Typography>
                  </FECard>
                </Fade>
              )}
              {!feedback && (
                <Button
                  fullWidth
                  variant="contained"
                  color="warning"
                  size="large"
                  disabled={!currentCategoria || !currentMetodo}
                  onClick={registrarGasto}
                >
                  Registrar gasto
                </Button>
              )}
            </Stack>
          </Fade>
        )}

        {step === 3 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="success"
                title="¡Día registrado!"
                message="Así se ve un registro completo. ¿Ves qué útil es tenerlo categorizado?"
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography variant="h4" sx={{ mb: 2 }}>Resumen del día de Mariana</Typography>
                <Stack spacing={1}>
                  {MOMENTOS.map((m) => (
                    <Stack key={m.id} direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" fontWeight={700}>{m.evento}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {registros[m.id]?.categoria ?? m.categoria} · {registros[m.id]?.metodoPago ?? '—'}
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={700} color="warning.dark">${m.monto}</Typography>
                    </Stack>
                  ))}
                </Stack>
                <Stack direction="row" justifyContent="space-between" sx={{ mt: 2, pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="body1" fontWeight={700}>Total del día</Typography>
                  <Typography variant="body1" fontWeight={700} color="warning.dark">${totalGasto}</Typography>
                </Stack>
              </FECard>
              <FinniMessage
                variant="coach"
                title="Tu reto"
                message="¿Te animas a registrar tus gastos de hoy en la vida real? Con tu método favorito."
              />
            </Stack>
          </Fade>
        )}
      </Box>
    </LessonShell>
  );
}
