// Re-export unificado — lógica en module-kit/components/LessonShell.tsx
import { LessonShell as UnifiedShell, type LessonShellCoreProps } from '../../../module-kit/components/LessonShell';
import { BUDGET_MODULE_CONFIG } from './lessonFlow';

export default function LessonShell(props: LessonShellCoreProps) {
  return <UnifiedShell moduleId="presupuesto" config={BUDGET_MODULE_CONFIG} {...props} />;
}
