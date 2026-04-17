import { useState } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade,
  Chip, Paper,
} from '@mui/material';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';

const INSTRUMENTOS = [
  {
    emoji: '🔵',
    nombre: 'Instrumentos de Deuda (Renta Fija)',
    desc: 'Prestas dinero al gobierno o empresa y te pagan interés. Monto y plazo conocidos.',
    ejemplos: 'CETES, Bondes, depósitos a plazo',
    minimo: '$100',
    riesgo: 2,
    rendimiento: '8-11% anual',
    tipo: 'deuda',
    liquidez: 'Alta',
    paraQuien: 'Ideal para principiantes y perfil conservador.',
  },
  {
    emoji: '🔴',
    nombre: 'Renta Variable (Acciones)',
    desc: 'Compras parte de una empresa. Mayor riesgo y mayor potencial de rendimiento.',
    ejemplos: 'Acciones en la BMV (Cemex, Bimbo, América Móvil)',
    minimo: '~$200',
    riesgo: 4,
    rendimiento: 'Variable (puede ser negativo)',
    tipo: 'variable',
    liquidez: 'Media',
    paraQuien: 'Para perfiles moderados a agresivos con horizonte largo.',
  },
  {
    emoji: '🟡',
    nombre: 'Fondos de Inversión',
    desc: 'Grupo de personas que juntan su dinero e invierten colectivamente. Un gestor decide dónde.',
    ejemplos: 'Fondos de deuda, balanceados o de acciones regulados por CNBV',
    minimo: '$100-$5,000',
    riesgo: 3,
    rendimiento: 'Varía según el fondo',
    tipo: 'deuda',
    liquidez: 'Media-Alta',
    paraQuien: 'Accesibles con montos pequeños. Riesgo variable según el fondo.',
  },
  {
    emoji: '🟢',
    nombre: 'Bienes Raíces Digitales (FIBRAs)',
    desc: 'Inversión en bienes inmuebles a través de la bolsa. Desde montos pequeños.',
    ejemplos: 'FIBRA Uno, FIBRA Danhos en la BMV',
    minimo: '~$500',
    riesgo: 3,
    rendimiento: '7-10% anual',
    tipo: 'variable',
    liquidez: 'Media',
    paraQuien: 'Para quienes quieren bienes raíces sin comprar un inmueble.',
  },
];

const QUIZ_ITEMS = [
  { nombre: 'CETES', tipo: 'deuda' },
  { nombre: 'Acción de Cemex en BMV', tipo: 'variable' },
  { nombre: 'Depósito a plazo en banco', tipo: 'deuda' },
  { nombre: 'FIBRA Danhos', tipo: 'variable' },
  { nombre: 'Fondo de deuda gubernamental', tipo: 'deuda' },
];

export default function L05() {
  const [step, setStep] = useState(0);
  const [expandido, setExpandido] = useState<number | null>(null);
  const [comparar, setComparar] = useState<number[]>([]);
  const [filtro, setFiltro] = useState<string | null>(null);
  const [respuestas, setRespuestas] = useState<(string | null)[]>(Array(5).fill(null));

  const aciertos = respuestas.filter((r, i) => r === QUIZ_ITEMS[i]!.tipo).length;
  const quizCompleto = respuestas.every((r) => r !== null);
  const score = quizCompleto ? aciertos / 5 : 0;

  const toggleComparar = (i: number) => {
    setComparar((prev) => {
      if (prev.includes(i)) return prev.filter((x) => x !== i);
      if (prev.length >= 2) return [prev[1]!, i];
      return [...prev, i];
    });
  };

  const filtrados = filtro
    ? INSTRUMENTOS.filter((inst) => {
        if (filtro === 'conservador') return inst.riesgo <= 2;
        if (filtro === 'equilibrio') return inst.riesgo === 3;
        return inst.riesgo >= 4;
      })
    : INSTRUMENTOS;

  return (
    <LessonShell
      id="L05"
      title="El menú de inversiones: ¿qué opciones existen en México?"
      completion={{ ready: quizCompleto, score }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={(step / 3) * 100}
          color="info"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {/* Pantalla 0 — Menú de categorías */}
        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="coach"
                title="El menú de inversiones"
                message="Así como en un restaurante hay opciones de distintos precios y estilos, en el mundo de las inversiones hay un menú. Hoy lo vas a conocer para elegir con criterio."
              />
              <Stack spacing={2}>
                {INSTRUMENTOS.map((inst, i) => (
                  <Paper
                    key={inst.nombre}
                    sx={{ borderRadius: 3, overflow: 'hidden', border: 2, borderColor: expandido === i ? 'warning.main' : 'divider' }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={2}
                      sx={{ p: 2, cursor: 'pointer', bgcolor: expandido === i ? 'warning.light' : 'grey.50' }}
                      onClick={() => setExpandido(expandido === i ? null : i)}
                    >
                      <Typography variant="h5">{inst.emoji}</Typography>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={800}>{inst.nombre}</Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                          <Chip size="small" label={`Desde ${inst.minimo}`} />
                          <Chip size="small" label={`Riesgo ${'⭐'.repeat(inst.riesgo)}${'☆'.repeat(5 - inst.riesgo)}`} />
                        </Stack>
                      </Box>
                    </Stack>
                    {expandido === i && (
                      <Fade in>
                        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                          <Typography variant="body2" sx={{ mb: 1 }}>{inst.desc}</Typography>
                          <Typography variant="body2"><b>Ejemplos:</b> {inst.ejemplos}</Typography>
                          <Typography variant="body2"><b>Rendimiento típico:</b> {inst.rendimiento}</Typography>
                          <Typography variant="body2"><b>Liquidez:</b> {inst.liquidez}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                            💡 {inst.paraQuien}
                          </Typography>
                        </Box>
                      </Fade>
                    )}
                  </Paper>
                ))}
              </Stack>
              <FinniMessage
                variant="coach"
                title="Para estudiantes que empiezan"
                message="Las opciones más accesibles son CETES, fondos de inversión de bajo riesgo y plataformas de micro-inversión reguladas."
              />
              <Button fullWidth variant="contained" color="info" size="large" onClick={() => setStep(1)}>
                Comparar instrumentos →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 1 — Comparador + filtro por perfil */}
        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="h4" fontWeight={700}>Compara 2 instrumentos</Typography>
              <Typography variant="body2" color="text.secondary">Selecciona 2 para compararlos lado a lado:</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {INSTRUMENTOS.map((inst, i) => (
                  <Chip
                    key={inst.nombre}
                    label={`${inst.emoji} ${inst.nombre.split(' ')[0]}`}
                    onClick={() => toggleComparar(i)}
                    variant={comparar.includes(i) ? 'filled' : 'outlined'}
                    color={comparar.includes(i) ? 'warning' : 'default'}
                  />
                ))}
              </Stack>
              {comparar.length === 2 && (
                <Fade in>
                  <Stack direction="row" spacing={2}>
                    {comparar.map((idx) => {
                      const inst = INSTRUMENTOS[idx]!;
                      return (
                        <FECard key={idx} variant="flat" sx={{ flex: 1, border: 1, borderColor: 'warning.main' }}>
                          <Typography fontWeight={700}>{inst.emoji} {inst.nombre.split('(')[0]}</Typography>
                          <Stack spacing={0.5} sx={{ mt: 1 }}>
                            <Typography variant="caption"><b>Mínimo:</b> {inst.minimo}</Typography>
                            <Typography variant="caption"><b>Riesgo:</b> {'⭐'.repeat(inst.riesgo)}</Typography>
                            <Typography variant="caption"><b>Rendimiento:</b> {inst.rendimiento}</Typography>
                            <Typography variant="caption"><b>Liquidez:</b> {inst.liquidez}</Typography>
                          </Stack>
                        </FECard>
                      );
                    })}
                  </Stack>
                </Fade>
              )}

              <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>Filtrar por perfil:</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {['conservador', 'equilibrio', 'crecimiento'].map((f) => (
                  <Chip
                    key={f}
                    label={f === 'conservador' ? 'Seguridad (bajo riesgo)' : f === 'equilibrio' ? 'Equilibrio' : 'Crecimiento (mayor riesgo)'}
                    onClick={() => setFiltro(filtro === f ? null : f)}
                    variant={filtro === f ? 'filled' : 'outlined'}
                    color={filtro === f ? 'warning' : 'default'}
                  />
                ))}
              </Stack>
              {filtro && (
                <Fade in>
                  <Stack spacing={1}>
                    {filtrados.map((inst) => (
                      <Paper key={inst.nombre} sx={{ p: 2, borderRadius: 2, bgcolor: 'warning.light' }}>
                        <Typography variant="body2" fontWeight={700}>{inst.emoji} {inst.nombre}</Typography>
                        <Typography variant="caption">{inst.ejemplos}</Typography>
                      </Paper>
                    ))}
                  </Stack>
                </Fade>
              )}
              <Button fullWidth variant="contained" color="info" size="large" onClick={() => setStep(2)}>
                Quiz de reconocimiento →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 2 — Quiz: deuda vs variable */}
        {step === 2 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="h4" fontWeight={700}>Quiz: ¿deuda o variable?</Typography>
              <Stack spacing={2}>
                {QUIZ_ITEMS.map((item, i) => {
                  const resp = respuestas[i];
                  const respondido = resp !== null;
                  const correcto = resp === item.tipo;
                  return (
                    <FECard key={item.nombre} variant="flat" sx={{ border: 1, borderColor: respondido ? (correcto ? 'success.main' : 'error.main') : 'divider' }}>
                      <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>{item.nombre}</Typography>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant={resp === 'deuda' ? 'contained' : 'outlined'}
                          color={respondido ? (item.tipo === 'deuda' ? 'success' : resp === 'deuda' ? 'error' : 'inherit') : 'warning'}
                          onClick={() => { if (!respondido) setRespuestas((prev) => prev.map((r, idx) => idx === i ? 'deuda' : r)); }}
                        >
                          Deuda
                        </Button>
                        <Button
                          size="small"
                          variant={resp === 'variable' ? 'contained' : 'outlined'}
                          color={respondido ? (item.tipo === 'variable' ? 'success' : resp === 'variable' ? 'error' : 'inherit') : 'warning'}
                          onClick={() => { if (!respondido) setRespuestas((prev) => prev.map((r, idx) => idx === i ? 'variable' : r)); }}
                        >
                          Variable
                        </Button>
                      </Stack>
                      {respondido && (
                        <Typography variant="caption" color={correcto ? 'success.main' : 'error.main'} sx={{ mt: 0.5, display: 'block' }}>
                          {correcto ? '✓ Correcto' : `✗ Es ${item.tipo === 'deuda' ? 'Deuda' : 'Renta Variable'}`}
                        </Typography>
                      )}
                    </FECard>
                  );
                })}
              </Stack>
              {quizCompleto && (
                <Fade in>
                  <Stack spacing={2}>
                    <FECard variant="flat" sx={{ bgcolor: aciertos >= 4 ? 'success.light' : 'info.light', border: 2, borderColor: aciertos >= 4 ? 'success.main' : 'info.main', textAlign: 'center' }}>
                      <Typography variant="h4">{aciertos >= 4 ? '🎯' : '📚'}</Typography>
                      <Typography fontWeight={800}>{aciertos}/5 correctas</Typography>
                    </FECard>
                    <FinniMessage
                      variant="coach"
                      title="¡Ya conoces el menú!"
                      message="En las próximas lecciones vamos a profundizar en los instrumentos más relevantes para ti: CETES, fondos y bolsa."
                    />
                  </Stack>
                </Fade>
              )}
            </Stack>
          </Fade>
        )}
      </Box>
    </LessonShell>
  );
}
