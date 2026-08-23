# F0 — Auth sin contraseñas: Google OAuth + Magic Link (email OTP)

## 1. Qué se eliminó

**Frontend**

- `frontend/src/pages/auth/SignUp.tsx` — pantalla de registro largo con email+password.
- `frontend/src/hooks/auth/useLogin.ts` — mutación de login con `signInWithPassword`.
- `frontend/src/hooks/auth/useRegister.ts` — mutación de registro vía backend.
- `frontend/src/api/auth/auth.api.ts` — cliente de `POST /auth/register` (la carpeta `api/auth` queda vacía y se elimina).
- Dependencias `react-hook-form` y `@hookform/resolvers` (solo las usaban Login/SignUp).

**Backend**

- `backend/src/controllers/auth.controller.ts` — controller `register` (creaba usuario con password en Supabase e insertaba en `profiles`).
- `backend/src/routes/auth.ts` — ruta `POST /register`.
- `backend/test/auth.test.ts` — tests del controller `register` (y su import en `backend/test/all.test.ts`).
- En `backend/src/app.ts`: import de `authRouter`, bloque `authLimiter` y `app.use('/api/auth', ...)`. Se conserva `globalLimiter` y el import de `express-rate-limit`.

## 2. Qué se agregó

- `frontend/src/pages/auth/AuthScreen.tsx` — pantalla única de auth con dos vistas: (1) email con botón **Continuar con Google** y bloque **Entra con tu correo**; (2) código OTP de 6 dígitos con reenvío (countdown de 30s).
- `frontend/src/pages/auth/AuthCallback.tsx` — pantalla de retorno de Google OAuth (`/auth/callback`); espera la sesión y navega a `/app`.
- Ruta canónica `/auth` en `frontend/src/App.tsx` (y `/login` ahora redirige a `/auth`).
- `frontend/src/pages/auth/AuthScreen.test.tsx` — test mínimo del flujo email/OTP (2 tests).
- `frontend/vitest.config.ts` — se amplía el `include` para cubrir tests en `src/**/*.test.{ts,tsx}` (los tests de componentes con jsdom viven junto al código, igual que define `vite.config.ts`).
- `F0_CAMBIOS.md` — este documento.

**Decisión de implementación:** `Login.tsx` se conserva como re-export de `AuthScreen` (`export { default } from './AuthScreen'`) para no tocar el import en `App.tsx`; la ruta canónica es `/auth` y `/login` redirige a `/auth` (los enlaces existentes a `/login` en Settings/PreTest/PostTest/GuestBanner siguen funcionando).

## 3. Cómo probar manualmente

1. Levantar el frontend en dev (workdir `frontend/`):
   ```bash
   cd "frontend" && npm run dev
   ```
   La app levanta en `http://localhost:5173`.
2. **Probar Google OAuth:** ir a `http://localhost:5173/auth`, presionar **Continuar con Google**.
   - ⚠️ Si Supabase no tiene el provider de Google configurado (ver sección 4), esto fallará con un error claro de Supabase o de Google. Es el comportamiento esperado hasta completar la configuración externa.
3. **Probar email OTP:** en `/auth` ingresar un correo real, presionar **Enviar código**, abrir el correo, copiar el código de 6 dígitos, pegarlo y presionar **Entrar**. Verificar que redirige a `/app` como usuario autenticado y que la sesión queda activa (al recargar sigues dentro).
4. **Probar modo invitado:** en `/auth` presionar **Explorar sin cuenta** → llega a `/app` como invitado (banner de invitado visible, sin datos sincronizados).
5. **Probar redirect legacy:** `http://localhost:5173/login` redirige a `/auth`.
6. **Probar expiración de código OTP (opcional):** esperar más de 10 minutos (o el TTL configurado en Supabase) e intentar el código → error claro con opción de reenviar.

## 4. Configuración externa pendiente (importante)

El código está listo, pero el flujo de Google OAuth requiere configuración fuera del repo:

**a. Google Cloud Console**
1. Ir a https://console.cloud.google.com y crear un proyecto (o usar uno existente).
2. Crear credenciales **OAuth 2.0 Client ID** de tipo **Web application**.
3. En **Authorized redirect URIs** poner la URL de callback de Supabase:
   `https://TU-PROYECTO.supabase.co/auth/v1/callback`
   (`TU-PROYECTO` se obtiene del dashboard de Supabase → Settings → API, campo *Project URL*; es el subdominio antes de `.supabase.co`).
4. Guardar y copiar el **Client ID** y el **Client Secret**.

**b. Supabase Dashboard → Authentication → Providers → Google**
1. Habilitar el provider Google.
2. Pegar el Client ID y el Client Secret de Google.
3. Guardar.

**c. Supabase Dashboard → Authentication → URL Configuration**
1. **Site URL** = `https://app.finempoder.com.mx` (producción).
2. En **Redirect URLs** agregar:
   - `http://localhost:5173/auth/callback`
   - `https://app.finempoder.com.mx/auth/callback`
3. Estas son las `redirectTo` que usa el frontend; si no están en la allowlist, el OAuth fallará con *redirect URL not allowed*.
4. Si el proyecto local ya tiene su URL de Supabase en `frontend/.env` (`VITE_SUPABASE_URL`), la configuración aplica a **ese** proyecto.

**d. Notas**
- Si no hay credenciales de Google aún, el botón de Google fallará, pero el flujo de email OTP funciona (depende solo de que el email service de Supabase esté habilitado y el correo sea alcanzable).
- Si tampoco hay acceso al dashboard de Supabase, la configuración queda pendiente y el flujo OTP no podrá validarse end-to-end hasta completarla.

## 5. Output de builds y suites

**Frontend — test del flujo OTP** (`npx vitest run src/pages/auth/AuthScreen.test.tsx`)
- Resultado: PASS — Test Files 1 passed (1) — Tests 2 passed (2).

**Frontend — suite completa** (`npm test` en `frontend/`)
- Resultado: PASS — Test Files 13 passed (13) — Tests 80 passed (80) — Duration 2.44s.

**Backend — suite completa** (`npm test` en `backend/`)
- Resultado: PASS — tests 8 — pass 8 — fail 0 — duration 24ms.

**Frontend — build** (`npm run build` en `frontend/` → `tsc -b && vite build`)
- Resultado: PASS — salida 0; PWA generada (146 entradas precache, `dist/sw.js`).

**Backend — build** (`npm run build` en `backend/` → `tsc -p .`)
- Resultado: PASS — salida 0.

## 6. Fix menores gate Lupa

**Resumen de los 3 fixes**
- `frontend/src/pages/profile/Profile.tsx`: el botón "Registrarse" del guest mode ahora navega a `/auth` en lugar de `/signup` (ruta eliminada que caía al fallback). El botón "Iniciar sesión" queda en `/login` (que redirige a `/auth`); no se tocó nada más del archivo.
- Docs desactualizados de la API de auth eliminada: `backend/README.md`, `docs/API.md`, `docs/CODEMAPS/api-routes.md` y `supabase/README.md` ahora documentan que la auth ocurre vía **Supabase Auth directamente desde el frontend** (Google OAuth y magic link / email OTP) y que `/api/auth` no existe (sin `authLimiter`). En `supabase/README.md` se omitió la fila de INSERT con service role (el backend ya no inserta en `profiles`).
- `backend/test/mockSupabase.ts`: eliminados los mocks muertos `signUp` y `signInWithPassword` (y el store `authUsers` asociado). Previa verificación con grep: 0 usos en `backend/src` y `backend/test`.

**SHA del commit**
- `78cdc89715200957a7cca40a440d92d8bce4ca9e`

**Outputs de verificación**
- `grep -rn "/signup" frontend/src` → 0 resultados (rc=1).
- `grep -rn "register\|authLimiter" backend/README.md docs/ supabase/README.md` → 4 hits, todos texto nuevo que declara la eliminación de la API (sin referencias a la API eliminada como activa): `backend/README.md:9`, `docs/API.md:19`, `docs/API.md:42`, `docs/CODEMAPS/api-routes.md:9`.
- `grep -rn "signUp\|signInWithPassword" backend/src backend/test` → 0 usos (rc=1).
- Frontend `npm test` → Test Files 13 passed (13), Tests 80 passed (80), Duration 2.31s.
- Backend `npm test` → tests 8, pass 8, fail 0, duration 22ms.
- Frontend `npm run build` (`tsc -b && vite build`) → rc=0 (PWA generada, 146 entradas precache).
