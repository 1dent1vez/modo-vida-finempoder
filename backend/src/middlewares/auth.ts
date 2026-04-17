import type { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase.js';
import type { AuthPayload } from '../types/express.js';

export async function authGuard(req: Request, res: Response, next: NextFunction) {
  const header = req.header('Authorization') || req.header('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Token inválido o expirado' });

  req.user = { sub: user.id, email: user.email ?? '' } as AuthPayload;
  next();
}
