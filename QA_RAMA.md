# 
## URL FIJA: https://qa.finempoder.com.mx

El alias `qa.finempoder.com.mx` apunta al deploy de QA. Para redesplegar y que la URL fija se actualice:

```bash
cd frontend
vercel deploy --scope ghaels-projects  # copia la URL del preview resultante
vercel alias set <URL-PREVIEW> qa.finempoder.com.mx --scope ghaels-projects
```

La URL de preview efímera puede cambiar; `qa.finempoder.com.mx` NUNCA cambia.

QA_RAMA.md — Rama de pruebas permanente `qa-identivezz`

Rama SIEMPRE desplegada en Vercel para revisar cambios desde el celular, con modo admin
que desbloquea las 45 lecciones sin completar el flujo.

## URL del deploy (preview estable)

**https://modo-vida-finempoder-48a6xam7p-ghaels-projects.vercel.app**

- Estado: Ready (Preview), desplegada 2026-08-23.
- Root `/` responde 200 y `/admin` responde 200 (verificado).
- El proyecto Vercel es `modo-vida-finempoder` (team `ghaels-projects`), Root Directory configurado en `frontend`.
- OJO: cada `vercel deploy` nuevo genera una URL distinta. Si quieres una URL FIJA para la rama QA, aplicar alias: `vercel alias <url-nueva> qa-finempoder.vercel.app` (el alias solo puede apuntar a un deploy a la vez).

## Cómo subir cambios futuros a la rama QA

1. Trabajar y gatear cambios en ramas normales (p.ej. `f0-oauth-google-magic-link`); respetar los gates (tests + build + review).
2. Cambiar a la rama QA y traer los cambios gateados:
   ```bash
   git checkout qa-identivezz
   git merge <rama-gateada> --no-ff -m "Merge <rama> a QA"
   ```
   (Si el cambio es exclusivo de QA, se commitea directo en esta rama.)
3. Verificar: `cd frontend && npm test && npm run build` (84 tests + rc 0).
4. Redesplegar (preview, NO producción):
   ```bash
   cd "/home/identivez/Proyectos/FINEMPODER INC/finempoder app"   # raíz del repo (el link .vercel vive aquí)
   vercel deploy --yes
   ```
   El comando imprime la URL nueva o se obtiene con `vercel ls modo-vida-finempoder --scope ghaels-projects`.
5. Verificar la URL nueva: `curl -s -o /dev/null -w "%{http_code}" -L <url>/admin` → 200.
6. Actualizar la URL en este documento y (opcional) el alias.

## Modo administrador (desde el celular)

1. Abrir la URL del deploy.
2. Ir a `https://<deploy>/admin` (no hay link en la UI, se escribe a mano).
3. Escribir el PIN y presionar "Activar modo admin".
   - **PIN: `2026`** (vive SOLO en el código de esta rama QA: `frontend/src/pages/admin/AdminPage.tsx`, constante `ADMIN_PIN`).
4. Con el modo activo: todas las lecciones quedan desbloqueadas (overviews muestran todas + badge `PROBAR` en las no completadas) y el banner naranja "🛠 MODO ADMIN · salir" aparece fijo; "salir" lo desactiva.
5. En `/admin` también hay "Limpiar progreso local" (borra `lessonProgress` y `userLessonData` de Dexie en el dispositivo; no toca rachas ni cola de sync).

## Notas operativas

- El PIN es para pruebas del dueño; si la rama QA se hiciera pública/colaborativa, mover el PIN a variable de entorno (VITE_ADMIN_PIN) antes.
- La protección SSO del proyecto Vercel (`ssoProtection`) se desactivó vía API para que el preview sea público (verificado curl 200 directo). Producción (`app.finempoder.com.mx`) era ya pública y no se tocó.
- El título del `index.html` aún dice "FinEmpoder | IT Toluca" (metadata, no contenido); ajustarlo es un cambio de marca aparte, no incluido en la generalización.
- NO pushear la rama QA a origin salvo que el dueño lo pida (por ahora es local + deploy manual).