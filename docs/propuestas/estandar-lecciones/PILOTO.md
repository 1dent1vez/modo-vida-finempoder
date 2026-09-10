# Piloto interactivo de lecciones

Implementado como entrada independiente en `frontend/piloto.html`. No cambia rutas, lecciones, autenticación, datos financieros ni XP de la aplicación existente.

## Abrir

Desde `finempoder app/frontend`:

```bash
./node_modules/.bin/vite --config vite.pilot.config.ts
```

Visitar http://127.0.0.1:5174/piloto.html. Es un servidor local, no una publicación en internet. Si se detiene, ejecutar de nuevo el comando.

## Qué probar

1. **Clasifica:** seis ingresos; arrastrar o tocar destino, comprobar, corregir, continuar y revisar el cierre.
2. **Experimenta:** presupuesto ficticio de $6,000. Ajustar necesidades y gustos con sliders o campos numéricos; los campos aplican su monto al salir o pulsar Enter. Observar ahorro o déficit. Cubrir básicos y apartar al menos $1,500; responder de dónde provino el ahorro adicional.
3. **Decide:** tres casos con tres opciones cada uno. Comparar consecuencias, explorar otra opción y terminar con un resumen de decisiones.
4. Recargar en mitad de un ejercicio: deben volver actividad, respuestas y borrador. La clave local exclusiva es `finempoder:lesson-pilot:v1`. “Reiniciar piloto” borra únicamente este estado de prueba.
5. Probar navegación y respuestas con teclado. En móvil el simulador mantiene un resumen del ahorro visible junto a los controles; la acción principal permanece al pie.

## Arquitectura y alcance

`Pilot.tsx` contiene el marco común, feedback contextual de Finni y las tres vistas. `model.ts` define contenido ficticio, estado y validación de recuperación. `pilot.css` hereda tokens de marca y añade composición responsive. `main.tsx` no inicializa sesión, analítica ni repositorios de la aplicación.

El piloto demuestra interacción; todavía no sustituye L02, L05 ni L07. La integración futura debe conservar LessonShell y el contrato de finalización de ModuleKit. No se añadieron reproductor de audio ni las otras ocho familias en esta fase.

## Verificación

- Cinco pruebas de interacción/recuperación en `Pilot.test.tsx`.
- Comprobación TypeScript del frontend.
- Compilación independiente del piloto.
- Revisión visual en navegador a 390 y 1280 px; capturas en `piloto-capturas/`.
- Comprobación de selección, cambio de montos y revelación de consecuencias y cierre de los tres casos en navegador. Se verificó además que un monto fuera de rango muestra el valor normalizado, no solo que lo usa en el cálculo.
- Detector de diseño: transición de ancho de progreso sustituida por escala horizontal.

```bash
./node_modules/.bin/vitest run --config vite.pilot.config.ts
./node_modules/.bin/tsc -p tsconfig.app.json --noEmit
./node_modules/.bin/vite build --config vite.pilot.config.ts --outDir /tmp/finempoder-pilot-build
```

Pendiente para la integración: prueba observada con usuarios, revisión curricular del contenido de ejemplo, prueba en dispositivos táctiles reales y conexión al guardado/progreso de ModuleKit. Las capturas y pruebas de este piloto no equivalen a una auditoría completa de accesibilidad ni a una validación de retención.

## Finni emergente y 404

El piloto ahora utiliza la ilustración existente `frontend/src/assets/onb1.png` en un asistente con burbuja de diálogo. Se puede pedir una pista, cerrar con botón o Escape y volver a abrir. Una nueva respuesta revisada, consecuencia o hito puede activar otra aparición; cerrar el consejo no reinicia la actividad. La animación respeta movimiento reducido y no reproduce audio. Se sustituyeron los bloques fijos de Finni del piloto; el componente compartido queda disponible para futuras migraciones de lecciones.

La página 404 está conectada al fallback de App.tsx, con regreso a `/app`. En el piloto puede revisarse mediante “Ver página 404” o `/ruta-inexistente`; su regreso apunta a `/piloto.html`. La 404 es una pantalla del cliente SPA, no un cambio al código de estado HTTP del hosting. No se desplegó.

Verificación ampliada: siete pruebas (incluyen apertura/cierre de Finni y navegación 404), TypeScript, compilación del piloto y detector de diseño sin hallazgos. Navegador: pista automática, 404 por URL inexistente y recuperación del piloto. Capturas adicionales `finni-mobile.png`, `finni-desktop.png`, `404-mobile.png` y `404-desktop.png`.
