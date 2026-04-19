# FinEmpoder — Supabase: RLS y Service Role

## Regla general

- **Authenticated role** (JWT del usuario): accede solo a sus propios datos. RLS aplica.
- **Service role** (backend Node): bypasea RLS completamente. Solo se usa cuando el usuario aún no tiene sesión activa o la operación requiere escribir en nombre del usuario con lógica de negocio.

---

## Tablas y políticas activas

### `profiles`

| Operación | Quién | Política |
|---|---|---|
| SELECT | Usuario autenticado | `auth.uid() = id` |
| SELECT | Admin (`role = 'admin'`) | Sin restricción de id |
| UPDATE | Usuario autenticado | `auth.uid() = id` |
| INSERT | Backend (service role) | Bypasea RLS — ocurre en `POST /api/auth/register` antes de que el usuario tenga sesión |

**Nota**: La migración 002 define `INSERT WITH CHECK (auth.uid() = id)` para usuarios autenticados. El backend usa service role y omite esa política. Si algún día el frontend necesita crear el perfil directamente (post-signup flow), la política ya está lista.

---

### `lesson_progress`

| Operación | Quién | Política |
|---|---|---|
| SELECT | Usuario autenticado | `auth.uid() = user_id` |
| SELECT | Admin | Sin restricción de user_id |
| INSERT / UPDATE / DELETE | Usuario autenticado | `auth.uid() = user_id` |
| INSERT / UPDATE (upsert) | Backend (service role) | Bypasea RLS — ocurre en `POST /api/progress/lesson-completed` |

**Frontend lee directo con RLS** — `useUserProgressSync` consulta `lesson_progress` con la sesión del usuario.
**Backend escribe con service role** — `recordLessonCompletion` hace el upsert + calcula XP/streak atómicamente.

---

### `gamification`

| Operación | Quién | Política |
|---|---|---|
| SELECT | Usuario autenticado | `auth.uid() = user_id` |
| SELECT | Admin | Sin restricción |
| INSERT / UPDATE | Backend (service role) | Bypasea RLS — solo el backend escribe aquí |

**Frontend lee directo con RLS** — `useGamification` consulta esta tabla con la sesión del usuario.
**Frontend nunca escribe aquí** — todos los cambios vienen del backend tras `lesson-completed`.

---

### `questionnaire_results`

| Operación | Quién | Política |
|---|---|---|
| SELECT | Usuario autenticado | `auth.uid() = user_id` |
| SELECT | Admin | Sin restricción |
| INSERT / UPDATE (upsert) | Backend (service role) | Bypasea RLS — `POST /api/questionnaire/:type` escribe aquí |

**Frontend lee directo con RLS** — `useQuestionnaire` consulta esta tabla con sesión del usuario.
**Frontend nunca escribe directamente** — el backend valida y calcula `score` + `finempoderIndex` antes de guardar.

---

### `budgets`

| Operación | Quién | Política |
|---|---|---|
| SELECT / INSERT / UPDATE / DELETE | Usuario autenticado | `auth.uid() = user_id` |

**Feature incompleta** — no hay endpoint backend ni UI activa. El frontend puede operar directo con RLS cuando se retome esta feature.

---

## Resumen: quién escribe qué

| Tabla | Frontend (RLS) | Backend (service role) |
|---|---|---|
| `profiles` | ✅ SELECT, UPDATE | ✅ INSERT (registro) |
| `lesson_progress` | ✅ SELECT | ✅ INSERT/UPDATE (lesson-completed) |
| `gamification` | ✅ SELECT | ✅ INSERT/UPDATE (lesson-completed) |
| `questionnaire_results` | ✅ SELECT | ✅ INSERT/UPDATE (submit questionnaire) |
| `budgets` | ✅ CRUD completo | ❌ Sin endpoint |
