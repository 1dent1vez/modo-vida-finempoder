# F5 — Promesas rotas corregidas

Rama `f5-promesas-rotas` (base `qa-identivezz @ 7672bf1`). Nada de lo que la
app dice puede seguir siendo falso: se corrigieron 3 promesas incumplidas.

## Fix 1 — L15 presupuesto: Parte 3 sin promesa de notificaciones

La Parte 3 conserva la mecánica (elegir día y hora) pero ahora es un compromiso
honesto: FinEmpoder no envía notificaciones, así que la "señal" es del usuario.

### Copy final (verbatim)

- Título de la Parte 3: **Parte 3: Tu señal de revisión semanal**
- Finni (título): **Es tu señal, no la nuestra**
- Finni (mensaje): **Elige cuándo revisarás tu presupuesto esta semana. Es tu señal, no la nuestra: si quieres que te avise, pon una alarma en tu teléfono. FinEmpoder no envía notificaciones todavía.**
- Vista previa al elegir día y hora: **Tu señal: {día} {hora} · Revisarás tu presupuesto**
- Resumen guardado (leído de vuelta desde la base): **3. Tu señal: {día} {hora} · Revisarás tu presupuesto**
- Botones: **Guardar y ver resumen →** · **Configurar mi señal →** · **¡Desbloquear Presupuesto Pro!**
- Error de guardado: **No pudimos guardar tu señal. Intenta de nuevo.**

### Persistencia real

- Se guarda en `lessonDataRepository.save('presupuesto', 'l15_senal_semanal', { dia, hora, updatedAt })`.
- El resumen **lee de vuelta** la key `l15_senal_semanal` al montar y tras
  guardar (persistencia verificada, no optimista).
- La lección se completa solo con la elección + persistencia confirmada
  (`await` del save). Si el guardado falla, se muestra el mensaje de error y
  **no completa**.
- `l15_compromisos` (Partes 1/2) no cambia su flujo.

### Nota del JSON viejo de L15

El payload antiguo `l15_compromisos` con `notifDay`/`notifHour` de usuarios
existentes **se ignora** en el nuevo resumen: el resumen solo lee
`l15_senal_semanal`. Un usuario a mitad del flujo tendrá que re-elegir y
guardar su señal; al re-guardar, la señal nueva queda persistida y el resumen
la muestra.

## Fix 2 — L11 ahorro: micro-reto con días reales

En lugar de casillas booleanas, cada "Día N" guarda la fecha **local**
`YYYY-MM-DD` (helper `localDayKey`, nunca UTC).

### Copy final (verbatim)

- Título: **Micro-reto: ahorra en 3 días**
- Finni (apertura): **Este micro-reto es simple: aparta algo un día a la vez. No importa si son $10 o $100. Completa 3 días y el hábito empieza a formarse.**
- Cómo funciona el reto:
  - **1. Aparta un monto (el que puedas) un día**
  - **2. Regístralo aquí en FinEmpoder**
  - **3. Repite hasta completar 3 días**
- Reglas:
  - **No hay monto mínimo. $5 cuenta.**
  - **Puede ser transferencia, alcancía física, o efectivo.**
  - **Los 3 días no tienen que ser seguidos: completa uno por día.**
- Estados del reto:
  - **Día 1/3 completado** + **Apartado el {fecha}**
  - **Día 2/3: toca completar (guarda tu ahorro del día)**
  - **Vuelve mañana para el día 2**
- Confirmaciones de Finni: **¡Primer día completado! Ya llevas {monto} hacia tu meta.** · **¡Dos días de ahorro! Estás construyendo algo real.** · **¡Lo lograste! Tres días de ahorro. Eso ya es el inicio de un hábito real.**
- Badge: **Constancia de 3** · **Badge desbloqueado · 3 días de ahorro**
- Error de guardado: **No pudimos guardar tu ahorro. Intenta de nuevo.**

### Reglas

- No se pueden completar 2 días con la misma fecha: si hoy ya completaste, el
  botón del día actual queda deshabilitado con **Vuelve mañana para el día N**.
- El reto se completa con **3 fechas distintas** (`days.length >= 3`); no se
  exige consecutividad (decisión: el título/copy ahora dice "ahorra en 3 días"
  y no promete rigor de consecutividad).
- Se persiste en `lessonDataRepository.save('ahorro', 'l11_reto', ...)` con
  `days: string[]` + `dayAmounts`/`totalAcumulado`/`completedAt` conservados
  (compatible con L13/L14/L15 de ahorro que leen ese payload).

### Migración del micro-reto (decisión elegida)

El código anterior solo persistía `l11_reto` al completar 3/3, así que un
payload viejo (sin campo `days`) con `completedAt` ya es un reto completado:

1. **Payload viejo con `completedAt` (o 3 montos): reto COMPLETADO.** Se
   muestra el badge/estado completado con el flag `completadoViaLegacy: true` y
   **sin inventar fechas** (`days` ausente).
2. **Payload viejo sin `completedAt` con 1-2 montos (caso defensivo que el
   código viejo nunca escribía):** los días se cuentan con **fechas estimadas
   de migración hacia atrás** (hoy-1, hoy-2), documentadas como estimaciones,
   no reales. Así el día de hoy queda disponible y "vuelve mañana" funciona
   naturalmente si el usuario ya completó hoy; el día que complete hoy será un
   día real.

La decisión (opción simple y honesta) está implementada en `migrarPayload()` en
`frontend/src/pages/modules/ahorro/lessons/L11.tsx`.

## Fix 3 — L11 presupuesto: tutorial con pasos verificables

El antiguo tutorial de 5 pasos ("Marcar como hecho" sin validación y
"Activar un recordatorio de registro") se reemplazó por 3 pasos con entrada
real validada y persistida. No existe ningún botón que avance sin entrada.

### Qué valida cada paso

- **Paso 1 — Elige al menos una herramienta para registrar tus gastos**
  (tarjetas: CONDUSEF, Fintonic, Google Sheets, FinEmpoder). Entrada: al menos
  1 selección. El botón **Siguiente →** se habilita solo con selección válida.
  Se persiste `l11_opciones.herramientas: string[]`.
- **Paso 2 — Elige tu método: ¿qué app usarás primero?** Entrada: input
  obligatorio con `maxLength={80}`; el botón se habilita solo con texto no
  vacío tras `trim`. Se persiste `l11_opciones.metodo` (con trim).
- **Paso 3 — Define tu señal de registro diario** (día + hora). Entrada: ambos
  campos. El botón **Terminar tutorial →** se habilita solo con día y hora.
  Se persiste `l11_opciones.senal: { dia, hora }`. Copy honesto: **Elige cuándo registrarás tus gastos. Es tu señal, no la nuestra: si quieres que te avise, pon una alarma en tu teléfono. FinEmpoder no envía notificaciones todavía.**
- Avance solo tras `await lessonDataRepository.save('presupuesto', 'l11_opciones', ...)`
  exitoso; si falla, mensaje (**No pudimos guardar tus opciones. Intenta de nuevo.**)
  y no avanza.
- La barra de progreso del tutorial refleja **solo** pasos completados con
  entrada real persistida (3/3). El trofeo de honor se eliminó.
- Pantalla final: **¡3/3 pasos completados!** · **Ya elegiste tus herramientas, tu método y tu señal de registro. El hábito empieza con tu primer registro real.**

### Decisión documentada

Se omitió el paso "abrir la pantalla real de presupuesto" (navegación real): la
pantalla real de presupuesto es la L12, que está **bloqueada tras completar
L11** (gate secuencial del módulo), así que no se puede navegar a ella desde el
tutorial sin romper el flujo. El requisito mínimo (2 pasos con validación real)
se supera con 3.

## Cómo probar (qa.finempoder.com.mx)

1. Activa el **modo admin** en `/admin` (PIN `2026`). Con admin activo
   (`localStorage.fe_admin_mode = 1`) los gates de lecciones son no-op y puedes
   navegar directo a cualquier lección.
2. **L15 presupuesto**: `/app/presupuesto/lesson/L15`. Completa las 3 partes:
   elige día/hora en la Parte 3, verifica que el resumen muestra
   "Tu señal: ... · Revisarás tu presupuesto" y que no aparece
   "Recordatorio"/"configurado". Recarga la lección: el resumen debe leer la
   señal guardada desde la base.
3. **L11 ahorro**: `/app/ahorro/lesson/L11`. Completa el día 1 y verifica que
   el día 2 queda en "Vuelve mañana para el día 2". Completa en 3 días
   distintos para desbloquear "Constancia de 3".
4. **L11 presupuesto**: `/app/presupuesto/lesson/L11`. Verifica que los botones
   Siguiente/Terminar están deshabilitados sin entrada válida en cada paso y
   que al avanzar las opciones quedan guardadas (recarga y re-entra al
   tutorial: los 3 pasos aparecen completados).

## Verificación técnica

- Suite completa: **320 tests** (309 base + 11 nuevos) en verde.
- `npm run type-check`, `npm run lint` y `npm run build` en verde.
- Tests nuevos:
  - `frontend/src/pages/modules/presupuesto/lessons/L15.test.tsx`
  - `frontend/src/pages/modules/ahorro/lessons/L11.test.tsx`
  - `frontend/src/pages/modules/presupuesto/lessons/L11.test.tsx`
