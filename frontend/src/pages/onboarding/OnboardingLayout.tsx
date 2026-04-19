import logo from '../../assets/Logo.png';

type Props = {
  img: string;
  title: string;
  body: string;
  step: 1 | 2 | 3;
  primaryLabel: string;
  onPrimary: () => void;
  onSkip?: () => void;
};

export default function OnboardingLayout({
  img, title, body, step, primaryLabel, onPrimary, onSkip,
}: Props) {
  return (
    <div
      className="grid min-h-svh px-6 bg-white text-[var(--color-text-primary)]"
      style={{
        gridTemplateRows: 'auto auto 1fr auto auto',
        paddingTop: 'calc(12px + env(safe-area-inset-top))',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <img src={logo} alt="FinEmpoder" className="h-7 w-7 rounded-full object-cover" />
        <span className="font-bold">FinEmpoder</span>
      </div>

      {/* Ilustración */}
      <div className="grid place-items-center mt-2">
        <img
          src={img}
          alt=""
          className="h-auto w-[78vw] max-w-[360px]"
        />
      </div>

      {/* Texto */}
      <div className="mt-2 flex flex-col gap-3 text-center">
        <h1 className="text-lg font-extrabold text-[var(--color-brand-secondary-dark)]">{title}</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">{body}</p>
      </div>

      {/* Indicadores */}
      <div className="my-5 flex justify-center gap-2">
        {([1, 2, 3] as const).map((s) => (
          <div
            key={s}
            className={`h-2 w-2 rounded-full transition-colors ${
              step === s ? 'bg-[var(--color-brand-secondary-dark)]' : 'bg-black/25'
            }`}
          />
        ))}
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onSkip}
          className="text-sm font-bold uppercase tracking-wide text-[var(--color-brand-secondary)] disabled:invisible"
          disabled={!onSkip}
        >
          {onSkip ? 'Saltar' : ''}
        </button>

        <button
          onClick={onPrimary}
          className="shrink-0 rounded-full px-7 py-3 font-extrabold text-white shadow-[0_12px_28px_rgba(243,156,18,.35)] bg-gradient-to-b from-[#F5B041] to-[#F39C12] hover:from-[#F0A030] hover:to-[#E08E0E] transition-all"
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  );
}
