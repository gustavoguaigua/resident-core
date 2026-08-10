# Data Model — Spec 013 Meetings and Attendance

## 1. Información del documento

| Campo                  | Valor                                                                                               |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| Proyecto               | RESIDENT Core                                                                                       |
| Spec ID                | 013                                                                                                 |
| Módulo                 | Meetings and Attendance                                                                             |
| Documento              | Data Model                                                                                          |
| Ruta                   | `docs/specs/013-meetings-attendance/data-model.md`                                                  |
| Versión                | 0.1                                                                                                 |
| Estado                 | needs-review                                                                                        |
| Fecha                  | 2026-07-19                                                                                          |
| Documento base         | `docs/specs/013-meetings-attendance/spec.md`                                                        |
| Plan técnico           | `docs/specs/013-meetings-attendance/plan.md`                                                        |
| Base de datos          | PostgreSQL                                                                                          |
| ORM                    | Prisma                                                                                              |
| Estrategia multitenant | Shared database + shared schema + `tenant_id`                                                       |
| Naturaleza del módulo  | Tenant-scoped / Attendance-aware / Quorum-aware / Permissioned / Own-resource protected / Auditable |
| API Style              | REST                                                                                                |

---

## 2. Propósito

Este documento define el modelo de datos del módulo `013-meetings-attendance`.

El objetivo es modelar reuniones, agenda, participantes, asistencia, representaciones básicas, quórum, actas preliminares y resoluciones básicas, garantizando:

* aislamiento por tenant;
* trazabilidad de reuniones;
* control de agenda;
* control de participantes;
* registro de asistencia;
* prevención de asistencia duplicada;
* representación básica;
* cálculo básico de quórum;
* actas preliminares;
* resoluciones básicas;
* consultas administrativas;
* consultas propias;
* protección de datos personales;
* ausencia de exposición pública;
* integración con notificaciones;
* auditoría;
* compatibilidad con futuras specs de votación, actas formales y firmas.

Regla central:

```text id="r7wshb"
Toda reunión, agenda, participante, asistencia, representación, acta o resolución debe ser tenant-scoped, state-controlled, permissioned, own-resource protected, privacy-preserving y auditable.
```

---

## 3. Decisión principal del modelo

Para MVP se crearán siete tablas principales:

```text id="cu9n82"
meetings
meeting_agenda_items
meeting_participants
meeting_attendance
meeting_proxies
meeting_minutes
meeting_resolutions
```

Estas tablas permiten cubrir:

* reuniones y asambleas;
* agenda básica;
* participantes esperados;
* asistencia administrativa;
* asistencia propia opcional;
* ausencias;
* tardanzas;
* salida anticipada;
* representaciones básicas;
* quórum simple;
* actas preliminares;
* resoluciones básicas;
* auditoría;
* reportes futuros;
* notificaciones futuras;
* futuras votaciones.

---

## 4. Tablas nuevas MVP

```text id="n9wl25"
meetings
meeting_agenda_items
meeting_participants
meeting_attendance
meeting_proxies
meeting_minutes
meeting_resolutions
```

---

## 5. Tablas externas relacionadas

El módulo se relaciona con tablas ya definidas en specs anteriores:

```text id="f7cavg"
tenants
user_profiles
persons
property_units
roles / tenant_roles según implementación de 002-users-roles
audit_logs
notifications
communications
```

Relación con specs:

| Tabla externa            | Spec origen                        | Uso en reuniones/asistencia                                               |
| ------------------------ | ---------------------------------- | ------------------------------------------------------------------------- |
| `tenants`                | `001-tenants`                      | Tenant propietario de reuniones, agenda, asistencia, actas y resoluciones |
| `user_profiles`          | `002-users-roles`                  | Usuarios creadores, convocantes, asistentes, representantes, aprobadores  |
| `roles` / `tenant_roles` | `002-users-roles`                  | Participantes por rol, directiva o comité                                 |
| `persons`                | `003-residents-properties`         | Personas asistentes, representadas o representantes                       |
| `property_units`         | `003-residents-properties`         | Unidades convocadas, representadas o asociadas a asistencia               |
| `audit_logs`             | `007-audit`                        | Auditoría de operaciones críticas                                         |
| `communications`         | `012-communications-notifications` | Comunicados o convocatorias relacionadas                                  |
| `notifications`          | `012-communications-notifications` | Notificaciones derivadas de eventos de reuniones                          |

---

## 6. Entidad `Meeting`

### 6.1. Propósito

Representa una reunión, asamblea o sesión administrativa dentro de un tenant.

Ejemplos:

```text id="ozw3hu"
asamblea ordinaria
asamblea extraordinaria
reunión de directiva
reunión de comité
reunión informativa
reunión financiera
reunión de seguridad
reunión de mantenimiento
```

---

### 6.2. Tabla

```text id="r6qzbr"
meetings
```

---

### 6.3. Campos

```text id="yucpci"
Meeting
├── id
├── tenantId
├── title
├── description
├── meetingType
├── modality
├── location
├── virtualMeetingUrl
├── status
├── visibility
├── startsAt
├── endsAt
├── timezone
├── calledAt
├── calledBy
├── createdBy
├── updatedBy
├── cancelledBy
├── closedBy
├── archivedBy
├── cancellationReason
├── quorumRuleType
├── quorumRequiredValue
├── quorumCalculatedValue
├── quorumMet
├── quorumCalculatedAt
├── attendanceClosedAt
├── minutesStatus
├── metadata
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 6.4. Reglas

* `tenantId` obligatorio.
* `title` obligatorio.
* `meetingType` obligatorio.
* `modality` obligatoria.
* `status` obligatorio.
* `visibility` obligatoria.
* `startsAt` obligatorio.
* `endsAt`, si existe, debe ser posterior a `startsAt`.
* `timezone` obligatorio; por defecto `America/Guayaquil`.
* `virtualMeetingUrl` solo aplica para `virtual` o `hybrid`.
* `location` recomendado para `inPerson` o `hybrid`.
* `calledAt` se registra al convocar.
* `calledBy` se registra al convocar.
* `cancellationReason` requerido al cancelar.
* `quorumRequiredValue` debe ser decimal positivo si la regla requiere valor.
* `quorumCalculatedValue` es calculado, no enviado por cliente.
* `quorumMet` es calculado, no enviado por cliente.
* `attendanceClosedAt` se registra al cerrar asistencia.
* `minutesStatus` refleja estado general del acta.
* `metadata` debe ser sanitizada.
* No se permite eliminación física ordinaria.

---

## 7. Entidad `MeetingAgendaItem`

### 7.1. Propósito

Representa un punto de agenda de una reunión.

Ejemplos:

```text id="v56a22"
Lectura del acta anterior
Informe financiero
Aprobación de presupuesto
Mantenimiento de áreas comunales
Revisión de multas
Plan de seguridad
Varios
```

---

### 7.2. Tabla

```text id="zd6w6a"
meeting_agenda_items
```

---

### 7.3. Campos

```text id="q9q0nc"
MeetingAgendaItem
├── id
├── tenantId
├── meetingId
├── order
├── title
├── description
├── presenterUserId
├── estimatedMinutes
├── status
├── notes
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 7.4. Reglas

* `tenantId` obligatorio.
* `meetingId` obligatorio.
* `meetingId` debe pertenecer al mismo tenant.
* `order` obligatorio.
* `order` debe ser único por reunión activa.
* `title` obligatorio.
* `presenterUserId`, si existe, debe pertenecer al mismo tenant.
* `estimatedMinutes`, si existe, debe ser mayor o igual a cero.
* `status` obligatorio.
* `notes` debe ser sanitizado.
* No se permite agenda en reunión archivada o cancelada salvo consulta histórica.
* No se elimina físicamente en operación ordinaria.

---

## 8. Entidad `MeetingParticipant`

### 8.1. Propósito

Representa un participante esperado, convocado o audiencia de una reunión.

Puede ser:

```text id="si00gg"
usuario específico
persona específica
unidad habitacional
rol
propietarios
residentes
todos los usuarios del tenant
miembros de directiva
miembros de comité
```

---

### 8.2. Tabla

```text id="cmglyd"
meeting_participants
```

---

### 8.3. Campos

```text id="m633fn"
MeetingParticipant
├── id
├── tenantId
├── meetingId
├── participantType
├── userId
├── personId
├── propertyUnitId
├── roleId
├── isRequired
├── status
├── invitedAt
├── respondedAt
├── response
├── createdAt
└── archivedAt
```

---

### 8.4. Reglas

* `tenantId` obligatorio.
* `meetingId` obligatorio.
* `meetingId` debe pertenecer al mismo tenant.
* `participantType` obligatorio.
* Si `participantType = user`, `userId` obligatorio.
* Si `participantType = person`, `personId` obligatorio.
* Si `participantType = propertyUnit`, `propertyUnitId` obligatorio.
* Si `participantType = role`, `roleId` obligatorio.
* Si `participantType = owners`, no requiere ID individual.
* Si `participantType = residents`, no requiere ID individual.
* Si `participantType = allTenantUsers`, no requiere ID individual.
* Si `participantType = boardMembers`, puede resolverse por rol/política.
* Si `participantType = committeeMembers`, puede resolverse por rol/política.
* Todas las referencias deben pertenecer al tenant.
* `isRequired` define si el participante cuenta como esperado obligatorio.
* No se exponen participantes completos en endpoints `/me` salvo información propia mínima.
* No se exponen participantes en endpoints públicos.
* No se elimina físicamente en operación ordinaria.

---

## 9. Entidad `MeetingAttendance`

### 9.1. Propósito

Representa el registro de asistencia, ausencia, tardanza, salida anticipada, excusa o representación en una reunión.

---

### 9.2. Tabla

```text id="lru6z1"
meeting_attendance
```

---

### 9.3. Campos

```text id="nb4qhf"
MeetingAttendance
├── id
├── tenantId
├── meetingId
├── participantId
├── userId
├── personId
├── propertyUnitId
├── attendanceStatus
├── checkInAt
├── checkOutAt
├── registeredBy
├── registrationMethod
├── notes
├── isProxy
├── proxyId
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 9.4. Reglas

* `tenantId` obligatorio.
* `meetingId` obligatorio.
* `meetingId` debe pertenecer al mismo tenant.
* Debe tener al menos uno de:

  * `participantId`;
  * `userId`;
  * `personId`;
  * `propertyUnitId`;
  * `proxyId`.
* `participantId`, si existe, debe pertenecer al mismo tenant y reunión.
* `userId`, si existe, debe pertenecer al mismo tenant.
* `personId`, si existe, debe pertenecer al mismo tenant.
* `propertyUnitId`, si existe, debe pertenecer al mismo tenant.
* `proxyId`, si existe, debe pertenecer al mismo tenant y reunión.
* `registeredBy` obligatorio para registros administrativos.
* `registrationMethod` obligatorio.
* `attendanceStatus` obligatorio.
* `checkInAt` requerido para `present`, `late` y `represented` según política.
* `checkOutAt`, si existe, debe ser posterior a `checkInAt`.
* Si `attendanceStatus = represented`, `isProxy = true`.
* Si `isProxy = true`, `proxyId` obligatorio.
* Si `proxyId` existe, el proxy debe estar `approved`.
* No debe existir asistencia activa duplicada para el mismo sujeto en la misma reunión.
* Si la asistencia está cerrada, cambios requieren permiso `meetingAttendance.override`.
* No se elimina físicamente en operación ordinaria.

---

## 10. Entidad `MeetingProxy`

### 10.1. Propósito

Representa una representación o delegación básica para una reunión.

MVP no valida formalidad legal avanzada.

---

### 10.2. Tabla

```text id="pd8ic7"
meeting_proxies
```

---

### 10.3. Campos

```text id="rh9uvv"
MeetingProxy
├── id
├── tenantId
├── meetingId
├── representedPersonId
├── representedUserId
├── representedPropertyUnitId
├── representativePersonId
├── representativeUserId
├── documentReference
├── status
├── approvedBy
├── approvedAt
├── rejectedBy
├── rejectedAt
├── rejectionReason
├── cancelledBy
├── cancelledAt
├── cancellationReason
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 10.4. Reglas

* `tenantId` obligatorio.
* `meetingId` obligatorio.
* `meetingId` debe pertenecer al mismo tenant.
* Debe existir al menos un sujeto representado:

  * `representedPersonId`;
  * `representedUserId`;
  * `representedPropertyUnitId`.
* Debe existir al menos un representante:

  * `representativePersonId`;
  * `representativeUserId`.
* Representado y representante deben pertenecer al mismo tenant.
* Representado y representante no deben ser la misma persona lógica, salvo política explícita.
* `documentReference` es opcional en MVP.
* `documentReference` no debe ser URL pública permanente.
* `status` obligatorio.
* `approvedBy` y `approvedAt` requeridos al aprobar.
* `rejectedBy`, `rejectedAt` y `rejectionReason` requeridos al rechazar.
* `cancelledBy`, `cancelledAt` y `cancellationReason` requeridos al cancelar.
* No se elimina físicamente en operación ordinaria.

---

## 11. Entidad `MeetingMinutes`

### 11.1. Propósito

Representa el acta preliminar o resumen estructurado de una reunión.

MVP no genera PDF formal ni firma electrónica.

---

### 11.2. Tabla

```text id="h38od7"
meeting_minutes
```

---

### 11.3. Campos

```text id="ehm8xb"
MeetingMinutes
├── id
├── tenantId
├── meetingId
├── title
├── summary
├── body
├── status
├── preparedBy
├── reviewedBy
├── approvedBy
├── publishedBy
├── preparedAt
├── reviewedAt
├── approvedAt
├── publishedAt
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 11.4. Reglas

* `tenantId` obligatorio.
* `meetingId` obligatorio.
* `meetingId` debe pertenecer al mismo tenant.
* Una reunión debe tener máximo un acta activa en MVP.
* `title` obligatorio.
* `body` obligatorio.
* `body` debe ser sanitizado.
* `summary` debe ser sanitizado.
* `status` obligatorio.
* `preparedBy` requerido al crear.
* `preparedAt` requerido al crear.
* `reviewedBy` y `reviewedAt` requeridos al pasar a revisión completada si aplica.
* `approvedBy` y `approvedAt` requeridos al aprobar.
* `publishedBy` y `publishedAt` requeridos al publicar.
* Acta publicada solo visible para usuarios autorizados.
* No se expone públicamente.
* No se elimina físicamente en operación ordinaria.

---

## 12. Entidad `MeetingResolution`

### 12.1. Propósito

Representa una resolución básica registrada en una reunión.

No equivale a votación electrónica formal.

---

### 12.2. Tabla

```text id="woqb5o"
meeting_resolutions
```

---

### 12.3. Campos

```text id="bzlksl"
MeetingResolution
├── id
├── tenantId
├── meetingId
├── agendaItemId
├── title
├── description
├── resolutionType
├── status
├── recordedBy
├── approvedBy
├── cancelledBy
├── recordedAt
├── approvedAt
├── cancelledAt
├── cancellationReason
├── effectiveFrom
├── metadata
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 12.4. Reglas

* `tenantId` obligatorio.
* `meetingId` obligatorio.
* `meetingId` debe pertenecer al mismo tenant.
* `agendaItemId`, si existe, debe pertenecer a la misma reunión y tenant.
* `title` obligatorio.
* `description` obligatoria.
* `resolutionType` obligatorio.
* `status` obligatorio.
* `recordedBy` requerido.
* `recordedAt` requerido.
* `approvedBy` y `approvedAt` requeridos al aprobar.
* `cancelledBy`, `cancelledAt` y `cancellationReason` requeridos al cancelar.
* `metadata` debe ser sanitizada.
* No ejecuta acción automática.
* No representa votación formal.
* No se expone públicamente.
* No se elimina físicamente en operación ordinaria.

---

# 13. Enums

## 13.1. MeetingType

```text id="d5an67"
ordinaryAssembly
extraordinaryAssembly
boardMeeting
committeeMeeting
informationalMeeting
financialMeeting
securityMeeting
maintenanceMeeting
other
```

---

## 13.2. MeetingModality

```text id="eslug2"
inPerson
virtual
hybrid
```

---

## 13.3. MeetingStatus

```text id="vnxfwu"
draft
scheduled
called
inProgress
attendanceClosed
completed
cancelled
archived
```

---

## 13.4. MeetingVisibility

```text id="zyxw48"
private
administrative
tenant
owners
residents
mixed
```

---

## 13.5. AgendaItemStatus

```text id="siyvez"
pending
inProgress
completed
skipped
archived
```

---

## 13.6. ParticipantType

```text id="ku68zf"
user
person
propertyUnit
role
owners
residents
allTenantUsers
boardMembers
committeeMembers
```

---

## 13.7. ParticipantStatus

```text id="uq6dlc"
invited
confirmed
declined
tentative
attended
absent
represented
archived
```

---

## 13.8. ParticipantResponse

```text id="p1n9uc"
pending
confirmed
declined
tentative
```

---

## 13.9. AttendanceStatus

```text id="vqnp4i"
present
absent
late
leftEarly
represented
excused
cancelled
archived
```

---

## 13.10. AttendanceRegistrationMethod

```text id="ekegbb"
admin
self
qr
import
system
other
```

MVP obligatorio:

```text id="hlp10s"
admin
```

MVP opcional:

```text id="wq92zp"
self
```

Diferidos:

```text id="dbegx1"
qr
import
system avanzado
```

---

## 13.11. ProxyStatus

```text id="rxzgea"
submitted
approved
rejected
cancelled
archived
```

---

## 13.12. QuorumRuleType

```text id="fe4b4b"
none
participantCount
propertyUnitCount
percentageOfExpectedParticipants
percentageOfPropertyUnits
custom
```

---

## 13.13. MinutesStatus

```text id="dzqsdl"
notStarted
draft
underReview
approved
published
archived
```

---

## 13.14. ResolutionType

```text id="jlexw0"
informational
administrative
financial
maintenance
security
fine
reservation
other
```

---

## 13.15. ResolutionStatus

```text id="d3ebop"
draft
recorded
approved
cancelled
archived
```

---

# 14. Modelo Prisma preliminar

## 14.1. Enums Prisma

```prisma id="z5epzk"
enum MeetingType {
  ORDINARY_ASSEMBLY      @map("ordinaryAssembly")
  EXTRAORDINARY_ASSEMBLY @map("extraordinaryAssembly")
  BOARD_MEETING          @map("boardMeeting")
  COMMITTEE_MEETING      @map("committeeMeeting")
  INFORMATIONAL_MEETING  @map("informationalMeeting")
  FINANCIAL_MEETING      @map("financialMeeting")
  SECURITY_MEETING       @map("securityMeeting")
  MAINTENANCE_MEETING    @map("maintenanceMeeting")
  OTHER                  @map("other")

  @@map("meeting_type")
}

enum MeetingModality {
  IN_PERSON @map("inPerson")
  VIRTUAL   @map("virtual")
  HYBRID    @map("hybrid")

  @@map("meeting_modality")
}

enum MeetingStatus {
  DRAFT             @map("draft")
  SCHEDULED         @map("scheduled")
  CALLED            @map("called")
  IN_PROGRESS       @map("inProgress")
  ATTENDANCE_CLOSED @map("attendanceClosed")
  COMPLETED         @map("completed")
  CANCELLED         @map("cancelled")
  ARCHIVED          @map("archived")

  @@map("meeting_status")
}

enum MeetingVisibility {
  PRIVATE        @map("private")
  ADMINISTRATIVE @map("administrative")
  TENANT         @map("tenant")
  OWNERS         @map("owners")
  RESIDENTS      @map("residents")
  MIXED          @map("mixed")

  @@map("meeting_visibility")
}

enum AgendaItemStatus {
  PENDING     @map("pending")
  IN_PROGRESS @map("inProgress")
  COMPLETED   @map("completed")
  SKIPPED     @map("skipped")
  ARCHIVED    @map("archived")

  @@map("agenda_item_status")
}

enum ParticipantType {
  USER             @map("user")
  PERSON           @map("person")
  PROPERTY_UNIT    @map("propertyUnit")
  ROLE             @map("role")
  OWNERS           @map("owners")
  RESIDENTS        @map("residents")
  ALL_TENANT_USERS @map("allTenantUsers")
  BOARD_MEMBERS    @map("boardMembers")
  COMMITTEE_MEMBERS @map("committeeMembers")

  @@map("participant_type")
}

enum ParticipantStatus {
  INVITED     @map("invited")
  CONFIRMED   @map("confirmed")
  DECLINED    @map("declined")
  TENTATIVE   @map("tentative")
  ATTENDED    @map("attended")
  ABSENT      @map("absent")
  REPRESENTED @map("represented")
  ARCHIVED    @map("archived")

  @@map("participant_status")
}

enum ParticipantResponse {
  PENDING   @map("pending")
  CONFIRMED @map("confirmed")
  DECLINED  @map("declined")
  TENTATIVE @map("tentative")

  @@map("participant_response")
}

enum AttendanceStatus {
  PRESENT     @map("present")
  ABSENT      @map("absent")
  LATE        @map("late")
  LEFT_EARLY  @map("leftEarly")
  REPRESENTED @map("represented")
  EXCUSED     @map("excused")
  CANCELLED   @map("cancelled")
  ARCHIVED    @map("archived")

  @@map("attendance_status")
}

enum AttendanceRegistrationMethod {
  ADMIN  @map("admin")
  SELF   @map("self")
  QR     @map("qr")
  IMPORT @map("import")
  SYSTEM @map("system")
  OTHER  @map("other")

  @@map("attendance_registration_method")
}

enum ProxyStatus {
  SUBMITTED @map("submitted")
  APPROVED  @map("approved")
  REJECTED  @map("rejected")
  CANCELLED @map("cancelled")
  ARCHIVED  @map("archived")

  @@map("proxy_status")
}

enum QuorumRuleType {
  NONE                               @map("none")
  PARTICIPANT_COUNT                  @map("participantCount")
  PROPERTY_UNIT_COUNT                @map("propertyUnitCount")
  PERCENTAGE_OF_EXPECTED_PARTICIPANTS @map("percentageOfExpectedParticipants")
  PERCENTAGE_OF_PROPERTY_UNITS       @map("percentageOfPropertyUnits")
  CUSTOM                             @map("custom")

  @@map("quorum_rule_type")
}

enum MinutesStatus {
  NOT_STARTED @map("notStarted")
  DRAFT       @map("draft")
  UNDER_REVIEW @map("underReview")
  APPROVED    @map("approved")
  PUBLISHED   @map("published")
  ARCHIVED    @map("archived")

  @@map("minutes_status")
}

enum ResolutionType {
  INFORMATIONAL  @map("informational")
  ADMINISTRATIVE @map("administrative")
  FINANCIAL      @map("financial")
  MAINTENANCE    @map("maintenance")
  SECURITY       @map("security")
  FINE           @map("fine")
  RESERVATION    @map("reservation")
  OTHER          @map("other")

  @@map("resolution_type")
}

enum ResolutionStatus {
  DRAFT     @map("draft")
  RECORDED  @map("recorded")
  APPROVED  @map("approved")
  CANCELLED @map("cancelled")
  ARCHIVED  @map("archived")

  @@map("resolution_status")
}
```

---

## 14.2. Modelo `Meeting`

```prisma id="fkwp7j"
model Meeting {
  id                     String           @id @default(uuid())
  tenantId               String           @map("tenant_id")

  title                  String
  description            String?

  meetingType            MeetingType      @map("meeting_type")
  modality               MeetingModality
  location               String?
  virtualMeetingUrl      String?          @map("virtual_meeting_url")

  status                 MeetingStatus    @default(DRAFT)
  visibility             MeetingVisibility @default(ADMINISTRATIVE)

  startsAt               DateTime         @map("starts_at")
  endsAt                 DateTime?        @map("ends_at")
  timezone               String           @default("America/Guayaquil")

  calledAt               DateTime?        @map("called_at")
  calledBy               String?          @map("called_by")

  createdBy              String?          @map("created_by")
  updatedBy              String?          @map("updated_by")
  cancelledBy            String?          @map("cancelled_by")
  closedBy               String?          @map("closed_by")
  archivedBy             String?          @map("archived_by")

  cancellationReason     String?          @map("cancellation_reason")

  quorumRuleType         QuorumRuleType   @default(NONE) @map("quorum_rule_type")
  quorumRequiredValue    Decimal?         @db.Decimal(12, 2) @map("quorum_required_value")
  quorumCalculatedValue  Decimal?         @db.Decimal(12, 2) @map("quorum_calculated_value")
  quorumMet              Boolean?         @map("quorum_met")
  quorumCalculatedAt     DateTime?        @map("quorum_calculated_at")

  attendanceClosedAt     DateTime?        @map("attendance_closed_at")
  minutesStatus          MinutesStatus    @default(NOT_STARTED) @map("minutes_status")

  metadata               Json?

  createdAt              DateTime         @default(now()) @map("created_at")
  updatedAt              DateTime         @updatedAt @map("updated_at")
  archivedAt             DateTime?        @map("archived_at")

  tenant                 Tenant           @relation(fields: [tenantId], references: [id], onDelete: Restrict)

  calledByUser           UserProfile?     @relation("MeetingCalledBy", fields: [calledBy], references: [id], onDelete: Restrict)
  createdByUser          UserProfile?     @relation("MeetingCreatedBy", fields: [createdBy], references: [id], onDelete: Restrict)
  updatedByUser          UserProfile?     @relation("MeetingUpdatedBy", fields: [updatedBy], references: [id], onDelete: Restrict)
  cancelledByUser        UserProfile?     @relation("MeetingCancelledBy", fields: [cancelledBy], references: [id], onDelete: Restrict)
  closedByUser           UserProfile?     @relation("MeetingClosedBy", fields: [closedBy], references: [id], onDelete: Restrict)
  archivedByUser         UserProfile?     @relation("MeetingArchivedBy", fields: [archivedBy], references: [id], onDelete: Restrict)

  agendaItems            MeetingAgendaItem[]
  participants           MeetingParticipant[]
  attendanceRecords      MeetingAttendance[]
  proxies                MeetingProxy[]
  minutes                MeetingMinutes?
  resolutions            MeetingResolution[]

  @@index([tenantId])
  @@index([tenantId, status])
  @@index([tenantId, meetingType])
  @@index([tenantId, modality])
  @@index([tenantId, visibility])
  @@index([tenantId, startsAt])
  @@index([tenantId, archivedAt])
  @@index([createdBy])
  @@index([calledBy])
  @@map("meetings")
}
```

---

## 14.3. Modelo `MeetingAgendaItem`

```prisma id="gcqsj5"
model MeetingAgendaItem {
  id               String           @id @default(uuid())
  tenantId         String           @map("tenant_id")
  meetingId        String           @map("meeting_id")

  order            Int
  title            String
  description      String?
  presenterUserId  String?          @map("presenter_user_id")
  estimatedMinutes Int?             @map("estimated_minutes")
  status           AgendaItemStatus @default(PENDING)
  notes            String?

  createdAt        DateTime         @default(now()) @map("created_at")
  updatedAt        DateTime         @updatedAt @map("updated_at")
  archivedAt       DateTime?        @map("archived_at")

  tenant           Tenant           @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  meeting          Meeting          @relation(fields: [meetingId], references: [id], onDelete: Restrict)
  presenterUser    UserProfile?     @relation("MeetingAgendaPresenter", fields: [presenterUserId], references: [id], onDelete: Restrict)

  resolutions      MeetingResolution[]

  @@unique([tenantId, meetingId, order])
  @@index([tenantId])
  @@index([tenantId, meetingId])
  @@index([tenantId, status])
  @@index([tenantId, archivedAt])
  @@index([presenterUserId])
  @@map("meeting_agenda_items")
}
```

---

## 14.4. Modelo `MeetingParticipant`

```prisma id="c1kj5x"
model MeetingParticipant {
  id             String              @id @default(uuid())
  tenantId       String              @map("tenant_id")
  meetingId      String              @map("meeting_id")

  participantType ParticipantType    @map("participant_type")

  userId         String?             @map("user_id")
  personId       String?             @map("person_id")
  propertyUnitId String?             @map("property_unit_id")
  roleId         String?             @map("role_id")

  isRequired     Boolean             @default(true) @map("is_required")
  status         ParticipantStatus   @default(INVITED)
  invitedAt      DateTime?           @map("invited_at")
  respondedAt    DateTime?           @map("responded_at")
  response       ParticipantResponse @default(PENDING)

  createdAt      DateTime            @default(now()) @map("created_at")
  archivedAt     DateTime?           @map("archived_at")

  tenant         Tenant              @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  meeting        Meeting             @relation(fields: [meetingId], references: [id], onDelete: Restrict)

  user           UserProfile?        @relation("MeetingParticipantUser", fields: [userId], references: [id], onDelete: Restrict)
  person         Person?             @relation("MeetingParticipantPerson", fields: [personId], references: [id], onDelete: Restrict)
  propertyUnit   PropertyUnit?       @relation("MeetingParticipantPropertyUnit", fields: [propertyUnitId], references: [id], onDelete: Restrict)

  // Ajustar el modelo real de rol según 002-users-roles.
  // role        TenantRole?          @relation(fields: [roleId], references: [id], onDelete: Restrict)

  attendanceRecords MeetingAttendance[]

  @@index([tenantId])
  @@index([tenantId, meetingId])
  @@index([tenantId, participantType])
  @@index([tenantId, userId])
  @@index([tenantId, personId])
  @@index([tenantId, propertyUnitId])
  @@index([tenantId, roleId])
  @@index([tenantId, status])
  @@index([tenantId, archivedAt])
  @@map("meeting_participants")
}
```

---

## 14.5. Modelo `MeetingAttendance`

```prisma id="snkp8y"
model MeetingAttendance {
  id                 String                       @id @default(uuid())
  tenantId           String                       @map("tenant_id")
  meetingId          String                       @map("meeting_id")

  participantId      String?                      @map("participant_id")
  userId             String?                      @map("user_id")
  personId           String?                      @map("person_id")
  propertyUnitId     String?                      @map("property_unit_id")

  attendanceStatus   AttendanceStatus             @map("attendance_status")
  checkInAt          DateTime?                    @map("check_in_at")
  checkOutAt         DateTime?                    @map("check_out_at")

  registeredBy       String?                      @map("registered_by")
  registrationMethod AttendanceRegistrationMethod @default(ADMIN) @map("registration_method")

  notes              String?

  isProxy            Boolean                      @default(false) @map("is_proxy")
  proxyId            String?                      @map("proxy_id")

  createdAt          DateTime                     @default(now()) @map("created_at")
  updatedAt          DateTime                     @updatedAt @map("updated_at")
  archivedAt         DateTime?                    @map("archived_at")

  tenant             Tenant                       @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  meeting            Meeting                      @relation(fields: [meetingId], references: [id], onDelete: Restrict)

  participant        MeetingParticipant?          @relation(fields: [participantId], references: [id], onDelete: Restrict)
  user               UserProfile?                 @relation("MeetingAttendanceUser", fields: [userId], references: [id], onDelete: Restrict)
  person             Person?                      @relation("MeetingAttendancePerson", fields: [personId], references: [id], onDelete: Restrict)
  propertyUnit       PropertyUnit?                @relation("MeetingAttendancePropertyUnit", fields: [propertyUnitId], references: [id], onDelete: Restrict)
  registeredByUser   UserProfile?                 @relation("MeetingAttendanceRegisteredBy", fields: [registeredBy], references: [id], onDelete: Restrict)
  proxy              MeetingProxy?                @relation(fields: [proxyId], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([tenantId, meetingId])
  @@index([tenantId, participantId])
  @@index([tenantId, userId])
  @@index([tenantId, personId])
  @@index([tenantId, propertyUnitId])
  @@index([tenantId, attendanceStatus])
  @@index([tenantId, registrationMethod])
  @@index([tenantId, proxyId])
  @@index([tenantId, archivedAt])
  @@index([registeredBy])
  @@map("meeting_attendance")
}
```

---

## 14.6. Modelo `MeetingProxy`

```prisma id="n0cy15"
model MeetingProxy {
  id                           String       @id @default(uuid())
  tenantId                     String       @map("tenant_id")
  meetingId                    String       @map("meeting_id")

  representedPersonId          String?      @map("represented_person_id")
  representedUserId            String?      @map("represented_user_id")
  representedPropertyUnitId    String?      @map("represented_property_unit_id")

  representativePersonId       String?      @map("representative_person_id")
  representativeUserId         String?      @map("representative_user_id")

  documentReference            String?      @map("document_reference")

  status                       ProxyStatus  @default(SUBMITTED)

  approvedBy                   String?      @map("approved_by")
  approvedAt                   DateTime?    @map("approved_at")

  rejectedBy                   String?      @map("rejected_by")
  rejectedAt                   DateTime?    @map("rejected_at")
  rejectionReason              String?      @map("rejection_reason")

  cancelledBy                  String?      @map("cancelled_by")
  cancelledAt                  DateTime?    @map("cancelled_at")
  cancellationReason           String?      @map("cancellation_reason")

  createdAt                    DateTime     @default(now()) @map("created_at")
  updatedAt                    DateTime     @updatedAt @map("updated_at")
  archivedAt                   DateTime?    @map("archived_at")

  tenant                       Tenant       @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  meeting                      Meeting      @relation(fields: [meetingId], references: [id], onDelete: Restrict)

  representedPerson            Person?      @relation("MeetingProxyRepresentedPerson", fields: [representedPersonId], references: [id], onDelete: Restrict)
  representedUser              UserProfile? @relation("MeetingProxyRepresentedUser", fields: [representedUserId], references: [id], onDelete: Restrict)
  representedPropertyUnit      PropertyUnit? @relation("MeetingProxyRepresentedPropertyUnit", fields: [representedPropertyUnitId], references: [id], onDelete: Restrict)

  representativePerson         Person?      @relation("MeetingProxyRepresentativePerson", fields: [representativePersonId], references: [id], onDelete: Restrict)
  representativeUser           UserProfile? @relation("MeetingProxyRepresentativeUser", fields: [representativeUserId], references: [id], onDelete: Restrict)

  approvedByUser               UserProfile? @relation("MeetingProxyApprovedBy", fields: [approvedBy], references: [id], onDelete: Restrict)
  rejectedByUser               UserProfile? @relation("MeetingProxyRejectedBy", fields: [rejectedBy], references: [id], onDelete: Restrict)
  cancelledByUser              UserProfile? @relation("MeetingProxyCancelledBy", fields: [cancelledBy], references: [id], onDelete: Restrict)

  attendanceRecords            MeetingAttendance[]

  @@index([tenantId])
  @@index([tenantId, meetingId])
  @@index([tenantId, representedPersonId])
  @@index([tenantId, representedUserId])
  @@index([tenantId, representedPropertyUnitId])
  @@index([tenantId, representativePersonId])
  @@index([tenantId, representativeUserId])
  @@index([tenantId, status])
  @@index([tenantId, archivedAt])
  @@map("meeting_proxies")
}
```

---

## 14.7. Modelo `MeetingMinutes`

```prisma id="wst0sh"
model MeetingMinutes {
  id            String        @id @default(uuid())
  tenantId      String        @map("tenant_id")
  meetingId     String        @unique @map("meeting_id")

  title         String
  summary       String?
  body          String

  status        MinutesStatus @default(DRAFT)

  preparedBy    String?       @map("prepared_by")
  reviewedBy    String?       @map("reviewed_by")
  approvedBy    String?       @map("approved_by")
  publishedBy   String?       @map("published_by")

  preparedAt    DateTime?     @map("prepared_at")
  reviewedAt    DateTime?     @map("reviewed_at")
  approvedAt    DateTime?     @map("approved_at")
  publishedAt   DateTime?     @map("published_at")

  createdAt     DateTime      @default(now()) @map("created_at")
  updatedAt     DateTime      @updatedAt @map("updated_at")
  archivedAt    DateTime?     @map("archived_at")

  tenant        Tenant        @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  meeting       Meeting       @relation(fields: [meetingId], references: [id], onDelete: Restrict)

  preparedByUser UserProfile? @relation("MeetingMinutesPreparedBy", fields: [preparedBy], references: [id], onDelete: Restrict)
  reviewedByUser UserProfile? @relation("MeetingMinutesReviewedBy", fields: [reviewedBy], references: [id], onDelete: Restrict)
  approvedByUser UserProfile? @relation("MeetingMinutesApprovedBy", fields: [approvedBy], references: [id], onDelete: Restrict)
  publishedByUser UserProfile? @relation("MeetingMinutesPublishedBy", fields: [publishedBy], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([tenantId, meetingId])
  @@index([tenantId, status])
  @@index([tenantId, publishedAt])
  @@index([tenantId, archivedAt])
  @@map("meeting_minutes")
}
```

Nota:

```text id="ffhl46"
El atributo @unique en meetingId garantiza máximo un acta por reunión. Si se requieren varias versiones de acta en el futuro, se debe reemplazar por versionado explícito en una spec posterior.
```

---

## 14.8. Modelo `MeetingResolution`

```prisma id="woqdoc"
model MeetingResolution {
  id                 String           @id @default(uuid())
  tenantId           String           @map("tenant_id")
  meetingId          String           @map("meeting_id")
  agendaItemId       String?          @map("agenda_item_id")

  title              String
  description        String

  resolutionType     ResolutionType   @map("resolution_type")
  status             ResolutionStatus @default(DRAFT)

  recordedBy         String?          @map("recorded_by")
  approvedBy         String?          @map("approved_by")
  cancelledBy        String?          @map("cancelled_by")

  recordedAt         DateTime?        @map("recorded_at")
  approvedAt         DateTime?        @map("approved_at")
  cancelledAt        DateTime?        @map("cancelled_at")
  cancellationReason String?          @map("cancellation_reason")

  effectiveFrom      DateTime?        @map("effective_from")
  metadata           Json?

  createdAt          DateTime         @default(now()) @map("created_at")
  updatedAt          DateTime         @updatedAt @map("updated_at")
  archivedAt         DateTime?        @map("archived_at")

  tenant             Tenant           @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  meeting            Meeting          @relation(fields: [meetingId], references: [id], onDelete: Restrict)
  agendaItem         MeetingAgendaItem? @relation(fields: [agendaItemId], references: [id], onDelete: Restrict)

  recordedByUser     UserProfile?     @relation("MeetingResolutionRecordedBy", fields: [recordedBy], references: [id], onDelete: Restrict)
  approvedByUser     UserProfile?     @relation("MeetingResolutionApprovedBy", fields: [approvedBy], references: [id], onDelete: Restrict)
  cancelledByUser    UserProfile?     @relation("MeetingResolutionCancelledBy", fields: [cancelledBy], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([tenantId, meetingId])
  @@index([tenantId, agendaItemId])
  @@index([tenantId, resolutionType])
  @@index([tenantId, status])
  @@index([tenantId, recordedAt])
  @@index([tenantId, archivedAt])
  @@map("meeting_resolutions")
}
```

---

## 14.9. Relaciones requeridas en modelos existentes

### Tenant

```prisma id="dz2y0e"
model Tenant {
  // campos existentes...

  meetings              Meeting[]
  meetingAgendaItems    MeetingAgendaItem[]
  meetingParticipants   MeetingParticipant[]
  meetingAttendance     MeetingAttendance[]
  meetingProxies        MeetingProxy[]
  meetingMinutes        MeetingMinutes[]
  meetingResolutions    MeetingResolution[]
}
```

---

### UserProfile

```prisma id="xz0axd"
model UserProfile {
  // campos existentes...

  meetingsCalled        Meeting[] @relation("MeetingCalledBy")
  meetingsCreated       Meeting[] @relation("MeetingCreatedBy")
  meetingsUpdated       Meeting[] @relation("MeetingUpdatedBy")
  meetingsCancelled     Meeting[] @relation("MeetingCancelledBy")
  meetingsClosed        Meeting[] @relation("MeetingClosedBy")
  meetingsArchived      Meeting[] @relation("MeetingArchivedBy")

  meetingAgendaPresented MeetingAgendaItem[] @relation("MeetingAgendaPresenter")
  meetingParticipants    MeetingParticipant[] @relation("MeetingParticipantUser")
  meetingAttendanceAsUser MeetingAttendance[] @relation("MeetingAttendanceUser")
  meetingAttendanceRegistered MeetingAttendance[] @relation("MeetingAttendanceRegisteredBy")

  meetingProxiesRepresented    MeetingProxy[] @relation("MeetingProxyRepresentedUser")
  meetingProxiesRepresentative MeetingProxy[] @relation("MeetingProxyRepresentativeUser")
  meetingProxiesApproved       MeetingProxy[] @relation("MeetingProxyApprovedBy")
  meetingProxiesRejected       MeetingProxy[] @relation("MeetingProxyRejectedBy")
  meetingProxiesCancelled      MeetingProxy[] @relation("MeetingProxyCancelledBy")

  meetingMinutesPrepared       MeetingMinutes[] @relation("MeetingMinutesPreparedBy")
  meetingMinutesReviewed       MeetingMinutes[] @relation("MeetingMinutesReviewedBy")
  meetingMinutesApproved       MeetingMinutes[] @relation("MeetingMinutesApprovedBy")
  meetingMinutesPublished      MeetingMinutes[] @relation("MeetingMinutesPublishedBy")

  meetingResolutionsRecorded   MeetingResolution[] @relation("MeetingResolutionRecordedBy")
  meetingResolutionsApproved   MeetingResolution[] @relation("MeetingResolutionApprovedBy")
  meetingResolutionsCancelled  MeetingResolution[] @relation("MeetingResolutionCancelledBy")
}
```

---

### Person

```prisma id="rz8gma"
model Person {
  // campos existentes...

  meetingParticipants             MeetingParticipant[] @relation("MeetingParticipantPerson")
  meetingAttendance               MeetingAttendance[] @relation("MeetingAttendancePerson")

  meetingProxiesAsRepresented     MeetingProxy[] @relation("MeetingProxyRepresentedPerson")
  meetingProxiesAsRepresentative  MeetingProxy[] @relation("MeetingProxyRepresentativePerson")
}
```

---

### PropertyUnit

```prisma id="k0a1h4"
model PropertyUnit {
  // campos existentes...

  meetingParticipants             MeetingParticipant[] @relation("MeetingParticipantPropertyUnit")
  meetingAttendance               MeetingAttendance[] @relation("MeetingAttendancePropertyUnit")
  meetingProxiesRepresented       MeetingProxy[] @relation("MeetingProxyRepresentedPropertyUnit")
}
```

---

### Role / TenantRole

El modelo exacto debe alinearse con `002-users-roles`.

Relación conceptual:

```prisma id="zx0fzs"
// Ejemplo conceptual. Ajustar al nombre real del modelo de roles por tenant.
model TenantRole {
  // campos existentes...

  meetingParticipants MeetingParticipant[]
}
```

---

# 15. Constraints recomendadas

## 15.1. `meetings`

```text id="dmqs5k"
tenant_id NOT NULL
title NOT NULL
meeting_type NOT NULL
modality NOT NULL
status NOT NULL
visibility NOT NULL
starts_at NOT NULL
timezone NOT NULL
quorum_required_value >= 0 si no es null
quorum_calculated_value >= 0 si no es null
```

Reglas de servicio:

```text id="jbgd5z"
ends_at debe ser posterior a starts_at
virtual_meeting_url solo se permite para virtual/hybrid
location recomendado para inPerson/hybrid
status = cancelled requiere cancellation_reason y cancelled_by
status = called requiere called_at y called_by
status = attendanceClosed requiere attendance_closed_at y closed_by
quorumCalculatedValue/quorumMet solo se actualizan por MeetingQuorumService
```

---

## 15.2. `meeting_agenda_items`

```text id="esn24d"
tenant_id NOT NULL
meeting_id NOT NULL
order NOT NULL
title NOT NULL
status NOT NULL
UNIQUE (tenant_id, meeting_id, order)
estimated_minutes >= 0 si no es null
```

Reglas de servicio:

```text id="zmp8p8"
meeting_id debe pertenecer al mismo tenant
presenter_user_id debe pertenecer al mismo tenant
no editar agenda de reunión archived/cancelled
```

---

## 15.3. `meeting_participants`

```text id="mx43qz"
tenant_id NOT NULL
meeting_id NOT NULL
participant_type NOT NULL
is_required NOT NULL
status NOT NULL
response NOT NULL
```

Reglas de servicio:

```text id="wvs5a9"
participant_type = user requiere user_id
participant_type = person requiere person_id
participant_type = propertyUnit requiere property_unit_id
participant_type = role requiere role_id
participant_type = owners no requiere ID
participant_type = residents no requiere ID
participant_type = allTenantUsers no requiere ID
participant_type = boardMembers se resuelve por política/rol
participant_type = committeeMembers se resuelve por política/rol
todas las referencias deben pertenecer al tenant
```

---

## 15.4. `meeting_attendance`

```text id="fhmcye"
tenant_id NOT NULL
meeting_id NOT NULL
attendance_status NOT NULL
registration_method NOT NULL
```

Reglas de servicio:

```text id="u1eyxw"
debe existir participant_id o user_id o person_id o property_unit_id o proxy_id
participant_id debe pertenecer a la misma reunión y tenant
user_id debe pertenecer al tenant
person_id debe pertenecer al tenant
property_unit_id debe pertenecer al tenant
proxy_id debe pertenecer a la reunión y tenant
check_out_at > check_in_at si ambos existen
attendance_status = represented requiere is_proxy = true
is_proxy = true requiere proxy_id
proxy debe estar approved
no duplicar asistencia activa por mismo sujeto
reunión cancelled/archived no acepta asistencia
asistencia cerrada requiere override para cambios
```

---

## 15.5. `meeting_proxies`

```text id="nmn76k"
tenant_id NOT NULL
meeting_id NOT NULL
status NOT NULL
```

Reglas de servicio:

```text id="cj8idb"
debe existir represented_person_id o represented_user_id o represented_property_unit_id
debe existir representative_person_id o representative_user_id
representado pertenece al tenant
representante pertenece al tenant
status = approved requiere approved_by y approved_at
status = rejected requiere rejected_by, rejected_at y rejection_reason
status = cancelled requiere cancelled_by, cancelled_at y cancellation_reason
document_reference no debe ser URL pública permanente
```

---

## 15.6. `meeting_minutes`

```text id="p8zc8e"
tenant_id NOT NULL
meeting_id NOT NULL
title NOT NULL
body NOT NULL
status NOT NULL
UNIQUE (meeting_id)
```

Reglas de servicio:

```text id="byyc1y"
meeting_id debe pertenecer al mismo tenant
body sanitizado
status = approved requiere approved_by y approved_at
status = published requiere published_by y published_at
acta publicada no es pública; sigue protegida por audiencia/permisos
```

---

## 15.7. `meeting_resolutions`

```text id="q5tv3i"
tenant_id NOT NULL
meeting_id NOT NULL
title NOT NULL
description NOT NULL
resolution_type NOT NULL
status NOT NULL
```

Reglas de servicio:

```text id="m0ex97"
meeting_id debe pertenecer al mismo tenant
agenda_item_id si existe debe pertenecer a la misma reunión y tenant
status = recorded requiere recorded_by y recorded_at
status = approved requiere approved_by y approved_at
status = cancelled requiere cancelled_by, cancelled_at y cancellation_reason
metadata sanitizada
no ejecutar acciones automáticas
no representar votación formal
```

---

# 16. Reglas de multitenancy

Todas las tablas nuevas tienen `tenant_id`.

Regla obligatoria:

```text id="dhzk93"
Toda consulta tenant-scoped debe filtrar por tenant_id.
```

No se acepta:

```text id="ky11s9"
buscar meeting solo por meetingId
buscar agendaItem solo por agendaItemId
buscar participant solo por participantId
buscar attendance solo por attendanceId
buscar proxy solo por proxyId
buscar minutes solo por minutesId
buscar resolution solo por resolutionId
usar userId de otro tenant
usar personId de otro tenant
usar propertyUnitId de otro tenant
usar roleId de otro tenant
aprobar proxy de otro tenant
calcular quórum de reunión de otro tenant
ver acta de otro tenant
ver resolución de otro tenant
```

Patrón requerido:

```typescript id="zvu05x"
await prisma.meeting.findFirst({
  where: {
    id: meetingId,
    tenantId: currentTenant.id,
    archivedAt: null
  }
});
```

Patrón prohibido:

```typescript id="ln3jwf"
await prisma.meeting.findUnique({
  where: { id: meetingId }
});
```

---

# 17. Reglas de acceso propio

## 17.1. Resolución de usuario a recursos

Para endpoints `/me`, el sistema debe resolver:

```text id="utki8l"
actorUserId
  -> UserProfile
  -> Person vinculada
  -> PropertyUnits por ownership/residency/lease activa
  -> Roles en tenant
  -> Meeting audience
```

---

## 17.2. Un usuario puede ver una reunión si cumple al menos una condición

```text id="ohrcci"
meeting.visibility = tenant AND user tiene membership activa
meeting.visibility = owners AND user está vinculado a ownership activo
meeting.visibility = residents AND user está vinculado a residency/lease activa
meeting.visibility = mixed AND existe participant aplicable
participant.userId = actorUserId
participant.personId IN actorPersonIds
participant.propertyUnitId IN actorPropertyUnitIds
participant.roleId IN actorRoleIds
participant.participantType = allTenantUsers
participant.participantType = owners AND actor es owner
participant.participantType = residents AND actor es resident
```

---

## 17.3. Un usuario no debe ver

```text id="kydnv5"
reuniones private administrativas no dirigidas
reuniones de otro tenant
participantes completos
asistencia de otros usuarios
proxies ajenos
actas no publicadas a su audiencia
resoluciones no publicadas/autorizadas
metadata interna
auditoría
```

---

## 17.4. Self check-in

Self check-in solo se permite si:

```text id="zyab0q"
tenant policy lo habilita
meeting.status IN called, inProgress
meeting no tiene attendanceClosedAt
usuario pertenece a la audiencia
usuario representa al sujeto correcto
no existe asistencia activa duplicada
registrationMethod = self
```

MVP recomendado:

```text id="uhh7dy"
Mantener self check-in como opcional y deshabilitado por defecto.
```

---

# 18. Reglas de asistencia

## 18.1. Estados permitidos para registrar asistencia

MVP recomendado:

```text id="o7qgjh"
called
inProgress
```

Opcional:

```text id="ds73op"
scheduled
```

si el tenant permite preregistro.

Prohibido:

```text id="yc60hm"
draft
cancelled
completed
archived
```

Para `attendanceClosed`, solo override.

---

## 18.2. Duplicidad

No se debe duplicar asistencia activa para el mismo sujeto.

Sujeto lógico de asistencia puede ser:

```text id="uxfopq"
participantId
userId
personId
propertyUnitId
proxyId
```

Regla de servicio:

```text id="j54pse"
Solo puede existir una asistencia activa por reunión y sujeto lógico.
```

---

## 18.3. Representación

Si la asistencia es representada:

```text id="tow3rc"
attendanceStatus = represented
isProxy = true
proxyId requerido
proxy.status = approved
proxy.tenantId = attendance.tenantId
proxy.meetingId = attendance.meetingId
```

---

## 18.4. Check-out

`checkOutAt` solo se permite si:

```text id="l1imsj"
attendanceStatus IN present, late
checkOutAt > checkInAt
meeting no está archived/cancelled
```

Al registrar salida anticipada:

```text id="b7d95t"
attendanceStatus = leftEarly
```

---

## 18.5. Excusa

`excused` se permite desde:

```text id="b2x1kq"
absent
present según política excepcional
late según política excepcional
```

MVP recomendado:

```text id="d5n04s"
absent -> excused
```

---

## 18.6. Attendance closed

Cuando la reunión tiene `attendanceClosedAt != null`:

* no se puede crear asistencia ordinaria;
* no se puede modificar asistencia ordinaria;
* no se puede borrar asistencia;
* cambios requieren `meetingAttendance.override`;
* todo override debe auditarse.

---

# 19. Reglas de representación

## 19.1. Representado

Debe existir al menos uno:

```text id="m167kr"
representedPersonId
representedUserId
representedPropertyUnitId
```

---

## 19.2. Representante

Debe existir al menos uno:

```text id="u9lpmt"
representativePersonId
representativeUserId
```

---

## 19.3. Validación tenant

Todas las referencias deben pertenecer al mismo tenant.

---

## 19.4. Estado aprobado

Solo proxies `approved` pueden usarse para asistencia representada.

---

## 19.5. Documento de representación

`documentReference` es opcional en MVP.

Si se usa:

```text id="gsgfb5"
debe ser referencia interna
no URL pública permanente
no token persistido
no credenciales
no archivo inline
```

---

# 20. Reglas de quórum

## 20.1. Fuente de cálculo

El quórum se calcula desde:

```text id="bpvp19"
meeting_participants
meeting_attendance
meeting_proxies
property_units
```

---

## 20.2. Regla `none`

Resultado recomendado:

```text id="poemp0"
quorumMet = null
quorumCalculatedValue = null
```

---

## 20.3. Regla `participantCount`

```text id="j4t8db"
presentParticipantCount >= quorumRequiredValue
```

Incluye estados:

```text id="mb3yui"
present
late
represented
```

Puede excluir:

```text id="dxg5ki"
absent
excused
cancelled
archived
```

---

## 20.4. Regla `propertyUnitCount`

```text id="g4vxxx"
presentOrRepresentedPropertyUnitCount >= quorumRequiredValue
```

---

## 20.5. Regla `percentageOfExpectedParticipants`

```text id="rwxom1"
quorumCalculatedValue = presentParticipantCount / expectedParticipantCount * 100
quorumMet = quorumCalculatedValue >= quorumRequiredValue
```

Reglas:

* `expectedParticipantCount` no debe ser cero;
* si es cero, devolver error o `quorumMet = false` según política;
* MVP recomienda error `MEETING_QUORUM_NO_EXPECTED_PARTICIPANTS`.

---

## 20.6. Regla `percentageOfPropertyUnits`

```text id="ysfybj"
quorumCalculatedValue = presentOrRepresentedPropertyUnitCount / expectedPropertyUnitCount * 100
quorumMet = quorumCalculatedValue >= quorumRequiredValue
```

---

## 20.7. Decimales

* Usar `Decimal(12,2)`.
* No usar `float/double` para persistir porcentajes.
* Exponer porcentajes por API como string decimal.
* Ejemplo: `"52.50"`.

---

## 20.8. Custom

`custom` queda diferido.

Si se recibe en MVP:

```text id="qaxqmb"
422 MEETING_QUORUM_RULE_UNSUPPORTED
```

o se permite solo como placeholder sin cálculo.

---

# 21. Reglas de actas

## 21.1. Acta única activa por reunión

MVP:

```text id="vc0ppf"
Una reunión tiene máximo un MeetingMinutes activo.
```

Futuro:

```text id="hib6fw"
versionado de actas
documentos adjuntos
PDF formal
firmas
historial de cambios
```

---

## 21.2. Estados

```text id="gffdbs"
notStarted
draft
underReview
approved
published
archived
```

---

## 21.3. Contenido

Campos con sanitización obligatoria:

```text id="gpxzfn"
title
summary
body
```

Bloquear:

```text id="vqjnmu"
<script>
<iframe>
<object>
<embed>
event handlers inline
javascript:
data URLs peligrosas
HTML no sanitizado
```

---

## 21.4. Publicación

Acta publicada:

* no es pública en WordPress;
* requiere autenticación;
* requiere acceso a reunión;
* requiere audiencia autorizada;
* puede emitir evento `meeting.minutesPublished`.

---

# 22. Reglas de resoluciones

## 22.1. Resolución básica

Una resolución registra una decisión o acuerdo básico.

No representa:

```text id="nt9ikj"
votación formal
mayoría legal
firma electrónica
ejecución automática
obligación financiera automática
multa automática
```

---

## 22.2. Agenda opcional

Una resolución puede asociarse a un `agendaItemId`.

Si existe:

```text id="v65lbm"
agendaItem.meetingId = resolution.meetingId
agendaItem.tenantId = resolution.tenantId
```

---

## 22.3. Estados

```text id="bs1hop"
draft
recorded
approved
cancelled
archived
```

---

## 22.4. Metadata

Permitido:

```text id="aat05x"
source
notes
safe flags
traceId
```

Prohibido:

```text id="ebv8bd"
payload completo
datos personales innecesarios
tokens
secretos
documentos completos
votos formales
firmas
```

---

# 23. DTOs derivados del modelo

## 23.1. MeetingAdminDto

```text id="gl7zf8"
id
title
description
meetingType
modality
location
virtualMeetingUrl
status
visibility
startsAt
endsAt
timezone
calledAt
quorumRuleType
quorumRequiredValue
quorumCalculatedValue
quorumMet
quorumCalculatedAt
attendanceClosedAt
minutesStatus
createdAt
updatedAt
archivedAt
```

---

## 23.2. MeetingListItemDto

```text id="ztr0yp"
id
title
meetingType
modality
status
visibility
startsAt
endsAt
timezone
quorumMet
minutesStatus
updatedAt
```

---

## 23.3. OwnMeetingDto

```text id="l66z9r"
id
title
meetingType
modality
location
virtualMeetingUrl si permitido
status
visibility
startsAt
endsAt
timezone
myAttendanceStatus
minutesAvailable
resolutionsAvailable
```

No incluye:

```text id="sio1mo"
participantes completos
asistencia de terceros
metadata interna
auditoría
createdBy
updatedBy
closedBy
archivedBy
```

---

## 23.4. MeetingAgendaItemDto

```text id="v0isxv"
id
meetingId
order
title
description
presenterUserId
estimatedMinutes
status
notes
createdAt
updatedAt
```

---

## 23.5. OwnMeetingAgendaItemDto

```text id="p8hflk"
id
order
title
description
estimatedMinutes
status
```

No incluye notas internas si la política las marca privadas.

---

## 23.6. MeetingParticipantDto

```text id="xenjbu"
id
meetingId
participantType
userId
personId
propertyUnitId
roleId
isRequired
status
invitedAt
respondedAt
response
createdAt
```

Solo administrativo.

---

## 23.7. MeetingAttendanceDto

```text id="ei1v8x"
id
meetingId
participantId
userId
personId
propertyUnitId
attendanceStatus
checkInAt
checkOutAt
registeredBy
registrationMethod
notes
isProxy
proxyId
createdAt
updatedAt
```

Solo administrativo o con permiso explícito.

---

## 23.8. OwnMeetingAttendanceDto

```text id="a06q7z"
id
meetingId
propertyUnitId
attendanceStatus
checkInAt
checkOutAt
registrationMethod
isProxy
createdAt
updatedAt
```

No incluye:

```text id="lpnopo"
asistencia de otros usuarios
notas administrativas
registeredBy
personas ajenas
metadata interna
```

---

## 23.9. MeetingProxyDto

```text id="dq313w"
id
meetingId
representedPersonId
representedUserId
representedPropertyUnitId
representativePersonId
representativeUserId
documentReference
status
approvedBy
approvedAt
rejectedBy
rejectedAt
rejectionReason
createdAt
updatedAt
```

---

## 23.10. OwnMeetingProxyDto

```text id="pvn5lj"
id
meetingId
representedPropertyUnitId
status
approvedAt
rejectedAt
rejectionReason
createdAt
updatedAt
```

No incluye datos de terceros no necesarios.

---

## 23.11. MeetingMinutesDto

```text id="wuoz3o"
id
meetingId
title
summary
body
status
preparedBy
reviewedBy
approvedBy
publishedBy
preparedAt
reviewedAt
approvedAt
publishedAt
createdAt
updatedAt
```

---

## 23.12. OwnMeetingMinutesDto

```text id="c789ip"
id
meetingId
title
summary
body
status
publishedAt
```

Solo si el usuario está autorizado.

---

## 23.13. MeetingResolutionDto

```text id="v4qz6g"
id
meetingId
agendaItemId
title
description
resolutionType
status
recordedBy
approvedBy
recordedAt
approvedAt
effectiveFrom
createdAt
updatedAt
```

---

## 23.14. OwnMeetingResolutionDto

```text id="nwepn2"
id
meetingId
agendaItemId
title
description
resolutionType
status
effectiveFrom
```

Solo si el usuario está autorizado.

---

# 24. Reglas de consulta

## 24.1. Filtros de reuniones administrativas

```text id="pk0el1"
meetingType
modality
status
visibility
startsFrom
startsTo
calledFrom
calledTo
quorumMet
minutesStatus
q
page
pageSize
sortBy
sortOrder
```

Sort permitido:

```text id="tz4zjn"
startsAt
createdAt
updatedAt
title
status
meetingType
modality
```

---

## 24.2. Filtros de reuniones propias

```text id="bdbocy"
meetingType
modality
status
startsFrom
startsTo
upcomingOnly
page
pageSize
sortBy
sortOrder
```

---

## 24.3. Filtros de agenda

```text id="te6cbw"
status
page
pageSize
sortBy
sortOrder
```

Sort permitido:

```text id="bwgowv"
order
status
createdAt
updatedAt
```

---

## 24.4. Filtros de participantes

```text id="a3yw63"
participantType
status
response
isRequired
page
pageSize
```

---

## 24.5. Filtros de asistencia

```text id="l756su"
attendanceStatus
registrationMethod
propertyUnitId
personId
userId
isProxy
checkInFrom
checkInTo
page
pageSize
```

---

## 24.6. Filtros de proxies

```text id="drkh05"
status
representedPropertyUnitId
representativeUserId
page
pageSize
```

---

## 24.7. Filtros de resoluciones

```text id="n6wz74"
resolutionType
status
agendaItemId
recordedFrom
recordedTo
page
pageSize
```

---

# 25. Queries conceptuales

## 25.1. Listar reuniones administrativas

```sql id="m6may2"
SELECT
  id,
  title,
  meeting_type,
  modality,
  status,
  visibility,
  starts_at,
  ends_at,
  quorum_met,
  minutes_status,
  updated_at
FROM meetings
WHERE tenant_id = $1
  AND archived_at IS NULL
ORDER BY starts_at DESC
LIMIT $2 OFFSET $3;
```

---

## 25.2. Obtener reunión por tenant

```sql id="pfz84t"
SELECT *
FROM meetings
WHERE tenant_id = $1
  AND id = $2
  AND archived_at IS NULL
LIMIT 1;
```

---

## 25.3. Listar reuniones propias por audiencia directa

Consulta conceptual simplificada:

```sql id="lf1b9m"
SELECT DISTINCT m.*
FROM meetings m
LEFT JOIN meeting_participants mp
  ON mp.meeting_id = m.id
  AND mp.tenant_id = m.tenant_id
  AND mp.archived_at IS NULL
WHERE m.tenant_id = $1
  AND m.archived_at IS NULL
  AND m.status IN ('scheduled', 'called', 'inProgress', 'attendanceClosed', 'completed')
  AND (
    m.visibility = 'tenant'
    OR mp.user_id = $2
    OR mp.person_id = ANY($3)
    OR mp.property_unit_id = ANY($4)
    OR mp.role_id = ANY($5)
    OR mp.participant_type = 'allTenantUsers'
    OR (mp.participant_type = 'owners' AND $6 = true)
    OR (mp.participant_type = 'residents' AND $7 = true)
  )
ORDER BY m.starts_at DESC
LIMIT $8 OFFSET $9;
```

Parámetros:

```text id="yq4ybz"
$1 = tenantId
$2 = actorUserId
$3 = actorPersonIds
$4 = actorPropertyUnitIds
$5 = actorRoleIds
$6 = actorIsOwner
$7 = actorIsResident
```

La implementación real debe resolver la audiencia mediante puertos de `002-users-roles` y `003-residents-properties`.

---

## 25.4. Registrar asistencia

```sql id="ma7k5d"
INSERT INTO meeting_attendance (
  id,
  tenant_id,
  meeting_id,
  participant_id,
  user_id,
  person_id,
  property_unit_id,
  attendance_status,
  check_in_at,
  registered_by,
  registration_method,
  is_proxy,
  proxy_id,
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
);
```

La validación de duplicidad debe ejecutarse antes o mediante índices parciales raw según política.

---

## 25.5. Calcular participantes presentes

```sql id="d4f831"
SELECT COUNT(*)
FROM meeting_attendance
WHERE tenant_id = $1
  AND meeting_id = $2
  AND archived_at IS NULL
  AND attendance_status IN ('present', 'late', 'represented');
```

---

## 25.6. Calcular unidades presentes o representadas

```sql id="rdm31x"
SELECT COUNT(DISTINCT property_unit_id)
FROM meeting_attendance
WHERE tenant_id = $1
  AND meeting_id = $2
  AND archived_at IS NULL
  AND property_unit_id IS NOT NULL
  AND attendance_status IN ('present', 'late', 'represented');
```

---

## 25.7. Obtener acta publicada para usuario autorizado

```sql id="gftz72"
SELECT mm.*
FROM meeting_minutes mm
JOIN meetings m
  ON m.id = mm.meeting_id
  AND m.tenant_id = mm.tenant_id
WHERE mm.tenant_id = $1
  AND mm.meeting_id = $2
  AND mm.status = 'published'
  AND mm.archived_at IS NULL
  AND m.archived_at IS NULL
LIMIT 1;
```

El acceso de audiencia se valida en servicio.

---

# 26. Índices recomendados

## 26.1. `meetings`

```text id="ib8krb"
tenant_id
tenant_id + status
tenant_id + meeting_type
tenant_id + modality
tenant_id + visibility
tenant_id + starts_at
tenant_id + quorum_met
tenant_id + minutes_status
tenant_id + archived_at
created_by
called_by
```

---

## 26.2. `meeting_agenda_items`

```text id="ecxiui"
tenant_id
tenant_id + meeting_id
tenant_id + meeting_id + order unique
tenant_id + status
tenant_id + archived_at
presenter_user_id
```

---

## 26.3. `meeting_participants`

```text id="mxhf0q"
tenant_id
tenant_id + meeting_id
tenant_id + participant_type
tenant_id + user_id
tenant_id + person_id
tenant_id + property_unit_id
tenant_id + role_id
tenant_id + status
tenant_id + response
tenant_id + archived_at
```

---

## 26.4. `meeting_attendance`

```text id="vxdl4m"
tenant_id
tenant_id + meeting_id
tenant_id + participant_id
tenant_id + user_id
tenant_id + person_id
tenant_id + property_unit_id
tenant_id + attendance_status
tenant_id + registration_method
tenant_id + proxy_id
tenant_id + archived_at
registered_by
```

---

## 26.5. `meeting_proxies`

```text id="ad97d0"
tenant_id
tenant_id + meeting_id
tenant_id + represented_person_id
tenant_id + represented_user_id
tenant_id + represented_property_unit_id
tenant_id + representative_person_id
tenant_id + representative_user_id
tenant_id + status
tenant_id + archived_at
```

---

## 26.6. `meeting_minutes`

```text id="f454db"
tenant_id
tenant_id + meeting_id
tenant_id + status
tenant_id + published_at
tenant_id + archived_at
```

---

## 26.7. `meeting_resolutions`

```text id="wlz7l4"
tenant_id
tenant_id + meeting_id
tenant_id + agenda_item_id
tenant_id + resolution_type
tenant_id + status
tenant_id + recorded_at
tenant_id + archived_at
```

---

# 27. Índices parciales raw recomendados

## 27.1. Asistencia única por participante

```sql id="lqf43z"
CREATE UNIQUE INDEX meeting_attendance_one_active_per_participant
ON meeting_attendance(tenant_id, meeting_id, participant_id)
WHERE participant_id IS NOT NULL
  AND archived_at IS NULL
  AND attendance_status NOT IN ('cancelled', 'archived');
```

---

## 27.2. Asistencia única por usuario

```sql id="cwr2bw"
CREATE UNIQUE INDEX meeting_attendance_one_active_per_user
ON meeting_attendance(tenant_id, meeting_id, user_id)
WHERE user_id IS NOT NULL
  AND archived_at IS NULL
  AND attendance_status NOT IN ('cancelled', 'archived');
```

---

## 27.3. Asistencia única por persona

```sql id="pprxz3"
CREATE UNIQUE INDEX meeting_attendance_one_active_per_person
ON meeting_attendance(tenant_id, meeting_id, person_id)
WHERE person_id IS NOT NULL
  AND archived_at IS NULL
  AND attendance_status NOT IN ('cancelled', 'archived');
```

---

## 27.4. Asistencia única por unidad

```sql id="xq9e4d"
CREATE UNIQUE INDEX meeting_attendance_one_active_per_property_unit
ON meeting_attendance(tenant_id, meeting_id, property_unit_id)
WHERE property_unit_id IS NOT NULL
  AND archived_at IS NULL
  AND attendance_status NOT IN ('cancelled', 'archived');
```

---

## 27.5. Asistencia única por proxy

```sql id="dtcloo"
CREATE UNIQUE INDEX meeting_attendance_one_active_per_proxy
ON meeting_attendance(tenant_id, meeting_id, proxy_id)
WHERE proxy_id IS NOT NULL
  AND archived_at IS NULL
  AND attendance_status NOT IN ('cancelled', 'archived');
```

---

## 27.6. Proxy aprobado único por representado y reunión

Opcional para MVP:

```sql id="wfllju"
CREATE UNIQUE INDEX meeting_proxy_one_approved_per_represented_unit
ON meeting_proxies(tenant_id, meeting_id, represented_property_unit_id)
WHERE represented_property_unit_id IS NOT NULL
  AND status = 'approved'
  AND archived_at IS NULL;
```

---

# 28. Soft delete y archivo

No se debe eliminar físicamente:

```text id="s2zxra"
meetings
meeting_agenda_items
meeting_participants
meeting_attendance
meeting_proxies
meeting_minutes
meeting_resolutions
```

Regla:

```text id="i48emw"
archivedAt != null representa archivo lógico.
```

Para entidades con `status`, usar además:

```text id="ud89w4"
status = archived
```

cuando aplique.

Motivos:

* auditoría;
* trazabilidad de reuniones;
* historial de asistencia;
* evidencia de participación;
* futuras votaciones;
* futuras actas formales;
* futuras firmas;
* reportes administrativos.

---

# 29. Reglas de seguridad de metadata

No guardar en `metadata`:

```text id="wx0zzs"
passwords
tokens
api keys
client secrets
cookies
authorization headers
connection strings
body completo de actas privadas
documentos completos
poderes completos
emails completos
teléfonos completos
cédulas
datos personales innecesarios
stack traces
provider payloads
```

Permitido en `metadata`:

```text id="k7ncic"
traceId
correlationId
safe flags
safe sourceType
safe sourceId
safe status
safe quorum metadata
safe resolution tags
non-sensitive notes
```

---

# 30. Reglas de integración con notificaciones

El módulo `meetings` puede generar eventos para `012-communications-notifications`.

Eventos candidatos:

```text id="kxdb2w"
meeting.called
meeting.updated
meeting.cancelled
meeting.minutesPublished
meeting.reminderRequested
```

Payload mínimo recomendado:

```json id="gduhw8"
{
  "tenantId": "tenant_uuid",
  "sourceType": "meeting",
  "sourceId": "meeting_uuid",
  "eventType": "meeting.called",
  "title": "Asamblea ordinaria 2026",
  "startsAt": "2026-08-15T14:00:00Z",
  "audience": {
    "type": "owners"
  },
  "actionUrl": "/meetings/meeting_uuid",
  "traceId": "req_123456"
}
```

No incluir:

```text id="nnbf1d"
lista completa de participantes
acta completa
asistencia completa
datos personales innecesarios
tokens
secretos
emails completos
teléfonos completos
```

---

# 31. Reglas de auditoría desde modelo

Eventos mínimos:

```text id="bfd8ih"
meeting.created
meeting.updated
meeting.scheduled
meeting.called
meeting.started
meeting.cancelled
meeting.attendanceClosed
meeting.completed
meeting.archived
meeting.quorumCalculated
meetingAgenda.created
meetingAgenda.updated
meetingAgenda.reordered
meetingAgenda.completed
meetingAgenda.skipped
meetingAgenda.archived
meetingParticipant.added
meetingParticipant.updated
meetingParticipant.archived
meetingAttendance.registered
meetingAttendance.updated
meetingAttendance.checkedOut
meetingAttendance.excused
meetingAttendance.archived
meetingProxy.created
meetingProxy.approved
meetingProxy.rejected
meetingProxy.cancelled
meetingProxy.archived
meetingMinutes.created
meetingMinutes.updated
meetingMinutes.submittedReview
meetingMinutes.approved
meetingMinutes.published
meetingMinutes.archived
meetingResolution.recorded
meetingResolution.updated
meetingResolution.approved
meetingResolution.cancelled
meetingResolution.archived
```

Metadata permitida:

```text id="a6d07x"
meetingId
agendaItemId
participantId
attendanceId
proxyId
minutesId
resolutionId
meetingType
meetingStatus
attendanceStatus
fromStatus
toStatus
propertyUnitId
personId
userId
quorumRuleType
quorumMet
traceId
```

Metadata prohibida:

```text id="o4ty9w"
payload completo
body completo del acta
emails completos
teléfonos completos
tokens
secretos
cookies
Authorization header
documentos completos
poderes completos
datos personales innecesarios
stack trace
```

---

# 32. Migración

Nombre sugerido:

```text id="d079fl"
013_create_meetings_attendance
```

Pasos:

```text id="usjz6g"
1. Crear enums.
2. Crear meetings.
3. Crear meeting_agenda_items.
4. Crear meeting_participants.
5. Crear meeting_attendance.
6. Crear meeting_proxies.
7. Crear meeting_minutes.
8. Crear meeting_resolutions.
9. Crear índices básicos.
10. Crear constraints básicos.
11. Crear índices parciales raw si aplica.
12. Agregar relaciones Prisma.
13. Generar Prisma Client.
14. Ejecutar migración en DB test.
15. Ejecutar seeds demo.
16. Validar tests de repositorio.
```

---

# 33. Migraciones raw opcionales

## 33.1. Validar fechas de reunión

```sql id="cdo6bo"
ALTER TABLE meetings
ADD CONSTRAINT meetings_ends_after_starts
CHECK (
  ends_at IS NULL
  OR ends_at > starts_at
);
```

---

## 33.2. Validar valores de quórum

```sql id="r6x81i"
ALTER TABLE meetings
ADD CONSTRAINT meetings_quorum_values_non_negative
CHECK (
  (quorum_required_value IS NULL OR quorum_required_value >= 0)
  AND
  (quorum_calculated_value IS NULL OR quorum_calculated_value >= 0)
);
```

---

## 33.3. Validar minutos estimados

```sql id="tkjn1g"
ALTER TABLE meeting_agenda_items
ADD CONSTRAINT meeting_agenda_items_estimated_minutes_non_negative
CHECK (
  estimated_minutes IS NULL
  OR estimated_minutes >= 0
);
```

---

## 33.4. Validar check-out posterior a check-in

```sql id="k3yqwu"
ALTER TABLE meeting_attendance
ADD CONSTRAINT meeting_attendance_checkout_after_checkin
CHECK (
  check_out_at IS NULL
  OR check_in_at IS NULL
  OR check_out_at > check_in_at
);
```

---

## 33.5. Validar asistencia con sujeto

```sql id="dlc8pt"
ALTER TABLE meeting_attendance
ADD CONSTRAINT meeting_attendance_requires_subject
CHECK (
  participant_id IS NOT NULL
  OR user_id IS NOT NULL
  OR person_id IS NOT NULL
  OR property_unit_id IS NOT NULL
  OR proxy_id IS NOT NULL
);
```

---

## 33.6. Validar proxy con representado y representante

```sql id="do4zbp"
ALTER TABLE meeting_proxies
ADD CONSTRAINT meeting_proxies_requires_represented_subject
CHECK (
  represented_person_id IS NOT NULL
  OR represented_user_id IS NOT NULL
  OR represented_property_unit_id IS NOT NULL
);
```

```sql id="e3c1m4"
ALTER TABLE meeting_proxies
ADD CONSTRAINT meeting_proxies_requires_representative_subject
CHECK (
  representative_person_id IS NOT NULL
  OR representative_user_id IS NOT NULL
);
```

---

# 34. Seeds

## 34.1. Reuniones demo

```text id="e5zzim"
meetingDraftOrdinaryAssemblyA
meetingScheduledOrdinaryAssemblyA
meetingCalledAssemblyA
meetingInProgressBoardMeetingA
meetingAttendanceClosedA
meetingCompletedA
meetingCancelledA
meetingArchivedA
meetingTenantB
```

---

## 34.2. Agenda demo

```text id="igks36"
agendaPreviousMinutesA
agendaFinancialReportA
agendaMaintenancePlanA
agendaSecurityPlanA
agendaVariousA
```

---

## 34.3. Participantes demo

```text id="l1ykjf"
participantOwnersA
participantResidentsA
participantAllTenantUsersA
participantPropertyUnitA101
participantPropertyUnitA102
participantRoleBoardA
participantSpecificUserA
participantTenantB
```

---

## 34.4. Asistencia demo

```text id="j6f7s9"
attendanceOwnerPresentA
attendanceResidentLateA
attendanceUnitA101RepresentedA
attendanceUnitA102AbsentA
attendanceExcusedA
attendanceLeftEarlyA
attendanceTenantB
```

---

## 34.5. Proxies demo

```text id="jk16xh"
proxySubmittedA
proxyApprovedA
proxyRejectedA
proxyCancelledA
proxyTenantB
```

---

## 34.6. Actas demo

```text id="dg3iu2"
minutesDraftA
minutesUnderReviewA
minutesApprovedA
minutesPublishedA
minutesArchivedA
```

---

## 34.7. Resoluciones demo

```text id="u1wj5a"
resolutionMaintenanceRecordedA
resolutionFinancialApprovedA
resolutionSecurityDraftA
resolutionCancelledA
resolutionTenantB
```

---

## 34.8. Datos prohibidos en seeds

```text id="w9l5yp"
nombres reales de residentes
emails reales
teléfonos reales
cédulas reales
direcciones reales
actas reales
poderes reales
documentos reales
firmas reales
tokens
cookies
secretos
datos financieros reales
datos de multas reales
```

---

# 35. Testing del modelo

## 35.1. Unit tests

```text id="p9xkqp"
Meeting entity
MeetingAgendaItem entity
MeetingParticipant entity
MeetingAttendance entity
MeetingProxy entity
MeetingMinutes entity
MeetingResolution entity
MeetingType
MeetingModality
MeetingStatus
MeetingVisibility
AgendaItemStatus
ParticipantType
ParticipantStatus
ParticipantResponse
AttendanceStatus
AttendanceRegistrationMethod
ProxyStatus
QuorumRuleType
MinutesStatus
ResolutionType
ResolutionStatus
MeetingTitle
MeetingContent
QuorumResult
```

---

## 35.2. Repository tests

```text id="y8fktu"
create meeting
find meeting by id and tenant
list meetings by tenant
filter meetings by status/type/modality
update meeting status
archive meeting
create agenda item
reorder agenda
create participants
replace participants
register attendance
prevent duplicate attendance
list attendance
create proxy
approve proxy
create minutes
publish minutes
create resolution
approve resolution
tenant A does not see tenant B records
```

---

## 35.3. Multitenancy tests

```text id="ocuwzs"
tenant A no ve meetings tenant B
tenant A no ve agenda tenant B
tenant A no ve participants tenant B
tenant A no ve attendance tenant B
tenant A no ve proxies tenant B
tenant A no ve minutes tenant B
tenant A no ve resolutions tenant B
tenant A no usa userId tenant B
tenant A no usa personId tenant B
tenant A no usa propertyUnitId tenant B
tenant A no usa roleId tenant B
```

---

## 35.4. Own-resource tests

```text id="jfj0me"
owner ve reunión owners
resident ve reunión residents
usuario ve reunión allTenantUsers
usuario ve reunión por propertyUnit propia
usuario no ve reunión de propertyUnit ajena
usuario no ve asistencia de terceros
usuario no ve acta no publicada
usuario ve acta publicada si pertenece a audiencia
usuario no crea proxy para unidad ajena
```

---

## 35.5. Security tests

```text id="jcwlrx"
no public endpoints for meetings
no public attendance
no public minutes
no public resolutions
no attendance modification after close without override
no proxy cross-tenant
no script in minutes
no script in agenda
no body completo de acta en logs
no personal data in metrics
OpenAPI no documenta rutas públicas de reuniones
```

---

# 36. Decisión final del modelo

El módulo `013-meetings-attendance` usará las siguientes tablas:

```text id="h281qk"
meetings
meeting_agenda_items
meeting_participants
meeting_attendance
meeting_proxies
meeting_minutes
meeting_resolutions
```

El modelo garantiza:

```text id="wsvqd8"
tenant isolation
control de reuniones
agenda básica
participantes esperados
registro de asistencia
prevención de duplicidad
representación básica
quórum simple
actas preliminares
resoluciones básicas
consultas administrativas
consultas propias
privacidad
auditoría
no exposición pública
preparación para votaciones futuras
```

La implementación no debe aceptarse si:

```text id="j6d2oa"
permite reuniones cross-tenant
permite participantes cross-tenant
permite asistencia cross-tenant
permite asistencia duplicada
permite proxy cross-tenant
permite acta pública sin autorización
permite usuario ver reunión ajena
permite usuario ver asistencia de terceros
modifica asistencia cerrada sin override
calcula quórum modificando asistencia
registra resoluciones como votación formal
genera multas automáticas por inasistencia
omite tenant_id
busca recursos solo por id sin tenant_id
expone reuniones en endpoints públicos
```

---

# 37. Pendientes para evolución

Quedan diferidos:

```text id="kwf9ro"
votación electrónica formal
ponderación avanzada de votos
reglas legales avanzadas de mayoría
firma electrónica
actas PDF formales
certificación legal de asistencia
integración con notarías
integración con videoconferencia
grabación
transcripción automática
resumen automático con IA
QR dinámico de asistencia
geolocalización
biometría
validación legal avanzada de poderes
coeficientes de copropiedad
ejecución automática de resoluciones
multas automáticas por inasistencia
chat en vivo
comentarios
preguntas en vivo
moderación avanzada
```

Estos diferidos no bloquean el MVP de `013-meetings-attendance`.
