import { useState } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade,
  Chip, Paper, TextField,
} from '@mui/material';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

const PLATAFORMAS = [
  { nombre: 'GBM+', minimo: '$200', tipo: 'Acciones + fondos', regulada: true },
  { nombre: 'Kuspit', minimo: '$500', tipo: 'Acciones + fondos', regulada: true },
  { nombre: 'Bursanet', minimo: '$200', tipo: 'Acciones + fondos', regulada: true },
  { nombre: 'Flink', minimo: '$1', tipo: 'Micro-inversión', regulada: true },
  { nombre: 'Nu Inversiones', minimo: '$1', tipo: 'Fondos', regulada: true },
];

const QUIZ = [
  {
    pregunta: '¿Qué es un fondo de inversión?',
    opciones: ['Una cuenta de ahorro bancaria', 'Un grupo de personas que invierten colectivamente', 'Un préstamo al banco'],
    correcta: 1,
  },
  {
    pregunta: '¿Qué pasa si la empresa en cuya acción invertiste tiene problemas?',
    opciones: ['Recibes el dinero garantizado', 'El valor de tu acción puede bajar', 'El gobierno te protege'],
    correcta: 1,
  },
  {
    pregunta: '¿Cuál es el organismo que regula los fondos en México?',
    opciones: ['SAT', 'CNBV', 'IMSS'],
    correcta: 1,
  },
  {
    pregunta: '¿Los fondos balanceados mezclan deuda y acciones?',
    opciones: ['Falso', 'Verdadero'],
    correcta: 1,
  },
  {
    pregunta: '¿Desde cuánto puedes invertir en BMV con plataformas fintech?',
    opciones: ['$10,000', '$5,000', '$200-$500'],
    correcta: 2,
  },
];

export default function L07() {
  const [step, setStep] = useState(0);
  const [audioLeido, setAudioLeido] = useState(false);
  const [pausaRespuesta, setPausaRespuesta] = useState('');
  const [respuestas, setRespuestas] = useState<(number | null)[]>(Array(5).fill(null));
  const [plataformasInteres, setPlataformasInteres] = useState<string[]>([]);
  const [guardado, setGuardado] = useState(false);

  const aciertos = respuestas.filter((r, i) => r === QUIZ[i]!.correcta).length;
  const quizCompleto = respuestas.every((r) => r !== null);
  const score = quizCompleto ? aciertos / 5 : 0;

  const togglePlataforma = (nombre: string) => {
    setPlataformasInteres((prev) =>
      prev.includes(nombre) ? prev.filter((p) => p !== nombre) : [...prev, nombre]
    );
  };

  const handleGuardar = async () => {
    await lessonDataRepository.save('inversion', 'l07_plataformas', { plataformas: plataformasInteres });
    setGuardado(true);
  };

  return (
    <LessonShell
      id="L07"
      title="Fondos de inversión y Bolsa: cuando muchos invierten juntos"
      completion={{ ready: quizCompleto && guardado, score }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={(step / 2) * 100}
          color="info"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {/* Pantalla 0 — Explicación + pausa interactiva */}
        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="coach"
                title="¿Quieres invertir en muchas empresas a la vez?"
                message="Los fondos de inversión hacen eso por ti. Hoy entendemos cómo funcionan los fondos y la bolsa."
              />
              <FECard variant="flat" sx={{ bgcolor: 'warning.light', border: 1, borderColor: 'warning.main' }}>
                <Typography fontWeight={800} sx={{ mb: 1 }}>Fondos de Inversión — La olla común 🍲</Typography>
                <Stack spacing={1.5}>
                  <Typography variant="body2">
                    Imagina que tú y 999 personas más juntan $1,000 cada uno. Ahora tienen $1 millón para invertir.
                    Un gestor profesional decide dónde y cómo. Las ganancias (y pérdidas) se distribuyen proporcionalmente.
                  </Typography>
                  <Typography variant="body2">
                    Los fondos pueden invertir en <b>deuda</b> (más seguros), en <b>acciones</b> (más riesgo y potencial),
                    o una mezcla de ambos (<b>balanceados</b>).
                  </Typography>
                  <Typography variant="body2">
                    En México, los fondos regulados por la CNBV son accesibles desde $1,000-$5,000. Algunos desde $100 con plataformas fintech.
                  </Typography>
                </Stack>
              </FECard>

              {/* Pausa interactiva */}
              {!audioLeido ? (
                <Stack spacing={2}>
                  <FECard variant="flat" sx={{ border: 1, borderColor: 'info.main', bgcolor: 'info.light' }}>
                    <Typography fontWeight={700} sx={{ mb: 1 }}>⏸ Pausa interactiva</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      ¿Qué te parece más atractivo hasta ahora: fondos o acciones? ¿Por qué?
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      size="small"
                      placeholder="Escribe tu reflexión..."
                      value={pausaRespuesta}
                      onChange={(e) => setPausaRespuesta(e.target.value)}
                    />
                  </FECard>
                  {pausaRespuesta.trim().length >= 5 && (
                    <Fade in>
                      <Button fullWidth variant="outlined" color="info" onClick={() => setAudioLeido(true)}>
                        Continuar con la BMV →
                      </Button>
                    </Fade>
                  )}
                </Stack>
              ) : (
                <Fade in>
                  <Stack spacing={3}>
                    <FECard variant="flat" sx={{ bgcolor: 'success.light', border: 1, borderColor: 'success.main' }}>
                      <Typography fontWeight={800} sx={{ mb: 1 }}>La Bolsa Mexicana de Valores (BMV) 📊</Typography>
                      <Stack spacing={1.5}>
                        <Typography variant="body2">
                          La BMV es el mercado donde se compran y venden acciones de empresas mexicanas.
                          Cuando compras una acción, eres propietario de una pequeña parte de esa empresa.
                        </Typography>
                        <Typography variant="body2">
                          Si la empresa crece y genera utilidades, el valor de tu acción sube. Si tiene problemas, baja.
                          A diferencia de los CETES, <b>no hay rendimiento garantizado</b>.
                        </Typography>
                        <Typography variant="body2">
                          Puedes invertir en acciones de la BMV desde plataformas como GBM+, Kuspit o Bursanet desde $200-$500 pesos.
                        </Typography>
                      </Stack>
                    </FECard>

                    <Paper sx={{ p: 2, borderRadius: 3 }}>
                      <Typography fontWeight={700} sx={{ mb: 1 }}>Fondos vs Acciones individuales</Typography>
                      <Stack spacing={0.5}>
                        {[
                          { aspecto: 'Gestión', fondos: 'Profesional (gestor)', acciones: 'Tú decides' },
                          { aspecto: 'Diversificación', fondos: 'Automática', acciones: 'Manual' },
                          { aspecto: 'Monto mínimo', fondos: '$100-$5,000', acciones: '~$200' },
                          { aspecto: 'Comisiones', fondos: '1-2% anual', acciones: 'Por operación' },
                        ].map((row) => (
                          <Stack key={row.aspecto} direction="row" sx={{ py: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="caption" fontWeight={700} sx={{ width: '35%' }}>{row.aspecto}</Typography>
                            <Typography variant="caption" sx={{ width: '32.5%' }} color="warning.dark">{row.fondos}</Typography>
                            <Typography variant="caption" sx={{ width: '32.5%' }} color="success.dark">{row.acciones}</Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Paper>
                    <Button fullWidth variant="contained" color="info" size="large" onClick={() => setStep(1)}>
                      Quiz y plataformas →
                    </Button>
                  </Stack>
                </Fade>
              )}
            </Stack>
          </Fade>
        )}

        {/* Pantalla 1 — Quiz + plataformas */}
        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="h4" fontWeight={700}>Quiz de comprensión</Typography>
              <Stack spacing={2}>
                {QUIZ.map((q, qi) => {
                  const resp = respuestas[qi];
                  const respondido = resp !== null;
                  const correcto = resp === q.correcta;
                  return (
                    <FECard key={qi} variant="flat" sx={{ border: 1, borderColor: respondido ? (correcto ? 'success.main' : 'error.main') : 'divider' }}>
                      <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                        {qi + 1}. {q.pregunta}
                      </Typography>
                      <Stack spacing={1}>
                        {q.opciones.map((op, oi) => (
                          <Button
                            key={oi}
                            size="small"
                            variant={resp === oi ? 'contained' : 'outlined'}
                            color={respondido ? (oi === q.correcta ? 'success' : resp === oi ? 'error' : 'inherit') : 'warning'}
                            onClick={() => { if (!respondido) setRespuestas((prev) => prev.map((r, i) => i === qi ? oi : r)); }}
                            sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                          >
                            {op}
                          </Button>
                        ))}
                      </Stack>
                      {respondido && (
                        <Typography variant="caption" color={correcto ? 'success.main' : 'error.main'} sx={{ mt: 0.5, display: 'block' }}>
                          {correcto ? '✓ Correcto' : `✗ La respuesta correcta era: "${q.opciones[q.correcta]}"`}
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
                      <Typography fontWeight={800}>{aciertos}/5 correctas</Typography>
                    </FECard>
                    <Typography variant="h5" fontWeight={700}>Plataformas autorizadas por CNBV</Typography>
                    <Typography variant="body2" color="text.secondary">Marca las que te generan interés:</Typography>
                    <Stack spacing={1.5}>
                      {PLATAFORMAS.map((p) => (
                        <Paper
                          key={p.nombre}
                          onClick={() => togglePlataforma(p.nombre)}
                          sx={{
                            p: 2, borderRadius: 2, cursor: 'pointer',
                            border: 2, borderColor: plataformasInteres.includes(p.nombre) ? 'warning.main' : 'divider',
                            bgcolor: plataformasInteres.includes(p.nombre) ? 'warning.light' : 'grey.50',
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography fontWeight={700}>{p.nombre}</Typography>
                              <Typography variant="caption">{p.tipo} · Desde {p.minimo}</Typography>
                            </Box>
                            <Stack direction="row" spacing={1}>
                              <Chip size="small" label="CNBV ✓" color="success" />
                              {plataformasInteres.includes(p.nombre) && <Chip size="small" label="★ Interés" color="info" />}
                            </Stack>
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                    <FinniMessage
                      variant="coach"
                      title="Fondos y bolsa son para plazos medianos-largos"
                      message="La clave es entender en qué estás entrando antes de hacerlo. ¡Ya lo entiendes!"
                    />
                    <Button
                      fullWidth
                      variant="contained"
                      color="info"
                      size="large"
                      onClick={() => void handleGuardar()}
                      disabled={guardado}
                    >
                      {guardado ? '✅ Intereses guardados — lección completada' : 'Guardar mis plataformas de interés'}
                    </Button>
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
