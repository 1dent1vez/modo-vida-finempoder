# Billete Bajo Control — implementación y activación

## Estado

La primera salida a producción publica solo la app educativa gratuita. Este módulo permanece oculto con `VITE_NEWSLETTER_ENABLED=false` y desactivado con `NEWSLETTER_ENABLED=false` y `NEWSLETTER_PAYMENTS_ENABLED=false`. Su activación posterior requiere las validaciones de esta guía; la disponibilidad en desarrollo o QA no autoriza cobros reales.

Se integró el módulo sobre React SPA + API Express existente. La landing no se modifica. Las rutas son `/app/newsletter` y `/app/newsletter/editor`; la consola administrativa abre el mismo editor desde `/app/admin/newsletter`. También hay acceso desde Ajustes y la navegación inferior. El modo invitado sigue disponible.

La migración 004 se aplicó manualmente en Supabase el 28 de septiembre de 2026 y se verificaron RLS y acceso con `service_role`. Aún no se han validado Stripe, Resend ni una publicación real. No se publica contenido de ejemplo como si fuera una edición revisada. El catálogo estará vacío hasta que el responsable prepare y publique contenido.

La API y los pagos están apagados por defecto mediante variables separadas. La ausencia de credenciales nunca simula un cobro o acceso de pago exitoso.

## Funciones incluidas

- Catálogo con resúmenes, filtro y búsqueda por tema, muestra gratuita y lector protegido, bajo el nombre Billete Bajo Control.
- Suscripción mensual de $49 MXN iniciada desde una cuenta de la app. El formulario seguro final se aloja en Stripe y regresa a la app; no se contrata desde la landing.
- Aceptación explícita de mayoría de edad y renovación mensual; registro de versión de términos y fecha.
- Cancelación al finalizar el periodo, administración del medio de pago mediante portal de Stripe y preferencia de recepción de correos independiente.
- Piloto por cuenta, por hasta 32 días, sin tarjeta ni conversión automática.
- Panel editorial: borradores, fuentes, responsable, muestra, vista previa del correo y lectura, envío de prueba a la cuenta del editor, aprobación por versión y programación.
- Asistente editorial opcional: investigación con búsqueda web, redacción estructurada y revisión de consistencia en tres pasos. Devuelve un borrador editable con fuentes citadas y alertas; no lo guarda, aprueba, programa ni envía automáticamente.
- Consulta de suscriptores y estado general del envío. Las métricas detalladas por destinatario se consultan en Resend; no hay un dashboard propio de aperturas/clics en esta versión.
- Webhooks Stripe con firma sobre cuerpo original; conciliación periódica; acceso basado en la línea pagada de la factura correspondiente al producto.
- Campañas Resend para un segmento dedicado, bajas respetadas y eliminación del segmento de destinatarios sin acceso.
- Sincronización de publicación con bloqueo en base de datos para impedir campañas concurrentes sobre el segmento compartido.

El antiguo modal de captura local ya no se monta: su promesa de tips semanales gratuitos no corresponde a este producto. Se conservan sus archivos y registros locales para no destruir datos; no se convierten en clientes pagados ni se importan automáticamente a Resend.

## Configuración

1. La migración `supabase/migrations/004_newsletter.sql` ya está aplicada manualmente en el proyecto actual; no volver a ejecutarla allí. Reconciliar su historial y definir respaldos antes de futuras migraciones. En un entorno nuevo, aplicarla y verificar la denegación de acceso directo con claves anon/authenticated.
2. Agregar las variables de `backend/.env.newsletter.example` al servidor Express. El frontend conserva su `VITE_API_URL` existente, con el prefijo `/api` según el despliegue actual.
3. Configurar `NEWSLETTER_ADMIN_IDS` con UUID de editores que no sean administradores globales, si se necesitan. Una cuenta con `profiles.role = 'admin'` también puede editar. El PIN local de QA no concede estos permisos.
4. Definir `NEWSLETTER_APP_URL` con el dominio de la aplicación, no el de la landing. Configurar `NEWSLETTER_SUPPORT_EMAIL`, remitente verificado y versión real de términos. Finalizar reembolsos, precio final e información legal antes de habilitar cobros.
5. Stripe: crear un Price activo, MXN, 4900 centavos, recurrente mensual con intervalo 1. La API verifica estos valores antes de abrir Checkout. Usar primero claves de prueba.
6. Configurar portal de cliente para medios de pago y cancelación al final del periodo. Deshabilitar cambios de plan y cancelación inmediata, que no forman parte de esta oferta. Publicar las condiciones finales correspondientes a `NEWSLETTER_TERMS_VERSION`.
7. Registrar webhook `/api/newsletter/webhook/stripe`, versión API **2025-02-24.acacia**, para `checkout.session.completed`, `customer.subscription.created/updated/deleted`, `invoice.paid` e `invoice.payment_failed`. El cliente REST también fija esa versión. Eventos con facturas de otro producto no conceden acceso.
8. Configurar en Stripe los avisos por pago fallido, enlaces para actualizar tarjeta y la estrategia de recuperación. La app muestra el fallo y aplica tres días de gracia desde el fin del periodo pagado. El código no envía por sí mismo correos de facturación ni configura los reintentos del proveedor: deben probarse y limitarse según la política acordada para evitar cargos tardíos inesperados.
9. En Resend, verificar dominio (SPF/DKIM y DMARC apropiados), crear un segmento exclusivo de Finempoder Newsletter y guardar su ID. No reutilizar un segmento con campañas externas. La API conserva las bajas globales del proveedor; el lector puede reactivar el correo de forma explícita desde su cuenta.
10. Programar una llamada autenticada `POST /api/newsletter/jobs/publish` con `Authorization: Bearer <NEWSLETTER_CRON_SECRET>`; usar un secreto aleatorio de al menos 32 caracteres. Por ejemplo, cada cinco minutos. El proceso concilia cobros y envíos y toma una edición vencida por ejecución. Mantenerlo en el backend Express con tiempo suficiente para completar la sincronización de contactos.
11. Activar `NEWSLETTER_ENABLED=true` para probar catálogo, editor y piloto. Activar `NEWSLETTER_PAYMENTS_ENABLED=true` únicamente después de completar las pruebas de Stripe y las condiciones comerciales.
12. Para el asistente editorial, configurar `OPENAI_API_KEY` solo en el backend. `NEWSLETTER_AI_MODEL` permite seleccionar un modelo compatible con búsqueda web y respuestas estructuradas; el valor inicial es `gpt-5`. La generación tiene un límite local de cinco solicitudes por editor y hora por instancia del backend, no un presupuesto global. Probar con una cuenta editorial y medir costo y calidad antes de usarla regularmente.

El repositorio incluye backend Express y configuración histórica de Railway. Su alojamiento debe confirmarse: Vercel del frontend no sustituye automáticamente esta API. Añadir su costo real al presupuesto previamente preparado.

## Seguridad y consistencia

Todas las tablas nuevas tienen RLS habilitado y no conceden lectura/escritura directa a anon/authenticated. El servidor usa service role después de comprobar autenticación y autorización. Los resúmenes se consultan con una lista de campos que excluye el cuerpo.

La API envía `Cache-Control: private, no-store`. Workbox usa NetworkOnly para el newsletter antes de las reglas genéricas de caché. React descarta el lector al cambiar de cuenta y cuando vence el acceso. No hay lectura offline de contenido pagado ni almacenamiento del cuerpo en Dexie.

El checkout usa una clave de idempotencia reservada bajo bloqueo de fila en Postgres. Antes de crear uno nuevo se consultan las suscripciones del cliente. Los eventos se deduplican en una función transaccional y no acortan accidentalmente un periodo ya pagado. Una URL de retorno exitosa nunca activa por sí sola la suscripción.

La edición enviada y leída parte de la misma versión guardada. Editar un borrador aprobado o programado elimina la aprobación; una edición en envío/publicada no se puede editar desde este panel. Las correcciones posteriores se publican como nueva edición en esta primera versión.

## Operación editorial

1. Escribir un tema y enfoque en el panel para recibir un borrador asistido, o pegar investigación propia. El asistente exige al menos dos fuentes citadas de HTTPS y muestra su revisión automática. Sus alertas son orientativas: el editor abre los enlaces y contrasta cifras, fechas, cálculos y condiciones con los documentos originales.
2. Completar título, resumen, texto plano, autor real y fuentes HTTPS (una por línea, `Título | URL`). El texto generado no se guarda solo; se pierde al salir si no se guarda.
3. Guardar. Previsualizar el correo y enviarse una prueba.
4. Confirmar revisión de fuentes y cálculos, aprobar la versión y programar fecha/hora. El control usa la zona horaria del dispositivo y guarda UTC; la pantalla indica esa convención.
5. La tarea programada sincroniza elegibles, crea una campaña, registra su ID y solicita el envío. Una ejecución posterior confirma el estado `sent` y habilita la edición publicada en la app.
6. Si no hay destinatarios elegibles, se publica en la app sin enviar campaña.

La aprobación humana es obligatoria. El asistente no recibe datos de cuentas ni movimientos financieros. Usa la API de OpenAI con `store: false`; la búsqueda y la generación pueden tener costos. Los enlaces citados proceden de anotaciones de búsqueda, pero una cita no prueba por sí sola que el borrador sea correcto.

## Arquitectura de contenido autónoma

**Etapa implementada:** un editor inicia una corrida desde el panel. Investigación web → extracción de enlaces citados → redacción → revisión de consistencia → borrador editable → revisión, aprobación y programación humanas. El endpoint `POST /api/newsletter/admin/ai-draft` requiere autenticación y permiso editorial (UUID autorizado o rol admin); el límite de solicitudes controla el gasto. Si la búsqueda no devuelve al menos dos fuentes citadas, no se genera texto. No se añaden tablas ni se hacen cambios remotos en esta etapa.

**Siguiente etapa para autosuficiencia:** cola persistente de temas y criterios editoriales; calendario de tres ediciones por mes; ejecución programada con deduplicación, presupuesto y reintentos acotados; expediente por corrida con prompts versionados, enlaces, fechas, modelo, costo y alertas; estado `needs_human_review` como límite obligatorio antes de crear/aprobar una edición. Los agentes podrán proponer temas de forma automática, pero nunca activar cobros, conceder accesos, aprobar ni publicar. Este trabajo requiere una migración nueva, reconciliar antes el historial de Supabase y definir respaldos (D14).

## Recuperación de incidentes

Si hay un error o respuesta incierta de Resend, la edición pasa a revisión y bloquea nuevas campañas del segmento para evitar envíos duplicados o cambios de audiencia mientras un envío pudiera seguir activo. «Actualizar envíos» consulta la campaña registrada; si ya fue enviada, finaliza la publicación sin reenviar.

Si un proceso se interrumpe antes de registrar el ID de campaña, o la campaña permanece en borrador/fallida, un operador debe revisar Resend y los registros antes de liberar el estado en la base de datos. No hay reintento automático de campañas ambiguas. Esta intervención excepcional se documenta en vez de ofrecer un botón que pueda duplicar un envío.

La sincronización de contactos es secuencial y está orientada al piloto y a una lista inicial pequeña. Para cientos o miles de destinatarios, moverla a trabajos con progreso persistido/cola y revisar tiempos del servidor antes de ampliar. Los resultados detallados de entrega, rebotes y quejas están en Resend.

## Pruebas reproducibles

Backend:

```sh
cd backend
npm run build
npm run test:newsletter
```

Frontend:

```sh
cd frontend
npm run type-check
npm test -- src/pages/newsletter/Newsletter.test.tsx src/pages/newsletter/NewsletterAdmin.test.tsx src/lib/newsletter.test.ts
npx eslint src/pages/newsletter src/components/layout/AppNavbar.tsx
npm run build
```

Las pruebas HTTP usan un servidor local y un adaptador en memoria; no realizan cobros ni envíos. Cubren permisos, muestras, contenido de pago, vencimiento, gracia, piloto, firma/tampering/replay y HTML seguro. La generación se prueba con respuestas simuladas, no con una clave real. La interfaz prueba invitados, consentimiento, cambios de cuenta, búsqueda y el borrador editorial.

Antes de producción falta probar las funciones transaccionales y la concurrencia en un entorno de pruebas; completar un ciclo con Stripe de prueba (incluida renovación, cancelación y fallo); validar una campaña con buzones propios en Resend; y ejecutar una generación editorial con una clave de API real. La migración 004, RLS y acceso REST se verificaron en el proyecto remoto el 28 de septiembre, pero estas pruebas locales no certifican los servicios externos.
