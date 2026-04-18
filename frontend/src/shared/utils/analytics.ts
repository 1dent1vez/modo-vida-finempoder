type EventPayload = Record<string, unknown>;

const provider = {
  track: (name: string, payload?: EventPayload) => {
    if (import.meta.env.MODE === 'development') {
      console.info(`[analytics] ${name}`, payload ?? {});
    }
  },
};

export function trackEvent(name: string, payload?: EventPayload): void {
  provider.track(name, payload);
}

export function trackLessonCompleted(moduleId: string, lessonId: string): void {
  trackEvent('lesson_completed', { moduleId, lessonId });
}

export function trackModuleCompleted(moduleId: string): void {
  trackEvent('module_completed', { moduleId });
}

export function trackQuestionnaireSubmitted(type: 'pre' | 'post'): void {
  trackEvent('questionnaire_submitted', { type });
}

export function trackOnboardingCompleted(): void {
  trackEvent('onboarding_completed');
}
