import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuestionnaireForm } from './QuestionnaireForm';
import { BASE_QUESTIONS } from './questions';
import { useQuestionnaireSubmit } from '../../hooks/research/useResearchStatus';
import { useNotifications } from '../../store/notifications';
import { useAuth } from '../../store/auth';
import { isOnboarded } from '@/shared/utils/onboarding';
import { nextRouteFromStatus } from '@/shared/utils/researchGate';
import { useQueryClient } from '@tanstack/react-query';
import type { ResearchStatusDTO } from '../../api/questionnaire/questionnaire.api';

export default function PreTest() {
  const navigate = useNavigate();
  const notify = useNotifications((s) => s.enqueue);
  const submit = useQuestionnaireSubmit('pre');
  const hydrated = useAuth((s) => s.hydrated);
  const token = useAuth((s) => s.token);
  const user = useAuth((s) => s.user);
  const qc = useQueryClient();
  const locked = useRef(false);

  useEffect(() => {
    if (submit.isSuccess) {
      navigate('/app', { replace: true });
    }
  }, [submit.isSuccess, navigate]);

  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    if (user && !isOnboarded(user.id, user.email)) {
      navigate('/onboarding/1', { replace: true });
    }
  }, [hydrated, token, user, navigate]);

  const handleSubmit = async (answers: { questionId: string; questionText: string; value: number }[]) => {
    if (locked.current || submit.isPending) return;
    try {
      locked.current = true;
      await submit.mutateAsync(answers);
      notify('¡Respuestas guardadas! Gracias por responder.', 'success');
      const status =
        (qc.getQueryData<ResearchStatusDTO>(['research', 'status']) as ResearchStatusDTO | undefined) ?? {
          preDone: true,
          postDone: false,
          allModulesDone: false,
          preScore: null,
          postScore: null,
          moduleProgress: {},
        };
      const onboardingDone = user ? isOnboarded(user.id, user.email) : true;
      const next = nextRouteFromStatus({ preDone: true, postDone: status.postDone, allModulesDone: status.allModulesDone }, onboardingDone);
      setTimeout(() => navigate(next, { replace: true }), 1500);
    } catch {
      notify('No se pudo enviar el pre-test. Intentalo de nuevo.', 'error');
      locked.current = false;
    }
  };

  if (!hydrated || !token) return null;

  return (
    <QuestionnaireForm
      title="Diagnostico inicial (Pre-test)"
      questions={BASE_QUESTIONS}
      submitting={submit.isPending}
      onSubmit={handleSubmit}
    />
  );
}
