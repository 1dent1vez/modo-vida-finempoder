const ONBOARDING_PATHS = ['/onboarding/1', '/onboarding/2', '/onboarding/3'];

export const evaluateResearchGate = (
  pathname: string,
  status?: { preDone: boolean; postDone: boolean; allModulesDone: boolean },
  onboardingDone: boolean = true
) => {
  if (!status) return '/login';
  if (!status.preDone && pathname !== '/research/pretest') return '/research/pretest';
  if (status.allModulesDone && !status.postDone && pathname !== '/research/posttest') return '/research/posttest';
  if (!onboardingDone && !ONBOARDING_PATHS.includes(pathname)) return '/onboarding/1';
  return null;
};

export const nextRouteFromStatus = (
  status: { preDone: boolean; postDone: boolean; allModulesDone: boolean },
  onboardingDone: boolean = true
) => evaluateResearchGate('/app', status, onboardingDone) ?? '/app';
