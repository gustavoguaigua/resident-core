# Plan — Spec 016 Secure Document Storage

> Frontera operativa Sprint 3: el contrato canónico es
> `docs/changes/GAP-S3-008-FILE-SECURITY-OPERATING-POLICY-2026-08-30.md`; no añade
> scanner, categorías posteriores ni purga documental.

> Frontera Sprint 3: GAP-S3-005 está cerrado por
> `docs/changes/GAP-S3-005-PAYMENTS-DOCUMENT-STORAGE-BOUNDARY-2026-08-29.md`.
> El módulo base no depende de Payments; los módulos consumidores aportan validadores
> de recurso origen a través de puertos. Este documento queda `accepted`.

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                                 |
| Spec ID         | 016                                                                                                                                                                           |
| Módulo          | Secure Document Storage                                                                                                                                                       |
| Documento       | Plan técnico                                                                                                                                                                  |
| Ruta            | `docs/specs/016-secure-document-storage/plan.md`                                                                                                                              |
| Versión         | 0.1                                                                                                                                                                           |
| Estado          | accepted                                                                                                                                                                  |
| Fecha           | 2026-07-21                                                                                                                                                                    |
| Documento base  | `docs/specs/016-secure-document-storage/spec.md`                                                                                                                              |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `007-audit`                                                                                                      |
| Relacionado con | comprobantes, evidencias, adjuntos, PDFs, reportes exportados, storage S3-compatible, auditoría, control de acceso, descargas seguras                                         |
| API Style       | REST                                                                                                                                                                          |
| Arquitectura    | Monolito modular preparado para microservicios                                                                                                                                |
| Stack objetivo  | NestJS, TypeScript, PostgreSQL, Prisma, storage local dev, S3-compatible prod, Docker, OpenAPI                                                                                |

---

## 2. Propósito

Este documento define el plan técnico para implementar el módulo `016-secure-document-storage`.

El módulo proveerá una capa transversal de almacenamiento documental seguro para RESIDENT Core, permitiendo registrar documentos lógicos, versiones, archivos físicos, metadata segura, hashes, accesos, descargas, archivo lógico y auditoría.

Regla central:

```text id="fas9zu"
Secure Document Storage debe ser la capa transversal de documentos de RESIDENT Core, garantizando tenant isolation, storage key protection, hash integrity, metadata segura, permisos, autorización por recurso, descargas auditadas, provider abstraction y cero exposición pública por defecto.
```

---

## 3. Decisión técnica inicial

### 3.1. Nombre técnico del módulo

```text id="l2g58i"
secure-document-storage
```

---

### 3.2. Ruta sugerida

```text id="brz0zr"
apps/api/src/modules/secure-document-storage/
```

---

### 3.3. Tipo de módulo

```text id="pizecr"
Cross-cutting module
Tenant-scoped
Storage-backed
Metadata-driven
Hash-aware
Access-controlled
Source-module-aware
Own-resource-aware
Audit-heavy
Provider-abstracted
Non-public-by-default
```

---

### 3.4. Estilo arquitectónico

El módulo seguirá el estilo general de RESIDENT Core:

```text id="thljfu"
monolito modular
API-first
NestJS
TypeScript
PostgreSQL
Prisma
REST
OpenAPI
Keycloak/OIDC para autenticación
autorización propia dentro de RESIDENT Core
storage provider abstraction
local storage para desarrollo
S3-compatible storage para producción
auditoría obligatoria
observabilidad segura
```

---

## 4. Decisión MVP

Para MVP se implementará:

```text id="m3lbre"
- registro lógico de documentos;
- versiones simples de documentos;
- registro de archivos físicos;
- metadata segura;
- clasificación por categoría;
- clasificación por sensibilidad;
- clasificación por visibilidad;
- vínculo con módulo origen;
- vínculo con recurso origen;
- upload seguro;
- download seguro;
- hash SHA-256;
- validación MIME type;
- validación file size;
- safe filename;
- storageKey generado por servidor;
- storageKey interno no expuesto;
- local storage adapter para desarrollo;
- S3-compatible storage port preparado para producción;
- access logs;
- auditoría;
- archivo lógico;
- restauración administrativa;
- consulta administrativa;
- consulta propia limitada;
- integración mediante puertos con Payments, Fines, Communications, Certified Minutes y Reports;
- OpenAPI sin endpoints públicos;
- pruebas de multitenancy, autorización, storage, hash, seguridad y no exposición.
```

---

## 5. Fuera de alcance técnico MVP

No implementar en esta spec:

```text id="n19pyj"
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
- búsqueda full-text del contenido;
- indexación semántica;
- IA sobre documentos reales;
- integración Google Drive / OneDrive / Dropbox;
- eliminación física automática;
- legal hold;
- retención legal avanzada;
- cifrado por tenant con llaves dedicadas;
- versionado binario complejo;
- previsualización avanzada;
- conversión universal de formatos.
```

---

## 6. Dependencias funcionales

### 6.1. `001-tenants`

Uso:

```text id="r8edmm"
- validar tenant activo;
- aplicar tenant_id;
- impedir documentos cross-tenant;
- soportar cuotas futuras por tenant;
- soportar configuración futura de storage por tenant.
```

---

### 6.2. `002-users-roles`

Uso:

```text id="q9du5a"
- validar usuario autenticado;
- validar membership activa;
- validar permisos;
- validar roles administrativos;
- validar acceso propio;
- validar PlatformAdmin sin acceso automático.
```

---

### 6.3. `003-residents-properties`

Uso:

```text id="iu4ywn"
- resolver propietarios;
- resolver residentes;
- resolver unidades habitacionales;
- resolver acceso own-resource;
- validar documentos asociados a persona o unidad.
```

---

### 6.4. `005-payments`

Uso:

```text id="gaovxe"
- almacenar comprobantes de pago;
- registrar recibos emitidos;
- asociar documentos a paymentId, paymentReceiptId o propertyUnitId;
- permitir upload propio de comprobantes bajo política del módulo Payments.
```

---

### 6.5. `007-audit`

Uso:

```text id="rcxm9f"
- auditar creación documental;
- auditar upload;
- auditar descarga;
- auditar acceso denegado;
- auditar archivo;
- auditar restauración;
- auditar cambios de metadata;
- auditar configuración de storage.
```

---

### 6.6. `011-fines-sanctions`

Uso:

```text id="mk3q4v"
- almacenar evidencias de multas;
- almacenar documentos de apelaciones;
- aplicar sensibilidad restricted;
- restringir descarga a roles autorizados o usuarios propios según política del módulo origen.
```

---

### 6.7. `012-communications-notifications`

Uso:

```text id="ut37fc"
- almacenar adjuntos de comunicados;
- almacenar imágenes de portada;
- evitar que notificaciones expongan storageKey;
- habilitar actionUrl interno controlado.
```

---

### 6.8. `015-certified-minutes`

Uso:

```text id="bidsmm"
- almacenar PDF oficial interno;
- almacenar PDF borrador;
- almacenar hash manifest;
- almacenar adjuntos del acta;
- respetar audiencia de publicación definida por Certified Minutes;
- delegar autorización cuando visibility = sourceResourceAudience.
```

---

## 7. Estructura de carpetas propuesta

```text id="wxe5q2"
apps/api/src/modules/secure-document-storage/
├── secure-document-storage.module.ts
├── controllers/
│   ├── documents.controller.ts
│   ├── document-files.controller.ts
│   ├── document-versions.controller.ts
│   ├── my-documents.controller.ts
│   └── document-storage-platform.controller.ts
│
├── application/
│   ├── use-cases/
│   ├── services/
│   └── ports/
│
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   └── errors/
│
├── infrastructure/
│   ├── persistence/
│   ├── storage/
│   ├── hash/
│   ├── validators/
│   ├── integrations/
│   └── audit/
│
├── dto/
├── guards/
├── policies/
├── mappers/
└── tests/
```

---

## 8. Componentes principales

### 8.1. Módulo NestJS

```text id="tjroxf"
SecureDocumentStorageModule
```

Responsabilidades:

* registrar controladores;
* registrar servicios;
* registrar repositorios;
* registrar puertos;
* registrar storage adapters;
* registrar hash service;
* registrar file validation policy;
* registrar source resource validators;
* exponer API REST;
* integrar auditoría;
* integrar observabilidad;
* servir como módulo transversal para otros módulos.

---

### 8.2. Controladores

```text id="a1n8uu"
DocumentsController
DocumentFilesController
DocumentVersionsController
MyDocumentsController
DocumentStoragePlatformController
```

---

### 8.3. Servicios de aplicación

```text id="b5cp3q"
SecureDocumentService
SecureDocumentVersionService
SecureDocumentFileService
SecureDocumentUploadService
SecureDocumentDownloadService
SecureDocumentMetadataService
SecureDocumentArchiveService
SecureDocumentRestoreService
SecureDocumentAccessService
SecureDocumentPolicyService
SecureDocumentSourceResourceService
SecureDocumentHashService
SecureDocumentFileValidationService
SecureDocumentStorageService
SecureDocumentAuditService
SecureDocumentObservabilityService
```

---

### 8.4. Entidades de dominio

```text id="fa54qq"
SecureDocument
SecureDocumentVersion
SecureDocumentFile
SecureDocumentLink
SecureDocumentPolicy
SecureDocumentAccessLog
```

---

### 8.5. Value Objects

```text id="ehtz6z"
DocumentTitle
DocumentDescription
DocumentStatus
DocumentVisibility
DocumentSensitivity
DocumentCategory
SourceModule
SourceResourceRef
DocumentOwnerRef
DocumentFileName
DocumentMimeType
DocumentExtension
DocumentFileSize
DocumentStorageKey
DocumentHash
DocumentHashAlgorithm
DocumentMetadata
DocumentAudienceRules
DocumentRetentionPolicyRef
DocumentAccessOutcome
```

---

### 8.6. Puertos de aplicación

```text id="h6jqvq"
SecureDocumentRepositoryPort
SecureDocumentVersionRepositoryPort
SecureDocumentFileRepositoryPort
SecureDocumentLinkRepositoryPort
SecureDocumentPolicyRepositoryPort
SecureDocumentAccessLogRepositoryPort

SecureDocumentStoragePort
SecureDocumentHashPort
SecureDocumentFileValidatorPort
SecureDocumentAuditPort
SecureDocumentSourceResourceValidatorPort
SecureDocumentOwnerResolverPort
SecureDocumentAudienceResolverPort
SecureDocumentPermissionPort
SecureDocumentQuotaPort
SecureDocumentClockPort
```

---

### 8.7. Repositorios Prisma

```text id="yeuqik"
PrismaSecureDocumentRepository
PrismaSecureDocumentVersionRepository
PrismaSecureDocumentFileRepository
PrismaSecureDocumentLinkRepository
PrismaSecureDocumentPolicyRepository
PrismaSecureDocumentAccessLogRepository
```

---

### 8.8. Storage adapters

```text id="fy8i96"
LocalSecureDocumentStorageAdapter
S3CompatibleSecureDocumentStorageAdapter
MockSecureDocumentStorageAdapter
```

MVP:

```text id="ibksyx"
LocalSecureDocumentStorageAdapter para desarrollo.
MockSecureDocumentStorageAdapter para pruebas.
S3CompatibleSecureDocumentStorageAdapter preparado por interfaz y configuración, aunque puede quedar deshabilitado hasta producción.
```

---

## 9. Modelo de datos previsto

### 9.1. Tablas nuevas MVP

```text id="xyssz0"
secure_documents
secure_document_versions
secure_document_files
secure_document_links
secure_document_policies
secure_document_access_logs
```

---

### 9.2. Tablas externas relacionadas

```text id="gsan9n"
tenants
user_profiles
persons
property_units
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

---

### 9.3. Regla multitenant

Todas las tablas nuevas deben incluir:

```text id="o7kxb9"
tenant_id
```

Regla obligatoria:

```text id="qqvm19"
Toda consulta debe filtrar por tenant_id.
```

Patrón requerido:

```typescript id="vgpbjk"
await prisma.secureDocument.findFirst({
  where: {
    id: documentId,
    tenantId: currentTenant.id,
    archivedAt: null
  }
});
```

Patrón prohibido:

```typescript id="d55o8v"
await prisma.secureDocument.findUnique({
  where: { id: documentId }
});
```

---

## 10. Diseño de estados

### 10.1. SecureDocument

Estados:

```text id="b8ymwe"
draft
uploaded
available
quarantined
rejected
archived
deletedPending
restored
```

Transiciones principales:

```text id="f0xxkm"
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

Transiciones prohibidas:

```text id="s43aro"
archived -> uploaded
deletedPending -> available sin revisión
rejected -> available sin flujo de revisión
available -> draft
```

---

### 10.2. SecureDocumentVersion

Estados sugeridos:

```text id="qmbabr"
draft
active
superseded
archived
```

Transiciones:

```text id="wiutef"
draft -> active
active -> superseded
active -> archived
superseded -> archived
archived -> active solo por restauración controlada
```

---

### 10.3. SecureDocumentFile

Estados:

```text id="hxvqzm"
pending
stored
available
quarantined
rejected
archived
missing
failed
```

Transiciones:

```text id="ev57dy"
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

---

## 11. Estrategia de storage

### 11.1. Principio

El dominio no debe depender directamente del proveedor físico.

Todo acceso a storage debe pasar por:

```text id="kzauhr"
SecureDocumentStoragePort
```

---

### 11.2. Métodos mínimos del puerto

```typescript id="eerfib"
interface SecureDocumentStoragePort {
  putObject(input: PutSecureDocumentObjectInput): Promise<StoredObjectResult>;
  getObjectStream(input: GetSecureDocumentObjectInput): Promise<ReadableStreamResult>;
  getObjectMetadata(input: GetSecureDocumentObjectMetadataInput): Promise<StoredObjectMetadata>;
  objectExists(input: ObjectExistsInput): Promise<boolean>;
  createTemporaryDownloadUrl(input: CreateTemporaryDownloadUrlInput): Promise<TemporaryDownloadUrlResult>;
  archiveObject(input: ArchiveSecureDocumentObjectInput): Promise<void>;
  deleteObjectPhysical(input: DeleteSecureDocumentObjectInput): Promise<void>;
}
```

---

### 11.3. Storage local

Uso permitido:

```text id="ikx7rv"
desarrollo local
tests controlados
entornos efímeros no productivos
```

No permitido:

```text id="ijda43"
producción
almacenamiento definitivo
archivos sensibles reales sin controles adicionales
```

---

### 11.4. S3-compatible

Provider objetivo para producción:

```text id="k52td0"
AWS S3
MinIO
Cloudflare R2
otro provider compatible con API S3
```

Reglas:

```text id="q7g57m"
- bucket privado;
- objetos privados por defecto;
- no ACL pública;
- server-side encryption obligatoria fuera de local;
- credenciales en secret manager o variables seguras;
- URLs temporales con TTL corto si se usan;
- no URLs persistentes.
```

---

### 11.5. Storage key

El servidor genera `storageKey`.

Formato interno sugerido:

```text id="cc9lp9"
documents/{tenantId}/{sourceModule}/{documentId}/versions/{versionId}/files/{fileId}/{safeFileName}
```

Prohibido:

```text id="ilvvx8"
- usar filename original como path completo;
- aceptar path desde cliente;
- aceptar storageKey desde cliente;
- exponer storageKey;
- guardar URLs temporales;
- registrar storageKey en logs o auditoría.
```

---

## 12. Estrategia de hash

### 12.1. Algoritmo MVP

```text id="bsm623"
SHA-256
```

---

### 12.2. Hash de archivo

```text id="i734ww"
fileHash = SHA-256(binary file)
```

---

### 12.3. Exposición

Permitido en DTO:

```text id="brvwiu"
hashPrefix
hashAlgorithm
```

Restringido por DTO estándar:

```text id="a8v4f1"
fileHash completo
```

---

### 12.4. Usos del hash

```text id="wypi2a"
- verificar integridad;
- detectar cambios físicos;
- comparar archivos duplicados bajo política futura;
- auditar evidencia técnica;
- validar descarga;
- preparar firma o sellado externo futuro.
```

---

## 13. Estrategia de validación de archivos

### 13.1. Validaciones mínimas

```text id="fd3wbq"
fileName
extension
mimeType declarado
magic bytes cuando sea posible
fileSize > 0
fileSize <= límite configurado
category permitida
sourceModule permitido
sourceResource tenant-scoped
hash calculado
path traversal bloqueado
storageKey ausente en request
```

---

### 13.2. MIME types iniciales permitidos

Allowlist fija de Sprint 3 para `PAYMENT_RECEIPT`:

```text id="qyelnk"
application/pdf
image/png
image/jpeg
```

---

### 13.3. MIME types no permitidos por defecto

```text id="s3kthb"
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

### 13.4. Tamaño máximo de Sprint 3

```text id="j7x3jq"
paymentReceiptMaxFileSizeBytes = 10485760
```

Este límite no se amplía por ambiente, tenant, categoría o endpoint.

---

## 14. Estrategia de permisos

### 14.1. Permisos administrativos

```text id="g2yje2"
documents.create
documents.read
documents.updateMetadata
documents.archive
documents.restore
documents.download
documents.managePolicies
```

---

### 14.2. Permisos propios

```text id="t760bw"
documents.read.own
documents.download.own
documents.upload.own
```

---

### 14.3. Permisos de sistema

```text id="lwc9px"
documents.registerSystemGenerated
documents.readSystemMetadata
```

---

### 14.4. Permisos de configuración

```text id="yxdel6"
documents.storage.configure
documents.storage.readConfig
documents.storage.testConnection
```

---

### 14.5. Auditoría

```text id="cxqtlc"
documents.audit.read
```

---

### 14.6. Regla PlatformAdmin

```text id="gruzej"
PlatformAdmin no accede automáticamente al contenido documental de tenants.
```

Acceso excepcional requiere:

```text id="bxj185"
permiso explícito
contexto de soporte
justificación
auditoría reforzada
```

---

## 15. Estrategia de autorización documental

### 15.1. Autorización administrativa

Debe evaluar:

```text id="fpqy7s"
tenant
membership activa
permiso
sourceModule
category
sensitivity
status
archivedAt
```

---

### 15.2. Autorización propia

Debe evaluar:

```text id="eou49w"
actorUserId
actorPersonIds
actorPropertyUnitIds
sourceModule
sourceResourceId
documentOwnerType
documentOwnerId
visibility
audienceRules
sensitivity
status
archivedAt
```

---

### 15.3. Autorización delegada al módulo origen

Cuando:

```text id="o6k0mk"
visibility = sourceResourceAudience
```

la decisión debe delegarse al módulo origen mediante:

```text id="j3y4nx"
SecureDocumentSourceResourceValidatorPort
SecureDocumentAudienceResolverPort
```

Ejemplo:

```text id="y479nl"
Certified Minutes decide si el usuario puede descargar el PDF de un acta publicada.
Payments decide si el usuario puede descargar su comprobante propio.
Fines decide si el usuario puede ver evidencia relacionada con una multa propia.
```

---

## 16. API prevista

### 16.1. Endpoints tenant administrativos

```text id="cg7feo"
GET    /api/v1/tenant/documents
POST   /api/v1/tenant/documents
GET    /api/v1/tenant/documents/{documentId}
PATCH  /api/v1/tenant/documents/{documentId}/metadata
POST   /api/v1/tenant/documents/{documentId}/archive
POST   /api/v1/tenant/documents/{documentId}/restore
GET    /api/v1/tenant/documents/{documentId}/access-logs
```

---

### 16.2. Endpoints de archivos

```text id="ovyc4k"
POST   /api/v1/tenant/documents/{documentId}/files
GET    /api/v1/tenant/document-files/{fileId}
GET    /api/v1/tenant/document-files/{fileId}/download
POST   /api/v1/tenant/document-files/{fileId}/archive
```

---

### 16.3. Endpoints de versiones

```text id="s3nhf0"
GET    /api/v1/tenant/documents/{documentId}/versions
POST   /api/v1/tenant/documents/{documentId}/versions
GET    /api/v1/tenant/document-versions/{versionId}
POST   /api/v1/tenant/document-versions/{versionId}/archive
```

---

### 16.4. Endpoints propios

```text id="aywj6v"
GET    /api/v1/me/documents
GET    /api/v1/me/documents/{documentId}
GET    /api/v1/me/document-files/{fileId}/download
POST   /api/v1/me/documents
POST   /api/v1/me/documents/{documentId}/files
```

Regla:

```text id="b0bdht"
Los endpoints POST /me solo deben habilitarse para categorías permitidas por módulo origen, como paymentReceipt, y con validación propia estricta.
```

---

### 16.5. Endpoints platform

```text id="qtfbt2"
GET    /api/v1/platform/document-storage/config
PATCH  /api/v1/platform/document-storage/config
POST   /api/v1/platform/document-storage/test-connection
GET    /api/v1/platform/document-storage/providers
```

---

### 16.6. Endpoints públicos

No crear endpoints públicos en MVP.

Prohibido:

```text id="pk4kqi"
GET /api/v1/public/documents/{documentId}
GET /api/v1/public/document-files/{fileId}/download
GET /api/v1/public/tenants/{slug}/documents
GET /api/v1/public/tenants/{slug}/documents/{documentId}
GET /api/v1/public/tenants/{slug}/document-files/{fileId}/download
```

---

## 17. DTOs previstos

### 17.1. Documents

```text id="gzvqxa"
CreateSecureDocumentDto
UpdateSecureDocumentMetadataDto
ArchiveSecureDocumentDto
RestoreSecureDocumentDto
SecureDocumentAdminDto
SecureDocumentListItemDto
SecureDocumentMetadataDto
SecureDocumentFilterDto
```

---

### 17.2. Versions

```text id="ayqres"
CreateSecureDocumentVersionDto
SecureDocumentVersionDto
SecureDocumentVersionListItemDto
ArchiveSecureDocumentVersionDto
```

---

### 17.3. Files

```text id="vhe0xp"
UploadSecureDocumentFileDto
RegisterSystemGeneratedDocumentFileDto
SecureDocumentFileDto
SecureDocumentFileListItemDto
DownloadSecureDocumentFileDto
ArchiveSecureDocumentFileDto
```

---

### 17.4. Access logs

```text id="mtt1ae"
SecureDocumentAccessLogDto
SecureDocumentAccessLogListItemDto
SecureDocumentAccessLogFilterDto
```

---

### 17.5. Platform config

```text id="twjmtt"
DocumentStorageConfigDto
UpdateDocumentStorageConfigDto
DocumentStorageProviderDto
DocumentStorageConnectionTestResultDto
```

---

### 17.6. `/me`

```text id="m5rxqy"
OwnSecureDocumentDto
OwnSecureDocumentListItemDto
OwnSecureDocumentFileDto
CreateOwnSecureDocumentDto
UploadOwnSecureDocumentFileDto
```

---

## 18. Puertos internos para otros módulos

### 18.1. Registro de documento generado por sistema

```typescript id="zoo15b"
interface RegisterSystemGeneratedDocumentInput {
  tenantId: string;
  sourceModule: SourceModule;
  sourceResourceType: string;
  sourceResourceId: string;
  category: DocumentCategory;
  sensitivity: DocumentSensitivity;
  visibility: DocumentVisibility;
  fileName: string;
  mimeType: string;
  buffer: Buffer;
  generatedBy?: string | "system";
  metadata?: Record<string, unknown>;
}
```

---

### 18.2. Registro de upload iniciado por otro módulo

```typescript id="lzslkx"
interface RegisterUploadedDocumentInput {
  tenantId: string;
  sourceModule: SourceModule;
  sourceResourceType: string;
  sourceResourceId: string;
  category: DocumentCategory;
  sensitivity: DocumentSensitivity;
  visibility: DocumentVisibility;
  uploadedBy: string;
  file: UploadedFile;
  ownerType?: string;
  ownerId?: string;
  metadata?: Record<string, unknown>;
}
```

---

### 18.3. Descarga delegada

```typescript id="yqwqyl"
interface AuthorizeDocumentDownloadInput {
  tenantId: string;
  actorUserId: string;
  documentId?: string;
  fileId: string;
  sourceModule?: SourceModule;
  sourceResourceId?: string;
  requestedAccessType: "download" | "preview";
}
```

---

## 19. Integración con módulos origen

### 19.1. Payments

Plan:

```text id="wl6xt5"
- PaymentReceipt pasa a registrar archivo mediante Secure Document Storage.
- payment_receipts mantiene referencia lógica al secureDocumentId o secureDocumentFileId.
- upload propio usa /me bajo política Payments.
- descarga propia delega a PaymentAccessPolicy.
- financial manager descarga bajo permiso documents.download + payments.read.
```

---

### 19.2. Fines and Sanctions

Plan:

```text id="axxeyx"
- FineEvidence puede mapearse a SecureDocument.
- fine_evidence mantiene secureDocumentId o secureDocumentFileId.
- evidencia se clasifica como confidential o restricted.
- descarga solo por FineManager o usuario propio si política lo permite.
```

---

### 19.3. Communications

Plan:

```text id="qgp5h0"
- CommunicationAttachment se registra como SecureDocument.
- communication images privadas usan SecureDocument.
- imágenes públicas futuras no se habilitan en MVP.
- notificaciones nunca reciben storageKey.
```

---

### 19.4. Certified Minutes

Plan:

```text id="hyod0q"
- CertifiedMinutesArtifact registra su PDF como SecureDocumentFile.
- CertifiedMinutesAttachment puede registrar adjuntos como SecureDocumentFile.
- Certified Minutes mantiene su modelo propio, pero delega storage físico a este módulo.
- descarga final sigue respetando audiencia de Certified Minutes.
```

---

### 19.5. Reports

Plan:

```text id="r25axi"
- Report exports futuros registran CSV/XLSX/PDF como SecureDocument.
- visibility administrative por defecto.
- expiración futura diferida.
```

---

## 20. Seguridad técnica

### 20.1. Guards

```text id="d9a2au"
DocumentPermissionGuard
DocumentTenantGuard
DocumentSourceResourceGuard
DocumentOwnResourceGuard
DocumentFileGuard
DocumentDownloadGuard
DocumentStorageConfigGuard
PlatformDocumentStorageGuard
```

---

### 20.2. Policies

```text id="jethqc"
DocumentTenantPolicy
DocumentSourceResourcePolicy
DocumentAccessPolicy
DocumentOwnResourcePolicy
DocumentVisibilityPolicy
DocumentSensitivityPolicy
DocumentFileValidationPolicy
DocumentStorageKeyPolicy
DocumentDownloadPolicy
DocumentArchivePolicy
DocumentRestorePolicy
DocumentMetadataPolicy
PlatformDocumentStoragePolicy
```

---

### 20.3. Reglas obligatorias

```text id="nj46lb"
- no aceptar tenantId desde body;
- no aceptar storageKey desde body;
- no buscar documentos solo por id;
- no buscar files solo por id;
- no buscar versions solo por id;
- validar sourceResourceId contra tenant;
- validar ownerId contra tenant;
- validar audienceRules contra tenant;
- no exponer storageKey;
- no exponer URL firmada persistente;
- no cargar binarios en JSON;
- no registrar binarios en logs;
- no registrar binarios en auditoría;
- no crear endpoints públicos;
- no usar local storage por defecto en producción.
```

---

## 21. Auditoría

### 21.1. Eventos obligatorios

```text id="f7fkdt"
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

### 21.2. Metadata permitida

```text id="eaa6x8"
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
hashPrefix
provider
accessType
outcome
traceId
```

---

### 21.3. Metadata prohibida

```text id="w8w4se"
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

## 22. Observabilidad

### 22.1. Logs sugeridos

```text id="ro26pn"
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

### 22.2. Métricas sugeridas

```text id="idgmn6"
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

### 22.3. Labels permitidos

```text id="r66tz4"
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

### 22.4. Labels prohibidos

```text id="i7sdwu"
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

## 23. Configuración

### 23.1. Variables sugeridas

```text id="tze1b7"
DOCUMENT_STORAGE_PROVIDER=local|s3|s3Compatible|minio
DOCUMENT_STORAGE_LOCAL_ROOT=/var/resident/documents
DOCUMENT_STORAGE_MAX_FILE_SIZE_MB=20
DOCUMENT_STORAGE_IMAGE_MAX_FILE_SIZE_MB=10
DOCUMENT_STORAGE_REPORT_MAX_FILE_SIZE_MB=50
DOCUMENT_STORAGE_TEMP_URL_TTL_SECONDS=300
DOCUMENT_STORAGE_ALLOWED_MIME_TYPES=...
DOCUMENT_STORAGE_REQUIRE_HASH=true
DOCUMENT_STORAGE_LOCAL_ALLOWED_IN_PROD=false
```

Para S3-compatible:

```text id="v51doj"
DOCUMENT_STORAGE_S3_ENDPOINT
DOCUMENT_STORAGE_S3_REGION
DOCUMENT_STORAGE_S3_BUCKET
DOCUMENT_STORAGE_S3_ACCESS_KEY_ID
DOCUMENT_STORAGE_S3_SECRET_ACCESS_KEY
DOCUMENT_STORAGE_S3_FORCE_PATH_STYLE
DOCUMENT_STORAGE_S3_SERVER_SIDE_ENCRYPTION
```

---

### 23.2. Feature flags

```text id="x66qry"
documents.enabled
documents.upload.enabled
documents.download.enabled
documents.ownUpload.enabled
documents.ownDownload.enabled
documents.localStorage.enabled
documents.s3Storage.enabled
documents.temporaryUrls.enabled
documents.fileScan.enabled
documents.publicDocuments.enabled
documents.retentionPolicy.enabled
documents.fullTextSearch.enabled
documents.aiIndexing.enabled
```

---

### 23.3. Defaults MVP

```text id="hzg6ab"
documents.enabled = true
documents.upload.enabled = true
documents.download.enabled = true
documents.ownUpload.enabled = true para categorías explícitas
documents.ownDownload.enabled = true
documents.localStorage.enabled = true en desarrollo
documents.s3Storage.enabled = false hasta configuración productiva
documents.temporaryUrls.enabled = false por defecto
documents.fileScan.enabled = false
documents.publicDocuments.enabled = false
documents.retentionPolicy.enabled = false
documents.fullTextSearch.enabled = false
documents.aiIndexing.enabled = false
```

---

## 24. Estrategia de implementación

### 24.1. Orden recomendado

```text id="zsllw2"
1. Crear estructura base del módulo.
2. Implementar enums y value objects.
3. Implementar entidades de dominio.
4. Implementar políticas de seguridad.
5. Crear Prisma schema y migración.
6. Implementar repositorios tenant-scoped.
7. Implementar hash service.
8. Implementar file validation service.
9. Implementar storage port.
10. Implementar local storage adapter.
11. Implementar mock storage adapter.
12. Preparar S3-compatible adapter.
13. Implementar servicios de documentos.
14. Implementar servicios de versiones.
15. Implementar servicios de archivos.
16. Implementar upload seguro.
17. Implementar download seguro.
18. Implementar access logs.
19. Implementar auditoría.
20. Implementar endpoints administrativos.
21. Implementar endpoints /me.
22. Implementar endpoints platform de configuración.
23. Implementar integración con módulos origen por puertos.
24. Implementar OpenAPI.
25. Implementar tests.
26. Ejecutar hardening.
```

---

### 24.2. PRs sugeridos

```text id="qz9lf0"
PR-016-01 — Module skeleton, enums and value objects.
PR-016-02 — Domain entities, state machines and policies.
PR-016-03 — Prisma schema, migration and repositories.
PR-016-04 — Hash, file validation and metadata sanitization.
PR-016-05 — StoragePort, local adapter and mock adapter.
PR-016-06 — Document, version and file services.
PR-016-07 — Upload and download workflows.
PR-016-08 — Access logs, audit and observability.
PR-016-09 — Admin API and /me API.
PR-016-10 — Platform storage config API.
PR-016-11 — Source module integration ports.
PR-016-12 — OpenAPI, tests and security hardening.
```

---

## 25. Testing plan resumido

### 25.1. Unit tests

```text id="ozzdmx"
DocumentStatus
DocumentVisibility
DocumentSensitivity
DocumentCategory
SourceModule
StorageProvider
FileScanStatus
SecureDocument
SecureDocumentVersion
SecureDocumentFile
SecureDocumentLink
SecureDocumentPolicy
SecureDocumentAccessLog
DocumentFileName
DocumentMimeType
DocumentFileSize
DocumentStorageKey
DocumentHash
DocumentMetadata
```

---

### 25.2. Integration tests

```text id="vt4hyk"
PrismaSecureDocumentRepository
PrismaSecureDocumentVersionRepository
PrismaSecureDocumentFileRepository
PrismaSecureDocumentLinkRepository
PrismaSecureDocumentPolicyRepository
PrismaSecureDocumentAccessLogRepository
LocalStorageAdapter
MockStorageAdapter
S3CompatibleStorageAdapter mock
DocumentHashService
DocumentFileValidationService
SourceResourceValidator
DocumentAccessPolicy
```

---

### 25.3. API tests

```text id="rtifum"
GET /api/v1/tenant/documents
POST /api/v1/tenant/documents
GET /api/v1/tenant/documents/{documentId}
PATCH /api/v1/tenant/documents/{documentId}/metadata
POST /api/v1/tenant/documents/{documentId}/archive
POST /api/v1/tenant/documents/{documentId}/restore
GET /api/v1/tenant/documents/{documentId}/access-logs
POST /api/v1/tenant/documents/{documentId}/files
GET /api/v1/tenant/document-files/{fileId}
GET /api/v1/tenant/document-files/{fileId}/download
POST /api/v1/tenant/document-files/{fileId}/archive
GET /api/v1/me/documents
GET /api/v1/me/documents/{documentId}
GET /api/v1/me/document-files/{fileId}/download
```

---

### 25.4. Security tests

```text id="tmtglu"
no cross-tenant documents
no cross-tenant files
no cross-tenant versions
no cross-tenant access logs
no sourceResourceId cross-tenant
no ownerId cross-tenant
no tenantId from body
no storageKey from body
no storageKey in response
no storageKey in errors
no binary in logs
no binary in audit
no public endpoints
no download without permission
no download outside audience
no archived document visible by default
no quarantined file downloadable
no rejected file downloadable
no local storage enabled in production by default
```

---

### 25.5. Performance tests

```text id="ds719k"
list 10.000 document metadata records paginated
upload max allowed file
download streaming large file
hash calculation timing
source module filter performance
tenant filter performance
access log insert performance
```

---

## 26. Performance objetivo

### 26.1. Objetivos MVP

```text id="gd75ab"
p95 < 700 ms para listados paginados de metadata.
p95 < 1500 ms para preparar descarga autorizada.
p95 < 3000 ms para upload de archivo pequeño/medio sin incluir latencia externa extrema.
Streaming obligatorio para descargas.
No cargar binarios en JSON.
```

---

### 26.2. Reglas técnicas

```text id="hdwapw"
- paginación obligatoria;
- pageSize máximo 100;
- índices por tenant_id;
- índices por sourceModule;
- índices por sourceResourceId;
- índices por category;
- índices por status;
- no binarios en listados;
- no base64 en JSON;
- streaming para descargas;
- hash por stream cuando sea posible;
- no cargar archivos completos en memoria si puede evitarse.
```

---

## 27. Riesgos técnicos

| Riesgo                          | Impacto | Mitigación                                               |
| ------------------------------- | ------: | -------------------------------------------------------- |
| Documento cross-tenant          | Crítico | `tenant_id`, guards, repositorios tenant-scoped, tests   |
| Archivo cross-tenant            | Crítico | file lookup por `tenantId + fileId`                      |
| `sourceResourceId` cross-tenant | Crítico | source resource validators                               |
| Exposición de `storageKey`      | Crítico | DTO minimizado, snapshots, tests                         |
| URL firmada persistente         |    Alto | TTL corto, no persistencia, logs sanitizados             |
| Path traversal                  |    Alto | storageKey server-side, filename sanitizer               |
| MIME spoofing                   |    Alto | MIME + extensión + magic bytes si aplica                 |
| Archivo malicioso               |    Alto | scan status preparado, MIME allowlist, cuarentena futura |
| Local storage en producción     |    Alto | config gate                                              |
| Logs con binarios               |    Alto | log sanitizer                                            |
| Auditoría con binarios          |    Alto | audit sanitizer                                          |
| Descarga sin permiso            | Crítico | download policy + access log                             |
| PlatformAdmin sin control       |    Alto | permiso explícito + audit reforzada                      |
| Hash ausente                    |   Medio | constraint/policy para available                         |
| Archivo físico perdido          |    Alto | state `missing`, objectExists, audit                     |
| Storage provider failure        |    Alto | errores controlados, retry futuro                        |

---

## 28. Seeds y datos demo

Crear seeds ficticios para:

```text id="ck1pro"
secureDocumentPaymentReceiptA
secureDocumentFineEvidenceA
secureDocumentCertifiedMinutesPdfA
secureDocumentCertifiedMinutesAttachmentA
secureDocumentCommunicationAttachmentA
secureDocumentReportExportA
secureDocumentAdministrativeA
secureDocumentResidentA
secureDocumentTenantB

secureDocumentVersion1A
secureDocumentVersion2A
secureDocumentVersionTenantB

secureDocumentFilePdfA
secureDocumentFileImageA
secureDocumentFileDocxA
secureDocumentFileXlsxA
secureDocumentFileCsvA
secureDocumentFileJsonA
secureDocumentFileQuarantinedA
secureDocumentFileRejectedA
secureDocumentFileArchivedA
secureDocumentFileTenantB

secureDocumentLinkPaymentA
secureDocumentLinkFineA
secureDocumentLinkCertifiedMinutesA
secureDocumentLinkCommunicationA
secureDocumentLinkPropertyUnitA
secureDocumentLinkTenantB

secureDocumentPolicyOwnersA
secureDocumentPolicyResidentsA
secureDocumentPolicySpecificUsersA
secureDocumentPolicySourceResourceAudienceA

secureDocumentAccessDownloadAllowedA
secureDocumentAccessDownloadDeniedA
secureDocumentAccessQuarantinedA
secureDocumentAccessTenantB
```

Prohibido en seeds:

```text id="cs6mcn"
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
```

---

## 29. Errores esperados

Catálogo inicial:

```text id="dxw3zw"
DOCUMENT_NOT_FOUND
DOCUMENT_FORBIDDEN
DOCUMENT_INVALID_STATUS
DOCUMENT_NOT_AVAILABLE
DOCUMENT_ARCHIVED
DOCUMENT_CROSS_TENANT_REFERENCE
DOCUMENT_SOURCE_MODULE_REQUIRED
DOCUMENT_SOURCE_RESOURCE_INVALID
DOCUMENT_CATEGORY_REQUIRED
DOCUMENT_SENSITIVITY_REQUIRED
DOCUMENT_VISIBILITY_INVALID
DOCUMENT_METADATA_INVALID
DOCUMENT_VERSION_NOT_FOUND
DOCUMENT_VERSION_INVALID
DOCUMENT_FILE_NOT_FOUND
DOCUMENT_FILE_FORBIDDEN
DOCUMENT_FILE_NOT_AVAILABLE
DOCUMENT_FILE_QUARANTINED
DOCUMENT_FILE_REJECTED
DOCUMENT_FILE_ARCHIVED
DOCUMENT_FILE_INVALID_TYPE
DOCUMENT_FILE_TOO_LARGE
DOCUMENT_FILE_EMPTY
DOCUMENT_FILE_NAME_INVALID
DOCUMENT_FILE_HASH_REQUIRED
DOCUMENT_STORAGE_KEY_FORBIDDEN
DOCUMENT_STORAGE_ERROR
DOCUMENT_STORAGE_PROVIDER_INVALID
DOCUMENT_STORAGE_CONFIG_INVALID
DOCUMENT_STORAGE_CONNECTION_FAILED
DOCUMENT_DOWNLOAD_FORBIDDEN
DOCUMENT_PUBLIC_ENDPOINT_FORBIDDEN
VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
RATE_LIMITED
INTERNAL_ERROR
```

---

## 30. Criterios de aceptación técnica

La implementación deberá cumplir:

```text id="mvogul"
- todas las tablas tienen tenant_id;
- toda consulta filtra por tenant_id;
- no se acepta tenantId en body;
- no se acepta storageKey en body;
- sourceResourceId se valida contra tenant;
- ownerId se valida contra tenant;
- audienceRules se validan contra tenant;
- storageKey se genera en servidor;
- storageKey no se expone;
- URL firmada persistente no se expone;
- archivo available tiene hash;
- hash usa SHA-256;
- MIME type se valida;
- fileSize se valida;
- filename se sanitiza;
- path traversal se bloquea;
- archivos quarantined no se descargan;
- archivos rejected no se descargan;
- documentos archived no se muestran por defecto;
- descargas se auditan;
- access logs se registran;
- logs no contienen binarios;
- auditoría no contiene binarios;
- OpenAPI no documenta endpoints públicos;
- no existen endpoints públicos;
- local storage no está habilitado por defecto en producción;
- CI pasa.
```

---

## 31. Definition of Done

El módulo se considera listo cuando:

```text id="sa2x8q"
1. `spec.md` está aprobado.
2. `plan.md` está aprobado.
3. `data-model.md` está creado.
4. `api-contract.md` está creado.
5. `test-plan.md` está creado.
6. `tasks.md` está creado.
7. `security-notes.md` está creado.
8. Prisma schema está implementado.
9. Migración está ejecutada en test.
10. Repositorios funcionan.
11. StoragePort está definido.
12. LocalStorageAdapter funciona en desarrollo.
13. MockStorageAdapter funciona en tests.
14. S3Compatible adapter está preparado.
15. Hash SHA-256 funciona.
16. File validation funciona.
17. Upload seguro funciona.
18. Download seguro funciona.
19. Access logs funcionan.
20. Audit logs funcionan.
21. Endpoints administrativos funcionan.
22. Endpoints `/me` funcionan bajo categorías permitidas.
23. Endpoints platform de config funcionan bajo permiso.
24. No existen endpoints públicos.
25. OpenAPI está actualizado.
26. Tests unitarios pasan.
27. Tests de repositorio pasan.
28. Tests API pasan.
29. Tests de autorización pasan.
30. Tests own-resource pasan.
31. Tests multitenant pasan.
32. Tests de storage pasan.
33. Tests de seguridad pasan.
34. Build pasa.
35. CI pasa.
```

---

## 32. No aceptación

No se acepta implementación si:

```text id="vko2w9"
- permite documentos cross-tenant;
- permite archivos cross-tenant;
- permite versiones cross-tenant;
- permite access logs cross-tenant;
- permite usar sourceResourceId de otro tenant;
- permite usar ownerId de otro tenant;
- acepta tenantId desde body;
- acepta storageKey desde cliente;
- expone storageKey;
- expone bucket o path interno;
- expone URL firmada persistente;
- descarga sin autorización;
- descarga archivo en cuarentena;
- descarga archivo rechazado;
- muestra documentos archivados por defecto;
- omite hash de archivo available;
- no valida MIME type;
- no valida fileSize;
- permite path traversal;
- registra binarios en logs;
- registra binarios en auditoría;
- crea endpoints públicos;
- documenta endpoints públicos en OpenAPI;
- permite acceso PlatformAdmin automático al contenido de tenants;
- usa storage local como configuración productiva por defecto;
- omite auditoría de operaciones críticas.
```

---

## 33. Resultado esperado

Al finalizar la implementación de `016-secure-document-storage`, RESIDENT Core tendrá una capa transversal segura para documentos y archivos.

Resultado esperado:

```text id="a0wz45"
- documentos tenant-scoped;
- archivos físicos controlados;
- versiones simples;
- metadata estandarizada;
- categorías y sensibilidad;
- visibilidad controlada;
- source module awareness;
- source resource validation;
- owner/resource authorization;
- storage provider abstraction;
- local storage dev;
- S3-compatible readiness;
- storageKey protegido;
- upload seguro;
- download seguro;
- SHA-256 hash;
- file validation;
- access logs;
- audit logs;
- observabilidad segura;
- endpoints administrativos;
- endpoints /me controlados;
- endpoints platform de configuración;
- OpenAPI seguro;
- no exposición pública.
```

El módulo quedará preparado para futuras specs de:

```text id="bm4vq7"
document retention policy
antivirus and malware scanning
public document publishing
QR document verification
electronic signatures
external timestamping
document full-text search
document AI classification
document legal hold
document encryption per tenant
document lifecycle automation
```
