import { useState, useEffect, useMemo } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade, Chip, TextField,
} from '@mui/material';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

type BudgetData = { totalIngresos?: number; pctAhorro?: number } | null;
type MetaData = { nombre?: string; aportacionMensual?: number } | null;

const SITUACIONES = [
  { id: 1, label: 'Laptop descompuesta', costo: '$3,000–$8,000' },
  { id: 2, label: 'Mes sin beca/mesada', costo: '$1,500–$3,000' },
  { id: 3, label: 'Emergencia medica', costo: '$2,000–$10,000' },
  { id: 4, label: 'Falla de transporte personal', costo: '$1,000–$5,000' },
  { id: 5, label: 'Perdida de trabajo part-time', costo: '$800–$3,500/mes' },
];

export default function L08() {
  const [step, setStep] = useState(0);
  const [budgetData, setBudgetData] = useState<BudgetData>(null);
  const [metaData, setMetaData] = useState<MetaData>(null);
  const [selectedSituaciones, setSelectedSituaciones] = useState<Set<number>>(new Set());
  const [gastosMensuales, setGastosMensuales] = useState('');
  const [aportacion, setAportacion] = useState('');
  const [calculado, setCalculado] = useState(false);

  useEffect(() => {
    const load = async () => {
      const budget = await lessonDataRepository.load<BudgetData>('presupuesto', 'l12_budget');
      const meta = await lessonDataRepository.load<MetaData>('ahorro', 'l5_meta');
      setBudgetData(budget);
      setMetaData(meta);
      if (budget?.totalIngresos) {
        setGastosMensuales(String(Math.round(budget.totalIngresos * 0.8)));
      }
    };
    void load();
  }, []);

  const gastosNum = parseFloat(gastosMensuales) || 0;
  const aportNum = parseFloat(aportacion) || 0;

  const metaMinima = useMemo(() => gastosNum * 3, [gastosNum]);
  const metaIdeal = useMemo(() => gastosNum * 6, [gastosNum]);
  const mesesMinima = useMemo(() => (aportNum > 0 ? Math.ceil(metaMinima / aportNum) : 0), [metaMinima, aportNum]);
  const mesesIdeal = useMemo(() => (aportNum > 0 ? Math.ceil(metaIdeal / aportNum) : 0), [metaIdeal, aportNum]);

  const toggleSituacion = (id: number) => {
    setSelectedSituaciones((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const canCalculate = gastosNum > 0 && aportNum > 0;

  const handleCalcular = async () => {
    await lessonDataRepository.save('ahorro', 'l8_fondo', {
      gastosMensuales: gastosNum,
      aportacionMensual: aportNum,
      metaMinima,
      metaIdeal,
      mesesMinima,
      mesesIdeal,
      savedAt: new Date().toISOString(),
    });
    setCalculado(true);
    setStep(3);
  };

  const progress = step === 0 ? 0 : step === 1 ? 25 : step === 2 ? 60 : 100;

  return (
    <LessonShell
      id="L08"
      title="Tu red de seguridad: fondo de emergencias"
      completion={{ ready: calculado }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          color="success"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {/* Pantalla 0 — Apertura */}
        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="coach"
                title="El fondo de emergencias es tu red"
                message="Imagina que mañana se descompone tu laptop justo antes de examenes. ¿Tienes algo guardado para eso? El fondo de emergencias es esa red que atrapa antes del desastre."
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'success.main' }}>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>¿Que es un fondo de emergencias?</Typography>
                <Typography variant="body2">
                  Dinero guardado especificamente para imprevistos. No es para el viaje, no es para la tele nueva. Es para cuando la vida sorprende.
                </Typography>
                <Stack spacing={0.5} sx={{ mt: 1.5 }}>
                  <Typography variant="caption" color="success.dark">✅ 3 meses de gastos basicos — si tienes apoyo familiar</Typography>
                  <Typography variant="caption" color="success.dark">✅ 6 meses — si eres mas independiente</Typography>
                </Stack>
              </FECard>
              <FECard variant="flat" sx={{ border: 1, borderColor: 'info.main', bgcolor: 'info.light' }}>
                <Typography variant="caption" fontWeight={700}>¿Donde guardarlo?</Typography>
                <Typography variant="body2">Cuenta separada, accesible pero no tan facil de retirar. CETES a 28 dias o cuenta con rendimiento son opciones ideales.</Typography>
              </FECard>
              <Button fullWidth variant="contained" color="success" size="large" onClick={() => setStep(1)}>
                ¿Que situaciones te preocupan? →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 1 — Tarjetas de situaciones */}
        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="body1" fontWeight={700}>
                Toca las situaciones que te han pasado o podrian pasarte:
              </Typography>
              <Stack spacing={1.5}>
                {SITUACIONES.map((s) => (
                  <FECard
                    key={s.id}
                    variant="flat"
                    sx={{
                      border: 1,
                      borderColor: selectedSituaciones.has(s.id) ? 'warning.main' : 'divider',
                      bgcolor: selectedSituaciones.has(s.id) ? 'warning.light' : 'background.paper',
                      cursor: 'pointer',
                    }}
                    onClick={() => toggleSituacion(s.id)}
                    role="checkbox"
                    tabIndex={0}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight={600}>
                        {selectedSituaciones.has(s.id) ? '⚠️' : '○'} {s.label}
                      </Typography>
                      <Chip label={s.costo} size="small" color="warning" variant="outlined" />
                    </Stack>
                  </FECard>
                ))}
              </Stack>
              {selectedSituaciones.size > 0 && (
                <Fade in>
                  <FECard variant="flat" sx={{ bgcolor: 'warning.light', border: 1, borderColor: 'warning.main' }}>
                    <Typography variant="body2" fontWeight={700}>
                      {selectedSituaciones.size} situacion(es) identificadas. El fondo de emergencias te protege de estas.
                    </Typography>
                  </FECard>
                </Fade>
              )}
              <Button fullWidth variant="contained" color="success" size="large" onClick={() => setStep(2)}>
                Calcular mi fondo →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 2 — Calculadora */}
        {step === 2 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="body1" fontWeight={700}>Calculadora del fondo de emergencias:</Typography>

              {budgetData?.totalIngresos && (
                <FECard variant="flat" sx={{ border: 1, borderColor: 'info.main', bgcolor: 'info.light' }}>
                  <Typography variant="caption">Datos de tu presupuesto (M1-L12) precargados</Typography>
                </FECard>
              )}

              <TextField
                label="Tus gastos basicos mensuales ($)"
                type="number"
                value={gastosMensuales}
                onChange={(e) => setGastosMensuales(e.target.value)}
                size="small"
                fullWidth
                helperText="Lo minimo para vivir un mes dificil: comida, transporte, servicios"
                inputProps={{ min: 0 }}
              />
              <TextField
                label="¿Cuanto puedes apartar mensualmente? ($)"
                type="number"
                value={aportacion}
                onChange={(e) => setAportacion(e.target.value)}
                size="small"
                fullWidth
                inputProps={{ min: 0 }}
              />

              {canCalculate && (
                <Fade in>
                  <Stack spacing={1.5}>
                    <FECard variant="flat" sx={{ border: 2, borderColor: 'success.main', bgcolor: 'success.light' }}>
                      <Typography variant="body2" fontWeight={700}>Meta minima (3 meses):</Typography>
                      <Typography variant="h4">${metaMinima.toLocaleString()}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Lo alcanzas en {mesesMinima} meses apartando ${aportNum.toLocaleString()}/mes
                      </Typography>
                    </FECard>
                    <FECard variant="flat" sx={{ border: 1, borderColor: 'warning.main', bgcolor: 'warning.light' }}>
                      <Typography variant="body2" fontWeight={700}>Meta ideal (6 meses):</Typography>
                      <Typography variant="h4">${metaIdeal.toLocaleString()}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Lo alcanzas en {mesesIdeal} meses
                      </Typography>
                    </FECard>
                  </Stack>
                </Fade>
              )}

              {metaData?.nombre && (
                <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary">
                    💡 Finni recomienda: primero el fondo minimo (${metaMinima.toLocaleString()}), luego tu meta de "{metaData.nombre}"
                  </Typography>
                </FECard>
              )}

              {canCalculate && (
                <Fade in>
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    size="large"
                    onClick={() => void handleCalcular()}
                  >
                    Guardar mi meta del fondo →
                  </Button>
                </Fade>
              )}
            </Stack>
          </Fade>
        )}

        {/* Pantalla 3 — Confirmacion */}
        {step === 3 && (
          <Fade in>
            <Stack spacing={3}>
              <FECard variant="flat" sx={{ bgcolor: 'success.light', border: 2, borderColor: 'success.main', textAlign: 'center', py: 2 }}>
                <Typography variant="h4">🛡️ Fondo de emergencias</Typography>
                <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1 }} flexWrap="wrap">
                  <Chip label={`Meta minima: $${metaMinima.toLocaleString()}`} color="success" />
                  <Chip label={`Meta ideal: $${metaIdeal.toLocaleString()}`} color="warning" />
                </Stack>
              </FECard>
              <FinniMessage
                variant="success"
                title="No necesitas llegar de golpe"
                message="Construye el fondo gradualmente. Incluso $500 ahorrados ya te protegen de pequeños imprevistos."
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography variant="body2" fontWeight={700}>Donde guardarlo:</Typography>
                {aportNum < 500
                  ? <Typography variant="body2">Cuenta de ahorro basica (sin comisiones)</Typography>
                  : <Typography variant="body2">CETES a 28 dias — cetesdirecto.com (rendimiento adicional)</Typography>
                }
              </FECard>
            </Stack>
          </Fade>
        )}
      </Box>
    </LessonShell>
  );
}
