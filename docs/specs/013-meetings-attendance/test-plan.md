# Test Plan — Spec 013 Meetings and Attendance

## 1. Información del documento

| Campo           | Valor                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                 |
| Spec ID         | 013                                                                                                           |
| Módulo          | Meetings and Attendance                                                                                       |
| Documento       | Test Plan                                                                                                     |
| Ruta            | `docs/specs/013-meetings-attendance/test-plan.md`                                                             |
| Versión         | 0.1                                                                                                           |
| Estado          | Borrador inicial                                                                                              |
| Fecha           | 2026-07-19                                                                                                    |
| Documento base  | `docs/specs/013-meetings-attendance/spec.md`                                                                  |
| Plan técnico    | `docs/specs/013-meetings-attendance/plan.md`                                                                  |
| Modelo de datos | `docs/specs/013-meetings-attendance/data-model.md`                                                            |
| Contrato API    | `docs/specs/013-meetings-attendance/api-contract.md`                                                          |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `007-audit`, `012-communications-notifications` |
| Relacionado con | `008-basic-reports`, `011-fines-sanctions`, futuras specs de votación, firmas, actas PDF, QR e IA             |

---

## 2. Propósito

Este documento define la estrategia de pruebas para el módulo `013-meetings-attendance`.

El plan cubre pruebas unitarias, pruebas de servicios de aplicación, pruebas de repositorios, pruebas de integración, pruebas API, pruebas de autorización, pruebas de recursos propios, pruebas multitenant, pruebas de asistencia, pruebas de representación, pruebas de quórum, pruebas de actas, pruebas de resoluciones, pruebas de seguridad, auditoría, observabilidad, OpenAPI y CI/CD.

Regla central:

```text id="x3hjwp"
El módulo Meetings and Attendance debe impedir reuniones cross-tenant, participantes cross-tenant, asistencia duplicada, acceso a reuniones ajenas, exposición pública de reuniones, modificación no autorizada de asistencia cerrada y omisión de auditoría.
```

---

## 3. Objetivos de prueba

Las pruebas deben validar que el sistema:

* crea reuniones correctamente;
* edita reuniones solo en estados permitidos;
* controla transiciones de estado;
* gestiona agenda;
* gestiona participantes;
* valida referencias por tenant;
* registra asistencia administrativa;
* evita asistencia duplicada;
* registra ausencias, tardanzas, salidas anticipadas y excusas;
* bloquea asistencia en reuniones canceladas o archivadas;
* bloquea cambios ordinarios después del cierre de asistencia;
* permite override solo con permiso;
* gestiona representaciones básicas;
* exige proxy aprobado para asistencia representada;
* calcula quórum de forma determinística;
* no modifica asistencia al calcular quórum;
* gestiona actas preliminares;
* publica actas solo a audiencia autorizada;
* gestiona resoluciones básicas sin tratarlas como votación formal;
* permite consultas administrativas;
* permite consultas propias limitadas;
* no expone participantes completos a usuarios finales;
* no expone asistencia de terceros;
* no expone reuniones en endpoints públicos;
* emite eventos para notificaciones;
* audita operaciones críticas;
* sanitiza contenido;
* no registra datos personales innecesarios en logs o métricas;
* mantiene OpenAPI consistente;
* pasa CI.

---

## 4. Alcance de pruebas

### 4.1. Incluido

```text id="b83c99"
1. Value objects.
2. Entidades de dominio.
3. Máquinas de estado.
4. DTOs y validaciones.
5. Servicios de aplicación.
6. Puertos.
7. Repositorios Prisma.
8. Casos de uso.
9. Controladores REST.
10. Autorización por permisos.
11. Autorización por recurso propio.
12. Multitenancy.
13. Agenda.
14. Participantes.
15. Asistencia.
16. Representaciones.
17. Quórum.
18. Actas.
19. Resoluciones.
20. Integración con notificaciones.
21. Auditoría.
22. Observabilidad.
23. OpenAPI.
24. Smoke tests.
25. CI/CD gates.
```

---

### 4.2. Fuera de alcance de pruebas MVP

```text id="ieoxlc"
- Votación electrónica formal.
- Mayorías legales avanzadas.
- Firma electrónica.
- Actas PDF formales.
- QR real de asistencia.
- Biometría.
- Geolocalización precisa.
- Integración con videoconferencia.
- Grabación.
- Transcripción automática.
- IA con datos reales.
- Multas automáticas por inasistencia.
- Validación legal avanzada de poderes.
- Poderes notariales.
- Chat o comentarios en vivo.
```

---

## 5. Capas de prueba

```text id="j1p24j"
unit
domain
value-object
dto-validation
application-service
use-case
repository-integration
api
authorization
own-resource
multitenancy
attendance
proxy
quorum
minutes
resolution
notification-integration
audit
observability
security
openapi
smoke
ci
```

---

## 6. Datos base de prueba

### 6.1. Tenants

```text id="ud0v4o"
tenantActiveA
tenantActiveB
tenantSuspended
tenantInactive
tenantArchived
```

### 6.2. Usuarios

```text id="m7z7z0"
platformAdmin
tenantAdminA
tenantAdminB
meetingManagerA
meetingManagerB
boardMemberA
committeeMemberA
treasurerA
ownerUserA
residentUserA
ownerResidentUserA
ownerUserB
residentUserB
tenantUserWithoutMeetingPermissionA
tenantUserWithoutMembership
disabledUser
anonymousUser
```

### 6.3. Personas

```text id="cum0cc"
personOwnerA
personResidentA
personOwnerResidentA
personRepresentativeA
personBoardMemberA
personCommitteeMemberA
personOwnerB
personResidentB
personExternalA
personInactiveA
```

### 6.4. Unidades habitacionales

```text id="fpmkfs"
propertyUnitA101
propertyUnitA102
propertyUnitA103
propertyUnitB201
propertyUnitInactiveA
```

### 6.5. Relaciones persona-usuario-unidad

```text id="qvbshz"
ownerUserA -> personOwnerA -> propertyUnitA101 ownership active
residentUserA -> personResidentA -> propertyUnitA101 residency active
ownerResidentUserA -> personOwnerResidentA -> propertyUnitA102 ownership active + residency active
ownerUserB -> personOwnerB -> propertyUnitB201 ownership active
residentUserB -> personResidentB -> propertyUnitB201 residency active
```

### 6.6. Roles

```text id="k2rlok"
tenantAdminRoleA
meetingManagerRoleA
boardMemberRoleA
committeeMemberRoleA
treasurerRoleA
tenantAdminRoleB
meetingManagerRoleB
```

### 6.7. Meetings

```text id="k6ty2n"
meetingDraftAssemblyA
meetingScheduledAssemblyA
meetingCalledAssemblyA
meetingInProgressAssemblyA
meetingAttendanceClosedA
meetingCompletedA
meetingCancelledA
meetingArchivedA
meetingOwnersA
meetingResidentsA
meetingAllTenantUsersA
meetingMixedA
meetingPrivateAdministrativeA
meetingTenantB
```

### 6.8. Agenda

```text id="w317wf"
agendaPreviousMinutesA
agendaFinancialReportA
agendaBudgetApprovalA
agendaMaintenancePlanA
agendaSecurityPlanA
agendaFineReviewA
agendaVariousA
agendaTenantB
```

### 6.9. Participantes

```text id="vg3fjp"
participantOwnersA
participantResidentsA
participantAllTenantUsersA
participantPropertyUnitA101
participantPropertyUnitA102
participantSpecificUserA
participantSpecificPersonA
participantRoleBoardA
participantRoleCommitteeA
participantTenantB
```

### 6.10. Asistencia

```text id="k78g01"
attendanceOwnerPresentA
attendanceResidentLateA
attendanceOwnerAbsentA
attendanceOwnerExcusedA
attendanceUnitA101RepresentedA
attendanceLeftEarlyA
attendanceArchivedA
attendanceTenantB
```

### 6.11. Representaciones

```text id="v12d7b"
proxySubmittedA
proxyApprovedA
proxyRejectedA
proxyCancelledA
proxyArchivedA
proxyTenantB
```

### 6.12. Actas

```text id="towdw9"
minutesDraftA
minutesUnderReviewA
minutesApprovedA
minutesPublishedA
minutesArchivedA
minutesTenantB
```

### 6.13. Resoluciones

```text id="ve1tve"
resolutionDraftA
resolutionRecordedMaintenanceA
resolutionApprovedFinancialA
resolutionCancelledA
resolutionArchivedA
resolutionTenantB
```

---

## 7. Factories de prueba

Deben existir factories para:

```text id="hr4dzz"
createMeeting()
createMeetingAgendaItem()
createMeetingParticipant()
createMeetingAttendance()
createMeetingProxy()
createMeetingMinutes()
createMeetingResolution()

createCreateMeetingDto()
createUpdateMeetingDto()
createScheduleMeetingDto()
createCallMeetingDto()
createCancelMeetingDto()
createCreateAgendaItemDto()
createReorderAgendaDto()
createCreateMeetingParticipantDto()
createReplaceMeetingParticipantsDto()
createRegisterMeetingAttendanceDto()
createUpdateMeetingAttendanceDto()
createCreateMeetingProxyDto()
createCreateMeetingMinutesDto()
createCreateMeetingResolutionDto()

createMeetingActorContext()
createTenantContext()
createOwnMeetingContext()
createQuorumScenario()
```

Reglas:

* Factories deben generar datos sintéticos.
* No usar nombres reales de residentes.
* No usar emails reales.
* No usar teléfonos reales.
* No usar cédulas reales.
* No usar documentos reales.
* No usar secretos.
* Deben permitir crear datos de Tenant A y Tenant B.
* Deben permitir probar cross-tenant.

---

# 8. Unit tests — Value Objects

## 8.1. `MeetingType`

Debe probar:

```text id="q5vimu"
ordinaryAssembly válido
extraordinaryAssembly válido
boardMeeting válido
committeeMeeting válido
informationalMeeting válido
financialMeeting válido
securityMeeting válido
maintenanceMeeting válido
other válido
valor desconocido inválido
valor vacío inválido
```

---

## 8.2. `MeetingModality`

Debe probar:

```text id="olprir"
inPerson válido
virtual válido
hybrid válido
valor desconocido inválido
virtual recomienda virtualMeetingUrl
hybrid recomienda location y virtualMeetingUrl
inPerson recomienda location
```

---

## 8.3. `MeetingStatus`

Debe probar:

```text id="k63wpu"
draft válido
scheduled válido
called válido
inProgress válido
attendanceClosed válido
completed válido
cancelled válido
archived válido
identificación de estados editables
identificación de estados cancelables
identificación de estados que permiten asistencia
identificación de estados terminales
```

---

## 8.4. `MeetingVisibility`

Debe probar:

```text id="dai0ya"
private válido
administrative válido
tenant válido
owners válido
residents válido
mixed válido
no public visibility
```

---

## 8.5. `AgendaItemStatus`

Debe probar:

```text id="hsm33w"
pending válido
inProgress válido
completed válido
skipped válido
archived válido
transiciones válidas
transiciones inválidas
```

---

## 8.6. `ParticipantType`

Debe probar:

```text id="h9s017"
user requiere userId
person requiere personId
propertyUnit requiere propertyUnitId
role requiere roleId
owners no requiere ID
residents no requiere ID
allTenantUsers no requiere ID
boardMembers se resuelve por política
committeeMembers se resuelve por política
combinaciones inválidas rechazadas
```

---

## 8.7. `AttendanceStatus`

Debe probar:

```text id="f4q7l8"
present válido
absent válido
late válido
leftEarly válido
represented válido
excused válido
cancelled válido
archived válido
represented requiere proxy en servicios
leftEarly requiere checkOut
excused recomendado desde absent
```

---

## 8.8. `AttendanceRegistrationMethod`

Debe probar:

```text id="mygxb8"
admin válido
self válido
qr válido pero diferido
import válido pero diferido
system válido
other válido
self requiere política en servicios
```

---

## 8.9. `ProxyStatus`

Debe probar:

```text id="cos3hk"
submitted válido
approved válido
rejected válido
cancelled válido
archived válido
transiciones permitidas
transiciones prohibidas
```

---

## 8.10. `QuorumRuleType`

Debe probar:

```text id="xlva9y"
none válido
participantCount válido
propertyUnitCount válido
percentageOfExpectedParticipants válido
percentageOfPropertyUnits válido
custom válido pero no soportado en MVP
```

---

## 8.11. `MinutesStatus`

Debe probar:

```text id="dr2sjw"
notStarted válido
draft válido
underReview válido
approved válido
published válido
archived válido
transiciones válidas
transiciones inválidas
```

---

## 8.12. `ResolutionStatus`

Debe probar:

```text id="q1lcae"
draft válido
recorded válido
approved válido
cancelled válido
archived válido
transiciones válidas
transiciones inválidas
```

---

## 8.13. `MeetingTitle`

Debe probar:

```text id="pfc4xc"
título válido
título vacío inválido
título con solo espacios inválido
normalización de espacios
longitud máxima
contenido peligroso rechazado o sanitizado
```

---

## 8.14. `MeetingContent`

Debe probar:

```text id="zc1rvq"
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

## 8.15. `QuorumResult`

Debe probar:

```text id="lyhhcd"
resultado con quorumMet true
resultado con quorumMet false
resultado none con null
porcentaje como Decimal/string
valor requerido no negativo
valor calculado no negativo
timestamp de cálculo requerido
```

---

# 9. Unit tests — Entidades de dominio

## 9.1. `Meeting`

Debe probar:

```text id="p525st"
crear Meeting draft válido
rechazar Meeting sin title
rechazar Meeting sin startsAt
rechazar endsAt antes de startsAt
validar modality virtual con virtualMeetingUrl
validar modality inPerson con location recomendado
validar cancellationReason al cancelar
validar calledAt/calledBy al convocar
validar attendanceClosedAt al cerrar asistencia
validar quorum no modificable por cliente
archivedAt representa archivo lógico
```

---

## 9.2. `MeetingAgendaItem`

Debe probar:

```text id="ddvdi1"
crear agenda item válido
order obligatorio
title obligatorio
estimatedMinutes no negativo
status inicial pending
complete cambia estado
skip cambia estado
archive cambia estado
rechazar estado inválido
```

---

## 9.3. `MeetingParticipant`

Debe probar:

```text id="jk6i18"
crear participante user válido
crear participante person válido
crear participante propertyUnit válido
crear participante role válido
crear participante owners válido
crear participante residents válido
crear participante allTenantUsers válido
rechazar user sin userId
rechazar person sin personId
rechazar propertyUnit sin propertyUnitId
rechazar role sin roleId
status inicial invited
response inicial pending
```

---

## 9.4. `MeetingAttendance`

Debe probar:

```text id="h70lxx"
crear asistencia present válida
crear asistencia absent válida
crear asistencia late válida
crear asistencia leftEarly válida
crear asistencia represented válida con proxy
rechazar asistencia sin sujeto
rechazar checkOutAt antes de checkInAt
rechazar represented sin proxy
archivar asistencia
```

---

## 9.5. `MeetingProxy`

Debe probar:

```text id="ft1hrl"
crear proxy submitted válido
rechazar proxy sin representado
rechazar proxy sin representante
aprobar proxy
rechazar proxy con razón
cancelar proxy con razón
rechazar reject sin razón
rechazar cancel sin razón
archivar proxy
```

---

## 9.6. `MeetingMinutes`

Debe probar:

```text id="n7nwsw"
crear acta draft válida
rechazar acta sin title
rechazar acta sin body
sanitizar body
submit review
approve
publish
archive
rechazar publish sin approve si política lo exige
```

---

## 9.7. `MeetingResolution`

Debe probar:

```text id="iuputj"
crear resolución recorded válida
rechazar resolución sin title
rechazar resolución sin description
aprobar resolución
cancelar resolución con razón
rechazar cancel sin razón
archivar resolución
confirmar que no representa votación formal
```

---

# 10. Unit tests — Máquinas de estado

## 10.1. Meeting State Machine

Transiciones válidas:

```text id="lscqrt"
draft -> scheduled
scheduled -> called
called -> inProgress
inProgress -> attendanceClosed
attendanceClosed -> completed
completed -> archived
draft -> cancelled
scheduled -> cancelled
called -> cancelled
cancelled -> archived
```

Transiciones inválidas:

```text id="a6dsq6"
archived -> scheduled
archived -> inProgress
cancelled -> inProgress
completed -> inProgress
draft -> completed
called -> completed sin control permitido
attendanceClosed -> called
inProgress -> draft
```

---

## 10.2. Agenda State Machine

Transiciones válidas:

```text id="zghdb5"
pending -> inProgress
inProgress -> completed
pending -> skipped
completed -> archived
skipped -> archived
```

Transiciones inválidas:

```text id="fvnp9o"
archived -> pending
completed -> inProgress
skipped -> completed
```

---

## 10.3. Participant State Machine

Transiciones válidas:

```text id="br75z8"
invited -> confirmed
invited -> declined
invited -> tentative
confirmed -> attended
confirmed -> absent
invited -> represented
attended -> archived
absent -> archived
represented -> archived
```

Transiciones inválidas:

```text id="p039ng"
archived -> confirmed
declined -> attended sin override
absent -> attended sin override
```

---

## 10.4. Attendance State Machine

Transiciones válidas:

```text id="u4ggd6"
present -> leftEarly
late -> leftEarly
absent -> excused
present -> archived
late -> archived
represented -> archived
```

Transiciones inválidas:

```text id="l32621"
archived -> present
cancelled -> present
leftEarly -> present sin override
```

---

## 10.5. Proxy State Machine

Transiciones válidas:

```text id="g8jm7d"
submitted -> approved
submitted -> rejected
submitted -> cancelled
approved -> archived
rejected -> archived
cancelled -> archived
```

Transiciones inválidas:

```text id="brxgkp"
approved -> rejected
rejected -> approved
archived -> approved
cancelled -> approved
```

---

## 10.6. Minutes State Machine

Transiciones válidas:

```text id="zobb1t"
notStarted -> draft
draft -> underReview
underReview -> approved
approved -> published
draft -> archived
published -> archived
```

Transiciones inválidas:

```text id="dhwrfa"
published -> draft
archived -> published
notStarted -> published
draft -> published si política requiere aprobación
```

---

## 10.7. Resolution State Machine

Transiciones válidas:

```text id="pobrc2"
draft -> recorded
recorded -> approved
draft -> cancelled
recorded -> cancelled
approved -> archived
cancelled -> archived
```

Transiciones inválidas:

```text id="qmle6s"
approved -> cancelled sin permiso especial
archived -> approved
cancelled -> approved
```

---

# 11. DTO validation tests

## 11.1. CreateMeetingDto

Debe validar:

```text id="j1j2hh"
title requerido
meetingType válido
modality válido
visibility válida
startsAt requerido
endsAt posterior a startsAt
timezone válido
quorumRuleType válido
quorumRequiredValue string decimal
rechaza tenantId
rechaza status
rechaza quorumCalculatedValue
rechaza quorumMet
rechaza campos auditables
```

---

## 11.2. UpdateMeetingDto

Debe validar:

```text id="zrh5pe"
campos opcionales válidos
title no vacío si se envía
endsAt posterior a startsAt si ambos se envían
virtualMeetingUrl segura
rechaza tenantId
rechaza status
rechaza createdBy
rechaza archivedAt
rechaza attendanceClosedAt
```

---

## 11.3. Agenda DTOs

Debe validar:

```text id="n4c3rm"
order requerido en create
order entero positivo o cero según política
title requerido
estimatedMinutes no negativo
presenterUserId UUID válido si existe
items de reorder no vacíos
orders no duplicados
agendaItemId UUID válido
rechaza tenantId
```

---

## 11.4. Participant DTOs

Debe validar:

```text id="t2s23t"
participantType válido
user requiere userId
person requiere personId
propertyUnit requiere propertyUnitId
role requiere roleId
owners no debe enviar ID obligatorio
residents no debe enviar ID obligatorio
allTenantUsers no debe enviar ID obligatorio
isRequired boolean
response válido
status válido
rechaza tenantId
```

---

## 11.5. Attendance DTOs

Debe validar:

```text id="vdxptq"
attendanceStatus válido
registrationMethod válido
checkInAt ISO
checkOutAt posterior a checkInAt si aplica
debe existir sujeto
represented requiere proxyId a nivel semántico
notes sanitizadas
rechaza tenantId
rechaza registeredBy
rechaza archivedAt
```

---

## 11.6. Proxy DTOs

Debe validar:

```text id="q95jjh"
representado requerido
representante requerido
UUIDs válidos
documentReference segura
reject requiere reason
cancel requiere reason
rechaza tenantId
rechaza approvedBy
rechaza rejectedBy
rechaza status manual si no aplica
```

---

## 11.7. Minutes DTOs

Debe validar:

```text id="iyqlct"
title requerido
body requerido
summary opcional
body sanitizado
bloqueo script
bloqueo iframe
rechaza tenantId
rechaza status en PATCH genérico
rechaza approvedBy
rechaza publishedAt
```

---

## 11.8. Resolution DTOs

Debe validar:

```text id="kkxvss"
title requerido
description requerida
resolutionType válido
agendaItemId UUID opcional
effectiveFrom ISO opcional
cancel requiere reason
metadata sanitizada
rechaza tenantId
rechaza status manual si no aplica
rechaza campos de votación formal
```

---

# 12. Application service tests

## 12.1. MeetingService

Debe probar:

```text id="a2tz16"
create meeting exitoso
update meeting exitoso
rechazar update en completed
rechazar update en archived
validar fechas
validar modalidad
validar quórum no negativo
auditar create/update
```

---

## 12.2. MeetingStateMachineService

Debe probar:

```text id="f95d31"
transiciones válidas
transiciones inválidas
estados editables
estados cancelables
estados que permiten asistencia
estados terminales
```

---

## 12.3. MeetingAgendaService

Debe probar:

```text id="pmow1j"
crear agenda
actualizar agenda
reordenar agenda
rechazar órdenes duplicadas
completar agenda
saltar agenda
archivar agenda
rechazar agenda de reunión de otro tenant
```

---

## 12.4. MeetingParticipantService

Debe probar:

```text id="c5rrad"
crear participante user
crear participante person
crear participante propertyUnit
crear participante role
crear participante owners
crear participante residents
reemplazar participantes
deduplicar audiencia final
rechazar referencias cross-tenant
auditar cambios
```

---

## 12.5. MeetingAudienceService

Debe probar:

```text id="zbegyy"
owner accede a meeting owners
resident accede a meeting residents
usuario accede a allTenantUsers
usuario accede por role
usuario accede por propertyUnit propia
usuario no accede a propertyUnit ajena
usuario no accede a private administrative
usuario no accede a tenant B
```

---

## 12.6. MeetingAttendanceService

Debe probar:

```text id="ddgpcw"
registrar present
registrar absent
registrar late
registrar leftEarly
registrar represented con proxy aprobado
rechazar represented sin proxy aprobado
rechazar asistencia duplicada
rechazar asistencia en cancelled
rechazar asistencia en archived
rechazar asistencia cerrada sin override
permitir override con permiso
auditar registro y update
```

---

## 12.7. MeetingAttendancePolicyService

Debe probar:

```text id="w4kq46"
self check-in deshabilitado por defecto
self check-in habilitado por política
called permite check-in
inProgress permite check-in
draft no permite check-in
cancelled no permite check-in
attendanceClosed bloquea check-in
override requerido después de cierre
```

---

## 12.8. MeetingProxyService

Debe probar:

```text id="ws9kz8"
crear proxy submitted
aprobar proxy
rechazar proxy con razón
cancelar proxy con razón
rechazar proxy sin representado
rechazar proxy sin representante
rechazar representado de otro tenant
rechazar representante de otro tenant
proxy aprobado usable para attendance represented
proxy rejected no usable
```

---

## 12.9. MeetingQuorumService

Debe probar:

```text id="um8pag"
rule none devuelve null
participantCount true
participantCount false
propertyUnitCount true
propertyUnitCount false
percentageOfExpectedParticipants true
percentageOfExpectedParticipants false
percentageOfPropertyUnits true
percentageOfPropertyUnits false
expectedParticipantCount cero produce error controlado
custom produce unsupported en MVP
usa Decimal/string
no modifica asistencia
audita cálculo
```

---

## 12.10. MeetingMinutesService

Debe probar:

```text id="cp4otf"
crear acta draft
rechazar acta duplicada
actualizar acta
sanitizar contenido
submit review
approve
publish
archive
emitir meeting.minutesPublished
no exponer acta públicamente
```

---

## 12.11. MeetingResolutionService

Debe probar:

```text id="i26hla"
crear resolución
actualizar resolución
aprobar resolución
cancelar con razón
archivar resolución
rechazar agendaItem de otra reunión
rechazar agendaItem de otro tenant
no ejecutar acción automática
no tratar como votación formal
```

---

## 12.12. MeetingNotificationService

Debe probar:

```text id="dh9gwo"
emitir meeting.called
emitir meeting.updated
emitir meeting.cancelled
emitir meeting.minutesPublished
payload mínimo
no incluir participantes completos
no incluir asistencia completa
no incluir acta completa
no enviar email directamente
```

---

## 12.13. MeetingContentSanitizerService

Debe probar:

```text id="n9k755"
sanitiza título
sanitiza descripción
sanitiza agenda
sanitiza notas
sanitiza acta
sanitiza resolución
bloquea script
bloquea iframe
bloquea event handlers
bloquea javascript:
```

---

## 12.14. MeetingAuditService

Debe probar:

```text id="rfg171"
audita meeting.created
audita meeting.called
audita meetingAttendance.registered
audita meetingProxy.approved
audita meeting.quorumCalculated
audita meetingMinutes.published
audita meetingResolution.recorded
metadata sanitizada
sin body completo de acta
sin datos personales innecesarios
```

---

# 13. Repository integration tests

## 13.1. PrismaMeetingRepository

Debe probar:

```text id="yz1ub5"
create meeting
findById tenant A
findById no devuelve tenant B
list con filtros
update meeting
update status
update quorum result
archive
soft delete
```

---

## 13.2. PrismaMeetingAgendaRepository

Debe probar:

```text id="wq52xw"
create agenda item
list by meeting
find agenda by tenant
find agenda no devuelve tenant B
reorder agenda
unique order por meeting
archive agenda
```

---

## 13.3. PrismaMeetingParticipantRepository

Debe probar:

```text id="mbk2ui"
create participant user
create participant person
create participant propertyUnit
create participant role
list by meeting
replace participants
find participant tenant A
find participant no devuelve tenant B
archive participant
```

---

## 13.4. PrismaMeetingAttendanceRepository

Debe probar:

```text id="ka719c"
register attendance
list attendance
find attendance by tenant
find attendance no devuelve tenant B
findActiveBySubject
prevent duplicate by participant
prevent duplicate by user
prevent duplicate by person
prevent duplicate by propertyUnit
prevent duplicate by proxy
update attendance
archive attendance
```

---

## 13.5. PrismaMeetingProxyRepository

Debe probar:

```text id="nxs6m2"
create proxy
find proxy by tenant
find proxy no devuelve tenant B
approve proxy
reject proxy
cancel proxy
archive proxy
findApprovedProxyForSubject
```

---

## 13.6. PrismaMeetingMinutesRepository

Debe probar:

```text id="dd34ry"
create minutes
find by meeting
find by id and tenant
find no devuelve tenant B
prevent duplicate active minutes
update minutes
publish minutes
archive minutes
```

---

## 13.7. PrismaMeetingResolutionRepository

Debe probar:

```text id="dx3fer"
create resolution
list by meeting
find by tenant
find no devuelve tenant B
update resolution
approve resolution
cancel resolution
archive resolution
```

---

# 14. API tests — Meetings administrativas

## 14.1. `GET /api/v1/tenant/meetings`

Debe probar:

```text id="swi43k"
401 sin token
403 sin meetings.read
200 con permiso
paginación
filtro por meetingType
filtro por modality
filtro por status
filtro por visibility
filtro por startsFrom/startsTo
filtro por quorumMet
filtro por minutesStatus
q search
no devuelve tenant B
```

---

## 14.2. `POST /api/v1/tenant/meetings`

Debe probar:

```text id="v2hv6z"
401 sin token
403 sin meetings.create
201 con body válido
422 sin title
422 sin startsAt
422 endsAt antes de startsAt
422 tenantId en body
422 quorumRequiredValue negativo
422 custom si se decide rechazar en create
audita meeting.created
```

---

## 14.3. `GET /api/v1/tenant/meetings/{meetingId}`

Debe probar:

```text id="zmf4k3"
401 sin token
403 sin meetings.read
200 con permiso
404 meeting inexistente
404/403 meeting de tenant B
no expone datos prohibidos
```

---

## 14.4. `PATCH /api/v1/tenant/meetings/{meetingId}`

Debe probar:

```text id="s9zpve"
401 sin token
403 sin meetings.update
200 actualiza draft
200 actualiza scheduled
409 actualiza completed
409 actualiza archived
422 status en body
422 tenantId en body
422 quorumMet en body
422 fechas inválidas
audita meeting.updated
```

---

## 14.5. `POST /schedule`

Debe probar:

```text id="x6nsq9"
200 draft -> scheduled
409 scheduled -> scheduled si no idempotente
409 archived -> scheduled
409 cancelled -> scheduled
audita meeting.scheduled
```

---

## 14.6. `POST /call`

Debe probar:

```text id="m6x1a7"
200 scheduled -> called
422 sin participantes si política lo exige
200 con notifyParticipants true
emite evento meeting.called
no envía email directamente
audita meeting.called
```

---

## 14.7. `POST /start`

Debe probar:

```text id="rhsmv7"
200 called -> inProgress
200 scheduled -> inProgress si política lo permite
409 cancelled -> inProgress
409 archived -> inProgress
audita meeting.started
```

---

## 14.8. `POST /cancel`

Debe probar:

```text id="r7u7dm"
200 draft -> cancelled
200 scheduled -> cancelled
200 called -> cancelled
422 sin reason
409 completed -> cancelled
409 archived -> cancelled
emite evento si notifyParticipants true
audita meeting.cancelled
```

---

## 14.9. `POST /close-attendance`

Debe probar:

```text id="wxmlvs"
200 inProgress -> attendanceClosed
409 draft -> attendanceClosed
409 completed -> attendanceClosed
registra attendanceClosedAt
bloquea cambios ordinarios posteriores
audita meeting.attendanceClosed
```

---

## 14.10. `POST /complete`

Debe probar:

```text id="c1wpgq"
200 inProgress -> completed
200 attendanceClosed -> completed
409 draft -> completed
409 cancelled -> completed
audita meeting.completed
```

---

## 14.11. `POST /archive`

Debe probar:

```text id="kub014"
200 completed -> archived
200 cancelled -> archived
409 draft -> archived
soft delete lógico
no elimina agenda/asistencia/actas/resoluciones
audita meeting.archived
```

---

## 14.12. `POST /calculate-quorum`

Debe probar:

```text id="vxusdl"
200 rule none
200 participantCount
200 propertyUnitCount
200 percentageOfExpectedParticipants
200 percentageOfPropertyUnits
422 custom
422 sin participantes esperados cuando aplica
no modifica asistencia
guarda quorumCalculatedValue
guarda quorumMet
audita meeting.quorumCalculated
```

---

# 15. API tests — Agenda

Debe probar endpoints:

```text id="x0vp93"
GET /api/v1/tenant/meetings/{meetingId}/agenda
POST /api/v1/tenant/meetings/{meetingId}/agenda
GET /api/v1/tenant/meeting-agenda-items/{agendaItemId}
PATCH /api/v1/tenant/meeting-agenda-items/{agendaItemId}
POST /api/v1/tenant/meetings/{meetingId}/agenda/reorder
POST /api/v1/tenant/meeting-agenda-items/{agendaItemId}/complete
POST /api/v1/tenant/meeting-agenda-items/{agendaItemId}/skip
POST /api/v1/tenant/meeting-agenda-items/{agendaItemId}/archive
```

Casos mínimos:

```text id="rjuzal"
401 sin token
403 sin permiso
201 crear item válido
422 title vacío
422 order duplicado
403/404 meeting tenant B
403/404 agenda tenant B
422 presenterUserId tenant B
200 reorder válido
422 reorder con IDs de otra reunión
200 complete
200 skip con reason
200 archive
auditoría por acción
```

---

# 16. API tests — Participantes

Debe probar endpoints:

```text id="fg2slq"
GET /api/v1/tenant/meetings/{meetingId}/participants
POST /api/v1/tenant/meetings/{meetingId}/participants
PUT /api/v1/tenant/meetings/{meetingId}/participants
GET /api/v1/tenant/meeting-participants/{participantId}
PATCH /api/v1/tenant/meeting-participants/{participantId}
POST /api/v1/tenant/meeting-participants/{participantId}/archive
```

Casos mínimos:

```text id="ivul9n"
401 sin token
403 sin permiso
crear participant user válido
crear participant person válido
crear participant propertyUnit válido
crear participant role válido
crear owners válido
crear residents válido
crear allTenantUsers válido
422 user sin userId
422 person sin personId
422 propertyUnit sin propertyUnitId
422 role sin roleId
403 userId tenant B
403 personId tenant B
403 propertyUnitId tenant B
403 roleId tenant B
PUT reemplaza participantes
PUT con notifyParticipants true emite evento
no duplica audiencia final
audita cambios
```

---

# 17. API tests — Asistencia

Debe probar endpoints:

```text id="c148ja"
GET /api/v1/tenant/meetings/{meetingId}/attendance
POST /api/v1/tenant/meetings/{meetingId}/attendance
GET /api/v1/tenant/meeting-attendance/{attendanceId}
PATCH /api/v1/tenant/meeting-attendance/{attendanceId}
POST /api/v1/tenant/meeting-attendance/{attendanceId}/check-out
POST /api/v1/tenant/meeting-attendance/{attendanceId}/excuse
POST /api/v1/tenant/meeting-attendance/{attendanceId}/archive
```

Casos mínimos:

```text id="g3fm2o"
401 sin token
403 sin permiso
201 registrar present
201 registrar absent
201 registrar late
201 registrar represented con proxy approved
422 represented sin proxy
422 proxy no approved
409 asistencia duplicada por participant
409 asistencia duplicada por user
409 asistencia duplicada por person
409 asistencia duplicada por propertyUnit
409 reunión cancelled
409 reunión archived
409 asistencia cerrada sin override
200 asistencia cerrada con override
422 checkOutAt antes de checkInAt
200 check-out cambia a leftEarly
200 excuse desde absent
403/404 attendance tenant B
audita registro/update/check-out/excuse/archive
```

---

# 18. API tests — Representaciones

Debe probar endpoints:

```text id="bdjhbr"
GET /api/v1/tenant/meetings/{meetingId}/proxies
POST /api/v1/tenant/meetings/{meetingId}/proxies
GET /api/v1/tenant/meeting-proxies/{proxyId}
POST /api/v1/tenant/meeting-proxies/{proxyId}/approve
POST /api/v1/tenant/meeting-proxies/{proxyId}/reject
POST /api/v1/tenant/meeting-proxies/{proxyId}/cancel
POST /api/v1/tenant/meeting-proxies/{proxyId}/archive
```

Casos mínimos:

```text id="u49aa0"
401 sin token
403 sin permiso
201 crear proxy válido
422 sin representado
422 sin representante
403 representedPersonId tenant B
403 representedUserId tenant B
403 representedPropertyUnitId tenant B
403 representativePersonId tenant B
403 representativeUserId tenant B
200 approve submitted
409 approve rejected
422 reject sin reason
200 reject con reason
422 cancel sin reason
200 cancel con reason
200 archive
proxy approved usable en represented attendance
proxy rejected no usable
audita cada acción
```

---

# 19. API tests — Actas

Debe probar endpoints:

```text id="fixo6u"
GET /api/v1/tenant/meetings/{meetingId}/minutes
POST /api/v1/tenant/meetings/{meetingId}/minutes
GET /api/v1/tenant/meeting-minutes/{minutesId}
PATCH /api/v1/tenant/meeting-minutes/{minutesId}
POST /api/v1/tenant/meeting-minutes/{minutesId}/submit-review
POST /api/v1/tenant/meeting-minutes/{minutesId}/approve
POST /api/v1/tenant/meeting-minutes/{minutesId}/publish
POST /api/v1/tenant/meeting-minutes/{minutesId}/archive
```

Casos mínimos:

```text id="mz25ak"
401 sin token
403 sin permiso
201 crear acta
422 sin title
422 sin body
409 acta duplicada
200 update draft
409 update published si política lo bloquea
200 submit-review
200 approve
200 publish
publish emite meeting.minutesPublished
publish no crea endpoint público
200 archive
403/404 minutes tenant B
bloquea script en body
audita cambios
```

---

# 20. API tests — Resoluciones

Debe probar endpoints:

```text id="dzlo5m"
GET /api/v1/tenant/meetings/{meetingId}/resolutions
POST /api/v1/tenant/meetings/{meetingId}/resolutions
GET /api/v1/tenant/meeting-resolutions/{resolutionId}
PATCH /api/v1/tenant/meeting-resolutions/{resolutionId}
POST /api/v1/tenant/meeting-resolutions/{resolutionId}/approve
POST /api/v1/tenant/meeting-resolutions/{resolutionId}/cancel
POST /api/v1/tenant/meeting-resolutions/{resolutionId}/archive
```

Casos mínimos:

```text id="fr4agb"
401 sin token
403 sin permiso
201 crear resolución
422 sin title
422 sin description
403/422 agendaItem de otra reunión
403/422 agendaItem tenant B
200 update
200 approve
422 cancel sin reason
200 cancel con reason
200 archive
no ejecuta acciones automáticas
no crea voto formal
audita cambios
```

---

# 21. API tests — Endpoints `/me`

## 21.1. `GET /api/v1/me/meetings`

Debe probar:

```text id="u3t0vy"
401 sin token
403 sin membership
200 owner ve meetings owners
200 resident ve meetings residents
200 usuario ve allTenantUsers
200 usuario ve meeting por role
200 usuario ve meeting por propertyUnit propia
no ve private administrative
no ve propertyUnit ajena
no ve tenant B
no devuelve participantes completos
no devuelve asistencia de terceros
```

---

## 21.2. `GET /api/v1/me/meetings/{meetingId}`

Debe probar:

```text id="au65mm"
200 reunión propia
403/404 reunión ajena
403/404 meeting tenant B
DTO minimizado
sin metadata interna
sin auditoría
```

---

## 21.3. `GET /api/v1/me/meetings/{meetingId}/agenda`

Debe probar:

```text id="eu8677"
200 agenda de reunión propia
403/404 reunión ajena
no devuelve notes internas si política las oculta
```

---

## 21.4. `GET /api/v1/me/meetings/{meetingId}/attendance`

Debe probar:

```text id="w6rsig"
200 mi asistencia
404 si no existe asistencia propia
no devuelve asistencia de terceros
no devuelve registeredBy
no devuelve notes administrativas
```

---

## 21.5. `POST /api/v1/me/meetings/{meetingId}/attendance/check-in`

Debe probar:

```text id="vjrn3o"
409 si self check-in deshabilitado
201 si self check-in habilitado
403 propertyUnit ajena
403 person ajena
409 asistencia duplicada
409 attendanceClosed
409 meeting cancelled
201 status present
registrationMethod self
audita meetingAttendance.registered
```

---

## 21.6. `GET /api/v1/me/meetings/{meetingId}/minutes`

Debe probar:

```text id="xw8m4p"
200 acta published autorizada
404 acta draft
404 acta underReview
403/404 reunión ajena
no metadata interna
```

---

## 21.7. `GET /api/v1/me/meetings/{meetingId}/resolutions`

Debe probar:

```text id="v48efc"
200 resoluciones autorizadas
403/404 reunión ajena
no metadata interna
no datos de votación formal
```

---

## 21.8. `GET /api/v1/me/meeting-proxies`

Debe probar:

```text id="iyd84h"
200 lista proxies propios
no muestra proxies ajenos
no muestra tenant B
DTO minimizado
```

---

## 21.9. `POST /api/v1/me/meetings/{meetingId}/proxies`

Debe probar:

```text id="c57hkq"
201 proxy propio submitted
403 representedPropertyUnitId ajena
403 representedPersonId ajena
422 sin representante
403/404 reunión ajena
requiere aprobación administrativa
audita meetingProxy.created
```

---

# 22. Authorization tests

## 22.1. Sin autenticación

Todos los endpoints privados deben devolver:

```text id="mzvzqn"
401 UNAUTHORIZED
```

para `anonymousUser`.

---

## 22.2. Usuario sin membership

Debe devolver:

```text id="hx1gi5"
403 FORBIDDEN
```

o error equivalente de tenant access para `tenantUserWithoutMembership`.

---

## 22.3. Usuario disabled

Debe devolver:

```text id="fut0ym"
403 FORBIDDEN
```

o error de usuario inactivo.

---

## 22.4. Usuario sin permiso

Debe devolver:

```text id="rcv5aq"
403 FORBIDDEN
```

Ejemplos:

```text id="l5709w"
sin meetings.create no crea reunión
sin meetings.update no edita reunión
sin meetingAttendance.create no registra asistencia
sin meetingAttendance.override no modifica asistencia cerrada
sin meetingMinutes.publish no publica acta
sin meetingQuorum.calculate no calcula quórum
```

---

## 22.5. PlatformAdmin

Debe probar:

```text id="qdm1am"
no accede automáticamente a contenido interno de tenants
acceso excepcional requiere permiso explícito
acceso excepcional debe auditarse
```

---

# 23. Multitenancy tests

Debe probar aislamiento en todas las entidades:

```text id="rj65gm"
tenant A no ve meetings tenant B
tenant A no ve agenda tenant B
tenant A no ve participants tenant B
tenant A no ve attendance tenant B
tenant A no ve proxies tenant B
tenant A no ve minutes tenant B
tenant A no ve resolutions tenant B
tenant A no modifica meetings tenant B
tenant A no cancela meetings tenant B
tenant A no calcula quorum tenant B
tenant A no archiva meetings tenant B
```

Debe probar referencias cross-tenant:

```text id="p77ueg"
tenant A no usa userId tenant B
tenant A no usa personId tenant B
tenant A no usa propertyUnitId tenant B
tenant A no usa roleId tenant B
tenant A no usa participantId tenant B
tenant A no usa proxyId tenant B
tenant A no usa agendaItemId tenant B
tenant A no usa minutesId tenant B
tenant A no usa resolutionId tenant B
```

Patrones prohibidos en repositorios:

```typescript id="x8lj1e"
prisma.meeting.findUnique({ where: { id: meetingId } });
prisma.meetingAttendance.findUnique({ where: { id: attendanceId } });
prisma.meetingProxy.findUnique({ where: { id: proxyId } });
```

Patrones requeridos:

```typescript id="v5fcdc"
prisma.meeting.findFirst({
  where: {
    id: meetingId,
    tenantId: currentTenant.id
  }
});
```

---

# 24. Own-resource tests

Debe probar:

```text id="s89f1l"
ownerUserA ve meetingOwnersA
residentUserA ve meetingResidentsA
ownerResidentUserA ve owners y residents
tenant user ve allTenantUsers
boardMemberA ve meeting por boardMembers/role
committeeMemberA ve meeting por committeeMembers/role
ownerUserA ve reunión propertyUnitA101
ownerUserA no ve reunión propertyUnitA102 si no tiene relación
residentUserA no ve meetingPrivateAdministrativeA
ownerUserA no ve asistencia de residentUserA si no corresponde
residentUserA no ve asistencia de ownerUserA si no corresponde
ownerUserA no crea proxy para propertyUnitA102
ownerUserA no consulta acta no publicada
ownerUserA consulta acta published si pertenece a audiencia
```

---

# 25. Attendance-specific tests

## 25.1. Estados permitidos

Debe probar:

```text id="mdpk9a"
draft no permite asistencia
scheduled no permite asistencia salvo política explícita
called permite asistencia
inProgress permite asistencia
attendanceClosed requiere override
completed no permite asistencia ordinaria
cancelled no permite asistencia
archived no permite asistencia
```

---

## 25.2. Duplicidad

Debe probar duplicidad por:

```text id="ok6c8s"
participantId
userId
personId
propertyUnitId
proxyId
```

Resultado esperado:

```text id="itstgt"
409 MEETING_ATTENDANCE_DUPLICATE
```

---

## 25.3. Check-in y check-out

Debe probar:

```text id="er6q3f"
present requiere checkInAt según política
late permite checkInAt tardío
checkOutAt posterior a checkInAt
leftEarly queda al hacer check-out
check-out sin check-in se rechaza según política
```

---

## 25.4. Excusas

Debe probar:

```text id="pigww4"
absent -> excused permitido
present -> excused rechazado en MVP
late -> excused rechazado en MVP
reason requerido si política lo exige
auditoría de excusa
```

---

# 26. Proxy-specific tests

Debe probar:

```text id="o6jo5z"
proxy submitted no permite attendance represented
proxy approved permite attendance represented
proxy rejected no permite attendance represented
proxy cancelled no permite attendance represented
proxy archived no permite attendance represented
representado requerido
representante requerido
representado tenant B rechazado
representante tenant B rechazado
documentReference no acepta URL pública con token
documentReference no acepta credenciales
rechazo requiere reason
cancelación requiere reason
```

---

# 27. Quorum tests

## 27.1. Escenarios

### Escenario A — `none`

```text id="tq1avc"
quorumRuleType = none
expected result: quorumCalculatedValue = null, quorumMet = null
```

### Escenario B — `participantCount`

```text id="ufc8nb"
quorumRequiredValue = 10
presentParticipantCount = 12
expected quorumMet = true
```

### Escenario C — `participantCount` insuficiente

```text id="dx1nfc"
quorumRequiredValue = 10
presentParticipantCount = 8
expected quorumMet = false
```

### Escenario D — `propertyUnitCount`

```text id="tv11ub"
quorumRequiredValue = 20
presentOrRepresentedPropertyUnitCount = 21
expected quorumMet = true
```

### Escenario E — `percentageOfExpectedParticipants`

```text id="abjl4e"
expectedParticipantCount = 40
presentParticipantCount = 20
quorumRequiredValue = 50.00
expected quorumCalculatedValue = 50.00
expected quorumMet = true
```

### Escenario F — `percentageOfPropertyUnits`

```text id="mupq22"
expectedPropertyUnitCount = 80
presentOrRepresentedPropertyUnitCount = 40
quorumRequiredValue = 50.00
expected quorumCalculatedValue = 50.00
expected quorumMet = true
```

### Escenario G — cero participantes

```text id="g9d9sf"
expectedParticipantCount = 0
expected error MEETING_QUORUM_NO_EXPECTED_PARTICIPANTS
```

### Escenario H — custom

```text id="hnl1gp"
quorumRuleType = custom
expected error MEETING_QUORUM_RULE_UNSUPPORTED
```

---

## 27.2. Reglas de cálculo

Debe probar:

```text id="m4bh18"
present cuenta
late cuenta
represented cuenta
absent no cuenta
excused no cuenta
cancelled no cuenta
archived no cuenta
quórum no modifica attendance
quórum guarda quorumCalculatedAt
quórum audita meeting.quorumCalculated
porcentajes salen como string decimal
no usar float/double persistido
```

---

# 28. Minutes tests

Debe probar:

```text id="kcdnyh"
crear acta única por reunión
rechazar segunda acta activa
actualizar acta draft
sanitizar HTML
bloquear scripts
submit-review cambia a underReview
approve cambia a approved
publish cambia a published
publish registra publishedAt
publish emite meeting.minutesPublished
publish no expone endpoint público
archive cambia a archived
usuario own ve solo published autorizada
usuario own no ve draft/underReview
```

---

# 29. Resolution tests

Debe probar:

```text id="lmfug5"
crear resolución recorded
crear resolución con agendaItem válida
rechazar agendaItem de otra reunión
rechazar agendaItem de otro tenant
actualizar resolución editable
aprobar resolución
cancelar resolución con razón
rechazar cancelar sin razón
archivar resolución
resolución no crea voto
resolución no ejecuta acciones automáticas
resolución no genera cargo/multa/pago
```

---

# 30. Notification integration tests

Debe probar integración con `012-communications-notifications` mediante puerto mock.

Eventos:

```text id="rw31pw"
meeting.called
meeting.updated
meeting.cancelled
meeting.minutesPublished
```

Casos:

```text id="fzf1xf"
call meeting con notifyParticipants true invoca MeetingNotificationPort
call meeting con notifyParticipants false no invoca port
cancel meeting con notifyParticipants true invoca port
publish minutes con notifyAudience true invoca port
payload mínimo
payload contiene sourceType=meeting
payload contiene sourceId=meetingId
payload contiene actionUrl
payload no contiene participantes completos
payload no contiene asistencia completa
payload no contiene acta completa
fallo de notification port no revierte reunión salvo política crítica explícita
```

---

# 31. Audit tests

Debe verificar emisión de eventos:

```text id="qadnek"
meeting.created
meeting.updated
meeting.scheduled
meeting.called
meeting.started
meeting.cancelled
meeting.attendanceClosed
meeting.completed
meeting.archived
meeting.quorumCalculated
meetingAgenda.created
meetingAgenda.updated
meetingAgenda.reordered
meetingAgenda.completed
meetingAgenda.skipped
meetingAgenda.archived
meetingParticipant.added
meetingParticipant.updated
meetingParticipant.archived
meetingAttendance.registered
meetingAttendance.updated
meetingAttendance.checkedOut
meetingAttendance.excused
meetingAttendance.archived
meetingProxy.created
meetingProxy.approved
meetingProxy.rejected
meetingProxy.cancelled
meetingProxy.archived
meetingMinutes.created
meetingMinutes.updated
meetingMinutes.submittedReview
meetingMinutes.approved
meetingMinutes.published
meetingMinutes.archived
meetingResolution.recorded
meetingResolution.updated
meetingResolution.approved
meetingResolution.cancelled
meetingResolution.archived
```

Metadata permitida:

```text id="cem6kx"
meetingId
agendaItemId
participantId
attendanceId
proxyId
minutesId
resolutionId
meetingType
meetingStatus
attendanceStatus
fromStatus
toStatus
propertyUnitId
personId
userId
quorumRuleType
quorumMet
traceId
```

Metadata prohibida:

```text id="yvz8bg"
payload completo
body completo del acta
emails completos
teléfonos completos
tokens
secretos
cookies
Authorization header
documentos completos
poderes completos
datos personales innecesarios
stack trace
```

---

# 32. Observability tests

## 32.1. Logs

Debe probar que logs incluyan:

```text id="s72ud8"
traceId
requestId
action
outcome
status
durationMs
errorCode cuando aplica
```

No deben incluir:

```text id="sf852f"
Authorization header
tokens
cookies
secretos
body completo de acta
emails completos
teléfonos completos
documentos completos
stack trace en producción
```

---

## 32.2. Métricas

Debe probar métricas:

```text id="l05suv"
meetings_created_total
meetings_called_total
meetings_started_total
meetings_completed_total
meetings_cancelled_total
meeting_attendance_registered_total
meeting_quorum_calculated_total
meeting_quorum_met_total
meeting_minutes_published_total
meeting_resolutions_recorded_total
```

Labels permitidos:

```text id="rg292y"
meetingType
meetingStatus
modality
attendanceStatus
quorumMet
outcome
```

Labels prohibidos:

```text id="xs8gxr"
tenantId
meetingId
personId
userId
propertyUnitId
attendanceId
proxyId
email
phone
traceId
ipAddress
```

---

# 33. Security tests

Debe probar:

```text id="gk47vy"
no public endpoints for meetings
no public endpoints for attendance
no public endpoints for minutes
no public endpoints for resolutions
no public endpoints for participants
no meeting cross-tenant
no participant cross-tenant
no attendance cross-tenant
no proxy cross-tenant
no minutes cross-tenant
no resolution cross-tenant
no user sees private administrative meeting
no user sees third-party attendance
no user self-check-in for other property unit
no update closed attendance without override
no represented attendance without approved proxy
no script in minutes
no script in agenda
no action by disabled user
no tenantId accepted in body
no sensitive logs
safe error messages
```

---

# 34. Public endpoint negative tests

OpenAPI y routing no deben permitir:

```text id="yrdzif"
GET /api/v1/public/tenants/{slug}/meetings
GET /api/v1/public/tenants/{slug}/meetings/{meetingId}
GET /api/v1/public/tenants/{slug}/meetings/{meetingId}/attendance
GET /api/v1/public/tenants/{slug}/meetings/{meetingId}/minutes
GET /api/v1/public/tenants/{slug}/meetings/{meetingId}/resolutions
POST /api/v1/public/tenants/{slug}/meetings
POST /api/v1/public/tenants/{slug}/meetings/{meetingId}/attendance
```

Resultado esperado:

```text id="lf0u51"
404 route not found
```

o equivalente, sin exponer información interna.

---

# 35. OpenAPI tests

Debe verificar:

## 35.1. Tags

```text id="yqkbcj"
Meetings
Meeting Agenda
Meeting Participants
Meeting Attendance
Meeting Proxies
Meeting Minutes
Meeting Resolutions
My Meetings
```

---

## 35.2. Extensiones requeridas

Para endpoints tenant:

```yaml id="wmedfb"
x-tenant-scope: true
x-auth-required: true
x-required-permission: meetings.create
x-audit-event: meeting.created
```

Para endpoints `/me`:

```yaml id="rg4zn0"
x-tenant-scope: true
x-auth-required: true
x-own-resource: true
x-required-permission: meetingAttendance.read.own
```

Para asistencia:

```yaml id="t7l0er"
x-attendance-controlled: true
```

Para quórum:

```yaml id="wmebem"
x-quorum-calculation: deterministic
```

Para actas:

```yaml id="lc1lup"
x-private-document: true
```

---

## 35.3. Endpoints prohibidos

OpenAPI no debe documentar:

```text id="o4khmr"
GET /api/v1/public/tenants/{slug}/meetings
GET /api/v1/public/tenants/{slug}/meetings/{meetingId}
GET /api/v1/public/tenants/{slug}/meetings/{meetingId}/attendance
GET /api/v1/public/tenants/{slug}/meetings/{meetingId}/minutes
GET /api/v1/public/tenants/{slug}/meetings/{meetingId}/resolutions
POST /api/v1/public/tenants/{slug}/meetings
POST /api/v1/public/tenants/{slug}/meetings/{meetingId}/attendance
```

---

# 36. Performance tests

## 36.1. Objetivo MVP

```text id="x610wz"
p95 < 700 ms para listados paginados de reuniones, agenda, participantes y asistencia con filtros comunes.
```

---

## 36.2. Escenarios

Debe medir:

```text id="tetdhp"
GET /tenant/meetings con 1.000 reuniones por tenant
GET /tenant/meetings/{meetingId}/attendance con 500 registros
GET /tenant/meetings/{meetingId}/participants con 500 participantes
GET /me/meetings con audiencia mixta
POST /calculate-quorum con 500 asistencias
```

---

## 36.3. Validaciones

```text id="ihyg2e"
paginación obligatoria
pageSize máximo 100
sin N+1 evidente
índices usados
no cargar acta completa en listados
no cargar asistencia completa en listado de reuniones
DTOs minimizados
```

---

# 37. Smoke tests

Debe ejecutarse flujo mínimo:

```text id="rf4dgd"
1. GET /api/v1/health
2. POST /api/v1/tenant/meetings
3. POST /api/v1/tenant/meetings/{meetingId}/agenda
4. PUT /api/v1/tenant/meetings/{meetingId}/participants
5. POST /api/v1/tenant/meetings/{meetingId}/schedule
6. POST /api/v1/tenant/meetings/{meetingId}/call
7. GET /api/v1/me/meetings
8. POST /api/v1/tenant/meetings/{meetingId}/start
9. POST /api/v1/tenant/meetings/{meetingId}/attendance
10. POST /api/v1/tenant/meetings/{meetingId}/calculate-quorum
11. POST /api/v1/tenant/meetings/{meetingId}/close-attendance
12. POST /api/v1/tenant/meetings/{meetingId}/complete
13. POST /api/v1/tenant/meetings/{meetingId}/minutes
14. POST /api/v1/tenant/meeting-minutes/{minutesId}/submit-review
15. POST /api/v1/tenant/meeting-minutes/{minutesId}/approve
16. POST /api/v1/tenant/meeting-minutes/{minutesId}/publish
17. GET /api/v1/me/meetings/{meetingId}/minutes
18. POST /api/v1/tenant/meetings/{meetingId}/resolutions
19. GET /api/v1/me/meetings/{meetingId}/resolutions
20. GET /api/v1/public/tenants/{slug}/meetings debe no existir
```

---

# 38. Comandos sugeridos

## 38.1. Comandos específicos

```bash id="vk4g7y"
npm run test:meetings
npm run test:meetings:unit
npm run test:meetings:domain
npm run test:meetings:dto
npm run test:meetings:application
npm run test:meetings:repositories
npm run test:meetings:api
npm run test:meetings:authorization
npm run test:meetings:own-resource
npm run test:meetings:multitenancy
npm run test:meetings:attendance
npm run test:meetings:proxy
npm run test:meetings:quorum
npm run test:meetings:minutes
npm run test:meetings:resolutions
npm run test:meetings:notifications
npm run test:meetings:audit
npm run test:meetings:observability
npm run test:meetings:security
npm run test:meetings:openapi
npm run test:meetings:smoke
```

---

## 38.2. Comandos generales

```bash id="oq27pg"
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

# 39. CI/CD gates

El pipeline debe fallar si:

```text id="i83g4v"
lint falla
typecheck falla
unit tests fallan
DTO validation tests fallan
repository tests fallan
API tests fallan
authorization tests fallan
own-resource tests fallan
multitenancy tests fallan
attendance duplicate tests fallan
proxy validation tests fallan
quorum tests fallan
minutes privacy tests fallan
resolution tests fallan
notification integration tests fallan
audit tests fallan
observability tests fallan
security tests fallan
OpenAPI validation falla
OpenAPI documenta endpoints públicos prohibidos
build falla
```

---

# 40. Coverage mínimo recomendado

```text id="yudkl6"
Unit tests: >= 85%
Application services: >= 85%
Use cases: >= 85%
Repositories críticos: >= 80%
API endpoints críticos: 100% de rutas definidas
Authorization tests: 100% de permisos críticos
Multitenancy tests: 100% de entidades tenant-scoped
Security tests: 100% de reglas críticas
```

Regla:

```text id="td93sn"
La cobertura numérica no reemplaza pruebas de reglas críticas de negocio, multitenancy y autorización.
```

---

# 41. Matriz de trazabilidad funcional

| Requisito                   | Prueba principal                              |
| --------------------------- | --------------------------------------------- |
| Crear reuniones             | API + use-case + repository                   |
| Editar reuniones            | API + state machine                           |
| Programar reunión           | API + state machine + audit                   |
| Convocar reunión            | API + participants + notification integration |
| Iniciar reunión             | API + state machine                           |
| Cancelar reunión            | API + reason required + audit                 |
| Cerrar asistencia           | API + attendance lock                         |
| Completar reunión           | API + state machine                           |
| Archivar reunión            | API + soft delete                             |
| Gestionar agenda            | API + repository + state                      |
| Gestionar participantes     | API + cross-tenant validation                 |
| Registrar asistencia        | API + duplicate prevention                    |
| Registrar ausencia          | API + attendance status                       |
| Registrar tardanza          | API + attendance status                       |
| Registrar salida anticipada | API + check-out                               |
| Gestionar proxy             | API + proxy state + tenant validation         |
| Calcular quórum             | service + API + Decimal                       |
| Consultar propias           | `/me` + own-resource                          |
| Registrar acta              | API + sanitizer                               |
| Publicar acta               | API + notification integration                |
| Registrar resolución        | API + no voting formal                        |
| Auditar                     | audit tests                                   |
| No endpoints públicos       | route + OpenAPI negative tests                |

---

# 42. Riesgos cubiertos por pruebas

| Riesgo                              | Pruebas                             |
| ----------------------------------- | ----------------------------------- |
| Reunión cross-tenant                | Multitenancy                        |
| Participante cross-tenant           | Participant API + service           |
| Asistencia cross-tenant             | Attendance API + repository         |
| Asistencia duplicada                | Attendance duplicate tests          |
| Usuario ve reunión ajena            | Own-resource                        |
| Usuario ve asistencia de terceros   | `/me` privacy                       |
| Proxy inválido                      | Proxy tests                         |
| Proxy cross-tenant                  | Proxy security                      |
| Quórum incorrecto                   | Quorum scenarios                    |
| Acta con script                     | Sanitizer/security                  |
| Acta pública accidental             | Public negative tests               |
| Reunión pública accidental          | Public negative tests               |
| Modificación de asistencia cerrada  | Attendance lock                     |
| Notificación a audiencia equivocada | Notification integration + audience |
| Logs con datos personales           | Observability tests                 |
| OpenAPI inseguro                    | OpenAPI negative tests              |

---

# 43. No aceptación

La implementación no debe aceptarse si:

```text id="dr33z5"
permite reuniones cross-tenant
permite participantes de otro tenant
permite asistencia de otro tenant
permite asistencia duplicada
permite proxy cross-tenant
permite attendance represented sin proxy approved
permite modificar asistencia cerrada sin override
permite usuario ver reunión ajena
permite usuario ver asistencia de terceros
permite usuario crear proxy de unidad ajena
expone reuniones en /api/v1/public
expone actas en /api/v1/public
expone asistencia en /api/v1/public
documenta endpoints públicos prohibidos
usa float/double para quórum persistido
calcula quórum modificando asistencia
omite auditoría de operaciones críticas
guarda body completo de acta en logs
omite sanitización de actas
trata resoluciones como votación formal
genera multas automáticas por inasistencia
implementa QR real sin spec
implementa IA con datos reales
```

---

# 44. Resultado esperado

Al completar este plan de pruebas, el módulo `013-meetings-attendance` tendrá validación suficiente para asegurar que:

```text id="xc13zx"
- las reuniones están aisladas por tenant;
- los participantes están validados por tenant;
- la asistencia es privada y consistente;
- no existen duplicados activos de asistencia;
- las representaciones son básicas pero controladas;
- el quórum se calcula de forma determinística;
- las actas son privadas y sanitizadas;
- las resoluciones son trazables y no equivalen a votación formal;
- las consultas propias no exponen datos de terceros;
- no existen endpoints públicos de reuniones;
- las operaciones críticas se auditan;
- logs y métricas no filtran datos personales;
- OpenAPI refleja el contrato real;
- CI bloquea regresiones críticas.
```

---

## 45. Decisión final del plan de pruebas

El módulo `013-meetings-attendance` debe probarse como un módulo sensible, operativo y auditable.

La prioridad de pruebas debe ser:

```text id="s69psp"
1. Multitenancy.
2. Autorización.
3. Recursos propios.
4. Estado de reunión.
5. Integridad de asistencia.
6. Representaciones.
7. Quórum.
8. Privacidad de actas.
9. No exposición pública.
10. Auditoría.
```

Sin estas pruebas, el módulo no debe pasar a implementación productiva.
