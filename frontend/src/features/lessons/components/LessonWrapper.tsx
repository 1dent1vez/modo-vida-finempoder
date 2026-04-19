import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { MODULE_REGISTRY } from '@/content';

// Vite resolves these globs at build time — must be static strings
const MDX_LESSONS = import.meta.glob<{ default: ComponentType }>(
  '/src/content/*/*.mdx',
);
const TSX_LESSONS = import.meta.glob<{ default: ComponentType }>(
  '/src/pages/modules/*/lessons/*.tsx',
);

// Module-level cache so lazy() is only called once per lesson path
const lazyCache = new Map<string, LazyExoticComponent<ComponentType>>();

function getCachedLesson(
  key: string,
  loader: () => Promise<{ default: ComponentType }>,
): LazyExoticComponent<ComponentType> {
  const hit = lazyCache.get(key);
  if (hit) return hit;
  const component = lazy(loader);
  lazyCache.set(key, component);
  return component;
}

function PageLoader() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress />
    </Box>
  );
}

export function LessonWrapper() {
  const { moduleId, lessonId } = useParams<{ moduleId: string; lessonId: string }>();

  if (!moduleId || !lessonId) return <Navigate to="/app" replace />;
  if (!(moduleId in MODULE_REGISTRY)) return <Navigate to="/app" replace />;

  // MDX content takes priority; falls back to legacy TSX components
  const mdxKey = `/src/content/${moduleId}/${lessonId}.mdx`;
  const tsxKey = `/src/pages/modules/${moduleId}/lessons/${lessonId}.tsx`;

  const loader = MDX_LESSONS[mdxKey] ?? TSX_LESSONS[tsxKey];
  if (!loader) {
    const moduleConfig = MODULE_REGISTRY[moduleId as keyof typeof MODULE_REGISTRY];
    return <Navigate to={`/app/${moduleConfig.id}`} replace />;
  }

  const cacheKey = mdxKey in MDX_LESSONS ? mdxKey : tsxKey;
  const LessonContent = getCachedLesson(cacheKey, loader);

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <LessonContent />
      </Suspense>
    </ErrorBoundary>
  );
}
