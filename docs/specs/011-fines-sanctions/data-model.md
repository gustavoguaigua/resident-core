# Data Model — Spec 011 Fines and Sanctions

## 1. Información del documento

| Campo                  | Valor                                                              |
| ---------------------- | ------------------------------------------------------------------ |
| Proyecto               | RESIDENT Core                                                      |
| Spec ID                | 011                                                                |
| Módulo                 | Fines and Sanctions                                                |
| Documento              | Data Model                                                         |
| Ruta                   | `docs/specs/011-fines-sanctions/data-model.md`                     |
| Versión                | 0.1                                                                |
| Estado                 | Borrador inicial                                                   |
| Fecha                  | 2026-07-19                                                         |
| Documento base         | `docs/specs/011-fines-sanctions/spec.md`                           |
| Plan técnico           | `docs/specs/011-fines-sanctions/plan.md`                           |
| Base de datos          | PostgreSQL                                                         |
| ORM                    | Prisma                                                             |
| Estrategia multitenant | Shared database + shared schema + `tenant_id`                      |
| Naturaleza del módulo  | Transaccional / Tenant-scoped / Auditable / Financially integrable |
| API Style              | REST                                                               |

---

## 2. Propósito

Este documento define el modelo de datos del módulo `011-fines-sanctions`.

El objetivo es modelar conceptos de multa, multas, evidencias, reclamos e historial de estados, garantizando:

* aislamiento por tenant;
* asociación obligatoria a unidad habitacional cuando exista impacto financiero;
* responsable opcional;
* trazabilidad histórica;
* soporte de evidencias;
* reclamos básicos;
* integración financiera sin procesar pagos;
* generación idempotente de cargos;
* protección de datos personales;
* protección de evidencias;
* no exposición pública en WordPress;
* consistencia con auditoría, reportes y estados de cuenta.

Regla central:

```text id="cd0gh9"
Toda multa debe ser tenant-scoped, state-controlled, evidence-aware, auditable, own-resource protected y financieramente integrable sin convertirse en módulo de pagos.
```

---

## 3. Decisión principal del modelo

Para MVP se crearán cinco tablas principales:

```text id="raxth5"
fine_concepts
fines
fine_evidence
fine_appeals
fine_status_history
```

Estas tablas permiten cubrir:

* catálogo de conceptos de multa;
* configuración de montos base;
* relación con conceptos financieros;
* registro de multas;
* asociación con unidades;
* responsable opcional;
* evidencias;
* reclamos;
* emisión de multas;
* generación opcional de cargos;
* estado financiero informativo;
* historial funcional;
* auditoría externa mediante `audit_logs`.

---

## 4. Tablas nuevas MVP

```text id="iuzab7"
fine_concepts
fines
fine_evidence
fine_appeals
fine_status_history
```

---

## 5. Tablas externas relacionadas

El módulo se relaciona con tablas ya definidas en specs anteriores:

```text id="dcw68h"
tenants
user_profiles
persons
property_units
charge_concepts
charges
payments
payment_allocations
account_statements
unit_balances
audit_logs
```

Relación con specs:

| Tabla externa         | Spec origen                | Uso en multas                                                                     |
| --------------------- | -------------------------- | --------------------------------------------------------------------------------- |
| `tenants`             | `001-tenants`              | Tenant propietario de conceptos, multas, evidencias y reclamos                    |
| `user_profiles`       | `002-users-roles`          | Usuario que reporta, revisa, aprueba, rechaza, emite, condona, reversa o resuelve |
| `persons`             | `003-residents-properties` | Persona responsable opcional                                                      |
| `property_units`      | `003-residents-properties` | Unidad habitacional afectada y eje financiero                                     |
| `charge_concepts`     | `004-dues-fees`            | Concepto financiero usado al generar cargo por multa                              |
| `charges`             | `004-dues-fees`            | Cargo financiero generado por multa emitida                                       |
| `payments`            | `005-payments`             | Fuente financiera externa; no se modifica desde multas                            |
| `payment_allocations` | `005-payments`             | Fuente financiera externa; no se modifica desde multas                            |
| `account_statements`  | `006-account-statements`   | Estados de cuenta reconstruidos desde cargos/pagos                                |
| `unit_balances`       | `006-account-statements`   | Saldos derivados; no se modifican directamente                                    |
| `audit_logs`          | `007-audit`                | Auditoría global de operaciones críticas                                          |

---

## 6. Entidad `FineConcept`

### 6.1. Propósito

Representa un concepto o tipo de multa configurable por tenant.

Ejemplos:

```text id="voah5u"
ruido excesivo
parqueo indebido
mal uso de área comunal
mascota sin control
daño a bien común
basura fuera de horario
alteración de convivencia
incumplimiento de reglamento
```

---

### 6.2. Tabla

```text id="xkg9m1"
fine_concepts
```

---

### 6.3. Campos

```text id="vkofnb"
FineConcept
├── id
├── tenantId
├── code
├── name
├── description
├── category
├── defaultAmount
├── currency
├── chargeConceptId
├── requiresEvidence
├── allowsAppeal
├── appealDeadlineDays
├── status
├── metadata
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 6.4. Reglas

* `tenantId` obligatorio.
* `code` obligatorio.
* `code` único por tenant.
* `name` obligatorio.
* `category` obligatorio o `other` por defecto.
* `defaultAmount` debe ser Decimal.
* `defaultAmount >= 0`.
* `currency` por defecto `USD`.
* Si `defaultAmount > 0`, debe existir `chargeConceptId` para generar cargo.
* `chargeConceptId` debe pertenecer al mismo tenant.
* `requiresEvidence` controla si una multa necesita evidencia antes de aprobarse o emitirse.
* `allowsAppeal` controla si el residente/propietario puede presentar reclamo.
* `appealDeadlineDays` debe ser mayor o igual a cero si existe.
* `status = archived` impide nuevas multas con ese concepto.
* `archivedAt` preserva historial.

---

## 7. Entidad `Fine`

### 7.1. Propósito

Representa una multa o caso sancionatorio.

Puede estar en borrador, reportada, en revisión, aprobada, emitida, reclamada, condonada, reversada, cancelada o archivada.

---

### 7.2. Tabla

```text id="e542av"
fines
```

---

### 7.3. Campos

```text id="l4mn15"
Fine
├── id
├── tenantId
├── fineConceptId
├── propertyUnitId
├── responsiblePersonId
├── reportedBy
├── reviewedBy
├── approvedBy
├── rejectedBy
├── issuedBy
├── cancelledBy
├── waivedBy
├── reversedBy
├── title
├── description
├── occurredAt
├── reportedAt
├── status
├── severity
├── amount
├── currency
├── chargeId
├── paymentStatusSnapshot
├── dueDate
├── reviewNotes
├── rejectionReason
├── cancellationReason
├── waiverReason
├── reversalReason
├── issuedAt
├── approvedAt
├── rejectedAt
├── cancelledAt
├── waivedAt
├── reversedAt
├── metadata
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 7.4. Reglas

* `tenantId` obligatorio.
* `fineConceptId` obligatorio.
* `propertyUnitId` obligatorio si `amount > 0`.
* `propertyUnitId` debe pertenecer al mismo tenant.
* `responsiblePersonId` opcional.
* `responsiblePersonId`, si existe, debe pertenecer al mismo tenant.
* `reportedBy`, si existe, debe pertenecer a usuario válido.
* `title` obligatorio.
* `description` obligatoria.
* `occurredAt` obligatorio.
* `reportedAt` obligatorio.
* `status` obligatorio.
* `severity` obligatorio.
* `amount` debe ser Decimal.
* `amount >= 0`.
* `currency` por defecto `USD`.
* `chargeId` opcional y único.
* `chargeId` debe pertenecer al mismo tenant.
* `chargeId` debe corresponder a la misma unidad.
* `paymentStatusSnapshot` es informativo.
* No se permite eliminación física ordinaria.
* Toda transición relevante debe crear `FineStatusHistory`.
* Toda operación crítica debe emitir evento de auditoría.

---

## 8. Entidad `FineEvidence`

### 8.1. Propósito

Representa una evidencia asociada a una multa.

Puede ser:

* texto;
* imagen;
* documento;
* video;
* referencia;
* evidencia mixta;
* evidencia externa referenciada.

---

### 8.2. Tabla

```text id="wxs092"
fine_evidence
```

---

### 8.3. Campos

```text id="wa36sy"
FineEvidence
├── id
├── tenantId
├── fineId
├── evidenceType
├── title
├── description
├── fileUrl
├── fileName
├── mimeType
├── fileSizeBytes
├── uploadedBy
├── uploadedAt
├── status
├── metadata
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 8.4. Reglas

* `tenantId` obligatorio.
* `fineId` obligatorio.
* `fineId` debe pertenecer al mismo tenant.
* `evidenceType` obligatorio.
* `title` obligatorio.
* `description` opcional pero recomendada.
* `fileUrl` opcional en MVP.
* Si existe `fileUrl`, no debe ser URL pública insegura para datos privados.
* `fileName`, `mimeType`, `fileSizeBytes` deben validarse si hay archivo.
* `uploadedBy` recomendado.
* `uploadedAt` obligatorio.
* `status` obligatorio.
* `status = archived` oculta evidencia ordinaria.
* No se elimina físicamente en operación ordinaria.
* Las descargas deben auditarse.
* No debe exponerse a WordPress público.

---

## 9. Entidad `FineAppeal`

### 9.1. Propósito

Representa un reclamo básico o impugnación presentada por un propietario o residente autorizado sobre una multa emitida.

---

### 9.2. Tabla

```text id="phmcbr"
fine_appeals
```

---

### 9.3. Campos

```text id="okttvk"
FineAppeal
├── id
├── tenantId
├── fineId
├── submittedBy
├── submittedAt
├── reason
├── status
├── resolvedBy
├── resolvedAt
├── resolution
├── resolutionNotes
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 9.4. Reglas

* `tenantId` obligatorio.
* `fineId` obligatorio.
* `fineId` debe pertenecer al mismo tenant.
* `submittedBy` obligatorio.
* `submittedBy` debe estar autorizado sobre la unidad de la multa.
* `submittedAt` obligatorio.
* `reason` obligatorio.
* Solo puede presentarse sobre multa `issued`.
* Debe respetar `appealDeadlineDays` si existe.
* No puede existir más de un reclamo abierto por multa en MVP.
* La resolución requiere `resolvedBy`, `resolvedAt`, `resolution` y `resolutionNotes`.
* No se elimina físicamente en operación ordinaria.

---

## 10. Entidad `FineStatusHistory`

### 10.1. Propósito

Mantiene historial funcional de cambios de estado de una multa.

No reemplaza `audit_logs`; lo complementa.

---

### 10.2. Tabla

```text id="aqpzn9"
fine_status_history
```

---

### 10.3. Campos

```text id="ypn9o9"
FineStatusHistory
├── id
├── tenantId
├── fineId
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
* `fineId` obligatorio.
* `toStatus` obligatorio.
* `occurredAt` obligatorio.
* `actorUserId` recomendado.
* `reason` obligatorio para rechazo, cancelación, condonación, reverso y resolución relevante.
* `metadata` debe ser sanitizada.
* No debe contener payload completo.
* No debe contener tokens, secretos, archivos ni datos personales innecesarios.

---

## 11. Enums

## 11.1. FineConceptStatus

```text id="x8gnvn"
active
inactive
archived
```

---

## 11.2. FineCategory

```text id="osn0cb"
noise
parking
pets
commonArea
cleanliness
security
damage
coexistence
other
```

---

## 11.3. FineStatus

```text id="j9x17u"
draft
reported
underReview
approved
rejected
issued
disputed
appealAccepted
appealRejected
waived
cancelled
reversed
archived
```

---

## 11.4. FineSeverity

```text id="puv0yc"
low
medium
high
critical
```

---

## 11.5. FineEvidenceType

```text id="fiecls"
text
image
document
video
reference
other
```

---

## 11.6. FineEvidenceStatus

```text id="pc4vx5"
active
rejected
archived
```

---

## 11.7. FineAppealStatus

```text id="s9mdu0"
submitted
underReview
accepted
rejected
cancelled
archived
```

---

## 11.8. FinePaymentStatusSnapshot

```text id="gb5vc7"
notRequired
pendingCharge
chargeGenerated
pendingPayment
paid
partiallyPaid
waived
cancelled
reversed
```

Este campo es informativo. La fuente financiera real sigue siendo:

```text id="f6732v"
charges
payments
payment_allocations
account_statements
unit_balances
```

---

## 12. Modelo Prisma preliminar

## 12.1. Enums Prisma

```prisma id="cbwvbl"
enum FineConceptStatus {
  ACTIVE   @map("active")
  INACTIVE @map("inactive")
  ARCHIVED @map("archived")

  @@map("fine_concept_status")
}

enum FineCategory {
  NOISE        @map("noise")
  PARKING      @map("parking")
  PETS         @map("pets")
  COMMON_AREA  @map("commonArea")
  CLEANLINESS  @map("cleanliness")
  SECURITY     @map("security")
  DAMAGE       @map("damage")
  COEXISTENCE  @map("coexistence")
  OTHER        @map("other")

  @@map("fine_category")
}

enum FineStatus {
  DRAFT           @map("draft")
  REPORTED        @map("reported")
  UNDER_REVIEW    @map("underReview")
  APPROVED        @map("approved")
  REJECTED        @map("rejected")
  ISSUED          @map("issued")
  DISPUTED        @map("disputed")
  APPEAL_ACCEPTED @map("appealAccepted")
  APPEAL_REJECTED @map("appealRejected")
  WAIVED          @map("waived")
  CANCELLED       @map("cancelled")
  REVERSED        @map("reversed")
  ARCHIVED        @map("archived")

  @@map("fine_status")
}

enum FineSeverity {
  LOW      @map("low")
  MEDIUM   @map("medium")
  HIGH     @map("high")
  CRITICAL @map("critical")

  @@map("fine_severity")
}

enum FineEvidenceType {
  TEXT      @map("text")
  IMAGE     @map("image")
  DOCUMENT  @map("document")
  VIDEO     @map("video")
  REFERENCE @map("reference")
  OTHER     @map("other")

  @@map("fine_evidence_type")
}

enum FineEvidenceStatus {
  ACTIVE   @map("active")
  REJECTED @map("rejected")
  ARCHIVED @map("archived")

  @@map("fine_evidence_status")
}

enum FineAppealStatus {
  SUBMITTED    @map("submitted")
  UNDER_REVIEW @map("underReview")
  ACCEPTED     @map("accepted")
  REJECTED     @map("rejected")
  CANCELLED    @map("cancelled")
  ARCHIVED     @map("archived")

  @@map("fine_appeal_status")
}

enum FinePaymentStatusSnapshot {
  NOT_REQUIRED     @map("notRequired")
  PENDING_CHARGE   @map("pendingCharge")
  CHARGE_GENERATED @map("chargeGenerated")
  PENDING_PAYMENT  @map("pendingPayment")
  PAID             @map("paid")
  PARTIALLY_PAID   @map("partiallyPaid")
  WAIVED           @map("waived")
  CANCELLED        @map("cancelled")
  REVERSED         @map("reversed")

  @@map("fine_payment_status_snapshot")
}
```

---

## 12.2. Modelo `FineConcept`

```prisma id="hk7108"
model FineConcept {
  id                  String              @id @default(uuid())
  tenantId            String              @map("tenant_id")

  code                String
  name                String
  description         String?
  category            FineCategory        @default(OTHER)

  defaultAmount       Decimal             @default(0) @map("default_amount") @db.Decimal(12, 2)
  currency            String              @default("USD")
  chargeConceptId     String?             @map("charge_concept_id")

  requiresEvidence    Boolean             @default(false) @map("requires_evidence")
  allowsAppeal        Boolean             @default(true) @map("allows_appeal")
  appealDeadlineDays  Int?                @map("appeal_deadline_days")

  status              FineConceptStatus   @default(ACTIVE)
  metadata            Json?

  createdAt           DateTime            @default(now()) @map("created_at")
  updatedAt           DateTime            @updatedAt @map("updated_at")
  archivedAt          DateTime?           @map("archived_at")

  tenant              Tenant              @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  chargeConcept       ChargeConcept?      @relation(fields: [chargeConceptId], references: [id], onDelete: Restrict)

  fines               Fine[]

  @@unique([tenantId, code])
  @@index([tenantId])
  @@index([tenantId, status])
  @@index([tenantId, category])
  @@index([tenantId, archivedAt])
  @@index([chargeConceptId])
  @@map("fine_concepts")
}
```

---

## 12.3. Modelo `Fine`

```prisma id="oo8sd4"
model Fine {
  id                     String                    @id @default(uuid())
  tenantId               String                    @map("tenant_id")
  fineConceptId          String                    @map("fine_concept_id")
  propertyUnitId         String?                   @map("property_unit_id")
  responsiblePersonId    String?                   @map("responsible_person_id")

  reportedBy             String?                   @map("reported_by")
  reviewedBy             String?                   @map("reviewed_by")
  approvedBy             String?                   @map("approved_by")
  rejectedBy             String?                   @map("rejected_by")
  issuedBy               String?                   @map("issued_by")
  cancelledBy            String?                   @map("cancelled_by")
  waivedBy               String?                   @map("waived_by")
  reversedBy             String?                   @map("reversed_by")

  title                  String
  description            String
  occurredAt             DateTime                  @map("occurred_at")
  reportedAt             DateTime                  @default(now()) @map("reported_at")

  status                 FineStatus                @default(REPORTED)
  severity               FineSeverity              @default(MEDIUM)

  amount                 Decimal                   @default(0) @db.Decimal(12, 2)
  currency               String                    @default("USD")
  chargeId               String?                   @unique @map("charge_id")
  paymentStatusSnapshot  FinePaymentStatusSnapshot @default(NOT_REQUIRED) @map("payment_status_snapshot")
  dueDate                DateTime?                 @map("due_date")

  reviewNotes            String?                   @map("review_notes")
  rejectionReason        String?                   @map("rejection_reason")
  cancellationReason     String?                   @map("cancellation_reason")
  waiverReason           String?                   @map("waiver_reason")
  reversalReason         String?                   @map("reversal_reason")

  issuedAt               DateTime?                 @map("issued_at")
  approvedAt             DateTime?                 @map("approved_at")
  rejectedAt             DateTime?                 @map("rejected_at")
  cancelledAt            DateTime?                 @map("cancelled_at")
  waivedAt               DateTime?                 @map("waived_at")
  reversedAt             DateTime?                 @map("reversed_at")

  metadata               Json?

  createdAt              DateTime                  @default(now()) @map("created_at")
  updatedAt              DateTime                  @updatedAt @map("updated_at")
  archivedAt             DateTime?                 @map("archived_at")

  tenant                 Tenant                    @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  fineConcept            FineConcept               @relation(fields: [fineConceptId], references: [id], onDelete: Restrict)
  propertyUnit           PropertyUnit?             @relation(fields: [propertyUnitId], references: [id], onDelete: Restrict)
  responsiblePerson      Person?                   @relation("FineResponsiblePerson", fields: [responsiblePersonId], references: [id], onDelete: Restrict)

  reportedByUser         UserProfile?              @relation("FineReportedBy", fields: [reportedBy], references: [id], onDelete: Restrict)
  reviewedByUser         UserProfile?              @relation("FineReviewedBy", fields: [reviewedBy], references: [id], onDelete: Restrict)
  approvedByUser         UserProfile?              @relation("FineApprovedBy", fields: [approvedBy], references: [id], onDelete: Restrict)
  rejectedByUser         UserProfile?              @relation("FineRejectedBy", fields: [rejectedBy], references: [id], onDelete: Restrict)
  issuedByUser           UserProfile?              @relation("FineIssuedBy", fields: [issuedBy], references: [id], onDelete: Restrict)
  cancelledByUser        UserProfile?              @relation("FineCancelledBy", fields: [cancelledBy], references: [id], onDelete: Restrict)
  waivedByUser           UserProfile?              @relation("FineWaivedBy", fields: [waivedBy], references: [id], onDelete: Restrict)
  reversedByUser         UserProfile?              @relation("FineReversedBy", fields: [reversedBy], references: [id], onDelete: Restrict)

  charge                 Charge?                   @relation(fields: [chargeId], references: [id], onDelete: Restrict)

  evidence               FineEvidence[]
  appeals                FineAppeal[]
  statusHistory          FineStatusHistory[]

  @@index([tenantId])
  @@index([tenantId, fineConceptId])
  @@index([tenantId, propertyUnitId])
  @@index([tenantId, responsiblePersonId])
  @@index([tenantId, status])
  @@index([tenantId, severity])
  @@index([tenantId, occurredAt])
  @@index([tenantId, reportedAt])
  @@index([tenantId, issuedAt])
  @@index([tenantId, chargeId])
  @@index([tenantId, propertyUnitId, status])
  @@index([reportedBy])
  @@index([approvedBy])
  @@index([issuedBy])
  @@index([cancelledBy])
  @@index([waivedBy])
  @@index([reversedBy])
  @@map("fines")
}
```

---

## 12.4. Modelo `FineEvidence`

```prisma id="ag7x4w"
model FineEvidence {
  id              String              @id @default(uuid())
  tenantId        String              @map("tenant_id")
  fineId          String              @map("fine_id")

  evidenceType    FineEvidenceType    @map("evidence_type")
  title           String
  description     String?

  fileUrl         String?             @map("file_url")
  fileName        String?             @map("file_name")
  mimeType        String?             @map("mime_type")
  fileSizeBytes   Int?                @map("file_size_bytes")

  uploadedBy      String?             @map("uploaded_by")
  uploadedAt      DateTime            @default(now()) @map("uploaded_at")

  status          FineEvidenceStatus  @default(ACTIVE)
  metadata        Json?

  createdAt       DateTime            @default(now()) @map("created_at")
  updatedAt       DateTime            @updatedAt @map("updated_at")
  archivedAt      DateTime?           @map("archived_at")

  tenant          Tenant              @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  fine            Fine                @relation(fields: [fineId], references: [id], onDelete: Restrict)
  uploadedByUser  UserProfile?        @relation("FineEvidenceUploadedBy", fields: [uploadedBy], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([tenantId, fineId])
  @@index([tenantId, evidenceType])
  @@index([tenantId, status])
  @@index([tenantId, archivedAt])
  @@index([uploadedBy])
  @@map("fine_evidence")
}
```

---

## 12.5. Modelo `FineAppeal`

```prisma id="eokwk1"
model FineAppeal {
  id               String            @id @default(uuid())
  tenantId         String            @map("tenant_id")
  fineId           String            @map("fine_id")

  submittedBy      String            @map("submitted_by")
  submittedAt      DateTime          @default(now()) @map("submitted_at")
  reason           String

  status           FineAppealStatus  @default(SUBMITTED)

  resolvedBy       String?           @map("resolved_by")
  resolvedAt       DateTime?         @map("resolved_at")
  resolution       String?
  resolutionNotes  String?           @map("resolution_notes")

  createdAt        DateTime          @default(now()) @map("created_at")
  updatedAt        DateTime          @updatedAt @map("updated_at")
  archivedAt       DateTime?         @map("archived_at")

  tenant           Tenant            @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  fine             Fine              @relation(fields: [fineId], references: [id], onDelete: Restrict)
  submittedByUser  UserProfile       @relation("FineAppealSubmittedBy", fields: [submittedBy], references: [id], onDelete: Restrict)
  resolvedByUser   UserProfile?      @relation("FineAppealResolvedBy", fields: [resolvedBy], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([tenantId, fineId])
  @@index([tenantId, submittedBy])
  @@index([tenantId, status])
  @@index([tenantId, submittedAt])
  @@index([resolvedBy])
  @@map("fine_appeals")
}
```

---

## 12.6. Modelo `FineStatusHistory`

```prisma id="orpq3h"
model FineStatusHistory {
  id             String      @id @default(uuid())
  tenantId       String      @map("tenant_id")
  fineId         String      @map("fine_id")

  fromStatus     FineStatus? @map("from_status")
  toStatus       FineStatus  @map("to_status")

  actorUserId    String?     @map("actor_user_id")
  reason         String?
  occurredAt     DateTime    @default(now()) @map("occurred_at")
  metadata       Json?

  tenant         Tenant      @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  fine           Fine        @relation(fields: [fineId], references: [id], onDelete: Restrict)
  actorUser      UserProfile? @relation("FineStatusHistoryActor", fields: [actorUserId], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([tenantId, fineId])
  @@index([tenantId, actorUserId])
  @@index([tenantId, occurredAt])
  @@index([fineId, occurredAt])
  @@map("fine_status_history")
}
```

---

## 12.7. Relaciones requeridas en modelos existentes

### Tenant

```prisma id="m67bqw"
model Tenant {
  // campos existentes...

  fineConcepts       FineConcept[]
  fines              Fine[]
  fineEvidence       FineEvidence[]
  fineAppeals        FineAppeal[]
  fineStatusHistory  FineStatusHistory[]
}
```

---

### UserProfile

```prisma id="vd9ydg"
model UserProfile {
  // campos existentes...

  finesReported       Fine[] @relation("FineReportedBy")
  finesReviewed       Fine[] @relation("FineReviewedBy")
  finesApproved       Fine[] @relation("FineApprovedBy")
  finesRejected       Fine[] @relation("FineRejectedBy")
  finesIssued         Fine[] @relation("FineIssuedBy")
  finesCancelled      Fine[] @relation("FineCancelledBy")
  finesWaived         Fine[] @relation("FineWaivedBy")
  finesReversed       Fine[] @relation("FineReversedBy")

  fineEvidenceUploaded FineEvidence[] @relation("FineEvidenceUploadedBy")

  fineAppealsSubmitted FineAppeal[] @relation("FineAppealSubmittedBy")
  fineAppealsResolved  FineAppeal[] @relation("FineAppealResolvedBy")

  fineStatusActions    FineStatusHistory[] @relation("FineStatusHistoryActor")
}
```

---

### PropertyUnit

```prisma id="okureq"
model PropertyUnit {
  // campos existentes...

  fines Fine[]
}
```

---

### Person

```prisma id="byeh7l"
model Person {
  // campos existentes...

  finesAsResponsible Fine[] @relation("FineResponsiblePerson")
}
```

---

### ChargeConcept

```prisma id="c9kzxi"
model ChargeConcept {
  // campos existentes...

  fineConcepts FineConcept[]
}
```

---

### Charge

```prisma id="kfuq0o"
model Charge {
  // campos existentes...

  fine Fine?
}
```

---

## 13. Constraints recomendadas

## 13.1. `fine_concepts`

```text id="x3ggwm"
tenant_id NOT NULL
code NOT NULL
name NOT NULL
status NOT NULL
default_amount NOT NULL
currency NOT NULL
UNIQUE (tenant_id, code)
default_amount >= 0
appeal_deadline_days >= 0 si no es null
```

Regla financiera:

```text id="z00939"
default_amount > 0 implica charge_concept_id no null para emisión con cargo.
```

Esta regla puede validarse en servicio y reforzarse con constraint SQL si el flujo operativo lo permite.

---

## 13.2. `fines`

```text id="rf75nb"
tenant_id NOT NULL
fine_concept_id NOT NULL
title NOT NULL
description NOT NULL
occurred_at NOT NULL
reported_at NOT NULL
status NOT NULL
severity NOT NULL
amount NOT NULL
currency NOT NULL
amount >= 0
charge_id UNIQUE si existe
```

Reglas de servicio:

```text id="od04qj"
amount > 0 implica property_unit_id no null
si status = approved: approved_by y approved_at obligatorios
si status = rejected: rejected_by, rejected_at y rejection_reason obligatorios
si status = issued: issued_by e issued_at obligatorios
si status = cancelled: cancelled_by, cancelled_at y cancellation_reason obligatorios
si status = waived: waived_by, waived_at y waiver_reason obligatorios
si status = reversed: reversed_by, reversed_at y reversal_reason obligatorios
```

---

## 13.3. `fine_evidence`

```text id="ejaee8"
tenant_id NOT NULL
fine_id NOT NULL
evidence_type NOT NULL
title NOT NULL
uploaded_at NOT NULL
status NOT NULL
file_size_bytes >= 0 si no es null
```

Reglas de servicio:

```text id="addvpw"
fileUrl no debe ser pública si contiene evidencia privada
mimeType debe estar en allowlist si se suben archivos
fileSizeBytes debe respetar límite de tamaño
```

---

## 13.4. `fine_appeals`

```text id="effvpj"
tenant_id NOT NULL
fine_id NOT NULL
submitted_by NOT NULL
submitted_at NOT NULL
reason NOT NULL
status NOT NULL
```

Reglas de servicio:

```text id="vdva7h"
solo multa issued permite reclamo
no más de un reclamo abierto por multa en MVP
resolución requiere resolved_by, resolved_at, resolution y resolution_notes
```

---

## 13.5. `fine_status_history`

```text id="t8gefo"
tenant_id NOT NULL
fine_id NOT NULL
to_status NOT NULL
occurred_at NOT NULL
```

---

## 14. Estrategia de estado

## 14.1. Estados iniciales permitidos

Para creación administrativa:

```text id="cne4w6"
draft
reported
```

Recomendación MVP:

```text id="cfanuz"
Crear multas directamente en reported salvo que se necesite guardar borradores.
```

---

## 14.2. Transiciones permitidas

```text id="eyris4"
draft -> reported
reported -> underReview
underReview -> approved
reported -> rejected
underReview -> rejected
approved -> issued
draft -> cancelled
reported -> cancelled
underReview -> cancelled
approved -> cancelled
issued -> disputed
disputed -> appealAccepted
disputed -> appealRejected
appealAccepted -> waived
appealAccepted -> reversed
appealRejected -> issued
issued -> waived
disputed -> waived
issued -> reversed
disputed -> reversed
rejected -> archived
cancelled -> archived
waived -> archived
reversed -> archived
issued -> archived
```

---

## 14.3. Transiciones prohibidas críticas

```text id="hx16os"
rejected -> issued
cancelled -> issued
waived -> issued
reversed -> issued
archived -> approved
issued -> approved
draft -> issued
```

---

## 14.4. Estados con impacto financiero

Estados que pueden implicar cargo:

```text id="ii0ipf"
issued
disputed
appealRejected
```

Estados que no deben generar nuevo cargo:

```text id="wilrk0"
draft
reported
underReview
approved
rejected
cancelled
waived
reversed
archived
```

Nota:

```text id="ln70xw"
approved aún no debe generar cargo en MVP; el cargo se genera al emitir.
```

---

## 15. Reglas financieras del modelo

## 15.1. Dinero

Campos monetarios:

```text id="kgij16"
fine_concepts.default_amount
fines.amount
```

Reglas:

* usar `Decimal(12,2)`;
* no usar float/double;
* exponer por API como string;
* moneda por defecto `USD`;
* no permitir montos negativos.

---

## 15.2. Snapshot del monto

`fines.amount` guarda el monto aplicado a la multa al momento de creación o emisión.

Motivo:

```text id="v5xw13"
Si el monto base del concepto cambia después, la multa mantiene su valor histórico.
```

---

## 15.3. Concepto financiero

`fine_concepts.chargeConceptId` indica el concepto financiero que se usará para generar cargo.

Reglas:

* debe pertenecer al mismo tenant;
* debe estar activo;
* debe ser válido para cargos de multa;
* no debe ser null si se va a generar cargo para multa monetaria.

---

## 15.4. Cargo generado

`fines.chargeId` apunta al cargo generado.

Reglas:

* opcional;
* único;
* no puede apuntar a cargo de otro tenant;
* no puede apuntar a cargo de otra unidad;
* no puede cambiarse sin auditoría;
* no se elimina aunque la multa sea condonada o reversada.

---

## 15.5. Idempotencia de cargo

MVP:

```text id="z5qoel"
fine.chargeId UNIQUE
```

Regla de servicio:

```text id="ilrlla"
si fine.chargeId existe, no generar otro cargo
```

Idempotency key sugerida:

```text id="uodqkn"
fine:{fineId}:charge
```

---

## 15.6. Reclamo y cargo

MVP:

```text id="p6jbby"
Presentar reclamo no revierte automáticamente el cargo.
```

La resolución administrativa puede derivar en:

```text id="nxswr5"
waive
reverse
ajuste financiero controlado
reverso financiero controlado
```

---

## 15.7. Condonación y reverso

MVP:

```text id="h3a7l8"
Condonar o reversar una multa no borra ni modifica pagos automáticamente.
```

Los efectos financieros formales deben ejecutarse mediante módulos financieros.

---

## 16. Reglas de propiedad y acceso propio

Para endpoints `/me`, el acceso debe validarse contra `003-residents-properties`.

Regla conceptual:

```text id="c652gn"
actorUserId -> personId -> active ownership/residency/lease -> propertyUnitId -> fine
```

El usuario puede consultar o reclamar una multa si:

```text id="ks5m5r"
fine.propertyUnitId pertenece a una unidad asociada al usuario
AND tenant_id coincide
AND relación está activa
AND política del tenant permite ese tipo de acceso
```

Relaciones permitidas sugeridas en MVP:

```text id="f3t33f"
owner active
resident active
lease active si tenant permite arrendatarios
```

---

## 17. Reglas de privacidad

## 17.1. Vista administrativa

Puede incluir:

```text id="zwse2l"
fineId
fineConceptId
fineConceptName
propertyUnitId
propertyUnitCode
responsiblePersonId
title
description
occurredAt
reportedAt
status
severity
amount
currency
chargeId
paymentStatusSnapshot
dueDate
reviewNotes
rejectionReason
cancellationReason
waiverReason
reversalReason
evidence summary
appeal summary
```

Requiere permisos administrativos.

---

## 17.2. Vista propia

Puede incluir:

```text id="cxehq0"
fineId
fineConceptName
propertyUnitId propio
propertyUnitCode propio
title
description resumida o completa según política
occurredAt
status
severity
amount
currency
paymentStatusSnapshot
issuedAt
allowsAppeal
appealDeadlineAt
appeal status propio
```

No debe incluir:

```text id="rkteft"
responsiblePersonId si no corresponde
reportedBy
reviewedBy
approvedBy
rejectedBy
issuedBy
cancelledBy
waivedBy
reversedBy
internal review notes
audit metadata
evidencias restringidas
datos de terceros
```

---

## 17.3. Evidencias

Evidencia administrativa puede incluir:

```text id="cy9h48"
evidenceId
evidenceType
title
description
fileName
mimeType
fileSizeBytes
uploadedBy
uploadedAt
status
```

Evidencia propia debe aplicar política:

```text id="yzpo4s"
mostrar solo evidencia autorizada
ocultar evidencia sensible
descarga solo si está permitida
auditar descarga
```

---

## 17.4. WordPress público

No debe existir DTO público de multas.

Prohibido:

```text id="poie5j"
fineId
fineConcept
propertyUnitId
responsiblePersonId
status
amount
chargeId
paymentStatusSnapshot
evidence
appeals
history
audit
```

---

## 18. DTOs derivados del modelo

## 18.1. FineConceptDto

Fuente:

```text id="gminwa"
fine_concepts
```

Campos:

```text id="petajy"
id
code
name
description
category
defaultAmount
currency
chargeConceptId
requiresEvidence
allowsAppeal
appealDeadlineDays
status
createdAt
updatedAt
```

---

## 18.2. FineConceptListItemDto

```text id="kgprx3"
id
code
name
category
defaultAmount
currency
requiresEvidence
allowsAppeal
status
```

---

## 18.3. FineAdminDto

Fuente:

```text id="y3ixve"
fines
```

Campos:

```text id="g2a9cx"
id
fineConceptId
fineConceptName
propertyUnitId
propertyUnitCode
responsiblePersonId
title
description
occurredAt
reportedAt
status
severity
amount
currency
chargeId
paymentStatusSnapshot
dueDate
issuedAt
approvedAt
rejectedAt
cancelledAt
waivedAt
reversedAt
createdAt
updatedAt
```

---

## 18.4. FineAdminDetailDto

Incluye además:

```text id="nl36cl"
reviewNotes
rejectionReason
cancellationReason
waiverReason
reversalReason
reportedBy
reviewedBy
approvedBy
rejectedBy
issuedBy
cancelledBy
waivedBy
reversedBy
evidenceSummary
appealSummary
metadata sanitizada
```

---

## 18.5. OwnFineDto

Campos:

```text id="bto1fl"
id
fineConceptName
propertyUnitId
propertyUnitCode
title
description
occurredAt
status
severity
amount
currency
paymentStatusSnapshot
issuedAt
allowsAppeal
appealDeadlineAt
appealStatus
```

---

## 18.6. FineEvidenceDto

Campos:

```text id="lou9mo"
id
fineId
evidenceType
title
description
fileName
mimeType
fileSizeBytes
uploadedAt
status
```

No incluye `fileUrl` directa si requiere URL firmada.

---

## 18.7. FineEvidenceDownloadDto

```text id="m2l5aw"
downloadUrl
expiresAt
fileName
mimeType
fileSizeBytes
```

Regla:

```text id="wqtvqp"
downloadUrl debe ser temporal si apunta a archivo privado.
```

---

## 18.8. FineAppealDto

Campos:

```text id="krumth"
id
fineId
submittedBy
submittedAt
reason
status
resolvedBy
resolvedAt
resolution
resolutionNotes
createdAt
updatedAt
```

---

## 18.9. OwnFineAppealDto

Campos:

```text id="fxqnpl"
id
fineId
submittedAt
reason
status
resolvedAt
resolution
resolutionNotes
```

No debe incluir datos administrativos innecesarios.

---

## 19. Reglas de consulta

## 19.1. Filtros de conceptos

```text id="rtyg6d"
status
category
q
page
pageSize
sortBy
sortOrder
```

Sort permitido:

```text id="nvn5ms"
code
name
category
defaultAmount
status
createdAt
```

---

## 19.2. Filtros de multas administrativas

```text id="brcv6e"
fineConceptId
propertyUnitId
responsiblePersonId
status
severity
occurredFrom
occurredTo
reportedFrom
reportedTo
issuedFrom
issuedTo
paymentStatusSnapshot
hasCharge
page
pageSize
sortBy
sortOrder
```

Sort permitido:

```text id="tr5owr"
occurredAt
reportedAt
issuedAt
status
severity
amount
createdAt
```

---

## 19.3. Filtros de multas propias

```text id="vk3kb8"
propertyUnitId
status
severity
issuedFrom
issuedTo
page
pageSize
sortBy
sortOrder
```

Regla:

```text id="cdo7l7"
propertyUnitId debe pertenecer al usuario autenticado.
```

---

## 19.4. Filtros de evidencias

```text id="cn6x1e"
evidenceType
status
page
pageSize
```

---

## 19.5. Filtros de reclamos

```text id="ovslbu"
fineId
status
submittedFrom
submittedTo
page
pageSize
```

---

## 20. Queries conceptuales

## 20.1. Listar multas administrativas

```sql id="ehu5en"
SELECT
  f.id,
  f.fine_concept_id,
  f.property_unit_id,
  f.responsible_person_id,
  f.title,
  f.occurred_at,
  f.reported_at,
  f.status,
  f.severity,
  f.amount,
  f.currency,
  f.charge_id,
  f.payment_status_snapshot
FROM fines f
WHERE f.tenant_id = $1
  AND f.archived_at IS NULL
ORDER BY f.reported_at DESC
LIMIT $2 OFFSET $3;
```

---

## 20.2. Obtener multa por tenant

```sql id="x4phkp"
SELECT *
FROM fines
WHERE tenant_id = $1
  AND id = $2
  AND archived_at IS NULL
LIMIT 1;
```

---

## 20.3. Listar multas propias

```sql id="y7k7s7"
SELECT f.*
FROM fines f
JOIN property_units pu ON pu.id = f.property_unit_id
WHERE f.tenant_id = $1
  AND f.property_unit_id = ANY($2)
  AND f.archived_at IS NULL
ORDER BY f.issued_at DESC NULLS LAST, f.reported_at DESC;
```

Parámetros:

```text id="u5d3fu"
$1 = tenantId
$2 = propertyUnitIds autorizadas para actorUserId
```

---

## 20.4. Verificar evidencia activa requerida

```sql id="m9hdcj"
SELECT COUNT(*) AS active_evidence_count
FROM fine_evidence
WHERE tenant_id = $1
  AND fine_id = $2
  AND status = 'active'
  AND archived_at IS NULL;
```

---

## 20.5. Verificar reclamo abierto

```sql id="igqdni"
SELECT id
FROM fine_appeals
WHERE tenant_id = $1
  AND fine_id = $2
  AND status IN ('submitted', 'underReview')
  AND archived_at IS NULL
LIMIT 1;
```

---

## 20.6. Listar evidencias de multa

```sql id="z9xgkt"
SELECT
  id,
  evidence_type,
  title,
  description,
  file_name,
  mime_type,
  file_size_bytes,
  uploaded_at,
  status
FROM fine_evidence
WHERE tenant_id = $1
  AND fine_id = $2
  AND archived_at IS NULL
ORDER BY uploaded_at DESC;
```

---

## 21. Índices recomendados

## 21.1. `fine_concepts`

```text id="df5p7t"
tenant_id
tenant_id + code
tenant_id + status
tenant_id + category
tenant_id + archived_at
charge_concept_id
```

---

## 21.2. `fines`

```text id="kkn419"
tenant_id
tenant_id + fine_concept_id
tenant_id + property_unit_id
tenant_id + responsible_person_id
tenant_id + status
tenant_id + severity
tenant_id + occurred_at
tenant_id + reported_at
tenant_id + issued_at
tenant_id + charge_id
tenant_id + property_unit_id + status
tenant_id + payment_status_snapshot
charge_id unique
reported_by
reviewed_by
approved_by
rejected_by
issued_by
cancelled_by
waived_by
reversed_by
archived_at
```

---

## 21.3. `fine_evidence`

```text id="ja5xft"
tenant_id
tenant_id + fine_id
tenant_id + evidence_type
tenant_id + status
tenant_id + archived_at
uploaded_by
uploaded_at
```

---

## 21.4. `fine_appeals`

```text id="lthqmp"
tenant_id
tenant_id + fine_id
tenant_id + submitted_by
tenant_id + status
tenant_id + submitted_at
resolved_by
archived_at
```

---

## 21.5. `fine_status_history`

```text id="edsmac"
tenant_id
tenant_id + fine_id
tenant_id + actor_user_id
tenant_id + occurred_at
fine_id + occurred_at
```

---

## 22. Soft delete y archivo

No se debe eliminar físicamente:

```text id="jsdewn"
fine_concepts
fines
fine_evidence
fine_appeals
fine_status_history
```

Regla:

```text id="ehv612"
archivedAt != null representa archivo lógico.
```

Motivos:

* auditoría;
* defensa administrativa;
* trazabilidad de reclamos;
* trazabilidad financiera;
* consistencia con cargos y estados de cuenta;
* soporte a reportes históricos.

---

## 23. Reglas de multitenancy

Todas las tablas nuevas tienen `tenant_id`.

Regla obligatoria:

```text id="jjfn34"
Toda consulta debe filtrar por tenant_id.
```

No se acepta:

```text id="thkz7q"
buscar multa solo por fineId
buscar evidencia solo por evidenceId
buscar reclamo solo por appealId
generar cargo sin validar tenant
usar propertyUnitId de otro tenant
usar responsiblePersonId de otro tenant
usar chargeConceptId de otro tenant
usar chargeId de otro tenant
```

---

## 24. Reglas de ownership

Para endpoints `/me`, el acceso debe validarse contra `003-residents-properties`.

Regla conceptual:

```text id="t6wb9u"
actorUserId -> personId -> active ownership/residency/lease -> propertyUnitId -> fine
```

El usuario puede actuar sobre una multa si:

```text id="nd7w3b"
fine.propertyUnitId está entre las unidades autorizadas del usuario
AND tenant_id coincide
AND relación está activa
AND la política del tenant permite esa acción
```

En MVP, relaciones permitidas sugeridas:

```text id="fy23ur"
owner active
resident active
lease active si tenant permite arrendatarios
```

---

## 25. Reglas de evidencias

## 25.1. Tipos permitidos

```text id="w6mkud"
text
image
document
video
reference
other
```

---

## 25.2. Validación de archivo

Si se usa archivo:

```text id="lr83oj"
fileName requerido
mimeType requerido
fileSizeBytes requerido
fileSizeBytes > 0
mimeType dentro de allowlist
fileSizeBytes dentro de límite configurado
```

MVP sugerido:

```text id="c53wg9"
Permitir evidencia textual y referencias de archivo; diferir subida binaria si storage no está cerrado.
```

---

## 25.3. URL de evidencia

`fileUrl` puede ser:

```text id="mgbxoj"
storage://...
s3://...
https://signed-url-temporal
referencia interna opaca
```

Prohibido persistir como evidencia privada:

```text id="uuwc5x"
URL pública permanente sin control de acceso
tokens en query string persistidos
credentials en URL
```

---

## 25.4. Descarga

La descarga debe resolverse mediante:

```text id="s9xi5f"
FineFileStoragePort.getSignedDownloadUrl(...)
```

o stream controlado.

Reglas:

* validar permisos;
* validar tenant;
* auditar descarga;
* usar expiración;
* no exponer ruta interna persistente.

---

## 26. Reglas de reclamos

## 26.1. Condición para presentar reclamo

Una multa puede reclamarse si:

```text id="q8c4pc"
fine.status = issued
AND fineConcept.allowsAppeal = true
AND actor tiene acceso a propertyUnitId
AND no existe reclamo abierto
AND está dentro del plazo si appealDeadlineDays existe
```

---

## 26.2. Plazo de reclamo

Si `appealDeadlineDays` existe:

```text id="vpeae9"
appealDeadlineAt = fine.issuedAt + appealDeadlineDays
```

Regla:

```text id="nb822i"
submittedAt <= appealDeadlineAt
```

---

## 26.3. Reclamo abierto

Estados considerados abiertos:

```text id="mwe1tu"
submitted
underReview
```

MVP:

```text id="x35jc5"
No permitir más de un reclamo abierto por multa.
```

---

## 26.4. Resolución

Si se acepta:

```text id="c9j1h0"
FineAppeal.status = accepted
Fine.status = appealAccepted
```

Luego la administración puede:

```text id="qzlfky"
waive
reverse
```

Si se rechaza:

```text id="m4po5d"
FineAppeal.status = rejected
Fine.status = appealRejected
```

Luego puede volver a:

```text id="ga7cqk"
issued
```

según política de máquina de estados.

---

## 27. Seeds

## 27.1. Conceptos demo

```text id="xh091d"
fineConceptNoise
fineConceptParkingViolation
fineConceptCommonAreaMisuse
fineConceptPetControl
fineConceptDamage
fineConceptCleanliness
```

---

## 27.2. Multas demo

```text id="ltd6my"
fineReportedNoise
fineUnderReviewParking
fineApprovedCommonAreaMisuse
fineIssuedPetControl
fineRejectedDamage
fineCancelledCleanliness
fineWaivedNoise
fineReversedParking
fineWithCharge
```

---

## 27.3. Evidencias demo

```text id="kn72xh"
fineEvidenceText
fineEvidenceImageReference
fineEvidenceDocumentReference
fineEvidenceArchived
```

---

## 27.4. Reclamos demo

```text id="bksdlv"
fineAppealSubmitted
fineAppealUnderReview
fineAppealAccepted
fineAppealRejected
fineAppealCancelled
```

---

## 27.5. Datos prohibidos en seeds

```text id="tsr324"
nombres reales de residentes
cédulas reales
emails personales reales
teléfonos reales
placas reales
evidencias reales
fotografías reales de personas
videos reales
comprobantes reales
pagos reales
tokens
secretos
cookies
API keys reales
URLs firmadas reales
```

---

## 28. Migración

Nombre sugerido:

```text id="xc5hve"
011_create_fines_sanctions
```

Pasos:

```text id="j364x5"
1. Crear enums.
2. Crear fine_concepts.
3. Crear fines.
4. Crear fine_evidence.
5. Crear fine_appeals.
6. Crear fine_status_history.
7. Crear índices.
8. Crear constraints básicos.
9. Agregar relaciones Prisma.
10. Generar Prisma Client.
11. Ejecutar migración en DB test.
12. Ejecutar seeds demo.
13. Validar tests de repositorio.
```

---

## 29. Migraciones raw opcionales

### 29.1. Validar montos no negativos

```sql id="hdwxpe"
ALTER TABLE fine_concepts
ADD CONSTRAINT fine_concepts_default_amount_non_negative
CHECK (default_amount >= 0);
```

```sql id="c6kr0k"
ALTER TABLE fines
ADD CONSTRAINT fines_amount_non_negative
CHECK (amount >= 0);
```

---

### 29.2. Validar tamaño de archivo

```sql id="ep1it6"
ALTER TABLE fine_evidence
ADD CONSTRAINT fine_evidence_file_size_non_negative
CHECK (file_size_bytes IS NULL OR file_size_bytes >= 0);
```

---

### 29.3. Validar plazo de reclamo

```sql id="s8te6h"
ALTER TABLE fine_concepts
ADD CONSTRAINT fine_concepts_appeal_deadline_non_negative
CHECK (appeal_deadline_days IS NULL OR appeal_deadline_days >= 0);
```

---

### 29.4. Unique parcial para reclamo abierto

Futuro recomendado si se adopta en producción:

```sql id="d23b7c"
CREATE UNIQUE INDEX fine_appeals_one_open_per_fine
ON fine_appeals(fine_id)
WHERE status IN ('submitted', 'underReview')
  AND archived_at IS NULL;
```

Nota:

```text id="gfqp5i"
Puede diferirse si se controla en servicio para MVP, pero debe evaluarse para producción.
```

---

## 30. Auditoría desde modelo

Eventos mínimos:

```text id="q6ght9"
fineConcept.created
fineConcept.updated
fineConcept.activated
fineConcept.deactivated
fineConcept.archived
fine.created
fine.updated
fine.reported
fine.underReview
fine.approved
fine.rejected
fine.issued
fine.disputed
fine.appealAccepted
fine.appealRejected
fine.waived
fine.cancelled
fine.reversed
fine.archived
fine.chargeGenerated
fine.chargeGenerationFailed
fineEvidence.added
fineEvidence.archived
fineEvidence.downloaded
fineAppeal.submitted
fineAppeal.accepted
fineAppeal.rejected
fineAppeal.cancelled
```

Metadata permitida:

```text id="oztvom"
fineId
fineConceptId
propertyUnitId
responsiblePersonId
fromStatus
toStatus
amount
currency
chargeId
reason
appealId
evidenceId
traceId
```

Metadata prohibida:

```text id="w0cwvm"
payload completo
tokens
secretos
cookies
headers completos
archivos completos
comprobantes
datos personales innecesarios
detalles extensos de evidencia
```

---

## 31. Seguridad del modelo

## 31.1. Prohibiciones

El modelo no debe permitir:

```text id="vqae00"
multas sin tenant_id
conceptos sin tenant_id
evidencias sin tenant_id
reclamos sin tenant_id
historial sin tenant_id
multas monetarias sin property_unit_id
multas con property_unit_id de otro tenant
multas con responsible_person_id de otro tenant
conceptos con charge_concept_id de otro tenant
multas con charge_id de otro tenant
float para dinero
eliminación física de historial
exposición pública de multas
exposición pública de evidencias
```

---

## 31.2. Datos personales

Campos sensibles o privados:

```text id="ivjn1n"
propertyUnitId
propertyUnitCode
responsiblePersonId
title
description
occurredAt
reportedAt
evidence
appeal reason
review notes
rejection reason
cancellation reason
waiver reason
reversal reason
metadata
```

Reglas:

* no exponer en WordPress;
* no exponer a usuarios no autorizados;
* evidencias tienen acceso restringido;
* logs no deben incluir evidencia completa;
* audit metadata debe ser mínima.

---

## 31.3. Datos financieros

Campos financieros:

```text id="ryp1b0"
defaultAmount
amount
currency
chargeConceptId
chargeId
paymentStatusSnapshot
dueDate
```

Reglas:

* usar Decimal;
* API devuelve string;
* `chargeId` no se expone sin permiso;
* pagos no se procesan en este módulo;
* condonación/reverso no modifica pagos automáticamente.

---

## 31.4. Datos prohibidos en metadata

No guardar en `metadata`:

```text id="yd3c31"
passwords
tokens
api keys
client secrets
cookies
authorization headers
connection strings
file binary content
receipt content
full request payload
full audit payload
personal data masiva
financial snapshots completos
```

---

## 32. Testing del modelo

## 32.1. Unit tests

```text id="jp406y"
FineConcept entity
Fine entity
FineEvidence entity
FineAppeal entity
FineStatusHistory entity
FineConceptCode
FineConceptStatus
FineCategory
FineStatus
FineSeverity
FineMoney
FineTitle
FineDescription
FineReason
FineEvidenceType
FineEvidenceStatus
FineAppealStatus
FinePaymentStatusSnapshot
FineStateMachine
```

---

## 32.2. Repository tests

```text id="mujib3"
create fine concept
list fine concepts by tenant
find fine concept by code
archive fine concept
create fine
list fines by tenant
list own fines
find fine by id and tenant
attach charge
create evidence
list evidence by fine
create appeal
find open appeal
create status history
```

---

## 32.3. Multitenancy tests

```text id="hqvj0w"
tenant A no ve fine concepts tenant B
tenant A no ve fines tenant B
tenant A no ve evidence tenant B
tenant A no ve appeals tenant B
tenant A no usa propertyUnitId tenant B
tenant A no usa responsiblePersonId tenant B
tenant A no usa chargeConceptId tenant B
tenant A no usa chargeId tenant B
```

---

## 32.4. Financial regression tests

```text id="snl5g2"
defaultAmount se guarda Decimal
amount se guarda Decimal
amount sale string
cargo se genera una sola vez
chargeId único
multa emitida genera cargo si amount > 0
multa amount 0 no genera cargo
reclamo no revierte cargo automáticamente
condonación no borra cargo
pagos no se modifican desde multas
```

---

## 32.5. Evidence security tests

```text id="wibcvg"
evidencia no se lista para usuario sin permiso
evidencia no se descarga sin permiso
evidencia de tenant B no se descarga desde tenant A
fileUrl privada no se expone directamente
download genera URL temporal si aplica
download se audita
```

---

## 33. Decisión final del modelo

El módulo `011-fines-sanctions` usará las siguientes tablas:

```text id="cyi6nr"
fine_concepts
fines
fine_evidence
fine_appeals
fine_status_history
```

El modelo garantiza:

```text id="k4ndnr"
tenant isolation
conceptos de multa configurables
multas asociadas a unidad
responsable opcional
evidencias controladas
reclamos básicos
estado controlado
historial funcional
integración financiera opcional
idempotencia de cargo
protección de datos personales
protección de evidencias
auditoría completa
no exposición pública
```

La implementación no debe aceptarse si:

```text id="e6udpj"
permite multas cross-tenant
permite multas monetarias sin unidad
permite usar unidades de otro tenant
permite usar responsables de otro tenant
permite usar conceptos financieros de otro tenant
genera cargos duplicados
usa float para dinero
expone evidencias sin permiso
expone multas a WordPress
procesa pagos directamente
modifica estados de cuenta directamente
borra historial
modifica silenciosamente multas emitidas
```

---

## 34. Pendientes para evolución

Quedan diferidos:

```text id="ydrd9v"
notificaciones automáticas
documentos PDF formales
firma electrónica
reclamos avanzados
audiencias
aprobación por comité
votación de sanciones
reincidencia automática
tarifas progresivas
integración con cámaras
OCR de evidencias
IA para revisión asistida
multas automáticas por mora
restricciones automáticas de reservas
pagos online de multas
conciliación específica de multas
publicación controlada de sanciones
```

Estos diferidos no bloquean el MVP de `011-fines-sanctions`.
