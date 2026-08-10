# Data Model — Spec 020 Accounting Ledger

## 1. Información del documento

| Campo                  | Valor                                                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Proyecto               | RESIDENT Core                                                                                                                                    |
| Spec ID                | 020                                                                                                                                              |
| Módulo                 | Accounting Ledger                                                                                                                                |
| Documento              | Data Model                                                                                                                                       |
| Ruta                   | `docs/specs/020-accounting-ledger/data-model.md`                                                                                                 |
| Versión                | 0.1                                                                                                                                              |
| Estado                 | needs-review                                                                                                                                     |
| Fecha                  | 2026-07-23                                                                                                                                       |
| Documento base         | `docs/specs/020-accounting-ledger/spec.md`                                                                                                       |
| Plan técnico           | `docs/specs/020-accounting-ledger/plan.md`                                                                                                       |
| Base de datos          | PostgreSQL                                                                                                                                       |
| ORM                    | Prisma                                                                                                                                           |
| Estrategia multitenant | Shared database / shared schema / tenant_id                                                                                                      |
| Naturaleza             | Tenant-scoped / Double-entry / Source-linked / Posting-driven / Period-aware / Immutable-after-posting / Audit-heavy / Report-ready / Non-public |

---

## 2. Propósito

Este documento define el modelo de datos del módulo `020-accounting-ledger`.

El objetivo es establecer las tablas, relaciones, enums, constraints, índices, reglas de persistencia, reglas de multitenancy, reglas de integridad contable y lineamientos de migración necesarios para implementar una base contable interna en RESIDENT Core.

Regla central:

```text id="x1axww"
Todo registro contable debe pertenecer a un tenant, respetar partida doble, asociarse a un periodo contable, preservar trazabilidad hacia su fuente, impedir duplicados por evento financiero, bloquear modificación de asientos contabilizados, permitir reversos auditados, usar Decimal para dinero, no crear pagos, no modificar estados de cuenta, no confirmar conciliación bancaria y no exponerse mediante endpoints públicos.
```

---

## 3. Decisión principal del modelo

El módulo incorporará diez tablas principales:

```text id="5azl8r"
accounting_policies
chart_of_accounts
accounting_accounts
accounting_periods
accounting_mapping_rules
journal_entries
journal_entry_lines
accounting_source_event_links
accounting_balance_snapshots
accounting_closing_runs
```

---

## 4. Clasificación de tablas

### 4.1. Tablas tenant-scoped

Todas las tablas MVP son tenant-scoped:

```text id="e4b9t5"
accounting_policies
chart_of_accounts
accounting_accounts
accounting_periods
accounting_mapping_rules
journal_entries
journal_entry_lines
accounting_source_event_links
accounting_balance_snapshots
accounting_closing_runs
```

Todas deben incluir:

```text id="war39c"
tenant_id
```

---

### 4.2. Tablas platform-scoped futuras

En una extensión posterior se podría crear:

```text id="oyhp22"
chart_of_accounts_templates
chart_of_accounts_template_accounts
```

Estas podrían ser platform-scoped, pero no forman parte del MVP obligatorio.

---

## 5. Tablas externas relacionadas

El modelo se relaciona con tablas existentes de RESIDENT Core:

```text id="sya8hc"
tenants
user_profiles
charges
charge_adjustments
charge_reversals
payments
payment_allocations
payment_reversals
account_statements
bank_accounts
bank_transactions
reconciliation_matches
provider_transactions
provider_payment_mappings
provider_settlement_records
open_banking_transactions
secure_documents
secure_document_files
audit_logs
```

Relación conceptual:

```text id="ny6gxz"
Charges / Payments / Reconciliation / Provider Settlements
        ↓
Accounting Source Event
        ↓
Accounting Mapping Rule
        ↓
Journal Entry
        ↓
Journal Entry Lines
        ↓
Accounting Reports
```

---

## 6. Principios de modelado

### 6.1. Tenant isolation obligatorio

Toda tabla contable operativa debe tener `tenant_id`.

Toda consulta debe filtrar por `tenant_id`.

Patrón requerido:

```typescript id="b75mw7"
await prisma.journalEntry.findFirst({
  where: {
    id: journalEntryId,
    tenantId: currentTenant.id,
    archivedAt: null
  }
});
```

Patrón prohibido:

```typescript id="kcvrc6"
await prisma.journalEntry.findUnique({
  where: { id: journalEntryId }
});
```

---

### 6.2. Partida doble obligatoria

Todo asiento `posted` debe cumplir:

```text id="ufipe2"
total_debit = total_credit
```

Además:

```text id="ou2wna"
- cada línea debe tener débito o crédito, pero no ambos;
- no se permiten líneas con ambos montos en cero;
- total_debit y total_credit deben calcularse server-side;
- el cliente no debe enviar totales como fuente de verdad.
```

---

### 6.3. Inmutabilidad después de posting

Un asiento `posted` no se edita.

Corrección permitida:

```text id="rfv5m3"
posted journal entry
  -> reversal journal entry
  -> correcting journal entry si aplica
```

---

### 6.4. Source-linked accounting

Todo asiento automático debe vincularse a un evento fuente mediante:

```text id="xk99wd"
accounting_source_event_links
```

Ejemplo:

```text id="5lne9p"
tenantId + sourceModule + sourceResourceType + sourceResourceId + sourceEventType
```

---

### 6.5. Idempotencia por evento fuente

El mismo evento financiero no debe producir asientos duplicados.

Regla:

```text id="38z6dx"
Un source event activo debe tener como máximo un JournalEntry posted activo, salvo reversal/correction explícito.
```

---

### 6.6. Period-aware

Todo asiento debe pertenecer a un periodo contable.

Regla:

```text id="4tyfeq"
posting_date determina accounting_period_id.
```

No se debe contabilizar en periodo:

```text id="rp1h0k"
locked
closed
archived
```

salvo flujo formal de reapertura y permisos especiales.

---

### 6.7. Ledger no muta módulos operativos

El ledger no debe crear ni modificar:

```text id="b8s5yy"
payments
payment_allocations
account_statements
bank_transactions
reconciliation_matches
provider_payment_mappings
open_banking_transactions
```

El ledger registra representación contable, no ejecuta operaciones financieras.

---

### 6.8. Decimal money

Todos los montos usan:

```text id="amzi7q"
Decimal(12,2)
```

Prohibido:

```text id="lww98r"
float
double
JavaScript number como fuente de verdad monetaria
```

---

## 7. Tablas del modelo

---

# 8. Entidad `AccountingPolicy`

## 8.1. Propósito

Representa la política contable básica de un tenant.

Define moneda, método contable, reglas de numeración, reglas de cierre y reglas de protección de cuentas.

---

## 8.2. Tabla

```text id="d92uwo"
accounting_policies
```

---

## 8.3. Campos

| Campo                           |        Tipo | Requerido | Descripción                |
| ------------------------------- | ----------: | --------: | -------------------------- |
| id                              |        UUID |        Sí | Identificador              |
| tenantId                        |        UUID |        Sí | Tenant propietario         |
| baseCurrency                    |        Enum |        Sí | Moneda base                |
| accountingMethod                |        Enum |        Sí | cash / accrual / hybrid    |
| fiscalYearStartMonth            |         Int |        Sí | Mes inicial del año fiscal |
| fiscalYearStartDay              |         Int |        Sí | Día inicial del año fiscal |
| journalNumberingMode            | Enum/String |        Sí | Modo de numeración         |
| allowManualEntries              |     Boolean |        Sí | Permite asientos manuales  |
| requireApprovalForManualEntries |     Boolean |        Sí | Requiere aprobación        |
| allowPostingToClosedPeriod      |     Boolean |        Sí | Debe ser false en MVP      |
| allowPostingToControlAccounts   |     Boolean |        Sí | Default false              |
| protectedControlAccountsEnabled |     Boolean |        Sí | Protege cuentas de control |
| status                          |        Enum |        Sí | Estado                     |
| activatedBy                     |        UUID |        No | Usuario activador          |
| disabledBy                      |        UUID |        No | Usuario deshabilitador     |
| archivedBy                      |        UUID |        No | Usuario archivador         |
| createdBy                       |        UUID |        No | Usuario creador            |
| updatedBy                       |        UUID |        No | Usuario actualizador       |
| createdAt                       |    DateTime |        Sí | Fecha creación             |
| updatedAt                       |    DateTime |        Sí | Fecha actualización        |
| activatedAt                     |    DateTime |        No | Fecha activación           |
| disabledAt                      |    DateTime |        No | Fecha deshabilitación      |
| archivedAt                      |    DateTime |        No | Fecha archivo              |
| disableReason                   |      String |        No | Razón deshabilitación      |
| archiveReason                   |      String |        No | Razón archivo              |
| metadata                        |        Json |        No | Metadata segura            |

---

## 8.4. Reglas

```text id="bgt9oj"
- tenantId obligatorio.
- baseCurrency MVP = USD.
- allowPostingToClosedPeriod debe ser false en MVP.
- allowPostingToControlAccounts debe ser false por defecto.
- solo una política active por tenant.
- archived no se reactiva.
- metadata no debe contener secretos ni datos contables masivos.
```

---

# 9. Entidad `ChartOfAccounts`

## 9.1. Propósito

Representa el plan de cuentas contable de un tenant.

---

## 9.2. Tabla

```text id="p3l50m"
chart_of_accounts
```

---

## 9.3. Campos

| Campo         |     Tipo | Requerido | Descripción          |
| ------------- | -------: | --------: | -------------------- |
| id            |     UUID |        Sí | Identificador        |
| tenantId      |     UUID |        Sí | Tenant propietario   |
| name          |   String |        Sí | Nombre del plan      |
| description   |   String |        No | Descripción          |
| status        |     Enum |        Sí | Estado               |
| templateKey   |   String |        No | Plantilla usada      |
| version       |   String |        No | Versión del plan     |
| isDefault     |  Boolean |        Sí | Plan por defecto     |
| activatedBy   |     UUID |        No | Usuario activador    |
| archivedBy    |     UUID |        No | Usuario archivador   |
| createdBy     |     UUID |        No | Usuario creador      |
| updatedBy     |     UUID |        No | Usuario actualizador |
| createdAt     | DateTime |        Sí | Fecha creación       |
| updatedAt     | DateTime |        Sí | Fecha actualización  |
| activatedAt   | DateTime |        No | Fecha activación     |
| archivedAt    | DateTime |        No | Fecha archivo        |
| archiveReason |   String |        No | Razón archivo        |
| metadata      |     Json |        No | Metadata segura      |

---

## 9.4. Reglas

```text id="zovwm7"
- tenantId obligatorio.
- puede existir más de un chart histórico.
- solo un chart active/default por tenant en MVP.
- active requiere cuentas mínimas.
- archived no se usa para nuevos postings.
- no se debe eliminar físicamente si tiene journal entries asociados.
```

---

# 10. Entidad `AccountingAccount`

## 10.1. Propósito

Representa una cuenta contable individual dentro del plan de cuentas.

---

## 10.2. Tabla

```text id="zkcnfu"
accounting_accounts
```

---

## 10.3. Campos

| Campo             |     Tipo | Requerido | Descripción                           |
| ----------------- | -------: | --------: | ------------------------------------- |
| id                |     UUID |        Sí | Identificador                         |
| tenantId          |     UUID |        Sí | Tenant propietario                    |
| chartOfAccountsId |     UUID |        Sí | Plan de cuentas                       |
| parentAccountId   |     UUID |        No | Cuenta padre                          |
| accountCode       |   String |        Sí | Código contable                       |
| accountName       |   String |        Sí | Nombre de cuenta                      |
| accountType       |     Enum |        Sí | asset/liability/equity/income/expense |
| normalBalance     |     Enum |        Sí | debit/credit                          |
| level             |      Int |        Sí | Nivel jerárquico                      |
| isPostingAllowed  |  Boolean |        Sí | Permite movimientos directos          |
| isControlAccount  |  Boolean |        Sí | Cuenta de control                     |
| isSystemAccount   |  Boolean |        Sí | Cuenta creada por sistema             |
| status            |     Enum |        Sí | Estado                                |
| description       |   String |        No | Descripción                           |
| activatedBy       |     UUID |        No | Usuario activador                     |
| disabledBy        |     UUID |        No | Usuario deshabilitador                |
| archivedBy        |     UUID |        No | Usuario archivador                    |
| createdBy         |     UUID |        No | Usuario creador                       |
| updatedBy         |     UUID |        No | Usuario actualizador                  |
| createdAt         | DateTime |        Sí | Fecha creación                        |
| updatedAt         | DateTime |        Sí | Fecha actualización                   |
| activatedAt       | DateTime |        No | Fecha activación                      |
| disabledAt        | DateTime |        No | Fecha deshabilitación                 |
| archivedAt        | DateTime |        No | Fecha archivo                         |
| disableReason     |   String |        No | Razón deshabilitación                 |
| archiveReason     |   String |        No | Razón archivo                         |
| metadata          |     Json |        No | Metadata segura                       |

---

## 10.4. Reglas

```text id="xb4q2d"
- accountCode único por tenant y chartOfAccountsId.
- parentAccountId debe pertenecer al mismo tenant y chart.
- parentAccountId no puede generar ciclos.
- cuentas con hijos pueden tener isPostingAllowed=false.
- solo active + isPostingAllowed=true puede recibir líneas posted.
- isControlAccount requiere permiso especial para posting manual.
- archived no recibe postings.
```

---

# 11. Entidad `AccountingPeriod`

## 11.1. Propósito

Representa un periodo contable del tenant.

---

## 11.2. Tabla

```text id="iplckg"
accounting_periods
```

---

## 11.3. Campos

| Campo         |     Tipo | Requerido | Descripción           |
| ------------- | -------: | --------: | --------------------- |
| id            |     UUID |        Sí | Identificador         |
| tenantId      |     UUID |        Sí | Tenant propietario    |
| periodCode    |   String |        Sí | Código del periodo    |
| periodName    |   String |        Sí | Nombre                |
| periodType    |     Enum |        Sí | monthly/annual/custom |
| startDate     | DateTime |        Sí | Inicio                |
| endDate       | DateTime |        Sí | Fin                   |
| status        |     Enum |        Sí | Estado                |
| lockedBy      |     UUID |        No | Usuario que bloqueó   |
| closedBy      |     UUID |        No | Usuario que cerró     |
| reopenedBy    |     UUID |        No | Usuario que reabrió   |
| archivedBy    |     UUID |        No | Usuario que archivó   |
| createdBy     |     UUID |        No | Usuario creador       |
| updatedBy     |     UUID |        No | Usuario actualizador  |
| lockedAt      | DateTime |        No | Fecha bloqueo         |
| closedAt      | DateTime |        No | Fecha cierre          |
| reopenedAt    | DateTime |        No | Fecha reapertura      |
| archivedAt    | DateTime |        No | Fecha archivo         |
| closeReason   |   String |        No | Razón cierre          |
| reopenReason  |   String |        No | Razón reapertura      |
| archiveReason |   String |        No | Razón archivo         |
| createdAt     | DateTime |        Sí | Fecha creación        |
| updatedAt     | DateTime |        Sí | Fecha actualización   |
| metadata      |     Json |        No | Metadata segura       |

---

## 11.4. Reglas

```text id="ezwnal"
- periodCode único por tenant.
- startDate <= endDate.
- periodos de un tenant no deben solaparse para el mismo periodType operativo.
- open permite posting.
- locked bloquea posting ordinario.
- closed bloquea posting.
- reopened permite correcciones controladas.
- archived no se usa para nuevos postings.
```

---

# 12. Entidad `AccountingMappingRule`

## 12.1. Propósito

Representa una regla de mapeo desde un evento fuente hacia un asiento contable.

Ejemplo:

```text id="h8sp7e"
charge.issued
  Dr AccountsReceivable
  Cr DuesRevenue
```

---

## 12.2. Tabla

```text id="tvi264"
accounting_mapping_rules
```

---

## 12.3. Campos

| Campo               |     Tipo | Requerido | Descripción              |
| ------------------- | -------: | --------: | ------------------------ |
| id                  |     UUID |        Sí | Identificador            |
| tenantId            |     UUID |        Sí | Tenant propietario       |
| ruleCode            |   String |        Sí | Código de regla          |
| ruleName            |   String |        Sí | Nombre                   |
| sourceModule        |     Enum |        Sí | Módulo fuente            |
| sourceEventType     |   String |        Sí | Tipo de evento           |
| sourceResourceType  |   String |        Sí | Tipo de recurso fuente   |
| status              |     Enum |        Sí | Estado                   |
| priority            |      Int |        Sí | Prioridad                |
| debitAccountId      |     UUID |        Sí | Cuenta débito            |
| creditAccountId     |     UUID |        Sí | Cuenta crédito           |
| amountSource        |   String |        Sí | Fuente del monto         |
| descriptionTemplate |   String |        No | Plantilla de descripción |
| effectiveFrom       | DateTime |        No | Vigencia inicio          |
| effectiveTo         | DateTime |        No | Vigencia fin             |
| activatedBy         |     UUID |        No | Usuario activador        |
| disabledBy          |     UUID |        No | Usuario deshabilitador   |
| archivedBy          |     UUID |        No | Usuario archivador       |
| createdBy           |     UUID |        No | Usuario creador          |
| updatedBy           |     UUID |        No | Usuario actualizador     |
| createdAt           | DateTime |        Sí | Fecha creación           |
| updatedAt           | DateTime |        Sí | Fecha actualización      |
| activatedAt         | DateTime |        No | Fecha activación         |
| disabledAt          | DateTime |        No | Fecha deshabilitación    |
| archivedAt          | DateTime |        No | Fecha archivo            |
| disableReason       |   String |        No | Razón deshabilitación    |
| archiveReason       |   String |        No | Razón archivo            |
| metadata            |     Json |        No | Metadata segura          |

---

## 12.4. Reglas

```text id="k2mhyo"
- tenantId obligatorio.
- debitAccountId y creditAccountId deben pertenecer al mismo tenant.
- cuentas deben estar active para activar la regla.
- debitAccountId no debe ser igual a creditAccountId salvo caso técnico justificado.
- sourceModule + sourceEventType + sourceResourceType + priority debe ser controlado.
- active requiere cuentas activas y posteables.
- no inventar cuentas si no existe regla.
```

---

# 13. Entidad `JournalEntry`

## 13.1. Propósito

Representa un asiento contable.

---

## 13.2. Tabla

```text id="eqz838"
journal_entries
```

---

## 13.3. Campos

| Campo                    |        Tipo | Requerido | Descripción                    |
| ------------------------ | ----------: | --------: | ------------------------------ |
| id                       |        UUID |        Sí | Identificador                  |
| tenantId                 |        UUID |        Sí | Tenant propietario             |
| accountingPeriodId       |        UUID |        Sí | Periodo                        |
| journalNumber            |      String |        Sí | Número de asiento              |
| entryDate                |    DateTime |        Sí | Fecha económica/documental     |
| postingDate              |    DateTime |        Sí | Fecha contable                 |
| entryType                |        Enum |        Sí | automatic/manual/reversal/etc. |
| sourceType               |        Enum |        Sí | system/manual/integration/etc. |
| sourceModule             |        Enum |        No | Módulo fuente                  |
| sourceResourceType       |      String |        No | Tipo recurso fuente            |
| sourceResourceId         | UUID/String |        No | ID recurso fuente              |
| sourceEventType          |      String |        No | Evento fuente                  |
| status                   |        Enum |        Sí | Estado                         |
| description              |      String |        Sí | Descripción                    |
| totalDebit               |     Decimal |        Sí | Total débito calculado         |
| totalCredit              |     Decimal |        Sí | Total crédito calculado        |
| currency                 |        Enum |        Sí | Moneda                         |
| idempotencyKey           |      String |        No | Key server-side                |
| approvedBy               |        UUID |        No | Usuario aprobador              |
| postedBy                 |        UUID |        No | Usuario que posteó             |
| reversedBy               |        UUID |        No | Usuario reversó                |
| voidedBy                 |        UUID |        No | Usuario anuló draft            |
| archivedBy               |        UUID |        No | Usuario archivó                |
| createdBy                |        UUID |        No | Usuario creador                |
| updatedBy                |        UUID |        No | Usuario actualizador           |
| approvedAt               |    DateTime |        No | Fecha aprobación               |
| postedAt                 |    DateTime |        No | Fecha posting                  |
| reversedAt               |    DateTime |        No | Fecha reversal                 |
| voidedAt                 |    DateTime |        No | Fecha void                     |
| archivedAt               |    DateTime |        No | Fecha archive                  |
| reversalOfJournalEntryId |        UUID |        No | Asiento original               |
| reversalJournalEntryId   |        UUID |        No | Asiento reverso                |
| reverseReason            |      String |        No | Razón de reverso               |
| voidReason               |      String |        No | Razón de void                  |
| archiveReason            |      String |        No | Razón archivo                  |
| createdAt                |    DateTime |        Sí | Fecha creación                 |
| updatedAt                |    DateTime |        Sí | Fecha actualización            |
| metadata                 |        Json |        No | Metadata segura                |

---

## 13.4. Reglas

```text id="ztd4c0"
- tenantId obligatorio.
- accountingPeriodId debe pertenecer al tenant.
- journalNumber único por tenant.
- totalDebit y totalCredit calculados server-side.
- posted requiere totalDebit = totalCredit.
- posted requiere al menos dos líneas.
- posted requiere periodo open/reopened.
- posted es inmutable.
- automatic requiere sourceModule/sourceResourceType/sourceResourceId/sourceEventType.
- reversal requiere reversalOfJournalEntryId.
- idempotencyKey se calcula server-side para eventos automáticos.
```

---

# 14. Entidad `JournalEntryLine`

## 14.1. Propósito

Representa una línea de asiento contable.

---

## 14.2. Tabla

```text id="v2ujwq"
journal_entry_lines
```

---

## 14.3. Campos

| Campo               |        Tipo | Requerido | Descripción          |
| ------------------- | ----------: | --------: | -------------------- |
| id                  |        UUID |        Sí | Identificador        |
| tenantId            |        UUID |        Sí | Tenant propietario   |
| journalEntryId      |        UUID |        Sí | Asiento              |
| accountingAccountId |        UUID |        Sí | Cuenta contable      |
| lineNumber          |         Int |        Sí | Número de línea      |
| description         |      String |        No | Descripción de línea |
| debitAmount         |     Decimal |        Sí | Monto débito         |
| creditAmount        |     Decimal |        Sí | Monto crédito        |
| currency            |        Enum |        Sí | Moneda               |
| sourceLineType      |      String |        No | Tipo de línea fuente |
| sourceLineId        | UUID/String |        No | ID línea fuente      |
| createdAt           |    DateTime |        Sí | Fecha creación       |
| updatedAt           |    DateTime |        Sí | Fecha actualización  |
| metadata            |        Json |        No | Metadata segura      |

---

## 14.4. Reglas

```text id="ctsiwn"
- tenantId obligatorio.
- journalEntryId debe pertenecer al tenant.
- accountingAccountId debe pertenecer al tenant.
- línea debe tener debitAmount > 0 o creditAmount > 0, pero no ambos.
- debitAmount y creditAmount no pueden ser negativos.
- currency debe coincidir con JournalEntry.currency.
- lineNumber único por journalEntry.
- no se editan líneas de JournalEntry posted.
```

---

# 15. Entidad `AccountingSourceEventLink`

## 15.1. Propósito

Representa la relación entre un evento fuente y un asiento contable.

Sirve para trazabilidad e idempotencia.

---

## 15.2. Tabla

```text id="ghryul"
accounting_source_event_links
```

---

## 15.3. Campos

| Campo                 |     Tipo | Requerido | Descripción         |
| --------------------- | -------: | --------: | ------------------- |
| id                    |     UUID |        Sí | Identificador       |
| tenantId              |     UUID |        Sí | Tenant propietario  |
| journalEntryId        |     UUID |        Sí | Asiento contable    |
| sourceModule          |     Enum |        Sí | Módulo fuente       |
| sourceResourceType    |   String |        Sí | Tipo recurso        |
| sourceResourceId      |   String |        Sí | ID recurso          |
| sourceEventType       |   String |        Sí | Tipo evento         |
| sourceEventOccurredAt | DateTime |        No | Fecha evento fuente |
| idempotencyKey        |   String |        Sí | Key hash            |
| status                |     Enum |        Sí | Estado              |
| createdAt             | DateTime |        Sí | Fecha creación      |
| archivedAt            | DateTime |        No | Fecha archivo       |
| archivedBy            |     UUID |        No | Usuario archivador  |
| archiveReason         |   String |        No | Razón archivo       |
| metadata              |     Json |        No | Metadata segura     |

---

## 15.4. Reglas

```text id="lt2nc4"
- un source event activo no debe duplicarse.
- journalEntryId debe pertenecer al tenant.
- idempotencyKey se calcula server-side.
- archived no elimina trazabilidad histórica.
- sourceResourceId puede ser UUID como texto para soportar varias fuentes.
```

---

# 16. Entidad `AccountingBalanceSnapshot`

## 16.1. Propósito

Representa un snapshot de saldo contable por cuenta y periodo.

Es una optimización para reportes y cierre.

---

## 16.2. Tabla

```text id="d3r92t"
accounting_balance_snapshots
```

---

## 16.3. Campos

| Campo               |     Tipo | Requerido | Descripción        |
| ------------------- | -------: | --------: | ------------------ |
| id                  |     UUID |        Sí | Identificador      |
| tenantId            |     UUID |        Sí | Tenant propietario |
| accountingPeriodId  |     UUID |        Sí | Periodo            |
| accountingAccountId |     UUID |        Sí | Cuenta             |
| openingDebit        |  Decimal |        Sí | Débito inicial     |
| openingCredit       |  Decimal |        Sí | Crédito inicial    |
| periodDebit         |  Decimal |        Sí | Débito periodo     |
| periodCredit        |  Decimal |        Sí | Crédito periodo    |
| closingDebit        |  Decimal |        Sí | Débito final       |
| closingCredit       |  Decimal |        Sí | Crédito final      |
| currency            |     Enum |        Sí | Moneda             |
| snapshotAt          | DateTime |        Sí | Fecha snapshot     |
| generatedBy         |     UUID |        No | Usuario/sistema    |
| closingRunId        |     UUID |        No | Cierre que generó  |
| createdAt           | DateTime |        Sí | Fecha creación     |
| metadata            |     Json |        No | Metadata segura    |

---

## 16.4. Reglas

```text id="kk1qcl"
- snapshots no son fuente primaria.
- fuente primaria son JournalEntryLines posted.
- montos no pueden ser negativos.
- un snapshot por tenant/period/account/closingRun si aplica.
- se puede regenerar bajo reglas controladas.
```

---

# 17. Entidad `AccountingClosingRun`

## 17.1. Propósito

Representa un proceso de cierre contable de periodo.

---

## 17.2. Tabla

```text id="t7k02h"
accounting_closing_runs
```

---

## 17.3. Campos

| Campo                  |     Tipo | Requerido | Descripción                  |
| ---------------------- | -------: | --------: | ---------------------------- |
| id                     |     UUID |        Sí | Identificador                |
| tenantId               |     UUID |        Sí | Tenant propietario           |
| accountingPeriodId     |     UUID |        Sí | Periodo                      |
| status                 |     Enum |        Sí | Estado                       |
| startedBy              |     UUID |        No | Usuario que inició           |
| completedBy            |     UUID |        No | Usuario/sistema que completó |
| cancelledBy            |     UUID |        No | Usuario que canceló          |
| archivedBy             |     UUID |        No | Usuario archivador           |
| startedAt              | DateTime |        No | Fecha inicio                 |
| completedAt            | DateTime |        No | Fecha completion             |
| failedAt               | DateTime |        No | Fecha fallo                  |
| cancelledAt            | DateTime |        No | Fecha cancelación            |
| archivedAt             | DateTime |        No | Fecha archivo                |
| entriesChecked         |      Int |        Sí | Asientos revisados           |
| entriesPosted          |      Int |        Sí | Asientos contabilizados      |
| draftEntriesFound      |      Int |        Sí | Drafts encontrados           |
| unbalancedEntriesFound |      Int |        Sí | Desbalanceados               |
| warningsCount          |      Int |        Sí | Advertencias                 |
| errorCode              |   String |        No | Código de error              |
| errorMessage           |   String |        No | Mensaje sanitizado           |
| closePeriodOnSuccess   |  Boolean |        Sí | Cierra periodo si pasa       |
| createdAt              | DateTime |        Sí | Fecha creación               |
| updatedAt              | DateTime |        Sí | Fecha actualización          |
| metadata               |     Json |        No | Metadata segura              |

---

## 17.4. Reglas

```text id="yj2r8x"
- accountingPeriodId debe pertenecer al tenant.
- completed requiere completedAt.
- failed requiere failedAt y errorCode.
- conteos no pueden ser negativos.
- completed puede cerrar periodo.
- failed no debe cerrar periodo.
- cancelled no debe cerrar periodo.
```

---

## 18. Enums del modelo

### 18.1. `AccountingPolicyStatus`

```text id="5w9oo4"
draft
active
inactive
archived
```

---

### 18.2. `AccountingMethod`

```text id="b9rp72"
cash
accrual
hybrid
```

---

### 18.3. `JournalNumberingMode`

```text id="340yet"
systemSequential
periodSequential
manualWithValidation
```

MVP recomendado:

```text id="6y22ic"
periodSequential
```

---

### 18.4. `ChartOfAccountsStatus`

```text id="53fu64"
draft
active
inactive
archived
```

---

### 18.5. `AccountingAccountType`

```text id="545ep1"
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

```text id="0ciklp"
asset
liability
equity
income
expense
```

---

### 18.6. `NormalBalance`

```text id="r4efkk"
debit
credit
```

---

### 18.7. `AccountingAccountStatus`

```text id="sj8cs0"
draft
active
inactive
archived
```

---

### 18.8. `AccountingPeriodType`

```text id="rqj3w1"
monthly
quarterly
annual
custom
```

MVP recomendado:

```text id="sl6r5x"
monthly
annual
```

---

### 18.9. `AccountingPeriodStatus`

```text id="4m2z29"
open
locked
closed
reopened
archived
```

---

### 18.10. `AccountingMappingRuleStatus`

```text id="kx26hi"
draft
active
inactive
archived
```

---

### 18.11. `JournalEntryType`

```text id="1ofo08"
automatic
manual
reversal
adjustment
closing
opening
migration
```

---

### 18.12. `JournalEntryStatus`

```text id="9kvwrb"
draft
pendingApproval
approved
posted
reversed
voided
archived
```

---

### 18.13. `JournalEntrySourceType`

```text id="lqlyq5"
system
manual
integration
migration
closing
```

---

### 18.14. `AccountingSourceModule`

```text id="4bfqpp"
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

### 18.15. `AccountingSourceEventLinkStatus`

```text id="pir777"
active
reversed
superseded
archived
```

---

### 18.16. `AccountingClosingRunStatus`

```text id="k1aqxd"
draft
running
completed
completedWithWarnings
failed
cancelled
archived
```

---

### 18.17. `Currency`

```text id="k3x4qd"
USD
```

---

## 19. Prisma schema preliminar

> Nota: este esquema es preliminar. Debe ajustarse a las convenciones exactas del repositorio RESIDENT Core, nombres existentes de modelos, enums globales y relaciones ya creadas.

```prisma id="x5k2f2"
enum AccountingPolicyStatus {
  DRAFT     @map("draft")
  ACTIVE    @map("active")
  INACTIVE  @map("inactive")
  ARCHIVED  @map("archived")

  @@map("accounting_policy_status")
}

enum AccountingMethod {
  CASH     @map("cash")
  ACCRUAL  @map("accrual")
  HYBRID   @map("hybrid")

  @@map("accounting_method")
}

enum JournalNumberingMode {
  SYSTEM_SEQUENTIAL          @map("systemSequential")
  PERIOD_SEQUENTIAL          @map("periodSequential")
  MANUAL_WITH_VALIDATION     @map("manualWithValidation")

  @@map("journal_numbering_mode")
}

enum ChartOfAccountsStatus {
  DRAFT     @map("draft")
  ACTIVE    @map("active")
  INACTIVE  @map("inactive")
  ARCHIVED  @map("archived")

  @@map("chart_of_accounts_status")
}

enum AccountingAccountType {
  ASSET             @map("asset")
  LIABILITY         @map("liability")
  EQUITY            @map("equity")
  INCOME            @map("income")
  EXPENSE           @map("expense")
  CONTRA_ASSET      @map("contraAsset")
  CONTRA_LIABILITY  @map("contraLiability")
  CONTRA_EQUITY     @map("contraEquity")
  CONTRA_INCOME     @map("contraIncome")
  CONTRA_EXPENSE    @map("contraExpense")

  @@map("accounting_account_type")
}

enum NormalBalance {
  DEBIT   @map("debit")
  CREDIT  @map("credit")

  @@map("normal_balance")
}

enum AccountingAccountStatus {
  DRAFT     @map("draft")
  ACTIVE    @map("active")
  INACTIVE  @map("inactive")
  ARCHIVED  @map("archived")

  @@map("accounting_account_status")
}

enum AccountingPeriodType {
  MONTHLY    @map("monthly")
  QUARTERLY  @map("quarterly")
  ANNUAL     @map("annual")
  CUSTOM     @map("custom")

  @@map("accounting_period_type")
}

enum AccountingPeriodStatus {
  OPEN      @map("open")
  LOCKED    @map("locked")
  CLOSED    @map("closed")
  REOPENED  @map("reopened")
  ARCHIVED  @map("archived")

  @@map("accounting_period_status")
}

enum AccountingMappingRuleStatus {
  DRAFT     @map("draft")
  ACTIVE    @map("active")
  INACTIVE  @map("inactive")
  ARCHIVED  @map("archived")

  @@map("accounting_mapping_rule_status")
}

enum JournalEntryType {
  AUTOMATIC   @map("automatic")
  MANUAL      @map("manual")
  REVERSAL    @map("reversal")
  ADJUSTMENT  @map("adjustment")
  CLOSING     @map("closing")
  OPENING     @map("opening")
  MIGRATION   @map("migration")

  @@map("journal_entry_type")
}

enum JournalEntryStatus {
  DRAFT             @map("draft")
  PENDING_APPROVAL  @map("pendingApproval")
  APPROVED          @map("approved")
  POSTED            @map("posted")
  REVERSED          @map("reversed")
  VOIDED            @map("voided")
  ARCHIVED          @map("archived")

  @@map("journal_entry_status")
}

enum JournalEntrySourceType {
  SYSTEM       @map("system")
  MANUAL       @map("manual")
  INTEGRATION  @map("integration")
  MIGRATION    @map("migration")
  CLOSING      @map("closing")

  @@map("journal_entry_source_type")
}

enum AccountingSourceModule {
  DUES_FEES                     @map("duesFees")
  PAYMENTS                      @map("payments")
  ACCOUNT_STATEMENTS            @map("accountStatements")
  BANK_RECONCILIATION           @map("bankReconciliation")
  PAYMENT_PROVIDER_INTEGRATION  @map("paymentProviderIntegration")
  OPEN_BANKING_INTEGRATION      @map("openBankingIntegration")
  RESERVATIONS                  @map("reservations")
  FINES                         @map("fines")
  MANUAL_ACCOUNTING             @map("manualAccounting")
  SYSTEM                        @map("system")
  MIGRATION                     @map("migration")
  OTHER                         @map("other")

  @@map("accounting_source_module")
}

enum AccountingSourceEventLinkStatus {
  ACTIVE      @map("active")
  REVERSED    @map("reversed")
  SUPERSEDED  @map("superseded")
  ARCHIVED    @map("archived")

  @@map("accounting_source_event_link_status")
}

enum AccountingClosingRunStatus {
  DRAFT                    @map("draft")
  RUNNING                  @map("running")
  COMPLETED                @map("completed")
  COMPLETED_WITH_WARNINGS  @map("completedWithWarnings")
  FAILED                   @map("failed")
  CANCELLED                @map("cancelled")
  ARCHIVED                 @map("archived")

  @@map("accounting_closing_run_status")
}

model AccountingPolicy {
  id                               String                  @id @default(uuid()) @db.Uuid
  tenantId                         String                  @map("tenant_id") @db.Uuid
  baseCurrency                     Currency                @default(USD) @map("base_currency")
  accountingMethod                 AccountingMethod        @default(ACCRUAL) @map("accounting_method")
  fiscalYearStartMonth             Int                     @default(1) @map("fiscal_year_start_month")
  fiscalYearStartDay               Int                     @default(1) @map("fiscal_year_start_day")
  journalNumberingMode             JournalNumberingMode    @default(PERIOD_SEQUENTIAL) @map("journal_numbering_mode")

  allowManualEntries               Boolean                 @default(true) @map("allow_manual_entries")
  requireApprovalForManualEntries  Boolean                 @default(false) @map("require_approval_for_manual_entries")
  allowPostingToClosedPeriod       Boolean                 @default(false) @map("allow_posting_to_closed_period")
  allowPostingToControlAccounts    Boolean                 @default(false) @map("allow_posting_to_control_accounts")
  protectedControlAccountsEnabled  Boolean                 @default(true) @map("protected_control_accounts_enabled")

  status                           AccountingPolicyStatus  @default(DRAFT)

  createdBy                        String?                 @map("created_by") @db.Uuid
  updatedBy                        String?                 @map("updated_by") @db.Uuid
  activatedBy                      String?                 @map("activated_by") @db.Uuid
  disabledBy                       String?                 @map("disabled_by") @db.Uuid
  archivedBy                       String?                 @map("archived_by") @db.Uuid

  createdAt                        DateTime                @default(now()) @map("created_at")
  updatedAt                        DateTime                @updatedAt @map("updated_at")
  activatedAt                      DateTime?               @map("activated_at")
  disabledAt                       DateTime?               @map("disabled_at")
  archivedAt                       DateTime?               @map("archived_at")
  disableReason                    String?                 @map("disable_reason") @db.Text
  archiveReason                    String?                 @map("archive_reason") @db.Text

  metadata                         Json?

  tenant                           Tenant                  @relation(fields: [tenantId], references: [id])

  @@index([tenantId])
  @@index([tenantId, status])
  @@index([tenantId, baseCurrency])
  @@index([createdAt])
  @@map("accounting_policies")
}

model ChartOfAccounts {
  id            String                  @id @default(uuid()) @db.Uuid
  tenantId      String                  @map("tenant_id") @db.Uuid
  name          String                  @db.VarChar(160)
  description   String?                 @db.Text
  status        ChartOfAccountsStatus   @default(DRAFT)
  templateKey   String?                 @map("template_key") @db.VarChar(100)
  version       String?                 @db.VarChar(50)
  isDefault     Boolean                 @default(false) @map("is_default")

  createdBy     String?                 @map("created_by") @db.Uuid
  updatedBy     String?                 @map("updated_by") @db.Uuid
  activatedBy   String?                 @map("activated_by") @db.Uuid
  archivedBy    String?                 @map("archived_by") @db.Uuid

  createdAt     DateTime                @default(now()) @map("created_at")
  updatedAt     DateTime                @updatedAt @map("updated_at")
  activatedAt   DateTime?               @map("activated_at")
  archivedAt    DateTime?               @map("archived_at")
  archiveReason String?                 @map("archive_reason") @db.Text

  metadata      Json?

  tenant        Tenant                  @relation(fields: [tenantId], references: [id])
  accounts      AccountingAccount[]
  mappingRules  AccountingMappingRule[]

  @@index([tenantId])
  @@index([tenantId, status])
  @@index([tenantId, isDefault])
  @@index([tenantId, templateKey])
  @@index([createdAt])
  @@map("chart_of_accounts")
}

model AccountingAccount {
  id                  String                    @id @default(uuid()) @db.Uuid
  tenantId            String                    @map("tenant_id") @db.Uuid
  chartOfAccountsId   String                    @map("chart_of_accounts_id") @db.Uuid
  parentAccountId     String?                   @map("parent_account_id") @db.Uuid

  accountCode         String                    @map("account_code") @db.VarChar(50)
  accountName         String                    @map("account_name") @db.VarChar(200)
  accountType         AccountingAccountType     @map("account_type")
  normalBalance       NormalBalance             @map("normal_balance")
  level               Int                       @default(1)
  isPostingAllowed    Boolean                   @default(true) @map("is_posting_allowed")
  isControlAccount    Boolean                   @default(false) @map("is_control_account")
  isSystemAccount     Boolean                   @default(false) @map("is_system_account")
  status              AccountingAccountStatus   @default(DRAFT)
  description         String?                   @db.Text

  createdBy           String?                   @map("created_by") @db.Uuid
  updatedBy           String?                   @map("updated_by") @db.Uuid
  activatedBy         String?                   @map("activated_by") @db.Uuid
  disabledBy          String?                   @map("disabled_by") @db.Uuid
  archivedBy          String?                   @map("archived_by") @db.Uuid

  createdAt           DateTime                  @default(now()) @map("created_at")
  updatedAt           DateTime                  @updatedAt @map("updated_at")
  activatedAt         DateTime?                 @map("activated_at")
  disabledAt          DateTime?                 @map("disabled_at")
  archivedAt          DateTime?                 @map("archived_at")
  disableReason       String?                   @map("disable_reason") @db.Text
  archiveReason       String?                   @map("archive_reason") @db.Text

  metadata            Json?

  tenant              Tenant                    @relation(fields: [tenantId], references: [id])
  chartOfAccounts     ChartOfAccounts           @relation(fields: [chartOfAccountsId], references: [id])
  parentAccount       AccountingAccount?        @relation("AccountingAccountHierarchy", fields: [parentAccountId], references: [id])
  childAccounts       AccountingAccount[]       @relation("AccountingAccountHierarchy")

  debitMappingRules   AccountingMappingRule[]   @relation("DebitAccountingAccount")
  creditMappingRules  AccountingMappingRule[]   @relation("CreditAccountingAccount")
  journalEntryLines   JournalEntryLine[]
  balanceSnapshots    AccountingBalanceSnapshot[]

  @@index([tenantId])
  @@index([tenantId, chartOfAccountsId])
  @@index([tenantId, parentAccountId])
  @@index([tenantId, accountCode])
  @@index([tenantId, accountType])
  @@index([tenantId, normalBalance])
  @@index([tenantId, status])
  @@index([tenantId, isControlAccount])
  @@index([tenantId, isPostingAllowed])
  @@index([createdAt])
  @@map("accounting_accounts")
}

model AccountingPeriod {
  id            String                   @id @default(uuid()) @db.Uuid
  tenantId      String                   @map("tenant_id") @db.Uuid
  periodCode    String                   @map("period_code") @db.VarChar(50)
  periodName    String                   @map("period_name") @db.VarChar(160)
  periodType    AccountingPeriodType     @map("period_type")
  startDate     DateTime                 @map("start_date")
  endDate       DateTime                 @map("end_date")
  status        AccountingPeriodStatus   @default(OPEN)

  createdBy     String?                  @map("created_by") @db.Uuid
  updatedBy     String?                  @map("updated_by") @db.Uuid
  lockedBy      String?                  @map("locked_by") @db.Uuid
  closedBy      String?                  @map("closed_by") @db.Uuid
  reopenedBy    String?                  @map("reopened_by") @db.Uuid
  archivedBy    String?                  @map("archived_by") @db.Uuid

  createdAt     DateTime                 @default(now()) @map("created_at")
  updatedAt     DateTime                 @updatedAt @map("updated_at")
  lockedAt      DateTime?                @map("locked_at")
  closedAt      DateTime?                @map("closed_at")
  reopenedAt    DateTime?                @map("reopened_at")
  archivedAt    DateTime?                @map("archived_at")

  closeReason   String?                  @map("close_reason") @db.Text
  reopenReason  String?                  @map("reopen_reason") @db.Text
  archiveReason String?                  @map("archive_reason") @db.Text

  metadata      Json?

  tenant        Tenant                   @relation(fields: [tenantId], references: [id])
  journalEntries JournalEntry[]
  balanceSnapshots AccountingBalanceSnapshot[]
  closingRuns    AccountingClosingRun[]

  @@index([tenantId])
  @@index([tenantId, periodCode])
  @@index([tenantId, periodType])
  @@index([tenantId, status])
  @@index([tenantId, startDate, endDate])
  @@index([createdAt])
  @@map("accounting_periods")
}

model AccountingMappingRule {
  id                  String                       @id @default(uuid()) @db.Uuid
  tenantId            String                       @map("tenant_id") @db.Uuid
  chartOfAccountsId   String?                      @map("chart_of_accounts_id") @db.Uuid

  ruleCode            String                       @map("rule_code") @db.VarChar(100)
  ruleName            String                       @map("rule_name") @db.VarChar(200)
  sourceModule        AccountingSourceModule       @map("source_module")
  sourceEventType     String                       @map("source_event_type") @db.VarChar(120)
  sourceResourceType  String                       @map("source_resource_type") @db.VarChar(120)
  status              AccountingMappingRuleStatus  @default(DRAFT)
  priority            Int                          @default(100)

  debitAccountId      String                       @map("debit_account_id") @db.Uuid
  creditAccountId     String                       @map("credit_account_id") @db.Uuid
  amountSource        String                       @map("amount_source") @db.VarChar(120)
  descriptionTemplate String?                      @map("description_template") @db.Text
  effectiveFrom       DateTime?                    @map("effective_from")
  effectiveTo         DateTime?                    @map("effective_to")

  createdBy           String?                      @map("created_by") @db.Uuid
  updatedBy           String?                      @map("updated_by") @db.Uuid
  activatedBy         String?                      @map("activated_by") @db.Uuid
  disabledBy          String?                      @map("disabled_by") @db.Uuid
  archivedBy          String?                      @map("archived_by") @db.Uuid

  createdAt           DateTime                     @default(now()) @map("created_at")
  updatedAt           DateTime                     @updatedAt @map("updated_at")
  activatedAt         DateTime?                    @map("activated_at")
  disabledAt          DateTime?                    @map("disabled_at")
  archivedAt          DateTime?                    @map("archived_at")
  disableReason       String?                      @map("disable_reason") @db.Text
  archiveReason       String?                      @map("archive_reason") @db.Text

  metadata            Json?

  tenant              Tenant                       @relation(fields: [tenantId], references: [id])
  chartOfAccounts     ChartOfAccounts?             @relation(fields: [chartOfAccountsId], references: [id])
  debitAccount        AccountingAccount            @relation("DebitAccountingAccount", fields: [debitAccountId], references: [id])
  creditAccount       AccountingAccount            @relation("CreditAccountingAccount", fields: [creditAccountId], references: [id])

  @@index([tenantId])
  @@index([tenantId, chartOfAccountsId])
  @@index([tenantId, ruleCode])
  @@index([tenantId, sourceModule, sourceEventType])
  @@index([tenantId, sourceResourceType])
  @@index([tenantId, status])
  @@index([tenantId, priority])
  @@index([tenantId, debitAccountId])
  @@index([tenantId, creditAccountId])
  @@index([createdAt])
  @@map("accounting_mapping_rules")
}

model JournalEntry {
  id                       String                    @id @default(uuid()) @db.Uuid
  tenantId                 String                    @map("tenant_id") @db.Uuid
  accountingPeriodId       String                    @map("accounting_period_id") @db.Uuid

  journalNumber            String                    @map("journal_number") @db.VarChar(80)
  entryDate                DateTime                  @map("entry_date")
  postingDate              DateTime                  @map("posting_date")
  entryType                JournalEntryType          @map("entry_type")
  sourceType               JournalEntrySourceType    @map("source_type")
  sourceModule             AccountingSourceModule?   @map("source_module")
  sourceResourceType       String?                   @map("source_resource_type") @db.VarChar(120)
  sourceResourceId         String?                   @map("source_resource_id") @db.VarChar(120)
  sourceEventType          String?                   @map("source_event_type") @db.VarChar(120)

  status                   JournalEntryStatus        @default(DRAFT)
  description              String                    @db.Text
  totalDebit               Decimal                   @default(0) @map("total_debit") @db.Decimal(12, 2)
  totalCredit              Decimal                   @default(0) @map("total_credit") @db.Decimal(12, 2)
  currency                 Currency                  @default(USD)
  idempotencyKey           String?                   @map("idempotency_key") @db.VarChar(128)

  createdBy                String?                   @map("created_by") @db.Uuid
  updatedBy                String?                   @map("updated_by") @db.Uuid
  approvedBy               String?                   @map("approved_by") @db.Uuid
  postedBy                 String?                   @map("posted_by") @db.Uuid
  reversedBy               String?                   @map("reversed_by") @db.Uuid
  voidedBy                 String?                   @map("voided_by") @db.Uuid
  archivedBy               String?                   @map("archived_by") @db.Uuid

  createdAt                DateTime                  @default(now()) @map("created_at")
  updatedAt                DateTime                  @updatedAt @map("updated_at")
  approvedAt               DateTime?                 @map("approved_at")
  postedAt                 DateTime?                 @map("posted_at")
  reversedAt               DateTime?                 @map("reversed_at")
  voidedAt                 DateTime?                 @map("voided_at")
  archivedAt               DateTime?                 @map("archived_at")

  reversalOfJournalEntryId String?                   @map("reversal_of_journal_entry_id") @db.Uuid
  reversalJournalEntryId   String?                   @map("reversal_journal_entry_id") @db.Uuid

  reverseReason            String?                   @map("reverse_reason") @db.Text
  voidReason               String?                   @map("void_reason") @db.Text
  archiveReason            String?                   @map("archive_reason") @db.Text

  metadata                 Json?

  tenant                   Tenant                    @relation(fields: [tenantId], references: [id])
  accountingPeriod         AccountingPeriod          @relation(fields: [accountingPeriodId], references: [id])
  lines                    JournalEntryLine[]
  sourceEventLinks         AccountingSourceEventLink[]

  reversalOfJournalEntry   JournalEntry?             @relation("JournalEntryReversal", fields: [reversalOfJournalEntryId], references: [id])
  reversalEntries          JournalEntry[]            @relation("JournalEntryReversal")

  balanceSnapshotsGenerated AccountingBalanceSnapshot[] @relation("BalanceSnapshotGeneratedByJournalEntry")

  @@index([tenantId])
  @@index([tenantId, accountingPeriodId])
  @@index([tenantId, journalNumber])
  @@index([tenantId, entryDate])
  @@index([tenantId, postingDate])
  @@index([tenantId, entryType])
  @@index([tenantId, sourceType])
  @@index([tenantId, sourceModule, sourceEventType])
  @@index([tenantId, sourceResourceType, sourceResourceId])
  @@index([tenantId, status])
  @@index([tenantId, idempotencyKey])
  @@index([tenantId, reversalOfJournalEntryId])
  @@index([createdAt])
  @@map("journal_entries")
}

model JournalEntryLine {
  id                  String             @id @default(uuid()) @db.Uuid
  tenantId            String             @map("tenant_id") @db.Uuid
  journalEntryId      String             @map("journal_entry_id") @db.Uuid
  accountingAccountId String             @map("accounting_account_id") @db.Uuid

  lineNumber          Int                @map("line_number")
  description         String?            @db.Text
  debitAmount         Decimal            @default(0) @map("debit_amount") @db.Decimal(12, 2)
  creditAmount        Decimal            @default(0) @map("credit_amount") @db.Decimal(12, 2)
  currency            Currency           @default(USD)

  sourceLineType      String?            @map("source_line_type") @db.VarChar(120)
  sourceLineId        String?            @map("source_line_id") @db.VarChar(120)

  createdAt           DateTime           @default(now()) @map("created_at")
  updatedAt           DateTime           @updatedAt @map("updated_at")
  metadata            Json?

  tenant              Tenant             @relation(fields: [tenantId], references: [id])
  journalEntry        JournalEntry       @relation(fields: [journalEntryId], references: [id])
  accountingAccount   AccountingAccount  @relation(fields: [accountingAccountId], references: [id])

  @@index([tenantId])
  @@index([tenantId, journalEntryId])
  @@index([tenantId, accountingAccountId])
  @@index([tenantId, lineNumber])
  @@index([tenantId, sourceLineType, sourceLineId])
  @@index([createdAt])
  @@map("journal_entry_lines")
}

model AccountingSourceEventLink {
  id                    String                          @id @default(uuid()) @db.Uuid
  tenantId              String                          @map("tenant_id") @db.Uuid
  journalEntryId        String                          @map("journal_entry_id") @db.Uuid
  sourceModule          AccountingSourceModule          @map("source_module")
  sourceResourceType    String                          @map("source_resource_type") @db.VarChar(120)
  sourceResourceId      String                          @map("source_resource_id") @db.VarChar(120)
  sourceEventType       String                          @map("source_event_type") @db.VarChar(120)
  sourceEventOccurredAt DateTime?                       @map("source_event_occurred_at")
  idempotencyKey        String                          @map("idempotency_key") @db.VarChar(128)
  status                AccountingSourceEventLinkStatus @default(ACTIVE)

  createdAt             DateTime                        @default(now()) @map("created_at")
  archivedAt            DateTime?                       @map("archived_at")
  archivedBy            String?                         @map("archived_by") @db.Uuid
  archiveReason         String?                         @map("archive_reason") @db.Text
  metadata              Json?

  tenant                Tenant                          @relation(fields: [tenantId], references: [id])
  journalEntry          JournalEntry                    @relation(fields: [journalEntryId], references: [id])

  @@index([tenantId])
  @@index([tenantId, journalEntryId])
  @@index([tenantId, sourceModule, sourceEventType])
  @@index([tenantId, sourceResourceType, sourceResourceId])
  @@index([tenantId, idempotencyKey])
  @@index([tenantId, status])
  @@index([createdAt])
  @@map("accounting_source_event_links")
}

model AccountingBalanceSnapshot {
  id                  String             @id @default(uuid()) @db.Uuid
  tenantId            String             @map("tenant_id") @db.Uuid
  accountingPeriodId  String             @map("accounting_period_id") @db.Uuid
  accountingAccountId String             @map("accounting_account_id") @db.Uuid
  closingRunId        String?            @map("closing_run_id") @db.Uuid
  generatedBy         String?            @map("generated_by") @db.Uuid

  openingDebit        Decimal            @default(0) @map("opening_debit") @db.Decimal(12, 2)
  openingCredit       Decimal            @default(0) @map("opening_credit") @db.Decimal(12, 2)
  periodDebit         Decimal            @default(0) @map("period_debit") @db.Decimal(12, 2)
  periodCredit        Decimal            @default(0) @map("period_credit") @db.Decimal(12, 2)
  closingDebit        Decimal            @default(0) @map("closing_debit") @db.Decimal(12, 2)
  closingCredit       Decimal            @default(0) @map("closing_credit") @db.Decimal(12, 2)

  currency            Currency           @default(USD)
  snapshotAt          DateTime           @map("snapshot_at")
  createdAt           DateTime           @default(now()) @map("created_at")
  metadata            Json?

  tenant              Tenant             @relation(fields: [tenantId], references: [id])
  accountingPeriod    AccountingPeriod   @relation(fields: [accountingPeriodId], references: [id])
  accountingAccount   AccountingAccount  @relation(fields: [accountingAccountId], references: [id])
  closingRun          AccountingClosingRun? @relation(fields: [closingRunId], references: [id])

  generatedByJournalEntry JournalEntry?  @relation("BalanceSnapshotGeneratedByJournalEntry", fields: [generatedBy], references: [id])

  @@index([tenantId])
  @@index([tenantId, accountingPeriodId])
  @@index([tenantId, accountingAccountId])
  @@index([tenantId, closingRunId])
  @@index([tenantId, snapshotAt])
  @@index([createdAt])
  @@map("accounting_balance_snapshots")
}

model AccountingClosingRun {
  id                       String                     @id @default(uuid()) @db.Uuid
  tenantId                 String                     @map("tenant_id") @db.Uuid
  accountingPeriodId       String                     @map("accounting_period_id") @db.Uuid
  status                   AccountingClosingRunStatus @default(DRAFT)

  startedBy                String?                    @map("started_by") @db.Uuid
  completedBy              String?                    @map("completed_by") @db.Uuid
  cancelledBy              String?                    @map("cancelled_by") @db.Uuid
  archivedBy               String?                    @map("archived_by") @db.Uuid

  startedAt                DateTime?                  @map("started_at")
  completedAt              DateTime?                  @map("completed_at")
  failedAt                 DateTime?                  @map("failed_at")
  cancelledAt              DateTime?                  @map("cancelled_at")
  archivedAt               DateTime?                  @map("archived_at")

  entriesChecked           Int                        @default(0) @map("entries_checked")
  entriesPosted            Int                        @default(0) @map("entries_posted")
  draftEntriesFound        Int                        @default(0) @map("draft_entries_found")
  unbalancedEntriesFound   Int                        @default(0) @map("unbalanced_entries_found")
  warningsCount            Int                        @default(0) @map("warnings_count")

  errorCode                String?                    @map("error_code") @db.VarChar(120)
  errorMessage             String?                    @map("error_message") @db.Text
  closePeriodOnSuccess     Boolean                    @default(true) @map("close_period_on_success")

  createdAt                DateTime                   @default(now()) @map("created_at")
  updatedAt                DateTime                   @updatedAt @map("updated_at")
  metadata                 Json?

  tenant                   Tenant                     @relation(fields: [tenantId], references: [id])
  accountingPeriod         AccountingPeriod           @relation(fields: [accountingPeriodId], references: [id])
  balanceSnapshots         AccountingBalanceSnapshot[]

  @@index([tenantId])
  @@index([tenantId, accountingPeriodId])
  @@index([tenantId, status])
  @@index([tenantId, startedAt])
  @@index([tenantId, completedAt])
  @@index([createdAt])
  @@map("accounting_closing_runs")
}
```

---

## 20. Relaciones requeridas en modelos existentes

### 20.1. `Tenant`

Agregar relaciones:

```prisma id="rzv0mn"
model Tenant {
  // campos existentes...

  accountingPolicies          AccountingPolicy[]
  chartOfAccounts             ChartOfAccounts[]
  accountingAccounts          AccountingAccount[]
  accountingPeriods           AccountingPeriod[]
  accountingMappingRules      AccountingMappingRule[]
  journalEntries              JournalEntry[]
  journalEntryLines           JournalEntryLine[]
  accountingSourceEventLinks  AccountingSourceEventLink[]
  accountingBalanceSnapshots  AccountingBalanceSnapshot[]
  accountingClosingRuns       AccountingClosingRun[]
}
```

---

### 20.2. `SecureDocument` / `SourceModule`

Extender enum de módulo fuente:

```prisma id="7punyn"
enum SourceModule {
  // valores existentes...

  ACCOUNTING_LEDGER @map("accountingLedger")
}
```

Uso recomendado para exports:

```text id="kmlxi0"
sourceModule = accountingLedger
sourceResourceType = generalJournalExport | generalLedgerExport | trialBalanceExport | incomeExpenseExport | balanceSheetExport | closingRunEvidence
```

---

### 20.3. `Payment`

No se requiere relación directa obligatoria en MVP.

Los vínculos se manejan por `AccountingSourceEventLink`:

```text id="fbsn8a"
sourceModule = payments
sourceResourceType = payment | paymentAllocation | paymentReversal
sourceResourceId = <id>
```

---

### 20.4. `Charge`

No se requiere relación directa obligatoria en MVP.

Los vínculos se manejan por `AccountingSourceEventLink`:

```text id="gbf8ai"
sourceModule = duesFees
sourceResourceType = charge | chargeAdjustment | chargeReversal
sourceResourceId = <id>
```

---

### 20.5. `BankTransaction`

No se requiere relación directa obligatoria en MVP.

Los vínculos se manejan por `AccountingSourceEventLink`:

```text id="xqg6df"
sourceModule = bankReconciliation
sourceResourceType = bankTransaction | reconciliationMatch
sourceResourceId = <id>
```

---

## 21. Índices recomendados

### 21.1. `accounting_policies`

```text id="nyxrw9"
tenant_id
tenant_id + status
tenant_id + base_currency
created_at
```

Índice parcial:

```sql id="eoao0i"
CREATE UNIQUE INDEX uq_accounting_policies_active_per_tenant
ON accounting_policies (tenant_id)
WHERE status = 'active' AND archived_at IS NULL;
```

---

### 21.2. `chart_of_accounts`

```text id="e39hb2"
tenant_id
tenant_id + status
tenant_id + is_default
tenant_id + template_key
created_at
```

Índice parcial:

```sql id="utrb0j"
CREATE UNIQUE INDEX uq_chart_of_accounts_active_default_per_tenant
ON chart_of_accounts (tenant_id)
WHERE status = 'active'
  AND is_default = true
  AND archived_at IS NULL;
```

---

### 21.3. `accounting_accounts`

```text id="wkfs0r"
tenant_id
tenant_id + chart_of_accounts_id
tenant_id + parent_account_id
tenant_id + account_code
tenant_id + account_type
tenant_id + normal_balance
tenant_id + status
tenant_id + is_control_account
tenant_id + is_posting_allowed
created_at
```

Índice único:

```sql id="qgp9zx"
CREATE UNIQUE INDEX uq_accounting_accounts_code_per_chart
ON accounting_accounts (tenant_id, chart_of_accounts_id, account_code)
WHERE archived_at IS NULL;
```

---

### 21.4. `accounting_periods`

```text id="7cdil5"
tenant_id
tenant_id + period_code
tenant_id + period_type
tenant_id + status
tenant_id + start_date + end_date
created_at
```

Índice único:

```sql id="8q617i"
CREATE UNIQUE INDEX uq_accounting_periods_code_per_tenant
ON accounting_periods (tenant_id, period_code)
WHERE archived_at IS NULL;
```

Índice para búsqueda por fecha:

```sql id="scvv9a"
CREATE INDEX idx_accounting_periods_date_range
ON accounting_periods (tenant_id, start_date, end_date);
```

---

### 21.5. `accounting_mapping_rules`

```text id="4ix26p"
tenant_id
tenant_id + chart_of_accounts_id
tenant_id + rule_code
tenant_id + source_module + source_event_type
tenant_id + source_resource_type
tenant_id + status
tenant_id + priority
tenant_id + debit_account_id
tenant_id + credit_account_id
created_at
```

Índice único:

```sql id="yvbbiw"
CREATE UNIQUE INDEX uq_accounting_mapping_rules_code
ON accounting_mapping_rules (tenant_id, rule_code)
WHERE archived_at IS NULL;
```

Índice para resolver regla activa:

```sql id="k6leww"
CREATE INDEX idx_accounting_mapping_rules_active_lookup
ON accounting_mapping_rules (
  tenant_id,
  source_module,
  source_event_type,
  source_resource_type,
  status,
  priority
);
```

---

### 21.6. `journal_entries`

```text id="djq94u"
tenant_id
tenant_id + accounting_period_id
tenant_id + journal_number
tenant_id + entry_date
tenant_id + posting_date
tenant_id + entry_type
tenant_id + source_type
tenant_id + source_module + source_event_type
tenant_id + source_resource_type + source_resource_id
tenant_id + status
tenant_id + idempotency_key
tenant_id + reversal_of_journal_entry_id
created_at
```

Índice único para número de asiento:

```sql id="y10f6k"
CREATE UNIQUE INDEX uq_journal_entries_journal_number
ON journal_entries (tenant_id, journal_number)
WHERE archived_at IS NULL;
```

Índice único para idempotencia:

```sql id="a3yq5z"
CREATE UNIQUE INDEX uq_journal_entries_idempotency_key
ON journal_entries (tenant_id, idempotency_key)
WHERE idempotency_key IS NOT NULL
  AND status IN ('posted', 'reversed')
  AND archived_at IS NULL;
```

---

### 21.7. `journal_entry_lines`

```text id="758nns"
tenant_id
tenant_id + journal_entry_id
tenant_id + accounting_account_id
tenant_id + line_number
tenant_id + source_line_type + source_line_id
created_at
```

Índice único:

```sql id="8mvf3i"
CREATE UNIQUE INDEX uq_journal_entry_lines_line_number
ON journal_entry_lines (tenant_id, journal_entry_id, line_number);
```

Índice para libro mayor:

```sql id="7aa6i4"
CREATE INDEX idx_journal_entry_lines_general_ledger
ON journal_entry_lines (tenant_id, accounting_account_id, journal_entry_id);
```

---

### 21.8. `accounting_source_event_links`

```text id="7k4i65"
tenant_id
tenant_id + journal_entry_id
tenant_id + source_module + source_event_type
tenant_id + source_resource_type + source_resource_id
tenant_id + idempotency_key
tenant_id + status
created_at
```

Índice único:

```sql id="exah5e"
CREATE UNIQUE INDEX uq_accounting_source_event_links_idempotency
ON accounting_source_event_links (tenant_id, idempotency_key)
WHERE status = 'active'
  AND archived_at IS NULL;
```

---

### 21.9. `accounting_balance_snapshots`

```text id="b6of48"
tenant_id
tenant_id + accounting_period_id
tenant_id + accounting_account_id
tenant_id + closing_run_id
tenant_id + snapshot_at
created_at
```

Índice único por cierre:

```sql id="3na9d0"
CREATE UNIQUE INDEX uq_accounting_balance_snapshot_per_closing
ON accounting_balance_snapshots (
  tenant_id,
  accounting_period_id,
  accounting_account_id,
  closing_run_id
)
WHERE closing_run_id IS NOT NULL;
```

---

### 21.10. `accounting_closing_runs`

```text id="5bu4iy"
tenant_id
tenant_id + accounting_period_id
tenant_id + status
tenant_id + started_at
tenant_id + completed_at
created_at
```

Índice para evitar cierre concurrente:

```sql id="9dp1us"
CREATE UNIQUE INDEX uq_accounting_closing_runs_running_period
ON accounting_closing_runs (tenant_id, accounting_period_id)
WHERE status IN ('draft', 'running');
```

---

## 22. Constraints recomendados

### 22.1. Política fiscal válida

```sql id="3g9ipt"
ALTER TABLE accounting_policies
ADD CONSTRAINT chk_accounting_policies_fiscal_month
CHECK (fiscal_year_start_month BETWEEN 1 AND 12);
```

```sql id="ymzuuu"
ALTER TABLE accounting_policies
ADD CONSTRAINT chk_accounting_policies_fiscal_day
CHECK (fiscal_year_start_day BETWEEN 1 AND 31);
```

---

### 22.2. Periodo válido

```sql id="dabgp7"
ALTER TABLE accounting_periods
ADD CONSTRAINT chk_accounting_periods_date_range
CHECK (start_date <= end_date);
```

---

### 22.3. Account level válido

```sql id="7x9wo3"
ALTER TABLE accounting_accounts
ADD CONSTRAINT chk_accounting_accounts_level_positive
CHECK (level >= 1);
```

---

### 22.4. Effective range válido

```sql id="1uitx5"
ALTER TABLE accounting_mapping_rules
ADD CONSTRAINT chk_accounting_mapping_rules_effective_range
CHECK (
  effective_from IS NULL
  OR effective_to IS NULL
  OR effective_from <= effective_to
);
```

---

### 22.5. Totales no negativos

```sql id="n3m61h"
ALTER TABLE journal_entries
ADD CONSTRAINT chk_journal_entries_totals_non_negative
CHECK (total_debit >= 0 AND total_credit >= 0);
```

---

### 22.6. Posted cuadrado

```sql id="shnl1x"
ALTER TABLE journal_entries
ADD CONSTRAINT chk_journal_entries_posted_balanced
CHECK (
  status != 'posted'
  OR total_debit = total_credit
);
```

---

### 22.7. Posted con fecha

```sql id="m5211e"
ALTER TABLE journal_entries
ADD CONSTRAINT chk_journal_entries_posted_fields
CHECK (
  status != 'posted'
  OR posted_at IS NOT NULL
);
```

---

### 22.8. Reversal válido

```sql id="m9h943"
ALTER TABLE journal_entries
ADD CONSTRAINT chk_journal_entries_reversal_fields
CHECK (
  entry_type != 'reversal'
  OR reversal_of_journal_entry_id IS NOT NULL
);
```

---

### 22.9. Void reason

```sql id="2p5h8n"
ALTER TABLE journal_entries
ADD CONSTRAINT chk_journal_entries_void_reason
CHECK (
  status != 'voided'
  OR (voided_at IS NOT NULL AND void_reason IS NOT NULL)
);
```

---

### 22.10. Línea con un solo lado

```sql id="3ym4qc"
ALTER TABLE journal_entry_lines
ADD CONSTRAINT chk_journal_entry_lines_debit_or_credit
CHECK (
  (
    debit_amount > 0
    AND credit_amount = 0
  )
  OR
  (
    credit_amount > 0
    AND debit_amount = 0
  )
);
```

---

### 22.11. Montos de línea no negativos

```sql id="0dcp39"
ALTER TABLE journal_entry_lines
ADD CONSTRAINT chk_journal_entry_lines_non_negative
CHECK (debit_amount >= 0 AND credit_amount >= 0);
```

---

### 22.12. Snapshot no negativo

```sql id="tzyoly"
ALTER TABLE accounting_balance_snapshots
ADD CONSTRAINT chk_accounting_balance_snapshots_non_negative
CHECK (
  opening_debit >= 0
  AND opening_credit >= 0
  AND period_debit >= 0
  AND period_credit >= 0
  AND closing_debit >= 0
  AND closing_credit >= 0
);
```

---

### 22.13. Closing run counters no negativos

```sql id="u12url"
ALTER TABLE accounting_closing_runs
ADD CONSTRAINT chk_accounting_closing_runs_counts_non_negative
CHECK (
  entries_checked >= 0
  AND entries_posted >= 0
  AND draft_entries_found >= 0
  AND unbalanced_entries_found >= 0
  AND warnings_count >= 0
);
```

---

### 22.14. Closing run completed

```sql id="yfdjaw"
ALTER TABLE accounting_closing_runs
ADD CONSTRAINT chk_accounting_closing_runs_completed_fields
CHECK (
  status NOT IN ('completed', 'completedWithWarnings')
  OR completed_at IS NOT NULL
);
```

---

### 22.15. Closing run failed

```sql id="3y2yjr"
ALTER TABLE accounting_closing_runs
ADD CONSTRAINT chk_accounting_closing_runs_failed_fields
CHECK (
  status != 'failed'
  OR (failed_at IS NOT NULL AND error_code IS NOT NULL)
);
```

---

## 23. Validaciones que Prisma no garantiza por sí solo

El servicio debe validar tenant en todas las relaciones:

```text id="ez1tel"
chartOfAccountsId
parentAccountId
accountingAccountId
accountingPeriodId
accountingMappingRuleId
debitAccountId
creditAccountId
journalEntryId
reversalOfJournalEntryId
sourceEventLinkId
closingRunId
secureDocumentId
secureDocumentFileId
```

También debe validar:

```text id="ha09n6"
- parentAccount pertenece al mismo chart;
- debitAccount y creditAccount pertenecen al mismo tenant;
- accountingPeriod pertenece al mismo tenant;
- journalEntry lines pertenecen al mismo tenant;
- reversalOfJournalEntry pertenece al mismo tenant;
- closingRun period pertenece al mismo tenant;
- report filters no cruzan tenants.
```

---

## 24. Estrategia de dinero

### 24.1. Tipo

Todos los campos monetarios usan:

```text id="3bguhb"
Decimal(12,2)
```

---

### 24.2. Campos monetarios

```text id="9hauee"
journal_entries.total_debit
journal_entries.total_credit
journal_entry_lines.debit_amount
journal_entry_lines.credit_amount
accounting_balance_snapshots.opening_debit
accounting_balance_snapshots.opening_credit
accounting_balance_snapshots.period_debit
accounting_balance_snapshots.period_credit
accounting_balance_snapshots.closing_debit
accounting_balance_snapshots.closing_credit
```

---

### 24.3. Reglas

```text id="w1yl5c"
- no usar float.
- no usar double.
- no usar JavaScript number como fuente de verdad.
- exponer montos como string decimal.
- currency MVP = USD.
- redondeo controlado a 2 decimales.
- totalDebit/totalCredit calculados server-side.
```

---

## 25. Estrategia de numeración de asientos

### 25.1. Journal number

`journalNumber` debe ser único por tenant.

Formato recomendado:

```text id="3iquf3"
JE-{periodCode}-{sequence}
```

Ejemplo:

```text id="gfrxz1"
JE-2026-07-000001
```

---

### 25.2. Reglas

```text id="gcqozw"
- numeración generada server-side por defecto.
- no aceptar journalNumber desde cliente salvo modo manualWithValidation.
- no reutilizar journalNumber de asiento archived.
- reversal debe tener su propio journalNumber.
```

---

## 26. Estrategia de source event identity

### 26.1. Componentes

```text id="nn0d5n"
tenantId
sourceModule
sourceResourceType
sourceResourceId
sourceEventType
```

---

### 26.2. Idempotency key

Formato conceptual:

```text id="ksg3b6"
sha256(tenantId + sourceModule + sourceResourceType + sourceResourceId + sourceEventType)
```

---

### 26.3. Reglas

```text id="3pw0zl"
- idempotencyKey se calcula server-side.
- no se acepta idempotencyKey desde cliente para eventos automáticos.
- el mismo evento fuente no genera dos JournalEntries activas.
- reversal y correction usan eventos contables separados.
```

---

## 27. Estrategia de account hierarchy

### 27.1. Parent-child

Cada cuenta puede tener una cuenta padre.

Reglas:

```text id="sou42d"
- parentAccountId opcional.
- parent y child pertenecen al mismo tenant.
- parent y child pertenecen al mismo ChartOfAccounts.
- no se permiten ciclos.
- level se calcula server-side.
```

---

### 27.2. Posting allowed

Recomendación:

```text id="93v9jb"
- cuentas agrupadoras: isPostingAllowed=false.
- cuentas detalle: isPostingAllowed=true.
```

---

## 28. Estrategia de control accounts

### 28.1. Control account

Una cuenta de control es protegida porque representa saldos gobernados por otros módulos.

Ejemplos:

```text id="49fo30"
AccountsReceivable
Cash
Bank
PaymentClearing
ProviderSettlementClearing
BankFeesExpense
DuesRevenue
```

---

### 28.2. Reglas

```text id="0t92zx"
- asientos automáticos pueden usar cuentas de control si mapping rule lo permite.
- asientos manuales ordinarios no pueden usar cuentas de control.
- permiso especial: journalEntries.postToControlAccounts.
- todo uso manual de control account debe auditarse.
```

---

## 29. DTOs derivados del modelo

### 29.1. `AccountingPolicyDto`

Incluye:

```text id="2jr255"
id
baseCurrency
accountingMethod
fiscalYearStartMonth
fiscalYearStartDay
journalNumberingMode
allowManualEntries
requireApprovalForManualEntries
allowPostingToClosedPeriod
allowPostingToControlAccounts
protectedControlAccountsEnabled
status
createdAt
updatedAt
activatedAt
disabledAt
archivedAt
metadata segura
```

No incluye:

```text id="qvm6j6"
tenantId
createdBy
updatedBy
actor interno sensible
```

---

### 29.2. `ChartOfAccountsDto`

Incluye:

```text id="twbl7k"
id
name
description
status
templateKey
version
isDefault
createdAt
updatedAt
activatedAt
archivedAt
metadata segura
```

---

### 29.3. `AccountingAccountDto`

Incluye:

```text id="d1ljyz"
id
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
createdAt
updatedAt
activatedAt
disabledAt
archivedAt
metadata segura
```

---

### 29.4. `AccountingPeriodDto`

Incluye:

```text id="j24qb6"
id
periodCode
periodName
periodType
startDate
endDate
status
lockedAt
closedAt
reopenedAt
createdAt
updatedAt
metadata segura
```

---

### 29.5. `AccountingMappingRuleDto`

Incluye:

```text id="q5rwh8"
id
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
createdAt
updatedAt
activatedAt
disabledAt
archivedAt
metadata segura
```

---

### 29.6. `JournalEntryDto`

Incluye:

```text id="x1wivg"
id
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
approvedAt
postedAt
reversedAt
voidedAt
reversalOfJournalEntryId
reversalJournalEntryId
reverseReason
voidReason
createdAt
updatedAt
lines
sourceEventLinks
metadata segura
```

No incluye:

```text id="wh52wa"
tenantId
idempotencyKey interno salvo permiso técnico
storageKey
raw source payload
datos masivos de fuente
```

---

### 29.7. `JournalEntryLineDto`

Incluye:

```text id="umq2cb"
id
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
metadata segura
```

---

### 29.8. `AccountingSourceEventLinkDto`

Incluye:

```text id="ikkd6h"
id
journalEntryId
sourceModule
sourceResourceType
sourceResourceId
sourceEventType
sourceEventOccurredAt
status
createdAt
metadata segura
```

No incluye por defecto:

```text id="3d9e11"
idempotencyKey completo
raw source payload
```

---

### 29.9. `AccountingBalanceSnapshotDto`

Incluye:

```text id="0vumf9"
id
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
closingRunId
createdAt
metadata segura
```

---

### 29.10. `AccountingClosingRunDto`

Incluye:

```text id="tmqib2"
id
accountingPeriodId
status
startedAt
completedAt
failedAt
cancelledAt
entriesChecked
entriesPosted
draftEntriesFound
unbalancedEntriesFound
warningsCount
errorCode
errorMessage sanitizado
closePeriodOnSuccess
createdAt
updatedAt
metadata segura
```

---

## 30. Campos prohibidos en requests

Los DTOs externos deben rechazar:

```text id="44jc7h"
tenantId
createdBy
updatedBy
activatedBy
disabledBy
postedBy
approvedBy
reversedBy
closedBy
archivedBy
status directo salvo endpoints de transición
totalDebit como fuente de verdad
totalCredit como fuente de verdad
journalNumber manual salvo política explícita
idempotencyKey en eventos automáticos
source links arbitrarios desde API pública tenant
postedAt
reversedAt
closedAt
storageKey
signedUrl
raw SQL
stack trace
payment creation fields
payment allocation fields
account statement mutation fields
bank reconciliation confirmation fields
external AI flags
```

---

## 31. Consultas conceptuales

### 31.1. Buscar periodo por posting date

```sql id="lsk49t"
SELECT *
FROM accounting_periods
WHERE tenant_id = :tenant_id
  AND start_date <= :posting_date
  AND end_date >= :posting_date
  AND status IN ('open', 'reopened')
  AND archived_at IS NULL
ORDER BY start_date DESC
LIMIT 1;
```

---

### 31.2. Detectar source event duplicado

```sql id="9j69cx"
SELECT id
FROM accounting_source_event_links
WHERE tenant_id = :tenant_id
  AND idempotency_key = :idempotency_key
  AND status = 'active'
  AND archived_at IS NULL;
```

---

### 31.3. Libro diario

```sql id="1uxp2a"
SELECT *
FROM journal_entries
WHERE tenant_id = :tenant_id
  AND accounting_period_id = :accounting_period_id
  AND status = 'posted'
  AND archived_at IS NULL
ORDER BY posting_date ASC, journal_number ASC;
```

---

### 31.4. Libro mayor por cuenta

```sql id="s5j4rz"
SELECT
  je.journal_number,
  je.posting_date,
  je.description AS entry_description,
  jel.description AS line_description,
  jel.debit_amount,
  jel.credit_amount
FROM journal_entry_lines jel
JOIN journal_entries je ON je.id = jel.journal_entry_id
WHERE jel.tenant_id = :tenant_id
  AND jel.accounting_account_id = :accounting_account_id
  AND je.accounting_period_id = :accounting_period_id
  AND je.status = 'posted'
  AND je.archived_at IS NULL
ORDER BY je.posting_date ASC, je.journal_number ASC, jel.line_number ASC;
```

---

### 31.5. Trial balance

```sql id="6z24xe"
SELECT
  aa.account_code,
  aa.account_name,
  aa.account_type,
  aa.normal_balance,
  SUM(jel.debit_amount) AS total_debit,
  SUM(jel.credit_amount) AS total_credit
FROM journal_entry_lines jel
JOIN journal_entries je ON je.id = jel.journal_entry_id
JOIN accounting_accounts aa ON aa.id = jel.accounting_account_id
WHERE jel.tenant_id = :tenant_id
  AND je.accounting_period_id = :accounting_period_id
  AND je.status = 'posted'
  AND je.archived_at IS NULL
GROUP BY aa.account_code, aa.account_name, aa.account_type, aa.normal_balance
ORDER BY aa.account_code ASC;
```

---

## 32. Reglas de archivo y retención

### 32.1. Soft archive

Ninguna entidad contable crítica debe eliminarse físicamente en flujo ordinario.

Usar:

```text id="x3xg6d"
archivedAt
archivedBy
archiveReason
```

---

### 32.2. Entidades archivables

```text id="4wy7zf"
AccountingPolicy
ChartOfAccounts
AccountingAccount
AccountingPeriod
AccountingMappingRule
JournalEntry
AccountingSourceEventLink
AccountingClosingRun
```

---

### 32.3. JournalEntry posted

Un `JournalEntry` posted no debe eliminarse.

Solo puede:

```text id="1l63ol"
- permanecer posted;
- ser reversed;
- archivarse para ocultamiento administrativo histórico si la política lo permite, sin eliminar trazabilidad.
```

---

### 32.4. JournalEntryLine

Las líneas de asiento posted no se archivan individualmente.

El archivo opera sobre el asiento completo si aplica.

---

### 32.5. Balance snapshots

Los snapshots se conservan por política de retención.

Pueden regenerarse únicamente bajo flujo controlado.

---

## 33. Integridad con módulos financieros

### 33.1. Integridad con Charges

```text id="grk3ni"
Charge emitido puede generar JournalEntry.
JournalEntry no modifica Charge.
Charge reversal puede generar reversal accounting effect.
```

---

### 33.2. Integridad con Payments

```text id="jky5e6"
Payment allocated puede generar JournalEntry.
JournalEntry no crea Payment.
JournalEntry no crea PaymentAllocation.
Payment reversal puede generar JournalEntry reversal.
```

---

### 33.3. Integridad con Account Statements

```text id="j67wne"
Account Statements no se actualiza desde JournalEntries.
Los reportes pueden comparar saldos operativos vs saldos contables.
```

---

### 33.4. Integridad con Bank Reconciliation

```text id="n8zubn"
Bank Reconciliation confirma conciliación.
Accounting Ledger puede registrar efecto contable posterior.
Accounting Ledger no crea ReconciliationMatch.
Accounting Ledger no marca BankTransaction como matched.
```

---

### 33.5. Integridad con Payment Provider Integration

```text id="98x8lk"
Provider settlements pueden generar asientos solo cuando estén revisados/confirmados según política.
ProviderPaymentMapping no se altera desde Accounting Ledger.
```

---

### 33.6. Integridad con Open Banking

```text id="wqslfw"
Open Banking no genera JournalEntries directos en MVP.
Open Banking alimenta Bank Reconciliation.
Accounting recibe efectos posteriores desde Bank Reconciliation.
```

---

## 34. Auditoría vinculada al modelo

### 34.1. Eventos mínimos

```text id="q3a72d"
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

### 34.2. Metadata permitida

```text id="l3qywk"
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

### 34.3. Metadata prohibida

```text id="hw9fbb"
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

## 35. Observabilidad vinculada al modelo

### 35.1. Métricas derivables

```text id="j5wwik"
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

### 35.2. Labels permitidos

```text id="034cdf"
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

### 35.3. Labels prohibidos

```text id="kgt4uy"
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

## 36. Migración propuesta

### 36.1. Nombre de migración

```text id="8lt35a"
020_create_accounting_ledger
```

---

### 36.2. Contenido de migración

```text id="84h2nr"
1. Crear enums Accounting Ledger.
2. Crear accounting_policies.
3. Crear chart_of_accounts.
4. Crear accounting_accounts.
5. Crear accounting_periods.
6. Crear accounting_mapping_rules.
7. Crear journal_entries.
8. Crear journal_entry_lines.
9. Crear accounting_source_event_links.
10. Crear accounting_balance_snapshots.
11. Crear accounting_closing_runs.
12. Agregar relaciones a Tenant.
13. Extender SourceModule con accountingLedger.
14. Crear índices básicos.
15. Crear índices parciales raw.
16. Crear constraints raw.
17. Ejecutar prisma generate.
18. Validar migración en entorno test.
```

---

## 37. Seeds recomendados

Crear seeds ficticios:

```text id="7lg2ta"
accountingPolicyDraftA
accountingPolicyActiveA
accountingPolicyInactiveA
accountingPolicyTenantB

chartOfAccountsDraftA
chartOfAccountsActiveA
chartOfAccountsInactiveA
chartOfAccountsTenantB

accountAssetCashA
accountAssetBankA
accountAccountsReceivableA
accountPaymentClearingA
accountLiabilityAccountsPayableA
accountEquityRetainedEarningsA
accountIncomeDuesA
accountIncomeFinesA
accountIncomeReservationsA
accountExpenseBankFeesA
accountExpenseMaintenanceA
accountTenantB

accountingPeriodOpenA
accountingPeriodLockedA
accountingPeriodClosedA
accountingPeriodReopenedA
accountingPeriodTenantB

mappingRuleChargeIssuedA
mappingRuleChargeAdjustedA
mappingRuleChargeReversedA
mappingRulePaymentAllocatedA
mappingRulePaymentReversedA
mappingRuleInactiveA
mappingRuleTenantB

journalEntryDraftManualA
journalEntryPostedAutomaticA
journalEntryPostedManualA
journalEntryReversalA
journalEntryReversedA
journalEntryVoidedA
journalEntryTenantB

journalEntryLineDebitA
journalEntryLineCreditA
journalEntryLineTenantB

sourceEventLinkChargeIssuedA
sourceEventLinkPaymentAllocatedA
sourceEventLinkTenantB

balanceSnapshotPeriodA
closingRunCompletedA
closingRunFailedA
closingRunTenantB
```

---

## 38. Datos prohibidos en seeds

```text id="72krcx"
datos financieros reales
nombres reales
cédulas reales
emails reales
números bancarios reales
tokens
secrets
storageKeys reales
signedUrls reales
payloads bancarios reales
payloads de proveedor reales
balances reales de conjuntos
datos productivos
datos contables reales
```

---

## 39. Reglas de testing para modelo

### 39.1. Repository tests

Debe probar:

```text id="rham0z"
- create accounting policy;
- create chart of accounts;
- create accounting account;
- create accounting period;
- create accounting mapping rule;
- create journal entry;
- create journal entry lines;
- create source event link;
- create balance snapshot;
- create closing run;
- tenant A no ve datos tenant B;
- findFirst con tenantId funciona;
- findUnique por id simple no se usa;
- índices únicos previenen duplicados;
- constraints monetarios funcionan;
- constraints de estado funcionan;
- accountCode único por chart;
- journalNumber único por tenant;
- source event idempotency funciona.
```

---

### 39.2. Integrity tests

Debe probar:

```text id="gttt4r"
- asiento posted requiere debit=credit;
- línea no puede tener debit y credit simultáneamente;
- línea no puede tener ambos montos en cero;
- posted requiere postedAt;
- reversal requiere reversalOfJournalEntryId;
- period startDate <= endDate;
- closing run completed requiere completedAt;
- failed closing run requiere errorCode.
```

---

### 39.3. Security tests

Debe probar:

```text id="c8vclj"
- no tenantId desde body;
- no cross-tenant chart;
- no cross-tenant account;
- no cross-tenant period;
- no cross-tenant journalEntry;
- no cross-tenant line;
- no cross-tenant source link;
- no cross-tenant report;
- no posted mutation;
- no duplicate source event;
- no Payment creado desde ledger;
- no AccountStatement modificado desde ledger;
- no ReconciliationMatch creado desde ledger.
```

---

## 40. No aceptación del modelo

El modelo no debe aceptarse si:

```text id="o7tf08"
- omite tenant_id en tablas operativas;
- permite accounting policy cross-tenant;
- permite chart of accounts cross-tenant;
- permite accounting account cross-tenant;
- permite accounting period cross-tenant;
- permite mapping rule cross-tenant;
- permite journal entry cross-tenant;
- permite journal entry line cross-tenant;
- permite source event link cross-tenant;
- permite balance snapshot cross-tenant;
- permite closing run cross-tenant;
- acepta tenantId desde body;
- favorece findUnique por id simple;
- permite accountCode duplicado;
- permite journalNumber duplicado;
- permite source event duplicado;
- permite posted desbalanceado;
- permite línea con debit y credit simultáneos;
- permite línea con ambos montos en cero;
- permite posting en periodo closed;
- permite posted mutable;
- permite reversal sin referencia original;
- permite cuenta cross-tenant en línea;
- permite cuenta inactive en posting;
- permite cuenta control en manual entry ordinario;
- usa float/double para dinero;
- permite reportes cross-tenant;
- ledger crea Payment;
- ledger crea PaymentAllocation;
- ledger modifica Account Statements;
- ledger crea ReconciliationMatch;
- ledger marca conciliación bancaria final;
- Open Banking genera JournalEntry directo en MVP;
- expone storageKey en exports;
- omite auditoría crítica.
```

---

## 41. Resultado esperado

Este modelo de datos debe permitir implementar `020-accounting-ledger` como módulo contable interno, seguro y extensible.

Resultado esperado:

```text id="ldjgqb"
- AccountingPolicy tenant-scoped;
- ChartOfAccounts tenant-scoped;
- AccountingAccount jerárquica;
- AccountingPeriod;
- AccountingMappingRule;
- JournalEntry;
- JournalEntryLine;
- AccountingSourceEventLink;
- AccountingBalanceSnapshot;
- AccountingClosingRun;
- Decimal money;
- double-entry validation;
- source-event idempotency;
- posted immutability;
- reversal accounting;
- period-aware posting;
- control account protection;
- general journal support;
- general ledger support;
- trial balance support;
- income/expense report support;
- basic balance sheet support;
- closing run support;
- Secure Document Storage export readiness;
- auditability;
- observability;
- no Payment auto-creation;
- no Account Statements mutation;
- no Bank Reconciliation final confirmation;
- no Open Banking direct posting in MVP;
- no public accounting data exposure.
```

---

## 42. Expediente actualizado

```text id="3u234m"
resident-core/
├── docs/
│   ├── specs/
│   │   ├── 001-tenants/
│   │   ├── 002-users-roles/
│   │   ├── 003-residents-properties/
│   │   ├── 004-dues-fees/
│   │   ├── 005-payments/
│   │   ├── 006-account-statements/
│   │   ├── 007-audit/
│   │   ├── 008-basic-reports/
│   │   ├── 009-wordpress-integration-basic/
│   │   ├── 010-reservations-common-areas/
│   │   ├── 011-fines-sanctions/
│   │   ├── 012-communications-notifications/
│   │   ├── 013-meetings-attendance/
│   │   ├── 014-voting-basic/
│   │   ├── 015-certified-minutes/
│   │   ├── 016-secure-document-storage/
│   │   ├── 017-bank-reconciliation/
│   │   ├── 018-payment-provider-integration/
│   │   ├── 019-open-banking-integration/
│   │   └── 020-accounting-ledger/
│   │       ├── spec.md
│   │       ├── plan.md
│   │       └── data-model.md
```
