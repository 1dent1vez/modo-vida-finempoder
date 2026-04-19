import type { ModuleContentConfig } from '../types';

export const moduleConfig: ModuleContentConfig = {
  id: 'inversion',
  title: 'Inversión Inteligente',
  description: 'Aprende a invertir tus excedentes con conocimiento y sin riesgos innecesarios.',
  lessons: [
    { id: 'L01', title: '¿Qué es invertir?',                                         order: 1,  xp: 50,  kind: 'content'   },
    { id: 'L02', title: 'Ahorro vs. inversión',                                       order: 2,  xp: 100, kind: 'simulator' },
    { id: 'L03', title: 'Variables clave: rendimiento, riesgo, plazo y liquidez',    order: 3,  xp: 75,  kind: 'quiz'      },
    { id: 'L04', title: 'Solo invierte tus excedentes',                               order: 4,  xp: 100, kind: 'simulator' },
    { id: 'L05', title: 'Mapa de instrumentos de inversión',                          order: 5,  xp: 100, kind: 'simulator' },
    { id: 'L06', title: 'Instrumentos de deuda: CETES, BONDES, PRLV',                order: 6,  xp: 50,  kind: 'content'   },
    { id: 'L07', title: 'Instrumentos de renta variable: fondos y acciones',         order: 7,  xp: 50,  kind: 'content'   },
    { id: 'L08', title: 'Perfil del inversionista',                                   order: 8,  xp: 75,  kind: 'quiz'      },
    { id: 'L09', title: 'Diversificación inteligente',                                order: 9,  xp: 100, kind: 'simulator' },
    { id: 'L10', title: 'Fraudes y promesas irreales',                                order: 10, xp: 50,  kind: 'content'   },
    { id: 'L11', title: 'Comisiones e impuestos',                                     order: 11, xp: 100, kind: 'simulator' },
    { id: 'L12', title: 'Inflación y rendimiento real',                               order: 12, xp: 100, kind: 'simulator' },
    { id: 'L13', title: 'Plan de inversión personal',                                 order: 13, xp: 150, kind: 'challenge' },
    { id: 'L14', title: 'Retroalimentación con Finni',                                order: 14, xp: 50,  kind: 'content'   },
    { id: 'L15', title: 'Reto final: tu primera inversión simulada',                  order: 15, xp: 150, kind: 'challenge' },
  ],
};
