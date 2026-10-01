/// <reference types="node" />

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Rutas relativas al archivo del test (frontend/src/lib/datos-mx-gobernanza.test.ts).
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const LESSONS_DIR = join(__dirname, '../pages/modules');

const leer = (relativa: string): string =>
  readFileSync(join(LESSONS_DIR, relativa), 'utf8');

// Si una de estas constantes/cifras hardcodeadas reaparece en las lecciones,
// el simulador dejó de leer de MX (doc §152: los simuladores leen de datos-mx.ts).
const CASOS: { archivo: string; patron: RegExp | string; descripcion: string }[] = [
  // Inversión — inflación "actual" hardcodeada
  { archivo: 'inversion/lessons/L12.tsx', patron: 'INFLACION_MEXICO_2024', descripcion: 'constante de inflación 2024 hardcodeada' },
  // Inversión — ISR
  { archivo: 'inversion/lessons/L11.tsx', patron: /ISR_RETENCION\s*=\s*0\.15/, descripcion: 'ISR_RETENCION con 0.15 hardcodeado' },
  { archivo: 'inversion/lessons/L11.tsx', patron: '0.15% en 2024', descripcion: 'retención ISR 0.15% 2024 hardcodeada' },
  { archivo: 'inversion/lessons/L06.tsx', patron: '0.15% en 2024', descripcion: 'retención ISR 0.15% 2024 hardcodeada' },
  // Inversión — simulador L15
  { archivo: 'inversion/lessons/L15.tsx', patron: /INFLACION_SIM\s*=\s*0\.04/, descripcion: 'INFLACION_SIM 4% hardcodeada' },
  { archivo: 'inversion/lessons/L15.tsx', patron: 'tasaAnual: 0.100', descripcion: 'CETES 28d hardcodeado en INSTRUMENTOS_SIM' },
  { archivo: 'inversion/lessons/L15.tsx', patron: 'tasaAnual: 0.102', descripcion: 'CETES 91d hardcodeado en INSTRUMENTOS_SIM' },
  // Inversión — plan L13
  { archivo: 'inversion/lessons/L13.tsx', patron: "'CETES 28 días': 0.10", descripcion: 'CETES 28d hardcodeado en TASA_POR_INSTRUMENTO' },
  { archivo: 'inversion/lessons/L13.tsx', patron: "'CETES 91 días': 0.102", descripcion: 'CETES 91d hardcodeado en TASA_POR_INSTRUMENTO' },
  { archivo: 'inversion/lessons/L13.tsx', patron: '0.0466', descripcion: 'inflación 4.66% hardcodeada' },
  // Inversión — ficha L06
  { archivo: 'inversion/lessons/L06.tsx', patron: '~10% anual', descripcion: 'tasa CETES ~10% hardcodeada' },
  { archivo: 'inversion/lessons/L06.tsx', patron: /TASA_ANUAL\s*=\s*0\.10/, descripcion: 'TASA_ANUAL 10% hardcodeada' },
  // Ahorro — simulador L12
  { archivo: 'ahorro/lessons/L12.tsx', patron: "label: 'CETES', value: 8", descripcion: 'CETES 8% hardcodeado en TASAS' },
  // Ahorro — tope IPAB desactualizado (~3 millones)
  { archivo: 'ahorro/lessons/L02.tsx', patron: /[~≈]?\s*3\s+millones/, descripcion: 'tope IPAB ~3 millones hardcodeado' },
  { archivo: 'ahorro/lessons/L03.tsx', patron: /[~≈]?\s*3\s+millones/, descripcion: 'tope IPAB ~3 millones hardcodeado' },
  { archivo: 'ahorro/lessons/L10.tsx', patron: /[~≈]?\s*3\s+millones/, descripcion: 'tope IPAB ~3 millones hardcodeado' },
  { archivo: 'ahorro/lessons/L14.tsx', patron: /[~≈]?\s*3\s+millones/, descripcion: 'tope IPAB ~3 millones hardcodeado' },
  // Presupuesto — ejemplo Netflix $99
  { archivo: 'presupuesto/lessons/L01.tsx', patron: 'Netflix', descripcion: 'ejemplo Netflix hardcodeado' },
  { archivo: 'presupuesto/lessons/L01.tsx', patron: '$99', descripcion: 'monto $99 hardcodeado' },
  { archivo: 'presupuesto/lessons/L07.tsx', patron: '$99', descripcion: 'monto $99 hardcodeado' },
  { archivo: 'presupuesto/lessons/L08.tsx', patron: '$99', descripcion: 'monto $99 hardcodeado' },
];

describe('gobernanza de lecciones (doc §152) — sin constantes financieras hardcodeadas', () => {
  for (const caso of CASOS) {
    it(`${caso.archivo} no contiene ${typeof caso.patron === 'string' ? `'${caso.patron}'` : caso.patron}`, () => {
      const contenido = leer(caso.archivo);
      if (typeof caso.patron === 'string') {
        expect(contenido, caso.descripcion).not.toContain(caso.patron);
      } else {
        expect(contenido, caso.descripcion).not.toMatch(caso.patron);
      }
    });
  }
});
