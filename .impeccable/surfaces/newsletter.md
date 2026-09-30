# Billete Bajo Control — superficie implementada

## Overview

Registro local de `/app/newsletter` y `/app/newsletter/editor`, extraído del código el 2026-09-05. Hereda la identidad de Finempoder; no establece una identidad global ni un comp aprobado. Fuente de producto: `PRODUCT.md`.

Modo **Read** para descubrir el newsletter, consultar el archivo y leer; modo **Operate** para suscripción y trabajo editorial. Oferta confirmada: $49 MXN mensuales, tres ediciones al mes, lectura en la app y entrega por correo. La contratación comienza dentro de la app y requiere cuenta; el piloto es por invitación, sin tarjeta ni conversión automática. La app conserva su uso gratuito e invitado.

## Colors

La fuente normativa sigue siendo `frontend/src/styles/tokens.css`. La superficie reutiliza azul primario (`--color-brand-primary`, #1B4FD8), azul oscuro para selección/hover y fondo informativo para avisos. Fondo de app #F8FAFC, superficie blanca, texto principal #0F172A y secundario #475569. Bordes y divisores usan neutrales existentes. No se introduce una paleta propia del newsletter.

## Typography

Plus Jakarta Sans y fallbacks de la app. Introducción: `clamp(1.9rem, 3.8vw, 2.8rem)`, peso 800, interlínea 1.18 y ancho máximo 18ch. Entradilla: 1.125rem, interlínea 1.75. Precio: 2.5rem con números tabulares. Artículo: ancho máximo 70ch; cuerpo 1.0625rem e interlínea 1.85. Metadatos y ayudas mantienen una jerarquía secundaria legible.

## Layout

Contenedor máximo de 1080px; relleno de escritorio 32px 24px 64px. La introducción y oferta forman dos columnas (`1.2fr 1fr`, separación 56px). El archivo continúa debajo como filas editoriales con divisores, resumen y acción de lectura; no como mosaico de tarjetas.

A 700px o menos, introducción y filas pasan a una columna; el contenedor usa 20px de margen interior horizontal y la separación de introducción baja a 28px. Los filtros se distribuyen en varias líneas. La navegación inferior compartida incorpora Newsletter con icono Mail y estado activo, también en la ruta editorial.

## Elevation & Depth

La superficie local usa contraste de fondos y bordes, sin sombras propias. Conserva la sombra de la navegación inferior compartida. La oferta es el único bloque comercial destacado; el archivo permanece plano.

## Shapes

Radios heredados: 16px para oferta, 12px para acción principal y mensajes, 8px para campos y aviso de disponibilidad. Filtros redondeados a 24px. Acciones de lectura, acceso y filtros tienen altura mínima de 44px.

## Components

- **Cabecera y navegación:** reutiliza `PageHeader`, `Button` y `AppNavbar`; el enlace Editar depende de `membership.isEditor`.
- **Oferta:** distingue invitado, pre lanzamiento, contratación disponible, piloto, suscripción, gracia y renovación cancelada. El invitado va a autenticación; el formulario disponible exige mayoría de edad y aceptación del cobro recurrente. La preferencia de correo es independiente de la cancelación del pago.
- **Archivo:** filtros Todas, Antes de contratar, Fugas de dinero y La letra chiquita, más búsqueda por título, resumen y tema. Selección con `aria-pressed`. El vacío inicial indica que se preparan las primeras ediciones; una búsqueda sin resultados tiene mensaje distinto. No presenta publicaciones ni testimonios inventados.
- **Lectura:** título, resumen, autor, fecha, texto por párrafos y fuentes enlazadas. La muestra y la edición protegida usan solicitudes diferentes; la interfaz retira el artículo al vencer el acceso conocido.
- **Estados:** carga y avisos con `role="status"`, errores con `role="alert"` y reintento; pago pendiente espera confirmación del proveedor. Acciones ocupadas se deshabilitan. Foco visible azul de 3px con separación de 3px.
- **Editor:** encargo para generación asistida, tabla de publicaciones y envíos; formulario de texto plano y fuentes; previsualización de lectura/correo, prueba por correo, aprobación de versión y programación. Incluye gestión de participantes del piloto y tabla de suscriptores. La UI consulta el permiso editorial al servidor; ocultar controles no sustituye la autorización de los endpoints.

## Do's and Don'ts

- Conservar los tokens y componentes de la app, el orden introducción/oferta/archivo y las filas editoriales.
- Mostrar únicamente estados y publicaciones respaldados por datos; mantener visible la distinción entre piloto y pago.
- Mantener autorización editorial, acceso al contenido y confirmación de pago en servidor, según el requisito del producto. Este registro visual no certifica su seguridad.
- No convertir esta composición local en una regla global para otras áreas.
- **Límite de validación:** el dictamen SHIP del revisor cubre únicamente invitado/pre lanzamiento en las capturas `../review/desktop.png` y `../review/mobile.png`. No hay comp aprobado. Editor, lectura con contenido y estados autenticados/de pago están descritos desde el código; no cuentan aquí con QA visual ni validación operativa de cobro o envío.

Fuentes de implementación: `frontend/src/pages/newsletter/Newsletter.tsx`, `NewsletterAdmin.tsx`, `newsletter.css`, `frontend/src/styles/tokens.css` y `frontend/src/components/layout/AppNavbar.tsx`.
