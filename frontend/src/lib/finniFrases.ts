// FinEmpoder: banco de frases de Finni (F2-GAMIFICACION).
// Voz cercana mexicana: sin emojis, sin rayas largas, sin academicismos,
// sin marcas de IA. La lista de frases nuevas vive aquí para QA y para el
// reporte (ver F2_GAMIFICACION.md).

export const FRASES_POR_SERIE: Record<string, string[]> = {
  presupuesto: [
    'Tu dinero ya te hace caso, se nota el trabajo.',
    'Cada peso ya tiene lugar en tu plan, eso es poderoso.',
    'Presupuestar es decidir tú primero dónde va tu dinero.',
    'Ya le pones orden a tu dinero, y se siente.',
  ],
  ahorro: [
    'Ese colchón crece, y contigo la tranquilidad.',
    'Ahorrar es un acto de amor hacia tu yo del futuro.',
    'Cada peso guardado es un sí a tus planes.',
    'Tu guardadito ya es un hábito, eso no tiene precio.',
  ],
  inversion: [
    'Tu yo del futuro está aplaudiendo desde hoy.',
    'Invertir es poner tu dinero a trabajar, bien hecho.',
    'Hoy entiendes cómo crece tu dinero, mañana lo ves.',
    'Decidir con calma dónde inviertes, eso es madurez financiera.',
  ],
  racha: [
    'La constancia ya es tu apellido.',
    'Un día a la vez, y la racha habla por ti.',
    'Volver a FinEmpoder ya es parte de tu día.',
    'Tu disciplina se nota, sigue así.',
  ],
  lecciones: [
    'Cada lección te acerca más a dueño de tu dinero.',
    'Lo que aprendes hoy rinde intereses toda la vida.',
    'Seguir aprendiendo es la mejor inversión.',
    'Una lección más y tu confianza crece igual que tus finanzas.',
  ],
  finempoder_pro: [
    'Los tres módulos completos. Eres otro nivel.',
    'Terminaste el camino completo, y eso pocas personas lo logran.',
    'Dueño de tu dinero, de principio a fin.',
  ],
};

export function fraseAleatoria(frases: string[]): string {
  return frases[Math.floor(Math.random() * frases.length)] ?? frases[0] ?? '';
}

export function fraseParaSerie(serieId: string): string {
  return fraseAleatoria(FRASES_POR_SERIE[serieId] ?? []);
}

export const FRASES_META_DIARIA = [
  '¡Meta del día cumplida! Mañana también vas a poder.',
  'Llegaste a tu meta de hoy. Mañana seguimos con la misma energía.',
  'Día cumplido, tu constancia manda.',
];

export const FRASES_RECUPERACION_RACHA = [
  'La racha se reinició, pero lo aprendido no se borra. Hoy es buen día para empezar otra.',
  'Una pausa no borra tu avance. Vuelve hoy con la misma energía.',
  'Descansar también vale, la constancia se rearma cuando tú quieras.',
];

export const FRASES_SALUDO_DIA = [
  'Buen día. Tu yo de mañana te espera con un día más de constancia.',
  'Hoy también vas a aprender algo nuevo, aprovecha el día.',
  'Un día más, un paso más cerca de dueño de tu dinero.',
];
