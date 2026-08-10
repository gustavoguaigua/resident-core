# Tasks — Spec 010 Reservations and Common Areas

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                   |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                           |
| Spec ID         | 010                                                                                                                                                                     |
| Módulo          | Reservations and Common Areas                                                                                                                                           |
| Documento       | Implementation Tasks                                                                                                                                                    |
| Ruta            | `docs/specs/010-reservations-common-areas/tasks.md`                                                                                                                     |
| Versión         | 0.1                                                                                                                                                                     |
| Estado          | needs-review                                                                                                                                                            |
| Fecha           | 2026-07-18                                                                                                                                                              |
| Documento base  | `docs/specs/010-reservations-common-areas/spec.md`                                                                                                                      |
| Plan técnico    | `docs/specs/010-reservations-common-areas/plan.md`                                                                                                                      |
| Modelo de datos | `docs/specs/010-reservations-common-areas/data-model.md`                                                                                                                |
| Contrato API    | `docs/specs/010-reservations-common-areas/api-contract.md`                                                                                                              |
| Plan de pruebas | `docs/specs/010-reservations-common-areas/test-plan.md`                                                                                                                 |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements`, `007-audit`, `009-wordpress-integration-basic` |

---

## 2. Propósito

Este documento convierte la spec `010-reservations-common-areas` en una lista ejecutable de tareas para implementar el módulo de áreas comunales y reservas dentro de RESIDENT Core.

El módulo debe permitir:

* administrar áreas comunales;
* configurar disponibilidad;
* configurar bloqueos administrativos;
* crear reservas administrativas;
* crear reservas propias;
* aprobar reservas;
* rechazar reservas;
* cancelar reservas;
* completar reservas;
* marcar no show;
* consultar calendarios;
* impedir doble reserva;
* validar propiedad/residencia de unidades;
* generar cargos opcionales de forma idempotente;
* proteger datos personales;
* proteger datos financieros;
* exponer a WordPress únicamente catálogo público de áreas;
* auditar operaciones críticas.

Regla central:

```text id="vkldlv"
Toda reserva debe ser tenant-scoped, permissioned, conflict-safe, auditable, financieramente integrable y protegida contra exposición pública indebida.
```

---

## 3. Convenciones de estado

Usar:

```text id="qpdce5"
[ ] Pending
[/] In Progress
[x] Done
[!] Blocked
[-] Deferred
```

Regla:

```text id="eoojks"
No marcar una tarea como [x] hasta que exista evidencia real de implementación, prueba, revisión o commit.
```

---

## 4. Reglas obligatorias de ejecución

Antes de implementar código, revisar:

```text id="c5rrek"
docs/sdd/constitution.md
docs/sdd/domain-map.md
docs/sdd/architecture.md
docs/sdd/security.md
docs/sdd/api-guidelines.md
docs/sdd/data-governance.md
docs/decisions/ADR-003-database-strategy.md
docs/decisions/ADR-004-multitenancy-strategy.md
docs/decisions/ADR-007-authorization-strategy.md
docs/decisions/ADR-010-observability-strategy.md
docs/decisions/ADR-011-testing-strategy.md
docs/decisions/ADR-012-ci-cd-strategy.md
docs/specs/001-tenants/
docs/specs/002-users-roles/
docs/specs/003-residents-properties/
docs/specs/004-dues-fees/
docs/specs/005-payments/
docs/specs/006-account-statements/
docs/specs/007-audit/
docs/specs/009-wordpress-integration-basic/
docs/specs/010-reservations-common-areas/
```

Reglas de implementación:

```text id="znbse1"
1. Toda tabla nueva debe incluir tenant_id.
2. Toda consulta debe filtrar por tenant_id.
3. No se permite crear reservas sin common_area_id.
4. No se permite crear reservas con startAt >= endAt.
5. No se permite doble reserva.
6. No se permite reservar sobre blackouts activos.
7. No se permite reservar fuera de disponibilidad configurada.
8. No se permite reservar unidades ajenas desde /me.
9. No se permite leer reservas ajenas desde /me.
10. No se permite cancelar reservas ajenas desde /me.
11. No se permite usar commonAreaId de otro tenant.
12. No se permite usar propertyUnitId de otro tenant.
13. No se permite usar chargeConceptId de otro tenant.
14. No se permite usar chargeId de otro tenant.
15. No se permite usar float/double para dinero.
16. Todo monto debe usar Decimal y salir por API como string.
17. La generación de cargo debe ser idempotente.
18. El módulo no debe procesar pagos.
19. El módulo no debe confirmar pagos.
20. El módulo no debe asignar pagos.
21. El módulo no debe modificar comprobantes.
22. La cancelación no debe revertir cargos automáticamente en MVP.
23. Toda transición relevante debe crear historial.
24. Toda transición relevante debe auditarse.
25. No se permite eliminación física de reservas.
26. WordPress no puede crear reservas en esta spec.
27. WordPress no puede consultar calendario interno.
28. WordPress no puede ver reservas existentes.
29. WordPress no puede ver solicitantes, unidades, cargos ni estados de pago.
30. Los endpoints públicos solo exponen catálogo public-safe de áreas.
31. Los endpoints administrativos requieren AuthGuard, TenantGuard y permisos.
32. Los endpoints /me requieren validación de recurso propio.
33. No implementar pagos online en esta spec.
34. No implementar reservas recurrentes en esta spec.
35. No implementar QR, check-in/check-out ni cerraduras inteligentes en esta spec.
```

---

## 5. Entregables esperados

Documentación:

```text id="cl7mth"
docs/specs/010-reservations-common-areas/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

Backend:

```text id="skeuw1"
apps/api/src/modules/reservations/
├── reservations.module.ts
├── common-areas.controller.ts
├── common-area-availability.controller.ts
├── common-area-blackouts.controller.ts
├── reservations.controller.ts
├── my-reservations.controller.ts
├── common-area-calendar.controller.ts
├── application/
├── domain/
├── infrastructure/
├── policies/
├── dto/
└── tests/
```

Base de datos:

```text id="feajnd"
common_areas
common_area_availability_windows
common_area_blackouts
reservations
reservation_status_history
```

---

# 6. Fase 0 — Preparación documental

## TASK-001 — Crear carpeta de spec

**Estado:** `[ ] Pending`

### Ruta

```text id="t2i9im"
docs/specs/010-reservations-common-areas/
```

### Criterios de aceptación

* Carpeta creada.
* Sigue estructura de specs anteriores.
* No reemplaza documentos de specs `001` a `009`.

---

## TASK-002 — Registrar spec funcional

**Estado:** `[ ] Pending`

### Archivo

```text id="s9w6py"
docs/specs/010-reservations-common-areas/spec.md
```

### Criterios de aceptación

* Define propósito.
* Define alcance.
* Define reglas de negocio.
* Define actores.
* Define permisos.
* Define API preliminar.
* Define estados.
* Define riesgos.
* Define criterios de aceptación.

---

## TASK-003 — Registrar plan técnico

**Estado:** `[ ] Pending`

### Archivo

```text id="d3a94m"
docs/specs/010-reservations-common-areas/plan.md
```

### Criterios de aceptación

* Define estructura técnica.
* Define carpetas.
* Define servicios.
* Define casos de uso.
* Define puertos.
* Define repositorios.
* Define estrategia de concurrencia.
* Define integración financiera.
* Define integración WordPress public-safe.

---

## TASK-004 — Registrar modelo de datos

**Estado:** `[ ] Pending`

### Archivo

```text id="atoh8e"
docs/specs/010-reservations-common-areas/data-model.md
```

### Criterios de aceptación

* Define tablas.
* Define enums.
* Define Prisma preliminar.
* Define relaciones.
* Define constraints.
* Define índices.
* Define estrategia anti-solapamiento.
* Define reglas financieras.
* Define reglas de privacidad.

---

## TASK-005 — Registrar contrato API

**Estado:** `[ ] Pending`

### Archivo

```text id="hisxtt"
docs/specs/010-reservations-common-areas/api-contract.md
```

### Criterios de aceptación

* Define endpoints.
* Define permisos.
* Define headers.
* Define DTOs.
* Define responses.
* Define errores.
* Define calendario.
* Define endpoints públicos.
* Define OpenAPI esperado.

---

## TASK-006 — Registrar plan de pruebas

**Estado:** `[ ] Pending`

### Archivo

```text id="gockn1"
docs/specs/010-reservations-common-areas/test-plan.md
```

### Criterios de aceptación

* Define unit tests.
* Define domain tests.
* Define integration tests.
* Define API tests.
* Define authorization tests.
* Define own-resource tests.
* Define multitenancy tests.
* Define concurrency tests.
* Define financial regression tests.
* Define security tests.

---

## TASK-007 — Registrar tareas

**Estado:** `[ ] Pending`

### Archivo

```text id="xocctt"
docs/specs/010-reservations-common-areas/tasks.md
```

### Criterios de aceptación

* Tareas ordenadas por fases.
* Estados definidos.
* Criterios claros.
* Diferidos documentados.
* Definition of Done incluida.

---

## TASK-008 — Registrar notas de seguridad

**Estado:** `[ ] Pending`

### Archivo

```text id="adhd41"
docs/specs/010-reservations-common-areas/security-notes.md
```

### Criterios de aceptación

* Identifica riesgos de doble reserva.
* Identifica riesgos cross-tenant.
* Identifica riesgos de unidad ajena.
* Identifica riesgos de calendario.
* Identifica riesgos financieros.
* Identifica riesgos WordPress.
* Define controles de auditoría.
* Define controles de privacidad.

---

# 7. Fase 1 — Estructura base del módulo

## TASK-009 — Crear módulo NestJS `reservations`

**Estado:** `[ ] Pending`

### Archivo

```text id="py49el"
apps/api/src/modules/reservations/reservations.module.ts
```

### Criterios de aceptación

* Módulo compila.
* Está registrado en `AppModule` o módulo funcional equivalente.
* Exporta providers necesarios.
* No contiene lógica de negocio.
* Respeta arquitectura modular.

---

## TASK-010 — Crear estructura de carpetas

**Estado:** `[ ] Pending`

### Estructura

```text id="bqhjpe"
apps/api/src/modules/reservations/
├── application/
│   ├── use-cases/
│   ├── services/
│   └── ports/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   └── errors/
├── infrastructure/
│   ├── persistence/
│   ├── financial/
│   ├── public/
│   └── audit/
├── policies/
├── dto/
└── tests/
```

### Criterios de aceptación

* Estructura creada.
* Dominio no depende de Prisma.
* Controladores no acceden directamente a Prisma.
* Servicios no exponen detalles de infraestructura.
* Repositorios viven en infraestructura.

---

## TASK-011 — Crear controladores base

**Estado:** `[ ] Pending`

### Archivos

```text id="b6jl54"
common-areas.controller.ts
common-area-availability.controller.ts
common-area-blackouts.controller.ts
reservations.controller.ts
my-reservations.controller.ts
common-area-calendar.controller.ts
```

### Criterios de aceptación

* Controladores compilan.
* Registran rutas base correctas.
* No contienen lógica de negocio.
* Invocan casos de uso.
* Aplican guards/decorators según corresponda.

---

## TASK-012 — Registrar módulo en estructura de bounded contexts

**Estado:** `[ ] Pending`

### Contexto

```text id="tprdxc"
Reservations and Rentals
```

### Criterios de aceptación

* `domain-map.md` sigue siendo consistente.
* Módulo queda alineado con `Reservations and Rentals`.
* No se mezcla con `Payments` ni `Financial Management`.

---

# 8. Fase 2 — Value Objects

## TASK-013 — Implementar `CommonAreaCode`

**Estado:** `[ ] Pending`

### Archivo

```text id="fqgz64"
domain/value-objects/common-area-code.vo.ts
```

### Criterios de aceptación

* Valida código no vacío.
* Permite formato legible como `SALON-COMUNAL`.
* Rechaza slash.
* Rechaza script.
* Rechaza longitud excesiva.
* Tiene unit tests.

---

## TASK-014 — Implementar `CommonAreaStatus`

**Estado:** `[ ] Pending`

### Archivo

```text id="m56igx"
domain/value-objects/common-area-status.vo.ts
```

### Criterios de aceptación

* Soporta `active`.
* Soporta `inactive`.
* Soporta `maintenance`.
* Soporta `archived`.
* Define si permite nuevas reservas.
* Tiene unit tests.

---

## TASK-015 — Implementar `CommonAreaType`

**Estado:** `[ ] Pending`

### Archivo

```text id="sx6uo7"
domain/value-objects/common-area-type.vo.ts
```

### Criterios de aceptación

* Soporta `hall`.
* Soporta `court`.
* Soporta `bbq`.
* Soporta `pool`.
* Soporta `terrace`.
* Soporta `park`.
* Soporta `gym`.
* Soporta `meetingRoom`.
* Soporta `other`.
* Tiene unit tests.

---

## TASK-016 — Implementar `ReservationStatus`

**Estado:** `[ ] Pending`

### Archivo

```text id="n71g5t"
domain/value-objects/reservation-status.vo.ts
```

### Criterios de aceptación

* Soporta estados definidos en `data-model.md`.
* Identifica estados bloqueantes.
* Identifica estados terminales.
* Identifica estados archivables.
* Tiene unit tests.

---

## TASK-017 — Implementar `ReservationTimeRange`

**Estado:** `[ ] Pending`

### Archivo

```text id="mv8daj"
domain/value-objects/reservation-time-range.vo.ts
```

### Criterios de aceptación

* Valida `startAt`.
* Valida `endAt`.
* Garantiza `startAt < endAt`.
* Maneja UTC internamente.
* Valida zona horaria del tenant.
* Rechaza reservas que cruzan medianoche local en MVP.
* Tiene unit tests.

---

## TASK-018 — Implementar `ReservationDuration`

**Estado:** `[ ] Pending`

### Archivo

```text id="l60i43"
domain/value-objects/reservation-duration.vo.ts
```

### Criterios de aceptación

* Calcula duración en minutos.
* Valida duración mínima.
* Valida duración máxima.
* Rechaza duración negativa.
* Tiene unit tests.

---

## TASK-019 — Implementar `ReservationMoney`

**Estado:** `[ ] Pending`

### Archivo

```text id="gnon2r"
domain/value-objects/reservation-money.vo.ts
```

### Criterios de aceptación

* Usa Decimal.
* Acepta string decimal.
* Rechaza float.
* Rechaza `NaN`.
* Rechaza montos negativos.
* Expone string.
* Tiene unit tests.

---

## TASK-020 — Implementar `ReservationPurpose`

**Estado:** `[ ] Pending`

### Archivo

```text id="wlecoz"
domain/value-objects/reservation-purpose.vo.ts
```

### Criterios de aceptación

* Valida longitud máxima.
* Rechaza contenido peligroso si aplica.
* Permite valor opcional según política.
* Evita payloads extensos.
* Tiene unit tests.

---

## TASK-021 — Implementar `AttendeeCount`

**Estado:** `[ ] Pending`

### Archivo

```text id="terksl"
domain/value-objects/attendee-count.vo.ts
```

### Criterios de aceptación

* Valida entero positivo.
* Rechaza negativos.
* Valida contra capacidad.
* Permite null si política lo permite.
* Tiene unit tests.

---

## TASK-022 — Implementar `DayOfWeek`

**Estado:** `[ ] Pending`

### Archivo

```text id="ypybcs"
domain/value-objects/day-of-week.vo.ts
```

### Criterios de aceptación

* Soporta lunes a domingo.
* Rechaza valores inválidos.
* Mapea correctamente con zona horaria.
* Tiene unit tests.

---

## TASK-023 — Implementar `TimeOfDay`

**Estado:** `[ ] Pending`

### Archivo

```text id="wbd3qy"
domain/value-objects/time-of-day.vo.ts
```

### Criterios de aceptación

* Valida formato `HH:mm`.
* Rechaza horas inválidas.
* Rechaza minutos inválidos.
* Permite comparar `startTime < endTime`.
* Tiene unit tests.

---

# 9. Fase 3 — Entidades de dominio

## TASK-024 — Implementar `CommonArea`

**Estado:** `[ ] Pending`

### Archivo

```text id="f1c651"
domain/entities/common-area.entity.ts
```

### Criterios de aceptación

* Representa área comunal.
* Valida tenant.
* Valida nombre.
* Valida capacidad.
* Valida estado.
* Valida configuración de tarifa.
* Determina si es reservable.
* Determina si es publicable.
* No expone `internalRules` en DTO público.
* Tiene unit tests.

---

## TASK-025 — Implementar `CommonAreaAvailabilityWindow`

**Estado:** `[ ] Pending`

### Archivo

```text id="z9dtoq"
domain/entities/common-area-availability-window.entity.ts
```

### Criterios de aceptación

* Representa ventana de disponibilidad.
* Valida día.
* Valida hora inicio/fin.
* Valida `startTime < endTime`.
* Respeta `validFrom` y `validTo`.
* Determina si aplica a una fecha.
* Tiene unit tests.

---

## TASK-026 — Implementar `CommonAreaBlackout`

**Estado:** `[ ] Pending`

### Archivo

```text id="a0zxcp"
domain/entities/common-area-blackout.entity.ts
```

### Criterios de aceptación

* Representa bloqueo administrativo.
* Valida rango.
* Valida razón.
* Determina si bloquea.
* Permite cancelar con razón.
* No elimina historial.
* Tiene unit tests.

---

## TASK-027 — Implementar `Reservation`

**Estado:** `[ ] Pending`

### Archivo

```text id="jd6ao2"
domain/entities/reservation.entity.ts
```

### Criterios de aceptación

* Representa reserva.
* Valida tenant.
* Valida área.
* Valida rango.
* Valida estado.
* Soporta snapshot de tarifa.
* Soporta `chargeId`.
* No elimina historial.
* Tiene unit tests.

---

## TASK-028 — Implementar `ReservationStatusHistory`

**Estado:** `[ ] Pending`

### Archivo

```text id="cefk5y"
domain/entities/reservation-status-history.entity.ts
```

### Criterios de aceptación

* Registra `fromStatus`.
* Registra `toStatus`.
* Registra actor.
* Registra razón.
* Registra fecha.
* Sanitiza metadata.
* No contiene secretos.
* Tiene unit tests.

---

## TASK-029 — Implementar eventos de dominio de áreas

**Estado:** `[ ] Pending`

### Archivos

```text id="gj3dhz"
common-area-created.event.ts
common-area-updated.event.ts
common-area-activated.event.ts
common-area-deactivated.event.ts
common-area-marked-maintenance.event.ts
common-area-archived.event.ts
```

### Criterios de aceptación

* Incluyen tenantId.
* Incluyen commonAreaId.
* Incluyen actorUserId.
* Incluyen traceId.
* No incluyen payload completo.
* No incluyen datos sensibles.

---

## TASK-030 — Implementar eventos de disponibilidad y blackouts

**Estado:** `[ ] Pending`

### Archivos

```text id="rhqi3v"
common-area-availability-created.event.ts
common-area-availability-updated.event.ts
common-area-availability-archived.event.ts
common-area-blackout-created.event.ts
common-area-blackout-cancelled.event.ts
```

### Criterios de aceptación

* Incluyen tenantId.
* Incluyen commonAreaId.
* Incluyen windowId/blackoutId.
* Incluyen actorUserId.
* Incluyen traceId.
* Metadata sanitizada.

---

## TASK-031 — Implementar eventos de reservas

**Estado:** `[ ] Pending`

### Archivos

```text id="dv2j3w"
reservation-created.event.ts
reservation-requested.event.ts
reservation-approved.event.ts
reservation-rejected.event.ts
reservation-cancelled.event.ts
reservation-completed.event.ts
reservation-no-show.event.ts
reservation-expired.event.ts
reservation-charge-generated.event.ts
reservation-charge-generation-failed.event.ts
reservation-conflict-detected.event.ts
```

### Criterios de aceptación

* Incluyen tenantId.
* Incluyen reservationId.
* Incluyen commonAreaId.
* Incluyen propertyUnitId si aplica.
* Incluyen fromStatus/toStatus si aplica.
* Incluyen traceId.
* No incluyen payload completo.
* No incluyen datos personales innecesarios.

---

## TASK-032 — Implementar errores de dominio de áreas

**Estado:** `[ ] Pending`

### Archivos

```text id="se2y1j"
common-area-not-found.error.ts
common-area-not-reservable.error.ts
common-area-inactive.error.ts
common-area-maintenance.error.ts
common-area-duplicate-code.error.ts
common-area-duplicate-slug.error.ts
common-area-invalid-fee.error.ts
```

### Criterios de aceptación

* Cada error tiene código estable.
* Cada error mapea a HTTP status.
* No expone SQL.
* No expone stack trace.

---

## TASK-033 — Implementar errores de disponibilidad y blackouts

**Estado:** `[ ] Pending`

### Archivos

```text id="i206g6"
availability-window-not-found.error.ts
availability-window-invalid.error.ts
blackout-not-found.error.ts
blackout-invalid-range.error.ts
blackout-already-cancelled.error.ts
reservation-blackout-conflict.error.ts
reservation-outside-availability.error.ts
```

### Criterios de aceptación

* Códigos estables.
* Mapeo HTTP correcto.
* Mensajes seguros.
* Tests de error.

---

## TASK-034 — Implementar errores de reservas

**Estado:** `[ ] Pending`

### Archivos

```text id="zm1cia"
reservation-not-found.error.ts
reservation-forbidden.error.ts
reservation-conflict.error.ts
reservation-invalid-transition.error.ts
reservation-invalid-time-range.error.ts
reservation-crosses-midnight.error.ts
reservation-duration-too-short.error.ts
reservation-duration-too-long.error.ts
reservation-advance-limit-exceeded.error.ts
reservation-capacity-exceeded.error.ts
reservation-cancellation-window-closed.error.ts
reservation-unit-forbidden.error.ts
reservation-cross-tenant-reference.error.ts
reservation-charge-concept-required.error.ts
reservation-charge-already-generated.error.ts
reservation-charge-generation-failed.error.ts
```

### Criterios de aceptación

* Códigos alineados con `api-contract.md`.
* Mapeo a 403/404/409/422/500 según corresponda.
* No expone información sensible.
* Tiene tests.

---

# 10. Fase 4 — Base de datos y Prisma

## TASK-035 — Crear migración `010_create_reservations_common_areas`

**Estado:** `[ ] Pending`

### Nombre sugerido

```text id="cwtnco"
010_create_reservations_common_areas
```

### Criterios de aceptación

* Crea enums.
* Crea `common_areas`.
* Crea `common_area_availability_windows`.
* Crea `common_area_blackouts`.
* Crea `reservations`.
* Crea `reservation_status_history`.
* Crea índices.
* Crea constraints básicos.
* Ejecuta en DB test.
* No rompe specs anteriores.

---

## TASK-036 — Agregar enums Prisma

**Estado:** `[ ] Pending`

### Enums

```text id="rgx5dr"
CommonAreaStatus
CommonAreaType
DayOfWeek
CommonAreaBlackoutStatus
ReservationStatus
ReservationPaymentStatusSnapshot
```

### Criterios de aceptación

* Enums definidos.
* Mapeados correctamente a valores persistidos.
* Prisma Client genera.
* Tests compilan.

---

## TASK-037 — Agregar modelo `CommonArea`

**Estado:** `[ ] Pending`

### Archivo

```text id="lwifyk"
prisma/schema.prisma
```

### Criterios de aceptación

* Modelo coincide con `data-model.md`.
* Relación con Tenant.
* Relación con ChargeConcept.
* Unique `(tenantId, code)`.
* Unique `(tenantId, slug)`.
* Índices creados.
* Campos monetarios Decimal.
* Soft delete con `archivedAt`.

---

## TASK-038 — Agregar modelo `CommonAreaAvailabilityWindow`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Modelo coincide con `data-model.md`.
* Relación con Tenant.
* Relación con CommonArea.
* Índices por tenant/área/día.
* `startTime` y `endTime` definidos.
* Soft delete con `archivedAt`.

---

## TASK-039 — Agregar modelo `CommonAreaBlackout`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Modelo coincide con `data-model.md`.
* Relación con Tenant.
* Relación con CommonArea.
* Relaciones con UserProfile para createdBy/cancelledBy.
* Índices para búsqueda de conflictos.
* Soft delete con `archivedAt`.

---

## TASK-040 — Agregar modelo `Reservation`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Modelo coincide con `data-model.md`.
* Relación con Tenant.
* Relación con CommonArea.
* Relación con PropertyUnit.
* Relación con UserProfile.
* Relación con Person.
* Relación con Charge.
* `chargeId` único.
* Campos monetarios Decimal.
* Índices para calendario/conflictos.
* Soft delete con `archivedAt`.

---

## TASK-041 — Agregar modelo `ReservationStatusHistory`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Modelo coincide con `data-model.md`.
* Relación con Reservation.
* Relación con Tenant.
* Relación con UserProfile actor.
* Índices por tenant/reservation/occurredAt.
* Metadata JSON permitida.
* No soft delete obligatorio.

---

## TASK-042 — Agregar relaciones en modelos existentes

**Estado:** `[ ] Pending`

### Modelos

```text id="wbxcbn"
Tenant
UserProfile
PropertyUnit
Person
ChargeConcept
Charge
```

### Criterios de aceptación

* Relaciones agregadas sin romper specs anteriores.
* Prisma Client genera.
* Tests existentes siguen pasando.

---

## TASK-043 — Agregar constraints SQL básicas

**Estado:** `[ ] Pending`

### Constraints

```text id="vphw73"
reservations.start_at < reservations.end_at
common_area_blackouts.start_at < common_area_blackouts.end_at
common_areas.fee_amount >= 0
reservations.fee_amount >= 0
```

### Criterios de aceptación

* Constraints aplicadas por migración raw o Prisma si es posible.
* DB test valida constraints.
* Errores se traducen a errores de dominio/API.

---

## TASK-044 — Implementar estrategia anti-solapamiento MVP

**Estado:** `[ ] Pending`

### Estrategia

```text id="pidyr3"
transaction + pg_advisory_xact_lock(hashtext(common_area_id)) + conflict query
```

### Criterios de aceptación

* Lock se ejecuta dentro de transacción.
* Lock se aplica por commonAreaId.
* No bloquea áreas diferentes.
* Se revalida conflicto al aprobar.
* Concurrency tests pasan.

---

## TASK-045 — Evaluar exclusion constraint PostgreSQL

**Estado:** `[-] Deferred`

### Razón

Puede requerir migración raw y evaluación adicional con Prisma.

### Criterios de aceptación futuros

* `btree_gist` evaluado.
* `tstzrange` evaluado.
* Tests cubren constraint DB.
* Decisión documentada en ADR o change note si se adopta.

---

## TASK-046 — Crear seeds demo

**Estado:** `[ ] Pending`

### Seeds

```text id="ktwkuc"
commonAreaSalonComunal
commonAreaCanchaMultiple
commonAreaBBQ
commonAreaPiscina
commonAreaParqueInfantil
availabilitySalonSaturday
availabilitySalonSunday
availabilityCanchaWeekdays
blackoutSalonMaintenance
reservationPendingApproval
reservationApproved
reservationCancelled
reservationWithCharge
```

### Criterios de aceptación

* No usan datos reales.
* No usan datos personales sensibles.
* No usan pagos reales.
* No usan tokens.
* Permiten probar API.
* Permiten probar public catalog WordPress.

---

# 11. Fase 5 — DTOs y validación

## TASK-047 — Crear DTOs de áreas comunales

**Estado:** `[ ] Pending`

### Archivos

```text id="ii9hul"
create-common-area.dto.ts
update-common-area.dto.ts
common-area.dto.ts
common-area-admin-detail.dto.ts
common-area-list-query.dto.ts
```

### Criterios de aceptación

* Valida code.
* Valida slug.
* Valida name.
* Valida type.
* Valida capacity.
* Valida tarifa.
* Rechaza tenantId en body o lo ignora de forma segura.
* Tiene DTO tests.

---

## TASK-048 — Crear DTOs de availability windows

**Estado:** `[ ] Pending`

### Archivos

```text id="be6fz8"
create-availability-window.dto.ts
update-availability-window.dto.ts
availability-window.dto.ts
```

### Criterios de aceptación

* Valida dayOfWeek.
* Valida startTime.
* Valida endTime.
* Valida `startTime < endTime`.
* Valida validFrom/validTo.
* Tiene DTO tests.

---

## TASK-049 — Crear DTOs de blackouts

**Estado:** `[ ] Pending`

### Archivos

```text id="caqx1a"
create-blackout.dto.ts
cancel-blackout.dto.ts
blackout.dto.ts
blackout-list-query.dto.ts
```

### Criterios de aceptación

* Valida startAt.
* Valida endAt.
* Valida `startAt < endAt`.
* Requiere reason.
* Valida longitud de reason.
* Tiene DTO tests.

---

## TASK-050 — Crear DTOs de reservas administrativas

**Estado:** `[ ] Pending`

### Archivos

```text id="my0gpl"
create-reservation.dto.ts
reservation.dto.ts
reservation-admin-detail.dto.ts
reservation-list-query.dto.ts
approve-reservation.dto.ts
reject-reservation.dto.ts
cancel-reservation.dto.ts
mark-no-show.dto.ts
```

### Criterios de aceptación

* Valida commonAreaId.
* Valida propertyUnitId.
* Valida startAt/endAt.
* Valida attendeeCount.
* Valida purpose.
* Valida notes.
* Rechaza status manual no permitido.
* Rechaza tenantId en body o lo ignora de forma segura.
* Tiene DTO tests.

---

## TASK-051 — Crear DTOs de reservas propias

**Estado:** `[ ] Pending`

### Archivos

```text id="yvhac4"
create-own-reservation.dto.ts
own-reservation.dto.ts
own-reservation-list-query.dto.ts
cancel-own-reservation.dto.ts
```

### Criterios de aceptación

* Valida propertyUnitId.
* Valida commonAreaId.
* Valida startAt/endAt.
* Valida purpose.
* No permite requesterUserId manual.
* No permite status manual.
* Tiene DTO tests.

---

## TASK-052 — Crear DTOs de calendario

**Estado:** `[ ] Pending`

### Archivos

```text id="qt42zg"
calendar-query.dto.ts
common-area-calendar.dto.ts
calendar-item.dto.ts
own-calendar-item.dto.ts
```

### Criterios de aceptación

* Valida dateFrom.
* Valida dateTo.
* Valida rango máximo 31 días.
* Valida timezone.
* Define vista admin.
* Define vista propia.
* Tiene DTO tests.

---

## TASK-053 — Crear DTOs públicos para WordPress

**Estado:** `[ ] Pending`

### Archivos

```text id="bbsc7s"
public-common-area.dto.ts
public-common-area-list-query.dto.ts
```

### Criterios de aceptación

* Solo incluye campos public-safe.
* No incluye reservas.
* No incluye calendario.
* No incluye blackouts internos.
* No incluye availability completa.
* No incluye internalRules.
* No incluye chargeId.
* No incluye datos de solicitantes.
* Tiene tests.

---

## TASK-054 — Crear response wrappers

**Estado:** `[ ] Pending`

### Archivos

```text id="e88pas"
reservation-response.dto.ts
reservation-paginated-response.dto.ts
```

### Criterios de aceptación

* Usa `data`.
* Usa `meta.traceId`.
* Paginados incluyen page/pageSize/total/totalPages.
* No exponen entidades internas.

---

# 12. Fase 6 — Puertos y repositorios

## TASK-055 — Crear puertos de áreas comunales

**Estado:** `[ ] Pending`

### Archivos

```text id="uakuhl"
common-area-reader.port.ts
common-area-writer.port.ts
```

### Criterios de aceptación

* Define lectura por tenant.
* Define lectura por id.
* Define lectura por slug.
* Define listados.
* Define create/update/state/archive.
* No filtra sin tenant.

---

## TASK-056 — Crear puertos de availability

**Estado:** `[ ] Pending`

### Archivos

```text id="pfd8nu"
availability-reader.port.ts
availability-writer.port.ts
```

### Criterios de aceptación

* Lista ventanas por área.
* Busca ventanas activas por fecha.
* Crea/actualiza/archiva ventanas.
* Aplica tenantId.

---

## TASK-057 — Crear puertos de blackouts

**Estado:** `[ ] Pending`

### Archivos

```text id="xf7177"
blackout-reader.port.ts
blackout-writer.port.ts
```

### Criterios de aceptación

* Lista blackouts.
* Busca conflictos.
* Crea blackouts.
* Cancela blackouts.
* Aplica tenantId.

---

## TASK-058 — Crear puertos de reservas

**Estado:** `[ ] Pending`

### Archivos

```text id="ghwcdn"
reservation-reader.port.ts
reservation-writer.port.ts
```

### Criterios de aceptación

* Consulta por tenant.
* Lista reservas.
* Lista propias.
* Busca conflictos.
* Consulta calendario.
* Crea reservas.
* Actualiza estado.
* Adjunta cargo.
* Crea historial.

---

## TASK-059 — Crear `ReservationChargePort`

**Estado:** `[ ] Pending`

### Archivo

```text id="vyiwv1"
reservation-charge.port.ts
```

### Criterios de aceptación

* Define generación de cargo.
* Define consulta de cargo asociado.
* Soporta idempotency key.
* No procesa pagos.
* No confirma pagos.

---

## TASK-060 — Crear `ReservationPropertyUnitPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="npb1hb"
reservation-property-unit.port.ts
```

### Criterios de aceptación

* Valida acceso usuario-unidad.
* Consulta unidades del usuario.
* Valida tenant.
* Usa datos de `003-residents-properties`.

---

## TASK-061 — Crear `ReservationAuditPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="qb0mcx"
reservation-audit.port.ts
```

### Criterios de aceptación

* Define auditoría de áreas.
* Define auditoría de blackouts.
* Define auditoría de reservas.
* Define auditoría de cargos.
* Metadata sanitizada.

---

## TASK-062 — Crear `PublicCommonAreaReaderPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="zkykv3"
public-common-area-reader.port.ts
```

### Criterios de aceptación

* Lista áreas públicas por tenant/slug.
* Obtiene área pública por slug.
* No expone datos privados.
* Compatible con `009-wordpress-integration-basic`.

---

## TASK-063 — Implementar `PrismaCommonAreaRepository`

**Estado:** `[ ] Pending`

### Archivo

```text id="qwckru"
infrastructure/persistence/prisma-common-area.repository.ts
```

### Criterios de aceptación

* Crea áreas.
* Lista áreas.
* Consulta por id.
* Consulta por slug.
* Actualiza áreas.
* Cambia estados.
* Archiva.
* Aplica tenantId.
* Tiene integration tests.

---

## TASK-064 — Implementar `PrismaAvailabilityRepository`

**Estado:** `[ ] Pending`

### Archivo

```text id="iwsj21"
infrastructure/persistence/prisma-availability.repository.ts
```

### Criterios de aceptación

* Crea ventanas.
* Lista por área.
* Busca activas por día.
* Actualiza ventanas.
* Archiva ventanas.
* Aplica tenantId.
* Tiene integration tests.

---

## TASK-065 — Implementar `PrismaBlackoutRepository`

**Estado:** `[ ] Pending`

### Archivo

```text id="kqg7el"
infrastructure/persistence/prisma-blackout.repository.ts
```

### Criterios de aceptación

* Crea blackouts.
* Lista blackouts.
* Busca blackouts solapados.
* Cancela blackouts.
* Excluye cancelados/archivados de conflictos.
* Aplica tenantId.
* Tiene integration tests.

---

## TASK-066 — Implementar `PrismaReservationRepository`

**Estado:** `[ ] Pending`

### Archivo

```text id="dxqy7t"
infrastructure/persistence/prisma-reservation.repository.ts
```

### Criterios de aceptación

* Crea reservas.
* Lista reservas.
* Lista reservas propias.
* Consulta por id+tenant.
* Busca conflictos.
* Consulta calendario.
* Actualiza estado.
* Adjunta cargo.
* Crea historial.
* Aplica tenantId.
* Tiene integration tests.

---

## TASK-067 — Implementar `ReservationsMapper`

**Estado:** `[ ] Pending`

### Archivo

```text id="jb73ml"
infrastructure/persistence/reservations.mapper.ts
```

### Criterios de aceptación

* Convierte Prisma models a entidades.
* Convierte entidades a DTOs.
* Convierte Decimal a string.
* Aplica minimización de datos.
* Tiene tests.

---

## TASK-068 — Implementar `ReservationChargeAdapter`

**Estado:** `[ ] Pending`

### Archivo

```text id="th88cy"
infrastructure/financial/reservation-charge.adapter.ts
```

### Criterios de aceptación

* Integra con `004-dues-fees`.
* Genera cargo asociado a reserva.
* Usa idempotency key.
* No crea pagos.
* No asigna pagos.
* No modifica comprobantes.
* Tiene tests con mocks/adaptador.

---

## TASK-069 — Implementar `PublicCommonAreaAdapter`

**Estado:** `[ ] Pending`

### Archivo

```text id="ahq8n9"
infrastructure/public/public-common-area.adapter.ts
```

### Criterios de aceptación

* Provee datos public-safe.
* Solo áreas active.
* Solo `isPublicVisible = true`.
* No expone reservas.
* No expone calendario.
* No expone internalRules.
* Tiene tests.

---

## TASK-070 — Implementar `ReservationAuditAdapter`

**Estado:** `[ ] Pending`

### Archivo

```text id="g11d7b"
infrastructure/audit/reservation-audit.adapter.ts
```

### Criterios de aceptación

* Publica eventos hacia `007-audit`.
* Metadata sanitizada.
* Sin payload completo.
* Sin tokens/secrets.
* Tiene tests.

---

# 13. Fase 7 — Servicios de aplicación

## TASK-071 — Implementar `CommonAreaService`

**Estado:** `[ ] Pending`

### Archivo

```text id="wfyati"
application/services/common-area.service.ts
```

### Criterios de aceptación

* Crea áreas.
* Actualiza áreas.
* Activa/desactiva.
* Marca mantenimiento.
* Archiva.
* Valida tarifa.
* Valida public-safe.
* Audita cambios.
* Tiene tests.

---

## TASK-072 — Implementar `CommonAreaAvailabilityService`

**Estado:** `[ ] Pending`

### Archivo

```text id="rkm6lv"
application/services/common-area-availability.service.ts
```

### Criterios de aceptación

* Crea ventanas.
* Actualiza ventanas.
* Archiva ventanas.
* Valida día/hora.
* Resuelve disponibilidad por fecha.
* Tiene tests.

---

## TASK-073 — Implementar `CommonAreaBlackoutService`

**Estado:** `[ ] Pending`

### Archivo

```text id="wj9eex"
application/services/common-area-blackout.service.ts
```

### Criterios de aceptación

* Crea blackouts.
* Cancela blackouts.
* Valida razón.
* Valida rango.
* Detecta bloqueo activo.
* Audita creación/cancelación.
* Tiene tests.

---

## TASK-074 — Implementar `ReservationAvailabilityService`

**Estado:** `[ ] Pending`

### Archivo

```text id="uio17k"
application/services/reservation-availability.service.ts
```

### Criterios de aceptación

* Valida ventanas de disponibilidad.
* Valida duración mínima.
* Valida duración máxima.
* Valida anticipación máxima.
* Rechaza reservas que cruzan medianoche.
* Tiene tests.

---

## TASK-075 — Implementar `ReservationConflictService`

**Estado:** `[ ] Pending`

### Archivo

```text id="s0doay"
application/services/reservation-conflict.service.ts
```

### Criterios de aceptación

* Detecta solapamientos.
* Considera estados bloqueantes.
* Ignora estados no bloqueantes.
* Detecta blackouts.
* Permite reservas contiguas.
* Audita conflictos relevantes.
* Tiene tests.

---

## TASK-076 — Implementar `ReservationStateMachineService`

**Estado:** `[ ] Pending`

### Archivo

```text id="trffui"
application/services/reservation-state-machine.service.ts
```

### Criterios de aceptación

* Define transiciones permitidas.
* Bloquea transiciones inválidas.
* Genera historial.
* Requiere razón donde aplique.
* Tiene tests.

---

## TASK-077 — Implementar `ReservationPolicyService`

**Estado:** `[ ] Pending`

### Archivo

```text id="ti4i0g"
application/services/reservation-policy.service.ts
```

### Criterios de aceptación

* Valida capacidad.
* Valida cancelación.
* Valida reglas de aprobación.
* Valida reglas de pago.
* Valida política de residente/propietario.
* Tiene tests.

---

## TASK-078 — Implementar `ReservationChargeService`

**Estado:** `[ ] Pending`

### Archivo

```text id="ukco8e"
application/services/reservation-charge.service.ts
```

### Criterios de aceptación

* Determina si requiere cargo.
* Valida concepto financiero.
* Genera cargo vía puerto.
* Usa idempotencia.
* Adjunta `chargeId`.
* No procesa pagos.
* Tiene tests.

---

## TASK-079 — Implementar `ReservationOwnershipService`

**Estado:** `[ ] Pending`

### Archivo

```text id="g89bo5"
application/services/reservation-ownership.service.ts
```

### Criterios de aceptación

* Valida usuario-unidad.
* Valida tenant.
* Bloquea unidad ajena.
* Bloquea relación inactiva.
* Soporta propietario/residente/arrendatario según política.
* Tiene tests.

---

## TASK-080 — Implementar `ReservationCalendarService`

**Estado:** `[ ] Pending`

### Archivo

```text id="f7s5dn"
application/services/reservation-calendar.service.ts
```

### Criterios de aceptación

* Construye calendario admin.
* Construye calendario propio.
* Incluye availability.
* Incluye blackouts.
* Incluye reservas.
* Minimiza terceros como `busy`.
* Limita rango a 31 días.
* Tiene tests.

---

## TASK-081 — Implementar `ReservationMoneyService`

**Estado:** `[ ] Pending`

### Archivo

```text id="b69ssy"
application/services/reservation-money.service.ts
```

### Criterios de aceptación

* Usa Decimal.
* Devuelve string.
* Rechaza float.
* Valida moneda.
* Tiene tests.

---

## TASK-082 — Implementar `ReservationAuditService`

**Estado:** `[ ] Pending`

### Archivo

```text id="nh1g4d"
application/services/reservation-audit.service.ts
```

### Criterios de aceptación

* Audita áreas.
* Audita availability.
* Audita blackouts.
* Audita reservas.
* Audita cargos.
* Sanitiza metadata.
* Tiene tests.

---

# 14. Fase 8 — Casos de uso

## TASK-083 — Implementar `CreateCommonAreaUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="qrdr6m"
POST /api/v1/tenant/common-areas
```

### Criterios de aceptación

* Requiere `commonAreas.create`.
* Valida DTO.
* Valida tarifa.
* Crea área.
* Audita `commonArea.created`.
* Tiene tests.

---

## TASK-084 — Implementar `ListCommonAreasUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="tkoleq"
GET /api/v1/tenant/common-areas
```

### Criterios de aceptación

* Requiere `commonAreas.read`.
* Soporta filtros.
* Soporta paginación.
* Aplica tenantId.
* Tiene tests.

---

## TASK-085 — Implementar `GetCommonAreaUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="hxtpsx"
GET /api/v1/tenant/common-areas/{commonAreaId}
```

### Criterios de aceptación

* Requiere `commonAreas.read`.
* Valida tenant.
* Devuelve 404/403 si no accesible.
* Tiene tests.

---

## TASK-086 — Implementar `UpdateCommonAreaUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="qqd3pd"
PATCH /api/v1/tenant/common-areas/{commonAreaId}
```

### Criterios de aceptación

* Requiere `commonAreas.update`.
* Valida DTO.
* Valida tarifa.
* Actualiza.
* Audita `commonArea.updated`.
* Tiene tests.

---

## TASK-087 — Implementar acciones de estado de áreas

**Estado:** `[ ] Pending`

### Use cases

```text id="rgyics"
ActivateCommonAreaUseCase
DeactivateCommonAreaUseCase
MarkCommonAreaMaintenanceUseCase
ArchiveCommonAreaUseCase
```

### Criterios de aceptación

* Requieren permisos correctos.
* Cambian estado.
* No cancelan reservas automáticamente.
* Archivar usa soft delete.
* Auditan acciones.
* Tienen tests.

---

## TASK-088 — Implementar use cases de availability

**Estado:** `[ ] Pending`

### Use cases

```text id="xkmltd"
CreateAvailabilityWindowUseCase
UpdateAvailabilityWindowUseCase
ArchiveAvailabilityWindowUseCase
```

### Criterios de aceptación

* Requieren `commonAreas.manageAvailability`.
* Validan área del tenant.
* Validan ventana.
* Auditan.
* Tienen tests.

---

## TASK-089 — Implementar use cases de blackouts

**Estado:** `[ ] Pending`

### Use cases

```text id="s91haw"
CreateCommonAreaBlackoutUseCase
CancelCommonAreaBlackoutUseCase
```

### Criterios de aceptación

* Requieren `commonAreas.manageBlackouts`.
* Validan rango.
* Requieren razón.
* Cancelan sin eliminar.
* Auditan.
* Tienen tests.

---

## TASK-090 — Implementar `CreateReservationUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="k5d6zm"
POST /api/v1/tenant/reservations
```

### Criterios de aceptación

* Requiere `reservations.create`.
* Valida área activa/reservable.
* Valida unidad del tenant.
* Valida rango.
* Valida disponibilidad.
* Valida blackouts.
* Valida conflictos.
* Define estado inicial.
* Audita.
* Tiene tests.

---

## TASK-091 — Implementar `CreateOwnReservationUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="wjtspy"
POST /api/v1/me/reservations
```

### Criterios de aceptación

* Requiere `reservations.create.own`.
* Valida unidad propia.
* Bloquea unidad ajena.
* Valida disponibilidad.
* Valida conflictos.
* Audita.
* Tiene tests.

---

## TASK-092 — Implementar `ListReservationsUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="ys8vs2"
GET /api/v1/tenant/reservations
```

### Criterios de aceptación

* Requiere `reservations.read`.
* Soporta filtros.
* Soporta paginación.
* Aplica tenantId.
* Tiene tests.

---

## TASK-093 — Implementar `GetReservationUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="m0ac19"
GET /api/v1/tenant/reservations/{reservationId}
```

### Criterios de aceptación

* Requiere `reservations.read`.
* Aplica tenantId.
* Devuelve detalle admin permitido.
* Tiene tests.

---

## TASK-094 — Implementar `ListOwnReservationsUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="xfo1t3"
GET /api/v1/me/reservations
```

### Criterios de aceptación

* Requiere `reservations.read.own`.
* Lista solo reservas propias.
* Filtra propertyUnitId solo si es propio.
* No muestra terceros.
* Tiene tests.

---

## TASK-095 — Implementar `GetOwnReservationUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="fww4ia"
GET /api/v1/me/reservations/{reservationId}
```

### Criterios de aceptación

* Requiere `reservations.read.own`.
* Valida reserva propia.
* Bloquea reserva ajena.
* Minimiza datos.
* Tiene tests.

---

## TASK-096 — Implementar `ApproveReservationUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="zafx8t"
POST /api/v1/tenant/reservations/{reservationId}/approve
```

### Criterios de aceptación

* Requiere `reservations.approve`.
* Valida transición.
* Revalida conflictos.
* Revalida blackouts.
* Genera cargo si aplica.
* Crea historial.
* Audita.
* Tiene tests.

---

## TASK-097 — Implementar `RejectReservationUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="ny9pfb"
POST /api/v1/tenant/reservations/{reservationId}/reject
```

### Criterios de aceptación

* Requiere `reservations.reject`.
* Requiere razón.
* Valida transición.
* Crea historial.
* Audita.
* Tiene tests.

---

## TASK-098 — Implementar `CancelReservationUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="b1mt5z"
POST /api/v1/tenant/reservations/{reservationId}/cancel
```

### Criterios de aceptación

* Requiere `reservations.cancel`.
* Requiere razón administrativa.
* Valida transición.
* No revierte cargo automáticamente.
* Crea historial.
* Audita.
* Tiene tests.

---

## TASK-099 — Implementar `CancelOwnReservationUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="omw480"
POST /api/v1/me/reservations/{reservationId}/cancel
```

### Criterios de aceptación

* Requiere `reservations.cancel.own`.
* Valida reserva propia.
* Valida límite de cancelación.
* No revierte cargo automáticamente.
* Crea historial.
* Audita.
* Tiene tests.

---

## TASK-100 — Implementar `CompleteReservationUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="x4c8f4"
POST /api/v1/tenant/reservations/{reservationId}/complete
```

### Criterios de aceptación

* Requiere `reservations.complete`.
* Solo desde `approved`.
* Marca `completed`.
* Crea historial.
* Audita.
* Tiene tests.

---

## TASK-101 — Implementar `MarkReservationNoShowUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="kqz554"
POST /api/v1/tenant/reservations/{reservationId}/mark-no-show
```

### Criterios de aceptación

* Requiere `reservations.markNoShow`.
* Solo desde `approved`.
* Marca `noShow`.
* Crea historial.
* Audita.
* Tiene tests.

---

## TASK-102 — Implementar `GenerateReservationChargeUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="yhmzsm"
POST /api/v1/tenant/reservations/{reservationId}/generate-charge
```

### Criterios de aceptación

* Requiere `reservations.generateCharge`.
* Valida reserva.
* Valida requiere pago.
* Valida concepto financiero.
* Usa idempotencia.
* No duplica cargo.
* No crea pagos.
* Audita.
* Tiene tests.

---

## TASK-103 — Implementar use cases de calendario

**Estado:** `[ ] Pending`

### Use cases

```text id="jiqkcm"
GetCommonAreaCalendarUseCase
GetOwnCommonAreaCalendarUseCase
```

### Criterios de aceptación

* Admin requiere `reservations.readCalendar`.
* Own requiere `reservations.readCalendar.own`.
* Valida rango máximo.
* Admin ve detalle permitido.
* Own ve terceros como busy.
* No expone datos personales de terceros.
* Tiene tests.

---

## TASK-104 — Implementar use cases públicos de áreas

**Estado:** `[ ] Pending`

### Use cases

```text id="z52d36"
ListPublicCommonAreasUseCase
GetPublicCommonAreaUseCase
```

### Criterios de aceptación

* Coordinados con `009-wordpress-integration-basic`.
* Solo áreas activas.
* Solo `isPublicVisible = true`.
* No expone reservas.
* No expone calendario.
* No expone internalRules.
* Tiene tests.

---

# 15. Fase 9 — Guards, policies y autorización

## TASK-105 — Reutilizar `AuthGuard`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Protege endpoints tenant.
* Protege endpoints `/me`.
* Bloquea anonymous.
* Bloquea usuarios disabled.

---

## TASK-106 — Reutilizar `TenantGuard`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Resuelve tenant activo.
* Valida membership.
* No confía solo en header.
* Aplica a endpoints tenant y `/me`.

---

## TASK-107 — Crear `CommonAreaPermissionGuard`

**Estado:** `[ ] Pending`

### Archivo

```text id="f8o08p"
policies/common-area-permission.guard.ts
```

### Criterios de aceptación

* Valida permisos commonAreas.
* Compatible con decorators.
* Tiene tests.

---

## TASK-108 — Crear `ReservationPermissionGuard`

**Estado:** `[ ] Pending`

### Archivo

```text id="im6540"
policies/reservation-permission.guard.ts
```

### Criterios de aceptación

* Valida permisos reservations.
* Bloquea acciones sin permiso.
* Tiene tests.

---

## TASK-109 — Crear `OwnReservationGuard`

**Estado:** `[ ] Pending`

### Archivo

```text id="nl1nqs"
policies/own-reservation.guard.ts
```

### Criterios de aceptación

* Valida reserva propia.
* Valida unidad propia.
* Bloquea terceros.
* Bloquea otro tenant.
* Tiene tests.

---

## TASK-110 — Crear `ReservationFinancialGuard`

**Estado:** `[ ] Pending`

### Archivo

```text id="ohszy7"
policies/reservation-financial.guard.ts
```

### Criterios de aceptación

* Valida permiso `reservations.generateCharge`.
* Bloquea usuarios no financieros.
* No permite procesar pagos.
* Tiene tests.

---

## TASK-111 — Crear decorators de permisos

**Estado:** `[ ] Pending`

### Decorators sugeridos

```text id="sndzbt"
@RequireCommonAreaPermission()
@RequireReservationPermission()
@RequireOwnReservationPermission()
@ReservationAction()
@PublicCommonAreaEndpoint()
```

### Criterios de aceptación

* Exponen metadata.
* No contienen lógica de negocio.
* Compatibles con OpenAPI.
* Tienen tests básicos.

---

# 16. Fase 10 — Controladores y endpoints

## TASK-112 — Implementar `CommonAreasController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="y4wyvt"
GET    /api/v1/tenant/common-areas
POST   /api/v1/tenant/common-areas
GET    /api/v1/tenant/common-areas/{commonAreaId}
PATCH  /api/v1/tenant/common-areas/{commonAreaId}
POST   /api/v1/tenant/common-areas/{commonAreaId}/activate
POST   /api/v1/tenant/common-areas/{commonAreaId}/deactivate
POST   /api/v1/tenant/common-areas/{commonAreaId}/mark-maintenance
POST   /api/v1/tenant/common-areas/{commonAreaId}/archive
```

### Criterios de aceptación

* Usa guards.
* Usa DTOs.
* Usa use cases.
* Respuestas estándar.
* Tiene API tests.

---

## TASK-113 — Implementar `CommonAreaAvailabilityController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="miw84v"
GET    /api/v1/tenant/common-areas/{commonAreaId}/availability-windows
POST   /api/v1/tenant/common-areas/{commonAreaId}/availability-windows
PATCH  /api/v1/tenant/common-areas/{commonAreaId}/availability-windows/{windowId}
POST   /api/v1/tenant/common-areas/{commonAreaId}/availability-windows/{windowId}/archive
```

### Criterios de aceptación

* Usa guards.
* Valida commonAreaId.
* Usa use cases.
* Tiene API tests.

---

## TASK-114 — Implementar `CommonAreaBlackoutsController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="egh538"
GET    /api/v1/tenant/common-areas/{commonAreaId}/blackouts
POST   /api/v1/tenant/common-areas/{commonAreaId}/blackouts
POST   /api/v1/tenant/common-areas/{commonAreaId}/blackouts/{blackoutId}/cancel
```

### Criterios de aceptación

* Usa guards.
* Valida razón.
* Usa use cases.
* Tiene API tests.

---

## TASK-115 — Implementar `ReservationsController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="auj8s9"
GET    /api/v1/tenant/reservations
POST   /api/v1/tenant/reservations
GET    /api/v1/tenant/reservations/{reservationId}
POST   /api/v1/tenant/reservations/{reservationId}/approve
POST   /api/v1/tenant/reservations/{reservationId}/reject
POST   /api/v1/tenant/reservations/{reservationId}/cancel
POST   /api/v1/tenant/reservations/{reservationId}/complete
POST   /api/v1/tenant/reservations/{reservationId}/mark-no-show
POST   /api/v1/tenant/reservations/{reservationId}/generate-charge
```

### Criterios de aceptación

* Usa guards.
* Usa DTOs.
* Usa use cases.
* Aplica permisos por endpoint.
* Tiene API tests.

---

## TASK-116 — Implementar `MyReservationsController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="kweyx8"
GET    /api/v1/me/reservations
POST   /api/v1/me/reservations
GET    /api/v1/me/reservations/{reservationId}
POST   /api/v1/me/reservations/{reservationId}/cancel
```

### Criterios de aceptación

* Usa AuthGuard.
* Usa TenantGuard.
* Usa permisos own.
* Usa OwnReservationGuard donde aplique.
* No expone reservas ajenas.
* Tiene API tests.

---

## TASK-117 — Implementar `CommonAreaCalendarController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="w7vfvx"
GET /api/v1/tenant/common-areas/{commonAreaId}/calendar
GET /api/v1/me/common-areas/{commonAreaId}/calendar
```

### Criterios de aceptación

* Admin ve calendario permitido.
* Own ve terceros como busy.
* Rango máximo 31 días.
* No expone datos personales de terceros.
* Tiene API tests.

---

## TASK-118 — Integrar public common areas con módulo 009

**Estado:** `[ ] Pending`

### Endpoints coordinados

```text id="pkd4r7"
GET /api/v1/public/tenants/{slug}/common-areas
GET /api/v1/public/tenants/{slug}/common-areas/{commonAreaSlug}
```

### Criterios de aceptación

* `010` provee reader.
* `009` controla exposición pública.
* Solo campos public-safe.
* No reservas.
* No calendario.
* Tiene tests.

---

# 17. Fase 11 — Errores y responses

## TASK-119 — Mapear errores a HTTP

**Estado:** `[ ] Pending`

### Mapeos principales

```text id="kf2z12"
COMMON_AREA_NOT_FOUND -> 404
COMMON_AREA_NOT_RESERVABLE -> 422
COMMON_AREA_INACTIVE -> 422
COMMON_AREA_MAINTENANCE -> 422
COMMON_AREA_DUPLICATE_CODE -> 409
COMMON_AREA_DUPLICATE_SLUG -> 409
AVAILABILITY_WINDOW_INVALID -> 422
BLACKOUT_INVALID_RANGE -> 422
RESERVATION_NOT_FOUND -> 404
RESERVATION_FORBIDDEN -> 403
RESERVATION_CONFLICT -> 409
RESERVATION_BLACKOUT_CONFLICT -> 409
RESERVATION_OUTSIDE_AVAILABILITY -> 422
RESERVATION_INVALID_TRANSITION -> 409
RESERVATION_INVALID_TIME_RANGE -> 422
RESERVATION_CROSSES_MIDNIGHT -> 422
RESERVATION_DURATION_TOO_SHORT -> 422
RESERVATION_DURATION_TOO_LONG -> 422
RESERVATION_ADVANCE_LIMIT_EXCEEDED -> 422
RESERVATION_CAPACITY_EXCEEDED -> 422
RESERVATION_CANCELLATION_WINDOW_CLOSED -> 409
RESERVATION_UNIT_FORBIDDEN -> 403
RESERVATION_CROSS_TENANT_REFERENCE -> 403
RESERVATION_CHARGE_CONCEPT_REQUIRED -> 422
RESERVATION_CHARGE_ALREADY_GENERATED -> 409
RESERVATION_CHARGE_GENERATION_FAILED -> 500
```

### Criterios de aceptación

* Error estándar.
* Incluye traceId.
* No expone SQL.
* No expone stack trace.
* No expone datos sensibles.
* Tiene tests.

---

## TASK-120 — Implementar response wrapper estándar

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Usa `data`.
* Usa `meta.traceId`.
* Paginados incluyen page/pageSize/total/totalPages.
* No retorna entidades internas.
* No retorna tokens ni secretos.
* Tiene tests.

---

# 18. Fase 12 — Concurrencia e idempotencia

## TASK-121 — Implementar transacciones para creación de reservas

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Creación ejecuta dentro de transacción.
* Valida área.
* Valida disponibilidad.
* Valida blackouts.
* Valida conflictos.
* Crea reserva solo si no hay conflicto.
* Concurrency tests pasan.

---

## TASK-122 — Implementar lock por commonAreaId

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Usa advisory lock o alternativa equivalente.
* Lock vive dentro de transacción.
* No bloquea áreas distintas.
* Evita doble reserva simultánea.
* Tiene tests de concurrencia.

---

## TASK-123 — Revalidar conflictos al aprobar

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Approval revalida disponibilidad.
* Approval revalida blackouts.
* Approval revalida reservas bloqueantes.
* Si aparece conflicto, devuelve 409.
* Tiene tests.

---

## TASK-124 — Implementar idempotencia de cargo

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `reservation.chargeId` evita duplicado.
* `Idempotency-Key` soportado.
* Repetición devuelve mismo cargo o error controlado.
* Concurrency charge tests pasan.

---

# 19. Fase 13 — Auditoría y observabilidad

## TASK-125 — Auditar áreas comunales

**Estado:** `[ ] Pending`

### Eventos

```text id="eedyhr"
commonArea.created
commonArea.updated
commonArea.activated
commonArea.deactivated
commonArea.markedMaintenance
commonArea.archived
```

### Criterios de aceptación

* Eventos generados.
* Metadata sanitizada.
* Sin payload completo.
* Tiene tests.

---

## TASK-126 — Auditar availability y blackouts

**Estado:** `[ ] Pending`

### Eventos

```text id="v77fy9"
commonAreaAvailability.created
commonAreaAvailability.updated
commonAreaAvailability.archived
commonAreaBlackout.created
commonAreaBlackout.cancelled
```

### Criterios de aceptación

* Eventos generados.
* Razón incluida cuando aplica.
* Sin datos sensibles.
* Tiene tests.

---

## TASK-127 — Auditar reservas

**Estado:** `[ ] Pending`

### Eventos

```text id="tyxlfx"
reservation.created
reservation.requested
reservation.approved
reservation.rejected
reservation.cancelled
reservation.completed
reservation.noShow
reservation.expired
reservation.conflictDetected
```

### Criterios de aceptación

* Eventos generados.
* fromStatus/toStatus incluidos.
* actorUserId incluido.
* reason incluida si aplica.
* Tiene tests.

---

## TASK-128 — Auditar generación de cargos

**Estado:** `[ ] Pending`

### Eventos

```text id="qas1ag"
reservation.chargeGenerated
reservation.chargeGenerationFailed
```

### Criterios de aceptación

* Cargo exitoso audita.
* Fallo de cargo audita.
* No incluye datos financieros excesivos.
* Tiene tests.

---

## TASK-129 — Agregar logs estructurados

**Estado:** `[ ] Pending`

### Logs

```text id="nrocbc"
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

### Criterios de aceptación

* Incluyen traceId.
* No contienen tokens.
* No contienen datos personales extensos.
* No contienen payload completo.
* Tiene tests o verificación.

---

## TASK-130 — Agregar métricas

**Estado:** `[ ] Pending`

### Métricas

```text id="f3d7my"
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

### Criterios de aceptación

* Métricas incrementan.
* Labels permitidos: status, action, outcome, areaType.
* No usan tenantId.
* No usan reservationId.
* No usan propertyUnitId.
* No usan userId/personId.
* Tiene tests o verificación.

---

# 20. Fase 14 — OpenAPI

## TASK-131 — Documentar endpoints de áreas comunales

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoints documentados.
* Permisos documentados.
* DTOs documentados.
* Errores documentados.
* OpenAPI valida.

---

## TASK-132 — Documentar endpoints de availability y blackouts

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Availability documentado.
* Blackouts documentado.
* Permisos documentados.
* Errores documentados.
* OpenAPI valida.

---

## TASK-133 — Documentar endpoints de reservas administrativas

**Estado:** `[ ] Pending`

### Criterios de aceptación

* List/create/get/action endpoints documentados.
* Permisos documentados.
* Estados documentados.
* Errores documentados.
* OpenAPI valida.

---

## TASK-134 — Documentar endpoints `/me`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Reservas propias documentadas.
* Own-resource documentado.
* DTOs propios documentados.
* Errores documentados.
* OpenAPI valida.

---

## TASK-135 — Documentar endpoints de calendario

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Calendario admin documentado.
* Calendario propio documentado.
* Rango máximo documentado.
* Privacidad de terceros documentada.
* OpenAPI valida.

---

## TASK-136 — Documentar endpoints públicos coordinados con WordPress

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Public Common Areas documentado.
* Marca `x-public-safe`.
* Marca `x-no-reservation-data`.
* Marca `x-no-calendar-data`.
* Marca `x-no-private-personal-data`.
* Referencia `009-wordpress-integration-basic`.
* No documenta POST público de reservas.

---

# 21. Fase 15 — Pruebas unitarias

## TASK-137 — Implementar unit tests de value objects

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Cubre CommonAreaCode.
* Cubre CommonAreaStatus.
* Cubre CommonAreaType.
* Cubre ReservationStatus.
* Cubre ReservationTimeRange.
* Cubre ReservationDuration.
* Cubre ReservationMoney.
* Cubre AttendeeCount.
* Cubre DayOfWeek.
* Cubre TimeOfDay.
* Pasa en CI.

---

## TASK-138 — Implementar unit tests de entidades

**Estado:** `[ ] Pending`

### Criterios de aceptación

* CommonArea entity.
* AvailabilityWindow entity.
* Blackout entity.
* Reservation entity.
* ReservationStatusHistory entity.
* No exposición public de internalRules.
* Pasa en CI.

---

## TASK-139 — Implementar tests de máquina de estados

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Transiciones permitidas pasan.
* Transiciones prohibidas fallan.
* Razones obligatorias validadas.
* Historial generado.
* Pasa en CI.

---

## TASK-140 — Implementar DTO validation tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Common area DTOs.
* Availability DTOs.
* Blackout DTOs.
* Reservation DTOs.
* Own reservation DTOs.
* Calendar query DTO.
* Public common area DTO.
* Pasa en CI.

---

# 22. Fase 16 — Pruebas de aplicación e integración

## TASK-141 — Implementar tests de servicios

**Estado:** `[ ] Pending`

### Servicios

```text id="w8z1r4"
CommonAreaService
CommonAreaAvailabilityService
CommonAreaBlackoutService
ReservationAvailabilityService
ReservationConflictService
ReservationStateMachineService
ReservationPolicyService
ReservationChargeService
ReservationOwnershipService
ReservationCalendarService
ReservationAuditService
```

### Criterios de aceptación

* Caminos felices.
* Errores.
* Conflictos.
* Blackouts.
* Ownership.
* Cargos.
* Calendario.
* Auditoría.
* Pasa en CI.

---

## TASK-142 — Implementar tests de casos de uso

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Common areas.
* Availability.
* Blackouts.
* Reservations admin.
* Reservations own.
* Calendar.
* Public common areas.
* Pasa en CI.

---

## TASK-143 — Implementar repository tests

**Estado:** `[ ] Pending`

### Repositorios

```text id="lag7yb"
PrismaCommonAreaRepository
PrismaAvailabilityRepository
PrismaBlackoutRepository
PrismaReservationRepository
ReservationStatusHistoryRepository
```

### Criterios de aceptación

* Persistencia correcta.
* Filtros tenant.
* Índices/constraints validados.
* Conflict queries.
* Calendar queries.
* Pasa en CI.

---

# 23. Fase 17 — Pruebas API

## TASK-144 — Implementar API tests de Common Areas

**Estado:** `[ ] Pending`

### Criterios de aceptación

* GET list.
* POST create.
* GET detail.
* PATCH update.
* State actions.
* 401/403/404/409/422.
* Audit event.
* Pasa en CI.

---

## TASK-145 — Implementar API tests de Availability

**Estado:** `[ ] Pending`

### Criterios de aceptación

* List.
* Create.
* Update.
* Archive.
* Validación de horas.
* Permisos.
* Tenant isolation.
* Pasa en CI.

---

## TASK-146 — Implementar API tests de Blackouts

**Estado:** `[ ] Pending`

### Criterios de aceptación

* List.
* Create.
* Cancel.
* Razón obligatoria.
* Rango inválido.
* Permisos.
* Tenant isolation.
* Pasa en CI.

---

## TASK-147 — Implementar API tests de Reservations admin

**Estado:** `[ ] Pending`

### Criterios de aceptación

* List.
* Create.
* Get.
* Approve.
* Reject.
* Cancel.
* Complete.
* Mark no show.
* Generate charge.
* Conflicts.
* Blackouts.
* Availability.
* Pasa en CI.

---

## TASK-148 — Implementar API tests de Reservations own

**Estado:** `[ ] Pending`

### Criterios de aceptación

* List own.
* Create own.
* Get own.
* Cancel own.
* Unidad ajena falla.
* Reserva ajena falla.
* Límite de cancelación.
* Pasa en CI.

---

## TASK-149 — Implementar API tests de Calendar

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Calendario admin.
* Calendario propio.
* Rango máximo.
* Terceros como busy.
* Sin datos personales de terceros.
* Pasa en CI.

---

## TASK-150 — Implementar API tests de Public Common Areas

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Lista áreas públicas.
* Detalle área pública.
* Excluye privadas.
* Excluye inactivas.
* Excluye maintenance.
* No reservas.
* No calendario.
* No internalRules.
* Pasa en CI.

---

# 24. Fase 18 — Authorization, multitenancy, concurrencia y seguridad

## TASK-151 — Implementar authorization tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Sin token devuelve 401.
* Sin membership devuelve 403.
* Sin permiso devuelve 403.
* Admin autorizado pasa.
* Residente autorizado pasa en `/me`.
* Usuario disabled falla.
* Pasa en CI.

---

## TASK-152 — Implementar own-resource tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Usuario no reserva unidad ajena.
* Usuario no lee reserva ajena.
* Usuario no cancela reserva ajena.
* Usuario no filtra por unidad ajena.
* Usuario no accede a tenant B.
* Pasa en CI.

---

## TASK-153 — Implementar multitenancy tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Tenant A no ve áreas B.
* Tenant A no ve reservas B.
* Tenant A no usa commonAreaId B.
* Tenant A no usa propertyUnitId B.
* Tenant A no usa chargeConceptId B.
* Tenant A no usa chargeId B.
* Calendar A no contiene reservas B.
* Public slug A no muestra áreas B.
* Pasa en CI.

---

## TASK-154 — Implementar concurrency tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Dos reservas simultáneas mismo rango: solo una se crea.
* Dos reservas solapadas: una falla 409.
* Reservas contiguas: ambas permitidas.
* Áreas distintas: ambas permitidas.
* Tenants distintos: ambas permitidas.
* Approval simultáneo: solo una approved si solapan.
* Charge simultáneo: un solo cargo.
* Pasa en CI.

---

## TASK-155 — Implementar financial regression tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* feeAmount Decimal.
* feeAmount string.
* requiresPayment exige feeAmount y chargeConcept.
* Cargo al aprobar.
* Cargo tenant correcto.
* Cargo unidad correcta.
* Cargo idempotente.
* Cancelación no revierte cargo.
* Reservas no procesan pagos.
* Pasa en CI.

---

## TASK-156 — Implementar calendar privacy tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Calendario propio no muestra requesterUserId de terceros.
* No muestra requesterPersonId de terceros.
* No muestra propertyUnitId de terceros.
* No muestra propertyUnitCode de terceros.
* No muestra purpose de terceros.
* No muestra notes de terceros.
* Muestra terceros como busy.
* Pasa en CI.

---

## TASK-157 — Implementar public WordPress security tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Público no ve reservas.
* Público no ve calendario.
* Público no ve blackouts internos.
* Público no ve availability completa.
* Público no ve internalRules.
* Público no ve requester data.
* Público no ve propertyUnitId.
* Público no ve chargeId.
* Público no ve paymentStatusSnapshot.
* Público no ve audit data.
* Pasa en CI.

---

# 25. Fase 19 — Auditoría, observabilidad y OpenAPI tests

## TASK-158 — Implementar audit integration tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Eventos de áreas se auditan.
* Eventos de availability se auditan.
* Eventos de blackouts se auditan.
* Eventos de reservas se auditan.
* Eventos de cargos se auditan.
* Metadata sin payload completo.
* Metadata sin tokens/secrets.
* Pasa en CI.

---

## TASK-159 — Implementar observability tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Logs generados.
* Logs sin tokens.
* Logs sin datos personales extensos.
* Métricas incrementan.
* Métricas no usan tenantId.
* Métricas no usan reservationId.
* Métricas no usan userId/personId.
* Pasa en CI.

---

## TASK-160 — Implementar OpenAPI tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Common Areas documentado.
* Availability documentado.
* Blackouts documentado.
* Reservations admin documentado.
* My Reservations documentado.
* Calendar documentado.
* Public Common Areas documentado.
* Money string documentado.
* No endpoint público de creación de reserva.
* No endpoint público de calendario.
* No endpoint público de pagos.
* Pasa en CI.

---

# 26. Fase 20 — CI/CD y smoke tests

## TASK-161 — Agregar scripts de test del módulo

**Estado:** `[ ] Pending`

### Scripts sugeridos

```bash id="ztzxvy"
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

### Criterios de aceptación

* Scripts disponibles.
* Corren localmente.
* Documentados.
* Integrables con CI.

---

## TASK-162 — Agregar validaciones CI

**Estado:** `[ ] Pending`

### CI mínimo

```text id="h6nesb"
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
public WordPress tests
audit integration tests
OpenAPI validation
build
```

### Criterios de aceptación

* Pipeline falla si hay doble reserva.
* Pipeline falla si hay cross-tenant.
* Pipeline falla si hay unidad ajena.
* Pipeline falla si hay exposición pública indebida.
* Pipeline falla si hay float money.
* Pipeline falla si hay cargo duplicado.
* Pipeline falla si OpenAPI no coincide.
* Pipeline falla si build falla.

---

## TASK-163 — Agregar smoke tests

**Estado:** `[ ] Pending`

### Smoke tests

```text id="pi6oyg"
GET /api/v1/health
GET /api/v1/tenant/common-areas
POST /api/v1/tenant/common-areas
POST /api/v1/tenant/common-areas/{commonAreaId}/availability-windows
POST /api/v1/tenant/reservations
POST /api/v1/tenant/reservations solapada
POST /api/v1/tenant/reservations/{reservationId}/approve
GET /api/v1/me/reservations
GET /api/v1/tenant/common-areas/{commonAreaId}/calendar
GET /api/v1/me/common-areas/{commonAreaId}/calendar
GET /api/v1/public/tenants/{slug}/common-areas
GET admin endpoint sin token
```

### Criterios de aceptación

* Smoke tests pasan.
* Errores incluyen traceId.
* No requieren datos reales.
* No ejecutan pagos reales.

---

# 27. Fase 21 — Revisión SDD

## TASK-164 — Validar trazabilidad spec → tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Cada FR tiene pruebas.
* Cada endpoint tiene API tests.
* Cada permiso tiene authorization tests.
* Cada regla de disponibilidad tiene tests.
* Cada regla de conflicto tiene tests.
* Cada regla financiera tiene tests.
* Cada regla public-safe tiene tests.

---

## TASK-165 — Validar cumplimiento de ADRs

**Estado:** `[ ] Pending`

### ADRs

```text id="muzsih"
ADR-003 Database Strategy
ADR-004 Multitenancy Strategy
ADR-007 Authorization Strategy
ADR-010 Observability Strategy
ADR-011 Testing Strategy
ADR-012 CI/CD Strategy
```

### Criterios de aceptación

* PostgreSQL + Prisma.
* tenant_id obligatorio.
* RBAC y permisos.
* Observabilidad.
* Testing.
* CI gates.
* No contradice ADRs.

---

## TASK-166 — Validar OpenAPI final

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Coincide con api-contract.
* No documenta reservas públicas desde WordPress.
* No documenta calendario público.
* No documenta pagos públicos.
* Permisos documentados.
* Errores documentados.
* OpenAPI valida.

---

## TASK-167 — Ejecutar suite completa

**Estado:** `[ ] Pending`

### Comandos

```bash id="qab3ru"
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

### Criterios de aceptación

* Todo pasa.
* No hay tests omitidos sin justificación.
* No hay datos reales.
* No hay secretos.
* No hay endpoints fuera de alcance.

---

## TASK-168 — Preparar evidencia de implementación

**Estado:** `[ ] Pending`

### Evidencia mínima

```text id="vcyuq3"
- PR link o commit SHA.
- Migración aplicada.
- Seeds demo.
- Endpoints implementados.
- Tests ejecutados.
- OpenAPI actualizado.
- Smoke tests ejecutados.
- Riesgos pendientes.
- Diferidos documentados.
```

---

# 28. Fase 22 — Pendientes diferidos controlados

## TASK-169 — Diferir pagos online de reservas

**Estado:** `[-] Deferred`

### Razón

Requiere pasarela, flujo financiero, seguridad reforzada, comprobantes y autorización fuerte.

### Futuro

```text id="xdqkv0"
docs/specs/00X-reservation-payments/
```

---

## TASK-170 — Diferir depósitos en garantía

**Estado:** `[-] Deferred`

### Razón

Requiere reglas financieras adicionales, devolución, retención y conciliación.

### Futuro

```text id="yy3d9s"
docs/specs/00X-reservation-deposits/
```

---

## TASK-171 — Diferir penalizaciones automáticas

**Estado:** `[-] Deferred`

### Razón

Requiere reglas de daños, inspección y multas.

### Futuro

```text id="dc5dzp"
docs/specs/00X-reservation-penalties/
```

---

## TASK-172 — Diferir reservas recurrentes

**Estado:** `[-] Deferred`

### Razón

Requiere reglas de recurrencia, expansión de calendario e invalidación.

### Futuro

```text id="jhitzo"
docs/specs/00X-recurring-reservations/
```

---

## TASK-173 — Diferir reservas multi-día y nocturnas

**Estado:** `[-] Deferred`

### Razón

MVP no permite reservas que crucen medianoche local.

### Futuro

```text id="n521ix"
docs/specs/00X-multi-day-reservations/
```

---

## TASK-174 — Diferir lista de espera

**Estado:** `[-] Deferred`

### Razón

Requiere cola, prioridad y notificaciones.

### Futuro

```text id="s51vo8"
docs/specs/00X-reservation-waitlist/
```

---

## TASK-175 — Diferir QR, check-in/check-out y control de acceso

**Estado:** `[-] Deferred`

### Razón

Requiere integración física, seguridad adicional y flujos operativos.

### Futuro

```text id="ioxkm7"
docs/specs/00X-reservation-access-control/
```

---

## TASK-176 — Diferir inspecciones post-reserva

**Estado:** `[-] Deferred`

### Razón

Requiere inventario, evidencias, fotografías, daños y posibles multas.

### Futuro

```text id="irxxj6"
docs/specs/00X-reservation-inspections/
```

---

## TASK-177 — Diferir sincronización Google Calendar

**Estado:** `[-] Deferred`

### Razón

Requiere integración externa, OAuth, webhooks y manejo de conflictos.

### Futuro

```text id="i00n35"
docs/specs/00X-reservation-calendar-sync/
```

---

## TASK-178 — Diferir notificaciones automáticas

**Estado:** `[-] Deferred`

### Razón

Requiere módulo de comunicaciones y canales email/WhatsApp.

### Futuro

```text id="v6xc8d"
docs/specs/00X-reservation-notifications/
```

---

## TASK-179 — Diferir reservas desde WordPress

**Estado:** `[-] Deferred`

### Razón

Requiere autenticación, autorización, protección CSRF, SSO y portal de residentes.

### Futuro

```text id="k73ts5"
docs/specs/00X-wordpress-reservations/
```

---

## TASK-180 — Diferir SSO WordPress

**Estado:** `[-] Deferred`

### Razón

Depende de Keycloak, OIDC, redirect URIs, sesión y portal de residentes.

### Futuro

```text id="ns6p2r"
docs/specs/00X-keycloak-sso/
```

---

# 29. Definition of Done

El módulo `010-reservations-common-areas` estará terminado cuando:

```text id="h5mf5v"
[ ] Documentación completa.
[ ] Módulo reservations creado.
[ ] Migración creada y ejecutada.
[ ] common_areas implementado.
[ ] common_area_availability_windows implementado.
[ ] common_area_blackouts implementado.
[ ] reservations implementado.
[ ] reservation_status_history implementado.
[ ] Seeds demo creados.
[ ] Value objects implementados.
[ ] Entidades implementadas.
[ ] Eventos implementados.
[ ] Errores implementados.
[ ] DTOs implementados.
[ ] Puertos implementados.
[ ] Repositorios implementados.
[ ] Servicios implementados.
[ ] Casos de uso implementados.
[ ] Guards/policies implementados.
[ ] Controladores implementados.
[ ] CRUD administrativo de áreas implementado.
[ ] Availability windows implementadas.
[ ] Blackouts implementados.
[ ] Reservas administrativas implementadas.
[ ] Reservas propias implementadas.
[ ] Aprobación implementada.
[ ] Rechazo implementado.
[ ] Cancelación implementada.
[ ] Completar reserva implementado.
[ ] No show implementado.
[ ] Calendario admin implementado.
[ ] Calendario propio implementado.
[ ] Catálogo público WordPress implementado o integrado.
[ ] Estrategia anti-solapamiento implementada.
[ ] Concurrencia protegida.
[ ] Generación de cargo idempotente implementada.
[ ] No se procesan pagos desde reservas.
[ ] No se revierten cargos automáticamente.
[ ] Historial de estados implementado.
[ ] Auditoría implementada.
[ ] Logs sanitizados implementados.
[ ] Métricas implementadas.
[ ] OpenAPI actualizado.
[ ] Unit tests pasan.
[ ] Entity tests pasan.
[ ] State machine tests pasan.
[ ] DTO tests pasan.
[ ] Application tests pasan.
[ ] Repository integration tests pasan.
[ ] API tests pasan.
[ ] Authorization tests pasan.
[ ] Own-resource tests pasan.
[ ] Multitenancy tests pasan.
[ ] Concurrency tests pasan.
[ ] Financial regression tests pasan.
[ ] Calendar privacy tests pasan.
[ ] Public WordPress tests pasan.
[ ] Audit integration tests pasan.
[ ] Observability tests pasan.
[ ] OpenAPI tests pasan.
[ ] Smoke tests pasan.
[ ] CI pasa.
[ ] Diferidos documentados.
```

---

## 30. Orden recomendado de ejecución

```text id="e6qn45"
1. TASK-001 a TASK-008      Documentación
2. TASK-009 a TASK-012      Estructura base
3. TASK-013 a TASK-023      Value objects
4. TASK-024 a TASK-034      Entidades, eventos y errores
5. TASK-035 a TASK-046      Base de datos, Prisma y seeds
6. TASK-047 a TASK-054      DTOs
7. TASK-055 a TASK-070      Puertos y repositorios
8. TASK-071 a TASK-082      Servicios
9. TASK-083 a TASK-104      Casos de uso
10. TASK-105 a TASK-111     Guards, policies y decorators
11. TASK-112 a TASK-118     Controladores
12. TASK-119 a TASK-120     Errores y responses
13. TASK-121 a TASK-124     Concurrencia e idempotencia
14. TASK-125 a TASK-130     Auditoría y observabilidad
15. TASK-131 a TASK-136     OpenAPI
16. TASK-137 a TASK-160     Pruebas
17. TASK-161 a TASK-163     CI/CD y smoke
18. TASK-164 a TASK-168     Revisión SDD
19. TASK-169 a TASK-180     Diferidos controlados
```

---

## 31. Riesgos de ejecución

| Riesgo                            | Impacto    | Mitigación                                 |
| --------------------------------- | ---------- | ------------------------------------------ |
| Doble reserva                     | Alto       | transacción + lock + tests de concurrencia |
| Solapamiento no detectado         | Alto       | ReservationConflictService                 |
| Blackout ignorado                 | Alto       | Blackout validation                        |
| Reserva de unidad ajena           | Alto       | ReservationOwnershipService                |
| Reserva cross-tenant              | Crítico    | tenant_id + guards + tests                 |
| Cargo duplicado                   | Alto       | idempotencia + chargeId unique             |
| Uso de float                      | Alto       | Decimal + tests financieros                |
| Transición inválida               | Alto       | State machine                              |
| Cancelación incorrecta            | Medio/alto | ReservationPolicyService                   |
| WordPress ve reservas             | Alto       | public DTO + no endpoint                   |
| Calendario propio expone terceros | Alto       | privacy-safe DTO                           |
| Logs con datos personales         | Alto       | logging policy + tests                     |
| Falta de auditoría                | Alto       | audit service + tests                      |
| OpenAPI inconsistente             | Medio      | OpenAPI tests                              |
| Implementar pagos fuera de scope  | Alto       | PR checklist + diferidos                   |

---

## 32. Checklist de revisión de PR

```text id="omarkx"
[ ] Sigue spec.md.
[ ] Sigue plan.md.
[ ] Sigue data-model.md.
[ ] Sigue api-contract.md.
[ ] Sigue test-plan.md.
[ ] No implementa pagos online fuera de scope.
[ ] No implementa reservas recurrentes fuera de scope.
[ ] No implementa QR fuera de scope.
[ ] No implementa WordPress reservations fuera de scope.
[ ] Todas las tablas nuevas tienen tenant_id.
[ ] Todas las consultas filtran por tenant_id.
[ ] No se busca reserva solo por reservationId.
[ ] No se busca área solo por commonAreaId.
[ ] No se permite commonAreaId de otro tenant.
[ ] No se permite propertyUnitId de otro tenant.
[ ] No se permite chargeConceptId de otro tenant.
[ ] No se permite chargeId de otro tenant.
[ ] Se valida startAt < endAt.
[ ] Se bloquean reservas que cruzan medianoche local.
[ ] Se valida disponibilidad.
[ ] Se valida blackout.
[ ] Se valida conflicto.
[ ] Se usa transacción.
[ ] Se usa lock o mecanismo equivalente.
[ ] Approval revalida conflicto.
[ ] /me valida unidad propia.
[ ] /me no expone reservas ajenas.
[ ] Calendario propio muestra terceros como busy.
[ ] Calendario propio no expone datos personales de terceros.
[ ] WordPress solo ve catálogo público.
[ ] WordPress no ve reservas.
[ ] WordPress no ve calendario.
[ ] WordPress no crea reservas.
[ ] Money usa Decimal.
[ ] Money sale como string.
[ ] No se usa float/double.
[ ] Cargo se genera de forma idempotente.
[ ] No se procesan pagos.
[ ] No se confirman pagos.
[ ] No se asignan pagos.
[ ] No se modifican comprobantes.
[ ] Cancelación no revierte cargo automáticamente.
[ ] Se registra ReservationStatusHistory.
[ ] Se auditan operaciones críticas.
[ ] Audit metadata está sanitizada.
[ ] Logs no contienen tokens.
[ ] Logs no contienen datos personales extensos.
[ ] Métricas no usan tenantId.
[ ] Métricas no usan reservationId.
[ ] OpenAPI actualizado.
[ ] OpenAPI no documenta POST público de reservas.
[ ] OpenAPI no documenta calendario público.
[ ] Tests unitarios pasan.
[ ] Tests API pasan.
[ ] Tests autorización pasan.
[ ] Tests own-resource pasan.
[ ] Tests multitenant pasan.
[ ] Tests concurrencia pasan.
[ ] Tests financieros pasan.
[ ] Tests calendario pasan.
[ ] Tests seguridad pasan.
[ ] CI pasa.
```

---

## 33. Resultado final esperado

Al completar estas tareas, RESIDENT Core tendrá un módulo funcional para gestionar áreas comunales y reservas de forma segura, auditable y preparada para integrarse con cargos financieros y con el catálogo público de WordPress.

El resultado esperado incluye:

```text id="mzg6b4"
- catálogo administrativo de áreas comunales;
- configuración de disponibilidad;
- configuración de blackouts;
- reservas administrativas;
- reservas propias;
- aprobación/rechazo/cancelación/cierre/no-show;
- calendario administrativo;
- calendario propio con privacidad;
- detección de conflictos;
- prevención de doble reserva;
- generación opcional de cargos;
- idempotencia financiera;
- auditoría completa;
- catálogo público WordPress;
- pruebas completas;
- OpenAPI actualizado;
- CI passing.
```

La implementación no debe aceptarse si:

```text id="gs1fxc"
permite doble reserva
permite reservas cross-tenant
permite reservar unidades ajenas
permite ver reservas ajenas desde /me
expone reservas privadas a WordPress
expone calendario interno públicamente
genera cargos duplicados
usa float para dinero
procesa pagos desde reservas
revierte cargos automáticamente al cancelar
elimina historial
omite auditoría
permite transiciones inválidas
crea endpoints públicos de escritura
```

Antes de cerrar el paquete documental de `010-reservations-common-areas`, debe completarse:

```text id="w6f8dm"
docs/specs/010-reservations-common-areas/security-notes.md
```
