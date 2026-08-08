# API Contract — Spec 014 Voting Basic

## 1. Información del documento

| Campo           | Valor                                                                                                                                           |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                   |
| Spec ID         | 014                                                                                                                                             |
| Módulo          | Voting Basic                                                                                                                                    |
| Documento       | API Contract                                                                                                                                    |
| Ruta            | `docs/specs/014-voting-basic/api-contract.md`                                                                                                   |
| Versión         | 0.1                                                                                                                                             |
| Estado          | Borrador inicial                                                                                                                                |
| Fecha           | 2026-07-20                                                                                                                                      |
| Documento base  | `docs/specs/014-voting-basic/spec.md`                                                                                                           |
| Plan técnico    | `docs/specs/014-voting-basic/plan.md`                                                                                                           |
| Modelo de datos | `docs/specs/014-voting-basic/data-model.md`                                                                                                     |
| API Style       | REST                                                                                                                                            |
| API Version     | `/api/v1`                                                                                                                                       |
| Naturaleza      | Tenant-scoped / Eligibility-aware / Own-resource protected / Privacy-mode aware / Duplicate-safe / Tally-deterministic / Auditable / Non-public |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `007-audit`, `012-communications-notifications`, `013-meetings-attendance`        |

---

## 2. Propósito

Este documento define el contrato API REST para el módulo `014-voting-basic`.

El módulo permite crear sesiones de votación internas, asociarlas a reuniones, definir preguntas, opciones, elegibles, registrar votos, impedir duplicados, cerrar votaciones, calcular resultados, publicar resultados autorizados y vincularlos con resoluciones de reunión.

Regla central:

```text id="xbcxj3"
Toda operación de votación debe estar autenticada, autorizada, tenant-scoped, eligibility-aware, duplicate-safe, privacy-mode aware, auditable y sin exposición pública en MVP.
```

---

## 3. Principios del contrato API

### 3.1. Tenant scope obligatorio

Todos los endpoints administrativos y `/me` operan dentro del tenant activo del usuario autenticado.

Regla:

```text id="b1o8p2"
currentTenant.id debe ser el tenant_id efectivo en toda consulta y mutación.
```

El cliente no debe enviar `tenantId` en el body.

---

### 3.2. Autenticación

Todos los endpoints del módulo requieren:

```text id="tj00o7"
Authorization: Bearer <access_token>
```

No existen endpoints públicos de votación en MVP.

---

### 3.3. Autorización

La autorización se resuelve dentro de RESIDENT Core.

Regla:

```text id="ltoajd"
Keycloak autentica; RESIDENT Core autoriza por tenant, membership, permiso, elegibilidad, audiencia, recurso propio, estado y regla de negocio.
```

---

### 3.4. No exposición pública

MVP no expone votaciones en `/api/v1/public`.

Prohibido:

```text id="wjj3q5"
GET  /api/v1/public/tenants/{slug}/voting-sessions
GET  /api/v1/public/tenants/{slug}/voting-sessions/{votingSessionId}
GET  /api/v1/public/tenants/{slug}/voting-sessions/{votingSessionId}/results
POST /api/v1/public/tenants/{slug}/voting-sessions/{votingSessionId}/vote
```

---

### 3.5. Endpoints `/me`

Los endpoints `/me` solo devuelven votaciones donde el usuario autenticado es elegible o pertenece a la audiencia autorizada.

Regla conceptual:

```text id="c7x8mt"
actorUserId -> personIds -> propertyUnitIds -> eligibleVoters -> votingSession
```

---

### 3.6. Privacidad por modo

El contrato API debe respetar `privacyMode`.

Modos MVP:

```text id="c8gh61"
identified
secretBasic
```

En `identified`, el voto individual puede ser consultado por administradores autorizados.

En `secretBasic`, los endpoints administrativos estándar no deben exponer `selectedOptionId`, `selectedOptionIds` ni la opción individual del votante.

Regla:

```text id="oqnqos"
secretBasic no equivale a anonimato criptográfico fuerte ni a votación legalmente certificada.
```

---

### 3.7. Prevención de duplicidad

El contrato debe impedir más de un voto activo por:

```text id="yippdn"
tenantId + votingSessionId + ballotQuestionId + eligibleVoterId
```

---

### 3.8. Resultados determinísticos

Los resultados se calculan desde votos persistidos y válidos.

Regla:

```text id="nkye8z"
calculate-results no debe crear, modificar ni eliminar votos.
```

---

### 3.9. No ejecución automática

Una votación aprobada no ejecuta acciones automáticas.

Prohibido en MVP:

```text id="cug5fm"
generar cargos
generar multas
modificar presupuestos
modificar reglamentos
firmar actas
cerrar procesos legales
ejecutar resoluciones automáticamente
```

---

### 3.10. Cache

Todos los endpoints privados deben responder:

```text id="txwbqf"
Cache-Control: no-store
```

---

## 4. Rutas base

### 4.1. Voting Sessions administrativas

```text id="o7c154"
/api/v1/tenant/voting-sessions
```

---

### 4.2. Ballot Questions

```text id="ek6pnk"
/api/v1/tenant/voting-sessions/{votingSessionId}/questions
/api/v1/tenant/ballot-questions
```

---

### 4.3. Ballot Options

```text id="l2mz10"
/api/v1/tenant/ballot-questions/{questionId}/options
/api/v1/tenant/ballot-options
```

---

### 4.4. Eligible Voters

```text id="c76ot8"
/api/v1/tenant/voting-sessions/{votingSessionId}/eligible-voters
/api/v1/tenant/eligible-voters
```

---

### 4.5. Votes administrativas

```text id="m5vq5y"
/api/v1/tenant/voting-sessions/{votingSessionId}/votes
/api/v1/tenant/votes
```

---

### 4.6. Results

```text id="elqfyr"
/api/v1/tenant/voting-sessions/{votingSessionId}/results
```

---

### 4.7. Voting propias

```text id="pksx20"
/api/v1/me/voting-sessions
```

---

## 5. Headers

### 5.1. Request headers

| Header             |              Requerido | Descripción                                     |
| ------------------ | ---------------------: | ----------------------------------------------- |
| `Authorization`    |                     Sí | Bearer token                                    |
| `Content-Type`     | Sí para POST/PATCH/PUT | `application/json`                              |
| `Accept`           |            Recomendado | `application/json`                              |
| `X-Request-Id`     |               Opcional | ID de request                                   |
| `X-Correlation-Id` |               Opcional | ID de correlación                               |
| `Idempotency-Key`  |    Recomendado en voto | Prevención adicional de reintentos accidentales |

---

### 5.2. Response headers

```text id="n7zom6"
Content-Type: application/json
Cache-Control: no-store
X-Request-Id: <request-id>
X-Correlation-Id: <correlation-id>
```

---

## 6. Formato estándar de respuesta

### 6.1. Respuesta individual

```json id="barfkf"
{
  "data": {},
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

### 6.2. Respuesta paginada

```json id="u4kcrj"
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5,
    "traceId": "req_123456"
  }
}
```

---

### 6.3. Error estándar

```json id="cq69d4"
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

## 7. Estados HTTP

| Código | Uso                                                   |
| -----: | ----------------------------------------------------- |
|    200 | Consulta o acción exitosa                             |
|    201 | Recurso creado                                        |
|    204 | Acción exitosa sin cuerpo, si se adopta               |
|    400 | Request mal formado                                   |
|    401 | No autenticado                                        |
|    403 | Sin permiso, sin elegibilidad o sin acceso al recurso |
|    404 | Recurso no encontrado o no accesible                  |
|    409 | Conflicto de estado, duplicidad o ventana de votación |
|    422 | Validación semántica fallida                          |
|    429 | Rate limit                                            |
|    500 | Error interno controlado                              |

---

## 8. Permisos

### 8.1. Voting Sessions

```text id="p14rhg"
votingSessions.create
votingSessions.read
votingSessions.update
votingSessions.schedule
votingSessions.open
votingSessions.close
votingSessions.cancel
votingSessions.archive
```

---

### 8.2. Ballot Questions

```text id="dugy5v"
ballotQuestions.create
ballotQuestions.read
ballotQuestions.update
ballotQuestions.archive
```

---

### 8.3. Ballot Options

```text id="ysw30t"
ballotOptions.create
ballotOptions.read
ballotOptions.update
ballotOptions.archive
```

---

### 8.4. Eligible Voters

```text id="s2d93r"
eligibleVoters.create
eligibleVoters.read
eligibleVoters.resolve
eligibleVoters.update
eligibleVoters.exclude
eligibleVoters.archive
```

---

### 8.5. Votes

```text id="nsh4fs"
votes.cast.own
votes.read
votes.read.own
votes.cancel
votes.audit.read
```

---

### 8.6. Results

```text id="mzbyfc"
votingResults.calculate
votingResults.read
votingResults.read.own
votingResults.publish
votingResults.linkResolution
```

---

### 8.7. Auditoría y reportes

```text id="qnrzkx"
voting.audit.read
voting.reports.read
```

---

## 9. Enums API

### 9.1. VotingSessionStatus

```text id="az2jd0"
draft
scheduled
open
closed
resultsCalculated
resultsPublished
cancelled
archived
```

---

### 9.2. VotingVisibility

```text id="zo2rc6"
administrative
meetingParticipants
owners
residents
tenant
mixed
```

---

### 9.3. VotingMode

```text id="r6msua"
singleQuestion
multiQuestion
```

---

### 9.4. VotingPrivacyMode

```text id="fdjykq"
identified
secretBasic
```

Diferidos:

```text id="itzdsw"
cryptographicSecret
publicVerifiable
```

---

### 9.5. EligibilityMode

```text id="b6lb8o"
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

### 9.6. VotingRule

```text id="g7ivk3"
informational
simpleMajority
absoluteMajority
plurality
unanimity
```

Diferidos:

```text id="nye0o0"
qualifiedMajority
weightedMajority
legalCustomRule
```

---

### 9.7. BallotQuestionType

```text id="ljf71q"
yesNoAbstain
singleChoice
multipleChoice
```

Diferidos:

```text id="vx55oq"
ranking
openText
numeric
```

---

### 9.8. BallotQuestionStatus

```text id="vuddne"
draft
active
closed
archived
```

---

### 9.9. BallotOptionType

```text id="d5l4aa"
standard
yes
no
abstain
other
```

---

### 9.10. VoterType

```text id="iq5hg5"
user
person
propertyUnit
owner
resident
role
proxyRepresentative
```

---

### 9.11. EligibilitySource

```text id="av0t3s"
manual
meetingParticipant
meetingAttendance
ownership
residency
role
proxy
system
```

---

### 9.12. EligibleVoterStatus

```text id="efjqap"
eligible
voted
excluded
cancelled
archived
```

---

### 9.13. VoteCastStatus

```text id="bjewgt"
cast
cancelled
superseded
archived
```

---

### 9.14. VotingResultStatus

```text id="whygfr"
pending
passed
failed
tie
informational
cancelled
archived
```

---

# 10. Voting Sessions administrativas

## 10.1. Listar sesiones de votación

### Endpoint

```http id="n306bu"
GET /api/v1/tenant/voting-sessions
```

### Permiso

```text id="h3f6sc"
votingSessions.read
```

### Query params

| Nombre             | Tipo      | Requerido | Descripción                                                        |
| ------------------ | --------- | --------: | ------------------------------------------------------------------ |
| `status`           | string    |        No | Estado de sesión                                                   |
| `visibility`       | string    |        No | Visibilidad                                                        |
| `privacyMode`      | string    |        No | Modo de privacidad                                                 |
| `eligibilityMode`  | string    |        No | Modo de elegibilidad                                               |
| `votingRule`       | string    |        No | Regla de votación                                                  |
| `meetingId`        | string    |        No | Reunión asociada                                                   |
| `opensFrom`        | date-time |        No | Apertura desde                                                     |
| `opensTo`          | date-time |        No | Apertura hasta                                                     |
| `closesFrom`       | date-time |        No | Cierre desde                                                       |
| `closesTo`         | date-time |        No | Cierre hasta                                                       |
| `resultsPublished` | boolean   |        No | Resultados publicados                                              |
| `q`                | string    |        No | Búsqueda por título o descripción                                  |
| `page`             | number    |        No | Default 1                                                          |
| `pageSize`         | number    |        No | Default 20, máximo 100                                             |
| `sortBy`           | string    |        No | `createdAt`, `updatedAt`, `opensAt`, `closesAt`, `title`, `status` |
| `sortOrder`        | string    |        No | `asc`, `desc`                                                      |

### Response 200

```json id="m0n7vt"
{
  "data": [
    {
      "id": "voting_session_uuid",
      "meetingId": "meeting_uuid",
      "title": "Votación de Asamblea Ordinaria 2026",
      "status": "open",
      "visibility": "owners",
      "votingMode": "multiQuestion",
      "privacyMode": "secretBasic",
      "eligibilityMode": "propertyUnits",
      "votingRule": "simpleMajority",
      "opensAt": "2026-08-15T15:00:00Z",
      "closesAt": "2026-08-15T17:00:00Z",
      "resultsPublishedAt": null,
      "updatedAt": "2026-08-15T15:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1,
    "traceId": "req_123456"
  }
}
```

---

## 10.2. Crear sesión de votación

### Endpoint

```http id="v4pwqf"
POST /api/v1/tenant/voting-sessions
```

### Permiso

```text id="q8hnn6"
votingSessions.create
```

### Request body

```json id="c7rs8e"
{
  "meetingId": "meeting_uuid",
  "title": "Votación de Asamblea Ordinaria 2026",
  "description": "Sesión de votación para puntos de la asamblea.",
  "visibility": "owners",
  "votingMode": "multiQuestion",
  "privacyMode": "secretBasic",
  "eligibilityMode": "propertyUnits",
  "votingRule": "simpleMajority",
  "opensAt": "2026-08-15T15:00:00Z",
  "closesAt": "2026-08-15T17:00:00Z"
}
```

### Response 201

```json id="tazgz1"
{
  "data": {
    "id": "voting_session_uuid",
    "meetingId": "meeting_uuid",
    "title": "Votación de Asamblea Ordinaria 2026",
    "description": "Sesión de votación para puntos de la asamblea.",
    "status": "draft",
    "visibility": "owners",
    "votingMode": "multiQuestion",
    "privacyMode": "secretBasic",
    "eligibilityMode": "propertyUnits",
    "votingRule": "simpleMajority",
    "opensAt": "2026-08-15T15:00:00Z",
    "closesAt": "2026-08-15T17:00:00Z",
    "openedAt": null,
    "closedAt": null,
    "resultsCalculatedAt": null,
    "resultsPublishedAt": null,
    "createdAt": "2026-07-20T10:00:00Z",
    "updatedAt": "2026-07-20T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* El cliente no envía `tenantId`.
* Estado inicial: `draft`.
* Si `meetingId` existe, debe pertenecer al tenant activo.
* `opensAt` debe ser menor que `closesAt` si ambos existen.
* `privacyMode = secretBasic` no debe prometer anonimato criptográfico.
* No crea preguntas ni elegibles automáticamente.

### Evento auditable

```text id="ckiynd"
votingSession.created
```

---

## 10.3. Obtener sesión de votación

### Endpoint

```http id="r9kz1s"
GET /api/v1/tenant/voting-sessions/{votingSessionId}
```

### Permiso

```text id="kp9t9v"
votingSessions.read
```

### Response 200

```json id="p3c96k"
{
  "data": {
    "id": "voting_session_uuid",
    "meetingId": "meeting_uuid",
    "title": "Votación de Asamblea Ordinaria 2026",
    "description": "Sesión de votación para puntos de la asamblea.",
    "status": "open",
    "visibility": "owners",
    "votingMode": "multiQuestion",
    "privacyMode": "secretBasic",
    "eligibilityMode": "propertyUnits",
    "votingRule": "simpleMajority",
    "opensAt": "2026-08-15T15:00:00Z",
    "closesAt": "2026-08-15T17:00:00Z",
    "openedAt": "2026-08-15T15:00:00Z",
    "closedAt": null,
    "cancelledAt": null,
    "cancellationReason": null,
    "resultsCalculatedAt": null,
    "resultsPublishedAt": null,
    "createdAt": "2026-07-20T10:00:00Z",
    "updatedAt": "2026-08-15T15:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 10.4. Actualizar sesión de votación

### Endpoint

```http id="d9cl6s"
PATCH /api/v1/tenant/voting-sessions/{votingSessionId}
```

### Permiso

```text id="jggg2q"
votingSessions.update
```

### Estados editables

```text id="s6tuw4"
draft
scheduled
```

### Request body

```json id="cwiyxu"
{
  "title": "Votación actualizada de Asamblea Ordinaria 2026",
  "description": "Descripción actualizada.",
  "visibility": "owners",
  "opensAt": "2026-08-15T15:30:00Z",
  "closesAt": "2026-08-15T17:30:00Z"
}
```

### Response 200

```json id="p8bpjr"
{
  "data": {
    "id": "voting_session_uuid",
    "title": "Votación actualizada de Asamblea Ordinaria 2026",
    "description": "Descripción actualizada.",
    "status": "draft",
    "visibility": "owners",
    "opensAt": "2026-08-15T15:30:00Z",
    "closesAt": "2026-08-15T17:30:00Z",
    "updatedAt": "2026-07-20T11:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Campos prohibidos en PATCH genérico

```text id="cpthwk"
tenantId
status
createdBy
openedBy
closedBy
cancelledBy
archivedBy
openedAt
closedAt
cancelledAt
resultsCalculatedAt
resultsPublishedAt
createdAt
updatedAt
archivedAt
```

### Evento auditable

```text id="pjr9if"
votingSession.updated
```

---

## 10.5. Programar sesión de votación

### Endpoint

```http id="ggvr26"
POST /api/v1/tenant/voting-sessions/{votingSessionId}/schedule
```

### Permiso

```text id="z435mb"
votingSessions.schedule
```

### Request body opcional

```json id="zyhy3q"
{
  "notes": "Votación revisada y lista para la asamblea."
}
```

### Response 200

```json id="ds94yo"
{
  "data": {
    "id": "voting_session_uuid",
    "status": "scheduled"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Estado origen recomendado: `draft`.
* Debe tener al menos una pregunta si la política lo exige para programar.
* No se programa una sesión `open`, `closed`, `cancelled` o `archived`.

### Evento auditable

```text id="eo0pkc"
votingSession.scheduled
```

---

## 10.6. Abrir sesión de votación

### Endpoint

```http id="pvvjoq"
POST /api/v1/tenant/voting-sessions/{votingSessionId}/open
```

### Permiso

```text id="qqsugz"
votingSessions.open
```

### Request body

```json id="x4zo3e"
{
  "notifyEligibleVoters": true,
  "notificationChannels": ["inApp"],
  "notes": "Se abre la votación durante la asamblea."
}
```

### Response 200

```json id="d3pvc4"
{
  "data": {
    "id": "voting_session_uuid",
    "status": "open",
    "openedAt": "2026-08-15T15:00:00Z",
    "notificationsRequested": true
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

Para abrir una votación:

```text id="qt5pq7"
debe estar en draft o scheduled
debe tener al menos una pregunta
cada pregunta debe tener opciones válidas
debe tener elegibles activos
si opensAt existe, now debe ser compatible con política
si meetingId existe, meeting debe pertenecer al tenant
```

### Evento auditable

```text id="ilh1c2"
votingSession.opened
```

### Evento de notificación sugerido

```text id="efhf20"
votingSession.opened
```

---

## 10.7. Cerrar sesión de votación

### Endpoint

```http id="onadnr"
POST /api/v1/tenant/voting-sessions/{votingSessionId}/close
```

### Permiso

```text id="w4y2mk"
votingSessions.close
```

### Request body opcional

```json id="ih7o9g"
{
  "notes": "Se cierra la votación al finalizar el punto de agenda."
}
```

### Response 200

```json id="wcuylq"
{
  "data": {
    "id": "voting_session_uuid",
    "status": "closed",
    "closedAt": "2026-08-15T17:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Estado origen: `open`.
* Después del cierre no se aceptan votos.
* No calcula resultados automáticamente salvo política explícita futura.

### Evento auditable

```text id="ov8kc7"
votingSession.closed
```

---

## 10.8. Cancelar sesión de votación

### Endpoint

```http id="wh16dw"
POST /api/v1/tenant/voting-sessions/{votingSessionId}/cancel
```

### Permiso

```text id="rwl6q0"
votingSessions.cancel
```

### Request body

```json id="nbss5z"
{
  "reason": "La votación se cancela por error en la configuración de elegibles.",
  "notifyEligibleVoters": true
}
```

### Response 200

```json id="qt3kto"
{
  "data": {
    "id": "voting_session_uuid",
    "status": "cancelled",
    "cancelledAt": "2026-08-15T16:00:00Z",
    "cancellationReason": "La votación se cancela por error en la configuración de elegibles.",
    "notificationsRequested": true
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* `reason` obligatorio.
* Estados cancelables:

  * `draft`;
  * `scheduled`;
  * `open`.
* No se cancela sesión `resultsPublished` o `archived`.
* Puede emitir evento de notificación.

### Evento auditable

```text id="wyi0s6"
votingSession.cancelled
```

---

## 10.9. Archivar sesión de votación

### Endpoint

```http id="cxk3s3"
POST /api/v1/tenant/voting-sessions/{votingSessionId}/archive
```

### Permiso

```text id="x2u4pc"
votingSessions.archive
```

### Request body opcional

```json id="wpqmv3"
{
  "reason": "Votación cerrada y archivada."
}
```

### Response 200

```json id="u1yt57"
{
  "data": {
    "id": "voting_session_uuid",
    "status": "archived",
    "archivedAt": "2026-08-20T12:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Archivo lógico.
* No elimina preguntas, opciones, elegibles, votos, tallies ni resultados.

### Evento auditable

```text id="s9n3u7"
votingSession.archived
```

---

# 11. Ballot Questions

## 11.1. Listar preguntas

### Endpoint

```http id="kj9umo"
GET /api/v1/tenant/voting-sessions/{votingSessionId}/questions
```

### Permiso

```text id="bebvx6"
ballotQuestions.read
```

### Query params

| Nombre         | Tipo   | Requerido |
| -------------- | ------ | --------: |
| `status`       | string |        No |
| `questionType` | string |        No |
| `page`         | number |        No |
| `pageSize`     | number |        No |
| `sortBy`       | string |        No |
| `sortOrder`    | string |        No |

### Response 200

```json id="p4rtdn"
{
  "data": [
    {
      "id": "question_uuid",
      "votingSessionId": "voting_session_uuid",
      "order": 1,
      "title": "¿Aprueba el presupuesto anual 2026?",
      "description": "Pregunta de aprobación presupuestaria.",
      "questionType": "yesNoAbstain",
      "maxSelections": 1,
      "minSelections": 1,
      "allowAbstention": true,
      "status": "draft",
      "createdAt": "2026-07-20T10:10:00Z",
      "updatedAt": "2026-07-20T10:10:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1,
    "traceId": "req_123456"
  }
}
```

---

## 11.2. Crear pregunta

### Endpoint

```http id="i779to"
POST /api/v1/tenant/voting-sessions/{votingSessionId}/questions
```

### Permiso

```text id="gkhfq2"
ballotQuestions.create
```

### Request body

```json id="crnz7t"
{
  "order": 1,
  "title": "¿Aprueba el presupuesto anual 2026?",
  "description": "Pregunta de aprobación presupuestaria.",
  "questionType": "yesNoAbstain",
  "minSelections": 1,
  "maxSelections": 1,
  "allowAbstention": true
}
```

### Response 201

```json id="pl3nye"
{
  "data": {
    "id": "question_uuid",
    "votingSessionId": "voting_session_uuid",
    "order": 1,
    "title": "¿Aprueba el presupuesto anual 2026?",
    "description": "Pregunta de aprobación presupuestaria.",
    "questionType": "yesNoAbstain",
    "minSelections": 1,
    "maxSelections": 1,
    "allowAbstention": true,
    "status": "draft",
    "createdAt": "2026-07-20T10:10:00Z",
    "updatedAt": "2026-07-20T10:10:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* La sesión debe estar en `draft` o `scheduled`.
* `order` debe ser único dentro de la sesión.
* `questionType = singleChoice` requiere `minSelections = 1` y `maxSelections = 1`.
* `questionType = multipleChoice` requiere `maxSelections >= minSelections`.
* El contenido se sanitiza.

### Evento auditable

```text id="f6bp7a"
ballotQuestion.created
```

---

## 11.3. Obtener pregunta

### Endpoint

```http id="s9t8t2"
GET /api/v1/tenant/ballot-questions/{questionId}
```

### Permiso

```text id="rykm7t"
ballotQuestions.read
```

---

## 11.4. Actualizar pregunta

### Endpoint

```http id="fu5x9q"
PATCH /api/v1/tenant/ballot-questions/{questionId}
```

### Permiso

```text id="se454j"
ballotQuestions.update
```

### Request body

```json id="igyfjl"
{
  "title": "¿Aprueba el presupuesto anual actualizado 2026?",
  "description": "Descripción actualizada.",
  "minSelections": 1,
  "maxSelections": 1,
  "allowAbstention": true
}
```

### Reglas

* La sesión no debe estar `open`, `closed`, `resultsCalculated`, `resultsPublished`, `cancelled` o `archived`.
* No se acepta `tenantId`.
* No se cambia `status` por PATCH genérico.

### Evento auditable

```text id="q7jria"
ballotQuestion.updated
```

---

## 11.5. Archivar pregunta

### Endpoint

```http id="ptrnyn"
POST /api/v1/tenant/ballot-questions/{questionId}/archive
```

### Permiso

```text id="opy4id"
ballotQuestions.archive
```

### Evento auditable

```text id="rwmut3"
ballotQuestion.archived
```

---

# 12. Ballot Options

## 12.1. Listar opciones

### Endpoint

```http id="wtvuig"
GET /api/v1/tenant/ballot-questions/{questionId}/options
```

### Permiso

```text id="h9bk7q"
ballotOptions.read
```

### Response 200

```json id="twc20p"
{
  "data": [
    {
      "id": "option_yes_uuid",
      "ballotQuestionId": "question_uuid",
      "order": 1,
      "label": "Sí",
      "description": "Voto afirmativo.",
      "optionType": "yes",
      "isAbstention": false,
      "createdAt": "2026-07-20T10:12:00Z",
      "updatedAt": "2026-07-20T10:12:00Z"
    },
    {
      "id": "option_no_uuid",
      "ballotQuestionId": "question_uuid",
      "order": 2,
      "label": "No",
      "description": "Voto negativo.",
      "optionType": "no",
      "isAbstention": false,
      "createdAt": "2026-07-20T10:12:00Z",
      "updatedAt": "2026-07-20T10:12:00Z"
    }
  ],
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 12.2. Crear opción

### Endpoint

```http id="yzuoke"
POST /api/v1/tenant/ballot-questions/{questionId}/options
```

### Permiso

```text id="ohv0ow"
ballotOptions.create
```

### Request body

```json id="iysipw"
{
  "order": 1,
  "label": "Sí",
  "description": "Voto afirmativo.",
  "optionType": "yes",
  "isAbstention": false
}
```

### Response 201

```json id="zgijpq"
{
  "data": {
    "id": "option_yes_uuid",
    "ballotQuestionId": "question_uuid",
    "order": 1,
    "label": "Sí",
    "description": "Voto afirmativo.",
    "optionType": "yes",
    "isAbstention": false,
    "createdAt": "2026-07-20T10:12:00Z",
    "updatedAt": "2026-07-20T10:12:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* La pregunta debe pertenecer al tenant activo.
* La sesión debe estar editable.
* `order` único por pregunta.
* `label` no duplicado por pregunta activa.
* Solo una opción `isAbstention = true` por pregunta.
* Para `yesNoAbstain`, las opciones deben ser coherentes con `yes`, `no`, `abstain`.

### Evento auditable

```text id="dpum3s"
ballotOption.created
```

---

## 12.3. Obtener opción

```http id="d1kc32"
GET /api/v1/tenant/ballot-options/{optionId}
```

Permiso:

```text id="qvufrm"
ballotOptions.read
```

---

## 12.4. Actualizar opción

```http id="vy2290"
PATCH /api/v1/tenant/ballot-options/{optionId}
```

Permiso:

```text id="r3j59s"
ballotOptions.update
```

Request body:

```json id="jmn19j"
{
  "label": "Sí, apruebo",
  "description": "Voto afirmativo actualizado.",
  "order": 1
}
```

Evento auditable:

```text id="nl7k3j"
ballotOption.updated
```

---

## 12.5. Archivar opción

```http id="xk2bei"
POST /api/v1/tenant/ballot-options/{optionId}/archive
```

Permiso:

```text id="sm4tqu"
ballotOptions.archive
```

Evento auditable:

```text id="solydu"
ballotOption.archived
```

---

# 13. Eligible Voters

## 13.1. Listar elegibles

### Endpoint

```http id="y4jsu3"
GET /api/v1/tenant/voting-sessions/{votingSessionId}/eligible-voters
```

### Permiso

```text id="r4ax8f"
eligibleVoters.read
```

### Query params

| Nombre              | Tipo   | Requerido |
| ------------------- | ------ | --------: |
| `voterType`         | string |        No |
| `eligibilitySource` | string |        No |
| `status`            | string |        No |
| `userId`            | string |        No |
| `personId`          | string |        No |
| `propertyUnitId`    | string |        No |
| `roleId`            | string |        No |
| `page`              | number |        No |
| `pageSize`          | number |        No |

### Response 200

```json id="mkmlcb"
{
  "data": [
    {
      "id": "eligible_voter_uuid",
      "votingSessionId": "voting_session_uuid",
      "voterType": "propertyUnit",
      "userId": null,
      "personId": null,
      "propertyUnitId": "property_unit_uuid",
      "roleId": null,
      "proxyId": null,
      "eligibilitySource": "ownership",
      "weight": "1.00",
      "status": "eligible",
      "resolvedAt": "2026-07-20T10:20:00Z",
      "createdAt": "2026-07-20T10:20:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1,
    "traceId": "req_123456"
  }
}
```

---

## 13.2. Crear elegible manualmente

### Endpoint

```http id="j6bj2r"
POST /api/v1/tenant/voting-sessions/{votingSessionId}/eligible-voters
```

### Permiso

```text id="uevmpm"
eligibleVoters.create
```

### Request body

```json id="e5fp0e"
{
  "voterType": "propertyUnit",
  "propertyUnitId": "property_unit_uuid",
  "eligibilitySource": "manual",
  "weight": "1.00"
}
```

### Response 201

```json id="j3fh4b"
{
  "data": {
    "id": "eligible_voter_uuid",
    "votingSessionId": "voting_session_uuid",
    "voterType": "propertyUnit",
    "propertyUnitId": "property_unit_uuid",
    "eligibilitySource": "manual",
    "weight": "1.00",
    "status": "eligible",
    "resolvedAt": null,
    "createdAt": "2026-07-20T10:20:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Referencias deben pertenecer al tenant activo.
* No se permite duplicar elegible activo.
* `weight` por defecto es `1.00`.
* En MVP no se implementa voto ponderado avanzado aunque se conserve `weight`.

### Evento auditable

```text id="os4or3"
eligibleVoter.added
```

---

## 13.3. Resolver elegibles

### Endpoint

```http id="bwofyi"
POST /api/v1/tenant/voting-sessions/{votingSessionId}/eligible-voters/resolve
```

### Permiso

```text id="caz279"
eligibleVoters.resolve
```

### Request body

```json id="kae31r"
{
  "source": "meetingAttendance",
  "voterType": "propertyUnit",
  "includeStatuses": ["present", "late", "represented"],
  "deduplicate": true,
  "dryRun": false
}
```

### Response 200

```json id="q2v3hz"
{
  "data": {
    "votingSessionId": "voting_session_uuid",
    "source": "meetingAttendance",
    "createdCount": 25,
    "skippedDuplicateCount": 2,
    "invalidReferenceCount": 0,
    "dryRun": false
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Sources permitidos

```text id="gsp3d1"
meetingParticipants
meetingAttendance
owners
residents
propertyUnits
roles
mixed
```

### Reglas

* Si `source = meetingAttendance`, la votación debe estar asociada a una reunión.
* Si `source = residents`, `voting.residentVoting.enabled` debe estar habilitado.
* Si `source = proxy`, los proxies deben estar aprobados.
* No duplica elegibles activos.
* Todas las referencias se validan por tenant.

### Evento auditable

```text id="mhmytg"
eligibleVoters.resolved
```

---

## 13.4. Obtener elegible

```http id="nu1cns"
GET /api/v1/tenant/eligible-voters/{eligibleVoterId}
```

Permiso:

```text id="u21f1m"
eligibleVoters.read
```

---

## 13.5. Actualizar elegible

```http id="qdh59c"
PATCH /api/v1/tenant/eligible-voters/{eligibleVoterId}
```

Permiso:

```text id="nzwxbt"
eligibleVoters.update
```

Request body:

```json id="qeejiq"
{
  "weight": "1.00"
}
```

Evento auditable:

```text id="k6ab2p"
eligibleVoter.updated
```

---

## 13.6. Excluir elegible

### Endpoint

```http id="g1icy9"
POST /api/v1/tenant/eligible-voters/{eligibleVoterId}/exclude
```

### Permiso

```text id="ds65ug"
eligibleVoters.exclude
```

### Request body

```json id="uj03zb"
{
  "reason": "Elegible excluido por duplicidad administrativa."
}
```

### Reglas

* No se debe excluir elegible con voto emitido salvo política explícita y auditoría reforzada.
* Requiere razón.
* No elimina físicamente.

### Evento auditable

```text id="obbj2n"
eligibleVoter.excluded
```

---

## 13.7. Archivar elegible

```http id="mj0631"
POST /api/v1/tenant/eligible-voters/{eligibleVoterId}/archive
```

Permiso:

```text id="esjo16"
eligibleVoters.archive
```

Evento auditable:

```text id="g8azwg"
eligibleVoter.archived
```

---

# 14. Votes administrativas

## 14.1. Listar votos administrativos

### Endpoint

```http id="jwq2hp"
GET /api/v1/tenant/voting-sessions/{votingSessionId}/votes
```

### Permiso

```text id="igdbmg"
votes.read
```

### Query params

| Nombre             | Tipo      | Requerido |
| ------------------ | --------- | --------: |
| `ballotQuestionId` | string    |        No |
| `eligibleVoterId`  | string    |        No |
| `status`           | string    |        No |
| `castFrom`         | date-time |        No |
| `castTo`           | date-time |        No |
| `page`             | number    |        No |
| `pageSize`         | number    |        No |

### Response 200 — `identified`

```json id="asx34z"
{
  "data": [
    {
      "id": "vote_cast_uuid",
      "votingSessionId": "voting_session_uuid",
      "ballotQuestionId": "question_uuid",
      "eligibleVoterId": "eligible_voter_uuid",
      "voterUserId": "user_uuid",
      "voterPersonId": "person_uuid",
      "voterPropertyUnitId": "property_unit_uuid",
      "selectedOptionId": "option_yes_uuid",
      "selectedOptionIds": null,
      "status": "cast",
      "castAt": "2026-08-15T15:10:00Z",
      "cancelledAt": null,
      "cancellationReason": null,
      "createdAt": "2026-08-15T15:10:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1,
    "traceId": "req_123456"
  }
}
```

### Response 200 — `secretBasic`

```json id="ecivnw"
{
  "data": [
    {
      "id": "vote_cast_uuid",
      "votingSessionId": "voting_session_uuid",
      "ballotQuestionId": "question_uuid",
      "eligibleVoterId": "eligible_voter_uuid",
      "status": "cast",
      "castAt": "2026-08-15T15:10:00Z",
      "cancelledAt": null,
      "createdAt": "2026-08-15T15:10:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1,
    "traceId": "req_123456"
  }
}
```

### Reglas

En `secretBasic`, no devolver:

```text id="qtm41p"
selectedOptionId
selectedOptionIds
label de opción votada
metadata sensible
```

---

## 14.2. Obtener voto administrativo

```http id="s4ut3j"
GET /api/v1/tenant/votes/{voteCastId}
```

Permiso:

```text id="cd2qvo"
votes.read
```

Regla especial:

```text id="ju20dl"
Si privacyMode = secretBasic, ocultar selectedOptionId y selectedOptionIds salvo permiso excepcional futuro no incluido en MVP.
```

---

## 14.3. Anular voto

### Endpoint

```http id="e23fwm"
POST /api/v1/tenant/votes/{voteCastId}/cancel
```

### Permiso

```text id="ra4wv2"
votes.cancel
```

### Request body

```json id="yxuqdw"
{
  "reason": "Anulación administrativa por error comprobado."
}
```

### Response 200

```json id="t8y8ye"
{
  "data": {
    "id": "vote_cast_uuid",
    "status": "cancelled",
    "cancelledAt": "2026-08-15T16:00:00Z",
    "requiresResultsRecalculation": true
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Requiere razón.
* Debe invalidar resultados calculados o marcar que requieren recálculo.
* En `secretBasic`, la auditoría no debe incluir opción seleccionada.

### Evento auditable

```text id="fx7bat"
voteCast.cancelled
```

---

# 15. Results

## 15.1. Calcular resultados

### Endpoint

```http id="yzdgv6"
POST /api/v1/tenant/voting-sessions/{votingSessionId}/calculate-results
```

### Permiso

```text id="xudgur"
votingResults.calculate
```

### Request body opcional

```json id="g7yqbk"
{
  "forceRecalculate": false
}
```

### Response 200

```json id="scxkuo"
{
  "data": {
    "votingSessionId": "voting_session_uuid",
    "status": "resultsCalculated",
    "resultsCalculatedAt": "2026-08-15T17:05:00Z",
    "questionsProcessed": 2,
    "results": [
      {
        "id": "voting_result_uuid",
        "ballotQuestionId": "question_uuid",
        "resultStatus": "passed",
        "winningOptionId": "option_yes_uuid",
        "totalEligible": 40,
        "totalVotes": 30,
        "totalAbstentions": 2,
        "participationPercentage": "75.00",
        "requiredThreshold": "50.00",
        "thresholdMet": true,
        "calculatedAt": "2026-08-15T17:05:00Z"
      }
    ]
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* La sesión debe estar `closed`.
* Cuenta votos `status = cast`.
* No cuenta votos `cancelled`, `superseded` o `archived`.
* No modifica votos.
* No ejecuta acciones automáticas.
* Usa `Decimal` para porcentajes y pesos.
* En `secretBasic`, no expone identidades individuales.

### Evento auditable

```text id="q305iv"
votingResults.calculated
```

---

## 15.2. Consultar resultados administrativos

### Endpoint

```http id="o0rdfl"
GET /api/v1/tenant/voting-sessions/{votingSessionId}/results
```

### Permiso

```text id="fknmqr"
votingResults.read
```

### Response 200

```json id="q5lzql"
{
  "data": {
    "votingSessionId": "voting_session_uuid",
    "status": "resultsCalculated",
    "resultsPublishedAt": null,
    "results": [
      {
        "id": "voting_result_uuid",
        "ballotQuestionId": "question_uuid",
        "resultStatus": "passed",
        "winningOptionId": "option_yes_uuid",
        "totalEligible": 40,
        "totalVotes": 30,
        "totalAbstentions": 2,
        "participationPercentage": "75.00",
        "requiredThreshold": "50.00",
        "thresholdMet": true,
        "calculatedAt": "2026-08-15T17:05:00Z",
        "publishedAt": null,
        "tallies": [
          {
            "ballotOptionId": "option_yes_uuid",
            "totalVotes": 20,
            "weightedTotal": "20.00",
            "percentage": "66.67"
          },
          {
            "ballotOptionId": "option_no_uuid",
            "totalVotes": 8,
            "weightedTotal": "8.00",
            "percentage": "26.67"
          },
          {
            "ballotOptionId": "option_abstain_uuid",
            "totalVotes": 2,
            "weightedTotal": "2.00",
            "percentage": "6.66"
          }
        ]
      }
    ]
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 15.3. Publicar resultados

### Endpoint

```http id="ia6cun"
POST /api/v1/tenant/voting-sessions/{votingSessionId}/publish-results
```

### Permiso

```text id="kcg5ws"
votingResults.publish
```

### Request body

```json id="sc7bke"
{
  "notifyAudience": true,
  "notes": "Se publican los resultados para la audiencia autorizada."
}
```

### Response 200

```json id="qp1x9f"
{
  "data": {
    "votingSessionId": "voting_session_uuid",
    "status": "resultsPublished",
    "resultsPublishedAt": "2026-08-15T17:20:00Z",
    "notificationsRequested": true
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Requiere resultados calculados.
* No expone resultados públicamente.
* En `secretBasic`, publica resultados agregados sin identidades.
* Puede emitir evento de notificación.

### Eventos

```text id="cjht1t"
votingResults.published
votingSession.resultsPublished
```

---

## 15.4. Vincular resultado con resolución

### Endpoint

```http id="q6or60"
POST /api/v1/tenant/voting-sessions/{votingSessionId}/results/{resultId}/link-resolution
```

### Permiso

```text id="ji7hlt"
votingResults.linkResolution
```

### Request body

```json id="nl6y5y"
{
  "meetingResolutionId": "meeting_resolution_uuid"
}
```

### Response 201

```json id="pmbpjq"
{
  "data": {
    "id": "voting_resolution_link_uuid",
    "votingSessionId": "voting_session_uuid",
    "ballotQuestionId": "question_uuid",
    "votingResultId": "voting_result_uuid",
    "meetingResolutionId": "meeting_resolution_uuid",
    "linkedAt": "2026-08-15T17:30:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Resultado y resolución deben pertenecer al mismo tenant.
* Si la votación tiene `meetingId`, la resolución debe pertenecer a la misma reunión.
* No crea resolución automáticamente.
* No aprueba resolución automáticamente.
* No ejecuta acciones automáticas.

### Evento auditable

```text id="iv2u44"
votingResult.linkedToResolution
```

---

# 16. Endpoints `/me`

## 16.1. Listar mis votaciones

### Endpoint

```http id="xz8xd0"
GET /api/v1/me/voting-sessions
```

### Permiso

```text id="egpsx3"
votes.read.own
```

### Query params

| Nombre             | Tipo      | Requerido |
| ------------------ | --------- | --------: |
| `status`           | string    |        No |
| `meetingId`        | string    |        No |
| `opensFrom`        | date-time |        No |
| `opensTo`          | date-time |        No |
| `closesFrom`       | date-time |        No |
| `closesTo`         | date-time |        No |
| `pendingOnly`      | boolean   |        No |
| `resultsAvailable` | boolean   |        No |
| `page`             | number    |        No |
| `pageSize`         | number    |        No |

### Response 200

```json id="hwi3j9"
{
  "data": [
    {
      "id": "voting_session_uuid",
      "meetingId": "meeting_uuid",
      "title": "Votación de Asamblea Ordinaria 2026",
      "description": "Sesión de votación para puntos de la asamblea.",
      "status": "open",
      "visibility": "owners",
      "votingMode": "multiQuestion",
      "privacyMode": "secretBasic",
      "opensAt": "2026-08-15T15:00:00Z",
      "closesAt": "2026-08-15T17:00:00Z",
      "myParticipationStatus": "pending",
      "resultsAvailable": false
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1,
    "traceId": "req_123456"
  }
}
```

### Reglas

* Solo devuelve votaciones donde el actor es elegible o pertenece a audiencia autorizada.
* No devuelve lista completa de elegibles.
* No devuelve votos de terceros.
* No devuelve auditoría.
* No devuelve metadata interna.

---

## 16.2. Obtener mi votación

### Endpoint

```http id="o017js"
GET /api/v1/me/voting-sessions/{votingSessionId}
```

### Permiso

```text id="xe72tl"
votes.read.own
```

### Response 200

```json id="t630sk"
{
  "data": {
    "id": "voting_session_uuid",
    "meetingId": "meeting_uuid",
    "title": "Votación de Asamblea Ordinaria 2026",
    "description": "Sesión de votación para puntos de la asamblea.",
    "status": "open",
    "visibility": "owners",
    "votingMode": "multiQuestion",
    "privacyMode": "secretBasic",
    "opensAt": "2026-08-15T15:00:00Z",
    "closesAt": "2026-08-15T17:00:00Z",
    "myParticipationStatus": "pending",
    "resultsAvailable": false
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 16.3. Consultar preguntas de mi votación

### Endpoint

```http id="f8i4xg"
GET /api/v1/me/voting-sessions/{votingSessionId}/questions
```

### Permiso

```text id="ke5okx"
votes.read.own
```

### Response 200

```json id="q1bnaz"
{
  "data": [
    {
      "id": "question_uuid",
      "order": 1,
      "title": "¿Aprueba el presupuesto anual 2026?",
      "description": "Pregunta de aprobación presupuestaria.",
      "questionType": "yesNoAbstain",
      "minSelections": 1,
      "maxSelections": 1,
      "allowAbstention": true,
      "status": "active",
      "options": [
        {
          "id": "option_yes_uuid",
          "order": 1,
          "label": "Sí",
          "description": "Voto afirmativo.",
          "optionType": "yes",
          "isAbstention": false
        },
        {
          "id": "option_no_uuid",
          "order": 2,
          "label": "No",
          "description": "Voto negativo.",
          "optionType": "no",
          "isAbstention": false
        },
        {
          "id": "option_abstain_uuid",
          "order": 3,
          "label": "Abstención",
          "description": "Abstención.",
          "optionType": "abstain",
          "isAbstention": true
        }
      ],
      "myVoteStatus": "notVoted"
    }
  ],
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 16.4. Consultar mi participación

### Endpoint

```http id="bqj5xp"
GET /api/v1/me/voting-sessions/{votingSessionId}/participation
```

### Permiso

```text id="wf0e3b"
votes.read.own
```

### Response 200 — `secretBasic`

```json id="t0qttn"
{
  "data": {
    "votingSessionId": "voting_session_uuid",
    "privacyMode": "secretBasic",
    "eligibleVoters": [
      {
        "eligibleVoterId": "eligible_voter_uuid",
        "voterType": "propertyUnit",
        "propertyUnitId": "property_unit_uuid",
        "status": "voted",
        "questions": [
          {
            "ballotQuestionId": "question_uuid",
            "voteStatus": "cast",
            "castAt": "2026-08-15T15:10:00Z"
          }
        ]
      }
    ]
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

En `secretBasic`, no devolver:

```text id="xicptx"
selectedOptionId
selectedOptionIds
opción votada
votos de terceros
```

---

## 16.5. Emitir voto propio

### Endpoint

```http id="upaa5d"
POST /api/v1/me/voting-sessions/{votingSessionId}/questions/{questionId}/vote
```

### Permiso

```text id="dsmhor"
votes.cast.own
```

### Request body — opción única

```json id="oaaqd3"
{
  "eligibleVoterId": "eligible_voter_uuid",
  "selectedOptionId": "option_yes_uuid"
}
```

### Request body — opción múltiple

```json id="hj26bm"
{
  "eligibleVoterId": "eligible_voter_uuid",
  "selectedOptionIds": [
    "option_a_uuid",
    "option_b_uuid"
  ]
}
```

### Response 201 — `secretBasic`

```json id="vn1u38"
{
  "data": {
    "id": "vote_cast_uuid",
    "votingSessionId": "voting_session_uuid",
    "ballotQuestionId": "question_uuid",
    "status": "cast",
    "castAt": "2026-08-15T15:10:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Response 201 — `identified`

```json id="upauqg"
{
  "data": {
    "id": "vote_cast_uuid",
    "votingSessionId": "voting_session_uuid",
    "ballotQuestionId": "question_uuid",
    "eligibleVoterId": "eligible_voter_uuid",
    "selectedOptionId": "option_yes_uuid",
    "selectedOptionIds": null,
    "status": "cast",
    "castAt": "2026-08-15T15:10:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

Para votar:

```text id="kjgrxp"
usuario autenticado
membership activa
tenant activo
votingSession.tenantId = currentTenant.id
votingSession.status = open
now dentro de opensAt/closesAt si existen
question pertenece a votingSession
question.status = active
eligibleVoter pertenece a votingSession
eligibleVoter pertenece al actor o a su unidad/persona autorizada
eligibleVoter.status = eligible
no existe voto activo previo para la pregunta
opción pertenece a pregunta
multipleChoice respeta minSelections/maxSelections
proxy requiere proxy approved
```

### Evento auditable

```text id="v6mcpf"
voteCast.cast
```

### Nota de auditoría

En `secretBasic`, la metadata de auditoría no debe incluir:

```text id="myjjdb"
selectedOptionId
selectedOptionIds
label de opción
```

---

## 16.6. Consultar resultados propios

### Endpoint

```http id="ix54we"
GET /api/v1/me/voting-sessions/{votingSessionId}/results
```

### Permiso

```text id="a9w1ix"
votingResults.read.own
```

### Response 200

```json id="x97s8m"
{
  "data": {
    "votingSessionId": "voting_session_uuid",
    "resultsPublishedAt": "2026-08-15T17:20:00Z",
    "results": [
      {
        "ballotQuestionId": "question_uuid",
        "resultStatus": "passed",
        "winningOptionId": "option_yes_uuid",
        "totalVotes": 30,
        "totalAbstentions": 2,
        "participationPercentage": "75.00",
        "thresholdMet": true,
        "publishedAt": "2026-08-15T17:20:00Z",
        "tallies": [
          {
            "ballotOptionId": "option_yes_uuid",
            "totalVotes": 20,
            "percentage": "66.67"
          },
          {
            "ballotOptionId": "option_no_uuid",
            "totalVotes": 8,
            "percentage": "26.67"
          },
          {
            "ballotOptionId": "option_abstain_uuid",
            "totalVotes": 2,
            "percentage": "6.66"
          }
        ]
      }
    ]
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Solo resultados publicados.
* Solo usuario elegible o audiencia autorizada.
* No expone identidades individuales.
* No expone votos individuales.

---

# 17. Matriz de endpoints

| Método | Ruta                                                                                  | Scope  | Auth | Permiso                        |
| ------ | ------------------------------------------------------------------------------------- | ------ | ---- | ------------------------------ |
| GET    | `/api/v1/tenant/voting-sessions`                                                      | tenant | Sí   | `votingSessions.read`          |
| POST   | `/api/v1/tenant/voting-sessions`                                                      | tenant | Sí   | `votingSessions.create`        |
| GET    | `/api/v1/tenant/voting-sessions/{votingSessionId}`                                    | tenant | Sí   | `votingSessions.read`          |
| PATCH  | `/api/v1/tenant/voting-sessions/{votingSessionId}`                                    | tenant | Sí   | `votingSessions.update`        |
| POST   | `/api/v1/tenant/voting-sessions/{votingSessionId}/schedule`                           | tenant | Sí   | `votingSessions.schedule`      |
| POST   | `/api/v1/tenant/voting-sessions/{votingSessionId}/open`                               | tenant | Sí   | `votingSessions.open`          |
| POST   | `/api/v1/tenant/voting-sessions/{votingSessionId}/close`                              | tenant | Sí   | `votingSessions.close`         |
| POST   | `/api/v1/tenant/voting-sessions/{votingSessionId}/cancel`                             | tenant | Sí   | `votingSessions.cancel`        |
| POST   | `/api/v1/tenant/voting-sessions/{votingSessionId}/archive`                            | tenant | Sí   | `votingSessions.archive`       |
| GET    | `/api/v1/tenant/voting-sessions/{votingSessionId}/questions`                          | tenant | Sí   | `ballotQuestions.read`         |
| POST   | `/api/v1/tenant/voting-sessions/{votingSessionId}/questions`                          | tenant | Sí   | `ballotQuestions.create`       |
| GET    | `/api/v1/tenant/ballot-questions/{questionId}`                                        | tenant | Sí   | `ballotQuestions.read`         |
| PATCH  | `/api/v1/tenant/ballot-questions/{questionId}`                                        | tenant | Sí   | `ballotQuestions.update`       |
| POST   | `/api/v1/tenant/ballot-questions/{questionId}/archive`                                | tenant | Sí   | `ballotQuestions.archive`      |
| GET    | `/api/v1/tenant/ballot-questions/{questionId}/options`                                | tenant | Sí   | `ballotOptions.read`           |
| POST   | `/api/v1/tenant/ballot-questions/{questionId}/options`                                | tenant | Sí   | `ballotOptions.create`         |
| GET    | `/api/v1/tenant/ballot-options/{optionId}`                                            | tenant | Sí   | `ballotOptions.read`           |
| PATCH  | `/api/v1/tenant/ballot-options/{optionId}`                                            | tenant | Sí   | `ballotOptions.update`         |
| POST   | `/api/v1/tenant/ballot-options/{optionId}/archive`                                    | tenant | Sí   | `ballotOptions.archive`        |
| GET    | `/api/v1/tenant/voting-sessions/{votingSessionId}/eligible-voters`                    | tenant | Sí   | `eligibleVoters.read`          |
| POST   | `/api/v1/tenant/voting-sessions/{votingSessionId}/eligible-voters`                    | tenant | Sí   | `eligibleVoters.create`        |
| POST   | `/api/v1/tenant/voting-sessions/{votingSessionId}/eligible-voters/resolve`            | tenant | Sí   | `eligibleVoters.resolve`       |
| GET    | `/api/v1/tenant/eligible-voters/{eligibleVoterId}`                                    | tenant | Sí   | `eligibleVoters.read`          |
| PATCH  | `/api/v1/tenant/eligible-voters/{eligibleVoterId}`                                    | tenant | Sí   | `eligibleVoters.update`        |
| POST   | `/api/v1/tenant/eligible-voters/{eligibleVoterId}/exclude`                            | tenant | Sí   | `eligibleVoters.exclude`       |
| POST   | `/api/v1/tenant/eligible-voters/{eligibleVoterId}/archive`                            | tenant | Sí   | `eligibleVoters.archive`       |
| GET    | `/api/v1/tenant/voting-sessions/{votingSessionId}/votes`                              | tenant | Sí   | `votes.read`                   |
| GET    | `/api/v1/tenant/votes/{voteCastId}`                                                   | tenant | Sí   | `votes.read`                   |
| POST   | `/api/v1/tenant/votes/{voteCastId}/cancel`                                            | tenant | Sí   | `votes.cancel`                 |
| POST   | `/api/v1/tenant/voting-sessions/{votingSessionId}/calculate-results`                  | tenant | Sí   | `votingResults.calculate`      |
| GET    | `/api/v1/tenant/voting-sessions/{votingSessionId}/results`                            | tenant | Sí   | `votingResults.read`           |
| POST   | `/api/v1/tenant/voting-sessions/{votingSessionId}/publish-results`                    | tenant | Sí   | `votingResults.publish`        |
| POST   | `/api/v1/tenant/voting-sessions/{votingSessionId}/results/{resultId}/link-resolution` | tenant | Sí   | `votingResults.linkResolution` |
| GET    | `/api/v1/me/voting-sessions`                                                          | own    | Sí   | `votes.read.own`               |
| GET    | `/api/v1/me/voting-sessions/{votingSessionId}`                                        | own    | Sí   | `votes.read.own`               |
| GET    | `/api/v1/me/voting-sessions/{votingSessionId}/questions`                              | own    | Sí   | `votes.read.own`               |
| GET    | `/api/v1/me/voting-sessions/{votingSessionId}/participation`                          | own    | Sí   | `votes.read.own`               |
| POST   | `/api/v1/me/voting-sessions/{votingSessionId}/questions/{questionId}/vote`            | own    | Sí   | `votes.cast.own`               |
| GET    | `/api/v1/me/voting-sessions/{votingSessionId}/results`                                | own    | Sí   | `votingResults.read.own`       |

---

# 18. Catálogo de errores

| Código                                  | HTTP | Descripción                               |
| --------------------------------------- | ---: | ----------------------------------------- |
| `VOTING_SESSION_NOT_FOUND`              |  404 | Sesión no encontrada o no accesible       |
| `VOTING_SESSION_FORBIDDEN`              |  403 | Usuario sin acceso a la sesión            |
| `VOTING_SESSION_INVALID_TRANSITION`     |  409 | Transición de estado inválida             |
| `VOTING_SESSION_INVALID_WINDOW`         |  422 | Ventana de votación inválida              |
| `VOTING_SESSION_CROSS_TENANT_REFERENCE` |  403 | Referencia de otro tenant                 |
| `VOTING_SESSION_NOT_OPEN`               |  409 | La sesión no está abierta                 |
| `VOTING_SESSION_ALREADY_CLOSED`         |  409 | La sesión ya está cerrada                 |
| `BALLOT_QUESTION_NOT_FOUND`             |  404 | Pregunta no encontrada                    |
| `BALLOT_QUESTION_INVALID`               |  422 | Pregunta inválida                         |
| `BALLOT_QUESTION_NOT_EDITABLE`          |  409 | Pregunta no editable por estado           |
| `BALLOT_OPTION_NOT_FOUND`               |  404 | Opción no encontrada                      |
| `BALLOT_OPTION_INVALID`                 |  422 | Opción inválida                           |
| `BALLOT_OPTION_DUPLICATE`               |  409 | Opción duplicada                          |
| `BALLOT_OPTION_CROSS_QUESTION`          |  422 | Opción no pertenece a la pregunta         |
| `ELIGIBLE_VOTER_NOT_FOUND`              |  404 | Elegible no encontrado                    |
| `ELIGIBLE_VOTER_FORBIDDEN`              |  403 | Elegible no pertenece al usuario o tenant |
| `ELIGIBLE_VOTER_DUPLICATE`              |  409 | Elegible duplicado                        |
| `ELIGIBLE_VOTER_CROSS_TENANT_REFERENCE` |  403 | Elegible con referencia de otro tenant    |
| `ELIGIBLE_VOTER_ALREADY_VOTED`          |  409 | Elegible ya votó                          |
| `VOTE_NOT_ELIGIBLE`                     |  403 | Actor no elegible                         |
| `VOTE_DUPLICATE`                        |  409 | Voto duplicado                            |
| `VOTE_INVALID_SELECTION`                |  422 | Selección inválida                        |
| `VOTE_OUTSIDE_WINDOW`                   |  409 | Voto fuera de ventana                     |
| `VOTE_SESSION_NOT_OPEN`                 |  409 | Votación no abierta                       |
| `VOTE_PROXY_NOT_APPROVED`               |  422 | Proxy no aprobado                         |
| `VOTE_PRIVACY_RESTRICTED`               |  403 | Modo de privacidad restringe la consulta  |
| `VOTE_CAST_NOT_FOUND`                   |  404 | Voto no encontrado                        |
| `VOTE_CANCEL_REASON_REQUIRED`           |  422 | Falta razón de anulación                  |
| `VOTING_RESULTS_NOT_FOUND`              |  404 | Resultados no encontrados                 |
| `VOTING_RESULTS_ALREADY_CALCULATED`     |  409 | Resultados ya calculados                  |
| `VOTING_RESULTS_NOT_CALCULATED`         |  409 | Resultados no calculados                  |
| `VOTING_RESULTS_PUBLICATION_FORBIDDEN`  |  403 | No autorizado para publicar resultados    |
| `VOTING_RESOLUTION_LINK_INVALID`        |  422 | Vínculo con resolución inválido           |
| `VALIDATION_ERROR`                      |  422 | Error de validación                       |
| `UNAUTHORIZED`                          |  401 | No autenticado                            |
| `FORBIDDEN`                             |  403 | Sin permiso                               |
| `RATE_LIMITED`                          |  429 | Rate limit                                |
| `INTERNAL_ERROR`                        |  500 | Error interno                             |

---

# 19. Ejemplos de errores

## 19.1. Votación no encontrada

```json id="jknoaw"
{
  "error": {
    "code": "VOTING_SESSION_NOT_FOUND",
    "message": "Voting session not found.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

## 19.2. Transición inválida

```json id="sz2316"
{
  "error": {
    "code": "VOTING_SESSION_INVALID_TRANSITION",
    "message": "The requested voting session status transition is not allowed.",
    "details": {
      "fromStatus": "resultsPublished",
      "toStatus": "open"
    },
    "traceId": "req_123456"
  }
}
```

---

## 19.3. Voto duplicado

```json id="dd677t"
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

## 19.4. Voto fuera de ventana

```json id="czwed3"
{
  "error": {
    "code": "VOTE_OUTSIDE_WINDOW",
    "message": "Voting is outside the allowed time window.",
    "details": {
      "opensAt": "2026-08-15T15:00:00Z",
      "closesAt": "2026-08-15T17:00:00Z"
    },
    "traceId": "req_123456"
  }
}
```

---

## 19.5. No elegible

```json id="tvgxxd"
{
  "error": {
    "code": "VOTE_NOT_ELIGIBLE",
    "message": "The current user is not eligible to vote in this session.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

## 19.6. Privacidad restringida

```json id="exin4v"
{
  "error": {
    "code": "VOTE_PRIVACY_RESTRICTED",
    "message": "Vote details are restricted by the voting privacy mode.",
    "details": {
      "privacyMode": "secretBasic"
    },
    "traceId": "req_123456"
  }
}
```

---

# 20. Reglas de seguridad del contrato

## 20.1. Endpoints administrativos

Deben aplicar:

```text id="qku3oz"
AuthGuard
TenantGuard
TenantPermissionGuard
VotingPermissionGuard
tenant_id filter
state validation
eligibility validation
privacy validation
safe DTO validation
content sanitization
audit events
safe errors
Cache-Control: no-store
```

---

## 20.2. Endpoints `/me`

Deben aplicar:

```text id="qb63f6"
AuthGuard
TenantGuard
TenantPermissionGuard
OwnVotingGuard
EligibleVoterGuard
VoteCastingGuard
VotingPrivacyGuard
own-resource validation
person/propertyUnit resolution
safe DTO minimization
no third-party vote exposure
Cache-Control: no-store
```

---

## 20.3. No endpoints públicos

Deben existir pruebas negativas para rutas públicas de votación.

---

## 20.4. Content sanitization

Deben sanitizarse:

```text id="qj0pg2"
votingSession.title
votingSession.description
ballotQuestion.title
ballotQuestion.description
ballotOption.label
ballotOption.description
cancelReason
metadata
```

Bloquear:

```text id="k2b1hr"
<script>
<iframe>
<object>
<embed>
event handlers inline
javascript:
data URLs peligrosas
HTML no sanitizado
```

---

# 21. Auditoría

## 21.1. Eventos obligatorios

```text id="xx55vu"
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

## 21.2. Metadata permitida

```json id="b5wgu2"
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

## 21.3. Metadata prohibida

```text id="ozzv3o"
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

# 22. Observabilidad

## 22.1. Logs sugeridos

```text id="vedaqw"
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

## 22.2. Métricas sugeridas

```text id="x0rjqt"
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

## 22.3. Labels permitidos

```text id="s3qqxc"
votingStatus
privacyMode
eligibilityMode
votingRule
questionType
resultStatus
outcome
```

---

## 22.4. Labels prohibidos

```text id="mebkaj"
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

# 23. OpenAPI

## 23.1. Tags sugeridos

```text id="uuj749"
Voting Sessions
Ballot Questions
Ballot Options
Eligible Voters
Votes
Voting Results
My Voting
```

---

## 23.2. Extensiones OpenAPI sugeridas

### Endpoint tenant

```yaml id="yc5i9l"
x-tenant-scope: true
x-auth-required: true
x-required-permission: votingSessions.create
x-audit-event: votingSession.created
```

---

### Endpoint `/me`

```yaml id="m51upv"
x-tenant-scope: true
x-auth-required: true
x-own-resource: true
x-required-permission: votes.cast.own
```

---

### Endpoint de emisión de voto

```yaml id="nysjbi"
x-vote-casting: true
x-eligibility-required: true
x-duplicate-protected: true
x-privacy-mode-aware: true
x-audit-event: voteCast.cast
```

---

### Endpoint de resultados

```yaml id="r7pr36"
x-result-calculation: deterministic
x-public-exposure: false
x-audit-event: votingResults.calculated
```

---

### Endpoint secretBasic

```yaml id="jxvicr"
x-privacy-mode-aware: true
x-secret-basic-selected-option-hidden: true
```

---

## 23.3. OpenAPI no debe documentar

```text id="ecum4h"
GET /api/v1/public/tenants/{slug}/voting-sessions
GET /api/v1/public/tenants/{slug}/voting-sessions/{votingSessionId}
GET /api/v1/public/tenants/{slug}/voting-sessions/{votingSessionId}/results
POST /api/v1/public/tenants/{slug}/voting-sessions/{votingSessionId}/vote
```

---

# 24. Casos borde del contrato

| Caso                                                   | Resultado esperado           |
| ------------------------------------------------------ | ---------------------------- |
| Crear votación sin título                              | 422                          |
| Crear votación con `tenantId` en body                  | 422                          |
| Asociar `meetingId` de otro tenant                     | 403/404                      |
| Crear pregunta sin título                              | 422                          |
| Crear pregunta en sesión `open`                        | 409                          |
| Crear opción duplicada                                 | 409                          |
| Crear dos abstenciones en una pregunta                 | 409                          |
| Abrir votación sin preguntas                           | 422                          |
| Abrir votación sin opciones                            | 422                          |
| Abrir votación sin elegibles                           | 422                          |
| Votar sin ser elegible                                 | 403/404                      |
| Votar dos veces la misma pregunta                      | 409                          |
| Votar en sesión `draft`                                | 409                          |
| Votar en sesión `closed`                               | 409                          |
| Votar en sesión `cancelled`                            | 409                          |
| Votar antes de `opensAt`                               | 409                          |
| Votar después de `closesAt`                            | 409                          |
| Opción de otra pregunta                                | 422/403                      |
| Opción de otro tenant                                  | 403/404                      |
| Multiple choice bajo mínimo                            | 422                          |
| Multiple choice sobre máximo                           | 422                          |
| Multiple choice con opción duplicada                   | 422                          |
| Votar por unidad ajena                                 | 403/404                      |
| Votar como proxy sin aprobación                        | 422                          |
| Cerrar votación dos veces                              | 409 o idempotente controlado |
| Calcular resultados con sesión abierta                 | 409                          |
| Publicar resultados sin cálculo                        | 409                          |
| Resultados `secretBasic` con identidad                 | debe bloquearse              |
| Endpoint público de votación                           | no existe                    |
| OpenAPI documenta endpoint público                     | falla                        |
| Log contiene `selectedOptionId` en `secretBasic`       | falla                        |
| Auditoría contiene `selectedOptionId` en `secretBasic` | falla                        |

---

# 25. Pruebas de contrato requeridas

## 25.1. Voting Sessions

Debe probar:

```text id="mxabbv"
GET /api/v1/tenant/voting-sessions
POST /api/v1/tenant/voting-sessions
GET /api/v1/tenant/voting-sessions/{votingSessionId}
PATCH /api/v1/tenant/voting-sessions/{votingSessionId}
POST /api/v1/tenant/voting-sessions/{votingSessionId}/schedule
POST /api/v1/tenant/voting-sessions/{votingSessionId}/open
POST /api/v1/tenant/voting-sessions/{votingSessionId}/close
POST /api/v1/tenant/voting-sessions/{votingSessionId}/cancel
POST /api/v1/tenant/voting-sessions/{votingSessionId}/archive
```

Casos mínimos:

```text id="ho9fio"
401 sin token
403 sin permiso
201 crear válida
422 sin title
422 tenantId en body
403/404 meetingId tenant B
409 transición inválida
auditoría
```

---

## 25.2. Questions and Options

Debe probar:

```text id="qzbcyr"
crear pregunta
listar preguntas
editar pregunta
archivar pregunta
crear opción
listar opciones
editar opción
archivar opción
rechazar opción duplicada
rechazar segunda abstención
rechazar opción de tenant B
```

---

## 25.3. Eligible Voters

Debe probar:

```text id="ge8kb4"
crear elegible manual
resolver elegibles por meetingParticipants
resolver elegibles por meetingAttendance
resolver elegibles por owners
resolver elegibles por propertyUnits
rechazar residentes si feature flag está deshabilitada
rechazar elegible duplicado
rechazar userId tenant B
rechazar personId tenant B
rechazar propertyUnitId tenant B
rechazar proxy no approved
```

---

## 25.4. Vote Casting

Debe probar:

```text id="l0lir4"
votar singleChoice
votar yesNoAbstain
votar abstention
votar multipleChoice
rechazar no elegible
rechazar voto duplicado
rechazar sesión no open
rechazar fuera de ventana
rechazar opción de otra pregunta
rechazar unidad ajena
rechazar proxy no approved
secretBasic no devuelve selectedOptionId
```

---

## 25.5. Results

Debe probar:

```text id="ypk9c5"
calcular simpleMajority
calcular absoluteMajority
calcular plurality
calcular unanimity
calcular informational
excluir votos cancelled
no modificar votos al calcular
publicar resultados calculados
rechazar publicar sin cálculo
vincular resultado con resolución
rechazar resolución de otro tenant
rechazar resolución de otra reunión
```

---

## 25.6. `/me`

Debe probar:

```text id="pvjewe"
listar votaciones propias
consultar votación propia
consultar preguntas propias
consultar participación propia
emitir voto propio
consultar resultados publicados propios
no ver votaciones ajenas
no ver votos de terceros
no ver selectedOptionId en secretBasic
no votar por unidad ajena
```

---

# 26. Decisión final del contrato API

El módulo `014-voting-basic` expondrá endpoints REST para:

```text id="e1tztj"
1. Gestión administrativa de sesiones de votación.
2. Gestión de preguntas.
3. Gestión de opciones.
4. Gestión y resolución de elegibles.
5. Consulta administrativa de votos.
6. Anulación administrativa de votos.
7. Cálculo determinístico de resultados.
8. Publicación controlada de resultados.
9. Vinculación explícita con resoluciones.
10. Consulta de votaciones propias.
11. Emisión de voto propio.
12. Consulta propia de participación.
13. Consulta propia de resultados publicados.
```

El contrato garantiza:

```text id="lfp4bt"
tenant isolation
permissioned access
eligibility validation
own-resource authorization
privacy mode enforcement
duplicate vote prevention
voting window validation
state transition control
deterministic result calculation
controlled result publication
no public exposure
notification event integration
audit trail
safe DTOs
safe errors
safe logs
safe metrics
OpenAPI consistency
CI validation
```

La implementación no debe aceptarse si permite votaciones cross-tenant, preguntas cross-tenant, opciones cross-tenant, elegibles cross-tenant, votos cross-tenant, voto duplicado, voto fuera de ventana, voto de no elegible, voto por unidad ajena, voto con proxy no aprobado, exposición de voto individual en `secretBasic`, logs con `selectedOptionId`, auditoría con `selectedOptionId` en `secretBasic`, publicación sin cálculo, endpoints públicos, OpenAPI con rutas públicas de votación, o ejecución automática de cargos, multas, resoluciones, firmas o procesos legales desde resultados de votación.
