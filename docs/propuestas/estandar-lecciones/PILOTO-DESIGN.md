---
name: FinEmpoder · Piloto de lecciones
description: Registro del alcance visual implementado para tres prácticas aisladas.
---

## Overview

Este documento describe exclusivamente el piloto aprobado en [PROPUESTA.md](PROPUESTA.md). No sustituye el sistema visual global ni establece que las 45 lecciones estén migradas. La entrada es `frontend/piloto.html`, con configuración independiente en `frontend/vite.pilot.config.ts` y componentes en `frontend/src/prototypes/lessons/`.

La actividad ocupa el centro: clasificar un ingreso, ajustar un presupuesto o explorar una decisión. Finni aporta pistas y explicaciones contextuales mediante la mascota existente `frontend/src/assets/onb1.png`. Todos los importes son ejemplos identificados como práctica. La ampliación aprobada añade el acompañante emergente y una página 404 compartida; esta última también sustituye el fallback del enrutador principal.

## Colors

La fuente de identidad es `frontend/src/styles/tokens.css`, importada directamente por la entrada del piloto. Se reutilizan `--color-brand-primary`, `--color-text-primary` y `--color-text-secondary` mediante alias locales. `pilot.css` define las superficies particulares: fondo claro, objetos de práctica ámbar, selección azul, resultado del presupuesto azul profundo y estados de revisión/éxito con texto e iconos. El color por sí solo no comunica el resultado.

## Typography

El piloto hereda `--font-sans` del sistema existente. Los títulos tienen peso alto y medida contenida; cantidades y resultados emplean numerales tabulares cuando corresponde. El tamaño base es 16 px, con textos auxiliares menores y títulos adaptados al ancho. No se introduce una nueva familia tipográfica.

## Layout

En escritorio, un marco común contiene navegación entre tres actividades, nombre de lección, ayuda desplegable, progreso, zona de trabajo y acción principal. La composición utiliza dos columnas para ubicar el resultado o apoyo junto a los controles.

Por debajo de 700 px, las actividades pasan a una columna, la navegación se compacta y la acción principal permanece sticky al pie, conservando su lugar en el flujo. El simulador añade un resumen sticky del ahorro cerca de sus controles. A 1000 px se ajustan espacios y medidas de apoyo. Las capturas entregadas documentan 390 y 1280 px; no equivalen a una certificación de todos los anchos, zoom o teclado móvil.

## Elevation & Depth

Predominan superficies planas y divisiones finas. El ingreso activo usa una segunda pieza ámbar inclinada para sugerir una pila. Los cambios de progreso se animan mediante escala horizontal; la hoja local contempla reducción de movimiento.

## Shapes

Marcos y paneles usan esquinas moderadamente redondeadas. Los destinos de clasificación se reconocen por contorno discontinuo y selección explícita. Iconos de Lucide mantienen un lenguaje coherente; los indicadores circulares distinguen paso y finalización.

## Components

- **Clasifica:** seis ingresos, arrastre o botones equivalentes, comprobación, pista para corregir, listado revisado y cierre.
- **Experimenta:** necesidades y gustos ajustables mediante sliders o campos numéricos; resultado textual y gráfico, comparación con reparto inicial, déficit visible, reto de ahorro y pregunta de interpretación antes de completar. Los campos normalizan al salir o pulsar Enter, sincronizando también el valor visible cuando el límite normalizado no cambia.
- **Decide:** tres situaciones con opciones plausibles, consecuencia explicada, exploración de otra opción y resumen final de decisiones.
- **Finni emergente:** `FinniAssistant` sustituye los bloques de consejo fijos del piloto. Un botón con la mascota permite pedir una pista; eventos de comprobación, déficit, meta, respuesta de interpretación, consecuencia y finalización pueden abrir el consejo automáticamente. El aviso admite cierre con botón o Escape, devuelve el foco al lanzador y permanece cerrado hasta otro evento. Tiene anuncio de estado y animación de entrada con alternativa de movimiento reducido. Se sitúa sticky sobre la acción principal y adapta las dimensiones del globo y la mascota en móvil.
- **Página 404:** `NotFound` reutiliza la misma mascota y tipografía, un mensaje breve de recuperación y acciones para volver al inicio o regresar a la página anterior. Presenta ilustración y texto en dos columnas en escritorio y una columna en móvil. El componente acepta destino y etiqueta de regreso: `/app` en la aplicación y `/piloto.html` en la demostración. El piloto expone `?preview=404` y un fallback de desarrollo para probar rutas desconocidas.
- **Marco compartido:** ayuda, foco visible, progreso de actividad, navegación libre, repetición y reinicio. Existen estados iniciales, selección, revisión, finalización, reanudación, guardado y fallo de guardado.

El snapshot versionado utiliza exclusivamente `finempoder:lesson-pilot:v1` en localStorage. El código contempla almacenamiento indisponible y recuperación inválida. Este artefacto no integra autenticación, base de datos, progreso curricular ni recompensas XP; el modo invitado y los datos reales quedan fuera del circuito del piloto.

## Do's and Don'ts

Mantener la identidad existente y las alternativas accesibles a los gestos. Conservar la separación entre ejemplo y datos personales. No interpretar el piloto como un despliegue curricular ni como validación de aprendizaje con usuarios.

**Revisión independiente:** se inspeccionaron código y seis capturas iniciales en [piloto-capturas](piloto-capturas/). Se detectó una discrepancia entre el campo numérico y su valor normalizado; quedó resuelta por sincronización explícita en blur, con una prueba de regresión para ambos límites y evidencia en [desktop-normalizacion.png](piloto-capturas/desktop-normalizacion.png). El revisor confirmó la corrección mediante código y captura; la ejecución de pruebas y comprobación por árbol de accesibilidad fueron reportadas por el implementador.

Las capturas móviles de página completa pueden mostrar el footer sticky superpuesto en la altura del viewport original: ese artefacto no demuestra inaccesibilidad al desplazarse. El implementador verificó selección y consecuencia en móvil. Esta revisión no ejecutó navegador, lector de pantalla ni una sesión con usuarios, y no certifica todos los estados visuales, navegación por teclado o integración de producción. Disposición tras la corrección: apto para entregar como piloto aislado dentro de este alcance.

**Revisión de la ampliación Finni/404:** se inspeccionaron exclusivamente los componentes nuevos, sus conexiones al piloto y al fallback, y las cuatro capturas [Finni móvil](piloto-capturas/finni-mobile.png), [Finni escritorio](piloto-capturas/finni-desktop.png), [404 móvil](piloto-capturas/404-mobile.png) y [404 escritorio](piloto-capturas/404-desktop.png). La mascota real, consejo contextual y recuperación de la página inexistente están presentes y legibles en la muestra. No se identificaron defectos materiales dentro de este alcance; disposición: ship. El implementador reportó siete pruebas, TypeScript y build satisfactorios, además de pista automática en móvil, ruta desconocida real y regreso al piloto verificados en navegador. El revisor no repitió esas ejecuciones ni auditó otras lecciones. Esta evidencia no valida configuración de fallback HTTP de un alojamiento de producción, lectores de pantalla o todas las combinaciones de mensajes y desplazamiento.
