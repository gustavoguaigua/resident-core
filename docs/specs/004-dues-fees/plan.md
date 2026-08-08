# Plan — Spec 004 Dues, Fees, Charge Concepts and Charge Generation

## 1. Información del documento

| Campo          | Valor                                                        |
| -------------- | ------------------------------------------------------------ |
| Proyecto       | RESIDENT Core                                                |
| Spec ID        | 004                                                          |
| Módulo         | Dues and Fees                                                |
| Documento      | Implementation Plan                                          |
| Ruta           | `docs/specs/004-dues-fees/plan.md`                           |
| Versión        | 0.1                                                          |
| Estado         | Borrador inicial                                             |
| Fecha          | 2026-07-14                                                   |
| Documento base | `docs/specs/004-dues-fees/spec.md`                           |
| Depende de     | `001-tenants`, `002-users-roles`, `003-residents-properties` |
| Arquitectura   | Monolito modular NestJS                                      |
| Base de datos  | PostgreSQL + Prisma                                          |
| Autorización   | Tenant-aware RBAC + permisos financieros                     |
| Prioridad      | Alta                                                         |

---

## 2. Propósito

Este documento transforma la especificación funcional `004-dues-fees/spec.md` en un plan técnico de implementación.

El módulo `004-dues-fees` será el primer módulo financiero formal de RESIDENT Core y debe permitir:

* configurar conceptos de cobro;
* configurar alícuotas;
* asignar alícuotas a unidades;
* crear periodos financieros;
* generar cargos mensuales;
* registrar cargos extraordinarios;
* registrar cargos manuales;
* consultar cargos;
* consultar cargos propios;
* anular cargos;
* reversar cargos;
* registrar ajustes;
* auditar operaciones financieras;
* emitir eventos financieros;
* garantizar precisión monetaria;
* garantizar idempotencia;
* preparar pagos y estados de cuenta futuros.

Regla central:

```text id="aw1dr0"
Todo cargo financiero debe ser trazable, auditable, tenant-scoped, asociado a una unidad y expresado con precisión decimal.
```

---

## 3. Resumen de implementación

El módulo se implementará como módulo interno de NestJS dentro del monolito modular de RESIDENT Core.

Entidades principales:

```text id="wysyc2"
ChargeConcept
FeeSchedule
UnitFeeAssignment
BillingPeriod
ChargeBatch
Charge
ChargeAdjustment
ChargeReversal
```

Relación conceptual:

```text id="x6nz49"
Tenant
├── ChargeConcept
├── FeeSchedule
│   └── UnitFeeAssignment
│       └── PropertyUnit
├── BillingPeriod
├── ChargeBatch
└── Charge
    ├── ChargeAdjustment
    └── ChargeReversal
```

Relación con módulos previos:

```text id="a9c5iy"
Tenant                  ← 001-tenants
UserProfile/permissions ← 002-users-roles
PropertyUnit            ← 003-residents-properties
Charges                 ← 004-dues-fees
Payments                ← 005-payments futuro
AccountStatements       ← 006-account-statements futuro
```

---

## 4. Decisiones técnicas aplicables

Este módulo debe respetar:

```text id="xlrppc"
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

* Todo registro financiero lleva `tenantId`.
* Todo cargo se asocia a `PropertyUnit`.
* Todo monto usa `Decimal`.
* No se usan `float` ni `double`.
* No se elimina físicamente ningún cargo emitido.
* El monto original de un cargo no se sobrescribe.
* La generación mensual debe ser idempotente.
* Todo cambio financiero se audita.
* Todo endpoint financiero requiere permiso.
* Los propietarios/residentes solo consultan cargos de unidades propias.
* Los pagos y estados de cuenta consolidados quedan fuera de esta spec.

---

## 5. Alcance técnico

### 5.1. Incluido

La implementación inicial cubre:

* modelos Prisma;
* migraciones;
* seeds financieros demo;
* entidades de dominio;
* value objects;
* DTOs;
* repositorios;
* servicios de aplicación;
* casos de uso;
* generación de cargos;
* idempotencia;
* control de periodos;
* control de batches;
* auditoría;
* eventos;
* endpoints REST;
* endpoints `.own`;
* OpenAPI;
* pruebas unitarias;
* pruebas de integración;
* pruebas API;
* pruebas de autorización;
* pruebas multitenant;
* pruebas financieras de regresión;
* pruebas de idempotencia;
* pruebas de seguridad.

---

### 5.2. Diferido

No se implementará todavía:

* pagos;
* comprobantes;
* asignación de pagos;
* conciliación bancaria;
* estados de cuenta consolidados;
* cálculo final de saldos;
* mora avanzada;
* intereses automáticos;
* facturación electrónica tributaria;
* contabilidad completa;
* asientos contables;
* reportes financieros avanzados;
* cobranza automatizada;
* notificaciones automáticas;
* integración n8n;
* aprobación dual avanzada;
* carga masiva desde archivo.

---

## 6. Estructura de carpetas recomendada

```text id="1f6rci"
apps/api/src/modules/dues-fees/
├── dues-fees.module.ts
│
├── charge-concepts.controller.ts
├── fee-schedules.controller.ts
├── unit-fees.controller.ts
├── billing-periods.controller.ts
├── charge-generation.controller.ts
├── charge-batches.controller.ts
├── charges.controller.ts
├── own-charges.controller.ts
│
├── application/
│   ├── use-cases/
│   │   ├── create-charge-concept.use-case.ts
│   │   ├── update-charge-concept.use-case.ts
│   │   ├── archive-charge-concept.use-case.ts
│   │   ├── list-charge-concepts.use-case.ts
│   │   ├── create-fee-schedule.use-case.ts
│   │   ├── update-fee-schedule.use-case.ts
│   │   ├── archive-fee-schedule.use-case.ts
│   │   ├── assign-unit-fee.use-case.ts
│   │   ├── end-unit-fee-assignment.use-case.ts
│   │   ├── create-billing-period.use-case.ts
│   │   ├── close-billing-period.use-case.ts
│   │   ├── lock-billing-period.use-case.ts
│   │   ├── generate-monthly-charges.use-case.ts
│   │   ├── create-extraordinary-charge.use-case.ts
│   │   ├── create-manual-charge.use-case.ts
│   │   ├── list-charges.use-case.ts
│   │   ├── get-charge.use-case.ts
│   │   ├── cancel-charge.use-case.ts
│   │   ├── reverse-charge.use-case.ts
│   │   ├── adjust-charge.use-case.ts
│   │   ├── get-charge-batch.use-case.ts
│   │   ├── list-charge-batches.use-case.ts
│   │   ├── get-my-charges.use-case.ts
│   │   └── get-my-property-unit-charges.use-case.ts
│   │
│   ├── services/
│   │   ├── money.service.ts
│   │   ├── billing-period-policy.service.ts
│   │   ├── charge-generation.service.ts
│   │   ├── charge-idempotency.service.ts
│   │   ├── charge-policy.service.ts
│   │   ├── fee-schedule-policy.service.ts
│   │   ├── unit-fee-policy.service.ts
│   │   ├── own-charge-policy.service.ts
│   │   └── charge-effective-amount.service.ts
│   │
│   └── ports/
│       ├── charge-concept.repository.ts
│       ├── fee-schedule.repository.ts
│       ├── unit-fee-assignment.repository.ts
│       ├── billing-period.repository.ts
│       ├── charge-batch.repository.ts
│       ├── charge.repository.ts
│       ├── charge-adjustment.repository.ts
│       ├── charge-reversal.repository.ts
│       ├── property-unit-reader.port.ts
│       ├── own-resource-reader.port.ts
│       ├── dues-fees-audit.port.ts
│       └── dues-fees-events.port.ts
│
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   └── errors/
│
├── infrastructure/
│   ├── persistence/
│   ├── audit/
│   └── events/
│
├── policies/
├── dto/
└── tests/
```

---

## 7. Documentación esperada

```text id="rxkd6p"
docs/specs/004-dues-fees/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

Este documento corresponde a:

```text id="l0sd1f"
plan.md
```

---

# 8. Diseño de dominio

## 8.1. ChargeConcept

Representa un concepto de cobro dentro de un tenant.

Ejemplos:

```text id="f2r53a"
Alícuota mensual
Fondo de reserva
Mantenimiento extraordinario
Cuota de seguridad
Arriendo de área comunal
```

Campos conceptuales:

```text id="o2owai"
id
tenantId
code
name
description
category
defaultAmount
currency
status
isSystem
createdAt
updatedAt
archivedAt
```

Responsabilidades:

* clasificar cargos;
* definir monto por defecto opcional;
* permitir conceptos ordinarios o extraordinarios;
* servir como base para FeeSchedule y Charge.

Reglas:

* pertenece a un tenant;
* `code` único por tenant;
* solo conceptos activos generan cargos;
* conceptos usados históricamente no se eliminan físicamente.

---

## 8.2. FeeSchedule

Representa una configuración recurrente de cobro.

Campos conceptuales:

```text id="ejxcez"
id
tenantId
chargeConceptId
name
amount
currency
frequency
effectiveFrom
effectiveTo
status
createdAt
updatedAt
archivedAt
```

Responsabilidades:

* definir monto recurrente;
* definir frecuencia;
* controlar vigencia;
* permitir asignación a unidades.

Reglas:

* pertenece a un tenant;
* usa un `ChargeConcept` activo;
* monto debe ser decimal positivo;
* vigencia debe ser válida;
* cargos emitidos no cambian si el schedule cambia.

---

## 8.3. UnitFeeAssignment

Representa asignación de una configuración de cobro a una unidad.

Campos conceptuales:

```text id="i5slcm"
id
tenantId
propertyUnitId
feeScheduleId
status
startDate
endDate
createdAt
updatedAt
```

Responsabilidades:

* indicar qué unidades generan cargos recurrentes;
* conservar historial de asignaciones;
* controlar vigencia por unidad.

Reglas:

* unidad pertenece al tenant;
* FeeSchedule pertenece al tenant;
* no debe duplicarse asignación activa incompatible;
* se finaliza con `endDate`, no se elimina.

---

## 8.4. BillingPeriod

Representa periodo financiero mensual del tenant.

Campos conceptuales:

```text id="mtoxd6"
id
tenantId
periodCode
startsAt
endsAt
dueDate
status
createdAt
closedAt
closedBy
lockedAt
lockedBy
```

Responsabilidades:

* delimitar generación de cargos;
* controlar cierre mensual;
* impedir generación ordinaria en periodos cerrados o bloqueados.

Reglas:

* `periodCode` único por tenant;
* formato recomendado `YYYY-MM`;
* periodos `closed` no permiten cargos ordinarios;
* periodos `locked` no permiten cambios salvo proceso especial.

---

## 8.5. ChargeBatch

Representa lote de generación de cargos.

Campos conceptuales:

```text id="bq57oq"
id
tenantId
billingPeriodId
feeScheduleId nullable
type
status
requestedBy
startedAt
completedAt
totalItems
successItems
failedItems
errorSummary
createdAt
updatedAt
```

Responsabilidades:

* agrupar cargos generados;
* registrar resultado de generación;
* facilitar auditoría y diagnóstico;
* evitar procesos opacos.

Reglas:

* pertenece a un tenant;
* se asocia a un periodo;
* registra conteos de éxito/error;
* no se elimina físicamente.

---

## 8.6. Charge

Representa obligación económica individual contra una unidad.

Campos conceptuales:

```text id="fwzun8"
id
tenantId
billingPeriodId
propertyUnitId
chargeConceptId
chargeBatchId nullable
type
description
originalAmount
effectiveAmount
currency
issuedDate
dueDate
status
createdAt
updatedAt
cancelledAt nullable
cancelledBy nullable
cancellationReason nullable
idempotencyKey nullable
```

Responsabilidades:

* registrar cargo financiero;
* conservar monto original;
* exponer monto efectivo para estados futuros;
* permitir ajustes/reversos;
* permitir pagos futuros.

Reglas:

* pertenece a tenant;
* pertenece a unidad;
* pertenece a periodo;
* pertenece a concepto;
* `originalAmount` no se sobrescribe;
* `effectiveAmount` se recalcula por ajustes/reversos;
* no se elimina físicamente;
* idempotencia por periodo/concepto/unidad/tipo.

---

## 8.7. ChargeAdjustment

Representa ajuste aplicado a un cargo.

Campos conceptuales:

```text id="g7qoy1"
id
tenantId
chargeId
type
amount
reason
createdBy
createdAt
reversedAt nullable
```

Responsabilidades:

* corregir o modificar monto efectivo;
* conservar cargo original;
* documentar razón;
* auditar cambios financieros.

Reglas:

* pertenece al mismo tenant que el cargo;
* monto decimal positivo;
* tipo define si incrementa o disminuye;
* requiere motivo;
* no se elimina físicamente.

---

## 8.8. ChargeReversal

Representa reverso formal de un cargo.

Campos conceptuales:

```text id="k40d4g"
id
tenantId
chargeId
reason
reversedBy
reversedAt
createdAt
traceId
```

Responsabilidades:

* registrar reverso sin borrar cargo original;
* permitir auditoría;
* evitar correcciones destructivas.

Reglas:

* cargo debe pertenecer al tenant;
* cargo debe estar en estado reversible;
* requiere motivo;
* no se puede reversar dos veces salvo política explícita.

---

# 9. Value Objects

## 9.1. Money

Responsabilidad:

* representar montos monetarios con precisión decimal;
* validar moneda;
* evitar `float`.

Reglas:

```text id="xwczgu"
amount decimal
currency USD en MVP
scale 2
amount >= 0 según contexto
```

Implementación recomendada:

* usar `Decimal` de Prisma/decimal.js;
* serializar como string en API.

---

## 9.2. ChargeConceptCode

Reglas:

* requerido;
* único por tenant;
* trim;
* lowercase o normalized;
* formato estable.

Ejemplo:

```text id="t2w05j"
monthly-dues
reserve-fund
extra-security-fee
```

---

## 9.3. BillingPeriodCode

Reglas:

* formato `YYYY-MM`;
* único por tenant;
* debe derivar `startsAt` y `endsAt`.

Ejemplo:

```text id="ftkrjo"
2026-07
```

---

## 9.4. DueDate

Reglas:

* fecha válida;
* normalmente dentro o después del periodo;
* configurable por tenant en futuro;
* requerida para cargos emitidos.

---

## 9.5. ChargeStatus

Valores:

```text id="zlc2sv"
draft
issued
partiallyPaid
paid
cancelled
reversed
disputed
archived
```

En esta spec se operan principalmente:

```text id="9zf8bc"
draft
issued
cancelled
reversed
disputed
archived
```

`partiallyPaid` y `paid` quedan reservados para `005-payments`.

---

## 9.6. ChargeType

Valores:

```text id="y6w2wc"
ordinary
extraordinary
manual
fine
reservation
adjustment
openingBalance
other
```

Operativos en MVP:

```text id="svgo8c"
ordinary
extraordinary
manual
adjustment
other
```

Reservados:

```text id="1j369l"
fine
reservation
openingBalance
```

---

## 9.7. Frequency

Valores sugeridos:

```text id="wcnswl"
monthly
quarterly
annual
oneTime
```

MVP recomendado:

```text id="4c6ikv"
monthly
oneTime
```

---

## 9.8. IdempotencyKey

Responsabilidad:

* evitar duplicación de cargos;
* controlar generación repetida;
* permitir reintentos seguros.

Formato recomendado para generación mensual:

```text id="0xhd7v"
tenantId:billingPeriodId:feeScheduleId:propertyUnitId:chargeType
```

---

# 10. Modelo Prisma preliminar

El modelo completo se detallará en:

```text id="cuxwo9"
docs/specs/004-dues-fees/data-model.md
```

Tablas esperadas:

```text id="e7v70l"
charge_concepts
fee_schedules
unit_fee_assignments
billing_periods
charge_batches
charges
charge_adjustments
charge_reversals
```

Relaciones externas:

```text id="s9o1jk"
tenants.id
property_units.id
user_profiles.id
```

Reglas de persistencia:

* `tenantId` obligatorio;
* dinero con `Decimal(12,2)` o equivalente;
* `currency` default USD;
* `onDelete: Restrict`;
* unique constraints para idempotencia;
* no cascade delete peligroso;
* índices por tenant, periodo, unidad, estado y concepto.

---

# 11. Constraints principales

## 11.1. ChargeConcept

```text id="1zf2m2"
unique(tenant_id, code)
```

---

## 11.2. FeeSchedule

Recomendado:

```text id="gow7nr"
index(tenant_id, charge_concept_id, status)
```

---

## 11.3. UnitFeeAssignment

Evitar duplicidad activa incompatible.

Regla lógica:

```text id="8uwxbx"
propertyUnitId + feeScheduleId + active date range
```

En MVP puede aplicarse validación en aplicación y repositorio.

---

## 11.4. BillingPeriod

```text id="7lz4su"
unique(tenant_id, period_code)
```

---

## 11.5. Charge idempotency

Para generación ordinaria:

```text id="fop57u"
unique(tenant_id, billing_period_id, property_unit_id, charge_concept_id, type)
```

o:

```text id="ky2o8a"
unique(tenant_id, idempotency_key)
```

Recomendación MVP:

```text id="qwiyx8"
usar idempotency_key único por tenant
```

porque permite flexibilidad para cargos futuros.

---

## 11.6. ChargeAdjustment

```text id="87i85c"
charge.tenantId == adjustment.tenantId
```

Validar en aplicación.

---

## 11.7. ChargeReversal

Regla recomendada:

```text id="g3mjie"
unique(tenant_id, charge_id)
```

para evitar reversar un cargo más de una vez en MVP.

---

# 12. Repositorios

## 12.1. ChargeConceptRepository

Contrato sugerido:

```text id="72f0y2"
create(input)
findById(tenantId, chargeConceptId)
findByCode(tenantId, code)
list(tenantId, query)
update(tenantId, chargeConceptId, input)
archive(tenantId, chargeConceptId, actorId)
existsByCode(tenantId, code)
```

---

## 12.2. FeeScheduleRepository

Contrato sugerido:

```text id="arhmv8"
create(input)
findById(tenantId, feeScheduleId)
list(tenantId, query)
update(tenantId, feeScheduleId, input)
archive(tenantId, feeScheduleId, actorId)
findActiveByConcept(tenantId, chargeConceptId)
```

---

## 12.3. UnitFeeAssignmentRepository

Contrato sugerido:

```text id="kaz3a3"
create(input)
findById(tenantId, unitFeeAssignmentId)
list(tenantId, query)
listActiveByUnit(tenantId, propertyUnitId)
listActiveForGeneration(tenantId, billingPeriodId, feeScheduleId?)
end(tenantId, unitFeeAssignmentId, endDate, actorId)
existsActiveAssignment(tenantId, propertyUnitId, feeScheduleId)
```

---

## 12.4. BillingPeriodRepository

Contrato sugerido:

```text id="65zt9p"
create(input)
findById(tenantId, billingPeriodId)
findByCode(tenantId, periodCode)
list(tenantId, query)
close(tenantId, billingPeriodId, actorId)
lock(tenantId, billingPeriodId, actorId)
isOpen(tenantId, billingPeriodId)
```

---

## 12.5. ChargeBatchRepository

Contrato sugerido:

```text id="z7wp8m"
create(input)
findById(tenantId, chargeBatchId)
list(tenantId, query)
markProcessing(tenantId, chargeBatchId)
markCompleted(tenantId, chargeBatchId, stats)
markCompletedWithErrors(tenantId, chargeBatchId, stats)
markCancelled(tenantId, chargeBatchId, reason)
```

---

## 12.6. ChargeRepository

Contrato sugerido:

```text id="rjt83u"
create(input)
createManyIdempotent(inputs)
findById(tenantId, chargeId)
findByIdempotencyKey(tenantId, idempotencyKey)
list(tenantId, query)
listByPropertyUnit(tenantId, propertyUnitId, query)
listOwnCharges(tenantId, propertyUnitIds, query)
cancel(tenantId, chargeId, actorId, reason)
markReversed(tenantId, chargeId, actorId, reason)
updateEffectiveAmount(tenantId, chargeId, amount)
```

---

## 12.7. ChargeAdjustmentRepository

Contrato sugerido:

```text id="561ekj"
create(input)
findById(tenantId, adjustmentId)
listByCharge(tenantId, chargeId)
reverseAdjustment(tenantId, adjustmentId, actorId, reason)
```

---

## 12.8. ChargeReversalRepository

Contrato sugerido:

```text id="ixd37i"
create(input)
findByChargeId(tenantId, chargeId)
existsForCharge(tenantId, chargeId)
```

---

## 12.9. PropertyUnitReaderPort

Puerto hacia `003-residents-properties`.

Responsabilidad:

```text id="kxzpcr"
findPropertyUnitById(tenantId, propertyUnitId)
listActivePropertyUnits(tenantId)
validatePropertyUnitBelongsToTenant(tenantId, propertyUnitId)
```

Regla:

```text id="4crpis"
004-dues-fees no debe consultar directamente tablas internas de 003 sin puerto/repositorio controlado.
```

---

## 12.10. OwnResourceReaderPort

Puerto para resolver unidades propias del usuario.

Responsabilidad:

```text id="dpf1sv"
getOwnPropertyUnitIds(tenantId, userProfileId)
```

Puede implementarse inicialmente usando servicios de `003-residents-properties`.

---

# 13. Servicios de aplicación

## 13.1. MoneyService

Responsabilidad:

* validar montos;
* normalizar decimal;
* sumar/restar montos;
* serializar como string;
* evitar float.

Métodos sugeridos:

```text id="tukec4"
parse(amount, currency)
add(a, b)
subtract(a, b)
isPositive(amount)
isZero(amount)
toApiString(amount)
```

---

## 13.2. BillingPeriodPolicyService

Responsabilidad:

* validar periodo abierto;
* validar periodo cerrado;
* validar formato `YYYY-MM`;
* bloquear generación en cerrado/locked;
* cerrar periodos.

---

## 13.3. FeeSchedulePolicyService

Responsabilidad:

* validar concepto activo;
* validar monto;
* validar vigencia;
* validar frecuencia;
* impedir cambios que alteren cargos ya emitidos.

---

## 13.4. UnitFeePolicyService

Responsabilidad:

* validar unidad activa;
* validar FeeSchedule activo;
* validar asignación no duplicada;
* validar vigencia;
* finalizar asignación.

---

## 13.5. ChargeGenerationService

Responsabilidad:

* obtener assignments activos;
* filtrar unidades activas;
* construir cargos;
* generar idempotency keys;
* crear batch;
* persistir cargos;
* registrar errores parciales;
* completar batch.

---

## 13.6. ChargeIdempotencyService

Responsabilidad:

* construir `idempotencyKey`;
* detectar duplicados;
* permitir reintentos seguros;
* evitar doble cargo mensual.

Formato recomendado:

```text id="h8kd9s"
tenantId:billingPeriodId:feeScheduleId:propertyUnitId:ordinary
```

---

## 13.7. ChargePolicyService

Responsabilidad:

* validar estado de cargo;
* validar cancelación;
* validar reverso;
* validar ajuste;
* impedir modificación destructiva;
* impedir operaciones sobre cargos pagados cuando `005-payments` exista.

---

## 13.8. ChargeEffectiveAmountService

Responsabilidad:

* calcular monto efectivo;
* aplicar ajustes;
* aplicar reversos;
* conservar monto original.

Regla:

```text id="flmvr0"
effectiveAmount = originalAmount + increases + surcharges - decreases - discounts - reversals
```

La fórmula exacta deberá cerrarse en `data-model.md` y specs de account statements.

---

## 13.9. OwnChargePolicyService

Responsabilidad:

* validar que el usuario puede ver cargos de una unidad;
* usar `OwnResourceReaderPort`;
* rechazar cargos de unidades ajenas;
* soportar `charges.read.own`.

---

# 14. Casos de uso principales

## 14.1. CreateChargeConceptUseCase

Responsabilidad:

* validar tenant activo;
* validar permiso `chargeConcepts.create`;
* validar código único;
* crear concepto;
* auditar;
* emitir evento.

---

## 14.2. UpdateChargeConceptUseCase

Responsabilidad:

* validar concepto;
* actualizar campos permitidos;
* impedir cambios destructivos si el concepto tiene cargos históricos;
* auditar;
* emitir evento.

---

## 14.3. ArchiveChargeConceptUseCase

Responsabilidad:

* archivar concepto;
* impedir nuevos cargos;
* conservar historial;
* auditar.

---

## 14.4. CreateFeeScheduleUseCase

Responsabilidad:

* validar concepto activo;
* validar monto;
* validar moneda;
* validar frecuencia;
* crear schedule;
* auditar;
* emitir evento.

---

## 14.5. UpdateFeeScheduleUseCase

Responsabilidad:

* actualizar configuración futura;
* no alterar cargos ya emitidos;
* auditar;
* emitir evento.

---

## 14.6. ArchiveFeeScheduleUseCase

Responsabilidad:

* archivar schedule;
* impedir generación futura;
* conservar historial;
* auditar.

---

## 14.7. AssignUnitFeeUseCase

Responsabilidad:

* validar unidad activa;
* validar FeeSchedule activo;
* validar tenant;
* evitar duplicados activos;
* crear assignment;
* auditar;
* emitir evento.

---

## 14.8. EndUnitFeeAssignmentUseCase

Responsabilidad:

* finalizar assignment;
* registrar `endDate`;
* conservar historial;
* auditar;
* emitir evento.

---

## 14.9. CreateBillingPeriodUseCase

Responsabilidad:

* validar `periodCode`;
* validar unicidad por tenant;
* crear periodo `open`;
* derivar fechas;
* definir dueDate;
* auditar;
* emitir evento.

---

## 14.10. CloseBillingPeriodUseCase

Responsabilidad:

* cerrar periodo;
* impedir generación ordinaria futura;
* auditar;
* emitir evento.

---

## 14.11. LockBillingPeriodUseCase

Responsabilidad:

* bloquear periodo;
* impedir cambios ordinarios;
* auditar;
* emitir evento.

---

## 14.12. GenerateMonthlyChargesUseCase

Responsabilidad:

* validar permiso `fees.generate`;
* validar tenant activo;
* validar periodo open;
* crear batch;
* obtener assignments activos;
* validar unidades activas;
* construir cargos ordinarios;
* crear cargos idempotentes;
* registrar conteos;
* marcar batch completed/completedWithErrors;
* auditar;
* emitir `MonthlyFeesGenerated`.

---

## 14.13. CreateExtraordinaryChargeUseCase

Responsabilidad:

* validar permiso `charges.create`;
* validar concepto activo;
* validar unidades;
* validar periodo;
* validar monto;
* exigir motivo;
* crear cargos extraordinarios;
* auditar;
* emitir evento.

---

## 14.14. CreateManualChargeUseCase

Responsabilidad:

* validar permiso `charges.create`;
* validar unidad;
* validar concepto;
* validar monto;
* crear cargo manual;
* auditar;
* emitir evento.

---

## 14.15. ListChargesUseCase

Responsabilidad:

* listar cargos del tenant;
* soportar filtros;
* soportar paginación;
* no mezclar tenants.

---

## 14.16. GetChargeUseCase

Responsabilidad:

* consultar cargo del tenant;
* devolver detalle, ajustes y reversos;
* no exponer datos personales innecesarios.

---

## 14.17. CancelChargeUseCase

Responsabilidad:

* validar permiso `charges.cancel`;
* validar estado cancelable;
* exigir motivo;
* marcar cargo como cancelled;
* conservar monto original;
* auditar;
* emitir evento.

---

## 14.18. ReverseChargeUseCase

Responsabilidad:

* validar permiso `charges.reverse`;
* validar estado reversible;
* validar no reversado previamente;
* exigir motivo;
* crear `ChargeReversal`;
* actualizar estado del cargo;
* auditar;
* emitir evento.

---

## 14.19. AdjustChargeUseCase

Responsabilidad:

* validar permiso `charges.adjust`;
* validar estado ajustable;
* validar monto;
* exigir motivo;
* crear `ChargeAdjustment`;
* recalcular `effectiveAmount`;
* auditar;
* emitir evento.

---

## 14.20. GetMyChargesUseCase

Responsabilidad:

* validar permiso `charges.read.own`;
* resolver unidades propias;
* devolver cargos de esas unidades;
* no devolver cargos ajenos.

---

## 14.21. GetMyPropertyUnitChargesUseCase

Responsabilidad:

* validar unidad propia;
* listar cargos de esa unidad;
* rechazar unidad ajena.

---

# 15. Controladores REST

## 15.1. ChargeConceptsController

Ruta base:

```text id="55i80j"
/api/v1/tenant/charge-concepts
```

Endpoints:

```text id="u2z4bl"
GET    /
POST   /
GET    /:chargeConceptId
PATCH  /:chargeConceptId
POST   /:chargeConceptId/archive
```

---

## 15.2. FeeSchedulesController

Ruta base:

```text id="2keplm"
/api/v1/tenant/fee-schedules
```

Endpoints:

```text id="essvtp"
GET    /
POST   /
GET    /:feeScheduleId
PATCH  /:feeScheduleId
POST   /:feeScheduleId/archive
```

---

## 15.3. UnitFeesController

Ruta base:

```text id="2nsza6"
/api/v1/tenant/unit-fees
```

Endpoints:

```text id="bmkw4m"
GET    /
POST   /
GET    /:unitFeeAssignmentId
POST   /:unitFeeAssignmentId/end
```

---

## 15.4. BillingPeriodsController

Ruta base:

```text id="6ge7oc"
/api/v1/tenant/billing-periods
```

Endpoints:

```text id="5l1zmd"
GET    /
POST   /
GET    /:billingPeriodId
POST   /:billingPeriodId/close
POST   /:billingPeriodId/lock
```

---

## 15.5. ChargeGenerationController

Ruta base:

```text id="rj07mc"
/api/v1/tenant/charges/generate-monthly
```

Endpoint:

```text id="3e1fl2"
POST /
```

---

## 15.6. ChargeBatchesController

Ruta base:

```text id="rfkw34"
/api/v1/tenant/charge-batches
```

Endpoints:

```text id="47up19"
GET /
GET /:chargeBatchId
```

---

## 15.7. ChargesController

Ruta base:

```text id="ze9dv1"
/api/v1/tenant/charges
```

Endpoints:

```text id="uvpvjv"
GET    /
POST   /
GET    /:chargeId
POST   /:chargeId/cancel
POST   /:chargeId/reverse
POST   /:chargeId/adjustments
```

---

## 15.8. OwnChargesController

Ruta base:

```text id="0ve59h"
/api/v1/me
```

Endpoints:

```text id="jx739t"
GET /charges
GET /property-units/:propertyUnitId/charges
```

---

# 16. DTOs principales

## 16.1. CreateChargeConceptDto

Campos:

```text id="6nawq9"
code
name
description
category
defaultAmount
currency
```

Validaciones:

* code requerido;
* name requerido;
* defaultAmount decimal opcional;
* currency USD en MVP.

---

## 16.2. CreateFeeScheduleDto

Campos:

```text id="8jdwkx"
chargeConceptId
name
amount
currency
frequency
effectiveFrom
effectiveTo
```

Validaciones:

* concepto activo;
* amount decimal positivo;
* frequency válida;
* fechas válidas.

---

## 16.3. AssignUnitFeeDto

Campos:

```text id="vtob44"
propertyUnitId
feeScheduleId
startDate
endDate
```

Validaciones:

* unidad activa;
* FeeSchedule activo;
* fechas válidas;
* no duplicado activo.

---

## 16.4. CreateBillingPeriodDto

Campos:

```text id="auuzop"
periodCode
dueDate
```

Validaciones:

* periodCode `YYYY-MM`;
* único por tenant;
* dueDate válida.

---

## 16.5. GenerateMonthlyChargesDto

Campos:

```text id="r1n1pg"
billingPeriodId
feeScheduleId nullable
dryRun boolean opcional
```

Validaciones:

* periodo open;
* feeSchedule activo si se envía;
* tenant activo.

---

## 16.6. CreateChargeDto

Campos:

```text id="fiy1hw"
propertyUnitId
billingPeriodId
chargeConceptId
type
description
amount
currency
issuedDate
dueDate
```

Validaciones:

* unidad del tenant;
* concepto activo;
* periodo abierto;
* monto decimal positivo;
* tipo permitido.

---

## 16.7. CancelChargeDto

Campos:

```text id="phqqbq"
reason
```

Validaciones:

* motivo requerido;
* cargo en estado cancelable.

---

## 16.8. ReverseChargeDto

Campos:

```text id="34x557"
reason
```

Validaciones:

* motivo requerido;
* cargo reversible;
* no reversado previamente.

---

## 16.9. CreateChargeAdjustmentDto

Campos:

```text id="d4e3z7"
type
amount
reason
```

Validaciones:

* type válido;
* amount decimal positivo;
* reason requerido;
* cargo ajustable.

---

# 17. Autenticación y autorización

## 17.1. Endpoints administrativos financieros

Todos los endpoints `/api/v1/tenant/*` requieren:

```text id="ymme1w"
AuthGuard
TenantGuard
TenantPermissionGuard
```

---

## 17.2. Endpoints propios

Los endpoints `/api/v1/me/charges` requieren:

```text id="vuf4i4"
AuthGuard
TenantGuard
TenantPermissionGuard o PolicyGuard
OwnChargePolicyService
```

---

## 17.3. Permisos administrativos

Ejemplos:

```text id="vp09gl"
chargeConcepts.create
feeSchedules.create
unitFees.assign
billingPeriods.create
fees.generate
charges.create
charges.cancel
charges.reverse
charges.adjust
```

---

## 17.4. Permisos propios

```text id="s4mkn3"
charges.read.own
```

---

## 17.5. Separación de funciones

No asumir que un rol con permiso de lectura puede modificar o anular.

Ejemplo:

```text id="d4xmtf"
charges.read ≠ charges.cancel
fees.generate ≠ charges.reverse
```

---

# 18. Auditoría

## 18.1. Puerto

Crear:

```text id="6c7rjn"
DuesFeesAuditPort
```

Responsabilidad:

* registrar cambios de conceptos;
* registrar cambios de schedules;
* registrar asignaciones;
* registrar periodos;
* registrar generación de cargos;
* registrar anulaciones;
* registrar reversos;
* registrar ajustes.

---

## 18.2. Eventos auditables

```text id="d5bghb"
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

---

## 18.3. Campos mínimos

```text id="lxgxxa"
tenantId
actorUserId
action
resourceType
resourceId
oldValue
newValue
result
traceId
occurredAt
```

---

## 18.4. Campos financieros recomendados

```text id="1x5n8h"
billingPeriodId
propertyUnitId
chargeId
chargeConceptId
amount
currency
reason
batchId
```

---

# 19. Eventos de dominio

Eventos mínimos:

```text id="h38hlt"
ChargeConceptCreated
ChargeConceptUpdated
ChargeConceptArchived
FeeScheduleCreated
FeeScheduleUpdated
FeeScheduleArchived
UnitFeeAssigned
UnitFeeEnded
BillingPeriodCreated
BillingPeriodClosed
BillingPeriodLocked
ChargeBatchCreated
ChargeBatchProcessing
ChargeBatchCompleted
ChargeBatchCompletedWithErrors
MonthlyFeesGenerated
ChargeCreated
ExtraordinaryChargesCreated
ManualChargeCreated
ChargeCancelled
ChargeReversed
ChargeAdjusted
```

Implementación inicial:

* eventos internos;
* sin broker externo obligatorio;
* compatible con outbox futuro.

---

# 20. Observabilidad

## 20.1. Logs

Registrar:

```text id="gcukab"
charge concept created
fee schedule created
unit fee assigned
billing period created
monthly generation started
monthly generation completed
monthly generation completed with errors
charge created
charge cancelled
charge reversed
charge adjusted
own charge access denied
cross-tenant financial access attempt
```

No registrar:

```text id="4uzwfd"
Authorization header
access token
payload completo
datos personales de propietarios/residentes
stack trace en producción
```

---

## 20.2. Métricas sugeridas

```text id="b2gs70"
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

---

## 20.3. Trace

Todo flujo financiero crítico debe usar:

```text id="hjxgvo"
traceId
```

Especialmente:

* generación mensual;
* cancelación;
* reverso;
* ajuste;
* cierre de periodo.

---

# 21. Seguridad

Controles obligatorios:

* `tenantId` obligatorio;
* tenant activo;
* membership activa;
* permiso financiero específico;
* validación de unidad del tenant;
* validación de concepto del tenant;
* periodo abierto;
* Decimal;
* idempotencia;
* no eliminación física;
* auditoría financiera;
* logs sanitizados;
* tests financieros;
* tests multitenant.

Riesgos críticos:

| Riesgo                        | Mitigación                    |
| ----------------------------- | ----------------------------- |
| Cargo a unidad de otro tenant | tenant validation             |
| Cargo duplicado mensual       | idempotency key               |
| Float en dinero               | Money VO + Decimal            |
| Anular sin permiso            | TenantPermissionGuard         |
| Generar en periodo cerrado    | BillingPeriodPolicyService    |
| Borrar cargo emitido          | no DELETE + onDelete Restrict |
| Alterar monto original        | ajustes/reversos              |
| Propietario ve cargo ajeno    | OwnChargePolicyService        |
| Falta de auditoría            | DuesFeesAuditPort             |

---

# 22. Migración

## 22.1. Nombre sugerido

```text id="0o091f"
004_create_dues_fees
```

---

## 22.2. Tablas

```text id="so6svz"
charge_concepts
fee_schedules
unit_fee_assignments
billing_periods
charge_batches
charges
charge_adjustments
charge_reversals
```

---

## 22.3. Enums

```text id="b4wtdc"
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
CurrencyCode
```

---

## 22.4. Reglas de migración

* `tenant_id` obligatorio;
* `property_unit_id` obligatorio en `charges`;
* montos `Decimal`;
* `currency` requerido;
* unique constraints;
* idempotency key unique;
* `onDelete: Restrict`;
* no cascade delete peligroso;
* índices financieros;
* revisar SQL.

---

# 23. Seeds

Seeds sugeridos:

```text id="dpk86x"
charge concept "monthly-dues"
charge concept "reserve-fund"
charge concept "extraordinary-maintenance"
fee schedule monthly dues
billing period actual demo
unit fee assignments para unidades demo
charges demo opcionales
```

No usar:

* datos reales;
* montos de clientes reales;
* cargos reales;
* unidades reales fuera de fixtures demo.

Usar:

```text id="kos57t"
tenant demo
unidades demo
montos ficticios
USD
```

---

# 24. Testing plan resumido

El documento completo será:

```text id="jaggag"
docs/specs/004-dues-fees/test-plan.md
```

## 24.1. Unit tests

* Money;
* BillingPeriodCode;
* ChargeStatus;
* ChargeType;
* ChargeConcept;
* FeeSchedule;
* Charge;
* ChargeAdjustment;
* ChargeReversal;
* idempotency key.

---

## 24.2. Integration tests

* crear conceptos;
* unique code por tenant;
* crear schedules;
* asignar a unidad;
* crear periodo;
* generar cargos;
* idempotencia;
* cancelación;
* reverso;
* ajuste;
* constraints.

---

## 24.3. API tests

* Charge Concepts API;
* Fee Schedules API;
* Unit Fees API;
* Billing Periods API;
* Charge Generation API;
* Charge Batches API;
* Charges API;
* Own Charges API.

---

## 24.4. Authorization tests

* sin token;
* sin permiso;
* sin membership;
* tenant suspendido;
* usuario disabled;
* propietario sin `.own`;
* usuario sin relación con unidad.

---

## 24.5. Multitenancy tests

* Tenant A no ve cargos B;
* Tenant A no usa conceptos B;
* Tenant A no usa unidades B;
* Tenant A no genera cargos B;
* `.own` no devuelve cargos ajenos.

---

## 24.6. Financial regression tests

* generación idempotente;
* cargo original no cambia;
* ajuste modifica effectiveAmount;
* reverso no borra cargo;
* periodo cerrado bloquea generación;
* batch registra totales correctos;
* decimal exacto.

---

# 25. Orden recomendado de desarrollo

## Fase 1 — Documentación

```text id="e8h8nv"
1. spec.md
2. plan.md
3. data-model.md
4. api-contract.md
5. test-plan.md
6. tasks.md
7. security-notes.md
```

---

## Fase 2 — Base técnica

```text id="92beew"
1. Crear módulo dues-fees.
2. Crear controladores base.
3. Crear value objects.
4. Crear entidades.
5. Crear errores.
6. Crear eventos.
7. Crear DTOs.
```

---

## Fase 3 — Persistencia

```text id="s44etu"
1. Crear modelos Prisma.
2. Crear migración.
3. Crear constraints.
4. Crear repositorios.
5. Crear mappers.
6. Crear seeds demo.
7. Crear migration tests.
```

---

## Fase 4 — Servicios y policies

```text id="x3nrqm"
1. MoneyService.
2. BillingPeriodPolicyService.
3. FeeSchedulePolicyService.
4. UnitFeePolicyService.
5. ChargeGenerationService.
6. ChargeIdempotencyService.
7. ChargePolicyService.
8. ChargeEffectiveAmountService.
9. OwnChargePolicyService.
```

---

## Fase 5 — Casos de uso

```text id="1yd2j3"
1. Charge concepts.
2. Fee schedules.
3. Unit fee assignments.
4. Billing periods.
5. Charge generation.
6. Manual/extraordinary charges.
7. Charge cancellation.
8. Charge reversal.
9. Charge adjustment.
10. Own charges.
```

---

## Fase 6 — API y autorización

```text id="dahe7y"
1. Controladores administrativos.
2. OwnChargesController.
3. Guards.
4. OpenAPI.
```

---

## Fase 7 — Auditoría, eventos y pruebas

```text id="12dmf0"
1. AuditPort.
2. EventsPort.
3. Logs.
4. Métricas.
5. Unit tests.
6. Integration tests.
7. API tests.
8. Authorization tests.
9. Multitenancy tests.
10. Financial regression tests.
```

---

# 26. Criterios técnicos de aceptación

La implementación técnica se acepta si:

* módulo NestJS creado;
* modelos Prisma creados;
* migración aplicada;
* `tenantId` obligatorio;
* dinero modelado con Decimal;
* conceptos de cobro creados por tenant;
* FeeSchedules creados;
* UnitFeeAssignments creados;
* BillingPeriods creados;
* generación mensual funciona;
* generación mensual es idempotente;
* cargos extraordinarios funcionan;
* cargos manuales funcionan;
* cancelaciones funcionan;
* reversos funcionan;
* ajustes funcionan;
* cargos propios funcionan;
* no existe acceso cross-tenant;
* no se elimina ningún cargo;
* monto original no se sobrescribe;
* auditoría financiera funciona;
* eventos se emiten;
* OpenAPI actualizado;
* pruebas unitarias pasan;
* pruebas de integración pasan;
* pruebas API pasan;
* pruebas de autorización pasan;
* pruebas multitenant pasan;
* pruebas financieras pasan;
* CI pasa.

---

# 27. Comandos esperados

Comandos generales:

```bash id="1q6wyl"
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run test:api
npm run test:authorization
npm run test:multitenancy
npm run test:security
npm run openapi:validate
npm run prisma:migrate:dev
npm run build
```

Comandos específicos sugeridos:

```bash id="52s1g5"
npm run test:dues-fees
npm run test:dues-fees:unit
npm run test:dues-fees:integration
npm run test:dues-fees:api
npm run test:dues-fees:authorization
npm run test:dues-fees:multitenancy
npm run test:dues-fees:financial
npm run test:dues-fees:security
```

---

# 28. Riesgos de implementación

| Riesgo                        | Impacto | Mitigación                          |
| ----------------------------- | ------- | ----------------------------------- |
| Duplicar cargos mensuales     | Crítico | idempotency key + unique constraint |
| Cargo a unidad de otro tenant | Crítico | tenant validation + MT tests        |
| Concepto de otro tenant       | Crítico | tenant validation                   |
| Usar float                    | Alto    | Money VO + Decimal                  |
| Sobrescribir monto original   | Alto    | adjustments/reversals               |
| Generar en periodo cerrado    | Alto    | BillingPeriodPolicyService          |
| Anular sin permiso            | Crítico | permissions + audit                 |
| Falta de auditoría            | Crítico | DuesFeesAuditPort                   |
| Propietario ve cargo ajeno    | Alto    | OwnChargePolicyService              |
| Borrar cargo emitido          | Crítico | no DELETE + Restrict                |
| Batch parcial opaco           | Medio   | ChargeBatch stats                   |

---

# 29. Checklist para agentes IA

Antes de generar código para este módulo, el agente debe leer:

```text id="ko6tcd"
docs/sdd/constitution.md
docs/sdd/domain-map.md
docs/sdd/architecture.md
docs/sdd/security.md
docs/sdd/api-guidelines.md
docs/sdd/data-governance.md
docs/decisions/ADR-003-database-strategy.md
docs/decisions/ADR-004-multitenancy-strategy.md
docs/decisions/ADR-007-authorization-strategy.md
docs/decisions/ADR-011-testing-strategy.md
docs/specs/001-tenants/spec.md
docs/specs/002-users-roles/spec.md
docs/specs/003-residents-properties/spec.md
docs/specs/004-dues-fees/spec.md
docs/specs/004-dues-fees/plan.md
```

El agente no debe:

* crear cargos sin tenant;
* crear cargos sin unidad;
* crear cargos con float;
* duplicar cargos mensuales;
* eliminar cargos emitidos;
* sobrescribir monto original;
* usar unidades de otro tenant;
* usar conceptos de otro tenant;
* omitir auditoría financiera;
* implementar pagos;
* implementar estados de cuenta consolidados;
* implementar mora avanzada;
* implementar contabilidad;
* implementar n8n;
* omitir pruebas financieras.

---

# 30. Estrategia de entrega

## Incremento 1 — Configuración financiera base

* ChargeConcept.
* FeeSchedule.
* BillingPeriod.
* Seeds base.

---

## Incremento 2 — Asignación a unidades

* UnitFeeAssignment.
* Validación de PropertyUnit.
* Policies de asignación.

---

## Incremento 3 — Generación mensual

* ChargeBatch.
* Charge.
* Idempotencia.
* GenerateMonthlyChargesUseCase.

---

## Incremento 4 — Operaciones sobre cargos

* cargos manuales;
* cargos extraordinarios;
* cancelación;
* reverso;
* ajustes.

---

## Incremento 5 — Acceso propio y hardening

* OwnChargesController.
* OwnChargePolicyService.
* Auditoría.
* Eventos.
* Observabilidad.
* Financial regression tests.
* OpenAPI.

---

# 31. Pendientes para documentos derivados

## 31.1. `data-model.md`

Debe detallar:

* tablas;
* columnas;
* enums;
* constraints;
* índices;
* Prisma completo;
* idempotency keys;
* money precision;
* seeds;
* reglas de migración.

---

## 31.2. `api-contract.md`

Debe detallar:

* endpoints;
* permisos;
* requests;
* responses;
* errores;
* generación mensual;
* batches;
* cargos propios;
* filtros;
* paginación.

---

## 31.3. `test-plan.md`

Debe detallar:

* unit tests;
* integration tests;
* API tests;
* authorization tests;
* multitenancy tests;
* financial regression tests;
* idempotency tests;
* security tests.

---

## 31.4. `tasks.md`

Debe convertir este plan en tareas ejecutables.

---

## 31.5. `security-notes.md`

Debe detallar:

* riesgos financieros;
* idempotencia;
* no eliminación física;
* precisión monetaria;
* cross-tenant;
* auditoría reforzada;
* acceso propio;
* logs.

---

# 32. Decisión final de implementación

El módulo `004-dues-fees` se implementará como módulo interno de NestJS dentro del monolito modular.

Usará PostgreSQL y Prisma.

Todo registro financiero tendrá `tenantId`.

Todo monto se almacenará como Decimal.

La generación de cargos mensuales será idempotente.

Los cargos emitidos no se eliminarán físicamente.

El monto original del cargo no se sobrescribirá.

La corrección de cargos se hará mediante:

```text id="fq070t"
cancelación
reverso
ajuste
```

La prioridad técnica será:

```text id="ob4lm0"
precisión monetaria
idempotencia
trazabilidad financiera
auditoría
multitenancy
seguridad
compatibilidad con pagos y estados de cuenta futuros
```

Este módulo debe completarse antes de iniciar `005-payments` y `006-account-statements`, porque ambos dependen de cargos financieros correctos, no duplicados y auditables.
