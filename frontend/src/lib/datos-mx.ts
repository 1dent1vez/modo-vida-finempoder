// datos-mx.ts — Cifras macro de referencia de México.
// Regla de gobernanza: toda cifra lleva fecha de corte (fecha | fechaCorte | anio) y fuente.
// Rutina de actualización: CETES (subasta semanal; basta mensual), inflación (INEGI, mitad de mes),
// IPAB (cuando cambie la UDI), ISR (enero), salario mínimo (enero), TIIE (Banxico).
// Fecha de verificación: 23-ago-2026.

export const MX = {
  cetes: { tasa28d: 0.0615, tasa91d: 0.0645, fecha: '2026-08-23', fuente: 'cetesdirecto.com' },
  inflacion: { anualPct: 3.12, fechaCorte: '2026-07', fuente: 'INEGI INPC' },
  isr: { retencionCetesPct: 0.90, anio: 2026, fuente: 'Ley de Ingresos/SAT' },
  ipab: { topeUdis: 400_000, topeMxn: 3_517_535.60, fecha: '2026-07-31', fuente: 'IPAB' },
  salarioMinimo: {
    diario: 315.04,
    mensual: 9_582.47,
    zonaFrontera: { diario: 440.87, mensual: 13_409.80 },
    anio: 2026,
    fuente: 'Conasami',
  },
  tiie: { tasa28dPct: 6.8, fecha: '2026-08', fuente: 'Banxico' },
};

export type DatoMX = { fecha?: string; fechaCorte?: string; anio?: number; fuente?: string };

const MESES_MX = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'] as const;

/** '6.15' → '6.2%' (una cifra decimal, sin ceros tontos). */
export function fmtTasa(pct: number): string {
  const unaCifra = `${(pct + Number.EPSILON).toFixed(1)}`;
  const sinCeroTonto = unaCifra.endsWith('.0') ? unaCifra.slice(0, -2) : unaCifra;
  return `${sinCeroTonto}%`;
}

/** '2026-08-23'/'2026-07' → 'ago 2026' / 'jul 2026'; anio → '2026'. */
export function fmtFecha(dato: DatoMX): string {
  const corte = dato?.fecha ?? dato?.fechaCorte;
  if (corte) {
    const [anio, mes] = corte.split('-');
    if (mes) return `${MESES_MX[Number(mes) - 1] ?? mes} ${anio}`;
    return anio;
  }
  if (dato?.anio) return String(dato.anio);
  return '';
}

/** Etiqueta UI: 'tasa referencial: 6.2%, ago 2026' o 'INEGI INPC, jul 2026'. */
export function mxLabel(dato: DatoMX, tasaPct?: number): string {
  const fecha = fmtFecha(dato);
  if (tasaPct !== undefined) return `tasa referencial: ${fmtTasa(tasaPct)}, ${fecha}`;
  const fuente = dato?.fuente ? `${dato.fuente}, ` : '';
  return `${fuente}${fecha}`;
}
