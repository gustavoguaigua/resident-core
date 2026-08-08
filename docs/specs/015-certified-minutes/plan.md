# Plan — Spec 015 Certified Minutes

## 1. Información del documento

| Campo           | Valor                                                                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Proyecto        | RESIDENT Core                                                                                                                                                |
| Spec ID         | 015                                                                                                                                                          |
| Módulo          | Certified Minutes                                                                                                                                            |
| Documento       | Plan técnico                                                                                                                                                 |
| Ruta            | `docs/specs/015-certified-minutes/plan.md`                                                                                                                   |
| Versión         | 0.1                                                                                                                                                          |
| Estado          | Borrador inicial                                                                                                                                             |
| Fecha           | 2026-07-21                                                                                                                                                   |
| Documento base  | `docs/specs/015-certified-minutes/spec.md`                                                                                                                   |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `007-audit`, `012-communications-notifications`, `013-meetings-attendance`, `014-voting-basic` |
| Relacionado con | storage seguro, generación PDF, auditoría, futuras firmas electrónicas, sellado de tiempo, verificación documental y flujos legales                          |

---

## 2. Propósito

Este documento define el plan técnico para implementar el módulo `015-certified-minutes`.

El módulo permitirá formalizar internamente actas de reuniones y asambleas dentro de RESIDENT Core, incorporando versionado, revisión, aprobación, sellado interno mediante hash, generación de PDF, publicación controlada, adjuntos, acceso autorizado, auditoría y preparación para firma electrónica futura.

Regla central:

```text id="p9rx9t"
El módulo Certified Minutes debe permitir actas formales internas tenant-scoped, meeting-bound, version-controlled, approval-aware, seal-hash-enabled, artifact-aware, publication-controlled, audience-protected, audit-heavy y sin exposición pública.
```

---

## 3. Decisión técnica inicial

### 3.1. Nombre técnico del módulo

```text id="r1gdrz"
certified-minutes
```

---

### 3.2. Ruta sugerida

```text id="cgq1y7"
apps/api/src/modules/certified-minutes/
```

---

### 3.3. Tipo de módulo

```text id="ten9ji"
Tenant-scoped
Meeting-bound
Version-controlled
Approval-aware
Seal-hash-enabled
Artifact-aware
Storage-backed
Publication-controlled
Audience-protected
Own-resource protected
Audit-heavy
Notification-ready
Future-signature-ready
No-public-endpoints
```

---

### 3.4. Estilo arquitectónico

El módulo seguirá el estilo definido para RESIDENT Core:

```text id="zi1pbw"
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
storage seguro para artefactos y adjuntos
auditoría obligatoria
observabilidad segura
```

---

### 3.5. Decisión MVP

Para MVP se implementará:

```text id="dpk03x"
- actas certificadas internas vinculadas a reuniones;
- importación desde MeetingMinutes;
- secciones estructuradas;
- versiones incrementales;
- revisión;
- solicitud de cambios;
- aprobación administrativa;
- sellado interno con hash;
- algoritmo inicial SHA-256;
- generación de PDF formal interno;
- registro de artefactos generados;
- adjuntos con validación básica;
- publicación a audiencia autorizada;
- consulta administrativa;
- consulta propia de actas publicadas;
- descarga segura de PDF publicado;
- revocación de publicación;
- archivo lógico;
- eventos para notificaciones;
- auditoría completa;
- sin endpoints públicos;
- sin firma electrónica legal;
- sin sellado externo;
- sin certificación notarial;
- sin IA con datos reales;
- sin ejecución automática de resoluciones, cargos o multas.
```

---

## 4. Decisiones fuera de alcance

No implementar en esta spec:

```text id="lcq9o0"
- firma electrónica legalmente válida;
- firma electrónica avanzada;
- firma electrónica cualificada;
- proveedor externo de firma;
- sellado de tiempo certificado por tercero;
- certificación notarial;
- validación legal automática;
- verificación pública externa;
- blockchain;
- OCR de actas físicas;
- escaneo de firmas manuscritas;
- firma biométrica;
- reconocimiento de voz;
- transcripción automática;
- videograbación;
- IA con actas reales;
- generación automática de cargos;
- generación automática de multas;
- ejecución automática de resoluciones;
- flujo de impugnaciones legales;
- integración con entidades públicas;
- exposición pública de actas;
- publicación anónima o abierta en WordPress.
```

---

## 5. Dependencias funcionales

### 5.1. `001-tenants`

Uso:

```text id="yqu7ln"
- validar tenant activo;
- aplicar tenant_id;
- impedir cross-tenant;
- aplicar configuración del tenant;
- soportar numeración futura de actas por tenant;
- controlar publicación por audiencia del tenant.
```

---

### 5.2. `002-users-roles`

Uso:

```text id="zqqe1t"
- validar usuario autenticado;
- validar membership activa;
- validar roles;
- validar permisos;
- validar aprobadores;
- validar publicadores;
- validar acceso administrativo;
- validar acceso propio.
```

---

### 5.3. `003-residents-properties`

Uso:

```text id="ewz98z"
- resolver propietarios;
- resolver residentes;
- resolver unidades habitacionales;
- resolver audiencia own;
- validar acceso por unidad/persona;
- validar que un usuario final pertenece a la audiencia autorizada.
```

---

### 5.4. `007-audit`

Uso:

```text id="upja6a"
- auditar creación;
- auditar importación;
- auditar cambios;
- auditar versionado;
- auditar revisión;
- auditar aprobación;
- auditar rechazo;
- auditar sellado;
- auditar generación PDF;
- auditar publicación;
- auditar revocación;
- auditar descargas;
- auditar archivo;
- auditar accesos relevantes.
```

---

### 5.5. `012-communications-notifications`

Uso:

```text id="rn2m8w"
- notificar envío a revisión;
- notificar solicitud de cambios;
- notificar aprobación;
- notificar publicación;
- notificar revocación;
- mantener payload mínimo;
- no enviar acta completa en notificaciones;
- no enviar storageKey;
- no enviar URLs firmadas en eventos persistentes.
```

---

### 5.6. `013-meetings-attendance`

Uso:

```text id="cp2uls"
- validar reunión;
- importar MeetingMinutes;
- importar agenda;
- importar asistencia;
- importar quórum;
- vincular resoluciones;
- preservar snapshot de reunión;
- validar que todo pertenece al mismo tenant.
```

---

### 5.7. `014-voting-basic`

Uso:

```text id="v13aq8"
- vincular votaciones;
- importar resultados publicados;
- incluir tallies agregados;
- referenciar decisiones aprobadas;
- no recalcular votos;
- no exponer votos individuales;
- respetar privacyMode de votación.
```

---

## 6. Estructura de carpetas propuesta

```text id="h8olbd"
apps/api/src/modules/certified-minutes/
├── certified-minutes.module.ts
├── controllers/
│   ├── certified-minutes.controller.ts
│   ├── certified-minutes-versions.controller.ts
│   ├── certified-minutes-sections.controller.ts
│   ├── certified-minutes-approvals.controller.ts
│   ├── certified-minutes-attachments.controller.ts
│   ├── certified-minutes-artifacts.controller.ts
│   ├── certified-minutes-publications.controller.ts
│   └── my-certified-minutes.controller.ts
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
│   ├── pdf/
│   ├── hash/
│   ├── integrations/
│   └── audit/
│
├── dto/
├── policies/
├── guards/
├── mappers/
└── tests/
```

---

## 7. Componentes principales

### 7.1. Módulo NestJS

```text id="entln5"
CertifiedMinutesModule
```

Responsabilidades:

* registrar controladores;
* registrar servicios;
* registrar repositorios;
* registrar puertos;
* integrar storage;
* integrar PDF generator;
* integrar hash/canonicalization;
* integrar reuniones;
* integrar votaciones;
* integrar auditoría;
* integrar notificaciones;
* exponer API REST;
* aplicar guards y policies.

---

### 7.2. Controladores

```text id="pjvkqb"
CertifiedMinutesController
CertifiedMinutesVersionsController
CertifiedMinutesSectionsController
CertifiedMinutesApprovalsController
CertifiedMinutesAttachmentsController
CertifiedMinutesArtifactsController
CertifiedMinutesPublicationsController
MyCertifiedMinutesController
```

---

### 7.3. Servicios de aplicación

```text id="dml2xt"
CertifiedMinutesService
CertifiedMinutesStateMachineService
CertifiedMinutesImportService
CertifiedMinutesVersionService
CertifiedMinutesSectionService
CertifiedMinutesApprovalService
CertifiedMinutesSealService
CertifiedMinutesCanonicalizationService
CertifiedMinutesPdfService
CertifiedMinutesArtifactService
CertifiedMinutesAttachmentService
CertifiedMinutesPublicationService
CertifiedMinutesAudienceService
CertifiedMinutesAccessService
CertifiedMinutesNotificationService
CertifiedMinutesAuditService
CertifiedMinutesContentSanitizerService
```

---

### 7.4. Entidades de dominio

```text id="sm8ihz"
CertifiedMinutes
CertifiedMinutesVersion
CertifiedMinutesSection
CertifiedMinutesApproval
CertifiedMinutesAttachment
CertifiedMinutesArtifact
CertifiedMinutesPublication
CertifiedMinutesAccessLog
```

---

### 7.5. Value Objects

```text id="gw9a2j"
CertifiedMinutesTitle
CertifiedMinutesCode
CertifiedMinutesStatus
CertifiedMinutesVisibility
CertificationMode
MinutesVersionNumber
MinutesSectionContent
MinutesSectionOrder
MinutesApprovalDecision
MinutesSealHash
MinutesHashAlgorithm
MinutesArtifactHash
MinutesStorageKey
MinutesAudienceRule
MinutesPublicationWindow
```

---

### 7.6. Puertos de aplicación

```text id="a3sx6z"
CertifiedMinutesRepositoryPort
CertifiedMinutesVersionRepositoryPort
CertifiedMinutesSectionRepositoryPort
CertifiedMinutesApprovalRepositoryPort
CertifiedMinutesAttachmentRepositoryPort
CertifiedMinutesArtifactRepositoryPort
CertifiedMinutesPublicationRepositoryPort
CertifiedMinutesAccessLogRepositoryPort

CertifiedMinutesMeetingPort
CertifiedMinutesMeetingMinutesPort
CertifiedMinutesAttendancePort
CertifiedMinutesQuorumPort
CertifiedMinutesResolutionPort
CertifiedMinutesVotingPort
CertifiedMinutesUserDirectoryPort
CertifiedMinutesPersonDirectoryPort
CertifiedMinutesPropertyUnitPort
CertifiedMinutesRoleDirectoryPort
CertifiedMinutesStoragePort
CertifiedMinutesPdfGeneratorPort
CertifiedMinutesHashPort
CertifiedMinutesNotificationPort
CertifiedMinutesAuditPort
```

---

### 7.7. Repositorios Prisma

```text id="r7t9w7"
PrismaCertifiedMinutesRepository
PrismaCertifiedMinutesVersionRepository
PrismaCertifiedMinutesSectionRepository
PrismaCertifiedMinutesApprovalRepository
PrismaCertifiedMinutesAttachmentRepository
PrismaCertifiedMinutesArtifactRepository
PrismaCertifiedMinutesPublicationRepository
PrismaCertifiedMinutesAccessLogRepository
```

---

## 8. Modelo de datos previsto

### 8.1. Tablas nuevas MVP

```text id="d0ksna"
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

### 8.2. Tablas externas relacionadas

```text id="kmtauf"
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

---

### 8.3. Regla multitenant

Todas las tablas nuevas deben incluir:

```text id="nu35v5"
tenant_id
```

Regla obligatoria:

```text id="exuvqh"
Toda consulta debe filtrar por tenant_id.
```

Patrón requerido:

```typescript id="ymqzzg"
await prisma.certifiedMinutes.findFirst({
  where: {
    id: certifiedMinutesId,
    tenantId: currentTenant.id,
    archivedAt: null
  }
});
```

Patrón prohibido:

```typescript id="t0fir0"
await prisma.certifiedMinutes.findUnique({
  where: { id: certifiedMinutesId }
});
```

---

## 9. Diseño de estados

### 9.1. CertifiedMinutes

Estados:

```text id="s1akos"
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

Transiciones principales:

```text id="q9pn21"
draft -> underReview
underReview -> changesRequested
changesRequested -> draft
underReview -> approved
approved -> sealed
sealed -> published
published -> superseded
published -> archived
superseded -> archived
draft -> cancelled
underReview -> cancelled
changesRequested -> cancelled
cancelled -> archived
```

Transiciones prohibidas:

```text id="dbwtmw"
published -> draft
sealed -> draft
approved -> draft sin nueva versión
archived -> published
cancelled -> published
published -> underReview sin nueva versión
```

---

### 9.2. CertifiedMinutesVersion

Estados:

```text id="ujc29q"
draft
underReview
approved
sealed
superseded
archived
```

Transiciones:

```text id="ztte8e"
draft -> underReview
underReview -> approved
underReview -> draft
approved -> sealed
sealed -> superseded
superseded -> archived
draft -> archived
```

---

### 9.3. CertifiedMinutesArtifact

Estados:

```text id="yh5r8a"
pending
generated
failed
archived
```

Transiciones:

```text id="unx1aj"
pending -> generated
pending -> failed
generated -> archived
failed -> archived
```

---

### 9.4. CertifiedMinutesPublication

Estados:

```text id="cwrjwt"
draft
published
expired
revoked
archived
```

Transiciones:

```text id="hhl0xi"
draft -> published
published -> expired
published -> revoked
published -> archived
revoked -> archived
expired -> archived
```

---

## 10. Estrategia de versionado

### 10.1. Regla general

Todo cambio relevante de contenido debe quedar asociado a una versión.

```text id="wv3m28"
versionNumber = previousVersionNumber + 1
```

---

### 10.2. Estados editables

Se puede editar contenido en:

```text id="jyigaf"
CertifiedMinutes.status = draft
CertifiedMinutes.status = changesRequested
CertifiedMinutesVersion.status = draft
```

---

### 10.3. Estados no editables

No se puede editar contenido directamente en:

```text id="z6dm2d"
approved
sealed
published
superseded
cancelled
archived
```

---

### 10.4. Correcciones posteriores

Si una acta está aprobada, sellada o publicada:

```text id="i2y8ig"
se debe crear una nueva versión
o marcar la versión anterior como superseded
o revocar publicación y publicar una versión corregida según política.
```

---

## 11. Estrategia de sellado interno

### 11.1. Algoritmo MVP

```text id="u6v8bz"
SHA-256
```

---

### 11.2. Contenido canonicalizado

El hash debe calcularse sobre una representación canonicalizada que incluya:

```text id="t2h63i"
tenantId
certifiedMinutesId
meetingId
versionNumber
title
sections ordenadas
snapshots incluidos
referencias relevantes
fecha de aprobación
algoritmo
```

---

### 11.3. Prohibiciones

El sellado interno no debe presentarse como:

```text id="hc7qfo"
firma electrónica legal
certificación notarial
sellado de tiempo externo
verificación pública universal
prueba legal automática
```

---

### 11.4. Resultado esperado

Al sellar:

```text id="autnv8"
- se calcula sealHash;
- se registra sealAlgorithm;
- se registra sealedAt;
- se registra sealedBy;
- se bloquea versión sellada;
- se audita certifiedMinutes.sealed;
- se permite generación de PDF formal.
```

---

## 12. Estrategia de PDF y artefactos

### 12.1. Generación PDF

Para MVP se generará PDF desde versión aprobada o sellada.

Regla:

```text id="awhfwb"
No se debe generar PDF formal desde una versión draft.
```

Se puede permitir PDF de borrador solo si:

```text id="dd5b7o"
artifactType = draftPdf
marca de agua = BORRADOR
no se puede publicar como acta formal
```

---

### 12.2. Artefactos

Artefactos previstos:

```text id="a32oma"
pdf
htmlSnapshot
jsonSnapshot
hashManifest
```

---

### 12.3. Almacenamiento

Los artefactos deben guardarse mediante `CertifiedMinutesStoragePort`.

El API no debe exponer:

```text id="qlfrsi"
storageKey interno
bucket
path físico
credenciales
URL permanente
URL firmada persistente
```

---

### 12.4. Descarga

La descarga debe usar:

```text id="vvrz0x"
streaming seguro
o URL temporal corta generada bajo autorización
```

Toda descarga debe auditarse.

---

## 13. Estrategia de adjuntos

### 13.1. Tipos permitidos MVP

```text id="m514qt"
pdf
image/png
image/jpeg
application/vnd.openxmlformats-officedocument.wordprocessingml.document
application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

---

### 13.2. Validaciones

Todo adjunto debe validar:

```text id="v22mbj"
tenant
certifiedMinutesId
versionId si aplica
fileName seguro
mimeType permitido
fileSize máximo
hash
storageKey seguro
permisos
antivirus si se incorpora en infraestructura
```

---

### 13.3. Reglas

```text id="hx09xn"
- no eliminación física ordinaria;
- archivo lógico con archivedAt;
- no exponer storageKey;
- no publicar adjuntos automáticamente;
- descarga requiere autorización.
```

---

## 14. Estrategia de publicación

### 14.1. Publicación controlada

Solo se publica un acta sellada.

Regla:

```text id="mddweh"
CertifiedMinutes.status = sealed
```

o:

```text id="eqxcm6"
CertifiedMinutesVersion.status = sealed
```

---

### 14.2. Audiencias MVP

```text id="vh7xpc"
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

### 14.3. Own-resource access

El acceso `/me` se resuelve con:

```text id="rjla3c"
actorUserId
actorPersonIds
actorPropertyUnitIds
actorRoleIds
meetingParticipant relation
publication audienceRules
```

---

### 14.4. Revocación

Revocar publicación:

```text id="od4jz7"
- no elimina acta;
- no elimina artefactos;
- no elimina auditoría;
- cambia publication.status a revoked;
- requiere razón;
- audita certifiedMinutes.publicationRevoked.
```

---

## 15. API prevista

### 15.1. Certified Minutes administrativas

```text id="ybmrz5"
GET    /api/v1/tenant/certified-minutes
POST   /api/v1/tenant/certified-minutes
GET    /api/v1/tenant/certified-minutes/{certifiedMinutesId}
PATCH  /api/v1/tenant/certified-minutes/{certifiedMinutesId}
POST   /api/v1/tenant/certified-minutes/{certifiedMinutesId}/import-from-meeting-minutes
POST   /api/v1/tenant/certified-minutes/{certifiedMinutesId}/submit-review
POST   /api/v1/tenant/certified-minutes/{certifiedMinutesId}/approve
POST   /api/v1/tenant/certified-minutes/{certifiedMinutesId}/reject
POST   /api/v1/tenant/certified-minutes/{certifiedMinutesId}/request-changes
POST   /api/v1/tenant/certified-minutes/{certifiedMinutesId}/seal
POST   /api/v1/tenant/certified-minutes/{certifiedMinutesId}/publish
POST   /api/v1/tenant/certified-minutes/{certifiedMinutesId}/revoke-publication
POST   /api/v1/tenant/certified-minutes/{certifiedMinutesId}/archive
```

---

### 15.2. Versions

```text id="s6wi8e"
GET    /api/v1/tenant/certified-minutes/{certifiedMinutesId}/versions
POST   /api/v1/tenant/certified-minutes/{certifiedMinutesId}/versions
GET    /api/v1/tenant/certified-minutes-versions/{versionId}
POST   /api/v1/tenant/certified-minutes-versions/{versionId}/archive
GET    /api/v1/tenant/certified-minutes/{certifiedMinutesId}/versions/compare
```

---

### 15.3. Sections

```text id="hq1266"
GET    /api/v1/tenant/certified-minutes/{certifiedMinutesId}/sections
POST   /api/v1/tenant/certified-minutes/{certifiedMinutesId}/sections
GET    /api/v1/tenant/certified-minutes-sections/{sectionId}
PATCH  /api/v1/tenant/certified-minutes-sections/{sectionId}
POST   /api/v1/tenant/certified-minutes/{certifiedMinutesId}/sections/reorder
POST   /api/v1/tenant/certified-minutes-sections/{sectionId}/archive
```

---

### 15.4. Approvals

```text id="nd4sln"
GET    /api/v1/tenant/certified-minutes/{certifiedMinutesId}/approvals
POST   /api/v1/tenant/certified-minutes/{certifiedMinutesId}/approvals
GET    /api/v1/tenant/certified-minutes-approvals/{approvalId}
```

---

### 15.5. Attachments

```text id="uspyix"
GET    /api/v1/tenant/certified-minutes/{certifiedMinutesId}/attachments
POST   /api/v1/tenant/certified-minutes/{certifiedMinutesId}/attachments
GET    /api/v1/tenant/certified-minutes-attachments/{attachmentId}
GET    /api/v1/tenant/certified-minutes-attachments/{attachmentId}/download
POST   /api/v1/tenant/certified-minutes-attachments/{attachmentId}/archive
```

---

### 15.6. Artifacts

```text id="kwoz4s"
GET    /api/v1/tenant/certified-minutes/{certifiedMinutesId}/artifacts
POST   /api/v1/tenant/certified-minutes/{certifiedMinutesId}/artifacts/generate-pdf
GET    /api/v1/tenant/certified-minutes-artifacts/{artifactId}
GET    /api/v1/tenant/certified-minutes-artifacts/{artifactId}/download
POST   /api/v1/tenant/certified-minutes-artifacts/{artifactId}/archive
```

---

### 15.7. Publications

```text id="irvwto"
GET    /api/v1/tenant/certified-minutes/{certifiedMinutesId}/publications
GET    /api/v1/tenant/certified-minutes-publications/{publicationId}
POST   /api/v1/tenant/certified-minutes-publications/{publicationId}/revoke
POST   /api/v1/tenant/certified-minutes-publications/{publicationId}/archive
```

---

### 15.8. Endpoints `/me`

```text id="h26scb"
GET    /api/v1/me/certified-minutes
GET    /api/v1/me/certified-minutes/{certifiedMinutesId}
GET    /api/v1/me/certified-minutes/{certifiedMinutesId}/artifacts
GET    /api/v1/me/certified-minutes-artifacts/{artifactId}/download
```

---

### 15.9. Endpoints públicos

No crear endpoints públicos.

Prohibido:

```text id="fl9ejy"
GET /api/v1/public/tenants/{slug}/certified-minutes
GET /api/v1/public/tenants/{slug}/certified-minutes/{certifiedMinutesId}
GET /api/v1/public/tenants/{slug}/certified-minutes/{certifiedMinutesId}/download
GET /api/v1/public/tenants/{slug}/certified-minutes-artifacts/{artifactId}/download
```

---

## 16. DTOs previstos

### 16.1. Certified Minutes

```text id="oqmh13"
CreateCertifiedMinutesDto
UpdateCertifiedMinutesDto
ImportFromMeetingMinutesDto
SubmitCertifiedMinutesReviewDto
ApproveCertifiedMinutesDto
RejectCertifiedMinutesDto
RequestCertifiedMinutesChangesDto
SealCertifiedMinutesDto
PublishCertifiedMinutesDto
RevokeCertifiedMinutesPublicationDto
ArchiveCertifiedMinutesDto
CertifiedMinutesAdminDto
CertifiedMinutesListItemDto
```

---

### 16.2. Versions

```text id="zr49sf"
CreateCertifiedMinutesVersionDto
CertifiedMinutesVersionDto
CertifiedMinutesVersionListItemDto
CompareCertifiedMinutesVersionsDto
CertifiedMinutesVersionDiffDto
ArchiveCertifiedMinutesVersionDto
```

---

### 16.3. Sections

```text id="ywkwse"
CreateCertifiedMinutesSectionDto
UpdateCertifiedMinutesSectionDto
ReorderCertifiedMinutesSectionsDto
CertifiedMinutesSectionDto
CertifiedMinutesSectionListItemDto
ArchiveCertifiedMinutesSectionDto
```

---

### 16.4. Approvals

```text id="jd38nj"
CreateCertifiedMinutesApprovalDto
CertifiedMinutesApprovalDto
CertifiedMinutesApprovalListItemDto
```

---

### 16.5. Attachments

```text id="hbmiup"
UploadCertifiedMinutesAttachmentDto
CertifiedMinutesAttachmentDto
CertifiedMinutesAttachmentListItemDto
ArchiveCertifiedMinutesAttachmentDto
```

---

### 16.6. Artifacts

```text id="bc03j9"
GenerateCertifiedMinutesPdfDto
CertifiedMinutesArtifactDto
CertifiedMinutesArtifactListItemDto
DownloadCertifiedMinutesArtifactDto
ArchiveCertifiedMinutesArtifactDto
```

---

### 16.7. Publications

```text id="flbvsa"
CertifiedMinutesPublicationDto
CertifiedMinutesPublicationListItemDto
RevokeCertifiedMinutesPublicationDto
ArchiveCertifiedMinutesPublicationDto
```

---

### 16.8. `/me`

```text id="lssq2o"
OwnCertifiedMinutesDto
OwnCertifiedMinutesListItemDto
OwnCertifiedMinutesArtifactDto
OwnCertifiedMinutesDownloadDto
```

---

## 17. Permisos requeridos

### 17.1. Actas certificadas

```text id="l06io6"
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

### 17.2. Versiones

```text id="bkn95w"
certifiedMinutesVersions.create
certifiedMinutesVersions.read
certifiedMinutesVersions.compare
certifiedMinutesVersions.archive
```

---

### 17.3. Secciones

```text id="hpnnph"
certifiedMinutesSections.create
certifiedMinutesSections.read
certifiedMinutesSections.update
certifiedMinutesSections.reorder
certifiedMinutesSections.archive
```

---

### 17.4. Aprobaciones

```text id="qwhrws"
certifiedMinutesApprovals.create
certifiedMinutesApprovals.read
```

---

### 17.5. Adjuntos

```text id="upkpa2"
certifiedMinutesAttachments.create
certifiedMinutesAttachments.read
certifiedMinutesAttachments.download
certifiedMinutesAttachments.archive
```

---

### 17.6. Artefactos

```text id="v1anhz"
certifiedMinutesArtifacts.generate
certifiedMinutesArtifacts.read
certifiedMinutesArtifacts.download
certifiedMinutesArtifacts.archive
```

---

### 17.7. Publicaciones

```text id="pkblgx"
certifiedMinutesPublications.read
certifiedMinutesPublications.revoke
certifiedMinutesPublications.archive
```

---

### 17.8. Acceso propio

```text id="a5jcrx"
certifiedMinutes.read.own
certifiedMinutesArtifacts.download.own
```

---

### 17.9. Auditoría

```text id="w35ycq"
certifiedMinutes.audit.read
```

---

## 18. Guards y Policies

### 18.1. Guards propuestos

```text id="lgisgj"
CertifiedMinutesPermissionGuard
CertifiedMinutesTenantGuard
CertifiedMinutesStateGuard
CertifiedMinutesAudienceGuard
OwnCertifiedMinutesGuard
CertifiedMinutesArtifactGuard
CertifiedMinutesAttachmentGuard
CertifiedMinutesPublicationGuard
```

---

### 18.2. Policies propuestas

```text id="i3j6br"
CertifiedMinutesTenantPolicy
CertifiedMinutesMeetingPolicy
CertifiedMinutesVersionPolicy
CertifiedMinutesStatePolicy
CertifiedMinutesApprovalPolicy
CertifiedMinutesSealPolicy
CertifiedMinutesPublicationPolicy
CertifiedMinutesAudiencePolicy
CertifiedMinutesArtifactPolicy
CertifiedMinutesAttachmentPolicy
CertifiedMinutesDownloadPolicy
CertifiedMinutesNoAutomaticExecutionPolicy
CertifiedMinutesPrivacyPolicy
CertifiedMinutesStoragePolicy
```

---

## 19. Seguridad y privacidad

### 19.1. Reglas obligatorias

```text id="j4sprt"
- no aceptar tenantId desde body;
- no buscar recursos solo por id;
- no permitir actas cross-tenant;
- no permitir meetingId de otro tenant;
- no permitir sourceMeetingMinutesId de otro tenant;
- no permitir versionId de otro tenant;
- no permitir sectionId de otro tenant;
- no permitir attachmentId de otro tenant;
- no permitir artifactId de otro tenant;
- no permitir publicationId de otro tenant;
- no permitir votingResultId de otro tenant;
- no permitir meetingResolutionId de otro tenant;
- no permitir edición de versión sellada;
- no permitir publicación sin sellado;
- no permitir descarga sin audiencia;
- no exponer storageKey;
- no exponer URL firmada persistente;
- no registrar contenido completo en logs;
- no registrar contenido completo en auditoría;
- no crear endpoints públicos;
- no ejecutar acciones automáticas desde actas.
```

---

### 19.2. Protección de contenido

Deben sanitizarse:

```text id="yfa8ow"
title
summary
section.title
section.body
comments
changeReason
publication notes
attachment metadata
```

Bloquear:

```text id="b5ybm9"
<script>
<iframe>
<object>
<embed>
event handlers inline
javascript:
data URLs peligrosas
HTML no sanitizado
CSS peligroso
payloads arbitrarios
```

---

### 19.3. Protección de storage

No devolver al cliente:

```text id="j03bo9"
storageKey
bucket
path interno
provider metadata sensible
credenciales
URL firmada persistente
hash completo si se considera sensible por política
```

Permitido:

```text id="brvb6k"
artifactId
fileName
mimeType
fileSize
artifactHashPrefix
generatedAt
download endpoint controlado
```

---

## 20. Integración con storage

### 20.1. Puerto

```text id="kz5x4y"
CertifiedMinutesStoragePort
```

Responsabilidades:

```text id="wqwk1h"
upload(file)
downloadStream(storageKey)
createTemporaryDownloadUrl(storageKey, ttl)
getMetadata(storageKey)
archive(storageKey)
calculateFileHash(file)
```

---

### 20.2. Implementación inicial

Para MVP, la implementación puede usar:

```text id="gczcg2"
S3-compatible storage
local storage en desarrollo
adapter mock en tests
```

---

### 20.3. Reglas

```text id="gt92ax"
- storageKey nunca se expone al cliente;
- descargas pasan por autorización;
- URLs temporales tienen TTL corto;
- archivos se asocian a tenant;
- archivos tienen hash;
- archivos se archivan lógicamente.
```

---

## 21. Integración con PDF

### 21.1. Puerto

```text id="wm7w5x"
CertifiedMinutesPdfGeneratorPort
```

Responsabilidades:

```text id="spc8ft"
renderHtmlFromVersion(version)
generatePdf(html)
applyDraftWatermark(pdf)
includeIntegrityMetadata(pdf)
includeSealHashReference(pdf)
returnPdfBuffer()
```

---

### 21.2. Reglas de PDF

```text id="sn4zjc"
- PDF formal solo desde versión aprobada o sellada;
- PDF de borrador debe incluir marca de agua;
- PDF debe incluir código de acta;
- PDF debe incluir versión;
- PDF debe incluir fecha de generación;
- PDF puede incluir hash visible o referencia de integridad;
- PDF no debe incluir datos no autorizados;
- PDF generado debe tener hash propio.
```

---

## 22. Integración con hash/canonicalization

### 22.1. Servicio

```text id="qhkp7k"
CertifiedMinutesCanonicalizationService
CertifiedMinutesSealService
```

---

### 22.2. Canonicalización

El contenido debe normalizar:

```text id="d5n6du"
orden de secciones
saltos de línea
espacios redundantes
campos opcionales null
formato de fechas
orden de metadata segura
codificación UTF-8
```

---

### 22.3. Hash

MVP:

```text id="s5devy"
SHA-256
```

Futuro:

```text id="terzzg"
SHA-512
external timestamping
signature digest
hash manifest
public verification
```

---

## 23. Integración con notificaciones

### 23.1. Eventos sugeridos

```text id="ia2919"
certifiedMinutes.submittedForReview
certifiedMinutes.changesRequested
certifiedMinutes.approved
certifiedMinutes.sealed
certifiedMinutes.published
certifiedMinutes.publicationRevoked
```

---

### 23.2. Payload mínimo

```json id="ug1m7c"
{
  "tenantId": "tenant_uuid",
  "sourceType": "certifiedMinutes",
  "sourceId": "certified_minutes_uuid",
  "eventType": "certifiedMinutes.published",
  "title": "Acta de Asamblea Ordinaria 2026",
  "actionUrl": "/certified-minutes/certified_minutes_uuid",
  "audience": {
    "type": "owners"
  },
  "traceId": "req_123456"
}
```

---

### 23.3. Payload prohibido

```text id="ke4rqr"
contenido completo del acta
secciones completas
adjuntos
storageKey
URL firmada
hash completo si política lo restringe
datos personales innecesarios
tokens
secretos
```

---

## 24. Auditoría

### 24.1. Eventos mínimos

```text id="x31fol"
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

### 24.2. Metadata permitida

```text id="y33s2a"
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

---

### 24.3. Metadata prohibida

```text id="kgex6j"
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

## 25. Observabilidad

### 25.1. Logs sugeridos

```text id="kst795"
certifiedMinutes.created
certifiedMinutes.submittedForReview
certifiedMinutes.approved
certifiedMinutes.sealed
certifiedMinutes.published
certifiedMinutes.publicationRevoked
certifiedMinutes.archived
certifiedMinutesArtifact.generated
certifiedMinutesArtifact.downloaded
```

---

### 25.2. Métricas sugeridas

```text id="bsw599"
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

### 25.3. Labels permitidos

```text id="dxyphi"
status
visibility
certificationMode
artifactType
publicationStatus
accessType
outcome
```

---

### 25.4. Labels prohibidos

```text id="kklylr"
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

## 26. OpenAPI

### 26.1. Tags sugeridos

```text id="v9cm3e"
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

### 26.2. Extensiones OpenAPI sugeridas

Para endpoints tenant:

```yaml id="c3vp6v"
x-tenant-scope: true
x-auth-required: true
x-required-permission: certifiedMinutes.create
x-audit-event: certifiedMinutes.created
```

Para endpoints `/me`:

```yaml id="k64gle"
x-tenant-scope: true
x-auth-required: true
x-own-resource: true
x-required-permission: certifiedMinutes.read.own
```

Para descargas:

```yaml id="z7bb29"
x-secure-download: true
x-storage-key-exposed: false
x-audit-event: certifiedMinutesArtifact.downloaded
```

Para sellado:

```yaml id="lneduw"
x-integrity-seal: true
x-hash-algorithm: SHA-256
x-legal-signature: false
```

Para publicación:

```yaml id="ug2bwc"
x-publication-controlled: true
x-public-exposure: false
x-audience-required: true
```

---

### 26.3. OpenAPI no debe documentar

```text id="m7q02y"
GET /api/v1/public/tenants/{slug}/certified-minutes
GET /api/v1/public/tenants/{slug}/certified-minutes/{certifiedMinutesId}
GET /api/v1/public/tenants/{slug}/certified-minutes/{certifiedMinutesId}/download
GET /api/v1/public/tenants/{slug}/certified-minutes-artifacts/{artifactId}/download
```

---

## 27. Estrategia de implementación

### 27.1. Orden recomendado

```text id="f0yk1c"
1. Crear estructura base del módulo.
2. Implementar enums y value objects.
3. Implementar entidades de dominio.
4. Implementar canonicalization y hash service.
5. Crear modelo Prisma y migraciones.
6. Implementar repositorios.
7. Implementar integración con Meetings.
8. Implementar creación e importación desde MeetingMinutes.
9. Implementar secciones.
10. Implementar versiones.
11. Implementar revisión y aprobación.
12. Implementar sellado interno.
13. Implementar generación PDF.
14. Implementar storage de artefactos y adjuntos.
15. Implementar publicación.
16. Implementar endpoints administrativos.
17. Implementar endpoints /me.
18. Implementar auditoría.
19. Implementar notificaciones.
20. Implementar observabilidad.
21. Implementar OpenAPI.
22. Implementar pruebas.
23. Ejecutar hardening.
```

---

### 27.2. PRs sugeridos

```text id="mpg4c8"
PR-015-01 — Module skeleton, enums and value objects.
PR-015-02 — Domain entities and state machines.
PR-015-03 — Canonicalization, hash and integrity seal.
PR-015-04 — Prisma schema, migration and repositories.
PR-015-05 — Meeting import and section management.
PR-015-06 — Versioning and approval workflow.
PR-015-07 — PDF artifacts and storage integration.
PR-015-08 — Publication and audience authorization.
PR-015-09 — My Certified Minutes endpoints.
PR-015-10 — Audit, notifications and observability.
PR-015-11 — OpenAPI, tests and security hardening.
```

---

## 28. Testing plan resumido

### 28.1. Unit tests

```text id="mqhlzb"
CertifiedMinutes entity
CertifiedMinutesVersion entity
CertifiedMinutesSection entity
CertifiedMinutesApproval entity
CertifiedMinutesAttachment entity
CertifiedMinutesArtifact entity
CertifiedMinutesPublication entity
CertifiedMinutesAccessLog entity
CertifiedMinutesStateMachine
CertifiedMinutesVersionPolicy
CertifiedMinutesSealService
CertifiedMinutesCanonicalizationService
CertifiedMinutesAudiencePolicy
CertifiedMinutesPublicationPolicy
CertifiedMinutesStoragePolicy
CertifiedMinutesContentSanitizerService
```

---

### 28.2. Integration tests

```text id="xa4sg4"
PrismaCertifiedMinutesRepository
PrismaCertifiedMinutesVersionRepository
PrismaCertifiedMinutesSectionRepository
PrismaCertifiedMinutesApprovalRepository
PrismaCertifiedMinutesAttachmentRepository
PrismaCertifiedMinutesArtifactRepository
PrismaCertifiedMinutesPublicationRepository
PrismaCertifiedMinutesAccessLogRepository
CertifiedMinutesStorageAdapter
CertifiedMinutesPdfGeneratorAdapter
CertifiedMinutesMeetingAdapter
CertifiedMinutesVotingAdapter
```

---

### 28.3. API tests

```text id="xd9wzv"
Certified Minutes admin endpoints
Versions endpoints
Sections endpoints
Approvals endpoints
Attachments endpoints
Artifacts endpoints
Publications endpoints
My Certified Minutes endpoints
```

---

### 28.4. Security tests

```text id="czniab"
no public endpoints
no cross-tenant actas
no cross-tenant meetings
no cross-tenant versions
no cross-tenant sections
no cross-tenant attachments
no cross-tenant artifacts
no unauthorized download
no storageKey exposure
no sealed version modification
no publication without seal
no official PDF from draft
no content in logs
no automatic execution
OpenAPI no public routes
```

---

### 28.5. Integrity tests

```text id="vj2681"
same canonical content same hash
content change changes hash
section reorder changes canonical hash if order is material
sealed version immutable
PDF artifact hash calculated
downloaded artifact hash matches
sealHashPrefix exposed safely
full hash access restricted if policy requires
```

---

## 29. Performance objetivo

### 29.1. Objetivos MVP

```text id="s3vqfe"
p95 < 700 ms para listados paginados.
p95 < 1500 ms para consultar acta publicada.
p95 < 5000 ms para generar PDF de acta de hasta 30 páginas.
```

---

### 29.2. Reglas técnicas

```text id="y9lp74"
- paginación obligatoria;
- pageSize máximo 100;
- índices por tenant_id;
- índices por meeting_id;
- índices por status;
- índices por published_at;
- evitar N+1;
- no cargar contenido completo en listados;
- no cargar adjuntos completos en listados;
- no generar PDF en cada consulta;
- no recalcular hash en cada listado;
- descargar artefactos vía streaming.
```

---

## 30. Riesgos técnicos

| Riesgo                          | Impacto | Mitigación                                                 |
| ------------------------------- | ------: | ---------------------------------------------------------- |
| Acta cross-tenant               | Crítico | `tenant_id`, guards, repositorios tenant-scoped, tests     |
| Meeting cross-tenant            | Crítico | validación de reunión por tenant                           |
| Edición de versión sellada      | Crítico | state machine + version policy                             |
| Hash inconsistente              |    Alto | canonicalization service + tests                           |
| Publicación sin audiencia       |    Alto | publication policy                                         |
| Descarga no autorizada          |    Alto | audience guard + artifact guard                            |
| Exposición de `storageKey`      |    Alto | DTO seguro + tests                                         |
| Logs con contenido completo     |    Alto | log sanitizer                                              |
| PDF formal desde draft          |   Medio | artifact policy + watermark                                |
| Adjuntos maliciosos             |    Alto | mime/type/size/hash validation                             |
| Presentar hash como firma legal |    Alto | disclaimers y naming controlado                            |
| Ejecución automática indebida   | Crítico | no automatic execution policy                              |
| Omisión de auditoría            |    Alto | audit tests + CI gate                                      |
| Performance en PDF              |   Medio | generación asíncrona futura, streaming, caching controlado |

---

## 31. Seeds y datos demo

Crear seeds ficticios para:

```text id="epzodk"
certifiedMinutesDraftA
certifiedMinutesUnderReviewA
certifiedMinutesChangesRequestedA
certifiedMinutesApprovedA
certifiedMinutesSealedA
certifiedMinutesPublishedA
certifiedMinutesCancelledA
certifiedMinutesArchivedA
certifiedMinutesTenantB

certifiedMinutesVersion1A
certifiedMinutesVersion2A
certifiedMinutesVersionSealedA
certifiedMinutesVersionTenantB

sectionHeaderA
sectionMeetingInfoA
sectionAttendanceA
sectionQuorumA
sectionAgendaA
sectionVotingA
sectionResolutionsA
sectionClosureA

approvalApprovedA
approvalChangesRequestedA
approvalRejectedA

attachmentAttendanceSheetA
attachmentVotingReportA
attachmentSupportPdfA

artifactPdfGeneratedA
artifactHashManifestA

publicationOwnersA
publicationResidentsA
publicationBoardA
publicationRevokedA
```

Prohibido en seeds:

```text id="v2quhk"
nombres reales
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
secretos
datos financieros reales
datos sancionatorios reales
```

---

## 32. Configuración inicial

### 32.1. Feature flags recomendadas

```text id="lepvdi"
certifiedMinutes.enabled
certifiedMinutes.importFromMeetingMinutes.enabled
certifiedMinutes.versioning.enabled
certifiedMinutes.internalSeal.enabled
certifiedMinutes.pdfGeneration.enabled
certifiedMinutes.attachments.enabled
certifiedMinutes.publication.enabled
certifiedMinutes.ownAccess.enabled
certifiedMinutes.downloads.enabled
certifiedMinutes.externalSignature.enabled
certifiedMinutes.externalTimestamp.enabled
certifiedMinutes.aiAssistance.enabled
```

---

### 32.2. Defaults MVP

```text id="k2w9ea"
certifiedMinutes.enabled = true
certifiedMinutes.importFromMeetingMinutes.enabled = true
certifiedMinutes.versioning.enabled = true
certifiedMinutes.internalSeal.enabled = true
certifiedMinutes.pdfGeneration.enabled = true
certifiedMinutes.attachments.enabled = true
certifiedMinutes.publication.enabled = true
certifiedMinutes.ownAccess.enabled = true
certifiedMinutes.downloads.enabled = true
certifiedMinutes.externalSignature.enabled = false
certifiedMinutes.externalTimestamp.enabled = false
certifiedMinutes.aiAssistance.enabled = false
```

---

## 33. Errores esperados

Catálogo inicial:

```text id="coshvz"
CERTIFIED_MINUTES_NOT_FOUND
CERTIFIED_MINUTES_FORBIDDEN
CERTIFIED_MINUTES_INVALID_TRANSITION
CERTIFIED_MINUTES_NOT_EDITABLE
CERTIFIED_MINUTES_ALREADY_EXISTS_FOR_MEETING
CERTIFIED_MINUTES_CROSS_TENANT_REFERENCE
CERTIFIED_MINUTES_MEETING_REQUIRED
CERTIFIED_MINUTES_SOURCE_INVALID
CERTIFIED_MINUTES_CONTENT_INVALID
CERTIFIED_MINUTES_VERSION_NOT_FOUND
CERTIFIED_MINUTES_VERSION_NOT_EDITABLE
CERTIFIED_MINUTES_VERSION_ALREADY_SEALED
CERTIFIED_MINUTES_SECTION_NOT_FOUND
CERTIFIED_MINUTES_SECTION_INVALID
CERTIFIED_MINUTES_SECTION_ORDER_DUPLICATE
CERTIFIED_MINUTES_APPROVAL_NOT_FOUND
CERTIFIED_MINUTES_APPROVAL_INVALID
CERTIFIED_MINUTES_APPROVAL_REQUIRED
CERTIFIED_MINUTES_SEAL_REQUIRED
CERTIFIED_MINUTES_SEAL_INVALID
CERTIFIED_MINUTES_PUBLISH_AUDIENCE_REQUIRED
CERTIFIED_MINUTES_PUBLICATION_NOT_FOUND
CERTIFIED_MINUTES_PUBLICATION_REVOKED
CERTIFIED_MINUTES_ARTIFACT_NOT_FOUND
CERTIFIED_MINUTES_ARTIFACT_NOT_READY
CERTIFIED_MINUTES_ARTIFACT_DOWNLOAD_FORBIDDEN
CERTIFIED_MINUTES_ATTACHMENT_NOT_FOUND
CERTIFIED_MINUTES_ATTACHMENT_INVALID_TYPE
CERTIFIED_MINUTES_ATTACHMENT_TOO_LARGE
CERTIFIED_MINUTES_STORAGE_ERROR
CERTIFIED_MINUTES_PDF_GENERATION_FAILED
VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
RATE_LIMITED
INTERNAL_ERROR
```

---

## 34. Criterios de aceptación técnica

La implementación deberá cumplir:

```text id="e75x82"
- todas las tablas tienen tenant_id;
- toda consulta filtra por tenant_id;
- no se acepta tenantId en body;
- no existen endpoints públicos;
- OpenAPI no documenta endpoints públicos;
- meetingId se valida contra tenant;
- sourceMeetingMinutesId se valida contra tenant;
- versionId se valida contra tenant;
- sectionId se valida contra tenant;
- attachmentId se valida contra tenant;
- artifactId se valida contra tenant;
- publicationId se valida contra tenant;
- votingResultId se valida contra tenant;
- meetingResolutionId se valida contra tenant;
- se impide segunda acta activa principal por reunión;
- versiones selladas son inmutables;
- publicación requiere sellado previo;
- descarga requiere autorización;
- no se expone storageKey;
- PDF formal no se genera desde draft;
- hash es reproducible;
- cambio de contenido cambia hash;
- auditoría no incluye contenido completo;
- logs no incluyen contenido completo;
- métricas no incluyen IDs sensibles;
- no se ejecutan acciones automáticas;
- CI pasa.
```

---

## 35. Definition of Done

El módulo se considera listo cuando:

```text id="r619hc"
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
11. Servicios funcionan.
12. Hash/canonicalization funciona.
13. PDF generation funciona.
14. Storage adapter funciona.
15. Endpoints administrativos funcionan.
16. Endpoints `/me` funcionan.
17. No existen endpoints públicos.
18. Auditoría funciona.
19. Notificaciones por eventos funcionan.
20. OpenAPI está actualizado.
21. Tests unitarios pasan.
22. Tests de repositorio pasan.
23. Tests API pasan.
24. Tests de autorización pasan.
25. Tests own-resource pasan.
26. Tests multitenant pasan.
27. Tests de integridad pasan.
28. Tests de seguridad pasan.
29. Build pasa.
30. CI pasa.
```

---

## 36. No aceptación

No se acepta implementación si:

```text id="ydl9zu"
- permite actas cross-tenant;
- permite versiones cross-tenant;
- permite secciones cross-tenant;
- permite adjuntos cross-tenant;
- permite artefactos cross-tenant;
- permite publicaciones cross-tenant;
- permite usar meetingId de otro tenant;
- permite usar sourceMeetingMinutesId de otro tenant;
- permite usar votingResultId de otro tenant;
- permite usar meetingResolutionId de otro tenant;
- permite editar una versión sellada;
- permite publicar sin sellar;
- permite descargar PDF sin autorización;
- expone storageKey;
- expone URL firmada persistente;
- genera PDF formal desde draft sin marca de borrador;
- no calcula hash;
- calcula hash no reproducible;
- no cambia hash ante modificación de contenido;
- registra contenido completo en logs;
- registra contenido completo en auditoría;
- crea endpoints públicos;
- documenta endpoints públicos en OpenAPI;
- presenta hash como firma electrónica legal;
- presenta MVP como certificación legal externa;
- ejecuta resoluciones automáticamente;
- genera cargos desde actas;
- genera multas desde actas;
- usa IA externa con actas reales;
- omite auditoría de operaciones críticas.
```

---

## 37. Resultado esperado

Al finalizar la implementación de `015-certified-minutes`, RESIDENT Core podrá gestionar actas formales internas de manera segura, versionada, auditable y preparada para evolución legal futura:

```text id="htypuo"
- crear actas vinculadas a reuniones;
- importar actas preliminares;
- estructurar contenido por secciones;
- crear versiones;
- preservar versiones previas;
- enviar actas a revisión;
- solicitar cambios;
- aprobar actas;
- sellar internamente con hash;
- generar PDF formal interno;
- registrar artefactos;
- gestionar adjuntos;
- publicar actas a audiencia autorizada;
- consultar actas publicadas desde /me;
- descargar PDF de forma segura;
- revocar publicaciones;
- archivar actas;
- auditar operaciones críticas;
- emitir eventos de notificación;
- proteger almacenamiento;
- impedir exposición pública;
- impedir ejecución automática de resoluciones, cargos o multas.
```

El módulo quedará preparado para futuras specs de firma electrónica, sellado de tiempo externo, verificación pública, voto ponderado, reglas legales avanzadas, impugnaciones y asistencia de IA bajo gobierno de datos.
