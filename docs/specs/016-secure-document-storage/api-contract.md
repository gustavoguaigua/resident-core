# API Contract — Spec 016 Secure Document Storage

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                                 |
| Spec ID         | 016                                                                                                                                                                           |
| Módulo          | Secure Document Storage                                                                                                                                                       |
| Documento       | API Contract                                                                                                                                                                  |
| Ruta            | `docs/specs/016-secure-document-storage/api-contract.md`                                                                                                                      |
| Versión         | 0.1                                                                                                                                                                           |
| Estado          | Borrador inicial                                                                                                                                                              |
| Fecha           | 2026-07-21                                                                                                                                                                    |
| Documento base  | `docs/specs/016-secure-document-storage/spec.md`                                                                                                                              |
| Plan técnico    | `docs/specs/016-secure-document-storage/plan.md`                                                                                                                              |
| Modelo de datos | `docs/specs/016-secure-document-storage/data-model.md`                                                                                                                        |
| API Style       | REST                                                                                                                                                                          |
| API Version     | `/api/v1`                                                                                                                                                                     |
| Naturaleza      | Tenant-scoped / Storage-backed / Metadata-driven / Hash-aware / Access-controlled / Source-module-aware / Own-resource-aware / Audit-heavy / Non-public by default            |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `005-payments`, `007-audit`, `011-fines-sanctions`, `012-communications-notifications`, `015-certified-minutes` |

---

## 2. Propósito

Este documento define el contrato API REST para el módulo `016-secure-document-storage`.

El módulo provee una capa transversal segura para registrar documentos, crear versiones, subir archivos, registrar archivos generados por sistema, validar metadata, calcular hash, descargar archivos bajo autorización, archivar, restaurar, registrar access logs y auditar operaciones críticas.

Regla central:

```text id="vzzquw"
Toda operación documental debe estar autenticada, autorizada, tenant-scoped, source-resource-aware, storage-backed, hash-aware, metadata-safe, auditada y sin exposición pública por defecto.
```

---

## 3. Principios del contrato API

### 3.1. Tenant scope obligatorio

Todos los endpoints administrativos y `/me` operan dentro del tenant activo del usuario autenticado.

Regla:

```text id="dkc5tc"
currentTenant.id debe ser el tenant_id efectivo en toda consulta, carga, descarga, versionado, archivo, restauración, access log y auditoría.
```

El cliente nunca debe enviar `tenantId` en el body.

---

### 3.2. Autenticación

Todos los endpoints del módulo requieren:

```text id="knpijq"
Authorization: Bearer <access_token>
```

No existen endpoints anónimos en MVP.

---

### 3.3. Autorización

La autorización se resuelve dentro de RESIDENT Core.

Regla:

```text id="g32uxi"
Keycloak autentica; RESIDENT Core autoriza por tenant, membership, permiso, módulo origen, recurso origen, owner lógico, visibilidad, sensibilidad, audiencia, estado y regla de negocio.
```

---

### 3.4. Storage key protegido

`storageKey` es interno y nunca debe aparecer en:

```text id="i3brkg"
API responses
API errors
audit metadata
logs
notification payloads
OpenAPI examples
```

---

### 3.5. No endpoints públicos

MVP no expone documentos en `/api/v1/public`.

Prohibido:

```text id="lq59vc"
GET /api/v1/public/documents/{documentId}
GET /api/v1/public/document-files/{fileId}/download
GET /api/v1/public/tenants/{slug}/documents
GET /api/v1/public/tenants/{slug}/documents/{documentId}
GET /api/v1/public/tenants/{slug}/document-files/{fileId}/download
```

---

### 3.6. No binarios en JSON

Los binarios deben viajar solo por:

```text id="cfplkk"
multipart/form-data
binary stream
URL temporal corta si la política lo permite
```

Prohibido:

```text id="eoxixs"
base64 de archivo en JSON
contenido binario en metadata
contenido binario en auditoría
contenido binario en logs
```

---

### 3.7. Descargas seguras

Toda descarga debe validar:

```text id="tvabzn"
tenant
usuario
membership
permiso
estado del documento
estado del archivo
visibilidad
sensibilidad
owner lógico
audiencia
source module policy
source resource policy
```

Toda descarga debe registrar access log y auditoría.

---

### 3.8. Cache

Todos los endpoints privados deben responder:

```text id="i6bt7s"
Cache-Control: no-store
```

---

## 4. Rutas base

### 4.1. Documentos administrativos

```text id="gs7ov8"
/api/v1/tenant/documents
```

---

### 4.2. Archivos

```text id="ykjx8r"
/api/v1/tenant/document-files
```

---

### 4.3. Versiones

```text id="nxdz36"
/api/v1/tenant/document-versions
```

---

### 4.4. Documentos propios

```text id="mad03z"
/api/v1/me/documents
/api/v1/me/document-files
```

---

### 4.5. Configuración platform

```text id="uz9uzp"
/api/v1/platform/document-storage
```

---

## 5. Headers

### 5.1. Request headers

| Header             |                                                                           Requerido | Descripción                                     |
| ------------------ | ----------------------------------------------------------------------------------: | ----------------------------------------------- |
| `Authorization`    |                                                                                  Sí | Bearer token                                    |
| `Content-Type`     |                                                           Sí para POST/PATCH/upload | `application/json` o `multipart/form-data`      |
| `Accept`           |                                                                         Recomendado | `application/json`                              |
| `X-Request-Id`     |                                                                            Opcional | ID de request                                   |
| `X-Correlation-Id` |                                                                            Opcional | ID de correlación                               |
| `Idempotency-Key`  | Recomendado en upload, registro generado por sistema, restore y descargas sensibles | Prevención adicional de duplicados accidentales |

---

### 5.2. Response headers JSON

```text id="acyk90"
Content-Type: application/json
Cache-Control: no-store
X-Request-Id: <request-id>
X-Correlation-Id: <correlation-id>
```

---

### 5.3. Response headers descarga

```text id="s3qqg8"
Content-Type: <file-mime-type>
Content-Disposition: attachment; filename="<safe-file-name>"
Cache-Control: no-store
X-Request-Id: <request-id>
X-Correlation-Id: <correlation-id>
```

---

## 6. Formato estándar de respuesta

### 6.1. Respuesta individual

```json id="uxeoju"
{
  "data": {},
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

### 6.2. Respuesta paginada

```json id="pvfb4o"
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

```json id="f8cgia"
{
  "error": {
    "code": "DOCUMENT_NOT_FOUND",
    "message": "Document not found.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

## 7. Estados HTTP

| Código | Uso                                                             |
| -----: | --------------------------------------------------------------- |
|    200 | Consulta, actualización o descarga exitosa                      |
|    201 | Recurso creado                                                  |
|    202 | Operación aceptada si storage/procesamiento se vuelve asíncrono |
|    204 | Acción exitosa sin cuerpo, si se adopta                         |
|    400 | Request mal formado                                             |
|    401 | No autenticado                                                  |
|    403 | Sin permiso o sin acceso por política                           |
|    404 | Recurso no encontrado o no accesible                            |
|    409 | Conflicto de estado                                             |
|    413 | Archivo demasiado grande                                        |
|    415 | MIME type no permitido                                          |
|    422 | Validación semántica fallida                                    |
|    429 | Rate limit                                                      |
|    500 | Error interno controlado                                        |

---

## 8. Permisos

### 8.1. Documentos administrativos

```text id="q97y3c"
documents.create
documents.read
documents.updateMetadata
documents.archive
documents.restore
documents.download
documents.managePolicies
```

---

### 8.2. Documentos propios

```text id="z968oe"
documents.read.own
documents.download.own
documents.upload.own
```

---

### 8.3. Operaciones de sistema

```text id="q01f9x"
documents.registerSystemGenerated
documents.readSystemMetadata
```

---

### 8.4. Auditoría

```text id="vghu4k"
documents.audit.read
```

---

### 8.5. Configuración de storage

```text id="aud9cf"
documents.storage.configure
documents.storage.readConfig
documents.storage.testConnection
```

---

## 9. Enums API

### 9.1. DocumentStatus

```text id="wzkolz"
draft
uploaded
available
quarantined
rejected
archived
deletedPending
restored
```

---

### 9.2. DocumentVersionStatus

```text id="ojyc0e"
draft
active
superseded
archived
```

---

### 9.3. DocumentFileStatus

```text id="rabdye"
pending
stored
available
quarantined
rejected
archived
missing
failed
```

---

### 9.4. DocumentVisibility

```text id="zpobgh"
private
administrative
tenant
owners
residents
board
meetingParticipants
sourceResourceAudience
specificUsers
propertyUnits
roles
mixed
publicEligible
```

Nota:

```text id="p72ndw"
publicEligible no significa público. Solo indica elegibilidad futura bajo una spec explícita de publicación pública.
```

---

### 9.5. DocumentSensitivity

```text id="fh77ny"
low
internal
confidential
restricted
highlyRestricted
```

---

### 9.6. DocumentCategory

```text id="m47na5"
paymentReceipt
fineEvidence
certifiedMinutesPdf
certifiedMinutesAttachment
communicationAttachment
communicationImage
reportExport
administrativeDocument
propertyDocument
residentDocument
meetingDocument
systemGenerated
other
```

---

### 9.7. SourceModule

```text id="czje5m"
payments
fines
communications
meetings
certifiedMinutes
reports
residentsProperties
tenants
system
other
```

---

### 9.8. StorageProvider

```text id="fdfxee"
local
s3
s3Compatible
minio
other
```

---

### 9.9. FileScanStatus

```text id="lsqp1n"
notRequired
pending
clean
suspicious
infected
failed
```

---

### 9.10. DocumentAccessType

```text id="h74719"
viewMetadata
download
preview
export
archive
restore
```

---

### 9.11. DocumentAccessOutcome

```text id="lac9qg"
allowed
denied
notFound
expired
revoked
quarantined
rejected
archived
error
```

---

### 9.12. DocumentPolicyType

```text id="szyhir"
default
owner
audience
sourceDelegated
administrative
restricted
temporary
```

---

### 9.13. DocumentOwnerType

```text id="f5opdo"
user
person
propertyUnit
tenant
system
none
```

---

### 9.14. DocumentLinkType

```text id="yqkvwr"
source
supporting
generatedFrom
attachmentOf
evidenceOf
receiptOf
exportOf
relatedTo
```

---

### 9.15. MimeGroup

```text id="v5ic1t"
pdf
image
document
spreadsheet
csv
json
text
other
```

---

### 9.16. HashAlgorithm

```text id="eiccut"
SHA-256
```

---

# 10. Documentos administrativos

## 10.1. Listar documentos

### Endpoint

```http id="lkkq9p"
GET /api/v1/tenant/documents
```

### Permiso

```text id="j00fhn"
documents.read
```

### Query params

| Nombre                | Tipo        | Requerido | Descripción                                                                                          |
| --------------------- | ----------- | --------: | ---------------------------------------------------------------------------------------------------- |
| `status`              | string      |        No | Estado del documento                                                                                 |
| `visibility`          | string      |        No | Visibilidad                                                                                          |
| `sensitivity`         | string      |        No | Sensibilidad                                                                                         |
| `category`            | string      |        No | Categoría                                                                                            |
| `sourceModule`        | string      |        No | Módulo origen                                                                                        |
| `sourceResourceType`  | string      |        No | Tipo de recurso origen                                                                               |
| `sourceResourceId`    | UUID/string |        No | ID de recurso origen                                                                                 |
| `ownerType`           | string      |        No | Tipo de dueño lógico                                                                                 |
| `ownerUserId`         | UUID        |        No | Dueño usuario                                                                                        |
| `ownerPersonId`       | UUID        |        No | Dueño persona                                                                                        |
| `ownerPropertyUnitId` | UUID        |        No | Dueño unidad                                                                                         |
| `mimeType`            | string      |        No | MIME del archivo activo                                                                              |
| `mimeGroup`           | string      |        No | Grupo MIME                                                                                           |
| `createdFrom`         | date-time   |        No | Creado desde                                                                                         |
| `createdTo`           | date-time   |        No | Creado hasta                                                                                         |
| `uploadedFrom`        | date-time   |        No | Subido desde                                                                                         |
| `uploadedTo`          | date-time   |        No | Subido hasta                                                                                         |
| `archived`            | boolean     |        No | Incluir archivados                                                                                   |
| `q`                   | string      |        No | Búsqueda por título o descripción                                                                    |
| `page`                | number      |        No | Default 1                                                                                            |
| `pageSize`            | number      |        No | Default 20, máximo 100                                                                               |
| `sortBy`              | string      |        No | `createdAt`, `updatedAt`, `title`, `status`, `category`, `sensitivity`, `sourceModule`, `archivedAt` |
| `sortOrder`           | string      |        No | `asc`, `desc`                                                                                        |

### Response 200

```json id="ckdm8q"
{
  "data": [
    {
      "id": "document_uuid",
      "title": "Comprobante de pago julio 2026",
      "status": "available",
      "visibility": "private",
      "sensitivity": "confidential",
      "category": "paymentReceipt",
      "sourceModule": "payments",
      "sourceResourceType": "paymentReceipt",
      "sourceResourceId": "payment_receipt_uuid",
      "ownerType": "propertyUnit",
      "currentVersionId": "version_uuid",
      "activeFileId": "file_uuid",
      "createdAt": "2026-07-21T10:00:00Z",
      "updatedAt": "2026-07-21T10:01:00Z",
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

* Filtra siempre por `tenantId`.
* No devuelve binarios.
* No devuelve `storageKey`.
* No devuelve URL firmada.
* No incluye archivados salvo `archived=true`.
* Los filtros nunca deben permitir saltarse permisos.

---

## 10.2. Crear documento lógico

### Endpoint

```http id="h9ikjg"
POST /api/v1/tenant/documents
```

### Permiso

```text id="dn3z67"
documents.create
```

### Request body

```json id="g6k6zi"
{
  "title": "Comprobante de pago julio 2026",
  "description": "Comprobante reportado por residente.",
  "visibility": "private",
  "sensitivity": "confidential",
  "category": "paymentReceipt",
  "sourceModule": "payments",
  "sourceResourceType": "paymentReceipt",
  "sourceResourceId": "payment_receipt_uuid",
  "ownerType": "propertyUnit",
  "ownerPropertyUnitId": "property_unit_uuid",
  "metadata": {
    "period": "2026-07"
  }
}
```

### Response 201

```json id="z9mklp"
{
  "data": {
    "id": "document_uuid",
    "title": "Comprobante de pago julio 2026",
    "description": "Comprobante reportado por residente.",
    "status": "draft",
    "visibility": "private",
    "sensitivity": "confidential",
    "category": "paymentReceipt",
    "sourceModule": "payments",
    "sourceResourceType": "paymentReceipt",
    "sourceResourceId": "payment_receipt_uuid",
    "ownerType": "propertyUnit",
    "ownerUserId": null,
    "ownerPersonId": null,
    "ownerPropertyUnitId": "property_unit_uuid",
    "currentVersionId": null,
    "activeFileId": null,
    "createdAt": "2026-07-21T10:00:00Z",
    "updatedAt": "2026-07-21T10:00:00Z",
    "archivedAt": null,
    "metadata": {
      "period": "2026-07"
    }
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* No acepta `tenantId`.
* No acepta `storageKey`.
* `sourceModule` obligatorio.
* `category` obligatoria.
* `sensitivity` obligatoria.
* `visibility` obligatoria.
* Si `sourceResourceId` existe, debe validarse contra tenant.
* Si `ownerUserId`, `ownerPersonId` u `ownerPropertyUnitId` existen, deben pertenecer al tenant.
* Estado inicial: `draft`.
* No crea archivo físico.
* Audita `document.created`.

### Evento auditable

```text id="nfuntj"
document.created
```

---

## 10.3. Obtener documento

### Endpoint

```http id="z2a1gv"
GET /api/v1/tenant/documents/{documentId}
```

### Permiso

```text id="j6x1gd"
documents.read
```

### Response 200

```json id="sxpa20"
{
  "data": {
    "id": "document_uuid",
    "title": "Comprobante de pago julio 2026",
    "description": "Comprobante reportado por residente.",
    "status": "available",
    "visibility": "private",
    "sensitivity": "confidential",
    "category": "paymentReceipt",
    "sourceModule": "payments",
    "sourceResourceType": "paymentReceipt",
    "sourceResourceId": "payment_receipt_uuid",
    "ownerType": "propertyUnit",
    "ownerUserId": null,
    "ownerPersonId": null,
    "ownerPropertyUnitId": "property_unit_uuid",
    "currentVersionId": "version_uuid",
    "activeFileId": "file_uuid",
    "createdAt": "2026-07-21T10:00:00Z",
    "updatedAt": "2026-07-21T10:01:00Z",
    "archivedAt": null,
    "restoredAt": null,
    "archiveReason": null,
    "metadata": {
      "period": "2026-07"
    }
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Debe buscarse por `tenantId + documentId`.
* No devuelve `storageKey`.
* No devuelve URL firmada.
* No devuelve binario.
* No devuelve hash completo por defecto.

---

## 10.4. Actualizar metadata

### Endpoint

```http id="w80el7"
PATCH /api/v1/tenant/documents/{documentId}/metadata
```

### Permiso

```text id="nqqyer"
documents.updateMetadata
```

### Request body

```json id="wyv0m4"
{
  "title": "Comprobante de pago actualizado",
  "description": "Comprobante validado administrativamente.",
  "visibility": "private",
  "sensitivity": "confidential",
  "metadata": {
    "period": "2026-07",
    "reviewStatus": "validated"
  }
}
```

### Response 200

```json id="tkpun4"
{
  "data": {
    "id": "document_uuid",
    "title": "Comprobante de pago actualizado",
    "description": "Comprobante validado administrativamente.",
    "visibility": "private",
    "sensitivity": "confidential",
    "updatedAt": "2026-07-21T11:00:00Z",
    "metadata": {
      "period": "2026-07",
      "reviewStatus": "validated"
    }
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Campos prohibidos

```text id="obavhb"
tenantId
status
sourceModule
sourceResourceType
sourceResourceId
ownerType
ownerUserId
ownerPersonId
ownerPropertyUnitId
currentVersionId
activeFileId
storageKey
fileHash
hashAlgorithm
createdBy
updatedBy
archivedBy
restoredBy
createdAt
updatedAt
archivedAt
restoredAt
```

### Evento auditable

```text id="mdjbur"
document.metadataUpdated
```

---

## 10.5. Archivar documento

### Endpoint

```http id="crvca1"
POST /api/v1/tenant/documents/{documentId}/archive
```

### Permiso

```text id="ahx8a8"
documents.archive
```

### Request body

```json id="hp112l"
{
  "reason": "Documento reemplazado por una versión corregida."
}
```

### Response 200

```json id="i9utl1"
{
  "data": {
    "id": "document_uuid",
    "status": "archived",
    "archivedAt": "2026-07-21T12:00:00Z",
    "archiveReason": "Documento reemplazado por una versión corregida."
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Archivo lógico.
* No elimina archivo físico.
* No elimina versiones.
* No elimina files.
* No elimina links.
* No elimina policies.
* No elimina access logs.
* Documentos archivados no aparecen por defecto en listados.
* Audita `document.archived`.

---

## 10.6. Restaurar documento

### Endpoint

```http id="xt2jgc"
POST /api/v1/tenant/documents/{documentId}/restore
```

### Permiso

```text id="arqtf6"
documents.restore
```

### Request body

```json id="teq09v"
{
  "reason": "Restauración administrativa autorizada."
}
```

### Response 200

```json id="eojpf1"
{
  "data": {
    "id": "document_uuid",
    "status": "available",
    "restoredAt": "2026-07-22T09:00:00Z",
    "archivedAt": null
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Requiere documento archivado.
* Debe validar que archivo físico activo exista.
* No restaura archivos `infected`, `rejected` o `missing` sin flujo explícito.
* Audita `document.restored`.

---

## 10.7. Listar access logs de documento

### Endpoint

```http id="jwd00p"
GET /api/v1/tenant/documents/{documentId}/access-logs
```

### Permiso

```text id="cthkky"
documents.audit.read
```

### Query params

| Nombre         | Tipo      | Requerido |
| -------------- | --------- | --------: |
| `fileId`       | UUID      |        No |
| `actorUserId`  | UUID      |        No |
| `accessType`   | string    |        No |
| `outcome`      | string    |        No |
| `accessedFrom` | date-time |        No |
| `accessedTo`   | date-time |        No |
| `page`         | number    |        No |
| `pageSize`     | number    |        No |

### Response 200

```json id="jsilcd"
{
  "data": [
    {
      "id": "access_log_uuid",
      "documentId": "document_uuid",
      "versionId": "version_uuid",
      "fileId": "file_uuid",
      "actorUserId": "user_uuid",
      "accessType": "download",
      "outcome": "allowed",
      "sourceModule": "payments",
      "sourceResourceType": "paymentReceipt",
      "sourceResourceId": "payment_receipt_uuid",
      "accessedAt": "2026-07-21T12:10:00Z",
      "traceId": "req_123456",
      "metadata": {
        "mimeGroup": "pdf"
      }
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
* No devuelve URL firmada.
* No devuelve IP hash salvo permiso explícito futuro.
* No devuelve user agent hash salvo permiso explícito futuro.
* No devuelve binarios.

---

# 11. Versiones

## 11.1. Listar versiones

### Endpoint

```http id="qj63vb"
GET /api/v1/tenant/documents/{documentId}/versions
```

### Permiso

```text id="ncdqvl"
documents.read
```

### Query params

| Nombre          | Tipo   | Requerido |
| --------------- | ------ | --------: |
| `status`        | string |        No |
| `versionNumber` | number |        No |
| `page`          | number |        No |
| `pageSize`      | number |        No |

### Response 200

```json id="zpj86j"
{
  "data": [
    {
      "id": "version_uuid",
      "documentId": "document_uuid",
      "versionNumber": 1,
      "status": "active",
      "title": "Versión inicial",
      "description": "Primera versión del documento.",
      "changeReason": null,
      "createdAt": "2026-07-21T10:00:00Z",
      "archivedAt": null,
      "metadata": {}
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

```http id="x8e9ee"
POST /api/v1/tenant/documents/{documentId}/versions
```

### Permiso

```text id="mzqm18"
documents.create
```

### Request body

```json id="bkqjxn"
{
  "title": "Versión corregida",
  "description": "Corrección del documento.",
  "changeReason": "Se reemplaza archivo por una versión legible."
}
```

### Response 201

```json id="v7wqgu"
{
  "data": {
    "id": "version_uuid",
    "documentId": "document_uuid",
    "versionNumber": 2,
    "status": "draft",
    "title": "Versión corregida",
    "description": "Corrección del documento.",
    "changeReason": "Se reemplaza archivo por una versión legible.",
    "createdAt": "2026-07-22T10:00:00Z",
    "archivedAt": null
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Debe incrementar `versionNumber`.
* Para versiones posteriores a la primera, `changeReason` es requerido.
* No modifica la versión anterior directamente.
* Debe validar `tenantId + documentId`.
* Audita `document.versionCreated`.

### Evento auditable

```text id="qxrf7h"
document.versionCreated
```

---

## 11.3. Obtener versión

### Endpoint

```http id="n8l7uq"
GET /api/v1/tenant/document-versions/{versionId}
```

### Permiso

```text id="rb0yx5"
documents.read
```

### Response 200

```json id="brjz52"
{
  "data": {
    "id": "version_uuid",
    "documentId": "document_uuid",
    "versionNumber": 1,
    "status": "active",
    "title": "Versión inicial",
    "description": "Primera versión del documento.",
    "changeReason": null,
    "createdAt": "2026-07-21T10:00:00Z",
    "archivedAt": null,
    "metadata": {}
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Buscar por `tenantId + versionId`.
* No buscar solo por `versionId`.

---

## 11.4. Archivar versión

### Endpoint

```http id="g8h77u"
POST /api/v1/tenant/document-versions/{versionId}/archive
```

### Permiso

```text id="q27day"
documents.archive
```

### Request body

```json id="le8jqa"
{
  "reason": "Versión reemplazada por versión corregida."
}
```

### Response 200

```json id="h8v6cj"
{
  "data": {
    "id": "version_uuid",
    "status": "archived",
    "archivedAt": "2026-07-22T11:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* No elimina archivos físicos.
* No elimina access logs.
* Debe validar si la versión es actual antes de archivar.
* Audita `document.versionArchived`.

---

# 12. Archivos

## 12.1. Subir archivo a documento

### Endpoint

```http id="yywtlv"
POST /api/v1/tenant/documents/{documentId}/files
```

### Permiso

```text id="cv4cvj"
documents.create
```

### Content-Type

```text id="p7rsw0"
multipart/form-data
```

### Campos multipart

| Campo       | Tipo        | Requerido | Descripción                                                      |
| ----------- | ----------- | --------: | ---------------------------------------------------------------- |
| `file`      | binary      |        Sí | Archivo a subir                                                  |
| `versionId` | UUID        |        No | Versión existente; si no se envía, puede crearse versión inicial |
| `isPrimary` | boolean     |        No | Si será archivo principal                                        |
| `metadata`  | JSON/string |        No | Metadata segura                                                  |

### Response 201

```json id="zorlcx"
{
  "data": {
    "id": "file_uuid",
    "documentId": "document_uuid",
    "versionId": "version_uuid",
    "provider": "local",
    "originalFileName": "comprobante-julio.pdf",
    "safeFileName": "comprobante-julio.pdf",
    "extension": "pdf",
    "mimeType": "application/pdf",
    "mimeGroup": "pdf",
    "fileSize": 245760,
    "hashPrefix": "a1b2c3d4e5f6",
    "hashAlgorithm": "SHA-256",
    "scanStatus": "notRequired",
    "status": "available",
    "isPrimary": true,
    "uploadedAt": "2026-07-21T10:01:00Z",
    "generatedAt": null,
    "archivedAt": null,
    "metadata": {}
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* No acepta `tenantId`.
* No acepta `storageKey`.
* No acepta `fileHash` desde cliente.
* Valida MIME type.
* Valida extensión.
* Valida tamaño.
* Valida archivo no vacío.
* Sanitiza filename.
* Genera `storageKey` en servidor.
* Calcula SHA-256.
* Registra archivo.
* Actualiza `activeFileId` si `isPrimary = true`.
* No expone `storageKey`.
* Audita `document.uploaded`.

### Evento auditable

```text id="kluhvn"
document.uploaded
```

---

## 12.2. Registrar archivo generado por sistema

### Endpoint

```http id="pqzlu8"
POST /api/v1/tenant/documents/{documentId}/files/register-system-generated
```

### Permiso

```text id="e3ngzq"
documents.registerSystemGenerated
```

### Request body

```json id="nbd3xs"
{
  "versionId": "version_uuid",
  "fileName": "ACTA-2026-0001.pdf",
  "mimeType": "application/pdf",
  "mimeGroup": "pdf",
  "category": "certifiedMinutesPdf",
  "isPrimary": true,
  "generatedBy": "system",
  "metadata": {
    "generator": "certifiedMinutesPdfService"
  }
}
```

### Nota técnica

Este endpoint no debe recibir binarios en JSON. En implementación real, el registro generado por sistema debe invocarse preferentemente mediante puerto interno con `Buffer` o stream controlado.

### Response 201

```json id="u1frnc"
{
  "data": {
    "id": "file_uuid",
    "documentId": "document_uuid",
    "versionId": "version_uuid",
    "provider": "s3Compatible",
    "originalFileName": "ACTA-2026-0001.pdf",
    "safeFileName": "ACTA-2026-0001.pdf",
    "extension": "pdf",
    "mimeType": "application/pdf",
    "mimeGroup": "pdf",
    "fileSize": 524288,
    "hashPrefix": "c8d9e0f1a2b3",
    "hashAlgorithm": "SHA-256",
    "scanStatus": "notRequired",
    "status": "available",
    "isPrimary": true,
    "uploadedAt": null,
    "generatedAt": "2026-08-15T19:20:00Z",
    "archivedAt": null
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Preferir uso interno por puerto, no exposición abierta.
* No aceptar binario base64.
* No aceptar `storageKey` externo salvo adaptador interno estrictamente validado.
* Valida `documentId`, `versionId` y source resource contra tenant.
* Calcula hash desde bytes reales.
* Audita `document.fileRegistered`.

---

## 12.3. Obtener metadata de archivo

### Endpoint

```http id="ta6f7e"
GET /api/v1/tenant/document-files/{fileId}
```

### Permiso

```text id="no6hxa"
documents.read
```

### Response 200

```json id="osxubp"
{
  "data": {
    "id": "file_uuid",
    "documentId": "document_uuid",
    "versionId": "version_uuid",
    "provider": "s3Compatible",
    "originalFileName": "comprobante-julio.pdf",
    "safeFileName": "comprobante-julio.pdf",
    "extension": "pdf",
    "mimeType": "application/pdf",
    "mimeGroup": "pdf",
    "fileSize": 245760,
    "hashPrefix": "a1b2c3d4e5f6",
    "hashAlgorithm": "SHA-256",
    "scanStatus": "notRequired",
    "status": "available",
    "isPrimary": true,
    "uploadedAt": "2026-07-21T10:01:00Z",
    "generatedAt": null,
    "archivedAt": null,
    "archiveReason": null,
    "metadata": {}
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Buscar por `tenantId + fileId`.
* No devuelve `storageKey`.
* No devuelve URL firmada.
* No devuelve hash completo por defecto.

---

## 12.4. Descargar archivo administrativo

### Endpoint

```http id="mtz8tu"
GET /api/v1/tenant/document-files/{fileId}/download
```

### Permiso

```text id="i128mg"
documents.download
```

### Response 200

```text id="z2ltkv"
binary stream
```

### Reglas

* Valida `tenantId + fileId`.
* Valida permiso `documents.download`.
* Valida estado del documento.
* Valida estado del archivo.
* Rechaza `quarantined`.
* Rechaza `rejected`.
* Rechaza `archived`.
* Rechaza `missing`.
* No expone `storageKey`.
* No expone URL persistente.
* Registra access log.
* Audita `document.downloaded`.

### Eventos

```text id="nn5yu9"
document.downloaded
```

Access log:

```text id="jsi8h1"
accessType = download
outcome = allowed
```

---

## 12.5. Archivar archivo

### Endpoint

```http id="ntrgh5"
POST /api/v1/tenant/document-files/{fileId}/archive
```

### Permiso

```text id="pne6gk"
documents.archive
```

### Request body

```json id="lplt2u"
{
  "reason": "Archivo reemplazado por nueva versión."
}
```

### Response 200

```json id="a3pfzp"
{
  "data": {
    "id": "file_uuid",
    "status": "archived",
    "archivedAt": "2026-07-22T12:00:00Z",
    "archiveReason": "Archivo reemplazado por nueva versión."
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Archivo lógico.
* No elimina objeto físico por defecto.
* Si era `activeFileId`, debe exigir reemplazo o dejar el documento sin active file según política.
* Audita `document.fileArchived`.

---

# 13. Endpoints `/me`

## 13.1. Listar mis documentos

### Endpoint

```http id="iu8fnu"
GET /api/v1/me/documents
```

### Permiso

```text id="rwzgtg"
documents.read.own
```

### Query params

| Nombre         | Tipo      | Requerido |
| -------------- | --------- | --------: |
| `category`     | string    |        No |
| `sourceModule` | string    |        No |
| `visibility`   | string    |        No |
| `createdFrom`  | date-time |        No |
| `createdTo`    | date-time |        No |
| `q`            | string    |        No |
| `page`         | number    |        No |
| `pageSize`     | number    |        No |
| `sortBy`       | string    |        No |
| `sortOrder`    | string    |        No |

### Response 200

```json id="sp5khv"
{
  "data": [
    {
      "id": "document_uuid",
      "title": "Comprobante de pago julio 2026",
      "description": "Comprobante reportado.",
      "status": "available",
      "visibility": "private",
      "sensitivity": "confidential",
      "category": "paymentReceipt",
      "sourceModule": "payments",
      "sourceResourceType": "paymentReceipt",
      "sourceResourceId": "payment_receipt_uuid",
      "createdAt": "2026-07-21T10:00:00Z",
      "updatedAt": "2026-07-21T10:01:00Z",
      "activeFile": {
        "id": "file_uuid",
        "safeFileName": "comprobante-julio.pdf",
        "mimeType": "application/pdf",
        "mimeGroup": "pdf",
        "fileSize": 245760,
        "hashPrefix": "a1b2c3d4e5f6",
        "hashAlgorithm": "SHA-256",
        "downloadAvailable": true
      }
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

* Solo documentos autorizados para el usuario.
* Filtros no amplían acceso.
* No devuelve archivados por defecto.
* No devuelve `quarantined`.
* No devuelve `rejected`.
* No devuelve `storageKey`.
* No devuelve auditoría.
* No devuelve policies internas completas.
* No devuelve `audienceRules` completas si revelan terceros.

---

## 13.2. Obtener mi documento

### Endpoint

```http id="bxu3yo"
GET /api/v1/me/documents/{documentId}
```

### Permiso

```text id="cx6cdg"
documents.read.own
```

### Response 200

```json id="t3v8bw"
{
  "data": {
    "id": "document_uuid",
    "title": "Comprobante de pago julio 2026",
    "description": "Comprobante reportado.",
    "status": "available",
    "visibility": "private",
    "sensitivity": "confidential",
    "category": "paymentReceipt",
    "sourceModule": "payments",
    "sourceResourceType": "paymentReceipt",
    "sourceResourceId": "payment_receipt_uuid",
    "createdAt": "2026-07-21T10:00:00Z",
    "updatedAt": "2026-07-21T10:01:00Z",
    "activeFile": {
      "id": "file_uuid",
      "safeFileName": "comprobante-julio.pdf",
      "mimeType": "application/pdf",
      "mimeGroup": "pdf",
      "fileSize": 245760,
      "hashPrefix": "a1b2c3d4e5f6",
      "hashAlgorithm": "SHA-256",
      "status": "available",
      "downloadAvailable": true
    }
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Valida acceso propio.
* Valida owner lógico o delegación al módulo origen.
* No devuelve `storageKey`.
* No devuelve URL firmada.
* No devuelve auditoría.
* No devuelve access logs.

---

## 13.3. Crear documento propio

### Endpoint

```http id="w8lg8u"
POST /api/v1/me/documents
```

### Permiso

```text id="mmhihr"
documents.upload.own
```

### Request body

```json id="kix9un"
{
  "title": "Comprobante de pago julio 2026",
  "description": "Comprobante subido por residente.",
  "category": "paymentReceipt",
  "sourceModule": "payments",
  "sourceResourceType": "paymentReceipt",
  "sourceResourceId": "payment_receipt_uuid",
  "ownerType": "propertyUnit",
  "ownerPropertyUnitId": "property_unit_uuid",
  "metadata": {
    "period": "2026-07"
  }
}
```

### Response 201

```json id="zhsw04"
{
  "data": {
    "id": "document_uuid",
    "title": "Comprobante de pago julio 2026",
    "status": "draft",
    "visibility": "private",
    "sensitivity": "confidential",
    "category": "paymentReceipt",
    "sourceModule": "payments",
    "sourceResourceType": "paymentReceipt",
    "sourceResourceId": "payment_receipt_uuid",
    "ownerType": "propertyUnit",
    "ownerPropertyUnitId": "property_unit_uuid",
    "createdAt": "2026-07-21T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Solo categorías permitidas para upload propio.
* MVP recomendado: `paymentReceipt`.
* Debe delegar validación a módulo origen.
* El usuario debe estar vinculado al owner indicado.
* No acepta `tenantId`.
* No acepta `storageKey`.
* No permite crear documentos administrativos internos.

---

## 13.4. Subir archivo propio

### Endpoint

```http id="qiieuj"
POST /api/v1/me/documents/{documentId}/files
```

### Permiso

```text id="sry8ro"
documents.upload.own
```

### Content-Type

```text id="j050ee"
multipart/form-data
```

### Campos multipart

| Campo      | Tipo        | Requerido |
| ---------- | ----------- | --------: |
| `file`     | binary      |        Sí |
| `metadata` | JSON/string |        No |

### Response 201

```json id="utfjdf"
{
  "data": {
    "id": "file_uuid",
    "documentId": "document_uuid",
    "versionId": "version_uuid",
    "originalFileName": "comprobante-julio.pdf",
    "safeFileName": "comprobante-julio.pdf",
    "extension": "pdf",
    "mimeType": "application/pdf",
    "mimeGroup": "pdf",
    "fileSize": 245760,
    "hashPrefix": "a1b2c3d4e5f6",
    "hashAlgorithm": "SHA-256",
    "scanStatus": "notRequired",
    "status": "available",
    "downloadAvailable": true,
    "uploadedAt": "2026-07-21T10:01:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Solo documentos propios.
* Solo categorías permitidas.
* Valida source module.
* Valida owner.
* Valida MIME.
* Valida tamaño.
* Calcula hash.
* No expone `storageKey`.
* Audita `document.uploaded`.

---

## 13.5. Descargar archivo propio

### Endpoint

```http id="zx9q2l"
GET /api/v1/me/document-files/{fileId}/download
```

### Permiso

```text id="dzha8v"
documents.download.own
```

### Response 200

```text id="g0afsa"
binary stream
```

### Reglas

* Valida acceso propio.
* Valida policy del documento.
* Valida source module policy.
* Valida estado `available`.
* Rechaza `quarantined`.
* Rechaza `rejected`.
* Rechaza `archived`.
* Rechaza archivo de otro tenant.
* No expone `storageKey`.
* Registra access log.
* Audita `document.downloaded`.

---

# 14. Configuración platform

## 14.1. Obtener configuración de storage

### Endpoint

```http id="gc00dc"
GET /api/v1/platform/document-storage/config
```

### Permiso

```text id="kz6wdb"
documents.storage.readConfig
```

### Response 200

```json id="qqd1zh"
{
  "data": {
    "provider": "s3Compatible",
    "localStorageAllowedInProd": false,
    "maxFileSizeMb": 20,
    "imageMaxFileSizeMb": 10,
    "reportMaxFileSizeMb": 50,
    "temporaryUrlTtlSeconds": 300,
    "temporaryUrlsEnabled": false,
    "fileScanEnabled": false,
    "publicDocumentsEnabled": false,
    "allowedMimeTypes": [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
      "application/json",
      "text/plain"
    ],
    "s3": {
      "endpointConfigured": true,
      "regionConfigured": true,
      "bucketConfigured": true,
      "serverSideEncryptionEnabled": true,
      "credentialsConfigured": true
    }
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* No devuelve access keys.
* No devuelve secret keys.
* No devuelve connection string sensible.
* No devuelve bucket si política lo considera sensible; puede devolver `bucketConfigured`.

---

## 14.2. Actualizar configuración de storage

### Endpoint

```http id="a8a6r9"
PATCH /api/v1/platform/document-storage/config
```

### Permiso

```text id="qc3fkt"
documents.storage.configure
```

### Request body

```json id="n0vj8j"
{
  "provider": "s3Compatible",
  "maxFileSizeMb": 20,
  "imageMaxFileSizeMb": 10,
  "reportMaxFileSizeMb": 50,
  "temporaryUrlTtlSeconds": 300,
  "temporaryUrlsEnabled": false,
  "fileScanEnabled": false,
  "publicDocumentsEnabled": false
}
```

### Response 200

```json id="g46cmk"
{
  "data": {
    "provider": "s3Compatible",
    "maxFileSizeMb": 20,
    "imageMaxFileSizeMb": 10,
    "reportMaxFileSizeMb": 50,
    "temporaryUrlTtlSeconds": 300,
    "temporaryUrlsEnabled": false,
    "fileScanEnabled": false,
    "publicDocumentsEnabled": false,
    "updatedAt": "2026-07-21T12:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* No aceptar secretos por este endpoint en MVP salvo decisión explícita.
* No permitir `local` en producción si `DOCUMENT_STORAGE_LOCAL_ALLOWED_IN_PROD=false`.
* Auditar `document.storageProviderConfigured`.

---

## 14.3. Probar conexión de storage

### Endpoint

```http id="dv3q6m"
POST /api/v1/platform/document-storage/test-connection
```

### Permiso

```text id="b4adqw"
documents.storage.testConnection
```

### Request body

```json id="qh6jfx"
{
  "provider": "s3Compatible"
}
```

### Response 200

```json id="bcm0uk"
{
  "data": {
    "provider": "s3Compatible",
    "reachable": true,
    "canWrite": true,
    "canRead": true,
    "canDeleteTestObject": true,
    "checkedAt": "2026-07-21T12:05:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Evento auditable

```text id="tj4v1i"
document.storageConnectionTested
```

---

## 14.4. Listar providers soportados

### Endpoint

```http id="hun5i2"
GET /api/v1/platform/document-storage/providers
```

### Permiso

```text id="x3s3hf"
documents.storage.readConfig
```

### Response 200

```json id="drtbxa"
{
  "data": [
    {
      "provider": "local",
      "enabled": true,
      "productionAllowed": false
    },
    {
      "provider": "s3Compatible",
      "enabled": true,
      "productionAllowed": true
    },
    {
      "provider": "s3",
      "enabled": false,
      "productionAllowed": true
    },
    {
      "provider": "minio",
      "enabled": false,
      "productionAllowed": true
    }
  ],
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 15. Matriz de endpoints

| Método | Ruta                                                                    | Scope    | Auth | Permiso                             |
| ------ | ----------------------------------------------------------------------- | -------- | ---- | ----------------------------------- |
| GET    | `/api/v1/tenant/documents`                                              | tenant   | Sí   | `documents.read`                    |
| POST   | `/api/v1/tenant/documents`                                              | tenant   | Sí   | `documents.create`                  |
| GET    | `/api/v1/tenant/documents/{documentId}`                                 | tenant   | Sí   | `documents.read`                    |
| PATCH  | `/api/v1/tenant/documents/{documentId}/metadata`                        | tenant   | Sí   | `documents.updateMetadata`          |
| POST   | `/api/v1/tenant/documents/{documentId}/archive`                         | tenant   | Sí   | `documents.archive`                 |
| POST   | `/api/v1/tenant/documents/{documentId}/restore`                         | tenant   | Sí   | `documents.restore`                 |
| GET    | `/api/v1/tenant/documents/{documentId}/access-logs`                     | tenant   | Sí   | `documents.audit.read`              |
| GET    | `/api/v1/tenant/documents/{documentId}/versions`                        | tenant   | Sí   | `documents.read`                    |
| POST   | `/api/v1/tenant/documents/{documentId}/versions`                        | tenant   | Sí   | `documents.create`                  |
| GET    | `/api/v1/tenant/document-versions/{versionId}`                          | tenant   | Sí   | `documents.read`                    |
| POST   | `/api/v1/tenant/document-versions/{versionId}/archive`                  | tenant   | Sí   | `documents.archive`                 |
| POST   | `/api/v1/tenant/documents/{documentId}/files`                           | tenant   | Sí   | `documents.create`                  |
| POST   | `/api/v1/tenant/documents/{documentId}/files/register-system-generated` | tenant   | Sí   | `documents.registerSystemGenerated` |
| GET    | `/api/v1/tenant/document-files/{fileId}`                                | tenant   | Sí   | `documents.read`                    |
| GET    | `/api/v1/tenant/document-files/{fileId}/download`                       | tenant   | Sí   | `documents.download`                |
| POST   | `/api/v1/tenant/document-files/{fileId}/archive`                        | tenant   | Sí   | `documents.archive`                 |
| GET    | `/api/v1/me/documents`                                                  | own      | Sí   | `documents.read.own`                |
| GET    | `/api/v1/me/documents/{documentId}`                                     | own      | Sí   | `documents.read.own`                |
| POST   | `/api/v1/me/documents`                                                  | own      | Sí   | `documents.upload.own`              |
| POST   | `/api/v1/me/documents/{documentId}/files`                               | own      | Sí   | `documents.upload.own`              |
| GET    | `/api/v1/me/document-files/{fileId}/download`                           | own      | Sí   | `documents.download.own`            |
| GET    | `/api/v1/platform/document-storage/config`                              | platform | Sí   | `documents.storage.readConfig`      |
| PATCH  | `/api/v1/platform/document-storage/config`                              | platform | Sí   | `documents.storage.configure`       |
| POST   | `/api/v1/platform/document-storage/test-connection`                     | platform | Sí   | `documents.storage.testConnection`  |
| GET    | `/api/v1/platform/document-storage/providers`                           | platform | Sí   | `documents.storage.readConfig`      |

---

# 16. Catálogo de errores

| Código                               |    HTTP | Descripción                             |
| ------------------------------------ | ------: | --------------------------------------- |
| `DOCUMENT_NOT_FOUND`                 |     404 | Documento no encontrado o no accesible  |
| `DOCUMENT_FORBIDDEN`                 |     403 | Usuario sin acceso al documento         |
| `DOCUMENT_INVALID_STATUS`            |     409 | Estado inválido para la operación       |
| `DOCUMENT_NOT_AVAILABLE`             |     409 | Documento no disponible                 |
| `DOCUMENT_ARCHIVED`                  |     409 | Documento archivado                     |
| `DOCUMENT_CROSS_TENANT_REFERENCE`    | 403/404 | Referencia de otro tenant               |
| `DOCUMENT_SOURCE_MODULE_REQUIRED`    |     422 | Módulo origen requerido                 |
| `DOCUMENT_SOURCE_RESOURCE_INVALID`   |     422 | Recurso origen inválido                 |
| `DOCUMENT_CATEGORY_REQUIRED`         |     422 | Categoría requerida                     |
| `DOCUMENT_SENSITIVITY_REQUIRED`      |     422 | Sensibilidad requerida                  |
| `DOCUMENT_VISIBILITY_INVALID`        |     422 | Visibilidad inválida                    |
| `DOCUMENT_METADATA_INVALID`          |     422 | Metadata inválida o insegura            |
| `DOCUMENT_VERSION_NOT_FOUND`         |     404 | Versión no encontrada                   |
| `DOCUMENT_VERSION_INVALID`           |     422 | Versión inválida                        |
| `DOCUMENT_FILE_NOT_FOUND`            |     404 | Archivo no encontrado                   |
| `DOCUMENT_FILE_FORBIDDEN`            |     403 | Archivo no accesible                    |
| `DOCUMENT_FILE_NOT_AVAILABLE`        |     409 | Archivo no disponible                   |
| `DOCUMENT_FILE_QUARANTINED`          |     409 | Archivo en cuarentena                   |
| `DOCUMENT_FILE_REJECTED`             |     409 | Archivo rechazado                       |
| `DOCUMENT_FILE_ARCHIVED`             |     409 | Archivo archivado                       |
| `DOCUMENT_FILE_INVALID_TYPE`         |     415 | MIME type no permitido                  |
| `DOCUMENT_FILE_TOO_LARGE`            |     413 | Archivo excede tamaño permitido         |
| `DOCUMENT_FILE_EMPTY`                |     422 | Archivo vacío                           |
| `DOCUMENT_FILE_NAME_INVALID`         |     422 | Nombre de archivo inválido              |
| `DOCUMENT_FILE_HASH_REQUIRED`        |     422 | Hash requerido                          |
| `DOCUMENT_STORAGE_KEY_FORBIDDEN`     |     422 | `storageKey` no permitido desde cliente |
| `DOCUMENT_STORAGE_ERROR`             |     500 | Error controlado de storage             |
| `DOCUMENT_STORAGE_PROVIDER_INVALID`  |     422 | Provider inválido                       |
| `DOCUMENT_STORAGE_CONFIG_INVALID`    |     422 | Configuración inválida                  |
| `DOCUMENT_STORAGE_CONNECTION_FAILED` |     500 | Falló prueba de conexión                |
| `DOCUMENT_DOWNLOAD_FORBIDDEN`        |     403 | Descarga no autorizada                  |
| `DOCUMENT_PUBLIC_ENDPOINT_FORBIDDEN` |     404 | Endpoint público no existe              |
| `VALIDATION_ERROR`                   |     422 | Error de validación                     |
| `UNAUTHORIZED`                       |     401 | No autenticado                          |
| `FORBIDDEN`                          |     403 | Sin permiso                             |
| `RATE_LIMITED`                       |     429 | Rate limit                              |
| `INTERNAL_ERROR`                     |     500 | Error interno                           |

---

# 17. Ejemplos de errores

## 17.1. Documento no encontrado

```json id="fv9w6c"
{
  "error": {
    "code": "DOCUMENT_NOT_FOUND",
    "message": "Document not found.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

## 17.2. Referencia cross-tenant

```json id="dyck5u"
{
  "error": {
    "code": "DOCUMENT_CROSS_TENANT_REFERENCE",
    "message": "The referenced resource does not belong to the current tenant.",
    "details": {
      "resourceType": "paymentReceipt"
    },
    "traceId": "req_123456"
  }
}
```

---

## 17.3. Archivo demasiado grande

```json id="y9w4nf"
{
  "error": {
    "code": "DOCUMENT_FILE_TOO_LARGE",
    "message": "The uploaded file exceeds the maximum allowed size.",
    "details": {
      "maxFileSizeMb": 20
    },
    "traceId": "req_123456"
  }
}
```

---

## 17.4. MIME type no permitido

```json id="w9r2bg"
{
  "error": {
    "code": "DOCUMENT_FILE_INVALID_TYPE",
    "message": "The uploaded file type is not allowed.",
    "details": {
      "mimeType": "application/x-msdownload"
    },
    "traceId": "req_123456"
  }
}
```

---

## 17.5. Storage key prohibido

```json id="f3j945"
{
  "error": {
    "code": "DOCUMENT_STORAGE_KEY_FORBIDDEN",
    "message": "storageKey cannot be provided by the client.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

## 17.6. Descarga no autorizada

```json id="z6zt94"
{
  "error": {
    "code": "DOCUMENT_DOWNLOAD_FORBIDDEN",
    "message": "You are not authorized to download this file.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

# 18. Validación de archivos

## 18.1. MIME types permitidos base

```text id="kui839"
application/pdf
image/png
image/jpeg
application/vnd.openxmlformats-officedocument.wordprocessingml.document
application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
text/csv
application/json
text/plain
```

---

## 18.2. MIME types bloqueados por defecto

```text id="a4dst4"
application/x-msdownload
application/x-sh
application/x-bat
application/javascript
text/html
application/html
application/x-php
application/java-archive
application/vnd.android.package-archive
```

---

## 18.3. Tamaños sugeridos

```text id="b5dphu"
defaultMaxFileSizeMb = 20
imageMaxFileSizeMb = 10
reportExportMaxFileSizeMb = 50
```

---

## 18.4. Reglas de validación

El upload debe validar:

```text id="dycziz"
fileName
extension
mimeType declarado
mimeType permitido
coherencia extensión/MIME
magic bytes cuando sea posible
fileSize > 0
fileSize <= límite configurado
sourceModule
sourceResourceId
owner lógico
storageKey ausente
path traversal ausente
hash calculado
metadata segura
```

---

# 19. Reglas de seguridad del contrato

## 19.1. Endpoints administrativos

Deben aplicar:

```text id="tb3irj"
AuthGuard
TenantGuard
TenantPermissionGuard
DocumentPermissionGuard
DocumentTenantGuard
DocumentSourceResourceGuard
DocumentAccessPolicy
DocumentSensitivityPolicy
DocumentStatePolicy
DocumentMetadataPolicy
DTO whitelist
forbidNonWhitelisted
audit events
safe errors
Cache-Control: no-store
```

---

## 19.2. Endpoints `/me`

Deben aplicar:

```text id="lr7abp"
AuthGuard
TenantGuard
TenantPermissionGuard
OwnDocumentGuard
DocumentOwnResourcePolicy
DocumentVisibilityPolicy
DocumentSensitivityPolicy
DocumentSourceResourcePolicy
DocumentDownloadPolicy
safe DTO minimization
no internal metadata
no storageKey
no audit exposure
Cache-Control: no-store
```

---

## 19.3. Endpoints de descarga

Deben aplicar:

```text id="cry0d9"
AuthGuard
TenantGuard
PermissionGuard
DocumentFileGuard
DocumentDownloadGuard
StorageAccessPolicy
AccessLog
AuditEvent
no storageKey exposure
no persistent signed URL
safe filename
binary stream
Cache-Control: no-store
```

---

## 19.4. Endpoints platform

Deben aplicar:

```text id="c9j7ak"
AuthGuard
PlatformPermissionGuard
PlatformDocumentStorageGuard
safe config DTO
no secrets in response
audit events
Cache-Control: no-store
```

---

# 20. Auditoría

## 20.1. Eventos obligatorios

```text id="e634hw"
document.created
document.metadataUpdated
document.uploaded
document.fileRegistered
document.versionCreated
document.versionArchived
document.fileArchived
document.downloaded
document.accessDenied
document.archived
document.restored
document.quarantined
document.rejected
document.storageProviderConfigured
document.storageConnectionTested
```

---

## 20.2. Metadata permitida

```json id="vz2989"
{
  "documentId": "document_uuid",
  "versionId": "version_uuid",
  "fileId": "file_uuid",
  "sourceModule": "payments",
  "sourceResourceType": "paymentReceipt",
  "sourceResourceId": "payment_receipt_uuid",
  "category": "paymentReceipt",
  "sensitivity": "confidential",
  "visibility": "private",
  "status": "available",
  "fileSize": 245760,
  "mimeType": "application/pdf",
  "mimeGroup": "pdf",
  "hashPrefix": "a1b2c3d4e5f6",
  "provider": "s3Compatible",
  "accessType": "download",
  "outcome": "allowed",
  "traceId": "req_123456"
}
```

---

## 20.3. Metadata prohibida

```text id="vxibmv"
storageKey
bucket
path interno
URL firmada
contenido del archivo
contenido binario
base64
tokens
cookies
Authorization header
emails completos
teléfonos completos
cédulas
secretos
stack trace
SQL raw
provider payload completo
```

---

# 21. Observabilidad

## 21.1. Logs sugeridos

```text id="w6acx3"
document.created
document.uploaded
document.downloaded
document.accessDenied
document.archived
document.restored
document.storageError
document.validationFailed
```

---

## 21.2. Métricas sugeridas

```text id="v7py5j"
documents_created_total
documents_uploaded_total
documents_downloaded_total
documents_download_denied_total
documents_archived_total
documents_restored_total
document_upload_bytes_total
document_download_bytes_total
document_storage_errors_total
document_validation_failed_total
```

---

## 21.3. Labels permitidos

```text id="ay6234"
sourceModule
category
sensitivity
visibility
status
mimeGroup
provider
outcome
```

---

## 21.4. Labels prohibidos

```text id="nx2ecw"
tenantId
documentId
fileId
versionId
userId
personId
propertyUnitId
sourceResourceId
storageKey
hash
email
phone
ip
traceId
```

---

# 22. OpenAPI

## 22.1. Tags sugeridos

```text id="yn0dq1"
Secure Documents
Secure Document Files
Secure Document Versions
My Secure Documents
Document Storage Platform
```

---

## 22.2. Extensiones OpenAPI sugeridas

### Endpoint tenant

```yaml id="dhe821"
x-tenant-scope: true
x-auth-required: true
x-required-permission: documents.create
x-public-exposure: false
x-audit-event: document.created
```

---

### Endpoint `/me`

```yaml id="pqfeix"
x-tenant-scope: true
x-auth-required: true
x-own-resource: true
x-required-permission: documents.read.own
x-public-exposure: false
```

---

### Endpoint de descarga

```yaml id="zrc4md"
x-secure-download: true
x-binary-response: true
x-storage-key-exposed: false
x-auth-required: true
x-audit-event: document.downloaded
```

---

### Endpoint de upload

```yaml id="i3o2oe"
x-file-upload: true
x-multipart: true
x-storage-backed: true
x-storage-key-exposed: false
x-audit-event: document.uploaded
```

---

### Endpoint platform

```yaml id="ldnw1x"
x-platform-scope: true
x-auth-required: true
x-required-permission: documents.storage.configure
x-secrets-exposed: false
x-audit-event: document.storageProviderConfigured
```

---

## 22.3. OpenAPI no debe documentar

```text id="oa5sqg"
GET /api/v1/public/documents/{documentId}
GET /api/v1/public/document-files/{fileId}/download
GET /api/v1/public/tenants/{slug}/documents
GET /api/v1/public/tenants/{slug}/documents/{documentId}
GET /api/v1/public/tenants/{slug}/document-files/{fileId}/download
```

---

# 23. Casos borde del contrato

| Caso                                              | Resultado esperado |
| ------------------------------------------------- | ------------------ |
| Crear documento con `tenantId` en body            | 422                |
| Crear documento sin `sourceModule`                | 422                |
| Crear documento sin categoría                     | 422                |
| Crear documento sin sensibilidad                  | 422                |
| Crear documento sin visibilidad                   | 422                |
| Usar `sourceResourceId` de otro tenant            | 403/404            |
| Usar `ownerUserId` de otro tenant                 | 403/404            |
| Usar `ownerPersonId` de otro tenant               | 403/404            |
| Usar `ownerPropertyUnitId` de otro tenant         | 403/404            |
| Enviar `storageKey` desde cliente                 | 422                |
| Subir archivo vacío                               | 422                |
| Subir archivo demasiado grande                    | 413                |
| Subir MIME type no permitido                      | 415                |
| Subir filename con path traversal                 | 422                |
| Descargar documento de otro tenant                | 403/404            |
| Descargar sin permiso                             | 403                |
| Descargar documento propio ajeno                  | 403/404            |
| Descargar archivo en cuarentena                   | 409                |
| Descargar archivo rechazado                       | 409                |
| Descargar archivo archivado                       | 409                |
| Descargar archivo missing                         | 409                |
| Documento archivado aparece en listado normal     | falla              |
| Respuesta contiene `storageKey`                   | falla              |
| Error contiene `storageKey`                       | falla              |
| Audit contiene `storageKey`                       | falla              |
| Log contiene binario                              | falla              |
| Audit contiene binario                            | falla              |
| Endpoint público existe                           | falla              |
| OpenAPI documenta endpoint público                | falla              |
| Config platform expone secretos                   | falla              |
| Local storage permitido por defecto en producción | falla              |

---

# 24. Pruebas de contrato requeridas

## 24.1. Documents

Debe probar:

```text id="vlgklv"
GET /api/v1/tenant/documents
POST /api/v1/tenant/documents
GET /api/v1/tenant/documents/{documentId}
PATCH /api/v1/tenant/documents/{documentId}/metadata
POST /api/v1/tenant/documents/{documentId}/archive
POST /api/v1/tenant/documents/{documentId}/restore
GET /api/v1/tenant/documents/{documentId}/access-logs
```

Casos mínimos:

```text id="wwmk1h"
401 sin token
403 sin permiso
201 crear válido
422 tenantId en body
422 storageKey en body
422 sourceModule faltante
422 category faltante
422 sensitivity faltante
403/404 sourceResourceId tenant B
403/404 owner tenant B
no storageKey en response
auditoría
```

---

## 24.2. Versions

Debe probar:

```text id="kr181s"
GET /api/v1/tenant/documents/{documentId}/versions
POST /api/v1/tenant/documents/{documentId}/versions
GET /api/v1/tenant/document-versions/{versionId}
POST /api/v1/tenant/document-versions/{versionId}/archive
```

Casos mínimos:

```text id="x0q6f5"
401 sin token
403 sin permiso
200 listar versiones
201 crear versión
422 changeReason faltante para versión posterior
403/404 document tenant B
403/404 version tenant B
no búsqueda solo por versionId
auditoría
```

---

## 24.3. Files

Debe probar:

```text id="wlogoj"
POST /api/v1/tenant/documents/{documentId}/files
POST /api/v1/tenant/documents/{documentId}/files/register-system-generated
GET /api/v1/tenant/document-files/{fileId}
GET /api/v1/tenant/document-files/{fileId}/download
POST /api/v1/tenant/document-files/{fileId}/archive
```

Casos mínimos:

```text id="ks1b0c"
401 sin token
403 sin permiso
201 subir PDF
201 subir PNG
201 subir JPEG
201 subir DOCX
201 subir XLSX
201 subir CSV
201 subir JSON
201 subir TXT
415 MIME bloqueado
413 archivo demasiado grande
422 archivo vacío
422 storageKey en request
422 path traversal
403/404 file tenant B
200 download autorizado
403 download sin permiso
409 download quarantined
409 download rejected
409 download archived
no storageKey en list/get/error
auditoría
access log
```

---

## 24.4. `/me`

Debe probar:

```text id="ydixr4"
GET /api/v1/me/documents
GET /api/v1/me/documents/{documentId}
POST /api/v1/me/documents
POST /api/v1/me/documents/{documentId}/files
GET /api/v1/me/document-files/{fileId}/download
```

Casos mínimos:

```text id="fqiwoa"
401 sin token
403 sin membership
200 documentos propios autorizados
403/404 documento ajeno
403/404 documento tenant B
403/404 owner ajeno
403/404 source policy ajena
no archivados por defecto
no quarantined
no rejected
no storageKey
no audit
no policies internas completas
upload propio solo categoría permitida
download propio autorizado
download propio denegado auditado
```

---

## 24.5. Platform storage config

Debe probar:

```text id="eufo6f"
GET /api/v1/platform/document-storage/config
PATCH /api/v1/platform/document-storage/config
POST /api/v1/platform/document-storage/test-connection
GET /api/v1/platform/document-storage/providers
```

Casos mínimos:

```text id="f2dpwa"
401 sin token
403 sin permiso platform
200 config sin secretos
422 provider inválido
409 local storage en producción si no permitido
200 test connection
500 connection failed controlado
auditoría config/test
```

---

# 25. Decisión final del contrato API

El módulo `016-secure-document-storage` expondrá endpoints REST para:

```text id="p5cam6"
1. Gestión administrativa de documentos.
2. Creación de metadata documental.
3. Versionado simple.
4. Upload seguro.
5. Registro de archivos generados por sistema.
6. Metadata de archivos.
7. Descarga administrativa segura.
8. Archivo y restauración.
9. Access logs documentales.
10. Consulta propia.
11. Upload propio limitado.
12. Descarga propia autorizada.
13. Configuración platform de storage.
14. Prueba de conexión de storage.
15. Documentación OpenAPI segura.
```

El contrato garantiza:

```text id="hezu3z"
tenant isolation
source resource validation
owner validation
permissioned access
own-resource authorization
source-module delegation
storage key protection
safe metadata
file validation
hash integrity
secure upload
secure download
access logging
audit trail
safe errors
safe logs
safe metrics
no binary JSON
no public endpoints
OpenAPI consistency
CI validation
```

La implementación no debe aceptarse si permite documentos cross-tenant, archivos cross-tenant, versiones cross-tenant, access logs cross-tenant, `sourceResourceId` de otro tenant, `ownerId` de otro tenant, `tenantId` desde body, `storageKey` desde cliente, exposición de `storageKey`, exposición de bucket/path interno, URL firmada persistente, descarga sin autorización, descarga de archivo en cuarentena, descarga de archivo rechazado, documentos archivados visibles por defecto, hash ausente en archivo disponible, MIME type no validado, fileSize no validado, path traversal, binarios en logs, binarios en auditoría, endpoints públicos, documentación OpenAPI de endpoints públicos, acceso automático de PlatformAdmin al contenido de tenants, storage local productivo por defecto u omisión de auditoría crítica.
