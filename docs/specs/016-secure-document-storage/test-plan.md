# Test Plan — Spec 016 Secure Document Storage

## 1. Información del documento

| Campo           | Valor                                                                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Proyecto        | RESIDENT Core                                                                                                                                                      |
| Spec ID         | 016                                                                                                                                                                |
| Módulo          | Secure Document Storage                                                                                                                                            |
| Documento       | Test Plan                                                                                                                                                          |
| Ruta            | `docs/specs/016-secure-document-storage/test-plan.md`                                                                                                              |
| Versión         | 0.1                                                                                                                                                                |
| Estado          | Borrador inicial                                                                                                                                                   |
| Fecha           | 2026-07-21                                                                                                                                                         |
| Documento base  | `docs/specs/016-secure-document-storage/spec.md`                                                                                                                   |
| Plan técnico    | `docs/specs/016-secure-document-storage/plan.md`                                                                                                                   |
| Modelo de datos | `docs/specs/016-secure-document-storage/data-model.md`                                                                                                             |
| Contrato API    | `docs/specs/016-secure-document-storage/api-contract.md`                                                                                                           |
| Base de datos   | PostgreSQL                                                                                                                                                         |
| ORM             | Prisma                                                                                                                                                             |
| Stack objetivo  | NestJS, TypeScript, PostgreSQL, Prisma, StoragePort, Local Adapter, S3-compatible Adapter, OpenAPI                                                                 |
| Naturaleza      | Tenant-scoped / Storage-backed / Metadata-driven / Hash-aware / Access-controlled / Source-module-aware / Own-resource-aware / Audit-heavy / Non-public by default |

---

## 2. Propósito

Este documento define la estrategia de pruebas para el módulo `016-secure-document-storage`.

El plan cubre pruebas unitarias, pruebas de entidades de dominio, validación de DTOs, servicios de aplicación, repositorios Prisma, adapters de storage, hash, validación de archivos, autorización, recurso propio, delegación por módulo origen, multitenancy, endpoints API, auditoría, observabilidad, OpenAPI, seguridad, performance, concurrencia, smoke tests y CI/CD.

Regla central:

```text id="tv1vae"
El módulo Secure Document Storage debe impedir documentos cross-tenant, archivos cross-tenant, sourceResourceId cross-tenant, ownerId cross-tenant, storageKey desde cliente, exposición de storageKey, descarga sin autorización, archivos peligrosos, binarios en JSON, binarios en logs, binarios en auditoría, endpoints públicos y uso de storage local productivo por defecto.
```

---

## 3. Objetivos de prueba

Las pruebas deben validar que el sistema:

* registra documentos lógicos tenant-scoped;
* impide aceptar `tenantId` desde body;
* impide aceptar `storageKey` desde cliente;
* valida `sourceModule`;
* valida `sourceResourceId` contra tenant;
* valida owner lógico contra tenant;
* clasifica documentos por categoría, visibilidad y sensibilidad;
* crea versiones incrementales;
* impide versiones duplicadas por documento;
* registra archivos físicos;
* genera `storageKey` en servidor;
* conserva `storageKey` solo internamente;
* valida MIME type;
* valida extensión;
* valida tamaño;
* rechaza archivo vacío;
* bloquea path traversal;
* calcula hash SHA-256;
* expone solo `hashPrefix`;
* soporta local storage en desarrollo;
* bloquea local storage por defecto en producción;
* prepara adapter S3-compatible;
* descarga archivos únicamente con autorización;
* rechaza descarga de archivos en cuarentena;
* rechaza descarga de archivos rechazados;
* rechaza descarga de archivos archivados;
* rechaza descarga de archivos missing;
* registra access logs;
* audita operaciones críticas;
* consulta documentos administrativos bajo permiso;
* consulta documentos propios bajo autorización;
* restringe upload propio a categorías permitidas;
* aplica delegación al módulo origen cuando corresponda;
* no expone binarios en JSON;
* no registra binarios en logs;
* no registra binarios en auditoría;
* no crea endpoints públicos;
* no documenta endpoints públicos en OpenAPI;
* pasa CI.

---

## 4. Alcance de pruebas

### 4.1. Incluido

```text id="dgkadu"
1. Enums.
2. Value objects.
3. Entidades de dominio.
4. Máquinas de estado.
5. DTO validation.
6. Metadata sanitizer.
7. File validation.
8. MIME validation.
9. Filename sanitizer.
10. Hash SHA-256.
11. Storage key policy.
12. Local storage adapter.
13. Mock storage adapter.
14. S3-compatible adapter mock.
15. Servicios de documentos.
16. Servicios de versiones.
17. Servicios de archivos.
18. Upload seguro.
19. Download seguro.
20. Source resource validation.
21. Owner validation.
22. Audience/visibility policy.
23. Own-resource policy.
24. Platform storage config policy.
25. Repositorios Prisma.
26. Multitenancy.
27. API administrativa.
28. API /me.
29. API platform.
30. Access logs.
31. Audit logs.
32. Observability.
33. OpenAPI.
34. Security tests.
35. Performance tests.
36. Concurrency tests.
37. Smoke tests.
38. CI/CD gates.
```

---

### 4.2. Fuera de alcance de pruebas MVP

```text id="uim0bh"
- firma electrónica legal;
- firma electrónica avanzada;
- firma electrónica cualificada;
- sellado de tiempo externo;
- certificación notarial;
- verificación pública con QR;
- publicación pública directa;
- CDN público;
- gestor documental completo tipo DMS;
- edición colaborativa;
- OCR;
- antivirus real obligatorio;
- DLP avanzado;
- búsqueda full-text;
- indexación semántica;
- IA sobre documentos reales;
- integración Google Drive, OneDrive o Dropbox;
- eliminación física automática;
- legal hold;
- retención legal avanzada;
- cifrado por tenant con llaves dedicadas;
- preview avanzado;
- conversión universal de formatos.
```

---

## 5. Capas de prueba

```text id="l3f1yd"
unit
domain
value-object
state-machine
dto-validation
file-validation
metadata-sanitization
hash-integrity
storage-adapter
application-service
policy
use-case
repository-integration
api
authorization
own-resource
source-resource
multitenancy
audit
access-log
observability
security
openapi
performance
concurrency
smoke
ci
```

---

## 6. Datos base de prueba

### 6.1. Tenants

```text id="g652tp"
tenantActiveA
tenantActiveB
tenantSuspended
tenantInactive
tenantArchived
```

---

### 6.2. Usuarios

```text id="r8qv0g"
platformAdmin
tenantAdminA
tenantAdminB
financialManagerA
fineManagerA
communicationManagerA
meetingManagerA
boardMemberA
ownerUserA
residentUserA
ownerResidentUserA
userWithoutDocumentPermissionA
userWithoutMembership
disabledUser
anonymousUser
systemActor
```

---

### 6.3. Personas y unidades

```text id="hpcahc"
personOwnerA
personResidentA
personOwnerResidentA
personOwnerB
personResidentB
propertyUnitA101
propertyUnitA102
propertyUnitA103
propertyUnitB201
propertyUnitInactiveA
```

---

### 6.4. Relaciones

```text id="zbjo3q"
ownerUserA -> personOwnerA -> propertyUnitA101 ownership active
residentUserA -> personResidentA -> propertyUnitA101 residency active
ownerResidentUserA -> personOwnerResidentA -> propertyUnitA102 ownership active + residency active
ownerUserB -> personOwnerB -> propertyUnitB201 ownership active
residentUserB -> personResidentB -> propertyUnitB201 residency active
```

---

### 6.5. Recursos origen

```text id="idvzfs"
paymentA
paymentReceiptA
paymentReceiptTenantB
fineA
fineEvidenceA
fineEvidenceTenantB
communicationA
communicationTenantB
certifiedMinutesA
certifiedMinutesArtifactA
certifiedMinutesAttachmentA
certifiedMinutesTenantB
reportExportA
reportExportTenantB
```

---

### 6.6. Documentos

```text id="o2cp45"
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
secureDocumentQuarantinedA
secureDocumentRejectedA
secureDocumentTenantB
```

---

### 6.7. Versiones

```text id="cakup6"
secureDocumentVersion1A
secureDocumentVersion2A
secureDocumentVersionActiveA
secureDocumentVersionSupersededA
secureDocumentVersionArchivedA
secureDocumentVersionTenantB
```

---

### 6.8. Archivos

```text id="ncp9pz"
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
secureDocumentFileFailedA
secureDocumentFileTenantB
```

---

### 6.9. Links

```text id="ev0b2y"
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

### 6.10. Policies

```text id="g23vk3"
secureDocumentPolicyPrivateA
secureDocumentPolicyAdministrativeA
secureDocumentPolicyOwnersA
secureDocumentPolicyResidentsA
secureDocumentPolicyBoardA
secureDocumentPolicySpecificUsersA
secureDocumentPolicyPropertyUnitsA
secureDocumentPolicyRolesA
secureDocumentPolicyMixedA
secureDocumentPolicySourceResourceAudienceA
secureDocumentPolicyRestrictedA
secureDocumentPolicyExpiredA
secureDocumentPolicyTenantB
```

---

### 6.11. Access logs

```text id="th1j0l"
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

## 7. Factories de prueba

Deben existir factories para:

```text id="lqfbdf"
createSecureDocument()
createSecureDocumentVersion()
createSecureDocumentFile()
createSecureDocumentLink()
createSecureDocumentPolicy()
createSecureDocumentAccessLog()

createCreateSecureDocumentDto()
createUpdateSecureDocumentMetadataDto()
createArchiveSecureDocumentDto()
createRestoreSecureDocumentDto()
createCreateSecureDocumentVersionDto()
createUploadSecureDocumentFilePayload()
createRegisterSystemGeneratedDocumentFileDto()
createArchiveSecureDocumentFileDto()
createCreateOwnSecureDocumentDto()
createUploadOwnSecureDocumentFilePayload()
createDocumentStorageConfigDto()

createTenantContext()
createPlatformContext()
createDocumentActorContext()
createOwnDocumentContext()
createSourceResourceValidationContext()
createStorageMockObject()
createUploadedFileFixture()
createPdfFileFixture()
createPngFileFixture()
createJpegFileFixture()
createDocxFileFixture()
createXlsxFileFixture()
createCsvFileFixture()
createJsonFileFixture()
createTextFileFixture()
createExecutableFileFixture()
createHtmlFileFixture()
createPathTraversalFilenameFixture()
createHashFixture()
```

Reglas:

* Usar datos sintéticos.
* No usar documentos reales.
* No usar comprobantes reales.
* No usar actas reales.
* No usar evidencias reales.
* No usar nombres reales.
* No usar emails reales.
* No usar teléfonos reales.
* No usar cédulas reales.
* No usar firmas reales.
* No usar storage keys reales.
* No usar URLs firmadas reales.
* No usar tokens.
* No usar secretos.
* Permitir Tenant A y Tenant B.
* Permitir archivos válidos y archivos inválidos.
* Permitir estados `available`, `quarantined`, `rejected`, `archived`, `missing`.
* Permitir visibilidades `private`, `administrative`, `owners`, `residents`, `sourceResourceAudience`.
* Permitir source modules `payments`, `fines`, `communications`, `certifiedMinutes`, `reports`.

---

# 8. Unit tests — Enums y Value Objects

## 8.1. `DocumentStatus`

Debe probar:

```text id="eu0i7x"
draft válido
uploaded válido
available válido
quarantined válido
rejected válido
archived válido
deletedPending válido
restored válido
estado desconocido inválido
estados descargables
estados no descargables
estados archivables
estados restaurables
```

---

## 8.2. `DocumentVersionStatus`

Debe probar:

```text id="opmwp1"
draft válido
active válido
superseded válido
archived válido
estado desconocido inválido
active único por documento
archived no editable
```

---

## 8.3. `DocumentFileStatus`

Debe probar:

```text id="lgamb4"
pending válido
stored válido
available válido
quarantined válido
rejected válido
archived válido
missing válido
failed válido
estado desconocido inválido
available descargable
stored descargable según política
quarantined no descargable
rejected no descargable
archived no descargable
missing no descargable
failed no descargable
```

---

## 8.4. `DocumentVisibility`

Debe probar:

```text id="jjljix"
private válido
administrative válido
tenant válido
owners válido
residents válido
board válido
meetingParticipants válido
sourceResourceAudience válido
specificUsers válido
propertyUnits válido
roles válido
mixed válido
publicEligible válido
publicEligible no público en MVP
valor desconocido inválido
```

---

## 8.5. `DocumentSensitivity`

Debe probar:

```text id="kxufbm"
low válido
internal válido
confidential válido
restricted válido
highlyRestricted válido
valor desconocido inválido
restricted requiere controles reforzados
highlyRestricted requiere controles reforzados
```

---

## 8.6. `DocumentCategory`

Debe probar:

```text id="d5xpdq"
paymentReceipt válido
fineEvidence válido
certifiedMinutesPdf válido
certifiedMinutesAttachment válido
communicationAttachment válido
communicationImage válido
reportExport válido
administrativeDocument válido
propertyDocument válido
residentDocument válido
meetingDocument válido
systemGenerated válido
other válido
valor desconocido inválido
```

---

## 8.7. `SourceModule`

Debe probar:

```text id="jm1znj"
payments válido
fines válido
communications válido
meetings válido
certifiedMinutes válido
reports válido
residentsProperties válido
tenants válido
system válido
other válido
valor desconocido inválido
```

---

## 8.8. `StorageProvider`

Debe probar:

```text id="pdayj7"
local válido
s3 válido
s3Compatible válido
minio válido
other válido
provider desconocido inválido
local bloqueado en producción si config no lo permite
```

---

## 8.9. `FileScanStatus`

Debe probar:

```text id="rh2r13"
notRequired válido
pending válido
clean válido
suspicious válido
infected válido
failed válido
valor desconocido inválido
infected no descargable
suspicious no descargable según política
```

---

## 8.10. `DocumentAccessType`

Debe probar:

```text id="rsowol"
viewMetadata válido
download válido
preview válido
export válido
archive válido
restore válido
valor desconocido inválido
```

---

## 8.11. `DocumentAccessOutcome`

Debe probar:

```text id="wj7518"
allowed válido
denied válido
notFound válido
expired válido
revoked válido
quarantined válido
rejected válido
archived válido
error válido
valor desconocido inválido
```

---

## 8.12. `DocumentFileName`

Debe probar:

```text id="asyi1v"
filename válido
filename vacío inválido
filename solo espacios inválido
normalización de espacios
remoción de caracteres de control
bloqueo de ../
bloqueo de ..\
bloqueo de slash
bloqueo de backslash
bloqueo de null bytes
longitud máxima
extensión preservada si válida
```

---

## 8.13. `DocumentMimeType`

Debe probar:

```text id="n5qcbb"
application/pdf válido
image/png válido
image/jpeg válido
docx válido
xlsx válido
text/csv válido
application/json válido
text/plain válido
application/x-msdownload inválido
application/javascript inválido
text/html inválido por defecto
application/x-php inválido
mime vacío inválido
mime desconocido inválido
```

---

## 8.14. `DocumentFileSize`

Debe probar:

```text id="ezgadf"
fileSize positivo válido
fileSize 0 inválido
fileSize negativo inválido
fileSize sobre defaultMaxFileSizeMb inválido
fileSize sobre imageMaxFileSizeMb inválido para imágenes
fileSize sobre reportMaxFileSizeMb inválido para reportes
```

---

## 8.15. `DocumentStorageKey`

Debe probar:

```text id="u8avgf"
storageKey generado por servidor válido
storageKey vacío inválido
storageKey con path traversal inválido
storageKey con null bytes inválido
storageKey enviado por cliente rechazado
storageKey no serializable en DTO
```

---

## 8.16. `DocumentHash`

Debe probar:

```text id="aoxpp2"
SHA-256 válido
hash vacío inválido
hash con longitud incorrecta inválido
hash con caracteres no hex inválido
hashPrefix seguro
hash completo no expuesto en DTO estándar
```

---

## 8.17. `DocumentMetadata`

Debe probar:

```text id="ws2whe"
metadata simple válida
metadata con tags seguros válida
metadata con token rechazada
metadata con password rechazada
metadata con apiKey rechazada
metadata con Authorization header rechazada
metadata con storageKey rechazada
metadata con signedUrl rechazada
metadata con base64 rechazada
metadata con contenido binario rechazada
metadata excesivamente grande rechazada
```

---

# 9. Unit tests — Entidades de dominio

## 9.1. `SecureDocument`

Debe probar:

```text id="pmhk96"
crear documento draft válido
rechazar documento sin tenantId
rechazar documento sin title
rechazar documento sin sourceModule
rechazar documento sin category
rechazar documento sin sensitivity
rechazar documento sin visibility
validar ownerType
validar ownerUserId según ownerType
validar ownerPersonId según ownerType
validar ownerPropertyUnitId según ownerType
asignar currentVersionId
asignar activeFileId
actualizar metadata segura
rechazar metadata insegura
archivar con razón
restaurar
rechazar restaurar si no archived
```

---

## 9.2. `SecureDocumentVersion`

Debe probar:

```text id="aeexsg"
crear versión 1 válida
crear versión 2 con changeReason
rechazar versión posterior sin changeReason
rechazar versionNumber 0
rechazar versionNumber negativo
activar versión
marcar versión previa superseded
archivar versión
rechazar edición archived
```

---

## 9.3. `SecureDocumentFile`

Debe probar:

```text id="k23paq"
crear archivo pending
marcar stored
marcar available
marcar quarantined
marcar rejected
marcar archived
marcar missing
marcar failed
validar provider
validar storageKey interno
validar originalFileName
validar safeFileName
validar mimeType
validar mimeGroup
validar fileSize > 0
validar fileHash cuando available
validar hashAlgorithm cuando fileHash existe
validar scanStatus
validar isPrimary
rechazar storageKey de cliente
no serializar storageKey
```

---

## 9.4. `SecureDocumentLink`

Debe probar:

```text id="qji41b"
crear link source
crear link supporting
crear link generatedFrom
crear link attachmentOf
crear link evidenceOf
crear link receiptOf
crear link exportOf
crear link relatedTo
rechazar link sin resourceType
rechazar link sin resourceId
validar sourceModule
archivar link
metadata segura
```

---

## 9.5. `SecureDocumentPolicy`

Debe probar:

```text id="yfml8r"
crear policy default
crear policy owner
crear policy audience
crear policy sourceDelegated
crear policy administrative
crear policy restricted
crear policy temporary
validar visibility
validar sensitivity
requerir audienceRules para specificUsers
requerir audienceRules para propertyUnits
requerir audienceRules para roles
requerir audienceRules para mixed
validar expiresAt futuro
expirada no autoriza
archivar policy
metadata segura
```

---

## 9.6. `SecureDocumentAccessLog`

Debe probar:

```text id="mfxeoe"
crear viewMetadata allowed
crear download allowed
crear denied
crear notFound
crear quarantined
crear rejected
crear archived
crear error
validar accessType
validar outcome
registrar traceId
registrar ipAddressHash opcional
registrar userAgentHash opcional
rechazar metadata con storageKey
rechazar metadata con URL firmada
rechazar metadata con binario
```

---

# 10. Unit tests — State machines

## 10.1. SecureDocument State Machine

Transiciones válidas:

```text id="o1m339"
draft -> uploaded
uploaded -> available
uploaded -> quarantined
quarantined -> available
quarantined -> rejected
available -> archived
archived -> restored
restored -> available
available -> deletedPending
rejected -> archived
```

Transiciones inválidas:

```text id="is1s0s"
archived -> uploaded
deletedPending -> available sin revisión
rejected -> available sin revisión explícita
available -> draft
quarantined -> available si scanStatus infected
```

---

## 10.2. SecureDocumentVersion State Machine

Transiciones válidas:

```text id="u1hsaf"
draft -> active
active -> superseded
active -> archived
superseded -> archived
archived -> active por restauración controlada
```

Transiciones inválidas:

```text id="ibrpzq"
active -> draft
archived -> draft
superseded -> active sin restauración controlada
```

---

## 10.3. SecureDocumentFile State Machine

Transiciones válidas:

```text id="kxq2vu"
pending -> stored
stored -> available
stored -> quarantined
quarantined -> available
quarantined -> rejected
available -> archived
available -> missing
pending -> failed
failed -> archived
```

Transiciones inválidas:

```text id="cr4wia"
archived -> available sin restauración controlada
rejected -> available sin revisión explícita
missing -> available sin objectExists true
failed -> available sin reupload
quarantined -> available si scanStatus infected
```

---

# 11. DTO validation tests

## 11.1. `CreateSecureDocumentDto`

Debe validar:

```text id="aowbd5"
title requerido
title no vacío
description opcional sanitizada
visibility requerido
visibility válido
sensitivity requerida
sensitivity válida
category requerida
category válida
sourceModule requerido
sourceModule válido
sourceResourceType opcional
sourceResourceId opcional
ownerType válido
ownerUserId UUID opcional
ownerPersonId UUID opcional
ownerPropertyUnitId UUID opcional
metadata segura
rechaza tenantId
rechaza status
rechaza storageKey
rechaza activeFileId
rechaza currentVersionId
rechaza fileHash
rechaza hashAlgorithm
rechaza createdBy
rechaza updatedBy
rechaza archivedBy
rechaza restoredBy
```

---

## 11.2. `UpdateSecureDocumentMetadataDto`

Debe validar:

```text id="i3x3nn"
title opcional no vacío
description opcional sanitizada
visibility opcional válida
sensitivity opcional válida
metadata opcional segura
rechaza tenantId
rechaza status
rechaza sourceModule
rechaza sourceResourceType
rechaza sourceResourceId
rechaza ownerType
rechaza ownerUserId
rechaza ownerPersonId
rechaza ownerPropertyUnitId
rechaza currentVersionId
rechaza activeFileId
rechaza storageKey
rechaza fileHash
rechaza hashAlgorithm
rechaza campos de auditoría
```

---

## 11.3. `ArchiveSecureDocumentDto`

Debe validar:

```text id="yoiav4"
reason opcional o requerido según política
reason sanitizado
rechaza tenantId
rechaza archivedBy
rechaza archivedAt
rechaza status
```

---

## 11.4. `RestoreSecureDocumentDto`

Debe validar:

```text id="gc9d9c"
reason opcional sanitizado
rechaza tenantId
rechaza restoredBy
rechaza restoredAt
rechaza status
```

---

## 11.5. `CreateSecureDocumentVersionDto`

Debe validar:

```text id="lokozv"
title opcional sanitizado
description opcional sanitizada
changeReason requerido para versión posterior
changeReason sanitizado
metadata segura
rechaza tenantId
rechaza versionNumber
rechaza status
rechaza createdBy
rechaza archivedBy
```

---

## 11.6. `UploadSecureDocumentFileDto`

Debe validar:

```text id="lhfbuh"
file requerido
versionId UUID opcional
isPrimary boolean opcional
metadata segura
rechaza tenantId
rechaza storageKey
rechaza fileHash
rechaza hashAlgorithm
rechaza provider
rechaza uploadedBy
rechaza uploadedAt
rechaza generatedBy
rechaza generatedAt
rechaza status
```

---

## 11.7. `RegisterSystemGeneratedDocumentFileDto`

Debe validar:

```text id="s98or1"
versionId UUID requerido
fileName requerido
fileName seguro
mimeType requerido
mimeType permitido
mimeGroup válido
category válida
isPrimary boolean
generatedBy opcional system
metadata segura
rechaza tenantId
rechaza storageKey desde API pública
rechaza fileHash manual salvo puerto interno controlado
rechaza binario base64
rechaza provider externo si no permitido
```

---

## 11.8. `ArchiveSecureDocumentFileDto`

Debe validar:

```text id="u5hdpr"
reason opcional sanitizado
rechaza tenantId
rechaza archivedBy
rechaza archivedAt
rechaza status
rechaza storageKey
```

---

## 11.9. `CreateOwnSecureDocumentDto`

Debe validar:

```text id="f1ia1g"
title requerido
category permitida para own upload
sourceModule permitido para own upload
sourceResourceType requerido según módulo
sourceResourceId requerido según módulo
ownerType permitido
ownerPropertyUnitId permitido si actor vinculado
metadata segura
rechaza tenantId
rechaza visibility administrativa
rechaza sensitivity arbitraria si no permitida
rechaza storageKey
rechaza status
```

---

## 11.10. `UploadOwnSecureDocumentFileDto`

Debe validar:

```text id="ylpr6c"
file requerido
metadata segura
rechaza tenantId
rechaza storageKey
rechaza provider
rechaza fileHash
rechaza hashAlgorithm
rechaza uploadedBy
rechaza status
```

---

## 11.11. `UpdateDocumentStorageConfigDto`

Debe validar:

```text id="vy14l7"
provider válido
maxFileSizeMb positivo
imageMaxFileSizeMb positivo
reportMaxFileSizeMb positivo
temporaryUrlTtlSeconds positivo
temporaryUrlsEnabled boolean
fileScanEnabled boolean
publicDocumentsEnabled boolean false en MVP
rechaza accessKeyId
rechaza secretAccessKey
rechaza token
rechaza connectionString
rechaza bucket si política lo restringe
rechaza local en producción si no permitido
```

---

# 12. Application service tests

## 12.1. `SecureDocumentService`

Debe probar:

```text id="lpmgb5"
crear documento válido
rechazar documento sin sourceModule
rechazar documento sin category
rechazar documento sin sensitivity
rechazar tenantId desde body
rechazar sourceResourceId tenant B
rechazar ownerUserId tenant B
rechazar ownerPersonId tenant B
rechazar ownerPropertyUnitId tenant B
actualizar metadata segura
rechazar metadata insegura
archivar documento
restaurar documento
auditar created/metadataUpdated/archived/restored
```

---

## 12.2. `SecureDocumentVersionService`

Debe probar:

```text id="nxfjtq"
crear versión inicial
crear versión incremental
rechazar versión posterior sin changeReason
impedir versionNumber duplicado
activar versión
superseder versión anterior
archivar versión
rechazar version tenant B
auditar document.versionCreated
```

---

## 12.3. `SecureDocumentFileService`

Debe probar:

```text id="qnv52b"
registrar archivo pending
marcar stored
marcar available
marcar quarantined
marcar rejected
marcar archived
marcar missing
validar documentId tenant A
rechazar documentId tenant B
validar versionId tenant A
rechazar versionId tenant B
rechazar available sin hash
no exponer storageKey
auditar fileRegistered/fileArchived/quarantined/rejected
```

---

## 12.4. `SecureDocumentUploadService`

Debe probar:

```text id="ywndre"
upload PDF válido
upload PNG válido
upload JPEG válido
upload DOCX válido
upload XLSX válido
upload CSV válido
upload JSON válido
upload TXT válido
rechazar executable
rechazar JavaScript
rechazar HTML por defecto
rechazar archivo vacío
rechazar archivo demasiado grande
rechazar filename con path traversal
rechazar storageKey desde cliente
generar storageKey servidor
calcular SHA-256
guardar archivo en storage port
crear SecureDocumentFile
actualizar activeFileId si isPrimary
auditar document.uploaded
```

---

## 12.5. `SecureDocumentDownloadService`

Debe probar:

```text id="zxcypx"
download administrativo autorizado
download propio autorizado
rechazar sin permiso
rechazar outside own-resource
rechazar document tenant B
rechazar file tenant B
rechazar file quarantined
rechazar file rejected
rechazar file archived
rechazar file missing
obtener stream desde storage port
no exponer storageKey
registrar accessLog allowed
registrar accessLog denied si política lo exige
auditar document.downloaded
auditar document.accessDenied
```

---

## 12.6. `SecureDocumentHashService`

Debe probar:

```text id="adzvtk"
calcular SHA-256 desde Buffer
calcular SHA-256 desde stream
mismo archivo produce mismo hash
archivo modificado produce hash distinto
hashPrefix correcto
rechazar algoritmo no permitido
```

---

## 12.7. `SecureDocumentFileValidationService`

Debe probar:

```text id="zkbxep"
validar fileName
validar extensión
validar mimeType
validar magic bytes si disponible
validar tamaño
validar categoría
validar sourceModule
validar storageKey ausente
bloquear path traversal
bloquear null bytes
bloquear MIME mismatch
```

---

## 12.8. `SecureDocumentStorageService`

Debe probar:

```text id="ysvjvk"
putObject exitoso
getObjectStream exitoso
getObjectMetadata exitoso
objectExists true
objectExists false
createTemporaryDownloadUrl solo si feature flag activo
archiveObject lógico
deleteObjectPhysical no usado en MVP ordinario
mapear errores a DOCUMENT_STORAGE_ERROR
no loguear storageKey
```

---

## 12.9. `SecureDocumentAccessService`

Debe probar:

```text id="af3rd6"
registrar viewMetadata allowed
registrar download allowed
registrar denied
registrar notFound
registrar quarantined
registrar rejected
registrar archived
hash de IP opcional
hash de userAgent opcional
metadata segura
sin storageKey
sin URL firmada
sin binarios
```

---

## 12.10. `SecureDocumentSourceResourceService`

Debe probar validadores:

```text id="znfa4m"
payments validator acepta paymentReceipt tenant A
payments validator rechaza paymentReceipt tenant B
fines validator acepta fineEvidence tenant A
fines validator rechaza fineEvidence tenant B
communications validator acepta communication tenant A
communications validator rechaza communication tenant B
certifiedMinutes validator acepta artifact tenant A
certifiedMinutes validator rechaza artifact tenant B
reports validator acepta reportExport tenant A
reports validator rechaza reportExport tenant B
sourceModule unknown rechaza o delega a policy other
```

---

## 12.11. `SecureDocumentPolicyService`

Debe probar:

```text id="sc854e"
policy administrative
policy private
policy owners
policy residents
policy board
policy specificUsers
policy propertyUnits
policy roles
policy mixed
policy sourceResourceAudience
policy expired no autoriza
policy restricted requiere permiso reforzado
audienceRules cross-tenant rechazadas
```

---

## 12.12. `SecureDocumentAuditService`

Debe probar:

```text id="t983ic"
audita document.created
audita document.metadataUpdated
audita document.uploaded
audita document.fileRegistered
audita document.versionCreated
audita document.versionArchived
audita document.fileArchived
audita document.downloaded
audita document.accessDenied
audita document.archived
audita document.restored
audita document.quarantined
audita document.rejected
audita document.storageProviderConfigured
audita document.storageConnectionTested
metadata sanitizada
sin storageKey
sin bucket
sin path interno
sin URL firmada
sin binario
sin base64
```

---

# 13. Storage adapter tests

## 13.1. `MockSecureDocumentStorageAdapter`

Debe probar:

```text id="laqxmw"
putObject almacena objeto mock
getObjectStream devuelve stream mock
getObjectMetadata devuelve metadata mock
objectExists true
objectExists false
archiveObject cambia estado mock
deleteObjectPhysical disponible solo en tests controlados
storage errors simulables
```

---

## 13.2. `LocalSecureDocumentStorageAdapter`

Debe probar:

```text id="dwwmj9"
crea directorios seguros
escribe archivo dentro de root permitido
rechaza path traversal
rechaza ruta fuera del root
lee stream existente
maneja archivo inexistente
obtiene metadata
archiva objeto local si aplica
no permite root relativo inseguro
no permite local storage en producción si config lo bloquea
```

---

## 13.3. `S3CompatibleSecureDocumentStorageAdapter` mock

Debe probar:

```text id="pltg6a"
putObject llama provider con bucket privado
getObjectStream llama provider
getObjectMetadata llama provider
objectExists true
objectExists false
createTemporaryDownloadUrl con TTL corto
no genera URL temporal si feature flag deshabilitado
no persiste URL temporal
no loguea URL temporal completa
mapear errores provider
serverSideEncryption config si aplica
```

---

# 14. Repository integration tests

## 14.1. `PrismaSecureDocumentRepository`

Debe probar:

```text id="gp6qrz"
create secure document
findById tenant A
findById no devuelve tenant B
list by tenant
filter by status
filter by visibility
filter by sensitivity
filter by category
filter by sourceModule
filter by sourceResource
filter by owner
q search
archive document
restore document
no findUnique by id simple
```

---

## 14.2. `PrismaSecureDocumentVersionRepository`

Debe probar:

```text id="bwtvow"
create version
findById tenant A
findById no devuelve tenant B
list by document
unique versionNumber por document
one active version per document
archive version
no findUnique by id simple
```

---

## 14.3. `PrismaSecureDocumentFileRepository`

Debe probar:

```text id="iptpj3"
create file
findById tenant A
findById no devuelve tenant B
list by document
list by version
unique primary active file per version
unique storageKey per provider
available requires hash
fileSize positive
archive file
mark missing
no findUnique by id simple
```

---

## 14.4. `PrismaSecureDocumentLinkRepository`

Debe probar:

```text id="mhmlx0"
create link
findById tenant A
findById no devuelve tenant B
list by document
list by sourceResource
unique active source link
archive link
no findUnique by id simple
```

---

## 14.5. `PrismaSecureDocumentPolicyRepository`

Debe probar:

```text id="xaejh7"
create policy
findById tenant A
findById no devuelve tenant B
list by document
list active policies
filter expired
archive policy
audienceRules persisted sanitized
no findUnique by id simple
```

---

## 14.6. `PrismaSecureDocumentAccessLogRepository`

Debe probar:

```text id="gq4mia"
create access log allowed
create access log denied
create access log quarantined
create access log rejected
find by tenant
list by document
list by file
list by actor
list by outcome
metadata without storageKey
metadata without binary
no findUnique by id simple
```

---

# 15. API tests — Documentos administrativos

## 15.1. `GET /api/v1/tenant/documents`

Debe probar:

```text id="dbgd4e"
401 sin token
403 sin documents.read
200 con permiso
paginación
pageSize máximo 100
filtro status
filtro visibility
filtro sensitivity
filtro category
filtro sourceModule
filtro sourceResourceType
filtro sourceResourceId
filtro ownerType
filtro ownerUserId
filtro ownerPersonId
filtro ownerPropertyUnitId
filtro mimeType
filtro mimeGroup
filtro createdFrom/createdTo
filtro uploadedFrom/uploadedTo
archived=false por defecto
archived=true incluye archivados
q search
sortBy permitido
sortBy inválido 422
no devuelve tenant B
no devuelve storageKey
no devuelve URL firmada
no devuelve binarios
```

---

## 15.2. `POST /api/v1/tenant/documents`

Debe probar:

```text id="egqcri"
401 sin token
403 sin documents.create
201 con body válido
422 sin title
422 sin sourceModule
422 sin category
422 sin sensitivity
422 sin visibility
422 tenantId en body
422 storageKey en body
422 metadata insegura
403/404 sourceResourceId tenant B
403/404 ownerUserId tenant B
403/404 ownerPersonId tenant B
403/404 ownerPropertyUnitId tenant B
audita document.created
```

---

## 15.3. `GET /api/v1/tenant/documents/{documentId}`

Debe probar:

```text id="e1mfm6"
401 sin token
403 sin documents.read
200 con permiso
404 documento inexistente
403/404 documento tenant B
no expone storageKey
no expone URL firmada
no expone binario
no expone hash completo por DTO estándar
```

---

## 15.4. `PATCH /api/v1/tenant/documents/{documentId}/metadata`

Debe probar:

```text id="wnfhxi"
401 sin token
403 sin documents.updateMetadata
200 actualiza metadata segura
422 tenantId en body
422 status en body
422 storageKey en body
422 sourceModule en body
422 ownerId en body
422 currentVersionId en body
422 activeFileId en body
422 metadata insegura
403/404 documento tenant B
audita document.metadataUpdated
```

---

## 15.5. `POST /api/v1/tenant/documents/{documentId}/archive`

Debe probar:

```text id="v2fgcf"
401 sin token
403 sin documents.archive
200 archive
403/404 documento tenant B
409 documento ya archived
no elimina files
no elimina versions
no elimina links
no elimina policies
no elimina access logs
audita document.archived
```

---

## 15.6. `POST /api/v1/tenant/documents/{documentId}/restore`

Debe probar:

```text id="i10p3h"
401 sin token
403 sin documents.restore
200 restore archived
409 restore no archived
409 restore con activeFile missing
409 restore con activeFile rejected
409 restore con activeFile infected si aplica
403/404 documento tenant B
audita document.restored
```

---

## 15.7. `GET /api/v1/tenant/documents/{documentId}/access-logs`

Debe probar:

```text id="ouqfio"
401 sin token
403 sin documents.audit.read
200 listar access logs
filtro fileId
filtro actorUserId
filtro accessType
filtro outcome
filtro accessedFrom/accessedTo
403/404 document tenant B
no storageKey
no URL firmada
no binarios
no IP hash salvo permiso futuro
no userAgent hash salvo permiso futuro
```

---

# 16. API tests — Versiones

## 16.1. `GET /api/v1/tenant/documents/{documentId}/versions`

Debe probar:

```text id="fkczqm"
401 sin token
403 sin documents.read
200 listar versiones
403/404 document tenant B
filtro status
filtro versionNumber
pageSize máximo 100
no storageKey
no binarios
```

---

## 16.2. `POST /api/v1/tenant/documents/{documentId}/versions`

Debe probar:

```text id="f2ah67"
401 sin token
403 sin documents.create
201 crear versión inicial
201 crear versión incremental
422 versión posterior sin changeReason
403/404 document tenant B
409 duplicate versionNumber por concurrencia
audita document.versionCreated
```

---

## 16.3. `GET /api/v1/tenant/document-versions/{versionId}`

Debe probar:

```text id="s2j2xp"
401 sin token
403 sin documents.read
200 obtener versión
404 versión inexistente
403/404 version tenant B
no búsqueda solo por versionId
no storageKey
```

---

## 16.4. `POST /api/v1/tenant/document-versions/{versionId}/archive`

Debe probar:

```text id="sgihzq"
401 sin token
403 sin documents.archive
200 archivar versión
403/404 version tenant B
409 versión actual no archivable sin reemplazo si política lo exige
no elimina files
audita document.versionArchived
```

---

# 17. API tests — Archivos

## 17.1. `POST /api/v1/tenant/documents/{documentId}/files`

Debe probar:

```text id="l19blp"
401 sin token
403 sin documents.create
201 upload PDF
201 upload PNG
201 upload JPEG
201 upload DOCX
201 upload XLSX
201 upload CSV
201 upload JSON
201 upload TXT
415 executable rechazado
415 JavaScript rechazado
415 HTML rechazado por defecto
413 archivo demasiado grande
422 archivo vacío
422 filename vacío
422 filename con path traversal
422 storageKey en multipart fields
422 fileHash en fields
403/404 document tenant B
403/404 version tenant B
409 segunda primary activa por versión si aplica
genera storageKey interno
calcula SHA-256
no expone storageKey
no expone URL firmada
audita document.uploaded
```

---

## 17.2. `POST /api/v1/tenant/documents/{documentId}/files/register-system-generated`

Debe probar:

```text id="l5wrt7"
401 sin token
403 sin documents.registerSystemGenerated
201 registra archivo generado por sistema
403/404 document tenant B
403/404 version tenant B
422 fileName inválido
422 mimeType inválido
422 storageKey desde API pública
422 binario base64 en JSON
422 fileHash manual si no es puerto interno
audita document.fileRegistered
```

---

## 17.3. `GET /api/v1/tenant/document-files/{fileId}`

Debe probar:

```text id="sja0io"
401 sin token
403 sin documents.read
200 metadata archivo
404 file inexistente
403/404 file tenant B
no storageKey
no bucket
no path interno
no URL firmada
no hash completo
no binario
```

---

## 17.4. `GET /api/v1/tenant/document-files/{fileId}/download`

Debe probar:

```text id="up00gk"
401 sin token
403 sin documents.download
200 binary stream autorizado
403/404 file tenant B
409 file quarantined
409 file rejected
409 file archived
409 file missing
409 file failed
404 storage object missing
Cache-Control no-store
Content-Disposition safe filename
no storageKey en headers
no URL persistente
registra accessLog allowed
registra accessLog denied si política lo exige
audita document.downloaded
```

---

## 17.5. `POST /api/v1/tenant/document-files/{fileId}/archive`

Debe probar:

```text id="j51tae"
401 sin token
403 sin documents.archive
200 archiva file
403/404 file tenant B
409 file ya archived
no elimina objeto físico por defecto
si file activo, actualiza activeFileId según política
audita document.fileArchived
```

---

# 18. API tests — `/me`

## 18.1. `GET /api/v1/me/documents`

Debe probar:

```text id="rj8bdn"
401 sin token
403 sin membership
403 sin documents.read.own
200 lista documentos propios
owner ve documentos owner
resident ve documentos resident
ownerResident ve ambos según policy
usuario no ve documentos ajenos
usuario no ve tenant B
no muestra archived por defecto
no muestra quarantined
no muestra rejected
no muestra policies internas
no muestra access logs
no muestra storageKey
no muestra URL firmada
no muestra binarios
filtros no amplían acceso
```

---

## 18.2. `GET /api/v1/me/documents/{documentId}`

Debe probar:

```text id="on7jou"
401 sin token
403 sin documents.read.own
200 documento propio autorizado
403/404 documento ajeno
403/404 documento tenant B
403/404 owner ajeno
403/404 source policy ajena
409/404 archived
409/404 quarantined
409/404 rejected
no storageKey
no audit
no policies internas completas
no audienceRules completas si revelan terceros
```

---

## 18.3. `POST /api/v1/me/documents`

Debe probar:

```text id="xj1lx3"
401 sin token
403 sin documents.upload.own
201 crear documento propio paymentReceipt
422 category no permitida para own upload
422 sourceModule no permitido para own upload
403/404 sourceResourceId ajeno
403/404 ownerPropertyUnitId ajeno
422 tenantId en body
422 storageKey en body
422 visibility administrativa
422 sensitivity no permitida para own upload
audita document.created
```

---

## 18.4. `POST /api/v1/me/documents/{documentId}/files`

Debe probar:

```text id="ea9bls"
401 sin token
403 sin documents.upload.own
201 upload propio autorizado
403/404 document ajeno
403/404 document tenant B
422 storageKey en fields
415 MIME no permitido
413 archivo demasiado grande
422 archivo vacío
422 path traversal
no storageKey response
audita document.uploaded
```

---

## 18.5. `GET /api/v1/me/document-files/{fileId}/download`

Debe probar:

```text id="r1uxuf"
401 sin token
403 sin documents.download.own
200 download propio autorizado
403/404 file ajeno
403/404 file tenant B
403/404 source policy denegada
409 file quarantined
409 file rejected
409 file archived
409 file missing
no storageKey
registra accessLog allowed
registra accessLog denied si política lo exige
audita document.downloaded
```

---

# 19. API tests — Platform storage config

## 19.1. `GET /api/v1/platform/document-storage/config`

Debe probar:

```text id="gommac"
401 sin token
403 sin documents.storage.readConfig
200 config segura
no accessKeyId
no secretAccessKey
no token
no connectionString
no bucket si política lo restringe
devuelve flags seguros
devuelve provider activo
```

---

## 19.2. `PATCH /api/v1/platform/document-storage/config`

Debe probar:

```text id="jwal61"
401 sin token
403 sin documents.storage.configure
200 actualiza config permitida
422 provider inválido
422 maxFileSizeMb inválido
422 secrets en body
409 local storage en producción si no permitido
audita document.storageProviderConfigured
```

---

## 19.3. `POST /api/v1/platform/document-storage/test-connection`

Debe probar:

```text id="o5muup"
401 sin token
403 sin documents.storage.testConnection
200 connection ok
500 connection failed controlado
no expone secretos
no expone provider payload completo
audita document.storageConnectionTested
```

---

## 19.4. `GET /api/v1/platform/document-storage/providers`

Debe probar:

```text id="ufkc5v"
401 sin token
403 sin documents.storage.readConfig
200 lista providers
local productionAllowed false
s3Compatible productionAllowed true
no secretos
```

---

# 20. Authorization tests

## 20.1. Sin autenticación

Todos los endpoints privados deben devolver:

```text id="y3rlne"
401 UNAUTHORIZED
```

---

## 20.2. Usuario sin membership

Debe devolver:

```text id="cn26za"
403 FORBIDDEN
```

---

## 20.3. Usuario disabled

Debe devolver:

```text id="pxwx9n"
403 FORBIDDEN
```

---

## 20.4. Usuario sin permisos

Debe probar:

```text id="gh27bx"
sin documents.create no crea documento
sin documents.read no lista documentos
sin documents.updateMetadata no actualiza metadata
sin documents.archive no archiva
sin documents.restore no restaura
sin documents.download no descarga admin
sin documents.managePolicies no gestiona policies
sin documents.read.own no lista /me
sin documents.download.own no descarga /me
sin documents.upload.own no sube /me
sin documents.registerSystemGenerated no registra archivos generados
sin documents.audit.read no lee access logs
sin documents.storage.configure no configura storage
sin documents.storage.readConfig no lee config
sin documents.storage.testConnection no prueba conexión
```

---

## 20.5. PlatformAdmin

Debe probar:

```text id="t5hkxt"
PlatformAdmin no accede automáticamente a documentos de tenants
PlatformAdmin requiere permiso explícito para config storage
PlatformAdmin no descarga contenido tenant sin política explícita
acceso excepcional debe auditarse
config response no expone secretos
```

---

# 21. Multitenancy tests

Debe probar aislamiento en todas las entidades:

```text id="c4fjfm"
tenant A no ve secureDocument tenant B
tenant A no ve secureDocumentVersion tenant B
tenant A no ve secureDocumentFile tenant B
tenant A no ve secureDocumentLink tenant B
tenant A no ve secureDocumentPolicy tenant B
tenant A no ve secureDocumentAccessLog tenant B
tenant A no modifica secureDocument tenant B
tenant A no archiva secureDocument tenant B
tenant A no restaura secureDocument tenant B
tenant A no descarga secureDocumentFile tenant B
tenant A no archiva secureDocumentFile tenant B
tenant A no lee access logs tenant B
```

Debe probar referencias cross-tenant:

```text id="cgrbz3"
tenant A no usa documentId tenant B
tenant A no usa versionId tenant B
tenant A no usa fileId tenant B
tenant A no usa linkId tenant B
tenant A no usa policyId tenant B
tenant A no usa sourceResourceId tenant B
tenant A no usa ownerUserId tenant B
tenant A no usa ownerPersonId tenant B
tenant A no usa ownerPropertyUnitId tenant B
tenant A no usa audienceRules.userIds tenant B
tenant A no usa audienceRules.personIds tenant B
tenant A no usa audienceRules.propertyUnitIds tenant B
tenant A no usa audienceRules.roleIds tenant B
```

Patrones prohibidos:

```typescript id="v7zt8b"
prisma.secureDocument.findUnique({ where: { id: documentId } });
prisma.secureDocumentVersion.findUnique({ where: { id: versionId } });
prisma.secureDocumentFile.findUnique({ where: { id: fileId } });
prisma.secureDocumentLink.findUnique({ where: { id: linkId } });
prisma.secureDocumentPolicy.findUnique({ where: { id: policyId } });
prisma.secureDocumentAccessLog.findUnique({ where: { id: accessLogId } });
```

Patrón requerido:

```typescript id="ptlm4g"
prisma.secureDocument.findFirst({
  where: {
    id: documentId,
    tenantId: currentTenant.id
  }
});
```

---

# 22. Own-resource tests

## 22.1. Owner por usuario

Debe probar:

```text id="xl8dhv"
ownerUser ve documento propio
otro usuario no ve documento
usuario tenant B no ve documento tenant A
ownerUser disabled no accede
```

---

## 22.2. Owner por persona

Debe probar:

```text id="ktajpf"
usuario vinculado a person ve documento propio
usuario no vinculado a person no ve documento
person tenant B rechazada
person inactive según política no autoriza
```

---

## 22.3. Owner por unidad habitacional

Debe probar:

```text id="dptvoo"
owner de propertyUnit ve documento si allowOwnerRead
resident de propertyUnit ve documento si policy lo permite
usuario de otra unidad no ve documento
propertyUnit tenant B rechazada
propertyUnit inactive según política no autoriza
```

---

## 22.4. Visibilidad `owners`

Debe probar:

```text id="logywr"
propietario activo ve documento owners
residente no propietario no ve documento owners
propietario tenant B no ve documento tenant A
```

---

## 22.5. Visibilidad `residents`

Debe probar:

```text id="dwfpzm"
residente activo ve documento residents
propietario no residente no ve documento residents si política separa roles
resident tenant B no ve tenant A
```

---

## 22.6. Visibilidad `sourceResourceAudience`

Debe probar:

```text id="hlba6v"
Certified Minutes autoriza descarga de PDF publicado
Certified Minutes deniega PDF no publicado
Payments autoriza comprobante propio
Payments deniega comprobante de otra unidad
Fines autoriza evidencia propia si política lo permite
Fines deniega evidencia restringida
```

---

# 23. Source resource validation tests

Debe probar validadores por módulo:

```text id="rb4b8l"
payments paymentReceipt tenant A válido
payments paymentReceipt tenant B inválido
payments payment tenant A válido
fines fineEvidence tenant A válido
fines fineEvidence tenant B inválido
communications communication tenant A válido
communications communication tenant B inválido
certifiedMinutes certifiedMinutesArtifact tenant A válido
certifiedMinutes certifiedMinutesArtifact tenant B inválido
certifiedMinutes certifiedMinutesAttachment tenant A válido
reports reportExport tenant A válido
reports reportExport tenant B inválido
residentsProperties propertyUnit tenant A válido
residentsProperties propertyUnit tenant B inválido
tenants tenant active válido
system sin sourceResource válido solo si generatedBy system
other requiere policy explícita
```

---

# 24. File validation and hardening tests

## 24.1. MIME allowlist

Debe probar:

```text id="jveqim"
application/pdf permitido
image/png permitido
image/jpeg permitido
docx permitido
xlsx permitido
text/csv permitido
application/json permitido
text/plain permitido
application/x-msdownload bloqueado
application/x-sh bloqueado
application/x-bat bloqueado
application/javascript bloqueado
text/html bloqueado
application/x-php bloqueado
application/java-archive bloqueado
apk bloqueado
```

---

## 24.2. Extensión y MIME

Debe probar:

```text id="xa4gvu"
pdf con application/pdf válido
png con image/png válido
jpg con image/jpeg válido
docx con mime docx válido
xlsx con mime xlsx válido
exe renombrado a pdf rechazado si magic bytes disponible
html renombrado a txt según política
mime mismatch rechazado
extensión ausente rechazada si categoría lo requiere
```

---

## 24.3. Filename sanitizer

Debe probar:

```text id="xq4k4o"
normaliza espacios
remueve caracteres de control
bloquea ../
bloquea ..\
bloquea /
bloquea \
bloquea null byte
bloquea nombres reservados si aplica
limita longitud
conserva extensión segura
```

---

## 24.4. Size limits

Debe probar:

```text id="nt1ofj"
archivo 0 bytes rechazado
archivo menor a límite aceptado
archivo igual al límite aceptado
archivo mayor al límite rechazado 413
imagen mayor a imageMaxFileSizeMb rechazada
reporte mayor a reportMaxFileSizeMb rechazado
```

---

# 25. Hash integrity tests

Debe probar:

```text id="kkiwhj"
SHA-256 calculado desde bytes reales
mismo archivo produce mismo hash
archivo modificado produce hash distinto
hashPrefix corresponde al fileHash
fileHash completo no se expone en DTO estándar
fileHash completo no aparece en logs
fileHash completo no aparece en auditoría
archivo available requiere hash
archivo stored requiere hash si binario disponible
hashAlgorithm requerido si fileHash existe
```

---

# 26. Storage security tests

Debe probar:

```text id="sio33z"
storageKey generado por servidor
storageKey no aceptado desde cliente
storageKey no aparece en response
storageKey no aparece en errors
storageKey no aparece en audit
storageKey no aparece en logs
storageKey no aparece en notification payload
bucket no aparece en response si política lo restringe
path interno no aparece
URL persistente no aparece
URL temporal no se persiste
URL temporal no se loguea completa
path traversal bloqueado
storage object tenant B no se descarga desde tenant A
local storage bloqueado en producción por defecto
```

---

# 27. Access log tests

Debe probar:

```text id="y54r72"
download allowed crea access log
download denied crea access log si política lo exige
quarantined crea access log outcome quarantined
rejected crea access log outcome rejected
archived crea access log outcome archived
notFound crea access log si tenant resuelto
access log tiene tenantId
access log tiene documentId si disponible
access log tiene fileId si disponible
access log tiene actorUserId si autenticado
access log tiene traceId
access log no tiene storageKey
access log no tiene URL firmada
access log no tiene binarios
access log no tiene base64
```

---

# 28. Audit tests

Debe verificar emisión de eventos:

```text id="n6nrd9"
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

Metadata permitida:

```text id="szhiik"
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

Metadata prohibida:

```text id="rci629"
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

# 29. Observability tests

## 29.1. Logs

Debe probar que logs incluyan:

```text id="v86u3d"
traceId
requestId
correlationId
action
outcome
status
durationMs
errorCode cuando aplica
sourceModule
category
sensitivity
visibility
mimeGroup
provider
```

No deben incluir:

```text id="bmutyv"
Authorization header
tokens
cookies
secretos
storageKey
bucket
path interno
URL firmada
contenido binario
base64
emails completos
teléfonos completos
cédulas
SQL raw
stack trace en producción
```

---

## 29.2. Métricas

Debe probar métricas:

```text id="oaa845"
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

Labels permitidos:

```text id="x9yd55"
sourceModule
category
sensitivity
visibility
status
mimeGroup
provider
outcome
```

Labels prohibidos:

```text id="t0yza4"
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

# 30. Public endpoint negative tests

OpenAPI y routing no deben permitir:

```text id="og7hwo"
GET /api/v1/public/documents/{documentId}
GET /api/v1/public/document-files/{fileId}/download
GET /api/v1/public/tenants/{slug}/documents
GET /api/v1/public/tenants/{slug}/documents/{documentId}
GET /api/v1/public/tenants/{slug}/document-files/{fileId}/download
POST /api/v1/public/documents
POST /api/v1/public/document-files/{fileId}/download
```

Resultado esperado:

```text id="erjszl"
404 route not found
```

Sin revelar:

```text id="n7uy8g"
si el tenant existe
si el documento existe
si el archivo existe
si el usuario tendría acceso
```

---

# 31. OpenAPI tests

## 31.1. Tags

Debe validar:

```text id="yfq86l"
Secure Documents
Secure Document Files
Secure Document Versions
My Secure Documents
Document Storage Platform
```

---

## 31.2. Extensiones requeridas

Para endpoints tenant:

```yaml id="x0w613"
x-tenant-scope: true
x-auth-required: true
x-required-permission: documents.create
x-public-exposure: false
x-audit-event: document.created
```

Para endpoints `/me`:

```yaml id="poouyw"
x-tenant-scope: true
x-auth-required: true
x-own-resource: true
x-required-permission: documents.read.own
x-public-exposure: false
```

Para descargas:

```yaml id="fl8w3w"
x-secure-download: true
x-binary-response: true
x-storage-key-exposed: false
x-auth-required: true
x-audit-event: document.downloaded
```

Para uploads:

```yaml id="ogfii6"
x-file-upload: true
x-multipart: true
x-storage-backed: true
x-storage-key-exposed: false
x-audit-event: document.uploaded
```

Para platform:

```yaml id="syeh2z"
x-platform-scope: true
x-auth-required: true
x-required-permission: documents.storage.configure
x-secrets-exposed: false
x-audit-event: document.storageProviderConfigured
```

---

## 31.3. Endpoints prohibidos

OpenAPI no debe documentar:

```text id="w6fr9h"
GET /api/v1/public/documents/{documentId}
GET /api/v1/public/document-files/{fileId}/download
GET /api/v1/public/tenants/{slug}/documents
GET /api/v1/public/tenants/{slug}/documents/{documentId}
GET /api/v1/public/tenants/{slug}/document-files/{fileId}/download
```

---

# 32. Performance tests

## 32.1. Objetivos MVP

```text id="qoqx5m"
p95 < 700 ms para listados paginados de metadata.
p95 < 1500 ms para preparar descarga autorizada.
p95 < 3000 ms para upload de archivo pequeño/medio sin incluir latencia externa extrema.
Streaming obligatorio para descargas.
No cargar binarios en JSON.
```

---

## 32.2. Escenarios

Debe medir:

```text id="ytq0gc"
GET /tenant/documents con 10.000 documentos por tenant
GET /tenant/documents con filtros sourceModule/category/status
GET /tenant/documents/{id}/versions con 100 versiones
GET /tenant/document-files/{id} metadata
GET /me/documents con 500 documentos autorizados
POST /tenant/documents/{id}/files con archivo pequeño
POST /tenant/documents/{id}/files con archivo al límite permitido
GET /tenant/document-files/{id}/download con streaming
GET /me/document-files/{id}/download con streaming
hash calculation para archivo al límite
access log insert performance
```

---

## 32.3. Validaciones

```text id="k0nfhc"
paginación obligatoria
pageSize máximo 100
índices usados
sin N+1 evidente
no cargar binarios en listados
no usar base64 en JSON
no leer archivo completo en memoria para descarga si puede evitarse
streaming para descargas
hash por stream cuando sea posible
storage externo con timeouts
```

---

# 33. Concurrency tests

Debe probar:

```text id="daev14"
dos requests simultáneos crean versión para mismo documento
versionNumber único e incremental
dos requests simultáneos suben primary file para misma versión
solo un primary activo por versión
dos requests simultáneos archivan y descargan archivo
descarga falla o sigue política consistente
dos requests simultáneos restauran documento archivado
resultado idempotente o 409 controlado
dos requests simultáneos con mismo Idempotency-Key en upload
no duplicar documento/file si política idempotente aplica
```

Escenario primary file duplicado:

```text id="dw81rr"
Request A y Request B intentan crear SecureDocumentFile con:
tenantId + versionId iguales
isPrimary = true
status = available
archivedAt = null
```

Resultado esperado:

```text id="krnjaj"
1 archivo primary activo
1 respuesta 409 o uno queda no-primary según política documentada
```

---

# 34. Smoke tests

Debe ejecutarse flujo mínimo:

```text id="gbzktw"
1. GET /api/v1/health
2. POST /api/v1/tenant/documents
3. POST /api/v1/tenant/documents/{documentId}/versions
4. POST /api/v1/tenant/documents/{documentId}/files
5. GET /api/v1/tenant/documents
6. GET /api/v1/tenant/documents/{documentId}
7. GET /api/v1/tenant/documents/{documentId}/versions
8. GET /api/v1/tenant/document-files/{fileId}
9. GET /api/v1/tenant/document-files/{fileId}/download
10. GET /api/v1/tenant/documents/{documentId}/access-logs
11. POST /api/v1/tenant/document-files/{fileId}/archive
12. POST /api/v1/tenant/documents/{documentId}/archive
13. POST /api/v1/tenant/documents/{documentId}/restore
14. GET /api/v1/me/documents
15. GET /api/v1/public/documents/{documentId} debe no existir
16. Verificar que ninguna respuesta contiene storageKey
```

---

# 35. Comandos sugeridos

## 35.1. Comandos específicos

```bash id="kfkmeo"
npm run test:secure-document-storage
npm run test:secure-document-storage:unit
npm run test:secure-document-storage:domain
npm run test:secure-document-storage:dto
npm run test:secure-document-storage:application
npm run test:secure-document-storage:repositories
npm run test:secure-document-storage:storage
npm run test:secure-document-storage:hash
npm run test:secure-document-storage:file-validation
npm run test:secure-document-storage:api
npm run test:secure-document-storage:authorization
npm run test:secure-document-storage:own-resource
npm run test:secure-document-storage:source-resource
npm run test:secure-document-storage:multitenancy
npm run test:secure-document-storage:audit
npm run test:secure-document-storage:access-log
npm run test:secure-document-storage:observability
npm run test:secure-document-storage:security
npm run test:secure-document-storage:openapi
npm run test:secure-document-storage:performance
npm run test:secure-document-storage:smoke
```

---

## 35.2. Comandos generales

```bash id="zb7y5s"
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

---

# 36. CI/CD gates

El pipeline debe fallar si:

```text id="d64hlh"
lint falla
typecheck falla
unit tests fallan
domain tests fallan
DTO validation tests fallan
application tests fallan
repository tests fallan
storage tests fallan
hash tests fallan
file validation tests fallan
API tests fallan
authorization tests fallan
own-resource tests fallan
source-resource tests fallan
multitenancy tests fallan
audit tests fallan
access-log tests fallan
observability tests fallan
security tests fallan
OpenAPI validation falla
OpenAPI documenta endpoints públicos prohibidos
storageKey aparece en snapshots de respuesta
storageKey aparece en errores
storageKey aparece en logs
storageKey aparece en auditoría
binarios aparecen en JSON
binarios aparecen en logs
binarios aparecen en auditoría
local storage queda habilitado por defecto en producción
build falla
```

---

# 37. Coverage mínimo recomendado

```text id="pb7sda"
Unit tests: >= 85%
Domain tests: >= 85%
Application services: >= 85%
Repositories críticos: >= 85%
Storage adapters: >= 80%
Hash/File validation: >= 90%
API endpoints críticos: 100% de rutas definidas
Authorization tests: 100% de permisos críticos
Multitenancy tests: 100% de entidades tenant-scoped
Security tests: 100% de reglas críticas
OpenAPI tests: 100% de endpoints definidos y endpoints prohibidos
```

Regla:

```text id="r2sujk"
La cobertura numérica no reemplaza pruebas de tenant isolation, storageKey protection, sourceResource validation, owner validation, file validation, secure download, audit sanitization, log sanitization y ausencia de endpoints públicos.
```

---

# 38. Matriz de trazabilidad funcional

| Requisito                    | Prueba principal                       |
| ---------------------------- | -------------------------------------- |
| Crear documento              | API + use-case + repository            |
| Clasificar documento         | DTO + domain + API                     |
| Validar source resource      | SourceResourceService + API            |
| Validar owner                | OwnerPolicy + multitenancy             |
| Crear versión                | Version service + repository           |
| Subir archivo                | Upload service + storage adapter + API |
| Calcular hash                | Hash service + integrity tests         |
| Validar MIME                 | File validation tests                  |
| Validar tamaño               | File validation + API                  |
| Sanitizar filename           | Value object + upload tests            |
| Proteger storageKey          | DTO + security snapshots               |
| Descargar archivo            | Download service + storage + API       |
| Registrar access log         | AccessLog repository + API             |
| Auditar descarga             | Audit tests                            |
| Archivar documento           | Service + API                          |
| Restaurar documento          | Service + API                          |
| Consultar documentos propios | `/me` + own-resource                   |
| Configurar storage platform  | Platform API + security                |
| No endpoints públicos        | Route negative + OpenAPI               |
| No binarios en JSON          | API + security                         |
| No binarios en logs/audit    | Observability + Audit                  |

---

# 39. Riesgos cubiertos por pruebas

| Riesgo                              | Pruebas                      |
| ----------------------------------- | ---------------------------- |
| Documento cross-tenant              | Multitenancy + repository    |
| File cross-tenant                   | Multitenancy + download      |
| Version cross-tenant                | Repository + API             |
| SourceResourceId cross-tenant       | SourceResourceService        |
| OwnerId cross-tenant                | OwnerPolicy + API            |
| Exposición de storageKey            | DTO snapshots + security     |
| URL firmada persistente             | Storage security             |
| Descarga no autorizada              | Authorization + own-resource |
| Archivo en cuarentena descargable   | File state tests             |
| Archivo rechazado descargable       | File state tests             |
| Archivo archivado visible           | API + state                  |
| MIME spoofing                       | File validation              |
| Path traversal                      | Filename + storage adapter   |
| Archivo sin hash                    | Constraint + service         |
| Binario en JSON                     | API security                 |
| Binario en logs                     | Observability                |
| Binario en auditoría                | Audit                        |
| Endpoint público accidental         | OpenAPI + route negative     |
| Local storage en producción         | Config tests                 |
| PlatformAdmin con acceso automático | Authorization                |

---

# 40. No aceptación

La implementación no debe aceptarse si:

```text id="qnfbt0"
permite documentos cross-tenant
permite archivos cross-tenant
permite versiones cross-tenant
permite links cross-tenant
permite policies cross-tenant
permite access logs cross-tenant
permite usar sourceResourceId de otro tenant
permite usar ownerUserId de otro tenant
permite usar ownerPersonId de otro tenant
permite usar ownerPropertyUnitId de otro tenant
permite audienceRules cross-tenant
acepta tenantId desde body
acepta storageKey desde cliente
expone storageKey
expone bucket o path interno
expone URL firmada persistente
descarga sin autorización
descarga archivo en cuarentena
descarga archivo rechazado
descarga archivo archivado
descarga archivo missing
muestra documentos archivados por defecto
omite hash de archivo available
no valida MIME type
no valida fileSize
permite path traversal
permite MIME spoofing evidente
registra binarios en JSON
registra binarios en logs
registra binarios en auditoría
crea endpoints públicos
documenta endpoints públicos en OpenAPI
permite acceso PlatformAdmin automático al contenido de tenants
usa storage local como configuración productiva por defecto
omite auditoría de operaciones críticas
omite access logs de descargas
```

---

# 41. Resultado esperado

Al completar este plan de pruebas, el módulo `016-secure-document-storage` tendrá validación suficiente para asegurar que:

```text id="zk2z2y"
- los documentos son tenant-scoped;
- los archivos son tenant-scoped;
- las versiones son tenant-scoped;
- las políticas son tenant-scoped;
- los access logs son tenant-scoped;
- todos los recursos origen se validan contra tenant;
- todos los owners se validan contra tenant;
- no se acepta tenantId desde body;
- no se acepta storageKey desde cliente;
- storageKey nunca se expone;
- los archivos se validan por MIME, extensión, tamaño y nombre;
- path traversal queda bloqueado;
- SHA-256 se calcula sobre bytes reales;
- hashPrefix se expone de forma segura;
- hash completo no se expone por DTO estándar;
- los documentos propios se resuelven por owner, audiencia o módulo origen;
- las descargas requieren autorización;
- archivos quarantined/rejected/archived/missing no son descargables;
- las descargas generan access logs;
- las operaciones críticas generan auditoría;
- logs y métricas no filtran datos sensibles;
- OpenAPI no documenta endpoints públicos;
- no existen endpoints públicos;
- storage local no queda habilitado por defecto en producción;
- CI bloquea regresiones críticas.
```

---

## 42. Decisión final del plan de pruebas

El módulo `016-secure-document-storage` debe probarse como infraestructura documental transversal crítica.

La prioridad de pruebas debe ser:

```text id="v55eek"
1. Tenant isolation.
2. Source resource validation.
3. Owner/own-resource validation.
4. Storage key protection.
5. File validation.
6. Secure download.
7. Hash integrity.
8. Access logs.
9. Audit sanitization.
10. No public endpoints.
11. Safe storage configuration.
12. CI gates.
```

Sin estas pruebas, el módulo no debe pasar a implementación productiva.
