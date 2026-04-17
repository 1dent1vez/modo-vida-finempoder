export const canSubmitQuestionnaire = (allAnswered: boolean, submitting?: boolean) =>
  allAnswered && !submitting;
