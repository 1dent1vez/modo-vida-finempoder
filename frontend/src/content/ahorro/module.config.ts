import type { ModuleContentConfig } from '../types';

export const moduleConfig: ModuleContentConfig = {
  id: 'ahorro',
  title: 'Hábitos de Ahorro',
  description: 'Construye el hábito del ahorro y haz que tu dinero trabaje para ti.',
  lessons: [
    { id: 'L01', title: 'Ahorro primero: el hábito que cambia todo',           order: 1,  xp: 50,  kind: 'content'   },
    { id: 'L02', title: 'Cochinito vs banco: ahorro informal y formal',        order: 2,  xp: 100, kind: 'simulator' },
    { id: 'L03', title: 'Tu dinero en el banco trabaja por ti',                order: 3,  xp: 50,  kind: 'content'   },
    { id: 'L04', title: 'Aliados y saboteadores del ahorro',                   order: 4,  xp: 100, kind: 'simulator' },
    { id: 'L05', title: 'Ponle nombre a tu ahorro: define tu meta',            order: 5,  xp: 100, kind: 'simulator' },
    { id: 'L06', title: 'Tu plan de ahorro: 1, 3 o 6 meses',                  order: 6,  xp: 100, kind: 'simulator' },
    { id: 'L07', title: 'Cuando tu ingreso es impredecible',                   order: 7,  xp: 100, kind: 'simulator' },
    { id: 'L08', title: 'Tu red de seguridad: fondo de emergencias',           order: 8,  xp: 100, kind: 'simulator' },
    { id: 'L09', title: 'Ahorro y seguros: la dupla de la tranquilidad',       order: 9,  xp: 50,  kind: 'content'   },
    { id: 'L10', title: 'El IPAB: el guardián de tu dinero',                   order: 10, xp: 50,  kind: 'content'   },
    { id: 'L11', title: 'Micro-reto: ahorra 3 días seguidos',                  order: 11, xp: 150, kind: 'challenge' },
    { id: 'L12', title: 'El dinero que se multiplica: interés compuesto',      order: 12, xp: 100, kind: 'simulator' },
    { id: 'L13', title: 'Finni dice: cómo vas con tu ahorro',                  order: 13, xp: 50,  kind: 'content'   },
    { id: 'L14', title: 'Evalúa tu hábito de ahorro',                          order: 14, xp: 75,  kind: 'quiz'      },
    { id: 'L15', title: 'Reto final: cierra tu módulo de ahorro',              order: 15, xp: 150, kind: 'challenge' },
  ],
};
