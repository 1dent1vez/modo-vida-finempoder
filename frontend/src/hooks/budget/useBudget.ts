import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useProgress } from '../../store/progress';
import { budgetApi, type BudgetQuery, type BudgetCreate } from '../../api/budget.api';


export const useBudgetList = (filters?: BudgetQuery) => { 
  return useQuery({
    queryKey: ['budget', filters],
    queryFn: () => budgetApi.list(filters), // Ahora coinciden perfectamente
    staleTime: 1000 * 60 * 5, // opcional: 5 minutos
  });
};
export function useBudgetCreate() {
  const qc = useQueryClient();
  const progress = useProgress();
  return useMutation({
    mutationFn: (payload: BudgetCreate) => budgetApi.create(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['budget'] }); progress.recordActivity('presupuesto', 5); },
  });
}
export function useBudgetUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BudgetCreate> }) => budgetApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budget'] }),
  });
}
export function useBudgetDelete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => budgetApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budget'] }),
  });
}
export function useBudgetSummary(range?: { from?: string; to?: string }) {
  return useQuery({ queryKey: ['budget-summary', range], queryFn: () => budgetApi.summary(range) });
}
