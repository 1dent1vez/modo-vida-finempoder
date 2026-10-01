import type { ReactNode } from 'react';

interface LessonRangeProps {
  label: string;
  ariaLabel?: string;
  display: ReactNode;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
}

export function LessonRange({
  label,
  ariaLabel,
  display,
  min,
  max,
  step,
  value,
  onChange,
}: LessonRangeProps) {
  return (
    <label>
      {label} <strong>{display}</strong>
      <input
        type="range"
        aria-label={ariaLabel ?? label.replace(/:$/, '')}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}
