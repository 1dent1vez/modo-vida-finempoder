import { useEffect, useState } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade,
  Chip, TextField, Collapse, Paper,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

const CRITERIOS = [
  {
    criterio: 'Objetivo',
    ahorro: 'Proteger y tener disponible',
    inversion: 'Hacer crecer por encima de la inflación',
    detalle: 'El ahorro es para no perder. La inversión es para ganar.',
  },
  {
    criterio: 'Riesgo',
    ahorro: 'Mínimo o nulo (con IPAB)',
    inversion: 'Variable: bajo (CETES) a alto (acciones)',
    detalle: 'Con el ahorro, tu dinero está casi siempre protegido. Con la inversión, asumes riesgo calculado.',
  },
  {
    criterio: 'Rendimiento',
    ahorro: '1-4% anual en México',
    inversion: 'Mayor, pero no garantizado',
    detalle: 'Rendimiento mayor implica mayor incertidumbre. No hay magia.',
  },
  {
    criterio: 'Plazo',
    ahorro: 'Corto a mediano plazo',
    inversion: 'Mediano a largo plazo',
    detalle: 'Regla de oro: si lo necesitas en menos de 1 año, ahorra. Si puedes esperar +1 año, considera invertir.',
  },
  {
    criterio: 'Liquidez',
    ahorro: 'Alta — accedes rápido',
    inversion: 'Variable según el instrumento',
    detalle: 'Un CETES de 28 días tiene alta liquidez. Un fondo a 5 años, menos.',
  },
];

const CASOS = [
  {
    texto: '"Quiero $5,000 para un viaje en 2 meses."',
    respuesta: 'ahorro',
    razon: 'Plazo muy corto (2 meses). No hay tiempo para riesgo. El ahorro es la respuesta.',
  },
  {
    texto: '"Quiero tener $50,000 en 3 años para mi primer negocio."',
    respuesta: 'inversion',
    razon: 'Plazo mediano (3 años) y meta ambiciosa. La inversión puede ayudarte a crecer más que la inflación.',
  },
  {
    texto: '"Necesito tener disponible mi fondo de emergencias."',
    respuesta: 'ahorro',
    razon: 'Un fondo de emergencias necesita alta liquidez. No puede estar en riesgo.',
  },
  {
    texto: '"Quiero que mi dinero crezca más que la inflación en 2 años."',
    respuesta: 'inversion',
    razon: 'Objetivo claro de superar la inflación con plazo mediano. CETES o fondo conservador.',
  },
  {
    texto: '"Voy a necesitar $3,000 en 6 meses para mi inscripción."',
    respuesta: 'ahorro',
    razon: 'Plazo corto y dinero comprometido. No tomes riesgo con dinero que necesitarás pronto.',
  },
  {
    texto: '"Tengo $500 que no necesito en al menos 1 año."',
    respuesta: 'inversion',
    razon: 'Plazo mínimo de 1 año y sin urgencia. CETES o fondo conservador son excelentes opciones.',
  },
];

export default function L02() {
  const [step, setStep] = useState(0);
  const [expandido, setExpandido] = useState<number | null>(null);
  const [respuestas, setRespuestas] = useState<(string | null)[]>(Array(6).fill(null));
  const [objetivoPersonal, setObjetivoPersonal] = useState('');
  const [guardado, setGuardado] = useState(false);

  const aciertos = respuestas.filter((r, i) => r === CASOS[i]!.respuesta).length;
  const casosCompletos = respuestas.every((r) => r !== null);
  const score = casosCompletos ? aciertos / 6 : 0;

  useEffect(() => {
    const load = async () => {
      const saved = await lessonDataRepository.load<{ objetivo: string }>('inversion', 'l02_objetivo');
      if (saved?.objetivo) setObjetivoPersonal(saved.objetivo);
    };
    void load();
  }, []);

  const handleGuardar = async () => {
    await lessonDataRepository.save('inversion', 'l02_objetivo', { objetivo: objetivoPersonal });
    setGuardado(true);
  };

  const responder = (idx: number, valor: string) => {
    setRespuestas((prev) => prev.map((r, i) => (i === idx ? valor : r)));
  };

  return (
    <LessonShell
      id="L02"
      title="¿Ahorro o inversión? No es lo mismo, aunque se parezcan"
      completion={{ ready: casosCompletos && guardado, score }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={(step / 3) * 100}
          color="info"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {/* Pantalla 0 — Apertura */}
        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="coach"
                title="¿El dinero en tu cuenta de ahorro está 'invertido'?"
                message="No exactamente. Hay una diferencia importante entre ahorrar e invertir, y confundirlos puede costarte. Hoy la aclaramos."
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography variant="body1" fontWeight={700} sx={{ mb: 2 }}>
                  Tabla comparativa: Ahorro vs Inversión
                </Typography>
                <Stack spacing={1}>
                  {CRITERIOS.map((c, i) => (
                    <Paper key={c.criterio} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ p: 1.5, cursor: 'pointer', bgcolor: expandido === i ? 'warning.light' : 'grey.50' }}
                        onClick={() => setExpandido(expandido === i ? null : i)}
                      >
                        <Typography fontWeight={700}>{c.criterio}</Typography>
                        {expandido === i ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </Stack>
                      <Collapse in={expandido === i}>
                        <Box sx={{ p: 2 }}>
                          <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                            <FECard variant="flat" sx={{ flex: 1, bgcolor: 'success.light' }}>
                              <Typography variant="caption" fontWeight={700} color="success.dark">Ahorro</Typography>
                              <Typography variant="body2">{c.ahorro}</Typography>
                            </FECard>
                            <FECard variant="flat" sx={{ flex: 1, bgcolor: 'warning.light' }}>
                              <Typography variant="caption" fontWeight={700} color="warning.dark">Inversión</Typography>
                              <Typography variant="body2">{c.inversion}</Typography>
                            </FECard>
                          </Stack>
                          <Typography variant="caption" color="text.secondary">{c.detalle}</Typography>
                        </Box>
                      </Collapse>
                    </Paper>
                  ))}
                </Stack>
              </FECard>
              <Button fullWidth variant="contained" color="info" size="large" onClick={() => setStep(1)}>
                Practicar con casos reales →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 1 — Casos de uso */}
        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="h4" fontWeight={700}>6 situaciones reales</Typography>
              <Typography variant="body2" color="text.secondary">
                ¿Cada situación requiere ahorro o inversión?
              </Typography>
              <Stack spacing={2}>
                {CASOS.map((caso, i) => {
                  const respuesta = respuestas[i];
                  const correcto = respuesta === caso.respuesta;
                  const respondido = respuesta !== null;
                  return (
                    <FECard key={i} variant="flat" sx={{ border: 1, borderColor: respondido ? (correcto ? 'success.main' : 'error.main') : 'divider' }}>
                      <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>{caso.texto}</Typography>
                      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                        <Button
                          size="small"
                          variant={respuesta === 'ahorro' ? 'contained' : 'outlined'}
                          color="success"
                          onClick={() => responder(i, 'ahorro')}
                        >
                          Ahorro
                        </Button>
                        <Button
                          size="small"
                          variant={respuesta === 'inversion' ? 'contained' : 'outlined'}
                          color="info"
                          onClick={() => responder(i, 'inversion')}
                        >
                          Inversión
                        </Button>
                      </Stack>
                      {respondido && (
                        <Fade in>
                          <Box>
                            <Chip
                              size="small"
                              label={correcto ? '✓ Correcto' : '✗ Incorrecto'}
                              color={correcto ? 'success' : 'error'}
                              sx={{ mb: 0.5 }}
                            />
                            <Typography variant="caption" display="block" color="text.secondary">
                              {caso.razon}
                            </Typography>
                          </Box>
                        </Fade>
                      )}
                    </FECard>
                  );
                })}
              </Stack>
              {casosCompletos && (
                <Fade in>
                  <Stack spacing={2}>
                    <FECard variant="flat" sx={{ bgcolor: aciertos >= 5 ? 'success.light' : 'info.light', border: 1, borderColor: aciertos >= 5 ? 'success.main' : 'info.main' }}>
                      <Typography fontWeight={700}>Resultado: {aciertos}/6 correctas</Typography>
                      <Typography variant="body2">{aciertos >= 5 ? '¡Excelente! Tienes muy claro cuándo usar cada herramienta.' : 'Revisa las incorrectas — el criterio clave es el plazo y la liquidez necesaria.'}</Typography>
                    </FECard>
                    <Button fullWidth variant="contained" color="info" size="large" onClick={() => setStep(2)}>
                      Aplicar a mi situación →
                    </Button>
                  </Stack>
                </Fade>
              )}
            </Stack>
          </Fade>
        )}

        {/* Pantalla 2 — Regla de oro + aplicación personal */}
        {step === 2 && (
          <Fade in>
            <Stack spacing={3}>
              <FECard variant="flat" sx={{ bgcolor: 'warning.light', border: 2, borderColor: 'warning.main' }}>
                <Typography variant="body1" fontWeight={800}>Regla de oro</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  Si necesitas el dinero en menos de 1 año: <b>ahorra</b>.{' '}
                  Si puedes esperar más de 1 año: <b>considera invertir</b>.
                </Typography>
              </FECard>
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography variant="body1" fontWeight={700} sx={{ mb: 1 }}>
                  ¿Para qué podrías invertir TÚ?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  ¿Tienes algún objetivo a más de 1 año? Escríbelo — lo usaremos en la Lección 13.
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Ej: Ahorrar para mi primera laptop, para un viaje, para emprender..."
                  value={objetivoPersonal}
                  onChange={(e) => setObjetivoPersonal(e.target.value)}
                  size="small"
                />
              </FECard>
              <FinniMessage
                variant="coach"
                title="Ahorro e inversión no se excluyen"
                message="El ahorro es la base. La inversión es el siguiente nivel. Primero construye el fondo de emergencias — luego viene la inversión."
              />
              <Button
                fullWidth
                variant="contained"
                color="info"
                size="large"
                disabled={objetivoPersonal.trim().length < 5}
                onClick={() => void handleGuardar()}
              >
                {guardado ? '✅ Guardado — lección completada' : 'Guardar mi objetivo de inversión'}
              </Button>
            </Stack>
          </Fade>
        )}
      </Box>
    </LessonShell>
  );
}
