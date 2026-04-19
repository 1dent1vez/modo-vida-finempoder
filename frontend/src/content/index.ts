import { moduleConfig as presupuesto } from './presupuesto/module.config';
import { moduleConfig as ahorro } from './ahorro/module.config';
import { moduleConfig as inversion } from './inversion/module.config';
import type { ModuleContentConfig } from './types';

export type { ModuleContentConfig, LessonMeta, LessonKind } from './types';

export const MODULE_REGISTRY = {
  presupuesto,
  ahorro,
  inversion,
} as const satisfies Record<string, ModuleContentConfig>;

export type ModuleId = keyof typeof MODULE_REGISTRY;
