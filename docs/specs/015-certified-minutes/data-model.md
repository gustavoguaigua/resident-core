# Data Model — Spec 015 Certified Minutes

## 1. Información del documento

| Campo                  | Valor                                                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Proyecto               | RESIDENT Core                                                                                                                |
| Spec ID                | 015                                                                                                                          |
| Módulo                 | Certified Minutes                                                                                                            |
| Documento              | Data Model                                                                                                                   |
| Ruta                   | `docs/specs/015-certified-minutes/data-model.md`                                                                             |
| Versión                | 0.1                                                                                                                          |
| Estado                 | Borrador inicial                                                                                                             |
| Fecha                  | 2026-07-21                                                                                                                   |
| Documento base         | `docs/specs/015-certified-minutes/spec.md`                                                                                   |
| Plan técnico           | `docs/specs/015-certified-minutes/plan.md`                                                                                   |
| Base de datos          | PostgreSQL                                                                                                                   |
| ORM                    | Prisma                                                                                                                       |
| Estrategia multitenant | Shared database + shared schema + `tenant_id`                                                                                |
| Naturaleza del módulo  | Tenant-scoped / Meeting-bound / Version-controlled / Seal-hash-enabled / Artifact-aware / Publication-controlled / Auditable |
| API Style              | REST                                                                                                                         |

---

## 2. Propósito

Este documento define el modelo de datos del módulo `015-certified-minutes`.

El objetivo es modelar actas formales internas vinculadas a reuniones o asambleas, con versionado, secciones estructuradas, aprobaciones, sellado interno mediante hash, generación de artefactos PDF, adjuntos, publicaciones controladas, descargas autorizadas, acceso propio y auditoría.

Regla central:

```text id="v4gncg"
Toda acta certificada, versión, sección, aprobación, adjunto, artefacto, publicación y acceso debe ser tenant-scoped, meeting-bound, version-controlled, integrity-protected, audience-protected, non-public y auditable.
```

---

## 3. Decisión principal del modelo

Para MVP se crearán ocho tablas principales:

```text id="i9rwbi"
certified_minutes
certified_minutes_versions
certified_minutes_sections
certified_minutes_approvals
certified_minutes_attachments
certified_minutes_artifacts
certified_minutes_publications
certified_minutes_access_logs
```

Estas tablas permiten cubrir:

* acta formal por reunión;
* versionado incremental;
* secciones estructuradas;
* flujo de revisión y aprobación;
* sellado interno mediante hash;
* generación de PDF y otros artefactos;
* adjuntos;
* publicación controlada;
* consulta propia;
* descarga segura;
* trazabilidad de accesos;
* integración con reuniones, votaciones y resoluciones;
* auditoría;
* evolución futura hacia firma electrónica y sellado externo.

---

## 4. Tablas nuevas MVP

```text id="xy88hz"
certified_minutes
certified_minutes_versions
certified_minutes_sections
certified_minutes_approvals
certified_minutes_attachments
certified_minutes_artifacts
certified_minutes_publications
certified_minutes_access_logs
```

---

## 5. Tablas externas relacionadas

El módulo se relaciona con tablas existentes o previstas:

```text id="l76b5e"
tenants
user_profiles
persons
property_units
property_ownerships
residencies
roles / tenant_roles
meetings
meeting_minutes
meeting_agenda_items
meeting_attendance
meeting_resolutions
voting_sessions
voting_results
voting_tallies
audit_logs
notifications
```

| Tabla externa            | Spec origen                        | Uso en Certified Minutes                                                 |
| ------------------------ | ---------------------------------- | ------------------------------------------------------------------------ |
| `tenants`                | `001-tenants`                      | Tenant propietario del acta                                              |
| `user_profiles`          | `002-users-roles`                  | Creadores, editores, revisores, aprobadores, publicadores, descargadores |
| `roles` / `tenant_roles` | `002-users-roles`                  | Audiencia por rol y permisos administrativos                             |
| `persons`                | `003-residents-properties`         | Resolución de acceso propio por persona                                  |
| `property_units`         | `003-residents-properties`         | Resolución de acceso propio por unidad                                   |
| `property_ownerships`    | `003-residents-properties`         | Audiencia de propietarios                                                |
| `residencies`            | `003-residents-properties`         | Audiencia de residentes                                                  |
| `meetings`               | `013-meetings-attendance`          | Reunión origen del acta                                                  |
| `meeting_minutes`        | `013-meetings-attendance`          | Acta preliminar fuente                                                   |
| `meeting_agenda_items`   | `013-meetings-attendance`          | Snapshot de agenda                                                       |
| `meeting_attendance`     | `013-meetings-attendance`          | Snapshot de asistencia                                                   |
| `meeting_resolutions`    | `013-meetings-attendance`          | Resoluciones asociadas                                                   |
| `voting_sessions`        | `014-voting-basic`                 | Votaciones vinculadas                                                    |
| `voting_results`         | `014-voting-basic`                 | Resultados publicados incorporables                                      |
| `voting_tallies`         | `014-voting-basic`                 | Conteos agregados incorporables                                          |
| `audit_logs`             | `007-audit`                        | Auditoría de operaciones críticas                                        |
| `notifications`          | `012-communications-notifications` | Notificaciones derivadas                                                 |

---

# 6. Entidad `CertifiedMinutes`

## 6.1. Propósito

Representa el acta formal interna asociada a una reunión.

Debe existir como contenedor principal del flujo documental: creación, importación, revisión, aprobación, sellado, publicación, revocación y archivo.

---

## 6.2. Tabla

```text id="cfgcqy"
certified_minutes
```

---

## 6.3. Campos

```text id="nxaa5l"
CertifiedMinutes
├── id
├── tenantId
├── meetingId
├── sourceMeetingMinutesId
├── title
├── code
├── status
├── visibility
├── certificationMode
├── currentVersionId
├── approvedVersionId
├── sealedVersionId
├── publishedVersionId
├── createdBy
├── updatedBy
├── submittedBy
├── approvedBy
├── sealedBy
├── publishedBy
├── archivedBy
├── cancelledBy
├── submittedAt
├── approvedAt
├── sealedAt
├── publishedAt
├── archivedAt
├── cancelledAt
├── cancellationReason
├── sealHash
├── sealAlgorithm
├── metadata
├── createdAt
└── updatedAt
```

---

## 6.4. Reglas

* `tenantId` obligatorio.
* `meetingId` obligatorio.
* `meetingId` debe pertenecer al mismo tenant.
* `sourceMeetingMinutesId` opcional.
* Si `sourceMeetingMinutesId` existe, debe pertenecer al mismo tenant y a la misma reunión.
* `title` obligatorio.
* `code` opcional en MVP, recomendado para numeración formal futura.
* `status` obligatorio.
* Estado inicial: `draft`.
* `visibility` obligatoria.
* `certificationMode` obligatorio.
* Solo debe existir un acta principal activa por reunión, salvo superseding controlado.
* `currentVersionId` apunta a la versión editable o más reciente.
* `approvedVersionId` apunta a la versión aprobada.
* `sealedVersionId` apunta a la versión sellada.
* `publishedVersionId` apunta a la versión publicada.
* `sealHash` se registra al sellar.
* `sealAlgorithm` inicial recomendado: `SHA-256`.
* `metadata` debe ser sanitizada.
* No se permite eliminación física ordinaria.
* No se expone públicamente.

---

# 7. Entidad `CertifiedMinutesVersion`

## 7.1. Propósito

Representa una versión controlada del acta.

Cada modificación relevante de contenido debe quedar asociada a una versión. Una versión sellada es inmutable.

---

## 7.2. Tabla

```text id="o1sin0"
certified_minutes_versions
```

---

## 7.3. Campos

```text id="xgpril"
CertifiedMinutesVersion
├── id
├── tenantId
├── certifiedMinutesId
├── versionNumber
├── status
├── title
├── summary
├── contentSnapshot
├── contentHash
├── hashAlgorithm
├── changeReason
├── createdBy
├── approvedBy
├── sealedBy
├── createdAt
├── approvedAt
├── sealedAt
└── archivedAt
```

---

## 7.4. Reglas

* `tenantId` obligatorio.
* `certifiedMinutesId` obligatorio.
* `certifiedMinutesId` debe pertenecer al mismo tenant.
* `versionNumber` obligatorio e incremental por acta.
* `status` obligatorio.
* `title` obligatorio.
* `contentSnapshot` contiene representación estructurada segura de la versión.
* `contentHash` se calcula sobre contenido canonicalizado.
* `hashAlgorithm` obligatorio cuando exista `contentHash`.
* `changeReason` obligatorio para versiones posteriores a la primera.
* Una versión `sealed` no puede modificarse.
* No se elimina físicamente en operación ordinaria.

---

# 8. Entidad `CertifiedMinutesSection`

## 8.1. Propósito

Representa una sección estructurada del acta.

Ejemplos de secciones:

```text id="uz89ne"
encabezado
información de reunión
convocatoria
asistencia
quórum
agenda
desarrollo
votaciones
resoluciones
observaciones
cierre
anexos
```

---

## 8.2. Tabla

```text id="gy8gds"
certified_minutes_sections
```

---

## 8.3. Campos

```text id="m3wnpb"
CertifiedMinutesSection
├── id
├── tenantId
├── certifiedMinutesId
├── versionId
├── sectionType
├── order
├── title
├── body
├── sourceType
├── sourceId
├── isRequired
├── createdBy
├── updatedBy
├── createdAt
├── updatedAt
└── archivedAt
```

---

## 8.4. Reglas

* `tenantId` obligatorio.
* `certifiedMinutesId` obligatorio.
* `versionId` obligatorio.
* `certifiedMinutesId` y `versionId` deben pertenecer al mismo tenant.
* `versionId` debe pertenecer al acta indicada.
* `sectionType` obligatorio.
* `order` obligatorio y único por versión activa.
* `title` obligatorio.
* `body` debe sanitizarse.
* `sourceType` y `sourceId` opcionales para secciones importadas.
* No se puede modificar una sección de versión sellada.
* No se elimina físicamente en operación ordinaria.

---

# 9. Entidad `CertifiedMinutesApproval`

## 9.1. Propósito

Representa una decisión de revisión, aprobación, rechazo, comentario o solicitud de cambios sobre una versión del acta.

---

## 9.2. Tabla

```text id="mvqi2e"
certified_minutes_approvals
```

---

## 9.3. Campos

```text id="jpqbwo"
CertifiedMinutesApproval
├── id
├── tenantId
├── certifiedMinutesId
├── versionId
├── approverUserId
├── approverRole
├── decision
├── comments
├── decidedAt
├── createdAt
└── archivedAt
```

---

## 9.4. Reglas

* `tenantId` obligatorio.
* `certifiedMinutesId` obligatorio.
* `versionId` obligatorio.
* `approverUserId` obligatorio.
* Todas las referencias deben pertenecer al mismo tenant.
* `decision` obligatorio.
* `comments` obligatorio cuando `decision` sea `rejected` o `changesRequested`.
* `decidedAt` obligatorio.
* No se elimina físicamente en operación ordinaria.
* La aprobación no debe interpretarse como firma electrónica legal.

---

# 10. Entidad `CertifiedMinutesAttachment`

## 10.1. Propósito

Representa un archivo adjunto al acta o a una versión específica.

Ejemplos:

```text id="tq7f55"
hoja de asistencia
reporte de votación
documento de soporte
imagen
PDF anexo
documento Word
hoja de cálculo
```

---

## 10.2. Tabla

```text id="h1ekni"
certified_minutes_attachments
```

---

## 10.3. Campos

```text id="ee48w8"
CertifiedMinutesAttachment
├── id
├── tenantId
├── certifiedMinutesId
├── versionId
├── fileName
├── fileType
├── mimeType
├── fileSize
├── storageKey
├── fileHash
├── hashAlgorithm
├── attachmentType
├── status
├── uploadedBy
├── archivedBy
├── uploadedAt
├── archivedAt
└── metadata
```

---

## 10.4. Reglas

* `tenantId` obligatorio.
* `certifiedMinutesId` obligatorio.
* `versionId` opcional.
* Si `versionId` existe, debe pertenecer al mismo acta y tenant.
* `fileName` obligatorio y sanitizado.
* `mimeType` obligatorio.
* `fileSize` obligatorio y mayor que cero.
* `storageKey` obligatorio, pero nunca debe exponerse por API.
* `fileHash` obligatorio si el archivo fue almacenado exitosamente.
* `hashAlgorithm` obligatorio si existe `fileHash`.
* `attachmentType` obligatorio.
* `status` obligatorio.
* No se permite eliminación física ordinaria.
* Descarga requiere autorización.

---

# 11. Entidad `CertifiedMinutesArtifact`

## 11.1. Propósito

Representa un artefacto generado desde una versión del acta.

El caso principal del MVP es el PDF formal interno.

---

## 11.2. Tabla

```text id="tq8mjl"
certified_minutes_artifacts
```

---

## 11.3. Campos

```text id="jh7t8z"
CertifiedMinutesArtifact
├── id
├── tenantId
├── certifiedMinutesId
├── versionId
├── artifactType
├── status
├── fileName
├── storageKey
├── mimeType
├── fileSize
├── artifactHash
├── hashAlgorithm
├── isOfficial
├── generatedBy
├── archivedBy
├── generatedAt
├── archivedAt
└── metadata
```

---

## 11.4. Reglas

* `tenantId` obligatorio.
* `certifiedMinutesId` obligatorio.
* `versionId` obligatorio.
* Todas las referencias deben pertenecer al mismo tenant.
* `artifactType` obligatorio.
* `status` obligatorio.
* `storageKey` obligatorio cuando `status = generated`.
* `storageKey` no se expone por API.
* `artifactHash` obligatorio para artefacto generado.
* `isOfficial = true` solo para versiones aprobadas o selladas según política.
* PDF formal no debe generarse desde versión `draft`.
* PDF de borrador, si se permite, debe marcarse como no oficial.
* Descarga requiere autorización.
* No se elimina físicamente en operación ordinaria.

---

# 12. Entidad `CertifiedMinutesPublication`

## 12.1. Propósito

Representa la publicación controlada de una versión del acta hacia una audiencia determinada.

---

## 12.2. Tabla

```text id="ee0z70"
certified_minutes_publications
```

---

## 12.3. Campos

```text id="rsnb2j"
CertifiedMinutesPublication
├── id
├── tenantId
├── certifiedMinutesId
├── versionId
├── artifactId
├── audienceType
├── audienceRules
├── status
├── notificationRequested
├── publishedBy
├── revokedBy
├── archivedBy
├── publishedAt
├── revokedAt
├── revocationReason
├── expiresAt
├── createdAt
└── archivedAt
```

---

## 12.4. Reglas

* `tenantId` obligatorio.
* `certifiedMinutesId` obligatorio.
* `versionId` obligatorio.
* `artifactId` opcional, pero recomendado si se publica PDF.
* Todas las referencias deben pertenecer al mismo tenant.
* `audienceType` obligatorio.
* `audienceRules` obligatorio cuando `audienceType = mixed`, `restricted`, `propertyUnits`, `specificUsers` o `roles`.
* `status` obligatorio.
* Publicar requiere acta sellada.
* Publicar requiere audiencia.
* Revocar requiere razón.
* Revocar no elimina el acta.
* Revocar no elimina artefactos.
* No se expone públicamente.

---

# 13. Entidad `CertifiedMinutesAccessLog`

## 13.1. Propósito

Representa el registro de consulta, descarga, exportación o impresión de actas y artefactos.

No sustituye `AuditLog`, pero complementa trazabilidad de acceso documental.

---

## 13.2. Tabla

```text id="rir89e"
certified_minutes_access_logs
```

---

## 13.3. Campos

```text id="rbr7lq"
CertifiedMinutesAccessLog
├── id
├── tenantId
├── certifiedMinutesId
├── versionId
├── artifactId
├── actorUserId
├── accessType
├── outcome
├── ipAddressHash
├── userAgentHash
├── accessedAt
├── traceId
└── metadata
```

---

## 13.4. Reglas

* `tenantId` obligatorio.
* `certifiedMinutesId` obligatorio.
* `actorUserId` obligatorio cuando el actor está autenticado.
* `accessType` obligatorio.
* `outcome` obligatorio.
* `ipAddressHash` opcional.
* `userAgentHash` opcional.
* `accessedAt` obligatorio.
* `traceId` recomendado.
* No registrar IP en texto plano si la política exige minimización.
* No registrar contenido completo del acta.
* No registrar storageKey.
* No registrar URL firmada.

---

# 14. Enums

## 14.1. CertifiedMinutesStatus

```text id="rxf9hn"
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

## 14.2. CertifiedMinutesVersionStatus

```text id="oouavq"
draft
underReview
approved
sealed
superseded
archived
```

---

## 14.3. CertifiedMinutesVisibility

```text id="t12had"
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

## 14.4. CertificationMode

```text id="mflve5"
internalHash
manualApproval
systemGeneratedPdf
```

Diferidos:

```text id="nl79mv"
electronicSignature
qualifiedSignature
externalTimestamp
notarialCertification
publicVerification
```

---

## 14.5. MinutesSectionType

```text id="kpi1zw"
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

## 14.6. ApprovalDecision

```text id="uf07v9"
approved
rejected
changesRequested
commented
```

---

## 14.7. CertifiedMinutesAttachmentType

```text id="hoorv9"
supportingDocument
attendanceSheet
votingReport
resolutionDocument
image
pdf
other
```

---

## 14.8. CertifiedMinutesAttachmentStatus

```text id="jaqztj"
uploaded
available
quarantined
rejected
archived
```

---

## 14.9. CertifiedMinutesArtifactType

```text id="gxlola"
pdf
draftPdf
htmlSnapshot
jsonSnapshot
hashManifest
```

---

## 14.10. CertifiedMinutesArtifactStatus

```text id="sy5jrr"
pending
generated
failed
archived
```

---

## 14.11. CertifiedMinutesPublicationStatus

```text id="a2ur7h"
draft
published
expired
revoked
archived
```

---

## 14.12. CertifiedMinutesAudienceType

```text id="civft4"
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

## 14.13. CertifiedMinutesAccessType

```text id="htq13s"
view
download
export
print
```

---

## 14.14. CertifiedMinutesAccessOutcome

```text id="odkm4i"
allowed
denied
notFound
expired
revoked
error
```

---

## 14.15. HashAlgorithm

```text id="fpuqqp"
SHA-256
```

Diferidos:

```text id="lys8pq"
SHA-512
BLAKE3
externalSignatureDigest
```

---

# 15. Modelo Prisma preliminar

## 15.1. Enums Prisma

```prisma id="i133aq"
enum CertifiedMinutesStatus {
  DRAFT             @map("draft")
  UNDER_REVIEW      @map("underReview")
  CHANGES_REQUESTED @map("changesRequested")
  APPROVED          @map("approved")
  SEALED            @map("sealed")
  PUBLISHED         @map("published")
  SUPERSEDED        @map("superseded")
  CANCELLED         @map("cancelled")
  ARCHIVED          @map("archived")

  @@map("certified_minutes_status")
}

enum CertifiedMinutesVersionStatus {
  DRAFT        @map("draft")
  UNDER_REVIEW @map("underReview")
  APPROVED     @map("approved")
  SEALED       @map("sealed")
  SUPERSEDED   @map("superseded")
  ARCHIVED     @map("archived")

  @@map("certified_minutes_version_status")
}

enum CertifiedMinutesVisibility {
  ADMINISTRATIVE       @map("administrative")
  BOARD                @map("board")
  MEETING_PARTICIPANTS @map("meetingParticipants")
  OWNERS               @map("owners")
  RESIDENTS            @map("residents")
  TENANT               @map("tenant")
  MIXED                @map("mixed")
  RESTRICTED           @map("restricted")

  @@map("certified_minutes_visibility")
}

enum CertificationMode {
  INTERNAL_HASH        @map("internalHash")
  MANUAL_APPROVAL      @map("manualApproval")
  SYSTEM_GENERATED_PDF @map("systemGeneratedPdf")

  @@map("certification_mode")
}

enum MinutesSectionType {
  HEADER        @map("header")
  MEETING_INFO  @map("meetingInfo")
  CALL_NOTICE   @map("callNotice")
  ATTENDANCE    @map("attendance")
  QUORUM        @map("quorum")
  AGENDA        @map("agenda")
  DISCUSSION    @map("discussion")
  VOTING        @map("voting")
  RESOLUTIONS   @map("resolutions")
  AGREEMENTS    @map("agreements")
  OBSERVATIONS  @map("observations")
  CLOSURE       @map("closure")
  ATTACHMENTS   @map("attachments")
  CUSTOM        @map("custom")

  @@map("minutes_section_type")
}

enum ApprovalDecision {
  APPROVED          @map("approved")
  REJECTED          @map("rejected")
  CHANGES_REQUESTED @map("changesRequested")
  COMMENTED         @map("commented")

  @@map("approval_decision")
}

enum CertifiedMinutesAttachmentType {
  SUPPORTING_DOCUMENT @map("supportingDocument")
  ATTENDANCE_SHEET    @map("attendanceSheet")
  VOTING_REPORT       @map("votingReport")
  RESOLUTION_DOCUMENT @map("resolutionDocument")
  IMAGE               @map("image")
  PDF                 @map("pdf")
  OTHER               @map("other")

  @@map("certified_minutes_attachment_type")
}

enum CertifiedMinutesAttachmentStatus {
  UPLOADED    @map("uploaded")
  AVAILABLE   @map("available")
  QUARANTINED @map("quarantined")
  REJECTED    @map("rejected")
  ARCHIVED    @map("archived")

  @@map("certified_minutes_attachment_status")
}

enum CertifiedMinutesArtifactType {
  PDF           @map("pdf")
  DRAFT_PDF     @map("draftPdf")
  HTML_SNAPSHOT @map("htmlSnapshot")
  JSON_SNAPSHOT @map("jsonSnapshot")
  HASH_MANIFEST @map("hashManifest")

  @@map("certified_minutes_artifact_type")
}

enum CertifiedMinutesArtifactStatus {
  PENDING   @map("pending")
  GENERATED @map("generated")
  FAILED    @map("failed")
  ARCHIVED  @map("archived")

  @@map("certified_minutes_artifact_status")
}

enum CertifiedMinutesPublicationStatus {
  DRAFT     @map("draft")
  PUBLISHED @map("published")
  EXPIRED   @map("expired")
  REVOKED   @map("revoked")
  ARCHIVED  @map("archived")

  @@map("certified_minutes_publication_status")
}

enum CertifiedMinutesAudienceType {
  ADMINISTRATORS       @map("administrators")
  BOARD                @map("board")
  MEETING_PARTICIPANTS @map("meetingParticipants")
  OWNERS               @map("owners")
  RESIDENTS            @map("residents")
  TENANT               @map("tenant")
  PROPERTY_UNITS       @map("propertyUnits")
  SPECIFIC_USERS       @map("specificUsers")
  ROLES                @map("roles")
  MIXED                @map("mixed")
  RESTRICTED           @map("restricted")

  @@map("certified_minutes_audience_type")
}

enum CertifiedMinutesAccessType {
  VIEW     @map("view")
  DOWNLOAD @map("download")
  EXPORT   @map("export")
  PRINT    @map("print")

  @@map("certified_minutes_access_type")
}

enum CertifiedMinutesAccessOutcome {
  ALLOWED  @map("allowed")
  DENIED   @map("denied")
  NOT_FOUND @map("notFound")
  EXPIRED  @map("expired")
  REVOKED  @map("revoked")
  ERROR    @map("error")

  @@map("certified_minutes_access_outcome")
}

enum HashAlgorithm {
  SHA_256 @map("SHA-256")

  @@map("hash_algorithm")
}
```

---

## 15.2. Modelo `CertifiedMinutes`

```prisma id="yofrhj"
model CertifiedMinutes {
  id                     String                     @id @default(uuid())
  tenantId               String                     @map("tenant_id")
  meetingId              String                     @map("meeting_id")
  sourceMeetingMinutesId String?                    @map("source_meeting_minutes_id")

  title                  String
  code                   String?

  status                 CertifiedMinutesStatus     @default(DRAFT)
  visibility             CertifiedMinutesVisibility @default(ADMINISTRATIVE)  
  certificationMode      CertificationMode          @default(INTERNAL_HASH) @map("certification_mode")

  currentVersionId       String?                    @map("current_version_id")
  approvedVersionId      String?                    @map("approved_version_id")
  sealedVersionId        String?                    @map("sealed_version_id")
  publishedVersionId     String?                    @map("published_version_id")

  createdBy              String?                    @map("created_by")
  updatedBy              String?                    @map("updated_by")
  submittedBy            String?                    @map("submitted_by")
  approvedBy             String?                    @map("approved_by")
  sealedBy               String?                    @map("sealed_by")
  publishedBy            String?                    @map("published_by")
  archivedBy             String?                    @map("archived_by")
  cancelledBy            String?                    @map("cancelled_by")

  submittedAt            DateTime?                  @map("submitted_at")
  approvedAt             DateTime?                  @map("approved_at")
  sealedAt               DateTime?                  @map("sealed_at")
  publishedAt            DateTime?                  @map("published_at")
  archivedAt             DateTime?                  @map("archived_at")
  cancelledAt            DateTime?                  @map("cancelled_at")
  cancellationReason     String?                    @map("cancellation_reason")

  sealHash               String?                    @map("seal_hash")
  sealAlgorithm          HashAlgorithm?             @map("seal_algorithm")

  metadata               Json?

  createdAt              DateTime                   @default(now()) @map("created_at")
  updatedAt              DateTime                   @updatedAt @map("updated_at")

  tenant                 Tenant                     @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  meeting                Meeting                    @relation(fields: [meetingId], references: [id], onDelete: Restrict)
  sourceMeetingMinutes   MeetingMinutes?            @relation(fields: [sourceMeetingMinutesId], references: [id], onDelete: Restrict)

  createdByUser          UserProfile?               @relation("CertifiedMinutesCreatedBy", fields: [createdBy], references: [id], onDelete: Restrict)
  updatedByUser          UserProfile?               @relation("CertifiedMinutesUpdatedBy", fields: [updatedBy], references: [id], onDelete: Restrict)
  submittedByUser        UserProfile?               @relation("CertifiedMinutesSubmittedBy", fields: [submittedBy], references: [id], onDelete: Restrict)
  approvedByUser         UserProfile?               @relation("CertifiedMinutesApprovedBy", fields: [approvedBy], references: [id], onDelete: Restrict)
  sealedByUser           UserProfile?               @relation("CertifiedMinutesSealedBy", fields: [sealedBy], references: [id], onDelete: Restrict)
  publishedByUser        UserProfile?               @relation("CertifiedMinutesPublishedBy", fields: [publishedBy], references: [id], onDelete: Restrict)
  archivedByUser         UserProfile?               @relation("CertifiedMinutesArchivedBy", fields: [archivedBy], references: [id], onDelete: Restrict)
  cancelledByUser        UserProfile?               @relation("CertifiedMinutesCancelledBy", fields: [cancelledBy], references: [id], onDelete: Restrict)

  versions               CertifiedMinutesVersion[]
  sections               CertifiedMinutesSection[]
  approvals              CertifiedMinutesApproval[]
  attachments            CertifiedMinutesAttachment[]
  artifacts              CertifiedMinutesArtifact[]
  publications           CertifiedMinutesPublication[]
  accessLogs             CertifiedMinutesAccessLog[]

  @@index([tenantId])
  @@index([tenantId, meetingId])
  @@index([tenantId, sourceMeetingMinutesId])
  @@index([tenantId, status])
  @@index([tenantId, visibility])
  @@index([tenantId, certificationMode])
  @@index([tenantId, code])
  @@index([tenantId, currentVersionId])
  @@index([tenantId, approvedVersionId])
  @@index([tenantId, sealedVersionId])
  @@index([tenantId, publishedVersionId])
  @@index([tenantId, submittedAt])
  @@index([tenantId, approvedAt])
  @@index([tenantId, sealedAt])
  @@index([tenantId, publishedAt])
  @@index([tenantId, archivedAt])
  @@map("certified_minutes")
}
```

Nota:

```text id="n0g7jx"
La unicidad de un acta activa principal por reunión requiere índice parcial raw porque depende de archived_at y status.
```

---

## 15.3. Modelo `CertifiedMinutesVersion`

```prisma id="rgf7q2"
model CertifiedMinutesVersion {
  id                 String                        @id @default(uuid())
  tenantId           String                        @map("tenant_id")
  certifiedMinutesId String                        @map("certified_minutes_id")

  versionNumber      Int                           @map("version_number")
  status             CertifiedMinutesVersionStatus @default(DRAFT)

  title              String
  summary            String?
  contentSnapshot    Json                          @map("content_snapshot")
  contentHash        String?                       @map("content_hash")
  hashAlgorithm      HashAlgorithm?                @map("hash_algorithm")
  changeReason       String?                       @map("change_reason")

  createdBy          String?                       @map("created_by")
  approvedBy         String?                       @map("approved_by")
  sealedBy           String?                       @map("sealed_by")

  createdAt          DateTime                      @default(now()) @map("created_at")
  approvedAt         DateTime?                     @map("approved_at")
  sealedAt           DateTime?                     @map("sealed_at")
  archivedAt         DateTime?                     @map("archived_at")

  tenant             Tenant                        @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  certifiedMinutes   CertifiedMinutes              @relation(fields: [certifiedMinutesId], references: [id], onDelete: Restrict)

  createdByUser      UserProfile?                  @relation("CertifiedMinutesVersionCreatedBy", fields: [createdBy], references: [id], onDelete: Restrict)
  approvedByUser     UserProfile?                  @relation("CertifiedMinutesVersionApprovedBy", fields: [approvedBy], references: [id], onDelete: Restrict)
  sealedByUser       UserProfile?                  @relation("CertifiedMinutesVersionSealedBy", fields: [sealedBy], references: [id], onDelete: Restrict)

  sections           CertifiedMinutesSection[]
  approvals          CertifiedMinutesApproval[]
  attachments        CertifiedMinutesAttachment[]
  artifacts          CertifiedMinutesArtifact[]
  publications       CertifiedMinutesPublication[]
  accessLogs         CertifiedMinutesAccessLog[]

  @@unique([tenantId, certifiedMinutesId, versionNumber])
  @@index([tenantId])
  @@index([tenantId, certifiedMinutesId])
  @@index([tenantId, status])
  @@index([tenantId, versionNumber])
  @@index([tenantId, contentHash])
  @@index([tenantId, createdAt])
  @@index([tenantId, approvedAt])
  @@index([tenantId, sealedAt])
  @@index([tenantId, archivedAt])
  @@map("certified_minutes_versions")
}
```

---

## 15.4. Modelo `CertifiedMinutesSection`

```prisma id="rynrfn"
model CertifiedMinutesSection {
  id                 String              @id @default(uuid())
  tenantId           String              @map("tenant_id")
  certifiedMinutesId String              @map("certified_minutes_id")
  versionId          String              @map("version_id")

  sectionType        MinutesSectionType  @map("section_type")
  order              Int
  title              String
  body               String

  sourceType         String?             @map("source_type")
  sourceId           String?             @map("source_id")
  isRequired         Boolean             @default(false) @map("is_required")

  createdBy          String?             @map("created_by")
  updatedBy          String?             @map("updated_by")

  createdAt          DateTime            @default(now()) @map("created_at")
  updatedAt          DateTime            @updatedAt @map("updated_at")
  archivedAt         DateTime?           @map("archived_at")

  tenant             Tenant              @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  certifiedMinutes   CertifiedMinutes    @relation(fields: [certifiedMinutesId], references: [id], onDelete: Restrict)
  version            CertifiedMinutesVersion @relation(fields: [versionId], references: [id], onDelete: Restrict)

  createdByUser      UserProfile?        @relation("CertifiedMinutesSectionCreatedBy", fields: [createdBy], references: [id], onDelete: Restrict)
  updatedByUser      UserProfile?        @relation("CertifiedMinutesSectionUpdatedBy", fields: [updatedBy], references: [id], onDelete: Restrict)

  @@unique([tenantId, versionId, order])
  @@index([tenantId])
  @@index([tenantId, certifiedMinutesId])
  @@index([tenantId, versionId])
  @@index([tenantId, sectionType])
  @@index([tenantId, sourceType, sourceId])
  @@index([tenantId, isRequired])
  @@index([tenantId, archivedAt])
  @@map("certified_minutes_sections")
}
```

---

## 15.5. Modelo `CertifiedMinutesApproval`

```prisma id="tnxm3c"
model CertifiedMinutesApproval {
  id                 String            @id @default(uuid())
  tenantId           String            @map("tenant_id")
  certifiedMinutesId String            @map("certified_minutes_id")
  versionId          String            @map("version_id")

  approverUserId     String            @map("approver_user_id")
  approverRole       String?           @map("approver_role")
  decision           ApprovalDecision
  comments           String?

  decidedAt          DateTime          @map("decided_at")
  createdAt          DateTime          @default(now()) @map("created_at")
  archivedAt         DateTime?         @map("archived_at")

  tenant             Tenant            @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  certifiedMinutes   CertifiedMinutes  @relation(fields: [certifiedMinutesId], references: [id], onDelete: Restrict)
  version            CertifiedMinutesVersion @relation(fields: [versionId], references: [id], onDelete: Restrict)
  approverUser       UserProfile       @relation("CertifiedMinutesApprovalApprover", fields: [approverUserId], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([tenantId, certifiedMinutesId])
  @@index([tenantId, versionId])
  @@index([tenantId, approverUserId])
  @@index([tenantId, decision])
  @@index([tenantId, decidedAt])
  @@index([tenantId, archivedAt])
  @@map("certified_minutes_approvals")
}
```

---

## 15.6. Modelo `CertifiedMinutesAttachment`

```prisma id="dwfspm"
model CertifiedMinutesAttachment {
  id                 String                           @id @default(uuid())
  tenantId           String                           @map("tenant_id")
  certifiedMinutesId String                           @map("certified_minutes_id")
  versionId          String?                          @map("version_id")

  fileName           String                           @map("file_name")
  fileType           String?                          @map("file_type")
  mimeType           String                           @map("mime_type")
  fileSize           Int                              @map("file_size")
  storageKey         String                           @map("storage_key")
  fileHash           String?                          @map("file_hash")
  hashAlgorithm      HashAlgorithm?                   @map("hash_algorithm")
  attachmentType     CertifiedMinutesAttachmentType   @map("attachment_type")
  status             CertifiedMinutesAttachmentStatus @default(UPLOADED)

  uploadedBy         String?                          @map("uploaded_by")
  archivedBy         String?                          @map("archived_by")
  uploadedAt         DateTime                         @default(now()) @map("uploaded_at")
  archivedAt         DateTime?                        @map("archived_at")

  metadata           Json?

  tenant             Tenant                           @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  certifiedMinutes   CertifiedMinutes                 @relation(fields: [certifiedMinutesId], references: [id], onDelete: Restrict)
  version            CertifiedMinutesVersion?         @relation(fields: [versionId], references: [id], onDelete: Restrict)

  uploadedByUser     UserProfile?                     @relation("CertifiedMinutesAttachmentUploadedBy", fields: [uploadedBy], references: [id], onDelete: Restrict)
  archivedByUser     UserProfile?                     @relation("CertifiedMinutesAttachmentArchivedBy", fields: [archivedBy], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([tenantId, certifiedMinutesId])
  @@index([tenantId, versionId])
  @@index([tenantId, attachmentType])
  @@index([tenantId, status])
  @@index([tenantId, mimeType])
  @@index([tenantId, fileHash])
  @@index([tenantId, uploadedAt])
  @@index([tenantId, archivedAt])
  @@map("certified_minutes_attachments")
}
```

---

## 15.7. Modelo `CertifiedMinutesArtifact`

```prisma id="wxkc1z"
model CertifiedMinutesArtifact {
  id                 String                         @id @default(uuid())
  tenantId           String                         @map("tenant_id")
  certifiedMinutesId String                         @map("certified_minutes_id")
  versionId          String                         @map("version_id")

  artifactType       CertifiedMinutesArtifactType   @map("artifact_type")
  status             CertifiedMinutesArtifactStatus @default(PENDING)

  fileName           String?                        @map("file_name")
  storageKey         String?                        @map("storage_key")
  mimeType           String?                        @map("mime_type")
  fileSize           Int?                           @map("file_size")
  artifactHash       String?                        @map("artifact_hash")
  hashAlgorithm      HashAlgorithm?                 @map("hash_algorithm")
  isOfficial         Boolean                        @default(false) @map("is_official")

  generatedBy        String?                        @map("generated_by")
  archivedBy         String?                        @map("archived_by")
  generatedAt        DateTime?                      @map("generated_at")
  archivedAt         DateTime?                      @map("archived_at")

  metadata           Json?

  tenant             Tenant                         @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  certifiedMinutes   CertifiedMinutes               @relation(fields: [certifiedMinutesId], references: [id], onDelete: Restrict)
  version            CertifiedMinutesVersion        @relation(fields: [versionId], references: [id], onDelete: Restrict)

  generatedByUser    UserProfile?                   @relation("CertifiedMinutesArtifactGeneratedBy", fields: [generatedBy], references: [id], onDelete: Restrict)
  archivedByUser     UserProfile?                   @relation("CertifiedMinutesArtifactArchivedBy", fields: [archivedBy], references: [id], onDelete: Restrict)

  publications       CertifiedMinutesPublication[]
  accessLogs         CertifiedMinutesAccessLog[]

  @@index([tenantId])
  @@index([tenantId, certifiedMinutesId])
  @@index([tenantId, versionId])
  @@index([tenantId, artifactType])
  @@index([tenantId, status])
  @@index([tenantId, isOfficial])
  @@index([tenantId, artifactHash])
  @@index([tenantId, generatedAt])
  @@index([tenantId, archivedAt])
  @@map("certified_minutes_artifacts")
}
```

---

## 15.8. Modelo `CertifiedMinutesPublication`

```prisma id="ezxjbc"
model CertifiedMinutesPublication {
  id                    String                            @id @default(uuid())
  tenantId              String                            @map("tenant_id")
  certifiedMinutesId    String                            @map("certified_minutes_id")
  versionId             String                            @map("version_id")
  artifactId            String?                           @map("artifact_id")

  audienceType          CertifiedMinutesAudienceType      @map("audience_type")
  audienceRules         Json?                             @map("audience_rules")
  status                CertifiedMinutesPublicationStatus @default(DRAFT)
  notificationRequested Boolean                           @default(false) @map("notification_requested")

  publishedBy           String?                           @map("published_by")
  revokedBy             String?                           @map("revoked_by")
  archivedBy            String?                           @map("archived_by")

  publishedAt           DateTime?                         @map("published_at")
  revokedAt             DateTime?                         @map("revoked_at")
  revocationReason      String?                           @map("revocation_reason")
  expiresAt             DateTime?                         @map("expires_at")

  createdAt             DateTime                          @default(now()) @map("created_at")
  archivedAt            DateTime?                         @map("archived_at")

  tenant                Tenant                            @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  certifiedMinutes      CertifiedMinutes                  @relation(fields: [certifiedMinutesId], references: [id], onDelete: Restrict)
  version               CertifiedMinutesVersion           @relation(fields: [versionId], references: [id], onDelete: Restrict)
  artifact              CertifiedMinutesArtifact?         @relation(fields: [artifactId], references: [id], onDelete: Restrict)

  publishedByUser       UserProfile?                      @relation("CertifiedMinutesPublicationPublishedBy", fields: [publishedBy], references: [id], onDelete: Restrict)
  revokedByUser         UserProfile?                      @relation("CertifiedMinutesPublicationRevokedBy", fields: [revokedBy], references: [id], onDelete: Restrict)
  archivedByUser        UserProfile?                      @relation("CertifiedMinutesPublicationArchivedBy", fields: [archivedBy], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([tenantId, certifiedMinutesId])
  @@index([tenantId, versionId])
  @@index([tenantId, artifactId])
  @@index([tenantId, audienceType])
  @@index([tenantId, status])
  @@index([tenantId, publishedAt])
  @@index([tenantId, revokedAt])
  @@index([tenantId, expiresAt])
  @@index([tenantId, archivedAt])
  @@map("certified_minutes_publications")
}
```

---

## 15.9. Modelo `CertifiedMinutesAccessLog`

```prisma id="lwg3bp"
model CertifiedMinutesAccessLog {
  id                 String                         @id @default(uuid())
  tenantId           String                         @map("tenant_id")
  certifiedMinutesId String                         @map("certified_minutes_id")
  versionId          String?                        @map("version_id")
  artifactId         String?                        @map("artifact_id")

  actorUserId        String?                        @map("actor_user_id")
  accessType         CertifiedMinutesAccessType     @map("access_type")
  outcome            CertifiedMinutesAccessOutcome

  ipAddressHash      String?                        @map("ip_address_hash")
  userAgentHash      String?                        @map("user_agent_hash")
  accessedAt         DateTime                       @default(now()) @map("accessed_at")
  traceId            String?                        @map("trace_id")

  metadata           Json?

  tenant             Tenant                         @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  certifiedMinutes   CertifiedMinutes               @relation(fields: [certifiedMinutesId], references: [id], onDelete: Restrict)
  version            CertifiedMinutesVersion?       @relation(fields: [versionId], references: [id], onDelete: Restrict)
  artifact           CertifiedMinutesArtifact?      @relation(fields: [artifactId], references: [id], onDelete: Restrict)
  actorUser          UserProfile?                   @relation("CertifiedMinutesAccessActor", fields: [actorUserId], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([tenantId, certifiedMinutesId])
  @@index([tenantId, versionId])
  @@index([tenantId, artifactId])
  @@index([tenantId, actorUserId])
  @@index([tenantId, accessType])
  @@index([tenantId, outcome])
  @@index([tenantId, accessedAt])
  @@index([tenantId, traceId])
  @@map("certified_minutes_access_logs")
}
```

---

# 16. Relaciones requeridas en modelos existentes

## 16.1. Tenant

```prisma id="o3a3me"
model Tenant {
  // campos existentes...

  certifiedMinutes             CertifiedMinutes[]
  certifiedMinutesVersions     CertifiedMinutesVersion[]
  certifiedMinutesSections     CertifiedMinutesSection[]
  certifiedMinutesApprovals    CertifiedMinutesApproval[]
  certifiedMinutesAttachments  CertifiedMinutesAttachment[]
  certifiedMinutesArtifacts    CertifiedMinutesArtifact[]
  certifiedMinutesPublications CertifiedMinutesPublication[]
  certifiedMinutesAccessLogs   CertifiedMinutesAccessLog[]
}
```

---

## 16.2. UserProfile

```prisma id="nyzk3q"
model UserProfile {
  // campos existentes...

  certifiedMinutesCreated      CertifiedMinutes[] @relation("CertifiedMinutesCreatedBy")
  certifiedMinutesUpdated      CertifiedMinutes[] @relation("CertifiedMinutesUpdatedBy")
  certifiedMinutesSubmitted    CertifiedMinutes[] @relation("CertifiedMinutesSubmittedBy")
  certifiedMinutesApproved     CertifiedMinutes[] @relation("CertifiedMinutesApprovedBy")
  certifiedMinutesSealed       CertifiedMinutes[] @relation("CertifiedMinutesSealedBy")
  certifiedMinutesPublished    CertifiedMinutes[] @relation("CertifiedMinutesPublishedBy")
  certifiedMinutesArchived     CertifiedMinutes[] @relation("CertifiedMinutesArchivedBy")
  certifiedMinutesCancelled    CertifiedMinutes[] @relation("CertifiedMinutesCancelledBy")

  certifiedMinutesVersionsCreated  CertifiedMinutesVersion[] @relation("CertifiedMinutesVersionCreatedBy")
  certifiedMinutesVersionsApproved CertifiedMinutesVersion[] @relation("CertifiedMinutesVersionApprovedBy")
  certifiedMinutesVersionsSealed   CertifiedMinutesVersion[] @relation("CertifiedMinutesVersionSealedBy")

  certifiedMinutesSectionsCreated  CertifiedMinutesSection[] @relation("CertifiedMinutesSectionCreatedBy")
  certifiedMinutesSectionsUpdated  CertifiedMinutesSection[] @relation("CertifiedMinutesSectionUpdatedBy")

  certifiedMinutesApprovals        CertifiedMinutesApproval[] @relation("CertifiedMinutesApprovalApprover")

  certifiedMinutesAttachmentsUploaded CertifiedMinutesAttachment[] @relation("CertifiedMinutesAttachmentUploadedBy")
  certifiedMinutesAttachmentsArchived CertifiedMinutesAttachment[] @relation("CertifiedMinutesAttachmentArchivedBy")

  certifiedMinutesArtifactsGenerated  CertifiedMinutesArtifact[] @relation("CertifiedMinutesArtifactGeneratedBy")
  certifiedMinutesArtifactsArchived   CertifiedMinutesArtifact[] @relation("CertifiedMinutesArtifactArchivedBy")

  certifiedMinutesPublicationsPublished CertifiedMinutesPublication[] @relation("CertifiedMinutesPublicationPublishedBy")
  certifiedMinutesPublicationsRevoked   CertifiedMinutesPublication[] @relation("CertifiedMinutesPublicationRevokedBy")
  certifiedMinutesPublicationsArchived  CertifiedMinutesPublication[] @relation("CertifiedMinutesPublicationArchivedBy")

  certifiedMinutesAccessLogs CertifiedMinutesAccessLog[] @relation("CertifiedMinutesAccessActor")
}
```

---

## 16.3. Meeting

```prisma id="x52sq7"
model Meeting {
  // campos existentes...

  certifiedMinutes CertifiedMinutes[]
}
```

---

## 16.4. MeetingMinutes

```prisma id="elmt31"
model MeetingMinutes {
  // campos existentes...

  certifiedMinutesAsSource CertifiedMinutes[]
}
```

Nota:

```text id="hn6vgi"
El nombre real del modelo MeetingMinutes debe ajustarse a la implementación final de 013-meetings-attendance.
```

---

# 17. Constraints recomendadas

## 17.1. `certified_minutes`

```text id="zre4vk"
tenant_id NOT NULL
meeting_id NOT NULL
title NOT NULL
status NOT NULL
visibility NOT NULL
certification_mode NOT NULL
meeting_id debe pertenecer al mismo tenant
source_meeting_minutes_id debe pertenecer al mismo tenant y reunión
status = submitted/approved/sealed/published requiere fechas correspondientes
status = cancelled requiere cancelled_at, cancelled_by, cancellation_reason
status = sealed requiere seal_hash y seal_algorithm
status = published requiere published_version_id
```

---

## 17.2. `certified_minutes_versions`

```text id="drdv1u"
tenant_id NOT NULL
certified_minutes_id NOT NULL
version_number NOT NULL
status NOT NULL
title NOT NULL
content_snapshot NOT NULL
UNIQUE (tenant_id, certified_minutes_id, version_number)
content_hash requiere hash_algorithm
status = approved requiere approved_at
status = sealed requiere sealed_at, content_hash, hash_algorithm
```

---

## 17.3. `certified_minutes_sections`

```text id="cpjcrj"
tenant_id NOT NULL
certified_minutes_id NOT NULL
version_id NOT NULL
section_type NOT NULL
order NOT NULL
title NOT NULL
body NOT NULL
UNIQUE (tenant_id, version_id, order)
version_id debe pertenecer a certified_minutes_id
no editar si version.status = sealed
```

---

## 17.4. `certified_minutes_approvals`

```text id="yx8lx4"
tenant_id NOT NULL
certified_minutes_id NOT NULL
version_id NOT NULL
approver_user_id NOT NULL
decision NOT NULL
decided_at NOT NULL
comments requerido si decision IN rejected, changesRequested
version_id debe pertenecer a certified_minutes_id
```

---

## 17.5. `certified_minutes_attachments`

```text id="agmivu"
tenant_id NOT NULL
certified_minutes_id NOT NULL
file_name NOT NULL
mime_type NOT NULL
file_size > 0
storage_key NOT NULL
attachment_type NOT NULL
status NOT NULL
uploaded_at NOT NULL
file_hash requiere hash_algorithm
```

---

## 17.6. `certified_minutes_artifacts`

```text id="kx7afb"
tenant_id NOT NULL
certified_minutes_id NOT NULL
version_id NOT NULL
artifact_type NOT NULL
status NOT NULL
status = generated requiere storage_key, file_name, mime_type, file_size, artifact_hash, hash_algorithm, generated_at
file_size > 0 si no es null
is_official = true requiere version.status IN approved, sealed
```

---

## 17.7. `certified_minutes_publications`

```text id="m465jz"
tenant_id NOT NULL
certified_minutes_id NOT NULL
version_id NOT NULL
audience_type NOT NULL
status NOT NULL
status = published requiere published_by, published_at
status = revoked requiere revoked_by, revoked_at, revocation_reason
audience_rules requerido para mixed, restricted, propertyUnits, specificUsers, roles
expires_at debe ser posterior a published_at si ambos existen
```

---

## 17.8. `certified_minutes_access_logs`

```text id="n24gmi"
tenant_id NOT NULL
certified_minutes_id NOT NULL
access_type NOT NULL
outcome NOT NULL
accessed_at NOT NULL
metadata sanitizada
no storage_key
no URL firmada
no contenido completo
```

---

# 18. Índices recomendados

## 18.1. `certified_minutes`

```text id="sw5mov"
tenant_id
tenant_id + meeting_id
tenant_id + source_meeting_minutes_id
tenant_id + status
tenant_id + visibility
tenant_id + certification_mode
tenant_id + code
tenant_id + current_version_id
tenant_id + approved_version_id
tenant_id + sealed_version_id
tenant_id + published_version_id
tenant_id + submitted_at
tenant_id + approved_at
tenant_id + sealed_at
tenant_id + published_at
tenant_id + archived_at
```

---

## 18.2. `certified_minutes_versions`

```text id="w0fz3v"
tenant_id
tenant_id + certified_minutes_id
tenant_id + certified_minutes_id + version_number unique
tenant_id + status
tenant_id + content_hash
tenant_id + created_at
tenant_id + approved_at
tenant_id + sealed_at
tenant_id + archived_at
```

---

## 18.3. `certified_minutes_sections`

```text id="ku66dn"
tenant_id
tenant_id + certified_minutes_id
tenant_id + version_id
tenant_id + version_id + order unique
tenant_id + section_type
tenant_id + source_type + source_id
tenant_id + is_required
tenant_id + archived_at
```

---

## 18.4. `certified_minutes_approvals`

```text id="q7s8kt"
tenant_id
tenant_id + certified_minutes_id
tenant_id + version_id
tenant_id + approver_user_id
tenant_id + decision
tenant_id + decided_at
tenant_id + archived_at
```

---

## 18.5. `certified_minutes_attachments`

```text id="blmkow"
tenant_id
tenant_id + certified_minutes_id
tenant_id + version_id
tenant_id + attachment_type
tenant_id + status
tenant_id + mime_type
tenant_id + file_hash
tenant_id + uploaded_at
tenant_id + archived_at
```

---

## 18.6. `certified_minutes_artifacts`

```text id="ywzfv5"
tenant_id
tenant_id + certified_minutes_id
tenant_id + version_id
tenant_id + artifact_type
tenant_id + status
tenant_id + is_official
tenant_id + artifact_hash
tenant_id + generated_at
tenant_id + archived_at
```

---

## 18.7. `certified_minutes_publications`

```text id="axwct1"
tenant_id
tenant_id + certified_minutes_id
tenant_id + version_id
tenant_id + artifact_id
tenant_id + audience_type
tenant_id + status
tenant_id + published_at
tenant_id + revoked_at
tenant_id + expires_at
tenant_id + archived_at
```

---

## 18.8. `certified_minutes_access_logs`

```text id="aa9ncf"
tenant_id
tenant_id + certified_minutes_id
tenant_id + version_id
tenant_id + artifact_id
tenant_id + actor_user_id
tenant_id + access_type
tenant_id + outcome
tenant_id + accessed_at
tenant_id + trace_id
```

---

# 19. Índices parciales raw recomendados

## 19.1. Una acta activa principal por reunión

```sql id="opd5aw"
CREATE UNIQUE INDEX certified_minutes_one_active_per_meeting
ON certified_minutes(tenant_id, meeting_id)
WHERE archived_at IS NULL
  AND status NOT IN ('cancelled', 'archived', 'superseded');
```

---

## 19.2. Código único activo por tenant

```sql id="iv4qmf"
CREATE UNIQUE INDEX certified_minutes_unique_active_code_per_tenant
ON certified_minutes(tenant_id, code)
WHERE code IS NOT NULL
  AND archived_at IS NULL
  AND status NOT IN ('cancelled', 'archived');
```

---

## 19.3. Una publicación activa por acta, versión y audiencia

```sql id="f5ogku"
CREATE UNIQUE INDEX certified_minutes_one_active_publication_per_audience
ON certified_minutes_publications(tenant_id, certified_minutes_id, version_id, audience_type)
WHERE archived_at IS NULL
  AND status = 'published';
```

---

## 19.4. Un artefacto PDF oficial activo por versión

```sql id="m4lyl8"
CREATE UNIQUE INDEX certified_minutes_one_official_pdf_per_version
ON certified_minutes_artifacts(tenant_id, version_id)
WHERE artifact_type = 'pdf'
  AND is_official = true
  AND archived_at IS NULL
  AND status = 'generated';
```

---

# 20. Reglas de multitenancy

Todas las tablas nuevas tienen `tenant_id`.

Regla obligatoria:

```text id="g1bgyq"
Toda consulta tenant-scoped debe filtrar por tenant_id.
```

No se acepta:

```text id="x7ehw6"
buscar certifiedMinutes solo por certifiedMinutesId
buscar version solo por versionId
buscar section solo por sectionId
buscar approval solo por approvalId
buscar attachment solo por attachmentId
buscar artifact solo por artifactId
buscar publication solo por publicationId
usar meetingId de otro tenant
usar sourceMeetingMinutesId de otro tenant
usar votingResultId de otro tenant
usar meetingResolutionId de otro tenant
```

Patrón requerido:

```typescript id="vf81pn"
await prisma.certifiedMinutes.findFirst({
  where: {
    id: certifiedMinutesId,
    tenantId: currentTenant.id,
    archivedAt: null
  }
});
```

Patrón prohibido:

```typescript id="cfu511"
await prisma.certifiedMinutes.findUnique({
  where: { id: certifiedMinutesId }
});
```

---

# 21. Reglas de versionado e inmutabilidad

## 21.1. Versión editable

Solo se puede editar:

```text id="xpjf6d"
CertifiedMinutes.status IN draft, changesRequested
AND CertifiedMinutesVersion.status = draft
```

---

## 21.2. Versión no editable

No se puede editar:

```text id="x903nm"
approved
sealed
published
superseded
cancelled
archived
```

---

## 21.3. Nueva versión obligatoria

Si el acta ya fue aprobada, sellada o publicada, cualquier corrección debe crear una nueva versión.

```text id="trogyt"
No se sobrescribe una versión sellada.
```

---

## 21.4. Contenido snapshot

`contentSnapshot` debe contener una representación estructurada de la versión, por ejemplo:

```json id="dy90fc"
{
  "title": "Acta de Asamblea Ordinaria 2026",
  "meeting": {
    "meetingId": "meeting_uuid",
    "meetingDate": "2026-08-15T15:00:00Z",
    "meetingType": "ordinaryAssembly"
  },
  "sections": [
    {
      "sectionType": "header",
      "order": 1,
      "title": "Encabezado",
      "body": "Contenido sanitizado"
    }
  ],
  "snapshots": {
    "attendanceSummary": {
      "present": 25,
      "represented": 3,
      "absent": 12
    },
    "quorum": {
      "met": true,
      "value": "70.00"
    }
  }
}
```

No debe incluir:

```text id="k7oc44"
tokens
secretos
storageKey
URLs firmadas
datos personales innecesarios
votos individuales en secretBasic
contenido de adjuntos completo
```

---

# 22. Reglas de hash y canonicalización

## 22.1. Algoritmo MVP

```text id="fphimn"
SHA-256
```

---

## 22.2. Canonicalización

Antes de calcular `contentHash` o `sealHash`, normalizar:

```text id="vvolmn"
orden de secciones
saltos de línea
espacios redundantes
valores null
fechas ISO 8601 UTC
orden de claves JSON
codificación UTF-8
metadata segura
```

---

## 22.3. Hash de versión

```text id="u0gecn"
contentHash = SHA-256(canonicalized contentSnapshot)
```

---

## 22.4. Hash de sellado

```text id="bxtky4"
sealHash = SHA-256(canonicalized version content + approval metadata + meeting reference + versionNumber)
```

---

## 22.5. Hash de artefacto

```text id="xa9npx"
artifactHash = SHA-256(binary artifact)
```

---

## 22.6. Regla de seguridad

El hash no debe presentarse como:

```text id="qyit8s"
firma electrónica legal
certificación notarial
sellado de tiempo externo
validación legal automática
```

---

# 23. Reglas de publicación y audiencia

## 23.1. Audiencias

Audiencias MVP:

```text id="g4fw9g"
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

## 23.2. `audienceRules`

`audienceRules` debe ser JSON validado y minimizado.

Ejemplo para unidades específicas:

```json id="w5gsah"
{
  "propertyUnitIds": [
    "property_unit_uuid_1",
    "property_unit_uuid_2"
  ]
}
```

Ejemplo para usuarios específicos:

```json id="ut4hcz"
{
  "userIds": [
    "user_uuid_1",
    "user_uuid_2"
  ]
}
```

Ejemplo para roles:

```json id="qroln2"
{
  "roleIds": [
    "role_uuid_1",
    "role_uuid_2"
  ]
}
```

Regla:

```text id="ogauf1"
Todos los IDs dentro de audienceRules deben validarse contra tenant_id.
```

---

## 23.3. Acceso propio

El acceso `/me` se resuelve usando:

```text id="wlv4j8"
actorUserId
actorPersonIds
actorPropertyUnitIds
actorRoleIds
meetingParticipant relation
publication audienceType
publication audienceRules
publication status = published
publication expiresAt
```

---

## 23.4. Publicación válida

Una publicación propia es visible si:

```text id="h0pxls"
publication.status = published
AND publication.archivedAt IS NULL
AND certifiedMinutes.status = published
AND now <= expiresAt si expiresAt existe
AND actor pertenece a la audiencia
```

---

# 24. Reglas de storage

## 24.1. `storageKey`

`storageKey` se persiste internamente, pero nunca se expone al cliente.

Permitido internamente:

```text id="ne26tu"
certified-minutes/{tenantId}/{certifiedMinutesId}/artifacts/{artifactId}.pdf
```

No exponer:

```text id="zad8oz"
bucket
path interno
storageKey
URL permanente
credenciales
URL firmada persistente
provider metadata sensible
```

---

## 24.2. Descarga

La descarga debe resolverse mediante:

```text id="ehwzln"
endpoint controlado
streaming seguro
o URL temporal corta generada después de autorización
```

Debe auditar:

```text id="p28x4b"
certifiedMinutesArtifact.downloaded
certifiedMinutesAttachment.downloaded
certifiedMinutesAccess.downloaded
```

---

## 24.3. File hash

Todo artefacto y adjunto debe tener hash cuando esté disponible.

```text id="twj6to"
fileHash / artifactHash = SHA-256(binary file)
```

---

# 25. DTOs derivados del modelo

## 25.1. CertifiedMinutesAdminDto

```text id="nzy3hk"
id
meetingId
sourceMeetingMinutesId
title
code
status
visibility
certificationMode
currentVersionId
approvedVersionId
sealedVersionId
publishedVersionId
submittedAt
approvedAt
sealedAt
publishedAt
archivedAt
cancelledAt
cancellationReason
sealHashPrefix
sealAlgorithm
createdAt
updatedAt
```

No incluye:

```text id="ztzg80"
sealHash completo salvo permiso explícito
metadata sensible
contenido completo en listados
storageKey
URLs firmadas
```

---

## 25.2. CertifiedMinutesListItemDto

```text id="oxzpzu"
id
meetingId
title
code
status
visibility
certificationMode
currentVersionId
publishedVersionId
submittedAt
approvedAt
sealedAt
publishedAt
updatedAt
```

---

## 25.3. CertifiedMinutesVersionDto

```text id="b66k8q"
id
certifiedMinutesId
versionNumber
status
title
summary
contentSnapshot
contentHashPrefix
hashAlgorithm
changeReason
createdAt
approvedAt
sealedAt
archivedAt
```

---

## 25.4. CertifiedMinutesSectionDto

```text id="l0na8w"
id
certifiedMinutesId
versionId
sectionType
order
title
body
sourceType
sourceId
isRequired
createdAt
updatedAt
archivedAt
```

---

## 25.5. CertifiedMinutesApprovalDto

```text id="nyrxf3"
id
certifiedMinutesId
versionId
approverUserId
approverRole
decision
comments
decidedAt
createdAt
```

---

## 25.6. CertifiedMinutesAttachmentDto

```text id="vmajqy"
id
certifiedMinutesId
versionId
fileName
fileType
mimeType
fileSize
fileHashPrefix
hashAlgorithm
attachmentType
status
uploadedAt
archivedAt
```

No incluye:

```text id="kwwzwp"
storageKey
URL persistente
provider metadata sensible
```

---

## 25.7. CertifiedMinutesArtifactDto

```text id="bam1rf"
id
certifiedMinutesId
versionId
artifactType
status
fileName
mimeType
fileSize
artifactHashPrefix
hashAlgorithm
isOfficial
generatedAt
archivedAt
```

No incluye:

```text id="p65j7y"
storageKey
URL firmada persistente
bucket
path interno
```

---

## 25.8. CertifiedMinutesPublicationDto

```text id="n2k9z4"
id
certifiedMinutesId
versionId
artifactId
audienceType
audienceRules
status
notificationRequested
publishedAt
revokedAt
revocationReason
expiresAt
createdAt
archivedAt
```

---

## 25.9. OwnCertifiedMinutesDto

```text id="u054ns"
id
meetingId
title
code
status
visibility
publishedAt
artifactAvailable
sections
```

No incluye:

```text id="sdnwe5"
actas no publicadas
metadata interna
audienceRules completas si revelan terceros
storageKey
auditoría
aprobaciones internas
contenido restringido
```

---

## 25.10. OwnCertifiedMinutesArtifactDto

```text id="biccnn"
id
certifiedMinutesId
artifactType
fileName
mimeType
fileSize
artifactHashPrefix
isOfficial
generatedAt
downloadAvailable
```

---

# 26. Reglas de consulta

## 26.1. Filtros administrativos

```text id="hir7wi"
status
visibility
certificationMode
meetingId
code
submittedFrom
submittedTo
approvedFrom
approvedTo
sealedFrom
sealedTo
publishedFrom
publishedTo
q
page
pageSize
sortBy
sortOrder
```

Sort permitido:

```text id="nmsnkb"
createdAt
updatedAt
submittedAt
approvedAt
sealedAt
publishedAt
title
code
status
```

---

## 26.2. Filtros de versiones

```text id="ve1niv"
status
versionNumber
createdFrom
createdTo
page
pageSize
```

---

## 26.3. Filtros de secciones

```text id="ex2byd"
sectionType
versionId
sourceType
isRequired
page
pageSize
sortBy=order
```

---

## 26.4. Filtros de publicaciones

```text id="nh714m"
status
audienceType
publishedFrom
publishedTo
expiresFrom
expiresTo
page
pageSize
```

---

## 26.5. Filtros `/me`

```text id="lgxi2a"
meetingId
publishedFrom
publishedTo
audienceType
q
page
pageSize
sortBy
sortOrder
```

---

# 27. Queries conceptuales

## 27.1. Listar actas administrativas

```sql id="acbm9x"
SELECT
  id,
  meeting_id,
  title,
  code,
  status,
  visibility,
  certification_mode,
  current_version_id,
  published_version_id,
  submitted_at,
  approved_at,
  sealed_at,
  published_at,
  updated_at
FROM certified_minutes
WHERE tenant_id = $1
  AND archived_at IS NULL
ORDER BY updated_at DESC
LIMIT $2 OFFSET $3;
```

---

## 27.2. Obtener acta por tenant

```sql id="a42mok"
SELECT *
FROM certified_minutes
WHERE tenant_id = $1
  AND id = $2
  AND archived_at IS NULL
LIMIT 1;
```

---

## 27.3. Obtener versión por tenant

```sql id="jrrpyo"
SELECT *
FROM certified_minutes_versions
WHERE tenant_id = $1
  AND id = $2
  AND archived_at IS NULL
LIMIT 1;
```

---

## 27.4. Obtener secciones de versión

```sql id="xnh5r9"
SELECT
  id,
  section_type,
  "order",
  title,
  body,
  source_type,
  source_id,
  is_required
FROM certified_minutes_sections
WHERE tenant_id = $1
  AND version_id = $2
  AND archived_at IS NULL
ORDER BY "order" ASC;
```

---

## 27.5. Consultar actas propias publicadas

```sql id="jzcgcz"
SELECT cm.*
FROM certified_minutes cm
JOIN certified_minutes_publications cmp
  ON cmp.certified_minutes_id = cm.id
 AND cmp.tenant_id = cm.tenant_id
WHERE cm.tenant_id = $1
  AND cm.status = 'published'
  AND cm.archived_at IS NULL
  AND cmp.status = 'published'
  AND cmp.archived_at IS NULL
  AND (cmp.expires_at IS NULL OR cmp.expires_at >= now())
ORDER BY cm.published_at DESC
LIMIT $2 OFFSET $3;
```

Nota:

```text id="dmyb8t"
La condición de audiencia debe resolverse en servicio/policy porque depende de actorUserId, actorPersonIds, actorPropertyUnitIds, actorRoleIds y audienceRules.
```

---

## 27.6. Registrar acceso documental

```sql id="uulz2o"
INSERT INTO certified_minutes_access_logs (
  id,
  tenant_id,
  certified_minutes_id,
  version_id,
  artifact_id,
  actor_user_id,
  access_type,
  outcome,
  ip_address_hash,
  user_agent_hash,
  accessed_at,
  trace_id,
  metadata
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now(), $11, $12
);
```

---

# 28. Soft delete y archivo

No se debe eliminar físicamente:

```text id="yzhfon"
certified_minutes
certified_minutes_versions
certified_minutes_sections
certified_minutes_approvals
certified_minutes_attachments
certified_minutes_artifacts
certified_minutes_publications
certified_minutes_access_logs
```

Regla:

```text id="ux3wpt"
archivedAt != null representa archivo lógico.
```

Para entidades con estado, usar además:

```text id="e2rfau"
status = archived
```

cuando aplique.

Motivos:

* trazabilidad documental;
* evidencia administrativa;
* integridad de decisiones;
* auditoría;
* revisión posterior;
* futuras impugnaciones;
* futura firma electrónica;
* futura verificación externa.

---

# 29. Reglas de metadata

No guardar en `metadata`:

```text id="lqkn1d"
passwords
tokens
api keys
client secrets
cookies
authorization headers
contenido completo del acta si no corresponde
contenido completo de adjuntos
storageKey duplicado
URL firmada
emails completos
teléfonos completos
cédulas
firmas
documentos completos
stack traces
SQL raw
provider payloads completos
```

Permitido:

```text id="zasy7m"
traceId
correlationId
safe sourceType
safe sourceId
safe processing flags
safe artifact metadata
safe validation results
safe hash prefix
safe publication configuration
non-sensitive notes
```

---

# 30. Auditoría desde modelo

Eventos mínimos:

```text id="z1l7ne"
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

Metadata permitida:

```text id="yy6q5x"
certifiedMinutesId
meetingId
sourceMeetingMinutesId
versionId
sectionId
approvalId
attachmentId
artifactId
publicationId
status
versionNumber
visibility
certificationMode
sealAlgorithm
sealHashPrefix
artifactHashPrefix
audienceType
accessType
outcome
traceId
```

Metadata prohibida:

```text id="wxeuzo"
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

# 31. Migración

Nombre sugerido:

```text id="pwt54x"
015_create_certified_minutes
```

Pasos:

```text id="y9nr8t"
1. Crear enums de certified minutes.
2. Crear certified_minutes.
3. Crear certified_minutes_versions.
4. Crear certified_minutes_sections.
5. Crear certified_minutes_approvals.
6. Crear certified_minutes_attachments.
7. Crear certified_minutes_artifacts.
8. Crear certified_minutes_publications.
9. Crear certified_minutes_access_logs.
10. Crear índices básicos.
11. Crear constraints básicos.
12. Crear índices parciales raw.
13. Agregar relaciones Prisma.
14. Generar Prisma Client.
15. Ejecutar migración en DB test.
16. Ejecutar seeds demo.
17. Validar tests de repositorio.
```

---

# 32. Migraciones raw opcionales

## 32.1. Validar `file_size > 0` en adjuntos

```sql id="n5u4n1"
ALTER TABLE certified_minutes_attachments
ADD CONSTRAINT certified_minutes_attachments_file_size_positive
CHECK (file_size > 0);
```

---

## 32.2. Validar `file_size > 0` en artefactos

```sql id="ge7f31"
ALTER TABLE certified_minutes_artifacts
ADD CONSTRAINT certified_minutes_artifacts_file_size_positive
CHECK (file_size IS NULL OR file_size > 0);
```

---

## 32.3. Validar expiración posterior a publicación

```sql id="vzgohl"
ALTER TABLE certified_minutes_publications
ADD CONSTRAINT certified_minutes_publications_valid_expiration
CHECK (
  expires_at IS NULL
  OR published_at IS NULL
  OR expires_at > published_at
);
```

---

## 32.4. Validar comentario en rechazo o cambios solicitados

Esta regla se recomienda en servicio, porque depende del enum y del flujo de negocio.

```text id="yy5245"
decision IN rejected, changesRequested requiere comments no vacío.
```

---

## 32.5. Validar versión sellada con hash

Esta regla se recomienda en servicio y puede reforzarse con constraint si la implementación lo requiere.

```text id="u692hr"
status = sealed requiere content_hash y hash_algorithm.
```

---

# 33. Seeds

## 33.1. Certified minutes demo

```text id="t5t3v7"
certifiedMinutesDraftA
certifiedMinutesUnderReviewA
certifiedMinutesChangesRequestedA
certifiedMinutesApprovedA
certifiedMinutesSealedA
certifiedMinutesPublishedA
certifiedMinutesCancelledA
certifiedMinutesArchivedA
certifiedMinutesTenantB
```

---

## 33.2. Versions demo

```text id="y360ah"
certifiedMinutesVersion1A
certifiedMinutesVersion2A
certifiedMinutesVersionApprovedA
certifiedMinutesVersionSealedA
certifiedMinutesVersionTenantB
```

---

## 33.3. Sections demo

```text id="tw7ii4"
sectionHeaderA
sectionMeetingInfoA
sectionCallNoticeA
sectionAttendanceA
sectionQuorumA
sectionAgendaA
sectionDiscussionA
sectionVotingA
sectionResolutionsA
sectionClosureA
sectionTenantB
```

---

## 33.4. Approvals demo

```text id="phu151"
approvalApprovedA
approvalChangesRequestedA
approvalRejectedA
approvalCommentedA
approvalTenantB
```

---

## 33.5. Attachments demo

```text id="xml956"
attachmentAttendanceSheetA
attachmentVotingReportA
attachmentSupportPdfA
attachmentImageA
attachmentTenantB
```

---

## 33.6. Artifacts demo

```text id="de8xe1"
artifactPdfGeneratedA
artifactDraftPdfA
artifactHashManifestA
artifactFailedA
artifactTenantB
```

---

## 33.7. Publications demo

```text id="qxdxcd"
publicationOwnersA
publicationResidentsA
publicationBoardA
publicationMeetingParticipantsA
publicationRevokedA
publicationExpiredA
publicationTenantB
```

---

## 33.8. Access logs demo

```text id="dfn014"
accessLogViewAllowedA
accessLogDownloadAllowedA
accessLogDownloadDeniedA
accessLogTenantB
```

---

## 33.9. Datos prohibidos en seeds

```text id="oqe4uh"
nombres reales de residentes
emails reales
teléfonos reales
cédulas reales
actas reales
documentos reales
firmas reales
votos reales
storage keys reales
URLs firmadas reales
tokens
cookies
secretos
datos financieros reales
datos sancionatorios reales
```

---

# 34. Testing del modelo

## 34.1. Unit tests

```text id="l29vnx"
CertifiedMinutes entity
CertifiedMinutesVersion entity
CertifiedMinutesSection entity
CertifiedMinutesApproval entity
CertifiedMinutesAttachment entity
CertifiedMinutesArtifact entity
CertifiedMinutesPublication entity
CertifiedMinutesAccessLog entity
CertifiedMinutesStatus
CertifiedMinutesVersionStatus
CertifiedMinutesVisibility
CertificationMode
MinutesSectionType
ApprovalDecision
CertifiedMinutesAudienceType
CertifiedMinutesTitle
CertifiedMinutesCode
MinutesVersionNumber
MinutesSealHash
MinutesHashAlgorithm
MinutesPublicationWindow
```

---

## 34.2. Repository tests

```text id="zzj8jm"
create certified minutes
find certified minutes by tenant
list certified minutes
prevent second active certified minutes for meeting
update status
archive certified minutes
create version
prevent duplicate version number
create section
prevent duplicate section order
create approval
create attachment
create artifact
create publication
revoke publication
create access log
tenant A does not see tenant B records
```

---

## 34.3. Multitenancy tests

```text id="v75vx3"
tenant A no ve certifiedMinutes tenant B
tenant A no ve versions tenant B
tenant A no ve sections tenant B
tenant A no ve approvals tenant B
tenant A no ve attachments tenant B
tenant A no ve artifacts tenant B
tenant A no ve publications tenant B
tenant A no ve accessLogs tenant B
tenant A no usa meetingId tenant B
tenant A no usa sourceMeetingMinutesId tenant B
tenant A no usa versionId tenant B
tenant A no usa sectionId tenant B
tenant A no usa attachmentId tenant B
tenant A no usa artifactId tenant B
tenant A no usa publicationId tenant B
tenant A no usa votingResultId tenant B
tenant A no usa meetingResolutionId tenant B
```

---

## 34.4. Integrity tests

```text id="fk4jpa"
same canonical content same hash
content change changes hash
section reorder changes hash si order es material
sealed version immutable
artifact hash calculated
downloaded artifact hash matches
sealHashPrefix exposed safely
full sealHash restricted si política lo exige
```

---

## 34.5. Security tests

```text id="fp4s41"
no public certified minutes endpoints
no cross-tenant certified minutes
no unauthorized download
no storageKey in response
no full content in logs
no full content in audit metadata
no edit sealed version
no publish without seal
no official PDF from draft
no automatic charge generation
no automatic fine generation
no automatic resolution execution
OpenAPI no public certified minutes routes
```

---

# 35. Decisión final del modelo

El módulo `015-certified-minutes` usará las siguientes tablas:

```text id="kqpfcf"
certified_minutes
certified_minutes_versions
certified_minutes_sections
certified_minutes_approvals
certified_minutes_attachments
certified_minutes_artifacts
certified_minutes_publications
certified_minutes_access_logs
```

El modelo garantiza:

```text id="ksx0gt"
tenant isolation
meeting-bound minutes
single active certified minutes per meeting
version control
sectioned content
approval workflow
internal seal hash
artifact tracking
secure storage references
controlled publication
own access
download access logging
auditability
no public exposure
future signature readiness
```

La implementación no debe aceptarse si:

```text id="h3nx6d"
permite actas cross-tenant
permite versiones cross-tenant
permite secciones cross-tenant
permite adjuntos cross-tenant
permite artefactos cross-tenant
permite publicaciones cross-tenant
permite usar meetingId de otro tenant
permite usar sourceMeetingMinutesId de otro tenant
permite editar versión sellada
permite publicar sin sellar
permite descargar PDF sin autorización
expone storageKey
expone URL firmada persistente
genera PDF formal desde draft sin marca de borrador
no calcula hash
calcula hash no reproducible
no cambia hash ante modificación
registra contenido completo en logs
registra contenido completo en auditoría
crea endpoints públicos
documenta endpoints públicos en OpenAPI
presenta hash como firma electrónica legal
presenta MVP como certificación legal externa
ejecuta resoluciones automáticamente
genera cargos desde actas
genera multas desde actas
usa IA externa con actas reales
omite auditoría de operaciones críticas
```

---

# 36. Pendientes para evolución

Quedan diferidos:

```text id="rxzw2d"
firma electrónica legalmente válida
firma electrónica avanzada
firma electrónica cualificada
sellado de tiempo certificado
certificación notarial
verificación pública externa
blockchain
OCR de actas físicas
validación automática de firmas manuscritas
firma biométrica
transcripción automática
reconocimiento de voz
videograbación
flujo legal de impugnaciones
reconteo formal
reglas legales avanzadas
integración con entidades públicas
IA con actas reales
```

Estos diferidos no bloquean el MVP de `015-certified-minutes`.
