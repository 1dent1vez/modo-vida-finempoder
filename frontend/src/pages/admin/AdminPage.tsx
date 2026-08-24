import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdminMode, setAdminMode } from '@/lib/adminMode';
import { db } from '@/db/finempoderDb';
import { Button } from '@/shared/components/ui/button';

const ADMIN_PIN = '2026';

export default function AdminPage() {
  const nav = useNavigate();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [cleaned, setCleaned] = useState(false);
  const [admin, setAdmin] = useState(isAdminMode());

  const handleActivate = () => {
    if (pin === ADMIN_PIN) {
      setAdminMode(true);
      nav('/app', { replace: true });
    } else {
      setError(true);
      setPin('');
    }
  };

  const handleDeactivate = () => {
    setAdminMode(false);
    setAdmin(false);
    setCleaned(false);
  };

  const handleClearProgress = async () => {
    const ok = window.confirm(
      'Esto borrará el progreso de lecciones y los datos de lección guardados en este dispositivo. ¿Continuar?'
    );
    if (!ok) return;
    await db.lessonProgress.clear();
    await db.userLessonData.clear();
    setCleaned(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-app)] p-6">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 shadow-[var(--shadow-md)]">
        <h1 className="mb-1 text-center text-xl font-extrabold text-[var(--color-text-primary)]">
          Modo administrador
        </h1>
        <p className="mb-6 text-center text-sm text-[var(--color-text-secondary)]">
          Acceso de pruebas para el dueño.
        </p>

        {admin ? (
          <div className="space-y-4">
            <p className="rounded-xl bg-[var(--color-brand-success-bg)] px-4 py-3 text-center text-sm font-bold text-[var(--color-brand-success)]">
              ✓ Modo admin activo
            </p>
            <Button variant="secondary" className="w-full" onClick={handleDeactivate}>
              Desactivar
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => void handleClearProgress()}
            >
              Limpiar progreso local
            </Button>
            {cleaned && (
              <p className="text-center text-xs font-semibold text-[var(--color-brand-success)]">
                Progreso de lecciones y datos de lección eliminados.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              autoComplete="off"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleActivate();
              }}
              placeholder="PIN"
              aria-label="PIN"
              className="h-12 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-app)] px-4 text-center text-lg font-bold tracking-[0.5em] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]"
            />
            {error && (
              <p className="text-center text-sm font-semibold text-[var(--color-brand-error)]">
                PIN incorrecto
              </p>
            )}
            <Button className="w-full" onClick={handleActivate}>
              Activar modo admin
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
