# FinEMPODER — Estado del Proyecto (documento maestro)

> Última actualización: 2026-09-30 · Mantenedor: Skere (orquestador)
> Fuente de verdad operativa: este doc + `QA_RAMA.md` + el doc por ola (F*.md en la raíz).
> Regla del dueño: **todo cambio queda documentado**; los docs viven en el repo, no en conversaciones.

---

## 1. Qué es FinEMPODER

PWA gratuita de finanzas personales para México (45 lecciones interactivas en 3 módulos: Presupuestación, Ahorro, Inversión). Modelo de negocio: **cero costo para el usuario**; ingresos vía redes sociales + newsletter. Visa: que los mexicanos le pierdan el miedo al dinero. Referencias de patrón: HelloChinese (camino/mapas), Duolingo (gamificación).

## 2. Infraestructura y URLs

| Recurso | Valor |
|---|---|
| App QA (pruebas del dueño) | https://qa.finempoder.com.mx (alias Vercel fijo) |
| Producción | https://app.finempoder.com.mx (NO desplegada con F0-F6; ver pendientes) |
| Landing | www.finempoder.com.mx |
| Supabase | pxjxktpdxnqiulfyskuk.supabase.co · 002 corregida y 004 aplicadas manualmente el 2026-09-28; RLS y API verificadas |
| Rama QA permanente | `qa-identivezz` · PIN admin: 2026 (solo esta rama) |
| MCP Supabase | conectado y autorizado (OAuth) en perfil skere |
| Vigía de loops | cron cada 10 min → Telegram (veredictos Lupa y fin de agentes) |

## 3. Fases ejecutadas (todas gateadas por Lupa)

| Fase | Qué incluyó | Rama(s) / commits clave | Gate |
|---|---|---|---|
| F0 — Auth | Cero login nativo; Google OAuth + Magic Link (código 6 dígitos); backend sin auth; snapshot del guest mode | `f0-oauth-google-magic-link` (304daf8, 5f6c9e3, d9e0475) | PASS_WITH_WARNINGS → cerrado |
| F1.0 — Auditoría + generalización | 45 lecciones auditadas (scorecard); 19 reescritas sin sesgo estudiante (casos espejo laborales) | `GENERALIZACION_CONTENIDO.md` (c96115e) | PASS_WITH_WARNINGS → cerrado |
| QA Infra | Rama QA + admin + dominio fijo | `qa-identivezz`, QA_RAMA.md (d4c44b6) | E2E verificado |
| F1 — Experiencia | Celebración (confetti/XP/Finni), autoguardado, meta diaria, streak freeze, camino de nodos, Home réplica del mockup del dueño | `f1-home-mockup-v2` (hasta 6c38df1) | 2 gates + retest F2-01 |
| F2 — Datos + gamificación | `datos-mx.ts` (cifras 2026 con fecha+fuente), tiers Bronce/Plata/Oro, celebración de logros, Finni, investigación eliminada como logro | `f2-datos-mx`, `f2-gamificacion` (e3d619c, 6c38df1) | 2 retests (F2-01 modal) |
| F3 — Crecimiento | Tarjeta de logro compartible (PNG 1080×1080), captura de email (3er logro → newsletter local), kit de lanzamiento (Mark) | `f3-crecimiento` (8e421f3) | FAIL → retest PASS (PNG transparente) |
| F4 — Ligas | Congelada y excluida del primer release; código preservado en rama dedicada | `feature/ligas-congeladas-2026-09` | Fuera de alcance |
| F5 — Promesas rotas | L15 señal honesta, micro-reto con días reales, tutorial verificable | `f5-promesas-rotas` (30254a0) | FAIL (suite inestable) → retest PASS 3/3 |
| F6 — Analytics | Wrapper tipado (11 eventos), PostHog opcional (no-op sin clave), identify con dedupe por id, H3 (Depósito sin promesa falsa) | `f6-analytics` (hasta b5b068c) | 2 retests (identify cableado + dedupe) → PASS |
| F7 — Onboarding | 3 pantallas con valor (chips de confianza → meta diaria → primera lección), guest-compatible, skip siempre, tildes corregidas, analytics cableado | `f7-onboarding` (e6a2304) | PASS_WITH_WARNINGS (H1 menor → fix directo; H2/H3 cola) |

Estado de UI actual en QA: Home réplica del mockup + camino + gamificación + share + newsletter + onboarding con valor. Ligas y el newsletter de pago quedan fuera de la primera salida a producción.
## 4. Deuda abierta (priorizada)

| # | Deuda | Tipo | Estado / acción |
|---|---|---|---|
| D1 | Google OAuth sin activar (código listo) | Humano | Crear OAuth Client en Google Cloud → Supabase Providers + redirect URLs (`F0_CAMBIOS.md` §4). Para el primer lanzamiento por correo, configurar además SMTP transaccional propio en Supabase Auth; el servicio incorporado no sirve para producción. |
| D2 | Producción sin desplegar (app.finempoder.com.mx sigue pre-F0) | Decisión | El alias aún apunta a `modo-vida-finempoder`, mientras QA usa `frontend`; el nuevo proyecto no tiene variables de Production y la URL pública conocida de Railway devuelve 404 en `/api/health`. Confirmar backend y destino antes de mover el dominio; verificar `site_url` en Supabase. |
| D14 | Historial de migraciones y respaldo de Supabase | Operación | El panel confirmó que solo registra `20260826024609 003_league_schema` y el plan Free no ofrece respaldos administrados. Obtener y verificar una exportación antes de reconciliar 001/002/004 o aplicar nuevas migraciones de datos. |
| D3 | Billete Bajo Control posterior al primer release | Producto/negocio | Esquema 004 aplicado y verificado; interfaz y asistente editorial local listos. La primera salida lo mantiene oculto y apagado. Antes de activarlo: validar Stripe, Resend, cron, términos, compra de prueba y generación con clave real. |
| D15 | Automatización editorial autónoma | Producto/operación | La etapa inicial genera borradores bajo demanda con investigación, redacción y revisión automática; faltan cola persistente de temas, calendario, expediente auditable, límite de gasto y ejecución programada. Requiere resolver D14 antes de una nueva migración. |
| D16 | Consola administrativa ampliada | Producto/seguridad | Primera etapa implementada en `/app/admin`: rol verificado por backend, resumen, workflow editorial, cuentas en solo consulta y configuración operativa. Pendientes auditoría de acciones, doble confirmación y permisos granulares antes de administrar cuentas, contenido educativo o ajustes desde la consola. |
| D4 | Analytics sin clave PostHog (wrapper listo en f6) | Humano | Crear cuenta PostHog free → `VITE_POSTHOG_KEY` en .env → build |
| D7 | Kit de lanzamiento: placeholders `[LINK_APP]`, `[FECHA]`, `[ENLACE_NEWSLETTER]` | Negocio | Decidir fecha y resolver links (`KIT_LANZAMIENTO_FINEMPODER.md`) |
| D8 | Sonidos/hápticos (opcional, con toggle) | Opcional | Plan F2.3 |
| D9 | Módulo nuevo (Deudas o Crédito y buró) | Futuro | Decidir con datos de uso (requiere D4 activo) |
| D10 | Retos 1-a-1 / votación comunidad | Futuro | Requiere masa crítica |
| D11 | Ligas congeladas fuera del primer release | Futuro | Preservadas en `feature/ligas-congeladas-2026-09`; reactivar mediante revisión independiente |
| D12 | Limpieza: 3 usuarios de prueba en auth.users (sin service role) | Cosmética | Opcional |

## 5. Decisiones de producto registradas

- **Cero costo siempre**; ingresos solo por redes + newsletter (nunca paywall).
- **Auth**: solo Google OAuth + Magic Link por código; Apple descartado (costo dev account); cero contraseñas nativas.
- **Contenido universal**: prohibidas suposiciones de edad/ocupación ("universitarios" → "casi todos"); casos espejo laboral donde el ancla era escolar.
- **Cero emojis** en toda la UI (iconos lucide); **cero marcas de IA** en copy (sin rayas largas, sin "no es X es Y").
- **Honestidad absoluta**: la app dice lo que hace (fix de promesas rotas F5; copys de newsletter/notificaciones verificados).
- **Datos macro centralizados** en `datos-mx.ts` con fecha+fuente por dato; gobernanza como test (falla si falta fecha/fuente).
- **PIN QA y rol administrativo separados**: el PIN 2026 solo controla herramientas locales de QA. `/app/admin` exige `profiles.role = 'admin'` verificado por el backend; el PIN no concede acceso.
- **Lanzamiento por etapas**: primero la app educativa gratuita, con Billete Bajo Control oculto en el frontend y `NEWSLETTER_ENABLED=false` / `NEWSLETTER_PAYMENTS_ENABLED=false` en producción. D3, D15 y D16 no bloquean esa primera salida.

## 6. Runbook operativo

### Flujo de un cambio (estándar desde F0)
1. REQUEST al agente correcto (Chip=dev, Lupa=qa, Brújula=research, Mark=growth) con criterio + evidencia.
2. Rama de trabajo desde `qa-identivezz` → commits por pieza → sin push/merge.
3. Veredicto Lupa con evidencia ejecutada (mínimo 1 gate por rama; los FAIL se retestan con su método).
4. Merge fast-forward a `qa-identivezz` → deploy Vercel → alias fijo → verificación 200.
5. Doc por ola (F*.md) + actualización de ESTADO-PROYECTO.md.

### Redeploy QA (desde el repo)
```bash
vercel deploy --yes          # genera URL de preview
vercel alias set <URL> qa.finempoder.com.mx --scope ghaels-projects
```
(El detalle completo vive en `QA_RAMA.md`; la URL de preview se actualiza en ese doc.)

### Supabase (proyecto pxjxktpdxnqiulfyskuk)
- Migraciones del release: 001, 002 y 004. La migración 003 de Ligas está fuera de esta rama y no debe aplicarse para este release.
- El MCP de Supabase está conectado en el perfil skere (OAuth) — aplicar SQL/verificar estado sin dashboard.
- OTP: `mailer_otp_length=6` (ajustado); template "Magic link or OTP" con `{{ .Token }}` (editado manualmente por el dueño).
- El SMTP incorporado de Supabase Auth solo sirve para pruebas y limita el envío; configurar un proveedor transaccional para OTP antes del primer GO. Las campañas de Resend para Billete Bajo Control son una etapa aparte (D3).

### Vigía de agentes
- Cron cada 10 min: reporta a Telegram veredictos de Lupa y fin de corridas de agentes del proyecto FinEMPODER.

## 7. Índice de documentación (dónde está cada cosa)

| Tema | Doc |
|---|---|
| Auditoría de 45 lecciones (scorecard + top fixes) | `AUDITORIA_LECCIONES.md` |
| Generalización del contenido | `GENERALIZACION_CONTENIDO.md` |
| Plan original + patrones copiados | `PLAN-RELANZAMIENTO.md` |
| Datos financieros verificados (Brújula) | `loop-fase1/DATOS_VERIFICADOS.md` |
| Home réplica del mockup | `F1_HOME_MOCKUP_V2.md` |
| Fase 2 datos (datos-mx) | `F2_DATOS_MX.md` |
| Fase 2 gamificación | `F2_GAMIFICACION.md` |
| Fase 3 crecimiento | `F3_CRECIMIENTO.md` |
| Fase 4 ligas | Rama congelada `feature/ligas-congeladas-2026-09` |
| Fase 5 promesas rotas | `F5_PROMESAS.md` |
| Rama QA + modo admin | `QA_RAMA.md` |
| Kit de lanzamiento (Mark) | `loop-f3-crecimiento/KIT_LANZAMIENTO_FINEMPODER.md` |
| Estado global (este doc) | `ESTADO-PROYECTO.md` |

## 8. Pendientes humanos del dueño (los que solo él puede hacer)

1. Crear cuenta PostHog (free) y dar la clave → analytics en vivo (D4).
2. OAuth Google (D1) cuando se demande.
3. Autorizar deploy a producción (D2).
4. Definir la fecha de lanzamiento de la app gratuita (D7). Configurar y validar proveedores de Billete Bajo Control (D3) y la operación editorial autónoma (D15) para una etapa posterior.
5. Validar en un celular el onboarding completo desde cero.
