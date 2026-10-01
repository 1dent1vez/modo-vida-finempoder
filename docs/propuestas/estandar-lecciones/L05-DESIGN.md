---
name: Finempoder · Presupuesto L05
description: Superficie implementada del laboratorio de reparto 50-30-20.
colors:
  primary: "#1b4fd8"
  balance-surface: "#fff3ce"
  desires: "#d97706"
  savings: "#047857"
  text-primary: "#0f172a"
  text-secondary: "#475569"
rounded:
  balance: "14px"
  input: "10px"
  button-primary: "11px"
---

## Overview

Registro de la ruta real `/app/presupuesto/lesson/L05`. La dirección Operate se expresa mediante controles y consecuencias monetarias inmediatas, conservando el azul, el ámbar y la tipografía de la aplicación conforme a `PRODUCT.md`. El laboratorio permite construir, guardar y revisar un reparto propio. Esta entrega local no sustituye el diseño global ni declara migradas otras lecciones.

## Colors

El azul identifica acciones, foco y necesidades; el panel ámbar reúne el balance. La barra distingue deseos y ahorro con sus colores respectivos, acompañados por porcentajes, montos y un balance textual. **Regla de consecuencia legible:** el exceso o dinero pendiente siempre se explica con texto y cantidades; la barra es apoyo visual y queda fuera del árbol de accesibilidad.

## Typography

Se hereda `--font-sans` de `frontend/src/styles/tokens.css`: Plus Jakarta Sans, Nunito y alternativas del sistema. El encabezado compartido escala entre 24 y 34 px, con peso 800. El título del balance usa 23 px; los montos por categoría, 20 px y numerales tabulares. Ejemplos y referencias usan 13 px. No se añade una familia tipográfica.

## Layout

La actividad conserva un ancho máximo de 1080 px. En escritorio, controles y balance forman dos columnas de proporción 1.4:1, con un mínimo de 240 px para el balance y separación de 40 px. Cada categoría reúne nombre, porcentaje, ejemplo, control y monto frente a su referencia.

A 700 px o menos, ambas columnas pasan a una, separadas por 24 px; comparaciones y botones admiten salto de línea. **Regla de flujo del laboratorio:** Finni y el pie de acciones permanecen en posición relativa, sin desplazamiento inferior, tanto en escritorio como en móvil. Así, ayuda y guardado conservan su espacio y no cubren los controles. Esta adaptación pertenece a L05; no redefine el posicionamiento global del asistente ni la composición de L02.

## Elevation & Depth

El trabajo usa superficies planas y divisiones finas entre categorías. El balance destaca por su fondo. El globo compartido de Finni aporta sombra ligera, punta hacia la mascota y animación de entrada; su hoja contempla reducción de movimiento.

## Shapes

El panel, el campo de ingreso y la acción principal emplean las esquinas descritas en el frontmatter. El foco visible azul tiene 3 px de grosor y 4 px de separación. Los controles de rango nativos ocupan 44 px de alto; las acciones secundarias tienen un mínimo de 44 px y la principal, 50 px. Finni utiliza la mascota real `frontend/src/assets/onb1.png` y los iconos compartidos de Lucide.

## Components

- **Laboratorio:** introducción, edición, revisión y finalización. Parte de un ingreso mensual de ejemplo de $2,500 MXN y del reparto 50-30-20. El ingreso admite importes positivos hasta 10 millones, con máximo dos decimales, y explica el error junto al campo.
- **Reparto independiente:** tres sliders de 0 a 100 para necesidades, deseos y ahorro o deudas. Mover uno no recalcula los otros. Cada categoría muestra su monto y referencia; el balance explica puntos e importe pendientes o excedidos. «Aplicar 50-30-20» permite recuperar la referencia y cuenta como interacción.
- **FinniAssistant:** ayuda a petición y apertura contextual al pasar a un balance incompleto o excedido y al entrar en revisión. Puede cerrarse con botón o Escape, devuelve el foco al lanzador y anuncia el consejo de forma cortés. L05 omite el saludo anterior para evitar duplicar a la mascota.
- **Guardado explícito:** editar muestra «Cambios sin guardar». «Guardar borrador» admite repartos incompletos; recargar recupera el último guardado. «Guardar y revisar» requiere ingreso válido, interacción y exactamente 100%; la revisión permite ajustar o «Guardar y terminar». Las transiciones se muestran después de persistir. Carga y guardado presentan estados y recuperación; un fallo de escritura conserva los cambios en pantalla.
- **Integración:** `budgetLabModel.ts` valida el borrador versionado `l5_lab:v1`. El cierre conserva los campos de `l5_distribution` consumidos por L12. Completar un plan equilibrado vale 100: se abandona la puntuación por distancia respecto a 50-30-20. La finalización del laboratorio habilita al LessonShell/ModuleKit para completar la lección, otorgar recompensa y desbloquear. Persistencia, compatibilidad, invitado y aislamiento por usuario se detallan en [IMPLEMENTACION-GRADUAL.md](IMPLEMENTACION-GRADUAL.md).

## Do's and Don'ts

- Conservar la identificación del ingreso como ejemplo y de 50-30-20 como referencia adaptable.
- Mantener independientes las asignaciones, visibles sus consecuencias y explícito el guardado.
- Reutilizar Finni, el marco y los estilos compartidos; el modelo actual está ligado a estas tres categorías y requiere adaptación para otras taxonomías.
- No trasladar a L05 los destinos de clasificación de [L02](L02-DESIGN.md), ni atribuirle los retos o preguntas del simulador del [piloto](PILOTO-DESIGN.md).
- No interpretar 100 puntos como evaluación de conocimiento ni como recomendación personalizada de reparto.

**Verificación de esta entrega:** el implementador reportó 11 pruebas aprobadas, tipos, build y guardas correctos. La revisión tuvo disposición **ship**, sin correcciones materiales pendientes en el alcance inspeccionado. Evidencia: [escritorio](../../../.impeccable/review/l05/desktop.png), [móvil](../../../.impeccable/review/l05/mobile.png) y [captura user](../../../.impeccable/review/l05/user.png). Es evidencia local del alcance revisado; no acredita despliegue, investigación con usuarios ni todas las combinaciones de viewport o tecnologías de asistencia.
