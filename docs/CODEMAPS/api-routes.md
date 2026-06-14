# 🔌 Mapa de Rutas de la API (API Routes Codemap)

Este documento detalla todas las rutas de API expuestas por el servidor de Express en `backend/src/routes/` y manejadas por sus controladores asociados.

---

## 🔑 Autenticación y Perfil (`/api/auth`)

### `POST /api/auth/register`
* **Descripción:** Registra un nuevo estudiante en el sistema. Además del login en Supabase Auth, crea el registro inicial en la tabla `profiles`.
* **Acceso:** Público (Protegido por `authLimiter`: Máximo 20 peticiones cada 15 min).
* **Cuerpo de la Petición (`req.body`):**
  * `id` (string, UUID): El ID generado previamente por Supabase Auth en el cliente.
  * `name` (string): Nombre completo del estudiante.
  * `career` (string): Carrera (ej. Ingeniería en Sistemas Computacionales).
  * `age` (number): Edad.
  * `phone` (string, opcional): Teléfono.
* **Respuesta Exitosa (201 Created):**
  ```json
  {
    "ok": true,
    "user": { "id": "...", "name": "...", "career": "..." }
  }
  ```

---

## 📈 Seguimiento Académico y Progreso (`/api/progress`)

### `POST /api/progress/lesson-completed`
* **Descripción:** Registra la finalización de una lección específica. Calcula el progreso general del módulo y actualiza la XP/racha de gamificación.
* **Acceso:** Privado (Requiere cabecera `Authorization: Bearer <JWT>`).
* **Cuerpo de la Petición (`req.body`):**
  * `moduleId` (string): `'presupuesto' | 'ahorro' | 'inversion'`
  * `lessonId` (string): Código de la lección (ej. `'L01'`)
  * `completedAt` (string, ISO datetime, opcional): Fecha de completado.
* **Respuesta Exitosa (201 Created / 200 OK):**
  ```json
  {
    "moduleId": "presupuesto",
    "lessonId": "L01",
    "completedAt": "2026-06-14T22:30:00.000Z",
    "progressPercent": 7,
    "gamification": {
      "xp": 10,
      "level": 1,
      "streakCurrent": 1,
      "streakBest": 1,
      "lastActiveISO": "2026-06-14"
    }
  }
  ```

---

## 📝 Cuestionarios y Evaluaciones (`/api/questionnaire`)

### `POST /api/questionnaire/:type`
* **Descripción:** Guarda las respuestas y calcula la puntuación del cuestionario inicial (`pre`) o final (`post`).
* **Acceso:** Privado (Requiere JWT).
* **Parámetro de Ruta:** `:type` (`'pre' | 'post'`)
* **Cuerpo de la Petición (`req.body`):**
  * `answers` (Array of objects): Respuestas enviadas por el usuario.
* **Respuesta Exitosa (200 OK):** Retorna el score calculado y el índice de FinEmpoder.

---

## 🔬 Investigación y Administración (`/api/research`)

### `GET /api/research/status/me`
* **Descripción:** Devuelve si el usuario actual ha completado el cuestionario inicial (`pre`) y final (`post`).
* **Acceso:** Privado (Requiere JWT).
* **Respuesta Exitosa (200 OK):**
  ```json
  {
    "preCompleted": true,
    "postCompleted": false
  }
  ```

### `GET /api/research/students`
* **Descripción:** Lista el progreso y los resultados de los tests de todos los estudiantes registrados. Usado por los investigadores/profesores.
* **Acceso:** Privado + Administrador (Verifica que `profiles.role === 'admin'`).
* **Respuesta Exitosa (200 OK):** Lista paginada y resumida de progreso de alumnos.

---

## 🩺 Monitoreo de Salud (`/api/health`)

### `GET /api/health`
* **Descripción:** Endpoint simple para verificar que la API está en línea.
* **Acceso:** Público.
* **Respuesta Exitosa (200 OK):**
  ```json
  {
    "ok": true,
    "service": "finempoder-api"
  }
  ```
