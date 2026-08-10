# API Contract — Spec 015 Certified Minutes

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                                   |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                                           |
| Spec ID         | 015                                                                                                                                                                                     |
| Módulo          | Certified Minutes                                                                                                                                                                       |
| Documento       | API Contract                                                                                                                                                                            |
| Ruta            | `docs/specs/015-certified-minutes/api-contract.md`                                                                                                                                      |
| Versión         | 0.1                                                                                                                                                                                     |
| Estado          | needs-review                                                                                                                                                                            |
| Fecha           | 2026-07-21                                                                                                                                                                              |
| Documento base  | `docs/specs/015-certified-minutes/spec.md`                                                                                                                                              |
| Plan técnico    | `docs/specs/015-certified-minutes/plan.md`                                                                                                                                              |
| Modelo de datos | `docs/specs/015-certified-minutes/data-model.md`                                                                                                                                        |
| API Style       | REST                                                                                                                                                                                    |
| API Version     | `/api/v1`                                                                                                                                                                               |
| Naturaleza      | Tenant-scoped / Meeting-bound / Version-controlled / Seal-hash-enabled / Storage-backed / Publication-controlled / Audience-protected / Own-resource protected / Auditable / Non-public |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `007-audit`, `012-communications-notifications`, `013-meetings-attendance`, `014-voting-basic`                            |

---

## 2. Propósito

Este documento define el contrato API REST para el módulo `015-certified-minutes`.

El módulo permite gestionar actas formales internas vinculadas a reuniones, con importación desde actas preliminares, versionado, secciones, revisión, aprobación, sellado interno mediante hash, generación de PDF, adjuntos, publicaciones controladas, descargas autorizadas, acceso propio y auditoría.

Regla central:

```text id="h9q5cx"
Toda operación sobre actas certificadas debe estar autenticada, autorizada, tenant-scoped, meeting-bound, version-controlled, audience-protected, integrity-aware, auditable y sin exposición pública en MVP.
```

---

## 3. Principios del contrato API

### 3.1. Tenant scope obligatorio

Todos los endpoints administrativos y `/me` operan dentro del tenant activo del usuario autenticado.

Regla:

```text id="kcchjk"
currentTenant.id debe ser el tenant_id efectivo en toda consulta, mutación, descarga, publicación, generación de PDF, acceso y auditoría.
```

El cliente no debe enviar `tenantId` en el body.

---

### 3.2. Autenticación

Todos los endpoints del módulo requieren:

```text id="bnqk10"
Authorization: Bearer <access_token>
```

No existen endpoints públicos para actas certificadas en MVP.

---

### 3.3. Autorización

La autorización se resuelve dentro de RESIDENT Core.

Regla:

```text id="c10pkd"
Keycloak autentica; RESIDENT Core autoriza por tenant, membership, permiso, reunión, versión, audiencia, recurso propio, estado y regla de negocio.
```

---

### 3.4. No exposición pública

MVP no expone actas certificadas en `/api/v1/public`.

Prohibido:

```text id="lwyl0m"
GET /api/v1/public/tenants/{slug}/certified-minutes
GET /api/v1/public/tenants/{slug}/certified-minutes/{certifiedMinutesId}
GET /api/v1/public/tenants/{slug}/certified-minutes/{certifiedMinutesId}/download
GET /api/v1/public/tenants/{slug}/certified-minutes-artifacts/{artifactId}/download
```

---

### 3.5. Endpoints `/me`

Los endpoints `/me` solo devuelven actas publicadas para la audiencia autorizada del usuario autenticado.

Regla conceptual:

```text id="ob525n"
actorUserId -> personIds -> propertyUnitIds -> roleIds -> publication audienceRules -> certifiedMinutes
```

---

### 3.6. Versionado obligatorio

No se debe modificar silenciosamente una versión aprobada, sellada o publicada.

Regla:

```text id="whxjfb"
Una versión sealed es inmutable.
```

---

### 3.7. Sellado interno

El sellado interno se basa en hash de integridad.

MVP:

```text id="xqtszr"
SHA-256
```

El hash no representa firma electrónica legal, certificación notarial ni sellado de tiempo externo.

---

### 3.8. Descargas seguras

Los endpoints de descarga no deben exponer:

```text id="uwsoev"
storageKey
bucket
path interno
URL permanente
URL firmada persistente
credenciales
provider metadata sensible
```

La descarga debe resolverse por endpoint controlado o URL temporal corta generada luego de autorización.

---

### 3.9. No ejecución automática

Una acta aprobada, sellada o publicada no ejecuta acciones automáticas.

Prohibido en MVP:

```text id="oz3b05"
generar cargos
generar multas
aprobar resoluciones automáticamente
ejecutar resoluciones
modificar presupuestos
modificar reglamentos
activar contratos
notificar terceros externos sin flujo explícito
```

---

### 3.10. Cache

Todos los endpoints privados deben responder:

```text id="gtixeo"
Cache-Control: no-store
```

---

## 4. Rutas base

### 4.1. Certified Minutes administrativas

```text id="pjey7f"
/api/v1/tenant/certified-minutes
```

---

### 4.2. Versions

```text id="l478gj"
/api/v1/tenant/certified-minutes/{certifiedMinutesId}/versions
/api/v1/tenant/certified-minutes-versions
```

---

### 4.3. Sections

```text id="zppy0o"
/api/v1/tenant/certified-minutes/{certifiedMinutesId}/sections
/api/v1/tenant/certified-minutes-sections
```

---

### 4.4. Approvals

```text id="vktrfk"
/api/v1/tenant/certified-minutes/{certifiedMinutesId}/approvals
/api/v1/tenant/certified-minutes-approvals
```

---

### 4.5. Attachments

```text id="w9ndp3"
/api/v1/tenant/certified-minutes/{certifiedMinutesId}/attachments
/api/v1/tenant/certified-minutes-attachments
```

---

### 4.6. Artifacts

```text id="u8fkd1"
/api/v1/tenant/certified-minutes/{certifiedMinutesId}/artifacts
/api/v1/tenant/certified-minutes-artifacts
```

---

### 4.7. Publications

```text id="wmumac"
/api/v1/tenant/certified-minutes/{certifiedMinutesId}/publications
/api/v1/tenant/certified-minutes-publications
```

---

### 4.8. Certified Minutes propias

```text id="u2ddtf"
/api/v1/me/certified-minutes
```

---

## 5. Headers

### 5.1. Request headers

| Header             |                                                           Requerido | Descripción                                     |
| ------------------ | ------------------------------------------------------------------: | ----------------------------------------------- |
| `Authorization`    |                                                                  Sí | Bearer token                                    |
| `Content-Type`     |                                              Sí para POST/PATCH/PUT | `application/json` o multipart según endpoint   |
| `Accept`           |                                                         Recomendado | `application/json`                              |
| `X-Request-Id`     |                                                            Opcional | ID de request                                   |
| `X-Correlation-Id` |                                                            Opcional | ID de correlación                               |
| `Idempotency-Key`  | Recomendado en generación de PDF, publicación y descargas sensibles | Prevención adicional de duplicados accidentales |

---

### 5.2. Response headers

```text id="sxwzgh"
Content-Type: application/json
Cache-Control: no-store
X-Request-Id: <request-id>
X-Correlation-Id: <correlation-id>
```

Para descargas:

```text id="mlf1it"
Content-Type: application/pdf
Content-Disposition: attachment; filename="<safe-file-name>.pdf"
Cache-Control: no-store
X-Request-Id: <request-id>
X-Correlation-Id: <correlation-id>
```

---

## 6. Formato estándar de respuesta

### 6.1. Respuesta individual

```json id="gx76vn"
{
  "data": {},
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

### 6.2. Respuesta paginada

```json id="w418i6"
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

```json id="zz5xtf"
{
  "error": {
    "code": "CERTIFIED_MINUTES_NOT_FOUND",
    "message": "Certified minutes not found.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

## 7. Estados HTTP

| Código | Uso                                                    |
| -----: | ------------------------------------------------------ |
|    200 | Consulta o acción exitosa                              |
|    201 | Recurso creado                                         |
|    202 | Proceso aceptado si generación PDF se vuelve asíncrona |
|    204 | Acción exitosa sin cuerpo, si se adopta                |
|    400 | Request mal formado                                    |
|    401 | No autenticado                                         |
|    403 | Sin permiso o sin acceso por audiencia                 |
|    404 | Recurso no encontrado o no accesible                   |
|    409 | Conflicto de estado, duplicidad o recurso no editable  |
|    413 | Archivo demasiado grande                               |
|    415 | Tipo de archivo no soportado                           |
|    422 | Validación semántica fallida                           |
|    429 | Rate limit                                             |
|    500 | Error interno controlado                               |

---

## 8. Permisos

### 8.1. Certified Minutes

```text id="ray67f"
certifiedMinutes.create
certifiedMinutes.read
certifiedMinutes.update
certifiedMinutes.submitReview
certifiedMinutes.approve
certifiedMinutes.reject
certifiedMinutes.requestChanges
certifiedMinutes.seal
certifiedMinutes.publish
certifiedMinutes.revokePublication
certifiedMinutes.archive
```

---

### 8.2. Versions

```text id="ybcvl4"
certifiedMinutesVersions.create
certifiedMinutesVersions.read
certifiedMinutesVersions.compare
certifiedMinutesVersions.archive
```

---

### 8.3. Sections

```text id="qcd6mt"
certifiedMinutesSections.create
certifiedMinutesSections.read
certifiedMinutesSections.update
certifiedMinutesSections.reorder
certifiedMinutesSections.archive
```

---

### 8.4. Approvals

```text id="hwy8dw"
certifiedMinutesApprovals.create
certifiedMinutesApprovals.read
```

---

### 8.5. Attachments

```text id="rcecrt"
certifiedMinutesAttachments.create
certifiedMinutesAttachments.read
certifiedMinutesAttachments.download
certifiedMinutesAttachments.archive
```

---

### 8.6. Artifacts

```text id="kqv910"
certifiedMinutesArtifacts.generate
certifiedMinutesArtifacts.read
certifiedMinutesArtifacts.download
certifiedMinutesArtifacts.archive
```

---

### 8.7. Publications

```text id="ru079e"
certifiedMinutesPublications.read
certifiedMinutesPublications.revoke
certifiedMinutesPublications.archive
```

---

### 8.8. Own access

```text id="m2upbm"
certifiedMinutes.read.own
certifiedMinutesArtifacts.download.own
```

---

### 8.9. Auditoría

```text id="hpe4hm"
certifiedMinutes.audit.read
```

---

## 9. Enums API

### 9.1. CertifiedMinutesStatus

```text id="l4vh85"
draft
underReview
changesRequested
approved
sealed
published
superseded
cancelled
archived
```

---

### 9.2. CertifiedMinutesVersionStatus

```text id="imymlj"
draft
underReview
approved
sealed
superseded
archived
```

---

### 9.3. CertifiedMinutesVisibility

```text id="kjrhq9"
administrative
board
meetingParticipants
owners
residents
tenant
mixed
restricted
```

---

### 9.4. CertificationMode

```text id="letqan"
internalHash
manualApproval
systemGeneratedPdf
```

Diferidos:

```text id="okfv64"
electronicSignature
qualifiedSignature
externalTimestamp
notarialCertification
publicVerification
```

---

### 9.5. MinutesSectionType

```text id="ycxlcm"
header
meetingInfo
callNotice
attendance
quorum
agenda
discussion
voting
resolutions
agreements
observations
closure
attachments
custom
```

---

### 9.6. ApprovalDecision

```text id="tkbhi9"
approved
rejected
changesRequested
commented
```

---

### 9.7. CertifiedMinutesAttachmentType

```text id="slzyrb"
supportingDocument
attendanceSheet
votingReport
resolutionDocument
image
pdf
other
```

---

### 9.8. CertifiedMinutesAttachmentStatus

```text id="e0cxd9"
uploaded
available
quarantined
rejected
archived
```

---

### 9.9. CertifiedMinutesArtifactType

```text id="v6917h"
pdf
draftPdf
htmlSnapshot
jsonSnapshot
hashManifest
```

---

### 9.10. CertifiedMinutesArtifactStatus

```text id="dojdwu"
pending
generated
failed
archived
```

---

### 9.11. CertifiedMinutesPublicationStatus

```text id="n45nqi"
draft
published
expired
revoked
archived
```

---

### 9.12. CertifiedMinutesAudienceType

```text id="g22gwg"
administrators
board
meetingParticipants
owners
residents
tenant
propertyUnits
specificUsers
roles
mixed
restricted
```

---

### 9.13. CertifiedMinutesAccessType

```text id="dsvflb"
view
download
export
print
```

---

### 9.14. CertifiedMinutesAccessOutcome

```text id="ar7wo2"
allowed
denied
notFound
expired
revoked
error
```

---

### 9.15. HashAlgorithm

```text id="waqz2o"
SHA-256
```

---

# 10. Certified Minutes administrativas

## 10.1. Listar actas certificadas

### Endpoint

```http id="e7la2v"
GET /api/v1/tenant/certified-minutes
```

### Permiso

```text id="q7l2b3"
certifiedMinutes.read
```

### Query params

| Nombre              | Tipo      | Requerido | Descripción                                                                                                 |
| ------------------- | --------- | --------: | ----------------------------------------------------------------------------------------------------------- |
| `status`            | string    |        No | Estado del acta                                                                                             |
| `visibility`        | string    |        No | Visibilidad                                                                                                 |
| `certificationMode` | string    |        No | Modo de certificación interna                                                                               |
| `meetingId`         | string    |        No | Reunión asociada                                                                                            |
| `code`              | string    |        No | Código de acta                                                                                              |
| `submittedFrom`     | date-time |        No | Fecha de envío a revisión desde                                                                             |
| `submittedTo`       | date-time |        No | Fecha de envío a revisión hasta                                                                             |
| `approvedFrom`      | date-time |        No | Fecha de aprobación desde                                                                                   |
| `approvedTo`        | date-time |        No | Fecha de aprobación hasta                                                                                   |
| `sealedFrom`        | date-time |        No | Fecha de sellado desde                                                                                      |
| `sealedTo`          | date-time |        No | Fecha de sellado hasta                                                                                      |
| `publishedFrom`     | date-time |        No | Fecha de publicación desde                                                                                  |
| `publishedTo`       | date-time |        No | Fecha de publicación hasta                                                                                  |
| `q`                 | string    |        No | Búsqueda por título o código                                                                                |
| `page`              | number    |        No | Default 1                                                                                                   |
| `pageSize`          | number    |        No | Default 20, máximo 100                                                                                      |
| `sortBy`            | string    |        No | `createdAt`, `updatedAt`, `submittedAt`, `approvedAt`, `sealedAt`, `publishedAt`, `title`, `code`, `status` |
| `sortOrder`         | string    |        No | `asc`, `desc`                                                                                               |

### Response 200

```json id="am77pr"
{
  "data": [
    {
      "id": "certified_minutes_uuid",
      "meetingId": "meeting_uuid",
      "sourceMeetingMinutesId": "meeting_minutes_uuid",
      "title": "Acta de Asamblea Ordinaria 2026",
      "code": "ACTA-2026-0001",
      "status": "sealed",
      "visibility": "owners",
      "certificationMode": "internalHash",
      "currentVersionId": "version_uuid",
      "publishedVersionId": null,
      "submittedAt": "2026-08-15T18:00:00Z",
      "approvedAt": "2026-08-15T19:00:00Z",
      "sealedAt": "2026-08-15T19:10:00Z",
      "publishedAt": null,
      "updatedAt": "2026-08-15T19:10:00Z"
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

* No devuelve contenido completo en listado.
* No devuelve `storageKey`.
* No devuelve `sealHash` completo.
* Filtra por `tenantId`.

---

## 10.2. Crear acta certificada

### Endpoint

```http id="e1u5vw"
POST /api/v1/tenant/certified-minutes
```

### Permiso

```text id="i7c79a"
certifiedMinutes.create
```

### Request body

```json id="n40yk1"
{
  "meetingId": "meeting_uuid",
  "sourceMeetingMinutesId": "meeting_minutes_uuid",
  "title": "Acta de Asamblea Ordinaria 2026",
  "code": "ACTA-2026-0001",
  "visibility": "owners",
  "certificationMode": "internalHash"
}
```

### Response 201

```json id="v2sdjf"
{
  "data": {
    "id": "certified_minutes_uuid",
    "meetingId": "meeting_uuid",
    "sourceMeetingMinutesId": "meeting_minutes_uuid",
    "title": "Acta de Asamblea Ordinaria 2026",
    "code": "ACTA-2026-0001",
    "status": "draft",
    "visibility": "owners",
    "certificationMode": "internalHash",
    "currentVersionId": null,
    "approvedVersionId": null,
    "sealedVersionId": null,
    "publishedVersionId": null,
    "submittedAt": null,
    "approvedAt": null,
    "sealedAt": null,
    "publishedAt": null,
    "createdAt": "2026-07-21T10:00:00Z",
    "updatedAt": "2026-07-21T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* El cliente no envía `tenantId`.
* `meetingId` obligatorio y del mismo tenant.
* `sourceMeetingMinutesId` opcional.
* Si `sourceMeetingMinutesId` existe, debe pertenecer al mismo tenant y a la misma reunión.
* No debe existir otra acta activa principal para la misma reunión.
* Estado inicial: `draft`.
* No crea PDF automáticamente.
* No publica automáticamente.
* No ejecuta resoluciones.

### Evento auditable

```text id="z3gnrn"
certifiedMinutes.created
```

---

## 10.3. Obtener acta certificada

### Endpoint

```http id="zy51ol"
GET /api/v1/tenant/certified-minutes/{certifiedMinutesId}
```

### Permiso

```text id="koipui"
certifiedMinutes.read
```

### Response 200

```json id="vr8zns"
{
  "data": {
    "id": "certified_minutes_uuid",
    "meetingId": "meeting_uuid",
    "sourceMeetingMinutesId": "meeting_minutes_uuid",
    "title": "Acta de Asamblea Ordinaria 2026",
    "code": "ACTA-2026-0001",
    "status": "sealed",
    "visibility": "owners",
    "certificationMode": "internalHash",
    "currentVersionId": "version_uuid",
    "approvedVersionId": "version_uuid",
    "sealedVersionId": "version_uuid",
    "publishedVersionId": null,
    "submittedAt": "2026-08-15T18:00:00Z",
    "approvedAt": "2026-08-15T19:00:00Z",
    "sealedAt": "2026-08-15T19:10:00Z",
    "publishedAt": null,
    "archivedAt": null,
    "cancelledAt": null,
    "cancellationReason": null,
    "sealHashPrefix": "a1b2c3d4e5f6",
    "sealAlgorithm": "SHA-256",
    "createdAt": "2026-07-21T10:00:00Z",
    "updatedAt": "2026-08-15T19:10:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* No devuelve `sealHash` completo salvo permiso futuro explícito.
* No devuelve `storageKey`.
* No devuelve URLs firmadas.
* No devuelve contenido completo de adjuntos.
* Filtra por `tenantId`.

---

## 10.4. Actualizar acta certificada

### Endpoint

```http id="fhepub"
PATCH /api/v1/tenant/certified-minutes/{certifiedMinutesId}
```

### Permiso

```text id="d0i85q"
certifiedMinutes.update
```

### Estados editables

```text id="evdujt"
draft
changesRequested
```

### Request body

```json id="wtrxc8"
{
  "title": "Acta de Asamblea Ordinaria 2026 actualizada",
  "code": "ACTA-2026-0001",
  "visibility": "owners"
}
```

### Response 200

```json id="zrh1aw"
{
  "data": {
    "id": "certified_minutes_uuid",
    "title": "Acta de Asamblea Ordinaria 2026 actualizada",
    "code": "ACTA-2026-0001",
    "status": "draft",
    "visibility": "owners",
    "updatedAt": "2026-07-21T11:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Campos prohibidos en PATCH genérico

```text id="t6uj7o"
tenantId
meetingId
sourceMeetingMinutesId
status
currentVersionId
approvedVersionId
sealedVersionId
publishedVersionId
createdBy
updatedBy
submittedBy
approvedBy
sealedBy
publishedBy
archivedBy
cancelledBy
submittedAt
approvedAt
sealedAt
publishedAt
archivedAt
cancelledAt
sealHash
sealAlgorithm
createdAt
updatedAt
```

### Evento auditable

```text id="kvtdku"
certifiedMinutes.updated
```

---

## 10.5. Importar desde MeetingMinutes

### Endpoint

```http id="ro614b"
POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/import-from-meeting-minutes
```

### Permiso

```text id="mepnfi"
certifiedMinutes.update
```

### Request body

```json id="dehdt9"
{
  "sourceMeetingMinutesId": "meeting_minutes_uuid",
  "createInitialVersion": true,
  "includeAgenda": true,
  "includeAttendanceSummary": true,
  "includeQuorumSummary": true,
  "includeVotingResults": true,
  "includeResolutions": true,
  "changeReason": "Importación inicial desde acta preliminar."
}
```

### Response 200

```json id="k1lq6s"
{
  "data": {
    "certifiedMinutesId": "certified_minutes_uuid",
    "sourceMeetingMinutesId": "meeting_minutes_uuid",
    "versionId": "version_uuid",
    "sectionsCreated": 7,
    "imported": true
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Acta debe estar en estado editable.
* `sourceMeetingMinutesId` debe pertenecer al mismo tenant.
* `sourceMeetingMinutesId` debe pertenecer a la misma reunión.
* Resultados de votación importados deben ser publicados o autorizados.
* No se importan votos individuales en `secretBasic`.
* No se recalculan votaciones.
* Se sanitiza contenido importado.

### Evento auditable

```text id="us1djz"
certifiedMinutes.importedFromMeetingMinutes
```

---

## 10.6. Enviar a revisión

### Endpoint

```http id="p0m4u3"
POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/submit-review
```

### Permiso

```text id="l2j2xz"
certifiedMinutes.submitReview
```

### Request body

```json id="wcid42"
{
  "versionId": "version_uuid",
  "notes": "Acta lista para revisión de la directiva.",
  "notifyReviewers": true
}
```

### Response 200

```json id="zc6k8d"
{
  "data": {
    "id": "certified_minutes_uuid",
    "status": "underReview",
    "currentVersionId": "version_uuid",
    "submittedAt": "2026-08-15T18:00:00Z",
    "notificationsRequested": true
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Estado origen: `draft` o `changesRequested`.
* Versión debe estar `draft`.
* Deben existir secciones mínimas requeridas.
* No debe existir contenido inválido.
* Cambia versión a `underReview`.
* No sella ni publica.

### Evento auditable

```text id="foz5yo"
certifiedMinutes.submittedForReview
```

### Evento de notificación sugerido

```text id="zrp89u"
certifiedMinutes.submittedForReview
```

---

## 10.7. Aprobar acta

### Endpoint

```http id="f5z2pq"
POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/approve
```

### Permiso

```text id="gy7bj0"
certifiedMinutes.approve
```

### Request body

```json id="opwu8h"
{
  "versionId": "version_uuid",
  "comments": "Acta revisada y aprobada para sellado interno."
}
```

### Response 200

```json id="i0exak"
{
  "data": {
    "id": "certified_minutes_uuid",
    "status": "approved",
    "approvedVersionId": "version_uuid",
    "approvedAt": "2026-08-15T19:00:00Z",
    "approvalId": "approval_uuid"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Estado origen: `underReview`.
* Versión debe estar `underReview`.
* Registra aprobación.
* Cambia versión a `approved`.
* No equivale a firma electrónica legal.
* No sella automáticamente salvo política futura.
* No publica automáticamente.

### Eventos auditables

```text id="d4j0k7"
certifiedMinutesApproval.created
certifiedMinutes.approved
```

---

## 10.8. Rechazar acta

### Endpoint

```http id="wjx0kk"
POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/reject
```

### Permiso

```text id="xnqa90"
certifiedMinutes.reject
```

### Request body

```json id="li5rqq"
{
  "versionId": "version_uuid",
  "comments": "El acta contiene información incompleta de asistencia."
}
```

### Response 200

```json id="a1udvu"
{
  "data": {
    "id": "certified_minutes_uuid",
    "status": "changesRequested",
    "approvalId": "approval_uuid"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* `comments` obligatorio.
* Estado origen: `underReview`.
* No elimina versión.
* No sella.
* No publica.

### Eventos auditables

```text id="l4203n"
certifiedMinutesApproval.created
certifiedMinutes.rejected
```

---

## 10.9. Solicitar cambios

### Endpoint

```http id="h4nwyg"
POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/request-changes
```

### Permiso

```text id="c41ebo"
certifiedMinutes.requestChanges
```

### Request body

```json id="vp6m2v"
{
  "versionId": "version_uuid",
  "comments": "Agregar detalle de resoluciones aprobadas."
}
```

### Response 200

```json id="r9a0h4"
{
  "data": {
    "id": "certified_minutes_uuid",
    "status": "changesRequested",
    "approvalId": "approval_uuid"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* `comments` obligatorio.
* Estado origen: `underReview`.
* Versión puede volver a `draft`.
* Requiere nueva revisión antes de aprobar.

### Eventos auditables

```text id="llloav"
certifiedMinutesApproval.created
certifiedMinutes.changesRequested
```

### Evento de notificación sugerido

```text id="p71tol"
certifiedMinutes.changesRequested
```

---

## 10.10. Sellar acta

### Endpoint

```http id="k56otg"
POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/seal
```

### Permiso

```text id="ne6ed7"
certifiedMinutes.seal
```

### Request body

```json id="yli51x"
{
  "versionId": "version_uuid",
  "hashAlgorithm": "SHA-256",
  "notes": "Sellado interno posterior a aprobación."
}
```

### Response 200

```json id="e0mm2u"
{
  "data": {
    "id": "certified_minutes_uuid",
    "status": "sealed",
    "sealedVersionId": "version_uuid",
    "sealedAt": "2026-08-15T19:10:00Z",
    "sealAlgorithm": "SHA-256",
    "sealHashPrefix": "a1b2c3d4e5f6",
    "legalSignature": false
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Estado origen: `approved`.
* Versión debe estar `approved`.
* Calcula hash sobre contenido canonicalizado.
* Bloquea versión sellada.
* Registra `sealHash` y `sealAlgorithm`.
* No equivale a firma electrónica legal.
* No publica automáticamente.

### Evento auditable

```text id="bkadd4"
certifiedMinutes.sealed
```

---

## 10.11. Publicar acta

### Endpoint

```http id="z39wur"
POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/publish
```

### Permiso

```text id="nd2sa2"
certifiedMinutes.publish
```

### Request body

```json id="b9pz4p"
{
  "versionId": "version_uuid",
  "artifactId": "artifact_uuid",
  "audienceType": "owners",
  "audienceRules": null,
  "expiresAt": null,
  "notifyAudience": true,
  "notes": "Publicación del acta aprobada para propietarios."
}
```

### Response 200

```json id="qwdnrf"
{
  "data": {
    "id": "certified_minutes_uuid",
    "status": "published",
    "publishedVersionId": "version_uuid",
    "publishedAt": "2026-08-15T19:30:00Z",
    "publicationId": "publication_uuid",
    "notificationsRequested": true
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Acta debe estar `sealed`.
* Versión debe estar `sealed`.
* Debe existir audiencia.
* Si `artifactId` existe, debe pertenecer al mismo tenant, acta y versión.
* No publica en endpoint público.
* No envía contenido completo en notificaciones.
* No ejecuta acciones automáticas.

### Eventos auditables

```text id="r1fplz"
certifiedMinutes.published
certifiedMinutesPublication.created
```

### Evento de notificación sugerido

```text id="loyrzm"
certifiedMinutes.published
```

---

## 10.12. Revocar publicación

### Endpoint

```http id="p0jp2g"
POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/revoke-publication
```

### Permiso

```text id="loio4t"
certifiedMinutes.revokePublication
```

### Request body

```json id="gpqauc"
{
  "publicationId": "publication_uuid",
  "reason": "Publicación revocada por error administrativo en audiencia."
}
```

### Response 200

```json id="gtn0mo"
{
  "data": {
    "certifiedMinutesId": "certified_minutes_uuid",
    "publicationId": "publication_uuid",
    "publicationStatus": "revoked",
    "revokedAt": "2026-08-15T20:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* `reason` obligatorio.
* No elimina acta.
* No elimina versión.
* No elimina artefacto.
* No elimina auditoría.
* Puede mantener `CertifiedMinutes.status = published` si existen otras publicaciones activas.
* Si no quedan publicaciones activas, política puede mover estado a `sealed`.

### Evento auditable

```text id="wpwxwx"
certifiedMinutes.publicationRevoked
```

---

## 10.13. Archivar acta

### Endpoint

```http id="y0kgg8"
POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/archive
```

### Permiso

```text id="c86yu3"
certifiedMinutes.archive
```

### Request body

```json id="genf4m"
{
  "reason": "Acta archivada por cierre administrativo del periodo."
}
```

### Response 200

```json id="gbjl0v"
{
  "data": {
    "id": "certified_minutes_uuid",
    "status": "archived",
    "archivedAt": "2026-08-20T12:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Archivo lógico.
* No elimina versiones, secciones, aprobaciones, adjuntos, artefactos, publicaciones ni accesos.
* No elimina archivos físicos de forma ordinaria.
* No borra auditoría.

### Evento auditable

```text id="frpoj6"
certifiedMinutes.archived
```

---

# 11. Versions

## 11.1. Listar versiones

### Endpoint

```http id="xpjtvv"
GET /api/v1/tenant/certified-minutes/{certifiedMinutesId}/versions
```

### Permiso

```text id="qwevs8"
certifiedMinutesVersions.read
```

### Query params

| Nombre          | Tipo      | Requerido |
| --------------- | --------- | --------: |
| `status`        | string    |        No |
| `versionNumber` | number    |        No |
| `createdFrom`   | date-time |        No |
| `createdTo`     | date-time |        No |
| `page`          | number    |        No |
| `pageSize`      | number    |        No |

### Response 200

```json id="r63tvv"
{
  "data": [
    {
      "id": "version_uuid",
      "certifiedMinutesId": "certified_minutes_uuid",
      "versionNumber": 1,
      "status": "sealed",
      "title": "Acta de Asamblea Ordinaria 2026",
      "summary": "Versión aprobada y sellada.",
      "contentHashPrefix": "d4e5f6a1b2c3",
      "hashAlgorithm": "SHA-256",
      "changeReason": "Versión inicial.",
      "createdAt": "2026-08-15T18:00:00Z",
      "approvedAt": "2026-08-15T19:00:00Z",
      "sealedAt": "2026-08-15T19:10:00Z",
      "archivedAt": null
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

## 11.2. Crear versión

### Endpoint

```http id="ek1p4s"
POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/versions
```

### Permiso

```text id="ljhj8h"
certifiedMinutesVersions.create
```

### Request body

```json id="tfvkqc"
{
  "title": "Acta de Asamblea Ordinaria 2026 — Versión corregida",
  "summary": "Corrección de sección de resoluciones.",
  "copyFromVersionId": "previous_version_uuid",
  "changeReason": "Corrección solicitada por directiva."
}
```

### Response 201

```json id="szx3me"
{
  "data": {
    "id": "version_uuid",
    "certifiedMinutesId": "certified_minutes_uuid",
    "versionNumber": 2,
    "status": "draft",
    "title": "Acta de Asamblea Ordinaria 2026 — Versión corregida",
    "summary": "Corrección de sección de resoluciones.",
    "contentHashPrefix": null,
    "hashAlgorithm": null,
    "changeReason": "Corrección solicitada por directiva.",
    "createdAt": "2026-08-16T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Versión nueva incrementa `versionNumber`.
* `copyFromVersionId` debe pertenecer al mismo tenant y acta.
* `changeReason` obligatorio si no es la primera versión.
* No modifica versión anterior.
* No modifica versiones selladas.
* Puede marcar versión anterior como `superseded` solo por flujo controlado.

### Evento auditable

```text id="auhm71"
certifiedMinutesVersion.created
```

---

## 11.3. Obtener versión

### Endpoint

```http id="wh42v7"
GET /api/v1/tenant/certified-minutes-versions/{versionId}
```

### Permiso

```text id="q37sko"
certifiedMinutesVersions.read
```

### Response 200

```json id="hx4dyn"
{
  "data": {
    "id": "version_uuid",
    "certifiedMinutesId": "certified_minutes_uuid",
    "versionNumber": 1,
    "status": "sealed",
    "title": "Acta de Asamblea Ordinaria 2026",
    "summary": "Versión aprobada y sellada.",
    "contentSnapshot": {
      "title": "Acta de Asamblea Ordinaria 2026",
      "sections": [
        {
          "sectionType": "header",
          "order": 1,
          "title": "Encabezado",
          "body": "Contenido sanitizado."
        }
      ]
    },
    "contentHashPrefix": "d4e5f6a1b2c3",
    "hashAlgorithm": "SHA-256",
    "changeReason": "Versión inicial.",
    "createdAt": "2026-08-15T18:00:00Z",
    "approvedAt": "2026-08-15T19:00:00Z",
    "sealedAt": "2026-08-15T19:10:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Puede incluir `contentSnapshot` en endpoint individual administrativo.
* No debe incluir contenido completo de adjuntos.
* No debe incluir `storageKey`.
* Debe filtrar por `tenantId`.

---

## 11.4. Archivar versión

### Endpoint

```http id="tpoppr"
POST /api/v1/tenant/certified-minutes-versions/{versionId}/archive
```

### Permiso

```text id="yunif4"
certifiedMinutesVersions.archive
```

### Request body

```json id="hfvwpb"
{
  "reason": "Versión archivada por reemplazo controlado."
}
```

### Response 200

```json id="mo60zy"
{
  "data": {
    "id": "version_uuid",
    "status": "archived",
    "archivedAt": "2026-08-20T12:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Evento auditable

```text id="twlklb"
certifiedMinutesVersion.archived
```

---

## 11.5. Comparar versiones

### Endpoint

```http id="poratn"
GET /api/v1/tenant/certified-minutes/{certifiedMinutesId}/versions/compare
```

### Permiso

```text id="jx16nr"
certifiedMinutesVersions.compare
```

### Query params

| Nombre          | Tipo | Requerido |
| --------------- | ---- | --------: |
| `fromVersionId` | UUID |        Sí |
| `toVersionId`   | UUID |        Sí |

### Response 200

```json id="ftvohz"
{
  "data": {
    "certifiedMinutesId": "certified_minutes_uuid",
    "fromVersionId": "version_uuid_1",
    "toVersionId": "version_uuid_2",
    "summary": {
      "sectionsAdded": 1,
      "sectionsRemoved": 0,
      "sectionsModified": 2
    },
    "diff": [
      {
        "sectionType": "resolutions",
        "order": 8,
        "changeType": "modified",
        "title": "Resoluciones",
        "before": "Texto anterior sanitizado.",
        "after": "Texto nuevo sanitizado."
      }
    ]
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Ambas versiones deben pertenecer al mismo tenant y acta.
* No compara adjuntos binarios en MVP.
* No expone metadata sensible.

---

# 12. Sections

## 12.1. Listar secciones

### Endpoint

```http id="xvwqsp"
GET /api/v1/tenant/certified-minutes/{certifiedMinutesId}/sections
```

### Permiso

```text id="tagok2"
certifiedMinutesSections.read
```

### Query params

| Nombre        | Tipo    | Requerido |
| ------------- | ------- | --------: |
| `versionId`   | UUID    |        No |
| `sectionType` | string  |        No |
| `sourceType`  | string  |        No |
| `isRequired`  | boolean |        No |

### Response 200

```json id="j79734"
{
  "data": [
    {
      "id": "section_uuid",
      "certifiedMinutesId": "certified_minutes_uuid",
      "versionId": "version_uuid",
      "sectionType": "header",
      "order": 1,
      "title": "Encabezado",
      "body": "Contenido sanitizado.",
      "sourceType": null,
      "sourceId": null,
      "isRequired": true,
      "createdAt": "2026-08-15T18:00:00Z",
      "updatedAt": "2026-08-15T18:00:00Z"
    }
  ],
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 12.2. Crear sección

### Endpoint

```http id="n5xqpz"
POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/sections
```

### Permiso

```text id="e2gqrv"
certifiedMinutesSections.create
```

### Request body

```json id="ebjial"
{
  "versionId": "version_uuid",
  "sectionType": "resolutions",
  "order": 8,
  "title": "Resoluciones",
  "body": "Texto sanitizado de resoluciones.",
  "sourceType": "meetingResolution",
  "sourceId": "meeting_resolution_uuid",
  "isRequired": true
}
```

### Response 201

```json id="nnzhc4"
{
  "data": {
    "id": "section_uuid",
    "certifiedMinutesId": "certified_minutes_uuid",
    "versionId": "version_uuid",
    "sectionType": "resolutions",
    "order": 8,
    "title": "Resoluciones",
    "body": "Texto sanitizado de resoluciones.",
    "sourceType": "meetingResolution",
    "sourceId": "meeting_resolution_uuid",
    "isRequired": true,
    "createdAt": "2026-08-15T18:10:00Z",
    "updatedAt": "2026-08-15T18:10:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Acta debe estar editable.
* Versión debe estar editable.
* `order` único por versión.
* `body` debe sanitizarse.
* `sourceId` debe validarse contra tenant si se usa.
* No se puede crear sección en versión sellada.

### Evento auditable

```text id="gop4b7"
certifiedMinutesSection.created
```

---

## 12.3. Obtener sección

### Endpoint

```http id="xa9h0q"
GET /api/v1/tenant/certified-minutes-sections/{sectionId}
```

### Permiso

```text id="cru5vq"
certifiedMinutesSections.read
```

---

## 12.4. Actualizar sección

### Endpoint

```http id="q6a5lt"
PATCH /api/v1/tenant/certified-minutes-sections/{sectionId}
```

### Permiso

```text id="gerqie"
certifiedMinutesSections.update
```

### Request body

```json id="dmjjgl"
{
  "title": "Resoluciones aprobadas",
  "body": "Texto actualizado y sanitizado.",
  "order": 8,
  "isRequired": true
}
```

### Response 200

```json id="kle4i2"
{
  "data": {
    "id": "section_uuid",
    "title": "Resoluciones aprobadas",
    "body": "Texto actualizado y sanitizado.",
    "order": 8,
    "updatedAt": "2026-08-15T18:20:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Acta y versión deben estar editables.
* No se modifica sección de versión sellada.
* No se acepta `tenantId`.
* No se acepta `versionId` por PATCH genérico.

### Evento auditable

```text id="clhs42"
certifiedMinutesSection.updated
```

---

## 12.5. Reordenar secciones

### Endpoint

```http id="j6py8n"
POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/sections/reorder
```

### Permiso

```text id="r6tocw"
certifiedMinutesSections.reorder
```

### Request body

```json id="e5jdy2"
{
  "versionId": "version_uuid",
  "items": [
    {
      "sectionId": "section_uuid_1",
      "order": 1
    },
    {
      "sectionId": "section_uuid_2",
      "order": 2
    }
  ]
}
```

### Response 200

```json id="uwhwey"
{
  "data": {
    "certifiedMinutesId": "certified_minutes_uuid",
    "versionId": "version_uuid",
    "reorderedCount": 2
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Todas las secciones deben pertenecer al mismo tenant, acta y versión.
* No duplicar `order`.
* No reordenar versión sellada.

### Evento auditable

```text id="mumedi"
certifiedMinutesSection.reordered
```

---

## 12.6. Archivar sección

### Endpoint

```http id="phvnft"
POST /api/v1/tenant/certified-minutes-sections/{sectionId}/archive
```

### Permiso

```text id="wf1pt3"
certifiedMinutesSections.archive
```

### Request body

```json id="d3wask"
{
  "reason": "Sección reemplazada por nueva versión."
}
```

### Response 200

```json id="cab3kx"
{
  "data": {
    "id": "section_uuid",
    "archivedAt": "2026-08-15T18:25:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Evento auditable

```text id="s40dws"
certifiedMinutesSection.archived
```

---

# 13. Approvals

## 13.1. Listar aprobaciones

### Endpoint

```http id="qb2y7r"
GET /api/v1/tenant/certified-minutes/{certifiedMinutesId}/approvals
```

### Permiso

```text id="lvmf4h"
certifiedMinutesApprovals.read
```

### Query params

| Nombre           | Tipo   | Requerido |
| ---------------- | ------ | --------: |
| `versionId`      | UUID   |        No |
| `decision`       | string |        No |
| `approverUserId` | UUID   |        No |
| `page`           | number |        No |
| `pageSize`       | number |        No |

### Response 200

```json id="zzc8zh"
{
  "data": [
    {
      "id": "approval_uuid",
      "certifiedMinutesId": "certified_minutes_uuid",
      "versionId": "version_uuid",
      "approverUserId": "user_uuid",
      "approverRole": "boardMember",
      "decision": "approved",
      "comments": "Acta aprobada.",
      "decidedAt": "2026-08-15T19:00:00Z",
      "createdAt": "2026-08-15T19:00:00Z"
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

## 13.2. Crear aprobación o comentario

### Endpoint

```http id="x6fp21"
POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/approvals
```

### Permiso

```text id="dmik05"
certifiedMinutesApprovals.create
```

### Request body

```json id="byz5g1"
{
  "versionId": "version_uuid",
  "decision": "commented",
  "comments": "Revisar redacción del punto de resoluciones."
}
```

### Response 201

```json id="rrh0aw"
{
  "data": {
    "id": "approval_uuid",
    "certifiedMinutesId": "certified_minutes_uuid",
    "versionId": "version_uuid",
    "approverUserId": "user_uuid",
    "approverRole": "boardMember",
    "decision": "commented",
    "comments": "Revisar redacción del punto de resoluciones.",
    "decidedAt": "2026-08-15T18:45:00Z",
    "createdAt": "2026-08-15T18:45:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* `versionId` debe pertenecer al acta y tenant.
* `comments` obligatorio para `rejected` y `changesRequested`.
* Crear aprobación por este endpoint no necesariamente cambia estado; los endpoints `approve`, `reject`, `request-changes` sí cambian estado.
* La aprobación no es firma electrónica legal.

### Evento auditable

```text id="f6jj77"
certifiedMinutesApproval.created
```

---

## 13.3. Obtener aprobación

### Endpoint

```http id="arvwn8"
GET /api/v1/tenant/certified-minutes-approvals/{approvalId}
```

### Permiso

```text id="soryci"
certifiedMinutesApprovals.read
```

---

# 14. Attachments

## 14.1. Listar adjuntos

### Endpoint

```http id="hgirbr"
GET /api/v1/tenant/certified-minutes/{certifiedMinutesId}/attachments
```

### Permiso

```text id="ev7yfa"
certifiedMinutesAttachments.read
```

### Query params

| Nombre           | Tipo   | Requerido |
| ---------------- | ------ | --------: |
| `versionId`      | UUID   |        No |
| `attachmentType` | string |        No |
| `status`         | string |        No |
| `mimeType`       | string |        No |
| `page`           | number |        No |
| `pageSize`       | number |        No |

### Response 200

```json id="roztwb"
{
  "data": [
    {
      "id": "attachment_uuid",
      "certifiedMinutesId": "certified_minutes_uuid",
      "versionId": "version_uuid",
      "fileName": "hoja-asistencia.pdf",
      "fileType": "pdf",
      "mimeType": "application/pdf",
      "fileSize": 245760,
      "fileHashPrefix": "b7c8d9e0f1a2",
      "hashAlgorithm": "SHA-256",
      "attachmentType": "attendanceSheet",
      "status": "available",
      "uploadedAt": "2026-08-15T18:30:00Z",
      "archivedAt": null
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

* No devuelve `storageKey`.
* No devuelve URL firmada persistente.
* No devuelve contenido del archivo.

---

## 14.2. Subir adjunto

### Endpoint

```http id="kwbsff"
POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/attachments
```

### Permiso

```text id="dp95bd"
certifiedMinutesAttachments.create
```

### Content-Type

```text id="vmueuc"
multipart/form-data
```

### Campos multipart

| Campo            | Tipo   | Requerido |
| ---------------- | ------ | --------: |
| `file`           | binary |        Sí |
| `versionId`      | UUID   |        No |
| `attachmentType` | string |        Sí |
| `description`    | string |        No |

### Response 201

```json id="d2y5pk"
{
  "data": {
    "id": "attachment_uuid",
    "certifiedMinutesId": "certified_minutes_uuid",
    "versionId": "version_uuid",
    "fileName": "hoja-asistencia.pdf",
    "fileType": "pdf",
    "mimeType": "application/pdf",
    "fileSize": 245760,
    "fileHashPrefix": "b7c8d9e0f1a2",
    "hashAlgorithm": "SHA-256",
    "attachmentType": "attendanceSheet",
    "status": "available",
    "uploadedAt": "2026-08-15T18:30:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Tipos permitidos MVP

```text id="qqlb08"
application/pdf
image/png
image/jpeg
application/vnd.openxmlformats-officedocument.wordprocessingml.document
application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

### Reglas

* Archivo debe pertenecer al tenant activo.
* `fileName` sanitizado.
* `mimeType` permitido.
* `fileSize` dentro del máximo configurado.
* Se calcula `fileHash`.
* No se expone `storageKey`.
* No se publica automáticamente.
* Puede quedar `quarantined` si existe análisis antivirus futuro.

### Evento auditable

```text id="jzcg0w"
certifiedMinutesAttachment.uploaded
```

---

## 14.3. Obtener adjunto

### Endpoint

```http id="el2q5u"
GET /api/v1/tenant/certified-minutes-attachments/{attachmentId}
```

### Permiso

```text id="r0i7xf"
certifiedMinutesAttachments.read
```

---

## 14.4. Descargar adjunto

### Endpoint

```http id="m0zknw"
GET /api/v1/tenant/certified-minutes-attachments/{attachmentId}/download
```

### Permiso

```text id="a941v3"
certifiedMinutesAttachments.download
```

### Response 200

```text id="ph2umj"
binary stream
```

### Reglas

* Debe validar tenant.
* Debe validar permiso.
* Debe registrar acceso.
* No expone `storageKey`.
* No expone URL persistente.

### Eventos auditables

```text id="gt87tp"
certifiedMinutesAttachment.downloaded
certifiedMinutesAccess.downloaded
```

---

## 14.5. Archivar adjunto

### Endpoint

```http id="rkju9y"
POST /api/v1/tenant/certified-minutes-attachments/{attachmentId}/archive
```

### Permiso

```text id="gaj66p"
certifiedMinutesAttachments.archive
```

### Request body

```json id="xpxcfg"
{
  "reason": "Adjunto reemplazado por nueva versión."
}
```

### Response 200

```json id="h6v45p"
{
  "data": {
    "id": "attachment_uuid",
    "status": "archived",
    "archivedAt": "2026-08-16T12:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Evento auditable

```text id="v5mc4q"
certifiedMinutesAttachment.archived
```

---

# 15. Artifacts

## 15.1. Listar artefactos

### Endpoint

```http id="g662oq"
GET /api/v1/tenant/certified-minutes/{certifiedMinutesId}/artifacts
```

### Permiso

```text id="w1xs2w"
certifiedMinutesArtifacts.read
```

### Query params

| Nombre         | Tipo    | Requerido |
| -------------- | ------- | --------: |
| `versionId`    | UUID    |        No |
| `artifactType` | string  |        No |
| `status`       | string  |        No |
| `isOfficial`   | boolean |        No |
| `page`         | number  |        No |
| `pageSize`     | number  |        No |

### Response 200

```json id="lkagrp"
{
  "data": [
    {
      "id": "artifact_uuid",
      "certifiedMinutesId": "certified_minutes_uuid",
      "versionId": "version_uuid",
      "artifactType": "pdf",
      "status": "generated",
      "fileName": "ACTA-2026-0001.pdf",
      "mimeType": "application/pdf",
      "fileSize": 524288,
      "artifactHashPrefix": "c8d9e0f1a2b3",
      "hashAlgorithm": "SHA-256",
      "isOfficial": true,
      "generatedAt": "2026-08-15T19:20:00Z",
      "archivedAt": null
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

* No devuelve `storageKey`.
* No devuelve URL persistente.
* No genera PDF en cada consulta.

---

## 15.2. Generar PDF

### Endpoint

```http id="rnrkes"
POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/artifacts/generate-pdf
```

### Permiso

```text id="crb4i1"
certifiedMinutesArtifacts.generate
```

### Request body

```json id="k38tse"
{
  "versionId": "version_uuid",
  "official": true,
  "includeSealHashReference": true,
  "includeAttachmentsIndex": true,
  "watermark": null
}
```

### Response 201

```json id="ywrdns"
{
  "data": {
    "id": "artifact_uuid",
    "certifiedMinutesId": "certified_minutes_uuid",
    "versionId": "version_uuid",
    "artifactType": "pdf",
    "status": "generated",
    "fileName": "ACTA-2026-0001.pdf",
    "mimeType": "application/pdf",
    "fileSize": 524288,
    "artifactHashPrefix": "c8d9e0f1a2b3",
    "hashAlgorithm": "SHA-256",
    "isOfficial": true,
    "generatedAt": "2026-08-15T19:20:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* PDF oficial solo desde versión `approved` o `sealed`.
* PDF oficial recomendado desde versión `sealed`.
* PDF de `draft` solo si `official = false` y con marca de agua `BORRADOR`.
* Calcula `artifactHash`.
* Guarda en storage seguro.
* No expone `storageKey`.
* No publica automáticamente.
* Puede usar `Idempotency-Key`.

### Evento auditable

```text id="expud9"
certifiedMinutesArtifact.generated
```

---

## 15.3. Obtener artefacto

### Endpoint

```http id="j4kbe9"
GET /api/v1/tenant/certified-minutes-artifacts/{artifactId}
```

### Permiso

```text id="my47v6"
certifiedMinutesArtifacts.read
```

---

## 15.4. Descargar artefacto

### Endpoint

```http id="rhd6n0"
GET /api/v1/tenant/certified-minutes-artifacts/{artifactId}/download
```

### Permiso

```text id="p28q52"
certifiedMinutesArtifacts.download
```

### Response 200

```text id="rdka10"
binary stream
```

### Reglas

* Debe validar tenant.
* Debe validar permiso.
* Debe validar que artefacto esté `generated`.
* Debe registrar acceso.
* No expone `storageKey`.
* No expone URL persistente.

### Eventos auditables

```text id="kfzct3"
certifiedMinutesArtifact.downloaded
certifiedMinutesAccess.downloaded
```

---

## 15.5. Archivar artefacto

### Endpoint

```http id="x7e25x"
POST /api/v1/tenant/certified-minutes-artifacts/{artifactId}/archive
```

### Permiso

```text id="w7ffj1"
certifiedMinutesArtifacts.archive
```

### Request body

```json id="yp1blp"
{
  "reason": "Artefacto reemplazado por PDF corregido."
}
```

### Response 200

```json id="aq4ivc"
{
  "data": {
    "id": "artifact_uuid",
    "status": "archived",
    "archivedAt": "2026-08-16T12:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Evento auditable

```text id="yxd710"
certifiedMinutesArtifact.archived
```

---

# 16. Publications

## 16.1. Listar publicaciones

### Endpoint

```http id="pjq4yr"
GET /api/v1/tenant/certified-minutes/{certifiedMinutesId}/publications
```

### Permiso

```text id="m0v49r"
certifiedMinutesPublications.read
```

### Query params

| Nombre          | Tipo      | Requerido |
| --------------- | --------- | --------: |
| `status`        | string    |        No |
| `audienceType`  | string    |        No |
| `publishedFrom` | date-time |        No |
| `publishedTo`   | date-time |        No |
| `expiresFrom`   | date-time |        No |
| `expiresTo`     | date-time |        No |
| `page`          | number    |        No |
| `pageSize`      | number    |        No |

### Response 200

```json id="so8hli"
{
  "data": [
    {
      "id": "publication_uuid",
      "certifiedMinutesId": "certified_minutes_uuid",
      "versionId": "version_uuid",
      "artifactId": "artifact_uuid",
      "audienceType": "owners",
      "audienceRules": null,
      "status": "published",
      "notificationRequested": true,
      "publishedAt": "2026-08-15T19:30:00Z",
      "revokedAt": null,
      "revocationReason": null,
      "expiresAt": null,
      "createdAt": "2026-08-15T19:30:00Z",
      "archivedAt": null
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

## 16.2. Obtener publicación

### Endpoint

```http id="h6vax2"
GET /api/v1/tenant/certified-minutes-publications/{publicationId}
```

### Permiso

```text id="ravz5o"
certifiedMinutesPublications.read
```

---

## 16.3. Revocar publicación directa

### Endpoint

```http id="kyw041"
POST /api/v1/tenant/certified-minutes-publications/{publicationId}/revoke
```

### Permiso

```text id="wnvqyq"
certifiedMinutesPublications.revoke
```

### Request body

```json id="x2rw1s"
{
  "reason": "Revocación por audiencia incorrecta."
}
```

### Response 200

```json id="vw2dp7"
{
  "data": {
    "id": "publication_uuid",
    "status": "revoked",
    "revokedAt": "2026-08-15T20:00:00Z",
    "revocationReason": "Revocación por audiencia incorrecta."
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Evento auditable

```text id="rdq8n4"
certifiedMinutes.publicationRevoked
```

---

## 16.4. Archivar publicación

### Endpoint

```http id="rpa3m8"
POST /api/v1/tenant/certified-minutes-publications/{publicationId}/archive
```

### Permiso

```text id="h5l0m6"
certifiedMinutesPublications.archive
```

### Request body

```json id="rkeia0"
{
  "reason": "Publicación archivada por cierre administrativo."
}
```

### Response 200

```json id="ubyrab"
{
  "data": {
    "id": "publication_uuid",
    "status": "archived",
    "archivedAt": "2026-08-20T12:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 17. Endpoints `/me`

## 17.1. Listar mis actas certificadas publicadas

### Endpoint

```http id="n2zwsq"
GET /api/v1/me/certified-minutes
```

### Permiso

```text id="b9l9n9"
certifiedMinutes.read.own
```

### Query params

| Nombre          | Tipo      | Requerido |
| --------------- | --------- | --------: |
| `meetingId`     | UUID      |        No |
| `publishedFrom` | date-time |        No |
| `publishedTo`   | date-time |        No |
| `audienceType`  | string    |        No |
| `q`             | string    |        No |
| `page`          | number    |        No |
| `pageSize`      | number    |        No |
| `sortBy`        | string    |        No |
| `sortOrder`     | string    |        No |

### Response 200

```json id="yb7q6v"
{
  "data": [
    {
      "id": "certified_minutes_uuid",
      "meetingId": "meeting_uuid",
      "title": "Acta de Asamblea Ordinaria 2026",
      "code": "ACTA-2026-0001",
      "status": "published",
      "visibility": "owners",
      "publishedAt": "2026-08-15T19:30:00Z",
      "artifactAvailable": true
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

* Solo actas `published`.
* Solo publicaciones `published`.
* Solo si actor pertenece a audiencia.
* No devuelve actas no publicadas.
* No devuelve `audienceRules` completas si revelan terceros.
* No devuelve aprobaciones internas.
* No devuelve auditoría.
* No devuelve `storageKey`.

---

## 17.2. Obtener mi acta certificada publicada

### Endpoint

```http id="xukq23"
GET /api/v1/me/certified-minutes/{certifiedMinutesId}
```

### Permiso

```text id="niq8dc"
certifiedMinutes.read.own
```

### Response 200

```json id="m5a2kp"
{
  "data": {
    "id": "certified_minutes_uuid",
    "meetingId": "meeting_uuid",
    "title": "Acta de Asamblea Ordinaria 2026",
    "code": "ACTA-2026-0001",
    "status": "published",
    "visibility": "owners",
    "publishedAt": "2026-08-15T19:30:00Z",
    "sealAlgorithm": "SHA-256",
    "sealHashPrefix": "a1b2c3d4e5f6",
    "sections": [
      {
        "sectionType": "header",
        "order": 1,
        "title": "Encabezado",
        "body": "Contenido publicado autorizado."
      },
      {
        "sectionType": "resolutions",
        "order": 8,
        "title": "Resoluciones",
        "body": "Resoluciones publicadas autorizadas."
      }
    ],
    "artifactAvailable": true
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Solo versión publicada.
* Solo secciones publicadas y autorizadas.
* No devuelve contenido restringido no publicado.
* No devuelve auditoría.
* No devuelve aprobaciones internas.
* No devuelve `storageKey`.
* Registra acceso si la política lo exige.

### Evento auditable opcional

```text id="z3al2v"
certifiedMinutesAccess.viewed
```

---

## 17.3. Listar artefactos publicados propios

### Endpoint

```http id="v1s03w"
GET /api/v1/me/certified-minutes/{certifiedMinutesId}/artifacts
```

### Permiso

```text id="l05mt5"
certifiedMinutesArtifacts.download.own
```

### Response 200

```json id="tj82xp"
{
  "data": [
    {
      "id": "artifact_uuid",
      "certifiedMinutesId": "certified_minutes_uuid",
      "artifactType": "pdf",
      "fileName": "ACTA-2026-0001.pdf",
      "mimeType": "application/pdf",
      "fileSize": 524288,
      "artifactHashPrefix": "c8d9e0f1a2b3",
      "hashAlgorithm": "SHA-256",
      "isOfficial": true,
      "generatedAt": "2026-08-15T19:20:00Z",
      "downloadAvailable": true
    }
  ],
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Solo artefactos publicados o asociados a publicación autorizada.
* No devuelve `storageKey`.
* No devuelve URL persistente.

---

## 17.4. Descargar artefacto publicado propio

### Endpoint

```http id="oevc02"
GET /api/v1/me/certified-minutes-artifacts/{artifactId}/download
```

### Permiso

```text id="px332n"
certifiedMinutesArtifacts.download.own
```

### Response 200

```text id="yfni7s"
binary stream
```

### Reglas

* Usuario debe pertenecer a audiencia autorizada.
* Publicación debe estar `published`.
* Publicación no debe estar expirada.
* Publicación no debe estar revocada.
* Artefacto debe estar `generated`.
* No expone `storageKey`.
* No expone URL persistente.
* Registra descarga.

### Eventos auditables

```text id="r46htx"
certifiedMinutesArtifact.downloaded
certifiedMinutesAccess.downloaded
```

---

# 18. Matriz de endpoints

| Método | Ruta                                                                                | Scope  | Auth | Permiso                                  |
| ------ | ----------------------------------------------------------------------------------- | ------ | ---- | ---------------------------------------- |
| GET    | `/api/v1/tenant/certified-minutes`                                                  | tenant | Sí   | `certifiedMinutes.read`                  |
| POST   | `/api/v1/tenant/certified-minutes`                                                  | tenant | Sí   | `certifiedMinutes.create`                |
| GET    | `/api/v1/tenant/certified-minutes/{certifiedMinutesId}`                             | tenant | Sí   | `certifiedMinutes.read`                  |
| PATCH  | `/api/v1/tenant/certified-minutes/{certifiedMinutesId}`                             | tenant | Sí   | `certifiedMinutes.update`                |
| POST   | `/api/v1/tenant/certified-minutes/{certifiedMinutesId}/import-from-meeting-minutes` | tenant | Sí   | `certifiedMinutes.update`                |
| POST   | `/api/v1/tenant/certified-minutes/{certifiedMinutesId}/submit-review`               | tenant | Sí   | `certifiedMinutes.submitReview`          |
| POST   | `/api/v1/tenant/certified-minutes/{certifiedMinutesId}/approve`                     | tenant | Sí   | `certifiedMinutes.approve`               |
| POST   | `/api/v1/tenant/certified-minutes/{certifiedMinutesId}/reject`                      | tenant | Sí   | `certifiedMinutes.reject`                |
| POST   | `/api/v1/tenant/certified-minutes/{certifiedMinutesId}/request-changes`             | tenant | Sí   | `certifiedMinutes.requestChanges`        |
| POST   | `/api/v1/tenant/certified-minutes/{certifiedMinutesId}/seal`                        | tenant | Sí   | `certifiedMinutes.seal`                  |
| POST   | `/api/v1/tenant/certified-minutes/{certifiedMinutesId}/publish`                     | tenant | Sí   | `certifiedMinutes.publish`               |
| POST   | `/api/v1/tenant/certified-minutes/{certifiedMinutesId}/revoke-publication`          | tenant | Sí   | `certifiedMinutes.revokePublication`     |
| POST   | `/api/v1/tenant/certified-minutes/{certifiedMinutesId}/archive`                     | tenant | Sí   | `certifiedMinutes.archive`               |
| GET    | `/api/v1/tenant/certified-minutes/{certifiedMinutesId}/versions`                    | tenant | Sí   | `certifiedMinutesVersions.read`          |
| POST   | `/api/v1/tenant/certified-minutes/{certifiedMinutesId}/versions`                    | tenant | Sí   | `certifiedMinutesVersions.create`        |
| GET    | `/api/v1/tenant/certified-minutes-versions/{versionId}`                             | tenant | Sí   | `certifiedMinutesVersions.read`          |
| POST   | `/api/v1/tenant/certified-minutes-versions/{versionId}/archive`                     | tenant | Sí   | `certifiedMinutesVersions.archive`       |
| GET    | `/api/v1/tenant/certified-minutes/{certifiedMinutesId}/versions/compare`            | tenant | Sí   | `certifiedMinutesVersions.compare`       |
| GET    | `/api/v1/tenant/certified-minutes/{certifiedMinutesId}/sections`                    | tenant | Sí   | `certifiedMinutesSections.read`          |
| POST   | `/api/v1/tenant/certified-minutes/{certifiedMinutesId}/sections`                    | tenant | Sí   | `certifiedMinutesSections.create`        |
| GET    | `/api/v1/tenant/certified-minutes-sections/{sectionId}`                             | tenant | Sí   | `certifiedMinutesSections.read`          |
| PATCH  | `/api/v1/tenant/certified-minutes-sections/{sectionId}`                             | tenant | Sí   | `certifiedMinutesSections.update`        |
| POST   | `/api/v1/tenant/certified-minutes/{certifiedMinutesId}/sections/reorder`            | tenant | Sí   | `certifiedMinutesSections.reorder`       |
| POST   | `/api/v1/tenant/certified-minutes-sections/{sectionId}/archive`                     | tenant | Sí   | `certifiedMinutesSections.archive`       |
| GET    | `/api/v1/tenant/certified-minutes/{certifiedMinutesId}/approvals`                   | tenant | Sí   | `certifiedMinutesApprovals.read`         |
| POST   | `/api/v1/tenant/certified-minutes/{certifiedMinutesId}/approvals`                   | tenant | Sí   | `certifiedMinutesApprovals.create`       |
| GET    | `/api/v1/tenant/certified-minutes-approvals/{approvalId}`                           | tenant | Sí   | `certifiedMinutesApprovals.read`         |
| GET    | `/api/v1/tenant/certified-minutes/{certifiedMinutesId}/attachments`                 | tenant | Sí   | `certifiedMinutesAttachments.read`       |
| POST   | `/api/v1/tenant/certified-minutes/{certifiedMinutesId}/attachments`                 | tenant | Sí   | `certifiedMinutesAttachments.create`     |
| GET    | `/api/v1/tenant/certified-minutes-attachments/{attachmentId}`                       | tenant | Sí   | `certifiedMinutesAttachments.read`       |
| GET    | `/api/v1/tenant/certified-minutes-attachments/{attachmentId}/download`              | tenant | Sí   | `certifiedMinutesAttachments.download`   |
| POST   | `/api/v1/tenant/certified-minutes-attachments/{attachmentId}/archive`               | tenant | Sí   | `certifiedMinutesAttachments.archive`    |
| GET    | `/api/v1/tenant/certified-minutes/{certifiedMinutesId}/artifacts`                   | tenant | Sí   | `certifiedMinutesArtifacts.read`         |
| POST   | `/api/v1/tenant/certified-minutes/{certifiedMinutesId}/artifacts/generate-pdf`      | tenant | Sí   | `certifiedMinutesArtifacts.generate`     |
| GET    | `/api/v1/tenant/certified-minutes-artifacts/{artifactId}`                           | tenant | Sí   | `certifiedMinutesArtifacts.read`         |
| GET    | `/api/v1/tenant/certified-minutes-artifacts/{artifactId}/download`                  | tenant | Sí   | `certifiedMinutesArtifacts.download`     |
| POST   | `/api/v1/tenant/certified-minutes-artifacts/{artifactId}/archive`                   | tenant | Sí   | `certifiedMinutesArtifacts.archive`      |
| GET    | `/api/v1/tenant/certified-minutes/{certifiedMinutesId}/publications`                | tenant | Sí   | `certifiedMinutesPublications.read`      |
| GET    | `/api/v1/tenant/certified-minutes-publications/{publicationId}`                     | tenant | Sí   | `certifiedMinutesPublications.read`      |
| POST   | `/api/v1/tenant/certified-minutes-publications/{publicationId}/revoke`              | tenant | Sí   | `certifiedMinutesPublications.revoke`    |
| POST   | `/api/v1/tenant/certified-minutes-publications/{publicationId}/archive`             | tenant | Sí   | `certifiedMinutesPublications.archive`   |
| GET    | `/api/v1/me/certified-minutes`                                                      | own    | Sí   | `certifiedMinutes.read.own`              |
| GET    | `/api/v1/me/certified-minutes/{certifiedMinutesId}`                                 | own    | Sí   | `certifiedMinutes.read.own`              |
| GET    | `/api/v1/me/certified-minutes/{certifiedMinutesId}/artifacts`                       | own    | Sí   | `certifiedMinutesArtifacts.download.own` |
| GET    | `/api/v1/me/certified-minutes-artifacts/{artifactId}/download`                      | own    | Sí   | `certifiedMinutesArtifacts.download.own` |

---

# 19. Catálogo de errores

| Código                                          | HTTP | Descripción                           |
| ----------------------------------------------- | ---: | ------------------------------------- |
| `CERTIFIED_MINUTES_NOT_FOUND`                   |  404 | Acta no encontrada o no accesible     |
| `CERTIFIED_MINUTES_FORBIDDEN`                   |  403 | Usuario sin acceso al acta            |
| `CERTIFIED_MINUTES_INVALID_TRANSITION`          |  409 | Transición de estado inválida         |
| `CERTIFIED_MINUTES_NOT_EDITABLE`                |  409 | Acta no editable por estado           |
| `CERTIFIED_MINUTES_ALREADY_EXISTS_FOR_MEETING`  |  409 | Ya existe acta activa para la reunión |
| `CERTIFIED_MINUTES_CROSS_TENANT_REFERENCE`      |  403 | Referencia de otro tenant             |
| `CERTIFIED_MINUTES_MEETING_REQUIRED`            |  422 | Reunión requerida                     |
| `CERTIFIED_MINUTES_SOURCE_INVALID`              |  422 | Fuente preliminar inválida            |
| `CERTIFIED_MINUTES_CONTENT_INVALID`             |  422 | Contenido inválido                    |
| `CERTIFIED_MINUTES_VERSION_NOT_FOUND`           |  404 | Versión no encontrada                 |
| `CERTIFIED_MINUTES_VERSION_NOT_EDITABLE`        |  409 | Versión no editable                   |
| `CERTIFIED_MINUTES_VERSION_ALREADY_SEALED`      |  409 | Versión ya sellada                    |
| `CERTIFIED_MINUTES_SECTION_NOT_FOUND`           |  404 | Sección no encontrada                 |
| `CERTIFIED_MINUTES_SECTION_INVALID`             |  422 | Sección inválida                      |
| `CERTIFIED_MINUTES_SECTION_ORDER_DUPLICATE`     |  409 | Orden de sección duplicado            |
| `CERTIFIED_MINUTES_APPROVAL_NOT_FOUND`          |  404 | Aprobación no encontrada              |
| `CERTIFIED_MINUTES_APPROVAL_INVALID`            |  422 | Aprobación inválida                   |
| `CERTIFIED_MINUTES_APPROVAL_REQUIRED`           |  409 | Aprobación requerida                  |
| `CERTIFIED_MINUTES_SEAL_REQUIRED`               |  409 | Sellado requerido                     |
| `CERTIFIED_MINUTES_SEAL_INVALID`                |  422 | Hash o sellado inválido               |
| `CERTIFIED_MINUTES_PUBLISH_AUDIENCE_REQUIRED`   |  422 | Audiencia requerida                   |
| `CERTIFIED_MINUTES_PUBLICATION_NOT_FOUND`       |  404 | Publicación no encontrada             |
| `CERTIFIED_MINUTES_PUBLICATION_REVOKED`         |  409 | Publicación revocada                  |
| `CERTIFIED_MINUTES_PUBLICATION_EXPIRED`         |  409 | Publicación expirada                  |
| `CERTIFIED_MINUTES_ARTIFACT_NOT_FOUND`          |  404 | Artefacto no encontrado               |
| `CERTIFIED_MINUTES_ARTIFACT_NOT_READY`          |  409 | Artefacto no generado                 |
| `CERTIFIED_MINUTES_ARTIFACT_DOWNLOAD_FORBIDDEN` |  403 | Descarga no autorizada                |
| `CERTIFIED_MINUTES_ATTACHMENT_NOT_FOUND`        |  404 | Adjunto no encontrado                 |
| `CERTIFIED_MINUTES_ATTACHMENT_INVALID_TYPE`     |  415 | Tipo de adjunto no permitido          |
| `CERTIFIED_MINUTES_ATTACHMENT_TOO_LARGE`        |  413 | Adjunto excede tamaño permitido       |
| `CERTIFIED_MINUTES_STORAGE_ERROR`               |  500 | Error controlado de storage           |
| `CERTIFIED_MINUTES_PDF_GENERATION_FAILED`       |  500 | Error controlado generando PDF        |
| `CERTIFIED_MINUTES_PUBLIC_ENDPOINT_FORBIDDEN`   |  404 | Endpoint público no existe            |
| `VALIDATION_ERROR`                              |  422 | Error de validación                   |
| `UNAUTHORIZED`                                  |  401 | No autenticado                        |
| `FORBIDDEN`                                     |  403 | Sin permiso                           |
| `RATE_LIMITED`                                  |  429 | Rate limit                            |
| `INTERNAL_ERROR`                                |  500 | Error interno                         |

---

# 20. Ejemplos de errores

## 20.1. Acta no encontrada

```json id="bqwxi8"
{
  "error": {
    "code": "CERTIFIED_MINUTES_NOT_FOUND",
    "message": "Certified minutes not found.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

## 20.2. Acta no editable

```json id="ha23ja"
{
  "error": {
    "code": "CERTIFIED_MINUTES_NOT_EDITABLE",
    "message": "Certified minutes cannot be edited in the current status.",
    "details": {
      "status": "sealed"
    },
    "traceId": "req_123456"
  }
}
```

---

## 20.3. Publicación sin sellado

```json id="rrspnt"
{
  "error": {
    "code": "CERTIFIED_MINUTES_SEAL_REQUIRED",
    "message": "Certified minutes must be sealed before publication.",
    "details": {
      "status": "approved"
    },
    "traceId": "req_123456"
  }
}
```

---

## 20.4. Descarga no autorizada

```json id="lmoiz0"
{
  "error": {
    "code": "CERTIFIED_MINUTES_ARTIFACT_DOWNLOAD_FORBIDDEN",
    "message": "You are not authorized to download this artifact.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

## 20.5. Referencia cross-tenant

```json id="d2r34d"
{
  "error": {
    "code": "CERTIFIED_MINUTES_CROSS_TENANT_REFERENCE",
    "message": "The referenced resource does not belong to the current tenant.",
    "details": {
      "resourceType": "meeting"
    },
    "traceId": "req_123456"
  }
}
```

---

## 20.6. Storage key no expuesto

Este error no debe incluir `storageKey`:

```json id="tnbulh"
{
  "error": {
    "code": "CERTIFIED_MINUTES_STORAGE_ERROR",
    "message": "The file could not be retrieved.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

# 21. Reglas de seguridad del contrato

## 21.1. Endpoints administrativos

Deben aplicar:

```text id="sst0rj"
AuthGuard
TenantGuard
TenantPermissionGuard
CertifiedMinutesPermissionGuard
CertifiedMinutesTenantGuard
CertifiedMinutesStateGuard
tenant_id filter
state validation
version validation
meeting validation
source validation
content sanitization
audit events
safe errors
Cache-Control: no-store
```

---

## 21.2. Endpoints `/me`

Deben aplicar:

```text id="lvffbg"
AuthGuard
TenantGuard
TenantPermissionGuard
OwnCertifiedMinutesGuard
CertifiedMinutesAudienceGuard
CertifiedMinutesPublicationGuard
CertifiedMinutesArtifactGuard
own-resource validation
person/propertyUnit/role resolution
publication audience validation
safe DTO minimization
no internal metadata
no audit exposure
Cache-Control: no-store
```

---

## 21.3. Endpoints de descarga

Deben aplicar:

```text id="zguwrn"
AuthGuard
TenantGuard
PermissionGuard
AudienceGuard
ArtifactGuard
AttachmentGuard
StorageAccessPolicy
AccessLog
AuditEvent
no storageKey exposure
no persistent signed URL
safe filename
Cache-Control: no-store
```

---

## 21.4. No endpoints públicos

Deben existir pruebas negativas para rutas públicas de actas.

---

## 21.5. Content sanitization

Deben sanitizarse:

```text id="owuo3b"
title
summary
section.title
section.body
comments
changeReason
publication notes
attachment metadata
cancellationReason
revocationReason
metadata
```

Bloquear:

```text id="ih5sum"
<script>
<iframe>
<object>
<embed>
event handlers inline
javascript:
data URLs peligrosas
HTML no sanitizado
CSS peligroso
payloads arbitrarios no validados
```

---

# 22. Auditoría

## 22.1. Eventos obligatorios

```text id="hacbfd"
certifiedMinutes.created
certifiedMinutes.updated
certifiedMinutes.importedFromMeetingMinutes
certifiedMinutes.submittedForReview
certifiedMinutes.approved
certifiedMinutes.rejected
certifiedMinutes.changesRequested
certifiedMinutes.sealed
certifiedMinutes.published
certifiedMinutes.publicationRevoked
certifiedMinutes.archived
certifiedMinutesVersion.created
certifiedMinutesVersion.archived
certifiedMinutesSection.created
certifiedMinutesSection.updated
certifiedMinutesSection.reordered
certifiedMinutesSection.archived
certifiedMinutesApproval.created
certifiedMinutesAttachment.uploaded
certifiedMinutesAttachment.downloaded
certifiedMinutesAttachment.archived
certifiedMinutesArtifact.generated
certifiedMinutesArtifact.downloaded
certifiedMinutesArtifact.archived
certifiedMinutesAccess.viewed
certifiedMinutesAccess.downloaded
```

---

## 22.2. Metadata permitida

```json id="vmutov"
{
  "certifiedMinutesId": "certified_minutes_uuid",
  "meetingId": "meeting_uuid",
  "sourceMeetingMinutesId": "meeting_minutes_uuid",
  "versionId": "version_uuid",
  "sectionId": "section_uuid",
  "approvalId": "approval_uuid",
  "attachmentId": "attachment_uuid",
  "artifactId": "artifact_uuid",
  "publicationId": "publication_uuid",
  "status": "sealed",
  "versionNumber": 1,
  "visibility": "owners",
  "certificationMode": "internalHash",
  "sealAlgorithm": "SHA-256",
  "sealHashPrefix": "a1b2c3d4e5f6",
  "artifactHashPrefix": "c8d9e0f1a2b3",
  "audienceType": "owners",
  "accessType": "download",
  "outcome": "allowed",
  "traceId": "req_123456"
}
```

---

## 22.3. Metadata prohibida

```text id="oyskam"
contenido completo del acta
contenido completo de secciones
contenido completo de adjuntos
storageKey completo
URLs firmadas
tokens
cookies
Authorization header
emails completos
teléfonos completos
cédulas
firmas
documentos completos
stack trace
SQL raw
payload completo
```

---

# 23. Observabilidad

## 23.1. Logs sugeridos

```text id="u3ygob"
certifiedMinutes.created
certifiedMinutes.submittedForReview
certifiedMinutes.approved
certifiedMinutes.sealed
certifiedMinutes.published
certifiedMinutes.publicationRevoked
certifiedMinutes.archived
certifiedMinutesArtifact.generated
certifiedMinutesArtifact.downloaded
certifiedMinutesAttachment.uploaded
certifiedMinutesAttachment.downloaded
```

---

## 23.2. Métricas sugeridas

```text id="i7wkd7"
certified_minutes_created_total
certified_minutes_submitted_total
certified_minutes_approved_total
certified_minutes_sealed_total
certified_minutes_published_total
certified_minutes_publication_revoked_total
certified_minutes_pdf_generated_total
certified_minutes_downloaded_total
certified_minutes_attachment_uploaded_total
```

---

## 23.3. Labels permitidos

```text id="q6di3n"
status
visibility
certificationMode
artifactType
publicationStatus
accessType
outcome
```

---

## 23.4. Labels prohibidos

```text id="m0ngcn"
tenantId
certifiedMinutesId
meetingId
versionId
userId
personId
propertyUnitId
email
phone
ipAddress
storageKey
sealHash
artifactHash
traceId
```

---

# 24. OpenAPI

## 24.1. Tags sugeridos

```text id="j3hgg3"
Certified Minutes
Certified Minutes Versions
Certified Minutes Sections
Certified Minutes Approvals
Certified Minutes Attachments
Certified Minutes Artifacts
Certified Minutes Publications
My Certified Minutes
```

---

## 24.2. Extensiones OpenAPI sugeridas

### Endpoint tenant

```yaml id="yjsfuf"
x-tenant-scope: true
x-auth-required: true
x-required-permission: certifiedMinutes.create
x-audit-event: certifiedMinutes.created
```

---

### Endpoint `/me`

```yaml id="b9jx5a"
x-tenant-scope: true
x-auth-required: true
x-own-resource: true
x-required-permission: certifiedMinutes.read.own
```

---

### Endpoint de descarga

```yaml id="fa3gc7"
x-secure-download: true
x-storage-key-exposed: false
x-auth-required: true
x-audit-event: certifiedMinutesArtifact.downloaded
```

---

### Endpoint de sellado

```yaml id="gs1vzg"
x-integrity-seal: true
x-hash-algorithm: SHA-256
x-legal-signature: false
x-audit-event: certifiedMinutes.sealed
```

---

### Endpoint de publicación

```yaml id="eimfgc"
x-publication-controlled: true
x-public-exposure: false
x-audience-required: true
x-audit-event: certifiedMinutes.published
```

---

### Endpoint de generación PDF

```yaml id="h49hgi"
x-artifact-generation: true
x-storage-backed: true
x-storage-key-exposed: false
x-official-pdf-from-draft: false
```

---

## 24.3. OpenAPI no debe documentar

```text id="palemp"
GET /api/v1/public/tenants/{slug}/certified-minutes
GET /api/v1/public/tenants/{slug}/certified-minutes/{certifiedMinutesId}
GET /api/v1/public/tenants/{slug}/certified-minutes/{certifiedMinutesId}/download
GET /api/v1/public/tenants/{slug}/certified-minutes-artifacts/{artifactId}/download
```

---

# 25. Casos borde del contrato

| Caso                                          | Resultado esperado |
| --------------------------------------------- | ------------------ |
| Crear acta sin `meetingId`                    | 422                |
| Crear acta con `tenantId` en body             | 422                |
| Usar `meetingId` de otro tenant               | 403/404            |
| Usar `sourceMeetingMinutesId` de otro tenant  | 403/404            |
| Crear segunda acta activa para misma reunión  | 409                |
| Editar acta `sealed`                          | 409                |
| Editar versión `sealed`                       | 409                |
| Crear sección en versión `sealed`             | 409                |
| Reordenar secciones en versión `sealed`       | 409                |
| Aprobar acta en `draft` sin revisión          | 409                |
| Rechazar sin comentarios                      | 422                |
| Solicitar cambios sin comentarios             | 422                |
| Sellar acta no aprobada                       | 409                |
| Publicar acta no sellada                      | 409                |
| Publicar sin audiencia                        | 422                |
| Publicar con `artifactId` de otro tenant      | 403/404            |
| Revocar publicación sin razón                 | 422                |
| Descargar PDF no generado                     | 404/409            |
| Descargar PDF sin autorización                | 403/404            |
| Descargar publicación revocada                | 409/404            |
| Descargar publicación expirada                | 409/404            |
| Subir adjunto no permitido                    | 415                |
| Subir adjunto excede tamaño                   | 413                |
| Response contiene `storageKey`                | falla              |
| Log contiene contenido completo               | falla              |
| Auditoría contiene contenido completo         | falla              |
| Endpoint público de actas                     | no existe          |
| OpenAPI documenta endpoint público            | falla              |
| Acta ejecuta cargo                            | falla              |
| Acta ejecuta multa                            | falla              |
| Acta aprueba resolución automáticamente       | falla              |
| Hash se presenta como firma electrónica legal | falla              |

---

# 26. Pruebas de contrato requeridas

## 26.1. Certified Minutes

Debe probar:

```text id="zlg0sd"
GET /api/v1/tenant/certified-minutes
POST /api/v1/tenant/certified-minutes
GET /api/v1/tenant/certified-minutes/{certifiedMinutesId}
PATCH /api/v1/tenant/certified-minutes/{certifiedMinutesId}
POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/import-from-meeting-minutes
POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/submit-review
POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/approve
POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/reject
POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/request-changes
POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/seal
POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/publish
POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/revoke-publication
POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/archive
```

Casos mínimos:

```text id="ongiqy"
401 sin token
403 sin permiso
201 crear válida
422 sin meetingId
422 tenantId en body
403/404 meetingId tenant B
409 segunda acta activa por reunión
409 editar sealed
409 publicar sin sellado
auditoría
```

---

## 26.2. Versions

Debe probar:

```text id="m0n2uq"
listar versiones
crear versión
obtener versión
archivar versión
comparar versiones
rechazar versión tenant B
rechazar edición de versión sellada
rechazar duplicate versionNumber
```

---

## 26.3. Sections

Debe probar:

```text id="a6g2h0"
crear sección
listar secciones
obtener sección
editar sección
reordenar secciones
archivar sección
rechazar order duplicado
rechazar sección tenant B
rechazar editar sección de versión sellada
sanitización de body
```

---

## 26.4. Approvals

Debe probar:

```text id="vgqh7k"
crear comentario
crear aprobación
rechazar sin comments si decision=rejected
rechazar sin comments si decision=changesRequested
listar aprobaciones
obtener aprobación
rechazar approval tenant B
```

---

## 26.5. Attachments

Debe probar:

```text id="ahehv9"
subir adjunto válido
rechazar mimeType no permitido
rechazar archivo demasiado grande
listar adjuntos
obtener adjunto
descargar adjunto
archivar adjunto
no exponer storageKey
auditar descarga
rechazar attachment tenant B
```

---

## 26.6. Artifacts

Debe probar:

```text id="k7kchc"
generar PDF oficial desde versión sellada
rechazar PDF oficial desde draft
permitir draftPdf con watermark si política lo permite
listar artefactos
obtener artefacto
descargar artefacto
archivar artefacto
no exponer storageKey
calcular artifactHash
auditar descarga
rechazar artifact tenant B
```

---

## 26.7. Publications

Debe probar:

```text id="z6bdh9"
publicar acta sellada
rechazar publicar sin sellado
rechazar publicar sin audiencia
listar publicaciones
obtener publicación
revocar publicación con razón
rechazar revocar sin razón
archivar publicación
rechazar publication tenant B
```

---

## 26.8. `/me`

Debe probar:

```text id="iqrkes"
listar actas propias publicadas
obtener acta propia publicada
listar artefactos propios publicados
descargar PDF propio autorizado
no ver actas no publicadas
no ver actas de audiencia ajena
no descargar publicación revocada
no descargar publicación expirada
no ver storageKey
no ver auditoría
no ver aprobaciones internas
```

---

# 27. Decisión final del contrato API

El módulo `015-certified-minutes` expondrá endpoints REST para:

```text id="fbykal"
1. Gestión administrativa de actas certificadas.
2. Importación desde actas preliminares.
3. Flujo de revisión, aprobación, rechazo y cambios solicitados.
4. Sellado interno mediante hash.
5. Gestión de versiones.
6. Gestión de secciones.
7. Gestión de aprobaciones.
8. Gestión de adjuntos.
9. Generación y descarga de artefactos PDF.
10. Publicación controlada.
11. Revocación de publicaciones.
12. Consulta propia de actas publicadas.
13. Descarga propia autorizada.
14. Auditoría de operaciones críticas.
15. Integración con notificaciones.
```

El contrato garantiza:

```text id="w8jlce"
tenant isolation
permissioned access
meeting-bound validation
version control
sealed version immutability
internal hash integrity
storage key protection
secure downloads
publication audience control
own-resource authorization
no public exposure
no automatic execution
safe DTOs
safe errors
safe logs
safe metrics
audit trail
OpenAPI consistency
CI validation
```

La implementación no debe aceptarse si permite actas cross-tenant, versiones cross-tenant, secciones cross-tenant, adjuntos cross-tenant, artefactos cross-tenant, publicaciones cross-tenant, uso de reuniones de otro tenant, edición de versiones selladas, publicación sin sellado, descarga no autorizada, exposición de `storageKey`, exposición de URLs firmadas persistentes, generación de PDF oficial desde borrador sin marca de agua, logs con contenido completo, auditoría con contenido completo, endpoints públicos, documentación OpenAPI de endpoints públicos, presentación del hash como firma electrónica legal, ejecución automática de resoluciones, generación automática de cargos, generación automática de multas, uso de IA externa con actas reales u omisión de auditoría crítica.
