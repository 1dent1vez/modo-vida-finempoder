import { Box, Button, Stack } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import LockIcon from '@mui/icons-material/Lock';
import FECard from '../../components/FECard';
import FinniMessage from '../../components/FinniMessage';

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
    <FECard variant="flat" sx={{ mt: 3 }}>
      <FinniMessage
        variant="warning"
        title="Leccion bloqueada"
        message={
          requiredLessonId
            ? `Primero completa ${requiredLessonId} para desbloquear esta leccion.`
            : 'Primero completa la leccion anterior para desbloquear esta leccion.'
        }
      />
      <Box sx={{ mt: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
          {requiredLessonId && (
            <Button
              variant="contained"
              color="warning"
              startIcon={<LockIcon />}
              onClick={() => onGoRequiredLesson(requiredLessonId)}
              sx={{ minHeight: 44, minWidth: { sm: 140 } }}
            >
              Ir a {requiredLessonId}
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={onGoOverview}
            sx={{ minHeight: 44, minWidth: { sm: 160 } }}
          >
            Menu del modulo
          </Button>
        </Stack>
      </Box>
    </FECard>
  );
}
