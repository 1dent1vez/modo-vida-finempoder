import { useEffect, useState } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade,
  Slider, Chip, Paper,
} from '@mui/material';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

type Instrumento = 'cetes' | 'fondoBalanceado' | 'acciones';
type Portafolio = Record<Instrumento, number>;

const INSTRUMENTOS: { key: Instrumento; nombre: string; rendimiento: number; riesgo: string; emoji: string }[] = [
  { key: 'cetes', nombre: 'CETES (deuda)', rendimiento: 0.10, riesgo: 'Bajo', emoji: '🔵' },
  { key: 'fondoBalanceado', nombre: 'Fondo balanceado', rendimiento: 0.08, riesgo: 'Medio', emoji: '🟡' },
  { key: 'acciones', nombre: 'Acciones BMV', rendimiento: 0.12, riesgo: 'Alto', emoji: '🔴' },
];

function calcRendimientoPortafolio(p: Portafolio): number {
  const total = p.cetes + p.fondoBalanceado + p.acciones;
  if (total === 0) return 0;
  return INSTRUMENTOS.reduce((acc, inst) => acc + (p[inst.key] / total) * inst.rendimiento, 0) * 100;
}

export default function L09() {
  const [step, setStep] = useState(0);
  const [portafolio, setPortafolio] = useState<Portafolio>({ cetes: 400, fondoBalanceado: 300, acciones: 300 });
  const [portafolioConfirmado, setPortafolioConfirmado] = useState(false);
  const [perfilGuardado, setPerfilGuardado] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await lessonDataRepository.load<{ perfil: string }>('inversion', 'l08_perfil_riesgo');
      if (data?.perfil) setPerfilGuardado(data.perfil);
    };
    void load();
  }, []);

  const total = portafolio.cetes + portafolio.fondoBalanceado + portafolio.acciones;
  const concentracion = Math.max(...Object.values(portafolio)) / total * 100;
  const esDiversificado = concentracion <= 70;
  const rendimientoEst = calcRendimientoPortafolio(portafolio);

  const sugerenciaSegunPerfil = () => {
    if (perfilGuardado === 'conservador') return '70% CETES · 20% Fondo balanceado · 10% Acciones';
    if (perfilGuardado === 'agresivo') return '20% CETES · 30% Fondo balanceado · 50% Acciones';
    return '40% CETES · 35% Fondo balanceado · 25% Acciones';
  };

  const setInstPct = (key: Instrumento, pct: number) => {
    setPortafolio((prev) => {
      const otros = Object.keys(prev).filter((k) => k !== key) as Instrumento[];
      const totalOtros = total - prev[key];
      const newVal = Math.round((pct / 100) * total);
      const diff = newVal - prev[key];
      const updated = { ...prev, [key]: newVal };
      if (diff !== 0 && totalOtros > 0) {
        const factor = (total - newVal) / totalOtros;
        otros.forEach((k) => {
          updated[k] = Math.max(0, Math.round(prev[k] * factor));
        });
        // fix rounding
        const suma = Object.values(updated).reduce((a, b) => a + b, 0);
        if (suma !== total) {
          const ajuste = total - suma;
          const otroAjustar = otros.find((k) => updated[k] + ajuste >= 0);
          if (otroAjustar) updated[otroAjustar] += ajuste;
        }
      }
      return updated;
    });
  };

  return (
    <LessonShell
      id="L09"
      title="No pongas todos los huevos en la misma canasta: diversificación"
      completion={{ ready: portafolioConfirmado }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={(step / 2) * 100}
          color="info"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {/* Pantalla 0 — Concepto + tipos */}
        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="coach"
                title="La analogía de las canastas"
                message="Imagina que llevas 12 huevos en una canasta. Tropiezas. Pierdes los 12. Ahora imagina que los llevas en 4 canastas de 3 huevos. Tropiezas. Pierdes 3. Eso es la diversificación."
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography fontWeight={700} sx={{ mb: 1 }}>¿Qué es diversificar?</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Distribuir tu dinero en diferentes tipos de inversión para que si una baja, las otras amortigüen la pérdida.
                </Typography>
                <Stack spacing={1.5}>
                  <Box>
                    <Chip size="small" label="❌ No diversificado" color="error" sx={{ mb: 0.5 }} />
                    <Typography variant="body2">100% en acciones de una sola empresa. Si quiebra, pierdes todo.</Typography>
                  </Box>
                  <Box>
                    <Chip size="small" label="✅ Diversificado" color="success" sx={{ mb: 0.5 }} />
                    <Typography variant="body2">50% CETES + 30% fondo balanceado + 20% acciones de diferentes sectores.</Typography>
                  </Box>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, fontStyle: 'italic' }}>
                  "Con $1,000 puedes tener CETES y un fondo de inversión. Eso ya es diversificación."
                </Typography>
              </FECard>
              <FECard variant="flat" sx={{ border: 1, borderColor: 'divider' }}>
                <Typography fontWeight={700} sx={{ mb: 1 }}>3 tipos de diversificación</Typography>
                {[
                  { tipo: 'Por instrumento', ej: 'CETES + fondos + acciones' },
                  { tipo: 'Por plazo', ej: 'CETES 28 días (corto) + fondos a 1 año (mediano)' },
                  { tipo: 'Por sector', ej: 'Tecnología + salud + consumo básico (para acciones)' },
                ].map((t) => (
                  <Stack key={t.tipo} sx={{ py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" fontWeight={700}>{t.tipo}</Typography>
                    <Typography variant="caption" color="text.secondary">{t.ej}</Typography>
                  </Stack>
                ))}
              </FECard>
              <Paper sx={{ p: 2, borderRadius: 3, bgcolor: 'warning.light', border: 1, borderColor: 'warning.main' }}>
                <Typography fontWeight={700} sx={{ mb: 1 }}>Año adverso en el mercado:</Typography>
                <Stack direction="row" spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" fontWeight={700}>Portafolio concentrado (100% una acción)</Typography>
                    <Typography variant="h5" fontWeight={800} color="error.main">-40%</Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" fontWeight={700}>Portafolio diversificado</Typography>
                    <Typography variant="h5" fontWeight={800} color="success.main">-12%</Typography>
                  </Box>
                </Stack>
              </Paper>
              <Button fullWidth variant="contained" color="info" size="large" onClick={() => setStep(1)}>
                Construir mi portafolio →
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Pantalla 1 — Constructor de portafolio */}
        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              <Typography variant="h4" fontWeight={700}>Constructor de portafolio</Typography>
              <Typography variant="body2" color="text.secondary">
                Distribuye $1,000 virtuales entre los instrumentos:
              </Typography>
              {perfilGuardado && (
                <FECard variant="flat" sx={{ bgcolor: 'info.light', border: 1, borderColor: 'info.main' }}>
                  <Typography variant="caption" fontWeight={700}>Sugerencia según tu perfil ({perfilGuardado}):</Typography>
                  <Typography variant="caption" display="block">{sugerenciaSegunPerfil()}</Typography>
                </FECard>
              )}
              <Stack spacing={2}>
                {INSTRUMENTOS.map((inst) => {
                  const pct = Math.round((portafolio[inst.key] / total) * 100);
                  return (
                    <Paper key={inst.key} sx={{ p: 2, borderRadius: 3 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography fontWeight={700}>{inst.emoji} {inst.nombre}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip size="small" label={`${inst.rendimiento * 100}%/año`} color="success" variant="outlined" />
                          <Typography fontWeight={800} color="warning.dark">{pct}%</Typography>
                        </Stack>
                      </Stack>
                      <Slider
                        value={pct}
                        min={0}
                        max={100}
                        step={5}
                        onChange={(_, v) => setInstPct(inst.key, Number(v))}
                        color="info"
                        valueLabelDisplay="auto"
                      />
                      <Typography variant="caption" color="text.secondary">
                        Riesgo: {inst.riesgo} · ${portafolio[inst.key].toLocaleString()}
                      </Typography>
                    </Paper>
                  );
                })}
              </Stack>
              <FECard variant="flat" sx={{ border: 2, borderColor: esDiversificado ? 'success.main' : 'error.main', bgcolor: esDiversificado ? 'success.light' : 'error.light' }}>
                <Stack direction="row" justifyContent="space-between">
                  <Box>
                    <Typography fontWeight={700}>Rendimiento estimado</Typography>
                    <Typography variant="h5" fontWeight={900}>{rendimientoEst.toFixed(1)}% anual</Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography fontWeight={700}>Diversificación</Typography>
                    <Chip
                      label={esDiversificado ? '✅ Diversificado' : '⚠️ Muy concentrado'}
                      color={esDiversificado ? 'success' : 'error'}
                    />
                  </Box>
                </Stack>
                {!esDiversificado && (
                  <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 1 }}>
                    Tu portafolio está concentrado ({Math.round(concentracion)}% en un solo instrumento). Considera diversificar.
                  </Typography>
                )}
              </FECard>
              <FECard variant="flat" sx={{ bgcolor: 'info.light', border: 1, borderColor: 'info.main' }}>
                <Typography variant="caption" fontWeight={700}>Regla "100 menos tu edad":</Typography>
                <Typography variant="caption" display="block">
                  Si tienes 22 años: máximo 78% en renta variable (100 - 22 = 78). El resto en instrumentos de deuda más seguros.
                </Typography>
              </FECard>
              <Button
                fullWidth
                variant="contained"
                color="info"
                size="large"
                disabled={!esDiversificado}
                onClick={() => setPortafolioConfirmado(true)}
              >
                {portafolioConfirmado
                  ? '✅ Portafolio guardado'
                  : esDiversificado
                    ? 'Confirmar portafolio diversificado'
                    : 'Diversifica primero (máx. 70% en un instrumento)'}
              </Button>
              {portafolioConfirmado && (
                <Fade in>
                  <FinniMessage
                    variant="success"
                    title="¡Portafolio diversificado confirmado!"
                    message="Ahora sabes cómo distribuir tu dinero para reducir riesgo sin sacrificar rendimiento. Este es el pensamiento del inversionista prudente."
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
