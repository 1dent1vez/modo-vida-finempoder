export type GamificationRow = {
  id: string;
  user_id: string;
  xp: number;
  level: number;
  streak_current: number;
  streak_best: number;
  last_active_iso: string | null;
  module_progress: Record<string, number>;
};

export function computeLevel(xp: number): number {
  return Math.max(1, Math.floor(xp / 100) + 1);
}

export function applyStreak(row: GamificationRow, completedAt: Date): void {
  const isoDay = completedAt.toISOString().slice(0, 10);
  const prev = row.last_active_iso;

  if (prev === isoDay) return;

  const yesterday = (() => {
    const d = new Date(completedAt);
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  })();

  row.streak_current = prev === yesterday ? row.streak_current + 1 : 1;
  if (row.streak_current > row.streak_best) {
    row.streak_best = row.streak_current;
  }
  row.last_active_iso = isoDay;
}
