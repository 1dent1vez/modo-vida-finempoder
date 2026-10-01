import InvestmentPracticeLesson, { type PracticeConfig } from './InvestmentPracticeLesson';
const config: PracticeConfig = {
  id: 'L15',
  title: 'Reto final: decide con método',
  label: 'Cierre del módulo',
  headings: [
    'Tu reto es sostener un proceso.',
    'Responde ante nueva información.',
    'Comprueba el método completo.',
    'Conserva tu compromiso.',
  ],
  description: 'Cierra el módulo con una decisión argumentada, sin premiar rendimientos simulados.',
  cards: [
    { id: 'pause', name: 'Pausar', text: 'Evita decidir bajo urgencia, euforia o miedo.' },
    {
      id: 'verify',
      name: 'Verificar',
      text: 'Confirma identidad, documentos, costos, riesgos y condiciones vigentes.',
    },
    {
      id: 'compare',
      name: 'Comparar',
      text: 'Usa los mismos supuestos de plazo, liquidez, costos e inflación.',
    },
    {
      id: 'decide',
      name: 'Decidir',
      text: 'Relaciona la alternativa con tu meta, capacidad y disposición.',
    },
    {
      id: 'review',
      name: 'Revisar',
      text: 'Define cuándo volverás a evaluar y qué cambio activaría una acción.',
    },
  ],
  prompt: 'Una alternativa que investigabas cambia sus condiciones. ¿Qué haces?',
  options: [
    'Mantener la decisión anterior',
    'Revisar el plan con la información nueva',
    'Elegir por el rendimiento anunciado',
  ],
  questions: [
    {
      q: '¿Qué demuestra una buena decisión?',
      o: ['Un resultado positivo inmediato', 'Un proceso coherente con la información disponible'],
      a: 1,
      feedback: 'Un buen proceso puede enfrentar resultados inciertos.',
    },
    {
      q: 'Si falta un documento clave…',
      o: ['Se pausa la decisión', 'Se reemplaza con testimonios'],
      a: 0,
      feedback: 'La ausencia de evidencia es información relevante.',
    },
    {
      q: '¿Qué completa el reto?',
      o: ['Superar una tasa inventada', 'Explicar criterios, pendientes y revisión'],
      a: 1,
      feedback: 'El aprendizaje se demuestra con un método que puedas repetir.',
    },
  ],
  reviewTitle: 'Mi compromiso es repetir el método.',
  reviewText:
    'Pausaré, verificaré, compararé, decidiré con mis criterios y revisaré cuando cambien las condiciones. Completar esta lección registra el cierre del módulo y permite que el sistema derive el reconocimiento correspondiente del progreso real.',
  key: 'investment_l15:final-method:v1',
  resultKey: 'l15_resultado',
  defaultAdvice:
    'El reconocimiento depende de completar el aprendizaje; ningún rendimiento simulado define tu capacidad como inversionista.',
};
export default function L15() {
  return <InvestmentPracticeLesson config={config} />;
}
