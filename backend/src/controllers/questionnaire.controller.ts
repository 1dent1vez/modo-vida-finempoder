import type { Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { computeFinempoderIndex, computeScore } from '../utils/finempoderIndex.js';
import { getResearchStatusByUserId } from './research.controller.js';

const answerSchema = z.object({
  questionId: z.string().min(1),
  questionText: z.string().optional(),
  value: z.number().min(0),
});

const bodySchema = z.object({
  answers: z.array(answerSchema).min(1),
});

const typeSchema = z.enum(['pre', 'post']);

export async function submitQuestionnaire(req: Request, res: Response) {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    const typeParsed = typeSchema.safeParse(req.params.type);
    if (!typeParsed.success) return res.status(400).json({ error: 'Tipo inválido, usa pre o post' });

    const bodyParsed = bodySchema.safeParse(req.body);
    if (!bodyParsed.success) {
      return res.status(400).json({ error: 'Datos inválidos', details: bodyParsed.error.flatten().fieldErrors });
    }

    const type = typeParsed.data;
    const { answers } = bodyParsed.data;
    const score = computeScore(answers);
    const finempoderindex = computeFinempoderIndex(answers);

    const { data: saved, error } = await supabase
      .from('questionnaire_results')
      .upsert(
        { user_id: userId, type, answers, score, finempoderindex },
        { onConflict: 'user_id,type' }
      )
      .select()
      .single();

    if (error) throw new Error(error.message);

    const status = await getResearchStatusByUserId(userId);

    return res.status(201).json({
      type,
      score,
      finempoderIndex: finempoderindex,
      createdAt: saved?.created_at,
      updatedAt: saved?.updated_at,
      researchStatus: status,
    });
  } catch {
    return res.status(500).json({ error: 'Error al guardar cuestionario' });
  }
}

