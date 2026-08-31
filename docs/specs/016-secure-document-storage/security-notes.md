# Security Notes — Spec 016 Secure Document Storage

> Frontera operativa Sprint 3: el contrato canónico es
> `docs/changes/GAP-S3-008-FILE-SECURITY-OPERATING-POLICY-2026-08-30.md`; prevalece para
> MIME, tamaño, scan, cuarentena, provider, descarga, cifrado y retención.

> Permisos/Audit Sprint 3: el contrato canónico es
> `docs/changes/GAP-S3-007-PERMISSIONS-AUDIT-CATALOG-2026-08-30.md`; no publica
> `documents.*`, normaliza `FinancialManager` a `Treasurer` y limita el catálogo Audit.

> Frontera Sprint 3: GAP-S3-005 está cerrado por
> `docs/changes/GAP-S3-005-PAYMENTS-DOCUMENT-STORAGE-BOUNDARY-2026-08-29.md`.
> Upload temporal, promoción, compensación y reconciliación son tenant-scoped y nunca
> exponen claves internas. Este documento queda `accepted`.

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                                 |
| Spec ID         | 016                                                                                                                                                                           |
| Módulo          | Secure Document Storage                                                                                                                                                       |
| Documento       | Security Notes                                                                                                                                                                |
| Ruta            | `docs/specs/016-secure-document-storage/security-notes.md`                                                                                                                    |
| Versión         | 0.1                                                                                                                                                                           |
| Estado          | accepted                                                                                                                                                                  |
| Fecha           | 2026-07-21                                                                                                                                                                    |
| Documento base  | `docs/specs/016-secure-document-storage/spec.md`                                                                                                                              |
| Plan técnico    | `docs/specs/016-secure-document-storage/plan.md`                                                                                                                              |
| Modelo de datos | `docs/specs/016-secure-document-storage/data-model.md`                                                                                                                        |
| Contrato API    | `docs/specs/016-secure-document-storage/api-contract.md`                                                                                                                      |
| Plan de pruebas | `docs/specs/016-secure-document-storage/test-plan.md`                                                                                                                         |
| Tareas          | `docs/specs/016-secure-document-storage/tasks.md`                                                                                                                             |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `007-audit`                                                                                                      |
| Naturaleza      | Tenant-scoped / Storage-backed / Metadata-driven / Hash-aware / Access-controlled / Source-module-aware / Own-resource-aware / Audit-heavy / Non-public by default            |

---

## 2. Propósito

Este documento define las notas de seguridad para el módulo `016-secure-document-storage`.

El módulo administra la capa transversal de almacenamiento documental seguro de RESIDENT Core. Por lo tanto, es una pieza crítica, porque será utilizada por módulos que manejan comprobantes, evidencias, adjuntos, actas, PDFs, reportes exportados y documentos internos.

Regla central:

```text id="ip01ac"
Todo documento, versión, archivo físico, vínculo, política, descarga y access log debe proteger tenant isolation, source resource validation, owner validation, storageKey protection, hash integrity, file validation, secure download, safe metadata, audit trail, no binary JSON, no public exposure y no local storage productivo por defecto.
```

---

## 3. Resumen ejecutivo de seguridad

`Secure Document Storage` es un módulo transversal de alto impacto.

Una falla en este módulo puede comprometer simultáneamente:

```text id="r2u5zm"
- comprobantes de pago;
- evidencias de multas;
- documentos de apelación;
- PDFs de actas certificadas;
- adjuntos de actas;
- adjuntos de comunicaciones;
- reportes exportados;
- documentos administrativos;
- documentos de residentes;
- documentos de unidades habitacionales;
- documentos generados por sistema.
```

Riesgos principales:

```text id="em860i"
- exposición de documentos entre tenants;
- descarga no autorizada;
- exposición de storageKey;
- exposición de bucket o path interno;
- exposición de URL firmada persistente;
- uso de sourceResourceId de otro tenant;
- uso de ownerUserId, ownerPersonId u ownerPropertyUnitId de otro tenant;
- upload de archivos maliciosos;
- path traversal;
- MIME spoofing;
- archivos demasiado grandes;
- binarios en JSON;
- binarios en logs;
- binarios en auditoría;
- access logs con datos sensibles;
- configuración platform que expone secretos;
- storage local habilitado por defecto en producción;
- endpoint público accidental.
```

Controles obligatorios:

```text id="u2hjq3"
- tenant_id obligatorio en todas las tablas;
- consultas siempre tenant-scoped;
- no tenantId desde body;
- no storageKey desde cliente;
- sourceResourceId validado contra tenant;
- ownerId validado contra tenant;
- audienceRules validadas contra tenant;
- storageKey generado en servidor;
- storageKey nunca expuesto;
- bucket y path interno nunca expuestos;
- descarga mediante endpoint autorizado;
- hash SHA-256;
- validación de MIME, extensión, tamaño y filename;
- bloqueo de path traversal;
- DTOs minimizados;
- logs sanitizados;
- auditoría sanitizada;
- access logs sanitizados;
- OpenAPI sin rutas públicas;
- local storage bloqueado en producción por defecto.
```

---

## 4. Alcance de seguridad

### 4.1. Incluido

Estas notas cubren:

```text id="licsx5"
1. Autenticación.
2. Autorización.
3. Tenant isolation.
4. Source resource validation.
5. Owner validation.
6. Audience rules validation.
7. Seguridad de documentos.
8. Seguridad de versiones.
9. Seguridad de archivos físicos.
10. Seguridad de links.
11. Seguridad de policies.
12. Seguridad de access logs.
13. Seguridad de metadata.
14. Seguridad de upload.
15. Seguridad de download.
16. Seguridad de storageKey.
17. Seguridad de storage local.
18. Seguridad de storage S3-compatible.
19. Seguridad de hashes.
20. Seguridad de MIME type.
21. Seguridad de filename.
22. Protección contra path traversal.
23. Protección contra MIME spoofing.
24. Control de archivos grandes.
25. Cuarentena y estados futuros de escaneo.
26. Auditoría.
27. Observabilidad.
28. Configuración platform.
29. OpenAPI.
30. CI/CD gates.
31. No exposición pública.
32. Prohibición de IA externa con documentos reales.
```

---

### 4.2. Fuera de alcance del MVP

No son controles implementados dentro de esta spec:

```text id="ppnt6f"
- firma electrónica legal;
- firma electrónica avanzada;
- firma electrónica cualificada;
- sellado de tiempo externo;
- certificación notarial;
- verificación pública con QR;
- publicación pública directa;
- CDN público;
- gestor documental completo tipo DMS;
- antivirus real obligatorio;
- DLP avanzado;
- OCR;
- búsqueda full-text;
- indexación semántica;
- IA sobre documentos reales;
- eliminación física automática;
- legal hold;
- retención legal avanzada;
- cifrado por tenant con llaves dedicadas;
- integración Google Drive, OneDrive o Dropbox;
- preview avanzado;
- conversión universal de formatos.
```

Estos elementos requieren specs futuras.

---

## 5. Principio de seguridad dominante

Este módulo debe diseñarse bajo el principio:

```text id="q4u0ds"
El archivo físico nunca es accesible directamente por el usuario final; siempre se accede a través de una decisión de autorización de RESIDENT Core.
```

Por lo tanto:

```text id="inswxv"
- el bucket debe ser privado;
- el path interno debe ser privado;
- el storageKey debe ser privado;
- la URL temporal, si existe, debe ser corta y posterior a autorización;
- el archivo no debe tener URL persistente pública;
- WordPress no debe consumir archivos privados directamente;
- ningún endpoint público debe exponer documentos en MVP.
```

---

## 6. Activos protegidos

### 6.1. Documentos lógicos

```text id="fg0q2r"
secure_documents
```

Protegen:

* clasificación documental;
* título y descripción;
* módulo origen;
* recurso origen;
* owner lógico;
* categoría;
* sensibilidad;
* visibilidad;
* estado;
* metadata segura.

---

### 6.2. Versiones

```text id="w7l2ag"
secure_document_versions
```

Protegen:

* historial lógico;
* razón de cambio;
* versión activa;
* versiones superadas;
* archivo lógico;
* trazabilidad de reemplazos.

---

### 6.3. Archivos físicos

```text id="k2kf8d"
secure_document_files
```

Protegen:

* provider;
* storageKey;
* filename original;
* filename seguro;
* MIME type;
* tamaño;
* hash;
* estado;
* scan status;
* referencia al archivo real.

---

### 6.4. Vínculos

```text id="nntagn"
secure_document_links
```

Protegen relaciones con:

```text id="g7lgcz"
payment
paymentReceipt
fine
fineEvidence
communication
certifiedMinutes
certifiedMinutesArtifact
certifiedMinutesAttachment
reportExport
person
propertyUnit
tenant
```

---

### 6.5. Políticas documentales

```text id="a9y9vp"
secure_document_policies
```

Protegen:

* visibilidad;
* sensibilidad;
* reglas de audiencia;
* delegación al módulo origen;
* permisos owner;
* expiración;
* reglas de descarga.

---

### 6.6. Access logs

```text id="q1t1fl"
secure_document_access_logs
```

Protegen:

* trazabilidad de acceso;
* intentos permitidos;
* intentos denegados;
* descargas;
* previews futuras;
* exports;
* outcomes de seguridad.

---

### 6.7. Storage físico

Protege:

```text id="ibg29c"
bucket
path interno
storageKey
objeto binario
hash completo
provider metadata
credenciales
URLs temporales
configuración de cifrado
```

---

## 7. Clasificación de datos

### 7.1. Datos altamente sensibles

```text id="jwuawh"
storageKey
bucket
path interno
URL firmada
credenciales de storage
access key
secret key
tokens
contenido binario
base64 del archivo
documentos reales
comprobantes reales
actas reales
evidencias reales
PDFs oficiales
archivos sancionatorios
hash completo si la política lo restringe
```

---

### 7.2. Datos confidenciales

```text id="pzfgil"
título de documento
descripción
sourceResourceId
ownerUserId
ownerPersonId
ownerPropertyUnitId
documentId
fileId
versionId
category
sensitivity
visibility
audit metadata
access log metadata
```

---

### 7.3. Datos personales potenciales

```text id="o9p8ho"
nombres dentro de documentos
emails dentro de documentos
teléfonos dentro de documentos
cédulas dentro de documentos
datos bancarios dentro de comprobantes
firmas dentro de documentos
direcciones o referencias de unidades
información sancionatoria
información financiera
información de asistencia a reuniones
```

Regla:

```text id="xi12en"
El módulo no debe inspeccionar ni registrar contenido interno de archivos para logs, auditoría o metadata ordinaria.
```

---

### 7.4. Datos permitidos en DTOs estándar

```text id="j47sgp"
id
title
description segura
status
visibility
sensitivity
category
sourceModule
sourceResourceType
sourceResourceId
ownerType
ownerUserId si corresponde y autorizado
ownerPersonId si corresponde y autorizado
ownerPropertyUnitId si corresponde y autorizado
currentVersionId
activeFileId
originalFileName
safeFileName
extension
mimeType
mimeGroup
fileSize
hashPrefix
hashAlgorithm
scanStatus
createdAt
updatedAt
uploadedAt
generatedAt
archivedAt
metadata segura
```

---

### 7.5. Datos prohibidos en DTOs estándar

```text id="oizeyt"
storageKey
bucket
path interno
URL firmada
URL persistente
credenciales
accessKeyId
secretAccessKey
connectionString
contenido binario
base64
fileHash completo
provider payload completo
stack trace
SQL raw
tokens
cookies
Authorization header
```

---

## 8. Fronteras de confianza

### 8.1. Cliente/API

Riesgos:

```text id="x8xobf"
- cliente envía tenantId falso;
- cliente envía storageKey;
- cliente envía sourceResourceId de otro tenant;
- cliente envía ownerId de otro tenant;
- cliente intenta subir archivo peligroso;
- cliente intenta path traversal;
- cliente intenta MIME spoofing;
- cliente intenta base64 en JSON;
- cliente intenta cambiar status o activeFileId manualmente.
```

Controles:

```text id="tkc431"
- DTO whitelist;
- forbidNonWhitelisted;
- no tenantId body;
- no storageKey body;
- no fileHash body;
- validación sourceResource;
- validación owner;
- validación audienceRules;
- validación MIME;
- validación extensión;
- validación tamaño;
- filename sanitizer;
- metadata sanitizer;
- guards de autorización.
```

---

### 8.2. API/Base de datos

Riesgos:

```text id="rag89e"
- consulta por id simple;
- cross-tenant document;
- cross-tenant file;
- cross-tenant version;
- cross-tenant access log;
- references sin validar.
```

Controles:

```text id="ay03am"
- tenant_id en todas las tablas;
- repositorios tenant-scoped;
- prohibido findUnique por id simple;
- índices tenant_id + recurso;
- constraints;
- tests multitenant;
- code review obligatorio.
```

---

### 8.3. API/Storage

Riesgos:

```text id="tozs5r"
- storageKey filtrado;
- bucket público;
- path interno filtrado;
- URL persistente expuesta;
- objeto descargado sin autorización;
- objeto de tenant B descargado por tenant A;
- provider error filtra detalles.
```

Controles:

```text id="tyidje"
- bucket privado;
- objeto privado;
- storageKey generado por servidor;
- storageKey nunca expuesto;
- descarga por API autorizada;
- URL temporal solo después de autorización;
- TTL corto;
- no persistir URL temporal;
- safe errors;
- safe logs;
- auditoría sanitizada.
```

---

### 8.4. API/Módulos origen

Riesgos:

```text id="enuz31"
- módulo origen inexistente;
- sourceResourceId de otro tenant;
- owner falso;
- audiencia incorrecta;
- delegación mal implementada;
- documento visible a usuario incorrecto.
```

Controles:

```text id="lupcna"
- SourceResourceValidator por módulo;
- OwnerResolver;
- AudienceResolver;
- DocumentPolicyService;
- contratos claros con Payments, Fines, Communications, Certified Minutes y Reports;
- tests cross-module;
- fallback deny por defecto.
```

---

### 8.5. API/Platform config

Riesgos:

```text id="j09i31"
- exposición de secretos;
- local storage habilitado en producción;
- provider mal configurado;
- conexión de prueba revela payload del proveedor;
- usuario platform sin permiso modifica storage.
```

Controles:

```text id="eef8c7"
- PlatformPermissionGuard;
- DTO seguro;
- no secrets in response;
- local storage disabled by default in prod;
- audit storage config;
- safe provider errors;
- secret manager o variables seguras;
- no persistir secretos en DB transaccional.
```

---

## 9. Threat model resumido

### 9.1. Spoofing

Amenazas:

```text id="wj43vm"
- usuario intenta actuar como owner de otra unidad;
- usuario intenta cargar comprobante para paymentReceipt ajeno;
- usuario intenta descargar archivo con fileId ajeno;
- actor intenta enviar uploadedBy/generatedBy desde body;
- actor intenta usar rol administrativo sin permiso.
```

Controles:

```text id="k81fd6"
- Keycloak/OIDC;
- membership activa;
- permisos en Core;
- actor derivado del token;
- owner validation;
- source resource validation;
- no aceptar uploadedBy desde body;
- no aceptar generatedBy desde body externo salvo flujo system controlado;
- audit actor real.
```

---

### 9.2. Tampering

Amenazas:

```text id="bf33xp"
- alterar metadata sensible;
- reemplazar archivo sin versionado;
- manipular fileHash;
- manipular storageKey;
- cambiar activeFileId manualmente;
- modificar policy para incluirse;
- cambiar visibility a publicEligible y asumir publicación.
```

Controles:

```text id="gkut23"
- DTO restrictivos;
- fileHash calculado en servidor;
- storageKey generado en servidor;
- versionado;
- state machine;
- policies validadas;
- no public endpoints;
- publicEligible no habilita publicación;
- auditoría.
```

---

### 9.3. Repudiation

Amenazas:

```text id="f9m1yv"
- usuario niega descarga;
- administrador niega archivo;
- usuario niega upload;
- platform admin niega cambio de provider;
- actor niega acceso denegado reiterado.
```

Controles:

```text id="mcurqi"
- access logs;
- audit logs;
- actorUserId desde token;
- traceId;
- timestamps UTC;
- IP hash opcional;
- userAgent hash opcional;
- no delete físico ordinario.
```

---

### 9.4. Information Disclosure

Amenazas:

```text id="uml8d3"
- documento de tenant B visible para tenant A;
- storageKey expuesto;
- URL firmada expuesta en logs;
- bucket/path filtrado;
- documentos archivados visibles por defecto;
- access logs exponen datos personales;
- audit metadata contiene binarios;
- OpenAPI documenta endpoint público.
```

Controles:

```text id="ixc2hq"
- tenant isolation;
- DTO minimization;
- no storageKey;
- no signed URLs persisted;
- no binary JSON;
- safe audit;
- safe logs;
- access log minimization;
- no public endpoints;
- OpenAPI negative tests.
```

---

### 9.5. Denial of Service

Amenazas:

```text id="i9m8rw"
- uploads masivos;
- archivos demasiado grandes;
- descargas masivas;
- generación excesiva de access logs;
- cálculo hash con archivos grandes;
- storage externo lento;
- listados sin paginación.
```

Controles:

```text id="plquok"
- rate limiting;
- size limits;
- pageSize máximo 100;
- streaming;
- timeouts de storage;
- hash por stream cuando sea posible;
- cuotas futuras por tenant;
- backpressure;
- métricas.
```

---

### 9.6. Elevation of Privilege

Amenazas:

```text id="rueynl"
- usuario sin documents.download descarga por /tenant;
- usuario final descarga por /me documento ajeno;
- PlatformAdmin accede automáticamente a documentos tenant;
- usuario modifica configuración de storage;
- usuario crea policy amplia sin permiso.
```

Controles:

```text id="oaxbn1"
- PermissionGuard;
- OwnResourceGuard;
- PlatformDocumentStorageGuard;
- documents.managePolicies;
- PlatformAdmin sin acceso automático;
- owner validation;
- audience validation;
- source module delegation;
- audit reforzada.
```

---

## 10. Reglas de autenticación

Todos los endpoints requieren:

```text id="l2co31"
Authorization: Bearer <access_token>
```

Reglas:

```text id="w6mic2"
- no endpoints anónimos;
- no endpoints públicos;
- token válido;
- usuario activo;
- membership activa para endpoints tenant y /me;
- permisos platform para endpoints platform;
- Keycloak autentica;
- RESIDENT Core autoriza.
```

Errores:

```text id="eu0jhp"
401 sin token;
401 token inválido;
403 usuario disabled;
403 sin membership;
403 sin permiso;
404/403 recurso no accesible.
```

---

## 11. Reglas de autorización

### 11.1. Permisos administrativos

```text id="nxqm02"
documents.create
documents.read
documents.updateMetadata
documents.archive
documents.restore
documents.download
documents.managePolicies
```

---

### 11.2. Permisos propios

```text id="dq88h5"
documents.read.own
documents.download.own
documents.upload.own
```

---

### 11.3. Permisos de sistema

```text id="ltz4xm"
documents.registerSystemGenerated
documents.readSystemMetadata
```

---

### 11.4. Auditoría

```text id="p9zbp4"
documents.audit.read
```

---

### 11.5. Configuración platform

```text id="gu8pxe"
documents.storage.configure
documents.storage.readConfig
documents.storage.testConnection
```

---

### 11.6. Regla PlatformAdmin

PlatformAdmin no accede automáticamente al contenido documental de tenants.

Regla:

```text id="jmxhrz"
El rol PlatformAdmin puede administrar configuración de plataforma bajo permisos explícitos, pero no debe leer ni descargar contenido documental de tenants salvo flujo excepcional, permiso específico, justificación y auditoría reforzada.
```

---

## 12. Tenant isolation

### 12.1. Entidades tenant-scoped

Todas las tablas nuevas deben tener `tenant_id`:

```text id="ql2u7z"
secure_documents
secure_document_versions
secure_document_files
secure_document_links
secure_document_policies
secure_document_access_logs
```

---

### 12.2. Patrón requerido

```typescript id="p57k8f"
await prisma.secureDocument.findFirst({
  where: {
    id: documentId,
    tenantId: currentTenant.id,
    archivedAt: null
  }
});
```

---

### 12.3. Patrón prohibido

```typescript id="g8wbdj"
await prisma.secureDocument.findUnique({
  where: { id: documentId }
});
```

También prohibido:

```typescript id="mfrka8"
await prisma.secureDocumentVersion.findUnique({ where: { id: versionId } });
await prisma.secureDocumentFile.findUnique({ where: { id: fileId } });
await prisma.secureDocumentLink.findUnique({ where: { id: linkId } });
await prisma.secureDocumentPolicy.findUnique({ where: { id: policyId } });
await prisma.secureDocumentAccessLog.findUnique({ where: { id: accessLogId } });
```

---

### 12.4. Referencias que deben validarse contra tenant

```text id="cx0gtv"
documentId
versionId
fileId
linkId
policyId
sourceResourceId
ownerUserId
ownerPersonId
ownerPropertyUnitId
audienceRules.userIds
audienceRules.personIds
audienceRules.propertyUnitIds
audienceRules.roleIds
```

---

### 12.5. Respuesta ante cross-tenant

Recomendación:

```text id="d8fh14"
Para recursos de otro tenant, responder 404 en endpoints externos para reducir enumeración.
```

Puede usarse 403 si la política interna lo requiere, pero debe ser consistente.

---

## 13. Seguridad de source resource

### 13.1. Regla central

Todo documento asociado a recurso origen debe validar que ese recurso pertenece al tenant activo.

```text id="nx0aem"
sourceResource.tenantId == currentTenant.id
```

---

### 13.2. Validadores requeridos

```text id="lo0l6v"
PaymentDocumentSourceValidator
FineDocumentSourceValidator
CommunicationDocumentSourceValidator
CertifiedMinutesDocumentSourceValidator
ReportDocumentSourceValidator
ResidentsPropertiesDocumentSourceValidator
TenantDocumentSourceValidator
SystemDocumentSourceValidator
```

---

### 13.3. Deny by default

Regla:

```text id="q4q9os"
Si el sourceModule no tiene validator explícito, la operación debe denegarse salvo policy documentada para sourceModule=other.
```

---

### 13.4. Validaciones por módulo

Payments:

```text id="l6c2a0"
paymentId tenant-scoped
paymentReceiptId tenant-scoped
propertyUnitId tenant-scoped
owner autorizado para upload propio
financial manager autorizado para administración
```

Fines:

```text id="opp1z0"
fineId tenant-scoped
fineEvidenceId tenant-scoped
evidencia restricted por defecto
acceso propio solo si política del módulo lo permite
```

Communications:

```text id="dvye9z"
communicationId tenant-scoped
adjuntos privados no públicos por defecto
notificaciones no reciben storageKey
```

Certified Minutes:

```text id="fyomde"
certifiedMinutesId tenant-scoped
artifactId tenant-scoped
attachmentId tenant-scoped
descarga delega a audiencia de acta publicada
acta no publicada no autoriza descarga propia
```

Reports:

```text id="bzx0hq"
reportExportId tenant-scoped
visibility administrative por defecto
reportes propios solo si spec futura lo habilita
```

---

## 14. Seguridad de owner lógico

### 14.1. Owner types

```text id="wqfz8g"
user
person
propertyUnit
tenant
system
none
```

---

### 14.2. Reglas

```text id="x75fff"
ownerUserId debe pertenecer al tenant si ownerType=user;
ownerPersonId debe pertenecer al tenant si ownerType=person;
ownerPropertyUnitId debe pertenecer al tenant si ownerType=propertyUnit;
ownerType=tenant no requiere owner específico;
ownerType=system requiere generatedBy system o sourceModule=system;
ownerType=none no autoriza acceso propio por sí solo.
```

---

### 14.3. Prohibiciones

```text id="aa512y"
- ownerUserId de otro tenant;
- ownerPersonId de otro tenant;
- ownerPropertyUnitId de otro tenant;
- combinaciones inconsistentes de owner;
- owner falso para upload propio;
- acceso /me basado solo en ownerId sin validar relación real.
```

---

## 15. Seguridad de audienceRules

### 15.1. Regla central

Todo ID dentro de `audienceRules` debe pertenecer al tenant activo.

```text id="fis9d3"
audienceRules.userIds tenant-scoped
audienceRules.personIds tenant-scoped
audienceRules.propertyUnitIds tenant-scoped
audienceRules.roleIds tenant-scoped
```

---

### 15.2. Requeridas para visibilidades específicas

`audienceRules` es obligatorio para:

```text id="t8wq5z"
specificUsers
propertyUnits
roles
mixed
```

---

### 15.3. Endpoints `/me`

En `/me`, `audienceRules` no debe exponerse completo si revela terceros.

Permitido:

```text id="xdiscc"
downloadAvailable
accessReason genérica
visibility
category
sourceModule
```

No permitido:

```text id="nuy80r"
lista completa de userIds
lista completa de personIds
lista completa de propertyUnitIds
lista completa de roleIds
reglas internas completas
```

---

## 16. Seguridad de documentos

### 16.1. Estados

```text id="whic6v"
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

### 16.2. Reglas

```text id="kg5plo"
- draft no necesariamente tiene archivo;
- uploaded indica carga recibida;
- available puede descargarse solo si política autoriza;
- quarantined no descargable por usuarios finales;
- rejected no descargable por usuarios finales;
- archived no visible por defecto;
- deletedPending no descargable salvo flujo interno futuro;
- restored requiere validación de archivo físico.
```

---

### 16.3. Prohibiciones

```text id="wtahlx"
- mostrar archived por defecto;
- descargar archived;
- restaurar sin validar archivo físico;
- cambiar status desde PATCH metadata;
- aceptar status desde body externo;
- eliminar físicamente en operación ordinaria.
```

---

## 17. Seguridad de versiones

### 17.1. Reglas

```text id="dj9ad7"
- toda versión tiene tenant_id;
- toda versión pertenece a documentId del mismo tenant;
- versionNumber es incremental;
- no se sobrescribe versión previa;
- una versión activa por documento;
- cambio posterior debe crear nueva versión;
- archivo lógico no elimina files ni access logs.
```

---

### 17.2. Concurrencia

Riesgo:

```text id="zyhvel"
Dos requests simultáneos crean la misma versionNumber.
```

Control:

```text id="qoiosq"
UNIQUE (tenant_id, document_id, version_number)
```

Resultado esperado:

```text id="j4vgvy"
1 request exitoso;
1 request con 409 controlado.
```

---

## 18. Seguridad de archivos físicos

### 18.1. Estados de archivo

```text id="fv1klt"
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

### 18.2. Estados descargables

Descargable solo si:

```text id="sgdsq0"
status = available
AND archivedAt IS NULL
AND document.status = available
AND actor autorizado
```

---

### 18.3. Estados no descargables

```text id="wpda01"
pending
quarantined
rejected
archived
missing
failed
```

---

### 18.4. Reglas

```text id="jpxbnl"
- fileSize > 0;
- fileHash requerido para available;
- hashAlgorithm requerido si fileHash existe;
- safeFileName generado por servidor;
- storageKey generado por servidor;
- storageKey nunca expuesto;
- isPrimary único activo por versión;
- provider validado.
```

---

## 19. Seguridad de upload

### 19.1. Validaciones obligatorias

```text id="cpms40"
- autenticación;
- tenant activo;
- permiso;
- documentId tenant-scoped;
- versionId tenant-scoped si existe;
- sourceResource tenant-scoped;
- owner tenant-scoped;
- archivo presente;
- archivo no vacío;
- fileSize dentro de límite;
- MIME permitido;
- extensión coherente;
- magic bytes si aplica;
- filename sanitizado;
- path traversal bloqueado;
- storageKey ausente;
- fileHash ausente desde cliente;
- provider ausente desde cliente;
- metadata segura.
```

---

### 19.2. MIME types permitidos base

```text id="n29wds"
application/pdf
image/png
image/jpeg
```

---

### 19.3. MIME types bloqueados por defecto

```text id="tw8wu7"
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

### 19.4. Filename hardening

Bloquear:

```text id="xcmjvx"
../
..\
/
\
null bytes
caracteres de control
nombres excesivamente largos
rutas absolutas
rutas relativas
```

---

### 19.5. Tamaños recomendados MVP

```text id="ko9yua"
paymentReceiptMaxFileSizeBytes = 10485760
```

---

## 20. Seguridad de download

### 20.1. Reglas administrativas

Para descarga administrativa se requiere:

```text id="hfkxyr"
Authorization válido
tenant activo
membership activa
permiso documents.download
fileId tenant-scoped
documento disponible
archivo available
policy no bloqueante
storage object existente
access log
audit event
```

---

### 20.2. Reglas `/me`

Para descarga propia se requiere:

```text id="kav5t0"
documents.download.own
tenant activo
actor resuelto
owner válido o audiencia válida
source module policy válida
documento visible para actor
archivo available
documento no archived
archivo no archived
policy no expirada
access log
audit event
```

---

### 20.3. Headers seguros

```text id="c59yem"
Content-Type: <mimeType>
Content-Disposition: attachment; filename="<safeFileName>"
Cache-Control: no-store
X-Request-Id: <request-id>
X-Correlation-Id: <correlation-id>
```

Prohibido en headers:

```text id="n2c63o"
storageKey
bucket
path interno
URL firmada persistente
hash completo si política lo restringe
```

---

### 20.4. Streaming

Regla:

```text id="iombpj"
La descarga debe ser streaming y no debe convertir el archivo completo a base64 ni enviarlo dentro de JSON.
```

---

## 21. Seguridad de storageKey

### 21.1. Naturaleza

`storageKey` es secreto operacional interno.

Prohibido exponerlo en:

```text id="t0i5aq"
DTO response
DTO error
logs
audit metadata
access logs
notification payloads
OpenAPI examples
frontend state
URLs públicas
```

---

### 21.2. Generación

El servidor genera `storageKey`.

Formato sugerido:

```text id="zcywmr"
documents/{tenantId}/{sourceModule}/{documentId}/versions/{versionId}/files/{fileId}/{safeFileName}
```

---

### 21.3. Prohibiciones

```text id="t59rks"
- aceptar storageKey desde body;
- aceptar storageKey desde multipart;
- aceptar path desde cliente;
- usar filename original como path completo;
- exponer storageKey;
- loguear storageKey;
- auditar storageKey;
- enviar storageKey por notificación;
- documentar storageKey en OpenAPI.
```

---

## 22. Seguridad de storage local

### 22.1. Uso permitido

```text id="zgmitx"
desarrollo local
tests automatizados
entornos efímeros no productivos
```

---

### 22.2. Uso prohibido

```text id="o367ra"
producción por defecto
documentos reales sensibles sin controles adicionales
filesystem efímero como almacenamiento definitivo
path fuera de root configurado
root relativo inseguro
```

---

### 22.3. Controles

```text id="s2jubh"
- DOCUMENT_STORAGE_LOCAL_ALLOWED_IN_PROD=false por defecto;
- validar NODE_ENV;
- validar root absoluto seguro;
- bloquear path traversal;
- escribir solo dentro de root;
- permisos mínimos de filesystem;
- no servir archivos estáticos directamente;
- descarga siempre por API autorizada.
```

---

## 23. Seguridad de S3-compatible storage

### 23.1. Reglas

```text id="i6qwha"
- bucket privado;
- objetos privados por defecto;
- no ACL pública;
- no public bucket policy;
- credenciales fuera del repositorio;
- server-side encryption obligatoria fuera de local;
- least privilege para credenciales;
- no listar bucket desde cliente;
- no exponer bucket/path;
- URL temporal con TTL corto solo si se habilita;
- no persistir URL temporal.
```

---

### 23.2. Credenciales

Prohibido:

```text id="tci026"
- hardcodear accessKeyId;
- hardcodear secretAccessKey;
- guardar secretos en DB transaccional;
- devolver secretos por endpoint platform;
- loguear secretos;
- auditar secretos.
```

Permitido:

```text id="d3h43f"
- variables seguras de entorno;
- secret manager;
- inyección segura de configuración;
- flags booleanos tipo credentialsConfigured.
```

---

## 24. Seguridad de URLs temporales

### 24.1. Reglas

Si se habilitan:

```text id="k2mzlo"
- deben generarse después de autorización;
- TTL corto, recomendado 300 segundos o menos;
- no deben persistirse;
- no deben enviarse en notificaciones persistentes;
- no deben registrarse completas en logs;
- no deben registrarse completas en auditoría;
- no reemplazan autorización del backend.
```

---

### 24.2. Feature flag

Por defecto:

```text id="s9d3q9"
documents.temporaryUrls.enabled = false
```

---

## 25. Seguridad de hash

### 25.1. Algoritmo MVP

```text id="axx8ul"
SHA-256
```

---

### 25.2. Reglas

```text id="g8sxih"
- fileHash se calcula en servidor;
- fileHash se calcula sobre bytes reales;
- hashPrefix puede exponerse;
- hash completo no se expone por DTO estándar;
- archivo available requiere hash;
- hashAlgorithm requerido si fileHash existe;
- cambios en archivo deben producir hash distinto.
```

---

### 25.3. Usos permitidos

```text id="xfzo2z"
- integridad técnica;
- verificación interna;
- evidencia de no alteración física;
- preparación para firmas o sellados futuros.
```

---

### 25.4. No debe afirmarse

```text id="f6eifn"
- que SHA-256 equivale a firma electrónica legal;
- que hash equivale a certificación notarial;
- que hash otorga validez legal automática;
- que hash reemplaza proveedor de firma.
```

---

## 26. Seguridad de metadata

### 26.1. Metadata permitida

```text id="uhtx01"
description segura
safe tags
source hints
processing flags
mime validation result
hashPrefix
provider safe name
upload context
generated context
traceId
correlationId
non-sensitive notes
```

---

### 26.2. Metadata prohibida

```text id="oz63lh"
passwords
tokens
api keys
client secrets
cookies
authorization headers
storageKey
bucket
path interno
signedUrl
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

### 26.3. Sanitización

Aplicar sanitización en:

```text id="teovpm"
title
description
metadata
archiveReason
changeReason
originalFileName
safeFileName
access log metadata
audit metadata
log fields
provider errors
```

---

## 27. Seguridad de access logs

### 27.1. Deben registrar

```text id="v46zaq"
tenantId
documentId si disponible
versionId si disponible
fileId si disponible
actorUserId si autenticado
accessType
outcome
sourceModule
sourceResourceType
sourceResourceId
accessedAt
traceId
metadata segura
```

---

### 27.2. Pueden registrar bajo política

```text id="mkfw8f"
ipAddressHash
userAgentHash
```

---

### 27.3. No deben registrar

```text id="s1mlg9"
storageKey
bucket
path interno
URL firmada
contenido binario
base64
contenido del documento
contenido del archivo
tokens
cookies
Authorization header
IP en claro si política de minimización lo impide
user agent completo si se considera excesivo
```

---

## 28. Auditoría

### 28.1. Eventos obligatorios

```text id="x7y2if"
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

### 28.2. Metadata permitida

```text id="fa0k6e"
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

### 28.3. Metadata prohibida

```text id="um0vfh"
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

### 28.4. Auditoría reforzada

Aplicar auditoría reforzada en:

```text id="rmr0ly"
- configuración de storage;
- prueba de conexión de storage;
- cambio de provider;
- descarga administrativa de documento restricted;
- descarga de evidence;
- descarga de certifiedMinutesPdf;
- intento cross-tenant;
- descarga denegada reiterada;
- acceso excepcional PlatformAdmin;
- restauración de documento archivado;
- archivo de documentos altamente sensibles.
```

---

## 29. Logs seguros

### 29.1. Permitido

```text id="gvu6d5"
traceId
requestId
correlationId
action
outcome
status
durationMs
errorCode
sourceModule
category
sensitivity
visibility
mimeGroup
provider
fileSize
```

---

### 29.2. Prohibido

```text id="qk20re"
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
contenido del archivo
emails completos
teléfonos completos
cédulas
datos bancarios completos
hash completo si política lo restringe
SQL raw
stack trace en producción
provider payload completo
tenantId como label de métrica
userId como label de métrica
```

---

### 29.3. Ejemplo de log seguro

```json id="rzbaez"
{
  "action": "document.downloaded",
  "outcome": "allowed",
  "sourceModule": "payments",
  "category": "paymentReceipt",
  "sensitivity": "confidential",
  "mimeGroup": "pdf",
  "provider": "s3Compatible",
  "durationMs": 132,
  "traceId": "req_123456"
}
```

---

## 30. Métricas seguras

### 30.1. Métricas permitidas

```text id="rpvlvo"
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

### 30.2. Labels permitidos

```text id="zr24pt"
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

### 30.3. Labels prohibidos

```text id="pr635c"
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

## 31. Seguridad de configuración platform

### 31.1. Endpoints

```text id="kezwcz"
GET    /api/v1/platform/document-storage/config
PATCH  /api/v1/platform/document-storage/config
POST   /api/v1/platform/document-storage/test-connection
GET    /api/v1/platform/document-storage/providers
```

---

### 31.2. Reglas

```text id="a9lww7"
- requieren permiso platform;
- no exponen secretos;
- no aceptan secretos por endpoint en MVP salvo decisión explícita futura;
- no devuelven access keys;
- no devuelven secret keys;
- no devuelven connection strings;
- no devuelven provider payload completo;
- no permiten local storage en producción por defecto;
- auditan cambios y pruebas de conexión.
```

---

### 31.3. Response segura

Permitido:

```json id="vmli4r"
{
  "provider": "s3Compatible",
  "endpointConfigured": true,
  "regionConfigured": true,
  "bucketConfigured": true,
  "credentialsConfigured": true,
  "serverSideEncryptionEnabled": true
}
```

Prohibido:

```json id="j3kqsl"
{
  "accessKeyId": "AKIA...",
  "secretAccessKey": "...",
  "bucket": "resident-prod-sensitive-bucket",
  "connectionString": "...",
  "token": "..."
}
```

---

## 32. Seguridad de endpoints `/me`

### 32.1. Principio

Los endpoints `/me` deben exponer únicamente documentos que el actor autenticado puede consultar por:

```text id="vxrcov"
owner lógico
relación persona/unidad
audiencia
policy del documento
delegación al módulo origen
```

---

### 32.2. Reglas

```text id="m8qezy"
- no mostrar documentos administrativos internos;
- no mostrar documentos archivados por defecto;
- no mostrar archivos quarantined;
- no mostrar archivos rejected;
- no mostrar archivos missing;
- no mostrar policies internas completas;
- no mostrar access logs;
- no mostrar storageKey;
- no mostrar URL firmada;
- no mostrar binarios;
- no ampliar acceso por filtros.
```

---

### 32.3. Upload propio

MVP recomendado:

```text id="a22131"
documents.upload.own solo para paymentReceipt y categorías explícitamente permitidas.
```

Prohibido:

```text id="ieumzw"
- crear administrativeDocument desde /me;
- elegir sensitivity arbitraria;
- elegir visibility administrativa;
- crear documento para owner ajeno;
- subir archivo a sourceResource ajeno;
- enviar storageKey;
- enviar fileHash manual.
```

---

## 33. Seguridad de endpoints públicos

### 33.1. No deben existir

```text id="wod9b8"
GET /api/v1/public/documents/{documentId}
GET /api/v1/public/document-files/{fileId}/download
GET /api/v1/public/tenants/{slug}/documents
GET /api/v1/public/tenants/{slug}/documents/{documentId}
GET /api/v1/public/tenants/{slug}/document-files/{fileId}/download
POST /api/v1/public/documents
POST /api/v1/public/document-files/{fileId}/download
```

---

### 33.2. Resultado esperado

```text id="r6d0t9"
404 route not found
```

Sin revelar:

```text id="r667ws"
si el tenant existe
si el documento existe
si el archivo existe
si el usuario tendría acceso
```

---

## 34. Seguridad de OpenAPI

OpenAPI debe documentar:

```text id="g7ltxz"
x-tenant-scope: true
x-auth-required: true
x-required-permission
x-own-resource en /me
x-secure-download en descargas
x-binary-response en descargas
x-file-upload en uploads
x-multipart en uploads
x-storage-backed: true
x-storage-key-exposed: false
x-public-exposure: false
x-platform-scope en endpoints platform
x-secrets-exposed: false
x-audit-event
```

OpenAPI no debe documentar:

```text id="pxxxad"
GET /api/v1/public/documents/{documentId}
GET /api/v1/public/document-files/{fileId}/download
GET /api/v1/public/tenants/{slug}/documents
GET /api/v1/public/tenants/{slug}/documents/{documentId}
GET /api/v1/public/tenants/{slug}/document-files/{fileId}/download
```

---

## 35. Seguridad de base de datos

### 35.1. Constraints críticos

```text id="anhyi4"
tenant_id NOT NULL en todas las tablas;
file_size > 0;
version_number > 0;
available/stored requiere file_hash y hash_algorithm;
storage_key no vacío;
UNIQUE tenant_id + document_id + version_number;
índice parcial una versión activa por documento;
índice parcial un archivo primario activo por versión;
índice parcial storageKey único por provider;
índice parcial link source activo único.
```

---

### 35.2. Soft archive

No eliminar físicamente en operación ordinaria:

```text id="qcmux1"
secure_documents
secure_document_versions
secure_document_files
secure_document_links
secure_document_policies
secure_document_access_logs
```

Usar:

```text id="tjz1um"
archived_at
status = archived cuando aplique
```

---

### 35.3. Operaciones transaccionales

Deben ejecutarse en transacción:

```text id="q5ke3n"
crear documento + versión inicial si aplica;
upload + file record + activeFileId + document status;
crear nueva versión + supersede anterior;
archivar documento + actualizar estado;
restaurar documento + validar file;
descarga + access log + audit cuando aplique;
config change + audit.
```

---

## 36. Seguridad de concurrencia

### 36.1. Versión duplicada

Riesgo:

```text id="awj61n"
Dos requests crean la misma versión para el mismo documento.
```

Control:

```text id="khfgzz"
UNIQUE tenant_id + document_id + version_number
```

---

### 36.2. Archivo primario duplicado

Riesgo:

```text id="ijj8fc"
Dos requests crean dos archivos primarios activos para la misma versión.
```

Control:

```text id="xffqp8"
índice parcial para un primary activo por versión
```

---

### 36.3. Download/archive simultáneo

Riesgo:

```text id="acgttt"
Un archivo se archiva mientras otro request lo descarga.
```

Control:

```text id="rg65vp"
validar estado antes de obtener stream;
manejar resultado consistente;
auditar outcome real;
mapear error a 409/404 controlado.
```

---

## 37. Rate limiting y abuso

Aplicar rate limiting a:

```text id="vwn8jc"
POST /api/v1/tenant/documents/{documentId}/files
POST /api/v1/me/documents/{documentId}/files
GET /api/v1/tenant/document-files/{fileId}/download
GET /api/v1/me/document-files/{fileId}/download
POST /api/v1/platform/document-storage/test-connection
```

Estrategia:

```text id="klxxvt"
- límites por usuario;
- límites por tenant;
- límites por endpoint;
- límites por tamaño;
- alertas por descargas denegadas repetidas;
- alertas por uploads fallidos repetidos;
- cuotas futuras por tenant.
```

---

## 38. CORS y cache

### 38.1. Cache

Todos los endpoints privados:

```text id="h8awga"
Cache-Control: no-store
```

---

### 38.2. CORS

Reglas:

```text id="g2nly3"
- no wildcard para credenciales;
- permitir solo orígenes configurados;
- WordPress no accede a documentos privados por endpoints públicos;
- descargas privadas requieren token.
```

---

## 39. IA y procesamiento externo

### 39.1. Prohibición MVP

No enviar documentos reales a servicios externos de IA.

Prohibido:

```text id="fm8xdh"
comprobantes reales
actas reales
evidencias reales
documentos de residentes
documentos de unidades
PDFs oficiales
adjuntos reales
datos financieros
datos sancionatorios
datos personales
firmas
cédulas
tokens
secretos
```

---

### 39.2. Permitido

```text id="oy5yv0"
datos ficticios
fixtures sintéticos
documentación técnica
código sin secretos
tests sin datos reales
plantillas genéricas
```

---

### 39.3. Futuro

Cualquier uso de IA con documentos reales requiere:

```text id="s5hz53"
spec futura;
data governance;
anonimización;
consentimiento o base legal;
proveedor aprobado;
política de retención;
registro de auditoría;
evaluación de riesgo.
```

---

## 40. Retención y eliminación

### 40.1. MVP

El MVP no elimina físicamente documentos en operación ordinaria.

Motivo:

```text id="lxlpfx"
Los documentos pueden servir como evidencia financiera, administrativa, sancionatoria o documental interna.
```

---

### 40.2. Archivo lógico

```text id="sklrqy"
archivedAt != null
status = archived
```

---

### 40.3. Eliminación física futura

Diferida a:

```text id="gas09u"
00X-document-retention-policy
```

Debe cubrir:

```text id="aw50ju"
retención por categoría;
retención por tenant;
legal hold;
purga controlada;
anonimización;
exportación previa;
trazabilidad;
cumplimiento normativo.
```

---

## 41. Backup y recuperación

Riesgos:

```text id="wi8bzj"
- DB apunta a storage object inexistente;
- storage contiene objeto sin DB record;
- pérdida de bucket;
- restore parcial;
- hash no coincide;
- archivo físico corrupto.
```

Controles:

```text id="r27nij"
- backup PostgreSQL;
- backup storage;
- versionado de objetos si provider lo permite;
- verificación periódica de objectExists;
- hash verification;
- restore tests;
- estados missing/failed;
- reconciliación DB-storage futura;
- no usar filesystem efímero en producción.
```

---

## 42. Configuración segura

Variables sensibles:

```text id="p6yyao"
DOCUMENT_STORAGE_S3_ENDPOINT
DOCUMENT_STORAGE_S3_REGION
DOCUMENT_STORAGE_S3_BUCKET
DOCUMENT_STORAGE_S3_ACCESS_KEY_ID
DOCUMENT_STORAGE_S3_SECRET_ACCESS_KEY
DOCUMENT_STORAGE_S3_FORCE_PATH_STYLE
DOCUMENT_STORAGE_S3_SERVER_SIDE_ENCRYPTION
```

Reglas:

```text id="k9ebsq"
- no secretos en repositorio;
- no secretos en logs;
- no secretos en auditoría;
- no secretos en OpenAPI examples;
- no secretos por endpoint platform;
- usar secret manager o variables seguras;
- rotación de credenciales;
- mínimo privilegio;
- separar ambientes;
- bloquear local storage en producción por defecto.
```

---

## 43. Casos de abuso prioritarios

| Caso                                             | Riesgo  | Control                               |
| ------------------------------------------------ | ------- | ------------------------------------- |
| Tenant A descarga archivo de Tenant B            | Crítico | tenant_id + repository policy + tests |
| Cliente envía `storageKey`                       | Crítico | DTO reject                            |
| Cliente envía `tenantId`                         | Alto    | DTO reject                            |
| Cliente usa `sourceResourceId` de otro tenant    | Crítico | source validator                      |
| Cliente usa `ownerPropertyUnitId` de otro tenant | Crítico | owner validator                       |
| Usuario `/me` descarga documento ajeno           | Crítico | own-resource policy                   |
| Archivo `quarantined` descargable                | Alto    | state policy                          |
| Archivo `rejected` descargable                   | Alto    | state policy                          |
| Path traversal en filename                       | Alto    | filename sanitizer                    |
| MIME spoofing                                    | Alto    | MIME + magic bytes                    |
| Binario en JSON                                  | Alto    | upload multipart / download stream    |
| `storageKey` en logs                             | Crítico | log sanitizer                         |
| `storageKey` en auditoría                        | Crítico | audit sanitizer                       |
| Config platform expone secretos                  | Crítico | safe config DTO                       |
| Storage local en producción                      | Alto    | config gate                           |
| Endpoint público accidental                      | Crítico | route negative tests + OpenAPI gate   |
| PlatformAdmin descarga sin control               | Alto    | explicit permission + audit           |

---

## 44. Pruebas de seguridad obligatorias

### 44.1. Multitenancy

```text id="pacr26"
tenant A no ve secureDocument tenant B
tenant A no ve secureDocumentVersion tenant B
tenant A no ve secureDocumentFile tenant B
tenant A no ve secureDocumentLink tenant B
tenant A no ve SecureDocumentPolicy tenant B
tenant A no ve SecureDocumentAccessLog tenant B
tenant A no descarga file tenant B
tenant A no usa sourceResourceId tenant B
tenant A no usa ownerId tenant B
tenant A no usa audienceRules tenant B
```

---

### 44.2. Storage key protection

```text id="ug4vz7"
storageKey no aceptado desde body
storageKey no aceptado desde multipart
storageKey no aparece en responses
storageKey no aparece en errors
storageKey no aparece en logs
storageKey no aparece en audit
storageKey no aparece en access logs
storageKey no aparece en OpenAPI examples
```

---

### 44.3. File validation

```text id="ji1czx"
MIME permitido aceptado
MIME bloqueado rechazado
fileSize 0 rechazado
fileSize excesivo rechazado
filename path traversal rechazado
MIME mismatch rechazado cuando sea detectable
hash calculado
available requiere hash
```

---

### 44.4. Secure download

```text id="k8va8r"
download sin permiso denegado
download own ajeno denegado
download cross-tenant denegado
download quarantined denegado
download rejected denegado
download archived denegado
download missing denegado
download successful crea access log
download successful audita
```

---

### 44.5. Logs y auditoría

```text id="q458vk"
no binarios en logs
no base64 en logs
no storageKey en logs
no URL firmada en logs
no binarios en audit
no base64 en audit
no storageKey en audit
no URL firmada en audit
```

---

### 44.6. OpenAPI y rutas públicas

```text id="gxfj6w"
rutas públicas prohibidas devuelven 404
OpenAPI no documenta rutas públicas
OpenAPI marca x-public-exposure false
OpenAPI marca x-storage-key-exposed false
OpenAPI marca x-secrets-exposed false en platform
```

---

## 45. CI/CD security gates

El pipeline debe fallar si:

```text id="heszap"
- falla lint;
- falla typecheck;
- fallan unit tests;
- fallan domain tests;
- fallan DTO tests;
- fallan repository tests;
- fallan API tests;
- fallan authorization tests;
- fallan own-resource tests;
- fallan source-resource tests;
- fallan multitenancy tests;
- fallan storage tests;
- fallan hash tests;
- fallan file validation tests;
- fallan audit tests;
- fallan access-log tests;
- fallan observability tests;
- fallan security tests;
- falla OpenAPI validation;
- OpenAPI documenta endpoints públicos prohibidos;
- response snapshots contienen storageKey;
- errores contienen storageKey;
- logs contienen storageKey;
- audit contiene storageKey;
- JSON contiene binarios/base64;
- local storage queda habilitado por defecto en producción;
- Platform config expone secretos;
- build falla.
```

---

## 46. Checklist de seguridad para PR

Cada PR debe responder:

```text id="rdz4dc"
[ ] ¿Toda consulta filtra por tenant_id?
[ ] ¿Se evita findUnique por id simple?
[ ] ¿El body rechaza tenantId?
[ ] ¿El body rechaza storageKey?
[ ] ¿sourceResourceId se valida contra tenant?
[ ] ¿ownerUserId se valida contra tenant?
[ ] ¿ownerPersonId se valida contra tenant?
[ ] ¿ownerPropertyUnitId se valida contra tenant?
[ ] ¿audienceRules se validan contra tenant?
[ ] ¿storageKey se genera server-side?
[ ] ¿storageKey queda fuera de DTOs?
[ ] ¿storageKey queda fuera de errores?
[ ] ¿storageKey queda fuera de logs?
[ ] ¿storageKey queda fuera de auditoría?
[ ] ¿bucket/path interno no se expone?
[ ] ¿URL firmada no se persiste?
[ ] ¿MIME type se valida?
[ ] ¿fileSize se valida?
[ ] ¿filename se sanitiza?
[ ] ¿path traversal está bloqueado?
[ ] ¿hash SHA-256 se calcula?
[ ] ¿archivo available requiere hash?
[ ] ¿download requiere autorización?
[ ] ¿download crea access log?
[ ] ¿download audita?
[ ] ¿quarantined/rejected/archived/missing no descargan?
[ ] ¿/me no expone documentos ajenos?
[ ] ¿PlatformAdmin no accede automáticamente a contenido tenant?
[ ] ¿config platform no expone secretos?
[ ] ¿local storage está bloqueado en producción por defecto?
[ ] ¿no existen endpoints públicos?
[ ] ¿OpenAPI no documenta endpoints públicos?
[ ] ¿no se envían documentos reales a IA externa?
```

---

## 47. Definition of Done de seguridad

El módulo cumple seguridad cuando:

```text id="h7cyhs"
- todas las entidades tienen tenant_id;
- todas las consultas filtran por tenant_id;
- ningún endpoint acepta tenantId desde body;
- ningún endpoint acepta storageKey desde cliente;
- sourceResourceId se valida contra tenant;
- ownerId se valida contra tenant;
- audienceRules se validan contra tenant;
- storageKey se genera en servidor;
- storageKey nunca se expone;
- bucket/path interno no se expone;
- URL firmada persistente no se expone;
- archivos se validan por MIME;
- archivos se validan por tamaño;
- filename se sanitiza;
- path traversal se bloquea;
- hash SHA-256 se calcula;
- archivo available tiene hash;
- descarga requiere autorización;
- descarga crea access log;
- descarga genera auditoría;
- quarantined/rejected/archived/missing/failed no descargan;
- documentos archived no aparecen por defecto;
- /me solo muestra documentos autorizados;
- logs no contienen binarios;
- auditoría no contiene binarios;
- access logs no contienen binarios;
- config platform no expone secretos;
- local storage no queda habilitado por defecto en producción;
- no existen endpoints públicos;
- OpenAPI no documenta endpoints públicos;
- CI pasa.
```

---

## 48. No aceptación

La implementación no debe aceptarse si:

```text id="y1wof7"
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
- acepta fileHash arbitrario desde cliente;
- expone storageKey;
- expone bucket;
- expone path interno;
- expone URL firmada persistente;
- descarga sin autorización;
- descarga archivo quarantined;
- descarga archivo rejected;
- descarga archivo archived;
- descarga archivo missing;
- descarga archivo failed;
- muestra documentos archived por defecto;
- omite hash de archivo available;
- no valida MIME type;
- no valida extensión;
- no valida fileSize;
- permite path traversal;
- permite MIME spoofing evidente;
- registra binarios en JSON;
- registra base64 en JSON;
- registra binarios en logs;
- registra binarios en auditoría;
- registra storageKey en access logs;
- crea endpoints públicos;
- documenta endpoints públicos en OpenAPI;
- permite acceso PlatformAdmin automático al contenido de tenants;
- expone secretos en config platform;
- usa storage local como configuración productiva por defecto;
- omite access logs de descargas;
- omite auditoría de operaciones críticas;
- envía documentos reales a IA externa.
```

---

## 49. Resultado esperado

Al aplicar estas notas, `016-secure-document-storage` quedará protegido como infraestructura documental transversal crítica para RESIDENT Core.

El módulo deberá garantizar:

```text id="roz68m"
tenant isolation
source resource validation
owner validation
audience validation
permissioned access
own-resource authorization
source-module delegation
storage key protection
secure metadata
secure upload
secure download
binary streaming
MIME allowlist
file size limits
filename sanitization
path traversal protection
SHA-256 file hash
hashPrefix safe exposure
storage provider abstraction
local storage dev only
S3-compatible readiness
private buckets
temporary URL safety
access logs
audit trail
safe logs
safe metrics
safe platform config
no public endpoints
OpenAPI security consistency
CI gates
```

El módulo queda listo para integrarse de forma progresiva con:

```text id="pat84v"
005-payments
011-fines-sanctions
012-communications-notifications
015-certified-minutes
008-basic-reports
futuros módulos documentales
```

Y queda preparado, sin implementarlos todavía, para:

```text id="impzdi"
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
