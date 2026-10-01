import InvestmentPracticeLesson, { type PracticeConfig } from './InvestmentPracticeLesson';
const config: PracticeConfig = {
  id: 'L08',
  title: 'Tu relación con el riesgo',
  label: 'Mapa personal de tolerancia',
  headings: [
    'Tu tolerancia tiene varias dimensiones.',
    'Describe una reacción, no una etiqueta.',
    'Reconoce los límites del cuestionario.',
    'Conserva una fotografía revisable.',
  ],
  description:
    'Explora capacidad, disposición, plazo y experiencia sin asignarte un perfil definitivo.',
  cards: [
    {
      id: 'capacity',
      name: 'Capacidad',
      text: 'Cuánto impacto financiero podrías absorber sin afectar necesidades u obligaciones.',
    },
    {
      id: 'willingness',
      name: 'Disposición',
      text: 'Qué tanta variación emocionalmente aceptarías, aun cuando tengas capacidad económica.',
    },
    {
      id: 'horizon',
      name: 'Plazo',
      text: 'Cuándo necesitarás el dinero y qué flexibilidad real existe.',
    },
    {
      id: 'knowledge',
      name: 'Experiencia',
      text: 'Qué tan bien entiendes el instrumento y sus posibles resultados.',
    },
  ],
  prompt: 'Si una inversión hipotética bajara 15%, ¿qué reconocerías primero?',
  options: [
    'Necesitaría el dinero pronto',
    'Me preocuparía aunque pudiera esperar',
    'Podría esperar, pero investigaría el motivo',
    'No sé cómo reaccionaría',
  ],
  questions: [
    {
      q: '¿Un cuestionario breve determina qué debes comprar?',
      o: ['Sí', 'No; solo aporta información para evaluar'],
      a: 1,
      feedback: 'Una autoevaluación orienta preguntas, no prescribe instrumentos.',
    },
    {
      q: 'Capacidad y disposición al riesgo…',
      o: ['Siempre son iguales', 'Pueden ser distintas'],
      a: 1,
      feedback: 'Puedes tener capacidad económica y poca disposición emocional, o al revés.',
    },
    {
      q: '¿El perfil puede cambiar?',
      o: ['Sí, con metas y circunstancias', 'No, es permanente'],
      a: 0,
      feedback: 'Conviene revisarlo cuando cambian tus metas o situación.',
    },
  ],
  reviewTitle: 'Esto es una fotografía, no una recomendación.',
  reviewText:
    'Antes de decidir, revisaré capacidad, disposición, plazo, experiencia y condiciones del instrumento.',
  key: 'investment_l8:risk-map:v1',
  resultKey: 'l08_risk_map',
  defaultAdvice:
    'No convertiré tus respuestas en una etiqueta ni en una lista automática de instrumentos.',
};
export default function L08() {
  return <InvestmentPracticeLesson config={config} />;
}
