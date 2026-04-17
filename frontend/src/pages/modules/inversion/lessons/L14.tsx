import { useEffect, useState } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade,
  Chip, Paper,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

type Semaforo = 'verde' | 'amarillo' | 'rojo';

interface Indicador {
  nombre: string;
  estado: Semaforo;
  comentario: string;
  accion?: string;
}

function evalIndicadores(data: {
  fondoEmergencias: boolean;
  perfilCoherente: boolean;
  lecccionInstrumentoCompleta: boolean;
  plazoRealista: boolean;
  comisionesIdentificadas: boolean;
}): Indicador[] {
  return [
    {
      nombre: 'Fondo de emergencias activo',
      estado: data.fondoEmergencias ? 'verde' : 'rojo',
      comentario: data.fondoEmergencias
        ? 'Tu fondo de emergencias está cubierto. Excelente base.'
        : 'Sin fondo de emergencias, una crisis puede obligarte a retirar tu inversión en el peor momento.',
      accion: data.fondoEmergencias ? undefined : 'Completa el Módulo 2, Lección 8 — Fondo de Emergencias.',
    },
    {
      nombre: 'Perfil de riesgo coherente con el instrumento',
      estado: data.perfilCoherente ? 'verde' : 'amarillo',
      comentario: data.perfilCoherente
        ? 'El instrumento elegido es compatible con tu perfil de riesgo.'
        : 'El instrumento puede no ser ideal para tu perfil. Considera ajustarlo.',
      accion: data.perfilCoherente ? undefined : 'Revisa la Lección 8 y ajusta tu instrumento en L13.',
    },
    {
      nombre: 'Comprensión del instrumento elegido',
      estado: data.lecccionInstrumentoCompleta ? 'verde' : 'amarillo',
      comentario: data.lecccionInstrumentoCompleta
        ? 'Completaste las lecciones sobre el instrumento elegido. Sabes en qué inviertes.'
        : 'Asegúrate de haber visto las lecciones sobre tu instrumento (L6 para CETES, L7 para fondos/acciones).',
    },
    {
      nombre: 'Plazo realista para alcanzar el objetivo',
      estado: data.plazoRealista ? 'verde' : 'amarillo',
      comentario: data.plazoRealista
        ? 'El plazo de tu plan permite alcanzar tu objetivo con los montos definidos.'
        : 'El plazo puede ser muy corto para el monto objetivo. Considera aumentar la aportación o extender el plazo.',
    },
    {
      nombre: 'Comisiones e impuestos identificados',
      estado: data.comisionesIdentificadas ? 'verde' : 'amarillo',
      comentario: data.comisionesIdentificadas
        ? 'Ya sabes el impacto de comisiones e ISR. Tus cálculos son realistas.'
        : 'Revisa la Lección 11 para entender el impacto real de las comisiones en tu rendimiento.',
    },
  ];
}

function semColorMUI(s: Semaforo) {
  return s === 'verde' ? 'success' : s === 'amarillo' ? 'warning' : 'error';
}

function SemIcon({ estado }: { estado: Semaforo }) {
  if (estado === 'verde') return <CheckCircleIcon color="success" />;
  if (estado === 'amarillo') return <WarningIcon color="info" />;
  return <ErrorIcon color="error" />;
}

export default function L14() {
  const [step, setStep] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [indicadorExpandido, setIndicadorExpandido] = useState<number | null>(null);
  const [vistos, setVistos] = useState(false);

  useEffect(() => {
    const load = async () => {
      const perfil = await lessonDataRepository.load<{ perfil: string; respuestas?: number[] }>('inversion', 'l08_perfil_riesgo');
      const plan = await lessonDataRepository.load<{ instrumento?: string; plazoMeses?: number; capitalInicial?: number; aportacionMensual?: number; proyeccion?: number }>('inversion', 'l13_plan');
      const emergencias = await lessonDataRepository.load<{ montoMeta?: number; completado?: boolean }>('ahorro', 'l08_fondo_emergencias');

      const tieneFondo = !!(emergencias?.completado || emergencias?.montoMeta);
      const tienePerfil = !!(perfil?.perfil);
      const tieneInstrumento = !!(plan?.instrumento);
      const tienePlan = !!(plan?.plazoMeses);

      // Coherencia perfil-instrumento
      const instrumento = plan?.instrumento ?? '';
      const perfilUsuario = perfil?.perfil ?? '';
      const conservadoresInst = ['CETES', 'deuda', 'gubernamental'];
      const agresivosInst = ['Acciones', 'variable', 'ETF'];
      const isConservadorInst = conservadoresInst.some((k) => instrumento.toLowerCase().includes(k.toLowerCase()));
      const isAgresivosInst = agresivosInst.some((k) => instrumento.toLowerCase().includes(k.toLowerCase()));
      const coherente =
        !tienePerfil ||
        !tieneInstrumento ||
        (perfilUsuario === 'conservador' && isConservadorInst) ||
        (perfilUsuario === 'agresivo' && isAgresivosInst) ||
        perfilUsuario === 'moderado';

      // Plazo realista
      const meses = plan?.plazoMeses ?? 12;
      const plazoRealista = meses >= 12 || (meses >= 6 && (plan?.capitalInicial ?? 0) > 500);

      const evaluated = evalIndicadores({
        fondoEmergencias: tieneFondo,
        perfilCoherente: coherente,
        lecccionInstrumentoCompleta: tienePlan,
        plazoRealista,
        comisionesIdentificadas: true, // L11 debe haberse completado para llegar aquí
      });
      setIndicadores(evaluated);
      setCargando(false);
    };
    void load();
  }, []);

  const verdes = indicadores.filter((i) => i.estado === 'verde').length;
  const resultado: 'verde' | 'amarillo' | 'rojo' = verdes === 5 ? 'verde' : verdes >= 3 ? 'amarillo' : 'rojo';

  const mensajeFinni = () => {
    if (resultado === 'verde') return { titulo: '¡Luz verde! Estás listo para invertir', mensaje: 'Todos los indicadores positivos. Tu primer paso concreto: abre tu cuenta en cetesdirecto.com o la plataforma elegida y haz tu primera compra.' };
    if (resultado === 'amarillo') return { titulo: 'Casi listo — unos ajustes finales', mensaje: 'Tienes buenas bases. Revisa los indicadores en amarillo y toma las acciones sugeridas. No tienes que ser perfecto para empezar.' };
    return { titulo: 'Aún no — pero el camino está claro', mensaje: 'No es "nunca", es "todavía no, y aquí está el camino". Trabaja en los indicadores rojos y regresa. El hecho de que estés aquí ya te pone adelante.' };
  };

  const fm = mensajeFinni();

  return (
    <LessonShell
      id="L14"
      title="Finni evalúa tu plan: ¿estás listo para invertir?"
      completion={{ ready: vistos }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={vistos ? 100 : cargando ? 30 : 70}
          color="info"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {/* Pantalla 0 — Apertura */}
        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="coach"
                title="¡Tu plan de inversión está listo!"
                message="Ahora déjame revisarlo con honestidad. No para desanimarte — para asegurarme de que estás tomando una decisión informada."
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography fontWeight={700} sx={{ mb: 1 }}>Voy a revisar 5 indicadores:</Typography>
                {[
                  '1. ¿Tienes fondo de emergencias activo?',
                  '2. ¿El instrumento es coherente con tu perfil?',
                  '3. ¿Entiendes el instrumento que elegiste?',
                  '4. ¿El plazo es realista para tu objetivo?',
                  '5. ¿Conoces las comisiones e impuestos?',
                ].map((p) => (
                  <Typography key={p} variant="body2" sx={{ py: 0.4 }}>🔍 {p}</Typography>
                ))}
              </FECard>
              <Button fullWidth variant="contained" color="info" size="large" onClick={() => setStep(1)}>
                Iniciar análisis →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 1 — Los 5 indicadores */}
        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              {cargando ? (
                <FECard variant="flat" sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h3">🔍</Typography>
                  <Typography fontWeight={700} sx={{ mt: 1 }}>Analizando tu plan...</Typography>
                  <LinearProgress color="info" sx={{ mt: 2 }} />
                </FECard>
              ) : (
                <>
                  <Stack direction="row" justifyContent="center" spacing={1} sx={{ mb: 1 }}>
                    <Chip
                      label={`${verdes}/5 indicadores positivos`}
                      color={resultado === 'verde' ? 'success' : resultado === 'amarillo' ? 'warning' : 'error'}
                      icon={verdes === 5 ? <CheckCircleIcon /> : <WarningIcon />}
                    />
                  </Stack>
                  <Stack spacing={1.5}>
                    {indicadores.map((ind, i) => (
                      <Paper
                        key={ind.nombre}
                        onClick={() => setIndicadorExpandido(indicadorExpandido === i ? null : i)}
                        sx={{
                          p: 2, borderRadius: 3, cursor: 'pointer',
                          border: 2, borderColor: `${semColorMUI(ind.estado)}.main`,
                          bgcolor: indicadorExpandido === i ? `${semColorMUI(ind.estado)}.light` : 'background.paper',
                        }}
                      >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <SemIcon estado={ind.estado} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={700}>{ind.nombre}</Typography>
                          </Box>
                          <Chip size="small" label={ind.estado.toUpperCase()} color={semColorMUI(ind.estado)} />
                        </Stack>
                        {indicadorExpandido === i && (
                          <Fade in>
                            <Box sx={{ mt: 1.5 }}>
                              <Typography variant="body2">{ind.comentario}</Typography>
                              {ind.accion && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                  👉 {ind.accion}
                                </Typography>
                              )}
                            </Box>
                          </Fade>
                        )}
                      </Paper>
                    ))}
                  </Stack>
                  <Paper
                    sx={{
                      p: 2, borderRadius: 3,
                      bgcolor: resultado === 'verde' ? 'success.light' : resultado === 'amarillo' ? 'warning.light' : 'error.light',
                      border: 2,
                      borderColor: resultado === 'verde' ? 'success.main' : resultado === 'amarillo' ? 'warning.main' : 'error.main',
                    }}
                  >
                    <Typography fontWeight={800}>{resultado === 'verde' ? '🟢' : resultado === 'amarillo' ? '🟡' : '🔴'} {fm.titulo}</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>{fm.mensaje}</Typography>
                  </Paper>
                  <FinniMessage
                    variant="coach"
                    title="El hecho de que estés aquí ya te pone adelante"
                    message="El hecho de que hayas construido tu plan ya te pone adelante de la mayoría. El siguiente paso es tuyo."
                  />
                  {!vistos ? (
                    <Button fullWidth variant="contained" color="info" size="large" onClick={() => setVistos(true)}>
                      ✅ Completar lección — avanzar al reto final
                    </Button>
                  ) : (
                    <Fade in>
                      <FECard variant="flat" sx={{ bgcolor: 'success.light', border: 2, borderColor: 'success.main', textAlign: 'center' }}>
                        <Typography variant="h3">🏁</Typography>
                        <Typography fontWeight={800}>¡Un paso más y completarás FinEmpoder!</Typography>
                        <Typography variant="body2">La Lección 15 te espera — el reto final de todo el programa.</Typography>
                      </FECard>
                    </Fade>
                  )}
                </>
              )}
            </Stack>
          </Fade>
        )}
      </Box>
    </LessonShell>
  );
}
