import { useState, useEffect, useMemo } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade, Chip, TextField,
} from '@mui/material';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

type SmartGoal = { queQuieres?: string; monto?: number; plazoMeses?: number; aporteMensual?: number } | null;

const CATEGORIAS = [
  { label: 'Laptop', min: 8000, max: 15000, emoji: '💻' },
  { label: 'Viaje de graduacion', min: 5000, max: 12000, emoji: '✈️' },
  { label: 'Fondo de emergencias', min: 3000, max: 6000, emoji: '🛡️' },
  { label: 'Curso o certificacion', min: 2000, max: 5000, emoji: '📚' },
  { label: 'Celular', min: 4000, max: 10000, emoji: '📱' },
  { label: 'La mia (personalizada)', min: 0, max: 0, emoji: '🎯' },
];

export default function L05() {
  const [step, setStep] = useState(0);
  const [smartGoal, setSmartGoal] = useState<SmartGoal>(null);
  const [meta, setMeta] = useState('');
  const [monto, setMonto] = useState('');
  const [fechaObj, setFechaObj] = useState('');
  const [aportacion, setAportacion] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const prev = await lessonDataRepository.load<SmartGoal>('presupuesto', 'l9_smart_goal');
      setSmartGoal(prev);
      if (prev?.queQuieres) setMeta(prev.queQuieres);
      if (prev?.monto) setMonto(String(prev.monto));
      if (prev?.aporteMensual) setAportacion(String(prev.aporteMensual));
      setLoading(false);
    };
    void load();
  }, []);

  const montoNum = parseFloat(monto) || 0;
  const aportNum = parseFloat(aportacion) || 0;

  const fechaCalculada = useMemo(() => {
    if (!montoNum || !aportNum || aportNum <= 0) return null;
    const meses = Math.ceil(montoNum / aportNum);
    const fecha = new Date();
    fecha.setMonth(fecha.getMonth() + meses);
    return { meses, fecha: fecha.toLocaleDateString('es-MX', { year: 'numeric', month: 'long' }) };
  }, [montoNum, aportNum]);

  const fechaObjDate = fechaObj ? new Date(fechaObj) : null;
  const mesesHastaFecha = fechaObjDate
    ? Math.max(1, Math.ceil((fechaObjDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)))
    : null;
  const aportNecesaria = mesesHastaFecha && montoNum ? Math.ceil(montoNum / mesesHastaFecha) : null;

  const formValid = meta.trim().length >= 3 && montoNum > 0 && aportNum > 0;

  const handleSave = async () => {
    await lessonDataRepository.save('ahorro', 'l5_meta', {
      nombre: meta,
      monto: montoNum,
      fechaObj,
      aportacionMensual: aportNum,
      fechaCalculada: fechaCalculada?.fecha,
      savedAt: new Date().toISOString(),
    });
    setStep(3);
  };

  const progress = step === 0 ? 0 : step === 1 ? 33 : step === 2 ? 66 : 100;

  if (loading) {
    return (
      <LessonShell id="L05" title="Ponle nombre a tu ahorro: define tu meta" completion={{ ready: false }}>
        <Typography variant="body2" color="text.secondary">Cargando datos...</Typography>
      </LessonShell>
    );
  }

  return (
    <LessonShell
      id="L05"
      title="Ponle nombre a tu ahorro: define tu meta"
      completion={{ ready: formValid }}
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
                title="El ahorro sin nombre no dura"
                message="¿Para que estas ahorrando? Si respondes 'para el futuro' o 'por si acaso', necesitamos trabajar eso."
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'success.main', bgcolor: 'success.light' }}>
                <Typography variant="body2" fontWeight={700}>Dato:</Typography>
                <Typography variant="body2">
                  Las personas con una meta especifica ahorran en promedio <b>3 veces mas</b> que quienes ahorran "en general". No es motivacion. Es estructura.
                </Typography>
              </FECard>
              {smartGoal?.queQuieres && (
                <FECard variant="flat" sx={{ border: 1, borderColor: 'info.main', bgcolor: 'info.light' }}>
                  <Typography variant="caption" fontWeight={700}>De tu modulo anterior:</Typography>
                  <Typography variant="body2">Meta: {smartGoal.queQuieres}</Typography>
                  {smartGoal.monto && <Typography variant="body2">Monto: ${smartGoal.monto.toLocaleString()}</Typography>}
                </FECard>
              )}
              <Button fullWidth variant="contained" color="success" size="large" onClick={() => setStep(1)}>
                Ver metas comunes →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 1 — Galeria de inspiracion */}
        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="body1" fontWeight={700}>
                Metas comunes entre universitarios — toca una para preseleccionarla:
              </Typography>
              <Stack spacing={1.5}>
                {CATEGORIAS.map((cat) => (
                  <FECard
                    key={cat.label}
                    variant="flat"
                    sx={{
                      border: 1,
                      borderColor: meta === cat.label || (cat.label === 'La mia (personalizada)' && !CATEGORIAS.slice(0, -1).some((c) => c.label === meta)) ? 'success.main' : 'divider',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      if (cat.label !== 'La mia (personalizada)') {
                        setMeta(cat.label);
                        if (cat.min > 0) setMonto(String(Math.round((cat.min + cat.max) / 2)));
                      } else {
                        setMeta('');
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight={600}>
                        {cat.emoji} {cat.label}
                      </Typography>
                      {cat.min > 0 && (
                        <Chip
                          label={`$${cat.min.toLocaleString()}-$${cat.max.toLocaleString()}`}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </FECard>
                ))}
              </Stack>
              <Button fullWidth variant="contained" color="success" size="large" onClick={() => setStep(2)}>
                Definir mi meta →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 2 — Formulario de 4 campos */}
        {step === 2 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="body1" fontWeight={700}>Define tu meta de ahorro:</Typography>
              <TextField
                label="¿Cual es tu meta de ahorro?"
                value={meta}
                onChange={(e) => setMeta(e.target.value)}
                fullWidth
                size="small"
                placeholder="Ej: Laptop para la escuela"
              />
              <TextField
                label="¿Cuanto dinero necesitas exactamente? ($)"
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                fullWidth
                size="small"
                inputProps={{ min: 0 }}
              />
              <TextField
                label="¿Para cuando? (fecha objetivo)"
                type="date"
                value={fechaObj}
                onChange={(e) => setFechaObj(e.target.value)}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="¿Cuanto puedes apartar por mes? ($)"
                type="number"
                value={aportacion}
                onChange={(e) => setAportacion(e.target.value)}
                fullWidth
                size="small"
                inputProps={{ min: 0 }}
              />

              {/* Barra de progreso proyectada */}
              {fechaCalculada && aportNum > 0 && (
                <Fade in>
                  <FECard variant="flat" sx={{ border: 1, borderColor: 'success.main', bgcolor: 'success.light' }}>
                    <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
                      ¡A ese ritmo, alcanzas tu meta en {fechaCalculada.meses} meses!
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Fecha estimada: {fechaCalculada.fecha}
                    </Typography>
                    {aportNecesaria && aportNecesaria !== aportNum && (
                      <Typography variant="caption" display="block" color="warning.dark" sx={{ mt: 0.5 }}>
                        Para llegar a tu fecha objetivo necesitas apartar ${aportNecesaria.toLocaleString()}/mes.
                      </Typography>
                    )}
                  </FECard>
                </Fade>
              )}

              {formValid && (
                <Fade in>
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    size="large"
                    onClick={() => void handleSave()}
                  >
                    Guardar mi meta →
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
                <Typography variant="h4">🎯 Meta guardada</Typography>
                <Typography variant="body1" fontWeight={700} sx={{ mt: 1 }}>{meta}</Typography>
                <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1 }} flexWrap="wrap">
                  <Chip label={`$${montoNum.toLocaleString()}`} color="success" />
                  <Chip label={`$${aportNum.toLocaleString()}/mes`} color="success" variant="outlined" />
                </Stack>
              </FECard>
              <FinniMessage
                variant="success"
                title="Tu meta esta guardada"
                message="En la proxima leccion construiremos el plan semana a semana."
              />
            </Stack>
          </Fade>
        )}
      </Box>
    </LessonShell>
  );
}
