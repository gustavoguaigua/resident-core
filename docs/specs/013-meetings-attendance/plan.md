# Plan — Spec 013 Meetings and Attendance

## 1. Información del documento

| Campo                 | Valor                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------- |
| Proyecto              | RESIDENT Core                                                                                                 |
| Spec ID               | 013                                                                                                           |
| Módulo                | Meetings and Attendance                                                                                       |
| Documento             | Implementation Plan                                                                                           |
| Ruta                  | `docs/specs/013-meetings-attendance/plan.md`                                                                  |
| Versión               | 0.1                                                                                                           |
| Estado                | needs-review                                                                                                  |
| Fecha                 | 2026-07-19                                                                                                    |
| Documento base        | `docs/specs/013-meetings-attendance/spec.md`                                                                  |
| Depende de            | `001-tenants`, `002-users-roles`, `003-residents-properties`, `007-audit`, `012-communications-notifications` |
| Relacionado con       | `008-basic-reports`, `011-fines-sanctions`, futuras specs de votación, firmas, actas PDF y automatizaciones   |
| Arquitectura          | Monolito modular NestJS                                                                                       |
| Base de datos         | PostgreSQL + Prisma                                                                                           |
| API Style             | REST                                                                                                          |
| Naturaleza del módulo | Tenant-scoped / Attendance-aware / Quorum-aware / Permissioned / Own-resource protected / Auditable           |
| Prioridad             | Media / Alta                                                                                                  |

---

## 2. Propósito

Este documento transforma la especificación funcional `013-meetings-attendance/spec.md` en un plan técnico de implementación.

El módulo `Meetings and Attendance` debe permitir crear reuniones, definir agenda, convocar participantes, registrar asistencia, gestionar representaciones básicas, calcular quórum simple, registrar actas preliminares, registrar resoluciones básicas y emitir eventos para notificaciones, manteniendo aislamiento por tenant, autorización por permisos, protección de datos personales y auditoría completa.

Regla central:

```text id="q1h8mn"
Toda reunión, participante, asistencia, representación, acta o resolución debe ser tenant-scoped, state-controlled, permissioned, own-resource protected, auditable y no pública por defecto.
```

---

## 3. Resumen de implementación

El módulo se implementará dentro de RESIDENT Core como módulo funcional independiente, integrado con:

* tenants;
* usuarios, roles y permisos;
* personas, propietarios, residentes y unidades;
* comunicaciones y notificaciones;
* auditoría;
* reportes básicos;
* futuras votaciones;
* futuras actas formales;
* futuras firmas electrónicas;
* futuras automatizaciones.

Nombre técnico recomendado:

```text id="wwq59q"
meetings
```

Ruta recomendada:

```text id="rl8vyw"
apps/api/src/modules/meetings/
```

Componentes principales:

```text id="rpfx4h"
MeetingsModule
MeetingsController
MeetingAgendaController
MeetingParticipantsController
MeetingAttendanceController
MeetingProxiesController
MeetingMinutesController
MeetingResolutionsController
MyMeetingsController
MeetingService
MeetingAgendaService
MeetingParticipantService
MeetingAttendanceService
MeetingProxyService
MeetingQuorumService
MeetingMinutesService
MeetingResolutionService
MeetingNotificationService
MeetingAuditService
```

Naturaleza del módulo:

```text id="jh36ed"
tenant-scoped
permissioned
audience-aware
own-resource protected
state-controlled
attendance-aware
proxy-aware
quorum-aware
minutes-aware
resolution-aware
audit-heavy
privacy-preserving
notification-ready
future-voting-ready
```

---

## 4. Decisiones técnicas aplicables

El módulo debe cumplir con:

```text id="mx32k5"
ADR-001 — Architecture Style
ADR-002 — Backend Framework
ADR-003 — Database Strategy
ADR-004 — Multitenancy Strategy
ADR-007 — Authorization Strategy
ADR-010 — Observability Strategy
ADR-011 — Testing Strategy
ADR-012 — CI/CD Strategy
```

Reglas clave:

* usar NestJS + TypeScript;
* usar PostgreSQL + Prisma;
* toda tabla tenant-scoped debe incluir `tenant_id`;
* no aceptar `tenantId` desde body;
* toda consulta debe filtrar por tenant;
* reuniones no se exponen públicamente en MVP;
* asistencia no se expone públicamente;
* actas no se exponen públicamente;
* participantes no se exponen públicamente;
* usuarios solo consultan reuniones propias o dirigidas a su audiencia;
* asistencia cerrada no se modifica sin permiso elevado;
* representaciones son básicas, no legalmente certificadas;
* quórum MVP es informativo/configurable, no validación legal formal;
* votación electrónica queda fuera de alcance;
* firmas electrónicas quedan fuera de alcance;
* actas PDF formales quedan fuera de alcance;
* IA con datos reales queda fuera de alcance;
* notificaciones se hacen mediante `012-communications-notifications`;
* toda operación crítica debe auditarse.

---

## 5. Alcance técnico

### 5.1. Incluido

```text id="hax15e"
Meeting management
Meeting state machine
Meeting agenda management
Meeting participant management
Administrative attendance registration
Optional self attendance check-in
Attendance close workflow
Attendance override workflow
Basic proxy/delegation workflow
Basic quorum calculation
Meeting minutes draft/review/approval/publication workflow
Basic meeting resolutions
Own meetings query
Own attendance query
Own minutes/resolutions query
Domain events for notifications
Audit integration
REST API
OpenAPI
Unit tests
Integration tests
API tests
Authorization tests
Own-resource tests
Multitenancy tests
Security tests
Privacy tests
```

---

### 5.2. Diferido

```text id="kc8g1r"
Electronic voting
Advanced weighted voting
Legal majority rules
Electronic signature
Certified attendance receipt
Notary integration
Video conference integration
Meeting recording
Automatic transcription
AI-generated minutes
Formal PDF minutes generation
Automatic signed minutes delivery
Biometric attendance
Precise geolocation attendance
Dynamic QR attendance
Advanced proxy legal validation
Notarized proxies
Advanced ownership coefficient rules
Automatic execution of resolutions
Automatic fines for absence
Live chat
Live questions
Live comments
Advanced moderation
```

---

## 6. Estructura de carpetas recomendada

```text id="t9wcqs"
apps/api/src/modules/meetings/
├── meetings.module.ts
│
├── meetings.controller.ts
├── meeting-agenda.controller.ts
├── meeting-participants.controller.ts
├── meeting-attendance.controller.ts
├── meeting-proxies.controller.ts
├── meeting-minutes.controller.ts
├── meeting-resolutions.controller.ts
├── my-meetings.controller.ts
│
├── application/
│   ├── use-cases/
│   │   ├── create-meeting.use-case.ts
│   │   ├── list-meetings.use-case.ts
│   │   ├── get-meeting.use-case.ts
│   │   ├── update-meeting.use-case.ts
│   │   ├── schedule-meeting.use-case.ts
│   │   ├── call-meeting.use-case.ts
│   │   ├── start-meeting.use-case.ts
│   │   ├── cancel-meeting.use-case.ts
│   │   ├── close-meeting-attendance.use-case.ts
│   │   ├── complete-meeting.use-case.ts
│   │   ├── archive-meeting.use-case.ts
│   │   ├── calculate-meeting-quorum.use-case.ts
│   │   ├── create-agenda-item.use-case.ts
│   │   ├── list-agenda-items.use-case.ts
│   │   ├── update-agenda-item.use-case.ts
│   │   ├── reorder-agenda-items.use-case.ts
│   │   ├── complete-agenda-item.use-case.ts
│   │   ├── skip-agenda-item.use-case.ts
│   │   ├── archive-agenda-item.use-case.ts
│   │   ├── list-meeting-participants.use-case.ts
│   │   ├── create-meeting-participant.use-case.ts
│   │   ├── replace-meeting-participants.use-case.ts
│   │   ├── update-meeting-participant.use-case.ts
│   │   ├── archive-meeting-participant.use-case.ts
│   │   ├── list-meeting-attendance.use-case.ts
│   │   ├── register-meeting-attendance.use-case.ts
│   │   ├── get-meeting-attendance.use-case.ts
│   │   ├── update-meeting-attendance.use-case.ts
│   │   ├── check-out-meeting-attendance.use-case.ts
│   │   ├── excuse-meeting-attendance.use-case.ts
│   │   ├── archive-meeting-attendance.use-case.ts
│   │   ├── list-meeting-proxies.use-case.ts
│   │   ├── create-meeting-proxy.use-case.ts
│   │   ├── get-meeting-proxy.use-case.ts
│   │   ├── approve-meeting-proxy.use-case.ts
│   │   ├── reject-meeting-proxy.use-case.ts
│   │   ├── cancel-meeting-proxy.use-case.ts
│   │   ├── archive-meeting-proxy.use-case.ts
│   │   ├── create-meeting-minutes.use-case.ts
│   │   ├── get-meeting-minutes.use-case.ts
│   │   ├── update-meeting-minutes.use-case.ts
│   │   ├── submit-meeting-minutes-review.use-case.ts
│   │   ├── approve-meeting-minutes.use-case.ts
│   │   ├── publish-meeting-minutes.use-case.ts
│   │   ├── archive-meeting-minutes.use-case.ts
│   │   ├── create-meeting-resolution.use-case.ts
│   │   ├── list-meeting-resolutions.use-case.ts
│   │   ├── get-meeting-resolution.use-case.ts
│   │   ├── update-meeting-resolution.use-case.ts
│   │   ├── approve-meeting-resolution.use-case.ts
│   │   ├── cancel-meeting-resolution.use-case.ts
│   │   ├── archive-meeting-resolution.use-case.ts
│   │   ├── list-own-meetings.use-case.ts
│   │   ├── get-own-meeting.use-case.ts
│   │   ├── list-own-meeting-agenda.use-case.ts
│   │   ├── get-own-meeting-attendance.use-case.ts
│   │   ├── self-check-in-meeting-attendance.use-case.ts
│   │   ├── get-own-meeting-minutes.use-case.ts
│   │   ├── list-own-meeting-resolutions.use-case.ts
│   │   └── create-own-meeting-proxy.use-case.ts
│   │
│   ├── services/
│   │   ├── meeting.service.ts
│   │   ├── meeting-state-machine.service.ts
│   │   ├── meeting-agenda.service.ts
│   │   ├── meeting-participant.service.ts
│   │   ├── meeting-audience.service.ts
│   │   ├── meeting-attendance.service.ts
│   │   ├── meeting-attendance-policy.service.ts
│   │   ├── meeting-proxy.service.ts
│   │   ├── meeting-quorum.service.ts
│   │   ├── meeting-minutes.service.ts
│   │   ├── meeting-resolution.service.ts
│   │   ├── meeting-notification.service.ts
│   │   ├── meeting-content-sanitizer.service.ts
│   │   └── meeting-audit.service.ts
│   │
│   └── ports/
│       ├── meeting-reader.port.ts
│       ├── meeting-writer.port.ts
│       ├── meeting-agenda-reader.port.ts
│       ├── meeting-agenda-writer.port.ts
│       ├── meeting-participant-reader.port.ts
│       ├── meeting-participant-writer.port.ts
│       ├── meeting-attendance-reader.port.ts
│       ├── meeting-attendance-writer.port.ts
│       ├── meeting-proxy-reader.port.ts
│       ├── meeting-proxy-writer.port.ts
│       ├── meeting-minutes-reader.port.ts
│       ├── meeting-minutes-writer.port.ts
│       ├── meeting-resolution-reader.port.ts
│       ├── meeting-resolution-writer.port.ts
│       ├── meeting-person-directory.port.ts
│       ├── meeting-property-unit.port.ts
│       ├── meeting-role-directory.port.ts
│       ├── meeting-notification.port.ts
│       └── meeting-audit.port.ts
│
├── domain/
│   ├── entities/
│   │   ├── meeting.entity.ts
│   │   ├── meeting-agenda-item.entity.ts
│   │   ├── meeting-participant.entity.ts
│   │   ├── meeting-attendance.entity.ts
│   │   ├── meeting-proxy.entity.ts
│   │   ├── meeting-minutes.entity.ts
│   │   └── meeting-resolution.entity.ts
│   │
│   ├── value-objects/
│   │   ├── meeting-type.vo.ts
│   │   ├── meeting-modality.vo.ts
│   │   ├── meeting-status.vo.ts
│   │   ├── meeting-visibility.vo.ts
│   │   ├── agenda-item-status.vo.ts
│   │   ├── participant-type.vo.ts
│   │   ├── participant-status.vo.ts
│   │   ├── participant-response.vo.ts
│   │   ├── attendance-status.vo.ts
│   │   ├── attendance-registration-method.vo.ts
│   │   ├── proxy-status.vo.ts
│   │   ├── quorum-rule-type.vo.ts
│   │   ├── minutes-status.vo.ts
│   │   ├── resolution-type.vo.ts
│   │   ├── resolution-status.vo.ts
│   │   ├── meeting-title.vo.ts
│   │   ├── agenda-title.vo.ts
│   │   ├── meeting-content.vo.ts
│   │   └── quorum-result.vo.ts
│   │
│   ├── events/
│   │   ├── meeting-created.event.ts
│   │   ├── meeting-updated.event.ts
│   │   ├── meeting-scheduled.event.ts
│   │   ├── meeting-called.event.ts
│   │   ├── meeting-started.event.ts
│   │   ├── meeting-cancelled.event.ts
│   │   ├── meeting-attendance-closed.event.ts
│   │   ├── meeting-completed.event.ts
│   │   ├── meeting-archived.event.ts
│   │   ├── meeting-quorum-calculated.event.ts
│   │   ├── meeting-agenda-updated.event.ts
│   │   ├── meeting-participants-updated.event.ts
│   │   ├── meeting-attendance-registered.event.ts
│   │   ├── meeting-attendance-updated.event.ts
│   │   ├── meeting-proxy-created.event.ts
│   │   ├── meeting-proxy-approved.event.ts
│   │   ├── meeting-proxy-rejected.event.ts
│   │   ├── meeting-minutes-created.event.ts
│   │   ├── meeting-minutes-published.event.ts
│   │   ├── meeting-resolution-recorded.event.ts
│   │   └── meeting-resolution-approved.event.ts
│   │
│   └── errors/
│       ├── meeting-not-found.error.ts
│       ├── meeting-forbidden.error.ts
│       ├── meeting-invalid-transition.error.ts
│       ├── meeting-invalid-schedule.error.ts
│       ├── meeting-cancellation-reason-required.error.ts
│       ├── meeting-cross-tenant-reference.error.ts
│       ├── meeting-participant-invalid.error.ts
│       ├── meeting-attendance-not-found.error.ts
│       ├── meeting-attendance-duplicate.error.ts
│       ├── meeting-attendance-closed.error.ts
│       ├── meeting-attendance-invalid-status.error.ts
│       ├── meeting-proxy-not-found.error.ts
│       ├── meeting-proxy-invalid.error.ts
│       ├── meeting-proxy-not-approved.error.ts
│       ├── meeting-quorum-rule-invalid.error.ts
│       ├── meeting-minutes-not-found.error.ts
│       ├── meeting-minutes-invalid-status.error.ts
│       ├── meeting-resolution-not-found.error.ts
│       ├── meeting-resolution-invalid-status.error.ts
│       └── meeting-content-invalid.error.ts
│
├── infrastructure/
│   ├── persistence/
│   │   ├── prisma-meeting.repository.ts
│   │   ├── prisma-meeting-agenda.repository.ts
│   │   ├── prisma-meeting-participant.repository.ts
│   │   ├── prisma-meeting-attendance.repository.ts
│   │   ├── prisma-meeting-proxy.repository.ts
│   │   ├── prisma-meeting-minutes.repository.ts
│   │   ├── prisma-meeting-resolution.repository.ts
│   │   └── meetings.mapper.ts
│   │
│   ├── integrations/
│   │   ├── meeting-person-directory.adapter.ts
│   │   ├── meeting-property-unit.adapter.ts
│   │   ├── meeting-role-directory.adapter.ts
│   │   └── meeting-notification.adapter.ts
│   │
│   └── audit/
│       └── meeting-audit.adapter.ts
│
├── policies/
│   ├── meeting-permission.guard.ts
│   ├── own-meeting.guard.ts
│   ├── meeting-attendance.guard.ts
│   ├── meeting-proxy.guard.ts
│   ├── meeting-minutes.guard.ts
│   └── meeting-resolution.guard.ts
│
├── dto/
└── tests/
```

---

## 7. Documentación esperada

```text id="r65jog"
docs/specs/013-meetings-attendance/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

Este documento corresponde a:

```text id="efgd0u"
plan.md
```

---

# 8. Diseño de dominio

## 8.1. Meeting

Responsabilidad:

* representar una reunión, asamblea o sesión;
* controlar estado;
* controlar modalidad;
* controlar visibilidad;
* configurar quórum;
* mantener fechas;
* permitir convocatoria;
* permitir cierre;
* permitir archivo lógico;
* servir como raíz de agregado para agenda, participantes, asistencia, proxies, actas y resoluciones.

Campos conceptuales:

```text id="vasnhu"
id
tenantId
title
description
meetingType
modality
location
virtualMeetingUrl
status
visibility
startsAt
endsAt
timezone
calledAt
calledBy
createdBy
updatedBy
cancelledBy
closedBy
archivedBy
cancellationReason
quorumRuleType
quorumRequiredValue
quorumCalculatedValue
quorumMet
attendanceClosedAt
minutesStatus
metadata
createdAt
updatedAt
archivedAt
```

Reglas:

* `tenantId` obligatorio;
* `title` obligatorio;
* `meetingType` obligatorio;
* `modality` obligatoria;
* `startsAt` obligatorio;
* `endsAt`, si existe, debe ser posterior a `startsAt`;
* `virtualMeetingUrl` solo aplica para `virtual` o `hybrid`;
* `location` recomendado para `inPerson` o `hybrid`;
* `status` inicial recomendado: `draft`;
* `calledAt` se asigna al convocar;
* `attendanceClosedAt` se asigna al cerrar asistencia;
* `quorumMet` se calcula, no lo define el cliente;
* `archivedAt` se usa para archivo lógico;
* no se elimina físicamente.

---

## 8.2. MeetingAgendaItem

Responsabilidad:

* representar punto de agenda;
* mantener orden;
* registrar estado;
* permitir notas básicas;
* relacionarse con resoluciones.

Campos conceptuales:

```text id="e9m2gl"
id
tenantId
meetingId
order
title
description
presenterUserId
estimatedMinutes
status
notes
createdAt
updatedAt
archivedAt
```

Reglas:

* pertenece a una reunión del mismo tenant;
* `order` debe ser único por reunión activa;
* `title` obligatorio;
* no se edita en reunión archivada;
* puede completarse o saltarse;
* no se elimina físicamente.

---

## 8.3. MeetingParticipant

Responsabilidad:

* representar convocados, asistentes esperados o audiencia de la reunión;
* soportar participantes por usuario, persona, unidad, rol o grupo.

Campos conceptuales:

```text id="z6rhnh"
id
tenantId
meetingId
participantType
userId
personId
propertyUnitId
roleId
isRequired
status
invitedAt
respondedAt
response
createdAt
archivedAt
```

Reglas:

* pertenece a una reunión del mismo tenant;
* todas las referencias deben pertenecer al mismo tenant;
* `participantType` determina qué referencia es obligatoria;
* no se exponen participantes completos a usuarios no autorizados;
* se archivan, no se eliminan físicamente.

---

## 8.4. MeetingAttendance

Responsabilidad:

* registrar asistencia, ausencia, retraso, salida anticipada, representación o excusa;
* asociar asistencia a participante, usuario, persona, unidad o proxy;
* preservar trazabilidad.

Campos conceptuales:

```text id="dw6zfy"
id
tenantId
meetingId
participantId
userId
personId
propertyUnitId
attendanceStatus
checkInAt
checkOutAt
registeredBy
registrationMethod
notes
isProxy
proxyId
createdAt
updatedAt
archivedAt
```

Reglas:

* pertenece a reunión del mismo tenant;
* debe referenciar participante o sujeto válido;
* no se duplica asistencia activa por mismo sujeto;
* asistencia representada requiere proxy aprobado;
* asistencia cerrada no se modifica sin override;
* no se elimina físicamente.

---

## 8.5. MeetingProxy

Responsabilidad:

* registrar representación básica;
* asociar representado y representante;
* permitir aprobación, rechazo y cancelación.

Campos conceptuales:

```text id="ysvyrf"
id
tenantId
meetingId
representedPersonId
representedUserId
representedPropertyUnitId
representativePersonId
representativeUserId
documentReference
status
approvedBy
approvedAt
rejectedBy
rejectedAt
rejectionReason
createdAt
updatedAt
archivedAt
```

Reglas:

* representado y representante pertenecen al mismo tenant;
* no valida poder legal formal en MVP;
* `documentReference` es referencia, no documento completo;
* `approvedBy` requerido al aprobar;
* `rejectionReason` requerido al rechazar;
* no se elimina físicamente.

---

## 8.6. MeetingMinutes

Responsabilidad:

* registrar acta preliminar;
* permitir flujo draft → review → approved → published;
* proteger contenido privado;
* alimentar futuras actas PDF o firmas.

Campos conceptuales:

```text id="ypjz0f"
id
tenantId
meetingId
title
summary
body
status
preparedBy
reviewedBy
approvedBy
preparedAt
reviewedAt
approvedAt
publishedAt
createdAt
updatedAt
archivedAt
```

Reglas:

* pertenece a reunión del mismo tenant;
* `body` obligatorio;
* se sanitiza contenido;
* no se expone públicamente;
* publicación requiere permiso;
* no se elimina físicamente.

---

## 8.7. MeetingResolution

Responsabilidad:

* registrar resolución básica;
* relacionar resolución con reunión y opcionalmente con agenda;
* no representar votación formal.

Campos conceptuales:

```text id="u6p7ti"
id
tenantId
meetingId
agendaItemId
title
description
resolutionType
status
recordedBy
recordedAt
effectiveFrom
metadata
createdAt
updatedAt
archivedAt
```

Reglas:

* pertenece a reunión del mismo tenant;
* `title` obligatorio;
* `description` obligatoria;
* no ejecuta acción automática;
* no representa votación formal;
* no se expone públicamente;
* no se elimina físicamente.

---

# 9. Value Objects

## 9.1. MeetingType

Valores:

```text id="romsq7"
ordinaryAssembly
extraordinaryAssembly
boardMeeting
committeeMeeting
informationalMeeting
financialMeeting
securityMeeting
maintenanceMeeting
other
```

Responsabilidad:

* clasificar reuniones;
* soportar filtros y reglas futuras;
* permitir políticas por tipo.

---

## 9.2. MeetingModality

Valores:

```text id="f63b1l"
inPerson
virtual
hybrid
```

Reglas:

* `inPerson` recomienda `location`;
* `virtual` recomienda `virtualMeetingUrl`;
* `hybrid` recomienda ambos.

---

## 9.3. MeetingStatus

Valores:

```text id="vqboel"
draft
scheduled
called
inProgress
attendanceClosed
completed
cancelled
archived
```

Responsabilidad:

* validar transiciones;
* controlar edición;
* controlar asistencia;
* controlar cierre;
* controlar archivo.

---

## 9.4. MeetingVisibility

Valores:

```text id="o490or"
private
administrative
tenant
owners
residents
mixed
```

Responsabilidad:

* definir audiencia lógica;
* impedir exposición pública;
* facilitar consultas propias.

---

## 9.5. AgendaItemStatus

Valores:

```text id="q2jv8y"
pending
inProgress
completed
skipped
archived
```

---

## 9.6. ParticipantType

Valores:

```text id="i6hwyr"
user
person
propertyUnit
role
owners
residents
allTenantUsers
boardMembers
committeeMembers
```

---

## 9.7. ParticipantStatus

Valores:

```text id="gqcgff"
invited
confirmed
declined
tentative
attended
absent
represented
archived
```

---

## 9.8. ParticipantResponse

Valores:

```text id="bfvwvy"
pending
confirmed
declined
tentative
```

---

## 9.9. AttendanceStatus

Valores:

```text id="nm9h5k"
present
absent
late
leftEarly
represented
excused
cancelled
archived
```

---

## 9.10. AttendanceRegistrationMethod

Valores:

```text id="mj4mtx"
admin
self
qr
import
system
other
```

MVP recomendado:

```text id="x7qoqp"
admin obligatorio
self opcional bajo política explícita
```

Diferidos:

```text id="s44brj"
qr
import
system advanced
```

---

## 9.11. ProxyStatus

Valores:

```text id="kb6mze"
submitted
approved
rejected
cancelled
archived
```

---

## 9.12. QuorumRuleType

Valores:

```text id="cm0fq3"
none
participantCount
propertyUnitCount
percentageOfExpectedParticipants
percentageOfPropertyUnits
custom
```

MVP recomendado:

```text id="jiu4lf"
participantCount
propertyUnitCount
percentageOfExpectedParticipants
percentageOfPropertyUnits
```

Diferido:

```text id="fczdkz"
custom
```

---

## 9.13. MinutesStatus

Valores:

```text id="i6i1td"
notStarted
draft
underReview
approved
published
archived
```

---

## 9.14. ResolutionType

Valores:

```text id="p23dw6"
informational
administrative
financial
maintenance
security
fine
reservation
other
```

---

## 9.15. ResolutionStatus

Valores:

```text id="esfdln"
draft
recorded
approved
cancelled
archived
```

---

## 9.16. MeetingTitle

Responsabilidad:

* validar título obligatorio;
* limitar longitud;
* normalizar espacios;
* evitar payloads peligrosos.

---

## 9.17. MeetingContent

Responsabilidad:

* validar contenido textual;
* permitir texto o HTML sanitizado;
* bloquear scripts;
* bloquear iframes;
* bloquear contenido activo;
* proteger actas y agenda.

---

## 9.18. QuorumResult

Responsabilidad:

* representar resultado de quórum;
* indicar regla utilizada;
* valor requerido;
* valor calculado;
* si se cumplió o no;
* timestamp de cálculo.

---

# 10. Modelo de datos y persistencia

## 10.1. Tablas nuevas

```text id="kh3bpc"
meetings
meeting_agenda_items
meeting_participants
meeting_attendance
meeting_proxies
meeting_minutes
meeting_resolutions
```

---

## 10.2. Relaciones principales

```text id="t62q8h"
tenants 1 ── * meetings
meetings 1 ── * meeting_agenda_items
meetings 1 ── * meeting_participants
meetings 1 ── * meeting_attendance
meetings 1 ── * meeting_proxies
meetings 1 ── 0..1 meeting_minutes
meetings 1 ── * meeting_resolutions

meeting_agenda_items 1 ── * meeting_resolutions
meeting_participants 1 ── * meeting_attendance
meeting_proxies 1 ── * meeting_attendance
user_profiles 1 ── * meeting_attendance
persons 1 ── * meeting_attendance
property_units 1 ── * meeting_attendance
```

---

## 10.3. Índices recomendados

```text id="dt6riv"
meetings:
- tenant_id
- tenant_id + status
- tenant_id + meeting_type
- tenant_id + modality
- tenant_id + visibility
- tenant_id + starts_at
- tenant_id + archived_at

meeting_agenda_items:
- tenant_id
- tenant_id + meeting_id
- tenant_id + meeting_id + order
- tenant_id + status
- tenant_id + archived_at

meeting_participants:
- tenant_id
- tenant_id + meeting_id
- tenant_id + participant_type
- tenant_id + user_id
- tenant_id + person_id
- tenant_id + property_unit_id
- tenant_id + role_id
- tenant_id + status
- tenant_id + archived_at

meeting_attendance:
- tenant_id
- tenant_id + meeting_id
- tenant_id + participant_id
- tenant_id + user_id
- tenant_id + person_id
- tenant_id + property_unit_id
- tenant_id + attendance_status
- tenant_id + registration_method
- tenant_id + archived_at

meeting_proxies:
- tenant_id
- tenant_id + meeting_id
- tenant_id + represented_person_id
- tenant_id + represented_user_id
- tenant_id + represented_property_unit_id
- tenant_id + representative_person_id
- tenant_id + representative_user_id
- tenant_id + status
- tenant_id + archived_at

meeting_minutes:
- tenant_id
- tenant_id + meeting_id
- tenant_id + status
- tenant_id + published_at
- tenant_id + archived_at

meeting_resolutions:
- tenant_id
- tenant_id + meeting_id
- tenant_id + agenda_item_id
- tenant_id + resolution_type
- tenant_id + status
- tenant_id + recorded_at
- tenant_id + archived_at
```

---

## 10.4. Soft delete

No eliminar físicamente:

```text id="dk5je8"
meetings
meeting_agenda_items
meeting_participants
meeting_attendance
meeting_proxies
meeting_minutes
meeting_resolutions
```

Usar:

```text id="ag57px"
archivedAt
status = archived cuando aplique
```

Motivos:

* trazabilidad;
* auditoría;
* historial de reuniones;
* evidencia de asistencia;
* reportes;
* futuras actas formales;
* futuras votaciones.

---

## 10.5. Multitenancy

Toda consulta tenant-scoped debe aplicar:

```text id="frsw63"
WHERE tenant_id = currentTenant.id
```

No se acepta:

```text id="fgwoy1"
buscar meeting solo por meetingId
buscar agendaItem solo por agendaItemId
buscar participant solo por participantId
buscar attendance solo por attendanceId
buscar proxy solo por proxyId
buscar minutes solo por minutesId
buscar resolution solo por resolutionId
usar userId de otro tenant
usar personId de otro tenant
usar propertyUnitId de otro tenant
usar roleId de otro tenant
```

---

# 11. Puertos de aplicación

## 11.1. MeetingReaderPort

Contrato conceptual:

```text id="bovjnv"
findById(tenantId, meetingId)
list(tenantId, filters, pagination)
listOwn(tenantId, actorUserId, actorPersonIds, propertyUnitIds, roleIds, filters, pagination)
findOwnById(tenantId, actorUserId, actorPersonIds, propertyUnitIds, roleIds, meetingId)
```

---

## 11.2. MeetingWriterPort

Contrato:

```text id="dxv1w5"
create(tenantId, input, actor)
update(tenantId, meetingId, input, actor)
updateStatus(tenantId, meetingId, transition, actor)
updateQuorumResult(tenantId, meetingId, quorumResult, actor)
archive(tenantId, meetingId, actor)
```

---

## 11.3. MeetingAgendaReaderPort

Contrato:

```text id="c9qyfd"
listByMeeting(tenantId, meetingId)
findById(tenantId, agendaItemId)
```

---

## 11.4. MeetingAgendaWriterPort

Contrato:

```text id="mzzmw5"
create(tenantId, meetingId, input, actor)
update(tenantId, agendaItemId, input, actor)
reorder(tenantId, meetingId, orderedItems, actor)
updateStatus(tenantId, agendaItemId, status, actor)
archive(tenantId, agendaItemId, actor)
```

---

## 11.5. MeetingParticipantReaderPort

Contrato:

```text id="ibkejw"
listByMeeting(tenantId, meetingId)
findById(tenantId, participantId)
resolveExpectedParticipants(tenantId, meetingId)
userCanAccessMeeting(tenantId, userId, personIds, propertyUnitIds, roleIds, meetingId)
```

---

## 11.6. MeetingParticipantWriterPort

Contrato:

```text id="g9mqf0"
create(tenantId, meetingId, input, actor)
replaceParticipants(tenantId, meetingId, participants, actor)
update(tenantId, participantId, input, actor)
updateStatus(tenantId, participantId, status, actor)
archive(tenantId, participantId, actor)
```

---

## 11.7. MeetingAttendanceReaderPort

Contrato:

```text id="pl2q1c"
listByMeeting(tenantId, meetingId, filters, pagination)
findById(tenantId, attendanceId)
findActiveBySubject(tenantId, meetingId, subject)
listOwn(tenantId, actorUserId, personIds, propertyUnitIds, meetingId)
countPresent(tenantId, meetingId)
countPresentPropertyUnits(tenantId, meetingId)
```

---

## 11.8. MeetingAttendanceWriterPort

Contrato:

```text id="q497va"
register(tenantId, meetingId, input, actor)
update(tenantId, attendanceId, input, actor)
checkOut(tenantId, attendanceId, input, actor)
excuse(tenantId, attendanceId, input, actor)
archive(tenantId, attendanceId, actor)
```

---

## 11.9. MeetingProxyReaderPort

Contrato:

```text id="wlvi7l"
listByMeeting(tenantId, meetingId)
findById(tenantId, proxyId)
findApprovedProxyForSubject(tenantId, meetingId, representedSubject)
listOwn(tenantId, actorUserId, personIds, propertyUnitIds, filters, pagination)
```

---

## 11.10. MeetingProxyWriterPort

Contrato:

```text id="xdw7gq"
create(tenantId, meetingId, input, actor)
approve(tenantId, proxyId, actor)
reject(tenantId, proxyId, reason, actor)
cancel(tenantId, proxyId, reason, actor)
archive(tenantId, proxyId, actor)
```

---

## 11.11. MeetingMinutesReaderPort

Contrato:

```text id="ikoyjy"
findByMeeting(tenantId, meetingId)
findById(tenantId, minutesId)
findOwnByMeeting(tenantId, actorUserId, personIds, propertyUnitIds, roleIds, meetingId)
```

---

## 11.12. MeetingMinutesWriterPort

Contrato:

```text id="e05qmg"
create(tenantId, meetingId, input, actor)
update(tenantId, minutesId, input, actor)
submitReview(tenantId, minutesId, actor)
approve(tenantId, minutesId, actor)
publish(tenantId, minutesId, actor)
archive(tenantId, minutesId, actor)
```

---

## 11.13. MeetingResolutionReaderPort

Contrato:

```text id="h8jau7"
listByMeeting(tenantId, meetingId)
findById(tenantId, resolutionId)
listOwnByMeeting(tenantId, actorUserId, personIds, propertyUnitIds, roleIds, meetingId)
```

---

## 11.14. MeetingResolutionWriterPort

Contrato:

```text id="neurrj"
create(tenantId, meetingId, input, actor)
update(tenantId, resolutionId, input, actor)
approve(tenantId, resolutionId, actor)
cancel(tenantId, resolutionId, reason, actor)
archive(tenantId, resolutionId, actor)
```

---

## 11.15. MeetingPersonDirectoryPort

Contrato:

```text id="h1sp5v"
findPersonById(tenantId, personId)
findPersonsByUser(tenantId, userId)
findOwners(tenantId)
findResidents(tenantId)
personBelongsToTenant(tenantId, personId)
```

---

## 11.16. MeetingPropertyUnitPort

Contrato:

```text id="jfcgv7"
findPropertyUnitById(tenantId, propertyUnitId)
findPropertyUnitsForUser(tenantId, userId)
propertyUnitBelongsToTenant(tenantId, propertyUnitId)
userCanAccessPropertyUnit(tenantId, userId, propertyUnitId)
```

---

## 11.17. MeetingRoleDirectoryPort

Contrato:

```text id="br807t"
findRoleById(tenantId, roleId)
findUsersByRole(tenantId, roleId)
findBoardMembers(tenantId)
findCommitteeMembers(tenantId)
roleBelongsToTenantOrIsValidSystemRole(tenantId, roleId)
```

---

## 11.18. MeetingNotificationPort

Contrato:

```text id="l5nx1h"
notifyMeetingCalled(tenantId, meetingId, audience)
notifyMeetingUpdated(tenantId, meetingId, audience)
notifyMeetingCancelled(tenantId, meetingId, audience)
notifyMinutesPublished(tenantId, meetingId, audience)
```

Implementación:

```text id="yssxzz"
Adapter hacia 012-communications-notifications.
```

---

## 11.19. MeetingAuditPort

Contrato:

```text id="z4z0ew"
auditMeetingCreated(...)
auditMeetingUpdated(...)
auditMeetingCalled(...)
auditMeetingStarted(...)
auditMeetingCancelled(...)
auditMeetingAttendanceClosed(...)
auditMeetingCompleted(...)
auditMeetingArchived(...)
auditAgendaUpdated(...)
auditParticipantUpdated(...)
auditAttendanceRegistered(...)
auditAttendanceUpdated(...)
auditProxyCreated(...)
auditProxyApproved(...)
auditQuorumCalculated(...)
auditMinutesPublished(...)
auditResolutionRecorded(...)
```

---

# 12. Servicios de aplicación

## 12.1. MeetingService

Responsabilidades:

* crear reuniones;
* actualizar reuniones;
* consultar reuniones;
* validar fechas;
* validar estado editable;
* coordinar estado;
* coordinar auditoría.

---

## 12.2. MeetingStateMachineService

Responsabilidades:

* validar transiciones de reunión;
* bloquear transiciones inválidas;
* determinar estados editables;
* determinar estados que permiten asistencia;
* determinar estados que permiten acta;
* determinar estados terminales.

Transiciones principales:

```text id="yzekww"
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

---

## 12.3. MeetingAgendaService

Responsabilidades:

* crear puntos de agenda;
* actualizar puntos;
* reordenar agenda;
* completar puntos;
* saltar puntos;
* archivar puntos;
* validar reunión y tenant;
* auditar cambios.

---

## 12.4. MeetingParticipantService

Responsabilidades:

* crear participantes;
* reemplazar audiencia;
* validar referencias;
* resolver audiencia;
* actualizar respuestas;
* archivar participantes;
* deduplicar participantes finales;
* auditar cambios.

---

## 12.5. MeetingAudienceService

Responsabilidades:

* determinar si un usuario puede ver una reunión;
* resolver propietarios;
* resolver residentes;
* resolver usuarios por rol;
* resolver usuarios por unidad;
* validar audiencia propia;
* evitar exposición de reuniones ajenas.

---

## 12.6. MeetingAttendanceService

Responsabilidades:

* registrar asistencia;
* marcar ausencia;
* marcar tardanza;
* registrar salida;
* registrar excusa;
* validar duplicados;
* validar reunión en estado permitido;
* validar cierre de asistencia;
* validar override;
* auditar cambios.

---

## 12.7. MeetingAttendancePolicyService

Responsabilidades:

* determinar si self check-in está habilitado;
* determinar si se permite asistencia tardía;
* determinar si se permite salida anticipada;
* determinar si se permite override luego de cerrar asistencia;
* determinar si asistencia requiere participante previo;
* determinar ventana de check-in si se define.

---

## 12.8. MeetingProxyService

Responsabilidades:

* crear proxy/delegación básica;
* validar representado;
* validar representante;
* aprobar proxy;
* rechazar proxy;
* cancelar proxy;
* validar proxy aprobado para asistencia representada;
* auditar cambios.

---

## 12.9. MeetingQuorumService

Responsabilidades:

* calcular quórum;
* usar regla configurada;
* contar participantes presentes;
* contar unidades presentes;
* calcular porcentaje simple;
* guardar resultado;
* no modificar asistencia;
* auditar cálculo.

Reglas MVP:

```text id="xd1nhd"
none
participantCount
propertyUnitCount
percentageOfExpectedParticipants
percentageOfPropertyUnits
```

`custom` queda diferido o se usa solo como placeholder sin lógica avanzada.

---

## 12.10. MeetingMinutesService

Responsabilidades:

* crear acta;
* actualizar acta;
* enviar a revisión;
* aprobar acta;
* publicar acta;
* archivar acta;
* sanitizar contenido;
* emitir evento de notificación;
* auditar cambios.

---

## 12.11. MeetingResolutionService

Responsabilidades:

* crear resolución;
* actualizar resolución;
* aprobar resolución;
* cancelar resolución;
* archivar resolución;
* validar reunión;
* validar agenda opcional;
* no ejecutar acciones automáticas;
* auditar cambios.

---

## 12.12. MeetingNotificationService

Responsabilidades:

* emitir eventos hacia `012-communications-notifications`;
* no enviar emails directamente;
* no enviar WhatsApp/SMS/push directamente;
* construir payload mínimo;
* aplicar idempotencia por evento cuando corresponda.

Eventos candidatos:

```text id="sfu9pf"
meeting.called
meeting.updated
meeting.cancelled
meeting.minutesPublished
```

---

## 12.13. MeetingContentSanitizerService

Responsabilidades:

* sanitizar título;
* sanitizar descripción;
* sanitizar agenda;
* sanitizar actas;
* sanitizar resoluciones;
* bloquear scripts;
* bloquear iframes;
* bloquear contenido activo;
* evitar logs con cuerpo completo.

---

## 12.14. MeetingAuditService

Responsabilidades:

* emitir eventos hacia `007-audit`;
* sanitizar metadata;
* evitar payload completo;
* evitar cuerpo completo del acta;
* incluir traceId/correlationId;
* registrar actor y recurso.

---

# 13. Casos de uso principales

## 13.1. CreateMeetingUseCase

Endpoint:

```text id="batig2"
POST /api/v1/tenant/meetings
```

Responsabilidades:

* validar permiso `meetings.create`;
* validar DTO;
* derivar tenant;
* crear reunión en `draft`;
* auditar `meeting.created`.

---

## 13.2. ListMeetingsUseCase

Endpoint:

```text id="eoxds6"
GET /api/v1/tenant/meetings
```

Responsabilidades:

* validar permiso `meetings.read`;
* filtrar por tipo, estado, modalidad, visibilidad, fechas;
* paginar;
* aplicar tenant.

---

## 13.3. GetMeetingUseCase

Endpoint:

```text id="j0d74u"
GET /api/v1/tenant/meetings/{meetingId}
```

Responsabilidades:

* validar permiso;
* cargar reunión por tenant;
* devolver detalle administrativo.

---

## 13.4. UpdateMeetingUseCase

Endpoint:

```text id="uxrpqi"
PATCH /api/v1/tenant/meetings/{meetingId}
```

Responsabilidades:

* validar permiso `meetings.update`;
* validar estado editable;
* sanitizar contenido;
* validar fechas;
* auditar `meeting.updated`.

---

## 13.5. ScheduleMeetingUseCase

Endpoint:

```text id="dkgk5y"
POST /api/v1/tenant/meetings/{meetingId}/schedule
```

Responsabilidades:

* validar permiso `meetings.schedule`;
* validar estado `draft`;
* validar fecha futura o permitida;
* cambiar a `scheduled`;
* auditar `meeting.scheduled`.

---

## 13.6. CallMeetingUseCase

Endpoint:

```text id="xrh47a"
POST /api/v1/tenant/meetings/{meetingId}/call
```

Responsabilidades:

* validar permiso `meetings.call`;
* validar participantes;
* cambiar estado a `called`;
* registrar `calledAt` y `calledBy`;
* emitir evento de notificación si aplica;
* auditar `meeting.called`.

---

## 13.7. StartMeetingUseCase

Endpoint:

```text id="z5tlfr"
POST /api/v1/tenant/meetings/{meetingId}/start
```

Responsabilidades:

* validar permiso `meetings.start`;
* validar estado `called` o `scheduled` según política;
* cambiar estado a `inProgress`;
* auditar `meeting.started`.

---

## 13.8. CloseMeetingAttendanceUseCase

Endpoint:

```text id="qjvf6b"
POST /api/v1/tenant/meetings/{meetingId}/close-attendance
```

Responsabilidades:

* validar permiso `meetingAttendance.close`;
* validar estado `inProgress`;
* registrar `attendanceClosedAt`;
* cambiar estado a `attendanceClosed`;
* auditar `meeting.attendanceClosed`.

---

## 13.9. CompleteMeetingUseCase

Endpoint:

```text id="mv0nqm"
POST /api/v1/tenant/meetings/{meetingId}/complete
```

Responsabilidades:

* validar permiso `meetings.complete`;
* validar estado `inProgress` o `attendanceClosed`;
* cambiar estado a `completed`;
* auditar `meeting.completed`.

---

## 13.10. CancelMeetingUseCase

Endpoint:

```text id="nsg6la"
POST /api/v1/tenant/meetings/{meetingId}/cancel
```

Responsabilidades:

* validar permiso `meetings.cancel`;
* validar estado cancelable;
* exigir razón;
* cambiar a `cancelled`;
* emitir evento de notificación si aplica;
* auditar `meeting.cancelled`.

---

## 13.11. ArchiveMeetingUseCase

Endpoint:

```text id="kp9zsl"
POST /api/v1/tenant/meetings/{meetingId}/archive
```

Responsabilidades:

* validar permiso `meetings.archive`;
* validar estado archivable;
* aplicar archivo lógico;
* auditar `meeting.archived`.

---

## 13.12. CalculateMeetingQuorumUseCase

Endpoint:

```text id="ul5nwd"
POST /api/v1/tenant/meetings/{meetingId}/calculate-quorum
```

Responsabilidades:

* validar permiso `meetingQuorum.calculate`;
* calcular según regla;
* guardar resultado;
* no modificar asistencia;
* auditar `meeting.quorumCalculated`.

---

## 13.13. Agenda use cases

Endpoints:

```text id="agngla"
GET    /api/v1/tenant/meetings/{meetingId}/agenda
POST   /api/v1/tenant/meetings/{meetingId}/agenda
PATCH  /api/v1/tenant/meeting-agenda-items/{agendaItemId}
POST   /api/v1/tenant/meetings/{meetingId}/agenda/reorder
POST   /api/v1/tenant/meeting-agenda-items/{agendaItemId}/complete
POST   /api/v1/tenant/meeting-agenda-items/{agendaItemId}/skip
POST   /api/v1/tenant/meeting-agenda-items/{agendaItemId}/archive
```

Responsabilidades:

* validar permisos de agenda;
* validar reunión;
* mantener orden;
* controlar estado;
* auditar cambios.

---

## 13.14. Participant use cases

Endpoints:

```text id="x8swjy"
GET    /api/v1/tenant/meetings/{meetingId}/participants
POST   /api/v1/tenant/meetings/{meetingId}/participants
PUT    /api/v1/tenant/meetings/{meetingId}/participants
PATCH  /api/v1/tenant/meeting-participants/{participantId}
POST   /api/v1/tenant/meeting-participants/{participantId}/archive
```

Responsabilidades:

* validar participantes;
* evitar cross-tenant;
* reemplazar audiencia;
* emitir eventos de notificación si aplica;
* auditar.

---

## 13.15. Attendance use cases

Endpoints:

```text id="tvbekr"
GET    /api/v1/tenant/meetings/{meetingId}/attendance
POST   /api/v1/tenant/meetings/{meetingId}/attendance
GET    /api/v1/tenant/meeting-attendance/{attendanceId}
PATCH  /api/v1/tenant/meeting-attendance/{attendanceId}
POST   /api/v1/tenant/meeting-attendance/{attendanceId}/check-out
POST   /api/v1/tenant/meeting-attendance/{attendanceId}/excuse
POST   /api/v1/tenant/meeting-attendance/{attendanceId}/archive
```

Responsabilidades:

* registrar asistencia;
* validar participante;
* validar persona/unidad/usuario;
* bloquear duplicados;
* validar reunión en estado permitido;
* auditar.

---

## 13.16. Proxy use cases

Endpoints:

```text id="ezlkvo"
GET    /api/v1/tenant/meetings/{meetingId}/proxies
POST   /api/v1/tenant/meetings/{meetingId}/proxies
GET    /api/v1/tenant/meeting-proxies/{proxyId}
POST   /api/v1/tenant/meeting-proxies/{proxyId}/approve
POST   /api/v1/tenant/meeting-proxies/{proxyId}/reject
POST   /api/v1/tenant/meeting-proxies/{proxyId}/cancel
POST   /api/v1/tenant/meeting-proxies/{proxyId}/archive
```

Responsabilidades:

* gestionar representación básica;
* validar representado;
* validar representante;
* aprobar/rechazar/cancelar;
* auditar.

---

## 13.17. Minutes use cases

Endpoints:

```text id="q0pcps"
GET    /api/v1/tenant/meetings/{meetingId}/minutes
POST   /api/v1/tenant/meetings/{meetingId}/minutes
GET    /api/v1/tenant/meeting-minutes/{minutesId}
PATCH  /api/v1/tenant/meeting-minutes/{minutesId}
POST   /api/v1/tenant/meeting-minutes/{minutesId}/submit-review
POST   /api/v1/tenant/meeting-minutes/{minutesId}/approve
POST   /api/v1/tenant/meeting-minutes/{minutesId}/publish
POST   /api/v1/tenant/meeting-minutes/{minutesId}/archive
```

Responsabilidades:

* crear acta preliminar;
* actualizar acta;
* revisar/aprobar/publicar;
* emitir evento si se publica;
* auditar.

---

## 13.18. Resolution use cases

Endpoints:

```text id="l4z6r3"
GET    /api/v1/tenant/meetings/{meetingId}/resolutions
POST   /api/v1/tenant/meetings/{meetingId}/resolutions
GET    /api/v1/tenant/meeting-resolutions/{resolutionId}
PATCH  /api/v1/tenant/meeting-resolutions/{resolutionId}
POST   /api/v1/tenant/meeting-resolutions/{resolutionId}/approve
POST   /api/v1/tenant/meeting-resolutions/{resolutionId}/cancel
POST   /api/v1/tenant/meeting-resolutions/{resolutionId}/archive
```

Responsabilidades:

* registrar resolución;
* asociar agenda opcional;
* aprobar/cancelar/archivar;
* no ejecutar acciones automáticas;
* auditar.

---

## 13.19. Own meetings use cases

Endpoints:

```text id="ybya9r"
GET    /api/v1/me/meetings
GET    /api/v1/me/meetings/{meetingId}
GET    /api/v1/me/meetings/{meetingId}/agenda
GET    /api/v1/me/meetings/{meetingId}/attendance
POST   /api/v1/me/meetings/{meetingId}/attendance/check-in
GET    /api/v1/me/meetings/{meetingId}/minutes
GET    /api/v1/me/meetings/{meetingId}/resolutions
GET    /api/v1/me/meeting-proxies
POST   /api/v1/me/meetings/{meetingId}/proxies
```

Responsabilidades:

* validar usuario autenticado;
* resolver personas y unidades del usuario;
* validar audiencia;
* devolver DTO minimizado;
* no exponer asistentes de terceros;
* no exponer actas ajenas;
* permitir self check-in solo si política lo habilita.

---

# 14. Controladores REST

## 14.1. MeetingsController

Ruta base:

```text id="pan5id"
/api/v1/tenant/meetings
```

Endpoints:

```text id="raurpj"
GET /
POST /
GET /:meetingId
PATCH /:meetingId
POST /:meetingId/schedule
POST /:meetingId/call
POST /:meetingId/start
POST /:meetingId/cancel
POST /:meetingId/close-attendance
POST /:meetingId/complete
POST /:meetingId/archive
POST /:meetingId/calculate-quorum
```

Guards:

```text id="vsa5th"
AuthGuard
TenantGuard
TenantPermissionGuard
MeetingPermissionGuard
```

---

## 14.2. MeetingAgendaController

Rutas:

```text id="uuhjqi"
/api/v1/tenant/meetings/:meetingId/agenda
/api/v1/tenant/meeting-agenda-items/:agendaItemId
```

Endpoints:

```text id="y86x3i"
GET /api/v1/tenant/meetings/:meetingId/agenda
POST /api/v1/tenant/meetings/:meetingId/agenda
GET /api/v1/tenant/meeting-agenda-items/:agendaItemId
PATCH /api/v1/tenant/meeting-agenda-items/:agendaItemId
POST /api/v1/tenant/meetings/:meetingId/agenda/reorder
POST /api/v1/tenant/meeting-agenda-items/:agendaItemId/complete
POST /api/v1/tenant/meeting-agenda-items/:agendaItemId/skip
POST /api/v1/tenant/meeting-agenda-items/:agendaItemId/archive
```

---

## 14.3. MeetingParticipantsController

Rutas:

```text id="bgqadf"
/api/v1/tenant/meetings/:meetingId/participants
/api/v1/tenant/meeting-participants/:participantId
```

Endpoints:

```text id="tv79ze"
GET /api/v1/tenant/meetings/:meetingId/participants
POST /api/v1/tenant/meetings/:meetingId/participants
PUT /api/v1/tenant/meetings/:meetingId/participants
GET /api/v1/tenant/meeting-participants/:participantId
PATCH /api/v1/tenant/meeting-participants/:participantId
POST /api/v1/tenant/meeting-participants/:participantId/archive
```

---

## 14.4. MeetingAttendanceController

Rutas:

```text id="vho2kz"
/api/v1/tenant/meetings/:meetingId/attendance
/api/v1/tenant/meeting-attendance/:attendanceId
```

Endpoints:

```text id="fbpllu"
GET /api/v1/tenant/meetings/:meetingId/attendance
POST /api/v1/tenant/meetings/:meetingId/attendance
GET /api/v1/tenant/meeting-attendance/:attendanceId
PATCH /api/v1/tenant/meeting-attendance/:attendanceId
POST /api/v1/tenant/meeting-attendance/:attendanceId/check-out
POST /api/v1/tenant/meeting-attendance/:attendanceId/excuse
POST /api/v1/tenant/meeting-attendance/:attendanceId/archive
```

---

## 14.5. MeetingProxiesController

Rutas:

```text id="oexbj3"
/api/v1/tenant/meetings/:meetingId/proxies
/api/v1/tenant/meeting-proxies/:proxyId
```

Endpoints:

```text id="vcuv0x"
GET /api/v1/tenant/meetings/:meetingId/proxies
POST /api/v1/tenant/meetings/:meetingId/proxies
GET /api/v1/tenant/meeting-proxies/:proxyId
POST /api/v1/tenant/meeting-proxies/:proxyId/approve
POST /api/v1/tenant/meeting-proxies/:proxyId/reject
POST /api/v1/tenant/meeting-proxies/:proxyId/cancel
POST /api/v1/tenant/meeting-proxies/:proxyId/archive
```

---

## 14.6. MeetingMinutesController

Rutas:

```text id="flcbzd"
/api/v1/tenant/meetings/:meetingId/minutes
/api/v1/tenant/meeting-minutes/:minutesId
```

Endpoints:

```text id="ojwrqz"
GET /api/v1/tenant/meetings/:meetingId/minutes
POST /api/v1/tenant/meetings/:meetingId/minutes
GET /api/v1/tenant/meeting-minutes/:minutesId
PATCH /api/v1/tenant/meeting-minutes/:minutesId
POST /api/v1/tenant/meeting-minutes/:minutesId/submit-review
POST /api/v1/tenant/meeting-minutes/:minutesId/approve
POST /api/v1/tenant/meeting-minutes/:minutesId/publish
POST /api/v1/tenant/meeting-minutes/:minutesId/archive
```

---

## 14.7. MeetingResolutionsController

Rutas:

```text id="cqyrnr"
/api/v1/tenant/meetings/:meetingId/resolutions
/api/v1/tenant/meeting-resolutions/:resolutionId
```

Endpoints:

```text id="dqq27m"
GET /api/v1/tenant/meetings/:meetingId/resolutions
POST /api/v1/tenant/meetings/:meetingId/resolutions
GET /api/v1/tenant/meeting-resolutions/:resolutionId
PATCH /api/v1/tenant/meeting-resolutions/:resolutionId
POST /api/v1/tenant/meeting-resolutions/:resolutionId/approve
POST /api/v1/tenant/meeting-resolutions/:resolutionId/cancel
POST /api/v1/tenant/meeting-resolutions/:resolutionId/archive
```

---

## 14.8. MyMeetingsController

Ruta base:

```text id="yog4ag"
/api/v1/me/meetings
```

Endpoints:

```text id="pu4ihp"
GET /
GET /:meetingId
GET /:meetingId/agenda
GET /:meetingId/attendance
POST /:meetingId/attendance/check-in
GET /:meetingId/minutes
GET /:meetingId/resolutions
GET /api/v1/me/meeting-proxies
POST /:meetingId/proxies
```

Guards:

```text id="m2u2er"
AuthGuard
TenantGuard
TenantPermissionGuard
OwnMeetingGuard
```

---

# 15. DTOs principales

## 15.1. CreateMeetingDto

```json id="id0jzu"
{
  "title": "Asamblea ordinaria 2026",
  "description": "Asamblea ordinaria anual del conjunto.",
  "meetingType": "ordinaryAssembly",
  "modality": "inPerson",
  "location": "Salón comunal",
  "virtualMeetingUrl": null,
  "visibility": "owners",
  "startsAt": "2026-08-15T14:00:00Z",
  "endsAt": "2026-08-15T17:00:00Z",
  "timezone": "America/Guayaquil",
  "quorumRuleType": "percentageOfPropertyUnits",
  "quorumRequiredValue": "50.00"
}
```

---

## 15.2. MeetingAdminDto

```json id="z0b197"
{
  "id": "meeting_uuid",
  "title": "Asamblea ordinaria 2026",
  "description": "Asamblea ordinaria anual del conjunto.",
  "meetingType": "ordinaryAssembly",
  "modality": "inPerson",
  "location": "Salón comunal",
  "virtualMeetingUrl": null,
  "status": "draft",
  "visibility": "owners",
  "startsAt": "2026-08-15T14:00:00Z",
  "endsAt": "2026-08-15T17:00:00Z",
  "timezone": "America/Guayaquil",
  "calledAt": null,
  "quorumRuleType": "percentageOfPropertyUnits",
  "quorumRequiredValue": "50.00",
  "quorumCalculatedValue": null,
  "quorumMet": null,
  "attendanceClosedAt": null,
  "minutesStatus": "notStarted",
  "createdAt": "2026-07-19T10:00:00Z",
  "updatedAt": "2026-07-19T10:00:00Z"
}
```

---

## 15.3. CreateAgendaItemDto

```json id="gh4jri"
{
  "order": 1,
  "title": "Lectura del acta anterior",
  "description": "Revisión y aprobación del acta anterior.",
  "presenterUserId": "user_uuid",
  "estimatedMinutes": 15
}
```

---

## 15.4. CreateMeetingParticipantDto

```json id="o08hy2"
{
  "participantType": "propertyUnit",
  "propertyUnitId": "property_unit_uuid",
  "isRequired": true
}
```

---

## 15.5. ReplaceMeetingParticipantsDto

```json id="d13j8m"
{
  "participants": [
    {
      "participantType": "owners",
      "isRequired": true
    },
    {
      "participantType": "role",
      "roleId": "role_uuid",
      "isRequired": false
    }
  ],
  "notifyParticipants": true
}
```

---

## 15.6. RegisterMeetingAttendanceDto

```json id="nk9d3k"
{
  "participantId": "participant_uuid",
  "userId": "user_uuid",
  "personId": "person_uuid",
  "propertyUnitId": "property_unit_uuid",
  "attendanceStatus": "present",
  "checkInAt": "2026-08-15T14:05:00Z",
  "registrationMethod": "admin",
  "notes": "Registro manual por administración."
}
```

---

## 15.7. CreateMeetingProxyDto

```json id="capyye"
{
  "representedPersonId": "person_uuid",
  "representedPropertyUnitId": "property_unit_uuid",
  "representativePersonId": "representative_person_uuid",
  "representativeUserId": "representative_user_uuid",
  "documentReference": "storage://tenant/meetings/proxies/proxy_uuid.pdf"
}
```

---

## 15.8. CreateMeetingMinutesDto

```json id="e71ob2"
{
  "title": "Acta preliminar de asamblea ordinaria 2026",
  "summary": "Resumen de los puntos tratados en la reunión.",
  "body": "Contenido preliminar del acta."
}
```

---

## 15.9. CreateMeetingResolutionDto

```json id="guad0x"
{
  "agendaItemId": "agenda_item_uuid",
  "title": "Aprobación de mantenimiento de áreas comunes",
  "description": "Se registra la resolución básica de continuar con el mantenimiento planificado.",
  "resolutionType": "maintenance",
  "effectiveFrom": "2026-09-01T05:00:00Z"
}
```

---

## 15.10. OwnMeetingDto

```json id="dwcm3x"
{
  "id": "meeting_uuid",
  "title": "Asamblea ordinaria 2026",
  "meetingType": "ordinaryAssembly",
  "modality": "inPerson",
  "location": "Salón comunal",
  "status": "called",
  "visibility": "owners",
  "startsAt": "2026-08-15T14:00:00Z",
  "endsAt": "2026-08-15T17:00:00Z",
  "timezone": "America/Guayaquil",
  "myAttendanceStatus": null,
  "minutesAvailable": false
}
```

---

# 16. Autenticación y autorización

## 16.1. Endpoints tenant administrativos

Requieren:

```text id="bsk5op"
AuthGuard
TenantGuard
TenantPermissionGuard
MeetingPermissionGuard
```

---

## 16.2. Endpoints `/me`

Requieren:

```text id="ntg4lt"
AuthGuard
TenantGuard
TenantPermissionGuard
OwnMeetingGuard
```

---

## 16.3. Endpoints públicos

MVP no expone endpoints públicos para reuniones.

No deben existir:

```text id="b9dwpf"
GET /api/v1/public/tenants/{slug}/meetings
GET /api/v1/public/tenants/{slug}/meetings/{meetingId}
GET /api/v1/public/tenants/{slug}/meetings/{meetingId}/attendance
GET /api/v1/public/tenants/{slug}/meetings/{meetingId}/minutes
GET /api/v1/public/tenants/{slug}/meetings/{meetingId}/resolutions
```

---

## 16.4. Permisos

Meetings administrativas:

```text id="lumbov"
meetings.create
meetings.read
meetings.update
meetings.schedule
meetings.call
meetings.start
meetings.cancel
meetings.complete
meetings.archive
```

Agenda:

```text id="nxbv94"
meetingAgenda.create
meetingAgenda.read
meetingAgenda.update
meetingAgenda.reorder
meetingAgenda.archive
```

Participantes:

```text id="w76rdm"
meetingParticipants.create
meetingParticipants.read
meetingParticipants.update
meetingParticipants.archive
```

Asistencia:

```text id="b7mkwy"
meetingAttendance.create
meetingAttendance.read
meetingAttendance.update
meetingAttendance.close
meetingAttendance.override
meetingAttendance.read.own
meetingAttendance.create.own
```

Representaciones:

```text id="do3fpn"
meetingProxies.create
meetingProxies.read
meetingProxies.approve
meetingProxies.reject
meetingProxies.cancel
meetingProxies.create.own
meetingProxies.read.own
```

Quórum:

```text id="ubpi57"
meetingQuorum.calculate
meetingQuorum.read
```

Actas:

```text id="n44094"
meetingMinutes.create
meetingMinutes.read
meetingMinutes.update
meetingMinutes.review
meetingMinutes.approve
meetingMinutes.publish
meetingMinutes.archive
meetingMinutes.read.own
```

Resoluciones:

```text id="sr0leg"
meetingResolutions.create
meetingResolutions.read
meetingResolutions.update
meetingResolutions.approve
meetingResolutions.cancel
meetingResolutions.archive
meetingResolutions.read.own
```

Auditoría y reportes:

```text id="pmk8dy"
meetings.audit.read
meetings.reports.read
```

---

# 17. Integración con `012-communications-notifications`

## 17.1. Eventos emitidos

El módulo debe emitir eventos internos para que `012-communications-notifications` genere notificaciones.

Eventos mínimos:

```text id="ki1vux"
meeting.called
meeting.updated
meeting.cancelled
meeting.minutesPublished
```

Eventos opcionales:

```text id="mdlm27"
meeting.scheduled
meeting.reminderRequested
meeting.attendanceClosed
meeting.completed
```

---

## 17.2. Payload mínimo

```json id="ivpx5h"
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

## 17.3. Reglas

* Meetings no envía email directamente.
* Meetings no envía WhatsApp directamente.
* Meetings no envía SMS directamente.
* Meetings no envía push directamente.
* Meetings solo emite eventos o invoca puerto de notificaciones.
* La entrega la resuelve `012-communications-notifications`.
* El payload debe ser mínimo.
* No debe incluir lista completa de participantes si no es necesario.
* No debe incluir acta completa privada en notificación externa.

---

# 18. Cálculo de quórum

## 18.1. Tipos de regla MVP

```text id="b65g02"
none
participantCount
propertyUnitCount
percentageOfExpectedParticipants
percentageOfPropertyUnits
```

---

## 18.2. Regla `none`

Resultado:

```text id="la0p30"
quorumMet = null
quorumCalculatedValue = null
```

o:

```text id="xbsy3f"
quorumMet = true
```

según política del tenant.

Recomendación MVP:

```text id="bd8scd"
Usar null para indicar que no se requiere cálculo.
```

---

## 18.3. Regla `participantCount`

```text id="bbvvkm"
quorumMet = presentParticipantCount >= quorumRequiredValue
```

---

## 18.4. Regla `propertyUnitCount`

```text id="s3767t"
quorumMet = presentPropertyUnitCount >= quorumRequiredValue
```

---

## 18.5. Regla `percentageOfExpectedParticipants`

```text id="jx0sye"
quorumCalculatedValue = presentParticipantCount / expectedParticipantCount * 100
quorumMet = quorumCalculatedValue >= quorumRequiredValue
```

---

## 18.6. Regla `percentageOfPropertyUnits`

```text id="labcd3"
quorumCalculatedValue = representedOrPresentPropertyUnitCount / expectedPropertyUnitCount * 100
quorumMet = quorumCalculatedValue >= quorumRequiredValue
```

---

## 18.7. Consideraciones

* usar Decimal para porcentajes;
* no usar float para valores persistidos;
* cálculo debe ser determinístico;
* registrar timestamp;
* registrar regla usada;
* no modificar asistencia;
* auditar cálculo;
* `custom` queda diferido.

---

# 19. Flujo técnico recomendado

## 19.1. Crear y convocar reunión

```text id="qr4tqn"
1. Admin crea reunión en draft.
2. Admin agrega agenda.
3. Admin define participantes o audiencia.
4. Admin programa reunión.
5. Admin convoca reunión.
6. Sistema registra calledAt.
7. Sistema emite meeting.called.
8. Notifications genera notificaciones.
```

---

## 19.2. Registrar asistencia

```text id="lvqbm3"
1. Admin inicia reunión.
2. Admin registra asistencias.
3. Sistema valida participante/persona/unidad.
4. Sistema evita duplicados.
5. Sistema registra attendance.
6. Sistema audita.
```

---

## 19.3. Cerrar asistencia y calcular quórum

```text id="xcwwgh"
1. Admin cierra asistencia.
2. Sistema bloquea cambios ordinarios.
3. Admin calcula quórum.
4. Sistema cuenta asistentes/unidades.
5. Sistema guarda resultado.
6. Sistema audita.
```

---

## 19.4. Registrar acta y resoluciones

```text id="bn9k1t"
1. Admin crea acta draft.
2. Admin registra resoluciones básicas.
3. Admin envía acta a revisión.
4. Admin aprueba acta.
5. Admin publica acta.
6. Sistema emite meeting.minutesPublished.
7. Notifications informa a audiencia autorizada.
```

---

# 20. Orden recomendado de desarrollo

## Incremento 1 — Base del módulo

```text id="ag5xpx"
MeetingsModule
estructura de carpetas
value objects
errores
DTOs base
guards base
```

---

## Incremento 2 — Meeting Core

```text id="e6uaf3"
Meeting entity
Meeting repository
MeetingService
MeetingsController
create/list/get/update/schedule/call/start/cancel/complete/archive
```

---

## Incremento 3 — Agenda

```text id="x7w4g7"
MeetingAgendaItem entity
MeetingAgendaService
MeetingAgendaController
create/list/update/reorder/complete/skip/archive
```

---

## Incremento 4 — Participants and Audience

```text id="zzhbbu"
MeetingParticipant entity
MeetingParticipantService
MeetingAudienceService
participant validation
replace/list participants
own access resolution
```

---

## Incremento 5 — Attendance

```text id="exwugl"
MeetingAttendance entity
MeetingAttendanceService
MeetingAttendancePolicyService
register/list/update/check-out/excuse/archive
duplicate prevention
closed attendance lock
```

---

## Incremento 6 — Proxies

```text id="shlk4j"
MeetingProxy entity
MeetingProxyService
create/approve/reject/cancel/archive
represented/representative validation
represented attendance
```

---

## Incremento 7 — Quorum

```text id="mb7b6a"
MeetingQuorumService
participantCount
propertyUnitCount
percentageOfExpectedParticipants
percentageOfPropertyUnits
calculate-quorum endpoint
audit quorum calculation
```

---

## Incremento 8 — Own Meetings

```text id="yfas80"
MyMeetingsController
ListOwnMeetingsUseCase
GetOwnMeetingUseCase
Own agenda
Own attendance
Own minutes
Own resolutions
Optional self check-in
Optional own proxy creation
```

---

## Incremento 9 — Minutes and Resolutions

```text id="kyp8zp"
MeetingMinutes entity/service/controller
MeetingResolution entity/service/controller
draft/review/approve/publish/archive
record/approve/cancel/archive resolutions
content sanitization
```

---

## Incremento 10 — Notifications, Audit, OpenAPI and Hardening

```text id="u8tt85"
MeetingNotificationService
MeetingAuditService
OpenAPI
security tests
multitenancy tests
own-resource tests
observability
CI gates
```

---

# 21. Testing resumido

El documento completo será:

```text id="o943z3"
docs/specs/013-meetings-attendance/test-plan.md
```

## 21.1. Unit tests

* Meeting entity.
* MeetingAgendaItem entity.
* MeetingParticipant entity.
* MeetingAttendance entity.
* MeetingProxy entity.
* MeetingMinutes entity.
* MeetingResolution entity.
* State machines.
* Quorum calculation.
* Attendance policy.
* Proxy validation.
* Content sanitizer.

---

## 21.2. Integration tests

* Crear reunión.
* Programar reunión.
* Convocar reunión.
* Gestionar agenda.
* Gestionar participantes.
* Registrar asistencia.
* Registrar salida.
* Registrar excusa.
* Gestionar proxy.
* Calcular quórum.
* Crear acta.
* Publicar acta.
* Registrar resolución.
* Auditar eventos.
* Multitenancy.

---

## 21.3. API tests

* Meetings admin.
* Agenda.
* Participants.
* Attendance.
* Proxies.
* Minutes.
* Resolutions.
* My meetings.
* Permisos.
* Filtros.
* Paginación.
* Errores.
* OpenAPI.

---

## 21.4. Security tests

* No cross-tenant.
* No endpoints públicos.
* No asistencia ajena.
* No actas ajenas.
* No modificación de asistencia cerrada sin override.
* No participantes de otro tenant.
* No proxies cross-tenant.
* No scripts en actas.
* Logs seguros.
* Auditoría.

---

# 22. Observabilidad

## 22.1. Logs estructurados

Logs sugeridos:

```text id="l0ios3"
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
meetingAgenda.updated
meetingParticipant.updated
meetingAttendance.registered
meetingAttendance.updated
meetingProxy.approved
meetingMinutes.published
meetingResolution.recorded
```

---

## 22.2. Métricas

```text id="b9ib1a"
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

## 22.3. Labels permitidos

```text id="d3giux"
meetingType
meetingStatus
modality
attendanceStatus
quorumMet
outcome
```

---

## 22.4. Labels prohibidos

```text id="xbhlsf"
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

# 23. Seguridad

## 23.1. Controles obligatorios

```text id="eyrt27"
tenant isolation
permission guards
own-resource authorization
meeting audience validation
participant tenant validation
person validation
property unit validation
role validation
state machine
attendance uniqueness
closed attendance lock
proxy validation
quorum deterministic calculation
content sanitization
safe DTOs
no public endpoints
audit events
safe logs
safe metrics
OpenAPI negative tests
```

---

## 23.2. Riesgos y mitigaciones

| Riesgo                              | Mitigación                                |
| ----------------------------------- | ----------------------------------------- |
| Reunión cross-tenant                | tenant_id + guards + tests                |
| Participante de otro tenant         | participant validation                    |
| Asistencia cross-tenant             | attendance tenant filter                  |
| Usuario ve reunión ajena            | OwnMeetingGuard                           |
| Usuario ve asistencia de terceros   | DTO minimizado + own-resource guard       |
| Reunión pública accidental          | no public routes + OpenAPI negative tests |
| Acta expuesta a terceros            | permissions + own access                  |
| Quórum incorrecto                   | deterministic service + tests             |
| Asistencia duplicada                | unique active attendance rule             |
| Proxy inválido                      | represented/representative validation     |
| Asistencia cerrada modificada       | override permission                       |
| Inyección en acta                   | content sanitizer                         |
| Logs con datos personales           | log redaction                             |
| Notificación a audiencia incorrecta | MeetingAudienceService                    |

---

# 24. Performance

## 24.1. Objetivo MVP

```text id="w9llxi"
p95 < 700 ms para listados paginados de reuniones, agenda, participantes y asistencia con filtros comunes.
```

---

## 24.2. Estrategias

```text id="v3fezi"
índices por tenant/status/type/date
paginación obligatoria
pageSize máximo 100
no cargar asistencia completa en listados de reuniones
no cargar acta completa en listados
no cargar participantes completos en endpoints /me
evitar N+1
DTOs diferenciados admin/own
```

---

# 25. Criterios técnicos de aceptación

La implementación técnica se acepta si:

* existe módulo `meetings`;
* existen tablas requeridas;
* existe gestión administrativa de reuniones;
* existe gestión de agenda;
* existe gestión de participantes;
* existe registro administrativo de asistencia;
* existe cierre de asistencia;
* existe control de override;
* existe gestión básica de proxies;
* existe cálculo básico de quórum;
* existe gestión de actas preliminares;
* existe gestión de resoluciones básicas;
* existe consulta de reuniones propias;
* existe consulta propia de agenda, asistencia, acta y resoluciones;
* no existen endpoints públicos de reuniones;
* no se permite cross-tenant;
* no se exponen asistentes a usuarios no autorizados;
* no se modifica asistencia cerrada sin permiso;
* se emiten eventos para notificaciones;
* se auditan operaciones críticas;
* logs y métricas están sanitizados;
* OpenAPI está actualizado;
* pruebas pasan;
* CI pasa.

---

# 26. Comandos esperados

Comandos generales:

```bash id="su6gq8"
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

Comandos específicos sugeridos:

```bash id="f5nq1z"
npm run test:meetings
npm run test:meetings:unit
npm run test:meetings:integration
npm run test:meetings:api
npm run test:meetings:authorization
npm run test:meetings:own-resource
npm run test:meetings:multitenancy
npm run test:meetings:attendance
npm run test:meetings:quorum
npm run test:meetings:minutes
npm run test:meetings:security
npm run test:meetings:openapi
```

---

# 27. Riesgos de implementación

| Riesgo                                 |    Impacto | Mitigación                 |
| -------------------------------------- | ---------: | -------------------------- |
| Reunión cross-tenant                   |    Crítico | tenant_id + guards + tests |
| Participantes cross-tenant             |    Crítico | MeetingParticipantService  |
| Asistencia duplicada                   |       Alto | unique active attendance   |
| Usuario ve reunión ajena               |       Alto | OwnMeetingGuard            |
| Usuario ve asistencia de terceros      |       Alto | DTO minimizado             |
| Proxy inválido                         |       Alto | MeetingProxyService        |
| Quórum incorrecto                      | Medio/Alto | deterministic tests        |
| Acta con contenido inseguro            |       Alto | sanitizer                  |
| Asistencia cerrada editada sin control |       Alto | override permission        |
| Noificación a audiencia errónea        |       Alto | MeetingAudienceService     |
| Reunión pública accidental             |    Crítico | no public endpoints        |
| Mezcla con votación formal             |       Alto | Voting diferido            |

---

# 28. Checklist para agentes IA

Antes de generar código para este módulo, el agente debe leer:

```text id="vjri3z"
docs/sdd/constitution.md
docs/sdd/domain-map.md
docs/sdd/architecture.md
docs/sdd/security.md
docs/sdd/api-guidelines.md
docs/sdd/data-governance.md
docs/specs/001-tenants/
docs/specs/002-users-roles/
docs/specs/003-residents-properties/
docs/specs/007-audit/
docs/specs/012-communications-notifications/
docs/specs/013-meetings-attendance/spec.md
docs/specs/013-meetings-attendance/plan.md
```

El agente no debe:

```text id="oelx8q"
permitir reuniones cross-tenant
omitir tenantId
aceptar tenantId desde body
buscar reuniones solo por id
buscar asistencia solo por id
usar participantes de otro tenant
usar personas de otro tenant
usar unidades de otro tenant
usar roles de otro tenant
exponer reuniones en /api/v1/public
exponer asistencia públicamente
exponer actas públicamente
exponer participantes públicamente
permitir usuario vea reuniones ajenas
permitir usuario vea asistencia de terceros
modificar asistencia cerrada sin permiso override
crear asistencia representada sin proxy aprobado
calcular quórum modificando asistencia
registrar resoluciones como votación formal
generar multas automáticas por inasistencia
implementar firma electrónica
implementar QR real
implementar IA con datos reales
guardar body completo de acta en logs
omitir auditoría
```

---

# 29. Pendientes para documentos derivados

## 29.1. `data-model.md`

Debe detallar:

* tablas;
* enums;
* Prisma models;
* relaciones;
* constraints;
* índices;
* soft delete;
* reglas de asistencia;
* reglas de proxy;
* reglas de quórum;
* reglas de actas;
* reglas de resoluciones;
* reglas de acceso propio.

---

## 29.2. `api-contract.md`

Debe detallar:

* endpoints administrativos;
* endpoints `/me`;
* ausencia de endpoints públicos;
* permisos;
* DTOs;
* responses;
* errores;
* filtros;
* paginación;
* headers;
* OpenAPI.

---

## 29.3. `test-plan.md`

Debe detallar:

* unit tests;
* integration tests;
* API tests;
* authorization tests;
* own-resource tests;
* multitenancy tests;
* attendance tests;
* proxy tests;
* quorum tests;
* minutes tests;
* resolution tests;
* security tests;
* OpenAPI tests.

---

## 29.4. `tasks.md`

Debe convertir este plan en tareas ejecutables.

---

## 29.5. `security-notes.md`

Debe detallar:

* riesgos cross-tenant;
* riesgos de asistencia;
* riesgos de participantes;
* riesgos de actas;
* riesgos de proxies;
* riesgos de quórum;
* riesgos de endpoints públicos;
* controles de auditoría;
* controles de privacidad.

---

# 30. Decisión final de implementación

El módulo `013-meetings-attendance` se implementará como módulo transaccional y operativo dentro de RESIDENT Core para administrar reuniones, asambleas, asistencia, quórum básico, actas preliminares y resoluciones básicas.

Para MVP:

```text id="oqdkef"
- Crear reuniones.
- Editar reuniones en estados permitidos.
- Programar reuniones.
- Convocar reuniones.
- Iniciar reuniones.
- Cancelar reuniones.
- Cerrar asistencia.
- Completar reuniones.
- Archivar reuniones.
- Gestionar agenda básica.
- Gestionar participantes.
- Registrar asistencia administrativa.
- Registrar ausencia.
- Registrar asistencia tardía.
- Registrar salida anticipada.
- Gestionar representación básica.
- Calcular quórum simple.
- Consultar reuniones administrativas.
- Consultar reuniones propias.
- Registrar acta preliminar.
- Aprobar/publicar acta a audiencia autorizada.
- Registrar resoluciones básicas.
- Emitir eventos para notificaciones.
- Auditar operaciones críticas.
- No implementar votación electrónica.
- No implementar firmas electrónicas.
- No implementar actas PDF formales.
- No implementar QR real.
- No implementar IA con datos reales.
- No exponer reuniones en WordPress público.
```

El módulo debe garantizar:

```text id="tz15kr"
tenant isolation
permissioned actions
own-resource protection
meeting audience validation
state transition control
attendance uniqueness
closed attendance lock
basic proxy validation
deterministic quorum calculation
minutes privacy
resolution traceability
notification event integration
auditability
observability without sensitive leakage
no public exposure
```

La implementación no debe aceptarse si permite reuniones cross-tenant, participantes de otro tenant, asistencia duplicada, acceso a reuniones ajenas, exposición pública de reuniones, modificación de asistencia cerrada sin permiso, representaciones sin validación, quórum sin trazabilidad, actas con contenido inseguro, logs con datos personales, omisión de auditoría o mezcla de esta funcionalidad con votación electrónica formal, multas automáticas, firma electrónica, QR avanzado o IA con datos reales.
