import InvestmentPracticeLesson, { type PracticeConfig } from './InvestmentPracticeLesson';
const config: PracticeConfig = {
  id: 'L14',
  title: 'Revisión de tu proceso',
  label: 'Auditoría de preparación',
  headings: [
    'Revisa evidencia, no busques una luz verde.',
    'Identifica el pendiente más importante.',
    'Comprueba los límites de la revisión.',
    'Conserva próximos pasos.',
  ],
  description: 'Evalúa la calidad del proceso sin declarar que ya debes invertir.',
  cards: [
    {
      id: 'stability',
      name: 'Estabilidad',
      text: '¿Necesidades, obligaciones y reserva están consideradas con datos recientes?',
    },
    {
      id: 'goal',
      name: 'Meta y plazo',
      text: '¿La fecha, flexibilidad y necesidad de liquidez están descritas?',
    },
    {
      id: 'understanding',
      name: 'Comprensión',
      text: '¿Puedes explicar funcionamiento, pérdidas posibles y salida del instrumento?',
    },
    {
      id: 'documents',
      name: 'Evidencia',
      text: '¿Revisaste documentos, costos, riesgos e identidad en fuentes vigentes?',
    },
    {
      id: 'decision',
      name: 'Regla de decisión',
      text: '¿Sabes qué información faltante te haría pausar o descartar la alternativa?',
    },
  ],
  prompt: '¿Qué conclusión puede emitir esta revisión?',
  options: [
    'Estoy autorizado para invertir',
    'Tengo evidencia suficiente o pendientes concretos',
    'El producto elegido es ideal',
  ],
  questions: [
    {
      q: '¿Completar el curso sustituye asesoría o documentación?',
      o: ['Sí', 'No'],
      a: 1,
      feedback: 'El curso ayuda a formular preguntas; no valida una decisión personal.',
    },
    {
      q: 'Un indicador incompleto…',
      o: ['Es un pendiente para investigar', 'Significa fracaso'],
      a: 0,
      feedback: 'Convertir la duda en una tarea concreta mejora el proceso.',
    },
    {
      q: '¿Finni debe ordenar una compra?',
      o: ['Sí', 'No; debe explicar y señalar límites'],
      a: 1,
      feedback: 'El acompañamiento educativo no decide por la persona.',
    },
  ],
  reviewTitle: 'Mi revisión produce pendientes, no permiso.',
  reviewText:
    'Antes de comprometer dinero confirmaré estabilidad, meta, liquidez, comprensión, documentos y regla de decisión.',
  key: 'investment_l14:readiness-review:v1',
  resultKey: 'l14_readiness_review',
  defaultAdvice:
    'Finni puede ayudarte a identificar huecos; no puede declarar que una inversión es adecuada para ti.',
};
export default function L14() {
  return <InvestmentPracticeLesson config={config} />;
}
