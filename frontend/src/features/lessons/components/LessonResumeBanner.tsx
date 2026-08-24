import FECard from '../../../shared/components/FECard';

type LessonResumeBannerProps = {
  step: number;
  onContinue: () => void;
  onRestart: () => void;
};

export function LessonResumeBanner({ step, onContinue, onRestart }: LessonResumeBannerProps) {
  return (
    <FECard
      variant="flat"
      className="mb-4 border-[var(--color-brand-accent)] bg-[var(--color-brand-accentBg)]"
    >
      <p className="text-sm font-bold text-[var(--color-text-primary)]">
        Te quedaste en el paso {step} de esta lección.
      </p>
      <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
        Puedes continuar donde te quedaste o empezar desde cero.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <button
          onClick={onContinue}
          className="min-h-10 rounded-xl bg-[var(--color-brand-primary)] px-4 text-sm font-semibold text-white"
        >
          Continuar donde te quedaste
        </button>
        <button
          onClick={onRestart}
          className="min-h-10 rounded-xl border border-[var(--color-neutral-300)] px-4 text-sm font-semibold text-[var(--color-text-secondary)]"
        >
          Empezar de nuevo
        </button>
      </div>
    </FECard>
  );
}
