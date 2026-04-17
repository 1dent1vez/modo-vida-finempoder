import client from '../client';
import type { ModKey } from '../../store/progress';

export type ModuleProgressResponse = {
  moduleId: ModKey;
  lessonsCompleted: string[];
  totalLessons: number;
  progressPercent: number;
  gamification?: {
    xp: number;
    level: number;
    streakCurrent: number;
    streakBest: number;
    lastActiveISO?: string;
  };
};

export const progressApi = {
  async fetchModuleProgress(moduleId: ModKey): Promise<ModuleProgressResponse> {
    const { data } = await client.get<ModuleProgressResponse>(`/progress/${moduleId}`);
    return data;
  },
};

export default progressApi;
