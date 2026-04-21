import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../store/auth';
import type { QuestionnaireType, QuestionnaireResultDTO } from '../../api/questionnaire/questionnaire.api';

export function useQuestionnaire(type: QuestionnaireType) {
  const token = useAuth((s) => s.token);
  const userId = useAuth((s) => s.user?.id);

  return useQuery<QuestionnaireResultDTO>({
    queryKey: ['questionnaire', type, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questionnaire_results')
        .select('type, score, finempoderindex, created_at, updated_at')
        .eq('user_id', userId!)
        .eq('type', type)
        .single();

      if (error || !data) throw new Error('No encontrado');

      return {
        type: data.type as QuestionnaireType,
        score: data.score,
        finempoderIndex: data.finempoderindex,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    },
    retry: false,
    enabled: !!token && !!userId,
  });
}
