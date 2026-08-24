# GENERALIZACION_CONTENIDO.md

Documento de la misión "Generalización de contenido — FinEmpoder (doble lectura natural)".
La app es 100% gratuita para todo México (estudiantes, trabajadores, cualquier adulto joven):
el contenido que asumía estudiante se generalizó sin perder valor pedagógico ni la voz mexicana.
Regla de oro aplicada: cambia el disfraz del ejemplo, nunca el concepto ni el cálculo que enseña.

## 1. Tabla de cambios por lección

### FASE A — Presupuesto (`content(presupuesto): generaliza casos para todo publico`)

| Módulo | Lección | Cambio (antes → después) |
|---|---|---|
| Presupuesto | L01 | Evento de ingreso "Cobro beca/mesada" → "Cobro de quincena/mesada/beca"; copy intro "misterio más común entre universitarios" → "entre casi todos nosotros"; "68% de los universitarios" → "68% de las personas". |
| Presupuesto | L02 | Item "Venta de apuntes" → "Venta de apuntes o cosas usadas"; +item "Propinas de mesero o repartidor" (con feedback); feedback de tutorías "alumnos" → "alumnos o clientes"; PRONABES/mesada/café escolar/FONACOT conviven con sueldo/propinas/freelance; contador 8→9. |
| Presupuesto | L03 | "tu semana universitaria" → "tu semana". |
| Presupuesto | L04 | Momentos escolares (camión al TecToluca, comedor escolar, cafetería del campus) → jornada mixta de oficina (camión a la oficina, comedor de la oficina, cafetería del trabajo); Mariana "estudiante de 2do semestre" → "trabaja y estudia". |
| Presupuesto | L05 | +opción de ingreso $8,000 en el selector; copy "aunque ganes $1,500 o $5,000" → "o $8,000". |
| Presupuesto | L06 | Roberto: "Estudiante de 3er semestre" → "Un caso real de un usuario"; conserva SUS números (Beca PRONABES $1,800 + Mesada $800). |
| Presupuesto | L07 | "12 días para tu próxima mesada" → "próximo ingreso" (2 lugares); "Examen sorpresa: necesitas imprimir urgente" → "Necesitas imprimir un documento urgente". |
| Presupuesto | L08 | "celebrar una calificación" → "celebrar un logro"; +s6 "Comprar ropa de trabajo para tu nuevo empleo" y +s7 "Comprar comida de oficina para consolarte" (espejo laboral del caso escolar). |
| Presupuesto | L09 | "viaje de graduación" → "un viaje"; "alcanzable para un universitario típico" → "para un ingreso típico". |
| Presupuesto | L10 | Andrés: "No recibió su beca este mes" → "No recibió su sueldo este mes". |
| Presupuesto | L11 | Revisada: ya universal, sin cambios. |
| Presupuesto | L12 | Revisada: sin menciones escolares, sin cambios. |
| Presupuesto | L13 | "nivel de ocio adecuado para un contexto estudiantil" → "para tu contexto". |
| Presupuesto | L14 | Preguntas: "12 días para tu mesada" → "para tu próximo ingreso"; "llegar al TecToluca"/"llegar a clases" → "llegar al trabajo o la escuela". |
| Presupuesto | L15 | Ejemplo de Finni: "el día que llegue mi mesada" → "el día que llegue mi quincena o mesada". |

### FASE B — Ahorro, commit de estilo (`style(ahorro): corrige ortografia y unifica colores a tokens del tema`)

| Módulo | Lección | Cambio (antes → después) |
|---|---|---|
| Ahorro | L01–L15 | Ortografía completa del módulo: tildes sistemáticas en TODO texto (hábito, ¿Cuánto?, más, está, también, según, día, así, después, cuál, óptima, combinación, ¿Para qué estás?, cómo, tú, ahí, exámenes, medianoche, etc.). Colores hex → tokens del tema: `#059669`→`var(--color-brand-success)`, `#DC2626`→`var(--color-brand-error)`, `#D97706` y `#B45309`→`var(--color-brand-warning)`. Archivos de tokens no editados (los tokens ya existían en `frontend/src/styles/tokens.css`). |

### FASE B — Ahorro, commit de contenido (`content(ahorro): generaliza casos para todo publico`)

| Módulo | Lección | Cambio (antes → después) |
|---|---|---|
| Ahorro | L01 | Revisada: el gancho no asume estudiante, sin cambios de contenido. |
| Ahorro | L02/L03 | Tandas y cochinito intactos (cultura general MX); solo ortografía del commit anterior. |
| Ahorro | L04 | Solo ortografía; contenido ya universal. |
| Ahorro | L05 | +metas "Pagar deudas" 💳 y "Herramienta de trabajo" 🛠️ en el array de sugerencias; "Metas comunes entre universitarios" → "Metas comunes"; placeholder "Laptop para la escuela" → "Laptop para el trabajo o la escuela". |
| Ahorro | L06 | Solo ortografía. |
| Ahorro | L07 | +caso "Carmen — Mesera: sueldo base + propinas variables" (estrategia doble fondo); "¿Como es tu ingreso este semestre?" → "¿Cómo es tu ingreso actualmente?"; opción fija "mesada, beca constante" → "sueldo, mesada o beca constante". |
| Ahorro | L08 | Ya universal (laptop, mes sin ingreso, emergencia médica): contenido no tocado; solo tilde "exámenes" en el commit de ortografía. |
| Ahorro | L09 | Situación 1 "antes de examenes" → "cuando más la necesitas"; "Perdida de beca por 2 meses" → "Pérdida de ingreso por 2 meses"; "seguro medico estudiantil" → "seguro médico"; "seguro de desempleo estudiantil" → "seguro de desempleo"; "Seguros basicos para universitarios" → "Seguros básicos para quien empieza"; descs de seguros universalizadas ("universidades o empresas", "Para viajes largos"). |
| Ahorro | L10 | Datos IPAB intactos; solo ortografía (no hay copy escolar). |
| Ahorro | L11 | Micro-reto: SOLO ortografía y copy generalizado; lógica del reto NO tocada ni rediseñada. |
| Ahorro | L12–L15 | Barrido de copys sueltos; solo ortografía (sin menciones escolares de contenido). |

### FASE C — Inversión (`content(inversion): barre menciones escolares y generaliza copy`)

| Módulo | Lección | Cambio (antes → después) |
|---|---|---|
| Inversión | L04 | "Estudiante ficticio con $3,500/mes" → "Caso ficticio con $3,500/mes". |
| Inversión | L05 | Título de Finni "Para estudiantes que empiezan" → "Para quien empieza". |
| Inversión | L13 | "como estudiante mexicano" → "como mexicano que empieza". |
| Inversión | L01–L03, L06–L12, L14–L15 | Revisadas: sin menciones escolares, sin cambios. Datos financieros (CETES, inflación, IPAB, plataformas) NO tocados. |

## 2. Decisiones dudosas / marcadas para revisión del dueño

- **L02-Presu — item nuevo "Propinas"**: añadir el item cambia el total visible del contador "Ingresos Clasificados" de 8 a 9 (se parcheó el display). Es un item de datos, no un cálculo, pero si el dueño prefiere no tocar el total, se puede quitar el item y volver el contador a 8.
- **L02-Presu — items escolares conservados**: "Beca PRONABES", "Mesada semanal de papás", "Trabajo en café escolar" y "FONACOT de papás" se mantuvieron como tipos de ingreso reales porque conviven con sueldo/propinas/freelance (mandato del dueño). El feedback de FONACOT ("puede variar con cuotas distintas") se dejó tal cual: es probabilístico, no escolar.
- **L06-Presu — Roberto conserva sus números**: Beca PRONABES $1,800 + Mesada $800 sin cambios (regla del dueño: no alterar la matemática del ejercicio). Solo se universalizó el encuadre ("Un caso real de un usuario").
- **L08-Presu — narrativas de apertura**: los mini-casos "Situación 1 — Valeria (reprobó un examen → mall → compra → culpa)" y "Situación 2 — Diego" se conservaron como ancla escolar; el espejo laboral vive en el array de situaciones (s6/s7). Si el dueño quiere, se puede reescribir la narrativa de Valeria a un contexto mixto.
- **L08-Presu — anclas escolares s1/s2**: "Comprar uniforme de deporte para la clase" y "café gourmet después de reprobar un examen" se mantuvieron como caso ancla; los espejos laborales se agregaron al mismo array (ropa de trabajo, comida de oficina).
- **L05-Presu — opción $8,000**: la matemática de la regla 50-30-20 es libre (porcentajes sobre lo que ganes), no depende de montos fijos; ampliar el rango hasta $8,000 no altera ningún cálculo.
- **L09-Presu — umbral de alcanzabilidad**: el cálculo `2500 * 0.3` no se tocó; solo se generalizó el copy ("ingreso típico").
- **L01-Presu — dato estadístico**: "68% de las personas no sabe exactamente cuánto gasta al mes" (fuente CONDUSEF) se mantuvo textual; no se inventó una cifra nueva.
- **Ahorro L07 — casos conservados**: Laura (mesada fija $2,000) y Rodrigo (tutorías variables) se mantuvieron; el caso trabajador añadido es Carmen (mesera con propinas). El perfil variable de Rodrigo aplica también a freelance/ventas.
- **Ahorro L05 — metas existentes**: "Viaje de graduación" y "Laptop" se conservaron (se añadieron espejos, no se borraron metas).
- **Ahorro L09 — IMSS**: "Si tienes trabajo formal o a través de tus padres" se mantuvo; es universal (trabajo formal o familiar/dependiente).
- **Ahorro L08**: contenido no tocado por mandato explícito; solo se corrigió la tilde en "exámenes".
- **Ahorro L02 — "a media noche" → "medianoche"**: corrección de norma RAE (una sola palabra). Si se prefiere mantener la voz coloquial "a media noche", se puede revertir sin afectar nada más.
- **Shell compartido (externo, NO tocado)**: `../AUDITORIA_LECCIONES.md` y `../loop-generalizacion/REQUEST_CHIP_GENERALIZACION.md` contienen menciones de "TecToluca", "universitario" y "semestre" como contexto de auditoría/instrucciones; son hallazgos externos documentados, no contenido de la app.

## 3. Nota de alcance — qué NO se tocó

- **Datos financieros**: tasas CETES, inflación, IPAB (límites/montos), nombres de productos y plataformas. Esto viene después con Brújula.
- **Lógica de componentes**: estados, cálculos, completion, handlers y estructura JSX de interacciones. Solo se cambiaron strings de copy y arrays de datos (items, eventos, escenarios, casos, opciones).
- **Celebración, autoguardado y streak**: fuera de alcance.
- **L15-Presu notificaciones y L11-Ahorro rediseño del micro-reto**: fuera de alcance (L11 solo copy).
- **Tandas/cochinito (Ahorro L02/L03)**: se conservan; son cultura general mexicana, no estudiantil.
- **Hallazgos T1/T2/T3/T6 y fixes 1/2/4-8 de la auditoría**: fuera de alcance de esta misión.
- **Archivos externos al repo**: auditoría y shell compartido (`../AUDITORIA_LECCIONES.md`, `../loop-generalizacion/`), por indicación explícita.
- **Módulo Inversión**: sin cambios de datos financieros; solo 3 copys generalizados.

## 4. Verificación (grep de control)

- `universitari` en `frontend/src/pages/modules/`: **0 hits**.
- `TecToluca | Tec de Toluca | Tecnologico de Toluca` en `frontend/src/pages/modules/`: **0 hits** (menciones solo en archivos externos del shell compartido, no tocados).
- `semestre` en `frontend/src/pages/modules/`: **0 hits**.
- `PRONABES`: **3 hits legítimos** (L02-Presu item de ingreso + feedback, L06-Presu ingreso de Roberto) — tipo de ingreso real dentro de listas mixtas.
- `beca|mesada`: todos los hits están dentro de listas naturales ("quincena/mesada/beca", "sueldo, mesada o beca", "mes sin beca/mesada") o son casos reales conservados (Laura, mesada de papás, Sofía) — justificados.
