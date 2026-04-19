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

const moduleColorMap = {
  warning: 'border-b-[#F59E0B]',
  success: 'border-b-[#10B981]',
  info: 'border-b-[#4B73F0]',
} as const;

export function PageHeader({ title, subtitle, onBack, rightSlot, moduleColor }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex items-center bg-white px-1 sm:px-2 min-h-14 border-b',
        moduleColor ? moduleColorMap[moduleColor] : 'border-b-[var(--color-neutral-200)]',
        moduleColor && 'border-b-2'
      )}
    >
      {onBack ? (
        <button
          onClick={onBack}
          aria-label="volver"
          className="mr-1 flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--color-neutral-100)] transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      ) : (
        <div className="mr-1 h-10 w-10 md:hidden" />
      )}

      <div className="flex-1 text-center md:text-left">
        <h1 className="truncate text-base font-bold leading-tight">{title}</h1>
        {subtitle && (
          <span className="block text-xs text-[var(--color-neutral-500)] leading-tight">
            {subtitle}
          </span>
        )}
      </div>

      <div className="ml-1 flex items-center gap-1">
        {rightSlot ?? null}
      </div>
    </header>
  );
}
