# Security Notes — Spec 011 Fines and Sanctions

## 1. Información del documento

| Campo           | Valor                                                                                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                             |
| Spec ID         | 011                                                                                                                                                       |
| Módulo          | Fines and Sanctions                                                                                                                                       |
| Documento       | Security Notes                                                                                                                                            |
| Ruta            | `docs/specs/011-fines-sanctions/security-notes.md`                                                                                                        |
| Versión         | 0.1                                                                                                                                                       |
| Estado          | Borrador inicial                                                                                                                                          |
| Fecha           | 2026-07-19                                                                                                                                                |
| Documento base  | `docs/specs/011-fines-sanctions/spec.md`                                                                                                                  |
| Plan técnico    | `docs/specs/011-fines-sanctions/plan.md`                                                                                                                  |
| Modelo de datos | `docs/specs/011-fines-sanctions/data-model.md`                                                                                                            |
| Contrato API    | `docs/specs/011-fines-sanctions/api-contract.md`                                                                                                          |
| Plan de pruebas | `docs/specs/011-fines-sanctions/test-plan.md`                                                                                                             |
| Tareas          | `docs/specs/011-fines-sanctions/tasks.md`                                                                                                                 |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements`, `007-audit`, `008-basic-reports` |

---

## 2. Propósito

Este documento define las notas de seguridad específicas del módulo `011-fines-sanctions`.

El módulo gestiona multas, sanciones, evidencias, reclamos y cargos asociados dentro de RESIDENT Core. Aunque pertenece al dominio operativo-administrativo, tiene impacto financiero y puede contener información sensible sobre residentes, unidades habitacionales, convivencia, infracciones, evidencias y decisiones administrativas.

Regla central:

```text id="okrh32"
Toda multa debe proteger tenant isolation, autorización por permiso, autorización por recurso propio, confidencialidad de evidencias, integridad financiera, trazabilidad de estados y no exposición pública.
```

---

## 3. Naturaleza de seguridad del módulo

El módulo `Fines and Sanctions` debe tratarse como un módulo transaccional sensible.

Una multa puede contener:

* datos de una unidad habitacional;
* datos de una persona responsable;
* descripción de hechos;
* evidencia fotográfica, documental o textual;
* información de convivencia;
* decisiones administrativas;
* impacto económico;
* cargos financieros;
* reclamos de residentes;
* historial sancionatorio;
* auditoría.

Por tanto, el módulo debe proteger:

```text id="sbesjv"
tenant isolation
own-resource authorization
evidence confidentiality
financial integrity
state integrity
appeal integrity
auditability
privacy preservation
safe logging
no public exposure
```

---

## 4. Principios de seguridad

### 4.1. Tenant isolation obligatorio

Toda entidad del módulo debe pertenecer a un tenant.

Aplica a:

```text id="ohqp8x"
fine_concepts
fines
fine_evidence
fine_appeals
fine_status_history
```

Regla:

```text id="pde8ar"
resource.tenantId == currentTenant.id
```

No se acepta:

```text id="skgo4o"
consultar multa solo por fineId
consultar evidencia solo por evidenceId
consultar reclamo solo por appealId
crear multa con fineConceptId de otro tenant
crear multa con propertyUnitId de otro tenant
crear multa con responsiblePersonId de otro tenant
crear concepto con chargeConceptId de otro tenant
asociar chargeId de otro tenant
mezclar evidencias entre tenants
mezclar reclamos entre tenants
```

---

### 4.2. Keycloak autentica; RESIDENT Core autoriza

La autenticación no es suficiente para operar multas.

Regla:

```text id="jq7o50"
Keycloak autentica la identidad; RESIDENT Core autoriza la acción, el tenant, la unidad, la evidencia, el reclamo y el recurso.
```

El módulo debe validar:

* usuario autenticado;
* tenant activo;
* membership activa;
* permisos funcionales;
* relación usuario-unidad en endpoints `/me`;
* estado del recurso;
* tenant de cada referencia;
* política de evidencia;
* política de reclamo;
* reglas financieras;
* trazabilidad.

---

### 4.3. Autorización por permiso

Cada acción administrativa requiere permiso explícito.

Ejemplos:

```text id="udjcne"
fineConcepts.create
fines.create
fines.approve
fines.issue
fines.waive
fines.reverse
fineEvidence.download
fineAppeals.resolve
```

No se debe inferir permiso por nombre de rol únicamente. Los roles pueden agrupar permisos, pero los guards deben evaluar permisos efectivos dentro del tenant.

---

### 4.4. Autorización por recurso propio

Los endpoints `/me` deben validar ownership o relación activa con la unidad.

Regla conceptual:

```text id="vi7n85"
actorUserId -> personId -> active ownership/residency/lease -> propertyUnitId -> fine
```

Un usuario solo puede consultar o reclamar multas asociadas a unidades donde tenga relación activa y autorizada.

No se acepta:

```text id="zb5yqp"
usuario consulta multa de unidad ajena
usuario reclama multa de unidad ajena
usuario consulta evidencia de multa ajena
usuario lista reclamos de multa ajena
usuario filtra /me/fines por propertyUnitId ajeno
```

---

### 4.5. Confidencialidad de evidencias

Las evidencias deben tratarse como privadas por defecto.

Pueden contener:

* fotografías;
* documentos;
* videos;
* referencias internas;
* información de convivencia;
* identificación indirecta de personas;
* detalles sensibles de incidentes.

Regla:

```text id="k87jt5"
Toda evidencia es privada salvo política explícita que permita verla al usuario autorizado.
```

No se permite:

```text id="d5v99g"
URL pública permanente de evidencia privada
fileUrl privada en listados
archivo completo en logs
archivo completo en audit metadata
descarga sin permiso
descarga sin auditoría
descarga cross-tenant
```

---

### 4.6. Integridad financiera

Las multas pueden generar cargos, pero no procesan pagos.

Regla:

```text id="dvaf4p"
Fines and Sanctions solicita cargos; Financial Management crea cargos; Payments procesa pagos.
```

Prohibido desde este módulo:

```text id="jnrawc"
confirmar pagos
rechazar pagos
asignar pagos
reversar pagos
subir comprobantes
aprobar comprobantes
conciliar banco
modificar account_statements
modificar unit_balances
modificar payment_allocations
```

---

### 4.7. Idempotencia financiera

Una multa no debe generar cargos duplicados.

Controles:

```text id="yjp1jz"
fine.chargeId unique
idempotencyKey = fine:{fineId}:charge
lookup before create
transaction
financial regression tests
```

Regla:

```text id="oyx554"
Una multa monetaria emitida puede tener máximo un cargo activo asociado por el mismo evento sancionatorio.
```

---

### 4.8. Estado controlado

La multa no puede cambiar de estado arbitrariamente.

Deben existir:

* máquina de estados;
* endpoints de acción;
* validación de transición;
* razón obligatoria para acciones críticas;
* historial funcional;
* auditoría.

Transiciones críticas prohibidas:

```text id="tqc087"
rejected -> issued
cancelled -> issued
waived -> issued
reversed -> issued
archived -> approved
issued -> approved
draft -> issued
```

---

### 4.9. No modificación silenciosa de multas emitidas

Una multa emitida tiene impacto administrativo y financiero.

Regla:

```text id="da6fg8"
Una multa emitida no debe modificarse silenciosamente mediante PATCH.
```

Correcciones deben hacerse mediante:

```text id="pdqc4s"
waive
reverse
adjustment financiero
nota administrativa auditada
reclamo resuelto
```

---

### 4.10. Auditoría obligatoria

Toda operación crítica debe generar evento auditable.

Incluye:

```text id="yfnt2e"
crear concepto
actualizar concepto
activar/desactivar concepto
archivar concepto
crear multa
actualizar multa editable
pasar a revisión
aprobar
rechazar
emitir
cancelar
condonar
reversar
archivar
generar cargo
fallar generación de cargo
agregar evidencia
descargar evidencia
archivar evidencia
presentar reclamo
aceptar reclamo
rechazar reclamo
cancelar reclamo
```

---

### 4.11. No exposición pública

Las multas no deben exponerse en WordPress público.

Regla:

```text id="vv0dle"
No debe existir endpoint público para multas, sanciones, evidencias, reclamos, cargos de multa ni historial sancionatorio.
```

Prohibido:

```text id="rabt28"
GET /api/v1/public/tenants/{slug}/fines
GET /api/v1/public/tenants/{slug}/sanctions
GET /api/v1/public/tenants/{slug}/fine-evidence
POST /api/v1/public/tenants/{slug}/fines
POST /api/v1/public/tenants/{slug}/fine-appeals
```

---

## 5. Activos protegidos

### 5.1. Activos operativos

```text id="uu9t59"
fine_concepts
fines
fine_evidence
fine_appeals
fine_status_history
```

---

### 5.2. Activos personales

```text id="vb6d06"
propertyUnitId
propertyUnitCode
responsiblePersonId
title
description
occurredAt
reportedAt
appeal reason
evidence description
review notes
rejection reason
cancellation reason
waiver reason
reversal reason
```

Estos datos pueden revelar información sensible sobre convivencia, hábitos, conflictos, ubicación interna o comportamiento de residentes.

---

### 5.3. Activos financieros

```text id="qkobpo"
defaultAmount
amount
currency
chargeConceptId
chargeId
paymentStatusSnapshot
dueDate
```

Estos campos deben protegerse porque afectan cargos, pagos, estados de cuenta y saldos.

---

### 5.4. Activos documentales y evidencias

```text id="p3snpr"
fileUrl
fileName
mimeType
fileSizeBytes
downloadUrl temporal
evidence metadata
referencias de archivo
descripciones de evidencia
```

---

### 5.5. Activos de trazabilidad

```text id="gcjf2f"
FineStatusHistory
AuditLog
traceId
requestId
correlationId
actorUserId
fromStatus
toStatus
reason
occurredAt
```

---

## 6. Clasificación de datos

### 6.1. Datos administrativos internos

```text id="aw6fdb"
fineId
fineConceptId
propertyUnitId
responsiblePersonId
reportedBy
reviewedBy
approvedBy
rejectedBy
issuedBy
cancelledBy
waivedBy
reversedBy
reviewNotes
internal metadata
status history
audit references
```

Requieren permisos administrativos.

---

### 6.2. Datos propios del residente

Pueden mostrarse en `/me` si el usuario tiene acceso a la unidad:

```text id="t29xmc"
fineId
fineConceptName
propertyUnitId propio
propertyUnitCode propio
title
description autorizada
occurredAt
status
severity
amount
currency
paymentStatusSnapshot
issuedAt
allowsAppeal
appealDeadlineAt
appealStatus
```

---

### 6.3. Datos restringidos para residentes

No deben mostrarse en `/me` salvo política explícita:

```text id="h1ogcf"
reportedBy
reviewedBy
approvedBy
rejectedBy
issuedBy
cancelledBy
waivedBy
reversedBy
reviewNotes
audit metadata
metadata interna
detalles de otros residentes
evidencias con terceros
fileUrl privada
```

---

### 6.4. Datos de evidencia

Las evidencias son privadas por defecto.

Permitido bajo permisos:

```text id="zthnx1"
evidenceId
evidenceType
title
description autorizada
fileName
mimeType
fileSizeBytes
uploadedAt
status
```

Prohibido en listados ordinarios:

```text id="uel1uc"
fileUrl privada
URL firmada completa
rutas internas de storage
tokens de acceso
contenido del archivo
metadata no sanitizada
```

---

### 6.5. Datos públicos

No existen datos públicos de multas en esta spec.

WordPress público no debe recibir:

```text id="nvxvl7"
fineId
fineConcept
propertyUnitId
responsiblePersonId
status
severity
amount
chargeId
paymentStatusSnapshot
evidence
appeals
history
audit
```

---

## 7. Superficies de ataque

### 7.1. Fine Concepts

Endpoints:

```text id="ogpz7j"
GET    /api/v1/tenant/fine-concepts
POST   /api/v1/tenant/fine-concepts
GET    /api/v1/tenant/fine-concepts/{fineConceptId}
PATCH  /api/v1/tenant/fine-concepts/{fineConceptId}
POST   /api/v1/tenant/fine-concepts/{fineConceptId}/activate
POST   /api/v1/tenant/fine-concepts/{fineConceptId}/deactivate
POST   /api/v1/tenant/fine-concepts/{fineConceptId}/archive
```

Riesgos:

* creación de conceptos duplicados;
* uso de concepto financiero de otro tenant;
* monto inválido;
* concepto inactivo usado en multa;
* publicación de configuración interna;
* escalamiento de permisos.

Controles:

```text id="fs516g"
AuthGuard
TenantGuard
PermissionGuard
tenant_id filter
unique tenant_id + code
Decimal money
chargeConcept tenant validation
audit events
safe errors
```

---

### 7.2. Fines administrativas

Endpoints:

```text id="dby26j"
GET    /api/v1/tenant/fines
POST   /api/v1/tenant/fines
GET    /api/v1/tenant/fines/{fineId}
PATCH  /api/v1/tenant/fines/{fineId}
POST   /api/v1/tenant/fines/{fineId}/submit-review
POST   /api/v1/tenant/fines/{fineId}/approve
POST   /api/v1/tenant/fines/{fineId}/reject
POST   /api/v1/tenant/fines/{fineId}/issue
POST   /api/v1/tenant/fines/{fineId}/cancel
POST   /api/v1/tenant/fines/{fineId}/waive
POST   /api/v1/tenant/fines/{fineId}/reverse
POST   /api/v1/tenant/fines/{fineId}/archive
POST   /api/v1/tenant/fines/{fineId}/generate-charge
```

Riesgos:

* multa cross-tenant;
* multa sobre unidad ajena;
* responsable de otro tenant;
* manipulación de estado;
* emisión sin aprobación;
* emisión sin evidencia requerida;
* cargo duplicado;
* modificación silenciosa de emitidas;
* acceso a multas de otros tenants.

Controles:

```text id="znn4r0"
permission guards
tenant validation
property unit validation
responsible person validation
state machine
evidence required policy
reason required policy
Decimal money
idempotent charge generation
status history
audit events
```

---

### 7.3. Fine Evidence

Endpoints:

```text id="rzpbza"
GET    /api/v1/tenant/fines/{fineId}/evidence
POST   /api/v1/tenant/fines/{fineId}/evidence
GET    /api/v1/tenant/fine-evidence/{evidenceId}
GET    /api/v1/tenant/fine-evidence/{evidenceId}/download
POST   /api/v1/tenant/fine-evidence/{evidenceId}/archive
```

Riesgos:

* evidencia de otro tenant;
* evidencia de multa ajena;
* descarga sin permiso;
* URL pública permanente;
* exposición de fileUrl interna;
* archivo malicioso;
* metadata con secretos;
* evidencia en logs.

Controles:

```text id="zxuneg"
FineEvidencePermissionGuard
FineEvidenceAccessService
tenant_id filter
file metadata validation
mimeType allowlist
file size limit
signed URLs
download audit
safe logging
no public fileUrl in list DTO
```

---

### 7.4. Fine Appeals administrativas

Endpoints:

```text id="ed9ko8"
GET    /api/v1/tenant/fines/{fineId}/appeals
GET    /api/v1/tenant/fine-appeals/{appealId}
POST   /api/v1/tenant/fine-appeals/{appealId}/accept
POST   /api/v1/tenant/fine-appeals/{appealId}/reject
POST   /api/v1/tenant/fine-appeals/{appealId}/cancel
```

Riesgos:

* reclamo cross-tenant;
* resolución sin autorización;
* resolución sin motivo;
* cambio incorrecto de estado de multa;
* condonación o reverso sin trazabilidad;
* exposición de reclamos.

Controles:

```text id="kuxv26"
FineAppealPermissionGuard
tenant_id filter
appeal status validation
resolution notes required
state machine
status history
audit events
safe DTOs
```

---

### 7.5. Fines propias `/me`

Endpoints:

```text id="qaeh20"
GET    /api/v1/me/fines
GET    /api/v1/me/fines/{fineId}
GET    /api/v1/me/fines/{fineId}/evidence
POST   /api/v1/me/fines/{fineId}/appeals
```

Riesgos:

* usuario consulta multas de unidad ajena;
* usuario reclama multa ajena;
* usuario ve evidencia restringida;
* usuario deduce datos administrativos internos;
* usuario filtra por propertyUnitId ajeno;
* exposición de datos de terceros.

Controles:

```text id="f1hez5"
OwnFineGuard
FineOwnershipService
property unit access validation
own DTO minimization
evidence access policy
no admin fields in own response
safe 404/403
```

---

### 7.6. Fine Appeals propias `/me`

Endpoints:

```text id="q6ehzg"
GET /api/v1/me/fine-appeals
GET /api/v1/me/fine-appeals/{appealId}
```

Riesgos:

* usuario consulta reclamos ajenos;
* usuario consulta reclamos de otro tenant;
* exposición de resolución administrativa interna.

Controles:

```text id="dp8658"
OwnFineGuard
tenant_id filter
appeal belongs to own fine
own appeal DTO
safe errors
```

---

### 7.7. WordPress público

No deben existir endpoints públicos.

Riesgos si se implementan por error:

* exposición de multas;
* exposición de evidencias;
* exposición de unidades;
* exposición de responsables;
* exposición de montos;
* daño reputacional;
* incumplimiento de privacidad;
* scraping.

Controles:

```text id="uzermu"
no public routes
OpenAPI negative tests
security tests
route registry review
CI gate
```

---

## 8. Amenazas principales

## 8.1. Multa cross-tenant

### Descripción

Un usuario de Tenant A consulta, crea, modifica, emite o reclama multas de Tenant B.

### Impacto

Crítico.

### Controles

```text id="ikcafp"
tenant_id obligatorio
TenantGuard
repository tenant filter
cross-tenant reference validation
multitenancy tests
safe 404/403
```

### Criterio de seguridad

```text id="dkn8h2"
Ningún endpoint debe devolver, modificar o inferir existencia de multas de otro tenant.
```

---

## 8.2. Multa sobre unidad ajena

### Descripción

Un usuario crea una multa o presenta un reclamo usando una unidad habitacional ajena o de otro tenant.

### Impacto

Alto.

### Controles

```text id="v7dtpb"
FinePropertyUnitPort
FineOwnershipService
property unit tenant validation
active relationship validation
own-resource tests
```

---

## 8.3. Persona responsable de otro tenant

### Descripción

Se asocia como responsable a una persona que no pertenece al tenant o no está relacionada con la unidad.

### Impacto

Alto.

### Controles

```text id="uzusct"
FinePersonPort
tenant validation
person-unit relationship validation si aplica
cross-tenant tests
```

---

## 8.4. Exposición de evidencias

### Descripción

Un usuario no autorizado accede a evidencias, URLs internas, archivos o metadata sensible.

### Impacto

Alto / Crítico según contenido.

### Controles

```text id="mwwllh"
FineEvidenceAccessService
fineEvidence.download permission
own evidence policy
signed URLs
no fileUrl in list DTO
download audit
evidence security tests
```

---

## 8.5. Cargo duplicado

### Descripción

Una multa genera más de un cargo financiero por reintento, concurrencia o fallo parcial.

### Impacto

Alto.

### Controles

```text id="hxhzou"
fine.chargeId unique
idempotency key
lookup before create
transaction
financial regression tests
```

---

## 8.6. Uso inseguro de dinero

### Descripción

El módulo usa `float` o `double` para montos de multas.

### Impacto

Alto.

### Controles

```text id="v9y878"
Decimal(12,2)
FineMoney
money as string
DTO validation
financial regression tests
```

---

## 8.7. Manipulación de estados

### Descripción

Un usuario cambia una multa a estado no permitido o evita el flujo de revisión/aprobación/emisión.

### Impacto

Alto.

### Controles

```text id="pnwczq"
FineStateMachineService
action-specific endpoints
no direct status PATCH
permission guards
status history
audit events
state tests
```

---

## 8.8. Emisión sin evidencia requerida

### Descripción

Una multa cuyo concepto exige evidencia se aprueba o emite sin evidencia activa.

### Impacto

Medio / Alto.

### Controles

```text id="v8x8aq"
FinePolicyService
requiresEvidence validation
active evidence count
evidence archived/rejected excluded
approval tests
issue tests
```

---

## 8.9. Reclamo indebido

### Descripción

Un usuario presenta reclamo sobre multa ajena, multa no emitida, multa fuera de plazo o multa con reclamo abierto.

### Impacto

Medio / Alto.

### Controles

```text id="rgrrmr"
FineAppealService
FineOwnershipService
appeal deadline validation
open appeal check
FineStatus validation
appeal tests
```

---

## 8.10. Reverso o condonación sin trazabilidad

### Descripción

Una multa se condona o reversa sin razón, sin historial o sin auditoría.

### Impacto

Alto.

### Controles

```text id="y30ucy"
FineReason
FineStateMachineService
FineStatusHistory
AuditLog
reason required tests
audit tests
```

---

## 8.11. Logs con datos sensibles

### Descripción

Logs contienen evidencia completa, URL firmada, descripción completa sensible, tokens o datos personales extensos.

### Impacto

Alto.

### Controles

```text id="czlawd"
structured logging
metadata minimization
redaction
no file content logging
no signed URL logging
observability tests
```

---

## 8.12. Exposición pública en WordPress

### Descripción

Un endpoint público permite consultar multas, sanciones, evidencias o reclamos.

### Impacto

Crítico.

### Controles

```text id="q6hp42"
no public endpoints
OpenAPI negative tests
route scan
CI security gate
```

---

## 9. Controles por entidad

## 9.1. FineConcept

Debe proteger:

```text id="mr25um"
tenantId
code
defaultAmount
chargeConceptId
requiresEvidence
allowsAppeal
appealDeadlineDays
status
metadata
```

Controles:

* `tenantId` obligatorio;
* `code` único por tenant;
* `chargeConceptId` validado contra tenant;
* `defaultAmount` Decimal;
* `defaultAmount >= 0`;
* `appealDeadlineDays >= 0`;
* concepto archivado no usable;
* auditoría de cambios.

---

## 9.2. Fine

Debe proteger:

```text id="hsdjis"
tenantId
fineConceptId
propertyUnitId
responsiblePersonId
title
description
status
amount
chargeId
paymentStatusSnapshot
dueDate
reviewNotes
rejectionReason
cancellationReason
waiverReason
reversalReason
metadata
```

Controles:

* `tenantId` obligatorio;
* `fineConceptId` del mismo tenant;
* `propertyUnitId` del mismo tenant;
* `responsiblePersonId` del mismo tenant;
* `amount` Decimal;
* `chargeId` único;
* no modificación silenciosa en estados emitidos;
* state machine;
* historial;
* auditoría.

---

## 9.3. FineEvidence

Debe proteger:

```text id="c93olf"
tenantId
fineId
evidenceType
title
description
fileUrl
fileName
mimeType
fileSizeBytes
uploadedBy
metadata
```

Controles:

* `tenantId` obligatorio;
* `fineId` del mismo tenant;
* validación de tipo;
* validación de archivo;
* fileUrl no pública si evidencia privada;
* descarga con permiso;
* URL firmada temporal;
* auditoría de descarga;
* no exposición pública.

---

## 9.4. FineAppeal

Debe proteger:

```text id="rk10vt"
tenantId
fineId
submittedBy
reason
status
resolvedBy
resolution
resolutionNotes
```

Controles:

* `tenantId` obligatorio;
* `fineId` del mismo tenant;
* `submittedBy` autorizado sobre unidad;
* reason obligatorio;
* solo sobre multas `issued`;
* plazo validado;
* no duplicado abierto;
* resolución con notes;
* auditoría.

---

## 9.5. FineStatusHistory

Debe proteger:

```text id="ivf4qk"
tenantId
fineId
fromStatus
toStatus
actorUserId
reason
occurredAt
metadata
```

Controles:

* append-only funcional;
* metadata sanitizada;
* no payload completo;
* no tokens;
* no archivos;
* no datos personales innecesarios;
* no eliminación ordinaria.

---

## 10. Reglas de autorización

### 10.1. Conceptos de multa

| Acción                      | Permiso                |
| --------------------------- | ---------------------- |
| Crear concepto              | `fineConcepts.create`  |
| Consultar conceptos         | `fineConcepts.read`    |
| Actualizar concepto         | `fineConcepts.update`  |
| Activar/desactivar concepto | `fineConcepts.update`  |
| Archivar concepto           | `fineConcepts.archive` |

---

### 10.2. Multas administrativas

| Acción                    | Permiso                |
| ------------------------- | ---------------------- |
| Crear multa               | `fines.create`         |
| Consultar multas          | `fines.read`           |
| Actualizar multa editable | `fines.update`         |
| Pasar a revisión          | `fines.review`         |
| Aprobar                   | `fines.approve`        |
| Rechazar                  | `fines.reject`         |
| Emitir                    | `fines.issue`          |
| Cancelar                  | `fines.cancel`         |
| Condonar                  | `fines.waive`          |
| Reversar                  | `fines.reverse`        |
| Archivar                  | `fines.archive`        |
| Generar cargo             | `fines.generateCharge` |

---

### 10.3. Evidencias

| Acción                             | Permiso                 |
| ---------------------------------- | ----------------------- |
| Agregar evidencia                  | `fineEvidence.create`   |
| Consultar evidencia administrativa | `fineEvidence.read`     |
| Descargar evidencia                | `fineEvidence.download` |
| Archivar evidencia                 | `fineEvidence.archive`  |
| Consultar evidencia propia         | `fineEvidence.read.own` |

---

### 10.4. Reclamos

| Acción                             | Permiso                  |
| ---------------------------------- | ------------------------ |
| Consultar reclamos administrativos | `fineAppeals.read`       |
| Resolver reclamos                  | `fineAppeals.resolve`    |
| Presentar reclamo propio           | `fineAppeals.submit.own` |
| Consultar reclamo propio           | `fineAppeals.read.own`   |

---

### 10.5. Multas propias

| Acción                     | Permiso                 |
| -------------------------- | ----------------------- |
| Consultar multas propias   | `fines.read.own`        |
| Consultar detalle propio   | `fines.read.own`        |
| Consultar evidencia propia | `fineEvidence.read.own` |

---

## 11. Reglas de endpoints `/me`

### 11.1. Validación obligatoria

Todo endpoint `/me` debe validar:

```text id="isoo21"
authenticated user
active tenant membership
required own permission
active relationship with propertyUnitId
fine belongs to allowed propertyUnitId
fine belongs to current tenant
```

---

### 11.2. Datos permitidos en `OwnFineDto`

```text id="rdgkp1"
id
fineConceptName
propertyUnitId propio
propertyUnitCode propio
title
description autorizada
occurredAt
status
severity
amount
currency
paymentStatusSnapshot
issuedAt
allowsAppeal
appealDeadlineAt
appealStatus
```

---

### 11.3. Datos prohibidos en `OwnFineDto`

```text id="gb4tzn"
reportedBy
reviewedBy
approvedBy
rejectedBy
issuedBy
cancelledBy
waivedBy
reversedBy
reviewNotes
metadata interna
audit metadata
evidencia restringida
fileUrl privada
chargeId si la política financiera propia no lo permite
datos de terceros
```

---

## 12. Reglas de evidencias

### 12.1. Evidencia como dato privado

Regla:

```text id="teka05"
Toda evidencia se considera privada hasta que una política explícita permita su visualización.
```

---

### 12.2. Descarga segura

La descarga debe cumplir:

```text id="h2i0yz"
validar tenant
validar permiso
validar acceso al recurso
generar URL temporal o stream controlado
auditar descarga
no exponer ruta interna
no exponer token persistente
```

---

### 12.3. Metadata permitida en DTO ordinario

```text id="pnog9w"
evidenceId
fineId
evidenceType
title
description autorizada
fileName
mimeType
fileSizeBytes
uploadedAt
status
```

---

### 12.4. Metadata prohibida en DTO ordinario

```text id="es2r0q"
fileUrl interna
URL firmada
token de descarga
ruta de bucket
credenciales
hash interno sensible
metadata sin sanitizar
contenido del archivo
```

---

### 12.5. Tipos de archivo

MVP debe definir allowlist de `mimeType`.

Sugerencia inicial:

```text id="n3brvj"
image/jpeg
image/png
image/webp
application/pdf
text/plain
```

Tipos a bloquear por defecto:

```text id="szy46g"
application/x-msdownload
application/x-sh
application/x-bat
application/javascript
text/html
image/svg+xml si no se sanitiza
```

---

### 12.6. Tamaño máximo

Debe existir límite configurable.

Sugerencia MVP:

```text id="quvv8e"
10 MB por evidencia documental o imagen.
```

Videos deben diferirse o manejarse con límites más estrictos y storage dedicado.

---

### 12.7. Evidencias con terceros

Si una evidencia contiene información de terceros, la vista `/me` debe ocultarla o requerir revisión administrativa antes de mostrarla.

Regla:

```text id="ni54qw"
El derecho a reclamar una multa no implica acceso automático a toda evidencia si esta contiene información de terceros.
```

---

## 13. Reglas financieras

### 13.1. Multa monetaria

Una multa monetaria debe cumplir:

```text id="qohht5"
amount > 0
propertyUnitId != null
currency != null
fineConcept.chargeConceptId != null
```

---

### 13.2. Generación de cargo

El cargo se genera mediante `FineChargePort`.

Payload mínimo permitido hacia el puerto financiero:

```text id="bgmm17"
tenantId
fineId
propertyUnitId
chargeConceptId
amount
currency
description
idempotencyKey
actorUserId
traceId
```

No debe incluir:

```text id="lxrzd3"
payment data
receipt files
bank account data
card data
payment allocation instructions
full evidence payload
full appeal payload
```

---

### 13.3. Validación de cargo

El cargo generado debe cumplir:

```text id="er2pwh"
charge.tenantId = fine.tenantId
charge.propertyUnitId = fine.propertyUnitId
charge.sourceType = fine
charge.sourceId = fine.id
```

---

### 13.4. Idempotencia

Controles:

```text id="hjpu4f"
fine.chargeId unique
Idempotency-Key
lookup before create
transaction
financial regression tests
```

Regla:

```text id="iz6v7w"
Si la multa ya tiene chargeId, no se debe crear otro cargo.
```

---

### 13.5. Condonación y reverso

MVP:

```text id="azafhm"
Condonar o reversar una multa no modifica pagos, asignaciones ni estados de cuenta directamente.
```

Cualquier efecto financiero formal debe gestionarse con:

```text id="qeh9br"
charge reversal
charge adjustment
payment reversal
account statement regeneration
financial audit
```

según specs financieras.

---

### 13.6. Reclamo y cargo

Presentar reclamo no revierte automáticamente cargo.

Regla:

```text id="yurdju"
fine.status = disputed no implica charge.status modificado.
```

La resolución del reclamo puede derivar en condonación o reverso, pero el efecto financiero formal no debe ser silencioso.

---

## 14. Reglas de estado

### 14.1. Estados permitidos

```text id="mxecgs"
draft
reported
underReview
approved
rejected
issued
disputed
appealAccepted
appealRejected
waived
cancelled
reversed
archived
```

---

### 14.2. Transiciones permitidas

```text id="te9rdq"
draft -> reported
reported -> underReview
underReview -> approved
reported -> rejected
underReview -> rejected
approved -> issued
draft -> cancelled
reported -> cancelled
underReview -> cancelled
approved -> cancelled
issued -> disputed
disputed -> appealAccepted
disputed -> appealRejected
appealAccepted -> waived
appealAccepted -> reversed
appealRejected -> issued
issued -> waived
disputed -> waived
issued -> reversed
disputed -> reversed
rejected -> archived
cancelled -> archived
waived -> archived
reversed -> archived
issued -> archived
```

---

### 14.3. Transiciones prohibidas críticas

```text id="ieg20l"
rejected -> issued
cancelled -> issued
waived -> issued
reversed -> issued
archived -> approved
issued -> approved
draft -> issued
approved -> disputed
underReview -> issued
```

---

### 14.4. Razones obligatorias

Deben requerir razón:

```text id="gljhox"
reject
cancel
waive
reverse
archive si política lo exige
accept appeal
reject appeal
cancel appeal
```

---

### 14.5. Historial obligatorio

Toda transición debe generar:

```text id="n1qy4d"
FineStatusHistory
AuditLog
```

---

## 15. Reglas de reclamos

### 15.1. Condiciones para presentar reclamo

```text id="n98okb"
fine.status = issued
fineConcept.allowsAppeal = true
actor has access to fine.propertyUnitId
no open appeal exists
submittedAt <= appealDeadlineAt si aplica
```

---

### 15.2. Reclamos abiertos

Estados abiertos:

```text id="i4u9mk"
submitted
underReview
```

MVP:

```text id="cl0d9d"
No permitir más de un reclamo abierto por multa.
```

---

### 15.3. Plazo

Si `appealDeadlineDays` existe:

```text id="te2lbl"
appealDeadlineAt = fine.issuedAt + appealDeadlineDays
```

Regla:

```text id="mt40qq"
submittedAt <= appealDeadlineAt
```

---

### 15.4. Resolución

Aceptar reclamo puede derivar en:

```text id="q61zoq"
appealAccepted
waived
reversed
```

Rechazar reclamo deriva en:

```text id="yphcri"
appealRejected
```

La multa puede volver a `issued` según máquina de estados y política definida.

---

### 15.5. Seguridad del reclamo

No se acepta:

```text id="jgjo0p"
reclamo sin reason
reclamo sobre multa ajena
reclamo sobre multa no emitida
reclamo fuera de plazo
reclamo duplicado abierto
resolución sin notes
resolución sin auditoría
```

---

## 16. Reglas de WordPress

### 16.1. Prohibición de exposición pública

No deben existir endpoints públicos de multas.

Prohibido:

```text id="luy9j3"
GET /api/v1/public/tenants/{slug}/fines
GET /api/v1/public/tenants/{slug}/sanctions
GET /api/v1/public/tenants/{slug}/fine-evidence
GET /api/v1/public/tenants/{slug}/fine-appeals
POST /api/v1/public/tenants/{slug}/fines
POST /api/v1/public/tenants/{slug}/fine-appeals
```

---

### 16.2. WordPress no administra multas

WordPress no debe:

```text id="drmxpd"
crear multas
listar multas
mostrar sanciones
mostrar evidencias
recibir reclamos
descargar archivos
consultar cargos de multas
mostrar historial sancionatorio
```

---

### 16.3. Futuro portal de residentes

La consulta de multas por residentes debe hacerse mediante endpoints autenticados `/me`, no mediante endpoints públicos de WordPress.

Si en el futuro se integra WordPress con SSO:

```text id="eol03m"
WordPress solo debe redirigir o embeber flujo autenticado seguro; no debe recibir datos privados mediante endpoints públicos.
```

---

## 17. Auditoría

### 17.1. Eventos obligatorios

```text id="ojjz7x"
fineConcept.created
fineConcept.updated
fineConcept.activated
fineConcept.deactivated
fineConcept.archived
fine.created
fine.updated
fine.reported
fine.underReview
fine.approved
fine.rejected
fine.issued
fine.disputed
fine.appealAccepted
fine.appealRejected
fine.waived
fine.cancelled
fine.reversed
fine.archived
fine.chargeGenerated
fine.chargeGenerationFailed
fineEvidence.added
fineEvidence.archived
fineEvidence.downloaded
fineAppeal.submitted
fineAppeal.accepted
fineAppeal.rejected
fineAppeal.cancelled
```

---

### 17.2. Metadata permitida

```json id="y6gz3q"
{
  "fineId": "fine_uuid",
  "fineConceptId": "fine_concept_uuid",
  "propertyUnitId": "property_unit_uuid",
  "responsiblePersonId": "person_uuid",
  "fromStatus": "underReview",
  "toStatus": "approved",
  "amount": "25.00",
  "currency": "USD",
  "chargeId": "charge_uuid",
  "reason": "Justificación administrativa.",
  "appealId": "appeal_uuid",
  "evidenceId": "evidence_uuid",
  "traceId": "req_123456"
}
```

---

### 17.3. Metadata prohibida

```text id="q5h7bt"
payload completo
headers completos
Authorization header
cookies
tokens
secretos
API keys
client secrets
archivos completos
contenido binario
URL firmada completa
comprobantes
datos personales innecesarios
detalles extensos de evidencia
full request body
full response body
stack trace
```

---

### 17.4. Descarga de evidencias

Toda descarga debe auditarse.

Evento:

```text id="tju35g"
fineEvidence.downloaded
```

Metadata permitida:

```text id="bcunyy"
tenantId
fineId
evidenceId
actorUserId
traceId
downloadMethod
```

Metadata prohibida:

```text id="ci82ly"
downloadUrl completa
token de URL firmada
archivo
contenido
ruta interna completa si revela infraestructura sensible
```

---

## 18. Logs y métricas

### 18.1. Logs permitidos

```text id="jgn2sp"
traceId
requestId
correlationId
endpoint
action
outcome
status
durationMs
errorCode
severity
category
```

---

### 18.2. Logs prohibidos

```text id="iv5zjb"
Authorization header
cookies
tokens
secretos
file content
fileUrl privada
signedUrl
payload completo
appeal reason completa si contiene datos sensibles
evidence description completa si contiene datos sensibles
reviewNotes completas
stack trace en producción
datos personales extensos
```

---

### 18.3. Métricas permitidas

```text id="a9sn2g"
fines_created_total
fines_approved_total
fines_rejected_total
fines_issued_total
fines_cancelled_total
fines_waived_total
fines_reversed_total
fines_disputed_total
fines_charge_generated_total
fines_charge_generation_failed_total
fine_appeals_submitted_total
fine_evidence_added_total
fine_evidence_downloaded_total
```

---

### 18.4. Labels permitidos

```text id="qqo3zl"
status
action
outcome
severity
category
```

---

### 18.5. Labels prohibidos

```text id="wvxs1v"
tenantId
fineId
fineConceptId
propertyUnitId
personId
userId
chargeId
evidenceId
appealId
traceId
ipAddress
email
phone
documentNumber
```

---

## 19. Errores seguros

### 19.1. Formato estándar

```json id="uywg7q"
{
  "error": {
    "code": "FINE_INVALID_TRANSITION",
    "message": "The requested fine status transition is not allowed.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

### 19.2. No revelar

Los errores no deben revelar:

```text id="tbf3gq"
si una multa ajena existe
si una evidencia ajena existe
si un reclamo ajeno existe
si una unidad ajena existe
si una persona de otro tenant existe
SQL interno
stack trace
estructura interna de storage
URL firmada
tokens
datos personales
detalles de evidencias
```

---

### 19.3. 404 vs 403

Para recursos de otro tenant o recursos ajenos, se permite responder:

```text id="wi0q4n"
404 RESOURCE_NOT_FOUND
```

cuando se quiera reducir enumeración.

Para falta de permisos dentro del mismo tenant, usar:

```text id="rsshdd"
403 FORBIDDEN
```

cuando no revele información sensible.

---

## 20. Seguridad SQL / Prisma

### 20.1. Consultas obligatorias por tenant

Toda consulta debe incluir:

```text id="ccdoip"
tenant_id = currentTenant.id
```

---

### 20.2. Consulta de multa

Prohibido:

```typescript id="gqslxp"
prisma.fine.findUnique({
  where: { id: fineId }
});
```

Permitido:

```typescript id="x7lr7u"
prisma.fine.findFirst({
  where: {
    id: fineId,
    tenantId: currentTenant.id
  }
});
```

---

### 20.3. Consulta de evidencia

Prohibido:

```typescript id="pkjm2x"
prisma.fineEvidence.findUnique({
  where: { id: evidenceId }
});
```

Permitido:

```typescript id="nojgw4"
prisma.fineEvidence.findFirst({
  where: {
    id: evidenceId,
    tenantId: currentTenant.id
  }
});
```

---

### 20.4. Consulta de reclamo

Prohibido:

```typescript id="zo988i"
prisma.fineAppeal.findUnique({
  where: { id: appealId }
});
```

Permitido:

```typescript id="op8bs6"
prisma.fineAppeal.findFirst({
  where: {
    id: appealId,
    tenantId: currentTenant.id
  }
});
```

---

### 20.5. `$queryRaw`

Permitido solo si:

```text id="cx6xqz"
usa parámetros bind
no concatena input del usuario
está encapsulado en repositorio
tiene tests
no expone SQL raw en errores
```

---

## 21. Seguridad de DTOs

### 21.1. Campos prohibidos en body

No aceptar desde cliente:

```text id="u329th"
tenantId
reportedBy
reviewedBy
approvedBy
rejectedBy
issuedBy
cancelledBy
waivedBy
reversedBy
chargeId
paymentStatusSnapshot
createdAt
updatedAt
archivedAt
status en PATCH genérico
```

---

### 21.2. DTO administrativo

Puede incluir más detalle, pero solo con permisos.

Debe evitar:

```text id="mfp0tq"
tokens
fileUrl privada
URL firmada persistente
payload completo
metadata sin sanitizar
detalles financieros innecesarios
```

---

### 21.3. DTO propio

Debe minimizar datos.

No incluir:

```text id="o2m2qo"
reportedBy
reviewedBy
approvedBy
rejectedBy
issuedBy
cancelledBy
waivedBy
reversedBy
reviewNotes
metadata interna
audit metadata
datos de terceros
fileUrl privada
```

---

### 21.4. DTO de evidencia

No incluir `fileUrl` directa salvo que sea URL firmada temporal en endpoint específico de descarga.

Regla:

```text id="ybnohu"
La lista de evidencias no debe ser endpoint de descarga.
```

---

## 22. Seguridad de archivos

### 22.1. Validaciones mínimas

Toda evidencia con archivo debe validar:

```text id="awxaek"
fileName
mimeType
fileSizeBytes
file extension
storage reference
tenant ownership
fine ownership
```

---

### 22.2. Allowlist

Usar allowlist de MIME types.

No permitir por defecto:

```text id="ky8guq"
executables
scripts
HTML activo
SVG no sanitizado
macros
archivos comprimidos con contenido desconocido
```

---

### 22.3. URL firmada

La URL firmada debe:

```text id="sxqr1q"
tener expiración corta
no persistirse como fileUrl fuente
no loguearse
no incluirse en auditoría completa
emitirse solo a usuarios autorizados
```

---

### 22.4. Antivirus / malware scanning

Para MVP puede diferirse, pero si se permite subida binaria real, debe evaluarse:

```text id="v5eab5"
malware scanning
content type validation
file signature validation
storage quarantine
```

---

## 23. Rate limiting

### 23.1. Endpoints administrativos

Aplicar rate limiting estándar para:

```text id="ugwmhs"
crear multas
emitir multas
generar cargos
subir evidencia
descargar evidencia
resolver reclamos
```

---

### 23.2. Endpoints `/me`

Aplicar rate limiting a:

```text id="smqtoi"
listar multas propias
consultar evidencia
presentar reclamos
listar reclamos propios
```

---

### 23.3. Descarga de evidencias

Debe tener límites más estrictos para evitar scraping o descarga masiva.

Sugerencia:

```text id="s3xap9"
rate limit por usuario + tenant + endpoint de descarga
```

---

## 24. Reglas de privacidad

### 24.1. Datos personales indirectos

Una multa puede revelar:

```text id="yd3ep6"
conducta
conflicto vecinal
horarios
eventos
presencia en el conjunto
unidad habitacional
responsable
historial sancionatorio
```

Por tanto:

* no exponer públicamente;
* no incluir en logs extensos;
* no usar en métricas;
* no compartir por WordPress;
* no enviar a IA externa sin anonimización;
* no usar datos reales en tests.

---

### 24.2. Evidencias con terceros

Si una evidencia muestra a terceros, la administración debe poder restringir visualización en `/me`.

Regla MVP:

```text id="lduesd"
La evidencia puede existir para sustento administrativo sin ser necesariamente visible para el residente.
```

---

### 24.3. Minimización

La respuesta `/me` debe contener solo lo necesario para que el usuario conozca la multa y ejerza reclamo.

No debe exponer:

```text id="c2w62z"
historial completo interno
nombres de administradores
metadata de auditoría
evidencias internas
datos de terceros
```

---

## 25. Seguridad con IA

### 25.1. Prohibido enviar a IA externa

No enviar a herramientas de IA externas:

```text id="h2n8qu"
descripciones reales de multas
evidencias reales
fotos reales
videos reales
reclamos reales
datos de unidades
datos personales
documentos privados
audit logs reales
tokens
secretos
```

---

### 25.2. Permitido con anonimización

Puede usarse IA para:

```text id="j9smsd"
generar plantillas ficticias
analizar código
crear tests con datos sintéticos
resumir especificaciones sin datos reales
mejorar documentación técnica
```

---

### 25.3. IA para evidencias

La revisión de evidencias con IA queda fuera del MVP.

Requiere spec futura con:

```text id="r3s5ei"
anonimización
consentimiento
revisión humana
gobierno de datos
retención
explicabilidad
control de sesgos
seguridad de archivos
cumplimiento legal
```

---

## 26. Reglas de retención y eliminación

### 26.1. No eliminación física ordinaria

No eliminar físicamente:

```text id="g5e5as"
fine_concepts
fines
fine_evidence
fine_appeals
fine_status_history
```

---

### 26.2. Archivo lógico

Usar:

```text id="jpnkf1"
archivedAt
status = archived
```

según entidad.

---

### 26.3. Evidencias

Las evidencias pueden requerir reglas de retención separadas.

MVP:

```text id="qakzsl"
Archivar evidencia oculta su uso ordinario, pero no elimina automáticamente el archivo físico.
```

Eliminación física futura debe contemplar:

```text id="dp2te4"
política de retención
cumplimiento legal
auditoría
solicitud de eliminación
backup retention
evidencia necesaria para defensa administrativa
```

---

## 27. Checklist de seguridad para PR

Antes de aprobar un PR de `011-fines-sanctions`:

```text id="nd60ao"
[ ] Todas las tablas nuevas tienen tenant_id.
[ ] Toda consulta filtra por tenant_id.
[ ] No se busca multa solo por fineId.
[ ] No se busca evidencia solo por evidenceId.
[ ] No se busca reclamo solo por appealId.
[ ] No se acepta tenantId desde body.
[ ] fineConceptId se valida contra tenant.
[ ] propertyUnitId se valida contra tenant.
[ ] responsiblePersonId se valida contra tenant.
[ ] chargeConceptId se valida contra tenant.
[ ] chargeId se valida contra tenant.
[ ] Conceptos inactivos no se usan para nuevas multas.
[ ] Conceptos archivados no se usan para nuevas multas.
[ ] Multa monetaria exige propertyUnitId.
[ ] Money usa Decimal.
[ ] Money sale como string.
[ ] No se usa float/double.
[ ] Se valida título obligatorio.
[ ] Se valida descripción obligatoria.
[ ] Se valida evidencia requerida.
[ ] Evidencia archivada no cuenta como activa.
[ ] Evidencia rechazada no cuenta como activa.
[ ] Se valida estado antes de aprobar.
[ ] Se valida estado antes de emitir.
[ ] Se bloquean transiciones inválidas.
[ ] No se permite PATCH de status genérico.
[ ] No se permite chargeId desde body.
[ ] Rechazo requiere razón.
[ ] Cancelación requiere razón.
[ ] Condonación requiere razón.
[ ] Reverso requiere razón.
[ ] Reclamo solo sobre multa issued.
[ ] Reclamo valida allowsAppeal.
[ ] Reclamo valida plazo.
[ ] Reclamo valida unidad propia.
[ ] Reclamo duplicado abierto se bloquea.
[ ] /me valida relación usuario-unidad.
[ ] /me no permite multa ajena.
[ ] /me no muestra datos administrativos internos.
[ ] /me no expone evidencia restringida.
[ ] Evidence download requiere permiso.
[ ] Evidence download se audita.
[ ] No se expone fileUrl privada.
[ ] URL firmada no se persiste como fuente.
[ ] URL firmada no se loguea.
[ ] Metadata de evidencia está sanitizada.
[ ] Cargo se genera de forma idempotente.
[ ] Cargo no se duplica.
[ ] Multas no procesan pagos.
[ ] Multas no modifican comprobantes.
[ ] Multas no modifican payment_allocations.
[ ] Multas no modifican estados de cuenta.
[ ] Multas no modifican unit_balances.
[ ] Condonación no borra cargo automáticamente.
[ ] Reverso no modifica pagos automáticamente.
[ ] Se crea FineStatusHistory.
[ ] Se auditan operaciones críticas.
[ ] Audit metadata está sanitizada.
[ ] Logs no contienen tokens.
[ ] Logs no contienen evidencia completa.
[ ] Logs no contienen datos personales extensos.
[ ] Métricas no usan tenantId.
[ ] Métricas no usan fineId.
[ ] Métricas no usan propertyUnitId.
[ ] Métricas no usan userId/personId.
[ ] WordPress no ve multas.
[ ] No existen endpoints públicos de multas.
[ ] No existen endpoints públicos de evidencias.
[ ] No existen endpoints públicos de reclamos.
[ ] OpenAPI no documenta endpoints públicos de multas.
[ ] Tests unitarios pasan.
[ ] Tests API pasan.
[ ] Tests autorización pasan.
[ ] Tests own-resource pasan.
[ ] Tests multitenant pasan.
[ ] Tests financieros pasan.
[ ] Tests evidencia pasan.
[ ] Tests reclamos pasan.
[ ] Tests seguridad pasan.
[ ] CI pasa.
```

---

## 28. Pruebas de seguridad obligatorias

Deben existir pruebas para:

```text id="g3xzse"
- usuario sin token recibe 401;
- usuario sin permiso recibe 403;
- tenant A no ve conceptos tenant B;
- tenant A no ve multas tenant B;
- tenant A no ve evidencias tenant B;
- tenant A no ve reclamos tenant B;
- tenant A no usa fineConceptId tenant B;
- tenant A no usa propertyUnitId tenant B;
- tenant A no usa responsiblePersonId tenant B;
- tenant A no usa chargeConceptId tenant B;
- tenant A no usa chargeId tenant B;
- usuario no ve multa de unidad ajena;
- usuario no reclama multa de unidad ajena;
- usuario no ve evidencia de multa ajena;
- usuario no ve reclamo ajeno;
- concepto inactivo no permite multa nueva;
- concepto archivado no permite multa nueva;
- multa amount > 0 sin propertyUnitId falla;
- monto negativo falla;
- monto float falla;
- aprobar sin evidencia requerida falla;
- aprobar con evidencia activa pasa;
- evidencia archivada no cuenta como activa;
- evidencia rechazada no cuenta como activa;
- emitir multa no aprobada falla;
- emitir multa aprobada pasa;
- cargo se genera una sola vez;
- Idempotency-Key repetida no duplica cargo;
- multa no confirma pagos;
- multa no asigna pagos;
- multa no modifica comprobantes;
- multa no modifica estados de cuenta;
- condonar no borra cargo;
- reversar no modifica pagos;
- rechazo sin razón falla;
- cancelación sin razón falla;
- condonación sin razón falla;
- reverso sin razón falla;
- reclamo sobre multa no issued falla;
- reclamo fuera de plazo falla;
- reclamo duplicado abierto falla;
- reclamo propio válido pasa;
- resolver reclamo sin notes falla;
- evidencia no se descarga sin permiso;
- evidencia cross-tenant no se descarga;
- fileUrl privada no aparece en listados;
- descarga genera URL temporal;
- descarga se audita;
- logs no contienen tokens;
- logs no contienen evidencia completa;
- audit metadata no contiene payload completo;
- WordPress no tiene endpoints de multas;
- OpenAPI no documenta endpoints públicos de multas.
```

---

## 29. Riesgos residuales aceptados en MVP

| Riesgo                                 | Estado   | Justificación                                |
| -------------------------------------- | -------- | -------------------------------------------- |
| Sin pagos online de multas             | Aceptado | Pagos pertenecen a módulo financiero/pagos   |
| Sin reverso financiero automático      | Aceptado | Evita mutaciones financieras silenciosas     |
| Sin notificaciones automáticas         | Aceptado | Depende de módulo de comunicaciones          |
| Sin PDF formal                         | Aceptado | Requiere módulo documental                   |
| Sin firma electrónica                  | Aceptado | Requiere proveedor y cumplimiento legal      |
| Sin OCR/IA de evidencias               | Aceptado | Requiere gobierno de datos y revisión humana |
| Sin integración con cámaras            | Aceptado | Alto impacto de privacidad                   |
| Sin reincidencia automática            | Aceptado | Requiere reglas avanzadas                    |
| Sin comité/audiencia                   | Aceptado | Flujo legal avanzado fuera de MVP            |
| Sin restricción automática de reservas | Aceptado | Requiere integración adicional con reservas  |
| Sin publicación pública de sanciones   | Aceptado | Alto riesgo reputacional y de privacidad     |

---

## 30. Pendientes de seguridad para specs futuras

### 30.1. `00X-fine-payments`

Debe cubrir:

```text id="rlrrup"
pagos online
webhooks de pasarela
idempotencia financiera reforzada
reintentos
confirmación de pago
seguridad de pasarela
conciliación
reversos
comprobantes
```

---

### 30.2. `00X-fines-notifications`

Debe cubrir:

```text id="xqbk21"
email
WhatsApp
plantillas
datos mínimos
consentimiento
opt-out
rate limiting
logs sanitizados
reintentos
```

---

### 30.3. `00X-fines-pdf-documents`

Debe cubrir:

```text id="auzo8c"
plantillas PDF
versionamiento
almacenamiento privado
firmas
hash documental
auditoría de descarga
retención documental
```

---

### 30.4. `00X-ai-assisted-evidence-review`

Debe cubrir:

```text id="ee748l"
anonimización
clasificación de evidencias
revisión humana obligatoria
explicabilidad
registro de decisiones
sesgos
datos sensibles
cumplimiento
```

---

### 30.5. `00X-fines-advanced-appeals`

Debe cubrir:

```text id="csbcgc"
comité
audiencias
etapas procesales
comparecencias
notificaciones formales
votación
resolución motivada
plazos
evidencia documental
```

---

### 30.6. `00X-fines-reservation-restrictions`

Debe cubrir:

```text id="jm60qn"
bloqueo de reservas por multas pendientes
política por tenant
umbrales
debido proceso
notificaciones
excepciones
auditoría
```

---

## 31. Criterios de aceptación de seguridad

La spec `011-fines-sanctions` cumple seguridad si:

* toda tabla nueva tiene `tenant_id`;
* toda consulta filtra por tenant;
* los endpoints administrativos requieren autenticación, membership y permisos;
* los endpoints `/me` validan relación usuario-unidad;
* un usuario no puede consultar multas ajenas;
* un usuario no puede reclamar multas ajenas;
* un usuario no puede consultar evidencias ajenas;
* una multa no puede usar unidad de otro tenant;
* una multa no puede usar responsable de otro tenant;
* un concepto no puede usar concepto financiero de otro tenant;
* una multa no puede usar cargo de otro tenant;
* una multa monetaria exige unidad;
* los montos usan Decimal y salen como string;
* no se usa float/double;
* la evidencia requerida se valida;
* la evidencia archivada o rechazada no cuenta como activa;
* las evidencias no se descargan sin permiso;
* las evidencias no exponen `fileUrl` privada;
* las descargas se auditan;
* el estado se controla con máquina de estados;
* no se permite `PATCH status` genérico;
* rechazo, cancelación, condonación y reverso requieren razón;
* los reclamos solo se presentan sobre multas emitidas;
* los reclamos validan plazo;
* los reclamos duplicados abiertos se bloquean;
* la generación de cargo es idempotente;
* las multas no procesan pagos;
* las multas no modifican estados de cuenta;
* las condonaciones/reversos no modifican pagos automáticamente;
* toda transición relevante crea historial;
* toda operación crítica se audita;
* logs y métricas están sanitizados;
* no existen endpoints públicos de multas;
* OpenAPI no documenta endpoints públicos de multas;
* pruebas de seguridad pasan;
* CI pasa.

---

## 32. Decisión final de seguridad

El módulo `011-fines-sanctions` será tratado como un módulo transaccional sensible con impacto operativo, personal, probatorio y financiero.

Su seguridad se basa en:

```text id="u3oj41"
tenant isolation
permissioned access
own-resource authorization
property-unit validation
responsible-person validation
evidence confidentiality
state machine enforcement
reason requirements
appeal validation
status history
audit trail
Decimal money
idempotent charge generation
no payment processing
no direct account statement mutation
privacy-preserving DTOs
safe evidence download
safe errors
safe logs
safe metrics
no public WordPress exposure
OpenAPI consistency
CI security gates
```

No se aceptará una implementación si permite multas cross-tenant, asigna multas a unidades ajenas, usa responsables de otro tenant, expone evidencias sin permiso, expone multas en WordPress, genera cargos duplicados, usa float para dinero, procesa pagos directamente, modifica estados de cuenta directamente, elimina historial, modifica silenciosamente multas emitidas, omite auditoría o permite transiciones de estado no autorizadas.
