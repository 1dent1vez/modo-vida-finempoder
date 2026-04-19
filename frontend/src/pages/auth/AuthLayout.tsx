import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import logo from '../../assets/Logo.png';

interface AuthLayoutProps {
  headerLink?: ReactNode;
  children: ReactNode;
}

export default function AuthLayout({ headerLink, children }: AuthLayoutProps) {
  return (
    <div
      className="grid min-h-svh bg-white px-4"
      style={{
        gridTemplateRows: 'auto 1fr auto',
        paddingTop: 'calc(12px + env(safe-area-inset-top))',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <img src={logo} alt="FinEmpoder" className="h-7 w-7 rounded-full object-cover" />
          <span className="font-bold">FinEmpoder</span>
        </div>
        {headerLink}
      </div>

      {/* Contenido */}
      <div className="mx-auto mt-6 w-full max-w-md space-y-4">
        {children}
      </div>

      {/* Footer legal */}
      <p className="mt-4 text-center text-xs text-[var(--color-text-secondary)]">
        Al usar FinEmpoder aceptas los{' '}
        <Link to="/terms" className="font-semibold text-[var(--color-brand-secondary-dark)] hover:underline">
          Términos y Condiciones
        </Link>{' '}
        y la{' '}
        <Link to="/privacy" className="font-semibold text-[var(--color-brand-secondary-dark)] hover:underline">
          Política de Privacidad
        </Link>
        .
      </p>
    </div>
  );
}
