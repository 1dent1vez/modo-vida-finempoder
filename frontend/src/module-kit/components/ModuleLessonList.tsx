import {
  Avatar,
  Chip,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import QuizIcon from '@mui/icons-material/Quiz';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import type { LessonStatus, ModuleLesson } from '../moduleFlow';

type ModuleLessonListProps = {
  lessons: ModuleLesson[];
  lessonStatuses: Record<string, LessonStatus>;
  requiredLessonById: Record<string, string | null>;
  onOpenLesson: (lessonId: string) => void;
};

function KindIcon({ kind }: { kind: string }) {
  if (kind === 'quiz') return <QuizIcon />;
  if (kind === 'simulator') return <PlayArrowIcon />;
  if (kind === 'challenge') return <SportsScoreIcon />;
  return <PlayArrowIcon />;
}

const statusText = (status: LessonStatus, requiredLessonId: string | null): string => {
  if (status === 'completed') return 'Completada';
  if (status === 'in_progress') return 'En progreso';
  if (status === 'available') return 'Disponible';
  return requiredLessonId ? `Bloqueada: completa ${requiredLessonId}` : 'Bloqueada';
};

const statusChip = (status: LessonStatus) => {
  if (status === 'completed') return <Chip color="success" size="small" label="Listo" />;
  if (status === 'in_progress') return <Chip size="small" label="Continuar" color="warning" />;
  if (status === 'available') return <Chip size="small" label="Empezar" sx={{ bgcolor: 'warning.light' }} />;
  return <Chip size="small" icon={<LockIcon />} label="Bloqueada" variant="outlined" />;
};

export function ModuleLessonList({
  lessons,
  lessonStatuses,
  requiredLessonById,
  onOpenLesson,
}: ModuleLessonListProps) {
  return (
    <List disablePadding>
      {lessons.map((lesson, idx) => {
        const status = lessonStatuses[lesson.id] ?? 'locked';
        const completed = status === 'completed';
        const locked = status === 'locked';

        return (
          <ListItemButton
            key={lesson.id}
            onClick={() => onOpenLesson(lesson.id)}
            sx={{
              py: 3,
              minHeight: 56,
              opacity: locked ? 0.72 : 1,
              borderBottom: idx < lessons.length - 1 ? '1px solid' : 'none',
              borderColor: 'divider',
            }}
          >
            <ListItemAvatar>
              <Avatar
                sx={{
                  bgcolor: completed ? 'success.light' : locked ? 'grey.200' : 'warning.light',
                  color: completed ? 'success.main' : locked ? 'text.secondary' : 'warning.main',
                  fontWeight: 800,
                }}
              >
                {completed ? <CheckCircleIcon /> : <KindIcon kind={lesson.kind} />}
              </Avatar>
            </ListItemAvatar>

            <ListItemText
              primary={
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Chip label={lesson.id} size="small" variant="outlined" />
                  <Typography fontWeight={700}>{lesson.title}</Typography>
                </Stack>
              }
              secondary={
                <Typography variant="caption" color="text.secondary">
                  {statusText(status, requiredLessonById[lesson.id] ?? null)}
                </Typography>
              }
            />

            {statusChip(status)}
          </ListItemButton>
        );
      })}
    </List>
  );
}
