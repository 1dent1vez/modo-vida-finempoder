import { useEffect, useRef, type ReactNode } from 'react';
import FinniAssistant, { type FinniAdvice } from '../../shared/components/finni/FinniAssistant';

type ActivityFrameProps = {
  label: string;
  className?: string;
  busy: boolean;
  title: string;
  description: string;
  progressLabel?: string;
  progressValue?: number;
  progressMax?: number;
  stepLabel?: string;
  focusKey?: string | number | boolean;
  children: ReactNode;
  advice: FinniAdvice;
  adviceCue: string | null;
  error?: string | null;
  status: string;
  actions?: ReactNode;
};

export function ActivityLoading({ message = 'Cargando tu actividad…' }: { message?: string }) {
  return (
    <p className="ca-load" role="status">
      {message}
    </p>
  );
}

export function ActivityLoadError({
  message,
  onRetry,
  retryLabel = 'Reintentar carga',
}: {
  message: string;
  onRetry: () => void;
  retryLabel?: string;
}) {
  return (
    <div className="ca-load" role="alert">
      <p>{message}</p>
      <button type="button" onClick={onRetry}>
        {retryLabel}
      </button>
    </div>
  );
}

/** Shared activity chrome. The lesson owns its content, decisions and completion rules. */
export default function ActivityFrame({
  label,
  className = '',
  busy,
  title,
  description,
  progressLabel,
  progressValue = 0,
  progressMax = 1,
  stepLabel,
  focusKey,
  children,
  advice,
  adviceCue,
  error,
  status,
  actions,
}: ActivityFrameProps) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (focusKey !== undefined) heading.current?.focus({ preventScroll: true });
  }, [focusKey]);
  const safeMax = Math.max(1, progressMax);
  const safeValue = Math.min(safeMax, Math.max(0, progressValue));
  return (
    <section
      className={`classification-activity ${className}`.trim()}
      aria-label={label}
      aria-busy={busy}
    >
      <header className="ca-header">
        <h2 ref={heading} tabIndex={focusKey === undefined ? undefined : -1}>
          {title}
        </h2>
        <p>{description}</p>
        {stepLabel && <span>{stepLabel}</span>}
      </header>
      {progressLabel && (
        <div
          className="ca-progress"
          role="progressbar"
          aria-label={progressLabel}
          aria-valuemin={0}
          aria-valuemax={safeMax}
          aria-valuenow={safeValue}
        >
          <span style={{ transform: `scaleX(${safeValue / safeMax})` }} />
        </div>
      )}
      {children}
      <FinniAssistant advice={advice} cue={adviceCue} />
      {error && (
        <p role="alert" className="ca-error">
          {error}
        </p>
      )}
      <footer className="ca-footer">
        <span role="status">{status}</span>
        {actions}
      </footer>
    </section>
  );
}
