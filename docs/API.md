# 🔌 Referencia de la API de Backend (API.md)

Este documento contiene la especificación de todos los endpoints REST expuestos por el backend de **FinEmpoder**, incluyendo tipos de datos esperados, seguridad y políticas de tasa de solicitudes (rate limiting).

---

## 🔒 Seguridad y Configuración de Cabeceras

* **CORS:** Solo permite solicitudes desde orígenes configurados en la variable de entorno `CORS_ORIGIN`.
* **Helmet:** Configurado para añadir cabeceras HTTP de seguridad robustas (protección HSTS activa en producción, X-Content-Type-Options, y X-Frame-Options).
* **Autenticación:** Las rutas protegidas requieren una cabecera de tipo Bearer JWT emitida por Supabase:
  ```http
  Authorization: Bearer <SUPABASE_JWT_TOKEN>
  ```
  El middleware `authGuard` valida el token utilizando la clave secreta del proyecto Supabase y añade la información del usuario a `req.user`.

### ⏱️ Control de Tasa de Solicitudes (Rate Limiting)
1. **Límite Global:** Máximo **100 solicitudes por minuto** por dirección IP (aplica a todas las rutas excepto de autenticación).
2. **Límite de Autenticación:** Máximo **20 solicitudes cada 15 minutos** por dirección IP (aplica al registro de usuarios).

---

## 📂 Detalle de Endpoints

### 1. Monitoreo de Estado

#### `GET /api/health`
* **Descripción:** Comprueba que la API esté activa y responda.
* **Autenticación:** No requiere.
* **Respuesta Exitosa (200 OK):**
  ```json
  {
    "ok": true,
    "service": "finempoder-api"
  }
  ```

---

### 2. Autenticación y Registro

#### `POST /api/auth/register`
* **Descripción:** Vincula el registro del cliente de Supabase creando un perfil de estudiante en la base de datos central de Postgres.
* **Autenticación:** No requiere (Protegido por `authLimiter`).
* **Cuerpo de la Petición:**
  ```json
  {
    "id": "3f8b9e6a-7c2d-4b8a-9f5e-1a2b3c4d5e6f",
    "name": "Juan Pérez",
    "career": "Ingeniería Química",
    "age": 21,
    "phone": "7221234567"
  }
  ```
* **Respuesta Exitosa (201 Created):**
  ```json
  {
    "ok": true,
    "user": {
      "id": "3f8b9e6a-7c2d-4b8a-9f5e-1a2b3c4d5e6f",
      "name": "Juan Pérez",
      "career": "Ingeniería Química",
      "age": 21
    }
  }
  ```

---

### 3. Progreso Académico

#### `POST /api/progress/lesson-completed`
* **Descripción:** Marca una lección de un módulo como completada. Valida los datos con Zod y recalcula automáticamente la experiencia (XP), el nivel y la racha (streak) del alumno.
* **Autenticación:** Requerida (Bearer JWT).
* **Cuerpo de la Petición:**
  ```json
  {
    "moduleId": "presupuesto",
    "lessonId": "L02",
    "completedAt": "2026-06-14T22:30:00.000Z"
  }
  ```
  *Nota: `completedAt` no puede ser una fecha en el futuro.*
* **Respuesta Exitosa (201 Created / 200 OK):**
  ```json
  {
    "moduleId": "presupuesto",
    "lessonId": "L02",
    "completedAt": "2026-06-14T22:30:00.000Z",
    "progressPercent": 13,
    "gamification": {
      "xp": 20,
      "level": 1,
      "streakCurrent": 2,
      "streakBest": 2,
      "lastActiveISO": "2026-06-14"
    }
  }
  ```

---

### 4. Cuestionarios Diagnósticos

#### `POST /api/questionnaire/:type`
* **Descripción:** Evalúa y almacena las respuestas del cuestionario inicial (`pre`) o final (`post`). Calcula la calificación final y el índice FinEmpoder del usuario.
* **Autenticación:** Requerida (Bearer JWT).
* **Parámetro de Ruta:** `type` (`'pre' | 'post'`).
* **Cuerpo de la Petición:**
  ```json
  {
    "answers": [
      { "questionId": "Q01", "selectedOption": "A" },
      { "questionId": "Q02", "selectedOption": "C" }
    ]
  }
  ```
* **Respuesta Exitosa (200 OK):**
  ```json
  {
    "ok": true,
    "score": 85.5,
    "finempoderIndex": 78.2
  }
  ```

---

### 5. Área de Investigación (Administración)

#### `GET /api/research/status/me`
* **Descripción:** Devuelve el estado de completado de los cuestionarios diagnósticos para el usuario en sesión.
* **Autenticación:** Requerida (Bearer JWT).
* **Respuesta Exitosa (200 OK):**
  ```json
  {
    "preCompleted": true,
    "postCompleted": false
  }
  ```

#### `GET /api/research/students`
* **Descripción:** Devuelve una lista resumen del progreso académico de todos los estudiantes registrados para análisis de investigación.
* **Autenticación:** Requerida + Rol 'admin' (`profiles.role === 'admin'`).
* **Respuesta Exitosa (200 OK):** Lista de estudiantes con sus respectivos porcentajes de progreso y calificaciones obtenidas.
