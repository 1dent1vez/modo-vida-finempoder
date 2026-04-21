import { describe, it, expect } from 'vitest';
import { moduleConfig as ahorroConfig } from '../src/content/ahorro/module.config';
import { moduleConfig as presupuestoConfig } from '../src/content/presupuesto/module.config';
import { moduleConfig as inversionConfig } from '../src/content/inversion/module.config';

const MODULES = [ahorroConfig, presupuestoConfig, inversionConfig];
const EXPECTED_MODULE_IDS = ['ahorro', 'presupuesto', 'inversion'];
const EXPECTED_LESSON_COUNT = 15;
const VALID_KINDS = ['content', 'simulator', 'challenge', 'quiz'];

describe('module.config — estructura', () => {
  it('los 3 módulos tienen id, title y description', () => {
    for (const mod of MODULES) {
      expect(typeof mod.id).toBe('string');
      expect(mod.id.length).toBeGreaterThan(0);
      expect(typeof mod.title).toBe('string');
      expect(mod.title.length).toBeGreaterThan(0);
      expect(typeof mod.description).toBe('string');
      expect(mod.description.length).toBeGreaterThan(0);
    }
  });

  it('los ids de módulo son los esperados', () => {
    const ids = MODULES.map((m) => m.id).sort();
    expect(ids).toEqual([...EXPECTED_MODULE_IDS].sort());
  });

  it('cada módulo tiene exactamente 15 lecciones', () => {
    for (const mod of MODULES) {
      expect(mod.lessons).toHaveLength(EXPECTED_LESSON_COUNT);
    }
  });
});

describe('module.config — lecciones', () => {
  for (const mod of MODULES) {
    describe(`módulo "${mod.id}"`, () => {
      it('cada lección tiene id, title, order, xp y kind válidos', () => {
        for (const lesson of mod.lessons) {
          expect(lesson.id).toMatch(/^L\d{2}$/);
          expect(lesson.title.length).toBeGreaterThan(0);
          expect(lesson.order).toBeGreaterThan(0);
          expect(lesson.xp).toBeGreaterThan(0);
          expect(VALID_KINDS).toContain(lesson.kind);
        }
      });

      it('orden consecutivo desde 1 hasta 15', () => {
        const orders = [...mod.lessons].sort((a, b) => a.order - b.order).map((l) => l.order);
        expect(orders).toEqual(Array.from({ length: EXPECTED_LESSON_COUNT }, (_, i) => i + 1));
      });

      it('ids de lección son únicos en el módulo', () => {
        const ids = mod.lessons.map((l) => l.id);
        expect(new Set(ids).size).toBe(ids.length);
      });

      it('xp total del módulo es > 0', () => {
        const total = mod.lessons.reduce((sum, l) => sum + l.xp, 0);
        expect(total).toBeGreaterThan(0);
      });
    });
  }
});
