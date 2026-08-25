// FinEmpoder — Colores FIJOS por serie para la tarjeta compartible
// (F3-CRECIMIENTO). Copian los hex del tema (tokens.css) a propósito: la
// tarjeta PNG se renderiza con html-to-image y no debe depender de CSS vars.

export interface SerieCardStyle {
  accent: string;
  pillBg: string;
  iconColor: string;
}

export const SERIE_CARD_STYLE: Record<string, SerieCardStyle> = {
  presupuesto: { accent: '#F59E0B', pillBg: '#FDE68A', iconColor: '#92400E' },
  ahorro: { accent: '#10B981', pillBg: '#A7F3D0', iconColor: '#065F46' },
  inversion: { accent: '#4B73F0', pillBg: '#DBEAFE', iconColor: '#1E40AF' },
  racha: { accent: '#F97316', pillBg: '#FFEDD5', iconColor: '#9A3412' },
  lecciones: { accent: '#6366F1', pillBg: '#E0E7FF', iconColor: '#3730A3' },
  finempoder_pro: { accent: '#D97706', pillBg: '#FDE68A', iconColor: '#92400E' },
};
