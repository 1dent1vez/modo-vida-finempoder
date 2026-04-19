import type { ModuleContentConfig } from '../types';

export const moduleConfig: ModuleContentConfig = {
  id: 'presupuesto',
  title: 'Presupuesto Personal',
  description: 'Aprende a construir y mantener un presupuesto que funcione para ti.',
  lessons: [
    { id: 'L01', title: 'Por qué hacer un presupuesto?',                      order: 1,  xp: 50,  kind: 'content'   },
    { id: 'L02', title: 'Ingresos: fijos y variables',                         order: 2,  xp: 75,  kind: 'quiz'      },
    { id: 'L03', title: 'Gastos fijos, variables y hormiga',                   order: 3,  xp: 100, kind: 'simulator' },
    { id: 'L04', title: 'Cómo registrar ingresos y gastos',                    order: 4,  xp: 100, kind: 'simulator' },
    { id: 'L05', title: 'Clasifica tus gastos (Drag & Drop)',                  order: 5,  xp: 100, kind: 'simulator' },
    { id: 'L06', title: 'Cálculo de balance mensual (mini-calculadora)',       order: 6,  xp: 100, kind: 'simulator' },
    { id: 'L07', title: 'Ajuste del presupuesto (simulación de decisiones)',   order: 7,  xp: 100, kind: 'simulator' },
    { id: 'L08', title: 'Fugas financieras y crisis (podcast interactivo)',    order: 8,  xp: 50,  kind: 'content'   },
    { id: 'L09', title: 'La regla 50-30-20 (infografía dinámica)',             order: 9,  xp: 50,  kind: 'content'   },
    { id: 'L10', title: 'Plan de metas financieras SMART (reto guiado)',       order: 10, xp: 150, kind: 'challenge' },
    { id: 'L11', title: 'Presupuesto familiar y app digital (tutorial)',       order: 11, xp: 50,  kind: 'content'   },
    { id: 'L12', title: 'Presupuesto en tiempos de crisis (simulación)',       order: 12, xp: 100, kind: 'simulator' },
    { id: 'L13', title: 'Retroalimentación con Finni (micro-feedback)',        order: 13, xp: 50,  kind: 'content'   },
    { id: 'L14', title: 'Evaluación: ¿Controlas tus finanzas? (quiz)',         order: 14, xp: 75,  kind: 'quiz'      },
    { id: 'L15', title: 'Reto final: Crea tu presupuesto real',                order: 15, xp: 150, kind: 'challenge' },
  ],
};
