import { Lock, CheckCircle, HelpCircle, Play, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '../../shared/components/ui/badge';
import type { LessonStatus, ModuleLesson } from '../moduleFlow';

type ModuleLessonListProps = {
  lessons: ModuleLesson[];
  lessonStatuses: Record<string, LessonStatus>;
  requiredLessonById: Record<string, string | null>;
  onOpenLesson: (lessonId: string) => void;
};

function KindIcon({ kind }: { kind: string }) {
  if (kind === 'quiz') return <HelpCircle className="h-4 w-4" />;
  if (kind === 'challenge') return <Flag className="h-4 w-4" />;
  return <Play className="h-4 w-4" />;
}

const statusText = (status: LessonStatus, requiredLessonId: string | null): string => {
  if (status === 'completed') return 'Completada';
  if (status === 'in_progress') return 'En progreso';
  if (status === 'available') return 'Disponible';
  return requiredLessonId ? `Bloqueada: completa ${requiredLessonId}` : 'Bloqueada';
};

function StatusBadge({ status }: { status: LessonStatus }) {
  if (status === 'completed') return <Badge variant="success">Listo</Badge>;
  if (status === 'in_progress') return <Badge variant="warning">Continuar</Badge>;
  if (status === 'available') return <Badge variant="warning">Empezar</Badge>;
  return <Badge variant="outline">Bloqueada</Badge>;
}

export function ModuleLessonList({
  lessons,
  lessonStatuses,
  requiredLessonById,
  onOpenLesson,
}: ModuleLessonListProps) {
  return (
    <ul className="divide-y divide-[var(--color-neutral-200)]">
      {lessons.map((lesson) => {
        const status = lessonStatuses[lesson.id] ?? 'locked';
        const completed = status === 'completed';
        const locked = status === 'locked';

        return (
          <li key={lesson.id}>
            <button
              onClick={() => onOpenLesson(lesson.id)}
              className={cn(
                'w-full flex items-center gap-3 py-4 text-left transition-colors hover:bg-[var(--color-neutral-50)]',
                locked && 'opacity-70'
              )}
            >
              {/* Avatar icono */}
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                  completed
                    ? 'bg-[var(--color-brand-success-bg)] text-[var(--color-brand-success)]'
                    : locked
                    ? 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-400)]'
                    : 'bg-[var(--color-brand-warning-bg)] text-[var(--color-brand-warning)]'
                )}
              >
                {completed ? <CheckCircle className="h-5 w-5" /> : locked ? <Lock className="h-4 w-4" /> : <KindIcon kind={lesson.kind} />}
              </div>

              {/* Texto */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs shrink-0">{lesson.id}</Badge>
                  <span className="font-bold text-sm truncate">{lesson.title}</span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  {statusText(status, requiredLessonById[lesson.id] ?? null)}
                </p>
              </div>

              <StatusBadge status={status} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
