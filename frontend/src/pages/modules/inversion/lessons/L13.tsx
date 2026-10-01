import InvestmentPracticeLesson, { type PracticeConfig } from './InvestmentPracticeLesson';
const config: PracticeConfig = {
  id: 'L13',
  title: 'Borrador de un plan de inversión',
  label: 'Constructor de criterios',
  headings: [
    'Un plan empieza antes del producto.',
    'Define la decisión pendiente.',
    'Comprueba que el plan admite incertidumbre.',
    'Guarda un borrador para investigar.',
  ],
  description:
    'Construye una ficha de objetivo, plazo, aportes, liquidez y revisión sin recomendar instrumentos.',
  cards: [
    { id: 'goal', name: 'Objetivo', text: 'Qué quieres financiar y qué tan flexible es la meta.' },
    {
      id: 'amount',
      name: 'Aportes',
      text: 'Cantidad inicial y periódica que no compromete necesidades ni obligaciones.',
    },
    {
      id: 'horizon',
      name: 'Plazo',
      text: 'Fecha estimada, margen para cambios y momentos de revisión.',
    },
    {
      id: 'liquidity',
      name: 'Liquidez',
      text: 'Cuánto podrías necesitar retirar y bajo qué condiciones.',
    },
    {
      id: 'risk',
      name: 'Incertidumbre',
      text: 'Pérdida o variación que el plan debe poder soportar.',
    },
    {
      id: 'evidence',
      name: 'Evidencia',
      text: 'Documentos, costos, riesgos y registros que faltan por verificar.',
    },
  ],
  prompt: '¿Qué producto incluye este borrador?',
  options: [
    'Uno recomendado por la app',
    'Ninguno todavía; primero define criterios',
    'El de mayor tasa anunciada',
  ],
  questions: [
    {
      q: '¿Una proyección es una promesa?',
      o: ['Sí', 'No'],
      a: 1,
      feedback: 'Una proyección depende de supuestos y puede no ocurrir.',
    },
    {
      q: '¿El plan debe incluir una revisión?',
      o: ['Sí', 'No'],
      a: 0,
      feedback: 'Metas, capacidad y condiciones cambian con el tiempo.',
    },
    {
      q: '¿Qué ocurre si falta información del producto?',
      o: ['Se contrata igual', 'Se registra como pendiente de verificar'],
      a: 1,
      feedback: 'Una pregunta pendiente es parte válida del plan.',
    },
  ],
  reviewTitle: 'Mi plan define criterios antes de elegir.',
  reviewText:
    'Documentaré objetivo, aportes, plazo, liquidez, incertidumbre y pendientes. Después compararé alternativas con información vigente.',
  key: 'investment_l13:plan-draft:v1',
  resultKey: 'l13_plan_draft',
  defaultAdvice:
    'El borrador no proyecta una ganancia ni asigna un instrumento; prepara una comparación responsable.',
};
export default function L13() {
  return <InvestmentPracticeLesson config={config} />;
}
