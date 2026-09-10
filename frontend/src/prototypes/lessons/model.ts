export type Category = 'fijo' | 'variable';
export type Activity = 'clasifica' | 'experimenta' | 'decide';
export const STORAGE_KEY = 'finempoder:lesson-pilot:v1';
export const incomeItems: {
  name: string;
  amount: number;
  context: string;
  category: Category;
  explanation: string;
}[] = [
  {
    name: 'Sueldo de medio tiempo',
    amount: 3200,
    context: 'Recibes la misma cantidad cada mes por tu trabajo.',
    category: 'fijo',
    explanation: 'Es un ingreso fijo porque conoces su monto y cuándo lo recibes.',
  },
  {
    name: 'Venta de una bicicleta',
    amount: 900,
    context: 'Vendiste una bicicleta que ya no usabas.',
    category: 'variable',
    explanation:
      'Es una entrada ocasional. Conviene no contar con ella para cubrir un gasto que vuelve cada mes.',
  },
  {
    name: 'Beca mensual',
    amount: 1800,
    context: 'Durante este semestre recibes un monto establecido cada mes.',
    category: 'fijo',
    explanation:
      'En este ejemplo, el monto y la frecuencia están definidos durante el semestre. Revisa cuándo termina.',
  },
  {
    name: 'Diseño por encargo',
    amount: 450,
    context: 'Una amiga te pagó por diseñar un cartel. Los encargos cambian.',
    category: 'variable',
    explanation: 'Los encargos pueden cambiar de monto y frecuencia. Es un ingreso variable.',
  },
  {
    name: 'Apoyo familiar acordado',
    amount: 600,
    context: 'Tu familia acordó darte $600 cada mes durante este año.',
    category: 'fijo',
    explanation:
      'El acuerdo tiene una cantidad y una frecuencia establecidas, por eso aquí se considera fijo.',
  },
  {
    name: 'Propinas del fin de semana',
    amount: 280,
    context: 'Cada fin de semana recibes una cantidad diferente.',
    category: 'variable',
    explanation:
      'Aunque recibas propinas seguido, su cantidad cambia. Planea con cautela cuánto puedes usar.',
  },
];
export const cases = [
  {
    title: 'Tu bici necesita una reparación.',
    detail:
      'La usas para ir a clases. Repararla cuesta $800. Este mes reservaste $900 para salidas.',
    amount: 800,
    label: 'Reparación de transporte',
    choices: [
      {
        title: 'Usar $800 de las salidas',
        detail: 'Reparar ahora y ajustar los planes del mes.',
        after: '$100 para salidas',
        effect: 'Cubres la reparación sin deuda. Tus salidas bajan de $900 a $100 este mes.',
        lesson:
          'Cambiar un gasto flexible puede proteger una necesidad. También puedes buscar un presupuesto de reparación más bajo.',
      },
      {
        title: 'Pagar con crédito',
        detail: 'Mantener las salidas y pagar la reparación después.',
        after: '$800 por pagar',
        effect: 'Mantienes $900 para salidas, pero comprometes al menos $800 de tu ingreso futuro.',
        lesson:
          'Antes de elegir crédito, compara el costo total y la fecha de pago. Postergar el pago no elimina el gasto.',
      },
      {
        title: 'Esperar un mes',
        detail: 'Seguir usando otro transporte mientras tanto.',
        after: 'Reparación pendiente',
        effect:
          'Conservas $900 para salidas. Necesitas revisar cuánto costará transportarte durante la espera.',
        lesson:
          'Esperar también puede tener un costo. Compara el transporte alternativo con la reparación antes de decidir.',
      },
    ],
  },
  {
    title: 'Este mes llegaron menos encargos.',
    detail:
      'Esperabas $1,200 de trabajos ocasionales y recibiste $600. Necesitas ajustar tu plan por $600.',
    amount: 600,
    label: 'Menos ingreso del esperado',
    choices: [
      {
        title: 'Recortar $600 de compras opcionales',
        detail: 'Ajustar el gasto al ingreso que sí llegó.',
        after: 'Brecha cubierta',
        effect: 'Tu plan vuelve a equilibrarse si realmente reduces esas compras en $600.',
        lesson:
          'Usar un ingreso conservador como base evita depender de encargos que todavía no están confirmados.',
      },
      {
        title: 'Contar con otro encargo',
        detail: 'Mantener el gasto esperando un nuevo trabajo.',
        after: '$600 sin cubrir',
        effect: 'El plan sigue teniendo una brecha de $600 hasta que ese ingreso se confirme.',
        lesson:
          'Una expectativa de ingreso todavía no es dinero disponible. Puedes preparar un plan alternativo mientras llega.',
      },
      {
        title: 'Usar $600 de una meta',
        detail: 'Cubrir la diferencia con dinero que habías apartado.',
        after: 'Meta: $600 menos',
        effect:
          'Cubres el mes y reduces en $600 el dinero de tu meta. Tendrás que ajustar el plazo o reponerlo.',
        lesson:
          'Mover dinero entre objetivos es una decisión posible. Hacer visible el efecto te ayuda a elegir conscientemente.',
      },
    ],
  },
  {
    title: 'Una oferta aparece en tu pantalla.',
    detail:
      'Unos audífonos cuestan $700. Ya tienes unos que funcionan y tu presupuesto de gustos disponible es de $400.',
    amount: 300,
    label: 'Lo que falta para la compra',
    choices: [
      {
        title: 'Esperar y reunir los $300',
        detail: 'Comparar precios y decidir después.',
        after: 'Presupuesto intacto',
        effect:
          'Conservas tus $400 y evitas tomar $300 de otro destino. La oferta podría terminar.',
        lesson:
          'Darte tiempo permite decidir si realmente quieres la compra, incluso cuando ya no hay descuento.',
      },
      {
        title: 'Mover $300 del ahorro',
        detail: 'Completar los $700 para comprar hoy.',
        after: 'Ahorro: $300 menos',
        effect:
          'Puedes comprar hoy, pero tu ahorro disminuye $300. La meta tardará más si no los repones.',
        lesson:
          'Un descuento no elimina el costo de oportunidad. Decide si la compra vale ese cambio en tu meta.',
      },
      {
        title: 'Buscar una opción de hasta $400',
        detail: 'Comprar dentro de lo que ya reservaste.',
        after: 'Dentro del límite',
        effect:
          'Mantienes el límite de $400. Todavía conviene comparar calidad y preguntarte si lo necesitas.',
        lesson:
          'Un límite ayuda a decidir, pero no obliga a gastar todo. También puedes guardar lo que no uses.',
      },
    ],
  },
];
export type PilotState = {
  version: 1;
  activity: Activity;
  classified: Category[];
  selected: Category | null;
  checked: boolean;
  needs: number;
  wants: number;
  simulationAnswer: number | null;
  simulationChecked: boolean;
  scenario: number;
  choice: number | null;
  revealed: boolean;
  decisions: number[];
  done: Activity[];
};
export const initialState = (): PilotState => ({
  version: 1,
  activity: 'clasifica',
  classified: [],
  selected: null,
  checked: false,
  needs: 3000,
  wants: 1800,
  simulationAnswer: null,
  simulationChecked: false,
  scenario: 0,
  choice: null,
  revealed: false,
  decisions: [],
  done: [],
});
export function restore(raw: string | null): PilotState | null {
  try {
    const p: unknown = JSON.parse(raw ?? 'null');
    if (!p || typeof p !== 'object') return null;
    const s = p as PilotState;
    const activities = ['clasifica', 'experimenta', 'decide'];
    if (
      s.version !== 1 ||
      !activities.includes(s.activity) ||
      !Array.isArray(s.classified) ||
      s.classified.length > 6 ||
      !s.classified.every((c, i) => c === incomeItems[i].category) ||
      (s.selected !== null && !['fijo', 'variable'].includes(s.selected)) ||
      typeof s.checked !== 'boolean' ||
      !Number.isInteger(s.needs) ||
      s.needs < 2500 ||
      s.needs > 4500 ||
      !Number.isInteger(s.wants) ||
      s.wants < 0 ||
      s.wants > 3000 ||
      (s.simulationAnswer !== null && ![0, 1, 2].includes(s.simulationAnswer)) ||
      typeof s.simulationChecked !== 'boolean' ||
      !Number.isInteger(s.scenario) ||
      s.scenario < 0 ||
      s.scenario > 2 ||
      (s.choice !== null && ![0, 1, 2].includes(s.choice)) ||
      typeof s.revealed !== 'boolean' ||
      (s.revealed && s.choice === null) ||
      !Array.isArray(s.decisions) ||
      s.decisions.length > 3 ||
      !s.decisions.every((c) => Number.isInteger(c) && c >= 0 && c <= 2) ||
      !Array.isArray(s.done) ||
      !s.done.every((a) => activities.includes(a))
    )
      return null;
    return s;
  } catch {
    return null;
  }
}
export const money = (value: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(value);
