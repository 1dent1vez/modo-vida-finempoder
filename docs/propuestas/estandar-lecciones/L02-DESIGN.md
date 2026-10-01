---
name: Finempoder · Presupuesto L02
description: Superficie implementada de clasificación de nueve ingresos en la aplicación.
---

## Overview

Registro de la ruta `/app/presupuesto/lesson/L02`, dentro del marco real de lecciones. Conserva la identidad azul y ámbar y la tipografía existente, conforme a `PRODUCT.md`. La actividad presenta un ingreso a la vez, permite comprobar y corregir, y termina con un resumen. Este documento describe la entrega local; no declara desplegadas ni migradas las demás lecciones y no modifica el diseño global.

## Colors

La actividad hereda `--color-text-primary` y `--font-sans`. La hoja `frontend/src/module-kit/activities/classification.css` mantiene azul para acciones, selección y foco; ámbar para la tarjeta de ejemplo y el progreso; fondos blancos y gris claro para separar destinos y contenido. Finni distingue revisión y acierto con texto, además del color. Las opciones seleccionadas incluyen marca y `aria-pressed`.

## Typography

Se conserva la familia de `frontend/src/styles/tokens.css` (Plus Jakarta Sans, Nunito y alternativas del sistema). El encabezado escala entre 24 y 34 px, con peso 800. El título de tarjeta usa 25 px, reducido a 23 px en móvil; el contexto usa 16 px y altura de línea 1.65. El contexto comienza con «Ejemplo:» en el párrafo, sin una etiqueta superior separada.

## Layout

El área de actividad tiene un máximo de 1080 px. En escritorio, tarjeta y destinos comparten una columna; el historial ocupa la segunda, con proporción 1.25:1 y separación de 34 px. Los dos destinos permanecen juntos. El pie de acción es sticky a 70 px del borde inferior; Finni queda por encima, a 152 px.

A 700 px o menos, trabajo e historial pasan a una columna; el historial limita su lista a 140 px con desplazamiento. **Regla de acceso a las opciones:** tanto Finni como el pie pasan a posición relativa, dentro del flujo y sin desplazamiento inferior. Esta corrección evita que la ayuda y la acción cubran los destinos en pantallas pequeñas. La acción principal ocupa el ancho disponible.

## Elevation & Depth

Tarjeta y destinos son planos, separados por superficies y bordes. El globo de Finni utiliza sombra ligera y una punta que lo relaciona con la mascota. El progreso anima su escala horizontal; la aparición de Finni tiene animación. Las hojas contemplan `prefers-reduced-motion`.

## Shapes

La tarjeta usa esquinas de 14 px; los destinos, de 12 px; la acción principal, de 11 px. Un contorno discontinuo identifica los destinos disponibles y pasa a sólido al seleccionar. El foco visible azul tiene 3 px de grosor y 4 px de separación. Los iconos proceden de Lucide y la mascota es el recurso existente `onb1.png`.

## Components

- **ClassificationActivity:** introducción, nueve tarjetas secuenciales, destinos fijo/variable, comprobación, historial y resumen. Admite arrastre con ratón y botones nativos para toque y teclado. Una respuesta incorrecta ofrece pista y corrección; solo una respuesta correcta permite avanzar. El resultado conserva el primer intento de cada tarjeta.
- **FinniAssistant compartido:** ayuda ilustrada a petición y apertura contextual al comprobar o terminar. Admite cierre con botón o Escape y devuelve el foco al lanzador; el consejo se anuncia de forma cortés. L02 omite el saludo anterior para evitar duplicar a Finni. La posición móvil en flujo es una adaptación de clasificación, no un cambio general del asistente.
- **L02 y classificationModel:** los ejemplos y explicaciones pertenecen a la lección; el componente recibe contenido y estado. El modelo valida el borrador versionado. La API actual utiliza específicamente las categorías fijo/variable: reutilizarla para otra taxonomía requiere una adaptación explícita.
- **Persistencia y marco:** cada transición se guarda antes de mostrar el estado siguiente. Carga y guardado tienen estados visibles y reintento. El resumen exige «Guardar y terminar»; solo después de persistir se habilita la finalización del LessonShell/ModuleKit, responsable del progreso, recompensa y desbloqueo. Se conserva el modo invitado y el aislamiento por usuario. Los detalles de compatibilidad están en [IMPLEMENTACION-GRADUAL.md](IMPLEMENTACION-GRADUAL.md).

## Do's and Don'ts

- Conservar el contexto que justifica cada clasificación y la distinción entre ejemplo y datos personales.
- Mantener botones equivalentes al arrastre, pistas corregibles y puntuación del primer intento.
- Reutilizar el asistente y el marco existentes; revisar la posición del acompañante según la mecánica y el ancho.
- No trasladar automáticamente la composición de L02 a simuladores, decisiones o audio; el [piloto](PILOTO-DESIGN.md) documenta otras mecánicas por separado.

**Verificación de esta entrega:** el implementador reportó nueve pruebas satisfactorias, TypeScript y build de producción correctos. La revisión final tuvo disposición **ship** tras resolver la obstrucción móvil y retirar la etiqueta superior, conservando «Ejemplo:» en el contexto. La evidencia está en [capturas de L02](../../../.impeccable/review/l02/), incluidas [opciones móviles](../../../.impeccable/review/l02/mobile-closed-viewport.png) y [pista de corrección móvil](../../../.impeccable/review/l02/mobile-wrong-viewport.png). Es evidencia del alcance revisado, no una validación con usuarios ni de todas las combinaciones de viewport y tecnologías de asistencia.
