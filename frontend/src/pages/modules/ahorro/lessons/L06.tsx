import { useState, useEffect, useMemo } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade, Chip, TextField,
} from '@mui/material';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

type Horizon = 1 | 3 | 6;
type MetaData = { nombre?: string; monto?: number; aportacionMensual?: number } | null;

const HORIZON_WEEKS: Record<Horizon, number> = { 1: 4, 3: 13, 6: 26 };

const PLAN_DESCRIPTIONS: Record<Horizon, { title: string; desc: string }> = {
  1: { title: 'Plan 1 mes', desc: 'Para metas pequeñas o fondo de emergencias inicial. Requiere disciplina alta.' },
  3: { title: 'Plan 3 meses', desc: 'El mas recomendado para comenzar. Permite ajustes y tiene resultados visibles.' },
  6: { title: 'Plan 6 meses', desc: 'Para metas medianas. Requiere constancia. La clave es la automatizacion.' },
};

export default function L06() {
  const [step, setStep] = useState(0);
  const [horizon, setHorizon] = useState<Horizon | null>(null);
  const [metaData, setMetaData] = useState<MetaData>(null);
  const [weekAmounts, setWeekAmounts] = useState<Record<number, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const meta = await lessonDataRepository.load<MetaData>('ahorro', 'l5_meta');
      setMetaData(meta);
    };
    void load();
  }, []);

  const numWeeks = horizon ? HORIZON_WEEKS[horizon] : 0;

  const totalPlanado = useMemo(
    () => Object.values(weekAmounts).reduce((sum, v) => sum + (parseFloat(v) || 0), 0),
    [weekAmounts]
  );

  const weeksWithAmount = Object.values(weekAmounts).filter((v) => parseFloat(v) > 0).length;
  const requiredFilled = Math.ceil(numWeeks * 0.8);
  const canComplete = horizon !== null && weeksWithAmount >= requiredFilled && saved;

  const handleWeekChange = (week: number, val: string) => {
    setWeekAmounts((prev) => ({ ...prev, [week]: val }));
  };

  const handleSave = async () => {
    await lessonDataRepository.save('ahorro', 'l6_plan', {
      horizon,
      numWeeks,
      weekAmounts,
      totalPlanado,
      savedAt: new Date().toISOString(),
    });
    setSaved(true);
    setStep(3);
  };

  const metaMonto = metaData?.monto ?? 0;
  const pctAlcanzado = metaMonto > 0 ? Math.min(100, (totalPlanado / metaMonto) * 100) : 0;

  const progress = step === 0 ? 0 : step === 1 ? 25 : step === 2 ? 60 : 100;

  return (
    <LessonShell
      id="L06"
      title="Tu plan de ahorro: 1, 3 o 6 meses"
      completion={{ ready: canComplete }}
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
                title="El plan es el como"
                message="Tener una meta es el que. El plan es el como. Hoy vamos a construir tu plan de ahorro semana a semana."
              />
              <Stack spacing={2}>
                {([1, 3, 6] as Horizon[]).map((h) => (
                  <FECard key={h} variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                    <Typography variant="body2" fontWeight={700}>{PLAN_DESCRIPTIONS[h].title}</Typography>
                    <Typography variant="body2" color="text.secondary">{PLAN_DESCRIPTIONS[h].desc}</Typography>
                  </FECard>
                ))}
              </Stack>
              <FinniMessage
                variant="coach"
                title="El plan perfecto no existe"
                message="El plan que tu realmente vas a seguir, ese existe. Empecemos por ahi."
              />
              <Button fullWidth variant="contained" color="success" size="large" onClick={() => setStep(1)}>
                Elegir mi horizonte →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 1 — Selector de horizonte */}
        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="body1" fontWeight={700}>¿Cuanto tiempo dura tu plan?</Typography>
              {metaData?.nombre && (
                <FECard variant="flat" sx={{ border: 1, borderColor: 'info.main', bgcolor: 'info.light' }}>
                  <Typography variant="caption">Tu meta: <b>{metaData.nombre}</b> — ${metaData.monto?.toLocaleString()}</Typography>
                </FECard>
              )}
              <Stack spacing={2}>
                {([1, 3, 6] as Horizon[]).map((h) => (
                  <Button
                    key={h}
                    variant={horizon === h ? 'contained' : 'outlined'}
                    color="success"
                    size="large"
                    onClick={() => setHorizon(h)}
                    sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                  >
                    <Stack sx={{ textAlign: 'left' }}>
                      <Typography variant="body2" fontWeight={700}>{PLAN_DESCRIPTIONS[h].title}</Typography>
                      <Typography variant="caption">{HORIZON_WEEKS[h]} semanas</Typography>
                    </Stack>
                  </Button>
                ))}
              </Stack>
              {horizon && (
                <Fade in>
                  <Button fullWidth variant="contained" color="success" size="large" onClick={() => setStep(2)}>
                    Construir mi calendario ({HORIZON_WEEKS[horizon]} semanas) →
                  </Button>
                </Fade>
              )}
            </Stack>
          </Fade>
        )}

        {/* Pantalla 2 — Calendario semanal */}
        {step === 2 && horizon && (
          <Fade in>
            <Stack spacing={3}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body1" fontWeight={700}>
                  Asigna un monto a cada semana:
                </Typography>
                <Chip
                  label={`${weeksWithAmount}/${numWeeks} sem`}
                  color={weeksWithAmount >= requiredFilled ? 'success' : 'default'}
                  size="small"
                />
              </Stack>

              {/* Barra de meta */}
              {metaMonto > 0 && (
                <FECard variant="flat" sx={{ border: 1, borderColor: 'success.light' }}>
                  <Typography variant="caption" color="text.secondary">
                    Progreso hacia la meta: ${totalPlanado.toLocaleString()} / ${metaMonto.toLocaleString()}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={pctAlcanzado}
                    color="success"
                    sx={{ mt: 0.5, height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="success.dark">{pctAlcanzado.toFixed(0)}% planeado</Typography>
                </FECard>
              )}

              <Stack spacing={1}>
                {Array.from({ length: numWeeks }, (_, i) => i + 1).map((week) => (
                  <Stack key={week} direction="row" spacing={1.5} alignItems="center">
                    <Typography variant="caption" sx={{ minWidth: 60, color: 'text.secondary' }}>
                      Semana {week}
                    </Typography>
                    <TextField
                      size="small"
                      type="number"
                      placeholder="$0"
                      value={weekAmounts[week] ?? ''}
                      onChange={(e) => handleWeekChange(week, e.target.value)}
                      inputProps={{ min: 0, step: 50 }}
                      sx={{ flex: 1 }}
                    />
                  </Stack>
                ))}
              </Stack>

              <FECard variant="flat" sx={{ bgcolor: 'success.light', textAlign: 'center' }}>
                <Typography variant="body2" fontWeight={700}>Total planeado: ${totalPlanado.toLocaleString()}</Typography>
              </FECard>

              {weeksWithAmount >= requiredFilled && (
                <Fade in>
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    size="large"
                    onClick={() => void handleSave()}
                  >
                    Guardar mi plan →
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
                <Typography variant="h4">✅ Plan guardado</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {horizon && PLAN_DESCRIPTIONS[horizon].title} · ${totalPlanado.toLocaleString()} planeados
                </Typography>
              </FECard>
              <FinniMessage
                variant="success"
                title="Tu plan esta listo"
                message="Cada semana recibirás un aviso para aportar a tu meta. La constancia es lo que distingue a quien ahorra de quien intenta ahorrar."
              />
            </Stack>
          </Fade>
        )}
      </Box>
    </LessonShell>
  );
}
