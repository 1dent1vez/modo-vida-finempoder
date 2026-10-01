import InvestmentPracticeLesson, { type PracticeConfig } from './InvestmentPracticeLesson';
const config: PracticeConfig = {
  id: 'L10',
  title: 'Verifica antes de transferir',
  label: 'Protocolo ante ofertas',
  headings: [
    'Las señales se acumulan.',
    'Haz una pausa antes de transferir.',
    'Practica un protocolo verificable.',
    'Guarda una respuesta concreta.',
  ],
  description:
    'Detecta presión, opacidad y promesas difíciles de comprobar sin depender de cifras fijas.',
  cards: [
    {
      id: 'promise',
      name: 'Promesa extraordinaria',
      text: 'Rendimiento alto, fijo o sin riesgo exige detenerse y comprobar la base de la afirmación.',
    },
    {
      id: 'pressure',
      name: 'Presión',
      text: 'Urgencia, cupos o miedo a perder la oportunidad reducen el tiempo para verificar.',
    },
    {
      id: 'opacity',
      name: 'Opacidad',
      text: 'No explicar cómo se genera el rendimiento, los costos o los riesgos impide evaluar.',
    },
    {
      id: 'identity',
      name: 'Identidad dudosa',
      text: 'Nombre, dominio, cuenta de pago y registro deben corresponder entre sí.',
    },
    {
      id: 'recruit',
      name: 'Pago por reclutar',
      text: 'Depender de nuevas personas para pagar rendimientos es una señal crítica.',
    },
  ],
  prompt: 'Recibes una oferta urgente con ganancia garantizada. ¿Qué haces primero?',
  options: [
    'Transferir una cantidad pequeña',
    'Pausar y verificar identidad, documentos y registro',
    'Pedir testimonios en redes',
  ],
  questions: [
    {
      q: '¿Una app en una tienda oficial prueba legitimidad financiera?',
      o: ['Sí', 'No'],
      a: 1,
      feedback: 'La disponibilidad técnica no confirma autorización ni condiciones.',
    },
    {
      q: '¿Qué fuente pesa más?',
      o: ['Testimonios', 'Documentos y registros oficiales vigentes'],
      a: 1,
      feedback: 'Confirma siempre con la autoridad o registro aplicable.',
    },
    {
      q: 'Si ya transferiste y sospechas fraude…',
      o: [
        'Enviar más para recuperar',
        'Detener pagos, guardar evidencia y buscar canales oficiales',
      ],
      a: 1,
      feedback: 'Conserva comprobantes, conversaciones, cuentas y anuncios.',
    },
  ],
  reviewTitle: 'Pausa, verifica y documenta.',
  reviewText:
    'No transferiré bajo presión. Confirmaré identidad, funcionamiento, riesgos, documentos y registro vigente; si sospecho fraude, conservaré evidencia y usaré canales oficiales actuales.',
  key: 'investment_l10:verification:v1',
  resultKey: 'l10_verification',
  defaultAdvice:
    'No hay un porcentaje mágico que separe automáticamente una oferta legítima de un fraude; verifica el conjunto.',
};
export default function L10() {
  return <InvestmentPracticeLesson config={config} />;
}
