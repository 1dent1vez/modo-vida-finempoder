import { useMemo, useState } from 'react';
import { Check, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import FinniMessage from '../../shared/components/FinniMessage';
import { isAdminMode } from '../../lib/adminMode';
import type { ModuleFlowConfig, ModuleLesson } from '../moduleFlow';
import { getPathNodeStates, type LessonNodeState } from '../lessonPathState';

const PATH_WELCOME = [
  '¿Listo para tu siguiente paso?',
  'Cada paso cuenta. ¡Sigue así!',
  'Pequeños pasos construyen grandes hábitos.',
];

const LOCKED_MESSAGE = 'Completa la anterior para desbloquear';

export interface LessonPathProps {
  config: ModuleFlowConfig;
  completedMap: Record<string, boolean>;
  onNavigate: (lessonId: string) => void;
}

type MiniNode = { lesson: ModuleLesson; state: LessonNodeState };

function NodeIcon({ state, number }: { state: LessonNodeState; number: number }) {
  if (state === 'completed') return <Check className="h-5 w-5" />;
  if (state === 'locked') return <Lock className="h-4 w-4" />;
  return <span className="text-sm font-extrabold">{number}</span>;
}

/**
 * Sendero vertical estilo HelloChinese: una columna con nodos alternando
 * lado izquierdo/derecho y línea conectora central (columna simple en
 * pantallas angostas). El estado se deriva con getLessonNodeState, que usa
 * getRequiredLessonId (única fuente de bloqueo, respeta modo admin).
 */
export function LessonPath({ config, completedMap, onNavigate }: LessonPathProps) {
  const states = useMemo(() => getPathNodeStates(config, completedMap), [config, completedMap]);
  const [lockedMessageId, setLockedMessageId] = useState<string | null>(null);
  const [welcomeIndex] = useState(() => Math.floor(Math.random() * PATH_WELCOME.length));
  const admin = isAdminMode();

  const handleTap = (lessonId: string) => {
    if (states[lessonId] === 'locked' && !admin) {
      setLockedMessageId(lessonId);
      return;
    }
    onNavigate(lessonId);
  };

  let pulseAssigned = false;

  return (
    <div>
      <FinniMessage variant="coach" message={PATH_WELCOME[welcomeIndex]} />

      <div className="relative mx-auto mt-4 max-w-lg">
        {/* Línea conectora central */}
        <div
          aria-hidden="true"
          className="absolute bottom-4 left-1/2 top-4 w-[3px] -translate-x-1/2 rounded-full bg-[var(--color-neutral-200)]"
        />

        <ol className="relative">
          {config.lessons.map((lesson, index) => {
            const state = states[lesson.id];
            const side = index % 2 === 0 ? 'left' : 'right';
            const isPulse = state === 'current' && !pulseAssigned;
            if (isPulse) pulseAssigned = true;

            return (
              <li
                key={lesson.id}
                className="relative flex flex-col items-center gap-1 py-2 sm:flex-row sm:justify-between"
              >
                {/* Título: alterna lado en sm+, centrado debajo en móvil */}
                <div
                  className={cn(
                    'order-2 w-full sm:order-1 sm:w-[calc(50%-40px)]',
                    side === 'right' && 'sm:order-2',
                    side === 'left' ? 'sm:text-left' : 'sm:text-right'
                  )}
                >
                  <p className="text-center text-xs font-bold text-[var(--color-text-secondary)] sm:text-left">
                    {lesson.id}
                  </p>
                  <p
                    className={cn(
                      'truncate text-center text-sm sm:text-left',
                      state === 'locked'
                        ? 'text-[var(--color-text-muted)]'
                        : 'font-semibold text-[var(--color-text-primary)]',
                      side === 'right' && 'sm:text-right'
                    )}
                  >
                    {lesson.title}
                  </p>
                </div>

                {/* Nodo */}
                <button
                  type="button"
                  onClick={() => handleTap(lesson.id)}
                  aria-label={`${lesson.id}: ${lesson.title}${
                    state === 'locked' && !admin ? ' (bloqueada)' : ''
                  }`}
                  className={cn(
                    'finni-path-node z-10 order-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition-colors sm:order-none',
                    state === 'completed' &&
                      'border-[var(--color-brand-success)] bg-[var(--color-brand-success-bg)] text-[var(--color-brand-success)]',
                    state === 'current' &&
                      'border-[var(--color-brand-primary)] bg-white text-[var(--color-brand-primary)]',
                    state === 'current' && !isPulse && 'opacity-80',
                    state === 'locked' &&
                      'border-[var(--color-neutral-300)] bg-[var(--color-neutral-100)] text-[var(--color-neutral-400)]',
                    isPulse && 'finni-node-pulse'
                  )}
                >
                  <NodeIcon state={state} number={index + 1} />
                </button>

                {/* Espacio espejo en sm+ */}
                <div className="hidden sm:block sm:w-[calc(50%-40px)]" aria-hidden="true" />
              </li>
            );
          })}
        </ol>
      </div>

      {lockedMessageId && (
        <div
          role="status"
          className="mt-3 rounded-xl border-l-4 border-[var(--color-brand-warning)] bg-[var(--color-status-warningBg)] px-3 py-2.5 text-sm font-semibold text-[var(--color-brand-warning)]"
        >
          {LOCKED_MESSAGE}
        </div>
      )}
    </div>
  );
}

/**
 * Resumen compacto de un módulo para Home: nodos-chico de la lección
 * anterior (completada), la actual y la siguiente.
 */
export function ModuleMiniPath({
  config,
  completedMap,
  onNavigate,
}: LessonPathProps) {
  const states = useMemo(() => getPathNodeStates(config, completedMap), [config, completedMap]);
  const currentIndex = config.lessons.findIndex((lesson) => states[lesson.id] === 'current');

  const nodes: MiniNode[] = [];
  if (currentIndex === -1 && config.lessons.length > 0) {
    nodes.push({ lesson: config.lessons[config.lessons.length - 1], state: 'completed' });
  }
  if (currentIndex > 0) {
    nodes.push({ lesson: config.lessons[currentIndex - 1], state: states[config.lessons[currentIndex - 1].id] });
  }
  if (currentIndex >= 0) {
    nodes.push({ lesson: config.lessons[currentIndex], state: 'current' });
  }
  if (currentIndex >= 0 && currentIndex < config.lessons.length - 1) {
    const next = config.lessons[currentIndex + 1];
    nodes.push({ lesson: next, state: states[next.id] });
  }

  return (
    <div className="flex items-center gap-1.5" role="list" aria-label="Mini camino de lecciones">
      {nodes.map(({ lesson, state }, index) => {
        const isLocked = state === 'locked';
        return (
          <button
            key={lesson.id}
            type="button"
            onClick={() => {
              if (!isLocked) onNavigate(lesson.id);
            }}
            aria-label={`${lesson.id}: ${lesson.title}${isLocked ? ' (bloqueada)' : ''}`}
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 text-xs font-extrabold transition-colors',
              state === 'completed' &&
                'border-[var(--color-brand-success)] bg-[var(--color-brand-success-bg)] text-[var(--color-brand-success)]',
              state === 'current' &&
                'border-[var(--color-brand-primary)] bg-white text-[var(--color-brand-primary)]',
              state === 'current' && 'finni-node-pulse',
              isLocked &&
                'border-[var(--color-neutral-300)] bg-[var(--color-neutral-100)] text-[var(--color-neutral-400)] opacity-80'
            )}
          >
            {state === 'completed' ? <Check className="h-4 w-4" /> : isLocked ? <Lock className="h-3.5 w-3.5" /> : index + 1}
          </button>
        );
      })}
    </div>
  );
}
