/** Micro-tips financieros MEXICANOS (rotación diaria, día del año). */
export const DAILY_TIPS = [
  'Revisa tus suscripciones: una olvidada cuesta ~$500 al año.',
  'Come en casa 2 veces por semana y nota la diferencia a fin de mes.',
  'Paga tus tarjetas a tiempo: evita intereses del 60% o más al año.',
  'El café de todos los días puede ser más caro que tu plan de ahorro.',
  'Compara precios en 2 tiendas antes de comprar lo del mandado.',
  'Separa el 10% de tu ingreso el día que cobras, no lo que sobre.',
  'Un gasto hormiga de $20 diarios son ~$600 al mes.',
  'Usa efectivo para gastos pequeños: se nota más que la tarjeta.',
  'Antes de invertir, cubre tu fondo de emergencia de 3 a 6 meses.',
  'La inflación en México le gana al dinero guardado en el colchón.',
  'Paga tus deudas con la tasa más alta primero (método avalancha).',
  'Ahorra tu quincena extra: llega sin que la esperes.',
  'El interés compuesto premia empezar hoy, aunque sea con $100.',
  'Define tu meta con monto y fecha: sin fecha, no es meta.',
];

/** Índice del tip según el día del año (patrón existente de la Home). */
export function getDailyTipIndex(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
  return dayOfYear % DAILY_TIPS.length;
}

export function getDailyTip(date: Date = new Date()): string {
  return DAILY_TIPS[getDailyTipIndex(date)] ?? DAILY_TIPS[0];
}
