import { describe, expect, it } from 'vitest';
import { shouldResetOnAuthEvent } from './sessionReset';

describe('shouldResetOnAuthEvent — O-2 (guest mode conserva progreso local)', () => {
  it('SIGNED_OUT → reset completo (cierre de sesión real con cuenta)', () => {
    expect(shouldResetOnAuthEvent('SIGNED_OUT')).toBe(true);
  });

  it('INITIAL_SESSION sin sesión → NO reset (primera carga o invitado)', () => {
    expect(shouldResetOnAuthEvent('INITIAL_SESSION')).toBe(false);
  });

  it('TOKEN_REFRESHED sin sesión → NO reset', () => {
    expect(shouldResetOnAuthEvent('TOKEN_REFRESHED')).toBe(false);
  });

  it('otros eventos sin sesión → NO reset', () => {
    expect(shouldResetOnAuthEvent('USER_UPDATED')).toBe(false);
    expect(shouldResetOnAuthEvent('PASSWORD_RECOVERY')).toBe(false);
    expect(shouldResetOnAuthEvent('')).toBe(false);
  });
});
