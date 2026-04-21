import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import questionnaireApi, {
  type QuestionnaireAnswerDTO,
  type QuestionnaireResultDTO,
  type QuestionnaireType,
  type ResearchStatusDTO,
} from '../../api/questionnaire/questionnaire.api';
import { trackQuestionnaireSubmitted } from '@/shared/utils/analytics';
import { useAuth } from '../../store/auth';

const emptyStatus: ResearchStatusDTO = {
  preDone: false,
  postDone: false,
  preScore: null,
  postScore: null,
  moduleProgress: {},
  allModulesDone: false,
};

export function useResearchStatus() {
  const token = useAuth((s) => s.token);
  return useQuery({
    queryKey: ['research', 'status'],
    queryFn: () => questionnaireApi.getStatus(),
    enabled: !!token,
    staleTime: 1000 * 60,
  });
}

export function useQuestionnaireSubmit(type: QuestionnaireType) {
  const qc = useQueryClient();
  return useMutation<QuestionnaireResultDTO, Error, QuestionnaireAnswerDTO[]>({
    mutationFn: (answers) => questionnaireApi.submit(type, answers),
    onSuccess: (result) => {
      qc.setQueryData<ResearchStatusDTO>(['research', 'status'], (prev) => {
        const base = prev ?? emptyStatus;
        if (type === 'pre') {
          return { ...base, preDone: true, preScore: result.score };
        }
        return { ...base, postDone: true, postScore: result.score };
      });
      qc.invalidateQueries({ queryKey: ['research', 'status'] });
      qc.invalidateQueries({ queryKey: ['questionnaire', type] });
    },
    onSettled: (data) => {
      if (data) trackQuestionnaireSubmitted(type);
    },
  });
}
