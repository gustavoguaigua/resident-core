# Test Plan — Spec 015 Certified Minutes

## 1. Información del documento

| Campo           | Valor                                                                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Proyecto        | RESIDENT Core                                                                                                                                                |
| Spec ID         | 015                                                                                                                                                          |
| Módulo          | Certified Minutes                                                                                                                                            |
| Documento       | Test Plan                                                                                                                                                    |
| Ruta            | `docs/specs/015-certified-minutes/test-plan.md`                                                                                                              |
| Versión         | 0.1                                                                                                                                                          |
| Estado          | needs-review                                                                                                                                                 |
| Fecha           | 2026-07-21                                                                                                                                                   |
| Documento base  | `docs/specs/015-certified-minutes/spec.md`                                                                                                                   |
| Plan técnico    | `docs/specs/015-certified-minutes/plan.md`                                                                                                                   |
| Modelo de datos | `docs/specs/015-certified-minutes/data-model.md`                                                                                                             |
| Contrato API    | `docs/specs/015-certified-minutes/api-contract.md`                                                                                                           |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `007-audit`, `012-communications-notifications`, `013-meetings-attendance`, `014-voting-basic` |
| Relacionado con | storage seguro, PDF, hash, canonicalización, auditoría, publicaciones, futuras firmas electrónicas y sellado externo                                         |

---

## 2. Propósito

Este documento define la estrategia de pruebas para el módulo `015-certified-minutes`.

El plan cubre pruebas unitarias, pruebas de entidades de dominio, validación de DTOs, servicios de aplicación, políticas, repositorios, API, autorización, recurso propio, publicación por audiencia, multitenancy, versionado, inmutabilidad, sellado interno, generación de PDF, storage, adjuntos, auditoría, observabilidad, OpenAPI, seguridad, performance, smoke tests y CI/CD.

Regla central:

```text id="btdhlo"
El módulo Certified Minutes debe impedir actas cross-tenant, reuniones cross-tenant, edición de versiones selladas, publicación sin sellado, descarga no autorizada, exposición de storageKey, endpoints públicos, logs con contenido completo, auditoría con contenido completo y ejecución automática de decisiones.
```

---

## 3. Objetivos de prueba

Las pruebas deben validar que el sistema:

* crea actas certificadas vinculadas a reuniones;
* impide crear actas sin reunión;
* impide usar reuniones de otro tenant;
* impide crear más de un acta activa principal por reunión;
* importa contenido desde `MeetingMinutes` del mismo tenant y reunión;
* impide importar actas preliminares cross-tenant;
* crea versiones incrementales;
* conserva versiones anteriores;
* impide modificar versiones selladas;
* gestiona secciones estructuradas;
* sanitiza contenido de secciones;
* impide órdenes duplicadas por versión;
* permite enviar actas a revisión;
* permite aprobar actas bajo permiso;
* permite rechazar o solicitar cambios con comentario obligatorio;
* permite sellar internamente con hash;
* calcula hash reproducible;
* cambia el hash ante modificación de contenido;
* genera PDF oficial solo desde versión aprobada o sellada;
* impide PDF oficial desde borrador;
* permite PDF borrador solo con marca de agua si se habilita;
* registra artefactos generados;
* protege `storageKey`;
* permite subir adjuntos válidos;
* rechaza adjuntos no permitidos;
* publica solo actas selladas;
* exige audiencia para publicación;
* permite revocar publicación con razón;
* permite consultar actas propias publicadas;
* impide consultar actas no publicadas desde `/me`;
* impide consultar actas de audiencia ajena;
* permite descargar PDF publicado solo a usuarios autorizados;
* registra accesos y descargas;
* audita operaciones críticas;
* emite eventos seguros hacia notificaciones;
* no expone endpoints públicos;
* no ejecuta resoluciones, cargos ni multas;
* mantiene OpenAPI consistente;
* pasa CI.

---

## 4. Alcance de pruebas

### 4.1. Incluido

```text id="uui7ob"
1. Enums.
2. Value objects.
3. Entidades de dominio.
4. Máquinas de estado.
5. DTO validation.
6. Servicios de aplicación.
7. Políticas de tenant.
8. Políticas de reunión.
9. Políticas de versión.
10. Políticas de sellado.
11. Políticas de publicación.
12. Políticas de audiencia.
13. Políticas de storage.
14. Repositorios Prisma.
15. API administrativa.
16. API /me.
17. Autorización por permisos.
18. Autorización por recurso propio.
19. Multitenancy.
20. Versionado.
21. Inmutabilidad de versión sellada.
22. Canonicalización.
23. Hash de versión.
24. Hash de sellado.
25. Hash de artefacto.
26. Generación PDF.
27. Adjuntos.
28. Descargas.
29. Storage mock.
30. Notificaciones.
31. Auditoría.
32. Observabilidad.
33. Seguridad.
34. OpenAPI.
35. Performance MVP.
36. Smoke tests.
37. CI/CD gates.
```

---

### 4.2. Fuera de alcance de pruebas MVP

```text id="y0u6g4"
- Firma electrónica legalmente válida.
- Firma electrónica avanzada.
- Firma electrónica cualificada.
- Sellado de tiempo certificado por tercero.
- Certificación notarial.
- Verificación pública externa.
- Blockchain.
- OCR de actas físicas.
- Escaneo y validación automática de firmas manuscritas.
- Firma biométrica.
- Reconocimiento de voz.
- Transcripción automática.
- Videograbación.
- Impugnaciones legales.
- Integración con entidades públicas.
- IA con actas reales.
- Validación legal automática de resoluciones.
- Ejecución automática de resoluciones.
- Generación automática de cargos.
- Generación automática de multas.
```

---

## 5. Capas de prueba

```text id="mfqvzk"
unit
domain
value-object
state-machine
dto-validation
application-service
policy
use-case
repository-integration
storage-integration
pdf-integration
hash-integrity
api
authorization
own-resource
audience
publication
multitenancy
audit
observability
security
openapi
performance
smoke
ci
```

---

## 6. Datos base de prueba

### 6.1. Tenants

```text id="m1uug8"
tenantActiveA
tenantActiveB
tenantSuspended
tenantInactive
tenantArchived
```

---

### 6.2. Usuarios

```text id="qjpfhf"
platformAdmin
tenantAdminA
tenantAdminB
meetingManagerA
meetingManagerB
boardMemberA
secretaryA
ownerUserA
residentUserA
ownerResidentUserA
participantUserA
userWithoutCertifiedMinutesPermissionA
userWithoutMembership
disabledUser
anonymousUser
```

---

### 6.3. Personas

```text id="gr4y1k"
personOwnerA
personResidentA
personOwnerResidentA
personBoardMemberA
personParticipantA
personOwnerB
personResidentB
personInactiveA
```

---

### 6.4. Unidades habitacionales

```text id="a6e3qf"
propertyUnitA101
propertyUnitA102
propertyUnitA103
propertyUnitB201
propertyUnitInactiveA
```

---

### 6.5. Relaciones

```text id="lzidri"
ownerUserA -> personOwnerA -> propertyUnitA101 ownership active
residentUserA -> personResidentA -> propertyUnitA101 residency active
ownerResidentUserA -> personOwnerResidentA -> propertyUnitA102 ownership active + residency active
participantUserA -> personParticipantA -> meetingParticipant active
ownerUserB -> personOwnerB -> propertyUnitB201 ownership active
residentUserB -> personResidentB -> propertyUnitB201 residency active
```

---

### 6.6. Reuniones

```text id="chhwzn"
meetingDraftA
meetingCalledA
meetingInProgressA
meetingAttendanceClosedA
meetingCompletedA
meetingCancelledA
meetingTenantB
```

---

### 6.7. Actas preliminares

```text id="yhhsey"
meetingMinutesDraftA
meetingMinutesApprovedA
meetingMinutesPublishedA
meetingMinutesTenantB
```

---

### 6.8. Asistencia y quórum

```text id="cb5wdb"
meetingAttendanceSummaryA
meetingQuorumMetA
meetingQuorumNotMetA
meetingAttendanceTenantB
```

---

### 6.9. Resoluciones

```text id="imk7k5"
meetingResolutionApprovedA
meetingResolutionDraftA
meetingResolutionCancelledA
meetingResolutionTenantB
```

---

### 6.10. Votaciones y resultados

```text id="tl6gjs"
votingSessionResultsPublishedA
votingSessionSecretBasicA
votingResultPassedA
votingResultFailedA
votingResultTieA
votingResultTenantB
```

---

### 6.11. Certified Minutes

```text id="lgi2q4"
certifiedMinutesDraftA
certifiedMinutesUnderReviewA
certifiedMinutesChangesRequestedA
certifiedMinutesApprovedA
certifiedMinutesSealedA
certifiedMinutesPublishedA
certifiedMinutesSupersededA
certifiedMinutesCancelledA
certifiedMinutesArchivedA
certifiedMinutesTenantB
```

---

### 6.12. Versions

```text id="wxur8t"
certifiedMinutesVersion1DraftA
certifiedMinutesVersion1UnderReviewA
certifiedMinutesVersion1ApprovedA
certifiedMinutesVersion1SealedA
certifiedMinutesVersion2DraftA
certifiedMinutesVersionSupersededA
certifiedMinutesVersionArchivedA
certifiedMinutesVersionTenantB
```

---

### 6.13. Sections

```text id="u2xg5f"
sectionHeaderA
sectionMeetingInfoA
sectionCallNoticeA
sectionAttendanceA
sectionQuorumA
sectionAgendaA
sectionDiscussionA
sectionVotingA
sectionResolutionsA
sectionAgreementsA
sectionObservationsA
sectionClosureA
sectionAttachmentsA
sectionCustomA
sectionTenantB
```

---

### 6.14. Approvals

```text id="tstgvp"
approvalApprovedA
approvalRejectedA
approvalChangesRequestedA
approvalCommentedA
approvalTenantB
```

---

### 6.15. Attachments

```text id="ph6s58"
attachmentAttendanceSheetA
attachmentVotingReportA
attachmentSupportPdfA
attachmentImagePngA
attachmentImageJpegA
attachmentDocxA
attachmentXlsxA
attachmentInvalidMimeA
attachmentTooLargeA
attachmentQuarantinedA
attachmentArchivedA
attachmentTenantB
```

---

### 6.16. Artifacts

```text id="u1dj3v"
artifactPdfGeneratedOfficialA
artifactDraftPdfA
artifactHtmlSnapshotA
artifactJsonSnapshotA
artifactHashManifestA
artifactFailedA
artifactArchivedA
artifactTenantB
```

---

### 6.17. Publications

```text id="jo02dk"
publicationOwnersA
publicationResidentsA
publicationBoardA
publicationMeetingParticipantsA
publicationTenantAudienceA
publicationPropertyUnitsA
publicationSpecificUsersA
publicationRolesA
publicationMixedA
publicationRestrictedA
publicationRevokedA
publicationExpiredA
publicationArchivedA
publicationTenantB
```

---

### 6.18. Access logs

```text id="jfenvb"
accessLogViewAllowedA
accessLogViewDeniedA
accessLogDownloadAllowedA
accessLogDownloadDeniedA
accessLogExpiredA
accessLogRevokedA
accessLogTenantB
```

---

## 7. Factories de prueba

Deben existir factories para:

```text id="muw6t4"
createCertifiedMinutes()
createCertifiedMinutesVersion()
createCertifiedMinutesSection()
createCertifiedMinutesApproval()
createCertifiedMinutesAttachment()
createCertifiedMinutesArtifact()
createCertifiedMinutesPublication()
createCertifiedMinutesAccessLog()

createCreateCertifiedMinutesDto()
createUpdateCertifiedMinutesDto()
createImportFromMeetingMinutesDto()
createSubmitCertifiedMinutesReviewDto()
createApproveCertifiedMinutesDto()
createRejectCertifiedMinutesDto()
createRequestCertifiedMinutesChangesDto()
createSealCertifiedMinutesDto()
createPublishCertifiedMinutesDto()
createRevokeCertifiedMinutesPublicationDto()
createArchiveCertifiedMinutesDto()

createCreateCertifiedMinutesVersionDto()
createCreateCertifiedMinutesSectionDto()
createUpdateCertifiedMinutesSectionDto()
createReorderCertifiedMinutesSectionsDto()
createCreateCertifiedMinutesApprovalDto()
createUploadCertifiedMinutesAttachmentPayload()
createGenerateCertifiedMinutesPdfDto()

createCertifiedMinutesActorContext()
createTenantContext()
createOwnCertifiedMinutesContext()
createAudienceScenario()
createPublishedMinutesScenario()
createStorageMockFile()
createPdfBufferFixture()
createCanonicalContentFixture()
createHashFixture()
```

Reglas:

* Usar datos sintéticos.
* No usar nombres reales.
* No usar emails reales.
* No usar teléfonos reales.
* No usar cédulas reales.
* No usar actas reales.
* No usar documentos reales.
* No usar firmas reales.
* No usar votos reales.
* No usar `storageKey` real.
* No usar URLs firmadas reales.
* No usar tokens.
* No usar secretos.
* Permitir escenarios Tenant A y Tenant B.
* Permitir escenarios de acta sellada.
* Permitir escenarios de publicación revocada y expirada.
* Permitir escenarios de audiencia owner/resident/board/role/user/unit/mixed.
* Permitir escenarios de PDF oficial y PDF borrador.

---

# 8. Unit tests — Enums y Value Objects

## 8.1. `CertifiedMinutesStatus`

Debe probar:

```text id="dpqdbj"
draft válido
underReview válido
changesRequested válido
approved válido
sealed válido
published válido
superseded válido
cancelled válido
archived válido
estado desconocido inválido
estados editables
estados revisables
estados aprobables
estados sellables
estados publicables
estados terminales
```

---

## 8.2. `CertifiedMinutesVersionStatus`

Debe probar:

```text id="kpiue5"
draft válido
underReview válido
approved válido
sealed válido
superseded válido
archived válido
estado desconocido inválido
draft editable
sealed inmutable
archived terminal
```

---

## 8.3. `CertifiedMinutesVisibility`

Debe probar:

```text id="f7tr8b"
administrative válido
board válido
meetingParticipants válido
owners válido
residents válido
tenant válido
mixed válido
restricted válido
valor desconocido inválido
```

---

## 8.4. `CertificationMode`

Debe probar:

```text id="jdzkah"
internalHash válido
manualApproval válido
systemGeneratedPdf válido
electronicSignature rechazado en MVP
qualifiedSignature rechazado en MVP
externalTimestamp rechazado en MVP
notarialCertification rechazado en MVP
publicVerification rechazado en MVP
```

---

## 8.5. `MinutesSectionType`

Debe probar:

```text id="s41iaq"
header válido
meetingInfo válido
callNotice válido
attendance válido
quorum válido
agenda válido
discussion válido
voting válido
resolutions válido
agreements válido
observations válido
closure válido
attachments válido
custom válido
valor desconocido inválido
```

---

## 8.6. `ApprovalDecision`

Debe probar:

```text id="f2atqz"
approved válido
rejected válido
changesRequested válido
commented válido
valor desconocido inválido
rejected requiere comments
changesRequested requiere comments
```

---

## 8.7. `CertifiedMinutesTitle`

Debe probar:

```text id="kx0l7t"
título válido
título vacío inválido
título solo espacios inválido
normalización de espacios
longitud máxima
contenido peligroso rechazado o sanitizado
```

---

## 8.8. `CertifiedMinutesCode`

Debe probar:

```text id="i3i1tq"
código válido
código opcional
código con espacios se normaliza
código muy largo inválido
código con caracteres peligrosos inválido
```

---

## 8.9. `MinutesVersionNumber`

Debe probar:

```text id="jlnui6"
versionNumber 1 válido
versionNumber incremental válido
versionNumber 0 inválido
versionNumber negativo inválido
versionNumber decimal inválido
```

---

## 8.10. `MinutesSectionOrder`

Debe probar:

```text id="h86lwk"
order 1 válido
order 0 inválido
order negativo inválido
order decimal inválido
```

---

## 8.11. `MinutesSectionContent`

Debe probar:

```text id="m4r751"
texto plano válido
HTML permitido sanitizado
script bloqueado
iframe bloqueado
object bloqueado
embed bloqueado
event handlers inline bloqueados
javascript: bloqueado
data URL peligrosa bloqueada
```

---

## 8.12. `MinutesSealHash`

Debe probar:

```text id="x5x9lx"
SHA-256 hash válido
hash vacío inválido
hash con longitud incorrecta inválido
hash con caracteres no hex inválido
exposición prefix segura
```

---

## 8.13. `MinutesHashAlgorithm`

Debe probar:

```text id="yjuge7"
SHA-256 válido
SHA-512 rechazado en MVP si no habilitado
BLAKE3 rechazado en MVP si no habilitado
algoritmo desconocido inválido
```

---

## 8.14. `MinutesPublicationWindow`

Debe probar:

```text id="sbxgi9"
sin expiresAt válido
expiresAt posterior a publishedAt válido
expiresAt igual a publishedAt inválido
expiresAt anterior a publishedAt inválido
publicación vigente
publicación expirada
```

---

# 9. Unit tests — Entidades de dominio

## 9.1. `CertifiedMinutes`

Debe probar:

```text id="dretj5"
crear acta draft válida
rechazar acta sin meetingId
rechazar acta sin title
validar visibility
validar certificationMode
estado inicial draft
asignar sourceMeetingMinutesId
actualizar title en draft
actualizar visibility en draft
rechazar update en sealed
submitReview válido
approve válido
requestChanges válido
reject válido
seal válido
publish válido
revoke publication conceptual
cancel con razón
archive
rechazar transiciones inválidas
```

---

## 9.2. `CertifiedMinutesVersion`

Debe probar:

```text id="z8tmh0"
crear versión 1 válida
crear versión 2 con changeReason
rechazar versión posterior sin changeReason
validar versionNumber incremental
validar title
validar contentSnapshot
calcular contentHash
marcar underReview
marcar approved
marcar sealed
marcar superseded
archivar versión
rechazar modificación sealed
```

---

## 9.3. `CertifiedMinutesSection`

Debe probar:

```text id="pk369a"
crear sección header
crear sección meetingInfo
crear sección attendance
crear sección quorum
crear sección voting
crear sección resolutions
crear sección custom
validar order
validar title
validar body
sanitizar body
validar sourceType/sourceId
marcar isRequired
actualizar en versión draft
rechazar update en versión sealed
archivar sección
```

---

## 9.4. `CertifiedMinutesApproval`

Debe probar:

```text id="dxri4e"
crear approval approved
crear approval rejected con comments
crear approval changesRequested con comments
crear approval commented
rechazar rejected sin comments
rechazar changesRequested sin comments
validar approverUserId
validar decidedAt
archivar approval
no tratar approval como firma legal
```

---

## 9.5. `CertifiedMinutesAttachment`

Debe probar:

```text id="czq613"
crear adjunto pdf
crear adjunto png
crear adjunto jpeg
crear adjunto docx
crear adjunto xlsx
rechazar fileName vacío
rechazar mimeType no permitido
rechazar fileSize cero
rechazar fileSize negativo
registrar storageKey interno
exponer DTO sin storageKey
calcular fileHash
marcar available
marcar quarantined
marcar rejected
archivar adjunto
```

---

## 9.6. `CertifiedMinutesArtifact`

Debe probar:

```text id="p5jazs"
crear artifact pending
crear pdf generated
crear draftPdf no oficial
crear hashManifest
rechazar generated sin storageKey
rechazar generated sin artifactHash
rechazar fileSize cero
marcar isOfficial true solo si versión aprobada o sellada
rechazar PDF oficial desde draft
archivar artifact
DTO no expone storageKey
```

---

## 9.7. `CertifiedMinutesPublication`

Debe probar:

```text id="djn2uu"
crear publicación draft
publicar owners
publicar residents
publicar board
publicar tenant
publicar propertyUnits con audienceRules
publicar specificUsers con audienceRules
publicar roles con audienceRules
rechazar mixed sin audienceRules
rechazar restricted sin audienceRules
rechazar published sin publishedBy
rechazar expiresAt anterior a publishedAt
revocar con razón
rechazar revocar sin razón
archivar publicación
```

---

## 9.8. `CertifiedMinutesAccessLog`

Debe probar:

```text id="nfvrt2"
crear access view allowed
crear access download allowed
crear access denied
crear access expired
crear access revoked
validar actorUserId opcional
validar accessType
validar outcome
registrar ipAddressHash
registrar userAgentHash
no guardar storageKey
no guardar URL firmada
no guardar contenido completo
```

---

# 10. Unit tests — State machines

## 10.1. CertifiedMinutes State Machine

Transiciones válidas:

```text id="v8jmf1"
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

Transiciones inválidas:

```text id="l4r9ho"
published -> draft
sealed -> draft
approved -> draft sin nueva versión
archived -> published
cancelled -> published
published -> underReview sin nueva versión
draft -> sealed
draft -> published
underReview -> sealed
approved -> published
```

---

## 10.2. CertifiedMinutesVersion State Machine

Transiciones válidas:

```text id="een1gt"
draft -> underReview
underReview -> approved
underReview -> draft
approved -> sealed
sealed -> superseded
superseded -> archived
draft -> archived
```

Transiciones inválidas:

```text id="u7o75v"
sealed -> draft
sealed -> approved
archived -> draft
superseded -> draft
draft -> sealed
underReview -> sealed
```

---

## 10.3. CertifiedMinutesArtifact State Machine

Transiciones válidas:

```text id="h40nc9"
pending -> generated
pending -> failed
generated -> archived
failed -> archived
```

Transiciones inválidas:

```text id="rzcj41"
generated -> pending
failed -> generated sin regeneración controlada
archived -> generated
```

---

## 10.4. CertifiedMinutesPublication State Machine

Transiciones válidas:

```text id="b6hbdx"
draft -> published
published -> expired
published -> revoked
published -> archived
revoked -> archived
expired -> archived
```

Transiciones inválidas:

```text id="a5p359"
revoked -> published
expired -> published
archived -> published
draft -> revoked
```

---

# 11. DTO validation tests

## 11.1. `CreateCertifiedMinutesDto`

Debe validar:

```text id="bw37k7"
meetingId requerido
meetingId UUID
sourceMeetingMinutesId UUID opcional
title requerido
title no vacío
code opcional
visibility válido
certificationMode válido
rechaza tenantId
rechaza status
rechaza currentVersionId
rechaza approvedVersionId
rechaza sealedVersionId
rechaza publishedVersionId
rechaza sealHash
rechaza sealAlgorithm
rechaza createdBy
rechaza approvedBy
rechaza sealedBy
rechaza publishedBy
```

---

## 11.2. `UpdateCertifiedMinutesDto`

Debe validar:

```text id="y3h1bb"
title opcional no vacío
code opcional
visibility válido si existe
rechaza tenantId
rechaza meetingId
rechaza sourceMeetingMinutesId
rechaza status
rechaza sealHash
rechaza sealAlgorithm
rechaza campos de auditoría
rechaza fechas controladas por sistema
```

---

## 11.3. `ImportFromMeetingMinutesDto`

Debe validar:

```text id="n9glc6"
sourceMeetingMinutesId requerido
sourceMeetingMinutesId UUID
createInitialVersion boolean
includeAgenda boolean
includeAttendanceSummary boolean
includeQuorumSummary boolean
includeVotingResults boolean
includeResolutions boolean
changeReason opcional o requerido según contexto
rechaza tenantId
rechaza contentSnapshot enviado por cliente
```

---

## 11.4. `SubmitCertifiedMinutesReviewDto`

Debe validar:

```text id="z2ghtm"
versionId requerido
versionId UUID
notes opcional sanitizado
notifyReviewers boolean
rechaza tenantId
rechaza submittedBy
rechaza submittedAt
rechaza status
```

---

## 11.5. `ApproveCertifiedMinutesDto`

Debe validar:

```text id="boflyt"
versionId requerido
versionId UUID
comments opcional sanitizado
rechaza tenantId
rechaza approvedBy
rechaza approvedAt
rechaza status
```

---

## 11.6. `RejectCertifiedMinutesDto`

Debe validar:

```text id="q43awm"
versionId requerido
versionId UUID
comments requerido
comments no vacío
comments sanitizado
rechaza tenantId
rechaza rejectedBy
rechaza decidedAt
rechaza status
```

---

## 11.7. `RequestCertifiedMinutesChangesDto`

Debe validar:

```text id="gp39zu"
versionId requerido
versionId UUID
comments requerido
comments no vacío
comments sanitizado
rechaza tenantId
rechaza decidedAt
rechaza status
```

---

## 11.8. `SealCertifiedMinutesDto`

Debe validar:

```text id="fhhod3"
versionId requerido
versionId UUID
hashAlgorithm = SHA-256
notes opcional sanitizado
rechaza tenantId
rechaza sealHash
rechaza sealedBy
rechaza sealedAt
rechaza status
```

---

## 11.9. `PublishCertifiedMinutesDto`

Debe validar:

```text id="pzr4jp"
versionId requerido
versionId UUID
artifactId UUID opcional
audienceType requerido
audienceType válido
audienceRules requerido para mixed/restricted/propertyUnits/specificUsers/roles
expiresAt ISO opcional
notifyAudience boolean
notes opcional sanitizado
rechaza tenantId
rechaza publishedBy
rechaza publishedAt
rechaza status
```

---

## 11.10. `RevokeCertifiedMinutesPublicationDto`

Debe validar:

```text id="k70w3b"
publicationId UUID requerido si se revoca desde acta
reason requerido
reason no vacío
reason sanitizado
rechaza tenantId
rechaza revokedBy
rechaza revokedAt
```

---

## 11.11. `CreateCertifiedMinutesVersionDto`

Debe validar:

```text id="psf6uy"
title requerido
summary opcional sanitizado
copyFromVersionId UUID opcional
changeReason requerido si no es primera versión
changeReason sanitizado
rechaza tenantId
rechaza versionNumber
rechaza status
rechaza contentHash
rechaza hashAlgorithm
rechaza createdBy
```

---

## 11.12. `CreateCertifiedMinutesSectionDto`

Debe validar:

```text id="nrse8u"
versionId requerido
sectionType requerido
sectionType válido
order entero positivo
title requerido
body requerido
body sanitizado
sourceType opcional
sourceId UUID opcional
isRequired boolean
rechaza tenantId
rechaza archivedAt
```

---

## 11.13. `UpdateCertifiedMinutesSectionDto`

Debe validar:

```text id="ygc4ii"
title opcional no vacío
body opcional sanitizado
order entero positivo si existe
isRequired boolean
rechaza tenantId
rechaza versionId
rechaza certifiedMinutesId
rechaza sourceId si no se permite cambiar
rechaza archivedAt
```

---

## 11.14. `ReorderCertifiedMinutesSectionsDto`

Debe validar:

```text id="en76lj"
versionId requerido
items array requerido
items no vacío
sectionId UUID por item
order entero positivo por item
orders sin duplicados
sectionIds sin duplicados
rechaza tenantId
```

---

## 11.15. `CreateCertifiedMinutesApprovalDto`

Debe validar:

```text id="o0pp6s"
versionId requerido
decision requerido
decision válido
comments requerido para rejected
comments requerido para changesRequested
comments sanitizado
rechaza tenantId
rechaza approverUserId
rechaza decidedAt
```

---

## 11.16. `GenerateCertifiedMinutesPdfDto`

Debe validar:

```text id="c5b9z7"
versionId requerido
official boolean
includeSealHashReference boolean
includeAttachmentsIndex boolean
watermark opcional sanitizado
rechaza tenantId
rechaza storageKey
rechaza artifactHash
rechaza generatedBy
rechaza generatedAt
```

---

# 12. Application service tests

## 12.1. `CertifiedMinutesService`

Debe probar:

```text id="lb35ej"
crear acta válida
rechazar create sin meetingId
rechazar meetingId tenant B
rechazar sourceMeetingMinutes tenant B
rechazar sourceMeetingMinutes de otra reunión
rechazar segunda acta activa por reunión
actualizar acta draft
rechazar update sealed
cancelar acta con razón
archivar acta
auditar acciones
```

---

## 12.2. `CertifiedMinutesStateMachineService`

Debe probar:

```text id="y8t7xy"
transiciones válidas
transiciones inválidas
estados editables
estados revisables
estados aprobables
estados sellables
estados publicables
estados terminales
```

---

## 12.3. `CertifiedMinutesImportService`

Debe probar:

```text id="yxk7g9"
importar desde MeetingMinutes mismo tenant
crear versión inicial si createInitialVersion true
crear secciones base
importar agenda
importar resumen de asistencia
importar resumen de quórum
importar resultados publicados
importar resoluciones
rechazar MeetingMinutes tenant B
rechazar MeetingMinutes de otra reunión
no importar votos individuales en secretBasic
no recalcular votaciones
sanitizar contenido importado
auditar importación
```

---

## 12.4. `CertifiedMinutesVersionService`

Debe probar:

```text id="yrduyd"
crear versión inicial
crear versión incremental
copiar desde versión previa
rechazar copyFromVersionId tenant B
rechazar duplicate versionNumber
preservar versión anterior
marcar underReview
marcar approved
marcar sealed
marcar superseded
archivar versión
rechazar modificar sealed
auditar version.created
```

---

## 12.5. `CertifiedMinutesSectionService`

Debe probar:

```text id="d29zo7"
crear sección válida
listar secciones ordenadas
actualizar sección draft
rechazar update en versión sealed
rechazar order duplicado
reordenar secciones
rechazar reorder con section tenant B
archivar sección
sanitizar body
auditar acciones
```

---

## 12.6. `CertifiedMinutesApprovalService`

Debe probar:

```text id="lqzml2"
crear comentario
aprobar versión
rechazar versión con comentario
solicitar cambios con comentario
rechazar rejected sin comments
rechazar changesRequested sin comments
registrar approverUserId desde actor
no aceptar approverUserId desde body
no tratar aprobación como firma legal
auditar aprobación
```

---

## 12.7. `CertifiedMinutesSealService`

Debe probar:

```text id="l66nse"
sellar acta approved
rechazar sellar draft
rechazar sellar underReview
rechazar sellar changesRequested
rechazar sellar versión no approved
calcular contentHash
calcular sealHash
registrar SHA-256
bloquear versión sellada
exponer sealHashPrefix
no exponer sealHash completo por DTO estándar
auditar sealed
```

---

## 12.8. `CertifiedMinutesCanonicalizationService`

Debe probar:

```text id="l1beyt"
canonicalización estable
orden consistente de claves JSON
orden material de secciones
normalización de saltos de línea
normalización de espacios
normalización de fechas UTC
normalización de nulls
mismo contenido lógico genera mismo canonical string
cambio material genera canonical string diferente
```

---

## 12.9. `CertifiedMinutesPdfService`

Debe probar:

```text id="y3rpks"
generar PDF oficial desde versión sealed
generar PDF oficial desde versión approved si política permite
rechazar PDF oficial desde draft
generar draftPdf con watermark BORRADOR
incluir código de acta
incluir versión
incluir fecha de generación
incluir referencia de hash si se solicita
no incluir storageKey
calcular artifactHash
manejar error de PDF como CERTIFIED_MINUTES_PDF_GENERATION_FAILED
auditar generated
```

---

## 12.10. `CertifiedMinutesArtifactService`

Debe probar:

```text id="e4iugx"
crear artifact pending
marcar generated
marcar failed
descargar artifact autorizado
rechazar descarga artifact not generated
archivar artifact
no exponer storageKey
auditar download
registrar access log
```

---

## 12.11. `CertifiedMinutesAttachmentService`

Debe probar:

```text id="r51vip"
subir pdf válido
subir png válido
subir jpeg válido
subir docx válido
subir xlsx válido
rechazar mimeType no permitido
rechazar archivo demasiado grande
rechazar archivo vacío
calcular fileHash
guardar storageKey internamente
no exponer storageKey
descargar adjunto autorizado
rechazar descarga no autorizada
archivar adjunto
auditar uploaded/downloaded/archived
```

---

## 12.12. `CertifiedMinutesPublicationService`

Debe probar:

```text id="f68g7c"
publicar acta sealed
rechazar publicar draft
rechazar publicar approved no sealed
rechazar publicar sin audiencia
validar artifactId tenant
validar artifactId versión
crear publication
marcar acta published
revocar publicación con razón
rechazar revocar sin razón
archivar publicación
no crear endpoint público
no enviar contenido completo a notificaciones
auditar published/revoked
```

---

## 12.13. `CertifiedMinutesAudienceService`

Debe probar:

```text id="tiyupt"
audience administrators
audience board
audience meetingParticipants
audience owners
audience residents
audience tenant
audience propertyUnits
audience specificUsers
audience roles
audience mixed
audience restricted
validar audienceRules contra tenant
rechazar userIds tenant B
rechazar propertyUnitIds tenant B
rechazar roleIds tenant B
resolver actor owner
resolver actor resident
resolver actor participant
resolver actor role
```

---

## 12.14. `CertifiedMinutesAccessService`

Debe probar:

```text id="jgyqiu"
registrar view allowed
registrar download allowed
registrar download denied
registrar expired
registrar revoked
hash de IP si aplica
hash de userAgent si aplica
no guardar storageKey
no guardar URL firmada
no guardar contenido completo
```

---

## 12.15. `CertifiedMinutesNotificationService`

Debe probar:

```text id="k6ho4z"
emitir certifiedMinutes.submittedForReview
emitir certifiedMinutes.changesRequested
emitir certifiedMinutes.approved
emitir certifiedMinutes.sealed
emitir certifiedMinutes.published
emitir certifiedMinutes.publicationRevoked
payload mínimo
no incluir contenido completo
no incluir secciones completas
no incluir storageKey
no incluir URL firmada
fallo del puerto no revierte operación salvo política explícita
```

---

## 12.16. `CertifiedMinutesAuditService`

Debe probar:

```text id="uknz4o"
audita created
audita importedFromMeetingMinutes
audita submittedForReview
audita approved
audita rejected
audita changesRequested
audita sealed
audita published
audita publicationRevoked
audita archived
audita artifact downloaded
audita attachment downloaded
metadata sanitizada
sin contenido completo
sin storageKey
sin URL firmada
sin tokens
```

---

# 13. Repository integration tests

## 13.1. `PrismaCertifiedMinutesRepository`

Debe probar:

```text id="im70qa"
create certified minutes
findById tenant A
findById no devuelve tenant B
list con filtros
update draft
update status
prevent second active certified minutes per meeting
archive
soft delete
```

---

## 13.2. `PrismaCertifiedMinutesVersionRepository`

Debe probar:

```text id="teas0k"
create version
findById tenant A
findById no devuelve tenant B
list by certifiedMinutes
unique versionNumber por acta
update status
archive version
```

---

## 13.3. `PrismaCertifiedMinutesSectionRepository`

Debe probar:

```text id="b5e0j5"
create section
findById tenant A
findById no devuelve tenant B
list by version ordered
unique order por version
update section
reorder sections
archive section
```

---

## 13.4. `PrismaCertifiedMinutesApprovalRepository`

Debe probar:

```text id="vbtvh8"
create approval
findById tenant A
findById no devuelve tenant B
list by version
list by decision
archive approval
```

---

## 13.5. `PrismaCertifiedMinutesAttachmentRepository`

Debe probar:

```text id="vfqv47"
create attachment
findById tenant A
findById no devuelve tenant B
list by certifiedMinutes
list by version
list by status
archive attachment
no DTO con storageKey
```

---

## 13.6. `PrismaCertifiedMinutesArtifactRepository`

Debe probar:

```text id="tlcgoh"
create artifact pending
mark generated
mark failed
findById tenant A
findById no devuelve tenant B
list by certifiedMinutes
list by version
unique official PDF active by version
archive artifact
no DTO con storageKey
```

---

## 13.7. `PrismaCertifiedMinutesPublicationRepository`

Debe probar:

```text id="outwte"
create publication
findById tenant A
findById no devuelve tenant B
list by certifiedMinutes
list active published
revoke publication
archive publication
unique active publication per audience si aplica
```

---

## 13.8. `PrismaCertifiedMinutesAccessLogRepository`

Debe probar:

```text id="gektcr"
create view access log
create download access log
find by tenant
list by certifiedMinutes
list by actor
list by outcome
no metadata con storageKey
no metadata con contenido completo
```

---

# 14. Storage integration tests

## 14.1. `CertifiedMinutesStoragePort`

Debe probar con mock o adapter local:

```text id="jiymkb"
upload archivo válido
downloadStream archivo existente
createTemporaryDownloadUrl con TTL corto si aplica
getMetadata
archive lógico
calculateFileHash
rechazar storageKey externo
rechazar path traversal
rechazar archivo inexistente
manejar storage error controlado
```

---

## 14.2. Seguridad de storage

Debe probar:

```text id="l3ni7s"
storageKey nunca aparece en DTO
storageKey nunca aparece en error
URL firmada persistente nunca aparece
URL temporal no se guarda en metadata
descarga requiere autorización previa
artifact tenant B no se descarga desde tenant A
attachment tenant B no se descarga desde tenant A
```

---

# 15. PDF integration tests

## 15.1. Generación PDF

Debe probar:

```text id="abky1d"
render HTML desde versión
generar PDF buffer válido
PDF incluye título
PDF incluye código
PDF incluye versión
PDF incluye fecha
PDF incluye referencia de hash si aplica
PDF borrador incluye watermark BORRADOR
PDF oficial no incluye watermark de borrador
PDF no incluye storageKey
PDF no incluye datos no autorizados
```

---

## 15.2. Hash de artefacto

Debe probar:

```text id="o9dg06"
artifactHash calculado sobre binario
mismo PDF binario produce mismo hash
PDF modificado produce hash distinto
downloaded artifact hash matches
```

---

# 16. API tests — Certified Minutes

## 16.1. `GET /api/v1/tenant/certified-minutes`

Debe probar:

```text id="tu6l6r"
401 sin token
403 sin certifiedMinutes.read
200 con permiso
paginación
filtro status
filtro visibility
filtro certificationMode
filtro meetingId
filtro code
filtro submittedFrom/submittedTo
filtro approvedFrom/approvedTo
filtro sealedFrom/sealedTo
filtro publishedFrom/publishedTo
q search
sortBy permitido
pageSize máximo 100
no devuelve tenant B
no devuelve contenido completo
no devuelve storageKey
no devuelve sealHash completo
```

---

## 16.2. `POST /api/v1/tenant/certified-minutes`

Debe probar:

```text id="y86kp5"
401 sin token
403 sin certifiedMinutes.create
201 con body válido
422 sin meetingId
422 sin title
422 tenantId en body
422 certificationMode inválido
403/404 meetingId tenant B
403/404 sourceMeetingMinutesId tenant B
422 sourceMeetingMinutesId de otra reunión
409 segunda acta activa por reunión
audita certifiedMinutes.created
```

---

## 16.3. `GET /api/v1/tenant/certified-minutes/{certifiedMinutesId}`

Debe probar:

```text id="v1zau9"
401 sin token
403 sin certifiedMinutes.read
200 con permiso
404 acta inexistente
403/404 acta tenant B
no expone storageKey
no expone URL firmada
no expone sealHash completo
```

---

## 16.4. `PATCH /api/v1/tenant/certified-minutes/{certifiedMinutesId}`

Debe probar:

```text id="gdtq4j"
401 sin token
403 sin certifiedMinutes.update
200 actualiza draft
200 actualiza changesRequested
409 actualiza approved
409 actualiza sealed
409 actualiza published
409 actualiza archived
422 tenantId en body
422 status en body
422 sealHash en body
422 campos de sistema en body
audita certifiedMinutes.updated
```

---

## 16.5. `POST /import-from-meeting-minutes`

Debe probar:

```text id="yol9qz"
401 sin token
403 sin certifiedMinutes.update
200 importa MeetingMinutes mismo tenant
200 crea versión inicial
200 crea secciones base
403/404 MeetingMinutes tenant B
422 MeetingMinutes de otra reunión
409 acta no editable
no importa votos individuales secretBasic
no recalcula votaciones
sanitiza contenido
audita certifiedMinutes.importedFromMeetingMinutes
```

---

## 16.6. `POST /submit-review`

Debe probar:

```text id="bb1stv"
401 sin token
403 sin certifiedMinutes.submitReview
200 draft -> underReview
200 changesRequested -> underReview
409 sealed -> underReview
409 published -> underReview
422 sin versionId
422 versionId tenant B
422 sin secciones mínimas
notifica si notifyReviewers true
audita certifiedMinutes.submittedForReview
```

---

## 16.7. `POST /approve`

Debe probar:

```text id="vmw56g"
401 sin token
403 sin certifiedMinutes.approve
200 underReview -> approved
422 sin versionId
403/404 versionId tenant B
409 draft -> approved
409 sealed -> approved
crea approval
no firma electrónicamente
no sella automáticamente
no publica automáticamente
audita certifiedMinutes.approved
```

---

## 16.8. `POST /reject`

Debe probar:

```text id="s2gql4"
401 sin token
403 sin certifiedMinutes.reject
200 underReview -> changesRequested
422 sin comments
422 comments vacío
409 draft -> reject
409 sealed -> reject
crea approval rejected
no elimina versión
audita certifiedMinutes.rejected
```

---

## 16.9. `POST /request-changes`

Debe probar:

```text id="hvpn7b"
401 sin token
403 sin certifiedMinutes.requestChanges
200 underReview -> changesRequested
422 sin comments
422 comments vacío
409 draft -> requestChanges
409 sealed -> requestChanges
crea approval changesRequested
notifica si aplica
audita certifiedMinutes.changesRequested
```

---

## 16.10. `POST /seal`

Debe probar:

```text id="wfwv0w"
401 sin token
403 sin certifiedMinutes.seal
200 approved -> sealed
422 sin versionId
422 hashAlgorithm diferente a SHA-256
409 draft -> seal
409 underReview -> seal
409 changesRequested -> seal
409 published -> seal
calcula sealHash
devuelve sealHashPrefix
no devuelve sealHash completo
legalSignature false
audita certifiedMinutes.sealed
```

---

## 16.11. `POST /publish`

Debe probar:

```text id="tv0ul6"
401 sin token
403 sin certifiedMinutes.publish
200 sealed -> published
422 sin versionId
422 sin audienceType
422 mixed sin audienceRules
422 restricted sin audienceRules
422 roles sin audienceRules
422 propertyUnits sin audienceRules
422 specificUsers sin audienceRules
403/404 artifactId tenant B
422 artifactId de otra versión
409 draft -> publish
409 approved -> publish
409 no sealed -> publish
crea publication
notifica si notifyAudience true
no endpoint público
no ejecución automática
audita certifiedMinutes.published
```

---

## 16.12. `POST /revoke-publication`

Debe probar:

```text id="klqufx"
401 sin token
403 sin certifiedMinutes.revokePublication
200 revoca publicación
422 sin publicationId
422 sin reason
403/404 publicationId tenant B
409 publicación ya revoked
no elimina acta
no elimina artifact
no elimina auditoría
audita certifiedMinutes.publicationRevoked
```

---

## 16.13. `POST /archive`

Debe probar:

```text id="s4cpql"
401 sin token
403 sin certifiedMinutes.archive
200 archiva acta
archivo lógico
no elimina versiones
no elimina secciones
no elimina approvals
no elimina attachments
no elimina artifacts
no elimina publications
no elimina accessLogs
audita certifiedMinutes.archived
```

---

# 17. API tests — Versions

Debe probar endpoints:

```text id="wz0a0b"
GET /api/v1/tenant/certified-minutes/{certifiedMinutesId}/versions
POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/versions
GET /api/v1/tenant/certified-minutes-versions/{versionId}
POST /api/v1/tenant/certified-minutes-versions/{versionId}/archive
GET /api/v1/tenant/certified-minutes/{certifiedMinutesId}/versions/compare
```

Casos mínimos:

```text id="yqeprh"
401 sin token
403 sin permiso
200 listar versiones
201 crear versión inicial
201 crear versión incremental
422 versión posterior sin changeReason
403/404 certifiedMinutes tenant B
403/404 copyFromVersionId tenant B
409 duplicate versionNumber
200 obtener versión
200 archivar versión
200 comparar versiones
403/404 fromVersionId tenant B
403/404 toVersionId tenant B
no expone metadata sensible
auditoría por acción
```

---

# 18. API tests — Sections

Debe probar endpoints:

```text id="oo61bw"
GET /api/v1/tenant/certified-minutes/{certifiedMinutesId}/sections
POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/sections
GET /api/v1/tenant/certified-minutes-sections/{sectionId}
PATCH /api/v1/tenant/certified-minutes-sections/{sectionId}
POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/sections/reorder
POST /api/v1/tenant/certified-minutes-sections/{sectionId}/archive
```

Casos mínimos:

```text id="njihfr"
401 sin token
403 sin permiso
201 crear sección válida
422 sin versionId
422 sin title
422 sin body
422 order inválido
409 order duplicado
409 crear en versión sealed
409 editar sección en versión sealed
403/404 section tenant B
403/404 version tenant B
200 reordenar secciones
409 reorder con órdenes duplicados
422 reorder con sectionIds duplicados
sanitización body
auditoría por acción
```

---

# 19. API tests — Approvals

Debe probar endpoints:

```text id="h4l342"
GET /api/v1/tenant/certified-minutes/{certifiedMinutesId}/approvals
POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/approvals
GET /api/v1/tenant/certified-minutes-approvals/{approvalId}
```

Casos mínimos:

```text id="iun4gn"
401 sin token
403 sin permiso
200 listar approvals
201 crear commented
201 crear approved
422 rejected sin comments
422 changesRequested sin comments
403/404 approval tenant B
403/404 version tenant B
no acepta approverUserId del body
no se interpreta como firma legal
auditoría por acción
```

---

# 20. API tests — Attachments

Debe probar endpoints:

```text id="wogdcw"
GET /api/v1/tenant/certified-minutes/{certifiedMinutesId}/attachments
POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/attachments
GET /api/v1/tenant/certified-minutes-attachments/{attachmentId}
GET /api/v1/tenant/certified-minutes-attachments/{attachmentId}/download
POST /api/v1/tenant/certified-minutes-attachments/{attachmentId}/archive
```

Casos mínimos:

```text id="ivfm9v"
401 sin token
403 sin permiso
201 upload pdf
201 upload png
201 upload jpeg
201 upload docx
201 upload xlsx
415 mimeType no permitido
413 archivo demasiado grande
422 archivo vacío
403/404 attachment tenant B
200 listar adjuntos
200 obtener adjunto
200 download autorizado
403 download sin permiso
200 archive
no expone storageKey en list/get
no expone URL persistente
audita uploaded/downloaded/archived
registra access log
```

---

# 21. API tests — Artifacts

Debe probar endpoints:

```text id="yhqbpm"
GET /api/v1/tenant/certified-minutes/{certifiedMinutesId}/artifacts
POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/artifacts/generate-pdf
GET /api/v1/tenant/certified-minutes-artifacts/{artifactId}
GET /api/v1/tenant/certified-minutes-artifacts/{artifactId}/download
POST /api/v1/tenant/certified-minutes-artifacts/{artifactId}/archive
```

Casos mínimos:

```text id="cztssq"
401 sin token
403 sin permiso
201 generate PDF official from sealed
201 generate draftPdf with watermark si permitido
409 official PDF from draft
403/404 version tenant B
200 listar artifacts
200 obtener artifact
200 download autorizado
403 download sin permiso
409 download artifact not generated
200 archive
no expone storageKey
no expone URL persistente
calcula artifactHash
audita generated/downloaded/archived
registra access log
```

---

# 22. API tests — Publications

Debe probar endpoints:

```text id="j30sgm"
GET /api/v1/tenant/certified-minutes/{certifiedMinutesId}/publications
GET /api/v1/tenant/certified-minutes-publications/{publicationId}
POST /api/v1/tenant/certified-minutes-publications/{publicationId}/revoke
POST /api/v1/tenant/certified-minutes-publications/{publicationId}/archive
```

Casos mínimos:

```text id="ibq4wk"
401 sin token
403 sin permiso
200 listar publications
200 obtener publication
200 revoke con razón
422 revoke sin razón
403/404 publication tenant B
409 revoke already revoked
200 archive
auditoría por acción
```

---

# 23. API tests — Endpoints `/me`

## 23.1. `GET /api/v1/me/certified-minutes`

Debe probar:

```text id="ckn3nq"
401 sin token
403 sin membership
200 owner ve acta published para owners
200 resident ve acta published para residents
200 board ve acta published para board
200 participant ve acta published para meetingParticipants
200 user ve acta specificUsers si está incluido
200 user ve acta roles si tiene rol
200 user ve acta propertyUnits si pertenece a unidad
no ve acta draft
no ve acta underReview
no ve acta approved
no ve acta sealed no published
no ve publication revoked
no ve publication expired
no ve audiencia ajena
no ve tenant B
no devuelve audienceRules completas si revelan terceros
no devuelve auditoría
no devuelve approvals internas
no devuelve storageKey
```

---

## 23.2. `GET /api/v1/me/certified-minutes/{certifiedMinutesId}`

Debe probar:

```text id="l0nzus"
200 acta publicada propia
403/404 acta no publicada
403/404 acta audiencia ajena
403/404 acta tenant B
devuelve solo versión publicada
devuelve secciones publicadas autorizadas
no devuelve contenido restringido
no devuelve storageKey
no devuelve auditoría
registra view access si política lo exige
```

---

## 23.3. `GET /api/v1/me/certified-minutes/{certifiedMinutesId}/artifacts`

Debe probar:

```text id="war3s0"
200 artifacts publicados propios
403/404 acta ajena
403/404 publication revoked
403/404 publication expired
no muestra artifacts no publicados
no muestra storageKey
no muestra URL persistente
```

---

## 23.4. `GET /api/v1/me/certified-minutes-artifacts/{artifactId}/download`

Debe probar:

```text id="xz3yu1"
200 download autorizado owner
200 download autorizado resident
200 download autorizado board
200 download autorizado participant
403/404 artifact audiencia ajena
403/404 artifact tenant B
409/404 publication revoked
409/404 publication expired
409 artifact not generated
no expone storageKey
audita download
registra access log
```

---

# 24. Authorization tests

## 24.1. Sin autenticación

Todos los endpoints privados deben devolver:

```text id="x976lo"
401 UNAUTHORIZED
```

---

## 24.2. Usuario sin membership

Debe devolver:

```text id="qssxib"
403 FORBIDDEN
```

---

## 24.3. Usuario disabled

Debe devolver:

```text id="tm3dtb"
403 FORBIDDEN
```

---

## 24.4. Usuario sin permisos

Debe devolver:

```text id="xh6v5o"
403 FORBIDDEN
```

Casos:

```text id="fii4ci"
sin certifiedMinutes.create no crea acta
sin certifiedMinutes.read no lista actas
sin certifiedMinutes.update no actualiza
sin certifiedMinutes.submitReview no envía revisión
sin certifiedMinutes.approve no aprueba
sin certifiedMinutes.reject no rechaza
sin certifiedMinutes.requestChanges no solicita cambios
sin certifiedMinutes.seal no sella
sin certifiedMinutes.publish no publica
sin certifiedMinutes.revokePublication no revoca
sin certifiedMinutes.archive no archiva
sin certifiedMinutesVersions.create no crea versión
sin certifiedMinutesSections.update no edita sección
sin certifiedMinutesAttachments.download no descarga adjunto
sin certifiedMinutesArtifacts.generate no genera PDF
sin certifiedMinutesArtifacts.download no descarga artifact
sin certifiedMinutesPublications.revoke no revoca publicación directa
sin certifiedMinutes.read.own no consulta /me
sin certifiedMinutesArtifacts.download.own no descarga /me
```

---

## 24.5. PlatformAdmin

Debe probar:

```text id="yp6n3k"
no accede automáticamente a actas internas
acceso excepcional requiere permiso explícito
acceso excepcional debe auditarse
no descarga artifacts sin política explícita
```

---

# 25. Multitenancy tests

Debe probar aislamiento en todas las entidades:

```text id="nczfo3"
tenant A no ve certifiedMinutes tenant B
tenant A no ve certifiedMinutesVersions tenant B
tenant A no ve certifiedMinutesSections tenant B
tenant A no ve certifiedMinutesApprovals tenant B
tenant A no ve certifiedMinutesAttachments tenant B
tenant A no ve certifiedMinutesArtifacts tenant B
tenant A no ve certifiedMinutesPublications tenant B
tenant A no ve certifiedMinutesAccessLogs tenant B
tenant A no modifica certifiedMinutes tenant B
tenant A no sella certifiedMinutes tenant B
tenant A no publica certifiedMinutes tenant B
tenant A no descarga artifact tenant B
tenant A no descarga attachment tenant B
```

Debe probar referencias cross-tenant:

```text id="qtlsqg"
tenant A no usa meetingId tenant B
tenant A no usa sourceMeetingMinutesId tenant B
tenant A no usa versionId tenant B
tenant A no usa sectionId tenant B
tenant A no usa approvalId tenant B
tenant A no usa attachmentId tenant B
tenant A no usa artifactId tenant B
tenant A no usa publicationId tenant B
tenant A no usa votingResultId tenant B
tenant A no usa meetingResolutionId tenant B
tenant A no usa audienceRules.userIds tenant B
tenant A no usa audienceRules.propertyUnitIds tenant B
tenant A no usa audienceRules.roleIds tenant B
```

Patrones prohibidos:

```typescript id="uyr7c1"
prisma.certifiedMinutes.findUnique({ where: { id: certifiedMinutesId } });
prisma.certifiedMinutesVersion.findUnique({ where: { id: versionId } });
prisma.certifiedMinutesSection.findUnique({ where: { id: sectionId } });
prisma.certifiedMinutesAttachment.findUnique({ where: { id: attachmentId } });
prisma.certifiedMinutesArtifact.findUnique({ where: { id: artifactId } });
prisma.certifiedMinutesPublication.findUnique({ where: { id: publicationId } });
```

Patrón requerido:

```typescript id="v3l8am"
prisma.certifiedMinutes.findFirst({
  where: {
    id: certifiedMinutesId,
    tenantId: currentTenant.id
  }
});
```

---

# 26. Own-resource and audience tests

## 26.1. Audiencia `owners`

Debe probar:

```text id="x7rj1n"
ownerUserA ve acta published owners
residentUserA no ve acta owners si no es owner
ownerUserB no ve acta tenant A
owner de unidad inactiva no ve si política excluye inactivos
```

---

## 26.2. Audiencia `residents`

Debe probar:

```text id="nbdwsd"
residentUserA ve acta published residents
ownerUserA no ve acta residents si no es residente
ownerResidentUserA ve acta residents
residentUserB no ve acta tenant A
```

---

## 26.3. Audiencia `board`

Debe probar:

```text id="tni1sj"
boardMemberA ve acta board
ownerUserA no ve acta board sin rol
residentUserA no ve acta board sin rol
boardMemberB no ve acta tenant A
```

---

## 26.4. Audiencia `meetingParticipants`

Debe probar:

```text id="mw4ncd"
participantUserA ve acta de reunión donde participó
owner no participante no ve si audiencia solo meetingParticipants
participant tenant B no ve acta tenant A
```

---

## 26.5. Audiencia `propertyUnits`

Debe probar:

```text id="dl3dkn"
usuario vinculado a propertyUnit incluida ve acta
usuario de propertyUnit no incluida no ve acta
propertyUnit tenant B en audienceRules se rechaza
```

---

## 26.6. Audiencia `specificUsers`

Debe probar:

```text id="k6rk8x"
user incluido ve acta
user no incluido no ve acta
user tenant B en audienceRules se rechaza
```

---

## 26.7. Audiencia `roles`

Debe probar:

```text id="ak7ahj"
user con role incluido ve acta
user sin role incluido no ve acta
role tenant B en audienceRules se rechaza
```

---

## 26.8. Audiencia `mixed` y `restricted`

Debe probar:

```text id="qxgt2x"
mixed requiere audienceRules
restricted requiere audienceRules
actor incluido por una regla ve acta
actor no incluido no ve acta
audienceRules se validan contra tenant
```

---

# 27. Versioning and immutability tests

Debe probar:

```text id="t0ra2b"
crear versión inicial
crear versión 2 incremental
copyFromVersionId conserva contenido anterior
versión anterior no se modifica
versión sealed no editable
sección de versión sealed no editable
reorder de versión sealed rechazado
nueva versión requerida tras approved
nueva versión requerida tras sealed
nueva versión requerida tras published
sealed -> superseded solo por flujo controlado
```

---

# 28. Hash and integrity tests

## 28.1. Canonicalización

Debe probar:

```text id="m69d6l"
mismo contenido con claves JSON en distinto orden produce mismo canonical
mismo contenido con espacios redundantes produce mismo canonical si no son materiales
mismo contenido con fechas equivalentes produce mismo canonical UTC
orden de secciones es material
cambio de section.order cambia hash
cambio de body cambia hash
cambio de meeting reference cambia hash
```

---

## 28.2. `contentHash`

Debe probar:

```text id="g67vax"
contentHash se calcula sobre contentSnapshot canonicalizado
mismo contentSnapshot produce mismo contentHash
contentSnapshot modificado produce hash diferente
contentHash usa SHA-256
contentHashPrefix se expone seguro
contentHash completo no se expone en DTO estándar si política restringe
```

---

## 28.3. `sealHash`

Debe probar:

```text id="yr2eec"
sealHash se calcula al sellar
sealHash usa versión approved
sealHash incluye metadata relevante
sealHash usa SHA-256
mismo contenido sellado produce mismo hash
cambio posterior imposible en versión sealed
sealHashPrefix se expone seguro
sealHash completo no se expone en DTO estándar
```

---

## 28.4. `artifactHash`

Debe probar:

```text id="y5fmm1"
artifactHash se calcula sobre binario PDF
mismo binario produce mismo hash
binario alterado produce hash diferente
downloaded artifact hash matches stored hash
artifactHashPrefix se expone seguro
storageKey no se expone
```

---

# 29. Publication tests

Debe probar:

```text id="mj8l5d"
publicar acta sealed
rechazar publicar draft
rechazar publicar underReview
rechazar publicar approved no sealed
rechazar publicar sin audienceType
rechazar audienceRules inválidas
rechazar audienceRules cross-tenant
publicar con artifactId válido
rechazar artifactId tenant B
rechazar artifactId de otra versión
revocar publicación con razón
rechazar revocar sin razón
publicación revocada no visible en /me
publicación expirada no visible en /me
si no quedan publicaciones activas, estado puede volver a sealed según política
```

---

# 30. Attachment security tests

Debe probar:

```text id="motcbc"
subida requiere permiso
descarga requiere permiso
mimeType permitido
mimeType no permitido rechazado
fileSize máximo respetado
archivo vacío rechazado
fileName sanitizado
path traversal bloqueado
storageKey interno no expuesto
hash calculado
quarantine status soportado
archive lógico
tenant A no descarga attachment tenant B
metadata sin URL firmada
metadata sin storageKey
```

---

# 31. Artifact security tests

Debe probar:

```text id="y2dask"
generación requiere permiso
descarga requiere permiso
PDF oficial requiere approved/sealed
PDF oficial desde draft rechazado
draftPdf requiere watermark
artifact generated requiere storageKey interno
artifact generated requiere artifactHash
storageKey no expuesto
URL persistente no expuesta
tenant A no descarga artifact tenant B
artifact not generated no descarga
archive lógico
```

---

# 32. Notification integration tests

Debe probar integración con `012-communications-notifications` mediante puerto mock.

Eventos:

```text id="bkrobh"
certifiedMinutes.submittedForReview
certifiedMinutes.changesRequested
certifiedMinutes.approved
certifiedMinutes.sealed
certifiedMinutes.published
certifiedMinutes.publicationRevoked
```

Casos:

```text id="luuvql"
submit-review con notifyReviewers true invoca NotificationPort
submit-review con notifyReviewers false no invoca port
request-changes invoca notificación si política lo permite
approve invoca notificación si política lo permite
publish con notifyAudience true invoca NotificationPort
publish con notifyAudience false no invoca port
payload contiene sourceType=certifiedMinutes
payload contiene sourceId=certifiedMinutesId
payload contiene actionUrl
payload contiene audience mínimo
payload no contiene contenido completo
payload no contiene secciones completas
payload no contiene adjuntos
payload no contiene storageKey
payload no contiene URL firmada
fallo de notification port no revierte acta salvo política explícita
```

---

# 33. Audit tests

Debe verificar emisión de eventos:

```text id="y0y2h3"
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

```text id="h7yi0o"
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

```text id="pe1yex"
contenido completo del acta
contenido completo de secciones
contenido completo de adjuntos
storageKey completo
URLs firmadas
tokens
secretos
cookies
Authorization header
emails completos
teléfonos completos
cédulas
firmas
documentos completos
stack trace
SQL raw
provider payloads completos
```

---

# 34. Observability tests

## 34.1. Logs

Debe probar que logs incluyan:

```text id="wf43pw"
traceId
requestId
correlationId
action
outcome
status
durationMs
errorCode cuando aplica
certifiedMinutesStatus
visibility
certificationMode
artifactType
accessType
```

No deben incluir:

```text id="d3jjmf"
Authorization header
tokens
cookies
secretos
contenido completo del acta
contenido completo de secciones
contenido completo de adjuntos
storageKey
URL firmada
emails completos
teléfonos completos
cédulas
firmas
SQL raw
stack trace en producción
```

---

## 34.2. Métricas

Debe probar métricas:

```text id="nspxlq"
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

Labels permitidos:

```text id="n3w617"
status
visibility
certificationMode
artifactType
publicationStatus
accessType
outcome
```

Labels prohibidos:

```text id="fi61ek"
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

# 35. Security tests

Debe probar:

```text id="q5fb1l"
no public certified minutes endpoints
no public artifact download endpoints
no certifiedMinutes cross-tenant
no versions cross-tenant
no sections cross-tenant
no approvals cross-tenant
no attachments cross-tenant
no artifacts cross-tenant
no publications cross-tenant
no accessLogs cross-tenant
no meetingId tenant B
no sourceMeetingMinutesId tenant B
no votingResultId tenant B
no meetingResolutionId tenant B
no audienceRules userIds tenant B
no audienceRules propertyUnitIds tenant B
no audienceRules roleIds tenant B
no edit sealed version
no publish without seal
no download without permission
no download outside audience
no storageKey in response
no URL persistent in response
no official PDF from draft
no full content in logs
no full content in audit
no automatic charge generation
no automatic fine generation
no automatic resolution execution
no legal signature claim
safe error messages
```

---

# 36. Public endpoint negative tests

OpenAPI y routing no deben permitir:

```text id="ydxekx"
GET /api/v1/public/tenants/{slug}/certified-minutes
GET /api/v1/public/tenants/{slug}/certified-minutes/{certifiedMinutesId}
GET /api/v1/public/tenants/{slug}/certified-minutes/{certifiedMinutesId}/download
GET /api/v1/public/tenants/{slug}/certified-minutes-artifacts/{artifactId}/download
POST /api/v1/public/tenants/{slug}/certified-minutes
POST /api/v1/public/tenants/{slug}/certified-minutes/{certifiedMinutesId}/publish
```

Resultado esperado:

```text id="pvf6m0"
404 route not found
```

o equivalente, sin exponer información interna.

---

# 37. OpenAPI tests

## 37.1. Tags

Debe validar:

```text id="svq3n9"
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

## 37.2. Extensiones requeridas

Para endpoints tenant:

```yaml id="yoao06"
x-tenant-scope: true
x-auth-required: true
x-required-permission: certifiedMinutes.create
x-audit-event: certifiedMinutes.created
```

Para endpoints `/me`:

```yaml id="x0aqrv"
x-tenant-scope: true
x-auth-required: true
x-own-resource: true
x-required-permission: certifiedMinutes.read.own
```

Para descargas:

```yaml id="grsykb"
x-secure-download: true
x-storage-key-exposed: false
x-auth-required: true
x-audit-event: certifiedMinutesArtifact.downloaded
```

Para sellado:

```yaml id="v4cz68"
x-integrity-seal: true
x-hash-algorithm: SHA-256
x-legal-signature: false
x-audit-event: certifiedMinutes.sealed
```

Para publicación:

```yaml id="t5wtjd"
x-publication-controlled: true
x-public-exposure: false
x-audience-required: true
x-audit-event: certifiedMinutes.published
```

Para generación PDF:

```yaml id="uk625w"
x-artifact-generation: true
x-storage-backed: true
x-storage-key-exposed: false
x-official-pdf-from-draft: false
```

---

## 37.3. Endpoints prohibidos

OpenAPI no debe documentar:

```text id="uxjwv1"
GET /api/v1/public/tenants/{slug}/certified-minutes
GET /api/v1/public/tenants/{slug}/certified-minutes/{certifiedMinutesId}
GET /api/v1/public/tenants/{slug}/certified-minutes/{certifiedMinutesId}/download
GET /api/v1/public/tenants/{slug}/certified-minutes-artifacts/{artifactId}/download
```

---

# 38. Performance tests

## 38.1. Objetivo MVP

```text id="xdqm6j"
p95 < 700 ms para listados paginados.
p95 < 1500 ms para consultar acta publicada.
p95 < 5000 ms para generar PDF de acta de hasta 30 páginas.
```

---

## 38.2. Escenarios

Debe medir:

```text id="zzcswp"
GET /tenant/certified-minutes con 1.000 actas por tenant
GET /tenant/certified-minutes/{id}/versions con 50 versiones
GET /tenant/certified-minutes/{id}/sections con 100 secciones
GET /tenant/certified-minutes/{id}/artifacts con 50 artefactos
GET /me/certified-minutes con 100 actas publicadas autorizadas
GET /me/certified-minutes/{id} con acta de 30 páginas
POST /artifacts/generate-pdf con acta de 30 páginas
GET /download con archivo PDF de tamaño razonable
```

---

## 38.3. Validaciones

```text id="ixudba"
paginación obligatoria
pageSize máximo 100
sin N+1 evidente
índices usados
no cargar contenido completo en listados
no cargar binarios en consultas JSON
no generar PDF en cada consulta
no recalcular hash en cada listado
streaming para descargas
```

---

# 39. Concurrency tests

Debe probar:

```text id="v4h239"
dos requests simultáneos crean acta para misma reunión
solo una acta activa debe crearse
la otra devuelve 409 CERTIFIED_MINUTES_ALREADY_EXISTS_FOR_MEETING
dos requests simultáneos generan PDF oficial para misma versión
solo un PDF oficial activo si índice parcial aplica
dos requests simultáneos publican misma versión/audiencia
solo una publicación activa si política aplica
```

Escenario de acta duplicada:

```text id="hz6e47"
Request A y Request B intentan crear CertifiedMinutes con:
tenantId + meetingId iguales.
```

Resultado esperado:

```text id="hdn1ie"
1 acta creada
1 respuesta 409 CERTIFIED_MINUTES_ALREADY_EXISTS_FOR_MEETING
```

---

# 40. Smoke tests

Debe ejecutarse flujo mínimo:

```text id="cv65xt"
1. GET /api/v1/health
2. POST /api/v1/tenant/certified-minutes
3. POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/import-from-meeting-minutes
4. GET /api/v1/tenant/certified-minutes/{certifiedMinutesId}/versions
5. GET /api/v1/tenant/certified-minutes/{certifiedMinutesId}/sections
6. PATCH /api/v1/tenant/certified-minutes-sections/{sectionId}
7. POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/submit-review
8. POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/approve
9. POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/seal
10. POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/artifacts/generate-pdf
11. GET /api/v1/tenant/certified-minutes/{certifiedMinutesId}/artifacts
12. POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/publish
13. GET /api/v1/me/certified-minutes
14. GET /api/v1/me/certified-minutes/{certifiedMinutesId}
15. GET /api/v1/me/certified-minutes/{certifiedMinutesId}/artifacts
16. GET /api/v1/me/certified-minutes-artifacts/{artifactId}/download
17. POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/revoke-publication
18. Verificar que /me ya no descarga la publicación revocada
19. GET /api/v1/public/tenants/{slug}/certified-minutes debe no existir
```

---

# 41. Comandos sugeridos

## 41.1. Comandos específicos

```bash id="z90rwz"
npm run test:certified-minutes
npm run test:certified-minutes:unit
npm run test:certified-minutes:domain
npm run test:certified-minutes:dto
npm run test:certified-minutes:application
npm run test:certified-minutes:repositories
npm run test:certified-minutes:storage
npm run test:certified-minutes:pdf
npm run test:certified-minutes:api
npm run test:certified-minutes:authorization
npm run test:certified-minutes:own-resource
npm run test:certified-minutes:audience
npm run test:certified-minutes:multitenancy
npm run test:certified-minutes:integrity
npm run test:certified-minutes:publication
npm run test:certified-minutes:notifications
npm run test:certified-minutes:audit
npm run test:certified-minutes:observability
npm run test:certified-minutes:security
npm run test:certified-minutes:openapi
npm run test:certified-minutes:performance
npm run test:certified-minutes:smoke
```

---

## 41.2. Comandos generales

```bash id="ukj5uz"
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

# 42. CI/CD gates

El pipeline debe fallar si:

```text id="nuop3s"
lint falla
typecheck falla
unit tests fallan
domain tests fallan
DTO validation tests fallan
application tests fallan
repository tests fallan
storage tests fallan
pdf tests fallan
API tests fallan
authorization tests fallan
own-resource tests fallan
audience tests fallan
multitenancy tests fallan
integrity tests fallan
publication tests fallan
notification integration tests fallan
audit tests fallan
observability tests fallan
security tests fallan
OpenAPI validation falla
OpenAPI documenta endpoints públicos prohibidos
concurrency duplicate active minutes test falla
build falla
```

---

# 43. Coverage mínimo recomendado

```text id="qmp6n3"
Unit tests: >= 85%
Application services: >= 85%
Use cases: >= 85%
Repositories críticos: >= 80%
API endpoints críticos: 100% de rutas definidas
Authorization tests: 100% de permisos críticos
Multitenancy tests: 100% de entidades tenant-scoped
Integrity tests: 100% de reglas de sellado/hash
Security tests: 100% de reglas críticas
OpenAPI tests: 100% de endpoints definidos y endpoints prohibidos
```

Regla:

```text id="e7ul61"
La cobertura numérica no reemplaza pruebas de multitenancy, inmutabilidad, audiencia, descarga segura, storage, hash, auditoría y no exposición pública.
```

---

# 44. Matriz de trazabilidad funcional

| Requisito               | Prueba principal                     |
| ----------------------- | ------------------------------------ |
| Crear acta              | API + use-case + repository          |
| Vincular reunión        | Service + multitenancy               |
| Importar MeetingMinutes | Import service + API                 |
| Crear versión           | Version service + repository         |
| Gestionar secciones     | Section service + API                |
| Enviar a revisión       | State machine + API                  |
| Aprobar acta            | Approval service + authorization     |
| Solicitar cambios       | Approval service + API               |
| Sellar acta             | Seal service + integrity tests       |
| Generar PDF             | PDF service + storage tests          |
| Subir adjuntos          | Attachment service + file validation |
| Publicar acta           | Publication service + audience tests |
| Revocar publicación     | Publication service + API            |
| Consultar acta propia   | `/me` + own-resource                 |
| Descargar PDF propio    | `/me` + storage + access log         |
| Registrar accesos       | AccessLog repository + audit         |
| Auditar operaciones     | Audit tests                          |
| Emitir notificaciones   | Notification integration             |
| No endpoints públicos   | Security + OpenAPI negative          |
| No ejecución automática | Security tests                       |

---

# 45. Riesgos cubiertos por pruebas

| Riesgo                             | Pruebas                       |
| ---------------------------------- | ----------------------------- |
| Acta cross-tenant                  | Multitenancy + repository     |
| Reunión cross-tenant               | Service + API                 |
| Source MeetingMinutes cross-tenant | Import service + API          |
| Segunda acta activa por reunión    | Repository + concurrency      |
| Edición de versión sellada         | Versioning + API              |
| Hash no reproducible               | Integrity tests               |
| Hash no cambia ante modificación   | Integrity tests               |
| PDF oficial desde borrador         | PDF + security                |
| Descarga no autorizada             | Own-resource + storage        |
| Exposición de storageKey           | DTO + security                |
| Publicación sin sellado            | Publication + API             |
| Publicación a audiencia incorrecta | Audience tests                |
| Acta no publicada visible en `/me` | Own-resource tests            |
| Publicación revocada visible       | Publication tests             |
| Publicación expirada visible       | Publication tests             |
| Logs con contenido completo        | Observability tests           |
| Auditoría con contenido completo   | Audit tests                   |
| Endpoint público accidental        | Public negative + OpenAPI     |
| Ejecución automática indebida      | Security tests                |
| Presentar hash como firma legal    | API DTO + documentation tests |

---

# 46. No aceptación

La implementación no debe aceptarse si:

```text id="dd89bs"
permite actas cross-tenant
permite versiones cross-tenant
permite secciones cross-tenant
permite aprobaciones cross-tenant
permite adjuntos cross-tenant
permite artefactos cross-tenant
permite publicaciones cross-tenant
permite usar meetingId de otro tenant
permite usar sourceMeetingMinutesId de otro tenant
permite usar votingResultId de otro tenant
permite usar meetingResolutionId de otro tenant
permite crear más de un acta activa principal por reunión
permite editar versión sellada
permite editar sección de versión sellada
permite publicar sin sellar
permite publicar sin audiencia
permite descargar PDF sin autorización
permite descargar publicación revocada
permite descargar publicación expirada
expone storageKey
expone URL firmada persistente
genera PDF oficial desde draft sin marca de borrador
no calcula hash
calcula hash no reproducible
no cambia hash ante modificación de contenido
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

# 47. Resultado esperado

Al completar este plan de pruebas, el módulo `015-certified-minutes` tendrá validación suficiente para asegurar que:

```text id="v9a8uh"
- las actas certificadas están aisladas por tenant;
- toda acta está vinculada a una reunión válida;
- no se puede usar una reunión de otro tenant;
- no se puede usar un acta preliminar de otro tenant;
- solo existe una acta activa principal por reunión;
- las versiones son incrementales y preservan historial;
- las versiones selladas son inmutables;
- las secciones se gestionan con orden y sanitización;
- el flujo draft -> underReview -> approved -> sealed -> published funciona;
- el sellado interno usa hash reproducible;
- el hash cambia ante modificación material;
- el PDF oficial se genera solo desde contenido aprobado/sellado;
- storageKey nunca se expone;
- las descargas están autorizadas y auditadas;
- las publicaciones tienen audiencia;
- /me solo muestra actas publicadas y autorizadas;
- publicaciones revocadas o expiradas no son visibles;
- no existen endpoints públicos;
- las operaciones críticas se auditan;
- las notificaciones usan payload mínimo;
- logs y métricas no filtran contenido ni IDs sensibles;
- OpenAPI refleja el contrato real;
- CI bloquea regresiones críticas.
```

---

## 48. Decisión final del plan de pruebas

El módulo `015-certified-minutes` debe probarse como un módulo documental sensible, con alta exigencia de integridad, privacidad, trazabilidad y control de publicación.

La prioridad de pruebas debe ser:

```text id="r712p3"
1. Multitenancy.
2. Inmutabilidad de versiones selladas.
3. Integridad de hash.
4. Publicación controlada.
5. Autorización por audiencia.
6. Descarga segura.
7. No exposición de storageKey.
8. No endpoints públicos.
9. Auditoría.
10. No ejecución automática.
```

Sin estas pruebas, el módulo no debe pasar a implementación productiva.
