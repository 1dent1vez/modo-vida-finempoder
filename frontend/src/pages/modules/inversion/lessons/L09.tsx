import InvestmentPracticeLesson, { type PracticeConfig } from './InvestmentPracticeLesson';
const config: PracticeConfig = {
  id: 'L09',
  title: 'Diversificación y concentración',
  label: 'Laboratorio de concentración',
  headings: [
    'Diversificar requiere mirar fuentes de riesgo.',
    'Evalúa qué podría caer al mismo tiempo.',
    'Distingue cantidad de diversificación.',
    'Conserva una regla útil.',
  ],
  description: 'Analiza concentración sin inventar rendimientos ni imponer porcentajes por edad.',
  cards: [
    {
      id: 'issuer',
      name: 'Emisor',
      text: 'Varias posiciones del mismo emisor pueden conservar una concentración importante.',
    },
    {
      id: 'sector',
      name: 'Sector',
      text: 'Empresas distintas pueden responder al mismo riesgo económico.',
    },
    {
      id: 'asset',
      name: 'Tipo de activo',
      text: 'Combinar exposiciones distintas puede cambiar el patrón de resultados.',
    },
    {
      id: 'region',
      name: 'Región y moneda',
      text: 'La ubicación y la moneda añaden riesgos que conviene identificar.',
    },
  ],
  prompt: 'Un portafolio tiene diez posiciones del mismo sector. ¿Qué observas?',
  options: [
    'Está diversificado por tener diez',
    'Conserva concentración sectorial',
    'No se puede perder dinero',
  ],
  questions: [
    {
      q: '¿Diversificar elimina las pérdidas?',
      o: ['Sí', 'No; distribuye exposiciones, pero conserva riesgos'],
      a: 1,
      feedback: 'La diversificación no garantiza ganancias ni evita todas las caídas.',
    },
    {
      q: '¿Contar posiciones basta?',
      o: ['Sí', 'No; importa qué riesgos comparten'],
      a: 1,
      feedback: 'La relación entre posiciones puede importar más que su cantidad.',
    },
    {
      q: '¿Existe un porcentaje universal por edad?',
      o: ['Sí', 'No; requiere contexto personal'],
      a: 1,
      feedback: 'Edad aislada no sustituye metas, capacidad, plazo y condiciones.',
    },
  ],
  reviewTitle: 'Diversificar es distribuir fuentes de riesgo.',
  reviewText:
    'Compararé emisor, sector, activo, región, moneda, costos y relación entre posiciones.',
  key: 'investment_l9:diversification:v1',
  resultKey: 'l09_diversification',
  defaultAdvice:
    'Más posiciones no siempre significan más diversificación; pueden moverse por la misma causa.',
};
export default function L09() {
  return <InvestmentPracticeLesson config={config} />;
}
