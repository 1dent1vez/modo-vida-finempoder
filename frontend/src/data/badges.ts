// FinEmpoder — Definición de badges de logros
// Cada badge tiene una condición evaluada sobre BadgeStats.

import {
  BarChart3,
  BookOpen,
  Coins,
  Flame,
  Landmark,
  Microscope,
  Target,
  TrendingUp,
  Trophy,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export type BadgeStats = {
  totalCompleted: number;
  presupuestoProgress: number;
  ahorroProgress: number;
  inversionProgress: number;
  streakBest: number;
  streakCurrent: number;
  preDone: boolean;
  postDone: boolean;
};

export type Badge = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  hint: string;           // pista cuando está bloqueado
  condition: (stats: BadgeStats) => boolean;
};

export const BADGES: Badge[] = [
  {
    id: 'first_step',
    title: 'Primer paso',
    description: 'Completaste tu primera lección en FinEmpoder.',
    icon: Target,
    hint: 'Completa al menos 1 lección.',
    condition: (s) => s.totalCompleted >= 1,
  },
  {
    id: 'budget_explorer',
    title: 'Explorador del presupuesto',
    description: 'Avanzaste al menos el 50% del módulo Presupuestación.',
    icon: BarChart3,
    hint: 'Completa el 50% del módulo Presupuestación.',
    condition: (s) => s.presupuestoProgress >= 50,
  },
  {
    id: 'budget_master',
    title: 'Maestro del presupuesto',
    description: 'Completaste el 100% del módulo Presupuestación.',
    icon: Coins,
    hint: 'Completa todas las lecciones de Presupuestación.',
    condition: (s) => s.presupuestoProgress >= 100,
  },
  {
    id: 'savings_champion',
    title: 'Campeón del ahorro',
    description: 'Completaste el 100% del módulo Ahorro.',
    icon: Landmark,
    hint: 'Completa todas las lecciones de Ahorro.',
    condition: (s) => s.ahorroProgress >= 100,
  },
  {
    id: 'investor',
    title: 'Inversionista',
    description: 'Completaste el 100% del módulo Inversión.',
    icon: TrendingUp,
    hint: 'Completa todas las lecciones de Inversión.',
    condition: (s) => s.inversionProgress >= 100,
  },
  {
    id: 'streak_3',
    title: 'Constante',
    description: 'Mantuviste una racha de 3 días seguidos.',
    icon: Flame,
    hint: 'Estudia 3 días consecutivos.',
    condition: (s) => s.streakBest >= 3,
  },
  {
    id: 'streak_7',
    title: 'Imparable',
    description: 'Lograste una racha de 7 días. ¡Eso es dedicación!',
    icon: Zap,
    hint: 'Estudia 7 días consecutivos.',
    condition: (s) => s.streakBest >= 7,
  },
  {
    id: 'ten_lessons',
    title: 'Comprometido con tu dinero',
    description: 'Completaste 10 lecciones en total.',
    icon: BookOpen,
    hint: 'Completa 10 lecciones entre todos los módulos.',
    condition: (s) => s.totalCompleted >= 10,
  },
  {
    id: 'researcher',
    title: 'Colaborador de la comunidad',
    description: 'Participaste en el pre-test de la investigación.',
    icon: Microscope,
    hint: 'Completa el cuestionario de pre-test.',
    condition: (s) => s.preDone,
  },
  {
    id: 'finempoder_pro',
    title: 'FinEmpoder Pro',
    description: '¡Completaste los 3 módulos! Eres un experto en finanzas personales.',
    icon: Trophy,
    hint: 'Completa los 3 módulos al 100%.',
    condition: (s) =>
      s.presupuestoProgress >= 100 &&
      s.ahorroProgress >= 100 &&
      s.inversionProgress >= 100,
  },
];
