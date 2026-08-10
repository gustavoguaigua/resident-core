# Functional Specification — Spec 016 Secure Document Storage

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                                              |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                                                      |
| Spec ID         | 016                                                                                                                                                                                                |
| Módulo          | Secure Document Storage                                                                                                                                                                            |
| Documento       | Functional Specification                                                                                                                                                                           |
| Ruta            | `docs/specs/016-secure-document-storage/spec.md`                                                                                                                                                   |
| Versión         | 0.1                                                                                                                                                                                                |
| Estado          | needs-review                                                                                                                                                                                       |
| Fecha           | 2026-07-21                                                                                                                                                                                         |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `005-payments`, `007-audit`, `011-fines-sanctions`, `012-communications-notifications`, `015-certified-minutes`                      |
| Relacionado con | comprobantes de pago, evidencias de multas, adjuntos de comunicaciones, PDFs de actas, reportes exportados, documentos administrativos, almacenamiento S3-compatible, auditoría, descargas seguras |
| API Style       | REST                                                                                                                                                                                               |
| Naturaleza      | Tenant-scoped / Storage-backed / Access-controlled / Metadata-driven / Hash-aware / Audit-heavy / Non-public by default                                                                            |

---

## 2. Propósito

El módulo `016-secure-document-storage` define la base común para almacenar, registrar, consultar, descargar, archivar y auditar documentos y archivos del sistema RESIDENT Core.

Su objetivo no es reemplazar la lógica documental específica de cada módulo, sino proveer una capa transversal segura para:

* comprobantes de pago;
* evidencias de multas;
* adjuntos de comunicaciones;
* PDFs de actas certificadas;
* adjuntos de actas;
* documentos administrativos internos;
* reportes exportados;
* imágenes controladas;
* archivos generados por el sistema;
* archivos subidos por administradores o usuarios autorizados.

Regla central:

```text id="kh2y3a"
Todo documento almacenado en RESIDENT Core debe pertenecer a un tenant, tener metadata mínima, clasificación de seguridad, propietario lógico, hash de integridad, referencia de storage interna, control de acceso, trazabilidad de descargas y auditoría completa.
```

---

## 3. Contexto dentro de RESIDENT Core

Hasta la spec 015, varios módulos requieren almacenamiento de archivos:

```text id="a1cgkh"
RESIDENT Core
├── Payments
│   └── Payment Receipts
├── Fines and Sanctions
│   └── Fine Evidence
├── Communications and Notifications
│   └── Communication Attachments / Images
├── Certified Minutes
│   ├── PDFs
│   ├── Attachments
│   └── Hash Manifests
├── Basic Reports
│   └── Exported Reports
└── Future Modules
    ├── Contracts
    ├── Regulations
    ├── Maintenance Evidence
    ├── Legal Documents
    └── AI-generated drafts under governance
```

Sin una base común, cada módulo podría implementar storage de forma distinta, generando riesgos:

* exposición accidental de `storageKey`;
* URLs firmadas persistentes;
* duplicación de lógica;
* auditoría inconsistente;
* permisos inconsistentes;
* falta de hash;
* falta de retención;
* falta de clasificación;
* dificultad para migrar de storage local a S3;
* falta de trazabilidad de descargas;
* errores cross-tenant.

Este módulo establece una capa estándar.

---

## 4. Objetivo funcional

El sistema debe permitir:

```text id="l3d0yb"
- registrar documentos tenant-scoped;
- subir archivos mediante endpoints controlados;
- generar documentos desde otros módulos;
- clasificar documentos por tipo, origen, sensibilidad y visibilidad;
- almacenar archivos mediante provider seguro;
- conservar storageKey solo como dato interno;
- calcular hash de archivo;
- registrar tamaño, MIME type, extensión y metadata segura;
- consultar documentos bajo permisos;
- descargar documentos bajo autorización;
- generar URLs temporales solo si la política lo permite;
- registrar accesos y descargas;
- archivar documentos lógicamente;
- soportar cuarentena futura;
- soportar antivirus futuro;
- soportar migración futura entre providers;
- auditar operaciones críticas;
- impedir exposición pública por defecto.
```

---

## 5. Alcance incluido en MVP

El MVP de `Secure Document Storage` incluye:

```text id="i3d9mf"
1. Registro centralizado de documentos.
2. Registro centralizado de versiones de documento.
3. Registro centralizado de archivos físicos.
4. Metadata de documento.
5. Clasificación de documento.
6. Clasificación de sensibilidad.
7. Asociación con tenant.
8. Asociación con módulo origen.
9. Asociación con recurso origen.
10. Asociación opcional con usuario/persona/unidad.
11. Upload seguro.
12. Download seguro.
13. Hash SHA-256 del archivo.
14. MIME type validation.
15. File size validation.
16. Safe filename.
17. Storage key interno.
18. Abstracción de storage provider.
19. Soporte local en desarrollo.
20. Preparación para S3-compatible storage.
21. Access logs.
22. Audit logs.
23. Soft archive.
24. DTOs sin `storageKey`.
25. Control de acceso por permiso.
26. Control de acceso por ownership lógico.
27. Control de acceso por source module.
28. Control de acceso por audience si aplica.
29. Rate limiting de upload/download.
30. OpenAPI sin rutas públicas por defecto.
```

---

## 6. Fuera de alcance del MVP

No implementar dentro de esta spec:

```text id="f6qova"
- firma electrónica legal;
- firma electrónica avanzada;
- sellado de tiempo externo;
- certificación notarial;
- blockchain;
- verificación pública con QR;
- gestor documental completo tipo DMS;
- edición colaborativa de documentos;
- OCR;
- clasificación automática por IA;
- antivirus real obligatorio;
- DLP avanzado;
- retención legal avanzada;
- legal hold;
- eliminación física automática;
- versionado binario complejo;
- previsualización avanzada;
- conversión universal de formatos;
- integración con Google Drive, OneDrive o Dropbox;
- publicación pública directa;
- CDN público;
- búsqueda full-text del contenido de archivos;
- indexación semántica con IA;
- almacenamiento de datos de salud, biométricos o categorías sensibles no justificadas.
```

Estos elementos quedan diferidos para futuras specs.

---

## 7. Principios de diseño

### 7.1. Tenant isolation primero

Todo documento debe pertenecer a un tenant.

```text id="a4hmks"
document.tenantId = currentTenant.id
```

Nunca se debe consultar un documento únicamente por `documentId`.

---

### 7.2. Storage key nunca expuesto

`storageKey` es interno.

Prohibido en respuestas API:

```text id="cys0ss"
storageKey
bucket
path físico
provider internal key
URL permanente
credenciales
signed URL persistente
```

---

### 7.3. Metadata no reemplaza autorización

La metadata describe el documento, pero no decide por sí sola si un usuario puede acceder.

La autorización debe evaluar:

```text id="sdk9ls"
tenant
usuario
membership
permisos
sourceModule
sourceResource
documentOwner
documentVisibility
documentSensitivity
audienceRules
estado del documento
estado del archivo
```

---

### 7.4. Hash obligatorio

Todo archivo almacenado debe tener hash cuando el archivo físico esté disponible.

MVP:

```text id="q7b53m"
SHA-256
```

---

### 7.5. No eliminar físicamente por defecto

La eliminación operativa debe ser archivo lógico.

```text id="h7n9jz"
archivedAt != null
status = archived
```

La eliminación física requiere política futura de retención.

---

### 7.6. Auditoría obligatoria

Toda operación crítica debe generar evento de auditoría.

Eventos mínimos:

```text id="xoxodt"
document.created
document.uploaded
document.versionCreated
document.downloaded
document.accessDenied
document.archived
document.restored
document.metadataUpdated
document.quarantined
document.rejected
```

---

### 7.7. Capa transversal, no lógica de negocio

Este módulo no decide si un pago es válido, si una multa procede o si un acta está aprobada.

Solo administra almacenamiento documental seguro.

---

## 8. Actores

### 8.1. PlatformAdmin

Puede administrar configuración global de storage, bajo permisos estrictos.

No debe acceder automáticamente al contenido documental de tenants.

---

### 8.2. TenantAdmin

Puede gestionar documentos administrativos del tenant según permisos.

---

### 8.3. FinancialManager

Puede acceder a comprobantes y documentos financieros permitidos.

---

### 8.4. BoardMember

Puede acceder a documentos administrativos, actas y evidencias según audiencia y permisos.

---

### 8.5. MeetingManager

Puede gestionar documentos asociados a reuniones y actas según permisos.

---

### 8.6. FineManager

Puede gestionar evidencias de multas y sanciones según permisos.

---

### 8.7. CommunicationManager

Puede gestionar adjuntos o imágenes de comunicaciones según permisos.

---

### 8.8. PropertyOwner

Puede consultar y descargar documentos propios o publicados para propietarios.

---

### 8.9. Resident

Puede consultar y descargar documentos propios o publicados para residentes.

---

### 8.10. System

Puede generar documentos internos, PDFs, reportes o artefactos derivados de otros módulos.

---

### 8.11. Public

No tiene acceso al módulo en MVP.

---

## 9. Entidades conceptuales

### 9.1. SecureDocument

Representa el documento lógico.

Ejemplos:

```text id="y0og5y"
comprobante de pago
evidencia de multa
PDF de acta certificada
adjunto de comunicación
reporte exportado
documento administrativo
imagen de soporte
```

---

### 9.2. SecureDocumentVersion

Representa una versión lógica del documento.

Uso:

* reemplazo controlado;
* nuevas versiones de archivos;
* correcciones;
* regeneraciones;
* auditoría histórica.

---

### 9.3. SecureDocumentFile

Representa el archivo físico almacenado.

Contiene:

* `storageKey`;
* provider;
* MIME type;
* tamaño;
* hash;
* estado;
* metadata técnica.

---

### 9.4. SecureDocumentAccessLog

Registra accesos y descargas.

---

### 9.5. SecureDocumentPolicy

Representa reglas de acceso o política documental asociada.

Puede ser simple en MVP y evolucionar.

---

### 9.6. SecureDocumentLink

Representa relación entre el documento y un recurso de dominio.

Ejemplos:

```text id="d6i2sy"
paymentId
paymentReceiptId
fineId
fineEvidenceId
communicationId
certifiedMinutesId
certifiedMinutesArtifactId
reportExportId
propertyUnitId
personId
```

---

## 10. Modelo conceptual

```text id="yf3oey"
Tenant
  └── SecureDocument
        ├── SecureDocumentVersion
        │     └── SecureDocumentFile
        ├── SecureDocumentLink
        ├── SecureDocumentPolicy
        └── SecureDocumentAccessLog
```

---

## 11. Enums iniciales

### 11.1. DocumentStatus

```text id="l4z6j2"
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

### 11.2. DocumentVisibility

```text id="ztpeby"
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

```text id="ta0pn3"
publicEligible no significa público. Solo indica que el documento podría ser publicado en una spec futura si se cumplen políticas explícitas.
```

---

### 11.3. DocumentSensitivity

```text id="oypr0s"
low
internal
confidential
restricted
highlyRestricted
```

---

### 11.4. DocumentCategory

```text id="ctvfwh"
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

### 11.5. SourceModule

```text id="mhxr2z"
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

### 11.6. StorageProvider

```text id="ru0yie"
local
s3
s3Compatible
minio
other
```

---

### 11.7. FileScanStatus

```text id="jo7fxq"
notRequired
pending
clean
suspicious
infected
failed
```

---

### 11.8. AccessType

```text id="i26k7p"
viewMetadata
download
preview
export
archive
restore
```

---

### 11.9. AccessOutcome

```text id="r8qibo"
allowed
denied
notFound
expired
revoked
quarantined
rejected
error
```

---

### 11.10. HashAlgorithm

```text id="x0g83v"
SHA-256
```

Diferidos:

```text id="fybh6t"
SHA-512
BLAKE3
externalSignatureDigest
```

---

## 12. Reglas de negocio

### BR-001 — Tenant obligatorio

Todo documento debe tener `tenantId`.

---

### BR-002 — No `tenantId` desde body

El cliente nunca puede enviar `tenantId` para crear o modificar documentos.

---

### BR-003 — Recurso origen tenant-scoped

Si el documento se asocia a un recurso origen, ese recurso debe pertenecer al mismo tenant.

Ejemplos:

```text id="d25it7"
payment.tenantId == currentTenant.id
fine.tenantId == currentTenant.id
certifiedMinutes.tenantId == currentTenant.id
communication.tenantId == currentTenant.id
```

---

### BR-004 — Source module obligatorio

Todo documento debe indicar su módulo origen.

---

### BR-005 — Source resource recomendado

Todo documento debe asociarse a un recurso origen cuando exista.

Ejemplo:

```text id="kaohca"
sourceModule = payments
sourceResourceType = payment
sourceResourceId = payment_uuid
```

---

### BR-006 — Storage key interno

`storageKey` solo puede ser generado por el servidor.

---

### BR-007 — No exposición de storage key

Ningún endpoint externo debe devolver `storageKey`.

---

### BR-008 — Hash obligatorio

Todo archivo `available` debe tener hash.

---

### BR-009 — MIME type permitido

Solo se aceptan MIME types permitidos por configuración y categoría.

---

### BR-010 — Tamaño máximo

Todo archivo debe cumplir límite de tamaño global, por tenant, por categoría o por endpoint.

---

### BR-011 — Filename seguro

Todo `fileName` debe ser sanitizado.

---

### BR-012 — No path traversal

No se permite `../`, `..\`, null bytes ni rutas enviadas por cliente.

---

### BR-013 — Archivo vacío rechazado

`fileSize` debe ser mayor que cero.

---

### BR-014 — Descarga autorizada

Toda descarga requiere autenticación, tenant activo, permiso o audiencia válida.

---

### BR-015 — Descarga auditada

Toda descarga permitida o denegada debe registrarse según política.

---

### BR-016 — Documento en cuarentena no descargable

Un documento `quarantined` no debe descargarse por usuarios finales.

---

### BR-017 — Documento rechazado no descargable

Un documento `rejected` no debe descargarse por usuarios finales.

---

### BR-018 — Documento archivado no visible por defecto

Un documento `archived` solo se consulta con filtros administrativos explícitos.

---

### BR-019 — No eliminación física ordinaria

La eliminación física no forma parte del flujo estándar MVP.

---

### BR-020 — Audiencia no reemplaza permisos administrativos

Un usuario administrativo requiere permiso aunque pertenezca a audiencia amplia.

---

### BR-021 — Own-resource requiere vínculo real

Un usuario final solo puede acceder a documentos propios si existe vínculo real con persona, unidad, pago, multa, acta o publicación.

---

### BR-022 — No documento público por defecto

Ningún documento se expone en `/api/v1/public` en MVP.

---

### BR-023 — Publicación futura requiere spec propia

La publicación pública de documentos debe implementarse en una spec futura.

---

### BR-024 — No logs con contenido binario

Nunca registrar archivo completo en logs.

---

### BR-025 — No auditoría con contenido binario

Nunca registrar archivo completo en auditoría.

---

### BR-026 — No signed URL persistente

Si se usan URLs temporales, deben tener TTL corto y no persistirse.

---

### BR-027 — Access logs minimizados

Los access logs no deben incluir contenido, storage key ni URLs firmadas.

---

### BR-028 — Storage provider intercambiable

El dominio no debe depender directamente de S3, MinIO o filesystem local.

---

### BR-029 — Clasificación obligatoria

Todo documento debe tener categoría y sensibilidad.

---

### BR-030 — Retención futura

El MVP debe preparar campos para retención, pero no purgar automáticamente documentos.

---

## 13. Casos de uso funcionales

### UC-001 — Registrar documento lógico

Como sistema o usuario autorizado, quiero registrar un documento lógico asociado a un módulo y recurso origen.

Criterios:

```text id="cm0b9w"
- requiere tenant activo;
- requiere sourceModule;
- requiere documentCategory;
- requiere sensitivity;
- no acepta tenantId desde body;
- valida sourceResource si existe;
- estado inicial draft o uploaded según flujo;
- audita document.created.
```

---

### UC-002 — Subir archivo

Como usuario autorizado, quiero subir un archivo y asociarlo a un documento.

Criterios:

```text id="dpki9s"
- valida permisos;
- valida tenant;
- valida MIME type;
- valida tamaño;
- sanitiza filename;
- calcula hash;
- genera storageKey;
- guarda archivo mediante storage port;
- registra SecureDocumentFile;
- actualiza estado a available o quarantined;
- no expone storageKey;
- audita document.uploaded.
```

---

### UC-003 — Registrar archivo generado por sistema

Como sistema, quiero registrar un PDF, reporte o artefacto generado.

Criterios:

```text id="pakujl"
- sourceModule obligatorio;
- sourceResourceId obligatorio cuando exista;
- generatedBy puede ser system;
- calcula hash;
- guarda archivo;
- registra metadata segura;
- no expone storageKey;
- audita document.generated.
```

---

### UC-004 — Consultar documentos administrativos

Como administrador con permiso, quiero listar documentos del tenant.

Criterios:

```text id="suyxh4"
- filtra por tenant;
- soporta paginación;
- soporta filtros por categoría, estado, sensibilidad, módulo origen y recurso origen;
- no devuelve storageKey;
- no devuelve URL firmada;
- no devuelve contenido binario;
- no devuelve documentos de otro tenant.
```

---

### UC-005 — Consultar documento propio

Como propietario o residente, quiero ver documentos que me corresponden.

Criterios:

```text id="vcsi3m"
- requiere membership activa;
- requiere vínculo own-resource;
- respeta visibility;
- respeta sensitivity;
- respeta source module;
- no muestra documentos administrativos internos;
- no muestra documentos archivados por defecto;
- no expone storageKey.
```

---

### UC-006 — Descargar documento

Como usuario autorizado, quiero descargar un documento.

Criterios:

```text id="a84l15"
- valida autenticación;
- valida tenant;
- valida permiso o audiencia;
- valida estado available;
- valida que no esté archived;
- genera stream o URL temporal corta;
- no expone storageKey;
- registra access log;
- audita descarga.
```

---

### UC-007 — Archivar documento

Como administrador autorizado, quiero archivar un documento.

Criterios:

```text id="th16ss"
- requiere permiso;
- no elimina físico;
- status = archived;
- archivedAt y archivedBy;
- reason recomendado;
- no visible en consultas normales;
- audita document.archived.
```

---

### UC-008 — Restaurar documento archivado

Como administrador autorizado, quiero restaurar un documento archivado.

Criterios:

```text id="h10qzc"
- requiere permiso;
- valida tenant;
- cambia status a available si archivo físico existe y es válido;
- audita document.restored.
```

---

### UC-009 — Registrar acceso denegado

Como sistema, quiero registrar intentos de acceso denegados relevantes.

Criterios:

```text id="v9pkrs"
- registra tenant si se pudo resolver;
- registra documentId si corresponde;
- registra actor si existe;
- registra outcome denied/notFound/quarantined/rejected;
- metadata sanitizada;
- no registra storageKey;
- no registra contenido.
```

---

### UC-010 — Actualizar metadata segura

Como administrador autorizado, quiero actualizar metadata no sensible del documento.

Criterios:

```text id="gl92dv"
- requiere permiso;
- valida estado editable;
- no permite cambiar tenantId;
- no permite cambiar storageKey;
- no permite cambiar hash manualmente;
- sanitiza metadata;
- audita document.metadataUpdated.
```

---

## 14. Requisitos funcionales

### FR-001 — Crear documento

El sistema debe permitir crear un registro lógico de documento.

---

### FR-002 — Subir archivo

El sistema debe permitir subir archivos mediante endpoint controlado.

---

### FR-003 — Registrar archivo generado por sistema

El sistema debe permitir registrar archivos generados por otros módulos.

---

### FR-004 — Asociar documento con recurso origen

El sistema debe permitir asociar documentos con recursos de otros módulos.

---

### FR-005 — Validar source resource

El sistema debe validar que el recurso origen pertenezca al tenant activo.

---

### FR-006 — Clasificar documento

El sistema debe permitir definir categoría, sensibilidad y visibilidad.

---

### FR-007 — Versionar documento

El sistema debe permitir crear versiones de documento.

---

### FR-008 — Registrar archivo físico

El sistema debe registrar metadata física del archivo.

---

### FR-009 — Calcular hash

El sistema debe calcular hash SHA-256 del archivo.

---

### FR-010 — Validar MIME type

El sistema debe validar MIME type permitido.

---

### FR-011 — Validar tamaño

El sistema debe validar tamaño máximo.

---

### FR-012 — Sanitizar filename

El sistema debe sanitizar nombres de archivo.

---

### FR-013 — Descargar archivo

El sistema debe permitir descarga autorizada.

---

### FR-014 — Registrar access log

El sistema debe registrar accesos y descargas.

---

### FR-015 — Auditar operaciones críticas

El sistema debe emitir eventos de auditoría.

---

### FR-016 — Archivar documento

El sistema debe permitir archivo lógico.

---

### FR-017 — Restaurar documento

El sistema debe permitir restauración administrativa.

---

### FR-018 — Consultar documentos administrativos

El sistema debe permitir búsqueda administrativa paginada.

---

### FR-019 — Consultar documentos propios

El sistema debe permitir consulta propia de documentos autorizados.

---

### FR-020 — Integrarse con módulos origen

El sistema debe exponer puertos internos para que otros módulos registren documentos.

---

### FR-021 — Proteger storage key

El sistema no debe exponer storage key por API.

---

### FR-022 — Soportar provider local

El sistema debe soportar storage local para desarrollo.

---

### FR-023 — Preparar provider S3-compatible

El sistema debe preparar integración S3-compatible para producción.

---

### FR-024 — No endpoint público

El sistema no debe crear endpoints públicos de documentos en MVP.

---

### FR-025 — Preparar cuarentena

El sistema debe soportar estados para escaneo futuro.

---

## 15. Requisitos no funcionales

### NFR-001 — Seguridad

El módulo debe cumplir reglas de seguridad de `docs/sdd/security.md`.

---

### NFR-002 — Multitenancy

Toda consulta debe filtrar por `tenantId`.

---

### NFR-003 — Privacidad

El sistema debe minimizar datos en DTOs, logs, métricas y auditoría.

---

### NFR-004 — Integridad

Todo archivo debe tener hash cuando esté disponible.

---

### NFR-005 — Disponibilidad

El fallo del storage debe mapearse a errores controlados.

---

### NFR-006 — Performance

Objetivos iniciales:

```text id="w9r92e"
p95 < 700 ms para listados paginados de metadata.
p95 < 1500 ms para preparar descarga autorizada.
Streaming para archivos grandes.
No cargar binarios en JSON.
```

---

### NFR-007 — Escalabilidad

El storage debe ser desacoplado para migrar de local a S3-compatible.

---

### NFR-008 — Observabilidad

El módulo debe emitir logs y métricas seguras.

---

### NFR-009 — Auditoría

Las operaciones críticas deben ser auditadas.

---

### NFR-010 — Compatibilidad

El módulo debe ser consumible por Payments, Fines, Communications, Certified Minutes y futuros módulos.

---

## 16. Permisos iniciales

### 16.1. Documentos administrativos

```text id="uvd0d3"
documents.create
documents.read
documents.updateMetadata
documents.archive
documents.restore
documents.download
documents.managePolicies
```

---

### 16.2. Documentos propios

```text id="g0w4yu"
documents.read.own
documents.download.own
documents.upload.own
```

---

### 16.3. Operaciones de sistema

```text id="fvl94x"
documents.registerSystemGenerated
documents.readSystemMetadata
```

---

### 16.4. Auditoría

```text id="s6o573"
documents.audit.read
```

---

### 16.5. Configuración de storage

```text id="v4psrv"
documents.storage.configure
documents.storage.readConfig
documents.storage.testConnection
```

---

## 17. API preliminar

### 17.1. Endpoints tenant administrativos

```text id="xqi9pp"
GET    /api/v1/tenant/documents
POST   /api/v1/tenant/documents
GET    /api/v1/tenant/documents/{documentId}
PATCH  /api/v1/tenant/documents/{documentId}/metadata
POST   /api/v1/tenant/documents/{documentId}/archive
POST   /api/v1/tenant/documents/{documentId}/restore
GET    /api/v1/tenant/documents/{documentId}/access-logs
```

---

### 17.2. Endpoints de archivos

```text id="wkqtlt"
POST   /api/v1/tenant/documents/{documentId}/files
GET    /api/v1/tenant/document-files/{fileId}
GET    /api/v1/tenant/document-files/{fileId}/download
POST   /api/v1/tenant/document-files/{fileId}/archive
```

---

### 17.3. Endpoints de versiones

```text id="is831q"
GET    /api/v1/tenant/documents/{documentId}/versions
POST   /api/v1/tenant/documents/{documentId}/versions
GET    /api/v1/tenant/document-versions/{versionId}
POST   /api/v1/tenant/document-versions/{versionId}/archive
```

---

### 17.4. Endpoints propios

```text id="rngkt4"
GET    /api/v1/me/documents
GET    /api/v1/me/documents/{documentId}
GET    /api/v1/me/document-files/{fileId}/download
POST   /api/v1/me/documents
POST   /api/v1/me/documents/{documentId}/files
```

Nota:

```text id="e69bc7"
POST /api/v1/me/documents y POST /api/v1/me/documents/{documentId}/files solo deben habilitarse para categorías permitidas, como comprobantes de pago propios, y bajo autorización del módulo origen.
```

---

### 17.5. Endpoints platform

```text id="ifp2yw"
GET    /api/v1/platform/document-storage/config
PATCH  /api/v1/platform/document-storage/config
POST   /api/v1/platform/document-storage/test-connection
GET    /api/v1/platform/document-storage/providers
```

---

### 17.6. Endpoints públicos

No crear endpoints públicos en MVP.

Prohibido:

```text id="vbi0xf"
GET /api/v1/public/documents/{documentId}
GET /api/v1/public/document-files/{fileId}/download
GET /api/v1/public/tenants/{slug}/documents
GET /api/v1/public/tenants/{slug}/documents/{documentId}
GET /api/v1/public/tenants/{slug}/document-files/{fileId}/download
```

---

## 18. Integraciones con módulos existentes

### 18.1. Payments

Uso:

```text id="p5d2di"
- comprobantes de pago;
- recibos emitidos;
- archivos de soporte;
- evidencias de transferencia.
```

Reglas:

```text id="ur2fut"
- documents.upload.own puede usarse para reportar comprobante propio;
- paymentId debe pertenecer al tenant;
- propertyUnitId debe pertenecer al actor o autorización administrativa;
- financial manager puede revisar bajo permisos;
- no exponer comprobantes a otros residentes.
```

---

### 18.2. Fines and Sanctions

Uso:

```text id="w0zc89"
- evidencias de multas;
- imágenes;
- reportes;
- documentos de apelación.
```

Reglas:

```text id="pnresz"
- fineId debe pertenecer al tenant;
- evidencia puede ser restricted;
- descarga solo administrativa o own si política lo permite;
- no publicar en WordPress.
```

---

### 18.3. Communications and Notifications

Uso:

```text id="ql48va"
- adjuntos de comunicados;
- imágenes de portada;
- documentos internos;
- documentos públicos futuros.
```

Reglas:

```text id="nyr50o"
- adjuntos privados no son públicos;
- imágenes públicas futuras requieren política explícita;
- notification payload no debe incluir storageKey.
```

---

### 18.4. Certified Minutes

Uso:

```text id="z7uad5"
- PDF oficial interno;
- PDF borrador;
- hash manifest;
- adjuntos de acta;
- hoja de asistencia;
- reporte de votación.
```

Reglas:

```text id="j8gm6g"
- artifactId puede mapearse a SecureDocument;
- download debe respetar audience de Certified Minutes;
- storageKey no se expone;
- hash se conserva.
```

---

### 18.5. Basic Reports

Uso:

```text id="srvrul"
- exportaciones CSV;
- exportaciones XLSX;
- exportaciones PDF.
```

Reglas:

```text id="q1nx9f"
- report exports son documentos generados por sistema;
- pueden tener expiración futura;
- acceso por permisos de reportes;
- no deben contener datos cross-tenant.
```

---

## 19. Políticas de visibilidad

### 19.1. `private`

Solo usuarios administrativos o dueños explícitos.

---

### 19.2. `administrative`

Solo roles administrativos autorizados.

---

### 19.3. `tenant`

Usuarios del tenant con permiso o audiencia amplia.

---

### 19.4. `owners`

Propietarios activos del tenant.

---

### 19.5. `residents`

Residentes activos del tenant.

---

### 19.6. `board`

Miembros de directiva o rol equivalente.

---

### 19.7. `meetingParticipants`

Participantes de una reunión específica.

---

### 19.8. `sourceResourceAudience`

La audiencia se delega al módulo origen.

Ejemplo:

```text id="k8y2p6"
Certified Minutes decide quién puede descargar su PDF publicado.
```

---

### 19.9. `specificUsers`

Usuarios específicos del tenant.

---

### 19.10. `propertyUnits`

Usuarios vinculados a unidades específicas.

---

### 19.11. `roles`

Usuarios con roles específicos.

---

### 19.12. `mixed`

Combinación de reglas.

---

### 19.13. `publicEligible`

No expone nada automáticamente.

Requiere spec futura para publicación pública.

---

## 20. Seguridad

### 20.1. Amenazas prioritarias

```text id="rrlrq7"
- cross-tenant document access;
- unauthorized download;
- storageKey exposure;
- persistent signed URL exposure;
- malicious file upload;
- path traversal;
- MIME spoofing;
- overlarge file upload;
- binary content in logs;
- sensitive document in audit metadata;
- public endpoint accidental;
- sourceResourceId cross-tenant;
- own-resource bypass;
- PlatformAdmin unrestricted access;
- broken archive policy;
- hash missing or incorrect.
```

---

### 20.2. Controles obligatorios

```text id="sfbnnn"
- AuthGuard;
- TenantGuard;
- PermissionGuard;
- SourceResourceGuard;
- DocumentAccessPolicy;
- OwnDocumentPolicy;
- StorageAccessPolicy;
- FileValidationPolicy;
- AuditPolicy;
- DTO minimization;
- safe errors;
- Cache-Control: no-store;
- rate limiting;
- OpenAPI negative tests.
```

---

### 20.3. Headers

Todos los endpoints privados deben devolver:

```text id="jh57cl"
Cache-Control: no-store
```

---

### 20.4. File validation

Validar:

```text id="tx1za7"
fileName
extension
mimeType
magic bytes cuando sea posible
fileSize
hash
sourceModule
sourceResourceId
tenant
category
sensitivity
```

---

### 20.5. Upload hardening

Bloquear:

```text id="gohv7e"
path traversal
null bytes
archivos ejecutables no permitidos
HTML activo no esperado
scripts
contenido excesivo
MIME mismatch
storageKey enviado por cliente
```

---

## 21. Auditoría

### 21.1. Eventos mínimos

```text id="ieuwcr"
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

```text id="zzg688"
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

```text id="vjdxsf"
storageKey
bucket
path interno
URL firmada
contenido del archivo
contenido binario
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

```text id="i3uf6a"
document.created
document.uploaded
document.downloaded
document.accessDenied
document.archived
document.storageError
document.validationFailed
```

---

### 22.2. Métricas sugeridas

```text id="o3vazb"
documents_created_total
documents_uploaded_total
documents_downloaded_total
documents_download_denied_total
documents_archived_total
document_upload_bytes_total
document_download_bytes_total
document_storage_errors_total
document_validation_failed_total
```

---

### 22.3. Labels permitidos

```text id="veonbz"
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

```text id="kj97yd"
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

## 23. Reglas de datos

### 23.1. Metadata segura

Permitido:

```text id="m5sk36"
description
sourceModule
sourceResourceType
sourceResourceId
category
sensitivity
visibility
safe tags
fileSize
mimeType
hashPrefix
provider
createdAt
uploadedAt
archivedAt
```

---

### 23.2. Metadata prohibida

```text id="avtxgy"
passwords
tokens
api keys
client secrets
cookies
authorization headers
storageKey duplicado
URL firmada
contenido completo del archivo
base64 del archivo
emails completos
teléfonos completos
cédulas
datos bancarios completos
stack traces
SQL raw
```

---

### 23.3. Datos binarios

Los archivos binarios nunca deben viajar dentro de JSON.

Deben enviarse por:

```text id="hm2f4a"
multipart/form-data en upload
binary stream en download
URL temporal corta si política lo permite
```

---

## 24. OpenAPI

El contrato OpenAPI deberá documentar:

```text id="xpaq30"
x-tenant-scope: true
x-auth-required: true
x-required-permission
x-own-resource cuando aplique
x-secure-download: true
x-storage-key-exposed: false
x-binary-response: true
x-audit-event
x-public-exposure: false
```

OpenAPI no debe documentar endpoints públicos de documentos en MVP.

---

## 25. Criterios de aceptación

### 25.1. Funcionales

```text id="h8psmb"
- permite registrar documentos;
- permite subir archivos;
- permite registrar archivos generados por sistema;
- permite crear versiones;
- permite consultar metadata administrativa;
- permite consultar documentos propios autorizados;
- permite descargar documentos autorizados;
- permite archivar documentos;
- permite restaurar documentos;
- registra access logs;
- emite eventos de auditoría;
- integra con módulos origen por puertos.
```

---

### 25.2. Seguridad

```text id="y94bw4"
- todas las tablas tienen tenant_id;
- toda consulta filtra por tenant_id;
- no se acepta tenantId desde body;
- se valida sourceResourceId contra tenant;
- storageKey no se expone;
- signed URL persistente no se expone;
- archivo en cuarentena no se descarga;
- archivo rechazado no se descarga;
- documento archivado no se muestra por defecto;
- descargas se auditan;
- logs no contienen binarios;
- auditoría no contiene binarios;
- no existen endpoints públicos;
- OpenAPI no documenta endpoints públicos;
- PlatformAdmin no accede automáticamente al contenido de tenants.
```

---

### 25.3. Integridad

```text id="sr6165"
- archivo available tiene hash;
- hash usa SHA-256;
- archivo modificado cambia hash;
- hashPrefix puede exponerse;
- hash completo no se expone por DTO estándar;
- fileSize se valida;
- MIME type se valida;
- filename se sanitiza.
```

---

### 25.4. Performance

```text id="l9pyd8"
- listados paginados;
- pageSize máximo 100;
- no se cargan binarios en listados;
- descargas por streaming;
- provider desacoplado;
- índices por tenant_id y sourceModule.
```

---

## 26. Casos borde

| Caso                                      | Resultado esperado |
| ----------------------------------------- | ------------------ |
| Crear documento con `tenantId` en body    | 422                |
| Crear documento sin `sourceModule`        | 422                |
| Crear documento sin categoría             | 422                |
| Crear documento sin sensibilidad          | 422                |
| Asociar `sourceResourceId` de otro tenant | 403/404            |
| Subir archivo vacío                       | 422                |
| Subir archivo demasiado grande            | 413                |
| Subir MIME type no permitido              | 415                |
| Subir archivo con path traversal          | 422                |
| Enviar `storageKey` desde cliente         | 422                |
| Descargar archivo de otro tenant          | 403/404            |
| Descargar sin permiso                     | 403                |
| Descargar documento propio ajeno          | 403/404            |
| Descargar archivo en cuarentena           | 409/403            |
| Descargar archivo rechazado               | 409/403            |
| Descargar documento archivado             | 404/409            |
| Respuesta contiene `storageKey`           | Falla crítica      |
| Error contiene `storageKey`               | Falla crítica      |
| Audit contiene binario                    | Falla crítica      |
| Log contiene binario                      | Falla crítica      |
| Endpoint público existe                   | Falla crítica      |

---

## 27. Pruebas requeridas

### 27.1. Unit tests

```text id="wmsdrk"
DocumentStatus
DocumentVisibility
DocumentSensitivity
DocumentCategory
SourceModule
StorageProvider
FileScanStatus
SecureDocument entity
SecureDocumentVersion entity
SecureDocumentFile entity
SecureDocumentAccessLog entity
FileName value object
MimeType value object
FileSize value object
StorageKey value object
DocumentHash value object
DocumentMetadata sanitizer
```

---

### 27.2. Integration tests

```text id="guxtgy"
PrismaSecureDocumentRepository
PrismaSecureDocumentVersionRepository
PrismaSecureDocumentFileRepository
PrismaSecureDocumentAccessLogRepository
LocalStorageAdapter
S3CompatibleStorageAdapter mock
DocumentHashService
DocumentAccessPolicy
SourceResourceValidator
```

---

### 27.3. API tests

```text id="xpqso6"
GET /api/v1/tenant/documents
POST /api/v1/tenant/documents
GET /api/v1/tenant/documents/{documentId}
PATCH /metadata
POST /archive
POST /restore
POST /files
GET /document-files/{fileId}
GET /document-files/{fileId}/download
GET /me/documents
GET /me/documents/{documentId}
GET /me/document-files/{fileId}/download
```

---

### 27.4. Security tests

```text id="a6k7yy"
no cross-tenant documents
no cross-tenant files
no cross-tenant versions
no cross-tenant access logs
no sourceResourceId cross-tenant
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
```

---

### 27.5. Performance tests

```text id="b5bl7x"
list 10.000 document metadata records paginated
download streaming large file
upload max allowed file
hash calculation timing
source module filter performance
tenant filter performance
```

---

## 28. Riesgos

| Riesgo                             | Impacto | Mitigación                                     |
| ---------------------------------- | ------: | ---------------------------------------------- |
| Exposición cross-tenant            | Crítico | `tenant_id`, guards, tests                     |
| Exposición de `storageKey`         | Crítico | DTO minimizado, tests snapshot                 |
| URL firmada persistente            |    Alto | TTL corto, no persistir                        |
| Archivo malicioso                  |    Alto | MIME validation, scan status, antivirus futuro |
| Path traversal                     |    Alto | storage key server-side                        |
| Logs con binario                   |    Alto | sanitización                                   |
| Auditoría con binario              |    Alto | metadata segura                                |
| Archivo sin hash                   |   Medio | hash obligatorio                               |
| Storage local en producción        |    Alto | config gate                                    |
| Acceso PlatformAdmin no controlado |    Alto | permiso explícito + audit                      |
| Public endpoint accidental         | Crítico | route negative tests + OpenAPI gate            |

---

## 29. Definition of Done

El módulo `016-secure-document-storage` se considera listo cuando:

```text id="vixwk3"
1. `spec.md` está aprobado.
2. `plan.md` está creado.
3. `data-model.md` está creado.
4. `api-contract.md` está creado.
5. `test-plan.md` está creado.
6. `tasks.md` está creado.
7. `security-notes.md` está creado.
8. Prisma schema está implementado.
9. Migraciones están listas.
10. StoragePort está definido.
11. LocalStorageAdapter funciona en desarrollo.
12. S3Compatible adapter está preparado o mockeado.
13. Upload seguro funciona.
14. Download seguro funciona.
15. Hash SHA-256 funciona.
16. Metadata segura funciona.
17. Access logs funcionan.
18. Audit logs funcionan.
19. Integración con módulos origen está documentada.
20. No se expone storageKey.
21. No existen endpoints públicos.
22. Tests críticos pasan.
23. OpenAPI está actualizado.
24. CI pasa.
```

---

## 30. No aceptación

No se acepta la implementación si:

```text id="h4zsvx"
- permite documentos cross-tenant;
- permite archivos cross-tenant;
- permite versiones cross-tenant;
- permite access logs cross-tenant;
- permite sourceResourceId de otro tenant;
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

## 31. Preguntas abiertas

```text id="cliz1d"
1. ¿Cuál será el tamaño máximo inicial por archivo?
2. ¿El límite será global, por tenant, por categoría o por módulo?
3. ¿Se usará S3 AWS directamente, MinIO, Cloudflare R2 u otro storage S3-compatible?
4. ¿Se habilitará antivirus desde MVP o solo estado preparado?
5. ¿Qué categorías permitirán upload propio desde /me?
6. ¿Qué documentos podrán ser descargados por residentes?
7. ¿Cuáles documentos serán estrictamente administrativos?
8. ¿Se requiere expiración de documentos temporales generados por reportes?
9. ¿Se requiere cuota de almacenamiento por tenant?
10. ¿Se requiere versionado físico de objetos en storage?
11. ¿Se requiere cifrado con llave administrada por plataforma o por tenant?
12. ¿Se requiere política formal de retención documental?
```

---

## 32. Decisión MVP recomendada

Para el MVP se recomienda:

```text id="azuu9p"
- usar Secure Document Storage como módulo transversal;
- implementar metadata centralizada;
- implementar upload/download seguro;
- usar storage local solo en desarrollo;
- preparar S3-compatible storage para producción;
- usar SHA-256;
- no exponer storageKey;
- no usar URLs firmadas persistentes;
- no crear endpoints públicos;
- no eliminar físicamente documentos;
- no implementar antivirus real todavía, pero dejar estados preparados;
- no implementar búsqueda full-text;
- no implementar IA;
- no implementar firma electrónica;
- no implementar verificación pública;
- integrar progresivamente Payments, Fines, Communications y Certified Minutes.
```

---

## 33. Resultado esperado

Al finalizar el módulo `016-secure-document-storage`, RESIDENT Core contará con una base documental segura para todos los módulos que manejan archivos.

El resultado esperado es:

```text id="u95q2s"
- documentos tenant-scoped;
- metadata estandarizada;
- categorías y sensibilidad;
- storage key protegido;
- upload seguro;
- download seguro;
- hash de integridad;
- validación de MIME type;
- validación de tamaño;
- access logs;
- auditoría;
- soporte para módulos origen;
- abstracción de provider;
- preparación para S3;
- no exposición pública;
- no filtración de binarios en logs;
- no filtración de storageKey;
- base preparada para retención, antivirus, firma electrónica, verificación pública y gestión documental avanzada.
```
