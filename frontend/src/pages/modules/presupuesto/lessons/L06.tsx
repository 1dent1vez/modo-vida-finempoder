import { useState } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade,
} from '@mui/material';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';

const INGRESOS_ROBERTO = [
  { label: 'Beca PRONABES', monto: 1800 },
  { label: 'Mesada de papás', monto: 800 },
  { label: 'Tutorías (este mes)', monto: 400 },
];

const GASTOS_ROBERTO = [
  { label: 'Comida', monto: 850 },
  { label: 'Transporte', monto: 320 },
  { label: 'Materiales', monto: 180 },
  { label: 'Entretenimiento', monto: 650 },
  { label: 'Otros', monto: 280 },
];

const TOTAL_INGRESOS = INGRESOS_ROBERTO.reduce((a, i) => a + i.monto, 0);
const TOTAL_GASTOS = GASTOS_ROBERTO.reduce((a, g) => a + g.monto, 0);
const BALANCE = TOTAL_INGRESOS - TOTAL_GASTOS;

export default function L06() {
  const [step, setStep] = useState(0);
  const [pasoRoberto, setPasoRoberto] = useState(0); // 0=ingresos 1=gastos 2=balance

  const allStepsDone = pasoRoberto >= 3;

  return (
    <LessonShell
      id="L06"
      title="¿Quedaste en números rojos? Calcula tu balance mensual"
      completion={{ ready: allStepsDone }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={step === 0 ? 0 : step === 1 ? 40 : 100}
          color="warning"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="coach"
                title="Finni con calculadora 🧮"
                message="¿Sabes si este mes gastaste más de lo que ganaste? No asumir, calcular. Esa es la diferencia entre saber y creer que sabes."
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'warning.main' }}>
                <Typography variant="body1" fontWeight={700} sx={{ mb: 1 }}>Conceptos clave:</Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    📊 <b>Balance mensual</b> = Ingresos totales − Gastos totales
                  </Typography>
                  <Typography variant="body2" color="success.main" fontWeight={600}>
                    ✅ Superávit: sobra dinero → ¿lo estás ahorrando o gastando después?
                  </Typography>
                  <Typography variant="body2" color="error.main" fontWeight={600}>
                    ❌ Déficit: gastaste más de lo que entraste → ¿es temporal o tu patrón normal?
                  </Typography>
                </Stack>
              </FECard>
              <FinniMessage
                variant="coach"
                title="Clave"
                message="Ninguno de los dos es bueno o malo por sí solo. Lo importante es saberlo y actuar."
              />
              <Button fullWidth variant="contained" color="warning" size="large" onClick={() => setStep(1)}>
                ¡Calcular con Roberto! →
              </Button>
            </Stack>
          </Fade>
        )}

        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <FECard variant="flat" sx={{ bgcolor: 'warning.light', textAlign: 'center', py: 1.5 }}>
                <Typography variant="h4">El mes de Roberto 🎓</Typography>
                <Typography variant="body2" color="text.secondary">Estudiante de 3er semestre</Typography>
              </FECard>

              {/* Paso 1 — Ingresos */}
              {pasoRoberto === 0 && (
                <Fade in>
                  <Stack spacing={2}>
                    <Typography variant="body1" fontWeight={700}>Paso 1: Suma los ingresos de Roberto</Typography>
                    <Stack spacing={1}>
                      {INGRESOS_ROBERTO.map((i, idx) => (
                        <FECard key={idx} variant="flat" sx={{ border: 1, borderColor: 'success.light' }}>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2">{i.label}</Typography>
                            <Typography variant="body2" fontWeight={700} color="success.main">+${i.monto.toLocaleString()}</Typography>
                          </Stack>
                        </FECard>
                      ))}
                    </Stack>
                    <FECard variant="flat" sx={{ bgcolor: 'success.light', border: 2, borderColor: 'success.main' }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body1" fontWeight={700}>Total ingresos</Typography>
                        <Typography variant="body1" fontWeight={700} color="success.main">${TOTAL_INGRESOS.toLocaleString()}</Typography>
                      </Stack>
                    </FECard>
                    <Button fullWidth variant="contained" color="warning" size="large" onClick={() => setPasoRoberto(1)}>
                      Ver gastos →
                    </Button>
                  </Stack>
                </Fade>
              )}

              {/* Paso 2 — Gastos */}
              {pasoRoberto === 1 && (
                <Fade in>
                  <Stack spacing={2}>
                    <Typography variant="body1" fontWeight={700}>Paso 2: Suma los gastos del mes</Typography>
                    <Stack spacing={1}>
                      {GASTOS_ROBERTO.map((g, idx) => (
                        <FECard key={idx} variant="flat" sx={{ border: 1, borderColor: 'error.light' }}>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2">{g.label}</Typography>
                            <Typography variant="body2" fontWeight={700} color="error.main">-${g.monto.toLocaleString()}</Typography>
                          </Stack>
                        </FECard>
                      ))}
                    </Stack>
                    <FECard variant="flat" sx={{ bgcolor: 'error.light', border: 2, borderColor: 'error.main' }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body1" fontWeight={700}>Total gastos</Typography>
                        <Typography variant="body1" fontWeight={700} color="error.main">${TOTAL_GASTOS.toLocaleString()}</Typography>
                      </Stack>
                    </FECard>
                    <Button fullWidth variant="contained" color="warning" size="large" onClick={() => setPasoRoberto(2)}>
                      Calcular balance →
                    </Button>
                  </Stack>
                </Fade>
              )}

              {/* Paso 3 — Balance */}
              {pasoRoberto === 2 && (
                <Fade in>
                  <Stack spacing={2}>
                    <Typography variant="body1" fontWeight={700}>Paso 3: Balance de Roberto</Typography>
                    <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2">Ingresos</Typography>
                          <Typography variant="body2" color="success.main" fontWeight={700}>+${TOTAL_INGRESOS.toLocaleString()}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2">Gastos</Typography>
                          <Typography variant="body2" color="error.main" fontWeight={700}>-${TOTAL_GASTOS.toLocaleString()}</Typography>
                        </Stack>
                      </Stack>
                    </FECard>
                    <FECard variant="flat" sx={{ bgcolor: 'success.light', border: 2, borderColor: 'success.main', textAlign: 'center', py: 2 }}>
                      <Typography variant="h3" color="success.dark">${BALANCE.toLocaleString()}</Typography>
                      <Typography variant="body1" fontWeight={700} color="success.dark">Superávit ✓</Typography>
                    </FECard>
                    <FinniMessage
                      variant="success"
                      title="¡Bien Roberto!"
                      message="Tiene $720 de superávit. Finni le recomienda destinarlo a su fondo de ahorro o meta financiera."
                    />
                    <Button fullWidth variant="contained" color="warning" size="large" onClick={() => { setPasoRoberto(3); setStep(2); }}>
                      Ver mi propio balance →
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
              <FinniMessage
                variant="coach"
                title="¿Y tú?"
                message="¿Quieres calcular tu balance real de este mes? En la lección 12 construiremos tu presupuesto completo con tus datos reales."
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'warning.main', bgcolor: 'warning.light', p: 2 }}>
                <Typography variant="body1" fontWeight={700}>Fórmula para tu balance:</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Total de lo que recibiste este mes<br />
                  <b>menos</b><br />
                  Total de lo que gastaste este mes<br />
                  <b>=</b> Tu balance
                </Typography>
              </FECard>
              <FinniMessage
                variant="success"
                title="Lección completada"
                message="Ya sabes cómo calcular tu balance mensual. ¡Ese es el primer paso para tomar control de tu dinero!"
              />
            </Stack>
          </Fade>
        )}
      </Box>
    </LessonShell>
  );
}
