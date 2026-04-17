import { useState, useEffect, useMemo } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade,
  TextField, Chip,
} from '@mui/material';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

const SUGERENCIAS = ['Un viaje', 'Una laptop', 'Ropa nueva', 'Fondo de emergencias', 'Un regalo especial'];

const SMART_LETTERS = [
  { letter: 'S', name: 'Específica', desc: '¿Qué exactamente quieres lograr?' },
  { letter: 'M', name: 'Medible', desc: '¿Cómo sabrás que lo lograste? (cantidad, fecha)' },
  { letter: 'A', name: 'Alcanzable', desc: '¿Es realista con tu ingreso actual?' },
  { letter: 'R', name: 'Relevante', desc: '¿Por qué es importante para ti?' },
  { letter: 'T', name: 'Temporal', desc: '¿Cuándo lo lograrás?' },
];

export default function L09() {
  const [step, setStep] = useState(0);

  // Form fields
  const [queQuieres, setQueQuieres] = useState('');
  const [monto, setMonto] = useState('');
  const [porQue, setPorQue] = useState('');
  const [plazoMeses, setPlazoMeses] = useState(6);

  const montoNum = parseFloat(monto) || 0;
  const aporteMensual = plazoMeses > 0 && montoNum > 0 ? Math.ceil(montoNum / plazoMeses) : 0;

  const step1Valid = queQuieres.trim().length >= 3;
  const step2Valid = montoNum > 0;
  const step3Valid = true; // calculadora siempre válida cuando hay monto
  const step4Valid = porQue.trim().length >= 5;
  const step5Valid = plazoMeses >= 1 && plazoMeses <= 24;

  const allValid = step1Valid && step2Valid && step4Valid && step5Valid;

  const metaText = allValid
    ? `Quiero ${queQuieres} ahorrando $${montoNum.toLocaleString()} en ${plazoMeses} meses apartando ~$${aporteMensual.toLocaleString()} al mes. Porque: ${porQue}.`
    : '';

  const isAlcanzable = useMemo(() => {
    // Assume a typical student income of $2,500
    return aporteMensual <= 2500 * 0.3;
  }, [aporteMensual]);

  useEffect(() => {
    if (allValid) {
      void lessonDataRepository.save('presupuesto', 'l9_smart_goal', {
        queQuieres,
        monto: montoNum,
        porQue,
        plazoMeses,
        aporteMensual,
        metaText,
      });
    }
  }, [allValid, queQuieres, montoNum, porQue, plazoMeses, aporteMensual, metaText]);

  return (
    <LessonShell
      id="L09"
      title="Metas financieras con método: el sistema SMART"
      completion={{ ready: allValid }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={step === 0 ? 0 : step === 1 ? 20 : step === 2 ? 50 : 100}
          color="warning"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="coach"
                title="¿Qué es una meta SMART?"
                message={`"Quiero ahorrar" no es una meta. "Quiero ahorrar $3,000 para mi viaje de graduación en 6 meses apartando $500 al mes" — eso sí es una meta. ¿Notas la diferencia?`}
              />
              <Stack spacing={1.5}>
                {SMART_LETTERS.map((s) => (
                  <FECard key={s.letter} variant="flat" sx={{ border: 1, borderColor: 'warning.main' }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="h3" sx={{ color: 'warning.main', minWidth: 32 }}>{s.letter}</Typography>
                      <Box>
                        <Typography variant="body1" fontWeight={700}>{s.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{s.desc}</Typography>
                      </Box>
                    </Stack>
                  </FECard>
                ))}
              </Stack>
              <FinniMessage
                variant="coach"
                title="Una meta SMART"
                message="Es como un GPS financiero. Sin ella, solo estás manejando sin rumbo."
              />
              <Button fullWidth variant="contained" color="warning" size="large" onClick={() => setStep(1)}>
                ¡Crear mi meta! →
              </Button>
            </Stack>
          </Fade>
        )}

        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="h4">Formulario guiado (5 pasos)</Typography>

              {/* Paso 1 — ¿Qué quieres? */}
              <FECard variant="flat" sx={{ border: 1, borderColor: 'warning.main' }}>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                  Paso 1/5 — ¿Qué quieres lograr? (S — Específica)
                </Typography>
                <TextField
                  label="¿Qué quieres?"
                  value={queQuieres}
                  onChange={(e) => setQueQuieres(e.target.value)}
                  size="small"
                  fullWidth
                  placeholder="Ej: comprar una laptop, hacer un viaje..."
                />
                <Stack direction="row" flexWrap="wrap" gap={1} useFlexGap sx={{ mt: 1 }}>
                  {SUGERENCIAS.map((s) => (
                    <Chip
                      key={s}
                      label={s}
                      size="small"
                      variant="outlined"
                      onClick={() => setQueQuieres(s)}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Stack>
              </FECard>

              {/* Paso 2 — ¿Cuánto? */}
              <FECard variant="flat" sx={{ border: 1, borderColor: step1Valid ? 'warning.main' : 'divider', opacity: step1Valid ? 1 : 0.5 }}>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                  Paso 2/5 — ¿Cuánto dinero necesitas? (M — Medible)
                </Typography>
                <TextField
                  label="Monto en pesos"
                  type="number"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  size="small"
                  fullWidth
                  disabled={!step1Valid}
                  inputProps={{ min: 1 }}
                />
              </FECard>

              {/* Paso 3 — ¿Es alcanzable? */}
              {step2Valid && (
                <Fade in>
                  <FECard variant="flat" sx={{ border: 1, borderColor: 'info.main', bgcolor: 'info.light' }}>
                    <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                      Paso 3/5 — ¿Es alcanzable? (A — Alcanzable)
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Plazo: <b>{plazoMeses} {plazoMeses === 1 ? 'mes' : 'meses'}</b>
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {[1, 2, 3, 6, 9, 12, 18, 24].map((m) => (
                        <Chip
                          key={m}
                          label={`${m}m`}
                          size="small"
                          color={plazoMeses === m ? 'warning' : 'default'}
                          variant={plazoMeses === m ? 'filled' : 'outlined'}
                          onClick={() => setPlazoMeses(m)}
                          sx={{ cursor: 'pointer', fontWeight: 600 }}
                        />
                      ))}
                    </Stack>
                    <FECard variant="flat" sx={{ mt: 1.5, bgcolor: isAlcanzable ? 'success.light' : 'warning.light' }}>
                      <Typography variant="body2" fontWeight={700}>
                        Deberías apartar: <b>${aporteMensual.toLocaleString()}/mes</b>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {isAlcanzable ? '✅ Es alcanzable para un universitario típico' : '⚠️ Es exigente. Considera aumentar el plazo.'}
                      </Typography>
                    </FECard>
                  </FECard>
                </Fade>
              )}

              {/* Paso 4 — ¿Por qué? */}
              {step3Valid && step2Valid && (
                <Fade in>
                  <FECard variant="flat" sx={{ border: 1, borderColor: 'warning.main' }}>
                    <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                      Paso 4/5 — ¿Por qué es importante? (R — Relevante)
                    </Typography>
                    <TextField
                      label="¿Por qué esta meta importa para ti?"
                      value={porQue}
                      onChange={(e) => setPorQue(e.target.value)}
                      size="small"
                      fullWidth
                      multiline
                      rows={2}
                    />
                  </FECard>
                </Fade>
              )}

              {/* Resultado */}
              {allValid && (
                <Fade in>
                  <Stack spacing={2}>
                    <Button fullWidth variant="contained" color="warning" size="large" onClick={() => setStep(2)}>
                      Ver mi tarjeta de compromiso →
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
              <Typography variant="h4">Tu meta SMART 🎯</Typography>
              <FECard variant="flat" sx={{ border: 3, borderColor: 'warning.main', bgcolor: 'warning.light', p: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>TARJETA DE COMPROMISO</Typography>
                <Typography variant="body1" fontWeight={700} sx={{ mb: 2 }}>{metaText}</Typography>
                <Stack spacing={0.5}>
                  {[
                    { label: 'Qué', value: queQuieres },
                    { label: 'Cuánto', value: `$${montoNum.toLocaleString()}` },
                    { label: 'Cuándo', value: `En ${plazoMeses} meses` },
                    { label: 'Cómo', value: `Apartando $${aporteMensual.toLocaleString()}/mes` },
                    { label: 'Por qué', value: porQue },
                  ].map((r) => (
                    <Stack key={r.label} direction="row" spacing={1}>
                      <Typography variant="caption" fontWeight={700} sx={{ minWidth: 50 }}>{r.label}:</Typography>
                      <Typography variant="caption">{r.value}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </FECard>
              <FinniMessage
                variant="success"
                title="¡Tu meta está lista!"
                message="En el siguiente módulo vamos a construir el plan para cumplirla. Tu meta queda guardada para usar en la Lección 12."
              />
            </Stack>
          </Fade>
        )}
      </Box>
    </LessonShell>
  );
}
