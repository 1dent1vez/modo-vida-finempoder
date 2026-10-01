# FinEmpoder API — Backend

Node.js + Express API. Solo existe para lógica que **no puede vivir en el cliente** con RLS.
Endpoints simples (SELECT por user_id) van directo a Supabase desde el frontend.

## Endpoints activos

### Autenticación (Supabase Auth)
La autenticación ocurre **directamente desde el frontend** con Supabase Auth (Google OAuth y magic link / email OTP). El backend no expone rutas de auth: `/api/auth` no existe y `authLimiter` fue eliminado.

### `POST /api/progress/lesson-completed`
Registra lección completada y actualiza gamificación del usuario:
- Upsert en `lesson_progress`
- Calcula XP acumulado y nivel (`computeLevel`)
- Aplica racha diaria (`applyStreak`) con lógica de días consecutivos
- Actualiza `gamification` con XP, nivel, racha y porcentaje de módulo

La lógica de XP y streaks es sensible a manipulación; no puede correr en el cliente.

### `POST /api/questionnaire/:type`
Recibe respuestas del cuestionario pre/post:
- Calcula `score` y `finempoderIndex` (algoritmo propietario en `utils/finempoderIndex.ts`)
- Hace upsert en `questionnaire_results`
- Retorna estado de investigación actualizado (`researchStatus`)

El algoritmo de puntuación no debe exponerse en el cliente por integridad del estudio.

### `GET /api/research/status/me`
Agrega estado de investigación del usuario en una sola llamada:
- Verifica si completó pre y post cuestionario
- Calcula progreso promedio de los 3 módulos desde `lesson_progress`
- Indica si cumple criterios de finalización del estudio

Requiere joins multi-tabla que se modelan mejor en servidor.

### `GET /api/research/students` *(admin)*
Lista resumen de todos los participantes del estudio para el equipo de investigación.
Requiere service role (sin RLS) para leer datos de todos los usuarios.

## Endpoints eliminados

| Endpoint | Razón |
|---|---|
| `POST /api/auth/login` | Proxy innecesario — `supabase.auth.signInWithPassword` desde cliente |
| `GET /api/gamification/me` | SELECT simple — RLS protege por `user_id` |
| `GET /api/progress/:moduleId` | SELECT simple — RLS protege por `user_id` |
| `GET /api/questionnaire/:type/me` | SELECT simple — RLS protege por `user_id` |
| `GET/POST/PATCH/DELETE /api/budget/*` | Feature incompleta — CRUD puro con RLS |
