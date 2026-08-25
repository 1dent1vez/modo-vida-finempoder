// FinEmpoder — Insignias por SERIES con tiers (F2-GAMIFICACION).
// La evaluación es SIEMPRE derivada del progreso real (BadgeStats), nunca
// persistida; lo único que se guarda es qué tier viste (ver
// lib/badgeCelebration.ts con la key 'fe_badges_state').

import {
  BarChart3,
  BookOpen,
  Flame,
  Landmark,
  TrendingUp,
  Trophy,
  type LucideIcon,
} from 'lucide-react';

export type TierLevel = 1 | 2 | 3;

export type BadgeStats = {
  totalCompleted: number;
  presupuestoProgress: number;
  ahorroProgress: number;
  inversionProgress: number;
  streakBest: number;
  streakCurrent: number;
};

export type BadgeTier = {
  nivel: TierLevel;
  /** 'Bronce' | 'Plata' | 'Oro' */
  titulo: string;
  condicion: (s: BadgeStats) => boolean;
  /** Pista de qué se necesita para este tier (UI). */
  hint: string;
};

export type BadgeSeries = {
  /** id de la serie (exacto: presupuesto, ahorro, inversion, racha, lecciones, finempoder_pro). */
  id: string;
  tituloBase: string;
  icon: LucideIcon;
  descripcion: string;
  /** Pista genérica cuando la serie está completamente bloqueada. */
  hint: string;
  /** 1-3 tiers en orden ascendente. La serie corona (finempoder_pro) tiene UN
   *  solo tier lograble (Oro) por diseño: no existe Bronce/Plata para ella. */
  tiers: BadgeTier[];
};

export const BADGES: BadgeSeries[] = [
  {
    id: 'presupuesto',
    tituloBase: 'Presupuestación',
    icon: BarChart3,
    descripcion: 'Tu dinero ya tiene lugar en tu plan, eso es poderoso.',
    hint: 'Completa lecciones del módulo Presupuestación.',
    tiers: [
      {
        nivel: 1,
        titulo: 'Bronce',
        hint: 'Completa el 30% del módulo Presupuestación.',
        condicion: (s) => s.presupuestoProgress >= 30,
      },
      {
        nivel: 2,
        titulo: 'Plata',
        hint: 'Completa el 60% del módulo Presupuestación.',
        condicion: (s) => s.presupuestoProgress >= 60,
      },
      {
        nivel: 3,
        titulo: 'Oro',
        hint: 'Completa el 100% del módulo Presupuestación.',
        condicion: (s) => s.presupuestoProgress >= 100,
      },
    ],
  },
  {
    id: 'ahorro',
    tituloBase: 'Ahorro',
    icon: Landmark,
    descripcion: 'Ese colchón crece, y contigo la tranquilidad.',
    hint: 'Completa lecciones del módulo Ahorro.',
    tiers: [
      {
        nivel: 1,
        titulo: 'Bronce',
        hint: 'Completa el 30% del módulo Ahorro.',
        condicion: (s) => s.ahorroProgress >= 30,
      },
      {
        nivel: 2,
        titulo: 'Plata',
        hint: 'Completa el 60% del módulo Ahorro.',
        condicion: (s) => s.ahorroProgress >= 60,
      },
      {
        nivel: 3,
        titulo: 'Oro',
        hint: 'Completa el 100% del módulo Ahorro.',
        condicion: (s) => s.ahorroProgress >= 100,
      },
    ],
  },
  {
    id: 'inversion',
    tituloBase: 'Inversión',
    icon: TrendingUp,
    descripcion: 'Tu yo del futuro está aplaudiendo desde hoy.',
    hint: 'Completa lecciones del módulo Inversión.',
    tiers: [
      {
        nivel: 1,
        titulo: 'Bronce',
        hint: 'Completa el 30% del módulo Inversión.',
        condicion: (s) => s.inversionProgress >= 30,
      },
      {
        nivel: 2,
        titulo: 'Plata',
        hint: 'Completa el 60% del módulo Inversión.',
        condicion: (s) => s.inversionProgress >= 60,
      },
      {
        nivel: 3,
        titulo: 'Oro',
        hint: 'Completa el 100% del módulo Inversión.',
        condicion: (s) => s.inversionProgress >= 100,
      },
    ],
  },
  {
    id: 'racha',
    tituloBase: 'Racha',
    icon: Flame,
    descripcion: 'La constancia ya es tu apellido.',
    hint: 'Estudia días consecutivos.',
    tiers: [
      {
        nivel: 1,
        titulo: 'Bronce',
        hint: 'Estudia 3 días seguidos.',
        condicion: (s) => s.streakBest >= 3,
      },
      {
        nivel: 2,
        titulo: 'Plata',
        hint: 'Estudia 7 días seguidos.',
        condicion: (s) => s.streakBest >= 7,
      },
      {
        nivel: 3,
        titulo: 'Oro',
        hint: 'Estudia 14 días seguidos.',
        condicion: (s) => s.streakBest >= 14,
      },
    ],
  },
  {
    id: 'lecciones',
    tituloBase: 'Lecciones completadas',
    icon: BookOpen,
    descripcion: 'Cada lección te acerca más a dueño de tu dinero.',
    hint: 'Completa lecciones entre todos los módulos.',
    tiers: [
      {
        nivel: 1,
        titulo: 'Bronce',
        hint: 'Completa al menos 1 lección.',
        condicion: (s) => s.totalCompleted >= 1,
      },
      {
        nivel: 2,
        titulo: 'Plata',
        hint: 'Completa 10 lecciones en total.',
        condicion: (s) => s.totalCompleted >= 10,
      },
      {
        nivel: 3,
        titulo: 'Oro',
        hint: 'Completa 25 lecciones en total.',
        condicion: (s) => s.totalCompleted >= 25,
      },
    ],
  },
  {
    id: 'finempoder_pro',
    tituloBase: 'FinEmpoder Pro',
    icon: Trophy,
    descripcion: 'Completaste los 3 módulos. Eres otro nivel.',
    hint: 'Completa los 3 módulos al 100%.',
    // Serie corona: por diseño solo existe el tier Oro; no hay Bronce ni Plata.
    tiers: [
      {
        nivel: 3,
        titulo: 'Oro',
        hint: 'Completa los 3 módulos al 100%.',
        condicion: (s) =>
          s.presupuestoProgress >= 100 &&
          s.ahorroProgress >= 100 &&
          s.inversionProgress >= 100,
      },
    ],
  },
];

/**
 * Tier máximo logrado en una serie: 0 si ninguno, 1..3 según el tier.
 * Evalúa todas las condiciones en orden ascendente; con condiciones
 * monotónicas devuelve siempre el tier más alto alcanzado.
 */
export function maxTier(serie: BadgeSeries, s: BadgeStats): 0 | TierLevel {
  let logrado: 0 | TierLevel = 0;
  for (const tier of serie.tiers) {
    if (tier.condicion(s)) logrado = tier.nivel;
  }
  return logrado;
}

/** Título de UI de una serie con su tier: 'Presupuestación · Bronce'
 *  (nivel 0 = sin tier → solo el título base). */
export function serieTitulo(serie: BadgeSeries, nivel: 0 | TierLevel): string {
  const tier = nivel > 0 ? serie.tiers.find((t) => t.nivel === nivel) : undefined;
  return tier ? `${serie.tituloBase} · ${tier.titulo}` : serie.tituloBase;
}

/** Hint del siguiente tier a desbloquear (o la pista genérica si está todo bloqueado). */
export function siguienteHint(serie: BadgeSeries, nivel: 0 | TierLevel): string {
  const next = serie.tiers.find((t) => t.nivel === nivel + 1);
  return next?.hint ?? serie.hint;
}

/**
 * Stats de evaluación derivadas del progreso real (nunca persistidas).
 * totalCompleted conserva el cálculo histórico de la app: cada módulo al 100%
 * equivale a sus 15 lecciones, así que (suma de % / 100) × 15 = lecciones hechas.
 */
export function buildBadgeStats(input: {
  presupuestoProgress: number;
  ahorroProgress: number;
  inversionProgress: number;
  streakBest: number;
  streakCurrent: number;
}): BadgeStats {
  const totalCompleted = Math.round(
    ((input.presupuestoProgress + input.ahorroProgress + input.inversionProgress) / 100) * 15
  );
  return { ...input, totalCompleted };
}
