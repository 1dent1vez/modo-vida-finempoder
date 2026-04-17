import { useEffect, useState } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade,
  TextField, Paper, Chip, MenuItem,
} from '@mui/material';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

const INSTRUMENTOS_POR_PERFIL: Record<string, string[]> = {
  conservador: ['CETES 28 días', 'CETES 91 días', 'Fondo de deuda gubernamental'],
  moderado: ['Fondo balanceado', 'CETES 91 días + fondo mixto', 'FIBRAs'],
  agresivo: ['Acciones BMV (GBM+)', 'Fondo de renta variable', 'ETFs internacionales (plataforma CNBV)'],
  default: ['CETES 28 días', 'Fondo balanceado', 'Fondo de deuda gubernamental'],
};

const TASA_POR_INSTRUMENTO: Record<string, number> = {
  'CETES 28 días': 0.10,
  'CETES 91 días': 0.102,
  'CETES 91 días + fondo mixto': 0.095,
  'Fondo de deuda gubernamental': 0.09,
  'Fondo balanceado': 0.11,
  'FIBRAs': 0.10,
  'Acciones BMV (GBM+)': 0.13,
  'Fondo de renta variable': 0.125,
  'ETFs internacionales (plataforma CNBV)': 0.12,
};

function calcProyeccion(capital: number, aportacion: number, tasa: number, meses: number): number {
  const tasaMensual = tasa / 12;
  let total = capital;
  for (let i = 0; i < meses; i++) {
    total = total * (1 + tasaMensual) + aportacion;
  }
  return total;
}

export default function L13() {
  const [step, setStep] = useState(0);
  const [objetivo, setObjetivo] = useState('');
  const [categoriaObjetivo, setCategoriaObjetivo] = useState('');
  const [capitalInicial, setCapitalInicial] = useState(0);
  const [aportacionMensual, setAportacionMensual] = useState(200);
  const [plazoMeses, setPlazoMeses] = useState(12);
  const [instrumento, setInstrumento] = useState('');
  const [perfilGuardado, setPerfilGuardado] = useState<string>('default');
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    const load = async () => {
      const objetivo2 = await lessonDataRepository.load<{ objetivo: string }>('inversion', 'l02_objetivo');
      if (objetivo2?.objetivo) setObjetivo(objetivo2.objetivo);

      const capital4 = await lessonDataRepository.load<{ capital: number }>('inversion', 'l04_capital');
      if (capital4?.capital) setCapitalInicial(capital4.capital);

      const perfil8 = await lessonDataRepository.load<{ perfil: string }>('inversion', 'l08_perfil_riesgo');
      const perfil = perfil8?.perfil ?? 'default';
      setPerfilGuardado(perfil);
      const instsDispo = INSTRUMENTOS_POR_PERFIL[perfil] ?? INSTRUMENTOS_POR_PERFIL.default!;
      setInstrumento(instsDispo[0]!);

      const plataformas7 = await lessonDataRepository.load<{ plataformas: string[] }>('inversion', 'l07_plataformas');
      if (plataformas7?.plataformas?.length) {
        // plataformas como contexto, no se usa directamente en el form
      }
    };
    void load();
  }, []);

  const instrumentosDisponibles = INSTRUMENTOS_POR_PERFIL[perfilGuardado] ?? INSTRUMENTOS_POR_PERFIL.default!;
  const tasaAnual = TASA_POR_INSTRUMENTO[instrumento] ?? 0.09;
  const proyeccion = calcProyeccion(capitalInicial, aportacionMensual, tasaAnual, plazoMeses);
  const totalAportado = capitalInicial + aportacionMensual * plazoMeses;
  const ganancia = proyeccion - totalAportado;
  const inflacion = 0.0466;
  const supera = tasaAnual > inflacion;

  const seccion1Lista = objetivo.trim().length >= 3 && categoriaObjetivo;
  const seccion2Lista = capitalInicial >= 0 && aportacionMensual >= 0;
  const seccion3Lista = plazoMeses >= 1;
  const seccion4Lista = instrumento;
  const planCompleto = !!(seccion1Lista && seccion2Lista && seccion3Lista && seccion4Lista);

  const handleGuardar = async () => {
    await lessonDataRepository.save('inversion', 'l13_plan', {
      objetivo,
      categoriaObjetivo,
      capitalInicial,
      aportacionMensual,
      plazoMeses,
      instrumento,
      tasaAnual,
      proyeccion,
      perfil: perfilGuardado,
      guardadoEn: new Date().toISOString(),
    });
    setGuardado(true);
  };

  return (
    <LessonShell
      id="L13"
      title="Tu plan de inversión personal: metas, montos y plazos"
      completion={{ ready: planCompleto && guardado }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={planCompleto ? 100 : ((Number(seccion1Lista) + Number(seccion2Lista) + Number(seccion3Lista) + Number(!!seccion4Lista)) / 4) * 80}
          color="info"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="coach"
                title="¡Es momento de juntar todo lo que aprendiste!"
                message="Hoy vas a construir tu plan personal de inversión. No el de un experto con millones — el tuyo, con tu situación real, como estudiante mexicano."
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography fontWeight={700} sx={{ mb: 1 }}>Un plan de inversión básico tiene 4 componentes:</Typography>
                {[
                  '1. Tu objetivo: ¿para qué quieres que crezca tu dinero?',
                  '2. Tu monto: ¿cuánto puedes invertir hoy y de forma recurrente?',
                  '3. Tu plazo: ¿cuándo quieres ver el resultado?',
                  '4. Tu instrumento: ¿cuál es el más adecuado para tu perfil?',
                ].map((p) => (
                  <Typography key={p} variant="body2" sx={{ py: 0.5 }}>✓ {p}</Typography>
                ))}
                <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', color: 'text.secondary' }}>
                  "Un plan aproximado hoy es mejor que el plan perfecto nunca."
                </Typography>
              </FECard>
              {perfilGuardado !== 'default' && (
                <FECard variant="flat" sx={{ bgcolor: 'info.light', border: 1, borderColor: 'info.main' }}>
                  <Typography variant="caption" fontWeight={700}>Recuperado desde lecciones anteriores:</Typography>
                  <Typography variant="caption" display="block">Perfil de riesgo: <b>{perfilGuardado}</b></Typography>
                  {capitalInicial > 0 && (
                    <Typography variant="caption" display="block">Capital disponible (L4): <b>${capitalInicial.toLocaleString()}</b></Typography>
                  )}
                </FECard>
              )}
              <Button fullWidth variant="contained" color="info" size="large" onClick={() => setStep(1)}>
                Construir mi plan →
              </Button>
            </Stack>
          </Fade>
        )}

        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="h4" fontWeight={700}>Mi plan de inversión</Typography>

              {/* Sección 1 — Objetivo */}
              <Paper sx={{ p: 2, borderRadius: 3, border: 2, borderColor: seccion1Lista ? 'success.main' : 'warning.main' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Typography fontWeight={800}>1. Objetivo</Typography>
                  {seccion1Lista && <Chip size="small" label="✓" color="success" />}
                </Stack>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  label="¿Para qué quieres invertir?"
                  value={objetivo}
                  onChange={(e) => setObjetivo(e.target.value)}
                  placeholder="Ej: Comprar mi primera laptop, estudios de posgrado, emprender..."
                  sx={{ mb: 1.5 }}
                />
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Categoría"
                  value={categoriaObjetivo}
                  onChange={(e) => setCategoriaObjetivo(e.target.value)}
                >
                  {['Educación', 'Emprendimiento', 'Tecnología', 'Viaje', 'Emergencias', 'Otro'].map((op) => (
                    <MenuItem key={op} value={op}>{op}</MenuItem>
                  ))}
                </TextField>
              </Paper>

              {/* Sección 2 — Montos */}
              <Paper sx={{ p: 2, borderRadius: 3, border: 2, borderColor: 'warning.main' }}>
                <Typography fontWeight={800} sx={{ mb: 1.5 }}>2. Montos</Typography>
                <Stack spacing={1.5}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Capital inicial ($)"
                    value={capitalInicial}
                    onChange={(e) => setCapitalInicial(Math.max(0, Number(e.target.value)))}
                    inputProps={{ min: 0, step: 100 }}
                    helperText="Desde L4 — puedes ajustarlo"
                  />
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Aportación mensual ($)"
                    value={aportacionMensual}
                    onChange={(e) => setAportacionMensual(Math.max(0, Number(e.target.value)))}
                    inputProps={{ min: 0, step: 50 }}
                  />
                </Stack>
              </Paper>

              {/* Sección 3 — Plazo */}
              <Paper sx={{ p: 2, borderRadius: 3, border: 2, borderColor: 'warning.main' }}>
                <Typography fontWeight={800} sx={{ mb: 1.5 }}>3. Plazo</Typography>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Horizonte de inversión"
                  value={plazoMeses}
                  onChange={(e) => setPlazoMeses(Number(e.target.value))}
                >
                  {[6, 12, 18, 24, 36, 48, 60].map((m) => (
                    <MenuItem key={m} value={m}>{m} meses ({(m / 12).toFixed(1)} años)</MenuItem>
                  ))}
                </TextField>
              </Paper>

              {/* Sección 4 — Instrumento */}
              <Paper sx={{ p: 2, borderRadius: 3, border: 2, borderColor: instrumento ? 'success.main' : 'warning.main' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography fontWeight={800}>4. Instrumento</Typography>
                  {perfilGuardado !== 'default' && (
                    <Chip size="small" label={`Perfil: ${perfilGuardado}`} color="info" />
                  )}
                </Stack>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Instrumento (filtrado por perfil)"
                  value={instrumento}
                  onChange={(e) => setInstrumento(e.target.value)}
                >
                  {instrumentosDisponibles.map((inst) => (
                    <MenuItem key={inst} value={inst}>{inst}</MenuItem>
                  ))}
                </TextField>
              </Paper>

              {/* Proyección dinámica */}
              {planCompleto && (
                <Fade in>
                  <Stack spacing={2}>
                    <Paper
                      sx={{
                        p: 2, borderRadius: 3,
                        bgcolor: supera ? 'success.light' : 'warning.light',
                        border: 2,
                        borderColor: supera ? 'success.main' : 'warning.main',
                      }}
                    >
                      <Typography variant="body2" fontWeight={700}>Proyección a {plazoMeses} meses:</Typography>
                      <Typography variant="h4" fontWeight={900}>${proyeccion.toFixed(0)}</Typography>
                      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Total aportado</Typography>
                          <Typography variant="body2" fontWeight={700}>${totalAportado.toLocaleString()}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Ganancia estimada</Typography>
                          <Typography variant="body2" fontWeight={700} color="success.main">+${ganancia.toFixed(0)}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Tasa anual</Typography>
                          <Typography variant="body2" fontWeight={700}>{(tasaAnual * 100).toFixed(1)}%</Typography>
                        </Box>
                      </Stack>
                      <Chip
                        size="small"
                        label={supera ? `✅ Supera la inflación (${(inflacion * 100).toFixed(1)}%)` : `⚠️ No supera la inflación (${(inflacion * 100).toFixed(1)}%)`}
                        color={supera ? 'success' : 'warning'}
                        sx={{ mt: 1 }}
                      />
                    </Paper>
                    <Button
                      fullWidth
                      variant="contained"
                      color="info"
                      size="large"
                      onClick={() => void handleGuardar()}
                      disabled={guardado}
                    >
                      {guardado ? '✅ Plan guardado — lección completada' : 'Guardar mi plan de inversión'}
                    </Button>
                    {guardado && (
                      <Fade in>
                        <FinniMessage
                          variant="success"
                          title="¡Plan de inversión guardado!"
                          message="Tu plan se usará en la Lección 14 (evaluación) y en el reto final de la Lección 15."
                        />
                      </Fade>
                    )}
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
