# Data Model — Spec 006 Account Statements, Balances and Financial Position by Property Unit

## 1. Información del documento

| Campo                  | Valor                                                                                         |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| Proyecto               | RESIDENT Core                                                                                 |
| Spec ID                | 006                                                                                           |
| Módulo                 | Account Statements                                                                            |
| Documento              | Data Model                                                                                    |
| Ruta                   | `docs/specs/006-account-statements/data-model.md`                                             |
| Versión                | 0.1                                                                                           |
| Estado                 | needs-review                                                                                  |
| Fecha                  | 2026-07-14                                                                                    |
| Documento base         | `docs/specs/006-account-statements/spec.md`                                                   |
| Plan técnico           | `docs/specs/006-account-statements/plan.md`                                                   |
| Depende de             | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments` |
| Base de datos          | PostgreSQL                                                                                    |
| ORM                    | Prisma                                                                                        |
| Estrategia multitenant | Shared database + shared schema + `tenant_id`                                                 |
| Precisión monetaria    | Decimal                                                                                       |
| Moneda MVP             | USD                                                                                           |

---

## 2. Propósito

Este documento define el modelo de datos de la spec `006-account-statements`.

El objetivo es establecer:

* tablas;
* columnas;
* enums;
* relaciones;
* constraints;
* índices;
* modelo Prisma preliminar;
* reglas de cálculo de saldos;
* reglas de reconstrucción financiera;
* reglas de snapshots;
* reglas de statements materializados;
* reglas de líneas de estado de cuenta;
* reglas multitenant;
* reglas de acceso propio;
* reglas de auditoría;
* seeds iniciales;
* compatibilidad futura con mora, cobranza, reportes y conciliación bancaria.

Este módulo consolida información generada por:

```text id="uwaxgm"
004-dues-fees
005-payments
```

y permite exponer saldos y estados de cuenta a administración, propietarios y residentes autorizados.

---

## 3. Principios del modelo

### 3.1. Estado de cuenta como vista reconstruible

El estado de cuenta no es fuente primaria de verdad.

La fuente primaria son los movimientos financieros base:

```text id="jwkjkg"
charges
charge_adjustments
charge_reversals
payments
payment_allocations
payment_reversals
```

Regla:

```text id="d93gce"
Todo saldo mostrado en AccountStatement debe poder justificarse desde movimientos base auditables.
```

---

### 3.2. Tenant como frontera financiera

Toda tabla del módulo debe tener:

```text id="pbqfxc"
tenant_id
```

Aplica a:

```text id="i51oxm"
account_statements
account_statement_lines
unit_balances
balance_snapshots
```

Regla:

```text id="gdbsyx"
Nunca se debe crear, consultar, publicar, cerrar, regenerar, exportar o recalcular un estado de cuenta sin validar tenant_id.
```

---

### 3.3. Unidad habitacional como eje financiero

Todo estado de cuenta y balance debe asociarse a:

```text id="yo8bmt"
property_unit_id
```

La unidad debe pertenecer al mismo tenant.

---

### 3.4. Periodo financiero requerido

Todo `AccountStatement` de periodo debe asociarse a un `BillingPeriod` de `004-dues-fees`.

```text id="m9krg4"
billing_period_id
```

---

### 3.5. Precisión monetaria

Todos los montos deben usar Decimal.

Prohibido:

```text id="pou3ss"
float
double
number para cálculos monetarios sin Decimal
```

Tipo recomendado:

```text id="l52qsa"
DECIMAL(12,2)
```

---

### 3.6. Líneas con referencia a fuente

Toda línea originada en un movimiento financiero debe tener:

```text id="u5uijq"
source_type
source_id
```

Ejemplos:

```text id="m53kqs"
source_type = charge
source_id = charge_uuid

source_type = paymentAllocation
source_id = payment_allocation_uuid
```

---

### 3.7. No eliminación física

No se elimina físicamente:

* statement publicado;
* statement cerrado;
* statement bloqueado;
* snapshot;
* línea de statement publicada.

Correcciones se hacen mediante:

```text id="idkt8z"
regeneración
superseded statement
nuevo snapshot
auditoría
```

---

### 3.8. Snapshot como evidencia, no como contabilidad

`BalanceSnapshot` puede conservar el resultado de un cálculo, pero no reemplaza los movimientos base.

Regla:

```text id="xl7ebc"
Si un snapshot contradice los movimientos base, se debe regenerar o superseder; no modificar movimientos para que coincidan con el snapshot.
```

---

## 4. Entidades persistentes

El módulo define las siguientes entidades:

```text id="gyhm4d"
AccountStatement
AccountStatementLine
UnitBalance
BalanceSnapshot
```

Relación conceptual:

```text id="xu7dbq"
Tenant
├── PropertyUnit
│   ├── AccountStatement
│   │   └── AccountStatementLine
│   ├── UnitBalance
│   └── BalanceSnapshot
```

Relación con módulos fuente:

```text id="rn64h1"
AccountStatementLine.sourceId → Charge
AccountStatementLine.sourceId → ChargeAdjustment
AccountStatementLine.sourceId → ChargeReversal
AccountStatementLine.sourceId → PaymentAllocation
AccountStatementLine.sourceId → PaymentReversal
```

Nota:

```text id="cijak7"
sourceId es una referencia polimórfica lógica. Prisma no puede forzar FK polimórfica nativa; la integridad debe validarse en aplicación y pruebas.
```

---

## 5. Tabla `account_statements`

### 5.1. Propósito

Representa un estado de cuenta generado para una unidad habitacional y un periodo financiero.

Puede estar:

* generado;
* publicado;
* cerrado;
* bloqueado;
* reemplazado por regeneración;
* archivado.

---

### 5.2. Nombre físico

```text id="ohso02"
account_statements
```

---

### 5.3. Columnas

| Columna                 |   Tipo lógico | Requerido |   Default | Descripción                              |
| ----------------------- | ------------: | --------: | --------: | ---------------------------------------- |
| `id`                    |   UUID/string |        Sí |      uuid | Identificador interno                    |
| `tenant_id`             |   UUID/string |        Sí |         — | Tenant propietario                       |
| `property_unit_id`      |   UUID/string |        Sí |         — | Unidad habitacional                      |
| `billing_period_id`     |   UUID/string |        Sí |         — | Periodo financiero                       |
| `statement_number`      |        string |        Sí |         — | Número único del estado                  |
| `status`                |          enum |        Sí | generated | Estado                                   |
| `currency`              |   enum/string |        Sí |       USD | Moneda                                   |
| `opening_balance`       | Decimal(12,2) |        Sí |      0.00 | Saldo inicial                            |
| `charges_total`         | Decimal(12,2) |        Sí |      0.00 | Total cargos                             |
| `adjustments_total`     | Decimal(12,2) |        Sí |      0.00 | Total neto ajustes                       |
| `payments_total`        | Decimal(12,2) |        Sí |      0.00 | Total pagos aplicados                    |
| `reversals_total`       | Decimal(12,2) |        Sí |      0.00 | Total neto reversos                      |
| `credit_balance`        | Decimal(12,2) |        Sí |      0.00 | Saldo a favor                            |
| `closing_balance`       | Decimal(12,2) |        Sí |      0.00 | Saldo final                              |
| `overdue_balance`       | Decimal(12,2) |        Sí |      0.00 | Saldo vencido                            |
| `not_due_balance`       | Decimal(12,2) |        Sí |      0.00 | Saldo no vencido                         |
| `line_count`            |       integer |        Sí |         0 | Cantidad de líneas                       |
| `source_hash`           |        string |        No |      null | Hash opcional de movimientos fuente      |
| `generated_at`          |     timestamp |        Sí |       now | Fecha de generación                      |
| `generated_by`          |   UUID/string |        Sí |         — | Usuario que generó                       |
| `published_at`          |     timestamp |        No |      null | Fecha de publicación                     |
| `published_by`          |   UUID/string |        No |      null | Usuario que publicó                      |
| `closed_at`             |     timestamp |        No |      null | Fecha de cierre                          |
| `closed_by`             |   UUID/string |        No |      null | Usuario que cerró                        |
| `close_reason`          |        string |        No |      null | Motivo de cierre                         |
| `locked_at`             |     timestamp |        No |      null | Fecha de bloqueo                         |
| `locked_by`             |   UUID/string |        No |      null | Usuario que bloqueó                      |
| `lock_reason`           |        string |        No |      null | Motivo de bloqueo                        |
| `superseded_by`         |   UUID/string |        No |      null | Statement que reemplazó a este           |
| `previous_statement_id` |   UUID/string |        No |      null | Statement anterior si este es regenerado |
| `regeneration_reason`   |        string |        No |      null | Motivo de regeneración                   |
| `created_at`            |     timestamp |        Sí |       now | Fecha de creación                        |
| `updated_at`            |     timestamp |        Sí |      auto | Fecha de actualización                   |
| `archived_at`           |     timestamp |        No |      null | Archivado lógico                         |

---

### 5.4. Reglas

* `tenant_id` obligatorio.
* `property_unit_id` obligatorio.
* `billing_period_id` obligatorio.
* La unidad debe pertenecer al tenant.
* El periodo debe pertenecer al tenant.
* `statement_number` debe ser único por tenant.
* Todos los montos usan Decimal.
* `currency = USD` en MVP.
* `closing_balance` debe poder justificarse desde líneas.
* `source_hash` permite detectar si movimientos fuente cambiaron.
* Un statement `published`, `closed` o `locked` no se elimina físicamente.
* Un statement regenerado debe dejar al anterior como `superseded`.
* Una regeneración requiere motivo.
* Un cierre requiere motivo.
* Un bloqueo requiere motivo.

---

### 5.5. Índices

```text id="kkqt9p"
index account_statements_tenant_id_idx on account_statements(tenant_id)
index account_statements_property_unit_id_idx on account_statements(property_unit_id)
index account_statements_billing_period_id_idx on account_statements(billing_period_id)
index account_statements_status_idx on account_statements(status)
index account_statements_generated_by_idx on account_statements(generated_by)
index account_statements_published_by_idx on account_statements(published_by)
index account_statements_closed_by_idx on account_statements(closed_by)
index account_statements_locked_by_idx on account_statements(locked_by)
index account_statements_tenant_unit_period_idx on account_statements(tenant_id, property_unit_id, billing_period_id)
unique account_statements_tenant_statement_number_unique on account_statements(tenant_id, statement_number)
```

---

### 5.6. Unicidad lógica activa

MVP recomendado:

```text id="glgxaz"
Solo debe existir un statement activo por tenant, unidad y periodo.
```

Estados activos:

```text id="ntm7xj"
generated
published
closed
locked
```

Estados no activos:

```text id="ks4357"
superseded
archived
```

Implementación recomendada en PostgreSQL:

```sql id="ol1h4k"
CREATE UNIQUE INDEX account_statements_active_unit_period_unique
ON account_statements (tenant_id, property_unit_id, billing_period_id)
WHERE status IN ('generated', 'published', 'closed', 'locked');
```

---

## 6. Tabla `account_statement_lines`

### 6.1. Propósito

Representa las líneas que explican la composición del estado de cuenta.

Cada línea puede representar:

* saldo inicial;
* cargo;
* ajuste;
* reverso;
* pago aplicado;
* reverso de pago;
* saldo a favor;
* saldo final;
* nota.

---

### 6.2. Nombre físico

```text id="pk0ofi"
account_statement_lines
```

---

### 6.3. Columnas

| Columna                  |    Tipo lógico | Requerido | Default | Descripción                 |
| ------------------------ | -------------: | --------: | ------: | --------------------------- |
| `id`                     |    UUID/string |        Sí |    uuid | Identificador               |
| `tenant_id`              |    UUID/string |        Sí |       — | Tenant                      |
| `account_statement_id`   |    UUID/string |        Sí |       — | Statement                   |
| `property_unit_id`       |    UUID/string |        Sí |       — | Unidad                      |
| `billing_period_id`      |    UUID/string |        Sí |       — | Periodo                     |
| `line_type`              |           enum |        Sí |       — | Tipo de línea               |
| `source_type`            |    enum/string |        No |    null | Tipo de fuente              |
| `source_id`              |    UUID/string |        No |    null | ID fuente                   |
| `description`            |         string |        Sí |       — | Descripción visible         |
| `line_date`              | timestamp/date |        Sí |       — | Fecha del movimiento        |
| `due_date`               | timestamp/date |        No |    null | Vencimiento si aplica       |
| `debit_amount`           |  Decimal(12,2) |        Sí |    0.00 | Aumenta saldo               |
| `credit_amount`          |  Decimal(12,2) |        Sí |    0.00 | Disminuye saldo             |
| `balance_after_line`     |  Decimal(12,2) |        Sí |    0.00 | Saldo luego de la línea     |
| `currency`               |    enum/string |        Sí |     USD | Moneda                      |
| `sort_order`             |        integer |        Sí |       — | Orden dentro del statement  |
| `is_visible_to_resident` |        boolean |        Sí |    true | Visibilidad en vista propia |
| `created_at`             |      timestamp |        Sí |     now | Creación                    |
| `archived_at`            |      timestamp |        No |    null | Archivado lógico            |

---

### 6.4. Reglas

* `tenant_id` obligatorio.
* `account_statement_id` obligatorio.
* `property_unit_id` obligatorio.
* `billing_period_id` obligatorio.
* La línea debe pertenecer al mismo tenant que el statement.
* La línea debe pertenecer a la misma unidad que el statement.
* La línea debe pertenecer al mismo periodo que el statement.
* `debit_amount >= 0`.
* `credit_amount >= 0`.
* No se permite que una línea financiera tenga débito y crédito positivos al mismo tiempo.
* Las líneas originadas en movimiento fuente deben tener `source_type` y `source_id`.
* `sort_order` debe ser único por statement.
* `balance_after_line` debe poder recalcularse.

---

### 6.5. Índices

```text id="tkqcrb"
index account_statement_lines_tenant_id_idx on account_statement_lines(tenant_id)
index account_statement_lines_statement_id_idx on account_statement_lines(account_statement_id)
index account_statement_lines_property_unit_id_idx on account_statement_lines(property_unit_id)
index account_statement_lines_billing_period_id_idx on account_statement_lines(billing_period_id)
index account_statement_lines_line_type_idx on account_statement_lines(line_type)
index account_statement_lines_source_idx on account_statement_lines(source_type, source_id)
index account_statement_lines_sort_order_idx on account_statement_lines(account_statement_id, sort_order)
unique account_statement_lines_statement_sort_unique on account_statement_lines(account_statement_id, sort_order)
```

---

### 6.6. Unicidad de fuente

Recomendado:

```sql id="vi62bg"
CREATE UNIQUE INDEX account_statement_lines_source_unique
ON account_statement_lines (account_statement_id, source_type, source_id, line_type)
WHERE source_type IS NOT NULL AND source_id IS NOT NULL;
```

Esto evita duplicar el mismo cargo o pago dentro del mismo statement.

---

## 7. Tabla `unit_balances`

### 7.1. Propósito

Representa el balance actual materializado por unidad.

Sirve para consultas rápidas y dashboards simples.

No reemplaza movimientos base.

---

### 7.2. Nombre físico

```text id="tox4uy"
unit_balances
```

---

### 7.3. Columnas

| Columna                       |   Tipo lógico | Requerido | Default | Descripción                    |
| ----------------------------- | ------------: | --------: | ------: | ------------------------------ |
| `id`                          |   UUID/string |        Sí |    uuid | Identificador                  |
| `tenant_id`                   |   UUID/string |        Sí |       — | Tenant                         |
| `property_unit_id`            |   UUID/string |        Sí |       — | Unidad                         |
| `currency`                    |   enum/string |        Sí |     USD | Moneda                         |
| `outstanding_balance`         | Decimal(12,2) |        Sí |    0.00 | Saldo pendiente total          |
| `overdue_balance`             | Decimal(12,2) |        Sí |    0.00 | Saldo vencido                  |
| `not_due_balance`             | Decimal(12,2) |        Sí |    0.00 | Saldo no vencido               |
| `credit_balance`              | Decimal(12,2) |        Sí |    0.00 | Saldo a favor                  |
| `unallocated_payment_balance` | Decimal(12,2) |        Sí |    0.00 | Pagos confirmados no asignados |
| `last_calculated_at`          |     timestamp |        Sí |     now | Último cálculo                 |
| `last_movement_at`            |     timestamp |        No |    null | Último movimiento financiero   |
| `is_stale`                    |       boolean |        Sí |   false | Indica si requiere recálculo   |
| `created_at`                  |     timestamp |        Sí |     now | Creación                       |
| `updated_at`                  |     timestamp |        Sí |    auto | Actualización                  |
| `archived_at`                 |     timestamp |        No |    null | Archivado lógico               |

---

### 7.4. Reglas

* `tenant_id` obligatorio.
* `property_unit_id` obligatorio.
* Unidad debe pertenecer al tenant.
* `currency = USD` en MVP.
* Montos deben ser Decimal.
* Balances no pueden ser negativos, salvo que se defina explícitamente saldo a favor separado.
* `outstanding_balance` representa deuda pendiente.
* `credit_balance` representa saldo a favor.
* `unallocated_payment_balance` representa pagos confirmados aún no aplicados.
* Si cambian cargos o pagos, el balance debe recalcularse o marcarse `is_stale`.

---

### 7.5. Índices

```text id="djlaml"
index unit_balances_tenant_id_idx on unit_balances(tenant_id)
index unit_balances_property_unit_id_idx on unit_balances(property_unit_id)
index unit_balances_is_stale_idx on unit_balances(is_stale)
index unit_balances_outstanding_balance_idx on unit_balances(outstanding_balance)
unique unit_balances_tenant_unit_currency_unique on unit_balances(tenant_id, property_unit_id, currency)
```

---

## 8. Tabla `balance_snapshots`

### 8.1. Propósito

Representa una captura materializada de balance en un momento específico.

Puede asociarse a:

* generación de statement;
* publicación;
* cierre;
* recálculo manual;
* auditoría;
* comparación posterior.

---

### 8.2. Nombre físico

```text id="edibn2"
balance_snapshots
```

---

### 8.3. Columnas

| Columna                       |   Tipo lógico | Requerido | Default | Descripción                |
| ----------------------------- | ------------: | --------: | ------: | -------------------------- |
| `id`                          |   UUID/string |        Sí |    uuid | Identificador              |
| `tenant_id`                   |   UUID/string |        Sí |       — | Tenant                     |
| `property_unit_id`            |   UUID/string |        Sí |       — | Unidad                     |
| `billing_period_id`           |   UUID/string |        No |    null | Periodo asociado           |
| `account_statement_id`        |   UUID/string |        No |    null | Statement asociado         |
| `currency`                    |   enum/string |        Sí |     USD | Moneda                     |
| `outstanding_balance`         | Decimal(12,2) |        Sí |    0.00 | Saldo pendiente            |
| `overdue_balance`             | Decimal(12,2) |        Sí |    0.00 | Saldo vencido              |
| `not_due_balance`             | Decimal(12,2) |        Sí |    0.00 | Saldo no vencido           |
| `credit_balance`              | Decimal(12,2) |        Sí |    0.00 | Saldo a favor              |
| `unallocated_payment_balance` | Decimal(12,2) |        Sí |    0.00 | Pagos no asignados         |
| `calculated_at`               |     timestamp |        Sí |     now | Fecha de cálculo           |
| `calculated_by`               |   UUID/string |        No |    null | Usuario que calculó        |
| `status`                      |          enum |        Sí | current | Estado                     |
| `source_hash`                 |        string |        No |    null | Hash de movimientos fuente |
| `created_at`                  |     timestamp |        Sí |     now | Creación                   |
| `archived_at`                 |     timestamp |        No |    null | Archivado lógico           |

---

### 8.4. Reglas

* `tenant_id` obligatorio.
* `property_unit_id` obligatorio.
* Unidad debe pertenecer al tenant.
* Puede o no asociarse a periodo.
* Puede o no asociarse a statement.
* Si se asocia a statement, ambos deben pertenecer al mismo tenant y unidad.
* No reemplaza movimientos base.
* `source_hash` permite verificar si los movimientos cambiaron.
* Snapshots anteriores pueden quedar `superseded`.

---

### 8.5. Índices

```text id="wex0em"
index balance_snapshots_tenant_id_idx on balance_snapshots(tenant_id)
index balance_snapshots_property_unit_id_idx on balance_snapshots(property_unit_id)
index balance_snapshots_billing_period_id_idx on balance_snapshots(billing_period_id)
index balance_snapshots_account_statement_id_idx on balance_snapshots(account_statement_id)
index balance_snapshots_status_idx on balance_snapshots(status)
index balance_snapshots_calculated_at_idx on balance_snapshots(calculated_at)
```

---

## 9. Enums

## 9.1. `AccountStatementStatus`

```text id="dmrg07"
draft
generated
published
closed
locked
superseded
archived
```

Prisma:

```prisma id="rufx1d"
enum AccountStatementStatus {
  DRAFT      @map("draft")
  GENERATED  @map("generated")
  PUBLISHED  @map("published")
  CLOSED     @map("closed")
  LOCKED     @map("locked")
  SUPERSEDED @map("superseded")
  ARCHIVED   @map("archived")

  @@map("account_statement_status")
}
```

---

## 9.2. `AccountStatementLineType`

```text id="b2scjo"
openingBalance
charge
chargeAdjustment
chargeReversal
paymentAllocation
paymentReversal
paymentAllocationReversal
creditBalance
closingBalance
note
```

Prisma:

```prisma id="rlkoc3"
enum AccountStatementLineType {
  OPENING_BALANCE             @map("openingBalance")
  CHARGE                      @map("charge")
  CHARGE_ADJUSTMENT           @map("chargeAdjustment")
  CHARGE_REVERSAL             @map("chargeReversal")
  PAYMENT_ALLOCATION          @map("paymentAllocation")
  PAYMENT_REVERSAL            @map("paymentReversal")
  PAYMENT_ALLOCATION_REVERSAL @map("paymentAllocationReversal")
  CREDIT_BALANCE              @map("creditBalance")
  CLOSING_BALANCE             @map("closingBalance")
  NOTE                        @map("note")

  @@map("account_statement_line_type")
}
```

---

## 9.3. `BalanceSnapshotStatus`

```text id="tljk71"
current
superseded
closed
archived
```

Prisma:

```prisma id="gpsm6w"
enum BalanceSnapshotStatus {
  CURRENT    @map("current")
  SUPERSEDED @map("superseded")
  CLOSED     @map("closed")
  ARCHIVED   @map("archived")

  @@map("balance_snapshot_status")
}
```

---

## 9.4. `BalanceSide`

```text id="jltzfi"
debit
credit
neutral
```

Prisma:

```prisma id="fb2qlt"
enum BalanceSide {
  DEBIT   @map("debit")
  CREDIT  @map("credit")
  NEUTRAL @map("neutral")

  @@map("balance_side")
}
```

---

## 9.5. `StatementSourceType`

```text id="q0n9a8"
charge
chargeAdjustment
chargeReversal
payment
paymentAllocation
paymentReversal
paymentAllocationReversal
openingBalance
creditBalance
closingBalance
system
```

Prisma:

```prisma id="ytczrr"
enum StatementSourceType {
  CHARGE                      @map("charge")
  CHARGE_ADJUSTMENT           @map("chargeAdjustment")
  CHARGE_REVERSAL             @map("chargeReversal")
  PAYMENT                     @map("payment")
  PAYMENT_ALLOCATION          @map("paymentAllocation")
  PAYMENT_REVERSAL            @map("paymentReversal")
  PAYMENT_ALLOCATION_REVERSAL @map("paymentAllocationReversal")
  OPENING_BALANCE             @map("openingBalance")
  CREDIT_BALANCE              @map("creditBalance")
  CLOSING_BALANCE             @map("closingBalance")
  SYSTEM                      @map("system")

  @@map("statement_source_type")
}
```

---

## 9.6. `CurrencyCode`

Reutilizar enum definido en módulos anteriores:

```text id="k4jzdv"
USD
```

No duplicar si ya existe en Prisma.

---

## 10. Modelo Prisma completo propuesto

```prisma id="jvgcvy"
enum AccountStatementStatus {
  DRAFT      @map("draft")
  GENERATED  @map("generated")
  PUBLISHED  @map("published")
  CLOSED     @map("closed")
  LOCKED     @map("locked")
  SUPERSEDED @map("superseded")
  ARCHIVED   @map("archived")

  @@map("account_statement_status")
}

enum AccountStatementLineType {
  OPENING_BALANCE             @map("openingBalance")
  CHARGE                      @map("charge")
  CHARGE_ADJUSTMENT           @map("chargeAdjustment")
  CHARGE_REVERSAL             @map("chargeReversal")
  PAYMENT_ALLOCATION          @map("paymentAllocation")
  PAYMENT_REVERSAL            @map("paymentReversal")
  PAYMENT_ALLOCATION_REVERSAL @map("paymentAllocationReversal")
  CREDIT_BALANCE              @map("creditBalance")
  CLOSING_BALANCE             @map("closingBalance")
  NOTE                        @map("note")

  @@map("account_statement_line_type")
}

enum BalanceSnapshotStatus {
  CURRENT    @map("current")
  SUPERSEDED @map("superseded")
  CLOSED     @map("closed")
  ARCHIVED   @map("archived")

  @@map("balance_snapshot_status")
}

enum BalanceSide {
  DEBIT   @map("debit")
  CREDIT  @map("credit")
  NEUTRAL @map("neutral")

  @@map("balance_side")
}

enum StatementSourceType {
  CHARGE                      @map("charge")
  CHARGE_ADJUSTMENT           @map("chargeAdjustment")
  CHARGE_REVERSAL             @map("chargeReversal")
  PAYMENT                     @map("payment")
  PAYMENT_ALLOCATION          @map("paymentAllocation")
  PAYMENT_REVERSAL            @map("paymentReversal")
  PAYMENT_ALLOCATION_REVERSAL @map("paymentAllocationReversal")
  OPENING_BALANCE             @map("openingBalance")
  CREDIT_BALANCE              @map("creditBalance")
  CLOSING_BALANCE             @map("closingBalance")
  SYSTEM                      @map("system")

  @@map("statement_source_type")
}
```

```prisma id="x7i78u"
model AccountStatement {
  id                   String                 @id @default(uuid())
  tenantId             String                 @map("tenant_id")
  propertyUnitId       String                 @map("property_unit_id")
  billingPeriodId      String                 @map("billing_period_id")

  statementNumber      String                 @map("statement_number")
  status               AccountStatementStatus @default(GENERATED)
  currency             CurrencyCode           @default(USD)

  openingBalance       Decimal                @default(0) @map("opening_balance") @db.Decimal(12, 2)
  chargesTotal         Decimal                @default(0) @map("charges_total") @db.Decimal(12, 2)
  adjustmentsTotal     Decimal                @default(0) @map("adjustments_total") @db.Decimal(12, 2)
  paymentsTotal        Decimal                @default(0) @map("payments_total") @db.Decimal(12, 2)
  reversalsTotal       Decimal                @default(0) @map("reversals_total") @db.Decimal(12, 2)
  creditBalance        Decimal                @default(0) @map("credit_balance") @db.Decimal(12, 2)
  closingBalance       Decimal                @default(0) @map("closing_balance") @db.Decimal(12, 2)
  overdueBalance       Decimal                @default(0) @map("overdue_balance") @db.Decimal(12, 2)
  notDueBalance        Decimal                @default(0) @map("not_due_balance") @db.Decimal(12, 2)

  lineCount            Int                    @default(0) @map("line_count")
  sourceHash           String?                @map("source_hash")

  generatedAt          DateTime               @default(now()) @map("generated_at")
  generatedBy          String                 @map("generated_by")

  publishedAt          DateTime?              @map("published_at")
  publishedBy          String?                @map("published_by")

  closedAt             DateTime?              @map("closed_at")
  closedBy             String?                @map("closed_by")
  closeReason          String?                @map("close_reason")

  lockedAt             DateTime?              @map("locked_at")
  lockedBy             String?                @map("locked_by")
  lockReason           String?                @map("lock_reason")

  supersededBy         String?                @map("superseded_by")
  previousStatementId  String?                @map("previous_statement_id")
  regenerationReason   String?                @map("regeneration_reason")

  createdAt            DateTime               @default(now()) @map("created_at")
  updatedAt            DateTime               @updatedAt @map("updated_at")
  archivedAt           DateTime?              @map("archived_at")

  tenant               Tenant                 @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  propertyUnit         PropertyUnit           @relation(fields: [propertyUnitId], references: [id], onDelete: Restrict)
  billingPeriod        BillingPeriod          @relation(fields: [billingPeriodId], references: [id], onDelete: Restrict)

  generatedByUser      UserProfile            @relation("AccountStatementGeneratedBy", fields: [generatedBy], references: [id], onDelete: Restrict)
  publishedByUser      UserProfile?           @relation("AccountStatementPublishedBy", fields: [publishedBy], references: [id], onDelete: Restrict)
  closedByUser         UserProfile?           @relation("AccountStatementClosedBy", fields: [closedBy], references: [id], onDelete: Restrict)
  lockedByUser         UserProfile?           @relation("AccountStatementLockedBy", fields: [lockedBy], references: [id], onDelete: Restrict)

  supersededByStatement AccountStatement?      @relation("StatementSupersession", fields: [supersededBy], references: [id], onDelete: Restrict)
  supersededStatements  AccountStatement[]     @relation("StatementSupersession")

  previousStatement    AccountStatement?       @relation("StatementRegeneration", fields: [previousStatementId], references: [id], onDelete: Restrict)
  regeneratedStatements AccountStatement[]      @relation("StatementRegeneration")

  lines                AccountStatementLine[]
  balanceSnapshots     BalanceSnapshot[]

  @@unique([tenantId, statementNumber])
  @@index([tenantId])
  @@index([propertyUnitId])
  @@index([billingPeriodId])
  @@index([status])
  @@index([generatedBy])
  @@index([publishedBy])
  @@index([closedBy])
  @@index([lockedBy])
  @@index([tenantId, propertyUnitId, billingPeriodId])
  @@map("account_statements")
}
```

```prisma id="kqsgv4"
model AccountStatementLine {
  id                   String                   @id @default(uuid())
  tenantId             String                   @map("tenant_id")
  accountStatementId   String                   @map("account_statement_id")
  propertyUnitId       String                   @map("property_unit_id")
  billingPeriodId      String                   @map("billing_period_id")

  lineType             AccountStatementLineType @map("line_type")
  sourceType           StatementSourceType?     @map("source_type")
  sourceId             String?                  @map("source_id")

  description          String
  lineDate             DateTime                 @map("line_date")
  dueDate              DateTime?                @map("due_date")

  debitAmount          Decimal                  @default(0) @map("debit_amount") @db.Decimal(12, 2)
  creditAmount         Decimal                  @default(0) @map("credit_amount") @db.Decimal(12, 2)
  balanceAfterLine     Decimal                  @default(0) @map("balance_after_line") @db.Decimal(12, 2)
  currency             CurrencyCode             @default(USD)

  sortOrder            Int                      @map("sort_order")
  isVisibleToResident  Boolean                  @default(true) @map("is_visible_to_resident")

  createdAt            DateTime                 @default(now()) @map("created_at")
  archivedAt           DateTime?                @map("archived_at")

  tenant               Tenant                   @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  accountStatement     AccountStatement         @relation(fields: [accountStatementId], references: [id], onDelete: Restrict)
  propertyUnit         PropertyUnit             @relation(fields: [propertyUnitId], references: [id], onDelete: Restrict)
  billingPeriod        BillingPeriod            @relation(fields: [billingPeriodId], references: [id], onDelete: Restrict)

  @@unique([accountStatementId, sortOrder])
  @@index([tenantId])
  @@index([accountStatementId])
  @@index([propertyUnitId])
  @@index([billingPeriodId])
  @@index([lineType])
  @@index([sourceType, sourceId])
  @@index([accountStatementId, sortOrder])
  @@map("account_statement_lines")
}
```

```prisma id="mu77be"
model UnitBalance {
  id                         String       @id @default(uuid())
  tenantId                   String       @map("tenant_id")
  propertyUnitId             String       @map("property_unit_id")
  currency                   CurrencyCode @default(USD)

  outstandingBalance         Decimal      @default(0) @map("outstanding_balance") @db.Decimal(12, 2)
  overdueBalance             Decimal      @default(0) @map("overdue_balance") @db.Decimal(12, 2)
  notDueBalance              Decimal      @default(0) @map("not_due_balance") @db.Decimal(12, 2)
  creditBalance              Decimal      @default(0) @map("credit_balance") @db.Decimal(12, 2)
  unallocatedPaymentBalance  Decimal      @default(0) @map("unallocated_payment_balance") @db.Decimal(12, 2)

  lastCalculatedAt           DateTime     @default(now()) @map("last_calculated_at")
  lastMovementAt             DateTime?    @map("last_movement_at")
  isStale                    Boolean      @default(false) @map("is_stale")

  createdAt                  DateTime     @default(now()) @map("created_at")
  updatedAt                  DateTime     @updatedAt @map("updated_at")
  archivedAt                 DateTime?    @map("archived_at")

  tenant                     Tenant       @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  propertyUnit               PropertyUnit @relation(fields: [propertyUnitId], references: [id], onDelete: Restrict)

  @@unique([tenantId, propertyUnitId, currency])
  @@index([tenantId])
  @@index([propertyUnitId])
  @@index([isStale])
  @@index([outstandingBalance])
  @@map("unit_balances")
}
```

```prisma id="cmsfl7"
model BalanceSnapshot {
  id                         String                @id @default(uuid())
  tenantId                   String                @map("tenant_id")
  propertyUnitId             String                @map("property_unit_id")
  billingPeriodId            String?               @map("billing_period_id")
  accountStatementId         String?               @map("account_statement_id")

  currency                   CurrencyCode          @default(USD)
  outstandingBalance         Decimal               @default(0) @map("outstanding_balance") @db.Decimal(12, 2)
  overdueBalance             Decimal               @default(0) @map("overdue_balance") @db.Decimal(12, 2)
  notDueBalance              Decimal               @default(0) @map("not_due_balance") @db.Decimal(12, 2)
  creditBalance              Decimal               @default(0) @map("credit_balance") @db.Decimal(12, 2)
  unallocatedPaymentBalance  Decimal               @default(0) @map("unallocated_payment_balance") @db.Decimal(12, 2)

  calculatedAt               DateTime              @default(now()) @map("calculated_at")
  calculatedBy               String?               @map("calculated_by")
  status                     BalanceSnapshotStatus @default(CURRENT)
  sourceHash                 String?               @map("source_hash")

  createdAt                  DateTime              @default(now()) @map("created_at")
  archivedAt                 DateTime?             @map("archived_at")

  tenant                     Tenant                @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  propertyUnit               PropertyUnit          @relation(fields: [propertyUnitId], references: [id], onDelete: Restrict)
  billingPeriod              BillingPeriod?        @relation(fields: [billingPeriodId], references: [id], onDelete: Restrict)
  accountStatement           AccountStatement?     @relation(fields: [accountStatementId], references: [id], onDelete: Restrict)
  calculatedByUser           UserProfile?          @relation("BalanceSnapshotCalculatedBy", fields: [calculatedBy], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([propertyUnitId])
  @@index([billingPeriodId])
  @@index([accountStatementId])
  @@index([status])
  @@index([calculatedAt])
  @@map("balance_snapshots")
}
```

---

## 11. Cambios requeridos en modelos existentes

### 11.1. Modelo `Tenant`

Agregar relaciones inversas:

```prisma id="z9e5c2"
model Tenant {
  // campos existentes...

  accountStatements     AccountStatement[]
  accountStatementLines AccountStatementLine[]
  unitBalances          UnitBalance[]
  balanceSnapshots      BalanceSnapshot[]
}
```

---

### 11.2. Modelo `PropertyUnit`

Agregar relaciones inversas:

```prisma id="b5hf52"
model PropertyUnit {
  // campos existentes...

  accountStatements     AccountStatement[]
  accountStatementLines AccountStatementLine[]
  unitBalances          UnitBalance[]
  balanceSnapshots      BalanceSnapshot[]
}
```

---

### 11.3. Modelo `BillingPeriod`

Agregar relaciones inversas:

```prisma id="c1glxq"
model BillingPeriod {
  // campos existentes...

  accountStatements     AccountStatement[]
  accountStatementLines AccountStatementLine[]
  balanceSnapshots      BalanceSnapshot[]
}
```

---

### 11.4. Modelo `UserProfile`

Agregar relaciones inversas:

```prisma id="c5jyoc"
model UserProfile {
  // campos existentes...

  generatedAccountStatements AccountStatement[] @relation("AccountStatementGeneratedBy")
  publishedAccountStatements AccountStatement[] @relation("AccountStatementPublishedBy")
  closedAccountStatements    AccountStatement[] @relation("AccountStatementClosedBy")
  lockedAccountStatements    AccountStatement[] @relation("AccountStatementLockedBy")

  calculatedBalanceSnapshots BalanceSnapshot[]  @relation("BalanceSnapshotCalculatedBy")
}
```

---

## 12. Constraints recomendadas mediante SQL manual

### 12.1. Montos no negativos en `account_statements`

```sql id="wp93df"
ALTER TABLE account_statements
ADD CONSTRAINT account_statements_amounts_non_negative_check
CHECK (
  opening_balance >= 0
  AND charges_total >= 0
  AND payments_total >= 0
  AND credit_balance >= 0
  AND closing_balance >= 0
  AND overdue_balance >= 0
  AND not_due_balance >= 0
);
```

Nota:

```text id="l9sqjs"
adjustments_total y reversals_total podrían ser netos. Si se decide permitir negativos, excluirlos del check o separar debit/credit.
```

---

### 12.2. `line_count` no negativo

```sql id="b2a6dr"
ALTER TABLE account_statements
ADD CONSTRAINT account_statements_line_count_non_negative_check
CHECK (line_count >= 0);
```

---

### 12.3. Motivo requerido al cerrar

```sql id="xdu1ri"
ALTER TABLE account_statements
ADD CONSTRAINT account_statements_close_reason_required_check
CHECK (
  status <> 'closed'
  OR close_reason IS NOT NULL
);
```

---

### 12.4. Motivo requerido al bloquear

```sql id="hsh94n"
ALTER TABLE account_statements
ADD CONSTRAINT account_statements_lock_reason_required_check
CHECK (
  status <> 'locked'
  OR lock_reason IS NOT NULL
);
```

---

### 12.5. Motivo requerido en regeneración

```sql id="mri1w1"
ALTER TABLE account_statements
ADD CONSTRAINT account_statements_regeneration_reason_required_check
CHECK (
  previous_statement_id IS NULL
  OR regeneration_reason IS NOT NULL
);
```

---

### 12.6. Montos no negativos en líneas

```sql id="sj49o5"
ALTER TABLE account_statement_lines
ADD CONSTRAINT account_statement_lines_amounts_non_negative_check
CHECK (
  debit_amount >= 0
  AND credit_amount >= 0
);
```

---

### 12.7. Línea no puede tener débito y crédito positivos a la vez

```sql id="mjfcsl"
ALTER TABLE account_statement_lines
ADD CONSTRAINT account_statement_lines_debit_credit_exclusive_check
CHECK (
  NOT (debit_amount > 0 AND credit_amount > 0)
);
```

---

### 12.8. Línea financiera debe tener fuente

```sql id="n8zafs"
ALTER TABLE account_statement_lines
ADD CONSTRAINT account_statement_lines_source_required_check
CHECK (
  line_type IN ('openingBalance', 'closingBalance', 'creditBalance', 'note')
  OR (source_type IS NOT NULL AND source_id IS NOT NULL)
);
```

---

### 12.9. Balances no negativos

```sql id="dhvy9u"
ALTER TABLE unit_balances
ADD CONSTRAINT unit_balances_non_negative_check
CHECK (
  outstanding_balance >= 0
  AND overdue_balance >= 0
  AND not_due_balance >= 0
  AND credit_balance >= 0
  AND unallocated_payment_balance >= 0
);
```

---

### 12.10. Snapshot balances no negativos

```sql id="i8ah3v"
ALTER TABLE balance_snapshots
ADD CONSTRAINT balance_snapshots_non_negative_check
CHECK (
  outstanding_balance >= 0
  AND overdue_balance >= 0
  AND not_due_balance >= 0
  AND credit_balance >= 0
  AND unallocated_payment_balance >= 0
);
```

---

## 13. Reglas que deben validarse en aplicación

Estas reglas no deben depender solo de la base de datos:

```text id="mykc4n"
- statement.tenantId == currentTenant.id
- statement.propertyUnit.tenantId == currentTenant.id
- statement.billingPeriod.tenantId == currentTenant.id
- line.tenantId == statement.tenantId
- line.propertyUnitId == statement.propertyUnitId
- line.billingPeriodId == statement.billingPeriodId
- balance.propertyUnit.tenantId == balance.tenantId
- snapshot.propertyUnit.tenantId == snapshot.tenantId
- snapshot.accountStatement.tenantId == snapshot.tenantId si existe
- sourceId existe y pertenece al tenant
- sourceId pertenece a la misma unidad cuando aplique
- cargos cancelados no generan líneas de deuda activa
- cargos reversados no generan deuda activa
- pagos reversados no generan crédito activo
- allocations reversadas no reducen saldo
- statement publicado no se regenera sin motivo
- statement locked no se regenera sin permiso especial
- usuario .own solo accede a unidades propias
```

---

## 14. Reglas de cálculo

### 14.1. Representación de débitos y créditos

Débito:

```text id="r1639j"
aumenta saldo deudor
```

Crédito:

```text id="aqr5hn"
disminuye saldo deudor o genera saldo a favor
```

Ejemplos:

| Movimiento                | Línea             | Débito |         Crédito |
| ------------------------- | ----------------- | -----: | --------------: |
| Cargo mensual             | charge            |  50.00 |            0.00 |
| Cargo extraordinario      | charge            |  25.00 |            0.00 |
| Ajuste positivo           | chargeAdjustment  |  10.00 |            0.00 |
| Ajuste negativo/descuento | chargeAdjustment  |   0.00 |            5.00 |
| Pago asignado             | paymentAllocation |   0.00 |           50.00 |
| Reverso de pago aplicado  | paymentReversal   |  50.00 |            0.00 |
| Reverso de cargo          | chargeReversal    |   0.00 | monto reversado |
| Saldo inicial deudor      | openingBalance    |  monto |            0.00 |
| Saldo a favor             | creditBalance     |   0.00 |           monto |

---

### 14.2. Fórmula de saldo por líneas

```text id="xzv2i3"
balanceAfterLine = previousBalance + debitAmount - creditAmount
```

Si el resultado es negativo:

```text id="mck94v"
creditBalance = abs(balance)
closingBalance = 0.00
```

o, alternativamente, se mantiene `closingBalance` no negativo y el crédito separado.

MVP recomendado:

```text id="m2rc9z"
closingBalance nunca negativo.
creditBalance representa excedente a favor.
```

---

### 14.3. Fórmula de cierre

```text id="offrys"
rawClosingBalance = openingBalance
  + chargesTotal
  + adjustmentsDebitTotal
  + reversalsDebitTotal
  - paymentsTotal
  - adjustmentsCreditTotal
  - reversalsCreditTotal
```

Luego:

```text id="hikhdp"
if rawClosingBalance >= 0:
  closingBalance = rawClosingBalance
  creditBalance = 0.00

if rawClosingBalance < 0:
  closingBalance = 0.00
  creditBalance = abs(rawClosingBalance)
```

---

### 14.4. Saldo vencido

MVP recomendado:

```text id="ervcfj"
overdueBalance = suma de cargos pendientes con dueDate < asOfDate
```

Reglas:

* cargos cancelados no cuentan;
* cargos reversados no cuentan;
* cargos pagados totalmente no cuentan;
* pagos asignados reducen saldo del cargo;
* mora avanzada queda diferida.

---

### 14.5. Saldo no vencido

```text id="j26fxb"
notDueBalance = outstandingBalance - overdueBalance
```

Debe ser no negativo.

---

### 14.6. Pagos no asignados

Pagos confirmados sin asignar o parcialmente asignados generan:

```text id="a5z63s"
unallocatedPaymentBalance
```

Política MVP recomendada:

```text id="gh2a7b"
Mostrar unallocatedPaymentBalance separado.
No reducir cargos específicos hasta que exista PaymentAllocation.
Puede mostrarse también como creditBalance provisional si no hay deuda pendiente.
```

---

### 14.7. Cargos cancelados o reversados

No deben aumentar saldo.

```text id="b72zhl"
Charge.status IN ('cancelled', 'reversed', 'archived') => excluded
```

---

### 14.8. Pagos reversados

No deben reducir saldo.

```text id="q4x1as"
Payment.status = reversed => allocations no activas para balance
```

---

### 14.9. Asignaciones reversadas

No deben reducir saldo.

```text id="v0rsle"
PaymentAllocation.status = reversed => excluded
```

---

## 15. Reglas de source hash

### 15.1. Propósito

`source_hash` permite detectar si los movimientos base usados para generar un statement o snapshot cambiaron.

---

### 15.2. Entrada del hash

MVP recomendado:

```text id="i75p7s"
tenantId
propertyUnitId
billingPeriodId
charges ids + updatedAt + effectiveAmount + status
chargeAdjustments ids + updatedAt + amount + status
chargeReversals ids + updatedAt
paymentAllocations ids + updatedAt + amount + status
paymentReversals ids + updatedAt
```

---

### 15.3. Uso

Si un statement publicado tiene `source_hash` distinto al hash actual:

```text id="mr6mlv"
statement puede marcarse como stale o requerir regeneración controlada
```

No actualizar automáticamente un statement publicado sin auditoría.

---

## 16. Reglas de idempotencia y regeneración

### 16.1. Generación inicial

Si no existe statement activo para tenant/unidad/periodo:

```text id="f4xurh"
crear AccountStatement
crear AccountStatementLines
crear BalanceSnapshot
```

---

### 16.2. Generación duplicada

Si ya existe statement activo:

Según `mode`:

```text id="yjqest"
failIfExists → 409 ACCOUNT_STATEMENT_ALREADY_EXISTS
create → 409 ACCOUNT_STATEMENT_ALREADY_EXISTS
regenerateIfExists → regeneración controlada con motivo
```

---

### 16.3. Regeneración

Debe:

```text id="jost68"
1. exigir motivo;
2. marcar statement anterior como superseded;
3. crear nuevo statement;
4. copiar previousStatementId;
5. actualizar supersededBy en anterior;
6. crear nuevas líneas;
7. crear snapshot nuevo;
8. auditar;
9. emitir evento.
```

---

### 16.4. Statements locked

Un statement `locked` no se regenera ordinariamente.

Requiere:

```text id="lzpn6f"
permiso especial
motivo
auditoría reforzada
```

---

## 17. Reglas de acceso `.own`

### 17.1. Resolver unidades propias

Para endpoints:

```text id="ifccdf"
GET /api/v1/me/account-statements
GET /api/v1/me/account-statements/{statementId}
GET /api/v1/me/property-units/{propertyUnitId}/balance
GET /api/v1/me/property-units/{propertyUnitId}/financial-movements
GET /api/v1/me/account-statements/{statementId}/export
```

El sistema debe usar:

```text id="a49ygz"
OwnResourceReaderPort.getOwnPropertyUnitIds(tenantId, userProfileId)
```

---

### 17.2. Filtro obligatorio

Toda consulta propia debe filtrar por:

```text id="g17qwn"
tenantId
propertyUnitId IN ownPropertyUnitIds
```

---

### 17.3. Usuario sin persona vinculada

Si el usuario no tiene `Person` vinculada:

```text id="akxw46"
403 OWN_PERSON_NOT_LINKED
```

---

### 17.4. Unidad ajena

Para unidad ajena:

```text id="kcs4sl"
404 NOT_FOUND
```

recomendado para no revelar existencia.

---

### 17.5. Visibilidad de statements propios

MVP recomendado:

```text id="ohgico"
usuarios .own solo ven statements published, closed o locked publicados previamente.
```

No ven:

```text id="owwtr9"
draft
generated no publicado
superseded
archived
```

salvo política explícita.

---

### 17.6. Visibilidad de líneas

Líneas con:

```text id="pc6jd7"
is_visible_to_resident = false
```

no deben mostrarse en endpoints `.own`.

---

## 18. Reglas de exportación

### 18.1. Formatos MVP

Formatos iniciales:

```text id="gyawdb"
json
csv
```

PDF avanzado queda diferido.

---

### 18.2. Exportación administrativa

Requiere:

```text id="y4vxyi"
accountStatements.export
```

Debe auditarse.

---

### 18.3. Exportación propia

Requiere:

```text id="qdtods"
accountStatements.export.own
```

Debe validar unidad propia.

---

### 18.4. Datos prohibidos en export propio

No incluir:

```text id="go79mc"
auditoría interna
actorUserId internos
notas administrativas internas
datos de otros propietarios
datos de otras unidades
traceId internos
sourceHash si se considera interno
```

---

## 19. Seeds iniciales

### 19.1. Tenants demo

Reusar:

```text id="ra993n"
villa-club-demo
altos-del-norte-demo
jardines-del-valle-demo
portal-del-rio-demo
```

---

### 19.2. Dependencias demo

Reusar desde módulos previos:

```text id="kgk5ua"
property units demo
billing periods demo
charges demo
payments demo
payment allocations demo
users demo
own relationships demo
```

---

### 19.3. Account statements demo

Para `villa-club-demo`:

```text id="k4b3py"
statement generated Casa 01 periodo 2026-07
statement published Casa 02 periodo 2026-07
statement closed Casa 03 periodo 2026-07
```

---

### 19.4. Lines demo

Ejemplo:

```text id="f5ljbr"
openingBalance 0.00
charge alícuota mensual 50.00
charge fondo reserva 10.00
paymentAllocation 50.00
closingBalance 10.00
```

---

### 19.5. Unit balances demo

```text id="h24i2x"
Casa 01 outstandingBalance 10.00
Casa 02 outstandingBalance 0.00
Casa 03 creditBalance 25.00
```

---

### 19.6. Balance snapshots demo

```text id="pfoufi"
snapshot Casa 01 periodo 2026-07
snapshot Casa 02 periodo 2026-07
```

---

## 20. Datos prohibidos en seeds

No usar:

```text id="czsg7o"
saldos reales
estados reales
datos reales de propietarios
datos reales de residentes
comprobantes reales
referencias bancarias reales
documentos financieros reales
capturas de transferencias reales
```

Usar:

```text id="p4k160"
USD
50.00
100.00
periodo 2026-07
tenant demo
unidad demo
cargo demo
pago demo
statement demo
```

---

## 21. Consultas esperadas

### 21.1. Listar statements administrativos

```text id="kl492f"
listAccountStatements(tenantId, query)
```

Filtros:

```text id="l091do"
propertyUnitId
billingPeriodId
status
periodCode
statementNumber
generatedFrom
generatedTo
```

---

### 21.2. Consultar statement

```text id="qh5ojj"
findAccountStatementById(tenantId, statementId)
```

Incluye líneas.

---

### 21.3. Buscar statement activo por unidad/periodo

```text id="inw8l0"
findActiveByUnitAndPeriod(tenantId, propertyUnitId, billingPeriodId)
```

---

### 21.4. Listar balances

```text id="k5alqc"
listUnitBalances(tenantId, query)
```

Filtros:

```text id="t7bqqt"
propertyUnitId
hasDebt
hasCredit
overdueOnly
isStale
```

---

### 21.5. Consultar balance por unidad

```text id="buuqfp"
findUnitBalanceByUnit(tenantId, propertyUnitId)
```

---

### 21.6. Listar movimientos financieros

```text id="dausmt"
listFinancialMovements(tenantId, propertyUnitId, query)
```

Fuentes:

```text id="l0cxo1"
charges
chargeAdjustments
chargeReversals
paymentAllocations
paymentReversals
allocationReversals
```

---

### 21.7. Listar statements propios

```text id="orxcu2"
listOwnAccountStatements(tenantId, ownPropertyUnitIds, query)
```

---

## 22. Paginación

Todos los listados deben soportar:

```text id="l9l2c0"
page
pageSize
```

Valores:

```text id="yg0sgl"
page = 1
pageSize = 20
max pageSize = 100
```

Aplica a:

```text id="zqm2br"
account_statements
unit_balances
financial_movements
balance_snapshots
```

---

## 23. Filtros mínimos

### 23.1. AccountStatements

```text id="rsq5o5"
propertyUnitId
billingPeriodId
periodCode
status
statementNumber
generatedFrom
generatedTo
publishedOnly
```

---

### 23.2. UnitBalances

```text id="gxkn1o"
propertyUnitId
hasDebt
hasCredit
overdueOnly
isStale
minOutstandingBalance
```

---

### 23.3. FinancialMovements

```text id="jmrpac"
billingPeriodId
dateFrom
dateTo
sourceType
includeReversed
visibleToResidentOnly
```

---

### 23.4. BalanceSnapshots

```text id="z7497v"
propertyUnitId
billingPeriodId
accountStatementId
status
calculatedFrom
calculatedTo
```

---

## 24. Ordenamiento

Campos permitidos:

```text id="mq74wl"
createdAt
updatedAt
generatedAt
publishedAt
closedAt
statementNumber
status
openingBalance
closingBalance
overdueBalance
propertyUnitCode
periodCode
```

No permitir ordenamiento por campos arbitrarios.

---

## 25. Performance esperada

MVP recomendado:

```text id="c1a3ml"
hasta 500 unidades por tenant
hasta 24 periodos consultables inicialmente
hasta 5.000 líneas financieras por tenant/periodo
```

Índices críticos:

```text id="f7un5z"
account_statements(tenant_id, property_unit_id, billing_period_id)
account_statements(tenant_id, status)
account_statement_lines(account_statement_id, sort_order)
account_statement_lines(source_type, source_id)
unit_balances(tenant_id, property_unit_id, currency)
balance_snapshots(tenant_id, property_unit_id, billing_period_id)
```

No se requiere particionamiento en MVP.

---

## 26. Seguridad de datos

### 26.1. Cross-tenant

Mitigación:

* `tenant_id` obligatorio;
* queries por tenant;
* validación de unidad;
* validación de periodo;
* validación de source movements;
* tests multitenant.

---

### 26.2. Statement incorrecto

Mitigación:

* BalanceCalculator;
* source references;
* sourceHash;
* financial regression tests;
* reconstruction tests.

---

### 26.3. Snapshot inconsistente

Mitigación:

* sourceHash;
* superseded snapshots;
* regeneration policy;
* no actualización silenciosa de statements publicados.

---

### 26.4. Exposición de saldos ajenos

Mitigación:

* `OwnAccountStatementPolicyService`;
* filtro por unidades propias;
* 404 para recursos ajenos en `.own`;
* no exposición de auditoría interna.

---

### 26.5. Eliminación física

Mitigación:

* no exponer DELETE;
* `onDelete: Restrict`;
* estados `superseded` y `archived`;
* auditoría.

---

## 27. Migración inicial

### 27.1. Nombre sugerido

```text id="hhwau3"
006_create_account_statements
```

---

### 27.2. Orden de creación

```text id="hkkmr0"
1. Enums
2. account_statements
3. account_statement_lines
4. unit_balances
5. balance_snapshots
6. indexes
7. partial unique indexes
8. SQL manual constraints
```

---

### 27.3. Revisión manual

Antes de aplicar en staging o producción:

```text id="d5yhxh"
- verificar tenant_id obligatorio;
- verificar property_unit_id obligatorio;
- verificar billing_period_id obligatorio en statements;
- verificar Decimal en montos;
- verificar statement_number único por tenant;
- verificar unique activo por tenant+unit+period;
- verificar source uniqueness;
- verificar no cascade delete peligroso;
- verificar onDelete Restrict;
- verificar constraints de montos;
- verificar seeds ficticios;
- verificar que no se creen saldos reales.
```

---

## 28. Tests de modelo requeridos

### 28.1. Unitarios

* Money.
* StatementNumber.
* SourceReference.
* AccountStatementStatus.
* AccountStatementLineType.
* BalanceSnapshotStatus.
* AccountStatement entity.
* AccountStatementLine entity.
* UnitBalance entity.
* BalanceSnapshot entity.

---

### 28.2. Integración

* Crear statement.
* Statement number único.
* Active statement único por tenant/unidad/periodo.
* Crear líneas.
* Sort order único.
* Source uniqueness.
* Crear UnitBalance.
* Upsert UnitBalance.
* Crear BalanceSnapshot.
* onDelete Restrict.
* No cascade delete peligroso.

---

### 28.3. Multitenant

* Statement Tenant A no visible en Tenant B.
* Balance Tenant A no visible en Tenant B.
* Línea Tenant A no visible en Tenant B.
* Snapshot Tenant A no visible en Tenant B.
* Own statements no mezclan tenants.

---

### 28.4. Financial regression

* Cargos suman.
* Pagos asignados restan.
* Cargos cancelados se excluyen.
* Cargos reversados se excluyen.
* Pagos reversados se excluyen.
* Allocations reversadas se excluyen.
* Saldo a favor se separa.
* Statement reconstruible.
* Decimal exacto.

---

## 29. Compatibilidad con módulos futuros

Este modelo habilita:

```text id="b0fywz"
009-notifications
00X-late-fees
00X-collections
00X-financial-reports
00X-bank-reconciliation
00X-n8n-automations
00X-resident-self-service
```

Uso futuro:

| Módulo futuro         | Entidades usadas                               |
| --------------------- | ---------------------------------------------- |
| Notifications         | AccountStatement, UnitBalance                  |
| Late Fees             | UnitBalance, overdueBalance, charges           |
| Collections           | overdueBalance, published statements           |
| Financial Reports     | AccountStatement, UnitBalance, BalanceSnapshot |
| Bank Reconciliation   | Payments, Allocations, Statement consistency   |
| n8n                   | eventos de statement y balance                 |
| Resident Self-Service | own statements y balances                      |

---

## 30. Campos diferidos

No incluir todavía:

```text id="g3j3f9"
lateFeeAmount
interestAmount
collectionStatus
collectionStage
legalCollectionStatus
accountingEntryId
invoiceId
taxDocumentId
pdfFileId
emailSentAt
whatsappSentAt
notificationBatchId
approvalWorkflowId
approvedBy
approvedAt
bankReconciliationId
```

Razón:

* pertenecen a mora;
* pertenecen a cobranza;
* pertenecen a contabilidad;
* pertenecen a facturación electrónica;
* pertenecen a notificaciones;
* pertenecen a conciliación bancaria;
* requieren workflows avanzados.

---

## 31. Uso de JSONB

Evitar JSONB para datos financieros críticos.

No usar JSONB para:

```text id="bj0f88"
amounts
balances
source references
status
propertyUnitId
tenantId
billingPeriodId
statement lines
currency
```

Uso permitido limitado:

```text id="xiqx8f"
metadata no crítica de exportación
metadata técnica de sourceHash
información de formato futuro no financiera
```

Regla:

```text id="mtx8c3"
JSONB no debe contener saldos, cargos, pagos, comprobantes ni payload financiero completo.
```

---

## 32. Reglas de retención

* Statements se conservan.
* Lines se conservan.
* UnitBalance puede recalcularse, pero debe conservar trazabilidad de cambios relevantes mediante auditoría.
* BalanceSnapshots se conservan.
* Statements superseded se conservan.
* Exportaciones no se almacenan en MVP salvo que una spec futura lo defina.
* No hay purga automática en MVP.

---

## 33. Checklist de migración

Antes de aceptar la migración:

```text id="el92y7"
[ ] Enums creados.
[ ] Tabla account_statements creada.
[ ] Tabla account_statement_lines creada.
[ ] Tabla unit_balances creada.
[ ] Tabla balance_snapshots creada.
[ ] tenant_id obligatorio en todas las tablas.
[ ] property_unit_id obligatorio.
[ ] billing_period_id obligatorio en account_statements.
[ ] Decimal aplicado en todos los montos.
[ ] currency definido.
[ ] statement_number único por tenant.
[ ] unique activo tenant+unit+period creado.
[ ] source uniqueness creado.
[ ] sort_order único por statement.
[ ] índices por tenant creados.
[ ] índices por propertyUnit creados.
[ ] índices por billingPeriod creados.
[ ] onDelete Restrict aplicado.
[ ] no cascade delete peligroso.
[ ] constraints de montos revisadas.
[ ] constraints de reason revisadas.
[ ] constraints de source revisadas.
[ ] seeds no contienen datos reales.
[ ] migración aplicada en local.
[ ] Prisma Client generado.
```

---

## 34. Decisión final del modelo

El módulo `006-account-statements` usará cuatro tablas principales:

```text id="d5ys40"
account_statements
account_statement_lines
unit_balances
balance_snapshots
```

El modelo se basa en:

```text id="n5o2uo"
tenant_id obligatorio
property_unit_id obligatorio
billing_period_id obligatorio para statements
montos Decimal
moneda USD en MVP
líneas con source_type y source_id
statement_number único por tenant
unicidad lógica por tenant+unidad+periodo
snapshots versionados
source_hash opcional
no eliminación física
regeneración con superseded statement
acceso .own por unidades propias
```

Este modelo habilita la generación segura y reconstruible de estados de cuenta, y prepara RESIDENT Core para mora, cobranza, reportes financieros, notificaciones, automatizaciones y conciliación bancaria futura.
