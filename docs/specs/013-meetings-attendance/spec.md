# Spec 013 — Meetings and Attendance

## 1. Información del documento

| Campo           | Valor                                                                                                                                                       |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                               |
| Spec ID         | 013                                                                                                                                                         |
| Módulo          | Meetings and Attendance                                                                                                                                     |
| Documento       | Functional Specification                                                                                                                                    |
| Ruta            | `docs/specs/013-meetings-attendance/spec.md`                                                                                                                |
| Versión         | 0.1                                                                                                                                                         |
| Estado          | Borrador inicial                                                                                                                                            |
| Fecha           | 2026-07-19                                                                                                                                                  |
| Prioridad       | Media / Alta                                                                                                                                                |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `007-audit`, `012-communications-notifications`                                               |
| Relacionado con | Asambleas, reuniones, convocatorias, agenda, asistencia, quórum, actas, resoluciones básicas, propietarios, residentes, unidades, notificaciones, auditoría |

---

## 2. Nombre de la funcionalidad

```text id="o2d7hm"
Meetings and Attendance
```

---

## 3. Propósito

El módulo `013-meetings-attendance` define la gestión básica de reuniones, asambleas y asistencia dentro de RESIDENT Core.

El objetivo es permitir que cada conjunto residencial pueda crear reuniones administrativas, convocar participantes, definir agenda, registrar asistencia, calcular quórum básico, gestionar representaciones simples, registrar actas preliminares y conservar trazabilidad auditable.

Regla central:

```text id="rb1vy9"
Toda reunión o registro de asistencia debe pertenecer a un tenant, estar asociado a una convocatoria válida, participantes autorizados, unidades o personas vinculadas, reglas de quórum configurables y trazabilidad auditable.
```

---

## 4. Objetivo funcional

Permitir la administración inicial de reuniones y asistencia en RESIDENT Core, incluyendo:

* creación de reuniones;
* clasificación de reuniones;
* configuración de fecha, hora, lugar y modalidad;
* definición de agenda;
* convocatoria de participantes;
* segmentación por propietarios, residentes, roles o unidades;
* integración con comunicaciones/notificaciones;
* registro de asistencia;
* registro de ausencias;
* registro de asistencia tardía;
* registro de salida anticipada;
* representación o delegación básica;
* cálculo básico de quórum;
* consulta administrativa de reuniones;
* consulta de reuniones propias;
* registro de acta preliminar;
* registro de resoluciones básicas no vinculadas a votación formal;
* archivo de reuniones finalizadas;
* auditoría de cambios y asistencia;
* protección de datos personales;
* preparación para votaciones futuras;
* preparación para firma electrónica futura;
* preparación para actas formales futuras.

---

## 5. Alcance

### 5.1. Incluido en esta spec

Esta spec incluye:

```text id="coqm5z"
1. Gestión de reuniones.
2. Tipos de reunión.
3. Estados de reunión.
4. Modalidades de reunión.
5. Agenda básica.
6. Convocatoria básica.
7. Audiencia o participantes esperados.
8. Consulta administrativa de reuniones.
9. Consulta propia de reuniones.
10. Registro administrativo de asistencia.
11. Registro propio de asistencia si el tenant lo permite.
12. Registro de ausencias.
13. Registro de ingreso tardío.
14. Registro de salida anticipada.
15. Representación o delegación básica.
16. Cálculo básico de quórum.
17. Registro de acta preliminar.
18. Registro de resoluciones básicas.
19. Integración con notificaciones.
20. Auditoría de operaciones críticas.
21. API REST.
22. Pruebas funcionales, multitenant, autorización, privacidad y seguridad.
```

---

### 5.2. No incluido en esta spec

Queda fuera del MVP:

```text id="bbslmm"
- Votación electrónica formal.
- Ponderación avanzada de votos.
- Cálculo legal avanzado de mayorías.
- Firma electrónica de actas.
- Firma manuscrita digitalizada validada legalmente.
- Certificación legal de asistencia.
- Integración con notarías.
- Integración con plataformas de videoconferencia.
- Grabación de reuniones.
- Transcripción automática.
- Resumen automático con IA.
- Actas PDF formales.
- Envío automático de actas firmadas.
- Control biométrico de asistencia.
- Geolocalización precisa de asistencia.
- QR dinámico para asistencia.
- Validación legal de poderes.
- Representaciones múltiples complejas.
- Poderes notariales.
- Control avanzado de coeficientes de copropiedad.
- Resoluciones vinculantes automatizadas.
- Ejecución automática de decisiones.
- Sanciones automáticas por inasistencia.
- Multas automáticas por ausencia.
- Restricciones automáticas por falta de asistencia.
- Chat de reunión.
- Comentarios en vivo.
- Preguntas en vivo.
- Moderación avanzada.
```

Estos temas podrán definirse en specs futuras.

---

## 6. Contexto arquitectónico

Este módulo pertenece al bounded context:

```text id="rhtnzj"
Meetings and Attendance
```

Se relaciona con:

```text id="akbmr4"
Tenant Management
Identity and Access
Residents and Properties
Communications and Notifications
Audit and Compliance
Reporting and Analytics
Fines and Sanctions
Payments and Reconciliation
External Integrations
```

Relación conceptual:

```text id="jjgt6k"
Tenant
  └── Meetings
        ├── Meeting Type
        ├── Agenda Items
        ├── Expected Participants
        ├── Attendance Records
        ├── Proxies / Delegations
        ├── Quorum Calculation
        ├── Minutes
        ├── Basic Resolutions
        └── Audit Trail
```

---

## 7. Principios

### 7.1. Tenant isolation obligatorio

Toda reunión, agenda, participante, asistencia, representación, acta y resolución pertenece a un tenant.

Regla:

```text id="lq45ag"
meeting.tenantId == currentTenant.id
```

---

### 7.2. Unidad habitacional como eje de participación

Para reuniones de propietarios o asambleas, la participación puede depender de la relación entre usuario, persona y unidad habitacional.

Regla conceptual:

```text id="d84x4p"
actorUserId -> personId -> ownership/residency/lease -> propertyUnitId -> meeting eligibility
```

---

### 7.3. Personas y usuarios no son lo mismo

Una persona puede existir como propietario o residente sin tener usuario digital.

El sistema debe permitir:

```text id="svx68y"
asistencia vinculada a usuario autenticado
asistencia vinculada a persona registrada
asistencia registrada manualmente por administrador
```

---

### 7.4. Convocatoria antes que asistencia

No debe registrarse asistencia ordinaria sobre reuniones inexistentes, canceladas o archivadas.

Regla:

```text id="ozpehu"
attendance requires meeting.status IN scheduled, inProgress, completed
```

La política puede restringir registro de asistencia a `scheduled` o `inProgress`.

---

### 7.5. Quórum configurable

El quórum puede variar según tipo de reunión, reglamento interno o política del tenant.

MVP recomienda cálculo básico por cantidad de unidades o participantes esperados.

Regla:

```text id="l47xl0"
El cálculo de quórum MVP es informativo y configurable; no sustituye validación legal formal.
```

---

### 7.6. Votación fuera de alcance

Este módulo puede registrar resoluciones básicas, pero no implementa votación electrónica formal.

Regla:

```text id="mqwz86"
Meetings and Attendance registra reunión, asistencia y acta básica; Voting será una spec separada.
```

---

### 7.7. Auditoría obligatoria

Se deben auditar operaciones críticas:

* creación de reunión;
* actualización de reunión;
* convocatoria;
* cambio de estado;
* cancelación;
* registro de asistencia;
* modificación de asistencia;
* registro de representación;
* cierre de asistencia;
* cálculo de quórum;
* cierre de reunión;
* actualización de acta;
* registro de resolución;
* archivo de reunión.

---

### 7.8. Minimización de datos personales

El módulo no debe exponer datos personales de asistentes a usuarios no autorizados.

La vista propia debe mostrar únicamente reuniones y registros relacionados con el usuario, sus personas vinculadas o sus unidades autorizadas.

---

### 7.9. Integración con notificaciones

La convocatoria y recordatorios deben apoyarse en `012-communications-notifications`.

El módulo no debe implementar un canal propio de email, WhatsApp, SMS o push.

Regla:

```text id="dic7tm"
Meetings emite eventos; Communications and Notifications gestiona entrega.
```

---

## 8. Actores

### 8.1. TenantAdmin

Administrador del conjunto.

Puede:

* crear reuniones;
* editar reuniones;
* convocar participantes;
* registrar asistencia;
* cerrar asistencia;
* calcular quórum;
* registrar actas;
* registrar resoluciones básicas;
* cancelar reuniones;
* archivar reuniones;
* consultar auditoría si tiene permiso.

---

### 8.2. MeetingManager

Rol operativo para gestionar reuniones y asistencia.

Puede:

* crear reuniones según permiso;
* administrar agenda;
* administrar participantes;
* registrar asistencia;
* gestionar representaciones básicas;
* cerrar asistencia;
* preparar acta preliminar.

---

### 8.3. BoardMember

Miembro de directiva, comité o administración.

Puede:

* consultar reuniones administrativas;
* consultar agenda;
* registrar observaciones si se habilita;
* revisar acta preliminar;
* consultar asistencia si tiene permiso.

---

### 8.4. PropertyOwner

Propietario asociado a una o más unidades.

Puede:

* consultar reuniones dirigidas a propietarios;
* confirmar asistencia si se habilita;
* consultar su registro de asistencia;
* registrar representación básica si la política lo permite;
* consultar actas publicadas para su audiencia.

---

### 8.5. Resident

Residente asociado a una unidad.

Puede:

* consultar reuniones dirigidas a residentes;
* confirmar asistencia si se habilita;
* consultar su asistencia;
* consultar actas publicadas si corresponde.

---

### 8.6. Treasurer

Puede participar en reuniones financieras o consultar reuniones con agenda financiera si tiene permisos.

No tiene permisos automáticos para modificar reuniones salvo configuración del tenant.

---

### 8.7. PlatformAdmin

Administrador de plataforma.

Puede apoyar soporte técnico, pero no debe consultar contenido interno de reuniones salvo permiso excepcional, auditado y justificado.

---

### 8.8. Visitante público

No debe acceder a reuniones internas, asistencia, actas o participantes.

MVP no expone reuniones por endpoints públicos.

---

## 9. Definiciones

### 9.1. Meeting

Reunión, asamblea, sesión de comité o evento administrativo convocado dentro de un tenant.

Ejemplos:

```text id="g1yffw"
asamblea ordinaria
asamblea extraordinaria
reunión de directiva
reunión de comité
reunión informativa
reunión de seguridad
reunión financiera
reunión de mantenimiento
```

---

### 9.2. Meeting Agenda Item

Punto de agenda tratado o planificado para una reunión.

Ejemplos:

```text id="a6q1nb"
Lectura del acta anterior
Informe financiero
Aprobación de presupuesto
Mantenimiento de áreas comunales
Revisión de multas
Plan de seguridad
Varios
```

---

### 9.3. Meeting Participant

Persona, usuario, rol, unidad o grupo esperado en la reunión.

Puede representar:

```text id="e6yzk9"
propietarios
residentes
usuarios específicos
roles administrativos
unidades habitacionales
personas específicas
```

---

### 9.4. Attendance Record

Registro de asistencia de una persona o usuario a una reunión.

Puede indicar:

```text id="t5rm7l"
present
absent
late
leftEarly
represented
excused
```

---

### 9.5. Proxy / Delegation

Representación simple mediante la cual una persona o unidad es representada por otra persona autorizada.

MVP la trata como registro administrativo básico, no como validación legal avanzada.

---

### 9.6. Quorum

Resultado informativo del cálculo de participación mínima requerida para que una reunión pueda continuar o validar su instalación según política del tenant.

MVP soporta:

```text id="zdunln"
quórum por número de unidades
quórum por número de participantes esperados
quórum por porcentaje simple
```

---

### 9.7. Meeting Minutes

Acta preliminar o resumen formal básico de la reunión.

MVP no genera PDF formal ni firma electrónica.

---

### 9.8. Meeting Resolution

Resolución o decisión registrada en acta de forma básica.

MVP no valida votación formal.

---

## 10. Supuestos

1. El tenant ya existe.
2. Usuarios, roles y permisos existen.
3. Personas, propietarios, residentes y unidades existen.
4. El vínculo usuario-persona-unidad existe desde `003-residents-properties`.
5. El módulo de auditoría existe.
6. El módulo de comunicaciones/notificaciones existe.
7. Keycloak o mecanismo compatible autentica usuarios.
8. RESIDENT Core autoriza por tenant, permiso y recurso.
9. Las reuniones no se exponen públicamente en WordPress en MVP.
10. La convocatoria se puede notificar mediante `012-communications-notifications`.
11. La asistencia puede ser registrada por administradores.
12. La asistencia propia puede habilitarse por política del tenant.
13. El quórum MVP es configurable e informativo.
14. La votación electrónica formal queda fuera de alcance.
15. Las actas PDF formales quedan fuera de alcance.
16. Las firmas electrónicas quedan fuera de alcance.
17. La zona horaria por defecto del tenant es `America/Guayaquil`.
18. Las fechas se almacenan en UTC.
19. No se usará IA externa con datos reales de reuniones, asistencia o actas.
20. El módulo no aplica multas automáticas por inasistencia en MVP.

---

## 11. Entidades principales

### 11.1. Meeting

Representa una reunión o asamblea.

Campos conceptuales:

```text id="b5w2mo"
Meeting
├── id
├── tenantId
├── title
├── description
├── meetingType
├── modality
├── location
├── virtualMeetingUrl
├── status
├── visibility
├── startsAt
├── endsAt
├── timezone
├── calledAt
├── calledBy
├── createdBy
├── updatedBy
├── cancelledBy
├── closedBy
├── archivedBy
├── cancellationReason
├── quorumRuleType
├── quorumRequiredValue
├── quorumCalculatedValue
├── quorumMet
├── attendanceClosedAt
├── minutesStatus
├── metadata
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 11.2. MeetingAgendaItem

Representa un punto de agenda.

Campos conceptuales:

```text id="n0bx02"
MeetingAgendaItem
├── id
├── tenantId
├── meetingId
├── order
├── title
├── description
├── presenterUserId nullable
├── estimatedMinutes nullable
├── status
├── notes
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 11.3. MeetingParticipant

Representa una audiencia esperada o participante convocado.

Campos conceptuales:

```text id="ow20q9"
MeetingParticipant
├── id
├── tenantId
├── meetingId
├── participantType
├── userId nullable
├── personId nullable
├── propertyUnitId nullable
├── roleId nullable
├── isRequired
├── status
├── invitedAt
├── respondedAt
├── response
├── createdAt
└── archivedAt
```

---

### 11.4. MeetingAttendance

Representa el registro de asistencia.

Campos conceptuales:

```text id="yu2ngr"
MeetingAttendance
├── id
├── tenantId
├── meetingId
├── participantId nullable
├── userId nullable
├── personId nullable
├── propertyUnitId nullable
├── attendanceStatus
├── checkInAt nullable
├── checkOutAt nullable
├── registeredBy
├── registrationMethod
├── notes nullable
├── isProxy
├── proxyId nullable
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 11.5. MeetingProxy

Representa una representación o delegación básica.

Campos conceptuales:

```text id="nvyu18"
MeetingProxy
├── id
├── tenantId
├── meetingId
├── representedPersonId nullable
├── representedUserId nullable
├── representedPropertyUnitId nullable
├── representativePersonId nullable
├── representativeUserId nullable
├── documentReference nullable
├── status
├── approvedBy nullable
├── approvedAt nullable
├── rejectedBy nullable
├── rejectedAt nullable
├── rejectionReason nullable
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 11.6. MeetingMinutes

Representa acta o resumen preliminar de una reunión.

Campos conceptuales:

```text id="w0rwqc"
MeetingMinutes
├── id
├── tenantId
├── meetingId
├── title
├── summary
├── body
├── status
├── preparedBy
├── reviewedBy nullable
├── approvedBy nullable
├── preparedAt
├── reviewedAt nullable
├── approvedAt nullable
├── publishedAt nullable
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 11.7. MeetingResolution

Representa una resolución básica registrada en acta.

Campos conceptuales:

```text id="l81azn"
MeetingResolution
├── id
├── tenantId
├── meetingId
├── agendaItemId nullable
├── title
├── description
├── resolutionType
├── status
├── recordedBy
├── recordedAt
├── effectiveFrom nullable
├── metadata nullable
├── createdAt
├── updatedAt
└── archivedAt
```

---

## 12. Estados y enums

### 12.1. MeetingType

```text id="m1akkm"
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

### 12.2. MeetingModality

```text id="k8w8ye"
inPerson
virtual
hybrid
```

---

### 12.3. MeetingStatus

```text id="xzw4rx"
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

### 12.4. MeetingVisibility

```text id="ov4l1w"
private
administrative
tenant
owners
residents
mixed
```

---

### 12.5. AgendaItemStatus

```text id="v0gnyj"
pending
inProgress
completed
skipped
archived
```

---

### 12.6. ParticipantType

```text id="ji6osf"
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

### 12.7. ParticipantStatus

```text id="kyuth4"
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

### 12.8. ParticipantResponse

```text id="qw1tvm"
pending
confirmed
declined
tentative
```

---

### 12.9. AttendanceStatus

```text id="vjjqad"
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

### 12.10. AttendanceRegistrationMethod

```text id="lhh24s"
admin
self
qr
import
system
other
```

MVP obligatorio:

```text id="mwujnw"
admin
self opcional
```

Diferidos:

```text id="uctlid"
qr
import
system advanced
```

---

### 12.11. ProxyStatus

```text id="lt17hi"
submitted
approved
rejected
cancelled
archived
```

---

### 12.12. QuorumRuleType

```text id="fvv2iq"
none
participantCount
propertyUnitCount
percentageOfExpectedParticipants
percentageOfPropertyUnits
custom
```

---

### 12.13. MinutesStatus

```text id="y58xf2"
notStarted
draft
underReview
approved
published
archived
```

---

### 12.14. ResolutionType

```text id="f3jlan"
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

### 12.15. ResolutionStatus

```text id="u6tnjc"
draft
recorded
approved
cancelled
archived
```

---

## 13. Transiciones de estado

### 13.1. Meeting

Flujo básico:

```text id="tktwsm"
draft -> scheduled -> called -> inProgress -> attendanceClosed -> completed -> archived
```

Cancelación:

```text id="xsriyt"
draft -> cancelled
scheduled -> cancelled
called -> cancelled
```

Archivo:

```text id="d3rnlx"
completed -> archived
cancelled -> archived
```

Transiciones prohibidas:

```text id="p4i6s4"
archived -> scheduled
archived -> inProgress
cancelled -> inProgress
completed -> inProgress
draft -> completed
called -> completed sin control de asistencia
```

---

### 13.2. AgendaItem

```text id="gwz9ah"
pending -> inProgress -> completed
pending -> skipped
completed -> archived
skipped -> archived
```

---

### 13.3. Participant

```text id="r4skq1"
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

---

### 13.4. Attendance

```text id="vh6sc4"
present -> leftEarly
present -> archived
late -> leftEarly
absent -> excused
represented -> archived
```

---

### 13.5. Proxy

```text id="y9h8gq"
submitted -> approved
submitted -> rejected
submitted -> cancelled
approved -> archived
rejected -> archived
cancelled -> archived
```

---

### 13.6. Minutes

```text id="ycgdzw"
notStarted -> draft -> underReview -> approved -> published
draft -> archived
published -> archived
```

---

### 13.7. Resolution

```text id="dafl4r"
draft -> recorded -> approved
draft -> cancelled
recorded -> cancelled
approved -> archived
cancelled -> archived
```

---

## 14. Reglas de negocio

### BR-001 — Toda reunión pertenece a un tenant

```text id="k7hbxx"
meeting.tenantId = currentTenant.id
```

---

### BR-002 — El cliente no envía tenantId

El `tenantId` se deriva del tenant activo.

---

### BR-003 — Toda agenda pertenece a una reunión del mismo tenant

```text id="y0rqxt"
agendaItem.tenantId = meeting.tenantId
```

---

### BR-004 — Todo participante pertenece al tenant

Si el participante referencia usuario, persona, unidad o rol, esa referencia debe pertenecer al mismo tenant.

---

### BR-005 — Toda asistencia pertenece a una reunión del mismo tenant

```text id="cajms3"
attendance.tenantId = meeting.tenantId
```

---

### BR-006 — No registrar asistencia en reunión archivada o cancelada

Estados no permitidos:

```text id="k03ltb"
cancelled
archived
```

---

### BR-007 — Registro de asistencia requiere participante válido o persona/unidad válida

La asistencia debe vincularse al menos a uno de los siguientes:

```text id="sqcqun"
participantId
userId
personId
propertyUnitId
proxyId
```

---

### BR-008 — Usuario solo ve reuniones propias

Un usuario solo puede consultar reuniones dirigidas a:

```text id="mfmo17"
su usuario
su persona vinculada
sus unidades autorizadas
su rol dentro del tenant
su grupo owners/residents/allTenantUsers
```

---

### BR-009 — Administrador puede registrar asistencia manual

Usuarios con permiso pueden registrar asistencia de participantes válidos.

---

### BR-010 — Registro propio de asistencia es opcional

El tenant puede permitir o bloquear self check-in.

MVP recomendado:

```text id="unh38c"
Self check-in diferido o habilitado solo con política explícita.
```

---

### BR-011 — Una persona/unidad no debe tener asistencia duplicada

No debe existir duplicidad activa para la misma reunión y el mismo sujeto de asistencia.

Regla conceptual:

```text id="b86vxs"
unique active attendance by tenantId + meetingId + personId/propertyUnitId/userId/proxyId
```

---

### BR-012 — Asistencia representada requiere proxy aprobado

Si `attendanceStatus = represented`, debe existir `proxy.status = approved`.

---

### BR-013 — Representación cross-tenant prohibida

El representado y el representante deben pertenecer al mismo tenant.

---

### BR-014 — Quórum informativo configurable

El cálculo de quórum debe usar `quorumRuleType` y `quorumRequiredValue`.

---

### BR-015 — Quórum no debe cambiar datos de asistencia

Calcular quórum no modifica registros de asistencia; solo registra resultado en reunión o snapshot.

---

### BR-016 — Cerrar asistencia bloquea cambios ordinarios

Después de `attendanceClosed`, los cambios de asistencia requieren permiso elevado y auditoría.

---

### BR-017 — Cerrar reunión requiere estado válido

Una reunión solo puede completarse si está `inProgress` o `attendanceClosed`.

---

### BR-018 — Acta preliminar requiere reunión existente

No se crea acta sin reunión.

---

### BR-019 — Publicar acta requiere permiso

Solo roles autorizados pueden publicar acta.

---

### BR-020 — Resoluciones básicas no equivalen a votación formal

Registrar una resolución no implica validación de votos.

---

### BR-021 — No multas automáticas por inasistencia

Este módulo no genera multas automáticamente.

Integración futura con `011-fines-sanctions` requerirá spec separada.

---

### BR-022 — Notificaciones por evento

El módulo puede emitir eventos para notificar:

```text id="jtixkd"
meeting.created
meeting.called
meeting.updated
meeting.cancelled
meeting.reminderRequested
meeting.minutesPublished
```

La entrega corresponde a `012-communications-notifications`.

---

### BR-023 — No exposición pública

MVP no expone reuniones, asistencia ni actas bajo `/api/v1/public`.

---

### BR-024 — Auditoría obligatoria

Toda operación crítica debe auditarse.

---

### BR-025 — No eliminación física ordinaria

No eliminar físicamente reuniones, agenda, participantes, asistencia, proxies, actas ni resoluciones.

---

### BR-026 — Datos personales minimizados

Listados propios no deben exponer asistentes de otras unidades ni participantes completos.

---

### BR-027 — Actas con datos privados no deben ser públicas

Actas solo se consultan con autenticación y autorización.

---

### BR-028 — Importación masiva queda diferida

No se implementa importación masiva de asistencia en MVP.

---

### BR-029 — QR queda diferido

No se implementa QR real de asistencia en MVP.

---

### BR-030 — IA queda diferida

No se usa IA externa con actas, asistentes o datos reales.

---

## 15. Historias de usuario

### US-001 — Crear reunión

Como MeetingManager, quiero crear una reunión para planificar una asamblea o sesión administrativa.

#### Criterios de aceptación

* Requiere permiso.
* Requiere título.
* Requiere tipo.
* Requiere modalidad.
* Requiere fecha/hora de inicio.
* Estado inicial `draft`.
* Tenant derivado del contexto.
* Auditoría `meeting.created`.

---

### US-002 — Definir agenda

Como MeetingManager, quiero agregar puntos de agenda a una reunión.

#### Criterios de aceptación

* Requiere permiso.
* La reunión pertenece al tenant.
* Cada punto tiene orden.
* Cada punto tiene título.
* No permite agenda en reunión archivada.
* Auditoría `meetingAgenda.updated`.

---

### US-003 — Convocar participantes

Como TenantAdmin, quiero convocar propietarios, residentes o usuarios específicos.

#### Criterios de aceptación

* Requiere permiso.
* Participantes pertenecen al tenant.
* Audiencia válida.
* No permite referencias cross-tenant.
* Puede emitir evento de notificación.
* Auditoría `meeting.called`.

---

### US-004 — Consultar reuniones administrativas

Como administrador, quiero listar reuniones del tenant con filtros.

#### Criterios de aceptación

* Requiere permiso.
* Filtra por tipo, estado, modalidad, fecha.
* Pagina resultados.
* No mezcla tenants.

---

### US-005 — Consultar mis reuniones

Como propietario o residente, quiero ver reuniones dirigidas a mí o a mis unidades.

#### Criterios de aceptación

* Requiere autenticación.
* Requiere permiso own.
* Valida relación con usuario/persona/unidad.
* No muestra reuniones ajenas.
* No muestra reuniones administrativas privadas no dirigidas.

---

### US-006 — Registrar asistencia administrativa

Como MeetingManager, quiero registrar asistencia de participantes.

#### Criterios de aceptación

* Requiere permiso.
* Reunión en estado válido.
* Participante válido.
* No duplica asistencia.
* Registra método `admin`.
* Auditoría `meetingAttendance.registered`.

---

### US-007 — Marcar ausencia

Como MeetingManager, quiero marcar participantes ausentes.

#### Criterios de aceptación

* Requiere permiso.
* Participante válido.
* Estado `absent`.
* No duplica asistencia.
* Auditoría.

---

### US-008 — Registrar representación

Como TenantAdmin, quiero registrar que una persona o unidad será representada por otra.

#### Criterios de aceptación

* Requiere permiso.
* Representado pertenece al tenant.
* Representante pertenece al tenant.
* Estado inicial `submitted` o `approved` según permiso.
* Auditoría `meetingProxy.created`.

---

### US-009 — Aprobar representación

Como TenantAdmin, quiero aprobar una representación básica.

#### Criterios de aceptación

* Requiere permiso.
* Proxy en estado `submitted`.
* Registra `approvedBy` y `approvedAt`.
* Auditoría `meetingProxy.approved`.

---

### US-010 — Calcular quórum

Como MeetingManager, quiero calcular el quórum de una reunión.

#### Criterios de aceptación

* Requiere permiso.
* Usa regla configurada.
* Usa asistencia activa.
* Registra resultado.
* No modifica asistencia.
* Auditoría `meeting.quorumCalculated`.

---

### US-011 — Cerrar asistencia

Como MeetingManager, quiero cerrar el registro de asistencia.

#### Criterios de aceptación

* Requiere permiso.
* Reunión en estado válido.
* Registra `attendanceClosedAt`.
* Cambia estado a `attendanceClosed`.
* Bloquea cambios ordinarios posteriores.
* Auditoría `meeting.attendanceClosed`.

---

### US-012 — Registrar acta preliminar

Como MeetingManager, quiero registrar el acta preliminar de la reunión.

#### Criterios de aceptación

* Requiere permiso.
* Reunión existe.
* Acta en estado `draft`.
* Body obligatorio.
* Auditoría `meetingMinutes.created`.

---

### US-013 — Publicar acta

Como TenantAdmin, quiero publicar el acta aprobada para participantes autorizados.

#### Criterios de aceptación

* Requiere permiso.
* Acta debe estar aprobada o en estado publicable.
* Registra `publishedAt`.
* Emite evento de notificación si aplica.
* Auditoría `meetingMinutes.published`.

---

### US-014 — Registrar resolución básica

Como MeetingManager, quiero registrar una resolución básica tratada en reunión.

#### Criterios de aceptación

* Requiere permiso.
* Reunión válida.
* Título obligatorio.
* Descripción obligatoria.
* No ejecuta acción automática.
* No representa votación formal.
* Auditoría `meetingResolution.recorded`.

---

### US-015 — Cancelar reunión

Como TenantAdmin, quiero cancelar una reunión programada.

#### Criterios de aceptación

* Requiere permiso.
* Reunión en estado cancelable.
* Razón obligatoria.
* Emite evento de notificación si aplica.
* Auditoría `meeting.cancelled`.

---

## 16. Requisitos funcionales

### FR-001 — Crear reuniones

El sistema debe permitir crear reuniones por tenant.

---

### FR-002 — Editar reuniones

El sistema debe permitir editar reuniones en estados permitidos.

---

### FR-003 — Programar reunión

El sistema debe permitir pasar una reunión a estado `scheduled`.

---

### FR-004 — Convocar reunión

El sistema debe permitir registrar convocatoria y participantes.

---

### FR-005 — Cancelar reunión

El sistema debe permitir cancelar reuniones con razón.

---

### FR-006 — Iniciar reunión

El sistema debe permitir mover reunión a `inProgress`.

---

### FR-007 — Cerrar asistencia

El sistema debe permitir cerrar asistencia y bloquear cambios ordinarios.

---

### FR-008 — Completar reunión

El sistema debe permitir completar reunión.

---

### FR-009 — Archivar reunión

El sistema debe permitir archivar reunión sin eliminación física.

---

### FR-010 — Gestionar agenda

El sistema debe permitir crear, editar, ordenar, completar y archivar puntos de agenda.

---

### FR-011 — Gestionar participantes

El sistema debe permitir definir participantes esperados por usuario, persona, unidad, rol o grupo.

---

### FR-012 — Registrar asistencia

El sistema debe permitir registrar asistencia administrativa.

---

### FR-013 — Registrar ausencia

El sistema debe permitir registrar ausencia o excusa.

---

### FR-014 — Registrar asistencia tardía o salida anticipada

El sistema debe permitir marcar asistencia tardía y salida anticipada.

---

### FR-015 — Gestionar representación básica

El sistema debe permitir registrar, aprobar, rechazar y cancelar representaciones básicas.

---

### FR-016 — Calcular quórum básico

El sistema debe calcular quórum según regla configurada.

---

### FR-017 — Consultar reuniones administrativas

El sistema debe permitir listar reuniones administrativas con filtros.

---

### FR-018 — Consultar reuniones propias

El sistema debe permitir que usuarios consulten reuniones dirigidas a ellos o a sus unidades.

---

### FR-019 — Registrar acta preliminar

El sistema debe permitir crear y actualizar acta preliminar.

---

### FR-020 — Publicar acta

El sistema debe permitir publicar acta a audiencia autorizada.

---

### FR-021 — Registrar resoluciones básicas

El sistema debe permitir registrar resoluciones no vinculadas a votación formal.

---

### FR-022 — Emitir eventos de notificación

El sistema debe emitir eventos para `012-communications-notifications`.

---

### FR-023 — Auditar operaciones críticas

El sistema debe registrar auditoría de creación, convocatoria, asistencia, quórum, actas y cierre.

---

### FR-024 — Documentar API

El sistema debe documentar endpoints, DTOs, permisos, errores y filtros en OpenAPI.

---

## 17. Requisitos no funcionales

### NFR-001 — Seguridad

El módulo debe cumplir tenant isolation, autorización por permiso, autorización por recurso propio y minimización de datos.

---

### NFR-002 — Privacidad

La asistencia y participantes son datos privados. No deben exponerse a usuarios no autorizados.

---

### NFR-003 — Trazabilidad

Toda operación crítica debe ser auditable.

---

### NFR-004 — Consistencia

El estado de reunión y asistencia debe mantener transiciones controladas.

---

### NFR-005 — Performance

Objetivo MVP:

```text id="srv1ej"
p95 < 700 ms para listados paginados de reuniones y asistencia con filtros comunes.
```

---

### NFR-006 — Escalabilidad progresiva

El diseño debe permitir futuras votaciones, actas formales, firmas y notificaciones avanzadas.

---

### NFR-007 — API-first

Todas las funciones deben exponerse por REST API.

---

### NFR-008 — Observabilidad

El módulo debe emitir logs, métricas y auditoría sin exponer datos personales innecesarios.

---

### NFR-009 — Compatibilidad SDD

La implementación debe seguir los documentos SDD del proyecto.

---

## 18. Permisos iniciales

### 18.1. Meetings administrativas

```text id="j031cr"
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

### 18.2. Agenda

```text id="d2854m"
meetingAgenda.create
meetingAgenda.read
meetingAgenda.update
meetingAgenda.reorder
meetingAgenda.archive
```

---

### 18.3. Participantes

```text id="d02pul"
meetingParticipants.create
meetingParticipants.read
meetingParticipants.update
meetingParticipants.archive
```

---

### 18.4. Asistencia

```text id="ahsx9u"
meetingAttendance.create
meetingAttendance.read
meetingAttendance.update
meetingAttendance.close
meetingAttendance.override
meetingAttendance.read.own
meetingAttendance.create.own
```

---

### 18.5. Representaciones

```text id="s6g20w"
meetingProxies.create
meetingProxies.read
meetingProxies.approve
meetingProxies.reject
meetingProxies.cancel
meetingProxies.create.own
meetingProxies.read.own
```

---

### 18.6. Quórum

```text id="id04qw"
meetingQuorum.calculate
meetingQuorum.read
```

---

### 18.7. Actas

```text id="pj91fu"
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

### 18.8. Resoluciones

```text id="kcjxq2"
meetingResolutions.create
meetingResolutions.read
meetingResolutions.update
meetingResolutions.approve
meetingResolutions.cancel
meetingResolutions.archive
meetingResolutions.read.own
```

---

### 18.9. Auditoría y reportes

```text id="n276zg"
meetings.audit.read
meetings.reports.read
```

---

## 19. Matriz de permisos resumida

| Acción                         | Permiso requerido                           |
| ------------------------------ | ------------------------------------------- |
| Crear reunión                  | `meetings.create`                           |
| Consultar reuniones admin      | `meetings.read`                             |
| Editar reunión                 | `meetings.update`                           |
| Programar reunión              | `meetings.schedule`                         |
| Convocar reunión               | `meetings.call`                             |
| Iniciar reunión                | `meetings.start`                            |
| Cancelar reunión               | `meetings.cancel`                           |
| Completar reunión              | `meetings.complete`                         |
| Archivar reunión               | `meetings.archive`                          |
| Crear agenda                   | `meetingAgenda.create`                      |
| Consultar agenda               | `meetingAgenda.read`                        |
| Actualizar agenda              | `meetingAgenda.update`                      |
| Gestionar participantes        | `meetingParticipants.create/update/archive` |
| Registrar asistencia admin     | `meetingAttendance.create`                  |
| Consultar asistencia admin     | `meetingAttendance.read`                    |
| Actualizar asistencia          | `meetingAttendance.update`                  |
| Cerrar asistencia              | `meetingAttendance.close`                   |
| Override de asistencia cerrada | `meetingAttendance.override`                |
| Consultar asistencia propia    | `meetingAttendance.read.own`                |
| Registrar asistencia propia    | `meetingAttendance.create.own`              |
| Crear representación           | `meetingProxies.create`                     |
| Aprobar representación         | `meetingProxies.approve`                    |
| Rechazar representación        | `meetingProxies.reject`                     |
| Calcular quórum                | `meetingQuorum.calculate`                   |
| Crear acta                     | `meetingMinutes.create`                     |
| Aprobar acta                   | `meetingMinutes.approve`                    |
| Publicar acta                  | `meetingMinutes.publish`                    |
| Consultar acta propia          | `meetingMinutes.read.own`                   |
| Registrar resolución           | `meetingResolutions.create`                 |
| Aprobar resolución             | `meetingResolutions.approve`                |
| Consultar auditoría            | `meetings.audit.read`                       |

---

## 20. API preliminar

### 20.1. Meetings — administrativo

```text id="g0p7hk"
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

---

### 20.2. Meeting Agenda

```text id="wa3p5i"
GET    /api/v1/tenant/meetings/{meetingId}/agenda
POST   /api/v1/tenant/meetings/{meetingId}/agenda
GET    /api/v1/tenant/meeting-agenda-items/{agendaItemId}
PATCH  /api/v1/tenant/meeting-agenda-items/{agendaItemId}
POST   /api/v1/tenant/meetings/{meetingId}/agenda/reorder
POST   /api/v1/tenant/meeting-agenda-items/{agendaItemId}/complete
POST   /api/v1/tenant/meeting-agenda-items/{agendaItemId}/skip
POST   /api/v1/tenant/meeting-agenda-items/{agendaItemId}/archive
```

---

### 20.3. Meeting Participants

```text id="iqqsl4"
GET    /api/v1/tenant/meetings/{meetingId}/participants
POST   /api/v1/tenant/meetings/{meetingId}/participants
PUT    /api/v1/tenant/meetings/{meetingId}/participants
GET    /api/v1/tenant/meeting-participants/{participantId}
PATCH  /api/v1/tenant/meeting-participants/{participantId}
POST   /api/v1/tenant/meeting-participants/{participantId}/archive
```

---

### 20.4. Meeting Attendance

```text id="ts4rah"
GET    /api/v1/tenant/meetings/{meetingId}/attendance
POST   /api/v1/tenant/meetings/{meetingId}/attendance
GET    /api/v1/tenant/meeting-attendance/{attendanceId}
PATCH  /api/v1/tenant/meeting-attendance/{attendanceId}
POST   /api/v1/tenant/meeting-attendance/{attendanceId}/check-out
POST   /api/v1/tenant/meeting-attendance/{attendanceId}/excuse
POST   /api/v1/tenant/meeting-attendance/{attendanceId}/archive
```

---

### 20.5. Meeting Proxies

```text id="posnd6"
GET    /api/v1/tenant/meetings/{meetingId}/proxies
POST   /api/v1/tenant/meetings/{meetingId}/proxies
GET    /api/v1/tenant/meeting-proxies/{proxyId}
POST   /api/v1/tenant/meeting-proxies/{proxyId}/approve
POST   /api/v1/tenant/meeting-proxies/{proxyId}/reject
POST   /api/v1/tenant/meeting-proxies/{proxyId}/cancel
POST   /api/v1/tenant/meeting-proxies/{proxyId}/archive
```

---

### 20.6. Meeting Minutes

```text id="xwtdhr"
GET    /api/v1/tenant/meetings/{meetingId}/minutes
POST   /api/v1/tenant/meetings/{meetingId}/minutes
GET    /api/v1/tenant/meeting-minutes/{minutesId}
PATCH  /api/v1/tenant/meeting-minutes/{minutesId}
POST   /api/v1/tenant/meeting-minutes/{minutesId}/submit-review
POST   /api/v1/tenant/meeting-minutes/{minutesId}/approve
POST   /api/v1/tenant/meeting-minutes/{minutesId}/publish
POST   /api/v1/tenant/meeting-minutes/{minutesId}/archive
```

---

### 20.7. Meeting Resolutions

```text id="qpq8r9"
GET    /api/v1/tenant/meetings/{meetingId}/resolutions
POST   /api/v1/tenant/meetings/{meetingId}/resolutions
GET    /api/v1/tenant/meeting-resolutions/{resolutionId}
PATCH  /api/v1/tenant/meeting-resolutions/{resolutionId}
POST   /api/v1/tenant/meeting-resolutions/{resolutionId}/approve
POST   /api/v1/tenant/meeting-resolutions/{resolutionId}/cancel
POST   /api/v1/tenant/meeting-resolutions/{resolutionId}/archive
```

---

### 20.8. Meetings propias

```text id="w4l0s8"
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

---

## 21. Datos públicos

### 21.1. Endpoints públicos

MVP no expone endpoints públicos para reuniones.

Prohibido:

```text id="mxkkib"
GET /api/v1/public/tenants/{slug}/meetings
GET /api/v1/public/tenants/{slug}/meetings/{meetingId}
GET /api/v1/public/tenants/{slug}/meetings/{meetingId}/attendance
GET /api/v1/public/tenants/{slug}/meetings/{meetingId}/minutes
GET /api/v1/public/tenants/{slug}/meetings/{meetingId}/resolutions
```

---

### 21.2. Justificación

Las reuniones pueden contener:

```text id="h93syi"
datos personales
agenda interna
asistencia
representaciones
actas
resoluciones
información financiera
información sancionatoria
información operativa
```

Por tanto, no deben exponerse públicamente sin spec adicional.

---

## 22. Integración con otros módulos

### 22.1. Residents and Properties

Se usa para validar:

```text id="rs8mqr"
personId
propertyUnitId
owner relationship
resident relationship
lease relationship
```

---

### 22.2. Users and Roles

Se usa para validar:

```text id="lzdkzx"
userId
roleId
tenant membership
permissions
boardMembers
committeeMembers
```

---

### 22.3. Communications and Notifications

Eventos sugeridos:

```text id="xgmif6"
meeting.created
meeting.scheduled
meeting.called
meeting.updated
meeting.cancelled
meeting.reminderRequested
meeting.attendanceClosed
meeting.completed
meetingMinutes.published
```

Notificaciones sugeridas:

```text id="w27abf"
Nueva reunión convocada.
Su reunión fue actualizada.
La reunión fue cancelada.
El acta de la reunión está disponible.
```

---

### 22.4. Audit

Debe auditar:

```text id="wrsiin"
meeting.created
meeting.updated
meeting.scheduled
meeting.called
meeting.started
meeting.cancelled
meeting.attendanceClosed
meeting.completed
meeting.archived
meetingAgenda.created
meetingAgenda.updated
meetingParticipants.updated
meetingAttendance.registered
meetingAttendance.updated
meetingProxy.created
meetingProxy.approved
meetingProxy.rejected
meeting.quorumCalculated
meetingMinutes.created
meetingMinutes.updated
meetingMinutes.approved
meetingMinutes.published
meetingResolution.recorded
meetingResolution.approved
```

---

### 22.5. Fines

MVP no genera multas automáticas por inasistencia.

Futuro:

```text id="y717zg"
meeting absence -> possible fine
```

requiere spec separada.

---

### 22.6. Basic Reports

El módulo puede alimentar reportes:

```text id="ntezjc"
reuniones por periodo
asistencia por reunión
asistencia por unidad
quórum logrado/no logrado
actas publicadas
resoluciones registradas
```

---

## 23. Auditoría

Eventos mínimos:

```text id="vizsrv"
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

```text id="awbw2k"
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

```text id="w9pgjf"
payload completo
body completo del acta si contiene datos privados
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

## 24. Seguridad

### 24.1. Riesgos principales

| Riesgo                                           | Impacto      |
| ------------------------------------------------ | ------------ |
| Reunión cross-tenant                             | Crítico      |
| Asistencia cross-tenant                          | Crítico      |
| Usuario ve reunión ajena                         | Alto         |
| Usuario ve asistencia de terceros                | Alto         |
| Participante de otro tenant                      | Alto         |
| Representación de otro tenant                    | Alto         |
| Acta con datos privados expuesta                 | Alto         |
| Reunión expuesta públicamente                    | Crítico      |
| Quórum calculado con datos incorrectos           | Medio / Alto |
| Asistencia duplicada                             | Medio        |
| Modificación de asistencia cerrada sin auditoría | Alto         |
| Inyección en acta o agenda                       | Alto         |
| Notificación a audiencia incorrecta              | Alto         |
| Logs con datos personales                        | Alto         |

---

### 24.2. Controles

```text id="pexp01"
tenant isolation
permission guards
own-resource authorization
meeting audience validation
participant tenant validation
person/propertyUnit validation
state machine
attendance uniqueness
proxy validation
quorum deterministic calculation
closed attendance lock
content sanitization
safe DTOs
no public endpoints
audit events
safe logs
safe metrics
OpenAPI negative tests
```

---

## 25. Observabilidad

Logs sugeridos:

```text id="fnpag2"
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

Métricas sugeridas:

```text id="so2hk3"
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

```text id="mfzuar"
meetingType
meetingStatus
modality
attendanceStatus
quorumMet
outcome
```

Labels prohibidos:

```text id="dqflg0"
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

## 26. Testing

### 26.1. Unit tests

Probar:

* entidades de reunión;
* agenda;
* participantes;
* asistencia;
* proxies;
* actas;
* resoluciones;
* estados;
* quórum;
* validación de audiencia;
* reglas de asistencia;
* reglas de representación;
* sanitización.

---

### 26.2. Integration tests

Probar:

* creación de reunión;
* agenda;
* convocatoria;
* participantes;
* asistencia;
* representación;
* quórum;
* acta;
* resolución;
* auditoría;
* notificación por evento;
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

```text id="p4j4qq"
tenant A no ve meetings tenant B
tenant A no usa participants tenant B
tenant A no registra attendance tenant B
tenant A no usa personId tenant B
tenant A no usa propertyUnitId tenant B
tenant A no usa userId tenant B
tenant A no usa proxy tenant B
tenant A no ve minutes tenant B
tenant A no ve resolutions tenant B
```

---

### 26.5. Own-resource tests

Probar:

```text id="g6sqge"
usuario ve reunión allTenantUsers
owner ve reunión owners
resident ve reunión residents
usuario ve reunión por propertyUnit propia
usuario no ve reunión de propertyUnit ajena
usuario no ve asistencia de terceros
usuario no registra asistencia ajena
usuario no crea proxy ajeno
```

---

### 26.6. Security tests

Probar:

* no endpoints públicos de reuniones;
* no exposición de asistencia pública;
* no exposición de actas públicas;
* no modificación de asistencia cerrada sin permiso;
* no representación cross-tenant;
* no logs con body completo de acta;
* no payloads con tokens;
* no scripts en actas;
* OpenAPI no documenta rutas públicas prohibidas.

---

## 27. Criterios de aceptación globales

La spec se considera implementada si:

* se pueden crear reuniones;
* se pueden editar reuniones en estados permitidos;
* se pueden programar reuniones;
* se pueden convocar reuniones;
* se pueden cancelar reuniones;
* se pueden iniciar reuniones;
* se puede cerrar asistencia;
* se puede completar reunión;
* se puede archivar reunión;
* se puede gestionar agenda;
* se puede gestionar participantes;
* se puede registrar asistencia administrativa;
* se puede registrar ausencia;
* se puede registrar asistencia tardía;
* se puede registrar salida anticipada;
* se puede gestionar representación básica;
* se puede calcular quórum;
* se pueden consultar reuniones administrativas;
* se pueden consultar reuniones propias;
* se puede registrar acta preliminar;
* se puede publicar acta a audiencia autorizada;
* se pueden registrar resoluciones básicas;
* se emiten eventos para notificaciones;
* se auditan operaciones críticas;
* no hay endpoints públicos de reuniones;
* no se expone asistencia a usuarios no autorizados;
* no se exponen actas privadas;
* no se permite cross-tenant;
* no se permite asistencia duplicada;
* no se permite modificar asistencia cerrada sin permiso elevado;
* OpenAPI está actualizado;
* pruebas unitarias pasan;
* pruebas de integración pasan;
* pruebas API pasan;
* pruebas multitenant pasan;
* pruebas de seguridad pasan;
* CI pasa.

---

## 28. Casos borde

| Caso                                                | Resultado esperado           |
| --------------------------------------------------- | ---------------------------- |
| Crear reunión sin título                            | 422                          |
| Crear reunión sin fecha de inicio                   | 422                          |
| Crear reunión con fecha final antes de inicio       | 422                          |
| Crear reunión con tenantId en body                  | 422                          |
| Editar reunión completada                           | 409                          |
| Programar reunión archivada                         | 409                          |
| Convocar reunión sin participantes                  | 422 según política           |
| Participante de otro tenant                         | 403                          |
| Usuario de otro tenant como participante            | 403                          |
| Unidad de otro tenant como participante             | 403                          |
| Persona de otro tenant como participante            | 403                          |
| Registrar asistencia en reunión cancelada           | 409                          |
| Registrar asistencia duplicada                      | 409                          |
| Registrar asistencia de unidad ajena desde `/me`    | 403/404                      |
| Registrar asistencia represented sin proxy aprobado | 422                          |
| Aprobar proxy de otro tenant                        | 403                          |
| Calcular quórum sin regla                           | resultado `none`             |
| Calcular quórum sin participantes                   | 422 o quorum false           |
| Cerrar asistencia dos veces                         | 409 o idempotente controlado |
| Modificar asistencia cerrada sin override           | 409                          |
| Publicar acta sin permiso                           | 403                          |
| Ver acta ajena desde `/me`                          | 403/404                      |
| Endpoint público de reuniones                       | no existe                    |
| Acta con script                                     | sanitizado/rechazado         |
| OpenAPI documenta reunión pública                   | falla                        |

---

## 29. Dependencias hacia specs futuras

Este módulo habilita:

```text id="rd0a7q"
014-voting-basic
00X-electronic-signatures
00X-certified-minutes
00X-meeting-documents
00X-meeting-qr-attendance
00X-meeting-video-integration
00X-ai-assisted-minutes
00X-advanced-quorum-rules
00X-meeting-absence-fines
00X-assembly-legal-workflow
```

---

## 30. Archivos derivados esperados

```text id="b5fbal"
docs/specs/013-meetings-attendance/
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

1. ¿El MVP permitirá self check-in o solo registro administrativo?
2. ¿El tenant podrá configurar reglas de quórum por tipo de reunión?
3. ¿El quórum se calculará por unidades, personas o participantes esperados?
4. ¿Se requiere soporte de primera y segunda convocatoria?
5. ¿Las representaciones requieren documento adjunto en MVP?
6. ¿Quién puede aprobar representaciones?
7. ¿Se publicarán actas a propietarios, residentes o solo administradores?
8. ¿Las actas podrán contener adjuntos?
9. ¿Se permitirán resoluciones sin acta aprobada?
10. ¿Se enviarán recordatorios automáticos antes de la reunión?
11. ¿Se generarán notificaciones al cerrar asistencia?
12. ¿Se permitirá editar asistencia después del cierre con override?
13. ¿Qué roles pueden consultar asistencia completa?
14. ¿Qué datos de asistencia puede ver un residente?
15. ¿Se manejarán reuniones virtuales con enlace externo?
16. ¿Se permitirá reunión híbrida en MVP?
17. ¿Se requiere registro de salida anticipada en MVP?
18. ¿Se permitirán asistentes externos?
19. ¿Las inasistencias generarán reportes?
20. ¿Las inasistencias podrían generar multas en una spec futura?

---

## 32. Decisión inicial para MVP

Para MVP se recomienda:

```text id="vu4rxh"
- Crear reuniones.
- Editar reuniones en estados permitidos.
- Programar reuniones.
- Convocar reuniones.
- Gestionar agenda básica.
- Gestionar participantes básicos.
- Registrar asistencia administrativa.
- Registrar ausencia.
- Registrar asistencia tardía.
- Registrar salida anticipada.
- Gestionar representación básica.
- Calcular quórum simple.
- Cerrar asistencia.
- Completar reunión.
- Registrar acta preliminar.
- Publicar acta a usuarios autorizados.
- Registrar resoluciones básicas.
- Consultar reuniones administrativas.
- Consultar reuniones propias.
- Emitir eventos para notificaciones.
- Auditar operaciones críticas.
- No implementar votación electrónica.
- No implementar firma electrónica.
- No implementar actas PDF formales.
- No implementar QR real.
- No implementar IA con datos reales.
- No exponer reuniones en WordPress público.
```

---

## 33. Conclusión

El módulo `013-meetings-attendance` incorpora la gestión formal básica de reuniones, asambleas y asistencia dentro de RESIDENT Core.

Debe implementarse como un módulo:

```text id="sm862t"
tenant-scoped
permissioned
audience-aware
own-resource protected
state-controlled
attendance-aware
quorum-aware
audit-heavy
privacy-preserving
notification-ready
future-voting-ready
```

No debe aceptarse una implementación que permita reuniones cross-tenant, participantes de otro tenant, asistencia duplicada, acceso a reuniones ajenas, exposición pública de reuniones, modificación de asistencia cerrada sin permiso, representaciones sin validación, cálculo de quórum sin trazabilidad, actas con contenido inseguro, logs con datos personales, omisión de auditoría o mezcla de esta funcionalidad con votación electrónica formal, multas automáticas, firma electrónica o IA con datos reales.
