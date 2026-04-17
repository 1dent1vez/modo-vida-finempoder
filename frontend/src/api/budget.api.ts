import api from './client'; 

// --- DEFINICIÓN DE TIPOS ---

export type BudgetRow = {
  _id: string;
  category: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  notes?: string;
  periodicity: 'one_time' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  tags?: string[];
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
};

// Payload para crear: Quitamos ID y fechas de sistema
export type BudgetCreate = Omit<BudgetRow, '_id' | 'createdAt' | 'updatedAt'>;

// Filtros para las consultas
export type BudgetQuery = {
  from?: string;
  to?: string;
  type?: 'income' | 'expense';
  category?: string;
};

// Tipo para el resumen (Ajústalo si tu backend devuelve algo diferente)
export type BudgetSummary = {
  //totalIncome: number;
  income: number;
  //totalExpense: number;
  expense: number;
  balance: number;
  byCategory?: Record<string, number>;
};

// --- IMPLEMENTACIÓN API ---

export const budgetApi = {
  // 1. Listar registros (con filtros opcionales)
  list: async (params?: BudgetQuery) => {
    const { data } = await api.get<BudgetRow[]>('/budget', { params });
    return data;
  },

  // 2. Crear registro
  create: async (payload: BudgetCreate) => {
    const { data } = await api.post<BudgetRow>('/budget', payload);
    return data;
  },

  // 3. Actualizar registro
  update: async (id: string, payload: Partial<BudgetCreate>) => {
    const { data } = await api.patch<BudgetRow>(`/budget/${id}`, payload);
    return data;
  },

  // 4. Eliminar registro
  remove: async (id: string) => {
    const { data } = await api.delete<void>(`/budget/${id}`);
    return data;
  },

  // 5. Resumen financiero
  summary: async (params?: { from?: string; to?: string }) => {
    // Usamos BudgetSummary si conoces la estructura, o 'any' si varía
    const { data } = await api.get<BudgetSummary>('/budget/summary', { params });
    return data;
  }
};