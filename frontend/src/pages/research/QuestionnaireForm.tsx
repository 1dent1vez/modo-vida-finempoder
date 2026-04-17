// FinEmpoder — QuestionnaireForm
// Pre-test y Post-test: Likert 1-5 con etiquetas extremos, botón warning, header de marca.

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  Stack,
  Typography,
} from '@mui/material';
import { useState, type FormEvent } from 'react';
import type { Question } from './questions';
import { canSubmitQuestionnaire } from './questionnaireUtils';
import FECard from '../../components/FECard';
import logo from '../../assets/Logo.png';

export type QuestionnaireFormProps = {
  questions: Question[];
  title: string;
  onSubmit: (answers: { questionId: string; questionText: string; value: number }[]) => Promise<void>;
  submitting?: boolean;
};

const LIKERT_LABELS = ['1', '2', '3', '4', '5'] as const;

export function QuestionnaireForm({ questions, title, onSubmit, submitting }: QuestionnaireFormProps) {
  const [values, setValues] = useState<Record<string, number>>({});
  const allAnswered = questions.every((q) => values[q.id] !== undefined);

  const handleChange = (id: string, val: number) => {
    setValues((prev) => ({ ...prev, [id]: val }));
  };

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (!canSubmitQuestionnaire(allAnswered, submitting)) return;
    const answers = questions.map((q) => ({
      questionId: q.id,
      questionText: q.text,
      value: values[q.id],
    }));
    await onSubmit(answers);
  };

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        minHeight: '100svh',
        pt: `calc(12px + env(safe-area-inset-top))`,
        pb: `calc(24px + env(safe-area-inset-bottom))`,
      }}
    >
      {/* ── Header de marca ── */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ px: 3, pb: 2, bgcolor: 'background.paper', borderBottom: '1px solid #E5E7EB' }}
      >
        <Box
          component="img"
          src={logo}
          alt="FinEmpoder"
          sx={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
        />
        <Typography fontWeight={700}>FinEmpoder</Typography>
      </Stack>

      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ p: 2, pb: 4 }}>
        <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Indica qué tan de acuerdo estás con cada afirmación (1 = Muy en desacuerdo, 5 = Muy de acuerdo).
        </Typography>

        <Stack spacing={2}>
          {questions.map((q) => (
            <FECard key={q.id} variant="flat">
              <FormControl component="fieldset" fullWidth>
                <FormLabel sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                  {q.text}
                </FormLabel>
                {q.helper && (
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    {q.helper}
                  </Typography>
                )}

                {/* Etiquetas de extremos Likert */}
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.25 }}>
                  <Typography variant="caption" color="text.disabled">
                    Muy en desacuerdo
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    Muy de acuerdo
                  </Typography>
                </Stack>

                <RadioGroup
                  row
                  value={values[q.id] ?? ''}
                  onChange={(e) => handleChange(q.id, Number(e.target.value))}
                  sx={{ justifyContent: 'space-between' }}
                >
                  {LIKERT_LABELS.map((val) => (
                    <FormControlLabel
                      key={val}
                      value={Number(val)}
                      control={<Radio size="small" color="warning" />}
                      label={val}
                      labelPlacement="top"
                      sx={{ mx: 0, '& .MuiFormControlLabel-label': { fontSize: '0.75rem', fontWeight: 600 } }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </FECard>
          ))}
        </Stack>

        <Button
          variant="contained"
          color="warning"
          size="large"
          fullWidth
          sx={{ mt: 3, borderRadius: 3, textTransform: 'none', fontWeight: 800 }}
          disabled={!allAnswered || submitting}
          type="submit"
        >
          {submitting ? 'Enviando…' : '¡Enviar respuestas!'}
        </Button>
      </Box>
    </Box>
  );
}
