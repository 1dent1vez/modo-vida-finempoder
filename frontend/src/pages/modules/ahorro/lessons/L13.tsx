import { useState, useEffect } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade, Chip, TextField,
} from '@mui/material';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

type MetaData = { nombre?: string; monto?: number; aportacionMensual?: number } | null;
type PlanData = { totalPlanado?: number; horizon?: number } | null;
type RetoData = { totalAcumulado?: number; dayAmounts?: number[] } | null;

type IndicadorColor = 'success' | 'warning' | 'error';

type Indicador = {
  label: string;
  valor: string;
  color: IndicadorColor;
  comentario: string;
};

function buildIndicadores(meta: MetaData, plan: PlanData, reto: RetoData): Indicador[] {
  const montoMeta = meta?.monto ?? 0;
  const totalAcumulado = reto?.totalAcumulado ?? 0;
  const totalPlanado = plan?.totalPlanado ?? 0;
  const pct = montoMeta > 0 ? Math.min(100, (totalAcumulado / montoMeta) * 100) : 0;

  const dayAmounts = reto?.dayAmounts ?? [];
  const consistencia: IndicadorColor = dayAmounts.length >= 3 ? 'success' : dayAmounts.length >= 1 ? 'warning' : 'error';
  const progreso: IndicadorColor = pct >= 50 ? 'success' : pct >= 20 ? 'warning' : 'error';
  const promedio = dayAmounts.length > 0 ? totalAcumulado / dayAmounts.length : 0;
  const promedioColor: IndicadorColor = promedio >= (meta?.aportacionMensual ?? 0) * 0.8 ? 'success' : promedio > 0 ? 'warning' : 'error';
  const tendenciaColor: IndicadorColor = totalAcumulado >= totalPlanado * 0.5 ? 'success' : totalAcumulado > 0 ? 'warning' : 'error';

  return [
    {
      label: 'Consistencia',
      valor: `${dayAmounts.length} dias registrados`,
      color: consistencia,
      comentario:
        consistencia === 'success'
          ? 'Completaste los 3 dias del micro-reto. Excelente consistencia.'
          : consistencia === 'warning'
          ? 'Has empezado. Sigue registrando para consolidar el habito.'
          : 'Aun no has registrado ahorro. ¿Que necesita cambiar para que funcione?',
    },
    {
      label: 'Progreso hacia la meta',
      valor: `${pct.toFixed(0)}% de "${meta?.nombre ?? 'tu meta'}"`,
      color: progreso,
      comentario:
        progreso === 'success'
          ? '¡Vas en tiempo! Un ajuste pequeño y lo logras.'
          : progreso === 'warning'
          ? 'Has avanzado. Con constancia llegas.'
          : 'Aun no has acumulado ahorro hacia la meta. Cada peso cuenta.',
    },
    {
      label: 'Monto promedio',
      valor: promedio > 0 ? `$${promedio.toFixed(0)}/dia` : 'Sin datos',
      color: promedioColor,
      comentario:
        promedioColor === 'success'
          ? 'Tu promedio esta cerca o supera lo planeado. ¡Sigue asi!'
          : promedioColor === 'warning'
          ? 'Tu promedio es menor al planeado pero ya hay avance.'
          : 'Comienza a registrar ahorros diarios para ver tu promedio.',
    },
    {
      label: 'Tendencia',
      valor: tendenciaColor === 'success' ? 'Al alza' : tendenciaColor === 'warning' ? 'Estable' : 'Sin registro',
      color: tendenciaColor,
      comentario:
        tendenciaColor === 'success'
          ? 'Tu ritmo de ahorro se mantiene o mejora. Excelente.'
          : tendenciaColor === 'warning'
          ? 'Hay avance pero puedes acelerar el ritmo.'
          : 'Empieza el reto de 3 dias para ver tu tendencia.',
    },
  ];
}

export default function L13() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [allViewed, setAllViewed] = useState(false);
  const [dificultad, setDificultad] = useState('');
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    const load = async () => {
      const meta = await lessonDataRepository.load<MetaData>('ahorro', 'l5_meta');
      const plan = await lessonDataRepository.load<PlanData>('ahorro', 'l6_plan');
      const reto = await lessonDataRepository.load<RetoData>('ahorro', 'l11_reto');
      setIndicadores(buildIndicadores(meta, plan, reto));
      setLoading(false);
    };
    void load();
  }, []);

  const toggleExpanded = (i: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      if (next.size >= 4) setAllViewed(true);
      return next;
    });
  };

  const handleSave = async () => {
    await lessonDataRepository.save('ahorro', 'l13_dificultad', {
      dificultad,
      savedAt: new Date().toISOString(),
    });
    setAnswered(true);
    setStep(2);
  };

  const progress = step === 0 ? 0 : step === 1 ? 50 : 100;

  if (loading) {
    return (
      <LessonShell id="L13" title="Finni dice: como vas con tu ahorro" completion={{ ready: false }}>
        <Typography variant="body2" color="text.secondary">Cargando tu progreso...</Typography>
      </LessonShell>
    );
  }

  return (
    <LessonShell
      id="L13"
      title="Finni dice: como vas con tu ahorro"
      completion={{ ready: allViewed && answered }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          color="success"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {/* Pantalla 0 — Dashboard de progreso */}
        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="coach"
                title="Revision de habito"
                message="Es momento de ver como vas con tu habito de ahorro. No para juzgar, sino para ayudarte a llegar a tu meta."
              />
              <Typography variant="body1" fontWeight={700}>
                4 indicadores — toca cada uno para ver el analisis:
              </Typography>
              <Stack spacing={2}>
                {indicadores.map((ind, i) => (
                  <FECard
                    key={i}
                    variant="flat"
                    sx={{
                      border: 2,
                      borderColor: `${ind.color}.main`,
                      bgcolor: expanded.has(i) ? `${ind.color}.light` : 'background.paper',
                      cursor: 'pointer',
                    }}
                    onClick={() => toggleExpanded(i)}
                    role="button"
                    tabIndex={0}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight={700}>{ind.label}</Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip label={ind.valor} color={ind.color} size="small" sx={{ fontWeight: 700 }} />
                        <Typography variant="caption">{expanded.has(i) ? '▲' : '▼'}</Typography>
                      </Stack>
                    </Stack>
                    {expanded.has(i) && (
                      <Fade in>
                        <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', color: `${ind.color}.dark` }}>
                          {ind.comentario}
                        </Typography>
                      </Fade>
                    )}
                  </FECard>
                ))}
              </Stack>
              {(allViewed || expanded.size >= 4) && (
                <Fade in>
                  <Button fullWidth variant="contained" color="success" size="large" onClick={() => setStep(1)}>
                    Responder la pregunta de Finni →
                  </Button>
                </Fade>
              )}
            </Stack>
          </Fade>
        )}

        {/* Pantalla 1 — Pregunta abierta + ajuste */}
        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="coach"
                title="Una pregunta honesta"
                message="¿Hay algo que te este dificultando ahorrar esta semana? No te preguntes por que fallaste — preguntate que necesita cambiar para que funcione."
              />
              <TextField
                label="Tu respuesta (privada, solo para ti)"
                multiline
                rows={4}
                value={dificultad}
                onChange={(e) => setDificultad(e.target.value)}
                fullWidth
                placeholder="Puede ser un gasto inesperado, un cambio de rutina, o simplemente que olvidaste..."
              />
              <Button
                fullWidth
                variant="contained"
                color="success"
                size="large"
                onClick={() => void handleSave()}
                disabled={dificultad.trim().length < 3}
              >
                Guardar y cerrar la revision →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 2 — Cierre */}
        {step === 2 && answered && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="success"
                title="Revision completada"
                message="Conoces donde estas. Eso ya es un paso enorme. El siguiente paso es hacer un ajuste, por pequeño que sea."
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'success.main', bgcolor: 'success.light' }}>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
                  Estado general:
                </Typography>
                <Stack spacing={0.5}>
                  {indicadores.map((ind, i) => (
                    <Stack key={i} direction="row" spacing={1} alignItems="center">
                      <Chip label={ind.label} color={ind.color} size="small" />
                    </Stack>
                  ))}
                </Stack>
              </FECard>
            </Stack>
          </Fade>
        )}
      </Box>
    </LessonShell>
  );
}
