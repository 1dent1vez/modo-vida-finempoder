# Consola administrativa

La consola se abre en `/app/admin`. Para cuentas con permiso, también aparece el enlace **Centro de control** en Ajustes. El acceso se comprueba en el servidor con el JWT de Supabase y `public.profiles.role = 'admin'`; el PIN de `/admin` es una herramienta local de QA y no concede este rol.

## Alcance actual

- **Resumen:** total de cuentas, lecciones completadas, registros del newsletter (incluye estados no activos) y cola editorial.
- **Newsletter:** estado de las últimas ediciones y acceso al editor existente para investigar, revisar, aprobar y programar publicaciones.
- **Usuarios:** lista paginada de correo, nombre, rol y fechas de alta/acceso. Es solo consulta.
- **Operación:** presencia de la configuración de newsletter, pagos, correo, IA y tarea de publicación. No son pruebas de salud de esos proveedores.

La API usa `/api/admin/me`, `/api/admin/overview` y `/api/admin/users`, todos protegidos con `authGuard` y `requireRole('admin')`, y responde con `Cache-Control: private, no-store`. El editor conserva su autorización propia: un UUID en `NEWSLETTER_ADMIN_IDS` o el rol global `admin`.

## Dar acceso

1. Crear/iniciar sesión con la cuenta en Supabase y localizar su UUID en Authentication → Users.
2. Un operador con acceso al SQL Editor debe verificar la identidad y asignar el rol a ese UUID: `UPDATE public.profiles SET role = 'admin' WHERE id = '<UUID_VERIFICADO>';`.
3. Confirmar que se actualizó exactamente una fila. La cuenta puede abrir `/app/admin` tras renovar la sesión o recargar.
4. Para revocar, cambiar ese perfil a `student`; la próxima petición al backend será rechazada. No editar `role` desde el cliente ni entregar la clave `service_role` al frontend.

La migración 002 restringe la escritura de `profiles.role` a operadores con privilegios. Antes de conceder el rol, revisar que el historial de migraciones y las políticas del entorno sean las esperadas (D14).

## Pendiente

No hay acciones para suspender o eliminar usuarios, editar lecciones, cambiar secretos ni operar proveedores desde esta consola. Antes de añadirlas se necesitan permisos granulares, bitácora de acciones, doble confirmación para operaciones sensibles y pruebas de recuperación. Ver D16 en `ESTADO-PROYECTO.md`.
