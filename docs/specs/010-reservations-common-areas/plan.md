# Plan — Spec 010 Reservations and Common Areas

## 1. Información del documento

| Campo                 | Valor                                                                                                                                                                   |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto              | RESIDENT Core                                                                                                                                                           |
| Spec ID               | 010                                                                                                                                                                     |
| Módulo                | Reservations and Common Areas                                                                                                                                           |
| Documento             | Implementation Plan                                                                                                                                                     |
| Ruta                  | `docs/specs/010-reservations-common-areas/plan.md`                                                                                                                      |
| Versión               | 0.1                                                                                                                                                                     |
| Estado                | Borrador inicial                                                                                                                                                        |
| Fecha                 | 2026-07-18                                                                                                                                                              |
| Documento base        | `docs/specs/010-reservations-common-areas/spec.md`                                                                                                                      |
| Depende de            | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements`, `007-audit`, `009-wordpress-integration-basic` |
| Arquitectura          | Monolito modular NestJS                                                                                                                                                 |
| Base de datos         | PostgreSQL + Prisma                                                                                                                                                     |
| API Style             | REST                                                                                                                                                                    |
| Naturaleza del módulo | Transaccional / Tenant-scoped / Auditable                                                                                                                               |
| Prioridad             | Alta                                                                                                                                                                    |

---

## 2. Propósito

Este documento transforma la especificación funcional `010-reservations-common-areas/spec.md` en un plan técnico de implementación.

El módulo `Reservations and Common Areas` debe permitir administrar áreas comunales, disponibilidad, bloqueos, reservas, aprobación, cancelación, cierre y generación opcional de cargos asociados.

Regla central:

```text id="ivkssw"
Toda reserva debe pertenecer a un tenant, asociarse a un área comunal, respetar disponibilidad, evitar solapamientos, mantener estado controlado y dejar trazabilidad auditable.
```

---

## 3. Resumen de implementación

El módulo se implementará dentro de RESIDENT Core como módulo funcional independiente, pero integrado con:

* tenants;
* usuarios, roles y permisos;
* residentes y unidades;
* cargos financieros;
* pagos;
* estados de cuenta;
* auditoría;
* integración pública WordPress.

Nombre técnico recomendado:

```text id="cq2smj"
reservations
```

Ruta recomendada:

```text id="ybzxyc"
apps/api/src/modules/reservations/
```

Componentes principales:

```text id="jb0a7u"
ReservationsModule
CommonAreasController
CommonAreaAvailabilityController
CommonAreaBlackoutsController
ReservationsController
MyReservationsController
CommonAreaCalendarController
PublicCommonAreasAdapter
CommonAreaService
ReservationService
ReservationAvailabilityService
ReservationConflictService
ReservationStateMachineService
ReservationChargeService
ReservationPolicyService
ReservationAuditService
```

Naturaleza del módulo:

```text id="w77akp"
tenant-scoped
permissioned
calendar-aware
conflict-safe
stateful
financially integrable
auditable
public-safe only for WordPress catalog
```

---

## 4. Decisiones técnicas aplicables

El módulo debe cumplir con:

```text id="b7f3yl"
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
* toda tabla debe incluir `tenant_id`;
* toda reserva debe asociarse a `common_area_id`;
* toda reserva propia debe asociarse a `property_unit_id`;
* no se permite doble reserva;
* las operaciones de creación/aprobación deben ser transaccionales;
* montos deben usar Decimal;
* no usar float/double para dinero;
* pagos no se procesan desde reservas;
* cargos se generan a través del módulo financiero;
* no se elimina historial;
* toda transición relevante se audita;
* WordPress solo accede a catálogo público de áreas;
* no se implementan reservas públicas desde WordPress en esta spec.

---

## 5. Alcance técnico

### 5.1. Incluido

```text id="uh8pzr"
Common areas management
Common area availability windows
Common area blackouts
Reservation requests
Administrative reservations
Own reservations
Reservation approval
Reservation rejection
Reservation cancellation
Reservation completion
No-show marking
Conflict detection
Calendar query
Optional charge generation
Reservation status history
Audit integration
Public common area catalog support
REST API
OpenAPI
Unit tests
Integration tests
API tests
Authorization tests
Multitenancy tests
Financial regression tests
Security tests
```

---

### 5.2. Diferido

```text id="gu3tfp"
online payment
payment gateway
advanced deposits
automatic penalties
advanced pricing
smart locks
QR access
digital check-in/check-out
damage inspection
automatic fines
PDF contracts
electronic signature
WhatsApp/email automatic notifications
Google Calendar sync
recurring reservations
waitlist
guest management
advanced event management
services consumption
WordPress public reservation creation
Keycloak SSO from WordPress
```

---

## 6. Estructura de carpetas recomendada

```text id="d3yaed"
apps/api/src/modules/reservations/
├── reservations.module.ts
│
├── common-areas.controller.ts
├── common-area-availability.controller.ts
├── common-area-blackouts.controller.ts
├── reservations.controller.ts
├── my-reservations.controller.ts
├── common-area-calendar.controller.ts
│
├── application/
│   ├── use-cases/
│   │   ├── create-common-area.use-case.ts
│   │   ├── get-common-area.use-case.ts
│   │   ├── list-common-areas.use-case.ts
│   │   ├── update-common-area.use-case.ts
│   │   ├── activate-common-area.use-case.ts
│   │   ├── deactivate-common-area.use-case.ts
│   │   ├── mark-common-area-maintenance.use-case.ts
│   │   ├── archive-common-area.use-case.ts
│   │   ├── create-availability-window.use-case.ts
│   │   ├── update-availability-window.use-case.ts
│   │   ├── archive-availability-window.use-case.ts
│   │   ├── create-common-area-blackout.use-case.ts
│   │   ├── cancel-common-area-blackout.use-case.ts
│   │   ├── create-reservation.use-case.ts
│   │   ├── create-own-reservation.use-case.ts
│   │   ├── get-reservation.use-case.ts
│   │   ├── list-reservations.use-case.ts
│   │   ├── list-own-reservations.use-case.ts
│   │   ├── approve-reservation.use-case.ts
│   │   ├── reject-reservation.use-case.ts
│   │   ├── cancel-reservation.use-case.ts
│   │   ├── cancel-own-reservation.use-case.ts
│   │   ├── complete-reservation.use-case.ts
│   │   ├── mark-reservation-no-show.use-case.ts
│   │   ├── generate-reservation-charge.use-case.ts
│   │   ├── get-common-area-calendar.use-case.ts
│   │   └── get-own-common-area-calendar.use-case.ts
│   │
│   ├── services/
│   │   ├── common-area.service.ts
│   │   ├── common-area-availability.service.ts
│   │   ├── common-area-blackout.service.ts
│   │   ├── reservation.service.ts
│   │   ├── reservation-availability.service.ts
│   │   ├── reservation-conflict.service.ts
│   │   ├── reservation-state-machine.service.ts
│   │   ├── reservation-policy.service.ts
│   │   ├── reservation-charge.service.ts
│   │   ├── reservation-calendar.service.ts
│   │   ├── reservation-money.service.ts
│   │   ├── reservation-ownership.service.ts
│   │   └── reservation-audit.service.ts
│   │
│   └── ports/
│       ├── common-area-reader.port.ts
│       ├── common-area-writer.port.ts
│       ├── availability-reader.port.ts
│       ├── availability-writer.port.ts
│       ├── blackout-reader.port.ts
│       ├── blackout-writer.port.ts
│       ├── reservation-reader.port.ts
│       ├── reservation-writer.port.ts
│       ├── reservation-charge.port.ts
│       ├── reservation-property-unit.port.ts
│       ├── reservation-audit.port.ts
│       └── public-common-area-reader.port.ts
│
├── domain/
│   ├── entities/
│   │   ├── common-area.entity.ts
│   │   ├── common-area-availability-window.entity.ts
│   │   ├── common-area-blackout.entity.ts
│   │   ├── reservation.entity.ts
│   │   └── reservation-status-history.entity.ts
│   │
│   ├── value-objects/
│   │   ├── common-area-code.vo.ts
│   │   ├── common-area-status.vo.ts
│   │   ├── common-area-type.vo.ts
│   │   ├── reservation-status.vo.ts
│   │   ├── reservation-time-range.vo.ts
│   │   ├── reservation-duration.vo.ts
│   │   ├── reservation-money.vo.ts
│   │   ├── reservation-purpose.vo.ts
│   │   ├── attendee-count.vo.ts
│   │   ├── day-of-week.vo.ts
│   │   └── time-of-day.vo.ts
│   │
│   ├── events/
│   │   ├── common-area-created.event.ts
│   │   ├── common-area-updated.event.ts
│   │   ├── common-area-archived.event.ts
│   │   ├── common-area-blackout-created.event.ts
│   │   ├── reservation-created.event.ts
│   │   ├── reservation-approved.event.ts
│   │   ├── reservation-rejected.event.ts
│   │   ├── reservation-cancelled.event.ts
│   │   ├── reservation-completed.event.ts
│   │   ├── reservation-no-show.event.ts
│   │   ├── reservation-charge-generated.event.ts
│   │   └── reservation-conflict-detected.event.ts
│   │
│   └── errors/
│       ├── common-area-not-found.error.ts
│       ├── common-area-not-reservable.error.ts
│       ├── reservation-not-found.error.ts
│       ├── reservation-forbidden.error.ts
│       ├── reservation-conflict.error.ts
│       ├── reservation-blackout-conflict.error.ts
│       ├── reservation-outside-availability.error.ts
│       ├── reservation-invalid-transition.error.ts
│       ├── reservation-invalid-time-range.error.ts
│       ├── reservation-capacity-exceeded.error.ts
│       ├── reservation-cancellation-window-closed.error.ts
│       ├── reservation-charge-already-generated.error.ts
│       └── reservation-cross-tenant-reference.error.ts
│
├── infrastructure/
│   ├── persistence/
│   │   ├── prisma-common-area.repository.ts
│   │   ├── prisma-availability.repository.ts
│   │   ├── prisma-blackout.repository.ts
│   │   ├── prisma-reservation.repository.ts
│   │   └── reservations.mapper.ts
│   │
│   ├── financial/
│   │   └── reservation-charge.adapter.ts
│   │
│   ├── public/
│   │   └── public-common-area.adapter.ts
│   │
│   └── audit/
│       └── reservation-audit.adapter.ts
│
├── policies/
│   ├── common-area-permission.guard.ts
│   ├── reservation-permission.guard.ts
│   ├── own-reservation.guard.ts
│   ├── reservation-financial.guard.ts
│   └── public-common-area-policy.service.ts
│
├── dto/
└── tests/
```

---

## 7. Documentación esperada

```text id="u470jt"
docs/specs/010-reservations-common-areas/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

Este documento corresponde a:

```text id="p732a6"
plan.md
```

---

# 8. Diseño de dominio

## 8.1. CommonArea

Responsabilidad:

* representar un área comunal;
* definir si es reservable;
* definir si es visible públicamente;
* definir reglas básicas de uso;
* definir tarifa si aplica;
* controlar estado operativo.

Campos conceptuales:

```text id="e3n8e5"
id
tenantId
code
slug
name
description
type
capacity
locationDescription
status
isReservable
isPublicVisible
requiresApproval
requiresPayment
feeAmount
feeCurrency
feeChargeConceptId
minimumDurationMinutes
maximumDurationMinutes
reservationAdvanceDays
cancellationLimitHours
publicRulesSummary
internalRules
coverImageUrl
galleryUrls
createdAt
updatedAt
archivedAt
```

Reglas:

* `tenantId` obligatorio;
* `code` único por tenant;
* `slug` único por tenant;
* `name` obligatorio;
* `capacity` debe ser positiva si existe;
* `feeAmount` debe ser Decimal;
* si `requiresPayment = true`, debe existir `feeAmount > 0` y `feeChargeConceptId`;
* si `isPublicVisible = true`, solo se expone información public-safe;
* áreas archivadas no reciben reservas nuevas.

---

## 8.2. CommonAreaAvailabilityWindow

Responsabilidad:

* definir ventanas recurrentes simples de disponibilidad por día de semana;
* permitir validar si una reserva cae dentro de horario permitido.

Campos:

```text id="l8v578"
id
tenantId
commonAreaId
dayOfWeek
startTime
endTime
isActive
validFrom
validTo
createdAt
updatedAt
archivedAt
```

Reglas:

* `startTime < endTime`;
* `dayOfWeek` debe estar entre lunes y domingo;
* una ventana archivada no se considera disponible;
* si `validFrom` y `validTo` existen, la fecha de reserva debe estar dentro del rango.

---

## 8.3. CommonAreaBlackout

Responsabilidad:

* bloquear disponibilidad por mantenimiento, evento interno o restricción administrativa.

Campos:

```text id="tvxffo"
id
tenantId
commonAreaId
startAt
endAt
reason
status
createdBy
createdAt
updatedAt
archivedAt
```

Reglas:

* `startAt < endAt`;
* `reason` obligatorio;
* estado activo bloquea reservas;
* blackout cancelado no bloquea;
* blackout archivado no bloquea;
* no elimina reservas existentes automáticamente.

---

## 8.4. Reservation

Responsabilidad:

* representar una solicitud o asignación de uso de área comunal;
* controlar estado;
* vincular unidad, solicitante, área, rango horario y cargo asociado.

Campos:

```text id="rrzxy4"
id
tenantId
commonAreaId
propertyUnitId
requesterUserId
requesterPersonId
startAt
endAt
status
purpose
attendeeCount
requiresApproval
requiresPayment
feeAmount
feeCurrency
chargeId
paymentStatusSnapshot
approvedBy
approvedAt
rejectedBy
rejectedAt
rejectionReason
cancelledBy
cancelledAt
cancellationReason
closedBy
closedAt
notes
createdAt
updatedAt
archivedAt
```

Reglas:

* `tenantId`, `commonAreaId`, `startAt`, `endAt`, `status` obligatorios;
* `startAt < endAt`;
* `propertyUnitId` requerido para reservas propias;
* `requesterUserId` requerido cuando la reserva la solicita un usuario;
* `requesterPersonId` recomendado cuando exista vínculo persona;
* `feeAmount` debe ser Decimal;
* `chargeId` se asigna solo si se genera cargo;
* no se elimina físicamente;
* toda transición relevante se registra.

---

## 8.5. ReservationStatusHistory

Responsabilidad:

* mantener historial de transiciones de estado.

Campos:

```text id="u3lmzn"
id
tenantId
reservationId
fromStatus
toStatus
actorUserId
reason
occurredAt
metadata
```

Reglas:

* se crea en cada transición;
* metadata debe ser sanitizada;
* no reemplaza auditoría global;
* complementa trazabilidad funcional interna.

---

# 9. Value Objects

## 9.1. CommonAreaCode

Responsabilidad:

* validar código legible del área;
* garantizar unicidad por tenant.

Ejemplos:

```text id="n5az0z"
SALON-COMUNAL
CANCHA-01
BBQ-01
```

---

## 9.2. CommonAreaStatus

Valores:

```text id="kwdl47"
active
inactive
maintenance
archived
```

---

## 9.3. CommonAreaType

Valores iniciales sugeridos:

```text id="uyc0np"
hall
court
bbq
pool
terrace
park
gym
meetingRoom
other
```

---

## 9.4. ReservationStatus

Valores:

```text id="iin96z"
draft
requested
pendingApproval
approved
rejected
cancelled
completed
noShow
expired
archived
```

---

## 9.5. ReservationTimeRange

Responsabilidad:

* validar `startAt`;
* validar `endAt`;
* garantizar `startAt < endAt`;
* operar en UTC internamente;
* respetar zona horaria del tenant para reglas de negocio.

---

## 9.6. ReservationDuration

Responsabilidad:

* calcular duración en minutos;
* validar mínimo;
* validar máximo.

---

## 9.7. ReservationMoney

Responsabilidad:

* manejar tarifas;
* usar Decimal;
* exponer string;
* impedir float/double.

---

## 9.8. ReservationPurpose

Responsabilidad:

* validar propósito;
* limitar longitud;
* prevenir contenido peligroso;
* evitar payloads extensos.

---

## 9.9. AttendeeCount

Responsabilidad:

* validar número de asistentes;
* impedir valores negativos;
* validar contra capacidad del área.

---

## 9.10. DayOfWeek

Responsabilidad:

* representar día de semana para disponibilidad recurrente.

Valores sugeridos:

```text id="lsudfq"
monday
tuesday
wednesday
thursday
friday
saturday
sunday
```

---

## 9.11. TimeOfDay

Responsabilidad:

* validar hora local;
* representar `HH:mm`;
* validar que `startTime < endTime`.

---

# 10. Modelo de datos y persistencia

## 10.1. Tablas nuevas

```text id="n9kgl7"
common_areas
common_area_availability_windows
common_area_blackouts
reservations
reservation_status_history
```

---

## 10.2. Relaciones principales

```text id="bp2mxp"
tenants 1 ── * common_areas
common_areas 1 ── * common_area_availability_windows
common_areas 1 ── * common_area_blackouts
common_areas 1 ── * reservations
property_units 1 ── * reservations
user_profiles 1 ── * reservations
persons 1 ── * reservations
charges 0..1 ── 1 reservations
reservations 1 ── * reservation_status_history
```

---

## 10.3. Estrategia multitenant

Todas las tablas deben incluir:

```text id="e1bbvz"
tenant_id
```

Toda consulta debe filtrar:

```text id="a26z9g"
WHERE tenant_id = currentTenant.id
```

Regla:

```text id="f7938c"
Ninguna reserva, área, blackout, availability window o status history puede cruzar tenants.
```

---

## 10.4. Estrategia de concurrencia

El problema crítico del módulo es evitar doble reserva.

Estrategia recomendada para MVP:

```text id="wniwy8"
1. Ejecutar creación/aprobación dentro de transacción.
2. Consultar conflictos dentro de la misma transacción.
3. Bloquear filas relevantes del área o usar advisory lock por commonAreaId.
4. Insertar reserva solo si no hay solapamiento.
5. Revalidar conflictos al aprobar.
```

Estrategia futura más robusta:

```text id="kxkuvt"
PostgreSQL exclusion constraint con tstzrange usando GiST
```

La decisión final debe detallarse en `data-model.md`.

---

## 10.5. Estados que bloquean disponibilidad

```text id="oxvq09"
requested
pendingApproval
approved
```

Estados que no bloquean disponibilidad:

```text id="fnoza1"
rejected
cancelled
completed
noShow
expired
archived
```

---

## 10.6. Índices recomendados

```text id="dzmz2a"
common_areas:
- tenant_id
- tenant_id + code
- tenant_id + slug
- tenant_id + status
- tenant_id + is_reservable
- tenant_id + is_public_visible

common_area_availability_windows:
- tenant_id
- tenant_id + common_area_id
- tenant_id + common_area_id + day_of_week
- tenant_id + common_area_id + is_active

common_area_blackouts:
- tenant_id
- tenant_id + common_area_id
- tenant_id + common_area_id + status
- tenant_id + common_area_id + start_at + end_at

reservations:
- tenant_id
- tenant_id + common_area_id
- tenant_id + property_unit_id
- tenant_id + requester_user_id
- tenant_id + status
- tenant_id + start_at
- tenant_id + end_at
- tenant_id + common_area_id + start_at + end_at
- tenant_id + charge_id

reservation_status_history:
- tenant_id
- tenant_id + reservation_id
- tenant_id + actor_user_id
- tenant_id + occurred_at
```

---

# 11. Puertos de aplicación

## 11.1. CommonAreaReaderPort

Contrato conceptual:

```text id="ak1yw6"
findById(tenantId, commonAreaId)
findBySlug(tenantId, slug)
list(tenantId, filters, pagination)
findPublicBySlug(tenantSlug, commonAreaSlug)
```

---

## 11.2. CommonAreaWriterPort

Contrato:

```text id="g1zk0a"
create(tenantId, input, actor)
update(tenantId, commonAreaId, input, actor)
activate(tenantId, commonAreaId, actor)
deactivate(tenantId, commonAreaId, actor)
markMaintenance(tenantId, commonAreaId, actor)
archive(tenantId, commonAreaId, actor)
```

---

## 11.3. AvailabilityReaderPort

Contrato:

```text id="z805x5"
listByCommonArea(tenantId, commonAreaId)
findActiveWindowsForDate(tenantId, commonAreaId, date)
```

---

## 11.4. AvailabilityWriterPort

Contrato:

```text id="b1c1qy"
createWindow(tenantId, commonAreaId, input, actor)
updateWindow(tenantId, commonAreaId, windowId, input, actor)
archiveWindow(tenantId, commonAreaId, windowId, actor)
```

---

## 11.5. BlackoutReaderPort

Contrato:

```text id="tzp3xs"
listByCommonArea(tenantId, commonAreaId, filters)
findConflictingBlackouts(tenantId, commonAreaId, timeRange)
```

---

## 11.6. BlackoutWriterPort

Contrato:

```text id="f0ixsk"
createBlackout(tenantId, commonAreaId, input, actor)
cancelBlackout(tenantId, commonAreaId, blackoutId, actor, reason)
```

---

## 11.7. ReservationReaderPort

Contrato:

```text id="xqoxxp"
findById(tenantId, reservationId)
list(tenantId, filters, pagination)
listOwn(tenantId, actorUserId, filters, pagination)
findConflicts(tenantId, commonAreaId, timeRange, statuses)
findCalendarItems(tenantId, commonAreaId, dateRange)
```

---

## 11.8. ReservationWriterPort

Contrato:

```text id="n4hq7x"
create(tenantId, input, actor)
updateStatus(tenantId, reservationId, transition, actor)
attachCharge(tenantId, reservationId, chargeId, actor)
createStatusHistory(tenantId, reservationId, history)
```

---

## 11.9. ReservationChargePort

Contrato:

```text id="nys71l"
generateChargeForReservation(tenantId, reservationId, input, actor)
findChargeForReservation(tenantId, reservationId)
```

Este puerto delega en `004-dues-fees`.

---

## 11.10. ReservationPropertyUnitPort

Contrato:

```text id="s4ptm0"
userCanAccessPropertyUnit(tenantId, actorUserId, propertyUnitId)
findPropertyUnitsForUser(tenantId, actorUserId)
```

Este puerto usa `003-residents-properties`.

---

## 11.11. ReservationAuditPort

Contrato:

```text id="y5h9xq"
auditCommonAreaCreated(...)
auditCommonAreaUpdated(...)
auditReservationCreated(...)
auditReservationApproved(...)
auditReservationRejected(...)
auditReservationCancelled(...)
auditReservationChargeGenerated(...)
auditReservationConflictDetected(...)
```

---

## 11.12. PublicCommonAreaReaderPort

Contrato:

```text id="z355ls"
listPublicCommonAreas(tenantSlug, query)
getPublicCommonArea(tenantSlug, commonAreaSlug)
```

Este puerto se integra con `009-wordpress-integration-basic`.

---

# 12. Servicios de aplicación

## 12.1. CommonAreaService

Responsabilidades:

* crear áreas;
* actualizar áreas;
* activar/desactivar;
* marcar mantenimiento;
* archivar;
* validar tarifa;
* validar reglas public-safe;
* auditar cambios.

---

## 12.2. CommonAreaAvailabilityService

Responsabilidades:

* crear ventanas;
* actualizar ventanas;
* archivar ventanas;
* validar día de semana;
* validar horas;
* resolver disponibilidad por fecha.

---

## 12.3. CommonAreaBlackoutService

Responsabilidades:

* crear bloqueos;
* cancelar bloqueos;
* validar razón;
* validar rango;
* consultar bloqueos activos;
* auditar.

---

## 12.4. ReservationService

Responsabilidades:

* crear reservas;
* crear reservas propias;
* consultar reservas;
* ejecutar transiciones;
* coordinar validación de disponibilidad;
* coordinar validación de conflictos;
* coordinar generación de cargo;
* auditar eventos.

---

## 12.5. ReservationAvailabilityService

Responsabilidades:

* validar ventana de disponibilidad;
* validar duración mínima/máxima;
* validar anticipación máxima;
* validar bloqueo por mantenimiento.

---

## 12.6. ReservationConflictService

Responsabilidades:

* detectar solapamientos;
* evaluar estados bloqueantes;
* detectar conflictos con blackouts;
* soportar validación transaccional;
* registrar eventos de conflicto relevantes.

Regla técnica:

```text id="fit0z5"
new.startAt < existing.endAt AND new.endAt > existing.startAt
```

---

## 12.7. ReservationStateMachineService

Responsabilidades:

* validar transiciones;
* impedir cambios inválidos;
* registrar historial;
* proveer errores consistentes.

---

## 12.8. ReservationPolicyService

Responsabilidades:

* validar permisos de acción;
* validar cancelación propia;
* validar límite de cancelación;
* validar propiedad/residencia del solicitante;
* validar capacidad.

---

## 12.9. ReservationChargeService

Responsabilidades:

* determinar si una reserva requiere cargo;
* construir solicitud de cargo;
* llamar puerto financiero;
* garantizar idempotencia;
* adjuntar `chargeId`;
* no procesar pagos.

---

## 12.10. ReservationCalendarService

Responsabilidades:

* construir calendario por área;
* combinar reservas activas;
* combinar blackouts;
* combinar disponibilidad;
* minimizar datos personales según tipo de usuario;
* paginar o limitar rango de fechas.

---

## 12.11. ReservationMoneyService

Responsabilidades:

* manejar Decimal;
* exponer strings;
* validar `feeAmount`;
* impedir float.

---

## 12.12. ReservationOwnershipService

Responsabilidades:

* validar que un usuario puede actuar sobre una unidad;
* usar relaciones de `003-residents-properties`;
* bloquear reservas de unidad ajena.

---

## 12.13. ReservationAuditService

Responsabilidades:

* emitir eventos hacia `007-audit`;
* sanitizar metadata;
* evitar payloads completos;
* incluir traceId/correlationId.

---

# 13. Casos de uso

## 13.1. CreateCommonAreaUseCase

Endpoint:

```text id="grtwcq"
POST /api/v1/tenant/common-areas
```

Responsabilidades:

* validar permiso `commonAreas.create`;
* validar DTO;
* validar tarifa;
* crear área;
* auditar `commonArea.created`.

---

## 13.2. ListCommonAreasUseCase

Endpoint:

```text id="za0p0p"
GET /api/v1/tenant/common-areas
```

Responsabilidades:

* validar permiso `commonAreas.read`;
* filtrar por estado/tipo/isReservable/isPublicVisible;
* paginar;
* devolver DTO administrativo.

---

## 13.3. GetCommonAreaUseCase

Endpoint:

```text id="egxzuu"
GET /api/v1/tenant/common-areas/{commonAreaId}
```

Responsabilidades:

* validar permiso;
* filtrar por tenant;
* devolver detalle administrativo.

---

## 13.4. UpdateCommonAreaUseCase

Endpoint:

```text id="ws8bot"
PATCH /api/v1/tenant/common-areas/{commonAreaId}
```

Responsabilidades:

* validar permiso `commonAreas.update`;
* validar estado;
* validar tarifa;
* actualizar;
* auditar `commonArea.updated`.

---

## 13.5. ActivateCommonAreaUseCase

Endpoint:

```text id="vo62w7"
POST /api/v1/tenant/common-areas/{commonAreaId}/activate
```

Responsabilidades:

* cambiar estado a `active`;
* auditar.

---

## 13.6. DeactivateCommonAreaUseCase

Endpoint:

```text id="yv8ma5"
POST /api/v1/tenant/common-areas/{commonAreaId}/deactivate
```

Responsabilidades:

* cambiar estado a `inactive`;
* impedir nuevas reservas;
* no cancelar reservas existentes automáticamente;
* auditar.

---

## 13.7. MarkCommonAreaMaintenanceUseCase

Endpoint:

```text id="alumvg"
POST /api/v1/tenant/common-areas/{commonAreaId}/mark-maintenance
```

Responsabilidades:

* cambiar estado a `maintenance`;
* impedir nuevas reservas ordinarias;
* auditar.

---

## 13.8. ArchiveCommonAreaUseCase

Endpoint:

```text id="l2d6na"
POST /api/v1/tenant/common-areas/{commonAreaId}/archive
```

Responsabilidades:

* archivar área;
* impedir nuevas reservas;
* preservar historial;
* auditar.

---

## 13.9. CreateAvailabilityWindowUseCase

Endpoint:

```text id="nf1mg6"
POST /api/v1/tenant/common-areas/{commonAreaId}/availability-windows
```

Responsabilidades:

* validar permiso `commonAreas.manageAvailability`;
* validar área;
* validar día/hora;
* crear ventana;
* auditar.

---

## 13.10. UpdateAvailabilityWindowUseCase

Endpoint:

```text id="vesr5r"
PATCH /api/v1/tenant/common-areas/{commonAreaId}/availability-windows/{windowId}
```

Responsabilidades:

* validar ventana del tenant/área;
* actualizar;
* auditar.

---

## 13.11. ArchiveAvailabilityWindowUseCase

Endpoint:

```text id="y0wrae"
POST /api/v1/tenant/common-areas/{commonAreaId}/availability-windows/{windowId}/archive
```

Responsabilidades:

* archivar ventana;
* no modificar reservas existentes;
* auditar.

---

## 13.12. CreateCommonAreaBlackoutUseCase

Endpoint:

```text id="z6c7bt"
POST /api/v1/tenant/common-areas/{commonAreaId}/blackouts
```

Responsabilidades:

* validar permiso `commonAreas.manageBlackouts`;
* validar rango;
* validar razón;
* crear blackout;
* auditar.

---

## 13.13. CancelCommonAreaBlackoutUseCase

Endpoint:

```text id="t42uu8"
POST /api/v1/tenant/common-areas/{commonAreaId}/blackouts/{blackoutId}/cancel
```

Responsabilidades:

* cancelar blackout activo;
* requerir razón;
* auditar.

---

## 13.14. CreateReservationUseCase

Endpoint:

```text id="k3mew7"
POST /api/v1/tenant/reservations
```

Responsabilidades:

* validar permiso `reservations.create`;
* validar área activa/reservable;
* validar unidad del tenant;
* validar rango;
* validar disponibilidad;
* validar blackouts;
* validar conflictos;
* definir estado inicial;
* crear reserva;
* auditar.

---

## 13.15. CreateOwnReservationUseCase

Endpoint:

```text id="dvh6oz"
POST /api/v1/me/reservations
```

Responsabilidades:

* validar permiso `reservations.create.own`;
* validar que usuario puede usar `propertyUnitId`;
* validar reglas de reserva;
* validar disponibilidad y conflictos;
* crear reserva propia;
* auditar.

---

## 13.16. ApproveReservationUseCase

Endpoint:

```text id="gg7tlz"
POST /api/v1/tenant/reservations/{reservationId}/approve
```

Responsabilidades:

* validar permiso `reservations.approve`;
* validar estado aprobable;
* revalidar conflictos;
* aprobar;
* generar cargo si aplica;
* registrar historial;
* auditar.

---

## 13.17. RejectReservationUseCase

Endpoint:

```text id="tubrw8"
POST /api/v1/tenant/reservations/{reservationId}/reject
```

Responsabilidades:

* validar permiso `reservations.reject`;
* validar estado rechazable;
* requerir razón;
* registrar actor/fecha;
* auditar.

---

## 13.18. CancelReservationUseCase

Endpoint:

```text id="d9v7yx"
POST /api/v1/tenant/reservations/{reservationId}/cancel
```

Responsabilidades:

* validar permiso `reservations.cancel`;
* validar estado cancelable;
* requerir razón;
* no eliminar;
* no revertir cargo automáticamente en MVP;
* auditar.

---

## 13.19. CancelOwnReservationUseCase

Endpoint:

```text id="jvz7uq"
POST /api/v1/me/reservations/{reservationId}/cancel
```

Responsabilidades:

* validar permiso `reservations.cancel.own`;
* validar que reserva pertenece a unidad autorizada;
* validar límite de cancelación;
* cancelar;
* auditar.

---

## 13.20. CompleteReservationUseCase

Endpoint:

```text id="aw8swt"
POST /api/v1/tenant/reservations/{reservationId}/complete
```

Responsabilidades:

* validar permiso `reservations.complete`;
* validar estado `approved`;
* marcar como completed;
* auditar.

---

## 13.21. MarkReservationNoShowUseCase

Endpoint:

```text id="jhamab"
POST /api/v1/tenant/reservations/{reservationId}/mark-no-show
```

Responsabilidades:

* validar permiso `reservations.markNoShow`;
* validar estado `approved`;
* marcar como noShow;
* auditar.

---

## 13.22. GenerateReservationChargeUseCase

Endpoint:

```text id="qr0d5e"
POST /api/v1/tenant/reservations/{reservationId}/generate-charge
```

Responsabilidades:

* validar permiso `reservations.generateCharge`;
* validar que reserva requiere pago;
* validar concepto financiero;
* garantizar idempotencia;
* generar cargo vía `004-dues-fees`;
* adjuntar `chargeId`;
* auditar.

---

## 13.23. GetCommonAreaCalendarUseCase

Endpoint:

```text id="vpyxdk"
GET /api/v1/tenant/common-areas/{commonAreaId}/calendar
```

Responsabilidades:

* validar permiso `reservations.readCalendar`;
* validar rango de fechas;
* devolver reservas, blackouts y disponibilidad;
* incluir detalle administrativo permitido;
* evitar rangos excesivos.

---

## 13.24. GetOwnCommonAreaCalendarUseCase

Endpoint:

```text id="y1w3k0"
GET /api/v1/me/common-areas/{commonAreaId}/calendar
```

Responsabilidades:

* validar permiso `reservations.readCalendar.own`;
* devolver disponibilidad y ocupación mínima;
* no exponer solicitantes de otras reservas;
* no exponer propertyUnitId de terceros;
* no exponer datos personales.

---

# 14. Controladores REST

## 14.1. CommonAreasController

Ruta base:

```text id="ua1tuf"
/api/v1/tenant/common-areas
```

Endpoints:

```text id="ffah50"
GET /
POST /
GET /:commonAreaId
PATCH /:commonAreaId
POST /:commonAreaId/activate
POST /:commonAreaId/deactivate
POST /:commonAreaId/mark-maintenance
POST /:commonAreaId/archive
```

Guards:

```text id="akridu"
AuthGuard
TenantGuard
TenantPermissionGuard
CommonAreaPermissionGuard
```

---

## 14.2. CommonAreaAvailabilityController

Ruta base:

```text id="e5gpdl"
/api/v1/tenant/common-areas/:commonAreaId/availability-windows
```

Endpoints:

```text id="wgdxfv"
GET /
POST /
PATCH /:windowId
POST /:windowId/archive
```

---

## 14.3. CommonAreaBlackoutsController

Ruta base:

```text id="xmzarv"
/api/v1/tenant/common-areas/:commonAreaId/blackouts
```

Endpoints:

```text id="l2pp5a"
GET /
POST /
POST /:blackoutId/cancel
```

---

## 14.4. ReservationsController

Ruta base:

```text id="h2hh81"
/api/v1/tenant/reservations
```

Endpoints:

```text id="sqfk3v"
GET /
POST /
GET /:reservationId
POST /:reservationId/approve
POST /:reservationId/reject
POST /:reservationId/cancel
POST /:reservationId/complete
POST /:reservationId/mark-no-show
POST /:reservationId/generate-charge
```

---

## 14.5. MyReservationsController

Ruta base:

```text id="v1pslh"
/api/v1/me/reservations
```

Endpoints:

```text id="dbqd43"
GET /
POST /
GET /:reservationId
POST /:reservationId/cancel
```

---

## 14.6. CommonAreaCalendarController

Endpoints:

```text id="nyd9ec"
GET /api/v1/tenant/common-areas/:commonAreaId/calendar
GET /api/v1/me/common-areas/:commonAreaId/calendar
```

---

## 14.7. Public Common Areas

Los endpoints públicos se exponen desde `009-wordpress-integration-basic`, pero este módulo provee el reader funcional.

Rutas coordinadas:

```text id="s5q4rs"
GET /api/v1/public/tenants/{slug}/common-areas
GET /api/v1/public/tenants/{slug}/common-areas/{commonAreaSlug}
```

Regla:

```text id="t0cwrg"
010 define la fuente funcional de áreas; 009 controla la exposición pública.
```

---

# 15. DTOs principales

## 15.1. CreateCommonAreaDto

```json id="tthy2c"
{
  "code": "SALON-COMUNAL",
  "slug": "salon-comunal",
  "name": "Salón comunal",
  "description": "Espacio para eventos comunitarios.",
  "type": "hall",
  "capacity": 60,
  "locationDescription": "Planta baja junto a la administración",
  "isReservable": true,
  "isPublicVisible": true,
  "requiresApproval": true,
  "requiresPayment": true,
  "feeAmount": "25.00",
  "feeCurrency": "USD",
  "feeChargeConceptId": "charge_concept_uuid",
  "minimumDurationMinutes": 60,
  "maximumDurationMinutes": 240,
  "reservationAdvanceDays": 30,
  "cancellationLimitHours": 24,
  "publicRulesSummary": "Uso sujeto a reglamento interno.",
  "internalRules": "Reglas internas visibles solo para administración.",
  "coverImageUrl": "https://cdn.example.com/salon.jpg",
  "galleryUrls": []
}
```

---

## 15.2. CommonAreaDto

```json id="zwoars"
{
  "id": "common_area_uuid",
  "code": "SALON-COMUNAL",
  "slug": "salon-comunal",
  "name": "Salón comunal",
  "type": "hall",
  "capacity": 60,
  "status": "active",
  "isReservable": true,
  "isPublicVisible": true,
  "requiresApproval": true,
  "requiresPayment": true,
  "feeAmount": "25.00",
  "feeCurrency": "USD",
  "minimumDurationMinutes": 60,
  "maximumDurationMinutes": 240,
  "reservationAdvanceDays": 30,
  "cancellationLimitHours": 24
}
```

---

## 15.3. CreateAvailabilityWindowDto

```json id="lye09e"
{
  "dayOfWeek": "saturday",
  "startTime": "08:00",
  "endTime": "18:00",
  "isActive": true,
  "validFrom": "2026-08-01",
  "validTo": null
}
```

---

## 15.4. CreateBlackoutDto

```json id="h8pdn6"
{
  "startAt": "2026-08-15T08:00:00Z",
  "endAt": "2026-08-15T18:00:00Z",
  "reason": "Mantenimiento programado"
}
```

---

## 15.5. CreateReservationDto

```json id="g5al4q"
{
  "commonAreaId": "common_area_uuid",
  "propertyUnitId": "property_unit_uuid",
  "requesterUserId": "user_uuid",
  "startAt": "2026-08-20T14:00:00Z",
  "endAt": "2026-08-20T17:00:00Z",
  "purpose": "Reunión familiar",
  "attendeeCount": 20,
  "notes": "Solicitud creada por administración."
}
```

---

## 15.6. CreateOwnReservationDto

```json id="japcvh"
{
  "commonAreaId": "common_area_uuid",
  "propertyUnitId": "property_unit_uuid",
  "startAt": "2026-08-20T14:00:00Z",
  "endAt": "2026-08-20T17:00:00Z",
  "purpose": "Reunión familiar",
  "attendeeCount": 20
}
```

---

## 15.7. ReservationDto

```json id="p0xxwu"
{
  "id": "reservation_uuid",
  "commonAreaId": "common_area_uuid",
  "commonAreaName": "Salón comunal",
  "propertyUnitId": "property_unit_uuid",
  "propertyUnitCode": "Casa 01",
  "startAt": "2026-08-20T14:00:00Z",
  "endAt": "2026-08-20T17:00:00Z",
  "status": "pendingApproval",
  "purpose": "Reunión familiar",
  "attendeeCount": 20,
  "requiresApproval": true,
  "requiresPayment": true,
  "feeAmount": "25.00",
  "feeCurrency": "USD",
  "chargeId": null,
  "paymentStatusSnapshot": "pendingCharge"
}
```

---

## 15.8. ApproveReservationDto

```json id="wsx6qo"
{
  "notes": "Aprobada según disponibilidad."
}
```

---

## 15.9. RejectReservationDto

```json id="osuneg"
{
  "reason": "El área estará en mantenimiento."
}
```

---

## 15.10. CancelReservationDto

```json id="q6k4y1"
{
  "reason": "Solicitud cancelada por el solicitante."
}
```

---

## 15.11. CommonAreaCalendarDto

```json id="n2znfp"
{
  "commonAreaId": "common_area_uuid",
  "from": "2026-08-01",
  "to": "2026-08-31",
  "timezone": "America/Guayaquil",
  "availabilityWindows": [],
  "blackouts": [],
  "reservations": []
}
```

---

# 16. Autenticación y autorización

## 16.1. Endpoints tenant administrativos

Requieren:

```text id="d7d7hf"
AuthGuard
TenantGuard
TenantPermissionGuard
```

---

## 16.2. Endpoints `/me`

Requieren:

```text id="bzhgjk"
AuthGuard
TenantGuard
TenantPermissionGuard
OwnReservationGuard
```

La autorización debe validar:

```text id="l5l1em"
usuario -> person -> unidad -> reserva
```

---

## 16.3. Endpoints públicos WordPress

No requieren usuario final autenticado, pero deben seguir `009-wordpress-integration-basic`.

Reglas:

```text id="y7qr7i"
solo áreas active
solo isPublicVisible = true
solo campos public-safe
sin reservas
sin disponibilidad interna
sin datos financieros privados
```

---

## 16.4. Permisos

### Common Areas

```text id="p50hgp"
commonAreas.create
commonAreas.read
commonAreas.update
commonAreas.archive
commonAreas.manageAvailability
commonAreas.manageBlackouts
```

### Reservations Admin

```text id="g1dhhx"
reservations.create
reservations.read
reservations.approve
reservations.reject
reservations.cancel
reservations.complete
reservations.markNoShow
reservations.readCalendar
reservations.generateCharge
```

### Own Reservations

```text id="cevvyx"
reservations.create.own
reservations.read.own
reservations.cancel.own
reservations.readCalendar.own
```

### Audit and Reports

```text id="k8ez7v"
reservations.audit.read
reservations.reports.read
```

---

# 17. Integración financiera

## 17.1. Fuente de cargos

Las reservas no crean cargos directamente escribiendo en tablas financieras.

Deben usar puerto:

```text id="ny3e1f"
ReservationChargePort
```

Implementado como adaptador hacia `004-dues-fees`.

---

## 17.2. Momento de generación de cargo

Decisión MVP recomendada:

```text id="p6lj1g"
Generar cargo al aprobar la reserva, si requiresPayment = true.
```

Motivos:

* evita cargos por solicitudes rechazadas;
* reduce reversos innecesarios;
* simplifica experiencia;
* mantiene trazabilidad.

---

## 17.3. Idempotencia

Regla:

```text id="p8yhh3"
Una reserva no puede tener más de un cargo activo generado por la tarifa de reserva.
```

Mecanismos:

```text id="c3nwoi"
reservation.chargeId
idempotencyKey = reservation:{reservationId}:charge
unique constraint futura sobre charge source
validación transaccional
```

---

## 17.4. Cancelación con cargo

Decisión MVP:

```text id="k6x3kw"
Cancelar una reserva no revierte automáticamente el cargo.
```

La reversión, ajuste o condonación se realizará desde módulo financiero.

---

## 17.5. PaymentStatusSnapshot

Este campo es informativo.

No reemplaza:

```text id="o0qc2z"
charges
payments
payment_allocations
account_statements
unit_balances
```

---

# 18. Integración con WordPress

## 18.1. Exposición pública

Este módulo provee la fuente de datos para:

```text id="yqwq7w"
GET /api/v1/public/tenants/{slug}/common-areas
GET /api/v1/public/tenants/{slug}/common-areas/{commonAreaSlug}
```

La exposición pública será controlada por `009-wordpress-integration-basic`.

---

## 18.2. Campos públicos permitidos

```text id="o2dqn2"
publicId
slug
name
description
type
capacity opcional
coverImageUrl
galleryUrls
publicRulesSummary
```

---

## 18.3. Campos prohibidos públicamente

```text id="kruyz2"
internalRules
availability windows completas
blackouts internos
reservations
requester data
propertyUnitId
chargeId
feeChargeConceptId
paymentStatusSnapshot
audit data
```

---

## 18.4. Reservas desde WordPress

Diferido.

Regla MVP:

```text id="oini9w"
WordPress público no crea reservas.
```

---

# 19. Reglas de calendario

## 19.1. Calendario administrativo

Puede mostrar:

```text id="ahztyv"
reservas
blackouts
availability windows
estado
unidad asociada
información mínima del solicitante si el permiso lo permite
```

---

## 19.2. Calendario propio

Puede mostrar:

```text id="hm2u90"
disponibilidad
bloqueos genéricos
ocupación de franjas
reservas propias detalladas
reservas de otros como busy sin identidad
```

---

## 19.3. Calendario público WordPress

No incluido.

Regla:

```text id="cjs3wi"
WordPress no ve calendario interno ni reservas existentes en esta spec.
```

---

## 19.4. Rango máximo

MVP recomendado:

```text id="f4vp6u"
31 días por consulta de calendario
```

---

# 20. Estados y máquina de estados

## 20.1. Transiciones permitidas

```text id="riefni"
draft -> requested
requested -> pendingApproval
requested -> approved
pendingApproval -> approved
requested -> rejected
pendingApproval -> rejected
requested -> cancelled
pendingApproval -> cancelled
approved -> cancelled
approved -> completed
approved -> noShow
requested -> expired
pendingApproval -> expired
completed -> archived
cancelled -> archived
rejected -> archived
expired -> archived
noShow -> archived
```

---

## 20.2. Transiciones prohibidas

Ejemplos:

```text id="xdxzcz"
cancelled -> approved
rejected -> approved
completed -> cancelled
archived -> approved
noShow -> completed
```

---

## 20.3. Registro de historial

Toda transición debe generar:

```text id="lu85yo"
ReservationStatusHistory
AuditLog
```

---

# 21. Auditoría

## 21.1. Eventos mínimos

```text id="k81woe"
commonArea.created
commonArea.updated
commonArea.activated
commonArea.deactivated
commonArea.markedMaintenance
commonArea.archived
commonAreaAvailability.created
commonAreaAvailability.updated
commonAreaAvailability.archived
commonAreaBlackout.created
commonAreaBlackout.cancelled
reservation.created
reservation.requested
reservation.approved
reservation.rejected
reservation.cancelled
reservation.completed
reservation.noShow
reservation.expired
reservation.chargeGenerated
reservation.chargeGenerationFailed
reservation.conflictDetected
```

---

## 21.2. Metadata permitida

```text id="drn8aa"
commonAreaId
reservationId
propertyUnitId
fromStatus
toStatus
startAt
endAt
reason
chargeId
traceId
```

---

## 21.3. Metadata prohibida

```text id="d4n0t6"
payload completo
tokens
secretos
comprobantes
datos personales innecesarios
datos financieros detallados no necesarios
```

---

# 22. Observabilidad

## 22.1. Logs estructurados

Logs sugeridos:

```text id="h2b135"
commonArea.created
commonArea.updated
commonArea.archived
reservation.created
reservation.approved
reservation.rejected
reservation.cancelled
reservation.completed
reservation.noShow
reservation.conflictDetected
reservation.chargeGenerated
reservation.chargeGenerationFailed
calendar.query.executed
calendar.query.failed
```

---

## 22.2. Métricas

```text id="pu0q23"
reservations_created_total
reservations_approved_total
reservations_rejected_total
reservations_cancelled_total
reservations_completed_total
reservations_no_show_total
reservations_conflict_total
reservations_charge_generated_total
reservations_charge_generation_failed_total
common_area_calendar_query_latency_ms
```

---

## 22.3. Labels permitidos

```text id="mtyqva"
status
action
outcome
areaType
```

---

## 22.4. Labels prohibidos

```text id="dw7wah"
tenantId
reservationId
commonAreaId
propertyUnitId
personId
userId
traceId
```

---

# 23. Seguridad

## 23.1. Controles obligatorios

```text id="xxyf9f"
tenant isolation
permission guards
own-resource authorization
property unit authorization
state transition validation
conflict detection
transactional create/approve
blackout validation
availability validation
Decimal money
idempotent charge generation
public DTO minimization
audit events
safe errors
rate limiting
```

---

## 23.2. Riesgos principales

| Riesgo                           | Mitigación                              |
| -------------------------------- | --------------------------------------- |
| Doble reserva                    | Transaction + conflict detection + lock |
| Cross-tenant reservation         | tenant_id + guards + tests              |
| Reserva de unidad ajena          | ReservationOwnershipService             |
| Exposición de reservas ajenas    | OwnReservationGuard + DTO mínimo        |
| Exposición pública de calendario | no endpoint público de calendario       |
| Cargo duplicado                  | idempotency + chargeId                  |
| Uso de float                     | ReservationMoney                        |
| Transición inválida              | State machine                           |
| Auditoría omitida                | ReservationAuditService                 |
| WordPress crea reservas          | no endpoint público de escritura        |

---

# 24. Testing plan resumido

El documento completo será:

```text id="e86hqf"
docs/specs/010-reservations-common-areas/test-plan.md
```

## 24.1. Unit tests

* CommonArea entity.
* Reservation entity.
* ReservationTimeRange.
* ReservationDuration.
* ReservationMoney.
* State machine.
* Conflict detection.
* Cancellation policy.
* Ownership policy.

---

## 24.2. Integration tests

* Crear área.
* Configurar disponibilidad.
* Crear blackout.
* Crear reserva.
* Aprobar reserva.
* Rechazar reserva.
* Cancelar reserva.
* Generar cargo.
* No doble reserva.
* Multitenancy.

---

## 24.3. API tests

* Common areas.
* Availability.
* Blackouts.
* Reservations admin.
* Reservations own.
* Calendar.
* Public common areas.

---

## 24.4. Authorization tests

* Sin token.
* Sin membership.
* Sin permisos.
* Admin autorizado.
* Residente autorizado.
* Residente no autorizado.

---

## 24.5. Financial regression tests

* Cargo generado una vez.
* Cargo tenant correcto.
* Cargo unidad correcta.
* Monto string.
* No pago desde reservas.
* Cancelación no revierte cargo automáticamente.

---

## 24.6. Security tests

* No cross-tenant.
* No reserva unidad ajena.
* No ve reservas ajenas.
* WordPress no ve calendario.
* No datos personales en calendario propio limitado.
* No float para dinero.

---

# 25. Orden recomendado de desarrollo

## Incremento 1 — Base del módulo

```text id="lcjuey"
ReservationsModule
estructura de carpetas
value objects
errores
state machine
DTOs base
```

---

## Incremento 2 — Common Areas

```text id="hv530t"
CommonArea entity
CommonArea repository
CommonArea service
CommonAreasController
CRUD administrativo
estado active/inactive/maintenance/archived
```

---

## Incremento 3 — Availability and Blackouts

```text id="b9k3pl"
Availability windows
Blackouts
validación de rangos
validación de ventanas
bloqueos activos
```

---

## Incremento 4 — Reservation Core

```text id="o9501h"
Reservation entity
Reservation repository
ReservationService
ReservationConflictService
ReservationAvailabilityService
ReservationStateMachineService
create/list/get
```

---

## Incremento 5 — Own Reservations

```text id="qig3mp"
ReservationOwnershipService
CreateOwnReservationUseCase
ListOwnReservationsUseCase
CancelOwnReservationUseCase
OwnReservationGuard
```

---

## Incremento 6 — Approval Workflow

```text id="w6vvme"
approve
reject
cancel admin
complete
mark no show
status history
audit events
```

---

## Incremento 7 — Financial Integration

```text id="sox5z2"
ReservationChargePort
ReservationChargeService
generate charge
idempotency
chargeId attach
financial regression tests
```

---

## Incremento 8 — Calendar

```text id="gaoxmy"
admin calendar
own calendar
date range limit
privacy-safe calendar DTOs
```

---

## Incremento 9 — Public Common Areas

```text id="o31dg3"
PublicCommonAreaReaderPort
PublicCommonAreaAdapter
WordPress-safe DTOs
integration with 009 public endpoints
```

---

## Incremento 10 — Hardening

```text id="gkoywv"
OpenAPI
observability
security tests
performance tests
CI gates
SDD review
```

---

# 26. Performance

## 26.1. Objetivo MVP

```text id="kuedpe"
p95 < 700 ms para calendario de hasta 31 días por área.
```

---

## 26.2. Estrategias

```text id="yg8ma6"
índices por tenant/commonArea/startAt/endAt
date range obligatorio
pageSize limitado
evitar N+1
consultas específicas para calendario
no cargar datos personales innecesarios
```

---

# 27. Criterios técnicos de aceptación

La implementación técnica se acepta si:

* existe módulo `reservations`;
* existen tablas requeridas;
* existe gestión de áreas comunales;
* existe gestión de disponibilidad;
* existe gestión de blackouts;
* existe creación de reservas;
* existe creación de reservas propias;
* existe aprobación/rechazo/cancelación/cierre/no-show;
* se impide doble reserva;
* se impide reserva durante blackout;
* se valida disponibilidad;
* se valida propiedad/residencia para `/me`;
* se genera cargo opcional de forma idempotente;
* no se procesan pagos desde reservas;
* se mantiene historial de estados;
* se auditan operaciones críticas;
* se exponen áreas públicas de forma segura;
* WordPress no puede crear reservas;
* OpenAPI está actualizado;
* pruebas pasan;
* CI pasa.

---

# 28. Comandos esperados

Comandos generales:

```bash id="ulk4nm"
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

```bash id="ozbz4b"
npm run test:reservations
npm run test:reservations:unit
npm run test:reservations:integration
npm run test:reservations:api
npm run test:reservations:authorization
npm run test:reservations:multitenancy
npm run test:reservations:financial
npm run test:reservations:calendar
npm run test:reservations:security
```

---

# 29. Riesgos de implementación

| Riesgo                    | Impacto    | Mitigación                 |
| ------------------------- | ---------- | -------------------------- |
| Doble reserva             | Alto       | transacción + lock + tests |
| Solapamiento no detectado | Alto       | ReservationConflictService |
| Blackout ignorado         | Alto       | Blackout validation        |
| Reserva de unidad ajena   | Alto       | Ownership service          |
| Cross-tenant              | Crítico    | tenant_id + tests          |
| Cargo duplicado           | Alto       | idempotencia               |
| Uso de float              | Alto       | Decimal                    |
| Estado inválido           | Alto       | state machine              |
| Cancelación incorrecta    | Medio/alto | cancellation policy        |
| WordPress ve reservas     | Alto       | public DTO + no endpoint   |
| Logs con datos personales | Alto       | logging policy             |
| Falta de auditoría        | Alto       | audit service + tests      |

---

# 30. Checklist para agentes IA

Antes de generar código para este módulo, el agente debe leer:

```text id="b24jy2"
docs/sdd/constitution.md
docs/sdd/domain-map.md
docs/sdd/architecture.md
docs/sdd/security.md
docs/sdd/api-guidelines.md
docs/sdd/data-governance.md
docs/specs/001-tenants/
docs/specs/002-users-roles/
docs/specs/003-residents-properties/
docs/specs/004-dues-fees/
docs/specs/005-payments/
docs/specs/006-account-statements/
docs/specs/007-audit/
docs/specs/009-wordpress-integration-basic/
docs/specs/010-reservations-common-areas/spec.md
docs/specs/010-reservations-common-areas/plan.md
```

El agente no debe:

```text id="g4wwf0"
permitir doble reserva
omitir tenantId
crear reservas cross-tenant
permitir a residentes reservar unidades ajenas
exponer reservas privadas a WordPress
exponer calendario interno públicamente
generar cargos duplicados
usar float para dinero
procesar pagos desde reservas
revertir cargos automáticamente al cancelar
eliminar historial
permitir transiciones inválidas
omitir auditoría
implementar pagos online fuera de scope
implementar reservas recurrentes fuera de scope
implementar QR fuera de scope
```

---

# 31. Pendientes para documentos derivados

## 31.1. `data-model.md`

Debe detallar:

* tablas;
* enums;
* Prisma models;
* relaciones;
* constraints;
* índices;
* estrategia anti-solapamiento;
* idempotencia de cargo;
* status history;
* reglas de dinero.

---

## 31.2. `api-contract.md`

Debe detallar:

* endpoints;
* permisos;
* DTOs;
* responses;
* errores;
* filtros;
* paginación;
* calendario;
* OpenAPI.

---

## 31.3. `test-plan.md`

Debe detallar:

* unit tests;
* integration tests;
* API tests;
* authorization tests;
* multitenancy tests;
* financial regression tests;
* calendar tests;
* security tests;
* concurrency tests.

---

## 31.4. `tasks.md`

Debe convertir este plan en tareas ejecutables.

---

## 31.5. `security-notes.md`

Debe detallar:

* riesgos de doble reserva;
* riesgos cross-tenant;
* riesgos de acceso a unidad ajena;
* riesgos de calendario;
* riesgos financieros;
* riesgos WordPress;
* controles de auditoría.

---

# 32. Decisión final de implementación

El módulo `010-reservations-common-areas` se implementará como módulo transaccional dentro de RESIDENT Core para administrar áreas comunales y reservas.

Para MVP:

```text id="mtick8"
- Crear catálogo de áreas comunales.
- Configurar disponibilidad simple.
- Configurar blackouts.
- Crear reservas administrativas.
- Crear reservas propias.
- Aprobar, rechazar, cancelar, completar y marcar no show.
- Impedir reservas solapadas.
- Validar blackouts.
- Validar propiedad/residencia en reservas propias.
- Generar cargos opcionales al aprobar.
- No procesar pagos desde reservas.
- No revertir cargos automáticamente al cancelar.
- Exponer a WordPress solo catálogo público de áreas.
- No permitir reservas desde WordPress público.
```

El módulo debe garantizar:

```text id="sp80sx"
tenant isolation
permissioned actions
own-resource protection
transactional conflict detection
availability validation
state transition control
auditability
financial idempotency
public-safe WordPress exposure
```

La implementación no debe aceptarse si permite doble reserva, mezcla tenants, permite reservas sobre unidades ajenas, expone reservas privadas a WordPress, genera cargos duplicados, usa float para dinero, procesa pagos directamente, elimina historial o permite transiciones de estado no autorizadas.
