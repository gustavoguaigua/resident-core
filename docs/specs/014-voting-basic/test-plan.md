# Test Plan — Spec 014 Voting Basic

## 1. Información del documento

| Campo           | Valor                                                                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                            |
| Spec ID         | 014                                                                                                                                      |
| Módulo          | Voting Basic                                                                                                                             |
| Documento       | Test Plan                                                                                                                                |
| Ruta            | `docs/specs/014-voting-basic/test-plan.md`                                                                                               |
| Versión         | 0.1                                                                                                                                      |
| Estado          | Borrador inicial                                                                                                                         |
| Fecha           | 2026-07-20                                                                                                                               |
| Documento base  | `docs/specs/014-voting-basic/spec.md`                                                                                                    |
| Plan técnico    | `docs/specs/014-voting-basic/plan.md`                                                                                                    |
| Modelo de datos | `docs/specs/014-voting-basic/data-model.md`                                                                                              |
| Contrato API    | `docs/specs/014-voting-basic/api-contract.md`                                                                                            |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `007-audit`, `012-communications-notifications`, `013-meetings-attendance` |
| Relacionado con | futuras specs de voto ponderado, reglas legales, firmas electrónicas, actas certificadas, impugnaciones y auditoría verificable          |

---

## 2. Propósito

Este documento define la estrategia de pruebas para el módulo `014-voting-basic`.

El plan cubre pruebas unitarias, pruebas de entidades de dominio, validación de DTOs, servicios de aplicación, repositorios, API, autorización, recursos propios, elegibilidad, emisión de voto, privacidad, multitenancy, cálculo de resultados, publicación de resultados, vinculación con resoluciones, auditoría, observabilidad, OpenAPI y CI/CD.

Regla central:

```text id="o7p33v"
El módulo Voting Basic debe impedir votaciones cross-tenant, elegibles cross-tenant, votos duplicados, votos fuera de ventana, votos de usuarios no elegibles, votos por unidades ajenas, votos con proxy no aprobado, exposición de voto individual en secretBasic, endpoints públicos y omisión de auditoría.
```

---

## 3. Objetivos de prueba

Las pruebas deben validar que el sistema:

* crea sesiones de votación correctamente;
* asocia votaciones a reuniones del mismo tenant;
* impide asociar votaciones a reuniones de otro tenant;
* crea preguntas de votación;
* crea opciones de votación;
* impide opciones duplicadas;
* impide más de una opción de abstención por pregunta;
* define votantes elegibles manualmente;
* resuelve elegibles desde participantes de reunión;
* resuelve elegibles desde asistencia de reunión;
* resuelve elegibles desde propietarios, residentes, unidades y roles;
* impide elegibles duplicados;
* impide elegibles con referencias cross-tenant;
* abre votaciones solo si están completas;
* cierra votaciones abiertas;
* cancela votaciones con razón;
* archiva votaciones de forma lógica;
* permite emitir voto propio;
* impide votar sin elegibilidad;
* impide votar más de una vez por pregunta y elegible;
* impide votar fuera de ventana;
* impide votar en sesiones no abiertas;
* impide votar por unidad ajena;
* valida proxy aprobado para voto por representación;
* respeta `identified`;
* respeta `secretBasic`;
* no expone `selectedOptionId` en `secretBasic`;
* calcula resultados de forma determinística;
* excluye votos anulados;
* no modifica votos al calcular resultados;
* publica resultados solo si fueron calculados;
* no publica resultados por endpoint público;
* vincula resultados con resoluciones del mismo tenant;
* no ejecuta acciones automáticas desde resultados;
* audita operaciones críticas;
* emite eventos seguros para notificaciones;
* registra logs y métricas sin datos sensibles;
* mantiene OpenAPI consistente;
* pasa CI.

---

## 4. Alcance de pruebas

### 4.1. Incluido

```text id="a4jx5e"
1. Value objects.
2. Enums.
3. Entidades de dominio.
4. Máquinas de estado.
5. DTO validation.
6. Servicios de aplicación.
7. Políticas de elegibilidad.
8. Políticas de privacidad.
9. Prevención de duplicidad.
10. Repositorios Prisma.
11. Endpoints administrativos.
12. Endpoints /me.
13. Autorización por permisos.
14. Autorización por recurso propio.
15. Multitenancy.
16. Emisión de voto.
17. Privacidad identified.
18. Privacidad secretBasic.
19. Cálculo de resultados.
20. Publicación de resultados.
21. Vínculo con resoluciones.
22. Integración con reuniones.
23. Integración con notificaciones.
24. Auditoría.
25. Observabilidad.
26. Seguridad.
27. OpenAPI.
28. Performance MVP.
29. Smoke tests.
30. CI/CD gates.
```

---

### 4.2. Fuera de alcance de pruebas MVP

```text id="wduig1"
- Votación legalmente certificada.
- Firma electrónica.
- Sellado de tiempo certificado.
- Blockchain.
- Anonimato criptográfico fuerte.
- Voto secreto verificable extremo a extremo.
- Voto ponderado avanzado.
- Coeficientes de copropiedad.
- Mayorías legales complejas.
- Impugnaciones legales.
- Segunda vuelta automática.
- Voto offline.
- Voto por SMS.
- Voto por WhatsApp.
- Voto por email.
- Biometría.
- Geolocalización.
- Observadores externos.
- Reconteo formal.
- Actas certificadas.
- IA con datos reales.
```

---

## 5. Capas de prueba

```text id="ddur8x"
unit
domain
value-object
dto-validation
application-service
policy
use-case
repository-integration
api
authorization
own-resource
eligibility
vote-casting
privacy
multitenancy
result-calculation
notification-integration
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

```text id="ebkzm3"
tenantActiveA
tenantActiveB
tenantSuspended
tenantInactive
tenantArchived
```

---

### 6.2. Usuarios

```text id="su2aqu"
platformAdmin
tenantAdminA
tenantAdminB
meetingManagerA
meetingManagerB
boardMemberA
ownerUserA
residentUserA
ownerResidentUserA
proxyRepresentativeUserA
userWithoutVotingPermissionA
userWithoutMembership
disabledUser
anonymousUser
```

---

### 6.3. Personas

```text id="by93jy"
personOwnerA
personResidentA
personOwnerResidentA
personProxyRepresentativeA
personBoardMemberA
personOwnerB
personResidentB
personInactiveA
```

---

### 6.4. Unidades habitacionales

```text id="euoh6j"
propertyUnitA101
propertyUnitA102
propertyUnitA103
propertyUnitB201
propertyUnitInactiveA
```

---

### 6.5. Relaciones

```text id="mgi33b"
ownerUserA -> personOwnerA -> propertyUnitA101 ownership active
residentUserA -> personResidentA -> propertyUnitA101 residency active
ownerResidentUserA -> personOwnerResidentA -> propertyUnitA102 ownership active + residency active
proxyRepresentativeUserA -> personProxyRepresentativeA
ownerUserB -> personOwnerB -> propertyUnitB201 ownership active
residentUserB -> personResidentB -> propertyUnitB201 residency active
```

---

### 6.6. Reuniones

```text id="zhbmve"
meetingDraftA
meetingCalledA
meetingInProgressA
meetingAttendanceClosedA
meetingCompletedA
meetingCancelledA
meetingTenantB
```

---

### 6.7. Asistencia

```text id="d27r4x"
attendanceOwnerPresentA
attendanceResidentLateA
attendanceUnitA101RepresentedA
attendanceOwnerAbsentA
attendanceTenantB
```

---

### 6.8. Proxies

```text id="d3ebcs"
proxySubmittedA
proxyApprovedA
proxyRejectedA
proxyCancelledA
proxyArchivedA
proxyTenantB
```

---

### 6.9. Voting Sessions

```text id="ttmshp"
votingSessionDraftA
votingSessionScheduledA
votingSessionOpenA
votingSessionClosedA
votingSessionResultsCalculatedA
votingSessionResultsPublishedA
votingSessionCancelledA
votingSessionArchivedA
votingSessionSecretBasicA
votingSessionIdentifiedA
votingSessionTenantB
```

---

### 6.10. Ballot Questions

```text id="xz2uxz"
questionYesNoBudgetA
questionSingleChoiceBoardA
questionMultipleChoiceMaintenanceA
questionDraftA
questionActiveA
questionClosedA
questionTenantB
```

---

### 6.11. Ballot Options

```text id="fd09tq"
optionYesA
optionNoA
optionAbstainA
optionCandidateA
optionCandidateB
optionCandidateC
optionMaintenancePriorityA
optionMaintenancePriorityB
optionMaintenancePriorityC
optionTenantB
```

---

### 6.12. Eligible Voters

```text id="yhlv28"
eligibleOwnerA
eligibleResidentA
eligiblePropertyUnitA101
eligiblePropertyUnitA102
eligibleUserA
eligiblePersonA
eligibleProxyRepresentativeA
eligibleExcludedA
eligibleVotedA
eligibleTenantB
```

---

### 6.13. Vote Casts

```text id="z46od6"
voteCastOwnerYesA
voteCastOwnerNoA
voteCastUnitA101AbstainA
voteCastMultipleChoiceA
voteCastCancelledA
voteCastTenantB
```

---

### 6.14. Results

```text id="p1sy7x"
votingTallyYesA
votingTallyNoA
votingTallyAbstainA
votingResultPassedA
votingResultFailedA
votingResultTieA
votingResultInformationalA
votingResolutionLinkA
```

---

## 7. Factories de prueba

Deben existir factories para:

```text id="youl7c"
createVotingSession()
createBallotQuestion()
createBallotOption()
createEligibleVoter()
createVoteCast()
createVotingTally()
createVotingResult()
createVotingResolutionLink()

createCreateVotingSessionDto()
createUpdateVotingSessionDto()
createOpenVotingSessionDto()
createCloseVotingSessionDto()
createCancelVotingSessionDto()
createCreateBallotQuestionDto()
createCreateBallotOptionDto()
createCreateEligibleVoterDto()
createResolveEligibleVotersDto()
createCastVoteDto()
createCancelVoteDto()
createCalculateResultsDto()
createPublishResultsDto()
createLinkVotingResultToResolutionDto()

createVotingActorContext()
createTenantContext()
createOwnVotingContext()
createEligibilityScenario()
createTallyScenario()
createPrivacyScenario()
```

Reglas:

* Usar datos sintéticos.
* No usar nombres reales.
* No usar emails reales.
* No usar teléfonos reales.
* No usar cédulas reales.
* No usar votos reales.
* No usar actas reales.
* No usar documentos reales.
* No usar secretos.
* Permitir crear datos de Tenant A y Tenant B.
* Permitir escenarios `identified` y `secretBasic`.
* Permitir escenarios de voto duplicado.
* Permitir escenarios cross-tenant.

---

# 8. Unit tests — Value Objects y Enums

## 8.1. `VotingSessionStatus`

Debe probar:

```text id="y0kajq"
draft válido
scheduled válido
open válido
closed válido
resultsCalculated válido
resultsPublished válido
cancelled válido
archived válido
estado desconocido inválido
estados editables
estados cancelables
estados que permiten voto
estados terminales
```

---

## 8.2. `VotingPrivacyMode`

Debe probar:

```text id="ngfe7t"
identified válido
secretBasic válido
cryptographicSecret rechazado en MVP
publicVerifiable rechazado en MVP
secretBasic no implica anonimato criptográfico
```

---

## 8.3. `EligibilityMode`

Debe probar:

```text id="s0x5wl"
manual válido
meetingParticipants válido
meetingAttendance válido
owners válido
residents válido con feature flag
propertyUnits válido
roles válido
mixed válido
valor desconocido inválido
```

---

## 8.4. `VotingRule`

Debe probar:

```text id="ecce2r"
informational válido
simpleMajority válido
absoluteMajority válido
plurality válido
unanimity válido
qualifiedMajority rechazado en MVP
weightedMajority rechazado en MVP salvo feature futura
legalCustomRule rechazado en MVP
```

---

## 8.5. `BallotQuestionType`

Debe probar:

```text id="z3et39"
yesNoAbstain válido
singleChoice válido
multipleChoice válido
ranking rechazado en MVP
openText rechazado en MVP
numeric rechazado en MVP
```

---

## 8.6. `VoterType`

Debe probar:

```text id="ofdd8d"
user requiere userId
person requiere personId
propertyUnit requiere propertyUnitId
owner requiere relación de propiedad
resident requiere política habilitada
role requiere roleId
proxyRepresentative requiere proxyId
combinaciones inválidas rechazadas
```

---

## 8.7. `VotingTitle`

Debe probar:

```text id="uwx7m7"
título válido
título vacío inválido
título solo espacios inválido
normalización de espacios
longitud máxima
contenido peligroso rechazado o sanitizado
```

---

## 8.8. `VotingWindow`

Debe probar:

```text id="w90ktt"
opensAt menor que closesAt válido
opensAt igual a closesAt inválido
opensAt mayor que closesAt inválido
sin opensAt válido
sin closesAt válido
now dentro de ventana
now antes de ventana
now después de ventana
```

---

## 8.9. `VotingSelection`

Debe probar:

```text id="i5wtdc"
singleChoice con selectedOptionId válido
singleChoice con selectedOptionIds inválido
yesNoAbstain con selectedOptionId válido
multipleChoice con selectedOptionIds válido
multipleChoice con selectedOptionId inválido
multipleChoice bajo minSelections inválido
multipleChoice sobre maxSelections inválido
multipleChoice con opciones duplicadas inválido
```

---

## 8.10. `VotingWeight`

Debe probar:

```text id="pd3dnm"
peso 1.00 válido
peso 0.00 válido si política lo permite
peso negativo inválido
peso con más de 2 decimales inválido o normalizado
peso se expone como string decimal
no usar float para persistencia
```

---

## 8.11. `VotingThreshold`

Debe probar:

```text id="plzr3u"
threshold 50.00 válido
threshold 0.00 válido
threshold 100.00 válido
threshold menor a 0 inválido
threshold mayor a 100 inválido
string decimal válido
```

---

## 8.12. `VotingContent`

Debe probar:

```text id="viqlue"
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

# 9. Unit tests — Entidades de dominio

## 9.1. `VotingSession`

Debe probar:

```text id="ib9ci0"
crear sesión draft válida
rechazar sesión sin título
validar meetingId opcional
validar privacyMode
validar eligibilityMode
validar votingRule
validar opensAt/closesAt
programar sesión
abrir sesión
cerrar sesión
cancelar sesión con razón
rechazar cancelación sin razón
marcar resultados calculados
marcar resultados publicados
archivar sesión
rechazar transición inválida
```

---

## 9.2. `BallotQuestion`

Debe probar:

```text id="qr5xd4"
crear pregunta yesNoAbstain
crear pregunta singleChoice
crear pregunta multipleChoice
rechazar pregunta sin título
rechazar order inválido
validar minSelections
validar maxSelections
activar pregunta
cerrar pregunta
archivar pregunta
rechazar questionType no soportado
```

---

## 9.3. `BallotOption`

Debe probar:

```text id="wu10bj"
crear opción estándar
crear opción yes
crear opción no
crear opción abstain
rechazar label vacío
validar order
marcar isAbstention
rechazar optionType inválido
archivar opción
```

---

## 9.4. `EligibleVoter`

Debe probar:

```text id="wrm8au"
crear elegible user
crear elegible person
crear elegible propertyUnit
crear elegible owner
crear elegible resident
crear elegible role
crear elegible proxyRepresentative
rechazar user sin userId
rechazar person sin personId
rechazar propertyUnit sin propertyUnitId
rechazar role sin roleId
rechazar proxyRepresentative sin proxyId
estado inicial eligible
marcar como voted
excluir elegible
archivar elegible
```

---

## 9.5. `VoteCast`

Debe probar:

```text id="kqv879"
crear voto singleChoice válido
crear voto yesNoAbstain válido
crear voto abstain válido
crear voto multipleChoice válido
rechazar voto sin eligibleVoterId
rechazar voto sin ballotQuestionId
rechazar singleChoice sin selectedOptionId
rechazar multipleChoice sin selectedOptionIds
rechazar selectedOptionIds duplicados
estado inicial cast
cancelar voto con razón
rechazar cancelación sin razón
archivar voto
```

---

## 9.6. `VotingTally`

Debe probar:

```text id="lipxkw"
crear tally válido
totalVotes no negativo
weightedTotal no negativo
percentage entre 0 y 100
calculatedAt requerido
exponer Decimal como string
```

---

## 9.7. `VotingResult`

Debe probar:

```text id="y4sq4l"
crear result passed
crear result failed
crear result tie
crear result informational
validar totalEligible no negativo
validar totalVotes no negativo
validar totalAbstentions no negativo
validar participationPercentage
validar requiredThreshold
marcar publishedAt
archivar result
```

---

## 9.8. `VotingResolutionLink`

Debe probar:

```text id="wqyeba"
crear link válido
requiere votingSessionId
requiere ballotQuestionId
requiere votingResultId
requiere meetingResolutionId
requiere linkedBy
requiere linkedAt
archivar link
no ejecuta acción automática
```

---

# 10. Unit tests — Máquinas de estado

## 10.1. VotingSession State Machine

Transiciones válidas:

```text id="ukbd57"
draft -> scheduled
scheduled -> open
draft -> open
open -> closed
closed -> resultsCalculated
resultsCalculated -> resultsPublished
resultsPublished -> archived
draft -> cancelled
scheduled -> cancelled
open -> cancelled
cancelled -> archived
closed -> archived
```

Transiciones inválidas:

```text id="q0rfix"
archived -> open
cancelled -> open
resultsPublished -> open
closed -> open
draft -> resultsPublished
open -> resultsPublished
resultsCalculated -> open
scheduled -> resultsCalculated
```

---

## 10.2. BallotQuestion State Machine

Transiciones válidas:

```text id="zptxzf"
draft -> active
active -> closed
closed -> archived
draft -> archived
```

Transiciones inválidas:

```text id="l1vb1i"
archived -> active
closed -> active
draft -> closed sin activar si política lo prohíbe
```

---

## 10.3. EligibleVoter State Machine

Transiciones válidas:

```text id="u1rlj7"
eligible -> voted
eligible -> excluded
eligible -> cancelled
voted -> archived
excluded -> archived
cancelled -> archived
```

Transiciones inválidas:

```text id="rouv8t"
voted -> eligible
excluded -> voted
archived -> eligible
```

---

## 10.4. VoteCast State Machine

Transiciones válidas:

```text id="f14d3d"
cast -> cancelled
cast -> archived
cancelled -> archived
```

Transiciones diferidas:

```text id="yszbwi"
cast -> superseded
```

Transiciones inválidas MVP:

```text id="v3amlg"
cancelled -> cast
archived -> cast
superseded -> cast
```

---

## 10.5. VotingResult State Machine

Transiciones válidas:

```text id="tqjlbd"
pending -> passed
pending -> failed
pending -> tie
pending -> informational
passed -> archived
failed -> archived
tie -> archived
informational -> archived
```

Transiciones inválidas:

```text id="fouvbv"
archived -> passed
failed -> passed sin recalculation
passed -> failed sin recalculation
```

---

# 11. DTO validation tests

## 11.1. `CreateVotingSessionDto`

Debe validar:

```text id="n96mr2"
title requerido
meetingId UUID opcional
visibility válida
votingMode válido
privacyMode válido
eligibilityMode válido
votingRule válido
opensAt ISO opcional
closesAt ISO opcional
opensAt menor que closesAt
rechaza tenantId
rechaza status
rechaza openedAt
rechaza closedAt
rechaza resultsCalculatedAt
rechaza resultsPublishedAt
rechaza archivedAt
```

---

## 11.2. `UpdateVotingSessionDto`

Debe validar:

```text id="nlfhj6"
campos opcionales válidos
title no vacío si se envía
opensAt menor que closesAt si ambos existen
description sanitizada
rechaza tenantId
rechaza status
rechaza createdBy
rechaza openedBy
rechaza closedBy
rechaza cancelledBy
rechaza archivedBy
```

---

## 11.3. `OpenVotingSessionDto`

Debe validar:

```text id="y6dhx5"
notifyEligibleVoters boolean
notificationChannels array permitido
notes sanitizadas
rechaza tenantId
rechaza openedBy
rechaza openedAt
```

---

## 11.4. `CloseVotingSessionDto`

Debe validar:

```text id="s35hk9"
notes opcional sanitizado
rechaza tenantId
rechaza closedBy
rechaza closedAt
```

---

## 11.5. `CancelVotingSessionDto`

Debe validar:

```text id="nkiqpf"
reason requerido
reason no vacío
notifyEligibleVoters boolean
rechaza tenantId
rechaza cancelledBy
rechaza cancelledAt
```

---

## 11.6. `CreateBallotQuestionDto`

Debe validar:

```text id="qp7zq5"
order requerido
title requerido
questionType válido
minSelections entero no negativo
maxSelections entero positivo
maxSelections >= minSelections
allowAbstention boolean
rechaza tenantId
rechaza status
```

---

## 11.7. `CreateBallotOptionDto`

Debe validar:

```text id="xs21hd"
order requerido
label requerido
optionType válido
isAbstention boolean
description sanitizada
rechaza tenantId
rechaza archivedAt
```

---

## 11.8. `CreateEligibleVoterDto`

Debe validar:

```text id="d8tm1y"
voterType requerido
eligibilitySource requerido
weight decimal string opcional
user requiere userId
person requiere personId
propertyUnit requiere propertyUnitId
role requiere roleId
proxyRepresentative requiere proxyId
rechaza tenantId
rechaza status
rechaza resolvedAt
```

---

## 11.9. `ResolveEligibleVotersDto`

Debe validar:

```text id="f9jkjf"
source requerido
source válido
voterType requerido
includeStatuses array opcional
deduplicate boolean
dryRun boolean
rechaza tenantId
```

---

## 11.10. `CastVoteDto`

Debe validar:

```text id="t8akx6"
eligibleVoterId requerido
selectedOptionId requerido para singleChoice/yesNoAbstain
selectedOptionIds requerido para multipleChoice
selectedOptionIds array no vacío
selectedOptionIds sin duplicados
rechaza tenantId
rechaza status
rechaza castAt
rechaza voterUserId
rechaza voterPersonId
rechaza voterPropertyUnitId
```

---

## 11.11. `CancelVoteDto`

Debe validar:

```text id="muj82o"
reason requerido
reason no vacío
rechaza tenantId
rechaza cancelledBy
rechaza cancelledAt
```

---

## 11.12. `PublishVotingResultsDto`

Debe validar:

```text id="mlnz5j"
notifyAudience boolean
notes opcional sanitizado
rechaza tenantId
rechaza publishedAt
```

---

## 11.13. `LinkVotingResultToResolutionDto`

Debe validar:

```text id="g1veq9"
meetingResolutionId requerido
meetingResolutionId UUID
rechaza tenantId
rechaza linkedBy
rechaza linkedAt
```

---

# 12. Application service tests

## 12.1. `VotingSessionService`

Debe probar:

```text id="tk3xua"
create session exitoso
create con meetingId del mismo tenant
rechazar meetingId de otro tenant
update session draft
rechazar update open
schedule session
open session válida
rechazar open sin preguntas
rechazar open sin opciones
rechazar open sin elegibles
close session open
cancel session con razón
archive session
auditar acciones
```

---

## 12.2. `VotingSessionStateMachineService`

Debe probar:

```text id="dyiaig"
transiciones válidas
transiciones inválidas
estados editables
estados cancelables
estados votables
estados terminales
```

---

## 12.3. `BallotQuestionService`

Debe probar:

```text id="wfglpw"
crear yesNoAbstain
crear singleChoice
crear multipleChoice
actualizar pregunta
rechazar update en sesión open
rechazar order duplicado
archivar pregunta
sanitizar contenido
auditar cambios
```

---

## 12.4. `BallotOptionService`

Debe probar:

```text id="n4ughk"
crear opción yes
crear opción no
crear opción abstain
crear opción standard
rechazar label duplicado
rechazar segunda abstención
rechazar optionType incoherente
actualizar opción
archivar opción
auditar cambios
```

---

## 12.5. `EligibleVoterService`

Debe probar:

```text id="f4zxge"
crear elegible user
crear elegible person
crear elegible propertyUnit
crear elegible owner
crear elegible resident con flag habilitada
rechazar resident con flag deshabilitada
crear elegible role
crear elegible proxyRepresentative con proxy approved
rechazar proxy no approved
rechazar referencias cross-tenant
rechazar elegible duplicado
excluir elegible
archivar elegible
auditar acciones
```

---

## 12.6. `EligibilityResolverService`

Debe probar:

```text id="n5y5hc"
resolver por meetingParticipants
resolver por meetingAttendance
resolver por owners
resolver por residents si flag habilitada
resolver por propertyUnits
resolver por roles
resolver mixed
deduplicate true
dryRun true no persiste
dryRun false persiste
rechazar source meetingAttendance sin meetingId
rechazar source tenant B
auditar resolved
```

---

## 12.7. `VoteCastingService`

Debe probar:

```text id="hltlm9"
votar singleChoice
votar yesNoAbstain
votar abstain
votar multipleChoice
rechazar votingSession no open
rechazar fuera de ventana
rechazar question no active
rechazar option de otra pregunta
rechazar option de otro tenant
rechazar eligibleVoter no eligible
rechazar eligibleVoter ajeno al actor
rechazar unidad ajena
rechazar voto duplicado
marcar eligibleVoter como voted
auditar voteCast.cast
```

---

## 12.8. `VotingPrivacyService`

Debe probar:

```text id="fykjsp"
identified devuelve selectedOptionId con permiso
identified no devuelve voto a terceros
secretBasic oculta selectedOptionId en DTO admin estándar
secretBasic oculta selectedOptionIds en DTO admin estándar
secretBasic oculta selectedOptionId en /me
secretBasic oculta selectedOptionId en auditoría
secretBasic oculta selectedOptionId en logs
```

---

## 12.9. `VotingTallyService`

Debe probar:

```text id="ly48ib"
calcular tallies por opción
calcular porcentajes
contar abstenciones
excluir votos cancelled
excluir votos archived
no modificar vote_casts
no modificar eligible_voters
usar Decimal
manejar empate
manejar cero votos
manejar cero elegibles con error controlado
```

---

## 12.10. `VotingResultService`

Debe probar:

```text id="utwvkq"
calcular informational
calcular simpleMajority passed
calcular simpleMajority failed
calcular absoluteMajority passed
calcular absoluteMajority failed
calcular plurality winner
calcular plurality tie
calcular unanimity passed
calcular unanimity failed
rechazar qualifiedMajority en MVP
rechazar weightedMajority avanzado en MVP
marcar resultsCalculatedAt
publicar resultados calculados
rechazar publicar sin cálculo
auditar resultados
```

---

## 12.11. `VotingResolutionLinkService`

Debe probar:

```text id="h06vte"
vincular resultado con resolución
rechazar resolución de otro tenant
rechazar resolución de otra reunión
rechazar resultado no calculado
no crear resolución automáticamente
no aprobar resolución automáticamente
no ejecutar acción automática
auditar link
```

---

## 12.12. `VotingNotificationService`

Debe probar:

```text id="z4qvgj"
emitir votingSession.opened
emitir votingSession.closed
emitir votingResults.published
payload mínimo
no incluir elegibles completos
no incluir votos individuales
no incluir selectedOptionId
no enviar email directamente
fallo de notification port no revierte votación salvo política explícita
```

---

## 12.13. `VotingAuditService`

Debe probar:

```text id="z3lhzo"
audita votingSession.created
audita votingSession.opened
audita votingSession.closed
audita voteCast.cast
audita voteCast.cancelled
audita votingResults.calculated
audita votingResults.published
audita votingResult.linkedToResolution
secretBasic no incluye selectedOptionId
metadata sanitizada
sin tokens
sin payload completo
```

---

# 13. Repository integration tests

## 13.1. `PrismaVotingSessionRepository`

Debe probar:

```text id="kbup12"
create voting session
findById tenant A
findById no devuelve tenant B
list con filtros
update session
update status
mark results calculated
mark results published
archive
soft delete
```

---

## 13.2. `PrismaBallotQuestionRepository`

Debe probar:

```text id="ek0h25"
create question
list by votingSession
find question by tenant
find question no devuelve tenant B
unique order por votingSession
update question
archive question
```

---

## 13.3. `PrismaBallotOptionRepository`

Debe probar:

```text id="q34iqc"
create option
list by question
find option by tenant
find option no devuelve tenant B
unique order por question
prevent second abstention
prevent duplicate label si índice se implementa
update option
archive option
```

---

## 13.4. `PrismaEligibleVoterRepository`

Debe probar:

```text id="cv91ha"
create eligible user
create eligible person
create eligible propertyUnit
create eligible proxyRepresentative
find eligible by tenant
find eligible no devuelve tenant B
prevent duplicate user eligible
prevent duplicate person eligible
prevent duplicate propertyUnit eligible
prevent duplicate proxy eligible
mark voted
exclude
archive
```

---

## 13.5. `PrismaVoteCastRepository`

Debe probar:

```text id="yihurt"
cast singleChoice vote
cast multipleChoice vote
find vote by tenant
find vote no devuelve tenant B
prevent duplicate vote active
cancel vote
archive vote
list votes identified
list votes secretBasic safe projection
```

---

## 13.6. `PrismaVotingTallyRepository`

Debe probar:

```text id="d4hc6t"
create tally
list tallies by session
list tallies by question
find tally no devuelve tenant B
archive previous tallies on recalculation si aplica
```

---

## 13.7. `PrismaVotingResultRepository`

Debe probar:

```text id="twlooe"
create result
find result by tenant
find result no devuelve tenant B
list results by session
publish result
archive result
```

---

## 13.8. `PrismaVotingResolutionLinkRepository`

Debe probar:

```text id="rb7m6t"
create link
find link by tenant
find link no devuelve tenant B
list links by session
archive link
```

---

# 14. API tests — Voting Sessions

## 14.1. `GET /api/v1/tenant/voting-sessions`

Debe probar:

```text id="xqxi3t"
401 sin token
403 sin votingSessions.read
200 con permiso
paginación
filtro status
filtro visibility
filtro privacyMode
filtro eligibilityMode
filtro votingRule
filtro meetingId
filtro opensFrom/opensTo
filtro closesFrom/closesTo
filtro resultsPublished
q search
no devuelve tenant B
```

---

## 14.2. `POST /api/v1/tenant/voting-sessions`

Debe probar:

```text id="wtrnim"
401 sin token
403 sin votingSessions.create
201 con body válido
201 con meetingId mismo tenant
422 sin title
422 privacyMode inválido
422 eligibilityMode inválido
422 opensAt >= closesAt
422 tenantId en body
403/404 meetingId tenant B
audita votingSession.created
```

---

## 14.3. `GET /api/v1/tenant/voting-sessions/{votingSessionId}`

Debe probar:

```text id="fu65tb"
401 sin token
403 sin votingSessions.read
200 con permiso
404 sesión inexistente
404/403 sesión tenant B
no expone datos prohibidos
```

---

## 14.4. `PATCH /api/v1/tenant/voting-sessions/{votingSessionId}`

Debe probar:

```text id="z10dzk"
401 sin token
403 sin votingSessions.update
200 actualiza draft
200 actualiza scheduled
409 actualiza open
409 actualiza closed
409 actualiza archived
422 status en body
422 tenantId en body
422 fechas inválidas
audita votingSession.updated
```

---

## 14.5. `POST /schedule`

Debe probar:

```text id="hocxqi"
200 draft -> scheduled
409 open -> scheduled
409 closed -> scheduled
409 archived -> scheduled
audita votingSession.scheduled
```

---

## 14.6. `POST /open`

Debe probar:

```text id="gvw8sp"
200 draft -> open si completa
200 scheduled -> open
422 sin preguntas
422 pregunta sin opciones
422 sin elegibles
409 cancelled -> open
409 archived -> open
notificación si notifyEligibleVoters true
audita votingSession.opened
```

---

## 14.7. `POST /close`

Debe probar:

```text id="tmnn14"
200 open -> closed
409 draft -> closed
409 scheduled -> closed
409 closed -> closed si no idempotente
409 cancelled -> closed
audita votingSession.closed
```

---

## 14.8. `POST /cancel`

Debe probar:

```text id="mb3a5d"
200 draft -> cancelled
200 scheduled -> cancelled
200 open -> cancelled
422 sin reason
409 closed -> cancelled
409 resultsPublished -> cancelled
409 archived -> cancelled
notificación si notifyEligibleVoters true
audita votingSession.cancelled
```

---

## 14.9. `POST /archive`

Debe probar:

```text id="r4wkcr"
200 cancelled -> archived
200 resultsPublished -> archived
200 closed -> archived si política permite
409 open -> archived
soft delete lógico
no elimina preguntas/opciones/elegibles/votos/resultados
audita votingSession.archived
```

---

# 15. API tests — Ballot Questions

Debe probar endpoints:

```text id="iz0hc3"
GET /api/v1/tenant/voting-sessions/{votingSessionId}/questions
POST /api/v1/tenant/voting-sessions/{votingSessionId}/questions
GET /api/v1/tenant/ballot-questions/{questionId}
PATCH /api/v1/tenant/ballot-questions/{questionId}
POST /api/v1/tenant/ballot-questions/{questionId}/archive
```

Casos mínimos:

```text id="yt4yki"
401 sin token
403 sin permiso
201 crear yesNoAbstain
201 crear singleChoice
201 crear multipleChoice
422 sin title
422 maxSelections < minSelections
409 order duplicado
409 crear en sesión open
403/404 votingSession tenant B
403/404 question tenant B
200 update
200 archive
auditoría por acción
```

---

# 16. API tests — Ballot Options

Debe probar endpoints:

```text id="fau59v"
GET /api/v1/tenant/ballot-questions/{questionId}/options
POST /api/v1/tenant/ballot-questions/{questionId}/options
GET /api/v1/tenant/ballot-options/{optionId}
PATCH /api/v1/tenant/ballot-options/{optionId}
POST /api/v1/tenant/ballot-options/{optionId}/archive
```

Casos mínimos:

```text id="dauf4k"
401 sin token
403 sin permiso
201 crear option yes
201 crear option no
201 crear option abstain
201 crear option standard
422 sin label
409 order duplicado
409 label duplicado
409 segunda abstención
409 crear opción en sesión open
403/404 question tenant B
403/404 option tenant B
200 update
200 archive
auditoría por acción
```

---

# 17. API tests — Eligible Voters

Debe probar endpoints:

```text id="ey3mvv"
GET /api/v1/tenant/voting-sessions/{votingSessionId}/eligible-voters
POST /api/v1/tenant/voting-sessions/{votingSessionId}/eligible-voters
POST /api/v1/tenant/voting-sessions/{votingSessionId}/eligible-voters/resolve
GET /api/v1/tenant/eligible-voters/{eligibleVoterId}
PATCH /api/v1/tenant/eligible-voters/{eligibleVoterId}
POST /api/v1/tenant/eligible-voters/{eligibleVoterId}/exclude
POST /api/v1/tenant/eligible-voters/{eligibleVoterId}/archive
```

Casos mínimos:

```text id="xjpbnp"
401 sin token
403 sin permiso
crear elegible user
crear elegible person
crear elegible propertyUnit
crear elegible owner
crear elegible resident con flag enabled
rechazar resident con flag disabled
crear elegible role
crear elegible proxyRepresentative con proxy approved
422 user sin userId
422 person sin personId
422 propertyUnit sin propertyUnitId
422 role sin roleId
422 proxyRepresentative sin proxyId
403 userId tenant B
403 personId tenant B
403 propertyUnitId tenant B
403 roleId tenant B
403 proxyId tenant B
422 proxy no approved
409 elegible duplicado
resolve meetingParticipants
resolve meetingAttendance
resolve owners
resolve propertyUnits
dryRun no persiste
exclude requiere reason
archive
auditoría por acción
```

---

# 18. API tests — Votes administrativas

Debe probar endpoints:

```text id="jxmwxc"
GET /api/v1/tenant/voting-sessions/{votingSessionId}/votes
GET /api/v1/tenant/votes/{voteCastId}
POST /api/v1/tenant/votes/{voteCastId}/cancel
```

Casos mínimos:

```text id="f0w2wa"
401 sin token
403 sin votes.read
200 list identified muestra selectedOptionId solo con permiso
200 list secretBasic oculta selectedOptionId
404/403 votingSession tenant B
404/403 vote tenant B
cancel requiere votes.cancel
cancel requiere reason
cancel marca requiresResultsRecalculation
cancel no expone selectedOptionId en auditoría secretBasic
audita voteCast.cancelled
```

---

# 19. API tests — Results

Debe probar endpoints:

```text id="swdvzj"
POST /api/v1/tenant/voting-sessions/{votingSessionId}/calculate-results
GET /api/v1/tenant/voting-sessions/{votingSessionId}/results
POST /api/v1/tenant/voting-sessions/{votingSessionId}/publish-results
POST /api/v1/tenant/voting-sessions/{votingSessionId}/results/{resultId}/link-resolution
```

Casos mínimos:

```text id="qg091h"
401 sin token
403 sin permiso
409 calculate en sesión open
200 calculate en sesión closed
calcular simpleMajority
calcular absoluteMajority
calcular plurality
calcular unanimity
calcular informational
excluir votos cancelled
no modificar votos
no modificar elegibles
usar Decimal string
200 get results admin
409 publish sin cálculo
200 publish con resultados calculados
publish no expone público
notifica si notifyAudience true
201 link-resolution válido
403/404 result tenant B
403/404 resolution tenant B
422 resolution de otra reunión
no ejecuta acción automática
auditoría por acción
```

---

# 20. API tests — Endpoints `/me`

## 20.1. `GET /api/v1/me/voting-sessions`

Debe probar:

```text id="xjnyge"
401 sin token
403 sin membership
200 owner ve votaciones owners/propertyUnits propias
200 resident ve votaciones residents si permitido
200 usuario ve votaciones tenant si elegible
200 usuario ve votaciones por role si elegible
no ve votaciones ajenas
no ve tenant B
no devuelve elegibles completos
no devuelve votos de terceros
no devuelve selectedOptionId
no devuelve auditoría
```

---

## 20.2. `GET /api/v1/me/voting-sessions/{votingSessionId}`

Debe probar:

```text id="vx2db8"
200 votación propia
403/404 votación ajena
403/404 votación tenant B
DTO minimizado
sin metadata interna
sin auditoría
```

---

## 20.3. `GET /api/v1/me/voting-sessions/{votingSessionId}/questions`

Debe probar:

```text id="eebyjg"
200 preguntas de votación propia
incluye opciones válidas
403/404 votación ajena
no incluye información administrativa
myVoteStatus correcto
```

---

## 20.4. `GET /api/v1/me/voting-sessions/{votingSessionId}/participation`

Debe probar:

```text id="jxgg47"
200 participación propia
secretBasic no muestra selectedOptionId
identified puede mostrar voto propio si política lo permite
no muestra votos de terceros
no muestra eligibleVoters ajenos
```

---

## 20.5. `POST /api/v1/me/voting-sessions/{votingSessionId}/questions/{questionId}/vote`

Debe probar:

```text id="h1htnl"
201 voto singleChoice
201 voto yesNoAbstain
201 voto abstain
201 voto multipleChoice
403 no elegible
403 unidad ajena
403 persona ajena
409 voto duplicado
409 sesión draft
409 sesión closed
409 fuera de ventana
422 option de otra pregunta
422 selectedOptionIds duplicados
422 multipleChoice bajo mínimo
422 multipleChoice sobre máximo
422 proxy no approved
secretBasic response no incluye selectedOptionId
identified response puede incluir selectedOptionId propio
audita voteCast.cast
```

---

## 20.6. `GET /api/v1/me/voting-sessions/{votingSessionId}/results`

Debe probar:

```text id="ia4yxn"
200 resultados publicados propios
404 resultados no publicados
403/404 votación ajena
no muestra identidades
no muestra votos individuales
no muestra selectedOptionId por votante
```

---

# 21. Authorization tests

## 21.1. Sin autenticación

Todos los endpoints privados deben devolver:

```text id="arkxe2"
401 UNAUTHORIZED
```

---

## 21.2. Usuario sin membership

Debe devolver:

```text id="zmid1e"
403 FORBIDDEN
```

---

## 21.3. Usuario disabled

Debe devolver:

```text id="j5wf1y"
403 FORBIDDEN
```

---

## 21.4. Usuario sin permisos

Debe devolver:

```text id="mtor93"
403 FORBIDDEN
```

Casos:

```text id="z74hwq"
sin votingSessions.create no crea sesión
sin votingSessions.open no abre sesión
sin ballotQuestions.create no crea pregunta
sin ballotOptions.create no crea opción
sin eligibleVoters.create no crea elegible
sin eligibleVoters.resolve no resuelve elegibles
sin votes.read no lista votos
sin votes.cancel no anula voto
sin votingResults.calculate no calcula resultados
sin votingResults.publish no publica resultados
sin votingResults.linkResolution no vincula resolución
```

---

## 21.5. PlatformAdmin

Debe probar:

```text id="hup0rm"
no accede automáticamente a votaciones internas
acceso excepcional requiere permiso explícito
acceso excepcional debe auditarse
```

---

# 22. Multitenancy tests

Debe probar aislamiento en todas las entidades:

```text id="f6oyky"
tenant A no ve votingSessions tenant B
tenant A no ve ballotQuestions tenant B
tenant A no ve ballotOptions tenant B
tenant A no ve eligibleVoters tenant B
tenant A no ve voteCasts tenant B
tenant A no ve votingTallies tenant B
tenant A no ve votingResults tenant B
tenant A no ve votingResolutionLinks tenant B
tenant A no modifica votingSessions tenant B
tenant A no abre votingSessions tenant B
tenant A no cierra votingSessions tenant B
tenant A no calcula resultados tenant B
tenant A no publica resultados tenant B
tenant A no vincula resolución tenant B
```

Debe probar referencias cross-tenant:

```text id="yqpwm9"
tenant A no usa meetingId tenant B
tenant A no usa questionId tenant B
tenant A no usa optionId tenant B
tenant A no usa eligibleVoterId tenant B
tenant A no usa voteCastId tenant B
tenant A no usa votingResultId tenant B
tenant A no usa meetingResolutionId tenant B
tenant A no usa userId tenant B
tenant A no usa personId tenant B
tenant A no usa propertyUnitId tenant B
tenant A no usa roleId tenant B
tenant A no usa proxyId tenant B
```

Patrones prohibidos:

```typescript id="tzkjce"
prisma.votingSession.findUnique({ where: { id: votingSessionId } });
prisma.ballotQuestion.findUnique({ where: { id: questionId } });
prisma.ballotOption.findUnique({ where: { id: optionId } });
prisma.eligibleVoter.findUnique({ where: { id: eligibleVoterId } });
prisma.voteCast.findUnique({ where: { id: voteCastId } });
```

Patrón requerido:

```typescript id="h80w6t"
prisma.votingSession.findFirst({
  where: {
    id: votingSessionId,
    tenantId: currentTenant.id
  }
});
```

---

# 23. Own-resource tests

Debe probar:

```text id="l2ynwc"
ownerUserA ve votación por propertyUnitA101
ownerUserA no ve votación por propertyUnitA102
residentUserA ve votación residents solo si habilitada
residentUserA no ve votación owners si no es owner
ownerResidentUserA ve votaciones owners y residents si corresponde
usuario ve votación por eligibleUser
usuario ve votación por eligiblePerson propia
usuario ve votación por role si aplica
usuario no ve votación tenant B
usuario no ve eligibleVoters ajenos
usuario no ve votos de terceros
usuario no vota por unidad ajena
usuario no vota por persona ajena
usuario no usa eligibleVoterId ajeno
usuario no consulta resultados no publicados
usuario consulta resultados publicados si pertenece a audiencia
```

---

# 24. Eligibility tests

## 24.1. Elegibilidad manual

```text id="sv4saj"
crear elegible user válido
crear elegible person válido
crear elegible propertyUnit válido
crear elegible owner válido
crear elegible resident válido si feature flag
crear elegible role válido
crear elegible proxyRepresentative válido con proxy approved
```

---

## 24.2. Elegibilidad resuelta

```text id="hkvsji"
resolver desde meetingParticipants
resolver desde meetingAttendance present
resolver desde meetingAttendance late
resolver desde meetingAttendance represented
no resolver absent si no está permitido
resolver owners desde ownership activa
resolver residents desde residency activa si flag habilitada
resolver propertyUnits activas
resolver roles
deduplicar elegibles
dryRun no persiste
```

---

## 24.3. Elegibilidad inválida

```text id="up76ry"
rechazar userId tenant B
rechazar personId tenant B
rechazar propertyUnitId tenant B
rechazar roleId tenant B
rechazar proxyId tenant B
rechazar proxy submitted
rechazar proxy rejected
rechazar proxy cancelled
rechazar proxy archived
rechazar resident si flag disabled
rechazar duplicate eligible
```

---

# 25. Vote casting tests

## 25.1. Estados permitidos

Debe probar:

```text id="axmuxn"
draft no permite voto
scheduled no permite voto
open permite voto
closed no permite voto
resultsCalculated no permite voto
resultsPublished no permite voto
cancelled no permite voto
archived no permite voto
```

---

## 25.2. Ventana de votación

Debe probar:

```text id="gdysmo"
voto antes de opensAt rechazado
voto exactamente en opensAt permitido
voto dentro de ventana permitido
voto exactamente en closesAt permitido si política <=
voto después de closesAt rechazado
sin opensAt permite desde open
sin closesAt permite mientras open
```

---

## 25.3. Duplicidad

Debe probar:

```text id="gfrofb"
mismo eligibleVoter no vota dos veces en misma pregunta
mismo eligibleVoter puede votar preguntas distintas
eligibleVoter distinto puede votar misma pregunta
voto cancelled no cuenta para tally
voto cancelled puede permitir revoto solo si política explícita futura; MVP recomendado no permitir sin decisión
```

Resultado esperado:

```text id="mtykd8"
409 VOTE_DUPLICATE
```

---

## 25.4. Selección

Debe probar:

```text id="od0t2j"
singleChoice selectedOptionId válido
singleChoice selectedOptionIds rechazado
yesNoAbstain yes válido
yesNoAbstain no válido
yesNoAbstain abstain válido si allowAbstention
yesNoAbstain abstain rechazado si allowAbstention false
multipleChoice selectedOptionIds válido
multipleChoice bajo min rechazado
multipleChoice sobre max rechazado
multipleChoice opción duplicada rechazada
opción de otra pregunta rechazada
opción de otro tenant rechazada
```

---

# 26. Privacy tests

## 26.1. `identified`

Debe probar:

```text id="fz9lln"
admin con votes.read ve selectedOptionId
admin sin permiso no ve votos
usuario ve voto propio si política lo permite
usuario no ve votos de terceros
audit puede registrar ballotOptionId si política lo permite
logs no contienen payload completo
```

---

## 26.2. `secretBasic`

Debe probar:

```text id="w3ku3t"
admin estándar no ve selectedOptionId
admin estándar no ve selectedOptionIds
GET votes oculta opción individual
GET participation oculta opción individual
POST vote response oculta selectedOptionId
audit voteCast.cast no contiene selectedOptionId
audit voteCast.cast no contiene selectedOptionIds
logs no contienen selectedOptionId
metrics no contienen selectedOptionId
resultados son agregados
secretBasic no se describe como criptográfico
```

---

## 26.3. Resultados agregados

Debe probar:

```text id="ng5s2n"
resultados no incluyen eligibleVoterId por tally
resultados no incluyen userId por voto
resultados no incluyen personId por voto
resultados no incluyen propertyUnitId por voto
resultados no revelan identidad individual
```

---

# 27. Result calculation tests

## 27.1. `informational`

```text id="sc7t0w"
votingRule = informational
resultado esperado resultStatus = informational
thresholdMet = null
```

---

## 27.2. `simpleMajority`

Escenario passed:

```text id="u1dkr6"
yes = 20
no = 10
abstain = 2
expected resultStatus = passed
thresholdMet = true
```

Escenario failed:

```text id="wskp4z"
yes = 10
no = 20
abstain = 2
expected resultStatus = failed
thresholdMet = false
```

Escenario tie:

```text id="p54jn8"
yes = 10
no = 10
expected resultStatus = tie
```

---

## 27.3. `absoluteMajority`

Escenario passed:

```text id="s6wbzr"
validVotesWithoutAbstention = 30
yes = 16
expected passed
```

Escenario failed:

```text id="mocclj"
validVotesWithoutAbstention = 30
yes = 15
expected failed
```

---

## 27.4. `plurality`

Debe probar:

```text id="kw8go5"
opción A gana
opción B gana
empate entre A y B
abstención no es winningOption si política lo define así
```

---

## 27.5. `unanimity`

Debe probar:

```text id="cx8cnu"
todos yes -> passed
un no -> failed
solo abstenciones -> informational o failed según política definida
sin votos -> pending/error controlado
```

---

## 27.6. Exclusiones

Debe probar:

```text id="d915wn"
votos cancelled no cuentan
votos archived no cuentan
votos superseded no cuentan
elegibles excluded no cuentan como totalEligible activo
votos de tenant B no cuentan
```

---

## 27.7. Determinismo

Debe probar:

```text id="cxcaia"
mismo set de votos produce mismo resultado
calcular resultados dos veces produce resultado consistente
forceRecalculate reemplaza tallies previos de forma controlada
calcular resultados no modifica vote_casts
calcular resultados no modifica eligible_voters salvo estado de sesión
```

---

# 28. Notification integration tests

Debe probar integración con `012-communications-notifications` mediante puerto mock.

Eventos:

```text id="hob623"
votingSession.opened
votingSession.closed
votingResults.published
```

Casos:

```text id="p7xdpc"
open con notifyEligibleVoters true invoca VotingNotificationPort
open con notifyEligibleVoters false no invoca port
cancel con notifyEligibleVoters true invoca port si aplica
publish-results con notifyAudience true invoca port
payload mínimo
payload contiene sourceType=votingSession
payload contiene sourceId=votingSessionId
payload contiene actionUrl
payload no contiene lista completa de elegibles
payload no contiene votos individuales
payload no contiene selectedOptionId
payload no contiene resultados no publicados
fallo del port no revierte votación salvo política crítica explícita
```

---

# 29. Audit tests

Debe verificar emisión de eventos:

```text id="ydyiu7"
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

Metadata permitida:

```text id="jvku4l"
votingSessionId
ballotQuestionId
ballotOptionId solo en identified si aplica
eligibleVoterId
voteCastId
meetingId
meetingResolutionId
votingStatus
privacyMode
eligibilityMode
votingRule
questionType
resultStatus
totalEligible
totalVotes
thresholdMet
traceId
```

Metadata prohibida:

```text id="vk56sc"
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
```

---

# 30. Observability tests

## 30.1. Logs

Debe probar que logs incluyan:

```text id="e2eqtp"
traceId
requestId
action
outcome
status
durationMs
errorCode cuando aplica
privacyMode
votingStatus
```

No deben incluir:

```text id="prsy5v"
Authorization header
tokens
cookies
secretos
selectedOptionId en secretBasic
selectedOptionIds en secretBasic
voto completo
emails completos
teléfonos completos
cédulas
stack trace en producción
SQL raw
```

---

## 30.2. Métricas

Debe probar métricas:

```text id="bsdtgs"
voting_sessions_created_total
voting_sessions_opened_total
voting_sessions_closed_total
voting_sessions_cancelled_total
votes_cast_total
votes_cancelled_total
voting_results_calculated_total
voting_results_published_total
```

Labels permitidos:

```text id="ycuphe"
votingStatus
privacyMode
eligibilityMode
votingRule
questionType
resultStatus
outcome
```

Labels prohibidos:

```text id="xgls7s"
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
```

---

# 31. Security tests

Debe probar:

```text id="qfco2x"
no public endpoints for voting
no public endpoints for results
no public endpoints for vote casting
no votingSession cross-tenant
no ballotQuestion cross-tenant
no ballotOption cross-tenant
no eligibleVoter cross-tenant
no voteCast cross-tenant
no votingResult cross-tenant
no votingResolutionLink cross-tenant
no meetingId tenant B
no meetingResolutionId tenant B
no userId tenant B
no personId tenant B
no propertyUnitId tenant B
no roleId tenant B
no proxyId tenant B
no vote duplicate
no vote outside window
no vote in closed/cancelled/archived session
no vote by non-eligible user
no vote by foreign propertyUnit
no vote with unapproved proxy
no selectedOptionId leakage in secretBasic
no selectedOptionId in logs for secretBasic
no selectedOptionId in audit for secretBasic
no automatic charge generation
no automatic fine generation
no automatic legal workflow
safe error messages
```

---

# 32. Public endpoint negative tests

OpenAPI y routing no deben permitir:

```text id="bvhsfm"
GET /api/v1/public/tenants/{slug}/voting-sessions
GET /api/v1/public/tenants/{slug}/voting-sessions/{votingSessionId}
GET /api/v1/public/tenants/{slug}/voting-sessions/{votingSessionId}/results
POST /api/v1/public/tenants/{slug}/voting-sessions/{votingSessionId}/vote
GET /api/v1/public/tenants/{slug}/votes
GET /api/v1/public/tenants/{slug}/results
```

Resultado esperado:

```text id="sf299l"
404 route not found
```

o equivalente, sin exponer información interna.

---

# 33. OpenAPI tests

## 33.1. Tags

Debe validar:

```text id="aw6rl6"
Voting Sessions
Ballot Questions
Ballot Options
Eligible Voters
Votes
Voting Results
My Voting
```

---

## 33.2. Extensiones requeridas

Para endpoints tenant:

```yaml id="s92ig6"
x-tenant-scope: true
x-auth-required: true
x-required-permission: votingSessions.create
x-audit-event: votingSession.created
```

Para endpoints `/me`:

```yaml id="u9egdd"
x-tenant-scope: true
x-auth-required: true
x-own-resource: true
x-required-permission: votes.cast.own
```

Para emisión de voto:

```yaml id="rlkw1r"
x-vote-casting: true
x-eligibility-required: true
x-duplicate-protected: true
x-privacy-mode-aware: true
x-audit-event: voteCast.cast
```

Para resultados:

```yaml id="zo2rxy"
x-result-calculation: deterministic
x-public-exposure: false
```

Para `secretBasic`:

```yaml id="rd4j55"
x-privacy-mode-aware: true
x-secret-basic-selected-option-hidden: true
```

---

## 33.3. Endpoints prohibidos

OpenAPI no debe documentar:

```text id="t4r59f"
GET /api/v1/public/tenants/{slug}/voting-sessions
GET /api/v1/public/tenants/{slug}/voting-sessions/{votingSessionId}
GET /api/v1/public/tenants/{slug}/voting-sessions/{votingSessionId}/results
POST /api/v1/public/tenants/{slug}/voting-sessions/{votingSessionId}/vote
```

---

# 34. Performance tests

## 34.1. Objetivo MVP

```text id="xryxk6"
p95 < 700 ms para listados paginados.
p95 < 1500 ms para cálculo de resultados con 500 elegibles y 10 preguntas.
```

---

## 34.2. Escenarios

Debe medir:

```text id="ksanqi"
GET /tenant/voting-sessions con 1.000 sesiones por tenant
GET /tenant/voting-sessions/{id}/eligible-voters con 500 elegibles
GET /tenant/voting-sessions/{id}/votes con 500 votos
GET /me/voting-sessions con 100 votaciones elegibles
POST /calculate-results con 500 elegibles y 10 preguntas
POST /vote con carga concurrente controlada
```

---

## 34.3. Validaciones

```text id="f32c7j"
paginación obligatoria
pageSize máximo 100
sin N+1 evidente
índices usados
no cargar votos individuales en listados si no se requieren
no calcular resultados en cada listado
no exponer selectedOptionId innecesariamente
```

---

# 35. Concurrency tests

Debe probar:

```text id="y3s3l3"
dos requests simultáneos de voto mismo eligibleVoter/question
solo uno debe crear voteCast
el otro debe devolver VOTE_DUPLICATE
índice único protege duplicidad
transacción captura conflicto
idempotency key evita reintento accidental
```

Escenario:

```text id="h4gz9p"
Request A y Request B intentan votar al mismo tiempo con:
tenantId + votingSessionId + ballotQuestionId + eligibleVoterId iguales.
```

Resultado esperado:

```text id="sfg2y1"
1 voto creado
1 respuesta 409 VOTE_DUPLICATE
```

---

# 36. Smoke tests

Debe ejecutarse flujo mínimo:

```text id="xhz7ux"
1. GET /api/v1/health
2. POST /api/v1/tenant/voting-sessions
3. POST /api/v1/tenant/voting-sessions/{votingSessionId}/questions
4. POST /api/v1/tenant/ballot-questions/{questionId}/options yes
5. POST /api/v1/tenant/ballot-questions/{questionId}/options no
6. POST /api/v1/tenant/ballot-questions/{questionId}/options abstain
7. POST /api/v1/tenant/voting-sessions/{votingSessionId}/eligible-voters
8. POST /api/v1/tenant/voting-sessions/{votingSessionId}/schedule
9. POST /api/v1/tenant/voting-sessions/{votingSessionId}/open
10. GET /api/v1/me/voting-sessions
11. GET /api/v1/me/voting-sessions/{votingSessionId}/questions
12. POST /api/v1/me/voting-sessions/{votingSessionId}/questions/{questionId}/vote
13. POST /api/v1/tenant/voting-sessions/{votingSessionId}/close
14. POST /api/v1/tenant/voting-sessions/{votingSessionId}/calculate-results
15. GET /api/v1/tenant/voting-sessions/{votingSessionId}/results
16. POST /api/v1/tenant/voting-sessions/{votingSessionId}/publish-results
17. GET /api/v1/me/voting-sessions/{votingSessionId}/results
18. POST /api/v1/tenant/voting-sessions/{votingSessionId}/results/{resultId}/link-resolution
19. GET /api/v1/public/tenants/{slug}/voting-sessions debe no existir
```

---

# 37. Comandos sugeridos

## 37.1. Comandos específicos

```bash id="oyroho"
npm run test:voting
npm run test:voting:unit
npm run test:voting:domain
npm run test:voting:dto
npm run test:voting:application
npm run test:voting:repositories
npm run test:voting:api
npm run test:voting:authorization
npm run test:voting:own-resource
npm run test:voting:eligibility
npm run test:voting:casting
npm run test:voting:privacy
npm run test:voting:multitenancy
npm run test:voting:results
npm run test:voting:notifications
npm run test:voting:audit
npm run test:voting:observability
npm run test:voting:security
npm run test:voting:openapi
npm run test:voting:performance
npm run test:voting:smoke
```

---

## 37.2. Comandos generales

```bash id="invhk2"
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

# 38. CI/CD gates

El pipeline debe fallar si:

```text id="ukpn1p"
lint falla
typecheck falla
unit tests fallan
DTO validation tests fallan
repository tests fallan
API tests fallan
authorization tests fallan
own-resource tests fallan
eligibility tests fallan
vote casting tests fallan
privacy tests fallan
multitenancy tests fallan
result calculation tests fallan
notification integration tests fallan
audit tests fallan
observability tests fallan
security tests fallan
OpenAPI validation falla
OpenAPI documenta endpoints públicos prohibidos
concurrency duplicate vote test falla
build falla
```

---

# 39. Coverage mínimo recomendado

```text id="cpflbi"
Unit tests: >= 85%
Application services: >= 85%
Use cases: >= 85%
Repositories críticos: >= 80%
API endpoints críticos: 100% de rutas definidas
Authorization tests: 100% de permisos críticos
Multitenancy tests: 100% de entidades tenant-scoped
Privacy tests: 100% de reglas secretBasic
Security tests: 100% de reglas críticas
```

Regla:

```text id="jppff3"
La cobertura numérica no reemplaza pruebas de elegibilidad, privacidad, duplicidad, multitenancy y autorización.
```

---

# 40. Matriz de trazabilidad funcional

| Requisito                      | Prueba principal                     |
| ------------------------------ | ------------------------------------ |
| Crear votación                 | API + use-case + repository          |
| Asociar votación a reunión     | Service + multitenancy               |
| Crear preguntas                | API + domain + repository            |
| Crear opciones                 | API + duplicate checks               |
| Definir elegibles              | API + eligibility service            |
| Resolver elegibles             | Eligibility resolver + integration   |
| Abrir votación                 | API + state machine                  |
| Emitir voto                    | `/me` + vote casting                 |
| Evitar voto duplicado          | Unique index + service + concurrency |
| Votar dentro de ventana        | VotingWindowPolicy                   |
| Cerrar votación                | API + state machine                  |
| Calcular resultados            | Result service + tally               |
| Publicar resultados            | API + notification                   |
| Consultar votaciones propias   | `/me` + own-resource                 |
| Consultar participación propia | `/me` + privacy                      |
| Vincular resolución            | Service + meeting integration        |
| Anular voto                    | API + audit                          |
| Privacy identified             | Privacy tests                        |
| Privacy secretBasic            | Privacy tests                        |
| No endpoints públicos          | Security + OpenAPI negative          |
| Auditar                        | Audit tests                          |

---

# 41. Riesgos cubiertos por pruebas

| Riesgo                        | Pruebas                    |
| ----------------------------- | -------------------------- |
| Votación cross-tenant         | Multitenancy               |
| Pregunta/opción cross-tenant  | API + repository           |
| Elegible cross-tenant         | Eligibility + multitenancy |
| Voto cross-tenant             | Vote casting + repository  |
| Voto duplicado                | Duplicate + concurrency    |
| Voto fuera de ventana         | VotingWindowPolicy         |
| Voto de no elegible           | Own-resource + eligibility |
| Voto por unidad ajena         | Own-resource               |
| Proxy no aprobado             | Eligibility + vote casting |
| Fuga de voto en secretBasic   | Privacy + audit + logs     |
| Resultado incorrecto          | Tally scenarios            |
| Resultado público accidental  | Public negative tests      |
| Publicación sin cálculo       | Results API                |
| Ejecución automática indebida | Resolution link tests      |
| Logs con datos sensibles      | Observability tests        |
| Auditoría insuficiente        | Audit tests                |
| OpenAPI inseguro              | OpenAPI tests              |

---

# 42. No aceptación

La implementación no debe aceptarse si:

```text id="nukwx5"
permite votaciones cross-tenant
permite preguntas cross-tenant
permite opciones cross-tenant
permite elegibles cross-tenant
permite votos cross-tenant
permite voto duplicado
permite voto fuera de ventana
permite voto en sesión cerrada
permite voto de usuario no elegible
permite voto por unidad ajena
permite voto con proxy no aprobado
permite selectedOptionId en secretBasic en DTO admin estándar
permite selectedOptionId en logs secretBasic
permite selectedOptionId en auditoría secretBasic
permite ver votos de terceros en /me
permite publicar resultados sin cálculo
permite resultados públicos
crea endpoints públicos de votación
documenta endpoints públicos en OpenAPI
calcula resultados modificando votos
usa float/double para porcentajes persistidos
ejecuta acciones automáticas desde resultados
genera cargos desde resultados
genera multas desde resultados
presenta secretBasic como anonimato criptográfico
presenta MVP como votación legalmente certificada
omite auditoría de operaciones críticas
```

---

# 43. Resultado esperado

Al completar este plan de pruebas, el módulo `014-voting-basic` tendrá validación suficiente para asegurar que:

```text id="v3z2sp"
- las votaciones están aisladas por tenant;
- las preguntas y opciones pertenecen al tenant correcto;
- los elegibles están validados por tenant y por sujeto lógico;
- el usuario solo vota cuando es elegible;
- no existen votos duplicados activos;
- no se vota fuera de ventana;
- no se vota en sesiones cerradas;
- no se vota por unidades o personas ajenas;
- no se vota con proxy no aprobado;
- identified se comporta como modo identificado;
- secretBasic oculta opción individual en API, logs y auditoría;
- los resultados son agregados y determinísticos;
- los resultados no modifican votos;
- los resultados no ejecutan acciones automáticas;
- los endpoints /me no exponen datos de terceros;
- no existen endpoints públicos de votación;
- las operaciones críticas se auditan;
- logs y métricas no filtran datos sensibles;
- OpenAPI refleja el contrato real;
- CI bloquea regresiones críticas.
```

---

## 44. Decisión final del plan de pruebas

El módulo `014-voting-basic` debe probarse como un módulo sensible, operativo, auditable y de alta integridad.

La prioridad de pruebas debe ser:

```text id="dovynq"
1. Multitenancy.
2. Elegibilidad.
3. Prevención de voto duplicado.
4. Recurso propio.
5. Privacidad secretBasic.
6. Ventana y estado de votación.
7. Cálculo de resultados.
8. No exposición pública.
9. Auditoría.
10. Observabilidad segura.
```

Sin estas pruebas, el módulo no debe pasar a implementación productiva.
