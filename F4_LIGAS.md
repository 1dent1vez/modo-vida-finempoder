# F4-LIGAS — Ligas semanales multijugador

Fecha: 2026-08-25 · Rama: `f4-ligas` (base `qa-identivezz @ cead829`) · Sin push, sin merge, sin deploy.

La migración SQL **NO se aplica desde este repo**: la aplica el orquestador con MCP
desde el archivo versionado `supabase/migrations/003_league_schema.sql` (SQL completo
al final de este documento). El frontend y el backend corren contra el proyecto
Supabase vivo `pxjxktpdxnqiulfyskuk` (login Magic Link ya funciona).

---

## Qué se entrega

- Migración `supabase/migrations/003_league_schema.sql`: tablas `leagues`,
  `league_members`, `league_entries`, RLS estricto, trigger de `invite_code`
  inmutable, helper `is_league_member` y los RPC `join_league`,
  `upsert_league_entry`, `get_league_ranking`.
- Tab "Ligas" en el navbar (`/app/ligas`): crear liga con código, unirse con
  código, ranking semanal con medallas de color (sin emojis) y fila del usuario
  resaltada. Guest mode ve una invitación amable a crear cuenta.
- Sync semanal: al completar lección (evento `fe:lesson-completed`, debounce 3s),
  tras crear/unirse y al abrir `/app/ligas`, se sube la métrica de cada liga con
  `upsert_league_entry`.

## Decisiones

### Ranking: SECURITY DEFINER con chequeo explícito (NO view + RLS)

Una view con `security_invoker` no puede leer `auth.users` sin otorgar grants
sobre una tabla del esquema `auth` (mala práctica). Una view `SECURITY DEFINER`
sin chequeo explícito filtraría datos a cualquiera que la llame. El patrón elegido
es el más simple y seguro: `get_league_ranking` es `SECURITY DEFINER`, valida
dentro que el llamador sea miembro (`IF NOT EXISTS ... RETURN;` = conjunto vacío)
y hace `LEFT JOIN auth.users` para el nombre. Documentado también en el propio SQL.

### Semana lunes-domingo en hora LOCAL

La semana de la liga es lunes a domingo en la hora local del usuario
(America/Mexico_City, UTC-6), igual que el day key de la racha. `weekStartISO`
usa getters LOCALES y **nunca** `toISOString`: un lunes local a las 00:30 no debe
leerse como el domingo UTC anterior. `getWeekLessons` filtra `lessonProgress`
con `completedAt >= lunes && < lunes + 7` (a diferencia de `weekStats`, que usa
una ventana móvil de 7 días).

### Manejo de errores de red

- Sync semanal: fallos solo se loguean con `console.error`; no bloquean la UI y
  el siguiente evento (o abrir la pestaña) reintenta de forma natural.
- Lista de ligas: si la red falla se muestra la caché Dexie (`leagues:v1`); sin
  caché, error suave "No pudimos cargar tus ligas. Revisa tu conexión.".
- Ranking: si la red falla se muestra la caché Dexie
  (`league-ranking:<leagueId>:<weekStart>`), sin indicador adicional (documentado).
- Unirme: si el RPC devuelve `null` → "Ese código no es válido"; si la petición
  falla → "No pudimos validar el código. Revisa tu conexión.".

### Caché Dexie

`userLessonData` (tabla v5 existente) con `moduleId: 'ligas'` y llaves
`leagues:v1` y `league-ranking:<leagueId>:<weekStart>`, por `userId`. Misma
mecánica que `lessonData.repository`.

### Crear liga y RLS

El cliente inserta la liga (`supabase.from('leagues').insert`) y el dueño se
inscribe vía el RPC `join_league` con el código generado (inserta su fila en
`league_members`, permitido por la política `league_members: usuario se une`).
Así las políticas `leagues: miembro lee` (y el ranking) funcionan para el dueño
sin relajar la regla de que solo miembros leen. El `invite_code` se genera en el
cliente con `crypto.getRandomValues` y alfabeto sin ambiguos
(`ABCDEFGHJKLMNPQRSTUVWXYZ23456789`, 6 caracteres); el trigger
`league_invite_code_inmutable` impide cambiarlo después.

## Copy exacto (verbatim)

- Guest: título "Las ligas necesitan cuenta", botón "Entrar con tu correo"
  (navega a `/auth`).
- Sin ligas: "Aún no estás en una liga", botones "Crear liga" y
  "Unirme con código".
- Reto semanal: "Reto de la semana: Lecciones" / "Reto de la semana: XP" /
  "Reto de la semana: Racha".
- Modal crear: label "Nombre de la liga", opciones "Lecciones", "XP", "Racha",
  botón "Crear"; error "El nombre debe tener entre 3 y 40 caracteres".
- Modal unirme: label "Código", botón "Unirme"; error "Ese código no es válido";
  error de red "No pudimos validar el código. Revisa tu conexión.".
- Éxito crear: "Liga creada", código en grande, botones "Copiar código",
  "Compartir código", "Ver liga"; feedback de copiado "Copiado".
- WhatsApp: "Únete a mi liga en FinEMPODER con el código XXXXXX" (vía `wa.me`).
- Posición: "Tu posición: 1º" (o "Sin datos esta semana"); ranking con 1º/2º/3º
  (oro/plata/bronce con tokens warning/info/success, sin emojis) y el resto solo
  número. Valores: "N lecciones", "N XP", "N días".
- Sin puntajes: "Aún no hay puntajes esta semana". Nombre del participante:
  trim del `raw_user_meta_data->>'name'` o "Usuario".
- Errores: "No pudimos crear tu liga. Intenta de nuevo.",
  "No pudimos cargar tus ligas. Revisa tu conexión.".
- Notificaciones: "Liga creada", "Te uniste a la liga".

Cero emojis en todo (incluidos vacíos, errores y medallas).

## Cómo probar (qa.finempoder.com.mx)

1. Aplicar la migración con MCP (orquestador).
2. `cd frontend && npm install && npm run dev` (o el deploy de preview).
3. Sin sesión: abrir `/app/ligas` → card "Las ligas necesitan cuenta" →
   "Entrar con tu correo" → Magic Link.
4. Con sesión: crear liga (nombre + métrica) → código en grande → copiar →
   "Ver liga" → ranking. Abrir otra sesión/pestaña y unirse con el código →
   "Te uniste a la liga".
5. Completar una lección y volver a `/app/ligas`: la posición se actualiza tras
   el sync (3s) y el ranking muestra el valor de la semana.
6. Ranking con 3+ participantes: 1º/2º/3º con colores de medalla, fila propia
   resaltada.
7. Código inválido (p.ej. `ZZZZZZ`): "Ese código no es válido".

## SQL completo (para el orquestador)

Archivo versionado: `supabase/migrations/003_league_schema.sql`. Contenido:

-- FinEmpoder — Ligas semanales multijugador (F4-LIGAS)
-- Fecha: 2026-08-25
-- Propósito: tablas leagues / league_members / league_entries con RLS estricto
-- y RPCs (join_league, upsert_league_entry, get_league_ranking) para el modo
-- multijugador semanal. La migración la aplica el orquestador con MCP; aquí
-- solo se versiona el archivo.

-- ────────────────────────────────────────────────
-- LEAGUES (ligas creadas por un usuario dueño)
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.leagues (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL CHECK (char_length(name) BETWEEN 3 AND 40),
  -- Código de invitación de 6 caracteres A-Z0-9, generado en el cliente con
  -- crypto.getRandomValues (alfabeto sin ambiguos O/0/I/1).
  invite_code TEXT NOT NULL UNIQUE CHECK (invite_code ~ '^[A-Z0-9]{6}$'),
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Métrica del reto semanal: lecciones, XP o racha.
  metric      TEXT NOT NULL DEFAULT 'lessons' CHECK (metric IN ('lessons', 'xp', 'streak')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────
-- LEAGUE_MEMBERS (membresías; PK compuesta = unique league_id + user_id)
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.league_members (
  league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (league_id, user_id)
);

-- ────────────────────────────────────────────────
-- LEAGUE_ENTRIES (puntaje semanal por usuario; PK compuesta =
-- unique league_id + user_id + week_start)
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.league_entries (
  league_id    UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start   DATE NOT NULL,          -- lunes de la semana (hora local MX)
  metric_value INT NOT NULL DEFAULT 0, -- lecciones / XP / días de racha
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (league_id, user_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_league_members_user   ON public.league_members (user_id);
CREATE INDEX IF NOT EXISTS idx_league_members_league ON public.league_members (league_id);
CREATE INDEX IF NOT EXISTS idx_league_entries_week   ON public.league_entries (league_id, week_start);

-- ────────────────────────────────────────────────
-- HELPER is_league_member (evita recursión RLS)
-- ────────────────────────────────────────────────
-- Las políticas SELECT de las tres tablas necesitan saber si el llamador es
-- miembro de una liga consultando league_members. Una subconsulta directa
-- dentro de una política de league_members (o de otra tabla que a su vez la
-- consulte) dispara recursión RLS infinita. Esta función SECURITY DEFINER
-- corre como su dueño (postgres) y por lo tanto NO pasa por RLS: es la pieza
-- que rompe el ciclo. search_path fijo para evitar hijacking de funciones.
CREATE OR REPLACE FUNCTION public.is_league_member(p_league_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.league_members
    WHERE league_id = p_league_id AND user_id = p_user_id
  );
$$;

REVOKE ALL ON FUNCTION public.is_league_member(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_league_member(uuid, uuid) TO authenticated;

-- ────────────────────────────────────────────────
-- TRIGGER: invite_code inmutable
-- ────────────────────────────────────────────────
-- RLS no soporta OLD/NEW dentro de políticas (solo triggers), así que la
-- invariante "el invite_code no se puede cambiar" se fuerza con un trigger
-- BEFORE UPDATE que aborta si el valor cambia. La política UPDATE sigue
-- limitada al dueño (USING/WITH CHECK owner_id = auth.uid()).
CREATE OR REPLACE FUNCTION public.league_invite_code_inmutable()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.invite_code IS DISTINCT FROM OLD.invite_code THEN
    RAISE EXCEPTION 'el invite_code de una liga no se puede cambiar';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_leagues_invite_code_inmutable
  BEFORE UPDATE ON public.leagues
  FOR EACH ROW EXECUTE FUNCTION public.league_invite_code_inmutable();

-- updated_at automático en league_entries (función de 001).
CREATE TRIGGER trg_league_entries_updated_at
  BEFORE UPDATE ON public.league_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ────────────────────────────────────────────────
-- RLS: LEAGUES
-- ────────────────────────────────────────────────
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;

-- SELECT: solo miembros de la liga pueden leerla (el dueño se hace miembro
-- al crearla, insertando su fila en league_members).
CREATE POLICY "leagues: miembro lee" ON public.leagues
  FOR SELECT USING (public.is_league_member(id, auth.uid()));

-- INSERT: solo creas ligas donde tú eres el dueño.
CREATE POLICY "leagues: dueño crea" ON public.leagues
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- UPDATE: solo el dueño, y el trigger garantiza que invite_code no cambie.
CREATE POLICY "leagues: dueño actualiza" ON public.leagues
  FOR UPDATE USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- DELETE: solo el dueño puede borrar su liga.
CREATE POLICY "leagues: dueño borra" ON public.leagues
  FOR DELETE USING (owner_id = auth.uid());

-- ────────────────────────────────────────────────
-- RLS: LEAGUE_MEMBERS
-- ────────────────────────────────────────────────
ALTER TABLE public.league_members ENABLE ROW LEVEL SECURITY;

-- SELECT: solo miembros de ESA liga ven sus membresías.
CREATE POLICY "league_members: miembro lee" ON public.league_members
  FOR SELECT USING (public.is_league_member(league_id, auth.uid()));

-- INSERT: solo te puedes unir tú mismo (user_id = auth.uid()). La validez del
-- código la decide el RPC join_league, no esta política; el dueño usa la
-- misma vía para auto-inscribirse al crear la liga.
CREATE POLICY "league_members: usuario se une" ON public.league_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- DELETE: solo puedes salirte tú mismo.
CREATE POLICY "league_members: usuario sale" ON public.league_members
  FOR DELETE USING (user_id = auth.uid());

-- ────────────────────────────────────────────────
-- RLS: LEAGUE_ENTRIES
-- ────────────────────────────────────────────────
ALTER TABLE public.league_entries ENABLE ROW LEVEL SECURITY;

-- SELECT: solo miembros de la liga ven sus puntajes semanales.
CREATE POLICY "league_entries: miembro lee" ON public.league_entries
  FOR SELECT USING (public.is_league_member(league_id, auth.uid()));

-- INSERT: solo puedes registrar TU propio puntaje.
CREATE POLICY "league_entries: usuario inserta el suyo" ON public.league_entries
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- UPDATE: solo puedes actualizar TU propio puntaje.
CREATE POLICY "league_entries: usuario actualiza el suyo" ON public.league_entries
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ────────────────────────────────────────────────
-- RPC join_league(p_invite_code text) → uuid
-- ────────────────────────────────────────────────
-- Valida el formato (6 caracteres A-Z0-9), busca la liga por código y, si
-- existe, inserta la membresía del llamador (ON CONFLICT DO NOTHING, idem-
-- potente). Devuelve NULL si el código no es válido o no existe: el cliente
-- muestra "Ese código no es válido". SECURITY DEFINER porque necesita leer
-- leagues por código y escribir league_members sin depender del RLS del
-- llamador (que aún no es miembro).
CREATE OR REPLACE FUNCTION public.join_league(p_invite_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_code      text := upper(trim(p_invite_code));
  v_league_id uuid;
BEGIN
  IF v_code !~ '^[A-Z0-9]{6}$' THEN
    RETURN NULL;
  END IF;

  SELECT id INTO v_league_id
  FROM public.leagues
  WHERE invite_code = v_code;

  IF v_league_id IS NULL THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.league_members (league_id, user_id)
  VALUES (v_league_id, auth.uid())
  ON CONFLICT (league_id, user_id) DO NOTHING;

  RETURN v_league_id;
END;
$$;

REVOKE ALL ON FUNCTION public.join_league(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.join_league(text) TO authenticated;

-- ────────────────────────────────────────────────
-- RPC upsert_league_entry(p_league_id, p_week_start, p_metric_value)
-- ────────────────────────────────────────────────
-- Registra (o actualiza) el puntaje semanal del llamador. SECURITY DEFINER
-- BYPASSA RLS: por eso DENTRO del RPC se valida explícitamente la membresía
-- (IF NOT EXISTS ... RAISE) y el user_id SIEMPRE es auth.uid(); un llamador
-- nunca puede escribir puntajes de otra persona aunque conozca el league_id.
CREATE OR REPLACE FUNCTION public.upsert_league_entry(
  p_league_id   uuid,
  p_week_start  date,
  p_metric_value integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.league_members
    WHERE league_id = p_league_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'no eres miembro de esta liga';
  END IF;

  INSERT INTO public.league_entries (league_id, user_id, week_start, metric_value)
  VALUES (p_league_id, auth.uid(), p_week_start, p_metric_value)
  ON CONFLICT (league_id, user_id, week_start)
  DO UPDATE SET metric_value = EXCLUDED.metric_value, updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.upsert_league_entry(uuid, date, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upsert_league_entry(uuid, date, integer) TO authenticated;

-- ────────────────────────────────────────────────
-- RPC get_league_ranking(p_league_id, p_week_start)
-- ────────────────────────────────────────────────
-- DECISIÓN: SECURITY DEFINER + validación de membresía en vez de view+RLS.
-- Una view con security_invoker no puede leer auth.users sin otorgar grants
-- sobre una tabla del esquema auth (mala práctica); y una view SECURITY
-- DEFINER sin chequeo explícito filtraría datos a cualquiera que la llame.
-- Este patrón es el más simple y seguro: si el llamador no es miembro, se
-- devuelve un conjunto vacío (no se revela ni siquiera la existencia de la
-- liga). El nombre sale de auth.users.raw_user_meta_data->>'name' (trim, o
-- 'Usuario' si está vacío). La posición es row_number() por metric_value
-- DESC (empates desempatan por user_id para mantener orden estable).
CREATE OR REPLACE FUNCTION public.get_league_ranking(
  p_league_id  uuid,
  p_week_start date
)
RETURNS TABLE (
  user_id      uuid,
  name         text,
  metric_value int,
  position     bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.league_members
    WHERE league_id = p_league_id AND user_id = auth.uid()
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    e.user_id,
    COALESCE(NULLIF(trim(u.raw_user_meta_data->>'name'), ''), 'Usuario') AS name,
    e.metric_value,
    row_number() OVER (ORDER BY e.metric_value DESC, e.user_id) AS position
  FROM public.league_entries e
  LEFT JOIN auth.users u ON u.id = e.user_id
  WHERE e.league_id = p_league_id AND e.week_start = p_week_start
  ORDER BY e.metric_value DESC, e.user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.get_league_ranking(uuid, date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_league_ranking(uuid, date) TO authenticated;

## Hardening futuro (sugerencias QA — gate Lupa 2026-08-25, NO bloqueantes)

- H3: el CHECK del servidor para invite_code es `^[A-Z0-9]{6}$` y acepta caracteres ambiguos
  (O/0/I/1); la exclusión de ambiguos vive solo en el cliente (`leagueCode.ts`). Si se quiere
  coherencia estricta server-side: `CHECK (invite_code ~ '^[A-HJ-NP-Z2-9]{6}$')`.
- H4: `league_entries.metric_value` no tiene CHECK `>= 0`; upsert con -5 fue aceptado (204).
  Añadir constraint si el modelo de negocio exige valores no negativos.
