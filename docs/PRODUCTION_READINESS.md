# FinEmpoder — checkpoint de preparación para producción

Fecha del corte: 30 de septiembre de 2026
Rama revisada: `qa-identivezz`  
Decisión actual: **NO-GO temporal** hasta cerrar los bloqueadores operativos de esta página.

Alcance aprobado para el primer GO: app educativa gratuita. Billete Bajo Control se mantiene desactivado en la API y oculto en el build del frontend; su contratación, envío y automatización quedan para una segunda etapa.

## Actualización técnica · 28 de septiembre de 2026

- El frontend genera una CSP en `index.html` para vistas previas locales y una cabecera HTTP CSP en Vercel con los mismos orígenes configurados. La cabecera añade `frame-ancestors 'none'`. Verificarla en el dominio final antes de publicar.
- El build falla si algún chunk JavaScript supera 100 KiB Brotli. El build local pasa con este presupuesto.
- Se eliminó la importación dinámica redundante de `SyncManager` y su advertencia de build.
- Las dependencias de desarrollo del frontend se actualizaron; `npm audit` informa 0 vulnerabilidades en frontend y backend. La suite del frontend pasó con 395 pruebas y el E2E de rutas pasó las 45 lecciones en escritorio y móvil.
- Los rangos equivalentes de los simuladores ya usan `LessonRange` del `module-kit` en seis lecciones. Los controles específicos de cada actividad conservan su composición.
- El build controla ahora la carga inicial de JS/CSS (202.7 KiB Brotli frente a un máximo de 220 KiB). Dos ejecuciones locales de tres recorridos por perfil, con 4× CPU y red emulada, registraron FCP/LCP medianos de 2.46–3.08 s en escritorio y 2.40–3.62 s en Pixel 7 emulado. La variación impide fijar un umbral fiable con esta prueba; la fuente externa se sustituyó por CSS vacío y sigue faltando una prueba con teléfono y red reales.

## Comprobación remota · 28 de septiembre de 2026

- `app.finempoder.com.mx` responde 200, pero apunta al proyecto Vercel `modo-vida-finempoder` y a un deployment creado el 14 de junio de 2026. El checkout está vinculado al proyecto `frontend`, cuyo despliegue se usa en QA; no hay variables de entorno de producción listadas para ese proyecto.
- El dominio de QA responde 200. El endpoint público `GET /api/health` del backend configurado en el entorno local devuelve 404 desde Railway; el código del backend sí declara esa ruta. Hay que confirmar la URL efectiva del backend y publicar una versión que responda 200 antes de un smoke test autenticado.
- El hostname de Supabase configurado en frontend y backend (`pxjxktpdxnqiulfyskuk.supabase.co`) volvió a resolver y `/auth/v1/health` responde 200 con la clave pública. Las migraciones 002 corregida y 004 se aplicaron manualmente en el SQL Editor: las cinco políticas amplias desaparecieron, `authenticated` no puede insertar ni actualizar `profiles.role`, y las tres tablas de newsletter responden 200 con `service_role`. Las tablas tienen RLS activo y niegan lectura a `anon` y `authenticated`; las tres funciones solo permiten ejecución a `service_role`. Una lectura de `profiles` bajo rol `authenticated` sin sesión terminó sin recursión y devolvió cero filas.
- El historial de migraciones del panel solo registra `003_league_schema`: el esquema de 001 está presente sin entrada de historial, y las aplicaciones manuales de 002 y 004 tampoco aparecen allí. El plan Free no ofrece respaldos administrados. Reconciliar historial y estrategia de respaldo antes de nuevas migraciones de datos.
- El commit local `c93b4c5` registra las correcciones técnicas previas. No se ha enviado al remoto ni abierto PR, y los cambios de medición de este corte siguen pendientes de revisión.

El estado **NO-GO** sigue vigente: el esquema remoto está verificado, pero faltan configuración del despliegue, respaldo e historial de migraciones, CI remoto y smoke test real. Los proveedores de pagos y correo no bloquean la primera salida porque el newsletter estará apagado.

## Trabajo local posterior · 30 de septiembre de 2026

El newsletter se presenta como **Billete Bajo Control** en la app y en los correos. Se añadió un asistente editorial opcional que investiga con búsqueda web, prepara un borrador y señala dudas mediante tres pasos de IA. Solo el responsable editorial puede iniciarlo; no guarda, aprueba ni envía por sí mismo. Las pruebas locales usan respuestas simuladas: falta configurar la clave en el backend, probar calidad/costo con el servicio real y verificar el contenido humano antes de publicar. La automatización autónoma con cola, calendario y expediente persistente sigue pendiente (D15); no cambia el estado NO-GO.

La primera consola `/app/admin` consulta cuentas, actividad y configuración, y abre el workflow editorial. Todas las consultas requieren el rol `admin` de Supabase comprobado en el backend; el PIN de QA no sirve como credencial. No permite suspender ni borrar cuentas. Faltan auditoría, confirmaciones y permisos granulares para ampliar ese alcance (D16). La señal de proveedores muestra configuración presente, no salud externa.

## Revisión del candidato gratuito · 30 de septiembre de 2026

- El build de producción oculta Billete Bajo Control por defecto. La prueba automatizada del artefacto compilado confirmó en escritorio y móvil que no aparece en la navegación, no hay desborde horizontal y `/app/newsletter` redirige a `/app`. Para activarlo en una etapa posterior harán falta `VITE_NEWSLETTER_ENABLED=true` en el build y `NEWSLETTER_ENABLED=true` en la API; los pagos permanecen separados.
- La suite del frontend pasó con 402 pruebas en 94 archivos, lint, TypeScript y guardas estáticas. La API pasó 29 pruebas y compilación de producción. El bundle inicial mide 203.0 KiB Brotli frente al límite de 220 KiB.
- Supabase Dashboard muestra el proyecto en plan Free sin respaldos administrados. El historial remoto solo registra `20260826024609 003_league_schema`; 001, 002 y 004 existen en el esquema pero no en ese historial. No se ejecutó reparación ni nueva migración. Hace falta una exportación recuperable y verificada antes de alterar datos o metadatos de migración.
- Vercel vincula `app.finempoder.com.mx` al deployment antiguo de `modo-vida-finempoder`. El proyecto `frontend` de QA no tiene variables de Production; el proyecto antiguo sí registra los nombres `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y `VITE_API_URL`. No se copiaron valores ni se movieron dominios.
- La URL pública configurada en el entorno local para Railway devuelve 404 en `/api/health`. El backend local sí responde 200. No hay sesión de Railway disponible para inspeccionar el servicio remoto; no se desplegó nada.
- Authentication → Emails de Supabase confirma que el proyecto usa el servicio de correo incorporado, marcado como no apto para producción. El primer release necesita SMTP transaccional propio para los códigos de acceso, aunque el newsletter y sus campañas permanezcan apagados. Validar remitente, entrega, límites y el flujo de registro/inicio de sesión con cuentas externas.

## Estado verificado

| Área | Estado | Evidencia local |
|---|---|---|
| 45 lecciones | Lista | Las 15 rutas de Presupuesto, Ahorro e Inversión cargan en desktop y Pixel 7. |
| Frontend unitario | Lista | 94 archivos y 402 pruebas aprobadas; verificación completa el 30 de septiembre. |
| Convenciones de módulos | Lista | Guardas y checklists estáticos de los tres módulos aprobados. |
| Build frontend | Lista | TypeScript y build Vite de producción aprobados; 203.0 KiB Brotli de carga inicial. |
| Backend | Lista | 29 pruebas aprobadas: 8 de API, 4 de consola administrativa y 17 de newsletter; build TypeScript de producción aprobado. La IA usa respuestas simuladas en pruebas. |
| Persistencia local | Lista | Escrituras finales por lote, índices compuestos, deduplicación y pruebas de integridad. |
| Rutas de error | Lista | Página 404 integrada. |
| Caché PWA | Lista | Las respuestas `/api` usan `NetworkOnly`; no quedan datos autenticados en Cache Storage. |
| Secretos locales | Lista | `backend/.env` y `frontend/.env` están ignorados y no están versionados. |
| Dependencias de producción | Lista | `npm audit --omit=dev --audit-level=high`: 0 vulnerabilidades en frontend y backend. |
| CI | Lista localmente | Workflow añadido para backend, frontend y matriz E2E. Se confirma al abrir el primer PR. |
| Base de datos remota | Verificada manualmente | 002 corregida y 004 aplicadas; políticas, privilegios, tablas y REST comprobados. Reconciliar historial de migraciones y estrategia de respaldo. La 003 de Ligas figura en el historial remoto, pero sigue fuera del release de la app. |
| Proveedores externos | Pendiente | Railway devuelve 404 en el `/api/health` configurado; falta identificar la URL activa y completar smoke tests con Supabase y Vercel. Stripe y Resend se validarán antes de activar el newsletter, no para el primer GO. |
| Release versionado | Bloqueado | Hay un commit técnico local (`c93b4c5`), pero el release completo no tiene SHA revisado con CI remoto verde ni despliegue desde ese SHA. |

## Bloqueadores para el go-live

1. **Consolidar el release.** Separar y revisar los cambios de lecciones, infraestructura/persistencia y newsletter. El despliegue debe salir de un commit identificado, con CI verde, no del árbol de trabajo actual.
2. **Configurar los entornos de producción.** Vercel necesita `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y `VITE_API_URL`. Railway necesita `NODE_ENV=production`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` y la lista exacta de `CORS_ORIGIN`. Supabase Auth necesita SMTP transaccional propio para que el inicio por correo funcione fuera del equipo del proyecto; esto no activa las campañas del newsletter.
3. **Validar el despliegue real.** Probar registro/inicio de sesión, invitado, progreso de una lección por módulo, cierre/reapertura, 404, modo offline y sincronización desde dos sesiones.
4. **Comprobar el apagado del newsletter.** El build de producción debe tener `VITE_NEWSLETTER_ENABLED=false` (también es el valor por defecto si se omite); Railway debe tener `NEWSLETTER_ENABLED=false` y `NEWSLETTER_PAYMENTS_ENABLED=false`. Verificar que no haya acceso de usuario ni checkout. Stripe, Resend, términos, reembolsos, webhook, cron y compra de prueba se validarán antes de su activación posterior.

## Secuencia recomendada de salida

### Fase 1 — release candidate

- Congelar cambios funcionales.
- Crear commits pequeños y revisables.
- Abrir PR hacia `main` y exigir los tres jobs de CI.
- Revisar el diff y confirmar que ningún `.env`, credencial o artefacto de build se agregó.
- Crear una etiqueta del release candidate o registrar el SHA aprobado.

### Fase 2 — datos y backend

- Definir un respaldo manual o un plan con respaldos antes de futuras migraciones que modifiquen datos; el plan Free actual no ofrece copias administradas.
- Reconciliar las migraciones aplicadas manualmente con el historial del proyecto; no volver a ejecutar 001, 002 ni 004 sobre el esquema actual. La 003 de Ligas ya figura en el historial remoto, aunque Ligas permanece fuera del release.
- Desplegar Railway desde el SHA aprobado.
- Comprobar `/api/health`, CORS desde el dominio real y una ruta autenticada.

Consulta de control:

```sql
select schemaname, tablename, policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

### Fase 3 — frontend

- Desplegar Vercel desde el mismo SHA.
- Confirmar que `VITE_API_URL` termina en `/api` y apunta al backend de producción.
- Ejecutar el smoke test en móvil y escritorio, incluyendo recarga directa de una ruta de lección y de una URL inexistente.
- Confirmar que el service worker nuevo reemplaza al anterior y que Cache Storage no contiene respuestas de API.

### Fase 4 — apertura gradual

- Abrir primero a un grupo interno o piloto.
- Vigilar errores 5xx, 401 anómalos, latencia, fallos de sincronización y finalización de lecciones.
- Ampliar el acceso cuando una sesión completa de cada módulo se guarde y recupere sin incidencias.
- Activar Sentry antes de una apertura pública. PostHog puede mantenerse apagado hasta definir consentimiento y retención.

## Smoke test de aceptación

- `/`, `/app`, login, registro, términos, privacidad y una URL inexistente responden correctamente.
- El modo invitado entra a la app sin redirección obligatoria a login.
- Las 45 lecciones abren; una de cada módulo se completa y conserva el estado tras recargar.
- Dos sesiones del mismo usuario no duplican XP ni progreso.
- Una cuenta no puede leer o modificar progreso, presupuesto o cuestionarios de otra cuenta.
- La aplicación deja una explicación útil al perder red y se recupera al reconectarse.
- El backend devuelve 200 en `/api/health`, 401 sin token en rutas privadas, 404 en rutas desconocidas y 429 al superar el límite.
- No aparece Billete Bajo Control en la navegación ni en Ajustes; sus rutas directas vuelven a la app y la API desactivada no ofrece catálogo ni checkout.

## Rollback

- Conservar el despliegue frontend y backend anterior y sus identificadores.
- Si falla la interfaz, revertir Vercel al deployment anterior.
- Si falla la API, revertir Railway al deployment anterior y mantener el frontend apuntando a una API compatible.
- Las migraciones de datos requieren un plan específico; no ejecutar `DROP` automático. Restaurar desde respaldo si una migración afecta datos existentes.
- Desactivar newsletter con sus feature flags ante cualquier inconsistencia de pagos o entrega.

## Riesgos no bloqueantes

- La medición de carga usa perfiles emulados y omite la descarga de Google Fonts; falta repetirla en un teléfono y una red reales antes de fijar un objetivo de experiencia de usuario.

## Criterio de GO

El primer release cambia a **GO** cuando existe un SHA revisado con CI verde, el respaldo y el historial de migraciones están documentados, las políticas RLS están confirmadas, los secretos y dominios de producción están configurados, el correo transaccional de acceso funciona con usuarios externos, el newsletter está apagado en ambos servicios y el smoke test real termina sin fallos críticos. El newsletter tendrá un GO independiente después de validar proveedores, cobros y entrega.
