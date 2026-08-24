import { setAdminMode } from '@/lib/adminMode';

export default function AdminBanner() {
  return (
    <div
      role="status"
      className="fixed bottom-20 left-1/2 z-[2000] flex -translate-x-1/2 items-center gap-2 rounded-full bg-[var(--color-brand-warning)] px-4 py-2 text-xs font-bold text-white shadow-[var(--shadow-lg)]"
    >
      <span>🛠 MODO ADMIN</span>
      <button
        type="button"
        className="underline underline-offset-2 hover:opacity-80"
        onClick={() => setAdminMode(false)}
      >
        salir
      </button>
    </div>
  );
}
