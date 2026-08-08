# Spec 015 — Certified Minutes

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Proyecto        | RESIDENT Core                                                                                                                                                                                                |
| Spec ID         | 015                                                                                                                                                                                                          |
| Módulo          | Certified Minutes                                                                                                                                                                                            |
| Documento       | Functional Specification                                                                                                                                                                                     |
| Ruta            | `docs/specs/015-certified-minutes/spec.md`                                                                                                                                                                   |
| Versión         | 0.1                                                                                                                                                                                                          |
| Estado          | Borrador inicial                                                                                                                                                                                             |
| Fecha           | 2026-07-20                                                                                                                                                                                                   |
| Prioridad       | Media / Alta                                                                                                                                                                                                 |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `007-audit`, `012-communications-notifications`, `013-meetings-attendance`, `014-voting-basic`                                                 |
| Relacionado con | reuniones, asambleas, asistencia, quórum, resoluciones, votaciones, actas preliminares, publicación controlada, almacenamiento de documentos, auditoría, futuras firmas electrónicas, futuras reglas legales |

---

## 2. Nombre de la funcionalidad

```text id="x65k7s"
Certified Minutes
```

---

## 3. Propósito

El módulo `015-certified-minutes` define la gestión de actas formales internas dentro de RESIDENT Core.

El objetivo es permitir que un tenant pueda transformar el acta preliminar de una reunión o asamblea en un acta formal controlada, versionada, revisada, aprobada, sellada internamente mediante hash, publicada a una audiencia autorizada y vinculada con asistencia, quórum, votaciones, resoluciones y auditoría.

Regla central:

```text id="bzz5jg"
Toda acta certificada debe pertenecer a un tenant, estar vinculada a una reunión válida, derivarse de contenido aprobado, conservar versionado, registrar responsables, proteger integridad documental, controlar publicación y mantener trazabilidad auditable completa.
```

---

## 4. Aclaración sobre “certificada”

En esta spec, “certificada” significa:

```text id="tir0w0"
acta formalizada internamente por RESIDENT Core,
con control de versión,
aprobación administrativa,
hash de integridad,
registro de publicación,
auditoría,
y evidencia técnica de no alteración posterior.
```

No significa en MVP:

```text id="sainxo"
firma electrónica legalmente válida,
firma manuscrita digitalizada con valor legal,
certificación notarial,
sellado de tiempo certificado por tercero,
validez probatoria plena ante autoridad externa,
verificación criptográfica pública,
documento legal automáticamente ejecutable.
```

Cualquier firma electrónica, sellado de tiempo certificado, validación legal, integración notarial o certificación externa deberá definirse en specs futuras.

---

## 5. Objetivo funcional

Permitir la formalización interna de actas de reunión o asamblea, incluyendo:

* creación de acta formal desde una reunión;
* importación de contenido desde `MeetingMinutes`;
* estructura por secciones;
* versionado;
* control de cambios;
* revisión;
* aprobación;
* generación de artefacto PDF formal;
* cálculo de hash de integridad;
* bloqueo de acta aprobada;
* publicación controlada;
* consulta administrativa;
* consulta propia por audiencia autorizada;
* vínculo con asistencia;
* vínculo con quórum;
* vínculo con votaciones;
* vínculo con resoluciones;
* adjuntos;
* registro de responsables;
* registro de aprobación;
* registro de publicación;
* auditoría;
* notificaciones;
* protección de datos;
* preparación para firma electrónica futura;
* preparación para verificación externa futura.

---

## 6. Alcance

### 6.1. Incluido en esta spec

Esta spec incluye:

```text id="prwzm4"
1. Gestión de actas formales internas.
2. Actas vinculadas a reuniones.
3. Importación desde actas preliminares de 013-meetings-attendance.
4. Secciones de acta.
5. Versionado de contenido.
6. Historial de cambios.
7. Flujo draft -> underReview -> approved -> sealed -> published -> archived.
8. Registro de aprobadores.
9. Registro de responsables.
10. Registro de hash de integridad.
11. Generación de artefacto PDF interno.
12. Registro de artefactos generados.
13. Publicación controlada a audiencia autorizada.
14. Consulta administrativa.
15. Consulta propia.
16. Adjuntos del acta.
17. Vínculo con asistencia.
18. Vínculo con quórum.
19. Vínculo con votaciones.
20. Vínculo con resoluciones.
21. Eventos de notificación.
22. Auditoría completa.
23. API REST.
24. Preparación para firma electrónica futura.
25. Preparación para sellado de tiempo futuro.
26. Pruebas funcionales, multitenant, autorización, integridad, privacidad y seguridad.
```

---

### 6.2. No incluido en esta spec

Queda fuera del MVP:

```text id="lux8ie"
- Firma electrónica legalmente válida.
- Firma electrónica avanzada.
- Firma electrónica cualificada.
- Sellado de tiempo certificado por tercero.
- Certificación notarial.
- Integración con Registro de la Propiedad u organismo externo.
- Verificación pública externa.
- Blockchain.
- OCR de actas físicas.
- Escaneo y validación automática de firmas manuscritas.
- Flujo legal de impugnaciones.
- Actas con valor probatorio garantizado por el sistema.
- Automatización de acciones legales.
- Ejecución automática de resoluciones.
- Generación automática de cargos desde actas.
- Generación automática de multas desde actas.
- IA para redactar actas con datos reales.
- IA para interpretar validez legal.
- Traducción automática de actas oficiales.
- Videograbación.
- Transcripción automática.
- Reconocimiento de voz.
- Firma biométrica.
```

---

## 7. Contexto arquitectónico

Este módulo pertenece principalmente al bounded context:

```text id="yt1ipk"
Meetings and Attendance
Voting and Resolutions
Documents and Minutes
Audit and Compliance
Communications and Notifications
```

Se relaciona con:

```text id="o7q0r2"
Tenant Management
Identity and Access
Residents and Properties
Meetings and Attendance
Voting Basic
Communications and Notifications
Audit and Compliance
Reporting and Analytics
External Storage
```

Relación conceptual:

```text id="s6y3rj"
Tenant
  └── Meeting
        ├── Attendance
        ├── Quorum
        ├── Meeting Minutes
        ├── Voting Sessions
        ├── Resolutions
        └── Certified Minutes
              ├── Versions
              ├── Sections
              ├── Approvals
              ├── Attachments
              ├── PDF Artifact
              ├── Integrity Hash
              ├── Publication
              └── Audit Trail
```

---

## 8. Principios

### 8.1. Tenant isolation obligatorio

Toda acta, versión, sección, aprobación, adjunto, artefacto, publicación y evento pertenece a un tenant.

Regla:

```text id="d5eu68"
certifiedMinutes.tenantId == currentTenant.id
```

---

### 8.2. El acta formal no reemplaza la reunión

El acta certificada depende de una reunión válida.

No reemplaza:

```text id="bvxz4u"
convocatoria
agenda
asistencia
quórum
votaciones
resoluciones
auditoría base de la reunión
```

---

### 8.3. El acta formal no reemplaza la firma electrónica

El MVP genera un acta formal interna con hash y auditoría, pero no firma electrónica legal.

Regla:

```text id="b0p1bk"
CertifiedMinutes MVP no debe presentarse como firma electrónica ni certificación legal externa.
```

---

### 8.4. Fuente de contenido controlada

El acta puede derivarse de:

```text id="aewal6"
MeetingMinutes
MeetingAgendaItems
MeetingAttendance
MeetingQuorum
MeetingResolutions
VotingResults
adjuntos administrativos
contenido redactado por usuario autorizado
```

Todo contenido debe pasar por revisión y aprobación.

---

### 8.5. Versionado obligatorio

Toda modificación relevante debe crear o actualizar una versión controlada.

Regla:

```text id="k21txt"
No se debe sobrescribir silenciosamente un acta ya aprobada, sellada o publicada.
```

---

### 8.6. Integridad documental

El sistema debe calcular un hash del contenido sellado.

Regla:

```text id="k34xuf"
sealedHash = hash(canonicalized certified minutes content + relevant metadata)
```

El hash sirve para detectar alteraciones posteriores.

---

### 8.7. Publicación controlada

El acta publicada solo puede ser visible para audiencia autorizada.

Audiencias posibles:

```text id="q73ydw"
administradores
directiva
propietarios
residentes
participantes de reunión
unidades específicas
usuarios específicos
roles específicos
tenant completo
```

---

### 8.8. No exposición pública

MVP no expone actas certificadas en endpoints públicos.

Regla:

```text id="iac3n4"
Certified Minutes no debe crear rutas bajo /api/v1/public.
```

---

### 8.9. Auditoría obligatoria

Toda operación crítica debe auditarse.

Ejemplos:

```text id="pyok98"
acta creada
versión creada
sección modificada
acta enviada a revisión
acta aprobada
acta rechazada
acta sellada
PDF generado
acta publicada
acta archivada
adjunto agregado
adjunto eliminado lógicamente
acceso a acta
descarga de PDF
```

---

### 8.10. No ejecución automática

El acta publicada no ejecuta acciones automáticas.

Prohibido:

```text id="p10fbu"
generar cargos
generar multas
modificar roles
modificar presupuestos
ejecutar resoluciones
activar contratos
enviar documentos a terceros sin flujo explícito
```

---

## 9. Actores

### 9.1. TenantAdmin

Puede:

* crear actas certificadas;
* revisar actas;
* aprobar actas;
* sellar actas si tiene permiso;
* publicar actas;
* archivar actas;
* gestionar adjuntos;
* consultar auditoría.

---

### 9.2. MeetingManager

Puede:

* crear acta desde una reunión;
* importar contenido preliminar;
* editar acta en estado editable;
* enviar a revisión;
* generar borrador PDF;
* consultar actas de reuniones bajo su responsabilidad.

---

### 9.3. BoardMember

Puede:

* revisar actas;
* aprobar actas si tiene permiso;
* consultar actas publicadas;
* descargar artefactos autorizados.

---

### 9.4. PropertyOwner

Puede:

* consultar actas publicadas dirigidas a propietarios;
* descargar PDF publicado si la política lo permite;
* ver resoluciones publicadas asociadas.

---

### 9.5. Resident

Puede:

* consultar actas publicadas dirigidas a residentes;
* descargar PDF si la política lo permite;
* no puede ver actas restringidas solo a propietarios o directiva.

---

### 9.6. Participant

Puede:

* consultar actas publicadas para participantes de una reunión si la política lo permite.

---

### 9.7. PlatformAdmin

No debe acceder automáticamente a actas internas de tenants.

Cualquier acceso excepcional requiere:

```text id="cqfebc"
permiso explícito
justificación
auditoría reforzada
política de soporte
```

---

### 9.8. Visitante público

No tiene acceso a actas certificadas, PDFs, adjuntos, resoluciones internas ni auditoría.

---

## 10. Definiciones

### 10.1. Certified Minutes

Acta formal interna vinculada a una reunión.

---

### 10.2. Minutes Version

Versión controlada del acta.

Cada versión representa un estado del contenido en un momento determinado.

---

### 10.3. Minutes Section

Sección estructurada del acta.

Ejemplos:

```text id="ei27ax"
encabezado
convocatoria
asistentes
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

### 10.4. Minutes Approval

Registro de aprobación o rechazo de una versión del acta.

---

### 10.5. Minutes Seal

Registro del sellado interno del acta mediante hash de integridad.

---

### 10.6. PDF Artifact

Archivo PDF generado desde el contenido aprobado o sellado.

---

### 10.7. Publication

Registro de publicación controlada del acta.

---

### 10.8. Access Record

Registro auditable de consulta o descarga.

---

## 11. Supuestos

1. El tenant ya existe.
2. Los usuarios y roles existen.
3. La reunión ya existe.
4. La reunión pertenece al tenant activo.
5. El módulo `013-meetings-attendance` ya gestiona actas preliminares.
6. El módulo `014-voting-basic` puede aportar resultados de votación.
7. El acta certificada puede derivarse de `MeetingMinutes`.
8. El acta certificada puede vincular resoluciones.
9. Los adjuntos se almacenan mediante mecanismo seguro de archivos.
10. El hash se calcula sobre contenido canonicalizado.
11. La zona horaria operativa por defecto es `America/Guayaquil`.
12. Las fechas se almacenan en UTC.
13. Los PDFs generados por MVP son artefactos internos, no documentos firmados electrónicamente.
14. El sistema no valida legalidad de decisiones.
15. El sistema no reemplaza asesoría legal.
16. El sistema no ejecuta resoluciones automáticamente.
17. IA externa no debe usarse con actas reales.
18. El acceso final al acta depende de audiencia y permisos.

---

## 12. Entidades principales

### 12.1. CertifiedMinutes

Representa el acta formal interna.

Campos conceptuales:

```text id="p7lzvk"
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
├── submittedAt
├── approvedAt
├── sealedAt
├── publishedAt
├── archivedAt
├── sealHash
├── sealAlgorithm
├── metadata
├── createdAt
└── updatedAt
```

---

### 12.2. CertifiedMinutesVersion

Representa una versión del acta.

Campos conceptuales:

```text id="djheej"
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
├── createdAt
├── approvedAt
├── sealedAt
└── archivedAt
```

---

### 12.3. CertifiedMinutesSection

Representa una sección estructurada del acta.

Campos conceptuales:

```text id="t9peby"
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
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 12.4. CertifiedMinutesApproval

Representa aprobación, rechazo u observación sobre una versión.

Campos conceptuales:

```text id="d9nvxy"
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

### 12.5. CertifiedMinutesAttachment

Representa anexos del acta.

Campos conceptuales:

```text id="yc59yw"
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
├── uploadedBy
├── uploadedAt
├── archivedBy
├── archivedAt
└── metadata
```

---

### 12.6. CertifiedMinutesArtifact

Representa artefactos generados, especialmente PDF.

Campos conceptuales:

```text id="q60bha"
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
├── generatedBy
├── generatedAt
├── archivedAt
└── metadata
```

---

### 12.7. CertifiedMinutesPublication

Representa la publicación controlada del acta.

Campos conceptuales:

```text id="wsh174"
CertifiedMinutesPublication
├── id
├── tenantId
├── certifiedMinutesId
├── versionId
├── audienceType
├── audienceRules
├── publishedBy
├── publishedAt
├── expiresAt
├── status
├── notificationRequested
├── createdAt
└── archivedAt
```

---

### 12.8. CertifiedMinutesAccessLog

Representa registro de consulta o descarga.

Campos conceptuales:

```text id="xq8w8g"
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

## 13. Estados y enums

### 13.1. CertifiedMinutesStatus

```text id="fdlmhm"
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

### 13.2. CertifiedMinutesVersionStatus

```text id="jg9o1v"
draft
underReview
approved
sealed
superseded
archived
```

---

### 13.3. CertifiedMinutesVisibility

```text id="we3xc5"
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

### 13.4. CertificationMode

```text id="xlbqzk"
internalHash
manualApproval
systemGeneratedPdf
```

Diferidos:

```text id="fn3uda"
electronicSignature
qualifiedSignature
externalTimestamp
notarialCertification
publicVerification
```

---

### 13.5. MinutesSectionType

```text id="w9r9dc"
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

### 13.6. ApprovalDecision

```text id="y719ag"
approved
rejected
changesRequested
commented
```

---

### 13.7. AttachmentType

```text id="ub5v4v"
supportingDocument
attendanceSheet
votingReport
resolutionDocument
image
pdf
other
```

---

### 13.8. ArtifactType

```text id="o107qp"
pdf
htmlSnapshot
jsonSnapshot
hashManifest
```

---

### 13.9. ArtifactStatus

```text id="zldf9m"
pending
generated
failed
archived
```

---

### 13.10. PublicationStatus

```text id="x5znh0"
draft
published
expired
revoked
archived
```

---

### 13.11. AccessType

```text id="wnv35a"
view
download
export
print
```

---

## 14. Transiciones de estado

### 14.1. CertifiedMinutes

Flujo principal:

```text id="gm3lus"
draft -> underReview -> approved -> sealed -> published -> archived
```

Flujo con cambios solicitados:

```text id="pe0x4m"
underReview -> changesRequested -> draft -> underReview
```

Flujo con reemplazo:

```text id="hqr20k"
published -> superseded -> archived
```

Cancelación:

```text id="m0k0n8"
draft -> cancelled
underReview -> cancelled
changesRequested -> cancelled
```

Transiciones prohibidas:

```text id="fdsdl5"
published -> draft
sealed -> draft
approved -> draft sin crear nueva versión
archived -> published
cancelled -> published
published -> underReview sin nueva versión
```

---

### 14.2. CertifiedMinutesVersion

```text id="x5r8r0"
draft -> underReview -> approved -> sealed
draft -> archived
underReview -> draft si changesRequested
sealed -> superseded
superseded -> archived
```

---

### 14.3. CertifiedMinutesArtifact

```text id="d9p94m"
pending -> generated
pending -> failed
generated -> archived
failed -> archived
```

---

### 14.4. CertifiedMinutesPublication

```text id="c21yan"
draft -> published
published -> expired
published -> revoked
published -> archived
```

---

## 15. Reglas de negocio

### BR-001 — Toda acta certificada pertenece a un tenant

```text id="p7adsa"
certifiedMinutes.tenantId = currentTenant.id
```

---

### BR-002 — El cliente no envía tenantId

El tenant se deriva del contexto autenticado.

---

### BR-003 — Toda acta certificada debe vincularse a una reunión

```text id="j78qev"
certifiedMinutes.meetingId requerido
```

---

### BR-004 — La reunión debe pertenecer al mismo tenant

```text id="zevmt8"
meeting.tenantId = certifiedMinutes.tenantId
```

---

### BR-005 — El acta preliminar fuente debe pertenecer al mismo tenant

Si se usa `sourceMeetingMinutesId`:

```text id="w31ccs"
sourceMeetingMinutes.tenantId = certifiedMinutes.tenantId
sourceMeetingMinutes.meetingId = certifiedMinutes.meetingId
```

---

### BR-006 — No debe existir más de un acta activa principal por reunión

Para una reunión solo puede existir un acta certificada activa no archivada, salvo versiones o reemplazos controlados.

---

### BR-007 — El acta inicia en draft

```text id="eot52u"
status = draft
```

---

### BR-008 — El contenido editable solo existe en versiones no selladas

No se puede modificar una versión `sealed`.

---

### BR-009 — Las modificaciones posteriores a aprobación requieren nueva versión

Si un acta está `approved`, `sealed` o `published`, cualquier cambio de contenido debe crear nueva versión.

---

### BR-010 — Toda versión debe tener número incremental

```text id="wuacxd"
versionNumber = previousVersionNumber + 1
```

---

### BR-011 — El hash se calcula sobre contenido canonicalizado

El contenido debe normalizarse antes de calcular hash para evitar diferencias accidentales.

---

### BR-012 — El hash no reemplaza firma electrónica

El hash solo demuestra integridad técnica interna.

---

### BR-013 — Aprobar requiere permiso

Solo usuarios con permiso pueden aprobar.

---

### BR-014 — Sellar requiere aprobación previa

No se puede sellar un acta en `draft` o `underReview`.

---

### BR-015 — Publicar requiere sellado previo

No se puede publicar un acta que no esté sellada.

---

### BR-016 — Publicar requiere audiencia definida

Toda publicación debe definir audiencia.

---

### BR-017 — Acta publicada no se modifica directamente

Si se requiere corrección, se crea nueva versión o acta superseding.

---

### BR-018 — Revocar publicación no elimina acta

La revocación cambia el estado de publicación, no elimina el acta ni su auditoría.

---

### BR-019 — Descargar PDF requiere autorización

El usuario debe pertenecer a la audiencia autorizada o tener permiso administrativo.

---

### BR-020 — Adjuntos requieren validación

Todo adjunto debe validarse por tipo, tamaño, hash, tenant y permisos.

---

### BR-021 — Adjuntos no se eliminan físicamente de forma ordinaria

Se archivan lógicamente.

---

### BR-022 — El PDF formal se genera desde versión aprobada o sellada

No se debe generar PDF formal desde contenido no aprobado, salvo borrador explícito con marca de agua.

---

### BR-023 — Borradores PDF deben marcarse como no oficiales

Si se permite PDF de borrador, debe incluir marca clara de borrador.

---

### BR-024 — Los resultados de votación se importan como evidencia, no se recalculan aquí

El módulo puede referenciar resultados de `014-voting-basic`, pero no recalcular votaciones.

---

### BR-025 — La asistencia y quórum se importan como snapshot

El acta puede incorporar snapshot de asistencia y quórum para preservar consistencia histórica.

---

### BR-026 — El acta no ejecuta resoluciones

El acta puede vincular resoluciones, pero no ejecutarlas.

---

### BR-027 — No endpoints públicos

No se exponen actas en `/api/v1/public`.

---

### BR-028 — Auditoría obligatoria

Toda transición crítica y acceso relevante debe auditarse.

---

### BR-029 — Logs sin contenido completo

Los logs no deben registrar el cuerpo completo del acta.

---

### BR-030 — IA externa prohibida con actas reales

No enviar actas reales a herramientas externas de IA en MVP.

---

## 16. Historias de usuario

### US-001 — Crear acta certificada desde reunión

Como MeetingManager, quiero crear un acta formal desde una reunión para preparar su revisión.

#### Criterios de aceptación

* Requiere permiso.
* La reunión pertenece al tenant activo.
* No existe acta activa principal para la reunión.
* Estado inicial `draft`.
* Se registra auditoría `certifiedMinutes.created`.

---

### US-002 — Importar contenido desde acta preliminar

Como MeetingManager, quiero importar el contenido de `MeetingMinutes` para usarlo como base del acta formal.

#### Criterios de aceptación

* El acta preliminar pertenece al mismo tenant.
* El acta preliminar pertenece a la misma reunión.
* Se crea versión inicial.
* Se crean secciones base.
* Se audita `certifiedMinutes.importedFromMeetingMinutes`.

---

### US-003 — Editar secciones de acta

Como MeetingManager, quiero editar secciones del acta en borrador.

#### Criterios de aceptación

* Solo se permite en estado editable.
* Se sanitiza contenido.
* Se conserva trazabilidad.
* No se modifica versión sellada.
* Se audita `certifiedMinutesSection.updated`.

---

### US-004 — Crear nueva versión

Como MeetingManager, quiero crear una nueva versión cuando se requieren cambios.

#### Criterios de aceptación

* Número incremental.
* Copia contenido de versión anterior.
* Permite razón de cambio.
* Versión anterior queda preservada.
* Se audita `certifiedMinutesVersion.created`.

---

### US-005 — Enviar acta a revisión

Como MeetingManager, quiero enviar el acta a revisión.

#### Criterios de aceptación

* Debe tener secciones mínimas requeridas.
* Debe tener contenido válido.
* Cambia a `underReview`.
* Se notifica a revisores si aplica.
* Se audita `certifiedMinutes.submittedForReview`.

---

### US-006 — Solicitar cambios

Como BoardMember, quiero solicitar cambios antes de aprobar el acta.

#### Criterios de aceptación

* Requiere permiso.
* Registra comentario obligatorio.
* Cambia a `changesRequested`.
* Se audita `certifiedMinutes.changesRequested`.

---

### US-007 — Aprobar acta

Como TenantAdmin o BoardMember autorizado, quiero aprobar el acta revisada.

#### Criterios de aceptación

* Requiere permiso.
* Acta está `underReview`.
* Registra aprobador.
* Registra fecha.
* Cambia a `approved`.
* Se audita `certifiedMinutes.approved`.

---

### US-008 — Sellar acta

Como TenantAdmin autorizado, quiero sellar el acta aprobada para preservar su integridad.

#### Criterios de aceptación

* Requiere permiso.
* Acta está `approved`.
* Calcula hash.
* Registra algoritmo.
* Bloquea versión sellada.
* Cambia a `sealed`.
* Se audita `certifiedMinutes.sealed`.

---

### US-009 — Generar PDF formal

Como MeetingManager, quiero generar el PDF del acta sellada.

#### Criterios de aceptación

* Requiere permiso.
* Usa versión aprobada o sellada.
* Genera archivo PDF.
* Calcula hash del artefacto.
* Registra storage key.
* Se audita `certifiedMinutesArtifact.generated`.

---

### US-010 — Publicar acta

Como TenantAdmin, quiero publicar el acta a una audiencia autorizada.

#### Criterios de aceptación

* Requiere permiso.
* Acta está `sealed`.
* Existe audiencia.
* Cambia a `published`.
* Crea registro de publicación.
* Puede notificar audiencia.
* Se audita `certifiedMinutes.published`.

---

### US-011 — Consultar acta publicada

Como propietario o residente autorizado, quiero consultar un acta publicada.

#### Criterios de aceptación

* Usuario autenticado.
* Pertenece al tenant.
* Pertenece a audiencia autorizada.
* No ve actas no publicadas.
* Se registra acceso si la política lo exige.

---

### US-012 — Descargar PDF publicado

Como usuario autorizado, quiero descargar el PDF publicado del acta.

#### Criterios de aceptación

* Requiere autorización.
* Solo PDF generado y autorizado.
* URL temporal o streaming seguro.
* Se registra auditoría de descarga.
* No expone storage key directamente.

---

### US-013 — Revocar publicación

Como TenantAdmin, quiero revocar una publicación por error administrativo.

#### Criterios de aceptación

* Requiere permiso.
* Requiere razón.
* No elimina acta.
* Cambia publicación a `revoked`.
* Se audita `certifiedMinutesPublication.revoked`.

---

### US-014 — Archivar acta

Como TenantAdmin, quiero archivar un acta que ya no debe estar activa.

#### Criterios de aceptación

* Requiere permiso.
* Archivo lógico.
* No elimina versiones, adjuntos, artefactos ni auditoría.
* Se audita `certifiedMinutes.archived`.

---

## 17. Requisitos funcionales

### FR-001 — Crear acta certificada

El sistema debe permitir crear un acta certificada vinculada a una reunión.

---

### FR-002 — Importar contenido preliminar

El sistema debe permitir importar contenido desde `MeetingMinutes`.

---

### FR-003 — Gestionar secciones

El sistema debe permitir crear, listar, editar, reordenar y archivar secciones del acta.

---

### FR-004 — Gestionar versiones

El sistema debe permitir crear y consultar versiones del acta.

---

### FR-005 — Enviar a revisión

El sistema debe permitir enviar una versión a revisión.

---

### FR-006 — Registrar decisiones de aprobación

El sistema debe permitir aprobar, rechazar o solicitar cambios.

---

### FR-007 — Sellar acta

El sistema debe permitir sellar internamente el acta mediante hash.

---

### FR-008 — Generar PDF

El sistema debe permitir generar un artefacto PDF del acta.

---

### FR-009 — Gestionar adjuntos

El sistema debe permitir adjuntar documentos de soporte.

---

### FR-010 — Publicar acta

El sistema debe permitir publicar el acta a una audiencia controlada.

---

### FR-011 — Revocar publicación

El sistema debe permitir revocar una publicación.

---

### FR-012 — Consultar actas administrativas

El sistema debe permitir listar y consultar actas administrativas.

---

### FR-013 — Consultar actas propias

El sistema debe permitir a usuarios consultar actas publicadas según audiencia.

---

### FR-014 — Descargar artefactos

El sistema debe permitir descargar PDF o artefactos autorizados.

---

### FR-015 — Vincular asistencia, quórum y resoluciones

El sistema debe permitir incluir snapshots o referencias de asistencia, quórum y resoluciones.

---

### FR-016 — Vincular resultados de votación

El sistema debe permitir incluir resultados publicados de `014-voting-basic`.

---

### FR-017 — Auditar operaciones críticas

El sistema debe auditar creación, edición, revisión, aprobación, sellado, publicación, descarga y archivo.

---

### FR-018 — Emitir eventos de notificación

El sistema debe emitir eventos hacia `012-communications-notifications`.

---

### FR-019 — Proteger datos sensibles

El sistema debe aplicar minimización, autorización y privacidad.

---

### FR-020 — Documentar API

El sistema debe documentar endpoints, DTOs, permisos y errores en OpenAPI.

---

## 18. Requisitos no funcionales

### NFR-001 — Seguridad

El módulo debe cumplir tenant isolation, autorización por permiso, autorización por audiencia, validación de integridad y protección de documentos.

---

### NFR-002 — Integridad

El contenido sellado debe tener hash reproducible.

---

### NFR-003 — Trazabilidad

Toda operación crítica debe ser auditable.

---

### NFR-004 — Inmutabilidad lógica

Una versión sellada no debe modificarse.

---

### NFR-005 — Privacidad

El sistema no debe exponer actas no publicadas ni contenido restringido.

---

### NFR-006 — Performance

Objetivo MVP:

```text id="bwkaj6"
p95 < 700 ms para listados paginados.
p95 < 1500 ms para consultar acta publicada.
p95 < 5000 ms para generar PDF de acta de hasta 30 páginas.
```

---

### NFR-007 — Almacenamiento seguro

Los artefactos y adjuntos deben almacenarse en storage seguro, con acceso controlado y sin exponer rutas internas.

---

### NFR-008 — API-first

Todas las funciones deben exponerse por REST API.

---

### NFR-009 — Observabilidad segura

Logs y métricas no deben incluir contenido completo del acta ni datos personales innecesarios.

---

### NFR-010 — Evolución futura

El diseño debe permitir firma electrónica, sellado de tiempo, verificación pública, flujos legales y reglas avanzadas en specs futuras.

---

## 19. Permisos iniciales

### 19.1. Actas certificadas

```text id="bxdweo"
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

### 19.2. Versiones

```text id="k19zhv"
certifiedMinutesVersions.create
certifiedMinutesVersions.read
certifiedMinutesVersions.compare
certifiedMinutesVersions.archive
```

---

### 19.3. Secciones

```text id="w2pu5v"
certifiedMinutesSections.create
certifiedMinutesSections.read
certifiedMinutesSections.update
certifiedMinutesSections.reorder
certifiedMinutesSections.archive
```

---

### 19.4. Adjuntos

```text id="dqhxqj"
certifiedMinutesAttachments.create
certifiedMinutesAttachments.read
certifiedMinutesAttachments.download
certifiedMinutesAttachments.archive
```

---

### 19.5. Artefactos

```text id="pb3ch5"
certifiedMinutesArtifacts.generate
certifiedMinutesArtifacts.read
certifiedMinutesArtifacts.download
certifiedMinutesArtifacts.archive
```

---

### 19.6. Publicaciones propias

```text id="x6v1j0"
certifiedMinutes.read.own
certifiedMinutesArtifacts.download.own
```

---

### 19.7. Auditoría

```text id="bv6y55"
certifiedMinutes.audit.read
```

---

## 20. Matriz de permisos resumida

| Acción                          | Permiso requerido                        |
| ------------------------------- | ---------------------------------------- |
| Crear acta                      | `certifiedMinutes.create`                |
| Consultar actas administrativas | `certifiedMinutes.read`                  |
| Actualizar acta                 | `certifiedMinutes.update`                |
| Enviar a revisión               | `certifiedMinutes.submitReview`          |
| Aprobar acta                    | `certifiedMinutes.approve`               |
| Rechazar acta                   | `certifiedMinutes.reject`                |
| Solicitar cambios               | `certifiedMinutes.requestChanges`        |
| Sellar acta                     | `certifiedMinutes.seal`                  |
| Publicar acta                   | `certifiedMinutes.publish`               |
| Revocar publicación             | `certifiedMinutes.revokePublication`     |
| Archivar acta                   | `certifiedMinutes.archive`               |
| Crear versión                   | `certifiedMinutesVersions.create`        |
| Consultar versiones             | `certifiedMinutesVersions.read`          |
| Comparar versiones              | `certifiedMinutesVersions.compare`       |
| Crear sección                   | `certifiedMinutesSections.create`        |
| Editar sección                  | `certifiedMinutesSections.update`        |
| Reordenar secciones             | `certifiedMinutesSections.reorder`       |
| Subir adjunto                   | `certifiedMinutesAttachments.create`     |
| Descargar adjunto               | `certifiedMinutesAttachments.download`   |
| Generar PDF                     | `certifiedMinutesArtifacts.generate`     |
| Descargar PDF admin             | `certifiedMinutesArtifacts.download`     |
| Consultar acta propia           | `certifiedMinutes.read.own`              |
| Descargar PDF propio            | `certifiedMinutesArtifacts.download.own` |
| Consultar auditoría             | `certifiedMinutes.audit.read`            |

---

## 21. API preliminar

### 21.1. Certified Minutes administrativas

```text id="o1zln8"
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

### 21.2. Versions

```text id="kwh1aq"
GET    /api/v1/tenant/certified-minutes/{certifiedMinutesId}/versions
POST   /api/v1/tenant/certified-minutes/{certifiedMinutesId}/versions
GET    /api/v1/tenant/certified-minutes-versions/{versionId}
POST   /api/v1/tenant/certified-minutes-versions/{versionId}/archive
GET    /api/v1/tenant/certified-minutes/{certifiedMinutesId}/versions/compare
```

---

### 21.3. Sections

```text id="pujcbl"
GET    /api/v1/tenant/certified-minutes/{certifiedMinutesId}/sections
POST   /api/v1/tenant/certified-minutes/{certifiedMinutesId}/sections
GET    /api/v1/tenant/certified-minutes-sections/{sectionId}
PATCH  /api/v1/tenant/certified-minutes-sections/{sectionId}
POST   /api/v1/tenant/certified-minutes/{certifiedMinutesId}/sections/reorder
POST   /api/v1/tenant/certified-minutes-sections/{sectionId}/archive
```

---

### 21.4. Approvals

```text id="n5n98b"
GET    /api/v1/tenant/certified-minutes/{certifiedMinutesId}/approvals
POST   /api/v1/tenant/certified-minutes/{certifiedMinutesId}/approvals
GET    /api/v1/tenant/certified-minutes-approvals/{approvalId}
```

---

### 21.5. Attachments

```text id="h1boie"
GET    /api/v1/tenant/certified-minutes/{certifiedMinutesId}/attachments
POST   /api/v1/tenant/certified-minutes/{certifiedMinutesId}/attachments
GET    /api/v1/tenant/certified-minutes-attachments/{attachmentId}
GET    /api/v1/tenant/certified-minutes-attachments/{attachmentId}/download
POST   /api/v1/tenant/certified-minutes-attachments/{attachmentId}/archive
```

---

### 21.6. Artifacts

```text id="gsav3s"
GET    /api/v1/tenant/certified-minutes/{certifiedMinutesId}/artifacts
POST   /api/v1/tenant/certified-minutes/{certifiedMinutesId}/artifacts/generate-pdf
GET    /api/v1/tenant/certified-minutes-artifacts/{artifactId}
GET    /api/v1/tenant/certified-minutes-artifacts/{artifactId}/download
POST   /api/v1/tenant/certified-minutes-artifacts/{artifactId}/archive
```

---

### 21.7. Endpoints propios

```text id="htt0v6"
GET    /api/v1/me/certified-minutes
GET    /api/v1/me/certified-minutes/{certifiedMinutesId}
GET    /api/v1/me/certified-minutes/{certifiedMinutesId}/artifacts
GET    /api/v1/me/certified-minutes-artifacts/{artifactId}/download
```

---

### 21.8. Endpoints públicos

MVP no expone endpoints públicos.

Prohibido:

```text id="d3j9fp"
GET /api/v1/public/tenants/{slug}/certified-minutes
GET /api/v1/public/tenants/{slug}/certified-minutes/{certifiedMinutesId}
GET /api/v1/public/tenants/{slug}/certified-minutes/{certifiedMinutesId}/download
```

---

## 22. Datos públicos

### 22.1. Exposición pública

En MVP:

```text id="oz4w0i"
No hay datos públicos de actas certificadas.
```

---

### 22.2. Justificación

Las actas pueden contener:

```text id="jkop8j"
asistencia
nombres de propietarios
nombres de residentes
unidades habitacionales
decisiones internas
votaciones
resoluciones
observaciones sensibles
temas financieros
temas sancionatorios
temas de seguridad
datos personales
adjuntos internos
```

Por tanto, no deben exponerse públicamente.

---

## 23. Integración con otros módulos

### 23.1. Meetings and Attendance

Se usa para:

```text id="vii8rz"
validar reunión
importar información de reunión
importar agenda
importar asistencia
importar quórum
importar acta preliminar
vincular meeting resolutions
```

---

### 23.2. Voting Basic

Se usa para:

```text id="vwsrcj"
vincular votaciones
importar resultados publicados
incluir tallies agregados
referenciar decisiones aprobadas
no recalcular votos
no exponer voto individual
```

---

### 23.3. Residents and Properties

Se usa para:

```text id="a6tcm4"
validar audiencias por propietarios
validar audiencias por residentes
validar unidades habitacionales
resolver acceso propio
```

---

### 23.4. Users and Roles

Se usa para:

```text id="v2ofk9"
validar usuarios
validar roles
validar permisos
validar aprobadores
validar publicadores
validar audiencia por rol
```

---

### 23.5. Communications and Notifications

Eventos sugeridos:

```text id="ber2dn"
certifiedMinutes.submittedForReview
certifiedMinutes.changesRequested
certifiedMinutes.approved
certifiedMinutes.sealed
certifiedMinutes.published
certifiedMinutes.publicationRevoked
```

Notificaciones sugeridas:

```text id="q9nd34"
Acta enviada a revisión.
Se solicitaron cambios al acta.
Acta aprobada.
Acta publicada.
Publicación de acta revocada.
```

---

### 23.6. Audit

Debe auditar:

```text id="z4wucj"
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
certifiedMinutesSection.created
certifiedMinutesSection.updated
certifiedMinutesSection.reordered
certifiedMinutesSection.archived
certifiedMinutesAttachment.uploaded
certifiedMinutesAttachment.downloaded
certifiedMinutesAttachment.archived
certifiedMinutesArtifact.generated
certifiedMinutesArtifact.downloaded
certifiedMinutesArtifact.archived
```

---

### 23.7. Storage

Se usa para:

```text id="kduqyw"
guardar PDFs
guardar adjuntos
guardar snapshots si aplica
generar URLs temporales
proteger storageKey
calcular hash de artefactos
```

---

## 24. Auditoría

Eventos mínimos:

```text id="yh2gwe"
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

```text id="c3xvc5"
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

```text id="wx20zs"
contenido completo del acta
contenido completo de secciones
contenido completo de adjuntos
storageKey completo si revela ruta sensible
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

## 25. Seguridad

### 25.1. Riesgos principales

| Riesgo                                           | Impacto |
| ------------------------------------------------ | ------- |
| Acta cross-tenant                                | Crítico |
| Reunión cross-tenant                             | Crítico |
| Publicación a audiencia incorrecta               | Alto    |
| Descarga no autorizada de PDF                    | Alto    |
| Modificación de versión sellada                  | Crítico |
| Alteración de contenido posterior al sellado     | Crítico |
| Hash calculado sobre contenido no canonicalizado | Medio   |
| Exposición pública accidental                    | Crítico |
| Logs con contenido de acta                       | Alto    |
| Adjuntos maliciosos                              | Alto    |
| Storage key expuesta                             | Alto    |
| Presentar hash como firma legal                  | Alto    |
| Ejecución automática de resoluciones             | Crítico |
| Omisión de auditoría                             | Alto    |

---

### 25.2. Controles

```text id="cdhg4k"
tenant isolation
permission guards
own-resource guards
audience authorization
state machine
immutable sealed versions
hash canonicalization
safe PDF generation
file validation
storage key protection
temporary signed URLs
audit events
safe logs
safe metrics
no public endpoints
no automatic execution
OpenAPI negative tests
```

---

## 26. Observabilidad

Logs sugeridos:

```text id="ewn4t7"
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

Métricas sugeridas:

```text id="b6n9q1"
certified_minutes_created_total
certified_minutes_submitted_total
certified_minutes_approved_total
certified_minutes_sealed_total
certified_minutes_published_total
certified_minutes_publication_revoked_total
certified_minutes_pdf_generated_total
certified_minutes_downloaded_total
```

Labels permitidos:

```text id="q4h1d6"
status
visibility
certificationMode
artifactType
publicationStatus
accessType
outcome
```

Labels prohibidos:

```text id="n3hq35"
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

## 27. Testing

### 27.1. Unit tests

Probar:

```text id="nf1y5g"
CertifiedMinutes entity
CertifiedMinutesVersion entity
CertifiedMinutesSection entity
CertifiedMinutesApproval entity
CertifiedMinutesAttachment entity
CertifiedMinutesArtifact entity
CertifiedMinutesPublication entity
state machine
hash service
canonicalization service
audience policy
publication policy
storage policy
DTO validation
content sanitization
```

---

### 27.2. Integration tests

Probar:

```text id="fi1k6z"
crear acta
importar desde MeetingMinutes
crear secciones
crear versión
enviar a revisión
aprobar
sellar
generar PDF
publicar
revocar publicación
archivar
subir adjunto
descargar adjunto
descargar PDF
auditoría
notificaciones
storage mock
```

---

### 27.3. API tests

Probar:

```text id="x1s4vy"
endpoints administrativos
endpoints de versiones
endpoints de secciones
endpoints de aprobaciones
endpoints de adjuntos
endpoints de artefactos
endpoints /me
permisos
validaciones
errores
OpenAPI
```

---

### 27.4. Multitenancy tests

Probar:

```text id="x8rh55"
tenant A no ve actas tenant B
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

### 27.5. Own-resource tests

Probar:

```text id="u5amzl"
owner ve acta published para owners
resident ve acta published para residents
usuario no ve acta no publicada
usuario no ve acta de audiencia restringida
usuario no descarga PDF no autorizado
usuario no accede a adjunto restringido
usuario no ve storageKey
```

---

### 27.6. Integrity tests

Probar:

```text id="h7f2tk"
hash reproducible
cambio de contenido cambia hash
versión sellada no editable
PDF generado tiene hash
artefacto descargado conserva hash
sealedAt se registra
sealAlgorithm se registra
```

---

### 27.7. Security tests

Probar:

```text id="l9i445"
no endpoints públicos
no actas cross-tenant
no descargas cross-tenant
no storageKey en response
no contenido completo en logs
no edición de versión sellada
no publicación sin sellado
no PDF oficial desde draft
no ejecución automática de resoluciones
no uso de IA con datos reales
```

---

## 28. Criterios de aceptación globales

La spec se considera implementada si:

* se puede crear un acta certificada desde una reunión;
* se valida tenant en reunión y acta preliminar;
* se impide más de un acta activa principal por reunión;
* se puede importar contenido desde `MeetingMinutes`;
* se pueden gestionar secciones;
* se pueden crear versiones;
* se preservan versiones previas;
* se puede enviar a revisión;
* se puede solicitar cambios;
* se puede aprobar;
* se puede sellar con hash;
* una versión sellada no puede modificarse;
* se puede generar PDF;
* se calcula hash del PDF;
* se pueden adjuntar documentos validados;
* se puede publicar a audiencia autorizada;
* se puede revocar publicación;
* usuarios propios solo ven actas publicadas para su audiencia;
* no existen endpoints públicos;
* no se exponen storage keys;
* no se ejecutan acciones automáticas;
* se auditan operaciones críticas;
* se emiten eventos de notificación;
* logs y métricas son seguros;
* OpenAPI está actualizado;
* pruebas unitarias pasan;
* pruebas de integración pasan;
* pruebas API pasan;
* pruebas multitenant pasan;
* pruebas de integridad pasan;
* pruebas de seguridad pasan;
* CI pasa.

---

## 29. Casos borde

| Caso                                                        | Resultado esperado |
| ----------------------------------------------------------- | ------------------ |
| Crear acta sin `meetingId`                                  | 422                |
| Crear acta con `tenantId` en body                           | 422                |
| Usar `meetingId` de otro tenant                             | 403/404            |
| Usar `sourceMeetingMinutesId` de otro tenant                | 403/404            |
| Crear segunda acta activa para misma reunión                | 409                |
| Editar acta `sealed`                                        | 409                |
| Editar versión `sealed`                                     | 409                |
| Aprobar acta en `draft` sin revisión si política lo prohíbe | 409                |
| Sellar acta no aprobada                                     | 409                |
| Publicar acta no sellada                                    | 409                |
| Publicar sin audiencia                                      | 422                |
| Descargar PDF no generado                                   | 404/409            |
| Descargar PDF sin autorización                              | 403/404            |
| Adjuntar archivo no permitido                               | 422                |
| Adjuntar archivo excede tamaño                              | 413/422            |
| Storage key en response                                     | falla              |
| Log contiene contenido completo                             | falla              |
| Hash no cambia tras modificación                            | falla              |
| Endpoint público de actas                                   | no existe          |
| OpenAPI documenta endpoint público                          | falla              |
| Resultado de acta ejecuta cargo                             | falla              |
| Acta se presenta como firma electrónica legal               | falla              |

---

## 30. Dependencias hacia specs futuras

Este módulo habilita:

```text id="m2vtes"
00X-electronic-signatures
00X-external-timestamping
00X-advanced-voting-rules
00X-weighted-voting
00X-voting-appeals
00X-document-public-verification
00X-ai-assisted-minutes
00X-meeting-recordings
00X-legal-workflows
00X-document-retention-policy
```

---

## 31. Archivos derivados esperados

```text id="y3qmup"
docs/specs/015-certified-minutes/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

---

## 32. Preguntas abiertas

1. ¿El acta formal será obligatoria para toda reunión o solo para asambleas?
2. ¿Quiénes podrán aprobar actas: administrador, directiva, presidente, secretario?
3. ¿Se requiere una sola aprobación o múltiples aprobaciones?
4. ¿El acta debe incluir snapshot de asistencia completo o solo resumen?
5. ¿El acta debe incluir resultados de votación completos o solo resultados aprobados?
6. ¿El PDF debe generarse automáticamente al sellar o manualmente?
7. ¿El acta publicada será visible para propietarios, residentes o ambos?
8. ¿Se permitirá revocar una publicación?
9. ¿Se permitirá publicar una nueva versión corrigiendo una anterior?
10. ¿Se requiere numeración formal de actas por tenant?
11. ¿El código de acta debe ser automático?
12. ¿Se requiere marca de agua en borradores?
13. ¿Los adjuntos serán descargables por usuarios finales?
14. ¿Qué tipos de adjuntos se permitirán?
15. ¿Cuál será el tamaño máximo por adjunto?
16. ¿Se debe registrar cada vista del acta o solo descargas?
17. ¿Se requerirá comparación visual entre versiones?
18. ¿Se debe incluir hash visible en el PDF?
19. ¿Se usará SHA-256 como algoritmo inicial?
20. ¿Cuándo se implementará firma electrónica real?

---

## 33. Decisión inicial para MVP

Para MVP se recomienda:

```text id="k6m7fd"
- Crear actas certificadas vinculadas a reuniones.
- Importar contenido desde MeetingMinutes.
- Gestionar secciones estructuradas.
- Crear versiones.
- Enviar a revisión.
- Aprobar acta con usuario autorizado.
- Solicitar cambios.
- Sellar internamente con hash.
- Usar SHA-256 como algoritmo inicial.
- Generar PDF formal interno.
- Incluir hash visible o referencia de integridad en el PDF.
- Publicar a audiencia autorizada.
- Permitir consulta propia de actas publicadas.
- Permitir descarga propia de PDF publicado.
- Registrar adjuntos con validación básica.
- Auditar operaciones críticas.
- Emitir eventos de notificación.
- No implementar firma electrónica legal.
- No implementar sellado de tiempo externo.
- No implementar certificación notarial.
- No implementar verificación pública.
- No implementar endpoints públicos.
- No ejecutar acciones automáticas desde actas.
- No usar IA externa con actas reales.
```

---

## 34. Conclusión

El módulo `015-certified-minutes` introduce la capacidad de formalizar actas internas de reuniones y asambleas en RESIDENT Core.

Debe implementarse como un módulo:

```text id="y1rx55"
tenant-scoped
meeting-bound
version-controlled
approval-aware
seal-hash-enabled
artifact-aware
publication-controlled
audience-protected
audit-heavy
storage-secure
notification-ready
future-signature-ready
non-public
```

No debe aceptarse una implementación que permita actas cross-tenant, reuniones de otro tenant, edición de versiones selladas, publicación sin sellado, descarga no autorizada, exposición pública, exposición de storage keys, logs con contenido completo, omisión de auditoría, presentación del hash como firma electrónica legal, uso de IA externa con actas reales, generación automática de cargos, generación automática de multas, aprobación automática de resoluciones o ejecución automática de decisiones derivadas del acta.
