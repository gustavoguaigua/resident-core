# Data Model — Spec 014 Voting Basic

## 1. Información del documento

| Campo                  | Valor                                                                                                     |
| ---------------------- | --------------------------------------------------------------------------------------------------------- |
| Proyecto               | RESIDENT Core                                                                                             |
| Spec ID                | 014                                                                                                       |
| Módulo                 | Voting Basic                                                                                              |
| Documento              | Data Model                                                                                                |
| Ruta                   | `docs/specs/014-voting-basic/data-model.md`                                                               |
| Versión                | 0.1                                                                                                       |
| Estado                 | Borrador inicial                                                                                          |
| Fecha                  | 2026-07-20                                                                                                |
| Documento base         | `docs/specs/014-voting-basic/spec.md`                                                                     |
| Plan técnico           | `docs/specs/014-voting-basic/plan.md`                                                                     |
| Base de datos          | PostgreSQL                                                                                                |
| ORM                    | Prisma                                                                                                    |
| Estrategia multitenant | Shared database + shared schema + `tenant_id`                                                             |
| Naturaleza del módulo  | Tenant-scoped / Eligibility-aware / Privacy-mode aware / Duplicate-safe / Tally-deterministic / Auditable |
| API Style              | REST                                                                                                      |

---

## 2. Propósito

Este documento define el modelo de datos del módulo `014-voting-basic`.

El objetivo es modelar sesiones de votación, preguntas, opciones, votantes elegibles, votos emitidos, resultados agregados, resultados generales y vínculos con resoluciones de reuniones, garantizando:

* aislamiento por tenant;
* asociación opcional con reuniones;
* control de estado;
* definición de preguntas;
* definición de opciones;
* definición y resolución de elegibles;
* emisión de voto propio;
* prevención de voto duplicado;
* soporte de voto identificado;
* soporte de `secretBasic` sin anonimato criptográfico fuerte;
* cálculo determinístico de resultados;
* publicación controlada;
* vínculo explícito con resoluciones;
* auditoría;
* no exposición pública;
* preparación para voto ponderado, reglas avanzadas y certificaciones futuras.

Regla central:

```text id="e29g9s"
Toda votación, pregunta, opción, elegible, voto, resultado y vínculo con resolución debe ser tenant-scoped, eligibility-aware, duplicate-safe, privacy-mode aware, tally-deterministic, non-public y auditable.
```

---

## 3. Decisión principal del modelo

Para MVP se crearán ocho tablas principales:

```text id="m6ofst"
voting_sessions
ballot_questions
ballot_options
eligible_voters
vote_casts
voting_tallies
voting_results
voting_resolution_links
```

Estas tablas permiten cubrir:

* sesiones de votación;
* votaciones asociadas a reuniones;
* preguntas simples;
* opciones de respuesta;
* votantes elegibles;
* voto por usuario/persona/unidad/propietario/residente/representante;
* voto de opción única;
* voto múltiple limitado;
* voto sí/no/abstención;
* prevención de duplicados;
* cálculo de resultados;
* publicación controlada;
* vínculo con resoluciones;
* auditoría;
* evolución futura.

---

## 4. Tablas nuevas MVP

```text id="fww3ay"
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

## 5. Tablas externas relacionadas

El módulo se relaciona con tablas existentes:

```text id="th57qd"
tenants
user_profiles
persons
property_units
property_ownerships
residencies
tenant_roles / roles según 002-users-roles
meetings
meeting_participants
meeting_attendance
meeting_proxies
meeting_resolutions
audit_logs
notifications
```

| Tabla externa            | Spec origen                        | Uso en Voting Basic                                        |
| ------------------------ | ---------------------------------- | ---------------------------------------------------------- |
| `tenants`                | `001-tenants`                      | Tenant propietario de la votación                          |
| `user_profiles`          | `002-users-roles`                  | Usuarios creadores, votantes, administradores y auditores  |
| `roles` / `tenant_roles` | `002-users-roles`                  | Elegibilidad por roles                                     |
| `persons`                | `003-residents-properties`         | Votantes persona, propietarios, residentes, representantes |
| `property_units`         | `003-residents-properties`         | Voto por unidad habitacional                               |
| `property_ownerships`    | `003-residents-properties`         | Elegibilidad por propietario                               |
| `residencies`            | `003-residents-properties`         | Elegibilidad por residente                                 |
| `meetings`               | `013-meetings-attendance`          | Votaciones asociadas a reunión                             |
| `meeting_participants`   | `013-meetings-attendance`          | Resolución de elegibles por participantes                  |
| `meeting_attendance`     | `013-meetings-attendance`          | Resolución de elegibles por asistentes                     |
| `meeting_proxies`        | `013-meetings-attendance`          | Voto por representación aprobada                           |
| `meeting_resolutions`    | `013-meetings-attendance`          | Vínculo de resultado con resolución                        |
| `audit_logs`             | `007-audit`                        | Auditoría de operaciones críticas                          |
| `notifications`          | `012-communications-notifications` | Notificaciones derivadas de votaciones                     |

---

# 6. Entidad `VotingSession`

## 6.1. Propósito

Representa una sesión de votación interna de un tenant.

Puede estar asociada a una reunión o, si la política del tenant lo permite, ser independiente.

Ejemplos:

```text id="m45x2y"
Votación de aprobación de presupuesto anual
Votación de mantenimiento extraordinario
Votación de elección de directiva
Votación de aprobación de reglamento interno
Votación informativa de preferencia comunitaria
```

---

## 6.2. Tabla

```text id="sb02pr"
voting_sessions
```

---

## 6.3. Campos

```text id="y3hsx8"
VotingSession
├── id
├── tenantId
├── meetingId
├── title
├── description
├── status
├── visibility
├── votingMode
├── privacyMode
├── eligibilityMode
├── votingRule
├── opensAt
├── closesAt
├── openedAt
├── closedAt
├── cancelledAt
├── cancelledBy
├── cancellationReason
├── createdBy
├── updatedBy
├── openedBy
├── closedBy
├── archivedBy
├── resultsCalculatedAt
├── resultsPublishedAt
├── metadata
├── createdAt
├── updatedAt
└── archivedAt
```

---

## 6.4. Reglas

* `tenantId` obligatorio.
* `meetingId` opcional.
* Si `meetingId` existe, debe pertenecer al mismo tenant.
* `title` obligatorio.
* `status` obligatorio.
* Estado inicial: `draft`.
* `visibility` obligatoria.
* `votingMode` obligatorio.
* `privacyMode` obligatorio.
* `eligibilityMode` obligatorio.
* `votingRule` obligatorio.
* `opensAt`, si existe, debe ser anterior a `closesAt`.
* `openedAt` se registra al abrir votación.
* `closedAt` se registra al cerrar votación.
* `cancelledAt`, `cancelledBy` y `cancellationReason` se registran al cancelar.
* `resultsCalculatedAt` se registra al calcular resultados.
* `resultsPublishedAt` se registra al publicar resultados.
* `metadata` debe ser sanitizada.
* No se permite eliminación física ordinaria.
* No se expone públicamente.

---

# 7. Entidad `BallotQuestion`

## 7.1. Propósito

Representa una pregunta o asunto sometido a votación dentro de una sesión.

Ejemplos:

```text id="vpt7su"
¿Aprueba el presupuesto anual 2026?
¿Aprueba el mantenimiento extraordinario de áreas comunales?
Elija al representante principal de la directiva.
Seleccione hasta dos prioridades de mantenimiento.
```

---

## 7.2. Tabla

```text id="yfly6m"
ballot_questions
```

---

## 7.3. Campos

```text id="zikp9t"
BallotQuestion
├── id
├── tenantId
├── votingSessionId
├── order
├── title
├── description
├── questionType
├── maxSelections
├── minSelections
├── allowAbstention
├── status
├── createdAt
├── updatedAt
└── archivedAt
```

---

## 7.4. Reglas

* `tenantId` obligatorio.
* `votingSessionId` obligatorio.
* `votingSessionId` debe pertenecer al mismo tenant.
* `order` obligatorio y único por sesión activa.
* `title` obligatorio.
* `questionType` obligatorio.
* Si `questionType = singleChoice`, `minSelections = 1` y `maxSelections = 1`.
* Si `questionType = yesNoAbstain`, deben existir opciones `yes`, `no` y opcionalmente `abstain`.
* Si `questionType = multipleChoice`, `maxSelections >= minSelections`.
* `allowAbstention` define si abstención es válida.
* `status` obligatorio.
* Preguntas no se modifican una vez que la sesión está `open`, salvo campos seguros definidos.
* No se permite eliminación física ordinaria.

---

# 8. Entidad `BallotOption`

## 8.1. Propósito

Representa una opción seleccionable dentro de una pregunta.

Ejemplos:

```text id="h5hqac"
Sí
No
Abstención
Opción A
Opción B
Candidato 1
Candidato 2
```

---

## 8.2. Tabla

```text id="kvk6je"
ballot_options
```

---

## 8.3. Campos

```text id="q056tt"
BallotOption
├── id
├── tenantId
├── ballotQuestionId
├── order
├── label
├── description
├── optionType
├── isAbstention
├── createdAt
├── updatedAt
└── archivedAt
```

---

## 8.4. Reglas

* `tenantId` obligatorio.
* `ballotQuestionId` obligatorio.
* `ballotQuestionId` debe pertenecer al mismo tenant.
* `order` obligatorio y único por pregunta activa.
* `label` obligatorio.
* `optionType` obligatorio.
* `isAbstention = true` solo si representa abstención.
* No debe existir más de una opción `isAbstention = true` por pregunta.
* No debe existir etiqueta duplicada por pregunta activa.
* No se permite eliminar físicamente en operación ordinaria.

---

# 9. Entidad `EligibleVoter`

## 9.1. Propósito

Representa un sujeto autorizado a votar en una sesión.

Puede representar:

```text id="a62n5c"
usuario
persona
unidad habitacional
propietario
residente
rol
representante por proxy aprobado
```

---

## 9.2. Tabla

```text id="ox01qb"
eligible_voters
```

---

## 9.3. Campos

```text id="isplyo"
EligibleVoter
├── id
├── tenantId
├── votingSessionId
├── voterType
├── userId
├── personId
├── propertyUnitId
├── roleId
├── proxyId
├── eligibilitySource
├── weight
├── status
├── resolvedAt
├── createdAt
└── archivedAt
```

---

## 9.4. Reglas

* `tenantId` obligatorio.
* `votingSessionId` obligatorio.
* `votingSessionId` debe pertenecer al mismo tenant.
* `voterType` obligatorio.
* Si `voterType = user`, `userId` obligatorio.
* Si `voterType = person`, `personId` obligatorio.
* Si `voterType = propertyUnit`, `propertyUnitId` obligatorio.
* Si `voterType = owner`, `personId` y/o `propertyUnitId` obligatorios según política.
* Si `voterType = resident`, `personId` y/o `propertyUnitId` obligatorios según política.
* Si `voterType = role`, `roleId` obligatorio.
* Si `voterType = proxyRepresentative`, `proxyId` obligatorio.
* Si `proxyId` existe, debe pertenecer a la reunión vinculada y estar aprobado.
* `eligibilitySource` obligatorio.
* `weight` en MVP será `1.00` por defecto.
* `weight` se conserva para evolución futura.
* No se permite duplicar elegible activo por sesión y sujeto lógico.
* No se elimina físicamente en operación ordinaria.

---

# 10. Entidad `VoteCast`

## 10.1. Propósito

Representa un voto emitido por un elegible en una pregunta.

---

## 10.2. Tabla

```text id="qxluqi"
vote_casts
```

---

## 10.3. Campos

```text id="jchhq3"
VoteCast
├── id
├── tenantId
├── votingSessionId
├── ballotQuestionId
├── eligibleVoterId
├── voterUserId
├── voterPersonId
├── voterPropertyUnitId
├── selectedOptionId
├── selectedOptionIds
├── voteHash
├── status
├── castAt
├── cancelledAt
├── cancelledBy
├── cancellationReason
├── metadata
├── createdAt
└── archivedAt
```

---

## 10.4. Reglas

* `tenantId` obligatorio.
* `votingSessionId` obligatorio.
* `ballotQuestionId` obligatorio.
* `eligibleVoterId` obligatorio.
* Todas las referencias deben pertenecer al mismo tenant.
* `votingSession.status` debe ser `open`.
* `ballotQuestion.status` debe ser `active`.
* `eligibleVoter.status` debe ser `eligible`.
* No debe existir voto activo previo para la misma combinación:

  * `tenantId`;
  * `votingSessionId`;
  * `ballotQuestionId`;
  * `eligibleVoterId`.
* Para `singleChoice`, se usa `selectedOptionId`.
* Para `yesNoAbstain`, se usa `selectedOptionId`.
* Para `multipleChoice`, se usa `selectedOptionIds`.
* `selectedOptionIds` debe validarse contra opciones de la misma pregunta.
* `voteHash` queda reservado para evolución futura.
* `status` inicial: `cast`.
* `castAt` obligatorio.
* `cancelledAt`, `cancelledBy`, `cancellationReason` obligatorios al anular.
* En `secretBasic`, no exponer `selectedOptionId` en DTOs administrativos estándar, logs ni auditoría.
* No se elimina físicamente en operación ordinaria.

---

# 11. Entidad `VotingTally`

## 11.1. Propósito

Representa el conteo agregado por pregunta y opción.

Una pregunta puede tener varios tallies, uno por opción.

---

## 11.2. Tabla

```text id="nu8qa5"
voting_tallies
```

---

## 11.3. Campos

```text id="s2jmdd"
VotingTally
├── id
├── tenantId
├── votingSessionId
├── ballotQuestionId
├── ballotOptionId
├── totalVotes
├── weightedTotal
├── percentage
├── calculatedAt
├── createdAt
└── archivedAt
```

---

## 11.4. Reglas

* `tenantId` obligatorio.
* `votingSessionId` obligatorio.
* `ballotQuestionId` obligatorio.
* `ballotOptionId` opcional en casos especiales, pero recomendado para opciones.
* Todas las referencias deben pertenecer al mismo tenant.
* `totalVotes` entero no negativo.
* `weightedTotal` decimal no negativo.
* `percentage` decimal entre `0.00` y `100.00`.
* `calculatedAt` obligatorio.
* Se recalcula desde votos válidos.
* No debe modificar votos.
* No se elimina físicamente en operación ordinaria.

---

# 12. Entidad `VotingResult`

## 12.1. Propósito

Representa el resultado general de una pregunta o sesión.

Permite saber si una propuesta pasó, falló, quedó empatada o fue informativa.

---

## 12.2. Tabla

```text id="h4ds1n"
voting_results
```

---

## 12.3. Campos

```text id="ap2vps"
VotingResult
├── id
├── tenantId
├── votingSessionId
├── ballotQuestionId
├── resultStatus
├── winningOptionId
├── totalEligible
├── totalVotes
├── totalAbstentions
├── participationPercentage
├── requiredThreshold
├── thresholdMet
├── calculatedAt
├── publishedAt
├── createdAt
└── archivedAt
```

---

## 12.4. Reglas

* `tenantId` obligatorio.
* `votingSessionId` obligatorio.
* `ballotQuestionId` obligatorio.
* Todas las referencias deben pertenecer al mismo tenant.
* `winningOptionId` opcional.
* `totalEligible` entero no negativo.
* `totalVotes` entero no negativo.
* `totalAbstentions` entero no negativo.
* `participationPercentage` decimal entre `0.00` y `100.00`.
* `requiredThreshold` decimal si aplica.
* `thresholdMet` boolean si aplica.
* `calculatedAt` obligatorio.
* `publishedAt` se registra al publicar.
* No se expone públicamente.
* No ejecuta acciones automáticas.

---

# 13. Entidad `VotingResolutionLink`

## 13.1. Propósito

Vincula un resultado de votación con una resolución de reunión.

No crea ni aprueba la resolución automáticamente. Solo registra la relación explícita.

---

## 13.2. Tabla

```text id="in6hnw"
voting_resolution_links
```

---

## 13.3. Campos

```text id="cfeaa0"
VotingResolutionLink
├── id
├── tenantId
├── votingSessionId
├── ballotQuestionId
├── votingResultId
├── meetingResolutionId
├── linkedBy
├── linkedAt
├── createdAt
└── archivedAt
```

---

## 13.4. Reglas

* `tenantId` obligatorio.
* `votingSessionId` obligatorio.
* `ballotQuestionId` obligatorio.
* `votingResultId` obligatorio.
* `meetingResolutionId` obligatorio.
* Todas las referencias deben pertenecer al mismo tenant.
* Si la votación está asociada a reunión, la resolución debe pertenecer a la misma reunión.
* `linkedBy` obligatorio.
* `linkedAt` obligatorio.
* No ejecuta acciones automáticas.
* No se elimina físicamente en operación ordinaria.

---

# 14. Enums

## 14.1. VotingSessionStatus

```text id="lmn3hz"
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

## 14.2. VotingVisibility

```text id="qwufj0"
administrative
meetingParticipants
owners
residents
tenant
mixed
```

---

## 14.3. VotingMode

```text id="sqks0o"
singleQuestion
multiQuestion
```

---

## 14.4. VotingPrivacyMode

```text id="byopli"
identified
secretBasic
```

Diferidos:

```text id="q0o6nw"
cryptographicSecret
publicVerifiable
```

---

## 14.5. EligibilityMode

```text id="sjqrft"
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

## 14.6. VotingRule

```text id="a8ckdf"
informational
simpleMajority
absoluteMajority
plurality
unanimity
```

Diferidos:

```text id="kldvcc"
qualifiedMajority
weightedMajority
legalCustomRule
```

---

## 14.7. BallotQuestionType

```text id="fqbktt"
yesNoAbstain
singleChoice
multipleChoice
```

Diferidos:

```text id="c9prfv"
ranking
openText
numeric
```

---

## 14.8. BallotQuestionStatus

```text id="dsivpf"
draft
active
closed
archived
```

---

## 14.9. BallotOptionType

```text id="vesf0i"
standard
yes
no
abstain
other
```

---

## 14.10. VoterType

```text id="chp7lr"
user
person
propertyUnit
owner
resident
role
proxyRepresentative
```

---

## 14.11. EligibilitySource

```text id="dljplp"
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

## 14.12. EligibleVoterStatus

```text id="w09qdx"
eligible
voted
excluded
cancelled
archived
```

---

## 14.13. VoteCastStatus

```text id="akt1kh"
cast
cancelled
superseded
archived
```

MVP:

```text id="hv490n"
superseded queda reservado para futura política de reemplazo de voto.
```

---

## 14.14. VotingResultStatus

```text id="nrzx5u"
pending
passed
failed
tie
informational
cancelled
archived
```

---

# 15. Modelo Prisma preliminar

## 15.1. Enums Prisma

```prisma id="pbq2pf"
enum VotingSessionStatus {
  DRAFT              @map("draft")
  SCHEDULED          @map("scheduled")
  OPEN               @map("open")
  CLOSED             @map("closed")
  RESULTS_CALCULATED @map("resultsCalculated")
  RESULTS_PUBLISHED  @map("resultsPublished")
  CANCELLED          @map("cancelled")
  ARCHIVED           @map("archived")

  @@map("voting_session_status")
}

enum VotingVisibility {
  ADMINISTRATIVE       @map("administrative")
  MEETING_PARTICIPANTS @map("meetingParticipants")
  OWNERS               @map("owners")
  RESIDENTS            @map("residents")
  TENANT               @map("tenant")
  MIXED                @map("mixed")

  @@map("voting_visibility")
}

enum VotingMode {
  SINGLE_QUESTION @map("singleQuestion")
  MULTI_QUESTION  @map("multiQuestion")

  @@map("voting_mode")
}

enum VotingPrivacyMode {
  IDENTIFIED  @map("identified")
  SECRET_BASIC @map("secretBasic")

  @@map("voting_privacy_mode")
}

enum EligibilityMode {
  MANUAL               @map("manual")
  MEETING_PARTICIPANTS @map("meetingParticipants")
  MEETING_ATTENDANCE   @map("meetingAttendance")
  OWNERS               @map("owners")
  RESIDENTS            @map("residents")
  PROPERTY_UNITS       @map("propertyUnits")
  ROLES                @map("roles")
  MIXED                @map("mixed")

  @@map("eligibility_mode")
}

enum VotingRule {
  INFORMATIONAL    @map("informational")
  SIMPLE_MAJORITY  @map("simpleMajority")
  ABSOLUTE_MAJORITY @map("absoluteMajority")
  PLURALITY        @map("plurality")
  UNANIMITY        @map("unanimity")

  @@map("voting_rule")
}

enum BallotQuestionType {
  YES_NO_ABSTAIN @map("yesNoAbstain")
  SINGLE_CHOICE  @map("singleChoice")
  MULTIPLE_CHOICE @map("multipleChoice")

  @@map("ballot_question_type")
}

enum BallotQuestionStatus {
  DRAFT    @map("draft")
  ACTIVE   @map("active")
  CLOSED   @map("closed")
  ARCHIVED @map("archived")

  @@map("ballot_question_status")
}

enum BallotOptionType {
  STANDARD @map("standard")
  YES      @map("yes")
  NO       @map("no")
  ABSTAIN  @map("abstain")
  OTHER    @map("other")

  @@map("ballot_option_type")
}

enum VoterType {
  USER                 @map("user")
  PERSON               @map("person")
  PROPERTY_UNIT        @map("propertyUnit")
  OWNER                @map("owner")
  RESIDENT             @map("resident")
  ROLE                 @map("role")
  PROXY_REPRESENTATIVE @map("proxyRepresentative")

  @@map("voter_type")
}

enum EligibilitySource {
  MANUAL              @map("manual")
  MEETING_PARTICIPANT @map("meetingParticipant")
  MEETING_ATTENDANCE  @map("meetingAttendance")
  OWNERSHIP           @map("ownership")
  RESIDENCY           @map("residency")
  ROLE                @map("role")
  PROXY               @map("proxy")
  SYSTEM              @map("system")

  @@map("eligibility_source")
}

enum EligibleVoterStatus {
  ELIGIBLE  @map("eligible")
  VOTED     @map("voted")
  EXCLUDED  @map("excluded")
  CANCELLED @map("cancelled")
  ARCHIVED  @map("archived")

  @@map("eligible_voter_status")
}

enum VoteCastStatus {
  CAST       @map("cast")
  CANCELLED  @map("cancelled")
  SUPERSEDED @map("superseded")
  ARCHIVED   @map("archived")

  @@map("vote_cast_status")
}

enum VotingResultStatus {
  PENDING       @map("pending")
  PASSED        @map("passed")
  FAILED        @map("failed")
  TIE           @map("tie")
  INFORMATIONAL @map("informational")
  CANCELLED     @map("cancelled")
  ARCHIVED      @map("archived")

  @@map("voting_result_status")
}
```

---

## 15.2. Modelo `VotingSession`

```prisma id="q0vuad"
model VotingSession {
  id                    String              @id @default(uuid())
  tenantId              String              @map("tenant_id")
  meetingId             String?             @map("meeting_id")

  title                 String
  description           String?

  status                VotingSessionStatus @default(DRAFT)
  visibility            VotingVisibility    @default(ADMINISTRATIVE)
  votingMode            VotingMode          @default(SINGLE_QUESTION) @map("voting_mode")
  privacyMode           VotingPrivacyMode   @default(IDENTIFIED) @map("privacy_mode")
  eligibilityMode       EligibilityMode     @default(MANUAL) @map("eligibility_mode")
  votingRule            VotingRule          @default(SIMPLE_MAJORITY) @map("voting_rule")

  opensAt               DateTime?           @map("opens_at")
  closesAt              DateTime?           @map("closes_at")
  openedAt              DateTime?           @map("opened_at")
  closedAt              DateTime?           @map("closed_at")

  cancelledAt           DateTime?           @map("cancelled_at")
  cancelledBy           String?             @map("cancelled_by")
  cancellationReason    String?             @map("cancellation_reason")

  createdBy             String?             @map("created_by")
  updatedBy             String?             @map("updated_by")
  openedBy              String?             @map("opened_by")
  closedBy              String?             @map("closed_by")
  archivedBy            String?             @map("archived_by")

  resultsCalculatedAt   DateTime?           @map("results_calculated_at")
  resultsPublishedAt    DateTime?           @map("results_published_at")

  metadata              Json?

  createdAt             DateTime            @default(now()) @map("created_at")
  updatedAt             DateTime            @updatedAt @map("updated_at")
  archivedAt            DateTime?           @map("archived_at")

  tenant                Tenant              @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  meeting               Meeting?            @relation(fields: [meetingId], references: [id], onDelete: Restrict)

  createdByUser         UserProfile?        @relation("VotingSessionCreatedBy", fields: [createdBy], references: [id], onDelete: Restrict)
  updatedByUser         UserProfile?        @relation("VotingSessionUpdatedBy", fields: [updatedBy], references: [id], onDelete: Restrict)
  openedByUser          UserProfile?        @relation("VotingSessionOpenedBy", fields: [openedBy], references: [id], onDelete: Restrict)
  closedByUser          UserProfile?        @relation("VotingSessionClosedBy", fields: [closedBy], references: [id], onDelete: Restrict)
  cancelledByUser       UserProfile?        @relation("VotingSessionCancelledBy", fields: [cancelledBy], references: [id], onDelete: Restrict)
  archivedByUser        UserProfile?        @relation("VotingSessionArchivedBy", fields: [archivedBy], references: [id], onDelete: Restrict)

  questions             BallotQuestion[]
  eligibleVoters        EligibleVoter[]
  voteCasts             VoteCast[]
  tallies               VotingTally[]
  results               VotingResult[]
  resolutionLinks       VotingResolutionLink[]

  @@index([tenantId])
  @@index([tenantId, meetingId])
  @@index([tenantId, status])
  @@index([tenantId, visibility])
  @@index([tenantId, privacyMode])
  @@index([tenantId, eligibilityMode])
  @@index([tenantId, votingRule])
  @@index([tenantId, opensAt])
  @@index([tenantId, closesAt])
  @@index([tenantId, archivedAt])
  @@map("voting_sessions")
}
```

---

## 15.3. Modelo `BallotQuestion`

```prisma id="f41x4k"
model BallotQuestion {
  id                String               @id @default(uuid())
  tenantId          String               @map("tenant_id")
  votingSessionId   String               @map("voting_session_id")

  order             Int
  title             String
  description       String?

  questionType      BallotQuestionType   @map("question_type")
  maxSelections     Int?                 @map("max_selections")
  minSelections     Int?                 @map("min_selections")
  allowAbstention   Boolean              @default(false) @map("allow_abstention")
  status            BallotQuestionStatus @default(DRAFT)

  createdAt         DateTime             @default(now()) @map("created_at")
  updatedAt         DateTime             @updatedAt @map("updated_at")
  archivedAt        DateTime?            @map("archived_at")

  tenant            Tenant               @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  votingSession     VotingSession        @relation(fields: [votingSessionId], references: [id], onDelete: Restrict)

  options           BallotOption[]
  voteCasts         VoteCast[]
  tallies           VotingTally[]
  results           VotingResult[]
  resolutionLinks   VotingResolutionLink[]

  @@unique([tenantId, votingSessionId, order])
  @@index([tenantId])
  @@index([tenantId, votingSessionId])
  @@index([tenantId, questionType])
  @@index([tenantId, status])
  @@index([tenantId, archivedAt])
  @@map("ballot_questions")
}
```

---

## 15.4. Modelo `BallotOption`

```prisma id="xj2su4"
model BallotOption {
  id                String            @id @default(uuid())
  tenantId          String            @map("tenant_id")
  ballotQuestionId  String            @map("ballot_question_id")

  order             Int
  label             String
  description       String?
  optionType        BallotOptionType  @default(STANDARD) @map("option_type")
  isAbstention      Boolean           @default(false) @map("is_abstention")

  createdAt         DateTime          @default(now()) @map("created_at")
  updatedAt         DateTime          @updatedAt @map("updated_at")
  archivedAt        DateTime?         @map("archived_at")

  tenant            Tenant            @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  ballotQuestion    BallotQuestion    @relation(fields: [ballotQuestionId], references: [id], onDelete: Restrict)

  singleVoteCasts   VoteCast[]        @relation("VoteCastSelectedOption")
  tallies           VotingTally[]
  winningResults    VotingResult[]    @relation("VotingResultWinningOption")

  @@unique([tenantId, ballotQuestionId, order])
  @@index([tenantId])
  @@index([tenantId, ballotQuestionId])
  @@index([tenantId, optionType])
  @@index([tenantId, isAbstention])
  @@index([tenantId, archivedAt])
  @@map("ballot_options")
}
```

Nota:

```text id="a1hf7f"
La unicidad de label por pregunta activa requiere índice parcial raw si se desea impedir duplicados case-insensitive en PostgreSQL.
```

---

## 15.5. Modelo `EligibleVoter`

```prisma id="mwxovc"
model EligibleVoter {
  id                String              @id @default(uuid())
  tenantId          String              @map("tenant_id")
  votingSessionId   String              @map("voting_session_id")

  voterType         VoterType           @map("voter_type")
  userId            String?             @map("user_id")
  personId          String?             @map("person_id")
  propertyUnitId    String?             @map("property_unit_id")
  roleId            String?             @map("role_id")
  proxyId           String?             @map("proxy_id")

  eligibilitySource EligibilitySource   @map("eligibility_source")
  weight            Decimal             @default(1.00) @db.Decimal(12, 2)
  status            EligibleVoterStatus @default(ELIGIBLE)

  resolvedAt        DateTime?           @map("resolved_at")
  createdAt         DateTime            @default(now()) @map("created_at")
  archivedAt        DateTime?           @map("archived_at")

  tenant            Tenant              @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  votingSession     VotingSession       @relation(fields: [votingSessionId], references: [id], onDelete: Restrict)

  user              UserProfile?        @relation("EligibleVoterUser", fields: [userId], references: [id], onDelete: Restrict)
  person            Person?             @relation("EligibleVoterPerson", fields: [personId], references: [id], onDelete: Restrict)
  propertyUnit      PropertyUnit?       @relation("EligibleVoterPropertyUnit", fields: [propertyUnitId], references: [id], onDelete: Restrict)
  proxy             MeetingProxy?       @relation(fields: [proxyId], references: [id], onDelete: Restrict)

  voteCasts         VoteCast[]

  @@index([tenantId])
  @@index([tenantId, votingSessionId])
  @@index([tenantId, voterType])
  @@index([tenantId, userId])
  @@index([tenantId, personId])
  @@index([tenantId, propertyUnitId])
  @@index([tenantId, roleId])
  @@index([tenantId, proxyId])
  @@index([tenantId, status])
  @@index([tenantId, eligibilitySource])
  @@index([tenantId, archivedAt])
  @@map("eligible_voters")
}
```

Nota:

```text id="mtr52p"
La relación con roleId debe ajustarse al nombre real del modelo de roles definido en 002-users-roles.
```

---

## 15.6. Modelo `VoteCast`

```prisma id="ni91cr"
model VoteCast {
  id                   String         @id @default(uuid())
  tenantId             String         @map("tenant_id")
  votingSessionId      String         @map("voting_session_id")
  ballotQuestionId     String         @map("ballot_question_id")
  eligibleVoterId      String         @map("eligible_voter_id")

  voterUserId          String?        @map("voter_user_id")
  voterPersonId        String?        @map("voter_person_id")
  voterPropertyUnitId  String?        @map("voter_property_unit_id")

  selectedOptionId     String?        @map("selected_option_id")
  selectedOptionIds    Json?          @map("selected_option_ids")
  voteHash             String?        @map("vote_hash")

  status               VoteCastStatus @default(CAST)
  castAt               DateTime       @map("cast_at")

  cancelledAt          DateTime?      @map("cancelled_at")
  cancelledBy          String?        @map("cancelled_by")
  cancellationReason   String?        @map("cancellation_reason")

  metadata             Json?

  createdAt            DateTime       @default(now()) @map("created_at")
  archivedAt           DateTime?      @map("archived_at")

  tenant               Tenant         @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  votingSession        VotingSession  @relation(fields: [votingSessionId], references: [id], onDelete: Restrict)
  ballotQuestion       BallotQuestion @relation(fields: [ballotQuestionId], references: [id], onDelete: Restrict)
  eligibleVoter        EligibleVoter  @relation(fields: [eligibleVoterId], references: [id], onDelete: Restrict)

  voterUser            UserProfile?   @relation("VoteCastVoterUser", fields: [voterUserId], references: [id], onDelete: Restrict)
  voterPerson          Person?        @relation("VoteCastVoterPerson", fields: [voterPersonId], references: [id], onDelete: Restrict)
  voterPropertyUnit    PropertyUnit?  @relation("VoteCastVoterPropertyUnit", fields: [voterPropertyUnitId], references: [id], onDelete: Restrict)
  selectedOption       BallotOption?  @relation("VoteCastSelectedOption", fields: [selectedOptionId], references: [id], onDelete: Restrict)
  cancelledByUser      UserProfile?   @relation("VoteCastCancelledBy", fields: [cancelledBy], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([tenantId, votingSessionId])
  @@index([tenantId, ballotQuestionId])
  @@index([tenantId, eligibleVoterId])
  @@index([tenantId, voterUserId])
  @@index([tenantId, voterPersonId])
  @@index([tenantId, voterPropertyUnitId])
  @@index([tenantId, selectedOptionId])
  @@index([tenantId, status])
  @@index([tenantId, castAt])
  @@index([tenantId, archivedAt])
  @@map("vote_casts")
}
```

Nota de privacidad:

```text id="fw81xp"
Aunque selectedOptionId se persista para calcular resultados, en privacyMode = secretBasic no debe exponerse en DTOs administrativos estándar, logs, métricas ni audit metadata.
```

---

## 15.7. Modelo `VotingTally`

```prisma id="k49vaj"
model VotingTally {
  id                String         @id @default(uuid())
  tenantId          String         @map("tenant_id")
  votingSessionId   String         @map("voting_session_id")
  ballotQuestionId  String         @map("ballot_question_id")
  ballotOptionId    String?        @map("ballot_option_id")

  totalVotes        Int            @default(0) @map("total_votes")
  weightedTotal     Decimal        @default(0.00) @db.Decimal(12, 2) @map("weighted_total")
  percentage        Decimal        @default(0.00) @db.Decimal(5, 2)

  calculatedAt      DateTime       @map("calculated_at")
  createdAt         DateTime       @default(now()) @map("created_at")
  archivedAt        DateTime?      @map("archived_at")

  tenant            Tenant         @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  votingSession     VotingSession  @relation(fields: [votingSessionId], references: [id], onDelete: Restrict)
  ballotQuestion    BallotQuestion @relation(fields: [ballotQuestionId], references: [id], onDelete: Restrict)
  ballotOption      BallotOption?  @relation(fields: [ballotOptionId], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([tenantId, votingSessionId])
  @@index([tenantId, ballotQuestionId])
  @@index([tenantId, ballotOptionId])
  @@index([tenantId, calculatedAt])
  @@index([tenantId, archivedAt])
  @@map("voting_tallies")
}
```

---

## 15.8. Modelo `VotingResult`

```prisma id="w6pon7"
model VotingResult {
  id                       String             @id @default(uuid())
  tenantId                 String             @map("tenant_id")
  votingSessionId          String             @map("voting_session_id")
  ballotQuestionId         String             @map("ballot_question_id")

  resultStatus             VotingResultStatus @default(PENDING) @map("result_status")
  winningOptionId          String?            @map("winning_option_id")

  totalEligible            Int                @default(0) @map("total_eligible")
  totalVotes               Int                @default(0) @map("total_votes")
  totalAbstentions         Int                @default(0) @map("total_abstentions")
  participationPercentage  Decimal            @default(0.00) @db.Decimal(5, 2) @map("participation_percentage")
  requiredThreshold        Decimal?           @db.Decimal(5, 2) @map("required_threshold")
  thresholdMet             Boolean?           @map("threshold_met")

  calculatedAt             DateTime           @map("calculated_at")
  publishedAt              DateTime?          @map("published_at")

  createdAt                DateTime           @default(now()) @map("created_at")
  archivedAt               DateTime?          @map("archived_at")

  tenant                   Tenant             @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  votingSession            VotingSession      @relation(fields: [votingSessionId], references: [id], onDelete: Restrict)
  ballotQuestion           BallotQuestion     @relation(fields: [ballotQuestionId], references: [id], onDelete: Restrict)
  winningOption            BallotOption?      @relation("VotingResultWinningOption", fields: [winningOptionId], references: [id], onDelete: Restrict)

  resolutionLinks          VotingResolutionLink[]

  @@index([tenantId])
  @@index([tenantId, votingSessionId])
  @@index([tenantId, ballotQuestionId])
  @@index([tenantId, resultStatus])
  @@index([tenantId, winningOptionId])
  @@index([tenantId, calculatedAt])
  @@index([tenantId, publishedAt])
  @@index([tenantId, archivedAt])
  @@map("voting_results")
}
```

---

## 15.9. Modelo `VotingResolutionLink`

```prisma id="ejqivj"
model VotingResolutionLink {
  id                  String            @id @default(uuid())
  tenantId            String            @map("tenant_id")
  votingSessionId     String            @map("voting_session_id")
  ballotQuestionId    String            @map("ballot_question_id")
  votingResultId      String            @map("voting_result_id")
  meetingResolutionId String            @map("meeting_resolution_id")

  linkedBy            String            @map("linked_by")
  linkedAt            DateTime          @map("linked_at")

  createdAt           DateTime          @default(now()) @map("created_at")
  archivedAt          DateTime?         @map("archived_at")

  tenant              Tenant            @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  votingSession       VotingSession     @relation(fields: [votingSessionId], references: [id], onDelete: Restrict)
  ballotQuestion      BallotQuestion    @relation(fields: [ballotQuestionId], references: [id], onDelete: Restrict)
  votingResult        VotingResult      @relation(fields: [votingResultId], references: [id], onDelete: Restrict)
  meetingResolution   MeetingResolution @relation(fields: [meetingResolutionId], references: [id], onDelete: Restrict)
  linkedByUser        UserProfile       @relation("VotingResolutionLinkedBy", fields: [linkedBy], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([tenantId, votingSessionId])
  @@index([tenantId, ballotQuestionId])
  @@index([tenantId, votingResultId])
  @@index([tenantId, meetingResolutionId])
  @@index([tenantId, linkedAt])
  @@index([tenantId, archivedAt])
  @@map("voting_resolution_links")
}
```

---

# 16. Relaciones requeridas en modelos existentes

## 16.1. Tenant

```prisma id="l43tm7"
model Tenant {
  // campos existentes...

  votingSessions        VotingSession[]
  ballotQuestions       BallotQuestion[]
  ballotOptions         BallotOption[]
  eligibleVoters        EligibleVoter[]
  voteCasts             VoteCast[]
  votingTallies         VotingTally[]
  votingResults         VotingResult[]
  votingResolutionLinks VotingResolutionLink[]
}
```

---

## 16.2. UserProfile

```prisma id="xsdz51"
model UserProfile {
  // campos existentes...

  votingSessionsCreated    VotingSession[] @relation("VotingSessionCreatedBy")
  votingSessionsUpdated    VotingSession[] @relation("VotingSessionUpdatedBy")
  votingSessionsOpened     VotingSession[] @relation("VotingSessionOpenedBy")
  votingSessionsClosed     VotingSession[] @relation("VotingSessionClosedBy")
  votingSessionsCancelled  VotingSession[] @relation("VotingSessionCancelledBy")
  votingSessionsArchived   VotingSession[] @relation("VotingSessionArchivedBy")

  eligibleVoters           EligibleVoter[]  @relation("EligibleVoterUser")

  voteCastsAsUser          VoteCast[]       @relation("VoteCastVoterUser")
  voteCastsCancelled       VoteCast[]       @relation("VoteCastCancelledBy")

  votingResolutionLinks    VotingResolutionLink[] @relation("VotingResolutionLinkedBy")
}
```

---

## 16.3. Person

```prisma id="py0kzv"
model Person {
  // campos existentes...

  eligibleVoters      EligibleVoter[] @relation("EligibleVoterPerson")
  voteCastsAsPerson   VoteCast[]      @relation("VoteCastVoterPerson")
}
```

---

## 16.4. PropertyUnit

```prisma id="b1xsdm"
model PropertyUnit {
  // campos existentes...

  eligibleVoters           EligibleVoter[] @relation("EligibleVoterPropertyUnit")
  voteCastsAsPropertyUnit  VoteCast[]      @relation("VoteCastVoterPropertyUnit")
}
```

---

## 16.5. Meeting

```prisma id="ufhkps"
model Meeting {
  // campos existentes...

  votingSessions VotingSession[]
}
```

---

## 16.6. MeetingProxy

```prisma id="c77iki"
model MeetingProxy {
  // campos existentes...

  eligibleVoters EligibleVoter[]
}
```

---

## 16.7. MeetingResolution

```prisma id="y9vf3m"
model MeetingResolution {
  // campos existentes...

  votingResolutionLinks VotingResolutionLink[]
}
```

---

# 17. Constraints recomendadas

## 17.1. `voting_sessions`

```text id="a7h8v1"
tenant_id NOT NULL
title NOT NULL
status NOT NULL
visibility NOT NULL
voting_mode NOT NULL
privacy_mode NOT NULL
eligibility_mode NOT NULL
voting_rule NOT NULL
opens_at < closes_at si ambos existen
cancellation_reason requerido al cancelar
meeting_id debe pertenecer al mismo tenant
```

Reglas de servicio:

```text id="t5e0iw"
status = cancelled requiere cancelled_at, cancelled_by, cancellation_reason
status = open requiere opened_at, opened_by
status = closed requiere closed_at, closed_by
resultsCalculatedAt solo por VotingResultService
resultsPublishedAt solo por VotingResultService
```

---

## 17.2. `ballot_questions`

```text id="d61dng"
tenant_id NOT NULL
voting_session_id NOT NULL
order NOT NULL
title NOT NULL
question_type NOT NULL
status NOT NULL
UNIQUE (tenant_id, voting_session_id, order)
```

Reglas de servicio:

```text id="d560ii"
voting_session_id debe pertenecer al tenant
singleChoice requiere minSelections=1 y maxSelections=1
multipleChoice requiere maxSelections >= minSelections
yesNoAbstain requiere opciones válidas
no editar preguntas en sesión open salvo política explícita
```

---

## 17.3. `ballot_options`

```text id="yyx8rj"
tenant_id NOT NULL
ballot_question_id NOT NULL
order NOT NULL
label NOT NULL
option_type NOT NULL
UNIQUE (tenant_id, ballot_question_id, order)
```

Reglas de servicio:

```text id="v6eiic"
ballot_question_id debe pertenecer al tenant
label no duplicada por pregunta activa
máximo una abstención por pregunta
optionType debe ser coherente con questionType
```

---

## 17.4. `eligible_voters`

```text id="pnfuzm"
tenant_id NOT NULL
voting_session_id NOT NULL
voter_type NOT NULL
eligibility_source NOT NULL
weight NOT NULL DEFAULT 1.00
status NOT NULL
weight >= 0
```

Reglas de servicio:

```text id="fo7pgs"
voterType=user requiere userId
voterType=person requiere personId
voterType=propertyUnit requiere propertyUnitId
voterType=owner requiere personId/propertyUnitId según política
voterType=resident requiere personId/propertyUnitId según política
voterType=role requiere roleId
voterType=proxyRepresentative requiere proxyId
todas las referencias deben pertenecer al tenant
proxy debe estar approved
no duplicar elegible activo por sujeto lógico
```

---

## 17.5. `vote_casts`

```text id="ww9c2h"
tenant_id NOT NULL
voting_session_id NOT NULL
ballot_question_id NOT NULL
eligible_voter_id NOT NULL
status NOT NULL
cast_at NOT NULL
```

Reglas de servicio:

```text id="tfuyal"
voting_session_id debe pertenecer al tenant
ballot_question_id debe pertenecer a la sesión y tenant
eligible_voter_id debe pertenecer a la sesión y tenant
selected_option_id debe pertenecer a la pregunta y tenant
selected_option_ids debe contener solo opciones de la pregunta y tenant
no voto duplicado activo por pregunta/elegible
status=cancelled requiere cancelled_at, cancelled_by, cancellation_reason
secretBasic no expone selectedOptionId en DTOs/logs/audit
```

---

## 17.6. `voting_tallies`

```text id="rvfs5r"
tenant_id NOT NULL
voting_session_id NOT NULL
ballot_question_id NOT NULL
total_votes >= 0
weighted_total >= 0
percentage >= 0
percentage <= 100
calculated_at NOT NULL
```

Reglas de servicio:

```text id="pkpnco"
se calcula desde vote_casts status=cast
no modifica votos
no modifica elegibles
no modifica opciones
```

---

## 17.7. `voting_results`

```text id="zcm8nf"
tenant_id NOT NULL
voting_session_id NOT NULL
ballot_question_id NOT NULL
result_status NOT NULL
total_eligible >= 0
total_votes >= 0
total_abstentions >= 0
participation_percentage >= 0
participation_percentage <= 100
required_threshold >= 0 si no es null
required_threshold <= 100 si no es null
calculated_at NOT NULL
```

Reglas de servicio:

```text id="z6iwwu"
winning_option_id debe pertenecer a la pregunta si existe
published_at solo al publicar
no publica resultados sin cálculo
no expone identidades en secretBasic
```

---

## 17.8. `voting_resolution_links`

```text id="bq2gtr"
tenant_id NOT NULL
voting_session_id NOT NULL
ballot_question_id NOT NULL
voting_result_id NOT NULL
meeting_resolution_id NOT NULL
linked_by NOT NULL
linked_at NOT NULL
```

Reglas de servicio:

```text id="q7ky9h"
voting_result_id debe pertenecer al tenant
meeting_resolution_id debe pertenecer al tenant
si votingSession.meetingId existe, meetingResolution.meetingId debe coincidir
no ejecutar acción automática
```

---

# 18. Índices recomendados

## 18.1. `voting_sessions`

```text id="y2vwcw"
tenant_id
tenant_id + meeting_id
tenant_id + status
tenant_id + visibility
tenant_id + privacy_mode
tenant_id + eligibility_mode
tenant_id + voting_rule
tenant_id + opens_at
tenant_id + closes_at
tenant_id + archived_at
```

---

## 18.2. `ballot_questions`

```text id="hesiaf"
tenant_id
tenant_id + voting_session_id
tenant_id + voting_session_id + order unique
tenant_id + question_type
tenant_id + status
tenant_id + archived_at
```

---

## 18.3. `ballot_options`

```text id="qm68v1"
tenant_id
tenant_id + ballot_question_id
tenant_id + ballot_question_id + order unique
tenant_id + option_type
tenant_id + is_abstention
tenant_id + archived_at
```

---

## 18.4. `eligible_voters`

```text id="zqgbpr"
tenant_id
tenant_id + voting_session_id
tenant_id + voter_type
tenant_id + user_id
tenant_id + person_id
tenant_id + property_unit_id
tenant_id + role_id
tenant_id + proxy_id
tenant_id + status
tenant_id + eligibility_source
tenant_id + archived_at
```

---

## 18.5. `vote_casts`

```text id="ddj1h6"
tenant_id
tenant_id + voting_session_id
tenant_id + ballot_question_id
tenant_id + eligible_voter_id
tenant_id + voter_user_id
tenant_id + voter_person_id
tenant_id + voter_property_unit_id
tenant_id + selected_option_id
tenant_id + status
tenant_id + cast_at
tenant_id + archived_at
```

---

## 18.6. `voting_tallies`

```text id="e209z1"
tenant_id
tenant_id + voting_session_id
tenant_id + ballot_question_id
tenant_id + ballot_option_id
tenant_id + calculated_at
tenant_id + archived_at
```

---

## 18.7. `voting_results`

```text id="itfv9q"
tenant_id
tenant_id + voting_session_id
tenant_id + ballot_question_id
tenant_id + result_status
tenant_id + winning_option_id
tenant_id + calculated_at
tenant_id + published_at
tenant_id + archived_at
```

---

## 18.8. `voting_resolution_links`

```text id="mw20x2"
tenant_id
tenant_id + voting_session_id
tenant_id + ballot_question_id
tenant_id + voting_result_id
tenant_id + meeting_resolution_id
tenant_id + linked_at
tenant_id + archived_at
```

---

# 19. Índices parciales raw recomendados

## 19.1. Elegible único por usuario

```sql id="wtvhri"
CREATE UNIQUE INDEX eligible_voters_one_active_per_user
ON eligible_voters(tenant_id, voting_session_id, user_id)
WHERE user_id IS NOT NULL
  AND archived_at IS NULL
  AND status NOT IN ('excluded', 'cancelled', 'archived');
```

---

## 19.2. Elegible único por persona

```sql id="wfrxxq"
CREATE UNIQUE INDEX eligible_voters_one_active_per_person
ON eligible_voters(tenant_id, voting_session_id, person_id)
WHERE person_id IS NOT NULL
  AND archived_at IS NULL
  AND status NOT IN ('excluded', 'cancelled', 'archived');
```

---

## 19.3. Elegible único por unidad

```sql id="px6usf"
CREATE UNIQUE INDEX eligible_voters_one_active_per_property_unit
ON eligible_voters(tenant_id, voting_session_id, property_unit_id)
WHERE property_unit_id IS NOT NULL
  AND archived_at IS NULL
  AND status NOT IN ('excluded', 'cancelled', 'archived');
```

---

## 19.4. Elegible único por proxy

```sql id="a8jle0"
CREATE UNIQUE INDEX eligible_voters_one_active_per_proxy
ON eligible_voters(tenant_id, voting_session_id, proxy_id)
WHERE proxy_id IS NOT NULL
  AND archived_at IS NULL
  AND status NOT IN ('excluded', 'cancelled', 'archived');
```

---

## 19.5. Voto activo único por pregunta y elegible

```sql id="a1g517"
CREATE UNIQUE INDEX vote_casts_one_active_vote_per_question_eligible
ON vote_casts(tenant_id, voting_session_id, ballot_question_id, eligible_voter_id)
WHERE archived_at IS NULL
  AND status = 'cast';
```

---

## 19.6. Opción de abstención única por pregunta

```sql id="e92n7l"
CREATE UNIQUE INDEX ballot_options_one_abstention_per_question
ON ballot_options(tenant_id, ballot_question_id)
WHERE is_abstention = true
  AND archived_at IS NULL;
```

---

## 19.7. Label único por pregunta activa

Opcional, si se normaliza label en campo adicional o índice funcional:

```sql id="shq3i6"
CREATE UNIQUE INDEX ballot_options_unique_label_per_question
ON ballot_options(tenant_id, ballot_question_id, lower(label))
WHERE archived_at IS NULL;
```

---

# 20. Reglas de multitenancy

Todas las tablas nuevas tienen `tenant_id`.

Regla obligatoria:

```text id="w3lwuj"
Toda consulta tenant-scoped debe filtrar por tenant_id.
```

No se acepta:

```text id="ak3u6y"
buscar votingSession solo por votingSessionId
buscar ballotQuestion solo por questionId
buscar ballotOption solo por optionId
buscar eligibleVoter solo por eligibleVoterId
buscar voteCast solo por voteCastId
buscar votingResult solo por resultId
buscar votingResolutionLink solo por id
usar meetingId de otro tenant
usar meetingResolutionId de otro tenant
usar userId de otro tenant
usar personId de otro tenant
usar propertyUnitId de otro tenant
usar proxyId de otro tenant
```

Patrón requerido:

```typescript id="uy6te0"
await prisma.votingSession.findFirst({
  where: {
    id: votingSessionId,
    tenantId: currentTenant.id,
    archivedAt: null
  }
});
```

Patrón prohibido:

```typescript id="mn6ue7"
await prisma.votingSession.findUnique({
  where: { id: votingSessionId }
});
```

---

# 21. Reglas de privacidad

## 21.1. `identified`

En modo `identified`:

```text id="trri01"
selectedOptionId puede consultarse por administradores con permiso explícito
voteCast mantiene relación con eligibleVoter
auditoría puede incluir voteCastId y eligibleVoterId
logs nunca deben incluir payload completo
/me solo muestra voto propio
```

Permisos recomendados:

```text id="mw80bk"
votes.read
votes.audit.read
```

---

## 21.2. `secretBasic`

En modo `secretBasic`:

```text id="fms1r7"
selectedOptionId se usa internamente para tally
selectedOptionId no se expone en DTO admin estándar
selectedOptionIds no se exponen en DTO admin estándar
audit metadata de voteCast.cast no incluye selectedOptionId
logs no incluyen selectedOptionId
resultados publicados son agregados
/me muestra participación, no necesariamente opción
```

Advertencia:

```text id="lgtos7"
secretBasic no equivale a anonimato criptográfico fuerte ni votación legalmente certificada.
```

---

# 22. Reglas de elegibilidad

## 22.1. Sujeto lógico

El sujeto lógico se determina por `voterType`:

```text id="w6xhff"
user -> userId
person -> personId
propertyUnit -> propertyUnitId
owner -> personId/propertyUnitId
resident -> personId/propertyUnitId
role -> roleId
proxyRepresentative -> proxyId
```

---

## 22.2. Representación

Para `proxyRepresentative`:

```text id="cvl6xw"
proxyId requerido
proxy.status = approved
proxy.tenantId = currentTenant.id
proxy.meetingId = votingSession.meetingId
voting.proxyVoting.enabled = true
```

---

## 22.3. Propietarios

Para `owners`:

```text id="r1q6kn"
ownership activa
propertyUnit pertenece al tenant
person pertenece al tenant
```

---

## 22.4. Residentes

Para `residents`:

```text id="t2xadp"
voting.residentVoting.enabled = true
residency/lease activa
propertyUnit pertenece al tenant
person pertenece al tenant
```

---

# 23. Reglas de voto

## 23.1. Single choice

```text id="fveh98"
selectedOptionId requerido
selectedOptionIds prohibido
selectedOptionId debe pertenecer a ballotQuestionId
```

---

## 23.2. Yes / No / Abstain

```text id="vve94b"
selectedOptionId requerido
optionType IN yes, no, abstain
si optionType = abstain, allowAbstention debe ser true
```

---

## 23.3. Multiple choice

```text id="r97idu"
selectedOptionIds requerido
selectedOptionId prohibido
selectedOptionIds debe ser array no vacío
minSelections <= selectedOptionIds.length <= maxSelections
todas las opciones pertenecen a ballotQuestionId
no se permiten opciones duplicadas en selectedOptionIds
```

---

## 23.4. Voto duplicado

Regla:

```text id="oh8hkj"
Solo puede existir un voto activo por tenant + votingSession + ballotQuestion + eligibleVoter.
```

Resultado esperado:

```text id="x4w0bu"
409 VOTE_DUPLICATE
```

---

# 24. Reglas de resultados

## 24.1. Fuente de cálculo

```text id="fhn5ql"
vote_casts status = cast
eligible_voters status IN eligible, voted
ballot_questions active/closed
ballot_options active
```

---

## 24.2. Simple majority

Regla MVP:

```text id="lty91a"
passed si votos afirmativos > votos negativos
```

---

## 24.3. Absolute majority

Regla MVP:

```text id="v57clx"
passed si votos afirmativos > 50% de votos válidos no abstención
```

---

## 24.4. Plurality

Regla MVP:

```text id="c3u1j5"
winningOptionId = opción con mayor número de votos
tie si hay empate en primer lugar
```

---

## 24.5. Unanimity

Regla MVP:

```text id="bcen2w"
passed si todos los votos válidos no abstención son afirmativos o corresponden a la misma opción aprobatoria
```

---

## 24.6. Informational

Regla MVP:

```text id="q4k1hd"
resultStatus = informational
no thresholdMet requerido
```

---

## 24.7. Abstenciones

```text id="qwv8c4"
abstención cuenta como participación
abstención no cuenta como voto afirmativo
abstención no cuenta como voto negativo
abstención se reporta en totalAbstentions
```

---

## 24.8. Porcentajes

```text id="m33f0v"
percentage = votesForOption / totalVotes * 100
participationPercentage = totalVotes / totalEligible * 100
```

Persistencia:

```text id="p9rh1g"
Decimal(5,2)
```

API:

```text id="xmn7mq"
string decimal
```

---

# 25. DTOs derivados del modelo

## 25.1. VotingSessionAdminDto

```text id="uv18zm"
id
meetingId
title
description
status
visibility
votingMode
privacyMode
eligibilityMode
votingRule
opensAt
closesAt
openedAt
closedAt
cancelledAt
cancellationReason
resultsCalculatedAt
resultsPublishedAt
createdAt
updatedAt
archivedAt
```

---

## 25.2. VotingSessionListItemDto

```text id="gxuebc"
id
meetingId
title
status
visibility
votingMode
privacyMode
eligibilityMode
votingRule
opensAt
closesAt
resultsPublishedAt
updatedAt
```

---

## 25.3. OwnVotingSessionDto

```text id="ai094d"
id
meetingId
title
description
status
visibility
votingMode
privacyMode
opensAt
closesAt
myParticipationStatus
resultsAvailable
```

No incluye:

```text id="nwnjx6"
metadata
elegibles completos
votos de terceros
selectedOptionId de terceros
audit
```

---

## 25.4. BallotQuestionDto

```text id="dxmeyl"
id
votingSessionId
order
title
description
questionType
maxSelections
minSelections
allowAbstention
status
createdAt
updatedAt
```

---

## 25.5. BallotOptionDto

```text id="mwxoxl"
id
ballotQuestionId
order
label
description
optionType
isAbstention
createdAt
updatedAt
```

---

## 25.6. EligibleVoterDto

```text id="cb8gst"
id
votingSessionId
voterType
userId
personId
propertyUnitId
roleId
proxyId
eligibilitySource
weight
status
resolvedAt
createdAt
```

Solo administrativo.

---

## 25.7. VoteCastAdminDto — `identified`

```text id="ctjpir"
id
votingSessionId
ballotQuestionId
eligibleVoterId
voterUserId
voterPersonId
voterPropertyUnitId
selectedOptionId
selectedOptionIds
status
castAt
cancelledAt
cancellationReason
createdAt
```

Requiere permiso estricto.

---

## 25.8. VoteCastAdminDto — `secretBasic`

```text id="h45wn9"
id
votingSessionId
ballotQuestionId
eligibleVoterId
status
castAt
cancelledAt
createdAt
```

No incluye:

```text id="ofhjp0"
selectedOptionId
selectedOptionIds
opción votada
metadata sensible
```

---

## 25.9. VoteCastOwnDto

```text id="nogksy"
id
votingSessionId
ballotQuestionId
status
castAt
```

En `identified`, se puede permitir mostrar la opción propia si la política lo decide.

En `secretBasic`, recomendado:

```text id="r9bstq"
mostrar únicamente que el voto fue registrado.
```

---

## 25.10. VotingTallyDto

```text id="f9axho"
id
ballotQuestionId
ballotOptionId
totalVotes
weightedTotal
percentage
calculatedAt
```

---

## 25.11. VotingResultDto

```text id="q4dpf2"
id
votingSessionId
ballotQuestionId
resultStatus
winningOptionId
totalEligible
totalVotes
totalAbstentions
participationPercentage
requiredThreshold
thresholdMet
calculatedAt
publishedAt
```

---

## 25.12. OwnVotingResultDto

```text id="x506pc"
ballotQuestionId
resultStatus
winningOptionId
totalVotes
totalAbstentions
participationPercentage
thresholdMet
publishedAt
tallies
```

Solo si resultados están publicados y el usuario pertenece a audiencia autorizada.

---

# 26. Reglas de consulta

## 26.1. Filtros de sesiones administrativas

```text id="c8tvuv"
status
visibility
privacyMode
eligibilityMode
votingRule
meetingId
opensFrom
opensTo
closesFrom
closesTo
resultsPublished
q
page
pageSize
sortBy
sortOrder
```

Sort permitido:

```text id="ufdf34"
createdAt
updatedAt
opensAt
closesAt
title
status
```

---

## 26.2. Filtros de mis votaciones

```text id="i3xv3s"
status
meetingId
opensFrom
opensTo
closesFrom
closesTo
pendingOnly
resultsAvailable
page
pageSize
sortBy
sortOrder
```

---

## 26.3. Filtros de elegibles

```text id="edp9hm"
voterType
eligibilitySource
status
userId
personId
propertyUnitId
roleId
page
pageSize
```

---

## 26.4. Filtros de votos administrativos

```text id="p3vmaf"
ballotQuestionId
eligibleVoterId
status
castFrom
castTo
page
pageSize
```

En `secretBasic`, el filtro por `selectedOptionId` no debe estar disponible para admin estándar.

---

# 27. Queries conceptuales

## 27.1. Listar sesiones administrativas

```sql id="cemnuf"
SELECT
  id,
  meeting_id,
  title,
  status,
  visibility,
  voting_mode,
  privacy_mode,
  eligibility_mode,
  voting_rule,
  opens_at,
  closes_at,
  results_published_at,
  updated_at
FROM voting_sessions
WHERE tenant_id = $1
  AND archived_at IS NULL
ORDER BY updated_at DESC
LIMIT $2 OFFSET $3;
```

---

## 27.2. Obtener votación por tenant

```sql id="d1p8pa"
SELECT *
FROM voting_sessions
WHERE tenant_id = $1
  AND id = $2
  AND archived_at IS NULL
LIMIT 1;
```

---

## 27.3. Verificar elegibilidad propia

```sql id="s20rbo"
SELECT ev.*
FROM eligible_voters ev
WHERE ev.tenant_id = $1
  AND ev.voting_session_id = $2
  AND ev.archived_at IS NULL
  AND ev.status = 'eligible'
  AND (
    ev.user_id = $3
    OR ev.person_id = ANY($4)
    OR ev.property_unit_id = ANY($5)
  )
LIMIT 1;
```

Parámetros:

```text id="kfgztt"
$1 = tenantId
$2 = votingSessionId
$3 = actorUserId
$4 = actorPersonIds
$5 = actorPropertyUnitIds
```

---

## 27.4. Verificar voto duplicado

```sql id="znxce2"
SELECT id
FROM vote_casts
WHERE tenant_id = $1
  AND voting_session_id = $2
  AND ballot_question_id = $3
  AND eligible_voter_id = $4
  AND archived_at IS NULL
  AND status = 'cast'
LIMIT 1;
```

---

## 27.5. Contar votos por opción

```sql id="v6fqso"
SELECT
  selected_option_id,
  COUNT(*) AS total_votes
FROM vote_casts
WHERE tenant_id = $1
  AND voting_session_id = $2
  AND ballot_question_id = $3
  AND archived_at IS NULL
  AND status = 'cast'
  AND selected_option_id IS NOT NULL
GROUP BY selected_option_id;
```

---

## 27.6. Contar participación

```sql id="mbbky4"
SELECT
  COUNT(*) FILTER (WHERE status IN ('eligible', 'voted')) AS total_eligible,
  COUNT(*) FILTER (WHERE status = 'voted') AS total_voted
FROM eligible_voters
WHERE tenant_id = $1
  AND voting_session_id = $2
  AND archived_at IS NULL;
```

---

# 28. Soft delete y archivo

No se debe eliminar físicamente:

```text id="m6qszt"
voting_sessions
ballot_questions
ballot_options
eligible_voters
vote_casts
voting_tallies
voting_results
voting_resolution_links
```

Regla:

```text id="al28h8"
archivedAt != null representa archivo lógico.
```

Para entidades con `status`, usar además:

```text id="cncim1"
status = archived
```

cuando aplique.

Motivos:

* trazabilidad;
* evidencia administrativa;
* consistencia de resultados;
* auditoría;
* revisión posterior;
* futura certificación;
* futuras actas;
* futuras impugnaciones.

---

# 29. Reglas de metadata

No guardar en `metadata`:

```text id="t1daz1"
passwords
tokens
api keys
client secrets
cookies
authorization headers
voto completo
selectedOptionId en secretBasic
selectedOptionIds en secretBasic
payload completo
emails completos
teléfonos completos
cédulas
documentos completos
firmas
actas completas
stack traces
SQL raw
provider payloads
```

Permitido:

```text id="gd2bwh"
traceId
correlationId
safe sourceType
safe sourceId
safe flags
safe result metadata
safe voting configuration
non-sensitive notes
```

---

# 30. Auditoría desde modelo

Eventos mínimos:

```text id="pr8gna"
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

```text id="djjyw5"
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

```text id="j68qap"
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

# 31. Migración

Nombre sugerido:

```text id="tgx2rt"
014_create_voting_basic
```

Pasos:

```text id="b3gkay"
1. Crear enums de votación.
2. Crear voting_sessions.
3. Crear ballot_questions.
4. Crear ballot_options.
5. Crear eligible_voters.
6. Crear vote_casts.
7. Crear voting_tallies.
8. Crear voting_results.
9. Crear voting_resolution_links.
10. Crear índices básicos.
11. Crear constraints básicos.
12. Crear índices parciales raw.
13. Agregar relaciones Prisma.
14. Generar Prisma Client.
15. Ejecutar migración en DB test.
16. Ejecutar seeds demo.
17. Validar tests de repositorio.
```

---

# 32. Migraciones raw opcionales

## 32.1. Validar ventana de votación

```sql id="tjt8g5"
ALTER TABLE voting_sessions
ADD CONSTRAINT voting_sessions_valid_window
CHECK (
  opens_at IS NULL
  OR closes_at IS NULL
  OR opens_at < closes_at
);
```

---

## 32.2. Validar pesos no negativos

```sql id="u6nue4"
ALTER TABLE eligible_voters
ADD CONSTRAINT eligible_voters_weight_non_negative
CHECK (weight >= 0);
```

---

## 32.3. Validar total votes no negativo

```sql id="kue37h"
ALTER TABLE voting_tallies
ADD CONSTRAINT voting_tallies_total_votes_non_negative
CHECK (total_votes >= 0);
```

---

## 32.4. Validar weighted total no negativo

```sql id="q7nl2h"
ALTER TABLE voting_tallies
ADD CONSTRAINT voting_tallies_weighted_total_non_negative
CHECK (weighted_total >= 0);
```

---

## 32.5. Validar percentage

```sql id="brlg57"
ALTER TABLE voting_tallies
ADD CONSTRAINT voting_tallies_percentage_range
CHECK (percentage >= 0 AND percentage <= 100);
```

---

## 32.6. Validar participación

```sql id="a7ol7g"
ALTER TABLE voting_results
ADD CONSTRAINT voting_results_participation_percentage_range
CHECK (
  participation_percentage >= 0
  AND participation_percentage <= 100
);
```

---

## 32.7. Validar threshold

```sql id="jz52pv"
ALTER TABLE voting_results
ADD CONSTRAINT voting_results_threshold_range
CHECK (
  required_threshold IS NULL
  OR (required_threshold >= 0 AND required_threshold <= 100)
);
```

---

## 32.8. Validar selección de single choice

Esta validación se recomienda en servicio, no en DB, porque depende de `questionType`.

Regla de servicio:

```text id="vvytvv"
singleChoice y yesNoAbstain usan selectedOptionId
multipleChoice usa selectedOptionIds
```

---

# 33. Seeds

## 33.1. Voting sessions demo

```text id="ql1wcd"
votingSessionDraftA
votingSessionScheduledA
votingSessionOpenA
votingSessionClosedA
votingSessionResultsCalculatedA
votingSessionResultsPublishedA
votingSessionCancelledA
votingSessionArchivedA
votingSessionTenantB
```

---

## 33.2. Questions demo

```text id="fgxagj"
questionYesNoBudgetA
questionSingleChoiceBoardA
questionMultipleChoiceMaintenanceA
questionTenantB
```

---

## 33.3. Options demo

```text id="xjiz4a"
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

## 33.4. Eligible voters demo

```text id="cnus9f"
eligibleOwnerA
eligibleResidentA
eligiblePropertyUnitA101
eligiblePropertyUnitA102
eligibleProxyRepresentativeA
eligibleRoleBoardA
eligibleTenantB
```

---

## 33.5. Votes demo

```text id="emjnn1"
voteCastOwnerYesA
voteCastOwnerNoA
voteCastUnitA101AbstainA
voteCastMultipleChoiceA
voteCastCancelledA
voteCastTenantB
```

---

## 33.6. Results demo

```text id="v4i3li"
votingTallyYesA
votingTallyNoA
votingTallyAbstainA
votingResultPassedA
votingResultFailedA
votingResultTieA
votingResultInformationalA
```

---

## 33.7. Datos prohibidos en seeds

```text id="bwqwcn"
nombres reales de residentes
emails reales
teléfonos reales
cédulas reales
votos reales
actas reales
documentos reales
firmas reales
tokens
cookies
secretos
datos financieros reales
datos sancionatorios reales
```

---

# 34. Testing del modelo

## 34.1. Unit tests

```text id="qa4oaj"
VotingSession entity
BallotQuestion entity
BallotOption entity
EligibleVoter entity
VoteCast entity
VotingTally entity
VotingResult entity
VotingResolutionLink entity
VotingSessionStatus
VotingPrivacyMode
EligibilityMode
VotingRule
BallotQuestionType
VoterType
VoteCastStatus
VotingResultStatus
VotingTitle
VotingWindow
VotingSelection
VotingThreshold
```

---

## 34.2. Repository tests

```text id="vhpxdj"
create voting session
find voting session by tenant
list voting sessions
update voting session status
archive voting session
create ballot question
create ballot option
create eligible voter
prevent duplicate eligible voter
cast vote
prevent duplicate vote
cancel vote
calculate tallies
create voting result
publish voting result
link result to resolution
tenant A does not see tenant B records
```

---

## 34.3. Multitenancy tests

```text id="ywfgvw"
tenant A no ve votingSessions tenant B
tenant A no ve ballotQuestions tenant B
tenant A no ve ballotOptions tenant B
tenant A no ve eligibleVoters tenant B
tenant A no ve voteCasts tenant B
tenant A no ve votingTallies tenant B
tenant A no ve votingResults tenant B
tenant A no ve votingResolutionLinks tenant B
tenant A no usa meetingId tenant B
tenant A no usa meetingResolutionId tenant B
tenant A no usa userId tenant B
tenant A no usa personId tenant B
tenant A no usa propertyUnitId tenant B
tenant A no usa proxyId tenant B
```

---

## 34.4. Privacy tests

```text id="zuy2sm"
identified permite consultar voto individual solo con permiso
secretBasic no expone selectedOptionId en DTO admin estándar
secretBasic no expone selectedOptionIds en DTO admin estándar
secretBasic no expone selectedOptionId en audit metadata
secretBasic no expone selectedOptionId en logs
resultados agregados no revelan votante individual
/me no muestra votos de terceros
```

---

## 34.5. Security tests

```text id="nsf4q7"
no public voting endpoints
no cross-tenant voting session
no cross-tenant eligible voter
no cross-tenant vote
no duplicate vote
no vote outside window
no vote in closed session
no vote by non-eligible user
no vote by чужая unidad / unidad ajena
no proxy vote without approved proxy
no results publication without permission
no selectedOptionId in logs for secretBasic
OpenAPI no public voting routes
```

---

# 35. Decisión final del modelo

El módulo `014-voting-basic` usará las siguientes tablas:

```text id="sj5zu3"
voting_sessions
ballot_questions
ballot_options
eligible_voters
vote_casts
voting_tallies
voting_results
voting_resolution_links
```

El modelo garantiza:

```text id="tmkidd"
tenant isolation
voting session management
ballot question management
ballot option management
eligible voter management
vote casting
duplicate vote prevention
identified privacy mode
secretBasic privacy mode
deterministic tally
controlled result publication
resolution linking
auditability
no public exposure
future extensibility
```

La implementación no debe aceptarse si:

```text id="q17xe1"
permite voting sessions cross-tenant
permite questions cross-tenant
permite options cross-tenant
permite eligible voters cross-tenant
permite vote casts cross-tenant
permite votos duplicados
permite votar en sesión cerrada
permite votar fuera de ventana
permite votar sin elegibilidad
permite votar por unidad ajena
permite votar por proxy no aprobado
expone selectedOptionId en secretBasic
registra selectedOptionId en logs secretBasic
registra selectedOptionId en auditoría secretBasic
publica resultados sin cálculo
expone votaciones públicamente
documenta endpoints públicos de votación
ejecuta acciones automáticas desde resultados
genera cargos o multas desde resultados
presenta secretBasic como anonimato criptográfico
presenta MVP como votación legalmente certificada
```

---

# 36. Pendientes para evolución

Quedan diferidos:

```text id="zuv78p"
voto ponderado avanzado
coeficientes de copropiedad
mayorías legales complejas
votación criptográfica secreta
verificación pública
firma electrónica
sellado de tiempo
actas certificadas
impugnaciones
observadores externos
segunda vuelta
reconteo formal
blockchain
voto por WhatsApp
voto por SMS
voto por email
voto offline
biometría
geolocalización
IA con datos reales
```

Estos diferidos no bloquean el MVP de `014-voting-basic`.
