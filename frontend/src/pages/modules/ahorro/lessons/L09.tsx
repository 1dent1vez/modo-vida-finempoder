import { useState } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade, Chip,
} from '@mui/material';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';

type MapChoice = 'ahorro' | 'seguro' | 'ambos' | null;
type Q = 'a' | 'b' | 'c' | null;

const SITUACIONES = [
  { id: 1, text: 'Laptop descompuesta antes de examenes ($5,000)', correct: 'ahorro' as const, exp: 'Ahorro: este importe cabe en un buen fondo de emergencias.' },
  { id: 2, text: 'Hospitalizacion de emergencia ($20,000)', correct: 'seguro' as const, exp: 'Seguro: un evento tan grande esta fuera del alcance de la mayoria de fondos.' },
  { id: 3, text: 'Mes sin ingreso por enfermedad', correct: 'ambos' as const, exp: 'Ambos: el seguro cubre el evento, el fondo cubre la brecha mientras el seguro responde.' },
  { id: 4, text: 'Multa inesperada ($500)', correct: 'ahorro' as const, exp: 'Ahorro: pequeño imprevisible que tu fondo cubre facilmente.' },
  { id: 5, text: 'Accidente de transito', correct: 'seguro' as const, exp: 'Seguro: responsabilidad civil y danos pueden superar cualquier fondo.' },
  { id: 6, text: 'Perdida de beca por 2 meses', correct: 'ambos' as const, exp: 'Ambos: fondo para los primeros meses, seguro de desempleo para mayor duracion.' },
];

const SEGUROS = [
  { label: 'Gastos medicos mayores', desc: 'Disponible en algunas universidades publicas' },
  { label: 'IMSS', desc: 'Si tienes trabajo formal o a traves de tus padres' },
  { label: 'Seguro de viajero', desc: 'Para intercambios o viajes largos' },
  { label: 'Seguro de gadgets', desc: 'Para laptop o celular si es tu herramienta de trabajo' },
];

export default function L09() {
  const [step, setStep] = useState(0);
  const [mapAnswers, setMapAnswers] = useState<Record<number, MapChoice>>({});
  const [showMapFeedback, setShowMapFeedback] = useState<Record<number, boolean>>({});
  const [q1, setQ1] = useState<Q>(null);
  const [q2, setQ2] = useState<Q>(null);
  const [q3, setQ3] = useState<Q>(null);

  const mapDone = Object.values(mapAnswers).filter(Boolean).length === SITUACIONES.length;
  const quizDone = q1 !== null && q2 !== null && q3 !== null;
  const score = [q1 === 'b', q2 === 'a', q3 === 'b'].filter(Boolean).length;

  const chooseMap = (id: number, choice: MapChoice) => {
    if (mapAnswers[id]) return;
    setMapAnswers((prev) => ({ ...prev, [id]: choice }));
    setShowMapFeedback((prev) => ({ ...prev, [id]: true }));
  };

  const progress = step === 0 ? 0 : step === 1 ? 25 : step === 2 ? 60 : step === 3 ? 80 : 100;

  return (
    <LessonShell
      id="L09"
      title="Ahorro y seguros: la dupla de la tranquilidad"
      completion={{ ready: mapDone && quizDone, score: score / 3 }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          color="success"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {/* Pantalla 0 — Apertura + narracion */}
        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="coach"
                title="La dupla imbatible"
                message="El ahorro te protege de lo que ya sabes que podria pasar. El seguro te protege de lo que no imaginas que podria pasar. Juntos son imbatibles."
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>Situacion 1 — Carlos:</Typography>
                <Typography variant="body2">Tiene $3,000 en fondo de emergencias. Se enferma, gasto medico $8,000.</Typography>
                <Typography variant="body2" color="error.main" sx={{ mt: 0.5 }}>
                  Sin seguro → vacia el fondo y sigue debiendo $5,000.
                </Typography>
                <Typography variant="body2" color="success.main">
                  Con seguro medico estudiantil → paga $500 deducible, fondo intacto.
                </Typography>
              </FECard>
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>Situacion 2 — Mariana:</Typography>
                <Typography variant="body2">Tiene seguro de desempleo estudiantil. Pierde trabajo part-time.</Typography>
                <Typography variant="body2" color="success.main" sx={{ mt: 0.5 }}>
                  El seguro cubre 3 meses de ingreso basico. Fondo intacto para otra situacion.
                </Typography>
              </FECard>
              <FECard variant="flat" sx={{ border: 1, borderColor: 'info.main', bgcolor: 'info.light' }}>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>Seguros basicos para universitarios:</Typography>
                {SEGUROS.map((s) => (
                  <Stack key={s.label} direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 0.5 }}>
                    <Typography variant="body2">•</Typography>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{s.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{s.desc}</Typography>
                    </Box>
                  </Stack>
                ))}
              </FECard>
              <Button fullWidth variant="contained" color="success" size="large" onClick={() => setStep(1)}>
                Mapa de situaciones →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 1 — Mapa de 6 situaciones */}
        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="body1" fontWeight={700}>
                ¿Que herramienta usarias en cada situacion?
              </Typography>
              <Chip label={`${Object.values(mapAnswers).filter(Boolean).length}/${SITUACIONES.length}`} color="success" size="small" sx={{ alignSelf: 'flex-start' }} />
              <Stack spacing={2}>
                {SITUACIONES.map((s) => {
                  const ans = mapAnswers[s.id];
                  const isCorrect = ans === s.correct;
                  return (
                    <FECard
                      key={s.id}
                      variant="flat"
                      sx={{
                        border: 1,
                        borderColor: ans ? (isCorrect ? 'success.main' : 'error.main') : 'divider',
                        bgcolor: ans ? (isCorrect ? 'success.light' : 'error.light') : 'background.paper',
                      }}
                    >
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>{s.text}</Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {(['ahorro', 'seguro', 'ambos'] as const).map((opt) => (
                          <Button
                            key={opt}
                            size="small"
                            variant={ans === opt ? 'contained' : 'outlined'}
                            color={ans === opt ? (isCorrect ? 'success' : 'error') : 'inherit'}
                            onClick={() => chooseMap(s.id, opt)}
                            disabled={!!ans}
                            sx={{ textTransform: 'none', minWidth: 70 }}
                          >
                            {opt === 'ahorro' ? '💰 Ahorro' : opt === 'seguro' ? '🛡️ Seguro' : '✅ Ambos'}
                          </Button>
                        ))}
                      </Stack>
                      {showMapFeedback[s.id] && (
                        <Fade in>
                          <Typography variant="caption" sx={{ display: 'block', mt: 0.75, color: isCorrect ? 'success.dark' : 'error.dark' }}>
                            {isCorrect ? '✅ ' : '❌ '}{s.exp}
                          </Typography>
                        </Fade>
                      )}
                    </FECard>
                  );
                })}
              </Stack>
              {mapDone && (
                <Fade in>
                  <Button fullWidth variant="contained" color="success" size="large" onClick={() => setStep(2)}>
                    Quiz rapido →
                  </Button>
                </Fade>
              )}
            </Stack>
          </Fade>
        )}

        {/* Pantalla 2 — Quiz 3 preguntas */}
        {step === 2 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="h4">Quiz: ¿cuando conviene cada uno?</Typography>

              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography variant="body1" fontWeight={700} sx={{ mb: 1.5 }}>
                  1. Una emergencia medica de $25,000. ¿Que conviene?
                </Typography>
                <Stack spacing={1}>
                  {[
                    { key: 'a', label: 'A) Solo el fondo de emergencias' },
                    { key: 'b', label: 'B) Un seguro medico' },
                    { key: 'c', label: 'C) Pedir prestado' },
                  ].map((o) => (
                    <Button key={o.key} variant={q1 === o.key ? 'contained' : 'outlined'}
                      color={q1 === o.key ? (o.key === 'b' ? 'success' : 'error') : 'inherit'}
                      onClick={() => setQ1(o.key as Q)} disabled={q1 !== null}
                      sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                      {o.label}
                    </Button>
                  ))}
                </Stack>
                {q1 && <Chip sx={{ mt: 1 }} color={q1 === 'b' ? 'success' : 'error'}
                  label={q1 === 'b' ? 'Correcto. Para gastos tan grandes, el seguro es indispensable.' : 'Un seguro medico es el mas adecuado para montos elevados.'} />}
              </FECard>

              {q1 && (
                <Fade in>
                  <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                    <Typography variant="body1" fontWeight={700} sx={{ mb: 1.5 }}>
                      2. Una multa de $400. ¿Que usas?
                    </Typography>
                    <Stack spacing={1}>
                      {[
                        { key: 'a', label: 'A) Mi fondo de emergencias' },
                        { key: 'b', label: 'B) Un seguro' },
                        { key: 'c', label: 'C) Una tarjeta de credito' },
                      ].map((o) => (
                        <Button key={o.key} variant={q2 === o.key ? 'contained' : 'outlined'}
                          color={q2 === o.key ? (o.key === 'a' ? 'success' : 'error') : 'inherit'}
                          onClick={() => setQ2(o.key as Q)} disabled={q2 !== null}
                          sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                          {o.label}
                        </Button>
                      ))}
                    </Stack>
                    {q2 && <Chip sx={{ mt: 1 }} color={q2 === 'a' ? 'success' : 'error'}
                      label={q2 === 'a' ? 'Correcto. Para imprevistos pequeños, el fondo es perfecto.' : 'Para imprevistos pequeños usa el fondo de emergencias.'} />}
                  </FECard>
                </Fade>
              )}

              {q2 && (
                <Fade in>
                  <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                    <Typography variant="body1" fontWeight={700} sx={{ mb: 1.5 }}>
                      3. Perdiste tu trabajo part-time por 4 meses. ¿La mejor estrategia?
                    </Typography>
                    <Stack spacing={1}>
                      {[
                        { key: 'a', label: 'A) Solo el fondo de emergencias' },
                        { key: 'b', label: 'B) Fondo para los primeros meses + seguro de desempleo si disponible' },
                        { key: 'c', label: 'C) Solo el seguro' },
                      ].map((o) => (
                        <Button key={o.key} variant={q3 === o.key ? 'contained' : 'outlined'}
                          color={q3 === o.key ? (o.key === 'b' ? 'success' : 'error') : 'inherit'}
                          onClick={() => setQ3(o.key as Q)} disabled={q3 !== null}
                          sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                          {o.label}
                        </Button>
                      ))}
                    </Stack>
                    {q3 && <Chip sx={{ mt: 1 }} color={q3 === 'b' ? 'success' : 'error'}
                      label={q3 === 'b' ? 'Correcto. La dupla ahorro + seguro es la estrategia optima.' : 'La combinacion de ambos es la estrategia mas solida.'} />}
                  </FECard>
                </Fade>
              )}

              {quizDone && (
                <Fade in>
                  <FinniMessage
                    variant="success"
                    title={`${score}/3 correctas`}
                    message="No necesitas el seguro perfecto. Necesitas empezar con el mas basico que puedas costear."
                  />
                </Fade>
              )}
            </Stack>
          </Fade>
        )}
      </Box>
    </LessonShell>
  );
}
