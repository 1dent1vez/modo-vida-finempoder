import { describe, expect, it } from 'vitest';
import { MX, fmtFecha, fmtTasa, mxLabel } from './datos-mx';

function esObjeto(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

type Hoja = { valor: number; ancestros: Record<string, unknown>[] };

/** Recorre MX recursivamente y devuelve cada cifra numérica con su cadena de ancestros. */
function hojasConAncestros(obj: Record<string, unknown>, ancestros: Record<string, unknown>[] = []): Hoja[] {
  const hojas: Hoja[] = [];
  for (const valor of Object.values(obj)) {
    if (typeof valor === 'number') {
      hojas.push({ valor, ancestros: [...ancestros, obj] });
    } else if (esObjeto(valor)) {
      hojas.push(...hojasConAncestros(valor, [...ancestros, obj]));
    }
  }
  return hojas;
}

function tieneFecha(nodo: Record<string, unknown>): boolean {
  return 'fecha' in nodo || 'fechaCorte' in nodo || 'anio' in nodo;
}

describe('MX — gobernanza del shape (doc §138-152)', () => {
  it('expone las 6 claves raíz esperadas', () => {
    expect(Object.keys(MX).sort()).toEqual(['cetes', 'inflacion', 'ipab', 'isr', 'salarioMinimo', 'tiie']);
  });

  it('valores verificados (23-ago-2026): CETES, inflación, ISR, IPAB, salario mínimo, TIIE', () => {
    expect(MX.cetes.tasa28d).toBe(0.0615);
    expect(MX.cetes.tasa91d).toBe(0.0645);
    expect(MX.cetes.fecha).toBe('2026-08-23');
    expect(MX.inflacion.anualPct).toBe(3.12);
    expect(MX.inflacion.fechaCorte).toBe('2026-07');
    expect(MX.isr.retencionCetesPct).toBe(0.9);
    expect(MX.isr.anio).toBe(2026);
    expect(MX.ipab.topeUdis).toBe(400_000);
    expect(MX.ipab.topeMxn).toBe(3_517_535.6);
    expect(MX.salarioMinimo.diario).toBe(315.04);
    expect(MX.salarioMinimo.mensual).toBe(9_582.47);
    expect(MX.salarioMinimo.zonaFrontera.diario).toBe(440.87);
    expect(MX.salarioMinimo.zonaFrontera.mensual).toBe(13_409.8);
    expect(MX.tiie.tasa28dPct).toBe(6.8);
  });

  it('cada cifra numérica tiene fecha (fecha | fechaCorte | anio) y fuente en su contenedor', () => {
    const hojas = hojasConAncestros(MX);
    expect(hojas.length).toBeGreaterThan(0);

    for (const hoja of hojas) {
      const contenedor = [...hoja.ancestros]
        .reverse()
        .find((nodo) => tieneFecha(nodo) && typeof nodo.fuente === 'string');
      expect(contenedor, `cifra ${hoja.valor} sin fecha+fuente en su objeto contenedor`).toBeDefined();
    }
  });

  it('zonaFrontera hereda la fecha y fuente de salarioMinimo', () => {
    expect(MX.salarioMinimo.anio).toBe(2026);
    expect(MX.salarioMinimo.fuente).toBe('Conasami');
  });
});

describe('fmtTasa', () => {
  it('redondea a una cifra decimal', () => {
    expect(fmtTasa(6.15)).toBe('6.2%');
    expect(fmtTasa(MX.cetes.tasa28d * 100)).toBe('6.2%');
    expect(fmtTasa(MX.cetes.tasa91d * 100)).toBe('6.5%');
    expect(fmtTasa(MX.inflacion.anualPct)).toBe('3.1%');
  });

  it('omite ceros tontos en valores enteros', () => {
    expect(fmtTasa(8)).toBe('8%');
    expect(fmtTasa(10)).toBe('10%');
  });
});

describe('fmtFecha', () => {
  it('abrevia el mes en es-MX en minúsculas según el campo disponible', () => {
    expect(fmtFecha(MX.cetes)).toBe('ago 2026');
    expect(fmtFecha(MX.inflacion)).toBe('jul 2026');
    expect(fmtFecha(MX.ipab)).toBe('jul 2026');
    expect(fmtFecha(MX.isr)).toBe('2026');
    expect(fmtFecha(MX.tiie)).toBe('ago 2026');
  });
});

describe('mxLabel', () => {
  it('formatea etiqueta de tasa referencial con fecha de corte', () => {
    expect(mxLabel(MX.cetes, MX.cetes.tasa28d * 100)).toBe('tasa referencial: 6.2%, ago 2026');
  });

  it('formatea etiqueta de dato con fuente y fecha', () => {
    expect(mxLabel(MX.inflacion)).toBe('INEGI INPC, jul 2026');
  });
});
