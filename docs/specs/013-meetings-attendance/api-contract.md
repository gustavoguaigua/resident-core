# API Contract — Spec 013 Meetings and Attendance

## 1. Información del documento

| Campo           | Valor                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                 |
| Spec ID         | 013                                                                                                           |
| Módulo          | Meetings and Attendance                                                                                       |
| Documento       | API Contract                                                                                                  |
| Ruta            | `docs/specs/013-meetings-attendance/api-contract.md`                                                          |
| Versión         | 0.1                                                                                                           |
| Estado          | needs-review                                                                                                  |
| Fecha           | 2026-07-19                                                                                                    |
| Documento base  | `docs/specs/013-meetings-attendance/spec.md`                                                                  |
| Plan técnico    | `docs/specs/013-meetings-attendance/plan.md`                                                                  |
| Modelo de datos | `docs/specs/013-meetings-attendance/data-model.md`                                                            |
| API Style       | REST                                                                                                          |
| API Version     | `/api/v1`                                                                                                     |
| Naturaleza      | Tenant-scoped / Permissioned / Own-resource protected / Attendance-aware / Quorum-aware / Auditable           |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `007-audit`, `012-communications-notifications` |
| Relacionado con | `008-basic-reports`, `011-fines-sanctions`, futuras specs de votación, firmas, actas PDF, QR e IA             |

---

## 2. Propósito

Este documento define el contrato API REST del módulo `013-meetings-attendance`.

El módulo permite administrar reuniones, asambleas, agenda, participantes, asistencia, representaciones básicas, quórum, actas preliminares y resoluciones básicas, garantizando aislamiento por tenant, autorización por permisos, autorización por recurso propio, privacidad de asistencia y trazabilidad auditable.

Regla central:

```text id="t3aanv"
Toda operación de reuniones y asistencia debe estar autenticada, autorizada, tenant-scoped, state-controlled, own-resource protected, auditable y sin exposición pública en MVP.
```

---

## 3. Principios del contrato API

### 3.1. Tenant scope obligatorio

Todos los endpoints administrativos y `/me` operan dentro del tenant activo del usuario autenticado.

Regla:

```text id="u5ng2a"
currentTenant.id debe usarse como tenant_id efectivo en toda consulta y mutación.
```

El cliente no debe enviar `tenantId` en el body.

---

### 3.2. Autenticación

Todos los endpoints del módulo requieren:

```text id="d0fn1w"
Authorization: Bearer <access_token>
```

No existen endpoints públicos para reuniones en MVP.

---

### 3.3. Autorización

La autorización se resuelve dentro de RESIDENT Core.

Regla:

```text id="eowos6"
Keycloak autentica; RESIDENT Core autoriza por tenant, permiso, audiencia, recurso propio, estado y regla de negocio.
```

---

### 3.4. No exposición pública

MVP no expone reuniones, asistencia, agenda, actas, participantes, proxies ni resoluciones en endpoints públicos.

Prohibido:

```text id="qdcbx2"
GET /api/v1/public/tenants/{slug}/meetings
GET /api/v1/public/tenants/{slug}/meetings/{meetingId}
GET /api/v1/public/tenants/{slug}/meetings/{meetingId}/attendance
GET /api/v1/public/tenants/{slug}/meetings/{meetingId}/minutes
GET /api/v1/public/tenants/{slug}/meetings/{meetingId}/resolutions
```

---

### 3.5. Endpoints `/me`

Los endpoints `/me` solo devuelven información relacionada con el usuario autenticado, sus personas vinculadas, sus unidades, sus roles o las reuniones cuya audiencia lo incluye.

Regla conceptual:

```text id="ivv4gv"
actorUserId -> personIds -> propertyUnitIds -> roleIds -> meeting audience
```

---

### 3.6. Asistencia privada

Los registros de asistencia son privados.

Un usuario final no debe ver:

```text id="w33yyh"
asistencia de otros usuarios
participantes completos
notas administrativas de asistencia
metadatos internos
auditoría
```

---

### 3.7. Actas protegidas

Las actas no son públicas en MVP. Una acta publicada solo puede ser consultada por usuarios autenticados y autorizados según audiencia.

---

### 3.8. Resoluciones básicas

Las resoluciones del módulo no representan votación electrónica formal.

Regla:

```text id="dclnl3"
meeting_resolutions registra acuerdos básicos, no votos, mayorías legales ni ejecución automática.
```

---

### 3.9. Integración con notificaciones

El módulo no envía emails, WhatsApp, SMS ni push directamente.

Regla:

```text id="ky72ej"
Meetings emite eventos; Communications and Notifications gestiona entrega.
```

---

### 3.10. Cache

Todos los endpoints privados deben usar:

```text id="rjeqou"
Cache-Control: no-store
```

---

## 4. Rutas base

### 4.1. Meetings administrativas

```text id="uw6qo1"
/api/v1/tenant/meetings
```

---

### 4.2. Agenda

```text id="it3687"
/api/v1/tenant/meetings/{meetingId}/agenda
/api/v1/tenant/meeting-agenda-items
```

---

### 4.3. Participantes

```text id="ryzq99"
/api/v1/tenant/meetings/{meetingId}/participants
/api/v1/tenant/meeting-participants
```

---

### 4.4. Asistencia

```text id="uqibky"
/api/v1/tenant/meetings/{meetingId}/attendance
/api/v1/tenant/meeting-attendance
```

---

### 4.5. Representaciones

```text id="bjntro"
/api/v1/tenant/meetings/{meetingId}/proxies
/api/v1/tenant/meeting-proxies
```

---

### 4.6. Actas

```text id="wqt5uq"
/api/v1/tenant/meetings/{meetingId}/minutes
/api/v1/tenant/meeting-minutes
```

---

### 4.7. Resoluciones

```text id="sxmokj"
/api/v1/tenant/meetings/{meetingId}/resolutions
/api/v1/tenant/meeting-resolutions
```

---

### 4.8. Meetings propias

```text id="g5p356"
/api/v1/me/meetings
/api/v1/me/meeting-proxies
```

---

## 5. Headers

### 5.1. Request headers

| Header             |              Requerido | Descripción        |
| ------------------ | ---------------------: | ------------------ |
| `Authorization`    |                     Sí | Bearer token       |
| `Content-Type`     | Sí para POST/PATCH/PUT | `application/json` |
| `Accept`           |            Recomendado | `application/json` |
| `X-Request-Id`     |               Opcional | ID de request      |
| `X-Correlation-Id` |               Opcional | ID de correlación  |

---

### 5.2. Response headers

```text id="nbvbmb"
Content-Type: application/json
Cache-Control: no-store
X-Request-Id: <request-id>
X-Correlation-Id: <correlation-id>
```

---

## 6. Formato estándar de respuesta

### 6.1. Respuesta individual

```json id="dn2spe"
{
  "data": {},
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

### 6.2. Respuesta paginada

```json id="c125pm"
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

```json id="jvq550"
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

## 7. Estados HTTP

| Código | Uso                                                   |
| -----: | ----------------------------------------------------- |
|    200 | Consulta o acción exitosa                             |
|    201 | Recurso creado                                        |
|    204 | Acción exitosa sin cuerpo, si se adopta               |
|    400 | Request mal formado                                   |
|    401 | No autenticado                                        |
|    403 | Sin permiso o sin acceso al recurso                   |
|    404 | Recurso no encontrado o no accesible                  |
|    409 | Conflicto de estado, duplicidad o transición inválida |
|    422 | Validación semántica fallida                          |
|    429 | Rate limit                                            |
|    500 | Error interno controlado                              |

---

## 8. Permisos

### 8.1. Meetings administrativas

```text id="efs3bq"
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

---

### 8.2. Agenda

```text id="p1i3ff"
meetingAgenda.create
meetingAgenda.read
meetingAgenda.update
meetingAgenda.reorder
meetingAgenda.archive
```

---

### 8.3. Participantes

```text id="ckdi3c"
meetingParticipants.create
meetingParticipants.read
meetingParticipants.update
meetingParticipants.archive
```

---

### 8.4. Asistencia

```text id="ham6q4"
meetingAttendance.create
meetingAttendance.read
meetingAttendance.update
meetingAttendance.close
meetingAttendance.override
meetingAttendance.read.own
meetingAttendance.create.own
```

---

### 8.5. Representaciones

```text id="rjcwck"
meetingProxies.create
meetingProxies.read
meetingProxies.approve
meetingProxies.reject
meetingProxies.cancel
meetingProxies.create.own
meetingProxies.read.own
```

---

### 8.6. Quórum

```text id="zl68tr"
meetingQuorum.calculate
meetingQuorum.read
```

---

### 8.7. Actas

```text id="iob9hf"
meetingMinutes.create
meetingMinutes.read
meetingMinutes.update
meetingMinutes.review
meetingMinutes.approve
meetingMinutes.publish
meetingMinutes.archive
meetingMinutes.read.own
```

---

### 8.8. Resoluciones

```text id="g30iz0"
meetingResolutions.create
meetingResolutions.read
meetingResolutions.update
meetingResolutions.approve
meetingResolutions.cancel
meetingResolutions.archive
meetingResolutions.read.own
```

---

### 8.9. Auditoría y reportes

```text id="kt95x1"
meetings.audit.read
meetings.reports.read
```

---

## 9. Enums API

### 9.1. MeetingType

```text id="l0urpm"
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

---

### 9.2. MeetingModality

```text id="f57zqf"
inPerson
virtual
hybrid
```

---

### 9.3. MeetingStatus

```text id="k25xkw"
draft
scheduled
called
inProgress
attendanceClosed
completed
cancelled
archived
```

---

### 9.4. MeetingVisibility

```text id="z2a8er"
private
administrative
tenant
owners
residents
mixed
```

---

### 9.5. AgendaItemStatus

```text id="xgkuju"
pending
inProgress
completed
skipped
archived
```

---

### 9.6. ParticipantType

```text id="v4how6"
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

### 9.7. ParticipantStatus

```text id="x8jkfo"
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

### 9.8. ParticipantResponse

```text id="qz8kny"
pending
confirmed
declined
tentative
```

---

### 9.9. AttendanceStatus

```text id="n3flpi"
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

### 9.10. AttendanceRegistrationMethod

```text id="mjva03"
admin
self
qr
import
system
other
```

MVP obligatorio:

```text id="fwj90u"
admin
```

MVP opcional:

```text id="oec490"
self
```

Diferidos:

```text id="uctd6a"
qr
import
system advanced
```

---

### 9.11. ProxyStatus

```text id="hcpjkl"
submitted
approved
rejected
cancelled
archived
```

---

### 9.12. QuorumRuleType

```text id="rhfnrv"
none
participantCount
propertyUnitCount
percentageOfExpectedParticipants
percentageOfPropertyUnits
custom
```

---

### 9.13. MinutesStatus

```text id="l3xh19"
notStarted
draft
underReview
approved
published
archived
```

---

### 9.14. ResolutionType

```text id="sje2lr"
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

### 9.15. ResolutionStatus

```text id="d36vcn"
draft
recorded
approved
cancelled
archived
```

---

# 10. Meetings administrativas

## 10.1. Listar reuniones

### Endpoint

```http id="vkrtqc"
GET /api/v1/tenant/meetings
```

### Permiso

```text id="zpeyuo"
meetings.read
```

### Query params

| Nombre          | Tipo      | Requerido | Descripción                                                                        |
| --------------- | --------- | --------: | ---------------------------------------------------------------------------------- |
| `meetingType`   | string    |        No | Tipo de reunión                                                                    |
| `modality`      | string    |        No | Modalidad                                                                          |
| `status`        | string    |        No | Estado                                                                             |
| `visibility`    | string    |        No | Visibilidad                                                                        |
| `startsFrom`    | date-time |        No | Inicio desde                                                                       |
| `startsTo`      | date-time |        No | Inicio hasta                                                                       |
| `calledFrom`    | date-time |        No | Convocada desde                                                                    |
| `calledTo`      | date-time |        No | Convocada hasta                                                                    |
| `quorumMet`     | boolean   |        No | Resultado de quórum                                                                |
| `minutesStatus` | string    |        No | Estado del acta                                                                    |
| `q`             | string    |        No | Búsqueda por título o descripción                                                  |
| `page`          | number    |        No | Default 1                                                                          |
| `pageSize`      | number    |        No | Default 20, máximo 100                                                             |
| `sortBy`        | string    |        No | `startsAt`, `createdAt`, `updatedAt`, `title`, `status`, `meetingType`, `modality` |
| `sortOrder`     | string    |        No | `asc`, `desc`                                                                      |

### Response 200

```json id="ml15iw"
{
  "data": [
    {
      "id": "meeting_uuid",
      "title": "Asamblea ordinaria 2026",
      "meetingType": "ordinaryAssembly",
      "modality": "inPerson",
      "status": "called",
      "visibility": "owners",
      "startsAt": "2026-08-15T14:00:00Z",
      "endsAt": "2026-08-15T17:00:00Z",
      "timezone": "America/Guayaquil",
      "quorumMet": null,
      "minutesStatus": "notStarted",
      "updatedAt": "2026-07-19T10:00:00Z"
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

## 10.2. Crear reunión

### Endpoint

```http id="xhlbqt"
POST /api/v1/tenant/meetings
```

### Permiso

```text id="jax8ha"
meetings.create
```

### Request body

```json id="n50x98"
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

### Response 201

```json id="f2n4wy"
{
  "data": {
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
    "quorumCalculatedAt": null,
    "attendanceClosedAt": null,
    "minutesStatus": "notStarted",
    "createdAt": "2026-07-19T10:00:00Z",
    "updatedAt": "2026-07-19T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* El cliente no envía `tenantId`.
* Estado inicial: `draft`.
* `endsAt` debe ser posterior a `startsAt`.
* `quorumRequiredValue` se envía como string decimal.
* `custom` como regla de quórum no debe calcularse en MVP.

### Evento auditable

```text id="vkxbal"
meeting.created
```

---

## 10.3. Obtener reunión

### Endpoint

```http id="l6kkuf"
GET /api/v1/tenant/meetings/{meetingId}
```

### Permiso

```text id="s4tx2r"
meetings.read
```

### Response 200

```json id="jxjgy7"
{
  "data": {
    "id": "meeting_uuid",
    "title": "Asamblea ordinaria 2026",
    "description": "Asamblea ordinaria anual del conjunto.",
    "meetingType": "ordinaryAssembly",
    "modality": "inPerson",
    "location": "Salón comunal",
    "virtualMeetingUrl": null,
    "status": "called",
    "visibility": "owners",
    "startsAt": "2026-08-15T14:00:00Z",
    "endsAt": "2026-08-15T17:00:00Z",
    "timezone": "America/Guayaquil",
    "calledAt": "2026-07-25T14:00:00Z",
    "quorumRuleType": "percentageOfPropertyUnits",
    "quorumRequiredValue": "50.00",
    "quorumCalculatedValue": null,
    "quorumMet": null,
    "quorumCalculatedAt": null,
    "attendanceClosedAt": null,
    "minutesStatus": "notStarted",
    "createdAt": "2026-07-19T10:00:00Z",
    "updatedAt": "2026-07-25T14:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 10.4. Actualizar reunión

### Endpoint

```http id="hg3js3"
PATCH /api/v1/tenant/meetings/{meetingId}
```

### Permiso

```text id="ap2g71"
meetings.update
```

### Estados editables

```text id="al9h6h"
draft
scheduled
```

### Request body

```json id="ol9jk5"
{
  "title": "Asamblea ordinaria anual 2026",
  "description": "Asamblea ordinaria anual actualizada.",
  "modality": "hybrid",
  "location": "Salón comunal",
  "virtualMeetingUrl": "https://meet.example.test/meeting_uuid",
  "startsAt": "2026-08-15T15:00:00Z",
  "endsAt": "2026-08-15T18:00:00Z",
  "quorumRuleType": "percentageOfPropertyUnits",
  "quorumRequiredValue": "50.00"
}
```

### Response 200

```json id="vmo5fn"
{
  "data": {
    "id": "meeting_uuid",
    "title": "Asamblea ordinaria anual 2026",
    "modality": "hybrid",
    "location": "Salón comunal",
    "virtualMeetingUrl": "https://meet.example.test/meeting_uuid",
    "startsAt": "2026-08-15T15:00:00Z",
    "endsAt": "2026-08-15T18:00:00Z",
    "status": "draft",
    "updatedAt": "2026-07-19T11:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Campos prohibidos en PATCH genérico

```text id="ae77pn"
tenantId
status
createdBy
calledBy
cancelledBy
closedBy
archivedBy
quorumCalculatedValue
quorumMet
quorumCalculatedAt
attendanceClosedAt
createdAt
updatedAt
archivedAt
```

### Evento auditable

```text id="e9berz"
meeting.updated
```

---

## 10.5. Programar reunión

### Endpoint

```http id="zpkofz"
POST /api/v1/tenant/meetings/{meetingId}/schedule
```

### Permiso

```text id="w1yim2"
meetings.schedule
```

### Request body opcional

```json id="hi77x5"
{
  "notes": "Reunión revisada y lista para programación."
}
```

### Response 200

```json id="hr78q3"
{
  "data": {
    "id": "meeting_uuid",
    "status": "scheduled"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Estado origen recomendado: `draft`.
* La fecha de inicio debe estar definida.
* No se programa una reunión `cancelled`, `completed` o `archived`.

### Evento auditable

```text id="trfaf7"
meeting.scheduled
```

---

## 10.6. Convocar reunión

### Endpoint

```http id="zb8vzt"
POST /api/v1/tenant/meetings/{meetingId}/call
```

### Permiso

```text id="xz64nc"
meetings.call
```

### Request body

```json id="o9kw0f"
{
  "notifyParticipants": true,
  "notificationChannels": ["inApp"],
  "notes": "Convocatoria oficial de reunión."
}
```

### Response 200

```json id="o7ktgk"
{
  "data": {
    "id": "meeting_uuid",
    "status": "called",
    "calledAt": "2026-07-25T14:00:00Z",
    "notificationsRequested": true
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* La reunión debe tener participantes o audiencia válida según política.
* Debe registrar `calledAt` y `calledBy`.
* Si `notifyParticipants = true`, se emite evento hacia `012-communications-notifications`.
* No se envía email directamente desde este módulo.

### Eventos auditables

```text id="dsfoec"
meeting.called
```

### Evento de notificación sugerido

```text id="tuhy3q"
meeting.called
```

---

## 10.7. Iniciar reunión

### Endpoint

```http id="adujv6"
POST /api/v1/tenant/meetings/{meetingId}/start
```

### Permiso

```text id="iq7cro"
meetings.start
```

### Response 200

```json id="kljcyh"
{
  "data": {
    "id": "meeting_uuid",
    "status": "inProgress"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Estado origen recomendado: `called`.
* Puede permitirse `scheduled -> inProgress` según política.
* No se puede iniciar reunión `cancelled`, `completed` o `archived`.

### Evento auditable

```text id="f95t89"
meeting.started
```

---

## 10.8. Cancelar reunión

### Endpoint

```http id="la4msq"
POST /api/v1/tenant/meetings/{meetingId}/cancel
```

### Permiso

```text id="u6ed0d"
meetings.cancel
```

### Request body

```json id="fjfm9v"
{
  "reason": "La reunión se cancela por fuerza mayor.",
  "notifyParticipants": true
}
```

### Response 200

```json id="p6n3kt"
{
  "data": {
    "id": "meeting_uuid",
    "status": "cancelled",
    "cancellationReason": "La reunión se cancela por fuerza mayor."
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
  * `called`.
* No se cancela reunión `completed` o `archived`.
* Puede emitir evento de notificación.

### Eventos auditables

```text id="hm7v4w"
meeting.cancelled
```

---

## 10.9. Cerrar asistencia

### Endpoint

```http id="ulq5vj"
POST /api/v1/tenant/meetings/{meetingId}/close-attendance
```

### Permiso

```text id="s6e7f8"
meetingAttendance.close
```

### Response 200

```json id="nsjkr7"
{
  "data": {
    "id": "meeting_uuid",
    "status": "attendanceClosed",
    "attendanceClosedAt": "2026-08-15T16:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Estado origen recomendado: `inProgress`.
* Bloquea cambios ordinarios posteriores de asistencia.
* Cambios posteriores requieren `meetingAttendance.override`.

### Evento auditable

```text id="xasivw"
meeting.attendanceClosed
```

---

## 10.10. Completar reunión

### Endpoint

```http id="ipinqq"
POST /api/v1/tenant/meetings/{meetingId}/complete
```

### Permiso

```text id="s1tpg8"
meetings.complete
```

### Response 200

```json id="h5divg"
{
  "data": {
    "id": "meeting_uuid",
    "status": "completed"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Estados origen permitidos:

  * `inProgress`;
  * `attendanceClosed`.
* No completa reunión `draft`, `scheduled`, `cancelled` o `archived`.

### Evento auditable

```text id="rmjdfp"
meeting.completed
```

---

## 10.11. Archivar reunión

### Endpoint

```http id="lg39oq"
POST /api/v1/tenant/meetings/{meetingId}/archive
```

### Permiso

```text id="mbnr6a"
meetings.archive
```

### Request body opcional

```json id="pkl4ze"
{
  "reason": "Reunión cerrada y archivada."
}
```

### Response 200

```json id="wsfqzm"
{
  "data": {
    "id": "meeting_uuid",
    "status": "archived",
    "archivedAt": "2026-08-20T15:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Estados archivables:

  * `completed`;
  * `cancelled`.
* Archivo lógico.
* No elimina agenda, participantes, asistencia, actas ni resoluciones.

### Evento auditable

```text id="ywwgef"
meeting.archived
```

---

## 10.12. Calcular quórum

### Endpoint

```http id="dcf34i"
POST /api/v1/tenant/meetings/{meetingId}/calculate-quorum
```

### Permiso

```text id="n132np"
meetingQuorum.calculate
```

### Response 200

```json id="lvmek8"
{
  "data": {
    "meetingId": "meeting_uuid",
    "quorumRuleType": "percentageOfPropertyUnits",
    "quorumRequiredValue": "50.00",
    "quorumCalculatedValue": "62.50",
    "quorumMet": true,
    "quorumCalculatedAt": "2026-08-15T16:10:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* El cálculo no modifica registros de asistencia.
* Usa asistencia activa.
* Usa estados `present`, `late` y `represented`.
* `custom` no se calcula en MVP.
* Porcentajes se devuelven como string decimal.

### Evento auditable

```text id="ri1sqj"
meeting.quorumCalculated
```

---

# 11. Meeting Agenda

## 11.1. Listar agenda

### Endpoint

```http id="fgx8kx"
GET /api/v1/tenant/meetings/{meetingId}/agenda
```

### Permiso

```text id="bzkh6g"
meetingAgenda.read
```

### Query params

| Nombre      | Tipo   | Requerido | Descripción                                 |
| ----------- | ------ | --------: | ------------------------------------------- |
| `status`    | string |        No | Estado del punto                            |
| `page`      | number |        No | Página                                      |
| `pageSize`  | number |        No | Tamaño                                      |
| `sortBy`    | string |        No | `order`, `status`, `createdAt`, `updatedAt` |
| `sortOrder` | string |        No | `asc`, `desc`                               |

### Response 200

```json id="viwg2h"
{
  "data": [
    {
      "id": "agenda_item_uuid",
      "meetingId": "meeting_uuid",
      "order": 1,
      "title": "Lectura del acta anterior",
      "description": "Revisión del acta anterior.",
      "presenterUserId": "user_uuid",
      "estimatedMinutes": 15,
      "status": "pending",
      "notes": null,
      "createdAt": "2026-07-19T10:00:00Z",
      "updatedAt": "2026-07-19T10:00:00Z"
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

## 11.2. Crear punto de agenda

### Endpoint

```http id="d2cn6w"
POST /api/v1/tenant/meetings/{meetingId}/agenda
```

### Permiso

```text id="fekbwq"
meetingAgenda.create
```

### Request body

```json id="ri7wm9"
{
  "order": 1,
  "title": "Lectura del acta anterior",
  "description": "Revisión y aprobación del acta anterior.",
  "presenterUserId": "user_uuid",
  "estimatedMinutes": 15
}
```

### Response 201

```json id="h4wki6"
{
  "data": {
    "id": "agenda_item_uuid",
    "meetingId": "meeting_uuid",
    "order": 1,
    "title": "Lectura del acta anterior",
    "description": "Revisión y aprobación del acta anterior.",
    "presenterUserId": "user_uuid",
    "estimatedMinutes": 15,
    "status": "pending",
    "createdAt": "2026-07-19T10:00:00Z",
    "updatedAt": "2026-07-19T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Evento auditable

```text id="eb0ie4"
meetingAgenda.created
```

---

## 11.3. Obtener punto de agenda

### Endpoint

```http id="d9ngbl"
GET /api/v1/tenant/meeting-agenda-items/{agendaItemId}
```

### Permiso

```text id="k88187"
meetingAgenda.read
```

---

## 11.4. Actualizar punto de agenda

### Endpoint

```http id="kglgkd"
PATCH /api/v1/tenant/meeting-agenda-items/{agendaItemId}
```

### Permiso

```text id="s4o8ks"
meetingAgenda.update
```

### Request body

```json id="rj9jdt"
{
  "title": "Lectura y aprobación del acta anterior",
  "description": "Revisión del acta previa.",
  "presenterUserId": "user_uuid",
  "estimatedMinutes": 20,
  "notes": "Punto prioritario."
}
```

### Evento auditable

```text id="lp7nkn"
meetingAgenda.updated
```

---

## 11.5. Reordenar agenda

### Endpoint

```http id="boz77n"
POST /api/v1/tenant/meetings/{meetingId}/agenda/reorder
```

### Permiso

```text id="mqlsnl"
meetingAgenda.reorder
```

### Request body

```json id="weawyc"
{
  "items": [
    {
      "agendaItemId": "agenda_item_uuid_1",
      "order": 1
    },
    {
      "agendaItemId": "agenda_item_uuid_2",
      "order": 2
    }
  ]
}
```

### Response 200

```json id="gsiyp8"
{
  "data": {
    "meetingId": "meeting_uuid",
    "updatedCount": 2
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Evento auditable

```text id="ta38bt"
meetingAgenda.reordered
```

---

## 11.6. Completar punto de agenda

```http id="xjc3hx"
POST /api/v1/tenant/meeting-agenda-items/{agendaItemId}/complete
```

Permiso:

```text id="n7634f"
meetingAgenda.update
```

Evento:

```text id="sgev81"
meetingAgenda.completed
```

---

## 11.7. Saltar punto de agenda

```http id="p38488"
POST /api/v1/tenant/meeting-agenda-items/{agendaItemId}/skip
```

Permiso:

```text id="r70b8p"
meetingAgenda.update
```

Request body opcional:

```json id="rb5osy"
{
  "reason": "El punto será tratado en la próxima reunión."
}
```

Evento:

```text id="gd2pfs"
meetingAgenda.skipped
```

---

## 11.8. Archivar punto de agenda

```http id="z1bf2a"
POST /api/v1/tenant/meeting-agenda-items/{agendaItemId}/archive
```

Permiso:

```text id="hkup54"
meetingAgenda.archive
```

Evento:

```text id="pmiyip"
meetingAgenda.archived
```

---

# 12. Meeting Participants

## 12.1. Listar participantes

### Endpoint

```http id="le110r"
GET /api/v1/tenant/meetings/{meetingId}/participants
```

### Permiso

```text id="eqnvyd"
meetingParticipants.read
```

### Query params

| Nombre            | Tipo    | Requerido |
| ----------------- | ------- | --------: |
| `participantType` | string  |        No |
| `status`          | string  |        No |
| `response`        | string  |        No |
| `isRequired`      | boolean |        No |
| `page`            | number  |        No |
| `pageSize`        | number  |        No |

### Response 200

```json id="fstoj3"
{
  "data": [
    {
      "id": "participant_uuid",
      "meetingId": "meeting_uuid",
      "participantType": "owners",
      "userId": null,
      "personId": null,
      "propertyUnitId": null,
      "roleId": null,
      "isRequired": true,
      "status": "invited",
      "invitedAt": "2026-07-25T14:00:00Z",
      "respondedAt": null,
      "response": "pending",
      "createdAt": "2026-07-19T10:00:00Z"
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

## 12.2. Crear participante

### Endpoint

```http id="mfq1xj"
POST /api/v1/tenant/meetings/{meetingId}/participants
```

### Permiso

```text id="emjby0"
meetingParticipants.create
```

### Request body

```json id="iwvkcy"
{
  "participantType": "propertyUnit",
  "propertyUnitId": "property_unit_uuid",
  "isRequired": true
}
```

### Response 201

```json id="i75oh8"
{
  "data": {
    "id": "participant_uuid",
    "meetingId": "meeting_uuid",
    "participantType": "propertyUnit",
    "propertyUnitId": "property_unit_uuid",
    "isRequired": true,
    "status": "invited",
    "response": "pending",
    "createdAt": "2026-07-19T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Todas las referencias deben pertenecer al tenant.
* `participantType` determina qué ID es obligatorio.
* No se permite participante de otro tenant.

### Evento auditable

```text id="c2qzr8"
meetingParticipant.added
```

---

## 12.3. Reemplazar participantes

### Endpoint

```http id="fb82ey"
PUT /api/v1/tenant/meetings/{meetingId}/participants
```

### Permiso

```text id="nkd9w0"
meetingParticipants.update
```

### Request body

```json id="yrdcey"
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

### Response 200

```json id="kulic6"
{
  "data": {
    "meetingId": "meeting_uuid",
    "participantsCount": 2,
    "notificationsRequested": true
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Evento auditable

```text id="xjaepp"
meetingParticipants.updated
```

---

## 12.4. Obtener participante

```http id="f366pz"
GET /api/v1/tenant/meeting-participants/{participantId}
```

Permiso:

```text id="xsxpij"
meetingParticipants.read
```

---

## 12.5. Actualizar participante

```http id="k8wdvm"
PATCH /api/v1/tenant/meeting-participants/{participantId}
```

Permiso:

```text id="aarztz"
meetingParticipants.update
```

Request body:

```json id="zy8c2x"
{
  "isRequired": false,
  "status": "confirmed",
  "response": "confirmed"
}
```

Evento:

```text id="jrh5tq"
meetingParticipant.updated
```

---

## 12.6. Archivar participante

```http id="r7vimq"
POST /api/v1/tenant/meeting-participants/{participantId}/archive
```

Permiso:

```text id="nmelag"
meetingParticipants.archive
```

Evento:

```text id="vqtlbf"
meetingParticipant.archived
```

---

# 13. Meeting Attendance

## 13.1. Listar asistencia

### Endpoint

```http id="y4rhhk"
GET /api/v1/tenant/meetings/{meetingId}/attendance
```

### Permiso

```text id="o5lvza"
meetingAttendance.read
```

### Query params

| Nombre               | Tipo      | Requerido |
| -------------------- | --------- | --------: |
| `attendanceStatus`   | string    |        No |
| `registrationMethod` | string    |        No |
| `propertyUnitId`     | string    |        No |
| `personId`           | string    |        No |
| `userId`             | string    |        No |
| `isProxy`            | boolean   |        No |
| `checkInFrom`        | date-time |        No |
| `checkInTo`          | date-time |        No |
| `page`               | number    |        No |
| `pageSize`           | number    |        No |

### Response 200

```json id="mad9jv"
{
  "data": [
    {
      "id": "attendance_uuid",
      "meetingId": "meeting_uuid",
      "participantId": "participant_uuid",
      "userId": "user_uuid",
      "personId": "person_uuid",
      "propertyUnitId": "property_unit_uuid",
      "attendanceStatus": "present",
      "checkInAt": "2026-08-15T14:05:00Z",
      "checkOutAt": null,
      "registeredBy": "admin_user_uuid",
      "registrationMethod": "admin",
      "notes": "Registro manual por administración.",
      "isProxy": false,
      "proxyId": null,
      "createdAt": "2026-08-15T14:05:00Z",
      "updatedAt": "2026-08-15T14:05:00Z"
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

## 13.2. Registrar asistencia

### Endpoint

```http id="ayzcjx"
POST /api/v1/tenant/meetings/{meetingId}/attendance
```

### Permiso

```text id="cn02bz"
meetingAttendance.create
```

### Request body

```json id="f7z5yv"
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

### Response 201

```json id="t7jw1n"
{
  "data": {
    "id": "attendance_uuid",
    "meetingId": "meeting_uuid",
    "participantId": "participant_uuid",
    "userId": "user_uuid",
    "personId": "person_uuid",
    "propertyUnitId": "property_unit_uuid",
    "attendanceStatus": "present",
    "checkInAt": "2026-08-15T14:05:00Z",
    "checkOutAt": null,
    "registeredBy": "admin_user_uuid",
    "registrationMethod": "admin",
    "isProxy": false,
    "proxyId": null,
    "createdAt": "2026-08-15T14:05:00Z",
    "updatedAt": "2026-08-15T14:05:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* No se registra asistencia en reunión `cancelled` o `archived`.
* Estados recomendados para registro: `called` o `inProgress`.
* Debe existir sujeto de asistencia.
* No puede duplicar asistencia activa para el mismo sujeto.
* Si `attendanceStatus = represented`, requiere `proxyId` aprobado.
* Si la asistencia está cerrada, requiere `meetingAttendance.override`.

### Evento auditable

```text id="v8t1v5"
meetingAttendance.registered
```

---

## 13.3. Obtener asistencia

```http id="rurxqa"
GET /api/v1/tenant/meeting-attendance/{attendanceId}
```

Permiso:

```text id="d9jvom"
meetingAttendance.read
```

---

## 13.4. Actualizar asistencia

### Endpoint

```http id="dcu2kb"
PATCH /api/v1/tenant/meeting-attendance/{attendanceId}
```

### Permiso

```text id="slxe79"
meetingAttendance.update
```

### Permiso adicional si asistencia cerrada

```text id="s7ku5k"
meetingAttendance.override
```

### Request body

```json id="ec6zbu"
{
  "attendanceStatus": "late",
  "checkInAt": "2026-08-15T14:20:00Z",
  "notes": "Llegó después de iniciada la reunión."
}
```

### Evento auditable

```text id="fi3d88"
meetingAttendance.updated
```

---

## 13.5. Registrar salida

### Endpoint

```http id="u1gkhx"
POST /api/v1/tenant/meeting-attendance/{attendanceId}/check-out
```

### Permiso

```text id="rc9t59"
meetingAttendance.update
```

### Request body

```json id="ummdwq"
{
  "checkOutAt": "2026-08-15T15:30:00Z",
  "notes": "Salida anticipada."
}
```

### Response 200

```json id="cw013w"
{
  "data": {
    "id": "attendance_uuid",
    "attendanceStatus": "leftEarly",
    "checkOutAt": "2026-08-15T15:30:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Evento auditable

```text id="uwgbmb"
meetingAttendance.checkedOut
```

---

## 13.6. Marcar excusa

### Endpoint

```http id="tojab6"
POST /api/v1/tenant/meeting-attendance/{attendanceId}/excuse
```

### Permiso

```text id="qk8mbt"
meetingAttendance.update
```

### Request body

```json id="zznu1e"
{
  "reason": "Justificación presentada por el propietario."
}
```

### Response 200

```json id="jxx5y7"
{
  "data": {
    "id": "attendance_uuid",
    "attendanceStatus": "excused"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Evento auditable

```text id="xegynd"
meetingAttendance.excused
```

---

## 13.7. Archivar asistencia

```http id="r3zhvi"
POST /api/v1/tenant/meeting-attendance/{attendanceId}/archive
```

Permiso:

```text id="wo5snn"
meetingAttendance.override
```

Evento:

```text id="hxrqg8"
meetingAttendance.archived
```

---

# 14. Meeting Proxies

## 14.1. Listar representaciones

### Endpoint

```http id="yckerv"
GET /api/v1/tenant/meetings/{meetingId}/proxies
```

### Permiso

```text id="a837vl"
meetingProxies.read
```

### Query params

| Nombre                      | Tipo   | Requerido |
| --------------------------- | ------ | --------: |
| `status`                    | string |        No |
| `representedPropertyUnitId` | string |        No |
| `representativeUserId`      | string |        No |
| `page`                      | number |        No |
| `pageSize`                  | number |        No |

---

## 14.2. Crear representación

### Endpoint

```http id="t0cqav"
POST /api/v1/tenant/meetings/{meetingId}/proxies
```

### Permiso

```text id="at0cmt"
meetingProxies.create
```

### Request body

```json id="ys8hvs"
{
  "representedPersonId": "person_uuid",
  "representedUserId": null,
  "representedPropertyUnitId": "property_unit_uuid",
  "representativePersonId": "representative_person_uuid",
  "representativeUserId": "representative_user_uuid",
  "documentReference": "storage://tenant/meetings/proxies/proxy_uuid.pdf"
}
```

### Response 201

```json id="pis84g"
{
  "data": {
    "id": "proxy_uuid",
    "meetingId": "meeting_uuid",
    "representedPersonId": "person_uuid",
    "representedPropertyUnitId": "property_unit_uuid",
    "representativePersonId": "representative_person_uuid",
    "representativeUserId": "representative_user_uuid",
    "documentReference": "storage://tenant/meetings/proxies/proxy_uuid.pdf",
    "status": "submitted",
    "createdAt": "2026-08-10T10:00:00Z",
    "updatedAt": "2026-08-10T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Evento auditable

```text id="vqao99"
meetingProxy.created
```

---

## 14.3. Obtener representación

```http id="q1a4fd"
GET /api/v1/tenant/meeting-proxies/{proxyId}
```

Permiso:

```text id="rzhmke"
meetingProxies.read
```

---

## 14.4. Aprobar representación

```http id="injrgy"
POST /api/v1/tenant/meeting-proxies/{proxyId}/approve
```

Permiso:

```text id="zrto2w"
meetingProxies.approve
```

Response 200:

```json id="a3equ8"
{
  "data": {
    "id": "proxy_uuid",
    "status": "approved",
    "approvedAt": "2026-08-10T11:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

Evento:

```text id="zbonlp"
meetingProxy.approved
```

---

## 14.5. Rechazar representación

```http id="efwbvw"
POST /api/v1/tenant/meeting-proxies/{proxyId}/reject
```

Permiso:

```text id="nm9kra"
meetingProxies.reject
```

Request body:

```json id="p6eaos"
{
  "reason": "Documento de representación incompleto."
}
```

Evento:

```text id="ti49se"
meetingProxy.rejected
```

---

## 14.6. Cancelar representación

```http id="ndibjy"
POST /api/v1/tenant/meeting-proxies/{proxyId}/cancel
```

Permiso:

```text id="nx2y9h"
meetingProxies.cancel
```

Request body:

```json id="na9if5"
{
  "reason": "Cancelación solicitada por el representado."
}
```

Evento:

```text id="nveygf"
meetingProxy.cancelled
```

---

## 14.7. Archivar representación

```http id="m1r00h"
POST /api/v1/tenant/meeting-proxies/{proxyId}/archive
```

Permiso:

```text id="arw0ex"
meetingProxies.cancel
```

Evento:

```text id="xy6qzf"
meetingProxy.archived
```

---

# 15. Meeting Minutes

## 15.1. Obtener acta de reunión

### Endpoint

```http id="rk1h32"
GET /api/v1/tenant/meetings/{meetingId}/minutes
```

### Permiso

```text id="m2fbs1"
meetingMinutes.read
```

---

## 15.2. Crear acta

### Endpoint

```http id="omcwjy"
POST /api/v1/tenant/meetings/{meetingId}/minutes
```

### Permiso

```text id="l52grg"
meetingMinutes.create
```

### Request body

```json id="n6drfd"
{
  "title": "Acta preliminar de asamblea ordinaria 2026",
  "summary": "Resumen de los puntos tratados.",
  "body": "Contenido preliminar del acta."
}
```

### Response 201

```json id="sqf9t4"
{
  "data": {
    "id": "minutes_uuid",
    "meetingId": "meeting_uuid",
    "title": "Acta preliminar de asamblea ordinaria 2026",
    "summary": "Resumen de los puntos tratados.",
    "body": "Contenido preliminar del acta.",
    "status": "draft",
    "preparedAt": "2026-08-15T18:00:00Z",
    "createdAt": "2026-08-15T18:00:00Z",
    "updatedAt": "2026-08-15T18:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Máximo un acta activa por reunión en MVP.
* El contenido debe sanitizarse.
* El acta no es pública.

### Evento auditable

```text id="ngz82b"
meetingMinutes.created
```

---

## 15.3. Obtener acta por ID

```http id="t8v5hz"
GET /api/v1/tenant/meeting-minutes/{minutesId}
```

Permiso:

```text id="w5445s"
meetingMinutes.read
```

---

## 15.4. Actualizar acta

```http id="ba8351"
PATCH /api/v1/tenant/meeting-minutes/{minutesId}
```

Permiso:

```text id="ainriq"
meetingMinutes.update
```

Request body:

```json id="tcd481"
{
  "title": "Acta preliminar actualizada",
  "summary": "Resumen actualizado.",
  "body": "Contenido actualizado del acta."
}
```

Evento:

```text id="t7vc58"
meetingMinutes.updated
```

---

## 15.5. Enviar acta a revisión

```http id="gdmid7"
POST /api/v1/tenant/meeting-minutes/{minutesId}/submit-review
```

Permiso:

```text id="detl2k"
meetingMinutes.review
```

Evento:

```text id="shpeua"
meetingMinutes.submittedReview
```

---

## 15.6. Aprobar acta

```http id="w0t317"
POST /api/v1/tenant/meeting-minutes/{minutesId}/approve
```

Permiso:

```text id="g5f4pj"
meetingMinutes.approve
```

Response 200:

```json id="mihfrk"
{
  "data": {
    "id": "minutes_uuid",
    "status": "approved",
    "approvedAt": "2026-08-16T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

Evento:

```text id="cq1sez"
meetingMinutes.approved
```

---

## 15.7. Publicar acta

```http id="br475g"
POST /api/v1/tenant/meeting-minutes/{minutesId}/publish
```

Permiso:

```text id="jdtv16"
meetingMinutes.publish
```

Request body opcional:

```json id="tbat0z"
{
  "notifyAudience": true
}
```

Response 200:

```json id="zkn05s"
{
  "data": {
    "id": "minutes_uuid",
    "status": "published",
    "publishedAt": "2026-08-16T11:00:00Z",
    "notificationsRequested": true
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

Eventos:

```text id="d5c3q0"
meetingMinutes.published
meeting.minutesPublished
```

---

## 15.8. Archivar acta

```http id="vrq94h"
POST /api/v1/tenant/meeting-minutes/{minutesId}/archive
```

Permiso:

```text id="jdlv69"
meetingMinutes.archive
```

Evento:

```text id="rpgkzf"
meetingMinutes.archived
```

---

# 16. Meeting Resolutions

## 16.1. Listar resoluciones

### Endpoint

```http id="oppuut"
GET /api/v1/tenant/meetings/{meetingId}/resolutions
```

### Permiso

```text id="i85niz"
meetingResolutions.read
```

### Query params

| Nombre           | Tipo      | Requerido |
| ---------------- | --------- | --------: |
| `resolutionType` | string    |        No |
| `status`         | string    |        No |
| `agendaItemId`   | string    |        No |
| `recordedFrom`   | date-time |        No |
| `recordedTo`     | date-time |        No |
| `page`           | number    |        No |
| `pageSize`       | number    |        No |

---

## 16.2. Crear resolución

### Endpoint

```http id="enlacp"
POST /api/v1/tenant/meetings/{meetingId}/resolutions
```

### Permiso

```text id="lw0mif"
meetingResolutions.create
```

### Request body

```json id="rrf9d7"
{
  "agendaItemId": "agenda_item_uuid",
  "title": "Aprobación de mantenimiento de áreas comunes",
  "description": "Se registra la resolución básica de continuar con el mantenimiento planificado.",
  "resolutionType": "maintenance",
  "effectiveFrom": "2026-09-01T05:00:00Z"
}
```

### Response 201

```json id="y4jr7h"
{
  "data": {
    "id": "resolution_uuid",
    "meetingId": "meeting_uuid",
    "agendaItemId": "agenda_item_uuid",
    "title": "Aprobación de mantenimiento de áreas comunes",
    "description": "Se registra la resolución básica de continuar con el mantenimiento planificado.",
    "resolutionType": "maintenance",
    "status": "recorded",
    "recordedAt": "2026-08-15T18:20:00Z",
    "effectiveFrom": "2026-09-01T05:00:00Z",
    "createdAt": "2026-08-15T18:20:00Z",
    "updatedAt": "2026-08-15T18:20:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* No representa votación formal.
* No ejecuta acciones automáticas.
* `agendaItemId`, si existe, debe pertenecer a la misma reunión.

### Evento auditable

```text id="eii1vo"
meetingResolution.recorded
```

---

## 16.3. Obtener resolución

```http id="svqehs"
GET /api/v1/tenant/meeting-resolutions/{resolutionId}
```

Permiso:

```text id="m3g8dt"
meetingResolutions.read
```

---

## 16.4. Actualizar resolución

```http id="rba9ws"
PATCH /api/v1/tenant/meeting-resolutions/{resolutionId}
```

Permiso:

```text id="xpvhna"
meetingResolutions.update
```

Request body:

```json id="nsxbu0"
{
  "title": "Aprobación actualizada de mantenimiento",
  "description": "Se actualiza la descripción de la resolución.",
  "effectiveFrom": "2026-09-01T05:00:00Z"
}
```

Evento:

```text id="xaxggy"
meetingResolution.updated
```

---

## 16.5. Aprobar resolución

```http id="do0k1h"
POST /api/v1/tenant/meeting-resolutions/{resolutionId}/approve
```

Permiso:

```text id="zqolsn"
meetingResolutions.approve
```

Evento:

```text id="eex3r3"
meetingResolution.approved
```

---

## 16.6. Cancelar resolución

```http id="kap61e"
POST /api/v1/tenant/meeting-resolutions/{resolutionId}/cancel
```

Permiso:

```text id="tiya03"
meetingResolutions.cancel
```

Request body:

```json id="h90vz3"
{
  "reason": "La resolución será revisada en una próxima reunión."
}
```

Evento:

```text id="dtcgn0"
meetingResolution.cancelled
```

---

## 16.7. Archivar resolución

```http id="x742up"
POST /api/v1/tenant/meeting-resolutions/{resolutionId}/archive
```

Permiso:

```text id="r09rvd"
meetingResolutions.archive
```

Evento:

```text id="trxfte"
meetingResolution.archived
```

---

# 17. Meetings propias `/me`

## 17.1. Listar mis reuniones

### Endpoint

```http id="m8gi88"
GET /api/v1/me/meetings
```

### Permiso

```text id="hsiie5"
meetingAttendance.read.own
```

o permiso equivalente de lectura propia de reuniones:

```text id="qnfb8j"
meetings.read.own
```

### Query params

| Nombre         | Tipo      | Requerido |
| -------------- | --------- | --------: |
| `meetingType`  | string    |        No |
| `modality`     | string    |        No |
| `status`       | string    |        No |
| `startsFrom`   | date-time |        No |
| `startsTo`     | date-time |        No |
| `upcomingOnly` | boolean   |        No |
| `page`         | number    |        No |
| `pageSize`     | number    |        No |
| `sortBy`       | string    |        No |
| `sortOrder`    | string    |        No |

### Response 200

```json id="yfkgi2"
{
  "data": [
    {
      "id": "meeting_uuid",
      "title": "Asamblea ordinaria 2026",
      "meetingType": "ordinaryAssembly",
      "modality": "inPerson",
      "location": "Salón comunal",
      "virtualMeetingUrl": null,
      "status": "called",
      "visibility": "owners",
      "startsAt": "2026-08-15T14:00:00Z",
      "endsAt": "2026-08-15T17:00:00Z",
      "timezone": "America/Guayaquil",
      "myAttendanceStatus": null,
      "minutesAvailable": false,
      "resolutionsAvailable": false
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

* Solo devuelve reuniones accesibles por audiencia.
* No devuelve participantes completos.
* No devuelve asistencia de terceros.
* No devuelve metadata interna.
* No devuelve auditoría.

---

## 17.2. Obtener mi reunión

```http id="b22hoi"
GET /api/v1/me/meetings/{meetingId}
```

Permiso:

```text id="h0o356"
meetingAttendance.read.own
```

Response 200:

```json id="z8yhhx"
{
  "data": {
    "id": "meeting_uuid",
    "title": "Asamblea ordinaria 2026",
    "description": "Asamblea ordinaria anual del conjunto.",
    "meetingType": "ordinaryAssembly",
    "modality": "inPerson",
    "location": "Salón comunal",
    "virtualMeetingUrl": null,
    "status": "called",
    "visibility": "owners",
    "startsAt": "2026-08-15T14:00:00Z",
    "endsAt": "2026-08-15T17:00:00Z",
    "timezone": "America/Guayaquil",
    "myAttendanceStatus": null,
    "minutesAvailable": false,
    "resolutionsAvailable": false
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 17.3. Consultar agenda de mi reunión

```http id="p6e2h5"
GET /api/v1/me/meetings/{meetingId}/agenda
```

Permiso:

```text id="w4ukrn"
meetingAttendance.read.own
```

Response 200:

```json id="l3ggr9"
{
  "data": [
    {
      "id": "agenda_item_uuid",
      "order": 1,
      "title": "Lectura del acta anterior",
      "description": "Revisión del acta anterior.",
      "estimatedMinutes": 15,
      "status": "pending"
    }
  ],
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 17.4. Consultar mi asistencia

```http id="p2zmg5"
GET /api/v1/me/meetings/{meetingId}/attendance
```

Permiso:

```text id="tijgyn"
meetingAttendance.read.own
```

Response 200:

```json id="xd33o4"
{
  "data": {
    "id": "attendance_uuid",
    "meetingId": "meeting_uuid",
    "propertyUnitId": "property_unit_uuid",
    "attendanceStatus": "present",
    "checkInAt": "2026-08-15T14:05:00Z",
    "checkOutAt": null,
    "registrationMethod": "admin",
    "isProxy": false,
    "createdAt": "2026-08-15T14:05:00Z",
    "updatedAt": "2026-08-15T14:05:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

No devuelve:

```text id="beuxoo"
asistencia de terceros
notas administrativas
registeredBy
metadata interna
auditoría
```

---

## 17.5. Self check-in

### Endpoint

```http id="j6bu6d"
POST /api/v1/me/meetings/{meetingId}/attendance/check-in
```

### Permiso

```text id="ar2119"
meetingAttendance.create.own
```

### Request body

```json id="j4xglh"
{
  "propertyUnitId": "property_unit_uuid",
  "personId": "person_uuid",
  "notes": "Confirmo mi asistencia."
}
```

### Response 201

```json id="mzhbb1"
{
  "data": {
    "id": "attendance_uuid",
    "meetingId": "meeting_uuid",
    "propertyUnitId": "property_unit_uuid",
    "attendanceStatus": "present",
    "checkInAt": "2026-08-15T14:05:00Z",
    "registrationMethod": "self",
    "isProxy": false
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

Self check-in solo se permite si:

```text id="r0xbii"
tenant policy lo habilita
meeting.status IN called, inProgress
attendanceClosedAt IS NULL
usuario pertenece a la audiencia
propertyUnitId pertenece al usuario
no existe asistencia activa duplicada
```

MVP recomendado:

```text id="d8n4rn"
Self check-in deshabilitado por defecto.
```

---

## 17.6. Consultar acta publicada propia

```http id="xf447q"
GET /api/v1/me/meetings/{meetingId}/minutes
```

Permiso:

```text id="ti2332"
meetingMinutes.read.own
```

Reglas:

* Solo actas `published`.
* Solo si el usuario pertenece a la audiencia.
* No devuelve metadata interna.

---

## 17.7. Consultar resoluciones propias

```http id="sjkdgi"
GET /api/v1/me/meetings/{meetingId}/resolutions
```

Permiso:

```text id="qquqaf"
meetingResolutions.read.own
```

---

## 17.8. Listar mis representaciones

```http id="i8t9ny"
GET /api/v1/me/meeting-proxies
```

Permiso:

```text id="zvjrvc"
meetingProxies.read.own
```

---

## 17.9. Crear representación propia

```http id="xjue8h"
POST /api/v1/me/meetings/{meetingId}/proxies
```

Permiso:

```text id="oi1ndq"
meetingProxies.create.own
```

Request body:

```json id="y8mcep"
{
  "representedPropertyUnitId": "property_unit_uuid",
  "representativePersonId": "representative_person_uuid",
  "representativeUserId": "representative_user_uuid",
  "documentReference": "storage://tenant/meetings/proxies/proxy_uuid.pdf"
}
```

Reglas:

* El usuario solo puede crear proxy para sus unidades/personas autorizadas.
* Estado inicial: `submitted`.
* Requiere aprobación administrativa salvo política explícita.

---

# 18. Matriz de endpoints

| Método | Ruta                                                          | Scope  | Auth | Permiso                                            |
| ------ | ------------------------------------------------------------- | ------ | ---- | -------------------------------------------------- |
| GET    | `/api/v1/tenant/meetings`                                     | tenant | Sí   | `meetings.read`                                    |
| POST   | `/api/v1/tenant/meetings`                                     | tenant | Sí   | `meetings.create`                                  |
| GET    | `/api/v1/tenant/meetings/{meetingId}`                         | tenant | Sí   | `meetings.read`                                    |
| PATCH  | `/api/v1/tenant/meetings/{meetingId}`                         | tenant | Sí   | `meetings.update`                                  |
| POST   | `/api/v1/tenant/meetings/{meetingId}/schedule`                | tenant | Sí   | `meetings.schedule`                                |
| POST   | `/api/v1/tenant/meetings/{meetingId}/call`                    | tenant | Sí   | `meetings.call`                                    |
| POST   | `/api/v1/tenant/meetings/{meetingId}/start`                   | tenant | Sí   | `meetings.start`                                   |
| POST   | `/api/v1/tenant/meetings/{meetingId}/cancel`                  | tenant | Sí   | `meetings.cancel`                                  |
| POST   | `/api/v1/tenant/meetings/{meetingId}/close-attendance`        | tenant | Sí   | `meetingAttendance.close`                          |
| POST   | `/api/v1/tenant/meetings/{meetingId}/complete`                | tenant | Sí   | `meetings.complete`                                |
| POST   | `/api/v1/tenant/meetings/{meetingId}/archive`                 | tenant | Sí   | `meetings.archive`                                 |
| POST   | `/api/v1/tenant/meetings/{meetingId}/calculate-quorum`        | tenant | Sí   | `meetingQuorum.calculate`                          |
| GET    | `/api/v1/tenant/meetings/{meetingId}/agenda`                  | tenant | Sí   | `meetingAgenda.read`                               |
| POST   | `/api/v1/tenant/meetings/{meetingId}/agenda`                  | tenant | Sí   | `meetingAgenda.create`                             |
| GET    | `/api/v1/tenant/meeting-agenda-items/{agendaItemId}`          | tenant | Sí   | `meetingAgenda.read`                               |
| PATCH  | `/api/v1/tenant/meeting-agenda-items/{agendaItemId}`          | tenant | Sí   | `meetingAgenda.update`                             |
| POST   | `/api/v1/tenant/meetings/{meetingId}/agenda/reorder`          | tenant | Sí   | `meetingAgenda.reorder`                            |
| POST   | `/api/v1/tenant/meeting-agenda-items/{agendaItemId}/complete` | tenant | Sí   | `meetingAgenda.update`                             |
| POST   | `/api/v1/tenant/meeting-agenda-items/{agendaItemId}/skip`     | tenant | Sí   | `meetingAgenda.update`                             |
| POST   | `/api/v1/tenant/meeting-agenda-items/{agendaItemId}/archive`  | tenant | Sí   | `meetingAgenda.archive`                            |
| GET    | `/api/v1/tenant/meetings/{meetingId}/participants`            | tenant | Sí   | `meetingParticipants.read`                         |
| POST   | `/api/v1/tenant/meetings/{meetingId}/participants`            | tenant | Sí   | `meetingParticipants.create`                       |
| PUT    | `/api/v1/tenant/meetings/{meetingId}/participants`            | tenant | Sí   | `meetingParticipants.update`                       |
| GET    | `/api/v1/tenant/meeting-participants/{participantId}`         | tenant | Sí   | `meetingParticipants.read`                         |
| PATCH  | `/api/v1/tenant/meeting-participants/{participantId}`         | tenant | Sí   | `meetingParticipants.update`                       |
| POST   | `/api/v1/tenant/meeting-participants/{participantId}/archive` | tenant | Sí   | `meetingParticipants.archive`                      |
| GET    | `/api/v1/tenant/meetings/{meetingId}/attendance`              | tenant | Sí   | `meetingAttendance.read`                           |
| POST   | `/api/v1/tenant/meetings/{meetingId}/attendance`              | tenant | Sí   | `meetingAttendance.create`                         |
| GET    | `/api/v1/tenant/meeting-attendance/{attendanceId}`            | tenant | Sí   | `meetingAttendance.read`                           |
| PATCH  | `/api/v1/tenant/meeting-attendance/{attendanceId}`            | tenant | Sí   | `meetingAttendance.update`                         |
| POST   | `/api/v1/tenant/meeting-attendance/{attendanceId}/check-out`  | tenant | Sí   | `meetingAttendance.update`                         |
| POST   | `/api/v1/tenant/meeting-attendance/{attendanceId}/excuse`     | tenant | Sí   | `meetingAttendance.update`                         |
| POST   | `/api/v1/tenant/meeting-attendance/{attendanceId}/archive`    | tenant | Sí   | `meetingAttendance.override`                       |
| GET    | `/api/v1/tenant/meetings/{meetingId}/proxies`                 | tenant | Sí   | `meetingProxies.read`                              |
| POST   | `/api/v1/tenant/meetings/{meetingId}/proxies`                 | tenant | Sí   | `meetingProxies.create`                            |
| GET    | `/api/v1/tenant/meeting-proxies/{proxyId}`                    | tenant | Sí   | `meetingProxies.read`                              |
| POST   | `/api/v1/tenant/meeting-proxies/{proxyId}/approve`            | tenant | Sí   | `meetingProxies.approve`                           |
| POST   | `/api/v1/tenant/meeting-proxies/{proxyId}/reject`             | tenant | Sí   | `meetingProxies.reject`                            |
| POST   | `/api/v1/tenant/meeting-proxies/{proxyId}/cancel`             | tenant | Sí   | `meetingProxies.cancel`                            |
| POST   | `/api/v1/tenant/meeting-proxies/{proxyId}/archive`            | tenant | Sí   | `meetingProxies.cancel`                            |
| GET    | `/api/v1/tenant/meetings/{meetingId}/minutes`                 | tenant | Sí   | `meetingMinutes.read`                              |
| POST   | `/api/v1/tenant/meetings/{meetingId}/minutes`                 | tenant | Sí   | `meetingMinutes.create`                            |
| GET    | `/api/v1/tenant/meeting-minutes/{minutesId}`                  | tenant | Sí   | `meetingMinutes.read`                              |
| PATCH  | `/api/v1/tenant/meeting-minutes/{minutesId}`                  | tenant | Sí   | `meetingMinutes.update`                            |
| POST   | `/api/v1/tenant/meeting-minutes/{minutesId}/submit-review`    | tenant | Sí   | `meetingMinutes.review`                            |
| POST   | `/api/v1/tenant/meeting-minutes/{minutesId}/approve`          | tenant | Sí   | `meetingMinutes.approve`                           |
| POST   | `/api/v1/tenant/meeting-minutes/{minutesId}/publish`          | tenant | Sí   | `meetingMinutes.publish`                           |
| POST   | `/api/v1/tenant/meeting-minutes/{minutesId}/archive`          | tenant | Sí   | `meetingMinutes.archive`                           |
| GET    | `/api/v1/tenant/meetings/{meetingId}/resolutions`             | tenant | Sí   | `meetingResolutions.read`                          |
| POST   | `/api/v1/tenant/meetings/{meetingId}/resolutions`             | tenant | Sí   | `meetingResolutions.create`                        |
| GET    | `/api/v1/tenant/meeting-resolutions/{resolutionId}`           | tenant | Sí   | `meetingResolutions.read`                          |
| PATCH  | `/api/v1/tenant/meeting-resolutions/{resolutionId}`           | tenant | Sí   | `meetingResolutions.update`                        |
| POST   | `/api/v1/tenant/meeting-resolutions/{resolutionId}/approve`   | tenant | Sí   | `meetingResolutions.approve`                       |
| POST   | `/api/v1/tenant/meeting-resolutions/{resolutionId}/cancel`    | tenant | Sí   | `meetingResolutions.cancel`                        |
| POST   | `/api/v1/tenant/meeting-resolutions/{resolutionId}/archive`   | tenant | Sí   | `meetingResolutions.archive`                       |
| GET    | `/api/v1/me/meetings`                                         | own    | Sí   | `meetingAttendance.read.own` / `meetings.read.own` |
| GET    | `/api/v1/me/meetings/{meetingId}`                             | own    | Sí   | `meetingAttendance.read.own` / `meetings.read.own` |
| GET    | `/api/v1/me/meetings/{meetingId}/agenda`                      | own    | Sí   | `meetingAttendance.read.own` / `meetings.read.own` |
| GET    | `/api/v1/me/meetings/{meetingId}/attendance`                  | own    | Sí   | `meetingAttendance.read.own`                       |
| POST   | `/api/v1/me/meetings/{meetingId}/attendance/check-in`         | own    | Sí   | `meetingAttendance.create.own`                     |
| GET    | `/api/v1/me/meetings/{meetingId}/minutes`                     | own    | Sí   | `meetingMinutes.read.own`                          |
| GET    | `/api/v1/me/meetings/{meetingId}/resolutions`                 | own    | Sí   | `meetingResolutions.read.own`                      |
| GET    | `/api/v1/me/meeting-proxies`                                  | own    | Sí   | `meetingProxies.read.own`                          |
| POST   | `/api/v1/me/meetings/{meetingId}/proxies`                     | own    | Sí   | `meetingProxies.create.own`                        |

---

# 19. Catálogo de errores

| Código                                     | HTTP | Descripción                                             |
| ------------------------------------------ | ---: | ------------------------------------------------------- |
| `MEETING_NOT_FOUND`                        |  404 | Reunión no encontrada o no accesible                    |
| `MEETING_FORBIDDEN`                        |  403 | Usuario sin acceso a la reunión                         |
| `MEETING_INVALID_TRANSITION`               |  409 | Transición de estado inválida                           |
| `MEETING_INVALID_SCHEDULE`                 |  422 | Fechas o configuración inválidas                        |
| `MEETING_CANCELLATION_REASON_REQUIRED`     |  422 | Falta razón de cancelación                              |
| `MEETING_CROSS_TENANT_REFERENCE`           |  403 | Referencia de otro tenant                               |
| `MEETING_PARTICIPANT_INVALID`              |  422 | Participante inválido                                   |
| `MEETING_PARTICIPANT_NOT_FOUND`            |  404 | Participante no encontrado                              |
| `MEETING_ATTENDANCE_NOT_FOUND`             |  404 | Registro de asistencia no encontrado                    |
| `MEETING_ATTENDANCE_DUPLICATE`             |  409 | Asistencia duplicada                                    |
| `MEETING_ATTENDANCE_CLOSED`                |  409 | Asistencia cerrada                                      |
| `MEETING_ATTENDANCE_INVALID_STATUS`        |  422 | Estado de asistencia inválido                           |
| `MEETING_ATTENDANCE_SELF_CHECKIN_DISABLED` |  409 | Self check-in deshabilitado                             |
| `MEETING_PROXY_NOT_FOUND`                  |  404 | Representación no encontrada                            |
| `MEETING_PROXY_INVALID`                    |  422 | Representación inválida                                 |
| `MEETING_PROXY_NOT_APPROVED`               |  422 | Proxy requerido no aprobado                             |
| `MEETING_QUORUM_RULE_INVALID`              |  422 | Regla de quórum inválida                                |
| `MEETING_QUORUM_RULE_UNSUPPORTED`          |  422 | Regla de quórum no soportada en MVP                     |
| `MEETING_QUORUM_NO_EXPECTED_PARTICIPANTS`  |  422 | No existen participantes esperados para calcular quórum |
| `MEETING_MINUTES_NOT_FOUND`                |  404 | Acta no encontrada                                      |
| `MEETING_MINUTES_ALREADY_EXISTS`           |  409 | Ya existe acta activa                                   |
| `MEETING_MINUTES_INVALID_STATUS`           |  409 | Estado de acta inválido                                 |
| `MEETING_RESOLUTION_NOT_FOUND`             |  404 | Resolución no encontrada                                |
| `MEETING_RESOLUTION_INVALID_STATUS`        |  409 | Estado de resolución inválido                           |
| `MEETING_CONTENT_INVALID`                  |  422 | Contenido inseguro o inválido                           |
| `VALIDATION_ERROR`                         |  422 | Error de validación                                     |
| `UNAUTHORIZED`                             |  401 | No autenticado                                          |
| `FORBIDDEN`                                |  403 | Sin permiso                                             |
| `RATE_LIMITED`                             |  429 | Rate limit                                              |
| `INTERNAL_ERROR`                           |  500 | Error interno                                           |

---

# 20. Ejemplos de errores

## 20.1. Reunión ajena o inexistente

```json id="mmj36m"
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

## 20.2. Transición inválida

```json id="a9kcye"
{
  "error": {
    "code": "MEETING_INVALID_TRANSITION",
    "message": "The requested meeting status transition is not allowed.",
    "details": {
      "fromStatus": "archived",
      "toStatus": "inProgress"
    },
    "traceId": "req_123456"
  }
}
```

---

## 20.3. Participante de otro tenant

```json id="h2t11u"
{
  "error": {
    "code": "MEETING_CROSS_TENANT_REFERENCE",
    "message": "The provided participant reference does not belong to the current tenant.",
    "details": {
      "referenceType": "propertyUnit"
    },
    "traceId": "req_123456"
  }
}
```

---

## 20.4. Asistencia duplicada

```json id="vw7njj"
{
  "error": {
    "code": "MEETING_ATTENDANCE_DUPLICATE",
    "message": "An active attendance record already exists for this meeting subject.",
    "details": {
      "subjectType": "propertyUnit"
    },
    "traceId": "req_123456"
  }
}
```

---

## 20.5. Asistencia cerrada

```json id="l8zfyl"
{
  "error": {
    "code": "MEETING_ATTENDANCE_CLOSED",
    "message": "Meeting attendance is already closed.",
    "details": {
      "requiresPermission": "meetingAttendance.override"
    },
    "traceId": "req_123456"
  }
}
```

---

## 20.6. Proxy no aprobado

```json id="qc62me"
{
  "error": {
    "code": "MEETING_PROXY_NOT_APPROVED",
    "message": "Represented attendance requires an approved proxy.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

## 20.7. Regla de quórum no soportada

```json id="apdqm0"
{
  "error": {
    "code": "MEETING_QUORUM_RULE_UNSUPPORTED",
    "message": "Custom quorum rules are not supported in the MVP.",
    "details": {
      "quorumRuleType": "custom"
    },
    "traceId": "req_123456"
  }
}
```

---

## 20.8. Acta duplicada

```json id="jfvzvo"
{
  "error": {
    "code": "MEETING_MINUTES_ALREADY_EXISTS",
    "message": "An active minutes record already exists for this meeting.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

# 21. Reglas de seguridad del contrato

## 21.1. Endpoints administrativos

Deben aplicar:

```text id="jg0djz"
AuthGuard
TenantGuard
TenantPermissionGuard
MeetingPermissionGuard
tenant_id filter
permission checks
state validation
safe DTO validation
content sanitization
audit events
safe errors
Cache-Control: no-store
```

---

## 21.2. Endpoints `/me`

Deben aplicar:

```text id="ojg2wm"
AuthGuard
TenantGuard
TenantPermissionGuard
OwnMeetingGuard
own-resource validation
audience validation
person/propertyUnit resolution
safe DTO minimization
no third-party attendance exposure
Cache-Control: no-store
```

---

## 21.3. No endpoints públicos

Deben existir pruebas negativas para rutas públicas de reuniones.

---

## 21.4. Content sanitization

Deben sanitizarse:

```text id="gwfat9"
meeting.title
meeting.description
agenda.title
agenda.description
agenda.notes
attendance.notes
minutes.title
minutes.summary
minutes.body
resolution.title
resolution.description
resolution.metadata
```

Bloquear:

```text id="ridq0b"
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

# 22. Auditoría

## 22.1. Eventos obligatorios

```text id="jwfe21"
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

## 22.2. Metadata permitida

```json id="lk42np"
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

## 22.3. Metadata prohibida

```text id="epcg6o"
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

# 23. Observabilidad

## 23.1. Logs sugeridos

```text id="z2s80x"
meeting.created
meeting.updated
meeting.scheduled
meeting.called
meeting.started
meeting.cancelled
meeting.attendanceClosed
meeting.completed
meeting.quorumCalculated
meetingAttendance.registered
meetingAttendance.updated
meetingProxy.approved
meetingMinutes.published
meetingResolution.recorded
```

---

## 23.2. Métricas sugeridas

```text id="s5cik2"
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

## 23.3. Labels permitidos

```text id="s64rp2"
meetingType
meetingStatus
modality
attendanceStatus
quorumMet
outcome
```

---

## 23.4. Labels prohibidos

```text id="xrc42r"
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

# 24. OpenAPI

## 24.1. Tags sugeridos

```text id="ne6vcg"
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

## 24.2. Extensiones OpenAPI sugeridas

### Endpoint tenant

```yaml id="g6vof0"
x-tenant-scope: true
x-auth-required: true
x-required-permission: meetings.create
x-audit-event: meeting.created
```

---

### Endpoint `/me`

```yaml id="cryat8"
x-tenant-scope: true
x-auth-required: true
x-own-resource: true
x-required-permission: meetingAttendance.read.own
```

---

### Endpoint de asistencia

```yaml id="nq5jam"
x-tenant-scope: true
x-auth-required: true
x-required-permission: meetingAttendance.create
x-attendance-controlled: true
x-audit-event: meetingAttendance.registered
```

---

### Endpoint de quórum

```yaml id="hotkpc"
x-tenant-scope: true
x-auth-required: true
x-required-permission: meetingQuorum.calculate
x-quorum-calculation: deterministic
x-audit-event: meeting.quorumCalculated
```

---

### Endpoint de acta

```yaml id="wplstz"
x-tenant-scope: true
x-auth-required: true
x-required-permission: meetingMinutes.publish
x-private-document: true
x-audit-event: meetingMinutes.published
```

---

## 24.3. OpenAPI no debe documentar

```text id="o6lkr1"
GET /api/v1/public/tenants/{slug}/meetings
GET /api/v1/public/tenants/{slug}/meetings/{meetingId}
GET /api/v1/public/tenants/{slug}/meetings/{meetingId}/attendance
GET /api/v1/public/tenants/{slug}/meetings/{meetingId}/minutes
GET /api/v1/public/tenants/{slug}/meetings/{meetingId}/resolutions
POST /api/v1/public/tenants/{slug}/meetings
POST /api/v1/public/tenants/{slug}/meetings/{meetingId}/attendance
```

---

# 25. Casos borde del contrato

| Caso                                            | Resultado esperado           |
| ----------------------------------------------- | ---------------------------- |
| Crear reunión sin título                        | 422                          |
| Crear reunión sin `startsAt`                    | 422                          |
| Crear reunión con `endsAt` antes de `startsAt`  | 422                          |
| Crear reunión con `tenantId` en body            | 422                          |
| Editar reunión completada                       | 409                          |
| Programar reunión archivada                     | 409                          |
| Convocar reunión sin participantes              | 422 según política           |
| Participante de otro tenant                     | 403                          |
| Usuario de otro tenant como participante        | 403                          |
| Unidad de otro tenant como participante         | 403                          |
| Persona de otro tenant como participante        | 403                          |
| Registrar asistencia en reunión cancelada       | 409                          |
| Registrar asistencia duplicada                  | 409                          |
| Registrar asistencia propia en unidad ajena     | 403/404                      |
| Registrar `represented` sin proxy aprobado      | 422                          |
| Aprobar proxy de otro tenant                    | 403/404                      |
| Calcular quórum `none`                          | resultado null               |
| Calcular quórum `custom`                        | 422 en MVP                   |
| Calcular porcentaje sin participantes esperados | 422                          |
| Cerrar asistencia dos veces                     | 409 o idempotente controlado |
| Modificar asistencia cerrada sin override       | 409                          |
| Crear acta duplicada                            | 409                          |
| Publicar acta sin permiso                       | 403                          |
| Ver acta ajena desde `/me`                      | 403/404                      |
| Crear resolución con agenda de otra reunión     | 403/422                      |
| Endpoint público de reuniones                   | no existe                    |
| Acta con script                                 | sanitizado/rechazado         |
| OpenAPI documenta reunión pública               | falla                        |

---

# 26. Pruebas de contrato requeridas

## 26.1. Meetings administrativas

Debe probar:

```text id="cv00ib"
GET /api/v1/tenant/meetings
POST /api/v1/tenant/meetings
GET /api/v1/tenant/meetings/{meetingId}
PATCH /api/v1/tenant/meetings/{meetingId}
POST /api/v1/tenant/meetings/{meetingId}/schedule
POST /api/v1/tenant/meetings/{meetingId}/call
POST /api/v1/tenant/meetings/{meetingId}/start
POST /api/v1/tenant/meetings/{meetingId}/cancel
POST /api/v1/tenant/meetings/{meetingId}/close-attendance
POST /api/v1/tenant/meetings/{meetingId}/complete
POST /api/v1/tenant/meetings/{meetingId}/archive
POST /api/v1/tenant/meetings/{meetingId}/calculate-quorum
```

Casos mínimos:

* 401 sin token;
* 403 sin permiso;
* 200/201 con permiso;
* 409 transición inválida;
* 422 validación semántica;
* 403/404 cross-tenant;
* auditoría.

---

## 26.2. Agenda

Debe probar:

```text id="mb20eg"
GET agenda
POST agenda
GET agenda item
PATCH agenda item
POST reorder
POST complete
POST skip
POST archive
```

Casos mínimos:

* no agenda cross-tenant;
* no presenter de otro tenant;
* no orden duplicado;
* no edición en reunión archivada;
* sanitización.

---

## 26.3. Participantes

Debe probar:

```text id="gssbnw"
GET participants
POST participants
PUT participants
GET participant
PATCH participant
POST archive participant
```

Casos mínimos:

* userId de otro tenant falla;
* personId de otro tenant falla;
* propertyUnitId de otro tenant falla;
* roleId de otro tenant falla;
* participantType exige ID cuando corresponde;
* audiencia owners/residents/allTenantUsers válida.

---

## 26.4. Asistencia

Debe probar:

```text id="sf4ysl"
GET attendance
POST attendance
GET attendance record
PATCH attendance
POST check-out
POST excuse
POST archive
```

Casos mínimos:

* asistencia duplicada falla;
* asistencia en cancelada falla;
* represented sin proxy aprobado falla;
* checkOutAt antes de checkInAt falla;
* asistencia cerrada requiere override;
* no asistencia cross-tenant.

---

## 26.5. Proxies

Debe probar:

```text id="jwt7kl"
GET proxies
POST proxy
GET proxy
POST approve
POST reject
POST cancel
POST archive
```

Casos mínimos:

* representado requerido;
* representante requerido;
* cross-tenant falla;
* rechazo requiere razón;
* cancelación requiere razón;
* proxy aprobado puede usarse en asistencia represented.

---

## 26.6. Actas

Debe probar:

```text id="vhkk4b"
GET minutes by meeting
POST minutes
GET minutes by id
PATCH minutes
POST submit-review
POST approve
POST publish
POST archive
```

Casos mínimos:

* una acta activa por reunión;
* contenido sanitizado;
* publish requiere permiso;
* acta no pública;
* `/me` solo consulta acta published autorizada.

---

## 26.7. Resoluciones

Debe probar:

```text id="j42yd4"
GET resolutions
POST resolution
GET resolution
PATCH resolution
POST approve
POST cancel
POST archive
```

Casos mínimos:

* agendaItem debe pertenecer a la reunión;
* no ejecuta acciones automáticas;
* no representa votación formal;
* cancelación requiere razón.

---

## 26.8. `/me`

Debe probar:

```text id="zubbpw"
GET /api/v1/me/meetings
GET /api/v1/me/meetings/{meetingId}
GET /api/v1/me/meetings/{meetingId}/agenda
GET /api/v1/me/meetings/{meetingId}/attendance
POST /api/v1/me/meetings/{meetingId}/attendance/check-in
GET /api/v1/me/meetings/{meetingId}/minutes
GET /api/v1/me/meetings/{meetingId}/resolutions
GET /api/v1/me/meeting-proxies
POST /api/v1/me/meetings/{meetingId}/proxies
```

Casos mínimos:

* usuario ve solo reuniones propias;
* owner ve owners;
* resident ve residents;
* usuario ve allTenantUsers;
* usuario no ve propertyUnit ajena;
* no ve asistencia de terceros;
* self check-in deshabilitado falla;
* self check-in en unidad ajena falla.

---

# 27. Decisión final del contrato API

El módulo `013-meetings-attendance` expondrá endpoints REST para:

```text id="fdw751"
1. Gestión administrativa de reuniones.
2. Gestión de agenda.
3. Gestión de participantes.
4. Registro administrativo de asistencia.
5. Gestión de representaciones básicas.
6. Cálculo de quórum.
7. Gestión de actas preliminares.
8. Gestión de resoluciones básicas.
9. Consulta de reuniones propias.
10. Consulta propia de agenda, asistencia, actas y resoluciones.
11. Creación propia de representaciones si la política lo permite.
```

El contrato garantiza:

```text id="rd9rap"
tenant isolation
permissioned access
own-resource authorization
audience validation
state transition control
attendance duplicate prevention
closed attendance lock
proxy validation
deterministic quorum calculation
minutes privacy
resolution traceability
notification event integration
safe errors
safe logs
audit trail
OpenAPI consistency
CI validation
no public exposure
```

La implementación no debe aceptarse si permite reuniones cross-tenant, participantes de otro tenant, asistencia duplicada, acceso a reuniones ajenas, exposición pública de reuniones, modificación de asistencia cerrada sin permiso, representaciones sin validación, quórum sin trazabilidad, actas con contenido inseguro, logs con datos personales, omisión de auditoría, o mezcla de esta funcionalidad con votación electrónica formal, multas automáticas, firma electrónica, QR avanzado o IA con datos reales.
