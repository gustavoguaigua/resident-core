# Security Notes — Spec 013 Meetings and Attendance

## 1. Información del documento

| Campo           | Valor                                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                       |
| Spec ID         | 013                                                                                                                 |
| Módulo          | Meetings and Attendance                                                                                             |
| Documento       | Security Notes                                                                                                      |
| Ruta            | `docs/specs/013-meetings-attendance/security-notes.md`                                                              |
| Versión         | 0.1                                                                                                                 |
| Estado          | Borrador inicial                                                                                                    |
| Fecha           | 2026-07-19                                                                                                          |
| Documento base  | `docs/specs/013-meetings-attendance/spec.md`                                                                        |
| Plan técnico    | `docs/specs/013-meetings-attendance/plan.md`                                                                        |
| Modelo de datos | `docs/specs/013-meetings-attendance/data-model.md`                                                                  |
| Contrato API    | `docs/specs/013-meetings-attendance/api-contract.md`                                                                |
| Plan de pruebas | `docs/specs/013-meetings-attendance/test-plan.md`                                                                   |
| Tareas          | `docs/specs/013-meetings-attendance/tasks.md`                                                                       |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `007-audit`, `012-communications-notifications`       |
| Relacionado con | `008-basic-reports`, `011-fines-sanctions`, futuras specs de votación, firmas, actas PDF, QR, automatizaciones e IA |

---

## 2. Propósito

Este documento define las notas de seguridad específicas del módulo `013-meetings-attendance`.

El módulo gestiona reuniones, asambleas, agenda, participantes, asistencia, ausencias, representaciones básicas, cálculo de quórum, actas preliminares y resoluciones básicas.

Regla central:

```text id="okzi4c"
Toda reunión, participante, asistencia, representación, acta o resolución debe proteger tenant isolation, autorización por permisos, autorización por recurso propio, privacidad de asistentes, integridad de quórum, trazabilidad auditable y ausencia de exposición pública.
```

---

## 3. Naturaleza de seguridad del módulo

El módulo `Meetings and Attendance` debe considerarse sensible porque puede contener:

```text id="b7q4p6"
datos personales de propietarios y residentes
relaciones entre personas y unidades habitacionales
agenda interna del conjunto
asistencia a reuniones
ausencias
representaciones o delegaciones
actas preliminares
resoluciones internas
información financiera tratada en reunión
información de multas o sanciones tratada en reunión
información de seguridad comunitaria
eventos auditables
datos usados para reportes administrativos
```

Por tanto, el módulo debe proteger:

```text id="cn6z57"
tenant isolation
meeting confidentiality
participant privacy
attendance privacy
own-resource boundaries
proxy/delegation integrity
quorum integrity
minutes confidentiality
resolution traceability
content sanitization
auditability
safe notifications
safe logs
safe metrics
no public exposure
```

---

## 4. Principios de seguridad

### 4.1. Tenant isolation obligatorio

Todas las tablas del módulo deben contener `tenant_id`.

Aplica a:

```text id="d4og00"
meetings
meeting_agenda_items
meeting_participants
meeting_attendance
meeting_proxies
meeting_minutes
meeting_resolutions
```

Regla obligatoria:

```text id="lfm89k"
resource.tenantId == currentTenant.id
```

No se acepta:

```text id="obuqxi"
consultar meeting solo por id
consultar agendaItem solo por id
consultar participant solo por id
consultar attendance solo por id
consultar proxy solo por id
consultar minutes solo por id
consultar resolution solo por id
usar userId de otro tenant
usar personId de otro tenant
usar propertyUnitId de otro tenant
usar roleId de otro tenant
usar participantId de otro tenant
usar proxyId de otro tenant
usar agendaItemId de otro tenant
usar minutesId de otro tenant
usar resolutionId de otro tenant
```

---

### 4.2. Keycloak autentica; RESIDENT Core autoriza

La autenticación no concede acceso automático a reuniones.

Regla:

```text id="ixma7e"
Keycloak autentica la identidad; RESIDENT Core autoriza tenant, membership, permiso, audiencia, recurso propio, estado y regla de negocio.
```

El módulo debe validar:

```text id="azkdjc"
usuario autenticado
usuario activo
membership activa
tenant activo
permiso funcional
acceso al recurso
audiencia de reunión
relación usuario-persona-unidad
estado de reunión
estado de asistencia
estado de proxy
estado de acta
estado de resolución
```

---

### 4.3. No exposición pública en MVP

MVP no expone reuniones en `/api/v1/public`.

Rutas prohibidas:

```text id="gp426i"
GET /api/v1/public/tenants/{slug}/meetings
GET /api/v1/public/tenants/{slug}/meetings/{meetingId}
GET /api/v1/public/tenants/{slug}/meetings/{meetingId}/agenda
GET /api/v1/public/tenants/{slug}/meetings/{meetingId}/participants
GET /api/v1/public/tenants/{slug}/meetings/{meetingId}/attendance
GET /api/v1/public/tenants/{slug}/meetings/{meetingId}/minutes
GET /api/v1/public/tenants/{slug}/meetings/{meetingId}/resolutions
POST /api/v1/public/tenants/{slug}/meetings
POST /api/v1/public/tenants/{slug}/meetings/{meetingId}/attendance
```

Cualquier necesidad futura de publicación pública de reuniones debe definirse en una spec separada.

---

### 4.4. Endpoints `/me` con minimización

Los endpoints `/me` deben devolver solo información relacionada con el usuario autenticado.

Regla conceptual:

```text id="n90foq"
actorUserId -> personIds -> propertyUnitIds -> roles -> meeting audience
```

Un usuario final no debe recibir:

```text id="kr826p"
participantes completos
asistencia de terceros
notas administrativas
metadatos internos
auditoría
datos de proxies ajenos
actas no publicadas
resoluciones no autorizadas
```

---

### 4.5. Asistencia privada por defecto

Los registros de asistencia son datos privados.

Regla:

```text id="imjnwb"
attendance puede ser consultada por administradores autorizados o por el usuario relacionado con la asistencia propia.
```

No se acepta:

```text id="dm11lm"
usuario consulta asistencia de terceros
usuario marca asistencia de unidad ajena
usuario registra asistencia propia para persona ajena
usuario crea proxy para unidad ajena
usuario ve notas administrativas de asistencia
```

---

### 4.6. Participantes validados por tenant

Todo participante debe resolverse dentro del tenant activo.

Para `participantType`:

```text id="n43kfe"
user -> userId del mismo tenant
person -> personId del mismo tenant
propertyUnit -> propertyUnitId del mismo tenant
role -> roleId válido para el tenant
owners -> grupo resuelto dentro del tenant
residents -> grupo resuelto dentro del tenant
allTenantUsers -> membership activa del tenant
boardMembers -> rol/política del tenant
committeeMembers -> rol/política del tenant
```

---

### 4.7. Asistencia cerrada bloquea cambios ordinarios

Una vez cerrada la asistencia, los cambios ordinarios quedan bloqueados.

Regla:

```text id="zcl9u3"
meeting.attendanceClosedAt != null implica que crear, editar o archivar asistencia requiere meetingAttendance.override.
```

Todo override debe quedar auditado.

---

### 4.8. Representación básica no equivale a poder legal

El módulo permite registrar representación básica, pero no valida poderes notariales ni requisitos legales avanzados.

Regla:

```text id="f98sjm"
MeetingProxy es evidencia administrativa interna, no certificación legal formal.
```

No se debe presentar el proxy como documento legal validado por el sistema.

---

### 4.9. Quórum informativo y determinístico

El cálculo de quórum debe ser determinístico, auditable y no debe modificar registros de asistencia.

Regla:

```text id="tmyeha"
calcular quórum lee asistencia y participantes; no crea, elimina ni modifica asistencia.
```

---

### 4.10. Resoluciones básicas no son votación formal

Una resolución básica no equivale a votación electrónica.

No debe registrar:

```text id="lmh3ug"
votos individuales
mayorías legales
coeficientes de copropiedad
firmas
validación legal de decisión
ejecución automática
```

---

### 4.11. Actas protegidas

Las actas preliminares no son públicas.

Un acta publicada solo puede ser consultada por usuarios autenticados, con membership activa y audiencia autorizada.

---

### 4.12. Auditoría obligatoria

Toda operación crítica debe auditarse, especialmente:

```text id="k1d33z"
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
meetingParticipant.added
meetingParticipant.updated
meetingAttendance.registered
meetingAttendance.updated
meetingProxy.created
meetingProxy.approved
meetingMinutes.published
meetingResolution.recorded
```

---

## 5. Activos protegidos

### 5.1. Activos de reuniones

```text id="vnl3y6"
meetings.title
meetings.description
meetings.meetingType
meetings.modality
meetings.location
meetings.virtualMeetingUrl
meetings.status
meetings.visibility
meetings.startsAt
meetings.endsAt
meetings.quorumRuleType
meetings.quorumRequiredValue
meetings.quorumCalculatedValue
meetings.quorumMet
meetings.metadata
```

---

### 5.2. Activos de agenda

```text id="j6pkta"
meeting_agenda_items.title
meeting_agenda_items.description
meeting_agenda_items.presenterUserId
meeting_agenda_items.notes
meeting_agenda_items.status
```

---

### 5.3. Activos de participantes

```text id="y9x7o4"
meeting_participants.userId
meeting_participants.personId
meeting_participants.propertyUnitId
meeting_participants.roleId
meeting_participants.participantType
meeting_participants.status
meeting_participants.response
```

---

### 5.4. Activos de asistencia

```text id="sl48yb"
meeting_attendance.participantId
meeting_attendance.userId
meeting_attendance.personId
meeting_attendance.propertyUnitId
meeting_attendance.attendanceStatus
meeting_attendance.checkInAt
meeting_attendance.checkOutAt
meeting_attendance.registeredBy
meeting_attendance.registrationMethod
meeting_attendance.notes
meeting_attendance.isProxy
meeting_attendance.proxyId
```

---

### 5.5. Activos de representación

```text id="eegvnx"
meeting_proxies.representedPersonId
meeting_proxies.representedUserId
meeting_proxies.representedPropertyUnitId
meeting_proxies.representativePersonId
meeting_proxies.representativeUserId
meeting_proxies.documentReference
meeting_proxies.status
meeting_proxies.rejectionReason
meeting_proxies.cancellationReason
```

---

### 5.6. Activos de actas

```text id="tj2ow2"
meeting_minutes.title
meeting_minutes.summary
meeting_minutes.body
meeting_minutes.status
meeting_minutes.preparedBy
meeting_minutes.reviewedBy
meeting_minutes.approvedBy
meeting_minutes.publishedBy
meeting_minutes.publishedAt
```

---

### 5.7. Activos de resoluciones

```text id="xbohtj"
meeting_resolutions.title
meeting_resolutions.description
meeting_resolutions.resolutionType
meeting_resolutions.status
meeting_resolutions.recordedBy
meeting_resolutions.approvedBy
meeting_resolutions.effectiveFrom
meeting_resolutions.metadata
```

---

## 6. Clasificación de datos

### 6.1. Datos administrativos internos

```text id="d8cz0f"
reuniones administrativas
agenda interna
participantes completos
asistencia completa
quórum
actas preliminares
resoluciones internas
auditoría
```

---

### 6.2. Datos propios del usuario

```text id="e5selb"
reuniones dirigidas al usuario
agenda visible para su audiencia
su propia asistencia
sus representaciones propias
actas publicadas a su audiencia
resoluciones autorizadas para su audiencia
```

---

### 6.3. Datos sensibles

```text id="iklxqh"
personId
propertyUnitId
attendanceStatus
absence/excuse
proxy/delegation data
documentReference
minutes body
resolution details
security meeting content
financial meeting content
fine-related meeting content
```

---

### 6.4. Datos prohibidos en endpoints públicos

```text id="oj5z9y"
meetings
agenda
participants
attendance
proxies
minutes
resolutions
audit logs
metadata interna
IDs internos sensibles
personIds
userIds
propertyUnitIds
roleIds
documentReferences
```

---

## 7. Superficies de ataque

### 7.1. Meetings administrativas

Endpoints:

```text id="ojfehz"
GET    /api/v1/tenant/meetings
POST   /api/v1/tenant/meetings
GET    /api/v1/tenant/meetings/{meetingId}
PATCH  /api/v1/tenant/meetings/{meetingId}
POST   /api/v1/tenant/meetings/{meetingId}/schedule
POST   /api/v1/tenant/meetings/{meetingId}/call
POST   /api/v1/tenant/meetings/{meetingId}/start
POST   /api/v1/tenant/meetings/{meetingId}/cancel
POST   /api/v1/tenant/meetings/{meetingId}/close-attendance
POST   /api/v1/tenant/meetings/{meetingId}/complete
POST   /api/v1/tenant/meetings/{meetingId}/archive
POST   /api/v1/tenant/meetings/{meetingId}/calculate-quorum
```

Riesgos:

```text id="y7l9i2"
reunión cross-tenant
escalamiento de permisos
transición inválida de estado
cancelación maliciosa
archivo malicioso
quórum calculado sobre datos ajenos
logs con agenda o descripción sensible
```

Controles:

```text id="io1xc8"
AuthGuard
TenantGuard
TenantPermissionGuard
MeetingPermissionGuard
tenant_id filter
state machine
content sanitizer
audit events
safe errors
```

---

### 7.2. Agenda

Riesgos:

```text id="wj8d9l"
agenda cross-tenant
presenterUserId de otro tenant
inyección de contenido
exposición de agenda interna a usuarios no autorizados
edición de agenda en reunión cerrada o archivada
```

Controles:

```text id="p95li7"
tenant validation
presenter validation
state validation
content sanitization
permission guard
audit events
```

---

### 7.3. Participantes

Riesgos:

```text id="b5yhvo"
participantes de otro tenant
exposición de lista completa de usuarios
audiencia incorrecta
convocatoria a usuario equivocado
enumeración de unidades o personas
```

Controles:

```text id="ohn0ni"
participant validation
user/person/propertyUnit/role tenant validation
audience resolution
DTO administrativo separado de DTO propio
no public exposure
audit meetingParticipant.*
```

---

### 7.4. Asistencia

Riesgos:

```text id="w53156"
asistencia cross-tenant
asistencia duplicada
usuario ve asistencia de terceros
registro propio para unidad ajena
modificación posterior al cierre
represented sin proxy aprobado
manipulación de ausencia o excusa
```

Controles:

```text id="pxj210"
attendance subject validation
duplicate prevention
OwnMeetingGuard
MeetingAttendanceGuard
closed attendance lock
override permission
approved proxy validation
audit meetingAttendance.*
```

---

### 7.5. Representaciones

Riesgos:

```text id="b3xgt6"
proxy cross-tenant
representante de otro tenant
representado de otro tenant
documentReference inseguro
proxy rechazado usado como asistencia
proxy no aprobado usado como represented
```

Controles:

```text id="w8qgxa"
represented validation
representative validation
documentReference validation
proxy state machine
approved-only policy
audit meetingProxy.*
```

---

### 7.6. Quórum

Riesgos:

```text id="d3hcg1"
quórum incorrecto
quórum calculado con asistencia de otro tenant
quórum modifica asistencia
uso de float/double
division por cero
custom rule insegura
```

Controles:

```text id="rhpd0g"
deterministic MeetingQuorumService
tenant-scoped reads
Decimal
zero expected participants handling
custom unsupported in MVP
audit meeting.quorumCalculated
```

---

### 7.7. Actas

Riesgos:

```text id="fz6n05"
acta expuesta a usuarios no autorizados
acta pública accidental
body con script
body completo en logs
acta duplicada
publicación sin permiso
```

Controles:

```text id="rju632"
MeetingMinutesGuard
audience validation
no public endpoints
content sanitizer
one active minutes per meeting
publish permission
audit meetingMinutes.*
safe logs
```

---

### 7.8. Resoluciones

Riesgos:

```text id="iqpmz8"
resolución cross-tenant
agendaItem de otra reunión
resolución interpretada como voto formal
resolución ejecuta acciones automáticas no autorizadas
metadata insegura
```

Controles:

```text id="nldugq"
meeting/agenda tenant validation
resolution state machine
no voting formal fields
no automatic execution
metadata sanitization
audit meetingResolution.*
```

---

### 7.9. Endpoints `/me`

Riesgos:

```text id="a9zf87"
usuario ve reunión ajena
usuario ve asistencia de terceros
usuario ve acta no publicada
usuario ve resolución no autorizada
usuario crea proxy para unidad ajena
```

Controles:

```text id="j5ci37"
OwnMeetingGuard
person/propertyUnit/role resolution
safe own DTOs
audience validation
no third-party attendance
no admin metadata
```

---

## 8. Amenazas principales

## 8.1. Reunión cross-tenant

### Descripción

Un usuario de Tenant A consulta, modifica, cancela, archiva o calcula quórum de una reunión de Tenant B.

### Impacto

Crítico.

### Controles

```text id="ftxeyb"
tenant_id obligatorio
TenantGuard
repositorios con tenantId
tests multitenant
safe 404/403
```

### Criterio

```text id="dcj8cs"
Ningún endpoint debe devolver ni modificar reuniones de otro tenant.
```

---

## 8.2. Participante cross-tenant

### Descripción

Un administrador agrega a una reunión usuarios, personas, unidades o roles de otro tenant.

### Impacto

Crítico.

### Controles

```text id="p91yde"
MeetingParticipantService
MeetingPersonDirectoryPort
MeetingPropertyUnitPort
MeetingRoleDirectoryPort
cross-tenant reference tests
```

---

## 8.3. Asistencia duplicada

### Descripción

La misma persona, usuario, unidad, participante o proxy registra múltiples asistencias activas en la misma reunión.

### Impacto

Alto.

### Controles

```text id="kp1d5i"
unique active attendance rule
repository check
partial unique indexes
MEETING_ATTENDANCE_DUPLICATE
attendance tests
```

---

## 8.4. Usuario ve asistencia de terceros

### Descripción

Un usuario final consulta asistencia de otra persona, unidad o residente.

### Impacto

Alto.

### Controles

```text id="edqufe"
OwnMeetingGuard
OwnMeetingAttendanceDto
no third-party attendance exposure
own-resource tests
```

---

## 8.5. Modificación de asistencia cerrada

### Descripción

Un administrador modifica asistencia después de cerrada sin autorización reforzada.

### Impacto

Alto.

### Controles

```text id="ylrfrc"
attendanceClosedAt validation
meetingAttendance.override
audit override
tests de asistencia cerrada
```

---

## 8.6. Proxy inválido usado para asistencia

### Descripción

Un proxy `submitted`, `rejected`, `cancelled` o `archived` se usa para registrar asistencia representada.

### Impacto

Alto.

### Controles

```text id="m2kli2"
proxy.status = approved
MeetingProxyService
MeetingAttendanceService
proxy tests
```

---

## 8.7. Quórum manipulado

### Descripción

El cálculo de quórum usa datos incompletos, de otro tenant, duplicados o modificados durante el cálculo.

### Impacto

Medio / Alto.

### Controles

```text id="m92vf0"
deterministic calculation
tenant-scoped read
duplicate prevention
transactional read cuando aplique
audit
quorum tests
```

---

## 8.8. Acta expuesta públicamente

### Descripción

Un acta preliminar o publicada se expone por endpoint público o a usuario no autorizado.

### Impacto

Crítico.

### Controles

```text id="n4glzv"
no public endpoints
MeetingMinutesGuard
audience validation
OpenAPI negative tests
security tests
```

---

## 8.9. Inyección de contenido

### Descripción

Agenda, acta o resolución contiene scripts, iframes, handlers o URLs peligrosas.

### Impacto

Alto.

### Controles

```text id="jl55lx"
MeetingContentSanitizerService
HTML allowlist
script blocking
iframe blocking
sanitization tests
```

---

## 8.10. Resolución tratada como votación formal

### Descripción

Una resolución básica se interpreta o implementa como votación legal.

### Impacto

Alto.

### Controles

```text id="yqa40c"
no vote fields
no vote counts
no legal majority
no automatic execution
future voting spec required
resolution tests
```

---

## 9. Controles por entidad

## 9.1. `Meeting`

Controles:

```text id="xcwla8"
tenantId obligatorio
state machine obligatoria
no tenantId desde body
no status desde PATCH genérico
validar startsAt/endsAt
validar modality/location/url
validar cancellationReason al cancelar
validar quorumRequiredValue no negativo
quorumCalculatedValue solo por servicio
quorumMet solo por servicio
archivedAt como archivo lógico
auditoría por transición
```

---

## 9.2. `MeetingAgendaItem`

Controles:

```text id="dy0fxf"
tenantId obligatorio
meetingId del mismo tenant
order único por reunión
presenterUserId del mismo tenant
title obligatorio
content sanitization
no edición en reunión archived/cancelled
auditoría
```

---

## 9.3. `MeetingParticipant`

Controles:

```text id="ikfbbu"
tenantId obligatorio
meetingId del mismo tenant
participantType determina referencia requerida
userId/personId/propertyUnitId/roleId del mismo tenant
no exposición pública
no exposición completa en /me
auditoría de cambios
```

---

## 9.4. `MeetingAttendance`

Controles:

```text id="f4z3ks"
tenantId obligatorio
meetingId del mismo tenant
sujeto obligatorio
participant/user/person/propertyUnit/proxy del mismo tenant
duplicate prevention
estado de reunión válido
attendance closed lock
override permission
represented requiere proxy approved
checkOutAt posterior a checkInAt
no exposición de terceros en /me
auditoría
```

---

## 9.5. `MeetingProxy`

Controles:

```text id="ypaiug"
tenantId obligatorio
meetingId del mismo tenant
representado obligatorio
representante obligatorio
representado del mismo tenant
representante del mismo tenant
documentReference seguro
approved requiere approvedBy/approvedAt
rejected requiere reason
cancelled requiere reason
solo approved sirve para represented attendance
auditoría
```

---

## 9.6. `MeetingMinutes`

Controles:

```text id="grqdnz"
tenantId obligatorio
meetingId del mismo tenant
una acta activa por reunión en MVP
title obligatorio
body obligatorio
content sanitization
publish permission
no endpoint público
solo published visible en /me
auditoría
safe logs
```

---

## 9.7. `MeetingResolution`

Controles:

```text id="qtw4n7"
tenantId obligatorio
meetingId del mismo tenant
agendaItemId de la misma reunión
title obligatorio
description obligatoria
no voting fields
no automatic execution
metadata sanitizada
cancel requiere reason
auditoría
```

---

## 10. Reglas de autorización

### 10.1. Meetings administrativas

| Acción              | Permiso             |
| ------------------- | ------------------- |
| Crear reunión       | `meetings.create`   |
| Consultar reuniones | `meetings.read`     |
| Actualizar reunión  | `meetings.update`   |
| Programar reunión   | `meetings.schedule` |
| Convocar reunión    | `meetings.call`     |
| Iniciar reunión     | `meetings.start`    |
| Cancelar reunión    | `meetings.cancel`   |
| Completar reunión   | `meetings.complete` |
| Archivar reunión    | `meetings.archive`  |

---

### 10.2. Agenda

| Acción            | Permiso                 |
| ----------------- | ----------------------- |
| Crear agenda      | `meetingAgenda.create`  |
| Consultar agenda  | `meetingAgenda.read`    |
| Actualizar agenda | `meetingAgenda.update`  |
| Reordenar agenda  | `meetingAgenda.reorder` |
| Archivar agenda   | `meetingAgenda.archive` |

---

### 10.3. Participantes

| Acción                   | Permiso                       |
| ------------------------ | ----------------------------- |
| Crear participantes      | `meetingParticipants.create`  |
| Consultar participantes  | `meetingParticipants.read`    |
| Actualizar participantes | `meetingParticipants.update`  |
| Archivar participantes   | `meetingParticipants.archive` |

---

### 10.4. Asistencia

| Acción                      | Permiso                        |
| --------------------------- | ------------------------------ |
| Registrar asistencia        | `meetingAttendance.create`     |
| Consultar asistencia        | `meetingAttendance.read`       |
| Actualizar asistencia       | `meetingAttendance.update`     |
| Cerrar asistencia           | `meetingAttendance.close`      |
| Override asistencia cerrada | `meetingAttendance.override`   |
| Consultar asistencia propia | `meetingAttendance.read.own`   |
| Registrar asistencia propia | `meetingAttendance.create.own` |

---

### 10.5. Representaciones

| Acción                 | Permiso                     |
| ---------------------- | --------------------------- |
| Crear proxy            | `meetingProxies.create`     |
| Consultar proxy        | `meetingProxies.read`       |
| Aprobar proxy          | `meetingProxies.approve`    |
| Rechazar proxy         | `meetingProxies.reject`     |
| Cancelar proxy         | `meetingProxies.cancel`     |
| Crear proxy propio     | `meetingProxies.create.own` |
| Consultar proxy propio | `meetingProxies.read.own`   |

---

### 10.6. Quórum

| Acción           | Permiso                   |
| ---------------- | ------------------------- |
| Calcular quórum  | `meetingQuorum.calculate` |
| Consultar quórum | `meetingQuorum.read`      |

---

### 10.7. Actas

| Acción                | Permiso                   |
| --------------------- | ------------------------- |
| Crear acta            | `meetingMinutes.create`   |
| Consultar acta        | `meetingMinutes.read`     |
| Actualizar acta       | `meetingMinutes.update`   |
| Revisar acta          | `meetingMinutes.review`   |
| Aprobar acta          | `meetingMinutes.approve`  |
| Publicar acta         | `meetingMinutes.publish`  |
| Archivar acta         | `meetingMinutes.archive`  |
| Consultar acta propia | `meetingMinutes.read.own` |

---

### 10.8. Resoluciones

| Acción                      | Permiso                       |
| --------------------------- | ----------------------------- |
| Crear resolución            | `meetingResolutions.create`   |
| Consultar resolución        | `meetingResolutions.read`     |
| Actualizar resolución       | `meetingResolutions.update`   |
| Aprobar resolución          | `meetingResolutions.approve`  |
| Cancelar resolución         | `meetingResolutions.cancel`   |
| Archivar resolución         | `meetingResolutions.archive`  |
| Consultar resolución propia | `meetingResolutions.read.own` |

---

## 11. Reglas de endpoints `/me`

### 11.1. Reuniones propias

Debe validar:

```text id="g2i8po"
usuario autenticado
membership activa
tenant activo
permiso own
audiencia aplicable
meeting.tenantId = currentTenant.id
```

---

### 11.2. Asistencia propia

Debe validar:

```text id="mijuwl"
attendance.tenantId = currentTenant.id
attendance pertenece al usuario/persona/unidad autorizada
no devolver asistencia de terceros
no devolver notas administrativas
no devolver registeredBy
```

---

### 11.3. Self check-in

Self check-in solo si:

```text id="jzy4jx"
tenant policy habilita self check-in
meeting.status IN called, inProgress
attendanceClosedAt IS NULL
usuario pertenece a audiencia
propertyUnitId pertenece al usuario
personId pertenece al usuario
no existe asistencia activa duplicada
```

---

### 11.4. Actas propias

Debe validar:

```text id="obiflb"
meeting accesible por audiencia
minutes.status = published
minutes.tenantId = currentTenant.id
no metadata interna
no auditoría
```

---

### 11.5. Proxies propios

Debe validar:

```text id="p23dtn"
representedPersonId pertenece al usuario
representedPropertyUnitId pertenece al usuario
meeting accesible
proxy.tenantId = currentTenant.id
```

---

## 12. Reglas de endpoints públicos

### 12.1. Permitidos

En MVP:

```text id="w7i2hf"
Ninguno.
```

---

### 12.2. Prohibidos

```text id="xkxbjx"
GET /api/v1/public/tenants/{slug}/meetings
GET /api/v1/public/tenants/{slug}/meetings/{meetingId}
GET /api/v1/public/tenants/{slug}/meetings/{meetingId}/agenda
GET /api/v1/public/tenants/{slug}/meetings/{meetingId}/participants
GET /api/v1/public/tenants/{slug}/meetings/{meetingId}/attendance
GET /api/v1/public/tenants/{slug}/meetings/{meetingId}/minutes
GET /api/v1/public/tenants/{slug}/meetings/{meetingId}/resolutions
POST /api/v1/public/tenants/{slug}/meetings
POST /api/v1/public/tenants/{slug}/meetings/{meetingId}/attendance
```

---

### 12.3. OpenAPI

OpenAPI no debe documentar rutas públicas de reuniones.

Cualquier aparición de esas rutas debe hacer fallar CI.

---

## 13. Seguridad SQL / Prisma

### 13.1. Consulta de reunión

Prohibido:

```typescript id="a58ci4"
await prisma.meeting.findUnique({
  where: { id: meetingId }
});
```

Permitido:

```typescript id="ypszam"
await prisma.meeting.findFirst({
  where: {
    id: meetingId,
    tenantId: currentTenant.id
  }
});
```

---

### 13.2. Consulta de asistencia

Prohibido:

```typescript id="gyzvpn"
await prisma.meetingAttendance.findUnique({
  where: { id: attendanceId }
});
```

Permitido:

```typescript id="jz2hzv"
await prisma.meetingAttendance.findFirst({
  where: {
    id: attendanceId,
    tenantId: currentTenant.id
  }
});
```

Para `/me`:

```typescript id="sg5yip"
await prisma.meetingAttendance.findFirst({
  where: {
    id: attendanceId,
    tenantId: currentTenant.id,
    OR: [
      { userId: currentUser.id },
      { personId: { in: actorPersonIds } },
      { propertyUnitId: { in: actorPropertyUnitIds } }
    ]
  }
});
```

---

### 13.3. Consulta de acta

Permitido:

```typescript id="qphkx9"
await prisma.meetingMinutes.findFirst({
  where: {
    id: minutesId,
    tenantId: currentTenant.id
  }
});
```

Para `/me`:

```typescript id="iu8dtm"
await prisma.meetingMinutes.findFirst({
  where: {
    meetingId,
    tenantId: currentTenant.id,
    status: "PUBLISHED",
    archivedAt: null
  }
});
```

La audiencia se valida en servicio.

---

### 13.4. `$queryRaw`

Permitido solo si:

```text id="kflq0v"
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

```text id="utlrms"
tenantId
createdBy
updatedBy
calledBy
cancelledBy
closedBy
archivedBy
approvedBy
publishedBy
registeredBy
status en PATCH genérico
quorumCalculatedValue
quorumMet
quorumCalculatedAt
attendanceClosedAt
createdAt
updatedAt
archivedAt
audit metadata
```

---

### 14.2. DTO administrativo

Puede incluir información operativa, pero no debe incluir:

```text id="f7j4e9"
tokens
secretos
datos de otros tenants
payloads sin sanitizar
body completo en listados
documentos completos
credenciales
```

---

### 14.3. DTO propio

No debe incluir:

```text id="dih46d"
participantes completos
asistencia de terceros
registeredBy
notas administrativas
metadata interna
auditoría
IDs de personas ajenas
IDs de unidades ajenas
```

---

## 15. Seguridad de contenido

### 15.1. Campos a sanitizar

```text id="gakpuq"
meeting.title
meeting.description
agenda.title
agenda.description
agenda.notes
attendance.notes
proxy.rejectionReason
proxy.cancellationReason
minutes.title
minutes.summary
minutes.body
resolution.title
resolution.description
resolution.metadata
```

---

### 15.2. Contenido prohibido

```text id="mxz6c7"
<script>
<iframe>
<object>
<embed>
event handlers inline
javascript:
data URLs peligrosas
HTML no sanitizado
CSS peligroso
```

---

### 15.3. Actas

El `body` del acta debe tratarse como contenido privado. No se debe registrar completo en:

```text id="sda6us"
logs
audit metadata
metrics
error details
notification payloads externos
```

---

## 16. Seguridad de URLs y referencias

### 16.1. `virtualMeetingUrl`

Debe ser:

```text id="pnvxsf"
https
allowlisted si se define política
sin credenciales embebidas
sin tokens persistentes
sin javascript:
sin data:
sin file:
```

---

### 16.2. `documentReference`

Debe ser:

```text id="e9x6fu"
referencia interna controlada
no URL pública permanente
no signed URL persistente
no token embebido
no credenciales
no archivo inline
```

---

### 16.3. `actionUrl` para notificaciones

Debe ser relativa:

```text id="ru7alj"
/meetings/{meetingId}
```

No se acepta:

```text id="aczn4u"
open redirect
URL externa no allowlisted
javascript:
data:
file:
```

---

## 17. Seguridad de quórum

### 17.1. Reglas permitidas MVP

```text id="pf68nr"
none
participantCount
propertyUnitCount
percentageOfExpectedParticipants
percentageOfPropertyUnits
```

---

### 17.2. `custom`

En MVP debe rechazarse o mantenerse como placeholder sin cálculo.

Recomendación:

```text id="rqq4cs"
422 MEETING_QUORUM_RULE_UNSUPPORTED
```

---

### 17.3. Estados que cuentan

Para quórum pueden contar:

```text id="mzrpq2"
present
late
represented
```

No deben contar:

```text id="cue5c9"
absent
excused
cancelled
archived
```

---

### 17.4. Integridad

Calcular quórum no debe:

```text id="rcjd6u"
crear asistencia
editar asistencia
archivar asistencia
aprobar proxies
modificar participantes
generar multas
ejecutar resoluciones
```

---

## 18. Seguridad de notificaciones

El módulo no envía canales directamente.

Permitido:

```text id="a2gnqb"
emitir evento meeting.called
emitir evento meeting.updated
emitir evento meeting.cancelled
emitir evento meeting.minutesPublished
invocar MeetingNotificationPort
```

Prohibido:

```text id="bbycu7"
enviar email directamente desde Meetings
enviar WhatsApp directamente desde Meetings
enviar SMS directamente desde Meetings
enviar push directamente desde Meetings
incluir asistencia completa en payload
incluir participantes completos en payload
incluir acta completa en payload
incluir datos personales innecesarios
```

Payload seguro sugerido:

```json id="ku44if"
{
  "tenantId": "tenant_uuid",
  "sourceType": "meeting",
  "sourceId": "meeting_uuid",
  "eventType": "meeting.called",
  "title": "Asamblea ordinaria 2026",
  "startsAt": "2026-08-15T14:00:00Z",
  "audience": {
    "type": "owners"
  },
  "actionUrl": "/meetings/meeting_uuid",
  "traceId": "req_123456"
}
```

---

## 19. Auditoría

### 19.1. Eventos obligatorios

```text id="bmq64y"
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

---

### 19.2. Metadata permitida

```json id="eihizq"
{
  "meetingId": "meeting_uuid",
  "agendaItemId": "agenda_item_uuid",
  "participantId": "participant_uuid",
  "attendanceId": "attendance_uuid",
  "proxyId": "proxy_uuid",
  "minutesId": "minutes_uuid",
  "resolutionId": "resolution_uuid",
  "meetingType": "ordinaryAssembly",
  "meetingStatus": "called",
  "attendanceStatus": "present",
  "fromStatus": "scheduled",
  "toStatus": "called",
  "propertyUnitId": "property_unit_uuid",
  "personId": "person_uuid",
  "userId": "user_uuid",
  "quorumRuleType": "percentageOfPropertyUnits",
  "quorumMet": true,
  "traceId": "req_123456"
}
```

---

### 19.3. Metadata prohibida

```text id="em71xt"
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
SQL raw
provider payloads
```

---

## 20. Logs y métricas

### 20.1. Logs permitidos

```text id="zk95g7"
traceId
requestId
correlationId
action
outcome
status
durationMs
errorCode
meetingType
meetingStatus
modality
attendanceStatus
quorumMet
```

---

### 20.2. Logs prohibidos

```text id="x9qdnb"
Authorization header
cookies
tokens
secretos
body completo de acta
emails completos
teléfonos completos
documentos completos
poderes completos
datos personales innecesarios
SQL raw
stack trace en producción
```

---

### 20.3. Métricas permitidas

```text id="ib2jmg"
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

---

### 20.4. Labels permitidos

```text id="uegfx8"
meetingType
meetingStatus
modality
attendanceStatus
quorumMet
outcome
```

---

### 20.5. Labels prohibidos

```text id="zsogrs"
tenantId
meetingId
personId
userId
propertyUnitId
attendanceId
proxyId
minutesId
resolutionId
email
phone
traceId
ipAddress
```

---

## 21. Errores seguros

### 21.1. Formato estándar

```json id="kghjcp"
{
  "error": {
    "code": "MEETING_NOT_FOUND",
    "message": "Meeting not found.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

### 21.2. No revelar

Los errores no deben revelar:

```text id="urt8b6"
si una reunión ajena existe
si una asistencia ajena existe
si una acta no autorizada existe
si un proxy ajeno existe
si un participante de otro tenant existe
SQL interno
Prisma raw error
stack trace
datos personales
documentReference sensible
```

---

### 21.3. 404 vs 403

Para recursos ajenos o cross-tenant se permite responder:

```text id="nk7418"
404 MEETING_NOT_FOUND
```

para reducir enumeración.

Para falta de permiso dentro del mismo tenant se puede responder:

```text id="fsiv8e"
403 FORBIDDEN
```

cuando no revele información sensible.

---

## 22. Rate limiting

Aplicar rate limiting a endpoints de alto impacto:

```text id="gkjtc7"
POST /api/v1/tenant/meetings
POST /api/v1/tenant/meetings/{meetingId}/call
POST /api/v1/tenant/meetings/{meetingId}/cancel
POST /api/v1/tenant/meetings/{meetingId}/attendance
POST /api/v1/tenant/meeting-attendance/{attendanceId}/archive
POST /api/v1/tenant/meetings/{meetingId}/calculate-quorum
POST /api/v1/tenant/meeting-minutes/{minutesId}/publish
POST /api/v1/me/meetings/{meetingId}/attendance/check-in
POST /api/v1/me/meetings/{meetingId}/proxies
```

Objetivo:

```text id="we4b4f"
prevenir abuso
prevenir spam de convocatorias
prevenir spam de self check-in
prevenir brute force de recursos
proteger disponibilidad
```

---

## 23. Cache y CORS

### 23.1. Endpoints privados

Todos los endpoints deben usar:

```text id="kvxc0g"
Cache-Control: no-store
```

No cachear:

```text id="i3890b"
reuniones
agenda
participantes
asistencia
proxies
actas
resoluciones
```

---

### 23.2. CORS

No usar:

```text id="c3vwc3"
Access-Control-Allow-Origin: *
```

en endpoints privados.

Permitir únicamente orígenes autorizados del frontend administrativo o portal transaccional.

---

## 24. Seguridad con IA

### 24.1. Prohibido enviar a IA externa

```text id="jm38hl"
actas reales
agenda real privada
asistencia real
ausencias
proxies
documentReference
resoluciones internas
datos de propietarios
datos de residentes
datos de unidades
información financiera tratada en reuniones
información sancionatoria
tokens
secretos
logs con datos personales
```

---

### 24.2. Permitido con datos ficticios

```text id="n7ex6w"
generar ejemplos de actas sintéticas
crear tests con datos falsos
mejorar documentación técnica
analizar código sin datos reales
generar plantillas ficticias
```

---

### 24.3. IA futura para actas

Cualquier generación automática de actas, resúmenes o transcripciones con IA requiere spec futura e incluir:

```text id="qhzzha"
anonimización
consentimiento
revisión humana
control de prompts
política de retención
no entrenamiento con datos privados
registro de uso
cumplimiento legal
```

---

## 25. Retención y eliminación

### 25.1. No eliminación física ordinaria

No eliminar físicamente:

```text id="ss6a6d"
meetings
meeting_agenda_items
meeting_participants
meeting_attendance
meeting_proxies
meeting_minutes
meeting_resolutions
```

---

### 25.2. Archivo lógico

Usar:

```text id="fqafz8"
archivedAt
status = archived cuando aplique
```

---

### 25.3. Motivo

La retención es necesaria para:

```text id="rfikha"
historial administrativo
evidencia de asistencia
respaldo de actas
respaldo de resoluciones
auditoría
reportes
futuras votaciones
cumplimiento
```

---

## 26. Checklist de seguridad para PR

```text id="fkrppd"
[ ] Todas las tablas nuevas tienen tenant_id.
[ ] Toda consulta filtra por tenant_id.
[ ] No se acepta tenantId desde body.
[ ] No se busca meeting solo por id.
[ ] No se busca agendaItem solo por id.
[ ] No se busca participant solo por id.
[ ] No se busca attendance solo por id.
[ ] No se busca proxy solo por id.
[ ] No se busca minutes solo por id.
[ ] No se busca resolution solo por id.
[ ] userId se valida contra tenant.
[ ] personId se valida contra tenant.
[ ] propertyUnitId se valida contra tenant.
[ ] roleId se valida contra tenant.
[ ] participantId se valida contra tenant y reunión.
[ ] proxyId se valida contra tenant y reunión.
[ ] agendaItemId se valida contra tenant y reunión.
[ ] No hay endpoints públicos de reuniones.
[ ] OpenAPI no documenta endpoints públicos de reuniones.
[ ] /me no devuelve participantes completos.
[ ] /me no devuelve asistencia de terceros.
[ ] /me no devuelve notas administrativas.
[ ] /me no devuelve auditoría.
[ ] Self check-in valida unidad propia.
[ ] Self check-in valida persona propia.
[ ] Self check-in está deshabilitado por defecto o protegido por política.
[ ] Asistencia duplicada se rechaza.
[ ] Asistencia en reunión cancelled se rechaza.
[ ] Asistencia en reunión archived se rechaza.
[ ] Asistencia cerrada requiere meetingAttendance.override.
[ ] represented requiere proxy approved.
[ ] proxy cross-tenant se rechaza.
[ ] documentReference no contiene URL pública con token.
[ ] Quórum usa Decimal.
[ ] Quórum no modifica asistencia.
[ ] custom quorum se rechaza en MVP.
[ ] Acta se sanitiza.
[ ] Agenda se sanitiza.
[ ] Resolución se sanitiza.
[ ] Acta no se expone públicamente.
[ ] Acta no se registra completa en logs.
[ ] Resoluciones no crean votos formales.
[ ] Resoluciones no ejecutan acciones automáticas.
[ ] No se generan multas automáticas por inasistencia.
[ ] Notificaciones usan MeetingNotificationPort.
[ ] Meetings no envía email directamente.
[ ] Payload de notificación es mínimo.
[ ] Auditoría registra eventos críticos.
[ ] Audit metadata está sanitizada.
[ ] Logs no contienen tokens.
[ ] Logs no contienen datos personales innecesarios.
[ ] Métricas no contienen IDs sensibles.
[ ] Tests unitarios pasan.
[ ] Tests API pasan.
[ ] Tests de autorización pasan.
[ ] Tests own-resource pasan.
[ ] Tests multitenant pasan.
[ ] Tests de asistencia pasan.
[ ] Tests de proxies pasan.
[ ] Tests de quórum pasan.
[ ] Tests de actas pasan.
[ ] Tests de resoluciones pasan.
[ ] Tests de seguridad pasan.
[ ] OpenAPI validation pasa.
[ ] CI pasa.
```

---

## 27. Pruebas de seguridad obligatorias

Deben existir pruebas para:

```text id="s9asbo"
usuario sin token recibe 401
usuario sin membership recibe 403
usuario disabled recibe 403
usuario sin permiso recibe 403
tenant A no ve meetings tenant B
tenant A no ve agenda tenant B
tenant A no ve participants tenant B
tenant A no ve attendance tenant B
tenant A no ve proxies tenant B
tenant A no ve minutes tenant B
tenant A no ve resolutions tenant B
tenant A no usa userId tenant B
tenant A no usa personId tenant B
tenant A no usa propertyUnitId tenant B
tenant A no usa roleId tenant B
tenant A no usa participantId tenant B
tenant A no usa proxyId tenant B
usuario no ve reunión ajena desde /me
usuario no ve asistencia de terceros desde /me
usuario no crea proxy de unidad ajena
usuario no hace self check-in para unidad ajena
asistencia duplicada devuelve 409
asistencia en cancelled devuelve 409
asistencia cerrada sin override devuelve 409
represented sin proxy approved devuelve 422
quórum custom devuelve 422
quórum no modifica asistencia
acta con script se bloquea
agenda con script se bloquea
resolución con script se bloquea
acta no aparece en endpoint público
endpoint público de reuniones no existe
OpenAPI no documenta endpoints públicos prohibidos
logs no contienen body completo de acta
logs no contienen tokens
metrics no contienen IDs sensibles
```

---

## 28. Riesgos residuales aceptados en MVP

| Riesgo                                      | Estado   | Justificación                                  |
| ------------------------------------------- | -------- | ---------------------------------------------- |
| Quórum legal avanzado no soportado          | Aceptado | MVP solo calcula quórum básico informativo     |
| Representación no valida poder legal formal | Aceptado | Validación legal avanzada queda diferida       |
| Sin votación electrónica                    | Aceptado | Será spec separada                             |
| Sin firmas electrónicas                     | Aceptado | Requiere proveedor, cumplimiento y flujo legal |
| Sin PDF formal de actas                     | Aceptado | MVP maneja acta textual protegida              |
| Sin QR de asistencia                        | Aceptado | Requiere spec de seguridad adicional           |
| Sin biometría/geolocalización               | Aceptado | Datos sensibles fuera del MVP                  |
| Sin IA para actas reales                    | Aceptado | Requiere gobierno de datos                     |
| Sin multas automáticas por inasistencia     | Aceptado | Requiere spec y reglas legales                 |
| Sin videoconferencia integrada              | Aceptado | Puede usarse URL externa controlada            |

---

## 29. Pendientes de seguridad para specs futuras

### 29.1. `014-voting-basic`

Debe cubrir:

```text id="zxb15h"
votantes elegibles
voto por unidad/persona
anonimato o trazabilidad según regla
mayorías
quórum de votación
auditoría reforzada
integridad de resultados
no repudio
```

---

### 29.2. `00X-electronic-signatures`

Debe cubrir:

```text id="sgpxt6"
proveedor de firma
identidad del firmante
integridad del documento
sellado de tiempo
certificados
almacenamiento seguro
auditoría legal
```

---

### 29.3. `00X-certified-minutes`

Debe cubrir:

```text id="qlgixy"
versionado de actas
PDF formal
hash del documento
firma
publicación controlada
retención
historial de cambios
```

---

### 29.4. `00X-meeting-qr-attendance`

Debe cubrir:

```text id="qfrndt"
QR dinámico
expiración
prevención de replay
validación de dispositivo
rate limiting
auditoría
fallback manual
```

---

### 29.5. `00X-ai-assisted-minutes`

Debe cubrir:

```text id="q1pe9w"
anonimización
transcripción segura
consentimiento
revisión humana
retención de prompts
no entrenamiento
redacción de datos sensibles
cumplimiento
```

---

### 29.6. `00X-meeting-absence-fines`

Debe cubrir:

```text id="g84k7l"
reglas de ausencia
excepciones
notificación previa
derecho a justificación
generación de multa
reverso
auditoría
integración con 011-fines-sanctions
```

---

## 30. Criterios de aceptación de seguridad

La spec `013-meetings-attendance` cumple seguridad si:

```text id="xgcetk"
- toda tabla nueva tiene tenant_id;
- toda consulta filtra por tenant_id;
- ningún endpoint acepta tenantId desde body;
- ningún recurso se busca solo por id;
- no existen endpoints públicos de reuniones;
- OpenAPI no documenta endpoints públicos de reuniones;
- participantes se validan contra tenant;
- asistencia se valida contra tenant;
- proxies se validan contra tenant;
- actas se validan contra tenant;
- resoluciones se validan contra tenant;
- usuarios finales solo ven reuniones de su audiencia;
- usuarios finales no ven asistencia de terceros;
- usuarios finales no crean proxy para unidades ajenas;
- self check-in está protegido por política;
- asistencia duplicada se rechaza;
- asistencia cerrada requiere override;
- represented requiere proxy approved;
- quórum se calcula con Decimal;
- quórum no modifica asistencia;
- actas se sanitizan;
- actas no son públicas;
- resoluciones no son votación formal;
- resoluciones no ejecutan acciones automáticas;
- no se generan multas automáticas;
- eventos a notificaciones tienen payload mínimo;
- auditoría registra operaciones críticas;
- logs no contienen datos sensibles;
- métricas no contienen IDs sensibles;
- tests de seguridad pasan;
- CI pasa.
```

---

## 31. Decisión final de seguridad

El módulo `013-meetings-attendance` será tratado como un módulo sensible de operación comunitaria, asistencia, trazabilidad y documentación interna.

Su seguridad se basa en:

```text id="lnvjcd"
tenant isolation
permissioned actions
own-resource authorization
meeting audience validation
participant tenant validation
attendance privacy
attendance duplicate prevention
closed attendance lock
proxy validation
deterministic quorum calculation
minutes privacy
resolution traceability
content sanitization
no public exposure
notification payload minimization
auditability
safe logs
safe metrics
OpenAPI negative validation
CI security gates
```

No se aceptará una implementación que permita reuniones cross-tenant, participantes de otro tenant, asistencia de otro tenant, asistencia duplicada, proxy cross-tenant, asistencia representada sin proxy aprobado, modificación de asistencia cerrada sin permiso, consulta de reuniones ajenas, exposición de asistencia de terceros, creación de proxies sobre unidades ajenas, exposición pública de reuniones, exposición pública de actas, quórum con `float/double`, quórum que modifique asistencia, actas con contenido inseguro, resoluciones tratadas como votación formal, multas automáticas por inasistencia, logs con datos personales, omisión de auditoría o documentación OpenAPI de rutas públicas prohibidas.
