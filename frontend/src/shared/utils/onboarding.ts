const LEGACY_KEY = 'fe_onboarded';
const KEY_PREFIX = 'fe_onboarded_user_';

const keyForUser = (userId?: string, email?: string) => {
  if (userId) return `${KEY_PREFIX}${userId}`;
  if (email) return `${KEY_PREFIX}${email}`;
  return LEGACY_KEY;
};

export const isOnboarded = (userId?: string, email?: string) => {
  const key = keyForUser(userId, email);
  if (!key) return false;
  return localStorage.getItem(key) === '1' || localStorage.getItem(LEGACY_KEY) === '1';
};

export const setOnboarded = (userId?: string, email?: string) => {
  const key = keyForUser(userId, email);
  if (!key) return;
  localStorage.setItem(key, '1');
  if (localStorage.getItem(LEGACY_KEY)) {
    localStorage.removeItem(LEGACY_KEY);
  }
  import('./analytics').then((m) => m.trackOnboardingCompleted());
};

export const clearOnboarded = (userId?: string, email?: string) => {
  const key = keyForUser(userId, email);
  if (key) localStorage.removeItem(key);
  localStorage.removeItem(LEGACY_KEY);
};
