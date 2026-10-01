# F2 — Datos financieros MX centralizados (`datos-mx.ts`)

**Rama:** `f2-datos-mx` (base `qa-identivezz` @ `81d1e55`)
**Fuente de verdad:** `loop-fase1/DATOS_VERIFICADOS.md` (23-ago-2026)
**Alcance:** cifras macro hardcodeadas en lecciones → `frontend/src/lib/datos-mx.ts` (fecha de corte + fuente como parte del dato).

## Qué cambió

Nuevo módulo `frontend/src/lib/datos-mx.ts` con `MX` (cetes, inflación, ISR, IPAB, salario mínimo, TIIE) y helpers `fmtTasa`, `fmtFecha`, `mxLabel`. Los simuladores importan de `MX`; las tasas en pantalla muestran fecha de corte (`tasa referencial: 6.2%, ago 2026`).

## Tabla lección → dato viejo → dato nuevo → fuente

| Lección | Dato viejo | Dato nuevo | Fuente |
|---|---|---|---|
| inversion/L12 (constante + textos) | Inflación "actual" 4.66% (`INFLACION_MEXICO_2024`) | 3.12% (INEGI, julio 2026) — `MX.inflacion.anualPct` | INEGI INPC |
| inversion/L12 (HISTORICO) | 2022: CETES 9.5 / inflación 8.7 | 2022: 7.7 / 7.82 | Banxico SIE / INEGI |
| inversion/L12 (HISTORICO) | 2024: CETES 10.0 / inflación 4.66 | 2024: 10.4 / 4.21 | Banxico SIE / INEGI |
| inversion/L12 (HISTORICO) | Sin fila 2025 | 2025: 7.3 / 3.69 (agregada) | Banxico SIE / INEGI |
| inversion/L12 (tabla) | Sin nota | Nota: tasas cambian cada semana (subasta Banxico), inflación cada mes (INEGI) | doc §131 |
| inversion/L06 (ficha CETES) | `~10% anual (referencial)` | `≈6.2% anual (ago 2026) — la tasa cambia cada semana` | cetesdirecto.com |
| inversion/L06 (simulador) | `TASA_ANUAL = 0.10` | `MX.cetes.tasa28d` (0.0615); label `Tasa referencial: 6.2%, ago 2026` | cetesdirecto.com |
| inversion/L06 (ISR) | "retención automática ~0.15% en 2024" | "0.90% del capital en 2026 (SAT). Se ajusta cada año según la tasa de interés — ya viene descontado" | Ley de Ingresos/SAT |
| inversion/L06 (PRLV) | "Protegidos por IPAB hasta 400,000 UDIS" | "…400,000 UDIs ≈ $3.5M (jul 2026)" | IPAB |
| inversion/L11 | `ISR_RETENCION = 0.15` + texto "(retención de ~0.15% en 2024…)" | `MX.isr.retencionCetesPct` (0.90) + "(retención de 0.90% en 2026…)" | Ley de Ingresos/SAT |
| inversion/L13 | `TASA_POR_INSTRUMENTO`: CETES 28d 0.10 / 91d 0.102 / mixto 0.095 | `MX.cetes.tasa28d` / `MX.cetes.tasa91d` / mixto = media ≈0.063 (etiqueta `≈6.3%`) | cetesdirecto.com |
| inversion/L13 | `inflacion = 0.0466` | `MX.inflacion.anualPct / 100` (0.0312); label `3.1%, jul 2026` | INEGI INPC |
| inversion/L15 | `INFLACION_SIM = 0.04`; CETES sim 0.100/0.102 | `MX.inflacion.anualPct / 100`; `MX.cetes.tasa28d`/`tasa91d`; inflación en texto `3.1%, jul 2026` | INEGI / cetesdirecto.com |
| inversion/L09 | CETES 0.10 en constructor | `MX.cetes.tasa28d`; chip `6.2%/año` con fecha | cetesdirecto.com |
| inversion/L05 | Renta fija "8-11% anual" | "~6-7% anual (ago 2026) — en 2023-2024 llegó a 11%" | cetesdirecto.com |
| inversion/L05 (FIBRAs) | "7-10% anual" | "7-10% anual (estimado histórico)" | doc §118 |
| ahorro/L03 (IPAB) | "~3 millones de pesos" (card, cita, quiz) | "≈ $3.5 millones (jul 2026)" | IPAB |
| ahorro/L03 (3%) | "$5,000 al 3% anual" | Nota agregada: "las cuentas tradicionales pagan mucho menos; este es un ejemplo optimista" | doc §122 |
| ahorro/L10 (quiz + texto) | "~3 millones" / "≈ 3 millones de pesos en 2024" | "≈ $3.5 millones (jul 2026)" / "≈ $3.5 millones en 2026" | IPAB |
| ahorro/L12 (TASAS) | CETES 8% | `MX.cetes.tasa28d * 100` (6.15) + nota de tasas vigente/estimadas | cetesdirecto.com |
| ahorro/L02 (coherencia) | "~3 millones" / "(~3M)" | "≈ $3.5 millones (jul 2026)" / "(≈ $3.5M, jul 2026)" | IPAB |
| ahorro/L14 (coherencia) | "hasta ~3 millones de pesos" | "hasta ≈ $3.5 millones (jul 2026)" | IPAB |
| presupuesto/L01 | "Comida rápida + Netflix" / item `Netflix $99` | "Comida rápida + streaming" / item `Suscripción de streaming (~$189/mes)` | doc §P3 |
| presupuesto/L07 | Consecuencias con $99 | "Ahorraste $189. Aún necesitas $111 más." / "Tienes $189 disponibles de inmediato. Cubre el gasto." (scores 50/100 intactos) | doc §P3 |
| presupuesto/L08 | "nunca usarás ($99)" | "nunca usarás (~$189)" | doc §P3 |

## OK-didáctico (sin cambio requerido)

- 50/30/20 (universal), $100 mínimo CETES (vigente), ejemplos de interés compuesto al 5% y 10% (matemática correcta), gasto hormiga por día ($45-50 → ~$1,500/mes), montos de escenarios de presupuesto y emergencias, señales de estafa de L10 (156%/180% anual: correcto), regla "deudas >15% anual" (razonable con CAT reales).
- BONDES "tasa variable ligada a TIIE": concepto vigente (TIIE 28d ≈ 6.8% en ago-2026).

## Decisiones

- **Mixto L13 (promedio):** `(MX.cetes.tasa28d + MX.cetes.tasa91d) / 2` = 0.063 (≈6.3%); la "Tasa anual" del plan se etiqueta `≈` solo para ese instrumento. Documentado en `L13.tsx`.
- **L07 (consecuencias recalculadas):** escenario A es $300: $300 − $189 = $111 ("Aún necesitas $111 más."). b3 mantiene "Cubre el gasto." con $189. Los scores (50/100) no cambian.
- **Notas "estimado":** frase `Estimado histórico (no es rendimiento garantizado ni actual)` en L09 (balanceado/acciones), L15 (fondos/acciones), y nota de vigencia en L13 (resto de instrumentos) y ahorro L12 (fondos/acciones). CETES siempre muestra la tasa vigente con fecha de corte.
- **L08:** se conservó el ejemplo de la app de productividad (gasto impulsivo por oferta) y solo se actualizó el monto a `(~$189)`; no se sustituyó por streaming.
- **IPAB:** los textos UI usan la forma redonda del doc (`≈ $3.5 millones (jul 2026)`); el valor canónico es `MX.ipab.topeMxn = 3,517,535.60` (400,000 UDIs, 31-jul-2026).
- **L10 línea 95:** usa `(≈ $3.5 millones en 2026)` según la instrucción específica; el resto usa `(jul 2026)`.
- **Ahorro L12:** el slider CETES usa `6.15` (porcentaje, derivado de `MX.cetes.tasa28d`) porque el array trabaja en %; la nota del simulador muestra `6.2%, ago 2026` redondeado.
- **Test de gobernanza:** el shape de `MX` (fecha+fuente por dato) vive en `datos-mx.test.ts` (commit 1). El escaneo estático de lecciones (`datos-mx-gobernanza.test.ts`) se agrega con el último módulo (presupuesto, commit 4) para que la suite quede verde en cada commit.

## Cómo probar

- Local: `cd frontend && npm test` (suite completa), `npm run build`, `npx tsc -p tsconfig.app.json --noEmit`.
- QA (qa.finempoder.com.mx) — visualizar con fecha de corte:
  - inversión L06: ficha CETES "≈6.2% anual (ago 2026)" y simulador "Tasa referencial: 6.2%, ago 2026".
  - inversión L12: INPC "3.12% (INEGI, julio 2026)" y histórico 2020-2025 con nota de subasta.
  - inversión L13: CETES 6.2%, mixto ≈6.3%, inflación "3.1%, jul 2026".
  - inversión L15: CETES 6.2/6.5%/año, inflación "3.1%, jul 2026", etiquetas "estimado histórico".
  - ahorro L12: chip CETES 6.15% y nota de tasa vigente (6.2%, ago 2026).
  - ahorro L03/L10/L14 y presupuesto L01/L07/L08: IPAB "≈ $3.5 millones (jul 2026)" y streaming ~$189.
