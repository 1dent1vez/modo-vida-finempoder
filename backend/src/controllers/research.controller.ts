import type { Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';

const MODULES = ['presupuesto', 'ahorro', 'inversion'] as const;
const TOTAL_PER_MODULE = 15;

async function buildResearchStatus(userId: string) {
  const [{ data: pre }, { data: post }, { data: lessons }] = await Promise.all([
    supabase.from('questionnaire_results').select('finempoderindex').eq('user_id', userId).eq('type', 'pre').single(),
    supabase.from('questionnaire_results').select('finempoderindex').eq('user_id', userId).eq('type', 'post').single(),
    supabase.from('lesson_progress').select('module_id').eq('user_id', userId).eq('completed', true),
  ]);

  const moduleProgress: Record<string, number> = {};
  for (const mod of MODULES) {
    const completed = (lessons ?? []).filter((l) => l.module_id === mod).length;
    moduleProgress[mod] = Math.min(100, Math.round((completed / TOTAL_PER_MODULE) * 100));
  }
  const allModulesDone = MODULES.every((m) => (moduleProgress[m] ?? 0) >= 100);

  return {
    preDone: !!pre,
    postDone: !!post,
    preScore: pre?.finempoderindex ?? null,
    postScore: post?.finempoderindex ?? null,
    moduleProgress,
    allModulesDone,
  };
}

export async function getResearchStatusByUserId(userId: string) {
  return buildResearchStatus(userId);
}

export async function getMyResearchStatus(req: Request, res: Response) {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ error: 'No autenticado' });
    return res.json(await buildResearchStatus(userId));
  } catch {
    return res.status(500).json({ error: 'No se pudo obtener el estado' });
  }
}

// requireRole('admin') aplicado en la capa de ruta (routes/research.ts)
export async function listStudentsSummary(_req: Request, res: Response) {
  try {
    const { data: userIds } = await supabase
      .from('lesson_progress')
      .select('user_id')
      .eq('completed', true);

    const unique = [...new Set((userIds ?? []).map((r) => r.user_id as string))];

    const summaries = await Promise.all(unique.map(async (uid) => ({
      userId: uid,
      ...(await buildResearchStatus(uid)),
    })));

    return res.json({ summaries });
  } catch {
    return res.status(500).json({ error: 'No se pudo obtener el resumen' });
  }
}
