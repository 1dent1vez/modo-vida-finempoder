/**
 * Decisión de reset del progreso local ante eventos de auth sin sesión (O-2).
 *
 * Guest mode: un invitado legítimo (sin cuenta) dispara onAuthStateChange sin
 * sesión al recargar (INITIAL_SESSION/TOKEN_REFRESHED con session null). En
 * esos casos NO se debe borrar la racha/escudos/progreso local. El reset
 * completo (progress + lessons + query cache) solo ocurre en un cierre de
 * sesión real con cuenta (SIGNED_OUT).
 */
export function shouldResetOnAuthEvent(event: string): boolean {
  return event === 'SIGNED_OUT';
}
