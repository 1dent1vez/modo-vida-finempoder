import { useMemo, useState } from 'react';
import {
  Box,
  Stack,
  Typography,
  Paper,
  TextField,
  Slider,
  Chip,
  Button,
  MenuItem,
  Divider,
  LinearProgress
} from '@mui/material';
import SavingsIcon from '@mui/icons-material/Savings';
import AlarmIcon from '@mui/icons-material/Alarm';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { SAVINGS_LESSONS } from './lessonFlow';
import { useNavigate } from 'react-router-dom';


export default function AhorroIndex() {
  const nav = useNavigate();
  const [goalName, setGoalName] = useState('Fondo de emergencia');
  const [goalAmount, setGoalAmount] = useState(3000);
  const [months, setMonths] = useState(6);
  const [autoDay, setAutoDay] = useState(15);
  const [autoAmount, setAutoAmount] = useState(500);
  const [channel, setChannel] = useState<'transfer' | 'efectivo'>('transfer');

  const monthlyNeeded = useMemo(() => (months > 0 ? goalAmount / months : 0), [goalAmount, months]);
  const coverage = Math.min(100, Math.round((autoAmount / monthlyNeeded) * 100 || 0));
  const paceOk = coverage >= 100;

  const handleApplyPreset = (amount: number, m: number) => {
    setGoalAmount(amount);
    setMonths(m);
    setAutoAmount(Math.round(amount / m));
  };

  return (
    <Box sx={{ p: 2, pb: 9 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <SavingsIcon sx={{ color: 'warning.main' }} />
        <Typography variant="h6" fontWeight={800}>
          Plan rapido de ahorro
        </Typography>
      </Stack>

      <Paper sx={{ p: 2, borderRadius: 3, mt: 2, borderLeft: '6px solid' }}>
        <Typography fontWeight={700} sx={{ mb: 1 }}>
          Define tu meta
        </Typography>
        <Stack spacing={1.25}>
          <TextField
            label="Meta"
            value={goalName}
            onChange={(e) => setGoalName(e.target.value)}
            helperText="Ejemplo: laptop, mudanza, fondo de emergencia"
          />
          <TextField
            label="Monto objetivo (MXN)"
            type="number"
            value={goalAmount}
            onChange={(e) => setGoalAmount(Number(e.target.value))}
            inputProps={{ min: 0, step: 100 }}
          />
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              Meses para lograrlo: {months}
            </Typography>
            <Slider
              value={months}
              min={1}
              max={12}
              step={1}
              onChange={(_, v) => setMonths(v as number)}
              valueLabelDisplay="auto"
            />
          </Stack>
          <Typography fontWeight={700}>
            Necesitas ahorrar ~${monthlyNeeded.toFixed(2)} al mes.
          </Typography>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2, borderRadius: 3, mt: 2, borderLeft: `6px solid ${'info.main'}` }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <AlarmIcon sx={{ color: 'info.main' }} />
          <Typography fontWeight={700}>Programa tus depositos</Typography>
        </Stack>
        <Stack spacing={1.25} sx={{ mt: 1 }}>
          <TextField
            select
            label="Dia automatico"
            value={autoDay}
            onChange={(e) => setAutoDay(Number(e.target.value))}
          >
            {[1, 5, 10, 15, 20, 25].map((d) => (
              <MenuItem key={d} value={d}>
                Dia {d} de cada mes
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Monto automatico (MXN)"
            type="number"
            value={autoAmount}
            onChange={(e) => setAutoAmount(Number(e.target.value))}
            inputProps={{ min: 0, step: 50 }}
          />
          <TextField
            select
            label="Canal"
            value={channel}
            onChange={(e) => setChannel(e.target.value as 'transfer' | 'efectivo')}
          >
            <MenuItem value="transfer">Transferencia programada</MenuItem>
            <MenuItem value="efectivo">Deposito en efectivo con recordatorio</MenuItem>
          </TextField>

          <LinearProgress
            variant="determinate"
            value={coverage}
            sx={{
              height: 8,
              borderRadius: 5,
              bgcolor: 'grey.100',
              '& .MuiLinearProgress-bar': { bgcolor: paceOk ? 'success.main' : 'warning.main' }
            }}
          />
          <Typography variant="body2" color="text.secondary">
            Cubres {coverage}% de lo necesario cada mes.
          </Typography>
          <Chip
            color={paceOk ? 'success' : 'warning'}
            label={paceOk ? 'Estas en ruta a la meta' : 'Sube un poco tu deposito'}
            sx={{ alignSelf: 'flex-start' }}
          />
        </Stack>
      </Paper>

      <Paper sx={{ p: 2, borderRadius: 3, mt: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <AutoAwesomeIcon sx={{ color: 'secondary.main' }} />
          <Typography fontWeight={700}>Atajos</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Selecciona un atajo para precargar meta y frecuencia.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
          <Chip label="Ahorro rapido: $1500 en 3 meses" onClick={() => handleApplyPreset(1500, 3)} />
          <Chip label="Fondo 1-3-6: $6000 en 6 meses" onClick={() => handleApplyPreset(6000, 6)} />
          <Chip label="Meta grande: $12000 en 10 meses" onClick={() => handleApplyPreset(12000, 10)} />
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={1}>
          <Typography fontWeight={700}>Da el siguiente paso</Typography>
          <Typography variant="body2" color="text.secondary">
            Continua con las lecciones para desbloquear guias y simuladores de ahorro.
          </Typography>
          <Button
            variant="contained"
            onClick={() => nav('/app/ahorro')}
            sx={{ alignSelf: 'flex-start', bgcolor: 'warning.main', '&:hover': { bgcolor: 'warning.dark' } }}
          >
            Ver lecciones
          </Button>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {SAVINGS_LESSONS.slice(0, 3).map((l) => (
              <Chip key={l.id} label={`${l.id} - ${l.title}`} size="small" />
            ))}
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}

