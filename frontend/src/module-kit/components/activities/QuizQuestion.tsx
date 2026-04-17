// FinEmpoder — QuizQuestion
// Wrapper de OptionCard[] para preguntas de opción múltiple.
// Gestiona selección y muestra feedback cuando se responde.

import { useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { OptionCard } from './OptionCard';

export interface QuizOption {
  id: string;
  label: string;
  explanation?: string;
}

export interface QuizQuestionProps {
  question: string;
  options: QuizOption[];
  /** Índice (id) de la opción correcta */
  correctId: string;
  /** Se llama cuando el usuario responde, con `true` si acertó */
  onAnswer?: (correct: boolean) => void;
  /** Si true, las opciones están deshabilitadas (ya respondido externamente) */
  answered?: boolean;
  /** Opción seleccionada externamente (para modo controlado) */
  selectedId?: string;
}

export function QuizQuestion({
  question,
  options,
  correctId,
  onAnswer,
  answered: answeredProp,
  selectedId: selectedIdProp,
}: QuizQuestionProps) {
  const [selectedId, setSelectedId] = useState<string | null>(selectedIdProp ?? null);
  const answered = answeredProp ?? selectedId !== null;

  const handleSelect = (id: string) => {
    if (answered) return;
    setSelectedId(id);
    onAnswer?.(id === correctId);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        {question}
      </Typography>
      <Stack spacing={2}>
        {options.map((opt) => {
          const isSelected = (selectedIdProp ?? selectedId) === opt.id;
          const isCorrect = answered && opt.id === correctId;
          const isIncorrect = answered && isSelected && opt.id !== correctId;

          return (
            <OptionCard
              key={opt.id}
              label={opt.label}
              selected={isSelected}
              correct={isCorrect || undefined}
              incorrect={isIncorrect || undefined}
              explanation={answered && (isCorrect || isIncorrect) ? opt.explanation : undefined}
              onSelect={() => handleSelect(opt.id)}
              disabled={answered}
            />
          );
        })}
      </Stack>
    </Box>
  );
}
