# FinEmpoder — checkpoint de preparación para producción

Fecha del corte: 10 de septiembre de 2026  
Rama revisada: `qa-identivezz`  
Decisión actual: **NO-GO temporal** hasta cerrar los bloqueadores operativos de esta página.

## Actualización técnica · 28 de septiembre de 2026

- El frontend genera una CSP en `index.html` para vistas previas locales y una cabecera HTTP CSP en Vercel con los mismos orígenes configurados. La cabecera añade `frame-ancestors 'none'`. Verificarla en el dominio final antes de publicar.
- El build falla si algún chunk JavaScript supera 100 KiB Brotli. El build local pasa con este presupuesto.
- Se eliminó la importación dinámica redundante de `SyncManager` y su advertencia de build.
- Las dependencias de desarrollo del frontend se actualizaron; `npm audit` informa 0 vulnerabilidades en frontend y backend. La suite del frontend pasó con 395 pruebas y el E2E de rutas pasó las 45 lecciones en escritorio y móvil.
- Los rangos equivalentes de los simuladores ya usan `LessonRange` del `module-kit` en seis lecciones. Los controles específicos de cada actividad conservan su composición.

El estado **NO-GO** sigue vigente: estas verificaciones son locales y no sustituyen la confirmación remota de migraciones, variables, proveedores, pagos ni smoke test del despliegue.

## Estado verificado

| Área | Estado | Evidencia local |
|---|---|---|
| 45 lecciones | Lista | Las 15 rutas de Presupuesto, Ahorro e Inversión cargan en desktop y Pixel 7. |
| Frontend unitario | Lista | 91 archivos y 395 pruebas aprobadas en la verificación del 28 de septiembre. |
| Convenciones de módulos | Lista | Guardas y checklists estáticos de los tres módulos aprobados. |
| Build frontend | Lista | TypeScript y build Vite de producción aprobados. |
| Backend | Lista | 22 pruebas aprobadas: 8 de API y 14 de newsletter; build TypeScript de producción aprobado. |
| Persistencia local | Lista | Escrituras finales por lote, índices compuestos, deduplicación y pruebas de integridad. |
| Rutas de error | Lista | Página 404 integrada. |
| Caché PWA | Lista | Las respuestas `/api` usan `NetworkOnly`; no quedan datos autenticados en Cache Storage. |
| Secretos locales | Lista | `backend/.env` y `frontend/.env` están ignorados y no están versionados. |
| Dependencias de producción | Lista | `npm audit --omit=dev --audit-level=high`: 0 vulnerabilidades en frontend y backend. |
| CI | Lista localmente | Workflow añadido para backend, frontend y matriz E2E. Se confirma al abrir el primer PR. |
| Base de datos remota | Pendiente | Las migraciones 001, 002 y 004 están versionadas; falta confirmar que están aplicadas en producción. La 003 de Ligas fue retirada de este release. |
| Proveedores externos | Pendiente | Falta smoke test real con Supabase, Railway/Vercel y, si se activa newsletter, Stripe y Resend. |
| Release versionado | Bloqueado | El árbol contiene decenas de archivos modificados y nuevos todavía sin consolidar en commits revisables. |

## Bloqueadores para el go-live

1. **Consolidar el release.** Separar y revisar los cambios de lecciones, infraestructura/persistencia y newsletter. El despliegue debe salir de un commit identificado, con CI verde, no del árbol de trabajo actual.
2. **Confirmar el estado de Supabase.** Verificar que `002_fix_rls_policies.sql` está aplicada. La migración 001 crea políticas amplias con nombres de service role; la 002 las elimina y limita todas las escrituras al `auth.uid()` propietario. Confirmar también la 004 antes de exponer el newsletter.
3. **Configurar los entornos de producción.** Vercel necesita `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y `VITE_API_URL`. Railway necesita `NODE_ENV=production`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` y la lista exacta de `CORS_ORIGIN`.
4. **Validar el despliegue real.** Probar registro/inicio de sesión, invitado, progreso de una lección por módulo, cierre/reapertura, 404, modo offline y sincronización desde dos sesiones.
5. **Completar la integración del newsletter.** Es parte del primer release. Mantener sus flags apagados durante la preparación y activarlos solo después de validar Stripe/Resend, términos, reembolsos, webhook, cron y una compra real en modo de prueba.

## Secuencia recomendada de salida

### Fase 1 — release candidate

- Congelar cambios funcionales.
- Crear commits pequeños y revisables.
- Abrir PR hacia `main` y exigir los tres jobs de CI.
- Revisar el diff y confirmar que ningún `.env`, credencial o artefacto de build se agregó.
- Crear una etiqueta del release candidate o registrar el SHA aprobado.

### Fase 2 — datos y backend

- Tomar respaldo de Supabase y registrar el punto de restauración.
- Aplicar las migraciones 001, 002 y 004 según las ya presentes en el entorno. La numeración conserva el hueco 003 porque Ligas está congelado fuera de este release.
- Consultar `pg_policies` para confirmar que no quedan políticas `service role gestiona` de la migración 001.
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
- Una cuenta no puede leer o modificar progreso, presupuesto, cuestionarios o newsletter de otra cuenta.
- La aplicación deja una explicación útil al perder red y se recupera al reconectarse.
- El backend devuelve 200 en `/api/health`, 401 sin token en rutas privadas, 404 en rutas desconocidas y 429 al superar el límite.
- El flujo completo del newsletter cubre catálogo, muestra, registro, consentimiento, checkout, portal, acceso pagado, preferencias y cancelación.

## Rollback

- Conservar el despliegue frontend y backend anterior y sus identificadores.
- Si falla la interfaz, revertir Vercel al deployment anterior.
- Si falla la API, revertir Railway al deployment anterior y mantener el frontend apuntando a una API compatible.
- Las migraciones de datos requieren un plan específico; no ejecutar `DROP` automático. Restaurar desde respaldo si una migración afecta datos existentes.
- Desactivar newsletter con sus feature flags ante cualquier inconsistencia de pagos o entrega.

## Riesgos no bloqueantes

- El presupuesto de 100 KiB Brotli controla chunks individuales; aún falta medir tiempos de carga en dispositivos y redes reales.

## Criterio de GO

El release cambia a **GO** cuando existe un SHA revisado con CI verde, las migraciones remotas y políticas RLS están confirmadas, los secretos y dominios de producción están configurados, el newsletter completa su validación externa y el smoke test real termina sin fallos críticos.
