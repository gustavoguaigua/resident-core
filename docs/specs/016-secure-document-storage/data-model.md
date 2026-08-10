# Data Model — Spec 016 Secure Document Storage

## 1. Información del documento

| Campo                  | Valor                                                                                                                                         |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto               | RESIDENT Core                                                                                                                                 |
| Spec ID                | 016                                                                                                                                           |
| Módulo                 | Secure Document Storage                                                                                                                       |
| Documento              | Data Model                                                                                                                                    |
| Ruta                   | `docs/specs/016-secure-document-storage/data-model.md`                                                                                        |
| Versión                | 0.1                                                                                                                                           |
| Estado                 | needs-review                                                                                                                                  |
| Fecha                  | 2026-07-21                                                                                                                                    |
| Documento base         | `docs/specs/016-secure-document-storage/spec.md`                                                                                              |
| Plan técnico           | `docs/specs/016-secure-document-storage/plan.md`                                                                                              |
| Base de datos          | PostgreSQL                                                                                                                                    |
| ORM                    | Prisma                                                                                                                                        |
| Estrategia multitenant | Shared database + shared schema + `tenant_id`                                                                                                 |
| Naturaleza             | Tenant-scoped / Storage-backed / Metadata-driven / Hash-aware / Access-controlled / Source-module-aware / Audit-heavy / Non-public by default |
| API Style              | REST                                                                                                                                          |

---

## 2. Propósito

Este documento define el modelo de datos del módulo `016-secure-document-storage`.

El objetivo es crear una capa transversal para registrar, versionar, almacenar, consultar, descargar, archivar, restaurar y auditar documentos y archivos usados por los módulos de RESIDENT Core.

Regla central:

```text id="zi3x7x"
Todo documento, versión, archivo físico, vínculo, política y access log debe ser tenant-scoped, source-module-aware, storage-backed, hash-aware, access-controlled, metadata-safe, non-public by default y auditable.
```

---

## 3. Decisión principal del modelo

Para MVP se crearán seis tablas principales:

```text id="i5y8zu"
secure_documents
secure_document_versions
secure_document_files
secure_document_links
secure_document_policies
secure_document_access_logs
```

Estas tablas permiten cubrir:

* documento lógico;
* versionado simple;
* archivo físico almacenado;
* vínculo con módulos origen;
* reglas de visibilidad y audiencia;
* access logs;
* hash de integridad;
* metadata segura;
* storage provider abstraction;
* archivo lógico;
* restauración administrativa;
* auditoría;
* consultas administrativas;
* consultas propias;
* descargas seguras.

---

## 4. Tablas nuevas MVP

```text id="vosumw"
secure_documents
secure_document_versions
secure_document_files
secure_document_links
secure_document_policies
secure_document_access_logs
```

---

## 5. Configuración de storage

Para MVP, la configuración de storage se recomienda manejar mediante variables de entorno y configuración de aplicación, no mediante tabla de base de datos.

Variables esperadas:

```text id="kkh9ir"
DOCUMENT_STORAGE_PROVIDER
DOCUMENT_STORAGE_LOCAL_ROOT
DOCUMENT_STORAGE_MAX_FILE_SIZE_MB
DOCUMENT_STORAGE_IMAGE_MAX_FILE_SIZE_MB
DOCUMENT_STORAGE_REPORT_MAX_FILE_SIZE_MB
DOCUMENT_STORAGE_TEMP_URL_TTL_SECONDS
DOCUMENT_STORAGE_ALLOWED_MIME_TYPES
DOCUMENT_STORAGE_REQUIRE_HASH
DOCUMENT_STORAGE_LOCAL_ALLOWED_IN_PROD
DOCUMENT_STORAGE_S3_ENDPOINT
DOCUMENT_STORAGE_S3_REGION
DOCUMENT_STORAGE_S3_BUCKET
DOCUMENT_STORAGE_S3_ACCESS_KEY_ID
DOCUMENT_STORAGE_S3_SECRET_ACCESS_KEY
DOCUMENT_STORAGE_S3_FORCE_PATH_STYLE
DOCUMENT_STORAGE_S3_SERVER_SIDE_ENCRYPTION
```

Tabla diferida para evolución futura:

```text id="xl3vyy"
document_storage_configs
```

Motivo para diferirla:

```text id="r0s9az"
La configuración de storage incluye secretos, endpoints, buckets y credenciales. En MVP debe resolverse por configuración segura del entorno o secret manager, evitando persistir secretos en la base transaccional.
```

---

## 6. Tablas externas relacionadas

El módulo se relaciona con tablas existentes o previstas:

```text id="d8uv99"
tenants
user_profiles
persons
property_units
property_ownerships
residencies
payments
payment_receipts
fines
fine_evidence
communications
certified_minutes
certified_minutes_artifacts
certified_minutes_attachments
report_exports
audit_logs
```

| Tabla externa                   | Spec origen                        | Uso en Secure Document Storage                     |
| ------------------------------- | ---------------------------------- | -------------------------------------------------- |
| `tenants`                       | `001-tenants`                      | Tenant propietario del documento                   |
| `user_profiles`                 | `002-users-roles`                  | Creadores, uploaders, descargadores, archivadores  |
| `persons`                       | `003-residents-properties`         | Owner lógico por persona                           |
| `property_units`                | `003-residents-properties`         | Owner lógico por unidad                            |
| `property_ownerships`           | `003-residents-properties`         | Resolución de documentos propios para propietarios |
| `residencies`                   | `003-residents-properties`         | Resolución de documentos propios para residentes   |
| `payments`                      | `005-payments`                     | Comprobantes y recibos                             |
| `payment_receipts`              | `005-payments`                     | Evidencia documental de pagos                      |
| `fines`                         | `011-fines-sanctions`              | Evidencias y apelaciones                           |
| `fine_evidence`                 | `011-fines-sanctions`              | Evidencia documental vinculada a multas            |
| `communications`                | `012-communications-notifications` | Adjuntos e imágenes                                |
| `certified_minutes`             | `015-certified-minutes`            | PDFs y adjuntos de actas                           |
| `certified_minutes_artifacts`   | `015-certified-minutes`            | Artefactos PDF y manifiestos                       |
| `certified_minutes_attachments` | `015-certified-minutes`            | Adjuntos de actas                                  |
| `audit_logs`                    | `007-audit`                        | Auditoría transversal                              |

---

# 7. Entidad `SecureDocument`

## 7.1. Propósito

Representa el documento lógico dentro de RESIDENT Core.

Ejemplos:

```text id="lwkoic"
comprobante de pago
recibo generado
evidencia de multa
documento de apelación
PDF de acta certificada
adjunto de comunicación
imagen de comunicación
reporte exportado
documento administrativo
documento de residente
documento de propiedad
```

---

## 7.2. Tabla

```text id="u25ss4"
secure_documents
```

---

## 7.3. Campos

```text id="adz1lk"
SecureDocument
├── id
├── tenantId
├── title
├── description
├── status
├── visibility
├── sensitivity
├── category
├── sourceModule
├── sourceResourceType
├── sourceResourceId
├── ownerType
├── ownerUserId
├── ownerPersonId
├── ownerPropertyUnitId
├── currentVersionId
├── activeFileId
├── createdBy
├── updatedBy
├── archivedBy
├── restoredBy
├── createdAt
├── updatedAt
├── archivedAt
├── restoredAt
├── archiveReason
└── metadata
```

---

## 7.4. Reglas

* `tenantId` obligatorio.
* `title` obligatorio.
* `status` obligatorio.
* `visibility` obligatoria.
* `sensitivity` obligatoria.
* `category` obligatoria.
* `sourceModule` obligatorio.
* `sourceResourceType` recomendado.
* `sourceResourceId` recomendado cuando exista recurso origen.
* Si `sourceResourceId` existe, debe validarse contra el tenant activo mediante policy del módulo origen.
* `ownerType` opcional.
* `ownerUserId`, `ownerPersonId` y `ownerPropertyUnitId` opcionales.
* Si existe owner, debe pertenecer al mismo tenant.
* `currentVersionId` apunta a la versión activa.
* `activeFileId` apunta al archivo físico activo.
* `metadata` debe ser segura y sanitizada.
* No se elimina físicamente en operación ordinaria.
* No se expone públicamente por defecto.

---

# 8. Entidad `SecureDocumentVersion`

## 8.1. Propósito

Representa una versión lógica del documento.

Permite registrar reemplazos, regeneraciones, nuevas cargas o actualizaciones controladas sin destruir el historial.

---

## 8.2. Tabla

```text id="yzd90z"
secure_document_versions
```

---

## 8.3. Campos

```text id="owu8ry"
SecureDocumentVersion
├── id
├── tenantId
├── documentId
├── versionNumber
├── status
├── title
├── description
├── changeReason
├── createdBy
├── archivedBy
├── createdAt
├── archivedAt
└── metadata
```

---

## 8.4. Reglas

* `tenantId` obligatorio.
* `documentId` obligatorio.
* `documentId` debe pertenecer al mismo tenant.
* `versionNumber` obligatorio e incremental por documento.
* `status` obligatorio.
* `title` recomendado.
* `changeReason` requerido para versiones posteriores a la primera.
* Una versión activa puede tener uno o más archivos, pero MVP recomienda un archivo principal activo por versión.
* No se elimina físicamente en operación ordinaria.

---

# 9. Entidad `SecureDocumentFile`

## 9.1. Propósito

Representa el archivo físico almacenado mediante un provider local, S3 o S3-compatible.

Contiene la referencia interna al objeto físico, hash, MIME type, tamaño, provider y estado.

---

## 9.2. Tabla

```text id="eg92vh"
secure_document_files
```

---

## 9.3. Campos

```text id="lrmow6"
SecureDocumentFile
├── id
├── tenantId
├── documentId
├── versionId
├── provider
├── storageKey
├── originalFileName
├── safeFileName
├── extension
├── mimeType
├── mimeGroup
├── fileSize
├── fileHash
├── hashAlgorithm
├── scanStatus
├── status
├── isPrimary
├── uploadedBy
├── generatedBy
├── archivedBy
├── uploadedAt
├── generatedAt
├── archivedAt
├── archiveReason
└── metadata
```

---

## 9.4. Reglas

* `tenantId` obligatorio.
* `documentId` obligatorio.
* `versionId` obligatorio.
* Todas las referencias deben pertenecer al mismo tenant.
* `storageKey` obligatorio para archivo almacenado.
* `storageKey` nunca se expone por API.
* `originalFileName` se conserva de forma segura.
* `safeFileName` obligatorio y generado por el servidor.
* `mimeType` obligatorio.
* `mimeGroup` recomendado para métricas seguras.
* `fileSize` obligatorio y mayor que cero.
* `fileHash` obligatorio cuando el archivo está `available` o `stored`.
* `hashAlgorithm` obligatorio cuando existe `fileHash`.
* `scanStatus` puede quedar `notRequired` en MVP.
* `status` obligatorio.
* `isPrimary` indica archivo principal de la versión.
* `uploadedBy` se usa para archivos subidos por usuario.
* `generatedBy` se usa para archivos generados por sistema.
* No se elimina físicamente por defecto.
* Descarga requiere autorización.

---

# 10. Entidad `SecureDocumentLink`

## 10.1. Propósito

Representa vínculos explícitos entre un documento y recursos de dominio.

Aunque `SecureDocument` contiene `sourceModule`, `sourceResourceType` y `sourceResourceId`, esta tabla permite asociar un documento a múltiples recursos.

Ejemplos:

```text id="lrth1g"
document -> payment
document -> paymentReceipt
document -> fine
document -> fineEvidence
document -> communication
document -> certifiedMinutes
document -> certifiedMinutesArtifact
document -> propertyUnit
document -> person
```

---

## 10.2. Tabla

```text id="g5ma98"
secure_document_links
```

---

## 10.3. Campos

```text id="oo65mb"
SecureDocumentLink
├── id
├── tenantId
├── documentId
├── sourceModule
├── resourceType
├── resourceId
├── linkType
├── createdBy
├── createdAt
├── archivedAt
└── metadata
```

---

## 10.4. Reglas

* `tenantId` obligatorio.
* `documentId` obligatorio.
* `documentId` debe pertenecer al mismo tenant.
* `sourceModule` obligatorio.
* `resourceType` obligatorio.
* `resourceId` obligatorio.
* `resourceId` debe validarse contra tenant mediante policy/adaptador del módulo origen.
* `linkType` permite clasificar el vínculo.
* No se elimina físicamente por defecto.
* No debe utilizarse para saltarse autorización del módulo origen.

---

# 11. Entidad `SecureDocumentPolicy`

## 11.1. Propósito

Representa reglas documentales asociadas a un documento.

En MVP será una política simple basada en visibilidad, sensibilidad, audience rules y delegación al módulo origen.

---

## 11.2. Tabla

```text id="xez6ir"
secure_document_policies
```

---

## 11.3. Campos

```text id="w8fxx0"
SecureDocumentPolicy
├── id
├── tenantId
├── documentId
├── policyType
├── visibility
├── sensitivity
├── audienceRules
├── sourceModuleDelegated
├── allowOwnerRead
├── allowOwnerDownload
├── allowAdminDownload
├── expiresAt
├── createdBy
├── updatedBy
├── archivedBy
├── createdAt
├── updatedAt
├── archivedAt
└── metadata
```

---

## 11.4. Reglas

* `tenantId` obligatorio.
* `documentId` obligatorio.
* `documentId` debe pertenecer al mismo tenant.
* `policyType` obligatorio.
* `visibility` obligatoria.
* `sensitivity` obligatoria.
* `audienceRules` opcional, requerida para visibilidades específicas.
* `sourceModuleDelegated = true` delega autorización al módulo origen.
* `expiresAt` opcional.
* Política expirada no autoriza descarga propia.
* No se elimina físicamente por defecto.
* No debe incluir datos sensibles innecesarios.

---

# 12. Entidad `SecureDocumentAccessLog`

## 12.1. Propósito

Registra accesos, descargas, previews, exports, archivos y restauraciones.

Complementa `AuditLog`, pero está optimizada para trazabilidad documental.

---

## 12.2. Tabla

```text id="zmumx3"
secure_document_access_logs
```

---

## 12.3. Campos

```text id="d9jhah"
SecureDocumentAccessLog
├── id
├── tenantId
├── documentId
├── versionId
├── fileId
├── actorUserId
├── accessType
├── outcome
├── sourceModule
├── sourceResourceType
├── sourceResourceId
├── ipAddressHash
├── userAgentHash
├── accessedAt
├── traceId
└── metadata
```

---

## 12.4. Reglas

* `tenantId` obligatorio cuando se resuelve tenant.
* `documentId` recomendado.
* `versionId` opcional.
* `fileId` opcional.
* `actorUserId` opcional para intentos no autenticados, pero los endpoints del módulo son privados.
* `accessType` obligatorio.
* `outcome` obligatorio.
* `sourceModule` recomendado.
* `sourceResourceId` recomendado.
* `ipAddressHash` opcional.
* `userAgentHash` opcional.
* `accessedAt` obligatorio.
* `traceId` recomendado.
* No registrar `storageKey`.
* No registrar URL firmada.
* No registrar contenido binario.
* No registrar base64.
* No registrar datos personales innecesarios.

---

# 13. Enums

## 13.1. DocumentStatus

```text id="qg5q6a"
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

## 13.2. DocumentVersionStatus

```text id="kqkm6i"
draft
active
superseded
archived
```

---

## 13.3. DocumentFileStatus

```text id="ac8dpq"
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

## 13.4. DocumentVisibility

```text id="xlmk64"
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

```text id="zkg5cx"
publicEligible no significa público. Solo indica que el documento podría ser publicado mediante una spec futura con políticas explícitas.
```

---

## 13.5. DocumentSensitivity

```text id="zywbrq"
low
internal
confidential
restricted
highlyRestricted
```

---

## 13.6. DocumentCategory

```text id="km0cou"
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

## 13.7. SourceModule

```text id="jjsd0r"
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

## 13.8. StorageProvider

```text id="v7zlid"
local
s3
s3Compatible
minio
other
```

---

## 13.9. FileScanStatus

```text id="hfvls3"
notRequired
pending
clean
suspicious
infected
failed
```

---

## 13.10. DocumentAccessType

```text id="noxsn1"
viewMetadata
download
preview
export
archive
restore
```

---

## 13.11. DocumentAccessOutcome

```text id="cx9ri4"
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

## 13.12. DocumentPolicyType

```text id="nl6hjl"
default
owner
audience
sourceDelegated
administrative
restricted
temporary
```

---

## 13.13. DocumentOwnerType

```text id="yapxc4"
user
person
propertyUnit
tenant
system
none
```

---

## 13.14. DocumentLinkType

```text id="l7wrus"
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

## 13.15. MimeGroup

```text id="r506vn"
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

## 13.16. HashAlgorithm

```text id="y7br9z"
SHA-256
```

Diferidos:

```text id="ot0op2"
SHA-512
BLAKE3
externalSignatureDigest
```

---

# 14. Modelo Prisma preliminar

## 14.1. Enums Prisma

```prisma id="cv7044"
enum DocumentStatus {
  DRAFT           @map("draft")
  UPLOADED        @map("uploaded")
  AVAILABLE       @map("available")
  QUARANTINED     @map("quarantined")
  REJECTED        @map("rejected")
  ARCHIVED        @map("archived")
  DELETED_PENDING @map("deletedPending")
  RESTORED        @map("restored")

  @@map("document_status")
}

enum DocumentVersionStatus {
  DRAFT      @map("draft")
  ACTIVE     @map("active")
  SUPERSEDED @map("superseded")
  ARCHIVED   @map("archived")

  @@map("document_version_status")
}

enum DocumentFileStatus {
  PENDING     @map("pending")
  STORED      @map("stored")
  AVAILABLE   @map("available")
  QUARANTINED @map("quarantined")
  REJECTED    @map("rejected")
  ARCHIVED    @map("archived")
  MISSING     @map("missing")
  FAILED      @map("failed")

  @@map("document_file_status")
}

enum DocumentVisibility {
  PRIVATE                  @map("private")
  ADMINISTRATIVE           @map("administrative")
  TENANT                   @map("tenant")
  OWNERS                   @map("owners")
  RESIDENTS                @map("residents")
  BOARD                    @map("board")
  MEETING_PARTICIPANTS     @map("meetingParticipants")
  SOURCE_RESOURCE_AUDIENCE @map("sourceResourceAudience")
  SPECIFIC_USERS           @map("specificUsers")
  PROPERTY_UNITS           @map("propertyUnits")
  ROLES                    @map("roles")
  MIXED                    @map("mixed")
  PUBLIC_ELIGIBLE          @map("publicEligible")

  @@map("document_visibility")
}

enum DocumentSensitivity {
  LOW               @map("low")
  INTERNAL          @map("internal")
  CONFIDENTIAL      @map("confidential")
  RESTRICTED        @map("restricted")
  HIGHLY_RESTRICTED @map("highlyRestricted")

  @@map("document_sensitivity")
}

enum DocumentCategory {
  PAYMENT_RECEIPT              @map("paymentReceipt")
  FINE_EVIDENCE                @map("fineEvidence")
  CERTIFIED_MINUTES_PDF        @map("certifiedMinutesPdf")
  CERTIFIED_MINUTES_ATTACHMENT @map("certifiedMinutesAttachment")
  COMMUNICATION_ATTACHMENT     @map("communicationAttachment")
  COMMUNICATION_IMAGE          @map("communicationImage")
  REPORT_EXPORT                @map("reportExport")
  ADMINISTRATIVE_DOCUMENT      @map("administrativeDocument")
  PROPERTY_DOCUMENT            @map("propertyDocument")
  RESIDENT_DOCUMENT            @map("residentDocument")
  MEETING_DOCUMENT             @map("meetingDocument")
  SYSTEM_GENERATED             @map("systemGenerated")
  OTHER                        @map("other")

  @@map("document_category")
}

enum SourceModule {
  PAYMENTS              @map("payments")
  FINES                 @map("fines")
  COMMUNICATIONS        @map("communications")
  MEETINGS              @map("meetings")
  CERTIFIED_MINUTES     @map("certifiedMinutes")
  REPORTS               @map("reports")
  RESIDENTS_PROPERTIES  @map("residentsProperties")
  TENANTS               @map("tenants")
  SYSTEM                @map("system")
  OTHER                 @map("other")

  @@map("source_module")
}

enum StorageProvider {
  LOCAL         @map("local")
  S3            @map("s3")
  S3_COMPATIBLE @map("s3Compatible")
  MINIO         @map("minio")
  OTHER         @map("other")

  @@map("storage_provider")
}

enum FileScanStatus {
  NOT_REQUIRED @map("notRequired")
  PENDING      @map("pending")
  CLEAN        @map("clean")
  SUSPICIOUS   @map("suspicious")
  INFECTED     @map("infected")
  FAILED       @map("failed")

  @@map("file_scan_status")
}

enum DocumentAccessType {
  VIEW_METADATA @map("viewMetadata")
  DOWNLOAD      @map("download")
  PREVIEW       @map("preview")
  EXPORT        @map("export")
  ARCHIVE       @map("archive")
  RESTORE       @map("restore")

  @@map("document_access_type")
}

enum DocumentAccessOutcome {
  ALLOWED     @map("allowed")
  DENIED      @map("denied")
  NOT_FOUND   @map("notFound")
  EXPIRED     @map("expired")
  REVOKED     @map("revoked")
  QUARANTINED @map("quarantined")
  REJECTED    @map("rejected")
  ARCHIVED    @map("archived")
  ERROR       @map("error")

  @@map("document_access_outcome")
}

enum DocumentPolicyType {
  DEFAULT          @map("default")
  OWNER            @map("owner")
  AUDIENCE         @map("audience")
  SOURCE_DELEGATED @map("sourceDelegated")
  ADMINISTRATIVE   @map("administrative")
  RESTRICTED       @map("restricted")
  TEMPORARY        @map("temporary")

  @@map("document_policy_type")
}

enum DocumentOwnerType {
  USER          @map("user")
  PERSON        @map("person")
  PROPERTY_UNIT @map("propertyUnit")
  TENANT         @map("tenant")
  SYSTEM         @map("system")
  NONE           @map("none")

  @@map("document_owner_type")
}

enum DocumentLinkType {
  SOURCE         @map("source")
  SUPPORTING     @map("supporting")
  GENERATED_FROM @map("generatedFrom")
  ATTACHMENT_OF  @map("attachmentOf")
  EVIDENCE_OF    @map("evidenceOf")
  RECEIPT_OF     @map("receiptOf")
  EXPORT_OF      @map("exportOf")
  RELATED_TO     @map("relatedTo")

  @@map("document_link_type")
}

enum MimeGroup {
  PDF         @map("pdf")
  IMAGE       @map("image")
  DOCUMENT    @map("document")
  SPREADSHEET @map("spreadsheet")
  CSV         @map("csv")
  JSON        @map("json")
  TEXT        @map("text")
  OTHER       @map("other")

  @@map("mime_group")
}

enum HashAlgorithm {
  SHA_256 @map("SHA-256")

  @@map("hash_algorithm")
}
```

---

## 14.2. Modelo `SecureDocument`

```prisma id="p0szm9"
model SecureDocument {
  id                   String              @id @default(uuid())
  tenantId             String              @map("tenant_id")

  title                String
  description          String?

  status               DocumentStatus      @default(DRAFT)
  visibility           DocumentVisibility
  sensitivity          DocumentSensitivity
  category             DocumentCategory
  sourceModule         SourceModule        @map("source_module")
  sourceResourceType   String?             @map("source_resource_type")
  sourceResourceId     String?             @map("source_resource_id")

  ownerType            DocumentOwnerType   @default(NONE) @map("owner_type")
  ownerUserId          String?             @map("owner_user_id")
  ownerPersonId        String?             @map("owner_person_id")
  ownerPropertyUnitId  String?             @map("owner_property_unit_id")

  currentVersionId     String?             @map("current_version_id")
  activeFileId         String?             @map("active_file_id")

  createdBy            String?             @map("created_by")
  updatedBy            String?             @map("updated_by")
  archivedBy           String?             @map("archived_by")
  restoredBy           String?             @map("restored_by")

  createdAt            DateTime            @default(now()) @map("created_at")
  updatedAt            DateTime            @updatedAt @map("updated_at")
  archivedAt           DateTime?           @map("archived_at")
  restoredAt           DateTime?           @map("restored_at")
  archiveReason        String?             @map("archive_reason")

  metadata             Json?

  tenant               Tenant              @relation(fields: [tenantId], references: [id], onDelete: Restrict)

  ownerUser            UserProfile?        @relation("SecureDocumentOwnerUser", fields: [ownerUserId], references: [id], onDelete: Restrict)
  ownerPerson          Person?             @relation("SecureDocumentOwnerPerson", fields: [ownerPersonId], references: [id], onDelete: Restrict)
  ownerPropertyUnit    PropertyUnit?       @relation("SecureDocumentOwnerPropertyUnit", fields: [ownerPropertyUnitId], references: [id], onDelete: Restrict)

  createdByUser        UserProfile?        @relation("SecureDocumentCreatedBy", fields: [createdBy], references: [id], onDelete: Restrict)
  updatedByUser        UserProfile?        @relation("SecureDocumentUpdatedBy", fields: [updatedBy], references: [id], onDelete: Restrict)
  archivedByUser       UserProfile?        @relation("SecureDocumentArchivedBy", fields: [archivedBy], references: [id], onDelete: Restrict)
  restoredByUser       UserProfile?        @relation("SecureDocumentRestoredBy", fields: [restoredBy], references: [id], onDelete: Restrict)

  versions             SecureDocumentVersion[]
  files                SecureDocumentFile[]
  links                SecureDocumentLink[]
  policies             SecureDocumentPolicy[]
  accessLogs           SecureDocumentAccessLog[]

  @@index([tenantId])
  @@index([tenantId, status])
  @@index([tenantId, visibility])
  @@index([tenantId, sensitivity])
  @@index([tenantId, category])
  @@index([tenantId, sourceModule])
  @@index([tenantId, sourceModule, sourceResourceType, sourceResourceId])
  @@index([tenantId, ownerType])
  @@index([tenantId, ownerUserId])
  @@index([tenantId, ownerPersonId])
  @@index([tenantId, ownerPropertyUnitId])
  @@index([tenantId, currentVersionId])
  @@index([tenantId, activeFileId])
  @@index([tenantId, createdAt])
  @@index([tenantId, archivedAt])
  @@map("secure_documents")
}
```

Nota:

```text id="n95yyb"
currentVersionId y activeFileId se modelan como IDs sin relation directa para evitar ciclos Prisma innecesarios. La integridad debe validarse en servicio y puede reforzarse con constraints raw si se requiere.
```

---

## 14.3. Modelo `SecureDocumentVersion`

```prisma id="zjw88j"
model SecureDocumentVersion {
  id             String                @id @default(uuid())
  tenantId       String                @map("tenant_id")
  documentId     String                @map("document_id")

  versionNumber  Int                   @map("version_number")
  status         DocumentVersionStatus @default(DRAFT)

  title          String?
  description    String?
  changeReason   String?               @map("change_reason")

  createdBy      String?               @map("created_by")
  archivedBy     String?               @map("archived_by")

  createdAt      DateTime              @default(now()) @map("created_at")
  archivedAt     DateTime?             @map("archived_at")

  metadata       Json?

  tenant         Tenant                @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  document       SecureDocument        @relation(fields: [documentId], references: [id], onDelete: Restrict)

  createdByUser  UserProfile?          @relation("SecureDocumentVersionCreatedBy", fields: [createdBy], references: [id], onDelete: Restrict)
  archivedByUser UserProfile?          @relation("SecureDocumentVersionArchivedBy", fields: [archivedBy], references: [id], onDelete: Restrict)

  files          SecureDocumentFile[]
  accessLogs     SecureDocumentAccessLog[]

  @@unique([tenantId, documentId, versionNumber])
  @@index([tenantId])
  @@index([tenantId, documentId])
  @@index([tenantId, status])
  @@index([tenantId, versionNumber])
  @@index([tenantId, createdAt])
  @@index([tenantId, archivedAt])
  @@map("secure_document_versions")
}
```

---

## 14.4. Modelo `SecureDocumentFile`

```prisma id="y73vjf"
model SecureDocumentFile {
  id               String             @id @default(uuid())
  tenantId         String             @map("tenant_id")
  documentId       String             @map("document_id")
  versionId        String             @map("version_id")

  provider         StorageProvider
  storageKey       String             @map("storage_key")

  originalFileName String             @map("original_file_name")
  safeFileName     String             @map("safe_file_name")
  extension        String?
  mimeType         String             @map("mime_type")
  mimeGroup        MimeGroup          @default(OTHER) @map("mime_group")
  fileSize         Int                @map("file_size")

  fileHash         String?            @map("file_hash")
  hashAlgorithm    HashAlgorithm?     @map("hash_algorithm")

  scanStatus       FileScanStatus     @default(NOT_REQUIRED) @map("scan_status")
  status           DocumentFileStatus @default(PENDING)
  isPrimary        Boolean            @default(false) @map("is_primary")

  uploadedBy       String?            @map("uploaded_by")
  generatedBy      String?            @map("generated_by")
  archivedBy       String?            @map("archived_by")

  uploadedAt       DateTime?          @map("uploaded_at")
  generatedAt      DateTime?          @map("generated_at")
  archivedAt       DateTime?          @map("archived_at")
  archiveReason    String?            @map("archive_reason")

  metadata         Json?

  tenant           Tenant             @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  document         SecureDocument     @relation(fields: [documentId], references: [id], onDelete: Restrict)
  version          SecureDocumentVersion @relation(fields: [versionId], references: [id], onDelete: Restrict)

  uploadedByUser   UserProfile?       @relation("SecureDocumentFileUploadedBy", fields: [uploadedBy], references: [id], onDelete: Restrict)
  archivedByUser   UserProfile?       @relation("SecureDocumentFileArchivedBy", fields: [archivedBy], references: [id], onDelete: Restrict)

  accessLogs       SecureDocumentAccessLog[]

  @@index([tenantId])
  @@index([tenantId, documentId])
  @@index([tenantId, versionId])
  @@index([tenantId, provider])
  @@index([tenantId, status])
  @@index([tenantId, scanStatus])
  @@index([tenantId, isPrimary])
  @@index([tenantId, mimeType])
  @@index([tenantId, mimeGroup])
  @@index([tenantId, fileHash])
  @@index([tenantId, uploadedAt])
  @@index([tenantId, generatedAt])
  @@index([tenantId, archivedAt])
  @@map("secure_document_files")
}
```

---

## 14.5. Modelo `SecureDocumentLink`

```prisma id="lcw1qj"
model SecureDocumentLink {
  id             String           @id @default(uuid())
  tenantId       String           @map("tenant_id")
  documentId     String           @map("document_id")

  sourceModule   SourceModule     @map("source_module")
  resourceType   String           @map("resource_type")
  resourceId     String           @map("resource_id")
  linkType       DocumentLinkType @default(RELATED_TO) @map("link_type")

  createdBy      String?          @map("created_by")
  createdAt      DateTime         @default(now()) @map("created_at")
  archivedAt     DateTime?        @map("archived_at")

  metadata       Json?

  tenant         Tenant           @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  document       SecureDocument   @relation(fields: [documentId], references: [id], onDelete: Restrict)

  createdByUser  UserProfile?     @relation("SecureDocumentLinkCreatedBy", fields: [createdBy], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([tenantId, documentId])
  @@index([tenantId, sourceModule])
  @@index([tenantId, sourceModule, resourceType, resourceId])
  @@index([tenantId, resourceType, resourceId])
  @@index([tenantId, linkType])
  @@index([tenantId, createdAt])
  @@index([tenantId, archivedAt])
  @@map("secure_document_links")
}
```

---

## 14.6. Modelo `SecureDocumentPolicy`

```prisma id="abnoaq"
model SecureDocumentPolicy {
  id                    String              @id @default(uuid())
  tenantId              String              @map("tenant_id")
  documentId            String              @map("document_id")

  policyType            DocumentPolicyType  @default(DEFAULT) @map("policy_type")
  visibility            DocumentVisibility
  sensitivity           DocumentSensitivity

  audienceRules         Json?               @map("audience_rules")
  sourceModuleDelegated Boolean             @default(false) @map("source_module_delegated")

  allowOwnerRead        Boolean             @default(false) @map("allow_owner_read")
  allowOwnerDownload    Boolean             @default(false) @map("allow_owner_download")
  allowAdminDownload    Boolean             @default(true) @map("allow_admin_download")

  expiresAt             DateTime?           @map("expires_at")

  createdBy             String?             @map("created_by")
  updatedBy             String?             @map("updated_by")
  archivedBy            String?             @map("archived_by")

  createdAt             DateTime            @default(now()) @map("created_at")
  updatedAt             DateTime            @updatedAt @map("updated_at")
  archivedAt            DateTime?           @map("archived_at")

  metadata              Json?

  tenant                Tenant              @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  document              SecureDocument      @relation(fields: [documentId], references: [id], onDelete: Restrict)

  createdByUser         UserProfile?        @relation("SecureDocumentPolicyCreatedBy", fields: [createdBy], references: [id], onDelete: Restrict)
  updatedByUser         UserProfile?        @relation("SecureDocumentPolicyUpdatedBy", fields: [updatedBy], references: [id], onDelete: Restrict)
  archivedByUser        UserProfile?        @relation("SecureDocumentPolicyArchivedBy", fields: [archivedBy], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([tenantId, documentId])
  @@index([tenantId, policyType])
  @@index([tenantId, visibility])
  @@index([tenantId, sensitivity])
  @@index([tenantId, sourceModuleDelegated])
  @@index([tenantId, expiresAt])
  @@index([tenantId, archivedAt])
  @@map("secure_document_policies")
}
```

---

## 14.7. Modelo `SecureDocumentAccessLog`

```prisma id="hluddo"
model SecureDocumentAccessLog {
  id                 String                @id @default(uuid())
  tenantId           String                @map("tenant_id")

  documentId         String?               @map("document_id")
  versionId          String?               @map("version_id")
  fileId             String?               @map("file_id")

  actorUserId        String?               @map("actor_user_id")

  accessType         DocumentAccessType    @map("access_type")
  outcome            DocumentAccessOutcome

  sourceModule       SourceModule?         @map("source_module")
  sourceResourceType String?               @map("source_resource_type")
  sourceResourceId   String?               @map("source_resource_id")

  ipAddressHash      String?               @map("ip_address_hash")
  userAgentHash      String?               @map("user_agent_hash")

  accessedAt         DateTime              @default(now()) @map("accessed_at")
  traceId            String?               @map("trace_id")

  metadata           Json?

  tenant             Tenant                @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  document           SecureDocument?       @relation(fields: [documentId], references: [id], onDelete: Restrict)
  version            SecureDocumentVersion? @relation(fields: [versionId], references: [id], onDelete: Restrict)
  file               SecureDocumentFile?   @relation(fields: [fileId], references: [id], onDelete: Restrict)
  actorUser          UserProfile?          @relation("SecureDocumentAccessActor", fields: [actorUserId], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([tenantId, documentId])
  @@index([tenantId, versionId])
  @@index([tenantId, fileId])
  @@index([tenantId, actorUserId])
  @@index([tenantId, accessType])
  @@index([tenantId, outcome])
  @@index([tenantId, sourceModule])
  @@index([tenantId, sourceModule, sourceResourceType, sourceResourceId])
  @@index([tenantId, accessedAt])
  @@index([tenantId, traceId])
  @@map("secure_document_access_logs")
}
```

---

# 15. Relaciones requeridas en modelos existentes

## 15.1. Tenant

```prisma id="lx5e50"
model Tenant {
  // campos existentes...

  secureDocuments       SecureDocument[]
  secureDocumentVersions SecureDocumentVersion[]
  secureDocumentFiles   SecureDocumentFile[]
  secureDocumentLinks   SecureDocumentLink[]
  secureDocumentPolicies SecureDocumentPolicy[]
  secureDocumentAccessLogs SecureDocumentAccessLog[]
}
```

---

## 15.2. UserProfile

```prisma id="jgviju"
model UserProfile {
  // campos existentes...

  secureDocumentsOwned       SecureDocument[] @relation("SecureDocumentOwnerUser")
  secureDocumentsCreated     SecureDocument[] @relation("SecureDocumentCreatedBy")
  secureDocumentsUpdated     SecureDocument[] @relation("SecureDocumentUpdatedBy")
  secureDocumentsArchived    SecureDocument[] @relation("SecureDocumentArchivedBy")
  secureDocumentsRestored    SecureDocument[] @relation("SecureDocumentRestoredBy")

  secureDocumentVersionsCreated  SecureDocumentVersion[] @relation("SecureDocumentVersionCreatedBy")
  secureDocumentVersionsArchived SecureDocumentVersion[] @relation("SecureDocumentVersionArchivedBy")

  secureDocumentFilesUploaded SecureDocumentFile[] @relation("SecureDocumentFileUploadedBy")
  secureDocumentFilesArchived SecureDocumentFile[] @relation("SecureDocumentFileArchivedBy")

  secureDocumentLinksCreated SecureDocumentLink[] @relation("SecureDocumentLinkCreatedBy")

  secureDocumentPoliciesCreated  SecureDocumentPolicy[] @relation("SecureDocumentPolicyCreatedBy")
  secureDocumentPoliciesUpdated  SecureDocumentPolicy[] @relation("SecureDocumentPolicyUpdatedBy")
  secureDocumentPoliciesArchived SecureDocumentPolicy[] @relation("SecureDocumentPolicyArchivedBy")

  secureDocumentAccessLogs SecureDocumentAccessLog[] @relation("SecureDocumentAccessActor")
}
```

---

## 15.3. Person

```prisma id="edg6kd"
model Person {
  // campos existentes...

  secureDocumentsOwned SecureDocument[] @relation("SecureDocumentOwnerPerson")
}
```

---

## 15.4. PropertyUnit

```prisma id="ws2oqd"
model PropertyUnit {
  // campos existentes...

  secureDocumentsOwned SecureDocument[] @relation("SecureDocumentOwnerPropertyUnit")
}
```

---

# 16. Constraints recomendadas

## 16.1. `secure_documents`

```text id="zjls9z"
tenant_id NOT NULL
title NOT NULL
status NOT NULL
visibility NOT NULL
sensitivity NOT NULL
category NOT NULL
source_module NOT NULL
owner_user_id debe pertenecer al tenant si existe
owner_person_id debe pertenecer al tenant si existe
owner_property_unit_id debe pertenecer al tenant si existe
current_version_id debe pertenecer al mismo document y tenant si existe
active_file_id debe pertenecer al mismo document y tenant si existe
status = archived requiere archived_at
status = restored requiere restored_at
metadata debe estar sanitizada
```

---

## 16.2. `secure_document_versions`

```text id="xvjwk8"
tenant_id NOT NULL
document_id NOT NULL
version_number NOT NULL
status NOT NULL
UNIQUE (tenant_id, document_id, version_number)
version_number > 0
change_reason requerido para version_number > 1
archived_at requerido si status = archived
metadata debe estar sanitizada
```

---

## 16.3. `secure_document_files`

```text id="lqpciz"
tenant_id NOT NULL
document_id NOT NULL
version_id NOT NULL
provider NOT NULL
storage_key NOT NULL
original_file_name NOT NULL
safe_file_name NOT NULL
mime_type NOT NULL
mime_group NOT NULL
file_size NOT NULL
file_size > 0
file_hash requerido si status IN stored, available
hash_algorithm requerido si file_hash existe
status NOT NULL
scan_status NOT NULL
version_id debe pertenecer al document_id
storage_key no se acepta desde cliente
metadata debe estar sanitizada
```

---

## 16.4. `secure_document_links`

```text id="ws8umz"
tenant_id NOT NULL
document_id NOT NULL
source_module NOT NULL
resource_type NOT NULL
resource_id NOT NULL
link_type NOT NULL
resource_id debe validarse contra tenant por servicio
metadata debe estar sanitizada
```

---

## 16.5. `secure_document_policies`

```text id="tivrt3"
tenant_id NOT NULL
document_id NOT NULL
policy_type NOT NULL
visibility NOT NULL
sensitivity NOT NULL
audience_rules requerido para specificUsers, propertyUnits, roles, mixed
expires_at debe ser futuro al crear si existe
metadata debe estar sanitizada
```

---

## 16.6. `secure_document_access_logs`

```text id="ns0m2w"
tenant_id NOT NULL
access_type NOT NULL
outcome NOT NULL
accessed_at NOT NULL
metadata sanitizada
no storage_key
no URL firmada
no binario
no base64
no contenido completo del archivo
```

---

# 17. Índices recomendados

## 17.1. `secure_documents`

```text id="fe7xvn"
tenant_id
tenant_id + status
tenant_id + visibility
tenant_id + sensitivity
tenant_id + category
tenant_id + source_module
tenant_id + source_module + source_resource_type + source_resource_id
tenant_id + owner_type
tenant_id + owner_user_id
tenant_id + owner_person_id
tenant_id + owner_property_unit_id
tenant_id + current_version_id
tenant_id + active_file_id
tenant_id + created_at
tenant_id + archived_at
```

---

## 17.2. `secure_document_versions`

```text id="ktcq6o"
tenant_id
tenant_id + document_id
tenant_id + document_id + version_number unique
tenant_id + status
tenant_id + version_number
tenant_id + created_at
tenant_id + archived_at
```

---

## 17.3. `secure_document_files`

```text id="szfh1k"
tenant_id
tenant_id + document_id
tenant_id + version_id
tenant_id + provider
tenant_id + status
tenant_id + scan_status
tenant_id + is_primary
tenant_id + mime_type
tenant_id + mime_group
tenant_id + file_hash
tenant_id + uploaded_at
tenant_id + generated_at
tenant_id + archived_at
```

---

## 17.4. `secure_document_links`

```text id="wxeaqq"
tenant_id
tenant_id + document_id
tenant_id + source_module
tenant_id + source_module + resource_type + resource_id
tenant_id + resource_type + resource_id
tenant_id + link_type
tenant_id + created_at
tenant_id + archived_at
```

---

## 17.5. `secure_document_policies`

```text id="efvilv"
tenant_id
tenant_id + document_id
tenant_id + policy_type
tenant_id + visibility
tenant_id + sensitivity
tenant_id + source_module_delegated
tenant_id + expires_at
tenant_id + archived_at
```

---

## 17.6. `secure_document_access_logs`

```text id="iuzann"
tenant_id
tenant_id + document_id
tenant_id + version_id
tenant_id + file_id
tenant_id + actor_user_id
tenant_id + access_type
tenant_id + outcome
tenant_id + source_module
tenant_id + source_module + source_resource_type + source_resource_id
tenant_id + accessed_at
tenant_id + trace_id
```

---

# 18. Índices parciales raw recomendados

## 18.1. Un archivo primario activo por versión

```sql id="d1aqi7"
CREATE UNIQUE INDEX secure_document_files_one_primary_active_per_version
ON secure_document_files(tenant_id, version_id)
WHERE is_primary = true
  AND archived_at IS NULL
  AND status IN ('stored', 'available');
```

---

## 18.2. Una versión activa por documento

```sql id="jvvptp"
CREATE UNIQUE INDEX secure_document_versions_one_active_per_document
ON secure_document_versions(tenant_id, document_id)
WHERE status = 'active'
  AND archived_at IS NULL;
```

---

## 18.3. Storage key único por provider

```sql id="ru2xm3"
CREATE UNIQUE INDEX secure_document_files_unique_storage_key_per_provider
ON secure_document_files(provider, storage_key)
WHERE archived_at IS NULL;
```

---

## 18.4. Un vínculo source activo por documento y recurso

```sql id="f0hsy0"
CREATE UNIQUE INDEX secure_document_links_unique_active_source_link
ON secure_document_links(tenant_id, document_id, source_module, resource_type, resource_id, link_type)
WHERE archived_at IS NULL;
```

---

# 19. Reglas de multitenancy

Todas las tablas nuevas tienen `tenant_id`.

Regla obligatoria:

```text id="br30hl"
Toda consulta tenant-scoped debe filtrar por tenant_id.
```

Patrón requerido:

```typescript id="kaancg"
await prisma.secureDocument.findFirst({
  where: {
    id: documentId,
    tenantId: currentTenant.id,
    archivedAt: null
  }
});
```

Patrón prohibido:

```typescript id="kbvmzz"
await prisma.secureDocument.findUnique({
  where: { id: documentId }
});
```

También prohibido:

```typescript id="yjuaeh"
await prisma.secureDocumentVersion.findUnique({ where: { id: versionId } });
await prisma.secureDocumentFile.findUnique({ where: { id: fileId } });
await prisma.secureDocumentLink.findUnique({ where: { id: linkId } });
await prisma.secureDocumentPolicy.findUnique({ where: { id: policyId } });
await prisma.secureDocumentAccessLog.findUnique({ where: { id: accessLogId } });
```

Validaciones cross-tenant obligatorias:

```text id="ultbsl"
sourceResourceId
ownerUserId
ownerPersonId
ownerPropertyUnitId
audienceRules.userIds
audienceRules.personIds si se agregan
audienceRules.propertyUnitIds
audienceRules.roleIds
documentId
versionId
fileId
linkId
policyId
```

---

# 20. Reglas de source resource

## 20.1. Campos principales

```text id="kuxat5"
sourceModule
sourceResourceType
sourceResourceId
```

Ejemplos:

```json id="zshh5f"
{
  "sourceModule": "payments",
  "sourceResourceType": "paymentReceipt",
  "sourceResourceId": "payment_receipt_uuid"
}
```

```json id="cg1pup"
{
  "sourceModule": "certifiedMinutes",
  "sourceResourceType": "certifiedMinutesArtifact",
  "sourceResourceId": "artifact_uuid"
}
```

---

## 20.2. Validación

Cada combinación debe validarse mediante un adaptador:

```text id="yjuinh"
payments -> PaymentDocumentSourceValidator
fines -> FineDocumentSourceValidator
communications -> CommunicationDocumentSourceValidator
certifiedMinutes -> CertifiedMinutesDocumentSourceValidator
reports -> ReportDocumentSourceValidator
residentsProperties -> ResidentsPropertiesDocumentSourceValidator
tenants -> TenantDocumentSourceValidator
```

---

## 20.3. Regla de no confianza

No confiar solo en `sourceModule` y `sourceResourceId`.

Regla:

```text id="k7t7b8"
sourceResourceId debe verificarse contra tenant_id antes de crear, leer, descargar, archivar o restaurar documentos vinculados.
```

---

# 21. Reglas de owner lógico

## 21.1. Tipos de owner

```text id="earhex"
user
person
propertyUnit
tenant
system
none
```

---

## 21.2. Uso recomendado

| OwnerType      | Uso                                      |
| -------------- | ---------------------------------------- |
| `user`         | Documento propio cargado por usuario     |
| `person`       | Documento asociado a persona             |
| `propertyUnit` | Documento asociado a unidad habitacional |
| `tenant`       | Documento general del conjunto           |
| `system`       | Documento generado automáticamente       |
| `none`         | Sin owner propio directo                 |

---

## 21.3. Validación

```text id="vn9xgt"
ownerUserId debe pertenecer al tenant si ownerType = user
ownerPersonId debe pertenecer al tenant si ownerType = person
ownerPropertyUnitId debe pertenecer al tenant si ownerType = propertyUnit
ownerType = tenant no requiere owner específico
ownerType = system requiere sourceModule = system o generatedBy
```

---

# 22. Reglas de política documental

## 22.1. Visibilidad

```text id="njxhzo"
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

---

## 22.2. Sensibilidad

```text id="cm40tu"
low
internal
confidential
restricted
highlyRestricted
```

---

## 22.3. `audienceRules`

Ejemplo para usuarios específicos:

```json id="dvwgtq"
{
  "userIds": [
    "user_uuid_1",
    "user_uuid_2"
  ]
}
```

Ejemplo para unidades:

```json id="xpvzud"
{
  "propertyUnitIds": [
    "property_unit_uuid_1",
    "property_unit_uuid_2"
  ]
}
```

Ejemplo para roles:

```json id="bsxmvp"
{
  "roleIds": [
    "role_uuid_1",
    "role_uuid_2"
  ]
}
```

Ejemplo mixed:

```json id="zbswet"
{
  "owners": true,
  "residents": false,
  "roleIds": [
    "role_uuid_1"
  ],
  "propertyUnitIds": [
    "property_unit_uuid_1"
  ],
  "userIds": [
    "user_uuid_1"
  ]
}
```

Regla:

```text id="nz4p9l"
Todos los IDs dentro de audienceRules deben validarse contra tenant_id.
```

---

## 22.4. Delegación al módulo origen

Cuando:

```text id="q8bmnv"
visibility = sourceResourceAudience
OR sourceModuleDelegated = true
```

la autorización se delega al módulo origen.

Ejemplo:

```text id="z3vkxp"
Certified Minutes decide si un usuario puede descargar el PDF de un acta publicada.
Payments decide si un usuario puede descargar un comprobante propio.
Fines decide si un usuario puede ver evidencia asociada a una multa.
```

---

# 23. Reglas de storage

## 23.1. `storageKey`

`storageKey` se persiste internamente, pero nunca debe exponerse.

Formato recomendado:

```text id="hjwky4"
documents/{tenantId}/{sourceModule}/{documentId}/versions/{versionId}/files/{fileId}/{safeFileName}
```

---

## 23.2. Prohibido

```text id="ftr080"
storageKey en API response
storageKey en error
storageKey en audit metadata
storageKey en logs
storageKey en notification payload
URL firmada persistente
bucket público
ACL pública
path enviado por cliente
path traversal
filename original usado como ruta completa
```

---

## 23.3. Provider

MVP soporta:

```text id="xpzdu9"
local para desarrollo
mock para tests
s3Compatible preparado para producción
```

---

## 23.4. Descarga

La descarga debe resolverse mediante:

```text id="fdfoob"
streaming controlado por API
o URL temporal corta generada después de autorización
```

Reglas:

```text id="w1s05x"
- validar tenant;
- validar permiso;
- validar owner/audience/source policy;
- validar estado del archivo;
- validar estado del documento;
- registrar access log;
- auditar descarga;
- no registrar URL temporal completa;
- no persistir URL temporal.
```

---

# 24. Reglas de hash

## 24.1. Algoritmo MVP

```text id="uvmkq5"
SHA-256
```

---

## 24.2. Hash de archivo

```text id="j8sktt"
fileHash = SHA-256(binary file)
```

---

## 24.3. Exposición

DTO estándar puede devolver:

```text id="ou5qsy"
hashPrefix
hashAlgorithm
```

No devolver por DTO estándar:

```text id="nkijkg"
fileHash completo
```

---

## 24.4. Reglas

```text id="ed18wc"
- archivo available requiere hash;
- archivo stored requiere hash si el binario está disponible;
- hash se calcula en servidor;
- hash no se acepta desde cliente salvo flujo interno de sistema controlado;
- hash de upload debe calcularse sobre bytes reales almacenados;
- descarga puede verificar hash si la política lo requiere.
```

---

# 25. Reglas de archivos

## 25.1. MIME types base permitidos

```text id="gx8bhr"
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

## 25.2. MIME types bloqueados por defecto

```text id="pan8q1"
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

## 25.3. Tamaños sugeridos

```text id="o6gju5"
defaultMaxFileSizeMb = 20
imageMaxFileSizeMb = 10
reportExportMaxFileSizeMb = 50
```

---

## 25.4. Validaciones

```text id="fzljkd"
fileName no vacío
safeFileName generado por servidor
extension permitida
mimeType permitido
mimeType coherente con extensión
magic bytes si aplica
fileSize > 0
fileSize <= límite configurado
storageKey ausente en request
path traversal bloqueado
hash calculado
scanStatus válido
```

---

# 26. DTOs derivados del modelo

## 26.1. SecureDocumentAdminDto

```text id="bivstf"
id
title
description
status
visibility
sensitivity
category
sourceModule
sourceResourceType
sourceResourceId
ownerType
ownerUserId
ownerPersonId
ownerPropertyUnitId
currentVersionId
activeFileId
createdAt
updatedAt
archivedAt
restoredAt
archiveReason
metadata
```

No incluye:

```text id="kwuphx"
storageKey
URL firmada
contenido binario
base64
hash completo
provider secrets
```

---

## 26.2. SecureDocumentListItemDto

```text id="x24ccr"
id
title
status
visibility
sensitivity
category
sourceModule
sourceResourceType
sourceResourceId
ownerType
currentVersionId
activeFileId
createdAt
updatedAt
archivedAt
```

---

## 26.3. SecureDocumentVersionDto

```text id="g5qc16"
id
documentId
versionNumber
status
title
description
changeReason
createdAt
archivedAt
metadata
```

---

## 26.4. SecureDocumentFileDto

```text id="zgm76h"
id
documentId
versionId
provider
originalFileName
safeFileName
extension
mimeType
mimeGroup
fileSize
hashPrefix
hashAlgorithm
scanStatus
status
isPrimary
uploadedAt
generatedAt
archivedAt
archiveReason
metadata
```

No incluye:

```text id="swuabu"
storageKey
bucket
path interno
URL persistente
URL temporal persistida
provider payload sensible
```

---

## 26.5. SecureDocumentLinkDto

```text id="x053hb"
id
documentId
sourceModule
resourceType
resourceId
linkType
createdAt
archivedAt
metadata
```

---

## 26.6. SecureDocumentPolicyDto

```text id="tlo8ow"
id
documentId
policyType
visibility
sensitivity
audienceRules
sourceModuleDelegated
allowOwnerRead
allowOwnerDownload
allowAdminDownload
expiresAt
createdAt
updatedAt
archivedAt
metadata
```

Nota:

```text id="d5ygu9"
En endpoints /me, audienceRules debe ocultarse o minimizarse si revela terceros.
```

---

## 26.7. SecureDocumentAccessLogDto

```text id="l2vejk"
id
documentId
versionId
fileId
actorUserId
accessType
outcome
sourceModule
sourceResourceType
sourceResourceId
accessedAt
traceId
metadata
```

No incluye:

```text id="uzrko7"
ipAddressHash salvo permiso explícito
userAgentHash salvo permiso explícito
storageKey
URL firmada
contenido binario
base64
```

---

## 26.8. OwnSecureDocumentDto

```text id="e2nqzq"
id
title
description
status
visibility
sensitivity
category
sourceModule
sourceResourceType
sourceResourceId
createdAt
updatedAt
activeFile
```

No incluye:

```text id="wqee8e"
storageKey
URL persistente
auditoría
metadata interna sensible
policies internas completas
audienceRules completas
archived por defecto
quarantined
rejected
```

---

## 26.9. OwnSecureDocumentFileDto

```text id="fz8jha"
id
documentId
versionId
originalFileName
safeFileName
extension
mimeType
mimeGroup
fileSize
hashPrefix
hashAlgorithm
status
downloadAvailable
uploadedAt
generatedAt
```

---

# 27. Reglas de consulta

## 27.1. Filtros administrativos

```text id="ydjzqf"
status
visibility
sensitivity
category
sourceModule
sourceResourceType
sourceResourceId
ownerType
ownerUserId
ownerPersonId
ownerPropertyUnitId
mimeType
mimeGroup
createdFrom
createdTo
uploadedFrom
uploadedTo
archived
q
page
pageSize
sortBy
sortOrder
```

Sort permitido:

```text id="yidat2"
createdAt
updatedAt
title
status
category
sensitivity
sourceModule
archivedAt
```

---

## 27.2. Filtros propios `/me`

```text id="ovkbto"
category
sourceModule
visibility
createdFrom
createdTo
q
page
pageSize
sortBy
sortOrder
```

Regla:

```text id="kgzr9f"
Los filtros /me nunca deben ampliar el acceso; solo reducen el conjunto ya autorizado.
```

---

## 27.3. Filtros de archivos

```text id="nmd1nw"
status
scanStatus
mimeType
mimeGroup
provider
isPrimary
uploadedFrom
uploadedTo
generatedFrom
generatedTo
page
pageSize
```

---

## 27.4. Filtros de access logs

```text id="epav5k"
documentId
fileId
actorUserId
accessType
outcome
sourceModule
sourceResourceType
sourceResourceId
accessedFrom
accessedTo
page
pageSize
```

---

# 28. Queries conceptuales

## 28.1. Listar documentos administrativos

```sql id="e22cbx"
SELECT
  id,
  title,
  status,
  visibility,
  sensitivity,
  category,
  source_module,
  source_resource_type,
  source_resource_id,
  owner_type,
  current_version_id,
  active_file_id,
  created_at,
  updated_at,
  archived_at
FROM secure_documents
WHERE tenant_id = $1
  AND ($2::document_status IS NULL OR status = $2)
  AND archived_at IS NULL
ORDER BY updated_at DESC
LIMIT $3 OFFSET $4;
```

---

## 28.2. Obtener documento por tenant

```sql id="plt22l"
SELECT *
FROM secure_documents
WHERE tenant_id = $1
  AND id = $2
LIMIT 1;
```

---

## 28.3. Obtener archivo por tenant

```sql id="kie5y9"
SELECT *
FROM secure_document_files
WHERE tenant_id = $1
  AND id = $2
  AND archived_at IS NULL
LIMIT 1;
```

---

## 28.4. Listar documentos por recurso origen

```sql id="lz00aa"
SELECT *
FROM secure_documents
WHERE tenant_id = $1
  AND source_module = $2
  AND source_resource_type = $3
  AND source_resource_id = $4
  AND archived_at IS NULL
ORDER BY created_at DESC;
```

---

## 28.5. Listar archivos de documento

```sql id="muyx4n"
SELECT
  id,
  document_id,
  version_id,
  provider,
  original_file_name,
  safe_file_name,
  extension,
  mime_type,
  mime_group,
  file_size,
  substring(file_hash for 12) AS hash_prefix,
  hash_algorithm,
  scan_status,
  status,
  is_primary,
  uploaded_at,
  generated_at,
  archived_at
FROM secure_document_files
WHERE tenant_id = $1
  AND document_id = $2
  AND archived_at IS NULL
ORDER BY uploaded_at DESC NULLS LAST, generated_at DESC NULLS LAST;
```

---

## 28.6. Registrar access log

```sql id="qxbksj"
INSERT INTO secure_document_access_logs (
  id,
  tenant_id,
  document_id,
  version_id,
  file_id,
  actor_user_id,
  access_type,
  outcome,
  source_module,
  source_resource_type,
  source_resource_id,
  ip_address_hash,
  user_agent_hash,
  accessed_at,
  trace_id,
  metadata
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, now(), $14, $15
);
```

---

# 29. Soft delete, archivo y restauración

## 29.1. Archivo lógico

No se debe eliminar físicamente en operación ordinaria:

```text id="fkfa8a"
secure_documents
secure_document_versions
secure_document_files
secure_document_links
secure_document_policies
secure_document_access_logs
```

Regla:

```text id="fuej5b"
archivedAt != null representa archivo lógico.
```

Cuando aplique:

```text id="h2zc0g"
status = archived
```

---

## 29.2. Restauración

Restaurar un documento requiere:

```text id="l7ej5x"
- permiso documents.restore;
- validación de tenant;
- validar que el archivo físico exista;
- validar que no esté infected;
- validar que no esté rejected;
- actualizar restoredAt y restoredBy;
- restaurar status a available si corresponde;
- auditar document.restored.
```

---

## 29.3. Eliminación física

Fuera de alcance MVP.

Debe diferirse a una spec futura:

```text id="l4mkau"
document-retention-policy
```

---

# 30. Reglas de metadata

## 30.1. Metadata permitida

```text id="tdw0jm"
description segura
safe tags
source hints
processing flags
mime validation result
safe hash prefix
provider safe name
upload context
generated context
traceId
correlationId
non-sensitive notes
```

---

## 30.2. Metadata prohibida

```text id="iaz3tz"
passwords
tokens
api keys
client secrets
cookies
authorization headers
storageKey duplicado
bucket
path interno
URL firmada
contenido completo del archivo
contenido binario
base64 del archivo
emails completos
teléfonos completos
cédulas
datos bancarios completos
firmas
actas completas
comprobantes completos
evidencias completas
stack traces
SQL raw
provider payload completo
```

---

# 31. Auditoría desde modelo

## 31.1. Eventos mínimos

```text id="w7upyi"
document.created
document.metadataUpdated
document.uploaded
document.fileRegistered
document.versionCreated
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

## 31.2. Metadata permitida

```text id="iqbdpa"
documentId
versionId
fileId
sourceModule
sourceResourceType
sourceResourceId
category
sensitivity
visibility
status
fileSize
mimeType
mimeGroup
hashPrefix
provider
accessType
outcome
traceId
```

---

## 31.3. Metadata prohibida

```text id="b2ua42"
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

# 32. Observabilidad desde modelo

## 32.1. Logs sugeridos

```text id="rwcsbf"
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

## 32.2. Métricas sugeridas

```text id="frorwf"
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

## 32.3. Labels permitidos

```text id="qpys4z"
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

## 32.4. Labels prohibidos

```text id="my8kmi"
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

# 33. Migración

Nombre sugerido:

```text id="qawfsb"
016_create_secure_document_storage
```

Pasos:

```text id="n6e14s"
1. Crear enums del módulo.
2. Crear secure_documents.
3. Crear secure_document_versions.
4. Crear secure_document_files.
5. Crear secure_document_links.
6. Crear secure_document_policies.
7. Crear secure_document_access_logs.
8. Crear índices básicos.
9. Crear constraints básicos.
10. Crear índices parciales raw.
11. Agregar relaciones Prisma en Tenant.
12. Agregar relaciones Prisma en UserProfile.
13. Agregar relaciones Prisma en Person.
14. Agregar relaciones Prisma en PropertyUnit.
15. Generar Prisma Client.
16. Ejecutar migración en DB test.
17. Ejecutar seeds demo.
18. Validar tests de repositorio.
```

---

# 34. Migraciones raw recomendadas

## 34.1. Validar `file_size > 0`

```sql id="qtuasg"
ALTER TABLE secure_document_files
ADD CONSTRAINT secure_document_files_file_size_positive
CHECK (file_size > 0);
```

---

## 34.2. Validar `version_number > 0`

```sql id="bf6e4t"
ALTER TABLE secure_document_versions
ADD CONSTRAINT secure_document_versions_number_positive
CHECK (version_number > 0);
```

---

## 34.3. Validar hash en archivos disponibles

```sql id="hh58m4"
ALTER TABLE secure_document_files
ADD CONSTRAINT secure_document_files_available_requires_hash
CHECK (
  status NOT IN ('stored', 'available')
  OR (file_hash IS NOT NULL AND hash_algorithm IS NOT NULL)
);
```

---

## 34.4. Validar storage key no vacío

```sql id="q0uslb"
ALTER TABLE secure_document_files
ADD CONSTRAINT secure_document_files_storage_key_not_blank
CHECK (length(trim(storage_key)) > 0);
```

---

## 34.5. Validar versión activa única por documento

```sql id="y9ht0p"
CREATE UNIQUE INDEX secure_document_versions_one_active_per_document
ON secure_document_versions(tenant_id, document_id)
WHERE status = 'active'
  AND archived_at IS NULL;
```

---

## 34.6. Validar archivo primario activo único por versión

```sql id="cy9sxm"
CREATE UNIQUE INDEX secure_document_files_one_primary_active_per_version
ON secure_document_files(tenant_id, version_id)
WHERE is_primary = true
  AND archived_at IS NULL
  AND status IN ('stored', 'available');
```

---

## 34.7. Validar storage key único por provider

```sql id="ff3r6n"
CREATE UNIQUE INDEX secure_document_files_unique_storage_key_per_provider
ON secure_document_files(provider, storage_key)
WHERE archived_at IS NULL;
```

---

# 35. Seeds

## 35.1. Secure documents demo

```text id="w7iwtu"
secureDocumentPaymentReceiptA
secureDocumentFineEvidenceA
secureDocumentCertifiedMinutesPdfA
secureDocumentCertifiedMinutesAttachmentA
secureDocumentCommunicationAttachmentA
secureDocumentReportExportA
secureDocumentAdministrativeA
secureDocumentResidentA
secureDocumentPropertyA
secureDocumentSystemGeneratedA
secureDocumentArchivedA
secureDocumentTenantB
```

---

## 35.2. Versions demo

```text id="q1qvuk"
secureDocumentVersion1A
secureDocumentVersion2A
secureDocumentVersionActiveA
secureDocumentVersionSupersededA
secureDocumentVersionArchivedA
secureDocumentVersionTenantB
```

---

## 35.3. Files demo

```text id="aaoegk"
secureDocumentFilePdfA
secureDocumentFileImagePngA
secureDocumentFileImageJpegA
secureDocumentFileDocxA
secureDocumentFileXlsxA
secureDocumentFileCsvA
secureDocumentFileJsonA
secureDocumentFileTextA
secureDocumentFileQuarantinedA
secureDocumentFileRejectedA
secureDocumentFileArchivedA
secureDocumentFileMissingA
secureDocumentFileTenantB
```

---

## 35.4. Links demo

```text id="yr0c4k"
secureDocumentLinkPaymentA
secureDocumentLinkPaymentReceiptA
secureDocumentLinkFineA
secureDocumentLinkFineEvidenceA
secureDocumentLinkCertifiedMinutesA
secureDocumentLinkCertifiedMinutesArtifactA
secureDocumentLinkCommunicationA
secureDocumentLinkPropertyUnitA
secureDocumentLinkPersonA
secureDocumentLinkTenantB
```

---

## 35.5. Policies demo

```text id="wlhcgw"
secureDocumentPolicyPrivateA
secureDocumentPolicyAdministrativeA
secureDocumentPolicyOwnersA
secureDocumentPolicyResidentsA
secureDocumentPolicySpecificUsersA
secureDocumentPolicyPropertyUnitsA
secureDocumentPolicyRolesA
secureDocumentPolicySourceResourceAudienceA
secureDocumentPolicyRestrictedA
secureDocumentPolicyExpiredA
secureDocumentPolicyTenantB
```

---

## 35.6. Access logs demo

```text id="mxbpq4"
secureDocumentAccessViewAllowedA
secureDocumentAccessDownloadAllowedA
secureDocumentAccessDownloadDeniedA
secureDocumentAccessNotFoundA
secureDocumentAccessQuarantinedA
secureDocumentAccessRejectedA
secureDocumentAccessArchivedA
secureDocumentAccessTenantB
```

---

## 35.7. Datos prohibidos en seeds

```text id="r3zqrg"
nombres reales
emails reales
teléfonos reales
cédulas reales
documentos reales
comprobantes reales
actas reales
evidencias reales
firmas reales
storage keys reales
URLs firmadas reales
tokens
secretos
datos financieros reales
datos sancionatorios reales
datos personales masivos
```

---

# 36. Testing del modelo

## 36.1. Unit tests

```text id="nw0nxm"
DocumentStatus
DocumentVersionStatus
DocumentFileStatus
DocumentVisibility
DocumentSensitivity
DocumentCategory
SourceModule
StorageProvider
FileScanStatus
DocumentAccessType
DocumentAccessOutcome
DocumentPolicyType
DocumentOwnerType
DocumentLinkType
MimeGroup
SecureDocument entity
SecureDocumentVersion entity
SecureDocumentFile entity
SecureDocumentLink entity
SecureDocumentPolicy entity
SecureDocumentAccessLog entity
DocumentFileName value object
DocumentMimeType value object
DocumentFileSize value object
DocumentStorageKey value object
DocumentHash value object
DocumentMetadata sanitizer
```

---

## 36.2. Repository tests

```text id="q7x149"
create secure document
find document by tenant
list documents by tenant
filter by sourceModule
filter by sourceResource
filter by category
filter by sensitivity
filter by owner
archive document
restore document
create document version
prevent duplicate versionNumber
create document file
prevent second active primary file per version
prevent duplicate storageKey per provider
create document link
create document policy
create access log
tenant A does not see tenant B records
```

---

## 36.3. Multitenancy tests

```text id="h6ucv5"
tenant A no ve secureDocument tenant B
tenant A no ve secureDocumentVersion tenant B
tenant A no ve secureDocumentFile tenant B
tenant A no ve secureDocumentLink tenant B
tenant A no ve secureDocumentPolicy tenant B
tenant A no ve secureDocumentAccessLog tenant B
tenant A no usa documentId tenant B
tenant A no usa versionId tenant B
tenant A no usa fileId tenant B
tenant A no usa sourceResourceId tenant B
tenant A no usa ownerUserId tenant B
tenant A no usa ownerPersonId tenant B
tenant A no usa ownerPropertyUnitId tenant B
tenant A no usa audienceRules tenant B
```

---

## 36.4. Storage integrity tests

```text id="jaueq2"
file available requires fileHash
fileHash calculated from binary
same binary produces same hash
modified binary produces different hash
hashPrefix exposed safely
full hash not exposed in standard DTO
storageKey not exposed in DTO
storageKey not exposed in errors
storageKey not exposed in logs
storageKey not exposed in audit
```

---

## 36.5. Security tests

```text id="mdzuul"
no public document endpoints
no cross-tenant document access
no cross-tenant file download
no storageKey exposure
no signed URL persistent exposure
no binary in JSON response
no binary in logs
no binary in audit
no quarantined file download
no rejected file download
no archived document visible by default
no local storage enabled in production by default
```

---

# 37. Decisión final del modelo

El módulo `016-secure-document-storage` usará las siguientes tablas:

```text id="yfk3th"
secure_documents
secure_document_versions
secure_document_files
secure_document_links
secure_document_policies
secure_document_access_logs
```

El modelo garantiza:

```text id="yzt4a2"
tenant isolation
source module awareness
source resource validation
logical document registry
simple document versioning
physical file tracking
storage provider abstraction
server-generated storage key
storage key protection
SHA-256 file hash
metadata standardization
document classification
document sensitivity
visibility policy
owner-based access
delegated source-module authorization
secure downloads
access logging
auditability
soft archive
restore readiness
S3-compatible readiness
no public exposure by default
```

La implementación no debe aceptarse si:

```text id="p8r6pi"
permite documentos cross-tenant
permite archivos cross-tenant
permite versiones cross-tenant
permite links cross-tenant
permite policies cross-tenant
permite access logs cross-tenant
permite usar sourceResourceId de otro tenant
permite usar ownerId de otro tenant
acepta tenantId desde body
acepta storageKey desde cliente
expone storageKey
expone bucket o path interno
expone URL firmada persistente
descarga sin autorización
descarga archivo en cuarentena
descarga archivo rechazado
muestra documentos archivados por defecto
omite hash de archivo available
no valida MIME type
no valida fileSize
permite path traversal
registra binarios en logs
registra binarios en auditoría
crea endpoints públicos
documenta endpoints públicos en OpenAPI
permite acceso PlatformAdmin automático al contenido de tenants
usa storage local como configuración productiva por defecto
omite auditoría de operaciones críticas
```

---

# 38. Pendientes para evolución

Quedan diferidos:

```text id="j67f8j"
document_storage_configs persistido en base de datos
antivirus real
DLP avanzado
retención documental avanzada
legal hold
eliminación física controlada
publicación pública de documentos
QR de verificación pública
firma electrónica
sellado de tiempo externo
cifrado con llaves por tenant
búsqueda full-text
indexación semántica
clasificación automática por IA
OCR
preview avanzado
conversión universal de formatos
integración Google Drive / OneDrive / Dropbox
CDN público
```

Estos diferidos no bloquean el MVP de `016-secure-document-storage`.
