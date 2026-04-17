import { Box, Stack, Typography, Button, TextField, MenuItem, Paper, IconButton } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBudgetCreate, useBudgetDelete, useBudgetList, useBudgetSummary } from '../../../hooks/budget/useBudget';
import { BUDGET_CATEGORIES } from './constants';

const schema = z.object({
  category: z.enum(BUDGET_CATEGORIES),
  type: z.enum(['income','expense'] as const),
  amount: z.number().min(0),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().max(200).optional(),
  periodicity: z.enum(['one_time','weekly','biweekly','monthly','yearly'] as const),
});
type FormData = z.infer<typeof schema>;

export default function PresupuestoIndex() {
  const { register, handleSubmit, reset, formState:{errors} } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type:'expense', category:'Alimentación', amount:0, date:new Date().toISOString().slice(0,10), periodicity:'one_time' }
  });
  const list = useBudgetList();
  const summary = useBudgetSummary();
  const create = useBudgetCreate();
  const remove = useBudgetDelete();

  const onSubmit = (d: FormData) => { create.mutate(d); reset({...d, amount:0, notes:''}); };

  return (
    <Box sx={{ p:2, pb:9 }}>
      <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>Presupuestación</Typography>

      <Paper sx={{ p:2, borderRadius:3, mb:2 }}>
        <Typography fontWeight={700} sx={{ mb:1 }}>Agregar movimiento</Typography>
        <Stack component="form" onSubmit={handleSubmit(onSubmit)} direction={{ xs:'column', sm:'row' }} spacing={1.5}>
          <TextField select label="Tipo" {...register('type')}>
            <MenuItem value="expense">Gasto</MenuItem>
            <MenuItem value="income">Ingreso</MenuItem>
          </TextField>
          <TextField select label="Categoría" sx={{ minWidth: 160 }} {...register('category')}>
            {BUDGET_CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </TextField>
          <TextField label="Monto (MXN)" type="number" inputProps={{ step:'0.01' }} {...register('amount',{ valueAsNumber:true })} error={!!errors.amount} />
          <TextField label="Fecha" type="date" {...register('date')} />
          <TextField label="Periodicidad" select sx={{ minWidth: 140 }} {...register('periodicity')}>
            <MenuItem value="one_time">Única</MenuItem>
            <MenuItem value="weekly">Semanal</MenuItem>
            <MenuItem value="biweekly">Quincenal</MenuItem>
            <MenuItem value="monthly">Mensual</MenuItem>
            <MenuItem value="yearly">Anual</MenuItem>
          </TextField>
          <Button type="submit" variant="contained" startIcon={<Add />} sx={{ whiteSpace:'nowrap' }}>Agregar</Button>
        </Stack>
      </Paper>

      <Paper sx={{ p:2, borderRadius:3, mb:2 }}>
        <Typography fontWeight={700}>Resumen</Typography>
        <Stack direction="row" spacing={3} sx={{ mt:1 }}>
          <Stat label="Ingresos" value={summary.data?.income ?? 0} color="#58D68D" />
          <Stat label="Gastos" value={summary.data?.expense ?? 0} color="#EC7063" />
          <Stat label="Balance" value={summary.data?.balance ?? 0} color="#6C7AE0" />
        </Stack>
      </Paper>

      <Paper sx={{ p:2, borderRadius:3 }}>
        <Typography fontWeight={700} sx={{ mb:1 }}>Movimientos</Typography>
        <Stack spacing={1}>
          {list.data?.map(r => (
            <Stack key={r._id} direction="row" alignItems="center" spacing={1} sx={{ border: '1px solid #eee', borderRadius: 2, p: 1 }}>
              <Box sx={{ minWidth: 86 }}>
                <Typography variant="caption" color="text.secondary">{r.date.slice(0,10)}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography fontWeight={700}>{`${r.type === 'income' ? 'Ingreso' : 'Gasto'} • ${r.category}`}</Typography>
                {r.notes && <Typography variant="caption" color="text.secondary">{r.notes}</Typography>}
              </Box>
              <Typography fontWeight={800} sx={{ color: r.type === 'income' ? 'success.main' : 'error.main', minWidth: 100, textAlign: 'right' }}>
                {r.type === 'income' ? '+' : '-'}${r.amount.toFixed(2)}
              </Typography>
              <IconButton onClick={() => remove.mutate(r._id)} size="small"><Delete /></IconButton>
            </Stack>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}
function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Stack>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography fontWeight={800} sx={{ color }}>{value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</Typography>
    </Stack>
  );
}
