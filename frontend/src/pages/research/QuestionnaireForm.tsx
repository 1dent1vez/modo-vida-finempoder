// FinEmpoder — QuestionnaireForm
// Pre-test y Post-test: Likert 1-5 con etiquetas extremos, botón warning, header de marca.

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

const warnColor = 'var(--color-brand-warning)';

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
    <div
      className="bg-white min-h-svh"
      style={{
        paddingTop: 'calc(12px + env(safe-area-inset-top))',
        paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
      }}
    >
      {/* ── Header de marca ── */}
      <div className="flex items-center gap-2 px-6 pb-4 bg-white border-b border-[var(--color-border)]">
        <img
          src={logo}
          alt="FinEmpoder"
          className="w-7 h-7 rounded-full object-cover"
        />
        <p className="font-bold">FinEmpoder</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="p-4 pb-8">
        <p className="text-xl font-black mb-1">{title}</p>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          Indica qué tan de acuerdo estás con cada afirmación (1 = Muy en desacuerdo, 5 = Muy de acuerdo).
        </p>

        <div className="space-y-4">
          {questions.map((q) => (
            <FECard key={q.id} variant="flat">
              <fieldset>
                <legend className="font-bold text-[var(--color-text-primary)] mb-1">{q.text}</legend>
                {q.helper && (
                  <p className="text-xs text-[var(--color-text-secondary)] mb-2">{q.helper}</p>
                )}

                {/* Etiquetas de extremos Likert */}
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-[var(--color-text-secondary)]">Muy en desacuerdo</span>
                  <span className="text-xs text-[var(--color-text-secondary)]">Muy de acuerdo</span>
                </div>

                <div className="flex justify-between gap-1">
                  {LIKERT_LABELS.map((val) => {
                    const numVal = Number(val);
                    const isSelected = values[q.id] === numVal;
                    return (
                      <label
                        key={val}
                        className="flex flex-col items-center gap-1 cursor-pointer flex-1"
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={numVal}
                          checked={isSelected}
                          onChange={() => handleChange(q.id, numVal)}
                          className="sr-only"
                        />
                        <span
                          className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors"
                          style={{
                            borderColor: warnColor,
                            backgroundColor: isSelected ? warnColor : 'transparent',
                            color: isSelected ? 'white' : warnColor,
                          }}
                        >
                          {val}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </FECard>
          ))}
        </div>

        <button
          type="submit"
          disabled={!allAnswered || submitting}
          className="w-full mt-6 min-h-12 text-white rounded-2xl font-black text-base disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          style={{ backgroundColor: warnColor }}
        >
          {submitting ? 'Enviando…' : '¡Enviar respuestas!'}
        </button>
      </form>
    </div>
  );
}
