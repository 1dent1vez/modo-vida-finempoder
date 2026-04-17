import type { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase.js';

/**
 * Middleware de autorización por rol.
 * Debe ejecutarse después de authGuard (necesita req.user.sub).
 *
 * Ejemplo de uso:
 *   router.get('/admin-only', authGuard, requireRole('admin'), handler)
 */
export function requireRole(role: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (profile?.role !== role) {
      return res.status(403).json({ error: 'Acceso restringido a administradores' });
    }

    next();
  };
}
