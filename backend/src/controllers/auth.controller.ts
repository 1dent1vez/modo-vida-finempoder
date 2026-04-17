import type { Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';

const registerSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    name: z.string().min(2).optional(),
    career: z.string().optional(),
    age: z.number().int().min(12).max(100).optional(),
    phone: z.string().min(7).max(20).optional(),
    acceptTerms: z.boolean().optional(),
  })
  .strip();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors });
  }
  const data = parsed.data;

  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });

  if (error) {
    if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('user already registered')) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }
    return res.status(400).json({ error: 'No se pudo crear la cuenta' });
  }

  if (authData.user) {
    await supabase.from('profiles').insert({
      id: authData.user.id,
      name: data.name ?? null,
      career: data.career ?? null,
      age: data.age ?? null,
      phone: data.phone ?? null,
    });
  }

  return res.status(201).json({
    token: authData.session?.access_token ?? null,
    refreshToken: authData.session?.refresh_token ?? null,
    user: {
      _id: authData.user?.id,
      email: authData.user?.email,
      name: data.name ?? null,
    },
  });
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }
  const { email, password } = parsed.data;

  const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !authData.session) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', authData.user.id)
    .single();

  return res.json({
    token: authData.session.access_token,
    refreshToken: authData.session.refresh_token,
    user: {
      _id: authData.user.id,
      email: authData.user.email,
      name: profile?.name ?? null,
    },
  });
}
