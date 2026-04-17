import { useEffect, useState } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade,
  TextField, Paper,
} from '@mui/material';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

const ORDEN = [
  { num: 1, titulo: 'Gastos básicos del mes cubiertos', color: 'error' },
  { num: 2, titulo: 'Fondo de emergencias activo (1-3 meses de gastos básicos)', color: 'warning' },
  { num: 3, titulo: 'Deudas de corto plazo bajo control', color: 'info' },
  { num: 4, titulo: 'Solo el sobrante va a inversión', color: 'success' },
];

export default function L04() {
  const [step, setStep] = useState(0);
  const [ingreso, setIngreso] = useState(3500);
  const [gastos, setGastos] = useState(2200);
  const [fondoEmergencias, setFondoEmergencias] = useState(0);
  const [ahorroMeta, setAhorroMeta] = useState(300);
  const [guardado, setGuardado] = useState(false);
  const [emergenciaM2, setEmergenciaM2] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await lessonDataRepository.load<{ montoMeta?: number }>('ahorro', 'l08_fondo_emergencias');
      if (data?.montoMeta) setEmergenciaM2(data.montoMeta);

      const saved = await lessonDataRepository.load<{ capital: number; ingreso: number; gastos: number }>('inversion', 'l04_capital');
      if (saved) {
        setIngreso(saved.ingreso);
        setGastos(saved.gastos);
      }
    };
    void load();
  }, []);

  const capitalInversion = Math.max(0, ingreso - gastos - fondoEmergencias - ahorroMeta);
  const fondoCubierto = emergenciaM2 !== null ? fondoEmergencias >= emergenciaM2 : fondoEmergencias > 0;

  const handleGuardar = async () => {
    await lessonDataRepository.save('inversion', 'l04_capital', {
      capital: capitalInversion,
      ingreso,
      gastos,
    });
    setGuardado(true);
  };

  const finniMsg = () => {
    if (capitalInversion >= 100 && capitalInversion < 500) {
      return { tipo: 'poco', msg: 'Con CETES puedes empezar desde $100. No hay mínimo imposible.' };
    } else if (capitalInversion >= 500) {
      return { tipo: 'si', msg: `¡Tienes $${capitalInversion.toLocaleString()} disponibles para invertir! En la lección 13 construiremos tu plan.` };
    } else {
      return { tipo: 'no', msg: 'Primero fortalezcamos tu fondo de emergencias. Ajusta tus gastos para liberar capital de inversión.' };
    }
  };

  const fm = finniMsg();

  return (
    <LessonShell
      id="L04"
      title="Invierte solo lo que puedes 'no ver' un tiempo"
      completion={{ ready: guardado }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={(step / 3) * 100}
          color="info"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {/* Pantalla 0 — Apertura + el orden correcto */}
        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="coach"
                title="Antes de invertir un solo peso..."
                message="Hay que responder una pregunta honesta: ¿puedo no ver este dinero por X meses sin que afecte mi vida? Si la respuesta es no, ese dinero no debe invertirse."
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography variant="body1" fontWeight={700} sx={{ mb: 2 }}>
                  El orden correcto antes de invertir:
                </Typography>
                <Stack spacing={1.5}>
                  {ORDEN.map((o) => (
                    <Stack key={o.num} direction="row" spacing={2} alignItems="center">
                      <Paper
                        sx={{
                          width: 32, height: 32, borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          bgcolor: `${o.color}.main`, flexShrink: 0,
                        }}
                      >
                        <Typography variant="body2" fontWeight={800} color="white">{o.num}</Typography>
                      </Paper>
                      <Typography variant="body2">{o.titulo}</Typography>
                    </Stack>
                  ))}
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                  "No existe inversión segura que valga la pena si para hacerla tienes que dejar de pagar tu transporte o tu comida."
                </Typography>
              </FECard>
              <FECard variant="flat" sx={{ bgcolor: 'info.light', border: 1, borderColor: 'info.main' }}>
                <Typography variant="body2" fontWeight={700}>¿Qué es el capital disponible para inversión?</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  El dinero que, cuando lo apartas, no te genera angustia ni urgencia de recuperarlo pronto.
                  No es el que sobra al final del mes (eso va a ahorro). Es un excedente real y consciente.
                </Typography>
              </FECard>
              <Button fullWidth variant="contained" color="info" size="large" onClick={() => setStep(1)}>
                Ver simulación de flujo →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 1 — Simulación de flujo */}
        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="h4" fontWeight={700}>Simulación: flujo de dinero</Typography>
              <Typography variant="body2" color="text.secondary">
                Estudiante ficticio con $3,500/mes. Observa cómo se distribuye:
              </Typography>
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                {[
                  { label: 'Ingreso mensual', valor: 3500, color: 'success.main' },
                  { label: '− Gastos fijos y variables', valor: -2200, color: 'error.main' },
                  { label: '− Fondo de emergencias', valor: -300, color: 'warning.main' },
                  { label: '− Ahorro meta', valor: -200, color: 'info.main' },
                  { label: '= Capital de inversión', valor: 800, color: 'success.dark' },
                ].map((row) => (
                  <Stack key={row.label} direction="row" justifyContent="space-between" sx={{ py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2">{row.label}</Typography>
                    <Typography variant="body2" fontWeight={700} color={row.color}>
                      ${Math.abs(row.valor).toLocaleString()}
                    </Typography>
                  </Stack>
                ))}
              </FECard>
              <FinniMessage
                variant="coach"
                title="La validación es clave"
                message="No puedes asignar a inversión sin antes cubrir los otros destinos. El orden importa."
              />
              <Button fullWidth variant="contained" color="info" size="large" onClick={() => setStep(2)}>
                Calcular mi capital real →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 2 — Cálculo personal */}
        {step === 2 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="h4" fontWeight={700}>Tu cálculo personal</Typography>
              {emergenciaM2 !== null && (
                <FECard variant="flat" sx={{ bgcolor: 'info.light', border: 1, borderColor: 'info.main' }}>
                  <Typography variant="caption" fontWeight={700}>Desde Módulo 2:</Typography>
                  <Typography variant="body2">Tu meta de fondo de emergencias: ${emergenciaM2.toLocaleString()}</Typography>
                </FECard>
              )}
              <Stack spacing={2}>
                <TextField
                  label="Ingreso mensual ($)"
                  type="number"
                  value={ingreso}
                  onChange={(e) => setIngreso(Math.max(0, Number(e.target.value)))}
                  size="small"
                  inputProps={{ min: 0, step: 100 }}
                />
                <TextField
                  label="Gastos fijos y variables ($)"
                  type="number"
                  value={gastos}
                  onChange={(e) => setGastos(Math.max(0, Number(e.target.value)))}
                  size="small"
                  inputProps={{ min: 0, step: 100 }}
                />
                <TextField
                  label="Ahorro para fondo de emergencias ($)"
                  type="number"
                  value={fondoEmergencias}
                  onChange={(e) => setFondoEmergencias(Math.max(0, Number(e.target.value)))}
                  size="small"
                  inputProps={{ min: 0, step: 50 }}
                  helperText={emergenciaM2 ? `Meta: $${emergenciaM2.toLocaleString()}${fondoCubierto ? ' ✅' : ' (aún no cubierta)'}` : undefined}
                />
                <TextField
                  label="Ahorro para meta específica ($)"
                  type="number"
                  value={ahorroMeta}
                  onChange={(e) => setAhorroMeta(Math.max(0, Number(e.target.value)))}
                  size="small"
                  inputProps={{ min: 0, step: 50 }}
                />
              </Stack>
              <Paper sx={{ p: 2, borderRadius: 3, bgcolor: capitalInversion > 0 ? 'success.light' : 'grey.100', border: 2, borderColor: capitalInversion > 0 ? 'success.main' : 'divider' }}>
                <Typography variant="body2">Capital disponible para inversión:</Typography>
                <Typography variant="h4" fontWeight={900} color={capitalInversion > 0 ? 'success.dark' : 'text.secondary'}>
                  ${capitalInversion.toLocaleString()}
                </Typography>
              </Paper>
              <FinniMessage
                variant={fm.tipo === 'si' ? 'success' : fm.tipo === 'poco' ? 'coach' : 'coach'}
                title={fm.tipo === 'si' ? '¡Tienes capital para invertir!' : fm.tipo === 'poco' ? 'Pequeño pero real' : 'Aún no es momento'}
                message={fm.msg}
              />
              <Button
                fullWidth
                variant="contained"
                color="info"
                size="large"
                onClick={() => void handleGuardar()}
                disabled={guardado}
              >
                {guardado ? `✅ Guardado — capital: $${capitalInversion.toLocaleString()}` : 'Guardar mi capital disponible'}
              </Button>
            </Stack>
          </Fade>
        )}
      </Box>
    </LessonShell>
  );
}
