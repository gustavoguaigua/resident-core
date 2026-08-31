# Data Model — Spec 004 Dues, Fees, Charge Concepts and Charge Generation

> Moneda/settings Sprint 3: GAP-S3-004 está cerrado por
> `docs/changes/GAP-S3-004-FINANCIAL-CURRENCY-SETTINGS-2026-08-29.md`;
> `Tenant.currency` es la única autoridad y los settings autorizados son los enumerados
> allí. Este documento queda `accepted`.

> Contrato Sprint 3: GAP-S3-003 está cerrado por
> `docs/changes/GAP-S3-003-FINANCIAL-CROSS-SLICE-SEMANTICS-2026-08-29.md`. Ese contrato
> prevalece para fuentes, movimientos, estados, Decimal y concurrencia; este documento
> queda `accepted` tras el cierre de sus demás blockers.

## 1. Información del documento

| Campo                  | Valor                                                        |
| ---------------------- | ------------------------------------------------------------ |
| Proyecto               | RESIDENT Core                                                |
| Spec ID                | 004                                                          |
| Módulo                 | Dues and Fees                                                |
| Documento              | Data Model                                                   |
| Ruta                   | `docs/specs/004-dues-fees/data-model.md`                     |
| Versión                | 0.1                                                          |
| Estado                 | accepted                                                 |
| Fecha                  | 2026-07-14                                                   |
| Documento base         | `docs/specs/004-dues-fees/spec.md`                           |
| Plan técnico           | `docs/specs/004-dues-fees/plan.md`                           |
| Depende de             | `001-tenants`, `002-users-roles`, `003-residents-properties` |
| Base de datos          | PostgreSQL                                                   |
| ORM                    | Prisma                                                       |
| Estrategia multitenant | Shared database + shared schema + `tenant_id`                |
| Precisión monetaria    | Decimal                                                      |
| Moneda MVP             | USD                                                          |

---

## 2. Propósito

Este documento define el modelo de datos de la spec `004-dues-fees`.

El objetivo es establecer:

* tablas financieras;
* columnas;
* enums;
* relaciones;
* constraints;
* índices;
* claves de idempotencia;
* modelo Prisma preliminar;
* reglas de precisión monetaria;
* reglas de integridad financiera;
* reglas multitenant;
* reglas de auditoría;
* seeds iniciales;
* compatibilidad con pagos y estados de cuenta futuros.

Este modelo será la primera base financiera de RESIDENT Core.

---

## 3. Principios del modelo

### 3.1. Tenant como frontera financiera

Todo registro financiero debe tener:

```text id="0fs7su"
tenant_id
```

Aplica a:

```text id="uo0c3c"
charge_concepts
fee_schedules
unit_fee_assignments
billing_periods
charge_batches
charges
charge_adjustments
charge_reversals
```

Regla:

```text id="6ylz60"
Nunca se debe consultar, generar, ajustar, cancelar o reversar un cargo sin validar tenant_id.
```

---

### 3.2. Cargo siempre asociado a unidad

Todo `Charge` debe estar asociado a una unidad habitacional:

```text id="j2gw0z"
property_unit_id
```

La unidad debe pertenecer al mismo tenant.

---

### 3.3. Precisión monetaria

Los montos se almacenan como Decimal.

Prohibido:

```text id="x35f01"
float
double
number para cálculos monetarios sin Decimal
```

Regla de persistencia recomendada:

```text id="mbggza"
DECIMAL(12,2)
```

Para porcentajes:

```text id="9i38z6"
DECIMAL(5,2)
```

---

### 3.4. No eliminación física

No se elimina físicamente:

* conceptos usados;
* schedules usados;
* asignaciones históricas;
* periodos;
* batches;
* cargos;
* ajustes;
* reversos.

Se usan:

```text id="thcbjv"
status
archived_at
cancelled_at
reversed_at
end_date
```

---

### 3.5. Monto original inmutable

Un cargo emitido conserva:

```text id="2qp7f2"
original_amount
```

Correcciones se registran mediante:

```text id="gfigts"
charge_adjustments
charge_reversals
charge status
```

---

### 3.6. Idempotencia obligatoria

La generación mensual debe evitar duplicados mediante:

```text id="qv25cx"
idempotency_key
```

Regla:

```text id="s3t92e"
Generar dos veces el mismo periodo, concepto y unidad no debe crear doble cargo.
```

---

### 3.7. Estado de cuenta reconstruible

Los saldos futuros deben poder reconstruirse desde:

```text id="7bn2en"
charges
charge_adjustments
charge_reversals
payments futuros
payment_allocations futuras
```

Este módulo no calcula estado de cuenta consolidado todavía, pero debe dejar datos consistentes para `006-account-statements`.

---

## 4. Entidades persistentes

El módulo define las siguientes entidades:

```text id="3kmm2l"
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

```text id="1qw3of"
Tenant
├── ChargeConcept
│   ├── FeeSchedule
│   └── Charge
│
├── BillingPeriod
│   ├── ChargeBatch
│   └── Charge
│
├── PropertyUnit
│   ├── UnitFeeAssignment
│   └── Charge
│
└── Charge
    ├── ChargeAdjustment
    └── ChargeReversal
```

---

## 5. Tabla `charge_concepts`

### 5.1. Propósito

Representa conceptos de cobro configurados por tenant.

Ejemplos:

```text id="xv5a8m"
Alícuota mensual
Fondo de reserva
Mantenimiento extraordinario
Cuota de seguridad
Arriendo de área comunal
```

---

### 5.2. Nombre físico

```text id="7bn9ag"
charge_concepts
```

---

### 5.3. Columnas

| Columna          |   Tipo lógico | Requerido |  Default | Descripción                 |
| ---------------- | ------------: | --------: | -------: | --------------------------- |
| `id`             |   UUID/string |        Sí |     uuid | Identificador interno       |
| `tenant_id`      |   UUID/string |        Sí |        — | Tenant propietario          |
| `code`           |        string |        Sí |        — | Código único por tenant     |
| `name`           |        string |        Sí |        — | Nombre visible              |
| `description`    |        string |        No |     null | Descripción                 |
| `category`       |          enum |        Sí | ordinary | Categoría                   |
| `default_amount` | Decimal(12,2) |        No |     null | Monto por defecto           |
| `currency`       |   enum/string |        Sí |      USD | Moneda                      |
| `status`         |          enum |        Sí |   active | Estado                      |
| `is_system`      |       boolean |        Sí |    false | Indica concepto del sistema |
| `created_at`     |     timestamp |        Sí |      now | Fecha de creación           |
| `updated_at`     |     timestamp |        Sí |     auto | Fecha de actualización      |
| `archived_at`    |     timestamp |        No |     null | Fecha de archivado          |

---

### 5.4. Reglas

* `tenant_id` obligatorio.
* `code` único por tenant.
* `name` obligatorio.
* `currency` debe ser `USD` en MVP.
* `default_amount` debe ser decimal positivo si existe.
* Solo `active` puede usarse para nuevos cargos.
* No eliminar físicamente si tiene cargos históricos.
* `is_system = true` requiere protección especial.

---

### 5.5. Índices

```text id="1jb7p6"
unique index charge_concepts_tenant_code_unique on charge_concepts(tenant_id, code)
index charge_concepts_tenant_id_idx on charge_concepts(tenant_id)
index charge_concepts_status_idx on charge_concepts(status)
index charge_concepts_category_idx on charge_concepts(category)
```

---

## 6. Tabla `fee_schedules`

### 6.1. Propósito

Representa configuraciones recurrentes de cobro.

Ejemplo:

```text id="nwiufo"
Alícuota mensual estándar — 50.00 USD — mensual
```

---

### 6.2. Nombre físico

```text id="sogcdm"
fee_schedules
```

---

### 6.3. Columnas

| Columna             |   Tipo lógico | Requerido | Default | Descripción             |
| ------------------- | ------------: | --------: | ------: | ----------------------- |
| `id`                |   UUID/string |        Sí |    uuid | Identificador           |
| `tenant_id`         |   UUID/string |        Sí |       — | Tenant                  |
| `charge_concept_id` |   UUID/string |        Sí |       — | Concepto asociado       |
| `name`              |        string |        Sí |       — | Nombre de configuración |
| `amount`            | Decimal(12,2) |        Sí |       — | Monto recurrente        |
| `currency`          |   enum/string |        Sí |     USD | Moneda                  |
| `frequency`         |          enum |        Sí | monthly | Frecuencia              |
| `effective_from`    |          date |        Sí |       — | Inicio de vigencia      |
| `effective_to`      |          date |        No |    null | Fin de vigencia         |
| `status`            |          enum |        Sí |  active | Estado                  |
| `created_at`        |     timestamp |        Sí |     now | Creación                |
| `updated_at`        |     timestamp |        Sí |    auto | Actualización           |
| `archived_at`       |     timestamp |        No |    null | Archivado               |

---

### 6.4. Reglas

* Pertenece a un tenant.
* `charge_concept_id` debe pertenecer al mismo tenant.
* Concepto debe estar activo al crear schedule.
* Monto debe ser positivo.
* Moneda `USD` en MVP.
* `effective_to >= effective_from` si existe.
* Cargos ya emitidos no se alteran al cambiar schedule.
* No eliminación física.

---

### 6.5. Índices

```text id="ggcx90"
index fee_schedules_tenant_id_idx on fee_schedules(tenant_id)
index fee_schedules_charge_concept_id_idx on fee_schedules(charge_concept_id)
index fee_schedules_status_idx on fee_schedules(status)
index fee_schedules_frequency_idx on fee_schedules(frequency)
index fee_schedules_tenant_concept_status_idx on fee_schedules(tenant_id, charge_concept_id, status)
```

---

## 7. Tabla `unit_fee_assignments`

### 7.1. Propósito

Asocia un `FeeSchedule` a una `PropertyUnit`.

Permite saber qué unidades generan cargos recurrentes.

---

### 7.2. Nombre físico

```text id="feencn"
unit_fee_assignments
```

---

### 7.3. Columnas

| Columna            | Tipo lógico | Requerido | Default | Descripción                     |
| ------------------ | ----------: | --------: | ------: | ------------------------------- |
| `id`               | UUID/string |        Sí |    uuid | Identificador                   |
| `tenant_id`        | UUID/string |        Sí |       — | Tenant                          |
| `property_unit_id` | UUID/string |        Sí |       — | Unidad habitacional             |
| `fee_schedule_id`  | UUID/string |        Sí |       — | Configuración de cobro          |
| `status`           |        enum |        Sí |  active | Estado                          |
| `start_date`       |        date |        Sí |       — | Inicio                          |
| `end_date`         |        date |        No |    null | Fin                             |
| `created_at`       |   timestamp |        Sí |     now | Creación                        |
| `updated_at`       |   timestamp |        Sí |    auto | Actualización                   |
| `ended_at`         |   timestamp |        No |    null | Fecha operativa de finalización |
| `ended_by`         | UUID/string |        No |    null | Usuario que finalizó            |
| `end_reason`       |      string |        No |    null | Motivo                          |

---

### 7.4. Reglas

* Pertenece a tenant.
* `property_unit_id` pertenece al mismo tenant.
* `fee_schedule_id` pertenece al mismo tenant.
* Unidad debe estar activa para nuevas asignaciones ordinarias.
* FeeSchedule debe estar activo.
* No duplicar asignaciones activas incompatibles.
* Se finaliza con `end_date`, `ended_at`, `ended_by`, `end_reason`.
* No eliminación física.

---

### 7.5. Índices

```text id="n020xb"
index unit_fee_assignments_tenant_id_idx on unit_fee_assignments(tenant_id)
index unit_fee_assignments_property_unit_id_idx on unit_fee_assignments(property_unit_id)
index unit_fee_assignments_fee_schedule_id_idx on unit_fee_assignments(fee_schedule_id)
index unit_fee_assignments_status_idx on unit_fee_assignments(status)
index unit_fee_assignments_generation_idx on unit_fee_assignments(tenant_id, fee_schedule_id, status)
index unit_fee_assignments_unit_status_idx on unit_fee_assignments(tenant_id, property_unit_id, status)
```

---

## 8. Tabla `billing_periods`

### 8.1. Propósito

Representa periodo financiero mensual del tenant.

Ejemplo:

```text id="3j9s88"
2026-07
```

---

### 8.2. Nombre físico

```text id="pejb47"
billing_periods
```

---

### 8.3. Columnas

| Columna       | Tipo lógico | Requerido | Default | Descripción                      |
| ------------- | ----------: | --------: | ------: | -------------------------------- |
| `id`          | UUID/string |        Sí |    uuid | Identificador                    |
| `tenant_id`   | UUID/string |        Sí |       — | Tenant                           |
| `period_code` |      string |        Sí |       — | Código `YYYY-MM`                 |
| `starts_at`   |        date |        Sí |       — | Inicio del periodo               |
| `ends_at`     |        date |        Sí |       — | Fin del periodo                  |
| `due_date`    |        date |        Sí |       — | Fecha de vencimiento por defecto |
| `status`      |        enum |        Sí |    open | Estado                           |
| `created_at`  |   timestamp |        Sí |     now | Creación                         |
| `updated_at`  |   timestamp |        Sí |    auto | Actualización                    |
| `closed_at`   |   timestamp |        No |    null | Fecha de cierre                  |
| `closed_by`   | UUID/string |        No |    null | Usuario que cerró                |
| `locked_at`   |   timestamp |        No |    null | Fecha de bloqueo                 |
| `locked_by`   | UUID/string |        No |    null | Usuario que bloqueó              |

---

### 8.4. Reglas

* Pertenece a tenant.
* `period_code` único por tenant.
* Formato `YYYY-MM`.
* `starts_at <= ends_at`.
* `due_date` debe ser fecha válida.
* Solo `open` permite generación ordinaria.
* `closed` bloquea nuevos cargos ordinarios.
* `locked` bloquea cambios ordinarios y ajustes salvo proceso especial.

---

### 8.5. Índices

```text id="4j6t18"
unique index billing_periods_tenant_period_code_unique on billing_periods(tenant_id, period_code)
index billing_periods_tenant_id_idx on billing_periods(tenant_id)
index billing_periods_status_idx on billing_periods(status)
index billing_periods_tenant_status_idx on billing_periods(tenant_id, status)
```

---

## 9. Tabla `charge_batches`

### 9.1. Propósito

Agrupa cargos generados en una operación masiva.

Ejemplo:

```text id="qzjkd8"
Generación de alícuotas de julio 2026
```

---

### 9.2. Nombre físico

```text id="xhcems"
charge_batches
```

---

### 9.3. Columnas

| Columna             | Tipo lógico | Requerido |           Default | Descripción                              |
| ------------------- | ----------: | --------: | ----------------: | ---------------------------------------- |
| `id`                | UUID/string |        Sí |              uuid | Identificador                            |
| `tenant_id`         | UUID/string |        Sí |                 — | Tenant                                   |
| `billing_period_id` | UUID/string |        Sí |                 — | Periodo                                  |
| `fee_schedule_id`   | UUID/string |        No |              null | Schedule específico                      |
| `type`              |        enum |        Sí | monthlyGeneration | Tipo de lote                             |
| `status`            |        enum |        Sí |             draft | Estado                                   |
| `requested_by`      | UUID/string |        Sí |                 — | Usuario que solicitó                     |
| `started_at`        |   timestamp |        No |              null | Inicio                                   |
| `completed_at`      |   timestamp |        No |              null | Fin                                      |
| `total_items`       |     integer |        Sí |                 0 | Total intentos                           |
| `success_items`     |     integer |        Sí |                 0 | Cargos creados o ya existentes aceptados |
| `failed_items`      |     integer |        Sí |                 0 | Errores                                  |
| `skipped_items`     |     integer |        Sí |                 0 | Omitidos                                 |
| `error_summary`     | JSON/string |        No |              null | Resumen controlado de errores            |
| `created_at`        |   timestamp |        Sí |               now | Creación                                 |
| `updated_at`        |   timestamp |        Sí |              auto | Actualización                            |

---

### 9.4. Reglas

* Pertenece a tenant.
* Periodo pertenece al mismo tenant.
* FeeSchedule, si existe, pertenece al mismo tenant.
* No eliminar físicamente.
* `error_summary` no debe guardar datos personales.
* Debe registrar totales.
* Debe quedar en `completed` o `completedWithErrors`.

---

### 9.5. Índices

```text id="ulbq1c"
index charge_batches_tenant_id_idx on charge_batches(tenant_id)
index charge_batches_billing_period_id_idx on charge_batches(billing_period_id)
index charge_batches_fee_schedule_id_idx on charge_batches(fee_schedule_id)
index charge_batches_status_idx on charge_batches(status)
index charge_batches_type_idx on charge_batches(type)
index charge_batches_requested_by_idx on charge_batches(requested_by)
```

---

## 10. Tabla `charges`

### 10.1. Propósito

Representa cargo financiero individual emitido contra una unidad.

---

### 10.2. Nombre físico

```text id="kz6q3v"
charges
```

---

### 10.3. Columnas

| Columna               |   Tipo lógico | Requerido |  Default | Descripción          |
| --------------------- | ------------: | --------: | -------: | -------------------- |
| `id`                  |   UUID/string |        Sí |     uuid | Identificador        |
| `tenant_id`           |   UUID/string |        Sí |        — | Tenant               |
| `billing_period_id`   |   UUID/string |        Sí |        — | Periodo              |
| `property_unit_id`    |   UUID/string |        Sí |        — | Unidad               |
| `charge_concept_id`   |   UUID/string |        Sí |        — | Concepto             |
| `charge_batch_id`     |   UUID/string |        No |     null | Batch de generación  |
| `type`                |          enum |        Sí | ordinary | Tipo de cargo        |
| `description`         |        string |        No |     null | Descripción          |
| `original_amount`     | Decimal(12,2) |        Sí |        — | Monto original       |
| `effective_amount`    | Decimal(12,2) |        Sí |        — | Monto efectivo       |
| `currency`            |   enum/string |        Sí |      USD | Moneda               |
| `issued_date`         |          date |        Sí |        — | Fecha de emisión     |
| `due_date`            |          date |        Sí |        — | Fecha de vencimiento |
| `status`              |          enum |        Sí |   issued | Estado               |
| `created_at`          |     timestamp |        Sí |      now | Creación             |
| `updated_at`          |     timestamp |        Sí |     auto | Actualización        |
| `cancelled_at`        |     timestamp |        No |     null | Fecha de anulación   |
| `cancelled_by`        |   UUID/string |        No |     null | Usuario que anuló    |
| `cancellation_reason` |        string |        No |     null | Motivo de anulación  |
| `idempotency_key`     |        string |        No |     null | Clave idempotente    |

---

### 10.4. Reglas

* Pertenece a tenant.
* Debe tener periodo.
* Debe tener unidad.
* Debe tener concepto.
* Unidad, periodo y concepto deben pertenecer al mismo tenant.
* `original_amount` obligatorio y decimal.
* `effective_amount` obligatorio y decimal.
* `original_amount` no se sobrescribe.
* `effective_amount` se recalcula por ajustes/reversos.
* `currency = USD` en MVP.
* `idempotency_key` único por tenant si existe.
* No eliminar físicamente.
* No usar monto negativo para cargo ordinario, extraordinario o manual.
* Cargos de tipo ajuste pueden modelarse con `ChargeAdjustment`, no como `Charge` ordinario en MVP.

---

### 10.5. Índices

```text id="rbonbf"
index charges_tenant_id_idx on charges(tenant_id)
index charges_billing_period_id_idx on charges(billing_period_id)
index charges_property_unit_id_idx on charges(property_unit_id)
index charges_charge_concept_id_idx on charges(charge_concept_id)
index charges_charge_batch_id_idx on charges(charge_batch_id)
index charges_status_idx on charges(status)
index charges_type_idx on charges(type)
index charges_due_date_idx on charges(due_date)
index charges_tenant_unit_period_idx on charges(tenant_id, property_unit_id, billing_period_id)
unique index charges_tenant_idempotency_key_unique on charges(tenant_id, idempotency_key)
```

---

### 10.6. Idempotency key recomendada

Para cargos ordinarios generados:

```text id="yd94ch"
tenantId:billingPeriodId:feeScheduleId:propertyUnitId:ordinary
```

Para cargo manual o extraordinario, puede usarse:

```text id="3o4g9g"
tenantId:requestId:propertyUnitId:chargeConceptId:manual
```

o dejar `idempotencyKey` nullable si no aplica.

MVP recomendado:

```text id="x5qlbs"
idempotency_key obligatorio para generación masiva;
nullable para cargos manuales;
opcionalmente soportar Idempotency-Key header en API.
```

---

## 11. Tabla `charge_adjustments`

### 11.1. Propósito

Registra ajustes sobre cargos sin modificar el monto original.

---

### 11.2. Nombre físico

```text id="tw7uxa"
charge_adjustments
```

---

### 11.3. Columnas

| Columna           |   Tipo lógico | Requerido |    Default | Descripción                |
| ----------------- | ------------: | --------: | ---------: | -------------------------- |
| `id`              |   UUID/string |        Sí |       uuid | Identificador              |
| `tenant_id`       |   UUID/string |        Sí |          — | Tenant                     |
| `charge_id`       |   UUID/string |        Sí |          — | Cargo                      |
| `type`            |          enum |        Sí | correction | Tipo de ajuste             |
| `amount`          | Decimal(12,2) |        Sí |          — | Monto del ajuste           |
| `reason`          |        string |        Sí |          — | Motivo                     |
| `created_by`      |   UUID/string |        Sí |          — | Usuario creador            |
| `created_at`      |     timestamp |        Sí |        now | Creación                   |
| `reversed_at`     |     timestamp |        No |       null | Reverso del ajuste         |
| `reversed_by`     |   UUID/string |        No |       null | Usuario que reversó ajuste |
| `reversal_reason` |        string |        No |       null | Motivo del reverso         |

---

### 11.4. Reglas

* Pertenece a tenant.
* Cargo pertenece al mismo tenant.
* `amount` positivo.
* `reason` obligatorio.
* No eliminar físicamente.
* Si se reversa, usar `reversed_at`, `reversed_by`, `reversal_reason`.
* Debe recalcular `Charge.effectiveAmount`.

---

### 11.5. Índices

```text id="0ejzpa"
index charge_adjustments_tenant_id_idx on charge_adjustments(tenant_id)
index charge_adjustments_charge_id_idx on charge_adjustments(charge_id)
index charge_adjustments_type_idx on charge_adjustments(type)
index charge_adjustments_created_by_idx on charge_adjustments(created_by)
```

---

## 12. Tabla `charge_reversals`

### 12.1. Propósito

Registra reverso formal de un cargo.

---

### 12.2. Nombre físico

```text id="2bgd4k"
charge_reversals
```

---

### 12.3. Columnas

| Columna       | Tipo lógico | Requerido | Default | Descripción     |
| ------------- | ----------: | --------: | ------: | --------------- |
| `id`          | UUID/string |        Sí |    uuid | Identificador   |
| `tenant_id`   | UUID/string |        Sí |       — | Tenant          |
| `charge_id`   | UUID/string |        Sí |       — | Cargo reversado |
| `reason`      |      string |        Sí |       — | Motivo          |
| `reversed_by` | UUID/string |        Sí |       — | Usuario         |
| `reversed_at` |   timestamp |        Sí |     now | Fecha reverso   |
| `created_at`  |   timestamp |        Sí |     now | Creación        |
| `trace_id`    |      string |        No |    null | Trace           |

---

### 12.4. Reglas

* Pertenece a tenant.
* Cargo pertenece al mismo tenant.
* Un cargo solo puede tener un reverso en MVP.
* `reason` obligatorio.
* No eliminar físicamente.
* Al reversar, `Charge.status = reversed`.
* El monto original se conserva.

---

### 12.5. Índices

```text id="3n6rgi"
index charge_reversals_tenant_id_idx on charge_reversals(tenant_id)
index charge_reversals_charge_id_idx on charge_reversals(charge_id)
index charge_reversals_reversed_by_idx on charge_reversals(reversed_by)
unique index charge_reversals_tenant_charge_unique on charge_reversals(tenant_id, charge_id)
```

---

## 13. Enums

## 13.1. `CurrencyCode`

```text id="zgjr4o"
USD
```

Prisma:

```prisma id="pqm3w2"
enum CurrencyCode {
  USD

  @@map("currency_code")
}
```

---

## 13.2. `ChargeConceptStatus`

```text id="b9432g"
active
inactive
archived
```

Prisma:

```prisma id="r6g3p6"
enum ChargeConceptStatus {
  ACTIVE   @map("active")
  INACTIVE @map("inactive")
  ARCHIVED @map("archived")

  @@map("charge_concept_status")
}
```

---

## 13.3. `ChargeConceptCategory`

```text id="3bqg78"
ordinary
extraordinary
service
fine
reservation
other
```

Prisma:

```prisma id="wio6vs"
enum ChargeConceptCategory {
  ORDINARY      @map("ordinary")
  EXTRAORDINARY @map("extraordinary")
  SERVICE       @map("service")
  FINE          @map("fine")
  RESERVATION   @map("reservation")
  OTHER         @map("other")

  @@map("charge_concept_category")
}
```

---

## 13.4. `FeeScheduleStatus`

```text id="02am0y"
active
inactive
archived
```

Prisma:

```prisma id="io6i0q"
enum FeeScheduleStatus {
  ACTIVE   @map("active")
  INACTIVE @map("inactive")
  ARCHIVED @map("archived")

  @@map("fee_schedule_status")
}
```

---

## 13.5. `FeeFrequency`

```text id="1zjfca"
monthly
quarterly
annual
oneTime
```

Prisma:

```prisma id="d5xis9"
enum FeeFrequency {
  MONTHLY   @map("monthly")
  QUARTERLY @map("quarterly")
  ANNUAL    @map("annual")
  ONE_TIME  @map("oneTime")

  @@map("fee_frequency")
}
```

---

## 13.6. `UnitFeeAssignmentStatus`

```text id="o89b6v"
active
ended
inactive
archived
```

Prisma:

```prisma id="2tgu7k"
enum UnitFeeAssignmentStatus {
  ACTIVE   @map("active")
  ENDED    @map("ended")
  INACTIVE @map("inactive")
  ARCHIVED @map("archived")

  @@map("unit_fee_assignment_status")
}
```

---

## 13.7. `BillingPeriodStatus`

```text id="eejc4c"
open
closed
locked
archived
```

Prisma:

```prisma id="sc41ie"
enum BillingPeriodStatus {
  OPEN     @map("open")
  CLOSED   @map("closed")
  LOCKED   @map("locked")
  ARCHIVED @map("archived")

  @@map("billing_period_status")
}
```

---

## 13.8. `ChargeBatchStatus`

```text id="4fk0l8"
draft
processing
completed
completedWithErrors
cancelled
reversed
```

Prisma:

```prisma id="l7vv9f"
enum ChargeBatchStatus {
  DRAFT                 @map("draft")
  PROCESSING            @map("processing")
  COMPLETED             @map("completed")
  COMPLETED_WITH_ERRORS @map("completedWithErrors")
  CANCELLED             @map("cancelled")
  REVERSED              @map("reversed")

  @@map("charge_batch_status")
}
```

---

## 13.9. `ChargeBatchType`

```text id="0vwqjt"
monthlyGeneration
extraordinaryGeneration
manualGeneration
other
```

Prisma:

```prisma id="w40oph"
enum ChargeBatchType {
  MONTHLY_GENERATION       @map("monthlyGeneration")
  EXTRAORDINARY_GENERATION @map("extraordinaryGeneration")
  MANUAL_GENERATION        @map("manualGeneration")
  OTHER                    @map("other")

  @@map("charge_batch_type")
}
```

---

## 13.10. `ChargeStatus`

```text id="4kmbk4"
draft
issued
partiallyPaid
paid
cancelled
reversed
disputed
archived
```

Prisma:

```prisma id="guvvrh"
enum ChargeStatus {
  DRAFT          @map("draft")
  ISSUED         @map("issued")
  PARTIALLY_PAID @map("partiallyPaid")
  PAID           @map("paid")
  CANCELLED      @map("cancelled")
  REVERSED       @map("reversed")
  DISPUTED       @map("disputed")
  ARCHIVED       @map("archived")

  @@map("charge_status")
}
```

---

## 13.11. `ChargeType`

```text id="daf7dp"
ordinary
extraordinary
manual
fine
reservation
adjustment
openingBalance
other
```

Prisma:

```prisma id="xgf37x"
enum ChargeType {
  ORDINARY        @map("ordinary")
  EXTRAORDINARY   @map("extraordinary")
  MANUAL          @map("manual")
  FINE            @map("fine")
  RESERVATION     @map("reservation")
  ADJUSTMENT      @map("adjustment")
  OPENING_BALANCE @map("openingBalance")
  OTHER           @map("other")

  @@map("charge_type")
}
```

---

## 13.12. `AdjustmentType`

```text id="c2oy94"
increase
decrease
correction
discount
surcharge
```

Prisma:

```prisma id="mk8v2w"
enum AdjustmentType {
  INCREASE   @map("increase")
  DECREASE   @map("decrease")
  CORRECTION @map("correction")
  DISCOUNT   @map("discount")
  SURCHARGE  @map("surcharge")

  @@map("adjustment_type")
}
```

---

## 14. Modelo Prisma completo propuesto

```prisma id="if1xsg"
enum CurrencyCode {
  USD

  @@map("currency_code")
}

enum ChargeConceptStatus {
  ACTIVE   @map("active")
  INACTIVE @map("inactive")
  ARCHIVED @map("archived")

  @@map("charge_concept_status")
}

enum ChargeConceptCategory {
  ORDINARY      @map("ordinary")
  EXTRAORDINARY @map("extraordinary")
  SERVICE       @map("service")
  FINE          @map("fine")
  RESERVATION   @map("reservation")
  OTHER         @map("other")

  @@map("charge_concept_category")
}

enum FeeScheduleStatus {
  ACTIVE   @map("active")
  INACTIVE @map("inactive")
  ARCHIVED @map("archived")

  @@map("fee_schedule_status")
}

enum FeeFrequency {
  MONTHLY   @map("monthly")
  QUARTERLY @map("quarterly")
  ANNUAL    @map("annual")
  ONE_TIME  @map("oneTime")

  @@map("fee_frequency")
}

enum UnitFeeAssignmentStatus {
  ACTIVE   @map("active")
  ENDED    @map("ended")
  INACTIVE @map("inactive")
  ARCHIVED @map("archived")

  @@map("unit_fee_assignment_status")
}

enum BillingPeriodStatus {
  OPEN     @map("open")
  CLOSED   @map("closed")
  LOCKED   @map("locked")
  ARCHIVED @map("archived")

  @@map("billing_period_status")
}

enum ChargeBatchStatus {
  DRAFT                 @map("draft")
  PROCESSING            @map("processing")
  COMPLETED             @map("completed")
  COMPLETED_WITH_ERRORS @map("completedWithErrors")
  CANCELLED             @map("cancelled")
  REVERSED              @map("reversed")

  @@map("charge_batch_status")
}

enum ChargeBatchType {
  MONTHLY_GENERATION       @map("monthlyGeneration")
  EXTRAORDINARY_GENERATION @map("extraordinaryGeneration")
  MANUAL_GENERATION        @map("manualGeneration")
  OTHER                    @map("other")

  @@map("charge_batch_type")
}

enum ChargeStatus {
  DRAFT          @map("draft")
  ISSUED         @map("issued")
  PARTIALLY_PAID @map("partiallyPaid")
  PAID           @map("paid")
  CANCELLED      @map("cancelled")
  REVERSED       @map("reversed")
  DISPUTED       @map("disputed")
  ARCHIVED       @map("archived")

  @@map("charge_status")
}

enum ChargeType {
  ORDINARY        @map("ordinary")
  EXTRAORDINARY   @map("extraordinary")
  MANUAL          @map("manual")
  FINE            @map("fine")
  RESERVATION     @map("reservation")
  ADJUSTMENT      @map("adjustment")
  OPENING_BALANCE @map("openingBalance")
  OTHER           @map("other")

  @@map("charge_type")
}

enum AdjustmentType {
  INCREASE   @map("increase")
  DECREASE   @map("decrease")
  CORRECTION @map("correction")
  DISCOUNT   @map("discount")
  SURCHARGE  @map("surcharge")

  @@map("adjustment_type")
}
```

```prisma id="f34z7h"
model ChargeConcept {
  id            String                @id @default(uuid())
  tenantId      String                @map("tenant_id")

  code          String
  name          String
  description   String?
  category      ChargeConceptCategory @default(ORDINARY)
  defaultAmount Decimal?              @map("default_amount") @db.Decimal(12, 2)
  currency      CurrencyCode          @default(USD)
  status        ChargeConceptStatus   @default(ACTIVE)
  isSystem      Boolean               @default(false) @map("is_system")

  createdAt     DateTime              @default(now()) @map("created_at")
  updatedAt     DateTime              @updatedAt @map("updated_at")
  archivedAt    DateTime?             @map("archived_at")

  tenant        Tenant                @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  feeSchedules  FeeSchedule[]
  charges       Charge[]

  @@unique([tenantId, code])
  @@index([tenantId])
  @@index([status])
  @@index([category])
  @@map("charge_concepts")
}
```

```prisma id="i4ey07"
model FeeSchedule {
  id              String            @id @default(uuid())
  tenantId        String            @map("tenant_id")
  chargeConceptId String            @map("charge_concept_id")

  name            String
  amount          Decimal           @db.Decimal(12, 2)
  currency        CurrencyCode      @default(USD)
  frequency       FeeFrequency      @default(MONTHLY)
  effectiveFrom   DateTime          @map("effective_from") @db.Date
  effectiveTo     DateTime?         @map("effective_to") @db.Date
  status          FeeScheduleStatus @default(ACTIVE)

  createdAt       DateTime          @default(now()) @map("created_at")
  updatedAt       DateTime          @updatedAt @map("updated_at")
  archivedAt      DateTime?         @map("archived_at")

  tenant          Tenant            @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  chargeConcept   ChargeConcept     @relation(fields: [chargeConceptId], references: [id], onDelete: Restrict)
  unitFees        UnitFeeAssignment[]
  chargeBatches   ChargeBatch[]

  @@index([tenantId])
  @@index([chargeConceptId])
  @@index([status])
  @@index([frequency])
  @@index([tenantId, chargeConceptId, status])
  @@map("fee_schedules")
}
```

```prisma id="qd0zx1"
model UnitFeeAssignment {
  id             String                  @id @default(uuid())
  tenantId       String                  @map("tenant_id")
  propertyUnitId String                  @map("property_unit_id")
  feeScheduleId  String                  @map("fee_schedule_id")

  status         UnitFeeAssignmentStatus @default(ACTIVE)
  startDate      DateTime                @map("start_date") @db.Date
  endDate        DateTime?               @map("end_date") @db.Date

  createdAt      DateTime                @default(now()) @map("created_at")
  updatedAt      DateTime                @updatedAt @map("updated_at")
  endedAt        DateTime?               @map("ended_at")
  endedBy        String?                 @map("ended_by")
  endReason      String?                 @map("end_reason")

  tenant         Tenant                  @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  propertyUnit   PropertyUnit            @relation(fields: [propertyUnitId], references: [id], onDelete: Restrict)
  feeSchedule    FeeSchedule             @relation(fields: [feeScheduleId], references: [id], onDelete: Restrict)
  endedByUser    UserProfile?            @relation("UnitFeeEndedBy", fields: [endedBy], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([propertyUnitId])
  @@index([feeScheduleId])
  @@index([status])
  @@index([tenantId, feeScheduleId, status])
  @@index([tenantId, propertyUnitId, status])
  @@map("unit_fee_assignments")
}
```

```prisma id="akffh3"
model BillingPeriod {
  id          String              @id @default(uuid())
  tenantId    String              @map("tenant_id")

  periodCode  String              @map("period_code")
  startsAt    DateTime            @map("starts_at") @db.Date
  endsAt      DateTime            @map("ends_at") @db.Date
  dueDate     DateTime            @map("due_date") @db.Date
  status      BillingPeriodStatus @default(OPEN)

  createdAt   DateTime            @default(now()) @map("created_at")
  updatedAt   DateTime            @updatedAt @map("updated_at")
  closedAt    DateTime?           @map("closed_at")
  closedBy    String?             @map("closed_by")
  lockedAt    DateTime?           @map("locked_at")
  lockedBy    String?             @map("locked_by")

  tenant      Tenant              @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  closedByUser UserProfile?       @relation("BillingPeriodClosedBy", fields: [closedBy], references: [id], onDelete: Restrict)
  lockedByUser UserProfile?       @relation("BillingPeriodLockedBy", fields: [lockedBy], references: [id], onDelete: Restrict)

  chargeBatches ChargeBatch[]
  charges       Charge[]

  @@unique([tenantId, periodCode])
  @@index([tenantId])
  @@index([status])
  @@index([tenantId, status])
  @@map("billing_periods")
}
```

```prisma id="atg0uu"
model ChargeBatch {
  id              String            @id @default(uuid())
  tenantId        String            @map("tenant_id")
  billingPeriodId String            @map("billing_period_id")
  feeScheduleId   String?           @map("fee_schedule_id")

  type            ChargeBatchType   @default(MONTHLY_GENERATION)
  status          ChargeBatchStatus @default(DRAFT)
  requestedBy     String            @map("requested_by")

  startedAt       DateTime?         @map("started_at")
  completedAt     DateTime?         @map("completed_at")

  totalItems      Int               @default(0) @map("total_items")
  successItems    Int               @default(0) @map("success_items")
  failedItems     Int               @default(0) @map("failed_items")
  skippedItems    Int               @default(0) @map("skipped_items")
  errorSummary    Json?             @map("error_summary")

  createdAt       DateTime          @default(now()) @map("created_at")
  updatedAt       DateTime          @updatedAt @map("updated_at")

  tenant          Tenant            @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  billingPeriod   BillingPeriod     @relation(fields: [billingPeriodId], references: [id], onDelete: Restrict)
  feeSchedule     FeeSchedule?      @relation(fields: [feeScheduleId], references: [id], onDelete: Restrict)
  requestedByUser UserProfile       @relation("ChargeBatchRequestedBy", fields: [requestedBy], references: [id], onDelete: Restrict)

  charges         Charge[]

  @@index([tenantId])
  @@index([billingPeriodId])
  @@index([feeScheduleId])
  @@index([status])
  @@index([type])
  @@index([requestedBy])
  @@map("charge_batches")
}
```

```prisma id="l8rgcz"
model Charge {
  id                 String        @id @default(uuid())
  tenantId           String        @map("tenant_id")
  billingPeriodId    String        @map("billing_period_id")
  propertyUnitId     String        @map("property_unit_id")
  chargeConceptId    String        @map("charge_concept_id")
  chargeBatchId      String?       @map("charge_batch_id")

  type               ChargeType    @default(ORDINARY)
  description        String?
  originalAmount     Decimal       @map("original_amount") @db.Decimal(12, 2)
  effectiveAmount    Decimal       @map("effective_amount") @db.Decimal(12, 2)
  currency           CurrencyCode  @default(USD)
  issuedDate         DateTime      @map("issued_date") @db.Date
  dueDate            DateTime      @map("due_date") @db.Date
  status             ChargeStatus  @default(ISSUED)

  createdAt          DateTime      @default(now()) @map("created_at")
  updatedAt          DateTime      @updatedAt @map("updated_at")

  cancelledAt        DateTime?     @map("cancelled_at")
  cancelledBy        String?       @map("cancelled_by")
  cancellationReason String?       @map("cancellation_reason")
  idempotencyKey     String?       @map("idempotency_key")

  tenant             Tenant        @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  billingPeriod      BillingPeriod @relation(fields: [billingPeriodId], references: [id], onDelete: Restrict)
  propertyUnit       PropertyUnit   @relation(fields: [propertyUnitId], references: [id], onDelete: Restrict)
  chargeConcept      ChargeConcept @relation(fields: [chargeConceptId], references: [id], onDelete: Restrict)
  chargeBatch        ChargeBatch?  @relation(fields: [chargeBatchId], references: [id], onDelete: Restrict)
  cancelledByUser    UserProfile?  @relation("ChargeCancelledBy", fields: [cancelledBy], references: [id], onDelete: Restrict)

  adjustments        ChargeAdjustment[]
  reversals          ChargeReversal[]

  @@unique([tenantId, idempotencyKey])
  @@index([tenantId])
  @@index([billingPeriodId])
  @@index([propertyUnitId])
  @@index([chargeConceptId])
  @@index([chargeBatchId])
  @@index([status])
  @@index([type])
  @@index([dueDate])
  @@index([tenantId, propertyUnitId, billingPeriodId])
  @@map("charges")
}
```

```prisma id="7dlxxh"
model ChargeAdjustment {
  id             String         @id @default(uuid())
  tenantId       String         @map("tenant_id")
  chargeId       String         @map("charge_id")

  type           AdjustmentType @default(CORRECTION)
  amount         Decimal        @db.Decimal(12, 2)
  reason         String
  createdBy      String         @map("created_by")
  createdAt      DateTime       @default(now()) @map("created_at")

  reversedAt     DateTime?      @map("reversed_at")
  reversedBy     String?        @map("reversed_by")
  reversalReason String?        @map("reversal_reason")

  tenant         Tenant         @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  charge         Charge         @relation(fields: [chargeId], references: [id], onDelete: Restrict)
  createdByUser  UserProfile    @relation("ChargeAdjustmentCreatedBy", fields: [createdBy], references: [id], onDelete: Restrict)
  reversedByUser UserProfile?   @relation("ChargeAdjustmentReversedBy", fields: [reversedBy], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([chargeId])
  @@index([type])
  @@index([createdBy])
  @@map("charge_adjustments")
}
```

```prisma id="3zmiue"
model ChargeReversal {
  id             String      @id @default(uuid())
  tenantId       String      @map("tenant_id")
  chargeId       String      @map("charge_id")

  reason         String
  reversedBy     String      @map("reversed_by")
  reversedAt     DateTime    @default(now()) @map("reversed_at")
  createdAt      DateTime    @default(now()) @map("created_at")
  traceId        String?     @map("trace_id")

  tenant         Tenant      @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  charge         Charge      @relation(fields: [chargeId], references: [id], onDelete: Restrict)
  reversedByUser UserProfile @relation("ChargeReversalReversedBy", fields: [reversedBy], references: [id], onDelete: Restrict)

  @@unique([tenantId, chargeId])
  @@index([tenantId])
  @@index([chargeId])
  @@index([reversedBy])
  @@map("charge_reversals")
}
```

---

## 15. Cambios requeridos en modelos existentes

### 15.1. Modelo `Tenant`

Agregar relaciones inversas:

```prisma id="gp1s8l"
model Tenant {
  // campos existentes...

  chargeConcepts     ChargeConcept[]
  feeSchedules       FeeSchedule[]
  unitFeeAssignments UnitFeeAssignment[]
  billingPeriods     BillingPeriod[]
  chargeBatches      ChargeBatch[]
  charges            Charge[]
  chargeAdjustments  ChargeAdjustment[]
  chargeReversals    ChargeReversal[]
}
```

---

### 15.2. Modelo `PropertyUnit`

Agregar relaciones inversas:

```prisma id="u3s5bj"
model PropertyUnit {
  // campos existentes...

  unitFeeAssignments UnitFeeAssignment[]
  charges            Charge[]
}
```

---

### 15.3. Modelo `UserProfile`

Agregar relaciones inversas para actoría financiera:

```prisma id="gfy38v"
model UserProfile {
  // campos existentes...

  endedUnitFeeAssignments UnitFeeAssignment[] @relation("UnitFeeEndedBy")
  closedBillingPeriods    BillingPeriod[]     @relation("BillingPeriodClosedBy")
  lockedBillingPeriods    BillingPeriod[]     @relation("BillingPeriodLockedBy")
  requestedChargeBatches  ChargeBatch[]       @relation("ChargeBatchRequestedBy")
  cancelledCharges        Charge[]            @relation("ChargeCancelledBy")
  createdChargeAdjustments ChargeAdjustment[]  @relation("ChargeAdjustmentCreatedBy")
  reversedChargeAdjustments ChargeAdjustment[] @relation("ChargeAdjustmentReversedBy")
  chargeReversals         ChargeReversal[]    @relation("ChargeReversalReversedBy")
}
```

---

## 16. Constraints recomendadas mediante SQL manual

### 16.1. Fechas de FeeSchedule válidas

```sql id="xu35i4"
ALTER TABLE fee_schedules
ADD CONSTRAINT fee_schedules_date_range_check
CHECK (
  effective_to IS NULL OR effective_to >= effective_from
);
```

---

### 16.2. Fechas de UnitFeeAssignment válidas

```sql id="bvh0dh"
ALTER TABLE unit_fee_assignments
ADD CONSTRAINT unit_fee_assignments_date_range_check
CHECK (
  end_date IS NULL OR end_date >= start_date
);
```

---

### 16.3. Fechas de BillingPeriod válidas

```sql id="g4pnx6"
ALTER TABLE billing_periods
ADD CONSTRAINT billing_periods_date_range_check
CHECK (
  ends_at >= starts_at
);
```

---

### 16.4. Monto positivo en FeeSchedule

```sql id="n0dagc"
ALTER TABLE fee_schedules
ADD CONSTRAINT fee_schedules_amount_positive_check
CHECK (amount > 0);
```

---

### 16.5. Monto original positivo en Charge

```sql id="ggf9vr"
ALTER TABLE charges
ADD CONSTRAINT charges_original_amount_non_negative_check
CHECK (original_amount >= 0);
```

---

### 16.6. Monto efectivo no negativo en Charge

```sql id="c1pg99"
ALTER TABLE charges
ADD CONSTRAINT charges_effective_amount_non_negative_check
CHECK (effective_amount >= 0);
```

---

### 16.7. Monto positivo en ChargeAdjustment

```sql id="i9s0yx"
ALTER TABLE charge_adjustments
ADD CONSTRAINT charge_adjustments_amount_positive_check
CHECK (amount > 0);
```

---

### 16.8. `idempotency_key` no vacío si existe

```sql id="e1aj4e"
ALTER TABLE charges
ADD CONSTRAINT charges_idempotency_key_not_empty_check
CHECK (
  idempotency_key IS NULL OR length(trim(idempotency_key)) > 0
);
```

---

### 16.9. Conteos de batch no negativos

```sql id="znn2c0"
ALTER TABLE charge_batches
ADD CONSTRAINT charge_batches_counts_non_negative_check
CHECK (
  total_items >= 0
  AND success_items >= 0
  AND failed_items >= 0
  AND skipped_items >= 0
);
```

---

### 16.10. Reverso único por cargo

Ya cubierto por:

```text id="tvb5sd"
unique(tenant_id, charge_id)
```

en `charge_reversals`.

---

## 17. Reglas que deben validarse en aplicación

Estas reglas no deben depender solo de la base de datos:

```text id="8xmzn9"
- chargeConcept.tenantId == tenantId
- feeSchedule.tenantId == tenantId
- feeSchedule.chargeConcept.tenantId == tenantId
- propertyUnit.tenantId == tenantId
- billingPeriod.tenantId == tenantId
- charge.tenantId == tenantId
- charge.propertyUnit.tenantId == tenantId
- charge.chargeConcept.tenantId == tenantId
- charge.billingPeriod.tenantId == tenantId
- adjustment.charge.tenantId == tenantId
- reversal.charge.tenantId == tenantId
- solo periodo open permite generación ordinaria
- solo tenant active permite generación ordinaria
- solo propertyUnit active genera ordinarios
- solo chargeConcept active permite nuevos cargos
- solo feeSchedule active permite generación
- originalAmount no se sobrescribe
- charge cancelled/reversed no se ajusta ordinariamente
- no se generan cargos duplicados
- own charges requiere unidades propias
```

---

## 18. Cálculo de monto efectivo

### 18.1. Regla base

Al crear un cargo:

```text id="gqkb5d"
effectiveAmount = originalAmount
```

---

### 18.2. Ajustes

Para ajustes:

```text id="6eeu4g"
increase   suma
surcharge  suma
decrease   resta
discount   resta
correction puede sumar o restar según política
```

Para MVP, se recomienda modelar `correction` como:

```text id="ib1wyc"
amount positivo + direction explícita
```

Si no se agrega `direction`, usar tipos específicos `increase/decrease/discount/surcharge` y reservar `correction`.

---

### 18.3. Reverso

Cuando un cargo se reversa:

```text id="53wd60"
status = reversed
effectiveAmount = 0.00
```

El `originalAmount` se conserva.

---

### 18.4. Cancelación

Cuando un cargo se cancela:

```text id="9lvdjs"
status = cancelled
effectiveAmount = 0.00
cancelledAt = now
cancelledBy = actor
cancellationReason = reason
```

El `originalAmount` se conserva.

---

## 19. Reglas de idempotencia

### 19.1. Generación ordinaria mensual

Clave recomendada:

```text id="zy0h2c"
tenantId:billingPeriodId:feeScheduleId:propertyUnitId:ordinary
```

Ejemplo:

```text id="1gab44"
tenant_001:period_2026_07:schedule_monthly_dues:unit_casa_01:ordinary
```

---

### 19.2. Constraint

```text id="dijslk"
unique(tenant_id, idempotency_key)
```

---

### 19.3. Política ante duplicado

Si ya existe cargo con la misma idempotency key:

* no crear cargo nuevo;
* contabilizar como skipped o success idempotente según política de batch;
* devolver información controlada;
* no lanzar error fatal si la operación es reintento.

MVP recomendado:

```text id="1fv90p"
duplicado idempotente = skippedItems + 1
```

---

### 19.4. Cargos manuales

Para cargos manuales:

* `idempotency_key` puede ser null;
* se puede soportar header `Idempotency-Key` en API;
* si se recibe header, persistirlo con prefijo tenant.

---

## 20. Reglas de acceso `.own`

### 20.1. Resolver unidades propias

Para endpoints:

```text id="17ljlp"
GET /api/v1/me/charges
GET /api/v1/me/property-units/{propertyUnitId}/charges
```

El sistema debe usar `OwnResourceReaderPort`:

```text id="j4f26f"
getOwnPropertyUnitIds(tenantId, userProfileId)
```

---

### 20.2. Filtro obligatorio

Toda consulta propia debe filtrar por:

```text id="tc705f"
tenantId
propertyUnitId IN ownPropertyUnitIds
```

---

### 20.3. Usuario sin unidad propia

Si el usuario no tiene unidades propias:

```text id="8zsv13"
data = []
```

Si el usuario no tiene Person vinculada, puede devolver:

```text id="37a9r8"
403 OWN_PERSON_NOT_LINKED
```

según política compartida con `003-residents-properties`.

---

### 20.4. Unidad ajena

Para unidad ajena:

```text id="verc0p"
404 NOT_FOUND
```

recomendado para no revelar existencia.

---

## 21. Seeds iniciales

### 21.1. Tenants demo requeridos

Reusar:

```text id="a7vtjh"
villa-club-demo
altos-del-norte-demo
jardines-del-valle-demo
portal-del-rio-demo
```

---

### 21.2. Conceptos demo

Para `villa-club-demo`:

```text id="slvzwa"
monthly-dues
reserve-fund
extraordinary-maintenance
manual-adjustment
```

---

### 21.3. FeeSchedule demo

```text id="f6s2cl"
Monthly dues standard — 50.00 USD — monthly
Reserve fund standard — 10.00 USD — monthly
```

---

### 21.4. BillingPeriod demo

```text id="5rl35d"
2026-07
2026-08
```

---

### 21.5. UnitFeeAssignment demo

Asignar alícuota mensual a:

```text id="381y9o"
Casa 01
Casa 02
Casa 03
```

---

### 21.6. Charges demo

Opcional para desarrollo:

```text id="v9wrqf"
Charge Casa 01 / monthly-dues / 2026-07 / 50.00 USD
Charge Casa 02 / monthly-dues / 2026-07 / 50.00 USD
```

---

## 22. Datos prohibidos en seeds

No usar:

```text id="9p53cm"
montos reales de clientes
nombres reales de conjuntos no demo
unidades reales fuera de fixtures
cargos reales
datos bancarios
pagos reales
comprobantes reales
datos personales reales
```

---

## 23. Consultas esperadas

### 23.1. Listar conceptos

```text id="yh0r88"
listChargeConcepts(tenantId, query)
```

Filtros:

```text id="1gnc1y"
status
category
search
```

---

### 23.2. Listar schedules

```text id="2dzorr"
listFeeSchedules(tenantId, query)
```

Filtros:

```text id="w51unq"
status
chargeConceptId
frequency
```

---

### 23.3. Listar asignaciones por unidad

```text id="2abjwx"
listUnitFeeAssignments(tenantId, propertyUnitId)
```

---

### 23.4. Listar periodos

```text id="jgp6pb"
listBillingPeriods(tenantId, query)
```

Filtros:

```text id="rkooqd"
status
from
to
```

---

### 23.5. Listar cargos

```text id="h9kemo"
listCharges(tenantId, query)
```

Filtros:

```text id="850i2r"
billingPeriodId
propertyUnitId
chargeConceptId
status
type
dueDateFrom
dueDateTo
```

---

### 23.6. Listar cargos propios

```text id="h1f2ws"
listOwnCharges(tenantId, ownPropertyUnitIds, query)
```

---

## 24. Paginación

Todos los listados deben soportar:

```text id="a6cpof"
page
pageSize
```

Valores:

```text id="ycz3yt"
page = 1
pageSize = 20
max pageSize = 100
```

Aplica a:

```text id="zz9qrx"
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

## 25. Filtros mínimos

### 25.1. ChargeConcepts

```text id="zjjj63"
status
category
search
```

`search` busca en:

```text id="bkos8h"
code
name
description
```

---

### 25.2. FeeSchedules

```text id="pusdn2"
status
chargeConceptId
frequency
effectiveDate
```

---

### 25.3. UnitFeeAssignments

```text id="y4fi7m"
propertyUnitId
feeScheduleId
status
```

---

### 25.4. BillingPeriods

```text id="l9lxxx"
status
periodCode
from
to
```

---

### 25.5. ChargeBatches

```text id="7ppz5g"
billingPeriodId
feeScheduleId
type
status
requestedBy
```

---

### 25.6. Charges

```text id="wkpt59"
billingPeriodId
propertyUnitId
chargeConceptId
chargeBatchId
status
type
dueDateFrom
dueDateTo
```

---

## 26. Ordenamiento

Campos permitidos:

```text id="k5a4kc"
createdAt
updatedAt
periodCode
dueDate
issuedDate
status
amount
code
name
```

No permitir ordenamiento por campos arbitrarios.

---

## 27. Performance esperada

Índices críticos:

```text id="niq20i"
charge_concepts(tenant_id, code)
fee_schedules(tenant_id, charge_concept_id, status)
unit_fee_assignments(tenant_id, property_unit_id, status)
unit_fee_assignments(tenant_id, fee_schedule_id, status)
billing_periods(tenant_id, period_code)
charge_batches(tenant_id, billing_period_id, status)
charges(tenant_id, property_unit_id, billing_period_id)
charges(tenant_id, idempotency_key)
charges(billing_period_id)
charges(property_unit_id)
charges(status)
charge_adjustments(charge_id)
charge_reversals(charge_id)
```

No se requiere particionamiento en MVP.

---

## 28. Seguridad de datos

### 28.1. Cross-tenant financiero

Mitigación:

* `tenant_id` obligatorio;
* consultas por tenant;
* validación de unidad;
* validación de concepto;
* validación de periodo;
* tests multitenant.

---

### 28.2. Duplicidad de cargos

Mitigación:

* `idempotency_key`;
* unique constraint;
* generación idempotente;
* tests de concurrencia.

---

### 28.3. Alteración de monto original

Mitigación:

* `original_amount` inmutable a nivel de aplicación;
* correcciones como ajustes/reversos;
* auditoría.

---

### 28.4. Eliminación física

Mitigación:

* no exponer DELETE;
* `onDelete: Restrict`;
* status;
* auditoría.

---

## 29. Migración inicial

### 29.1. Nombre sugerido

```text id="m34kh4"
004_create_dues_fees
```

---

### 29.2. Orden de creación

```text id="wzxj09"
1. Enums
2. charge_concepts
3. fee_schedules
4. unit_fee_assignments
5. billing_periods
6. charge_batches
7. charges
8. charge_adjustments
9. charge_reversals
10. indexes
11. constraints
12. SQL manual constraints si aplica
```

---

### 29.3. Revisión manual

Antes de aplicar en staging o producción:

```text id="cnvd1j"
- verificar tenant_id obligatorio;
- verificar Decimal en montos;
- verificar unique tenant+code;
- verificar unique tenant+period_code;
- verificar unique tenant+idempotency_key;
- verificar no cascade delete peligroso;
- verificar onDelete Restrict;
- verificar constraints de fecha;
- verificar constraints de montos;
- verificar seeds ficticios;
- verificar que no se creen pagos ni saldos todavía.
```

---

## 30. Tests de modelo requeridos

### 30.1. Unitarios

* Money.
* ChargeConceptCode.
* BillingPeriodCode.
* DueDate.
* ChargeStatus.
* ChargeType.
* FeeFrequency.
* IdempotencyKey.
* Charge entity.
* FeeSchedule entity.
* BillingPeriod entity.
* ChargeAdjustment entity.
* ChargeReversal entity.

---

### 30.2. Integración

* Crear concepto.
* Código único por tenant.
* Crear FeeSchedule.
* Crear UnitFeeAssignment.
* Crear BillingPeriod.
* PeriodCode único por tenant.
* Crear Charge.
* IdempotencyKey único.
* Crear Adjustment.
* Crear Reversal.
* Reversal único por cargo.
* `onDelete: Restrict`.

---

### 30.3. Multitenant

* ChargeConcept Tenant A no usado en Tenant B.
* PropertyUnit Tenant A no usada en Charge Tenant B.
* BillingPeriod Tenant A no usado en Tenant B.
* Charge Tenant A no visible para Tenant B.
* Own charges no mezclan tenants.

---

### 30.4. Financial regression

* Generación idempotente.
* Monto original no cambia.
* Ajuste cambia effectiveAmount.
* Cancelación deja effectiveAmount en 0.
* Reverso deja effectiveAmount en 0.
* Periodo cerrado bloquea generación.
* Decimal exacto.

---

## 31. Compatibilidad con módulos futuros

Este modelo habilita:

```text id="n0j8ep"
005-payments
006-account-statements
007-audit
008-wordpress-integration
009-notifications
010-reservations
011-fines
```

Uso futuro:

| Módulo futuro      | Entidades usadas                                                   |
| ------------------ | ------------------------------------------------------------------ |
| Payments           | `Charge`, `PropertyUnit`, `ChargeAdjustment`, `ChargeReversal`     |
| Account Statements | `Charge`, `BillingPeriod`, `PropertyUnit`, ajustes y pagos futuros |
| Audit              | eventos financieros                                                |
| Notifications      | cargos vencidos y recordatorios                                    |
| Reservations       | cargos tipo reservation                                            |
| Fines              | cargos tipo fine                                                   |

---

## 32. Campos diferidos

No incluir todavía:

```text id="dc6ua4"
taxInvoiceNumber
electronicInvoiceAccessKey
accountingEntryId
bankReference
paymentStatus calculado definitivo
lateFeeRuleId
interestRate
compoundInterest
approvalWorkflowId
approvedBy
approvedAt
documentFileId
externalAccountingSystemId
taxBreakdown
withholdingData
```

Razón:

* pertenecen a módulos futuros;
* requieren reglas tributarias;
* requieren pagos o estados de cuenta;
* aumentan complejidad del MVP.

---

## 33. Uso de JSONB

Evitar JSONB para datos financieros críticos.

No usar JSONB para:

```text id="5c7kn3"
amounts
charges
periods
propertyUnit references
chargeConcept references
status
payment allocation futura
```

Uso permitido limitado:

```text id="de6hdz"
charge_batches.error_summary
```

Regla:

```text id="m3epl4"
error_summary no debe contener datos personales, tokens ni payload completo.
```

---

## 34. Reglas de retención

* Conceptos archivados se conservan.
* Schedules archivados se conservan.
* Assignments finalizados se conservan.
* Periodos cerrados se conservan.
* Batches se conservan.
* Cargos se conservan.
* Ajustes se conservan.
* Reversos se conservan.
* Auditoría financiera se conserva según `007-audit`.

---

## 35. Checklist de migración

Antes de aceptar la migración:

```text id="mfunzf"
[ ] Enums creados.
[ ] Tabla charge_concepts creada.
[ ] Tabla fee_schedules creada.
[ ] Tabla unit_fee_assignments creada.
[ ] Tabla billing_periods creada.
[ ] Tabla charge_batches creada.
[ ] Tabla charges creada.
[ ] Tabla charge_adjustments creada.
[ ] Tabla charge_reversals creada.
[ ] tenant_id obligatorio en todas las tablas.
[ ] Decimal aplicado en montos.
[ ] currency definido.
[ ] unique tenant+chargeConcept.code.
[ ] unique tenant+billingPeriod.periodCode.
[ ] unique tenant+charges.idempotencyKey.
[ ] unique tenant+chargeReversal.chargeId.
[ ] índices por tenant creados.
[ ] onDelete Restrict aplicado.
[ ] no cascade delete peligroso.
[ ] constraints de fechas revisadas.
[ ] constraints de montos revisadas.
[ ] seeds no contienen datos reales.
[ ] migración aplicada en local.
[ ] Prisma Client generado.
```

---

## 36. Decisión final del modelo

El módulo `004-dues-fees` usará ocho tablas principales:

```text id="qrb5ai"
charge_concepts
fee_schedules
unit_fee_assignments
billing_periods
charge_batches
charges
charge_adjustments
charge_reversals
```

El modelo se basa en:

```text id="t0whhv"
tenant_id obligatorio
cargos asociados a property_unit_id
montos Decimal
moneda USD en MVP
idempotency_key para generación
original_amount inmutable
effective_amount calculado/controlado
no eliminación física
ajustes y reversos auditables
periodos financieros controlados
batches de generación trazables
```

Este modelo habilita generación segura de alícuotas y cargos, y prepara RESIDENT Core para pagos, estados de cuenta, mora, notificaciones financieras y reportes.
