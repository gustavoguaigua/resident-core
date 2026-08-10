# Security Notes — Spec 014 Voting Basic

## 1. Información del documento

| Campo           | Valor                                                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Proyecto        | RESIDENT Core                                                                                                                              |
| Spec ID         | 014                                                                                                                                        |
| Módulo          | Voting Basic                                                                                                                               |
| Documento       | Security Notes                                                                                                                             |
| Ruta            | `docs/specs/014-voting-basic/security-notes.md`                                                                                            |
| Versión         | 0.1                                                                                                                                        |
| Estado          | needs-review                                                                                                                               |
| Fecha           | 2026-07-20                                                                                                                                 |
| Documento base  | `docs/specs/014-voting-basic/spec.md`                                                                                                      |
| Plan técnico    | `docs/specs/014-voting-basic/plan.md`                                                                                                      |
| Modelo de datos | `docs/specs/014-voting-basic/data-model.md`                                                                                                |
| Contrato API    | `docs/specs/014-voting-basic/api-contract.md`                                                                                              |
| Plan de pruebas | `docs/specs/014-voting-basic/test-plan.md`                                                                                                 |
| Tareas          | `docs/specs/014-voting-basic/tasks.md`                                                                                                     |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `007-audit`, `012-communications-notifications`, `013-meetings-attendance`   |
| Relacionado con | futuras specs de voto ponderado, reglas legales, firma electrónica, actas certificadas, impugnaciones, auditoría verificable e IA asistida |

---

## 2. Propósito

Este documento define las notas de seguridad específicas del módulo `014-voting-basic`.

El módulo gestiona votaciones internas básicas dentro de RESIDENT Core, incluyendo sesiones de votación, preguntas, opciones, elegibles, emisión de voto, prevención de duplicidad, privacidad, cálculo de resultados, publicación controlada y vínculo con resoluciones.

Regla central:

```text id="acg6qj"
Toda votación debe proteger tenant isolation, elegibilidad, privacidad del voto, prevención de duplicados, integridad del resultado, autorización por recurso propio, auditoría y ausencia de exposición pública.
```

---

## 3. Naturaleza de seguridad del módulo

El módulo `Voting Basic` debe considerarse sensible porque administra decisiones internas de conjuntos residenciales.

Puede contener:

```text id="n3ncng"
decisiones comunitarias
preguntas de asamblea
opciones de votación
votantes elegibles
propietarios
residentes
unidades habitacionales
representantes por proxy
participación individual
opción votada
resultados agregados
vínculos con resoluciones
eventos auditables
datos usados en actas
datos usados en reportes
```

Por tanto, debe proteger:

```text id="ocw21l"
tenant isolation
voter eligibility
own-resource access
vote confidentiality
duplicate vote prevention
voting window integrity
voting state integrity
result calculation integrity
result publication control
proxy validation
audit trail
safe notifications
safe logs
safe metrics
no public exposure
no automatic legal or financial execution
```

---

## 4. Principios de seguridad

### 4.1. Tenant isolation obligatorio

Todas las tablas del módulo deben contener `tenant_id`.

Aplica a:

```text id="mr669a"
voting_sessions
ballot_questions
ballot_options
eligible_voters
vote_casts
voting_tallies
voting_results
voting_resolution_links
```

Regla obligatoria:

```text id="vpr673"
resource.tenantId == currentTenant.id
```

No se acepta:

```text id="cfxbg1"
consultar votingSession solo por id
consultar ballotQuestion solo por id
consultar ballotOption solo por id
consultar eligibleVoter solo por id
consultar voteCast solo por id
consultar votingResult solo por id
consultar votingResolutionLink solo por id
usar meetingId de otro tenant
usar userId de otro tenant
usar personId de otro tenant
usar propertyUnitId de otro tenant
usar roleId de otro tenant
usar proxyId de otro tenant
usar meetingResolutionId de otro tenant
```

---

### 4.2. Keycloak autentica; RESIDENT Core autoriza

La autenticación no otorga derecho a votar.

Regla:

```text id="j1u4mt"
Keycloak autentica la identidad; RESIDENT Core autoriza tenant, membership, permiso, elegibilidad, audiencia, recurso propio, estado, ventana y regla de negocio.
```

El módulo debe validar:

```text id="wy2y05"
usuario autenticado
usuario activo
membership activa
tenant activo
permiso funcional
acceso al recurso
elegibilidad para votar
relación usuario-persona-unidad
estado de votación
ventana de votación
modo de privacidad
política de proxy
política de publicación
```

---

### 4.3. Ninguna votación pública en MVP

MVP no expone votaciones en `/api/v1/public`.

Rutas prohibidas:

```text id="ho9xsb"
GET  /api/v1/public/tenants/{slug}/voting-sessions
GET  /api/v1/public/tenants/{slug}/voting-sessions/{votingSessionId}
GET  /api/v1/public/tenants/{slug}/voting-sessions/{votingSessionId}/results
POST /api/v1/public/tenants/{slug}/voting-sessions/{votingSessionId}/vote
GET  /api/v1/public/tenants/{slug}/votes
GET  /api/v1/public/tenants/{slug}/results
```

Cualquier publicación pública futura de resultados o consultas de votación requiere spec separada.

---

### 4.4. Endpoints `/me` con minimización

Los endpoints `/me` deben devolver solo información propia del usuario autenticado.

Regla conceptual:

```text id="g9l15z"
actorUserId -> personIds -> propertyUnitIds -> roleIds -> eligibleVoters -> votingSession
```

Un usuario final no debe recibir:

```text id="yts9nj"
lista completa de elegibles
votos de terceros
opciones votadas por terceros
metadatos internos
auditoría
resultados no publicados
resoluciones no autorizadas
datos de unidades ajenas
datos de personas ajenas
```

---

### 4.5. Elegibilidad explícita

No existe voto válido sin elegibilidad.

Regla:

```text id="ggfnno"
voteCast solo puede crearse si existe eligibleVoter activo, tenant-scoped y relacionado con el actor.
```

Un actor solo puede votar si representa legítimamente al elegible mediante:

```text id="amsgsx"
su usuario
su persona vinculada
su unidad habitacional
su rol
su relación de propietario
su relación de residente permitida
un proxy aprobado
```

---

### 4.6. Prevención de voto duplicado

El sistema debe impedir votos duplicados activos por:

```text id="fpwmgn"
tenantId + votingSessionId + ballotQuestionId + eligibleVoterId
```

Debe aplicarse en dos capas:

```text id="o1pcwv"
servicio de dominio
índice único parcial en base de datos
```

---

### 4.7. Privacidad del voto por modo

Modos MVP:

```text id="x36lv2"
identified
secretBasic
```

En `identified`:

```text id="tu2vc8"
la opción votada puede consultarse con permiso explícito;
debe auditarse el acceso;
no debe exponerse en /me de terceros;
no debe ir a logs completos.
```

En `secretBasic`:

```text id="vnegy7"
la opción votada no debe exponerse en DTOs administrativos estándar;
la opción votada no debe exponerse en endpoints /me;
la opción votada no debe incluirse en logs;
la opción votada no debe incluirse en audit metadata;
los resultados publicados deben ser agregados;
no se promete anonimato criptográfico fuerte.
```

Advertencia obligatoria:

```text id="v8f77a"
secretBasic no equivale a votación anónima criptográfica, verificable ni legalmente certificada.
```

---

### 4.8. Ventana de votación

Solo se puede votar cuando:

```text id="umry3s"
votingSession.status = open
AND now >= opensAt si opensAt existe
AND now <= closesAt si closesAt existe y la política usa límite inclusivo
```

No se acepta votar en:

```text id="bk2uv7"
draft
scheduled
closed
resultsCalculated
resultsPublished
cancelled
archived
```

---

### 4.9. Resultados determinísticos

El cálculo de resultados debe ser reproducible desde datos persistidos.

Regla:

```text id="t0j1m9"
calculate-results lee votos válidos y genera tallies/resultados; no crea, elimina ni modifica votos.
```

No debe:

```text id="go0ghn"
modificar vote_casts
modificar eligible_voters salvo actualización de estado controlada si la política lo define
crear cargos
crear multas
aprobar resoluciones
firmar actas
ejecutar acciones legales
```

---

### 4.10. No ejecución automática

Un resultado aprobado no ejecuta acciones automáticas.

Prohibido:

```text id="hc8wsz"
generar cargos financieros
generar multas
modificar presupuestos
modificar reglamentos
activar contratos
firmar actas
aprobar resoluciones automáticamente
cerrar procesos legales
notificar a entidades externas sin flujo explícito
```

---

### 4.11. Auditoría obligatoria

Toda operación crítica debe auditarse.

Eventos mínimos:

```text id="tpr3fl"
votingSession.created
votingSession.updated
votingSession.scheduled
votingSession.opened
votingSession.closed
votingSession.cancelled
votingSession.archived
ballotQuestion.created
ballotQuestion.updated
ballotQuestion.archived
ballotOption.created
ballotOption.updated
ballotOption.archived
eligibleVoter.added
eligibleVoters.resolved
eligibleVoter.updated
eligibleVoter.excluded
eligibleVoter.archived
voteCast.cast
voteCast.cancelled
votingResults.calculated
votingResults.published
votingResult.linkedToResolution
```

---

## 5. Activos protegidos

### 5.1. Activos de sesión de votación

```text id="qa7wfb"
voting_sessions.title
voting_sessions.description
voting_sessions.meetingId
voting_sessions.status
voting_sessions.visibility
voting_sessions.votingMode
voting_sessions.privacyMode
voting_sessions.eligibilityMode
voting_sessions.votingRule
voting_sessions.opensAt
voting_sessions.closesAt
voting_sessions.resultsCalculatedAt
voting_sessions.resultsPublishedAt
voting_sessions.metadata
```

---

### 5.2. Activos de preguntas

```text id="ydvdhi"
ballot_questions.title
ballot_questions.description
ballot_questions.questionType
ballot_questions.minSelections
ballot_questions.maxSelections
ballot_questions.allowAbstention
ballot_questions.status
```

---

### 5.3. Activos de opciones

```text id="a1gdd2"
ballot_options.label
ballot_options.description
ballot_options.optionType
ballot_options.isAbstention
```

---

### 5.4. Activos de elegibles

```text id="rskqii"
eligible_voters.voterType
eligible_voters.userId
eligible_voters.personId
eligible_voters.propertyUnitId
eligible_voters.roleId
eligible_voters.proxyId
eligible_voters.eligibilitySource
eligible_voters.weight
eligible_voters.status
```

---

### 5.5. Activos de votos

```text id="w8tlxe"
vote_casts.eligibleVoterId
vote_casts.voterUserId
vote_casts.voterPersonId
vote_casts.voterPropertyUnitId
vote_casts.selectedOptionId
vote_casts.selectedOptionIds
vote_casts.voteHash
vote_casts.status
vote_casts.castAt
vote_casts.cancelledAt
vote_casts.cancellationReason
```

---

### 5.6. Activos de resultados

```text id="me11et"
voting_tallies.totalVotes
voting_tallies.weightedTotal
voting_tallies.percentage
voting_results.resultStatus
voting_results.winningOptionId
voting_results.totalEligible
voting_results.totalVotes
voting_results.totalAbstentions
voting_results.participationPercentage
voting_results.requiredThreshold
voting_results.thresholdMet
voting_results.publishedAt
```

---

### 5.7. Activos de vínculo con resolución

```text id="kp60lj"
voting_resolution_links.votingSessionId
voting_resolution_links.ballotQuestionId
voting_resolution_links.votingResultId
voting_resolution_links.meetingResolutionId
voting_resolution_links.linkedBy
voting_resolution_links.linkedAt
```

---

## 6. Clasificación de datos

### 6.1. Datos administrativos internos

```text id="mkfixa"
sesiones de votación
preguntas
opciones
elegibles completos
configuración de privacidad
ventanas de votación
reglas de votación
resultados no publicados
auditoría
```

---

### 6.2. Datos propios del usuario

```text id="rz281b"
votaciones donde es elegible
preguntas y opciones disponibles
estado de participación propia
confirmación de voto emitido
resultados publicados para su audiencia
```

---

### 6.3. Datos sensibles

```text id="pqf4rq"
selectedOptionId
selectedOptionIds
eligibleVoterId
voterUserId
voterPersonId
voterPropertyUnitId
proxyId
participación individual
relación usuario-persona-unidad
resultados antes de publicación
```

---

### 6.4. Datos prohibidos en endpoints públicos

```text id="y5m50o"
votingSessions
ballotQuestions
ballotOptions
eligibleVoters
voteCasts
selectedOptionId
selectedOptionIds
votingTallies
votingResults
votingResolutionLinks
auditoría
metadata interna
IDs internos sensibles
```

---

## 7. Superficies de ataque

### 7.1. Voting Sessions administrativas

Endpoints:

```text id="c3srt1"
GET    /api/v1/tenant/voting-sessions
POST   /api/v1/tenant/voting-sessions
GET    /api/v1/tenant/voting-sessions/{votingSessionId}
PATCH  /api/v1/tenant/voting-sessions/{votingSessionId}
POST   /api/v1/tenant/voting-sessions/{votingSessionId}/schedule
POST   /api/v1/tenant/voting-sessions/{votingSessionId}/open
POST   /api/v1/tenant/voting-sessions/{votingSessionId}/close
POST   /api/v1/tenant/voting-sessions/{votingSessionId}/cancel
POST   /api/v1/tenant/voting-sessions/{votingSessionId}/archive
```

Riesgos:

```text id="a2stvx"
votación cross-tenant
asociación con meeting de otro tenant
transición inválida
apertura sin elegibles
apertura sin preguntas/opciones
cancelación maliciosa
archivo malicioso
publicación accidental de datos
```

Controles:

```text id="ru93he"
AuthGuard
TenantGuard
TenantPermissionGuard
VotingPermissionGuard
tenant_id filter
state machine
meeting tenant validation
DTO allowlist
audit events
safe errors
```

---

### 7.2. Ballot Questions

Riesgos:

```text id="ngs9tf"
pregunta cross-tenant
pregunta asociada a sesión ajena
inyección de contenido
edición en sesión abierta
orden duplicado
configuración inválida de multipleChoice
```

Controles:

```text id="r7pdmw"
tenant validation
state validation
content sanitization
unique order
question type validation
audit events
```

---

### 7.3. Ballot Options

Riesgos:

```text id="j22dw6"
opción cross-tenant
opción de pregunta ajena
opción duplicada
segunda abstención
opción manipulada después de apertura
inyección en label/description
```

Controles:

```text id="zmm10r"
tenant validation
question validation
unique order
unique abstention
label sanitization
session editable validation
audit events
```

---

### 7.4. Eligible Voters

Riesgos:

```text id="exbxwk"
elegible cross-tenant
userId de otro tenant
personId de otro tenant
propertyUnitId de otro tenant
roleId de otro tenant
proxyId de otro tenant
elegible duplicado
residente habilitado indebidamente
proxy no aprobado usado para votar
```

Controles:

```text id="esgm0t"
VotingEligibilityPolicy
tenant validation
own-resource validation
reference validation
feature flags
duplicate prevention
proxy approved validation
audit events
```

---

### 7.5. Vote Casting

Riesgos:

```text id="t0lqf3"
voto duplicado
voto de no elegible
voto fuera de ventana
voto en sesión cerrada
voto por unidad ajena
voto por persona ajena
voto con proxy no aprobado
opción de otra pregunta
opción de otro tenant
filtración de selectedOptionId
condición de carrera
```

Controles:

```text id="yhs68o"
VoteCastingGuard
VotingWindowPolicy
VotingEligibilityPolicy
VotingOwnResourcePolicy
VoteDuplicatePolicy
unique partial index
transaction boundary
safe DTO
privacy policy
audit sanitization
```

---

### 7.6. Results

Riesgos:

```text id="m8ugzd"
resultado incorrecto
cálculo con votos de otro tenant
cálculo con votos anulados
cálculo modifica votos
publicación sin cálculo
publicación a audiencia incorrecta
identidades filtradas en secretBasic
```

Controles:

```text id="tlczwe"
VotingTallyService determinístico
tenant-scoped reads
cancelled vote exclusion
Decimal
publication permission
privacy mode enforcement
audit events
```

---

### 7.7. Resolution Link

Riesgos:

```text id="rymuxj"
vincular resultado con resolución de otro tenant
vincular con resolución de otra reunión
crear resolución automáticamente
aprobar resolución automáticamente
ejecutar acción administrativa desde resultado
```

Controles:

```text id="pqsp5f"
VotingResolutionLinkPolicy
meeting tenant validation
same meeting validation
no automatic execution
audit event
safe DTO
```

---

### 7.8. Endpoints `/me`

Riesgos:

```text id="idjlbb"
usuario ve votación ajena
usuario ve votos de terceros
usuario usa eligibleVoterId ajeno
usuario vota por unidad ajena
usuario vota por persona ajena
usuario ve resultados no publicados
usuario ve selectedOptionId en secretBasic
```

Controles:

```text id="hygbe6"
OwnVotingGuard
EligibleVoterGuard
VoteCastingGuard
person/propertyUnit resolution
safe own DTOs
privacy mode enforcement
no third-party exposure
```

---

## 8. Amenazas principales

## 8.1. Votación cross-tenant

### Descripción

Un usuario de Tenant A consulta, modifica, abre, cierra, cancela o publica resultados de una votación de Tenant B.

### Impacto

Crítico.

### Controles

```text id="ypsrk4"
tenant_id obligatorio
TenantGuard
repositorios con tenantId
tests multitenant
safe 404/403
```

### Criterio

```text id="viiuon"
Ningún endpoint debe devolver ni modificar votaciones de otro tenant.
```

---

## 8.2. Elegible cross-tenant

### Descripción

Un administrador agrega como elegible a un usuario, persona, unidad, rol o proxy de otro tenant.

### Impacto

Crítico.

### Controles

```text id="af0hsh"
VotingUserDirectoryPort
VotingPersonDirectoryPort
VotingPropertyUnitPort
VotingRoleDirectoryPort
VotingProxyPort
reference tenant validation
cross-tenant tests
```

---

## 8.3. Voto duplicado

### Descripción

El mismo elegible emite más de un voto activo para la misma pregunta.

### Impacto

Crítico.

### Controles

```text id="tv1ya4"
VoteDuplicatePolicy
transaction
unique partial index
idempotency key si aplica
concurrency tests
```

---

## 8.4. Voto de usuario no elegible

### Descripción

Un usuario autenticado, pero no elegible, emite voto.

### Impacto

Alto.

### Controles

```text id="xfnvva"
EligibleVoterGuard
VotingEligibilityPolicy
own-resource resolution
tests de elegibilidad
```

---

## 8.5. Voto por unidad ajena

### Descripción

Un usuario emite voto usando una unidad que no le pertenece o no representa.

### Impacto

Alto.

### Controles

```text id="md3g6l"
actor property unit resolution
ownership/residency validation
OwnVotingGuard
own-resource tests
```

---

## 8.6. Voto con proxy no aprobado

### Descripción

Un representante intenta votar usando un proxy `submitted`, `rejected`, `cancelled` o `archived`.

### Impacto

Alto.

### Controles

```text id="x8v6a4"
proxy.status = approved
proxy tenant validation
proxy meeting validation
VotingProxyPort
proxy tests
```

---

## 8.7. Fuga de voto en `secretBasic`

### Descripción

El sistema expone `selectedOptionId`, `selectedOptionIds` o la opción votada en endpoints, logs, auditoría o métricas.

### Impacto

Alto.

### Controles

```text id="h4irdg"
VotingPrivacyService
DTO separado
audit sanitizer
log sanitizer
metrics label denylist
privacy tests
```

---

## 8.8. Resultado incorrecto

### Descripción

El cálculo incluye votos cancelados, votos de otro tenant, duplicados o abstenciones mal tratadas.

### Impacto

Alto.

### Controles

```text id="x27me9"
VotingTallyService
tenant-scoped queries
status filtering
Decimal
scenario tests
```

---

## 8.9. Publicación pública accidental

### Descripción

Resultados o votaciones se exponen bajo endpoints públicos.

### Impacto

Crítico.

### Controles

```text id="ghkl70"
no public routes
OpenAPI negative tests
routing negative tests
security tests
CI gate
```

---

## 8.10. Ejecución automática indebida

### Descripción

Un resultado aprobado genera cargos, multas, aprobaciones o cambios legales sin flujo explícito.

### Impacto

Crítico.

### Controles

```text id="x573nm"
VotingNoAutomaticExecutionPolicy
no integration direct action
resolution link only
audit
tests de no ejecución
```

---

## 9. Controles por entidad

## 9.1. `VotingSession`

Controles:

```text id="fkqesg"
tenantId obligatorio
meetingId validado contra tenant
estado controlado por state machine
status no aceptado en PATCH genérico
privacyMode explícito
eligibilityMode explícito
votingRule explícita
opensAt/closesAt validados
cancel requiere reason
open requiere preguntas, opciones y elegibles
resultsCalculatedAt solo por servicio de resultados
resultsPublishedAt solo por publicación controlada
metadata sanitizada
auditoría por transición
```

---

## 9.2. `BallotQuestion`

Controles:

```text id="q4pcik"
tenantId obligatorio
votingSessionId del mismo tenant
order único por sesión
title obligatorio
questionType permitido
minSelections/maxSelections coherentes
no edición en sesión open/closed/cancelled/archived
contenido sanitizado
auditoría
```

---

## 9.3. `BallotOption`

Controles:

```text id="w2ggsl"
tenantId obligatorio
ballotQuestionId del mismo tenant
order único por pregunta
label obligatorio
label sanitizado
máximo una abstención por pregunta
optionType coherente con questionType
no edición en sesión open/closed/cancelled/archived
auditoría
```

---

## 9.4. `EligibleVoter`

Controles:

```text id="ttadd4"
tenantId obligatorio
votingSessionId del mismo tenant
voterType determina referencia requerida
userId/personId/propertyUnitId/roleId/proxyId del mismo tenant
resident requiere feature flag
proxyRepresentative requiere proxy approved
weight no negativo
no duplicar elegible activo
status controlado
auditoría
```

---

## 9.5. `VoteCast`

Controles:

```text id="e8k9rq"
tenantId obligatorio
votingSessionId del mismo tenant
ballotQuestionId de la sesión y tenant
eligibleVoterId de la sesión y tenant
votingSession.status = open
question.status = active
ventana válida
selectedOptionId de la pregunta y tenant
selectedOptionIds solo opciones de la pregunta y tenant
no duplicar voto activo
cancel requiere reason
secretBasic oculta selectedOptionId
auditoría sanitizada
```

---

## 9.6. `VotingTally`

Controles:

```text id="l05y09"
tenantId obligatorio
votingSessionId del mismo tenant
ballotQuestionId del mismo tenant
ballotOptionId del mismo tenant si existe
totalVotes no negativo
weightedTotal no negativo
percentage entre 0 y 100
Decimal para porcentajes y pesos
se calcula desde votos válidos
no modifica votos
```

---

## 9.7. `VotingResult`

Controles:

```text id="mkg15p"
tenantId obligatorio
votingSessionId del mismo tenant
ballotQuestionId del mismo tenant
winningOptionId de la pregunta si existe
totalEligible no negativo
totalVotes no negativo
totalAbstentions no negativo
participationPercentage entre 0 y 100
requiredThreshold entre 0 y 100
publishedAt solo por publicación autorizada
no exposición pública
no ejecución automática
```

---

## 9.8. `VotingResolutionLink`

Controles:

```text id="vdp1jt"
tenantId obligatorio
votingSessionId del mismo tenant
ballotQuestionId del mismo tenant
votingResultId del mismo tenant
meetingResolutionId del mismo tenant
si hay meetingId, resolución de la misma reunión
linkedBy usuario del tenant
no crea resolución
no aprueba resolución
no ejecuta acción automática
auditoría
```

---

## 10. Reglas de autorización

### 10.1. Voting Sessions

| Acción            | Permiso                   |
| ----------------- | ------------------------- |
| Crear sesión      | `votingSessions.create`   |
| Consultar sesión  | `votingSessions.read`     |
| Actualizar sesión | `votingSessions.update`   |
| Programar sesión  | `votingSessions.schedule` |
| Abrir sesión      | `votingSessions.open`     |
| Cerrar sesión     | `votingSessions.close`    |
| Cancelar sesión   | `votingSessions.cancel`   |
| Archivar sesión   | `votingSessions.archive`  |

---

### 10.2. Questions

| Acción              | Permiso                   |
| ------------------- | ------------------------- |
| Crear pregunta      | `ballotQuestions.create`  |
| Consultar pregunta  | `ballotQuestions.read`    |
| Actualizar pregunta | `ballotQuestions.update`  |
| Archivar pregunta   | `ballotQuestions.archive` |

---

### 10.3. Options

| Acción            | Permiso                 |
| ----------------- | ----------------------- |
| Crear opción      | `ballotOptions.create`  |
| Consultar opción  | `ballotOptions.read`    |
| Actualizar opción | `ballotOptions.update`  |
| Archivar opción   | `ballotOptions.archive` |

---

### 10.4. Eligible Voters

| Acción              | Permiso                  |
| ------------------- | ------------------------ |
| Crear elegible      | `eligibleVoters.create`  |
| Consultar elegibles | `eligibleVoters.read`    |
| Resolver elegibles  | `eligibleVoters.resolve` |
| Actualizar elegible | `eligibleVoters.update`  |
| Excluir elegible    | `eligibleVoters.exclude` |
| Archivar elegible   | `eligibleVoters.archive` |

---

### 10.5. Votes

| Acción                          | Permiso            |
| ------------------------------- | ------------------ |
| Emitir voto propio              | `votes.cast.own`   |
| Consultar voto propio           | `votes.read.own`   |
| Consultar votos administrativos | `votes.read`       |
| Anular voto                     | `votes.cancel`     |
| Consultar auditoría de voto     | `votes.audit.read` |

---

### 10.6. Results

| Acción                               | Permiso                        |
| ------------------------------------ | ------------------------------ |
| Calcular resultados                  | `votingResults.calculate`      |
| Consultar resultados administrativos | `votingResults.read`           |
| Consultar resultados propios         | `votingResults.read.own`       |
| Publicar resultados                  | `votingResults.publish`        |
| Vincular resultado a resolución      | `votingResults.linkResolution` |

---

## 11. Reglas para endpoints `/me`

### 11.1. Mis votaciones

Debe validar:

```text id="mjqho4"
usuario autenticado
membership activa
tenant activo
permiso own
votación del tenant
usuario elegible o audiencia autorizada
```

---

### 11.2. Mis preguntas

Debe validar:

```text id="egq7kf"
votingSession accesible por el actor
preguntas del mismo tenant
opciones del mismo tenant
no devolver metadata interna
no devolver datos de elegibles
no devolver votos de terceros
```

---

### 11.3. Mi participación

Debe validar:

```text id="rsdcgb"
eligibleVoter pertenece al actor
eligibleVoter pertenece al tenant
voteCast pertenece al eligibleVoter
en secretBasic no devolver selectedOptionId
en identified devolver opción propia solo si política lo permite
```

---

### 11.4. Emitir voto propio

Debe validar:

```text id="dq6orc"
votingSession.status = open
now dentro de ventana
question.status = active
eligibleVoter.status = eligible
eligibleVoter pertenece al actor
opción pertenece a la pregunta
no existe voto activo previo
proxy approved si aplica
```

---

### 11.5. Resultados propios

Debe validar:

```text id="s91wrh"
resultados publicados
usuario pertenece a audiencia autorizada
no mostrar identidades
no mostrar votos individuales
no mostrar selectedOptionId por votante
```

---

## 12. Reglas de endpoints públicos

### 12.1. Permitidos

En MVP:

```text id="epx4kv"
Ninguno.
```

---

### 12.2. Prohibidos

```text id="b66qf1"
GET  /api/v1/public/tenants/{slug}/voting-sessions
GET  /api/v1/public/tenants/{slug}/voting-sessions/{votingSessionId}
GET  /api/v1/public/tenants/{slug}/voting-sessions/{votingSessionId}/results
POST /api/v1/public/tenants/{slug}/voting-sessions/{votingSessionId}/vote
GET  /api/v1/public/tenants/{slug}/votes
GET  /api/v1/public/tenants/{slug}/results
```

---

### 12.3. OpenAPI

OpenAPI no debe documentar rutas públicas de votación.

Cualquier aparición debe hacer fallar CI.

---

## 13. Seguridad SQL / Prisma

### 13.1. Consulta de sesión de votación

Prohibido:

```typescript id="nmiykj"
await prisma.votingSession.findUnique({
  where: { id: votingSessionId }
});
```

Permitido:

```typescript id="xj0bag"
await prisma.votingSession.findFirst({
  where: {
    id: votingSessionId,
    tenantId: currentTenant.id,
    archivedAt: null
  }
});
```

---

### 13.2. Consulta de pregunta

Prohibido:

```typescript id="dvftqq"
await prisma.ballotQuestion.findUnique({
  where: { id: questionId }
});
```

Permitido:

```typescript id="wg7hpw"
await prisma.ballotQuestion.findFirst({
  where: {
    id: questionId,
    tenantId: currentTenant.id,
    archivedAt: null
  }
});
```

---

### 13.3. Consulta de opción

Prohibido:

```typescript id="xst7mu"
await prisma.ballotOption.findUnique({
  where: { id: optionId }
});
```

Permitido:

```typescript id="efs88o"
await prisma.ballotOption.findFirst({
  where: {
    id: optionId,
    tenantId: currentTenant.id,
    archivedAt: null
  }
});
```

---

### 13.4. Consulta de elegible

Prohibido:

```typescript id="vyvko8"
await prisma.eligibleVoter.findUnique({
  where: { id: eligibleVoterId }
});
```

Permitido:

```typescript id="hlpacj"
await prisma.eligibleVoter.findFirst({
  where: {
    id: eligibleVoterId,
    tenantId: currentTenant.id,
    archivedAt: null
  }
});
```

Para `/me`:

```typescript id="vx7h7c"
await prisma.eligibleVoter.findFirst({
  where: {
    id: eligibleVoterId,
    tenantId: currentTenant.id,
    votingSessionId,
    archivedAt: null,
    OR: [
      { userId: currentUser.id },
      { personId: { in: actorPersonIds } },
      { propertyUnitId: { in: actorPropertyUnitIds } },
      { roleId: { in: actorRoleIds } }
    ]
  }
});
```

---

### 13.5. Consulta de voto

Prohibido:

```typescript id="ye630e"
await prisma.voteCast.findUnique({
  where: { id: voteCastId }
});
```

Permitido:

```typescript id="ioss5f"
await prisma.voteCast.findFirst({
  where: {
    id: voteCastId,
    tenantId: currentTenant.id,
    archivedAt: null
  }
});
```

---

### 13.6. `$queryRaw`

Permitido solo si:

```text id="okbu14"
usa parámetros bind
no concatena input del usuario
incluye tenant_id
está encapsulado en repositorio
tiene tests
no expone SQL raw en errores
```

---

## 14. Seguridad de DTOs

### 14.1. Campos prohibidos desde cliente

No aceptar en bodies:

```text id="ldw52u"
tenantId
createdBy
updatedBy
openedBy
closedBy
cancelledBy
archivedBy
linkedBy
status en PATCH genérico
openedAt
closedAt
cancelledAt
resultsCalculatedAt
resultsPublishedAt
publishedAt
createdAt
updatedAt
archivedAt
voterUserId
voterPersonId
voterPropertyUnitId
castAt
audit metadata
```

---

### 14.2. DTO administrativo

Puede incluir datos operativos, pero no debe incluir:

```text id="us67ym"
datos de otros tenants
payloads sin sanitizar
tokens
secretos
credenciales
voto completo en secretBasic
selectedOptionId en secretBasic
selectedOptionIds en secretBasic
datos personales innecesarios
```

---

### 14.3. DTO propio

No debe incluir:

```text id="cuwh3s"
elegibles completos
votos de terceros
selectedOptionId de terceros
selectedOptionIds de terceros
auditoría
metadata interna
IDs de personas ajenas
IDs de unidades ajenas
```

---

## 15. Seguridad de contenido

### 15.1. Campos a sanitizar

```text id="ddosrt"
votingSession.title
votingSession.description
ballotQuestion.title
ballotQuestion.description
ballotOption.label
ballotOption.description
cancelReason
metadata
notes
```

---

### 15.2. Contenido prohibido

```text id="d3pr8b"
<script>
<iframe>
<object>
<embed>
event handlers inline
javascript:
data URLs peligrosas
HTML no sanitizado
CSS peligroso
payloads JSON arbitrarios no validados
```

---

### 15.3. Preguntas y opciones

Las preguntas y opciones pueden mostrarse al usuario final. Por tanto, deben protegerse contra XSS y contenido malicioso.

Regla:

```text id="enm8do"
Todo contenido administrado que pueda mostrarse en frontend debe sanitizarse antes de persistir o antes de renderizar.
```

---

## 16. Seguridad de privacidad

### 16.1. `identified`

Permitido con controles:

```text id="ku8zk3"
administrador autorizado consulta opción individual
auditoría registra acceso
solo permisos estrictos
no logs con payload completo
no exposición a terceros
```

---

### 16.2. `secretBasic`

Obligatorio:

```text id="se14nu"
GET votes oculta selectedOptionId
GET votes oculta selectedOptionIds
GET participation oculta opción individual
POST vote response oculta selectedOptionId
audit voteCast.cast no contiene selectedOptionId
logs no contienen selectedOptionId
metrics no contienen selectedOptionId
results son agregados
```

No prometer:

```text id="qz9vjf"
anonimato criptográfico
voto secreto legalmente certificado
verificación pública
imposibilidad técnica absoluta de correlación
```

---

### 16.3. Acceso excepcional a votos

MVP no define acceso excepcional a voto individual en `secretBasic`.

Cualquier necesidad futura requiere:

```text id="shzpr7"
spec separada
permiso explícito
justificación obligatoria
auditoría reforzada
aprobación administrativa
política legal
```

---

## 17. Seguridad de elegibilidad

### 17.1. Voter types

Validaciones:

```text id="fl1rxn"
user requiere userId del tenant
person requiere personId del tenant
propertyUnit requiere propertyUnitId del tenant
owner requiere ownership activa del tenant
resident requiere residency activa y feature flag
role requiere roleId del tenant
proxyRepresentative requiere proxyId approved del tenant
```

---

### 17.2. Feature flags

Feature flags recomendadas:

```text id="bxk7mv"
voting.enabled
voting.independentSessions.enabled
voting.residentVoting.enabled
voting.proxyVoting.enabled
voting.secretBasic.enabled
voting.voteCancellation.enabled
voting.resultPublication.enabled
```

Defaults seguros:

```text id="n05d54"
voting.enabled = true
voting.independentSessions.enabled = false
voting.residentVoting.enabled = false
voting.proxyVoting.enabled = true
voting.secretBasic.enabled = true
voting.voteCancellation.enabled = true para admin autorizado
voting.resultPublication.enabled = true
```

---

### 17.3. Proxies

Para voto por representación:

```text id="bpljtp"
proxy.status = approved
proxy.tenantId = currentTenant.id
proxy.meetingId = votingSession.meetingId
voting.proxyVoting.enabled = true
```

No se acepta:

```text id="v2kgf0"
proxy submitted
proxy rejected
proxy cancelled
proxy archived
proxy de otro tenant
proxy de otra reunión
```

---

## 18. Seguridad de voto

### 18.1. Opción única

```text id="lqk9t7"
selectedOptionId requerido
selectedOptionIds prohibido
selectedOptionId pertenece a ballotQuestionId
selectedOptionId pertenece al tenant
```

---

### 18.2. Sí / No / Abstención

```text id="dxwxmo"
selectedOptionId requerido
optionType IN yes, no, abstain
abstain requiere allowAbstention = true
opción pertenece a pregunta y tenant
```

---

### 18.3. Opción múltiple

```text id="hpyjg0"
selectedOptionIds requerido
selectedOptionId prohibido
selectedOptionIds array no vacío
minSelections <= selectedOptionIds.length <= maxSelections
sin opciones duplicadas
todas las opciones pertenecen a la pregunta y tenant
```

---

### 18.4. Concurrencia

Debe manejarse la condición de carrera:

```text id="a1unn3"
dos requests simultáneos del mismo eligibleVoter para la misma pregunta
```

Resultado esperado:

```text id="n8gl2g"
1 voto creado
1 respuesta 409 VOTE_DUPLICATE
```

Controles:

```text id="nfx92y"
transaction
unique partial index
constraint error mapping
idempotency key si aplica
```

---

## 19. Seguridad de resultados

### 19.1. Votos que cuentan

```text id="atrt3e"
status = cast
archivedAt = null
tenantId = currentTenant.id
```

---

### 19.2. Votos que no cuentan

```text id="uexdfh"
cancelled
superseded
archived
tenant distinto
```

---

### 19.3. Abstenciones

Regla MVP:

```text id="y7ewg7"
abstención cuenta como participación, pero no como voto afirmativo ni negativo.
```

---

### 19.4. Decimal

Los porcentajes y pesos deben usar Decimal.

No usar:

```text id="y17k0f"
float
double
number con precisión binaria para persistencia financiera o porcentual crítica
```

---

### 19.5. Recalculation

Si se anula un voto después de calcular resultados:

```text id="bkbfal"
marcar resultados como requieren recálculo
o invalidar tallies previos de forma controlada
auditar voteCast.cancelled
auditar votingResults.recalculationRequired si se define
```

---

## 20. Seguridad de notificaciones

El módulo no envía canales directamente.

Permitido:

```text id="ayjfav"
emitir evento votingSession.opened
emitir evento votingSession.closed
emitir evento votingSession.cancelled
emitir evento votingResults.published
invocar VotingNotificationPort
```

Prohibido:

```text id="y1sr0g"
enviar email directamente desde Voting
enviar WhatsApp directamente desde Voting
enviar SMS directamente desde Voting
enviar push directamente desde Voting
incluir lista completa de elegibles
incluir votos individuales
incluir selectedOptionId
incluir selectedOptionIds
incluir resultados no publicados
incluir datos personales innecesarios
```

Payload seguro sugerido:

```json id="tny925"
{
  "tenantId": "tenant_uuid",
  "sourceType": "votingSession",
  "sourceId": "voting_session_uuid",
  "eventType": "votingSession.opened",
  "title": "Votación de Asamblea Ordinaria 2026",
  "audience": {
    "type": "eligibleVoters"
  },
  "actionUrl": "/voting/voting_session_uuid",
  "traceId": "req_123456"
}
```

---

## 21. Auditoría

### 21.1. Eventos obligatorios

```text id="vc0rvg"
votingSession.created
votingSession.updated
votingSession.scheduled
votingSession.opened
votingSession.closed
votingSession.cancelled
votingSession.archived
ballotQuestion.created
ballotQuestion.updated
ballotQuestion.archived
ballotOption.created
ballotOption.updated
ballotOption.archived
eligibleVoter.added
eligibleVoters.resolved
eligibleVoter.updated
eligibleVoter.excluded
eligibleVoter.archived
voteCast.cast
voteCast.cancelled
votingResults.calculated
votingResults.published
votingResult.linkedToResolution
```

---

### 21.2. Metadata permitida

```json id="g6dsyw"
{
  "votingSessionId": "voting_session_uuid",
  "ballotQuestionId": "question_uuid",
  "ballotOptionId": "option_uuid",
  "eligibleVoterId": "eligible_voter_uuid",
  "voteCastId": "vote_cast_uuid",
  "meetingId": "meeting_uuid",
  "meetingResolutionId": "meeting_resolution_uuid",
  "votingStatus": "open",
  "privacyMode": "identified",
  "eligibilityMode": "propertyUnits",
  "votingRule": "simpleMajority",
  "questionType": "yesNoAbstain",
  "resultStatus": "passed",
  "totalEligible": 40,
  "totalVotes": 30,
  "thresholdMet": true,
  "traceId": "req_123456"
}
```

---

### 21.3. Metadata prohibida

```text id="h1p1bm"
selectedOptionId en secretBasic
selectedOptionIds en secretBasic
payload completo
voto completo
tokens
secretos
cookies
Authorization header
emails completos
teléfonos completos
cédulas
documentos completos
stack trace
SQL raw
provider payloads
```

---

### 21.4. Auditoría de voto

En `identified`:

```text id="u1p2bn"
puede registrar voteCastId y eligibleVoterId;
puede registrar ballotOptionId solo si la política lo permite;
debe evitar payload completo.
```

En `secretBasic`:

```text id="os89yh"
registrar que el voto fue emitido;
no registrar selectedOptionId;
no registrar selectedOptionIds;
no registrar label de opción;
no registrar payload del voto.
```

---

## 22. Logs y métricas

### 22.1. Logs permitidos

```text id="n7z9fv"
traceId
requestId
correlationId
action
outcome
status
durationMs
errorCode
votingStatus
privacyMode
eligibilityMode
votingRule
questionType
resultStatus
```

---

### 22.2. Logs prohibidos

```text id="ign4rr"
Authorization header
cookies
tokens
secretos
selectedOptionId en secretBasic
selectedOptionIds en secretBasic
voto completo
payload completo
emails completos
teléfonos completos
cédulas
documentos completos
SQL raw
stack trace en producción
```

---

### 22.3. Métricas permitidas

```text id="e3ky7k"
voting_sessions_created_total
voting_sessions_opened_total
voting_sessions_closed_total
voting_sessions_cancelled_total
votes_cast_total
votes_cancelled_total
voting_results_calculated_total
voting_results_published_total
```

---

### 22.4. Labels permitidos

```text id="gmu7is"
votingStatus
privacyMode
eligibilityMode
votingRule
questionType
resultStatus
outcome
```

---

### 22.5. Labels prohibidos

```text id="lhw9kc"
tenantId
votingSessionId
ballotQuestionId
ballotOptionId
eligibleVoterId
voteCastId
userId
personId
propertyUnitId
email
phone
traceId
ipAddress
selectedOptionId
selectedOptionIds
```

---

## 23. Errores seguros

### 23.1. Formato estándar

```json id="xrj1ha"
{
  "error": {
    "code": "VOTE_DUPLICATE",
    "message": "An active vote already exists for this question and eligible voter.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

### 23.2. No revelar

Los errores no deben revelar:

```text id="b3q14k"
si una votación ajena existe
si una pregunta ajena existe
si una opción ajena existe
si un elegible ajeno existe
si un voto ajeno existe
si un resultado ajeno existe
si una unidad ajena existe
si una persona ajena existe
SQL interno
Prisma raw error
stack trace
selectedOptionId en secretBasic
datos personales
```

---

### 23.3. 404 vs 403

Para recursos ajenos o cross-tenant se permite responder:

```text id="c1k506"
404 VOTING_SESSION_NOT_FOUND
```

Para falta de permiso dentro del mismo tenant se puede responder:

```text id="w9ftmm"
403 FORBIDDEN
```

cuando no revele información sensible.

---

## 24. Rate limiting

Aplicar rate limiting a endpoints de alto impacto:

```text id="slxqey"
POST /api/v1/tenant/voting-sessions
POST /api/v1/tenant/voting-sessions/{votingSessionId}/open
POST /api/v1/tenant/voting-sessions/{votingSessionId}/close
POST /api/v1/tenant/voting-sessions/{votingSessionId}/cancel
POST /api/v1/tenant/voting-sessions/{votingSessionId}/eligible-voters/resolve
POST /api/v1/me/voting-sessions/{votingSessionId}/questions/{questionId}/vote
POST /api/v1/tenant/votes/{voteCastId}/cancel
POST /api/v1/tenant/voting-sessions/{votingSessionId}/calculate-results
POST /api/v1/tenant/voting-sessions/{votingSessionId}/publish-results
```

Objetivo:

```text id="g8s55o"
prevenir spam de votos
prevenir abuso de apertura/cierre
prevenir brute force de ids
prevenir cálculo excesivo de resultados
proteger disponibilidad
```

---

## 25. Cache y CORS

### 25.1. Endpoints privados

Todos los endpoints deben usar:

```text id="lqryav"
Cache-Control: no-store
```

No cachear:

```text id="wk5bbd"
votaciones
preguntas
opciones
elegibles
votos
participación
resultados
auditoría
```

---

### 25.2. CORS

No usar:

```text id="d83l7z"
Access-Control-Allow-Origin: *
```

en endpoints privados.

Permitir únicamente orígenes autorizados del frontend administrativo o portal transaccional.

---

## 26. Seguridad con IA

### 26.1. Prohibido enviar a IA externa

```text id="z2rs98"
votos reales
opciones votadas reales
elegibles reales
participación real
resultados internos no publicados
actas reales
resoluciones reales
datos de propietarios
datos de residentes
datos de unidades
proxies
logs con datos personales
tokens
secretos
backups
```

---

### 26.2. Permitido con datos ficticios

```text id="zcnd9z"
generar ejemplos de votaciones sintéticas
generar tests con datos falsos
mejorar documentación técnica
analizar código sin datos reales
crear plantillas de votación ficticias
```

---

### 26.3. IA futura

Cualquier uso futuro de IA para analizar resultados, generar resúmenes o asistir actas requiere spec separada e incluir:

```text id="afhs1b"
anonimización
minimización
consentimiento si aplica
revisión humana
control de prompts
política de retención
no entrenamiento con datos privados
registro de uso
cumplimiento legal
```

---

## 27. Retención y eliminación

### 27.1. No eliminación física ordinaria

No eliminar físicamente:

```text id="td0er2"
voting_sessions
ballot_questions
ballot_options
eligible_voters
vote_casts
voting_tallies
voting_results
voting_resolution_links
```

---

### 27.2. Archivo lógico

Usar:

```text id="jba3js"
archivedAt
status = archived cuando aplique
```

---

### 27.3. Motivo

La retención es necesaria para:

```text id="vrzq6n"
evidencia administrativa
trazabilidad de decisiones
auditoría
revisión posterior
futuras actas
futuras impugnaciones
futura certificación
cumplimiento
```

---

## 28. Checklist de seguridad para PR

```text id="bdsh5d"
[ ] Todas las tablas nuevas tienen tenant_id.
[ ] Toda consulta filtra por tenant_id.
[ ] No se acepta tenantId desde body.
[ ] No se busca votingSession solo por id.
[ ] No se busca ballotQuestion solo por id.
[ ] No se busca ballotOption solo por id.
[ ] No se busca eligibleVoter solo por id.
[ ] No se busca voteCast solo por id.
[ ] No se busca votingResult solo por id.
[ ] No se busca votingResolutionLink solo por id.
[ ] meetingId se valida contra tenant.
[ ] userId se valida contra tenant.
[ ] personId se valida contra tenant.
[ ] propertyUnitId se valida contra tenant.
[ ] roleId se valida contra tenant.
[ ] proxyId se valida contra tenant.
[ ] meetingResolutionId se valida contra tenant.
[ ] No hay endpoints públicos de votación.
[ ] OpenAPI no documenta endpoints públicos de votación.
[ ] /me no devuelve elegibles completos.
[ ] /me no devuelve votos de terceros.
[ ] /me no devuelve auditoría.
[ ] /me no devuelve metadata interna.
[ ] Usuario no puede votar por unidad ajena.
[ ] Usuario no puede votar por persona ajena.
[ ] Usuario no puede usar eligibleVoterId ajeno.
[ ] Votación debe estar open para votar.
[ ] Ventana opensAt/closesAt se valida.
[ ] Pregunta debe estar active para votar.
[ ] Opción debe pertenecer a pregunta.
[ ] Opción debe pertenecer al tenant.
[ ] MultipleChoice valida minSelections.
[ ] MultipleChoice valida maxSelections.
[ ] MultipleChoice rechaza opciones duplicadas.
[ ] Voto duplicado se rechaza.
[ ] Índice único parcial de voto activo existe.
[ ] Concurrencia de voto duplicado está cubierta.
[ ] Proxy debe estar approved.
[ ] Resident voting depende de feature flag.
[ ] secretBasic no expone selectedOptionId.
[ ] secretBasic no expone selectedOptionIds.
[ ] Logs no contienen selectedOptionId.
[ ] Métricas no contienen selectedOptionId.
[ ] Auditoría secretBasic no contiene selectedOptionId.
[ ] Resultados se calculan con votos válidos.
[ ] Votos cancelled no cuentan.
[ ] Votos archived no cuentan.
[ ] Resultados usan Decimal.
[ ] Cálculo no modifica votos.
[ ] Publicación requiere cálculo previo.
[ ] Resultados publicados no revelan identidades.
[ ] Resultados no son públicos.
[ ] Resultados no ejecutan acciones automáticas.
[ ] No se generan cargos desde resultados.
[ ] No se generan multas desde resultados.
[ ] No se aprueban resoluciones automáticamente.
[ ] Notificaciones usan VotingNotificationPort.
[ ] Voting no envía email directamente.
[ ] Payload de notificación no contiene votos individuales.
[ ] Payload de notificación no contiene selectedOptionId.
[ ] Auditoría registra eventos críticos.
[ ] Audit metadata está sanitizada.
[ ] Errores son seguros.
[ ] Tests unitarios pasan.
[ ] Tests API pasan.
[ ] Tests de autorización pasan.
[ ] Tests own-resource pasan.
[ ] Tests de elegibilidad pasan.
[ ] Tests de casting pasan.
[ ] Tests de privacidad pasan.
[ ] Tests multitenant pasan.
[ ] Tests de resultados pasan.
[ ] Tests de seguridad pasan.
[ ] OpenAPI validation pasa.
[ ] CI pasa.
```

---

## 29. Pruebas de seguridad obligatorias

Deben existir pruebas para:

```text id="gl6vtv"
usuario sin token recibe 401
usuario sin membership recibe 403
usuario disabled recibe 403
usuario sin permiso recibe 403
tenant A no ve votingSessions tenant B
tenant A no ve ballotQuestions tenant B
tenant A no ve ballotOptions tenant B
tenant A no ve eligibleVoters tenant B
tenant A no ve voteCasts tenant B
tenant A no ve votingTallies tenant B
tenant A no ve votingResults tenant B
tenant A no ve votingResolutionLinks tenant B
tenant A no usa meetingId tenant B
tenant A no usa userId tenant B
tenant A no usa personId tenant B
tenant A no usa propertyUnitId tenant B
tenant A no usa roleId tenant B
tenant A no usa proxyId tenant B
tenant A no usa meetingResolutionId tenant B
usuario no ve votación ajena desde /me
usuario no ve votos de terceros desde /me
usuario no vota por unidad ajena
usuario no vota por persona ajena
usuario no usa eligibleVoterId ajeno
voto duplicado devuelve 409
dos votos concurrentes crean solo un voteCast
voto en draft devuelve 409
voto en closed devuelve 409
voto antes de opensAt devuelve 409
voto después de closesAt devuelve 409
opción de otra pregunta devuelve 422/403
opción de otro tenant devuelve 403/404
multipleChoice bajo mínimo devuelve 422
multipleChoice sobre máximo devuelve 422
proxy submitted no permite votar
proxy rejected no permite votar
proxy cancelled no permite votar
proxy archived no permite votar
secretBasic no expone selectedOptionId en GET votes
secretBasic no expone selectedOptionId en POST vote response
secretBasic no expone selectedOptionId en audit
secretBasic no expone selectedOptionId en logs
calcular resultados no modifica votos
calcular resultados excluye cancelled
publicar sin cálculo devuelve 409
resultados no se exponen públicamente
endpoint público de votación no existe
OpenAPI no documenta endpoints públicos prohibidos
notificación no contiene votos individuales
notificación no contiene selectedOptionId
resultados no generan cargos
resultados no generan multas
resultados no aprueban resoluciones automáticamente
```

---

## 30. Riesgos residuales aceptados en MVP

| Riesgo                                      | Estado   | Justificación                                                   |
| ------------------------------------------- | -------- | --------------------------------------------------------------- |
| `secretBasic` no es anonimato criptográfico | Aceptado | MVP solo separa exposición en DTO/API/logs/auditoría            |
| Sin voto legalmente certificado             | Aceptado | Requiere firma, sellado y flujo legal                           |
| Sin verificación pública del voto           | Aceptado | Requiere criptografía avanzada                                  |
| Sin voto ponderado avanzado                 | Aceptado | Se reserva campo `weight`, pero no se implementa regla compleja |
| Sin coeficientes de copropiedad             | Aceptado | Requiere spec de coeficientes                                   |
| Sin mayorías legales complejas              | Aceptado | MVP usa reglas básicas                                          |
| Sin impugnaciones                           | Aceptado | Requiere spec legal-operativa                                   |
| Sin firma electrónica                       | Aceptado | Requiere proveedor y cumplimiento                               |
| Sin acta certificada                        | Aceptado | Será spec separada                                              |
| Sin voto offline                            | Aceptado | Riesgo alto de sincronización y fraude                          |
| Sin biometría/geolocalización               | Aceptado | Datos sensibles fuera del MVP                                   |
| Sin IA con datos reales                     | Aceptado | Requiere gobierno de datos específico                           |

---

## 31. Pendientes de seguridad para specs futuras

### 31.1. `015-certified-minutes`

Debe cubrir:

```text id="ra9uyz"
versionado de actas
hash documental
PDF formal
publicación controlada
vínculo con votación
firma de responsables
retención
historial de cambios
```

---

### 31.2. `00X-electronic-signatures`

Debe cubrir:

```text id="deawpo"
proveedor de firma
identidad del firmante
integridad del documento
sellado de tiempo
certificados
almacenamiento seguro
auditoría legal
```

---

### 31.3. `00X-advanced-voting-rules`

Debe cubrir:

```text id="u1jsud"
mayoría calificada
mayoría absoluta legal
quórum legal
segunda vuelta
reconteo
impugnaciones
reglas por tipo de asamblea
```

---

### 31.4. `00X-weighted-voting`

Debe cubrir:

```text id="xsdwp6"
coeficientes de copropiedad
peso por unidad
copropietarios
redondeo
precisión decimal
auditoría de ponderación
```

---

### 31.5. `00X-cryptographic-voting`

Debe cubrir:

```text id="odg08q"
voto secreto criptográfico
verificabilidad individual
verificabilidad universal
separación identidad-voto
criptografía aplicada
modelo de amenazas avanzado
auditoría verificable
```

---

### 31.6. `00X-voting-appeals`

Debe cubrir:

```text id="q3oyui"
impugnación
plazos
evidencia
resolución
auditoría
notificación
bloqueo de publicación final
```

---

### 31.7. `00X-ai-assisted-minutes`

Debe cubrir:

```text id="reolnc"
anonimización
transcripción segura
consentimiento
revisión humana
control de prompts
no entrenamiento
redacción de datos sensibles
cumplimiento
```

---

## 32. Criterios de aceptación de seguridad

La spec `014-voting-basic` cumple seguridad si:

```text id="m0071a"
- toda tabla nueva tiene tenant_id;
- toda consulta filtra por tenant_id;
- ningún endpoint acepta tenantId desde body;
- ningún recurso se busca solo por id;
- no existen endpoints públicos de votación;
- OpenAPI no documenta endpoints públicos de votación;
- meetingId se valida contra tenant;
- userId se valida contra tenant;
- personId se valida contra tenant;
- propertyUnitId se valida contra tenant;
- roleId se valida contra tenant;
- proxyId se valida contra tenant;
- meetingResolutionId se valida contra tenant;
- usuario final solo ve votaciones donde es elegible;
- usuario final no ve votos de terceros;
- usuario final no vota por unidades ajenas;
- usuario final no vota por personas ajenas;
- elegibilidad se valida antes de votar;
- voto duplicado se impide por servicio e índice;
- concurrencia de voto duplicado está controlada;
- ventana de votación se valida;
- estado de votación se valida;
- proxy debe estar approved;
- secretBasic no expone selectedOptionId;
- secretBasic no expone selectedOptionIds;
- logs no contienen opción individual;
- auditoría no contiene opción individual en secretBasic;
- resultados se calculan con votos válidos;
- resultados excluyen votos anulados;
- resultados usan Decimal;
- cálculo de resultados no modifica votos;
- publicación requiere cálculo previo;
- resultados no son públicos;
- resultados no ejecutan acciones automáticas;
- no se generan cargos;
- no se generan multas;
- no se aprueban resoluciones automáticamente;
- notificaciones tienen payload mínimo;
- auditoría registra operaciones críticas;
- errores son seguros;
- tests de seguridad pasan;
- CI pasa.
```

---

## 33. Decisión final de seguridad

El módulo `014-voting-basic` será tratado como un módulo sensible de decisión comunitaria, participación, privacidad, integridad y auditoría.

Su seguridad se basa en:

```text id="syqlz8"
tenant isolation
permissioned access
eligibility validation
own-resource authorization
duplicate vote prevention
state machine validation
voting window validation
proxy approved validation
privacy mode enforcement
secretBasic DTO minimization
deterministic tally
Decimal precision
controlled result publication
no public exposure
no automatic execution
notification payload minimization
auditability
safe logs
safe metrics
OpenAPI negative validation
CI security gates
```

No se aceptará una implementación que permita votaciones cross-tenant, preguntas de otro tenant, opciones de otro tenant, elegibles de otro tenant, votos de otro tenant, votos duplicados, votos fuera de ventana, votos en sesión cerrada, votos de usuarios no elegibles, votos por unidades ajenas, votos por personas ajenas, votos con proxy no aprobado, exposición de `selectedOptionId` en `secretBasic`, logs con opción votada, auditoría con opción votada en `secretBasic`, publicación pública de resultados, endpoints públicos, resultados calculados con votos anulados, resultados que modifiquen votos, uso de `float/double` para porcentajes persistidos, generación automática de cargos o multas, aprobación automática de resoluciones, omisión de auditoría o documentación OpenAPI de rutas públicas prohibidas.
