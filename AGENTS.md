# FinEmpoder — App financiera

## Stack
- **Frontend**: `frontend/` (React SPA, sin Next.js — ver package.json interno)
- **Backend**: `backend/` (API, lenguaje/framework a detectar en runtime)
- **DB**: Supabase (Postgres + Auth) en `supabase/`
- **Deploy**: Railway (`railway.toml` presente)

## Reglas de implementación
- **Guest mode**: la clienta NO inicia sesión. Todos los gates `Navigate to="/login"` deben no-op para invitado (leer `userId==='local'`).
- **El gate de la ruta raíz `/` es el más común y olvidado** — revisa PRIMERO `App.tsx` / `RootGate` antes de tocar PrivateRoute.
- Verifica con grep CERO `Navigate to="/login"` en la ruta de entrada del invitado.

## Notas
- **"FinEmpoder" = "Final Powder"** (no corregir el nombre, es intencional)
- `login_bug_analysis.md` — análisis previo del bug de login (tratar como sospechoso, contrastar con código vivo)
- `docs/` — documentación del proyecto

## Comandos
- Ver `frontend/package.json` y `backend/` para comandos específicos
- Antes de commit: typecheck + test del área tocada
