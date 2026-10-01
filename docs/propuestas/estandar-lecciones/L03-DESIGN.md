# L03 · Laboratorio de gastos hormiga

## Propósito

La lección enseña a reconocer el efecto acumulado de compras pequeñas y repetidas. La actividad usa ejemplos ficticios y evita exigir información financiera personal para poder completarse.

## Anatomía

L03 usa `ActivityFrame`, el armazón común de las actividades validadas:

1. Título, propósito y etapa actual.
2. Progreso accesible con un mínimo explícito de tres observaciones.
3. Área de trabajo propia de la mecánica.
4. Consecuencia visible en semana, mes aproximado y año aproximado.
5. Consejo contextual de Finni.
6. Estado de guardado y acciones de avance.

La etapa **Observar** permite activar y desactivar tarjetas. La etapa **Decidir** congela la selección, presenta un resumen y permite volver a ajustarla antes del cierre.

## Estados y reglas

- **Carga:** muestra `ActivityLoading` mientras se recupera el borrador.
- **Error de carga:** explica el fallo y ofrece `Reintentar carga`.
- **Observación incompleta:** las acciones permanecen deshabilitadas hasta elegir tres ejemplos.
- **Borrador modificado:** muestra `Cambios sin guardar`.
- **Revisión:** persiste la selección antes de cambiar la pantalla.
- **Finalización:** `Guardar y terminar` escribe primero el resultado compatible y después permite que `LessonShell` complete la lección.
- **Error de escritura:** conserva la selección visible y permite reintentar.

## Persistencia y compatibilidad

El borrador versionado usa `l3_gastos_hormiga:v1` y contiene la etapa y los identificadores seleccionados. El parser descarta versiones desconocidas, identificadores inexistentes, duplicados y revisiones con menos de tres ejemplos.

El resultado final conserva `l3_gastos_hormiga` con `gameGastos`, `personalGastos`, `totalWeekly` y `totalMonthly`. `personalGastos` queda vacío porque la actividad ya no obliga a revelar datos personales.

## Accesibilidad y adaptación

- Las opciones son botones con `aria-pressed` y área táctil amplia.
- El progreso expone mínimo, máximo y valor actuales.
- El cálculo usa `aria-live` para anunciar cambios.
- El encabezado recibe foco al cambiar de etapa.
- En móvil, tarjetas, métricas y acciones usan una sola columna.
- Finni aparece dentro del flujo y conserva su control para abrir o cerrar la pista.

## Reglas de reutilización

Usar `ActivityFrame` para el encabezado, progreso, Finni, errores y pie. Cada mecánica conserva su modelo, contenido, reglas de evaluación y CSS específico. Un nuevo componente compartido se extrae solamente cuando el mismo patrón ya aparece en al menos tres actividades.

Toda lección migrada debe distinguir editar, revisar y terminar; persistir antes de avanzar; recuperar fallos sin perder el trabajo visible; funcionar como invitado local; y mantener las claves de resultado que consumen otras lecciones.
