# Plan — Spec 014 Voting Basic

## 1. Información del documento

| Campo           | Valor                                                                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                            |
| Spec ID         | 014                                                                                                                                      |
| Módulo          | Voting Basic                                                                                                                             |
| Documento       | Plan técnico                                                                                                                             |
| Ruta            | `docs/specs/014-voting-basic/plan.md`                                                                                                    |
| Versión         | 0.1                                                                                                                                      |
| Estado          | needs-review                                                                                                                             |
| Fecha           | 2026-07-20                                                                                                                               |
| Documento base  | `docs/specs/014-voting-basic/spec.md`                                                                                                    |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `007-audit`, `012-communications-notifications`, `013-meetings-attendance` |
| Relacionado con | futuras specs de votación avanzada, actas certificadas, firma electrónica, voto ponderado, reglas legales y documentos de asamblea       |

---

## 2. Propósito

Este documento define el plan técnico para implementar el módulo `014-voting-basic`.

El módulo permitirá gestionar votaciones internas básicas dentro de RESIDENT Core, asociadas principalmente a reuniones o asambleas, con control de elegibilidad, emisión de voto, prevención de duplicados, cálculo de resultados, publicación controlada, auditoría y protección de privacidad.

Regla central:

```text id="afzpuz"
El módulo Voting Basic debe permitir votaciones internas tenant-scoped, permissioned, eligibility-aware, duplicate-safe, privacy-mode aware, tally-deterministic, audit-heavy y sin exposición pública.
```

---

## 3. Decisión técnica inicial

### 3.1. Nombre técnico del módulo

```text id="m3y9hf"
voting
```

---

### 3.2. Ruta sugerida

```text id="vepp8j"
apps/api/src/modules/voting/
```

---

### 3.3. Tipo de módulo

```text id="mge1gw"
Tenant-scoped
Meeting-aware
Eligibility-aware
Own-resource protected
Privacy-mode aware
State-controlled
Audit-heavy
Notification-ready
No-public-endpoints
```

---

### 3.4. Estilo arquitectónico

El módulo seguirá el mismo estilo del Core:

```text id="yidpfj"
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
auditoría obligatoria
```

---

### 3.5. Decisión MVP

Para MVP se implementará:

```text id="q9jdaf"
- votaciones asociadas a reuniones;
- votaciones independientes solo si el tenant lo habilita;
- preguntas simples;
- opciones simples;
- sí/no/abstención;
- opción única;
- opción múltiple limitada;
- elegibilidad manual;
- elegibilidad resuelta desde meeting participants;
- elegibilidad resuelta desde meeting attendance;
- elegibilidad por propietarios;
- elegibilidad por unidades;
- elegibilidad por residentes si política lo permite;
- voto propio;
- voto por representación básica si existe proxy aprobado;
- prevención de voto duplicado;
- modo identified;
- modo secretBasic sin anonimato criptográfico fuerte;
- cierre de votación;
- cálculo básico de resultados;
- publicación controlada de resultados;
- vínculo explícito con resoluciones;
- eventos para notificaciones;
- auditoría;
- endpoints administrativos;
- endpoints /me;
- sin endpoints públicos.
```

---

## 4. Decisiones fuera de alcance

No implementar en esta spec:

```text id="d7y7dx"
- voto legalmente certificado;
- voto criptográfico verificable;
- anonimato criptográfico fuerte;
- blockchain;
- firma electrónica;
- actas certificadas;
- PDF formal de actas;
- reglas legales complejas;
- coeficientes avanzados de copropiedad;
- mayoría calificada avanzada;
- voto ponderado avanzado;
- impugnaciones legales;
- segunda vuelta automática;
- voto por WhatsApp;
- voto por SMS;
- voto por email;
- voto offline;
- biometría;
- geolocalización;
- observadores externos;
- auditoría pública;
- ejecución automática de resoluciones;
- generación automática de cargos;
- generación automática de multas;
- IA con datos reales de votación.
```

---

## 5. Dependencias funcionales

### 5.1. `001-tenants`

Uso:

```text id="wha74y"
- validar tenant activo;
- aplicar tenant_id;
- impedir cross-tenant;
- respetar configuración del tenant;
- futura política de votaciones independientes.
```

---

### 5.2. `002-users-roles`

Uso:

```text id="a9503o"
- validar usuario autenticado;
- validar membership activa;
- validar roles;
- validar permisos;
- validar roles especiales como directiva o comité;
- resolver elegibles por rol.
```

---

### 5.3. `003-residents-properties`

Uso:

```text id="o0zew7"
- validar personas;
- validar unidades habitacionales;
- validar propietarios activos;
- validar residentes activos;
- resolver elegibles por ownership;
- resolver elegibles por residency;
- validar que el usuario vota por unidad propia.
```

---

### 5.4. `007-audit`

Uso:

```text id="lvab7z"
- auditar creación de votación;
- auditar apertura;
- auditar cierre;
- auditar emisión de voto;
- auditar anulación;
- auditar cálculo de resultados;
- auditar publicación;
- auditar vínculo con resolución.
```

---

### 5.5. `012-communications-notifications`

Uso:

```text id="fgyc34"
- notificar apertura de votación;
- notificar cierre próximo;
- notificar cierre de votación;
- notificar resultados publicados;
- mantener payload mínimo;
- no incluir voto individual.
```

---

### 5.6. `013-meetings-attendance`

Uso:

```text id="dq8bia"
- asociar votación a reunión;
- validar meeting del mismo tenant;
- resolver participantes de reunión;
- resolver asistencia de reunión;
- validar proxy aprobado;
- vincular resultado con meeting resolution.
```

---

## 6. Estructura de carpetas propuesta

```text id="xv0nhm"
apps/api/src/modules/voting/
├── voting.module.ts
├── controllers/
│   ├── voting-sessions.controller.ts
│   ├── ballot-questions.controller.ts
│   ├── ballot-options.controller.ts
│   ├── eligible-voters.controller.ts
│   ├── votes.controller.ts
│   ├── voting-results.controller.ts
│   └── my-voting.controller.ts
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

```text id="mbxbnu"
VotingModule
```

Responsabilidades:

* registrar controladores;
* registrar servicios;
* registrar repositorios;
* registrar puertos;
* exponer funcionalidades del módulo;
* inyectar adaptadores de reuniones, usuarios, personas, unidades, auditoría y notificaciones.

---

### 7.2. Controladores

```text id="holfo3"
VotingSessionsController
BallotQuestionsController
BallotOptionsController
EligibleVotersController
VotesController
VotingResultsController
MyVotingController
```

---

### 7.3. Servicios de aplicación

```text id="pjs7cf"
VotingSessionService
VotingSessionStateMachineService
BallotQuestionService
BallotOptionService
EligibleVoterService
EligibilityResolverService
VoteCastingService
VotingPrivacyService
VotingTallyService
VotingResultService
VotingResolutionLinkService
VotingNotificationService
VotingAuditService
VotingContentSanitizerService
```

---

### 7.4. Entidades de dominio

```text id="ep5rkl"
VotingSession
BallotQuestion
BallotOption
EligibleVoter
VoteCast
VotingTally
VotingResult
VotingResolutionLink
```

---

### 7.5. Value Objects

```text id="ja8nxh"
VotingTitle
VotingDescription
BallotQuestionTitle
BallotOptionLabel
VotingWindow
VotingWeight
VotingSelection
VotingPrivacyMode
VotingResultSummary
VotingThreshold
```

---

### 7.6. Puertos de aplicación

```text id="oz6dm7"
VotingSessionRepositoryPort
BallotQuestionRepositoryPort
BallotOptionRepositoryPort
EligibleVoterRepositoryPort
VoteCastRepositoryPort
VotingTallyRepositoryPort
VotingResultRepositoryPort
VotingResolutionLinkRepositoryPort
VotingMeetingPort
VotingAttendancePort
VotingProxyPort
VotingUserDirectoryPort
VotingPersonDirectoryPort
VotingPropertyUnitPort
VotingRoleDirectoryPort
VotingNotificationPort
VotingAuditPort
```

---

### 7.7. Repositorios Prisma

```text id="v91tbq"
PrismaVotingSessionRepository
PrismaBallotQuestionRepository
PrismaBallotOptionRepository
PrismaEligibleVoterRepository
PrismaVoteCastRepository
PrismaVotingTallyRepository
PrismaVotingResultRepository
PrismaVotingResolutionLinkRepository
```

---

## 8. Modelo de datos previsto

### 8.1. Tablas nuevas MVP

```text id="ec6su1"
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

### 8.2. Tablas externas relacionadas

```text id="ppxuoj"
tenants
user_profiles
persons
property_units
property_ownerships
residencies
tenant_roles
meetings
meeting_participants
meeting_attendance
meeting_proxies
meeting_resolutions
audit_logs
notifications
```

---

### 8.3. Regla multitenant

Todas las tablas nuevas deben incluir:

```text id="bdqu5z"
tenant_id
```

Regla obligatoria:

```text id="nk4s14"
Todas las consultas deben filtrar por tenant_id.
```

Patrón requerido:

```typescript id="mi25cr"
await prisma.votingSession.findFirst({
  where: {
    id: votingSessionId,
    tenantId: currentTenant.id,
    archivedAt: null
  }
});
```

Patrón prohibido:

```typescript id="niuw5y"
await prisma.votingSession.findUnique({
  where: { id: votingSessionId }
});
```

---

## 9. Diseño de estados

### 9.1. VotingSession

Estados:

```text id="ov69bc"
draft
scheduled
open
closed
resultsCalculated
resultsPublished
cancelled
archived
```

Transiciones principales:

```text id="wtlod4"
draft -> scheduled
scheduled -> open
draft -> open
open -> closed
closed -> resultsCalculated
resultsCalculated -> resultsPublished
resultsPublished -> archived
cancelled -> archived
```

Cancelación:

```text id="caip2g"
draft -> cancelled
scheduled -> cancelled
open -> cancelled
```

---

### 9.2. BallotQuestion

Estados:

```text id="l22yv0"
draft
active
closed
archived
```

---

### 9.3. EligibleVoter

Estados:

```text id="n1hiyq"
eligible
voted
excluded
cancelled
archived
```

---

### 9.4. VoteCast

Estados:

```text id="l009sz"
cast
cancelled
superseded
archived
```

MVP:

```text id="e5es28"
No permitir superseded salvo decisión posterior.
```

---

### 9.5. VotingResult

Estados:

```text id="ac8njs"
pending
passed
failed
tie
informational
cancelled
archived
```

---

## 10. Modos de privacidad

### 10.1. `identified`

Características:

```text id="zk47vn"
- voto asociado al elegible;
- administradores autorizados pueden consultar voto individual;
- auditoría puede registrar identificadores controlados;
- requiere permisos estrictos;
- no debe exponerse en /me de terceros;
- no debe ir a logs como payload completo.
```

---

### 10.2. `secretBasic`

Características:

```text id="o01v7f"
- separación lógica entre participación y opción votada a nivel DTO/API;
- resultados agregados;
- admin estándar no consulta opción individual;
- auditoría de voteCast.cast no incluye selectedOptionId;
- logs no incluyen selectedOptionId;
- no es anonimato criptográfico fuerte;
- no debe presentarse como certificación legal.
```

---

### 10.3. Modos diferidos

```text id="mp608b"
cryptographicSecret
publicVerifiable
```

Estos requieren specs futuras.

---

## 11. Reglas de elegibilidad

### 11.1. Modos MVP

```text id="yyr7lo"
manual
meetingParticipants
meetingAttendance
owners
residents
propertyUnits
roles
mixed
```

---

### 11.2. Sujeto de voto

El sujeto de voto puede ser:

```text id="ddvs5f"
user
person
propertyUnit
owner
resident
role
proxyRepresentative
```

---

### 11.3. Reglas generales

```text id="nwjfwf"
- todo elegible pertenece al tenant;
- no se duplica elegible activo para la misma votación y mismo sujeto lógico;
- el voto solo se emite sobre un eligibleVoter activo;
- el actor debe poder representar al eligibleVoter;
- si se usa proxy, debe estar aprobado;
- la votación debe estar abierta;
- la pregunta debe estar activa;
- la opción debe pertenecer a la pregunta;
- el usuario no puede votar por unidad ajena.
```

---

## 12. Reglas de voto

### 12.1. Opción única

```text id="d6z8ei"
questionType = singleChoice
selectedOptionId requerido
selectedOptionIds no permitido
```

---

### 12.2. Sí / No / Abstención

```text id="y9sz53"
questionType = yesNoAbstain
opciones esperadas: yes, no, abstain
```

---

### 12.3. Opción múltiple limitada

```text id="o3iz4u"
questionType = multipleChoice
selectedOptionIds requerido
minSelections <= selectedOptionIds.length <= maxSelections
```

---

### 12.4. Voto duplicado

Índice lógico obligatorio:

```text id="kohdf8"
tenantId + votingSessionId + ballotQuestionId + eligibleVoterId
```

Solo debe existir un voto activo por pregunta y elegible.

---

## 13. Cálculo de resultados

### 13.1. Fuente de verdad

Resultados se calculan desde:

```text id="uldox5"
vote_casts
eligible_voters
ballot_questions
ballot_options
```

---

### 13.2. Votos que cuentan

```text id="sh1m0p"
status = cast
archivedAt = null
```

---

### 13.3. Votos que no cuentan

```text id="cxlwb2"
cancelled
superseded
archived
```

---

### 13.4. Reglas MVP

```text id="u6csgx"
informational
simpleMajority
absoluteMajority
plurality
unanimity
```

---

### 13.5. Reglas diferidas

```text id="q1wlea"
qualifiedMajority
weightedMajority
legalCustomRule
```

---

### 13.6. Determinismo

Regla:

```text id="e1gssd"
El cálculo de resultados no debe modificar votos, elegibles, preguntas ni opciones.
```

---

### 13.7. Precisión decimal

Cuando exista peso o porcentaje:

```text id="t8b0cb"
usar Decimal
exponer como string decimal
no usar float/double para persistencia
```

---

## 14. API prevista

### 14.1. Voting Sessions

```text id="nd3kh6"
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

---

### 14.2. Ballot Questions

```text id="jlc246"
GET    /api/v1/tenant/voting-sessions/{votingSessionId}/questions
POST   /api/v1/tenant/voting-sessions/{votingSessionId}/questions
GET    /api/v1/tenant/ballot-questions/{questionId}
PATCH  /api/v1/tenant/ballot-questions/{questionId}
POST   /api/v1/tenant/ballot-questions/{questionId}/archive
```

---

### 14.3. Ballot Options

```text id="b12618"
GET    /api/v1/tenant/ballot-questions/{questionId}/options
POST   /api/v1/tenant/ballot-questions/{questionId}/options
GET    /api/v1/tenant/ballot-options/{optionId}
PATCH  /api/v1/tenant/ballot-options/{optionId}
POST   /api/v1/tenant/ballot-options/{optionId}/archive
```

---

### 14.4. Eligible Voters

```text id="jusof4"
GET    /api/v1/tenant/voting-sessions/{votingSessionId}/eligible-voters
POST   /api/v1/tenant/voting-sessions/{votingSessionId}/eligible-voters
POST   /api/v1/tenant/voting-sessions/{votingSessionId}/eligible-voters/resolve
GET    /api/v1/tenant/eligible-voters/{eligibleVoterId}
PATCH  /api/v1/tenant/eligible-voters/{eligibleVoterId}
POST   /api/v1/tenant/eligible-voters/{eligibleVoterId}/exclude
POST   /api/v1/tenant/eligible-voters/{eligibleVoterId}/archive
```

---

### 14.5. Votes

```text id="qongbh"
GET    /api/v1/tenant/voting-sessions/{votingSessionId}/votes
GET    /api/v1/tenant/votes/{voteCastId}
POST   /api/v1/tenant/votes/{voteCastId}/cancel
```

---

### 14.6. Results

```text id="c1ndf0"
POST   /api/v1/tenant/voting-sessions/{votingSessionId}/calculate-results
GET    /api/v1/tenant/voting-sessions/{votingSessionId}/results
POST   /api/v1/tenant/voting-sessions/{votingSessionId}/publish-results
POST   /api/v1/tenant/voting-sessions/{votingSessionId}/results/{resultId}/link-resolution
```

---

### 14.7. Endpoints `/me`

```text id="ikxhue"
GET    /api/v1/me/voting-sessions
GET    /api/v1/me/voting-sessions/{votingSessionId}
GET    /api/v1/me/voting-sessions/{votingSessionId}/questions
GET    /api/v1/me/voting-sessions/{votingSessionId}/participation
POST   /api/v1/me/voting-sessions/{votingSessionId}/questions/{questionId}/vote
GET    /api/v1/me/voting-sessions/{votingSessionId}/results
```

---

### 14.8. Endpoints públicos

No crear endpoints públicos.

Prohibido:

```text id="afor9q"
GET /api/v1/public/tenants/{slug}/voting-sessions
GET /api/v1/public/tenants/{slug}/voting-sessions/{votingSessionId}
GET /api/v1/public/tenants/{slug}/voting-sessions/{votingSessionId}/results
POST /api/v1/public/tenants/{slug}/voting-sessions/{votingSessionId}/vote
```

---

## 15. DTOs previstos

### 15.1. Voting Sessions

```text id="g0tueu"
CreateVotingSessionDto
UpdateVotingSessionDto
ScheduleVotingSessionDto
OpenVotingSessionDto
CloseVotingSessionDto
CancelVotingSessionDto
ArchiveVotingSessionDto
VotingSessionAdminDto
VotingSessionListItemDto
```

---

### 15.2. Questions

```text id="ad9a1s"
CreateBallotQuestionDto
UpdateBallotQuestionDto
BallotQuestionDto
```

---

### 15.3. Options

```text id="bf2ozn"
CreateBallotOptionDto
UpdateBallotOptionDto
BallotOptionDto
```

---

### 15.4. Eligible Voters

```text id="sg0766"
CreateEligibleVoterDto
ResolveEligibleVotersDto
UpdateEligibleVoterDto
ExcludeEligibleVoterDto
EligibleVoterDto
```

---

### 15.5. Votes

```text id="bf5dcv"
CastVoteDto
CancelVoteDto
VoteCastAdminDto
VoteCastOwnDto
```

---

### 15.6. Results

```text id="df6r35"
VotingTallyDto
VotingResultDto
VotingResultAdminDto
PublishVotingResultsDto
LinkVotingResultToResolutionDto
```

---

### 15.7. `/me`

```text id="dtqc5f"
OwnVotingSessionDto
OwnBallotQuestionDto
OwnBallotOptionDto
OwnVotingParticipationDto
OwnVotingResultDto
```

---

## 16. Permisos requeridos

### 16.1. Voting Sessions

```text id="oamg7d"
votingSessions.create
votingSessions.read
votingSessions.update
votingSessions.open
votingSessions.close
votingSessions.cancel
votingSessions.archive
```

---

### 16.2. Questions and Options

```text id="wxltr1"
ballotQuestions.create
ballotQuestions.read
ballotQuestions.update
ballotQuestions.archive
ballotOptions.create
ballotOptions.read
ballotOptions.update
ballotOptions.archive
```

---

### 16.3. Eligible Voters

```text id="vcoo2d"
eligibleVoters.create
eligibleVoters.read
eligibleVoters.resolve
eligibleVoters.update
eligibleVoters.exclude
eligibleVoters.archive
```

---

### 16.4. Votes

```text id="i99cep"
votes.cast.own
votes.read
votes.read.own
votes.cancel
votes.audit.read
```

---

### 16.5. Results

```text id="xf93wa"
votingResults.calculate
votingResults.read
votingResults.read.own
votingResults.publish
votingResults.linkResolution
```

---

### 16.6. Audit and Reports

```text id="jluqu8"
voting.audit.read
voting.reports.read
```

---

## 17. Seguridad y privacidad

### 17.1. Reglas obligatorias

```text id="w4f4ue"
- no aceptar tenantId desde body;
- no buscar recursos solo por id;
- no permitir votingSession de otro tenant;
- no permitir meetingId de otro tenant;
- no permitir questionId de otro tenant;
- no permitir optionId de otro tenant;
- no permitir eligibleVoterId de otro tenant;
- no permitir voteCastId de otro tenant;
- no permitir voto duplicado;
- no permitir voto fuera de ventana;
- no permitir voto sin elegibilidad;
- no permitir voto por unidad ajena;
- no permitir voto por proxy no aprobado;
- no exponer voto individual en secretBasic;
- no exponer resultados públicos;
- no guardar selectedOptionId en logs para secretBasic;
- no guardar selectedOptionId en audit metadata para secretBasic;
- no ejecutar acciones automáticas desde resultados.
```

---

### 17.2. Guards propuestos

```text id="nhclva"
VotingPermissionGuard
OwnVotingGuard
EligibleVoterGuard
VoteCastingGuard
VotingPrivacyGuard
VotingResultGuard
```

---

### 17.3. Policies propuestas

```text id="u2s45k"
VotingTenantPolicy
VotingSessionStatePolicy
VotingEligibilityPolicy
VotingOwnResourcePolicy
VoteDuplicatePolicy
VotingWindowPolicy
VotingPrivacyPolicy
VotingResultPublicationPolicy
VotingResolutionLinkPolicy
```

---

## 18. Auditoría

### 18.1. Eventos mínimos

```text id="xq2s5o"
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

### 18.2. Metadata permitida

```text id="scsezd"
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

---

### 18.3. Metadata prohibida

```text id="h8iaa2"
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

## 19. Integración con notificaciones

### 19.1. Eventos sugeridos

```text id="xjsgpq"
votingSession.created
votingSession.opened
votingSession.closed
votingResults.published
```

---

### 19.2. Payload mínimo

```json id="x7dfbt"
{
  "tenantId": "tenant_uuid",
  "sourceType": "votingSession",
  "sourceId": "voting_session_uuid",
  "eventType": "votingSession.opened",
  "title": "Votación de Asamblea Ordinaria 2026",
  "actionUrl": "/voting/voting_session_uuid",
  "audience": {
    "type": "eligibleVoters"
  },
  "traceId": "req_123456"
}
```

---

### 19.3. Payload prohibido

```text id="sw56aw"
lista completa de elegibles
votos individuales
selectedOptionId
selectedOptionIds
resultados no publicados
datos personales innecesarios
tokens
secretos
documentos
```

---

## 20. Observabilidad

### 20.1. Logs sugeridos

```text id="bv0no4"
votingSession.created
votingSession.opened
votingSession.closed
votingSession.cancelled
voteCast.cast
voteCast.cancelled
votingResults.calculated
votingResults.published
votingResult.linkedToResolution
```

---

### 20.2. Métricas sugeridas

```text id="s6qnmp"
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

### 20.3. Labels permitidos

```text id="m1a9oc"
votingStatus
privacyMode
eligibilityMode
votingRule
questionType
resultStatus
outcome
```

---

### 20.4. Labels prohibidos

```text id="r388yx"
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

## 21. OpenAPI

### 21.1. Tags sugeridos

```text id="fjmajs"
Voting Sessions
Ballot Questions
Ballot Options
Eligible Voters
Votes
Voting Results
My Voting
```

---

### 21.2. Extensiones OpenAPI sugeridas

Para endpoints tenant:

```yaml id="qzly74"
x-tenant-scope: true
x-auth-required: true
x-required-permission: votingSessions.create
x-audit-event: votingSession.created
```

Para endpoints `/me`:

```yaml id="bt96wy"
x-tenant-scope: true
x-auth-required: true
x-own-resource: true
x-required-permission: votes.cast.own
```

Para emisión de voto:

```yaml id="aurg55"
x-vote-casting: true
x-eligibility-required: true
x-duplicate-protected: true
x-privacy-mode-aware: true
```

Para resultados:

```yaml id="r89opp"
x-result-calculation: deterministic
x-public-exposure: false
```

---

### 21.3. OpenAPI no debe documentar

```text id="a4v135"
GET /api/v1/public/tenants/{slug}/voting-sessions
GET /api/v1/public/tenants/{slug}/voting-sessions/{votingSessionId}
GET /api/v1/public/tenants/{slug}/voting-sessions/{votingSessionId}/results
POST /api/v1/public/tenants/{slug}/voting-sessions/{votingSessionId}/vote
```

---

## 22. Estrategia de implementación

### 22.1. Orden recomendado

```text id="u9y1zr"
1. Crear estructura base del módulo.
2. Implementar enums y value objects.
3. Implementar entidades de dominio.
4. Crear modelo Prisma y migración.
5. Implementar repositorios Prisma.
6. Implementar servicios de sesión de votación.
7. Implementar preguntas y opciones.
8. Implementar elegibilidad.
9. Implementar emisión de voto.
10. Implementar privacidad identified/secretBasic.
11. Implementar cálculo de resultados.
12. Implementar publicación de resultados.
13. Implementar vínculo con resolución.
14. Implementar endpoints administrativos.
15. Implementar endpoints /me.
16. Implementar auditoría.
17. Implementar notificaciones.
18. Implementar observabilidad.
19. Implementar OpenAPI.
20. Implementar pruebas.
21. Ejecutar hardening.
```

---

### 22.2. PRs sugeridos

```text id="xag5yi"
PR-014-01 — Module skeleton, enums, value objects.
PR-014-02 — Prisma schema, migration and repositories.
PR-014-03 — Voting session state machine.
PR-014-04 — Ballot questions and options.
PR-014-05 — Eligible voters and eligibility resolution.
PR-014-06 — Vote casting and duplicate prevention.
PR-014-07 — Privacy modes identified and secretBasic.
PR-014-08 — Result calculation and publication.
PR-014-09 — Resolution link and meeting integration.
PR-014-10 — My Voting endpoints.
PR-014-11 — Audit, notifications and observability.
PR-014-12 — OpenAPI, tests and security hardening.
```

---

## 23. Testing plan resumido

### 23.1. Unit tests

```text id="q2t2ik"
VotingSession entity
BallotQuestion entity
BallotOption entity
EligibleVoter entity
VoteCast entity
VotingTally entity
VotingResult entity
VotingResolutionLink entity
VotingSessionStateMachine
VotingEligibilityPolicy
VoteDuplicatePolicy
VotingWindowPolicy
VotingPrivacyPolicy
VotingTallyService
VotingResultService
```

---

### 23.2. Integration tests

```text id="yr5ji6"
PrismaVotingSessionRepository
PrismaBallotQuestionRepository
PrismaBallotOptionRepository
PrismaEligibleVoterRepository
PrismaVoteCastRepository
PrismaVotingTallyRepository
PrismaVotingResultRepository
PrismaVotingResolutionLinkRepository
```

---

### 23.3. API tests

```text id="fq6eix"
Voting Sessions admin endpoints
Questions endpoints
Options endpoints
Eligible Voters endpoints
Votes admin endpoints
Results endpoints
My Voting endpoints
```

---

### 23.4. Security tests

```text id="udg6nd"
no public endpoints
no cross-tenant voting sessions
no cross-tenant eligible voters
no cross-tenant votes
no duplicate votes
no vote outside open status
no vote outside time window
no vote by non-eligible user
no vote by чужая unidad / unidad ajena
no proxy vote without approved proxy
secretBasic no exposes selectedOptionId
logs do not contain selectedOptionId
OpenAPI no public routes
```

---

### 23.5. Privacy tests

```text id="qp4v0u"
identified permite consulta individual solo con permiso
secretBasic oculta opción individual en endpoints admin estándar
secretBasic oculta selectedOptionId en auditoría
secretBasic oculta selectedOptionId en logs
resultados agregados no revelan identidad
/me no muestra votos de terceros
```

---

## 24. Performance objetivo

### 24.1. Objetivos MVP

```text id="tmrmal"
p95 < 700 ms para listados paginados.
p95 < 1500 ms para cálculo de resultados con 500 elegibles y 10 preguntas.
```

---

### 24.2. Reglas técnicas

```text id="ruop8r"
- paginación obligatoria;
- pageSize máximo 100;
- índices por tenant_id;
- índices por voting_session_id;
- índice único contra voto duplicado;
- evitar N+1;
- no cargar votos individuales en listados si no se requieren;
- no calcular resultados en cada consulta de listado;
- cache interno solo si no viola privacidad.
```

---

## 25. Riesgos técnicos

| Riesgo                                          | Impacto | Mitigación                                     |
| ----------------------------------------------- | ------: | ---------------------------------------------- |
| Voto duplicado                                  | Crítico | índice único + servicio de duplicidad + test   |
| Elegible cross-tenant                           | Crítico | validación de referencias + multitenancy tests |
| Voto por unidad ajena                           |    Alto | own-resource guard + property-unit resolution  |
| Filtración de voto en `secretBasic`             |    Alto | DTO separado + audit/log sanitizer             |
| Resultado incorrecto                            |    Alto | tally determinístico + tests de escenarios     |
| Votación presentada como legalmente certificada |    Alto | disclaimers técnicos + fuera de alcance        |
| Reglas legales insuficientes                    |   Medio | futuras specs                                  |
| Performance de tally                            |   Medio | índices + cálculo batch                        |
| Auditoría excesivamente sensible                |    Alto | metadata minimizada                            |
| Publicación accidental                          | Crítico | no public routes + OpenAPI negative tests      |

---

## 26. Seeds y datos demo

Crear seeds ficticios para:

```text id="pz5h1k"
votingSessionDraftA
votingSessionScheduledA
votingSessionOpenA
votingSessionClosedA
votingSessionResultsCalculatedA
votingSessionResultsPublishedA
votingSessionCancelledA
votingSessionArchivedA
votingSessionTenantB

questionYesNoA
questionSingleChoiceA
questionMultipleChoiceA

optionYesA
optionNoA
optionAbstainA
optionCandidateA
optionCandidateB
optionCandidateC

eligibleOwnerA
eligibleResidentA
eligiblePropertyUnitA101
eligibleProxyRepresentativeA
eligibleTenantB

voteCastOwnerA
voteCastUnitA101
voteCastAbstainA
voteCastTenantB

votingResultPassedA
votingResultFailedA
votingResultTieA
```

Prohibido en seeds:

```text id="ogj3s4"
nombres reales
emails reales
teléfonos reales
cédulas reales
actas reales
votos reales
documentos reales
tokens
secretos
datos financieros reales
```

---

## 27. Configuración inicial

### 27.1. Feature flags recomendadas

```text id="rn0bgq"
voting.enabled
voting.independentSessions.enabled
voting.residentVoting.enabled
voting.proxyVoting.enabled
voting.secretBasic.enabled
voting.voteCancellation.enabled
voting.resultPublication.enabled
```

---

### 27.2. Defaults MVP

```text id="hm91ez"
voting.enabled = true
voting.independentSessions.enabled = false
voting.residentVoting.enabled = false
voting.proxyVoting.enabled = true
voting.secretBasic.enabled = true
voting.voteCancellation.enabled = true para admin autorizado
voting.resultPublication.enabled = true
```

---

## 28. Errores esperados

Catálogo inicial:

```text id="unax6z"
VOTING_SESSION_NOT_FOUND
VOTING_SESSION_FORBIDDEN
VOTING_SESSION_INVALID_TRANSITION
VOTING_SESSION_INVALID_WINDOW
VOTING_SESSION_CROSS_TENANT_REFERENCE
VOTING_SESSION_NOT_OPEN
VOTING_SESSION_ALREADY_CLOSED
BALLOT_QUESTION_NOT_FOUND
BALLOT_QUESTION_INVALID
BALLOT_OPTION_NOT_FOUND
BALLOT_OPTION_INVALID
BALLOT_OPTION_DUPLICATE
ELIGIBLE_VOTER_NOT_FOUND
ELIGIBLE_VOTER_FORBIDDEN
ELIGIBLE_VOTER_DUPLICATE
ELIGIBLE_VOTER_CROSS_TENANT_REFERENCE
VOTE_NOT_ELIGIBLE
VOTE_DUPLICATE
VOTE_INVALID_SELECTION
VOTE_OUTSIDE_WINDOW
VOTE_PRIVACY_RESTRICTED
VOTE_CAST_NOT_FOUND
VOTE_CANCEL_REASON_REQUIRED
VOTING_RESULTS_NOT_FOUND
VOTING_RESULTS_ALREADY_CALCULATED
VOTING_RESULTS_NOT_CALCULATED
VOTING_RESULTS_PUBLICATION_FORBIDDEN
VOTING_RESOLUTION_LINK_INVALID
VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
RATE_LIMITED
INTERNAL_ERROR
```

---

## 29. Criterios de aceptación técnica

La implementación deberá cumplir:

```text id="hit08z"
- todas las tablas tienen tenant_id;
- toda consulta filtra por tenant_id;
- no se acepta tenantId en body;
- no existen endpoints públicos de votación;
- OpenAPI no documenta endpoints públicos de votación;
- se impide voto duplicado;
- se impide voto de no elegible;
- se impide voto fuera de ventana;
- se impide voto en sesión cerrada;
- se impide voto por unidad ajena;
- se impide voto por proxy no aprobado;
- se protege privacyMode identified;
- se protege privacyMode secretBasic;
- resultados se calculan de forma determinística;
- resultados no modifican votos;
- resultados no ejecutan acciones automáticas;
- auditoría no incluye selectedOptionId en secretBasic;
- logs no incluyen selectedOptionId;
- métricas no incluyen IDs sensibles;
- CI pasa.
```

---

## 30. Definition of Done

El módulo se considera listo cuando:

```text id="e31hav"
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
12. Endpoints administrativos funcionan.
13. Endpoints /me funcionan.
14. No existen endpoints públicos.
15. Auditoría funciona.
16. Notificaciones por eventos funcionan.
17. OpenAPI está actualizado.
18. Tests unitarios pasan.
19. Tests de repositorio pasan.
20. Tests API pasan.
21. Tests de autorización pasan.
22. Tests own-resource pasan.
23. Tests multitenant pasan.
24. Tests de privacidad pasan.
25. Tests de seguridad pasan.
26. Build pasa.
27. CI pasa.
```

---

## 31. No aceptación

No se acepta implementación si:

```text id="z7vouj"
- permite votaciones cross-tenant;
- permite preguntas cross-tenant;
- permite opciones cross-tenant;
- permite elegibles cross-tenant;
- permite votos cross-tenant;
- permite voto duplicado;
- permite voto fuera de ventana;
- permite votar en sesión cerrada;
- permite voto de usuario no elegible;
- permite voto por unidad ajena;
- permite voto por proxy no aprobado;
- expone selectedOptionId en secretBasic;
- registra voto individual en logs;
- registra selectedOptionId en auditoría secretBasic;
- publica resultados sin cálculo;
- expone resultados públicamente;
- crea endpoints públicos;
- documenta endpoints públicos en OpenAPI;
- trata resultados como legalmente certificados;
- ejecuta acciones automáticas desde resultados;
- genera cargos financieros desde resultados;
- genera multas desde resultados;
- mezcla firma electrónica dentro del MVP;
- mezcla actas certificadas dentro del MVP;
- omite auditoría de operaciones críticas.
```

---

## 32. Resultado esperado

Al finalizar la implementación de `014-voting-basic`, RESIDENT Core podrá gestionar votaciones internas básicas de forma segura y auditable:

```text id="toq330"
- crear votaciones;
- asociarlas a reuniones;
- crear preguntas;
- crear opciones;
- definir elegibles;
- resolver elegibles;
- abrir votaciones;
- emitir votos;
- evitar duplicados;
- cerrar votaciones;
- calcular resultados;
- publicar resultados;
- consultar participación propia;
- consultar resultados autorizados;
- vincular resultados a resoluciones;
- emitir eventos de notificación;
- auditar operaciones críticas;
- preservar privacidad;
- impedir exposición pública.
```

El módulo quedará preparado para futuras specs de voto ponderado, reglas legales, firma electrónica, actas certificadas, impugnaciones y auditoría verificable.
