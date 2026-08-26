// F7-ONBOARDING: Preferencias del primer uso (persistencia local).
// El chip de confianza de Screen1 se guarda en localStorage bajo la misma
// convención de flags del repo ('fe_*'); Screen3 lo lee solo para sugerir la
// ruta inicial (sin bloquear contenido).

export type OnboardingConfianza = 'recien-empiezo' | 'ya-ahorro' | 'perdido';

export const ONBOARDING_PREFS_KEY = 'fe_onboarding_prefs';

export type OnboardingPrefs = {
  confianza: OnboardingConfianza;
};

const CONFIANZA_VALUES: OnboardingConfianza[] = ['recien-empiezo', 'ya-ahorro', 'perdido'];

export const ONBOARDING_CONFIANZA_OPTIONS: Array<{
  value: OnboardingConfianza;
  label: string;
}> = [
  { value: 'recien-empiezo', label: 'Recién empiezo' },
  { value: 'ya-ahorro', label: 'Ya ahorro, quiero mejorar' },
  { value: 'perdido', label: 'Me siento perdido con mi dinero' },
];

export function loadOnboardingPrefs(): OnboardingPrefs {
  try {
    const raw = localStorage.getItem(ONBOARDING_PREFS_KEY);
    if (!raw) return { confianza: 'recien-empiezo' };
    const parsed = JSON.parse(raw) as Partial<OnboardingPrefs>;
    if (parsed.confianza && CONFIANZA_VALUES.includes(parsed.confianza)) {
      return { confianza: parsed.confianza };
    }
    return { confianza: 'recien-empiezo' };
  } catch {
    return { confianza: 'recien-empiezo' };
  }
}

export function saveOnboardingConfianza(confianza: OnboardingConfianza): void {
  localStorage.setItem(ONBOARDING_PREFS_KEY, JSON.stringify({ confianza }));
}
