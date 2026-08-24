const KEY = 'fe_admin_mode';

export function isAdminMode(): boolean {
  return typeof window !== 'undefined' && localStorage.getItem(KEY) === '1';
}

export function setAdminMode(on: boolean): void {
  if (on) {
    localStorage.setItem(KEY, '1');
  } else {
    localStorage.removeItem(KEY);
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('fe:admin-mode'));
  }
}
