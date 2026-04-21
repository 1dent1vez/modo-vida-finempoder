import client from '../client';

export type QuestionnaireType = 'pre' | 'post';

export type QuestionnaireAnswerDTO = {
  questionId: string;
  questionText?: string;
  value: number;
};

export type QuestionnaireResultDTO = {
  type: QuestionnaireType;
  score: number;
  finempoderIndex: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ResearchStatusDTO = {
  preDone: boolean;
  postDone: boolean;
  preScore: number | null;
  postScore: number | null;
  moduleProgress: Record<string, number>;
  allModulesDone: boolean;
};

const questionnaireApi = {
  async submit(type: QuestionnaireType, answers: QuestionnaireAnswerDTO[]): Promise<QuestionnaireResultDTO> {
    const { data } = await client.post<QuestionnaireResultDTO>(`/questionnaire/${type}`, { answers });
    return data;
  },

  async getStatus(): Promise<ResearchStatusDTO> {
    const { data } = await client.get<ResearchStatusDTO>('/research/status/me');
    return data;
  },
};

export default questionnaireApi;
