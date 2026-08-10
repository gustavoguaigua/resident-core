# Spec 014 — Voting Basic

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                                            |
| Spec ID         | 014                                                                                                                                                                                      |
| Módulo          | Voting Basic                                                                                                                                                                             |
| Documento       | Functional Specification                                                                                                                                                                 |
| Ruta            | `docs/specs/014-voting-basic/spec.md`                                                                                                                                                    |
| Versión         | 0.1                                                                                                                                                                                      |
| Estado          | needs-review                                                                                                                                                                             |
| Fecha           | 2026-07-20                                                                                                                                                                               |
| Prioridad       | Media / Alta                                                                                                                                                                             |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `007-audit`, `012-communications-notifications`, `013-meetings-attendance`                                                 |
| Relacionado con | Asambleas, reuniones, propietarios, residentes, unidades habitacionales, quórum, actas, resoluciones, notificaciones, auditoría, futuras firmas electrónicas, futuras actas certificadas |

---

## 2. Nombre de la funcionalidad

```text id="d21dad"
Voting Basic
```

---

## 3. Propósito

El módulo `014-voting-basic` define la gestión básica de votaciones internas dentro de RESIDENT Core para conjuntos residenciales.

El objetivo es permitir que un tenant pueda crear votaciones asociadas a reuniones o asambleas, definir preguntas, opciones, votantes elegibles, reglas simples de participación, registrar votos, cerrar votaciones, calcular resultados básicos y conservar trazabilidad auditable.

Regla central:

```text id="p2r0j4"
Toda votación debe pertenecer a un tenant, estar asociada a una reunión o contexto autorizado, tener votantes elegibles claramente definidos, impedir votos duplicados, proteger la privacidad del voto según el modo configurado, calcular resultados de forma determinística y mantener auditoría completa.
```

---

## 4. Objetivo funcional

Permitir la administración básica de votaciones internas para conjuntos residenciales, incluyendo:

* creación de votaciones;
* asociación opcional con una reunión;
* definición de preguntas;
* definición de opciones;
* definición de votantes elegibles;
* votación por usuario;
* votación por persona;
* votación por unidad habitacional;
* votación por propietario;
* votación por residente si la política lo permite;
* votación con opción única;
* votación con opción múltiple limitada;
* voto afirmativo/negativo/abstención;
* registro de voto;
* prevención de voto duplicado;
* cierre de votación;
* cálculo básico de resultados;
* publicación controlada de resultados;
* consulta administrativa;
* consulta propia del estado de participación;
* integración con reuniones;
* integración con actas y resoluciones;
* integración con notificaciones;
* auditoría de operaciones críticas;
* protección de datos personales;
* preparación para votación avanzada futura;
* preparación para reglas legales futuras;
* preparación para firma y certificación futura.

---

## 5. Alcance

### 5.1. Incluido en esta spec

Esta spec incluye:

```text id="y2s12m"
1. Gestión básica de votaciones internas.
2. Votaciones asociadas a reuniones.
3. Votaciones independientes internas si el tenant lo permite.
4. Preguntas de votación.
5. Opciones de votación.
6. Votantes elegibles.
7. Reglas básicas de elegibilidad.
8. Voto por usuario.
9. Voto por persona.
10. Voto por unidad habitacional.
11. Voto por propietario.
12. Voto por residente si la política lo permite.
13. Prevención de voto duplicado.
14. Voto simple de opción única.
15. Voto de opción múltiple limitado.
16. Voto sí/no/abstención.
17. Estado de participación propia.
18. Cierre de votación.
19. Cálculo básico de resultados.
20. Publicación controlada de resultados.
21. Relación con actas y resoluciones.
22. Eventos para notificaciones.
23. Auditoría.
24. API REST.
25. Pruebas funcionales, multitenant, autorización, privacidad y seguridad.
```

---

### 5.2. No incluido en esta spec

Queda fuera del MVP:

```text id="ef3unj"
- Votación legalmente certificada.
- Votación nacional, pública, política o gubernamental.
- Votación con valor legal pleno.
- Firma electrónica del voto.
- Sellado de tiempo certificado.
- Integración con notarías.
- Blockchain.
- Criptografía avanzada de voto secreto verificable extremo a extremo.
- Anonimato criptográfico fuerte.
- Recuento ponderado avanzado por coeficientes de copropiedad.
- Mayorías legales complejas.
- Segunda vuelta automática.
- Votación delegada compleja.
- Poderes notariales.
- Verificación biométrica.
- Geolocalización obligatoria.
- Voto offline.
- Voto por SMS.
- Voto por WhatsApp.
- Voto por email.
- Integración con urnas físicas.
- Reconteo manual formal.
- Impugnaciones legales.
- Firma de actas.
- Generación de acta certificada.
- Reporte legal para autoridad externa.
- Observadores externos.
- Auditoría pública del voto.
- IA para recomendar voto.
- IA para interpretar resultados oficiales.
```

Estos temas deberán definirse en specs futuras si se requieren.

---

## 6. Contexto arquitectónico

Este módulo pertenece al bounded context:

```text id="ecx3lw"
Meetings and Attendance
Voting and Resolutions
Audit and Compliance
```

Se relaciona con:

```text id="pm5msm"
Tenant Management
Identity and Access
Residents and Properties
Meetings and Attendance
Communications and Notifications
Audit and Compliance
Reporting and Analytics
Documents and Minutes
```

Relación conceptual:

```text id="zn667a"
Tenant
  └── Meeting
        └── Voting Session
              ├── Ballots / Questions
              ├── Options
              ├── Eligible Voters
              ├── Vote Casts
              ├── Tally
              ├── Result
              ├── Resolution Link
              └── Audit Trail
```

---

## 7. Principios

### 7.1. Tenant isolation obligatorio

Toda votación, pregunta, opción, elegibilidad, voto, resultado y auditoría pertenece a un tenant.

Regla:

```text id="yxn0ay"
votingSession.tenantId == currentTenant.id
```

---

### 7.2. La votación no reemplaza la reunión

Una votación puede estar asociada a una reunión, pero no reemplaza:

```text id="a8ccfn"
convocatoria
asistencia
quórum
acta
resolución
auditoría
```

La reunión y asistencia se gestionan en `013-meetings-attendance`.

---

### 7.3. Elegibilidad explícita

Solo pueden votar sujetos elegibles.

Un votante puede estar representado por:

```text id="xkb3r2"
usuario
persona
unidad habitacional
propietario
residente
rol o grupo autorizado
```

Regla:

```text id="e6qsde"
No existe voto válido sin elegibilidad previa o resoluble.
```

---

### 7.4. Prevención de voto duplicado

El sistema debe impedir votos duplicados dentro de la misma pregunta o votación según la regla configurada.

Ejemplos:

```text id="hlha14"
una unidad = un voto
una persona = un voto
un usuario = un voto
un propietario = un voto
```

---

### 7.5. Privacidad del voto por modo

El módulo debe soportar un modo de privacidad explícito.

MVP recomienda:

```text id="vuyhsm"
identified
secretBasic
```

Donde:

* `identified`: el voto queda asociado al votante para consulta administrativa autorizada.
* `secretBasic`: el sistema separa participación y opción votada a nivel de DTO/API y logs, pero no garantiza anonimato criptográfico fuerte.

Regla:

```text id="qvhk80"
secretBasic no debe presentarse como anonimato criptográfico legalmente certificado.
```

---

### 7.6. Resultados determinísticos

El resultado se calcula desde votos persistidos, válidos y no anulados.

Regla:

```text id="w97725"
result = deterministic tally of valid vote casts
```

---

### 7.7. Auditoría obligatoria

Se deben auditar operaciones críticas:

* creación de votación;
* actualización de votación;
* apertura de votación;
* cierre de votación;
* cancelación;
* definición de elegibilidad;
* emisión de voto;
* anulación administrativa;
* cálculo de resultados;
* publicación de resultados;
* vinculación con resolución;
* archivo.

---

### 7.8. No voto público

MVP no expone votaciones ni resultados por endpoints públicos.

Regla:

```text id="uz1mzp"
Voting Basic no debe crear rutas bajo /api/v1/public.
```

---

### 7.9. No ejecución automática

Una votación aprobada no debe ejecutar automáticamente acciones financieras, administrativas, sancionatorias o legales.

Ejemplo:

```text id="r2humt"
votación aprobada no genera cargo
votación aprobada no genera multa
votación aprobada no modifica presupuesto
votación aprobada no firma acta
```

La ejecución requiere specs o flujos posteriores.

---

### 7.10. Compatibilidad futura

El diseño debe permitir futuras extensiones:

```text id="bgpnx9"
voto ponderado
coeficientes de copropiedad
mayorías legales
votación secreta criptográfica
firma electrónica
actas certificadas
recuento formal
impugnaciones
observadores
auditoría verificable
```

---

## 8. Actores

### 8.1. TenantAdmin

Puede:

* crear votaciones;
* definir preguntas;
* definir opciones;
* definir elegibles;
* abrir votaciones;
* cerrar votaciones;
* cancelar votaciones;
* calcular resultados;
* publicar resultados;
* vincular resultados con resoluciones;
* consultar auditoría si tiene permiso.

---

### 8.2. MeetingManager

Puede gestionar votaciones asociadas a reuniones si tiene permisos.

Puede:

* preparar votaciones;
* abrir votaciones durante reunión;
* monitorear participación;
* cerrar votaciones;
* consultar resultados;
* proponer vínculo con resolución.

---

### 8.3. BoardMember

Puede consultar votaciones y resultados según permisos.

No puede modificar votaciones salvo permisos explícitos.

---

### 8.4. PropertyOwner

Puede votar en votaciones dirigidas a propietarios si es elegible.

Puede:

* consultar votaciones propias;
* emitir voto;
* consultar estado de participación;
* consultar resultados publicados para su audiencia.

---

### 8.5. Resident

Puede votar solo si la votación permite participación de residentes.

Por defecto, MVP recomienda que votaciones de asamblea formal sean de propietarios.

---

### 8.6. Proxy Representative

Puede votar en representación de una persona o unidad solo si existe representación aprobada desde `013-meetings-attendance` y la política de la votación lo permite.

---

### 8.7. PlatformAdmin

No debe acceder automáticamente al contenido de votaciones de tenants.

Cualquier acceso excepcional debe ser explícito, autorizado, justificado y auditado.

---

### 8.8. Visitante público

No tiene acceso a votaciones, resultados, elegibles ni votos.

---

## 9. Definiciones

### 9.1. Voting Session

Contenedor de una o varias preguntas de votación.

Puede estar asociada a una reunión.

---

### 9.2. Ballot

Pregunta o asunto específico sometido a votación.

Ejemplos:

```text id="wcv10z"
Aprobación del presupuesto anual
Aprobación de mantenimiento extraordinario
Elección de directiva
Autorización de reparación
Aprobación de reglamento interno
```

---

### 9.3. Voting Option

Opción disponible para una pregunta.

Ejemplos:

```text id="sbloel"
Sí
No
Abstención
Opción A
Opción B
Opción C
```

---

### 9.4. Eligible Voter

Sujeto autorizado a votar.

Puede ser:

```text id="zenvlb"
usuario
persona
unidad habitacional
propietario
residente
representante autorizado
```

---

### 9.5. Vote Cast

Registro de voto emitido.

Debe ser único según la regla de votación.

---

### 9.6. Tally

Recuento de votos válidos.

---

### 9.7. Voting Result

Resultado calculado de la votación.

---

### 9.8. Voting Rule

Regla que define cómo se vota y cómo se calcula el resultado.

Ejemplos:

```text id="yth3s5"
simpleMajority
absoluteMajority
plurality
unanimity
informational
```

MVP implementa reglas básicas.

---

### 9.9. Voting Privacy Mode

Modo que define cómo se protege la relación entre votante y opción votada.

---

## 10. Supuestos

1. El tenant ya existe.
2. Los usuarios y roles existen.
3. Las personas, unidades, propietarios y residentes existen.
4. El módulo de reuniones y asistencia existe.
5. La votación puede asociarse a una reunión.
6. La asistencia puede utilizarse para validar participación si la política lo requiere.
7. Keycloak autentica usuarios.
8. RESIDENT Core autoriza acciones.
9. El sistema no reemplaza validación legal formal.
10. MVP no implementa votación criptográficamente anónima.
11. MVP no implementa firma electrónica.
12. MVP no implementa actas certificadas.
13. MVP no implementa coeficientes de copropiedad avanzados.
14. MVP no expone resultados públicamente.
15. MVP no genera multas, cargos ni acciones automáticas desde resultados.
16. El tenant puede definir si residentes pueden votar en ciertos casos.
17. El voto por defecto recomendado para asambleas es por unidad o propietario.
18. Los votos se almacenan de forma auditable.
19. Los resultados se calculan de forma determinística.
20. La zona horaria por defecto es `America/Guayaquil`.
21. Las fechas se almacenan en UTC.
22. IA externa no debe usarse con datos reales de votaciones.

---

## 11. Entidades principales

### 11.1. VotingSession

Representa una sesión de votación.

Campos conceptuales:

```text id="h5ojbf"
VotingSession
├── id
├── tenantId
├── meetingId nullable
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
├── resultsCalculatedAt
├── resultsPublishedAt
├── metadata
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 11.2. BallotQuestion

Representa una pregunta sometida a votación.

Campos conceptuales:

```text id="rerhiw"
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

### 11.3. BallotOption

Representa una opción de respuesta.

Campos conceptuales:

```text id="fnshuk"
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

### 11.4. EligibleVoter

Representa un sujeto elegible para votar.

Campos conceptuales:

```text id="apcgaa"
EligibleVoter
├── id
├── tenantId
├── votingSessionId
├── voterType
├── userId nullable
├── personId nullable
├── propertyUnitId nullable
├── roleId nullable
├── eligibilitySource
├── weight
├── status
├── resolvedAt
├── createdAt
└── archivedAt
```

---

### 11.5. VoteCast

Representa un voto emitido.

Campos conceptuales:

```text id="smu2oq"
VoteCast
├── id
├── tenantId
├── votingSessionId
├── ballotQuestionId
├── eligibleVoterId
├── voterUserId nullable
├── voterPersonId nullable
├── voterPropertyUnitId nullable
├── selectedOptionId nullable
├── selectedOptionIds nullable
├── voteHash nullable
├── status
├── castAt
├── cancelledAt
├── cancelledBy nullable
├── cancellationReason nullable
├── metadata
├── createdAt
└── archivedAt
```

---

### 11.6. VotingTally

Representa el resultado agregado por pregunta y opción.

Campos conceptuales:

```text id="ig8p9s"
VotingTally
├── id
├── tenantId
├── votingSessionId
├── ballotQuestionId
├── ballotOptionId nullable
├── totalVotes
├── weightedTotal
├── percentage
├── calculatedAt
├── createdAt
└── archivedAt
```

---

### 11.7. VotingResult

Representa el resultado general de una pregunta o sesión.

Campos conceptuales:

```text id="q1bqn6"
VotingResult
├── id
├── tenantId
├── votingSessionId
├── ballotQuestionId
├── resultStatus
├── winningOptionId nullable
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

### 11.8. VotingResolutionLink

Vincula un resultado de votación con una resolución de reunión.

Campos conceptuales:

```text id="qqlbbx"
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

## 12. Estados y enums

### 12.1. VotingSessionStatus

```text id="ta98hv"
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

### 12.2. VotingVisibility

```text id="pxrkss"
administrative
meetingParticipants
owners
residents
tenant
mixed
```

---

### 12.3. VotingMode

```text id="uxz6yn"
singleQuestion
multiQuestion
```

---

### 12.4. VotingPrivacyMode

```text id="jm8ysa"
identified
secretBasic
```

Diferidos:

```text id="b7eyau"
cryptographicSecret
publicVerifiable
```

---

### 12.5. EligibilityMode

```text id="zgs6fx"
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

### 12.6. VotingRule

```text id="ld6vaw"
informational
simpleMajority
absoluteMajority
plurality
unanimity
```

Diferidos:

```text id="k1f5xu"
qualifiedMajority
weightedMajority
legalCustomRule
```

---

### 12.7. BallotQuestionType

```text id="ez57j1"
yesNoAbstain
singleChoice
multipleChoice
```

Diferidos:

```text id="zf5m3y"
ranking
openText
numeric
```

---

### 12.8. BallotQuestionStatus

```text id="au2zn0"
draft
active
closed
archived
```

---

### 12.9. BallotOptionType

```text id="dxeepw"
standard
yes
no
abstain
other
```

---

### 12.10. VoterType

```text id="eqecoy"
user
person
propertyUnit
owner
resident
role
proxyRepresentative
```

---

### 12.11. EligibilitySource

```text id="vlmqpg"
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

### 12.12. EligibleVoterStatus

```text id="uc6woy"
eligible
voted
excluded
cancelled
archived
```

---

### 12.13. VoteCastStatus

```text id="o6rfmy"
cast
cancelled
superseded
archived
```

---

### 12.14. VotingResultStatus

```text id="wi2xi1"
pending
passed
failed
tie
informational
cancelled
archived
```

---

## 13. Transiciones de estado

### 13.1. VotingSession

Flujo principal:

```text id="f8se78"
draft -> scheduled -> open -> closed -> resultsCalculated -> resultsPublished -> archived
```

Flujo directo permitido:

```text id="k0qv6y"
draft -> open
open -> closed
closed -> resultsCalculated
resultsCalculated -> resultsPublished
```

Cancelación:

```text id="nsak09"
draft -> cancelled
scheduled -> cancelled
open -> cancelled
```

Archivo:

```text id="en1dqg"
cancelled -> archived
resultsPublished -> archived
closed -> archived si no se publican resultados
```

Transiciones prohibidas:

```text id="pb2wo8"
archived -> open
cancelled -> open
resultsPublished -> open
closed -> open sin reapertura explícita futura
draft -> resultsPublished
open -> resultsPublished sin cierre y cálculo
```

---

### 13.2. BallotQuestion

```text id="eb6619"
draft -> active -> closed -> archived
draft -> archived
```

---

### 13.3. EligibleVoter

```text id="h8fp23"
eligible -> voted
eligible -> excluded
voted -> archived
excluded -> archived
cancelled -> archived
```

---

### 13.4. VoteCast

```text id="p21bhg"
cast -> cancelled
cast -> superseded si se permite reemplazo futuro
cast -> archived
cancelled -> archived
```

MVP recomendado:

```text id="bybkh9"
No permitir superseded salvo política explícita futura.
```

---

### 13.5. VotingResult

```text id="v3ohlh"
pending -> passed
pending -> failed
pending -> tie
pending -> informational
passed -> archived
failed -> archived
tie -> archived
informational -> archived
```

---

## 14. Reglas de negocio

### BR-001 — Toda votación pertenece a un tenant

```text id="f5qm15"
votingSession.tenantId = currentTenant.id
```

---

### BR-002 — El cliente no envía tenantId

El `tenantId` se deriva del tenant activo.

---

### BR-003 — Votación asociada a reunión debe pertenecer al mismo tenant

```text id="w8950k"
votingSession.meetingId.tenantId = votingSession.tenantId
```

---

### BR-004 — Toda pregunta pertenece a una votación del mismo tenant

```text id="yoitdh"
ballotQuestion.tenantId = votingSession.tenantId
```

---

### BR-005 — Toda opción pertenece a una pregunta del mismo tenant

```text id="zrs6i4"
ballotOption.tenantId = ballotQuestion.tenantId
```

---

### BR-006 — Toda elegibilidad pertenece a una votación del mismo tenant

```text id="u03r1h"
eligibleVoter.tenantId = votingSession.tenantId
```

---

### BR-007 — Todo voto pertenece a una votación, pregunta y elegible del mismo tenant

```text id="o3wdab"
voteCast.tenantId = votingSession.tenantId
voteCast.ballotQuestionId.tenantId = votingSession.tenantId
voteCast.eligibleVoterId.tenantId = votingSession.tenantId
```

---

### BR-008 — No se vota en votación cerrada

Solo se vota cuando:

```text id="romnpq"
votingSession.status = open
```

---

### BR-009 — No se vota antes de la apertura

Si `opensAt` existe, el voto requiere:

```text id="xcqyn4"
now >= opensAt
```

---

### BR-010 — No se vota después del cierre

Si `closesAt` existe, el voto requiere:

```text id="lwd634"
now <= closesAt
```

---

### BR-011 — Voto requiere elegibilidad

Todo voto requiere un `EligibleVoter` activo.

---

### BR-012 — Voto duplicado prohibido

No debe existir más de un voto activo por:

```text id="t4wbgt"
tenantId + votingSessionId + ballotQuestionId + eligibleVoterId
```

---

### BR-013 — Una unidad puede tener un voto si la regla es por unidad

Si `eligibilityMode = propertyUnits`, la unidad es el sujeto de voto.

---

### BR-014 — Un propietario puede votar si tiene relación activa

Si `eligibilityMode = owners`, se requiere propiedad activa sobre unidad del tenant.

---

### BR-015 — Un residente vota solo si la política lo permite

Por defecto, votaciones formales de asamblea deben priorizar propietarios.

---

### BR-016 — Representante vota solo con proxy aprobado

Si el voto se emite por representación, debe existir proxy aprobado desde reunión vinculada.

---

### BR-017 — Voto secreto básico no expone opción en `/me`

En `secretBasic`, el usuario puede ver que votó, pero no necesariamente la opción desde todos los endpoints.

---

### BR-018 — Administradores no deben ver opciones individuales en `secretBasic`

En `secretBasic`, endpoints administrativos deben limitarse a participación y resultados agregados, salvo modo de soporte excepcional diseñado y auditado.

---

### BR-019 — Voto identificado permite auditoría individual

En `identified`, usuarios autorizados pueden consultar quién votó qué, bajo permisos estrictos y auditoría.

---

### BR-020 — Resultados se calculan solo con votos válidos

Solo cuentan votos con:

```text id="vpx9ur"
status = cast
archivedAt = null
```

---

### BR-021 — Votos anulados no cuentan

Votos `cancelled`, `superseded` o `archived` no cuentan.

---

### BR-022 — Abstención se registra explícitamente

Si `allowAbstention = true`, la abstención cuenta como participación, pero no necesariamente como voto afirmativo/negativo.

---

### BR-023 — Multiple choice respeta min/max selections

Para `multipleChoice`, se debe cumplir:

```text id="zoh6ea"
minSelections <= selectedOptions.length <= maxSelections
```

---

### BR-024 — Cálculo de resultados no modifica votos

Calcular resultados no crea, modifica ni anula votos.

---

### BR-025 — Publicación de resultados requiere cálculo previo

No se publican resultados si no han sido calculados.

---

### BR-026 — Resultados publicados son visibles solo a audiencia autorizada

No hay publicación pública en MVP.

---

### BR-027 — Votación cancelada no acepta votos

Una votación cancelada queda cerrada para mutaciones ordinarias.

---

### BR-028 — No eliminación física ordinaria

No se eliminan físicamente votaciones, preguntas, opciones, elegibles, votos ni resultados.

---

### BR-029 — No ejecución automática

Una votación aprobada no dispara acciones automáticas.

---

### BR-030 — No multas automáticas

Una votación no puede generar multas automáticamente.

---

### BR-031 — No cargos automáticos

Una votación no puede generar cargos financieros automáticamente.

---

### BR-032 — No cambios automáticos de reglamento

Una votación no modifica reglamentos, presupuestos o configuraciones automáticamente.

---

### BR-033 — Vinculación con resolución es explícita

Un resultado puede vincularse a una resolución, pero no la crea automáticamente salvo flujo explícito futuro.

---

### BR-034 — Auditoría no guarda opción votada en secretBasic

En `secretBasic`, los eventos de auditoría de emisión de voto no deben incluir `selectedOptionId`.

---

### BR-035 — Logs no guardan opciones individuales

Los logs no deben contener opciones seleccionadas por votante.

---

### BR-036 — Resultados no deben revelar identidades en secretBasic

Resultados agregados no deben revelar votantes individuales.

---

### BR-037 — No endpoint público

Ninguna ruta de votación debe existir bajo `/api/v1/public`.

---

### BR-038 — Datos reales no deben enviarse a IA externa

Actas, votos, participantes, elegibles y resultados reales no deben enviarse a herramientas externas de IA.

---

## 15. Historias de usuario

### US-001 — Crear sesión de votación

Como MeetingManager, quiero crear una sesión de votación asociada a una reunión para someter asuntos a decisión.

#### Criterios de aceptación

* Requiere permiso.
* Tenant derivado del contexto.
* Puede asociarse a `meetingId` del mismo tenant.
* Estado inicial `draft`.
* Define `privacyMode`.
* Define `eligibilityMode`.
* Define `votingRule`.
* Auditoría `votingSession.created`.

---

### US-002 — Crear pregunta de votación

Como MeetingManager, quiero agregar preguntas a una votación.

#### Criterios de aceptación

* Requiere permiso.
* La votación debe estar en `draft`.
* La pregunta tiene título.
* Define tipo de pregunta.
* Define `allowAbstention`.
* Auditoría `ballotQuestion.created`.

---

### US-003 — Crear opciones

Como MeetingManager, quiero definir opciones de respuesta.

#### Criterios de aceptación

* Requiere permiso.
* La pregunta está en `draft`.
* Cada opción tiene etiqueta.
* No permite opciones duplicadas por pregunta.
* Auditoría `ballotOption.created`.

---

### US-004 — Definir elegibles manualmente

Como TenantAdmin, quiero definir quiénes pueden votar.

#### Criterios de aceptación

* Requiere permiso.
* Referencias pertenecen al tenant.
* No permite elegibles duplicados.
* Auditoría `eligibleVoter.added`.

---

### US-005 — Resolver elegibles desde reunión

Como MeetingManager, quiero generar elegibles desde participantes o asistencia de una reunión.

#### Criterios de aceptación

* La reunión pertenece al tenant.
* La votación pertenece al tenant.
* La política permite esa fuente.
* No duplica elegibles.
* Auditoría `eligibleVoters.resolved`.

---

### US-006 — Abrir votación

Como MeetingManager, quiero abrir una votación para que los elegibles puedan votar.

#### Criterios de aceptación

* Requiere permiso.
* La votación tiene preguntas.
* Las preguntas tienen opciones válidas.
* Existen elegibles.
* Estado cambia a `open`.
* Auditoría `votingSession.opened`.
* Puede emitir notificación.

---

### US-007 — Emitir voto

Como propietario elegible, quiero votar en una pregunta abierta.

#### Criterios de aceptación

* Requiere autenticación.
* Usuario pertenece al tenant.
* Usuario es elegible o representa elegible autorizado.
* Votación está `open`.
* Pregunta está activa.
* Opción pertenece a la pregunta.
* No existe voto activo previo del elegible para la pregunta.
* Se registra `castAt`.
* Auditoría `voteCast.cast`.

---

### US-008 — Consultar mi estado de participación

Como votante, quiero consultar si ya voté.

#### Criterios de aceptación

* Solo muestra votaciones propias.
* En `secretBasic`, no expone opción individual si no corresponde.
* No muestra votos de terceros.

---

### US-009 — Cerrar votación

Como MeetingManager, quiero cerrar la votación.

#### Criterios de aceptación

* Requiere permiso.
* Estado actual `open`.
* Cambia a `closed`.
* No acepta votos posteriores.
* Auditoría `votingSession.closed`.

---

### US-010 — Calcular resultados

Como MeetingManager, quiero calcular resultados agregados.

#### Criterios de aceptación

* Requiere permiso.
* Votación está `closed`.
* Cuenta votos válidos.
* Excluye votos anulados.
* Calcula participación.
* Calcula ganador o estado.
* Auditoría `votingResults.calculated`.

---

### US-011 — Publicar resultados

Como TenantAdmin, quiero publicar resultados a la audiencia autorizada.

#### Criterios de aceptación

* Requiere permiso.
* Resultados calculados.
* No publica identidades en `secretBasic`.
* No crea endpoint público.
* Puede emitir notificación.
* Auditoría `votingResults.published`.

---

### US-012 — Vincular resultado con resolución

Como MeetingManager, quiero vincular un resultado con una resolución de reunión.

#### Criterios de aceptación

* Requiere permiso.
* Resultado pertenece al tenant.
* Resolución pertenece al tenant.
* Si existe reunión, debe ser consistente.
* No ejecuta acción automática.
* Auditoría `votingResult.linkedToResolution`.

---

### US-013 — Cancelar votación

Como TenantAdmin, quiero cancelar una votación por error o decisión administrativa.

#### Criterios de aceptación

* Requiere permiso.
* Razón obligatoria.
* Estado cancelable.
* No acepta votos posteriores.
* Auditoría `votingSession.cancelled`.

---

### US-014 — Anular voto administrativo

Como TenantAdmin autorizado, quiero anular un voto por error comprobado.

#### Criterios de aceptación

* Requiere permiso elevado.
* Requiere razón.
* Debe auditarse.
* No debe revelar opción en auditoría si `secretBasic`.
* Requiere recalcular resultados si ya estaban calculados.

---

## 16. Requisitos funcionales

### FR-001 — Crear sesiones de votación

El sistema debe permitir crear sesiones de votación por tenant.

---

### FR-002 — Asociar votación a reunión

El sistema debe permitir asociar una votación a una reunión del mismo tenant.

---

### FR-003 — Crear preguntas

El sistema debe permitir crear preguntas dentro de una sesión.

---

### FR-004 — Crear opciones

El sistema debe permitir crear opciones por pregunta.

---

### FR-005 — Definir elegibles manualmente

El sistema debe permitir registrar votantes elegibles.

---

### FR-006 — Resolver elegibles automáticamente

El sistema debe permitir resolver elegibles desde reunión, participantes, asistencia, propietarios, residentes, unidades o roles según política.

---

### FR-007 — Abrir votación

El sistema debe permitir abrir una votación válida.

---

### FR-008 — Emitir voto

El sistema debe permitir que un elegible emita voto.

---

### FR-009 — Evitar voto duplicado

El sistema debe impedir duplicados activos por pregunta y elegible.

---

### FR-010 — Cerrar votación

El sistema debe permitir cerrar una votación.

---

### FR-011 — Calcular resultados

El sistema debe calcular resultados agregados.

---

### FR-012 — Publicar resultados

El sistema debe permitir publicar resultados a audiencia autorizada.

---

### FR-013 — Consultar votaciones administrativas

El sistema debe permitir listar y consultar votaciones administrativas.

---

### FR-014 — Consultar mis votaciones

El sistema debe permitir a un usuario consultar votaciones donde es elegible.

---

### FR-015 — Consultar mi participación

El sistema debe permitir consultar si el usuario ya votó.

---

### FR-016 — Cancelar votación

El sistema debe permitir cancelar una votación con razón.

---

### FR-017 — Anular voto

El sistema debe permitir anular voto con permiso elevado y razón.

---

### FR-018 — Vincular resultado con resolución

El sistema debe permitir vincular resultado a resolución de reunión.

---

### FR-019 — Emitir eventos de notificación

El sistema debe emitir eventos hacia `012-communications-notifications`.

---

### FR-020 — Auditar operaciones críticas

El sistema debe registrar auditoría de creación, apertura, voto, cierre, cálculo, publicación y cancelación.

---

### FR-021 — Documentar API

El sistema debe documentar endpoints, DTOs, errores y permisos en OpenAPI.

---

## 17. Requisitos no funcionales

### NFR-001 — Seguridad

El módulo debe cumplir tenant isolation, autorización por permiso, autorización por recurso propio y protección de privacidad del voto.

---

### NFR-002 — Privacidad

El sistema debe proteger la relación votante-opción según `privacyMode`.

---

### NFR-003 — Integridad

El sistema debe impedir votos duplicados, votos fuera de ventana y votos de sujetos no elegibles.

---

### NFR-004 — Trazabilidad

Toda operación crítica debe ser auditable.

---

### NFR-005 — Consistencia

El cálculo de resultados debe ser determinístico.

---

### NFR-006 — Performance

Objetivo MVP:

```text id="xwyf27"
p95 < 700 ms para listados paginados y p95 < 1500 ms para cálculo de resultados de hasta 500 elegibles y 10 preguntas.
```

---

### NFR-007 — Escalabilidad progresiva

El diseño debe permitir futuro voto ponderado, firma, actas certificadas y reglas avanzadas.

---

### NFR-008 — API-first

Todas las funciones deben exponerse por REST API.

---

### NFR-009 — Observabilidad segura

El módulo debe emitir logs y métricas sin filtrar opción votada individual ni datos personales innecesarios.

---

## 18. Permisos iniciales

### 18.1. Sesiones de votación

```text id="ym2oku"
votingSessions.create
votingSessions.read
votingSessions.update
votingSessions.open
votingSessions.close
votingSessions.cancel
votingSessions.archive
```

---

### 18.2. Preguntas y opciones

```text id="fvyqqn"
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

### 18.3. Elegibles

```text id="skwfgi"
eligibleVoters.create
eligibleVoters.read
eligibleVoters.resolve
eligibleVoters.update
eligibleVoters.exclude
eligibleVoters.archive
```

---

### 18.4. Votos

```text id="j30z16"
votes.cast.own
votes.read
votes.read.own
votes.cancel
votes.audit.read
```

---

### 18.5. Resultados

```text id="d3s373"
votingResults.calculate
votingResults.read
votingResults.read.own
votingResults.publish
votingResults.linkResolution
```

---

### 18.6. Auditoría y reportes

```text id="k3k4yq"
voting.audit.read
voting.reports.read
```

---

## 19. Matriz de permisos resumida

| Acción                       | Permiso requerido              |
| ---------------------------- | ------------------------------ |
| Crear votación               | `votingSessions.create`        |
| Consultar votaciones admin   | `votingSessions.read`          |
| Actualizar votación          | `votingSessions.update`        |
| Abrir votación               | `votingSessions.open`          |
| Cerrar votación              | `votingSessions.close`         |
| Cancelar votación            | `votingSessions.cancel`        |
| Archivar votación            | `votingSessions.archive`       |
| Crear pregunta               | `ballotQuestions.create`       |
| Actualizar pregunta          | `ballotQuestions.update`       |
| Crear opción                 | `ballotOptions.create`         |
| Actualizar opción            | `ballotOptions.update`         |
| Crear elegibles              | `eligibleVoters.create`        |
| Resolver elegibles           | `eligibleVoters.resolve`       |
| Excluir elegible             | `eligibleVoters.exclude`       |
| Emitir voto propio           | `votes.cast.own`               |
| Consultar voto propio        | `votes.read.own`               |
| Consultar votos admin        | `votes.read`                   |
| Anular voto                  | `votes.cancel`                 |
| Calcular resultados          | `votingResults.calculate`      |
| Consultar resultados admin   | `votingResults.read`           |
| Consultar resultados propios | `votingResults.read.own`       |
| Publicar resultados          | `votingResults.publish`        |
| Vincular resolución          | `votingResults.linkResolution` |
| Consultar auditoría          | `voting.audit.read`            |

---

## 20. API preliminar

### 20.1. Voting Sessions — administrativo

```text id="c5db7r"
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

### 20.2. Ballot Questions

```text id="qc17vb"
GET    /api/v1/tenant/voting-sessions/{votingSessionId}/questions
POST   /api/v1/tenant/voting-sessions/{votingSessionId}/questions
GET    /api/v1/tenant/ballot-questions/{questionId}
PATCH  /api/v1/tenant/ballot-questions/{questionId}
POST   /api/v1/tenant/ballot-questions/{questionId}/archive
```

---

### 20.3. Ballot Options

```text id="didcv9"
GET    /api/v1/tenant/ballot-questions/{questionId}/options
POST   /api/v1/tenant/ballot-questions/{questionId}/options
GET    /api/v1/tenant/ballot-options/{optionId}
PATCH  /api/v1/tenant/ballot-options/{optionId}
POST   /api/v1/tenant/ballot-options/{optionId}/archive
```

---

### 20.4. Eligible Voters

```text id="ydau7w"
GET    /api/v1/tenant/voting-sessions/{votingSessionId}/eligible-voters
POST   /api/v1/tenant/voting-sessions/{votingSessionId}/eligible-voters
POST   /api/v1/tenant/voting-sessions/{votingSessionId}/eligible-voters/resolve
GET    /api/v1/tenant/eligible-voters/{eligibleVoterId}
PATCH  /api/v1/tenant/eligible-voters/{eligibleVoterId}
POST   /api/v1/tenant/eligible-voters/{eligibleVoterId}/exclude
POST   /api/v1/tenant/eligible-voters/{eligibleVoterId}/archive
```

---

### 20.5. Votes — administrativo

```text id="a34amo"
GET    /api/v1/tenant/voting-sessions/{votingSessionId}/votes
GET    /api/v1/tenant/votes/{voteCastId}
POST   /api/v1/tenant/votes/{voteCastId}/cancel
```

---

### 20.6. Results

```text id="qm6ibe"
POST   /api/v1/tenant/voting-sessions/{votingSessionId}/calculate-results
GET    /api/v1/tenant/voting-sessions/{votingSessionId}/results
POST   /api/v1/tenant/voting-sessions/{votingSessionId}/publish-results
POST   /api/v1/tenant/voting-sessions/{votingSessionId}/results/{resultId}/link-resolution
```

---

### 20.7. Voting propias

```text id="fk9m9f"
GET    /api/v1/me/voting-sessions
GET    /api/v1/me/voting-sessions/{votingSessionId}
GET    /api/v1/me/voting-sessions/{votingSessionId}/questions
GET    /api/v1/me/voting-sessions/{votingSessionId}/participation
POST   /api/v1/me/voting-sessions/{votingSessionId}/questions/{questionId}/vote
GET    /api/v1/me/voting-sessions/{votingSessionId}/results
```

---

### 20.8. Endpoints públicos

MVP no expone endpoints públicos.

Prohibido:

```text id="xxtzkh"
GET /api/v1/public/tenants/{slug}/voting-sessions
GET /api/v1/public/tenants/{slug}/voting-sessions/{votingSessionId}
GET /api/v1/public/tenants/{slug}/voting-sessions/{votingSessionId}/results
POST /api/v1/public/tenants/{slug}/voting-sessions/{votingSessionId}/vote
```

---

## 21. Datos públicos

### 21.1. Exposición pública

En MVP:

```text id="ixkn8v"
No hay datos públicos de votación.
```

---

### 21.2. Justificación

Las votaciones pueden contener:

```text id="oplb2j"
decisiones internas
participantes elegibles
votos
participación individual
resultados no publicados
resoluciones internas
información financiera
información sancionatoria
información de seguridad
datos de propietarios
datos de residentes
datos de unidades
```

Por tanto, no deben exponerse públicamente.

---

## 22. Integración con otros módulos

### 22.1. Meetings and Attendance

Se usa para:

```text id="m0lt00"
asociar votación a reunión
validar que la reunión pertenece al tenant
resolver participantes de reunión
resolver asistencia de reunión
validar proxies aprobados
vincular resultado a resolución
```

Eventos relacionados:

```text id="j7my8t"
meeting.started
meeting.attendanceClosed
meeting.completed
meetingResolution.recorded
```

---

### 22.2. Residents and Properties

Se usa para validar:

```text id="nez4ux"
personId
propertyUnitId
ownership active
residency active
lease active
voter eligibility
```

---

### 22.3. Users and Roles

Se usa para validar:

```text id="simacx"
userId
tenant membership
roles
permissions
boardMembers
committeeMembers
```

---

### 22.4. Communications and Notifications

Eventos sugeridos:

```text id="lvmolv"
votingSession.created
votingSession.opened
votingSession.closed
votingResults.published
```

Notificaciones sugeridas:

```text id="t0bz8s"
Se abrió una votación.
La votación está por cerrar.
La votación fue cerrada.
Los resultados de la votación están disponibles.
```

---

### 22.5. Audit

Debe auditar:

```text id="qveusl"
votingSession.created
votingSession.updated
votingSession.opened
votingSession.closed
votingSession.cancelled
votingSession.archived
ballotQuestion.created
ballotQuestion.updated
ballotOption.created
ballotOption.updated
eligibleVoter.added
eligibleVoters.resolved
eligibleVoter.excluded
voteCast.cast
voteCast.cancelled
votingResults.calculated
votingResults.published
votingResult.linkedToResolution
```

---

### 22.6. Basic Reports

El módulo puede alimentar reportes:

```text id="s1kqax"
votaciones por periodo
participación por votación
resultados por pregunta
votaciones abiertas
votaciones cerradas
votaciones canceladas
```

---

### 22.7. Fines and Sanctions

No se generan multas automáticas desde votaciones.

Cualquier sanción relacionada con votación requerirá spec separada.

---

### 22.8. Payments and Charges

No se generan cargos financieros desde resultados.

Cualquier cargo aprobado por votación requerirá flujo explícito posterior.

---

## 23. Auditoría

Eventos mínimos:

```text id="m4328d"
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

```text id="hdiihd"
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

```text id="x7xjnx"
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

## 24. Seguridad

### 24.1. Riesgos principales

| Riesgo                                           | Impacto |
| ------------------------------------------------ | ------- |
| Votación cross-tenant                            | Crítico |
| Elegible cross-tenant                            | Crítico |
| Voto cross-tenant                                | Crítico |
| Voto duplicado                                   | Crítico |
| Voto fuera de ventana                            | Alto    |
| Voto de usuario no elegible                      | Alto    |
| Voto por unidad ajena                            | Alto    |
| Voto por proxy no aprobado                       | Alto    |
| Exposición de opción individual en `secretBasic` | Alto    |
| Resultado calculado incorrectamente              | Alto    |
| Resultado publicado sin permiso                  | Alto    |
| Votación pública accidental                      | Crítico |
| Manipulación de estado                           | Alto    |
| Logs con voto individual                         | Alto    |
| Auditoría insuficiente                           | Alto    |
| Uso de resolución como voto legal formal         | Alto    |

---

### 24.2. Controles

```text id="bxrpuq"
tenant isolation
permission guards
own-resource authorization
eligibility validation
one active vote per question per eligible voter
voting window validation
state machine
proxy approved validation
privacy mode enforcement
safe DTOs
content sanitization
deterministic tally
Decimal for weighted values
no public endpoints
audit events
safe logs
safe metrics
OpenAPI negative tests
```

---

## 25. Observabilidad

Logs sugeridos:

```text id="jp1rao"
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

Métricas sugeridas:

```text id="hpozyl"
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

```text id="a54wdl"
votingStatus
privacyMode
eligibilityMode
votingRule
questionType
resultStatus
outcome
```

Labels prohibidos:

```text id="budb9c"
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

## 26. Testing

### 26.1. Unit tests

Probar:

* entidades de votación;
* preguntas;
* opciones;
* elegibles;
* votos;
* resultados;
* reglas de estado;
* reglas de elegibilidad;
* reglas de duplicidad;
* reglas de privacidad;
* cálculo de resultados;
* sanitización.

---

### 26.2. Integration tests

Probar:

* creación de votación;
* creación de preguntas;
* creación de opciones;
* resolución de elegibles;
* apertura de votación;
* emisión de voto;
* cierre;
* cálculo de resultados;
* publicación;
* vínculo con resolución;
* auditoría;
* notificación;
* multitenancy.

---

### 26.3. API tests

Probar:

* endpoints administrativos;
* endpoints `/me`;
* permisos;
* filtros;
* paginación;
* errores;
* OpenAPI.

---

### 26.4. Multitenancy tests

Probar:

```text id="x6fqba"
tenant A no ve votingSessions tenant B
tenant A no usa meetingId tenant B
tenant A no usa questionId tenant B
tenant A no usa optionId tenant B
tenant A no usa eligibleVoterId tenant B
tenant A no usa voteCastId tenant B
tenant A no usa meetingResolutionId tenant B
tenant A no calcula resultados tenant B
tenant A no publica resultados tenant B
```

---

### 26.5. Own-resource tests

Probar:

```text id="v5zkyb"
usuario ve votaciones donde es elegible
usuario no ve votaciones donde no es elegible
owner vota si elegible por ownership
resident vota solo si permitido
usuario no vota por unidad ajena
usuario no vota por persona ajena
usuario no vota dos veces
usuario ve estado de participación propio
usuario no ve votos de terceros
```

---

### 26.6. Privacy tests

Probar:

```text id="qd6ps8"
secretBasic no expone selectedOptionId en logs
secretBasic no expone selectedOptionId en auditoría
secretBasic no expone voto individual a admin estándar
secretBasic resultados son agregados
identified permite consulta individual solo con permiso
```

---

### 26.7. Security tests

Probar:

* no endpoints públicos;
* no voto cross-tenant;
* no elegible cross-tenant;
* no voto duplicado;
* no voto fuera de ventana;
* no voto en sesión cerrada;
* no voto con proxy no aprobado;
* no publicación sin permiso;
* no logs con opción individual en `secretBasic`;
* no resultados públicos;
* OpenAPI no documenta rutas públicas.

---

## 27. Criterios de aceptación globales

La spec se considera implementada si:

* se pueden crear sesiones de votación;
* se pueden asociar a reuniones del mismo tenant;
* se pueden crear preguntas;
* se pueden crear opciones;
* se pueden definir elegibles;
* se pueden resolver elegibles desde reunión/asistencia/propietarios/unidades/roles según política;
* se puede abrir votación;
* se puede emitir voto por elegible;
* se impide voto duplicado;
* se impide voto de no elegible;
* se impide voto fuera de ventana;
* se puede cerrar votación;
* se pueden calcular resultados;
* se pueden publicar resultados a audiencia autorizada;
* se puede consultar votación propia;
* se puede consultar participación propia;
* se puede vincular resultado con resolución;
* se puede cancelar votación;
* se puede anular voto con permiso elevado;
* se auditan operaciones críticas;
* se emiten eventos de notificación;
* no hay endpoints públicos;
* se respeta `privacyMode`;
* no se exponen votos individuales en `secretBasic`;
* no se permite cross-tenant;
* no se ejecutan acciones automáticas;
* OpenAPI está actualizado;
* pruebas unitarias pasan;
* pruebas de integración pasan;
* pruebas API pasan;
* pruebas multitenant pasan;
* pruebas de privacidad pasan;
* pruebas de seguridad pasan;
* CI pasa.

---

## 28. Casos borde

| Caso                                               | Resultado esperado           |
| -------------------------------------------------- | ---------------------------- |
| Crear votación sin título                          | 422                          |
| Crear votación con `tenantId` en body              | 422                          |
| Asociar `meetingId` de otro tenant                 | 403/404                      |
| Crear pregunta sin título                          | 422                          |
| Crear opción duplicada                             | 409                          |
| Abrir votación sin preguntas                       | 422                          |
| Abrir votación sin opciones                        | 422                          |
| Abrir votación sin elegibles                       | 422                          |
| Votar sin ser elegible                             | 403/404                      |
| Votar dos veces la misma pregunta                  | 409                          |
| Votar en sesión `draft`                            | 409                          |
| Votar en sesión `closed`                           | 409                          |
| Votar en sesión `cancelled`                        | 409                          |
| Votar antes de `opensAt`                           | 409                          |
| Votar después de `closesAt`                        | 409                          |
| Opción de otra pregunta                            | 422/403                      |
| Opción de otro tenant                              | 403/404                      |
| Votar por unidad ajena                             | 403/404                      |
| Votar como proxy sin aprobación                    | 422                          |
| Multiple choice bajo mínimo                        | 422                          |
| Multiple choice sobre máximo                       | 422                          |
| Cerrar votación dos veces                          | 409 o idempotente controlado |
| Calcular resultados con sesión abierta             | 409                          |
| Publicar resultados sin cálculo                    | 409                          |
| Resultados secretBasic con identidad               | debe bloquearse              |
| Endpoint público de votación                       | no existe                    |
| OpenAPI documenta endpoint público                 | falla                        |
| Log contiene selectedOptionId en secretBasic       | falla                        |
| Auditoría contiene selectedOptionId en secretBasic | falla                        |

---

## 29. Dependencias hacia specs futuras

Este módulo habilita:

```text id="qgqzdk"
015-certified-minutes
00X-electronic-signatures
00X-advanced-voting-rules
00X-weighted-voting
00X-property-coefficient-management
00X-voting-legal-workflow
00X-voting-appeals
00X-voting-public-verification
00X-blockchain-voting
00X-ai-assisted-minutes
00X-meeting-documents
```

---

## 30. Archivos derivados esperados

```text id="yqqzme"
docs/specs/014-voting-basic/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

---

## 31. Preguntas abiertas

1. ¿El MVP permitirá votaciones independientes o solo asociadas a reuniones?
2. ¿El modo por defecto será `identified` o `secretBasic`?
3. ¿Las votaciones de asamblea deben ser por unidad, propietario o persona?
4. ¿Los residentes podrán votar en algunos tipos de votación?
5. ¿Se permitirá votar por representación usando proxies de `013-meetings-attendance`?
6. ¿Se permitirá cambiar el voto antes del cierre?
7. ¿Se permitirá anular voto administrativo?
8. ¿Los administradores podrán consultar votos individuales en modo `identified`?
9. ¿Quién podrá publicar resultados?
10. ¿Los resultados publicados serán visibles para propietarios, residentes o toda la comunidad?
11. ¿Qué tipos de mayoría se implementarán primero?
12. ¿Se necesita `abstention` obligatoria en todas las votaciones?
13. ¿El voto por unidad debe considerar copropietarios?
14. ¿Qué ocurre si una unidad tiene varios propietarios?
15. ¿Qué ocurre si propietario y residente son la misma persona?
16. ¿Se requiere control de asistencia para votar?
17. ¿Se puede votar sin asistir físicamente?
18. ¿Se debe permitir voto anticipado?
19. ¿Los resultados se vinculan automáticamente o manualmente a resoluciones?
20. ¿Se requiere exportación de resultados?

---

## 32. Decisión inicial para MVP

Para MVP se recomienda:

```text id="qpu7jw"
- Crear votaciones asociadas a reuniones.
- Permitir votaciones independientes solo si el tenant lo habilita.
- Soportar una o varias preguntas.
- Soportar opciones simples.
- Soportar sí/no/abstención.
- Soportar opción única.
- Soportar opción múltiple limitada.
- Definir elegibles manualmente o resolverlos desde propietarios/unidades/reunión/asistencia.
- Priorizar voto por unidad o propietario para asambleas.
- Permitir voto de residentes solo bajo configuración explícita.
- Soportar privacyMode identified.
- Soportar privacyMode secretBasic sin prometer anonimato criptográfico.
- Impedir voto duplicado.
- Impedir voto fuera de ventana.
- Cerrar votación.
- Calcular resultados determinísticos.
- Publicar resultados a audiencia autorizada.
- Vincular resultado a resolución de forma explícita.
- Auditar operaciones críticas.
- Emitir eventos para notificaciones.
- No implementar voto ponderado avanzado.
- No implementar firma electrónica.
- No implementar actas certificadas.
- No implementar voto criptográfico verificable.
- No implementar endpoints públicos.
- No ejecutar acciones automáticas desde resultados.
```

---

## 33. Conclusión

El módulo `014-voting-basic` introduce la capacidad de realizar votaciones internas básicas en RESIDENT Core.

Debe implementarse como un módulo:

```text id="avcwo4"
tenant-scoped
permissioned
eligibility-aware
own-resource protected
state-controlled
privacy-mode aware
duplicate-safe
tally-deterministic
audit-heavy
notification-ready
resolution-linkable
future-legal-ready
```

No debe aceptarse una implementación que permita votaciones cross-tenant, elegibles de otro tenant, votos duplicados, votos fuera de ventana, votos de usuarios no elegibles, votos por unidades ajenas, uso de proxies no aprobados, exposición de voto individual en `secretBasic`, resultados incorrectos, publicación sin permiso, endpoints públicos, logs con opción votada, omisión de auditoría, ejecución automática de resoluciones, generación automática de cargos o multas, mezcla con firma electrónica, mezcla con actas certificadas o presentación del MVP como votación legalmente certificada.
