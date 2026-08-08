# Plan — Spec 012 Communications and Notifications

## 1. Información del documento

| Campo                 | Valor                                                                                                             |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Proyecto              | RESIDENT Core                                                                                                     |
| Spec ID               | 012                                                                                                               |
| Módulo                | Communications and Notifications                                                                                  |
| Documento             | Implementation Plan                                                                                               |
| Ruta                  | `docs/specs/012-communications-notifications/plan.md`                                                             |
| Versión               | 0.1                                                                                                               |
| Estado                | Borrador inicial                                                                                                  |
| Fecha                 | 2026-07-19                                                                                                        |
| Documento base        | `docs/specs/012-communications-notifications/spec.md`                                                             |
| Depende de            | `001-tenants`, `002-users-roles`, `003-residents-properties`, `007-audit`, `009-wordpress-integration-basic`      |
| Relacionado con       | `004-dues-fees`, `005-payments`, `006-account-statements`, `010-reservations-common-areas`, `011-fines-sanctions` |
| Arquitectura          | Monolito modular NestJS                                                                                           |
| Base de datos         | PostgreSQL + Prisma                                                                                               |
| API Style             | REST                                                                                                              |
| Naturaleza del módulo | Tenant-scoped / Audience-aware / Event-aware / Channel-aware / Privacy-preserving / Auditable                     |
| Prioridad             | Alta                                                                                                              |

---

## 2. Propósito

Este documento transforma la especificación funcional `012-communications-notifications/spec.md` en un plan técnico de implementación.

El módulo `Communications and Notifications` debe permitir crear comunicados administrativos, publicarlos, segmentarlos, consultarlos, exponer únicamente comunicados públicos hacia WordPress, generar notificaciones internas, registrar intentos de entrega, administrar plantillas básicas y gestionar preferencias de notificación.

Regla central:

```text id="vuqo4a"
Toda comunicación o notificación debe pertenecer a un tenant, tener audiencia controlada, contenido clasificado, entrega trazable, autorización por recurso y exposición pública limitada únicamente a contenido explícitamente publicable.
```

---

## 3. Resumen de implementación

El módulo se implementará dentro de RESIDENT Core como módulo funcional independiente, integrado con:

* tenants;
* usuarios, roles y permisos;
* residentes, propietarios, personas y unidades;
* auditoría;
* integración pública WordPress;
* eventos de pagos;
* eventos de estados de cuenta;
* eventos de reservas;
* eventos de multas;
* futuros eventos de reuniones/asambleas;
* futuros proveedores email, WhatsApp, SMS, push y n8n.

Nombre técnico recomendado:

```text id="mu4f9e"
communications
```

Ruta recomendada:

```text id="nomz19"
apps/api/src/modules/communications/
```

Componentes principales:

```text id="kpyozp"
CommunicationsModule
CommunicationsController
MyCommunicationsController
PublicAnnouncementsController
NotificationTemplatesController
NotificationsController
MyNotificationsController
NotificationPreferencesController
CommunicationService
CommunicationAudienceService
CommunicationPublicationService
NotificationTemplateService
NotificationService
NotificationDeliveryService
NotificationPreferenceService
NotificationRenderingService
CommunicationAuditService
```

Naturaleza del módulo:

```text id="lvw1t2"
tenant-scoped
audience-aware
permissioned
own-resource protected
public-safe for WordPress only
event-aware
channel-aware
idempotent
queue-ready
auditable
privacy-preserving
```

---

## 4. Decisiones técnicas aplicables

El módulo debe cumplir con:

```text id="h1wht1"
ADR-001 — Architecture Style
ADR-002 — Backend Framework
ADR-003 — Database Strategy
ADR-004 — Multitenancy Strategy
ADR-007 — Authorization Strategy
ADR-010 — Observability Strategy
ADR-011 — Testing Strategy
ADR-012 — CI/CD Strategy
```

Reglas clave:

* usar NestJS + TypeScript;
* usar PostgreSQL + Prisma;
* toda tabla tenant-scoped debe incluir `tenant_id`;
* no aceptar `tenantId` desde body;
* comunicaciones privadas no se exponen públicamente;
* notificaciones no se exponen bajo `/api/v1/public`;
* WordPress solo consume comunicados `published`, `public`, `isPublicVisible = true`;
* el canal base MVP será `inApp`;
* email se implementará mediante puerto/adaptador opcional;
* WhatsApp, SMS, push y webhook quedan diferidos;
* entrega externa debe ser desacoplada y tolerante a fallos;
* notificaciones por evento deben ser idempotentes;
* destinos deben almacenarse enmascarados;
* no almacenar tokens ni credenciales de proveedor en metadata;
* no incluir contenido privado completo en logs;
* toda publicación, cambio de visibilidad, envío crítico y fallo relevante debe auditarse.

---

## 5. Alcance técnico

### 5.1. Incluido

```text id="urgd7k"
Communication management
Communication publication
Communication scheduling model
Communication audience management
Own communications query
Public announcements query for WordPress
Communication read receipts
Notification templates
In-app notifications
Optional email delivery adapter
Notification delivery attempts
Notification preferences
Notification idempotency
Event-based notification creation
Audit integration
REST API
OpenAPI
Unit tests
Integration tests
API tests
Authorization tests
Own-resource tests
Multitenancy tests
Public safety tests
Privacy tests
Security tests
```

---

### 5.2. Diferido

```text id="xvzqq5"
WhatsApp real provider
SMS real provider
Push mobile provider
Advanced webhook outbound delivery
n8n advanced automation workflows
Campaign management
Marketing automation
Visual template builder
WYSIWYG editor
Certified legal receipt
Electronic signature
Bidirectional chat
Community forums
Comments
Surveys
Voting
Advanced attachment management
AI-assisted writing using real data
Automatic translation
Sentiment analysis
Advanced notification analytics
Multi-region messaging service
```

---

## 6. Estructura de carpetas recomendada

```text id="czt1mq"
apps/api/src/modules/communications/
├── communications.module.ts
│
├── communications.controller.ts
├── my-communications.controller.ts
├── public-announcements.controller.ts
├── notification-templates.controller.ts
├── notifications.controller.ts
├── my-notifications.controller.ts
├── notification-preferences.controller.ts
│
├── application/
│   ├── use-cases/
│   │   ├── create-communication.use-case.ts
│   │   ├── list-communications.use-case.ts
│   │   ├── get-communication.use-case.ts
│   │   ├── update-communication.use-case.ts
│   │   ├── publish-communication.use-case.ts
│   │   ├── schedule-communication.use-case.ts
│   │   ├── cancel-communication.use-case.ts
│   │   ├── archive-communication.use-case.ts
│   │   ├── update-communication-recipients.use-case.ts
│   │   ├── list-communication-recipients.use-case.ts
│   │   ├── list-communication-read-receipts.use-case.ts
│   │   ├── list-own-communications.use-case.ts
│   │   ├── get-own-communication.use-case.ts
│   │   ├── mark-own-communication-read.use-case.ts
│   │   ├── list-public-announcements.use-case.ts
│   │   ├── get-public-announcement.use-case.ts
│   │   ├── create-notification-template.use-case.ts
│   │   ├── list-notification-templates.use-case.ts
│   │   ├── get-notification-template.use-case.ts
│   │   ├── update-notification-template.use-case.ts
│   │   ├── activate-notification-template.use-case.ts
│   │   ├── deactivate-notification-template.use-case.ts
│   │   ├── archive-notification-template.use-case.ts
│   │   ├── create-notification.use-case.ts
│   │   ├── list-notifications.use-case.ts
│   │   ├── get-notification.use-case.ts
│   │   ├── send-notification.use-case.ts
│   │   ├── retry-notification.use-case.ts
│   │   ├── cancel-notification.use-case.ts
│   │   ├── list-notification-delivery-attempts.use-case.ts
│   │   ├── list-own-notifications.use-case.ts
│   │   ├── get-own-notification.use-case.ts
│   │   ├── mark-own-notification-read.use-case.ts
│   │   ├── mark-all-own-notifications-read.use-case.ts
│   │   ├── get-own-notification-preferences.use-case.ts
│   │   ├── update-own-notification-preferences.use-case.ts
│   │   └── handle-domain-event-notification.use-case.ts
│   │
│   ├── services/
│   │   ├── communication.service.ts
│   │   ├── communication-audience.service.ts
│   │   ├── communication-publication.service.ts
│   │   ├── communication-read-receipt.service.ts
│   │   ├── public-announcement.service.ts
│   │   ├── notification-template.service.ts
│   │   ├── notification.service.ts
│   │   ├── notification-rendering.service.ts
│   │   ├── notification-delivery.service.ts
│   │   ├── notification-channel-policy.service.ts
│   │   ├── notification-preference.service.ts
│   │   ├── notification-idempotency.service.ts
│   │   ├── destination-masking.service.ts
│   │   ├── communication-content-sanitizer.service.ts
│   │   └── communication-audit.service.ts
│   │
│   └── ports/
│       ├── communication-reader.port.ts
│       ├── communication-writer.port.ts
│       ├── communication-recipient-reader.port.ts
│       ├── communication-recipient-writer.port.ts
│       ├── communication-read-receipt-reader.port.ts
│       ├── communication-read-receipt-writer.port.ts
│       ├── notification-template-reader.port.ts
│       ├── notification-template-writer.port.ts
│       ├── notification-reader.port.ts
│       ├── notification-writer.port.ts
│       ├── notification-delivery-attempt-reader.port.ts
│       ├── notification-delivery-attempt-writer.port.ts
│       ├── notification-preference-reader.port.ts
│       ├── notification-preference-writer.port.ts
│       ├── communication-user-directory.port.ts
│       ├── communication-property-unit.port.ts
│       ├── notification-email-provider.port.ts
│       ├── notification-queue.port.ts
│       └── communication-audit.port.ts
│
├── domain/
│   ├── entities/
│   │   ├── communication.entity.ts
│   │   ├── communication-recipient.entity.ts
│   │   ├── communication-read-receipt.entity.ts
│   │   ├── notification-template.entity.ts
│   │   ├── notification.entity.ts
│   │   ├── notification-delivery-attempt.entity.ts
│   │   └── notification-preference.entity.ts
│   │
│   ├── value-objects/
│   │   ├── communication-status.vo.ts
│   │   ├── communication-visibility.vo.ts
│   │   ├── communication-category.vo.ts
│   │   ├── communication-priority.vo.ts
│   │   ├── communication-audience-type.vo.ts
│   │   ├── communication-recipient-type.vo.ts
│   │   ├── communication-title.vo.ts
│   │   ├── communication-body.vo.ts
│   │   ├── notification-status.vo.ts
│   │   ├── notification-channel.vo.ts
│   │   ├── notification-category.vo.ts
│   │   ├── notification-priority.vo.ts
│   │   ├── notification-template-status.vo.ts
│   │   ├── notification-template-code.vo.ts
│   │   ├── delivery-attempt-status.vo.ts
│   │   └── masked-destination.vo.ts
│   │
│   ├── events/
│   │   ├── communication-created.event.ts
│   │   ├── communication-updated.event.ts
│   │   ├── communication-scheduled.event.ts
│   │   ├── communication-published.event.ts
│   │   ├── communication-cancelled.event.ts
│   │   ├── communication-archived.event.ts
│   │   ├── communication-audience-updated.event.ts
│   │   ├── communication-public-visibility-changed.event.ts
│   │   ├── communication-read.event.ts
│   │   ├── notification-template-created.event.ts
│   │   ├── notification-template-updated.event.ts
│   │   ├── notification-created.event.ts
│   │   ├── notification-sent.event.ts
│   │   ├── notification-delivered.event.ts
│   │   ├── notification-failed.event.ts
│   │   ├── notification-read.event.ts
│   │   ├── notification-cancelled.event.ts
│   │   └── notification-preference-updated.event.ts
│   │
│   └── errors/
│       ├── communication-not-found.error.ts
│       ├── communication-forbidden.error.ts
│       ├── communication-invalid-status-transition.error.ts
│       ├── communication-audience-required.error.ts
│       ├── communication-publication-not-allowed.error.ts
│       ├── communication-private-public-exposure.error.ts
│       ├── communication-recipient-invalid.error.ts
│       ├── communication-cross-tenant-reference.error.ts
│       ├── notification-template-not-found.error.ts
│       ├── notification-template-inactive.error.ts
│       ├── notification-template-duplicate-code.error.ts
│       ├── notification-template-variables-invalid.error.ts
│       ├── notification-not-found.error.ts
│       ├── notification-forbidden.error.ts
│       ├── notification-invalid-transition.error.ts
│       ├── notification-duplicate.error.ts
│       ├── notification-channel-not-configured.error.ts
│       ├── notification-delivery-failed.error.ts
│       ├── notification-preference-not-found.error.ts
│       └── notification-cross-tenant-reference.error.ts
│
├── infrastructure/
│   ├── persistence/
│   │   ├── prisma-communication.repository.ts
│   │   ├── prisma-communication-recipient.repository.ts
│   │   ├── prisma-communication-read-receipt.repository.ts
│   │   ├── prisma-notification-template.repository.ts
│   │   ├── prisma-notification.repository.ts
│   │   ├── prisma-notification-delivery-attempt.repository.ts
│   │   ├── prisma-notification-preference.repository.ts
│   │   └── communications.mapper.ts
│   │
│   ├── delivery/
│   │   ├── in-app-notification.adapter.ts
│   │   ├── email-notification.adapter.ts
│   │   └── noop-notification-provider.adapter.ts
│   │
│   ├── queue/
│   │   ├── bullmq-notification-queue.adapter.ts
│   │   └── sync-notification-queue.adapter.ts
│   │
│   ├── integrations/
│   │   ├── communication-user-directory.adapter.ts
│   │   └── communication-property-unit.adapter.ts
│   │
│   └── audit/
│       └── communication-audit.adapter.ts
│
├── policies/
│   ├── communication-permission.guard.ts
│   ├── own-communication.guard.ts
│   ├── public-communication.guard.ts
│   ├── notification-template-permission.guard.ts
│   ├── notification-permission.guard.ts
│   ├── own-notification.guard.ts
│   └── notification-preference.guard.ts
│
├── dto/
└── tests/
```

---

## 7. Documentación esperada

```text id="tf15tt"
docs/specs/012-communications-notifications/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

Este documento corresponde a:

```text id="hoafq1"
plan.md
```

---

# 8. Diseño de dominio

## 8.1. Communication

Responsabilidad:

* representar un comunicado administrativo;
* controlar visibilidad;
* controlar estado;
* controlar audiencia;
* permitir publicación pública segura;
* permitir lectura propia;
* servir como fuente para comunicados públicos de WordPress.

Campos conceptuales:

```text id="dl1u2i"
id
tenantId
title
slug
summary
body
category
visibility
status
priority
audienceType
isPublicVisible
publishAt
publishedAt
expiresAt
createdBy
updatedBy
publishedBy
archivedBy
coverImageUrl
metadata
createdAt
updatedAt
archivedAt
```

Reglas:

* `tenantId` obligatorio;
* `title` obligatorio;
* `body` obligatorio;
* `category` obligatoria;
* `visibility` obligatoria;
* `status` obligatorio;
* `slug` único por tenant si existe;
* audiencia requerida si no es público;
* público requiere `visibility = public`;
* WordPress solo ve `published + public + isPublicVisible`;
* comunicados privados no deben aparecer en endpoints públicos.

---

## 8.2. CommunicationRecipient

Responsabilidad:

* representar destinatarios explícitos o segmentos de un comunicado;
* permitir audiencias por usuario, persona, unidad, rol o tipo agregado.

Campos conceptuales:

```text id="yfm6pn"
id
tenantId
communicationId
recipientType
userId
personId
propertyUnitId
roleId
createdAt
archivedAt
```

Reglas:

* `tenantId` obligatorio;
* `communicationId` obligatorio;
* cada referencia debe pertenecer al mismo tenant;
* no se aceptan usuarios, personas, unidades o roles de otro tenant;
* para audiencias agregadas no se requieren IDs individuales;
* los destinatarios no se exponen en endpoints públicos.

---

## 8.3. CommunicationReadReceipt

Responsabilidad:

* registrar lectura básica de un comunicado por usuario;
* soportar bandeja propia;
* no representar lectura legal certificada.

Campos conceptuales:

```text id="w5rsja"
id
tenantId
communicationId
userId
readAt
createdAt
archivedAt
```

Reglas:

* `tenantId` obligatorio;
* `communicationId` obligatorio;
* `userId` obligatorio;
* el usuario debe poder acceder al comunicado;
* debe ser idempotente por `tenantId + communicationId + userId`;
* no se expone públicamente.

---

## 8.4. NotificationTemplate

Responsabilidad:

* definir plantillas reutilizables para notificaciones;
* validar variables;
* estandarizar mensajes;
* permitir plantillas de plataforma y de tenant.

Campos conceptuales:

```text id="uqnnay"
id
tenantId nullable
code
name
description
category
channel
subjectTemplate
bodyTemplate
variablesSchema
status
isSystem
createdAt
updatedAt
archivedAt
```

Reglas:

* `code` obligatorio;
* `code` único por tenant o global si `tenantId = null`;
* `channel` obligatorio;
* `category` obligatoria;
* `bodyTemplate` obligatorio;
* `subjectTemplate` obligatorio para email;
* `variablesSchema` valida variables permitidas;
* solo plantillas `active` pueden usarse;
* plantillas de sistema no deben modificarse sin permiso elevado.

---

## 8.5. Notification

Responsabilidad:

* representar una notificación generada para un usuario;
* soportar in-app;
* soportar canales externos;
* mantener estado de lectura;
* relacionarse con evento fuente.

Campos conceptuales:

```text id="lwbkie"
id
tenantId
recipientUserId
recipientPersonId
propertyUnitId
templateId
sourceType
sourceId
category
channel
title
body
status
priority
readAt
actionUrl
metadata
idempotencyKey
createdAt
updatedAt
archivedAt
```

Reglas:

* `tenantId` obligatorio;
* `recipientUserId` obligatorio;
* `channel` obligatorio;
* `title` obligatorio;
* `body` obligatorio;
* `idempotencyKey` recomendado para eventos de dominio;
* `readAt` solo puede marcarlo destinatario o proceso autorizado;
* no se expone públicamente;
* no debe contener datos sensibles innecesarios.

---

## 8.6. NotificationDeliveryAttempt

Responsabilidad:

* registrar intento de entrega por canal;
* preservar estado de proveedor;
* soportar reintentos;
* auditar fallos sin exponer secretos.

Campos conceptuales:

```text id="t9zxrj"
id
tenantId
notificationId
channel
provider
destinationMasked
status
attemptNumber
providerMessageId
errorCode
errorMessage
attemptedAt
deliveredAt
failedAt
metadata
```

Reglas:

* `tenantId` obligatorio;
* `notificationId` obligatorio;
* `destinationMasked` obligatorio para canales externos;
* no guardar destino completo;
* no guardar credenciales;
* no guardar raw provider response completo;
* máximo de intentos controlado.

---

## 8.7. NotificationPreference

Responsabilidad:

* representar preferencias básicas del usuario por categoría y canal;
* controlar opt-in/opt-out donde aplique.

Campos conceptuales:

```text id="cpqmve"
id
tenantId
userId
category
channel
isEnabled
createdAt
updatedAt
archivedAt
```

Reglas:

* `tenantId` obligatorio;
* `userId` obligatorio;
* usuario solo modifica sus preferencias;
* categorías obligatorias no pueden desactivarse si política lo impide;
* no se exponen a otros usuarios.

---

# 9. Value Objects

## 9.1. CommunicationStatus

Valores:

```text id="tyzogd"
draft
scheduled
published
expired
archived
cancelled
```

Responsabilidad:

* validar estado;
* identificar estados editables;
* identificar estados publicables;
* identificar estados terminales.

---

## 9.2. CommunicationVisibility

Valores:

```text id="ijwfne"
private
internal
tenant
public
```

Responsabilidad:

* controlar exposición;
* determinar si puede publicarse en WordPress;
* impedir exposición pública accidental.

---

## 9.3. CommunicationCategory

Valores:

```text id="wjckek"
general
administrative
financial
maintenance
security
community
reservation
fine
meeting
emergency
other
```

---

## 9.4. CommunicationPriority

Valores:

```text id="xzk79h"
low
normal
high
urgent
```

---

## 9.5. AudienceType

Valores:

```text id="nqfkwz"
allTenantUsers
owners
residents
propertyUnits
roles
specificUsers
mixed
```

---

## 9.6. CommunicationRecipientType

Valores:

```text id="m2mnx2"
user
person
propertyUnit
role
owner
resident
allTenantUsers
```

---

## 9.7. CommunicationTitle

Responsabilidad:

* validar título obligatorio;
* limitar longitud;
* evitar payloads peligrosos;
* normalizar espacios.

---

## 9.8. CommunicationBody

Responsabilidad:

* validar cuerpo obligatorio;
* permitir contenido textual o HTML sanitizado según decisión;
* impedir scripts;
* limitar tamaño.

---

## 9.9. NotificationStatus

Valores:

```text id="pybrmj"
pending
sent
delivered
failed
read
archived
cancelled
```

---

## 9.10. NotificationChannel

Valores:

```text id="xt43uo"
inApp
email
whatsapp
sms
push
webhook
```

MVP:

```text id="shpca6"
inApp obligatorio
email opcional
```

---

## 9.11. NotificationCategory

Valores:

```text id="y0dpyl"
mandatory
administrative
financial
security
operational
reservation
fine
meeting
informational
system
```

---

## 9.12. NotificationPriority

Valores:

```text id="aj3834"
low
normal
high
urgent
```

---

## 9.13. NotificationTemplateStatus

Valores:

```text id="tl61as"
active
inactive
archived
```

---

## 9.14. NotificationTemplateCode

Responsabilidad:

* validar código único;
* permitir códigos del tipo `PAYMENT_CONFIRMED`, `FINE_ISSUED`, `RESERVATION_APPROVED`;
* evitar caracteres peligrosos.

---

## 9.15. DeliveryAttemptStatus

Valores:

```text id="qsqlxi"
pending
sent
delivered
failed
cancelled
skipped
```

---

## 9.16. MaskedDestination

Responsabilidad:

* almacenar destinos externos de forma enmascarada;
* impedir persistencia de emails o teléfonos completos en delivery attempts.

Ejemplos:

```text id="kz7dkl"
g***@example.com
+593*******123
```

---

# 10. Modelo de datos y persistencia

## 10.1. Tablas nuevas

```text id="n36dv9"
communications
communication_recipients
communication_read_receipts
notification_templates
notifications
notification_delivery_attempts
notification_preferences
```

---

## 10.2. Relaciones principales

```text id="wj22td"
tenants 1 ── * communications
communications 1 ── * communication_recipients
communications 1 ── * communication_read_receipts

tenants 1 ── * notification_templates
notification_templates 1 ── * notifications

tenants 1 ── * notifications
notifications 1 ── * notification_delivery_attempts

tenants 1 ── * notification_preferences
user_profiles 1 ── * notifications
user_profiles 1 ── * notification_preferences
property_units 0..1 ── * notifications
```

---

## 10.3. Índices recomendados

```text id="u9jdnn"
communications:
- tenant_id
- tenant_id + slug
- tenant_id + status
- tenant_id + visibility
- tenant_id + category
- tenant_id + published_at
- tenant_id + is_public_visible
- tenant_id + status + visibility + is_public_visible

communication_recipients:
- tenant_id
- tenant_id + communication_id
- tenant_id + recipient_type
- tenant_id + user_id
- tenant_id + person_id
- tenant_id + property_unit_id
- tenant_id + role_id

communication_read_receipts:
- tenant_id
- tenant_id + communication_id
- tenant_id + user_id
- tenant_id + communication_id + user_id unique

notification_templates:
- tenant_id
- tenant_id + code
- tenant_id + channel
- tenant_id + category
- tenant_id + status
- code global cuando tenant_id is null

notifications:
- tenant_id
- tenant_id + recipient_user_id
- tenant_id + recipient_user_id + status
- tenant_id + category
- tenant_id + channel
- tenant_id + source_type + source_id
- tenant_id + idempotency_key
- tenant_id + created_at

notification_delivery_attempts:
- tenant_id
- tenant_id + notification_id
- tenant_id + channel
- tenant_id + status
- tenant_id + attempted_at

notification_preferences:
- tenant_id
- tenant_id + user_id
- tenant_id + user_id + category + channel unique
```

---

## 10.4. Soft delete

No eliminar físicamente:

```text id="qph05z"
communications
communication_recipients
communication_read_receipts
notification_templates
notifications
notification_delivery_attempts
notification_preferences
```

Usar:

```text id="r4bdkf"
archivedAt
status = archived
```

según entidad.

---

## 10.5. Multitenancy

Toda consulta tenant-scoped debe aplicar:

```text id="xrrrqh"
WHERE tenant_id = currentTenant.id
```

Prohibido:

```text id="radnqc"
buscar communication solo por communicationId
buscar notification solo por notificationId
buscar template solo por templateId
buscar deliveryAttempt solo por attemptId
buscar preference solo por preferenceId
usar recipients de otro tenant
usar propertyUnitId de otro tenant
usar userId de otro tenant
```

---

# 11. Puertos de aplicación

## 11.1. CommunicationReaderPort

Contrato conceptual:

```text id="j96k4q"
findById(tenantId, communicationId)
findBySlug(tenantId, slug)
list(tenantId, filters, pagination)
listOwn(tenantId, actorUserId, propertyUnitIds, filters, pagination)
listPublicByTenantSlug(tenantSlug, filters, pagination)
findPublicByTenantSlugAndCommunicationSlug(tenantSlug, communicationSlug)
```

---

## 11.2. CommunicationWriterPort

Contrato:

```text id="c8cuuw"
create(tenantId, input, actor)
update(tenantId, communicationId, input, actor)
updateStatus(tenantId, communicationId, transition, actor)
archive(tenantId, communicationId, actor)
updatePublicVisibility(tenantId, communicationId, isPublicVisible, actor)
```

---

## 11.3. CommunicationRecipientReaderPort

Contrato:

```text id="wqh3f9"
listByCommunication(tenantId, communicationId)
resolveAudienceUsers(tenantId, communicationId)
userCanAccessCommunication(tenantId, userId, propertyUnitIds, communicationId)
```

---

## 11.4. CommunicationRecipientWriterPort

Contrato:

```text id="bnjqac"
replaceRecipients(tenantId, communicationId, recipients, actor)
archiveRecipients(tenantId, communicationId, actor)
```

---

## 11.5. CommunicationReadReceiptReaderPort

Contrato:

```text id="q9e0si"
findReceipt(tenantId, communicationId, userId)
listByCommunication(tenantId, communicationId, filters, pagination)
```

---

## 11.6. CommunicationReadReceiptWriterPort

Contrato:

```text id="f7mb99"
markRead(tenantId, communicationId, userId, occurredAt)
```

---

## 11.7. NotificationTemplateReaderPort

Contrato:

```text id="ccujmq"
findById(tenantIdOrNull, templateId)
findByCode(tenantIdOrNull, code, channel)
list(tenantId, filters, pagination)
findActiveTemplate(tenantId, code, channel)
```

---

## 11.8. NotificationTemplateWriterPort

Contrato:

```text id="a91xpp"
create(tenantId, input, actor)
update(tenantId, templateId, input, actor)
activate(tenantId, templateId, actor)
deactivate(tenantId, templateId, actor)
archive(tenantId, templateId, actor)
```

---

## 11.9. NotificationReaderPort

Contrato:

```text id="msn2mk"
findById(tenantId, notificationId)
list(tenantId, filters, pagination)
listOwn(tenantId, userId, filters, pagination)
findByIdempotencyKey(tenantId, idempotencyKey)
```

---

## 11.10. NotificationWriterPort

Contrato:

```text id="q621xl"
create(tenantId, input, actorOrSystem)
updateStatus(tenantId, notificationId, transition)
markRead(tenantId, notificationId, userId)
markAllRead(tenantId, userId)
archive(tenantId, notificationId, actor)
cancel(tenantId, notificationId, actor)
```

---

## 11.11. NotificationDeliveryAttemptReaderPort

Contrato:

```text id="lwvt7g"
listByNotification(tenantId, notificationId)
listFailures(tenantId, filters, pagination)
```

---

## 11.12. NotificationDeliveryAttemptWriterPort

Contrato:

```text id="vzj2rn"
createAttempt(tenantId, notificationId, input)
markSent(tenantId, attemptId, providerMessageId)
markDelivered(tenantId, attemptId)
markFailed(tenantId, attemptId, error)
markSkipped(tenantId, notificationId, reason)
```

---

## 11.13. NotificationPreferenceReaderPort

Contrato:

```text id="gh88zn"
listByUser(tenantId, userId)
findByUserCategoryChannel(tenantId, userId, category, channel)
isEnabled(tenantId, userId, category, channel)
```

---

## 11.14. NotificationPreferenceWriterPort

Contrato:

```text id="q12mnr"
upsertPreference(tenantId, userId, category, channel, isEnabled)
replacePreferences(tenantId, userId, preferences)
```

---

## 11.15. CommunicationUserDirectoryPort

Contrato:

```text id="fqwbnx"
findUserById(tenantId, userId)
findUsersByRole(tenantId, roleId)
findTenantUsers(tenantId)
findOwners(tenantId)
findResidents(tenantId)
findUsersByPropertyUnits(tenantId, propertyUnitIds)
getUserEmail(tenantId, userId)
```

---

## 11.16. CommunicationPropertyUnitPort

Contrato:

```text id="n7m69j"
findPropertyUnitById(tenantId, propertyUnitId)
findPropertyUnitsForUser(tenantId, userId)
userCanAccessPropertyUnit(tenantId, userId, propertyUnitId)
```

---

## 11.17. NotificationEmailProviderPort

Contrato:

```text id="j2juzs"
isConfigured(tenantId)
sendEmail(tenantId, input)
```

Regla:

```text id="y4uifa"
El puerto no debe exponer credenciales ni respuesta raw completa del proveedor.
```

---

## 11.18. NotificationQueuePort

Contrato:

```text id="rblv3r"
enqueueNotificationDelivery(tenantId, notificationId, channel)
enqueueRetry(tenantId, notificationId, channel, attemptNumber)
```

MVP puede usar implementación síncrona o BullMQ si Redis ya está disponible.

---

## 11.19. CommunicationAuditPort

Contrato:

```text id="pcisaf"
auditCommunicationCreated(...)
auditCommunicationPublished(...)
auditCommunicationArchived(...)
auditCommunicationAudienceUpdated(...)
auditNotificationCreated(...)
auditNotificationSent(...)
auditNotificationFailed(...)
auditNotificationRead(...)
auditNotificationPreferenceUpdated(...)
```

---

# 12. Servicios de aplicación

## 12.1. CommunicationService

Responsabilidades:

* crear comunicados;
* actualizar comunicados;
* validar estados editables;
* consultar comunicados administrativos;
* coordinar audiencia;
* coordinar publicación;
* auditar cambios.

---

## 12.2. CommunicationAudienceService

Responsabilidades:

* validar audiencia;
* resolver destinatarios;
* impedir referencias cross-tenant;
* validar `allTenantUsers`, `owners`, `residents`, `propertyUnits`, `roles`, `specificUsers`, `mixed`;
* determinar acceso de usuario a comunicado.

---

## 12.3. CommunicationPublicationService

Responsabilidades:

* publicar comunicados;
* programar comunicados;
* cancelar comunicados;
* archivar comunicados;
* validar exposición pública;
* asignar `publishedAt`;
* auditar publicación.

---

## 12.4. CommunicationReadReceiptService

Responsabilidades:

* marcar comunicado como leído;
* validar acceso del usuario;
* crear recibo idempotente;
* consultar recibos para administradores.

---

## 12.5. PublicAnnouncementService

Responsabilidades:

* exponer comunicados públicos hacia WordPress;
* aplicar reglas public-safe;
* filtrar por tenant slug;
* no devolver destinatarios ni metadata privada;
* respetar estado del tenant.

---

## 12.6. NotificationTemplateService

Responsabilidades:

* crear plantillas;
* validar código único;
* validar canal;
* validar schema de variables;
* activar/desactivar;
* archivar;
* auditar cambios.

---

## 12.7. NotificationService

Responsabilidades:

* crear notificaciones;
* consultar notificaciones administrativas;
* consultar notificaciones propias;
* marcar como leídas;
* cancelar;
* validar idempotencia;
* coordinar entrega.

---

## 12.8. NotificationRenderingService

Responsabilidades:

* renderizar subject/body desde plantilla;
* validar variables;
* sanitizar salida;
* impedir inyección;
* aplicar minimización por canal.

---

## 12.9. NotificationDeliveryService

Responsabilidades:

* entregar notificaciones por canal;
* registrar intentos;
* manejar fallos;
* reintentar con límite;
* coordinar proveedor email;
* entregar in-app;
* no bloquear transacción principal ante fallo externo.

---

## 12.10. NotificationChannelPolicyService

Responsabilidades:

* determinar si canal está habilitado;
* aplicar preferencias;
* aplicar mandatory override;
* validar restricciones por categoría;
* bloquear canales no configurados.

---

## 12.11. NotificationPreferenceService

Responsabilidades:

* consultar preferencias propias;
* actualizar preferencias propias;
* impedir desactivar categorías obligatorias;
* auditar cambios relevantes.

---

## 12.12. NotificationIdempotencyService

Responsabilidades:

* construir `idempotencyKey`;
* detectar duplicados;
* evitar notificaciones repetidas por evento;
* soportar retries seguros.

---

## 12.13. DestinationMaskingService

Responsabilidades:

* enmascarar emails;
* enmascarar teléfonos;
* evitar persistencia de destinos completos en delivery attempts;
* proveer tests de masking.

---

## 12.14. CommunicationContentSanitizerService

Responsabilidades:

* sanitizar título, resumen y cuerpo;
* bloquear scripts;
* controlar HTML si se permite;
* evitar contenido peligroso;
* preparar DTOs públicos seguros.

---

## 12.15. CommunicationAuditService

Responsabilidades:

* emitir eventos hacia `007-audit`;
* sanitizar metadata;
* evitar payload completo;
* evitar contenido privado completo;
* incluir traceId/correlationId.

---

# 13. Casos de uso

## 13.1. CreateCommunicationUseCase

Endpoint:

```text id="qr3lhv"
POST /api/v1/tenant/communications
```

Responsabilidades:

* validar permiso `communications.create`;
* validar DTO;
* derivar tenant;
* crear comunicado en `draft`;
* validar audiencia si se envía;
* auditar `communication.created`.

---

## 13.2. ListCommunicationsUseCase

Endpoint:

```text id="g4eo9x"
GET /api/v1/tenant/communications
```

Responsabilidades:

* validar permiso `communications.read`;
* filtrar por estado, visibilidad, categoría y fecha;
* paginar;
* aplicar tenantId.

---

## 13.3. GetCommunicationUseCase

Endpoint:

```text id="nqvky1"
GET /api/v1/tenant/communications/{communicationId}
```

Responsabilidades:

* validar permiso;
* cargar por tenant;
* devolver detalle administrativo.

---

## 13.4. UpdateCommunicationUseCase

Endpoint:

```text id="poh2xa"
PATCH /api/v1/tenant/communications/{communicationId}
```

Responsabilidades:

* validar permiso `communications.update`;
* permitir edición solo en `draft` o `scheduled`;
* bloquear edición de `published` salvo campos permitidos por política;
* sanitizar contenido;
* auditar `communication.updated`.

---

## 13.5. PublishCommunicationUseCase

Endpoint:

```text id="rqes64"
POST /api/v1/tenant/communications/{communicationId}/publish
```

Responsabilidades:

* validar permiso `communications.publish`;
* validar estado;
* validar audiencia;
* validar reglas public-safe;
* establecer `publishedAt` y `publishedBy`;
* crear notificaciones in-app si aplica;
* auditar `communication.published`.

---

## 13.6. ScheduleCommunicationUseCase

Endpoint:

```text id="wbibqp"
POST /api/v1/tenant/communications/{communicationId}/schedule
```

Responsabilidades:

* validar permiso `communications.publish`;
* validar `publishAt`;
* mover a `scheduled`;
* auditar `communication.scheduled`.

MVP:

```text id="uxjy09"
Puede registrar el estado scheduled aunque el scheduler automático quede diferido.
```

---

## 13.7. CancelCommunicationUseCase

Endpoint:

```text id="q3zzej"
POST /api/v1/tenant/communications/{communicationId}/cancel
```

Responsabilidades:

* validar permiso `communications.cancel`;
* permitir cancelar `draft` o `scheduled`;
* auditar `communication.cancelled`.

---

## 13.8. ArchiveCommunicationUseCase

Endpoint:

```text id="qqjzco"
POST /api/v1/tenant/communications/{communicationId}/archive
```

Responsabilidades:

* validar permiso `communications.archive`;
* aplicar archivo lógico;
* impedir exposición pública futura;
* auditar `communication.archived`.

---

## 13.9. UpdateCommunicationRecipientsUseCase

Endpoint:

```text id="ccxbfh"
PUT /api/v1/tenant/communications/{communicationId}/recipients
```

Responsabilidades:

* validar permiso `communications.manageAudience`;
* validar estado editable;
* validar referencias por tenant;
* reemplazar destinatarios;
* auditar `communication.audienceUpdated`.

---

## 13.10. ListOwnCommunicationsUseCase

Endpoint:

```text id="eqkf3l"
GET /api/v1/me/communications
```

Responsabilidades:

* validar `communications.read.own`;
* resolver unidades del usuario;
* filtrar comunicados accesibles;
* no devolver borradores;
* no devolver internos si no aplica;
* paginar.

---

## 13.11. GetOwnCommunicationUseCase

Endpoint:

```text id="lcrdaf"
GET /api/v1/me/communications/{communicationId}
```

Responsabilidades:

* validar acceso del usuario;
* devolver DTO minimizado;
* no exponer destinatarios completos;
* no exponer metadata interna.

---

## 13.12. MarkOwnCommunicationReadUseCase

Endpoint:

```text id="pvqb21"
POST /api/v1/me/communications/{communicationId}/mark-read
```

Responsabilidades:

* validar acceso al comunicado;
* crear read receipt idempotente;
* auditar `communication.read` si aplica.

---

## 13.13. ListPublicAnnouncementsUseCase

Endpoint:

```text id="hiq2ji"
GET /api/v1/public/tenants/{slug}/announcements
```

Responsabilidades:

* resolver tenant por slug;
* validar tenant activo;
* listar solo comunicados públicos publicados;
* aplicar public-safe DTO;
* aplicar caché segura;
* no devolver destinatarios.

---

## 13.14. GetPublicAnnouncementUseCase

Endpoint:

```text id="yih4sb"
GET /api/v1/public/tenants/{slug}/announcements/{communicationSlug}
```

Responsabilidades:

* resolver tenant por slug;
* validar `published + public + isPublicVisible`;
* devolver detalle público;
* no exponer datos internos.

---

## 13.15. Notification Template use cases

Endpoints:

```text id="mtaahx"
GET    /api/v1/tenant/notification-templates
POST   /api/v1/tenant/notification-templates
GET    /api/v1/tenant/notification-templates/{templateId}
PATCH  /api/v1/tenant/notification-templates/{templateId}
POST   /api/v1/tenant/notification-templates/{templateId}/activate
POST   /api/v1/tenant/notification-templates/{templateId}/deactivate
POST   /api/v1/tenant/notification-templates/{templateId}/archive
```

Responsabilidades:

* gestionar plantillas;
* validar variables;
* validar canal;
* auditar cambios.

---

## 13.16. CreateNotificationUseCase

Endpoint:

```text id="km6u9t"
POST /api/v1/tenant/notifications
```

Responsabilidades:

* validar permiso `notifications.create`;
* crear notificación manual o administrativa;
* validar destinatario;
* validar plantilla si aplica;
* aplicar idempotencia;
* coordinar entrega si se solicita.

---

## 13.17. HandleDomainEventNotificationUseCase

Responsabilidad:

* recibir evento interno;
* resolver plantilla;
* resolver destinatario;
* crear notificación in-app;
* opcionalmente encolar email;
* usar idempotencia;
* no romper transacción principal si falla proveedor externo.

Eventos candidatos:

```text id="mov0h7"
payment.confirmed
accountStatement.published
reservation.approved
reservation.rejected
fine.issued
fine.appealAccepted
fine.appealRejected
```

---

## 13.18. ListOwnNotificationsUseCase

Endpoint:

```text id="l4hx1k"
GET /api/v1/me/notifications
```

Responsabilidades:

* validar permiso `notifications.read.own`;
* listar solo notificaciones del usuario;
* filtrar por estado/categoría/canal;
* paginar.

---

## 13.19. MarkOwnNotificationReadUseCase

Endpoint:

```text id="zcgdha"
POST /api/v1/me/notifications/{notificationId}/mark-read
```

Responsabilidades:

* validar que la notificación pertenece al usuario;
* establecer `readAt`;
* cambiar estado si corresponde;
* auditar `notification.read`.

---

## 13.20. UpdateOwnNotificationPreferencesUseCase

Endpoint:

```text id="c62v8b"
PUT /api/v1/me/notification-preferences
```

Responsabilidades:

* validar usuario;
* reemplazar preferencias propias;
* impedir desactivar mandatory/security si política lo prohíbe;
* auditar cambios.

---

# 14. Controladores REST

## 14.1. CommunicationsController

Ruta base:

```text id="z0keg4"
/api/v1/tenant/communications
```

Endpoints:

```text id="lxcgv4"
GET /
POST /
GET /:communicationId
PATCH /:communicationId
POST /:communicationId/publish
POST /:communicationId/schedule
POST /:communicationId/cancel
POST /:communicationId/archive
GET /:communicationId/recipients
PUT /:communicationId/recipients
GET /:communicationId/read-receipts
```

Guards:

```text id="as2ic5"
AuthGuard
TenantGuard
TenantPermissionGuard
CommunicationPermissionGuard
```

---

## 14.2. MyCommunicationsController

Ruta base:

```text id="ys2xqg"
/api/v1/me/communications
```

Endpoints:

```text id="mkhzjk"
GET /
GET /:communicationId
POST /:communicationId/mark-read
```

Guards:

```text id="gni5al"
AuthGuard
TenantGuard
TenantPermissionGuard
OwnCommunicationGuard
```

---

## 14.3. PublicAnnouncementsController

Rutas:

```text id="tq5r4f"
/api/v1/public/tenants/:slug/announcements
```

Endpoints:

```text id="vxqrwt"
GET /
GET /:communicationSlug
```

Guards/policies:

```text id="r6n5st"
PublicTenantResolver
PublicCommunicationGuard
RateLimitGuard
CorsPolicy
```

---

## 14.4. NotificationTemplatesController

Ruta base:

```text id="jtjbcp"
/api/v1/tenant/notification-templates
```

Endpoints:

```text id="pngo5w"
GET /
POST /
GET /:templateId
PATCH /:templateId
POST /:templateId/activate
POST /:templateId/deactivate
POST /:templateId/archive
```

---

## 14.5. NotificationsController

Ruta base:

```text id="v79loa"
/api/v1/tenant/notifications
```

Endpoints:

```text id="s3fk0p"
GET /
POST /
GET /:notificationId
POST /:notificationId/send
POST /:notificationId/retry
POST /:notificationId/cancel
GET /:notificationId/delivery-attempts
```

---

## 14.6. MyNotificationsController

Ruta base:

```text id="k7twvs"
/api/v1/me/notifications
```

Endpoints:

```text id="r5dbn0"
GET /
GET /:notificationId
POST /:notificationId/mark-read
POST /mark-all-read
```

---

## 14.7. NotificationPreferencesController

Ruta base:

```text id="o0a4iv"
/api/v1/me/notification-preferences
```

Endpoints:

```text id="m7v7pv"
GET /
PUT /
PATCH /:preferenceId
```

---

# 15. DTOs principales

## 15.1. CreateCommunicationDto

```json id="z9p1di"
{
  "title": "Mantenimiento programado",
  "slug": "mantenimiento-programado",
  "summary": "Se realizará mantenimiento en áreas comunes.",
  "body": "El sábado se realizará mantenimiento desde las 08h00 hasta las 12h00.",
  "category": "maintenance",
  "visibility": "tenant",
  "priority": "normal",
  "audienceType": "allTenantUsers",
  "isPublicVisible": false,
  "publishAt": null,
  "expiresAt": "2026-08-31T05:00:00Z",
  "coverImageUrl": null
}
```

---

## 15.2. CommunicationDto administrativo

```json id="ibyn45"
{
  "id": "communication_uuid",
  "title": "Mantenimiento programado",
  "slug": "mantenimiento-programado",
  "summary": "Se realizará mantenimiento en áreas comunes.",
  "body": "El sábado se realizará mantenimiento desde las 08h00 hasta las 12h00.",
  "category": "maintenance",
  "visibility": "tenant",
  "status": "draft",
  "priority": "normal",
  "audienceType": "allTenantUsers",
  "isPublicVisible": false,
  "publishAt": null,
  "publishedAt": null,
  "expiresAt": "2026-08-31T05:00:00Z",
  "createdAt": "2026-07-19T10:00:00Z",
  "updatedAt": "2026-07-19T10:00:00Z"
}
```

---

## 15.3. UpdateCommunicationRecipientsDto

```json id="ruerhp"
{
  "audienceType": "mixed",
  "recipients": [
    {
      "recipientType": "role",
      "roleId": "role_uuid"
    },
    {
      "recipientType": "propertyUnit",
      "propertyUnitId": "property_unit_uuid"
    },
    {
      "recipientType": "user",
      "userId": "user_uuid"
    }
  ]
}
```

---

## 15.4. PublicAnnouncementDto

```json id="o6sz2z"
{
  "id": "public_communication_id",
  "slug": "mantenimiento-programado",
  "title": "Mantenimiento programado",
  "summary": "Se realizará mantenimiento en áreas comunes.",
  "body": "El sábado se realizará mantenimiento desde las 08h00 hasta las 12h00.",
  "category": "maintenance",
  "priority": "normal",
  "coverImageUrl": null,
  "publishedAt": "2026-07-19T10:00:00Z",
  "expiresAt": "2026-08-31T05:00:00Z",
  "tenantSlug": "altos-del-norte"
}
```

---

## 15.5. CreateNotificationTemplateDto

```json id="ajpdqq"
{
  "code": "RESERVATION_APPROVED",
  "name": "Reserva aprobada",
  "description": "Notificación para reservas aprobadas.",
  "category": "reservation",
  "channel": "inApp",
  "subjectTemplate": null,
  "bodyTemplate": "Su reserva de {{commonAreaName}} fue aprobada.",
  "variablesSchema": {
    "commonAreaName": "string",
    "reservationDate": "string"
  }
}
```

---

## 15.6. CreateNotificationDto

```json id="l9b736"
{
  "recipientUserId": "user_uuid",
  "propertyUnitId": "property_unit_uuid",
  "templateId": "template_uuid",
  "sourceType": "reservation",
  "sourceId": "reservation_uuid",
  "category": "reservation",
  "channel": "inApp",
  "title": "Reserva aprobada",
  "body": "Su reserva fue aprobada.",
  "priority": "normal",
  "actionUrl": "/reservations/reservation_uuid"
}
```

---

## 15.7. OwnNotificationDto

```json id="e03q4d"
{
  "id": "notification_uuid",
  "category": "reservation",
  "channel": "inApp",
  "title": "Reserva aprobada",
  "body": "Su reserva fue aprobada.",
  "status": "delivered",
  "priority": "normal",
  "readAt": null,
  "actionUrl": "/reservations/reservation_uuid",
  "createdAt": "2026-07-19T10:00:00Z"
}
```

---

## 15.8. NotificationPreferenceDto

```json id="i8eqix"
{
  "category": "informational",
  "channel": "email",
  "isEnabled": false
}
```

---

# 16. Autenticación y autorización

## 16.1. Endpoints tenant administrativos

Requieren:

```text id="me83cj"
AuthGuard
TenantGuard
TenantPermissionGuard
```

---

## 16.2. Endpoints `/me`

Requieren:

```text id="c7l9ee"
AuthGuard
TenantGuard
TenantPermissionGuard
OwnCommunicationGuard u OwnNotificationGuard
```

---

## 16.3. Endpoints públicos WordPress

No requieren token de usuario final, pero requieren:

```text id="qtjyou"
tenant slug validation
tenant active validation
public visibility validation
safe public DTO
CORS policy
rate limiting
cache policy
```

---

## 16.4. Permisos

Communications admin:

```text id="z0o3co"
communications.create
communications.read
communications.update
communications.publish
communications.cancel
communications.archive
communications.manageAudience
```

Own communications:

```text id="q10w41"
communications.read.own
communications.markRead.own
```

Notification templates:

```text id="i47vps"
notificationTemplates.create
notificationTemplates.read
notificationTemplates.update
notificationTemplates.archive
```

Notifications admin:

```text id="aqfxg4"
notifications.create
notifications.read
notifications.send
notifications.retry
notifications.cancel
notifications.readDeliveryAttempts
```

Own notifications:

```text id="nnnm3a"
notifications.read.own
notifications.markRead.own
notificationPreferences.read.own
notificationPreferences.update.own
```

Audit and reports:

```text id="j28ja7"
communications.audit.read
communications.reports.read
notifications.audit.read
notifications.reports.read
```

---

# 17. Integración con WordPress

## 17.1. Endpoints públicos

```text id="gqoxzp"
GET /api/v1/public/tenants/{slug}/announcements
GET /api/v1/public/tenants/{slug}/announcements/{communicationSlug}
```

---

## 17.2. Reglas public-safe

Un comunicado público debe cumplir:

```text id="c6eqjb"
tenant.status = active
communication.status = published
communication.visibility = public
communication.isPublicVisible = true
communication.archivedAt IS NULL
communication.expiresAt IS NULL OR communication.expiresAt > now()
```

---

## 17.3. Campos permitidos

```text id="qj98mm"
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

## 17.4. Campos prohibidos

```text id="apqfa2"
tenant internal id
communication internal sequential id
recipients
userIds
personIds
propertyUnitIds
roleIds
createdBy
updatedBy
publishedBy
readReceipts
deliveryAttempts
notification records
preferences
audit data
metadata interna
private/internal/tenant communications
private notifications
financial private details
fine private details
payment private details
evidence
```

---

## 17.5. Cache

Headers recomendados:

```text id="tm7z5m"
Cache-Control: public, max-age=300
ETag
Last-Modified
```

No cachear contenido privado.

---

# 18. Entrega y canales

## 18.1. Canal in-app

Implementación base MVP.

Características:

```text id="vqrs6j"
crea registro Notification
status inicial delivered o pending según política
visible en /api/v1/me/notifications
readAt nullable
mark-read por usuario destinatario
```

Recomendación MVP:

```text id="yllm13"
Para inApp, crear la notificación directamente como delivered.
```

---

## 18.2. Canal email opcional

Implementación mediante `NotificationEmailProviderPort`.

Flujo:

```text id="cbcgdh"
Notification created
DeliveryAttempt created
Email provider send
DeliveryAttempt sent/delivered/failed
Notification status updated
Audit/log/metric
```

MVP:

```text id="h6cibn"
Si no existe proveedor configurado, registrar delivery attempt skipped o failed controlado sin romper la transacción principal.
```

---

## 18.3. Canales futuros

Preparar enums y puertos para:

```text id="xzh34v"
whatsapp
sms
push
webhook
```

No implementar proveedores reales en esta spec.

---

## 18.4. Cola

Estrategia MVP:

```text id="gqvcnc"
- In-app puede ejecutarse síncrono.
- Email debe preferir cola si BullMQ/Redis está disponible.
- Si no hay cola aún, usar adapter síncrono controlado o noop provider.
```

Estrategia futura:

```text id="bsjti4"
BullMQ + Redis para entrega asíncrona, reintentos, backoff y aislamiento de fallos de proveedor.
```

---

## 18.5. Reintentos

MVP:

```text id="hv38k5"
maxAttempts = 3
```

Reglas:

* no reintentar indefinidamente;
* registrar cada intento;
* no duplicar notificación;
* no duplicar entrega si proveedor confirma éxito;
* auditar fallos relevantes.

---

# 19. Idempotencia

## 19.1. Idempotency key de notificación

Formato recomendado:

```text id="sk92o4"
notification:{sourceType}:{sourceId}:{recipientUserId}:{channel}
```

Ejemplos:

```text id="an0zmp"
notification:payment:payment_uuid:user_uuid:inApp
notification:reservation:reservation_uuid:user_uuid:email
notification:fine:fine_uuid:user_uuid:inApp
```

---

## 19.2. Regla

```text id="ffls2d"
Si ya existe una notificación activa con la misma idempotencyKey, no crear duplicado.
```

---

## 19.3. Delivery attempts

La idempotencia de notificación no impide reintentos de entrega.

Regla:

```text id="l43t8c"
Una notificación puede tener varios delivery attempts, pero debe representar un solo mensaje lógico.
```

---

# 20. Integración con eventos de otros módulos

## 20.1. Patrón recomendado

Usar eventos de dominio internos o bus de aplicación.

Flujo:

```text id="obj2lp"
Domain event emitted
Notification handler receives event
Recipient resolution
Template resolution
Notification creation
Delivery enqueue
Audit/log/metric
```

---

## 20.2. Payments

Eventos candidatos:

```text id="m37xor"
payment.reported
payment.confirmed
payment.rejected
payment.reversed
```

Notificaciones:

```text id="mx2461"
PAYMENT_REPORTED
PAYMENT_CONFIRMED
PAYMENT_REJECTED
PAYMENT_REVERSED
```

---

## 20.3. Account Statements

Eventos candidatos:

```text id="wa3raa"
accountStatement.published
accountStatement.closed
```

Notificaciones:

```text id="hg6qz2"
ACCOUNT_STATEMENT_PUBLISHED
ACCOUNT_STATEMENT_CLOSED
```

---

## 20.4. Reservations

Eventos candidatos:

```text id="axkkvi"
reservation.requested
reservation.approved
reservation.rejected
reservation.cancelled
reservation.completed
reservation.noShow
```

Notificaciones:

```text id="sol3g4"
RESERVATION_REQUESTED
RESERVATION_APPROVED
RESERVATION_REJECTED
RESERVATION_CANCELLED
RESERVATION_COMPLETED
RESERVATION_NO_SHOW
```

---

## 20.5. Fines

Eventos candidatos:

```text id="v1t7yh"
fine.issued
fine.disputed
fine.appealAccepted
fine.appealRejected
fine.waived
fine.reversed
```

Notificaciones:

```text id="j15xfq"
FINE_ISSUED
FINE_APPEAL_SUBMITTED
FINE_APPEAL_ACCEPTED
FINE_APPEAL_REJECTED
FINE_WAIVED
FINE_REVERSED
```

---

## 20.6. Identity and access

Eventos candidatos:

```text id="n03hj8"
invitation.created
role.assigned
role.revoked
user.disabled
```

Notificaciones:

```text id="hco97a"
INVITATION_CREATED
ROLE_ASSIGNED
ROLE_REVOKED
USER_DISABLED
```

---

# 21. Auditoría

## 21.1. Eventos mínimos

```text id="v7nrxf"
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

## 21.2. Metadata permitida

```text id="lj5sqc"
communicationId
notificationId
templateId
recipientUserId
recipientType
category
channel
status
fromStatus
toStatus
sourceType
sourceId
traceId
```

---

## 21.3. Metadata prohibida

```text id="ztfp20"
payload completo
body completo si contiene información privada
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
```

---

# 22. Observabilidad

## 22.1. Logs estructurados

Logs sugeridos:

```text id="rzyxvz"
communication.created
communication.updated
communication.published
communication.archived
communication.publicVisibilityChanged
communication.audienceUpdated
notification.created
notification.sent
notification.delivered
notification.failed
notification.read
notification.retryScheduled
notificationDeliveryAttempt.failed
notificationPreference.updated
```

---

## 22.2. Métricas

```text id="wz0jmp"
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

## 22.3. Labels permitidos

```text id="zpnlru"
category
channel
status
priority
outcome
sourceType
visibility
```

---

## 22.4. Labels prohibidos

```text id="s9yp22"
tenantId
communicationId
notificationId
userId
personId
propertyUnitId
email
phone
traceId
```

---

# 23. Seguridad

## 23.1. Controles obligatorios

```text id="p1qh03"
tenant isolation
permission guards
own-resource authorization
audience validation
recipient tenant validation
public visibility validation
safe public DTOs
notification preference validation
mandatory notification policy
template variable validation
content sanitization
destination masking
idempotency keys
rate limiting
audit events
safe logs
safe metrics
provider abstraction
no public notification endpoints
```

---

## 23.2. Riesgos y mitigaciones

| Riesgo                                   | Mitigación                                   |
| ---------------------------------------- | -------------------------------------------- |
| Comunicación cross-tenant                | tenant_id + guards + tests                   |
| Notificación a destinatario incorrecto   | AudienceService + recipient validation       |
| Exposición pública de comunicado privado | PublicAnnouncementService + public DTO tests |
| Exposición de notificaciones privadas    | no public notification routes                |
| Envío de datos sensibles por email       | minimización por canal                       |
| Fuga de emails/teléfonos                 | destination masking                          |
| Duplicidad masiva                        | idempotencyKey                               |
| Plantilla con variables inválidas        | schema validation                            |
| Inyección de contenido                   | sanitizer                                    |
| Logs con contenido privado               | redaction + observability tests              |
| Proveedor caído rompe Core               | delivery adapter + async queue               |
| Preferencias mal aplicadas               | ChannelPolicyService                         |
| WordPress consume privados               | public-safe rules + OpenAPI tests            |

---

# 24. Testing resumido

El documento completo será:

```text id="iu1qbi"
docs/specs/012-communications-notifications/test-plan.md
```

## 24.1. Unit tests

* Communication entity.
* CommunicationRecipient entity.
* CommunicationReadReceipt entity.
* NotificationTemplate entity.
* Notification entity.
* NotificationDeliveryAttempt entity.
* NotificationPreference entity.
* Status value objects.
* Visibility value objects.
* Audience policy.
* Template rendering.
* Destination masking.
* Idempotency.

---

## 24.2. Integration tests

* Crear comunicado.
* Actualizar comunicado.
* Publicar comunicado.
* Programar comunicado.
* Archivar comunicado.
* Gestionar destinatarios.
* Crear read receipt.
* Crear plantilla.
* Crear notificación.
* Crear delivery attempt.
* Actualizar preferencias.
* Multitenancy.

---

## 24.3. API tests

* Communications admin.
* My communications.
* Public announcements.
* Notification templates.
* Notifications admin.
* My notifications.
* Notification preferences.
* Delivery attempts.
* Errores.
* Permisos.
* Paginación.

---

## 24.4. Security tests

* No cross-tenant.
* No comunicación privada pública.
* No notificación pública.
* Usuario no ve notificación ajena.
* Usuario no marca notificación ajena.
* Destinos enmascarados.
* Logs sin body privado completo.
* OpenAPI no documenta endpoints públicos de notificaciones.

---

## 24.5. Public integration tests

```text id="ygyozv"
GET /api/v1/public/tenants/{slug}/announcements
GET /api/v1/public/tenants/{slug}/announcements/{communicationSlug}
```

Casos:

* visible si `published + public + isPublicVisible`;
* no visible si `draft`;
* no visible si `internal`;
* no visible si `tenant`;
* no visible si `expired`;
* no visible si tenant suspendido según política;
* response sin recipients;
* response sin metadata privada.

---

# 25. Orden recomendado de desarrollo

## Incremento 1 — Base del módulo

```text id="gw8cyg"
CommunicationsModule
estructura de carpetas
value objects
errores
DTOs base
guards base
```

---

## Incremento 2 — Communications Core

```text id="cjicdz"
Communication entity
Communication repository
CommunicationService
CommunicationsController
create/list/get/update
```

---

## Incremento 3 — Audience

```text id="kog219"
CommunicationRecipient entity
CommunicationAudienceService
recipient validation
update/list recipients
own-access resolution
```

---

## Incremento 4 — Publication

```text id="v7tpd0"
publish
schedule
cancel
archive
visibility validation
status transitions
audit events
```

---

## Incremento 5 — Own Communications

```text id="ugqb9h"
ListOwnCommunicationsUseCase
GetOwnCommunicationUseCase
MarkOwnCommunicationReadUseCase
CommunicationReadReceipt
OwnCommunicationGuard
```

---

## Incremento 6 — Public Announcements WordPress

```text id="mapc90"
PublicAnnouncementService
PublicAnnouncementsController
public-safe DTO
cache headers
CORS/rate limit integration
```

---

## Incremento 7 — Notification Templates

```text id="xb7f4f"
NotificationTemplate entity
NotificationTemplate repository
NotificationTemplateService
template validation
template rendering
```

---

## Incremento 8 — Notifications In-App

```text id="aaq073"
Notification entity
NotificationService
MyNotificationsController
create/list/get/mark-read
idempotency
```

---

## Incremento 9 — Delivery Attempts and Email Adapter

```text id="x7o29f"
NotificationDeliveryAttempt entity
NotificationDeliveryService
DestinationMaskingService
NotificationEmailProviderPort
Noop/Email adapter
retry/cancel
```

---

## Incremento 10 — Preferences

```text id="h8g5bo"
NotificationPreference entity
NotificationPreferenceService
get/update own preferences
mandatory override rules
```

---

## Incremento 11 — Event Integration

```text id="z7msuh"
HandleDomainEventNotificationUseCase
events from payments
events from account statements
events from reservations
events from fines
template resolution
recipient resolution
```

---

## Incremento 12 — Hardening

```text id="o6xlsi"
OpenAPI
security tests
privacy tests
public negative tests
observability
audit integration
CI gates
SDD review
```

---

# 26. Performance

## 26.1. Objetivo MVP

```text id="crsjtm"
p95 < 700 ms para listados paginados de comunicados y notificaciones con filtros comunes.
```

---

## 26.2. Estrategias

```text id="edl3oe"
índices por tenant/status/category/visibility
índices por recipientUserId
paginación obligatoria
pageSize máximo 100
no cargar recipients pesados por defecto
no cargar delivery attempts en listados
DTO público reducido
evitar N+1
colas para envíos externos
```

---

# 27. Criterios técnicos de aceptación

La implementación técnica se acepta si:

* existe módulo `communications`;
* existen tablas requeridas;
* existe gestión administrativa de comunicados;
* existe gestión de audiencia;
* existe publicación/cancelación/archivo;
* existe consulta de comunicados propios;
* existe marcado de lectura;
* existe consulta pública segura para WordPress;
* existe gestión de plantillas;
* existe generación de notificaciones in-app;
* existe consulta de notificaciones propias;
* existe marcado de notificaciones como leídas;
* existe registro de delivery attempts;
* existe soporte de preferencias básicas;
* existe idempotencia de notificaciones;
* existe adapter para email o noop controlado;
* no existen endpoints públicos de notificaciones privadas;
* no se exponen comunicados privados en WordPress;
* destinos externos se guardan enmascarados;
* auditoría implementada;
* logs y métricas sanitizados;
* OpenAPI actualizado;
* pruebas pasan;
* CI pasa.

---

# 28. Comandos esperados

Comandos generales:

```bash id="u57il4"
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run test:api
npm run test:authorization
npm run test:multitenancy
npm run test:security
npm run openapi:validate
npm run build
```

Comandos específicos sugeridos:

```bash id="wywt8v"
npm run test:communications
npm run test:communications:unit
npm run test:communications:integration
npm run test:communications:api
npm run test:communications:authorization
npm run test:communications:multitenancy
npm run test:communications:public
npm run test:communications:notifications
npm run test:communications:preferences
npm run test:communications:security
npm run test:communications:openapi
```

---

# 29. Riesgos de implementación

| Riesgo                                     | Impacto    | Mitigación                        |
| ------------------------------------------ | ---------- | --------------------------------- |
| Comunicación cross-tenant                  | Crítico    | tenant_id + guards + tests        |
| Notificación a usuario equivocado          | Alto       | AudienceService + directory ports |
| Comunicación privada pública               | Crítico    | public-safe service + tests       |
| Notificación pública accidental            | Crítico    | no public notification routes     |
| Destino externo completo persistido        | Alto       | DestinationMaskingService         |
| Email proveedor caído                      | Medio      | adapter + queue + retry           |
| Duplicidad de notificaciones               | Medio/alto | idempotencyKey                    |
| Inyección en plantilla                     | Alto       | variable schema + sanitizer       |
| Logs con contenido sensible                | Alto       | logging policy                    |
| Preferencias mal aplicadas                 | Medio      | ChannelPolicyService              |
| Eventos de otros módulos duplican mensajes | Medio      | source-based idempotency          |
| Scheduler automático incompleto            | Medio      | diferido documentado              |

---

# 30. Checklist para agentes IA

Antes de generar código para este módulo, el agente debe leer:

```text id="nd9t4c"
docs/sdd/constitution.md
docs/sdd/domain-map.md
docs/sdd/architecture.md
docs/sdd/security.md
docs/sdd/api-guidelines.md
docs/sdd/data-governance.md
docs/specs/001-tenants/
docs/specs/002-users-roles/
docs/specs/003-residents-properties/
docs/specs/007-audit/
docs/specs/009-wordpress-integration-basic/
docs/specs/010-reservations-common-areas/
docs/specs/011-fines-sanctions/
docs/specs/012-communications-notifications/spec.md
docs/specs/012-communications-notifications/plan.md
```

El agente no debe:

```text id="xqk85w"
permitir comunicaciones cross-tenant
omitir tenantId
aceptar tenantId desde body
exponer comunicados privados públicamente
exponer notificaciones bajo /api/v1/public
exponer recipients en endpoints públicos
exponer emails o teléfonos completos
guardar provider credentials en metadata
guardar raw provider response completo
crear notificaciones duplicadas
ignorar preferencias salvo mandatory/security permitido
enviar detalles financieros sensibles por canales externos
enviar detalles de multas o evidencias por canales externos
usar IA externa con datos reales
implementar WhatsApp real fuera de scope
implementar SMS real fuera de scope
implementar push real fuera de scope
implementar chat fuera de scope
implementar marketing automation fuera de scope
```

---

# 31. Pendientes para documentos derivados

## 31.1. `data-model.md`

Debe detallar:

* tablas;
* enums;
* Prisma models;
* relaciones;
* constraints;
* índices;
* soft delete;
* audiencia;
* read receipts;
* templates;
* delivery attempts;
* preferences;
* idempotency keys;
* public-safe rules.

---

## 31.2. `api-contract.md`

Debe detallar:

* endpoints administrativos;
* endpoints `/me`;
* endpoints públicos WordPress;
* permisos;
* DTOs;
* responses;
* errores;
* filtros;
* paginación;
* headers;
* OpenAPI.

---

## 31.3. `test-plan.md`

Debe detallar:

* unit tests;
* integration tests;
* API tests;
* authorization tests;
* own-resource tests;
* multitenancy tests;
* public safety tests;
* privacy tests;
* notification delivery tests;
* preference tests;
* OpenAPI tests.

---

## 31.4. `tasks.md`

Debe convertir este plan en tareas ejecutables.

---

## 31.5. `security-notes.md`

Debe detallar:

* riesgos cross-tenant;
* riesgos de exposición pública;
* riesgos de notificación ajena;
* riesgos de canales externos;
* riesgos de plantillas;
* riesgos de logs;
* controles de auditoría;
* controles de privacidad.

---

# 32. Decisión final de implementación

El módulo `012-communications-notifications` se implementará como módulo transaccional y operativo dentro de RESIDENT Core para administrar comunicados y notificaciones.

Para MVP:

```text id="dixfn8"
- Crear comunicados administrativos.
- Editar comunicados en estados permitidos.
- Gestionar audiencia básica.
- Publicar comunicados.
- Cancelar comunicados.
- Archivar comunicados.
- Consultar comunicados administrativos.
- Consultar comunicados propios.
- Marcar comunicados como leídos.
- Exponer comunicados públicos a WordPress.
- Crear plantillas básicas.
- Generar notificaciones in-app.
- Consultar notificaciones propias.
- Marcar notificaciones propias como leídas.
- Registrar delivery attempts.
- Soportar email mediante puerto/adaptador opcional o noop.
- Gestionar preferencias básicas.
- Evitar duplicados por idempotencia.
- Auditar operaciones críticas.
- No implementar WhatsApp real.
- No implementar SMS real.
- No implementar push real.
- No implementar chat.
- No implementar marketing automation.
- No usar IA externa con datos reales.
```

El módulo debe garantizar:

```text id="l0lydk"
tenant isolation
permissioned actions
own-resource protection
audience validation
public-safe WordPress exposure
private notification protection
template validation
content sanitization
destination masking
notification idempotency
preference enforcement
safe external delivery
auditability
observability without sensitive leakage
```

La implementación no debe aceptarse si permite comunicaciones cross-tenant, expone comunicados privados públicamente, permite leer notificaciones ajenas, expone notificaciones en WordPress, almacena destinos completos sin enmascarar, duplica notificaciones por evento, envía datos sensibles por canales externos, registra secretos en logs, omite auditoría o mezcla lógica de comunicación con pagos, multas, reservas o estados de cuenta.
