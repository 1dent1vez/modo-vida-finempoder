# 🎮 Reglas de Negocio: Lecciones y Gamificación (GAMIFICACION-Y-LECCIONES.md)

Este documento describe las reglas de negocio implementadas en **FinEmpoder** para el flujo educativo de los estudiantes, el cálculo de puntajes y el sistema de incentivos.

---

## 📈 Lógica de las Lecciones y Progreso

Cada uno de los tres módulos principales (`presupuesto`, `ahorro` e `inversion`) está dividido en **15 lecciones** ordenadas de manera secuencial (L01 a L15).

### 🔓 Flujo de Desbloqueo (Secuencial)
1. **Regla de oro:** Un estudiante no puede acceder a la lección $L_{n}$ a menos que la lección $L_{n-1}$ esté marcada como completada en la base de datos.
2. La lección inicial `L01` siempre está desbloqueada por defecto al comenzar un módulo.
3. El frontend deriva los estados de las lecciones dinámicamente:
   * **`locked` (Bloqueada):** La lección anterior no está completada.
   * **`available` (Disponible):** La lección anterior fue completada pero esta aún no se ha iniciado.
   * **`in_progress` (En Curso):** La primera lección de la lista que está disponible (es la lección activa del estudiante).
   * **`completed` (Completada):** Ya fue resuelta con éxito.

---

## ⚡ Reglas del Sistema de Gamificación

El progreso del alumno se premia a través de puntos de experiencia (XP), niveles y una racha de días de estudio consecutivos.

### 1. Puntos de Experiencia (XP)
* **Completado de Lección:** Cada lección finalizada por primera vez otorga **10 XP** de forma fija.
* **Repetición:** Volver a cursar una lección ya completada no otorga XP adicional para evitar abusos del sistema.

### 2. Fórmula de Cálculo de Niveles
El nivel del estudiante es directamente proporcional a su XP total acumulada. La fórmula matemática para calcular el nivel es:
$$\text{Nivel} = \max\left(1, \lfloor \frac{\text{XP}}{100} \rfloor + 1\right)$$

#### Tabla de Referencia de Niveles:
| Nivel | Rango de XP | Lecciones Requeridas (Aprox.) |
|---|---|---|
| **Nivel 1** | $0$ a $99$ XP | $0$ a $9$ lecciones completadas |
| **Nivel 2** | $100$ a $199$ XP | $10$ lecciones completadas |
| **Nivel 3** | $200$ a $299$ XP | $20$ lecciones completadas |
| **Nivel 4** | $300$ a $399$ XP | $30$ lecciones completadas |

---

### 3. Algoritmo de Rachas de Actividad (Streaks)
El sistema incentiva el hábito diario de estudio. Cuando se registra la finalización de una lección, se evalúa la fecha local en formato `YYYY-MM-DD` en relación con el último día activo registrado (`last_active_iso`):

1. **Mismo Día:** Si la última lección completada ocurrió hoy (`last_active_iso == hoy`), la racha actual se mantiene idéntica.
2. **Día Siguiente (Consecutivo):** Si la última actividad registrada fue ayer (`last_active_iso == ayer`), la racha se incrementa en 1:
   $$\text{streak\_current} = \text{streak\_current} + 1$$
3. **Ruptura de Racha:** Si la última actividad registrada es anterior al día de ayer, la racha actual se reinicia a `1` (comenzando una nueva racha).
4. **Mejor Racha histórica (`streak_best`):** En cada incremento de racha, si la racha actual supera a la mejor racha histórica registrada, esta última se actualiza:
   $$\text{streak\_best} = \max(\text{streak\_best}, \text{streak\_current})$$
