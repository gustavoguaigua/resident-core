# Plan — Spec 006 Account Statements, Balances and Financial Position by Property Unit

## 1. Información del documento

| Campo          | Valor                                                                                         |
| -------------- | --------------------------------------------------------------------------------------------- |
| Proyecto       | RESIDENT Core                                                                                 |
| Spec ID        | 006                                                                                           |
| Módulo         | Account Statements                                                                            |
| Documento      | Implementation Plan                                                                           |
| Ruta           | `docs/specs/006-account-statements/plan.md`                                                   |
| Versión        | 0.1                                                                                           |
| Estado         | needs-review                                                                                  |
| Fecha          | 2026-07-14                                                                                    |
| Documento base | `docs/specs/006-account-statements/spec.md`                                                   |
| Depende de     | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments` |
| Arquitectura   | Monolito modular NestJS                                                                       |
| Base de datos  | PostgreSQL + Prisma                                                                           |
| Autorización   | Tenant-aware RBAC + permisos financieros + `.own` policies                                    |
| Prioridad      | Alta                                                                                          |

---

## 2. Propósito

Este documento transforma la especificación funcional `006-account-statements/spec.md` en un plan técnico de implementación.

El módulo `006-account-statements` permitirá administrar:

* balances por unidad habitacional;
* estados de cuenta por periodo;
* líneas de estado de cuenta;
* saldos iniciales;
* cargos del periodo;
* pagos aplicados;
* ajustes;
* reversos;
* saldos vencidos;
* saldos no vencidos;
* saldos a favor;
* snapshots de balance;
* publicación de estados de cuenta;
* cierre de estados de cuenta;
* bloqueo de estados;
* regeneración controlada;
* consulta administrativa;
* consulta propia;
* exportación básica;
* auditoría financiera;
* eventos de dominio;
* preparación para mora, cobranza, notificaciones y reportes financieros.

Regla central:

```text id="ro4gmu"
El estado de cuenta debe ser una vista reconstruible y auditable de cargos, ajustes, reversos, pagos y asignaciones; no una fuente independiente de verdad financiera.
```

---

## 3. Resumen de implementación

El módulo se implementará como módulo interno de NestJS dentro del monolito modular de RESIDENT Core.

Entidades principales:

```text id="kxcr02"
AccountStatement
AccountStatementLine
UnitBalance
BalanceSnapshot
```

Relación conceptual:

```text id="xx8ubc"
Tenant
├── PropertyUnit
│   ├── Charges
│   ├── Payments
│   ├── PaymentAllocations
│   └── AccountStatement
│       ├── AccountStatementLine
│       └── BalanceSnapshot
```

Relación con módulos previos:

```text id="t5lzn4"
Tenant                       ← 001-tenants
UserProfile/permissions      ← 002-users-roles
Person/PropertyUnit          ← 003-residents-properties
Charge/Adjustment/Reversal   ← 004-dues-fees
Payment/Allocation/Reversal  ← 005-payments
AccountStatement             ← 006-account-statements
Notifications/Collections    ← specs futuras
```

---

## 4. Decisiones técnicas aplicables

Este módulo debe respetar:

```text id="g674lg"
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

* Todo statement lleva `tenantId`.
* Todo statement se asocia a `PropertyUnit`.
* Todo statement de periodo se asocia a `BillingPeriod`.
* Todo cálculo usa Decimal.
* No se usan `float` ni `double`.
* Todo balance debe ser reconstruible desde movimientos base.
* Los snapshots no reemplazan los movimientos financieros.
* Cada línea debe referenciar su fuente mediante `sourceType` y `sourceId`.
* Los usuarios `.own` solo consultan unidades propias.
* Los statements publicados, cerrados o bloqueados no se eliminan físicamente.
* La regeneración requiere motivo, auditoría y vínculo con statement anterior.
* WordPress no calcula ni almacena estados de cuenta.

---

## 5. Alcance técnico

### 5.1. Incluido

La implementación inicial cubre:

* modelos Prisma;
* migraciones;
* seeds demo;
* value objects financieros;
* entidades de dominio;
* repositorios;
* puertos hacia `003-residents-properties`;
* puertos hacia `004-dues-fees`;
* puertos hacia `005-payments`;
* servicios de cálculo de balance;
* servicios de construcción de líneas;
* servicios de generación de statements;
* generación batch por periodo;
* publicación;
* cierre;
* bloqueo;
* regeneración controlada;
* snapshots de balance;
* consulta administrativa;
* consulta propia;
* exportación básica JSON/CSV;
* auditoría;
* eventos;
* OpenAPI;
* pruebas unitarias;
* pruebas de integración;
* pruebas API;
* pruebas de autorización;
* pruebas multitenant;
* pruebas financieras de reconstrucción;
* pruebas de precisión monetaria;
* pruebas de seguridad.

---

### 5.2. Diferido

No se implementará todavía:

* mora avanzada;
* intereses compuestos;
* cobranza automatizada;
* envío automático por correo;
* envío automático por WhatsApp;
* PDF avanzado;
* firma electrónica;
* conciliación bancaria;
* facturación electrónica;
* asientos contables;
* dashboards ejecutivos;
* reportes financieros avanzados;
* integración con pasarela de pagos;
* aprobación dual avanzada;
* notificaciones automáticas;
* n8n automations.

---

## 6. Estructura de carpetas recomendada

```text id="f6uhvx"
apps/api/src/modules/account-statements/
├── account-statements.module.ts
│
├── account-statements.controller.ts
├── balances.controller.ts
├── own-account-statements.controller.ts
│
├── application/
│   ├── use-cases/
│   │   ├── calculate-unit-balance.use-case.ts
│   │   ├── recalculate-unit-balance.use-case.ts
│   │   ├── list-balances.use-case.ts
│   │   ├── list-financial-movements.use-case.ts
│   │   ├── generate-account-statement.use-case.ts
│   │   ├── generate-account-statements-batch.use-case.ts
│   │   ├── get-account-statement.use-case.ts
│   │   ├── list-account-statements.use-case.ts
│   │   ├── publish-account-statement.use-case.ts
│   │   ├── close-account-statement.use-case.ts
│   │   ├── lock-account-statement.use-case.ts
│   │   ├── regenerate-account-statement.use-case.ts
│   │   ├── export-account-statement.use-case.ts
│   │   ├── get-my-account-statements.use-case.ts
│   │   ├── get-my-account-statement.use-case.ts
│   │   ├── get-my-property-unit-balance.use-case.ts
│   │   ├── get-my-financial-movements.use-case.ts
│   │   └── export-my-account-statement.use-case.ts
│   │
│   ├── services/
│   │   ├── balance-calculator.service.ts
│   │   ├── balance-snapshot.service.ts
│   │   ├── statement-line-builder.service.ts
│   │   ├── statement-totals.service.ts
│   │   ├── statement-number.service.ts
│   │   ├── statement-generation.service.ts
│   │   ├── statement-batch-generation.service.ts
│   │   ├── statement-publication-policy.service.ts
│   │   ├── statement-regeneration-policy.service.ts
│   │   ├── statement-export.service.ts
│   │   ├── own-account-statement-policy.service.ts
│   │   └── money.service.ts
│   │
│   └── ports/
│       ├── account-statement.repository.ts
│       ├── account-statement-line.repository.ts
│       ├── unit-balance.repository.ts
│       ├── balance-snapshot.repository.ts
│       ├── property-unit-reader.port.ts
│       ├── own-resource-reader.port.ts
│       ├── billing-period-reader.port.ts
│       ├── charge-movement-reader.port.ts
│       ├── payment-movement-reader.port.ts
│       ├── account-statements-audit.port.ts
│       └── account-statements-events.port.ts
│
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   └── errors/
│
├── infrastructure/
│   ├── persistence/
│   ├── export/
│   ├── audit/
│   └── events/
│
├── policies/
├── dto/
└── tests/
```

---

## 7. Documentación esperada

```text id="jrj5yr"
docs/specs/006-account-statements/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

Este documento corresponde a:

```text id="x1p1vl"
plan.md
```

---

# 8. Diseño de dominio

## 8.1. AccountStatement

Representa un estado de cuenta generado para una unidad y periodo.

Campos conceptuales:

```text id="lncqdz"
id
tenantId
propertyUnitId
billingPeriodId
statementNumber
status
currency
openingBalance
chargesTotal
adjustmentsTotal
paymentsTotal
reversalsTotal
creditBalance
closingBalance
overdueBalance
notDueBalance
generatedAt
generatedBy
publishedAt
publishedBy
closedAt
closedBy
lockedAt
lockedBy
supersededBy
previousStatementId
regenerationReason
createdAt
updatedAt
```

Responsabilidades:

* consolidar movimientos financieros;
* representar saldo de una unidad en un periodo;
* controlar publicación;
* controlar cierre;
* controlar bloqueo;
* soportar regeneración;
* conservar trazabilidad.

Reglas:

* pertenece a tenant;
* pertenece a una unidad;
* pertenece a un periodo;
* tiene número único por tenant;
* usa Decimal;
* no se elimina físicamente si fue publicado o cerrado;
* puede ser regenerado solo con motivo;
* si se regenera, el anterior queda `superseded`.

---

## 8.2. AccountStatementLine

Representa una línea del estado de cuenta.

Campos conceptuales:

```text id="k7cg59"
id
tenantId
accountStatementId
propertyUnitId
billingPeriodId
lineType
sourceType
sourceId
description
lineDate
dueDate
debitAmount
creditAmount
balanceAfterLine
currency
sortOrder
createdAt
archivedAt
```

Responsabilidades:

* representar cargos;
* representar pagos aplicados;
* representar ajustes;
* representar reversos;
* representar saldo inicial;
* representar saldo final;
* permitir reconstrucción y explicación del saldo.

Reglas:

* pertenece a tenant;
* pertenece a statement;
* debe tener `sourceType` y `sourceId` cuando provenga de movimiento financiero;
* usa `debitAmount` para aumentos de saldo;
* usa `creditAmount` para disminuciones de saldo;
* conserva `balanceAfterLine`;
* no debe duplicar la misma fuente dentro del mismo statement salvo regla explícita.

---

## 8.3. UnitBalance

Representa el saldo actual de una unidad.

Campos conceptuales:

```text id="sf5ioz"
id
tenantId
propertyUnitId
currency
outstandingBalance
overdueBalance
notDueBalance
creditBalance
lastCalculatedAt
lastMovementAt
updatedAt
```

Responsabilidades:

* facilitar consulta rápida;
* resumir posición financiera actual;
* permitir vista administrativa;
* permitir vista propia;
* servir como cache reconstruible.

Reglas:

* puede ser calculado en tiempo real o materializado;
* no reemplaza movimientos financieros;
* debe poder recalcularse;
* debe tener fecha de último cálculo;
* debe invalidarse o recalcularse cuando cambien cargos o pagos.

---

## 8.4. BalanceSnapshot

Representa una captura de balance en un momento.

Campos conceptuales:

```text id="fb5o67"
id
tenantId
propertyUnitId
billingPeriodId
currency
outstandingBalance
overdueBalance
notDueBalance
creditBalance
calculatedAt
calculatedBy
status
sourceHash
createdAt
archivedAt
```

Responsabilidades:

* conservar evidencia de cálculo;
* soportar publicación;
* soportar cierre;
* soportar comparación posterior;
* servir como base para auditoría.

Reglas:

* pertenece a tenant;
* pertenece a unidad;
* puede asociarse a periodo;
* no reemplaza movimientos base;
* puede quedar `superseded`;
* debe incluir `sourceHash` opcional para detectar cambios de movimientos.

---

## 8.5. FinancialMovement

No necesariamente será tabla propia en MVP.

Puede ser DTO calculado desde movimientos fuente:

```text id="wk8qcu"
FinancialMovement
├── sourceType
├── sourceId
├── propertyUnitId
├── billingPeriodId
├── movementDate
├── dueDate
├── description
├── debitAmount
├── creditAmount
├── currency
├── status
└── sortOrder
```

Fuentes:

```text id="bs7gxu"
Charge
ChargeAdjustment
ChargeReversal
PaymentAllocation
PaymentReversal
PaymentAllocationReversal
OpeningBalance
```

---

# 9. Value Objects

## 9.1. Money

Responsabilidad:

* representar valores monetarios;
* sumar;
* restar;
* comparar;
* serializar como string;
* evitar float.

Reglas:

```text id="lzc4wi"
amount Decimal
currency USD en MVP
scale 2
no redondeo silencioso
```

---

## 9.2. AccountStatementStatus

Valores:

```text id="bw8euv"
draft
generated
published
closed
locked
superseded
archived
```

Responsabilidades:

* validar publicación;
* validar cierre;
* validar bloqueo;
* validar regeneración;
* impedir operaciones inválidas.

---

## 9.3. AccountStatementLineType

Valores:

```text id="tqx6vy"
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

---

## 9.4. BalanceSnapshotStatus

Valores:

```text id="zqc3gf"
current
superseded
closed
archived
```

---

## 9.5. BalanceSide

Valores:

```text id="q11fag"
debit
credit
neutral
```

---

## 9.6. StatementNumber

Responsabilidad:

* generar número único;
* mantener formato consistente;
* evitar duplicidad por tenant y periodo.

Formato sugerido MVP:

```text id="luf42h"
ST-{tenantSlug}-{periodCode}-{unitCode}
```

Ejemplo:

```text id="nbs8f1"
ST-villa-club-2026-07-CASA-01
```

---

## 9.7. SourceReference

Responsabilidad:

* representar `sourceType`;
* representar `sourceId`;
* validar que cada línea originada en movimiento tenga fuente;
* evitar líneas huérfanas.

Valores sugeridos para `sourceType`:

```text id="z8eijc"
charge
chargeAdjustment
chargeReversal
payment
paymentAllocation
paymentReversal
paymentAllocationReversal
openingBalance
system
```

---

## 9.8. BillingPeriodCode

Puede reutilizarse de `004-dues-fees`.

Formato:

```text id="fr9fca"
YYYY-MM
```

---

# 10. Modelo Prisma preliminar

El modelo completo se detallará en:

```text id="dfghte"
docs/specs/006-account-statements/data-model.md
```

Tablas esperadas:

```text id="fyzqvd"
account_statements
account_statement_lines
unit_balances
balance_snapshots
```

Relaciones externas:

```text id="tujqil"
tenants.id
property_units.id
billing_periods.id
user_profiles.id
charges.id
payments.id
payment_allocations.id
```

Reglas de persistencia:

* `tenantId` obligatorio;
* `propertyUnitId` obligatorio;
* `billingPeriodId` obligatorio en statements de periodo;
* dinero con Decimal;
* `currency` default USD;
* `onDelete: Restrict`;
* no cascade delete peligroso;
* índices por tenant, unidad, periodo, estado y statement;
* unique por tenant + propertyUnit + billingPeriod + active statement status según política;
* líneas con sourceType/sourceId;
* no eliminación física.

---

# 11. Constraints principales

## 11.1. AccountStatement

Recomendado:

```text id="p1nkzy"
unique(tenant_id, statement_number)
index(tenant_id, property_unit_id, billing_period_id)
index(tenant_id, status)
```

Regla de unicidad lógica MVP:

```text id="t9bvzk"
Solo puede existir un AccountStatement activo no superseded por tenant, unidad y periodo.
```

Estados activos para unicidad:

```text id="tv9zks"
generated
published
closed
locked
```

Estados no activos:

```text id="ggglmi"
superseded
archived
```

---

## 11.2. AccountStatementLine

Índices:

```text id="jtnjv9"
tenant_id
account_statement_id
property_unit_id
billing_period_id
source_type, source_id
sort_order
```

Regla recomendada:

```text id="f2y2o5"
unique(account_statement_id, source_type, source_id, line_type) cuando sourceId no sea null
```

---

## 11.3. UnitBalance

Recomendado:

```text id="vrg5pg"
unique(tenant_id, property_unit_id, currency)
```

---

## 11.4. BalanceSnapshot

Índices:

```text id="nrjag7"
tenant_id
property_unit_id
billing_period_id
status
calculated_at
```

---

# 12. Repositorios

## 12.1. AccountStatementRepository

Contrato sugerido:

```text id="z7ov1a"
create(input)
findById(tenantId, statementId)
findActiveByUnitAndPeriod(tenantId, propertyUnitId, billingPeriodId)
list(tenantId, query)
markPublished(tenantId, statementId, actorId)
markClosed(tenantId, statementId, actorId, reason)
markLocked(tenantId, statementId, actorId, reason)
markSuperseded(tenantId, statementId, supersededById, reason)
existsActiveForUnitAndPeriod(tenantId, propertyUnitId, billingPeriodId)
```

---

## 12.2. AccountStatementLineRepository

Contrato sugerido:

```text id="xglgxo"
createMany(lines)
listByStatement(tenantId, statementId)
deleteDraftLines(tenantId, statementId)
archiveLines(tenantId, statementId, actorId, reason)
```

Nota:

```text id="edwajm"
No eliminar líneas de statements publicados/cerrados; solo archivar o superseder el statement completo.
```

---

## 12.3. UnitBalanceRepository

Contrato sugerido:

```text id="y5lgas"
upsertBalance(input)
findByUnit(tenantId, propertyUnitId)
listBalances(tenantId, query)
markStale(tenantId, propertyUnitId)
```

---

## 12.4. BalanceSnapshotRepository

Contrato sugerido:

```text id="q4t88f"
create(input)
findById(tenantId, snapshotId)
listByUnit(tenantId, propertyUnitId, query)
markSuperseded(tenantId, snapshotId)
markClosed(tenantId, snapshotId)
```

---

## 12.5. PropertyUnitReaderPort

Puerto hacia `003-residents-properties`.

Responsabilidad:

```text id="d0ye02"
findPropertyUnitById(tenantId, propertyUnitId)
listActivePropertyUnits(tenantId, query)
validatePropertyUnitBelongsToTenant(tenantId, propertyUnitId)
validatePropertyUnitIsActive(tenantId, propertyUnitId)
```

---

## 12.6. OwnResourceReaderPort

Puerto hacia `003-residents-properties`.

Responsabilidad:

```text id="evub70"
getOwnPropertyUnitIds(tenantId, userProfileId)
validateOwnPropertyUnit(tenantId, userProfileId, propertyUnitId)
```

Usado por:

```text id="kfqg0t"
accountStatements.read.own
accountStatements.export.own
balances.read.own
```

---

## 12.7. BillingPeriodReaderPort

Puerto hacia `004-dues-fees`.

Responsabilidad:

```text id="nj1nzw"
findBillingPeriodById(tenantId, billingPeriodId)
findBillingPeriodByCode(tenantId, periodCode)
validateBillingPeriodBelongsToTenant(tenantId, billingPeriodId)
getPreviousBillingPeriod(tenantId, billingPeriodId)
```

---

## 12.8. ChargeMovementReaderPort

Puerto hacia `004-dues-fees`.

Responsabilidad:

```text id="sg013t"
listChargesForUnitAndPeriod(tenantId, propertyUnitId, billingPeriodId)
listChargeAdjustmentsForUnitAndPeriod(tenantId, propertyUnitId, billingPeriodId)
listChargeReversalsForUnitAndPeriod(tenantId, propertyUnitId, billingPeriodId)
listOutstandingChargesByUnit(tenantId, propertyUnitId)
listOverdueChargesByUnit(tenantId, propertyUnitId, asOfDate)
```

Reglas:

* excluir cargos cancelados;
* excluir cargos reversados;
* incluir ajustes válidos;
* no duplicar movimientos.

---

## 12.9. PaymentMovementReaderPort

Puerto hacia `005-payments`.

Responsabilidad:

```text id="iwzwk4"
listPaymentAllocationsForUnitAndPeriod(tenantId, propertyUnitId, billingPeriodId)
listPaymentReversalsForUnitAndPeriod(tenantId, propertyUnitId, billingPeriodId)
listAllocationReversalsForUnitAndPeriod(tenantId, propertyUnitId, billingPeriodId)
listUnallocatedConfirmedPaymentsByUnit(tenantId, propertyUnitId)
sumActiveAllocationsByCharge(tenantId, chargeId)
sumUnallocatedPaymentsByUnit(tenantId, propertyUnitId)
```

Reglas:

* incluir solo pagos confirmados;
* incluir solo allocations activas;
* excluir pagos reversados;
* excluir allocations reversadas;
* no reducir saldo con pagos no asignados salvo política de saldo a favor.

---

# 13. Servicios de aplicación

## 13.1. MoneyService

Responsabilidad:

* operar Decimal;
* sumar débitos y créditos;
* calcular saldos;
* serializar como string;
* evitar float.

Métodos sugeridos:

```text id="h0yuua"
parse(amount, currency)
add(a, b)
subtract(a, b)
sum(amounts)
compare(a, b)
isPositive(amount)
isZero(amount)
toApiString(amount)
```

---

## 13.2. BalanceCalculatorService

Responsabilidad:

* calcular saldo actual;
* calcular saldo de periodo;
* distinguir saldo vencido y no vencido;
* calcular saldo a favor;
* excluir movimientos no válidos;
* producir resultado reconstruible.

Entrada conceptual:

```text id="l44q70"
charges
chargeAdjustments
chargeReversals
paymentAllocations
paymentReversals
allocationReversals
unallocatedPayments
openingBalance
asOfDate
```

Salida conceptual:

```text id="ziesxj"
outstandingBalance
overdueBalance
notDueBalance
creditBalance
closingBalance
movementTotals
```

---

## 13.3. StatementLineBuilderService

Responsabilidad:

* convertir movimientos en líneas;
* ordenar líneas;
* calcular balanceAfterLine;
* asignar debitAmount/creditAmount;
* referenciar sourceType/sourceId;
* crear líneas opening/closing.

Orden sugerido:

```text id="lge3kn"
1. openingBalance
2. charges by issuedDate/dueDate
3. charge adjustments
4. charge reversals
5. payment allocations
6. payment allocation reversals
7. payment reversals
8. creditBalance
9. closingBalance
```

---

## 13.4. StatementTotalsService

Responsabilidad:

* calcular totales;
* validar consistencia;
* asegurar que líneas cuadran con closingBalance;
* detectar diferencias.

Validación:

```text id="pkbswp"
openingBalance
+ chargesTotal
+ adjustmentsTotal
- paymentsTotal
+/- reversalsTotal
- creditBalance
= closingBalance
```

La fórmula exacta se cerrará en `data-model.md` según representación de crédito.

---

## 13.5. StatementNumberService

Responsabilidad:

* generar número único;
* normalizar tenant slug, period code y unit code;
* evitar duplicidad;
* soportar regeneración.

Formato MVP:

```text id="sv80hx"
ST-{tenantSlug}-{periodCode}-{unitCode}
```

Regeneración:

```text id="b4px54"
ST-{tenantSlug}-{periodCode}-{unitCode}-R{n}
```

---

## 13.6. StatementGenerationService

Responsabilidad:

* orquestar generación de un statement;
* validar unidad;
* validar periodo;
* obtener movimientos;
* construir líneas;
* calcular totales;
* crear statement;
* crear snapshot;
* auditar;
* emitir evento.

---

## 13.7. StatementBatchGenerationService

Responsabilidad:

* generar statements para múltiples unidades;
* controlar idempotencia por unidad/periodo;
* registrar conteos;
* manejar errores parciales;
* evitar duplicidad;
* soportar dry-run futuro.

Conteos sugeridos:

```text id="s4h2nn"
totalUnits
generatedCount
skippedCount
failedCount
supersededCount
```

---

## 13.8. BalanceSnapshotService

Responsabilidad:

* crear snapshots;
* cerrar snapshots;
* marcar snapshots como superseded;
* calcular sourceHash;
* comparar movimientos base contra snapshot.

---

## 13.9. StatementPublicationPolicyService

Responsabilidad:

* validar si un statement puede publicarse;
* impedir publicar draft inválido;
* impedir publicar superseded/archived;
* definir comportamiento para already published.

---

## 13.10. StatementRegenerationPolicyService

Responsabilidad:

* validar regeneración;
* exigir motivo;
* bloquear regeneración ordinaria de locked;
* marcar statement anterior como superseded;
* vincular nuevo statement.

---

## 13.11. StatementExportService

Responsabilidad:

* exportar statement;
* soportar JSON y CSV inicial;
* preparar extensión futura para PDF;
* evitar exportación cross-tenant;
* auditar exportación.

---

## 13.12. OwnAccountStatementPolicyService

Responsabilidad:

* validar unidad propia;
* validar statement propio;
* validar balance propio;
* validar movimientos propios;
* impedir acceso a statements ajenos.

---

# 14. Casos de uso principales

## 14.1. CalculateUnitBalanceUseCase

Responsabilidad:

* validar permiso `balances.read`;
* validar tenant activo;
* validar unidad del tenant;
* obtener movimientos base;
* calcular balance;
* devolver `UnitBalanceResponse`.

Uso:

```text id="qsuw60"
GET /api/v1/tenant/property-units/{propertyUnitId}/balance
```

---

## 14.2. RecalculateUnitBalanceUseCase

Responsabilidad:

* validar permiso `balances.recalculate`;
* recalcular desde movimientos base;
* actualizar `UnitBalance`;
* crear `BalanceSnapshot` opcional;
* auditar;
* emitir `UnitBalanceRecalculated`.

Uso:

```text id="d1mkqd"
POST /api/v1/tenant/property-units/{propertyUnitId}/balance/recalculate
```

---

## 14.3. ListBalancesUseCase

Responsabilidad:

* validar permiso `balances.read`;
* listar saldos por tenant;
* soportar filtros;
* paginar;
* no mezclar tenants.

Uso:

```text id="w1bagz"
GET /api/v1/tenant/balances
```

---

## 14.4. ListFinancialMovementsUseCase

Responsabilidad:

* validar permiso;
* listar movimientos base por unidad;
* mostrar cargos, pagos, ajustes y reversos;
* no duplicar;
* no modificar estado.

Uso:

```text id="eu15y8"
GET /api/v1/tenant/property-units/{propertyUnitId}/financial-movements
```

---

## 14.5. GenerateAccountStatementUseCase

Responsabilidad:

* validar permiso `accountStatements.generate`;
* validar tenant;
* validar periodo;
* validar unidad;
* manejar statement existente;
* calcular movimientos;
* crear statement;
* crear líneas;
* crear snapshot;
* auditar;
* emitir `AccountStatementGenerated`.

Uso:

```text id="v5updf"
POST /api/v1/tenant/account-statements/generate
```

---

## 14.6. GenerateAccountStatementsBatchUseCase

Responsabilidad:

* validar permiso `accountStatements.generate`;
* validar periodo;
* obtener unidades activas;
* generar statement por unidad;
* manejar errores parciales;
* evitar duplicidad;
* auditar batch;
* emitir `AccountStatementBatchGenerated`.

Uso:

```text id="cx6o14"
POST /api/v1/tenant/account-statements/generate-batch
```

---

## 14.7. GetAccountStatementUseCase

Responsabilidad:

* validar permiso `accountStatements.read`;
* consultar statement por tenant;
* incluir líneas;
* no exponer statement de otro tenant.

Uso:

```text id="ktzxes"
GET /api/v1/tenant/account-statements/{statementId}
```

---

## 14.8. ListAccountStatementsUseCase

Responsabilidad:

* validar permiso `accountStatements.read`;
* filtrar por unidad, periodo, estado;
* paginar;
* ordenar;
* no mezclar tenants.

Uso:

```text id="emd4e9"
GET /api/v1/tenant/account-statements
```

---

## 14.9. PublishAccountStatementUseCase

Responsabilidad:

* validar permiso `accountStatements.publish`;
* validar estado publicable;
* marcar como published;
* registrar actor y fecha;
* auditar;
* emitir `AccountStatementPublished`.

Uso:

```text id="uq5yuj"
POST /api/v1/tenant/account-statements/{statementId}/publish
```

---

## 14.10. CloseAccountStatementUseCase

Responsabilidad:

* validar permiso `accountStatements.close`;
* exigir motivo;
* marcar como closed;
* registrar actor y fecha;
* auditar;
* emitir `AccountStatementClosed`.

Uso:

```text id="rw2yiu"
POST /api/v1/tenant/account-statements/{statementId}/close
```

---

## 14.11. LockAccountStatementUseCase

Responsabilidad:

* validar permiso `accountStatements.lock`;
* exigir motivo;
* marcar como locked;
* auditar;
* emitir `AccountStatementLocked`.

Uso:

```text id="lw9ftj"
POST /api/v1/tenant/account-statements/{statementId}/lock
```

---

## 14.12. RegenerateAccountStatementUseCase

Responsabilidad:

* validar permiso `accountStatements.regenerate`;
* exigir motivo;
* validar política de regeneración;
* marcar statement anterior como superseded;
* generar nuevo statement;
* vincular previousStatementId;
* auditar;
* emitir `AccountStatementRegenerated`.

Uso:

```text id="dze021"
POST /api/v1/tenant/account-statements/{statementId}/regenerate
```

---

## 14.13. ExportAccountStatementUseCase

Responsabilidad:

* validar permiso `accountStatements.export`;
* validar statement del tenant;
* exportar JSON o CSV;
* auditar exportación;
* no exponer datos de otro tenant.

Uso:

```text id="u2apyk"
GET /api/v1/tenant/account-statements/{statementId}/export
```

---

## 14.14. GetMyAccountStatementsUseCase

Responsabilidad:

* validar permiso `accountStatements.read.own`;
* resolver unidades propias;
* listar statements publicados;
* no devolver statements ajenos.

Uso:

```text id="jxi0gz"
GET /api/v1/me/account-statements
```

---

## 14.15. GetMyAccountStatementUseCase

Responsabilidad:

* validar permiso `accountStatements.read.own`;
* validar statement propio;
* validar que esté publicado o visible según política;
* devolver detalle sin auditoría interna.

Uso:

```text id="mxdfg8"
GET /api/v1/me/account-statements/{statementId}
```

---

## 14.16. GetMyPropertyUnitBalanceUseCase

Responsabilidad:

* validar permiso `balances.read.own`;
* validar unidad propia;
* devolver balance propio si política del tenant lo permite.

Uso:

```text id="rdhjnz"
GET /api/v1/me/property-units/{propertyUnitId}/balance
```

---

## 14.17. GetMyFinancialMovementsUseCase

Responsabilidad:

* validar permiso `balances.read.own` o permiso específico futuro;
* validar unidad propia;
* devolver movimientos visibles al usuario;
* no exponer auditoría interna.

Uso:

```text id="v79ec5"
GET /api/v1/me/property-units/{propertyUnitId}/financial-movements
```

---

## 14.18. ExportMyAccountStatementUseCase

Responsabilidad:

* validar permiso `accountStatements.export.own`;
* validar statement propio;
* exportar JSON/CSV inicial;
* auditar si corresponde.

Uso:

```text id="gs742v"
GET /api/v1/me/account-statements/{statementId}/export
```

---

# 15. Controladores REST

## 15.1. AccountStatementsController

Ruta base:

```text id="fih3a5"
/api/v1/tenant/account-statements
```

Endpoints:

```text id="n9426t"
GET    /
POST   /generate
POST   /generate-batch
GET    /:statementId
POST   /:statementId/publish
POST   /:statementId/close
POST   /:statementId/lock
POST   /:statementId/regenerate
GET    /:statementId/export
```

---

## 15.2. BalancesController

Rutas:

```text id="kkx5pr"
/api/v1/tenant/balances
/api/v1/tenant/property-units/:propertyUnitId/balance
/api/v1/tenant/property-units/:propertyUnitId/financial-movements
```

Endpoints:

```text id="z6p6un"
GET    /api/v1/tenant/balances
GET    /api/v1/tenant/property-units/:propertyUnitId/balance
POST   /api/v1/tenant/property-units/:propertyUnitId/balance/recalculate
GET    /api/v1/tenant/property-units/:propertyUnitId/financial-movements
```

---

## 15.3. OwnAccountStatementsController

Ruta base:

```text id="gr28zj"
/api/v1/me
```

Endpoints:

```text id="ubd71x"
GET    /account-statements
GET    /account-statements/:statementId
GET    /property-units/:propertyUnitId/balance
GET    /property-units/:propertyUnitId/financial-movements
GET    /account-statements/:statementId/export
```

---

# 16. DTOs principales

## 16.1. GenerateAccountStatementDto

Campos:

```text id="j9k8nt"
propertyUnitId
billingPeriodId
mode
reason opcional
```

`mode` sugerido:

```text id="o0exoo"
create
regenerateIfExists
failIfExists
```

Validaciones:

* `propertyUnitId` requerido;
* `billingPeriodId` requerido;
* unidad pertenece al tenant;
* periodo pertenece al tenant;
* no aceptar `tenantId`;
* reason requerido si se regenera.

---

## 16.2. GenerateAccountStatementsBatchDto

Campos:

```text id="gt6k94"
billingPeriodId
propertyUnitIds opcional
mode
dryRun opcional
reason opcional
```

Reglas:

* si `propertyUnitIds` no se envía, generar para todas las unidades activas;
* si se envía, validar todas las unidades;
* `dryRun` simula sin persistir;
* reason requerido para regeneraciones.

---

## 16.3. PublishAccountStatementDto

Campos:

```text id="jga591"
notes opcional
```

---

## 16.4. CloseAccountStatementDto

Campos:

```text id="dy7dsd"
reason
```

Validaciones:

* motivo requerido;
* longitud máxima;
* statement cerrable.

---

## 16.5. LockAccountStatementDto

Campos:

```text id="w1n91d"
reason
```

Validaciones:

* motivo requerido;
* statement bloqueable;
* actor autorizado.

---

## 16.6. RegenerateAccountStatementDto

Campos:

```text id="vuve2p"
reason
mode
```

Validaciones:

* motivo requerido;
* statement regenerable;
* si locked, permiso especial o bloqueo.

---

## 16.7. ListAccountStatementsQueryDto

Filtros:

```text id="gjm6a4"
propertyUnitId
billingPeriodId
status
periodCode
page
pageSize
sortBy
sortOrder
```

---

## 16.8. ListBalancesQueryDto

Filtros:

```text id="gy2jxo"
propertyUnitId
hasDebt
hasCredit
overdueOnly
minOutstandingBalance
page
pageSize
sortBy
sortOrder
```

---

## 16.9. FinancialMovementsQueryDto

Filtros:

```text id="zhmtn3"
billingPeriodId
dateFrom
dateTo
sourceType
includeReversed
page
pageSize
```

---

## 16.10. AccountStatementResponseDto

Campos:

```text id="fo7zh8"
id
propertyUnit
billingPeriod
statementNumber
status
currency
openingBalance
chargesTotal
adjustmentsTotal
paymentsTotal
reversalsTotal
creditBalance
closingBalance
overdueBalance
notDueBalance
generatedAt
publishedAt
closedAt
lockedAt
lines
createdAt
updatedAt
```

Todos los montos deben salir como string decimal.

---

# 17. Autenticación y autorización

## 17.1. Endpoints administrativos

Todos los endpoints `/api/v1/tenant/*` requieren:

```text id="qdupnv"
AuthGuard
TenantGuard
TenantPermissionGuard
```

---

## 17.2. Endpoints propios

Todos los endpoints `/api/v1/me/*` requieren:

```text id="tn4tmb"
AuthGuard
TenantGuard
TenantPermissionGuard o PolicyGuard
OwnAccountStatementPolicyService
```

---

## 17.3. Permisos administrativos

```text id="hj3x19"
accountStatements.generate
accountStatements.read
accountStatements.publish
accountStatements.close
accountStatements.lock
accountStatements.regenerate
accountStatements.export
balances.read
balances.recalculate
accountStatements.audit.read
accountStatements.reports.read
```

---

## 17.4. Permisos propios

```text id="hxa4xx"
accountStatements.read.own
accountStatements.export.own
balances.read.own
```

---

## 17.5. Separación de funciones

No asumir que un permiso incluye otro.

Ejemplos:

```text id="bug3ub"
accountStatements.read ≠ accountStatements.generate
accountStatements.generate ≠ accountStatements.publish
accountStatements.publish ≠ accountStatements.close
accountStatements.close ≠ accountStatements.regenerate
balances.read ≠ balances.recalculate
accountStatements.read.own ≠ accountStatements.export.own
```

---

# 18. Auditoría

## 18.1. Puerto

Crear:

```text id="h494hi"
AccountStatementsAuditPort
```

Responsabilidad:

* registrar generación;
* registrar batch generation;
* registrar publicación;
* registrar cierre;
* registrar bloqueo;
* registrar regeneración;
* registrar exportación;
* registrar consulta sensible;
* registrar recálculo de balance;
* registrar creación de snapshot.

---

## 18.2. Eventos auditables

```text id="yk662c"
accountStatement.generated
accountStatement.batchGenerated
accountStatement.published
accountStatement.closed
accountStatement.locked
accountStatement.regenerated
accountStatement.exported
accountStatement.viewedSensitive
balance.calculated
balance.recalculated
balance.snapshotCreated
financialMovements.viewed
```

---

## 18.3. Campos mínimos

```text id="vz276w"
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

```text id="t26d4j"
propertyUnitId
billingPeriodId
statementId
openingBalance
closingBalance
outstandingBalance
creditBalance
reason
```

---

## 18.5. Datos prohibidos en auditoría

No registrar:

```text id="lmk28q"
payload completo
tokens
headers de autenticación
datos personales innecesarios
comprobantes completos
documentos exportados completos
stack traces
secrets
```

---

# 19. Eventos de dominio

Eventos mínimos:

```text id="s1upvi"
AccountStatementGenerated
AccountStatementBatchGenerated
AccountStatementPublished
AccountStatementClosed
AccountStatementLocked
AccountStatementRegenerated
AccountStatementSuperseded
AccountStatementExported
UnitBalanceCalculated
UnitBalanceRecalculated
BalanceSnapshotCreated
FinancialMovementsViewed
```

Implementación inicial:

* eventos internos;
* sin broker externo obligatorio;
* compatible con outbox futuro.

Reglas:

* incluir `tenantId`;
* incluir `actorUserId` si aplica;
* incluir `traceId`;
* incluir `propertyUnitId`;
* incluir `billingPeriodId` si aplica;
* no incluir payload financiero completo;
* no incluir datos personales innecesarios.

---

# 20. Observabilidad

## 20.1. Logs

Registrar:

```text id="r6bhy5"
statement generated
statement batch generated
statement published
statement closed
statement locked
statement regenerated
statement exported
balance calculated
balance recalculated
own statement access denied
cross-tenant statement access attempt
financial movement viewed
```

No registrar:

```text id="uvf1x8"
Authorization header
access token
payload completo
datos personales de propietarios/residentes
export completo
comprobantes
stack trace en producción
```

---

## 20.2. Métricas sugeridas

```text id="a6dp1s"
account_statements_generated_total
account_statements_batch_generated_total
account_statements_published_total
account_statements_closed_total
account_statements_locked_total
account_statements_regenerated_total
account_statements_exported_total
unit_balances_calculated_total
unit_balances_recalculated_total
balance_snapshots_created_total
financial_movements_viewed_total
account_statement_authorization_denied_total
own_account_statement_access_denied_total
account_statement_generation_failures_total
```

---

## 20.3. Trace

Todo flujo financiero crítico debe incluir:

```text id="wo70lw"
traceId
```

Especialmente:

* generación;
* batch generation;
* publicación;
* cierre;
* bloqueo;
* regeneración;
* exportación;
* recálculo de balance;
* consulta propia;
* intento cross-tenant.

---

# 21. Seguridad

Controles obligatorios:

* `tenantId` obligatorio;
* `propertyUnitId` obligatorio;
* tenant activo;
* membership activa;
* permiso financiero específico;
* validación de unidad del tenant;
* validación de periodo del tenant;
* validación de movimientos fuente;
* validación de unidad propia para `.own`;
* Decimal;
* source references por línea;
* no eliminación física;
* regeneración con motivo;
* snapshots versionados;
* auditoría financiera;
* eventos sanitizados;
* logs sanitizados;
* tests de reconstrucción;
* tests multitenant;
* tests de autorización.

Riesgos críticos:

| Riesgo                           | Mitigación                                     |
| -------------------------------- | ---------------------------------------------- |
| Saldo incorrecto                 | BalanceCalculator + financial regression tests |
| Statement cross-tenant           | tenant validation + MT tests                   |
| Usuario ve statement ajeno       | OwnAccountStatementPolicyService               |
| Snapshot contradice movimientos  | sourceHash + reconstruction tests              |
| Duplicar líneas                  | source uniqueness + tests                      |
| Usar float                       | Money VO + Decimal                             |
| Publicar statement inválido      | publication policy                             |
| Regenerar sin auditoría          | regeneration policy + audit                    |
| Exportar masivamente sin permiso | export permission + rate limit                 |
| Omitir pago reversado            | payment movement reader tests                  |
| Incluir cargo cancelado          | charge movement reader tests                   |

---

# 22. Migración

## 22.1. Nombre sugerido

```text id="qsdqdl"
006_create_account_statements
```

---

## 22.2. Tablas

```text id="x6xn7q"
account_statements
account_statement_lines
unit_balances
balance_snapshots
```

---

## 22.3. Enums

```text id="d9udz2"
AccountStatementStatus
AccountStatementLineType
BalanceSnapshotStatus
BalanceSide
SourceType
CurrencyCode reutilizado
```

---

## 22.4. Reglas de migración

* `tenant_id` obligatorio;
* `property_unit_id` obligatorio;
* `billing_period_id` obligatorio en statements;
* montos `Decimal`;
* `currency` requerido;
* statement number único por tenant;
* relaciones `onDelete: Restrict`;
* no cascade delete peligroso;
* índices por tenant, unidad, periodo y estado;
* constraints de montos;
* revisión manual de SQL;
* no crear saldos reales en seeds.

---

# 23. Seeds

Seeds sugeridos:

```text id="t48xb3"
account statement generated demo
account statement published demo
account statement closed demo
account statement lines demo
unit balance demo
balance snapshot demo
```

Reusar:

```text id="n9xuro"
tenant demo
property units demo
billing periods demo
charges demo de 004
payments demo de 005
users demo de 002
own relationships de 003
```

No usar:

```text id="kl3eu1"
saldos reales
estados reales
datos reales de propietarios
datos reales de residentes
comprobantes reales
referencias bancarias reales
```

Usar:

```text id="iqx2dd"
USD
50.00
100.00
periodo 2026-07
tenant demo
unidades demo
cargos demo
pagos demo
```

---

# 24. Testing plan resumido

El documento completo será:

```text id="h08ykk"
docs/specs/006-account-statements/test-plan.md
```

## 24.1. Unit tests

* Money;
* AccountStatementStatus;
* AccountStatementLineType;
* BalanceCalculator;
* StatementLineBuilder;
* StatementTotalsService;
* AccountStatement entity;
* AccountStatementLine entity;
* UnitBalance entity;
* BalanceSnapshot entity.

---

## 24.2. Integration tests

* migración;
* repositorios;
* generación de statement;
* generación batch;
* creación de líneas;
* snapshots;
* regeneración;
* superseded;
* source references;
* constraints.

---

## 24.3. API tests

* Account Statements API;
* Balances API;
* Own Account Statements API;
* exportación básica.

---

## 24.4. Authorization tests

* sin token;
* sin permiso;
* sin membership;
* tenant suspendido;
* usuario disabled;
* auditor solo lectura;
* propietario sin `.own`;
* usuario sin relación con unidad.

---

## 24.5. Multitenancy tests

* Tenant A no ve statements de Tenant B;
* Tenant A no consulta balance de Tenant B;
* Tenant A no genera statement de unidad de Tenant B;
* Tenant A no exporta statement de Tenant B;
* `.own` no devuelve statements ajenos.

---

## 24.6. Financial regression tests

* saldo inicial;
* cargos aumentan saldo;
* pagos asignados reducen saldo;
* cargos cancelados no suman;
* cargos reversados no suman;
* pagos reversados no reducen;
* allocations reversadas no reducen;
* pagos no asignados se tratan como crédito según política;
* statement reconstruible;
* batch idempotente;
* Decimal exacto.

---

# 25. Orden recomendado de desarrollo

## Fase 1 — Documentación

```text id="hv76t9"
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

```text id="xi4vhq"
1. Crear módulo account-statements.
2. Crear controladores base.
3. Crear value objects.
4. Crear entidades.
5. Crear errores.
6. Crear eventos.
7. Crear DTOs.
```

---

## Fase 3 — Persistencia

```text id="epacfx"
1. Crear modelos Prisma.
2. Crear migración.
3. Crear constraints.
4. Crear repositorios.
5. Crear mappers.
6. Crear seeds demo.
7. Crear migration tests.
```

---

## Fase 4 — Puertos e integración interna

```text id="gglxh4"
1. PropertyUnitReaderPort.
2. OwnResourceReaderPort.
3. BillingPeriodReaderPort.
4. ChargeMovementReaderPort.
5. PaymentMovementReaderPort.
6. AccountStatementsAuditPort.
7. AccountStatementsEventsPort.
```

---

## Fase 5 — Servicios y policies

```text id="d9uyfe"
1. MoneyService.
2. BalanceCalculatorService.
3. StatementLineBuilderService.
4. StatementTotalsService.
5. StatementNumberService.
6. StatementGenerationService.
7. StatementBatchGenerationService.
8. BalanceSnapshotService.
9. StatementPublicationPolicyService.
10. StatementRegenerationPolicyService.
11. StatementExportService.
12. OwnAccountStatementPolicyService.
```

---

## Fase 6 — Casos de uso

```text id="df7n8t"
1. Balance actual.
2. Movimientos financieros.
3. Generación individual.
4. Generación batch.
5. Consulta administrativa.
6. Publicación.
7. Cierre.
8. Bloqueo.
9. Regeneración.
10. Exportación.
11. Consulta propia.
12. Exportación propia.
```

---

## Fase 7 — API y autorización

```text id="sgjkvr"
1. AccountStatementsController.
2. BalancesController.
3. OwnAccountStatementsController.
4. Guards.
5. Policies.
6. OpenAPI.
```

---

## Fase 8 — Auditoría, eventos y pruebas

```text id="ha1omf"
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
11. Security tests.
12. OpenAPI tests.
```

---

# 26. Criterios técnicos de aceptación

La implementación técnica se acepta si:

* módulo NestJS creado;
* modelos Prisma creados;
* migración aplicada;
* `tenantId` obligatorio;
* `propertyUnitId` obligatorio;
* `billingPeriodId` obligatorio para statements de periodo;
* dinero modelado con Decimal;
* balance actual por unidad funciona;
* movimientos financieros por unidad funcionan;
* generación individual funciona;
* generación batch funciona;
* líneas de statement se crean con source references;
* publication funciona;
* close funciona;
* lock funciona;
* regeneration funciona;
* statement anterior queda superseded;
* snapshots se crean;
* balance se recalcula;
* consulta administrativa funciona;
* consulta propia funciona;
* exportación básica funciona;
* no existe acceso cross-tenant;
* no se usa float;
* no se elimina físicamente ningún statement publicado/cerrado;
* statements son reconstruibles desde movimientos base;
* auditoría financiera funciona;
* eventos se emiten;
* OpenAPI actualizado;
* pruebas unitarias pasan;
* pruebas de integración pasan;
* pruebas API pasan;
* pruebas de autorización pasan;
* pruebas multitenant pasan;
* pruebas financieras pasan;
* pruebas de seguridad pasan;
* CI pasa.

---

# 27. Comandos esperados

Comandos generales:

```bash id="oh1kve"
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

```bash id="ezyf5v"
npm run test:account-statements
npm run test:account-statements:unit
npm run test:account-statements:integration
npm run test:account-statements:api
npm run test:account-statements:authorization
npm run test:account-statements:multitenancy
npm run test:account-statements:financial
npm run test:account-statements:security
```

---

# 28. Riesgos de implementación

| Riesgo                                    | Impacto | Mitigación                               |
| ----------------------------------------- | ------- | ---------------------------------------- |
| Saldo incorrecto                          | Crítico | BalanceCalculator + regression tests     |
| Statement no reconstruible                | Crítico | source references + reconstruction tests |
| Incluir cargo cancelado                   | Alto    | ChargeMovementReaderPort                 |
| Incluir pago reversado                    | Alto    | PaymentMovementReaderPort                |
| Duplicar línea de movimiento              | Alto    | unique source + tests                    |
| Snapshot contradice movimientos           | Crítico | sourceHash + regeneration policy         |
| Cross-tenant statement                    | Crítico | tenant validation + MT tests             |
| Usuario ve estado ajeno                   | Alto    | OwnAccountStatementPolicyService         |
| Usar float                                | Alto    | Money VO + Decimal                       |
| Publicar statement incorrecto             | Alto    | publication policy + validation          |
| Regenerar sin motivo                      | Alto    | regeneration policy + audit              |
| Exportar sin permiso                      | Alto    | export permission + audit                |
| Implementar mora fuera de alcance         | Medio   | SDD review                               |
| Implementar PDF avanzado fuera de alcance | Medio   | SDD review                               |

---

# 29. Checklist para agentes IA

Antes de generar código para este módulo, el agente debe leer:

```text id="ksv4e6"
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
docs/specs/001-tenants/spec.md
docs/specs/002-users-roles/spec.md
docs/specs/003-residents-properties/spec.md
docs/specs/004-dues-fees/spec.md
docs/specs/005-payments/spec.md
docs/specs/006-account-statements/spec.md
docs/specs/006-account-statements/plan.md
```

El agente no debe:

* crear estados sin tenant;
* crear estados sin unidad;
* crear estados sin periodo cuando sean de periodo;
* calcular dinero con float;
* crear snapshots que no puedan reconstruirse;
* crear líneas sin source reference cuando provienen de movimientos;
* incluir cargos cancelados o reversados como deuda;
* incluir pagos reversados como abonos;
* incluir allocations reversadas como abonos;
* permitir consulta cross-tenant;
* permitir consulta `.own` de unidades ajenas;
* publicar statements inválidos;
* regenerar statements sin motivo;
* eliminar statements publicados/cerrados;
* implementar mora avanzada;
* implementar cobranza;
* implementar conciliación bancaria;
* implementar facturación electrónica;
* implementar PDF avanzado si no está especificado;
* omitir auditoría financiera;
* omitir pruebas financieras.

---

# 30. Estrategia de entrega

## Incremento 1 — Balance actual

* UnitBalance.
* BalanceCalculatorService.
* ChargeMovementReaderPort.
* PaymentMovementReaderPort.
* `GET /tenant/property-units/{propertyUnitId}/balance`.
* `GET /me/property-units/{propertyUnitId}/balance`.

---

## Incremento 2 — Movimientos financieros

* FinancialMovement DTO.
* ListFinancialMovementsUseCase.
* Líneas calculadas desde cargos y pagos.
* Validación de reversos.
* Pruebas de reconstrucción.

---

## Incremento 3 — Generación individual de statement

* AccountStatement.
* AccountStatementLine.
* StatementLineBuilderService.
* StatementTotalsService.
* GenerateAccountStatementUseCase.
* Snapshot inicial.

---

## Incremento 4 — Batch generation

* GenerateAccountStatementsBatchUseCase.
* Conteos.
* Manejo de errores parciales.
* Idempotencia por unidad/periodo.
* Pruebas batch.

---

## Incremento 5 — Publicación, cierre y bloqueo

* Publish.
* Close.
* Lock.
* Policies.
* Auditoría.
* Eventos.

---

## Incremento 6 — Consulta propia y exportación

* Own endpoints.
* Export JSON/CSV.
* Own export.
* Seguridad y pruebas.

---

## Incremento 7 — Regeneración y hardening

* Regeneration.
* Superseded statements.
* SourceHash.
* Financial regression completa.
* OpenAPI final.
* CI gates.

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
* unicidad lógica;
* source references;
* sourceHash;
* snapshots;
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
* filtros;
* paginación;
* generación individual;
* generación batch;
* publicación;
* cierre;
* bloqueo;
* regeneración;
* balances;
* movimientos;
* endpoints propios;
* exportación.

---

## 31.3. `test-plan.md`

Debe detallar:

* unit tests;
* integration tests;
* API tests;
* authorization tests;
* own access tests;
* multitenancy tests;
* balance reconstruction tests;
* snapshot consistency tests;
* financial regression tests;
* export security tests.

---

## 31.4. `tasks.md`

Debe convertir este plan en tareas ejecutables.

---

## 31.5. `security-notes.md`

Debe detallar:

* riesgos de saldos incorrectos;
* protección de estados;
* acceso propio;
* exportación segura;
* reconstruibilidad;
* snapshots;
* auditoría;
* logs;
* pruebas de seguridad.

---

# 32. Decisión final de implementación

El módulo `006-account-statements` se implementará como módulo interno de NestJS dentro del monolito modular.

Usará PostgreSQL y Prisma.

Todo estado tendrá `tenantId`.

Todo estado estará asociado a `PropertyUnit`.

Todo statement de periodo estará asociado a `BillingPeriod`.

Todo monto se almacenará y calculará con Decimal.

Las líneas de estado de cuenta serán materializadas al generar un statement.

Cada línea financiera tendrá referencia a su movimiento fuente mediante `sourceType` y `sourceId`.

El balance podrá calcularse desde movimientos base y podrá materializarse en `unit_balances` para consulta rápida.

Los snapshots de balance se usarán para publicación, cierre y auditoría, pero no reemplazarán movimientos base.

La generación por periodo/unidad será idempotente o se gestionará mediante regeneración controlada.

Los usuarios `.own` solo podrán ver statements y balances de unidades propias.

Los statements publicados, cerrados o bloqueados no se eliminarán físicamente.

La regeneración requiere motivo y deja el statement anterior como `superseded`.

La prioridad técnica será:

```text id="s6tjjz"
reconstruibilidad financiera
precisión monetaria
multitenancy
trazabilidad de líneas
auditoría
seguridad de acceso propio
snapshots controlados
exportación segura
compatibilidad con mora
compatibilidad con cobranza
compatibilidad con reportes financieros
```

Este módulo debe completarse antes de implementar mora, cobranza automatizada, notificaciones de saldo, reportes financieros avanzados o conciliación bancaria.
