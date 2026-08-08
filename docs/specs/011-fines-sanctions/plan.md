# Plan — Spec 011 Fines and Sanctions

## 1. Información del documento

| Campo                 | Valor                                                                                                                                                     |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto              | RESIDENT Core                                                                                                                                             |
| Spec ID               | 011                                                                                                                                                       |
| Módulo                | Fines and Sanctions                                                                                                                                       |
| Documento             | Implementation Plan                                                                                                                                       |
| Ruta                  | `docs/specs/011-fines-sanctions/plan.md`                                                                                                                  |
| Versión               | 0.1                                                                                                                                                       |
| Estado                | Borrador inicial                                                                                                                                          |
| Fecha                 | 2026-07-19                                                                                                                                                |
| Documento base        | `docs/specs/011-fines-sanctions/spec.md`                                                                                                                  |
| Depende de            | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements`, `007-audit`, `008-basic-reports` |
| Arquitectura          | Monolito modular NestJS                                                                                                                                   |
| Base de datos         | PostgreSQL + Prisma                                                                                                                                       |
| API Style             | REST                                                                                                                                                      |
| Naturaleza del módulo | Transaccional / Tenant-scoped / Permissioned / Auditable / Financially integrable                                                                         |
| Prioridad             | Alta                                                                                                                                                      |

---

## 2. Propósito

Este documento transforma la especificación funcional `011-fines-sanctions/spec.md` en un plan técnico de implementación.

El módulo `Fines and Sanctions` debe permitir administrar conceptos de multa, registrar infracciones, adjuntar evidencias, revisar casos, aprobar, rechazar, emitir, cancelar, condonar, reversar, gestionar reclamos básicos y generar cargos financieros asociados cuando corresponda.

Regla central:

```text id="lwo1xq"
Toda multa o sanción debe ser tenant-scoped, permissioned, evidence-aware, state-controlled, auditable y financieramente integrable sin procesar pagos directamente.
```

---

## 3. Resumen de implementación

El módulo se implementará dentro de RESIDENT Core como módulo funcional independiente, pero integrado con:

* tenants;
* usuarios, roles y permisos;
* residentes, propietarios, personas y unidades;
* conceptos de cargo;
* cargos financieros;
* pagos;
* estados de cuenta;
* auditoría;
* reportes básicos;
* futuras notificaciones.

Nombre técnico recomendado:

```text id="oygk6k"
fines
```

Ruta recomendada:

```text id="fxpmxx"
apps/api/src/modules/fines/
```

Componentes principales:

```text id="h2wfz7"
FinesModule
FineConceptsController
FinesController
FineEvidenceController
FineAppealsController
MyFinesController
MyFineAppealsController
FineConceptService
FineService
FineEvidenceService
FineAppealService
FineStateMachineService
FineChargeService
FineOwnershipService
FinePolicyService
FineAuditService
```

Naturaleza del módulo:

```text id="jiyli6"
tenant-scoped
permissioned
own-resource protected
evidence-aware
stateful
financially integrable
audit-heavy
privacy-preserving
not public-facing
```

---

## 4. Decisiones técnicas aplicables

El módulo debe cumplir con:

```text id="rgiitf"
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
* toda tabla debe incluir `tenant_id`;
* toda multa monetaria debe asociarse a `property_unit_id`;
* toda multa puede asociarse opcionalmente a `responsible_person_id`;
* no se permite cross-tenant;
* no se permite exponer multas en WordPress público;
* no se permite procesar pagos desde multas;
* no se permite modificar estados de cuenta directamente;
* los cargos se generan a través del módulo financiero;
* montos deben usar Decimal;
* no usar float/double para dinero;
* una multa no debe generar cargos duplicados;
* evidencias deben tener acceso restringido;
* reclamos deben validarse por estado y plazo;
* toda transición relevante debe crear historial;
* toda decisión relevante debe auditarse.

---

## 5. Alcance técnico

### 5.1. Incluido

```text id="rvmx8l"
Fine concepts management
Fine creation
Fine administrative review
Fine approval
Fine rejection
Fine issuing
Fine cancellation
Fine waiver
Fine reversal
Fine evidence management
Fine appeal submission
Fine appeal resolution
Own fines query
Own fine appeals query
Optional charge generation
Fine status history
Audit integration
REST API
OpenAPI
Unit tests
Integration tests
API tests
Authorization tests
Own-resource tests
Multitenancy tests
Financial regression tests
Security tests
```

---

### 5.2. Diferido

```text id="n7zmqn"
advanced legal workflow
electronic signature
formal PDF documents
automatic WhatsApp notifications
automatic email notifications
camera integration
AI-assisted evidence review
OCR
sensor-based fines
automatic late-payment fines
repeat-offender calculation
committee escalation
complex appeals
hearings
assembly voting
public offender publication
WordPress public fines
online fine payments
bank reconciliation
automatic interest
automatic reservation restrictions
advanced non-monetary sanctions
```

---

## 6. Estructura de carpetas recomendada

```text id="x3bgz6"
apps/api/src/modules/fines/
├── fines.module.ts
│
├── fine-concepts.controller.ts
├── fines.controller.ts
├── fine-evidence.controller.ts
├── fine-appeals.controller.ts
├── my-fines.controller.ts
├── my-fine-appeals.controller.ts
│
├── application/
│   ├── use-cases/
│   │   ├── create-fine-concept.use-case.ts
│   │   ├── list-fine-concepts.use-case.ts
│   │   ├── get-fine-concept.use-case.ts
│   │   ├── update-fine-concept.use-case.ts
│   │   ├── activate-fine-concept.use-case.ts
│   │   ├── deactivate-fine-concept.use-case.ts
│   │   ├── archive-fine-concept.use-case.ts
│   │   ├── create-fine.use-case.ts
│   │   ├── list-fines.use-case.ts
│   │   ├── get-fine.use-case.ts
│   │   ├── update-fine.use-case.ts
│   │   ├── submit-fine-review.use-case.ts
│   │   ├── approve-fine.use-case.ts
│   │   ├── reject-fine.use-case.ts
│   │   ├── issue-fine.use-case.ts
│   │   ├── cancel-fine.use-case.ts
│   │   ├── waive-fine.use-case.ts
│   │   ├── reverse-fine.use-case.ts
│   │   ├── archive-fine.use-case.ts
│   │   ├── generate-fine-charge.use-case.ts
│   │   ├── add-fine-evidence.use-case.ts
│   │   ├── list-fine-evidence.use-case.ts
│   │   ├── get-fine-evidence.use-case.ts
│   │   ├── download-fine-evidence.use-case.ts
│   │   ├── archive-fine-evidence.use-case.ts
│   │   ├── submit-fine-appeal.use-case.ts
│   │   ├── list-fine-appeals.use-case.ts
│   │   ├── get-fine-appeal.use-case.ts
│   │   ├── accept-fine-appeal.use-case.ts
│   │   ├── reject-fine-appeal.use-case.ts
│   │   ├── cancel-fine-appeal.use-case.ts
│   │   ├── list-own-fines.use-case.ts
│   │   ├── get-own-fine.use-case.ts
│   │   ├── list-own-fine-evidence.use-case.ts
│   │   ├── submit-own-fine-appeal.use-case.ts
│   │   ├── list-own-fine-appeals.use-case.ts
│   │   └── get-own-fine-appeal.use-case.ts
│   │
│   ├── services/
│   │   ├── fine-concept.service.ts
│   │   ├── fine.service.ts
│   │   ├── fine-evidence.service.ts
│   │   ├── fine-appeal.service.ts
│   │   ├── fine-state-machine.service.ts
│   │   ├── fine-charge.service.ts
│   │   ├── fine-ownership.service.ts
│   │   ├── fine-policy.service.ts
│   │   ├── fine-money.service.ts
│   │   ├── fine-evidence-access.service.ts
│   │   └── fine-audit.service.ts
│   │
│   └── ports/
│       ├── fine-concept-reader.port.ts
│       ├── fine-concept-writer.port.ts
│       ├── fine-reader.port.ts
│       ├── fine-writer.port.ts
│       ├── fine-evidence-reader.port.ts
│       ├── fine-evidence-writer.port.ts
│       ├── fine-appeal-reader.port.ts
│       ├── fine-appeal-writer.port.ts
│       ├── fine-charge.port.ts
│       ├── fine-property-unit.port.ts
│       ├── fine-person.port.ts
│       ├── fine-file-storage.port.ts
│       └── fine-audit.port.ts
│
├── domain/
│   ├── entities/
│   │   ├── fine-concept.entity.ts
│   │   ├── fine.entity.ts
│   │   ├── fine-evidence.entity.ts
│   │   ├── fine-appeal.entity.ts
│   │   └── fine-status-history.entity.ts
│   │
│   ├── value-objects/
│   │   ├── fine-concept-code.vo.ts
│   │   ├── fine-concept-status.vo.ts
│   │   ├── fine-category.vo.ts
│   │   ├── fine-status.vo.ts
│   │   ├── fine-severity.vo.ts
│   │   ├── fine-money.vo.ts
│   │   ├── fine-title.vo.ts
│   │   ├── fine-description.vo.ts
│   │   ├── fine-reason.vo.ts
│   │   ├── fine-evidence-type.vo.ts
│   │   ├── fine-evidence-status.vo.ts
│   │   ├── fine-appeal-status.vo.ts
│   │   └── fine-payment-status-snapshot.vo.ts
│   │
│   ├── events/
│   │   ├── fine-concept-created.event.ts
│   │   ├── fine-concept-updated.event.ts
│   │   ├── fine-created.event.ts
│   │   ├── fine-approved.event.ts
│   │   ├── fine-rejected.event.ts
│   │   ├── fine-issued.event.ts
│   │   ├── fine-cancelled.event.ts
│   │   ├── fine-waived.event.ts
│   │   ├── fine-reversed.event.ts
│   │   ├── fine-charge-generated.event.ts
│   │   ├── fine-charge-generation-failed.event.ts
│   │   ├── fine-evidence-added.event.ts
│   │   ├── fine-evidence-archived.event.ts
│   │   ├── fine-appeal-submitted.event.ts
│   │   └── fine-appeal-resolved.event.ts
│   │
│   └── errors/
│       ├── fine-concept-not-found.error.ts
│       ├── fine-concept-duplicate-code.error.ts
│       ├── fine-concept-inactive.error.ts
│       ├── fine-not-found.error.ts
│       ├── fine-forbidden.error.ts
│       ├── fine-invalid-transition.error.ts
│       ├── fine-evidence-required.error.ts
│       ├── fine-invalid-amount.error.ts
│       ├── fine-unit-required.error.ts
│       ├── fine-unit-forbidden.error.ts
│       ├── fine-person-forbidden.error.ts
│       ├── fine-charge-concept-required.error.ts
│       ├── fine-charge-already-generated.error.ts
│       ├── fine-charge-generation-failed.error.ts
│       ├── fine-appeal-not-allowed.error.ts
│       ├── fine-appeal-deadline-expired.error.ts
│       └── fine-cross-tenant-reference.error.ts
│
├── infrastructure/
│   ├── persistence/
│   │   ├── prisma-fine-concept.repository.ts
│   │   ├── prisma-fine.repository.ts
│   │   ├── prisma-fine-evidence.repository.ts
│   │   ├── prisma-fine-appeal.repository.ts
│   │   └── fines.mapper.ts
│   │
│   ├── financial/
│   │   └── fine-charge.adapter.ts
│   │
│   ├── files/
│   │   └── fine-file-storage.adapter.ts
│   │
│   └── audit/
│       └── fine-audit.adapter.ts
│
├── policies/
│   ├── fine-concept-permission.guard.ts
│   ├── fine-permission.guard.ts
│   ├── fine-evidence-permission.guard.ts
│   ├── fine-appeal-permission.guard.ts
│   ├── own-fine.guard.ts
│   └── fine-financial.guard.ts
│
├── dto/
└── tests/
```

---

## 7. Documentación esperada

```text id="tzbamj"
docs/specs/011-fines-sanctions/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

Este documento corresponde a:

```text id="esn8tc"
plan.md
```

---

# 8. Diseño de dominio

## 8.1. FineConcept

Responsabilidad:

* representar el tipo o concepto de multa;
* definir monto base;
* definir categoría;
* indicar si requiere evidencia;
* indicar si admite reclamo;
* vincularse opcionalmente a concepto financiero;
* controlar estado operativo.

Campos conceptuales:

```text id="wcmce3"
id
tenantId
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
archivedAt
```

Reglas:

* `tenantId` obligatorio;
* `code` único por tenant;
* `name` obligatorio;
* `defaultAmount` debe ser Decimal;
* `currency` por defecto `USD`;
* si `defaultAmount > 0`, debe existir `chargeConceptId` para generar cargo;
* `requiresEvidence` controla aprobación/emisión;
* `allowsAppeal` controla reclamos;
* conceptos archivados no pueden usarse en nuevas multas.

---

## 8.2. Fine

Responsabilidad:

* representar una multa o caso sancionatorio;
* asociar unidad;
* asociar responsable opcional;
* registrar descripción, severidad, estado y monto;
* controlar flujo sancionatorio;
* generar cargo si corresponde;
* permitir reclamo, condonación o reverso.

Campos conceptuales:

```text id="pv6r8h"
id
tenantId
fineConceptId
propertyUnitId
responsiblePersonId
reportedBy
reviewedBy
approvedBy
rejectedBy
cancelledBy
waivedBy
reversedBy
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
issuedAt
approvedAt
rejectedAt
cancelledAt
waivedAt
reversedAt
metadata
createdAt
updatedAt
archivedAt
```

Reglas:

* `tenantId` obligatorio;
* `fineConceptId` obligatorio;
* `propertyUnitId` requerido cuando `amount > 0`;
* `responsiblePersonId` opcional;
* `description` obligatoria;
* `amount` debe ser Decimal;
* `chargeId` único si existe;
* no se elimina físicamente;
* toda transición relevante genera historial y auditoría.

---

## 8.3. FineEvidence

Responsabilidad:

* registrar evidencia asociada a una multa;
* soportar texto, imagen, documento, video o referencia;
* controlar acceso a evidencias;
* mantener trazabilidad de carga y archivo.

Campos conceptuales:

```text id="sj8d79"
id
tenantId
fineId
evidenceType
title
description
fileUrl
fileName
mimeType
fileSizeBytes
uploadedBy
uploadedAt
status
metadata
archivedAt
```

Reglas:

* `tenantId` obligatorio;
* `fineId` obligatorio;
* evidencia debe pertenecer a multa del mismo tenant;
* `fileUrl` no debe ser público si contiene datos privados;
* `fileName`, `mimeType`, `fileSizeBytes` deben validarse;
* evidencias no deben exponerse a usuarios no autorizados;
* no se elimina físicamente en operación ordinaria.

---

## 8.4. FineAppeal

Responsabilidad:

* representar reclamo básico sobre una multa emitida;
* registrar motivo del reclamante;
* controlar resolución administrativa;
* mantener trazabilidad.

Campos conceptuales:

```text id="cvh0gu"
id
tenantId
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
archivedAt
```

Reglas:

* `tenantId` obligatorio;
* `fineId` obligatorio;
* `submittedBy` obligatorio;
* `reason` obligatorio;
* solo aplica sobre multas emitidas;
* debe respetar plazo de reclamo si existe;
* resolución requiere motivo;
* resolución debe auditarse.

---

## 8.5. FineStatusHistory

Responsabilidad:

* preservar la evolución funcional del estado de una multa;
* complementar auditoría global;
* facilitar trazabilidad administrativa.

Campos conceptuales:

```text id="r4ut2g"
id
tenantId
fineId
fromStatus
toStatus
actorUserId
reason
occurredAt
metadata
```

Reglas:

* `tenantId` obligatorio;
* `fineId` obligatorio;
* `toStatus` obligatorio;
* `occurredAt` obligatorio;
* metadata sanitizada;
* no debe contener payload completo;
* no debe contener tokens, secretos ni archivos.

---

# 9. Value Objects

## 9.1. FineConceptCode

Responsabilidad:

* validar código legible de concepto;
* garantizar unicidad por tenant a nivel de repositorio.

Ejemplos:

```text id="rxaipl"
NOISE
PARKING-VIOLATION
COMMON-AREA-MISUSE
PET-CONTROL
```

---

## 9.2. FineConceptStatus

Valores:

```text id="l5b8xh"
active
inactive
archived
```

---

## 9.3. FineCategory

Valores sugeridos iniciales:

```text id="rs6fqk"
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

## 9.4. FineStatus

Valores:

```text id="s50xr8"
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

## 9.5. FineSeverity

Valores:

```text id="z1wn3j"
low
medium
high
critical
```

---

## 9.6. FineMoney

Responsabilidad:

* manejar montos;
* usar Decimal;
* aceptar string decimal;
* exponer string;
* impedir float/double;
* validar no negativo.

---

## 9.7. FineTitle

Responsabilidad:

* validar título;
* limitar longitud;
* evitar texto vacío;
* evitar payloads excesivos.

---

## 9.8. FineDescription

Responsabilidad:

* validar descripción obligatoria;
* limitar longitud;
* permitir texto claro;
* evitar contenido peligroso;
* evitar payloads excesivos.

---

## 9.9. FineReason

Responsabilidad:

* validar razones de rechazo, cancelación, condonación, reverso y resolución;
* impedir razones vacías;
* limitar longitud.

---

## 9.10. FineEvidenceType

Valores:

```text id="ba75bx"
text
image
document
video
reference
other
```

---

## 9.11. FineEvidenceStatus

Valores:

```text id="g9ptis"
active
rejected
archived
```

---

## 9.12. FineAppealStatus

Valores:

```text id="j66d6b"
submitted
underReview
accepted
rejected
cancelled
archived
```

---

## 9.13. FinePaymentStatusSnapshot

Valores:

```text id="elxw9f"
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

Regla:

```text id="fw96j9"
Este snapshot es informativo; no reemplaza módulos financieros.
```

---

# 10. Modelo de datos y persistencia

## 10.1. Tablas nuevas

```text id="vys8sl"
fine_concepts
fines
fine_evidence
fine_appeals
fine_status_history
```

---

## 10.2. Relaciones principales

```text id="imyo01"
tenants 1 ── * fine_concepts
tenants 1 ── * fines
fine_concepts 1 ── * fines
property_units 1 ── * fines
persons 0..1 ── * fines
user_profiles 1 ── * fines
fines 1 ── * fine_evidence
fines 1 ── * fine_appeals
fines 1 ── * fine_status_history
charges 0..1 ── 1 fines
charge_concepts 0..1 ── * fine_concepts
```

---

## 10.3. Estrategia multitenant

Todas las tablas deben incluir:

```text id="dxa7mg"
tenant_id
```

Toda consulta debe filtrar:

```text id="lqs6xq"
WHERE tenant_id = currentTenant.id
```

Regla:

```text id="naazsp"
Ningún concepto, multa, evidencia, reclamo o historial puede cruzar tenants.
```

---

## 10.4. Dinero

Campos monetarios:

```text id="o9o11v"
fine_concepts.default_amount
fines.amount
```

Reglas:

* usar `Decimal(12,2)`;
* no usar float/double;
* devolver por API como string;
* moneda por defecto `USD`;
* monto no puede ser negativo.

---

## 10.5. Idempotencia financiera

La generación de cargo debe ser idempotente.

Mecanismos:

```text id="msbwz7"
fine.chargeId unique
idempotencyKey = fine:{fineId}:charge
lookup before create
transaction
```

---

## 10.6. Índices recomendados

```text id="ckfkro"
fine_concepts:
- tenant_id
- tenant_id + code
- tenant_id + status
- tenant_id + category
- charge_concept_id

fines:
- tenant_id
- tenant_id + fine_concept_id
- tenant_id + property_unit_id
- tenant_id + responsible_person_id
- tenant_id + status
- tenant_id + severity
- tenant_id + occurred_at
- tenant_id + reported_at
- tenant_id + issued_at
- tenant_id + charge_id
- tenant_id + property_unit_id + status

fine_evidence:
- tenant_id
- tenant_id + fine_id
- tenant_id + evidence_type
- tenant_id + status
- uploaded_by

fine_appeals:
- tenant_id
- tenant_id + fine_id
- tenant_id + submitted_by
- tenant_id + status
- tenant_id + submitted_at

fine_status_history:
- tenant_id
- tenant_id + fine_id
- tenant_id + actor_user_id
- tenant_id + occurred_at
```

---

# 11. Puertos de aplicación

## 11.1. FineConceptReaderPort

Contrato conceptual:

```text id="b1z1cc"
findById(tenantId, fineConceptId)
findByCode(tenantId, code)
list(tenantId, filters, pagination)
existsActiveCode(tenantId, code)
```

---

## 11.2. FineConceptWriterPort

Contrato:

```text id="gr2rjm"
create(tenantId, input, actor)
update(tenantId, fineConceptId, input, actor)
activate(tenantId, fineConceptId, actor)
deactivate(tenantId, fineConceptId, actor)
archive(tenantId, fineConceptId, actor)
```

---

## 11.3. FineReaderPort

Contrato:

```text id="uey6az"
findById(tenantId, fineId)
list(tenantId, filters, pagination)
listOwn(tenantId, actorUserId, filters, pagination)
findOwnById(tenantId, actorUserId, fineId)
findByChargeId(tenantId, chargeId)
```

---

## 11.4. FineWriterPort

Contrato:

```text id="hrdba2"
create(tenantId, input, actor)
updateDraft(tenantId, fineId, input, actor)
updateStatus(tenantId, fineId, transition, actor)
attachCharge(tenantId, fineId, chargeId, actor)
createStatusHistory(tenantId, fineId, history)
archive(tenantId, fineId, actor)
```

---

## 11.5. FineEvidenceReaderPort

Contrato:

```text id="yhnkb7"
listByFine(tenantId, fineId, filters)
findById(tenantId, evidenceId)
hasActiveEvidence(tenantId, fineId)
```

---

## 11.6. FineEvidenceWriterPort

Contrato:

```text id="lb4u0o"
create(tenantId, fineId, input, actor)
archive(tenantId, evidenceId, actor, reason)
```

---

## 11.7. FineAppealReaderPort

Contrato:

```text id="t4qxfg"
listByFine(tenantId, fineId)
findById(tenantId, appealId)
listOwn(tenantId, actorUserId, filters, pagination)
hasOpenAppeal(tenantId, fineId)
```

---

## 11.8. FineAppealWriterPort

Contrato:

```text id="tf7s0x"
submit(tenantId, fineId, input, actor)
accept(tenantId, appealId, input, actor)
reject(tenantId, appealId, input, actor)
cancel(tenantId, appealId, input, actor)
```

---

## 11.9. FineChargePort

Contrato:

```text id="gezaz1"
generateChargeForFine(tenantId, fineId, input, actor)
findChargeForFine(tenantId, fineId)
```

Este puerto delega en `004-dues-fees`.

---

## 11.10. FinePropertyUnitPort

Contrato:

```text id="ycwhr5"
findPropertyUnitById(tenantId, propertyUnitId)
userCanAccessPropertyUnit(tenantId, actorUserId, propertyUnitId)
findPropertyUnitsForUser(tenantId, actorUserId)
```

Este puerto usa `003-residents-properties`.

---

## 11.11. FinePersonPort

Contrato:

```text id="ct1f0v"
findPersonById(tenantId, personId)
personBelongsToTenant(tenantId, personId)
personRelatedToPropertyUnit(tenantId, personId, propertyUnitId)
```

---

## 11.12. FineFileStoragePort

Contrato:

```text id="jpejl3"
storeEvidenceFile(tenantId, fineId, file, actor)
getSignedDownloadUrl(tenantId, evidenceId, actor)
validateFile(file)
```

En MVP puede quedar como puerto preparado si la primera implementación registra solo referencias de evidencia.

---

## 11.13. FineAuditPort

Contrato:

```text id="uzcyo6"
auditFineConceptCreated(...)
auditFineCreated(...)
auditFineApproved(...)
auditFineRejected(...)
auditFineIssued(...)
auditFineCancelled(...)
auditFineWaived(...)
auditFineReversed(...)
auditFineChargeGenerated(...)
auditFineEvidenceAdded(...)
auditFineAppealSubmitted(...)
auditFineAppealResolved(...)
```

---

# 12. Servicios de aplicación

## 12.1. FineConceptService

Responsabilidades:

* crear conceptos;
* actualizar conceptos;
* activar/desactivar;
* archivar;
* validar código único;
* validar monto base;
* validar concepto financiero;
* auditar cambios.

---

## 12.2. FineService

Responsabilidades:

* crear multas;
* actualizar multas en borrador;
* consultar multas;
* ejecutar transiciones;
* coordinar validación de unidad;
* coordinar validación de persona responsable;
* coordinar evidencia requerida;
* coordinar generación de cargo;
* auditar eventos.

---

## 12.3. FineEvidenceService

Responsabilidades:

* registrar evidencias;
* validar tipo de evidencia;
* validar metadata de archivo;
* controlar acceso;
* archivar evidencia;
* auditar.

---

## 12.4. FineAppealService

Responsabilidades:

* presentar reclamos;
* validar estado de multa;
* validar plazo de reclamo;
* resolver reclamos;
* cambiar estado de multa si aplica;
* auditar.

---

## 12.5. FineStateMachineService

Responsabilidades:

* validar transiciones de estado;
* impedir transiciones inválidas;
* requerir razones;
* crear historial;
* proveer errores consistentes.

---

## 12.6. FineChargeService

Responsabilidades:

* determinar si una multa requiere cargo;
* construir solicitud de cargo;
* llamar puerto financiero;
* garantizar idempotencia;
* adjuntar `chargeId`;
* actualizar `paymentStatusSnapshot`;
* no procesar pagos.

---

## 12.7. FineOwnershipService

Responsabilidades:

* validar que un usuario puede consultar multas de una unidad;
* validar que un usuario puede reclamar una multa;
* usar relaciones de `003-residents-properties`;
* bloquear acceso a multas ajenas.

---

## 12.8. FinePolicyService

Responsabilidades:

* validar evidencia requerida;
* validar plazo de reclamo;
* validar permisos de resolución;
* validar estado editable;
* validar emisión;
* validar condonación/reverso.

---

## 12.9. FineMoneyService

Responsabilidades:

* manejar Decimal;
* exponer strings;
* validar montos;
* impedir float;
* validar moneda.

---

## 12.10. FineEvidenceAccessService

Responsabilidades:

* decidir quién puede ver evidencia;
* diferenciar admin vs own;
* ocultar evidencias restringidas;
* generar URLs firmadas si aplica;
* bloquear acceso público.

---

## 12.11. FineAuditService

Responsabilidades:

* emitir eventos hacia `007-audit`;
* sanitizar metadata;
* evitar payloads completos;
* incluir traceId/correlationId.

---

# 13. Casos de uso

## 13.1. CreateFineConceptUseCase

Endpoint:

```text id="uvwvbu"
POST /api/v1/tenant/fine-concepts
```

Responsabilidades:

* validar permiso `fineConcepts.create`;
* validar DTO;
* validar código único;
* validar monto;
* validar concepto financiero si aplica;
* crear concepto;
* auditar `fineConcept.created`.

---

## 13.2. ListFineConceptsUseCase

Endpoint:

```text id="vs7ano"
GET /api/v1/tenant/fine-concepts
```

Responsabilidades:

* validar permiso `fineConcepts.read`;
* filtrar por estado/categoría;
* paginar;
* devolver DTO administrativo.

---

## 13.3. GetFineConceptUseCase

Endpoint:

```text id="l647lf"
GET /api/v1/tenant/fine-concepts/{fineConceptId}
```

Responsabilidades:

* validar permiso;
* filtrar por tenant;
* devolver detalle.

---

## 13.4. UpdateFineConceptUseCase

Endpoint:

```text id="bpjsjy"
PATCH /api/v1/tenant/fine-concepts/{fineConceptId}
```

Responsabilidades:

* validar permiso `fineConcepts.update`;
* validar estado;
* validar monto;
* validar concepto financiero;
* actualizar;
* auditar `fineConcept.updated`.

---

## 13.5. FineConcept state use cases

Endpoints:

```text id="fkl9lr"
POST /api/v1/tenant/fine-concepts/{fineConceptId}/activate
POST /api/v1/tenant/fine-concepts/{fineConceptId}/deactivate
POST /api/v1/tenant/fine-concepts/{fineConceptId}/archive
```

Responsabilidades:

* cambiar estado;
* impedir uso de archivados;
* preservar historial;
* auditar.

---

## 13.6. CreateFineUseCase

Endpoint:

```text id="bsaicc"
POST /api/v1/tenant/fines
```

Responsabilidades:

* validar permiso `fines.create`;
* validar concepto activo;
* validar unidad del tenant;
* validar persona responsable si existe;
* validar descripción;
* calcular o copiar monto desde concepto;
* crear multa;
* crear historial inicial;
* auditar.

---

## 13.7. ListFinesUseCase

Endpoint:

```text id="h072lv"
GET /api/v1/tenant/fines
```

Responsabilidades:

* validar permiso `fines.read`;
* filtrar por estado, concepto, unidad, severidad y fechas;
* paginar;
* aplicar tenantId;
* devolver DTO administrativo.

---

## 13.8. GetFineUseCase

Endpoint:

```text id="utwrkb"
GET /api/v1/tenant/fines/{fineId}
```

Responsabilidades:

* validar permiso `fines.read`;
* cargar multa por tenant;
* devolver detalle administrativo.

---

## 13.9. UpdateFineUseCase

Endpoint:

```text id="duhy67"
PATCH /api/v1/tenant/fines/{fineId}
```

Responsabilidades:

* validar permiso `fines.update`;
* permitir actualización solo en estados editables;
* no permitir modificación silenciosa de multa emitida;
* auditar cambios.

---

## 13.10. SubmitFineReviewUseCase

Endpoint:

```text id="uooije"
POST /api/v1/tenant/fines/{fineId}/submit-review
```

Responsabilidades:

* validar permiso `fines.review`;
* validar estado;
* mover a `underReview`;
* crear historial;
* auditar.

---

## 13.11. ApproveFineUseCase

Endpoint:

```text id="f13thv"
POST /api/v1/tenant/fines/{fineId}/approve
```

Responsabilidades:

* validar permiso `fines.approve`;
* validar estado aprobable;
* validar evidencia requerida;
* validar datos mínimos;
* mover a `approved`;
* crear historial;
* auditar.

---

## 13.12. RejectFineUseCase

Endpoint:

```text id="kjvqsd"
POST /api/v1/tenant/fines/{fineId}/reject
```

Responsabilidades:

* validar permiso `fines.reject`;
* validar estado rechazable;
* requerir razón;
* mover a `rejected`;
* crear historial;
* auditar.

---

## 13.13. IssueFineUseCase

Endpoint:

```text id="x1zlcj"
POST /api/v1/tenant/fines/{fineId}/issue
```

Responsabilidades:

* validar permiso `fines.issue`;
* validar estado `approved`;
* generar cargo si aplica;
* mover a `issued`;
* definir `issuedAt`;
* crear historial;
* auditar.

---

## 13.14. CancelFineUseCase

Endpoint:

```text id="xq1a10"
POST /api/v1/tenant/fines/{fineId}/cancel
```

Responsabilidades:

* validar permiso `fines.cancel`;
* validar estado cancelable;
* requerir razón;
* no eliminar;
* no revertir cargo automáticamente;
* crear historial;
* auditar.

---

## 13.15. WaiveFineUseCase

Endpoint:

```text id="sa52jo"
POST /api/v1/tenant/fines/{fineId}/waive
```

Responsabilidades:

* validar permiso `fines.waive`;
* requerir razón;
* validar estado;
* mover a `waived`;
* no borrar cargo silenciosamente;
* crear historial;
* auditar.

---

## 13.16. ReverseFineUseCase

Endpoint:

```text id="kciuy0"
POST /api/v1/tenant/fines/{fineId}/reverse
```

Responsabilidades:

* validar permiso `fines.reverse`;
* requerir razón;
* validar estado;
* mover a `reversed`;
* dejar trazabilidad para reverso financiero;
* crear historial;
* auditar.

---

## 13.17. ArchiveFineUseCase

Endpoint:

```text id="h50fwx"
POST /api/v1/tenant/fines/{fineId}/archive
```

Responsabilidades:

* validar permiso `fines.archive`;
* validar estado archivable;
* aplicar soft archive;
* no eliminar historial;
* auditar.

---

## 13.18. GenerateFineChargeUseCase

Endpoint:

```text id="d8u8iv"
POST /api/v1/tenant/fines/{fineId}/generate-charge
```

Responsabilidades:

* validar permiso `fines.generateCharge`;
* validar multa monetaria;
* validar concepto financiero;
* garantizar idempotencia;
* generar cargo vía `004-dues-fees`;
* adjuntar `chargeId`;
* auditar.

---

## 13.19. AddFineEvidenceUseCase

Endpoint:

```text id="umwmij"
POST /api/v1/tenant/fines/{fineId}/evidence
```

Responsabilidades:

* validar permiso `fineEvidence.create`;
* validar multa del tenant;
* validar tipo de evidencia;
* validar archivo o referencia;
* crear evidencia;
* auditar.

---

## 13.20. ListFineEvidenceUseCase

Endpoint:

```text id="siycxv"
GET /api/v1/tenant/fines/{fineId}/evidence
```

Responsabilidades:

* validar permiso `fineEvidence.read`;
* listar evidencia de la multa;
* aplicar tenantId;
* no exponer archivo sin permiso de descarga.

---

## 13.21. DownloadFineEvidenceUseCase

Endpoint:

```text id="qx01tw"
GET /api/v1/tenant/fine-evidence/{evidenceId}/download
```

Responsabilidades:

* validar permiso `fineEvidence.download`;
* validar tenant;
* devolver URL firmada o stream seguro;
* auditar `fineEvidence.downloaded`.

---

## 13.22. ArchiveFineEvidenceUseCase

Endpoint:

```text id="mjhx6j"
POST /api/v1/tenant/fine-evidence/{evidenceId}/archive
```

Responsabilidades:

* validar permiso;
* aplicar archivo lógico;
* auditar.

---

## 13.23. SubmitOwnFineAppealUseCase

Endpoint:

```text id="sr2595"
POST /api/v1/me/fines/{fineId}/appeals
```

Responsabilidades:

* validar permiso `fineAppeals.submit.own`;
* validar multa propia;
* validar estado `issued`;
* validar plazo;
* crear reclamo;
* mover multa a `disputed`;
* crear historial;
* auditar.

---

## 13.24. ResolveFineAppealUseCases

Endpoints:

```text id="rg84vd"
POST /api/v1/tenant/fine-appeals/{appealId}/accept
POST /api/v1/tenant/fine-appeals/{appealId}/reject
POST /api/v1/tenant/fine-appeals/{appealId}/cancel
```

Responsabilidades:

* validar permiso `fineAppeals.resolve`;
* validar estado de reclamo;
* requerir resolución;
* mover reclamo;
* mover multa según resultado;
* auditar.

---

## 13.25. Own query use cases

Endpoints:

```text id="gcqm2u"
GET /api/v1/me/fines
GET /api/v1/me/fines/{fineId}
GET /api/v1/me/fines/{fineId}/evidence
GET /api/v1/me/fine-appeals
GET /api/v1/me/fine-appeals/{appealId}
```

Responsabilidades:

* validar permisos own;
* validar unidades propias;
* no exponer multas de terceros;
* limitar evidencia según política;
* devolver DTO propio minimizado.

---

# 14. Controladores REST

## 14.1. FineConceptsController

Ruta base:

```text id="zj6xko"
/api/v1/tenant/fine-concepts
```

Endpoints:

```text id="ivxvm4"
GET /
POST /
GET /:fineConceptId
PATCH /:fineConceptId
POST /:fineConceptId/activate
POST /:fineConceptId/deactivate
POST /:fineConceptId/archive
```

Guards:

```text id="xp21jj"
AuthGuard
TenantGuard
TenantPermissionGuard
FineConceptPermissionGuard
```

---

## 14.2. FinesController

Ruta base:

```text id="n9q1um"
/api/v1/tenant/fines
```

Endpoints:

```text id="ldkj7p"
GET /
POST /
GET /:fineId
PATCH /:fineId
POST /:fineId/submit-review
POST /:fineId/approve
POST /:fineId/reject
POST /:fineId/issue
POST /:fineId/cancel
POST /:fineId/waive
POST /:fineId/reverse
POST /:fineId/archive
POST /:fineId/generate-charge
```

Guards:

```text id="cxdnoe"
AuthGuard
TenantGuard
TenantPermissionGuard
FinePermissionGuard
FineFinancialGuard for generate-charge
```

---

## 14.3. FineEvidenceController

Rutas:

```text id="v1lvgi"
/api/v1/tenant/fines/:fineId/evidence
/api/v1/tenant/fine-evidence/:evidenceId
```

Endpoints:

```text id="io34pi"
GET /api/v1/tenant/fines/:fineId/evidence
POST /api/v1/tenant/fines/:fineId/evidence
GET /api/v1/tenant/fine-evidence/:evidenceId
GET /api/v1/tenant/fine-evidence/:evidenceId/download
POST /api/v1/tenant/fine-evidence/:evidenceId/archive
```

---

## 14.4. FineAppealsController

Rutas:

```text id="mhguye"
/api/v1/tenant/fines/:fineId/appeals
/api/v1/tenant/fine-appeals/:appealId
```

Endpoints:

```text id="phvduh"
GET /api/v1/tenant/fines/:fineId/appeals
GET /api/v1/tenant/fine-appeals/:appealId
POST /api/v1/tenant/fine-appeals/:appealId/accept
POST /api/v1/tenant/fine-appeals/:appealId/reject
POST /api/v1/tenant/fine-appeals/:appealId/cancel
```

---

## 14.5. MyFinesController

Ruta base:

```text id="ndhb9d"
/api/v1/me/fines
```

Endpoints:

```text id="dmrzfy"
GET /
GET /:fineId
GET /:fineId/evidence
POST /:fineId/appeals
```

Guards:

```text id="o5bw5g"
AuthGuard
TenantGuard
TenantPermissionGuard
OwnFineGuard
```

---

## 14.6. MyFineAppealsController

Ruta base:

```text id="ld7f9u"
/api/v1/me/fine-appeals
```

Endpoints:

```text id="lqxlzs"
GET /
GET /:appealId
```

---

# 15. DTOs principales

## 15.1. CreateFineConceptDto

```json id="guq0io"
{
  "code": "NOISE",
  "name": "Ruido excesivo",
  "description": "Multa por ruido fuera de horarios permitidos.",
  "category": "noise",
  "defaultAmount": "25.00",
  "currency": "USD",
  "chargeConceptId": "charge_concept_uuid",
  "requiresEvidence": true,
  "allowsAppeal": true,
  "appealDeadlineDays": 5
}
```

---

## 15.2. FineConceptDto

```json id="hyxcqk"
{
  "id": "fine_concept_uuid",
  "code": "NOISE",
  "name": "Ruido excesivo",
  "description": "Multa por ruido fuera de horarios permitidos.",
  "category": "noise",
  "defaultAmount": "25.00",
  "currency": "USD",
  "chargeConceptId": "charge_concept_uuid",
  "requiresEvidence": true,
  "allowsAppeal": true,
  "appealDeadlineDays": 5,
  "status": "active"
}
```

---

## 15.3. CreateFineDto

```json id="ul8bc3"
{
  "fineConceptId": "fine_concept_uuid",
  "propertyUnitId": "property_unit_uuid",
  "responsiblePersonId": "person_uuid",
  "title": "Ruido excesivo en horario nocturno",
  "description": "Se reporta ruido excesivo después de las 23h00.",
  "occurredAt": "2026-08-20T04:30:00Z",
  "severity": "medium",
  "amount": "25.00",
  "currency": "USD"
}
```

---

## 15.4. FineDto administrativo

```json id="frbkuv"
{
  "id": "fine_uuid",
  "fineConceptId": "fine_concept_uuid",
  "fineConceptName": "Ruido excesivo",
  "propertyUnitId": "property_unit_uuid",
  "propertyUnitCode": "Casa 01",
  "responsiblePersonId": "person_uuid",
  "title": "Ruido excesivo en horario nocturno",
  "description": "Se reporta ruido excesivo después de las 23h00.",
  "occurredAt": "2026-08-20T04:30:00Z",
  "reportedAt": "2026-08-20T15:00:00Z",
  "status": "reported",
  "severity": "medium",
  "amount": "25.00",
  "currency": "USD",
  "chargeId": null,
  "paymentStatusSnapshot": "pendingCharge",
  "dueDate": null
}
```

---

## 15.5. OwnFineDto

```json id="p8qkb7"
{
  "id": "fine_uuid",
  "fineConceptName": "Ruido excesivo",
  "propertyUnitId": "property_unit_uuid",
  "propertyUnitCode": "Casa 01",
  "title": "Ruido excesivo en horario nocturno",
  "description": "Se reporta ruido excesivo después de las 23h00.",
  "occurredAt": "2026-08-20T04:30:00Z",
  "status": "issued",
  "severity": "medium",
  "amount": "25.00",
  "currency": "USD",
  "paymentStatusSnapshot": "pendingPayment",
  "issuedAt": "2026-08-21T15:00:00Z",
  "allowsAppeal": true,
  "appealDeadlineAt": "2026-08-26T15:00:00Z"
}
```

---

## 15.6. AddFineEvidenceDto

```json id="g3jj0t"
{
  "evidenceType": "image",
  "title": "Fotografía del evento",
  "description": "Imagen referencial cargada por administración.",
  "fileUrl": "storage://tenant/fines/fine_uuid/evidence_uuid.jpg",
  "fileName": "evidence.jpg",
  "mimeType": "image/jpeg",
  "fileSizeBytes": 245000
}
```

---

## 15.7. FineEvidenceDto

```json id="rxg4jm"
{
  "id": "evidence_uuid",
  "fineId": "fine_uuid",
  "evidenceType": "image",
  "title": "Fotografía del evento",
  "description": "Imagen referencial cargada por administración.",
  "fileName": "evidence.jpg",
  "mimeType": "image/jpeg",
  "fileSizeBytes": 245000,
  "uploadedAt": "2026-08-20T15:00:00Z",
  "status": "active"
}
```

---

## 15.8. SubmitFineAppealDto

```json id="xuag1p"
{
  "reason": "La multa no corresponde porque no hubo ruido fuera del horario permitido."
}
```

---

## 15.9. ResolveFineAppealDto

```json id="c7u50p"
{
  "resolution": "accepted",
  "resolutionNotes": "Se acepta el reclamo por falta de evidencia suficiente.",
  "nextFineAction": "waive"
}
```

---

## 15.10. Action reason DTOs

Para rechazo, cancelación, condonación y reverso:

```json id="lbcf3w"
{
  "reason": "Justificación administrativa de la decisión."
}
```

---

# 16. Autenticación y autorización

## 16.1. Endpoints tenant administrativos

Requieren:

```text id="l4zq0i"
AuthGuard
TenantGuard
TenantPermissionGuard
```

---

## 16.2. Endpoints `/me`

Requieren:

```text id="h5gyxz"
AuthGuard
TenantGuard
TenantPermissionGuard
OwnFineGuard
```

La autorización debe validar:

```text id="ukiope"
usuario -> person -> unidad -> fine
```

---

## 16.3. Endpoints públicos WordPress

No existen endpoints públicos para multas.

Regla:

```text id="fxwbu5"
Ninguna multa, evidencia, reclamo o historial debe exponerse por /api/v1/public.
```

---

## 16.4. Permisos

### Fine Concepts

```text id="gh03q8"
fineConcepts.create
fineConcepts.read
fineConcepts.update
fineConcepts.archive
```

### Fines Admin

```text id="jsdkgx"
fines.create
fines.read
fines.update
fines.review
fines.approve
fines.reject
fines.issue
fines.cancel
fines.waive
fines.reverse
fines.archive
fines.generateCharge
```

### Evidence

```text id="o6umvh"
fineEvidence.create
fineEvidence.read
fineEvidence.archive
fineEvidence.download
```

### Appeals

```text id="wrhkm7"
fineAppeals.read
fineAppeals.resolve
fineAppeals.submit.own
fineAppeals.read.own
```

### Own

```text id="xh75dh"
fines.read.own
fineEvidence.read.own
```

### Audit and Reports

```text id="tv2b6x"
fines.audit.read
fines.reports.read
```

---

# 17. Integración financiera

## 17.1. Fuente de cargos

El módulo de multas no crea cargos escribiendo directamente en tablas financieras.

Debe usar puerto:

```text id="gzb57k"
FineChargePort
```

Implementado como adaptador hacia `004-dues-fees`.

---

## 17.2. Momento de generación de cargo

Decisión MVP recomendada:

```text id="sjfrto"
Generar cargo al emitir la multa, si amount > 0.
```

Motivos:

* evita cargos por borradores;
* evita cargos por multas rechazadas;
* evita cargos por casos aún no revisados;
* alinea la deuda con una decisión formal;
* simplifica trazabilidad financiera.

---

## 17.3. Idempotencia

Regla:

```text id="h5u28i"
Una multa no puede tener más de un cargo activo generado por el mismo evento sancionatorio.
```

Mecanismos:

```text id="ur67pv"
fine.chargeId
idempotencyKey = fine:{fineId}:charge
unique constraint futura sobre charge source
validación transaccional
```

---

## 17.4. Reverso, condonación y reclamos

Decisión MVP:

```text id="nc3gzq"
Condonar, reversar o aceptar reclamo no modifica automáticamente pagos ni saldos.
```

La reversión, ajuste o condonación financiera formal debe realizarse mediante flujos financieros controlados.

---

## 17.5. PaymentStatusSnapshot

Este campo es informativo.

No reemplaza:

```text id="bhhzrl"
charges
payments
payment_allocations
account_statements
unit_balances
```

---

# 18. Evidencias y archivos

## 18.1. Tipos permitidos

```text id="h46v1k"
text
image
document
video
reference
other
```

---

## 18.2. Validaciones mínimas

MVP debe validar:

```text id="eq79g2"
evidenceType
title
description
fileName si aplica
mimeType si aplica
fileSizeBytes si aplica
status
tenantId
fineId
```

---

## 18.3. Almacenamiento

Opciones:

```text id="xzlgif"
1. Referencias a archivos ya almacenados.
2. Integración con storage S3-compatible.
3. Solo evidencia textual en primer incremento.
```

Recomendación MVP:

```text id="hbr3fg"
Permitir evidencia textual y referencia de archivo; subida binaria directa puede diferirse si el storage aún no está cerrado.
```

---

## 18.4. Seguridad de evidencias

Reglas:

```text id="njyz33"
no URLs públicas directas para archivos privados
descargas con permiso
URL firmada temporal si aplica
auditar descargas
no exponer evidencia a WordPress
```

---

# 19. Reclamos

## 19.1. Presentación de reclamo

Reglas:

* solo multas `issued`;
* solo usuario con acceso a la unidad;
* motivo obligatorio;
* dentro de plazo si aplica;
* crea `FineAppeal`;
* cambia multa a `disputed`.

---

## 19.2. Resolución de reclamo

Opciones:

```text id="ahcj3m"
accept
reject
cancel
```

Si se acepta:

```text id="rsjx5z"
fine -> appealAccepted -> waived
```

o:

```text id="prdmrc"
fine -> appealAccepted -> reversed
```

Si se rechaza:

```text id="z9sd9p"
fine -> appealRejected -> issued
```

---

## 19.3. Reclamos duplicados

MVP recomendado:

```text id="pp4y3j"
No permitir más de un reclamo abierto por multa.
```

---

# 20. Estados y máquina de estados

## 20.1. Transiciones permitidas

```text id="evaf7p"
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

## 20.2. Transiciones prohibidas

Ejemplos:

```text id="wq5l2l"
rejected -> issued
cancelled -> issued
waived -> issued
reversed -> issued
archived -> approved
issued -> approved
draft -> issued
```

---

## 20.3. Registro de historial

Toda transición debe generar:

```text id="bw7tp4"
FineStatusHistory
AuditLog
```

---

# 21. Auditoría

## 21.1. Eventos mínimos

```text id="e1x5aq"
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

---

## 21.2. Metadata permitida

```text id="zoqxx0"
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

---

## 21.3. Metadata prohibida

```text id="ejohzg"
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

# 22. Observabilidad

## 22.1. Logs estructurados

Logs sugeridos:

```text id="fs7vsr"
fineConcept.created
fineConcept.updated
fine.created
fine.updated
fine.approved
fine.rejected
fine.issued
fine.cancelled
fine.waived
fine.reversed
fine.chargeGenerated
fine.chargeGenerationFailed
fineEvidence.added
fineEvidence.archived
fineAppeal.submitted
fineAppeal.accepted
fineAppeal.rejected
```

---

## 22.2. Métricas

```text id="d6hlmb"
fines_created_total
fines_approved_total
fines_rejected_total
fines_issued_total
fines_cancelled_total
fines_waived_total
fines_reversed_total
fines_disputed_total
fines_charge_generated_total
fines_charge_generation_failed_total
fine_appeals_submitted_total
fine_evidence_added_total
```

---

## 22.3. Labels permitidos

```text id="dmrejf"
status
action
outcome
severity
category
```

---

## 22.4. Labels prohibidos

```text id="qg9fw4"
tenantId
fineId
fineConceptId
propertyUnitId
personId
userId
chargeId
traceId
```

---

# 23. Seguridad

## 23.1. Controles obligatorios

```text id="py4ay0"
tenant isolation
permission guards
own-resource authorization
property unit validation
responsible person validation
evidence access control
state transition validation
reason requirements
Decimal money
idempotent charge generation
audit events
status history
safe errors
safe logging
no public WordPress exposure
```

---

## 23.2. Riesgos principales

| Riesgo                             | Mitigación                 |
| ---------------------------------- | -------------------------- |
| Multa cross-tenant                 | tenant_id + guards + tests |
| Multa sobre unidad ajena           | FineOwnershipService       |
| Persona responsable de otro tenant | FinePersonPort             |
| Exposición de evidencia            | FineEvidenceAccessService  |
| Cargo duplicado                    | idempotencia + chargeId    |
| Uso de float                       | FineMoney                  |
| Estado inválido                    | State machine              |
| Rechazo/cancelación sin razón      | FineReason                 |
| Reclamo fuera de plazo             | FinePolicyService          |
| WordPress ve multas                | no public endpoints        |
| Logs con evidencia sensible        | logging policy             |

---

# 24. Testing plan resumido

El documento completo será:

```text id="e4m65a"
docs/specs/011-fines-sanctions/test-plan.md
```

## 24.1. Unit tests

* FineConcept entity.
* Fine entity.
* FineEvidence entity.
* FineAppeal entity.
* FineStatusHistory entity.
* FineMoney.
* State machine.
* Evidence requirement.
* Appeal policy.
* Reason validation.

---

## 24.2. Integration tests

* Crear concepto.
* Actualizar concepto.
* Crear multa.
* Adjuntar evidencia.
* Aprobar multa.
* Rechazar multa.
* Emitir multa.
* Generar cargo.
* Presentar reclamo.
* Resolver reclamo.
* Condonar.
* Reversar.
* Multitenancy.

---

## 24.3. API tests

* Fine concepts.
* Fines admin.
* Fine evidence.
* Fine appeals.
* My fines.
* My appeals.
* Errores.
* Permisos.
* Filtros y paginación.

---

## 24.4. Authorization tests

* Sin token.
* Sin membership.
* Sin permisos.
* Admin autorizado.
* Residente autorizado.
* Residente no autorizado.
* Usuario disabled.

---

## 24.5. Financial regression tests

* Cargo generado una sola vez.
* Cargo tenant correcto.
* Cargo unidad correcta.
* Monto como string.
* No pago desde multas.
* Reclamo no revierte cargo automáticamente.
* Condonación no borra cargo.

---

## 24.6. Security tests

* No cross-tenant.
* No multas ajenas.
* No reclamos ajenos.
* No evidencias ajenas.
* No WordPress exposure.
* No float.
* No secrets in logs.
* No payload completo en audit.

---

# 25. Orden recomendado de desarrollo

## Incremento 1 — Base del módulo

```text id="uewfuw"
FinesModule
estructura de carpetas
value objects
errores
state machine
DTOs base
```

---

## Incremento 2 — Fine Concepts

```text id="gkeokb"
FineConcept entity
FineConcept repository
FineConcept service
FineConceptsController
CRUD administrativo
active/inactive/archived
```

---

## Incremento 3 — Fine Core

```text id="xz4kjl"
Fine entity
Fine repository
FineService
FinePolicyService
FineStateMachineService
create/list/get/update draft
```

---

## Incremento 4 — Evidence

```text id="ah8jvs"
FineEvidence entity
FineEvidence repository
FineEvidenceService
evidence access control
add/list/get/download/archive
```

---

## Incremento 5 — Review Workflow

```text id="kxya2c"
submit-review
approve
reject
issue
cancel
status history
audit events
```

---

## Incremento 6 — Financial Integration

```text id="gmwgiu"
FineChargePort
FineChargeService
generate charge
idempotency
chargeId attach
financial regression tests
```

---

## Incremento 7 — Own Fines

```text id="mbr9vb"
FineOwnershipService
ListOwnFinesUseCase
GetOwnFineUseCase
OwnFineGuard
own evidence limited access
```

---

## Incremento 8 — Appeals

```text id="bojk99"
FineAppeal entity
FineAppealService
SubmitOwnFineAppealUseCase
AcceptFineAppealUseCase
RejectFineAppealUseCase
CancelFineAppealUseCase
```

---

## Incremento 9 — Waiver and Reversal

```text id="m58py0"
waive fine
reverse fine
audit
financial traceability
no automatic payment mutation
```

---

## Incremento 10 — Hardening

```text id="w3kfez"
OpenAPI
observability
security tests
performance tests
CI gates
SDD review
```

---

# 26. Performance

## 26.1. Objetivo MVP

```text id="cd5334"
p95 < 700 ms para listados paginados de multas con filtros comunes.
```

---

## 26.2. Estrategias

```text id="izbrdf"
índices por tenant/status/propertyUnit/fineConcept/issuedAt
paginación obligatoria
pageSize máximo
filtros explícitos
evitar N+1
no cargar evidencias pesadas en listados
descarga de evidencia separada
```

---

# 27. Criterios técnicos de aceptación

La implementación técnica se acepta si:

* existe módulo `fines`;
* existen tablas requeridas;
* existe gestión de conceptos de multa;
* existe gestión de multas;
* existe gestión de evidencias;
* existe gestión de reclamos;
* existe flujo de revisión;
* existe aprobación;
* existe rechazo;
* existe emisión;
* existe cancelación;
* existe condonación;
* existe reverso;
* existe generación de cargo idempotente;
* no se procesan pagos desde multas;
* no se modifican estados de cuenta directamente;
* no se expone información en WordPress público;
* se mantiene historial de estados;
* se auditan operaciones críticas;
* se protegen evidencias;
* se protegen multas propias;
* OpenAPI está actualizado;
* pruebas pasan;
* CI pasa.

---

# 28. Comandos esperados

Comandos generales:

```bash id="vwdg1o"
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

```bash id="scglbn"
npm run test:fines
npm run test:fines:unit
npm run test:fines:integration
npm run test:fines:api
npm run test:fines:authorization
npm run test:fines:multitenancy
npm run test:fines:financial
npm run test:fines:evidence
npm run test:fines:appeals
npm run test:fines:security
```

---

# 29. Riesgos de implementación

| Riesgo                              | Impacto    | Mitigación                 |
| ----------------------------------- | ---------- | -------------------------- |
| Multa cross-tenant                  | Crítico    | tenant_id + guards + tests |
| Unidad ajena                        | Alto       | FineOwnershipService       |
| Responsable de otro tenant          | Alto       | FinePersonPort             |
| Evidencia expuesta                  | Alto       | FineEvidenceAccessService  |
| Cargo duplicado                     | Alto       | idempotencia               |
| Uso de float                        | Alto       | Decimal                    |
| Estado inválido                     | Alto       | state machine              |
| Reclamo inválido                    | Medio/alto | FinePolicyService          |
| Condonación sin trazabilidad        | Alto       | audit + status history     |
| Reverso sin trazabilidad            | Alto       | audit + status history     |
| WordPress ve multas                 | Crítico    | no public endpoints        |
| Logs con datos sensibles            | Alto       | logging policy             |
| Modificación silenciosa de emitidas | Alto       | state/policy guard         |

---

# 30. Checklist para agentes IA

Antes de generar código para este módulo, el agente debe leer:

```text id="h4e23h"
docs/sdd/constitution.md
docs/sdd/domain-map.md
docs/sdd/architecture.md
docs/sdd/security.md
docs/sdd/api-guidelines.md
docs/sdd/data-governance.md
docs/specs/001-tenants/
docs/specs/002-users-roles/
docs/specs/003-residents-properties/
docs/specs/004-dues-fees/
docs/specs/005-payments/
docs/specs/006-account-statements/
docs/specs/007-audit/
docs/specs/008-basic-reports/
docs/specs/011-fines-sanctions/spec.md
docs/specs/011-fines-sanctions/plan.md
```

El agente no debe:

```text id="r5udyu"
permitir multas cross-tenant
omitir tenantId
permitir multas sobre unidades ajenas
permitir responsable de otro tenant
exponer evidencias a terceros
exponer multas a WordPress
generar cargos duplicados
usar float para dinero
procesar pagos desde multas
modificar estados de cuenta desde multas
revertir cargos automáticamente sin flujo financiero
eliminar historial
permitir transiciones inválidas
omitir auditoría
implementar notificaciones fuera de scope
implementar OCR/IA fuera de scope
implementar pagos online fuera de scope
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
* reglas de dinero;
* idempotencia de cargo;
* status history;
* reglas de evidencia;
* reglas de reclamos.

---

## 31.2. `api-contract.md`

Debe detallar:

* endpoints;
* permisos;
* DTOs;
* responses;
* errores;
* filtros;
* paginación;
* evidencias;
* reclamos;
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
* financial regression tests;
* evidence security tests;
* appeal tests.

---

## 31.4. `tasks.md`

Debe convertir este plan en tareas ejecutables.

---

## 31.5. `security-notes.md`

Debe detallar:

* riesgos cross-tenant;
* riesgos de unidad ajena;
* riesgos de evidencia;
* riesgos financieros;
* riesgos de reclamos;
* riesgos de WordPress;
* controles de auditoría.

---

# 32. Decisión final de implementación

El módulo `011-fines-sanctions` se implementará como módulo transaccional dentro de RESIDENT Core para administrar multas y sanciones.

Para MVP:

```text id="txgehi"
- Crear conceptos de multa.
- Configurar montos base.
- Asociar conceptos financieros.
- Registrar multas asociadas a unidad habitacional.
- Asociar responsable opcional.
- Permitir evidencia textual o referencia de archivo.
- Implementar revisión, aprobación, rechazo y emisión.
- Generar cargos opcionales al emitir.
- Garantizar idempotencia de cargo.
- Permitir consulta administrativa.
- Permitir consulta propia limitada.
- Permitir reclamo básico.
- Permitir aceptación/rechazo/cancelación de reclamo.
- Permitir condonación y reverso controlado.
- No procesar pagos desde multas.
- No modificar estados de cuenta directamente.
- No revertir cargos automáticamente sin flujo financiero.
- No exponer multas en WordPress público.
```

El módulo debe garantizar:

```text id="cbavyp"
tenant isolation
permissioned actions
own-resource protection
property-unit validation
responsible-person validation
evidence access control
state transition control
auditability
financial idempotency
privacy preservation
no public exposure
```

La implementación no debe aceptarse si permite multas cross-tenant, asigna multas a unidades ajenas, expone evidencias a usuarios no autorizados, expone multas a WordPress, genera cargos duplicados, usa float para dinero, procesa pagos directamente, modifica estados de cuenta directamente, elimina historial o permite transiciones de estado no autorizadas.
