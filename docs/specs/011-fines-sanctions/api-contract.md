# API Contract — Spec 011 Fines and Sanctions

## 1. Información del documento

| Campo           | Valor                                                                                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                             |
| Spec ID         | 011                                                                                                                                                       |
| Módulo          | Fines and Sanctions                                                                                                                                       |
| Documento       | API Contract                                                                                                                                              |
| Ruta            | `docs/specs/011-fines-sanctions/api-contract.md`                                                                                                          |
| Versión         | 0.1                                                                                                                                                       |
| Estado          | needs-review                                                                                                                                              |
| Fecha           | 2026-07-19                                                                                                                                                |
| Documento base  | `docs/specs/011-fines-sanctions/spec.md`                                                                                                                  |
| Plan técnico    | `docs/specs/011-fines-sanctions/plan.md`                                                                                                                  |
| Modelo de datos | `docs/specs/011-fines-sanctions/data-model.md`                                                                                                            |
| API Style       | REST                                                                                                                                                      |
| API Version     | `/api/v1`                                                                                                                                                 |
| Naturaleza      | Tenant-scoped / Permissioned / Auditable / Financially integrable / Own-resource protected                                                                |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements`, `007-audit`, `008-basic-reports` |

---

## 2. Propósito

Este documento define el contrato API REST del módulo `011-fines-sanctions`.

El módulo permite administrar conceptos de multa, registrar infracciones, gestionar evidencias, revisar, aprobar, rechazar, emitir, cancelar, condonar, reversar multas, presentar reclamos, resolver reclamos y generar cargos financieros asociados de forma idempotente.

Regla central:

```text id="x1mpch"
Toda operación de multas debe estar autenticada, autorizada, tenant-scoped, auditable, protegida por estado y financieramente desacoplada del procesamiento de pagos.
```

---

## 3. Principios del contrato API

### 3.1. Tenant scope obligatorio

Todos los endpoints administrativos operan dentro del tenant activo del usuario autenticado.

Regla:

```text id="vffabz"
currentTenant.id debe usarse como tenant_id efectivo en toda consulta y mutación.
```

No se acepta que el cliente envíe `tenantId` en el body para operaciones tenant-scoped.

---

### 3.2. Autorización por permiso

Cada acción requiere permiso explícito.

Ejemplos:

```text id="xfwvql"
fineConcepts.create
fines.approve
fines.issue
fineEvidence.download
fineAppeals.submit.own
```

---

### 3.3. Autorización por recurso propio

Los endpoints `/me` deben validar que el usuario autenticado tenga relación activa con la unidad habitacional asociada a la multa.

Regla conceptual:

```text id="g8bebw"
actorUserId -> personId -> active ownership/residency/lease -> propertyUnitId -> fine
```

---

### 3.4. Estado controlado

Las multas, reclamos y evidencias solo pueden cambiar de estado mediante endpoints explícitos.

No se permite modificar `status` directamente mediante `PATCH`.

---

### 3.5. Integración financiera desacoplada

El módulo de multas puede solicitar generación de cargos al módulo financiero, pero no procesa pagos.

Prohibido:

```text id="s4s2h4"
confirmar pagos desde multas
asignar pagos desde multas
subir comprobantes desde multas
aprobar comprobantes desde multas
modificar estados de cuenta directamente
modificar saldos directamente
```

---

### 3.6. Dinero como string

Todo monto monetario debe exponerse como string decimal.

Ejemplo:

```json id="b7xu9k"
{
  "amount": "25.00",
  "currency": "USD"
}
```

---

### 3.7. Evidencias protegidas

Las evidencias no deben exponerse públicamente.

La descarga de evidencia debe requerir permisos y auditarse.

---

### 3.8. WordPress sin exposición de multas

No se definen endpoints públicos para multas.

Regla:

```text id="zcblzd"
No debe existir ningún endpoint bajo /api/v1/public para consultar, crear o descargar multas, sanciones, evidencias o reclamos.
```

---

## 4. Rutas base

### 4.1. Fine Concepts

```text id="eqzqaq"
/api/v1/tenant/fine-concepts
```

---

### 4.2. Fines administrativas

```text id="eagysx"
/api/v1/tenant/fines
```

---

### 4.3. Fine Evidence

```text id="oqqoeo"
/api/v1/tenant/fines/{fineId}/evidence
/api/v1/tenant/fine-evidence/{evidenceId}
```

---

### 4.4. Fine Appeals administrativas

```text id="sjbq4w"
/api/v1/tenant/fines/{fineId}/appeals
/api/v1/tenant/fine-appeals/{appealId}
```

---

### 4.5. Fines propias

```text id="k434uj"
/api/v1/me/fines
```

---

### 4.6. Fine Appeals propias

```text id="j8pr0q"
/api/v1/me/fine-appeals
```

---

## 5. Headers

### 5.1. Request headers autenticados

| Header             |                            Requerido | Descripción                         |
| ------------------ | -----------------------------------: | ----------------------------------- |
| `Authorization`    |                                   Sí | Bearer token emitido por IdP        |
| `Content-Type`     |                   Sí para POST/PATCH | `application/json`                  |
| `Accept`           |                          Recomendado | `application/json`                  |
| `X-Request-Id`     |                             Opcional | ID de request                       |
| `X-Correlation-Id` |                             Opcional | ID de correlación                   |
| `Idempotency-Key`  | Recomendado para generación de cargo | Prevención de duplicidad financiera |

---

### 5.2. Response headers

| Header             | Descripción                 |
| ------------------ | --------------------------- |
| `Content-Type`     | `application/json`          |
| `X-Request-Id`     | ID de request               |
| `X-Correlation-Id` | ID de correlación si aplica |

---

### 5.3. Cache

Los endpoints administrativos y `/me` no deben cachearse públicamente.

Header recomendado:

```text id="jjzdbh"
Cache-Control: no-store
```

---

## 6. Formato estándar de respuesta

### 6.1. Respuesta individual

```json id="puu432"
{
  "data": {},
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

### 6.2. Respuesta paginada

```json id="zxx55s"
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

```json id="ubq0bk"
{
  "error": {
    "code": "FINE_INVALID_TRANSITION",
    "message": "The requested fine status transition is not allowed.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

## 7. Estados HTTP

| Código | Uso                                                    |
| -----: | ------------------------------------------------------ |
|    200 | Consulta o acción exitosa con respuesta                |
|    201 | Recurso creado                                         |
|    204 | Acción exitosa sin cuerpo, si se adopta                |
|    400 | Request mal formado                                    |
|    401 | No autenticado                                         |
|    403 | Sin permiso o sin acceso al recurso                    |
|    404 | Recurso no encontrado o no accesible dentro del tenant |
|    409 | Conflicto de estado, duplicidad o regla de negocio     |
|    422 | Validación semántica fallida                           |
|    429 | Rate limit                                             |
|    500 | Error interno controlado                               |

---

## 8. Permisos

### 8.1. Fine Concepts

```text id="b4kxdp"
fineConcepts.create
fineConcepts.read
fineConcepts.update
fineConcepts.archive
```

---

### 8.2. Fines administrativas

```text id="jplbza"
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

---

### 8.3. Fine Evidence

```text id="vtmet0"
fineEvidence.create
fineEvidence.read
fineEvidence.archive
fineEvidence.download
```

---

### 8.4. Fine Appeals administrativas

```text id="rvn2xu"
fineAppeals.read
fineAppeals.resolve
```

---

### 8.5. Fines propias

```text id="j2rrf7"
fines.read.own
fineEvidence.read.own
fineAppeals.submit.own
fineAppeals.read.own
```

---

### 8.6. Reportes y auditoría

```text id="k36ygf"
fines.audit.read
fines.reports.read
```

---

## 9. Validaciones comunes

### 9.1. IDs de ruta

Todos los IDs de ruta deben validarse.

Campos frecuentes:

```text id="so21tj"
fineConceptId
fineId
evidenceId
appealId
propertyUnitId
responsiblePersonId
chargeConceptId
chargeId
```

---

### 9.2. Fechas

Formato requerido:

```text id="mqcu6e"
ISO 8601 UTC
```

Ejemplo:

```text id="yruq72"
2026-08-20T04:30:00Z
```

---

### 9.3. Dinero

Montos:

```text id="qhy1tf"
string decimal con dos decimales
```

Ejemplo válido:

```text id="sg2gsu"
25.00
```

Ejemplos inválidos:

```text id="xtdq8p"
25
25.001
-10.00
NaN
```

---

### 9.4. Paginación

| Query param |   Tipo | Default | Máximo |
| ----------- | -----: | ------: | -----: |
| `page`      | number |       1 |      — |
| `pageSize`  | number |      20 |    100 |

---

### 9.5. Campos prohibidos en body

No se aceptan desde cliente:

```text id="i51zx6"
tenantId
reportedBy
reviewedBy
approvedBy
rejectedBy
issuedBy
cancelledBy
waivedBy
reversedBy
chargeId
paymentStatusSnapshot
createdAt
updatedAt
archivedAt
```

Estos campos se derivan del contexto, del flujo de negocio o de servicios internos.

---

## 10. Enums API

### 10.1. FineConceptStatus

```text id="n8c82o"
active
inactive
archived
```

---

### 10.2. FineCategory

```text id="xvwkcq"
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

### 10.3. FineStatus

```text id="e4s93i"
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

### 10.4. FineSeverity

```text id="d2r36j"
low
medium
high
critical
```

---

### 10.5. FineEvidenceType

```text id="zp17ag"
text
image
document
video
reference
other
```

---

### 10.6. FineEvidenceStatus

```text id="gfu16z"
active
rejected
archived
```

---

### 10.7. FineAppealStatus

```text id="tg3awu"
submitted
underReview
accepted
rejected
cancelled
archived
```

---

### 10.8. FinePaymentStatusSnapshot

```text id="x00f5s"
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

---

# 11. Fine Concepts — Endpoints administrativos

## 11.1. Listar conceptos de multa

### Endpoint

```http id="s8xzje"
GET /api/v1/tenant/fine-concepts
```

### Autenticación

Requiere Bearer token.

### Permiso

```text id="r5awup"
fineConcepts.read
```

### Query params

| Nombre      | Tipo   | Requerido | Descripción                                                        |
| ----------- | ------ | --------: | ------------------------------------------------------------------ |
| `status`    | string |        No | `active`, `inactive`, `archived`                                   |
| `category`  | string |        No | Categoría                                                          |
| `q`         | string |        No | Búsqueda por código o nombre                                       |
| `page`      | number |        No | Página                                                             |
| `pageSize`  | number |        No | Tamaño                                                             |
| `sortBy`    | string |        No | `code`, `name`, `category`, `defaultAmount`, `status`, `createdAt` |
| `sortOrder` | string |        No | `asc`, `desc`                                                      |

### Response 200

```json id="zcw4nx"
{
  "data": [
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

## 11.2. Crear concepto de multa

### Endpoint

```http id="t7xyc5"
POST /api/v1/tenant/fine-concepts
```

### Permiso

```text id="h5wnlv"
fineConcepts.create
```

### Request body

```json id="xllxtp"
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

### Response 201

```json id="wj0mnf"
{
  "data": {
    "id": "fine_concept_uuid",
    "code": "NOISE",
    "name": "Ruido excesivo",
    "category": "noise",
    "defaultAmount": "25.00",
    "currency": "USD",
    "requiresEvidence": true,
    "allowsAppeal": true,
    "appealDeadlineDays": 5,
    "status": "active"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Eventos auditables

```text id="n5u1qc"
fineConcept.created
```

---

## 11.3. Obtener concepto de multa

### Endpoint

```http id="gasnhq"
GET /api/v1/tenant/fine-concepts/{fineConceptId}
```

### Permiso

```text id="zqj61y"
fineConcepts.read
```

### Response 200

```json id="qcg4xy"
{
  "data": {
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
    "status": "active",
    "createdAt": "2026-07-19T10:00:00Z",
    "updatedAt": "2026-07-19T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 11.4. Actualizar concepto de multa

### Endpoint

```http id="snkt5h"
PATCH /api/v1/tenant/fine-concepts/{fineConceptId}
```

### Permiso

```text id="wi3l55"
fineConcepts.update
```

### Request body

```json id="uyb7hr"
{
  "name": "Ruido excesivo en horario restringido",
  "description": "Multa por ruido fuera de horarios permitidos por el reglamento.",
  "defaultAmount": "30.00",
  "currency": "USD",
  "requiresEvidence": true,
  "allowsAppeal": true,
  "appealDeadlineDays": 5
}
```

### Response 200

```json id="xauki7"
{
  "data": {
    "id": "fine_concept_uuid",
    "code": "NOISE",
    "name": "Ruido excesivo en horario restringido",
    "category": "noise",
    "defaultAmount": "30.00",
    "currency": "USD",
    "requiresEvidence": true,
    "allowsAppeal": true,
    "appealDeadlineDays": 5,
    "status": "active"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Eventos auditables

```text id="w9wfb5"
fineConcept.updated
```

---

## 11.5. Activar concepto

### Endpoint

```http id="rl7mef"
POST /api/v1/tenant/fine-concepts/{fineConceptId}/activate
```

### Permiso

```text id="kar5nt"
fineConcepts.update
```

### Response 200

```json id="yoaem5"
{
  "data": {
    "id": "fine_concept_uuid",
    "status": "active"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Evento

```text id="y8xv9c"
fineConcept.activated
```

---

## 11.6. Desactivar concepto

### Endpoint

```http id="kpke2f"
POST /api/v1/tenant/fine-concepts/{fineConceptId}/deactivate
```

### Permiso

```text id="d52cvq"
fineConcepts.update
```

### Regla

```text id="clao5a"
Un concepto inactivo no puede usarse para nuevas multas, pero conserva historial.
```

### Evento

```text id="uxk8io"
fineConcept.deactivated
```

---

## 11.7. Archivar concepto

### Endpoint

```http id="oxpb10"
POST /api/v1/tenant/fine-concepts/{fineConceptId}/archive
```

### Permiso

```text id="sm9gia"
fineConcepts.archive
```

### Regla

```text id="ioq3z2"
El archivo lógico impide nuevas multas y conserva historial.
```

### Evento

```text id="tspcej"
fineConcept.archived
```

---

# 12. Fines — Endpoints administrativos

## 12.1. Listar multas administrativas

### Endpoint

```http id="proenr"
GET /api/v1/tenant/fines
```

### Permiso

```text id="p0aqzm"
fines.read
```

### Query params

| Nombre                  | Tipo      | Requerido | Descripción                                                                         |
| ----------------------- | --------- | --------: | ----------------------------------------------------------------------------------- |
| `fineConceptId`         | string    |        No | Concepto de multa                                                                   |
| `propertyUnitId`        | string    |        No | Unidad habitacional                                                                 |
| `responsiblePersonId`   | string    |        No | Persona responsable                                                                 |
| `status`                | string    |        No | Estado de multa                                                                     |
| `severity`              | string    |        No | Severidad                                                                           |
| `occurredFrom`          | date-time |        No | Fecha del hecho desde                                                               |
| `occurredTo`            | date-time |        No | Fecha del hecho hasta                                                               |
| `reportedFrom`          | date-time |        No | Fecha de reporte desde                                                              |
| `reportedTo`            | date-time |        No | Fecha de reporte hasta                                                              |
| `issuedFrom`            | date-time |        No | Fecha de emisión desde                                                              |
| `issuedTo`              | date-time |        No | Fecha de emisión hasta                                                              |
| `paymentStatusSnapshot` | string    |        No | Estado financiero informativo                                                       |
| `hasCharge`             | boolean   |        No | Filtrar con/sin cargo                                                               |
| `page`                  | number    |        No | Página                                                                              |
| `pageSize`              | number    |        No | Tamaño                                                                              |
| `sortBy`                | string    |        No | `occurredAt`, `reportedAt`, `issuedAt`, `status`, `severity`, `amount`, `createdAt` |
| `sortOrder`             | string    |        No | `asc`, `desc`                                                                       |

### Response 200

```json id="n0ahf4"
{
  "data": [
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

## 12.2. Crear multa

### Endpoint

```http id="r54gmm"
POST /api/v1/tenant/fines
```

### Permiso

```text id="zh00xw"
fines.create
```

### Request body

```json id="d3f5vg"
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

### Response 201

```json id="gb4hph"
{
  "data": {
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
    "paymentStatusSnapshot": "pendingCharge"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Eventos

```text id="wfmzx3"
fine.created
fine.reported
```

---

## 12.3. Obtener multa administrativa

### Endpoint

```http id="v8sokd"
GET /api/v1/tenant/fines/{fineId}
```

### Permiso

```text id="nr7bsc"
fines.read
```

### Response 200

```json id="docx7f"
{
  "data": {
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
    "dueDate": null,
    "reviewNotes": null,
    "rejectionReason": null,
    "cancellationReason": null,
    "waiverReason": null,
    "reversalReason": null,
    "issuedAt": null,
    "approvedAt": null,
    "rejectedAt": null,
    "cancelledAt": null,
    "waivedAt": null,
    "reversedAt": null,
    "evidenceSummary": {
      "total": 1,
      "active": 1
    },
    "appealSummary": {
      "total": 0,
      "open": 0
    },
    "createdAt": "2026-08-20T15:00:00Z",
    "updatedAt": "2026-08-20T15:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 12.4. Actualizar multa en estado editable

### Endpoint

```http id="ev1ubj"
PATCH /api/v1/tenant/fines/{fineId}
```

### Permiso

```text id="melirr"
fines.update
```

### Estados editables

```text id="ft4h8f"
draft
reported
underReview
```

### Request body

```json id="oj44nk"
{
  "title": "Ruido excesivo en horario nocturno",
  "description": "Se actualiza la descripción con mayor detalle.",
  "occurredAt": "2026-08-20T04:30:00Z",
  "severity": "high",
  "amount": "30.00",
  "currency": "USD"
}
```

### Response 200

```json id="phgui3"
{
  "data": {
    "id": "fine_uuid",
    "title": "Ruido excesivo en horario nocturno",
    "status": "reported",
    "severity": "high",
    "amount": "30.00",
    "currency": "USD"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Evento

```text id="qz4uow"
fine.updated
```

---

## 12.5. Pasar multa a revisión

### Endpoint

```http id="pn1mf0"
POST /api/v1/tenant/fines/{fineId}/submit-review
```

### Permiso

```text id="ij7h79"
fines.review
```

### Request body opcional

```json id="xdj1er"
{
  "notes": "Caso listo para revisión administrativa."
}
```

### Response 200

```json id="gifkfr"
{
  "data": {
    "id": "fine_uuid",
    "status": "underReview"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Evento

```text id="gzqacy"
fine.underReview
```

---

## 12.6. Aprobar multa

### Endpoint

```http id="aa4yjx"
POST /api/v1/tenant/fines/{fineId}/approve
```

### Permiso

```text id="tquyn6"
fines.approve
```

### Request body

```json id="iidxnf"
{
  "notes": "Se aprueba la multa por evidencia suficiente."
}
```

### Response 200

```json id="ev4o1w"
{
  "data": {
    "id": "fine_uuid",
    "status": "approved",
    "approvedAt": "2026-08-21T15:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* La multa debe estar en estado aprobable.
* Si el concepto requiere evidencia, debe existir evidencia activa.
* No genera cargo en MVP.
* Crea historial.

### Evento

```text id="ach7y4"
fine.approved
```

---

## 12.7. Rechazar multa

### Endpoint

```http id="biuugk"
POST /api/v1/tenant/fines/{fineId}/reject
```

### Permiso

```text id="hzuwlt"
fines.reject
```

### Request body

```json id="w21obs"
{
  "reason": "No existe evidencia suficiente para continuar."
}
```

### Response 200

```json id="guuvtm"
{
  "data": {
    "id": "fine_uuid",
    "status": "rejected",
    "rejectedAt": "2026-08-21T15:10:00Z",
    "rejectionReason": "No existe evidencia suficiente para continuar."
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Evento

```text id="gj4d3j"
fine.rejected
```

---

## 12.8. Emitir multa

### Endpoint

```http id="hx9raw"
POST /api/v1/tenant/fines/{fineId}/issue
```

### Permiso

```text id="ze0w5k"
fines.issue
```

### Headers recomendados

```text id="tyxjva"
Idempotency-Key: fine:{fineId}:charge
```

### Request body opcional

```json id="js4vur"
{
  "dueDate": "2026-09-05T05:00:00Z",
  "notes": "Se emite la multa y se genera el cargo correspondiente."
}
```

### Response 200

```json id="tbfgtm"
{
  "data": {
    "id": "fine_uuid",
    "status": "issued",
    "issuedAt": "2026-08-21T15:20:00Z",
    "amount": "25.00",
    "currency": "USD",
    "chargeId": "charge_uuid",
    "paymentStatusSnapshot": "chargeGenerated",
    "dueDate": "2026-09-05T05:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Solo multas `approved` pueden emitirse.
* Si `amount > 0`, debe generar cargo.
* Si `amount = 0`, no genera cargo.
* La generación de cargo debe ser idempotente.
* No procesa pagos.
* Crea historial.

### Eventos

```text id="p73gym"
fine.issued
fine.chargeGenerated
```

---

## 12.9. Cancelar multa

### Endpoint

```http id="mxfn2s"
POST /api/v1/tenant/fines/{fineId}/cancel
```

### Permiso

```text id="lo7rf8"
fines.cancel
```

### Request body

```json id="ikzoyi"
{
  "reason": "Registro creado por error antes de emisión."
}
```

### Response 200

```json id="uz7pcz"
{
  "data": {
    "id": "fine_uuid",
    "status": "cancelled",
    "cancelledAt": "2026-08-21T15:30:00Z",
    "cancellationReason": "Registro creado por error antes de emisión."
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Regla

```text id="e43nl8"
La cancelación no elimina historial ni revierte cargos automáticamente.
```

### Evento

```text id="kqqvf6"
fine.cancelled
```

---

## 12.10. Condonar multa

### Endpoint

```http id="v8lv5b"
POST /api/v1/tenant/fines/{fineId}/waive
```

### Permiso

```text id="xl6izz"
fines.waive
```

### Request body

```json id="z08ct6"
{
  "reason": "Condonación aprobada por administración."
}
```

### Response 200

```json id="bvh6pj"
{
  "data": {
    "id": "fine_uuid",
    "status": "waived",
    "waivedAt": "2026-08-22T10:00:00Z",
    "waiverReason": "Condonación aprobada por administración.",
    "paymentStatusSnapshot": "waived"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Regla

```text id="hnz1hu"
Condonar no borra cargo ni modifica pagos automáticamente.
```

### Evento

```text id="qqqidm"
fine.waived
```

---

## 12.11. Reversar multa

### Endpoint

```http id="lescc2"
POST /api/v1/tenant/fines/{fineId}/reverse
```

### Permiso

```text id="i5y7t3"
fines.reverse
```

### Request body

```json id="h4fagd"
{
  "reason": "La multa fue emitida por error administrativo."
}
```

### Response 200

```json id="bx43ld"
{
  "data": {
    "id": "fine_uuid",
    "status": "reversed",
    "reversedAt": "2026-08-22T10:30:00Z",
    "reversalReason": "La multa fue emitida por error administrativo.",
    "paymentStatusSnapshot": "reversed"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Regla

```text id="wnqmws"
El reverso de multa no debe modificar pagos ni estados de cuenta directamente desde este módulo.
```

### Evento

```text id="tl8nvr"
fine.reversed
```

---

## 12.12. Archivar multa

### Endpoint

```http id="kc3gl2"
POST /api/v1/tenant/fines/{fineId}/archive
```

### Permiso

```text id="wrjpgh"
fines.archive
```

### Response 200

```json id="nft8p5"
{
  "data": {
    "id": "fine_uuid",
    "status": "archived",
    "archivedAt": "2026-08-22T11:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Regla

```text id="q8ar54"
Archivar es soft delete funcional. No elimina multa, evidencia, reclamos, historial ni cargos.
```

### Evento

```text id="tpkp4v"
fine.archived
```

---

## 12.13. Generar cargo de multa

### Endpoint

```http id="fk2lbu"
POST /api/v1/tenant/fines/{fineId}/generate-charge
```

### Permiso

```text id="ecim2j"
fines.generateCharge
```

### Headers recomendados

```text id="xvury5"
Idempotency-Key: fine:{fineId}:charge
```

### Response 200

```json id="fz9wq6"
{
  "data": {
    "fineId": "fine_uuid",
    "chargeId": "charge_uuid",
    "amount": "25.00",
    "currency": "USD",
    "paymentStatusSnapshot": "chargeGenerated"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Requiere multa monetaria.
* Requiere `propertyUnitId`.
* Requiere concepto financiero válido.
* No duplica cargo.
* No procesa pagos.
* No crea comprobantes.
* Puede devolver cargo existente si ya fue generado.

### Eventos

```text id="c97ksm"
fine.chargeGenerated
fine.chargeGenerationFailed
```

---

# 13. Fine Evidence — Endpoints administrativos

## 13.1. Listar evidencias de una multa

### Endpoint

```http id="d06zlo"
GET /api/v1/tenant/fines/{fineId}/evidence
```

### Permiso

```text id="awzs9h"
fineEvidence.read
```

### Query params

| Nombre         | Tipo   | Requerido | Descripción       |
| -------------- | ------ | --------: | ----------------- |
| `evidenceType` | string |        No | Tipo de evidencia |
| `status`       | string |        No | Estado            |
| `page`         | number |        No | Página            |
| `pageSize`     | number |        No | Tamaño            |

### Response 200

```json id="gni2yj"
{
  "data": [
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

## 13.2. Agregar evidencia

### Endpoint

```http id="qz4sdh"
POST /api/v1/tenant/fines/{fineId}/evidence
```

### Permiso

```text id="u59bp6"
fineEvidence.create
```

### Request body

```json id="gml24t"
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

### Response 201

```json id="cxnf8s"
{
  "data": {
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
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Evento

```text id="vmpnll"
fineEvidence.added
```

---

## 13.3. Obtener evidencia

### Endpoint

```http id="h0stcl"
GET /api/v1/tenant/fine-evidence/{evidenceId}
```

### Permiso

```text id="zgt2vh"
fineEvidence.read
```

### Response 200

```json id="envsj9"
{
  "data": {
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
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 13.4. Descargar evidencia

### Endpoint

```http id="mizq6d"
GET /api/v1/tenant/fine-evidence/{evidenceId}/download
```

### Permiso

```text id="a40kcp"
fineEvidence.download
```

### Response 200

```json id="zo38y1"
{
  "data": {
    "downloadUrl": "https://signed-storage.example.com/temp/evidence.jpg",
    "expiresAt": "2026-08-20T15:15:00Z",
    "fileName": "evidence.jpg",
    "mimeType": "image/jpeg",
    "fileSizeBytes": 245000
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Debe validar tenant.
* Debe validar permisos.
* Debe auditar descarga.
* La URL debe ser temporal si el archivo es privado.
* No debe exponer rutas internas permanentes.

### Evento

```text id="zy8tbu"
fineEvidence.downloaded
```

---

## 13.5. Archivar evidencia

### Endpoint

```http id="ztcfzm"
POST /api/v1/tenant/fine-evidence/{evidenceId}/archive
```

### Permiso

```text id="swu445"
fineEvidence.archive
```

### Request body

```json id="n3z29t"
{
  "reason": "Evidencia duplicada o inválida."
}
```

### Response 200

```json id="uzkcns"
{
  "data": {
    "id": "evidence_uuid",
    "status": "archived",
    "archivedAt": "2026-08-20T16:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Evento

```text id="tfozwk"
fineEvidence.archived
```

---

# 14. Fine Appeals — Endpoints administrativos

## 14.1. Listar reclamos de una multa

### Endpoint

```http id="uc849a"
GET /api/v1/tenant/fines/{fineId}/appeals
```

### Permiso

```text id="ky3cuk"
fineAppeals.read
```

### Response 200

```json id="f0bg5j"
{
  "data": [
    {
      "id": "appeal_uuid",
      "fineId": "fine_uuid",
      "submittedBy": "user_uuid",
      "submittedAt": "2026-08-22T10:00:00Z",
      "reason": "La multa no corresponde porque no hubo ruido fuera del horario permitido.",
      "status": "submitted",
      "resolvedBy": null,
      "resolvedAt": null,
      "resolution": null,
      "resolutionNotes": null
    }
  ],
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 14.2. Obtener reclamo

### Endpoint

```http id="wi0lcy"
GET /api/v1/tenant/fine-appeals/{appealId}
```

### Permiso

```text id="zorxab"
fineAppeals.read
```

### Response 200

```json id="qwwa08"
{
  "data": {
    "id": "appeal_uuid",
    "fineId": "fine_uuid",
    "submittedBy": "user_uuid",
    "submittedAt": "2026-08-22T10:00:00Z",
    "reason": "La multa no corresponde porque no hubo ruido fuera del horario permitido.",
    "status": "submitted",
    "resolvedBy": null,
    "resolvedAt": null,
    "resolution": null,
    "resolutionNotes": null
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 14.3. Aceptar reclamo

### Endpoint

```http id="sdp5u9"
POST /api/v1/tenant/fine-appeals/{appealId}/accept
```

### Permiso

```text id="j0gr4p"
fineAppeals.resolve
```

### Request body

```json id="mte2u6"
{
  "resolutionNotes": "Se acepta el reclamo por falta de evidencia suficiente.",
  "nextFineAction": "waive"
}
```

### Valores permitidos de `nextFineAction`

```text id="pjm684"
waive
reverse
none
```

### Response 200

```json id="u05fdd"
{
  "data": {
    "id": "appeal_uuid",
    "fineId": "fine_uuid",
    "status": "accepted",
    "resolvedAt": "2026-08-23T10:00:00Z",
    "resolution": "accepted",
    "resolutionNotes": "Se acepta el reclamo por falta de evidencia suficiente.",
    "fineStatus": "waived"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Eventos

```text id="w5c42l"
fineAppeal.accepted
fine.appealAccepted
fine.waived
```

---

## 14.4. Rechazar reclamo

### Endpoint

```http id="e9k8zv"
POST /api/v1/tenant/fine-appeals/{appealId}/reject
```

### Permiso

```text id="envwwi"
fineAppeals.resolve
```

### Request body

```json id="m22cn9"
{
  "resolutionNotes": "Se rechaza el reclamo; la evidencia es suficiente."
}
```

### Response 200

```json id="r8l9aj"
{
  "data": {
    "id": "appeal_uuid",
    "fineId": "fine_uuid",
    "status": "rejected",
    "resolvedAt": "2026-08-23T10:15:00Z",
    "resolution": "rejected",
    "resolutionNotes": "Se rechaza el reclamo; la evidencia es suficiente.",
    "fineStatus": "appealRejected"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Eventos

```text id="rf2x6x"
fineAppeal.rejected
fine.appealRejected
```

---

## 14.5. Cancelar reclamo

### Endpoint

```http id="bav5h2"
POST /api/v1/tenant/fine-appeals/{appealId}/cancel
```

### Permiso

```text id="xqwxyc"
fineAppeals.resolve
```

### Request body

```json id="b8jdwo"
{
  "reason": "Reclamo cancelado por solicitud del interesado."
}
```

### Response 200

```json id="czlaye"
{
  "data": {
    "id": "appeal_uuid",
    "status": "cancelled"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Evento

```text id="s38e5p"
fineAppeal.cancelled
```

---

# 15. Fines propias — Endpoints `/me`

## 15.1. Listar mis multas

### Endpoint

```http id="q4h8pg"
GET /api/v1/me/fines
```

### Permiso

```text id="si9arw"
fines.read.own
```

### Query params

| Nombre           | Tipo      | Requerido | Descripción                                              |
| ---------------- | --------- | --------: | -------------------------------------------------------- |
| `propertyUnitId` | string    |        No | Debe pertenecer al usuario                               |
| `status`         | string    |        No | Estado                                                   |
| `severity`       | string    |        No | Severidad                                                |
| `issuedFrom`     | date-time |        No | Fecha de emisión desde                                   |
| `issuedTo`       | date-time |        No | Fecha de emisión hasta                                   |
| `page`           | number    |        No | Página                                                   |
| `pageSize`       | number    |        No | Tamaño                                                   |
| `sortBy`         | string    |        No | `issuedAt`, `occurredAt`, `status`, `severity`, `amount` |
| `sortOrder`      | string    |        No | `asc`, `desc`                                            |

### Response 200

```json id="mvd8u4"
{
  "data": [
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
      "issuedAt": "2026-08-21T15:20:00Z",
      "allowsAppeal": true,
      "appealDeadlineAt": "2026-08-26T15:20:00Z",
      "appealStatus": null
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

* Solo debe mostrar multas de unidades autorizadas.
* Si `propertyUnitId` se envía, debe pertenecer al usuario.
* No debe mostrar multas de terceros.
* No debe incluir audit metadata.

---

## 15.2. Obtener mi multa

### Endpoint

```http id="pcc479"
GET /api/v1/me/fines/{fineId}
```

### Permiso

```text id="vp6wau"
fines.read.own
```

### Response 200

```json id="hg1iwo"
{
  "data": {
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
    "issuedAt": "2026-08-21T15:20:00Z",
    "allowsAppeal": true,
    "appealDeadlineAt": "2026-08-26T15:20:00Z",
    "appealStatus": null
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 15.3. Consultar evidencias visibles de mi multa

### Endpoint

```http id="jklqqs"
GET /api/v1/me/fines/{fineId}/evidence
```

### Permiso

```text id="dz2m6m"
fineEvidence.read.own
```

### Response 200

```json id="koq01q"
{
  "data": [
    {
      "id": "evidence_uuid",
      "fineId": "fine_uuid",
      "evidenceType": "image",
      "title": "Fotografía del evento",
      "description": "Evidencia disponible para revisión.",
      "fileName": "evidence.jpg",
      "mimeType": "image/jpeg",
      "fileSizeBytes": 245000,
      "uploadedAt": "2026-08-20T15:00:00Z",
      "status": "active"
    }
  ],
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Regla

```text id="wonvqg"
La evidencia propia puede limitarse según política del tenant y no debe exponer información de terceros.
```

---

## 15.4. Presentar reclamo propio

### Endpoint

```http id="hzfsld"
POST /api/v1/me/fines/{fineId}/appeals
```

### Permiso

```text id="k1ghur"
fineAppeals.submit.own
```

### Request body

```json id="dk1z9b"
{
  "reason": "La multa no corresponde porque no hubo ruido fuera del horario permitido."
}
```

### Response 201

```json id="mnd7ta"
{
  "data": {
    "id": "appeal_uuid",
    "fineId": "fine_uuid",
    "submittedAt": "2026-08-22T10:00:00Z",
    "reason": "La multa no corresponde porque no hubo ruido fuera del horario permitido.",
    "status": "submitted",
    "fineStatus": "disputed"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* La multa debe pertenecer a unidad autorizada.
* La multa debe estar `issued`.
* El concepto debe permitir reclamo.
* Debe estar dentro del plazo.
* No puede existir reclamo abierto.
* Cambia multa a `disputed`.

### Eventos

```text id="mnbame"
fineAppeal.submitted
fine.disputed
```

---

# 16. Fine Appeals propias — Endpoints `/me`

## 16.1. Listar mis reclamos

### Endpoint

```http id="lblnls"
GET /api/v1/me/fine-appeals
```

### Permiso

```text id="w6nyxc"
fineAppeals.read.own
```

### Query params

| Nombre          | Tipo      | Requerido | Descripción        |
| --------------- | --------- | --------: | ------------------ |
| `status`        | string    |        No | Estado del reclamo |
| `submittedFrom` | date-time |        No | Fecha desde        |
| `submittedTo`   | date-time |        No | Fecha hasta        |
| `page`          | number    |        No | Página             |
| `pageSize`      | number    |        No | Tamaño             |

### Response 200

```json id="vofzvh"
{
  "data": [
    {
      "id": "appeal_uuid",
      "fineId": "fine_uuid",
      "submittedAt": "2026-08-22T10:00:00Z",
      "reason": "La multa no corresponde porque no hubo ruido fuera del horario permitido.",
      "status": "submitted",
      "resolvedAt": null,
      "resolution": null,
      "resolutionNotes": null
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

## 16.2. Obtener mi reclamo

### Endpoint

```http id="nigq98"
GET /api/v1/me/fine-appeals/{appealId}
```

### Permiso

```text id="wsqfen"
fineAppeals.read.own
```

### Response 200

```json id="yxbq4f"
{
  "data": {
    "id": "appeal_uuid",
    "fineId": "fine_uuid",
    "submittedAt": "2026-08-22T10:00:00Z",
    "reason": "La multa no corresponde porque no hubo ruido fuera del horario permitido.",
    "status": "submitted",
    "resolvedAt": null,
    "resolution": null,
    "resolutionNotes": null
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Regla

```text id="f4nx6d"
El reclamo debe pertenecer a una multa asociada a una unidad autorizada para el usuario autenticado.
```

---

# 17. Matriz de endpoints

| Método | Ruta                                                      | Scope  | Auth | Permiso                  |
| ------ | --------------------------------------------------------- | ------ | ---- | ------------------------ |
| GET    | `/api/v1/tenant/fine-concepts`                            | tenant | Sí   | `fineConcepts.read`      |
| POST   | `/api/v1/tenant/fine-concepts`                            | tenant | Sí   | `fineConcepts.create`    |
| GET    | `/api/v1/tenant/fine-concepts/{fineConceptId}`            | tenant | Sí   | `fineConcepts.read`      |
| PATCH  | `/api/v1/tenant/fine-concepts/{fineConceptId}`            | tenant | Sí   | `fineConcepts.update`    |
| POST   | `/api/v1/tenant/fine-concepts/{fineConceptId}/activate`   | tenant | Sí   | `fineConcepts.update`    |
| POST   | `/api/v1/tenant/fine-concepts/{fineConceptId}/deactivate` | tenant | Sí   | `fineConcepts.update`    |
| POST   | `/api/v1/tenant/fine-concepts/{fineConceptId}/archive`    | tenant | Sí   | `fineConcepts.archive`   |
| GET    | `/api/v1/tenant/fines`                                    | tenant | Sí   | `fines.read`             |
| POST   | `/api/v1/tenant/fines`                                    | tenant | Sí   | `fines.create`           |
| GET    | `/api/v1/tenant/fines/{fineId}`                           | tenant | Sí   | `fines.read`             |
| PATCH  | `/api/v1/tenant/fines/{fineId}`                           | tenant | Sí   | `fines.update`           |
| POST   | `/api/v1/tenant/fines/{fineId}/submit-review`             | tenant | Sí   | `fines.review`           |
| POST   | `/api/v1/tenant/fines/{fineId}/approve`                   | tenant | Sí   | `fines.approve`          |
| POST   | `/api/v1/tenant/fines/{fineId}/reject`                    | tenant | Sí   | `fines.reject`           |
| POST   | `/api/v1/tenant/fines/{fineId}/issue`                     | tenant | Sí   | `fines.issue`            |
| POST   | `/api/v1/tenant/fines/{fineId}/cancel`                    | tenant | Sí   | `fines.cancel`           |
| POST   | `/api/v1/tenant/fines/{fineId}/waive`                     | tenant | Sí   | `fines.waive`            |
| POST   | `/api/v1/tenant/fines/{fineId}/reverse`                   | tenant | Sí   | `fines.reverse`          |
| POST   | `/api/v1/tenant/fines/{fineId}/archive`                   | tenant | Sí   | `fines.archive`          |
| POST   | `/api/v1/tenant/fines/{fineId}/generate-charge`           | tenant | Sí   | `fines.generateCharge`   |
| GET    | `/api/v1/tenant/fines/{fineId}/evidence`                  | tenant | Sí   | `fineEvidence.read`      |
| POST   | `/api/v1/tenant/fines/{fineId}/evidence`                  | tenant | Sí   | `fineEvidence.create`    |
| GET    | `/api/v1/tenant/fine-evidence/{evidenceId}`               | tenant | Sí   | `fineEvidence.read`      |
| GET    | `/api/v1/tenant/fine-evidence/{evidenceId}/download`      | tenant | Sí   | `fineEvidence.download`  |
| POST   | `/api/v1/tenant/fine-evidence/{evidenceId}/archive`       | tenant | Sí   | `fineEvidence.archive`   |
| GET    | `/api/v1/tenant/fines/{fineId}/appeals`                   | tenant | Sí   | `fineAppeals.read`       |
| GET    | `/api/v1/tenant/fine-appeals/{appealId}`                  | tenant | Sí   | `fineAppeals.read`       |
| POST   | `/api/v1/tenant/fine-appeals/{appealId}/accept`           | tenant | Sí   | `fineAppeals.resolve`    |
| POST   | `/api/v1/tenant/fine-appeals/{appealId}/reject`           | tenant | Sí   | `fineAppeals.resolve`    |
| POST   | `/api/v1/tenant/fine-appeals/{appealId}/cancel`           | tenant | Sí   | `fineAppeals.resolve`    |
| GET    | `/api/v1/me/fines`                                        | own    | Sí   | `fines.read.own`         |
| GET    | `/api/v1/me/fines/{fineId}`                               | own    | Sí   | `fines.read.own`         |
| GET    | `/api/v1/me/fines/{fineId}/evidence`                      | own    | Sí   | `fineEvidence.read.own`  |
| POST   | `/api/v1/me/fines/{fineId}/appeals`                       | own    | Sí   | `fineAppeals.submit.own` |
| GET    | `/api/v1/me/fine-appeals`                                 | own    | Sí   | `fineAppeals.read.own`   |
| GET    | `/api/v1/me/fine-appeals/{appealId}`                      | own    | Sí   | `fineAppeals.read.own`   |

---

# 18. Catálogo de errores

| Código                                 | HTTP | Descripción                                |
| -------------------------------------- | ---: | ------------------------------------------ |
| `FINE_CONCEPT_NOT_FOUND`               |  404 | Concepto no encontrado o no accesible      |
| `FINE_CONCEPT_DUPLICATE_CODE`          |  409 | Código duplicado dentro del tenant         |
| `FINE_CONCEPT_INACTIVE`                |  422 | Concepto inactivo o archivado              |
| `FINE_CONCEPT_INVALID_AMOUNT`          |  422 | Monto inválido                             |
| `FINE_CONCEPT_CHARGE_CONCEPT_REQUIRED` |  422 | Concepto financiero requerido              |
| `FINE_NOT_FOUND`                       |  404 | Multa no encontrada o no accesible         |
| `FINE_FORBIDDEN`                       |  403 | Usuario sin acceso a la multa              |
| `FINE_INVALID_TRANSITION`              |  409 | Transición de estado inválida              |
| `FINE_EVIDENCE_REQUIRED`               |  422 | Evidencia obligatoria no encontrada        |
| `FINE_INVALID_AMOUNT`                  |  422 | Monto inválido                             |
| `FINE_UNIT_REQUIRED`                   |  422 | Unidad requerida para multa monetaria      |
| `FINE_UNIT_FORBIDDEN`                  |  403 | Unidad no pertenece al tenant o usuario    |
| `FINE_PERSON_FORBIDDEN`                |  403 | Persona responsable no pertenece al tenant |
| `FINE_CROSS_TENANT_REFERENCE`          |  403 | Referencia cruza tenants                   |
| `FINE_REASON_REQUIRED`                 |  422 | Razón requerida                            |
| `FINE_CHARGE_CONCEPT_REQUIRED`         |  422 | Concepto financiero requerido              |
| `FINE_CHARGE_ALREADY_GENERATED`        |  409 | Cargo ya generado                          |
| `FINE_CHARGE_GENERATION_FAILED`        |  500 | Falló generación de cargo                  |
| `FINE_EVIDENCE_NOT_FOUND`              |  404 | Evidencia no encontrada                    |
| `FINE_EVIDENCE_FORBIDDEN`              |  403 | Usuario sin acceso a evidencia             |
| `FINE_EVIDENCE_INVALID_FILE`           |  422 | Archivo o metadata inválida                |
| `FINE_APPEAL_NOT_FOUND`                |  404 | Reclamo no encontrado                      |
| `FINE_APPEAL_NOT_ALLOWED`              |  409 | Reclamo no permitido para esta multa       |
| `FINE_APPEAL_DEADLINE_EXPIRED`         |  409 | Plazo de reclamo vencido                   |
| `FINE_APPEAL_ALREADY_OPEN`             |  409 | Ya existe reclamo abierto                  |
| `FINE_APPEAL_INVALID_STATUS`           |  409 | Estado de reclamo inválido                 |
| `VALIDATION_ERROR`                     |  422 | Error de validación                        |
| `UNAUTHORIZED`                         |  401 | No autenticado                             |
| `FORBIDDEN`                            |  403 | Sin permiso                                |
| `RATE_LIMITED`                         |  429 | Rate limit                                 |
| `INTERNAL_ERROR`                       |  500 | Error interno                              |

---

# 19. Ejemplos de errores

## 19.1. Concepto duplicado

```json id="d3zet4"
{
  "error": {
    "code": "FINE_CONCEPT_DUPLICATE_CODE",
    "message": "A fine concept with the same code already exists for this tenant.",
    "details": {
      "code": "NOISE"
    },
    "traceId": "req_123456"
  }
}
```

---

## 19.2. Multa sin unidad requerida

```json id="eviwys"
{
  "error": {
    "code": "FINE_UNIT_REQUIRED",
    "message": "A monetary fine must be associated with a property unit.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

## 19.3. Evidencia requerida

```json id="d9s23s"
{
  "error": {
    "code": "FINE_EVIDENCE_REQUIRED",
    "message": "This fine concept requires active evidence before approval or issuing.",
    "details": {
      "fineId": "fine_uuid"
    },
    "traceId": "req_123456"
  }
}
```

---

## 19.4. Transición inválida

```json id="m60mx9"
{
  "error": {
    "code": "FINE_INVALID_TRANSITION",
    "message": "The requested fine status transition is not allowed.",
    "details": {
      "fromStatus": "cancelled",
      "toStatus": "issued"
    },
    "traceId": "req_123456"
  }
}
```

---

## 19.5. Reclamo fuera de plazo

```json id="ymqy08"
{
  "error": {
    "code": "FINE_APPEAL_DEADLINE_EXPIRED",
    "message": "The appeal deadline for this fine has expired.",
    "details": {
      "appealDeadlineAt": "2026-08-26T15:20:00Z"
    },
    "traceId": "req_123456"
  }
}
```

---

## 19.6. Cargo ya generado

```json id="eoea81"
{
  "error": {
    "code": "FINE_CHARGE_ALREADY_GENERATED",
    "message": "This fine already has an associated charge.",
    "details": {
      "fineId": "fine_uuid",
      "chargeId": "charge_uuid"
    },
    "traceId": "req_123456"
  }
}
```

---

# 20. Reglas de seguridad por contrato

## 20.1. Endpoints administrativos

Deben aplicar:

```text id="d7qjdu"
AuthGuard
TenantGuard
TenantPermissionGuard
permission checks
tenant_id filter
safe DTO validation
audit events
safe errors
no-store cache policy
```

---

## 20.2. Endpoints `/me`

Deben aplicar:

```text id="hc300a"
AuthGuard
TenantGuard
TenantPermissionGuard
OwnFineGuard
property unit access validation
no third-party fine exposure
no evidence exposure without policy
```

---

## 20.3. Evidencias

Deben aplicar:

```text id="o2vxjs"
tenant validation
permission validation
own-resource validation si aplica
signed URL temporal si aplica
download audit
no public direct fileUrl
```

---

## 20.4. Endpoints públicos

No existen endpoints públicos para multas.

OpenAPI no debe documentar:

```text id="cdbo43"
GET /api/v1/public/tenants/{slug}/fines
GET /api/v1/public/tenants/{slug}/sanctions
GET /api/v1/public/tenants/{slug}/fine-evidence
POST /api/v1/public/tenants/{slug}/fines
```

---

# 21. Auditoría

## 21.1. Eventos obligatorios

```text id="ksmoya"
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

```json id="xrc7wf"
{
  "fineId": "fine_uuid",
  "fineConceptId": "fine_concept_uuid",
  "propertyUnitId": "property_unit_uuid",
  "responsiblePersonId": "person_uuid",
  "fromStatus": "underReview",
  "toStatus": "approved",
  "amount": "25.00",
  "currency": "USD",
  "chargeId": "charge_uuid",
  "reason": "Justificación administrativa.",
  "appealId": "appeal_uuid",
  "evidenceId": "evidence_uuid",
  "traceId": "req_123456"
}
```

---

## 21.3. Metadata prohibida

```text id="hg6h11"
payload completo
tokens
secretos
cookies
headers completos
archivos completos
comprobantes
datos personales innecesarios
detalles extensos de evidencia
full request body
raw file content
```

---

# 22. Observabilidad

## 22.1. Logs sugeridos

```text id="rv7dxp"
fineConcept.created
fineConcept.updated
fineConcept.archived
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
fineEvidence.downloaded
fineAppeal.submitted
fineAppeal.accepted
fineAppeal.rejected
```

---

## 22.2. Métricas sugeridas

```text id="dv83bt"
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
fine_evidence_downloaded_total
```

---

## 22.3. Labels permitidos

```text id="m8vtts"
status
action
outcome
severity
category
```

---

## 22.4. Labels prohibidos

```text id="db4w79"
tenantId
fineId
fineConceptId
propertyUnitId
personId
userId
chargeId
traceId
ipAddress
```

---

# 23. OpenAPI

## 23.1. Tags sugeridos

```text id="hi1l2n"
Fine Concepts
Fines
Fine Evidence
Fine Appeals
My Fines
My Fine Appeals
```

---

## 23.2. Extensiones OpenAPI sugeridas

### Endpoint tenant

```yaml id="vwwe2l"
x-tenant-scope: true
x-auth-required: true
x-required-permission: fines.issue
x-audit-event: fine.issued
```

---

### Endpoint `/me`

```yaml id="a5cxux"
x-tenant-scope: true
x-auth-required: true
x-own-resource: true
x-required-permission: fines.read.own
```

---

### Endpoint de evidencia

```yaml id="suqr6g"
x-tenant-scope: true
x-auth-required: true
x-evidence-protected: true
x-audit-event: fineEvidence.downloaded
```

---

### Generación de cargo

```yaml id="p42j3l"
x-tenant-scope: true
x-auth-required: true
x-required-permission: fines.generateCharge
x-idempotency-required: recommended
x-financial-integration: dues-fees
x-audit-event: fine.chargeGenerated
```

---

## 23.3. OpenAPI no debe documentar

```text id="cdz32y"
GET /api/v1/public/tenants/{slug}/fines
GET /api/v1/public/tenants/{slug}/sanctions
GET /api/v1/public/tenants/{slug}/fine-evidence
POST /api/v1/public/tenants/{slug}/fines
POST /api/v1/public/tenants/{slug}/fine-appeals
endpoints públicos de evidencia
endpoints públicos de descarga
endpoints de pagos desde multas
endpoints de conciliación desde multas
```

---

# 24. Casos borde del contrato

| Caso                                           | Resultado esperado                       |
| ---------------------------------------------- | ---------------------------------------- |
| Concepto inexistente                           | 404                                      |
| Concepto de otro tenant                        | 404/403                                  |
| Concepto inactivo                              | 422                                      |
| Código duplicado                               | 409                                      |
| Monto negativo                                 | 422                                      |
| Monto float                                    | 422                                      |
| Multa monetaria sin unidad                     | 422                                      |
| Unidad de otro tenant                          | 403                                      |
| Responsable de otro tenant                     | 403                                      |
| Aprobar sin evidencia requerida                | 422                                      |
| Aprobar multa rechazada                        | 409                                      |
| Rechazar sin razón                             | 422                                      |
| Cancelar sin razón                             | 422                                      |
| Emitir multa no aprobada                       | 409                                      |
| Emitir multa ya emitida                        | 409                                      |
| Emitir multa sin concepto financiero requerido | 422                                      |
| Generar cargo duplicado                        | 200 con cargo existente o 409 controlado |
| Condonar sin razón                             | 422                                      |
| Reversar sin razón                             | 422                                      |
| Reclamo fuera de plazo                         | 409                                      |
| Reclamo sobre multa no emitida                 | 409                                      |
| Reclamo duplicado abierto                      | 409                                      |
| Reclamo de multa ajena                         | 403/404                                  |
| Residente consulta multa ajena                 | 403/404                                  |
| Evidencia de multa ajena                       | 403/404                                  |
| Descargar evidencia sin permiso                | 403                                      |
| WordPress consulta multas                      | endpoint no existe                       |
| WordPress descarga evidencia                   | endpoint no existe                       |
| Pago desde multas                              | endpoint no existe                       |
| Estado de cuenta desde multas                  | endpoint no existe                       |
| Tenant suspendido                              | bloquea nuevas multas según política     |

---

# 25. Pruebas de contrato requeridas

## 25.1. Fine Concepts

```text id="y6e2qd"
GET /api/v1/tenant/fine-concepts
POST /api/v1/tenant/fine-concepts
GET /api/v1/tenant/fine-concepts/{fineConceptId}
PATCH /api/v1/tenant/fine-concepts/{fineConceptId}
POST /api/v1/tenant/fine-concepts/{fineConceptId}/activate
POST /api/v1/tenant/fine-concepts/{fineConceptId}/deactivate
POST /api/v1/tenant/fine-concepts/{fineConceptId}/archive
```

Casos mínimos:

* 401 sin token;
* 403 sin permiso;
* 200/201 con permiso;
* 409 código duplicado;
* 422 monto inválido;
* 422 concepto financiero requerido;
* audit event.

---

## 25.2. Fines administrativas

```text id="fwmdjd"
GET /api/v1/tenant/fines
POST /api/v1/tenant/fines
GET /api/v1/tenant/fines/{fineId}
PATCH /api/v1/tenant/fines/{fineId}
POST /api/v1/tenant/fines/{fineId}/submit-review
POST /api/v1/tenant/fines/{fineId}/approve
POST /api/v1/tenant/fines/{fineId}/reject
POST /api/v1/tenant/fines/{fineId}/issue
POST /api/v1/tenant/fines/{fineId}/cancel
POST /api/v1/tenant/fines/{fineId}/waive
POST /api/v1/tenant/fines/{fineId}/reverse
POST /api/v1/tenant/fines/{fineId}/archive
POST /api/v1/tenant/fines/{fineId}/generate-charge
```

Casos mínimos:

* crear multa válida;
* bloquear unidad de otro tenant;
* bloquear responsable de otro tenant;
* bloquear transición inválida;
* bloquear aprobación sin evidencia requerida;
* emitir multa y generar cargo;
* evitar cargo duplicado;
* no procesar pago;
* status history;
* audit event.

---

## 25.3. Fine Evidence

```text id="rwmf2v"
GET /api/v1/tenant/fines/{fineId}/evidence
POST /api/v1/tenant/fines/{fineId}/evidence
GET /api/v1/tenant/fine-evidence/{evidenceId}
GET /api/v1/tenant/fine-evidence/{evidenceId}/download
POST /api/v1/tenant/fine-evidence/{evidenceId}/archive
```

Casos mínimos:

* evidencia válida;
* archivo inválido;
* evidencia de otro tenant;
* descarga sin permiso;
* descarga con permiso;
* audit event de descarga;
* no URL pública persistente.

---

## 25.4. Fine Appeals administrativas

```text id="oypmjr"
GET /api/v1/tenant/fines/{fineId}/appeals
GET /api/v1/tenant/fine-appeals/{appealId}
POST /api/v1/tenant/fine-appeals/{appealId}/accept
POST /api/v1/tenant/fine-appeals/{appealId}/reject
POST /api/v1/tenant/fine-appeals/{appealId}/cancel
```

Casos mínimos:

* listar reclamos;
* obtener reclamo;
* aceptar reclamo;
* rechazar reclamo;
* cancelar reclamo;
* transición de multa correcta;
* audit event.

---

## 25.5. Fines propias

```text id="qxupep"
GET /api/v1/me/fines
GET /api/v1/me/fines/{fineId}
GET /api/v1/me/fines/{fineId}/evidence
POST /api/v1/me/fines/{fineId}/appeals
```

Casos mínimos:

* usuario ve solo multas propias;
* usuario no ve multa ajena;
* usuario no reclama multa ajena;
* usuario no ve evidencia no autorizada;
* usuario presenta reclamo válido;
* reclamo fuera de plazo falla;
* reclamo duplicado falla.

---

## 25.6. My Fine Appeals

```text id="j5eu1w"
GET /api/v1/me/fine-appeals
GET /api/v1/me/fine-appeals/{appealId}
```

Casos mínimos:

* usuario lista solo sus reclamos;
* usuario no ve reclamos de multas ajenas;
* filtros funcionan;
* paginación funciona.

---

# 26. Decisión final del contrato API

El módulo `011-fines-sanctions` expondrá endpoints REST para:

```text id="nmarr2"
1. Gestión administrativa de conceptos de multa.
2. Gestión administrativa de multas.
3. Gestión de evidencias.
4. Gestión administrativa de reclamos.
5. Consulta de multas propias.
6. Presentación de reclamos propios.
7. Consulta de reclamos propios.
8. Generación idempotente de cargos asociados.
```

El contrato API debe garantizar:

```text id="mbj6al"
tenant isolation
permissioned access
own-resource authorization
state transition control
evidence access control
reason requirements
Decimal money as string
idempotent charge generation
no payment processing
no direct account statement mutation
audit trail
safe errors
safe logs
no public WordPress exposure
OpenAPI consistency
```

La implementación no debe aceptarse si permite multas cross-tenant, asigna multas a unidades ajenas, expone evidencias a usuarios no autorizados, expone multas a WordPress, genera cargos duplicados, usa float para dinero, procesa pagos directamente, modifica estados de cuenta directamente, elimina historial o permite transiciones de estado no autorizadas.
