import InvestmentPracticeLesson, { type PracticeConfig } from './InvestmentPracticeLesson';
const config: PracticeConfig = {
  id: 'L11',
  title: 'Costos y rendimiento neto',
  label: 'Lector de costos',
  headings: [
    'El rendimiento anunciado es solo el inicio.',
    'Pregunta por el costo total.',
    'Distingue costo, impuesto y resultado.',
    'Guarda una lista para comparar.',
  ],
  description: 'Identifica cargos y efectos fiscales sin aplicar una tasa universal.',
  cards: [
    {
      id: 'management',
      name: 'Administración',
      text: 'Cargo por gestionar una estrategia; revisa base, periodicidad y si ya está reflejado en el rendimiento.',
    },
    {
      id: 'trade',
      name: 'Operación',
      text: 'Compra, venta o intermediación pueden generar costos distintos según contrato.',
    },
    {
      id: 'custody',
      name: 'Custodia',
      text: 'Algunas cuentas cobran por conservar o administrar activos.',
    },
    {
      id: 'spread',
      name: 'Diferencial',
      text: 'La diferencia entre precios de compra y venta también puede afectar el resultado.',
    },
    {
      id: 'tax',
      name: 'Tratamiento fiscal',
      text: 'Depende del instrumento, operación y situación fiscal; debe verificarse con información vigente.',
    },
  ],
  prompt: 'Dos alternativas anuncian el mismo rendimiento bruto. ¿Qué haces?',
  options: [
    'Elegir cualquiera',
    'Comparar costos totales, impuestos y condiciones',
    'Elegir la comisión más visible',
  ],
  questions: [
    {
      q: '¿Bruto y neto significan lo mismo?',
      o: ['Sí', 'No'],
      a: 1,
      feedback: 'El resultado neto incorpora los descuentos y condiciones aplicables.',
    },
    {
      q: '¿Una sola tasa fiscal aplica igual a toda inversión y persona?',
      o: ['Sí', 'No; depende del caso y la norma vigente'],
      a: 1,
      feedback: 'Evita calcular impuestos con una regla universal.',
    },
    {
      q: '¿Qué conviene solicitar?',
      o: ['Costo total y documento vigente', 'Solo una promesa verbal'],
      a: 0,
      feedback: 'La documentación permite revisar qué se cobra y cuándo.',
    },
  ],
  reviewTitle: 'Compararé resultados netos bajo los mismos supuestos.',
  reviewText:
    'Revisaré administración, operación, custodia, diferenciales, impuestos y la forma en que cada cifra se presenta.',
  key: 'investment_l11:net-costs:v1',
  resultKey: 'l11_net_costs',
  defaultAdvice:
    'Los costos importan, pero su efecto depende de cómo, cuándo y sobre qué base se cobran.',
};
export default function L11() {
  return <InvestmentPracticeLesson config={config} />;
}
