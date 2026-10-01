# F3 — Crecimiento: Tarjeta de logro compartible + captura de email

Rama: `f3-crecimiento` (base: `qa-identivezz` @ `af6c3bc`).

> Gate: sin push, sin merge, sin deploy. QA en preview: https://qa.finempoder.com.mx

La app es 100% gratis; el crecimiento viene de redes (tarjeta compartible)
y de un newsletter (captura de email). **No hay backend de newsletter**: la
captura se guarda local en Dexie y queda lista para conectar.

## Decisión de imagen: html-to-image

Se usa **html-to-image** (`^1.11.13`, trae tipos, sin deps nativas) con
`toPng`. Alternativa canvas-manual descartada: dibujar texto + icono SVG de
las 6 series a mano es más código, más frágil y no aporta nada aquí.

**Bundle**: el import es **dinámico** (solo al pulsar "Compartir"), así que
html-to-image vive en un chunk lazy aparte:

| Asset | Antes | Después | Delta |
| --- | --- | --- | --- |
| `index-*.js` (bundle principal) | 301,670 B | 312,641 B | +10,971 B (+3.6%, UI nueva) |
| `vendor-ui` (lucide: 4 iconos nuevos) | 57,433 B | 58,642 B | +1,209 B |
| chunk lazy de html-to-image | — | 13,004 B (5,214 B gzip) | solo se carga al compartir |

La tarjeta usa **colores fijos en hex** (no CSS vars) para que el PNG quede
idéntico dentro y fuera del navegador; html-to-image serializa computed
styles (las vars se resolverían), pero fijar el hex elimina cualquier
dependencia del contexto. Paleta copiada de `tokens.css`:

| Serie | Acento | Pastilla | Icono |
| --- | --- | --- | --- |
| presupuesto | `#F59E0B` | `#FDE68A` | `#92400E` |
| ahorro | `#10B981` | `#A7F3D0` | `#065F46` |
| inversion | `#4B73F0` | `#DBEAFE` | `#1E40AF` |
| racha | `#F97316` | `#FFEDD5` | `#9A3412` |
| lecciones | `#6366F1` | `#E0E7FF` | `#3730A3` |
| finempoder_pro | `#D97706` | `#FDE68A` | `#92400E` |

Fondo de la tarjeta crema `#FEF3C7` (token `--color-brand-cream`), texto
`#0F172A` / `#475569`. Fuentes: `"Plus Jakarta Sans", "Nunito", system-ui`
(si el navegador no las tiene, cae a system-ui; sin fetch de fuentes remotas
que pueda romper el PNG).

## Copy final (verificado: cero emojis, cero rayas largas, voz MX)

**Tarjeta (1080x1080)**
- Marca: `FinEMPODER` + tagline `Finanzas para todos`.
- Título: `{tituloBase} · {tier}` (p. ej. `Lecciones completadas · Bronce`).
- Frase de Finni: la misma fuente del modal (`FRASES_POR_SERIE[serieId]`).
- Dato real: `{pct}% del módulo` (presupuesto/ahorro/inversion) ·
  `{totalCompleted} lecciones` · `Racha de {streakBest} días` · `3 módulos completos`.
- Pie: `Hecho con FinEMPODER · finanzas para todos`.

**Mensaje wa.me / copiar** (verbatim):
> Acabo de completar el logro {titulo} en FinEMPODER. Es una app gratis de finanzas personales para México, ¿la pruebas?

**Modal newsletter** (verbatim):
- Título: `¿Un tip financiero cada semana?`
- Subtítulo: `Cada semana, un consejo práctico para tu dinero, directo en tu correo.`
- Consentimiento (exacto): `Sí, quiero recibir tips semanales gratis. Sin spam, puedes darte de baja cuando quieras.`
- Botones: `Suscribirme` (disabled hasta email válido + consentimiento) y `Ahora no`.
- Confirmación: `¡Listo! Cuando arranquemos el newsletter, tus tips llegarán aquí.`

Decisión de copy del newsletter: la confirmación **describe el estado real**
(no hay backend aún) para no prometer algo falso; cuando el newsletter
arranque, el backend enviará a los emails guardados.

## Dexie v7 (aditiva, no rompe datos)

`finempoderDb.ts` mantiene todas las tablas v6 con la misma definición y suma:

```
newsletterSubscriptions: '++id, email, source, createdAt, synced'
```

Registro: `{ email, source: 'app', createdAt: ISO, synced: false }` vía
`newsletter.repository.ts` (`subscribe()`, `getAll()` para un futuro sync).
Sin envío a ningún servicio.

## Flujo de share

1. La tarjeta vive en `position:fixed; left:-9999` (invisible, sin parpadeo) y
   la captura (`captureCardPng` en `lib/shareAchievement.ts`) usa la opción
   `style` de html-to-image: el override se aplica AL CLON que serializa
   (`position:fixed; left:0; top:0; right:auto; bottom:auto`). El detalle
   crítico (F3-01): el clon hereda el `inset` COMPUTADO del nodo real
   (`right:10199px/bottom:-360px` por el `left:-9999` + viewport) y en el SVG
   rasterizado eso re-posiciona el clon fuera del canvas → PNG transparente;
   por eso el override fija `right/bottom` a `auto` además de `left/top` a 0.
2. El botón/acción `Compartir logro` SIEMPRE se renderiza, haya o no
   `navigator.share` (F3-02). Con share nativo disponible (share + canShare)
   el popover muestra el botón primario `Compartir` (try/catch; si falla, las
   opciones quedan visibles). En cualquier otro caso las opciones están
   visibles de inmediato:
   - `Descargar imagen`: captura el PNG y dispara `a[download]` con blob URL
     (nombre `finempoder-logro-<serie>.png`, MIME `image/png`); reusa el blob
     si ya se generó.
   - `Enviar por WhatsApp`: `https://wa.me/?text=...` con `encodeURIComponent`.
   - `Copiar mensaje`: `navigator.clipboard.writeText` con try/catch silencioso.
   En desktop nunca se queda sin camino al PNG: la descarga directa siempre
   existe.

Integrado en `AchievementModal` (botón `Compartir logro`, modal no se cierra)
y en cada serie desbloqueada de `Logros` (icono `Share2` discreto).

## Newsletter: trigger

- `sumaTiersExplorados()` = suma de tiers en `fe_badges_state` (vistos).
- Al llegar a **3+** y sin `fe_newsletter_asked` → prompt (UNA sola vez).
- `Ahora no` o `Suscribirme` marcan `fe_newsletter_asked` → nunca reaparece.
- `NewsletterPrompt` está montado en `App.tsx` (como `AchievementModal`) y
  reacciona al evento `fe:badges-state-updated` que emite `writeSeenBadge`.

## Cómo probar

- `cd frontend && npm test` (251 tests: 215 base + 36 nuevos).
- `npm run type-check`, `npm run lint`, `npm run build` verdes.
- `npx playwright test` (8 e2e: smoke + F3). El spec `e2e/share-achievement`
  valida en Chromium real: (a) el PNG descargado es 1080x1080 con alpha > 0 y
  contenido no uniforme (analizado con sharp sobre el blob real), (b) el clon
  con `CAPTURE_CLONE_STYLE` queda 1080x1080 en left:0 mientras el original
  sigue en left:-9999, y (c) sin `navigator.share` el popover ofrece
  Descargar/WhatsApp/Copiar de inmediato.
- Manual en https://qa.finempoder.com.mx: completar 3 logros → aparece el
  newsletter; compartir desde el modal de logro y desde Logros; en móvil
  probar share nativo; en escritorio probar descarga + WhatsApp + Copiar.
