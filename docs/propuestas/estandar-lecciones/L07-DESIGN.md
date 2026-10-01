---
name: Finempoder · Presupuesto L07
description: Superficie implementada para practicar decisiones ante imprevistos.
colors:
  primary: "#1b4fd8"
  decision-surface: "#fff3ce"
  decision-text: "#654b22"
  success: "#047857"
  text-primary: "#0f172a"
  text-secondary: "#475569"
  border: "#e2e8f0"
rounded:
  scenario: "14px"
  option: "12px"
  action-secondary: "10px"
---

## Overview

Registro de la ruta real `/app/presupuesto/lesson/L07`. La dirección Operate convierte tres imprevistos ficticios en decisiones observables: seleccionar, revelar consecuencia, liquidez e intercambio, y después reconsiderar o confirmar. Conserva el azul, el ámbar y la tipografía de la aplicación conforme a `PRODUCT.md`. Esta entrega local no redefine el diseño global ni declara migradas otras lecciones.

## Colors

El azul identifica avance, selección e iconos operativos. El ámbar contiene el escenario y su saldo; texto marrón mantiene contraste dentro de esa superficie. Verde aparece en la introducción como apoyo para el método. Los estados no dependen sólo del color: selección, progreso, liquidez, intercambio, guardado y errores tienen texto o semántica accesible.

## Typography

Se hereda `--font-sans` de `frontend/src/styles/tokens.css`: Plus Jakarta Sans, Nunito y alternativas del sistema. Los títulos de escenario usan 25 px en escritorio y 23 px en móvil, con interlínea 1.25. Consecuencia y resumen usan 23 px; saldo y cifras mantienen peso alto y numerales tabulares donde corresponde. No se añade una familia tipográfica.

## Layout

Tras la introducción, cada escenario distribuye caso y opciones en dos columnas de proporción 1.15:0.85, con una segunda franja a todo el ancho para la consecuencia revelada. El resumen vuelve a una columna de hasta 760 px. La barra indica escenarios confirmados y el encabezado nombra el paso actual.

A 700 px o menos, caso, opciones y consecuencia pasan a una sola columna; el detalle de liquidez e intercambio se apila, el balance introductorio envuelve y las filas del resumen dejan de dividirse. Las opciones conservan al menos 72 px de alto. **Regla de continuidad móvil:** Finni y el pie de acciones permanecen en posición relativa dentro del flujo, por lo que la explicación y la acción principal no cubren contenido ni se separan del escenario activo. Esta regla pertenece a L07.

## Elevation & Depth

La actividad usa superficies planas, bordes finos y separadores. El escenario obtiene jerarquía por el fondo ámbar, sin sombra propia. El globo compartido de Finni aporta sombra ligera, punta hacia la mascota y animación de entrada; su hoja contempla reducción de movimiento.

## Shapes

El escenario emplea 14 px de radio, las opciones 12 px y «Reconsiderar» 10 px. Las alternativas son botones de radio visuales con borde, fondo azul tenue al seleccionar y una marca explícita. Finni reutiliza la mascota real `frontend/src/assets/onb1.png` y los iconos compartidos de Lucide.

## Components

- **Secuencia de decisión:** introducción, tres escenarios y resumen. Cada escenario mantiene visible el saldo ficticio, admite una selección y exige «Ver consecuencia» antes de confirmar. La consecuencia separa efecto, liquidez e intercambio. «Reconsiderar» vuelve a las opciones sin confirmar; la confirmación persiste y avanza.
- **Escenarios:** transporte agotado, impresión urgente y boleto de concierto. Sus cantidades y alternativas son ejemplos pedagógicos cerrados. No representan movimientos del usuario, asesoría personalizada ni una respuesta universalmente correcta.
- **Puntuación orientativa:** el resumen calcula el promedio de las tres opciones confirmadas y explica que compara protección de necesidades, liquidez y deuda únicamente dentro de los ejemplos. Sirve para orientar la reflexión; no mide conocimiento ni moraliza la elección.
- **FinniAssistant:** abre un consejo contextual al revelar cada consecuencia y al llegar al resumen. Puede cerrarse con botón o Escape, devuelve el foco al lanzador y anuncia el consejo de forma cortés. L07 omite el saludo anterior para evitar duplicar a la mascota.
- **Persistencia y cierre:** `decisionModel.ts` valida el borrador completo y versionado `l7_decisions:v1`: inicio, índice, selección revelada, decisiones confirmadas y finalización. Cada transición que cambia de pantalla se muestra después de guardar. El cierre escribe primero `l7_decisions`, con decisiones y puntuación, luego guarda el borrador completado; LessonShell/ModuleKit queda habilitado para completar la lección y desbloquear L08. Un fallo conserva el estado visible y permite reintentar sin duplicar el avance.

## Do's and Don'ts

- Conservar la separación entre seleccionar, conocer la consecuencia y confirmar, incluida la salida explícita para reconsiderar.
- Mantener visibles liquidez, intercambio y costo futuro con lenguaje cercano, preciso y no moralizante.
- Reutilizar `DecisionDraft`, el patrón de persistencia, Finni y la composición responsive cuando una actividad requiera decisiones discretas con revisión previa. Adaptar escenarios, criterios y textos; las tres situaciones, sus puntajes y el saldo de $320 pertenecen sólo a L07.
- No presentar la puntuación como diagnóstico financiero, evaluación de conocimiento o recomendación personal.
- No reutilizar este modelo para decisiones continuas, cálculos libres o actividades sin una consecuencia previa a la confirmación; esos casos requieren otro estado y otra interacción.

**Verificación de esta entrega:** el implementador reportó 14 pruebas aprobadas entre L02, L05, L07 y LessonShell, además de tipos, guardas y compilación correctos. La revisión tuvo disposición **SHIP**, sin problemas materiales pendientes en el alcance inspeccionado. Evidencia: [escritorio](../../../.impeccable/review/l07/desktop.png), [móvil](../../../.impeccable/review/l07/mobile.png) y [captura user](../../../.impeccable/review/l07/user.png). Es evidencia local del alcance revisado; no acredita despliegue, investigación con usuarios ni todas las combinaciones de viewport o tecnologías de asistencia.
