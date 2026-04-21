export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-16 sm:pb-16">
      <a
        href="#main-content"
        className="absolute -left-[9999px] top-0 z-[9999] px-4 py-2 bg-[var(--color-brand-primary)] text-white focus:left-2 focus:top-2"
      >
        Saltar al contenido
      </a>
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <AppNavbar />
    </div>
  );
}

import { AppNavbar } from './AppNavbar';
