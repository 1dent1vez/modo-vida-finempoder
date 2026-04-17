import { useState, useEffect } from 'react';
import {
  Box, Stack, Typography, Button, LinearProgress, Fade,
  TextField, Chip, IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

type LineItem = { id: string; label: string; amount: string };

const uid = () => Math.random().toString(36).slice(2, 9);

const makeItem = (label = '', amount = ''): LineItem => ({ id: uid(), label, amount });

type L5Data = { income?: number; necesidades?: number; deseos?: number; ahorro?: number } | null;
type L9Data = { queQuieres?: string; monto?: number; plazoMeses?: number } | null;

export default function L12() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);

  // Pre-filled from previous lessons
  const [ingresos, setIngresos] = useState<LineItem[]>([makeItem('Ingreso principal', '')]);
  const [gastosFijos, setGastosFijos] = useState<LineItem[]>([makeItem('Transporte', ''), makeItem('Materiales', '')]);
  const [gastosVariables, setGastosVariables] = useState<LineItem[]>([makeItem('Alimentación', ''), makeItem('Entretenimiento', '')]);
  const [ahorroMeta, setAhorroMeta] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  // Load from previous lessons
  useEffect(() => {
    const load = async () => {
      const l5 = await lessonDataRepository.load<L5Data>('presupuesto', 'l5_distribution');
      const l9 = await lessonDataRepository.load<L9Data>('presupuesto', 'l9_smart_goal');

      if (l5?.income) {
        setIngresos([makeItem('Ingreso mensual (L5)', String(l5.income))]);
      }
      if (l9?.monto && l9?.queQuieres) {
        setAhorroMeta(String(l9.monto / (l9.plazoMeses ?? 6)));
      }
      setLoading(false);
    };
    void load();
  }, []);

  const totalIngresos = ingresos.reduce((a, i) => a + (parseFloat(i.amount) || 0), 0);
  const totalFijos = gastosFijos.reduce((a, i) => a + (parseFloat(i.amount) || 0), 0);
  const totalVariables = gastosVariables.reduce((a, i) => a + (parseFloat(i.amount) || 0), 0);
  const ahorroNum = parseFloat(ahorroMeta) || 0;
  const balance = totalIngresos - totalFijos - totalVariables - ahorroNum;

  const pctFijos = totalIngresos > 0 ? Math.round((totalFijos / totalIngresos) * 100) : 0;
  const pctVariables = totalIngresos > 0 ? Math.round((totalVariables / totalIngresos) * 100) : 0;
  const pctAhorro = totalIngresos > 0 ? Math.round((ahorroNum / totalIngresos) * 100) : 0;

  const variablesHigh = pctVariables > 35;

  // Valid if at least 1 real income and 3 real expenses
  const realIngresos = ingresos.filter((i) => i.label.trim() && parseFloat(i.amount) > 0);
  const realGastos = [...gastosFijos, ...gastosVariables].filter((g) => g.label.trim() && parseFloat(g.amount) > 0);
  const canComplete = realIngresos.length >= 1 && realGastos.length >= 3;

  const addItem = (setter: React.Dispatch<React.SetStateAction<LineItem[]>>) => {
    setter((prev) => [...prev, makeItem()]);
  };

  const removeItem = (setter: React.Dispatch<React.SetStateAction<LineItem[]>>, id: string) => {
    setter((prev) => prev.filter((i) => i.id !== id));
  };

  const updateItem = (setter: React.Dispatch<React.SetStateAction<LineItem[]>>, id: string, field: 'label' | 'amount', value: string) => {
    setter((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const handleConfirm = async () => {
    await lessonDataRepository.save('presupuesto', 'l12_budget', {
      ingresos: ingresos.map((i) => ({ label: i.label, amount: parseFloat(i.amount) || 0 })),
      gastosFijos: gastosFijos.map((i) => ({ label: i.label, amount: parseFloat(i.amount) || 0 })),
      gastosVariables: gastosVariables.map((i) => ({ label: i.label, amount: parseFloat(i.amount) || 0 })),
      ahorro: ahorroNum,
      totalIngresos,
      totalGastos: totalFijos + totalVariables,
      balance,
      pctFijos,
      pctVariables,
      pctAhorro,
    });
    setConfirmed(true);
    setStep(2);
  };

  const renderSection = (
    title: string,
    items: LineItem[],
    setter: React.Dispatch<React.SetStateAction<LineItem[]>>,
    color: string,
  ) => (
    <FECard variant="flat" sx={{ border: 1, borderColor: color }}>
      <Typography variant="body1" fontWeight={700} sx={{ mb: 1.5 }}>{title}</Typography>
      <Stack spacing={1}>
        {items.map((item) => (
          <Stack key={item.id} direction="row" spacing={1} alignItems="center">
            <TextField
              label="Descripción"
              value={item.label}
              onChange={(e) => updateItem(setter, item.id, 'label', e.target.value)}
              size="small"
              sx={{ flex: 2 }}
            />
            <TextField
              label="$"
              type="number"
              value={item.amount}
              onChange={(e) => updateItem(setter, item.id, 'amount', e.target.value)}
              size="small"
              sx={{ flex: 1 }}
              inputProps={{ min: 0 }}
            />
            <IconButton size="small" onClick={() => removeItem(setter, item.id)} aria-label="Eliminar">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
      </Stack>
      <Button
        startIcon={<AddIcon />}
        size="small"
        onClick={() => addItem(setter)}
        sx={{ mt: 1 }}
      >
        Agregar
      </Button>
    </FECard>
  );

  if (loading) {
    return (
      <LessonShell id="L12" title="Construye tu propio presupuesto en vivo" completion={{ ready: false }}>
        <Typography variant="body2" color="text.secondary">Cargando tus datos previos...</Typography>
      </LessonShell>
    );
  }

  return (
    <LessonShell
      id="L12"
      title="Construye tu propio presupuesto en vivo"
      completion={{ ready: canComplete && confirmed }}
    >
      <Box sx={{ p: 1 }}>
        <LinearProgress
          variant="determinate"
          value={step === 0 ? 0 : step === 1 ? 40 : 100}
          color="warning"
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {step === 0 && (
          <Fade in>
            <Stack spacing={3}>
              <FinniMessage
                variant="coach"
                title="¡El momento que estuvimos construyendo desde L1!"
                message="Hoy no es teoría: vas a hacer tu presupuesto real de este mes. Tus datos, tus números, tu plan."
              />
              <FECard variant="flat" sx={{ border: 1, borderColor: 'warning.main', bgcolor: 'warning.light' }}>
                <Typography variant="body1" fontWeight={700} sx={{ mb: 1 }}>4 secciones del presupuesto:</Typography>
                {['1. Ingresos del mes', '2. Gastos fijos', '3. Gastos variables', '4. Meta de ahorro'].map((s) => (
                  <Typography key={s} variant="body2">✓ {s}</Typography>
                ))}
              </FECard>
              <FinniMessage
                variant="coach"
                title="Finni recuerda"
                message="Si no recuerdas algún dato exacto, pon tu mejor estimado. Un presupuesto imperfecto es infinitamente mejor que ninguno."
              />
              <Button fullWidth variant="contained" color="warning" size="large" onClick={() => setStep(1)}>
                ¡Construir mi presupuesto! →
              </Button>
            </Stack>
          </Fade>
        )}

        {step === 1 && (
          <Fade in>
            <Stack spacing={3}>
              {/* Ingresos */}
              {renderSection('💰 Sección 1: Ingresos del mes', ingresos, setIngresos, 'success.main')}

              {/* Gastos fijos */}
              {renderSection('📌 Sección 2: Gastos fijos', gastosFijos, setGastosFijos, 'warning.main')}

              {/* Gastos variables */}
              <FECard variant="flat" sx={{ border: 1, borderColor: variablesHigh ? 'error.main' : 'info.main' }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body1" fontWeight={700}>🔄 Sección 3: Gastos variables</Typography>
                  {variablesHigh && (
                    <Chip label={`${pctVariables}% ⚠️`} color="error" size="small" />
                  )}
                </Stack>
                {variablesHigh && (
                  <Typography variant="caption" color="error.main">
                    Finni avisa: tus variables superan el 30% recomendado.
                  </Typography>
                )}
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {gastosVariables.map((item) => (
                    <Stack key={item.id} direction="row" spacing={1} alignItems="center">
                      <TextField label="Descripción" value={item.label} onChange={(e) => updateItem(setGastosVariables, item.id, 'label', e.target.value)} size="small" sx={{ flex: 2 }} />
                      <TextField label="$" type="number" value={item.amount} onChange={(e) => updateItem(setGastosVariables, item.id, 'amount', e.target.value)} size="small" sx={{ flex: 1 }} inputProps={{ min: 0 }} />
                      <IconButton size="small" onClick={() => removeItem(setGastosVariables, item.id)} aria-label="Eliminar"><DeleteIcon fontSize="small" /></IconButton>
                    </Stack>
                  ))}
                </Stack>
                <Button startIcon={<AddIcon />} size="small" onClick={() => addItem(setGastosVariables)} sx={{ mt: 1 }}>Agregar</Button>
              </FECard>

              {/* Ahorro */}
              <FECard variant="flat" sx={{ border: 1, borderColor: 'success.main' }}>
                <Typography variant="body1" fontWeight={700} sx={{ mb: 1 }}>🌱 Sección 4: Ahorro mensual</Typography>
                <TextField
                  label="¿Cuánto destinarás al ahorro este mes? ($)"
                  type="number"
                  value={ahorroMeta}
                  onChange={(e) => setAhorroMeta(e.target.value)}
                  size="small"
                  fullWidth
                  inputProps={{ min: 0 }}
                />
                {totalIngresos > 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Disponible después de gastos: ${Math.max(0, balance + ahorroNum).toLocaleString()}
                  </Typography>
                )}
              </FECard>

              {/* Resumen en tiempo real */}
              {totalIngresos > 0 && (
                <FECard variant="flat" sx={{ bgcolor: balance >= 0 ? 'success.light' : 'error.light', border: 2, borderColor: balance >= 0 ? 'success.main' : 'error.main' }}>
                  <Typography variant="body1" fontWeight={700} sx={{ mb: 1 }}>Resumen</Typography>
                  <Stack spacing={0.5}>
                    <Stack direction="row" justifyContent="space-between"><Typography variant="body2">Ingresos</Typography><Typography variant="body2" fontWeight={700} color="success.main">+${totalIngresos.toLocaleString()}</Typography></Stack>
                    <Stack direction="row" justifyContent="space-between"><Typography variant="body2">Gastos fijos</Typography><Typography variant="body2" fontWeight={700} color="warning.dark">-${totalFijos.toLocaleString()} ({pctFijos}%)</Typography></Stack>
                    <Stack direction="row" justifyContent="space-between"><Typography variant="body2">Gastos variables</Typography><Typography variant="body2" fontWeight={700} color="warning.dark">-${totalVariables.toLocaleString()} ({pctVariables}%)</Typography></Stack>
                    <Stack direction="row" justifyContent="space-between"><Typography variant="body2">Ahorro</Typography><Typography variant="body2" fontWeight={700} color="info.main">-${ahorroNum.toLocaleString()} ({pctAhorro}%)</Typography></Stack>
                    <Stack direction="row" justifyContent="space-between" sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
                      <Typography variant="body1" fontWeight={700}>Balance</Typography>
                      <Typography variant="body1" fontWeight={700} color={balance >= 0 ? 'success.main' : 'error.main'}>
                        {balance >= 0 ? '+' : ''}{balance.toLocaleString()}
                      </Typography>
                    </Stack>
                  </Stack>
                </FECard>
              )}

              {canComplete && (
                <Fade in>
                  <Button fullWidth variant="contained" color="warning" size="large" onClick={() => void handleConfirm()}>
                    Guardar mi presupuesto →
                  </Button>
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
                title="¡Tu presupuesto está listo!"
                message="Guardado en tu perfil. En la Lección 13, Finni lo analizará y te dará su veredicto."
              />
              <FECard variant="flat" sx={{ border: 2, borderColor: 'warning.main', bgcolor: 'warning.light' }}>
                <Typography variant="h4" sx={{ mb: 1.5 }}>Resumen de tu presupuesto</Typography>
                {[
                  { label: 'Ingresos', value: `$${totalIngresos.toLocaleString()}`, color: 'success.main' },
                  { label: `Fijos (${pctFijos}%)`, value: `$${totalFijos.toLocaleString()}`, color: 'warning.dark' },
                  { label: `Variables (${pctVariables}%)`, value: `$${totalVariables.toLocaleString()}`, color: 'warning.dark' },
                  { label: `Ahorro (${pctAhorro}%)`, value: `$${ahorroNum.toLocaleString()}`, color: 'info.main' },
                  { label: 'Balance', value: `${balance >= 0 ? '+' : ''}$${balance.toLocaleString()}`, color: balance >= 0 ? 'success.main' : 'error.main' },
                ].map((r) => (
                  <Stack key={r.label} direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
                    <Typography variant="body2">{r.label}</Typography>
                    <Typography variant="body2" fontWeight={700} sx={{ color: r.color }}>{r.value}</Typography>
                  </Stack>
                ))}
              </FECard>
            </Stack>
          </Fade>
        )}
      </Box>
    </LessonShell>
  );
}
