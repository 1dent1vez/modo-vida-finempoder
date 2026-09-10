# Ligas — función congelada

Fecha de decisión: 10 de septiembre de 2026.

Ligas queda fuera del primer release de FinEmpoder. Su implementación se preserva en la rama `feature/ligas-congeladas-2026-09`, creada desde el commit `dde0886`. Esa rama contiene pantalla, navegación, sincronización semanal, store, pruebas E2E y unitarias, documentación F4 y la migración `003_league_schema.sql`.

La rama del release no incluye:

- ruta `/app/ligas` ni acceso en la navegación;
- sincronización automática de puntajes;
- eventos analíticos de Ligas;
- tablas, políticas o RPC de la migración 003;
- pruebas o código cliente de esta función.

## Condiciones para retomarla

1. Crear una rama nueva desde la rama estable vigente; no desplegar directamente la rama congelada.
2. Recuperar los archivos de Ligas mediante `git checkout feature/ligas-congeladas-2026-09 -- <rutas>` o un cherry-pick revisado.
3. Rebasar el diseño sobre la navegación, autenticación, persistencia y analítica vigentes.
4. Revisar nuevamente RLS, funciones `SECURITY DEFINER`, abuso de códigos de invitación y límites de escritura.
5. Crear una migración nueva con el siguiente número disponible. No reutilizar `003` si el entorno compartido ya la registró o aplicó.
6. Ejecutar pruebas unitarias, integración real con Supabase y E2E móvil/escritorio antes de habilitarla mediante una decisión de producto explícita.

Si la migración 003 ya fue aplicada en algún entorno, sus tablas pueden permanecer sin exposición desde la app. Antes de retomarla se debe inventariar ese entorno y decidir una migración reversible de limpieza o una actualización compatible; no eliminar tablas con datos de forma automática.
