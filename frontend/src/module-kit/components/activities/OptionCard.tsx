import { CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface OptionCardProps {
  label: string;
  selected: boolean;
  correct?: boolean;
  incorrect?: boolean;
  explanation?: string;
  onSelect: () => void;
  disabled?: boolean;
}

export function OptionCard({
  label,
  selected,
  correct,
  incorrect,
  explanation,
  onSelect,
  disabled = false,
}: OptionCardProps) {
  const answered = correct === true || incorrect === true;

  return (
    <div>
      <button
        type="button"
        onClick={disabled ? undefined : onSelect}
        disabled={disabled && !answered}
        className={cn(
          'w-full text-left border-2 rounded-xl p-4 flex items-center justify-between gap-3 transition-all duration-150 outline-none',
          'focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2',
          correct
            ? 'border-[var(--color-brand-success)] bg-[var(--color-brand-success-bg)]'
            : incorrect
            ? 'border-[var(--color-brand-error)] bg-[var(--color-brand-error-bg)]'
            : selected
            ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)] text-white'
            : 'border-[var(--color-neutral-200)] bg-white hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-brand-info-bg)]',
          disabled && !answered && 'cursor-default'
        )}
      >
        <span className={cn('text-sm font-medium', selected && !answered && 'text-white')}>
          {label}
        </span>

        {answered && (
          <span className="shrink-0">
            {correct && <CheckCircle className="h-5 w-5 text-[var(--color-brand-success)]" />}
            {incorrect && <XCircle className="h-5 w-5 text-[var(--color-brand-error)]" />}
          </span>
        )}
      </button>

      {answered && explanation && (correct === true || incorrect === true) && (
        <div
          className={cn(
            'mt-1.5 p-3 rounded-xl border text-sm',
            correct
              ? 'bg-[var(--color-brand-success-bg)] border-[var(--color-brand-success)] text-[var(--color-brand-success)]'
              : 'bg-[var(--color-brand-error-bg)] border-[var(--color-brand-error)] text-[var(--color-brand-error)]'
          )}
        >
          {explanation}
        </div>
      )}
    </div>
  );
}
