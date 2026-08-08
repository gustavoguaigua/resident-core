# API Contract — Spec 012 Communications and Notifications

## 1. Información del documento

| Campo           | Valor                                                                                                             |
| --------------- | ----------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                     |
| Spec ID         | 012                                                                                                               |
| Módulo          | Communications and Notifications                                                                                  |
| Documento       | API Contract                                                                                                      |
| Ruta            | `docs/specs/012-communications-notifications/api-contract.md`                                                     |
| Versión         | 0.1                                                                                                               |
| Estado          | Borrador inicial                                                                                                  |
| Fecha           | 2026-07-19                                                                                                        |
| Documento base  | `docs/specs/012-communications-notifications/spec.md`                                                             |
| Plan técnico    | `docs/specs/012-communications-notifications/plan.md`                                                             |
| Modelo de datos | `docs/specs/012-communications-notifications/data-model.md`                                                       |
| API Style       | REST                                                                                                              |
| API Version     | `/api/v1`                                                                                                         |
| Naturaleza      | Tenant-scoped / Audience-aware / Event-aware / Channel-aware / Public-safe / Auditable                            |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `007-audit`, `009-wordpress-integration-basic`      |
| Relacionado con | `004-dues-fees`, `005-payments`, `006-account-statements`, `010-reservations-common-areas`, `011-fines-sanctions` |

---

## 2. Propósito

Este documento define el contrato API REST del módulo `012-communications-notifications`.

El módulo permite administrar comunicados, destinatarios, lecturas, plantillas, notificaciones, intentos de entrega y preferencias de notificación, garantizando aislamiento por tenant, control de audiencia, privacidad, exposición pública segura hacia WordPress y trazabilidad auditable.

Regla central:

```text id="k2q7ka"
Toda comunicación o notificación debe estar autenticada y autorizada cuando sea privada, tenant-scoped, audience-aware, visibility-controlled, idempotent, auditable y public-safe cuando se exponga hacia WordPress.
```

---

## 3. Principios del contrato API

### 3.1. Tenant scope obligatorio

Todos los endpoints administrativos y `/me` operan dentro del tenant activo del usuario autenticado.

Regla:

```text id="a2k3ve"
currentTenant.id debe usarse como tenant_id efectivo en toda consulta y mutación.
```

El cliente no debe enviar `tenantId` en el body.

---

### 3.2. Autenticación y autorización

Los endpoints administrativos y propios requieren:

```text id="pfh741"
Authorization: Bearer <access_token>
```

El token autentica al usuario, pero la autorización se resuelve dentro de RESIDENT Core.

Regla:

```text id="gh74xp"
Keycloak autentica; RESIDENT Core autoriza por tenant, permiso, audiencia, destinatario y recurso.
```

---

### 3.3. Endpoints públicos limitados

Solo existen endpoints públicos para comunicados publicables hacia WordPress.

Permitido:

```text id="hz5olb"
GET /api/v1/public/tenants/{slug}/announcements
GET /api/v1/public/tenants/{slug}/announcements/{communicationSlug}
```

Prohibido:

```text id="mfi4jp"
endpoints públicos de notificaciones
endpoints públicos de preferencias
endpoints públicos de destinatarios
endpoints públicos de intentos de entrega
endpoints públicos de lectura de comunicados
```

---

### 3.4. Audiencia controlada

Los comunicados no públicos requieren audiencia.

Audiencias soportadas:

```text id="oxvs5l"
allTenantUsers
owners
residents
propertyUnits
roles
specificUsers
mixed
```

---

### 3.5. Public-safe DTO obligatorio

Los endpoints públicos no deben devolver:

```text id="ri8cp6"
recipients
userIds
personIds
propertyUnitIds
roleIds
readReceipts
notifications
deliveryAttempts
preferences
audit data
metadata interna
```

---

### 3.6. Notificaciones privadas

Las notificaciones son privadas por defecto.

Regla:

```text id="bv3b2b"
Una notificación solo puede ser consultada por su destinatario o por usuarios administrativos con permisos explícitos dentro del tenant.
```

---

### 3.7. Idempotencia

Las notificaciones generadas por evento deben usar `idempotencyKey`.

Formato recomendado:

```text id="qlg8u9"
notification:{sourceType}:{sourceId}:{recipientUserId}:{channel}
```

---

### 3.8. Entrega externa desacoplada

El fallo de un proveedor externo de email, WhatsApp, SMS, push o webhook no debe romper una transacción principal de negocio, salvo notificación crítica explícitamente configurada.

---

### 3.9. Destinos enmascarados

Los intentos de entrega deben almacenar destinos enmascarados.

Ejemplos:

```text id="ywtimh"
g*****o@example.com
+593*******321
```

---

### 3.10. No contenido sensible en logs

El contrato no permite que respuestas, errores, logs o metadata expongan:

```text id="eqv570"
tokens
secretos
emails completos
teléfonos completos
body privado completo
provider raw response completo
datos financieros detallados
evidencias
comprobantes
```

---

## 4. Rutas base

### 4.1. Communications administrativas

```text id="l30471"
/api/v1/tenant/communications
```

---

### 4.2. Communications propias

```text id="bywtib"
/api/v1/me/communications
```

---

### 4.3. Public announcements WordPress

```text id="ky8j3y"
/api/v1/public/tenants/{slug}/announcements
```

---

### 4.4. Notification Templates

```text id="cz8to9"
/api/v1/tenant/notification-templates
```

---

### 4.5. Notifications administrativas

```text id="pm82oi"
/api/v1/tenant/notifications
```

---

### 4.6. Notifications propias

```text id="mwceqr"
/api/v1/me/notifications
```

---

### 4.7. Notification Preferences propias

```text id="d2rmfw"
/api/v1/me/notification-preferences
```

---

## 5. Headers

### 5.1. Headers para endpoints autenticados

| Header             |              Requerido | Descripción                                                  |
| ------------------ | ---------------------: | ------------------------------------------------------------ |
| `Authorization`    |                     Sí | Bearer token                                                 |
| `Content-Type`     | Sí para POST/PATCH/PUT | `application/json`                                           |
| `Accept`           |            Recomendado | `application/json`                                           |
| `X-Request-Id`     |               Opcional | ID de request                                                |
| `X-Correlation-Id` |               Opcional | ID de correlación                                            |
| `Idempotency-Key`  |            Recomendado | Prevención de duplicidad en notificaciones manuales o envíos |

---

### 5.2. Headers para endpoints públicos

| Header              |   Requerido | Descripción        |
| ------------------- | ----------: | ------------------ |
| `Accept`            | Recomendado | `application/json` |
| `If-None-Match`     |    Opcional | Cache HTTP         |
| `If-Modified-Since` |    Opcional | Cache HTTP         |
| `X-Request-Id`      |    Opcional | ID de request      |

---

### 5.3. Response headers administrativos

```text id="t8nwa3"
Content-Type: application/json
Cache-Control: no-store
X-Request-Id: <request-id>
X-Correlation-Id: <correlation-id>
```

---

### 5.4. Response headers públicos

```text id="ghgwq1"
Content-Type: application/json
Cache-Control: public, max-age=300
ETag: <etag>
Last-Modified: <date>
X-Request-Id: <request-id>
```

---

## 6. Formato estándar de respuesta

### 6.1. Respuesta individual

```json id="s8zvto"
{
  "data": {},
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

### 6.2. Respuesta paginada

```json id="zj7v72"
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5,
    "traceId": "req_123456"
  }
}
```

---

### 6.3. Error estándar

```json id="t9773d"
{
  "error": {
    "code": "COMMUNICATION_NOT_FOUND",
    "message": "Communication not found.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

## 7. Estados HTTP

| Código | Uso                                            |
| -----: | ---------------------------------------------- |
|    200 | Consulta o acción exitosa                      |
|    201 | Recurso creado                                 |
|    204 | Acción exitosa sin cuerpo, si se adopta        |
|    304 | Contenido público no modificado                |
|    400 | Request mal formado                            |
|    401 | No autenticado                                 |
|    403 | Sin permiso o sin acceso al recurso            |
|    404 | Recurso no encontrado o no accesible           |
|    409 | Conflicto de estado, duplicidad o idempotencia |
|    422 | Validación semántica fallida                   |
|    429 | Rate limit                                     |
|    500 | Error interno controlado                       |
|    503 | Proveedor externo no disponible, si aplica     |

---

## 8. Permisos

### 8.1. Communications administrativas

```text id="aepoxy"
communications.create
communications.read
communications.update
communications.publish
communications.cancel
communications.archive
communications.manageAudience
```

---

### 8.2. Communications propias

```text id="vv515v"
communications.read.own
communications.markRead.own
```

---

### 8.3. Notification Templates

```text id="jnmid2"
notificationTemplates.create
notificationTemplates.read
notificationTemplates.update
notificationTemplates.archive
```

---

### 8.4. Notifications administrativas

```text id="y7xfe7"
notifications.create
notifications.read
notifications.send
notifications.retry
notifications.cancel
notifications.readDeliveryAttempts
```

---

### 8.5. Notifications propias

```text id="ln5s2v"
notifications.read.own
notifications.markRead.own
```

---

### 8.6. Notification Preferences propias

```text id="ld4thc"
notificationPreferences.read.own
notificationPreferences.update.own
```

---

### 8.7. Auditoría y reportes

```text id="e7jm3o"
communications.audit.read
communications.reports.read
notifications.audit.read
notifications.reports.read
```

---

## 9. Enums API

### 9.1. CommunicationStatus

```text id="r60am1"
draft
scheduled
published
expired
archived
cancelled
```

---

### 9.2. CommunicationVisibility

```text id="jv18lm"
private
internal
tenant
public
```

---

### 9.3. CommunicationCategory

```text id="tqhkqn"
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

### 9.4. CommunicationPriority

```text id="cl4dpk"
low
normal
high
urgent
```

---

### 9.5. AudienceType

```text id="j9h1sj"
allTenantUsers
owners
residents
propertyUnits
roles
specificUsers
mixed
```

---

### 9.6. CommunicationRecipientType

```text id="jeyjfd"
user
person
propertyUnit
role
owner
resident
allTenantUsers
```

---

### 9.7. NotificationTemplateStatus

```text id="m8o0ik"
active
inactive
archived
```

---

### 9.8. NotificationStatus

```text id="d2jw1p"
pending
sent
delivered
failed
read
archived
cancelled
```

---

### 9.9. NotificationChannel

```text id="wsm5gn"
inApp
email
whatsapp
sms
push
webhook
```

MVP obligatorio:

```text id="n72fbs"
inApp
```

MVP opcional:

```text id="ulv8l5"
email
```

Diferidos:

```text id="vu02cj"
whatsapp
sms
push
webhook
```

---

### 9.10. NotificationCategory

```text id="q31eej"
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

### 9.11. NotificationPriority

```text id="m39y0w"
low
normal
high
urgent
```

---

### 9.12. DeliveryAttemptStatus

```text id="c1vaze"
pending
sent
delivered
failed
cancelled
skipped
```

---

### 9.13. NotificationSourceType

```text id="lb74eb"
manual
communication
payment
accountStatement
reservation
fine
meeting
security
system
other
```

---

# 10. Communications administrativas

## 10.1. Listar comunicados administrativos

### Endpoint

```http id="d54ukk"
GET /api/v1/tenant/communications
```

### Autenticación

Requiere Bearer token.

### Permiso

```text id="wjofyc"
communications.read
```

### Query params

| Nombre            | Tipo      | Requerido | Descripción                                                                                     |
| ----------------- | --------- | --------: | ----------------------------------------------------------------------------------------------- |
| `status`          | string    |        No | Estado                                                                                          |
| `visibility`      | string    |        No | Visibilidad                                                                                     |
| `category`        | string    |        No | Categoría                                                                                       |
| `priority`        | string    |        No | Prioridad                                                                                       |
| `audienceType`    | string    |        No | Audiencia                                                                                       |
| `isPublicVisible` | boolean   |        No | Marcado público                                                                                 |
| `publishedFrom`   | date-time |        No | Publicado desde                                                                                 |
| `publishedTo`     | date-time |        No | Publicado hasta                                                                                 |
| `expiresFrom`     | date-time |        No | Expira desde                                                                                    |
| `expiresTo`       | date-time |        No | Expira hasta                                                                                    |
| `q`               | string    |        No | Búsqueda por título, slug o resumen                                                             |
| `page`            | number    |        No | Default 1                                                                                       |
| `pageSize`        | number    |        No | Default 20, máximo 100                                                                          |
| `sortBy`          | string    |        No | `createdAt`, `updatedAt`, `publishedAt`, `expiresAt`, `title`, `status`, `category`, `priority` |
| `sortOrder`       | string    |        No | `asc`, `desc`                                                                                   |

### Response 200

```json id="ubbxqs"
{
  "data": [
    {
      "id": "communication_uuid",
      "publicId": "public_uuid",
      "title": "Mantenimiento programado",
      "slug": "mantenimiento-programado",
      "summary": "Se realizará mantenimiento en áreas comunes.",
      "category": "maintenance",
      "visibility": "tenant",
      "status": "published",
      "priority": "normal",
      "audienceType": "allTenantUsers",
      "isPublicVisible": false,
      "publishedAt": "2026-08-01T14:00:00Z",
      "expiresAt": "2026-08-31T05:00:00Z",
      "updatedAt": "2026-08-01T14:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1,
    "traceId": "req_123456"
  }
}
```

---

## 10.2. Crear comunicado

### Endpoint

```http id="kapkbw"
POST /api/v1/tenant/communications
```

### Permiso

```text id="dwgzea"
communications.create
```

### Request body

```json id="xhf0dt"
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
  "coverImageUrl": null,
  "recipients": [
    {
      "recipientType": "allTenantUsers"
    }
  ]
}
```

### Response 201

```json id="l1z3bz"
{
  "data": {
    "id": "communication_uuid",
    "publicId": "public_uuid",
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
    "coverImageUrl": null,
    "createdAt": "2026-07-19T10:00:00Z",
    "updatedAt": "2026-07-19T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Eventos auditables

```text id="h5tmgw"
communication.created
```

---

## 10.3. Obtener comunicado administrativo

### Endpoint

```http id="av3ne3"
GET /api/v1/tenant/communications/{communicationId}
```

### Permiso

```text id="vcbozd"
communications.read
```

### Response 200

```json id="de1j8q"
{
  "data": {
    "id": "communication_uuid",
    "publicId": "public_uuid",
    "title": "Mantenimiento programado",
    "slug": "mantenimiento-programado",
    "summary": "Se realizará mantenimiento en áreas comunes.",
    "body": "El sábado se realizará mantenimiento desde las 08h00 hasta las 12h00.",
    "category": "maintenance",
    "visibility": "tenant",
    "status": "published",
    "priority": "normal",
    "audienceType": "allTenantUsers",
    "isPublicVisible": false,
    "publishAt": null,
    "publishedAt": "2026-08-01T14:00:00Z",
    "expiresAt": "2026-08-31T05:00:00Z",
    "coverImageUrl": null,
    "createdAt": "2026-07-19T10:00:00Z",
    "updatedAt": "2026-08-01T14:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 10.4. Actualizar comunicado

### Endpoint

```http id="hfbcvu"
PATCH /api/v1/tenant/communications/{communicationId}
```

### Permiso

```text id="ebcwid"
communications.update
```

### Estados editables

```text id="q4dk2s"
draft
scheduled
```

### Request body

```json id="wh7lmn"
{
  "title": "Mantenimiento programado actualizado",
  "summary": "Actualización de horario de mantenimiento.",
  "body": "El sábado se realizará mantenimiento desde las 09h00 hasta las 13h00.",
  "category": "maintenance",
  "visibility": "tenant",
  "priority": "high",
  "expiresAt": "2026-08-31T05:00:00Z",
  "coverImageUrl": null
}
```

### Response 200

```json id="jaztw7"
{
  "data": {
    "id": "communication_uuid",
    "title": "Mantenimiento programado actualizado",
    "summary": "Actualización de horario de mantenimiento.",
    "body": "El sábado se realizará mantenimiento desde las 09h00 hasta las 13h00.",
    "category": "maintenance",
    "visibility": "tenant",
    "status": "draft",
    "priority": "high",
    "updatedAt": "2026-07-19T11:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Evento auditable

```text id="bxs2lt"
communication.updated
```

---

## 10.5. Publicar comunicado

### Endpoint

```http id="ly6kg2"
POST /api/v1/tenant/communications/{communicationId}/publish
```

### Permiso

```text id="jx5byd"
communications.publish
```

### Request body opcional

```json id="kk5f7g"
{
  "publishNow": true,
  "notifyAudience": true,
  "channels": ["inApp"]
}
```

### Response 200

```json id="w5ymzp"
{
  "data": {
    "id": "communication_uuid",
    "status": "published",
    "publishedAt": "2026-08-01T14:00:00Z",
    "isPublicVisible": false,
    "notificationsCreated": 52
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Comunicado debe estar en estado publicable.
* Si no es público, debe tener audiencia.
* Si `visibility = public`, puede publicarse sin audiencia privada.
* Si `notifyAudience = true`, debe crear notificaciones idempotentes por usuario.
* Debe auditar publicación.

### Eventos auditables

```text id="wwemvi"
communication.published
notification.created
```

---

## 10.6. Programar comunicado

### Endpoint

```http id="svxy0g"
POST /api/v1/tenant/communications/{communicationId}/schedule
```

### Permiso

```text id="amyv8q"
communications.publish
```

### Request body

```json id="yguatg"
{
  "publishAt": "2026-08-10T14:00:00Z"
}
```

### Response 200

```json id="tuq1yr"
{
  "data": {
    "id": "communication_uuid",
    "status": "scheduled",
    "publishAt": "2026-08-10T14:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Evento auditable

```text id="wmsg0d"
communication.scheduled
```

---

## 10.7. Cancelar comunicado

### Endpoint

```http id="t1c32x"
POST /api/v1/tenant/communications/{communicationId}/cancel
```

### Permiso

```text id="xw2les"
communications.cancel
```

### Request body

```json id="xum59p"
{
  "reason": "El comunicado será reemplazado por una versión corregida."
}
```

### Response 200

```json id="e8l5mg"
{
  "data": {
    "id": "communication_uuid",
    "status": "cancelled"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Evento auditable

```text id="rf0hof"
communication.cancelled
```

---

## 10.8. Archivar comunicado

### Endpoint

```http id="yixb38"
POST /api/v1/tenant/communications/{communicationId}/archive
```

### Permiso

```text id="yis1tr"
communications.archive
```

### Request body opcional

```json id="r28qt7"
{
  "reason": "Comunicado finalizado."
}
```

### Response 200

```json id="yowj6e"
{
  "data": {
    "id": "communication_uuid",
    "status": "archived",
    "archivedAt": "2026-08-31T15:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Evento auditable

```text id="ufew2v"
communication.archived
```

---

## 10.9. Listar destinatarios de comunicado

### Endpoint

```http id="xdyj7z"
GET /api/v1/tenant/communications/{communicationId}/recipients
```

### Permiso

```text id="cy3q94"
communications.read
```

### Response 200

```json id="f4fwu9"
{
  "data": [
    {
      "id": "recipient_uuid",
      "communicationId": "communication_uuid",
      "recipientType": "allTenantUsers",
      "userId": null,
      "personId": null,
      "propertyUnitId": null,
      "roleId": null,
      "createdAt": "2026-07-19T10:00:00Z"
    }
  ],
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 10.10. Reemplazar destinatarios de comunicado

### Endpoint

```http id="tzeeri"
PUT /api/v1/tenant/communications/{communicationId}/recipients
```

### Permiso

```text id="he6hs1"
communications.manageAudience
```

### Estados permitidos

```text id="ym5ohp"
draft
scheduled
```

### Request body

```json id="s0mdds"
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

### Response 200

```json id="p12xhg"
{
  "data": {
    "communicationId": "communication_uuid",
    "audienceType": "mixed",
    "recipientsCount": 3
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Todas las referencias deben pertenecer al tenant.
* No se permiten usuarios, roles, personas o unidades de otro tenant.
* No se actualiza audiencia de comunicados publicados salvo política explícita.

### Evento auditable

```text id="flwsif"
communication.audienceUpdated
```

---

## 10.11. Listar lecturas de comunicado

### Endpoint

```http id="bnx0vb"
GET /api/v1/tenant/communications/{communicationId}/read-receipts
```

### Permiso

```text id="n6qaox"
communications.read
```

### Query params

| Nombre     | Tipo      | Requerido | Descripción            |
| ---------- | --------- | --------: | ---------------------- |
| `readFrom` | date-time |        No | Fecha de lectura desde |
| `readTo`   | date-time |        No | Fecha de lectura hasta |
| `page`     | number    |        No | Página                 |
| `pageSize` | number    |        No | Tamaño                 |

### Response 200

```json id="tgz8p8"
{
  "data": [
    {
      "id": "receipt_uuid",
      "communicationId": "communication_uuid",
      "userId": "user_uuid",
      "readAt": "2026-08-01T16:10:00Z",
      "createdAt": "2026-08-01T16:10:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1,
    "traceId": "req_123456"
  }
}
```

---

# 11. Communications propias `/me`

## 11.1. Listar mis comunicados

### Endpoint

```http id="bri3p1"
GET /api/v1/me/communications
```

### Permiso

```text id="kw99tm"
communications.read.own
```

### Query params

| Nombre          | Tipo      | Requerido | Descripción                                     |
| --------------- | --------- | --------: | ----------------------------------------------- |
| `category`      | string    |        No | Categoría                                       |
| `priority`      | string    |        No | Prioridad                                       |
| `publishedFrom` | date-time |        No | Publicado desde                                 |
| `publishedTo`   | date-time |        No | Publicado hasta                                 |
| `unreadOnly`    | boolean   |        No | Solo no leídos                                  |
| `page`          | number    |        No | Página                                          |
| `pageSize`      | number    |        No | Tamaño                                          |
| `sortBy`        | string    |        No | `publishedAt`, `expiresAt`, `priority`, `title` |
| `sortOrder`     | string    |        No | `asc`, `desc`                                   |

### Response 200

```json id="v82fuo"
{
  "data": [
    {
      "id": "communication_uuid",
      "title": "Mantenimiento programado",
      "slug": "mantenimiento-programado",
      "summary": "Se realizará mantenimiento en áreas comunes.",
      "category": "maintenance",
      "priority": "normal",
      "publishedAt": "2026-08-01T14:00:00Z",
      "expiresAt": "2026-08-31T05:00:00Z",
      "coverImageUrl": null,
      "readAt": null
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1,
    "traceId": "req_123456"
  }
}
```

### Reglas

* Solo devuelve comunicados publicados.
* Solo devuelve comunicados accesibles para el usuario.
* No devuelve destinatarios.
* No devuelve metadata interna.
* No devuelve auditoría.

---

## 11.2. Obtener mi comunicado

### Endpoint

```http id="tqcdx5"
GET /api/v1/me/communications/{communicationId}
```

### Permiso

```text id="rnm8ad"
communications.read.own
```

### Response 200

```json id="vcdg4j"
{
  "data": {
    "id": "communication_uuid",
    "title": "Mantenimiento programado",
    "slug": "mantenimiento-programado",
    "summary": "Se realizará mantenimiento en áreas comunes.",
    "body": "El sábado se realizará mantenimiento desde las 09h00 hasta las 13h00.",
    "category": "maintenance",
    "priority": "normal",
    "publishedAt": "2026-08-01T14:00:00Z",
    "expiresAt": "2026-08-31T05:00:00Z",
    "coverImageUrl": null,
    "readAt": null
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 11.3. Marcar comunicado como leído

### Endpoint

```http id="doqhpo"
POST /api/v1/me/communications/{communicationId}/mark-read
```

### Permiso

```text id="fqf365"
communications.markRead.own
```

### Response 200

```json id="athw8f"
{
  "data": {
    "communicationId": "communication_uuid",
    "readAt": "2026-08-01T16:10:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* El comunicado debe ser accesible para el usuario.
* La operación debe ser idempotente.
* No se puede marcar como leído un comunicado ajeno o no accesible.

### Evento auditable

```text id="femzm8"
communication.read
```

---

# 12. Public announcements WordPress

## 12.1. Listar comunicados públicos

### Endpoint

```http id="bg0q6o"
GET /api/v1/public/tenants/{slug}/announcements
```

### Autenticación

No requiere token de usuario final.

### Query params

| Nombre          | Tipo      | Requerido | Descripción                        |
| --------------- | --------- | --------: | ---------------------------------- |
| `category`      | string    |        No | Categoría                          |
| `priority`      | string    |        No | Prioridad                          |
| `publishedFrom` | date-time |        No | Publicado desde                    |
| `publishedTo`   | date-time |        No | Publicado hasta                    |
| `page`          | number    |        No | Página                             |
| `pageSize`      | number    |        No | Tamaño, máximo 50 público          |
| `sortBy`        | string    |        No | `publishedAt`, `priority`, `title` |
| `sortOrder`     | string    |        No | `asc`, `desc`                      |

### Response 200

```json id="tav2eb"
{
  "data": [
    {
      "publicId": "public_uuid",
      "slug": "mantenimiento-programado",
      "title": "Mantenimiento programado",
      "summary": "Se realizará mantenimiento en áreas comunes.",
      "body": "El sábado se realizará mantenimiento desde las 09h00 hasta las 13h00.",
      "category": "maintenance",
      "priority": "normal",
      "coverImageUrl": null,
      "publishedAt": "2026-08-01T14:00:00Z",
      "expiresAt": "2026-08-31T05:00:00Z",
      "tenantSlug": "altos-del-norte"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1,
    "traceId": "req_123456"
  }
}
```

### Reglas

Solo devuelve comunicados que cumplan:

```text id="p3vbls"
tenant.status = active
communication.status = published
communication.visibility = public
communication.isPublicVisible = true
communication.archivedAt IS NULL
communication.expiresAt IS NULL OR communication.expiresAt > now()
```

No devuelve:

```text id="qe01kv"
recipients
readReceipts
notifications
deliveryAttempts
preferences
audit data
metadata interna
```

---

## 12.2. Obtener comunicado público

### Endpoint

```http id="ljdp5x"
GET /api/v1/public/tenants/{slug}/announcements/{communicationSlug}
```

### Response 200

```json id="zi5ne8"
{
  "data": {
    "publicId": "public_uuid",
    "slug": "mantenimiento-programado",
    "title": "Mantenimiento programado",
    "summary": "Se realizará mantenimiento en áreas comunes.",
    "body": "El sábado se realizará mantenimiento desde las 09h00 hasta las 13h00.",
    "category": "maintenance",
    "priority": "normal",
    "coverImageUrl": null,
    "publishedAt": "2026-08-01T14:00:00Z",
    "expiresAt": "2026-08-31T05:00:00Z",
    "tenantSlug": "altos-del-norte"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Errores esperados

| Caso                  | HTTP |
| --------------------- | ---: |
| Tenant no existe      |  404 |
| Tenant no activo      |  404 |
| Comunicado no existe  |  404 |
| Comunicado no público |  404 |
| Comunicado expirado   |  404 |
| Comunicado archivado  |  404 |

---

# 13. Notification Templates

## 13.1. Listar plantillas

### Endpoint

```http id="arntrm"
GET /api/v1/tenant/notification-templates
```

### Permiso

```text id="rss028"
notificationTemplates.read
```

### Query params

| Nombre      | Tipo    | Requerido | Descripción                                                  |
| ----------- | ------- | --------: | ------------------------------------------------------------ |
| `status`    | string  |        No | Estado                                                       |
| `category`  | string  |        No | Categoría                                                    |
| `channel`   | string  |        No | Canal                                                        |
| `isSystem`  | boolean |        No | Plantilla de sistema                                         |
| `q`         | string  |        No | Búsqueda por código/nombre                                   |
| `page`      | number  |        No | Página                                                       |
| `pageSize`  | number  |        No | Tamaño                                                       |
| `sortBy`    | string  |        No | `code`, `name`, `category`, `channel`, `status`, `createdAt` |
| `sortOrder` | string  |        No | `asc`, `desc`                                                |

### Response 200

```json id="ayktps"
{
  "data": [
    {
      "id": "template_uuid",
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
      },
      "status": "active",
      "isSystem": false
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1,
    "traceId": "req_123456"
  }
}
```

---

## 13.2. Crear plantilla

### Endpoint

```http id="d8f94p"
POST /api/v1/tenant/notification-templates
```

### Permiso

```text id="om0c94"
notificationTemplates.create
```

### Request body

```json id="hx5ju4"
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

### Response 201

```json id="eccc3n"
{
  "data": {
    "id": "template_uuid",
    "code": "RESERVATION_APPROVED",
    "name": "Reserva aprobada",
    "category": "reservation",
    "channel": "inApp",
    "status": "active",
    "isSystem": false
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Evento auditable

```text id="ftec5f"
notificationTemplate.created
```

---

## 13.3. Obtener plantilla

### Endpoint

```http id="tiww2k"
GET /api/v1/tenant/notification-templates/{templateId}
```

### Permiso

```text id="i9xodl"
notificationTemplates.read
```

### Response 200

```json id="abqyfc"
{
  "data": {
    "id": "template_uuid",
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
    },
    "status": "active",
    "isSystem": false,
    "createdAt": "2026-07-19T10:00:00Z",
    "updatedAt": "2026-07-19T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 13.4. Actualizar plantilla

### Endpoint

```http id="k8et8v"
PATCH /api/v1/tenant/notification-templates/{templateId}
```

### Permiso

```text id="j20er7"
notificationTemplates.update
```

### Request body

```json id="pcakdl"
{
  "name": "Reserva aprobada",
  "description": "Mensaje in-app para reservas aprobadas.",
  "bodyTemplate": "Su reserva de {{commonAreaName}} para el día {{reservationDate}} fue aprobada.",
  "variablesSchema": {
    "commonAreaName": "string",
    "reservationDate": "string"
  }
}
```

### Response 200

```json id="m3qu4c"
{
  "data": {
    "id": "template_uuid",
    "code": "RESERVATION_APPROVED",
    "name": "Reserva aprobada",
    "channel": "inApp",
    "status": "active",
    "updatedAt": "2026-07-19T11:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Evento auditable

```text id="oy8viq"
notificationTemplate.updated
```

---

## 13.5. Activar plantilla

### Endpoint

```http id="i00iec"
POST /api/v1/tenant/notification-templates/{templateId}/activate
```

### Permiso

```text id="rhu1cm"
notificationTemplates.update
```

### Response 200

```json id="oagami"
{
  "data": {
    "id": "template_uuid",
    "status": "active"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Evento

```text id="vk6z5g"
notificationTemplate.activated
```

---

## 13.6. Desactivar plantilla

### Endpoint

```http id="af1mjr"
POST /api/v1/tenant/notification-templates/{templateId}/deactivate
```

### Permiso

```text id="c78qny"
notificationTemplates.update
```

### Response 200

```json id="vlggq8"
{
  "data": {
    "id": "template_uuid",
    "status": "inactive"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Evento

```text id="ix2mdx"
notificationTemplate.deactivated
```

---

## 13.7. Archivar plantilla

### Endpoint

```http id="k70opl"
POST /api/v1/tenant/notification-templates/{templateId}/archive
```

### Permiso

```text id="t14aa0"
notificationTemplates.archive
```

### Response 200

```json id="twiz2g"
{
  "data": {
    "id": "template_uuid",
    "status": "archived",
    "archivedAt": "2026-07-19T12:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Evento

```text id="kc5bgr"
notificationTemplate.archived
```

---

# 14. Notifications administrativas

## 14.1. Listar notificaciones administrativas

### Endpoint

```http id="cc31ct"
GET /api/v1/tenant/notifications
```

### Permiso

```text id="t7i4us"
notifications.read
```

### Query params

| Nombre            | Tipo      | Requerido | Descripción                                              |
| ----------------- | --------- | --------: | -------------------------------------------------------- |
| `recipientUserId` | string    |        No | Usuario destinatario                                     |
| `propertyUnitId`  | string    |        No | Unidad asociada                                          |
| `sourceType`      | string    |        No | Tipo de origen                                           |
| `sourceId`        | string    |        No | ID de origen                                             |
| `category`        | string    |        No | Categoría                                                |
| `channel`         | string    |        No | Canal                                                    |
| `status`          | string    |        No | Estado                                                   |
| `priority`        | string    |        No | Prioridad                                                |
| `createdFrom`     | date-time |        No | Creado desde                                             |
| `createdTo`       | date-time |        No | Creado hasta                                             |
| `page`            | number    |        No | Página                                                   |
| `pageSize`        | number    |        No | Tamaño                                                   |
| `sortBy`          | string    |        No | `createdAt`, `status`, `category`, `channel`, `priority` |
| `sortOrder`       | string    |        No | `asc`, `desc`                                            |

### Response 200

```json id="m8ui8k"
{
  "data": [
    {
      "id": "notification_uuid",
      "recipientUserId": "user_uuid",
      "recipientPersonId": "person_uuid",
      "propertyUnitId": "property_unit_uuid",
      "templateId": "template_uuid",
      "sourceType": "reservation",
      "sourceId": "reservation_uuid",
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
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1,
    "traceId": "req_123456"
  }
}
```

---

## 14.2. Crear notificación administrativa

### Endpoint

```http id="oy4rdl"
POST /api/v1/tenant/notifications
```

### Permiso

```text id="ajbv6v"
notifications.create
```

### Headers recomendados

```text id="oe4krh"
Idempotency-Key: notification:manual:request_uuid:user_uuid:inApp
```

### Request body

```json id="br7fno"
{
  "recipientUserId": "user_uuid",
  "propertyUnitId": "property_unit_uuid",
  "templateId": "template_uuid",
  "sourceType": "manual",
  "sourceId": "manual_request_uuid",
  "category": "administrative",
  "channel": "inApp",
  "title": "Nuevo aviso administrativo",
  "body": "Tiene un nuevo aviso disponible en RESIDENT Core.",
  "priority": "normal",
  "actionUrl": "/communications/communication_uuid",
  "sendNow": true
}
```

### Response 201

```json id="w7x8ne"
{
  "data": {
    "id": "notification_uuid",
    "recipientUserId": "user_uuid",
    "sourceType": "manual",
    "sourceId": "manual_request_uuid",
    "category": "administrative",
    "channel": "inApp",
    "title": "Nuevo aviso administrativo",
    "status": "delivered",
    "priority": "normal",
    "actionUrl": "/communications/communication_uuid",
    "createdAt": "2026-07-19T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Eventos auditables

```text id="sxe5gp"
notification.created
notification.delivered
```

---

## 14.3. Obtener notificación administrativa

### Endpoint

```http id="cbw7gb"
GET /api/v1/tenant/notifications/{notificationId}
```

### Permiso

```text id="f5d01x"
notifications.read
```

### Response 200

```json id="kg9h48"
{
  "data": {
    "id": "notification_uuid",
    "recipientUserId": "user_uuid",
    "recipientPersonId": "person_uuid",
    "propertyUnitId": "property_unit_uuid",
    "templateId": "template_uuid",
    "sourceType": "reservation",
    "sourceId": "reservation_uuid",
    "category": "reservation",
    "channel": "inApp",
    "title": "Reserva aprobada",
    "body": "Su reserva fue aprobada.",
    "status": "delivered",
    "priority": "normal",
    "readAt": null,
    "actionUrl": "/reservations/reservation_uuid",
    "createdAt": "2026-07-19T10:00:00Z",
    "updatedAt": "2026-07-19T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 14.4. Enviar notificación

### Endpoint

```http id="zahd5o"
POST /api/v1/tenant/notifications/{notificationId}/send
```

### Permiso

```text id="axq59c"
notifications.send
```

### Request body opcional

```json id="tjhdzj"
{
  "channel": "email",
  "force": false
}
```

### Response 200

```json id="yfjngc"
{
  "data": {
    "id": "notification_uuid",
    "status": "sent",
    "deliveryAttemptId": "attempt_uuid"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Debe validar canal.
* Debe validar preferencias salvo categoría obligatoria.
* Debe registrar delivery attempt.
* Si proveedor no está configurado, registrar `skipped` o `failed` controlado.

### Eventos auditables

```text id="q9qzzg"
notification.sent
notificationDeliveryAttempt.created
```

---

## 14.5. Reintentar entrega

### Endpoint

```http id="gjwtj4"
POST /api/v1/tenant/notifications/{notificationId}/retry
```

### Permiso

```text id="t7rbyv"
notifications.retry
```

### Request body

```json id="wjambe"
{
  "channel": "email"
}
```

### Response 200

```json id="yytcpx"
{
  "data": {
    "notificationId": "notification_uuid",
    "deliveryAttemptId": "attempt_uuid",
    "attemptNumber": 2,
    "status": "pending"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* No exceder `maxAttempts`.
* No duplicar notificación.
* Crear nuevo intento de entrega.
* Auditar reintento.

### Evento auditable

```text id="w5gv3a"
notification.retryScheduled
```

---

## 14.6. Cancelar notificación

### Endpoint

```http id="rg6lho"
POST /api/v1/tenant/notifications/{notificationId}/cancel
```

### Permiso

```text id="gdrg92"
notifications.cancel
```

### Request body

```json id="q67fj7"
{
  "reason": "Notificación cancelada por corrección administrativa."
}
```

### Response 200

```json id="zq0825"
{
  "data": {
    "id": "notification_uuid",
    "status": "cancelled"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Evento auditable

```text id="kpjh2l"
notification.cancelled
```

---

## 14.7. Listar intentos de entrega

### Endpoint

```http id="bgtwoz"
GET /api/v1/tenant/notifications/{notificationId}/delivery-attempts
```

### Permiso

```text id="i4kxy4"
notifications.readDeliveryAttempts
```

### Query params

| Nombre          | Tipo      | Requerido | Descripción   |
| --------------- | --------- | --------: | ------------- |
| `channel`       | string    |        No | Canal         |
| `status`        | string    |        No | Estado        |
| `provider`      | string    |        No | Proveedor     |
| `attemptedFrom` | date-time |        No | Intento desde |
| `attemptedTo`   | date-time |        No | Intento hasta |
| `page`          | number    |        No | Página        |
| `pageSize`      | number    |        No | Tamaño        |

### Response 200

```json id="a3wd7z"
{
  "data": [
    {
      "id": "attempt_uuid",
      "notificationId": "notification_uuid",
      "channel": "email",
      "provider": "ses",
      "destinationMasked": "g*****o@example.com",
      "status": "failed",
      "attemptNumber": 1,
      "providerMessageId": null,
      "errorCode": "PROVIDER_UNAVAILABLE",
      "errorMessage": "Email provider unavailable.",
      "attemptedAt": "2026-07-19T10:00:00Z",
      "deliveredAt": null,
      "failedAt": "2026-07-19T10:00:03Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1,
    "traceId": "req_123456"
  }
}
```

### Reglas

No devolver:

```text id="nnl7p3"
destino completo
credenciales
respuesta raw completa del proveedor
tokens
secretos
```

---

# 15. Notifications propias `/me`

## 15.1. Listar mis notificaciones

### Endpoint

```http id="qps2ht"
GET /api/v1/me/notifications
```

### Permiso

```text id="xdbmyk"
notifications.read.own
```

### Query params

| Nombre        | Tipo      | Requerido | Descripción                                   |
| ------------- | --------- | --------: | --------------------------------------------- |
| `category`    | string    |        No | Categoría                                     |
| `channel`     | string    |        No | Canal                                         |
| `status`      | string    |        No | Estado                                        |
| `priority`    | string    |        No | Prioridad                                     |
| `unreadOnly`  | boolean   |        No | Solo no leídas                                |
| `createdFrom` | date-time |        No | Creada desde                                  |
| `createdTo`   | date-time |        No | Creada hasta                                  |
| `page`        | number    |        No | Página                                        |
| `pageSize`    | number    |        No | Tamaño                                        |
| `sortBy`      | string    |        No | `createdAt`, `priority`, `status`, `category` |
| `sortOrder`   | string    |        No | `asc`, `desc`                                 |

### Response 200

```json id="gwikln"
{
  "data": [
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
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1,
    "traceId": "req_123456"
  }
}
```

### Reglas

* Solo devuelve notificaciones del usuario autenticado.
* No devuelve `recipientUserId`.
* No devuelve metadata interna.
* No devuelve delivery attempts.
* No devuelve datos de proveedor.

---

## 15.2. Obtener mi notificación

### Endpoint

```http id="prjqdn"
GET /api/v1/me/notifications/{notificationId}
```

### Permiso

```text id="d6s6m7"
notifications.read.own
```

### Response 200

```json id="xb60bu"
{
  "data": {
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
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 15.3. Marcar mi notificación como leída

### Endpoint

```http id="xb5hny"
POST /api/v1/me/notifications/{notificationId}/mark-read
```

### Permiso

```text id="xef9yg"
notifications.markRead.own
```

### Response 200

```json id="r6650k"
{
  "data": {
    "notificationId": "notification_uuid",
    "status": "read",
    "readAt": "2026-07-19T12:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* La notificación debe pertenecer al usuario.
* Operación idempotente.
* No permite marcar notificación ajena.

### Evento auditable

```text id="x77ecq"
notification.read
```

---

## 15.4. Marcar todas mis notificaciones como leídas

### Endpoint

```http id="e9rf3y"
POST /api/v1/me/notifications/mark-all-read
```

### Permiso

```text id="eiqnlu"
notifications.markRead.own
```

### Request body opcional

```json id="q4kiy1"
{
  "category": "reservation",
  "channel": "inApp"
}
```

### Response 200

```json id="zy2ljv"
{
  "data": {
    "updatedCount": 12,
    "readAt": "2026-07-19T12:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Solo aplica a notificaciones del usuario autenticado.
* No modifica notificaciones de otros usuarios.
* Debe ser idempotente.

---

# 16. Notification Preferences propias `/me`

## 16.1. Consultar mis preferencias

### Endpoint

```http id="elzt5b"
GET /api/v1/me/notification-preferences
```

### Permiso

```text id="ao9kh7"
notificationPreferences.read.own
```

### Response 200

```json id="yfdioo"
{
  "data": [
    {
      "id": "preference_uuid",
      "category": "informational",
      "channel": "email",
      "isEnabled": false,
      "createdAt": "2026-07-19T10:00:00Z",
      "updatedAt": "2026-07-19T10:00:00Z"
    },
    {
      "id": "preference_uuid_2",
      "category": "security",
      "channel": "inApp",
      "isEnabled": true,
      "createdAt": "2026-07-19T10:00:00Z",
      "updatedAt": "2026-07-19T10:00:00Z"
    }
  ],
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 16.2. Reemplazar mis preferencias

### Endpoint

```http id="h1gnvf"
PUT /api/v1/me/notification-preferences
```

### Permiso

```text id="btkfi7"
notificationPreferences.update.own
```

### Request body

```json id="zsql1c"
{
  "preferences": [
    {
      "category": "informational",
      "channel": "email",
      "isEnabled": false
    },
    {
      "category": "reservation",
      "channel": "inApp",
      "isEnabled": true
    },
    {
      "category": "financial",
      "channel": "email",
      "isEnabled": true
    }
  ]
}
```

### Response 200

```json id="c02d3a"
{
  "data": {
    "updatedCount": 3
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Usuario solo modifica sus preferencias.
* No puede desactivar categorías obligatorias si la política lo impide.
* Debe auditar cambios relevantes.

### Evento auditable

```text id="ry1rn1"
notificationPreference.updated
```

---

## 16.3. Actualizar una preferencia

### Endpoint

```http id="kg2qej"
PATCH /api/v1/me/notification-preferences/{preferenceId}
```

### Permiso

```text id="l2w1g7"
notificationPreferences.update.own
```

### Request body

```json id="jyc0y8"
{
  "isEnabled": false
}
```

### Response 200

```json id="g03hgl"
{
  "data": {
    "id": "preference_uuid",
    "category": "informational",
    "channel": "email",
    "isEnabled": false,
    "updatedAt": "2026-07-19T11:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 17. Matriz de endpoints

| Método | Ruta                                                              | Scope  | Auth | Permiso                              |
| ------ | ----------------------------------------------------------------- | ------ | ---- | ------------------------------------ |
| GET    | `/api/v1/tenant/communications`                                   | tenant | Sí   | `communications.read`                |
| POST   | `/api/v1/tenant/communications`                                   | tenant | Sí   | `communications.create`              |
| GET    | `/api/v1/tenant/communications/{communicationId}`                 | tenant | Sí   | `communications.read`                |
| PATCH  | `/api/v1/tenant/communications/{communicationId}`                 | tenant | Sí   | `communications.update`              |
| POST   | `/api/v1/tenant/communications/{communicationId}/publish`         | tenant | Sí   | `communications.publish`             |
| POST   | `/api/v1/tenant/communications/{communicationId}/schedule`        | tenant | Sí   | `communications.publish`             |
| POST   | `/api/v1/tenant/communications/{communicationId}/cancel`          | tenant | Sí   | `communications.cancel`              |
| POST   | `/api/v1/tenant/communications/{communicationId}/archive`         | tenant | Sí   | `communications.archive`             |
| GET    | `/api/v1/tenant/communications/{communicationId}/recipients`      | tenant | Sí   | `communications.read`                |
| PUT    | `/api/v1/tenant/communications/{communicationId}/recipients`      | tenant | Sí   | `communications.manageAudience`      |
| GET    | `/api/v1/tenant/communications/{communicationId}/read-receipts`   | tenant | Sí   | `communications.read`                |
| GET    | `/api/v1/me/communications`                                       | own    | Sí   | `communications.read.own`            |
| GET    | `/api/v1/me/communications/{communicationId}`                     | own    | Sí   | `communications.read.own`            |
| POST   | `/api/v1/me/communications/{communicationId}/mark-read`           | own    | Sí   | `communications.markRead.own`        |
| GET    | `/api/v1/public/tenants/{slug}/announcements`                     | public | No   | N/A                                  |
| GET    | `/api/v1/public/tenants/{slug}/announcements/{communicationSlug}` | public | No   | N/A                                  |
| GET    | `/api/v1/tenant/notification-templates`                           | tenant | Sí   | `notificationTemplates.read`         |
| POST   | `/api/v1/tenant/notification-templates`                           | tenant | Sí   | `notificationTemplates.create`       |
| GET    | `/api/v1/tenant/notification-templates/{templateId}`              | tenant | Sí   | `notificationTemplates.read`         |
| PATCH  | `/api/v1/tenant/notification-templates/{templateId}`              | tenant | Sí   | `notificationTemplates.update`       |
| POST   | `/api/v1/tenant/notification-templates/{templateId}/activate`     | tenant | Sí   | `notificationTemplates.update`       |
| POST   | `/api/v1/tenant/notification-templates/{templateId}/deactivate`   | tenant | Sí   | `notificationTemplates.update`       |
| POST   | `/api/v1/tenant/notification-templates/{templateId}/archive`      | tenant | Sí   | `notificationTemplates.archive`      |
| GET    | `/api/v1/tenant/notifications`                                    | tenant | Sí   | `notifications.read`                 |
| POST   | `/api/v1/tenant/notifications`                                    | tenant | Sí   | `notifications.create`               |
| GET    | `/api/v1/tenant/notifications/{notificationId}`                   | tenant | Sí   | `notifications.read`                 |
| POST   | `/api/v1/tenant/notifications/{notificationId}/send`              | tenant | Sí   | `notifications.send`                 |
| POST   | `/api/v1/tenant/notifications/{notificationId}/retry`             | tenant | Sí   | `notifications.retry`                |
| POST   | `/api/v1/tenant/notifications/{notificationId}/cancel`            | tenant | Sí   | `notifications.cancel`               |
| GET    | `/api/v1/tenant/notifications/{notificationId}/delivery-attempts` | tenant | Sí   | `notifications.readDeliveryAttempts` |
| GET    | `/api/v1/me/notifications`                                        | own    | Sí   | `notifications.read.own`             |
| GET    | `/api/v1/me/notifications/{notificationId}`                       | own    | Sí   | `notifications.read.own`             |
| POST   | `/api/v1/me/notifications/{notificationId}/mark-read`             | own    | Sí   | `notifications.markRead.own`         |
| POST   | `/api/v1/me/notifications/mark-all-read`                          | own    | Sí   | `notifications.markRead.own`         |
| GET    | `/api/v1/me/notification-preferences`                             | own    | Sí   | `notificationPreferences.read.own`   |
| PUT    | `/api/v1/me/notification-preferences`                             | own    | Sí   | `notificationPreferences.update.own` |
| PATCH  | `/api/v1/me/notification-preferences/{preferenceId}`              | own    | Sí   | `notificationPreferences.update.own` |

---

# 18. Catálogo de errores

| Código                                     | HTTP | Descripción                             |
| ------------------------------------------ | ---: | --------------------------------------- |
| `COMMUNICATION_NOT_FOUND`                  |  404 | Comunicado no encontrado o no accesible |
| `COMMUNICATION_FORBIDDEN`                  |  403 | Usuario sin acceso al comunicado        |
| `COMMUNICATION_INVALID_STATUS_TRANSITION`  |  409 | Transición inválida                     |
| `COMMUNICATION_AUDIENCE_REQUIRED`          |  422 | Audiencia requerida                     |
| `COMMUNICATION_PUBLICATION_NOT_ALLOWED`    |  409 | Publicación no permitida                |
| `COMMUNICATION_PRIVATE_PUBLIC_EXPOSURE`    |  422 | Intento de exponer contenido privado    |
| `COMMUNICATION_RECIPIENT_INVALID`          |  422 | Destinatario inválido                   |
| `COMMUNICATION_CROSS_TENANT_REFERENCE`     |  403 | Referencia cruza tenants                |
| `COMMUNICATION_DUPLICATE_SLUG`             |  409 | Slug duplicado dentro del tenant        |
| `COMMUNICATION_CONTENT_INVALID`            |  422 | Contenido inválido o inseguro           |
| `COMMUNICATION_EXPIRED`                    |  404 | Comunicado expirado no disponible       |
| `NOTIFICATION_TEMPLATE_NOT_FOUND`          |  404 | Plantilla no encontrada                 |
| `NOTIFICATION_TEMPLATE_INACTIVE`           |  422 | Plantilla inactiva                      |
| `NOTIFICATION_TEMPLATE_DUPLICATE_CODE`     |  409 | Código duplicado                        |
| `NOTIFICATION_TEMPLATE_VARIABLES_INVALID`  |  422 | Variables inválidas                     |
| `NOTIFICATION_NOT_FOUND`                   |  404 | Notificación no encontrada              |
| `NOTIFICATION_FORBIDDEN`                   |  403 | Usuario sin acceso                      |
| `NOTIFICATION_INVALID_TRANSITION`          |  409 | Transición inválida                     |
| `NOTIFICATION_DUPLICATE`                   |  409 | Notificación duplicada por idempotencia |
| `NOTIFICATION_CHANNEL_NOT_CONFIGURED`      |  422 | Canal no configurado                    |
| `NOTIFICATION_DELIVERY_FAILED`             |  503 | Fallo de entrega                        |
| `NOTIFICATION_MAX_ATTEMPTS_EXCEEDED`       |  409 | Límite de reintentos alcanzado          |
| `NOTIFICATION_PREFERENCE_NOT_FOUND`        |  404 | Preferencia no encontrada               |
| `NOTIFICATION_PREFERENCE_FORBIDDEN`        |  403 | Preferencia ajena                       |
| `NOTIFICATION_MANDATORY_PREFERENCE_LOCKED` |  409 | Categoría obligatoria no desactivable   |
| `NOTIFICATION_CROSS_TENANT_REFERENCE`      |  403 | Referencia cruza tenants                |
| `VALIDATION_ERROR`                         |  422 | Error de validación                     |
| `UNAUTHORIZED`                             |  401 | No autenticado                          |
| `FORBIDDEN`                                |  403 | Sin permiso                             |
| `RATE_LIMITED`                             |  429 | Rate limit                              |
| `INTERNAL_ERROR`                           |  500 | Error interno                           |

---

# 19. Ejemplos de errores

## 19.1. Comunicado privado solicitado desde endpoint público

```json id="zfsq6e"
{
  "error": {
    "code": "COMMUNICATION_NOT_FOUND",
    "message": "Announcement not found.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

## 19.2. Audiencia requerida

```json id="dlsosb"
{
  "error": {
    "code": "COMMUNICATION_AUDIENCE_REQUIRED",
    "message": "A non-public communication must define an audience.",
    "details": {
      "visibility": "tenant"
    },
    "traceId": "req_123456"
  }
}
```

---

## 19.3. Referencia cross-tenant

```json id="tqw9xr"
{
  "error": {
    "code": "COMMUNICATION_CROSS_TENANT_REFERENCE",
    "message": "The provided recipient does not belong to the current tenant.",
    "details": {
      "recipientType": "propertyUnit"
    },
    "traceId": "req_123456"
  }
}
```

---

## 19.4. Plantilla con variables inválidas

```json id="szavjw"
{
  "error": {
    "code": "NOTIFICATION_TEMPLATE_VARIABLES_INVALID",
    "message": "Template variables do not match the declared schema.",
    "details": {
      "unknownVariables": ["unknownValue"]
    },
    "traceId": "req_123456"
  }
}
```

---

## 19.5. Notificación ajena

```json id="ebpxq2"
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

## 19.6. Canal no configurado

```json id="zdyjq3"
{
  "error": {
    "code": "NOTIFICATION_CHANNEL_NOT_CONFIGURED",
    "message": "The requested notification channel is not configured.",
    "details": {
      "channel": "email"
    },
    "traceId": "req_123456"
  }
}
```

---

## 19.7. Preferencia obligatoria bloqueada

```json id="v7wam1"
{
  "error": {
    "code": "NOTIFICATION_MANDATORY_PREFERENCE_LOCKED",
    "message": "Mandatory notifications cannot be disabled for this category and channel.",
    "details": {
      "category": "security",
      "channel": "inApp"
    },
    "traceId": "req_123456"
  }
}
```

---

# 20. Reglas de seguridad por contrato

## 20.1. Endpoints administrativos

Deben aplicar:

```text id="nlaq8l"
AuthGuard
TenantGuard
TenantPermissionGuard
tenant_id filter
permission checks
safe DTO validation
content sanitization
audit events
safe errors
no-store cache policy
```

---

## 20.2. Endpoints `/me`

Deben aplicar:

```text id="cp90we"
AuthGuard
TenantGuard
TenantPermissionGuard
OwnCommunicationGuard
OwnNotificationGuard
NotificationPreferenceGuard
own-resource validation
no third-party exposure
safe DTO minimization
```

---

## 20.3. Endpoints públicos WordPress

Deben aplicar:

```text id="w4n97y"
PublicTenantResolver
tenant active validation
public visibility validation
safe public DTO
CORS allowlist
rate limiting
public cache policy
no recipients
no private metadata
```

---

## 20.4. Notificaciones

Deben aplicar:

```text id="qeob82"
recipient tenant validation
recipient user validation
idempotency
preference policy
channel policy
destination masking
delivery attempt audit
no provider secrets
```

---

## 20.5. Plantillas

Deben aplicar:

```text id="wiofew"
template variable schema validation
content sanitization
active template check
system template protection
no script injection
```

---

# 21. Auditoría

## 21.1. Eventos obligatorios

```text id="fq1k1b"
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

```json id="tj31zu"
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

## 21.3. Metadata prohibida

```text id="bi0404"
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

# 22. Observabilidad

## 22.1. Logs sugeridos

```text id="e0krje"
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

## 22.2. Métricas sugeridas

```text id="hgvdz9"
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

```text id="bzof01"
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

```text id="uash4p"
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

# 23. OpenAPI

## 23.1. Tags sugeridos

```text id="kewtr5"
Communications
My Communications
Public Announcements
Notification Templates
Notifications
My Notifications
Notification Preferences
```

---

## 23.2. Extensiones OpenAPI sugeridas

### Endpoint tenant

```yaml id="eofvf0"
x-tenant-scope: true
x-auth-required: true
x-required-permission: communications.publish
x-audit-event: communication.published
```

---

### Endpoint `/me`

```yaml id="cvdrjj"
x-tenant-scope: true
x-auth-required: true
x-own-resource: true
x-required-permission: notifications.read.own
```

---

### Endpoint público

```yaml id="mdb0ck"
x-public-safe: true
x-auth-required: false
x-cache-policy: public
x-exposes-private-data: false
```

---

### Endpoint de entrega

```yaml id="zeqld7"
x-tenant-scope: true
x-auth-required: true
x-required-permission: notifications.send
x-delivery-channel: true
x-destination-masked: true
x-audit-event: notification.sent
```

---

## 23.3. OpenAPI no debe documentar

```text id="vocrrt"
GET /api/v1/public/tenants/{slug}/notifications
GET /api/v1/public/tenants/{slug}/notification-preferences
GET /api/v1/public/tenants/{slug}/communications/{id}/recipients
GET /api/v1/public/tenants/{slug}/communications/{id}/read-receipts
GET /api/v1/public/tenants/{slug}/notifications/{id}/delivery-attempts
POST /api/v1/public/tenants/{slug}/notifications
POST /api/v1/public/tenants/{slug}/communications/{id}/mark-read
```

---

# 24. Casos borde del contrato

| Caso                                           | Resultado esperado             |
| ---------------------------------------------- | ------------------------------ |
| Comunicado sin título                          | 422                            |
| Comunicado sin body                            | 422                            |
| Comunicado no público sin audiencia            | 422                            |
| Comunicado público con `isPublicVisible=false` | no aparece públicamente        |
| Comunicado `draft` público                     | no aparece públicamente        |
| Comunicado `internal` público                  | no aparece públicamente        |
| Comunicado expirado                            | 404 en público                 |
| Comunicado archivado                           | 404 en público                 |
| Tenant suspendido                              | 404 en público según política  |
| Slug duplicado                                 | 409                            |
| Destinatario de otro tenant                    | 403                            |
| Usuario sin permiso crea comunicado            | 403                            |
| Usuario consulta comunicado ajeno              | 403/404                        |
| Usuario marca comunicado no accesible          | 403/404                        |
| Plantilla duplicada                            | 409                            |
| Plantilla inactiva usada                       | 422                            |
| Variables no declaradas                        | 422                            |
| Canal email no configurado                     | 422 o delivery skipped         |
| Notificación duplicada por idempotencia        | 200 existente o 409 controlado |
| Usuario consulta notificación ajena            | 403/404                        |
| Usuario marca notificación ajena               | 403/404                        |
| Preferencia de otro usuario                    | 403/404                        |
| Desactivar mandatory/security                  | 409                            |
| Delivery attempt sin masking                   | 422                            |
| Provider caído                                 | failed/skipped controlado      |
| WordPress consulta notificaciones              | endpoint no existe             |
| OpenAPI documenta notificaciones públicas      | falla                          |
| Logs contienen destino completo                | no permitido                   |

---

# 25. Pruebas de contrato requeridas

## 25.1. Communications administrativas

```text id="ywttxb"
GET /api/v1/tenant/communications
POST /api/v1/tenant/communications
GET /api/v1/tenant/communications/{communicationId}
PATCH /api/v1/tenant/communications/{communicationId}
POST /api/v1/tenant/communications/{communicationId}/publish
POST /api/v1/tenant/communications/{communicationId}/schedule
POST /api/v1/tenant/communications/{communicationId}/cancel
POST /api/v1/tenant/communications/{communicationId}/archive
GET /api/v1/tenant/communications/{communicationId}/recipients
PUT /api/v1/tenant/communications/{communicationId}/recipients
GET /api/v1/tenant/communications/{communicationId}/read-receipts
```

Casos mínimos:

* 401 sin token;
* 403 sin permiso;
* 200/201 con permiso;
* 409 transición inválida;
* 422 audiencia inválida;
* 403 referencias cross-tenant;
* audit event.

---

## 25.2. Communications propias

```text id="bv9v1y"
GET /api/v1/me/communications
GET /api/v1/me/communications/{communicationId}
POST /api/v1/me/communications/{communicationId}/mark-read
```

Casos mínimos:

* usuario ve solo comunicados accesibles;
* usuario no ve comunicado ajeno;
* usuario no ve borradores;
* usuario no ve internos si no aplican;
* mark-read idempotente;
* own DTO minimizado.

---

## 25.3. Public announcements

```text id="y71sss"
GET /api/v1/public/tenants/{slug}/announcements
GET /api/v1/public/tenants/{slug}/announcements/{communicationSlug}
```

Casos mínimos:

* público visible pasa;
* draft no aparece;
* scheduled no aparece;
* tenant visibility no aparece;
* internal no aparece;
* private no aparece;
* archived no aparece;
* expired no aparece;
* no recipients;
* no metadata interna;
* cache headers.

---

## 25.4. Notification Templates

```text id="gr7hpu"
GET /api/v1/tenant/notification-templates
POST /api/v1/tenant/notification-templates
GET /api/v1/tenant/notification-templates/{templateId}
PATCH /api/v1/tenant/notification-templates/{templateId}
POST /api/v1/tenant/notification-templates/{templateId}/activate
POST /api/v1/tenant/notification-templates/{templateId}/deactivate
POST /api/v1/tenant/notification-templates/{templateId}/archive
```

Casos mínimos:

* código duplicado;
* variables inválidas;
* plantilla inactiva;
* sistema protegido;
* audit event.

---

## 25.5. Notifications administrativas

```text id="hvzzl6"
GET /api/v1/tenant/notifications
POST /api/v1/tenant/notifications
GET /api/v1/tenant/notifications/{notificationId}
POST /api/v1/tenant/notifications/{notificationId}/send
POST /api/v1/tenant/notifications/{notificationId}/retry
POST /api/v1/tenant/notifications/{notificationId}/cancel
GET /api/v1/tenant/notifications/{notificationId}/delivery-attempts
```

Casos mínimos:

* destinatario del tenant;
* destinatario de otro tenant falla;
* idempotencia;
* canal no configurado;
* delivery attempt con masking;
* no secretos;
* audit event.

---

## 25.6. Notifications propias

```text id="q9f3ot"
GET /api/v1/me/notifications
GET /api/v1/me/notifications/{notificationId}
POST /api/v1/me/notifications/{notificationId}/mark-read
POST /api/v1/me/notifications/mark-all-read
```

Casos mínimos:

* solo propias;
* no ajenas;
* mark-read idempotente;
* mark-all-read no afecta a otros usuarios;
* DTO minimizado.

---

## 25.7. Notification Preferences

```text id="j6lojs"
GET /api/v1/me/notification-preferences
PUT /api/v1/me/notification-preferences
PATCH /api/v1/me/notification-preferences/{preferenceId}
```

Casos mínimos:

* usuario consulta propias;
* usuario actualiza propias;
* no actualiza ajenas;
* mandatory/security no se desactiva si política lo bloquea;
* audit event.

---

# 26. Decisión final del contrato API

El módulo `012-communications-notifications` expondrá endpoints REST para:

```text id="m7573j"
1. Gestión administrativa de comunicados.
2. Gestión de audiencia de comunicados.
3. Consulta de comunicados propios.
4. Consulta pública segura de comunicados para WordPress.
5. Gestión de plantillas de notificación.
6. Creación y consulta administrativa de notificaciones.
7. Envío, reintento y cancelación de notificaciones.
8. Consulta de intentos de entrega.
9. Consulta y lectura de notificaciones propias.
10. Gestión de preferencias propias.
```

El contrato debe garantizar:

```text id="g1v1qs"
tenant isolation
permissioned access
own-resource authorization
audience validation
public-safe WordPress exposure
private notification protection
template validation
content sanitization
destination masking
notification idempotency
preference enforcement
safe external delivery
safe errors
safe logs
audit trail
OpenAPI consistency
CI validation
```

La implementación no debe aceptarse si permite comunicaciones cross-tenant, expone comunicados privados en WordPress, permite leer o modificar notificaciones ajenas, expone notificaciones por endpoints públicos, almacena destinos completos sin enmascarar, duplica notificaciones por evento, envía datos sensibles por canales externos, registra secretos en logs, omite auditoría o mezcla la lógica de comunicación con pagos, multas, reservas o estados de cuenta.
