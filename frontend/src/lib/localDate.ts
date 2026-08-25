/**
 * Day key en hora LOCAL (YYYY-MM-DD).
 *
 * DECISIÓN F1-OLA2: el "día del usuario" debe ser local, no UTC. Con
 * toISOString() (UTC) el día se corre en las primeras 6 horas para México
 * (UTC-6), lo que rompería la lógica de meta diaria y streak freeze.
 */
export function localDayKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Copia con aritmética local de días (setDate). */
export function addDaysLocal(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/** Day key local de hace N días. */
export function daysAgoLocalKey(days: number, from: Date = new Date()): string {
  return localDayKey(addDaysLocal(from, -days));
}
