import { useState, useEffect } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade, Chip,
} from '@mui/material';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

type BudgetData = {
  pctFijos?: number;
  pctVariables?: number;
  pctAhorro?: number;
  balance?: number;
  totalIngresos?: number;
} | null;

type SemaforoItem = {
  label: string;
  value: string;
  color: 'success' | 'warning' | 'error';
  consejo: string;
};

function calcSemaforo(data: BudgetData): SemaforoItem[] {
  if (!data) {
    return [
      { label: 'Gastos fijos', value: 'Sin datos', color: 'warning', consejo: 'Completa la lección 12 para obtener tu análisis.' },
      { label: 'Gastos variables', value: 'Sin datos', color: 'warning', consejo: 'Completa la lección 12 para obtener tu análisis.' },
      { label: 'Ahorro', value: 'Sin datos', color: 'warning', consejo: 'Completa la lección 12 para obtener tu análisis.' },
      { label: 'Entretenimiento', value: 'Sin datos', color: 'warning', consejo: 'Completa la lección 12 para obtener tu análisis.' },
      { label: 'Balance general', value: 'Sin datos', color: 'warning', consejo: 'Completa la lección 12 para obtener tu análisis.' },
    ];
  }

  const fijos = data.pctFijos ?? 0;
  const variables = data.pctVariables ?? 0;
  const ahorro = data.pctAhorro ?? 0;
  const balance = data.balance ?? 0;

  return [
    {
      label: 'Gastos fijos',
      value: `${fijos}% del ingreso`,
      color: fijos <= 50 ? 'success' : fijos <= 60 ? 'warning' : 'error',
      consejo:
        fijos <= 50
          ? '¡Excelente! Tus gastos fijos están dentro del 50% recomendado.'
          : fijos <= 60
          ? 'Tus gastos fijos son un poco altos. Considera renegociar algún servicio.'
          : 'Tus gastos fijos superan el 50%. Revisa si hay suscripciones o compromisos que puedas reducir.',
    },
    {
      label: 'Gastos variables',
      value: `${variables}% del ingreso`,
      color: variables <= 30 ? 'success' : variables <= 40 ? 'warning' : 'error',
      consejo:
        variables <= 30
          ? 'Bien controlado. Tus variables están dentro del 30% ideal.'
          : variables <= 40
          ? 'Un poco por encima del 30%. Identifica qué categoría puedes recortar.'
          : 'Tus gastos variables son altos. Revisa el ítem más grande y pregunta si es realmente necesario.',
    },
    {
      label: 'Ahorro',
      value: `${ahorro}% del ingreso`,
      color: ahorro >= 20 ? 'success' : ahorro >= 10 ? 'warning' : 'error',
      consejo:
        ahorro >= 20
          ? '¡Perfecto! Estás ahorrando el 20% o más. Así se construye patrimonio.'
          : ahorro >= 10
          ? 'Buen inicio. Intenta llegar al 20% aumentando poco a poco.'
          : ahorro > 0
          ? 'Cualquier ahorro cuenta. Sube gradualmente hasta llegar al 10% primero.'
          : 'No tienes ahorro contemplado. Aunque sea $100 al mes ya marca la diferencia.',
    },
    {
      label: 'Entretenimiento / ocio',
      value: variables <= 15 ? 'Razonable' : variables <= 25 ? 'Moderado' : 'Alto',
      color: variables <= 15 ? 'success' : variables <= 25 ? 'warning' : 'error',
      consejo:
        variables <= 15
          ? 'Tu nivel de ocio es adecuado para un contexto estudiantil.'
          : 'Considera si todo el gasto variable es entretenimiento o si hay necesidades mezcladas.',
    },
    {
      label: 'Balance general',
      value: `${balance >= 0 ? '+' : ''}$${balance.toLocaleString()}`,
      color: balance >= 0 ? 'success' : balance >= -200 ? 'warning' : 'error',
      consejo:
        balance >= 0
          ? '¡Tu presupuesto está en superávit! Ese excedente va directo al ahorro.'
          : balance >= -200
          ? 'Pequeño déficit. Con 1-2 ajustes puedes llegar al equilibrio.'
          : 'Déficit significativo. Revisa los 2-3 gastos más grandes y pregunta si se pueden reducir.',
    },
  ];
}

export default function L13() {
  const [step, setStep] = useState(0);
  const [semaforo, setSemaforo] = useState<SemaforoItem[]>([]);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [allViewed, setAllViewed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await lessonDataRepository.load<BudgetData>('presupuesto', 'l12_budget');
      setSemaforo(calcSemaforo(data));
      setLoading(false);
    };
    void load();
  }, []);

  const toggleExpanded = (i: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
    if (expanded.size + 1 >= semaforo.length) {
      setAllViewed(true);
    }
  };

  const stars = semaforo.filter((s) => s.color === 'success').length;
  const starMsg =
    stars === 5
      ? '¡Presupuesto impecable! Eres de los pocos que realmente planea.'
      : stars >= 3
      ? 'Muy buen trabajo. Con estos ajustes, tu presupuesto será sólido.'
      : '¡Un primer presupuesto siempre es así! Lo importante es que ya empezaste.';

  if (loading) {
    return (
      <LessonShell id="L13" title="Finni te da su veredicto" completion={{ ready: false }}>
        <Typography variant="body2" color="text.secondary">Cargando tu presupuesto...</Typography>
      </LessonShell>
    );
  }

  return (
    <LessonShell
      id="L13"
      title="Finni te da su veredicto: ¿cómo vas?"
      completion={{ ready: allViewed || expanded.size >= semaforo.length }}
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
                title="¡Ya tienes tu presupuesto!"
                message="Déjame analizarlo. Voy a ser honesto contigo: lo que funciona bien, lo celebramos. Lo que necesita ajuste, te lo digo con respeto."
              />
              <FECard variant="flat" sx={{ bgcolor: 'warning.light', border: 1, borderColor: 'warning.main', textAlign: 'center', py: 2 }}>
                <Typography variant="body2" color="text.secondary">Analizando...</Typography>
                <LinearProgress color="warning" sx={{ mt: 1, height: 8, borderRadius: 4 }} />
              </FECard>
              <Button fullWidth variant="contained" color="warning" size="large" onClick={() => setStep(1)}>
                Ver el reporte semáforo →
              </Button>
            </Stack>
          </Fade>
        )}

        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="body1" fontWeight={700}>
                Reporte semáforo de Finni 🚦
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toca cada indicador para ver el análisis completo.
              </Typography>
              <Stack spacing={2}>
                {semaforo.map((s, i) => (
                  <FECard
                    key={i}
                    variant="flat"
                    sx={{
                      border: 2,
                      borderColor: `${s.color}.main`,
                      bgcolor: expanded.has(i) ? `${s.color}.light` : 'background.paper',
                      cursor: 'pointer',
                    }}
                    onClick={() => { toggleExpanded(i); if (expanded.size + 1 >= semaforo.length) setAllViewed(true); }}
                    role="button"
                    tabIndex={0}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight={700}>{s.label}</Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={s.value}
                          color={s.color}
                          size="small"
                          sx={{ fontWeight: 700 }}
                        />
                        <Typography variant="caption">{expanded.has(i) ? '▲' : '▼'}</Typography>
                      </Stack>
                    </Stack>
                    {expanded.has(i) && (
                      <Fade in>
                        <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                          {s.consejo}
                        </Typography>
                      </Fade>
                    )}
                  </FECard>
                ))}
              </Stack>
              {(allViewed || expanded.size >= semaforo.length) && (
                <Fade in>
                  <Button fullWidth variant="contained" color="warning" size="large" onClick={() => setStep(2)}>
                    Ver calificación final →
                  </Button>
                </Fade>
              )}
            </Stack>
          </Fade>
        )}

        {step === 2 && (
          <Fade in>
            <Stack spacing={3}>
              <FECard variant="flat" sx={{ bgcolor: 'warning.light', border: 2, borderColor: 'warning.main', textAlign: 'center', py: 2 }}>
                <Typography variant="h2">
                  {'⭐'.repeat(stars)}{'☆'.repeat(5 - stars)}
                </Typography>
                <Typography variant="h4" sx={{ mt: 1 }}>{stars}/5 indicadores en verde</Typography>
              </FECard>
              <FinniMessage
                variant="success"
                title="Veredicto de Finni"
                message={starMsg}
              />
            </Stack>
          </Fade>
        )}
      </Box>
    </LessonShell>
  );
}
