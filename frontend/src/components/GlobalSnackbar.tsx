import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useNotifications } from '../store/notifications';

const variantClass: Record<string, string> = {
  success: 'bg-[var(--color-brand-success)]',
  error: 'bg-[var(--color-brand-error)]',
  warning: 'bg-[var(--color-brand-warning)]',
  info: 'bg-[var(--color-brand-info)]',
};

export default function GlobalSnackbar() {
  const queue = useNotifications((s) => s.queue);
  const dequeue = useNotifications((s) => s.dequeue);
  const [visible, setVisible] = useState(false);

  const current = queue[0];

  useEffect(() => {
    if (current) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(dequeue, 300);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [current, dequeue]);

  if (!current) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed bottom-20 left-1/2 z-[2000] -translate-x-1/2 rounded-xl px-5 py-3 text-sm font-medium text-white shadow-[var(--shadow-lg)] transition-all duration-300',
        variantClass[current.severity ?? 'info'],
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      )}
    >
      {current.message}
    </div>
  );
}
