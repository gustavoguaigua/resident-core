# GAP-S3-006 — Superficie API e idempotencia de Sprint 3

## 1. Estado

| Campo | Valor |
| --- | --- |
| Gap | `GAP-S3-006` |
| Severidad | Alta |
| Estado | `CLOSED` |
| Fecha | 2026-08-29 |
| Sprint | 3 — Residentes, propiedades y finanzas base |
| Decisión de readiness | `NO_GO` |
| Fase | `0 — readiness` |

Este cierre no autoriza implementación ni cambia la fase. Los 35 documentos aplicables
permanecen en `needs-review` hasta cerrar los demás blockers y ejecutar GAP-S3-001.

## 2. Causa raíz

Specs 003–006 y 016 proponían superficies completas de MVP sin distinguir las fases de
Sprint 3. También trataban `Idempotency-Key` como opcional en algunos comandos,
admitían respuestas alternativas para retries y usaban nombres de permisos
equivalentes pero distintos. Sin una allowlist, el OpenAPI podía adelantar dominios,
exportaciones o administración documental fuera de la frontera aprobada.

## 3. Contrato transversal

Todas las rutas privadas de Sprint 3 usan `/api/v1/tenant/*` o `/api/v1/me/*` y exigen
Bearer token, `X-Tenant-Id`, tenant activo, identidad y membership Core activas,
permiso Core exacto y validación tenant-scoped del recurso. `tenantId` no se acepta en
body, query ni claims como autoridad. Una ruta `.own` exige además relación activa de
Spec 003; una relación histórica, suspendida, disputada o de otro tenant produce deny.

No se autoriza ninguna ruta `/api/v1/public/*` ni `/api/v1/platform/*` de Specs
003–006/016. Las colecciones son paginadas. UUID, fechas, timestamps y Decimal siguen
las guías API vigentes. El response envelope general continúa aplicando; una descarga
binaria usa stream controlado y es una excepción equivalente al health contract, sin
URL persistente ni envelope JSON.

## 4. Allowlist por fase

### Fase 2 — residents-properties-api

```text
GET   /api/v1/tenant/property-units
POST  /api/v1/tenant/property-units
GET   /api/v1/tenant/property-units/{propertyUnitId}
PATCH /api/v1/tenant/property-units/{propertyUnitId}
POST  /api/v1/tenant/property-units/{propertyUnitId}/archive
GET   /api/v1/tenant/persons
POST  /api/v1/tenant/persons
GET   /api/v1/tenant/persons/{personId}
PATCH /api/v1/tenant/persons/{personId}
POST  /api/v1/tenant/persons/{personId}/archive
POST  /api/v1/tenant/persons/{personId}/link-user
GET   /api/v1/tenant/legal-entities
POST  /api/v1/tenant/legal-entities
GET   /api/v1/tenant/legal-entities/{legalEntityId}
PATCH /api/v1/tenant/legal-entities/{legalEntityId}
POST  /api/v1/tenant/legal-entities/{legalEntityId}/archive
GET   /api/v1/tenant/property-ownerships
POST  /api/v1/tenant/property-ownerships
GET   /api/v1/tenant/property-ownerships/{ownershipId}
PATCH /api/v1/tenant/property-ownerships/{ownershipId}
POST  /api/v1/tenant/property-ownerships/{ownershipId}/end
GET   /api/v1/tenant/residencies
POST  /api/v1/tenant/residencies
GET   /api/v1/tenant/residencies/{residencyId}
PATCH /api/v1/tenant/residencies/{residencyId}
POST  /api/v1/tenant/residencies/{residencyId}/end
GET   /api/v1/tenant/leases
POST  /api/v1/tenant/leases
GET   /api/v1/tenant/leases/{leaseId}
PATCH /api/v1/tenant/leases/{leaseId}
POST  /api/v1/tenant/leases/{leaseId}/end
GET   /api/v1/me/person
GET   /api/v1/me/property-units
GET   /api/v1/me/residencies
```

Vehicle, Pet y EmergencyContact no tienen rutas en Sprint 3.

### Fase 3 — secure-document-storage

No añade rutas públicas. Implementa puertos internos tenant-scoped de upload temporal,
validación, promoción, lectura, compensación y reconciliación conforme a GAP-S3-005.

### Fase 4 — dues-fees-foundation

```text
GET   /api/v1/tenant/charge-concepts
POST  /api/v1/tenant/charge-concepts
GET   /api/v1/tenant/charge-concepts/{chargeConceptId}
PATCH /api/v1/tenant/charge-concepts/{chargeConceptId}
POST  /api/v1/tenant/charge-concepts/{chargeConceptId}/archive
GET   /api/v1/tenant/fee-schedules
POST  /api/v1/tenant/fee-schedules
GET   /api/v1/tenant/fee-schedules/{feeScheduleId}
PATCH /api/v1/tenant/fee-schedules/{feeScheduleId}
POST  /api/v1/tenant/fee-schedules/{feeScheduleId}/archive
GET   /api/v1/tenant/unit-fees
POST  /api/v1/tenant/unit-fees
GET   /api/v1/tenant/unit-fees/{unitFeeAssignmentId}
POST  /api/v1/tenant/unit-fees/{unitFeeAssignmentId}/end
GET   /api/v1/tenant/billing-periods
POST  /api/v1/tenant/billing-periods
GET   /api/v1/tenant/billing-periods/{billingPeriodId}
```

### Fase 5 — charge-lifecycle

```text
POST /api/v1/tenant/billing-periods/{billingPeriodId}/close
POST /api/v1/tenant/billing-periods/{billingPeriodId}/lock
POST /api/v1/tenant/charges/generate-monthly
GET  /api/v1/tenant/charge-batches
GET  /api/v1/tenant/charge-batches/{chargeBatchId}
GET  /api/v1/tenant/charges
POST /api/v1/tenant/charges
GET  /api/v1/tenant/charges/{chargeId}
POST /api/v1/tenant/charges/{chargeId}/cancel
POST /api/v1/tenant/charges/{chargeId}/reverse
POST /api/v1/tenant/charges/{chargeId}/adjustments
GET  /api/v1/me/charges
GET  /api/v1/me/property-units/{propertyUnitId}/charges
```

### Fase 6 — payments-receipts

```text
GET  /api/v1/tenant/payments
POST /api/v1/tenant/payments
GET  /api/v1/tenant/payments/{paymentId}
POST /api/v1/tenant/payments/{paymentId}/confirm
POST /api/v1/tenant/payments/{paymentId}/reject
GET  /api/v1/tenant/payments/{paymentId}/receipts
POST /api/v1/tenant/payments/{paymentId}/receipts
GET  /api/v1/tenant/payment-receipts/{receiptId}
GET  /api/v1/tenant/payment-receipts/{receiptId}/download
POST /api/v1/tenant/payment-receipts/{receiptId}/accept
POST /api/v1/tenant/payment-receipts/{receiptId}/reject
GET  /api/v1/me/payments
POST /api/v1/me/payments
GET  /api/v1/me/payments/{paymentId}
POST /api/v1/me/payments/{paymentId}/receipts
GET  /api/v1/me/payment-receipts/{receiptId}/download
```

### Fase 7 — allocations-reversals

```text
POST /api/v1/tenant/payments/{paymentId}/allocate
POST /api/v1/tenant/payments/{paymentId}/auto-allocate
POST /api/v1/tenant/payments/{paymentId}/reverse
GET  /api/v1/tenant/payments/{paymentId}/allocations
GET  /api/v1/tenant/payment-allocations/{allocationId}
POST /api/v1/tenant/payment-allocations/{allocationId}/reverse
```

### Fase 8 — balances-statements

```text
GET  /api/v1/tenant/account-statements
POST /api/v1/tenant/account-statements/generate
POST /api/v1/tenant/account-statements/generate-batch
GET  /api/v1/tenant/account-statements/{statementId}
POST /api/v1/tenant/account-statements/{statementId}/publish
POST /api/v1/tenant/account-statements/{statementId}/close
POST /api/v1/tenant/account-statements/{statementId}/lock
POST /api/v1/tenant/account-statements/{statementId}/regenerate
GET  /api/v1/tenant/balances
GET  /api/v1/tenant/property-units/{propertyUnitId}/balance
POST /api/v1/tenant/property-units/{propertyUnitId}/balance/recalculate
GET  /api/v1/tenant/property-units/{propertyUnitId}/financial-movements
GET  /api/v1/me/account-statements
GET  /api/v1/me/account-statements/{statementId}
GET  /api/v1/me/property-units/{propertyUnitId}/balance
GET  /api/v1/me/property-units/{propertyUnitId}/financial-movements
```

La Fase 9 sólo publica y valida el OpenAPI acumulado; no añade operaciones.

## 5. DTOs y campos prohibidos

Los DTOs autorizados reutilizan los campos de las operaciones allowlisted, sujetos a
estos overrides:

- UUID para IDs, fecha civil `YYYY-MM-DD`, timestamp ISO 8601 UTC y dinero como string
  Decimal con máximo dos decimales;
- `Tenant.currency` es la autoridad y no se acepta currency del request;
- `Person.userProfileId` sólo se modifica mediante `link-user`;
- ownership y lease aplican XOR de GAP-S3-002;
- allocations aceptan únicamente `chargeId` y `amount`; servidor calcula disponibilidad;
- generación de statement acepta IDs canónicos y `asOfDate`, nunca saldos o líneas;
- upload de receipt usa multipart con `file`, `receiptNumber` y
  `transactionReference` opcionales; responde metadata compuesta desde Spec 016.

Quedan prohibidos en input `tenantId`, actores/timestamps del sistema, storage key,
bucket, provider, hash, scan status, roles, permisos, Audit metadata, saldos y estados
derivados. Campos desconocidos producen `VALIDATION_ERROR`; no se ignoran.

## 6. Idempotencia y concurrencia

`Idempotency-Key` es obligatorio en cada `POST` y `PATCH` de la allowlist. Para
`(tenantId, operationType, idempotencyKey)`:

- mismo payload normalizado: devuelve status y resultado originales sin duplicar Audit;
- payload distinto: `409 IDEMPOTENCY_KEY_CONFLICT`;
- operación en curso: `409 IDEMPOTENCY_OPERATION_IN_PROGRESS`;
- ausencia o formato inválido: `400 IDEMPOTENCY_KEY_REQUIRED`.

GET no usa idempotency key. Locks, constraints y transacciones de GAP-S3-003 continúan
siendo obligatorios; la cabecera no sustituye concurrencia ni tenant isolation.

El ownership, modelo `IdempotencyOperation`, hashing, canonicalización, autorización
previa al replay, lock transaccional, atomicidad, recuperación y retención de 24 horas
se rigen exclusivamente por
`docs/changes/GAP-S3-010-IDEMPOTENCY-LEDGER-CONTRACT-2026-09-02.md`. Este ledger es
infraestructura transversal de plataforma y no pertenece a ningún dominio consumidor.

## 7. Permisos canónicos

| Slice | Permisos autorizados |
| --- | --- |
| Property units | `propertyUnits.read`, `.create`, `.update`, `.archive`, `.read.own` |
| Persons | `persons.read`, `.create`, `.update`, `.archive`, `.linkIdentity`, `.read.own` |
| Legal entities | `legalEntities.read`, `.create`, `.update`, `.archive` |
| Ownerships | `propertyOwnerships.read`, `.create`, `.update`, `.end` |
| Residencies | `residencies.read`, `.create`, `.update`, `.end`, `.read.own` |
| Leases | `leases.read`, `.create`, `.update`, `.end` |
| Dues foundation | `chargeConcepts.read/create/update/archive`, `feeSchedules.read/create/update/archive`, `unitFees.read/assign/end`, `billingPeriods.read/create/close/lock` |
| Charges | `fees.generate`, `fees.readBatches`, `charges.read/create/cancel/adjust/reverse`, `charges.read.own` |
| Payments | `payments.read/create/confirm/reject/allocate/reverse`, `payments.allocations.reverse`, `payments.read.own`, `payments.create.own` |
| Receipts | `paymentReceipts.read/create/download/review`, `paymentReceipts.create.own`, `paymentReceipts.download.own` |
| Statements | `accountStatements.read/generate/publish/close/lock/regenerate`, `accountStatements.read.own` |
| Balances | `balances.read/recalculate`, `balances.read.own`, `financialMovements.read`, `financialMovements.read.own` |

La notación compacta expande cada acción tras el mismo prefijo. Se eliminan los alias
`paymentReceipts.reject` y `payments.receipts.upload.own`; aceptar y rechazar usan
`paymentReceipts.review`. Spec 016 no publica permisos `documents.*` en Sprint 3. Los
roles y Audit exactos están cerrados por
`docs/changes/GAP-S3-007-PERMISSIONS-AUDIT-CATALOG-2026-08-30.md`; ningún claim de
Keycloak concede estos permisos.

## 8. Errores canónicos

| HTTP | Código |
| ---: | --- |
| 400 | `TENANT_CONTEXT_REQUIRED`, `IDEMPOTENCY_KEY_REQUIRED` |
| 401 | `AUTHENTICATION_REQUIRED` |
| 403 | `TENANT_CONTEXT_INVALID`, `PERMISSION_DENIED` |
| 404 | `RESOURCE_NOT_FOUND`, `CROSS_TENANT_REFERENCE` |
| 409 | `RESOURCE_STATE_CONFLICT`, `IDEMPOTENCY_KEY_CONFLICT`, `IDEMPOTENCY_OPERATION_IN_PROGRESS`, `CONCURRENT_MODIFICATION`, `FINANCIAL_CURRENCY_MISMATCH` |
| 422 | `VALIDATION_ERROR`, `UNSUPPORTED_TENANT_CURRENCY` |
| 503 | `DEPENDENCY_UNAVAILABLE` |

El error usa el envelope vigente con `code`, mensaje seguro, detalles allowlisted y
`requestId`. No revela existencia cross-tenant, SQL, paths, claves ni secretos. Los
códigos de tamaño, MIME, cuarentena y retención se fijarán en GAP-S3-008.

## 9. Exclusiones expresas

- API de Vehicle, Pet y EmergencyContact;
- API documental genérica, pública o platform y permisos `documents.*`;
- exportación de statements o documentos generados;
- conciliación bancaria, pasarela, facturación electrónica, OCR o antivirus operativo;
- endpoints de dominios posteriores y cualquier operación no incluida en §4.

## 10. Criterio de cierre demostrado

- allowlist exacta y acumulativa por fase;
- DTOs y campos prohibidos definidos;
- tenant context y `.own` fail-closed definidos;
- idempotencia obligatoria con resultado único y contrato técnico cerrado por
  GAP-S3-010;
- permisos sin aliases contradictorios;
- errores y exclusiones uniformes;
- readiness permanece `NO_GO`, fase 0.
