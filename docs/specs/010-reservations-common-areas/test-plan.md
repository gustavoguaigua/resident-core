# Test Plan — Spec 010 Reservations and Common Areas

## 1. Información del documento

| Campo                    | Valor                                                                                                                                                                   |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto                 | RESIDENT Core                                                                                                                                                           |
| Spec ID                  | 010                                                                                                                                                                     |
| Módulo                   | Reservations and Common Areas                                                                                                                                           |
| Documento                | Test Plan                                                                                                                                                               |
| Ruta                     | `docs/specs/010-reservations-common-areas/test-plan.md`                                                                                                                 |
| Versión                  | 0.1                                                                                                                                                                     |
| Estado                   | Borrador inicial                                                                                                                                                        |
| Fecha                    | 2026-07-18                                                                                                                                                              |
| Documento base           | `docs/specs/010-reservations-common-areas/spec.md`                                                                                                                      |
| Plan técnico             | `docs/specs/010-reservations-common-areas/plan.md`                                                                                                                      |
| Modelo de datos          | `docs/specs/010-reservations-common-areas/data-model.md`                                                                                                                |
| Contrato API             | `docs/specs/010-reservations-common-areas/api-contract.md`                                                                                                              |
| Depende de               | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements`, `007-audit`, `009-wordpress-integration-basic` |
| Framework sugerido       | Jest + Supertest                                                                                                                                                        |
| Base de datos de pruebas | PostgreSQL test database                                                                                                                                                |
| Prioridad                | Alta                                                                                                                                                                    |

---

## 2. Propósito

Este documento define el plan de pruebas para el módulo `010-reservations-common-areas`.

El objetivo es validar que RESIDENT Core pueda gestionar áreas comunales, disponibilidad, bloqueos, reservas, flujos de aprobación, cancelaciones, calendario y generación opcional de cargos, garantizando:

* aislamiento por tenant;
* autorización por permiso;
* validación de unidad propia en endpoints `/me`;
* prevención de doble reserva;
* validación de disponibilidad;
* validación de blackouts;
* control estricto de estados;
* auditoría de eventos relevantes;
* consistencia financiera;
* privacidad en calendarios;
* exposición pública segura hacia WordPress;
* no procesamiento directo de pagos;
* no eliminación física del historial.

Regla central:

```text id="rbr655"
El módulo de reservas debe impedir doble reserva, proteger recursos propios, preservar trazabilidad, integrarse con cargos de forma idempotente y no exponer reservas privadas en superficies públicas.
```

---

## 3. Alcance de pruebas

### 3.1. Incluido

Este plan cubre:

```text id="e1tnm9"
Unit tests
Domain tests
Value object tests
DTO validation tests
Application service tests
Use case tests
Repository integration tests
API tests
Authorization tests
Own-resource tests
Multitenancy tests
Calendar tests
Conflict detection tests
Concurrency tests
Financial regression tests
Audit integration tests
Observability tests
OpenAPI tests
WordPress public catalog tests
Smoke tests
```

---

### 3.2. No incluido

No cubre todavía:

```text id="ihhfuf"
pagos en línea
pasarela de pagos
depósitos en garantía avanzados
penalizaciones automáticas
tarifas por temporada
tarifas dinámicas
reservas recurrentes
lista de espera
QR de ingreso
cerraduras inteligentes
check-in/check-out digital
inspecciones post-reserva
sincronización con Google Calendar
notificaciones WhatsApp/email
contratos PDF
firma electrónica
reservas desde WordPress público
SSO completo desde WordPress
```

Estos temas quedan diferidos para specs futuras.

---

## 4. Estrategia general

Las pruebas se organizan por capas:

```text id="d7dt70"
1. Value objects.
2. Entidades de dominio.
3. Máquina de estados.
4. Servicios de disponibilidad y conflicto.
5. DTOs y validaciones.
6. Puertos y repositorios.
7. Casos de uso.
8. Controladores REST.
9. Autorización y permisos.
10. Validación de recursos propios.
11. Multitenancy.
12. Concurrencia.
13. Integración financiera.
14. Auditoría.
15. Observabilidad.
16. OpenAPI.
17. Compatibilidad con WordPress public-safe.
18. Smoke tests.
```

Reglas obligatorias:

```text id="z3rkmq"
1. Ninguna prueba debe usar datos reales de residentes.
2. Ninguna reserva puede crearse sin tenant_id.
3. Ninguna reserva puede crearse sin common_area_id.
4. Ninguna reserva puede tener startAt >= endAt.
5. Ninguna reserva propia puede usar unidad ajena.
6. Ninguna reserva puede cruzar tenants.
7. Ninguna creación/aprobación puede permitir solapamiento.
8. Ninguna reserva puede solaparse con blackout activo.
9. Ninguna reserva puede estar fuera de disponibilidad configurada.
10. Ningún endpoint público puede exponer reservas, calendario o datos personales.
11. Ningún monto debe manejarse como float/double.
12. Ningún cargo debe generarse más de una vez por reserva.
13. Ningún pago debe procesarse desde reservas.
14. Ninguna cancelación debe revertir automáticamente un cargo en MVP.
15. Toda transición relevante debe registrar historial y auditoría.
```

---

## 5. Criterios globales de aceptación

La implementación cumple este plan si:

* permite crear áreas comunales válidas;
* permite configurar ventanas de disponibilidad;
* permite crear y cancelar blackouts;
* permite crear reservas administrativas;
* permite crear reservas propias;
* impide reservas solapadas;
* impide reservas sobre blackouts activos;
* impide reservas fuera de disponibilidad;
* impide reservas de unidades ajenas;
* permite aprobar, rechazar, cancelar, completar y marcar no show según estado;
* impide transiciones inválidas;
* genera cargos opcionales de forma idempotente;
* no procesa pagos desde reservas;
* mantiene historial de estados;
* audita operaciones críticas;
* protege calendario propio mostrando terceros como `busy`;
* protege endpoints públicos de WordPress;
* todos los endpoints aplican permisos correctos;
* todos los endpoints filtran por tenant;
* pruebas unitarias, integración, API, seguridad, multitenancy, concurrencia y financieras pasan;
* OpenAPI valida;
* CI pasa.

---

## 6. Datos base de prueba

### 6.1. Tenants

Reusar fixtures de `001-tenants`:

```text id="j2i0ki"
tenantActiveA
tenantActiveB
tenantSuspended
tenantInactive
tenantArchived
```

---

### 6.2. Usuarios y roles

Reusar fixtures de `002-users-roles`:

```text id="mq3l05"
platformAdmin
tenantAdminA
tenantAdminB
reservationManagerA
reservationManagerB
treasurerA
ownerUserA
residentUserA
tenantUserWithoutReservationPermissionA
tenantUserWithoutMembership
disabledUser
anonymousUser
```

---

### 6.3. Personas y unidades

Reusar o crear fixtures compatibles con `003-residents-properties`:

```text id="ksuc1o"
personOwnerA
personResidentA
personOwnerB
personResidentB

propertyUnitA101
propertyUnitA102
propertyUnitB201
propertyUnitInactiveA
```

Relaciones activas:

```text id="d596zo"
ownerUserA -> personOwnerA -> propertyUnitA101
residentUserA -> personResidentA -> propertyUnitA101
tenantAdminA -> tenantActiveA
tenantAdminB -> tenantActiveB
```

---

### 6.4. Áreas comunales

Fixtures requeridos:

```text id="o7tqjf"
commonAreaSalonA
commonAreaCanchaA
commonAreaBbqA
commonAreaPiscinaA
commonAreaInactiveA
commonAreaMaintenanceA
commonAreaNotReservableA
commonAreaPublicVisibleA
commonAreaPrivateA
commonAreaSalonB
```

Ejemplo:

```text id="am9q90"
commonAreaSalonA:
tenantId = tenantActiveA.id
code = SALON-A
slug = salon-comunal
name = Salón comunal
type = hall
capacity = 60
status = active
isReservable = true
isPublicVisible = true
requiresApproval = true
requiresPayment = true
feeAmount = 25.00
feeCurrency = USD
feeChargeConceptId = reservationChargeConceptA.id
minimumDurationMinutes = 60
maximumDurationMinutes = 240
reservationAdvanceDays = 30
cancellationLimitHours = 24
```

---

### 6.5. Ventanas de disponibilidad

Fixtures:

```text id="p5h9i6"
availabilitySalonSaturdayA
availabilitySalonSundayA
availabilityCanchaWeekdaysA
availabilityBbqWeekendA
availabilityInactiveA
availabilitySalonB
```

Ejemplo:

```text id="nyynpr"
availabilitySalonSaturdayA:
tenantId = tenantActiveA.id
commonAreaId = commonAreaSalonA.id
dayOfWeek = saturday
startTime = 08:00
endTime = 18:00
isActive = true
```

---

### 6.6. Blackouts

Fixtures:

```text id="edk24l"
blackoutSalonActiveA
blackoutSalonCancelledA
blackoutSalonExpiredA
blackoutCanchaActiveA
blackoutSalonB
```

Ejemplo:

```text id="ce91n6"
blackoutSalonActiveA:
tenantId = tenantActiveA.id
commonAreaId = commonAreaSalonA.id
startAt = 2026-08-15T08:00:00Z
endAt = 2026-08-15T18:00:00Z
reason = Mantenimiento programado
status = active
```

---

### 6.7. Reservas

Fixtures:

```text id="o3rn2t"
reservationRequestedA
reservationPendingApprovalA
reservationApprovedA
reservationRejectedA
reservationCancelledA
reservationCompletedA
reservationNoShowA
reservationExpiredA
reservationWithChargeA
reservationApprovedB
```

Ejemplo:

```text id="cvrelc"
reservationApprovedA:
tenantId = tenantActiveA.id
commonAreaId = commonAreaSalonA.id
propertyUnitId = propertyUnitA101.id
requesterUserId = ownerUserA.id
requesterPersonId = personOwnerA.id
startAt = 2026-08-20T14:00:00Z
endAt = 2026-08-20T17:00:00Z
status = approved
requiresApproval = true
requiresPayment = true
feeAmount = 25.00
feeCurrency = USD
paymentStatusSnapshot = chargeGenerated
```

---

### 6.8. Conceptos y cargos

Reusar o crear fixtures compatibles con `004-dues-fees`:

```text id="z99ci6"
reservationChargeConceptA
reservationChargeConceptB
inactiveChargeConceptA
chargeForReservationA
chargeForOtherTenantB
```

---

### 6.9. Datos prohibidos en fixtures

No usar:

```text id="pwy7a0"
nombres reales de residentes
cédulas reales
emails personales reales
teléfonos reales
comprobantes reales
pagos reales
tokens reales
cookies reales
API keys reales
client secrets reales
connection strings reales
```

---

## 7. Factories recomendadas

Crear factories:

```text id="t80hfj"
createCommonArea()
createAvailabilityWindow()
createBlackout()
createReservation()
createReservationStatusHistory()
createCreateCommonAreaDto()
createCreateReservationDto()
createCreateOwnReservationDto()
createApproveReservationDto()
createRejectReservationDto()
createCancelReservationDto()
createCalendarQuery()
createReservationActorContext()
createReservationChargeRequest()
```

Ejemplo:

```text id="wlunrz"
createReservation({
  tenantId: tenantActiveA.id,
  commonAreaId: commonAreaSalonA.id,
  propertyUnitId: propertyUnitA101.id,
  startAt: "2026-08-20T14:00:00Z",
  endAt: "2026-08-20T17:00:00Z",
  status: "pendingApproval"
})
```

---

# 8. Pruebas unitarias de value objects

## 8.1. CommonAreaCode

Archivo sugerido:

```text id="wnsujf"
common-area-code.vo.spec.ts
```

| ID             | Caso                    | Resultado esperado |
| -------------- | ----------------------- | ------------------ |
| UT-CA-CODE-001 | `SALON-COMUNAL` válido  | válido             |
| UT-CA-CODE-002 | `CANCHA-01` válido      | válido             |
| UT-CA-CODE-003 | código vacío            | error              |
| UT-CA-CODE-004 | código demasiado largo  | error              |
| UT-CA-CODE-005 | código con script       | error              |
| UT-CA-CODE-006 | código con slash        | error              |
| UT-CA-CODE-007 | normalización si aplica | consistente        |

---

## 8.2. CommonAreaStatus

Archivo sugerido:

```text id="ne84ee"
common-area-status.vo.spec.ts
```

| ID               | Caso                                   | Resultado esperado |
| ---------------- | -------------------------------------- | ------------------ |
| UT-CA-STATUS-001 | `active`                               | válido             |
| UT-CA-STATUS-002 | `inactive`                             | válido             |
| UT-CA-STATUS-003 | `maintenance`                          | válido             |
| UT-CA-STATUS-004 | `archived`                             | válido             |
| UT-CA-STATUS-005 | valor inválido                         | error              |
| UT-CA-STATUS-006 | active permite reserva si isReservable | true               |
| UT-CA-STATUS-007 | inactive no permite reserva            | false              |
| UT-CA-STATUS-008 | maintenance no permite reserva         | false              |
| UT-CA-STATUS-009 | archived no permite reserva            | false              |

---

## 8.3. CommonAreaType

Archivo sugerido:

```text id="zvqmpf"
common-area-type.vo.spec.ts
```

| ID             | Caso                 | Resultado esperado             |
| -------------- | -------------------- | ------------------------------ |
| UT-CA-TYPE-001 | `hall` válido        | válido                         |
| UT-CA-TYPE-002 | `court` válido       | válido                         |
| UT-CA-TYPE-003 | `bbq` válido         | válido                         |
| UT-CA-TYPE-004 | `meetingRoom` válido | válido                         |
| UT-CA-TYPE-005 | valor desconocido    | error o `other` según política |

---

## 8.4. ReservationStatus

Archivo sugerido:

```text id="eyfem5"
reservation-status.vo.spec.ts
```

| ID                | Caso                                   | Resultado esperado |
| ----------------- | -------------------------------------- | ------------------ |
| UT-RES-STATUS-001 | `requested` válido                     | válido             |
| UT-RES-STATUS-002 | `pendingApproval` válido               | válido             |
| UT-RES-STATUS-003 | `approved` válido                      | válido             |
| UT-RES-STATUS-004 | `cancelled` válido                     | válido             |
| UT-RES-STATUS-005 | valor inválido                         | error              |
| UT-RES-STATUS-006 | requested bloquea disponibilidad       | true               |
| UT-RES-STATUS-007 | pendingApproval bloquea disponibilidad | true               |
| UT-RES-STATUS-008 | approved bloquea disponibilidad        | true               |
| UT-RES-STATUS-009 | rejected no bloquea disponibilidad     | false              |
| UT-RES-STATUS-010 | cancelled no bloquea disponibilidad    | false              |

---

## 8.5. ReservationTimeRange

Archivo sugerido:

```text id="q673cd"
reservation-time-range.vo.spec.ts
```

| ID               | Caso                         | Resultado esperado |
| ---------------- | ---------------------------- | ------------------ |
| UT-RES-RANGE-001 | startAt < endAt              | válido             |
| UT-RES-RANGE-002 | startAt = endAt              | error              |
| UT-RES-RANGE-003 | startAt > endAt              | error              |
| UT-RES-RANGE-004 | fecha inválida               | error              |
| UT-RES-RANGE-005 | rango UTC válido             | válido             |
| UT-RES-RANGE-006 | rango cruza medianoche local | error MVP          |
| UT-RES-RANGE-007 | rango multi-día              | error MVP          |

---

## 8.6. ReservationDuration

Archivo sugerido:

```text id="v0rvz5"
reservation-duration.vo.spec.ts
```

| ID             | Caso                     | Resultado esperado |
| -------------- | ------------------------ | ------------------ |
| UT-RES-DUR-001 | duración 60 minutos      | válido             |
| UT-RES-DUR-002 | duración menor al mínimo | error              |
| UT-RES-DUR-003 | duración mayor al máximo | error              |
| UT-RES-DUR-004 | duración exacta mínima   | válido             |
| UT-RES-DUR-005 | duración exacta máxima   | válido             |
| UT-RES-DUR-006 | duración negativa        | error              |

---

## 8.7. ReservationMoney

Archivo sugerido:

```text id="hqmp9q"
reservation-money.vo.spec.ts
```

| ID               | Caso                        | Resultado esperado |
| ---------------- | --------------------------- | ------------------ |
| UT-RES-MONEY-001 | `"25.00"` válido            | válido             |
| UT-RES-MONEY-002 | `"0.00"` válido si gratuita | válido             |
| UT-RES-MONEY-003 | `"-10.00"`                  | error              |
| UT-RES-MONEY-004 | `"25.001"`                  | error              |
| UT-RES-MONEY-005 | número float                | error              |
| UT-RES-MONEY-006 | `NaN`                       | error              |
| UT-RES-MONEY-007 | salida API como string      | válido             |

---

## 8.8. AttendeeCount

Archivo sugerido:

```text id="hklord"
attendee-count.vo.spec.ts
```

| ID             | Caso                                   | Resultado esperado |
| -------------- | -------------------------------------- | ------------------ |
| UT-RES-ATT-001 | asistentes menor a capacidad           | válido             |
| UT-RES-ATT-002 | asistentes igual a capacidad           | válido             |
| UT-RES-ATT-003 | asistentes mayor a capacidad           | error              |
| UT-RES-ATT-004 | valor negativo                         | error              |
| UT-RES-ATT-005 | cero asistentes si política lo prohíbe | error              |
| UT-RES-ATT-006 | null permitido si no se exige          | válido             |

---

## 8.9. DayOfWeek y TimeOfDay

Archivos sugeridos:

```text id="f3od4k"
day-of-week.vo.spec.ts
time-of-day.vo.spec.ts
```

| ID              | Caso               | Resultado esperado |
| --------------- | ------------------ | ------------------ |
| UT-RES-DAY-001  | `monday` válido    | válido             |
| UT-RES-DAY-002  | valor inválido     | error              |
| UT-RES-TIME-001 | `08:00` válido     | válido             |
| UT-RES-TIME-002 | `18:00` válido     | válido             |
| UT-RES-TIME-003 | `25:00` inválido   | error              |
| UT-RES-TIME-004 | `08:60` inválido   | error              |
| UT-RES-TIME-005 | formato incompleto | error              |

---

# 9. Pruebas unitarias de entidades

## 9.1. CommonArea entity

Archivo sugerido:

```text id="xjisvu"
common-area.entity.spec.ts
```

| ID            | Caso                                   | Resultado esperado |
| ------------- | -------------------------------------- | ------------------ |
| UT-CA-ENT-001 | área válida                            | válida             |
| UT-CA-ENT-002 | sin tenantId                           | error              |
| UT-CA-ENT-003 | sin nombre                             | error              |
| UT-CA-ENT-004 | capacidad negativa                     | error              |
| UT-CA-ENT-005 | requiresPayment sin feeAmount          | error              |
| UT-CA-ENT-006 | requiresPayment sin feeChargeConceptId | error              |
| UT-CA-ENT-007 | isReservable false no permite reserva  | correcto           |
| UT-CA-ENT-008 | status maintenance no permite reserva  | correcto           |
| UT-CA-ENT-009 | archived no permite reserva            | correcto           |
| UT-CA-ENT-010 | public DTO no incluye internalRules    | correcto           |

---

## 9.2. AvailabilityWindow entity

Archivo sugerido:

```text id="l81prk"
common-area-availability-window.entity.spec.ts
```

| ID            | Caso                                  | Resultado esperado |
| ------------- | ------------------------------------- | ------------------ |
| UT-AV-ENT-001 | ventana válida                        | válida             |
| UT-AV-ENT-002 | startTime = endTime                   | error              |
| UT-AV-ENT-003 | startTime > endTime                   | error              |
| UT-AV-ENT-004 | dayOfWeek inválido                    | error              |
| UT-AV-ENT-005 | ventana inactiva no habilita reserva  | correcto           |
| UT-AV-ENT-006 | ventana archivada no habilita reserva | correcto           |
| UT-AV-ENT-007 | validFrom/validTo fuera de rango      | no disponible      |

---

## 9.3. Blackout entity

Archivo sugerido:

```text id="x0ey6z"
common-area-blackout.entity.spec.ts
```

| ID             | Caso                       | Resultado esperado |
| -------------- | -------------------------- | ------------------ |
| UT-BLK-ENT-001 | blackout válido            | válido             |
| UT-BLK-ENT-002 | sin razón                  | error              |
| UT-BLK-ENT-003 | startAt >= endAt           | error              |
| UT-BLK-ENT-004 | active bloquea             | true               |
| UT-BLK-ENT-005 | cancelled no bloquea       | false              |
| UT-BLK-ENT-006 | archived no bloquea        | false              |
| UT-BLK-ENT-007 | cancelación requiere razón | error si falta     |

---

## 9.4. Reservation entity

Archivo sugerido:

```text id="wgzsme"
reservation.entity.spec.ts
```

| ID             | Caso                                    | Resultado esperado |
| -------------- | --------------------------------------- | ------------------ |
| UT-RES-ENT-001 | reserva válida                          | válida             |
| UT-RES-ENT-002 | sin tenantId                            | error              |
| UT-RES-ENT-003 | sin commonAreaId                        | error              |
| UT-RES-ENT-004 | startAt >= endAt                        | error              |
| UT-RES-ENT-005 | feeAmount Decimal                       | correcto           |
| UT-RES-ENT-006 | chargeId opcional                       | correcto           |
| UT-RES-ENT-007 | reserva rechazada requiere razón        | correcto           |
| UT-RES-ENT-008 | reserva cancelada admin requiere razón  | correcto           |
| UT-RES-ENT-009 | approved contiene approvedBy/approvedAt | correcto           |
| UT-RES-ENT-010 | no elimina historial                    | correcto           |

---

## 9.5. ReservationStatusHistory entity

Archivo sugerido:

```text id="w9w7c9"
reservation-status-history.entity.spec.ts
```

| ID          | Caso                | Resultado esperado |
| ----------- | ------------------- | ------------------ |
| UT-HIST-001 | transición válida   | historial creado   |
| UT-HIST-002 | sin reservationId   | error              |
| UT-HIST-003 | sin toStatus        | error              |
| UT-HIST-004 | metadata sanitizada | correcto           |
| UT-HIST-005 | no payload completo | correcto           |
| UT-HIST-006 | no tokens/secrets   | correcto           |

---

# 10. Pruebas de máquina de estados

Archivo sugerido:

```text id="x441iv"
reservation-state-machine.service.spec.ts
```

## 10.1. Transiciones permitidas

| ID         | Transición                   | Resultado esperado |
| ---------- | ---------------------------- | ------------------ |
| ST-RES-001 | draft -> requested           | permitido          |
| ST-RES-002 | requested -> pendingApproval | permitido          |
| ST-RES-003 | requested -> approved        | permitido          |
| ST-RES-004 | pendingApproval -> approved  | permitido          |
| ST-RES-005 | requested -> rejected        | permitido          |
| ST-RES-006 | pendingApproval -> rejected  | permitido          |
| ST-RES-007 | requested -> cancelled       | permitido          |
| ST-RES-008 | pendingApproval -> cancelled | permitido          |
| ST-RES-009 | approved -> cancelled        | permitido          |
| ST-RES-010 | approved -> completed        | permitido          |
| ST-RES-011 | approved -> noShow           | permitido          |
| ST-RES-012 | requested -> expired         | permitido          |
| ST-RES-013 | pendingApproval -> expired   | permitido          |
| ST-RES-014 | completed -> archived        | permitido          |
| ST-RES-015 | cancelled -> archived        | permitido          |
| ST-RES-016 | rejected -> archived         | permitido          |
| ST-RES-017 | expired -> archived          | permitido          |
| ST-RES-018 | noShow -> archived           | permitido          |

---

## 10.2. Transiciones prohibidas

| ID             | Transición                  | Resultado esperado |
| -------------- | --------------------------- | ------------------ |
| ST-RES-BLK-001 | cancelled -> approved       | error              |
| ST-RES-BLK-002 | rejected -> approved        | error              |
| ST-RES-BLK-003 | completed -> cancelled      | error              |
| ST-RES-BLK-004 | archived -> approved        | error              |
| ST-RES-BLK-005 | noShow -> completed         | error              |
| ST-RES-BLK-006 | completed -> approved       | error              |
| ST-RES-BLK-007 | approved -> pendingApproval | error              |
| ST-RES-BLK-008 | expired -> approved         | error              |

---

# 11. Pruebas de DTOs y validación

## 11.1. CreateCommonAreaDto

Archivo sugerido:

```text id="y52eu4"
create-common-area.dto.spec.ts
```

| ID                | Caso                                   | Resultado esperado    |
| ----------------- | -------------------------------------- | --------------------- |
| DTO-CA-CREATE-001 | body válido                            | válido                |
| DTO-CA-CREATE-002 | sin code                               | 422                   |
| DTO-CA-CREATE-003 | sin slug                               | 422                   |
| DTO-CA-CREATE-004 | sin name                               | 422                   |
| DTO-CA-CREATE-005 | capacity negativa                      | 422                   |
| DTO-CA-CREATE-006 | requiresPayment sin feeAmount          | 422                   |
| DTO-CA-CREATE-007 | requiresPayment sin feeChargeConceptId | 422                   |
| DTO-CA-CREATE-008 | feeAmount float                        | 422                   |
| DTO-CA-CREATE-009 | URL insegura                           | 422                   |
| DTO-CA-CREATE-010 | body con tenantId                      | 422 o ignorado seguro |

---

## 11.2. Availability DTOs

Archivo sugerido:

```text id="rmj5z2"
availability-window.dto.spec.ts
```

| ID         | Caso                 | Resultado esperado |
| ---------- | -------------------- | ------------------ |
| DTO-AV-001 | ventana válida       | válido             |
| DTO-AV-002 | dayOfWeek inválido   | 422                |
| DTO-AV-003 | startTime inválido   | 422                |
| DTO-AV-004 | endTime inválido     | 422                |
| DTO-AV-005 | startTime >= endTime | 422                |
| DTO-AV-006 | validFrom > validTo  | 422                |

---

## 11.3. Blackout DTOs

Archivo sugerido:

```text id="kztzlf"
blackout.dto.spec.ts
```

| ID          | Caso              | Resultado esperado |
| ----------- | ----------------- | ------------------ |
| DTO-BLK-001 | blackout válido   | válido             |
| DTO-BLK-002 | sin reason        | 422                |
| DTO-BLK-003 | startAt >= endAt  | 422                |
| DTO-BLK-004 | fecha inválida    | 422                |
| DTO-BLK-005 | cancel sin reason | 422                |

---

## 11.4. Reservation DTOs

Archivo sugerido:

```text id="np2x7n"
reservation.dto.spec.ts
```

| ID          | Caso                                | Resultado esperado    |
| ----------- | ----------------------------------- | --------------------- |
| DTO-RES-001 | reserva admin válida                | válido                |
| DTO-RES-002 | reserva propia válida               | válido                |
| DTO-RES-003 | sin commonAreaId                    | 422                   |
| DTO-RES-004 | sin propertyUnitId en `/me`         | 422                   |
| DTO-RES-005 | startAt >= endAt                    | 422                   |
| DTO-RES-006 | attendeeCount negativo              | 422                   |
| DTO-RES-007 | purpose demasiado largo             | 422                   |
| DTO-RES-008 | notes demasiado largo               | 422                   |
| DTO-RES-009 | body con tenantId                   | 422 o ignorado seguro |
| DTO-RES-010 | body con status manual no permitido | 422                   |

---

## 11.5. Action DTOs

Archivos sugeridos:

```text id="o9gioe"
approve-reservation.dto.spec.ts
reject-reservation.dto.spec.ts
cancel-reservation.dto.spec.ts
```

| ID          | Caso                       | Resultado esperado |
| ----------- | -------------------------- | ------------------ |
| DTO-ACT-001 | aprobar con notes opcional | válido             |
| DTO-ACT-002 | rechazar con reason        | válido             |
| DTO-ACT-003 | rechazar sin reason        | 422                |
| DTO-ACT-004 | cancelar con reason        | válido             |
| DTO-ACT-005 | cancelar admin sin reason  | 422                |
| DTO-ACT-006 | reason demasiado largo     | 422                |

---

## 11.6. Calendar query DTO

Archivo sugerido:

```text id="b48pti"
calendar-query.dto.spec.ts
```

| ID          | Caso                 | Resultado esperado |
| ----------- | -------------------- | ------------------ |
| DTO-CAL-001 | rango válido 31 días | válido             |
| DTO-CAL-002 | falta dateFrom       | 422                |
| DTO-CAL-003 | falta dateTo         | 422                |
| DTO-CAL-004 | dateFrom > dateTo    | 422                |
| DTO-CAL-005 | rango > 31 días      | 422                |
| DTO-CAL-006 | timezone válida      | válido             |
| DTO-CAL-007 | timezone inválida    | 422                |

---

# 12. Pruebas de servicios de aplicación

## 12.1. CommonAreaService

Archivo sugerido:

```text id="jy1a1g"
common-area.service.spec.ts
```

| ID         | Caso                    | Resultado esperado  |
| ---------- | ----------------------- | ------------------- |
| SRV-CA-001 | crear área válida       | éxito               |
| SRV-CA-002 | duplicar code en tenant | 409                 |
| SRV-CA-003 | duplicar slug en tenant | 409                 |
| SRV-CA-004 | fee config inválida     | 422                 |
| SRV-CA-005 | actualizar área         | éxito               |
| SRV-CA-006 | activar área            | estado active       |
| SRV-CA-007 | desactivar área         | estado inactive     |
| SRV-CA-008 | marcar mantenimiento    | estado maintenance  |
| SRV-CA-009 | archivar área           | archivedAt definido |
| SRV-CA-010 | auditar cambios         | audit event         |

---

## 12.2. CommonAreaAvailabilityService

Archivo sugerido:

```text id="ih81cm"
common-area-availability.service.spec.ts
```

| ID         | Caso                              | Resultado esperado |
| ---------- | --------------------------------- | ------------------ |
| SRV-AV-001 | crear ventana válida              | éxito              |
| SRV-AV-002 | ventana inválida                  | 422                |
| SRV-AV-003 | actualizar ventana                | éxito              |
| SRV-AV-004 | archivar ventana                  | éxito              |
| SRV-AV-005 | resolver disponibilidad por fecha | correcto           |
| SRV-AV-006 | ventana inactiva no disponible    | correcto           |
| SRV-AV-007 | validFrom/validTo aplica          | correcto           |

---

## 12.3. CommonAreaBlackoutService

Archivo sugerido:

```text id="suge7p"
common-area-blackout.service.spec.ts
```

| ID          | Caso                            | Resultado esperado |
| ----------- | ------------------------------- | ------------------ |
| SRV-BLK-001 | crear blackout válido           | éxito              |
| SRV-BLK-002 | blackout sin razón              | 422                |
| SRV-BLK-003 | rango inválido                  | 422                |
| SRV-BLK-004 | cancelar blackout activo        | éxito              |
| SRV-BLK-005 | cancelar blackout ya cancelado  | 409                |
| SRV-BLK-006 | blackout activo bloquea reserva | correcto           |
| SRV-BLK-007 | auditar creación/cancelación    | correcto           |

---

## 12.4. ReservationAvailabilityService

Archivo sugerido:

```text id="dcf6u9"
reservation-availability.service.spec.ts
```

| ID             | Caso                    | Resultado esperado |
| -------------- | ----------------------- | ------------------ |
| SRV-RES-AV-001 | dentro de ventana       | válido             |
| SRV-RES-AV-002 | fuera de ventana        | 422                |
| SRV-RES-AV-003 | sin ventana configurada | 422 según política |
| SRV-RES-AV-004 | duración menor mínimo   | 422                |
| SRV-RES-AV-005 | duración mayor máximo   | 422                |
| SRV-RES-AV-006 | anticipación excedida   | 422                |
| SRV-RES-AV-007 | cruza medianoche        | 422                |

---

## 12.5. ReservationConflictService

Archivo sugerido:

```text id="r0jpda"
reservation-conflict.service.spec.ts
```

| ID           | Caso                               | Resultado esperado |
| ------------ | ---------------------------------- | ------------------ |
| SRV-CONF-001 | no hay conflicto                   | permitido          |
| SRV-CONF-002 | solapamiento exacto                | 409                |
| SRV-CONF-003 | inicio dentro de reserva existente | 409                |
| SRV-CONF-004 | fin dentro de reserva existente    | 409                |
| SRV-CONF-005 | nueva contiene existente           | 409                |
| SRV-CONF-006 | límite endAt = existing.startAt    | permitido          |
| SRV-CONF-007 | límite startAt = existing.endAt    | permitido          |
| SRV-CONF-008 | rejected no bloquea                | permitido          |
| SRV-CONF-009 | cancelled no bloquea               | permitido          |
| SRV-CONF-010 | approved bloquea                   | 409                |
| SRV-CONF-011 | pendingApproval bloquea            | 409                |
| SRV-CONF-012 | requested bloquea                  | 409                |
| SRV-CONF-013 | blackout activo solapado           | 409                |

---

## 12.6. ReservationStateMachineService

Cubierto en sección 10, pero también debe probarse integrado con servicios.

---

## 12.7. ReservationPolicyService

Archivo sugerido:

```text id="wspnm4"
reservation-policy.service.spec.ts
```

| ID          | Caso                          | Resultado esperado    |
| ----------- | ----------------------------- | --------------------- |
| SRV-POL-001 | capacidad válida              | permitido             |
| SRV-POL-002 | capacidad excedida            | 422                   |
| SRV-POL-003 | cancelación dentro del plazo  | permitido             |
| SRV-POL-004 | cancelación fuera del plazo   | 409                   |
| SRV-POL-005 | admin cancela fuera del plazo | permitido con permiso |
| SRV-POL-006 | residente con unidad válida   | permitido             |
| SRV-POL-007 | residente con unidad ajena    | 403                   |

---

## 12.8. ReservationChargeService

Archivo sugerido:

```text id="cklrl7"
reservation-charge.service.spec.ts
```

| ID          | Caso                             | Resultado esperado  |
| ----------- | -------------------------------- | ------------------- |
| SRV-CHG-001 | reserva gratuita no genera cargo | notRequired         |
| SRV-CHG-002 | reserva con pago genera cargo    | chargeGenerated     |
| SRV-CHG-003 | sin concepto financiero          | 422                 |
| SRV-CHG-004 | concepto de otro tenant          | 403                 |
| SRV-CHG-005 | cargo ya existe                  | no duplica          |
| SRV-CHG-006 | idempotency key repetida         | retorna mismo cargo |
| SRV-CHG-007 | fallo financiero                 | error controlado    |
| SRV-CHG-008 | cancelación no revierte cargo    | correcto            |

---

## 12.9. ReservationOwnershipService

Archivo sugerido:

```text id="iuz4cp"
reservation-ownership.service.spec.ts
```

| ID          | Caso                                                 | Resultado esperado       |
| ----------- | ---------------------------------------------------- | ------------------------ |
| SRV-OWN-001 | propietario activo puede reservar                    | permitido                |
| SRV-OWN-002 | residente activo puede reservar                      | permitido según política |
| SRV-OWN-003 | arrendatario activo puede reservar si tenant permite | permitido                |
| SRV-OWN-004 | usuario sin relación con unidad                      | 403                      |
| SRV-OWN-005 | relación inactiva                                    | 403                      |
| SRV-OWN-006 | unidad de otro tenant                                | 403                      |
| SRV-OWN-007 | usuario disabled                                     | 403                      |

---

## 12.10. ReservationCalendarService

Archivo sugerido:

```text id="zoc72t"
reservation-calendar.service.spec.ts
```

| ID          | Caso                                                    | Resultado esperado |
| ----------- | ------------------------------------------------------- | ------------------ |
| SRV-CAL-001 | calendario admin incluye reservas                       | correcto           |
| SRV-CAL-002 | calendario admin incluye blackouts                      | correcto           |
| SRV-CAL-003 | calendario admin incluye disponibilidad                 | correcto           |
| SRV-CAL-004 | calendario propio muestra terceros como busy            | correcto           |
| SRV-CAL-005 | calendario propio muestra propias detalladas            | correcto           |
| SRV-CAL-006 | calendario propio no muestra propertyUnitId de terceros | correcto           |
| SRV-CAL-007 | calendario propio no muestra purpose de terceros        | correcto           |
| SRV-CAL-008 | rango > 31 días                                         | 422                |

---

## 12.11. ReservationAuditService

Archivo sugerido:

```text id="ksp8ae"
reservation-audit.service.spec.ts
```

| ID          | Caso                          | Resultado esperado |
| ----------- | ----------------------------- | ------------------ |
| SRV-AUD-001 | audita creación de área       | correcto           |
| SRV-AUD-002 | audita creación de reserva    | correcto           |
| SRV-AUD-003 | audita aprobación             | correcto           |
| SRV-AUD-004 | audita rechazo                | correcto           |
| SRV-AUD-005 | audita cancelación            | correcto           |
| SRV-AUD-006 | audita cargo generado         | correcto           |
| SRV-AUD-007 | metadata sin payload completo | correcto           |
| SRV-AUD-008 | metadata sin tokens/secrets   | correcto           |

---

# 13. Pruebas de casos de uso

## 13.1. Common Areas

| ID        | Use case                         | Casos mínimos                                 |
| --------- | -------------------------------- | --------------------------------------------- |
| UC-CA-001 | CreateCommonAreaUseCase          | válido, duplicado, tarifa inválida, auditoría |
| UC-CA-002 | ListCommonAreasUseCase           | filtros, paginación, tenant isolation         |
| UC-CA-003 | GetCommonAreaUseCase             | válido, inexistente, otro tenant              |
| UC-CA-004 | UpdateCommonAreaUseCase          | válido, tarifa inválida, auditoría            |
| UC-CA-005 | ActivateCommonAreaUseCase        | cambio de estado, auditoría                   |
| UC-CA-006 | DeactivateCommonAreaUseCase      | no cancela reservas, auditoría                |
| UC-CA-007 | MarkCommonAreaMaintenanceUseCase | requiere razón, auditoría                     |
| UC-CA-008 | ArchiveCommonAreaUseCase         | soft delete, no nuevas reservas               |

---

## 13.2. Availability and Blackouts

| ID         | Use case                         | Casos mínimos                           |
| ---------- | -------------------------------- | --------------------------------------- |
| UC-AV-001  | CreateAvailabilityWindowUseCase  | válida, inválida, otro tenant           |
| UC-AV-002  | UpdateAvailabilityWindowUseCase  | válida, inválida, archivada             |
| UC-AV-003  | ArchiveAvailabilityWindowUseCase | soft archive, auditoría                 |
| UC-BLK-001 | CreateCommonAreaBlackoutUseCase  | válido, rango inválido, razón requerida |
| UC-BLK-002 | CancelCommonAreaBlackoutUseCase  | válido, ya cancelado, auditoría         |

---

## 13.3. Reservations administrativas

| ID         | Use case                         | Casos mínimos                                        |
| ---------- | -------------------------------- | ---------------------------------------------------- |
| UC-RES-001 | CreateReservationUseCase         | válida, conflicto, blackout, fuera de disponibilidad |
| UC-RES-002 | ListReservationsUseCase          | filtros, paginación, tenant isolation                |
| UC-RES-003 | GetReservationUseCase            | válida, inexistente, otro tenant                     |
| UC-RES-004 | ApproveReservationUseCase        | válida, conflicto revalidado, cargo generado         |
| UC-RES-005 | RejectReservationUseCase         | válida, razón requerida, transición inválida         |
| UC-RES-006 | CancelReservationUseCase         | válida, razón requerida, no revierte cargo           |
| UC-RES-007 | CompleteReservationUseCase       | válida, transición inválida                          |
| UC-RES-008 | MarkReservationNoShowUseCase     | válida, transición inválida                          |
| UC-RES-009 | GenerateReservationChargeUseCase | idempotente, sin concepto, fallo financiero          |

---

## 13.4. Reservations propias

| ID            | Use case                    | Casos mínimos                                  |
| ------------- | --------------------------- | ---------------------------------------------- |
| UC-ME-RES-001 | CreateOwnReservationUseCase | válida, unidad ajena, sin permiso, conflicto   |
| UC-ME-RES-002 | ListOwnReservationsUseCase  | solo propias, filtros, no terceros             |
| UC-ME-RES-003 | GetOwnReservationUseCase    | propia válida, ajena 403/404                   |
| UC-ME-RES-004 | CancelOwnReservationUseCase | válida, fuera de plazo, ajena, estado inválido |

---

## 13.5. Calendar

| ID         | Use case                        | Casos mínimos                 |
| ---------- | ------------------------------- | ----------------------------- |
| UC-CAL-001 | GetCommonAreaCalendarUseCase    | admin ve detalle permitido    |
| UC-CAL-002 | GetOwnCommonAreaCalendarUseCase | usuario ve terceros como busy |
| UC-CAL-003 | Calendar range validation       | máximo 31 días                |
| UC-CAL-004 | Calendar tenant isolation       | no mezcla tenant B            |

---

# 14. Pruebas de repositorios

## 14.1. CommonArea repository

Archivo sugerido:

```text id="vn4l45"
prisma-common-area.repository.spec.ts
```

| ID         | Caso                           | Resultado esperado |
| ---------- | ------------------------------ | ------------------ |
| INT-CA-001 | create area                    | persiste           |
| INT-CA-002 | list by tenant                 | solo tenant        |
| INT-CA-003 | find by id + tenant            | correcto           |
| INT-CA-004 | find by slug + tenant          | correcto           |
| INT-CA-005 | duplicate code same tenant     | constraint/409     |
| INT-CA-006 | duplicate slug same tenant     | constraint/409     |
| INT-CA-007 | same code different tenant     | permitido          |
| INT-CA-008 | archived not listed by default | correcto           |
| INT-CA-009 | public list only active/public | correcto           |

---

## 14.2. Availability repository

Archivo sugerido:

```text id="l5ppdd"
prisma-availability.repository.spec.ts
```

| ID         | Caso                  | Resultado esperado |
| ---------- | --------------------- | ------------------ |
| INT-AV-001 | create window         | persiste           |
| INT-AV-002 | list by commonArea    | correcto           |
| INT-AV-003 | active windows by day | correcto           |
| INT-AV-004 | inactive excluded     | correcto           |
| INT-AV-005 | archived excluded     | correcto           |
| INT-AV-006 | tenant isolation      | correcto           |

---

## 14.3. Blackout repository

Archivo sugerido:

```text id="y1933e"
prisma-blackout.repository.spec.ts
```

| ID          | Caso                      | Resultado esperado |
| ----------- | ------------------------- | ------------------ |
| INT-BLK-001 | create blackout           | persiste           |
| INT-BLK-002 | list by commonArea        | correcto           |
| INT-BLK-003 | find conflicting blackout | detecta            |
| INT-BLK-004 | cancelled not conflicting | correcto           |
| INT-BLK-005 | archived not conflicting  | correcto           |
| INT-BLK-006 | tenant isolation          | correcto           |

---

## 14.4. Reservation repository

Archivo sugerido:

```text id="qkbj8a"
prisma-reservation.repository.spec.ts
```

| ID          | Caso                      | Resultado esperado |
| ----------- | ------------------------- | ------------------ |
| INT-RES-001 | create reservation        | persiste           |
| INT-RES-002 | find by id + tenant       | correcto           |
| INT-RES-003 | list by tenant            | correcto           |
| INT-RES-004 | list own by unit/user     | correcto           |
| INT-RES-005 | find conflict             | correcto           |
| INT-RES-006 | rejected not conflicting  | correcto           |
| INT-RES-007 | cancelled not conflicting | correcto           |
| INT-RES-008 | attach charge             | persiste chargeId  |
| INT-RES-009 | chargeId unique           | constraint         |
| INT-RES-010 | create status history     | persiste           |
| INT-RES-011 | calendar query            | correcto           |
| INT-RES-012 | tenant isolation          | correcto           |

---

# 15. Pruebas API — Common Areas

## 15.1. `GET /api/v1/tenant/common-areas`

| ID              | Caso                | Resultado esperado |
| --------------- | ------------------- | ------------------ |
| API-CA-LIST-001 | usuario con permiso | 200                |
| API-CA-LIST-002 | sin token           | 401                |
| API-CA-LIST-003 | sin permiso         | 403                |
| API-CA-LIST-004 | filtra status       | correcto           |
| API-CA-LIST-005 | filtra type         | correcto           |
| API-CA-LIST-006 | pagina              | correcto           |
| API-CA-LIST-007 | no muestra tenant B | correcto           |

---

## 15.2. `POST /api/v1/tenant/common-areas`

| ID                | Caso              | Resultado esperado    |
| ----------------- | ----------------- | --------------------- |
| API-CA-CREATE-001 | body válido       | 201                   |
| API-CA-CREATE-002 | sin token         | 401                   |
| API-CA-CREATE-003 | sin permiso       | 403                   |
| API-CA-CREATE-004 | code duplicado    | 409                   |
| API-CA-CREATE-005 | slug duplicado    | 409                   |
| API-CA-CREATE-006 | tarifa inválida   | 422                   |
| API-CA-CREATE-007 | body con tenantId | 422 o ignorado seguro |
| API-CA-CREATE-008 | audit event       | generado              |

---

## 15.3. `GET/PATCH /api/v1/tenant/common-areas/{commonAreaId}`

| ID               | Caso                | Resultado esperado |
| ---------------- | ------------------- | ------------------ |
| API-CA-GET-001   | obtener existente   | 200                |
| API-CA-GET-002   | área inexistente    | 404                |
| API-CA-GET-003   | área de otro tenant | 404/403            |
| API-CA-PATCH-001 | actualizar válida   | 200                |
| API-CA-PATCH-002 | sin permiso         | 403                |
| API-CA-PATCH-003 | fee inválido        | 422                |
| API-CA-PATCH-004 | audit event         | generado           |

---

## 15.4. Acciones de estado de área

| ID               | Endpoint         | Resultado esperado       |
| ---------------- | ---------------- | ------------------------ |
| API-CA-ACT-001   | activate         | 200, status active       |
| API-CA-DEACT-001 | deactivate       | 200, status inactive     |
| API-CA-MAINT-001 | mark-maintenance | 200, status maintenance  |
| API-CA-ARCH-001  | archive          | 200, archivedAt definido |
| API-CA-STATE-001 | sin permiso      | 403                      |
| API-CA-STATE-002 | otro tenant      | 404/403                  |
| API-CA-STATE-003 | audit event      | generado                 |

---

# 16. Pruebas API — Availability

| ID         | Endpoint                              | Caso                           | Resultado esperado |
| ---------- | ------------------------------------- | ------------------------------ | ------------------ |
| API-AV-001 | GET availability-windows              | usuario con permiso            | 200                |
| API-AV-002 | POST availability-windows             | body válido                    | 201                |
| API-AV-003 | POST availability-windows             | startTime >= endTime           | 422                |
| API-AV-004 | PATCH availability-windows/{windowId} | update válido                  | 200                |
| API-AV-005 | archive window                        | válido                         | 200                |
| API-AV-006 | cualquier endpoint                    | área otro tenant               | 404/403            |
| API-AV-007 | POST/PATCH/archive                    | sin permiso manageAvailability | 403                |
| API-AV-008 | cambios                               | audit event                    | generado           |

---

# 17. Pruebas API — Blackouts

| ID          | Endpoint           | Caso                | Resultado esperado |
| ----------- | ------------------ | ------------------- | ------------------ |
| API-BLK-001 | GET blackouts      | usuario con permiso | 200                |
| API-BLK-002 | POST blackouts     | body válido         | 201                |
| API-BLK-003 | POST blackouts     | sin reason          | 422                |
| API-BLK-004 | POST blackouts     | startAt >= endAt    | 422                |
| API-BLK-005 | cancel blackout    | válido              | 200                |
| API-BLK-006 | cancel blackout    | ya cancelado        | 409                |
| API-BLK-007 | cualquier endpoint | área otro tenant    | 404/403            |
| API-BLK-008 | POST/cancel        | sin manageBlackouts | 403                |
| API-BLK-009 | cambios            | audit event         | generado           |

---

# 18. Pruebas API — Reservations administrativas

## 18.1. Listar y obtener

| ID               | Endpoint         | Caso                  | Resultado esperado |
| ---------------- | ---------------- | --------------------- | ------------------ |
| API-RES-LIST-001 | GET reservations | con permiso           | 200                |
| API-RES-LIST-002 | GET reservations | sin permiso           | 403                |
| API-RES-LIST-003 | GET reservations | filtra status         | correcto           |
| API-RES-LIST-004 | GET reservations | filtra commonAreaId   | correcto           |
| API-RES-LIST-005 | GET reservations | filtra propertyUnitId | correcto           |
| API-RES-LIST-006 | GET reservations | no muestra tenant B   | correcto           |
| API-RES-GET-001  | GET reservation  | existente             | 200                |
| API-RES-GET-002  | GET reservation  | inexistente           | 404                |
| API-RES-GET-003  | GET reservation  | otro tenant           | 404/403            |

---

## 18.2. Crear reserva administrativa

| ID                 | Caso                    | Resultado esperado    |
| ------------------ | ----------------------- | --------------------- |
| API-RES-CREATE-001 | reserva válida          | 201                   |
| API-RES-CREATE-002 | sin token               | 401                   |
| API-RES-CREATE-003 | sin permiso             | 403                   |
| API-RES-CREATE-004 | área inactiva           | 422                   |
| API-RES-CREATE-005 | área maintenance        | 422                   |
| API-RES-CREATE-006 | área no reservable      | 422                   |
| API-RES-CREATE-007 | unidad otro tenant      | 403                   |
| API-RES-CREATE-008 | fuera de disponibilidad | 422                   |
| API-RES-CREATE-009 | sobre blackout          | 409                   |
| API-RES-CREATE-010 | solapada                | 409                   |
| API-RES-CREATE-011 | capacidad excedida      | 422                   |
| API-RES-CREATE-012 | body con tenantId       | 422 o ignorado seguro |
| API-RES-CREATE-013 | audit event             | generado              |

---

## 18.3. Aprobar reserva

| ID              | Caso                          | Resultado esperado |
| --------------- | ----------------------------- | ------------------ |
| API-RES-APP-001 | aprobar pendingApproval       | 200                |
| API-RES-APP-002 | sin permiso                   | 403                |
| API-RES-APP-003 | reserva cancelada             | 409                |
| API-RES-APP-004 | revalida conflicto            | 409                |
| API-RES-APP-005 | genera cargo si requiere pago | chargeGenerated    |
| API-RES-APP-006 | no genera cargo si gratuita   | notRequired        |
| API-RES-APP-007 | registra status history       | correcto           |
| API-RES-APP-008 | audit event                   | generado           |

---

## 18.4. Rechazar reserva

| ID              | Caso                               | Resultado esperado |
| --------------- | ---------------------------------- | ------------------ |
| API-RES-REJ-001 | rechazar pendingApproval con razón | 200                |
| API-RES-REJ-002 | sin razón                          | 422                |
| API-RES-REJ-003 | rechazar approved                  | 409                |
| API-RES-REJ-004 | sin permiso                        | 403                |
| API-RES-REJ-005 | status history                     | creado             |
| API-RES-REJ-006 | audit event                        | generado           |

---

## 18.5. Cancelar, completar y no show

| ID               | Endpoint     | Caso                       | Resultado esperado |
| ---------------- | ------------ | -------------------------- | ------------------ |
| API-RES-CAN-001  | cancel       | requested/pending/approved | 200                |
| API-RES-CAN-002  | cancel       | completed                  | 409                |
| API-RES-CAN-003  | cancel       | sin razón admin            | 422                |
| API-RES-CAN-004  | cancel       | con cargo                  | no revierte cargo  |
| API-RES-COMP-001 | complete     | approved                   | 200                |
| API-RES-COMP-002 | complete     | cancelled                  | 409                |
| API-RES-NS-001   | mark-no-show | approved                   | 200                |
| API-RES-NS-002   | mark-no-show | completed                  | 409                |
| API-RES-ACT-001  | todas        | sin permiso                | 403                |
| API-RES-ACT-002  | todas        | audit event                | generado           |

---

## 18.6. Generar cargo

| ID              | Caso                 | Resultado esperado               |
| --------------- | -------------------- | -------------------------------- |
| API-RES-CHG-001 | reserva con pago     | 200                              |
| API-RES-CHG-002 | reserva gratuita     | 422 o noRequired según política  |
| API-RES-CHG-003 | sin concepto         | 422                              |
| API-RES-CHG-004 | concepto otro tenant | 403                              |
| API-RES-CHG-005 | cargo ya generado    | 200 mismo cargo o 409 controlado |
| API-RES-CHG-006 | sin permiso          | 403                              |
| API-RES-CHG-007 | no crea pago         | correcto                         |
| API-RES-CHG-008 | audit event          | generado                         |

---

# 19. Pruebas API — Reservations propias `/me`

## 19.1. `GET /api/v1/me/reservations`

| ID              | Caso                          | Resultado esperado |
| --------------- | ----------------------------- | ------------------ |
| API-ME-LIST-001 | usuario con reservas propias  | 200                |
| API-ME-LIST-002 | solo muestra unidades propias | correcto           |
| API-ME-LIST-003 | no muestra tenant B           | correcto           |
| API-ME-LIST-004 | filtra propertyUnitId propio  | correcto           |
| API-ME-LIST-005 | filtra propertyUnitId ajeno   | 403                |
| API-ME-LIST-006 | sin permiso                   | 403                |
| API-ME-LIST-007 | sin token                     | 401                |

---

## 19.2. `POST /api/v1/me/reservations`

| ID                | Caso                   | Resultado esperado |
| ----------------- | ---------------------- | ------------------ |
| API-ME-CREATE-001 | reserva propia válida  | 201                |
| API-ME-CREATE-002 | unidad ajena           | 403                |
| API-ME-CREATE-003 | unidad otro tenant     | 403                |
| API-ME-CREATE-004 | área no reservable     | 422                |
| API-ME-CREATE-005 | fuera disponibilidad   | 422                |
| API-ME-CREATE-006 | conflicto              | 409                |
| API-ME-CREATE-007 | blackout               | 409                |
| API-ME-CREATE-008 | sin permiso create.own | 403                |
| API-ME-CREATE-009 | usuario disabled       | 403                |
| API-ME-CREATE-010 | audit event            | generado           |

---

## 19.3. `GET /api/v1/me/reservations/{reservationId}`

| ID             | Caso                       | Resultado esperado |
| -------------- | -------------------------- | ------------------ |
| API-ME-GET-001 | reserva propia             | 200                |
| API-ME-GET-002 | reserva ajena mismo tenant | 403/404            |
| API-ME-GET-003 | reserva otro tenant        | 403/404            |
| API-ME-GET-004 | no expone terceros         | correcto           |
| API-ME-GET-005 | sin permiso                | 403                |

---

## 19.4. `POST /api/v1/me/reservations/{reservationId}/cancel`

| ID             | Caso                                | Resultado esperado |
| -------------- | ----------------------------------- | ------------------ |
| API-ME-CAN-001 | cancelación propia dentro del plazo | 200                |
| API-ME-CAN-002 | cancelación fuera del plazo         | 409                |
| API-ME-CAN-003 | reserva ajena                       | 403/404            |
| API-ME-CAN-004 | reserva completed                   | 409                |
| API-ME-CAN-005 | con cargo                           | no revierte cargo  |
| API-ME-CAN-006 | status history                      | creado             |
| API-ME-CAN-007 | audit event                         | generado           |

---

# 20. Pruebas API — Calendar

## 20.1. Calendario administrativo

Endpoint:

```text id="ihpf07"
GET /api/v1/tenant/common-areas/{commonAreaId}/calendar
```

| ID              | Caso                         | Resultado esperado |
| --------------- | ---------------------------- | ------------------ |
| API-CAL-ADM-001 | rango válido                 | 200                |
| API-CAL-ADM-002 | rango > 31 días              | 422                |
| API-CAL-ADM-003 | área inexistente             | 404                |
| API-CAL-ADM-004 | área otro tenant             | 404/403            |
| API-CAL-ADM-005 | incluye availability         | correcto           |
| API-CAL-ADM-006 | incluye blackouts            | correcto           |
| API-CAL-ADM-007 | incluye reservas bloqueantes | correcto           |
| API-CAL-ADM-008 | filtra tenant                | correcto           |
| API-CAL-ADM-009 | sin permiso                  | 403                |

---

## 20.2. Calendario propio

Endpoint:

```text id="devng7"
GET /api/v1/me/common-areas/{commonAreaId}/calendar
```

| ID             | Caso                                 | Resultado esperado |
| -------------- | ------------------------------------ | ------------------ |
| API-CAL-ME-001 | rango válido                         | 200                |
| API-CAL-ME-002 | reserva propia detallada             | correcto           |
| API-CAL-ME-003 | reserva de tercero como busy         | correcto           |
| API-CAL-ME-004 | no expone propertyUnitId de tercero  | correcto           |
| API-CAL-ME-005 | no expone purpose de tercero         | correcto           |
| API-CAL-ME-006 | no expone requesterUserId de tercero | correcto           |
| API-CAL-ME-007 | rango > 31 días                      | 422                |
| API-CAL-ME-008 | sin permiso                          | 403                |

---

# 21. Pruebas API — Public Common Areas / WordPress

Endpoints:

```text id="fy2t0p"
GET /api/v1/public/tenants/{slug}/common-areas
GET /api/v1/public/tenants/{slug}/common-areas/{commonAreaSlug}
```

| ID             | Caso                           | Resultado esperado |
| -------------- | ------------------------------ | ------------------ |
| API-PUB-CA-001 | lista áreas activas públicas   | 200                |
| API-PUB-CA-002 | excluye áreas privadas         | correcto           |
| API-PUB-CA-003 | excluye áreas inactivas        | correcto           |
| API-PUB-CA-004 | excluye maintenance            | correcto           |
| API-PUB-CA-005 | detalle área pública           | 200                |
| API-PUB-CA-006 | detalle área privada           | 404                |
| API-PUB-CA-007 | no devuelve reservas           | correcto           |
| API-PUB-CA-008 | no devuelve calendario         | correcto           |
| API-PUB-CA-009 | no devuelve blackouts internos | correcto           |
| API-PUB-CA-010 | no devuelve internalRules      | correcto           |
| API-PUB-CA-011 | no devuelve chargeId           | correcto           |
| API-PUB-CA-012 | no devuelve requester data     | correcto           |
| API-PUB-CA-013 | respeta CORS/rate/cache de 009 | correcto           |

---

# 22. Pruebas de autorización

## 22.1. Common Areas

| ID          | Usuario               | Acción      | Resultado |
| ----------- | --------------------- | ----------- | --------- |
| AUTH-CA-001 | tenantAdminA          | create      | 201       |
| AUTH-CA-002 | reservationManagerA   | read        | 200       |
| AUTH-CA-003 | userWithoutPermission | create      | 403       |
| AUTH-CA-004 | tenantAdminB          | read área A | 403/404   |
| AUTH-CA-005 | anonymousUser         | read admin  | 401       |
| AUTH-CA-006 | disabledUser          | read admin  | 403       |

---

## 22.2. Reservations administrativas

| ID           | Usuario                      | Acción                          | Resultado |
| ------------ | ---------------------------- | ------------------------------- | --------- |
| AUTH-RES-001 | reservationManagerA          | approve                         | 200       |
| AUTH-RES-002 | reservationManagerA          | reject                          | 200       |
| AUTH-RES-003 | reservationManagerA          | cancel                          | 200       |
| AUTH-RES-004 | treasurerA                   | generateCharge si tiene permiso | 200       |
| AUTH-RES-005 | tenantUserWithoutPermissionA | approve                         | 403       |
| AUTH-RES-006 | tenantAdminB                 | approve reserva A               | 403/404   |

---

## 22.3. Reservations propias

| ID          | Usuario               | Acción                   | Resultado               |
| ----------- | --------------------- | ------------------------ | ----------------------- |
| AUTH-ME-001 | ownerUserA            | create own for unit A101 | 201                     |
| AUTH-ME-002 | residentUserA         | create own for unit A101 | 201 si política permite |
| AUTH-ME-003 | ownerUserA            | create own for unit B201 | 403                     |
| AUTH-ME-004 | ownerUserA            | get reserva ajena        | 403/404                 |
| AUTH-ME-005 | ownerUserA            | cancel reserva ajena     | 403/404                 |
| AUTH-ME-006 | userWithoutPermission | create own               | 403                     |

---

# 23. Pruebas multitenant

| ID         | Caso                                           | Resultado esperado |
| ---------- | ---------------------------------------------- | ------------------ |
| MT-RES-001 | Tenant A lista áreas                           | no ve Tenant B     |
| MT-RES-002 | Tenant A lista reservas                        | no ve Tenant B     |
| MT-RES-003 | Tenant A obtiene areaId de B                   | 404/403            |
| MT-RES-004 | Tenant A crea reserva con commonAreaId B       | 403/404            |
| MT-RES-005 | Tenant A usa propertyUnitId B                  | 403                |
| MT-RES-006 | Tenant A usa chargeConceptId B                 | 403                |
| MT-RES-007 | Tenant A usa chargeId B                        | 403                |
| MT-RES-008 | Calendar A no incluye reservas B               | correcto           |
| MT-RES-009 | Public common areas slug A no devuelve áreas B | correcto           |
| MT-RES-010 | Status history A no se mezcla con B            | correcto           |
| MT-RES-011 | Audit metadata mantiene tenant correcto        | correcto           |

---

# 24. Pruebas de concurrencia

## 24.1. Creación simultánea

| ID           | Caso                                      | Resultado esperado |
| ------------ | ----------------------------------------- | ------------------ |
| CONC-RES-001 | dos reservas simultáneas mismo rango      | solo una se crea   |
| CONC-RES-002 | dos reservas simultáneas solapadas        | una 201, otra 409  |
| CONC-RES-003 | dos reservas simultáneas contiguas        | ambas permitidas   |
| CONC-RES-004 | reservas simultáneas en áreas distintas   | ambas permitidas   |
| CONC-RES-005 | reservas simultáneas en tenants distintos | ambas permitidas   |

---

## 24.2. Aprobación simultánea

| ID           | Caso                                                 | Resultado esperado       |
| ------------ | ---------------------------------------------------- | ------------------------ |
| CONC-APP-001 | dos pending solapadas, aprobar ambas simultáneamente | solo una approved        |
| CONC-APP-002 | approve revalida conflicto                           | 409 si conflicto aparece |
| CONC-APP-003 | approve + blackout simultáneo                        | resultado consistente    |
| CONC-APP-004 | approve + cancel simultáneo misma reserva            | una transición válida    |

---

## 24.3. Generación de cargo simultánea

| ID           | Caso                                     | Resultado esperado  |
| ------------ | ---------------------------------------- | ------------------- |
| CONC-CHG-001 | dos generate-charge simultáneos          | un solo cargo       |
| CONC-CHG-002 | misma Idempotency-Key                    | retorna mismo cargo |
| CONC-CHG-003 | sin Idempotency-Key pero chargeId existe | no duplica          |
| CONC-CHG-004 | fallo parcial financiero                 | no deja duplicados  |

---

# 25. Pruebas financieras de regresión

| ID          | Caso                                                 | Resultado esperado |
| ----------- | ---------------------------------------------------- | ------------------ |
| FIN-RES-001 | feeAmount se guarda Decimal                          | correcto           |
| FIN-RES-002 | feeAmount sale como string                           | correcto           |
| FIN-RES-003 | requiresPayment true exige feeAmount > 0             | 422                |
| FIN-RES-004 | requiresPayment true exige feeChargeConceptId        | 422                |
| FIN-RES-005 | cargo generado al aprobar                            | correcto           |
| FIN-RES-006 | cargo pertenece al tenant                            | correcto           |
| FIN-RES-007 | cargo pertenece a propertyUnit                       | correcto           |
| FIN-RES-008 | cargo usa concepto correcto                          | correcto           |
| FIN-RES-009 | cargo se genera una sola vez                         | correcto           |
| FIN-RES-010 | cancelación no revierte cargo                        | correcto           |
| FIN-RES-011 | reservas no confirman pagos                          | correcto           |
| FIN-RES-012 | reservas no asignan pagos                            | correcto           |
| FIN-RES-013 | reservas no modifican comprobantes                   | correcto           |
| FIN-RES-014 | paymentStatusSnapshot no reemplaza fuente financiera | correcto           |

---

# 26. Pruebas de auditoría

| ID          | Caso                          | Evento esperado                   |
| ----------- | ----------------------------- | --------------------------------- |
| AUD-CA-001  | crear área                    | `commonArea.created`              |
| AUD-CA-002  | actualizar área               | `commonArea.updated`              |
| AUD-CA-003  | activar área                  | `commonArea.activated`            |
| AUD-CA-004  | desactivar área               | `commonArea.deactivated`          |
| AUD-CA-005  | mantenimiento                 | `commonArea.markedMaintenance`    |
| AUD-CA-006  | archivar área                 | `commonArea.archived`             |
| AUD-AV-001  | crear ventana                 | `commonAreaAvailability.created`  |
| AUD-AV-002  | actualizar ventana            | `commonAreaAvailability.updated`  |
| AUD-AV-003  | archivar ventana              | `commonAreaAvailability.archived` |
| AUD-BLK-001 | crear blackout                | `commonAreaBlackout.created`      |
| AUD-BLK-002 | cancelar blackout             | `commonAreaBlackout.cancelled`    |
| AUD-RES-001 | crear reserva                 | `reservation.created`             |
| AUD-RES-002 | solicitar reserva             | `reservation.requested`           |
| AUD-RES-003 | aprobar reserva               | `reservation.approved`            |
| AUD-RES-004 | rechazar reserva              | `reservation.rejected`            |
| AUD-RES-005 | cancelar reserva              | `reservation.cancelled`           |
| AUD-RES-006 | completar reserva             | `reservation.completed`           |
| AUD-RES-007 | marcar no show                | `reservation.noShow`              |
| AUD-RES-008 | generar cargo                 | `reservation.chargeGenerated`     |
| AUD-RES-009 | conflicto detectado relevante | `reservation.conflictDetected`    |
| AUD-SEC-001 | metadata sin payload completo | pasa                              |
| AUD-SEC-002 | metadata sin tokens/secrets   | pasa                              |

---

# 27. Pruebas de observabilidad

| ID          | Caso                                 | Resultado esperado |
| ----------- | ------------------------------------ | ------------------ |
| OBS-RES-001 | commonArea.created log               | generado           |
| OBS-RES-002 | reservation.created log              | generado           |
| OBS-RES-003 | reservation.conflictDetected log     | generado           |
| OBS-RES-004 | calendar.query.executed log          | generado           |
| OBS-RES-005 | charge generation failed log         | generado           |
| OBS-RES-006 | logs sin tokens                      | correcto           |
| OBS-RES-007 | logs sin datos personales extensos   | correcto           |
| OBS-RES-008 | métricas reservations_created_total  | incrementa         |
| OBS-RES-009 | métricas reservations_conflict_total | incrementa         |
| OBS-RES-010 | métricas calendar latency            | registra           |
| OBS-RES-011 | métricas no usan tenantId            | correcto           |
| OBS-RES-012 | métricas no usan reservationId       | correcto           |
| OBS-RES-013 | métricas no usan userId/personId     | correcto           |

---

# 28. Pruebas OpenAPI

| ID           | Caso                                       | Resultado esperado |
| ------------ | ------------------------------------------ | ------------------ |
| OAPI-RES-001 | Common Areas documentado                   | pasa               |
| OAPI-RES-002 | Availability documentado                   | pasa               |
| OAPI-RES-003 | Blackouts documentado                      | pasa               |
| OAPI-RES-004 | Reservations admin documentado             | pasa               |
| OAPI-RES-005 | My Reservations documentado                | pasa               |
| OAPI-RES-006 | Calendar documentado                       | pasa               |
| OAPI-RES-007 | Public Common Areas documentado            | pasa               |
| OAPI-RES-008 | permisos documentados                      | pasa               |
| OAPI-RES-009 | errores documentados                       | pasa               |
| OAPI-RES-010 | money como string                          | pasa               |
| OAPI-RES-011 | no endpoint público de creación de reserva | pasa               |
| OAPI-RES-012 | no endpoint público de calendario          | pasa               |
| OAPI-RES-013 | no endpoint público de pagos               | pasa               |
| OAPI-RES-014 | extensiones x-tenant-scope                 | pasa               |
| OAPI-RES-015 | extensiones x-own-resource                 | pasa               |
| OAPI-RES-016 | extensiones x-public-safe                  | pasa               |

---

# 29. Pruebas de seguridad

## 29.1. No cross-tenant

```text id="nqm7pt"
SEC-MT-001 a SEC-MT-011
```

Debe garantizar:

* no áreas de otro tenant;
* no reservas de otro tenant;
* no unidades de otro tenant;
* no conceptos de otro tenant;
* no cargos de otro tenant;
* no historial de otro tenant.

---

## 29.2. No acceso a unidad ajena

```text id="d99zi4"
SEC-OWN-001: propietario no reserva unidad ajena.
SEC-OWN-002: residente no reserva unidad ajena.
SEC-OWN-003: usuario sin relación activa no reserva.
SEC-OWN-004: relación inactiva no reserva.
SEC-OWN-005: usuario no cancela reserva ajena.
SEC-OWN-006: usuario no lee reserva ajena.
```

---

## 29.3. No exposición de terceros en calendario propio

```text id="g1t3af"
SEC-CAL-001: no requesterUserId de terceros.
SEC-CAL-002: no requesterPersonId de terceros.
SEC-CAL-003: no propertyUnitId de terceros.
SEC-CAL-004: no propertyUnitCode de terceros.
SEC-CAL-005: no purpose de terceros.
SEC-CAL-006: no notes de terceros.
SEC-CAL-007: terceros aparecen como busy.
```

---

## 29.4. No exposición pública WordPress

```text id="hmmsqq"
SEC-PUB-001: no reservations.
SEC-PUB-002: no calendar.
SEC-PUB-003: no blackouts internos.
SEC-PUB-004: no availability completa.
SEC-PUB-005: no internalRules.
SEC-PUB-006: no requester data.
SEC-PUB-007: no propertyUnitId.
SEC-PUB-008: no chargeId.
SEC-PUB-009: no paymentStatusSnapshot.
SEC-PUB-010: no audit data.
```

---

## 29.5. No manipulación financiera

```text id="qxe0cq"
SEC-FIN-001: reservas no confirman pagos.
SEC-FIN-002: reservas no asignan pagos.
SEC-FIN-003: reservas no modifican comprobantes.
SEC-FIN-004: reservas no revierten cargos automáticamente.
SEC-FIN-005: no float money.
SEC-FIN-006: cargo idempotente.
```

---

# 30. Smoke tests

Smoke tests post-deploy:

| ID            | Caso                         | Resultado esperado |
| ------------- | ---------------------------- | ------------------ |
| SMOKE-RES-001 | `GET /api/v1/health`         | 200                |
| SMOKE-RES-002 | listar áreas tenant          | 200                |
| SMOKE-RES-003 | crear área demo              | 201                |
| SMOKE-RES-004 | crear ventana disponibilidad | 201                |
| SMOKE-RES-005 | crear reserva válida         | 201                |
| SMOKE-RES-006 | crear reserva solapada       | 409                |
| SMOKE-RES-007 | aprobar reserva              | 200                |
| SMOKE-RES-008 | listar mis reservas          | 200                |
| SMOKE-RES-009 | calendario admin             | 200                |
| SMOKE-RES-010 | calendario propio            | 200                |
| SMOKE-RES-011 | public common areas          | 200                |
| SMOKE-RES-012 | endpoint admin sin token     | 401                |
| SMOKE-RES-013 | error incluye traceId        | pasa               |

---

# 31. Organización de archivos de prueba

```text id="hdzny7"
apps/api/src/modules/reservations/tests/
├── unit/
│   ├── common-area-code.vo.spec.ts
│   ├── common-area-status.vo.spec.ts
│   ├── common-area-type.vo.spec.ts
│   ├── reservation-status.vo.spec.ts
│   ├── reservation-time-range.vo.spec.ts
│   ├── reservation-duration.vo.spec.ts
│   ├── reservation-money.vo.spec.ts
│   ├── attendee-count.vo.spec.ts
│   ├── day-of-week.vo.spec.ts
│   ├── time-of-day.vo.spec.ts
│   ├── common-area.entity.spec.ts
│   ├── common-area-availability-window.entity.spec.ts
│   ├── common-area-blackout.entity.spec.ts
│   ├── reservation.entity.spec.ts
│   └── reservation-status-history.entity.spec.ts
│
├── application/
│   ├── common-area.service.spec.ts
│   ├── common-area-availability.service.spec.ts
│   ├── common-area-blackout.service.spec.ts
│   ├── reservation-availability.service.spec.ts
│   ├── reservation-conflict.service.spec.ts
│   ├── reservation-state-machine.service.spec.ts
│   ├── reservation-policy.service.spec.ts
│   ├── reservation-charge.service.spec.ts
│   ├── reservation-ownership.service.spec.ts
│   ├── reservation-calendar.service.spec.ts
│   └── reservation-audit.service.spec.ts
│
├── use-cases/
│   ├── create-common-area.use-case.spec.ts
│   ├── list-common-areas.use-case.spec.ts
│   ├── update-common-area.use-case.spec.ts
│   ├── create-availability-window.use-case.spec.ts
│   ├── create-common-area-blackout.use-case.spec.ts
│   ├── create-reservation.use-case.spec.ts
│   ├── create-own-reservation.use-case.spec.ts
│   ├── approve-reservation.use-case.spec.ts
│   ├── reject-reservation.use-case.spec.ts
│   ├── cancel-reservation.use-case.spec.ts
│   ├── cancel-own-reservation.use-case.spec.ts
│   ├── complete-reservation.use-case.spec.ts
│   ├── mark-reservation-no-show.use-case.spec.ts
│   ├── generate-reservation-charge.use-case.spec.ts
│   ├── get-common-area-calendar.use-case.spec.ts
│   └── get-own-common-area-calendar.use-case.spec.ts
│
├── integration/
│   ├── prisma-common-area.repository.spec.ts
│   ├── prisma-availability.repository.spec.ts
│   ├── prisma-blackout.repository.spec.ts
│   ├── prisma-reservation.repository.spec.ts
│   └── reservation-status-history.repository.spec.ts
│
├── api/
│   ├── common-areas.api.spec.ts
│   ├── availability-windows.api.spec.ts
│   ├── blackouts.api.spec.ts
│   ├── reservations-admin.api.spec.ts
│   ├── reservations-own.api.spec.ts
│   ├── calendar.api.spec.ts
│   └── public-common-areas.api.spec.ts
│
├── authorization/
│   ├── common-areas.authorization.spec.ts
│   ├── reservations-admin.authorization.spec.ts
│   └── reservations-own.authorization.spec.ts
│
├── multitenancy/
│   └── reservations.multitenancy.spec.ts
│
├── concurrency/
│   ├── reservation-create.concurrency.spec.ts
│   ├── reservation-approve.concurrency.spec.ts
│   └── reservation-charge.concurrency.spec.ts
│
├── financial/
│   └── reservation-financial-regression.spec.ts
│
├── calendar/
│   └── reservation-calendar-privacy.spec.ts
│
├── security/
│   ├── reservation-own-resource.security.spec.ts
│   ├── reservation-public-wordpress.security.spec.ts
│   ├── reservation-no-financial-mutation.security.spec.ts
│   └── reservation-no-private-data-exposure.security.spec.ts
│
├── audit/
│   └── reservation-audit.integration.spec.ts
│
├── observability/
│   └── reservation-observability.spec.ts
│
└── openapi/
    └── reservations.openapi.spec.ts
```

---

# 32. Comandos esperados

Comandos específicos sugeridos:

```bash id="m3qsb3"
npm run test:reservations
npm run test:reservations:unit
npm run test:reservations:application
npm run test:reservations:integration
npm run test:reservations:api
npm run test:reservations:authorization
npm run test:reservations:multitenancy
npm run test:reservations:concurrency
npm run test:reservations:financial
npm run test:reservations:calendar
npm run test:reservations:security
npm run test:reservations:audit
npm run test:reservations:openapi
```

Comandos generales:

```bash id="zl7ct5"
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

# 33. Requisitos para CI

En pull request deben correr como mínimo:

```text id="yn1b9l"
lint
typecheck
unit tests
DTO validation tests
application tests
repository integration tests críticos
API tests críticos
authorization tests
own-resource tests
multitenancy tests
conflict detection tests
financial regression tests
calendar privacy tests
audit integration tests
OpenAPI validation
build
```

Antes de producción:

```text id="yazoiq"
full reservations test suite
full concurrency tests
full security tests
full financial regression tests
full calendar privacy tests
smoke tests staging
WordPress public catalog verification
```

---

# 34. Gates de calidad

No se permite merge si falla:

* tenant isolation;
* own-resource authorization;
* conflict detection;
* blackout validation;
* availability validation;
* state machine validation;
* money as Decimal/string;
* no float money;
* idempotent charge generation;
* no payment processing from reservations;
* no automatic charge reversal on cancellation;
* calendar privacy;
* public WordPress no reservation exposure;
* audit events;
* OpenAPI validation;
* CI build.

---

# 35. Matriz de trazabilidad

| Requisito                         | Pruebas asociadas             |
| --------------------------------- | ----------------------------- |
| FR-001 Gestionar áreas comunales  | API-CA, UC-CA, INT-CA         |
| FR-002 Configurar disponibilidad  | API-AV, UC-AV, INT-AV         |
| FR-003 Crear bloqueos             | API-BLK, UC-BLK, INT-BLK      |
| FR-004 Cancelar bloqueos          | API-BLK, UC-BLK               |
| FR-005 Solicitar reserva          | API-RES-CREATE, API-ME-CREATE |
| FR-006 Validar conflictos         | SRV-CONF, CONC-RES            |
| FR-007 Aprobar reserva            | API-RES-APP, UC-RES-004       |
| FR-008 Rechazar reserva           | API-RES-REJ, UC-RES-005       |
| FR-009 Cancelar reserva           | API-RES-CAN, API-ME-CAN       |
| FR-010 Completar reserva          | API-RES-COMP                  |
| FR-011 Marcar no show             | API-RES-NS                    |
| FR-012 Generar cargo              | SRV-CHG, FIN-RES, API-RES-CHG |
| FR-013 Consultar reservas admin   | API-RES-LIST                  |
| FR-014 Consultar reservas propias | API-ME-LIST                   |
| FR-015 Consultar calendario       | API-CAL, SRV-CAL              |
| FR-016 Consultar áreas públicas   | API-PUB-CA                    |
| FR-017 Auditar operaciones        | AUD                           |
| FR-018 Proteger datos personales  | SEC-CAL, SEC-PUB              |
| FR-019 Proteger datos financieros | FIN-RES, SEC-FIN              |
| FR-020 Documentar API             | OAPI-RES                      |

---

# 36. Riesgos cubiertos

| Riesgo                         | Pruebas                            |
| ------------------------------ | ---------------------------------- |
| Doble reserva                  | SRV-CONF, CONC-RES, API-RES-CREATE |
| Reserva cross-tenant           | MT-RES, SEC-MT                     |
| Unidad ajena                   | SRV-OWN, API-ME, SEC-OWN           |
| Exposición calendario privado  | API-CAL-ME, SEC-CAL                |
| Exposición pública de reservas | API-PUB-CA, SEC-PUB                |
| Cargo duplicado                | SRV-CHG, CONC-CHG, FIN-RES         |
| Uso de float                   | UT-RES-MONEY, FIN-RES              |
| Estado inválido                | ST-RES, API-RES-ACT                |
| Cancelación incorrecta         | SRV-POL, API-ME-CAN                |
| Falta de auditoría             | AUD                                |
| Falta de OpenAPI               | OAPI-RES                           |
| Pagos desde reservas           | FIN-RES, SEC-FIN                   |

---

# 37. Criterios de salida

El módulo `010-reservations-common-areas` puede considerarse probado si:

* unit tests pasan;
* entity tests pasan;
* state machine tests pasan;
* DTO validation tests pasan;
* application service tests pasan;
* use case tests pasan;
* repository integration tests pasan;
* API tests pasan;
* authorization tests pasan;
* own-resource tests pasan;
* multitenancy tests pasan;
* concurrency tests pasan;
* financial regression tests pasan;
* calendar privacy tests pasan;
* public WordPress tests pasan;
* audit integration tests pasan;
* observability tests pasan;
* OpenAPI tests pasan;
* smoke tests pasan;
* no hay datos reales en fixtures;
* no hay exposición de datos personales de terceros;
* no hay exposición pública de reservas;
* no hay cargos duplicados;
* no hay pagos procesados desde reservas;
* no hay eliminación física de historial;
* CI pasa.

---

# 38. Pendientes controlados

Pendientes aceptados para esta spec:

```text id="g2qetp"
pagos online diferidos
pasarela de pagos diferida
depósitos en garantía diferidos
penalizaciones automáticas diferidas
reservas recurrentes diferidas
reservas multi-día diferidas
reservas nocturnas diferidas
lista de espera diferida
QR de ingreso diferido
cerraduras inteligentes diferidas
check-in/check-out diferido
inspecciones post-reserva diferidas
notificaciones automáticas diferidas
Google Calendar sync diferido
contratos PDF diferidos
firma electrónica diferida
reservas desde WordPress diferidas
SSO WordPress diferido
```

Estos pendientes no bloquean `010-reservations-common-areas`.

---

## 39. Decisión final del test plan

El módulo `010-reservations-common-areas` deberá probarse con pruebas unitarias, pruebas de dominio, validación de DTOs, pruebas de servicios, pruebas de casos de uso, pruebas de repositorio, pruebas API, pruebas de autorización, pruebas de recursos propios, pruebas multitenant, pruebas de concurrencia, pruebas financieras, pruebas de privacidad de calendario, pruebas de auditoría, pruebas OpenAPI y smoke tests.

Las pruebas se enfocarán especialmente en:

```text id="cvvlq5"
- impedir doble reserva;
- impedir reservas sobre blackouts;
- validar disponibilidad;
- proteger unidades propias;
- impedir referencias cross-tenant;
- controlar transiciones de estado;
- generar cargos de forma idempotente;
- no procesar pagos desde reservas;
- no revertir cargos automáticamente;
- proteger datos personales en calendario;
- exponer a WordPress solo catálogo público;
- auditar operaciones críticas;
- garantizar dinero Decimal/string;
- validar OpenAPI y CI.
```

Ninguna implementación debe aceptarse si permite doble reserva, mezcla tenants, permite reservar unidades ajenas, expone reservas privadas a WordPress, expone calendario interno públicamente, genera cargos duplicados, usa float para dinero, procesa pagos directamente, revierte cargos automáticamente sin flujo financiero, elimina historial o permite transiciones de estado no autorizadas.
