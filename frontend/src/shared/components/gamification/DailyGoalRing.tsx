export interface DailyGoalRingProps {
  xpToday: number;
  xpTarget: number;
}

const RADIUS = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Anillo SVG de progreso hacia la meta diaria (XP del día / XP objetivo). */
export function DailyGoalRing({ xpToday, xpTarget }: DailyGoalRingProps) {
  const reached = xpTarget > 0 && xpToday >= xpTarget;
  const pct = xpTarget > 0 ? Math.min(1, xpToday / xpTarget) : 0;
  const offset = CIRCUMFERENCE * (1 - pct);

  return (
    <div
      className="relative h-20 w-20 shrink-0"
      role="progressbar"
      aria-valuenow={xpToday}
      aria-valuemin={0}
      aria-valuemax={xpTarget}
      aria-label="Progreso de la meta diaria"
    >
      <svg viewBox="0 0 64 64" className="h-20 w-20 -rotate-90">
        <circle
          cx="32"
          cy="32"
          r={RADIUS}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="6"
        />
        <circle
          cx="32"
          cy="32"
          r={RADIUS}
          fill="none"
          stroke={reached ? 'var(--color-brand-success)' : 'var(--color-brand-primary)'}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={reached ? 'text-base font-black text-[var(--color-brand-success)]' : 'text-base font-black'}>
          {Math.round(pct * 100)}%
        </span>
      </div>
    </div>
  );
}
