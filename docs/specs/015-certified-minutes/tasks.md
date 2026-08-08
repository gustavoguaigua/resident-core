# Tasks — Spec 015 Certified Minutes

## 1. Información del documento

| Campo           | Valor                                                                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Proyecto        | RESIDENT Core                                                                                                                                                |
| Spec ID         | 015                                                                                                                                                          |
| Módulo          | Certified Minutes                                                                                                                                            |
| Documento       | Tasks                                                                                                                                                        |
| Ruta            | `docs/specs/015-certified-minutes/tasks.md`                                                                                                                  |
| Versión         | 0.1                                                                                                                                                          |
| Estado          | Borrador inicial                                                                                                                                             |
| Fecha           | 2026-07-21                                                                                                                                                   |
| Documento base  | `docs/specs/015-certified-minutes/spec.md`                                                                                                                   |
| Plan técnico    | `docs/specs/015-certified-minutes/plan.md`                                                                                                                   |
| Modelo de datos | `docs/specs/015-certified-minutes/data-model.md`                                                                                                             |
| Contrato API    | `docs/specs/015-certified-minutes/api-contract.md`                                                                                                           |
| Plan de pruebas | `docs/specs/015-certified-minutes/test-plan.md`                                                                                                              |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `007-audit`, `012-communications-notifications`, `013-meetings-attendance`, `014-voting-basic` |
| Relacionado con | storage seguro, PDF, hash, canonicalización, auditoría, publicaciones, firmas electrónicas futuras y sellado externo futuro                                  |

---

## 2. Propósito

Este documento convierte la especificación `015-certified-minutes` en una lista ejecutable de tareas técnicas.

El objetivo es guiar la implementación del módulo de actas certificadas internas de RESIDENT Core, incluyendo creación de actas vinculadas a reuniones, importación desde actas preliminares, versionado, secciones, revisión, aprobación, sellado interno mediante hash, generación de PDF, adjuntos, publicaciones controladas, descargas autorizadas, auditoría, notificaciones y seguridad.

Regla central:

```text id="l90elc"
Cada tarea debe preservar tenant isolation, vínculo obligatorio con reunión, versionado, inmutabilidad de versiones selladas, hash reproducible, publicación por audiencia, descarga segura, auditoría, no exposición pública y no ejecución automática de decisiones.
```

---

## 3. Convenciones

### 3.1. Estados de tarea

```text id="nadpqq"
[ ] Pendiente
[x] Completada
[-] Diferida
[!] Bloqueada
```

---

### 3.2. Criterios generales de completitud

Una tarea se considera completada solo si:

```text id="o0azvy"
- el código compila;
- los tests asociados pasan;
- todas las consultas aplican tenant_id;
- la autorización por permiso se aplica;
- la autorización por audiencia se aplica;
- la autorización por recurso propio se aplica;
- no se acepta tenantId desde body;
- no se buscan recursos solo por id;
- las versiones selladas son inmutables;
- el hash es reproducible;
- el storageKey no se expone;
- las descargas se auditan;
- no existen endpoints públicos;
- no se ejecutan resoluciones, cargos ni multas automáticamente;
- logs y métricas no filtran contenido sensible;
- OpenAPI queda actualizado;
- CI pasa.
```

---

### 3.3. Reglas para agentes IA

Antes de ejecutar estas tareas, cualquier agente IA debe leer:

```text id="p53axk"
docs/sdd/constitution.md
docs/sdd/domain-map.md
docs/sdd/architecture.md
docs/sdd/security.md
docs/sdd/api-guidelines.md
docs/sdd/data-governance.md
docs/specs/001-tenants/
docs/specs/002-users-roles/
docs/specs/003-residents-properties/
docs/specs/007-audit/
docs/specs/012-communications-notifications/
docs/specs/013-meetings-attendance/
docs/specs/014-voting-basic/
docs/specs/015-certified-minutes/spec.md
docs/specs/015-certified-minutes/plan.md
docs/specs/015-certified-minutes/data-model.md
docs/specs/015-certified-minutes/api-contract.md
docs/specs/015-certified-minutes/test-plan.md
docs/specs/015-certified-minutes/tasks.md
```

El agente no debe:

```text id="h823p4"
- aceptar tenantId desde body;
- buscar certifiedMinutes solo por id;
- buscar versions solo por id;
- buscar sections solo por id;
- buscar approvals solo por id;
- buscar attachments solo por id;
- buscar artifacts solo por id;
- buscar publications solo por id;
- permitir actas cross-tenant;
- permitir meetingId de otro tenant;
- permitir sourceMeetingMinutesId de otro tenant;
- editar versiones sealed;
- generar PDF oficial desde draft;
- publicar actas no selladas;
- descargar artefactos sin autorización;
- exponer storageKey;
- exponer URL firmada persistente;
- registrar contenido completo del acta en logs;
- registrar contenido completo del acta en auditoría;
- crear endpoints públicos;
- documentar endpoints públicos en OpenAPI;
- presentar hash como firma electrónica legal;
- ejecutar resoluciones automáticamente;
- generar cargos desde actas;
- generar multas desde actas;
- usar IA externa con actas reales.
```

---

# 4. Fase 0 — Preparación

## 4.1. Revisión documental

* [ ] T015-0001 — Revisar `docs/specs/015-certified-minutes/spec.md`.
* [ ] T015-0002 — Revisar `docs/specs/015-certified-minutes/plan.md`.
* [ ] T015-0003 — Revisar `docs/specs/015-certified-minutes/data-model.md`.
* [ ] T015-0004 — Revisar `docs/specs/015-certified-minutes/api-contract.md`.
* [ ] T015-0005 — Revisar `docs/specs/015-certified-minutes/test-plan.md`.
* [ ] T015-0006 — Confirmar dependencias con `001-tenants`.
* [ ] T015-0007 — Confirmar dependencias con `002-users-roles`.
* [ ] T015-0008 — Confirmar dependencias con `003-residents-properties`.
* [ ] T015-0009 — Confirmar dependencias con `007-audit`.
* [ ] T015-0010 — Confirmar dependencias con `012-communications-notifications`.
* [ ] T015-0011 — Confirmar dependencias con `013-meetings-attendance`.
* [ ] T015-0012 — Confirmar dependencias con `014-voting-basic`.

---

## 4.2. Validación de alcance MVP

* [ ] T015-0020 — Confirmar que el MVP incluye actas certificadas internas vinculadas a reuniones.
* [ ] T015-0021 — Confirmar que toda acta requiere `meetingId`.
* [ ] T015-0022 — Confirmar que se permite importar desde `MeetingMinutes`.
* [ ] T015-0023 — Confirmar que se implementan versiones incrementales.
* [ ] T015-0024 — Confirmar que se implementan secciones estructuradas.
* [ ] T015-0025 — Confirmar que se implementa revisión.
* [ ] T015-0026 — Confirmar que se implementa aprobación.
* [ ] T015-0027 — Confirmar que se implementa solicitud de cambios.
* [ ] T015-0028 — Confirmar que se implementa sellado interno mediante SHA-256.
* [ ] T015-0029 — Confirmar que el hash no se presenta como firma electrónica legal.
* [ ] T015-0030 — Confirmar que se implementa generación PDF formal interna.
* [ ] T015-0031 — Confirmar que PDF oficial no se genera desde `draft`.
* [ ] T015-0032 — Confirmar que se implementan adjuntos.
* [ ] T015-0033 — Confirmar que se implementa publicación controlada.
* [ ] T015-0034 — Confirmar que se implementa consulta `/me`.
* [ ] T015-0035 — Confirmar que se implementa descarga segura.
* [ ] T015-0036 — Confirmar que no habrá endpoints públicos.
* [ ] T015-0037 — Confirmar que no se ejecutan resoluciones, cargos ni multas automáticamente.
* [ ] T015-0038 — Confirmar que firma electrónica legal queda fuera del MVP.
* [ ] T015-0039 — Confirmar que sellado de tiempo externo queda fuera del MVP.
* [ ] T015-0040 — Confirmar que certificación notarial queda fuera del MVP.
* [ ] T015-0041 — Confirmar que IA con actas reales queda fuera del MVP.

---

# 5. Fase 1 — Estructura base del módulo

## 5.1. Crear estructura de carpetas

* [ ] T015-0101 — Crear carpeta `apps/api/src/modules/certified-minutes/`.
* [ ] T015-0102 — Crear `certified-minutes.module.ts`.
* [ ] T015-0103 — Crear carpeta `controllers/`.
* [ ] T015-0104 — Crear carpeta `application/use-cases/`.
* [ ] T015-0105 — Crear carpeta `application/services/`.
* [ ] T015-0106 — Crear carpeta `application/ports/`.
* [ ] T015-0107 — Crear carpeta `domain/entities/`.
* [ ] T015-0108 — Crear carpeta `domain/value-objects/`.
* [ ] T015-0109 — Crear carpeta `domain/events/`.
* [ ] T015-0110 — Crear carpeta `domain/errors/`.
* [ ] T015-0111 — Crear carpeta `infrastructure/persistence/`.
* [ ] T015-0112 — Crear carpeta `infrastructure/storage/`.
* [ ] T015-0113 — Crear carpeta `infrastructure/pdf/`.
* [ ] T015-0114 — Crear carpeta `infrastructure/hash/`.
* [ ] T015-0115 — Crear carpeta `infrastructure/integrations/`.
* [ ] T015-0116 — Crear carpeta `infrastructure/audit/`.
* [ ] T015-0117 — Crear carpeta `dto/`.
* [ ] T015-0118 — Crear carpeta `guards/`.
* [ ] T015-0119 — Crear carpeta `policies/`.
* [ ] T015-0120 — Crear carpeta `mappers/`.
* [ ] T015-0121 — Crear carpeta `tests/`.

---

## 5.2. Registrar módulo

* [ ] T015-0130 — Registrar `CertifiedMinutesModule` en el módulo principal de la API.
* [ ] T015-0131 — Inyectar Prisma.
* [ ] T015-0132 — Inyectar puerto de auditoría.
* [ ] T015-0133 — Inyectar puerto de notificaciones.
* [ ] T015-0134 — Inyectar puerto de reuniones.
* [ ] T015-0135 — Inyectar puerto de actas preliminares.
* [ ] T015-0136 — Inyectar puerto de asistencia.
* [ ] T015-0137 — Inyectar puerto de quórum.
* [ ] T015-0138 — Inyectar puerto de resoluciones.
* [ ] T015-0139 — Inyectar puerto de votaciones.
* [ ] T015-0140 — Inyectar puerto de usuarios.
* [ ] T015-0141 — Inyectar puerto de personas.
* [ ] T015-0142 — Inyectar puerto de unidades habitacionales.
* [ ] T015-0143 — Inyectar puerto de roles.
* [ ] T015-0144 — Inyectar puerto de storage.
* [ ] T015-0145 — Inyectar puerto de PDF.
* [ ] T015-0146 — Inyectar puerto de hash.
* [ ] T015-0147 — Validar que el módulo compila vacío.
* [ ] T015-0148 — Crear smoke test de carga del módulo.

---

# 6. Fase 2 — Enums y Value Objects

## 6.1. Enums de dominio

* [ ] T015-0201 — Implementar `CertifiedMinutesStatus`.
* [ ] T015-0202 — Implementar `CertifiedMinutesVersionStatus`.
* [ ] T015-0203 — Implementar `CertifiedMinutesVisibility`.
* [ ] T015-0204 — Implementar `CertificationMode`.
* [ ] T015-0205 — Implementar `MinutesSectionType`.
* [ ] T015-0206 — Implementar `ApprovalDecision`.
* [ ] T015-0207 — Implementar `CertifiedMinutesAttachmentType`.
* [ ] T015-0208 — Implementar `CertifiedMinutesAttachmentStatus`.
* [ ] T015-0209 — Implementar `CertifiedMinutesArtifactType`.
* [ ] T015-0210 — Implementar `CertifiedMinutesArtifactStatus`.
* [ ] T015-0211 — Implementar `CertifiedMinutesPublicationStatus`.
* [ ] T015-0212 — Implementar `CertifiedMinutesAudienceType`.
* [ ] T015-0213 — Implementar `CertifiedMinutesAccessType`.
* [ ] T015-0214 — Implementar `CertifiedMinutesAccessOutcome`.
* [ ] T015-0215 — Implementar `HashAlgorithm`.

---

## 6.2. Value Objects

* [ ] T015-0220 — Implementar `CertifiedMinutesTitle`.
* [ ] T015-0221 — Implementar `CertifiedMinutesCode`.
* [ ] T015-0222 — Implementar `MinutesVersionNumber`.
* [ ] T015-0223 — Implementar `MinutesSectionOrder`.
* [ ] T015-0224 — Implementar `MinutesSectionTitle`.
* [ ] T015-0225 — Implementar `MinutesSectionContent`.
* [ ] T015-0226 — Implementar `MinutesApprovalComments`.
* [ ] T015-0227 — Implementar `MinutesChangeReason`.
* [ ] T015-0228 — Implementar `MinutesCancellationReason`.
* [ ] T015-0229 — Implementar `MinutesRevocationReason`.
* [ ] T015-0230 — Implementar `MinutesSealHash`.
* [ ] T015-0231 — Implementar `MinutesArtifactHash`.
* [ ] T015-0232 — Implementar `MinutesHashAlgorithm`.
* [ ] T015-0233 — Implementar `MinutesStorageKey`.
* [ ] T015-0234 — Implementar `MinutesFileName`.
* [ ] T015-0235 — Implementar `MinutesMimeType`.
* [ ] T015-0236 — Implementar `MinutesFileSize`.
* [ ] T015-0237 — Implementar `MinutesAudienceRule`.
* [ ] T015-0238 — Implementar `MinutesPublicationWindow`.

---

## 6.3. Sanitización de contenido

* [ ] T015-0250 — Implementar sanitización de título.
* [ ] T015-0251 — Implementar sanitización de resumen.
* [ ] T015-0252 — Implementar sanitización de secciones.
* [ ] T015-0253 — Implementar sanitización de comentarios.
* [ ] T015-0254 — Implementar sanitización de razones de cambio.
* [ ] T015-0255 — Implementar sanitización de razones de revocación.
* [ ] T015-0256 — Bloquear `<script>`.
* [ ] T015-0257 — Bloquear `<iframe>`.
* [ ] T015-0258 — Bloquear `<object>`.
* [ ] T015-0259 — Bloquear `<embed>`.
* [ ] T015-0260 — Bloquear event handlers inline.
* [ ] T015-0261 — Bloquear `javascript:`.
* [ ] T015-0262 — Bloquear `data:` peligrosos.
* [ ] T015-0263 — Bloquear HTML no permitido.
* [ ] T015-0264 — Bloquear payloads JSON arbitrarios no validados.

---

## 6.4. Tests de enums y value objects

* [ ] T015-0280 — Test `CertifiedMinutesStatus`.
* [ ] T015-0281 — Test `CertifiedMinutesVersionStatus`.
* [ ] T015-0282 — Test `CertifiedMinutesVisibility`.
* [ ] T015-0283 — Test `CertificationMode`.
* [ ] T015-0284 — Test `MinutesSectionType`.
* [ ] T015-0285 — Test `ApprovalDecision`.
* [ ] T015-0286 — Test `CertifiedMinutesAttachmentType`.
* [ ] T015-0287 — Test `CertifiedMinutesArtifactType`.
* [ ] T015-0288 — Test `CertifiedMinutesPublicationStatus`.
* [ ] T015-0289 — Test `CertifiedMinutesAudienceType`.
* [ ] T015-0290 — Test `CertifiedMinutesTitle`.
* [ ] T015-0291 — Test `CertifiedMinutesCode`.
* [ ] T015-0292 — Test `MinutesVersionNumber`.
* [ ] T015-0293 — Test `MinutesSectionContent`.
* [ ] T015-0294 — Test `MinutesSealHash`.
* [ ] T015-0295 — Test `MinutesHashAlgorithm`.
* [ ] T015-0296 — Test `MinutesPublicationWindow`.
* [ ] T015-0297 — Ejecutar `npm run test:certified-minutes:unit`.

---

# 7. Fase 3 — Entidades de dominio

## 7.1. Entidad `CertifiedMinutes`

* [ ] T015-0301 — Crear `certified-minutes.entity.ts`.
* [ ] T015-0302 — Implementar creación en estado `draft`.
* [ ] T015-0303 — Validar `tenantId`.
* [ ] T015-0304 — Validar `meetingId` obligatorio.
* [ ] T015-0305 — Validar `title`.
* [ ] T015-0306 — Validar `code`.
* [ ] T015-0307 — Validar `visibility`.
* [ ] T015-0308 — Validar `certificationMode`.
* [ ] T015-0309 — Implementar transición `draft -> underReview`.
* [ ] T015-0310 — Implementar transición `underReview -> changesRequested`.
* [ ] T015-0311 — Implementar transición `changesRequested -> draft`.
* [ ] T015-0312 — Implementar transición `underReview -> approved`.
* [ ] T015-0313 — Implementar transición `approved -> sealed`.
* [ ] T015-0314 — Implementar transición `sealed -> published`.
* [ ] T015-0315 — Implementar transición `published -> superseded`.
* [ ] T015-0316 — Implementar transición `published -> archived`.
* [ ] T015-0317 — Implementar transición `draft -> cancelled`.
* [ ] T015-0318 — Implementar transición `underReview -> cancelled`.
* [ ] T015-0319 — Implementar transición `changesRequested -> cancelled`.
* [ ] T015-0320 — Implementar archivo lógico.
* [ ] T015-0321 — Implementar cancelación con razón.
* [ ] T015-0322 — Implementar registro de `currentVersionId`.
* [ ] T015-0323 — Implementar registro de `approvedVersionId`.
* [ ] T015-0324 — Implementar registro de `sealedVersionId`.
* [ ] T015-0325 — Implementar registro de `publishedVersionId`.
* [ ] T015-0326 — Crear tests de entidad `CertifiedMinutes`.

---

## 7.2. Entidad `CertifiedMinutesVersion`

* [ ] T015-0340 — Crear `certified-minutes-version.entity.ts`.
* [ ] T015-0341 — Implementar creación de versión inicial.
* [ ] T015-0342 — Implementar creación de versión incremental.
* [ ] T015-0343 — Validar `versionNumber`.
* [ ] T015-0344 — Validar `title`.
* [ ] T015-0345 — Validar `contentSnapshot`.
* [ ] T015-0346 — Validar `changeReason` para versiones posteriores.
* [ ] T015-0347 — Implementar `draft -> underReview`.
* [ ] T015-0348 — Implementar `underReview -> approved`.
* [ ] T015-0349 — Implementar `underReview -> draft`.
* [ ] T015-0350 — Implementar `approved -> sealed`.
* [ ] T015-0351 — Implementar `sealed -> superseded`.
* [ ] T015-0352 — Implementar archivo lógico.
* [ ] T015-0353 — Impedir edición de versión `sealed`.
* [ ] T015-0354 — Crear tests de entidad `CertifiedMinutesVersion`.

---

## 7.3. Entidad `CertifiedMinutesSection`

* [ ] T015-0360 — Crear `certified-minutes-section.entity.ts`.
* [ ] T015-0361 — Implementar sección `header`.
* [ ] T015-0362 — Implementar sección `meetingInfo`.
* [ ] T015-0363 — Implementar sección `callNotice`.
* [ ] T015-0364 — Implementar sección `attendance`.
* [ ] T015-0365 — Implementar sección `quorum`.
* [ ] T015-0366 — Implementar sección `agenda`.
* [ ] T015-0367 — Implementar sección `discussion`.
* [ ] T015-0368 — Implementar sección `voting`.
* [ ] T015-0369 — Implementar sección `resolutions`.
* [ ] T015-0370 — Implementar sección `agreements`.
* [ ] T015-0371 — Implementar sección `observations`.
* [ ] T015-0372 — Implementar sección `closure`.
* [ ] T015-0373 — Implementar sección `attachments`.
* [ ] T015-0374 — Implementar sección `custom`.
* [ ] T015-0375 — Validar `order`.
* [ ] T015-0376 — Validar `title`.
* [ ] T015-0377 — Validar `body`.
* [ ] T015-0378 — Sanitizar `body`.
* [ ] T015-0379 — Validar `sourceType`.
* [ ] T015-0380 — Validar `sourceId`.
* [ ] T015-0381 — Implementar actualización en versión editable.
* [ ] T015-0382 — Impedir actualización en versión `sealed`.
* [ ] T015-0383 — Implementar archivo lógico.
* [ ] T015-0384 — Crear tests de entidad `CertifiedMinutesSection`.

---

## 7.4. Entidad `CertifiedMinutesApproval`

* [ ] T015-0390 — Crear `certified-minutes-approval.entity.ts`.
* [ ] T015-0391 — Implementar decisión `approved`.
* [ ] T015-0392 — Implementar decisión `rejected`.
* [ ] T015-0393 — Implementar decisión `changesRequested`.
* [ ] T015-0394 — Implementar decisión `commented`.
* [ ] T015-0395 — Validar `approverUserId`.
* [ ] T015-0396 — Validar `approverRole`.
* [ ] T015-0397 — Validar `comments`.
* [ ] T015-0398 — Requerir `comments` para `rejected`.
* [ ] T015-0399 — Requerir `comments` para `changesRequested`.
* [ ] T015-0400 — Validar `decidedAt`.
* [ ] T015-0401 — Impedir interpretación como firma electrónica legal.
* [ ] T015-0402 — Crear tests de entidad `CertifiedMinutesApproval`.

---

## 7.5. Entidad `CertifiedMinutesAttachment`

* [ ] T015-0410 — Crear `certified-minutes-attachment.entity.ts`.
* [ ] T015-0411 — Implementar adjunto `pdf`.
* [ ] T015-0412 — Implementar adjunto `image`.
* [ ] T015-0413 — Implementar adjunto `docx`.
* [ ] T015-0414 — Implementar adjunto `xlsx`.
* [ ] T015-0415 — Validar `fileName`.
* [ ] T015-0416 — Validar `mimeType`.
* [ ] T015-0417 — Validar `fileSize > 0`.
* [ ] T015-0418 — Validar `storageKey` interno.
* [ ] T015-0419 — Validar `fileHash`.
* [ ] T015-0420 — Validar `hashAlgorithm`.
* [ ] T015-0421 — Implementar estado `uploaded`.
* [ ] T015-0422 — Implementar estado `available`.
* [ ] T015-0423 — Implementar estado `quarantined`.
* [ ] T015-0424 — Implementar estado `rejected`.
* [ ] T015-0425 — Implementar estado `archived`.
* [ ] T015-0426 — Implementar archivo lógico.
* [ ] T015-0427 — Crear tests de entidad `CertifiedMinutesAttachment`.

---

## 7.6. Entidad `CertifiedMinutesArtifact`

* [ ] T015-0430 — Crear `certified-minutes-artifact.entity.ts`.
* [ ] T015-0431 — Implementar artefacto `pdf`.
* [ ] T015-0432 — Implementar artefacto `draftPdf`.
* [ ] T015-0433 — Implementar artefacto `htmlSnapshot`.
* [ ] T015-0434 — Implementar artefacto `jsonSnapshot`.
* [ ] T015-0435 — Implementar artefacto `hashManifest`.
* [ ] T015-0436 — Implementar estado `pending`.
* [ ] T015-0437 — Implementar estado `generated`.
* [ ] T015-0438 — Implementar estado `failed`.
* [ ] T015-0439 — Implementar estado `archived`.
* [ ] T015-0440 — Validar que `generated` requiere `storageKey`.
* [ ] T015-0441 — Validar que `generated` requiere `artifactHash`.
* [ ] T015-0442 — Validar `fileSize > 0`.
* [ ] T015-0443 — Validar `isOfficial`.
* [ ] T015-0444 — Impedir PDF oficial desde versión `draft`.
* [ ] T015-0445 — Implementar archivo lógico.
* [ ] T015-0446 — Crear tests de entidad `CertifiedMinutesArtifact`.

---

## 7.7. Entidad `CertifiedMinutesPublication`

* [ ] T015-0450 — Crear `certified-minutes-publication.entity.ts`.
* [ ] T015-0451 — Implementar publicación `draft`.
* [ ] T015-0452 — Implementar publicación `published`.
* [ ] T015-0453 — Implementar publicación `expired`.
* [ ] T015-0454 — Implementar publicación `revoked`.
* [ ] T015-0455 — Implementar publicación `archived`.
* [ ] T015-0456 — Validar `audienceType`.
* [ ] T015-0457 — Validar `audienceRules`.
* [ ] T015-0458 — Requerir `audienceRules` para `mixed`.
* [ ] T015-0459 — Requerir `audienceRules` para `restricted`.
* [ ] T015-0460 — Requerir `audienceRules` para `propertyUnits`.
* [ ] T015-0461 — Requerir `audienceRules` para `specificUsers`.
* [ ] T015-0462 — Requerir `audienceRules` para `roles`.
* [ ] T015-0463 — Validar `expiresAt`.
* [ ] T015-0464 — Implementar revocación con razón.
* [ ] T015-0465 — Implementar archivo lógico.
* [ ] T015-0466 — Crear tests de entidad `CertifiedMinutesPublication`.

---

## 7.8. Entidad `CertifiedMinutesAccessLog`

* [ ] T015-0470 — Crear `certified-minutes-access-log.entity.ts`.
* [ ] T015-0471 — Implementar acceso `view`.
* [ ] T015-0472 — Implementar acceso `download`.
* [ ] T015-0473 — Implementar acceso `export`.
* [ ] T015-0474 — Implementar acceso `print`.
* [ ] T015-0475 — Implementar outcome `allowed`.
* [ ] T015-0476 — Implementar outcome `denied`.
* [ ] T015-0477 — Implementar outcome `notFound`.
* [ ] T015-0478 — Implementar outcome `expired`.
* [ ] T015-0479 — Implementar outcome `revoked`.
* [ ] T015-0480 — Implementar outcome `error`.
* [ ] T015-0481 — Validar `ipAddressHash`.
* [ ] T015-0482 — Validar `userAgentHash`.
* [ ] T015-0483 — Impedir metadata con `storageKey`.
* [ ] T015-0484 — Impedir metadata con URL firmada.
* [ ] T015-0485 — Impedir metadata con contenido completo.
* [ ] T015-0486 — Crear tests de entidad `CertifiedMinutesAccessLog`.

---

# 8. Fase 4 — Prisma y migraciones

## 8.1. Enums Prisma

* [ ] T015-0501 — Agregar enum `CertifiedMinutesStatus`.
* [ ] T015-0502 — Agregar enum `CertifiedMinutesVersionStatus`.
* [ ] T015-0503 — Agregar enum `CertifiedMinutesVisibility`.
* [ ] T015-0504 — Agregar enum `CertificationMode`.
* [ ] T015-0505 — Agregar enum `MinutesSectionType`.
* [ ] T015-0506 — Agregar enum `ApprovalDecision`.
* [ ] T015-0507 — Agregar enum `CertifiedMinutesAttachmentType`.
* [ ] T015-0508 — Agregar enum `CertifiedMinutesAttachmentStatus`.
* [ ] T015-0509 — Agregar enum `CertifiedMinutesArtifactType`.
* [ ] T015-0510 — Agregar enum `CertifiedMinutesArtifactStatus`.
* [ ] T015-0511 — Agregar enum `CertifiedMinutesPublicationStatus`.
* [ ] T015-0512 — Agregar enum `CertifiedMinutesAudienceType`.
* [ ] T015-0513 — Agregar enum `CertifiedMinutesAccessType`.
* [ ] T015-0514 — Agregar enum `CertifiedMinutesAccessOutcome`.
* [ ] T015-0515 — Agregar enum `HashAlgorithm`.

---

## 8.2. Modelos Prisma

* [ ] T015-0520 — Crear modelo `CertifiedMinutes`.
* [ ] T015-0521 — Crear modelo `CertifiedMinutesVersion`.
* [ ] T015-0522 — Crear modelo `CertifiedMinutesSection`.
* [ ] T015-0523 — Crear modelo `CertifiedMinutesApproval`.
* [ ] T015-0524 — Crear modelo `CertifiedMinutesAttachment`.
* [ ] T015-0525 — Crear modelo `CertifiedMinutesArtifact`.
* [ ] T015-0526 — Crear modelo `CertifiedMinutesPublication`.
* [ ] T015-0527 — Crear modelo `CertifiedMinutesAccessLog`.
* [ ] T015-0528 — Agregar relaciones en `Tenant`.
* [ ] T015-0529 — Agregar relaciones en `UserProfile`.
* [ ] T015-0530 — Agregar relaciones en `Meeting`.
* [ ] T015-0531 — Agregar relaciones en `MeetingMinutes`.
* [ ] T015-0532 — Ajustar nombres reales de modelos según implementación final de `013-meetings-attendance`.
* [ ] T015-0533 — Ajustar nombres reales de roles según implementación final de `002-users-roles`.

---

## 8.3. Índices y constraints

* [ ] T015-0540 — Crear índices de `certified_minutes`.
* [ ] T015-0541 — Crear índices de `certified_minutes_versions`.
* [ ] T015-0542 — Crear índice único `(tenant_id, certified_minutes_id, version_number)`.
* [ ] T015-0543 — Crear índices de `certified_minutes_sections`.
* [ ] T015-0544 — Crear índice único `(tenant_id, version_id, order)`.
* [ ] T015-0545 — Crear índices de `certified_minutes_approvals`.
* [ ] T015-0546 — Crear índices de `certified_minutes_attachments`.
* [ ] T015-0547 — Crear constraint `file_size > 0` en adjuntos.
* [ ] T015-0548 — Crear índices de `certified_minutes_artifacts`.
* [ ] T015-0549 — Crear constraint `file_size IS NULL OR file_size > 0` en artefactos.
* [ ] T015-0550 — Crear índices de `certified_minutes_publications`.
* [ ] T015-0551 — Crear constraint `expires_at > published_at` cuando ambos existen.
* [ ] T015-0552 — Crear índices de `certified_minutes_access_logs`.
* [ ] T015-0553 — Crear índice parcial para una acta activa por reunión.
* [ ] T015-0554 — Crear índice parcial para código activo único por tenant.
* [ ] T015-0555 — Crear índice parcial para publicación activa por acta, versión y audiencia.
* [ ] T015-0556 — Crear índice parcial para PDF oficial activo por versión.
* [ ] T015-0557 — Documentar constraints que se implementan en servicio por dependencia de estado.

---

## 8.4. Migración

* [ ] T015-0570 — Crear migración `015_create_certified_minutes`.
* [ ] T015-0571 — Ejecutar migración en base local.
* [ ] T015-0572 — Ejecutar migración en base de test.
* [ ] T015-0573 — Generar Prisma Client.
* [ ] T015-0574 — Validar constraints raw.
* [ ] T015-0575 — Validar rollback local si aplica.
* [ ] T015-0576 — Documentar índices parciales raw.
* [ ] T015-0577 — Ejecutar tests iniciales de repositorio.

---

# 9. Fase 5 — Puertos y repositorios

## 9.1. Puertos de aplicación

* [ ] T015-0601 — Crear `CertifiedMinutesRepositoryPort`.
* [ ] T015-0602 — Crear `CertifiedMinutesVersionRepositoryPort`.
* [ ] T015-0603 — Crear `CertifiedMinutesSectionRepositoryPort`.
* [ ] T015-0604 — Crear `CertifiedMinutesApprovalRepositoryPort`.
* [ ] T015-0605 — Crear `CertifiedMinutesAttachmentRepositoryPort`.
* [ ] T015-0606 — Crear `CertifiedMinutesArtifactRepositoryPort`.
* [ ] T015-0607 — Crear `CertifiedMinutesPublicationRepositoryPort`.
* [ ] T015-0608 — Crear `CertifiedMinutesAccessLogRepositoryPort`.
* [ ] T015-0609 — Crear `CertifiedMinutesMeetingPort`.
* [ ] T015-0610 — Crear `CertifiedMinutesMeetingMinutesPort`.
* [ ] T015-0611 — Crear `CertifiedMinutesAttendancePort`.
* [ ] T015-0612 — Crear `CertifiedMinutesQuorumPort`.
* [ ] T015-0613 — Crear `CertifiedMinutesResolutionPort`.
* [ ] T015-0614 — Crear `CertifiedMinutesVotingPort`.
* [ ] T015-0615 — Crear `CertifiedMinutesUserDirectoryPort`.
* [ ] T015-0616 — Crear `CertifiedMinutesPersonDirectoryPort`.
* [ ] T015-0617 — Crear `CertifiedMinutesPropertyUnitPort`.
* [ ] T015-0618 — Crear `CertifiedMinutesRoleDirectoryPort`.
* [ ] T015-0619 — Crear `CertifiedMinutesStoragePort`.
* [ ] T015-0620 — Crear `CertifiedMinutesPdfGeneratorPort`.
* [ ] T015-0621 — Crear `CertifiedMinutesHashPort`.
* [ ] T015-0622 — Crear `CertifiedMinutesNotificationPort`.
* [ ] T015-0623 — Crear `CertifiedMinutesAuditPort`.

---

## 9.2. Repositorios Prisma

* [ ] T015-0630 — Implementar `PrismaCertifiedMinutesRepository`.
* [ ] T015-0631 — Implementar `PrismaCertifiedMinutesVersionRepository`.
* [ ] T015-0632 — Implementar `PrismaCertifiedMinutesSectionRepository`.
* [ ] T015-0633 — Implementar `PrismaCertifiedMinutesApprovalRepository`.
* [ ] T015-0634 — Implementar `PrismaCertifiedMinutesAttachmentRepository`.
* [ ] T015-0635 — Implementar `PrismaCertifiedMinutesArtifactRepository`.
* [ ] T015-0636 — Implementar `PrismaCertifiedMinutesPublicationRepository`.
* [ ] T015-0637 — Implementar `PrismaCertifiedMinutesAccessLogRepository`.
* [ ] T015-0638 — Implementar mappers de persistencia.
* [ ] T015-0639 — Validar que ningún repositorio busque recursos solo por `id`.
* [ ] T015-0640 — Validar que toda consulta use `tenantId`.

---

## 9.3. Adapters de integración

* [ ] T015-0650 — Implementar `CertifiedMinutesMeetingAdapter`.
* [ ] T015-0651 — Implementar `CertifiedMinutesMeetingMinutesAdapter`.
* [ ] T015-0652 — Implementar `CertifiedMinutesAttendanceAdapter`.
* [ ] T015-0653 — Implementar `CertifiedMinutesQuorumAdapter`.
* [ ] T015-0654 — Implementar `CertifiedMinutesResolutionAdapter`.
* [ ] T015-0655 — Implementar `CertifiedMinutesVotingAdapter`.
* [ ] T015-0656 — Implementar `CertifiedMinutesUserDirectoryAdapter`.
* [ ] T015-0657 — Implementar `CertifiedMinutesPersonDirectoryAdapter`.
* [ ] T015-0658 — Implementar `CertifiedMinutesPropertyUnitAdapter`.
* [ ] T015-0659 — Implementar `CertifiedMinutesRoleDirectoryAdapter`.
* [ ] T015-0660 — Implementar `CertifiedMinutesNotificationAdapter`.
* [ ] T015-0661 — Implementar `CertifiedMinutesAuditAdapter`.

---

## 9.4. Storage, PDF y hash adapters

* [ ] T015-0670 — Implementar `CertifiedMinutesStorageAdapter` local para desarrollo.
* [ ] T015-0671 — Implementar `CertifiedMinutesStorageAdapter` mock para tests.
* [ ] T015-0672 — Preparar interfaz para storage S3-compatible.
* [ ] T015-0673 — Implementar `CertifiedMinutesPdfGeneratorAdapter`.
* [ ] T015-0674 — Implementar `CertifiedMinutesHashAdapter`.
* [ ] T015-0675 — Validar que storage no expone `storageKey`.
* [ ] T015-0676 — Validar que PDF generator no incluye datos prohibidos.
* [ ] T015-0677 — Validar que hash usa SHA-256.

---

## 9.5. Tests de repositorio

* [ ] T015-0680 — Test crear `CertifiedMinutes`.
* [ ] T015-0681 — Test buscar `CertifiedMinutes` por tenant.
* [ ] T015-0682 — Test tenant A no ve `CertifiedMinutes` tenant B.
* [ ] T015-0683 — Test segunda acta activa por reunión se rechaza.
* [ ] T015-0684 — Test crear `CertifiedMinutesVersion`.
* [ ] T015-0685 — Test versionNumber único por acta.
* [ ] T015-0686 — Test crear `CertifiedMinutesSection`.
* [ ] T015-0687 — Test order único por versión.
* [ ] T015-0688 — Test crear `CertifiedMinutesApproval`.
* [ ] T015-0689 — Test crear `CertifiedMinutesAttachment`.
* [ ] T015-0690 — Test crear `CertifiedMinutesArtifact`.
* [ ] T015-0691 — Test PDF oficial único por versión.
* [ ] T015-0692 — Test crear `CertifiedMinutesPublication`.
* [ ] T015-0693 — Test publicación activa única por audiencia.
* [ ] T015-0694 — Test crear `CertifiedMinutesAccessLog`.
* [ ] T015-0695 — Ejecutar `npm run test:certified-minutes:repositories`.

---

# 10. Fase 6 — Servicios de aplicación

## 10.1. Servicios base

* [ ] T015-0701 — Implementar `CertifiedMinutesService`.
* [ ] T015-0702 — Implementar `CertifiedMinutesStateMachineService`.
* [ ] T015-0703 — Implementar `CertifiedMinutesImportService`.
* [ ] T015-0704 — Implementar `CertifiedMinutesVersionService`.
* [ ] T015-0705 — Implementar `CertifiedMinutesSectionService`.
* [ ] T015-0706 — Implementar `CertifiedMinutesApprovalService`.
* [ ] T015-0707 — Implementar `CertifiedMinutesSealService`.
* [ ] T015-0708 — Implementar `CertifiedMinutesCanonicalizationService`.
* [ ] T015-0709 — Implementar `CertifiedMinutesPdfService`.
* [ ] T015-0710 — Implementar `CertifiedMinutesArtifactService`.
* [ ] T015-0711 — Implementar `CertifiedMinutesAttachmentService`.
* [ ] T015-0712 — Implementar `CertifiedMinutesPublicationService`.
* [ ] T015-0713 — Implementar `CertifiedMinutesAudienceService`.
* [ ] T015-0714 — Implementar `CertifiedMinutesAccessService`.
* [ ] T015-0715 — Implementar `CertifiedMinutesNotificationService`.
* [ ] T015-0716 — Implementar `CertifiedMinutesAuditService`.
* [ ] T015-0717 — Implementar `CertifiedMinutesContentSanitizerService`.

---

## 10.2. Tests de servicios

* [ ] T015-0730 — Test `CertifiedMinutesService`.
* [ ] T015-0731 — Test `CertifiedMinutesStateMachineService`.
* [ ] T015-0732 — Test `CertifiedMinutesImportService`.
* [ ] T015-0733 — Test `CertifiedMinutesVersionService`.
* [ ] T015-0734 — Test `CertifiedMinutesSectionService`.
* [ ] T015-0735 — Test `CertifiedMinutesApprovalService`.
* [ ] T015-0736 — Test `CertifiedMinutesSealService`.
* [ ] T015-0737 — Test `CertifiedMinutesCanonicalizationService`.
* [ ] T015-0738 — Test `CertifiedMinutesPdfService`.
* [ ] T015-0739 — Test `CertifiedMinutesArtifactService`.
* [ ] T015-0740 — Test `CertifiedMinutesAttachmentService`.
* [ ] T015-0741 — Test `CertifiedMinutesPublicationService`.
* [ ] T015-0742 — Test `CertifiedMinutesAudienceService`.
* [ ] T015-0743 — Test `CertifiedMinutesAccessService`.
* [ ] T015-0744 — Test `CertifiedMinutesNotificationService`.
* [ ] T015-0745 — Test `CertifiedMinutesAuditService`.
* [ ] T015-0746 — Test `CertifiedMinutesContentSanitizerService`.
* [ ] T015-0747 — Ejecutar `npm run test:certified-minutes:application`.

---

# 11. Fase 7 — Casos de uso

## 11.1. Certified Minutes

* [ ] T015-0801 — Implementar `CreateCertifiedMinutesUseCase`.
* [ ] T015-0802 — Implementar `ListCertifiedMinutesUseCase`.
* [ ] T015-0803 — Implementar `GetCertifiedMinutesUseCase`.
* [ ] T015-0804 — Implementar `UpdateCertifiedMinutesUseCase`.
* [ ] T015-0805 — Implementar `ImportCertifiedMinutesFromMeetingMinutesUseCase`.
* [ ] T015-0806 — Implementar `SubmitCertifiedMinutesReviewUseCase`.
* [ ] T015-0807 — Implementar `ApproveCertifiedMinutesUseCase`.
* [ ] T015-0808 — Implementar `RejectCertifiedMinutesUseCase`.
* [ ] T015-0809 — Implementar `RequestCertifiedMinutesChangesUseCase`.
* [ ] T015-0810 — Implementar `SealCertifiedMinutesUseCase`.
* [ ] T015-0811 — Implementar `PublishCertifiedMinutesUseCase`.
* [ ] T015-0812 — Implementar `RevokeCertifiedMinutesPublicationUseCase`.
* [ ] T015-0813 — Implementar `ArchiveCertifiedMinutesUseCase`.

---

## 11.2. Versions

* [ ] T015-0820 — Implementar `ListCertifiedMinutesVersionsUseCase`.
* [ ] T015-0821 — Implementar `CreateCertifiedMinutesVersionUseCase`.
* [ ] T015-0822 — Implementar `GetCertifiedMinutesVersionUseCase`.
* [ ] T015-0823 — Implementar `ArchiveCertifiedMinutesVersionUseCase`.
* [ ] T015-0824 — Implementar `CompareCertifiedMinutesVersionsUseCase`.

---

## 11.3. Sections

* [ ] T015-0840 — Implementar `ListCertifiedMinutesSectionsUseCase`.
* [ ] T015-0841 — Implementar `CreateCertifiedMinutesSectionUseCase`.
* [ ] T015-0842 — Implementar `GetCertifiedMinutesSectionUseCase`.
* [ ] T015-0843 — Implementar `UpdateCertifiedMinutesSectionUseCase`.
* [ ] T015-0844 — Implementar `ReorderCertifiedMinutesSectionsUseCase`.
* [ ] T015-0845 — Implementar `ArchiveCertifiedMinutesSectionUseCase`.

---

## 11.4. Approvals

* [ ] T015-0860 — Implementar `ListCertifiedMinutesApprovalsUseCase`.
* [ ] T015-0861 — Implementar `CreateCertifiedMinutesApprovalUseCase`.
* [ ] T015-0862 — Implementar `GetCertifiedMinutesApprovalUseCase`.

---

## 11.5. Attachments

* [ ] T015-0880 — Implementar `ListCertifiedMinutesAttachmentsUseCase`.
* [ ] T015-0881 — Implementar `UploadCertifiedMinutesAttachmentUseCase`.
* [ ] T015-0882 — Implementar `GetCertifiedMinutesAttachmentUseCase`.
* [ ] T015-0883 — Implementar `DownloadCertifiedMinutesAttachmentUseCase`.
* [ ] T015-0884 — Implementar `ArchiveCertifiedMinutesAttachmentUseCase`.

---

## 11.6. Artifacts

* [ ] T015-0900 — Implementar `ListCertifiedMinutesArtifactsUseCase`.
* [ ] T015-0901 — Implementar `GenerateCertifiedMinutesPdfUseCase`.
* [ ] T015-0902 — Implementar `GetCertifiedMinutesArtifactUseCase`.
* [ ] T015-0903 — Implementar `DownloadCertifiedMinutesArtifactUseCase`.
* [ ] T015-0904 — Implementar `ArchiveCertifiedMinutesArtifactUseCase`.

---

## 11.7. Publications

* [ ] T015-0920 — Implementar `ListCertifiedMinutesPublicationsUseCase`.
* [ ] T015-0921 — Implementar `GetCertifiedMinutesPublicationUseCase`.
* [ ] T015-0922 — Implementar `RevokeCertifiedMinutesPublicationDirectUseCase`.
* [ ] T015-0923 — Implementar `ArchiveCertifiedMinutesPublicationUseCase`.

---

## 11.8. Endpoints `/me`

* [ ] T015-0940 — Implementar `ListOwnCertifiedMinutesUseCase`.
* [ ] T015-0941 — Implementar `GetOwnCertifiedMinutesUseCase`.
* [ ] T015-0942 — Implementar `ListOwnCertifiedMinutesArtifactsUseCase`.
* [ ] T015-0943 — Implementar `DownloadOwnCertifiedMinutesArtifactUseCase`.

---

# 12. Fase 8 — DTOs

## 12.1. DTOs de Certified Minutes

* [ ] T015-1001 — Crear `CreateCertifiedMinutesDto`.
* [ ] T015-1002 — Crear `UpdateCertifiedMinutesDto`.
* [ ] T015-1003 — Crear `ImportFromMeetingMinutesDto`.
* [ ] T015-1004 — Crear `SubmitCertifiedMinutesReviewDto`.
* [ ] T015-1005 — Crear `ApproveCertifiedMinutesDto`.
* [ ] T015-1006 — Crear `RejectCertifiedMinutesDto`.
* [ ] T015-1007 — Crear `RequestCertifiedMinutesChangesDto`.
* [ ] T015-1008 — Crear `SealCertifiedMinutesDto`.
* [ ] T015-1009 — Crear `PublishCertifiedMinutesDto`.
* [ ] T015-1010 — Crear `RevokeCertifiedMinutesPublicationDto`.
* [ ] T015-1011 — Crear `ArchiveCertifiedMinutesDto`.
* [ ] T015-1012 — Crear `CertifiedMinutesAdminDto`.
* [ ] T015-1013 — Crear `CertifiedMinutesListItemDto`.

---

## 12.2. DTOs de Versions

* [ ] T015-1020 — Crear `CreateCertifiedMinutesVersionDto`.
* [ ] T015-1021 — Crear `CertifiedMinutesVersionDto`.
* [ ] T015-1022 — Crear `CertifiedMinutesVersionListItemDto`.
* [ ] T015-1023 — Crear `CompareCertifiedMinutesVersionsDto`.
* [ ] T015-1024 — Crear `CertifiedMinutesVersionDiffDto`.
* [ ] T015-1025 — Crear `ArchiveCertifiedMinutesVersionDto`.

---

## 12.3. DTOs de Sections

* [ ] T015-1040 — Crear `CreateCertifiedMinutesSectionDto`.
* [ ] T015-1041 — Crear `UpdateCertifiedMinutesSectionDto`.
* [ ] T015-1042 — Crear `ReorderCertifiedMinutesSectionsDto`.
* [ ] T015-1043 — Crear `CertifiedMinutesSectionDto`.
* [ ] T015-1044 — Crear `CertifiedMinutesSectionListItemDto`.
* [ ] T015-1045 — Crear `ArchiveCertifiedMinutesSectionDto`.

---

## 12.4. DTOs de Approvals

* [ ] T015-1060 — Crear `CreateCertifiedMinutesApprovalDto`.
* [ ] T015-1061 — Crear `CertifiedMinutesApprovalDto`.
* [ ] T015-1062 — Crear `CertifiedMinutesApprovalListItemDto`.

---

## 12.5. DTOs de Attachments

* [ ] T015-1080 — Crear `UploadCertifiedMinutesAttachmentDto`.
* [ ] T015-1081 — Crear `CertifiedMinutesAttachmentDto`.
* [ ] T015-1082 — Crear `CertifiedMinutesAttachmentListItemDto`.
* [ ] T015-1083 — Crear `ArchiveCertifiedMinutesAttachmentDto`.

---

## 12.6. DTOs de Artifacts

* [ ] T015-1100 — Crear `GenerateCertifiedMinutesPdfDto`.
* [ ] T015-1101 — Crear `CertifiedMinutesArtifactDto`.
* [ ] T015-1102 — Crear `CertifiedMinutesArtifactListItemDto`.
* [ ] T015-1103 — Crear `DownloadCertifiedMinutesArtifactDto`.
* [ ] T015-1104 — Crear `ArchiveCertifiedMinutesArtifactDto`.

---

## 12.7. DTOs de Publications

* [ ] T015-1120 — Crear `CertifiedMinutesPublicationDto`.
* [ ] T015-1121 — Crear `CertifiedMinutesPublicationListItemDto`.
* [ ] T015-1122 — Crear `RevokeCertifiedMinutesPublicationDto`.
* [ ] T015-1123 — Crear `ArchiveCertifiedMinutesPublicationDto`.

---

## 12.8. DTOs `/me`

* [ ] T015-1140 — Crear `OwnCertifiedMinutesDto`.
* [ ] T015-1141 — Crear `OwnCertifiedMinutesListItemDto`.
* [ ] T015-1142 — Crear `OwnCertifiedMinutesArtifactDto`.
* [ ] T015-1143 — Crear `OwnCertifiedMinutesDownloadDto`.

---

## 12.9. Tests de DTOs

* [ ] T015-1160 — Test `CreateCertifiedMinutesDto`.
* [ ] T015-1161 — Test `UpdateCertifiedMinutesDto`.
* [ ] T015-1162 — Test `ImportFromMeetingMinutesDto`.
* [ ] T015-1163 — Test `SubmitCertifiedMinutesReviewDto`.
* [ ] T015-1164 — Test `ApproveCertifiedMinutesDto`.
* [ ] T015-1165 — Test `RejectCertifiedMinutesDto`.
* [ ] T015-1166 — Test `RequestCertifiedMinutesChangesDto`.
* [ ] T015-1167 — Test `SealCertifiedMinutesDto`.
* [ ] T015-1168 — Test `PublishCertifiedMinutesDto`.
* [ ] T015-1169 — Test `RevokeCertifiedMinutesPublicationDto`.
* [ ] T015-1170 — Test `CreateCertifiedMinutesVersionDto`.
* [ ] T015-1171 — Test `CreateCertifiedMinutesSectionDto`.
* [ ] T015-1172 — Test `UpdateCertifiedMinutesSectionDto`.
* [ ] T015-1173 — Test `ReorderCertifiedMinutesSectionsDto`.
* [ ] T015-1174 — Test `CreateCertifiedMinutesApprovalDto`.
* [ ] T015-1175 — Test `GenerateCertifiedMinutesPdfDto`.
* [ ] T015-1176 — Verificar rechazo de `tenantId` en todos los bodies.
* [ ] T015-1177 — Verificar rechazo de `storageKey` en DTOs externos.
* [ ] T015-1178 — Ejecutar `npm run test:certified-minutes:dto`.

---

# 13. Fase 9 — Guards, policies y autorización

## 13.1. Guards

* [ ] T015-1201 — Implementar `CertifiedMinutesPermissionGuard`.
* [ ] T015-1202 — Implementar `CertifiedMinutesTenantGuard`.
* [ ] T015-1203 — Implementar `CertifiedMinutesStateGuard`.
* [ ] T015-1204 — Implementar `CertifiedMinutesAudienceGuard`.
* [ ] T015-1205 — Implementar `OwnCertifiedMinutesGuard`.
* [ ] T015-1206 — Implementar `CertifiedMinutesArtifactGuard`.
* [ ] T015-1207 — Implementar `CertifiedMinutesAttachmentGuard`.
* [ ] T015-1208 — Implementar `CertifiedMinutesPublicationGuard`.
* [ ] T015-1209 — Implementar `CertifiedMinutesDownloadGuard`.

---

## 13.2. Policies

* [ ] T015-1220 — Implementar `CertifiedMinutesTenantPolicy`.
* [ ] T015-1221 — Implementar `CertifiedMinutesMeetingPolicy`.
* [ ] T015-1222 — Implementar `CertifiedMinutesVersionPolicy`.
* [ ] T015-1223 — Implementar `CertifiedMinutesStatePolicy`.
* [ ] T015-1224 — Implementar `CertifiedMinutesApprovalPolicy`.
* [ ] T015-1225 — Implementar `CertifiedMinutesSealPolicy`.
* [ ] T015-1226 — Implementar `CertifiedMinutesPublicationPolicy`.
* [ ] T015-1227 — Implementar `CertifiedMinutesAudiencePolicy`.
* [ ] T015-1228 — Implementar `CertifiedMinutesArtifactPolicy`.
* [ ] T015-1229 — Implementar `CertifiedMinutesAttachmentPolicy`.
* [ ] T015-1230 — Implementar `CertifiedMinutesDownloadPolicy`.
* [ ] T015-1231 — Implementar `CertifiedMinutesNoAutomaticExecutionPolicy`.
* [ ] T015-1232 — Implementar `CertifiedMinutesPrivacyPolicy`.
* [ ] T015-1233 — Implementar `CertifiedMinutesStoragePolicy`.

---

## 13.3. Permisos

* [ ] T015-1240 — Registrar permisos `certifiedMinutes.*`.
* [ ] T015-1241 — Registrar permisos `certifiedMinutesVersions.*`.
* [ ] T015-1242 — Registrar permisos `certifiedMinutesSections.*`.
* [ ] T015-1243 — Registrar permisos `certifiedMinutesApprovals.*`.
* [ ] T015-1244 — Registrar permisos `certifiedMinutesAttachments.*`.
* [ ] T015-1245 — Registrar permisos `certifiedMinutesArtifacts.*`.
* [ ] T015-1246 — Registrar permisos `certifiedMinutesPublications.*`.
* [ ] T015-1247 — Registrar permisos `certifiedMinutes.read.own`.
* [ ] T015-1248 — Registrar permisos `certifiedMinutesArtifacts.download.own`.
* [ ] T015-1249 — Registrar permiso `certifiedMinutes.audit.read`.
* [ ] T015-1250 — Actualizar seeds de roles base.
* [ ] T015-1251 — Validar que PlatformAdmin no accede automáticamente a actas internas.

---

## 13.4. Tests de autorización

* [ ] T015-1260 — Test 401 sin token.
* [ ] T015-1261 — Test 403 sin membership.
* [ ] T015-1262 — Test 403 usuario disabled.
* [ ] T015-1263 — Test sin `certifiedMinutes.create`.
* [ ] T015-1264 — Test sin `certifiedMinutes.read`.
* [ ] T015-1265 — Test sin `certifiedMinutes.update`.
* [ ] T015-1266 — Test sin `certifiedMinutes.submitReview`.
* [ ] T015-1267 — Test sin `certifiedMinutes.approve`.
* [ ] T015-1268 — Test sin `certifiedMinutes.reject`.
* [ ] T015-1269 — Test sin `certifiedMinutes.requestChanges`.
* [ ] T015-1270 — Test sin `certifiedMinutes.seal`.
* [ ] T015-1271 — Test sin `certifiedMinutes.publish`.
* [ ] T015-1272 — Test sin `certifiedMinutes.revokePublication`.
* [ ] T015-1273 — Test sin `certifiedMinutes.archive`.
* [ ] T015-1274 — Test sin `certifiedMinutesAttachments.download`.
* [ ] T015-1275 — Test sin `certifiedMinutesArtifacts.generate`.
* [ ] T015-1276 — Test sin `certifiedMinutesArtifacts.download`.
* [ ] T015-1277 — Test sin `certifiedMinutes.read.own`.
* [ ] T015-1278 — Test sin `certifiedMinutesArtifacts.download.own`.
* [ ] T015-1279 — Test PlatformAdmin sin acceso automático.
* [ ] T015-1280 — Ejecutar `npm run test:certified-minutes:authorization`.

---

# 14. Fase 10 — Controladores REST

## 14.1. `CertifiedMinutesController`

* [ ] T015-1301 — Crear `certified-minutes.controller.ts`.
* [ ] T015-1302 — Implementar `GET /api/v1/tenant/certified-minutes`.
* [ ] T015-1303 — Implementar `POST /api/v1/tenant/certified-minutes`.
* [ ] T015-1304 — Implementar `GET /api/v1/tenant/certified-minutes/{certifiedMinutesId}`.
* [ ] T015-1305 — Implementar `PATCH /api/v1/tenant/certified-minutes/{certifiedMinutesId}`.
* [ ] T015-1306 — Implementar `POST /import-from-meeting-minutes`.
* [ ] T015-1307 — Implementar `POST /submit-review`.
* [ ] T015-1308 — Implementar `POST /approve`.
* [ ] T015-1309 — Implementar `POST /reject`.
* [ ] T015-1310 — Implementar `POST /request-changes`.
* [ ] T015-1311 — Implementar `POST /seal`.
* [ ] T015-1312 — Implementar `POST /publish`.
* [ ] T015-1313 — Implementar `POST /revoke-publication`.
* [ ] T015-1314 — Implementar `POST /archive`.

---

## 14.2. `CertifiedMinutesVersionsController`

* [ ] T015-1320 — Crear `certified-minutes-versions.controller.ts`.
* [ ] T015-1321 — Implementar `GET /api/v1/tenant/certified-minutes/{certifiedMinutesId}/versions`.
* [ ] T015-1322 — Implementar `POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/versions`.
* [ ] T015-1323 — Implementar `GET /api/v1/tenant/certified-minutes-versions/{versionId}`.
* [ ] T015-1324 — Implementar `POST /api/v1/tenant/certified-minutes-versions/{versionId}/archive`.
* [ ] T015-1325 — Implementar `GET /api/v1/tenant/certified-minutes/{certifiedMinutesId}/versions/compare`.

---

## 14.3. `CertifiedMinutesSectionsController`

* [ ] T015-1340 — Crear `certified-minutes-sections.controller.ts`.
* [ ] T015-1341 — Implementar `GET /api/v1/tenant/certified-minutes/{certifiedMinutesId}/sections`.
* [ ] T015-1342 — Implementar `POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/sections`.
* [ ] T015-1343 — Implementar `GET /api/v1/tenant/certified-minutes-sections/{sectionId}`.
* [ ] T015-1344 — Implementar `PATCH /api/v1/tenant/certified-minutes-sections/{sectionId}`.
* [ ] T015-1345 — Implementar `POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/sections/reorder`.
* [ ] T015-1346 — Implementar `POST /api/v1/tenant/certified-minutes-sections/{sectionId}/archive`.

---

## 14.4. `CertifiedMinutesApprovalsController`

* [ ] T015-1360 — Crear `certified-minutes-approvals.controller.ts`.
* [ ] T015-1361 — Implementar `GET /api/v1/tenant/certified-minutes/{certifiedMinutesId}/approvals`.
* [ ] T015-1362 — Implementar `POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/approvals`.
* [ ] T015-1363 — Implementar `GET /api/v1/tenant/certified-minutes-approvals/{approvalId}`.

---

## 14.5. `CertifiedMinutesAttachmentsController`

* [ ] T015-1380 — Crear `certified-minutes-attachments.controller.ts`.
* [ ] T015-1381 — Implementar `GET /api/v1/tenant/certified-minutes/{certifiedMinutesId}/attachments`.
* [ ] T015-1382 — Implementar `POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/attachments`.
* [ ] T015-1383 — Implementar `GET /api/v1/tenant/certified-minutes-attachments/{attachmentId}`.
* [ ] T015-1384 — Implementar `GET /api/v1/tenant/certified-minutes-attachments/{attachmentId}/download`.
* [ ] T015-1385 — Implementar `POST /api/v1/tenant/certified-minutes-attachments/{attachmentId}/archive`.

---

## 14.6. `CertifiedMinutesArtifactsController`

* [ ] T015-1400 — Crear `certified-minutes-artifacts.controller.ts`.
* [ ] T015-1401 — Implementar `GET /api/v1/tenant/certified-minutes/{certifiedMinutesId}/artifacts`.
* [ ] T015-1402 — Implementar `POST /api/v1/tenant/certified-minutes/{certifiedMinutesId}/artifacts/generate-pdf`.
* [ ] T015-1403 — Implementar `GET /api/v1/tenant/certified-minutes-artifacts/{artifactId}`.
* [ ] T015-1404 — Implementar `GET /api/v1/tenant/certified-minutes-artifacts/{artifactId}/download`.
* [ ] T015-1405 — Implementar `POST /api/v1/tenant/certified-minutes-artifacts/{artifactId}/archive`.

---

## 14.7. `CertifiedMinutesPublicationsController`

* [ ] T015-1420 — Crear `certified-minutes-publications.controller.ts`.
* [ ] T015-1421 — Implementar `GET /api/v1/tenant/certified-minutes/{certifiedMinutesId}/publications`.
* [ ] T015-1422 — Implementar `GET /api/v1/tenant/certified-minutes-publications/{publicationId}`.
* [ ] T015-1423 — Implementar `POST /api/v1/tenant/certified-minutes-publications/{publicationId}/revoke`.
* [ ] T015-1424 — Implementar `POST /api/v1/tenant/certified-minutes-publications/{publicationId}/archive`.

---

## 14.8. `MyCertifiedMinutesController`

* [ ] T015-1440 — Crear `my-certified-minutes.controller.ts`.
* [ ] T015-1441 — Implementar `GET /api/v1/me/certified-minutes`.
* [ ] T015-1442 — Implementar `GET /api/v1/me/certified-minutes/{certifiedMinutesId}`.
* [ ] T015-1443 — Implementar `GET /api/v1/me/certified-minutes/{certifiedMinutesId}/artifacts`.
* [ ] T015-1444 — Implementar `GET /api/v1/me/certified-minutes-artifacts/{artifactId}/download`.

---

# 15. Fase 11 — API tests

## 15.1. Certified Minutes

* [ ] T015-1501 — Test `GET /api/v1/tenant/certified-minutes`.
* [ ] T015-1502 — Test `POST /api/v1/tenant/certified-minutes`.
* [ ] T015-1503 — Test `GET /api/v1/tenant/certified-minutes/{certifiedMinutesId}`.
* [ ] T015-1504 — Test `PATCH /api/v1/tenant/certified-minutes/{certifiedMinutesId}`.
* [ ] T015-1505 — Test `POST /import-from-meeting-minutes`.
* [ ] T015-1506 — Test `POST /submit-review`.
* [ ] T015-1507 — Test `POST /approve`.
* [ ] T015-1508 — Test `POST /reject`.
* [ ] T015-1509 — Test `POST /request-changes`.
* [ ] T015-1510 — Test `POST /seal`.
* [ ] T015-1511 — Test `POST /publish`.
* [ ] T015-1512 — Test `POST /revoke-publication`.
* [ ] T015-1513 — Test `POST /archive`.

---

## 15.2. Versions

* [ ] T015-1520 — Test `GET versions`.
* [ ] T015-1521 — Test `POST version`.
* [ ] T015-1522 — Test `GET version`.
* [ ] T015-1523 — Test `POST version archive`.
* [ ] T015-1524 — Test `GET versions compare`.

---

## 15.3. Sections

* [ ] T015-1540 — Test `GET sections`.
* [ ] T015-1541 — Test `POST section`.
* [ ] T015-1542 — Test `GET section`.
* [ ] T015-1543 — Test `PATCH section`.
* [ ] T015-1544 — Test `POST sections reorder`.
* [ ] T015-1545 — Test `POST section archive`.

---

## 15.4. Approvals

* [ ] T015-1560 — Test `GET approvals`.
* [ ] T015-1561 — Test `POST approval`.
* [ ] T015-1562 — Test `GET approval`.

---

## 15.5. Attachments

* [ ] T015-1580 — Test `GET attachments`.
* [ ] T015-1581 — Test `POST attachment upload`.
* [ ] T015-1582 — Test `GET attachment`.
* [ ] T015-1583 — Test `GET attachment download`.
* [ ] T015-1584 — Test `POST attachment archive`.

---

## 15.6. Artifacts

* [ ] T015-1600 — Test `GET artifacts`.
* [ ] T015-1601 — Test `POST generate-pdf`.
* [ ] T015-1602 — Test `GET artifact`.
* [ ] T015-1603 — Test `GET artifact download`.
* [ ] T015-1604 — Test `POST artifact archive`.

---

## 15.7. Publications

* [ ] T015-1620 — Test `GET publications`.
* [ ] T015-1621 — Test `GET publication`.
* [ ] T015-1622 — Test `POST publication revoke`.
* [ ] T015-1623 — Test `POST publication archive`.

---

## 15.8. `/me`

* [ ] T015-1640 — Test `GET /api/v1/me/certified-minutes`.
* [ ] T015-1641 — Test `GET /api/v1/me/certified-minutes/{certifiedMinutesId}`.
* [ ] T015-1642 — Test `GET /api/v1/me/certified-minutes/{certifiedMinutesId}/artifacts`.
* [ ] T015-1643 — Test `GET /api/v1/me/certified-minutes-artifacts/{artifactId}/download`.

---

# 16. Fase 12 — Multitenancy

## 16.1. Aislamiento de entidades

* [ ] T015-1701 — Tenant A no ve `certified_minutes` de Tenant B.
* [ ] T015-1702 — Tenant A no ve `certified_minutes_versions` de Tenant B.
* [ ] T015-1703 — Tenant A no ve `certified_minutes_sections` de Tenant B.
* [ ] T015-1704 — Tenant A no ve `certified_minutes_approvals` de Tenant B.
* [ ] T015-1705 — Tenant A no ve `certified_minutes_attachments` de Tenant B.
* [ ] T015-1706 — Tenant A no ve `certified_minutes_artifacts` de Tenant B.
* [ ] T015-1707 — Tenant A no ve `certified_minutes_publications` de Tenant B.
* [ ] T015-1708 — Tenant A no ve `certified_minutes_access_logs` de Tenant B.
* [ ] T015-1709 — Tenant A no modifica actas de Tenant B.
* [ ] T015-1710 — Tenant A no sella actas de Tenant B.
* [ ] T015-1711 — Tenant A no publica actas de Tenant B.
* [ ] T015-1712 — Tenant A no descarga adjuntos de Tenant B.
* [ ] T015-1713 — Tenant A no descarga artefactos de Tenant B.

---

## 16.2. Referencias cross-tenant

* [ ] T015-1720 — Rechazar `meetingId` de Tenant B.
* [ ] T015-1721 — Rechazar `sourceMeetingMinutesId` de Tenant B.
* [ ] T015-1722 — Rechazar `versionId` de Tenant B.
* [ ] T015-1723 — Rechazar `sectionId` de Tenant B.
* [ ] T015-1724 — Rechazar `approvalId` de Tenant B.
* [ ] T015-1725 — Rechazar `attachmentId` de Tenant B.
* [ ] T015-1726 — Rechazar `artifactId` de Tenant B.
* [ ] T015-1727 — Rechazar `publicationId` de Tenant B.
* [ ] T015-1728 — Rechazar `votingResultId` de Tenant B.
* [ ] T015-1729 — Rechazar `meetingResolutionId` de Tenant B.
* [ ] T015-1730 — Rechazar `audienceRules.userIds` de Tenant B.
* [ ] T015-1731 — Rechazar `audienceRules.propertyUnitIds` de Tenant B.
* [ ] T015-1732 — Rechazar `audienceRules.roleIds` de Tenant B.
* [ ] T015-1733 — Ejecutar `npm run test:certified-minutes:multitenancy`.

---

# 17. Fase 13 — Versionado e inmutabilidad

## 17.1. Versionado

* [ ] T015-1801 — Crear versión inicial.
* [ ] T015-1802 — Crear versión incremental.
* [ ] T015-1803 — Copiar contenido desde versión previa.
* [ ] T015-1804 — Requerir `changeReason` para versiones posteriores.
* [ ] T015-1805 — Impedir versionNumber duplicado.
* [ ] T015-1806 — Preservar versión anterior sin modificación.
* [ ] T015-1807 — Marcar versión anterior como `superseded` solo por flujo controlado.
* [ ] T015-1808 — Permitir comparar versiones.
* [ ] T015-1809 — Impedir comparación cross-tenant.
* [ ] T015-1810 — Auditar creación de versión.

---

## 17.2. Inmutabilidad

* [ ] T015-1820 — Impedir editar acta `sealed`.
* [ ] T015-1821 — Impedir editar versión `sealed`.
* [ ] T015-1822 — Impedir editar sección de versión `sealed`.
* [ ] T015-1823 — Impedir reordenar secciones de versión `sealed`.
* [ ] T015-1824 — Impedir crear sección en versión `sealed`.
* [ ] T015-1825 — Impedir archivar sección de versión `sealed` si política lo prohíbe.
* [ ] T015-1826 — Exigir nueva versión tras acta `approved`.
* [ ] T015-1827 — Exigir nueva versión tras acta `sealed`.
* [ ] T015-1828 — Exigir nueva versión tras acta `published`.
* [ ] T015-1829 — Ejecutar `npm run test:certified-minutes:integrity`.

---

# 18. Fase 14 — Importación desde MeetingMinutes

## 18.1. Importación base

* [ ] T015-1901 — Validar `MeetingMinutes` del mismo tenant.
* [ ] T015-1902 — Validar `MeetingMinutes` de la misma reunión.
* [ ] T015-1903 — Crear versión inicial si `createInitialVersion = true`.
* [ ] T015-1904 — Crear secciones base.
* [ ] T015-1905 — Importar sección `meetingInfo`.
* [ ] T015-1906 — Importar sección `callNotice`.
* [ ] T015-1907 — Importar sección `attendance`.
* [ ] T015-1908 — Importar sección `quorum`.
* [ ] T015-1909 — Importar sección `agenda`.
* [ ] T015-1910 — Importar sección `voting`.
* [ ] T015-1911 — Importar sección `resolutions`.
* [ ] T015-1912 — Importar sección `closure`.

---

## 18.2. Integridad de importación

* [ ] T015-1920 — Sanitizar contenido importado.
* [ ] T015-1921 — No importar votos individuales de `secretBasic`.
* [ ] T015-1922 — No recalcular votaciones.
* [ ] T015-1923 — No modificar `MeetingMinutes` fuente.
* [ ] T015-1924 — No modificar `Meeting`.
* [ ] T015-1925 — No modificar resoluciones.
* [ ] T015-1926 — No ejecutar acciones automáticas.
* [ ] T015-1927 — Auditar `certifiedMinutes.importedFromMeetingMinutes`.

---

# 19. Fase 15 — Hash, canonicalización y sellado

## 19.1. Canonicalización

* [ ] T015-2001 — Implementar canonicalización de JSON estable.
* [ ] T015-2002 — Ordenar claves JSON.
* [ ] T015-2003 — Ordenar secciones por `order`.
* [ ] T015-2004 — Normalizar saltos de línea.
* [ ] T015-2005 — Normalizar espacios redundantes no materiales.
* [ ] T015-2006 — Normalizar fechas a ISO 8601 UTC.
* [ ] T015-2007 — Normalizar valores `null`.
* [ ] T015-2008 — Usar codificación UTF-8.
* [ ] T015-2009 — Excluir metadata sensible.
* [ ] T015-2010 — Test mismo contenido lógico genera mismo canonical string.
* [ ] T015-2011 — Test cambio material genera canonical string diferente.

---

## 19.2. Hash de versión

* [ ] T015-2020 — Calcular `contentHash`.
* [ ] T015-2021 — Usar SHA-256.
* [ ] T015-2022 — Persistir `contentHash`.
* [ ] T015-2023 — Persistir `hashAlgorithm`.
* [ ] T015-2024 — Exponer solo `contentHashPrefix` por DTO estándar.
* [ ] T015-2025 — Test mismo snapshot produce mismo hash.
* [ ] T015-2026 — Test snapshot modificado produce hash distinto.

---

## 19.3. Sellado interno

* [ ] T015-2040 — Calcular `sealHash`.
* [ ] T015-2041 — Usar versión aprobada.
* [ ] T015-2042 — Incluir metadata relevante.
* [ ] T015-2043 — Registrar `sealedAt`.
* [ ] T015-2044 — Registrar `sealedBy`.
* [ ] T015-2045 — Registrar `sealAlgorithm`.
* [ ] T015-2046 — Bloquear versión sellada.
* [ ] T015-2047 — Exponer `sealHashPrefix`.
* [ ] T015-2048 — No exponer `sealHash` completo por DTO estándar.
* [ ] T015-2049 — Responder `legalSignature = false`.
* [ ] T015-2050 — Auditar `certifiedMinutes.sealed`.
* [ ] T015-2051 — Ejecutar `npm run test:certified-minutes:integrity`.

---

# 20. Fase 16 — PDF y artefactos

## 20.1. Generación PDF

* [ ] T015-2101 — Renderizar HTML desde versión.
* [ ] T015-2102 — Generar PDF buffer válido.
* [ ] T015-2103 — Incluir título.
* [ ] T015-2104 — Incluir código.
* [ ] T015-2105 — Incluir versión.
* [ ] T015-2106 — Incluir fecha de generación.
* [ ] T015-2107 — Incluir referencia de hash si se solicita.
* [ ] T015-2108 — Incluir índice de adjuntos si se solicita.
* [ ] T015-2109 — Generar PDF oficial desde versión `sealed`.
* [ ] T015-2110 — Permitir PDF oficial desde versión `approved` solo si política lo habilita.
* [ ] T015-2111 — Rechazar PDF oficial desde `draft`.
* [ ] T015-2112 — Permitir `draftPdf` solo con watermark `BORRADOR`.
* [ ] T015-2113 — No incluir `storageKey` en PDF.
* [ ] T015-2114 — No incluir datos no autorizados.
* [ ] T015-2115 — Manejar error como `CERTIFIED_MINUTES_PDF_GENERATION_FAILED`.

---

## 20.2. Artefactos

* [ ] T015-2120 — Crear artifact `pending`.
* [ ] T015-2121 — Marcar artifact `generated`.
* [ ] T015-2122 — Marcar artifact `failed`.
* [ ] T015-2123 — Calcular `artifactHash`.
* [ ] T015-2124 — Persistir `artifactHash`.
* [ ] T015-2125 — Persistir `hashAlgorithm`.
* [ ] T015-2126 — Persistir `fileSize`.
* [ ] T015-2127 — Persistir `mimeType`.
* [ ] T015-2128 — Persistir `storageKey` interno.
* [ ] T015-2129 — Exponer solo `artifactHashPrefix`.
* [ ] T015-2130 — No exponer `storageKey`.
* [ ] T015-2131 — No exponer URL persistente.
* [ ] T015-2132 — Auditar `certifiedMinutesArtifact.generated`.
* [ ] T015-2133 — Ejecutar `npm run test:certified-minutes:pdf`.

---

# 21. Fase 17 — Storage y descargas

## 21.1. Storage

* [ ] T015-2201 — Implementar upload seguro.
* [ ] T015-2202 — Implementar download stream.
* [ ] T015-2203 — Implementar metadata de archivo.
* [ ] T015-2204 — Implementar hash de archivo.
* [ ] T015-2205 — Implementar archivo lógico de storage.
* [ ] T015-2206 — Implementar URL temporal si la arquitectura lo requiere.
* [ ] T015-2207 — Garantizar TTL corto de URL temporal.
* [ ] T015-2208 — No persistir URL temporal.
* [ ] T015-2209 — Bloquear path traversal.
* [ ] T015-2210 — Bloquear storageKey externo enviado por cliente.
* [ ] T015-2211 — Manejar errores como `CERTIFIED_MINUTES_STORAGE_ERROR`.

---

## 21.2. Descargas administrativas

* [ ] T015-2220 — Descargar adjunto con permiso.
* [ ] T015-2221 — Descargar artifact con permiso.
* [ ] T015-2222 — Validar tenant del recurso.
* [ ] T015-2223 — Validar estado `generated` en artifacts.
* [ ] T015-2224 — Validar estado `available` en attachments.
* [ ] T015-2225 — No exponer `storageKey`.
* [ ] T015-2226 — No exponer URL persistente.
* [ ] T015-2227 — Usar filename seguro.
* [ ] T015-2228 — Responder `Cache-Control: no-store`.
* [ ] T015-2229 — Auditar descarga.
* [ ] T015-2230 — Registrar `CertifiedMinutesAccessLog`.

---

## 21.3. Descargas propias

* [ ] T015-2240 — Descargar artifact publicado propio.
* [ ] T015-2241 — Validar audiencia.
* [ ] T015-2242 — Validar publicación `published`.
* [ ] T015-2243 — Rechazar publicación `revoked`.
* [ ] T015-2244 — Rechazar publicación `expired`.
* [ ] T015-2245 — Rechazar artifact no generado.
* [ ] T015-2246 — Rechazar artifact de otro tenant.
* [ ] T015-2247 — Registrar acceso autorizado.
* [ ] T015-2248 — Registrar acceso denegado si la política lo exige.
* [ ] T015-2249 — Ejecutar `npm run test:certified-minutes:storage`.

---

# 22. Fase 18 — Adjuntos

## 22.1. Upload

* [ ] T015-2301 — Subir PDF válido.
* [ ] T015-2302 — Subir PNG válido.
* [ ] T015-2303 — Subir JPEG válido.
* [ ] T015-2304 — Subir DOCX válido.
* [ ] T015-2305 — Subir XLSX válido.
* [ ] T015-2306 — Rechazar MIME no permitido.
* [ ] T015-2307 — Rechazar archivo demasiado grande.
* [ ] T015-2308 — Rechazar archivo vacío.
* [ ] T015-2309 — Sanitizar `fileName`.
* [ ] T015-2310 — Calcular `fileHash`.
* [ ] T015-2311 — Guardar `storageKey` interno.
* [ ] T015-2312 — No exponer `storageKey`.
* [ ] T015-2313 — Marcar `available`.
* [ ] T015-2314 — Soportar `quarantined` si aplica.
* [ ] T015-2315 — Auditar `certifiedMinutesAttachment.uploaded`.

---

## 22.2. Lifecycle

* [ ] T015-2320 — Listar adjuntos.
* [ ] T015-2321 — Obtener adjunto.
* [ ] T015-2322 — Descargar adjunto.
* [ ] T015-2323 — Archivar adjunto.
* [ ] T015-2324 — No eliminar físicamente en operación ordinaria.
* [ ] T015-2325 — Rechazar adjunto tenant B.
* [ ] T015-2326 — Rechazar descarga sin permiso.
* [ ] T015-2327 — Auditar `certifiedMinutesAttachment.downloaded`.
* [ ] T015-2328 — Auditar `certifiedMinutesAttachment.archived`.

---

# 23. Fase 19 — Publicación y audiencia

## 23.1. Publicación

* [ ] T015-2401 — Publicar acta `sealed`.
* [ ] T015-2402 — Rechazar publicar `draft`.
* [ ] T015-2403 — Rechazar publicar `underReview`.
* [ ] T015-2404 — Rechazar publicar `approved` no sellada.
* [ ] T015-2405 — Rechazar publicar sin `audienceType`.
* [ ] T015-2406 — Validar `artifactId`.
* [ ] T015-2407 — Rechazar `artifactId` de otro tenant.
* [ ] T015-2408 — Rechazar `artifactId` de otra versión.
* [ ] T015-2409 — Crear `CertifiedMinutesPublication`.
* [ ] T015-2410 — Cambiar acta a `published`.
* [ ] T015-2411 — Registrar `publishedAt`.
* [ ] T015-2412 — Registrar `publishedBy`.
* [ ] T015-2413 — Auditar `certifiedMinutes.published`.

---

## 23.2. Audiencias

* [ ] T015-2420 — Implementar audiencia `administrators`.
* [ ] T015-2421 — Implementar audiencia `board`.
* [ ] T015-2422 — Implementar audiencia `meetingParticipants`.
* [ ] T015-2423 — Implementar audiencia `owners`.
* [ ] T015-2424 — Implementar audiencia `residents`.
* [ ] T015-2425 — Implementar audiencia `tenant`.
* [ ] T015-2426 — Implementar audiencia `propertyUnits`.
* [ ] T015-2427 — Implementar audiencia `specificUsers`.
* [ ] T015-2428 — Implementar audiencia `roles`.
* [ ] T015-2429 — Implementar audiencia `mixed`.
* [ ] T015-2430 — Implementar audiencia `restricted`.
* [ ] T015-2431 — Validar `audienceRules.userIds` contra tenant.
* [ ] T015-2432 — Validar `audienceRules.propertyUnitIds` contra tenant.
* [ ] T015-2433 — Validar `audienceRules.roleIds` contra tenant.
* [ ] T015-2434 — Rechazar audienceRules cross-tenant.
* [ ] T015-2435 — Ejecutar `npm run test:certified-minutes:audience`.

---

## 23.3. Revocación

* [ ] T015-2440 — Revocar publicación con razón.
* [ ] T015-2441 — Rechazar revocación sin razón.
* [ ] T015-2442 — Rechazar publicación ya revocada.
* [ ] T015-2443 — No eliminar acta.
* [ ] T015-2444 — No eliminar versión.
* [ ] T015-2445 — No eliminar artifact.
* [ ] T015-2446 — No eliminar auditoría.
* [ ] T015-2447 — Ocultar publicación revocada en `/me`.
* [ ] T015-2448 — Rechazar descarga de publicación revocada.
* [ ] T015-2449 — Auditar `certifiedMinutes.publicationRevoked`.

---

# 24. Fase 20 — Endpoints `/me`

## 24.1. Consulta propia

* [ ] T015-2501 — Owner ve acta published para `owners`.
* [ ] T015-2502 — Resident ve acta published para `residents`.
* [ ] T015-2503 — BoardMember ve acta published para `board`.
* [ ] T015-2504 — Participant ve acta published para `meetingParticipants`.
* [ ] T015-2505 — Usuario específico ve acta si está en `specificUsers`.
* [ ] T015-2506 — Usuario con rol ve acta si está en `roles`.
* [ ] T015-2507 — Usuario de unidad ve acta si está en `propertyUnits`.
* [ ] T015-2508 — Usuario incluido en `mixed` ve acta.
* [ ] T015-2509 — Usuario no incluido no ve acta.
* [ ] T015-2510 — Usuario no ve acta `draft`.
* [ ] T015-2511 — Usuario no ve acta `underReview`.
* [ ] T015-2512 — Usuario no ve acta `approved`.
* [ ] T015-2513 — Usuario no ve acta `sealed` no publicada.
* [ ] T015-2514 — Usuario no ve publicación `revoked`.
* [ ] T015-2515 — Usuario no ve publicación `expired`.
* [ ] T015-2516 — Usuario no ve acta Tenant B.

---

## 24.2. Minimización de datos `/me`

* [ ] T015-2520 — `/me` no devuelve `storageKey`.
* [ ] T015-2521 — `/me` no devuelve URL persistente.
* [ ] T015-2522 — `/me` no devuelve auditoría.
* [ ] T015-2523 — `/me` no devuelve aprobaciones internas.
* [ ] T015-2524 — `/me` no devuelve audienceRules completas si revelan terceros.
* [ ] T015-2525 — `/me` no devuelve contenido restringido.
* [ ] T015-2526 — `/me` devuelve solo versión publicada.
* [ ] T015-2527 — `/me` devuelve solo secciones autorizadas.
* [ ] T015-2528 — Ejecutar `npm run test:certified-minutes:own-resource`.

---

# 25. Fase 21 — Integración con notificaciones

## 25.1. Eventos

* [ ] T015-2601 — Emitir `certifiedMinutes.submittedForReview`.
* [ ] T015-2602 — Emitir `certifiedMinutes.changesRequested`.
* [ ] T015-2603 — Emitir `certifiedMinutes.approved`.
* [ ] T015-2604 — Emitir `certifiedMinutes.sealed`.
* [ ] T015-2605 — Emitir `certifiedMinutes.published`.
* [ ] T015-2606 — Emitir `certifiedMinutes.publicationRevoked`.
* [ ] T015-2607 — Construir payload mínimo.
* [ ] T015-2608 — Incluir `sourceType = certifiedMinutes`.
* [ ] T015-2609 — Incluir `sourceId = certifiedMinutesId`.
* [ ] T015-2610 — Incluir `actionUrl`.
* [ ] T015-2611 — Incluir audiencia mínima.
* [ ] T015-2612 — No incluir contenido completo del acta.
* [ ] T015-2613 — No incluir secciones completas.
* [ ] T015-2614 — No incluir adjuntos.
* [ ] T015-2615 — No incluir `storageKey`.
* [ ] T015-2616 — No incluir URL firmada.
* [ ] T015-2617 — No enviar email directamente desde Certified Minutes.
* [ ] T015-2618 — No enviar WhatsApp/SMS/push directamente desde Certified Minutes.

---

## 25.2. Tests de notificaciones

* [ ] T015-2620 — Test `submit-review` con `notifyReviewers = true`.
* [ ] T015-2621 — Test `submit-review` con `notifyReviewers = false`.
* [ ] T015-2622 — Test `request-changes`.
* [ ] T015-2623 — Test `approve`.
* [ ] T015-2624 — Test `seal`.
* [ ] T015-2625 — Test `publish` con `notifyAudience = true`.
* [ ] T015-2626 — Test `publish` con `notifyAudience = false`.
* [ ] T015-2627 — Test `publicationRevoked`.
* [ ] T015-2628 — Test payload mínimo.
* [ ] T015-2629 — Test payload sin contenido completo.
* [ ] T015-2630 — Test payload sin storageKey.
* [ ] T015-2631 — Test fallo del puerto no revierte operación salvo política explícita.
* [ ] T015-2632 — Ejecutar `npm run test:certified-minutes:notifications`.

---

# 26. Fase 22 — Auditoría

## 26.1. Eventos de auditoría

* [ ] T015-2701 — Auditar `certifiedMinutes.created`.
* [ ] T015-2702 — Auditar `certifiedMinutes.updated`.
* [ ] T015-2703 — Auditar `certifiedMinutes.importedFromMeetingMinutes`.
* [ ] T015-2704 — Auditar `certifiedMinutes.submittedForReview`.
* [ ] T015-2705 — Auditar `certifiedMinutes.approved`.
* [ ] T015-2706 — Auditar `certifiedMinutes.rejected`.
* [ ] T015-2707 — Auditar `certifiedMinutes.changesRequested`.
* [ ] T015-2708 — Auditar `certifiedMinutes.sealed`.
* [ ] T015-2709 — Auditar `certifiedMinutes.published`.
* [ ] T015-2710 — Auditar `certifiedMinutes.publicationRevoked`.
* [ ] T015-2711 — Auditar `certifiedMinutes.archived`.
* [ ] T015-2712 — Auditar `certifiedMinutesVersion.created`.
* [ ] T015-2713 — Auditar `certifiedMinutesVersion.archived`.
* [ ] T015-2714 — Auditar `certifiedMinutesSection.created`.
* [ ] T015-2715 — Auditar `certifiedMinutesSection.updated`.
* [ ] T015-2716 — Auditar `certifiedMinutesSection.reordered`.
* [ ] T015-2717 — Auditar `certifiedMinutesSection.archived`.
* [ ] T015-2718 — Auditar `certifiedMinutesApproval.created`.
* [ ] T015-2719 — Auditar `certifiedMinutesAttachment.uploaded`.
* [ ] T015-2720 — Auditar `certifiedMinutesAttachment.downloaded`.
* [ ] T015-2721 — Auditar `certifiedMinutesAttachment.archived`.
* [ ] T015-2722 — Auditar `certifiedMinutesArtifact.generated`.
* [ ] T015-2723 — Auditar `certifiedMinutesArtifact.downloaded`.
* [ ] T015-2724 — Auditar `certifiedMinutesArtifact.archived`.
* [ ] T015-2725 — Auditar `certifiedMinutesAccess.viewed`.
* [ ] T015-2726 — Auditar `certifiedMinutesAccess.downloaded`.

---

## 26.2. Sanitización de auditoría

* [ ] T015-2740 — No registrar contenido completo del acta.
* [ ] T015-2741 — No registrar contenido completo de secciones.
* [ ] T015-2742 — No registrar contenido completo de adjuntos.
* [ ] T015-2743 — No registrar `storageKey`.
* [ ] T015-2744 — No registrar URL firmada.
* [ ] T015-2745 — No registrar tokens.
* [ ] T015-2746 — No registrar cookies.
* [ ] T015-2747 — No registrar `Authorization` header.
* [ ] T015-2748 — No registrar emails completos.
* [ ] T015-2749 — No registrar teléfonos completos.
* [ ] T015-2750 — No registrar cédulas.
* [ ] T015-2751 — No registrar firmas.
* [ ] T015-2752 — No registrar documentos completos.
* [ ] T015-2753 — No registrar stack trace.
* [ ] T015-2754 — No registrar SQL raw.
* [ ] T015-2755 — Ejecutar `npm run test:certified-minutes:audit`.

---

# 27. Fase 23 — Observabilidad

## 27.1. Logs

* [ ] T015-2801 — Agregar log `certifiedMinutes.created`.
* [ ] T015-2802 — Agregar log `certifiedMinutes.submittedForReview`.
* [ ] T015-2803 — Agregar log `certifiedMinutes.approved`.
* [ ] T015-2804 — Agregar log `certifiedMinutes.sealed`.
* [ ] T015-2805 — Agregar log `certifiedMinutes.published`.
* [ ] T015-2806 — Agregar log `certifiedMinutes.publicationRevoked`.
* [ ] T015-2807 — Agregar log `certifiedMinutes.archived`.
* [ ] T015-2808 — Agregar log `certifiedMinutesArtifact.generated`.
* [ ] T015-2809 — Agregar log `certifiedMinutesArtifact.downloaded`.
* [ ] T015-2810 — Agregar log `certifiedMinutesAttachment.uploaded`.
* [ ] T015-2811 — Agregar log `certifiedMinutesAttachment.downloaded`.
* [ ] T015-2812 — Validar `traceId`.
* [ ] T015-2813 — Validar `requestId`.
* [ ] T015-2814 — Validar `correlationId`.
* [ ] T015-2815 — Validar `action`.
* [ ] T015-2816 — Validar `outcome`.
* [ ] T015-2817 — Validar `durationMs`.
* [ ] T015-2818 — Validar `errorCode`.

---

## 27.2. Métricas

* [ ] T015-2820 — Agregar métrica `certified_minutes_created_total`.
* [ ] T015-2821 — Agregar métrica `certified_minutes_submitted_total`.
* [ ] T015-2822 — Agregar métrica `certified_minutes_approved_total`.
* [ ] T015-2823 — Agregar métrica `certified_minutes_sealed_total`.
* [ ] T015-2824 — Agregar métrica `certified_minutes_published_total`.
* [ ] T015-2825 — Agregar métrica `certified_minutes_publication_revoked_total`.
* [ ] T015-2826 — Agregar métrica `certified_minutes_pdf_generated_total`.
* [ ] T015-2827 — Agregar métrica `certified_minutes_downloaded_total`.
* [ ] T015-2828 — Agregar métrica `certified_minutes_attachment_uploaded_total`.
* [ ] T015-2829 — Validar labels permitidos.
* [ ] T015-2830 — Validar labels prohibidos.
* [ ] T015-2831 — Ejecutar `npm run test:certified-minutes:observability`.

---

# 28. Fase 24 — Seguridad

## 28.1. Seguridad obligatoria

* [ ] T015-2901 — Verificar que no existen endpoints públicos de actas certificadas.
* [ ] T015-2902 — Verificar que no existen endpoints públicos de descarga de artefactos.
* [ ] T015-2903 — Verificar que ningún body acepta `tenantId`.
* [ ] T015-2904 — Verificar que ningún recurso se busca solo por `id`.
* [ ] T015-2905 — Verificar que no se permite acta cross-tenant.
* [ ] T015-2906 — Verificar que no se permite versión cross-tenant.
* [ ] T015-2907 — Verificar que no se permite sección cross-tenant.
* [ ] T015-2908 — Verificar que no se permite adjunto cross-tenant.
* [ ] T015-2909 — Verificar que no se permite artifact cross-tenant.
* [ ] T015-2910 — Verificar que no se permite publicación cross-tenant.
* [ ] T015-2911 — Verificar que no se permite `meetingId` de otro tenant.
* [ ] T015-2912 — Verificar que no se permite `sourceMeetingMinutesId` de otro tenant.
* [ ] T015-2913 — Verificar que no se permite editar versión sellada.
* [ ] T015-2914 — Verificar que no se permite publicar sin sellado.
* [ ] T015-2915 — Verificar que no se permite descargar sin autorización.
* [ ] T015-2916 — Verificar que no se expone `storageKey`.
* [ ] T015-2917 — Verificar que no se expone URL firmada persistente.
* [ ] T015-2918 — Verificar que no se registra contenido completo en logs.
* [ ] T015-2919 — Verificar que no se registra contenido completo en auditoría.
* [ ] T015-2920 — Verificar que no se presenta hash como firma legal.
* [ ] T015-2921 — Verificar que no se ejecutan resoluciones automáticamente.
* [ ] T015-2922 — Verificar que no se generan cargos.
* [ ] T015-2923 — Verificar que no se generan multas.
* [ ] T015-2924 — Verificar que errores son seguros.

---

## 28.2. Tests negativos públicos

* [ ] T015-2940 — Test `GET /api/v1/public/tenants/{slug}/certified-minutes` devuelve 404.
* [ ] T015-2941 — Test `GET /api/v1/public/tenants/{slug}/certified-minutes/{certifiedMinutesId}` devuelve 404.
* [ ] T015-2942 — Test `GET /api/v1/public/tenants/{slug}/certified-minutes/{certifiedMinutesId}/download` devuelve 404.
* [ ] T015-2943 — Test `GET /api/v1/public/tenants/{slug}/certified-minutes-artifacts/{artifactId}/download` devuelve 404.
* [ ] T015-2944 — Test `POST /api/v1/public/tenants/{slug}/certified-minutes` devuelve 404.
* [ ] T015-2945 — Test `POST /api/v1/public/tenants/{slug}/certified-minutes/{certifiedMinutesId}/publish` devuelve 404.
* [ ] T015-2946 — Ejecutar `npm run test:certified-minutes:security`.

---

# 29. Fase 25 — OpenAPI

## 29.1. Documentación OpenAPI

* [ ] T015-3001 — Agregar tag `Certified Minutes`.
* [ ] T015-3002 — Agregar tag `Certified Minutes Versions`.
* [ ] T015-3003 — Agregar tag `Certified Minutes Sections`.
* [ ] T015-3004 — Agregar tag `Certified Minutes Approvals`.
* [ ] T015-3005 — Agregar tag `Certified Minutes Attachments`.
* [ ] T015-3006 — Agregar tag `Certified Minutes Artifacts`.
* [ ] T015-3007 — Agregar tag `Certified Minutes Publications`.
* [ ] T015-3008 — Agregar tag `My Certified Minutes`.
* [ ] T015-3009 — Documentar DTOs request.
* [ ] T015-3010 — Documentar DTOs response.
* [ ] T015-3011 — Documentar errores.
* [ ] T015-3012 — Documentar permisos.
* [ ] T015-3013 — Documentar paginación.
* [ ] T015-3014 — Documentar filtros.
* [ ] T015-3015 — Agregar `x-tenant-scope`.
* [ ] T015-3016 — Agregar `x-auth-required`.
* [ ] T015-3017 — Agregar `x-required-permission`.
* [ ] T015-3018 — Agregar `x-own-resource` en endpoints `/me`.
* [ ] T015-3019 — Agregar `x-secure-download`.
* [ ] T015-3020 — Agregar `x-storage-key-exposed: false`.
* [ ] T015-3021 — Agregar `x-integrity-seal`.
* [ ] T015-3022 — Agregar `x-hash-algorithm: SHA-256`.
* [ ] T015-3023 — Agregar `x-legal-signature: false`.
* [ ] T015-3024 — Agregar `x-publication-controlled`.
* [ ] T015-3025 — Agregar `x-public-exposure: false`.
* [ ] T015-3026 — Agregar `x-audience-required`.
* [ ] T015-3027 — Agregar `x-artifact-generation`.
* [ ] T015-3028 — Agregar `x-storage-backed`.
* [ ] T015-3029 — Agregar `x-official-pdf-from-draft: false`.
* [ ] T015-3030 — Agregar `x-audit-event`.

---

## 29.2. Tests OpenAPI

* [ ] T015-3040 — Validar que OpenAPI compila.
* [ ] T015-3041 — Validar que todos los endpoints esperados están documentados.
* [ ] T015-3042 — Validar que todos los permisos están documentados.
* [ ] T015-3043 — Validar que endpoints `/me` tienen `x-own-resource`.
* [ ] T015-3044 — Validar que descargas tienen `x-secure-download`.
* [ ] T015-3045 — Validar que descargas tienen `x-storage-key-exposed: false`.
* [ ] T015-3046 — Validar que sellado tiene `x-integrity-seal`.
* [ ] T015-3047 — Validar que sellado tiene `x-legal-signature: false`.
* [ ] T015-3048 — Validar que publicación tiene `x-public-exposure: false`.
* [ ] T015-3049 — Validar que generación PDF tiene `x-official-pdf-from-draft: false`.
* [ ] T015-3050 — Validar que OpenAPI no documenta endpoints públicos prohibidos.
* [ ] T015-3051 — Ejecutar `npm run test:certified-minutes:openapi`.
* [ ] T015-3052 — Ejecutar `npm run openapi:validate`.

---

# 30. Fase 26 — Seeds y datos demo

## 30.1. Seeds

* [ ] T015-3101 — Crear seed `certifiedMinutesDraftA`.
* [ ] T015-3102 — Crear seed `certifiedMinutesUnderReviewA`.
* [ ] T015-3103 — Crear seed `certifiedMinutesChangesRequestedA`.
* [ ] T015-3104 — Crear seed `certifiedMinutesApprovedA`.
* [ ] T015-3105 — Crear seed `certifiedMinutesSealedA`.
* [ ] T015-3106 — Crear seed `certifiedMinutesPublishedA`.
* [ ] T015-3107 — Crear seed `certifiedMinutesCancelledA`.
* [ ] T015-3108 — Crear seed `certifiedMinutesArchivedA`.
* [ ] T015-3109 — Crear seed `certifiedMinutesTenantB`.
* [ ] T015-3110 — Crear seed `certifiedMinutesVersion1A`.
* [ ] T015-3111 — Crear seed `certifiedMinutesVersion2A`.
* [ ] T015-3112 — Crear seed `certifiedMinutesVersionSealedA`.
* [ ] T015-3113 — Crear seed `sectionHeaderA`.
* [ ] T015-3114 — Crear seed `sectionMeetingInfoA`.
* [ ] T015-3115 — Crear seed `sectionAttendanceA`.
* [ ] T015-3116 — Crear seed `sectionQuorumA`.
* [ ] T015-3117 — Crear seed `sectionAgendaA`.
* [ ] T015-3118 — Crear seed `sectionVotingA`.
* [ ] T015-3119 — Crear seed `sectionResolutionsA`.
* [ ] T015-3120 — Crear seed `sectionClosureA`.
* [ ] T015-3121 — Crear seed `approvalApprovedA`.
* [ ] T015-3122 — Crear seed `approvalChangesRequestedA`.
* [ ] T015-3123 — Crear seed `approvalRejectedA`.
* [ ] T015-3124 — Crear seed `attachmentAttendanceSheetA`.
* [ ] T015-3125 — Crear seed `attachmentVotingReportA`.
* [ ] T015-3126 — Crear seed `attachmentSupportPdfA`.
* [ ] T015-3127 — Crear seed `artifactPdfGeneratedA`.
* [ ] T015-3128 — Crear seed `artifactDraftPdfA`.
* [ ] T015-3129 — Crear seed `artifactHashManifestA`.
* [ ] T015-3130 — Crear seed `publicationOwnersA`.
* [ ] T015-3131 — Crear seed `publicationResidentsA`.
* [ ] T015-3132 — Crear seed `publicationBoardA`.
* [ ] T015-3133 — Crear seed `publicationRevokedA`.
* [ ] T015-3134 — Crear seed `publicationExpiredA`.
* [ ] T015-3135 — Crear seed `accessLogViewAllowedA`.
* [ ] T015-3136 — Crear seed `accessLogDownloadAllowedA`.
* [ ] T015-3137 — Crear seed `accessLogDownloadDeniedA`.

---

## 30.2. Prohibiciones en seeds

* [ ] T015-3150 — Verificar que no hay nombres reales.
* [ ] T015-3151 — Verificar que no hay emails reales.
* [ ] T015-3152 — Verificar que no hay teléfonos reales.
* [ ] T015-3153 — Verificar que no hay cédulas reales.
* [ ] T015-3154 — Verificar que no hay actas reales.
* [ ] T015-3155 — Verificar que no hay documentos reales.
* [ ] T015-3156 — Verificar que no hay firmas reales.
* [ ] T015-3157 — Verificar que no hay votos reales.
* [ ] T015-3158 — Verificar que no hay storageKeys reales.
* [ ] T015-3159 — Verificar que no hay URLs firmadas reales.
* [ ] T015-3160 — Verificar que no hay tokens.
* [ ] T015-3161 — Verificar que no hay secretos.
* [ ] T015-3162 — Verificar que no hay datos financieros reales.
* [ ] T015-3163 — Verificar que no hay datos sancionatorios reales.

---

# 31. Fase 27 — Performance

## 31.1. Escenarios

* [ ] T015-3201 — Medir `GET /tenant/certified-minutes` con 1.000 actas por tenant.
* [ ] T015-3202 — Medir `GET /tenant/certified-minutes/{id}/versions` con 50 versiones.
* [ ] T015-3203 — Medir `GET /tenant/certified-minutes/{id}/sections` con 100 secciones.
* [ ] T015-3204 — Medir `GET /tenant/certified-minutes/{id}/artifacts` con 50 artefactos.
* [ ] T015-3205 — Medir `GET /me/certified-minutes` con 100 actas publicadas autorizadas.
* [ ] T015-3206 — Medir `GET /me/certified-minutes/{id}` con acta de 30 páginas.
* [ ] T015-3207 — Medir `POST /artifacts/generate-pdf` con acta de 30 páginas.
* [ ] T015-3208 — Medir descarga de PDF con streaming.

---

## 31.2. Validaciones

* [ ] T015-3220 — Verificar `p95 < 700 ms` para listados paginados.
* [ ] T015-3221 — Verificar `p95 < 1500 ms` para consultar acta publicada.
* [ ] T015-3222 — Verificar `p95 < 5000 ms` para generar PDF de hasta 30 páginas.
* [ ] T015-3223 — Verificar paginación obligatoria.
* [ ] T015-3224 — Verificar `pageSize` máximo 100.
* [ ] T015-3225 — Verificar ausencia de N+1 evidente.
* [ ] T015-3226 — Verificar uso de índices.
* [ ] T015-3227 — Verificar que listados no cargan contenido completo.
* [ ] T015-3228 — Verificar que listados no cargan binarios.
* [ ] T015-3229 — Verificar que no se genera PDF en cada consulta.
* [ ] T015-3230 — Verificar que no se recalcula hash en cada listado.
* [ ] T015-3231 — Verificar streaming de descargas.
* [ ] T015-3232 — Ejecutar `npm run test:certified-minutes:performance` si existe.

---

# 32. Fase 28 — Concurrencia

## 32.1. Concurrencia crítica

* [ ] T015-3301 — Probar dos requests simultáneos creando acta para misma reunión.
* [ ] T015-3302 — Garantizar una acta creada y un 409.
* [ ] T015-3303 — Probar dos requests simultáneos generando PDF oficial para misma versión.
* [ ] T015-3304 — Garantizar un PDF oficial activo si índice parcial aplica.
* [ ] T015-3305 — Probar dos requests simultáneos publicando misma versión/audiencia.
* [ ] T015-3306 — Garantizar una publicación activa si política aplica.
* [ ] T015-3307 — Mapear errores de constraint a códigos de dominio.
* [ ] T015-3308 — Ejecutar tests de concurrencia.

---

# 33. Fase 29 — Smoke test

## 33.1. Flujo mínimo

* [ ] T015-3401 — Ejecutar `GET /api/v1/health`.
* [ ] T015-3402 — Crear acta certificada.
* [ ] T015-3403 — Importar desde `MeetingMinutes`.
* [ ] T015-3404 — Listar versiones.
* [ ] T015-3405 — Listar secciones.
* [ ] T015-3406 — Editar una sección.
* [ ] T015-3407 — Enviar a revisión.
* [ ] T015-3408 — Aprobar acta.
* [ ] T015-3409 — Sellar acta.
* [ ] T015-3410 — Generar PDF.
* [ ] T015-3411 — Listar artefactos.
* [ ] T015-3412 — Publicar acta.
* [ ] T015-3413 — Consultar acta desde `/me`.
* [ ] T015-3414 — Consultar detalle desde `/me`.
* [ ] T015-3415 — Listar artefactos desde `/me`.
* [ ] T015-3416 — Descargar PDF desde `/me`.
* [ ] T015-3417 — Revocar publicación.
* [ ] T015-3418 — Verificar que `/me` ya no descarga publicación revocada.
* [ ] T015-3419 — Verificar que endpoint público de actas no existe.
* [ ] T015-3420 — Ejecutar `npm run test:certified-minutes:smoke`.

---

# 34. Fase 30 — CI/CD

## 34.1. Scripts

* [ ] T015-3501 — Agregar script `test:certified-minutes`.
* [ ] T015-3502 — Agregar script `test:certified-minutes:unit`.
* [ ] T015-3503 — Agregar script `test:certified-minutes:domain`.
* [ ] T015-3504 — Agregar script `test:certified-minutes:dto`.
* [ ] T015-3505 — Agregar script `test:certified-minutes:application`.
* [ ] T015-3506 — Agregar script `test:certified-minutes:repositories`.
* [ ] T015-3507 — Agregar script `test:certified-minutes:storage`.
* [ ] T015-3508 — Agregar script `test:certified-minutes:pdf`.
* [ ] T015-3509 — Agregar script `test:certified-minutes:api`.
* [ ] T015-3510 — Agregar script `test:certified-minutes:authorization`.
* [ ] T015-3511 — Agregar script `test:certified-minutes:own-resource`.
* [ ] T015-3512 — Agregar script `test:certified-minutes:audience`.
* [ ] T015-3513 — Agregar script `test:certified-minutes:multitenancy`.
* [ ] T015-3514 — Agregar script `test:certified-minutes:integrity`.
* [ ] T015-3515 — Agregar script `test:certified-minutes:publication`.
* [ ] T015-3516 — Agregar script `test:certified-minutes:notifications`.
* [ ] T015-3517 — Agregar script `test:certified-minutes:audit`.
* [ ] T015-3518 — Agregar script `test:certified-minutes:observability`.
* [ ] T015-3519 — Agregar script `test:certified-minutes:security`.
* [ ] T015-3520 — Agregar script `test:certified-minutes:openapi`.
* [ ] T015-3521 — Agregar script `test:certified-minutes:performance`.
* [ ] T015-3522 — Agregar script `test:certified-minutes:smoke`.

---

## 34.2. Gates

* [ ] T015-3540 — Gate lint.
* [ ] T015-3541 — Gate typecheck.
* [ ] T015-3542 — Gate unit tests.
* [ ] T015-3543 — Gate domain tests.
* [ ] T015-3544 — Gate DTO validation tests.
* [ ] T015-3545 — Gate application tests.
* [ ] T015-3546 — Gate repository tests.
* [ ] T015-3547 — Gate storage tests.
* [ ] T015-3548 — Gate PDF tests.
* [ ] T015-3549 — Gate API tests.
* [ ] T015-3550 — Gate authorization tests.
* [ ] T015-3551 — Gate own-resource tests.
* [ ] T015-3552 — Gate audience tests.
* [ ] T015-3553 — Gate multitenancy tests.
* [ ] T015-3554 — Gate integrity tests.
* [ ] T015-3555 — Gate publication tests.
* [ ] T015-3556 — Gate notification tests.
* [ ] T015-3557 — Gate audit tests.
* [ ] T015-3558 — Gate observability tests.
* [ ] T015-3559 — Gate security tests.
* [ ] T015-3560 — Gate OpenAPI validation.
* [ ] T015-3561 — Gate public endpoint negative tests.
* [ ] T015-3562 — Gate duplicate active certified minutes concurrency test.
* [ ] T015-3563 — Gate build.

---

# 35. Fase 31 — Documentación final

## 35.1. Actualización documental

* [ ] T015-3601 — Actualizar `docs/specs/015-certified-minutes/spec.md` si cambió el alcance.
* [ ] T015-3602 — Actualizar `docs/specs/015-certified-minutes/plan.md` si cambió la arquitectura.
* [ ] T015-3603 — Actualizar `docs/specs/015-certified-minutes/data-model.md` si cambió el modelo.
* [ ] T015-3604 — Actualizar `docs/specs/015-certified-minutes/api-contract.md` si cambió el contrato.
* [ ] T015-3605 — Actualizar `docs/specs/015-certified-minutes/test-plan.md` si cambiaron pruebas.
* [ ] T015-3606 — Actualizar `docs/specs/015-certified-minutes/tasks.md`.
* [ ] T015-3607 — Crear o actualizar `docs/specs/015-certified-minutes/security-notes.md`.
* [ ] T015-3608 — Actualizar OpenAPI.
* [ ] T015-3609 — Actualizar README técnico del módulo si existe.
* [ ] T015-3610 — Actualizar changelog interno si aplica.
* [ ] T015-3611 — Documentar advertencia de que hash interno no es firma electrónica legal.
* [ ] T015-3612 — Documentar diferidos para firma electrónica, sellado externo y verificación pública.

---

# 36. Checklist de aceptación funcional

* [ ] T015-3701 — Se crean actas certificadas vinculadas a reuniones.
* [ ] T015-3702 — Se impide crear acta sin `meetingId`.
* [ ] T015-3703 — Se impide usar reunión de otro tenant.
* [ ] T015-3704 — Se impide más de un acta activa principal por reunión.
* [ ] T015-3705 — Se importa contenido desde `MeetingMinutes`.
* [ ] T015-3706 — Se crean versiones incrementales.
* [ ] T015-3707 — Se conservan versiones previas.
* [ ] T015-3708 — Se crean secciones estructuradas.
* [ ] T015-3709 — Se editan secciones en versión editable.
* [ ] T015-3710 — Se impide editar versión sellada.
* [ ] T015-3711 — Se envía acta a revisión.
* [ ] T015-3712 — Se aprueba acta.
* [ ] T015-3713 — Se rechaza acta con comentarios.
* [ ] T015-3714 — Se solicitan cambios con comentarios.
* [ ] T015-3715 — Se sella internamente con SHA-256.
* [ ] T015-3716 — Se genera PDF oficial desde versión sellada.
* [ ] T015-3717 — Se impide PDF oficial desde draft.
* [ ] T015-3718 — Se suben adjuntos válidos.
* [ ] T015-3719 — Se rechazan adjuntos inválidos.
* [ ] T015-3720 — Se publica acta sellada.
* [ ] T015-3721 — Se exige audiencia para publicación.
* [ ] T015-3722 — Se revoca publicación con razón.
* [ ] T015-3723 — Usuarios autorizados consultan actas publicadas desde `/me`.
* [ ] T015-3724 — Usuarios no autorizados no consultan actas ajenas.
* [ ] T015-3725 — Usuarios autorizados descargan PDF publicado.
* [ ] T015-3726 — Publicación revocada no se descarga.
* [ ] T015-3727 — Publicación expirada no se descarga.
* [ ] T015-3728 — Se auditan operaciones críticas.
* [ ] T015-3729 — Se emiten eventos de notificación.
* [ ] T015-3730 — No existen endpoints públicos.

---

# 37. Checklist de aceptación técnica

* [ ] T015-3801 — Todas las tablas nuevas tienen `tenant_id`.
* [ ] T015-3802 — Todas las consultas filtran por `tenant_id`.
* [ ] T015-3803 — Ningún endpoint acepta `tenantId` desde body.
* [ ] T015-3804 — No se busca `CertifiedMinutes` solo por `id`.
* [ ] T015-3805 — No se busca `CertifiedMinutesVersion` solo por `id`.
* [ ] T015-3806 — No se busca `CertifiedMinutesSection` solo por `id`.
* [ ] T015-3807 — No se busca `CertifiedMinutesApproval` solo por `id`.
* [ ] T015-3808 — No se busca `CertifiedMinutesAttachment` solo por `id`.
* [ ] T015-3809 — No se busca `CertifiedMinutesArtifact` solo por `id`.
* [ ] T015-3810 — No se busca `CertifiedMinutesPublication` solo por `id`.
* [ ] T015-3811 — No se busca `CertifiedMinutesAccessLog` solo por `id`.
* [ ] T015-3812 — `meetingId` se valida contra tenant.
* [ ] T015-3813 — `sourceMeetingMinutesId` se valida contra tenant.
* [ ] T015-3814 — `versionId` se valida contra tenant.
* [ ] T015-3815 — `attachmentId` se valida contra tenant.
* [ ] T015-3816 — `artifactId` se valida contra tenant.
* [ ] T015-3817 — `publicationId` se valida contra tenant.
* [ ] T015-3818 — `audienceRules` se validan contra tenant.
* [ ] T015-3819 — `storageKey` no se expone por API.
* [ ] T015-3820 — URL firmada persistente no se expone por API.
* [ ] T015-3821 — Hash es reproducible.
* [ ] T015-3822 — Cambio material cambia hash.
* [ ] T015-3823 — Logs no incluyen contenido completo.
* [ ] T015-3824 — Auditoría no incluye contenido completo.
* [ ] T015-3825 — OpenAPI no documenta endpoints públicos.
* [ ] T015-3826 — CI pasa.

---

# 38. Checklist de no regresión

* [ ] T015-3901 — No se rompe `001-tenants`.
* [ ] T015-3902 — No se rompe `002-users-roles`.
* [ ] T015-3903 — No se rompe `003-residents-properties`.
* [ ] T015-3904 — No se rompe `007-audit`.
* [ ] T015-3905 — No se rompe `012-communications-notifications`.
* [ ] T015-3906 — No se rompe `013-meetings-attendance`.
* [ ] T015-3907 — No se rompe `014-voting-basic`.
* [ ] T015-3908 — No se rompe OpenAPI general.
* [ ] T015-3909 — No se rompe autenticación Keycloak/OIDC.
* [ ] T015-3910 — No se rompe tenant active context.
* [ ] T015-3911 — No se rompe autorización por permisos.
* [ ] T015-3912 — No se rompe storage general si existe.
* [ ] T015-3913 — No se rompe CI/CD.

---

# 39. Comandos sugeridos

## 39.1. Comandos específicos

```bash id="zw4l29"
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

## 39.2. Comandos generales

```bash id="c5d089"
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

# 40. Orden recomendado de ejecución

## 40.1. Implementación mínima segura

```text id="b950bx"
1. Estructura base.
2. Enums y value objects.
3. Entidades.
4. State machines.
5. Canonicalización y hash.
6. Prisma schema y migraciones.
7. Repositorios.
8. Integraciones con Meetings.
9. Creación de acta e importación.
10. Versiones.
11. Secciones.
12. Revisión y aprobación.
13. Sellado interno.
14. PDF y artefactos.
15. Storage y descargas.
16. Adjuntos.
17. Publicación.
18. Audiencias.
19. Endpoints administrativos.
20. Endpoints /me.
21. Auditoría.
22. Notificaciones.
23. Observabilidad.
24. OpenAPI.
25. Security tests.
26. Smoke tests.
27. CI.
```

---

## 40.2. Orden de PRs sugerido

```text id="r0blcz"
PR-015-01 — Module skeleton, enums and value objects.
PR-015-02 — Domain entities and state machines.
PR-015-03 — Canonicalization, SHA-256 hash and seal service.
PR-015-04 — Prisma schema, migration and repositories.
PR-015-05 — MeetingMinutes import and section management.
PR-015-06 — Versioning and approval workflow.
PR-015-07 — PDF generation and artifact model.
PR-015-08 — Storage, attachments and secure downloads.
PR-015-09 — Publication and audience authorization.
PR-015-10 — My Certified Minutes endpoints.
PR-015-11 — Audit, notifications and observability.
PR-015-12 — OpenAPI, tests and security hardening.
```

---

# 41. Tareas diferidas explícitas

Estas tareas quedan fuera del MVP y no deben implementarse dentro de esta spec:

```text id="g433uj"
[-] Firma electrónica legalmente válida.
[-] Firma electrónica avanzada.
[-] Firma electrónica cualificada.
[-] Proveedor externo de firma.
[-] Sellado de tiempo certificado por tercero.
[-] Certificación notarial.
[-] Integración con Registro de la Propiedad u organismo externo.
[-] Verificación pública externa.
[-] Blockchain.
[-] OCR de actas físicas.
[-] Escaneo automático de firmas manuscritas.
[-] Firma biométrica.
[-] Reconocimiento de voz.
[-] Transcripción automática.
[-] Videograbación.
[-] IA con actas reales.
[-] Validación legal automática.
[-] Flujo de impugnaciones legales.
[-] Recuento formal.
[-] Reglas legales avanzadas.
[-] Ejecución automática de resoluciones.
[-] Generación automática de cargos.
[-] Generación automática de multas.
[-] Publicación pública en WordPress.
[-] Verificación pública con QR.
```

---

# 42. No aceptación

La implementación no debe aceptarse si:

```text id="e70em5"
- permite actas cross-tenant;
- permite versiones cross-tenant;
- permite secciones cross-tenant;
- permite aprobaciones cross-tenant;
- permite adjuntos cross-tenant;
- permite artefactos cross-tenant;
- permite publicaciones cross-tenant;
- permite access logs cross-tenant;
- permite usar meetingId de otro tenant;
- permite usar sourceMeetingMinutesId de otro tenant;
- permite usar votingResultId de otro tenant;
- permite usar meetingResolutionId de otro tenant;
- permite crear más de un acta activa principal por reunión;
- permite editar versión sellada;
- permite editar sección de versión sellada;
- permite publicar sin sellar;
- permite publicar sin audiencia;
- permite descargar PDF sin autorización;
- permite descargar publicación revocada;
- permite descargar publicación expirada;
- expone storageKey;
- expone URL firmada persistente;
- genera PDF oficial desde draft sin marca de borrador;
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

# 43. Resultado esperado

Al completar estas tareas, el módulo `015-certified-minutes` deberá permitir gestionar actas formales internas de forma segura, versionada, auditable y preparada para evolución legal futura.

Debe quedar implementado:

```text id="k2uj20"
- Certified minutes management.
- Meeting-bound certified minutes.
- Import from MeetingMinutes.
- Structured sections.
- Incremental versions.
- Version immutability after seal.
- Review workflow.
- Approval workflow.
- Changes requested workflow.
- Internal SHA-256 seal.
- Reproducible canonical hash.
- PDF artifact generation.
- Secure storage abstraction.
- Attachments.
- Controlled publication.
- Audience authorization.
- Own certified minutes API.
- Secure downloads.
- Access logs.
- Notification events.
- Audit events.
- Safe logs.
- Safe metrics.
- OpenAPI.
- Security tests.
- CI gates.
```

El módulo debe quedar preparado para futuras specs de:

```text id="lguyua"
00X-electronic-signatures
00X-external-timestamping
00X-document-public-verification
00X-certified-minutes-qr-verification
00X-advanced-voting-rules
00X-weighted-voting
00X-voting-appeals
00X-legal-workflows
00X-ai-assisted-minutes
00X-meeting-recordings
00X-document-retention-policy
```
