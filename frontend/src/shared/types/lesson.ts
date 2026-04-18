export type LessonStatus = 'locked' | 'active' | 'completed';

export interface LessonProgress {
  id?: number;
  moduleId: string;
  lessonId: string;
  completed: boolean;
  score?: number;
  updatedAt: string;
  completedAt?: string;
}

export interface Lesson {
  id: string;
  title: string;
  moduleId: string;
  description?: string;
  status?: LessonStatus;
  completed?: boolean;
  score?: number;
}
