# Data Model — Spec 012 Communications and Notifications

## 1. Información del documento

| Campo                  | Valor                                                                                         |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| Proyecto               | RESIDENT Core                                                                                 |
| Spec ID                | 012                                                                                           |
| Módulo                 | Communications and Notifications                                                              |
| Documento              | Data Model                                                                                    |
| Ruta                   | `docs/specs/012-communications-notifications/data-model.md`                                   |
| Versión                | 0.1                                                                                           |
| Estado                 | Borrador inicial                                                                              |
| Fecha                  | 2026-07-19                                                                                    |
| Documento base         | `docs/specs/012-communications-notifications/spec.md`                                         |
| Plan técnico           | `docs/specs/012-communications-notifications/plan.md`                                         |
| Base de datos          | PostgreSQL                                                                                    |
| ORM                    | Prisma                                                                                        |
| Estrategia multitenant | Shared database + shared schema + `tenant_id`                                                 |
| Naturaleza del módulo  | Tenant-scoped / Audience-aware / Event-aware / Channel-aware / Privacy-preserving / Auditable |
| API Style              | REST                                                                                          |

---

## 2. Propósito

Este documento define el modelo de datos del módulo `012-communications-notifications`.

El objetivo es modelar comunicados, destinatarios, lecturas, plantillas, notificaciones, intentos de entrega y preferencias de usuario, garantizando:

* aislamiento por tenant;
* audiencias controladas;
* visibilidad pública segura;
* exposición limitada hacia WordPress;
* notificaciones privadas por usuario;
* entrega trazable por canal;
* soporte base para in-app;
* soporte opcional para email;
* preparación para WhatsApp, SMS, push y webhooks;
* idempotencia para evitar duplicados;
* destinos externos enmascarados;
* preferencias de notificación;
* auditoría;
* minimización de datos;
* no exposición de contenido privado en endpoints públicos.

Regla central:

```text id="b4y8s2"
Toda comunicación o notificación debe ser tenant-scoped, audience-aware, visibility-controlled, idempotent, privacy-preserving y auditable.
```

---

## 3. Decisión principal del modelo

Para MVP se crearán siete tablas principales:

```text id="hdkt3m"
communications
communication_recipients
communication_read_receipts
notification_templates
notifications
notification_delivery_attempts
notification_preferences
```

Estas tablas permiten cubrir:

* comunicados administrativos;
* comunicados públicos para WordPress;
* comunicados internos;
* segmentación básica;
* lectura de comunicados;
* plantillas de notificación;
* notificaciones in-app;
* entrega opcional por email;
* intentos de entrega;
* preferencias por canal y categoría;
* trazabilidad;
* idempotencia;
* preparación para canales futuros.

---

## 4. Tablas nuevas MVP

```text id="n22jrw"
communications
communication_recipients
communication_read_receipts
notification_templates
notifications
notification_delivery_attempts
notification_preferences
```

---

## 5. Tablas externas relacionadas

El módulo se relaciona con tablas ya definidas en specs anteriores:

```text id="alvpdy"
tenants
user_profiles
persons
property_units
roles / tenant_roles según implementación de 002-users-roles
audit_logs
payments
account_statements
reservations
fines
```

Relación con specs:

| Tabla externa            | Spec origen                     | Uso en comunicaciones/notificaciones                                         |
| ------------------------ | ------------------------------- | ---------------------------------------------------------------------------- |
| `tenants`                | `001-tenants`                   | Tenant propietario de comunicados, notificaciones, preferencias y plantillas |
| `user_profiles`          | `002-users-roles`               | Usuarios destinatarios, creadores, publicadores y lectores                   |
| `roles` / `tenant_roles` | `002-users-roles`               | Segmentación por rol                                                         |
| `persons`                | `003-residents-properties`      | Relación persona-residente/propietario para segmentación                     |
| `property_units`         | `003-residents-properties`      | Segmentación por unidad y notificaciones asociadas a unidad                  |
| `audit_logs`             | `007-audit`                     | Auditoría de operaciones críticas                                            |
| `payments`               | `005-payments`                  | Fuente de eventos para notificaciones financieras                            |
| `account_statements`     | `006-account-statements`        | Fuente de eventos de estados de cuenta                                       |
| `reservations`           | `010-reservations-common-areas` | Fuente de eventos de reservas                                                |
| `fines`                  | `011-fines-sanctions`           | Fuente de eventos de multas y reclamos                                       |

---

## 6. Entidad `Communication`

### 6.1. Propósito

Representa un comunicado, aviso o anuncio administrativo creado por un tenant.

Puede ser:

```text id="tkgadt"
aviso general
comunicado administrativo
noticia comunitaria
aviso financiero
aviso de mantenimiento
aviso de seguridad
comunicado de reservas
comunicado de multas
comunicado público WordPress
```

---

### 6.2. Tabla

```text id="u8bja4"
communications
```

---

### 6.3. Campos

```text id="jcgl51"
Communication
├── id
├── tenantId
├── publicId
├── title
├── slug
├── summary
├── body
├── category
├── visibility
├── status
├── priority
├── audienceType
├── isPublicVisible
├── publishAt
├── publishedAt
├── expiresAt
├── createdBy
├── updatedBy
├── publishedBy
├── archivedBy
├── coverImageUrl
├── metadata
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 6.4. Reglas

* `tenantId` obligatorio.
* `publicId` recomendado para exposición pública sin filtrar el `id` interno.
* `title` obligatorio.
* `slug` único por tenant si existe.
* `summary` opcional.
* `body` obligatorio.
* `category` obligatoria.
* `visibility` obligatoria.
* `status` obligatorio.
* `priority` obligatoria.
* `audienceType` obligatorio.
* `isPublicVisible = true` solo tiene efecto si `visibility = public`.
* `publishedAt` se registra al publicar.
* `publishedBy` se registra al publicar.
* `archivedAt` se registra al archivar.
* `coverImageUrl` solo puede exponerse públicamente si apunta a recurso permitido.
* `metadata` debe ser sanitizada.
* Comunicados no públicos no deben aparecer en endpoints públicos.
* Comunicados archivados no deben aparecer por defecto.
* No se permite eliminación física ordinaria.

---

## 7. Entidad `CommunicationRecipient`

### 7.1. Propósito

Representa un destinatario explícito o segmento de audiencia de un comunicado.

Permite audiencias por:

```text id="q3po7a"
allTenantUsers
owners
residents
propertyUnits
roles
specificUsers
mixed
```

---

### 7.2. Tabla

```text id="lv4ujo"
communication_recipients
```

---

### 7.3. Campos

```text id="k1kk3h"
CommunicationRecipient
├── id
├── tenantId
├── communicationId
├── recipientType
├── userId
├── personId
├── propertyUnitId
├── roleId
├── createdAt
└── archivedAt
```

---

### 7.4. Reglas

* `tenantId` obligatorio.
* `communicationId` obligatorio.
* `communicationId` debe pertenecer al mismo tenant.
* `recipientType` obligatorio.
* Si `recipientType = user`, `userId` obligatorio.
* Si `recipientType = person`, `personId` obligatorio.
* Si `recipientType = propertyUnit`, `propertyUnitId` obligatorio.
* Si `recipientType = role`, `roleId` obligatorio.
* Si `recipientType = owner`, no requiere ID individual.
* Si `recipientType = resident`, no requiere ID individual.
* Si `recipientType = allTenantUsers`, no requiere ID individual.
* Todas las referencias deben pertenecer al mismo tenant.
* No se exponen destinatarios en endpoints públicos.
* No se elimina físicamente en operación ordinaria.

---

## 8. Entidad `CommunicationReadReceipt`

### 8.1. Propósito

Representa el registro básico de lectura de un comunicado por parte de un usuario.

No equivale a recepción legal certificada.

---

### 8.2. Tabla

```text id="rto5rx"
communication_read_receipts
```

---

### 8.3. Campos

```text id="gsakvw"
CommunicationReadReceipt
├── id
├── tenantId
├── communicationId
├── userId
├── readAt
├── createdAt
└── archivedAt
```

---

### 8.4. Reglas

* `tenantId` obligatorio.
* `communicationId` obligatorio.
* `communicationId` debe pertenecer al mismo tenant.
* `userId` obligatorio.
* `userId` debe pertenecer al mismo tenant mediante membership activa.
* El usuario debe tener acceso al comunicado.
* Una lectura por `tenantId + communicationId + userId`.
* `mark-read` debe ser idempotente.
* No se expone públicamente.

---

## 9. Entidad `NotificationTemplate`

### 9.1. Propósito

Representa una plantilla reutilizable para generar notificaciones.

Puede ser:

* plantilla de plataforma;
* plantilla específica de tenant;
* plantilla para in-app;
* plantilla para email;
* plantilla preparada para WhatsApp/SMS/push/webhook futuro.

---

### 9.2. Tabla

```text id="lxmaqo"
notification_templates
```

---

### 9.3. Campos

```text id="rjrj4l"
NotificationTemplate
├── id
├── tenantId nullable
├── code
├── name
├── description
├── category
├── channel
├── subjectTemplate
├── bodyTemplate
├── variablesSchema
├── status
├── isSystem
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 9.4. Reglas

* `tenantId` puede ser null para plantillas globales de plataforma.
* Si `tenantId` no es null, la plantilla pertenece a un tenant.
* `code` obligatorio.
* `code` único por tenant/canal.
* Plantillas globales deben tener código/canal único a nivel global.
* `name` obligatorio.
* `category` obligatoria.
* `channel` obligatorio.
* `bodyTemplate` obligatorio.
* `subjectTemplate` obligatorio para email.
* `variablesSchema` debe definir variables permitidas.
* Solo plantillas `active` pueden usarse.
* `isSystem = true` impide edición ordinaria.
* `metadata` sensible no debe almacenarse aquí.
* No se elimina físicamente en operación ordinaria.

---

## 10. Entidad `Notification`

### 10.1. Propósito

Representa una notificación generada para un usuario.

Puede ser creada por:

* acción administrativa;
* evento de pagos;
* evento de estados de cuenta;
* evento de reservas;
* evento de multas;
* evento de seguridad;
* evento del sistema;
* publicación de comunicado.

---

### 10.2. Tabla

```text id="q36jjp"
notifications
```

---

### 10.3. Campos

```text id="rw3vqk"
Notification
├── id
├── tenantId
├── recipientUserId
├── recipientPersonId
├── propertyUnitId
├── templateId
├── sourceType
├── sourceId
├── category
├── channel
├── title
├── body
├── status
├── priority
├── readAt
├── actionUrl
├── idempotencyKey
├── metadata
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 10.4. Reglas

* `tenantId` obligatorio.
* `recipientUserId` obligatorio.
* `recipientUserId` debe pertenecer al mismo tenant mediante membership activa.
* `recipientPersonId` opcional.
* `propertyUnitId` opcional.
* `propertyUnitId`, si existe, debe pertenecer al mismo tenant.
* `templateId`, si existe, debe pertenecer al mismo tenant o ser global.
* `sourceType` obligatorio.
* `sourceId` opcional.
* `category` obligatoria.
* `channel` obligatorio.
* `title` obligatorio.
* `body` obligatorio.
* `status` obligatorio.
* `priority` obligatoria.
* `readAt` solo se marca por destinatario o proceso autorizado.
* `actionUrl` debe ser relativa o URL permitida.
* `idempotencyKey` evita duplicados por evento.
* `metadata` debe ser sanitizada.
* No se expone públicamente.
* No se elimina físicamente en operación ordinaria.

---

## 11. Entidad `NotificationDeliveryAttempt`

### 11.1. Propósito

Representa un intento de entrega de una notificación por canal.

Aplica especialmente a canales externos:

```text id="s7481i"
email
whatsapp
sms
push
webhook
```

También puede registrar entrega in-app si se requiere trazabilidad completa.

---

### 11.2. Tabla

```text id="skq9l0"
notification_delivery_attempts
```

---

### 11.3. Campos

```text id="w4wmry"
NotificationDeliveryAttempt
├── id
├── tenantId
├── notificationId
├── channel
├── provider
├── destinationMasked
├── status
├── attemptNumber
├── providerMessageId
├── errorCode
├── errorMessage
├── attemptedAt
├── deliveredAt
├── failedAt
└── metadata
```

---

### 11.4. Reglas

* `tenantId` obligatorio.
* `notificationId` obligatorio.
* `notificationId` debe pertenecer al mismo tenant.
* `channel` obligatorio.
* `provider` opcional.
* `destinationMasked` obligatorio para canales externos.
* No guardar email completo.
* No guardar teléfono completo.
* No guardar credenciales.
* No guardar respuesta raw completa del proveedor.
* `attemptNumber >= 1`.
* `status` obligatorio.
* `errorMessage` debe ser sanitizado.
* `metadata` debe ser sanitizada.
* No se elimina físicamente en operación ordinaria.

---

## 12. Entidad `NotificationPreference`

### 12.1. Propósito

Representa la preferencia básica de un usuario por categoría y canal.

---

### 12.2. Tabla

```text id="sxci75"
notification_preferences
```

---

### 12.3. Campos

```text id="tezo7o"
NotificationPreference
├── id
├── tenantId
├── userId
├── category
├── channel
├── isEnabled
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 12.4. Reglas

* `tenantId` obligatorio.
* `userId` obligatorio.
* `userId` debe pertenecer al mismo tenant.
* `category` obligatoria.
* `channel` obligatorio.
* `isEnabled` obligatorio.
* Una preferencia por `tenantId + userId + category + channel`.
* Usuario solo modifica sus propias preferencias.
* Categorías obligatorias no pueden desactivarse si la política lo impide.
* No se expone a otros usuarios.
* No se elimina físicamente en operación ordinaria.

---

## 13. Enums

## 13.1. CommunicationStatus

```text id="bkvqbz"
draft
scheduled
published
expired
archived
cancelled
```

---

## 13.2. CommunicationVisibility

```text id="y68dde"
private
internal
tenant
public
```

---

## 13.3. CommunicationCategory

```text id="cvh3du"
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

## 13.4. CommunicationPriority

```text id="cm6vru"
low
normal
high
urgent
```

---

## 13.5. AudienceType

```text id="d3fmqu"
allTenantUsers
owners
residents
propertyUnits
roles
specificUsers
mixed
```

---

## 13.6. CommunicationRecipientType

```text id="ywn7o7"
user
person
propertyUnit
role
owner
resident
allTenantUsers
```

---

## 13.7. NotificationTemplateStatus

```text id="v3s3ow"
active
inactive
archived
```

---

## 13.8. NotificationStatus

```text id="vgkg8a"
pending
sent
delivered
failed
read
archived
cancelled
```

---

## 13.9. NotificationChannel

```text id="c9e6lu"
inApp
email
whatsapp
sms
push
webhook
```

MVP obligatorio:

```text id="oimtk4"
inApp
```

MVP opcional:

```text id="f5d87w"
email
```

Diferidos:

```text id="pkz2sp"
whatsapp
sms
push
webhook
```

---

## 13.10. NotificationCategory

```text id="qd7oss"
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

## 13.11. NotificationPriority

```text id="shhc3h"
low
normal
high
urgent
```

---

## 13.12. DeliveryAttemptStatus

```text id="d06wir"
pending
sent
delivered
failed
cancelled
skipped
```

---

## 13.13. NotificationSourceType

```text id="fsup0t"
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

## 14. Modelo Prisma preliminar

## 14.1. Enums Prisma

```prisma id="eqhj5o"
enum CommunicationStatus {
  DRAFT     @map("draft")
  SCHEDULED @map("scheduled")
  PUBLISHED @map("published")
  EXPIRED   @map("expired")
  ARCHIVED  @map("archived")
  CANCELLED @map("cancelled")

  @@map("communication_status")
}

enum CommunicationVisibility {
  PRIVATE  @map("private")
  INTERNAL @map("internal")
  TENANT   @map("tenant")
  PUBLIC   @map("public")

  @@map("communication_visibility")
}

enum CommunicationCategory {
  GENERAL        @map("general")
  ADMINISTRATIVE @map("administrative")
  FINANCIAL      @map("financial")
  MAINTENANCE    @map("maintenance")
  SECURITY       @map("security")
  COMMUNITY      @map("community")
  RESERVATION    @map("reservation")
  FINE           @map("fine")
  MEETING        @map("meeting")
  EMERGENCY      @map("emergency")
  OTHER          @map("other")

  @@map("communication_category")
}

enum CommunicationPriority {
  LOW    @map("low")
  NORMAL @map("normal")
  HIGH   @map("high")
  URGENT @map("urgent")

  @@map("communication_priority")
}

enum AudienceType {
  ALL_TENANT_USERS @map("allTenantUsers")
  OWNERS           @map("owners")
  RESIDENTS        @map("residents")
  PROPERTY_UNITS   @map("propertyUnits")
  ROLES            @map("roles")
  SPECIFIC_USERS   @map("specificUsers")
  MIXED            @map("mixed")

  @@map("audience_type")
}

enum CommunicationRecipientType {
  USER             @map("user")
  PERSON           @map("person")
  PROPERTY_UNIT    @map("propertyUnit")
  ROLE             @map("role")
  OWNER            @map("owner")
  RESIDENT         @map("resident")
  ALL_TENANT_USERS @map("allTenantUsers")

  @@map("communication_recipient_type")
}

enum NotificationTemplateStatus {
  ACTIVE   @map("active")
  INACTIVE @map("inactive")
  ARCHIVED @map("archived")

  @@map("notification_template_status")
}

enum NotificationStatus {
  PENDING   @map("pending")
  SENT      @map("sent")
  DELIVERED @map("delivered")
  FAILED    @map("failed")
  READ      @map("read")
  ARCHIVED  @map("archived")
  CANCELLED @map("cancelled")

  @@map("notification_status")
}

enum NotificationChannel {
  IN_APP   @map("inApp")
  EMAIL    @map("email")
  WHATSAPP @map("whatsapp")
  SMS      @map("sms")
  PUSH     @map("push")
  WEBHOOK  @map("webhook")

  @@map("notification_channel")
}

enum NotificationCategory {
  MANDATORY      @map("mandatory")
  ADMINISTRATIVE @map("administrative")
  FINANCIAL      @map("financial")
  SECURITY       @map("security")
  OPERATIONAL    @map("operational")
  RESERVATION    @map("reservation")
  FINE           @map("fine")
  MEETING        @map("meeting")
  INFORMATIONAL  @map("informational")
  SYSTEM         @map("system")

  @@map("notification_category")
}

enum NotificationPriority {
  LOW    @map("low")
  NORMAL @map("normal")
  HIGH   @map("high")
  URGENT @map("urgent")

  @@map("notification_priority")
}

enum DeliveryAttemptStatus {
  PENDING   @map("pending")
  SENT      @map("sent")
  DELIVERED @map("delivered")
  FAILED    @map("failed")
  CANCELLED @map("cancelled")
  SKIPPED   @map("skipped")

  @@map("delivery_attempt_status")
}

enum NotificationSourceType {
  MANUAL            @map("manual")
  COMMUNICATION     @map("communication")
  PAYMENT           @map("payment")
  ACCOUNT_STATEMENT @map("accountStatement")
  RESERVATION       @map("reservation")
  FINE              @map("fine")
  MEETING           @map("meeting")
  SECURITY          @map("security")
  SYSTEM            @map("system")
  OTHER             @map("other")

  @@map("notification_source_type")
}
```

---

## 14.2. Modelo `Communication`

```prisma id="e0r3fh"
model Communication {
  id              String                  @id @default(uuid())
  tenantId        String                  @map("tenant_id")
  publicId        String                  @default(uuid()) @map("public_id")

  title           String
  slug            String?
  summary         String?
  body            String

  category        CommunicationCategory   @default(GENERAL)
  visibility      CommunicationVisibility @default(TENANT)
  status          CommunicationStatus     @default(DRAFT)
  priority        CommunicationPriority   @default(NORMAL)
  audienceType    AudienceType            @default(ALL_TENANT_USERS) @map("audience_type")

  isPublicVisible Boolean                 @default(false) @map("is_public_visible")

  publishAt       DateTime?               @map("publish_at")
  publishedAt     DateTime?               @map("published_at")
  expiresAt       DateTime?               @map("expires_at")

  createdBy       String?                 @map("created_by")
  updatedBy       String?                 @map("updated_by")
  publishedBy     String?                 @map("published_by")
  archivedBy      String?                 @map("archived_by")

  coverImageUrl   String?                 @map("cover_image_url")
  metadata        Json?

  createdAt       DateTime                @default(now()) @map("created_at")
  updatedAt       DateTime                @updatedAt @map("updated_at")
  archivedAt      DateTime?               @map("archived_at")

  tenant          Tenant                  @relation(fields: [tenantId], references: [id], onDelete: Restrict)

  createdByUser   UserProfile?            @relation("CommunicationCreatedBy", fields: [createdBy], references: [id], onDelete: Restrict)
  updatedByUser   UserProfile?            @relation("CommunicationUpdatedBy", fields: [updatedBy], references: [id], onDelete: Restrict)
  publishedByUser UserProfile?            @relation("CommunicationPublishedBy", fields: [publishedBy], references: [id], onDelete: Restrict)
  archivedByUser  UserProfile?            @relation("CommunicationArchivedBy", fields: [archivedBy], references: [id], onDelete: Restrict)

  recipients      CommunicationRecipient[]
  readReceipts    CommunicationReadReceipt[]

  @@unique([tenantId, slug])
  @@unique([tenantId, publicId])
  @@index([tenantId])
  @@index([tenantId, status])
  @@index([tenantId, visibility])
  @@index([tenantId, category])
  @@index([tenantId, priority])
  @@index([tenantId, publishedAt])
  @@index([tenantId, expiresAt])
  @@index([tenantId, isPublicVisible])
  @@index([tenantId, status, visibility, isPublicVisible])
  @@index([tenantId, archivedAt])
  @@index([createdBy])
  @@index([publishedBy])
  @@map("communications")
}
```

---

## 14.3. Modelo `CommunicationRecipient`

```prisma id="y87dtq"
model CommunicationRecipient {
  id              String                     @id @default(uuid())
  tenantId        String                     @map("tenant_id")
  communicationId String                     @map("communication_id")

  recipientType   CommunicationRecipientType @map("recipient_type")

  userId          String?                    @map("user_id")
  personId        String?                    @map("person_id")
  propertyUnitId  String?                    @map("property_unit_id")
  roleId          String?                    @map("role_id")

  createdAt       DateTime                   @default(now()) @map("created_at")
  archivedAt      DateTime?                  @map("archived_at")

  tenant          Tenant                     @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  communication   Communication              @relation(fields: [communicationId], references: [id], onDelete: Restrict)

  user            UserProfile?               @relation("CommunicationRecipientUser", fields: [userId], references: [id], onDelete: Restrict)
  person          Person?                    @relation("CommunicationRecipientPerson", fields: [personId], references: [id], onDelete: Restrict)
  propertyUnit    PropertyUnit?              @relation("CommunicationRecipientPropertyUnit", fields: [propertyUnitId], references: [id], onDelete: Restrict)

  // Ajustar el modelo de rol real según 002-users-roles.
  // role         TenantRole?                @relation(fields: [roleId], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([tenantId, communicationId])
  @@index([tenantId, recipientType])
  @@index([tenantId, userId])
  @@index([tenantId, personId])
  @@index([tenantId, propertyUnitId])
  @@index([tenantId, roleId])
  @@index([tenantId, archivedAt])
  @@map("communication_recipients")
}
```

---

## 14.4. Modelo `CommunicationReadReceipt`

```prisma id="y8u4ud"
model CommunicationReadReceipt {
  id              String        @id @default(uuid())
  tenantId        String        @map("tenant_id")
  communicationId String        @map("communication_id")
  userId          String        @map("user_id")

  readAt          DateTime      @default(now()) @map("read_at")
  createdAt       DateTime      @default(now()) @map("created_at")
  archivedAt      DateTime?     @map("archived_at")

  tenant          Tenant        @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  communication   Communication @relation(fields: [communicationId], references: [id], onDelete: Restrict)
  user            UserProfile   @relation("CommunicationReadReceiptUser", fields: [userId], references: [id], onDelete: Restrict)

  @@unique([tenantId, communicationId, userId])
  @@index([tenantId])
  @@index([tenantId, communicationId])
  @@index([tenantId, userId])
  @@index([tenantId, readAt])
  @@index([tenantId, archivedAt])
  @@map("communication_read_receipts")
}
```

---

## 14.5. Modelo `NotificationTemplate`

```prisma id="k1gtos"
model NotificationTemplate {
  id              String                     @id @default(uuid())
  tenantId        String?                    @map("tenant_id")

  code            String
  name            String
  description     String?

  category        NotificationCategory
  channel         NotificationChannel

  subjectTemplate String?                    @map("subject_template")
  bodyTemplate    String                     @map("body_template")
  variablesSchema Json?                      @map("variables_schema")

  status          NotificationTemplateStatus @default(ACTIVE)
  isSystem        Boolean                    @default(false) @map("is_system")

  createdAt       DateTime                   @default(now()) @map("created_at")
  updatedAt       DateTime                   @updatedAt @map("updated_at")
  archivedAt      DateTime?                  @map("archived_at")

  tenant          Tenant?                    @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  notifications   Notification[]

  @@unique([tenantId, code, channel])
  @@index([tenantId])
  @@index([tenantId, code])
  @@index([tenantId, channel])
  @@index([tenantId, category])
  @@index([tenantId, status])
  @@index([tenantId, archivedAt])
  @@index([code, channel])
  @@map("notification_templates")
}
```

Nota:

```text id="tvl0e0"
Para plantillas globales con tenantId null, PostgreSQL permite múltiples NULL en constraints compuestos. Si se requiere unicidad global estricta para tenantId null, agregar índice parcial raw en migración.
```

---

## 14.6. Modelo `Notification`

```prisma id="pp2e8k"
model Notification {
  id              String                 @id @default(uuid())
  tenantId        String                 @map("tenant_id")

  recipientUserId String                 @map("recipient_user_id")
  recipientPersonId String?              @map("recipient_person_id")
  propertyUnitId  String?                @map("property_unit_id")

  templateId      String?                @map("template_id")

  sourceType      NotificationSourceType @default(MANUAL) @map("source_type")
  sourceId        String?                @map("source_id")

  category        NotificationCategory
  channel         NotificationChannel    @default(IN_APP)

  title           String
  body            String

  status          NotificationStatus     @default(PENDING)
  priority        NotificationPriority   @default(NORMAL)

  readAt          DateTime?              @map("read_at")
  actionUrl       String?                @map("action_url")

  idempotencyKey  String?                @map("idempotency_key")
  metadata        Json?

  createdAt       DateTime               @default(now()) @map("created_at")
  updatedAt       DateTime               @updatedAt @map("updated_at")
  archivedAt      DateTime?              @map("archived_at")

  tenant          Tenant                 @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  recipientUser   UserProfile            @relation("NotificationRecipientUser", fields: [recipientUserId], references: [id], onDelete: Restrict)
  recipientPerson Person?                @relation("NotificationRecipientPerson", fields: [recipientPersonId], references: [id], onDelete: Restrict)
  propertyUnit    PropertyUnit?          @relation("NotificationPropertyUnit", fields: [propertyUnitId], references: [id], onDelete: Restrict)
  template        NotificationTemplate?  @relation(fields: [templateId], references: [id], onDelete: Restrict)

  deliveryAttempts NotificationDeliveryAttempt[]

  @@unique([tenantId, idempotencyKey])
  @@index([tenantId])
  @@index([tenantId, recipientUserId])
  @@index([tenantId, recipientUserId, status])
  @@index([tenantId, category])
  @@index([tenantId, channel])
  @@index([tenantId, status])
  @@index([tenantId, priority])
  @@index([tenantId, sourceType, sourceId])
  @@index([tenantId, createdAt])
  @@index([tenantId, readAt])
  @@index([tenantId, archivedAt])
  @@index([recipientUserId])
  @@index([propertyUnitId])
  @@map("notifications")
}
```

---

## 14.7. Modelo `NotificationDeliveryAttempt`

```prisma id="e0uw6h"
model NotificationDeliveryAttempt {
  id                String                @id @default(uuid())
  tenantId          String                @map("tenant_id")
  notificationId    String                @map("notification_id")

  channel           NotificationChannel
  provider          String?
  destinationMasked String?               @map("destination_masked")

  status            DeliveryAttemptStatus @default(PENDING)
  attemptNumber     Int                   @default(1) @map("attempt_number")

  providerMessageId String?               @map("provider_message_id")
  errorCode         String?               @map("error_code")
  errorMessage      String?               @map("error_message")

  attemptedAt       DateTime              @default(now()) @map("attempted_at")
  deliveredAt       DateTime?             @map("delivered_at")
  failedAt          DateTime?             @map("failed_at")

  metadata          Json?

  tenant            Tenant                @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  notification      Notification          @relation(fields: [notificationId], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([tenantId, notificationId])
  @@index([tenantId, channel])
  @@index([tenantId, status])
  @@index([tenantId, attemptedAt])
  @@index([tenantId, provider])
  @@map("notification_delivery_attempts")
}
```

---

## 14.8. Modelo `NotificationPreference`

```prisma id="dnv94e"
model NotificationPreference {
  id          String               @id @default(uuid())
  tenantId    String               @map("tenant_id")
  userId      String               @map("user_id")

  category    NotificationCategory
  channel     NotificationChannel
  isEnabled   Boolean              @default(true) @map("is_enabled")

  createdAt   DateTime             @default(now()) @map("created_at")
  updatedAt   DateTime             @updatedAt @map("updated_at")
  archivedAt  DateTime?            @map("archived_at")

  tenant      Tenant               @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  user        UserProfile          @relation("NotificationPreferenceUser", fields: [userId], references: [id], onDelete: Restrict)

  @@unique([tenantId, userId, category, channel])
  @@index([tenantId])
  @@index([tenantId, userId])
  @@index([tenantId, category])
  @@index([tenantId, channel])
  @@index([tenantId, archivedAt])
  @@map("notification_preferences")
}
```

---

## 14.9. Relaciones requeridas en modelos existentes

### Tenant

```prisma id="c6ebxm"
model Tenant {
  // campos existentes...

  communications                 Communication[]
  communicationRecipients         CommunicationRecipient[]
  communicationReadReceipts       CommunicationReadReceipt[]

  notificationTemplates           NotificationTemplate[]
  notifications                   Notification[]
  notificationDeliveryAttempts    NotificationDeliveryAttempt[]
  notificationPreferences         NotificationPreference[]
}
```

---

### UserProfile

```prisma id="tmkiwd"
model UserProfile {
  // campos existentes...

  communicationsCreated           Communication[] @relation("CommunicationCreatedBy")
  communicationsUpdated           Communication[] @relation("CommunicationUpdatedBy")
  communicationsPublished         Communication[] @relation("CommunicationPublishedBy")
  communicationsArchived          Communication[] @relation("CommunicationArchivedBy")

  communicationRecipients         CommunicationRecipient[] @relation("CommunicationRecipientUser")
  communicationReadReceipts       CommunicationReadReceipt[] @relation("CommunicationReadReceiptUser")

  notificationsReceived           Notification[] @relation("NotificationRecipientUser")
  notificationPreferences         NotificationPreference[] @relation("NotificationPreferenceUser")
}
```

---

### Person

```prisma id="iuf5yl"
model Person {
  // campos existentes...

  communicationRecipients         CommunicationRecipient[] @relation("CommunicationRecipientPerson")
  notificationsAsRecipientPerson  Notification[] @relation("NotificationRecipientPerson")
}
```

---

### PropertyUnit

```prisma id="qjs87g"
model PropertyUnit {
  // campos existentes...

  communicationRecipients         CommunicationRecipient[] @relation("CommunicationRecipientPropertyUnit")
  notifications                   Notification[] @relation("NotificationPropertyUnit")
}
```

---

### Role / TenantRole

El modelo exacto debe alinearse con `002-users-roles`.

Relación conceptual:

```prisma id="sdlber"
// Ejemplo conceptual. Ajustar al nombre real del modelo de roles por tenant.
model TenantRole {
  // campos existentes...

  communicationRecipients CommunicationRecipient[]
}
```

---

## 15. Constraints recomendadas

## 15.1. `communications`

```text id="o1f8qc"
tenant_id NOT NULL
public_id NOT NULL
title NOT NULL
body NOT NULL
category NOT NULL
visibility NOT NULL
status NOT NULL
priority NOT NULL
audience_type NOT NULL
UNIQUE (tenant_id, slug)
UNIQUE (tenant_id, public_id)
```

Reglas de servicio:

```text id="x1m1qy"
visibility = public requerido para is_public_visible = true
status = published requiere published_at y published_by
status = scheduled requiere publish_at
expires_at debe ser posterior a published_at o publish_at si existe
public endpoint solo devuelve published + public + is_public_visible + active tenant
```

---

## 15.2. `communication_recipients`

```text id="fium7k"
tenant_id NOT NULL
communication_id NOT NULL
recipient_type NOT NULL
```

Reglas de servicio:

```text id="g1b4gh"
recipient_type = user requiere user_id
recipient_type = person requiere person_id
recipient_type = propertyUnit requiere property_unit_id
recipient_type = role requiere role_id
recipient_type = owner no requiere ID individual
recipient_type = resident no requiere ID individual
recipient_type = allTenantUsers no requiere ID individual
todas las referencias deben pertenecer al mismo tenant
```

---

## 15.3. `communication_read_receipts`

```text id="z3l59c"
tenant_id NOT NULL
communication_id NOT NULL
user_id NOT NULL
read_at NOT NULL
UNIQUE (tenant_id, communication_id, user_id)
```

Reglas de servicio:

```text id="x7zwdl"
el usuario solo puede marcar como leído un comunicado accesible para él
mark-read debe ser idempotente
```

---

## 15.4. `notification_templates`

```text id="nh46vy"
code NOT NULL
name NOT NULL
category NOT NULL
channel NOT NULL
body_template NOT NULL
status NOT NULL
is_system NOT NULL
UNIQUE (tenant_id, code, channel)
```

Reglas de servicio:

```text id="ww7p8o"
subject_template requerido para email
solo templates active pueden usarse
variables_schema debe ser JSON válido
is_system impide edición ordinaria
```

Índice parcial recomendado para plantillas globales:

```sql id="lp0kiu"
CREATE UNIQUE INDEX notification_templates_global_code_channel_unique
ON notification_templates(code, channel)
WHERE tenant_id IS NULL AND archived_at IS NULL;
```

---

## 15.5. `notifications`

```text id="fn19rh"
tenant_id NOT NULL
recipient_user_id NOT NULL
source_type NOT NULL
category NOT NULL
channel NOT NULL
title NOT NULL
body NOT NULL
status NOT NULL
priority NOT NULL
UNIQUE (tenant_id, idempotency_key)
```

Reglas de servicio:

```text id="ys1lqb"
recipient_user_id debe pertenecer al tenant
property_unit_id si existe debe pertenecer al tenant
template_id si existe debe pertenecer al tenant o ser global
action_url debe ser relativa o URL permitida
idempotency_key recomendado para eventos
read_at solo por destinatario o proceso autorizado
```

---

## 15.6. `notification_delivery_attempts`

```text id="qn3b6j"
tenant_id NOT NULL
notification_id NOT NULL
channel NOT NULL
status NOT NULL
attempt_number NOT NULL
attempted_at NOT NULL
attempt_number >= 1
```

Reglas de servicio:

```text id="yuv0cc"
canales externos requieren destination_masked
no guardar destino completo
no guardar secretos
no guardar raw provider response completo
error_message debe sanitizarse
```

---

## 15.7. `notification_preferences`

```text id="lkm1k4"
tenant_id NOT NULL
user_id NOT NULL
category NOT NULL
channel NOT NULL
is_enabled NOT NULL
UNIQUE (tenant_id, user_id, category, channel)
```

Reglas de servicio:

```text id="dwvezt"
usuario solo modifica preferencias propias
categorías mandatory/security no pueden desactivarse si la política lo impide
```

---

## 16. Reglas de multitenancy

Todas las tablas tenant-scoped incluyen `tenant_id`.

Regla obligatoria:

```text id="f6b3u5"
Toda consulta tenant-scoped debe filtrar por tenant_id.
```

No se acepta:

```text id="aepijx"
buscar communication solo por id
buscar notification solo por id
buscar template solo por id
buscar delivery attempt solo por id
buscar preference solo por id
usar userId de otro tenant
usar personId de otro tenant
usar propertyUnitId de otro tenant
usar roleId de otro tenant
mezclar recipients entre tenants
exponer announcement público de tenant equivocado
```

Excepción controlada:

```text id="r5sqsn"
notification_templates.tenant_id puede ser null para plantillas globales de plataforma.
```

Incluso en esa excepción, el acceso debe estar controlado por permisos y reglas de uso.

---

## 17. Reglas de visibilidad pública

Un comunicado puede aparecer en WordPress únicamente si:

```text id="hhzpw1"
tenant.status = active
communication.status = published
communication.visibility = public
communication.isPublicVisible = true
communication.archivedAt IS NULL
communication.expiresAt IS NULL OR communication.expiresAt > now()
```

DTO público permitido:

```text id="dftm5a"
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

DTO público prohibido:

```text id="yfu0kk"
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
archivedBy
readReceipts
deliveryAttempts
notifications
preferences
audit data
metadata interna
private/internal/tenant communications
financial private details
fine private details
payment private details
evidence
```

---

## 18. Reglas de audiencia

## 18.1. Audiencia `allTenantUsers`

Representa todos los usuarios activos con membership activa en el tenant.

Registro recomendado:

```text id="h53jdx"
recipientType = allTenantUsers
sin IDs específicos
```

---

## 18.2. Audiencia `owners`

Representa propietarios activos asociados al tenant.

Registro recomendado:

```text id="vqqwnb"
recipientType = owner
sin IDs específicos
```

Resolución mediante `003-residents-properties`.

---

## 18.3. Audiencia `residents`

Representa residentes activos asociados al tenant.

Registro recomendado:

```text id="byf84b"
recipientType = resident
sin IDs específicos
```

Resolución mediante `003-residents-properties`.

---

## 18.4. Audiencia `propertyUnits`

Representa unidades específicas.

Registro:

```text id="r0p8mq"
recipientType = propertyUnit
propertyUnitId = ...
```

Regla:

```text id="yxox90"
propertyUnitId debe pertenecer al tenant.
```

---

## 18.5. Audiencia `roles`

Representa usuarios con roles específicos.

Registro:

```text id="w3czca"
recipientType = role
roleId = ...
```

Regla:

```text id="wrwqcm"
roleId debe pertenecer al tenant o ser rol válido según 002-users-roles.
```

---

## 18.6. Audiencia `specificUsers`

Representa usuarios específicos.

Registro:

```text id="tacyuk"
recipientType = user
userId = ...
```

Regla:

```text id="w97sv3"
userId debe tener membership activa en el tenant.
```

---

## 18.7. Audiencia `mixed`

Permite combinar varios tipos.

Reglas:

* cada recipient debe validarse;
* no duplicar usuarios finales al resolver audiencia;
* no mezclar tenants;
* no exponer recipients públicamente.

---

## 19. Reglas de idempotencia

## 19.1. Notificaciones por evento

Formato recomendado:

```text id="f1y0rp"
notification:{sourceType}:{sourceId}:{recipientUserId}:{channel}
```

Ejemplos:

```text id="ytpv5f"
notification:payment:payment_uuid:user_uuid:inApp
notification:accountStatement:statement_uuid:user_uuid:inApp
notification:reservation:reservation_uuid:user_uuid:email
notification:fine:fine_uuid:user_uuid:inApp
notification:communication:communication_uuid:user_uuid:inApp
```

---

## 19.2. Regla

```text id="o3pihw"
Si ya existe una notificación activa con la misma idempotencyKey, no crear otra notificación.
```

---

## 19.3. Reintentos

La idempotencia de la notificación no impide múltiples intentos de entrega.

Regla:

```text id="uor7uk"
Una Notification representa un mensaje lógico; NotificationDeliveryAttempt representa intentos de entrega.
```

---

## 20. Reglas de preferencias

## 20.1. Preferencia por categoría y canal

Una preferencia se define por:

```text id="itsake"
tenantId
userId
category
channel
```

---

## 20.2. Categorías no desactivables

Categorías que pueden ser obligatorias:

```text id="o1itb8"
mandatory
security
financial crítico según política
```

---

## 20.3. Regla

```text id="u7r02i"
notificationPreferences.isEnabled = false puede bloquear canales informativos, pero no debe bloquear notificaciones mandatory/security si la política del tenant o plataforma las marca como obligatorias.
```

---

## 21. Reglas de canales

## 21.1. Canal `inApp`

MVP obligatorio.

Reglas:

* crea registro en `notifications`;
* visible en `/api/v1/me/notifications`;
* puede crearse como `delivered`;
* `readAt` se marca por usuario;
* no requiere delivery provider externo.

---

## 21.2. Canal `email`

MVP opcional.

Reglas:

* requiere email de usuario;
* requiere provider configurado;
* registra `notification_delivery_attempts`;
* guarda destino enmascarado;
* no guarda credenciales;
* no guarda provider raw response completo;
* si falla, no rompe transacción principal salvo caso crítico explícito.

---

## 21.3. Canales diferidos

```text id="lc344m"
whatsapp
sms
push
webhook
```

Regla:

```text id="ttz2rw"
Pueden existir en enums y modelo, pero no debe implementarse proveedor real en MVP salvo spec adicional.
```

---

## 22. Reglas de contenido

## 22.1. Sanitización

Debe sanitizarse:

```text id="mpbtux"
title
summary
body
subjectTemplate
bodyTemplate
metadata
errorMessage
```

---

## 22.2. Contenido HTML

Decisión MVP recomendada:

```text id="g4ao2i"
Guardar body como texto o HTML sanitizado controlado. No permitir scripts, iframes, handlers inline ni contenido activo.
```

---

## 22.3. Variables de plantilla

Las variables deben estar definidas en `variablesSchema`.

Ejemplo:

```json id="a4gs3w"
{
  "commonAreaName": "string",
  "reservationDate": "string",
  "actionUrl": "string"
}
```

No se permite renderizar variables no declaradas.

---

## 23. DTOs derivados del modelo

## 23.1. CommunicationAdminDto

```text id="g2fhm2"
id
publicId
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
coverImageUrl
createdAt
updatedAt
```

---

## 23.2. CommunicationListItemDto

```text id="lgfg8z"
id
title
slug
summary
category
visibility
status
priority
audienceType
isPublicVisible
publishedAt
expiresAt
updatedAt
```

---

## 23.3. OwnCommunicationDto

```text id="lkcvmf"
id
title
slug
summary
body
category
priority
publishedAt
expiresAt
coverImageUrl
readAt
```

No incluye:

```text id="isbd6e"
recipients
createdBy
updatedBy
publishedBy
metadata interna
audit data
```

---

## 23.4. PublicAnnouncementDto

```text id="qvozmc"
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

No incluye:

```text id="z5no6p"
internal id
tenantId interno
recipients
readReceipts
notifications
metadata interna
audit data
```

---

## 23.5. CommunicationRecipientDto

```text id="k97wrk"
id
communicationId
recipientType
userId
personId
propertyUnitId
roleId
createdAt
```

Solo administrativo.

---

## 23.6. CommunicationReadReceiptDto

```text id="mqhnqp"
id
communicationId
userId
readAt
createdAt
```

Solo administrativo.

---

## 23.7. NotificationTemplateDto

```text id="rvbpqt"
id
tenantId
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
```

---

## 23.8. NotificationAdminDto

```text id="f3amtr"
id
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
idempotencyKey
createdAt
updatedAt
```

---

## 23.9. OwnNotificationDto

```text id="b382uu"
id
category
channel
title
body
status
priority
readAt
actionUrl
createdAt
```

No incluye:

```text id="i5rh2n"
recipientUserId
recipientPersonId
metadata interna
delivery attempts
provider data
idempotencyKey
```

---

## 23.10. NotificationDeliveryAttemptDto

```text id="k3f5oh"
id
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
```

No incluye:

```text id="c2wdyx"
destination completo
credenciales
provider raw response completo
tokens
secrets
```

---

## 23.11. NotificationPreferenceDto

```text id="rb650w"
id
category
channel
isEnabled
createdAt
updatedAt
```

---

## 24. Reglas de consulta

## 24.1. Filtros de comunicados administrativos

```text id="lpauzh"
status
visibility
category
priority
audienceType
isPublicVisible
publishedFrom
publishedTo
expiresFrom
expiresTo
q
page
pageSize
sortBy
sortOrder
```

Sort permitido:

```text id="t1x74q"
createdAt
updatedAt
publishedAt
expiresAt
title
status
category
priority
```

---

## 24.2. Filtros de comunicados propios

```text id="rxwzji"
category
priority
publishedFrom
publishedTo
unreadOnly
page
pageSize
sortBy
sortOrder
```

---

## 24.3. Filtros de comunicados públicos

```text id="wzp3cj"
category
priority
publishedFrom
publishedTo
page
pageSize
sortBy
sortOrder
```

---

## 24.4. Filtros de plantillas

```text id="r1ptyt"
status
category
channel
isSystem
q
page
pageSize
sortBy
sortOrder
```

---

## 24.5. Filtros de notificaciones administrativas

```text id="kpwra3"
recipientUserId
propertyUnitId
sourceType
sourceId
category
channel
status
priority
createdFrom
createdTo
page
pageSize
sortBy
sortOrder
```

---

## 24.6. Filtros de notificaciones propias

```text id="ehvlcs"
category
channel
status
priority
unreadOnly
createdFrom
createdTo
page
pageSize
sortBy
sortOrder
```

---

## 24.7. Filtros de delivery attempts

```text id="u8rw5p"
channel
status
provider
attemptedFrom
attemptedTo
page
pageSize
```

---

## 25. Queries conceptuales

## 25.1. Listar comunicados administrativos

```sql id="k02hzl"
SELECT
  c.id,
  c.public_id,
  c.title,
  c.slug,
  c.summary,
  c.category,
  c.visibility,
  c.status,
  c.priority,
  c.audience_type,
  c.is_public_visible,
  c.published_at,
  c.expires_at,
  c.updated_at
FROM communications c
WHERE c.tenant_id = $1
  AND c.archived_at IS NULL
ORDER BY c.updated_at DESC
LIMIT $2 OFFSET $3;
```

---

## 25.2. Obtener comunicado por tenant

```sql id="mbi05p"
SELECT *
FROM communications
WHERE tenant_id = $1
  AND id = $2
  AND archived_at IS NULL
LIMIT 1;
```

---

## 25.3. Listar comunicados públicos por slug de tenant

```sql id="hlto2g"
SELECT
  c.public_id,
  c.slug,
  c.title,
  c.summary,
  c.body,
  c.category,
  c.priority,
  c.cover_image_url,
  c.published_at,
  c.expires_at
FROM communications c
JOIN tenants t ON t.id = c.tenant_id
WHERE t.slug = $1
  AND t.status = 'active'
  AND c.status = 'published'
  AND c.visibility = 'public'
  AND c.is_public_visible = true
  AND c.archived_at IS NULL
  AND (c.expires_at IS NULL OR c.expires_at > NOW())
ORDER BY c.published_at DESC
LIMIT $2 OFFSET $3;
```

---

## 25.4. Verificar acceso propio a comunicado

Consulta conceptual simplificada:

```sql id="i0l8wy"
SELECT c.*
FROM communications c
WHERE c.tenant_id = $1
  AND c.id = $2
  AND c.status = 'published'
  AND c.archived_at IS NULL
  AND (
    c.audience_type = 'allTenantUsers'
    OR EXISTS (
      SELECT 1
      FROM communication_recipients cr
      WHERE cr.tenant_id = c.tenant_id
        AND cr.communication_id = c.id
        AND cr.archived_at IS NULL
        AND (
          cr.user_id = $3
          OR cr.property_unit_id = ANY($4)
          OR cr.recipient_type IN ('owner', 'resident', 'allTenantUsers')
        )
    )
  )
LIMIT 1;
```

Parámetros:

```text id="p4d0r2"
$1 = tenantId
$2 = communicationId
$3 = actorUserId
$4 = propertyUnitIds autorizadas para actorUserId
```

La implementación real debe resolver propietarios/residentes/roles usando puertos de `002` y `003`.

---

## 25.5. Marcar comunicado como leído

```sql id="q7lfn0"
INSERT INTO communication_read_receipts (
  id,
  tenant_id,
  communication_id,
  user_id,
  read_at,
  created_at
)
VALUES (
  gen_random_uuid(),
  $1,
  $2,
  $3,
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, communication_id, user_id)
DO UPDATE SET read_at = communication_read_receipts.read_at
RETURNING *;
```

Regla:

```text id="dl9uls"
mark-read debe ser idempotente; no debe crear registros duplicados.
```

---

## 25.6. Crear notificación idempotente

```sql id="y2u4my"
INSERT INTO notifications (
  id,
  tenant_id,
  recipient_user_id,
  property_unit_id,
  source_type,
  source_id,
  category,
  channel,
  title,
  body,
  status,
  priority,
  idempotency_key,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  $1,
  $2,
  $3,
  $4,
  $5,
  $6,
  $7,
  $8,
  $9,
  $10,
  $11,
  $12,
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, idempotency_key)
DO NOTHING
RETURNING *;
```

---

## 25.7. Listar notificaciones propias

```sql id="hs7wcc"
SELECT
  id,
  category,
  channel,
  title,
  body,
  status,
  priority,
  read_at,
  action_url,
  created_at
FROM notifications
WHERE tenant_id = $1
  AND recipient_user_id = $2
  AND archived_at IS NULL
ORDER BY created_at DESC
LIMIT $3 OFFSET $4;
```

---

## 25.8. Marcar notificación propia como leída

```sql id="f1xv83"
UPDATE notifications
SET
  read_at = COALESCE(read_at, NOW()),
  status = CASE
    WHEN status IN ('delivered', 'sent', 'pending') THEN 'read'
    ELSE status
  END,
  updated_at = NOW()
WHERE tenant_id = $1
  AND id = $2
  AND recipient_user_id = $3
  AND archived_at IS NULL
RETURNING *;
```

---

## 25.9. Registrar delivery attempt

```sql id="byitvz"
INSERT INTO notification_delivery_attempts (
  id,
  tenant_id,
  notification_id,
  channel,
  provider,
  destination_masked,
  status,
  attempt_number,
  attempted_at
)
VALUES (
  gen_random_uuid(),
  $1,
  $2,
  $3,
  $4,
  $5,
  'pending',
  $6,
  NOW()
);
```

---

## 26. Índices recomendados

## 26.1. `communications`

```text id="yucj8j"
tenant_id
tenant_id + slug
tenant_id + public_id
tenant_id + status
tenant_id + visibility
tenant_id + category
tenant_id + priority
tenant_id + published_at
tenant_id + expires_at
tenant_id + is_public_visible
tenant_id + status + visibility + is_public_visible
tenant_id + archived_at
created_by
published_by
```

---

## 26.2. `communication_recipients`

```text id="r106sg"
tenant_id
tenant_id + communication_id
tenant_id + recipient_type
tenant_id + user_id
tenant_id + person_id
tenant_id + property_unit_id
tenant_id + role_id
tenant_id + archived_at
```

---

## 26.3. `communication_read_receipts`

```text id="whnsxj"
tenant_id
tenant_id + communication_id
tenant_id + user_id
tenant_id + communication_id + user_id unique
tenant_id + read_at
tenant_id + archived_at
```

---

## 26.4. `notification_templates`

```text id="jxz7yw"
tenant_id
tenant_id + code
tenant_id + code + channel unique
tenant_id + channel
tenant_id + category
tenant_id + status
tenant_id + archived_at
code + channel para plantillas globales
```

---

## 26.5. `notifications`

```text id="vq0fzy"
tenant_id
tenant_id + recipient_user_id
tenant_id + recipient_user_id + status
tenant_id + category
tenant_id + channel
tenant_id + status
tenant_id + priority
tenant_id + source_type + source_id
tenant_id + idempotency_key unique
tenant_id + created_at
tenant_id + read_at
tenant_id + archived_at
recipient_user_id
property_unit_id
```

---

## 26.6. `notification_delivery_attempts`

```text id="cig2w1"
tenant_id
tenant_id + notification_id
tenant_id + channel
tenant_id + status
tenant_id + attempted_at
tenant_id + provider
```

---

## 26.7. `notification_preferences`

```text id="ahwy65"
tenant_id
tenant_id + user_id
tenant_id + user_id + category + channel unique
tenant_id + category
tenant_id + channel
tenant_id + archived_at
```

---

## 27. Soft delete y archivo

No se debe eliminar físicamente:

```text id="n6oawc"
communications
communication_recipients
communication_read_receipts
notification_templates
notifications
notification_delivery_attempts
notification_preferences
```

Regla:

```text id="pntz6k"
archivedAt != null representa archivo lógico.
```

Para entidades con `status`, usar además:

```text id="z3gyha"
status = archived
```

cuando aplique.

Motivos:

* auditoría;
* trazabilidad de publicaciones;
* historial de destinatarios;
* trazabilidad de notificaciones;
* evidencia de intentos de entrega;
* soporte a reclamos operativos;
* cumplimiento de seguridad;
* análisis futuro.

---

## 28. Reglas de seguridad de metadata

No guardar en `metadata`:

```text id="seik8b"
passwords
tokens
api keys
client secrets
cookies
authorization headers
connection strings
provider credentials
provider raw response completo
body completo si contiene información sensible
emails completos
teléfonos completos
documentos personales
comprobantes
evidencias
datos financieros detallados
stack traces
```

Permitido en `metadata`:

```text id="z7czuu"
traceId
correlationId
sourceType
sourceId
safe category
safe status
safe flags
sanitized provider code
non-sensitive retry metadata
```

---

## 29. Reglas de masking

## 29.1. Email

Ejemplos:

```text id="z07gl2"
gustavo@example.com -> g*****o@example.com
admin@resident.com -> a***n@resident.com
a@x.com -> a***@x.com
```

---

## 29.2. Teléfono

Ejemplos:

```text id="cxgkps"
+593987654321 -> +593*******321
0987654321 -> *******321
```

---

## 29.3. Reglas

* No guardar destino completo en `notification_delivery_attempts`.
* El destino completo solo puede existir temporalmente en memoria durante el envío.
* No loguear destino completo.
* No auditar destino completo.
* No retornar destino completo por API.

---

## 30. Reglas de integración con WordPress

La integración pública se soporta desde `communications`.

Endpoints:

```text id="nl8hkn"
GET /api/v1/public/tenants/{slug}/announcements
GET /api/v1/public/tenants/{slug}/announcements/{communicationSlug}
```

Fuente de datos:

```text id="uy7f1n"
communications
```

Filtro obligatorio:

```text id="qr3ugl"
status = published
visibility = public
isPublicVisible = true
archivedAt IS NULL
expiresAt IS NULL OR expiresAt > now()
```

No usar:

```text id="ymuh03"
notifications
communication_recipients
communication_read_receipts
notification_preferences
notification_delivery_attempts
```

en endpoints públicos.

---

## 31. Reglas de auditoría desde modelo

Eventos mínimos:

```text id="j2mz28"
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

Metadata permitida:

```text id="afuj85"
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

Metadata prohibida:

```text id="gcbo4v"
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
```

---

## 32. Migración

Nombre sugerido:

```text id="m3cgoi"
012_create_communications_notifications
```

Pasos:

```text id="byit66"
1. Crear enums.
2. Crear communications.
3. Crear communication_recipients.
4. Crear communication_read_receipts.
5. Crear notification_templates.
6. Crear notifications.
7. Crear notification_delivery_attempts.
8. Crear notification_preferences.
9. Crear índices.
10. Crear constraints básicos.
11. Crear índices parciales raw si aplica.
12. Agregar relaciones Prisma.
13. Generar Prisma Client.
14. Ejecutar migración en DB test.
15. Ejecutar seeds demo.
16. Validar tests de repositorio.
```

---

## 33. Migraciones raw opcionales

### 33.1. Unicidad global de plantillas de plataforma

```sql id="rd7vep"
CREATE UNIQUE INDEX notification_templates_global_code_channel_unique
ON notification_templates(code, channel)
WHERE tenant_id IS NULL AND archived_at IS NULL;
```

---

### 33.2. Validar `attempt_number`

```sql id="ftudiv"
ALTER TABLE notification_delivery_attempts
ADD CONSTRAINT notification_delivery_attempts_attempt_number_positive
CHECK (attempt_number >= 1);
```

---

### 33.3. Validar publicación pública

Puede evaluarse constraint parcial o mantenerlo en servicio.

Regla de servicio preferida:

```text id="sp0j67"
is_public_visible = true implica visibility = public.
```

Constraint opcional:

```sql id="zxm9n6"
ALTER TABLE communications
ADD CONSTRAINT communications_public_visible_requires_public_visibility
CHECK (
  is_public_visible = false
  OR visibility = 'public'
);
```

---

### 33.4. Validar fechas de publicación

```sql id="v4z5d8"
ALTER TABLE communications
ADD CONSTRAINT communications_expires_after_publish
CHECK (
  expires_at IS NULL
  OR publish_at IS NULL
  OR expires_at > publish_at
);
```

---

## 34. Seeds

## 34.1. Comunicados demo

```text id="fl0fxh"
communicationGeneralPublishedA
communicationMaintenanceDraftA
communicationPublicAnnouncementA
communicationFinancialTenantA
communicationInternalAdminA
communicationExpiredPublicA
communicationArchivedA
communicationPublicB
```

---

## 34.2. Destinatarios demo

```text id="ujsve9"
recipientAllTenantUsersA
recipientOwnersA
recipientResidentsA
recipientPropertyUnitA101
recipientRoleAdminA
recipientSpecificUserA
```

---

## 34.3. Read receipts demo

```text id="vzov5x"
readReceiptOwnerA
readReceiptResidentA
```

---

## 34.4. Plantillas demo

```text id="kqpo8f"
templatePaymentConfirmedInApp
templateAccountStatementPublishedInApp
templateReservationApprovedInApp
templateReservationRejectedInApp
templateFineIssuedInApp
templateFineAppealResolvedInApp
templateGeneralAnnouncementInApp
templateEmailGeneric
```

---

## 34.5. Notificaciones demo

```text id="vt8bid"
notificationPaymentConfirmedA
notificationStatementPublishedA
notificationReservationApprovedA
notificationFineIssuedA
notificationAnnouncementA
notificationUnreadA
notificationReadA
notificationFailedEmailA
notificationB
```

---

## 34.6. Delivery attempts demo

```text id="f5vw26"
deliveryAttemptInAppDeliveredA
deliveryAttemptEmailSentA
deliveryAttemptEmailFailedA
deliveryAttemptEmailSkippedA
```

---

## 34.7. Preferencias demo

```text id="opsgf3"
preferenceOwnerAInformationalEmailDisabled
preferenceOwnerAFinancialInAppEnabled
preferenceResidentAReservationInAppEnabled
preferenceResidentAEmailDisabled
```

---

## 34.8. Datos prohibidos en seeds

```text id="v0h9i5"
nombres reales de residentes
emails reales
teléfonos reales
cédulas reales
direcciones personales reales
contenido privado real
comprobantes reales
evidencias reales
tokens
cookies
secretos
API keys
provider credentials
provider message ids reales
URLs firmadas reales
```

---

## 35. Testing del modelo

## 35.1. Unit tests

```text id="eaigja"
Communication entity
CommunicationRecipient entity
CommunicationReadReceipt entity
NotificationTemplate entity
Notification entity
NotificationDeliveryAttempt entity
NotificationPreference entity
CommunicationStatus
CommunicationVisibility
CommunicationCategory
CommunicationPriority
AudienceType
CommunicationRecipientType
NotificationTemplateStatus
NotificationStatus
NotificationChannel
NotificationCategory
NotificationPriority
DeliveryAttemptStatus
NotificationSourceType
MaskedDestination
```

---

## 35.2. Repository tests

```text id="yp3gqw"
create communication
list communications by tenant
find communication by id and tenant
find public announcement by tenant slug and slug
update communication status
replace recipients
list recipients
mark communication read idempotently
create notification template
find active template
create notification idempotently
list own notifications
mark own notification read
create delivery attempt
mark delivery attempt failed
upsert notification preference
```

---

## 35.3. Multitenancy tests

```text id="tfqj0n"
tenant A no ve communications tenant B
tenant A no ve notification templates tenant B
tenant A no ve notifications tenant B
tenant A no ve delivery attempts tenant B
tenant A no ve preferences tenant B
tenant A no usa userId tenant B como recipient
tenant A no usa propertyUnitId tenant B como recipient
tenant A no usa personId tenant B como recipient
tenant A no usa roleId tenant B como recipient
public tenant A no devuelve announcements tenant B
```

---

## 35.4. Public safety tests

```text id="l0xhhk"
draft no aparece públicamente
scheduled no aparece públicamente
internal no aparece públicamente
tenant visibility no aparece públicamente
private no aparece públicamente
published public visible aparece públicamente
expired no aparece públicamente por defecto
archived no aparece públicamente
response pública no contiene recipients
response pública no contiene metadata interna
response pública no contiene readReceipts
response pública no contiene notifications
```

---

## 35.5. Notification privacy tests

```text id="im2z5p"
usuario no ve notificación ajena
usuario no marca notificación ajena como leída
usuario no ve delivery attempts propios si no corresponde
own DTO no expone recipientUserId
own DTO no expone metadata interna
no endpoints públicos de notifications
```

---

## 35.6. Delivery security tests

```text id="l6o4fn"
destinationMasked no guarda email completo
destinationMasked no guarda teléfono completo
errorMessage sanitizado
metadata sin provider credentials
provider raw response no persiste
delivery attempts no exponen secretos
```

---

## 36. Decisión final del modelo

El módulo `012-communications-notifications` usará las siguientes tablas:

```text id="qypmge"
communications
communication_recipients
communication_read_receipts
notification_templates
notifications
notification_delivery_attempts
notification_preferences
```

El modelo garantiza:

```text id="t6pbn9"
tenant isolation
audiencias controladas
comunicados administrativos
comunicados propios
comunicados públicos seguros
notificaciones in-app
plantillas de notificación
intentos de entrega
preferencias básicas
idempotencia
destination masking
trazabilidad
auditoría
no exposición pública de notificaciones
no exposición pública de comunicados privados
```

La implementación no debe aceptarse si:

```text id="rppytz"
permite comunicaciones cross-tenant
permite notificaciones cross-tenant
permite recipients de otro tenant
expone comunicados privados en WordPress
expone notificaciones públicamente
permite consultar notificaciones ajenas
permite marcar notificaciones ajenas como leídas
guarda emails completos en delivery attempts
guarda teléfonos completos en delivery attempts
guarda secretos de proveedor en metadata
duplica notificaciones por evento
omite idempotencia
omite auditoría
omite tenant_id
busca recursos solo por id sin tenant_id
```

---

## 37. Pendientes para evolución

Quedan diferidos:

```text id="v845fe"
proveedor email real avanzado
WhatsApp real
SMS real
push móvil
webhooks salientes avanzados
n8n workflows avanzados
constructor visual de plantillas
WYSIWYG avanzado
adjuntos complejos
boletines avanzados
confirmación legal certificada
firma electrónica
chat bidireccional
foros comunitarios
comentarios
encuestas
votaciones
campañas masivas
marketing automation
traducción automática
IA para redacción con datos reales
análisis de sentimiento
analytics avanzado
multi-región
```

Estos diferidos no bloquean el MVP de `012-communications-notifications`.
