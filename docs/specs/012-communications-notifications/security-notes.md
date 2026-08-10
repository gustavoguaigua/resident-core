# Security Notes — Spec 012 Communications and Notifications

## 1. Información del documento

| Campo           | Valor                                                                                                             |
| --------------- | ----------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                     |
| Spec ID         | 012                                                                                                               |
| Módulo          | Communications and Notifications                                                                                  |
| Documento       | Security Notes                                                                                                    |
| Ruta            | `docs/specs/012-communications-notifications/security-notes.md`                                                   |
| Versión         | 0.1                                                                                                               |
| Estado          | needs-review                                                                                                      |
| Fecha           | 2026-07-19                                                                                                        |
| Documento base  | `docs/specs/012-communications-notifications/spec.md`                                                             |
| Plan técnico    | `docs/specs/012-communications-notifications/plan.md`                                                             |
| Modelo de datos | `docs/specs/012-communications-notifications/data-model.md`                                                       |
| Contrato API    | `docs/specs/012-communications-notifications/api-contract.md`                                                     |
| Plan de pruebas | `docs/specs/012-communications-notifications/test-plan.md`                                                        |
| Tareas          | `docs/specs/012-communications-notifications/tasks.md`                                                            |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `007-audit`, `009-wordpress-integration-basic`      |
| Relacionado con | `004-dues-fees`, `005-payments`, `006-account-statements`, `010-reservations-common-areas`, `011-fines-sanctions` |

---

## 2. Propósito

Este documento define las notas de seguridad específicas del módulo `012-communications-notifications`.

El módulo gestiona comunicados, destinatarios, lecturas, plantillas, notificaciones, intentos de entrega, preferencias de notificación y exposición pública controlada de comunicados hacia WordPress.

Regla central:

```text id="i21qld"
Toda comunicación o notificación debe proteger tenant isolation, audiencia, visibilidad, autorización por recurso, privacidad del destinatario, seguridad del canal, idempotencia, trazabilidad y exposición pública mínima.
```

---

## 3. Naturaleza de seguridad del módulo

El módulo `Communications and Notifications` debe tratarse como un módulo sensible porque puede contener o transportar:

* información administrativa del conjunto;
* avisos operativos;
* información financiera resumida;
* información de reservas;
* información de multas;
* mensajes de seguridad;
* destinatarios internos;
* preferencias de usuario;
* emails y teléfonos de contacto;
* trazabilidad de lectura;
* fallos de entrega;
* datos de canales externos;
* URLs de acción hacia recursos privados.

Por tanto, el módulo debe proteger:

```text id="mw2qh2"
tenant isolation
audience confidentiality
notification privacy
public/private content separation
recipient privacy
delivery destination masking
template safety
channel safety
preference integrity
delivery traceability
auditability
safe logs
safe metrics
WordPress public-safe exposure
```

---

## 4. Principios de seguridad

### 4.1. Tenant isolation obligatorio

Toda entidad tenant-scoped debe contener y validar `tenant_id`.

Aplica a:

```text id="vmjnwx"
communications
communication_recipients
communication_read_receipts
notification_templates cuando tenant_id no es null
notifications
notification_delivery_attempts
notification_preferences
```

Regla obligatoria:

```text id="bay9gf"
resource.tenantId == currentTenant.id
```

No se acepta:

```text id="kqaz30"
consultar communication solo por id
consultar notification solo por id
consultar preference solo por id
consultar deliveryAttempt solo por id
crear recipient con userId de otro tenant
crear recipient con personId de otro tenant
crear recipient con propertyUnitId de otro tenant
crear recipient con roleId de otro tenant
crear notification para userId de otro tenant
crear notification asociada a propertyUnitId de otro tenant
consultar announcement de tenant B usando slug de tenant A
```

---

### 4.2. Keycloak autentica; RESIDENT Core autoriza

La autenticación no es suficiente para acceder a comunicaciones o notificaciones.

Regla:

```text id="ox9ibc"
Keycloak autentica la identidad; RESIDENT Core autoriza el tenant, el permiso, la audiencia, el destinatario, el recurso y la acción.
```

El módulo debe validar:

* usuario autenticado;
* membership activa;
* tenant activo;
* permisos funcionales;
* acceso a audiencia;
* acceso a recurso propio;
* destinatario de notificación;
* visibilidad del comunicado;
* política pública;
* preferencias aplicables;
* canal habilitado;
* trazabilidad.

---

### 4.3. Separación estricta entre contenido público y privado

El módulo maneja comunicaciones privadas y públicas. La separación debe ser explícita.

Un comunicado solo puede exponerse públicamente si cumple:

```text id="dwmumw"
tenant.status = active
communication.status = published
communication.visibility = public
communication.isPublicVisible = true
communication.archivedAt IS NULL
communication.expiresAt IS NULL OR communication.expiresAt > now()
```

Todo lo demás debe considerarse privado o interno.

---

### 4.4. WordPress solo consume comunicados públicos

WordPress puede consumir únicamente:

```text id="z4n0qj"
GET /api/v1/public/tenants/{slug}/announcements
GET /api/v1/public/tenants/{slug}/announcements/{communicationSlug}
```

WordPress no debe consumir:

```text id="w875ft"
notifications
notification_preferences
communication_recipients
communication_read_receipts
notification_delivery_attempts
private communications
tenant communications
internal communications
financial private details
fine private details
reservation private details
```

---

### 4.5. Notificaciones privadas por defecto

Toda notificación es privada por defecto.

Regla:

```text id="opl2m4"
notification.recipientUserId == currentUser.id
```

para endpoints `/me`.

Un usuario no debe poder:

```text id="v4t9lu"
ver notificaciones ajenas
marcar notificaciones ajenas como leídas
consultar delivery attempts de otro usuario
consultar preferencias de otro usuario
modificar preferencias de otro usuario
```

---

### 4.6. Audiencia controlada

Todo comunicado no público debe tener audiencia explícita.

Tipos de audiencia:

```text id="c7mu86"
allTenantUsers
owners
residents
propertyUnits
roles
specificUsers
mixed
```

Cada referencia de audiencia debe validarse contra el tenant.

No se acepta:

```text id="pjwmb1"
roleId de otro tenant
userId de otro tenant
personId de otro tenant
propertyUnitId de otro tenant
audiencia vacía en comunicado privado/interno/tenant
audiencia sin validación de membresía
```

---

### 4.7. Minimización de datos por canal

Las notificaciones no deben transportar datos sensibles innecesarios.

Ejemplo seguro:

```text id="a8ir5d"
Tiene una nueva notificación disponible en RESIDENT Core.
```

Ejemplo no seguro:

```text id="twrvd4"
Su saldo exacto, detalle de multa, evidencia, unidad y datos personales enviados por email o WhatsApp.
```

Regla:

```text id="k9rgq3"
Mientras más externo sea el canal, menor debe ser el detalle incluido.
```

---

### 4.8. Destinos externos enmascarados

Los intentos de entrega deben registrar destinos enmascarados.

Permitido:

```text id="sl0dms"
g*****o@example.com
+593*******321
```

Prohibido:

```text id="cqa8dp"
gustavo@example.com
+593987654321
```

El destino completo solo puede existir temporalmente en memoria durante el envío.

---

### 4.9. Idempotencia obligatoria

Las notificaciones generadas por evento deben ser idempotentes.

Formato recomendado:

```text id="jrgqse"
notification:{sourceType}:{sourceId}:{recipientUserId}:{channel}
```

Regla:

```text id="jj8xro"
El mismo evento no debe crear múltiples notificaciones equivalentes para el mismo usuario y canal.
```

---

### 4.10. Fallos de proveedor aislados

La caída de email, WhatsApp futuro, SMS futuro, push futuro o webhook futuro no debe romper la transacción principal de negocio.

Regla:

```text id="zqs9y6"
El dominio principal genera el evento; el módulo de comunicaciones intenta entregar sin revertir la operación de negocio principal.
```

---

### 4.11. Auditoría obligatoria

Se deben auditar operaciones críticas:

```text id="bwepyg"
communication.created
communication.updated
communication.scheduled
communication.published
communication.cancelled
communication.archived
communication.audienceUpdated
communication.publicVisibilityChanged
communication.read
notificationTemplate.created
notificationTemplate.updated
notificationTemplate.activated
notificationTemplate.deactivated
notificationTemplate.archived
notification.created
notification.sent
notification.delivered
notification.failed
notification.read
notification.cancelled
notification.retryScheduled
notificationDeliveryAttempt.created
notificationDeliveryAttempt.failed
notificationPreference.updated
```

---

### 4.12. No uso de IA externa con datos reales

No se debe enviar contenido real de comunicaciones, notificaciones, destinatarios, preferencias, emails, teléfonos o información transaccional a herramientas externas de IA sin anonimización y autorización explícita.

---

## 5. Activos protegidos

### 5.1. Activos de comunicación

```text id="jsdj9z"
communications.title
communications.summary
communications.body
communications.visibility
communications.audienceType
communications.isPublicVisible
communications.coverImageUrl
communications.metadata
```

---

### 5.2. Activos de audiencia

```text id="nbnsy1"
communication_recipients.userId
communication_recipients.personId
communication_recipients.propertyUnitId
communication_recipients.roleId
communication_recipients.recipientType
```

---

### 5.3. Activos de lectura

```text id="nf9klh"
communication_read_receipts.userId
communication_read_receipts.communicationId
communication_read_receipts.readAt
```

---

### 5.4. Activos de plantilla

```text id="dq6dto"
notification_templates.code
notification_templates.subjectTemplate
notification_templates.bodyTemplate
notification_templates.variablesSchema
notification_templates.isSystem
```

---

### 5.5. Activos de notificación

```text id="qoe4y4"
notifications.recipientUserId
notifications.recipientPersonId
notifications.propertyUnitId
notifications.sourceType
notifications.sourceId
notifications.title
notifications.body
notifications.actionUrl
notifications.idempotencyKey
notifications.metadata
```

---

### 5.6. Activos de entrega

```text id="p002ts"
notification_delivery_attempts.channel
notification_delivery_attempts.provider
notification_delivery_attempts.destinationMasked
notification_delivery_attempts.providerMessageId
notification_delivery_attempts.errorCode
notification_delivery_attempts.errorMessage
notification_delivery_attempts.metadata
```

---

### 5.7. Activos de preferencias

```text id="sqf7gp"
notification_preferences.userId
notification_preferences.category
notification_preferences.channel
notification_preferences.isEnabled
```

---

## 6. Clasificación de datos

### 6.1. Datos públicos permitidos

Solo para comunicados públicos:

```text id="povrpr"
publicId
slug
title
summary
body
category
priority
coverImageUrl
publishedAt
expiresAt
tenantSlug
```

---

### 6.2. Datos internos administrativos

```text id="pjlxgf"
communication internal id
createdBy
updatedBy
publishedBy
archivedBy
audienceType
recipients
readReceipts
metadata interna
notification templates
delivery attempts
preference records
```

---

### 6.3. Datos privados del usuario

```text id="rzz4q7"
notifications propias
communication read receipts propias
notification preferences propias
actionUrl hacia recursos privados
```

---

### 6.4. Datos sensibles de canal

```text id="wypi2c"
email completo
teléfono completo
provider credentials
provider raw response
provider message ids
delivery errors
```

Estos datos deben manejarse con minimización, masking y sanitización.

---

### 6.5. Datos prohibidos en endpoints públicos

```text id="skngkk"
tenant internal id
communication internal id si permite enumeración
recipients
userIds
personIds
propertyUnitIds
roleIds
createdBy
updatedBy
publishedBy
readReceipts
notifications
deliveryAttempts
preferences
audit data
metadata interna
datos financieros privados
datos de multas
datos de pagos
datos de reservas privadas
evidencias
emails
teléfonos
```

---

## 7. Superficies de ataque

### 7.1. Communications administrativas

Endpoints:

```text id="d80cbv"
GET    /api/v1/tenant/communications
POST   /api/v1/tenant/communications
GET    /api/v1/tenant/communications/{communicationId}
PATCH  /api/v1/tenant/communications/{communicationId}
POST   /api/v1/tenant/communications/{communicationId}/publish
POST   /api/v1/tenant/communications/{communicationId}/schedule
POST   /api/v1/tenant/communications/{communicationId}/cancel
POST   /api/v1/tenant/communications/{communicationId}/archive
```

Riesgos:

* comunicación cross-tenant;
* escalamiento de permisos;
* publicación accidental de contenido privado;
* inyección de contenido;
* modificación de comunicado ya publicado;
* cambio malicioso de visibilidad;
* slug duplicado o enumeración;
* logs con body completo.

Controles:

```text id="q7li13"
AuthGuard
TenantGuard
TenantPermissionGuard
tenant_id filter
state machine
content sanitizer
public visibility validation
safe DTOs
audit events
safe logs
```

---

### 7.2. Audiencia y recipients

Endpoints:

```text id="e77ysm"
GET /api/v1/tenant/communications/{communicationId}/recipients
PUT /api/v1/tenant/communications/{communicationId}/recipients
```

Riesgos:

* destinatarios de otro tenant;
* envío a usuario equivocado;
* exposición de lista de usuarios;
* enumeración de unidades;
* segmentación incorrecta;
* manipulación de audiencia después de publicación.

Controles:

```text id="kycpva"
CommunicationAudienceService
tenant validation
recipient validation
permission guard
state validation
no public recipients
audit communication.audienceUpdated
```

---

### 7.3. Communications propias

Endpoints:

```text id="q7uqbu"
GET    /api/v1/me/communications
GET    /api/v1/me/communications/{communicationId}
POST   /api/v1/me/communications/{communicationId}/mark-read
```

Riesgos:

* usuario lee comunicado no dirigido;
* usuario marca lectura de comunicado ajeno;
* inferencia de comunicaciones internas;
* exposición de recipients;
* exposición de metadata interna.

Controles:

```text id="nftvqk"
OwnCommunicationGuard
audience resolution
active membership validation
safe own DTO
read receipt idempotency
safe 404/403
```

---

### 7.4. Public Announcements WordPress

Endpoints:

```text id="z7kkry"
GET /api/v1/public/tenants/{slug}/announcements
GET /api/v1/public/tenants/{slug}/announcements/{communicationSlug}
```

Riesgos:

* exposición de comunicado privado;
* exposición de destinatarios;
* exposición de metadata interna;
* scraping;
* enumeración de tenants;
* caché de contenido no público;
* CORS permisivo.

Controles:

```text id="gw7j75"
PublicTenantResolver
tenant active validation
public-safe filter
safe public DTO
CORS allowlist
rate limiting
public cache only for public data
no private metadata
no recipients
```

---

### 7.5. Notification Templates

Endpoints:

```text id="ymiklc"
GET    /api/v1/tenant/notification-templates
POST   /api/v1/tenant/notification-templates
GET    /api/v1/tenant/notification-templates/{templateId}
PATCH  /api/v1/tenant/notification-templates/{templateId}
POST   /api/v1/tenant/notification-templates/{templateId}/activate
POST   /api/v1/tenant/notification-templates/{templateId}/deactivate
POST   /api/v1/tenant/notification-templates/{templateId}/archive
```

Riesgos:

* inyección de plantilla;
* variables no declaradas;
* edición de plantilla de sistema;
* uso de plantilla inactiva;
* exposición de plantillas globales;
* envío de datos sensibles por plantilla.

Controles:

```text id="s49qc1"
template code validation
variablesSchema validation
template rendering sanitizer
system template protection
active template check
tenant/global scope validation
audit events
```

---

### 7.6. Notifications administrativas

Endpoints:

```text id="fgvv05"
GET    /api/v1/tenant/notifications
POST   /api/v1/tenant/notifications
GET    /api/v1/tenant/notifications/{notificationId}
POST   /api/v1/tenant/notifications/{notificationId}/send
POST   /api/v1/tenant/notifications/{notificationId}/retry
POST   /api/v1/tenant/notifications/{notificationId}/cancel
GET    /api/v1/tenant/notifications/{notificationId}/delivery-attempts
```

Riesgos:

* notificación enviada a usuario incorrecto;
* destinatario de otro tenant;
* duplicación masiva;
* reintentos infinitos;
* exposure de destino completo;
* exposure de provider raw response;
* provider externo caído;
* preferencias ignoradas indebidamente;
* mandatory bloqueado indebidamente.

Controles:

```text id="myx0o2"
tenant validation
recipient validation
NotificationChannelPolicyService
NotificationIdempotencyService
DestinationMaskingService
maxAttempts
delivery attempts
provider abstraction
safe errors
audit events
```

---

### 7.7. Notifications propias

Endpoints:

```text id="tzebdp"
GET    /api/v1/me/notifications
GET    /api/v1/me/notifications/{notificationId}
POST   /api/v1/me/notifications/{notificationId}/mark-read
POST   /api/v1/me/notifications/mark-all-read
```

Riesgos:

* usuario consulta notificación ajena;
* usuario marca ajena como leída;
* exposición de metadata interna;
* exposición de delivery attempts;
* exposición de recipientUserId;
* acción sobre tenant incorrecto.

Controles:

```text id="jxfek0"
OwnNotificationGuard
recipientUserId validation
tenant filter
safe own DTO
idempotent mark-read
safe 404/403
```

---

### 7.8. Notification Preferences

Endpoints:

```text id="yo51z5"
GET   /api/v1/me/notification-preferences
PUT   /api/v1/me/notification-preferences
PATCH /api/v1/me/notification-preferences/{preferenceId}
```

Riesgos:

* usuario modifica preferencias ajenas;
* usuario bloquea notificaciones obligatorias;
* usuario bloquea seguridad;
* preferencia cross-tenant;
* configuración inconsistente por canal.

Controles:

```text id="bmsad5"
NotificationPreferenceGuard
own-resource validation
mandatory/security lock
tenant filter
audit notificationPreference.updated
```

---

## 8. Amenazas principales

## 8.1. Comunicación cross-tenant

### Descripción

Un usuario de Tenant A consulta, modifica, publica o archiva comunicados de Tenant B.

### Impacto

Crítico.

### Controles

```text id="d0w1uk"
tenant_id obligatorio
TenantGuard
repository tenant filter
safe 404/403
multitenancy tests
```

### Criterio

```text id="p7jql1"
Ningún endpoint administrativo, propio o público debe devolver comunicaciones de otro tenant.
```

---

## 8.2. Exposición pública de comunicado privado

### Descripción

Un comunicado con visibilidad `private`, `internal` o `tenant` aparece en WordPress.

### Impacto

Crítico.

### Controles

```text id="s4k7li"
PublicAnnouncementService
visibility = public
status = published
isPublicVisible = true
tenant active
expiresAt validation
public safety tests
OpenAPI negative tests
```

---

## 8.3. Exposición pública de notificaciones

### Descripción

Se crea o documenta un endpoint público para notificaciones.

### Impacto

Crítico.

### Controles

```text id="iaeb6n"
no public notification routes
route registry review
OpenAPI negative tests
security tests
CI gate
```

---

## 8.4. Usuario lee notificación ajena

### Descripción

Un usuario consulta o marca como leída una notificación cuyo `recipientUserId` no le corresponde.

### Impacto

Crítico.

### Controles

```text id="m9km3n"
OwnNotificationGuard
recipientUserId = actorUserId
tenant filter
safe 404/403
own-resource tests
```

---

## 8.5. Destinatario equivocado

### Descripción

El sistema envía comunicación o notificación a un usuario no perteneciente a la audiencia correcta.

### Impacto

Alto.

### Controles

```text id="gv0kyt"
CommunicationAudienceService
recipient tenant validation
membership validation
deduplication
audience tests
```

---

## 8.6. Recipient de otro tenant

### Descripción

Un administrador de Tenant A agrega como destinatario a usuarios, personas, unidades o roles de Tenant B.

### Impacto

Crítico.

### Controles

```text id="tue8rl"
CommunicationUserDirectoryPort
CommunicationPropertyUnitPort
role tenant validation
cross-tenant reference tests
```

---

## 8.7. Inyección en contenido o plantillas

### Descripción

Un comunicado o plantilla contiene scripts, HTML activo, handlers inline o URLs peligrosas.

### Impacto

Alto.

### Controles

```text id="xlusxu"
CommunicationContentSanitizerService
NotificationRenderingService
HTML allowlist
script blocking
template variablesSchema
sanitization tests
```

---

## 8.8. Duplicidad masiva de notificaciones

### Descripción

Un mismo evento genera múltiples notificaciones repetidas para el mismo usuario y canal.

### Impacto

Medio / Alto.

### Controles

```text id="ue06ix"
idempotencyKey
unique tenantId + idempotencyKey
NotificationIdempotencyService
event replay tests
```

---

## 8.9. Reintentos infinitos

### Descripción

Un canal externo fallido reintenta indefinidamente y genera carga o spam.

### Impacto

Medio / Alto.

### Controles

```text id="z7y2yg"
maxAttempts = 3
attemptNumber validation
retry policy
dead-letter futuro
delivery tests
```

---

## 8.10. Fuga de emails o teléfonos

### Descripción

Los intentos de entrega, logs, auditoría o respuestas API contienen email o teléfono completo.

### Impacto

Alto.

### Controles

```text id="wx0g5r"
DestinationMaskingService
destinationMasked only
no full destination persistence
safe logs
safe audit metadata
security tests
```

---

## 8.11. Provider credentials leak

### Descripción

Credenciales SMTP, SES, SendGrid, WhatsApp, SMS o push se guardan en metadata, logs o responses.

### Impacto

Crítico.

### Controles

```text id="u5zl6s"
provider abstraction
secret manager
no credentials in metadata
redaction
observability tests
```

---

## 8.12. Preferencias mal aplicadas

### Descripción

El sistema permite desactivar notificaciones obligatorias o ignora preferencias informativas.

### Impacto

Medio / Alto.

### Controles

```text id="ufwfiz"
NotificationChannelPolicyService
mandatory/security lock
preference tests
audit preference changes
```

---

## 8.13. Provider externo bloquea flujo principal

### Descripción

Una caída del proveedor de email bloquea pagos, multas, reservas o estados de cuenta.

### Impacto

Alto.

### Controles

```text id="v2y9te"
delivery async/queue-ready
noop provider
failure isolation
delivery attempts
safe retries
```

---

## 8.14. Logs con contenido privado

### Descripción

Logs contienen body completo de comunicado privado, body de notificación, emails, teléfonos, tokens o errores raw.

### Impacto

Alto.

### Controles

```text id="kd2cod"
structured logging
redaction
metadata minimization
no raw provider response
observability tests
```

---

## 9. Controles por entidad

## 9.1. Communication

Campos sensibles:

```text id="wz0ng6"
body
summary
visibility
audienceType
isPublicVisible
metadata
createdBy
updatedBy
publishedBy
```

Controles:

* `tenantId` obligatorio.
* `title` validado.
* `body` sanitizado.
* `visibility` controlada.
* `isPublicVisible` permitido solo si `visibility = public`.
* `status = published` requerido para público.
* `expiresAt` validado.
* `metadata` sanitizada.
* No delete físico.
* Auditoría en creación, actualización, publicación, cancelación y archivo.

---

## 9.2. CommunicationRecipient

Campos sensibles:

```text id="duesym"
userId
personId
propertyUnitId
roleId
recipientType
```

Controles:

* Referencias validadas contra tenant.
* No exposición pública.
* Reemplazo solo en estados permitidos.
* Auditoría de cambio de audiencia.
* No delete físico ordinario.

---

## 9.3. CommunicationReadReceipt

Campos sensibles:

```text id="gytv4t"
communicationId
userId
readAt
```

Controles:

* Usuario solo marca lectura si tiene acceso.
* Idempotencia por `tenantId + communicationId + userId`.
* No exposición pública.
* Consulta administrativa con permiso.
* Auditoría si aplica.

---

## 9.4. NotificationTemplate

Campos sensibles:

```text id="gg2xve"
subjectTemplate
bodyTemplate
variablesSchema
isSystem
```

Controles:

* `code` validado.
* `variablesSchema` obligatorio o controlado.
* Variables no declaradas prohibidas.
* Sanitización de salida.
* `subjectTemplate` requerido para email.
* Plantilla inactiva no usable.
* Plantilla de sistema protegida.

---

## 9.5. Notification

Campos sensibles:

```text id="v6a5a7"
recipientUserId
recipientPersonId
propertyUnitId
sourceType
sourceId
title
body
actionUrl
idempotencyKey
metadata
```

Controles:

* `recipientUserId` validado contra tenant.
* Endpoints `/me` validan `recipientUserId = currentUser.id`.
* No endpoints públicos.
* `actionUrl` debe ser relativa o allowlisted.
* `metadata` sanitizada.
* Idempotencia.
* Auditoría.

---

## 9.6. NotificationDeliveryAttempt

Campos sensibles:

```text id="uuuiow"
provider
destinationMasked
providerMessageId
errorCode
errorMessage
metadata
```

Controles:

* `destinationMasked` obligatorio en canales externos.
* No guardar destino completo.
* No guardar credenciales.
* No guardar raw provider response.
* `errorMessage` sanitizado.
* `attemptNumber >= 1`.
* Max attempts controlado.
* Auditoría de fallos.

---

## 9.7. NotificationPreference

Campos sensibles:

```text id="x3nn13"
userId
category
channel
isEnabled
```

Controles:

* Usuario solo consulta/modifica propias.
* Tenant filter obligatorio.
* Mandatory/security lock.
* Auditoría de cambios.

---

## 10. Reglas de autorización

### 10.1. Comunicados administrativos

| Acción                | Permiso                         |
| --------------------- | ------------------------------- |
| Crear comunicado      | `communications.create`         |
| Consultar comunicados | `communications.read`           |
| Actualizar comunicado | `communications.update`         |
| Publicar comunicado   | `communications.publish`        |
| Programar comunicado  | `communications.publish`        |
| Cancelar comunicado   | `communications.cancel`         |
| Archivar comunicado   | `communications.archive`        |
| Gestionar audiencia   | `communications.manageAudience` |
| Consultar lecturas    | `communications.read`           |

---

### 10.2. Comunicados propios

| Acción                              | Permiso                       |
| ----------------------------------- | ----------------------------- |
| Consultar mis comunicados           | `communications.read.own`     |
| Marcar comunicado propio como leído | `communications.markRead.own` |

---

### 10.3. Plantillas

| Acción                       | Permiso                         |
| ---------------------------- | ------------------------------- |
| Crear plantilla              | `notificationTemplates.create`  |
| Consultar plantilla          | `notificationTemplates.read`    |
| Actualizar plantilla         | `notificationTemplates.update`  |
| Activar/desactivar plantilla | `notificationTemplates.update`  |
| Archivar plantilla           | `notificationTemplates.archive` |

---

### 10.4. Notificaciones administrativas

| Acción                        | Permiso                              |
| ----------------------------- | ------------------------------------ |
| Crear notificación            | `notifications.create`               |
| Consultar notificaciones      | `notifications.read`                 |
| Enviar notificación           | `notifications.send`                 |
| Reintentar notificación       | `notifications.retry`                |
| Cancelar notificación         | `notifications.cancel`               |
| Consultar intentos de entrega | `notifications.readDeliveryAttempts` |

---

### 10.5. Notificaciones propias

| Acción                                      | Permiso                      |
| ------------------------------------------- | ---------------------------- |
| Consultar mis notificaciones                | `notifications.read.own`     |
| Marcar mi notificación como leída           | `notifications.markRead.own` |
| Marcar todas mis notificaciones como leídas | `notifications.markRead.own` |

---

### 10.6. Preferencias propias

| Acción                      | Permiso                              |
| --------------------------- | ------------------------------------ |
| Consultar mis preferencias  | `notificationPreferences.read.own`   |
| Actualizar mis preferencias | `notificationPreferences.update.own` |

---

## 11. Reglas de endpoints públicos

### 11.1. Permitidos

```text id="e4veaz"
GET /api/v1/public/tenants/{slug}/announcements
GET /api/v1/public/tenants/{slug}/announcements/{communicationSlug}
```

---

### 11.2. Prohibidos

```text id="xgr9zz"
GET /api/v1/public/tenants/{slug}/notifications
GET /api/v1/public/tenants/{slug}/notification-preferences
GET /api/v1/public/tenants/{slug}/communications/{id}/recipients
GET /api/v1/public/tenants/{slug}/communications/{id}/read-receipts
GET /api/v1/public/tenants/{slug}/notifications/{id}/delivery-attempts
POST /api/v1/public/tenants/{slug}/notifications
POST /api/v1/public/tenants/{slug}/communications/{id}/mark-read
```

---

### 11.3. DTO público permitido

```text id="uad2lz"
publicId
slug
title
summary
body
category
priority
coverImageUrl
publishedAt
expiresAt
tenantSlug
```

---

### 11.4. DTO público prohibido

```text id="emf3lo"
id interno
tenantId interno
recipients
userIds
personIds
propertyUnitIds
roleIds
createdBy
updatedBy
publishedBy
archivedBy
readReceipts
notifications
deliveryAttempts
preferences
metadata interna
audit data
```

---

## 12. Reglas de endpoints `/me`

### 12.1. Comunicados propios

Debe validar:

```text id="mnof4s"
authenticated user
active tenant membership
communications.read.own
communication.status = published
communication accessible by audience
communication.archivedAt IS NULL
tenant_id match
```

No debe devolver:

```text id="c1tqvg"
recipients
metadata interna
createdBy
updatedBy
publishedBy
readReceipts de otros usuarios
audit data
```

---

### 12.2. Notificaciones propias

Debe validar:

```text id="hqvtga"
authenticated user
active tenant membership
notifications.read.own
notification.recipientUserId = currentUser.id
notification.tenantId = currentTenant.id
```

No debe devolver:

```text id="a07oeo"
recipientUserId
recipientPersonId si no corresponde
deliveryAttempts
provider data
destinationMasked
idempotencyKey
metadata interna
audit data
```

---

### 12.3. Preferencias propias

Debe validar:

```text id="gwfk7w"
preference.userId = currentUser.id
preference.tenantId = currentTenant.id
```

No debe permitir:

```text id="i4mf0m"
actualizar userId
actualizar tenantId
modificar preferencias de otro usuario
bloquear mandatory/security sin política explícita
```

---

## 13. Reglas de plantillas

### 13.1. Seguridad de variables

Toda variable usada en una plantilla debe estar declarada en `variablesSchema`.

Prohibido:

```text id="g5fbo9"
variables no declaradas
variables faltantes sin fallback seguro
renderizar HTML sin sanitización
inyectar scripts
inyectar URLs javascript:
inyectar iframes
```

---

### 13.2. Plantillas email

`subjectTemplate` es obligatorio para canal `email`.

Regla:

```text id="l1pqja"
channel = email implica subjectTemplate requerido.
```

---

### 13.3. Plantillas de sistema

Las plantillas `isSystem = true` no deben modificarse por usuarios ordinarios.

Requieren permiso elevado o proceso de plataforma.

---

### 13.4. Plantillas inactivas

No se permite usar plantillas con:

```text id="lx6yn2"
status = inactive
status = archived
```

---

## 14. Reglas de canales

### 14.1. Canal in-app

Canal base del MVP.

Controles:

* no requiere proveedor externo;
* se entrega dentro del sistema autenticado;
* visible solo al usuario destinatario;
* `readAt` solo por destinatario;
* puede registrarse como `delivered`.

---

### 14.2. Canal email

MVP opcional mediante provider mock/noop o adaptador.

Controles:

```text id="c5v5au"
provider configured validation
recipient email validation
preference validation
destination masking
delivery attempt
safe error
no raw provider response
no provider credentials
```

---

### 14.3. Canales diferidos

```text id="jbqbyl"
whatsapp
sms
push
webhook
```

Regla:

```text id="v8ugjc"
Los enums pueden existir, pero no debe implementarse proveedor real sin spec adicional.
```

---

### 14.4. Fallback seguro

Si un canal externo falla:

```text id="yoplp8"
registrar failed o skipped
auditar fallo relevante
no romper transacción principal
no perder notificación lógica
permitir retry controlado
```

---

## 15. Reglas de preferencias

### 15.1. Preferencias permitidas

Un usuario puede configurar:

```text id="wa12bd"
category
channel
isEnabled
```

para sus propias preferencias.

---

### 15.2. Categorías obligatorias

Categorías que pueden no ser desactivables:

```text id="x23be1"
mandatory
security
financial crítico según política
```

---

### 15.3. Regla de bloqueo

```text id="g9fi51"
Si una categoría es obligatoria por política, el usuario no puede desactivar su canal obligatorio.
```

---

### 15.4. Auditoría

Cambios de preferencia deben auditarse sin registrar datos privados innecesarios.

---

## 16. Reglas de delivery attempts

### 16.1. Datos permitidos

```text id="barxc6"
notificationId
channel
provider
destinationMasked
status
attemptNumber
providerMessageId sanitizado
errorCode
errorMessage sanitizado
attemptedAt
deliveredAt
failedAt
```

---

### 16.2. Datos prohibidos

```text id="kh4cs4"
email completo
teléfono completo
provider credentials
provider raw response completo
access token
refresh token
API key
SMTP password
webhook secret
authorization header
cookies
body completo privado
```

---

### 16.3. Reintentos

Regla MVP:

```text id="er5psn"
maxAttempts = 3
```

No se acepta:

```text id="uuqce3"
reintentos infinitos
retry que duplique Notification
retry sin deliveryAttempt
retry sin auditoría
retry sin rate limiting
```

---

## 17. Reglas de idempotencia

### 17.1. Idempotency key

Formato recomendado:

```text id="kfkp8a"
notification:{sourceType}:{sourceId}:{recipientUserId}:{channel}
```

Ejemplos:

```text id="vedf33"
notification:payment:payment_uuid:user_uuid:inApp
notification:reservation:reservation_uuid:user_uuid:email
notification:fine:fine_uuid:user_uuid:inApp
notification:communication:communication_uuid:user_uuid:inApp
```

---

### 17.2. Regla de duplicidad

```text id="trhxn6"
Si existe una Notification activa con la misma idempotencyKey, no crear otra.
```

---

### 17.3. Separación entre Notification y DeliveryAttempt

```text id="y41514"
Notification = mensaje lógico.
DeliveryAttempt = intento de entrega.
```

Una notificación puede tener múltiples intentos, pero no debe duplicarse el mensaje lógico.

---

## 18. Reglas de auditoría

### 18.1. Metadata permitida

```json id="d61vp0"
{
  "communicationId": "communication_uuid",
  "notificationId": "notification_uuid",
  "templateId": "template_uuid",
  "recipientUserId": "user_uuid",
  "recipientType": "user",
  "category": "reservation",
  "channel": "inApp",
  "status": "published",
  "fromStatus": "draft",
  "toStatus": "published",
  "sourceType": "reservation",
  "sourceId": "reservation_uuid",
  "traceId": "req_123456"
}
```

---

### 18.2. Metadata prohibida

```text id="paj7w2"
payload completo
body completo privado
emails completos
teléfonos completos
tokens
secretos
cookies
Authorization header
provider credentials
provider raw response completo
datos financieros detallados
evidencias
comprobantes
stack trace
```

---

### 18.3. Eventos obligatorios

```text id="lxcgj8"
communication.created
communication.updated
communication.scheduled
communication.published
communication.cancelled
communication.archived
communication.audienceUpdated
communication.publicVisibilityChanged
communication.read
notificationTemplate.created
notificationTemplate.updated
notificationTemplate.activated
notificationTemplate.deactivated
notificationTemplate.archived
notification.created
notification.sent
notification.delivered
notification.failed
notification.read
notification.cancelled
notification.retryScheduled
notificationDeliveryAttempt.created
notificationDeliveryAttempt.failed
notificationPreference.updated
```

---

## 19. Logs y métricas

### 19.1. Logs permitidos

```text id="i88hxe"
traceId
requestId
correlationId
endpoint
action
outcome
status
durationMs
errorCode
category
channel
visibility
sourceType
```

---

### 19.2. Logs prohibidos

```text id="qvbo59"
Authorization header
cookies
tokens
secretos
email completo
teléfono completo
body privado completo
provider raw response completo
provider credentials
stack trace en producción
datos financieros detallados
evidencias
comprobantes
```

---

### 19.3. Métricas permitidas

```text id="r7oxpj"
communications_created_total
communications_published_total
communications_archived_total
communications_public_total
notifications_created_total
notifications_sent_total
notifications_delivered_total
notifications_failed_total
notifications_read_total
notification_delivery_attempts_total
notification_delivery_failures_total
```

---

### 19.4. Labels permitidos

```text id="ep0ngn"
category
channel
status
priority
outcome
sourceType
visibility
```

---

### 19.5. Labels prohibidos

```text id="j5b3oj"
tenantId
communicationId
notificationId
userId
personId
propertyUnitId
email
phone
traceId
ipAddress
```

---

## 20. Errores seguros

### 20.1. Formato estándar

```json id="ijedz1"
{
  "error": {
    "code": "NOTIFICATION_NOT_FOUND",
    "message": "Notification not found.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

### 20.2. No revelar

Los errores no deben revelar:

```text id="g2xhc0"
si una notificación ajena existe
si un comunicado privado existe
si una preferencia ajena existe
si un recipient de otro tenant existe
SQL interno
Prisma raw error
stack trace
provider raw response
email completo
teléfono completo
tokens
secretos
```

---

### 20.3. 404 vs 403

Para recursos ajenos o cross-tenant se permite usar:

```text id="twhgi9"
404 RESOURCE_NOT_FOUND
```

para reducir enumeración.

Para falta de permisos dentro del mismo tenant se puede usar:

```text id="ib4z0k"
403 FORBIDDEN
```

cuando no revele información sensible.

---

## 21. Seguridad SQL / Prisma

### 21.1. Consulta de comunicación

Prohibido:

```typescript id="c5g6fl"
prisma.communication.findUnique({
  where: { id: communicationId }
});
```

Permitido:

```typescript id="lx22xc"
prisma.communication.findFirst({
  where: {
    id: communicationId,
    tenantId: currentTenant.id
  }
});
```

---

### 21.2. Consulta de notificación

Prohibido:

```typescript id="x8m3h1"
prisma.notification.findUnique({
  where: { id: notificationId }
});
```

Permitido:

```typescript id="t1safy"
prisma.notification.findFirst({
  where: {
    id: notificationId,
    tenantId: currentTenant.id
  }
});
```

Para `/me`:

```typescript id="iv2u5x"
prisma.notification.findFirst({
  where: {
    id: notificationId,
    tenantId: currentTenant.id,
    recipientUserId: currentUser.id
  }
});
```

---

### 21.3. Consulta de preference

Prohibido:

```typescript id="d0qd4t"
prisma.notificationPreference.findUnique({
  where: { id: preferenceId }
});
```

Permitido:

```typescript id="ukpqtl"
prisma.notificationPreference.findFirst({
  where: {
    id: preferenceId,
    tenantId: currentTenant.id,
    userId: currentUser.id
  }
});
```

---

### 21.4. Consulta pública

Debe filtrar:

```typescript id="ieecwe"
{
  tenant: {
    slug,
    status: "active"
  },
  status: "published",
  visibility: "public",
  isPublicVisible: true,
  archivedAt: null,
  OR: [
    { expiresAt: null },
    { expiresAt: { gt: now } }
  ]
}
```

---

### 21.5. `$queryRaw`

Permitido solo si:

```text id="yqy874"
usa parámetros bind
no concatena input del usuario
está encapsulado en repositorio
tiene tests
no expone SQL raw en errores
```

---

## 22. Seguridad de DTOs

### 22.1. Campos prohibidos en body

No aceptar desde cliente:

```text id="rz6wsj"
tenantId
createdBy
updatedBy
publishedBy
archivedBy
publishedAt
archivedAt
createdAt
updatedAt
readAt manual no autorizado
status en PATCH genérico
recipientUserId en preferencias propias
provider credentials
destination completo
delivery status manual no autorizado
```

---

### 22.2. DTO administrativo

Puede incluir más detalle, pero no debe incluir:

```text id="rb30qu"
tokens
secretos
provider credentials
provider raw response completo
emails completos innecesarios
teléfonos completos innecesarios
metadata sin sanitizar
```

---

### 22.3. DTO propio

No debe incluir:

```text id="q48snp"
recipientUserId
recipients
metadata interna
deliveryAttempts
provider data
idempotencyKey
audit data
datos de otros usuarios
```

---

### 22.4. DTO público

Debe ser allowlist estricto.

Permitido:

```text id="f5cwa8"
publicId
slug
title
summary
body
category
priority
coverImageUrl
publishedAt
expiresAt
tenantSlug
```

Todo lo demás queda prohibido.

---

## 23. Seguridad de URLs

### 23.1. `actionUrl`

Debe ser:

```text id="nqbnnm"
relativa
o URL dentro de allowlist explícita
```

Permitido:

```text id="tqlab3"
/reservations/reservation_uuid
/fines/fine_uuid
/account-statements/statement_uuid
```

Prohibido:

```text id="rlnxh8"
javascript:
data:
file:
URL externa no allowlisted
open redirect
```

---

### 23.2. `coverImageUrl`

Para comunicados públicos, debe apuntar a recurso público permitido o asset controlado.

No debe contener:

```text id="bdbben"
signed URL privada persistente
tokens
credentials
bucket interno sensible
```

---

## 24. Seguridad de contenido

### 24.1. HTML permitido

MVP recomendado:

```text id="eiixjj"
texto plano o HTML sanitizado con allowlist estricta.
```

---

### 24.2. Bloquear

```text id="ftwdi5"
<script>
<iframe>
<object>
<embed>
event handlers inline
javascript:
data URLs peligrosas
CSS peligroso
HTML no sanitizado
```

---

### 24.3. Plantillas

El renderizado debe:

```text id="pbvdun"
validar variables declaradas
escapar variables
sanitizar resultado
evitar HTML injection
evitar URL injection
```

---

## 25. Rate limiting

### 25.1. Endpoints públicos

Aplicar rate limiting a:

```text id="mdszte"
GET /api/v1/public/tenants/{slug}/announcements
GET /api/v1/public/tenants/{slug}/announcements/{communicationSlug}
```

Objetivo:

* evitar scraping;
* evitar enumeración;
* proteger disponibilidad.

---

### 25.2. Envíos administrativos

Aplicar rate limiting a:

```text id="jo1f1s"
POST /api/v1/tenant/communications/{communicationId}/publish
POST /api/v1/tenant/notifications
POST /api/v1/tenant/notifications/{notificationId}/send
POST /api/v1/tenant/notifications/{notificationId}/retry
```

---

### 25.3. Endpoints `/me`

Aplicar rate limiting razonable a:

```text id="pwt8tx"
GET /api/v1/me/notifications
POST /api/v1/me/notifications/mark-all-read
GET /api/v1/me/communications
```

---

## 26. CORS y caché

### 26.1. Endpoints privados

Deben usar:

```text id="bkr2wp"
Cache-Control: no-store
```

No cachear:

```text id="fs6u41"
notificaciones
preferencias
delivery attempts
comunicados privados
read receipts
```

---

### 26.2. Endpoints públicos

Pueden usar:

```text id="r3blsh"
Cache-Control: public, max-age=300
ETag
Last-Modified
```

solo para datos public-safe.

---

### 26.3. CORS

Producción no debe usar:

```text id="rctq8q"
Access-Control-Allow-Origin: *
```

para endpoints privados.

Para públicos, aplicar allowlist según integración WordPress.

---

## 27. Seguridad con IA

### 27.1. Prohibido enviar a IA externa

```text id="c834ei"
comunicados privados reales
notificaciones reales
emails reales
teléfonos reales
destinatarios reales
preferencias reales
delivery errors reales con datos sensibles
datos financieros
datos de multas
datos de pagos
datos de reservas privadas
tokens
secretos
```

---

### 27.2. Permitido con datos ficticios

```text id="dxnz7n"
generar plantillas sintéticas
crear ejemplos de comunicados ficticios
generar tests con datos sintéticos
analizar código sin datos reales
mejorar documentación técnica
```

---

### 27.3. IA para redacción futura

Queda diferida a spec futura y requiere:

```text id="kyyara"
anonimización
revisión humana
consentimiento
gobierno de datos
registro de prompts
no entrenamiento con datos privados
control de sesgos
```

---

## 28. Retención y eliminación

### 28.1. No eliminación física ordinaria

No eliminar físicamente:

```text id="jd6bm2"
communications
communication_recipients
communication_read_receipts
notification_templates
notifications
notification_delivery_attempts
notification_preferences
```

---

### 28.2. Archivo lógico

Usar:

```text id="nhgw55"
archivedAt
status = archived cuando aplique
```

---

### 28.3. Delivery attempts

Mantener delivery attempts por trazabilidad, pero con datos mínimos y destino enmascarado.

No almacenar información que complique retención:

```text id="iqmaai"
destinos completos
provider raw responses
credenciales
contenido privado completo
```

---

## 29. Checklist de seguridad para PR

```text id="ik91nf"
[ ] Todas las tablas tenant-scoped tienen tenant_id.
[ ] Toda consulta tenant-scoped filtra por tenant_id.
[ ] No se acepta tenantId desde body.
[ ] No se busca communication solo por id.
[ ] No se busca notification solo por id.
[ ] No se busca preference solo por id.
[ ] No se busca deliveryAttempt solo por id.
[ ] userId se valida contra tenant.
[ ] personId se valida contra tenant.
[ ] propertyUnitId se valida contra tenant.
[ ] roleId se valida contra tenant.
[ ] Recipients se validan contra tenant.
[ ] Comunicación no pública requiere audiencia.
[ ] Communication private no aparece en público.
[ ] Communication internal no aparece en público.
[ ] Communication tenant no aparece en público.
[ ] Communication draft no aparece en público.
[ ] Communication scheduled no aparece en público.
[ ] Communication archived no aparece en público.
[ ] Communication expired no aparece en público por defecto.
[ ] WordPress solo ve published/public/isPublicVisible.
[ ] Endpoint público no devuelve recipients.
[ ] Endpoint público no devuelve readReceipts.
[ ] Endpoint público no devuelve notifications.
[ ] Endpoint público no devuelve deliveryAttempts.
[ ] Endpoint público no devuelve preferences.
[ ] Endpoint público no devuelve metadata interna.
[ ] No existen endpoints públicos de notifications.
[ ] No existen endpoints públicos de preferences.
[ ] No existen endpoints públicos de delivery attempts.
[ ] Usuario no ve notificación ajena.
[ ] Usuario no marca notificación ajena como leída.
[ ] Usuario no modifica preferencia ajena.
[ ] Own DTO no expone recipientUserId.
[ ] Own DTO no expone metadata interna.
[ ] Own DTO no expone deliveryAttempts.
[ ] Template email requiere subjectTemplate.
[ ] Template variablesSchema se valida.
[ ] Template inactiva no se usa.
[ ] Template de sistema está protegida.
[ ] Content sanitizer bloquea scripts.
[ ] Content sanitizer bloquea iframes.
[ ] Content sanitizer bloquea handlers inline.
[ ] actionUrl es relativa o allowlisted.
[ ] Notification idempotency evita duplicados.
[ ] Retry no duplica Notification.
[ ] Retry respeta maxAttempts.
[ ] DeliveryAttempt usa destinationMasked.
[ ] Email completo no se persiste.
[ ] Teléfono completo no se persiste.
[ ] Provider raw response no se persiste completo.
[ ] Provider credentials no se persisten.
[ ] Preference mandatory/security no se desactiva sin política.
[ ] Fallo provider no rompe transacción principal.
[ ] Audit metadata está sanitizada.
[ ] Logs no contienen tokens.
[ ] Logs no contienen emails completos.
[ ] Logs no contienen teléfonos completos.
[ ] Logs no contienen body privado completo.
[ ] Métricas no usan tenantId.
[ ] Métricas no usan communicationId.
[ ] Métricas no usan notificationId.
[ ] Métricas no usan userId/personId/propertyUnitId.
[ ] OpenAPI documenta endpoints requeridos.
[ ] OpenAPI no documenta endpoints prohibidos.
[ ] Tests unitarios pasan.
[ ] Tests API pasan.
[ ] Tests autorización pasan.
[ ] Tests own-resource pasan.
[ ] Tests multitenant pasan.
[ ] Tests public safety pasan.
[ ] Tests delivery pasan.
[ ] Tests preferences pasan.
[ ] Tests security pasan.
[ ] CI pasa.
```

---

## 30. Pruebas de seguridad obligatorias

Deben existir pruebas para:

```text id="fh8s3n"
- usuario sin token recibe 401 en endpoints privados;
- usuario sin permiso recibe 403;
- tenant A no ve communications tenant B;
- tenant A no ve notifications tenant B;
- tenant A no ve templates tenant B;
- tenant A no ve delivery attempts tenant B;
- tenant A no ve preferences tenant B;
- tenant A no usa userId tenant B como recipient;
- tenant A no usa personId tenant B como recipient;
- tenant A no usa propertyUnitId tenant B como recipient;
- tenant A no usa roleId tenant B como recipient;
- comunicado private no aparece públicamente;
- comunicado internal no aparece públicamente;
- comunicado tenant no aparece públicamente;
- comunicado draft no aparece públicamente;
- comunicado scheduled no aparece públicamente;
- comunicado archived no aparece públicamente;
- comunicado expired no aparece públicamente;
- endpoint público no devuelve recipients;
- endpoint público no devuelve readReceipts;
- endpoint público no devuelve notifications;
- endpoint público no devuelve metadata interna;
- no existe endpoint público de notifications;
- usuario no ve notificación ajena;
- usuario no marca notificación ajena como leída;
- usuario no modifica preferencia ajena;
- template con script injection se bloquea;
- variable no declarada en template se bloquea;
- template inactive no se usa;
- idempotencyKey repetida no duplica notification;
- retry no duplica notification;
- maxAttempts se respeta;
- destinationMasked no contiene email completo;
- destinationMasked no contiene teléfono completo;
- provider raw response no se persiste;
- provider credentials no se persisten;
- mandatory/security no se desactiva sin política;
- provider fallido no rompe flujo principal;
- audit metadata no contiene body privado completo;
- logs no contienen tokens;
- logs no contienen emails completos;
- OpenAPI no documenta endpoints públicos prohibidos.
```

---

## 31. Riesgos residuales aceptados en MVP

| Riesgo                             | Estado   | Justificación                                           |
| ---------------------------------- | -------- | ------------------------------------------------------- |
| Email real puede diferirse         | Aceptado | MVP puede usar mock/noop o provider básico              |
| Sin WhatsApp real                  | Aceptado | Requiere proveedor, costos, consentimiento y plantillas |
| Sin SMS real                       | Aceptado | Requiere proveedor y cumplimiento                       |
| Sin push móvil                     | Aceptado | Depende de app móvil/PWA y device tokens                |
| Sin webhooks salientes avanzados   | Aceptado | Requiere firma, retry y dead-letter                     |
| Sin n8n avanzado                   | Aceptado | Requiere spec de automatización                         |
| Sin confirmación legal certificada | Aceptado | Requiere firma, sellado y cumplimiento                  |
| Sin chat bidireccional             | Aceptado | Requiere moderación y seguridad adicional               |
| Sin IA con datos reales            | Aceptado | Requiere gobierno de datos y anonimización              |
| Sin editor visual avanzado         | Aceptado | Requiere sanitización avanzada y preview                |

---

## 32. Pendientes de seguridad para specs futuras

### 32.1. `00X-notification-providers-email`

Debe cubrir:

```text id="j5bg09"
proveedor real
credenciales
secret manager
rate limits
bounce handling
unsubscribe técnico si aplica
DKIM/SPF/DMARC
plantillas email
tracking privacy
```

---

### 32.2. `00X-notification-providers-whatsapp`

Debe cubrir:

```text id="ip3mqj"
proveedor
plantillas aprobadas
consentimiento
números telefónicos
costos
rate limits
opt-out
logs sanitizados
```

---

### 32.3. `00X-push-notifications`

Debe cubrir:

```text id="h3lcpe"
device tokens
rotación
revocación
PWA/app móvil
seguridad de payload
preferencias
notificaciones silenciosas
```

---

### 32.4. `00X-outbound-webhooks`

Debe cubrir:

```text id="e1xiqs"
firma HMAC
secret rotation
retry policy
dead-letter queue
event filtering
payload minimization
observabilidad
```

---

### 32.5. `00X-ai-assisted-communication-drafts`

Debe cubrir:

```text id="glq0b0"
anonimización
consentimiento
revisión humana
registro de prompts
control de datos
no entrenamiento
cumplimiento
```

---

## 33. Criterios de aceptación de seguridad

La spec `012-communications-notifications` cumple seguridad si:

* toda tabla tenant-scoped tiene `tenant_id`;
* toda consulta tenant-scoped filtra por tenant;
* los endpoints administrativos requieren autenticación, membership y permisos;
* los endpoints `/me` validan recurso propio;
* los endpoints públicos solo exponen comunicados public-safe;
* WordPress no puede consultar notificaciones;
* WordPress no puede consultar destinatarios;
* WordPress no puede consultar preferencias;
* WordPress no puede consultar intentos de entrega;
* un usuario no puede ver notificaciones ajenas;
* un usuario no puede marcar notificaciones ajenas como leídas;
* un usuario no puede modificar preferencias ajenas;
* recipients de otro tenant son rechazados;
* comunicados privados no aparecen públicamente;
* comunicados internos no aparecen públicamente;
* comunicados tenant no aparecen públicamente;
* comunicados draft/scheduled/archived/expired no aparecen públicamente;
* plantillas validan variables;
* contenido HTML se sanitiza;
* scripts e iframes se bloquean;
* actionUrl es segura;
* destinationMasked no guarda destinos completos;
* provider credentials no se guardan;
* provider raw response no se guarda completa;
* idempotencyKey evita duplicados;
* retry no duplica notificaciones;
* maxAttempts se respeta;
* preferencias obligatorias se protegen;
* fallos de proveedor no rompen flujo principal;
* auditoría está implementada;
* logs y métricas están sanitizados;
* OpenAPI no documenta endpoints prohibidos;
* pruebas de seguridad pasan;
* CI pasa.

---

## 34. Decisión final de seguridad

El módulo `012-communications-notifications` será tratado como un módulo sensible de comunicación, entrega y publicación controlada.

Su seguridad se basa en:

```text id="x9gdb1"
tenant isolation
permissioned actions
own-resource authorization
audience validation
public/private separation
WordPress public-safe DTOs
notification privacy
template validation
content sanitization
destination masking
delivery traceability
idempotency
preference enforcement
provider abstraction
failure isolation
safe audit metadata
safe logs
safe metrics
OpenAPI negative validation
CI security gates
```

No se aceptará una implementación que permita comunicaciones cross-tenant, notificaciones cross-tenant, recipients de otro tenant, exposición pública de comunicados privados, endpoints públicos de notificaciones, consulta de notificaciones ajenas, modificación de preferencias ajenas, almacenamiento de destinos completos, almacenamiento de credenciales de proveedor, duplicación de notificaciones por evento, ejecución de reintentos infinitos, plantillas con inyección, logs con secretos, métricas con identificadores sensibles, omisión de auditoría o documentación OpenAPI de rutas públicas prohibidas.
