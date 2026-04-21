import { useState } from 'react';
import { OptionCard } from './OptionCard';

export interface QuizOption {
  id: string;
  label: string;
  explanation?: string;
}

export interface QuizQuestionProps {
  question: string;
  options: QuizOption[];
  correctId: string;
  onAnswer?: (correct: boolean) => void;
  answered?: boolean;
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
    <div>
      <h3 className="text-base font-bold mb-4">{question}</h3>
      <div className="space-y-3">
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
      </div>
    </div>
  );
}
