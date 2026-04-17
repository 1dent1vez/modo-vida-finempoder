import type { Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';

export async function getMyGamification(req: Request, res: Response) {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    const { data, error } = await supabase
      .from('gamification')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      // Sin registro aún — devolver defaults
      return res.json({ xp: 0, level: 1, streak: { current: 0, best: 0, lastActiveISO: null }, modules: {} });
    }

    return res.json({
      xp: data.xp,
      level: data.level,
      streak: {
        current: data.streak_current,
        best: data.streak_best,
        lastActiveISO: data.last_active_iso,
      },
      modules: data.module_progress,
      updatedAt: data.updated_at,
    });
  } catch {
    return res.status(500).json({ error: 'No se pudo obtener gamificación' });
  }
}
