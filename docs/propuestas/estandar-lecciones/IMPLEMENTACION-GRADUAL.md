# Implementación gradual de lecciones

## Primera entrega: Presupuesto L02

La ruta real `/app/presupuesto/lesson/L02` utiliza la nueva clasificación de ingresos. El piloto `/piloto.html` continúa como referencia de las otras mecánicas. Esta entrega es local; no implica despliegue.

- Introducción breve, nueve situaciones contextualizadas y dos destinos: fijo y variable.
- Arrastre con ratón o selección mediante botones accesibles por toque y teclado.
- Finni usa `onb1.png`, aparece al comprobar y ofrece ayuda a petición. Su consejo puede cerrarse. Se omite el saludo antiguo solamente en esta lección para evitar dos representaciones simultáneas.
- Una respuesta incorrecta permite corregir antes de avanzar. La puntuación conserva el primer intento de cada situación.
- Resumen y acción explícita para guardar y terminar. ModuleKit sigue siendo responsable de completar, otorgar la recompensa y desbloquear L03.
- El guardado precede a cada cambio de estado. Una escritura fallida conserva la pantalla y permite reintentar; una carga fallida ofrece recuperación.

## Persistencia y compatibilidad

El borrador completo se guarda en `userLessonData`, clave `l2_classification:v1`, con el usuario actual o `local`. Incluye inicio, índice, selección, comprobación, primeras respuestas y finalización. `l2_incomes` conserva su función de resultado final, con las clasificaciones corregidas y la puntuación de primeros intentos.

Se conservan el ID de lección, la ruta y las reglas de acceso. Los registros de finalización existentes no se borran. El antiguo marcador de paso no contenía las respuestas necesarias para reconstruir la nueva actividad: un intento antiguo sin finalizar comienza la nueva práctica desde su introducción. No se modifica el reanudado de otras lecciones.

Los ejemplos ahora explicitan los acuerdos que permiten clasificarlos. La beca se presenta como un ejemplo condicionado al semestre. El antiguo crédito Fonacot se sustituye por un apoyo familiar ocasional para que la actividad no presente un préstamo como ingreso ganado.

## Orden de las siguientes entregas

| Entrega | Alcance | Qué debe demostrar |
| --- | --- | --- |
| 1 — implementada | Presupuesto L02: clasificación | Pistas, corrección, persistencia y finalización integrada |
| 2 — implementada | Presupuesto L05: laboratorio 50-30-20 | Reparto manipulable, consecuencias visibles y guardado de la decisión |
| 3 — implementada | Presupuesto L07: decisiones ante crisis | Elecciones con consecuencias y explicación contextual de Finni |
| 4 — implementada | Presupuesto L03: observación de gastos hormiga | Selección, impacto acumulado, privacidad y cierre explícito |
| 5 — en curso | Extender las familias validadas | Reutilización por mecánica, conservando el objetivo y contenido de cada lección |

No migrar por el nombre del catálogo: algunos títulos y tipos no coinciden con la actividad real. El podcast se conserva como una ampliación posible; antes de activarlo hay que resolver audio disponible, transcripción, controles y reanudado.

Cada entrega debe preservar acceso como invitado, aislamiento del usuario, progreso y recompensa. Validar en celular y escritorio, probar recarga y fallos de guardado, y comprobar que el desbloqueo ocurre después de persistir el resultado.

## Verificación

Las pruebas de L02 usan IndexedDB simulado y el LessonShell real. Cubren corrección y recarga, preservación del primer intento, fallo de guardado final y recuperación, desbloqueo de L03, ausencia de duplicados y bloqueo sin L01. Se ejecutan junto con las pruebas del shell y del asistente Finni.

Capturas de integración en `.impeccable/review/l02/`. El sistema visual de esta entrega se documenta por separado para no convertir las otras lecciones en migradas por declaración.

Resultado de esta entrega: 9 pruebas aprobadas, comprobación de tipos, compilación de producción y guardas de módulos aprobadas. La revisión visual confirmó resueltos los dos ajustes solicitados: solapamiento móvil y eliminación del rótulo redundante sobre la tarjeta.


## Segunda entrega: Presupuesto L05

La ruta real `/app/presupuesto/lesson/L05` implementa el laboratorio. Tres controles independientes permiten comparar el reparto con la referencia 50-30-20 y ver cuánto dinero queda sin asignar o falta. Finni aparece al cruzar hacia un reparto incompleto o excedido, y puede consultarse o cerrarse manualmente.

El cierre requiere ingreso válido, interacción y total exactamente 100%. Guardar borrador permite conservar un reparto todavía incompleto. Guardar y revisar persiste antes de mostrar el resumen; Guardar y terminar escribe `l5_distribution` antes de solicitar la finalización a ModuleKit. Se conservan sus campos `income`, `necesidades`, `deseos`, `ahorro`, `score`, consumidos por L12.

El nuevo borrador versionado es `l5_lab:v1`. Se guarda explícitamente; mover un control muestra «Cambios sin guardar». Al recargar se recupera el último guardado, no las ediciones posteriores. Los intentos antiguos sin este borrador comienzan en la introducción; sus resultados finales y progreso no se borran.

La puntuación cambia deliberadamente: terminar un reparto equilibrado vale 100, sin penalizar apartarse de 50-30-20. La evaluación reconoce haber construido y revisado el reparto, no pretende medir conocimiento mediante la similitud con una proporción orientativa.

Validación: 11 pruebas aprobadas entre L02, L05 y LessonShell; tipos y compilación aprobados. L05 cubre monto inválido, reparto incompleto, recarga de borrador, fallo y recuperación de guardado final, compatibilidad con L12, error de carga y bloqueo previo. Navegador: controles por teclado, pista ante exceso, revisión y recarga comprobados. Capturas en `.impeccable/review/l05/`. Sin despliegue.

## Tercera entrega: Presupuesto L07

La ruta real `/app/presupuesto/lesson/L07` implementa tres escenarios ficticios de decisión. Cada caso hace visible el saldo, permite elegir una alternativa y separa dos momentos: ver su consecuencia y confirmarla. Antes de avanzar se puede reconsiderar. La explicación muestra liquidez, intercambio y un principio aplicable; Finni aparece al revelar la consecuencia.

El lenguaje evita presentar una decisión personal como universalmente correcta. La puntuación se identifica como orientativa y compara protección de necesidades, liquidez y deuda solamente dentro de los ejemplos. El resumen recupera las tres decisiones y cierra con un método transferible para imprevistos.

El borrador versionado `l7_decisions:v1` conserva escenario, selección revelada, decisiones confirmadas y finalización. Cada transición se persiste antes de cambiar la pantalla. Al cierre se escribe `l7_decisions` con las decisiones y puntuación, y después ModuleKit completa la lección y desbloquea L08. Un fallo deja el estado en pantalla y permite reintentar sin duplicar progreso.

Validación: 14 pruebas aprobadas entre L02, L05, L07 y LessonShell; tipos, guardas y compilación aprobados. L07 cubre consecuencia, reconsideración, recarga, resumen previo a finalización, fallo y recuperación de guardado, resultado final, error de carga y bloqueo del invitado. Navegador: selección, consecuencia y Finni comprobados en móvil y escritorio. Capturas en `.impeccable/review/l07/`. Sin despliegue.

## Kit compartido y cuarta entrega: Presupuesto L03

`ActivityFrame` reúne el encabezado de actividad, descripción, paso, progreso accesible, foco al cambiar de etapa, aparición contextual de Finni, error, estado de guardado y pie de acciones. `ActivityLoading` y `ActivityLoadError` normalizan la recuperación y el reintento. L02, L05 y L07 ya usan este armazón; el contenido, las reglas y la persistencia continúan dentro de cada mecánica.

L03 sustituye la búsqueda obligatoria de diez respuestas conocidas y la captura forzosa de tres gastos personales. La práctica permite elegir al menos tres ejemplos ficticios, muestra su impacto semanal, mensual y anual, y aclara los supuestos del cálculo. La revisión separa observar de decidir y exige «Guardar y terminar» antes de completar la lección. El resultado conserva la clave histórica `l3_gastos_hormiga`; el borrador recuperable usa `l3_gastos_hormiga:v1`.

Validación actual: 19 pruebas aprobadas, comprobación de tipos, compilación de producción y detector visual sin hallazgos. L03 cubre la regla mínima, el cálculo, la escritura del resultado antes de completar, el desbloqueo de L04 y la recuperación de una carga fallida. La ruta real se verificó como invitado en ancho móvil, incluida la selección de tres ejemplos, la actualización del cálculo y la habilitación de las acciones. Sin despliegue.

## Fase 1 · Lote inicial: Presupuesto L01–L03

L01 usa ahora un recorrido de tres etapas: observar una semana ficticia, clasificar cinco movimientos como planeados o no planeados y revisar una regla aplicable. Se retiró la estadística sin una fuente verificable dentro de la interfaz y se evitó tratar un gusto como error por sí mismo. Finni explica el criterio cuando hace falta y el cierre requiere persistencia explícita.

El borrador `l1_spending_awareness:v1` conserva expectativa, etapa y clasificaciones. El resultado `l1_spending_awareness` se escribe antes de que ModuleKit complete la lección y desbloquee L02. La implementación incluye recuperación de carga, fallo de escritura sin pérdida visible, foco por etapa, botones de selección accesibles y una línea de tiempo adaptada a móvil.

Validación del lote: 21 pruebas aprobadas, tipos y compilación de producción correctos, detector visual sin hallazgos y revisión de la ruta real como invitado. El plan completo de las 45 lecciones está en `PLAN-POR-FASES.md`.

## Fase 1 · Herramientas: Presupuesto L04

L04 convierte el antiguo avance temporizado en un tutorial controlado por la persona. Primero se elige un método, luego se registran cinco movimientos ficticios con categoría y forma de pago, y finalmente se revisa el día completo. Una categoría incorrecta mantiene el movimiento actual, explica la corrección en el formulario y hace emerger a Finni; no avanza hasta corregirse.

Cada movimiento correcto se persiste antes de mostrar el siguiente. `l4_registration:v1` conserva método, índice y registros; al cierre se escriben `l4_method` y `l4_records` antes de completar y desbloquear L05. La vista incorpora carga, reintento, fallo de escritura, progreso accesible, controles táctiles y adaptación móvil.

Validación: 25 pruebas acumuladas del estándar, tipos y compilación de producción correctos, detector visual sin hallazgos y recorrido inicial inspeccionado como invitado. Sin despliegue.

## Fase 1 · Herramientas: Presupuesto L06

L06 reemplaza los totales previamente resueltos por una calculadora manipulable con un caso ficticio. Ingresos y gastos actualizan el balance al instante; el resultado distingue superávit, déficit y balance cero mediante texto y color. Finni interpreta el estado y propone una siguiente decisión sin presentar el resultado como diagnóstico personal.

El cálculo exige interacción y cantidades válidas antes de revisar. `l6_balance:v1` guarda el borrador versionado y `l6_balance_result` conserva ingreso, gasto y balance al cerrar. «Guardar y terminar» persiste antes de que ModuleKit complete y desbloquee L07. La vista funciona en una columna móvil, anuncia el resultado dinámico y permite ajustar después de la revisión.

Validación específica: cálculo de superávit y déficit, rechazo de estados inválidos, revisión, persistencia y desbloqueo. Detector visual sin hallazgos y ruta real revisada como invitado.

## Fase 1 · Herramientas: Presupuesto L09

L09 es ahora un constructor SMART con edición, vista previa viva, evaluación explícita de viabilidad y revisión antes del cierre. Puede usarse con una meta propia o con un ejemplo ficticio; se eliminó la suposición de un «ingreso típico» para decidir automáticamente si el aporte era alcanzable.

`l9_smart_goal:v1` conserva el borrador y `l9_smart_goal` mantiene los campos consumidos por L12. La tarjeta añade `feasibility` y `example` para distinguir una meta evaluada de un ejemplo de práctica. El catálogo y `lessonFlow` ahora nombran L09 como meta SMART y L10 como Finanzas en tiempos difíciles, de acuerdo con sus implementaciones reales.

Validación específica: cálculo del aporte, viabilidad obligatoria, ejemplo ficticio, revisión, resultado compatible, persistencia y desbloqueo de L10. Tipos y detector visual aprobados; vista real revisada como invitado.

## Fase 1 · Herramientas: Presupuesto L11

L11 conserva su tutorial de tres pasos y lo integra en `ActivityFrame`: elección de herramientas, método concreto y señal de rutina. Cada paso se guarda antes de avanzar y Finni aparece con una respuesta contextual. La interfaz aclara desde el inicio que elegir una señal no activa recordatorios del dispositivo.

Completar los tres pasos conduce ahora a una revisión; la lección solamente se completa después de «Guardar y terminar». El cierre actualiza `l11_opciones` con `completed: true`, mantiene compatibilidad con los datos anteriores y conserva la rehidratación existente.

Validación específica: tres pruebas de integración aprobadas para entradas inválidas, persistencia por paso, rehidratación y cierre explícito. Tipos, detector visual y vista real como invitado aprobados.

## Fase 1 · Herramientas: Presupuesto L12

L12 conserva el constructor y el contrato `l12_budget` utilizado por L13 y L15. La experiencia separa ahora construcción, revisión y finalización: «Revisar mi presupuesto» no completa la lección; «Guardar y terminar» persiste el resultado y después desbloquea L13. Un fallo conserva todas las cantidades visibles y permite reintentar.

La carga de L05 y L09 cuenta con estado de error y recuperación. El armazón común presenta progreso, privacidad, balance contextual y una sola instancia de Finni. La prueba integrada verifica totales, ausencia de finalización durante la revisión, resultado compatible y desbloqueo posterior al guardado.

Con L12 queda terminado el lote de herramientas de la Fase 1.

## Fase 1 · Conducta y contenido: Presupuesto L08

L08 usa cuatro situaciones ficticias para practicar la diferencia entre gasto planeado, emocional e impulsivo. Finni explica el matiz después de cada elección; la persona puede ajustar su lectura antes de confirmarla. Los detonantes personales son opcionales y la estrategia requiere una revisión explícita antes del cierre.

El borrador `l8_awareness:v1` conserva avance, respuestas, detonantes y estrategia. Solo el cierre escribe el resultado compatible `l8_strategy` y completa la lección. El diseño admite añadir un episodio de audio como capa complementaria cuando exista el recurso, junto con transcripción, controles accesibles y reanudación.

## Fase 1 · Conducta y contenido: Presupuesto L10

L10 presenta tres casos identificados explícitamente como ficticios y sustituye el test largo por tres decisiones consecutivas. Finni aparece después de cada respuesta para explicar el orden de actuación. La persona termina eligiendo un primer paso prudente, lo revisa y confirma antes de completar.

`l10_crisis_response:v1` conserva cada transición y `l10_crisis_plan` guarda el resultado final compatible con futuras actividades. La arquitectura admite sumar audio narrado a los casos cuando exista un episodio aprobado, sin hacer que escuchar sea requisito exclusivo para avanzar.

## Fase 1 · Conducta y contenido: Presupuesto L13

L13 reemplaza el veredicto, el semáforo y las estrellas por cuatro señales neutrales: margen, compromisos fijos, gastos variables y ahorro planeado. Finni explica una señal a la vez y evita inferir que todo gasto variable es entretenimiento. La persona elige una prioridad, la revisa y confirma el cierre.

La lección usa `l12_budget` cuando existe y ofrece un ejemplo marcado como ficticio cuando falta. `l13_feedback:v1` conserva el recorrido y `l13_feedback` guarda la prioridad final junto con el origen real o ficticio del ejercicio.

## Fase 1 · Conducta y contenido: Presupuesto L14

L14 conserva diez conceptos del módulo y presenta una pregunta por pantalla. Cada elección activa una explicación de Finni y puede cambiarse antes de confirmar. El avance `l14_quiz:v1` se guarda pregunta por pregunta; el resultado se revisa antes del cierre explícito y el desbloqueo de L15.

## Fase 1 · Integración: Presupuesto L15

L15 conserva el reto de presupuesto, compromisos y señal semanal, y ahora usa el armazón común con cinco etapas y progreso accesible. Los compromisos se guardan en `l15_compromisos_draft:v1` antes de avanzar y se recuperan al volver. El cierre mantiene `l15_senal_semanal`, `l15_compromisos` y el badge Presupuesto Pro.

## Cierre de la Fase 1

Las 15 suites de Presupuesto se ejecutan juntas: 31 pruebas aprobadas. Los guards de navegación, acceso al repositorio de progreso, integridad de `lessonFlow` y checklist del módulo también pasan. El checklist se actualizó para validar la ruta dinámica `/app/:moduleId/lesson/:lessonId` junto con los 15 identificadores de la fuente canónica.

## Fase 2 · Base y comparación: Ahorro L01–L04

L01 compara el orden de las decisiones con un caso ficticio, permite explorar una aportación semanal y presenta una proyección identificada como suma simple, sin prometer rendimientos. Dos preguntas enfocadas activan la explicación emergente de Finni y pueden corregirse antes de confirmar.

L02 reemplaza la comparación rígida entre “cochinito” y banco por cuatro criterios: acceso, protección, costo y registro, y dependencia de terceros. Tres casos se resuelven de uno en uno, permiten reconsiderar la elección después del consejo de Finni y desembocan en una regla personal revisable. Se retiraron nombres de productos, montos variables y afirmaciones absolutas; la interfaz remite a verificar condiciones vigentes en fuentes oficiales antes de contratar.

L03 convierte la explicación lineal en un simulador de rendimiento con supuestos ajustables. La estimación identifica su modelo y sus límites, separa rendimiento de promesa y termina con una verificación concreta antes de elegir una opción de ahorro.

L04 reduce diez tarjetas simultáneas a cuatro señales presentadas de una en una. El cierre conecta una fricción reconocida con un aliado que la persona puede probar durante una semana, revisar y cambiar sin lenguaje de culpa.

## Fase 2 · Meta y planificación: Ahorro L05–L07

L05 sustituye precios sugeridos y estadísticas sin fuente por una meta definida por la persona. Puede recuperar una meta previa de Presupuesto, calcula un plazo simple a partir del monto y la aportación, y permite ajustar antes de guardar.

L06 elimina el calendario de hasta 26 campos. La persona elige un ciclo de uno, tres o seis meses, define una aportación mensual y anticipa qué hará cuando un periodo no permita cumplirla.

L07 usa tres ingresos recientes como referencia, deja que la persona explore su propio porcentaje y ofrece tres estrategias flexibles. La interfaz aclara que la muestra no predice ingresos futuros ni convierte un porcentaje en recomendación universal.

## Fase 2 · Protección y contingencias: Ahorro L08–L10

L08 construye una referencia personal para el fondo de emergencias a partir de gastos esenciales, meses de cobertura elegidos y una aportación posible. Se retiró la división prescriptiva entre meta “mínima” e “ideal”, así como recomendaciones automáticas de productos.

L09 diferencia liquidez y cobertura mediante tres casos condicionados por la vigencia y el contrato. El cierre pide revisar cobertura, costos o canal de atención, evitando presentar al seguro como respuesta garantizada.

L10 enseña una ruta estable de verificación: institución, producto y límite vigente. La equivalencia en pesos se retiró del contenido estático y se dirige a los canales oficiales del IPAB para consultar información actual.

## Fase 2 · Constancia, proyección y seguimiento: Ahorro L11–L13

L11 conserva el reto de tres días y su regla de un registro por fecha local. La nueva vista hace visibles los días registrados, bloquea un segundo registro durante la misma fecha y mantiene la migración de datos antiguos: los retos ya completados siguen completos y los avances parciales conservan sus fechas estimadas documentadas.

L12 reemplaza tasas asociadas a productos por una tasa anual hipotética ajustable. El simulador separa aportaciones y crecimiento proyectado, muestra los supuestos de capitalización y aclara que comisiones, impuestos, inflación, cambios de tasa y mercado pueden modificar el resultado. La comprensión se verifica antes del guardado final.

L13 elimina semáforos y juicios sobre la conducta. Finni organiza cuatro evidencias neutrales —meta, plan, días y monto registrados— y explica cuándo faltan datos. La persona identifica una dificultad, propone un ajuste pequeño, revisa su respuesta y conserva el contrato histórico `l13_dificultad`.

Validación del lote: 17 pruebas de Ahorro en 13 archivos ejecutadas en un trabajador para aislar IndexedDB, verificación de tipos, guards y detector visual aprobados.

## Fase 2 · Evaluación e integración: Ahorro L14–L15

L14 sustituye diez preguntas simultáneas por cinco decisiones breves, una por pantalla. Se retiraron la equivalencia estática del IPAB, la recomendación universal de meses, el porcentaje prescriptivo y la afirmación estadística sin fuente. Cada respuesta activa contexto de Finni, se persiste antes de avanzar y el resultado solo se guarda al cierre.

L15 integra evidencia reconocida por la persona, semanas practicadas, dificultad, ajuste y siguiente meta. El monto precargado puede corregirse, no se compara contra una expectativa automática y no determina el logro. La revisión explícita precede al guardado de `l15_cierre` y a la finalización del módulo.

Con L15 quedan migradas las 15 lecciones de Ahorro al armazón común.

## Fase 3 · Fundamentos: Inversión L01–L04

L01 introduce inversión mediante una calibración, un escenario ajustable y cuatro variables conectadas. Se retiraron productos, mínimos, tasas presentadas como actuales y comparaciones que convertían supuestos en una ventaja segura. El ejemplo distingue saldo nominal de poder de compra y declara sus límites antes de guardar una definición prudente.

L02 compara ahorro e inversión mediante disponibilidad, incertidumbre, propósito y condiciones, sin imponer una frontera universal por plazo. L03 reemplaza el control que inventaba una tasa a partir del riesgo por un laboratorio de cinco variables y señales de verificación. L04 transforma el cálculo de “capital disponible” en una fotografía personal: separa gastos, obligaciones y reserva, prueba una posible caída y evita declarar que la persona ya puede invertir.

Las cuatro lecciones usan etapas explícitas, borrador versionado, recuperación de carga, consejo contextual de Finni, revisión y guardado final. Las pruebas secuenciales de L02–L04, el control de tipos, el detector visual y la compilación de producción están aprobados.

### Inversión L05–L07

L05 organiza deuda, participación, fondos colectivos y activos reales listados como familias que deben compararse con los mismos criterios. L06 enseña a leer una ficha de deuda y usa una simulación hipotética editable, separada de cualquier oferta comercial. L07 compara administración colectiva y selección directa mediante estrategia, activos, concentración, costos, liquidez y registro vigente.

Se retiraron mínimos de entrada, tasas vigentes, marcas de plataformas, sellos regulatorios presentados sin verificación y llamados a contratar. Las tres lecciones conservan borrador versionado, recuperación de errores, Finni contextual, revisión y guardado final. Sus pruebas funcionales, tipos, detector visual y compilación de producción están aprobados.

### Inversión L08–L10

L08 convierte el antiguo perfil automático en un mapa revisable de capacidad, disposición, plazo y experiencia. L09 enseña concentración por emisor, sector, activo, región y moneda sin calcular rendimientos ni aplicar porcentajes por edad. L10 establece el protocolo “pausa, verifica y documenta” ante ofertas y remite a registros y canales oficiales vigentes, sin incrustar teléfonos o umbrales que caducan.

Las tres vistas usan `InvestmentPracticeLesson`, un patrón configurable que mantiene la misma jerarquía, interacción, Finni contextual, persistencia, recuperación y cierre. Sus tres recorridos funcionales, tipos, detector visual y compilación de producción están aprobados.

### Inversión L11–L13

L11 transforma el cálculo fiscal rígido en una lectura de administración, operación, custodia, diferenciales y tratamiento fiscal aplicable. L12 distingue valor nominal, inflación y poder adquisitivo, y aclara que la resta de tasas es solo una aproximación. L13 reemplaza productos y proyecciones asignados por perfil con un borrador de objetivo, aportes, plazo, liquidez, incertidumbre y evidencia pendiente.

Las tres lecciones reutilizan `InvestmentPracticeLesson`. Se retiraron retenciones universales, históricos incrustados, tasas proyectadas y recomendaciones automáticas. Las pruebas de integración del patrón, los tres puntos de entrada, tipos, detector visual y compilación de producción están aprobados.

### Inversión L14–L15 · cierre del módulo

L14 cambia el semáforo que autorizaba a invertir por una auditoría de estabilidad, meta, comprensión, evidencia y reglas de decisión. L15 reemplaza la competencia por superar rendimientos simulados con un reto de proceso: pausar, verificar, comparar, decidir y revisar. El resultado final continúa en `l15_resultado`; el reconocimiento se deriva de la finalización real de la lección.

Con este lote, las quince lecciones de Inversión usan el estándar. La suite secuencial completa registra 15 pruebas aprobadas en 10 archivos, junto con tipos, guardas de navegación y progreso, detector visual y compilación de producción.

## Validación integral de los tres módulos

La ejecución completa aprobó 95 archivos y 440 pruebas. También pasaron lint, TypeScript, las guardas compartidas, las listas estáticas de Presupuesto, Ahorro e Inversión, la compilación de producción y `git diff --check`.

La integración detectó y corrigió dos problemas en la infraestructura: las pruebas visuales del piloto ahora declaran `jsdom`, y Vitest ejecuta los archivos en serie porque las lecciones comparten una IndexedDB simulada. Las listas de Ahorro e Inversión también verifican las rutas dinámicas contra su `lessonFlow` canónico.

`savings_l1:first:v1` conserva el recorrido y `l1_savings_first` guarda monto, respuestas y tipo de proyección. La lección solo se completa después de revisar y guardar el resultado.
