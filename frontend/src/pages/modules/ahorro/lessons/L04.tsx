import { useState } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade, Chip,
} from '@mui/material';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

type CardType = 'aliado' | 'saboteador';
type Classification = 'aliado' | 'saboteador' | null;

const CARDS: { id: string; label: string; correct: CardType; tip: string }[] = [
  { id: 'c1', label: 'Transferencia automatica el dia de cobro', correct: 'aliado', tip: 'Si lo haces manual, es mas probable que lo pospongas.' },
  { id: 'c2', label: 'Meta clara y visible (foto en pantalla de bloqueo)', correct: 'aliado', tip: 'Una imagen concreta activa la motivacion de continuar.' },
  { id: 'c3', label: 'Notificaciones de progreso de ahorro', correct: 'aliado', tip: 'Ver que llevas $500 de $2,000 activa la motivacion.' },
  { id: 'c4', label: 'Amigos con cultura de ahorro', correct: 'aliado', tip: 'El entorno social influye mas de lo que creemos.' },
  { id: 'c5', label: 'Cuenta de ahorro separada de la del gasto diario', correct: 'aliado', tip: 'Lo que no ves facilmente, no lo gastas.' },
  { id: 'c6', label: 'Notificaciones de ofertas y compras en linea', correct: 'saboteador', tip: 'Activan el gasto impulsivo. Desactivarlas ayuda mucho.' },
  { id: 'c7', label: 'Amigos que siempre proponen planes costosos', correct: 'saboteador', tip: 'La presion social puede boicotear el mejor plan.' },
  { id: 'c8', label: 'No tener una meta concreta ("ahorro para algo algun dia")', correct: 'saboteador', tip: 'El ahorro sin nombre no dura. Necesita proposito.' },
  { id: 'c9', label: 'Mezclar el ahorro con el dinero del gasto cotidiano', correct: 'saboteador', tip: 'El dinero mezclado siempre termina en gasto.' },
  { id: 'c10', label: 'Revisar el saldo del ahorro muy seguido', correct: 'saboteador', tip: 'La tentacion de tocarlo aumenta cada vez que lo ves.' },
];

const ACCIONES: Record<string, string> = {
  c6: 'Desactiva las notificaciones de apps de compra en tu celular hoy.',
  c7: 'Propone al menos una alternativa economica cuando salgas con amigos.',
  c8: 'Completa la Leccion 5 hoy para darle nombre a tu meta.',
  c9: 'Abre una cuenta separada exclusiva para ahorro esta semana.',
  c10: 'Revisa tu saldo de ahorro solo una vez por semana.',
};

export default function L04() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Classification>>({});
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});
  const [saboteadoresCheck, setSaboteadoresCheck] = useState<Set<string>>(new Set());
  const [aliadoElegido, setAliadoElegido] = useState('');

  const answered = Object.values(answers).filter(Boolean).length;
  const allClassified = answered === CARDS.length;

  const aliadosCards = CARDS.filter((c) => c.correct === 'aliado');

  const classify = (id: string, val: Classification) => {
    if (answers[id]) return;
    setAnswers((prev) => ({ ...prev, [id]: val }));
    setShowFeedback((prev) => ({ ...prev, [id]: true }));
  };

  const toggleSaboteador = (id: string) => {
    setSaboteadoresCheck((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const mySaboteadores = Array.from(saboteadoresCheck)
    .filter((id) => ACCIONES[id]);

  const canComplete = allClassified && aliadoElegido.trim().length > 0;

  const handleSave = async () => {
    await lessonDataRepository.save('ahorro', 'l4_aliados', {
      aliadoElegido,
      saboteadores: Array.from(saboteadoresCheck),
      savedAt: new Date().toISOString(),
    });
    setStep(3);
  };

  const progress = step === 0 ? 0 : step === 1 ? 33 : step === 2 ? 66 : 100;

  return (
    <LessonShell
      id="L04"
      title="Aliados y saboteadores del ahorro"
      completion={{ ready: canComplete }}
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
                title="Ahorrar es una decision de comportamiento"
                message="Hay cosas en tu vida que te ayudan a ahorrar… y otras que trabajan en tu contra sin que lo notes."
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'success.main' }}>
                <Typography variant="body2">
                  En esta leccion vas a clasificar 10 tarjetas: <b>aliados</b> (te ayudan) vs <b>saboteadores</b> (te boicotean).
                  Luego veras cuales tienes en tu vida.
                </Typography>
              </FECard>
              <Button fullWidth variant="contained" color="success" size="large" onClick={() => setStep(1)}>
                Clasificar las 10 tarjetas →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 1 — 10 tarjetas para clasificar */}
        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body1" fontWeight={700}>Clasifica cada tarjeta:</Typography>
                <Chip label={`${answered}/${CARDS.length}`} color="success" size="small" />
              </Stack>
              <LinearProgress
                variant="determinate"
                value={(answered / CARDS.length) * 100}
                color="success"
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Stack spacing={2}>
                {CARDS.map((c) => {
                  const ans = answers[c.id];
                  const isCorrect = ans === c.correct;
                  return (
                    <FECard
                      key={c.id}
                      variant="flat"
                      sx={{
                        border: 1,
                        borderColor: ans ? (isCorrect ? 'success.main' : 'error.main') : 'divider',
                        bgcolor: ans ? (isCorrect ? 'success.light' : 'error.light') : 'background.paper',
                      }}
                    >
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                        {c.label}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant={ans === 'aliado' ? 'contained' : 'outlined'}
                          color="success"
                          onClick={() => classify(c.id, 'aliado')}
                          disabled={!!ans}
                          sx={{ textTransform: 'none' }}
                        >
                          ✅ Aliado
                        </Button>
                        <Button
                          size="small"
                          variant={ans === 'saboteador' ? 'contained' : 'outlined'}
                          color="error"
                          onClick={() => classify(c.id, 'saboteador')}
                          disabled={!!ans}
                          sx={{ textTransform: 'none' }}
                        >
                          ❌ Saboteador
                        </Button>
                      </Stack>
                      {showFeedback[c.id] && (
                        <Fade in>
                          <Typography
                            variant="caption"
                            sx={{ display: 'block', mt: 0.75, color: isCorrect ? 'success.dark' : 'error.dark' }}
                          >
                            {isCorrect ? '✅ Correcto. ' : `❌ Es un ${c.correct}. `}{c.tip}
                          </Typography>
                        </Fade>
                      )}
                    </FECard>
                  );
                })}
              </Stack>
              {allClassified && (
                <Fade in>
                  <Button fullWidth variant="contained" color="success" size="large" onClick={() => setStep(2)}>
                    Mi autoevaluacion →
                  </Button>
                </Fade>
              )}
            </Stack>
          </Fade>
        )}

        {/* Pantalla 2 — Autoevaluacion + compromiso */}
        {step === 2 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="body1" fontWeight={700}>
                ¿Cuales saboteadores tienes en tu vida ahora?
              </Typography>
              <Stack spacing={1}>
                {CARDS.filter((c) => c.correct === 'saboteador').map((c) => (
                  <FECard
                    key={c.id}
                    variant="flat"
                    sx={{
                      border: 1,
                      borderColor: saboteadoresCheck.has(c.id) ? 'error.main' : 'divider',
                      bgcolor: saboteadoresCheck.has(c.id) ? 'error.light' : 'background.paper',
                      cursor: 'pointer',
                    }}
                    onClick={() => toggleSaboteador(c.id)}
                    role="checkbox"
                    tabIndex={0}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2">
                        {saboteadoresCheck.has(c.id) ? '☑' : '☐'} {c.label}
                      </Typography>
                    </Stack>
                  </FECard>
                ))}
              </Stack>

              {mySaboteadores.length > 0 && (
                <Fade in>
                  <FECard variant="flat" sx={{ border: 1, borderColor: 'warning.main', bgcolor: 'warning.light' }}>
                    <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                      Plan de accion de Finni:
                    </Typography>
                    <Stack spacing={0.75}>
                      {mySaboteadores.map((id) => (
                        <Typography key={id} variant="body2">
                          → {ACCIONES[id]}
                        </Typography>
                      ))}
                    </Stack>
                  </FECard>
                </Fade>
              )}

              <Typography variant="body1" fontWeight={700} sx={{ mt: 1 }}>
                Elige 1 aliado que vas a activar esta semana:
              </Typography>
              <Stack spacing={1}>
                {aliadosCards.map((c) => (
                  <Button
                    key={c.id}
                    variant={aliadoElegido === c.id ? 'contained' : 'outlined'}
                    color="success"
                    onClick={() => setAliadoElegido(c.id)}
                    sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                  >
                    {c.label}
                  </Button>
                ))}
              </Stack>

              {aliadoElegido && (
                <Fade in>
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    size="large"
                    onClick={() => void handleSave()}
                  >
                    Guardar mi compromiso →
                  </Button>
                </Fade>
              )}
            </Stack>
          </Fade>
        )}

        {/* Pantalla 3 — Cierre */}
        {step === 3 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="success"
                title="Tu perfil de ahorrador esta guardado"
                message="Conoces tus aliados y tus saboteadores. Eso ya es una ventaja enorme sobre quien ni siquiera los identifica."
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'success.main', bgcolor: 'success.light' }}>
                <Typography variant="body2" fontWeight={700}>Tu aliado esta semana:</Typography>
                <Typography variant="body2">
                  {aliadosCards.find((c) => c.id === aliadoElegido)?.label ?? aliadoElegido}
                </Typography>
              </FECard>
            </Stack>
          </Fade>
        )}
      </Box>
    </LessonShell>
  );
}
