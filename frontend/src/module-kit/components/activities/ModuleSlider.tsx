import { cn } from '@/lib/utils';

export type SliderColor = 'warning' | 'success' | 'info' | 'primary';

export interface ModuleSliderProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  resultLabel?: string;
  color?: SliderColor;
}

const chipClass: Record<SliderColor, string> = {
  primary: 'bg-[var(--color-brand-primary)] text-white',
  warning: 'bg-[var(--color-brand-warning-bg)] text-[var(--color-brand-warning)]',
  success: 'bg-[var(--color-brand-success-bg)] text-[var(--color-brand-success)]',
  info: 'bg-[var(--color-brand-info-bg)] text-[var(--color-brand-info)]',
};

const accentVar: Record<SliderColor, string> = {
  primary: 'var(--color-brand-primary)',
  warning: 'var(--color-brand-warning)',
  success: 'var(--color-brand-success)',
  info: 'var(--color-brand-info)',
};

export function ModuleSlider({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  unit = '',
  resultLabel,
  color = 'primary',
}: ModuleSliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  const accent = accentVar[color];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold">{label}</span>
        <div className="flex items-center gap-2">
          <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold min-w-[52px] justify-center', chipClass[color])}>
            {value}{unit}
          </span>
          {resultLabel && (
            <span className="text-xs text-[var(--color-text-secondary)]">{resultLabel}</span>
          )}
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[var(--color-neutral-200)]"
        style={{
          backgroundImage: `linear-gradient(to right, ${accent} ${pct}%, var(--color-neutral-200) ${pct}%)`,
          accentColor: accent,
        }}
      />

      <div className="flex justify-between mt-1">
        <span className="text-xs text-[var(--color-text-muted)]">{min}{unit}</span>
        <span className="text-xs text-[var(--color-text-muted)]">{max}{unit}</span>
      </div>
    </div>
  );
}
