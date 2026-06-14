# 🏗️ Guía de Arquitectura del Frontend (ARQUITECTURA.md)

Este documento detalla la arquitectura técnica de la interfaz de usuario en **FinEmpoder**, incluyendo el diseño de componentes reutilizables, convenciones de gestión de estado reactivo y offline, y cómo extender el sistema educativo.

---

## 🧩 Componentes Reutilizables de ModuleKit

El flujo y control de acceso de las lecciones está estructurado alrededor de cuatro componentes principales ubicados en `frontend/src/module-kit/components/`:

### 1. `LessonShell`
Actúa como la envoltura estructural (`wrapper`) de cada pantalla de lección.
* **Responsabilidad:** Gestiona la validación de acceso (si la lección anterior está completada), persiste el completado localmente, actualiza las métricas en Zustand y renderiza las acciones de navegación (siguiente/anterior/menú).
* **Props Requeridas:**
  * `moduleId` (`ModKey`): Identificador del módulo (`presupuesto`, `ahorro` o `inversion`).
  * `config` (`ModuleFlowConfig`): Configuración de flujo cargada desde `lessonFlow.ts`.
  * `id` (`string`): Código de lección (ej. `'L01'`).
  * `title` (`string`): Título legible expuesto en el header.
  * `completeWhen` (`boolean`, opcional): Bandera que al ser `true` dispara inmediatamente la persistencia de finalización de la lección.
  * `completion` (`LessonCompletion`, opcional): Estructura detallada `{ ready: boolean; score?: number }` para cuestionarios o retos interactivos.

### 2. `ModuleOverview`
Pantalla inicial de presentación del módulo.
* **Responsabilidad:** Muestra la tarjeta informativa del módulo, el progreso general acumulado (0 a 100%) y la lista interactiva de lecciones.

### 3. `ModuleLessonList`
Lista de lecciones renderizada dentro del Overview.
* **Responsabilidad:** Genera visualmente cada fila de lección. Muestra si está bloqueada, disponible, en progreso o completada, incluyendo el puntaje obtenido y un check de verificación.

---

## 🚀 Cómo agregar una Nueva Lección

Para añadir una nueva lección a un módulo existente (o crear un nuevo módulo):

1. **Declarar en `lessonFlow.ts`:**
   Añade un objeto a la lista `lessons` de la configuración:
   ```typescript
   { id: 'L16', title: 'Mi nueva lección interactiva', kind: 'simulator' }
   ```
2. **Crear la vista de la lección:**
   Crea el componente React en el directorio `lessons/` del módulo (ej. `lessons/L16_NewLesson.tsx`).
3. **Importar y envolver en `LessonShell`:**
   ```tsx
   import { LessonShell } from '../../../module-kit/components/LessonShell';
   import { BUDGET_MODULE_CONFIG } from '../lessonFlow';

   export default function L16_NewLesson() {
     return (
       <LessonShell
         moduleId="presupuesto"
         config={BUDGET_MODULE_CONFIG}
         id="L16"
         title="Mi nueva lección interactiva"
         completeWhen={/* lógica de completado, ej: true */}
       >
         <div>Contenido interactivo de la lección...</div>
       </LessonShell>
     );
   }
   ```
4. **Registrar la Ruta:**
   Agrega el mapeo en el enrutador central si es necesario. (La ruta dinámica unificada `/app/:moduleId/lesson/:lessonId` carga dinámicamente el wrapper `LessonWrapper` que instancia el componente correcto).

---

## 💾 Gestión de Estado: Zustand + Dexie (Offline-First)

El sistema opera bajo una regla estricta: **las lecciones no acceden a servicios web ni repositorios de base de datos directamente.**

* **Dexie (IndexedDB):** Actúa como base de datos transaccional local. Almacena el progreso de las lecciones de forma persistente y segura en el dispositivo móvil del estudiante.
* **Zustand:** Mantiene el estado reactivo en memoria para una respuesta instantánea de la interfaz gráfica (renderizados fluidos, desbloqueo automático en UI).
* **Sincronización:** El componente `LessonShell` interactúa con el hook `useLessonProgress` el cual escribe primero en Dexie y luego registra una acción en la cola de sincronización de `SyncManager`.

---

## 🎨 Convenciones de Estilo (Tailwind CSS v4)

La aplicación utiliza la versión **4** de Tailwind CSS. El sistema de diseño se basa en variables CSS personalizadas definidas en `frontend/src/index.css` y `frontend/src/styles/`:
* **Acentos de Módulo:**
  * Presupuesto: color de advertencia (Warning / Amarillo-Naranja) `var(--color-brand-warning)`.
  * Ahorro: color de éxito (Success / Verde) `var(--color-brand-success)`.
  * Inversión: color de información (Info / Azul-Celeste) `var(--color-brand-info)`.
* **Micro-animaciones:** Soporte para transiciones fluidas de hover, desvanecidos al cargar componentes y barras de progreso fluidas.
