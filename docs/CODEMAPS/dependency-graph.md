# 📊 Grafo de Dependencias (Dependency Graph Codemap)

Este documento contiene la definición textual y lógica en formato Mermaid del flujo de dependencias de **FinEmpoder**. También puedes ver el diagrama visual detallado en formato vectorial en [dependency-graph.svg](file:///c:/Proyectos/finempoder/docs/CODEMAPS/dependency-graph.svg).

---

## 🗺️ Mapa de Flujo de Datos y Dependencias

A continuación se muestra cómo dependen los diferentes módulos de la aplicación:

```mermaid
graph TD
    %% Frontend Subgraph
    subgraph Frontend [Frontend - React App]
        UI[Componentes de UI / Páginas] -->|Accede al estado| Zustand[Zustand Stores]
        UI -->|Acceso Offline-first| Dexie[Dexie DB / IndexedDB]
        Zustand -->|useAuth / useProgress| UI
        Dexie -->|Registra Acciones| SyncQueue[Queue de Sincronización]
        SyncQueue -->|Trabajo Asíncrono| SyncManager[SyncManager Worker]
    end

    %% Backend Subgraph
    subgraph Backend [Backend - Express API]
        Express[Rutas de Express] -->|Maneja Lógica| Controllers[Controladores]
        Controllers -->|Valida Esquemas| Zod[Zod Schemas]
        Controllers -->|Verifica Rachas/XP| GamificationHelpers[Gamification Helpers]
    end

    %% Supabase Subgraph
    subgraph Cloud [Supabase Cloud Services]
        SupaAuth[Supabase Auth]
        SupaDB[(PostgreSQL Database)]
    end

    %% Inter-connections
    UI -->|onAuthStateChange| SupaAuth
    SupaAuth -->|Emite Token JWT| Zustand
    SyncManager -->|Envía POST con JWT| Express
    Express -->|Consultas con Service Role| SupaDB
```

---

## 🔍 Detalles del Flujo de Sincronización offline-first

1. **Persistencia Síncrona:** Cuando el usuario completa una lección, `useLessonProgress` escribe de manera síncrona en `lessonProgressRepository`, guardando los datos directamente en IndexedDB (Dexie).
2. **Registro de la Cola:** Inmediatamente se añade la acción en la tabla `syncQueue` (Dexie) mediante `SyncManager.enqueue()`.
3. **Conexión de Red:**
   * Si el dispositivo está **online**, `SyncManager.flush()` es llamado inmediatamente.
   * Si está **offline**, `SyncManager` escucha el evento `'online'` de la API del navegador (`window.addEventListener('online', ...)`).
4. **Despacho del Lote:** Al volver la conexión, `SyncManager` lee secuencialmente las acciones pendientes de la base de datos local y realiza llamadas POST seguras al backend usando el JWT de autorización en memoria.
5. **Persistencia en la Nube:** El backend procesa las solicitudes una a una, recalcula las estadísticas del usuario en tiempo real y guarda los cambios en Supabase Cloud. Si falla la llamada, se aplica un mecanismo de **reintento exponencial (backoff)** para proteger la consistencia de los datos.
