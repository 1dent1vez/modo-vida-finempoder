import type { Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { computeLevel, applyStreak, type GamificationRow } from '../lib/gamificationHelpers.js';

const MODULES = ['presupuesto', 'ahorro', 'inversion'] as const;
type ModuleId = (typeof MODULES)[number];

const moduleIdSchema = z.enum(MODULES);

const lessonCompletionSchema = z.object({
  moduleId: moduleIdSchema,
  lessonId: z.string().min(2),
  completedAt: z
    .string()
    .datetime()
    .refine((v) => new Date(v) <= new Date(), { message: 'completedAt no puede ser en el futuro' })
    .optional(),
});

const MODULE_TOTALS: Record<ModuleId, number> = {
  presupuesto: 15,
  ahorro: 15,
  inversion: 15,
};

async function ensureGamification(userId: string): Promise<GamificationRow> {
  const { data: existing } = await supabase
    .from('gamification')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (existing) return existing as GamificationRow;

  const defaults = {
    user_id: userId,
    xp: 0,
    level: 1,
    streak_current: 0,
    streak_best: 0,
    last_active_iso: null,
    module_progress: {},
  };
  const { data: created, error } = await supabase
    .from('gamification')
    .insert(defaults)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return created as GamificationRow;
}

export async function recordLessonCompletion(req: Request, res: Response) {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    const parsed = lessonCompletionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors });
    }
    const payload = parsed.data;
    const completedAt = payload.completedAt ? new Date(payload.completedAt) : new Date();

    // ¿Ya completada?
    const { data: existing } = await supabase
      .from('lesson_progress')
      .select('completed')
      .eq('user_id', userId)
      .eq('module_id', payload.moduleId)
      .eq('lesson_id', payload.lessonId)
      .single();

    const alreadyCompleted = existing?.completed === true;

    // Upsert progreso
    const { data: saved, error: upsertErr } = await supabase
      .from('lesson_progress')
      .upsert(
        {
          user_id: userId,
          module_id: payload.moduleId,
          lesson_id: payload.lessonId,
          completed: true,
          completed_at: completedAt.toISOString(),
        },
        { onConflict: 'user_id,module_id,lesson_id' }
      )
      .select()
      .single();

    if (upsertErr) throw new Error(upsertErr.message);

    // Calcular progreso del módulo
    const { count: completedCount } = await supabase
      .from('lesson_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('module_id', payload.moduleId)
      .eq('completed', true);

    const totalLessons = MODULE_TOTALS[payload.moduleId] ?? 15;
    const progressPercent = Math.min(100, Math.round(((completedCount ?? 0) / totalLessons) * 100));

    // Actualizar gamification si es primera vez
    const gamification = await ensureGamification(userId);
    if (!alreadyCompleted) {
      gamification.xp += 10;
      gamification.level = computeLevel(gamification.xp);
      applyStreak(gamification, completedAt);
      gamification.module_progress[payload.moduleId] = progressPercent;

      await supabase
        .from('gamification')
        .update({
          xp: gamification.xp,
          level: gamification.level,
          streak_current: gamification.streak_current,
          streak_best: gamification.streak_best,
          last_active_iso: gamification.last_active_iso,
          module_progress: gamification.module_progress,
        })
        .eq('user_id', userId);
    }

    return res.status(alreadyCompleted ? 200 : 201).json({
      moduleId: payload.moduleId,
      lessonId: payload.lessonId,
      completedAt: saved?.completed_at ?? completedAt,
      progressPercent,
      gamification: {
        xp: gamification.xp,
        level: gamification.level,
        streakCurrent: gamification.streak_current,
        streakBest: gamification.streak_best,
        lastActiveISO: gamification.last_active_iso,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error interno al registrar lección' });
  }
}

export async function getModuleProgress(req: Request, res: Response) {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    const moduleId = moduleIdSchema.safeParse(req.params.moduleId);
    if (!moduleId.success) return res.status(400).json({ error: 'moduleId inválido' });

    const totalLessons = MODULE_TOTALS[moduleId.data] ?? 15;

    const { data: rows } = await supabase
      .from('lesson_progress')
      .select('lesson_id')
      .eq('user_id', userId)
      .eq('module_id', moduleId.data)
      .eq('completed', true);

    const lessonsCompleted = (rows ?? []).map((r) => r.lesson_id as string);
    const progressPercent = Math.min(100, Math.round((lessonsCompleted.length / totalLessons) * 100));

    const gamification = await ensureGamification(userId);

    return res.json({
      moduleId: moduleId.data,
      lessonsCompleted,
      totalLessons,
      progressPercent,
      gamification: {
        xp: gamification.xp,
        level: gamification.level,
        streakCurrent: gamification.streak_current,
        streakBest: gamification.streak_best,
        lastActiveISO: gamification.last_active_iso,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error interno al obtener progreso' });
  }
}
