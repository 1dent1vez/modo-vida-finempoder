import { useState } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade, Chip,
} from '@mui/material';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';

type Q = 'a' | 'b' | 'c' | null;

const CUBRE = [
  { label: 'Cuentas de ahorro', si: true },
  { label: 'Cuentas de cheques', si: true },
  { label: 'Depositos a plazo', si: true },
  { label: 'Depositos en UDIs', si: true },
  { label: 'Inversiones en bolsa', si: false },
  { label: 'Seguros de vida', si: false },
  { label: 'SIEFOREs (AFORE)', si: false },
  { label: 'Pagares con rendimiento pre-2010', si: false },
];

const TIMELINE = [
  { dia: 'Dia 1', evento: 'Tu banco cierra sus puertas.' },
  { dia: 'Dia 30', evento: 'El IPAB interviene y audita las cuentas.' },
  { dia: 'Dia 90', evento: 'Recibes tu dinero de vuelta (hasta el limite protegido).' },
];

export default function L10() {
  const [step, setStep] = useState(0);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [q1, setQ1] = useState<Q>(null);
  const [q2, setQ2] = useState<Q>(null);
  const [q3, setQ3] = useState<Q>(null);
  const [q4, setQ4] = useState<Q>(null);

  const quizDone = q1 !== null && q2 !== null && q3 !== null && q4 !== null;
  const score = [q1 === 'b', q2 === 'b', q3 === 'b', q4 === 'a'].filter(Boolean).length;

  const toggleExpanded = (i: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const progress = step === 0 ? 0 : step === 1 ? 25 : step === 2 ? 60 : step === 3 ? 80 : 100;

  return (
    <LessonShell
      id="L10"
      title="El IPAB: el guardian de tu dinero"
      completion={{ ready: quizDone, score: score / 4 }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          color="success"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {/* Pantalla 0 — Apertura + explicacion */}
        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="coach"
                title="¿Y si mañana tu banco cerrara?"
                message="¿Perderias todo tu dinero? La respuesta depende de donde tengas ese dinero. Si esta en un banco autorizado… estas protegido."
              />
              <FECard variant="flat" sx={{ border: 2, borderColor: 'success.main', bgcolor: 'success.light' }}>
                <Typography variant="body1" fontWeight={700} sx={{ mb: 1 }}>El IPAB</Typography>
                <Typography variant="body2">
                  Instituto para la Proteccion al Ahorro Bancario — es el organismo del gobierno mexicano que garantiza tus depositos bancarios.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Protege hasta <b>400,000 UDIs por persona por banco</b> (≈ 3 millones de pesos en 2024).
                </Typography>
                <Typography variant="body2" color="success.dark" sx={{ mt: 1 }}>
                  No importa si el banco quiebra mañana: si tu saldo esta por debajo del limite, lo recuperas.
                </Typography>
              </FECard>
              <Button fullWidth variant="contained" color="success" size="large" onClick={() => setStep(1)}>
                ¿Que cubre y que NO? →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 1 — Que cubre y que no + timeline */}
        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="body1" fontWeight={700}>Productos bancarios — ¿cubiertos?</Typography>
              <Typography variant="caption" color="text.secondary">
                Toca cada uno para mas detalle. Clave: solo bancos autorizados y supervisados por la CNBV.
              </Typography>
              <Stack spacing={1}>
                {CUBRE.map((item, i) => (
                  <FECard
                    key={i}
                    variant="flat"
                    sx={{
                      border: 1,
                      borderColor: item.si ? 'success.main' : 'error.main',
                      bgcolor: expanded.has(i) ? (item.si ? 'success.light' : 'error.light') : 'background.paper',
                      cursor: 'pointer',
                    }}
                    onClick={() => toggleExpanded(i)}
                    role="button"
                    tabIndex={0}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight={600}>{item.label}</Typography>
                      <Chip
                        label={item.si ? 'SI cubre' : 'NO cubre'}
                        color={item.si ? 'success' : 'error'}
                        size="small"
                      />
                    </Stack>
                    {expanded.has(i) && (
                      <Fade in>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: item.si ? 'success.dark' : 'error.dark' }}>
                          {item.si
                            ? 'Protegido hasta el limite del IPAB en bancos autorizados.'
                            : 'Este producto no esta garantizado por el IPAB. Verifica antes de invertir.'}
                        </Typography>
                      </Fade>
                    )}
                  </FECard>
                ))}
              </Stack>

              <Typography variant="body1" fontWeight={700} sx={{ mt: 1 }}>¿Que pasa si mi banco quiebra?</Typography>
              <Stack spacing={1.5}>
                {TIMELINE.map((t, i) => (
                  <FECard key={i} variant="flat" sx={{ border: 1, borderColor: 'success.light' }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Chip label={t.dia} color="success" size="small" sx={{ minWidth: 60 }} />
                      <Typography variant="body2">{t.evento}</Typography>
                    </Stack>
                  </FECard>
                ))}
              </Stack>

              <FinniMessage
                variant="coach"
                title="Dato de confianza"
                message="Desde 1999, el IPAB ha protegido a miles de ahorradores en Mexico. Tu dinero esta mas seguro de lo que crees."
              />

              <Button fullWidth variant="contained" color="success" size="large" onClick={() => setStep(2)}>
                Quiz de 4 preguntas →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 2 — Quiz de 4 preguntas */}
        {step === 2 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="h4">Quiz: El IPAB</Typography>

              {/* Q1 */}
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography variant="body1" fontWeight={700} sx={{ mb: 1.5 }}>
                  1. ¿Cuanto protege el IPAB por persona por banco?
                </Typography>
                <Stack spacing={1}>
                  {[{ key: 'a', label: 'A) $500,000' }, { key: 'b', label: 'B) ~3 millones de pesos' }, { key: 'c', label: 'C) Sin limite' }].map((o) => (
                    <Button key={o.key} variant={q1 === o.key ? 'contained' : 'outlined'}
                      color={q1 === o.key ? (o.key === 'b' ? 'success' : 'error') : 'inherit'}
                      onClick={() => setQ1(o.key as Q)} disabled={q1 !== null}
                      sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>{o.label}</Button>
                  ))}
                </Stack>
                {q1 && <Chip sx={{ mt: 1 }} color={q1 === 'b' ? 'success' : 'error'}
                  label={q1 === 'b' ? '¡Correcto! 400,000 UDIs ≈ 3 millones.' : 'Son ~3 millones (400,000 UDIs).'} />}
              </FECard>

              {/* Q2 */}
              {q1 && (
                <Fade in>
                  <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                    <Typography variant="body1" fontWeight={700} sx={{ mb: 1.5 }}>
                      2. ¿El IPAB cubre las inversiones en bolsa?
                    </Typography>
                    <Stack spacing={1}>
                      {[{ key: 'a', label: 'A) Si' }, { key: 'b', label: 'B) No' }].map((o) => (
                        <Button key={o.key} variant={q2 === o.key ? 'contained' : 'outlined'}
                          color={q2 === o.key ? (o.key === 'b' ? 'success' : 'error') : 'inherit'}
                          onClick={() => setQ2(o.key as Q)} disabled={q2 !== null}
                          sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>{o.label}</Button>
                      ))}
                    </Stack>
                    {q2 && <Chip sx={{ mt: 1 }} color={q2 === 'b' ? 'success' : 'error'}
                      label={q2 === 'b' ? '¡Correcto! Solo depositos en cuentas bancarias autorizadas.' : 'Las inversiones en bolsa NO estan cubiertas por el IPAB.'} />}
                  </FECard>
                </Fade>
              )}

              {/* Q3 */}
              {q2 && (
                <Fade in>
                  <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                    <Typography variant="body1" fontWeight={700} sx={{ mb: 1.5 }}>
                      3. ¿Que organismo supervisa los bancos en Mexico?
                    </Typography>
                    <Stack spacing={1}>
                      {[{ key: 'a', label: 'A) SAT' }, { key: 'b', label: 'B) CNBV' }, { key: 'c', label: 'C) IMSS' }].map((o) => (
                        <Button key={o.key} variant={q3 === o.key ? 'contained' : 'outlined'}
                          color={q3 === o.key ? (o.key === 'b' ? 'success' : 'error') : 'inherit'}
                          onClick={() => setQ3(o.key as Q)} disabled={q3 !== null}
                          sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>{o.label}</Button>
                      ))}
                    </Stack>
                    {q3 && <Chip sx={{ mt: 1 }} color={q3 === 'b' ? 'success' : 'error'}
                      label={q3 === 'b' ? '¡Correcto! Comision Nacional Bancaria y de Valores.' : 'Es la CNBV — Comision Nacional Bancaria y de Valores.'} />}
                  </FECard>
                </Fade>
              )}

              {/* Q4 */}
              {q3 && (
                <Fade in>
                  <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                    <Typography variant="body1" fontWeight={700} sx={{ mb: 1.5 }}>
                      4. Tienes $80,000 en cuenta de ahorro en un banco autorizado que quiebra. ¿Estarias cubierto?
                    </Typography>
                    <Stack spacing={1}>
                      {[{ key: 'a', label: 'A) Si, estoy dentro del limite IPAB' }, { key: 'b', label: 'B) No, lo perderia todo' }].map((o) => (
                        <Button key={o.key} variant={q4 === o.key ? 'contained' : 'outlined'}
                          color={q4 === o.key ? (o.key === 'a' ? 'success' : 'error') : 'inherit'}
                          onClick={() => setQ4(o.key as Q)} disabled={q4 !== null}
                          sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>{o.label}</Button>
                      ))}
                    </Stack>
                    {q4 && <Chip sx={{ mt: 1 }} color={q4 === 'a' ? 'success' : 'error'}
                      label={q4 === 'a' ? '¡Correcto! $80,000 esta muy por debajo del limite.' : '$80,000 esta muy por debajo del limite de ~3 millones.'} />}
                  </FECard>
                </Fade>
              )}

              {quizDone && (
                <Fade in>
                  <FinniMessage
                    variant="success"
                    title={`${score}/4 correctas`}
                    message="Accion pendiente: verifica que tu banco este registrado en el IPAB hoy en ipab.gob.mx"
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
