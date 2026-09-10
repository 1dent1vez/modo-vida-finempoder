# FinEmpoder · Estándar de experiencia para lecciones

Propuesta para revisión · 6 de septiembre de 2026 · No implementada en la aplicación.

## Recomendación

Adoptar **práctica situada con juego moderado**: aprender tomando decisiones cotidianas, observar consecuencias y llevarse una acción o herramienta útil. Mantener la identidad de FinEmpoder y a Finni como acompañante contextual. El foco móvil es una hipótesis de diseño, no una conclusión de analítica de uso.

La unidad de diseño debe ser la **actividad**, no la lección completa. Una lección puede combinar una historia, una clasificación y una reflexión. Estandarizar navegación, ayudas, estados y cierre; dar a cada actividad una composición propia. Así se obtiene coherencia sin repetir cuarenta y cinco veces la misma pantalla.

## Qué revisé y qué encontré

Inventario de las 45 implementaciones L01–L15 en Presupuesto, Ahorro e Inversión; revisión de sus títulos, estados y mecánicas, y lectura detallada de ejemplos, LessonShell, el contrato de finalización, recuperación de sesión y tokens. Este diagnóstico procede del código: no incluye una prueba visual de la aplicación ejecutándose ni investigación con usuarios.

- **Ya existe una base compartida:** LessonShell resuelve acceso, progreso, persistencia de finalización y cierre. Debe evolucionar, no sustituirse con 45 soluciones independientes.
- **El catálogo no describe fielmente algunas pantallas.** Presupuesto L05 dice “Clasifica tus gastos (Drag & Drop)”, pero implementa la regla 50-30-20 con controles de reparto; L09 se anuncia como infografía y muestra un constructor SMART; L10 se anuncia como SMART y muestra historias de crisis; L12 se anuncia como crisis y muestra el constructor de presupuesto. Reconciliar nombres y tipos antes de crear plantillas por etiqueta.
- **Podcast es hoy, en los ejemplos revisados, contenido de lectura.** Presupuesto L10 pide leer historias; Ahorro L03 presenta una transcripción; Inversión L07 muestra lectura y una pausa interactiva. La búsqueda en los 45 archivos no encontró elementos audio/video ni manejadores de drag/drop. Podcast con reproducción y arrastre real son capacidades propuestas, no verificadas como existentes.
- **Hay variedad pedagógica pero uniformidad de presentación:** paso local, barra porcentual, FECard, FinniMessage y botón para avanzar se repiten. Las listas de preguntas o tarjetas pueden dominar la actividad.
- **Los cuatro tipos técnicos son demasiado amplios para diseñar.** `content`, `quiz`, `simulator`, `challenge` sirven al catálogo, pero agrupan interacciones muy distintas.
- **Reanudar necesita conservar la actividad.** En los ejemplos revisados se guarda el número de paso; `accept()` devuelve ese paso. Volver a una pantalla sin recuperar sus respuestas puede romper la continuidad. Diseñar un snapshot completo y versionado.
- **Completar y aprender deben distinguirse.** Hay condiciones basadas en ver tarjetas o responder todo; eso puede ser válido para explorar, pero no prueba comprensión. Cada plantilla debe declarar qué evidencia pide y cómo ofrece recuperación.

## Estructura común

1. **Entrada breve:** situación, objetivo observable y esfuerzo estimado a partir del contenido real. La introducción puede integrarse en la actividad; no imponer una pantalla adicional a todas las lecciones.
2. **Actividad central:** un verbo claro —clasifica, compara, ajusta, decide, escucha, construye— y una zona de trabajo dominante.
3. **Consecuencia y explicación:** qué cambió, por qué y qué se puede intentar. Finni aparece cuando ayuda a comprender.
4. **Transferencia:** una decisión personal o una pregunta de aplicación cuando tenga sentido. No pedir datos personales en todas las lecciones.
5. **Cierre compartido:** capacidad adquirida, resultado o artefacto, estado real del guardado y siguiente acción.

Marco visual: volver al módulo, nombre corto de la lección, progreso de actividad con etiqueta (“Caso 2 de 3”), ayuda accesible y una acción principal contextual. El progreso del módulo queda en el mapa; no compite con varias barras dentro del ejercicio. En móvil, la acción principal puede fijarse al pie con espacio reservado y respeto al teclado. En escritorio, ampliar la zona de trabajo y situar el resultado a un lado.

## Once familias de actividad

Los mockups adjuntos representan una pantalla principal por familia y un cierre común. Son bocetos estáticos de composición e interacción; los números y casos son ejemplos ficticios, no nuevas reglas curriculares ni datos de una persona.

| ID | Familia | Composición y gesto | Feedback y criterio propuesto |
|---|---|---|---|
| A | Descubrimiento visual | Línea de tiempo, mapa, comparación o tarjetas desplegables. Explorar una relación concreta. | Mostrar qué se descubrió; cerrar con una aplicación breve. No premiar abrir tarjetas sin finalidad. |
| B | Clasificación / Drag & Drop | Pieza activa y destinos visibles; avance por objetos. Arrastrar o seleccionar pieza y tocar destino. | Explicación junto al objeto; deshacer y reintentar. Finalizar cuando se revisen las clasificaciones, según la rúbrica de la actividad. |
| C | Quiz / autodiagnóstico | Una pregunta por vista, selección visible y botón “Comprobar”. | Quiz: explicación y revisión de errores. Perfil: sin correcto/incorrecto, permitir editar y explicar que es orientativo. |
| D | Laboratorio / simulador | Controles junto a una visualización de resultado. Valor inicial y escenario ajustado comparables. | Mostrar diferencia numérica y explicación. Pedir interpretar un cambio, no solo mover un slider. |
| E | Escenario de decisiones | Situación breve, recursos visibles y dos o tres decisiones plausibles. | Consecuencia inmediata, razón y posibilidad de explorar otra ruta; revisar decisiones al cerrar. |
| F | Podcast interactivo | Reproductor real, capítulos, transcripción equivalente y pausas para decidir. | Guardar posición y respuestas; evaluar comprensión. La lectura permite el mismo logro. No bloquear por tiempo escuchado. |
| G | Constructor guiado | Pasos cortos y vista previa viva del presupuesto, meta o plan. | Validación junto al campo, resumen editable y confirmación real del guardado. |
| H | Tutorial práctico | Entorno de ensayo con una tarea localizada y ayudas progresivas. | Comprobar la acción realizada; ejemplo reiniciable. Diferenciar claramente ensayo y datos reales. |
| I | Reto de hábito | Secuencia por días, monto o evidencia y próxima acción. | Progreso basado en registros válidos; conservar reglas de fecha y persistencia existentes. Mensajes neutrales si se interrumpe. |
| J | Revisión con Finni | Un hallazgo prioritario, evidencia disponible y acción sugerida. | Explicar el origen de los datos; permitir elegir ajuste o reflexión. Sin datos: pedirlos o mostrar un ejemplo etiquetado. |
| K | Misión final | Objetivo integrador, lista de entregables y espacio de ejecución. | Revisar contra criterios explícitos, corregir, guardar y cerrar con resultado útil. |

Variantes dentro de las familias: infografía, comparación y flashcards pertenecen a A; calculadora, distribución y curva temporal a D; formulario SMART y presupuesto a G; evaluación de conocimientos y perfil a C, con reglas de feedback distintas. Un formato nuevo solo justifica otra familia si cambia el modelo de interacción, no por su tema.

## Inventario y asignación propuesta

La familia es una recomendación de diseño basada en la actividad implementada; no equivale al `kind` actual. Las combinaciones evitan perder la riqueza de las lecciones existentes.

| Módulo | Lección / contenido actual resumido | Familia principal → complemento |
|---|---|---|
| Presupuesto | L01 · ¿A dónde se fue mi quincena? | A → B |
| Presupuesto | L02 · Ingresos fijos y variables | B → C |
| Presupuesto | L03 · Gasto hormiga | A → D |
| Presupuesto | L04 · Registro de movimientos | H |
| Presupuesto | L05 · Regla 50-30-20 | D → A |
| Presupuesto | L06 · Balance mensual | D |
| Presupuesto | L07 · Ajuste ante crisis | E |
| Presupuesto | L08 · Gasto emocional | B → J |
| Presupuesto | L09 · Meta SMART | G |
| Presupuesto | L10 · Historias de crisis | F → C; lectura actual, audio pendiente |
| Presupuesto | L11 · Herramienta digital | H |
| Presupuesto | L12 · Presupuesto propio | G |
| Presupuesto | L13 · Veredicto de Finni | J |
| Presupuesto | L14 · Evaluación | C |
| Presupuesto | L15 · Presupuesto y compromiso final | K → G |
| Ahorro | L01 · Hábito de ahorrar primero | A → C |
| Ahorro | L02 · Cochinito vs banco | A → B |
| Ahorro | L03 · Dinero en el banco | F → D/C; transcripción actual, audio pendiente |
| Ahorro | L04 · Aliados y saboteadores | B |
| Ahorro | L05 · Meta de ahorro | G |
| Ahorro | L06 · Plan de 1, 3 o 6 meses | G → D |
| Ahorro | L07 · Ingreso impredecible | D → G |
| Ahorro | L08 · Fondo de emergencias | D → B |
| Ahorro | L09 · Ahorro y seguros | A → B/C |
| Ahorro | L10 · Protección del ahorro | A → C |
| Ahorro | L11 · Ahorra en 3 días | I |
| Ahorro | L12 · Interés compuesto | D |
| Ahorro | L13 · Revisión del hábito | J |
| Ahorro | L14 · Evaluación de ahorro | C → J |
| Ahorro | L15 · Cierre del módulo | K → J |
| Inversión | L01 · Qué significa invertir | A → D |
| Inversión | L02 · Ahorro vs inversión | A → B |
| Inversión | L03 · Variables de inversión | A → D/C |
| Inversión | L04 · Capital disponible | D → G |
| Inversión | L05 · Mapa de instrumentos | A → C |
| Inversión | L06 · Instrumentos de deuda | A → D |
| Inversión | L07 · Fondos y bolsa | F → C; lectura actual, audio pendiente |
| Inversión | L08 · Perfil del inversionista | C · variante autodiagnóstico |
| Inversión | L09 · Diversificación | D |
| Inversión | L10 · Detección de fraudes | E |
| Inversión | L11 · Comisiones | D → H |
| Inversión | L12 · Inflación y rendimiento | D |
| Inversión | L13 · Plan personal | G |
| Inversión | L14 · Revisión del plan | J |
| Inversión | L15 · Primera inversión simulada | K → E/D |

## Reglas de diseño para futuros módulos

**Identidad.** Conservar Plus Jakarta Sans/Nunito, azul de marca y acentos por módulo presentes en `tokens.css`. Usar ámbar, verde y azul como identificación del módulo, con texto oscuro en fondos claros. Reservar el significado de éxito/error para icono, texto y color de estado; el verde del módulo Ahorro no convierte cualquier selección en un acierto. Finni necesita menos bloques introductorios y más comentarios ligados a acciones.

**Jerarquía.** Título corto orientado a la tarea, instrucción de una o dos frases, objeto de trabajo dominante, ayuda bajo demanda y acción contextual. Evitar tarjeta dentro de tarjeta sin necesidad. No fijar una misma cantidad de pantallas a todas las lecciones ni agregar pasos para aparentar interacción.

**Feedback.** Distinguir seleccionado, enviado, correcto, revisable y guardado. Nunca usar solo color. Las preferencias y los hábitos no reciben una cruz roja. Los errores conceptuales se explican con el caso; la persona puede corregir sin perder toda la actividad. Animación breve solo para mostrar una relación o una consecuencia; respetar movimiento reducido.

**Accesibilidad y adaptación, como criterios de aceptación.** Objetivos táctiles de al menos 44 × 44 px; texto base de 16 px; controles con nombre, foco visible y teclado; zoom sin pérdida de acciones. Contraste objetivo 4.5:1 para texto normal. Todo arrastre tiene alternativa por selección; todo slider, entrada numérica; todo gráfico, resumen textual; todo audio, transcripción. Verificar a 360, 390, 768 y 1280 px, incluyendo títulos largos y teclado móvil.

**Estado.** Diseñar inicio, respuesta seleccionada, revisión, error, reintento, falta de datos, guardando, guardado, fallo de guardado, reanudación, bloqueo y finalización. El cierre debe diferenciar “terminaste la actividad” de “se guardó el progreso”. Reintentar sin duplicar XP. Una práctica simulada nunca escribe silenciosamente sobre un plan personal.

**Duración.** Proponer actividades de pocos minutos y probarlas con personas; estimar duración después de observar el contenido y el uso. Un reto de varios días debe decirlo claramente. Sin cuentas regresivas ni pérdida de vidas por defecto.

## Contrato de autoría propuesto

Cada lección nueva entrega: objetivo observable, situación y audiencia, familia principal, actividades complementarias, contenido y fuente, esfuerzo estimado, instrucciones, feedback por respuesta, criterio de finalización, artefacto de salida, estados vacíos/de error, alternativas accesibles y esquema de recuperación.

Conservar `kind` para compatibilidad y añadir metadatos de experiencia: `template`, `objective`, `activities`, `completionCriteria`, `resumeVersion` y `output`. Son nombres propuestos, no una API ya existente. Las lecciones siguen usando `completion={{ ready, score }}`; LessonShell mantiene los efectos de finalización. Una capa compartida de actividades manejaría respuestas, revisión y progreso interno; un adaptador de snapshot conservaría paso, respuestas, borradores y posición de audio. La separación entre progreso y datos personales de la lección debe mantenerse.

Componentes a extraer cuando se apruebe el diseño: marco de actividad, progreso etiquetado, zona de feedback, acción de avance, opción seleccionable accesible, comparación de escenarios, campos monetarios, transcripción por capítulos, resumen editable y cierre. Primero estabilizar dos o tres ejemplos; después generalizar. No crear un motor configurable enorme antes del piloto.

## Cómo validar y desplegar el estándar

1. **Reconciliar el inventario:** títulos, contenido y tipos; conservar IDs/rutas para no invalidar progreso. Documentar equivalencias y criterios reales de finalización.
2. **Piloto de tres mecánicas distintas:** Presupuesto L02 (clasificación), L05 (laboratorio) y L07 (decisiones). Comparar con sus versiones actuales usando las mismas tareas.
3. **Producir el formato multimedia:** guion aprobado, archivo reproducible, capítulos, transcripción y checkpoints para L10. Si no hay audio, mantener el nombre “historia interactiva”.
4. **Extender a constructores, tutorial, hábito y revisión:** probar persistencia, dependencias entre lecciones y modo invitado; terminar con las misiones finales.
5. **Publicar el kit de autoría:** ejemplos por familia, estados, criterios accesibles y checklist para aprobar módulos futuros.

Propuesta de validación: sesiones observadas con 5–8 personas del público objetivo para detectar fricción, sin tratar esa muestra como prueba estadística. Medir si entienden qué hacer sin explicación, pueden corregir un error, interpretan la consecuencia y retoman la actividad sin pérdida. En producto, medir inicio → primera acción, abandonos por actividad, uso de pistas, errores recuperados, reanudaciones correctas y una pregunta de transferencia. Comparar contra una línea base; no prometer aumentos de retención sin datos.

El primer piloto pasa cuando la persona puede completar la tarea con teclado o toque, entiende por qué ocurrió el resultado, puede recuperar su borrador y reconoce qué quedó guardado. Pruebas técnicas al implementar: contrato de progreso, desbloqueo, guardado/reintento, modo invitado y ausencia de doble recompensa.

## Mockups para revisar

- [Lámina 1 · Descubrir, clasificar, responder y experimentar](mockups-01.png)
- [Lámina 2 · Decidir, escuchar, construir y practicar](mockups-02.png)
- [Lámina 3 · Sostener, revisar, integrar y cerrar](mockups-03.png)

Cada lámina incluye cuatro vistas móviles y una nota de comportamiento por vista. Se propone conservar esa jerarquía en escritorio con una zona de resultados lateral. La adaptación de escritorio y las transiciones deben prototiparse en el piloto; estas láminas no son una especificación visual final ni una prueba de usabilidad.

## Fuentes locales

- `frontend/src/pages/modules/{presupuesto,ahorro,inversion}/lessonFlow.ts`: catálogo.
- `frontend/src/pages/modules/{presupuesto,ahorro,inversion}/lessons/L01.tsx` a `L15.tsx`: implementaciones.
- `frontend/src/module-kit/components/LessonShell.tsx`: marco, acceso y cierre.
- `frontend/docs/lesson-contract.md`: límites entre contenido y progreso.
- `frontend/src/features/lessons/hooks/useLessonResume.ts`: recuperación.
- `frontend/src/styles/tokens.css`: identidad visual actual.

Decisión recomendada: aprobar la dirección de práctica situada y las familias de actividad; revisar primero las pantallas del piloto antes de migrar las 45 lecciones.
