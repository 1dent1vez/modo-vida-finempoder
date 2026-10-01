import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Sparkles } from 'lucide-react';

/**
 * Barra no bloqueante para el modo invitado (guest mode, Fase 0).
 * Aviso con voz de marca: explica que el progreso vive en el celular y
 * convida a crear cuenta para llevarlo a la nube. El usuario puede cerrarla
 * (tache) sin que esto afecte su progreso: el estado es local a la sesión de
 * la pestaña; al recargar vuelve a aparecer.
 */
export function GuestBanner() {
  const [closed, setClosed] = useState(false);
  if (closed) return null;

  return (
    <div
      role="status"
      className="flex items-start gap-3 px-4 py-3 text-sm bg-[var(--color-brand-secondary)] text-[var(--color-brand-text-on-secondary)]"
    >
      <Sparkles className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="flex-1">
        <p className="font-bold leading-tight">Estás explorando sin cuenta</p>
        <p className="mt-0.5 leading-snug">
          Tu avance se queda guardado en este celular. Crea una cuenta y llévatelo
          conectado a la nube (y desbloquea lo premium).
        </p>
        <Link
          to="/login"
          className="mt-2 inline-block rounded-md px-3 py-1.5 font-bold underline-offset-2 hover:underline bg-[var(--color-brand-primary)] text-white"
        >
          Crear cuenta
        </Link>
      </div>
      <button
        onClick={() => setClosed(true)}
        aria-label="Cerrar aviso"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-black/10 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
