# GAP-S3-007 — Catálogo canónico de permisos y Audit de Sprint 3

## 1. Estado

| Campo | Valor |
| --- | --- |
| Gap | `GAP-S3-007` |
| Severidad | Alta |
| Estado | `closed` |
| Fecha | 2026-08-30 |
| Sprint | Sprint 3 — Residentes, propiedades y finanzas base |
| Specs afectadas | 003, 004, 005, 006, 007 y 016 |
| Readiness resultante | `NO_GO`, fase 0; GAP-S3-001 cerrado posteriormente |

Este documento fija el contrato autoritativo de autorización y auditoría para Sprint 3.
Sustituye los catálogos preliminares incompatibles de las specs afectadas, sin cambiar
los contratos aceptados de Sprint 2.

## 2. Causa raíz

Las specs de Sprint 3 proponían permisos, actores, acciones y payloads de auditoría de
forma independiente. Existían aliases no canónicos como `FinancialManager`, permisos
fuera de la superficie aprobada, eventos de dominios posteriores y campos como
`oldValue`, `newValue` o payloads completos incompatibles con Audit base.

## 3. Ownership y reglas comunes

- Keycloak autentica; Core autoriza con `UserProfile`, tenant, membership activa, roles,
  permisos persistidos, estado y ownership del recurso.
- Spec 002 conserva ownership de roles, permisos y resolución de autorización.
- Cada módulo productor decide que ocurrió el hecho y aporta IDs obtenidos del contexto
  validado. Spec 007 posee `AuditLog`, catálogo, sanitización, append-only y escritura.
- Una mutación crítica y todos sus eventos Audit `SUCCESS` usan la misma transacción
  PostgreSQL. Fallar validación, sanitización o inserción Audit revierte la mutación.
- Los eventos de denegación conservan la semántica de Sprint 2: la decisión permanece
  denegada aunque falle su persistencia y nunca concede acceso.
- Claims de Keycloak, body, query y headers no sustituyen autorización ni aportan actor,
  tenant, rol, permiso o resource ownership.
- PlatformAdmin no recibe acceso implícito a datos tenant-scoped de Sprint 3.
- No se crean tablas Audit paralelas, categorías Prisma nuevas ni APIs de consulta,
  exportación, reporting, update o delete de Audit.

## 4. Permisos canónicos de Sprint 3

La allowlist exacta es la fijada por GAP-S3-006:

```text
propertyUnits.read
propertyUnits.create
propertyUnits.update
propertyUnits.archive
propertyUnits.read.own
persons.read
persons.create
persons.update
persons.archive
persons.linkIdentity
persons.read.own
legalEntities.read
legalEntities.create
legalEntities.update
legalEntities.archive
propertyOwnerships.read
propertyOwnerships.create
propertyOwnerships.update
propertyOwnerships.end
residencies.read
residencies.create
residencies.update
residencies.end
residencies.read.own
leases.read
leases.create
leases.update
leases.end
chargeConcepts.read
chargeConcepts.create
chargeConcepts.update
chargeConcepts.archive
feeSchedules.read
feeSchedules.create
feeSchedules.update
feeSchedules.archive
unitFees.read
unitFees.assign
unitFees.end
billingPeriods.read
billingPeriods.create
billingPeriods.close
billingPeriods.lock
fees.generate
fees.readBatches
charges.read
charges.create
charges.cancel
charges.adjust
charges.reverse
charges.read.own
payments.read
payments.create
payments.confirm
payments.reject
payments.allocate
payments.reverse
payments.allocations.reverse
payments.read.own
payments.create.own
paymentReceipts.read
paymentReceipts.create
paymentReceipts.download
paymentReceipts.review
paymentReceipts.create.own
paymentReceipts.download.own
accountStatements.read
accountStatements.generate
accountStatements.publish
accountStatements.close
accountStatements.lock
accountStatements.regenerate
accountStatements.read.own
balances.read
balances.recalculate
balances.read.own
financialMovements.read
financialMovements.read.own
```

No existen en Sprint 3 `persons.update.own`, `propertyOwnerships.read.own`, permisos de
exportación, `documents.*`, `payments.register`, `payments.receipts.upload.own`,
`paymentReceipts.reject`, `*.audit.read`, `*.reports.read` ni aliases equivalentes.

## 5. Asignación canónica a roles base

Las asignaciones existentes de Sprint 2 permanecen intactas. Esta matriz añade sólo
permisos de Sprint 3 y es exacta; un rol no hereda permisos de otro.

| Rol | Permisos de Sprint 3 |
| --- | --- |
| `PlatformAdmin` global | Ninguno tenant-scoped; soporte exige membership y permiso Core explícitos |
| `TenantAdmin` | Todos los permisos administrativos no `.own` de la sección 4 |
| `Treasurer` | `propertyUnits.read` y todos los permisos financieros no `.own` desde `chargeConcepts.*` hasta `financialMovements.read` |
| `BoardMember` | `chargeConcepts.read`, `feeSchedules.read`, `unitFees.read`, `billingPeriods.read`, `fees.readBatches`, `charges.read`, `payments.read`, `accountStatements.read`, `balances.read`, `financialMovements.read` |
| `TenantAuditor` | Los permisos de `BoardMember` más `paymentReceipts.read` y `paymentReceipts.download` |
| `ExternalAccountant` | Los permisos de `TenantAuditor`; ninguno de mutación |
| `TenantStaff` | `propertyUnits.read`, `persons.read`, `legalEntities.read`, `propertyOwnerships.read`, `residencies.read`, `leases.read` |
| `PropertyOwner` | `propertyUnits.read.own`, `persons.read.own`, `charges.read.own`, `payments.read.own`, `payments.create.own`, `paymentReceipts.create.own`, `paymentReceipts.download.own`, `accountStatements.read.own`, `balances.read.own`, `financialMovements.read.own` |
| `Resident` | Los permisos de `PropertyOwner` más `residencies.read.own` |
| `Guard` | Ninguno de Sprint 3 |

`FinancialManager` se normaliza a `Treasurer`; no se crea ese rol. `MeetingManager`,
`FineManager` y `CommunicationManager` pertenecen a dominios posteriores y no reciben
permisos. Los roles personalizados y elevaciones por claims permanecen fuera de alcance.

La evaluación `.own` usa exclusivamente relaciones activas tenant-scoped de Spec 003.
Una relación suspendida, terminada, disputada, archivada o de otro tenant falla cerrada.

## 6. Separación de funciones y fail-closed

- Quien reportó o creó un pago no puede confirmarlo ni rechazarlo.
- Quien subió la versión vigente de un comprobante no puede aceptarla ni rechazarla.
- `TenantAdmin` no omite estas restricciones y PlatformAdmin no es un bypass.
- Confirmar/rechazar exige `payments.confirm`/`payments.reject`; revisar comprobante
  exige `paymentReceipts.review`. Los permisos son independientes.
- Subject desconocido, perfil/membership/tenant inactivo, permiso ausente, tenant o
  recurso incompatible y role/scope inválido fallan cerrados.
- IDs cross-tenant no revelan existencia. Claims de tenant o rol no elevan acceso.
- Reintentos idempotentes no repiten la mutación ni sus eventos Audit.

## 7. Catálogo Audit de Sprint 3

Todos los eventos de negocio de esta sección usan `AuditCategory = TENANT`,
`AuditOutcome = SUCCESS` y un tenant validado.

### 7.1 Residents and Properties

```text
propertyUnit.created
propertyUnit.updated
propertyUnit.statusChanged
propertyUnit.archived
person.created
person.updated
person.statusChanged
person.archived
person.identityLinked
person.identityUnlinked
legalEntity.created
legalEntity.updated
legalEntity.statusChanged
legalEntity.archived
propertyOwnership.created
propertyOwnership.updated
propertyOwnership.disputed
propertyOwnership.resolved
propertyOwnership.ended
propertyOwnership.archived
residency.created
residency.updated
residency.suspended
residency.reactivated
residency.ended
residency.archived
lease.created
lease.updated
lease.activated
lease.cancelled
lease.ended
lease.archived
```

### 7.2 Dues and Fees

```text
chargeConcept.created
chargeConcept.updated
chargeConcept.archived
feeSchedule.created
feeSchedule.updated
feeSchedule.archived
unitFee.assigned
unitFee.ended
billingPeriod.created
billingPeriod.closed
billingPeriod.locked
chargeBatch.created
chargeBatch.completed
chargeBatch.completedWithErrors
charge.created
charge.cancelled
charge.adjusted
charge.reversed
```

### 7.3 Payments

```text
payment.created
payment.reported
payment.confirmed
payment.rejected
payment.reversed
paymentReceipt.uploaded
paymentReceipt.reuploaded
paymentReceipt.accepted
paymentReceipt.rejected
paymentReceipt.downloaded
paymentAllocation.created
paymentAllocation.reversed
```

`payment.allocated` y `payment.autoAllocated` no duplican el hecho: toda asignación usa
`paymentAllocation.created` con el actor causal validado.

### 7.4 Account Statements

```text
accountStatement.generated
accountStatement.batchGenerated
accountStatement.published
accountStatement.closed
accountStatement.locked
accountStatement.regenerated
accountStatement.superseded
balance.recalculated
```

No se auditan exportaciones porque Sprint 3 no las expone. Lecturas ordinarias, listas y
consulta `.own` tampoco generan un evento funcional. La descarga de comprobante sí se
audita por tratar contenido financiero sensible.

### 7.5 Secure Document Storage

```text
document.uploadFinalized
document.compensationFailed
document.orphanDetected
document.orphanReconciled
document.quarantined
document.rejected
```

`document.uploadFinalized` conserva el actor causal del flujo de Payments. Compensación,
huérfanos y reconciliación usan `SYSTEM`; cuarentena/rechazo conserva `USER` cuando se
produce dentro de una solicitud y `SYSTEM` sólo en un proceso interno autorizado.
Descargar un comprobante genera únicamente `paymentReceipt.downloaded`, no un segundo
evento documental.

Como Audit base no añade un outcome `FAILED`, `document.compensationFailed` usa
`SUCCESS` para evidenciar que el hecho de fallo quedó registrado durablemente; la
operación originadora continúa fallida y `reasonCode` conserva el código estable.

Las denegaciones reutilizan `authentication.denied`, `authorization.denied` o
`tenantAccess.denied` de Sprint 2. No se crean aliases `*.downloadDenied`.

## 8. Recursos, actores y metadata

Los `resourceType` permitidos son:

```text
PropertyUnit
Person
LegalEntity
PropertyOwnership
Residency
Lease
ChargeConcept
FeeSchedule
UnitFee
BillingPeriod
ChargeBatch
Charge
Payment
PaymentReceipt
PaymentAllocation
AccountStatement
UnitBalance
SecureDocument
```

El actor `USER` exige `actorUserProfileId` y membership validada para el tenant. El
actor `SYSTEM` sólo se admite en los eventos indicados. `ANONYMOUS` nunca produce un
evento `SUCCESS` y sólo se conserva para denegaciones de Sprint 2.

Además de los campos fijos de `AuditLog`, la metadata se limita a estas claves:

| Familia | Claves permitidas |
| --- | --- |
| Actualización de entidad | `changedFields` con nombres canónicos, nunca valores |
| Transición de estado | `previousStatus`, `newStatus` |
| Finanzas | `propertyUnitId`, `billingPeriodId`, `chargeId`, `paymentId`, `paymentReceiptId`, `allocationId`, `statementId`, `amount`, `currency`, `paymentMethod`, `idempotencyKeyHash` |
| Documento | `documentId`, `versionId`, `fileId`, `category`, `fileSize`, `verifiedMimeType`, `previousStatus`, `newStatus` |
| Sin claves aplicables | `metadata = null` |

Cada acción declara en implementación el subconjunto exacto que acepta; claves ausentes
sólo son válidas cuando no aplican al hecho. `reasonCode` usa el campo estable del modelo,
no texto libre en metadata. `amount` es decimal serializado como string y `currency` es
el código canónico del tenant. `idempotencyKeyHash` es irreversible y nunca la clave raw.

Quedan prohibidos nombres, email, teléfono, dirección, identificación, fecha de
nacimiento, referencia bancaria, `receiptNumber`, `transactionReference`, nombre de
archivo, contenido, `storageKey`, bucket, provider endpoint, URL firmada, hash completo,
tokens, claims, cookies, headers, secretos, payloads completos, SQL, stack traces, IP o
user agent raw.

## 9. Atomicidad y pruebas obligatorias

- mutación, estados derivados, marca de proyección stale y Audit se confirman juntos;
- fallo Audit revierte la operación; una denegación jamás se convierte en allow;
- reintento o concurrencia produce un solo resultado y un solo conjunto de eventos;
- upload/DB/Audit aplica la compensación de GAP-S3-005 sin considerar válido un objeto
  huérfano;
- actor, tenant, action, resource y metadata fuera de catálogo fallan cerrados;
- uploader no revisa su comprobante y reporter/creator no valida su pago;
- las pruebas negativas cubren cross-tenant, claims maliciosos, estados inactivos,
  ausencia de permiso, aliases retirados y metadata prohibida.

Los gates progresivos incorporan estas garantías: Fase 2 en
`test:residents:authorization`, Fase 3 en `test:documents`, Fases 4–5 en
`test:dues`/`test:charges`, Fases 6–7 en `test:payments`/`test:allocations`, Fase 8 en
`test:statements` y `test:financial`, y Fase 9 en el cierre acumulativo. En fase 0 sólo
se valida la consistencia documental y la frontera; no se implementa runtime.

## 10. Criterio de cierre

GAP-S3-007 queda cerrado porque existe una única allowlist de permisos, asignación
exacta a roles base, separación de funciones, catálogo de eventos/recursos, actores,
metadata allowlisted/prohibida, atomicidad y pruebas por fase. Sprint 3 continúa
`NO_GO`, fase 0, hasta reevaluar formalmente la compuerta.
