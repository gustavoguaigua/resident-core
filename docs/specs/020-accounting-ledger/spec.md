# Functional Specification — Spec 020 Accounting Ledger

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                                                                                                       |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                                                                                                               |
| Spec ID         | 020                                                                                                                                                                                                                                                         |
| Módulo          | Accounting Ledger                                                                                                                                                                                                                                           |
| Documento       | Functional Specification                                                                                                                                                                                                                                    |
| Ruta            | `docs/specs/020-accounting-ledger/spec.md`                                                                                                                                                                                                                  |
| Versión         | 0.1                                                                                                                                                                                                                                                         |
| Estado          | needs-review                                                                                                                                                                                                                                                |
| Fecha           | 2026-07-23                                                                                                                                                                                                                                                  |
| Depende de      | `001-tenants`, `002-users-roles`, `004-dues-fees`, `005-payments`, `006-account-statements`, `007-audit`, `008-basic-reports`, `016-secure-document-storage`, `017-bank-reconciliation`, `018-payment-provider-integration`, `019-open-banking-integration` |
| Relacionado con | contabilidad, partida doble, plan de cuentas, libro diario, libro mayor, asientos contables, periodos contables, cierres, balances, trazabilidad financiera                                                                                                 |
| API Style       | REST                                                                                                                                                                                                                                                        |
| Naturaleza      | Tenant-scoped / Double-entry / Source-linked / Posting-driven / Period-aware / Immutable-after-posting / Audit-heavy / Report-ready / Non-public                                                                                                            |

---

## 2. Propósito

El módulo `020-accounting-ledger` define la base contable interna de RESIDENT Core.

Su propósito es registrar, organizar y reportar los efectos contables derivados de los procesos financieros del sistema, mediante un ledger de partida doble, tenant-scoped, auditable, trazable, consistente y preparado para cierres contables.

El módulo debe permitir que cada conjunto residencial tenga:

```text
- política contable básica;
- plan de cuentas;
- cuentas contables;
- periodos contables;
- reglas de mapeo contable;
- asientos contables;
- líneas de asiento;
- vínculos con eventos fuente;
- balances por cuenta;
- libro diario;
- libro mayor;
- balance de comprobación;
- reportes contables básicos;
- cierres y bloqueos de periodo;
- reversos auditados.
```

Regla central:

```text
Todo asiento contable de RESIDENT Core debe pertenecer a un tenant, estar vinculado a una fuente trazable o a una justificación manual autorizada, cumplir partida doble, usar Decimal, respetar periodos contables, impedir modificación directa una vez contabilizado, permitir reversos auditados, no crear pagos ni movimientos bancarios por sí mismo, no reemplazar la conciliación bancaria ni los estados de cuenta operativos, y no exponer información contable en endpoints públicos.
```

---

## 3. Contexto dentro de RESIDENT Core

Hasta este punto, RESIDENT Core ya contempla:

```text
004-dues-fees
  └── generación de cargos, ajustes y reversos

005-payments
  └── pagos, comprobantes, validación, asignación y reversos

006-account-statements
  └── estados de cuenta operativos derivados de cargos y pagos

017-bank-reconciliation
  └── cuentas bancarias, movimientos bancarios y conciliación

018-payment-provider-integration
  └── pagos en línea, transacciones de proveedor y settlements

019-open-banking-integration
  └── sincronización bancaria autorizada read-only
```

`020-accounting-ledger` agrega una capa contable formal.

Relación conceptual:

```text
Financial Source Events
  ├── Charge issued
  ├── Charge adjusted
  ├── Charge reversed
  ├── Payment validated
  ├── Payment allocated
  ├── Payment reversed
  ├── Bank transaction reconciled
  ├── Provider settlement reviewed
  └── Manual accounting adjustment

        ↓

Accounting Mapping Rules

        ↓

Journal Entry
  ├── Debit line
  └── Credit line

        ↓

General Ledger
  ├── Account balances
  ├── Trial balance
  ├── Income/expense reports
  └── Period closing
```

Este módulo no reemplaza a `Payments`, `Account Statements` ni `Bank Reconciliation`.

---

## 4. Problema que resuelve

Sin un módulo contable formal, RESIDENT puede controlar cargos, pagos y estados de cuenta operativos, pero no necesariamente produce una estructura contable organizada.

Problemas actuales que resuelve:

```text
- ausencia de plan de cuentas por conjunto;
- falta de libro diario;
- falta de libro mayor;
- falta de asientos contables trazables;
- dificultad para generar balance de comprobación;
- dificultad para separar ingresos, gastos, activos, pasivos y patrimonio;
- dificultad para cerrar periodos;
- riesgo de reportes financieros inconsistentes;
- ausencia de reversos contables formales;
- ausencia de mapeo explícito desde eventos financieros a cuentas contables;
- dificultad para preparar una futura contabilidad completa.
```

El módulo permite que los eventos financieros del sistema generen una representación contable coherente.

---

## 5. Objetivo funcional

El sistema debe permitir:

```text
- configurar política contable por tenant;
- crear plan de cuentas por tenant;
- crear cuentas contables;
- clasificar cuentas por tipo y naturaleza;
- definir cuentas de control;
- definir periodos contables;
- abrir, bloquear, cerrar y reabrir periodos bajo permisos;
- definir reglas de mapeo contable desde eventos fuente;
- generar asientos contables desde eventos financieros;
- crear asientos manuales autorizados;
- validar partida doble;
- contabilizar asientos;
- impedir edición de asientos contabilizados;
- reversar asientos contabilizados;
- consultar libro diario;
- consultar libro mayor;
- consultar balances por cuenta;
- generar balance de comprobación;
- generar reportes contables básicos;
- exportar reportes mediante Secure Document Storage;
- auditar operaciones críticas;
- mantener integración con Payments, Charges, Bank Reconciliation y Reports.
```

---

## 6. Alcance incluido en MVP

El MVP de `Accounting Ledger` debe implementar una base contable interna, no una solución tributaria completa.

Incluye:

```text
1. AccountingPolicy por tenant.
2. ChartOfAccounts por tenant.
3. AccountingAccount por tenant.
4. AccountingPeriod mensual/anual básico.
5. JournalEntry.
6. JournalEntryLine.
7. AccountingSourceEventLink.
8. AccountingMappingRule.
9. AccountingBalanceSnapshot básico.
10. AccountingClosingRun básico.
11. Plantilla inicial de plan de cuentas.
12. Cuentas contables activas/inactivas/archivadas.
13. Tipos de cuenta: asset, liability, equity, income, expense.
14. Naturaleza normal debit/credit.
15. Cuentas de control protegidas.
16. Asientos draft.
17. Asientos posted.
18. Asientos reversed.
19. Reversos auditados.
20. Validación debit = credit.
21. Decimal money.
22. USD como moneda MVP.
23. Mapeo desde cargos emitidos.
24. Mapeo desde pagos validados/asignados.
25. Mapeo desde reversos de pago.
26. Mapeo desde ajustes/reversos de cargos.
27. Mapeo desde conciliaciones bancarias confirmadas cuando aplique.
28. Mapeo desde liquidaciones de proveedor cuando estén revisadas.
29. Asientos manuales autorizados.
30. Libro diario.
31. Libro mayor.
32. Balance de comprobación.
33. Reporte de ingresos y gastos básico.
34. Balance general básico.
35. Cierre de periodo básico.
36. Bloqueo de contabilización en periodos cerrados.
37. Export de reportes vía Secure Document Storage.
38. Auditoría completa.
39. Logs seguros.
40. Métricas seguras.
41. API privada tenant.
42. Sin endpoints públicos.
43. Sin acceso contable desde WordPress.
44. Sin IA externa con datos contables reales.
```

---

## 7. Fuera de alcance del MVP

No implementar en esta spec:

```text
- contabilidad tributaria completa;
- declaración de impuestos;
- integración SRI;
- facturación electrónica;
- retenciones;
- anexos tributarios;
- asientos automáticos fiscales;
- nómina;
- depreciación automática de activos;
- amortizaciones avanzadas;
- presupuestos contables avanzados;
- centros de costo avanzados;
- proyectos contables avanzados;
- contabilidad multi-moneda;
- consolidación multi-tenant;
- contabilidad intercompañía;
- estados financieros certificados;
- firma electrónica de libros;
- cierre fiscal legal;
- auditoría externa formal;
- reglas contables avanzadas parametrizadas por normativa;
- automatización contable con IA;
- generación automática irreversible de asientos desde movimientos bancarios no conciliados;
- reemplazo de Account Statements;
- reemplazo de Bank Reconciliation;
- movimiento real de dinero;
- supplier payments completo;
- accounts payable completo;
- accounts receivable avanzado fuera de cargos internos;
- inventarios;
- activos fijos;
- conciliación contable avanzada.
```

---

## 8. Principios de diseño

### 8.1. Partida doble obligatoria

Todo asiento contabilizado debe cumplir:

```text
totalDebit = totalCredit
```

Regla:

```text
Ningún JournalEntry puede pasar a posted si sus líneas no cuadran exactamente.
```

---

### 8.2. Tenant isolation

Toda política, cuenta, periodo, asiento, línea, regla, balance y cierre contable debe pertenecer a un tenant.

Excepción:

```text
Las plantillas globales de plan de cuentas pueden ser platform-scoped, pero las cuentas operativas siempre son tenant-scoped.
```

---

### 8.3. Ledger no reemplaza módulos fuente

El ledger registra efectos contables. No valida por sí mismo la existencia operacional de pagos, cargos o conciliaciones.

```text
Payments valida pagos.
Account Statements refleja saldos operativos.
Bank Reconciliation confirma conciliaciones.
Accounting Ledger registra representación contable.
```

---

### 8.4. Source-linked accounting

Los asientos automáticos deben vincularse a eventos fuente.

Ejemplos:

```text
charge.issued
charge.adjusted
payment.validated
payment.allocated
payment.reversed
bankTransaction.reconciled
providerSettlement.reviewed
manualAdjustment.approved
```

---

### 8.5. Idempotencia obligatoria

Un mismo evento fuente no debe generar asientos duplicados.

Regla:

```text
tenantId + sourceModule + sourceResourceType + sourceResourceId + sourceEventType
debe mapear como máximo a un asiento posted activo, salvo casos explícitos de reverso o corrección.
```

---

### 8.6. Inmutabilidad después de contabilizar

Un asiento `posted` no se edita.

Corrección permitida:

```text
JournalEntry posted
  -> reversal JournalEntry
  -> new correcting JournalEntry si aplica
```

---

### 8.7. Period-aware

Todo asiento pertenece a un periodo contable.

Regla:

```text
No se permite contabilizar en un periodo closed o locked sin flujo formal de reapertura.
```

---

### 8.8. Control accounts protegidas

Las cuentas de control no deben recibir movimientos manuales ordinarios sin permiso especial.

Ejemplos:

```text
- cuentas por cobrar;
- bancos;
- caja;
- ingresos por alícuotas;
- cuentas puente de pagos;
- liquidaciones de proveedor;
- ajustes contables protegidos.
```

---

### 8.9. Decimal money

Todos los montos deben usar Decimal.

Prohibido:

```text
float
double
JavaScript number como fuente de verdad
```

---

### 8.10. No exposición pública

La contabilidad es información administrativa privada.

No debe existir:

```text
/api/v1/public/accounting
/api/v1/me/accounting
```

en MVP.

---

## 9. Actores

### 9.1. PlatformAdmin

Puede administrar plantillas globales de plan de cuentas si se implementan.

No accede automáticamente a libros contables de tenants.

---

### 9.2. TenantAdmin

Puede habilitar la configuración contable del tenant y consultar reportes si tiene permisos.

---

### 9.3. FinancialManager

Puede configurar cuentas, reglas, periodos, asientos, cierres y reportes contables.

---

### 9.4. Accountant

Puede revisar libro diario, libro mayor, balances, asientos y cierres.

Puede preparar asientos manuales si tiene permisos.

---

### 9.5. BoardMember

Puede consultar reportes contables agregados bajo permisos, sin editar cuentas ni asientos.

---

### 9.6. Resident / PropertyOwner

No accede al ledger contable en MVP.

Sus estados de cuenta siguen usando `006-account-statements`.

---

### 9.7. System

Genera asientos automáticos desde eventos financieros, aplica reglas contables, valida partida doble, actualiza balances y audita.

---

## 10. Definiciones funcionales

### 10.1. Accounting Policy

Configuración contable básica de un tenant.

Define:

```text
- moneda base;
- método contable objetivo;
- formato de numeración;
- periodo fiscal;
- cuentas de control;
- reglas de cierre;
- tolerancia monetaria permitida;
- bloqueo de asientos manuales en cuentas protegidas.
```

---

### 10.2. Chart of Accounts

Plan de cuentas contables del tenant.

Agrupa las cuentas que se usarán para registrar asientos.

---

### 10.3. Accounting Account

Cuenta contable individual.

Ejemplos:

```text
Activo
  ├── Caja
  ├── Bancos
  └── Cuentas por cobrar

Pasivo
  └── Cuentas por pagar

Patrimonio
  └── Fondo patrimonial

Ingresos
  ├── Ingresos por alícuotas
  ├── Ingresos por multas
  └── Ingresos por reservas

Gastos
  ├── Mantenimiento
  ├── Servicios básicos
  └── Administración
```

---

### 10.4. Accounting Period

Periodo contable mensual o anual.

Estados:

```text
open
locked
closed
reopened
archived
```

---

### 10.5. Journal Entry

Asiento contable.

Puede ser:

```text
automatic
manual
reversal
adjustment
closing
opening
migration
```

---

### 10.6. Journal Entry Line

Línea de asiento.

Cada línea registra:

```text
cuenta
débito o crédito
monto
descripción
referencia
```

---

### 10.7. Accounting Source Event Link

Vínculo entre un asiento contable y el evento fuente que lo originó.

---

### 10.8. Accounting Mapping Rule

Regla que define cómo un evento financiero se transforma en asiento contable.

Ejemplo:

```text
charge.issued
  Dr AccountsReceivable
  Cr DuesRevenue
```

---

### 10.9. Accounting Balance

Saldo por cuenta, periodo y tenant.

Puede calcularse on-demand o persistirse como snapshot para performance.

---

### 10.10. Accounting Closing Run

Proceso de cierre de periodo.

Valida que:

```text
- no existan asientos draft críticos;
- no existan fuentes financieras pendientes;
- los asientos estén cuadrados;
- el balance de comprobación cuadre;
- los periodos previos estén cerrados;
- se emita auditoría.
```

---

## 11. Entidades conceptuales

### 11.1. AccountingPolicy

Representa la política contable de un tenant.

Campos conceptuales:

```text
id
tenantId
baseCurrency
accountingMethod
fiscalYearStartMonth
fiscalYearStartDay
journalNumberingMode
allowManualEntries
allowPostingToClosedPeriod
protectedControlAccountsEnabled
status
createdBy
updatedBy
activatedBy
archivedBy
createdAt
updatedAt
activatedAt
archivedAt
metadata
```

---

### 11.2. ChartOfAccounts

Representa el plan de cuentas del tenant.

Campos conceptuales:

```text
id
tenantId
name
description
status
templateKey
version
isDefault
createdBy
updatedBy
activatedBy
archivedBy
createdAt
updatedAt
activatedAt
archivedAt
metadata
```

---

### 11.3. AccountingAccount

Representa una cuenta contable.

Campos conceptuales:

```text
id
tenantId
chartOfAccountsId
parentAccountId
accountCode
accountName
accountType
normalBalance
level
isPostingAllowed
isControlAccount
isSystemAccount
status
description
createdBy
updatedBy
archivedBy
createdAt
updatedAt
archivedAt
metadata
```

---

### 11.4. AccountingPeriod

Representa un periodo contable.

Campos conceptuales:

```text
id
tenantId
periodCode
periodName
periodType
startDate
endDate
status
lockedAt
lockedBy
closedAt
closedBy
reopenedAt
reopenedBy
archiveReason
createdBy
createdAt
updatedAt
metadata
```

---

### 11.5. AccountingMappingRule

Representa una regla de mapeo desde evento fuente hacia asiento contable.

Campos conceptuales:

```text
id
tenantId
ruleCode
ruleName
sourceModule
sourceEventType
sourceResourceType
status
priority
debitAccountId
creditAccountId
amountSource
descriptionTemplate
effectiveFrom
effectiveTo
createdBy
updatedBy
activatedBy
archivedBy
createdAt
updatedAt
metadata
```

---

### 11.6. JournalEntry

Representa un asiento contable.

Campos conceptuales:

```text
id
tenantId
accountingPeriodId
journalNumber
entryDate
postingDate
entryType
sourceType
sourceModule
sourceResourceType
sourceResourceId
sourceEventType
status
description
totalDebit
totalCredit
currency
idempotencyKey
postedAt
postedBy
reversedAt
reversedBy
reversalOfJournalEntryId
voidedAt
voidedBy
archiveReason
createdBy
createdAt
updatedAt
metadata
```

---

### 11.7. JournalEntryLine

Representa una línea de asiento.

Campos conceptuales:

```text
id
tenantId
journalEntryId
accountingAccountId
lineNumber
description
debitAmount
creditAmount
currency
sourceLineType
sourceLineId
createdAt
metadata
```

---

### 11.8. AccountingSourceEventLink

Representa la relación entre evento fuente y asiento contable.

Campos conceptuales:

```text
id
tenantId
journalEntryId
sourceModule
sourceResourceType
sourceResourceId
sourceEventType
sourceEventOccurredAt
status
createdAt
metadata
```

---

### 11.9. AccountingBalanceSnapshot

Representa un snapshot de saldo contable.

Campos conceptuales:

```text
id
tenantId
accountingPeriodId
accountingAccountId
openingDebit
openingCredit
periodDebit
periodCredit
closingDebit
closingCredit
currency
snapshotAt
generatedBy
createdAt
metadata
```

---

### 11.10. AccountingClosingRun

Representa un proceso de cierre contable.

Campos conceptuales:

```text
id
tenantId
accountingPeriodId
status
startedBy
startedAt
completedAt
failedAt
closedAt
reopenedAt
entriesChecked
entriesPosted
draftEntriesFound
unbalancedEntriesFound
warningsCount
errorCode
errorMessage
metadata
```

---

## 12. Enums iniciales

### 12.1. AccountingPolicyStatus

```text
draft
active
inactive
archived
```

---

### 12.2. AccountingMethod

```text
cash
accrual
hybrid
```

Recomendación MVP:

```text
accrual-ready
```

Es decir, permitir asientos por cargos emitidos y pagos aplicados, sin resolver todavía todos los escenarios contables avanzados.

---

### 12.3. ChartOfAccountsStatus

```text
draft
active
inactive
archived
```

---

### 12.4. AccountingAccountType

```text
asset
liability
equity
income
expense
contraAsset
contraLiability
contraEquity
contraIncome
contraExpense
```

MVP mínimo:

```text
asset
liability
equity
income
expense
```

---

### 12.5. NormalBalance

```text
debit
credit
```

---

### 12.6. AccountingAccountStatus

```text
draft
active
inactive
archived
```

---

### 12.7. AccountingPeriodType

```text
monthly
quarterly
annual
custom
```

MVP recomendado:

```text
monthly
annual
```

---

### 12.8. AccountingPeriodStatus

```text
open
locked
closed
reopened
archived
```

---

### 12.9. AccountingMappingRuleStatus

```text
draft
active
inactive
archived
```

---

### 12.10. JournalEntryType

```text
automatic
manual
reversal
adjustment
closing
opening
migration
```

---

### 12.11. JournalEntryStatus

```text
draft
pendingApproval
approved
posted
reversed
voided
archived
```

---

### 12.12. JournalEntrySourceType

```text
system
manual
integration
migration
closing
```

---

### 12.13. AccountingSourceModule

```text
duesFees
payments
accountStatements
bankReconciliation
paymentProviderIntegration
openBankingIntegration
reservations
fines
manualAccounting
system
migration
other
```

---

### 12.14. AccountingClosingRunStatus

```text
draft
running
completed
completedWithWarnings
failed
cancelled
archived
```

---

### 12.15. Currency

```text
USD
```

---

## 13. Reglas de negocio

### BR-001 — Tenant obligatorio

Toda entidad operativa contable debe tener `tenantId`.

---

### BR-002 — No `tenantId` desde body

El cliente nunca debe enviar `tenantId` para crear recursos contables tenant-scoped.

---

### BR-003 — Plan de cuentas por tenant

Cada tenant debe tener al menos un `ChartOfAccounts` activo antes de contabilizar asientos.

---

### BR-004 — Código de cuenta único

`AccountingAccount.accountCode` debe ser único por tenant y chart of accounts.

---

### BR-005 — Cuenta activa requerida

Solo cuentas `active` y con `isPostingAllowed=true` pueden recibir líneas de asiento, salvo reglas especiales de sistema.

---

### BR-006 — Cuentas padre no posteables

Una cuenta que tenga subcuentas no debería recibir movimientos directos si funciona como agrupadora.

---

### BR-007 — Partida doble obligatoria

Para todo asiento `posted`:

```text
totalDebit = totalCredit
```

---

### BR-008 — Línea con un solo lado

Una línea de asiento debe tener:

```text
debitAmount > 0 y creditAmount = 0
```

o

```text
creditAmount > 0 y debitAmount = 0
```

No ambos.

---

### BR-009 — Decimal obligatorio

Todos los montos contables deben manejarse con Decimal.

---

### BR-010 — Moneda MVP

MVP usa `USD`.

---

### BR-011 — Periodo contable obligatorio

Todo asiento debe estar asociado a un `AccountingPeriod`.

---

### BR-012 — Periodo abierto para contabilizar

Solo se puede contabilizar en periodos `open` o `reopened`.

---

### BR-013 — Periodo closed bloquea posting

No se puede contabilizar en periodo `closed`.

---

### BR-014 — Posting inmutable

Una vez que un asiento pasa a `posted`, no puede modificarse.

---

### BR-015 — Corrección mediante reverso

Un asiento contabilizado se corrige mediante un asiento de reverso.

---

### BR-016 — Reverso conserva referencia

Todo reverso debe referenciar el asiento original.

---

### BR-017 — Asiento automático requiere source event

Todo asiento automático debe tener `sourceModule`, `sourceResourceType`, `sourceResourceId` y `sourceEventType`.

---

### BR-018 — Idempotencia por source event

El mismo evento fuente no debe generar asientos duplicados.

---

### BR-019 — Asiento manual requiere justificación

Todo asiento manual debe tener descripción, motivo y actor autorizado.

---

### BR-020 — Cuentas de control protegidas

Las cuentas marcadas como `isControlAccount=true` no deben recibir asientos manuales ordinarios sin permiso especial.

---

### BR-021 — Mapping rule activa

La generación automática de asientos requiere una `AccountingMappingRule` activa.

---

### BR-022 — Sin regla activa, queda pendiente

Si no existe regla contable activa para un evento financiero, el sistema debe registrar evento pendiente o error controlado, no inventar cuentas.

---

### BR-023 — Ledger no crea Payment

El módulo contable no crea pagos.

---

### BR-024 — Ledger no crea BankTransaction

El módulo contable no crea movimientos bancarios operativos.

---

### BR-025 — Ledger no modifica Account Statements

El módulo contable no modifica estados de cuenta operativos.

---

### BR-026 — Ledger no confirma conciliación bancaria

El módulo contable no crea matches de conciliación ni marca conciliaciones finales.

---

### BR-027 — Bank Reconciliation puede alimentar accounting

Una conciliación confirmada puede generar asiento contable si existe regla configurada.

---

### BR-028 — Open Banking no contabiliza directamente

Open Banking no debe generar asientos contables directos en MVP; debe pasar por Bank Reconciliation o revisión autorizada.

---

### BR-029 — Payment Provider settlements son candidatos

Las liquidaciones de proveedor pueden generar asientos solo cuando estén revisadas o conciliadas según política.

---

### BR-030 — Cierre requiere balance cuadrado

No se puede cerrar un periodo si existen asientos desbalanceados o draft críticos.

---

### BR-031 — Cierre bloquea periodo

Un periodo cerrado bloquea nuevos asientos ordinarios.

---

### BR-032 — Reapertura requiere permiso especial

Reabrir un periodo cerrado requiere permiso, razón y auditoría reforzada.

---

### BR-033 — Reportes derivan del ledger

Los reportes contables deben derivarse de JournalEntries posted, no de tablas operativas directamente.

---

### BR-034 — No endpoints públicos

No debe existir API pública para ledger contable.

---

### BR-035 — WordPress sin acceso contable

WordPress no puede consultar ni presentar información contable privada.

---

### BR-036 — IA externa prohibida con datos reales

No enviar asientos, cuentas, saldos, reportes o balances reales a servicios externos de IA en MVP.

---

## 14. Historias de usuario

### US-001 — Configurar política contable

Como FinancialManager, quiero configurar la política contable del tenant para establecer moneda, método y reglas básicas.

Criterios:

```text
- requiere permiso;
- tenant activo;
- baseCurrency USD;
- status inicial draft;
- audita accountingPolicy.created.
```

---

### US-002 — Crear plan de cuentas

Como Accountant, quiero crear un plan de cuentas para clasificar los movimientos contables del conjunto.

Criterios:

```text
- accountCode único;
- cuentas clasificadas por tipo;
- cuentas padre/hijas;
- audita chartOfAccounts.created.
```

---

### US-003 — Activar plan de cuentas

Como FinancialManager, quiero activar un plan de cuentas para que pueda usarse en asientos.

Criterios:

```text
- solo un plan activo por tenant si se define así;
- debe tener cuentas mínimas;
- audita chartOfAccounts.activated.
```

---

### US-004 — Crear periodos contables

Como Accountant, quiero crear periodos contables mensuales para registrar asientos.

Criterios:

```text
- no se solapan;
- tienen startDate/endDate;
- status open;
- audita accountingPeriod.created.
```

---

### US-005 — Definir regla contable

Como Accountant, quiero definir reglas para convertir eventos financieros en asientos.

Criterios:

```text
- sourceModule válido;
- sourceEventType válido;
- debitAccount y creditAccount activas;
- audita accountingMappingRule.created.
```

---

### US-006 — Generar asiento desde cargo emitido

Como sistema, quiero generar un asiento cuando se emite un cargo.

Ejemplo conceptual:

```text
Dr Cuentas por cobrar
Cr Ingresos por alícuotas
```

Criterios:

```text
- idempotente;
- periodo abierto;
- cuenta activa;
- debit=credit;
- source linked;
- audita journalEntry.posted.
```

---

### US-007 — Generar asiento desde pago validado

Como sistema, quiero generar un asiento cuando un pago se valida y aplica.

Ejemplo conceptual:

```text
Dr Bancos / Caja / Cuenta puente
Cr Cuentas por cobrar
```

Criterios:

```text
- payment confirmado;
- amount Decimal;
- no duplica asiento;
- no altera Payment;
- audita journalEntry.posted.
```

---

### US-008 — Crear asiento manual

Como Accountant, quiero crear un asiento manual autorizado para registrar ajustes contables.

Criterios:

```text
- requiere permiso;
- requiere justificación;
- debe cuadrar;
- no puede postear en cuenta protegida sin permiso especial;
- audita journalEntry.created y journalEntry.posted.
```

---

### US-009 — Reversar asiento

Como Accountant, quiero reversar un asiento contabilizado si fue incorrecto.

Criterios:

```text
- asiento original posted;
- crea asiento reversal;
- referencia asiento original;
- no edita original;
- audita journalEntry.reversed.
```

---

### US-010 — Consultar libro diario

Como Accountant, quiero consultar el libro diario para revisar asientos por periodo.

Criterios:

```text
- tenant-scoped;
- filtra por periodo, fecha, cuenta, fuente, estado;
- no incluye tenant B;
- exportable.
```

---

### US-011 — Consultar libro mayor

Como Accountant, quiero consultar movimientos por cuenta para revisar saldos.

Criterios:

```text
- solo entries posted;
- muestra saldo inicial, débitos, créditos, saldo final;
- filtra por cuenta y periodo;
- exportable.
```

---

### US-012 — Cerrar periodo

Como FinancialManager, quiero cerrar un periodo contable para impedir cambios posteriores.

Criterios:

```text
- valida asientos cuadrados;
- valida no draft críticos;
- genera closing run;
- cambia periodo a closed;
- audita accountingPeriod.closed.
```

---

### US-013 — Generar balance de comprobación

Como BoardMember autorizado, quiero ver un balance de comprobación para revisar la consistencia contable.

Criterios:

```text
- total debit = total credit;
- derivado de JournalEntries posted;
- tenant-scoped;
- no expone datos de otros tenants.
```

---

## 15. Requisitos funcionales

### FR-001 — Accounting policy

El sistema debe permitir crear, consultar, actualizar, activar, desactivar y archivar políticas contables por tenant.

---

### FR-002 — Chart of accounts

El sistema debe permitir crear y administrar planes de cuentas por tenant.

---

### FR-003 — Accounting accounts

El sistema debe permitir crear, actualizar, activar, inactivar y archivar cuentas contables.

---

### FR-004 — Account hierarchy

El sistema debe soportar jerarquía padre/hijo de cuentas.

---

### FR-005 — Control accounts

El sistema debe permitir marcar cuentas como cuentas de control protegidas.

---

### FR-006 — Accounting periods

El sistema debe permitir crear, abrir, bloquear, cerrar, reabrir y archivar periodos contables.

---

### FR-007 — Mapping rules

El sistema debe permitir definir reglas de mapeo contable por evento fuente.

---

### FR-008 — Automatic journal generation

El sistema debe generar asientos automáticos desde eventos financieros soportados.

---

### FR-009 — Manual journal entries

El sistema debe permitir crear asientos manuales bajo permisos y validaciones.

---

### FR-010 — Journal entry validation

El sistema debe validar que los asientos tengan líneas válidas y cuadren.

---

### FR-011 — Posting

El sistema debe permitir contabilizar asientos válidos en periodo abierto.

---

### FR-012 — Immutability

El sistema debe impedir modificar asientos posted.

---

### FR-013 — Reversal

El sistema debe permitir reversar asientos posted mediante asiento contrario.

---

### FR-014 — Source linking

El sistema debe vincular asientos automáticos con su fuente.

---

### FR-015 — Idempotency

El sistema debe impedir asientos duplicados para el mismo evento fuente.

---

### FR-016 — General journal

El sistema debe exponer consulta de libro diario.

---

### FR-017 — General ledger

El sistema debe exponer consulta de libro mayor por cuenta.

---

### FR-018 — Trial balance

El sistema debe generar balance de comprobación.

---

### FR-019 — Income and expense report

El sistema debe generar reporte básico de ingresos y gastos.

---

### FR-020 — Basic balance sheet

El sistema debe generar balance general básico.

---

### FR-021 — Period closing

El sistema debe ejecutar cierre de periodo con validaciones.

---

### FR-022 — Reopen period

El sistema debe permitir reapertura controlada bajo permiso especial.

---

### FR-023 — Export

El sistema debe exportar reportes contables mediante Secure Document Storage cuando se persistan.

---

### FR-024 — Audit

El sistema debe auditar operaciones críticas.

---

### FR-025 — No public endpoints

No deben existir endpoints públicos del ledger contable.

---

### FR-026 — No AI with real data

El sistema no debe enviar datos contables reales a IA externa en MVP.

---

## 16. Requisitos no funcionales

### NFR-001 — Seguridad

Debe cumplir `docs/sdd/security.md`.

---

### NFR-002 — Multitenancy

Toda entidad operativa debe filtrar por `tenantId`.

---

### NFR-003 — Integridad contable

Todo asiento posted debe cuadrar.

---

### NFR-004 — Inmutabilidad

Los asientos posted no deben editarse.

---

### NFR-005 — Trazabilidad

Todo asiento automático debe tener source link.

---

### NFR-006 — Idempotencia

Un mismo evento financiero no debe duplicar asientos.

---

### NFR-007 — Precisión monetaria

Todos los montos deben usar Decimal.

---

### NFR-008 — Performance

Objetivos iniciales:

```text
p95 < 800 ms para listar cuentas paginadas.
p95 < 1000 ms para listar asientos paginados.
p95 < 1500 ms para consultar libro mayor de una cuenta en periodo mensual típico.
p95 < 2000 ms para balance de comprobación mensual típico.
p95 < 3000 ms para cierre de periodo pequeño/mediano, excluyendo jobs pesados.
```

---

### NFR-009 — Observabilidad segura

Logs y métricas no deben contener datos financieros excesivos, payloads completos ni información cross-tenant.

---

### NFR-010 — API-first

Toda funcionalidad administrativa debe exponerse mediante REST.

---

## 17. Permisos iniciales

### 17.1. Accounting policy

```text
accountingPolicies.create
accountingPolicies.read
accountingPolicies.update
accountingPolicies.activate
accountingPolicies.disable
accountingPolicies.archive
```

---

### 17.2. Chart of accounts

```text
chartOfAccounts.create
chartOfAccounts.read
chartOfAccounts.update
chartOfAccounts.activate
chartOfAccounts.archive
```

---

### 17.3. Accounting accounts

```text
accountingAccounts.create
accountingAccounts.read
accountingAccounts.update
accountingAccounts.activate
accountingAccounts.disable
accountingAccounts.archive
accountingAccounts.manageControlAccounts
```

---

### 17.4. Accounting periods

```text
accountingPeriods.create
accountingPeriods.read
accountingPeriods.update
accountingPeriods.lock
accountingPeriods.close
accountingPeriods.reopen
accountingPeriods.archive
```

---

### 17.5. Mapping rules

```text
accountingMappingRules.create
accountingMappingRules.read
accountingMappingRules.update
accountingMappingRules.activate
accountingMappingRules.disable
accountingMappingRules.archive
```

---

### 17.6. Journal entries

```text
journalEntries.create
journalEntries.read
journalEntries.updateDraft
journalEntries.approve
journalEntries.post
journalEntries.reverse
journalEntries.voidDraft
journalEntries.archive
journalEntries.createManual
journalEntries.postToControlAccounts
```

---

### 17.7. Reports

```text
accountingReports.read
accountingReports.export
accountingReports.trialBalance
accountingReports.generalLedger
accountingReports.generalJournal
accountingReports.incomeExpense
accountingReports.balanceSheet
```

---

### 17.8. Closing

```text
accountingClosingRuns.create
accountingClosingRuns.read
accountingClosingRuns.execute
accountingClosingRuns.cancel
accountingClosingRuns.archive
```

---

### 17.9. Audit

```text
accounting.audit.read
```

---

## 18. API preliminar

### 18.1. Accounting policies

```text
GET    /api/v1/tenant/accounting/policies
POST   /api/v1/tenant/accounting/policies
GET    /api/v1/tenant/accounting/policies/{policyId}
PATCH  /api/v1/tenant/accounting/policies/{policyId}
POST   /api/v1/tenant/accounting/policies/{policyId}/activate
POST   /api/v1/tenant/accounting/policies/{policyId}/disable
POST   /api/v1/tenant/accounting/policies/{policyId}/archive
```

---

### 18.2. Chart of accounts

```text
GET    /api/v1/tenant/accounting/chart-of-accounts
POST   /api/v1/tenant/accounting/chart-of-accounts
GET    /api/v1/tenant/accounting/chart-of-accounts/{chartId}
PATCH  /api/v1/tenant/accounting/chart-of-accounts/{chartId}
POST   /api/v1/tenant/accounting/chart-of-accounts/{chartId}/activate
POST   /api/v1/tenant/accounting/chart-of-accounts/{chartId}/archive
```

---

### 18.3. Accounting accounts

```text
GET    /api/v1/tenant/accounting/accounts
POST   /api/v1/tenant/accounting/accounts
GET    /api/v1/tenant/accounting/accounts/{accountId}
PATCH  /api/v1/tenant/accounting/accounts/{accountId}
POST   /api/v1/tenant/accounting/accounts/{accountId}/activate
POST   /api/v1/tenant/accounting/accounts/{accountId}/disable
POST   /api/v1/tenant/accounting/accounts/{accountId}/archive
```

---

### 18.4. Accounting periods

```text
GET    /api/v1/tenant/accounting/periods
POST   /api/v1/tenant/accounting/periods
GET    /api/v1/tenant/accounting/periods/{periodId}
PATCH  /api/v1/tenant/accounting/periods/{periodId}
POST   /api/v1/tenant/accounting/periods/{periodId}/lock
POST   /api/v1/tenant/accounting/periods/{periodId}/close
POST   /api/v1/tenant/accounting/periods/{periodId}/reopen
POST   /api/v1/tenant/accounting/periods/{periodId}/archive
```

---

### 18.5. Mapping rules

```text
GET    /api/v1/tenant/accounting/mapping-rules
POST   /api/v1/tenant/accounting/mapping-rules
GET    /api/v1/tenant/accounting/mapping-rules/{ruleId}
PATCH  /api/v1/tenant/accounting/mapping-rules/{ruleId}
POST   /api/v1/tenant/accounting/mapping-rules/{ruleId}/activate
POST   /api/v1/tenant/accounting/mapping-rules/{ruleId}/disable
POST   /api/v1/tenant/accounting/mapping-rules/{ruleId}/archive
```

---

### 18.6. Journal entries

```text
GET    /api/v1/tenant/accounting/journal-entries
POST   /api/v1/tenant/accounting/journal-entries
GET    /api/v1/tenant/accounting/journal-entries/{journalEntryId}
PATCH  /api/v1/tenant/accounting/journal-entries/{journalEntryId}
POST   /api/v1/tenant/accounting/journal-entries/{journalEntryId}/approve
POST   /api/v1/tenant/accounting/journal-entries/{journalEntryId}/post
POST   /api/v1/tenant/accounting/journal-entries/{journalEntryId}/reverse
POST   /api/v1/tenant/accounting/journal-entries/{journalEntryId}/void
POST   /api/v1/tenant/accounting/journal-entries/{journalEntryId}/archive
```

---

### 18.7. Accounting source links

```text
GET    /api/v1/tenant/accounting/source-event-links
GET    /api/v1/tenant/accounting/source-event-links/{sourceEventLinkId}
```

---

### 18.8. Closing runs

```text
GET    /api/v1/tenant/accounting/closing-runs
POST   /api/v1/tenant/accounting/periods/{periodId}/closing-runs
GET    /api/v1/tenant/accounting/closing-runs/{closingRunId}
POST   /api/v1/tenant/accounting/closing-runs/{closingRunId}/execute
POST   /api/v1/tenant/accounting/closing-runs/{closingRunId}/cancel
POST   /api/v1/tenant/accounting/closing-runs/{closingRunId}/archive
```

---

### 18.9. Reports

```text
GET    /api/v1/tenant/accounting/reports/general-journal
GET    /api/v1/tenant/accounting/reports/general-ledger
GET    /api/v1/tenant/accounting/reports/trial-balance
GET    /api/v1/tenant/accounting/reports/income-expense
GET    /api/v1/tenant/accounting/reports/balance-sheet
GET    /api/v1/tenant/accounting/reports/export
```

---

### 18.10. Endpoints públicos prohibidos

No crear:

```text
GET  /api/v1/public/accounting
GET  /api/v1/public/accounting/accounts
GET  /api/v1/public/accounting/journal-entries
GET  /api/v1/public/accounting/reports
GET  /api/v1/public/tenants/{slug}/accounting
```

---

### 18.11. Endpoints `/me` prohibidos en MVP

No crear:

```text
GET  /api/v1/me/accounting
GET  /api/v1/me/accounting/accounts
GET  /api/v1/me/accounting/journal-entries
GET  /api/v1/me/accounting/reports
```

---

## 19. Integraciones

### 19.1. `004-dues-fees`

Eventos candidatos:

```text
charge.issued
charge.adjusted
charge.reversed
charge.cancelled
```

Asiento conceptual para cargo emitido:

```text
Dr AccountsReceivable
Cr DuesRevenue / FineRevenue / ReservationRevenue
```

Regla:

```text
El asiento contable no genera ni modifica el cargo; solo registra su efecto contable.
```

---

### 19.2. `005-payments`

Eventos candidatos:

```text
payment.validated
payment.allocated
payment.reversed
payment.receiptIssued
```

Asiento conceptual para pago aplicado:

```text
Dr Cash / Bank / UndepositedFunds / PaymentClearing
Cr AccountsReceivable
```

Regla:

```text
Accounting Ledger no valida pagos ni crea PaymentAllocation.
```

---

### 19.3. `006-account-statements`

Uso:

```text
- comparación operativa entre saldos contables y saldos de estado de cuenta;
- soporte para reportes;
- ninguna mutación directa desde accounting.
```

Regla:

```text
Account Statements no se actualiza desde JournalEntries.
```

---

### 19.4. `017-bank-reconciliation`

Eventos candidatos:

```text
bankTransaction.reconciled
bankTransaction.unreconciled
bankFee.detected
bankInterest.detected
```

Uso:

```text
- registrar fees bancarios;
- registrar intereses;
- confirmar movimientos bancarios ya conciliados;
- evitar contabilización desde movimientos no conciliados.
```

Regla:

```text
Bank Reconciliation confirma conciliación; Accounting Ledger registra el asiento resultante si corresponde.
```

---

### 19.5. `018-payment-provider-integration`

Eventos candidatos:

```text
providerPayment.verified
providerSettlement.reviewed
providerFee.confirmed
providerChargeback.requiresReview
```

Regla:

```text
Provider settlements pueden alimentar accounting solo cuando estén revisados o conciliados según política.
```

---

### 19.6. `019-open-banking-integration`

Uso:

```text
- Open Banking no genera asientos directos en MVP;
- Open Banking alimenta Bank Reconciliation;
- Accounting recibe efectos posteriores desde Bank Reconciliation.
```

---

### 19.7. `016-secure-document-storage`

Uso:

```text
- exportación de libro diario;
- exportación de libro mayor;
- exportación de balance de comprobación;
- exportación de reportes contables;
- evidencia de cierre contable.
```

Clasificación recomendada:

```text
sourceModule = accountingLedger
sensitivity = restricted
visibility = administrative
```

---

### 19.8. `007-audit`

Uso:

```text
- auditar creación de cuentas;
- auditar cambios de plan de cuentas;
- auditar creación/posting/reverso de asientos;
- auditar cierres/reaperturas;
- auditar exportaciones;
- auditar reglas de mapeo.
```

---

### 19.9. `008-basic-reports`

Uso:

```text
- exponer reportes contables básicos;
- permitir exportación;
- alimentar dashboards administrativos futuros.
```

---

## 20. Flujos funcionales principales

### 20.1. Configuración inicial contable

```text
1. FinancialManager crea AccountingPolicy.
2. Accountant crea ChartOfAccounts.
3. Accountant crea cuentas contables.
4. FinancialManager activa ChartOfAccounts.
5. Accountant crea periodos contables.
6. Accountant define mapping rules.
7. Sistema queda listo para postear asientos.
```

---

### 20.2. Cargo emitido genera asiento

```text
1. Dues & Fees emite Charge.
2. Evento charge.issued queda disponible.
3. Accounting busca MappingRule activa.
4. Sistema calcula líneas.
5. Sistema crea JournalEntry automatic.
6. Sistema valida debit=credit.
7. Sistema postea asiento.
8. Sistema crea SourceEventLink.
9. Sistema audita.
```

---

### 20.3. Pago validado genera asiento

```text
1. Payments valida Payment.
2. PaymentAllocation asigna pago a cargos.
3. Evento payment.allocated queda disponible.
4. Accounting busca MappingRule activa.
5. Sistema crea JournalEntry.
6. Sistema valida periodo abierto.
7. Sistema valida debit=credit.
8. Sistema postea.
9. Sistema audita.
```

---

### 20.4. Asiento manual

```text
1. Accountant crea JournalEntry manual draft.
2. Agrega líneas debit/credit.
3. Sistema valida cuentas activas.
4. Sistema valida cuentas de control.
5. Usuario autorizado aprueba si aplica.
6. Usuario autorizado postea.
7. Sistema valida debit=credit.
8. Sistema bloquea edición posterior.
9. Sistema audita.
```

---

### 20.5. Reverso de asiento

```text
1. Accountant selecciona JournalEntry posted.
2. Solicita reverse con reason.
3. Sistema crea asiento reversal con líneas invertidas.
4. Sistema referencia original.
5. Sistema postea reversal.
6. Sistema marca original reversed si aplica.
7. Sistema audita.
```

---

### 20.6. Cierre de periodo

```text
1. FinancialManager crea closing run.
2. Sistema valida periodo abierto.
3. Sistema valida asientos draft críticos.
4. Sistema valida asientos desbalanceados.
5. Sistema calcula trial balance.
6. Sistema valida debit total = credit total.
7. Sistema genera snapshots si aplica.
8. Sistema marca periodo closed.
9. Sistema audita.
```

---

## 21. Estados principales

### 21.1. AccountingPolicy

```text
draft -> active
active -> inactive
inactive -> active
draft -> archived
inactive -> archived
active -> archived
```

---

### 21.2. ChartOfAccounts

```text
draft -> active
active -> inactive
inactive -> active
draft -> archived
inactive -> archived
active -> archived
```

---

### 21.3. AccountingAccount

```text
draft -> active
active -> inactive
inactive -> active
draft -> archived
inactive -> archived
active -> archived
```

---

### 21.4. AccountingPeriod

```text
open -> locked
locked -> open
open -> closed
locked -> closed
closed -> reopened
reopened -> closed
open -> archived
closed -> archived
```

---

### 21.5. AccountingMappingRule

```text
draft -> active
active -> inactive
inactive -> active
draft -> archived
inactive -> archived
active -> archived
```

---

### 21.6. JournalEntry

```text
draft -> pendingApproval
pendingApproval -> approved
approved -> posted
draft -> posted si política lo permite
posted -> reversed
draft -> voided
pendingApproval -> voided
approved -> voided
voided -> archived
reversed -> archived
```

Regla:

```text
posted no vuelve a draft.
```

---

### 21.7. AccountingClosingRun

```text
draft -> running
running -> completed
running -> completedWithWarnings
running -> failed
draft -> cancelled
running -> cancelled
completed -> archived
failed -> archived
cancelled -> archived
```

---

## 22. Seguridad

### 22.1. Amenazas prioritarias

```text
- asientos cross-tenant;
- modificación de asiento posted;
- asientos desbalanceados;
- duplicación de asientos por evento fuente;
- contabilización en periodo cerrado;
- asientos manuales contra cuentas de control;
- reportes contables que incluyen tenant B;
- exportación no autorizada;
- uso de floats para dinero;
- edición directa de balances;
- creación de Payment desde ledger;
- modificación de Account Statements desde ledger;
- confirmación de conciliación desde ledger;
- endpoint público contable;
- acceso desde WordPress;
- IA externa con datos contables reales.
```

---

### 22.2. Controles obligatorios

```text
- AuthGuard;
- TenantGuard;
- PermissionGuard;
- AccountingPolicyGuard;
- AccountingPeriodGuard;
- JournalEntryBalancePolicy;
- JournalEntryImmutabilityPolicy;
- ControlAccountPostingPolicy;
- SourceEventIdempotencyPolicy;
- ClosedPeriodPostingPolicy;
- AccountingReportTenantPolicy;
- NoPublicAccountingEndpointPolicy;
- NoPaymentCreationFromAccountingPolicy;
- NoAccountStatementMutationPolicy;
- NoBankReconciliationConfirmationPolicy;
- AuditSanitizationPolicy;
- LogSanitizationPolicy;
- NoExternalAiAccountingDataPolicy.
```

---

### 22.3. Datos prohibidos

```text
tokens
passwords
secrets
raw provider payload
raw bank payload
storageKey
signedUrl persistente
SQL raw
stack trace en producción
datos contables reales enviados a IA externa
datos cross-tenant
```

---

## 23. Auditoría

### 23.1. Eventos mínimos

```text
accountingPolicy.created
accountingPolicy.updated
accountingPolicy.activated
accountingPolicy.disabled
accountingPolicy.archived

chartOfAccounts.created
chartOfAccounts.updated
chartOfAccounts.activated
chartOfAccounts.archived

accountingAccount.created
accountingAccount.updated
accountingAccount.activated
accountingAccount.disabled
accountingAccount.archived
accountingAccount.controlFlagChanged

accountingPeriod.created
accountingPeriod.updated
accountingPeriod.locked
accountingPeriod.closed
accountingPeriod.reopened
accountingPeriod.archived

accountingMappingRule.created
accountingMappingRule.updated
accountingMappingRule.activated
accountingMappingRule.disabled
accountingMappingRule.archived

journalEntry.created
journalEntry.updatedDraft
journalEntry.approved
journalEntry.posted
journalEntry.reversed
journalEntry.voided
journalEntry.archived
journalEntry.postingRejected
journalEntry.unbalancedRejected
journalEntry.duplicateSourceRejected

journalEntryLine.created
journalEntryLine.updatedDraft

accountingSourceEventLink.created
accountingSourceEventLink.duplicateDetected

accountingClosingRun.created
accountingClosingRun.started
accountingClosingRun.completed
accountingClosingRun.completedWithWarnings
accountingClosingRun.failed
accountingClosingRun.cancelled
accountingClosingRun.archived

accountingReport.generated
accountingReport.exported
```

---

### 23.2. Metadata permitida

```text
accountingPolicyId
chartOfAccountsId
accountingAccountId
accountingPeriodId
accountingMappingRuleId
journalEntryId
journalEntryLineId
journalNumber
sourceModule
sourceResourceType
sourceResourceId
sourceEventType
entryType
entryStatus
accountCode
amount
currency
periodCode
closingRunId
outcome
traceId
```

---

### 23.3. Metadata prohibida

```text
tokens
secrets
passwords
raw provider payload
raw bank payload
storageKey
signedUrl
SQL raw
stack trace
datos personales innecesarios
datos contables masivos completos
```

---

## 24. Observabilidad

### 24.1. Logs sugeridos

```text
accountingPolicy.activated
chartOfAccounts.activated
accountingAccount.created
accountingPeriod.closed
journalEntry.posted
journalEntry.reversed
journalEntry.unbalancedRejected
journalEntry.duplicateSourceRejected
accountingClosingRun.completed
accountingClosingRun.failed
accountingReport.exported
```

---

### 24.2. Métricas sugeridas

```text
accounting_journal_entries_total
accounting_journal_entries_posted_total
accounting_journal_entries_reversed_total
accounting_journal_entries_rejected_total
accounting_unbalanced_entries_rejected_total
accounting_duplicate_source_events_total
accounting_periods_closed_total
accounting_closing_runs_total
accounting_closing_runs_failed_total
accounting_reports_exported_total
```

---

### 24.3. Labels permitidos

```text
entryType
entryStatus
sourceModule
sourceEventType
periodStatus
accountType
currency
outcome
```

---

### 24.4. Labels prohibidos

```text
tenantId
userId
journalEntryId
accountingAccountId
sourceResourceId
paymentId
chargeId
bankTransactionId
traceId
```

---

## 25. OpenAPI extensions

Para endpoints tenant:

```yaml
x-tenant-scope: true
x-auth-required: true
x-accounting-ledger: true
x-public-exposure: false
```

Para journal entries:

```yaml
x-double-entry-required: true
x-posted-entry-immutable: true
x-source-linked: true
x-idempotent-source-event: true
```

Para period closing:

```yaml
x-period-aware: true
x-closing-operation: true
x-audit-required: true
```

Para reportes:

```yaml
x-accounting-report: true
x-derived-from-posted-ledger: true
x-export-via-secure-document-storage: true
```

Para restricciones financieras:

```yaml
x-creates-payment: false
x-updates-account-statement: false
x-confirms-bank-reconciliation: false
x-public-endpoint: false
```

---

## 26. Reportes iniciales

### 26.1. General Journal

Debe mostrar:

```text
journalNumber
entryDate
postingDate
periodCode
entryType
sourceModule
sourceEventType
description
status
totalDebit
totalCredit
currency
```

---

### 26.2. General Ledger

Debe mostrar por cuenta:

```text
accountCode
accountName
openingBalance
debitAmount
creditAmount
closingBalance
journalEntryLines
period
currency
```

---

### 26.3. Trial Balance

Debe mostrar:

```text
accountCode
accountName
accountType
normalBalance
debitBalance
creditBalance
totalDebit
totalCredit
difference
currency
```

Regla:

```text
totalDebit debe ser igual a totalCredit.
```

---

### 26.4. Income and Expense

Debe mostrar:

```text
incomeAccounts
expenseAccounts
totalIncome
totalExpense
netResult
period
currency
```

---

### 26.5. Balance Sheet básico

Debe mostrar:

```text
assets
liabilities
equity
period
currency
```

Regla conceptual:

```text
Assets = Liabilities + Equity
```

---

### 26.6. Export

Formatos sugeridos:

```text
csv
xlsx
pdf
```

Si se persiste:

```text
usar Secure Document Storage
sourceModule=accountingLedger
sensitivity=restricted
visibility=administrative
```

---

## 27. Pruebas requeridas

### 27.1. Unit tests

```text
AccountingPolicy entity
ChartOfAccounts entity
AccountingAccount entity
AccountingPeriod entity
AccountingMappingRule entity
JournalEntry entity
JournalEntryLine entity
AccountingSourceEventLink entity
AccountingBalanceCalculator
JournalEntryBalanceValidator
SourceEventIdempotencyValidator
ClosedPeriodPostingPolicy
ControlAccountPostingPolicy
```

---

### 27.2. Integration tests

```text
charge.issued -> journal entry
payment.allocated -> journal entry
payment.reversed -> reversal entry
bankTransaction.reconciled -> accounting event
providerSettlement.reviewed -> accounting event
manual journal entry flow
period closing flow
report generation
export via Secure Document Storage
audit integration
```

---

### 27.3. API tests

```text
accounting policies CRUD/state transitions
chart of accounts CRUD/state transitions
accounting accounts CRUD/state transitions
accounting periods CRUD/state transitions
mapping rules CRUD/state transitions
journal entries CRUD draft/post/reverse/void
closing runs
general journal report
general ledger report
trial balance report
income expense report
balance sheet report
export report
```

---

### 27.4. Security tests

```text
no tenantId body
no cross-tenant accounting policy
no cross-tenant chart of accounts
no cross-tenant accounts
no cross-tenant periods
no cross-tenant journal entries
no cross-tenant source links
no cross-tenant reports
posted entry immutable
unbalanced entry rejected
duplicate source event rejected
closed period posting rejected
manual posting to control account rejected without permission
ledger does not create Payment
ledger does not mutate Account Statements
ledger does not confirm Bank Reconciliation
no public accounting endpoints
no /me accounting endpoints
WordPress cannot access accounting
external AI disabled
```

---

## 28. Criterios de aceptación

### 28.1. Funcionales

```text
- permite crear política contable;
- permite crear plan de cuentas;
- permite crear cuentas contables;
- permite crear periodos contables;
- permite definir reglas de mapeo;
- permite crear asientos manuales;
- permite generar asientos automáticos desde eventos soportados;
- valida partida doble;
- permite postear asientos válidos;
- impide editar asientos posted;
- permite reversar asientos posted;
- permite consultar libro diario;
- permite consultar libro mayor;
- permite generar balance de comprobación;
- permite generar reporte de ingresos y gastos;
- permite generar balance general básico;
- permite cerrar periodo;
- permite exportar reportes;
- audita operaciones críticas.
```

---

### 28.2. Seguridad

```text
- no acepta tenantId desde body;
- no permite cross-tenant access;
- no permite asientos desbalanceados;
- no permite duplicar asiento por mismo source event;
- no permite posting en periodo cerrado;
- no permite editar asiento posted;
- no permite posting manual ordinario en cuenta protegida;
- no crea Payment;
- no crea PaymentAllocation;
- no modifica Account Statements;
- no confirma Bank Reconciliation;
- no expone endpoints públicos;
- no expone /me accounting;
- no permite acceso desde WordPress;
- no envía datos contables reales a IA externa.
```

---

### 28.3. Integridad contable

```text
- totalDebit = totalCredit en todo asiento posted;
- trial balance cuadra;
- reversos invierten líneas originales;
- periodo cerrado bloquea nuevos postings;
- reportes derivan solo de asientos posted;
- source links permiten trazabilidad completa.
```

---

### 28.4. Performance

```text
- consultas paginadas;
- pageSize máximo 100;
- índices por tenant, periodo, cuenta, estado y fuente;
- reportes pesados pueden moverse a jobs;
- snapshots de balance se pueden usar para optimización.
```

---

## 29. Casos borde

| Caso                                        | Resultado esperado             |
| ------------------------------------------- | ------------------------------ |
| Crear cuenta con accountCode duplicado      | 409                            |
| Crear cuenta con `tenantId` en body         | 422                            |
| Postear asiento sin líneas                  | 422                            |
| Postear asiento con debit != credit         | 422                            |
| Postear asiento con cuenta inactive         | 409                            |
| Postear asiento en periodo closed           | 409                            |
| Editar asiento posted                       | 409                            |
| Reversar asiento draft                      | 409                            |
| Reversar asiento ya reversed                | 409/idempotente según política |
| Generar asiento automático sin mapping rule | Pending/error controlado       |
| Procesar mismo source event dos veces       | No duplica asiento             |
| Manual entry en control account sin permiso | 403                            |
| Reporte incluye tenant B                    | Falla crítica                  |
| Ledger crea Payment                         | Falla crítica                  |
| Ledger modifica Account Statements          | Falla crítica                  |
| Ledger crea ReconciliationMatch             | Falla crítica                  |
| Endpoint público contable existe            | Falla crítica                  |
| WordPress accede a ledger                   | Falla crítica                  |
| IA externa procesa balances reales          | Falla crítica                  |

---

## 30. Riesgos

| Riesgo                           | Impacto | Mitigación                          |
| -------------------------------- | ------: | ----------------------------------- |
| Asiento desbalanceado            | Crítico | JournalEntryBalanceValidator        |
| Duplicación por evento fuente    |    Alto | SourceEventIdempotencyPolicy        |
| Cross-tenant ledger data         | Crítico | TenantGuard + tenant-scoped queries |
| Edición de asiento posted        | Crítico | ImmutabilityPolicy                  |
| Posting en periodo cerrado       |    Alto | ClosedPeriodPostingPolicy           |
| Cuenta de control mal usada      |    Alto | ControlAccountPostingPolicy         |
| Mapping rule incorrecta          |    Alto | revisión, auditoría, pruebas        |
| Reportes inconsistentes          |    Alto | derivar de posted entries           |
| Ledger crea Payment              | Crítico | prohibición explícita + tests       |
| Ledger altera Account Statements | Crítico | integración read-only               |
| Ledger confirma conciliación     | Crítico | Bank Reconciliation authority       |
| Export no autorizado             |    Alto | Secure Document Storage + permisos  |
| IA externa con datos reales      | Crítico | feature flag false + policy         |

---

## 31. Dependencias futuras

Quedan como futuras specs o extensiones:

```text
021-supplier-payments
022-bank-rules-automation
023-advanced-reconciliation
024-financial-closing
025-reconciliation-ai-assistance
026-bank-statement-ocr
027-cash-management
028-multi-currency
029-provider-refunds-disputes
030-recurring-payments
031-payment-links-and-qr
032-electronic-invoicing
033-open-banking-payment-initiation
034-bank-consent-compliance
035-treasury-management
036-tax-compliance
037-budgeting-and-forecasting
038-cost-centers
039-accounts-payable
040-fixed-assets
```

---

## 32. Preguntas abiertas

```text
1. ¿El tenant usará base devengada, caja o híbrida?
2. ¿Se requiere plan de cuentas estándar para Ecuador o uno genérico interno?
3. ¿Quién aprobará el plan de cuentas inicial?
4. ¿Se permitirá más de un chart of accounts activo por tenant?
5. ¿Qué cuentas de control serán obligatorias?
6. ¿Los cargos siempre generan Accounts Receivable?
7. ¿Los pagos se registrarán contra caja, bancos o cuenta puente?
8. ¿La conciliación bancaria generará asientos o solo confirmará bancos?
9. ¿Los fees de proveedor se registrarán desde 018 o desde 017?
10. ¿Los movimientos Open Banking podrán generar asientos en una fase posterior?
11. ¿Habrá aprobación obligatoria para asientos manuales?
12. ¿Qué roles podrán reversar asientos?
13. ¿Se permitirá reabrir periodos cerrados?
14. ¿El cierre mensual requerirá aprobación del directorio?
15. ¿Los reportes contables serán visibles para BoardMember?
16. ¿Se requerirá export PDF formal?
17. ¿Qué retención se aplicará a reportes contables?
18. ¿Se integrará con software contable externo?
19. ¿Se requerirá facturación electrónica o SRI en una spec posterior?
20. ¿Se usará accounting ledger como insumo para un paper o analítica futura?
```

---

## 33. Decisión MVP recomendada

Para el MVP se recomienda:

```text
- ledger interno de partida doble;
- tenant-scoped;
- USD;
- plan de cuentas por tenant;
- plantilla inicial genérica;
- periodos mensuales;
- asientos draft/posted/reversed;
- posted entries inmutables;
- reversos como corrección;
- reglas de mapeo contable;
- generation desde Charges y Payments primero;
- Bank Reconciliation como fuente posterior de eventos contables confirmados;
- Open Banking sin contabilización directa;
- Provider settlements como candidatos revisados;
- reportes básicos;
- cierre de periodo básico;
- audit estricto;
- no endpoints públicos;
- no /me accounting;
- no WordPress accounting access;
- no IA externa con datos reales;
- no tributación completa;
- no SRI;
- no multi-moneda;
- no supplier payments completo todavía.
```

---

## 34. Archivos derivados esperados

```text
docs/specs/020-accounting-ledger/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

---

## 35. Resultado esperado

Al finalizar el módulo `020-accounting-ledger`, RESIDENT Core contará con una base contable interna, segura y extensible.

Resultado esperado:

```text
- política contable por tenant;
- plan de cuentas por tenant;
- cuentas contables activas;
- periodos contables;
- reglas de mapeo contable;
- asientos automáticos desde eventos financieros;
- asientos manuales autorizados;
- líneas debit/credit;
- validación debit=credit;
- posted entries inmutables;
- reversos auditados;
- vínculos con source events;
- libro diario;
- libro mayor;
- balance de comprobación;
- reporte de ingresos y gastos;
- balance general básico;
- cierre de periodo básico;
- export vía Secure Document Storage;
- auditoría completa;
- reportes tenant-scoped;
- no Payment auto-creation;
- no Account Statements mutation;
- no Bank Reconciliation final confirmation;
- no public endpoints;
- no WordPress accounting access;
- no external AI with real accounting data.
```

---

## 36. Conclusión

`020-accounting-ledger` debe implementarse como una capa contable formal sobre los módulos financieros ya especificados.

Su función no es reemplazar los procesos operativos, sino traducir eventos financieros confiables en registros contables consistentes.

El MVP debe concentrarse en:

```text
plan de cuentas
periodos
reglas de mapeo
asientos
partida doble
source links
reversos
libro diario
libro mayor
balance de comprobación
cierre básico
auditoría
seguridad
```

No debe concentrarse todavía en:

```text
tributación completa
SRI
facturación electrónica
multi-moneda
tesorería avanzada
cuentas por pagar completas
activos fijos
presupuestos avanzados
IA con datos reales
contabilidad certificada legalmente
```

El módulo queda preparado para evolucionar hacia `financial-closing`, `supplier-payments`, `tax-compliance`, `budgeting`, `multi-currency` y futuras integraciones contables.
