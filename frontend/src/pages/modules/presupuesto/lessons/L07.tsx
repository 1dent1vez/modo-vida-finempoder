import { useState } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade,
} from '@mui/material';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';

type Opcion = { id: string; label: string; consecuencia: string; score: number };

const ESCENARIOS: {
  id: string;
  situacion: string;
  contexto: string;
  opciones: Opcion[];
}[] = [
  {
    id: 'A',
    situacion: 'Se acabó el pase del metro ($300)',
    contexto: 'Tienes $320 y faltan 12 días para tu próxima mesada.',
    opciones: [
      { id: 'a1', label: 'Cancelar cena con amigos del viernes', consecuencia: 'Ahorraste $300. Te quedaste sin salida del viernes.', score: 70 },
      { id: 'a2', label: 'Pausar streaming este mes', consecuencia: 'Ahorraste $99. Aún necesitas $201 más.', score: 50 },
      { id: 'a3', label: 'No comprar ropa nueva que tenías planeada', consecuencia: 'Ahorraste $300. Solución sin sacrificar necesidades. ✅', score: 100 },
    ],
  },
  {
    id: 'B',
    situacion: 'Examen sorpresa: necesitas imprimir urgente ($80)',
    contexto: 'Tienes $320 disponibles. El examen es mañana.',
    opciones: [
      { id: 'b1', label: 'Pedir prestado a un amigo', consecuencia: 'Resuelves el problema hoy. Recuerda pagar después.', score: 70 },
      { id: 'b2', label: 'Usar parte del presupuesto de comida', consecuencia: 'Pagas las impresiones pero comerás más sencillo esta semana.', score: 80 },
      { id: 'b3', label: 'Cancelar suscripción mensual del momento', consecuencia: 'Tienes $99 disponibles de inmediato. Cubre el gasto. ✅', score: 100 },
    ],
  },
  {
    id: 'C',
    situacion: 'Concierto de tu artista favorito ($350)',
    contexto: 'Tienes solo $320 en el banco. El boleto vence mañana.',
    opciones: [
      { id: 'c1', label: 'Ir: pides $30 prestados y vas', consecuencia: 'Disfrutas el concierto pero quedas en $0 y con deuda.', score: 40 },
      { id: 'c2', label: 'No ir: guardas tu dinero para necesidades', consecuencia: 'Tomas una decisión financieramente sana. Te pierdes el concierto.', score: 90 },
      { id: 'c3', label: 'Buscar si hay boletos más baratos o reventa', consecuencia: 'Explorar opciones es siempre válido antes de decidir. ✅', score: 100 },
    ],
  },
];

export default function L07() {
  const [step, setStep] = useState(0);
  const [escenarioIdx, setEscenarioIdx] = useState(0);
  const [decisions, setDecisions] = useState<Record<string, Opcion>>({});
  const [showConsequence, setShowConsequence] = useState(false);

  const allDone = Object.keys(decisions).length === ESCENARIOS.length;
  const avgScore = allDone
    ? Math.round(Object.values(decisions).reduce((a, d) => a + d.score, 0) / ESCENARIOS.length)
    : 0;

  const currentEscenario = ESCENARIOS[escenarioIdx];
  const currentDecision = currentEscenario ? decisions[currentEscenario.id] : null;

  const choose = (opcion: Opcion) => {
    if (!currentEscenario || decisions[currentEscenario.id]) return;
    setDecisions((prev) => ({ ...prev, [currentEscenario.id]: opcion }));
    setShowConsequence(true);
  };

  const nextScenario = () => {
    setShowConsequence(false);
    if (escenarioIdx < ESCENARIOS.length - 1) {
      setEscenarioIdx((i) => i + 1);
    } else {
      setStep(2);
    }
  };

  return (
    <LessonShell
      id="L07"
      title="Priorizar o morir: ajusta tu presupuesto en crisis"
      completion={{ ready: allDone, score: avgScore }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={step === 0 ? 0 : step === 1 ? ((escenarioIdx + (currentDecision ? 1 : 0)) / ESCENARIOS.length) * 80 : 100}
          color="warning"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FECard variant="flat" sx={{ bgcolor: 'warning.light', border: 2, borderColor: 'warning.main', textAlign: 'center', py: 2 }}>
                <Typography variant="body1" fontWeight={700}>💬 Mensaje bancario</Typography>
                <Typography variant="h4" sx={{ mt: 1 }}>Saldo disponible: $320</Typography>
                <Typography variant="body2" color="text.secondary">Faltan 12 días para tu próxima mesada.</Typography>
              </FECard>
              <FinniMessage
                variant="coach"
                title="Tiempo de decidir"
                message="Este mes pasó algo inesperado y el dinero no alcanzó. Ahora tienes que decidir. ¿Cómo priorizas?"
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography variant="body1" fontWeight={700} sx={{ mb: 1 }}>Matriz de priorización:</Typography>
                <Stack direction="row" spacing={1}>
                  <FECard variant="flat" sx={{ flex: 1, bgcolor: 'error.light', textAlign: 'center' }}>
                    <Typography variant="caption" fontWeight={700}>⚡ Urgente + Necesario</Typography>
                    <Typography variant="caption" display="block">→ Actúa ya</Typography>
                  </FECard>
                  <FECard variant="flat" sx={{ flex: 1, bgcolor: 'warning.light', textAlign: 'center' }}>
                    <Typography variant="caption" fontWeight={700}>📅 Necesario + No urgente</Typography>
                    <Typography variant="caption" display="block">→ Planifica</Typography>
                  </FECard>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <FECard variant="flat" sx={{ flex: 1, bgcolor: 'info.light', textAlign: 'center' }}>
                    <Typography variant="caption" fontWeight={700}>⚡ Urgente + Prescindible</Typography>
                    <Typography variant="caption" display="block">→ Delega o pospón</Typography>
                  </FECard>
                  <FECard variant="flat" sx={{ flex: 1, bgcolor: 'success.light', textAlign: 'center' }}>
                    <Typography variant="caption" fontWeight={700}>✂️ Prescindible + No urgente</Typography>
                    <Typography variant="caption" display="block">→ Elimina</Typography>
                  </FECard>
                </Stack>
              </FECard>
              <Button fullWidth variant="contained" color="warning" size="large" onClick={() => setStep(1)}>
                ¡A los escenarios! →
              </Button>
            </Stack>
          </Fade>
        )}

        {step === 1 && currentEscenario && (
          <Fade in key={currentEscenario.id}>
            <Stack spacing={3}>
              <FECard variant="flat" sx={{ bgcolor: 'error.light', border: 2, borderColor: 'error.main' }}>
                <Typography variant="body2" color="text.secondary">Escenario {currentEscenario.id}</Typography>
                <Typography variant="h4">{currentEscenario.situacion}</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>{currentEscenario.contexto}</Typography>
              </FECard>

              {!currentDecision && (
                <Stack spacing={2}>
                  {currentEscenario.opciones.map((op) => (
                    <Button
                      key={op.id}
                      fullWidth
                      variant="outlined"
                      color="warning"
                      onClick={() => choose(op)}
                      sx={{ textAlign: 'left', justifyContent: 'flex-start', textTransform: 'none', py: 1.5 }}
                    >
                      {op.label}
                    </Button>
                  ))}
                </Stack>
              )}

              {currentDecision && showConsequence && (
                <Fade in>
                  <Stack spacing={2}>
                    <FECard variant="flat" sx={{ bgcolor: currentDecision.score >= 90 ? 'success.light' : currentDecision.score >= 70 ? 'warning.light' : 'info.light', border: 1, borderColor: 'divider' }}>
                      <Typography variant="body2" fontWeight={700}>Tu decisión:</Typography>
                      <Typography variant="body2">{currentDecision.label}</Typography>
                      <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>{currentDecision.consecuencia}</Typography>
                    </FECard>
                    <FinniMessage
                      variant="coach"
                      title="Finni valida"
                      message={
                        currentDecision.score >= 90
                          ? 'Excelente decisión financiera. Priorizaste sin sacrificar necesidades.'
                          : currentDecision.score >= 70
                          ? 'Buena decisión. Hay opciones aún más óptimas, pero esta funciona.'
                          : 'Decisión comprensible. Considera las consecuencias a largo plazo.'
                      }
                    />
                    <Button fullWidth variant="contained" color="warning" size="large" onClick={nextScenario}>
                      {escenarioIdx < ESCENARIOS.length - 1 ? 'Siguiente escenario →' : 'Ver resultado final →'}
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
              <FinniMessage
                variant="success"
                title="¡3 escenarios completados!"
                message={`Tu puntuación promedio: ${avgScore}/100. ${avgScore >= 90 ? '¡Excelente toma de decisiones!' : avgScore >= 70 ? 'Buenas decisiones. Sigue practicando.' : 'Buen primer intento. Con práctica mejorarás.'}`}
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography variant="body1" fontWeight={700} sx={{ mb: 1.5 }}>Principios que aplicaste:</Typography>
                <Stack spacing={1}>
                  {[
                    '1. Separar lo urgente+necesario de lo prescindible',
                    '2. Buscar recortes en deseos antes que en necesidades',
                    '3. Explorar alternativas antes de endeudarse',
                  ].map((p) => (
                    <Typography key={p} variant="body2">✓ {p}</Typography>
                  ))}
                </Stack>
              </FECard>
            </Stack>
          </Fade>
        )}
      </Box>
    </LessonShell>
  );
}
