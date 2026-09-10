# Newsletter Finempoder — implementación y activación

## Estado

Se integró el módulo sobre React SPA + API Express existente. La landing no se modifica. Las rutas son `/app/newsletter` y `/app/newsletter/editor`; también hay acceso desde Ajustes y la navegación inferior. El modo invitado sigue disponible.

La implementación está preparada para conectar servicios, pero no se han aplicado migraciones a una base real, creado productos en Stripe, configurado cuentas ni enviado correos reales. No se publica contenido de ejemplo como si fuera una edición revisada. El catálogo estará vacío hasta que el responsable prepare y publique contenido.

La API y los pagos están apagados por defecto mediante variables separadas. La ausencia de credenciales nunca simula un cobro o acceso de pago exitoso.

## Funciones incluidas

- Catálogo con resúmenes, filtro por tema, muestra gratuita y lector protegido.
- Suscripción mensual de $49 MXN iniciada desde una cuenta de la app. El formulario seguro final se aloja en Stripe y regresa a la app; no se contrata desde la landing.
- Aceptación explícita de mayoría de edad y renovación mensual; registro de versión de términos y fecha.
- Cancelación al finalizar el periodo, administración del medio de pago mediante portal de Stripe y preferencia de recepción de correos independiente.
- Piloto por cuenta, por hasta 32 días, sin tarjeta ni conversión automática.
- Panel editorial: borradores, fuentes, responsable, muestra, vista previa del correo y lectura, envío de prueba a la cuenta del editor, aprobación por versión y programación.
- Consulta de suscriptores y estado general del envío. Las métricas detalladas por destinatario se consultan en Resend; no hay un dashboard propio de aperturas/clics en esta versión.
- Webhooks Stripe con firma sobre cuerpo original; conciliación periódica; acceso basado en la línea pagada de la factura correspondiente al producto.
- Campañas Resend para un segmento dedicado, bajas respetadas y eliminación del segmento de destinatarios sin acceso.
- Sincronización de publicación con bloqueo en base de datos para impedir campañas concurrentes sobre el segmento compartido.

El antiguo modal de captura local ya no se monta: su promesa de tips semanales gratuitos no corresponde a este producto. Se conservan sus archivos y registros locales para no destruir datos; no se convierten en clientes pagados ni se importan automáticamente a Resend.

## Configuración

1. Revisar y ejecutar `supabase/migrations/004_newsletter.sql` en un entorno de pruebas. Es aditiva y no altera tablas existentes. Requiere los roles estándar de Supabase y `auth.users`. Probar también la denegación de acceso directo con claves anon/authenticated antes de producción.
2. Agregar las variables de `backend/.env.newsletter.example` al servidor Express. El frontend conserva su `VITE_API_URL` existente, con el prefijo `/api` según el despliegue actual.
3. Configurar `NEWSLETTER_ADMIN_IDS` con UUID de cuentas autorizadas de Supabase. El modo administrador local de la app no concede estos permisos.
4. Definir `NEWSLETTER_APP_URL` con el dominio de la aplicación, no el de la landing. Configurar `NEWSLETTER_SUPPORT_EMAIL`, remitente verificado y versión real de términos. Finalizar reembolsos, precio final e información legal antes de habilitar cobros.
5. Stripe: crear un Price activo, MXN, 4900 centavos, recurrente mensual con intervalo 1. La API verifica estos valores antes de abrir Checkout. Usar primero claves de prueba.
6. Configurar portal de cliente para medios de pago y cancelación al final del periodo. Deshabilitar cambios de plan y cancelación inmediata, que no forman parte de esta oferta. Publicar las condiciones finales correspondientes a `NEWSLETTER_TERMS_VERSION`.
7. Registrar webhook `/api/newsletter/webhook/stripe`, versión API **2025-02-24.acacia**, para `checkout.session.completed`, `customer.subscription.created/updated/deleted`, `invoice.paid` e `invoice.payment_failed`. El cliente REST también fija esa versión. Eventos con facturas de otro producto no conceden acceso.
8. Configurar en Stripe los avisos por pago fallido, enlaces para actualizar tarjeta y la estrategia de recuperación. La app muestra el fallo y aplica tres días de gracia desde el fin del periodo pagado. El código no envía por sí mismo correos de facturación ni configura los reintentos del proveedor: deben probarse y limitarse según la política acordada para evitar cargos tardíos inesperados.
9. En Resend, verificar dominio (SPF/DKIM y DMARC apropiados), crear un segmento exclusivo de Finempoder Newsletter y guardar su ID. No reutilizar un segmento con campañas externas. La API conserva las bajas globales del proveedor; el lector puede reactivar el correo de forma explícita desde su cuenta.
10. Programar una llamada autenticada `POST /api/newsletter/jobs/publish` con `Authorization: Bearer <NEWSLETTER_CRON_SECRET>`; usar un secreto aleatorio de al menos 32 caracteres. Por ejemplo, cada cinco minutos. El proceso concilia cobros y envíos y toma una edición vencida por ejecución. Mantenerlo en el backend Express con tiempo suficiente para completar la sincronización de contactos.
11. Activar `NEWSLETTER_ENABLED=true` para probar catálogo, editor y piloto. Activar `NEWSLETTER_PAYMENTS_ENABLED=true` únicamente después de completar las pruebas de Stripe y las condiciones comerciales.

El repositorio incluye backend Express y configuración histórica de Railway. Su alojamiento debe confirmarse: Vercel del frontend no sustituye automáticamente esta API. Añadir su costo real al presupuesto previamente preparado.

## Seguridad y consistencia

Todas las tablas nuevas tienen RLS habilitado y no conceden lectura/escritura directa a anon/authenticated. El servidor usa service role después de comprobar autenticación y autorización. Los resúmenes se consultan con una lista de campos que excluye el cuerpo.

La API envía `Cache-Control: private, no-store`. Workbox usa NetworkOnly para el newsletter antes de las reglas genéricas de caché. React descarta el lector al cambiar de cuenta y cuando vence el acceso. No hay lectura offline de contenido pagado ni almacenamiento del cuerpo en Dexie.

El checkout usa una clave de idempotencia reservada bajo bloqueo de fila en Postgres. Antes de crear uno nuevo se consultan las suscripciones del cliente. Los eventos se deduplican en una función transaccional y no acortan accidentalmente un periodo ya pagado. Una URL de retorno exitosa nunca activa por sí sola la suscripción.

La edición enviada y leída parte de la misma versión guardada. Editar un borrador aprobado o programado elimina la aprobación; una edición en envío/publicada no se puede editar desde este panel. Las correcciones posteriores se publican como nueva edición en esta primera versión.

## Operación editorial

1. Pegar investigación revisada en el panel: título, resumen, texto plano, autor real y fuentes HTTPS (una por línea, `Título | URL`).
2. Guardar. Previsualizar el correo y enviarse una prueba.
3. Confirmar revisión de fuentes y cálculos, aprobar la versión y programar fecha/hora. El control usa la zona horaria del dispositivo y guarda UTC; la pantalla indica esa convención.
4. La tarea programada sincroniza elegibles, crea una campaña, registra su ID y solicita el envío. Una ejecución posterior confirma el estado `sent` y habilita la edición publicada en la app.
5. Si no hay destinatarios elegibles, se publica en la app sin enviar campaña.

El remitente y el contenido no se inventan automáticamente. El uso de IA para investigación ocurre fuera de este panel; no se incluyó una API de generación ni su costo. La aprobación humana es obligatoria.

## Recuperación de incidentes

Si hay un error o respuesta incierta de Resend, la edición pasa a revisión y bloquea nuevas campañas del segmento para evitar envíos duplicados o cambios de audiencia mientras un envío pudiera seguir activo. «Actualizar envíos» consulta la campaña registrada; si ya fue enviada, finaliza la publicación sin reenviar.

Si un proceso se interrumpe antes de registrar el ID de campaña, o la campaña permanece en borrador/fallida, un operador debe revisar Resend y los registros antes de liberar el estado en la base de datos. No hay reintento automático de campañas ambiguas. Esta intervención excepcional se documenta en vez de ofrecer un botón que pueda duplicar un envío.

La sincronización de contactos es secuencial y está orientada al piloto y a una lista inicial pequeña. Para cientos o miles de destinatarios, moverla a trabajos con progreso persistido/cola y revisar tiempos del servidor antes de ampliar. Los resultados detallados de entrega, rebotes y quejas están en Resend.

## Pruebas reproducibles

Backend:

```sh
cd backend
npm run build
node --import tsx --test test/newsletter.core.test.ts test/newsletter.api.test.ts
```

Frontend:

```sh
cd frontend
npm run type-check
npm test -- src/pages/newsletter/Newsletter.test.tsx src/lib/newsletter.test.ts
npx eslint src/pages/newsletter src/components/layout/AppNavbar.tsx
npm run build
```

Las pruebas HTTP usan un servidor local y un adaptador en memoria; no realizan cobros ni envíos. Cubren permisos, muestras, contenido de pago, vencimiento, gracia, piloto, firma/tampering/replay y HTML seguro. La interfaz prueba invitados, consentimiento, cambios de cuenta y fallos de conexión.

Antes de producción falta ejecutar la migración en Supabase de pruebas y comprobar allí RLS, funciones transaccionales y concurrencia; completar un ciclo con Stripe de prueba (incluida renovación, cancelación y fallo); y validar una campaña con buzones propios en Resend. No se afirma validación integral de servicios reales con estas pruebas locales.
