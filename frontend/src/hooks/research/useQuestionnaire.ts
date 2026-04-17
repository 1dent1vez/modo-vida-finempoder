import { useQuery } from '@tanstack/react-query';
import questionnaireApi, { type QuestionnaireType, type QuestionnaireResultDTO } from '../../api/questionnaire/questionnaire.api';
import { useAuth } from '../../store/auth';

export function useQuestionnaire(type: QuestionnaireType) {
  const token = useAuth((s) => s.token);
  return useQuery<QuestionnaireResultDTO>({
    queryKey: ['questionnaire', type],
    queryFn: () => questionnaireApi.getMine(type),
    retry: false,
    enabled: !!token,
  });
}
