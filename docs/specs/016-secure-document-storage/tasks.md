# Tasks — Spec 016 Secure Document Storage

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                                 |
| Spec ID         | 016                                                                                                                                                                           |
| Módulo          | Secure Document Storage                                                                                                                                                       |
| Documento       | Tasks                                                                                                                                                                         |
| Ruta            | `docs/specs/016-secure-document-storage/tasks.md`                                                                                                                             |
| Versión         | 0.1                                                                                                                                                                           |
| Estado          | needs-review                                                                                                                                                                  |
| Fecha           | 2026-07-21                                                                                                                                                                    |
| Documento base  | `docs/specs/016-secure-document-storage/spec.md`                                                                                                                              |
| Plan técnico    | `docs/specs/016-secure-document-storage/plan.md`                                                                                                                              |
| Modelo de datos | `docs/specs/016-secure-document-storage/data-model.md`                                                                                                                        |
| Contrato API    | `docs/specs/016-secure-document-storage/api-contract.md`                                                                                                                      |
| Plan de pruebas | `docs/specs/016-secure-document-storage/test-plan.md`                                                                                                                         |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `005-payments`, `007-audit`, `011-fines-sanctions`, `012-communications-notifications`, `015-certified-minutes` |
| Naturaleza      | Tenant-scoped / Storage-backed / Metadata-driven / Hash-aware / Access-controlled / Source-module-aware / Own-resource-aware / Audit-heavy / Non-public by default            |

---

## 2. Propósito

Este documento convierte la especificación `016-secure-document-storage` en una lista ejecutable de tareas técnicas.

El objetivo es guiar la implementación del módulo transversal de almacenamiento documental seguro de RESIDENT Core, incluyendo registro de documentos, versionado, archivos físicos, metadata segura, validación de archivos, hash SHA-256, abstracción de storage, carga, descarga, acceso propio, autorización delegada al módulo origen, auditoría, access logs, configuración platform, observabilidad, OpenAPI y pruebas de seguridad.

Regla central:

```text
Cada tarea debe preservar tenant isolation, source resource validation, owner validation, storageKey protection, hash integrity, file validation, secure download, access logging, audit trail, safe metadata, no binary JSON, no public endpoints y no local storage productivo por defecto.
```

---

## 3. Convenciones

### 3.1. Estados de tarea

```text
[ ] Pendiente
[x] Completada
[-] Diferida
[!] Bloqueada
```

---

### 3.2. Criterios generales de completitud

Una tarea se considera completada solo si:

```text
- el código compila;
- los tests asociados pasan;
- toda consulta aplica tenant_id;
- no se acepta tenantId desde body;
- no se acepta storageKey desde cliente;
- sourceResourceId se valida contra tenant;
- ownerId se valida contra tenant;
- audienceRules se validan contra tenant si aplica;
- storageKey se genera en servidor;
- storageKey no se expone en DTOs, errores, logs, auditoría ni OpenAPI;
- fileHash se calcula sobre bytes reales;
- MIME type, extensión, tamaño y filename se validan;
- path traversal queda bloqueado;
- descarga requiere autorización;
- descarga registra access log;
- descarga genera auditoría;
- archivos quarantined, rejected, archived, missing o failed no se descargan;
- documentos archived no aparecen por defecto;
- binarios no viajan en JSON;
- binarios no aparecen en logs;
- binarios no aparecen en auditoría;
- endpoints públicos no existen;
- OpenAPI no documenta endpoints públicos;
- local storage no queda habilitado por defecto en producción;
- CI pasa.
```

---

### 3.3. Reglas para agentes IA

Antes de ejecutar estas tareas, cualquier agente IA debe leer:

```text
docs/sdd/constitution.md
docs/sdd/domain-map.md
docs/sdd/architecture.md
docs/sdd/security.md
docs/sdd/api-guidelines.md
docs/sdd/data-governance.md
docs/specs/001-tenants/
docs/specs/002-users-roles/
docs/specs/003-residents-properties/
docs/specs/005-payments/
docs/specs/007-audit/
docs/specs/011-fines-sanctions/
docs/specs/012-communications-notifications/
docs/specs/015-certified-minutes/
docs/specs/016-secure-document-storage/spec.md
docs/specs/016-secure-document-storage/plan.md
docs/specs/016-secure-document-storage/data-model.md
docs/specs/016-secure-document-storage/api-contract.md
docs/specs/016-secure-document-storage/test-plan.md
docs/specs/016-secure-document-storage/tasks.md
```

El agente no debe:

```text
- aceptar tenantId desde body;
- aceptar storageKey desde cliente;
- buscar documentos solo por id;
- buscar versiones solo por id;
- buscar archivos solo por id;
- buscar links solo por id;
- buscar policies solo por id;
- buscar access logs solo por id;
- permitir documentos cross-tenant;
- permitir archivos cross-tenant;
- permitir versiones cross-tenant;
- permitir sourceResourceId de otro tenant;
- permitir ownerUserId de otro tenant;
- permitir ownerPersonId de otro tenant;
- permitir ownerPropertyUnitId de otro tenant;
- permitir audienceRules cross-tenant;
- exponer storageKey;
- exponer bucket o path interno;
- exponer URL firmada persistente;
- guardar binarios en JSON;
- guardar base64 del archivo en metadata;
- registrar binarios en logs;
- registrar binarios en auditoría;
- crear endpoints públicos;
- documentar endpoints públicos en OpenAPI;
- permitir local storage productivo por defecto;
- enviar documentos reales a IA externa.
```

---

# 4. Fase 0 — Preparación

## 4.1. Revisión documental

* [ ] T016-0001 — Revisar `docs/specs/016-secure-document-storage/spec.md`.
* [ ] T016-0002 — Revisar `docs/specs/016-secure-document-storage/plan.md`.
* [ ] T016-0003 — Revisar `docs/specs/016-secure-document-storage/data-model.md`.
* [ ] T016-0004 — Revisar `docs/specs/016-secure-document-storage/api-contract.md`.
* [ ] T016-0005 — Revisar `docs/specs/016-secure-document-storage/test-plan.md`.
* [ ] T016-0006 — Confirmar dependencias con `001-tenants`.
* [ ] T016-0007 — Confirmar dependencias con `002-users-roles`.
* [ ] T016-0008 — Confirmar dependencias con `003-residents-properties`.
* [ ] T016-0009 — Confirmar dependencias con `005-payments`.
* [ ] T016-0010 — Confirmar dependencias con `007-audit`.
* [ ] T016-0011 — Confirmar dependencias con `011-fines-sanctions`.
* [ ] T016-0012 — Confirmar dependencias con `012-communications-notifications`.
* [ ] T016-0013 — Confirmar dependencias con `015-certified-minutes`.
* [ ] T016-0014 — Confirmar lineamientos de `docs/sdd/security.md`.
* [ ] T016-0015 — Confirmar lineamientos de `docs/sdd/data-governance.md`.
* [ ] T016-0016 — Confirmar lineamientos de `docs/sdd/api-guidelines.md`.

---

## 4.2. Validación de alcance MVP

* [ ] T016-0020 — Confirmar que el módulo es transversal y no reemplaza lógica documental específica.
* [ ] T016-0021 — Confirmar que se implementa registro lógico de documentos.
* [ ] T016-0022 — Confirmar que se implementan versiones simples.
* [ ] T016-0023 — Confirmar que se implementa registro de archivos físicos.
* [ ] T016-0024 — Confirmar que se implementa metadata segura.
* [ ] T016-0025 — Confirmar que se implementa clasificación por categoría.
* [ ] T016-0026 — Confirmar que se implementa clasificación por sensibilidad.
* [ ] T016-0027 — Confirmar que se implementa clasificación por visibilidad.
* [ ] T016-0028 — Confirmar que se implementa vínculo con módulo origen.
* [ ] T016-0029 — Confirmar que se implementa validación de recurso origen.
* [ ] T016-0030 — Confirmar que se implementa owner lógico.
* [ ] T016-0031 — Confirmar que se implementa upload seguro.
* [ ] T016-0032 — Confirmar que se implementa download seguro.
* [ ] T016-0033 — Confirmar que se implementa hash SHA-256.
* [ ] T016-0034 — Confirmar que se implementa validación de MIME type.
* [ ] T016-0035 — Confirmar que se implementa validación de tamaño.
* [ ] T016-0036 — Confirmar que se implementa sanitización de filename.
* [ ] T016-0037 — Confirmar que se bloquea path traversal.
* [ ] T016-0038 — Confirmar que `storageKey` se genera en servidor.
* [ ] T016-0039 — Confirmar que `storageKey` no se expone.
* [ ] T016-0040 — Confirmar que se implementa local storage solo para desarrollo.
* [ ] T016-0041 — Confirmar que se prepara adapter S3-compatible.
* [ ] T016-0042 — Confirmar que se implementan access logs.
* [ ] T016-0043 — Confirmar que se implementa auditoría.
* [ ] T016-0044 — Confirmar que se implementa archivo lógico.
* [ ] T016-0045 — Confirmar que se implementa restauración administrativa.
* [ ] T016-0046 — Confirmar que se implementan endpoints administrativos.
* [ ] T016-0047 — Confirmar que se implementan endpoints `/me` limitados.
* [ ] T016-0048 — Confirmar que se implementan endpoints platform de configuración.
* [ ] T016-0049 — Confirmar que no habrá endpoints públicos en MVP.
* [ ] T016-0050 — Confirmar que antivirus real queda diferido.
* [ ] T016-0051 — Confirmar que OCR queda diferido.
* [ ] T016-0052 — Confirmar que IA sobre documentos reales queda diferida.
* [ ] T016-0053 — Confirmar que firma electrónica queda diferida.
* [ ] T016-0054 — Confirmar que retención avanzada queda diferida.
* [ ] T016-0055 — Confirmar que eliminación física automática queda diferida.
* [ ] T016-0056 — Confirmar que publicación pública queda diferida.

---

# 5. Fase 1 — Estructura base del módulo

## 5.1. Crear estructura de carpetas

* [ ] T016-0101 — Crear carpeta `apps/api/src/modules/secure-document-storage/`.
* [ ] T016-0102 — Crear `secure-document-storage.module.ts`.
* [ ] T016-0103 — Crear carpeta `controllers/`.
* [ ] T016-0104 — Crear carpeta `application/use-cases/`.
* [ ] T016-0105 — Crear carpeta `application/services/`.
* [ ] T016-0106 — Crear carpeta `application/ports/`.
* [ ] T016-0107 — Crear carpeta `domain/entities/`.
* [ ] T016-0108 — Crear carpeta `domain/value-objects/`.
* [ ] T016-0109 — Crear carpeta `domain/events/`.
* [ ] T016-0110 — Crear carpeta `domain/errors/`.
* [ ] T016-0111 — Crear carpeta `infrastructure/persistence/`.
* [ ] T016-0112 — Crear carpeta `infrastructure/storage/`.
* [ ] T016-0113 — Crear carpeta `infrastructure/hash/`.
* [ ] T016-0114 — Crear carpeta `infrastructure/validators/`.
* [ ] T016-0115 — Crear carpeta `infrastructure/integrations/`.
* [ ] T016-0116 — Crear carpeta `infrastructure/audit/`.
* [ ] T016-0117 — Crear carpeta `dto/`.
* [ ] T016-0118 — Crear carpeta `guards/`.
* [ ] T016-0119 — Crear carpeta `policies/`.
* [ ] T016-0120 — Crear carpeta `mappers/`.
* [ ] T016-0121 — Crear carpeta `tests/`.
* [ ] T016-0122 — Crear carpeta `tests/fixtures/`.
* [ ] T016-0123 — Crear carpeta `tests/factories/`.

---

## 5.2. Registrar módulo

* [ ] T016-0130 — Registrar `SecureDocumentStorageModule` en el módulo principal de la API.
* [ ] T016-0131 — Inyectar Prisma.
* [ ] T016-0132 — Inyectar puerto de auditoría.
* [ ] T016-0133 — Inyectar puerto de roles/permisos.
* [ ] T016-0134 — Inyectar puerto de tenants.
* [ ] T016-0135 — Inyectar puerto de user profiles.
* [ ] T016-0136 — Inyectar puerto de persons.
* [ ] T016-0137 — Inyectar puerto de property units.
* [ ] T016-0138 — Inyectar puerto de payments.
* [ ] T016-0139 — Inyectar puerto de fines.
* [ ] T016-0140 — Inyectar puerto de communications.
* [ ] T016-0141 — Inyectar puerto de certified minutes.
* [ ] T016-0142 — Inyectar puerto de reports.
* [ ] T016-0143 — Inyectar `SecureDocumentStoragePort`.
* [ ] T016-0144 — Inyectar `SecureDocumentHashPort`.
* [ ] T016-0145 — Inyectar `SecureDocumentFileValidatorPort`.
* [ ] T016-0146 — Validar que el módulo compila vacío.
* [ ] T016-0147 — Crear smoke test de carga del módulo.

---

# 6. Fase 2 — Enums y Value Objects

## 6.1. Enums de dominio

* [ ] T016-0201 — Implementar `DocumentStatus`.
* [ ] T016-0202 — Implementar `DocumentVersionStatus`.
* [ ] T016-0203 — Implementar `DocumentFileStatus`.
* [ ] T016-0204 — Implementar `DocumentVisibility`.
* [ ] T016-0205 — Implementar `DocumentSensitivity`.
* [ ] T016-0206 — Implementar `DocumentCategory`.
* [ ] T016-0207 — Implementar `SourceModule`.
* [ ] T016-0208 — Implementar `StorageProvider`.
* [ ] T016-0209 — Implementar `FileScanStatus`.
* [ ] T016-0210 — Implementar `DocumentAccessType`.
* [ ] T016-0211 — Implementar `DocumentAccessOutcome`.
* [ ] T016-0212 — Implementar `DocumentPolicyType`.
* [ ] T016-0213 — Implementar `DocumentOwnerType`.
* [ ] T016-0214 — Implementar `DocumentLinkType`.
* [ ] T016-0215 — Implementar `MimeGroup`.
* [ ] T016-0216 — Implementar `HashAlgorithm`.
* [ ] T016-0217 — Confirmar que `publicEligible` no habilita endpoints públicos.

---

## 6.2. Value Objects

* [ ] T016-0220 — Implementar `DocumentTitle`.
* [ ] T016-0221 — Implementar `DocumentDescription`.
* [ ] T016-0222 — Implementar `SourceResourceRef`.
* [ ] T016-0223 — Implementar `DocumentOwnerRef`.
* [ ] T016-0224 — Implementar `DocumentFileName`.
* [ ] T016-0225 — Implementar `DocumentSafeFileName`.
* [ ] T016-0226 — Implementar `DocumentMimeType`.
* [ ] T016-0227 — Implementar `DocumentExtension`.
* [ ] T016-0228 — Implementar `DocumentFileSize`.
* [ ] T016-0229 — Implementar `DocumentStorageKey`.
* [ ] T016-0230 — Implementar `DocumentHash`.
* [ ] T016-0231 — Implementar `DocumentHashPrefix`.
* [ ] T016-0232 — Implementar `DocumentHashAlgorithm`.
* [ ] T016-0233 — Implementar `DocumentMetadata`.
* [ ] T016-0234 — Implementar `DocumentAudienceRules`.
* [ ] T016-0235 — Implementar `DocumentRetentionPolicyRef`.
* [ ] T016-0236 — Implementar `DocumentAccessMetadata`.
* [ ] T016-0237 — Implementar `StorageProviderConfig`.
* [ ] T016-0238 — Implementar `TemporaryDownloadUrl`.

---

## 6.3. Sanitización de metadata

* [ ] T016-0250 — Implementar sanitización de `title`.
* [ ] T016-0251 — Implementar sanitización de `description`.
* [ ] T016-0252 — Implementar sanitización de `metadata`.
* [ ] T016-0253 — Implementar sanitización de `archiveReason`.
* [ ] T016-0254 — Implementar sanitización de `changeReason`.
* [ ] T016-0255 — Implementar sanitización de `fileName`.
* [ ] T016-0256 — Bloquear `password`.
* [ ] T016-0257 — Bloquear `token`.
* [ ] T016-0258 — Bloquear `apiKey`.
* [ ] T016-0259 — Bloquear `clientSecret`.
* [ ] T016-0260 — Bloquear `Authorization`.
* [ ] T016-0261 — Bloquear `cookie`.
* [ ] T016-0262 — Bloquear `storageKey`.
* [ ] T016-0263 — Bloquear `bucket`.
* [ ] T016-0264 — Bloquear `signedUrl`.
* [ ] T016-0265 — Bloquear `base64` de archivos.
* [ ] T016-0266 — Bloquear contenido binario en metadata.
* [ ] T016-0267 — Bloquear stack traces.
* [ ] T016-0268 — Bloquear SQL raw.
* [ ] T016-0269 — Bloquear provider payload completo.
* [ ] T016-0270 — Limitar tamaño máximo de metadata.

---

## 6.4. Tests de enums y value objects

* [ ] T016-0280 — Test `DocumentStatus`.
* [ ] T016-0281 — Test `DocumentVersionStatus`.
* [ ] T016-0282 — Test `DocumentFileStatus`.
* [ ] T016-0283 — Test `DocumentVisibility`.
* [ ] T016-0284 — Test `DocumentSensitivity`.
* [ ] T016-0285 — Test `DocumentCategory`.
* [ ] T016-0286 — Test `SourceModule`.
* [ ] T016-0287 — Test `StorageProvider`.
* [ ] T016-0288 — Test `FileScanStatus`.
* [ ] T016-0289 — Test `DocumentAccessType`.
* [ ] T016-0290 — Test `DocumentAccessOutcome`.
* [ ] T016-0291 — Test `DocumentPolicyType`.
* [ ] T016-0292 — Test `DocumentOwnerType`.
* [ ] T016-0293 — Test `DocumentLinkType`.
* [ ] T016-0294 — Test `MimeGroup`.
* [ ] T016-0295 — Test `HashAlgorithm`.
* [ ] T016-0296 — Test `DocumentFileName`.
* [ ] T016-0297 — Test `DocumentMimeType`.
* [ ] T016-0298 — Test `DocumentFileSize`.
* [ ] T016-0299 — Test `DocumentStorageKey`.
* [ ] T016-0300 — Test `DocumentHash`.
* [ ] T016-0301 — Test `DocumentMetadata`.
* [ ] T016-0302 — Ejecutar `npm run test:secure-document-storage:unit`.

---

# 7. Fase 3 — Entidades de dominio

## 7.1. Entidad `SecureDocument`

* [ ] T016-0401 — Crear `secure-document.entity.ts`.
* [ ] T016-0402 — Implementar creación en estado `draft`.
* [ ] T016-0403 — Validar `tenantId`.
* [ ] T016-0404 — Validar `title`.
* [ ] T016-0405 — Validar `visibility`.
* [ ] T016-0406 — Validar `sensitivity`.
* [ ] T016-0407 — Validar `category`.
* [ ] T016-0408 — Validar `sourceModule`.
* [ ] T016-0409 — Validar `sourceResourceType`.
* [ ] T016-0410 — Validar `sourceResourceId`.
* [ ] T016-0411 — Validar `ownerType`.
* [ ] T016-0412 — Validar `ownerUserId`.
* [ ] T016-0413 — Validar `ownerPersonId`.
* [ ] T016-0414 — Validar `ownerPropertyUnitId`.
* [ ] T016-0415 — Implementar asignación de `currentVersionId`.
* [ ] T016-0416 — Implementar asignación de `activeFileId`.
* [ ] T016-0417 — Implementar actualización de metadata segura.
* [ ] T016-0418 — Implementar archivo lógico.
* [ ] T016-0419 — Implementar restauración.
* [ ] T016-0420 — Implementar transición `draft -> uploaded`.
* [ ] T016-0421 — Implementar transición `uploaded -> available`.
* [ ] T016-0422 — Implementar transición `uploaded -> quarantined`.
* [ ] T016-0423 — Implementar transición `quarantined -> available`.
* [ ] T016-0424 — Implementar transición `quarantined -> rejected`.
* [ ] T016-0425 — Implementar transición `available -> archived`.
* [ ] T016-0426 — Implementar transición `archived -> restored`.
* [ ] T016-0427 — Implementar transición `restored -> available`.
* [ ] T016-0428 — Implementar transición `available -> deletedPending`.
* [ ] T016-0429 — Impedir transición `available -> draft`.
* [ ] T016-0430 — Crear tests de entidad `SecureDocument`.

---

## 7.2. Entidad `SecureDocumentVersion`

* [ ] T016-0450 — Crear `secure-document-version.entity.ts`.
* [ ] T016-0451 — Implementar creación de versión inicial.
* [ ] T016-0452 — Implementar creación de versión incremental.
* [ ] T016-0453 — Validar `tenantId`.
* [ ] T016-0454 — Validar `documentId`.
* [ ] T016-0455 — Validar `versionNumber > 0`.
* [ ] T016-0456 — Requerir `changeReason` para `versionNumber > 1`.
* [ ] T016-0457 — Implementar estado `draft`.
* [ ] T016-0458 — Implementar estado `active`.
* [ ] T016-0459 — Implementar estado `superseded`.
* [ ] T016-0460 — Implementar estado `archived`.
* [ ] T016-0461 — Implementar transición `draft -> active`.
* [ ] T016-0462 — Implementar transición `active -> superseded`.
* [ ] T016-0463 — Implementar transición `active -> archived`.
* [ ] T016-0464 — Implementar transición `superseded -> archived`.
* [ ] T016-0465 — Impedir transición `active -> draft`.
* [ ] T016-0466 — Implementar archivo lógico.
* [ ] T016-0467 — Crear tests de entidad `SecureDocumentVersion`.

---

## 7.3. Entidad `SecureDocumentFile`

* [ ] T016-0480 — Crear `secure-document-file.entity.ts`.
* [ ] T016-0481 — Implementar archivo `pending`.
* [ ] T016-0482 — Implementar archivo `stored`.
* [ ] T016-0483 — Implementar archivo `available`.
* [ ] T016-0484 — Implementar archivo `quarantined`.
* [ ] T016-0485 — Implementar archivo `rejected`.
* [ ] T016-0486 — Implementar archivo `archived`.
* [ ] T016-0487 — Implementar archivo `missing`.
* [ ] T016-0488 — Implementar archivo `failed`.
* [ ] T016-0489 — Validar `tenantId`.
* [ ] T016-0490 — Validar `documentId`.
* [ ] T016-0491 — Validar `versionId`.
* [ ] T016-0492 — Validar `provider`.
* [ ] T016-0493 — Validar `storageKey` interno.
* [ ] T016-0494 — Validar `originalFileName`.
* [ ] T016-0495 — Validar `safeFileName`.
* [ ] T016-0496 — Validar `extension`.
* [ ] T016-0497 — Validar `mimeType`.
* [ ] T016-0498 — Validar `mimeGroup`.
* [ ] T016-0499 — Validar `fileSize > 0`.
* [ ] T016-0500 — Validar `fileHash` cuando `status=available`.
* [ ] T016-0501 — Validar `hashAlgorithm` cuando existe `fileHash`.
* [ ] T016-0502 — Validar `scanStatus`.
* [ ] T016-0503 — Validar `isPrimary`.
* [ ] T016-0504 — Impedir serialización de `storageKey`.
* [ ] T016-0505 — Implementar archivo lógico.
* [ ] T016-0506 — Crear tests de entidad `SecureDocumentFile`.

---

## 7.4. Entidad `SecureDocumentLink`

* [ ] T016-0520 — Crear `secure-document-link.entity.ts`.
* [ ] T016-0521 — Implementar `source`.
* [ ] T016-0522 — Implementar `supporting`.
* [ ] T016-0523 — Implementar `generatedFrom`.
* [ ] T016-0524 — Implementar `attachmentOf`.
* [ ] T016-0525 — Implementar `evidenceOf`.
* [ ] T016-0526 — Implementar `receiptOf`.
* [ ] T016-0527 — Implementar `exportOf`.
* [ ] T016-0528 — Implementar `relatedTo`.
* [ ] T016-0529 — Validar `tenantId`.
* [ ] T016-0530 — Validar `documentId`.
* [ ] T016-0531 — Validar `sourceModule`.
* [ ] T016-0532 — Validar `resourceType`.
* [ ] T016-0533 — Validar `resourceId`.
* [ ] T016-0534 — Validar `linkType`.
* [ ] T016-0535 — Implementar archivo lógico.
* [ ] T016-0536 — Crear tests de entidad `SecureDocumentLink`.

---

## 7.5. Entidad `SecureDocumentPolicy`

* [ ] T016-0550 — Crear `secure-document-policy.entity.ts`.
* [ ] T016-0551 — Implementar policy `default`.
* [ ] T016-0552 — Implementar policy `owner`.
* [ ] T016-0553 — Implementar policy `audience`.
* [ ] T016-0554 — Implementar policy `sourceDelegated`.
* [ ] T016-0555 — Implementar policy `administrative`.
* [ ] T016-0556 — Implementar policy `restricted`.
* [ ] T016-0557 — Implementar policy `temporary`.
* [ ] T016-0558 — Validar `tenantId`.
* [ ] T016-0559 — Validar `documentId`.
* [ ] T016-0560 — Validar `visibility`.
* [ ] T016-0561 — Validar `sensitivity`.
* [ ] T016-0562 — Validar `audienceRules`.
* [ ] T016-0563 — Requerir `audienceRules` para `specificUsers`.
* [ ] T016-0564 — Requerir `audienceRules` para `propertyUnits`.
* [ ] T016-0565 — Requerir `audienceRules` para `roles`.
* [ ] T016-0566 — Requerir `audienceRules` para `mixed`.
* [ ] T016-0567 — Validar `expiresAt`.
* [ ] T016-0568 — Implementar `sourceModuleDelegated`.
* [ ] T016-0569 — Implementar archivo lógico.
* [ ] T016-0570 — Crear tests de entidad `SecureDocumentPolicy`.

---

## 7.6. Entidad `SecureDocumentAccessLog`

* [ ] T016-0580 — Crear `secure-document-access-log.entity.ts`.
* [ ] T016-0581 — Implementar `viewMetadata`.
* [ ] T016-0582 — Implementar `download`.
* [ ] T016-0583 — Implementar `preview`.
* [ ] T016-0584 — Implementar `export`.
* [ ] T016-0585 — Implementar `archive`.
* [ ] T016-0586 — Implementar `restore`.
* [ ] T016-0587 — Implementar outcome `allowed`.
* [ ] T016-0588 — Implementar outcome `denied`.
* [ ] T016-0589 — Implementar outcome `notFound`.
* [ ] T016-0590 — Implementar outcome `expired`.
* [ ] T016-0591 — Implementar outcome `revoked`.
* [ ] T016-0592 — Implementar outcome `quarantined`.
* [ ] T016-0593 — Implementar outcome `rejected`.
* [ ] T016-0594 — Implementar outcome `archived`.
* [ ] T016-0595 — Implementar outcome `error`.
* [ ] T016-0596 — Validar `ipAddressHash`.
* [ ] T016-0597 — Validar `userAgentHash`.
* [ ] T016-0598 — Bloquear metadata con `storageKey`.
* [ ] T016-0599 — Bloquear metadata con URL firmada.
* [ ] T016-0600 — Bloquear metadata con binarios.
* [ ] T016-0601 — Crear tests de entidad `SecureDocumentAccessLog`.

---

# 8. Fase 4 — Prisma y migraciones

## 8.1. Enums Prisma

* [ ] T016-0701 — Agregar enum `DocumentStatus`.
* [ ] T016-0702 — Agregar enum `DocumentVersionStatus`.
* [ ] T016-0703 — Agregar enum `DocumentFileStatus`.
* [ ] T016-0704 — Agregar enum `DocumentVisibility`.
* [ ] T016-0705 — Agregar enum `DocumentSensitivity`.
* [ ] T016-0706 — Agregar enum `DocumentCategory`.
* [ ] T016-0707 — Agregar enum `SourceModule`.
* [ ] T016-0708 — Agregar enum `StorageProvider`.
* [ ] T016-0709 — Agregar enum `FileScanStatus`.
* [ ] T016-0710 — Agregar enum `DocumentAccessType`.
* [ ] T016-0711 — Agregar enum `DocumentAccessOutcome`.
* [ ] T016-0712 — Agregar enum `DocumentPolicyType`.
* [ ] T016-0713 — Agregar enum `DocumentOwnerType`.
* [ ] T016-0714 — Agregar enum `DocumentLinkType`.
* [ ] T016-0715 — Agregar enum `MimeGroup`.
* [ ] T016-0716 — Agregar enum `HashAlgorithm`.

---

## 8.2. Modelos Prisma

* [ ] T016-0730 — Crear modelo `SecureDocument`.
* [ ] T016-0731 — Crear modelo `SecureDocumentVersion`.
* [ ] T016-0732 — Crear modelo `SecureDocumentFile`.
* [ ] T016-0733 — Crear modelo `SecureDocumentLink`.
* [ ] T016-0734 — Crear modelo `SecureDocumentPolicy`.
* [ ] T016-0735 — Crear modelo `SecureDocumentAccessLog`.
* [ ] T016-0736 — Agregar relaciones en `Tenant`.
* [ ] T016-0737 — Agregar relaciones en `UserProfile`.
* [ ] T016-0738 — Agregar relaciones en `Person`.
* [ ] T016-0739 — Agregar relaciones en `PropertyUnit`.
* [ ] T016-0740 — Ajustar nombres reales de modelos según implementación final de `003-residents-properties`.
* [ ] T016-0741 — Ajustar nombres reales de modelos según implementación final de `005-payments`.
* [ ] T016-0742 — Ajustar nombres reales de modelos según implementación final de `011-fines-sanctions`.
* [ ] T016-0743 — Ajustar nombres reales de modelos según implementación final de `012-communications-notifications`.
* [ ] T016-0744 — Ajustar nombres reales de modelos según implementación final de `015-certified-minutes`.

---

## 8.3. Índices y constraints

* [ ] T016-0760 — Crear índices de `secure_documents`.
* [ ] T016-0761 — Crear índices de `secure_document_versions`.
* [ ] T016-0762 — Crear índice único `(tenant_id, document_id, version_number)`.
* [ ] T016-0763 — Crear índices de `secure_document_files`.
* [ ] T016-0764 — Crear constraint `file_size > 0`.
* [ ] T016-0765 — Crear constraint `available/stored requires hash`.
* [ ] T016-0766 — Crear constraint `storage_key not blank`.
* [ ] T016-0767 — Crear índices de `secure_document_links`.
* [ ] T016-0768 — Crear índices de `secure_document_policies`.
* [ ] T016-0769 — Crear índices de `secure_document_access_logs`.
* [ ] T016-0770 — Crear índice parcial una versión activa por documento.
* [ ] T016-0771 — Crear índice parcial un archivo primario activo por versión.
* [ ] T016-0772 — Crear índice parcial storageKey único por provider.
* [ ] T016-0773 — Crear índice parcial link source activo único.
* [ ] T016-0774 — Documentar constraints que se implementan en servicio por validación cross-tenant.

---

## 8.4. Migración

* [ ] T016-0790 — Crear migración `016_create_secure_document_storage`.
* [ ] T016-0791 — Ejecutar migración en base local.
* [ ] T016-0792 — Ejecutar migración en base de test.
* [ ] T016-0793 — Generar Prisma Client.
* [ ] T016-0794 — Validar constraints raw.
* [ ] T016-0795 — Validar índices parciales.
* [ ] T016-0796 — Validar rollback local si aplica.
* [ ] T016-0797 — Documentar raw SQL usado.
* [ ] T016-0798 — Ejecutar tests iniciales de repositorio.

---

# 9. Fase 5 — Puertos y repositorios

## 9.1. Puertos de repositorio

* [ ] T016-0801 — Crear `SecureDocumentRepositoryPort`.
* [ ] T016-0802 — Crear `SecureDocumentVersionRepositoryPort`.
* [ ] T016-0803 — Crear `SecureDocumentFileRepositoryPort`.
* [ ] T016-0804 — Crear `SecureDocumentLinkRepositoryPort`.
* [ ] T016-0805 — Crear `SecureDocumentPolicyRepositoryPort`.
* [ ] T016-0806 — Crear `SecureDocumentAccessLogRepositoryPort`.

---

## 9.2. Puertos de aplicación

* [ ] T016-0820 — Crear `SecureDocumentStoragePort`.
* [ ] T016-0821 — Crear `SecureDocumentHashPort`.
* [ ] T016-0822 — Crear `SecureDocumentFileValidatorPort`.
* [ ] T016-0823 — Crear `SecureDocumentAuditPort`.
* [ ] T016-0824 — Crear `SecureDocumentSourceResourceValidatorPort`.
* [ ] T016-0825 — Crear `SecureDocumentOwnerResolverPort`.
* [ ] T016-0826 — Crear `SecureDocumentAudienceResolverPort`.
* [ ] T016-0827 — Crear `SecureDocumentPermissionPort`.
* [ ] T016-0828 — Crear `SecureDocumentQuotaPort`.
* [ ] T016-0829 — Crear `SecureDocumentClockPort`.
* [ ] T016-0830 — Crear `SecureDocumentConfigPort`.
* [ ] T016-0831 — Crear `SecureDocumentObservabilityPort`.

---

## 9.3. Repositorios Prisma

* [ ] T016-0850 — Implementar `PrismaSecureDocumentRepository`.
* [ ] T016-0851 — Implementar `PrismaSecureDocumentVersionRepository`.
* [ ] T016-0852 — Implementar `PrismaSecureDocumentFileRepository`.
* [ ] T016-0853 — Implementar `PrismaSecureDocumentLinkRepository`.
* [ ] T016-0854 — Implementar `PrismaSecureDocumentPolicyRepository`.
* [ ] T016-0855 — Implementar `PrismaSecureDocumentAccessLogRepository`.
* [ ] T016-0856 — Implementar mappers Prisma → dominio.
* [ ] T016-0857 — Implementar mappers dominio → Prisma.
* [ ] T016-0858 — Validar que ningún repositorio busque solo por `id`.
* [ ] T016-0859 — Validar que toda consulta use `tenantId`.

---

## 9.4. Tests de repositorio

* [ ] T016-0870 — Test crear `SecureDocument`.
* [ ] T016-0871 — Test buscar `SecureDocument` por tenant.
* [ ] T016-0872 — Test Tenant A no ve `SecureDocument` de Tenant B.
* [ ] T016-0873 — Test crear `SecureDocumentVersion`.
* [ ] T016-0874 — Test versionNumber único por documento.
* [ ] T016-0875 — Test una versión activa por documento.
* [ ] T016-0876 — Test crear `SecureDocumentFile`.
* [ ] T016-0877 — Test fileSize positivo.
* [ ] T016-0878 — Test available requiere hash.
* [ ] T016-0879 — Test un primary activo por versión.
* [ ] T016-0880 — Test storageKey único por provider.
* [ ] T016-0881 — Test crear `SecureDocumentLink`.
* [ ] T016-0882 — Test crear `SecureDocumentPolicy`.
* [ ] T016-0883 — Test crear `SecureDocumentAccessLog`.
* [ ] T016-0884 — Test metadata sin `storageKey`.
* [ ] T016-0885 — Ejecutar `npm run test:secure-document-storage:repositories`.

---

# 10. Fase 6 — Storage, hash y validación de archivos

## 10.1. Hash

* [ ] T016-0901 — Implementar `SecureDocumentHashService`.
* [ ] T016-0902 — Implementar SHA-256 desde `Buffer`.
* [ ] T016-0903 — Implementar SHA-256 desde `Stream`.
* [ ] T016-0904 — Implementar generación de `hashPrefix`.
* [ ] T016-0905 — Rechazar algoritmo no permitido.
* [ ] T016-0906 — Confirmar que mismo archivo produce mismo hash.
* [ ] T016-0907 — Confirmar que archivo modificado produce hash distinto.
* [ ] T016-0908 — Confirmar que hash completo no se expone por DTO estándar.
* [ ] T016-0909 — Ejecutar `npm run test:secure-document-storage:hash`.

---

## 10.2. Filename sanitizer

* [ ] T016-0920 — Implementar normalización de espacios.
* [ ] T016-0921 — Remover caracteres de control.
* [ ] T016-0922 — Bloquear `../`.
* [ ] T016-0923 — Bloquear `..\`.
* [ ] T016-0924 — Bloquear `/`.
* [ ] T016-0925 — Bloquear `\`.
* [ ] T016-0926 — Bloquear null bytes.
* [ ] T016-0927 — Bloquear nombres reservados si aplica.
* [ ] T016-0928 — Limitar longitud máxima.
* [ ] T016-0929 — Preservar extensión segura.
* [ ] T016-0930 — Ejecutar tests de sanitizer.

---

## 10.3. MIME validation

* [ ] T016-0940 — Permitir `application/pdf`.
* [ ] T016-0941 — Permitir `image/png`.
* [ ] T016-0942 — Permitir `image/jpeg`.
* [ ] T016-0943 — Permitir DOCX.
* [ ] T016-0944 — Permitir XLSX.
* [ ] T016-0945 — Permitir `text/csv`.
* [ ] T016-0946 — Permitir `application/json`.
* [ ] T016-0947 — Permitir `text/plain`.
* [ ] T016-0948 — Bloquear `application/x-msdownload`.
* [ ] T016-0949 — Bloquear `application/x-sh`.
* [ ] T016-0950 — Bloquear `application/x-bat`.
* [ ] T016-0951 — Bloquear `application/javascript`.
* [ ] T016-0952 — Bloquear `text/html` por defecto.
* [ ] T016-0953 — Bloquear `application/x-php`.
* [ ] T016-0954 — Bloquear `application/java-archive`.
* [ ] T016-0955 — Bloquear APK.
* [ ] T016-0956 — Validar coherencia extensión/MIME.
* [ ] T016-0957 — Validar magic bytes cuando sea posible.

---

## 10.4. File size validation

* [ ] T016-0970 — Implementar `defaultMaxFileSizeMb`.
* [ ] T016-0971 — Implementar `imageMaxFileSizeMb`.
* [ ] T016-0972 — Implementar `reportExportMaxFileSizeMb`.
* [ ] T016-0973 — Rechazar archivo vacío.
* [ ] T016-0974 — Rechazar archivo mayor al límite.
* [ ] T016-0975 — Aceptar archivo igual al límite.
* [ ] T016-0976 — Aceptar archivo menor al límite.
* [ ] T016-0977 — Mapear exceso a `DOCUMENT_FILE_TOO_LARGE`.
* [ ] T016-0978 — Mapear vacío a `DOCUMENT_FILE_EMPTY`.

---

## 10.5. Storage key

* [ ] T016-0990 — Implementar generación server-side de `storageKey`.
* [ ] T016-0991 — Incluir `tenantId` en path interno.
* [ ] T016-0992 — Incluir `sourceModule` en path interno.
* [ ] T016-0993 — Incluir `documentId` en path interno.
* [ ] T016-0994 — Incluir `versionId` en path interno.
* [ ] T016-0995 — Incluir `fileId` en path interno.
* [ ] T016-0996 — Incluir `safeFileName`.
* [ ] T016-0997 — Rechazar `storageKey` desde cliente.
* [ ] T016-0998 — Impedir path traversal.
* [ ] T016-0999 — Impedir exposición de storageKey.
* [ ] T016-1000 — Ejecutar `npm run test:secure-document-storage:file-validation`.

---

# 11. Fase 7 — Storage adapters

## 11.1. `MockSecureDocumentStorageAdapter`

* [ ] T016-1050 — Implementar `putObject`.
* [ ] T016-1051 — Implementar `getObjectStream`.
* [ ] T016-1052 — Implementar `getObjectMetadata`.
* [ ] T016-1053 — Implementar `objectExists`.
* [ ] T016-1054 — Implementar `createTemporaryDownloadUrl`.
* [ ] T016-1055 — Implementar `archiveObject`.
* [ ] T016-1056 — Implementar `deleteObjectPhysical` solo para tests controlados.
* [ ] T016-1057 — Implementar simulación de errores.
* [ ] T016-1058 — Crear tests del adapter mock.

---

## 11.2. `LocalSecureDocumentStorageAdapter`

* [ ] T016-1070 — Implementar escritura dentro de root permitido.
* [ ] T016-1071 — Implementar creación segura de directorios.
* [ ] T016-1072 — Implementar lectura por stream.
* [ ] T016-1073 — Implementar metadata local.
* [ ] T016-1074 — Implementar `objectExists`.
* [ ] T016-1075 — Implementar archivo lógico local si aplica.
* [ ] T016-1076 — Bloquear path traversal.
* [ ] T016-1077 — Bloquear rutas fuera del root.
* [ ] T016-1078 — Bloquear root inseguro.
* [ ] T016-1079 — Bloquear local storage en producción si config no lo permite.
* [ ] T016-1080 — Crear tests del adapter local.

---

## 11.3. `S3CompatibleSecureDocumentStorageAdapter`

* [ ] T016-1100 — Crear adapter S3-compatible.
* [ ] T016-1101 — Implementar `putObject`.
* [ ] T016-1102 — Implementar `getObjectStream`.
* [ ] T016-1103 — Implementar `getObjectMetadata`.
* [ ] T016-1104 — Implementar `objectExists`.
* [ ] T016-1105 — Implementar URL temporal con TTL corto si feature flag está activo.
* [ ] T016-1106 — Bloquear URL temporal si feature flag está inactivo.
* [ ] T016-1107 — No persistir URL temporal.
* [ ] T016-1108 — No loguear URL temporal completa.
* [ ] T016-1109 — Configurar bucket privado.
* [ ] T016-1110 — Configurar server-side encryption si aplica.
* [ ] T016-1111 — Mapear errores provider a `DOCUMENT_STORAGE_ERROR`.
* [ ] T016-1112 — Crear tests con provider mock.

---

## 11.4. Storage configuration

* [ ] T016-1120 — Implementar lectura de `DOCUMENT_STORAGE_PROVIDER`.
* [ ] T016-1121 — Implementar lectura de límites de tamaño.
* [ ] T016-1122 — Implementar lectura de MIME types permitidos.
* [ ] T016-1123 — Implementar lectura de `DOCUMENT_STORAGE_TEMP_URL_TTL_SECONDS`.
* [ ] T016-1124 — Implementar validación de provider.
* [ ] T016-1125 — Impedir local storage en producción por defecto.
* [ ] T016-1126 — Impedir exposición de secretos.
* [ ] T016-1127 — Implementar test de configuración segura.

---

# 12. Fase 8 — Servicios de aplicación

## 12.1. Servicios base

* [ ] T016-1201 — Implementar `SecureDocumentService`.
* [ ] T016-1202 — Implementar `SecureDocumentVersionService`.
* [ ] T016-1203 — Implementar `SecureDocumentFileService`.
* [ ] T016-1204 — Implementar `SecureDocumentUploadService`.
* [ ] T016-1205 — Implementar `SecureDocumentDownloadService`.
* [ ] T016-1206 — Implementar `SecureDocumentMetadataService`.
* [ ] T016-1207 — Implementar `SecureDocumentArchiveService`.
* [ ] T016-1208 — Implementar `SecureDocumentRestoreService`.
* [ ] T016-1209 — Implementar `SecureDocumentAccessService`.
* [ ] T016-1210 — Implementar `SecureDocumentPolicyService`.
* [ ] T016-1211 — Implementar `SecureDocumentSourceResourceService`.
* [ ] T016-1212 — Implementar `SecureDocumentOwnerResolverService`.
* [ ] T016-1213 — Implementar `SecureDocumentAudienceResolverService`.
* [ ] T016-1214 — Implementar `SecureDocumentHashService`.
* [ ] T016-1215 — Implementar `SecureDocumentFileValidationService`.
* [ ] T016-1216 — Implementar `SecureDocumentStorageService`.
* [ ] T016-1217 — Implementar `SecureDocumentAuditService`.
* [ ] T016-1218 — Implementar `SecureDocumentObservabilityService`.
* [ ] T016-1219 — Implementar `SecureDocumentConfigService`.

---

## 12.2. Tests de servicios

* [ ] T016-1230 — Test `SecureDocumentService`.
* [ ] T016-1231 — Test `SecureDocumentVersionService`.
* [ ] T016-1232 — Test `SecureDocumentFileService`.
* [ ] T016-1233 — Test `SecureDocumentUploadService`.
* [ ] T016-1234 — Test `SecureDocumentDownloadService`.
* [ ] T016-1235 — Test `SecureDocumentMetadataService`.
* [ ] T016-1236 — Test `SecureDocumentArchiveService`.
* [ ] T016-1237 — Test `SecureDocumentRestoreService`.
* [ ] T016-1238 — Test `SecureDocumentAccessService`.
* [ ] T016-1239 — Test `SecureDocumentPolicyService`.
* [ ] T016-1240 — Test `SecureDocumentSourceResourceService`.
* [ ] T016-1241 — Test `SecureDocumentOwnerResolverService`.
* [ ] T016-1242 — Test `SecureDocumentAudienceResolverService`.
* [ ] T016-1243 — Test `SecureDocumentHashService`.
* [ ] T016-1244 — Test `SecureDocumentFileValidationService`.
* [ ] T016-1245 — Test `SecureDocumentStorageService`.
* [ ] T016-1246 — Test `SecureDocumentAuditService`.
* [ ] T016-1247 — Test `SecureDocumentObservabilityService`.
* [ ] T016-1248 — Test `SecureDocumentConfigService`.
* [ ] T016-1249 — Ejecutar `npm run test:secure-document-storage:application`.

---

# 13. Fase 9 — Casos de uso

## 13.1. Documentos

* [ ] T016-1301 — Implementar `CreateSecureDocumentUseCase`.
* [ ] T016-1302 — Implementar `ListSecureDocumentsUseCase`.
* [ ] T016-1303 — Implementar `GetSecureDocumentUseCase`.
* [ ] T016-1304 — Implementar `UpdateSecureDocumentMetadataUseCase`.
* [ ] T016-1305 — Implementar `ArchiveSecureDocumentUseCase`.
* [ ] T016-1306 — Implementar `RestoreSecureDocumentUseCase`.
* [ ] T016-1307 — Implementar `ListSecureDocumentAccessLogsUseCase`.

---

## 13.2. Versiones

* [ ] T016-1320 — Implementar `ListSecureDocumentVersionsUseCase`.
* [ ] T016-1321 — Implementar `CreateSecureDocumentVersionUseCase`.
* [ ] T016-1322 — Implementar `GetSecureDocumentVersionUseCase`.
* [ ] T016-1323 — Implementar `ArchiveSecureDocumentVersionUseCase`.

---

## 13.3. Archivos

* [ ] T016-1340 — Implementar `UploadSecureDocumentFileUseCase`.
* [ ] T016-1341 — Implementar `RegisterSystemGeneratedDocumentFileUseCase`.
* [ ] T016-1342 — Implementar `GetSecureDocumentFileUseCase`.
* [ ] T016-1343 — Implementar `DownloadSecureDocumentFileUseCase`.
* [ ] T016-1344 — Implementar `ArchiveSecureDocumentFileUseCase`.

---

## 13.4. Endpoints `/me`

* [ ] T016-1360 — Implementar `ListOwnSecureDocumentsUseCase`.
* [ ] T016-1361 — Implementar `GetOwnSecureDocumentUseCase`.
* [ ] T016-1362 — Implementar `CreateOwnSecureDocumentUseCase`.
* [ ] T016-1363 — Implementar `UploadOwnSecureDocumentFileUseCase`.
* [ ] T016-1364 — Implementar `DownloadOwnSecureDocumentFileUseCase`.

---

## 13.5. Platform config

* [ ] T016-1380 — Implementar `GetDocumentStorageConfigUseCase`.
* [ ] T016-1381 — Implementar `UpdateDocumentStorageConfigUseCase`.
* [ ] T016-1382 — Implementar `TestDocumentStorageConnectionUseCase`.
* [ ] T016-1383 — Implementar `ListDocumentStorageProvidersUseCase`.

---

# 14. Fase 10 — DTOs

## 14.1. DTOs de documentos

* [ ] T016-1401 — Crear `CreateSecureDocumentDto`.
* [ ] T016-1402 — Crear `UpdateSecureDocumentMetadataDto`.
* [ ] T016-1403 — Crear `ArchiveSecureDocumentDto`.
* [ ] T016-1404 — Crear `RestoreSecureDocumentDto`.
* [ ] T016-1405 — Crear `SecureDocumentAdminDto`.
* [ ] T016-1406 — Crear `SecureDocumentListItemDto`.
* [ ] T016-1407 — Crear `SecureDocumentMetadataDto`.
* [ ] T016-1408 — Crear `SecureDocumentFilterDto`.

---

## 14.2. DTOs de versiones

* [ ] T016-1420 — Crear `CreateSecureDocumentVersionDto`.
* [ ] T016-1421 — Crear `SecureDocumentVersionDto`.
* [ ] T016-1422 — Crear `SecureDocumentVersionListItemDto`.
* [ ] T016-1423 — Crear `ArchiveSecureDocumentVersionDto`.

---

## 14.3. DTOs de archivos

* [ ] T016-1440 — Crear `UploadSecureDocumentFileDto`.
* [ ] T016-1441 — Crear `RegisterSystemGeneratedDocumentFileDto`.
* [ ] T016-1442 — Crear `SecureDocumentFileDto`.
* [ ] T016-1443 — Crear `SecureDocumentFileListItemDto`.
* [ ] T016-1444 — Crear `DownloadSecureDocumentFileDto`.
* [ ] T016-1445 — Crear `ArchiveSecureDocumentFileDto`.

---

## 14.4. DTOs de access logs

* [ ] T016-1460 — Crear `SecureDocumentAccessLogDto`.
* [ ] T016-1461 — Crear `SecureDocumentAccessLogListItemDto`.
* [ ] T016-1462 — Crear `SecureDocumentAccessLogFilterDto`.

---

## 14.5. DTOs platform

* [ ] T016-1480 — Crear `DocumentStorageConfigDto`.
* [ ] T016-1481 — Crear `UpdateDocumentStorageConfigDto`.
* [ ] T016-1482 — Crear `DocumentStorageProviderDto`.
* [ ] T016-1483 — Crear `DocumentStorageConnectionTestResultDto`.

---

## 14.6. DTOs `/me`

* [ ] T016-1500 — Crear `OwnSecureDocumentDto`.
* [ ] T016-1501 — Crear `OwnSecureDocumentListItemDto`.
* [ ] T016-1502 — Crear `OwnSecureDocumentFileDto`.
* [ ] T016-1503 — Crear `CreateOwnSecureDocumentDto`.
* [ ] T016-1504 — Crear `UploadOwnSecureDocumentFileDto`.

---

## 14.7. Tests de DTOs

* [ ] T016-1520 — Test `CreateSecureDocumentDto`.
* [ ] T016-1521 — Test `UpdateSecureDocumentMetadataDto`.
* [ ] T016-1522 — Test `ArchiveSecureDocumentDto`.
* [ ] T016-1523 — Test `RestoreSecureDocumentDto`.
* [ ] T016-1524 — Test `CreateSecureDocumentVersionDto`.
* [ ] T016-1525 — Test `UploadSecureDocumentFileDto`.
* [ ] T016-1526 — Test `RegisterSystemGeneratedDocumentFileDto`.
* [ ] T016-1527 — Test `ArchiveSecureDocumentFileDto`.
* [ ] T016-1528 — Test `CreateOwnSecureDocumentDto`.
* [ ] T016-1529 — Test `UploadOwnSecureDocumentFileDto`.
* [ ] T016-1530 — Test `UpdateDocumentStorageConfigDto`.
* [ ] T016-1531 — Verificar rechazo de `tenantId` en todos los bodies.
* [ ] T016-1532 — Verificar rechazo de `storageKey` en todos los bodies externos.
* [ ] T016-1533 — Verificar rechazo de binarios/base64 en JSON.
* [ ] T016-1534 — Verificar DTOs sin `storageKey` en response.
* [ ] T016-1535 — Ejecutar `npm run test:secure-document-storage:dto`.

---

# 15. Fase 11 — Guards, policies y autorización

## 15.1. Guards

* [ ] T016-1601 — Implementar `DocumentPermissionGuard`.
* [ ] T016-1602 — Implementar `DocumentTenantGuard`.
* [ ] T016-1603 — Implementar `DocumentSourceResourceGuard`.
* [ ] T016-1604 — Implementar `DocumentOwnResourceGuard`.
* [ ] T016-1605 — Implementar `DocumentFileGuard`.
* [ ] T016-1606 — Implementar `DocumentDownloadGuard`.
* [ ] T016-1607 — Implementar `DocumentStorageConfigGuard`.
* [ ] T016-1608 — Implementar `PlatformDocumentStorageGuard`.

---

## 15.2. Policies

* [ ] T016-1620 — Implementar `DocumentTenantPolicy`.
* [ ] T016-1621 — Implementar `DocumentSourceResourcePolicy`.
* [ ] T016-1622 — Implementar `DocumentAccessPolicy`.
* [ ] T016-1623 — Implementar `DocumentOwnResourcePolicy`.
* [ ] T016-1624 — Implementar `DocumentVisibilityPolicy`.
* [ ] T016-1625 — Implementar `DocumentSensitivityPolicy`.
* [ ] T016-1626 — Implementar `DocumentFileValidationPolicy`.
* [ ] T016-1627 — Implementar `DocumentStorageKeyPolicy`.
* [ ] T016-1628 — Implementar `DocumentDownloadPolicy`.
* [ ] T016-1629 — Implementar `DocumentArchivePolicy`.
* [ ] T016-1630 — Implementar `DocumentRestorePolicy`.
* [ ] T016-1631 — Implementar `DocumentMetadataPolicy`.
* [ ] T016-1632 — Implementar `PlatformDocumentStoragePolicy`.
* [ ] T016-1633 — Implementar `DocumentNoPublicExposurePolicy`.
* [ ] T016-1634 — Implementar `DocumentNoBinaryJsonPolicy`.
* [ ] T016-1635 — Implementar `DocumentNoAiExternalPolicy`.

---

## 15.3. Permisos

* [ ] T016-1650 — Registrar permiso `documents.create`.
* [ ] T016-1651 — Registrar permiso `documents.read`.
* [ ] T016-1652 — Registrar permiso `documents.updateMetadata`.
* [ ] T016-1653 — Registrar permiso `documents.archive`.
* [ ] T016-1654 — Registrar permiso `documents.restore`.
* [ ] T016-1655 — Registrar permiso `documents.download`.
* [ ] T016-1656 — Registrar permiso `documents.managePolicies`.
* [ ] T016-1657 — Registrar permiso `documents.read.own`.
* [ ] T016-1658 — Registrar permiso `documents.download.own`.
* [ ] T016-1659 — Registrar permiso `documents.upload.own`.
* [ ] T016-1660 — Registrar permiso `documents.registerSystemGenerated`.
* [ ] T016-1661 — Registrar permiso `documents.readSystemMetadata`.
* [ ] T016-1662 — Registrar permiso `documents.audit.read`.
* [ ] T016-1663 — Registrar permiso `documents.storage.configure`.
* [ ] T016-1664 — Registrar permiso `documents.storage.readConfig`.
* [ ] T016-1665 — Registrar permiso `documents.storage.testConnection`.
* [ ] T016-1666 — Actualizar seeds de roles base.
* [ ] T016-1667 — Validar que PlatformAdmin no accede automáticamente al contenido documental de tenants.

---

## 15.4. Tests de autorización

* [ ] T016-1680 — Test 401 sin token.
* [ ] T016-1681 — Test 403 sin membership.
* [ ] T016-1682 — Test 403 usuario disabled.
* [ ] T016-1683 — Test sin `documents.create`.
* [ ] T016-1684 — Test sin `documents.read`.
* [ ] T016-1685 — Test sin `documents.updateMetadata`.
* [ ] T016-1686 — Test sin `documents.archive`.
* [ ] T016-1687 — Test sin `documents.restore`.
* [ ] T016-1688 — Test sin `documents.download`.
* [ ] T016-1689 — Test sin `documents.read.own`.
* [ ] T016-1690 — Test sin `documents.download.own`.
* [ ] T016-1691 — Test sin `documents.upload.own`.
* [ ] T016-1692 — Test sin `documents.registerSystemGenerated`.
* [ ] T016-1693 — Test sin `documents.audit.read`.
* [ ] T016-1694 — Test sin `documents.storage.configure`.
* [ ] T016-1695 — Test sin `documents.storage.readConfig`.
* [ ] T016-1696 — Test sin `documents.storage.testConnection`.
* [ ] T016-1697 — Test PlatformAdmin sin acceso automático al contenido de tenants.
* [ ] T016-1698 — Ejecutar `npm run test:secure-document-storage:authorization`.

---

# 16. Fase 12 — Source resource y owner validation

## 16.1. Source resource validators

* [ ] T016-1750 — Implementar `PaymentDocumentSourceValidator`.
* [ ] T016-1751 — Implementar validación de `payment`.
* [ ] T016-1752 — Implementar validación de `paymentReceipt`.
* [ ] T016-1753 — Implementar `FineDocumentSourceValidator`.
* [ ] T016-1754 — Implementar validación de `fine`.
* [ ] T016-1755 — Implementar validación de `fineEvidence`.
* [ ] T016-1756 — Implementar `CommunicationDocumentSourceValidator`.
* [ ] T016-1757 — Implementar validación de `communication`.
* [ ] T016-1758 — Implementar `CertifiedMinutesDocumentSourceValidator`.
* [ ] T016-1759 — Implementar validación de `certifiedMinutes`.
* [ ] T016-1760 — Implementar validación de `certifiedMinutesArtifact`.
* [ ] T016-1761 — Implementar validación de `certifiedMinutesAttachment`.
* [ ] T016-1762 — Implementar `ReportDocumentSourceValidator`.
* [ ] T016-1763 — Implementar validación de `reportExport`.
* [ ] T016-1764 — Implementar `ResidentsPropertiesDocumentSourceValidator`.
* [ ] T016-1765 — Implementar validación de `propertyUnit`.
* [ ] T016-1766 — Implementar validación de `person`.
* [ ] T016-1767 — Implementar `TenantDocumentSourceValidator`.
* [ ] T016-1768 — Implementar validación de `system`.
* [ ] T016-1769 — Implementar policy para `other`.

---

## 16.2. Owner validation

* [ ] T016-1780 — Validar `ownerType=user`.
* [ ] T016-1781 — Validar `ownerUserId` contra tenant.
* [ ] T016-1782 — Validar `ownerType=person`.
* [ ] T016-1783 — Validar `ownerPersonId` contra tenant.
* [ ] T016-1784 — Validar `ownerType=propertyUnit`.
* [ ] T016-1785 — Validar `ownerPropertyUnitId` contra tenant.
* [ ] T016-1786 — Validar `ownerType=tenant`.
* [ ] T016-1787 — Validar `ownerType=system`.
* [ ] T016-1788 — Validar `ownerType=none`.
* [ ] T016-1789 — Rechazar combinaciones inconsistentes de owner.

---

## 16.3. Audience rules validation

* [ ] T016-1800 — Validar `audienceRules.userIds`.
* [ ] T016-1801 — Validar `audienceRules.personIds`.
* [ ] T016-1802 — Validar `audienceRules.propertyUnitIds`.
* [ ] T016-1803 — Validar `audienceRules.roleIds`.
* [ ] T016-1804 — Rechazar userIds de otro tenant.
* [ ] T016-1805 — Rechazar personIds de otro tenant.
* [ ] T016-1806 — Rechazar propertyUnitIds de otro tenant.
* [ ] T016-1807 — Rechazar roleIds de otro tenant.
* [ ] T016-1808 — Rechazar audienceRules excesivamente grandes.
* [ ] T016-1809 — Ejecutar `npm run test:secure-document-storage:source-resource`.

---

# 17. Fase 13 — Controladores REST

## 17.1. `DocumentsController`

* [ ] T016-1901 — Crear `documents.controller.ts`.
* [ ] T016-1902 — Implementar `GET /api/v1/tenant/documents`.
* [ ] T016-1903 — Implementar `POST /api/v1/tenant/documents`.
* [ ] T016-1904 — Implementar `GET /api/v1/tenant/documents/{documentId}`.
* [ ] T016-1905 — Implementar `PATCH /api/v1/tenant/documents/{documentId}/metadata`.
* [ ] T016-1906 — Implementar `POST /api/v1/tenant/documents/{documentId}/archive`.
* [ ] T016-1907 — Implementar `POST /api/v1/tenant/documents/{documentId}/restore`.
* [ ] T016-1908 — Implementar `GET /api/v1/tenant/documents/{documentId}/access-logs`.

---

## 17.2. `DocumentVersionsController`

* [ ] T016-1920 — Crear `document-versions.controller.ts`.
* [ ] T016-1921 — Implementar `GET /api/v1/tenant/documents/{documentId}/versions`.
* [ ] T016-1922 — Implementar `POST /api/v1/tenant/documents/{documentId}/versions`.
* [ ] T016-1923 — Implementar `GET /api/v1/tenant/document-versions/{versionId}`.
* [ ] T016-1924 — Implementar `POST /api/v1/tenant/document-versions/{versionId}/archive`.

---

## 17.3. `DocumentFilesController`

* [ ] T016-1940 — Crear `document-files.controller.ts`.
* [ ] T016-1941 — Implementar `POST /api/v1/tenant/documents/{documentId}/files`.
* [ ] T016-1942 — Implementar `POST /api/v1/tenant/documents/{documentId}/files/register-system-generated`.
* [ ] T016-1943 — Implementar `GET /api/v1/tenant/document-files/{fileId}`.
* [ ] T016-1944 — Implementar `GET /api/v1/tenant/document-files/{fileId}/download`.
* [ ] T016-1945 — Implementar `POST /api/v1/tenant/document-files/{fileId}/archive`.
* [ ] T016-1946 — Configurar streaming de descarga.
* [ ] T016-1947 — Configurar `Content-Disposition` seguro.
* [ ] T016-1948 — Configurar `Cache-Control: no-store`.

---

## 17.4. `MyDocumentsController`

* [ ] T016-1960 — Crear `my-documents.controller.ts`.
* [ ] T016-1961 — Implementar `GET /api/v1/me/documents`.
* [ ] T016-1962 — Implementar `GET /api/v1/me/documents/{documentId}`.
* [ ] T016-1963 — Implementar `POST /api/v1/me/documents`.
* [ ] T016-1964 — Implementar `POST /api/v1/me/documents/{documentId}/files`.
* [ ] T016-1965 — Implementar `GET /api/v1/me/document-files/{fileId}/download`.
* [ ] T016-1966 — Restringir upload propio a categorías permitidas.

---

## 17.5. `DocumentStoragePlatformController`

* [ ] T016-1980 — Crear `document-storage-platform.controller.ts`.
* [ ] T016-1981 — Implementar `GET /api/v1/platform/document-storage/config`.
* [ ] T016-1982 — Implementar `PATCH /api/v1/platform/document-storage/config`.
* [ ] T016-1983 — Implementar `POST /api/v1/platform/document-storage/test-connection`.
* [ ] T016-1984 — Implementar `GET /api/v1/platform/document-storage/providers`.
* [ ] T016-1985 — Ocultar secretos en responses.
* [ ] T016-1986 — Bloquear local storage productivo por defecto.

---

# 18. Fase 14 — API tests

## 18.1. Documentos administrativos

* [ ] T016-2001 — Test `GET /api/v1/tenant/documents`.
* [ ] T016-2002 — Test paginación y pageSize máximo.
* [ ] T016-2003 — Test filtros administrativos.
* [ ] T016-2004 — Test `POST /api/v1/tenant/documents`.
* [ ] T016-2005 — Test rechazo de `tenantId` en create.
* [ ] T016-2006 — Test rechazo de `storageKey` en create.
* [ ] T016-2007 — Test rechazo de metadata insegura.
* [ ] T016-2008 — Test `GET /api/v1/tenant/documents/{documentId}`.
* [ ] T016-2009 — Test `PATCH /metadata`.
* [ ] T016-2010 — Test `POST /archive`.
* [ ] T016-2011 — Test `POST /restore`.
* [ ] T016-2012 — Test `GET /access-logs`.

---

## 18.2. Versiones

* [ ] T016-2030 — Test `GET /api/v1/tenant/documents/{documentId}/versions`.
* [ ] T016-2031 — Test `POST /api/v1/tenant/documents/{documentId}/versions`.
* [ ] T016-2032 — Test versión posterior sin `changeReason`.
* [ ] T016-2033 — Test `GET /api/v1/tenant/document-versions/{versionId}`.
* [ ] T016-2034 — Test `POST /api/v1/tenant/document-versions/{versionId}/archive`.
* [ ] T016-2035 — Test version tenant B inaccesible.

---

## 18.3. Archivos

* [ ] T016-2050 — Test upload PDF.
* [ ] T016-2051 — Test upload PNG.
* [ ] T016-2052 — Test upload JPEG.
* [ ] T016-2053 — Test upload DOCX.
* [ ] T016-2054 — Test upload XLSX.
* [ ] T016-2055 — Test upload CSV.
* [ ] T016-2056 — Test upload JSON.
* [ ] T016-2057 — Test upload TXT.
* [ ] T016-2058 — Test rechazo executable.
* [ ] T016-2059 — Test rechazo JavaScript.
* [ ] T016-2060 — Test rechazo HTML por defecto.
* [ ] T016-2061 — Test archivo demasiado grande.
* [ ] T016-2062 — Test archivo vacío.
* [ ] T016-2063 — Test filename con path traversal.
* [ ] T016-2064 — Test `storageKey` en multipart fields.
* [ ] T016-2065 — Test `GET /api/v1/tenant/document-files/{fileId}`.
* [ ] T016-2066 — Test `GET /api/v1/tenant/document-files/{fileId}/download`.
* [ ] T016-2067 — Test download quarantined.
* [ ] T016-2068 — Test download rejected.
* [ ] T016-2069 — Test download archived.
* [ ] T016-2070 — Test download missing.
* [ ] T016-2071 — Test `POST /api/v1/tenant/document-files/{fileId}/archive`.

---

## 18.4. Endpoints `/me`

* [ ] T016-2090 — Test `GET /api/v1/me/documents`.
* [ ] T016-2091 — Test owner ve documento propio.
* [ ] T016-2092 — Test resident ve documento propio.
* [ ] T016-2093 — Test usuario no ve documento ajeno.
* [ ] T016-2094 — Test usuario no ve tenant B.
* [ ] T016-2095 — Test `/me` no muestra archivados por defecto.
* [ ] T016-2096 — Test `/me` no muestra quarantined.
* [ ] T016-2097 — Test `/me` no muestra rejected.
* [ ] T016-2098 — Test `GET /api/v1/me/documents/{documentId}`.
* [ ] T016-2099 — Test `POST /api/v1/me/documents` permitido para `paymentReceipt`.
* [ ] T016-2100 — Test `POST /api/v1/me/documents` rechaza categorías no permitidas.
* [ ] T016-2101 — Test `POST /api/v1/me/documents/{documentId}/files`.
* [ ] T016-2102 — Test `GET /api/v1/me/document-files/{fileId}/download`.
* [ ] T016-2103 — Test download propio denegado para documento ajeno.

---

## 18.5. Platform config

* [ ] T016-2120 — Test `GET /api/v1/platform/document-storage/config`.
* [ ] T016-2121 — Test config no expone secretos.
* [ ] T016-2122 — Test `PATCH /api/v1/platform/document-storage/config`.
* [ ] T016-2123 — Test provider inválido.
* [ ] T016-2124 — Test local storage bloqueado en producción.
* [ ] T016-2125 — Test `POST /api/v1/platform/document-storage/test-connection`.
* [ ] T016-2126 — Test connection failed controlado.
* [ ] T016-2127 — Test `GET /api/v1/platform/document-storage/providers`.
* [ ] T016-2128 — Ejecutar `npm run test:secure-document-storage:api`.

---

# 19. Fase 15 — Multitenancy

## 19.1. Aislamiento de entidades

* [ ] T016-2201 — Tenant A no ve `secure_documents` de Tenant B.
* [ ] T016-2202 — Tenant A no ve `secure_document_versions` de Tenant B.
* [ ] T016-2203 — Tenant A no ve `secure_document_files` de Tenant B.
* [ ] T016-2204 — Tenant A no ve `secure_document_links` de Tenant B.
* [ ] T016-2205 — Tenant A no ve `secure_document_policies` de Tenant B.
* [ ] T016-2206 — Tenant A no ve `secure_document_access_logs` de Tenant B.
* [ ] T016-2207 — Tenant A no modifica documento de Tenant B.
* [ ] T016-2208 — Tenant A no archiva documento de Tenant B.
* [ ] T016-2209 — Tenant A no restaura documento de Tenant B.
* [ ] T016-2210 — Tenant A no descarga archivo de Tenant B.
* [ ] T016-2211 — Tenant A no archiva archivo de Tenant B.
* [ ] T016-2212 — Tenant A no lee access logs de Tenant B.

---

## 19.2. Referencias cross-tenant

* [ ] T016-2230 — Rechazar `documentId` de Tenant B.
* [ ] T016-2231 — Rechazar `versionId` de Tenant B.
* [ ] T016-2232 — Rechazar `fileId` de Tenant B.
* [ ] T016-2233 — Rechazar `linkId` de Tenant B.
* [ ] T016-2234 — Rechazar `policyId` de Tenant B.
* [ ] T016-2235 — Rechazar `sourceResourceId` de Tenant B.
* [ ] T016-2236 — Rechazar `ownerUserId` de Tenant B.
* [ ] T016-2237 — Rechazar `ownerPersonId` de Tenant B.
* [ ] T016-2238 — Rechazar `ownerPropertyUnitId` de Tenant B.
* [ ] T016-2239 — Rechazar `audienceRules.userIds` de Tenant B.
* [ ] T016-2240 — Rechazar `audienceRules.personIds` de Tenant B.
* [ ] T016-2241 — Rechazar `audienceRules.propertyUnitIds` de Tenant B.
* [ ] T016-2242 — Rechazar `audienceRules.roleIds` de Tenant B.
* [ ] T016-2243 — Ejecutar `npm run test:secure-document-storage:multitenancy`.

---

# 20. Fase 16 — Own-resource y visibilidad

## 20.1. Owner por usuario

* [ ] T016-2301 — Usuario owner ve documento con `ownerType=user`.
* [ ] T016-2302 — Usuario distinto no ve documento con `ownerType=user`.
* [ ] T016-2303 — Usuario tenant B no ve documento tenant A.
* [ ] T016-2304 — Usuario disabled no accede.

---

## 20.2. Owner por persona

* [ ] T016-2320 — Usuario vinculado a persona ve documento.
* [ ] T016-2321 — Usuario no vinculado a persona no ve documento.
* [ ] T016-2322 — Persona tenant B no autoriza documento tenant A.
* [ ] T016-2323 — Persona inactiva no autoriza si política lo define.

---

## 20.3. Owner por unidad

* [ ] T016-2340 — Propietario de unidad ve documento si `allowOwnerRead=true`.
* [ ] T016-2341 — Residente de unidad ve documento si policy lo permite.
* [ ] T016-2342 — Usuario de otra unidad no ve documento.
* [ ] T016-2343 — Unidad tenant B no autoriza documento tenant A.
* [ ] T016-2344 — Unidad inactiva no autoriza si política lo define.

---

## 20.4. Visibilidades

* [ ] T016-2360 — Implementar y probar `private`.
* [ ] T016-2361 — Implementar y probar `administrative`.
* [ ] T016-2362 — Implementar y probar `tenant`.
* [ ] T016-2363 — Implementar y probar `owners`.
* [ ] T016-2364 — Implementar y probar `residents`.
* [ ] T016-2365 — Implementar y probar `board`.
* [ ] T016-2366 — Implementar y probar `meetingParticipants`.
* [ ] T016-2367 — Implementar y probar `sourceResourceAudience`.
* [ ] T016-2368 — Implementar y probar `specificUsers`.
* [ ] T016-2369 — Implementar y probar `propertyUnits`.
* [ ] T016-2370 — Implementar y probar `roles`.
* [ ] T016-2371 — Implementar y probar `mixed`.
* [ ] T016-2372 — Confirmar que `publicEligible` no expone documento públicamente.
* [ ] T016-2373 — Ejecutar `npm run test:secure-document-storage:own-resource`.

---

# 21. Fase 17 — Upload seguro

## 21.1. Flujo upload administrativo

* [ ] T016-2401 — Validar autenticación.
* [ ] T016-2402 — Validar tenant activo.
* [ ] T016-2403 — Validar permiso `documents.create`.
* [ ] T016-2404 — Validar `documentId`.
* [ ] T016-2405 — Validar `versionId` si se envía.
* [ ] T016-2406 — Crear versión inicial si corresponde.
* [ ] T016-2407 — Validar archivo no vacío.
* [ ] T016-2408 — Validar file size.
* [ ] T016-2409 — Validar MIME.
* [ ] T016-2410 — Validar extensión.
* [ ] T016-2411 — Validar magic bytes cuando aplique.
* [ ] T016-2412 — Sanitizar filename.
* [ ] T016-2413 — Generar safe filename.
* [ ] T016-2414 — Generar storageKey.
* [ ] T016-2415 — Calcular hash SHA-256.
* [ ] T016-2416 — Guardar en storage.
* [ ] T016-2417 — Registrar `SecureDocumentFile`.
* [ ] T016-2418 — Marcar `isPrimary` si aplica.
* [ ] T016-2419 — Actualizar `activeFileId` si aplica.
* [ ] T016-2420 — Actualizar estado documento a `available` si aplica.
* [ ] T016-2421 — Auditar `document.uploaded`.
* [ ] T016-2422 — No exponer storageKey.

---

## 21.2. Flujo upload propio

* [ ] T016-2440 — Validar autenticación.
* [ ] T016-2441 — Validar membership activa.
* [ ] T016-2442 — Validar permiso `documents.upload.own`.
* [ ] T016-2443 — Validar categoría permitida.
* [ ] T016-2444 — Validar sourceModule permitido.
* [ ] T016-2445 — Validar sourceResource propio.
* [ ] T016-2446 — Validar owner propio.
* [ ] T016-2447 — Validar archivo.
* [ ] T016-2448 — Generar storageKey server-side.
* [ ] T016-2449 — Calcular hash.
* [ ] T016-2450 — Registrar archivo.
* [ ] T016-2451 — Auditar `document.uploaded`.
* [ ] T016-2452 — No exponer storageKey.

---

## 21.3. Casos negativos upload

* [ ] T016-2470 — Rechazar `storageKey` en multipart.
* [ ] T016-2471 — Rechazar `fileHash` en multipart.
* [ ] T016-2472 — Rechazar `provider` en multipart.
* [ ] T016-2473 — Rechazar archivo vacío.
* [ ] T016-2474 — Rechazar archivo demasiado grande.
* [ ] T016-2475 — Rechazar MIME bloqueado.
* [ ] T016-2476 — Rechazar MIME mismatch.
* [ ] T016-2477 — Rechazar path traversal.
* [ ] T016-2478 — Rechazar document tenant B.
* [ ] T016-2479 — Rechazar version tenant B.
* [ ] T016-2480 — Rechazar segunda primary activa por versión si aplica.

---

# 22. Fase 18 — Download seguro

## 22.1. Download administrativo

* [ ] T016-2501 — Validar autenticación.
* [ ] T016-2502 — Validar tenant activo.
* [ ] T016-2503 — Validar permiso `documents.download`.
* [ ] T016-2504 — Buscar archivo por `tenantId + fileId`.
* [ ] T016-2505 — Validar estado del documento.
* [ ] T016-2506 — Validar estado del archivo.
* [ ] T016-2507 — Rechazar archivo `quarantined`.
* [ ] T016-2508 — Rechazar archivo `rejected`.
* [ ] T016-2509 — Rechazar archivo `archived`.
* [ ] T016-2510 — Rechazar archivo `missing`.
* [ ] T016-2511 — Rechazar archivo `failed`.
* [ ] T016-2512 — Obtener stream desde storage.
* [ ] T016-2513 — Configurar filename seguro.
* [ ] T016-2514 — Configurar `Cache-Control: no-store`.
* [ ] T016-2515 — Registrar access log allowed.
* [ ] T016-2516 — Registrar access log denied cuando aplique.
* [ ] T016-2517 — Auditar `document.downloaded`.
* [ ] T016-2518 — No exponer storageKey.
* [ ] T016-2519 — No exponer URL persistente.

---

## 22.2. Download propio

* [ ] T016-2540 — Validar permiso `documents.download.own`.
* [ ] T016-2541 — Resolver actor user.
* [ ] T016-2542 — Resolver actor persons.
* [ ] T016-2543 — Resolver actor property units.
* [ ] T016-2544 — Resolver actor roles.
* [ ] T016-2545 — Validar owner lógico.
* [ ] T016-2546 — Validar visibilidad.
* [ ] T016-2547 — Validar sensitivity.
* [ ] T016-2548 — Validar source resource policy.
* [ ] T016-2549 — Validar policy expirada.
* [ ] T016-2550 — Rechazar archivo no autorizado.
* [ ] T016-2551 — Registrar access log.
* [ ] T016-2552 — Auditar descarga.
* [ ] T016-2553 — Ejecutar `npm run test:secure-document-storage:storage`.

---

# 23. Fase 19 — Access logs

## 23.1. Registro

* [ ] T016-2601 — Registrar `viewMetadata allowed`.
* [ ] T016-2602 — Registrar `download allowed`.
* [ ] T016-2603 — Registrar `download denied`.
* [ ] T016-2604 — Registrar `notFound`.
* [ ] T016-2605 — Registrar `expired`.
* [ ] T016-2606 — Registrar `revoked`.
* [ ] T016-2607 — Registrar `quarantined`.
* [ ] T016-2608 — Registrar `rejected`.
* [ ] T016-2609 — Registrar `archived`.
* [ ] T016-2610 — Registrar `error`.
* [ ] T016-2611 — Incluir `tenantId`.
* [ ] T016-2612 — Incluir `documentId` si disponible.
* [ ] T016-2613 — Incluir `versionId` si disponible.
* [ ] T016-2614 — Incluir `fileId` si disponible.
* [ ] T016-2615 — Incluir `actorUserId` si autenticado.
* [ ] T016-2616 — Incluir `traceId`.
* [ ] T016-2617 — Hash de IP opcional según política.
* [ ] T016-2618 — Hash de user agent opcional según política.

---

## 23.2. Sanitización

* [ ] T016-2630 — No registrar `storageKey`.
* [ ] T016-2631 — No registrar bucket.
* [ ] T016-2632 — No registrar path interno.
* [ ] T016-2633 — No registrar URL firmada.
* [ ] T016-2634 — No registrar binarios.
* [ ] T016-2635 — No registrar base64.
* [ ] T016-2636 — No registrar contenido del archivo.
* [ ] T016-2637 — No registrar tokens.
* [ ] T016-2638 — No registrar cookies.
* [ ] T016-2639 — No registrar headers sensibles.
* [ ] T016-2640 — Ejecutar `npm run test:secure-document-storage:access-log`.

---

# 24. Fase 20 — Auditoría

## 24.1. Eventos de auditoría

* [ ] T016-2701 — Auditar `document.created`.
* [ ] T016-2702 — Auditar `document.metadataUpdated`.
* [ ] T016-2703 — Auditar `document.uploaded`.
* [ ] T016-2704 — Auditar `document.fileRegistered`.
* [ ] T016-2705 — Auditar `document.versionCreated`.
* [ ] T016-2706 — Auditar `document.versionArchived`.
* [ ] T016-2707 — Auditar `document.fileArchived`.
* [ ] T016-2708 — Auditar `document.downloaded`.
* [ ] T016-2709 — Auditar `document.accessDenied`.
* [ ] T016-2710 — Auditar `document.archived`.
* [ ] T016-2711 — Auditar `document.restored`.
* [ ] T016-2712 — Auditar `document.quarantined`.
* [ ] T016-2713 — Auditar `document.rejected`.
* [ ] T016-2714 — Auditar `document.storageProviderConfigured`.
* [ ] T016-2715 — Auditar `document.storageConnectionTested`.

---

## 24.2. Metadata permitida

* [ ] T016-2730 — Permitir `documentId`.
* [ ] T016-2731 — Permitir `versionId`.
* [ ] T016-2732 — Permitir `fileId`.
* [ ] T016-2733 — Permitir `sourceModule`.
* [ ] T016-2734 — Permitir `sourceResourceType`.
* [ ] T016-2735 — Permitir `sourceResourceId`.
* [ ] T016-2736 — Permitir `category`.
* [ ] T016-2737 — Permitir `sensitivity`.
* [ ] T016-2738 — Permitir `visibility`.
* [ ] T016-2739 — Permitir `status`.
* [ ] T016-2740 — Permitir `fileSize`.
* [ ] T016-2741 — Permitir `mimeType`.
* [ ] T016-2742 — Permitir `mimeGroup`.
* [ ] T016-2743 — Permitir `hashPrefix`.
* [ ] T016-2744 — Permitir `provider`.
* [ ] T016-2745 — Permitir `accessType`.
* [ ] T016-2746 — Permitir `outcome`.
* [ ] T016-2747 — Permitir `traceId`.

---

## 24.3. Metadata prohibida

* [ ] T016-2760 — Bloquear `storageKey`.
* [ ] T016-2761 — Bloquear bucket.
* [ ] T016-2762 — Bloquear path interno.
* [ ] T016-2763 — Bloquear URL firmada.
* [ ] T016-2764 — Bloquear contenido de archivo.
* [ ] T016-2765 — Bloquear binarios.
* [ ] T016-2766 — Bloquear base64.
* [ ] T016-2767 — Bloquear tokens.
* [ ] T016-2768 — Bloquear cookies.
* [ ] T016-2769 — Bloquear `Authorization`.
* [ ] T016-2770 — Bloquear emails completos.
* [ ] T016-2771 — Bloquear teléfonos completos.
* [ ] T016-2772 — Bloquear cédulas.
* [ ] T016-2773 — Bloquear secretos.
* [ ] T016-2774 — Bloquear stack trace.
* [ ] T016-2775 — Bloquear SQL raw.
* [ ] T016-2776 — Bloquear provider payload completo.
* [ ] T016-2777 — Ejecutar `npm run test:secure-document-storage:audit`.

---

# 25. Fase 21 — Observabilidad

## 25.1. Logs

* [ ] T016-2801 — Agregar log `document.created`.
* [ ] T016-2802 — Agregar log `document.uploaded`.
* [ ] T016-2803 — Agregar log `document.downloaded`.
* [ ] T016-2804 — Agregar log `document.accessDenied`.
* [ ] T016-2805 — Agregar log `document.archived`.
* [ ] T016-2806 — Agregar log `document.restored`.
* [ ] T016-2807 — Agregar log `document.storageError`.
* [ ] T016-2808 — Agregar log `document.validationFailed`.
* [ ] T016-2809 — Incluir `traceId`.
* [ ] T016-2810 — Incluir `requestId`.
* [ ] T016-2811 — Incluir `correlationId`.
* [ ] T016-2812 — Incluir `action`.
* [ ] T016-2813 — Incluir `outcome`.
* [ ] T016-2814 — Incluir `status`.
* [ ] T016-2815 — Incluir `durationMs`.
* [ ] T016-2816 — Incluir `errorCode`.

---

## 25.2. Métricas

* [ ] T016-2830 — Agregar métrica `documents_created_total`.
* [ ] T016-2831 — Agregar métrica `documents_uploaded_total`.
* [ ] T016-2832 — Agregar métrica `documents_downloaded_total`.
* [ ] T016-2833 — Agregar métrica `documents_download_denied_total`.
* [ ] T016-2834 — Agregar métrica `documents_archived_total`.
* [ ] T016-2835 — Agregar métrica `documents_restored_total`.
* [ ] T016-2836 — Agregar métrica `document_upload_bytes_total`.
* [ ] T016-2837 — Agregar métrica `document_download_bytes_total`.
* [ ] T016-2838 — Agregar métrica `document_storage_errors_total`.
* [ ] T016-2839 — Agregar métrica `document_validation_failed_total`.
* [ ] T016-2840 — Validar labels permitidos.
* [ ] T016-2841 — Bloquear labels prohibidos.
* [ ] T016-2842 — Ejecutar `npm run test:secure-document-storage:observability`.

---

# 26. Fase 22 — Seguridad

## 26.1. Seguridad obligatoria

* [ ] T016-2901 — Verificar que no existen endpoints públicos.
* [ ] T016-2902 — Verificar que ningún body acepta `tenantId`.
* [ ] T016-2903 — Verificar que ningún body acepta `storageKey`.
* [ ] T016-2904 — Verificar que ningún recurso se busca solo por `id`.
* [ ] T016-2905 — Verificar que no se permiten documentos cross-tenant.
* [ ] T016-2906 — Verificar que no se permiten versiones cross-tenant.
* [ ] T016-2907 — Verificar que no se permiten archivos cross-tenant.
* [ ] T016-2908 — Verificar que no se permiten links cross-tenant.
* [ ] T016-2909 — Verificar que no se permiten policies cross-tenant.
* [ ] T016-2910 — Verificar que no se permiten access logs cross-tenant.
* [ ] T016-2911 — Verificar que no se permite `sourceResourceId` de otro tenant.
* [ ] T016-2912 — Verificar que no se permite `ownerUserId` de otro tenant.
* [ ] T016-2913 — Verificar que no se permite `ownerPersonId` de otro tenant.
* [ ] T016-2914 — Verificar que no se permite `ownerPropertyUnitId` de otro tenant.
* [ ] T016-2915 — Verificar que no se permite audience cross-tenant.
* [ ] T016-2916 — Verificar que no se expone `storageKey`.
* [ ] T016-2917 — Verificar que no se expone bucket/path interno.
* [ ] T016-2918 — Verificar que no se expone URL firmada persistente.
* [ ] T016-2919 — Verificar que no se descargan archivos sin autorización.
* [ ] T016-2920 — Verificar que no se descargan archivos quarantined.
* [ ] T016-2921 — Verificar que no se descargan archivos rejected.
* [ ] T016-2922 — Verificar que no se descargan archivos archived.
* [ ] T016-2923 — Verificar que no se descargan archivos missing.
* [ ] T016-2924 — Verificar que no se registran binarios en logs.
* [ ] T016-2925 — Verificar que no se registran binarios en auditoría.
* [ ] T016-2926 — Verificar que local storage no está permitido por defecto en producción.
* [ ] T016-2927 — Verificar que PlatformAdmin no accede automáticamente al contenido de tenants.
* [ ] T016-2928 — Ejecutar `npm run test:secure-document-storage:security`.

---

## 26.2. Tests negativos públicos

* [ ] T016-2940 — Test `GET /api/v1/public/documents/{documentId}` devuelve 404.
* [ ] T016-2941 — Test `GET /api/v1/public/document-files/{fileId}/download` devuelve 404.
* [ ] T016-2942 — Test `GET /api/v1/public/tenants/{slug}/documents` devuelve 404.
* [ ] T016-2943 — Test `GET /api/v1/public/tenants/{slug}/documents/{documentId}` devuelve 404.
* [ ] T016-2944 — Test `GET /api/v1/public/tenants/{slug}/document-files/{fileId}/download` devuelve 404.
* [ ] T016-2945 — Test `POST /api/v1/public/documents` devuelve 404.
* [ ] T016-2946 — Test `POST /api/v1/public/document-files/{fileId}/download` devuelve 404.
* [ ] T016-2947 — Confirmar que no se revela existencia del tenant.
* [ ] T016-2948 — Confirmar que no se revela existencia del documento.
* [ ] T016-2949 — Confirmar que no se revela existencia del archivo.

---

# 27. Fase 23 — OpenAPI

## 27.1. Documentación OpenAPI

* [ ] T016-3001 — Agregar tag `Secure Documents`.
* [ ] T016-3002 — Agregar tag `Secure Document Files`.
* [ ] T016-3003 — Agregar tag `Secure Document Versions`.
* [ ] T016-3004 — Agregar tag `My Secure Documents`.
* [ ] T016-3005 — Agregar tag `Document Storage Platform`.
* [ ] T016-3006 — Documentar DTOs request.
* [ ] T016-3007 — Documentar DTOs response.
* [ ] T016-3008 — Documentar errores.
* [ ] T016-3009 — Documentar permisos.
* [ ] T016-3010 — Documentar multipart upload.
* [ ] T016-3011 — Documentar binary stream response.
* [ ] T016-3012 — Agregar `x-tenant-scope`.
* [ ] T016-3013 — Agregar `x-auth-required`.
* [ ] T016-3014 — Agregar `x-required-permission`.
* [ ] T016-3015 — Agregar `x-own-resource` en endpoints `/me`.
* [ ] T016-3016 — Agregar `x-secure-download` en descargas.
* [ ] T016-3017 — Agregar `x-binary-response`.
* [ ] T016-3018 — Agregar `x-file-upload`.
* [ ] T016-3019 — Agregar `x-multipart`.
* [ ] T016-3020 — Agregar `x-storage-backed`.
* [ ] T016-3021 — Agregar `x-storage-key-exposed: false`.
* [ ] T016-3022 — Agregar `x-public-exposure: false`.
* [ ] T016-3023 — Agregar `x-platform-scope`.
* [ ] T016-3024 — Agregar `x-secrets-exposed: false`.
* [ ] T016-3025 — Agregar `x-audit-event`.

---

## 27.2. Tests OpenAPI

* [ ] T016-3040 — Validar que OpenAPI compila.
* [ ] T016-3041 — Validar todos los endpoints documentados.
* [ ] T016-3042 — Validar todos los permisos documentados.
* [ ] T016-3043 — Validar endpoints `/me` con `x-own-resource`.
* [ ] T016-3044 — Validar descargas con `x-secure-download`.
* [ ] T016-3045 — Validar descargas con `x-binary-response`.
* [ ] T016-3046 — Validar uploads con `x-multipart`.
* [ ] T016-3047 — Validar `x-storage-key-exposed: false`.
* [ ] T016-3048 — Validar `x-public-exposure: false`.
* [ ] T016-3049 — Validar platform con `x-secrets-exposed: false`.
* [ ] T016-3050 — Validar que OpenAPI no documenta endpoints públicos prohibidos.
* [ ] T016-3051 — Ejecutar `npm run test:secure-document-storage:openapi`.
* [ ] T016-3052 — Ejecutar `npm run openapi:validate`.

---

# 28. Fase 24 — Seeds y datos demo

## 28.1. Secure documents

* [ ] T016-3101 — Crear seed `secureDocumentPaymentReceiptA`.
* [ ] T016-3102 — Crear seed `secureDocumentFineEvidenceA`.
* [ ] T016-3103 — Crear seed `secureDocumentCertifiedMinutesPdfA`.
* [ ] T016-3104 — Crear seed `secureDocumentCertifiedMinutesAttachmentA`.
* [ ] T016-3105 — Crear seed `secureDocumentCommunicationAttachmentA`.
* [ ] T016-3106 — Crear seed `secureDocumentReportExportA`.
* [ ] T016-3107 — Crear seed `secureDocumentAdministrativeA`.
* [ ] T016-3108 — Crear seed `secureDocumentResidentA`.
* [ ] T016-3109 — Crear seed `secureDocumentPropertyA`.
* [ ] T016-3110 — Crear seed `secureDocumentSystemGeneratedA`.
* [ ] T016-3111 — Crear seed `secureDocumentArchivedA`.
* [ ] T016-3112 — Crear seed `secureDocumentQuarantinedA`.
* [ ] T016-3113 — Crear seed `secureDocumentRejectedA`.
* [ ] T016-3114 — Crear seed `secureDocumentTenantB`.

---

## 28.2. Versions, files, links, policies y access logs

* [ ] T016-3130 — Crear seed `secureDocumentVersion1A`.
* [ ] T016-3131 — Crear seed `secureDocumentVersion2A`.
* [ ] T016-3132 — Crear seed `secureDocumentVersionActiveA`.
* [ ] T016-3133 — Crear seed `secureDocumentVersionSupersededA`.
* [ ] T016-3134 — Crear seed `secureDocumentVersionArchivedA`.
* [ ] T016-3135 — Crear seed `secureDocumentVersionTenantB`.
* [ ] T016-3150 — Crear seed `secureDocumentFilePdfA`.
* [ ] T016-3151 — Crear seed `secureDocumentFileImagePngA`.
* [ ] T016-3152 — Crear seed `secureDocumentFileImageJpegA`.
* [ ] T016-3153 — Crear seed `secureDocumentFileDocxA`.
* [ ] T016-3154 — Crear seed `secureDocumentFileXlsxA`.
* [ ] T016-3155 — Crear seed `secureDocumentFileCsvA`.
* [ ] T016-3156 — Crear seed `secureDocumentFileJsonA`.
* [ ] T016-3157 — Crear seed `secureDocumentFileTextA`.
* [ ] T016-3158 — Crear seed `secureDocumentFileQuarantinedA`.
* [ ] T016-3159 — Crear seed `secureDocumentFileRejectedA`.
* [ ] T016-3160 — Crear seed `secureDocumentFileArchivedA`.
* [ ] T016-3161 — Crear seed `secureDocumentFileMissingA`.
* [ ] T016-3162 — Crear seed `secureDocumentFileTenantB`.
* [ ] T016-3180 — Crear seed `secureDocumentLinkPaymentA`.
* [ ] T016-3181 — Crear seed `secureDocumentLinkFineA`.
* [ ] T016-3182 — Crear seed `secureDocumentLinkCertifiedMinutesA`.
* [ ] T016-3183 — Crear seed `secureDocumentLinkCommunicationA`.
* [ ] T016-3184 — Crear seed `secureDocumentLinkPropertyUnitA`.
* [ ] T016-3185 — Crear seed `secureDocumentLinkTenantB`.
* [ ] T016-3200 — Crear seed `secureDocumentPolicyPrivateA`.
* [ ] T016-3201 — Crear seed `secureDocumentPolicyAdministrativeA`.
* [ ] T016-3202 — Crear seed `secureDocumentPolicyOwnersA`.
* [ ] T016-3203 — Crear seed `secureDocumentPolicyResidentsA`.
* [ ] T016-3204 — Crear seed `secureDocumentPolicySpecificUsersA`.
* [ ] T016-3205 — Crear seed `secureDocumentPolicySourceResourceAudienceA`.
* [ ] T016-3206 — Crear seed `secureDocumentPolicyExpiredA`.
* [ ] T016-3220 — Crear seed `secureDocumentAccessViewAllowedA`.
* [ ] T016-3221 — Crear seed `secureDocumentAccessDownloadAllowedA`.
* [ ] T016-3222 — Crear seed `secureDocumentAccessDownloadDeniedA`.
* [ ] T016-3223 — Crear seed `secureDocumentAccessQuarantinedA`.
* [ ] T016-3224 — Crear seed `secureDocumentAccessRejectedA`.
* [ ] T016-3225 — Crear seed `secureDocumentAccessArchivedA`.

---

## 28.3. Prohibiciones en seeds

* [ ] T016-3240 — Verificar que no hay nombres reales.
* [ ] T016-3241 — Verificar que no hay emails reales.
* [ ] T016-3242 — Verificar que no hay teléfonos reales.
* [ ] T016-3243 — Verificar que no hay cédulas reales.
* [ ] T016-3244 — Verificar que no hay documentos reales.
* [ ] T016-3245 — Verificar que no hay comprobantes reales.
* [ ] T016-3246 — Verificar que no hay actas reales.
* [ ] T016-3247 — Verificar que no hay evidencias reales.
* [ ] T016-3248 — Verificar que no hay firmas reales.
* [ ] T016-3249 — Verificar que no hay storageKeys reales.
* [ ] T016-3250 — Verificar que no hay URLs firmadas reales.
* [ ] T016-3251 — Verificar que no hay tokens.
* [ ] T016-3252 — Verificar que no hay secretos.
* [ ] T016-3253 — Verificar que no hay datos financieros reales.
* [ ] T016-3254 — Verificar que no hay datos sancionatorios reales.

---

# 29. Fase 25 — Performance

## 29.1. Escenarios

* [ ] T016-3301 — Medir `GET /tenant/documents` con 10.000 documentos por tenant.
* [ ] T016-3302 — Medir filtros por `sourceModule`.
* [ ] T016-3303 — Medir filtros por `category`.
* [ ] T016-3304 — Medir filtros por `status`.
* [ ] T016-3305 — Medir `GET /tenant/documents/{id}/versions` con 100 versiones.
* [ ] T016-3306 — Medir `GET /tenant/document-files/{id}`.
* [ ] T016-3307 — Medir `GET /me/documents` con 500 documentos autorizados.
* [ ] T016-3308 — Medir upload de archivo pequeño.
* [ ] T016-3309 — Medir upload de archivo al límite permitido.
* [ ] T016-3310 — Medir download streaming administrativo.
* [ ] T016-3311 — Medir download streaming propio.
* [ ] T016-3312 — Medir hash calculation para archivo al límite.
* [ ] T016-3313 — Medir insert de access log.

---

## 29.2. Validaciones

* [ ] T016-3330 — Verificar `p95 < 700 ms` para listados paginados de metadata.
* [ ] T016-3331 — Verificar `p95 < 1500 ms` para preparar descarga autorizada.
* [ ] T016-3332 — Verificar `p95 < 3000 ms` para upload de archivo pequeño/medio sin latencia extrema externa.
* [ ] T016-3333 — Verificar paginación obligatoria.
* [ ] T016-3334 — Verificar `pageSize` máximo 100.
* [ ] T016-3335 — Verificar uso de índices.
* [ ] T016-3336 — Verificar ausencia de N+1 evidente.
* [ ] T016-3337 — Verificar que listados no cargan binarios.
* [ ] T016-3338 — Verificar que JSON no incluye base64.
* [ ] T016-3339 — Verificar streaming de descargas.
* [ ] T016-3340 — Verificar hash por stream cuando sea posible.
* [ ] T016-3341 — Ejecutar `npm run test:secure-document-storage:performance` si existe.

---

# 30. Fase 26 — Concurrencia

## 30.1. Concurrencia crítica

* [ ] T016-3401 — Probar dos requests simultáneos creando versión para mismo documento.
* [ ] T016-3402 — Garantizar `versionNumber` único e incremental.
* [ ] T016-3403 — Probar dos requests simultáneos subiendo primary file para misma versión.
* [ ] T016-3404 — Garantizar un primary file activo por versión.
* [ ] T016-3405 — Probar dos requests simultáneos archivando y descargando archivo.
* [ ] T016-3406 — Definir resultado consistente ante archive/download simultáneo.
* [ ] T016-3407 — Probar dos requests simultáneos restaurando documento archivado.
* [ ] T016-3408 — Garantizar idempotencia o error 409 controlado.
* [ ] T016-3409 — Probar dos uploads con mismo `Idempotency-Key`.
* [ ] T016-3410 — Garantizar que no se duplica documento/file si política idempotente aplica.
* [ ] T016-3411 — Mapear errores de constraint a códigos de dominio.
* [ ] T016-3412 — Ejecutar tests de concurrencia.

---

# 31. Fase 27 — Smoke test

## 31.1. Flujo mínimo

* [ ] T016-3501 — Ejecutar `GET /api/v1/health`.
* [ ] T016-3502 — Crear documento lógico.
* [ ] T016-3503 — Crear versión inicial.
* [ ] T016-3504 — Subir archivo PDF.
* [ ] T016-3505 — Listar documentos.
* [ ] T016-3506 — Obtener documento.
* [ ] T016-3507 — Listar versiones.
* [ ] T016-3508 — Obtener metadata de archivo.
* [ ] T016-3509 — Descargar archivo.
* [ ] T016-3510 — Verificar access log de descarga.
* [ ] T016-3511 — Archivar archivo.
* [ ] T016-3512 — Verificar que archivo archivado no descarga.
* [ ] T016-3513 — Archivar documento.
* [ ] T016-3514 — Verificar que documento archivado no aparece por defecto.
* [ ] T016-3515 — Restaurar documento.
* [ ] T016-3516 — Consultar documentos desde `/me` si aplica.
* [ ] T016-3517 — Verificar que endpoint público no existe.
* [ ] T016-3518 — Verificar que ninguna respuesta contiene `storageKey`.
* [ ] T016-3519 — Ejecutar `npm run test:secure-document-storage:smoke`.

---

# 32. Fase 28 — CI/CD

## 32.1. Scripts

* [ ] T016-3601 — Agregar script `test:secure-document-storage`.
* [ ] T016-3602 — Agregar script `test:secure-document-storage:unit`.
* [ ] T016-3603 — Agregar script `test:secure-document-storage:domain`.
* [ ] T016-3604 — Agregar script `test:secure-document-storage:dto`.
* [ ] T016-3605 — Agregar script `test:secure-document-storage:application`.
* [ ] T016-3606 — Agregar script `test:secure-document-storage:repositories`.
* [ ] T016-3607 — Agregar script `test:secure-document-storage:storage`.
* [ ] T016-3608 — Agregar script `test:secure-document-storage:hash`.
* [ ] T016-3609 — Agregar script `test:secure-document-storage:file-validation`.
* [ ] T016-3610 — Agregar script `test:secure-document-storage:api`.
* [ ] T016-3611 — Agregar script `test:secure-document-storage:authorization`.
* [ ] T016-3612 — Agregar script `test:secure-document-storage:own-resource`.
* [ ] T016-3613 — Agregar script `test:secure-document-storage:source-resource`.
* [ ] T016-3614 — Agregar script `test:secure-document-storage:multitenancy`.
* [ ] T016-3615 — Agregar script `test:secure-document-storage:audit`.
* [ ] T016-3616 — Agregar script `test:secure-document-storage:access-log`.
* [ ] T016-3617 — Agregar script `test:secure-document-storage:observability`.
* [ ] T016-3618 — Agregar script `test:secure-document-storage:security`.
* [ ] T016-3619 — Agregar script `test:secure-document-storage:openapi`.
* [ ] T016-3620 — Agregar script `test:secure-document-storage:performance`.
* [ ] T016-3621 — Agregar script `test:secure-document-storage:smoke`.

---

## 32.2. Gates

* [ ] T016-3640 — Gate lint.
* [ ] T016-3641 — Gate typecheck.
* [ ] T016-3642 — Gate unit tests.
* [ ] T016-3643 — Gate domain tests.
* [ ] T016-3644 — Gate DTO validation.
* [ ] T016-3645 — Gate application tests.
* [ ] T016-3646 — Gate repository tests.
* [ ] T016-3647 — Gate storage tests.
* [ ] T016-3648 — Gate hash tests.
* [ ] T016-3649 — Gate file validation tests.
* [ ] T016-3650 — Gate API tests.
* [ ] T016-3651 — Gate authorization tests.
* [ ] T016-3652 — Gate own-resource tests.
* [ ] T016-3653 — Gate source-resource tests.
* [ ] T016-3654 — Gate multitenancy tests.
* [ ] T016-3655 — Gate audit tests.
* [ ] T016-3656 — Gate access-log tests.
* [ ] T016-3657 — Gate observability tests.
* [ ] T016-3658 — Gate security tests.
* [ ] T016-3659 — Gate OpenAPI validation.
* [ ] T016-3660 — Gate no public endpoints.
* [ ] T016-3661 — Gate no `storageKey` in API snapshots.
* [ ] T016-3662 — Gate no binary in JSON.
* [ ] T016-3663 — Gate no binary in logs.
* [ ] T016-3664 — Gate no binary in audit.
* [ ] T016-3665 — Gate local storage disabled in production by default.
* [ ] T016-3666 — Gate build.

---

# 33. Fase 29 — Documentación final

## 33.1. Actualización documental

* [ ] T016-3701 — Actualizar `docs/specs/016-secure-document-storage/spec.md` si cambia el alcance.
* [ ] T016-3702 — Actualizar `docs/specs/016-secure-document-storage/plan.md` si cambia arquitectura.
* [ ] T016-3703 — Actualizar `docs/specs/016-secure-document-storage/data-model.md` si cambia modelo.
* [ ] T016-3704 — Actualizar `docs/specs/016-secure-document-storage/api-contract.md` si cambia contrato.
* [ ] T016-3705 — Actualizar `docs/specs/016-secure-document-storage/test-plan.md` si cambian pruebas.
* [ ] T016-3706 — Actualizar `docs/specs/016-secure-document-storage/tasks.md`.
* [ ] T016-3707 — Crear o actualizar `docs/specs/016-secure-document-storage/security-notes.md`.
* [ ] T016-3708 — Actualizar OpenAPI.
* [ ] T016-3709 — Actualizar README técnico del módulo si existe.
* [ ] T016-3710 — Documentar configuración local dev.
* [ ] T016-3711 — Documentar configuración S3-compatible.
* [ ] T016-3712 — Documentar advertencia de que `publicEligible` no significa documento público.
* [ ] T016-3713 — Documentar diferidos: antivirus, retención, DLP, firma, OCR, IA, publicación pública.

---

# 34. Checklist de aceptación funcional

* [ ] T016-3801 — Se crean documentos lógicos.
* [ ] T016-3802 — Se crean versiones de documentos.
* [ ] T016-3803 — Se suben archivos válidos.
* [ ] T016-3804 — Se registran archivos generados por sistema.
* [ ] T016-3805 — Se calcula hash SHA-256.
* [ ] T016-3806 — Se valida MIME type.
* [ ] T016-3807 — Se valida extensión.
* [ ] T016-3808 — Se valida tamaño.
* [ ] T016-3809 — Se sanitiza filename.
* [ ] T016-3810 — Se bloquea path traversal.
* [ ] T016-3811 — Se genera `storageKey` en servidor.
* [ ] T016-3812 — Se consulta metadata administrativa.
* [ ] T016-3813 — Se consulta metadata propia autorizada.
* [ ] T016-3814 — Se descargan archivos autorizados.
* [ ] T016-3815 — Se rechaza descarga no autorizada.
* [ ] T016-3816 — Se rechaza descarga de quarantined.
* [ ] T016-3817 — Se rechaza descarga de rejected.
* [ ] T016-3818 — Se rechaza descarga de archived.
* [ ] T016-3819 — Se rechaza descarga de missing.
* [ ] T016-3820 — Se archivan documentos.
* [ ] T016-3821 — Se restauran documentos.
* [ ] T016-3822 — Se archivan archivos.
* [ ] T016-3823 — Se registran access logs.
* [ ] T016-3824 — Se emiten eventos de auditoría.
* [ ] T016-3825 — Se exponen endpoints platform seguros.
* [ ] T016-3826 — No existen endpoints públicos.

---

# 35. Checklist de aceptación técnica

* [ ] T016-3901 — Todas las tablas nuevas tienen `tenant_id`.
* [ ] T016-3902 — Todas las consultas filtran por `tenant_id`.
* [ ] T016-3903 — Ningún endpoint acepta `tenantId` desde body.
* [ ] T016-3904 — Ningún endpoint acepta `storageKey` desde cliente.
* [ ] T016-3905 — No se busca `SecureDocument` solo por `id`.
* [ ] T016-3906 — No se busca `SecureDocumentVersion` solo por `id`.
* [ ] T016-3907 — No se busca `SecureDocumentFile` solo por `id`.
* [ ] T016-3908 — No se busca `SecureDocumentLink` solo por `id`.
* [ ] T016-3909 — No se busca `SecureDocumentPolicy` solo por `id`.
* [ ] T016-3910 — No se busca `SecureDocumentAccessLog` solo por `id`.
* [ ] T016-3911 — `sourceResourceId` se valida contra tenant.
* [ ] T016-3912 — `ownerUserId` se valida contra tenant.
* [ ] T016-3913 — `ownerPersonId` se valida contra tenant.
* [ ] T016-3914 — `ownerPropertyUnitId` se valida contra tenant.
* [ ] T016-3915 — `audienceRules` se validan contra tenant.
* [ ] T016-3916 — `storageKey` no se expone.
* [ ] T016-3917 — URL firmada persistente no se expone.
* [ ] T016-3918 — Binarios no viajan en JSON.
* [ ] T016-3919 — Logs no contienen binarios.
* [ ] T016-3920 — Auditoría no contiene binarios.
* [ ] T016-3921 — Hash usa SHA-256.
* [ ] T016-3922 — Archivo `available` tiene hash.
* [ ] T016-3923 — OpenAPI no documenta endpoints públicos.
* [ ] T016-3924 — Local storage no está habilitado en producción por defecto.
* [ ] T016-3925 — CI pasa.

---

# 36. Checklist de no regresión

* [ ] T016-4001 — No se rompe `001-tenants`.
* [ ] T016-4002 — No se rompe `002-users-roles`.
* [ ] T016-4003 — No se rompe `003-residents-properties`.
* [ ] T016-4004 — No se rompe `005-payments`.
* [ ] T016-4005 — No se rompe `007-audit`.
* [ ] T016-4006 — No se rompe `011-fines-sanctions`.
* [ ] T016-4007 — No se rompe `012-communications-notifications`.
* [ ] T016-4008 — No se rompe `015-certified-minutes`.
* [ ] T016-4009 — No se rompe OpenAPI general.
* [ ] T016-4010 — No se rompe autenticación Keycloak/OIDC.
* [ ] T016-4011 — No se rompe tenant active context.
* [ ] T016-4012 — No se rompe autorización por permisos.
* [ ] T016-4013 — No se rompe CI/CD.
* [ ] T016-4014 — No se rompe configuración Docker local.
* [ ] T016-4015 — No se rompe almacenamiento previo específico de módulos si aún coexiste durante migración.

---

# 37. Comandos sugeridos

## 37.1. Comandos específicos

```bash
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

## 37.2. Comandos generales

```bash
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

# 38. Orden recomendado de ejecución

## 38.1. Implementación mínima segura

```text
1. Estructura base del módulo.
2. Enums y value objects.
3. Entidades de dominio.
4. State machines.
5. Metadata sanitizer.
6. File validation.
7. Hash SHA-256.
8. Prisma schema y migraciones.
9. Repositorios tenant-scoped.
10. StoragePort.
11. MockStorageAdapter.
12. LocalStorageAdapter.
13. S3Compatible adapter preparado.
14. Servicios de documentos.
15. Servicios de versiones.
16. Servicios de archivos.
17. Upload seguro.
18. Download seguro.
19. Source resource validation.
20. Owner validation.
21. Own-resource authorization.
22. Access logs.
23. Auditoría.
24. Observabilidad.
25. Controllers administrativos.
26. Controllers /me.
27. Controllers platform.
28. OpenAPI.
29. Security tests.
30. Smoke tests.
31. CI gates.
```

---

## 38.2. Orden de PRs sugerido

```text
PR-016-01 — Module skeleton, enums and value objects.
PR-016-02 — Domain entities, state machines and metadata sanitizer.
PR-016-03 — Prisma schema, migration and repositories.
PR-016-04 — Hash, file validation and storage key policy.
PR-016-05 — StoragePort, mock adapter and local adapter.
PR-016-06 — S3-compatible adapter readiness.
PR-016-07 — Document, version and file services.
PR-016-08 — Upload and download workflows.
PR-016-09 — Source resource, owner and own-resource policies.
PR-016-10 — Admin API and /me API.
PR-016-11 — Platform storage config API.
PR-016-12 — Access logs, audit and observability.
PR-016-13 — OpenAPI, tests and security hardening.
```

---

# 39. Tareas diferidas explícitas

Estas tareas quedan fuera del MVP y no deben implementarse dentro de esta spec:

```text
[-] Firma electrónica legal.
[-] Firma electrónica avanzada.
[-] Firma electrónica cualificada.
[-] Sellado de tiempo externo.
[-] Certificación notarial.
[-] Verificación pública con QR.
[-] Publicación pública directa.
[-] CDN público.
[-] Gestor documental completo tipo DMS.
[-] Edición colaborativa.
[-] OCR.
[-] Antivirus real obligatorio.
[-] DLP avanzado.
[-] Búsqueda full-text del contenido.
[-] Indexación semántica.
[-] IA sobre documentos reales.
[-] Google Drive integration.
[-] OneDrive integration.
[-] Dropbox integration.
[-] Eliminación física automática.
[-] Legal hold.
[-] Retención legal avanzada.
[-] Cifrado por tenant con llaves dedicadas.
[-] Preview avanzado.
[-] Conversión universal de formatos.
[-] Publicación en WordPress.
[-] Storage público.
[-] Bucket público.
[-] ACL pública.
```

---

# 40. No aceptación

La implementación no debe aceptarse si:

```text
- permite documentos cross-tenant;
- permite archivos cross-tenant;
- permite versiones cross-tenant;
- permite links cross-tenant;
- permite policies cross-tenant;
- permite access logs cross-tenant;
- permite sourceResourceId de otro tenant;
- permite ownerUserId de otro tenant;
- permite ownerPersonId de otro tenant;
- permite ownerPropertyUnitId de otro tenant;
- permite audienceRules cross-tenant;
- acepta tenantId desde body;
- acepta storageKey desde cliente;
- expone storageKey;
- expone bucket o path interno;
- expone URL firmada persistente;
- descarga sin autorización;
- descarga archivo en cuarentena;
- descarga archivo rechazado;
- descarga archivo archivado;
- descarga archivo missing;
- descarga archivo failed;
- muestra documentos archivados por defecto;
- omite hash de archivo available;
- no valida MIME type;
- no valida fileSize;
- permite path traversal;
- permite MIME spoofing evidente;
- registra binarios en JSON;
- registra binarios en logs;
- registra binarios en auditoría;
- crea endpoints públicos;
- documenta endpoints públicos en OpenAPI;
- permite acceso PlatformAdmin automático al contenido de tenants;
- usa storage local como configuración productiva por defecto;
- omite access logs de descargas;
- omite auditoría de operaciones críticas;
- expone secretos de configuración platform;
- envía documentos reales a IA externa.
```

---

# 41. Resultado esperado

Al completar estas tareas, el módulo `016-secure-document-storage` deberá quedar implementado como infraestructura documental transversal segura para RESIDENT Core.

Debe quedar implementado:

```text
- Secure document registry.
- Document versioning.
- Secure document files.
- Source module awareness.
- Source resource validation.
- Owner validation.
- Audience rules validation.
- Metadata sanitizer.
- File validation.
- MIME allowlist.
- Filename sanitizer.
- Path traversal protection.
- SHA-256 file hash.
- Server-generated storageKey.
- StorageKey protection.
- Storage provider abstraction.
- Mock storage adapter.
- Local storage adapter for development.
- S3-compatible adapter readiness.
- Secure upload.
- Secure download.
- Binary streaming.
- Access logs.
- Audit events.
- Safe logs.
- Safe metrics.
- Admin API.
- Own documents API.
- Platform storage config API.
- OpenAPI.
- Security tests.
- CI gates.
- No public exposure.
```

El módulo debe quedar preparado para futuras specs de:

```text
00X-document-retention-policy
00X-antivirus-malware-scanning
00X-public-document-publishing
00X-document-qr-verification
00X-electronic-signatures
00X-external-timestamping
00X-document-full-text-search
00X-document-ai-classification
00X-document-legal-hold
00X-document-encryption-per-tenant
00X-document-lifecycle-automation
```
