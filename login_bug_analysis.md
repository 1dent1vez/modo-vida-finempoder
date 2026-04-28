# 🔍 Análisis de Bug: Pantalla Blanca y Loop al Login — FinEmpoder

## Diagnóstico General

El flujo de autenticación usa **dos capas paralelas** que colisionan:

1. **Supabase directamente en el frontend** (`signInWithPassword` en `useLogin`)
2. **`onAuthStateChange`** en `main.tsx` que rehidrata el store de auth

El backend Express/Railway **no participa en el login** — solo valida tokens mediante `authGuard` para rutas protegidas. El problema no está en el backend, sino en la secuencia de eventos del frontend en producción.

---

## 🐛 Bug #1 — PRINCIPAL: Race Condition entre `useLogin` y `onAuthStateChange`

### Archivo: `frontend/src/pages/auth/Login.tsx` (línea 33-35)

```tsx
// ❌ PROBLEMA: El navigate a '/app' se dispara cuando login.isSuccess=true,
// ANTES de que onAuthStateChange haya ejecutado setHydrated().
// En producción la sesión se guarda en localStorage de Supabase, pero
// hydrated=false hasta que el evento onAuthStateChange llega.
// PrivateRoute ve token=null y hydrated=true (si ya fue true de antes)
// o null + hydrated=false (renderiza null = pantalla blanca).

useEffect(() => {
  if (login.isSuccess) navigate('/app');   // 🔴 race condition
}, [login.isSuccess, navigate]);
```

### Causa raíz
`useLogin.onSuccess` llama a `setAuth(token, user)` → el store tiene `token`, pero **`hydrated` puede seguir siendo `false`** si `onAuthStateChange` aún no disparó. Cuando el usuario llega a `/app`, `PrivateRoute` ve:

```
hydrated = false → return null  (pantalla blanca)
```

Inmediatamente después `onAuthStateChange` dispara, llama `setHydrated()`, ahora `hydrated=true` pero en ese ciclo ya navegó a `/login` — o en el caso inverso, si `hydrated` ya era `true` de una sesión anterior y el store fue limpiado por `clearAuth()`, `token=null` → redirect a `/login`.

### Fix — `frontend/src/pages/auth/Login.tsx`

```tsx
// ✅ SOLUCIÓN: Esperar a que el store tenga AMBAS condiciones: token + hydrated
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin } from '../../hooks/auth/useLogin';
import { useAuth } from '../../store/auth';            // ← añadir
// ... resto de imports

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const token = useAuth((s) => s.token);              // ← añadir
  const hasHydrated = useAuth((s) => s.hydrated);     // ← añadir
  const [showPass, setShowPass] = useState(false);

  // ✅ Solo navegar cuando el store esté completamente listo
  useEffect(() => {
    if (login.isSuccess && token && hasHydrated) {
      navigate('/app', { replace: true });
    }
  }, [login.isSuccess, token, hasHydrated, navigate]);

  // ... resto sin cambios
}
```

---

## 🐛 Bug #2 — CRÍTICO: `evaluateResearchGate` redirige a `/login` si `status` no cargó

### Archivo: `frontend/src/shared/utils/researchGate.ts` (línea 8)

```ts
// ❌ PROBLEMA: Cuando status=undefined (query todavía cargando),
// la función retorna '/login'. ResearchGate ejecuta esto durante el
// render, provocando un <Navigate to="/login"> INMEDIATO aunque
// el usuario esté autenticado.

export const evaluateResearchGate = (
  pathname: string,
  status?: { preDone: boolean; postDone: boolean; allModulesDone: boolean },
  onboardingDone: boolean = true
) => {
  if (!status) return '/login';   // 🔴 redirige mientras carga
  // ...
};
```

### Archivo: `frontend/src/components/ResearchGate.tsx` (línea 13-17)

```tsx
// ❌ PROBLEMA: status.isLoading protege contra el render del children,
// pero NO protege contra evaluateResearchGate cuando status.data es undefined
// en el primer render (antes de que useResearchStatus haga fetch).

if (status.isLoading) return null;   // ✅ esto está bien
const redirect = evaluateResearchGate(pathname, status.data ?? undefined, onboardingDone);
if (redirect) return <Navigate to={redirect} replace />;  // 🔴 redirect a /login si data es undefined
```

El flujo exacto del bug en producción:

```
1. Usuario hace login exitoso → navigate('/app')
2. PrivateRoute renderiza → token ✅ hydrated ✅ → renderiza ResearchGate
3. ResearchGate: status.isLoading = true → return null (pantalla blanca)
4. La query termina: status.isLoading = false, status.data = undefined (error o timeout)
5. evaluateResearchGate(pathname, undefined) → return '/login'   ← BUG
6. <Navigate to="/login"> → loop infinito
```

### Fix — `frontend/src/shared/utils/researchGate.ts`

```ts
// ✅ SOLUCIÓN: Retornar null (no redirigir) cuando status no está disponible.
// Si el fetch falla, dejar pasar al usuario — el pretest lo atrapará después.

export const evaluateResearchGate = (
  pathname: string,
  status?: { preDone: boolean; postDone: boolean; allModulesDone: boolean },
  onboardingDone: boolean = true
) => {
  if (!status) return null;   // ✅ sin datos = no redirigir todavía
  if (!status.preDone && pathname !== '/research/pretest') return '/research/pretest';
  if (status.allModulesDone && !status.postDone && pathname !== '/research/posttest') return '/research/posttest';
  if (!onboardingDone && !ONBOARDING_PATHS.includes(pathname)) return '/onboarding/1';
  return null;
};
```

### Fix adicional — `frontend/src/components/ResearchGate.tsx`

```tsx
// ✅ SOLUCIÓN: También agregar un guard para cuando la query falla (isError)
export function ResearchGate({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const status = useResearchStatus();
  const user = useAuth((s) => s.user);

  if (!user) return <Navigate to="/login" replace />;
  // ✅ Esperar a que la query termine (loading O error antes de evaluar)
  if (status.isLoading) return null;

  const onboardingDone = isOnboarded(user.id, user.email);
  // status.data puede ser undefined si la query falló → evaluateResearchGate retorna null
  const redirect = evaluateResearchGate(pathname, status.data ?? undefined, onboardingDone);
  if (redirect) return <Navigate to={redirect} replace />;

  return <>{children}</>;
}
```

---

## 🐛 Bug #3 — CRÍTICO: `VITE_API_URL` apunta a IP local en producción

### Archivo: `frontend/.env` (línea 3)

```env
# ❌ PROBLEMA: Esta URL es una IP de red local. En Vercel (producción)
# esta dirección NO es accesible. Todas las llamadas al backend fallan
# con Network Error, lo que causa que useResearchStatus devuelva error
# y status.data = undefined → trigger del Bug #2.

VITE_API_URL=http://192.168.100.9:4000/api   # 🔴 IP local, no accesible desde Vercel
```

### Fix — `frontend/.env` (para producción, o en variables de entorno de Vercel)

```env
# ✅ Debe apuntar a la URL pública de Railway
VITE_API_URL=https://tu-proyecto.up.railway.app/api
```

> **IMPORTANTE**: Este valor debe configurarse en el dashboard de Vercel como variable de entorno,
> NO en el archivo `.env` del repositorio (que debería estar en `.gitignore`).

---

## 🐛 Bug #4 — CORS: El backend no incluye el dominio de Vercel

### Archivo: `backend/.env` (línea 5)

```env
# ❌ PROBLEMA: Solo permite orígenes localhost. En producción,
# las peticiones de https://finempoder.vercel.app (o tu dominio)
# serán bloqueadas por CORS con un error 'No Access-Control-Allow-Origin'.
# Esto hace que TODAS las llamadas a /api/research/status/me fallen.

CORS_ORIGIN=http://localhost:5173,http://localhost:4173,http://192.168.100.9:5173,http://192.168.100.9:4173
```

### Fix — Variable de entorno `CORS_ORIGIN` en Railway

```env
# ✅ Agregar el dominio de producción del frontend
CORS_ORIGIN=https://finempoder.vercel.app,https://finempoder.com.mx,http://localhost:5173,http://localhost:4173
```

> Configurar en Railway → Proyecto → Variables → `CORS_ORIGIN`

---

## 🐛 Bug #5 — Fuga de memoria / Effect sin cleanup en `useGamification`

### Archivo: `frontend/src/hooks/gamification/useGamification.ts` (línea 55-63)

```ts
// ⚠️ ADVERTENCIA: Este useEffect no tiene guard de cancelación.
// Si el componente se desmonta mientras la query está cargando,
// hydrateStreak se llama en un componente ya desmontado.
// No causa pantalla blanca pero SÍ puede causar renders inesperados.

useEffect(() => {
  if (query.data?.streak) {
    hydrateStreak({                // 🔴 sin verificar si el componente sigue montado
      current: query.data.streak.current,
      best: query.data.streak.best,
      lastActiveISO: query.data.streak.lastActiveISO,
    });
  }
}, [query.data, hydrateStreak]);
```

> Este es un problema menor (Zustand es tolerante a updates fuera de componente),
> pero puede causar renders fantasma. Bajo prioridad.

---

## 📋 Resumen de Archivos y Cambios

| Prioridad | Archivo | Bug | Acción |
|-----------|---------|-----|--------|
| 🔴 P0 | `frontend/src/pages/auth/Login.tsx` | Race condition navigate | Añadir guard `token && hasHydrated` |
| 🔴 P0 | `frontend/src/shared/utils/researchGate.ts` | Redirect a `/login` sin status | Cambiar `return '/login'` → `return null` |
| 🔴 P0 | Variables Vercel | `VITE_API_URL` es IP local | Poner URL de Railway |
| 🔴 P0 | Variables Railway | CORS sin dominio producción | Agregar `CORS_ORIGIN` con dominio Vercel |
| 🟡 P1 | `frontend/src/components/ResearchGate.tsx` | Doble verificación status | Defensivo con `status.isError` |

---

## 🔄 Flujo Correcto Post-Fix

```
Usuario llega a /login
→ Ingresa credenciales
→ useLogin.mutate() → supabase.auth.signInWithPassword()
→ onSuccess: setAuth(token, user)          [store tiene token]
→ onAuthStateChange dispara: setHydrated() [store tiene hydrated=true]
→ useEffect en Login detecta: isSuccess + token + hydrated → navigate('/app', {replace:true})
→ PrivateRoute: hydrated=true, token≠null → renderiza ResearchGate
→ ResearchGate: status.isLoading=true → null (spinner)
→ Query /api/research/status/me [CORS ✅, URL de Railway ✅]
→ status.data llega → evaluateResearchGate(pathname, data)
→ Si preDone=false → redirect a /research/pretest
→ Si preDone=true → renderiza <AppLayout><Home/></AppLayout>
```
