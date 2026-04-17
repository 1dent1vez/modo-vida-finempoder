import { useState, useMemo } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade, Chip,
  TextField,
} from '@mui/material';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';

type Q1 = 'a' | 'b' | 'c' | null;
type Q2 = 'a' | 'b' | 'c' | null;

const BENEFICIOS = [
  {
    title: 'Rendimientos',
    example: '$5,000 al 3% = $150 anuales sin hacer nada',
    detail: 'El banco te paga por dejarle usar tu dinero temporalmente. Es tu derecho, no un regalo.',
  },
  {
    title: 'Proteccion IPAB',
    example: 'Hasta ~3 millones de pesos garantizados por el gobierno',
    detail: 'Si tu banco quiebra, el IPAB te devuelve tu dinero. No pasa con tu alcancia.',
  },
  {
    title: 'Historial financiero',
    example: 'Tener cuenta activa mejora tu perfil para creditos futuros',
    detail: 'Los bancos y empleadores verifican tu historial. Una cuenta activa construye tu reputacion.',
  },
  {
    title: 'Disciplina automatica',
    example: '"Lo que no ves, no lo gastas"',
    detail: 'Separar el ahorro en cuenta diferente hace que no lo toques por impulso.',
  },
];

const TASAS_REF = [3, 5, 8, 10];

const AUDIO_SCRIPT = [
  '"Los intereses son el pago que el banco te hace por dejarle usar tu dinero temporalmente. No es un regalo: es tu derecho."',
  '"Si tienes $5,000 en una cuenta con 3% de rendimiento anual, al año tendras $5,150. Sin mover un dedo."',
  '"Ahora imagina que esos $150 tambien generan interes el siguiente año. Eso se llama interes compuesto, y lo veremos mas a fondo en la Leccion 12."',
  '"El IPAB protege tus depositos en bancos autorizados hasta 400,000 UDIs (aproximadamente 3 millones de pesos). Si tu banco quiebra, el gobierno te regresa tu dinero."',
];

export default function L03() {
  const [step, setStep] = useState(0);
  const [audioRead, setAudioRead] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [monto, setMonto] = useState('5000');
  const [tasa, setTasa] = useState(3);
  const [plazo, setPlazo] = useState('12');
  const [q1, setQ1] = useState<Q1>(null);
  const [q2, setQ2] = useState<Q2>(null);

  const montoNum = parseFloat(monto) || 0;
  const plazoNum = parseInt(plazo) || 0;
  const resultado = useMemo(
    () => montoNum * Math.pow(1 + tasa / 100 / 12, plazoNum),
    [montoNum, tasa, plazoNum]
  );

  const quizDone = q1 !== null && q2 !== null;
  const score = [q1 === 'b', q2 === 'b'].filter(Boolean).length;

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
      id="L03"
      title="Tu dinero en el banco trabaja por ti"
      completion={{ ready: audioRead && quizDone, score: score / 2 }}
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
                title="Tu dinero puede generar dinero"
                message="¿Sabias que tu dinero en el banco puede generar dinero sin que hagas nada? No mucho, pero algo. Y ese algo, sumado mes a mes, importa."
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'success.main', bgcolor: 'success.light' }}>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
                  Ejemplo rapido:
                </Typography>
                <Typography variant="body2">
                  $5,000 al 3% anual = <b>$5,150</b> al final del año. Sin hacer nada.
                </Typography>
              </FECard>
              <Button fullWidth variant="contained" color="success" size="large" onClick={() => setStep(1)}>
                Ver la explicacion completa →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 1 — Transcripcion del audio */}
        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="body1" fontWeight={700}>
                Finni explica (transcripcion):
              </Typography>
              <Stack spacing={2}>
                {AUDIO_SCRIPT.map((line, i) => (
                  <FECard key={i} variant="flat" sx={{ border: 1, borderColor: 'divider', p: 2 }}>
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                      {line}
                    </Typography>
                  </FECard>
                ))}
              </Stack>
              <Button
                fullWidth
                variant="contained"
                color="success"
                size="large"
                onClick={() => { setAudioRead(true); setStep(2); }}
              >
                Entendido — ver los 4 beneficios →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 2 — 4 beneficios expandibles + calculadora */}
        {step === 2 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="body1" fontWeight={700}>
                4 beneficios del ahorro formal — toca cada uno:
              </Typography>
              <Stack spacing={2}>
                {BENEFICIOS.map((b, i) => (
                  <FECard
                    key={i}
                    variant="flat"
                    sx={{ border: 1, borderColor: expanded.has(i) ? 'success.main' : 'divider', cursor: 'pointer' }}
                    onClick={() => toggleExpanded(i)}
                    role="button"
                    tabIndex={0}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight={700}>{b.title}</Typography>
                      <Typography variant="caption">{expanded.has(i) ? '▲' : '▼'}</Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">{b.example}</Typography>
                    {expanded.has(i) && (
                      <Fade in>
                        <Typography variant="body2" sx={{ mt: 1, color: 'success.dark' }}>
                          {b.detail}
                        </Typography>
                      </Fade>
                    )}
                  </FECard>
                ))}
              </Stack>

              <FECard variant="flat" sx={{ border: 1, borderColor: 'success.light' }}>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1.5 }}>
                  Calculadora basica
                </Typography>
                <Stack spacing={1.5}>
                  <TextField
                    label="Monto inicial ($)"
                    size="small"
                    type="number"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    inputProps={{ min: 0 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Tasa de rendimiento:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {TASAS_REF.map((t) => (
                      <Chip
                        key={t}
                        label={`${t}%`}
                        color={tasa === t ? 'success' : 'default'}
                        onClick={() => setTasa(t)}
                        sx={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Stack>
                  <TextField
                    label="Plazo (meses)"
                    size="small"
                    type="number"
                    value={plazo}
                    onChange={(e) => setPlazo(e.target.value)}
                    inputProps={{ min: 1, max: 60 }}
                  />
                  {montoNum > 0 && plazoNum > 0 && (
                    <Fade in>
                      <FECard variant="flat" sx={{ bgcolor: 'success.light', textAlign: 'center', py: 1.5 }}>
                        <Typography variant="body2" color="text.secondary">Al final tendrias:</Typography>
                        <Typography variant="h4" color="success.dark">
                          ${resultado.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        </Typography>
                      </FECard>
                    </Fade>
                  )}
                </Stack>
              </FECard>

              <Button fullWidth variant="contained" color="success" size="large" onClick={() => setStep(3)}>
                Quiz de cierre →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 3 — Quiz de 2 preguntas */}
        {step === 3 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="h4">Quiz de comprension</Typography>

              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography variant="body1" fontWeight={700} sx={{ mb: 1.5 }}>
                  1. ¿Cuanto protege el IPAB por persona por banco?
                </Typography>
                <Stack spacing={1}>
                  {[
                    { key: 'a', label: 'A) $500,000' },
                    { key: 'b', label: 'B) ~3 millones de pesos' },
                    { key: 'c', label: 'C) Todo el saldo sin limite' },
                  ].map((o) => (
                    <Button
                      key={o.key}
                      variant={q1 === o.key ? 'contained' : 'outlined'}
                      color={q1 === o.key ? (o.key === 'b' ? 'success' : 'error') : 'inherit'}
                      onClick={() => setQ1(o.key as Q1)}
                      disabled={q1 !== null}
                      sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                    >
                      {o.label}
                    </Button>
                  ))}
                </Stack>
                {q1 && (
                  <Chip sx={{ mt: 1 }} color={q1 === 'b' ? 'success' : 'error'}
                    label={q1 === 'b' ? '¡Correcto! Hasta 400,000 UDIs ≈ 3 millones.' : 'Son ~3 millones de pesos (400,000 UDIs).'} />
                )}
              </FECard>

              {q1 && (
                <Fade in>
                  <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                    <Typography variant="body1" fontWeight={700} sx={{ mb: 1.5 }}>
                      2. ¿Que es el interes que ganas en tu cuenta de ahorro?
                    </Typography>
                    <Stack spacing={1}>
                      {[
                        { key: 'a', label: 'A) Un favor del banco' },
                        { key: 'b', label: 'B) El pago por usar tu dinero' },
                        { key: 'c', label: 'C) Un impuesto' },
                      ].map((o) => (
                        <Button
                          key={o.key}
                          variant={q2 === o.key ? 'contained' : 'outlined'}
                          color={q2 === o.key ? (o.key === 'b' ? 'success' : 'error') : 'inherit'}
                          onClick={() => setQ2(o.key as Q2)}
                          disabled={q2 !== null}
                          sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                        >
                          {o.label}
                        </Button>
                      ))}
                    </Stack>
                    {q2 && (
                      <Chip sx={{ mt: 1 }} color={q2 === 'b' ? 'success' : 'error'}
                        label={q2 === 'b' ? '¡Correcto! Es tu derecho, no un regalo.' : 'El banco te paga porque usa tu dinero. Es tu derecho.'} />
                    )}
                  </FECard>
                </Fade>
              )}

              {quizDone && (
                <Fade in>
                  <FinniMessage
                    variant="success"
                    title={`${score}/2 correctas`}
                    message="Verifica que tu banco este registrado en el IPAB: ipab.gob.mx"
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
