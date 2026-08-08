# Data Model — Spec 010 Reservations and Common Areas

## 1. Información del documento

| Campo                  | Valor                                                                                                                                                                   |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto               | RESIDENT Core                                                                                                                                                           |
| Spec ID                | 010                                                                                                                                                                     |
| Módulo                 | Reservations and Common Areas                                                                                                                                           |
| Documento              | Data Model                                                                                                                                                              |
| Ruta                   | `docs/specs/010-reservations-common-areas/data-model.md`                                                                                                                |
| Versión                | 0.1                                                                                                                                                                     |
| Estado                 | Borrador inicial                                                                                                                                                        |
| Fecha                  | 2026-07-18                                                                                                                                                              |
| Documento base         | `docs/specs/010-reservations-common-areas/spec.md`                                                                                                                      |
| Plan técnico           | `docs/specs/010-reservations-common-areas/plan.md`                                                                                                                      |
| Depende de             | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements`, `007-audit`, `009-wordpress-integration-basic` |
| Base de datos          | PostgreSQL                                                                                                                                                              |
| ORM                    | Prisma                                                                                                                                                                  |
| Estrategia multitenant | Shared database + shared schema + `tenant_id`                                                                                                                           |
| Naturaleza del módulo  | Transaccional / Tenant-scoped / Auditable                                                                                                                               |
| API Style              | REST                                                                                                                                                                    |

---

## 2. Propósito

Este documento define el modelo de datos del módulo `010-reservations-common-areas`.

El objetivo es modelar áreas comunales, disponibilidad, bloqueos, reservas, historial de estados y relación opcional con cargos financieros, garantizando:

* aislamiento por tenant;
* control de disponibilidad;
* prevención de doble reserva;
* trazabilidad histórica;
* integración financiera sin procesar pagos;
* exposición pública limitada hacia WordPress;
* seguridad de datos personales;
* consistencia transaccional.

Regla central:

```text id="p99sfz"
Toda reserva debe ser tenant-scoped, calendar-aware, conflict-safe, auditable y financieramente integrable sin convertirse en módulo de pagos.
```

---

## 3. Decisión principal del modelo

Para MVP se crearán cinco tablas principales:

```text id="yrf532"
common_areas
common_area_availability_windows
common_area_blackouts
reservations
reservation_status_history
```

Estas tablas permiten cubrir:

* catálogo de áreas comunales;
* configuración de horarios;
* bloqueos administrativos;
* solicitudes y gestión de reservas;
* historial de transiciones;
* relación opcional con cargos financieros;
* consulta administrativa, propia y pública limitada.

---

## 4. Tablas nuevas MVP

```text id="nv2sta"
common_areas
common_area_availability_windows
common_area_blackouts
reservations
reservation_status_history
```

---

## 5. Tablas externas relacionadas

El módulo se relaciona con tablas ya definidas en specs anteriores:

```text id="xz5uaf"
tenants
user_profiles
persons
property_units
charge_concepts
charges
audit_logs
```

Relación con specs:

| Tabla externa     | Spec origen                | Uso en reservas                            |
| ----------------- | -------------------------- | ------------------------------------------ |
| `tenants`         | `001-tenants`              | Tenant propietario de áreas y reservas     |
| `user_profiles`   | `002-users-roles`          | Usuario solicitante, aprobador, cancelador |
| `persons`         | `003-residents-properties` | Persona solicitante vinculada al usuario   |
| `property_units`  | `003-residents-properties` | Unidad habitacional asociada a la reserva  |
| `charge_concepts` | `004-dues-fees`            | Concepto financiero para tarifa de reserva |
| `charges`         | `004-dues-fees`            | Cargo generado por reserva                 |
| `audit_logs`      | `007-audit`                | Auditoría global                           |

---

## 6. Entidad `CommonArea`

### 6.1. Propósito

Representa un área comunal del conjunto residencial.

Puede ser:

* solo informativa;
* reservable;
* visible públicamente;
* sujeta a aprobación;
* sujeta a pago;
* temporalmente inactiva o en mantenimiento.

---

### 6.2. Tabla

```text id="r81wt4"
common_areas
```

---

### 6.3. Campos

```text id="d56ir2"
CommonArea
├── id
├── tenantId
├── code
├── slug
├── name
├── description
├── type
├── capacity
├── locationDescription
├── status
├── isReservable
├── isPublicVisible
├── requiresApproval
├── requiresPayment
├── feeAmount
├── feeCurrency
├── feeChargeConceptId
├── minimumDurationMinutes
├── maximumDurationMinutes
├── reservationAdvanceDays
├── cancellationLimitHours
├── publicRulesSummary
├── internalRules
├── coverImageUrl
├── galleryUrls
├── metadata
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 6.4. Reglas

* `tenantId` obligatorio.
* `code` único por tenant.
* `slug` único por tenant.
* `name` obligatorio.
* `status` obligatorio.
* `capacity` debe ser positivo si existe.
* `isReservable = false` impide nuevas reservas.
* `isPublicVisible = true` permite exposición pública limitada.
* `requiresPayment = true` exige `feeAmount > 0`.
* `requiresPayment = true` exige `feeChargeConceptId`.
* `feeAmount` debe ser Decimal.
* `feeCurrency` por defecto `USD`.
* `internalRules` nunca debe exponerse públicamente.
* `archivedAt` no debe eliminar historial.

---

## 7. Entidad `CommonAreaAvailabilityWindow`

### 7.1. Propósito

Define una ventana recurrente de disponibilidad para un área comunal.

Ejemplo:

```text id="m2hfxp"
Sábados de 08:00 a 18:00
```

---

### 7.2. Tabla

```text id="bb09yo"
common_area_availability_windows
```

---

### 7.3. Campos

```text id="tpaysr"
CommonAreaAvailabilityWindow
├── id
├── tenantId
├── commonAreaId
├── dayOfWeek
├── startTime
├── endTime
├── isActive
├── validFrom
├── validTo
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 7.4. Reglas

* `tenantId` obligatorio.
* `commonAreaId` obligatorio.
* `dayOfWeek` obligatorio.
* `startTime` obligatorio.
* `endTime` obligatorio.
* `startTime < endTime`.
* `isActive = true` habilita la ventana.
* `archivedAt IS NULL` requerido para usar la ventana.
* Si `validFrom` existe, la fecha de reserva debe ser mayor o igual.
* Si `validTo` existe, la fecha de reserva debe ser menor o igual.
* La ventana no bloquea por sí sola; define disponibilidad permitida.

---

## 8. Entidad `CommonAreaBlackout`

### 8.1. Propósito

Representa un bloqueo administrativo que impide reservar un área durante un rango específico.

Ejemplos:

* mantenimiento;
* fumigación;
* evento institucional;
* reparación;
* limpieza profunda;
* restricción temporal.

---

### 8.2. Tabla

```text id="f2jn40"
common_area_blackouts
```

---

### 8.3. Campos

```text id="w8j9iz"
CommonAreaBlackout
├── id
├── tenantId
├── commonAreaId
├── startAt
├── endAt
├── reason
├── status
├── createdBy
├── cancelledBy
├── cancelledAt
├── cancellationReason
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 8.4. Reglas

* `tenantId` obligatorio.
* `commonAreaId` obligatorio.
* `startAt < endAt`.
* `reason` obligatorio.
* Estado `active` bloquea reservas.
* Estado `cancelled` no bloquea reservas.
* Estado `expired` no bloquea nuevas fechas.
* Estado `archived` no bloquea.
* La cancelación debe conservar historial.
* Un blackout no cancela reservas existentes automáticamente.

---

## 9. Entidad `Reservation`

### 9.1. Propósito

Representa la solicitud o asignación de uso de un área comunal en un rango de tiempo.

Puede ser creada por:

* administrador;
* usuario residente autorizado;
* propietario autorizado;
* futuro portal de residentes.

---

### 9.2. Tabla

```text id="y601eb"
reservations
```

---

### 9.3. Campos

```text id="oek6xl"
Reservation
├── id
├── tenantId
├── commonAreaId
├── propertyUnitId
├── requesterUserId
├── requesterPersonId
├── startAt
├── endAt
├── status
├── purpose
├── attendeeCount
├── requiresApproval
├── requiresPayment
├── feeAmount
├── feeCurrency
├── chargeId
├── paymentStatusSnapshot
├── approvedBy
├── approvedAt
├── rejectedBy
├── rejectedAt
├── rejectionReason
├── cancelledBy
├── cancelledAt
├── cancellationReason
├── closedBy
├── closedAt
├── notes
├── metadata
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 9.4. Reglas

* `tenantId` obligatorio.
* `commonAreaId` obligatorio.
* `startAt` obligatorio.
* `endAt` obligatorio.
* `startAt < endAt`.
* `status` obligatorio.
* `propertyUnitId` requerido para reservas propias.
* `requesterUserId` requerido para reservas creadas por usuario.
* `requesterPersonId` recomendado si existe vínculo persona.
* `feeAmount` debe ser Decimal.
* `feeCurrency` por defecto `USD`.
* `chargeId` opcional.
* `chargeId` debe pertenecer al mismo tenant.
* `chargeId` debe pertenecer a la misma unidad.
* La reserva no debe eliminarse físicamente.
* Toda transición relevante debe crear historial y auditoría.

---

## 10. Entidad `ReservationStatusHistory`

### 10.1. Propósito

Mantiene el historial funcional de estados de una reserva.

No reemplaza `audit_logs`; lo complementa.

---

### 10.2. Tabla

```text id="a2m7f2"
reservation_status_history
```

---

### 10.3. Campos

```text id="p1fiap"
ReservationStatusHistory
├── id
├── tenantId
├── reservationId
├── fromStatus
├── toStatus
├── actorUserId
├── reason
├── occurredAt
└── metadata
```

---

### 10.4. Reglas

* `tenantId` obligatorio.
* `reservationId` obligatorio.
* `toStatus` obligatorio.
* `occurredAt` obligatorio.
* `actorUserId` recomendado.
* `reason` obligatorio para rechazo y cancelación administrativa.
* `metadata` debe ser sanitizada.
* No debe contener payload completo.
* No debe contener tokens, secretos ni datos personales innecesarios.

---

## 11. Enums

## 11.1. CommonAreaStatus

```text id="rn2yew"
active
inactive
maintenance
archived
```

### Uso

* `active`: área operativa.
* `inactive`: área temporalmente no disponible.
* `maintenance`: área en mantenimiento.
* `archived`: área histórica.

---

## 11.2. CommonAreaType

```text id="d1s11d"
hall
court
bbq
pool
terrace
park
gym
meetingRoom
other
```

---

## 11.3. DayOfWeek

```text id="cbuhv2"
monday
tuesday
wednesday
thursday
friday
saturday
sunday
```

---

## 11.4. CommonAreaBlackoutStatus

```text id="ix5sln"
active
cancelled
expired
archived
```

---

## 11.5. ReservationStatus

```text id="wxoh4c"
draft
requested
pendingApproval
approved
rejected
cancelled
completed
noShow
expired
archived
```

---

## 11.6. ReservationPaymentStatusSnapshot

```text id="nm7ew5"
notRequired
pendingCharge
chargeGenerated
pendingPayment
paid
partiallyPaid
waived
cancelled
```

Este campo es informativo. La fuente financiera real sigue siendo:

```text id="ncmq6n"
charges
payments
payment_allocations
account_statements
unit_balances
```

---

## 12. Modelo Prisma preliminar

## 12.1. Enums Prisma

```prisma id="nm16se"
enum CommonAreaStatus {
  ACTIVE      @map("active")
  INACTIVE    @map("inactive")
  MAINTENANCE @map("maintenance")
  ARCHIVED    @map("archived")

  @@map("common_area_status")
}

enum CommonAreaType {
  HALL         @map("hall")
  COURT        @map("court")
  BBQ          @map("bbq")
  POOL         @map("pool")
  TERRACE      @map("terrace")
  PARK         @map("park")
  GYM          @map("gym")
  MEETING_ROOM @map("meetingRoom")
  OTHER        @map("other")

  @@map("common_area_type")
}

enum DayOfWeek {
  MONDAY    @map("monday")
  TUESDAY   @map("tuesday")
  WEDNESDAY @map("wednesday")
  THURSDAY  @map("thursday")
  FRIDAY    @map("friday")
  SATURDAY  @map("saturday")
  SUNDAY    @map("sunday")

  @@map("day_of_week")
}

enum CommonAreaBlackoutStatus {
  ACTIVE    @map("active")
  CANCELLED @map("cancelled")
  EXPIRED   @map("expired")
  ARCHIVED  @map("archived")

  @@map("common_area_blackout_status")
}

enum ReservationStatus {
  DRAFT            @map("draft")
  REQUESTED        @map("requested")
  PENDING_APPROVAL @map("pendingApproval")
  APPROVED         @map("approved")
  REJECTED         @map("rejected")
  CANCELLED        @map("cancelled")
  COMPLETED        @map("completed")
  NO_SHOW          @map("noShow")
  EXPIRED          @map("expired")
  ARCHIVED         @map("archived")

  @@map("reservation_status")
}

enum ReservationPaymentStatusSnapshot {
  NOT_REQUIRED     @map("notRequired")
  PENDING_CHARGE   @map("pendingCharge")
  CHARGE_GENERATED @map("chargeGenerated")
  PENDING_PAYMENT  @map("pendingPayment")
  PAID             @map("paid")
  PARTIALLY_PAID   @map("partiallyPaid")
  WAIVED           @map("waived")
  CANCELLED        @map("cancelled")

  @@map("reservation_payment_status_snapshot")
}
```

---

## 12.2. Modelo `CommonArea`

```prisma id="m1taju"
model CommonArea {
  id                       String           @id @default(uuid())
  tenantId                 String           @map("tenant_id")

  code                     String
  slug                     String
  name                     String
  description              String?
  type                     CommonAreaType   @default(OTHER)
  capacity                 Int?             @map("capacity")
  locationDescription      String?          @map("location_description")

  status                   CommonAreaStatus @default(ACTIVE)
  isReservable             Boolean          @default(true) @map("is_reservable")
  isPublicVisible          Boolean          @default(false) @map("is_public_visible")
  requiresApproval         Boolean          @default(true) @map("requires_approval")
  requiresPayment          Boolean          @default(false) @map("requires_payment")

  feeAmount                Decimal?         @map("fee_amount") @db.Decimal(12, 2)
  feeCurrency              String           @default("USD") @map("fee_currency")
  feeChargeConceptId       String?          @map("fee_charge_concept_id")

  minimumDurationMinutes   Int?             @map("minimum_duration_minutes")
  maximumDurationMinutes   Int?             @map("maximum_duration_minutes")
  reservationAdvanceDays   Int?             @map("reservation_advance_days")
  cancellationLimitHours   Int?             @map("cancellation_limit_hours")

  publicRulesSummary       String?          @map("public_rules_summary")
  internalRules            String?          @map("internal_rules")

  coverImageUrl            String?          @map("cover_image_url")
  galleryUrls              Json?            @map("gallery_urls")
  metadata                 Json?

  createdAt                DateTime         @default(now()) @map("created_at")
  updatedAt                DateTime         @updatedAt @map("updated_at")
  archivedAt               DateTime?        @map("archived_at")

  tenant                   Tenant           @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  feeChargeConcept         ChargeConcept?    @relation(fields: [feeChargeConceptId], references: [id], onDelete: Restrict)

  availabilityWindows      CommonAreaAvailabilityWindow[]
  blackouts                CommonAreaBlackout[]
  reservations             Reservation[]

  @@unique([tenantId, code])
  @@unique([tenantId, slug])
  @@index([tenantId])
  @@index([tenantId, status])
  @@index([tenantId, isReservable])
  @@index([tenantId, isPublicVisible])
  @@index([tenantId, type])
  @@index([feeChargeConceptId])
  @@map("common_areas")
}
```

---

## 12.3. Modelo `CommonAreaAvailabilityWindow`

```prisma id="cdxlp3"
model CommonAreaAvailabilityWindow {
  id              String       @id @default(uuid())
  tenantId        String       @map("tenant_id")
  commonAreaId    String       @map("common_area_id")

  dayOfWeek       DayOfWeek    @map("day_of_week")
  startTime       String       @map("start_time")
  endTime         String       @map("end_time")
  isActive        Boolean      @default(true) @map("is_active")

  validFrom       DateTime?    @map("valid_from")
  validTo         DateTime?    @map("valid_to")

  createdAt       DateTime     @default(now()) @map("created_at")
  updatedAt       DateTime     @updatedAt @map("updated_at")
  archivedAt      DateTime?    @map("archived_at")

  tenant          Tenant       @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  commonArea      CommonArea   @relation(fields: [commonAreaId], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([tenantId, commonAreaId])
  @@index([tenantId, commonAreaId, dayOfWeek])
  @@index([tenantId, commonAreaId, isActive])
  @@index([tenantId, commonAreaId, archivedAt])
  @@map("common_area_availability_windows")
}
```

Nota: `startTime` y `endTime` se modelan como string `HH:mm` para simplificar Prisma en MVP. En PostgreSQL puede considerarse `TIME` mediante migración raw si se requiere mayor robustez.

---

## 12.4. Modelo `CommonAreaBlackout`

```prisma id="unqa9v"
model CommonAreaBlackout {
  id                  String                    @id @default(uuid())
  tenantId            String                    @map("tenant_id")
  commonAreaId        String                    @map("common_area_id")

  startAt             DateTime                  @map("start_at")
  endAt               DateTime                  @map("end_at")
  reason              String
  status              CommonAreaBlackoutStatus  @default(ACTIVE)

  createdBy           String?                   @map("created_by")
  cancelledBy         String?                   @map("cancelled_by")
  cancelledAt         DateTime?                 @map("cancelled_at")
  cancellationReason  String?                   @map("cancellation_reason")

  createdAt           DateTime                  @default(now()) @map("created_at")
  updatedAt           DateTime                  @updatedAt @map("updated_at")
  archivedAt          DateTime?                 @map("archived_at")

  tenant              Tenant                    @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  commonArea          CommonArea                @relation(fields: [commonAreaId], references: [id], onDelete: Restrict)
  createdByUser       UserProfile?              @relation("CommonAreaBlackoutCreatedBy", fields: [createdBy], references: [id], onDelete: Restrict)
  cancelledByUser     UserProfile?              @relation("CommonAreaBlackoutCancelledBy", fields: [cancelledBy], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([tenantId, commonAreaId])
  @@index([tenantId, commonAreaId, status])
  @@index([tenantId, commonAreaId, startAt, endAt])
  @@index([createdBy])
  @@index([cancelledBy])
  @@map("common_area_blackouts")
}
```

---

## 12.5. Modelo `Reservation`

```prisma id="pcbvqi"
model Reservation {
  id                     String                           @id @default(uuid())
  tenantId               String                           @map("tenant_id")
  commonAreaId           String                           @map("common_area_id")
  propertyUnitId         String?                          @map("property_unit_id")
  requesterUserId        String?                          @map("requester_user_id")
  requesterPersonId      String?                          @map("requester_person_id")

  startAt                DateTime                         @map("start_at")
  endAt                  DateTime                         @map("end_at")
  status                 ReservationStatus                @default(REQUESTED)

  purpose                String?
  attendeeCount          Int?                             @map("attendee_count")

  requiresApproval       Boolean                          @default(true) @map("requires_approval")
  requiresPayment        Boolean                          @default(false) @map("requires_payment")
  feeAmount              Decimal?                         @map("fee_amount") @db.Decimal(12, 2)
  feeCurrency            String                           @default("USD") @map("fee_currency")

  chargeId               String?                          @unique @map("charge_id")
  paymentStatusSnapshot  ReservationPaymentStatusSnapshot @default(NOT_REQUIRED) @map("payment_status_snapshot")

  approvedBy             String?                          @map("approved_by")
  approvedAt             DateTime?                        @map("approved_at")

  rejectedBy             String?                          @map("rejected_by")
  rejectedAt             DateTime?                        @map("rejected_at")
  rejectionReason        String?                          @map("rejection_reason")

  cancelledBy            String?                          @map("cancelled_by")
  cancelledAt            DateTime?                        @map("cancelled_at")
  cancellationReason     String?                          @map("cancellation_reason")

  closedBy               String?                          @map("closed_by")
  closedAt               DateTime?                        @map("closed_at")

  notes                  String?
  metadata               Json?

  createdAt              DateTime                         @default(now()) @map("created_at")
  updatedAt              DateTime                         @updatedAt @map("updated_at")
  archivedAt             DateTime?                        @map("archived_at")

  tenant                 Tenant                           @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  commonArea             CommonArea                       @relation(fields: [commonAreaId], references: [id], onDelete: Restrict)
  propertyUnit           PropertyUnit?                    @relation(fields: [propertyUnitId], references: [id], onDelete: Restrict)
  requesterUser          UserProfile?                     @relation("ReservationRequesterUser", fields: [requesterUserId], references: [id], onDelete: Restrict)
  requesterPerson        Person?                          @relation("ReservationRequesterPerson", fields: [requesterPersonId], references: [id], onDelete: Restrict)

  approvedByUser         UserProfile?                     @relation("ReservationApprovedBy", fields: [approvedBy], references: [id], onDelete: Restrict)
  rejectedByUser         UserProfile?                     @relation("ReservationRejectedBy", fields: [rejectedBy], references: [id], onDelete: Restrict)
  cancelledByUser        UserProfile?                     @relation("ReservationCancelledBy", fields: [cancelledBy], references: [id], onDelete: Restrict)
  closedByUser           UserProfile?                     @relation("ReservationClosedBy", fields: [closedBy], references: [id], onDelete: Restrict)

  charge                 Charge?                          @relation(fields: [chargeId], references: [id], onDelete: Restrict)

  statusHistory          ReservationStatusHistory[]

  @@index([tenantId])
  @@index([tenantId, commonAreaId])
  @@index([tenantId, propertyUnitId])
  @@index([tenantId, requesterUserId])
  @@index([tenantId, requesterPersonId])
  @@index([tenantId, status])
  @@index([tenantId, startAt])
  @@index([tenantId, endAt])
  @@index([tenantId, commonAreaId, startAt, endAt])
  @@index([tenantId, commonAreaId, status])
  @@index([tenantId, chargeId])
  @@map("reservations")
}
```

---

## 12.6. Modelo `ReservationStatusHistory`

```prisma id="hg60dm"
model ReservationStatusHistory {
  id             String             @id @default(uuid())
  tenantId       String             @map("tenant_id")
  reservationId  String             @map("reservation_id")

  fromStatus     ReservationStatus? @map("from_status")
  toStatus       ReservationStatus  @map("to_status")

  actorUserId    String?            @map("actor_user_id")
  reason         String?
  occurredAt     DateTime           @default(now()) @map("occurred_at")
  metadata       Json?

  tenant         Tenant             @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  reservation    Reservation        @relation(fields: [reservationId], references: [id], onDelete: Restrict)
  actorUser      UserProfile?        @relation("ReservationStatusHistoryActor", fields: [actorUserId], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([tenantId, reservationId])
  @@index([tenantId, actorUserId])
  @@index([tenantId, occurredAt])
  @@map("reservation_status_history")
}
```

---

## 12.7. Relaciones requeridas en modelos existentes

### Tenant

```prisma id="tks8kv"
model Tenant {
  // campos existentes...

  commonAreas                   CommonArea[]
  commonAreaAvailabilityWindows CommonAreaAvailabilityWindow[]
  commonAreaBlackouts           CommonAreaBlackout[]
  reservations                  Reservation[]
  reservationStatusHistory      ReservationStatusHistory[]
}
```

---

### UserProfile

```prisma id="ed4jfl"
model UserProfile {
  // campos existentes...

  reservationsRequested        Reservation[] @relation("ReservationRequesterUser")
  reservationsApproved         Reservation[] @relation("ReservationApprovedBy")
  reservationsRejected         Reservation[] @relation("ReservationRejectedBy")
  reservationsCancelled        Reservation[] @relation("ReservationCancelledBy")
  reservationsClosed           Reservation[] @relation("ReservationClosedBy")
  reservationStatusActions     ReservationStatusHistory[] @relation("ReservationStatusHistoryActor")

  commonAreaBlackoutsCreated   CommonAreaBlackout[] @relation("CommonAreaBlackoutCreatedBy")
  commonAreaBlackoutsCancelled CommonAreaBlackout[] @relation("CommonAreaBlackoutCancelledBy")
}
```

---

### PropertyUnit

```prisma id="j3hb1h"
model PropertyUnit {
  // campos existentes...

  reservations Reservation[]
}
```

---

### Person

```prisma id="t80nce"
model Person {
  // campos existentes...

  reservationsRequested Reservation[] @relation("ReservationRequesterPerson")
}
```

---

### ChargeConcept

```prisma id="ocnl0n"
model ChargeConcept {
  // campos existentes...

  commonAreas CommonArea[]
}
```

---

### Charge

```prisma id="m0les6"
model Charge {
  // campos existentes...

  reservation Reservation?
}
```

---

## 13. Constraints recomendadas

## 13.1. `common_areas`

```text id="rwfepy"
tenant_id NOT NULL
code NOT NULL
slug NOT NULL
name NOT NULL
status NOT NULL
fee_currency NOT NULL
UNIQUE (tenant_id, code)
UNIQUE (tenant_id, slug)
capacity > 0 si no es null
fee_amount >= 0 si no es null
minimum_duration_minutes > 0 si no es null
maximum_duration_minutes > 0 si no es null
reservation_advance_days >= 0 si no es null
cancellation_limit_hours >= 0 si no es null
```

Regla de tarifa:

```text id="rfkhzo"
requires_payment = true implica fee_amount > 0 y fee_charge_concept_id no null
```

Esta regla puede implementarse en servicio y, si es viable, reforzarse con constraint SQL.

---

## 13.2. `common_area_availability_windows`

```text id="ts7ug9"
tenant_id NOT NULL
common_area_id NOT NULL
day_of_week NOT NULL
start_time NOT NULL
end_time NOT NULL
start_time < end_time
```

Si `startTime` y `endTime` se guardan como string `HH:mm`, la validación principal debe vivir en dominio/DTO.

---

## 13.3. `common_area_blackouts`

```text id="oxxqr1"
tenant_id NOT NULL
common_area_id NOT NULL
start_at NOT NULL
end_at NOT NULL
start_at < end_at
reason NOT NULL
status NOT NULL
```

---

## 13.4. `reservations`

```text id="ywv6rn"
tenant_id NOT NULL
common_area_id NOT NULL
start_at NOT NULL
end_at NOT NULL
start_at < end_at
status NOT NULL
fee_currency NOT NULL
fee_amount >= 0 si no es null
charge_id UNIQUE si existe
```

Reglas de servicio:

```text id="lubbd4"
si reserva propia: property_unit_id obligatorio
si requested por usuario: requester_user_id obligatorio
si rejected: rejection_reason obligatorio
si cancelled por admin: cancellation_reason obligatorio
si approved: approved_by y approved_at obligatorios
```

---

## 13.5. `reservation_status_history`

```text id="addvpl"
tenant_id NOT NULL
reservation_id NOT NULL
to_status NOT NULL
occurred_at NOT NULL
```

---

## 14. Estrategia anti-solapamiento

## 14.1. Regla de solapamiento

Dos rangos se solapan si:

```text id="mnh41e"
new.startAt < existing.endAt
AND new.endAt > existing.startAt
```

---

## 14.2. Estados bloqueantes

Reservas con estos estados bloquean disponibilidad:

```text id="eaqsh2"
requested
pendingApproval
approved
```

---

## 14.3. Estados no bloqueantes

```text id="pgd9rr"
rejected
cancelled
completed
noShow
expired
archived
```

---

## 14.4. Estrategia MVP

Para MVP se recomienda:

```text id="zqsxe9"
1. Abrir transacción.
2. Obtener lock lógico del commonAreaId.
3. Validar área activa/reservable.
4. Validar ventanas de disponibilidad.
5. Validar blackouts activos.
6. Validar reservas bloqueantes solapadas.
7. Crear o aprobar reserva.
8. Confirmar transacción.
```

---

## 14.5. Lock recomendado

Opción simple:

```text id="q3t98l"
SELECT pg_advisory_xact_lock(hashtext(common_area_id));
```

Uso:

* dentro de transacción;
* por `commonAreaId`;
* evita dos operaciones simultáneas sobre la misma área;
* no bloquea reservas de otras áreas.

---

## 14.6. Constraint futura recomendada

PostgreSQL puede soportar exclusión por rango:

```sql id="n31szd"
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE reservations
ADD CONSTRAINT reservations_no_overlap_active
EXCLUDE USING gist (
  tenant_id WITH =,
  common_area_id WITH =,
  tstzrange(start_at, end_at, '[)') WITH &&
)
WHERE (
  status IN ('requested', 'pendingApproval', 'approved')
  AND archived_at IS NULL
);
```

Nota:

```text id="xzbuft"
Esta constraint puede diferirse si Prisma/migración raw complica el MVP, pero debe evaluarse para producción.
```

---

## 15. Reglas de disponibilidad

## 15.1. Validación por día

Para validar una reserva:

1. Convertir `startAt` y `endAt` a zona horaria del tenant.
2. Determinar `dayOfWeek`.
3. Buscar ventanas activas para ese día.
4. Verificar que el rango completo esté dentro de una ventana válida.

---

## 15.2. Zona horaria

Almacenamiento:

```text id="bvu6tw"
UTC en base de datos
```

Reglas de negocio:

```text id="n064z1"
zona horaria del tenant
```

Default MVP:

```text id="u03b9y"
America/Guayaquil
```

---

## 15.3. Reservas que cruzan medianoche

MVP recomendado:

```text id="b6rasa"
No permitir reservas que crucen medianoche local.
```

Motivo:

* simplifica ventanas de disponibilidad;
* reduce errores de calendario;
* cubre la mayoría de uso residencial.

Futuro:

```text id="f0yusr"
soporte de reservas multi-día o nocturnas
```

---

## 15.4. Fechas de validez de ventanas

Si `validFrom` o `validTo` existen:

```text id="uv358f"
reservationDate >= validFrom
reservationDate <= validTo
```

---

## 16. Reglas financieras del modelo

## 16.1. Dinero

Campos monetarios:

```text id="z26bql"
common_areas.fee_amount
reservations.fee_amount
```

Reglas:

* usar `Decimal(12,2)`;
* no usar float/double;
* exponer por API como string;
* moneda por defecto `USD`.

---

## 16.2. Snapshot de tarifa

`reservations.feeAmount` guarda la tarifa aplicada al momento de la reserva.

Motivo:

```text id="lqsm59"
Si la tarifa del área cambia después, la reserva mantiene su valor histórico.
```

---

## 16.3. Concepto de cargo

`common_areas.feeChargeConceptId` indica el concepto financiero que se usará al generar cargo.

Reglas:

* debe pertenecer al mismo tenant;
* debe estar activo;
* debe ser válido para cargos de reserva;
* no debe ser null si `requiresPayment = true`.

---

## 16.4. Cargo generado

`reservations.chargeId` apunta al cargo generado.

Reglas:

* opcional;
* único;
* no puede apuntar a cargo de otro tenant;
* no puede apuntar a cargo de otra unidad;
* no puede cambiarse sin auditoría;
* no se elimina aunque la reserva se cancele.

---

## 16.5. Idempotencia de cargo

MVP:

```text id="ojnf6u"
reservation.chargeId UNIQUE
```

Regla de servicio:

```text id="r0eq96"
si reservation.chargeId existe, no generar otro cargo
```

Idempotency key sugerida al llamar módulo financiero:

```text id="ex3w06"
reservation:{reservationId}:charge
```

---

## 16.6. Cancelación con cargo

MVP:

```text id="zzy7rh"
La cancelación de reserva no revierte automáticamente el cargo.
```

La reversión, ajuste o condonación debe realizarse desde módulos financieros.

---

## 17. Reglas de privacidad

## 17.1. Calendario administrativo

Puede incluir:

```text id="xd4k9g"
reservationId
commonAreaId
propertyUnitId
propertyUnitCode
status
startAt
endAt
purpose
attendeeCount
requesterUserId
requesterPersonId limitado según permiso
```

---

## 17.2. Calendario propio

Debe mostrar:

```text id="cm0c4v"
disponibilidad
blackouts genéricos
ocupación de franjas
reservas propias detalladas
reservas de terceros como busy
```

No debe mostrar de terceros:

```text id="mufslk"
nombres
propertyUnitId
propertyUnitCode
purpose
requesterUserId
requesterPersonId
notas
datos financieros
```

---

## 17.3. Catálogo público WordPress

Permitido:

```text id="h6y0yb"
publicId
slug
name
description
type
capacity opcional
coverImageUrl
galleryUrls
publicRulesSummary
```

Prohibido:

```text id="v5x4nm"
reservations
calendar
blackouts internos
availability windows completas
propertyUnitId
requesterUserId
requesterPersonId
chargeId
paymentStatusSnapshot
internalRules
audit data
```

---

## 18. DTOs derivados del modelo

## 18.1. CommonAreaDto

Fuente:

```text id="rde932"
common_areas
```

Campos:

```text id="e7ah0l"
id
code
slug
name
description
type
capacity
locationDescription
status
isReservable
isPublicVisible
requiresApproval
requiresPayment
feeAmount
feeCurrency
minimumDurationMinutes
maximumDurationMinutes
reservationAdvanceDays
cancellationLimitHours
publicRulesSummary
coverImageUrl
galleryUrls
createdAt
updatedAt
```

---

## 18.2. CommonAreaAdminDetailDto

Incluye además:

```text id="j7814j"
internalRules
feeChargeConceptId
metadata sanitizada
archivedAt
```

---

## 18.3. PublicCommonAreaDto

Fuente:

```text id="ad5zs5"
common_areas
```

Campos:

```text id="nfexoi"
id público
slug
name
description
type
capacity
coverImageUrl
galleryUrls
publicRulesSummary
```

No incluye datos financieros internos ni calendario.

---

## 18.4. AvailabilityWindowDto

```text id="b31eql"
id
commonAreaId
dayOfWeek
startTime
endTime
isActive
validFrom
validTo
```

---

## 18.5. BlackoutDto

Administrativo:

```text id="f3tcz3"
id
commonAreaId
startAt
endAt
reason
status
createdBy
cancelledBy
cancelledAt
cancellationReason
```

Vista propia limitada:

```text id="otzp12"
startAt
endAt
status
label = unavailable
```

---

## 18.6. ReservationDto

Administrativo:

```text id="hsy5wz"
id
commonAreaId
commonAreaName
propertyUnitId
propertyUnitCode
requesterUserId
requesterPersonId
startAt
endAt
status
purpose
attendeeCount
requiresApproval
requiresPayment
feeAmount
feeCurrency
chargeId
paymentStatusSnapshot
approvedBy
approvedAt
rejectedBy
rejectedAt
rejectionReason
cancelledBy
cancelledAt
cancellationReason
closedBy
closedAt
notes
createdAt
updatedAt
```

---

## 18.7. OwnReservationDto

```text id="x5n7m9"
id
commonAreaId
commonAreaName
propertyUnitId
propertyUnitCode
startAt
endAt
status
purpose
attendeeCount
requiresApproval
requiresPayment
feeAmount
feeCurrency
paymentStatusSnapshot
createdAt
updatedAt
```

No debe exponer datos de otros solicitantes.

---

## 18.8. CalendarItemDto

Administrativo:

```text id="rhlmp5"
type
id
commonAreaId
startAt
endAt
status
propertyUnitId
propertyUnitCode
label
```

Vista propia:

```text id="i1qv22"
type
startAt
endAt
status
label
isOwn
```

Para reservas de terceros:

```text id="pautsr"
label = busy
isOwn = false
```

---

## 19. Reglas de consulta

## 19.1. Filtros de áreas comunales

```text id="ur5c60"
status
type
isReservable
isPublicVisible
q
page
pageSize
sortBy
sortOrder
```

Sort permitido:

```text id="gys1mw"
code
name
type
status
capacity
createdAt
```

---

## 19.2. Filtros de reservas administrativas

```text id="u804jx"
commonAreaId
propertyUnitId
requesterUserId
status
dateFrom
dateTo
requiresPayment
paymentStatusSnapshot
page
pageSize
sortBy
sortOrder
```

Sort permitido:

```text id="w9gkpx"
startAt
endAt
status
createdAt
commonAreaName
propertyUnitCode
```

---

## 19.3. Filtros de reservas propias

```text id="l42rq4"
propertyUnitId
commonAreaId
status
dateFrom
dateTo
page
pageSize
sortBy
sortOrder
```

Regla:

```text id="yznykv"
propertyUnitId debe pertenecer al usuario autenticado.
```

---

## 19.4. Filtros de calendario

```text id="jdsstp"
dateFrom
dateTo
timezone
includeBlackouts
includeAvailability
```

Reglas:

* `dateFrom <= dateTo`;
* rango máximo MVP: 31 días;
* `commonAreaId` debe pertenecer al tenant;
* calendario propio no expone terceros.

---

## 20. Queries conceptuales

## 20.1. Detectar reservas solapadas

```sql id="lv8tjc"
SELECT id
FROM reservations
WHERE tenant_id = $1
  AND common_area_id = $2
  AND status IN ('requested', 'pendingApproval', 'approved')
  AND archived_at IS NULL
  AND start_at < $4
  AND end_at > $3
LIMIT 1;
```

Parámetros:

```text id="z2j29n"
$1 = tenantId
$2 = commonAreaId
$3 = newStartAt
$4 = newEndAt
```

---

## 20.2. Detectar blackouts solapados

```sql id="q0kxr0"
SELECT id
FROM common_area_blackouts
WHERE tenant_id = $1
  AND common_area_id = $2
  AND status = 'active'
  AND archived_at IS NULL
  AND start_at < $4
  AND end_at > $3
LIMIT 1;
```

---

## 20.3. Listar calendario administrativo

```sql id="l6mxrl"
SELECT
  id,
  common_area_id,
  property_unit_id,
  start_at,
  end_at,
  status
FROM reservations
WHERE tenant_id = $1
  AND common_area_id = $2
  AND archived_at IS NULL
  AND start_at < $4
  AND end_at > $3
ORDER BY start_at ASC;
```

---

## 20.4. Listar áreas públicas para WordPress

```sql id="fi6tws"
SELECT
  id,
  slug,
  name,
  description,
  type,
  capacity,
  cover_image_url,
  gallery_urls,
  public_rules_summary
FROM common_areas
WHERE tenant_id = $1
  AND status = 'active'
  AND is_public_visible = true
  AND archived_at IS NULL
ORDER BY name ASC;
```

---

## 21. Índices recomendados

## 21.1. `common_areas`

```text id="l4t8iz"
tenant_id
tenant_id + code
tenant_id + slug
tenant_id + status
tenant_id + type
tenant_id + is_reservable
tenant_id + is_public_visible
tenant_id + status + is_public_visible
fee_charge_concept_id
archived_at
```

---

## 21.2. `common_area_availability_windows`

```text id="yrxrnu"
tenant_id
tenant_id + common_area_id
tenant_id + common_area_id + day_of_week
tenant_id + common_area_id + is_active
tenant_id + common_area_id + archived_at
```

---

## 21.3. `common_area_blackouts`

```text id="vjus1c"
tenant_id
tenant_id + common_area_id
tenant_id + common_area_id + status
tenant_id + common_area_id + start_at + end_at
tenant_id + start_at
tenant_id + end_at
created_by
cancelled_by
archived_at
```

---

## 21.4. `reservations`

```text id="x961xu"
tenant_id
tenant_id + common_area_id
tenant_id + property_unit_id
tenant_id + requester_user_id
tenant_id + requester_person_id
tenant_id + status
tenant_id + start_at
tenant_id + end_at
tenant_id + common_area_id + start_at + end_at
tenant_id + common_area_id + status
tenant_id + property_unit_id + status
tenant_id + charge_id
charge_id unique
archived_at
```

---

## 21.5. `reservation_status_history`

```text id="a7kku0"
tenant_id
tenant_id + reservation_id
tenant_id + actor_user_id
tenant_id + occurred_at
reservation_id + occurred_at
```

---

## 22. Soft delete y archivo

No se debe eliminar físicamente:

```text id="cu2239"
common_areas
common_area_availability_windows
common_area_blackouts
reservations
reservation_status_history
```

Regla:

```text id="rcw9ni"
archivedAt != null representa archivo lógico.
```

Motivos:

* auditoría;
* historial de reservas;
* trazabilidad financiera;
* soporte administrativo;
* consistencia con cargos y estados de cuenta.

---

## 23. Reglas de multitenancy

Todas las tablas nuevas tienen `tenant_id`.

Regla obligatoria:

```text id="tuszxw"
Toda consulta debe filtrar por tenant_id.
```

No se acepta:

```text id="kqesdg"
buscar reserva solo por reservationId
buscar área solo por commonAreaId
generar cargo sin validar tenant
usar propertyUnitId de otro tenant
usar chargeConceptId de otro tenant
usar chargeId de otro tenant
```

---

## 24. Reglas de ownership

Para endpoints `/me`, el acceso debe validarse contra `003-residents-properties`.

Regla conceptual:

```text id="j86xyu"
actorUserId -> personId -> active ownership/residency/lease -> propertyUnitId
```

El usuario puede actuar sobre una unidad si:

```text id="gpr3r1"
tiene relación activa con la unidad
AND tenant_id coincide
AND relación permite reserva según política del tenant
```

En MVP, relaciones permitidas sugeridas:

```text id="mk7fuj"
owner active
resident active
lease active si tenant permite arrendatarios
```

---

## 25. Seeds

## 25.1. Áreas comunales demo

```text id="gltz9n"
commonAreaSalonComunal
commonAreaCanchaMultiple
commonAreaBBQ
commonAreaPiscina
commonAreaParqueInfantil
```

---

## 25.2. Disponibilidad demo

```text id="wpdf82"
availabilitySalonSaturday
availabilitySalonSunday
availabilityCanchaWeekdays
availabilityBBQWeekend
```

---

## 25.3. Blackouts demo

```text id="xho1h1"
blackoutSalonMaintenance
blackoutCanchaRepair
```

---

## 25.4. Reservas demo

```text id="e808an"
reservationPendingApproval
reservationApproved
reservationRejected
reservationCancelled
reservationCompleted
reservationWithCharge
```

---

## 25.5. Datos prohibidos en seeds

```text id="x99z3b"
datos reales de residentes
nombres reales
cédulas
emails personales reales
teléfonos reales
comprobantes reales
pagos reales
tokens
secretos
cookies
API keys reales
```

---

## 26. Migración

Nombre sugerido:

```text id="ahcyin"
010_create_reservations_common_areas
```

Pasos:

```text id="g8h9id"
1. Crear enums.
2. Crear common_areas.
3. Crear common_area_availability_windows.
4. Crear common_area_blackouts.
5. Crear reservations.
6. Crear reservation_status_history.
7. Crear índices.
8. Crear constraints básicos.
9. Agregar relaciones Prisma.
10. Generar Prisma Client.
11. Ejecutar migración en DB test.
12. Ejecutar seeds demo.
13. Validar tests de repositorio.
```

---

## 27. Migraciones raw opcionales

Para fortalecer PostgreSQL:

### 27.1. Validar rangos temporales

```sql id="z7ylgw"
ALTER TABLE reservations
ADD CONSTRAINT reservations_start_before_end
CHECK (start_at < end_at);
```

```sql id="xirowt"
ALTER TABLE common_area_blackouts
ADD CONSTRAINT common_area_blackouts_start_before_end
CHECK (start_at < end_at);
```

---

### 27.2. Validar montos no negativos

```sql id="esiu35"
ALTER TABLE common_areas
ADD CONSTRAINT common_areas_fee_amount_non_negative
CHECK (fee_amount IS NULL OR fee_amount >= 0);
```

```sql id="aqro44"
ALTER TABLE reservations
ADD CONSTRAINT reservations_fee_amount_non_negative
CHECK (fee_amount IS NULL OR fee_amount >= 0);
```

---

### 27.3. Exclusion constraint anti-solapamiento futura

```sql id="kas2h5"
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE reservations
ADD CONSTRAINT reservations_no_overlap_active
EXCLUDE USING gist (
  tenant_id WITH =,
  common_area_id WITH =,
  tstzrange(start_at, end_at, '[)') WITH &&
)
WHERE (
  status IN ('requested', 'pendingApproval', 'approved')
  AND archived_at IS NULL
);
```

Nota:

```text id="bazwuk"
Si se implementa esta constraint, los tests deben cubrir conflicto por DB y por servicio.
```

---

## 28. Auditoría desde modelo

Eventos mínimos:

```text id="pjmzdp"
commonArea.created
commonArea.updated
commonArea.activated
commonArea.deactivated
commonArea.markedMaintenance
commonArea.archived
commonAreaAvailability.created
commonAreaAvailability.updated
commonAreaAvailability.archived
commonAreaBlackout.created
commonAreaBlackout.cancelled
reservation.created
reservation.requested
reservation.approved
reservation.rejected
reservation.cancelled
reservation.completed
reservation.noShow
reservation.expired
reservation.chargeGenerated
reservation.chargeGenerationFailed
reservation.conflictDetected
```

Metadata permitida:

```text id="t4r2nh"
commonAreaId
reservationId
propertyUnitId
fromStatus
toStatus
startAt
endAt
reason
chargeId
traceId
```

Metadata prohibida:

```text id="kqslwy"
payload completo
tokens
secretos
comprobantes
datos personales innecesarios
datos financieros detallados no necesarios
```

---

## 29. Seguridad del modelo

## 29.1. Prohibiciones

El modelo no debe permitir:

```text id="f9ea2y"
reservas sin tenant_id
reservas sin common_area_id
reservas con start_at >= end_at
reservas cross-tenant
áreas cross-tenant
chargeConceptId de otro tenant
chargeId de otro tenant
propertyUnitId de otro tenant
float para dinero
eliminación física de historial
exposición pública de internalRules
exposición pública de reservas
```

---

## 29.2. Datos personales

Campos sensibles:

```text id="uwumx1"
requesterUserId
requesterPersonId
propertyUnitId
purpose
notes
metadata
```

Reglas:

* no exponer en WordPress;
* no exponer a usuarios no autorizados;
* calendario propio solo muestra terceros como ocupado;
* logs no deben incluir propósito completo si contiene información sensible.

---

## 29.3. Datos financieros

Campos financieros:

```text id="lyqyhp"
feeAmount
feeCurrency
feeChargeConceptId
chargeId
paymentStatusSnapshot
```

Reglas:

* `feeAmount` Decimal;
* API devuelve string;
* `chargeId` no se expone en vistas públicas;
* pagos no se procesan en este módulo;
* cancelación no revierte cargo automáticamente.

---

## 30. Testing del modelo

## 30.1. Unit tests

```text id="izbpao"
CommonArea entity
AvailabilityWindow entity
Blackout entity
Reservation entity
ReservationStatusHistory entity
ReservationTimeRange
ReservationDuration
ReservationMoney
ReservationStateMachine
ReservationConflictService
ReservationPolicyService
```

---

## 30.2. Repository tests

```text id="clzc6n"
create common area
list common areas by tenant
find area by slug
create availability window
create blackout
find blackout conflict
create reservation
find reservation conflict
attach charge
create status history
list own reservations
list calendar items
list public common areas
```

---

## 30.3. Multitenancy tests

```text id="dc1x2s"
tenant A no ve áreas tenant B
tenant A no ve reservas tenant B
tenant A no usa propertyUnitId tenant B
tenant A no usa chargeConceptId tenant B
tenant A no usa chargeId tenant B
public common area slug A no devuelve tenant B
```

---

## 30.4. Financial regression tests

```text id="hxla5l"
feeAmount se guarda Decimal
feeAmount sale string
cargo se genera una sola vez
chargeId único
cancelación no revierte cargo
pagos no se modifican desde reservas
```

---

## 30.5. Concurrency tests

```text id="q02bgd"
dos solicitudes simultáneas mismo horario solo una se crea/aprueba
aprobación simultánea revalida conflicto
blackout simultáneo bloquea reserva si se solapa
```

---

## 31. Decisión final del modelo

El módulo `010-reservations-common-areas` usará las siguientes tablas:

```text id="dj9mis"
common_areas
common_area_availability_windows
common_area_blackouts
reservations
reservation_status_history
```

El modelo garantiza:

```text id="lt2o3d"
tenant isolation
áreas comunales configurables
disponibilidad simple
bloqueos administrativos
reservas con estado controlado
historial de estados
prevención de solapamientos
integración financiera opcional
idempotencia de cargo
exposición pública limitada
auditoría completa
```

La implementación no debe aceptarse si:

```text id="lsmv4r"
permite reservas cross-tenant
permite doble reserva
permite startAt >= endAt
permite usar unidades de otro tenant
permite usar conceptos de cargo de otro tenant
genera cargos duplicados
usa float para dinero
elimina historial
expone reservas privadas a WordPress
expone internalRules públicamente
procesa pagos directamente
revierte cargos automáticamente sin flujo financiero
```

---

## 32. Pendientes para evolución

Quedan diferidos:

```text id="jjcdwc"
reservas recurrentes
reservas multi-día
reservas nocturnas
depósitos en garantía
penalizaciones automáticas
tarifas por hora
tarifas por temporada
lista de espera
aprobación multinivel
check-in/check-out
QR de ingreso
inspecciones post-reserva
sincronización con Google Calendar
notificaciones automáticas
reservas desde WordPress
pagos online
contratos PDF
firma electrónica
```

Estos diferidos no bloquean el MVP de `010-reservations-common-areas`.
