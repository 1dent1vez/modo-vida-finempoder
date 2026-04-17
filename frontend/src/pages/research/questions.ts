export type Question = {
  id: string;
  text: string;
  helper?: string;
};

export const BASE_QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'Tengo claro cuánto ingreso y cuánto gasto cada mes.',
  },
  {
    id: 'q2',
    text: 'Llevo un registro de mis gastos y los reviso regularmente.',
  },
  {
    id: 'q3',
    text: 'Separo una parte fija de mis ingresos para ahorro.',
  },
  {
    id: 'q4',
    text: 'Entiendo las diferencias entre productos de ahorro e inversión.',
  },
  {
    id: 'q5',
    text: 'Me siento capaz de hacer un presupuesto realista y cumplirlo.',
  },
];
