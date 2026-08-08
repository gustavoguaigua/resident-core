# Tasks — Spec 004 Dues, Fees, Charge Concepts and Charge Generation

## 1. Información del documento

| Campo           | Valor                                                        |
| --------------- | ------------------------------------------------------------ |
| Proyecto        | RESIDENT Core                                                |
| Spec ID         | 004                                                          |
| Módulo          | Dues and Fees                                                |
| Documento       | Implementation Tasks                                         |
| Ruta            | `docs/specs/004-dues-fees/tasks.md`                          |
| Versión         | 0.1                                                          |
| Estado          | Borrador inicial                                             |
| Fecha           | 2026-07-14                                                   |
| Documento base  | `docs/specs/004-dues-fees/spec.md`                           |
| Plan técnico    | `docs/specs/004-dues-fees/plan.md`                           |
| Modelo de datos | `docs/specs/004-dues-fees/data-model.md`                     |
| Contrato API    | `docs/specs/004-dues-fees/api-contract.md`                   |
| Plan de pruebas | `docs/specs/004-dues-fees/test-plan.md`                      |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties` |

---

## 2. Propósito

Este documento convierte la spec `004-dues-fees` en una lista ejecutable de tareas para implementar el primer módulo financiero formal de RESIDENT Core.

El módulo debe permitir administrar:

* conceptos de cobro;
* configuraciones de alícuotas;
* asignaciones de alícuotas a unidades;
* periodos financieros;
* generación mensual de cargos;
* cargos ordinarios;
* cargos extraordinarios;
* cargos manuales;
* lotes de generación;
* cancelaciones;
* reversos;
* ajustes;
* consulta administrativa de cargos;
* consulta propia de cargos;
* precisión monetaria;
* idempotencia;
* auditoría financiera;
* eventos financieros;
* pruebas financieras de regresión.

Regla central:

```text id="3zerb7"
No se debe implementar ninguna operación financiera sin tenantId, autorización, precisión decimal, idempotencia cuando aplique, auditoría y pruebas.
```

---

## 3. Convenciones de estado

Usar los siguientes estados:

```text id="j23amv"
[ ] Pending
[/] In Progress
[x] Done
[!] Blocked
[-] Deferred
```

Regla:

```text id="jcc4dk"
No marcar una tarea como [x] hasta que exista evidencia real de implementación, prueba, revisión o commit.
```

---

## 4. Reglas de ejecución

Antes de implementar código, se debe revisar:

```text id="tfl2h1"
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
```

Reglas obligatorias:

```text id="wkv06b"
1. Todo registro financiero debe tener tenantId.
2. Todo cargo debe asociarse a PropertyUnit.
3. Todo monto financiero debe usar Decimal.
4. No se permite float ni double para dinero.
5. No se permite acceso cross-tenant.
6. No se permite usar unidades de otro tenant.
7. No se permite usar conceptos de otro tenant.
8. No se permite generar cargos en periodos closed o locked.
9. No se permite generar cargos ordinarios para unidades archived.
10. No se permite duplicar cargos mensuales.
11. No se permite sobrescribir originalAmount.
12. No se permite eliminar físicamente cargos emitidos.
13. Toda cancelación requiere motivo.
14. Todo reverso requiere motivo.
15. Todo ajuste requiere motivo.
16. Todo cambio financiero crítico debe auditarse.
17. Todo endpoint financiero privado debe tener AuthGuard.
18. Todo endpoint tenant-scoped debe tener TenantGuard.
19. Todo endpoint financiero administrativo debe tener TenantPermissionGuard.
20. Todo endpoint .own debe validar OwnChargePolicyService.
21. No se deben implementar pagos en esta spec.
22. No se deben implementar estados de cuenta consolidados en esta spec.
23. No se deben implementar mora avanzada en esta spec.
24. No se deben implementar comprobantes ni conciliación bancaria en esta spec.
25. No se deben usar datos reales en seeds.
```

---

## 5. Resumen de entregables

Al cerrar esta spec deben existir:

```text id="jm6awo"
docs/specs/004-dues-fees/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

Y en backend:

```text id="vlmmo0"
apps/api/src/modules/dues-fees/
├── dues-fees.module.ts
├── charge-concepts.controller.ts
├── fee-schedules.controller.ts
├── unit-fees.controller.ts
├── billing-periods.controller.ts
├── charge-generation.controller.ts
├── charge-batches.controller.ts
├── charges.controller.ts
├── own-charges.controller.ts
├── application/
├── domain/
├── infrastructure/
├── policies/
├── dto/
└── tests/
```

---

# 6. Fase 0 — Preparación documental

## TASK-001 — Crear carpeta de spec

**Estado:** `[ ] Pending`

### Ruta

```text id="mrdf6b"
docs/specs/004-dues-fees/
```

### Criterios de aceptación

* La carpeta existe.
* Contiene documentos de la spec.
* Sigue la estructura usada en `001-tenants`, `002-users-roles` y `003-residents-properties`.

---

## TASK-002 — Registrar spec funcional

**Estado:** `[ ] Pending`

### Archivo

```text id="u5sixc"
docs/specs/004-dues-fees/spec.md
```

### Criterios de aceptación

* Define propósito.
* Define alcance.
* Define actores.
* Define reglas de negocio.
* Define flujos financieros.
* Define historias de usuario.
* Define requisitos funcionales.
* Define requisitos no funcionales.
* Define API preliminar.
* Define riesgos financieros.
* Define criterios globales.

---

## TASK-003 — Registrar plan técnico

**Estado:** `[ ] Pending`

### Archivo

```text id="nyp969"
docs/specs/004-dues-fees/plan.md
```

### Criterios de aceptación

* Define arquitectura del módulo.
* Define carpetas.
* Define entidades.
* Define value objects.
* Define repositorios.
* Define servicios.
* Define casos de uso.
* Define controladores.
* Define auditoría.
* Define eventos.
* Define observabilidad.
* Define estrategia de entrega.

---

## TASK-004 — Registrar modelo de datos

**Estado:** `[ ] Pending`

### Archivo

```text id="n4oz95"
docs/specs/004-dues-fees/data-model.md
```

### Criterios de aceptación

* Define tablas.
* Define columnas.
* Define enums.
* Define relaciones.
* Define constraints.
* Define índices.
* Define modelo Prisma.
* Define reglas de idempotencia.
* Define precisión monetaria.
* Define seeds.
* Define compatibilidad con pagos y estados de cuenta.

---

## TASK-005 — Registrar contrato API

**Estado:** `[ ] Pending`

### Archivo

```text id="e10ki7"
docs/specs/004-dues-fees/api-contract.md
```

### Criterios de aceptación

* Define endpoints administrativos.
* Define endpoints `.own`.
* Define permisos.
* Define requests.
* Define responses.
* Define errores.
* Define generación mensual.
* Define batches.
* Define cancelaciones.
* Define reversos.
* Define ajustes.
* Define OpenAPI.

---

## TASK-006 — Registrar plan de pruebas

**Estado:** `[ ] Pending`

### Archivo

```text id="autthq"
docs/specs/004-dues-fees/test-plan.md
```

### Criterios de aceptación

* Define unit tests.
* Define application tests.
* Define integration tests.
* Define API tests.
* Define authorization tests.
* Define own access tests.
* Define multitenancy tests.
* Define money precision tests.
* Define idempotency tests.
* Define financial regression tests.
* Define security tests.

---

## TASK-007 — Registrar tareas de implementación

**Estado:** `[ ] Pending`

### Archivo

```text id="dhg7bz"
docs/specs/004-dues-fees/tasks.md
```

### Criterios de aceptación

* Tareas ordenadas por fases.
* Tareas ejecutables.
* Criterios de aceptación claros.
* Pruebas asociadas.
* Pendientes diferidos documentados.

---

## TASK-008 — Registrar notas de seguridad

**Estado:** `[ ] Pending`

### Archivo

```text id="saqxkh"
docs/specs/004-dues-fees/security-notes.md
```

### Criterios de aceptación

* Identifica riesgos financieros.
* Define controles de precisión monetaria.
* Define controles de idempotencia.
* Define controles de multitenancy.
* Define controles de acceso propio.
* Define reglas de auditoría.
* Define reglas de logs.
* Define pruebas de seguridad.

---

# 7. Fase 1 — Estructura base del módulo

## TASK-009 — Crear módulo NestJS `dues-fees`

**Estado:** `[ ] Pending`

### Archivo

```text id="ar1j9t"
apps/api/src/modules/dues-fees/dues-fees.module.ts
```

### Criterios de aceptación

* El módulo compila.
* Está registrado en `AppModule`.
* No depende de módulos futuros.
* Importa dependencias necesarias de tenants, users-roles y residents-properties.
* No contiene lógica de negocio.

---

## TASK-010 — Crear estructura de carpetas

**Estado:** `[ ] Pending`

### Estructura

```text id="4ks76k"
apps/api/src/modules/dues-fees/
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
│   ├── audit/
│   └── events/
├── policies/
├── dto/
└── tests/
```

### Criterios de aceptación

* Estructura creada.
* Respeta `plan.md`.
* Controladores no usan Prisma directamente.
* Dominio no depende de infraestructura.
* Servicios de aplicación no dependen de controladores.

---

## TASK-011 — Crear controladores base

**Estado:** `[ ] Pending`

### Archivos

```text id="evjcmw"
charge-concepts.controller.ts
fee-schedules.controller.ts
unit-fees.controller.ts
billing-periods.controller.ts
charge-generation.controller.ts
charge-batches.controller.ts
charges.controller.ts
own-charges.controller.ts
```

### Criterios de aceptación

* Compilan.
* Están registrados en `DuesFeesModule`.
* Tienen rutas base correctas.
* No contienen lógica de negocio.
* Solo orquestan DTOs, guards y use cases.

---

# 8. Fase 2 — Value objects

## TASK-012 — Implementar `Money`

**Estado:** `[ ] Pending`

### Archivo

```text id="w6owv3"
domain/value-objects/money.vo.ts
```

### Criterios de aceptación

* Usa Decimal.
* Valida amount.
* Valida currency.
* Serializa como string.
* Prohíbe float inseguro.
* Soporta suma y resta.
* Tiene unit tests.

### Pruebas

```text id="5pjdso"
UT-MONEY-001 a UT-MONEY-008
MONEY-001 a MONEY-009
```

---

## TASK-013 — Implementar `ChargeConceptCode`

**Estado:** `[ ] Pending`

### Archivo

```text id="orj0jb"
domain/value-objects/charge-concept-code.vo.ts
```

### Criterios de aceptación

* Requiere valor.
* Aplica trim.
* Normaliza formato.
* Valida longitud máxima.
* Rechaza vacío.
* Tiene unit tests.

---

## TASK-014 — Implementar `BillingPeriodCode`

**Estado:** `[ ] Pending`

### Archivo

```text id="a6mzm4"
domain/value-objects/billing-period-code.vo.ts
```

### Criterios de aceptación

* Valida formato `YYYY-MM`.
* Rechaza mes inválido.
* Deriva `startsAt`.
* Deriva `endsAt`.
* Tiene unit tests.

---

## TASK-015 — Implementar `DueDate`

**Estado:** `[ ] Pending`

### Archivo

```text id="l5zd9a"
domain/value-objects/due-date.vo.ts
```

### Criterios de aceptación

* Valida fecha.
* Soporta fechas dentro o después del periodo.
* Rechaza fecha inválida.
* Tiene unit tests.

---

## TASK-016 — Implementar `IdempotencyKey`

**Estado:** `[ ] Pending`

### Archivo

```text id="e2jq8e"
domain/value-objects/idempotency-key.vo.ts
```

### Criterios de aceptación

* Construye clave estable.
* Requiere tenant, periodo, schedule, unidad y tipo.
* Misma entrada produce misma clave.
* Entradas distintas producen claves distintas.
* Rechaza clave vacía.
* Tiene unit tests.

---

## TASK-017 — Implementar `ChargeStatus`

**Estado:** `[ ] Pending`

### Archivo

```text id="wf0tx4"
domain/value-objects/charge-status.vo.ts
```

### Criterios de aceptación

* Valida estados permitidos.
* Define si es cancelable.
* Define si es reversible.
* Define si es ajustable.
* Bloquea estados reservados para pagos en MVP.
* Tiene unit tests.

---

## TASK-018 — Implementar `ChargeType`

**Estado:** `[ ] Pending`

### Archivo

```text id="b1p9ex"
domain/value-objects/charge-type.vo.ts
```

### Criterios de aceptación

* Valida tipos permitidos.
* Marca tipos operativos en MVP.
* Reserva `fine`, `reservation`, `openingBalance`.
* Tiene unit tests.

---

## TASK-019 — Implementar `FeeFrequency`

**Estado:** `[ ] Pending`

### Archivo

```text id="qt1r8w"
domain/value-objects/fee-frequency.vo.ts
```

### Criterios de aceptación

* Valida `monthly`.
* Valida `oneTime`.
* Soporta valores futuros sin activarlos funcionalmente si no aplica.
* Tiene unit tests.

---

## TASK-020 — Implementar value objects de estados financieros

**Estado:** `[ ] Pending`

### Archivos

```text id="iy1fhd"
charge-concept-status.vo.ts
fee-schedule-status.vo.ts
unit-fee-assignment-status.vo.ts
billing-period-status.vo.ts
charge-batch-status.vo.ts
adjustment-type.vo.ts
currency-code.vo.ts
```

### Criterios de aceptación

* Cada estado valida valores permitidos.
* `archived` no opera ordinariamente.
* `closed` y `locked` bloquean generación.
* `cancelled` y `reversed` bloquean operaciones ordinarias.
* Tienen unit tests.

---

# 9. Fase 3 — Entidades de dominio

## TASK-021 — Implementar entidad `ChargeConcept`

**Estado:** `[ ] Pending`

### Archivo

```text id="agj99c"
domain/entities/charge-concept.entity.ts
```

### Métodos esperados

```text id="jmo3ru"
update(input)
archive(actorId, reason)
isActive()
isArchived()
canGenerateCharges()
```

### Criterios de aceptación

* Valida code.
* Valida name.
* Valida defaultAmount si existe.
* Bloquea generación si archived/inactive.
* No elimina físicamente.
* Tiene unit tests.

---

## TASK-022 — Implementar entidad `FeeSchedule`

**Estado:** `[ ] Pending`

### Archivo

```text id="vz1u5x"
domain/entities/fee-schedule.entity.ts
```

### Métodos esperados

```text id="f7zly0"
update(input)
archive(actorId, reason)
isActive()
isEffectiveAt(date)
canGenerateAt(date)
```

### Criterios de aceptación

* Valida monto Decimal.
* Valida currency.
* Valida frecuencia.
* Valida fechas.
* No modifica cargos emitidos.
* Tiene unit tests.

---

## TASK-023 — Implementar entidad `UnitFeeAssignment`

**Estado:** `[ ] Pending`

### Archivo

```text id="vko77i"
domain/entities/unit-fee-assignment.entity.ts
```

### Métodos esperados

```text id="yxzie0"
end(endDate, actorId, reason)
isActive()
isEffectiveAt(date)
isEnded()
```

### Criterios de aceptación

* Valida fechas.
* Finaliza con `endDate`.
* Conserva historial.
* No se elimina físicamente.
* Tiene unit tests.

---

## TASK-024 — Implementar entidad `BillingPeriod`

**Estado:** `[ ] Pending`

### Archivo

```text id="s3k2tv"
domain/entities/billing-period.entity.ts
```

### Métodos esperados

```text id="831xru"
close(actorId, reason)
lock(actorId, reason)
isOpen()
canGenerateOrdinaryCharges()
```

### Criterios de aceptación

* Valida periodCode.
* Deriva startsAt y endsAt.
* Cierra periodo open.
* Bloquea periodo.
* Impide generación si closed/locked.
* Tiene unit tests.

---

## TASK-025 — Implementar entidad `ChargeBatch`

**Estado:** `[ ] Pending`

### Archivo

```text id="b3yv6f"
domain/entities/charge-batch.entity.ts
```

### Métodos esperados

```text id="65gcp6"
markProcessing()
markCompleted(stats)
markCompletedWithErrors(stats)
markCancelled(reason)
updateStats(stats)
```

### Criterios de aceptación

* Registra totales.
* Rechaza conteos negativos.
* Soporta completed y completedWithErrors.
* No guarda datos personales en errorSummary.
* Tiene unit tests.

---

## TASK-026 — Implementar entidad `Charge`

**Estado:** `[ ] Pending`

### Archivo

```text id="ewou29"
domain/entities/charge.entity.ts
```

### Métodos esperados

```text id="3fqhej"
cancel(actorId, reason)
reverse(actorId, reason)
applyAdjustment(adjustment)
recalculateEffectiveAmount()
isCancelable()
isReversible()
isAdjustable()
assertOriginalAmountImmutable()
```

### Criterios de aceptación

* Valida originalAmount.
* Inicializa effectiveAmount igual a originalAmount.
* Cancela sin eliminar.
* Reversa sin eliminar.
* No modifica originalAmount.
* Tiene unit tests.

---

## TASK-027 — Implementar entidad `ChargeAdjustment`

**Estado:** `[ ] Pending`

### Archivo

```text id="f3dhj0"
domain/entities/charge-adjustment.entity.ts
```

### Métodos esperados

```text id="ve3q2f"
reverse(actorId, reason)
isReversed()
affectsAmount()
```

### Criterios de aceptación

* Valida tipo.
* Valida monto positivo.
* Requiere razón.
* No se elimina físicamente.
* Tiene unit tests.

---

## TASK-028 — Implementar entidad `ChargeReversal`

**Estado:** `[ ] Pending`

### Archivo

```text id="a9r6nn"
domain/entities/charge-reversal.entity.ts
```

### Criterios de aceptación

* Requiere cargo.
* Requiere motivo.
* Requiere actor.
* Soporta traceId.
* Solo un reverso por cargo en MVP.
* Tiene unit tests.

---

## TASK-029 — Implementar errores de dominio

**Estado:** `[ ] Pending`

### Archivos esperados

```text id="hj7elo"
charge-concept-not-found.error.ts
charge-concept-code-already-exists.error.ts
charge-concept-not-active.error.ts
fee-schedule-not-found.error.ts
fee-schedule-not-active.error.ts
unit-fee-assignment-not-found.error.ts
unit-fee-assignment-already-active.error.ts
unit-fee-assignment-already-ended.error.ts
billing-period-not-found.error.ts
billing-period-already-exists.error.ts
billing-period-not-open.error.ts
billing-period-already-closed.error.ts
billing-period-locked.error.ts
charge-batch-not-found.error.ts
charge-not-found.error.ts
charge-already-exists.error.ts
charge-already-cancelled.error.ts
charge-already-reversed.error.ts
charge-not-adjustable.error.ts
charge-not-cancelable.error.ts
charge-not-reversible.error.ts
money-amount-invalid.error.ts
currency-not-supported.error.ts
idempotency-conflict.error.ts
own-property-unit-not-found.error.ts
own-person-not-linked.error.ts
cross-tenant-reference.error.ts
```

### Criterios de aceptación

* Cada error tiene código estable.
* Cada error mapea a HTTP status.
* No expone detalles internos.
* No expone datos financieros sensibles innecesarios.

---

## TASK-030 — Implementar eventos de dominio

**Estado:** `[ ] Pending`

### Archivos esperados

```text id="6d0obf"
charge-concept-created.event.ts
charge-concept-updated.event.ts
charge-concept-archived.event.ts
fee-schedule-created.event.ts
fee-schedule-updated.event.ts
fee-schedule-archived.event.ts
unit-fee-assigned.event.ts
unit-fee-ended.event.ts
billing-period-created.event.ts
billing-period-closed.event.ts
billing-period-locked.event.ts
charge-batch-created.event.ts
charge-batch-processing.event.ts
charge-batch-completed.event.ts
charge-batch-completed-with-errors.event.ts
monthly-fees-generated.event.ts
charge-created.event.ts
manual-charge-created.event.ts
extraordinary-charges-created.event.ts
charge-cancelled.event.ts
charge-reversed.event.ts
charge-adjusted.event.ts
```

### Criterios de aceptación

* Incluyen `tenantId`.
* Incluyen `actorUserId` cuando aplique.
* Incluyen `traceId`.
* Incluyen referencias financieras necesarias.
* No incluyen payload completo.
* No incluyen datos personales de propietarios o residentes.

---

# 10. Fase 4 — DTOs y validación

## TASK-031 — Crear DTOs de Charge Concepts

**Estado:** `[ ] Pending`

### Archivos

```text id="5skz81"
create-charge-concept.dto.ts
update-charge-concept.dto.ts
archive-charge-concept.dto.ts
charge-concept-response.dto.ts
list-charge-concepts-query.dto.ts
```

### Criterios de aceptación

* Valida code.
* Valida name.
* Valida category.
* Valida defaultAmount como decimal string.
* Valida currency USD.
* No permite `tenantId` desde body.

---

## TASK-032 — Crear DTOs de Fee Schedules

**Estado:** `[ ] Pending`

### Archivos

```text id="xr1u5c"
create-fee-schedule.dto.ts
update-fee-schedule.dto.ts
archive-fee-schedule.dto.ts
fee-schedule-response.dto.ts
list-fee-schedules-query.dto.ts
```

### Criterios de aceptación

* Valida chargeConceptId.
* Valida amount.
* Valida frequency.
* Valida effectiveFrom/effectiveTo.
* No permite `tenantId`.

---

## TASK-033 — Crear DTOs de Unit Fee Assignments

**Estado:** `[ ] Pending`

### Archivos

```text id="k3nhds"
assign-unit-fee.dto.ts
end-unit-fee-assignment.dto.ts
unit-fee-assignment-response.dto.ts
list-unit-fees-query.dto.ts
```

### Criterios de aceptación

* Valida propertyUnitId.
* Valida feeScheduleId.
* Valida fechas.
* Requiere reason al finalizar.
* No permite `tenantId`.

---

## TASK-034 — Crear DTOs de Billing Periods

**Estado:** `[ ] Pending`

### Archivos

```text id="4syaeg"
create-billing-period.dto.ts
close-billing-period.dto.ts
lock-billing-period.dto.ts
billing-period-response.dto.ts
list-billing-periods-query.dto.ts
```

### Criterios de aceptación

* Valida periodCode `YYYY-MM`.
* Valida dueDate.
* Requiere reason para close/lock.
* No permite `tenantId`.

---

## TASK-035 — Crear DTOs de Charge Generation

**Estado:** `[ ] Pending`

### Archivos

```text id="bl8ep8"
generate-monthly-charges.dto.ts
generate-monthly-charges-response.dto.ts
```

### Criterios de aceptación

* Valida billingPeriodId.
* Valida feeScheduleId opcional.
* Valida dryRun.
* Response contiene batchId, totales y montos.
* Montos serializados como string.

---

## TASK-036 — Crear DTOs de Charge Batches

**Estado:** `[ ] Pending`

### Archivos

```text id="ueyudk"
charge-batch-response.dto.ts
charge-batch-detail-response.dto.ts
list-charge-batches-query.dto.ts
```

### Criterios de aceptación

* Expone totales.
* Expone status.
* No expone errorSummary con datos personales.
* Incluye charges resumidos en detalle si aplica.

---

## TASK-037 — Crear DTOs de Charges

**Estado:** `[ ] Pending`

### Archivos

```text id="omzpif"
create-charge.dto.ts
cancel-charge.dto.ts
reverse-charge.dto.ts
create-charge-adjustment.dto.ts
charge-response.dto.ts
charge-detail-response.dto.ts
list-charges-query.dto.ts
```

### Criterios de aceptación

* Valida propertyUnitId.
* Valida billingPeriodId.
* Valida chargeConceptId.
* Valida amount como decimal string.
* Valida type.
* Requiere reason para extraordinario, cancelación, reverso y ajuste.
* No permite `tenantId`.
* No permite `originalAmount` editable desde PATCH.

---

## TASK-038 — Crear DTOs de Own Charges

**Estado:** `[ ] Pending`

### Archivos

```text id="pdkyoz"
my-charge-response.dto.ts
my-property-unit-charge-response.dto.ts
list-my-charges-query.dto.ts
```

### Criterios de aceptación

* Devuelve solo cargos propios.
* No expone tenant internals.
* No expone datos personales de terceros.
* Montos como string decimal.

---

# 11. Fase 5 — Prisma, migración y seeds

## TASK-039 — Agregar enums financieros a Prisma

**Estado:** `[ ] Pending`

### Enums

```text id="hmx9wa"
CurrencyCode
ChargeConceptStatus
ChargeConceptCategory
FeeScheduleStatus
FeeFrequency
UnitFeeAssignmentStatus
BillingPeriodStatus
ChargeBatchStatus
ChargeBatchType
ChargeStatus
ChargeType
AdjustmentType
```

### Criterios de aceptación

* Enums creados.
* Mapeados según `data-model.md`.
* Prisma Client genera sin errores.

---

## TASK-040 — Agregar modelo Prisma `ChargeConcept`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `tenantId` obligatorio.
* `code` requerido.
* `@@unique([tenantId, code])`.
* Decimal en `defaultAmount`.
* Relación con Tenant.
* onDelete Restrict.

---

## TASK-041 — Agregar modelo Prisma `FeeSchedule`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `tenantId` obligatorio.
* `chargeConceptId` obligatorio.
* `amount` Decimal.
* Relación con ChargeConcept.
* Relación con Tenant.
* onDelete Restrict.
* Índices por tenant, concepto, status y frequency.

---

## TASK-042 — Agregar modelo Prisma `UnitFeeAssignment`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `tenantId` obligatorio.
* `propertyUnitId` obligatorio.
* `feeScheduleId` obligatorio.
* Relación con PropertyUnit.
* Relación con FeeSchedule.
* Relación opcional con UserProfile para endedBy.
* onDelete Restrict.

---

## TASK-043 — Agregar modelo Prisma `BillingPeriod`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `tenantId` obligatorio.
* `periodCode` requerido.
* `@@unique([tenantId, periodCode])`.
* startsAt, endsAt y dueDate.
* closedBy y lockedBy opcionales.
* Relación con Tenant y UserProfile.
* onDelete Restrict.

---

## TASK-044 — Agregar modelo Prisma `ChargeBatch`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `tenantId` obligatorio.
* `billingPeriodId` obligatorio.
* `requestedBy` obligatorio.
* Totales con default 0.
* `errorSummary` JSON controlado.
* Relaciones con Tenant, BillingPeriod, FeeSchedule, UserProfile.
* onDelete Restrict.

---

## TASK-045 — Agregar modelo Prisma `Charge`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `tenantId` obligatorio.
* `billingPeriodId` obligatorio.
* `propertyUnitId` obligatorio.
* `chargeConceptId` obligatorio.
* `originalAmount` Decimal.
* `effectiveAmount` Decimal.
* `idempotencyKey` opcional.
* `@@unique([tenantId, idempotencyKey])`.
* Relaciones con Tenant, BillingPeriod, PropertyUnit, ChargeConcept, ChargeBatch.
* onDelete Restrict.

---

## TASK-046 — Agregar modelos Prisma `ChargeAdjustment` y `ChargeReversal`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `tenantId` obligatorio.
* Relación con Charge.
* Monto Decimal en adjustment.
* Reversal único por cargo.
* Reason requerido.
* Actor requerido.
* onDelete Restrict.

---

## TASK-047 — Agregar relaciones inversas en `Tenant`

**Estado:** `[ ] Pending`

### Relaciones

```text id="okzhw8"
chargeConcepts
feeSchedules
unitFeeAssignments
billingPeriods
chargeBatches
charges
chargeAdjustments
chargeReversals
```

### Criterios de aceptación

* Prisma Client genera.
* No rompe tests de `001-tenants`.

---

## TASK-048 — Agregar relaciones inversas en `PropertyUnit`

**Estado:** `[ ] Pending`

### Relaciones

```text id="t0yn7q"
unitFeeAssignments
charges
```

### Criterios de aceptación

* Prisma Client genera.
* No rompe tests de `003-residents-properties`.

---

## TASK-049 — Agregar relaciones inversas en `UserProfile`

**Estado:** `[ ] Pending`

### Relaciones

```text id="nj5ub2"
endedUnitFeeAssignments
closedBillingPeriods
lockedBillingPeriods
requestedChargeBatches
cancelledCharges
createdChargeAdjustments
reversedChargeAdjustments
chargeReversals
```

### Criterios de aceptación

* Prisma Client genera.
* No rompe tests de `002-users-roles`.

---

## TASK-050 — Crear migración `004_create_dues_fees`

**Estado:** `[ ] Pending`

### Comando sugerido

```bash id="p56ypw"
npm run prisma:migrate:dev -- --name 004_create_dues_fees
```

### Criterios de aceptación

* Migración creada.
* Migración aplica localmente.
* `tenant_id` obligatorio.
* Montos Decimal.
* Unique constraints creados.
* Índices creados.
* No hay cascade delete peligroso.
* Prisma Client genera.

---

## TASK-051 — Agregar constraints SQL manuales

**Estado:** `[ ] Pending`

### Constraints

```text id="eo8jlh"
fee_schedules_date_range_check
unit_fee_assignments_date_range_check
billing_periods_date_range_check
fee_schedules_amount_positive_check
charges_original_amount_non_negative_check
charges_effective_amount_non_negative_check
charge_adjustments_amount_positive_check
charges_idempotency_key_not_empty_check
charge_batches_counts_non_negative_check
```

### Criterios de aceptación

* SQL revisado.
* Migration tests cubren constraints.
* No contradice Prisma schema.
* Documentado en migración.

---

## TASK-052 — Crear mappers Prisma ↔ dominio

**Estado:** `[ ] Pending`

### Archivo

```text id="siczsx"
infrastructure/persistence/dues-fees.mapper.ts
```

### Criterios de aceptación

* Convierte Prisma a entidades.
* Convierte entidades a DTOs.
* Serializa Decimal como string.
* No expone entidades internas.
* No expone datos personales de terceros.

---

## TASK-053 — Crear repositorios Prisma

**Estado:** `[ ] Pending`

### Archivos

```text id="dk7mtp"
prisma-charge-concept.repository.ts
prisma-fee-schedule.repository.ts
prisma-unit-fee-assignment.repository.ts
prisma-billing-period.repository.ts
prisma-charge-batch.repository.ts
prisma-charge.repository.ts
prisma-charge-adjustment.repository.ts
prisma-charge-reversal.repository.ts
```

### Criterios de aceptación

* No se usa Prisma desde controladores.
* Todas las consultas filtran por `tenantId`.
* Mapean errores de unique constraints.
* Tienen integration tests.
* No permiten eliminación física ordinaria.

---

## TASK-054 — Crear seeds financieros demo

**Estado:** `[ ] Pending`

### Seeds

```text id="z2by7d"
charge concepts demo
fee schedules demo
billing periods demo
unit fee assignments demo
charges demo opcionales
```

### Criterios de aceptación

* Idempotentes.
* Usan tenants demo.
* Usan unidades demo.
* Usan montos ficticios.
* Usan USD.
* No crean pagos.
* No crean saldos consolidados.
* No usan datos reales.

---

# 12. Fase 6 — Puertos y adaptadores

## TASK-055 — Crear puertos de repositorio

**Estado:** `[ ] Pending`

### Archivos

```text id="u7rqnl"
charge-concept.repository.ts
fee-schedule.repository.ts
unit-fee-assignment.repository.ts
billing-period.repository.ts
charge-batch.repository.ts
charge.repository.ts
charge-adjustment.repository.ts
charge-reversal.repository.ts
```

### Criterios de aceptación

* Contratos definidos.
* No dependen de Prisma.
* Usan `tenantId` en métodos críticos.
* Son testeables.

---

## TASK-056 — Crear `PropertyUnitReaderPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="p1euv5"
application/ports/property-unit-reader.port.ts
```

### Criterios de aceptación

* Permite validar unidad por tenant.
* Permite listar unidades activas.
* No expone implementación interna de `003-residents-properties`.
* Evita acceso directo no controlado a tablas de otro módulo.

---

## TASK-057 — Crear `OwnResourceReaderPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="0hemfw"
application/ports/own-resource-reader.port.ts
```

### Criterios de aceptación

* Resuelve unidades propias del usuario.
* Usa `tenantId` y `userProfileId`.
* Compatible con `003-residents-properties`.
* Soporta endpoints `charges.read.own`.

---

## TASK-058 — Crear `DuesFeesAuditPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="d6fo0h"
application/ports/dues-fees-audit.port.ts
```

### Criterios de aceptación

* Registra tenant.
* Registra actor.
* Registra recurso.
* Registra acción.
* Registra monto y moneda cuando aplique.
* Registra `traceId`.
* No incluye payload completo.
* Compatible con futura spec `007-audit`.

---

## TASK-059 — Crear adaptador temporal de auditoría

**Estado:** `[ ] Pending`

### Archivo

```text id="pq2ge8"
infrastructure/audit/dues-fees-audit.adapter.ts
```

### Criterios de aceptación

* Implementa `DuesFeesAuditPort`.
* Sanitiza datos.
* No registra datos personales de propietarios/residentes.
* Tiene tests básicos.

---

## TASK-060 — Crear `DuesFeesEventsPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="njafue"
application/ports/dues-fees-events.port.ts
```

### Criterios de aceptación

* Define `publish(event)`.
* No depende de broker externo.
* Compatible con outbox futuro.

---

## TASK-061 — Crear adaptador temporal de eventos

**Estado:** `[ ] Pending`

### Archivo

```text id="0doy22"
infrastructure/events/dues-fees-events.adapter.ts
```

### Criterios de aceptación

* Implementa puerto de eventos.
* No envía datos personales.
* No invoca n8n directamente.
* Es reemplazable por outbox/event bus futuro.

---

# 13. Fase 7 — Servicios y policies

## TASK-062 — Implementar `MoneyService`

**Estado:** `[ ] Pending`

### Archivo

```text id="s664vi"
application/services/money.service.ts
```

### Criterios de aceptación

* Usa Decimal.
* Suma y resta exactamente.
* Serializa a string.
* Rechaza moneda no USD.
* Rechaza montos inválidos.
* Tiene tests.

---

## TASK-063 — Implementar `BillingPeriodPolicyService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida periodCode.
* Valida periodo open.
* Bloquea closed/locked.
* Valida duplicados.
* Tiene tests.

---

## TASK-064 — Implementar `FeeSchedulePolicyService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida concepto activo.
* Valida concepto del tenant.
* Valida monto.
* Valida vigencia.
* Bloquea schedule archived/inactive.
* Tiene tests.

---

## TASK-065 — Implementar `UnitFeePolicyService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida unidad del tenant.
* Valida unidad active.
* Valida FeeSchedule del tenant.
* Valida FeeSchedule active.
* Evita assignment duplicado activo.
* Finaliza assignment sin eliminar.
* Tiene tests.

---

## TASK-066 — Implementar `ChargeIdempotencyService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Construye idempotencyKey.
* Detecta duplicados.
* Soporta generación mensual.
* Soporta header `Idempotency-Key` para cargos manuales si se implementa.
* Tiene tests.

---

## TASK-067 — Implementar `ChargeGenerationService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Obtiene assignments activos.
* Filtra unidades activas.
* Valida periodo open.
* Crea batch.
* Genera cargos ordinarios.
* Evita duplicados.
* Soporta dryRun.
* Registra skipped/failed/success.
* Tiene tests.

---

## TASK-068 — Implementar `ChargePolicyService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida cancelación.
* Valida reverso.
* Valida ajuste.
* Bloquea estados inválidos.
* Bloquea operaciones sobre cargos pagados reservados.
* Tiene tests.

---

## TASK-069 — Implementar `ChargeEffectiveAmountService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Calcula effectiveAmount.
* Aplica discount.
* Aplica increase.
* Aplica surcharge.
* Aplica decrease.
* Bloquea resultado negativo.
* Mantiene originalAmount inmutable.
* Tiene tests.

---

## TASK-070 — Implementar `OwnChargePolicyService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Usa OwnResourceReaderPort.
* Valida `charges.read.own`.
* Devuelve solo cargos de unidades propias.
* Rechaza unidad ajena.
* Rechaza usuario sin Person.
* Tiene own access tests.

---

# 14. Fase 8 — Casos de uso

## TASK-071 — Implementar use cases de Charge Concepts

**Estado:** `[ ] Pending`

### Use cases

```text id="bayy3v"
CreateChargeConceptUseCase
UpdateChargeConceptUseCase
ArchiveChargeConceptUseCase
GetChargeConceptUseCase
ListChargeConceptsUseCase
```

### Criterios de aceptación

* Validan tenant activo.
* Validan permisos.
* Validan código único.
* Auditan cambios.
* Emiten eventos.
* Tienen tests.

---

## TASK-072 — Implementar use cases de Fee Schedules

**Estado:** `[ ] Pending`

### Use cases

```text id="z3o35a"
CreateFeeScheduleUseCase
UpdateFeeScheduleUseCase
ArchiveFeeScheduleUseCase
GetFeeScheduleUseCase
ListFeeSchedulesUseCase
```

### Criterios de aceptación

* Validan concepto activo.
* Validan monto Decimal.
* Validan tenant.
* No modifican cargos emitidos.
* Auditan.
* Emiten eventos.
* Tienen tests.

---

## TASK-073 — Implementar use cases de Unit Fee Assignments

**Estado:** `[ ] Pending`

### Use cases

```text id="kk9ctu"
AssignUnitFeeUseCase
EndUnitFeeAssignmentUseCase
GetUnitFeeAssignmentUseCase
ListUnitFeeAssignmentsUseCase
```

### Criterios de aceptación

* Validan unidad activa.
* Validan schedule activo.
* Validan tenant.
* Evitan duplicados.
* Finalizan sin eliminar.
* Auditan.
* Emiten eventos.
* Tienen tests.

---

## TASK-074 — Implementar use cases de Billing Periods

**Estado:** `[ ] Pending`

### Use cases

```text id="kck29n"
CreateBillingPeriodUseCase
CloseBillingPeriodUseCase
LockBillingPeriodUseCase
GetBillingPeriodUseCase
ListBillingPeriodsUseCase
```

### Criterios de aceptación

* Validan formato.
* Validan unicidad.
* Crean periodo open.
* Cierran periodo.
* Bloquean periodo.
* Auditan.
* Emiten eventos.
* Tienen tests.

---

## TASK-075 — Implementar `GenerateMonthlyChargesUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida permiso `fees.generate`.
* Valida tenant activo.
* Valida periodo open.
* Soporta feeScheduleId opcional.
* Soporta dryRun.
* Crea ChargeBatch si no es dryRun.
* Genera cargos idempotentes.
* No duplica cargos.
* Omite unidades no activas.
* Registra batch stats.
* Audita.
* Emite `MonthlyFeesGenerated`.
* Tiene financial regression tests.

---

## TASK-076 — Implementar use cases de Charge Batches

**Estado:** `[ ] Pending`

### Use cases

```text id="vvw78l"
GetChargeBatchUseCase
ListChargeBatchesUseCase
```

### Criterios de aceptación

* Listan batches por tenant.
* Consultan batch del tenant.
* No exponen batches de otro tenant.
* No exponen errorSummary con datos personales.
* Tienen tests.

---

## TASK-077 — Implementar use cases de Charges

**Estado:** `[ ] Pending`

### Use cases

```text id="hgxw6g"
CreateChargeUseCase
ListChargesUseCase
GetChargeUseCase
CancelChargeUseCase
ReverseChargeUseCase
AdjustChargeUseCase
```

### Criterios de aceptación

* Validan unidad del tenant.
* Validan concepto del tenant.
* Validan periodo open.
* Validan monto Decimal.
* Crean cargos manuales/extraordinarios.
* Cancelan sin eliminar.
* Reversan sin eliminar.
* Ajustan sin modificar originalAmount.
* Auditan.
* Emiten eventos.
* Tienen tests.

---

## TASK-078 — Implementar use cases `.own`

**Estado:** `[ ] Pending`

### Use cases

```text id="bgi5ua"
GetMyChargesUseCase
GetMyPropertyUnitChargesUseCase
```

### Criterios de aceptación

* Validan usuario autenticado.
* Validan tenant activo.
* Validan membership activa.
* Validan permiso `charges.read.own`.
* Validan unidades propias.
* No devuelven cargos ajenos.
* Tienen own access tests.

---

# 15. Fase 9 — Guards, policies y autorización

## TASK-079 — Reutilizar `AuthGuard`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida token.
* Resuelve UserProfile.
* Bloquea disabled user.
* Bloquea archived user.

---

## TASK-080 — Reutilizar `TenantGuard`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Resuelve tenant activo.
* Valida tenant active.
* Valida membership active.
* No confía solo en header.
* Bloquea tenant suspended/archived para operaciones financieras.

---

## TASK-081 — Reutilizar `TenantPermissionGuard`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida permisos financieros.
* Usa EffectivePermissionsService.
* Rechaza sin permiso.
* Tiene authorization tests.

---

## TASK-082 — Implementar `OwnChargePolicyGuard` o policy layer

**Estado:** `[ ] Pending`

### Archivo sugerido

```text id="kp2vy8"
policies/own-charge-policy.guard.ts
```

### Criterios de aceptación

* Valida permiso `charges.read.own`.
* Invoca `OwnChargePolicyService`.
* Rechaza unidades ajenas.
* Rechaza usuario sin Person.
* Tiene tests.

---

## TASK-083 — Crear decorators específicos del módulo

**Estado:** `[ ] Pending`

### Decorators sugeridos

```text id="160sc4"
@RequireFinancialPermission()
@RequireFinancialOperation()
@RequireOwnChargeAccess()
```

### Criterios de aceptación

* Exponen metadata.
* No contienen lógica de negocio.
* Funcionan con guards/policies.
* Compatibles con OpenAPI.

---

# 16. Fase 10 — Controladores y endpoints

## TASK-084 — Implementar `ChargeConceptsController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="5cp8wm"
GET    /api/v1/tenant/charge-concepts
POST   /api/v1/tenant/charge-concepts
GET    /api/v1/tenant/charge-concepts/:chargeConceptId
PATCH  /api/v1/tenant/charge-concepts/:chargeConceptId
POST   /api/v1/tenant/charge-concepts/:chargeConceptId/archive
```

### Criterios de aceptación

* Usa use cases.
* Usa guards.
* Usa DTOs.
* Tiene OpenAPI.
* Tiene API tests.

---

## TASK-085 — Implementar `FeeSchedulesController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="3qsgfn"
GET    /api/v1/tenant/fee-schedules
POST   /api/v1/tenant/fee-schedules
GET    /api/v1/tenant/fee-schedules/:feeScheduleId
PATCH  /api/v1/tenant/fee-schedules/:feeScheduleId
POST   /api/v1/tenant/fee-schedules/:feeScheduleId/archive
```

### Criterios de aceptación

* Valida concepto activo.
* Valida monto.
* Usa use cases.
* Tiene API tests.

---

## TASK-086 — Implementar `UnitFeesController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="t38qo3"
GET    /api/v1/tenant/unit-fees
POST   /api/v1/tenant/unit-fees
GET    /api/v1/tenant/unit-fees/:unitFeeAssignmentId
POST   /api/v1/tenant/unit-fees/:unitFeeAssignmentId/end
```

### Criterios de aceptación

* Valida unidad del tenant.
* Valida schedule del tenant.
* Evita duplicados.
* Finaliza sin eliminar.
* Tiene API tests.

---

## TASK-087 — Implementar `BillingPeriodsController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="tbptcu"
GET    /api/v1/tenant/billing-periods
POST   /api/v1/tenant/billing-periods
GET    /api/v1/tenant/billing-periods/:billingPeriodId
POST   /api/v1/tenant/billing-periods/:billingPeriodId/close
POST   /api/v1/tenant/billing-periods/:billingPeriodId/lock
```

### Criterios de aceptación

* Valida periodCode.
* Valida unicidad.
* Cierra periodo.
* Bloquea periodo.
* Tiene API tests.

---

## TASK-088 — Implementar `ChargeGenerationController`

**Estado:** `[ ] Pending`

### Endpoint

```text id="8tjz88"
POST /api/v1/tenant/charges/generate-monthly
```

### Criterios de aceptación

* Usa `GenerateMonthlyChargesUseCase`.
* Soporta dryRun.
* Valida `fees.generate`.
* Devuelve batch stats.
* No duplica cargos.
* Tiene API tests e idempotency tests.

---

## TASK-089 — Implementar `ChargeBatchesController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="nn35h8"
GET /api/v1/tenant/charge-batches
GET /api/v1/tenant/charge-batches/:chargeBatchId
```

### Criterios de aceptación

* Lista batches del tenant.
* Consulta batch del tenant.
* No expone batch de otro tenant.
* Tiene API tests.

---

## TASK-090 — Implementar `ChargesController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="f0v0wu"
GET    /api/v1/tenant/charges
POST   /api/v1/tenant/charges
GET    /api/v1/tenant/charges/:chargeId
POST   /api/v1/tenant/charges/:chargeId/cancel
POST   /api/v1/tenant/charges/:chargeId/reverse
POST   /api/v1/tenant/charges/:chargeId/adjustments
```

### Criterios de aceptación

* Lista cargos.
* Crea cargos manuales y extraordinarios.
* Consulta cargo.
* Cancela cargo.
* Reversa cargo.
* Ajusta cargo.
* No modifica originalAmount.
* Tiene API tests.

---

## TASK-091 — Implementar `OwnChargesController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="rwe8iv"
GET /api/v1/me/charges
GET /api/v1/me/property-units/:propertyUnitId/charges
```

### Criterios de aceptación

* Usa permiso `charges.read.own`.
* Valida unidades propias.
* No devuelve cargos ajenos.
* No devuelve cargos de otro tenant.
* Tiene own access tests.

---

# 17. Fase 11 — Errores y respuestas estándar

## TASK-092 — Mapear errores de dominio a HTTP

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `CHARGE_CONCEPT_NOT_FOUND` → 404.
* `CHARGE_CONCEPT_CODE_ALREADY_EXISTS` → 409.
* `CHARGE_CONCEPT_NOT_ACTIVE` → 409.
* `FEE_SCHEDULE_NOT_FOUND` → 404.
* `FEE_SCHEDULE_NOT_ACTIVE` → 409.
* `BILLING_PERIOD_NOT_OPEN` → 409.
* `BILLING_PERIOD_ALREADY_EXISTS` → 409.
* `CHARGE_NOT_FOUND` → 404.
* `CHARGE_ALREADY_CANCELLED` → 409.
* `CHARGE_ALREADY_REVERSED` → 409.
* `MONEY_AMOUNT_INVALID` → 422.
* `CURRENCY_NOT_SUPPORTED` → 422.
* `CROSS_TENANT_REFERENCE` → 403/422.
* `OWN_PERSON_NOT_LINKED` → 403.

---

## TASK-093 — Implementar error estándar

**Estado:** `[ ] Pending`

### Formato

```json id="i5lkhq"
{
  "error": {
    "code": "BILLING_PERIOD_NOT_OPEN",
    "message": "Monthly charges can only be generated for an open billing period.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

### Criterios de aceptación

* Todos los errores siguen formato.
* Incluyen `traceId`.
* No exponen stack trace en producción.
* No exponen datos personales.
* No exponen SQL.

---

## TASK-094 — Implementar response wrapper estándar

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Usa `data`.
* Usa `meta.traceId`.
* Listados incluyen paginación.
* Montos salen como string decimal.
* No retorna entidades internas directamente.

---

# 18. Fase 12 — OpenAPI

## TASK-095 — Documentar Charge Concepts API

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoints documentados.
* Permisos documentados.
* Errores documentados.
* Ejemplos incluidos.

---

## TASK-096 — Documentar Fee Schedules API

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoints documentados.
* Montos como string.
* Reglas de vigencia documentadas.
* Errores documentados.

---

## TASK-097 — Documentar Unit Fees API

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoints documentados.
* Reglas de unidad activa documentadas.
* Reglas de asignación duplicada documentadas.
* Errores documentados.

---

## TASK-098 — Documentar Billing Periods API

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoints documentados.
* Estados open/closed/locked documentados.
* Formato YYYY-MM documentado.
* Errores documentados.

---

## TASK-099 — Documentar Charge Generation API

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoint documentado.
* DryRun documentado.
* Idempotencia documentada.
* Batch stats documentados.
* Errores documentados.
* `x-idempotent-operation` incluido.

---

## TASK-100 — Documentar Charge Batches API

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoints documentados.
* Totales documentados.
* Error summary documentado.
* Permiso `fees.readBatches` documentado.

---

## TASK-101 — Documentar Charges API

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoints documentados.
* Cancelación documentada.
* Reverso documentado.
* Ajuste documentado.
* `originalAmount` inmutable documentado.
* Errores documentados.

---

## TASK-102 — Documentar Own Charges API

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoints `/api/v1/me/charges` documentados.
* Permiso `charges.read.own` documentado.
* `x-own-resource-policy` incluido.
* Errores `OWN_PERSON_NOT_LINKED` y `OWN_PROPERTY_UNIT_NOT_FOUND` documentados.

---

## TASK-103 — Agregar extensiones OpenAPI financieras

**Estado:** `[ ] Pending`

### Ejemplos

```yaml id="78k12l"
x-required-permission: charges.create
x-audit-event: charge.created
x-tenant-scope: tenant
x-financial-operation: true
```

```yaml id="dsdq0k"
x-required-permission: fees.generate
x-audit-event: chargeBatch.completed
x-tenant-scope: tenant
x-financial-operation: true
x-idempotent-operation: true
```

```yaml id="3xga21"
x-required-permission: charges.read.own
x-own-resource-policy: true
x-tenant-scope: tenant
```

### Criterios de aceptación

* Endpoints privados tienen `security`.
* Endpoints tienen permiso requerido.
* Endpoints auditables tienen evento.
* Endpoints financieros tienen flag.
* Endpoints idempotentes tienen flag.
* Endpoints `.own` tienen policy.

---

# 19. Fase 13 — Pruebas unitarias

## TASK-104 — Implementar unit tests de value objects

**Estado:** `[ ] Pending`

### Archivos

```text id="zljvag"
money.vo.spec.ts
charge-concept-code.vo.spec.ts
billing-period-code.vo.spec.ts
due-date.vo.spec.ts
idempotency-key.vo.spec.ts
charge-status.vo.spec.ts
charge-type.vo.spec.ts
fee-frequency.vo.spec.ts
```

### Criterios de aceptación

* Cubren casos `UT-*`.
* Cubren precisión decimal.
* Pasan en CI.

---

## TASK-105 — Implementar unit tests de entidades

**Estado:** `[ ] Pending`

### Archivos

```text id="h6alix"
charge-concept.entity.spec.ts
fee-schedule.entity.spec.ts
unit-fee-assignment.entity.spec.ts
billing-period.entity.spec.ts
charge-batch.entity.spec.ts
charge.entity.spec.ts
charge-adjustment.entity.spec.ts
charge-reversal.entity.spec.ts
```

### Criterios de aceptación

* Cubren creación.
* Cubren actualización.
* Cubren archivado.
* Cubren cancelación.
* Cubren reverso.
* Cubren ajuste.
* Cubren errores de dominio.

---

# 20. Fase 14 — Pruebas de aplicación

## TASK-106 — Implementar tests de MoneyService

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Suma decimal exacta.
* Resta decimal exacta.
* Serializa como string.
* Rechaza moneda no USD.
* Rechaza montos inválidos.

---

## TASK-107 — Implementar tests de policies financieras

**Estado:** `[ ] Pending`

### Policies

```text id="er9b3w"
BillingPeriodPolicyService
FeeSchedulePolicyService
UnitFeePolicyService
ChargePolicyService
OwnChargePolicyService
```

### Criterios de aceptación

* Valida periodos.
* Valida conceptos.
* Valida schedules.
* Valida unidades.
* Valida estados de cargos.
* Valida acceso propio.
* Rechaza cross-tenant.

---

## TASK-108 — Implementar tests de idempotencia

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Misma key no duplica.
* Generación repetida no duplica.
* Concurrencia no duplica.
* DryRun no persiste.
* Reintento tras fallo parcial no duplica existentes.

---

## TASK-109 — Implementar tests de use cases principales

**Estado:** `[ ] Pending`

### Use cases

```text id="q6shd0"
CreateChargeConceptUseCase
CreateFeeScheduleUseCase
AssignUnitFeeUseCase
CreateBillingPeriodUseCase
GenerateMonthlyChargesUseCase
CreateChargeUseCase
CancelChargeUseCase
ReverseChargeUseCase
AdjustChargeUseCase
GetMyChargesUseCase
```

### Criterios de aceptación

* Caminos felices.
* Caminos inválidos.
* Auditoría.
* Eventos.
* Validaciones tenant.
* Validaciones financieras.

---

# 21. Fase 15 — Pruebas de integración

## TASK-110 — Implementar migration tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Tablas creadas.
* Enums creados.
* `tenant_id` obligatorio.
* Decimal en montos.
* Unique constraints.
* Idempotency unique.
* Reversal unique.
* onDelete Restrict.
* No cascade delete peligroso.
* Constraints de fechas y montos.

---

## TASK-111 — Implementar repository integration tests

**Estado:** `[ ] Pending`

### Repositorios

```text id="natdba"
ChargeConceptRepository
FeeScheduleRepository
UnitFeeAssignmentRepository
BillingPeriodRepository
ChargeBatchRepository
ChargeRepository
ChargeAdjustmentRepository
ChargeReversalRepository
```

### Criterios de aceptación

* CRUD controlado.
* Queries por tenant.
* Búsquedas críticas.
* Constraints.
* Errores mapeados.
* No eliminación física.

---

## TASK-112 — Implementar seed integration tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Seeds idempotentes.
* Seeds crean conceptos demo.
* Seeds crean schedules demo.
* Seeds crean periodos demo.
* Seeds crean assignments demo.
* Seeds no crean pagos.
* Seeds no usan datos reales.

---

# 22. Fase 16 — Pruebas API

## TASK-113 — Implementar API tests de Charge Concepts

**Estado:** `[ ] Pending`

### Archivo

```text id="bhtz1s"
charge-concepts.api.spec.ts
```

### Criterios de aceptación

* Listar.
* Crear.
* Consultar.
* Actualizar.
* Archivar.
* Duplicado.
* Sin permiso.
* Cross-tenant.

---

## TASK-114 — Implementar API tests de Fee Schedules

**Estado:** `[ ] Pending`

### Archivo

```text id="6dq9os"
fee-schedules.api.spec.ts
```

### Criterios de aceptación

* Listar.
* Crear.
* Consultar.
* Actualizar.
* Archivar.
* Concepto inactivo.
* Concepto cross-tenant.
* Monto inválido.
* Fechas inválidas.

---

## TASK-115 — Implementar API tests de Unit Fee Assignments

**Estado:** `[ ] Pending`

### Archivo

```text id="i2051p"
unit-fees.api.spec.ts
```

### Criterios de aceptación

* Listar.
* Crear assignment.
* Consultar.
* Finalizar.
* Unidad cross-tenant.
* Schedule cross-tenant.
* Assignment duplicado.
* Historial conservado.

---

## TASK-116 — Implementar API tests de Billing Periods

**Estado:** `[ ] Pending`

### Archivo

```text id="yk318i"
billing-periods.api.spec.ts
```

### Criterios de aceptación

* Listar.
* Crear periodo.
* Consultar.
* Cerrar.
* Bloquear.
* PeriodCode duplicado.
* Formato inválido.
* Sin permiso.

---

## TASK-117 — Implementar API tests de Charge Generation

**Estado:** `[ ] Pending`

### Archivo

```text id="g8wy1z"
charge-generation.api.spec.ts
```

### Criterios de aceptación

* Generación mensual exitosa.
* Generación crea batch.
* Generación crea cargos.
* Generación repetida no duplica.
* DryRun no persiste.
* Periodo closed/locked falla.
* Tenant suspended falla.
* Unidad archived omitida.
* Auditoría y evento.

---

## TASK-118 — Implementar API tests de Charge Batches

**Estado:** `[ ] Pending`

### Archivo

```text id="rlokiv"
charge-batches.api.spec.ts
```

### Criterios de aceptación

* Listar batches.
* Consultar batch.
* Batch de otro tenant no visible.
* Error summary sanitizado.
* Conteos correctos.

---

## TASK-119 — Implementar API tests de Charges

**Estado:** `[ ] Pending`

### Archivo

```text id="h4gw46"
charges.api.spec.ts
```

### Criterios de aceptación

* Listar cargos.
* Crear cargo manual.
* Crear cargo extraordinario.
* Consultar cargo.
* Cancelar.
* Reversar.
* Ajustar.
* originalAmount inmutable.
* effectiveAmount correcto.
* Cross-tenant rechazado.

---

## TASK-120 — Implementar API tests de Own Charges

**Estado:** `[ ] Pending`

### Archivo

```text id="edokkv"
own-charges.api.spec.ts
```

### Criterios de aceptación

* `/me/charges`.
* `/me/property-units/:propertyUnitId/charges`.
* Propietario ve cargos propios.
* Residente autorizado ve cargos propios.
* Usuario sin Person recibe 403.
* Usuario no ve unidad ajena.
* Usuario no ve cargos de otro tenant.

---

# 23. Fase 17 — Authorization, own access y multitenancy

## TASK-121 — Implementar authorization tests financieros

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Sin token → 401.
* Sin membership → 403.
* Sin permiso → 403.
* Tenant suspendido → 403.
* Disabled user → 403.
* TenantAdmin/Treasurer autorizado → 200/201.
* TenantAuditor solo lectura.

---

## TASK-122 — Implementar separation-of-duties tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Usuario con `fees.generate` no puede `charges.reverse` sin permiso.
* Usuario con `charges.read` no puede `charges.cancel`.
* Usuario con `charges.adjust` no puede cerrar periodo.
* TenantAuditor no modifica cargos.

---

## TASK-123 — Implementar own access tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Propietario ve cargos de unidad propia.
* Residente ve cargos de unidad propia si política lo permite.
* Usuario sin Person no accede.
* Usuario no ve unidad ajena.
* Usuario no ve cargos de otro tenant.
* Relación ended no otorga acceso operativo.

---

## TASK-124 — Implementar multitenancy tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Tenant A no lista recursos financieros B.
* Tenant A no consulta cargo B.
* Tenant A no usa concepto B.
* Tenant A no usa unidad B.
* Tenant A no ajusta cargo B.
* Tenant A no reversa cargo B.
* Own charges no mezclan tenants.

---

# 24. Fase 18 — Pruebas financieras especiales

## TASK-125 — Implementar money precision tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Decimal exacto.
* Montos como string.
* No float.
* effectiveAmount correcto.
* Moneda USD obligatoria.
* Ajustes no dejan monto negativo.

---

## TASK-126 — Implementar idempotency tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Generación única crea cargos.
* Generación repetida no duplica.
* idempotencyKey única.
* Reintento seguro.
* DryRun no consume idempotencia persistida.

---

## TASK-127 — Implementar concurrency tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Dos generaciones simultáneas no duplican.
* Dos periodos iguales simultáneos no se duplican.
* Dos conceptos iguales simultáneos no se duplican.
* Dos cancelaciones simultáneas resuelven una sola.
* Dos reversos simultáneos resuelven uno solo.
* Ajustes simultáneos mantienen consistency.

---

## TASK-128 — Implementar financial regression tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Generación mensual completa.
* Unidad archived no recibe cargo ordinario.
* Assignment ended no genera.
* Periodo closed bloquea.
* originalAmount nunca cambia.
* Cancelación conserva cargo.
* Reverso conserva cargo.
* Ajuste recalcula.
* Batch registra totales.
* Datos suficientes para estado de cuenta futuro.

---

# 25. Fase 19 — Seguridad y privacidad

## TASK-129 — Implementar security tests de payload

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Strings largos rechazados.
* IDs malformados rechazados.
* Scripts tratados según política.
* SQL-like search seguro.
* `tenantId` en body rechazado.
* amount inválido rechazado.
* currency no soportada rechazada.

---

## TASK-130 — Implementar financial safety tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* No existe DELETE de cargos.
* Cancelar no elimina cargo.
* Reversar no elimina cargo.
* Ajustar no cambia originalAmount.
* Generar en periodo locked falla.
* Usuario sin permiso no cancela.
* Error no expone stack trace.

---

## TASK-131 — Implementar logging security tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* No Authorization header.
* No access token.
* No payload completo.
* No datos personales de propietarios/residentes.
* Batch errorSummary sanitizado.
* Métricas sin labels de alta cardinalidad innecesaria.

---

# 26. Fase 20 — Auditoría, eventos y observabilidad

## TASK-132 — Validar auditoría financiera

**Estado:** `[ ] Pending`

### Eventos auditables

```text id="76vmq6"
chargeConcept.created
chargeConcept.updated
chargeConcept.archived
feeSchedule.created
feeSchedule.updated
feeSchedule.archived
unitFee.assigned
unitFee.ended
billingPeriod.created
billingPeriod.closed
billingPeriod.locked
chargeBatch.created
chargeBatch.processing
chargeBatch.completed
chargeBatch.completedWithErrors
charge.created
charge.cancelled
charge.reversed
charge.adjusted
```

### Criterios de aceptación

* Cada operación crítica genera auditoría.
* Auditoría incluye `tenantId`, `actorUserId`, `traceId`.
* Auditoría incluye referencias financieras.
* Auditoría no incluye payload completo.

---

## TASK-133 — Validar eventos financieros

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Eventos principales emitidos.
* Incluyen `tenantId`.
* Incluyen `traceId`.
* Incluyen referencias financieras.
* No incluyen datos personales.
* No incluyen tokens.

---

## TASK-134 — Agregar logs estructurados

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Logs incluyen `traceId`.
* Logs incluyen `tenantId`.
* Logs incluyen `actorUserId`.
* Logs incluyen errorCode si aplica.
* Logs están sanitizados.
* Logs de generación mensual incluyen batch stats.

---

## TASK-135 — Agregar métricas financieras básicas

**Estado:** `[ ] Pending`

### Métricas

```text id="if4olv"
charge_concepts_created_total
fee_schedules_created_total
unit_fee_assignments_created_total
billing_periods_created_total
charges_generated_total
charges_created_total
charges_cancelled_total
charges_reversed_total
charge_adjustments_created_total
charge_generation_batches_total
charge_generation_failures_total
financial_authorization_denied_total
own_charge_access_denied_total
```

### Criterios de aceptación

* Métricas incrementan.
* No usan datos personales como labels.
* No usan propertyUnitId como label de alta cardinalidad.
* No exponen montos como labels.

---

# 27. Fase 21 — CI/CD y smoke tests

## TASK-136 — Agregar comandos de test del módulo

**Estado:** `[ ] Pending`

### Scripts sugeridos

```bash id="dnpbbb"
npm run test:dues-fees
npm run test:dues-fees:unit
npm run test:dues-fees:application
npm run test:dues-fees:integration
npm run test:dues-fees:api
npm run test:dues-fees:authorization
npm run test:dues-fees:multitenancy
npm run test:dues-fees:financial
npm run test:dues-fees:security
```

### Criterios de aceptación

* Scripts disponibles o equivalentes.
* Corren localmente.
* Documentados en package scripts.

---

## TASK-137 — Agregar validaciones al pipeline CI

**Estado:** `[ ] Pending`

### CI mínimo

```text id="v3n9op"
lint
typecheck
unit tests
application tests
integration tests críticos
API tests críticos
authorization tests
own access tests
multitenancy tests
money precision tests
idempotency tests
financial regression tests críticos
security tests críticos
OpenAPI validation
build
```

### Criterios de aceptación

* Pipeline falla si hay duplicidad de cargos.
* Pipeline falla si se usa float.
* Pipeline falla si `.own` está mal implementado.
* Pipeline falla si cross-tenant pasa.
* Pipeline falla si OpenAPI no coincide.

---

## TASK-138 — Agregar smoke tests

**Estado:** `[ ] Pending`

### Smoke tests

```text id="agkwa1"
GET /api/v1/health
GET /api/v1/tenant/charges sin token
GET /api/v1/me/charges sin token
GET /api/v1/tenant/charge-concepts con usuario autorizado
GET /api/v1/tenant/charges con usuario sin permiso
```

### Criterios de aceptación

* Smoke tests pasan en dev/staging.
* No ejecutan generación mensual real.
* No ejecutan cancelación, reverso ni ajuste.
* Errores incluyen traceId.

---

# 28. Fase 22 — Revisión SDD

## TASK-139 — Validar trazabilidad spec → tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Cada FR tiene pruebas asociadas.
* Cada endpoint tiene API tests.
* Cada endpoint privado tiene authorization tests.
* Cada endpoint `.own` tiene own access tests.
* Cada operación tenant-scoped tiene multitenancy tests.
* Cada operación financiera crítica tiene auditoría.
* Cada regla monetaria tiene tests.

---

## TASK-140 — Validar cumplimiento de ADRs

**Estado:** `[ ] Pending`

### ADRs

```text id="iqsvbf"
ADR-003 Database Strategy
ADR-004 Multitenancy Strategy
ADR-007 Authorization Strategy
ADR-010 Observability Strategy
ADR-011 Testing Strategy
ADR-012 CI/CD Strategy
```

### Criterios de aceptación

* No contradice multitenancy.
* No usa float.
* No elimina físicamente cargos.
* No omite autorización.
* No omite auditoría.
* No omite pruebas financieras.
* No expone datos personales en logs.

---

## TASK-141 — Actualizar OpenAPI final

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Contrato coincide con `api-contract.md`.
* Endpoints privados tienen security.
* Permisos documentados.
* Errores documentados.
* Endpoints `.own` documentados.
* Operaciones financieras marcadas.
* Idempotencia documentada.
* Montos como string decimal.

---

## TASK-142 — Ejecutar suite completa

**Estado:** `[ ] Pending`

### Comandos esperados

```bash id="gtd4um"
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
* No hay warnings críticos.
* No hay datos reales en fixtures.
* No hay operaciones financieras fuera de alcance.

---

## TASK-143 — Preparar evidencia de implementación

**Estado:** `[ ] Pending`

### Evidencia mínima

```text id="z0c3qa"
- PR link o commit SHA.
- Migración aplicada.
- Prisma Client generado.
- Seeds ejecutados.
- Tests ejecutados.
- OpenAPI actualizado.
- Smoke tests ejecutados.
- Riesgos pendientes.
- Diferidos documentados.
```

---

# 29. Fase 23 — Pendientes diferidos controlados

## TASK-144 — Diferir pagos

**Estado:** `[-] Deferred`

### Razón

Pagos requieren comprobantes, asignaciones, métodos de pago y reglas propias.

### Implementación futura

```text id="l9q88x"
docs/specs/005-payments/
```

---

## TASK-145 — Diferir estados de cuenta consolidados

**Estado:** `[-] Deferred`

### Razón

Requiere cargos, pagos, asignaciones, ajustes y reglas de saldo.

### Implementación futura

```text id="0s0okw"
docs/specs/006-account-statements/
```

---

## TASK-146 — Diferir mora avanzada

**Estado:** `[-] Deferred`

### Razón

Requiere reglas de vencimiento, interés, política de cálculo, exoneraciones y cierre financiero.

### Implementación futura

```text id="6t8jga"
docs/specs/00X-late-fees/
```

---

## TASK-147 — Diferir facturación electrónica

**Estado:** `[-] Deferred`

### Razón

Requiere integración tributaria, comprobantes autorizados y reglas legales específicas.

### Implementación futura

```text id="8qnwry"
docs/specs/00X-electronic-invoicing/
```

---

## TASK-148 — Diferir contabilidad completa

**Estado:** `[-] Deferred`

### Razón

Requiere plan de cuentas, asientos contables, periodos contables y cierre contable.

### Implementación futura

```text id="gwqzuw"
docs/specs/00X-accounting/
```

---

## TASK-149 — Diferir conciliación bancaria

**Estado:** `[-] Deferred`

### Razón

Requiere movimientos bancarios, reglas de matching y pagos.

### Implementación futura

```text id="fg5v4d"
docs/specs/00X-bank-reconciliation/
```

---

## TASK-150 — Diferir notificaciones automáticas

**Estado:** `[-] Deferred`

### Razón

Requiere módulo de comunicaciones, templates y canales.

### Implementación futura

```text id="z2ti4i"
docs/specs/009-notifications/
```

---

## TASK-151 — Diferir automatizaciones n8n

**Estado:** `[-] Deferred`

### Razón

Requiere webhooks, eventos firmados, permisos de service account y gobernanza de credenciales.

### Implementación futura

```text id="2j7qa5"
docs/specs/00X-n8n-automations/
```

---

## TASK-152 — Diferir aprobación dual avanzada

**Estado:** `[-] Deferred`

### Razón

Requiere workflow de aprobación, estados intermedios, autorizadores y políticas por monto.

### Implementación futura

```text id="a13x6b"
docs/specs/00X-financial-approvals/
```

---

## TASK-153 — Diferir carga masiva desde archivo

**Estado:** `[-] Deferred`

### Razón

Requiere módulo de archivos, validación batch, rollback parcial y seguridad documental.

### Implementación futura

```text id="1v0gye"
docs/specs/00X-bulk-imports/
```

---

# 30. Definition of Done del módulo

El módulo `004-dues-fees` estará terminado cuando:

```text id="oub6g6"
[ ] Documentación spec completa.
[ ] Modelo Prisma implementado.
[ ] Migración creada y validada.
[ ] SQL constraints revisadas.
[ ] Seeds demo creados.
[ ] Módulo NestJS creado.
[ ] DTOs implementados.
[ ] Value objects implementados.
[ ] Entidades implementadas.
[ ] Repositorios implementados.
[ ] Servicios/policies implementados.
[ ] Use cases implementados.
[ ] Controladores implementados.
[ ] Endpoints administrativos protegidos.
[ ] Endpoints .own protegidos.
[ ] Money usa Decimal.
[ ] No se usa float.
[ ] ChargeConcept implementado.
[ ] FeeSchedule implementado.
[ ] UnitFeeAssignment implementado.
[ ] BillingPeriod implementado.
[ ] ChargeBatch implementado.
[ ] Charge implementado.
[ ] ChargeAdjustment implementado.
[ ] ChargeReversal implementado.
[ ] Generación mensual implementada.
[ ] Generación mensual idempotente.
[ ] No hay cargos duplicados.
[ ] No hay acceso cross-tenant.
[ ] Own charges solo devuelve cargos propios.
[ ] No se elimina físicamente ningún cargo.
[ ] originalAmount es inmutable.
[ ] effectiveAmount se recalcula correctamente.
[ ] Cancelación implementada.
[ ] Reverso implementado.
[ ] Ajuste implementado.
[ ] Auditoría financiera implementada.
[ ] Eventos financieros implementados.
[ ] Logs sanitizados.
[ ] Métricas básicas implementadas.
[ ] OpenAPI actualizado.
[ ] Unit tests pasan.
[ ] Application tests pasan.
[ ] Integration tests pasan.
[ ] API tests pasan.
[ ] Authorization tests pasan.
[ ] Own access tests pasan.
[ ] Multitenancy tests pasan.
[ ] Money precision tests pasan.
[ ] Idempotency tests pasan.
[ ] Financial regression tests pasan.
[ ] Security tests pasan.
[ ] CI pasa.
[ ] Smoke tests pasan.
[ ] Pendientes diferidos documentados.
```

---

## 31. Orden recomendado de ejecución

```text id="9yf2xf"
1. TASK-001 a TASK-008      Documentación
2. TASK-009 a TASK-011      Estructura base
3. TASK-012 a TASK-020      Value objects
4. TASK-021 a TASK-030      Entidades, errores y eventos
5. TASK-031 a TASK-038      DTOs
6. TASK-039 a TASK-054      Prisma, migración y seeds
7. TASK-055 a TASK-061      Puertos y adaptadores
8. TASK-062 a TASK-070      Servicios y policies
9. TASK-071 a TASK-078      Use cases
10. TASK-079 a TASK-083     Guards, policies y decorators
11. TASK-084 a TASK-091     Controladores
12. TASK-092 a TASK-094     Errores y respuestas
13. TASK-095 a TASK-103     OpenAPI
14. TASK-104 a TASK-131     Pruebas
15. TASK-132 a TASK-135     Auditoría, eventos y observabilidad
16. TASK-136 a TASK-138     CI/CD y smoke tests
17. TASK-139 a TASK-143     Revisión SDD
```

---

## 32. Riesgos de ejecución

| Riesgo                                 | Impacto | Mitigación                                 |
| -------------------------------------- | ------- | ------------------------------------------ |
| Duplicar cargos mensuales              | Crítico | idempotencyKey + unique constraint + tests |
| Usar float para dinero                 | Alto    | Money VO + Decimal + tests                 |
| Crear cargo para unidad de otro tenant | Crítico | Tenant validation + MT tests               |
| Usar concepto de otro tenant           | Crítico | Tenant validation                          |
| Generar en periodo cerrado             | Alto    | BillingPeriodPolicyService                 |
| Eliminar cargo emitido                 | Crítico | No DELETE + onDelete Restrict              |
| Sobrescribir originalAmount            | Alto    | ChargePolicy + tests                       |
| Reversar cargo dos veces               | Alto    | unique reversal + policy                   |
| Propietario ve cargo ajeno             | Alto    | OwnChargePolicyService                     |
| Falta de auditoría financiera          | Crítico | DuesFeesAuditPort                          |
| Batch parcial opaco                    | Medio   | ChargeBatch stats                          |
| Métricas con alta cardinalidad         | Medio   | labels controlados                         |
| Implementar pagos fuera de alcance     | Alto    | checklist PR + SDD review                  |

---

## 33. Checklist para revisión de PR

Antes de aprobar el PR de `004-dues-fees`:

```text id="sn1gs7"
[ ] La implementación sigue spec.md.
[ ] No se implementó funcionalidad fuera de alcance.
[ ] No se implementaron pagos.
[ ] No se implementaron estados de cuenta consolidados.
[ ] No se implementó mora avanzada.
[ ] Prisma schema coincide con data-model.md.
[ ] Migración revisada.
[ ] SQL constraints revisadas.
[ ] No hay cascade delete peligroso.
[ ] tenantId es obligatorio en todas las tablas.
[ ] Montos usan Decimal.
[ ] No hay float ni double para dinero.
[ ] Endpoints coinciden con api-contract.md.
[ ] Endpoints privados tienen AuthGuard.
[ ] Endpoints tenant tienen TenantGuard.
[ ] Endpoints financieros tienen TenantPermissionGuard.
[ ] Endpoints .own validan OwnChargePolicyService.
[ ] Conceptos no se mezclan entre tenants.
[ ] Schedules no se mezclan entre tenants.
[ ] Unidades no se mezclan entre tenants.
[ ] Cargos no se mezclan entre tenants.
[ ] Generación mensual es idempotente.
[ ] No se duplican cargos.
[ ] No se generan cargos en periodo closed/locked.
[ ] No se generan cargos ordinarios para unidades archived.
[ ] originalAmount no se modifica.
[ ] effectiveAmount se recalcula correctamente.
[ ] Cancelación no elimina cargo.
[ ] Reverso no elimina cargo.
[ ] Ajuste no elimina cargo.
[ ] Usuario .own no ve cargos ajenos.
[ ] Logs no contienen payload completo.
[ ] Logs no contienen datos personales de propietarios/residentes.
[ ] Métricas no tienen labels de alta cardinalidad.
[ ] Cambios financieros generan auditoría.
[ ] Eventos financieros se emiten.
[ ] OpenAPI actualizado.
[ ] Tests pasan.
[ ] CI pasa.
[ ] No hay secrets.
[ ] No hay datos reales en seeds.
[ ] Pendientes diferidos documentados.
```

---

## 34. Resultado final esperado

Al completar estas tareas, RESIDENT Core tendrá implementada la base financiera de cargos:

```text id="0nlyxv"
- conceptos de cobro;
- configuraciones de alícuotas;
- asignaciones de alícuotas a unidades;
- periodos financieros;
- generación mensual idempotente;
- cargos ordinarios;
- cargos extraordinarios;
- cargos manuales;
- batches de generación;
- cancelaciones;
- reversos;
- ajustes;
- consulta administrativa;
- consulta propia;
- auditoría financiera;
- eventos financieros;
- pruebas financieras.
```

Este módulo habilita el inicio de:

```text id="97h3pv"
docs/specs/005-payments/
docs/specs/006-account-statements/
```

pero antes debe completarse:

```text id="oh5d89"
docs/specs/004-dues-fees/security-notes.md
```
