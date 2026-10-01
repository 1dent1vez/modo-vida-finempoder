import InvestmentPracticeLesson, { type PracticeConfig } from './InvestmentPracticeLesson';
const config: PracticeConfig = {
  id: 'L12',
  title: 'Rendimiento y poder adquisitivo',
  label: 'Lector de valor real',
  headings: [
    'Nominal y real responden preguntas distintas.',
    'Compara con supuestos claros.',
    'Reconoce los límites de la aproximación.',
    'Conserva una pregunta útil.',
  ],
  description:
    'Relaciona rendimiento, inflación y poder de compra sin incrustar datos que caducan.',
  cards: [
    {
      id: 'nominal',
      name: 'Valor nominal',
      text: 'Cantidad expresada en dinero corriente, antes de ajustar por cambios generales de precios.',
    },
    {
      id: 'inflation',
      name: 'Inflación',
      text: 'Cambio de un índice general de precios durante un periodo; tu experiencia personal puede ser distinta.',
    },
    {
      id: 'real',
      name: 'Valor real',
      text: 'Estimación del poder de compra después de considerar la inflación.',
    },
    {
      id: 'period',
      name: 'Mismo periodo',
      text: 'La comparación requiere tasas y fechas compatibles.',
    },
  ],
  prompt: 'Una inversión sube 5% y los precios generales también 5%. ¿Qué afirmas?',
  options: [
    'Duplicó su poder de compra',
    'Su poder de compra aproximado cambió poco',
    'Garantizó una ganancia real',
  ],
  questions: [
    {
      q: '¿Restar inflación del rendimiento siempre es exacto?',
      o: ['Sí', 'No; es una aproximación'],
      a: 1,
      feedback: 'La relación exacta usa cocientes y también depende de costos e impuestos.',
    },
    {
      q: '¿Qué debes alinear al comparar?',
      o: ['Periodos y definiciones', 'Colores de la gráfica'],
      a: 0,
      feedback: 'Tasas de periodos distintos producen una comparación engañosa.',
    },
    {
      q: '¿La inflación personal es idéntica al índice general?',
      o: ['Siempre', 'No necesariamente'],
      a: 1,
      feedback: 'Tu canasta puede cambiar distinto al promedio del índice.',
    },
  ],
  reviewTitle: 'Preguntaré cuánto cambia el poder de compra.',
  reviewText:
    'Compararé periodos equivalentes, costos, impuestos e inflación con fuentes vigentes y supuestos visibles.',
  key: 'investment_l12:real-return:v1',
  resultKey: 'l12_real_return',
  defaultAdvice:
    'Una tasa nominal positiva no describe por sí sola el cambio en poder adquisitivo.',
};
export default function L12() {
  return <InvestmentPracticeLesson config={config} />;
}
