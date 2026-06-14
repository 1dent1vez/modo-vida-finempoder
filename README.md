# 🎯 FinEmpoder

**Aprende a manejar tu dinero. Gana puntos por hacerlo.**

FinEmpoder es una aplicación de educación financiera de tipo PWA (Progressive Web App) pensada para estudiantes del Instituto Tecnológico de Toluca (y cualquier joven) que quieran dejar de llegar a fin de quincena con el saldo en ceros. No se necesita saber nada de finanzas para empezar.

La diferencia: no es un curso pasivo, es una experiencia interactiva gamificada. Cada módulo completado, cada pregunta respondida y cada meta alcanzada te otorga puntos de experiencia (XP), desbloquea logros y te posiciona en un ranking.

---

## 🛠️ Stack Tecnológico

| Componente | Tecnologías Utilizadas | Propósito |
|---|---|---|
| **Frontend** | React 19, TypeScript, Vite | Interfaz de usuario interactiva y compilación rápida |
| **Enrutamiento** | React Router v7 | Navegación interna y zonas privadas de la aplicación |
| **Estilos (CSS)** | Tailwind CSS v4, Lucide Icons | Estilos modernos, diseño premium y adaptabilidad móvil |
| **Base de Datos Local** | Dexie.js (IndexedDB) | Persistencia y almacenamiento offline de lecciones y rachas |
| **Estado Global** | Zustand, React Query | Gestión reactiva del estado y caché de peticiones HTTP |
| **Backend API** | Express.js, Node.js, tsx | API REST segura para procesamiento y sincronización |
| **Validación** | Zod | Validación rigurosa de esquemas de datos en API y formularios |
| **Servicio Cloud** | Supabase (PostgreSQL, Auth) | Base de datos cloud centralizada y gestión de identidades JWT |
| **Observabilidad** | Sentry, Pino (Logger) | Rastreo de excepciones en tiempo real y logging estructurado |
| **Pruebas** | Vitest, Playwright | Tests unitarios, de integración y pruebas E2E automatizadas |

---

## 📂 Estructura del Proyecto

El código está estructurado en módulos aislados con responsabilidades claras:
* [`.agent/`](file:///.agent/) — Reglas, workflows y directivas del plugin de desarrollo ECC.
* [`backend/`](file:///c:/Proyectos/finempoder/backend/) — Servidor Express, lógica de negocio de gamificación y endpoints REST.
* [`frontend/`](file:///c:/Proyectos/finempoder/frontend/) — Aplicación cliente PWA con soporte offline y vistas de aprendizaje.
* [`supabase/`](file:///c:/Proyectos/finempoder/supabase/) — Script de base de datos con políticas de seguridad RLS.
* [`docs/`](file:///c:/Proyectos/finempoder/docs/) — Documentación de arquitectura, APIs y mapas de código.

Para una navegación detallada de directorios, consulta el [Resumen de Arquitectura](file:///c:/Proyectos/finempoder/docs/CODEMAPS/architecture-overview.md).

---

## 🔄 Flujos y Reglas del Producto

FinEmpoder está diseñada para ser una experiencia robusta y confiable en cualquier condición de red:

1. **Arquitectura Offline-First:** El estudiante puede realizar lecturas y retos interactivos sin conexión. Los progresos se registran localmente en **Dexie** y el worker **SyncManager** los envía al backend automáticamente al detectar conexión a Internet.
2. **Sistema de Lecciones:** Tres módulos educativos principales (`presupuesto`, `ahorro` e `inversion`) de 15 lecciones consecutivas cada uno.
3. **Cálculo de XP y Niveles:** Completar lecciones otorga 10 XP. Cada 100 XP el estudiante sube de nivel: $\text{Nivel} = \max\left(1, \lfloor \frac{\text{XP}}{100} \rfloor + 1\right)$.
4. **Lógica de Rachas (Streaks):** Registra los días de estudio seguidos (considerando huso horario local del usuario) para evitar la deserción escolar.

Para ver las fórmulas exactas y diagramas de estados, consulta la [Guía de Gamificación y Lecciones](file:///c:/Proyectos/finempoder/docs/GAMIFICACION-Y-LECCIONES.md).

---

## 🔧 Guía de Setup e Instalación Local

Sigue estos pasos en orden para levantar el entorno de desarrollo local:

### Paso 1: Configurar Supabase
1. Crea un proyecto en [Supabase Console](https://database.new).
2. Abre la sección de **SQL Editor** y ejecuta en orden las migraciones contenidas en:
   - [`supabase/migrations/001_initial_schema.sql`](file:///c:/Proyectos/finempoder/supabase/migrations/001_initial_schema.sql)
   - [`supabase/migrations/002_fix_rls_policies.sql`](file:///c:/Proyectos/finempoder/supabase/migrations/002_fix_rls_policies.sql)

### Paso 2: Configurar y Levantar el Backend
1. Navega a `backend/` y copia el archivo de variables de entorno:
   ```bash
   cd backend
   cp .env.example .env
   ```
2. Rellena los valores en `.env` (coloca la URL de tu proyecto de Supabase y el `SUPABASE_SERVICE_ROLE_KEY` obtenido de la configuración de Supabase API).
3. Instala dependencias y arranca el servidor:
   ```bash
   npm install
   npm run dev
   ```
   *El backend se ejecutará por defecto en `http://localhost:4000`.*

### Paso 3: Configurar y Levantar el Frontend
1. Navega a `frontend/` y copia el archivo de variables de entorno:
   ```bash
   cd ../frontend
   cp .env.example .env
   ```
2. Rellena `.env`. Asegúrate de que `VITE_API_URL` apunte a `http://localhost:4000/api`.
3. Instala dependencias y corre el servidor de Vite:
   ```bash
   npm install
   npm run dev
   ```
   *Abre en tu navegador `http://localhost:5173` para interactuar con la app.*

---

## 🧪 Comandos de Calidad y Validación

### En el Frontend:
* **Linting:** `npm run lint` — Inspección de errores con ESLint.
* **Formateo:** `npm run format` — Corrección de estilo de código con Prettier.
* **Pruebas Unitarias:** `npm run test` — Ejecuta las pruebas unitarias y de integración de componentes con Vitest.
* **Pruebas de Cobertura:** `npm run test:coverage` — Reporta el porcentaje de cobertura de código.
* **Pruebas End-to-End:** `npm run test:e2e` — Ejecuta los flujos críticos con Playwright.
* **Verificación Global:** `npm run verify:all` — Ejecuta linters, tests unitarios, typechecking de TypeScript y validaciones de seguridad de módulos académicos de forma integrada.

### En el Backend:
* **Pruebas:** `npm run test` — Corre las pruebas de integración utilizando mocks de gamificación.
* **Pruebas Unitarias:** `npm run test:unit` — Corre pruebas de algoritmos de XP y rachas de gamificación.

---

## 🎨 Convenciones de Diseño y Hojas de Estilo

* **Tipografía:** Se priorizan fuentes modernas como **Outfit** e **Inter** cargadas dinámicamente.
* **Colores de Módulos (Semántica Visual):**
  * 🔸 **Presupuesto:** Color de advertencia (`var(--color-brand-warning)`) para alertar sobre la importancia del control de gastos.
  * 🟢 **Ahorro:** Color de éxito (`var(--color-brand-success)`) reflejando tranquilidad y crecimiento financiero.
  * 🔹 **Inversión:** Color de información (`var(--color-brand-info)`) transmitiendo toma de decisiones analíticas e inteligentes.
* **Diseño UI:** FECard con variantes interactivas (`flat`, `elevated`), transiciones fluidas de hover en botones e infografías animadas.

---

## 📚 Documentación Adicional

* [**Arquitectura del Frontend**](file:///c:/Proyectos/finempoder/docs/ARQUITECTURA.md) — Explicación de `LessonShell`, extensión de módulos y persistencia.
* [**Especificación de la API**](file:///c:/Proyectos/finempoder/docs/API.md) — Referencia de rutas, payloads Zod, cabeceras JWT y políticas de rate limiting.
* [**Gamificación y Lecciones**](file:///c:/Proyectos/finempoder/docs/GAMIFICACION-Y-LECCIONES.md) — Reglas matemáticas del nivel de XP y el algoritmo de rachas.
* [**Mapa del Código y Dependencias**](file:///c:/Proyectos/finempoder/docs/CODEMAPS/dependency-graph.md) — Grafo Mermaid e interacción entre componentes.
