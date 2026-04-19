import { Home, Lock } from 'lucide-react';
import FECard from '../../shared/components/FECard';
import FinniMessage from '../../shared/components/FinniMessage';
import { Button } from '../../shared/components/ui/button';

type LockedLessonScreenProps = {
  requiredLessonId: string | null;
  onGoRequiredLesson: (lessonId: string) => void;
  onGoOverview: () => void;
};

export function LockedLessonScreen({
  requiredLessonId,
  onGoRequiredLesson,
  onGoOverview,
}: LockedLessonScreenProps) {
  return (
    <FECard variant="flat" className="mt-3">
      <FinniMessage
        variant="warning"
        title="Lección bloqueada"
        message={
          requiredLessonId
            ? `Primero completa ${requiredLessonId} para desbloquear esta lección.`
            : 'Primero completa la lección anterior para desbloquear esta lección.'
        }
      />
      <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
        {requiredLessonId && (
          <Button
            variant="default"
            className="min-h-11 sm:min-w-36 bg-[var(--color-brand-warning)] hover:bg-[var(--color-brand-secondary-dark)]"
            onClick={() => onGoRequiredLesson(requiredLessonId)}
          >
            <Lock className="h-4 w-4" />
            Ir a {requiredLessonId}
          </Button>
        )}
        <Button variant="outline" className="min-h-11 sm:min-w-40" onClick={onGoOverview}>
          <Home className="h-4 w-4" />
          Menú del módulo
        </Button>
      </div>
    </FECard>
  );
}
