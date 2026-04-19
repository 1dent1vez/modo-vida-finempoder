import { cn } from '@/lib/utils';
import { Lightbulb, PartyPopper, AlertTriangle, Ban, PawPrint } from 'lucide-react';
type FinniVariant = 'info' | 'success' | 'warning' | 'error' | 'coach';

interface FinniAction {
  label: string;
  onClick: () => void;
}

interface FinniMessageProps {
  variant?: FinniVariant;
  message: string;
  title?: string;
  actions?: [FinniAction] | [FinniAction, FinniAction];
  className?: string;
}

type VariantConfig = {
  Icon: React.ComponentType<{ className?: string }>;
  bg: string;
  border: string;
  iconColor: string;
};

const variantConfig: Record<FinniVariant, VariantConfig> = {
  info: {
    Icon: Lightbulb,
    bg: 'bg-[var(--color-status-infoBg)]',
    border: 'border-l-[var(--color-status-info)]',
    iconColor: 'text-[var(--color-status-info)]',
  },
  success: {
    Icon: PartyPopper,
    bg: 'bg-[var(--color-status-successBg)]',
    border: 'border-l-[var(--color-status-success)]',
    iconColor: 'text-[var(--color-status-success)]',
  },
  warning: {
    Icon: AlertTriangle,
    bg: 'bg-[var(--color-status-warningBg)]',
    border: 'border-l-[var(--color-status-warning)]',
    iconColor: 'text-[var(--color-status-warning)]',
  },
  error: {
    Icon: Ban,
    bg: 'bg-[var(--color-status-errorBg)]',
    border: 'border-l-[var(--color-status-error)]',
    iconColor: 'text-[var(--color-status-error)]',
  },
  coach: {
    Icon: PawPrint,
    bg: 'bg-[var(--color-brand-accentBg)]',
    border: 'border-l-[var(--color-brand-accent)]',
    iconColor: 'text-[var(--color-brand-accent)]',
  },
};

export default function FinniMessage({
  variant = 'coach',
  message,
  title = 'Finni dice:',
  actions,
  className,
}: FinniMessageProps) {
  const cfg = variantConfig[variant];
  const { Icon } = cfg;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'p-4 rounded-xl border-l-4',
        cfg.bg,
        cfg.border,
        className
      )}
    >
      <div className="flex gap-3 items-start">
        <div className={cn(
          'flex h-10 w-10 min-w-10 items-center justify-center rounded-full bg-white shadow-[var(--shadow-sm)]',
          cfg.iconColor
        )}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <span className="block text-xs font-bold text-[var(--color-neutral-500)] mb-1">
            {title}
          </span>
          <p className="text-sm">{message}</p>

          {actions && actions.length > 0 && (
            <div className="flex gap-2 mt-3">
              {actions.map((action, i) => (
                <button
                  key={i}
                  onClick={action.onClick}
                  className="text-xs font-semibold text-[var(--color-brand-primary)] hover:underline"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
