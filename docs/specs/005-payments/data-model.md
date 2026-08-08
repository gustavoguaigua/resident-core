# Data Model — Spec 005 Payments, Receipts and Payment Allocation

## 1. Información del documento

| Campo                  | Valor                                                                         |
| ---------------------- | ----------------------------------------------------------------------------- |
| Proyecto               | RESIDENT Core                                                                 |
| Spec ID                | 005                                                                           |
| Módulo                 | Payments                                                                      |
| Documento              | Data Model                                                                    |
| Ruta                   | `docs/specs/005-payments/data-model.md`                                       |
| Versión                | 0.1                                                                           |
| Estado                 | Borrador inicial                                                              |
| Fecha                  | 2026-07-14                                                                    |
| Documento base         | `docs/specs/005-payments/spec.md`                                             |
| Plan técnico           | `docs/specs/005-payments/plan.md`                                             |
| Depende de             | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees` |
| Base de datos          | PostgreSQL                                                                    |
| ORM                    | Prisma                                                                        |
| Estrategia multitenant | Shared database + shared schema + `tenant_id`                                 |
| Precisión monetaria    | Decimal                                                                       |
| Moneda MVP             | USD                                                                           |

---

## 2. Propósito

Este documento define el modelo de datos de la spec `005-payments`.

El objetivo es establecer:

* tablas;
* columnas;
* enums;
* relaciones;
* constraints;
* índices;
* claves de idempotencia;
* modelo Prisma preliminar;
* reglas de precisión monetaria;
* reglas de asignación de pagos;
* reglas de comprobantes;
* reglas de reverso;
* reglas multitenant;
* reglas de acceso propio;
* reglas de auditoría;
* seeds iniciales;
* compatibilidad con estados de cuenta y conciliación bancaria futura.

Este módulo usa los cargos generados por `004-dues-fees` y permite registrar pagos contra ellos.

---

## 3. Principios del modelo

### 3.1. Tenant como frontera financiera

Todo registro de pagos debe tener:

```text id="hoxc3z"
tenant_id
```

Aplica a:

```text id="uut4f1"
payments
payment_receipts
payment_allocations
payment_reversals
```

Regla:

```text id="b22xgs"
Nunca se debe crear, consultar, confirmar, rechazar, asignar, reversar o descargar información de pago sin validar tenant_id.
```

---

### 3.2. Unidad habitacional como base del pago

Todo `Payment` debe estar asociado a una unidad habitacional:

```text id="w6azuk"
property_unit_id
```

La unidad debe pertenecer al mismo tenant.

---

### 3.3. Cargo como destino de asignación

Todo `PaymentAllocation` debe estar asociado a un `Charge`.

Regla:

```text id="ch21eb"
PaymentAllocation.charge_id debe apuntar a un cargo del mismo tenant.
```

En MVP:

```text id="z7s08s"
Payment.propertyUnitId == Charge.propertyUnitId
```

---

### 3.4. Precisión monetaria

Los montos se almacenan como Decimal.

Prohibido:

```text id="gstdq8"
float
double
number para cálculos monetarios sin Decimal
```

Regla de persistencia recomendada:

```text id="bzr2y7"
DECIMAL(12,2)
```

---

### 3.5. No eliminación física

No se elimina físicamente:

* pago;
* comprobante;
* asignación;
* reverso.

Se usan estados y marcas temporales:

```text id="z3tkxy"
status
rejected_at
cancelled_at
reversed_at
archived_at
```

---

### 3.6. Monto original del pago inmutable

El monto original del pago debe conservarse.

Regla:

```text id="dzcehz"
Payment.amount no se sobrescribe.
```

Los cambios operativos se reflejan mediante:

```text id="lr1i9c"
allocated_amount
unallocated_amount
payment_allocations
payment_reversals
status
```

---

### 3.7. Estado de cuenta reconstruible

Los saldos futuros deben poder reconstruirse desde:

```text id="f3sphn"
charges
charge_adjustments
charge_reversals
payments
payment_allocations
payment_reversals
```

Este módulo no genera estados de cuenta consolidados, pero debe dejar datos suficientes para `006-account-statements`.

---

## 4. Entidades persistentes

El módulo define las siguientes entidades:

```text id="g3hsf3"
Payment
PaymentReceipt
PaymentAllocation
PaymentReversal
```

Entidad diferida:

```text id="ru66pm"
PaymentMethod
```

Relación conceptual:

```text id="tvdtvs"
Tenant
├── PropertyUnit
│   └── Payment
│       ├── PaymentReceipt
│       ├── PaymentAllocation
│       │   └── Charge
│       └── PaymentReversal
```

---

## 5. Tabla `payments`

### 5.1. Propósito

Representa un pago recibido o reportado por una unidad habitacional.

Puede ser creado por administración o reportado por propietario/residente.

---

### 5.2. Nombre físico

```text id="ot5xjc"
payments
```

---

### 5.3. Columnas

| Columna                 |    Tipo lógico | Requerido |           Default | Descripción                              |
| ----------------------- | -------------: | --------: | ----------------: | ---------------------------------------- |
| `id`                    |    UUID/string |        Sí |              uuid | Identificador interno                    |
| `tenant_id`             |    UUID/string |        Sí |                 — | Tenant propietario                       |
| `property_unit_id`      |    UUID/string |        Sí |                 — | Unidad asociada                          |
| `reported_by`           |    UUID/string |        No |              null | Usuario que reportó el pago              |
| `created_by`            |    UUID/string |        Sí |                 — | Usuario que creó el pago                 |
| `method`                |           enum |        Sí |                 — | Método de pago                           |
| `amount`                |  Decimal(12,2) |        Sí |                 — | Monto original del pago                  |
| `allocated_amount`      |  Decimal(12,2) |        Sí |              0.00 | Monto asignado a cargos                  |
| `unallocated_amount`    |  Decimal(12,2) |        Sí |                 — | Monto disponible                         |
| `currency`              |    enum/string |        Sí |               USD | Moneda                                   |
| `paid_at`               | timestamp/date |        Sí |                 — | Fecha en que se realizó el pago          |
| `reported_at`           |      timestamp |        No |              null | Fecha de reporte por usuario             |
| `confirmed_at`          |      timestamp |        No |              null | Fecha de confirmación                    |
| `confirmed_by`          |    UUID/string |        No |              null | Usuario que confirmó                     |
| `rejected_at`           |      timestamp |        No |              null | Fecha de rechazo                         |
| `rejected_by`           |    UUID/string |        No |              null | Usuario que rechazó                      |
| `rejection_reason`      |         string |        No |              null | Motivo de rechazo                        |
| `cancelled_at`          |      timestamp |        No |              null | Fecha de cancelación                     |
| `cancelled_by`          |    UUID/string |        No |              null | Usuario que canceló                      |
| `cancellation_reason`   |         string |        No |              null | Motivo de cancelación                    |
| `status`                |           enum |        Sí | pendingValidation | Estado                                   |
| `transaction_reference` |         string |        No |              null | Referencia de transacción                |
| `external_reference`    |         string |        No |              null | Referencia externa                       |
| `idempotency_key`       |         string |        No |              null | Clave idempotente                        |
| `notes`                 |         string |        No |              null | Notas internas o visibles según política |
| `created_at`            |      timestamp |        Sí |               now | Fecha de creación                        |
| `updated_at`            |      timestamp |        Sí |              auto | Fecha de actualización                   |
| `archived_at`           |      timestamp |        No |              null | Archivado lógico                         |

---

### 5.4. Reglas

* `tenant_id` obligatorio.
* `property_unit_id` obligatorio.
* Unidad debe pertenecer al tenant.
* `created_by` obligatorio.
* `reported_by` opcional.
* `amount` debe ser Decimal positivo.
* `allocated_amount >= 0`.
* `unallocated_amount >= 0`.
* `allocated_amount + unallocated_amount = amount` para pagos no reversados ni rechazados.
* `currency = USD` en MVP.
* `paid_at` obligatorio.
* `transaction_reference` recomendado para transferencias y depósitos.
* `idempotency_key` único por tenant si existe.
* No eliminar físicamente.
* No sobrescribir `amount`.
* Un pago rechazado no puede tener asignaciones activas.
* Un pago reversado no puede tener asignaciones activas.

---

### 5.5. Índices

```text id="yqhthm"
index payments_tenant_id_idx on payments(tenant_id)
index payments_property_unit_id_idx on payments(property_unit_id)
index payments_status_idx on payments(status)
index payments_method_idx on payments(method)
index payments_paid_at_idx on payments(paid_at)
index payments_created_by_idx on payments(created_by)
index payments_reported_by_idx on payments(reported_by)
index payments_confirmed_by_idx on payments(confirmed_by)
index payments_rejected_by_idx on payments(rejected_by)
index payments_tenant_unit_status_idx on payments(tenant_id, property_unit_id, status)
unique index payments_tenant_idempotency_key_unique on payments(tenant_id, idempotency_key)
```

---

## 6. Tabla `payment_receipts`

### 6.1. Propósito

Representa comprobante, evidencia o referencia asociada a un pago.

Puede ser un archivo privado, una imagen, un PDF o una referencia textual.

---

### 6.2. Nombre físico

```text id="sj7z8k"
payment_receipts
```

---

### 6.3. Columnas

| Columna                 | Tipo lógico | Requerido | Default | Descripción                      |
| ----------------------- | ----------: | --------: | ------: | -------------------------------- |
| `id`                    | UUID/string |        Sí |    uuid | Identificador                    |
| `tenant_id`             | UUID/string |        Sí |       — | Tenant                           |
| `payment_id`            | UUID/string |        Sí |       — | Pago asociado                    |
| `file_id`               |      string |        No |    null | ID de archivo en storage privado |
| `file_name`             |      string |        No |    null | Nombre sanitizado                |
| `mime_type`             |      string |        No |    null | Tipo MIME                        |
| `file_size`             |     integer |        No |    null | Tamaño en bytes                  |
| `receipt_number`        |      string |        No |    null | Número de comprobante            |
| `transaction_reference` |      string |        No |    null | Referencia de transacción        |
| `status`                |        enum |        Sí | pending | Estado                           |
| `uploaded_by`           | UUID/string |        Sí |       — | Usuario que subió                |
| `uploaded_at`           |   timestamp |        Sí |     now | Fecha de subida                  |
| `reviewed_by`           | UUID/string |        No |    null | Usuario que revisó               |
| `reviewed_at`           |   timestamp |        No |    null | Fecha de revisión                |
| `rejection_reason`      |      string |        No |    null | Motivo de rechazo                |
| `created_at`            |   timestamp |        Sí |     now | Creación                         |
| `archived_at`           |   timestamp |        No |    null | Archivado lógico                 |

---

### 6.4. Reglas

* Pertenece a tenant.
* Pertenece a un pago del mismo tenant.
* Debe tener al menos `file_id`, `receipt_number` o `transaction_reference`.
* Archivo, si existe, debe estar en storage privado.
* No almacenar contenido binario en base de datos.
* No exponer URL pública permanente.
* `uploaded_by` obligatorio.
* Revisión con `reviewed_by` y `reviewed_at`.
* Rechazo requiere motivo.
* No eliminación física ordinaria.

---

### 6.5. Índices

```text id="i1e687"
index payment_receipts_tenant_id_idx on payment_receipts(tenant_id)
index payment_receipts_payment_id_idx on payment_receipts(payment_id)
index payment_receipts_uploaded_by_idx on payment_receipts(uploaded_by)
index payment_receipts_reviewed_by_idx on payment_receipts(reviewed_by)
index payment_receipts_status_idx on payment_receipts(status)
index payment_receipts_transaction_reference_idx on payment_receipts(transaction_reference)
```

---

## 7. Tabla `payment_allocations`

### 7.1. Propósito

Representa asignación de un pago a un cargo.

Permite:

* pagos parciales;
* varios pagos sobre un cargo;
* un pago distribuido en varios cargos;
* reverso de asignaciones;
* trazabilidad para estados de cuenta.

---

### 7.2. Nombre físico

```text id="tunrpz"
payment_allocations
```

---

### 7.3. Columnas

| Columna            |   Tipo lógico | Requerido | Default | Descripción         |
| ------------------ | ------------: | --------: | ------: | ------------------- |
| `id`               |   UUID/string |        Sí |    uuid | Identificador       |
| `tenant_id`        |   UUID/string |        Sí |       — | Tenant              |
| `payment_id`       |   UUID/string |        Sí |       — | Pago                |
| `charge_id`        |   UUID/string |        Sí |       — | Cargo               |
| `property_unit_id` |   UUID/string |        Sí |       — | Unidad asociada     |
| `amount`           | Decimal(12,2) |        Sí |       — | Monto asignado      |
| `currency`         |   enum/string |        Sí |     USD | Moneda              |
| `status`           |          enum |        Sí |  active | Estado              |
| `allocated_by`     |   UUID/string |        Sí |       — | Usuario que asignó  |
| `allocated_at`     |     timestamp |        Sí |     now | Fecha de asignación |
| `reversed_at`      |     timestamp |        No |    null | Fecha de reverso    |
| `reversed_by`      |   UUID/string |        No |    null | Usuario que reversó |
| `reversal_reason`  |        string |        No |    null | Motivo de reverso   |
| `created_at`       |     timestamp |        Sí |     now | Creación            |
| `archived_at`      |     timestamp |        No |    null | Archivado lógico    |

---

### 7.4. Reglas

* Pertenece a tenant.
* Pago pertenece al mismo tenant.
* Cargo pertenece al mismo tenant.
* Unidad pertenece al mismo tenant.
* En MVP, pago y cargo deben ser de la misma unidad.
* `amount` Decimal positivo.
* `currency = USD`.
* La suma de asignaciones activas del pago no puede exceder `Payment.amount`.
* La suma de asignaciones activas del cargo no puede exceder `Charge.effectiveAmount`.
* No eliminación física.
* Reverso marca `status = reversed`.

---

### 7.5. Índices

```text id="aa7xkc"
index payment_allocations_tenant_id_idx on payment_allocations(tenant_id)
index payment_allocations_payment_id_idx on payment_allocations(payment_id)
index payment_allocations_charge_id_idx on payment_allocations(charge_id)
index payment_allocations_property_unit_id_idx on payment_allocations(property_unit_id)
index payment_allocations_status_idx on payment_allocations(status)
index payment_allocations_allocated_by_idx on payment_allocations(allocated_by)
index payment_allocations_tenant_payment_status_idx on payment_allocations(tenant_id, payment_id, status)
index payment_allocations_tenant_charge_status_idx on payment_allocations(tenant_id, charge_id, status)
```

---

## 8. Tabla `payment_reversals`

### 8.1. Propósito

Registra reverso formal de un pago.

El reverso no elimina el pago; deja trazabilidad y desactiva sus asignaciones.

---

### 8.2. Nombre físico

```text id="ut7laq"
payment_reversals
```

---

### 8.3. Columnas

| Columna       | Tipo lógico | Requerido | Default | Descripción      |
| ------------- | ----------: | --------: | ------: | ---------------- |
| `id`          | UUID/string |        Sí |    uuid | Identificador    |
| `tenant_id`   | UUID/string |        Sí |       — | Tenant           |
| `payment_id`  | UUID/string |        Sí |       — | Pago reversado   |
| `reason`      |      string |        Sí |       — | Motivo           |
| `reversed_by` | UUID/string |        Sí |       — | Usuario          |
| `reversed_at` |   timestamp |        Sí |     now | Fecha de reverso |
| `created_at`  |   timestamp |        Sí |     now | Creación         |
| `trace_id`    |      string |        No |    null | Trace            |

---

### 8.4. Reglas

* Pertenece a tenant.
* Pago pertenece al mismo tenant.
* Un pago solo puede tener un reverso en MVP.
* `reason` obligatorio.
* `reversed_by` obligatorio.
* No eliminar físicamente.
* Al reversar, `Payment.status = reversed`.
* Se deben reversar asignaciones activas.

---

### 8.5. Índices

```text id="d74mbk"
index payment_reversals_tenant_id_idx on payment_reversals(tenant_id)
index payment_reversals_payment_id_idx on payment_reversals(payment_id)
index payment_reversals_reversed_by_idx on payment_reversals(reversed_by)
unique index payment_reversals_tenant_payment_unique on payment_reversals(tenant_id, payment_id)
```

---

## 9. Tabla diferida `payment_methods`

### 9.1. Estado

```text id="y1huhm"
Deferred
```

---

### 9.2. Motivo

En MVP, los métodos de pago se implementan como enum porque no se requiere todavía configuración avanzada por tenant.

---

### 9.3. Modelo futuro

```text id="ckmdkx"
payment_methods
├── id
├── tenant_id
├── type
├── name
├── description
├── is_active
├── requires_receipt
├── requires_transaction_reference
├── instructions
├── created_at
└── updated_at
```

---

### 9.4. Cuándo implementarla

Implementar tabla real si se requiere:

* configurar cuentas bancarias por tenant;
* instrucciones de pago por método;
* activar/desactivar métodos por tenant;
* reglas distintas por método;
* integración bancaria;
* pasarela en línea.

---

## 10. Enums

## 10.1. `PaymentStatus`

```text id="k8b2qy"
draft
reported
pendingValidation
confirmed
partiallyAllocated
allocated
rejected
cancelled
reversed
archived
```

Prisma:

```prisma id="vs94kf"
enum PaymentStatus {
  DRAFT               @map("draft")
  REPORTED            @map("reported")
  PENDING_VALIDATION  @map("pendingValidation")
  CONFIRMED           @map("confirmed")
  PARTIALLY_ALLOCATED @map("partiallyAllocated")
  ALLOCATED           @map("allocated")
  REJECTED            @map("rejected")
  CANCELLED           @map("cancelled")
  REVERSED            @map("reversed")
  ARCHIVED            @map("archived")

  @@map("payment_status")
}
```

---

## 10.2. `PaymentMethodType`

```text id="m5fj4y"
cash
bankTransfer
deposit
check
online
other
```

Prisma:

```prisma id="juzqwy"
enum PaymentMethodType {
  CASH          @map("cash")
  BANK_TRANSFER @map("bankTransfer")
  DEPOSIT       @map("deposit")
  CHECK         @map("check")
  ONLINE        @map("online")
  OTHER         @map("other")

  @@map("payment_method_type")
}
```

---

## 10.3. `PaymentReceiptStatus`

```text id="cvg8pe"
pending
uploaded
accepted
rejected
archived
```

Prisma:

```prisma id="pf2rka"
enum PaymentReceiptStatus {
  PENDING  @map("pending")
  UPLOADED @map("uploaded")
  ACCEPTED @map("accepted")
  REJECTED @map("rejected")
  ARCHIVED @map("archived")

  @@map("payment_receipt_status")
}
```

---

## 10.4. `PaymentAllocationStatus`

```text id="j5fqm7"
active
reversed
cancelled
archived
```

Prisma:

```prisma id="cpmy1z"
enum PaymentAllocationStatus {
  ACTIVE    @map("active")
  REVERSED  @map("reversed")
  CANCELLED @map("cancelled")
  ARCHIVED  @map("archived")

  @@map("payment_allocation_status")
}
```

---

## 10.5. `PaymentReversalStatus`

Para MVP puede omitirse porque `payment_reversals` registra reversos completados.

Si se decide incluirlo:

```text id="hj8x0h"
completed
cancelled
```

Prisma opcional:

```prisma id="go1tkw"
enum PaymentReversalStatus {
  COMPLETED @map("completed")
  CANCELLED @map("cancelled")

  @@map("payment_reversal_status")
}
```

---

## 10.6. `CurrencyCode`

Reutilizar enum de `004-dues-fees`:

```text id="mcd2ho"
USD
```

Si ya existe en Prisma, no duplicarlo.

---

## 11. Modelo Prisma completo propuesto

```prisma id="m3sa56"
enum PaymentStatus {
  DRAFT               @map("draft")
  REPORTED            @map("reported")
  PENDING_VALIDATION  @map("pendingValidation")
  CONFIRMED           @map("confirmed")
  PARTIALLY_ALLOCATED @map("partiallyAllocated")
  ALLOCATED           @map("allocated")
  REJECTED            @map("rejected")
  CANCELLED           @map("cancelled")
  REVERSED            @map("reversed")
  ARCHIVED            @map("archived")

  @@map("payment_status")
}

enum PaymentMethodType {
  CASH          @map("cash")
  BANK_TRANSFER @map("bankTransfer")
  DEPOSIT       @map("deposit")
  CHECK         @map("check")
  ONLINE        @map("online")
  OTHER         @map("other")

  @@map("payment_method_type")
}

enum PaymentReceiptStatus {
  PENDING  @map("pending")
  UPLOADED @map("uploaded")
  ACCEPTED @map("accepted")
  REJECTED @map("rejected")
  ARCHIVED @map("archived")

  @@map("payment_receipt_status")
}

enum PaymentAllocationStatus {
  ACTIVE    @map("active")
  REVERSED  @map("reversed")
  CANCELLED @map("cancelled")
  ARCHIVED  @map("archived")

  @@map("payment_allocation_status")
}
```

```prisma id="bnrbzm"
model Payment {
  id                   String              @id @default(uuid())
  tenantId             String              @map("tenant_id")
  propertyUnitId       String              @map("property_unit_id")

  reportedBy           String?             @map("reported_by")
  createdBy            String              @map("created_by")

  method               PaymentMethodType
  amount               Decimal             @db.Decimal(12, 2)
  allocatedAmount      Decimal             @default(0) @map("allocated_amount") @db.Decimal(12, 2)
  unallocatedAmount    Decimal             @map("unallocated_amount") @db.Decimal(12, 2)
  currency             CurrencyCode        @default(USD)

  paidAt               DateTime            @map("paid_at")
  reportedAt           DateTime?           @map("reported_at")

  confirmedAt          DateTime?           @map("confirmed_at")
  confirmedBy          String?             @map("confirmed_by")

  rejectedAt           DateTime?           @map("rejected_at")
  rejectedBy           String?             @map("rejected_by")
  rejectionReason      String?             @map("rejection_reason")

  cancelledAt          DateTime?           @map("cancelled_at")
  cancelledBy          String?             @map("cancelled_by")
  cancellationReason   String?             @map("cancellation_reason")

  status               PaymentStatus       @default(PENDING_VALIDATION)
  transactionReference String?             @map("transaction_reference")
  externalReference    String?             @map("external_reference")
  idempotencyKey       String?             @map("idempotency_key")
  notes                String?

  createdAt            DateTime            @default(now()) @map("created_at")
  updatedAt            DateTime            @updatedAt @map("updated_at")
  archivedAt           DateTime?           @map("archived_at")

  tenant               Tenant              @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  propertyUnit         PropertyUnit        @relation(fields: [propertyUnitId], references: [id], onDelete: Restrict)

  reportedByUser       UserProfile?        @relation("PaymentReportedBy", fields: [reportedBy], references: [id], onDelete: Restrict)
  createdByUser        UserProfile         @relation("PaymentCreatedBy", fields: [createdBy], references: [id], onDelete: Restrict)
  confirmedByUser      UserProfile?        @relation("PaymentConfirmedBy", fields: [confirmedBy], references: [id], onDelete: Restrict)
  rejectedByUser       UserProfile?        @relation("PaymentRejectedBy", fields: [rejectedBy], references: [id], onDelete: Restrict)
  cancelledByUser      UserProfile?        @relation("PaymentCancelledBy", fields: [cancelledBy], references: [id], onDelete: Restrict)

  receipts             PaymentReceipt[]
  allocations          PaymentAllocation[]
  reversals            PaymentReversal[]

  @@unique([tenantId, idempotencyKey])
  @@index([tenantId])
  @@index([propertyUnitId])
  @@index([status])
  @@index([method])
  @@index([paidAt])
  @@index([createdBy])
  @@index([reportedBy])
  @@index([confirmedBy])
  @@index([rejectedBy])
  @@index([tenantId, propertyUnitId, status])
  @@map("payments")
}
```

```prisma id="pmz5f1"
model PaymentReceipt {
  id                   String               @id @default(uuid())
  tenantId             String               @map("tenant_id")
  paymentId            String               @map("payment_id")

  fileId               String?              @map("file_id")
  fileName             String?              @map("file_name")
  mimeType             String?              @map("mime_type")
  fileSize             Int?                 @map("file_size")
  receiptNumber        String?              @map("receipt_number")
  transactionReference String?              @map("transaction_reference")

  status               PaymentReceiptStatus @default(PENDING)
  uploadedBy           String               @map("uploaded_by")
  uploadedAt           DateTime             @default(now()) @map("uploaded_at")

  reviewedBy           String?              @map("reviewed_by")
  reviewedAt           DateTime?            @map("reviewed_at")
  rejectionReason      String?              @map("rejection_reason")

  createdAt            DateTime             @default(now()) @map("created_at")
  archivedAt           DateTime?            @map("archived_at")

  tenant               Tenant               @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  payment              Payment              @relation(fields: [paymentId], references: [id], onDelete: Restrict)

  uploadedByUser       UserProfile          @relation("PaymentReceiptUploadedBy", fields: [uploadedBy], references: [id], onDelete: Restrict)
  reviewedByUser       UserProfile?         @relation("PaymentReceiptReviewedBy", fields: [reviewedBy], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([paymentId])
  @@index([uploadedBy])
  @@index([reviewedBy])
  @@index([status])
  @@index([transactionReference])
  @@map("payment_receipts")
}
```

```prisma id="ulb92v"
model PaymentAllocation {
  id              String                  @id @default(uuid())
  tenantId        String                  @map("tenant_id")
  paymentId       String                  @map("payment_id")
  chargeId        String                  @map("charge_id")
  propertyUnitId  String                  @map("property_unit_id")

  amount          Decimal                 @db.Decimal(12, 2)
  currency        CurrencyCode            @default(USD)
  status          PaymentAllocationStatus @default(ACTIVE)

  allocatedBy     String                  @map("allocated_by")
  allocatedAt     DateTime                @default(now()) @map("allocated_at")

  reversedAt      DateTime?               @map("reversed_at")
  reversedBy      String?                 @map("reversed_by")
  reversalReason  String?                 @map("reversal_reason")

  createdAt       DateTime                @default(now()) @map("created_at")
  archivedAt      DateTime?               @map("archived_at")

  tenant          Tenant                  @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  payment         Payment                 @relation(fields: [paymentId], references: [id], onDelete: Restrict)
  charge          Charge                  @relation(fields: [chargeId], references: [id], onDelete: Restrict)
  propertyUnit    PropertyUnit            @relation(fields: [propertyUnitId], references: [id], onDelete: Restrict)

  allocatedByUser UserProfile             @relation("PaymentAllocationAllocatedBy", fields: [allocatedBy], references: [id], onDelete: Restrict)
  reversedByUser  UserProfile?            @relation("PaymentAllocationReversedBy", fields: [reversedBy], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([paymentId])
  @@index([chargeId])
  @@index([propertyUnitId])
  @@index([status])
  @@index([allocatedBy])
  @@index([tenantId, paymentId, status])
  @@index([tenantId, chargeId, status])
  @@map("payment_allocations")
}
```

```prisma id="q3dj8b"
model PaymentReversal {
  id             String      @id @default(uuid())
  tenantId       String      @map("tenant_id")
  paymentId      String      @map("payment_id")

  reason         String
  reversedBy     String      @map("reversed_by")
  reversedAt     DateTime    @default(now()) @map("reversed_at")
  createdAt      DateTime    @default(now()) @map("created_at")
  traceId        String?     @map("trace_id")

  tenant         Tenant      @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  payment        Payment     @relation(fields: [paymentId], references: [id], onDelete: Restrict)
  reversedByUser UserProfile @relation("PaymentReversalReversedBy", fields: [reversedBy], references: [id], onDelete: Restrict)

  @@unique([tenantId, paymentId])
  @@index([tenantId])
  @@index([paymentId])
  @@index([reversedBy])
  @@map("payment_reversals")
}
```

---

## 12. Cambios requeridos en modelos existentes

### 12.1. Modelo `Tenant`

Agregar relaciones inversas:

```prisma id="yfkmmw"
model Tenant {
  // campos existentes...

  payments           Payment[]
  paymentReceipts    PaymentReceipt[]
  paymentAllocations PaymentAllocation[]
  paymentReversals   PaymentReversal[]
}
```

---

### 12.2. Modelo `PropertyUnit`

Agregar relaciones inversas:

```prisma id="wnhfdg"
model PropertyUnit {
  // campos existentes...

  payments           Payment[]
  paymentAllocations PaymentAllocation[]
}
```

---

### 12.3. Modelo `Charge`

Agregar relación inversa:

```prisma id="cp2ozj"
model Charge {
  // campos existentes...

  paymentAllocations PaymentAllocation[]
}
```

---

### 12.4. Modelo `UserProfile`

Agregar relaciones inversas:

```prisma id="wwglcr"
model UserProfile {
  // campos existentes...

  reportedPayments           Payment[]           @relation("PaymentReportedBy")
  createdPayments            Payment[]           @relation("PaymentCreatedBy")
  confirmedPayments          Payment[]           @relation("PaymentConfirmedBy")
  rejectedPayments           Payment[]           @relation("PaymentRejectedBy")
  cancelledPayments          Payment[]           @relation("PaymentCancelledBy")

  uploadedPaymentReceipts    PaymentReceipt[]    @relation("PaymentReceiptUploadedBy")
  reviewedPaymentReceipts    PaymentReceipt[]    @relation("PaymentReceiptReviewedBy")

  allocatedPayments          PaymentAllocation[] @relation("PaymentAllocationAllocatedBy")
  reversedPaymentAllocations PaymentAllocation[] @relation("PaymentAllocationReversedBy")

  paymentReversals           PaymentReversal[]   @relation("PaymentReversalReversedBy")
}
```

---

## 13. Constraints recomendadas mediante SQL manual

### 13.1. Monto de pago positivo

```sql id="cmk7x9"
ALTER TABLE payments
ADD CONSTRAINT payments_amount_positive_check
CHECK (amount > 0);
```

---

### 13.2. Montos asignados no negativos

```sql id="jxz0tb"
ALTER TABLE payments
ADD CONSTRAINT payments_allocated_amount_non_negative_check
CHECK (allocated_amount >= 0);
```

---

### 13.3. Monto no asignado no negativo

```sql id="ex88dc"
ALTER TABLE payments
ADD CONSTRAINT payments_unallocated_amount_non_negative_check
CHECK (unallocated_amount >= 0);
```

---

### 13.4. Relación entre monto, asignado y no asignado

```sql id="l8r9qm"
ALTER TABLE payments
ADD CONSTRAINT payments_amount_allocation_balance_check
CHECK (
  allocated_amount + unallocated_amount = amount
  OR status IN ('rejected', 'cancelled', 'reversed', 'archived')
);
```

---

### 13.5. Idempotency key no vacía si existe

```sql id="x6hoec"
ALTER TABLE payments
ADD CONSTRAINT payments_idempotency_key_not_empty_check
CHECK (
  idempotency_key IS NULL OR length(trim(idempotency_key)) > 0
);
```

---

### 13.6. PaymentReceipt debe tener evidencia

```sql id="blt2ew"
ALTER TABLE payment_receipts
ADD CONSTRAINT payment_receipts_has_evidence_check
CHECK (
  file_id IS NOT NULL
  OR receipt_number IS NOT NULL
  OR transaction_reference IS NOT NULL
);
```

---

### 13.7. Tamaño de archivo positivo

```sql id="mld7q0"
ALTER TABLE payment_receipts
ADD CONSTRAINT payment_receipts_file_size_positive_check
CHECK (
  file_size IS NULL OR file_size > 0
);
```

---

### 13.8. Monto de asignación positivo

```sql id="qri5gl"
ALTER TABLE payment_allocations
ADD CONSTRAINT payment_allocations_amount_positive_check
CHECK (amount > 0);
```

---

### 13.9. Reversal reason requerido

```sql id="bxwsry"
ALTER TABLE payment_reversals
ADD CONSTRAINT payment_reversals_reason_not_empty_check
CHECK (length(trim(reason)) > 0);
```

---

## 14. Reglas que deben validarse en aplicación

Estas reglas no deben depender solo de la base de datos:

```text id="apv8cs"
- payment.tenantId == currentTenant.id
- payment.propertyUnit.tenantId == currentTenant.id
- receipt.payment.tenantId == receipt.tenantId
- allocation.payment.tenantId == allocation.tenantId
- allocation.charge.tenantId == allocation.tenantId
- allocation.propertyUnit.tenantId == allocation.tenantId
- allocation.payment.propertyUnitId == allocation.propertyUnitId
- allocation.charge.propertyUnitId == allocation.propertyUnitId
- reversal.payment.tenantId == reversal.tenantId
- solo Payment confirmed puede asignarse
- Payment rejected no puede asignarse
- Payment reversed no puede asignarse
- suma de allocations activas no excede Payment.amount
- allocation no excede saldo pendiente del Charge
- comprobante requerido para bankTransfer/deposit según política
- usuario .own solo accede a pagos de unidades propias
- archivo de comprobante pasa validación de tipo, tamaño y permisos
```

---

## 15. Reglas de cálculo

### 15.1. Al crear pago

```text id="d2cwja"
allocatedAmount = 0.00
unallocatedAmount = amount
```

---

### 15.2. Al asignar pago

```text id="g55tqa"
allocatedAmount = sum(active PaymentAllocation.amount)
unallocatedAmount = amount - allocatedAmount
```

---

### 15.3. Estado después de asignar

```text id="dpr1k6"
if allocatedAmount == 0:
  status = confirmed

if allocatedAmount > 0 and unallocatedAmount > 0:
  status = partiallyAllocated

if unallocatedAmount == 0:
  status = allocated
```

---

### 15.4. Al reversar asignación

```text id="bj4wao"
PaymentAllocation.status = reversed
PaymentAllocation.reversedAt = now
Payment.allocatedAmount = sum(active allocations)
Payment.unallocatedAmount = amount - allocatedAmount
```

---

### 15.5. Al reversar pago

```text id="rezdn7"
Payment.status = reversed
active PaymentAllocations -> reversed
Payment.allocatedAmount = 0.00
Payment.unallocatedAmount = 0.00
```

El `Payment.amount` se conserva.

---

### 15.6. Al rechazar pago

```text id="2y52pv"
Payment.status = rejected
Payment.allocatedAmount = 0.00
Payment.unallocatedAmount = 0.00
```

No debe existir asignación activa.

---

### 15.7. Al cancelar pago

```text id="1as318"
Payment.status = cancelled
Payment.allocatedAmount = 0.00
Payment.unallocatedAmount = 0.00
```

Solo se permite si no tiene asignaciones activas o si primero se reversan.

---

## 16. Reglas de idempotencia

### 16.1. Header recomendado

```text id="vdwgpr"
Idempotency-Key
```

Persistir como:

```text id="u669xv"
tenantId:providedKey
```

---

### 16.2. Idempotency key derivada

Si no existe header y hay referencia suficiente:

```text id="9eqmzt"
tenantId:propertyUnitId:amount:paidAt:method:transactionReference
```

---

### 16.3. Constraint

```text id="hj6nse"
unique(tenant_id, idempotency_key)
```

---

### 16.4. Política ante duplicado

Si existe pago con la misma clave:

* no crear pago nuevo;
* devolver pago existente si el request es equivalente; o
* devolver `IDEMPOTENCY_CONFLICT` si los datos no coinciden.

MVP recomendado:

```text id="m4wkmz"
misma key + mismo payload financiero = devolver recurso existente
misma key + payload distinto = 409 IDEMPOTENCY_CONFLICT
```

---

## 17. Reglas de acceso `.own`

### 17.1. Resolver unidades propias

Para endpoints:

```text id="c7g17m"
GET /api/v1/me/payments
POST /api/v1/me/payments
GET /api/v1/me/payments/{paymentId}
POST /api/v1/me/payments/{paymentId}/receipts
GET /api/v1/me/payment-receipts/{receiptId}/download
```

El sistema debe usar:

```text id="d80389"
OwnResourceReaderPort.getOwnPropertyUnitIds(tenantId, userProfileId)
```

---

### 17.2. Filtro obligatorio

Toda consulta propia debe filtrar por:

```text id="5bpcrq"
tenantId
propertyUnitId IN ownPropertyUnitIds
```

---

### 17.3. Usuario sin persona vinculada

Si el usuario no tiene `Person` vinculada:

```text id="6o7oz0"
403 OWN_PERSON_NOT_LINKED
```

---

### 17.4. Unidad ajena

Para unidad ajena:

```text id="32oxwv"
404 NOT_FOUND
```

recomendado para no revelar existencia.

---

### 17.5. Receipt propio

Un comprobante es propio si pertenece a un pago propio:

```text id="9auosf"
PaymentReceipt.paymentId -> Payment.propertyUnitId IN ownPropertyUnitIds
```

---

## 18. Reglas para comprobantes y storage

### 18.1. Archivos permitidos

MVP recomendado:

```text id="dhx4yh"
application/pdf
image/jpeg
image/png
image/webp opcional
```

---

### 18.2. Tamaño máximo

MVP recomendado:

```text id="hdjz20"
5 MB por comprobante
```

---

### 18.3. Almacenamiento

No almacenar contenido binario en la base de datos.

Guardar solo metadata:

```text id="w0yejk"
fileId
fileName
mimeType
fileSize
```

El archivo se almacena en storage privado:

```text id="btst5z"
MinIO local/dev
S3-compatible production
S3 futuro
```

---

### 18.4. Descarga

La descarga debe hacerse mediante:

* stream controlado; o
* URL firmada temporal;
* validación previa de permisos;
* auditoría opcional o requerida según política.

---

### 18.5. Nombre de archivo

Debe sanitizarse:

```text id="zjm8md"
sin paths
sin caracteres peligrosos
sin ejecución
sin nombres excesivamente largos
```

---

## 19. Seeds iniciales

### 19.1. Tenants demo

Reusar:

```text id="gvpgev"
villa-club-demo
altos-del-norte-demo
jardines-del-valle-demo
portal-del-rio-demo
```

---

### 19.2. Dependencias demo

Reusar desde `004-dues-fees`:

```text id="o1v8yc"
charges demo
billing periods demo
property units demo
```

---

### 19.3. Payments demo

Para `villa-club-demo`:

```text id="apc5hs"
payment confirmed Casa 01 — 50.00 USD
payment pendingValidation Casa 01 — 100.00 USD
payment rejected Casa 02 — 25.00 USD
payment partiallyAllocated Casa 01 — 75.00 USD
```

---

### 19.4. Receipts demo

Metadata ficticia:

```text id="tp6f1y"
DEMO-TRANSFER-001
demo-receipt-001.pdf
application/pdf
123456
```

No subir archivos reales en seed si no existe storage preparado.

---

### 19.5. Allocations demo

Opcional:

```text id="fcj2j4"
payment 50.00 → charge monthly-dues 50.00
payment 75.00 → charge monthly-dues 50.00 + unallocated 25.00
```

---

## 20. Datos prohibidos en seeds

No usar:

```text id="d87slq"
pagos reales
comprobantes reales
referencias bancarias reales
números de cuenta bancaria
nombres reales de propietarios
nombres reales de residentes
archivos personales
datos tributarios reales
datos bancarios
capturas de transferencias reales
```

Usar:

```text id="ykt8yl"
USD
50.00
100.00
DEMO-TRANSFER-001
example.com
tenant demo
unidades demo
charges demo
```

---

## 21. Consultas esperadas

### 21.1. Listar pagos administrativos

```text id="jw25pd"
listPayments(tenantId, query)
```

Filtros:

```text id="h9swwp"
status
method
propertyUnitId
paidAtFrom
paidAtTo
createdBy
reportedBy
transactionReference
```

---

### 21.2. Consultar pago

```text id="wasogu"
findPaymentById(tenantId, paymentId)
```

---

### 21.3. Buscar por idempotency key

```text id="hnqrmp"
findPaymentByIdempotencyKey(tenantId, idempotencyKey)
```

---

### 21.4. Listar pagos por unidad

```text id="ld6pei"
listPaymentsByPropertyUnit(tenantId, propertyUnitId, query)
```

---

### 21.5. Listar pagos propios

```text id="n816x4"
listOwnPayments(tenantId, ownPropertyUnitIds, query)
```

---

### 21.6. Listar comprobantes de pago

```text id="4mk8e2"
listPaymentReceipts(tenantId, paymentId)
```

---

### 21.7. Listar asignaciones por pago

```text id="olumcm"
listPaymentAllocationsByPayment(tenantId, paymentId)
```

---

### 21.8. Listar asignaciones por cargo

```text id="wkd94b"
listPaymentAllocationsByCharge(tenantId, chargeId)
```

---

## 22. Paginación

Todos los listados deben soportar:

```text id="pntk9r"
page
pageSize
```

Valores:

```text id="noxnws"
page = 1
pageSize = 20
max pageSize = 100
```

Aplica a:

```text id="lmjezi"
payments
payment_receipts
payment_allocations
payment_reversals
```

---

## 23. Filtros mínimos

### 23.1. Payments

```text id="t1t7kn"
status
method
propertyUnitId
paidAtFrom
paidAtTo
createdBy
reportedBy
transactionReference
```

---

### 23.2. PaymentReceipts

```text id="oxr6cj"
paymentId
status
uploadedBy
transactionReference
```

---

### 23.3. PaymentAllocations

```text id="ayb8vy"
paymentId
chargeId
propertyUnitId
status
allocatedBy
```

---

### 23.4. PaymentReversals

```text id="u937hu"
paymentId
reversedBy
reversedAtFrom
reversedAtTo
```

---

## 24. Ordenamiento

Campos permitidos:

```text id="yas9ez"
createdAt
updatedAt
paidAt
reportedAt
confirmedAt
amount
allocatedAmount
unallocatedAmount
status
method
```

No permitir ordenamiento por campos arbitrarios.

---

## 25. Performance esperada

Índices críticos:

```text id="kz1jx4"
payments(tenant_id, property_unit_id, status)
payments(tenant_id, idempotency_key)
payments(paid_at)
payment_receipts(payment_id)
payment_receipts(tenant_id, status)
payment_allocations(payment_id)
payment_allocations(charge_id)
payment_allocations(tenant_id, payment_id, status)
payment_allocations(tenant_id, charge_id, status)
payment_reversals(tenant_id, payment_id)
```

No se requiere particionamiento en MVP.

---

## 26. Seguridad de datos

### 26.1. Cross-tenant

Mitigación:

* `tenant_id` obligatorio;
* queries por tenant;
* validación de unidad;
* validación de cargo;
* validación de receipt;
* validación de allocation;
* tests multitenant.

---

### 26.2. Duplicidad de pagos

Mitigación:

* `idempotency_key`;
* referencias;
* validación de comprobante;
* pruebas de idempotencia.

---

### 26.3. Asignación incorrecta

Mitigación:

* validar cargo del tenant;
* validar misma unidad en MVP;
* validar monto disponible;
* validar saldo pendiente;
* transacción de base de datos.

---

### 26.4. Exposición de comprobantes

Mitigación:

* storage privado;
* metadata solamente en DB;
* descarga con permiso;
* URL temporal si se usa URL firmada;
* auditoría de descarga según política.

---

### 26.5. Eliminación física

Mitigación:

* no exponer DELETE;
* `onDelete: Restrict`;
* status;
* reversos;
* auditoría.

---

## 27. Migración inicial

### 27.1. Nombre sugerido

```text id="kfqww2"
005_create_payments
```

---

### 27.2. Orden de creación

```text id="l6r4vv"
1. Enums
2. payments
3. payment_receipts
4. payment_allocations
5. payment_reversals
6. indexes
7. constraints
8. SQL manual constraints si aplica
```

---

### 27.3. Revisión manual

Antes de aplicar en staging o producción:

```text id="eqzeja"
- verificar tenant_id obligatorio;
- verificar property_unit_id obligatorio en payments;
- verificar Decimal en montos;
- verificar unique tenant+idempotency_key;
- verificar unique tenant+payment_id en reversals;
- verificar no cascade delete peligroso;
- verificar onDelete Restrict;
- verificar constraints de montos;
- verificar constraints de evidencia de receipt;
- verificar seeds ficticios;
- verificar que no se creen conciliaciones ni estados de cuenta todavía.
```

---

## 28. Tests de modelo requeridos

### 28.1. Unitarios

* Money.
* PaymentStatus.
* PaymentMethodType.
* PaymentReference.
* PaymentIdempotencyKey.
* PaymentReceiptFile.
* AllocationAmount.
* PaymentReversalReason.
* Payment entity.
* PaymentReceipt entity.
* PaymentAllocation entity.
* PaymentReversal entity.

---

### 28.2. Integración

* Crear pago.
* Idempotency key única.
* Crear receipt.
* Receipt requiere evidencia.
* Crear allocation.
* Allocation amount positivo.
* Crear reversal.
* Reversal único por pago.
* `onDelete: Restrict`.
* No cascade delete peligroso.

---

### 28.3. Multitenant

* Payment Tenant A no visible en Tenant B.
* Payment Tenant A no asignable a Charge Tenant B.
* Receipt Tenant A no descargable por Tenant B.
* Allocation Tenant A no visible en Tenant B.
* Own payments no mezclan tenants.

---

### 28.4. Financial regression

* Asignación no excede pago.
* Asignación no excede cargo.
* Pago parcial.
* Un pago a varios cargos.
* Varios pagos a un cargo.
* Excedente conservado.
* Reverso deshace allocations.
* Decimal exacto.

---

## 29. Compatibilidad con módulos futuros

Este modelo habilita:

```text id="zbtyb7"
006-account-statements
007-audit
00X-bank-reconciliation
009-notifications
00X-late-fees
00X-reports
00X-n8n-automations
```

Uso futuro:

| Módulo futuro       | Entidades usadas                          |
| ------------------- | ----------------------------------------- |
| Account Statements  | `Payment`, `PaymentAllocation`, `Charge`  |
| Bank Reconciliation | `Payment`, `PaymentReceipt`, referencias  |
| Audit               | eventos de pago                           |
| Notifications       | confirmación/rechazo de pagos             |
| Late Fees           | pagos y fechas de vencimiento             |
| Reports             | pagos por periodo, unidad, método, estado |
| n8n                 | eventos firmados de pagos                 |

---

## 30. Campos diferidos

No incluir todavía:

```text id="pdcx1f"
bankAccountId
bankMovementId
reconciliationId
cardToken
paymentGatewayTransactionId
processorFee
netAmount
taxInvoiceNumber
electronicInvoiceAccessKey
accountingEntryId
approvalWorkflowId
approvedBy
approvedAt
ocrExtractedData
aiValidationResult
bankStatementLineId
```

Razón:

* pertenecen a conciliación bancaria;
* pertenecen a pasarela de pagos;
* pertenecen a facturación electrónica;
* requieren workflows avanzados;
* aumentan complejidad del MVP.

---

## 31. Uso de JSONB

Evitar JSONB para datos financieros críticos.

No usar JSONB para:

```text id="mxch65"
amounts
payment allocations
payment status
charge references
property unit references
tenant references
currency
```

Uso permitido limitado:

```text id="b2hq55"
metadata no crítica de archivo si se justifica
storage provider metadata controlada
```

Regla:

```text id="6anijt"
JSONB no debe contener datos bancarios sensibles, tokens, comprobantes ni payload completo.
```

---

## 32. Reglas de retención

* Pagos se conservan.
* Comprobantes se conservan según política documental.
* Asignaciones se conservan.
* Reversos se conservan.
* Auditoría se conserva según `007-audit`.
* Archivos de comprobantes no deben borrarse sin política formal.
* En MVP no hay purga automática.

---

## 33. Checklist de migración

Antes de aceptar la migración:

```text id="rtu1nm"
[ ] Enums creados.
[ ] Tabla payments creada.
[ ] Tabla payment_receipts creada.
[ ] Tabla payment_allocations creada.
[ ] Tabla payment_reversals creada.
[ ] tenant_id obligatorio en todas las tablas.
[ ] property_unit_id obligatorio en payments.
[ ] Decimal aplicado en montos.
[ ] currency definido.
[ ] unique tenant+payment.idempotencyKey.
[ ] unique tenant+paymentReversal.paymentId.
[ ] índices por tenant creados.
[ ] índices por propertyUnit creados.
[ ] índices por payment/charge creados.
[ ] onDelete Restrict aplicado.
[ ] no cascade delete peligroso.
[ ] constraints de montos revisadas.
[ ] constraints de receipt revisadas.
[ ] seeds no contienen datos reales.
[ ] migración aplicada en local.
[ ] Prisma Client generado.
```

---

## 34. Decisión final del modelo

El módulo `005-payments` usará cuatro tablas principales:

```text id="naw9dg"
payments
payment_receipts
payment_allocations
payment_reversals
```

La tabla `payment_methods` queda diferida.

El modelo se basa en:

```text id="s26nii"
tenant_id obligatorio
property_unit_id obligatorio
pagos asociados a cargos mediante allocations
montos Decimal
moneda USD en MVP
idempotency_key para evitar duplicados
amount inmutable
allocated_amount controlado
unallocated_amount controlado
comprobantes privados
reversos auditables
no eliminación física
```

Este modelo habilita registro y aplicación segura de pagos, y prepara RESIDENT Core para estados de cuenta, conciliación bancaria, reportes financieros, notificaciones y auditoría avanzada.
