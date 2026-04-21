import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightSlot?: ReactNode;
  moduleColor?: 'warning' | 'success' | 'info';
}

const borderColorMap = {
  warning: 'border-b-[var(--color-brand-warning)]',
  success: 'border-b-[var(--color-brand-success)]',
  info:    'border-b-[var(--color-brand-primary)]',
} as const;

export function PageHeader({ title, subtitle, onBack, rightSlot, moduleColor }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 bg-white border-b border-[var(--color-neutral-200)]',
        moduleColor && 'border-b-2',
        moduleColor && borderColorMap[moduleColor]
      )}
    >
      <div className="flex items-center px-2 sm:px-4 min-h-14 gap-2">
        {onBack ? (
          <button
            onClick={onBack}
            aria-label="volver"
            className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full hover:bg-[var(--color-neutral-100)] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        ) : (
          <div className="shrink-0 w-10 md:hidden" />
        )}

        <div className="flex-1 text-center md:text-left">
          <h1 className="font-bold leading-snug truncate text-base">{title}</h1>
          {subtitle && (
            <span className="block text-xs text-[var(--color-text-secondary)] leading-snug">
              {subtitle}
            </span>
          )}
        </div>

        <div className="shrink-0 flex items-center gap-2 ml-2">
          {rightSlot ?? null}
        </div>
      </div>
    </header>
  );
}
