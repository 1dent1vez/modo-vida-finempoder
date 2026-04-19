import type { ModuleLessonKind } from '@/module-kit/moduleFlow';

export type LessonKind = ModuleLessonKind;

export interface LessonMeta {
  id: string;
  title: string;
  order: number;
  xp: number;
  kind: LessonKind;
  duration?: string;
}

export interface ModuleContentConfig {
  id: string;
  title: string;
  description: string;
  lessons: LessonMeta[];
}
