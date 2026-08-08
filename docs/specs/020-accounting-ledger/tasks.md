# Tasks — Spec 020 Accounting Ledger

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                                                                                                       |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                                                                                                               |
| Spec ID         | 020                                                                                                                                                                                                                                                         |
| Módulo          | Accounting Ledger                                                                                                                                                                                                                                           |
| Documento       | Tasks                                                                                                                                                                                                                                                       |
| Ruta            | `docs/specs/020-accounting-ledger/tasks.md`                                                                                                                                                                                                                 |
| Versión         | 0.1                                                                                                                                                                                                                                                         |
| Estado          | Borrador inicial                                                                                                                                                                                                                                            |
| Fecha           | 2026-07-23                                                                                                                                                                                                                                                  |
| Documento base  | `docs/specs/020-accounting-ledger/spec.md`                                                                                                                                                                                                                  |
| Plan técnico    | `docs/specs/020-accounting-ledger/plan.md`                                                                                                                                                                                                                  |
| Modelo de datos | `docs/specs/020-accounting-ledger/data-model.md`                                                                                                                                                                                                            |
| Contrato API    | `docs/specs/020-accounting-ledger/api-contract.md`                                                                                                                                                                                                          |
| Plan de pruebas | `docs/specs/020-accounting-ledger/test-plan.md`                                                                                                                                                                                                             |
| Depende de      | `001-tenants`, `002-users-roles`, `004-dues-fees`, `005-payments`, `006-account-statements`, `007-audit`, `008-basic-reports`, `016-secure-document-storage`, `017-bank-reconciliation`, `018-payment-provider-integration`, `019-open-banking-integration` |
| Naturaleza      | Tenant-scoped / Double-entry / Source-linked / Posting-driven / Period-aware / Immutable-after-posting / Audit-heavy / Report-ready / Non-public                                                                                                            |

---

## 2. Propósito

Este documento define la lista de tareas técnicas para implementar el módulo `020-accounting-ledger`.

El objetivo es convertir la especificación, el plan técnico, el modelo de datos, el contrato API y el plan de pruebas en un backlog ejecutable, incremental y verificable.

Regla central de implementación:

```text id="e1n8lv"
Accounting Ledger debe implementarse como una capa contable interna, tenant-scoped, de partida doble, trazable a eventos fuente, idempotente, period-aware, inmutable después de posting, basada en reversos auditados, sin creación de pagos, sin mutación de estados de cuenta, sin confirmación de conciliación bancaria, sin contabilización directa desde Open Banking en MVP, sin endpoints públicos, sin endpoints /me y sin uso de IA externa con datos contables reales.
```

---

## 3. Convenciones

### 3.1. Estados de tarea

```text id="r1qy8u"
[ ] Pendiente
[x] Completada
[-] No aplica / descartada
[~] En progreso
[!] Bloqueada
```

---

### 3.2. Criterio para marcar una tarea como completada

Una tarea solo debe marcarse `[x]` si:

```text id="m68rz1"
- el código fue implementado;
- los tests asociados pasan;
- cumple spec.md;
- cumple plan.md;
- cumple data-model.md;
- cumple api-contract.md;
- cumple test-plan.md;
- no rompe tenant isolation;
- no acepta tenantId desde body;
- no permite asientos posted desbalanceados;
- no permite editar asientos posted;
- no duplica asientos por source event;
- no permite posting en periodo closed;
- no usa float/double para dinero;
- no crea Payment;
- no crea PaymentAllocation;
- no modifica Account Statements;
- no crea ReconciliationMatch;
- no marca BankTransaction como matched;
- no permite Open Banking direct posting en MVP;
- no expone endpoints públicos;
- no expone endpoints /me;
- no permite acceso desde WordPress;
- no envía datos reales a IA externa;
- audita operaciones críticas;
- pasa lint, typecheck, tests y CI.
```

---

## 4. Épicas de implementación

```text id="q3ra0x"
EPIC-020-01 — Module foundation
EPIC-020-02 — Enums, constants and configuration
EPIC-020-03 — Domain value objects
EPIC-020-04 — Domain entities and state machines
EPIC-020-05 — Domain policies and errors
EPIC-020-06 — Database schema and migrations
EPIC-020-07 — Repository layer
EPIC-020-08 — Accounting policy
EPIC-020-09 — Chart of accounts
EPIC-020-10 — Accounting accounts
EPIC-020-11 — Accounting periods
EPIC-020-12 — Accounting mapping rules
EPIC-020-13 — Journal entries and lines
EPIC-020-14 — Posting engine
EPIC-020-15 — Source event links and idempotency
EPIC-020-16 — Reversal accounting
EPIC-020-17 — Financial source integrations
EPIC-020-18 — Balance calculation and snapshots
EPIC-020-19 — Accounting reports
EPIC-020-20 — Period closing
EPIC-020-21 — Export via Secure Document Storage
EPIC-020-22 — REST API controllers
EPIC-020-23 — Authorization, guards and policies
EPIC-020-24 — Audit
EPIC-020-25 — Observability
EPIC-020-26 — OpenAPI
EPIC-020-27 — Tests
EPIC-020-28 — Security hardening
EPIC-020-29 — CI/CD gates
```

---

# 5. EPIC-020-01 — Module foundation

## 5.1. Estructura base

```text id="k3gfem"
apps/api/src/modules/accounting-ledger/
```

### Tasks

```text id="ko2x4h"
[ ] Crear carpeta apps/api/src/modules/accounting-ledger.
[ ] Crear accounting-ledger.module.ts.
[ ] Registrar AccountingLedgerModule en el módulo raíz.
[ ] Crear carpeta controllers.
[ ] Crear carpeta application.
[ ] Crear carpeta application/services.
[ ] Crear carpeta application/use-cases.
[ ] Crear carpeta application/ports.
[ ] Crear carpeta domain.
[ ] Crear carpeta domain/entities.
[ ] Crear carpeta domain/value-objects.
[ ] Crear carpeta domain/events.
[ ] Crear carpeta domain/errors.
[ ] Crear carpeta infrastructure.
[ ] Crear carpeta infrastructure/persistence.
[ ] Crear carpeta infrastructure/integrations.
[ ] Crear carpeta infrastructure/posting.
[ ] Crear carpeta infrastructure/reports.
[ ] Crear carpeta infrastructure/exports.
[ ] Crear carpeta infrastructure/audit.
[ ] Crear carpeta infrastructure/observability.
[ ] Crear carpeta dto.
[ ] Crear carpeta guards.
[ ] Crear carpeta policies.
[ ] Crear carpeta mappers.
[ ] Crear carpeta tests.
[ ] Crear barrel exports si el proyecto lo usa.
[ ] Validar que el módulo no registre rutas públicas.
[ ] Validar que el módulo no registre rutas /me.
```

---

## 5.2. Convenciones internas del módulo

### Tasks

```text id="q5ub09"
[ ] Definir naming convention accounting-ledger.
[ ] Definir prefijo de errores ACCOUNTING_*.
[ ] Definir prefijo de métricas accounting_*.
[ ] Definir categoría audit accounting.
[ ] Definir sourceModule accountingLedger para exports.
[ ] Definir reglas de DTO camelCase.
[ ] Definir reglas de DB snake_case.
[ ] Definir uso de Decimal para todo dinero.
[ ] Definir uso de UTC para persistencia temporal.
[ ] Definir uso de America/Guayaquil para interpretación de fechas de usuario cuando aplique.
```

---

# 6. EPIC-020-02 — Enums, constants and configuration

## 6.1. Enums

### Tasks

```text id="bca785"
[ ] Implementar AccountingPolicyStatus.
[ ] Implementar AccountingMethod.
[ ] Implementar JournalNumberingMode.
[ ] Implementar ChartOfAccountsStatus.
[ ] Implementar AccountingAccountType.
[ ] Implementar NormalBalance.
[ ] Implementar AccountingAccountStatus.
[ ] Implementar AccountingPeriodType.
[ ] Implementar AccountingPeriodStatus.
[ ] Implementar AccountingMappingRuleStatus.
[ ] Implementar JournalEntryType.
[ ] Implementar JournalEntryStatus.
[ ] Implementar JournalEntrySourceType.
[ ] Implementar AccountingSourceModule.
[ ] Implementar AccountingSourceEventLinkStatus.
[ ] Implementar AccountingClosingRunStatus.
[ ] Confirmar Currency=USD para MVP.
[ ] Validar mapeo Prisma ↔ TypeScript ↔ API.
```

---

## 6.2. Feature flags

### Tasks

```text id="gdkj7u"
[ ] Definir accountingLedger.enabled.
[ ] Definir accountingLedger.manualEntries.enabled.
[ ] Definir accountingLedger.automaticPosting.enabled.
[ ] Definir accountingLedger.chargePosting.enabled.
[ ] Definir accountingLedger.paymentPosting.enabled.
[ ] Definir accountingLedger.bankReconciliationPosting.enabled=false.
[ ] Definir accountingLedger.providerSettlementPosting.enabled=false.
[ ] Definir accountingLedger.openBankingDirectPosting.enabled=false.
[ ] Definir accountingLedger.periodClosing.enabled.
[ ] Definir accountingLedger.balanceSnapshots.enabled.
[ ] Definir accountingLedger.reports.enabled.
[ ] Definir accountingLedger.exports.enabled.
[ ] Definir accountingLedger.externalAi.enabled=false.
[ ] Crear AccountingLedgerFeatureFlagService.
[ ] Crear tests de defaults MVP.
```

---

## 6.3. Variables de configuración

### Tasks

```text id="e77jvy"
[ ] Definir ACCOUNTING_LEDGER_ENABLED=true.
[ ] Definir ACCOUNTING_DEFAULT_CURRENCY=USD.
[ ] Definir ACCOUNTING_DEFAULT_METHOD=accrual.
[ ] Definir ACCOUNTING_ALLOW_MANUAL_ENTRIES=true.
[ ] Definir ACCOUNTING_REQUIRE_APPROVAL_FOR_MANUAL_ENTRIES=false.
[ ] Definir ACCOUNTING_ALLOW_POSTING_TO_CONTROL_ACCOUNTS=false.
[ ] Definir ACCOUNTING_ALLOW_POSTING_TO_CLOSED_PERIOD=false.
[ ] Definir ACCOUNTING_ALLOW_PERIOD_REOPEN=true.
[ ] Definir ACCOUNTING_MAX_REPORT_PAGE_SIZE=100.
[ ] Definir ACCOUNTING_BALANCE_SNAPSHOTS_ENABLED=true.
[ ] Definir ACCOUNTING_REPORT_EXPORT_ENABLED=true.
[ ] Definir ACCOUNTING_AUTOMATIC_CHARGE_POSTING_ENABLED=true.
[ ] Definir ACCOUNTING_AUTOMATIC_PAYMENT_POSTING_ENABLED=true.
[ ] Definir ACCOUNTING_BANK_RECONCILIATION_POSTING_ENABLED=false.
[ ] Definir ACCOUNTING_PROVIDER_SETTLEMENT_POSTING_ENABLED=false.
[ ] Definir ACCOUNTING_OPEN_BANKING_DIRECT_POSTING_ENABLED=false.
[ ] Definir ACCOUNTING_EXTERNAL_AI_ENABLED=false.
[ ] Crear AccountingLedgerConfigService.
[ ] Validar configuración al boot.
[ ] Fallar boot si ACCOUNTING_EXTERNAL_AI_ENABLED=true en entorno no permitido.
[ ] Fallar boot si ACCOUNTING_OPEN_BANKING_DIRECT_POSTING_ENABLED=true en MVP.
```

---

# 7. EPIC-020-03 — Domain value objects

## 7.1. Value objects contables

### Tasks

```text id="cch3sd"
[ ] Implementar AccountingAccountCode.
[ ] Implementar AccountingAccountName.
[ ] Implementar AccountingPeriodCode.
[ ] Implementar AccountingPeriodRange.
[ ] Implementar JournalNumber.
[ ] Implementar JournalEntryAmount.
[ ] Implementar DebitCreditAmount.
[ ] Implementar NormalBalanceValue.
[ ] Implementar AccountingCurrency.
[ ] Implementar SourceEventIdentity.
[ ] Implementar AccountingIdempotencyKey.
[ ] Implementar AccountingDescription.
[ ] Implementar ClosingRunSummary.
[ ] Implementar AccountingReportPeriod.
[ ] Implementar AccountingBalanceAmount.
```

---

## 7.2. Validaciones de value objects

### Tasks

```text id="nq0vx6"
[ ] Rechazar accountCode vacío.
[ ] Rechazar accountCode con caracteres inseguros.
[ ] Rechazar accountName vacío.
[ ] Rechazar HTML/script en nombres y descripciones.
[ ] Rechazar periodo con startDate > endDate.
[ ] Detectar solapamiento de periodos.
[ ] Generar JournalNumber en formato JE-{periodCode}-{sequence}.
[ ] Rechazar JournalNumber manual si policy no lo permite.
[ ] Rechazar montos number/float/double como fuente de verdad.
[ ] Aceptar solo string decimal para montos.
[ ] Rechazar montos negativos.
[ ] Rechazar línea con debit y credit simultáneos.
[ ] Rechazar línea con debit=0 y credit=0.
[ ] Rechazar currency distinta de USD en MVP.
[ ] Generar AccountingIdempotencyKey server-side.
[ ] Evitar exposición de idempotencyKey en DTO estándar.
```

---

# 8. EPIC-020-04 — Domain entities and state machines

## 8.1. Entidades

### Tasks

```text id="myq8sv"
[ ] Implementar AccountingPolicy.
[ ] Implementar ChartOfAccounts.
[ ] Implementar AccountingAccount.
[ ] Implementar AccountingPeriod.
[ ] Implementar AccountingMappingRule.
[ ] Implementar JournalEntry.
[ ] Implementar JournalEntryLine.
[ ] Implementar AccountingSourceEventLink.
[ ] Implementar AccountingBalanceSnapshot.
[ ] Implementar AccountingClosingRun.
```

---

## 8.2. State machines

### Tasks

```text id="svqrae"
[ ] Implementar transiciones AccountingPolicy.
[ ] Implementar transiciones ChartOfAccounts.
[ ] Implementar transiciones AccountingAccount.
[ ] Implementar transiciones AccountingPeriod.
[ ] Implementar transiciones AccountingMappingRule.
[ ] Implementar transiciones JournalEntry.
[ ] Implementar transiciones AccountingSourceEventLink.
[ ] Implementar transiciones AccountingClosingRun.
[ ] Bloquear archived -> active en entidades archivadas.
[ ] Bloquear posted -> draft.
[ ] Bloquear posted -> voided.
[ ] Bloquear voided -> posted.
[ ] Bloquear closed period -> open sin flujo reopen.
[ ] Emitir eventos de dominio por transición crítica.
```

---

## 8.3. Domain events

### Tasks

```text id="u39nyi"
[ ] Implementar AccountingPolicyCreatedEvent.
[ ] Implementar AccountingPolicyActivatedEvent.
[ ] Implementar AccountingPolicyDisabledEvent.
[ ] Implementar AccountingPolicyArchivedEvent.
[ ] Implementar ChartOfAccountsCreatedEvent.
[ ] Implementar ChartOfAccountsActivatedEvent.
[ ] Implementar ChartOfAccountsArchivedEvent.
[ ] Implementar AccountingAccountCreatedEvent.
[ ] Implementar AccountingAccountActivatedEvent.
[ ] Implementar AccountingAccountDisabledEvent.
[ ] Implementar AccountingAccountArchivedEvent.
[ ] Implementar AccountingAccountControlFlagChangedEvent.
[ ] Implementar AccountingPeriodCreatedEvent.
[ ] Implementar AccountingPeriodLockedEvent.
[ ] Implementar AccountingPeriodClosedEvent.
[ ] Implementar AccountingPeriodReopenedEvent.
[ ] Implementar AccountingMappingRuleCreatedEvent.
[ ] Implementar AccountingMappingRuleActivatedEvent.
[ ] Implementar AccountingMappingRuleDisabledEvent.
[ ] Implementar JournalEntryCreatedEvent.
[ ] Implementar JournalEntryApprovedEvent.
[ ] Implementar JournalEntryPostedEvent.
[ ] Implementar JournalEntryReversedEvent.
[ ] Implementar JournalEntryVoidedEvent.
[ ] Implementar JournalEntryPostingRejectedEvent.
[ ] Implementar JournalEntryUnbalancedRejectedEvent.
[ ] Implementar JournalEntryDuplicateSourceRejectedEvent.
[ ] Implementar AccountingSourceEventLinkCreatedEvent.
[ ] Implementar AccountingClosingRunCreatedEvent.
[ ] Implementar AccountingClosingRunStartedEvent.
[ ] Implementar AccountingClosingRunCompletedEvent.
[ ] Implementar AccountingClosingRunFailedEvent.
[ ] Implementar AccountingReportGeneratedEvent.
[ ] Implementar AccountingReportExportedEvent.
```

---

# 9. EPIC-020-05 — Domain policies and errors

## 9.1. Policies

### Tasks

```text id="t4s0ut"
[ ] Implementar JournalEntryBalancePolicy.
[ ] Implementar JournalEntryImmutabilityPolicy.
[ ] Implementar JournalEntryPostingPolicy.
[ ] Implementar JournalEntryReversalPolicy.
[ ] Implementar JournalEntryApprovalPolicy.
[ ] Implementar ControlAccountPostingPolicy.
[ ] Implementar ClosedPeriodPostingPolicy.
[ ] Implementar SourceEventIdempotencyPolicy.
[ ] Implementar AccountingMappingRuleActivationPolicy.
[ ] Implementar AccountingAccountPostingPolicy.
[ ] Implementar AccountingPeriodClosingPolicy.
[ ] Implementar AccountingPeriodReopenPolicy.
[ ] Implementar AccountingReportTenantPolicy.
[ ] Implementar NoPaymentCreationFromAccountingPolicy.
[ ] Implementar NoAccountStatementMutationPolicy.
[ ] Implementar NoBankReconciliationConfirmationPolicy.
[ ] Implementar NoOpenBankingDirectPostingPolicy.
[ ] Implementar NoPublicAccountingEndpointPolicy.
[ ] Implementar NoMeAccountingEndpointPolicy.
[ ] Implementar NoWordPressAccountingAccessPolicy.
[ ] Implementar NoExternalAiAccountingDataPolicy.
[ ] Implementar AuditSanitizationPolicy.
[ ] Implementar LogSanitizationPolicy.
```

---

## 9.2. Domain errors

### Tasks

```text id="ffolro"
[ ] Implementar ACCOUNTING_POLICY_NOT_FOUND.
[ ] Implementar ACCOUNTING_POLICY_INVALID_STATUS.
[ ] Implementar ACCOUNTING_POLICY_ALREADY_ACTIVE.
[ ] Implementar ACCOUNTING_POLICY_CURRENCY_UNSUPPORTED.
[ ] Implementar ACCOUNTING_POLICY_CLOSED_PERIOD_POSTING_FORBIDDEN.
[ ] Implementar CHART_OF_ACCOUNTS_NOT_FOUND.
[ ] Implementar CHART_OF_ACCOUNTS_INVALID_STATUS.
[ ] Implementar CHART_OF_ACCOUNTS_ALREADY_ACTIVE.
[ ] Implementar CHART_OF_ACCOUNTS_MISSING_REQUIRED_ACCOUNTS.
[ ] Implementar CHART_OF_ACCOUNTS_DEFAULT_CONFLICT.
[ ] Implementar ACCOUNTING_ACCOUNT_NOT_FOUND.
[ ] Implementar ACCOUNTING_ACCOUNT_INVALID_STATUS.
[ ] Implementar ACCOUNTING_ACCOUNT_CODE_DUPLICATE.
[ ] Implementar ACCOUNTING_ACCOUNT_PARENT_INVALID.
[ ] Implementar ACCOUNTING_ACCOUNT_PARENT_CYCLE.
[ ] Implementar ACCOUNTING_ACCOUNT_POSTING_NOT_ALLOWED.
[ ] Implementar ACCOUNTING_CONTROL_ACCOUNT_REQUIRES_PERMISSION.
[ ] Implementar ACCOUNTING_ACCOUNT_CROSS_TENANT_REFERENCE.
[ ] Implementar ACCOUNTING_PERIOD_NOT_FOUND.
[ ] Implementar ACCOUNTING_PERIOD_INVALID_STATUS.
[ ] Implementar ACCOUNTING_PERIOD_OVERLAPS.
[ ] Implementar ACCOUNTING_PERIOD_CLOSED.
[ ] Implementar ACCOUNTING_PERIOD_LOCKED.
[ ] Implementar ACCOUNTING_PERIOD_REOPEN_FORBIDDEN.
[ ] Implementar ACCOUNTING_PERIOD_DATE_RANGE_INVALID.
[ ] Implementar ACCOUNTING_PERIOD_NOT_FOUND_FOR_POSTING_DATE.
[ ] Implementar ACCOUNTING_MAPPING_RULE_NOT_FOUND.
[ ] Implementar ACCOUNTING_MAPPING_RULE_INVALID_STATUS.
[ ] Implementar ACCOUNTING_MAPPING_RULE_SOURCE_DUPLICATE.
[ ] Implementar ACCOUNTING_MAPPING_RULE_ACCOUNT_INVALID.
[ ] Implementar ACCOUNTING_MAPPING_RULE_NOT_ACTIVE.
[ ] Implementar ACCOUNTING_MAPPING_RULE_CROSS_TENANT_REFERENCE.
[ ] Implementar ACCOUNTING_MAPPING_RULE_AMOUNT_SOURCE_INVALID.
[ ] Implementar JOURNAL_ENTRY_NOT_FOUND.
[ ] Implementar JOURNAL_ENTRY_INVALID_STATUS.
[ ] Implementar JOURNAL_ENTRY_UNBALANCED.
[ ] Implementar JOURNAL_ENTRY_NO_LINES.
[ ] Implementar JOURNAL_ENTRY_POSTED_IMMUTABLE.
[ ] Implementar JOURNAL_ENTRY_ALREADY_POSTED.
[ ] Implementar JOURNAL_ENTRY_ALREADY_REVERSED.
[ ] Implementar JOURNAL_ENTRY_REVERSAL_FORBIDDEN.
[ ] Implementar JOURNAL_ENTRY_DUPLICATE_SOURCE_EVENT.
[ ] Implementar JOURNAL_ENTRY_POSTING_REJECTED.
[ ] Implementar JOURNAL_ENTRY_CONTROL_ACCOUNT_FORBIDDEN.
[ ] Implementar JOURNAL_ENTRY_CLOSED_PERIOD_FORBIDDEN.
[ ] Implementar JOURNAL_ENTRY_CROSS_TENANT_REFERENCE.
[ ] Implementar JOURNAL_ENTRY_LINE_INVALID.
[ ] Implementar JOURNAL_ENTRY_LINE_BOTH_DEBIT_AND_CREDIT.
[ ] Implementar JOURNAL_ENTRY_LINE_ZERO_AMOUNT.
[ ] Implementar JOURNAL_ENTRY_LINE_ACCOUNT_INVALID.
[ ] Implementar JOURNAL_ENTRY_LINE_CURRENCY_MISMATCH.
[ ] Implementar JOURNAL_ENTRY_LINE_CROSS_TENANT_REFERENCE.
[ ] Implementar ACCOUNTING_SOURCE_EVENT_LINK_DUPLICATE.
[ ] Implementar ACCOUNTING_SOURCE_EVENT_LINK_NOT_FOUND.
[ ] Implementar ACCOUNTING_SOURCE_EVENT_LINK_CROSS_TENANT_REFERENCE.
[ ] Implementar ACCOUNTING_CLOSING_RUN_NOT_FOUND.
[ ] Implementar ACCOUNTING_CLOSING_RUN_INVALID_STATUS.
[ ] Implementar ACCOUNTING_CLOSING_RUN_ALREADY_RUNNING.
[ ] Implementar ACCOUNTING_CLOSING_RUN_FAILED.
[ ] Implementar ACCOUNTING_CLOSING_RUN_UNBALANCED_TRIAL_BALANCE.
[ ] Implementar ACCOUNTING_CLOSING_RUN_DRAFT_ENTRIES_FOUND.
[ ] Implementar ACCOUNTING_CLOSING_RUN_CROSS_TENANT_REFERENCE.
[ ] Implementar ACCOUNTING_REPORT_FORBIDDEN.
[ ] Implementar ACCOUNTING_REPORT_EXPORT_FAILED.
[ ] Implementar ACCOUNTING_REPORT_PERIOD_REQUIRED.
[ ] Implementar ACCOUNTING_REPORT_ACCOUNT_REQUIRED.
[ ] Implementar ACCOUNTING_REPORT_CROSS_TENANT_REFERENCE.
[ ] Implementar ACCOUNTING_PUBLIC_ENDPOINT_FORBIDDEN.
[ ] Implementar ACCOUNTING_ME_ENDPOINT_FORBIDDEN.
[ ] Implementar ACCOUNTING_EXTERNAL_AI_FORBIDDEN.
[ ] Implementar ACCOUNTING_PAYMENT_CREATION_FORBIDDEN.
[ ] Implementar ACCOUNTING_ACCOUNT_STATEMENT_MUTATION_FORBIDDEN.
[ ] Implementar ACCOUNTING_BANK_RECONCILIATION_CONFIRMATION_FORBIDDEN.
[ ] Implementar ACCOUNTING_OPEN_BANKING_DIRECT_POSTING_FORBIDDEN.
```

---

# 10. EPIC-020-06 — Database schema and migrations

## 10.1. Prisma schema

### Tasks

```text id="lhdoar"
[ ] Agregar enums Accounting Ledger en Prisma.
[ ] Crear modelo AccountingPolicy.
[ ] Crear modelo ChartOfAccounts.
[ ] Crear modelo AccountingAccount.
[ ] Crear modelo AccountingPeriod.
[ ] Crear modelo AccountingMappingRule.
[ ] Crear modelo JournalEntry.
[ ] Crear modelo JournalEntryLine.
[ ] Crear modelo AccountingSourceEventLink.
[ ] Crear modelo AccountingBalanceSnapshot.
[ ] Crear modelo AccountingClosingRun.
[ ] Agregar relaciones con Tenant.
[ ] Agregar relaciones entre ChartOfAccounts y AccountingAccount.
[ ] Agregar relación parent/child AccountingAccount.
[ ] Agregar relación AccountingPeriod y JournalEntry.
[ ] Agregar relación JournalEntry y JournalEntryLine.
[ ] Agregar relación JournalEntry y AccountingSourceEventLink.
[ ] Agregar relación AccountingClosingRun y AccountingBalanceSnapshot.
[ ] Extender SourceModule de Secure Document Storage con accountingLedger.
[ ] Validar que todas las tablas operativas tengan tenantId.
```

---

## 10.2. Migración

### Tasks

```text id="ol2d4d"
[ ] Crear migración 020_create_accounting_ledger.
[ ] Crear enums.
[ ] Crear accounting_policies.
[ ] Crear chart_of_accounts.
[ ] Crear accounting_accounts.
[ ] Crear accounting_periods.
[ ] Crear accounting_mapping_rules.
[ ] Crear journal_entries.
[ ] Crear journal_entry_lines.
[ ] Crear accounting_source_event_links.
[ ] Crear accounting_balance_snapshots.
[ ] Crear accounting_closing_runs.
[ ] Crear foreign keys.
[ ] Crear índices básicos.
[ ] Crear índices por tenant_id.
[ ] Crear índices por status.
[ ] Crear índices por accounting_period_id.
[ ] Crear índices por accounting_account_id.
[ ] Crear índices por sourceModule/sourceEventType.
[ ] Crear índices por idempotencyKey.
[ ] Crear índices parciales raw SQL.
[ ] Crear constraints raw SQL.
[ ] Ejecutar prisma migrate en local.
[ ] Ejecutar prisma generate.
[ ] Validar migración en entorno test.
[ ] Documentar rollback si aplica.
```

---

## 10.3. Índices parciales críticos

### Tasks

```text id="sthhzx"
[ ] Crear unique active AccountingPolicy por tenant.
[ ] Crear unique active default ChartOfAccounts por tenant.
[ ] Crear unique accountCode por tenant/chart.
[ ] Crear unique periodCode por tenant.
[ ] Crear índice de búsqueda de periodo por date range.
[ ] Crear unique ruleCode por tenant.
[ ] Crear índice active lookup para AccountingMappingRule.
[ ] Crear unique journalNumber por tenant.
[ ] Crear unique idempotencyKey para JournalEntry posted/reversed.
[ ] Crear unique lineNumber por JournalEntry.
[ ] Crear índice general ledger por tenant/account/journalEntry.
[ ] Crear unique idempotencyKey active en AccountingSourceEventLink.
[ ] Crear unique snapshot por period/account/closingRun.
[ ] Crear unique closingRun draft/running por period.
```

---

## 10.4. Constraints

### Tasks

```text id="vw77uk"
[ ] Constraint fiscalYearStartMonth between 1 and 12.
[ ] Constraint fiscalYearStartDay between 1 and 31.
[ ] Constraint period startDate <= endDate.
[ ] Constraint account level >= 1.
[ ] Constraint mapping rule effectiveFrom <= effectiveTo.
[ ] Constraint journal entry totalDebit >= 0.
[ ] Constraint journal entry totalCredit >= 0.
[ ] Constraint posted totalDebit = totalCredit.
[ ] Constraint postedAt requerido si status=posted.
[ ] Constraint reversalOfJournalEntryId requerido si entryType=reversal.
[ ] Constraint voidedAt y voidReason requeridos si status=voided.
[ ] Constraint línea con debit o credit, pero no ambos.
[ ] Constraint debitAmount >= 0.
[ ] Constraint creditAmount >= 0.
[ ] Constraint snapshots no negativos.
[ ] Constraint closing run counters no negativos.
[ ] Constraint completedAt requerido si closing run completed.
[ ] Constraint failedAt/errorCode requeridos si closing run failed.
```

---

# 11. EPIC-020-07 — Repository layer

## 11.1. Repository ports

### Tasks

```text id="u6jmza"
[ ] Crear AccountingPolicyRepositoryPort.
[ ] Crear ChartOfAccountsRepositoryPort.
[ ] Crear AccountingAccountRepositoryPort.
[ ] Crear AccountingPeriodRepositoryPort.
[ ] Crear AccountingMappingRuleRepositoryPort.
[ ] Crear JournalEntryRepositoryPort.
[ ] Crear JournalEntryLineRepositoryPort.
[ ] Crear AccountingSourceEventLinkRepositoryPort.
[ ] Crear AccountingBalanceSnapshotRepositoryPort.
[ ] Crear AccountingClosingRunRepositoryPort.
```

---

## 11.2. Prisma repositories

### Tasks

```text id="jxjfe6"
[ ] Implementar PrismaAccountingPolicyRepository.
[ ] Implementar PrismaChartOfAccountsRepository.
[ ] Implementar PrismaAccountingAccountRepository.
[ ] Implementar PrismaAccountingPeriodRepository.
[ ] Implementar PrismaAccountingMappingRuleRepository.
[ ] Implementar PrismaJournalEntryRepository.
[ ] Implementar PrismaJournalEntryLineRepository.
[ ] Implementar PrismaAccountingSourceEventLinkRepository.
[ ] Implementar PrismaAccountingBalanceSnapshotRepository.
[ ] Implementar PrismaAccountingClosingRunRepository.
[ ] Usar findFirst con tenantId para búsquedas por id.
[ ] Prohibir findUnique por id simple en entidades tenant-scoped.
[ ] Excluir archived por defecto.
[ ] Implementar filtros del API Contract.
[ ] Implementar paginación estándar.
[ ] Implementar ordenamiento seguro.
[ ] Implementar transacciones para posting/reversal/closing.
```

---

# 12. EPIC-020-08 — Accounting policy

## 12.1. Service

### Tasks

```text id="s7cmei"
[ ] Crear AccountingPolicyService.
[ ] Implementar create.
[ ] Implementar list.
[ ] Implementar get.
[ ] Implementar update.
[ ] Implementar activate.
[ ] Implementar disable.
[ ] Implementar archive.
[ ] Validar baseCurrency USD.
[ ] Validar accountingMethod.
[ ] Validar fiscalYearStartMonth.
[ ] Validar fiscalYearStartDay.
[ ] Validar allowPostingToClosedPeriod=false en MVP.
[ ] Validar una policy active por tenant.
[ ] Emitir auditoría.
```

---

## 12.2. DTOs

### Tasks

```text id="m956gl"
[ ] Crear CreateAccountingPolicyDto.
[ ] Crear UpdateAccountingPolicyDto.
[ ] Crear ActivateAccountingPolicyDto.
[ ] Crear DisableAccountingPolicyDto.
[ ] Crear ArchiveAccountingPolicyDto.
[ ] Crear AccountingPolicyDto.
[ ] Crear AccountingPolicyListItemDto.
[ ] Crear AccountingPolicyFilterDto.
[ ] Rechazar tenantId.
[ ] Rechazar actor fields.
[ ] Rechazar status directo.
[ ] Rechazar allowPostingToClosedPeriod=true.
```

---

# 13. EPIC-020-09 — Chart of accounts

## 13.1. Service

### Tasks

```text id="tdsxx6"
[ ] Crear ChartOfAccountsService.
[ ] Implementar create.
[ ] Implementar list.
[ ] Implementar get.
[ ] Implementar update.
[ ] Implementar activate.
[ ] Implementar archive.
[ ] Validar nombre requerido.
[ ] Validar templateKey seguro.
[ ] Validar solo un active/default por tenant.
[ ] Validar cuentas mínimas para activación.
[ ] Evitar eliminación física si hay JournalEntries.
[ ] Emitir auditoría.
```

---

## 13.2. Plantilla inicial de plan de cuentas

### Tasks

```text id="vve35x"
[ ] Crear ResidentGenericChartTemplate.
[ ] Definir cuenta 1 Activo.
[ ] Definir cuenta 1.1 Caja.
[ ] Definir cuenta 1.2 Bancos.
[ ] Definir cuenta 1.3 Cuentas por cobrar.
[ ] Definir cuenta 1.4 Cuenta puente de pagos.
[ ] Definir cuenta 2 Pasivo.
[ ] Definir cuenta 2.1 Cuentas por pagar.
[ ] Definir cuenta 2.2 Ingresos recibidos por anticipado.
[ ] Definir cuenta 3 Patrimonio.
[ ] Definir cuenta 3.1 Fondo patrimonial.
[ ] Definir cuenta 3.2 Resultados acumulados.
[ ] Definir cuenta 4 Ingresos.
[ ] Definir cuenta 4.1 Ingresos por alícuotas.
[ ] Definir cuenta 4.2 Ingresos por multas.
[ ] Definir cuenta 4.3 Ingresos por reservas.
[ ] Definir cuenta 4.4 Otros ingresos.
[ ] Definir cuenta 5 Gastos.
[ ] Definir cuenta 5.1 Mantenimiento.
[ ] Definir cuenta 5.2 Servicios básicos.
[ ] Definir cuenta 5.3 Seguridad.
[ ] Definir cuenta 5.4 Administración.
[ ] Definir cuenta 5.5 Comisiones bancarias.
[ ] Marcar cuentas agrupadoras como isPostingAllowed=false.
[ ] Marcar cuentas de control requeridas.
[ ] Crear seed de plantilla ficticia.
```

---

# 14. EPIC-020-10 — Accounting accounts

## 14.1. Service

### Tasks

```text id="p83vbh"
[ ] Crear AccountingAccountService.
[ ] Implementar create.
[ ] Implementar list.
[ ] Implementar get.
[ ] Implementar update.
[ ] Implementar activate.
[ ] Implementar disable.
[ ] Implementar archive.
[ ] Validar chartOfAccounts tenant-scoped.
[ ] Validar parentAccount tenant-scoped.
[ ] Validar parentAccount mismo chart.
[ ] Detectar ciclos de jerarquía.
[ ] Calcular level server-side.
[ ] Validar accountCode único.
[ ] Validar normalBalance.
[ ] Validar isControlAccount requiere permiso especial.
[ ] Bloquear posting en inactive/archived.
[ ] Bloquear posting en isPostingAllowed=false.
[ ] Emitir auditoría.
```

---

## 14.2. DTOs

### Tasks

```text id="ti872i"
[ ] Crear CreateAccountingAccountDto.
[ ] Crear UpdateAccountingAccountDto.
[ ] Crear ActivateAccountingAccountDto.
[ ] Crear DisableAccountingAccountDto.
[ ] Crear ArchiveAccountingAccountDto.
[ ] Crear AccountingAccountDto.
[ ] Crear AccountingAccountListItemDto.
[ ] Crear AccountingAccountFilterDto.
[ ] Rechazar tenantId.
[ ] Rechazar status directo.
[ ] Rechazar actor fields.
[ ] Rechazar level desde cliente si se calcula server-side.
[ ] Rechazar chartOfAccountsId cross-tenant.
[ ] Rechazar parentAccountId cross-tenant.
```

---

# 15. EPIC-020-11 — Accounting periods

## 15.1. Service

### Tasks

```text id="r42itb"
[ ] Crear AccountingPeriodService.
[ ] Implementar create.
[ ] Implementar generate monthly periods.
[ ] Implementar list.
[ ] Implementar get.
[ ] Implementar update.
[ ] Implementar lock.
[ ] Implementar unlock si se decide permitir.
[ ] Implementar close.
[ ] Implementar reopen.
[ ] Implementar archive.
[ ] Validar periodCode único.
[ ] Validar startDate <= endDate.
[ ] Validar no solapamiento.
[ ] Resolver periodo por postingDate.
[ ] Bloquear posting en locked.
[ ] Bloquear posting en closed.
[ ] Bloquear posting en archived.
[ ] Reopen requiere permiso especial.
[ ] Emitir auditoría.
```

---

## 15.2. DTOs

### Tasks

```text id="t1jdq8"
[ ] Crear CreateAccountingPeriodDto.
[ ] Crear GenerateAccountingPeriodsDto.
[ ] Crear UpdateAccountingPeriodDto.
[ ] Crear LockAccountingPeriodDto.
[ ] Crear CloseAccountingPeriodDto.
[ ] Crear ReopenAccountingPeriodDto.
[ ] Crear ArchiveAccountingPeriodDto.
[ ] Crear AccountingPeriodDto.
[ ] Crear AccountingPeriodListItemDto.
[ ] Crear AccountingPeriodFilterDto.
[ ] Rechazar tenantId.
[ ] Rechazar status directo.
[ ] Rechazar actor fields.
[ ] Rechazar fechas inválidas.
```

---

# 16. EPIC-020-12 — Accounting mapping rules

## 16.1. Service

### Tasks

```text id="ljzcfa"
[ ] Crear AccountingMappingRuleService.
[ ] Implementar create.
[ ] Implementar list.
[ ] Implementar get.
[ ] Implementar update.
[ ] Implementar activate.
[ ] Implementar disable.
[ ] Implementar archive.
[ ] Implementar resolveActiveRule.
[ ] Validar sourceModule soportado.
[ ] Validar sourceEventType requerido.
[ ] Validar sourceResourceType requerido.
[ ] Validar debitAccountId tenant-scoped.
[ ] Validar creditAccountId tenant-scoped.
[ ] Validar cuentas active para activación.
[ ] Validar cuentas posteables para activación.
[ ] Validar debitAccountId != creditAccountId salvo excepción controlada.
[ ] Validar effectiveFrom <= effectiveTo.
[ ] Aplicar priority.
[ ] Emitir auditoría.
```

---

## 16.2. DTOs

### Tasks

```text id="vwd27s"
[ ] Crear CreateAccountingMappingRuleDto.
[ ] Crear UpdateAccountingMappingRuleDto.
[ ] Crear ActivateAccountingMappingRuleDto.
[ ] Crear DisableAccountingMappingRuleDto.
[ ] Crear ArchiveAccountingMappingRuleDto.
[ ] Crear AccountingMappingRuleDto.
[ ] Crear AccountingMappingRuleListItemDto.
[ ] Crear AccountingMappingRuleFilterDto.
[ ] Rechazar tenantId.
[ ] Rechazar status directo.
[ ] Rechazar actor fields.
[ ] Rechazar debitAccountId cross-tenant.
[ ] Rechazar creditAccountId cross-tenant.
```

---

# 17. EPIC-020-13 — Journal entries and lines

## 17.1. JournalEntryService

### Tasks

```text id="zbo8iw"
[ ] Crear JournalEntryService.
[ ] Implementar create manual draft.
[ ] Implementar list.
[ ] Implementar get with lines.
[ ] Implementar update draft.
[ ] Implementar approve.
[ ] Implementar void draft.
[ ] Implementar archive.
[ ] Generar journalNumber server-side.
[ ] Calcular totalDebit server-side.
[ ] Calcular totalCredit server-side.
[ ] Validar accountingPeriod tenant-scoped.
[ ] Validar postingDate dentro del periodo.
[ ] Validar líneas mínimas.
[ ] Validar cuentas tenant-scoped.
[ ] Validar cuentas active/posting allowed para post.
[ ] Rechazar líneas inválidas.
[ ] Rechazar edición de posted.
[ ] Emitir auditoría.
```

---

## 17.2. JournalEntryLine handling

### Tasks

```text id="d10tgr"
[ ] Crear JournalEntryLineFactory.
[ ] Validar lineNumber server-side.
[ ] Validar debitAmount string decimal.
[ ] Validar creditAmount string decimal.
[ ] Rechazar debit+credit simultáneo.
[ ] Rechazar zero-zero.
[ ] Rechazar negativos.
[ ] Validar currency USD.
[ ] Validar accountingAccount tenant-scoped.
[ ] Validar sourceLineType seguro.
[ ] Validar sourceLineId seguro.
[ ] Recalcular totales después de cambios.
[ ] Bloquear edición de líneas si JournalEntry posted.
```

---

## 17.3. DTOs

### Tasks

```text id="isnjmp"
[ ] Crear CreateJournalEntryDto.
[ ] Crear UpdateDraftJournalEntryDto.
[ ] Crear CreateJournalEntryLineDto.
[ ] Crear UpdateJournalEntryLineDto.
[ ] Crear ApproveJournalEntryDto.
[ ] Crear PostJournalEntryDto.
[ ] Crear ReverseJournalEntryDto.
[ ] Crear VoidJournalEntryDto.
[ ] Crear ArchiveJournalEntryDto.
[ ] Crear JournalEntryDto.
[ ] Crear JournalEntryLineDto.
[ ] Crear JournalEntryListItemDto.
[ ] Crear JournalEntryFilterDto.
[ ] Rechazar tenantId.
[ ] Rechazar status directo.
[ ] Rechazar totalDebit como fuente de verdad.
[ ] Rechazar totalCredit como fuente de verdad.
[ ] Rechazar postedAt desde cliente.
[ ] Rechazar postedBy desde cliente.
[ ] Rechazar source links arbitrarios en API tenant ordinaria.
```

---

# 18. EPIC-020-14 — Posting engine

## 18.1. Posting service

### Tasks

```text id="irxqnj"
[ ] Crear JournalEntryPostingService.
[ ] Implementar post draft.
[ ] Implementar post approved.
[ ] Validar status permitido.
[ ] Recalcular totales antes de posting.
[ ] Validar totalDebit = totalCredit.
[ ] Validar mínimo dos líneas.
[ ] Validar periodo open/reopened.
[ ] Rechazar periodo locked.
[ ] Rechazar periodo closed.
[ ] Rechazar periodo archived.
[ ] Validar cuentas active.
[ ] Validar cuentas isPostingAllowed.
[ ] Validar manual control account policy.
[ ] Setear postedAt server-side.
[ ] Setear postedBy desde actor autenticado.
[ ] Cambiar status a posted.
[ ] Bloquear mutaciones posteriores.
[ ] Emitir auditoría journalEntry.posted.
```

---

## 18.2. AccountingPostingEngineService

### Tasks

```text id="uvc3m7"
[ ] Crear AccountingPostingEngineService.
[ ] Crear input SourceEvent.
[ ] Validar tenant activo.
[ ] Validar sourceModule.
[ ] Validar sourceResourceType.
[ ] Validar sourceResourceId.
[ ] Validar sourceEventType.
[ ] Calcular idempotencyKey.
[ ] Consultar SourceEventLink existente.
[ ] Retornar idempotente si ya existe.
[ ] Resolver mapping rule active.
[ ] Rechazar si no hay mapping rule.
[ ] Resolver accounting period por postingDate.
[ ] Rechazar si no hay periodo abierto.
[ ] Resolver debit account.
[ ] Resolver credit account.
[ ] Calcular amount desde amountSource.
[ ] Construir JournalEntry automatic.
[ ] Construir JournalEntryLines.
[ ] Validar double-entry.
[ ] Postear JournalEntry en transacción.
[ ] Crear AccountingSourceEventLink.
[ ] Emitir auditoría.
[ ] No crear Payment.
[ ] No modificar Account Statements.
[ ] No confirmar Bank Reconciliation.
```

---

# 19. EPIC-020-15 — Source event links and idempotency

## 19.1. Source event service

### Tasks

```text id="t0kgpl"
[ ] Crear AccountingSourceEventService.
[ ] Implementar create link.
[ ] Implementar list links.
[ ] Implementar get link.
[ ] Implementar detect duplicate.
[ ] Implementar mark reversed.
[ ] Implementar mark superseded.
[ ] Implementar archive link.
[ ] Calcular idempotencyKey server-side.
[ ] Rechazar idempotencyKey externo para eventos automáticos.
[ ] No exponer idempotencyKey completo en DTO estándar.
[ ] No almacenar raw source payload.
[ ] Emitir auditoría duplicateDetected.
```

---

## 19.2. Idempotency

### Tasks

```text id="eqixxv"
[ ] Implementar tenantId + sourceModule + sourceResourceType + sourceResourceId + sourceEventType.
[ ] Implementar hash SHA-256.
[ ] Validar que tenant distinto no colisiona.
[ ] Validar que sourceEventType distinto no colisiona.
[ ] Validar retry idempotente.
[ ] Validar source event duplicate no crea JournalEntry.
[ ] Validar reversal usa evento contable propio.
[ ] Validar correction usa evento contable propio.
```

---

# 20. EPIC-020-16 — Reversal accounting

## 20.1. Reversal service

### Tasks

```text id="xai1h6"
[ ] Crear JournalEntryReversalService.
[ ] Implementar reverse.
[ ] Validar JournalEntry original tenant-scoped.
[ ] Validar original status posted.
[ ] Rechazar original draft.
[ ] Rechazar original voided.
[ ] Rechazar original archived.
[ ] Manejar original already reversed según política.
[ ] Requerir reason.
[ ] Resolver periodo del reversal por postingDate.
[ ] Validar periodo open/reopened.
[ ] Crear nuevo JournalEntry type=reversal.
[ ] Generar nuevo journalNumber.
[ ] Invertir líneas debit/credit.
[ ] Validar reversal balanceado.
[ ] Postear reversal.
[ ] Setear reversalOfJournalEntryId.
[ ] Setear reversalJournalEntryId en original.
[ ] Marcar original reversed si aplica.
[ ] Marcar SourceEventLink original como reversed si aplica.
[ ] Emitir auditoría journalEntry.reversed.
```

---

# 21. EPIC-020-17 — Financial source integrations

## 21.1. Charges integration

### Tasks

```text id="f32w42"
[ ] Crear DuesFeesIntegrationPort.
[ ] Implementar adaptador hacia Charges.
[ ] Validar charge tenant-scoped.
[ ] Implementar source event charge.issued.
[ ] Implementar source event charge.adjusted.
[ ] Implementar source event charge.reversed.
[ ] Mapear charge.amount como Decimal.
[ ] Mapear description segura.
[ ] Crear asiento Dr AccountsReceivable / Cr Revenue.
[ ] Validar idempotencia por charge.issued.
[ ] No modificar Charge desde Accounting.
[ ] Emitir auditoría.
```

---

## 21.2. Payments integration

### Tasks

```text id="pzyk64"
[ ] Crear PaymentsIntegrationPort.
[ ] Implementar adaptador hacia Payments.
[ ] Validar Payment tenant-scoped.
[ ] Validar PaymentAllocation tenant-scoped.
[ ] Implementar source event payment.allocated.
[ ] Implementar source event payment.reversed.
[ ] Mapear allocation.amount como Decimal.
[ ] Crear asiento Dr Cash/Bank/PaymentClearing / Cr AccountsReceivable.
[ ] Validar idempotencia por payment.allocated.
[ ] No crear Payment.
[ ] No crear PaymentAllocation.
[ ] No modificar payment.status.
[ ] No crear PaymentReversal.
[ ] Emitir auditoría.
```

---

## 21.3. Account Statements regression integration

### Tasks

```text id="n9mmpu"
[ ] Crear AccountStatementsIntegrationPort read-only.
[ ] Implementar comparación opcional de saldos operativos vs contables.
[ ] Prohibir creación de statement lines desde accounting.
[ ] Prohibir mutación de balances operativos desde accounting.
[ ] Prohibir ajuste operativo desde JournalEntry.
[ ] Crear tests de regresión.
```

---

## 21.4. Bank Reconciliation integration

### Tasks

```text id="kvafrh"
[ ] Crear BankReconciliationIntegrationPort read-only/event-driven.
[ ] Implementar evento bankTransaction.reconciled si feature flag activo.
[ ] Implementar evento bankFee.detected si feature flag activo.
[ ] Implementar evento bankInterest.detected si feature flag activo.
[ ] Validar BankTransaction tenant-scoped.
[ ] Prohibir crear ReconciliationMatch.
[ ] Prohibir marcar BankTransaction matched.
[ ] Prohibir cerrar ReconciliationSession.
[ ] Prohibir marcar Payment reconciled.
[ ] Crear tests de regresión.
```

---

## 21.5. Payment Provider Integration

### Tasks

```text id="dvl9gy"
[ ] Crear PaymentProviderIntegrationPort read-only/event-driven.
[ ] Implementar providerSettlement.reviewed si feature flag activo.
[ ] Implementar providerFee.confirmed si feature flag activo.
[ ] Validar ProviderSettlementRecord tenant-scoped.
[ ] No alterar ProviderPaymentMapping.
[ ] No marcar settlement reconciled automáticamente.
[ ] No resolver chargebacks automáticamente.
[ ] Crear tests de regresión.
```

---

## 21.6. Open Banking Integration

### Tasks

```text id="vt411a"
[ ] Crear OpenBankingIntegrationPort read-only para validación futura.
[ ] Bloquear openBankingTransaction.imported como source directo en MVP.
[ ] Bloquear openBankingTransaction.sentToReconciliation como source directo en MVP.
[ ] Validar ACCOUNTING_OPEN_BANKING_DIRECT_POSTING_ENABLED=false.
[ ] Probar que Open Banking no crea JournalEntries directos.
[ ] Documentar que Open Banking pasa por Bank Reconciliation.
```

---

# 22. EPIC-020-18 — Balance calculation and snapshots

## 22.1. Balance service

### Tasks

```text id="motipp"
[ ] Crear AccountingBalanceService.
[ ] Implementar cálculo de saldo por cuenta.
[ ] Implementar openingBalance.
[ ] Implementar periodDebit.
[ ] Implementar periodCredit.
[ ] Implementar closingBalance.
[ ] Ignorar JournalEntries draft.
[ ] Ignorar JournalEntries voided.
[ ] Ignorar JournalEntries archived según política.
[ ] Incluir JournalEntries posted.
[ ] Manejar reversal entries.
[ ] Usar Decimal.
[ ] Exponer montos como string decimal.
```

---

## 22.2. Balance snapshots

### Tasks

```text id="m24lwq"
[ ] Crear AccountingBalanceSnapshotService.
[ ] Implementar generate snapshots by period.
[ ] Asociar snapshot con accountingPeriodId.
[ ] Asociar snapshot con accountingAccountId.
[ ] Asociar snapshot con closingRunId si aplica.
[ ] Validar montos no negativos.
[ ] Persistir snapshotAt.
[ ] No tratar snapshots como fuente primaria.
[ ] Permitir regeneración solo bajo policy.
[ ] Emitir auditoría si aplica.
```

---

# 23. EPIC-020-19 — Accounting reports

## 23.1. Report service

### Tasks

```text id="psxc2y"
[ ] Crear AccountingReportService.
[ ] Implementar General Journal.
[ ] Implementar General Ledger.
[ ] Implementar Trial Balance.
[ ] Implementar Income and Expense report.
[ ] Implementar Basic Balance Sheet.
[ ] Aplicar tenantId en todas las consultas.
[ ] Derivar reportes desde JournalEntries posted.
[ ] Excluir draft entries.
[ ] Excluir voided entries.
[ ] Excluir datos tenant B.
[ ] Usar Decimal.
[ ] Aplicar pageSize max 100.
[ ] Preparar reportes pesados para jobs futuros.
[ ] Emitir auditoría accountingReport.generated.
```

---

## 23.2. General Journal

### Tasks

```text id="ciwtif"
[ ] Implementar filtros por accountingPeriodId.
[ ] Implementar filtros por periodCode.
[ ] Implementar filtros por entryDateFrom/To.
[ ] Implementar filtros por postingDateFrom/To.
[ ] Implementar filtros por entryType.
[ ] Implementar filtros por sourceModule.
[ ] Implementar filtros por sourceEventType.
[ ] Implementar filtros por status.
[ ] Ordenar por postingDate y journalNumber.
[ ] Exponer totalDebit/totalCredit como string.
```

---

## 23.3. General Ledger

### Tasks

```text id="f7dexb"
[ ] Implementar filtro accountingAccountId.
[ ] Implementar filtro accountCode.
[ ] Implementar filtro accountingPeriodId.
[ ] Implementar openingBalance.
[ ] Implementar runningBalance.
[ ] Implementar periodDebit.
[ ] Implementar periodCredit.
[ ] Implementar closingBalance.
[ ] Incluir líneas paginadas.
[ ] Usar solo posted entries.
```

---

## 23.4. Trial Balance

### Tasks

```text id="r574ug"
[ ] Implementar agrupación por account.
[ ] Implementar totalDebit.
[ ] Implementar totalCredit.
[ ] Implementar difference.
[ ] Implementar isBalanced.
[ ] Incluir includeZeroBalances.
[ ] Validar totalDebit = totalCredit para cierre.
```

---

## 23.5. Income and Expense

### Tasks

```text id="uzp3h1"
[ ] Implementar incomeAccounts.
[ ] Implementar expenseAccounts.
[ ] Implementar totalIncome.
[ ] Implementar totalExpense.
[ ] Implementar netResult.
[ ] Filtrar por period/date range.
[ ] Usar cuentas income/expense.
```

---

## 23.6. Basic Balance Sheet

### Tasks

```text id="fmf21x"
[ ] Implementar assets.
[ ] Implementar liabilities.
[ ] Implementar equity.
[ ] Implementar totals.
[ ] Implementar equationDifference.
[ ] Implementar isBalanced.
[ ] Filtrar por asOfDate o period.
[ ] Usar cuentas asset/liability/equity.
```

---

# 24. EPIC-020-20 — Period closing

## 24.1. Closing run service

### Tasks

```text id="dsgxb6"
[ ] Crear AccountingClosingRunService.
[ ] Implementar create closing run.
[ ] Implementar list.
[ ] Implementar get.
[ ] Implementar execute.
[ ] Implementar cancel.
[ ] Implementar archive.
[ ] Validar period tenant-scoped.
[ ] Validar period open/locked/reopened.
[ ] Evitar closingRun draft/running duplicado.
[ ] Cambiar status draft -> running.
[ ] Validar trial balance.
[ ] Detectar asientos draft críticos.
[ ] Detectar asientos desbalanceados.
[ ] Generar balance snapshots si se solicita.
[ ] Cerrar periodo si closePeriodOnSuccess=true.
[ ] No cerrar periodo si falla.
[ ] Registrar completed.
[ ] Registrar completedWithWarnings.
[ ] Registrar failed.
[ ] Registrar errorCode/errorMessage sanitizado.
[ ] Emitir auditoría.
```

---

## 24.2. Period close integration

### Tasks

```text id="sv8nsz"
[ ] Integrar AccountingPeriodService.close con ClosingRun.
[ ] Permitir cierre directo con createClosingRun=true.
[ ] Validar no hay posting concurrente.
[ ] Validar periodo no archived.
[ ] Validar permisos accountingPeriods.close.
[ ] Validar permisos accountingClosingRuns.execute si aplica.
[ ] Auditar accountingPeriod.closed.
```

---

# 25. EPIC-020-21 — Export via Secure Document Storage

## 25.1. Export service

### Tasks

```text id="ltwbmg"
[ ] Crear AccountingExportService.
[ ] Implementar export generalJournal.
[ ] Implementar export generalLedger.
[ ] Implementar export trialBalance.
[ ] Implementar export incomeExpense.
[ ] Implementar export balanceSheet.
[ ] Soportar csv.
[ ] Soportar xlsx si plataforma lo soporta.
[ ] Soportar pdf si plataforma lo soporta.
[ ] Integrar Secure Document Storage.
[ ] Usar sourceModule=accountingLedger.
[ ] Usar sourceResourceType=accountingReportExport.
[ ] Usar visibility=administrative.
[ ] Usar sensitivity=restricted.
[ ] No exponer storageKey.
[ ] No exponer signedUrl persistente.
[ ] Auditar accountingReport.exported.
```

---

## 25.2. SDS integration

### Tasks

```text id="cn3fev"
[ ] Extender SourceModule con accountingLedger.
[ ] Crear SecureDocument metadata para exports contables.
[ ] Crear SecureDocumentFile para archivo exportado.
[ ] Registrar hash si aplica.
[ ] Registrar MIME permitido.
[ ] Validar permisos de descarga.
[ ] Auditar descarga mediante 016-secure-document-storage.
```

---

# 26. EPIC-020-22 — REST API controllers

## 26.1. Controllers

### Tasks

```text id="ksdz5k"
[ ] Crear AccountingPoliciesController.
[ ] Crear ChartOfAccountsController.
[ ] Crear AccountingAccountsController.
[ ] Crear AccountingPeriodsController.
[ ] Crear AccountingMappingRulesController.
[ ] Crear JournalEntriesController.
[ ] Crear AccountingPostingController.
[ ] Crear AccountingSourceEventLinksController.
[ ] Crear AccountingClosingRunsController.
[ ] Crear AccountingReportsController.
```

---

## 26.2. Accounting Policies endpoints

### Tasks

```text id="kz0wyg"
[ ] Implementar GET /api/v1/tenant/accounting/policies.
[ ] Implementar POST /api/v1/tenant/accounting/policies.
[ ] Implementar GET /api/v1/tenant/accounting/policies/{policyId}.
[ ] Implementar PATCH /api/v1/tenant/accounting/policies/{policyId}.
[ ] Implementar POST /activate.
[ ] Implementar POST /disable.
[ ] Implementar POST /archive.
```

---

## 26.3. Chart of Accounts endpoints

### Tasks

```text id="t7769e"
[ ] Implementar GET /api/v1/tenant/accounting/chart-of-accounts.
[ ] Implementar POST /api/v1/tenant/accounting/chart-of-accounts.
[ ] Implementar GET /api/v1/tenant/accounting/chart-of-accounts/{chartId}.
[ ] Implementar PATCH /api/v1/tenant/accounting/chart-of-accounts/{chartId}.
[ ] Implementar POST /activate.
[ ] Implementar POST /archive.
```

---

## 26.4. Accounting Accounts endpoints

### Tasks

```text id="u1tbp5"
[ ] Implementar GET /api/v1/tenant/accounting/accounts.
[ ] Implementar POST /api/v1/tenant/accounting/accounts.
[ ] Implementar GET /api/v1/tenant/accounting/accounts/{accountId}.
[ ] Implementar PATCH /api/v1/tenant/accounting/accounts/{accountId}.
[ ] Implementar POST /activate.
[ ] Implementar POST /disable.
[ ] Implementar POST /archive.
```

---

## 26.5. Accounting Periods endpoints

### Tasks

```text id="qpc94h"
[ ] Implementar GET /api/v1/tenant/accounting/periods.
[ ] Implementar POST /api/v1/tenant/accounting/periods.
[ ] Implementar POST /api/v1/tenant/accounting/periods/generate.
[ ] Implementar GET /api/v1/tenant/accounting/periods/{periodId}.
[ ] Implementar PATCH /api/v1/tenant/accounting/periods/{periodId}.
[ ] Implementar POST /lock.
[ ] Implementar POST /close.
[ ] Implementar POST /reopen.
[ ] Implementar POST /archive.
```

---

## 26.6. Mapping Rules endpoints

### Tasks

```text id="xs89f8"
[ ] Implementar GET /api/v1/tenant/accounting/mapping-rules.
[ ] Implementar POST /api/v1/tenant/accounting/mapping-rules.
[ ] Implementar GET /api/v1/tenant/accounting/mapping-rules/{ruleId}.
[ ] Implementar PATCH /api/v1/tenant/accounting/mapping-rules/{ruleId}.
[ ] Implementar POST /activate.
[ ] Implementar POST /disable.
[ ] Implementar POST /archive.
```

---

## 26.7. Journal Entries endpoints

### Tasks

```text id="z66sck"
[ ] Implementar GET /api/v1/tenant/accounting/journal-entries.
[ ] Implementar POST /api/v1/tenant/accounting/journal-entries.
[ ] Implementar GET /api/v1/tenant/accounting/journal-entries/{journalEntryId}.
[ ] Implementar PATCH /api/v1/tenant/accounting/journal-entries/{journalEntryId}.
[ ] Implementar POST /approve.
[ ] Implementar POST /post.
[ ] Implementar POST /reverse.
[ ] Implementar POST /void.
[ ] Implementar POST /archive.
```

---

## 26.8. Posting, source links, closing and reports endpoints

### Tasks

```text id="s78y7z"
[ ] Implementar POST /api/v1/tenant/accounting/posting/source-events.
[ ] Implementar GET /api/v1/tenant/accounting/source-event-links.
[ ] Implementar GET /api/v1/tenant/accounting/source-event-links/{sourceEventLinkId}.
[ ] Implementar GET /api/v1/tenant/accounting/closing-runs.
[ ] Implementar POST /api/v1/tenant/accounting/periods/{periodId}/closing-runs.
[ ] Implementar GET /api/v1/tenant/accounting/closing-runs/{closingRunId}.
[ ] Implementar POST /api/v1/tenant/accounting/closing-runs/{closingRunId}/execute.
[ ] Implementar POST /api/v1/tenant/accounting/closing-runs/{closingRunId}/cancel.
[ ] Implementar POST /api/v1/tenant/accounting/closing-runs/{closingRunId}/archive.
[ ] Implementar GET /api/v1/tenant/accounting/reports/general-journal.
[ ] Implementar GET /api/v1/tenant/accounting/reports/general-ledger.
[ ] Implementar GET /api/v1/tenant/accounting/reports/trial-balance.
[ ] Implementar GET /api/v1/tenant/accounting/reports/income-expense.
[ ] Implementar GET /api/v1/tenant/accounting/reports/balance-sheet.
[ ] Implementar GET /api/v1/tenant/accounting/reports/export.
```

---

# 27. EPIC-020-23 — Authorization, guards and policies

## 27.1. Guards

### Tasks

```text id="z8v356"
[ ] Crear AccountingPermissionGuard.
[ ] Crear TenantAccountingGuard.
[ ] Crear AccountingPolicyGuard.
[ ] Crear ChartOfAccountsTenantGuard.
[ ] Crear AccountingAccountTenantGuard.
[ ] Crear AccountingPeriodTenantGuard.
[ ] Crear AccountingMappingRuleTenantGuard.
[ ] Crear JournalEntryTenantGuard.
[ ] Crear AccountingClosingRunTenantGuard.
[ ] Crear AccountingReportGuard.
[ ] Aplicar AuthGuard a todas las rutas tenant.
[ ] Aplicar TenantGuard a todas las rutas tenant.
[ ] Aplicar PermissionGuard por endpoint.
[ ] Validar PlatformAdmin sin acceso automático a ledger tenant.
```

---

## 27.2. Permission wiring

### Tasks

```text id="mqbrq9"
[ ] Registrar permisos accountingPolicies.*.
[ ] Registrar permisos chartOfAccounts.*.
[ ] Registrar permisos accountingAccounts.*.
[ ] Registrar permisos accountingPeriods.*.
[ ] Registrar permisos accountingMappingRules.*.
[ ] Registrar permisos journalEntries.*.
[ ] Registrar permisos accountingSourceEventLinks.read.
[ ] Registrar permisos accountingClosingRuns.*.
[ ] Registrar permisos accountingReports.*.
[ ] Registrar permiso accounting.audit.read.
[ ] Crear seeds de permisos.
[ ] Asociar permisos a roles recomendados.
[ ] Crear tests por rol.
```

---

# 28. EPIC-020-24 — Audit

## 28.1. Audit service

### Tasks

```text id="v9knu8"
[ ] Crear AccountingAuditService.
[ ] Integrar AuditPort.
[ ] Emitir accountingPolicy.created.
[ ] Emitir accountingPolicy.updated.
[ ] Emitir accountingPolicy.activated.
[ ] Emitir accountingPolicy.disabled.
[ ] Emitir accountingPolicy.archived.
[ ] Emitir chartOfAccounts.created.
[ ] Emitir chartOfAccounts.updated.
[ ] Emitir chartOfAccounts.activated.
[ ] Emitir chartOfAccounts.archived.
[ ] Emitir accountingAccount.created.
[ ] Emitir accountingAccount.updated.
[ ] Emitir accountingAccount.activated.
[ ] Emitir accountingAccount.disabled.
[ ] Emitir accountingAccount.archived.
[ ] Emitir accountingAccount.controlFlagChanged.
[ ] Emitir accountingPeriod.created.
[ ] Emitir accountingPeriod.generated.
[ ] Emitir accountingPeriod.updated.
[ ] Emitir accountingPeriod.locked.
[ ] Emitir accountingPeriod.closed.
[ ] Emitir accountingPeriod.reopened.
[ ] Emitir accountingPeriod.archived.
[ ] Emitir accountingMappingRule.created.
[ ] Emitir accountingMappingRule.updated.
[ ] Emitir accountingMappingRule.activated.
[ ] Emitir accountingMappingRule.disabled.
[ ] Emitir accountingMappingRule.archived.
[ ] Emitir journalEntry.created.
[ ] Emitir journalEntry.updatedDraft.
[ ] Emitir journalEntry.approved.
[ ] Emitir journalEntry.posted.
[ ] Emitir journalEntry.reversed.
[ ] Emitir journalEntry.voided.
[ ] Emitir journalEntry.archived.
[ ] Emitir journalEntry.postingRejected.
[ ] Emitir journalEntry.unbalancedRejected.
[ ] Emitir journalEntry.duplicateSourceRejected.
[ ] Emitir journalEntryLine.created.
[ ] Emitir journalEntryLine.updatedDraft.
[ ] Emitir accountingSourceEventLink.created.
[ ] Emitir accountingSourceEventLink.duplicateDetected.
[ ] Emitir accountingClosingRun.created.
[ ] Emitir accountingClosingRun.started.
[ ] Emitir accountingClosingRun.completed.
[ ] Emitir accountingClosingRun.completedWithWarnings.
[ ] Emitir accountingClosingRun.failed.
[ ] Emitir accountingClosingRun.cancelled.
[ ] Emitir accountingClosingRun.archived.
[ ] Emitir accountingReport.generated.
[ ] Emitir accountingReport.exported.
```

---

## 28.2. Audit sanitization

### Tasks

```text id="mzzp1d"
[ ] Crear AccountingAuditSanitizer.
[ ] Permitir accountingPolicyId.
[ ] Permitir chartOfAccountsId.
[ ] Permitir accountingAccountId.
[ ] Permitir accountingPeriodId.
[ ] Permitir accountingMappingRuleId.
[ ] Permitir journalEntryId.
[ ] Permitir journalNumber.
[ ] Permitir sourceModule.
[ ] Permitir sourceResourceType.
[ ] Permitir sourceResourceId.
[ ] Permitir sourceEventType.
[ ] Permitir entryType.
[ ] Permitir entryStatus.
[ ] Permitir accountCode.
[ ] Permitir amount.
[ ] Permitir currency.
[ ] Permitir periodCode.
[ ] Permitir closingRunId.
[ ] Remover tokens.
[ ] Remover secrets.
[ ] Remover passwords.
[ ] Remover raw provider payload.
[ ] Remover raw bank payload.
[ ] Remover storageKey.
[ ] Remover signedUrl.
[ ] Remover SQL raw.
[ ] Remover stack trace.
[ ] Remover datos personales innecesarios.
[ ] Remover datos contables masivos completos.
```

---

# 29. EPIC-020-25 — Observability

## 29.1. Logs

### Tasks

```text id="c4uvij"
[ ] Crear AccountingLogger.
[ ] Loggear accountingPolicy.activated.
[ ] Loggear chartOfAccounts.activated.
[ ] Loggear accountingAccount.created.
[ ] Loggear accountingPeriod.closed.
[ ] Loggear journalEntry.posted.
[ ] Loggear journalEntry.reversed.
[ ] Loggear journalEntry.unbalancedRejected.
[ ] Loggear journalEntry.duplicateSourceRejected.
[ ] Loggear accountingClosingRun.completed.
[ ] Loggear accountingClosingRun.failed.
[ ] Loggear accountingReport.exported.
[ ] Incluir traceId.
[ ] Incluir requestId.
[ ] Incluir action.
[ ] Incluir outcome.
[ ] Incluir entryType.
[ ] Incluir sourceModule.
[ ] Incluir sourceEventType.
[ ] Incluir currency.
[ ] Incluir durationMs.
[ ] Incluir errorCode.
[ ] No loggear tenantId como label.
[ ] No loggear userId como label.
[ ] No loggear raw payload.
[ ] No loggear storageKey.
[ ] No loggear signedUrl.
[ ] No loggear SQL raw.
[ ] No loggear stack trace en producción.
```

---

## 29.2. Metrics

### Tasks

```text id="c5s3wn"
[ ] Crear AccountingMetricsService.
[ ] Emitir accounting_journal_entries_total.
[ ] Emitir accounting_journal_entries_posted_total.
[ ] Emitir accounting_journal_entries_reversed_total.
[ ] Emitir accounting_journal_entries_rejected_total.
[ ] Emitir accounting_unbalanced_entries_rejected_total.
[ ] Emitir accounting_duplicate_source_events_total.
[ ] Emitir accounting_periods_closed_total.
[ ] Emitir accounting_closing_runs_total.
[ ] Emitir accounting_closing_runs_failed_total.
[ ] Emitir accounting_reports_exported_total.
[ ] Usar labels permitidos.
[ ] Prohibir tenantId como label.
[ ] Prohibir userId como label.
[ ] Prohibir journalEntryId como label.
[ ] Prohibir accountingAccountId como label.
[ ] Prohibir sourceResourceId como label.
[ ] Prohibir paymentId como label.
[ ] Prohibir chargeId como label.
[ ] Prohibir bankTransactionId como label.
[ ] Prohibir traceId como label.
```

---

# 30. EPIC-020-26 — OpenAPI

## 30.1. Tags

### Tasks

```text id="jgooj3"
[ ] Crear tag Accounting Policies.
[ ] Crear tag Chart of Accounts.
[ ] Crear tag Accounting Accounts.
[ ] Crear tag Accounting Periods.
[ ] Crear tag Accounting Mapping Rules.
[ ] Crear tag Journal Entries.
[ ] Crear tag Accounting Posting.
[ ] Crear tag Accounting Source Event Links.
[ ] Crear tag Accounting Closing Runs.
[ ] Crear tag Accounting Reports.
```

---

## 30.2. Extensions

### Tasks

```text id="txwhzt"
[ ] Agregar x-tenant-scope=true.
[ ] Agregar x-auth-required=true.
[ ] Agregar x-accounting-ledger=true.
[ ] Agregar x-public-exposure=false.
[ ] Agregar x-double-entry-required en journal entries.
[ ] Agregar x-posted-entry-immutable en journal entries.
[ ] Agregar x-source-linked en posting.
[ ] Agregar x-idempotent-source-event en posting.
[ ] Agregar x-period-aware en posting/closing.
[ ] Agregar x-closing-operation en closing.
[ ] Agregar x-audit-required en operaciones críticas.
[ ] Agregar x-derived-from-posted-ledger en reports.
[ ] Agregar x-export-via-secure-document-storage en exports.
[ ] Agregar x-creates-payment=false.
[ ] Agregar x-updates-account-statement=false.
[ ] Agregar x-confirms-bank-reconciliation=false.
[ ] Validar que no se documenten rutas /public/accounting.
[ ] Validar que no se documenten rutas /me/accounting.
```

---

# 31. EPIC-020-27 — Tests

## 31.1. Unit tests

### Tasks

```text id="j2vftj"
[ ] Crear tests para AccountingAccountCode.
[ ] Crear tests para AccountingPeriodRange.
[ ] Crear tests para JournalNumber.
[ ] Crear tests para JournalEntryAmount.
[ ] Crear tests para DebitCreditAmount.
[ ] Crear tests para AccountingIdempotencyKey.
[ ] Crear tests para AccountingPolicy.
[ ] Crear tests para ChartOfAccounts.
[ ] Crear tests para AccountingAccount.
[ ] Crear tests para AccountingPeriod.
[ ] Crear tests para AccountingMappingRule.
[ ] Crear tests para JournalEntry.
[ ] Crear tests para JournalEntryLine.
[ ] Crear tests para AccountingSourceEventLink.
[ ] Crear tests para AccountingClosingRun.
```

---

## 31.2. Policy tests

### Tasks

```text id="b3hcu7"
[ ] Test JournalEntryBalancePolicy.
[ ] Test JournalEntryImmutabilityPolicy.
[ ] Test ClosedPeriodPostingPolicy.
[ ] Test ControlAccountPostingPolicy.
[ ] Test SourceEventIdempotencyPolicy.
[ ] Test NoPaymentCreationFromAccountingPolicy.
[ ] Test NoAccountStatementMutationPolicy.
[ ] Test NoBankReconciliationConfirmationPolicy.
[ ] Test NoOpenBankingDirectPostingPolicy.
[ ] Test NoPublicAccountingEndpointPolicy.
[ ] Test NoMeAccountingEndpointPolicy.
[ ] Test NoExternalAiAccountingDataPolicy.
```

---

## 31.3. Repository tests

### Tasks

```text id="ms409r"
[ ] Test AccountingPolicyRepository.
[ ] Test ChartOfAccountsRepository.
[ ] Test AccountingAccountRepository.
[ ] Test AccountingPeriodRepository.
[ ] Test AccountingMappingRuleRepository.
[ ] Test JournalEntryRepository.
[ ] Test JournalEntryLineRepository.
[ ] Test AccountingSourceEventLinkRepository.
[ ] Test AccountingBalanceSnapshotRepository.
[ ] Test AccountingClosingRunRepository.
[ ] Test tenant isolation en todos los repositorios.
[ ] Test unique indexes.
[ ] Test raw constraints.
[ ] Test archived excluded by default.
```

---

## 31.4. Service tests

### Tasks

```text id="wn31wa"
[ ] Test AccountingPolicyService.
[ ] Test ChartOfAccountsService.
[ ] Test AccountingAccountService.
[ ] Test AccountingPeriodService.
[ ] Test AccountingMappingRuleService.
[ ] Test JournalEntryService.
[ ] Test JournalEntryPostingService.
[ ] Test JournalEntryReversalService.
[ ] Test AccountingPostingEngineService.
[ ] Test AccountingSourceEventService.
[ ] Test AccountingBalanceService.
[ ] Test AccountingBalanceSnapshotService.
[ ] Test AccountingClosingRunService.
[ ] Test AccountingReportService.
[ ] Test AccountingExportService.
```

---

## 31.5. Integration and regression tests

### Tasks

```text id="wzc8n6"
[ ] Test charge.issued -> JournalEntry.
[ ] Test charge.adjusted -> JournalEntry.
[ ] Test charge.reversed -> reversal accounting effect.
[ ] Test payment.allocated -> JournalEntry.
[ ] Test payment.reversed -> reversal accounting effect.
[ ] Test bankTransaction.reconciled si feature flag activo.
[ ] Test providerSettlement.reviewed si feature flag activo.
[ ] Test Open Banking no genera JournalEntry directo.
[ ] Test Ledger no crea Payment.
[ ] Test Ledger no crea PaymentAllocation.
[ ] Test Ledger no modifica Account Statements.
[ ] Test Ledger no crea ReconciliationMatch.
[ ] Test Ledger no marca BankTransaction matched.
[ ] Test exports vía Secure Document Storage.
```

---

## 31.6. API tests

### Tasks

```text id="fdbkfl"
[ ] Test Accounting Policies API.
[ ] Test Chart of Accounts API.
[ ] Test Accounting Accounts API.
[ ] Test Accounting Periods API.
[ ] Test Accounting Mapping Rules API.
[ ] Test Journal Entries API.
[ ] Test Automatic Posting API.
[ ] Test Source Event Links API.
[ ] Test Closing Runs API.
[ ] Test Reports API.
[ ] Test public accounting endpoints forbidden.
[ ] Test /me accounting endpoints forbidden.
```

---

## 31.7. Security tests

### Tasks

```text id="kgbezi"
[ ] Test no tenantId body.
[ ] Test no actor fields body.
[ ] Test no status directo.
[ ] Test no totalDebit/totalCredit client source.
[ ] Test no postedAt desde cliente.
[ ] Test no cross-tenant policy.
[ ] Test no cross-tenant chart.
[ ] Test no cross-tenant account.
[ ] Test no cross-tenant period.
[ ] Test no cross-tenant mapping rule.
[ ] Test no cross-tenant journal entry.
[ ] Test no cross-tenant line.
[ ] Test no cross-tenant source link.
[ ] Test no cross-tenant closing run.
[ ] Test no cross-tenant report.
[ ] Test posted immutable.
[ ] Test unbalanced rejected.
[ ] Test duplicate source rejected.
[ ] Test closed period posting rejected.
[ ] Test control account manual posting rejected without permission.
[ ] Test no Payment creation.
[ ] Test no Account Statements mutation.
[ ] Test no Bank Reconciliation confirmation.
[ ] Test no Open Banking direct posting.
[ ] Test no WordPress access.
[ ] Test external AI disabled.
```

---

## 31.8. Performance and concurrency tests

### Tasks

```text id="csyixl"
[ ] Test listar cuentas p95 < 800 ms.
[ ] Test listar journal entries p95 < 1000 ms.
[ ] Test general ledger p95 < 1500 ms.
[ ] Test trial balance p95 < 2000 ms.
[ ] Test closing run pequeño/mediano p95 < 3000 ms excluyendo jobs pesados.
[ ] Test dos postings simultáneos no duplican posted.
[ ] Test source event simultáneo no duplica asiento.
[ ] Test reversal simultáneo no duplica reverso.
[ ] Test closing runs simultáneos no corren juntos.
[ ] Test journalNumber simultáneo no duplica número.
[ ] Test accountCode duplicado simultáneo retorna un éxito y un 409.
```

---

# 32. EPIC-020-28 — Security hardening

## 32.1. DTO hardening

### Tasks

```text id="u5uajm"
[ ] Activar whitelist.
[ ] Activar forbidNonWhitelisted.
[ ] Rechazar tenantId.
[ ] Rechazar createdBy.
[ ] Rechazar updatedBy.
[ ] Rechazar postedBy.
[ ] Rechazar approvedBy.
[ ] Rechazar reversedBy.
[ ] Rechazar closedBy.
[ ] Rechazar archivedBy.
[ ] Rechazar status directo salvo endpoints de transición.
[ ] Rechazar totalDebit como fuente de verdad.
[ ] Rechazar totalCredit como fuente de verdad.
[ ] Rechazar postedAt.
[ ] Rechazar reversedAt.
[ ] Rechazar closedAt.
[ ] Rechazar storageKey.
[ ] Rechazar signedUrl.
[ ] Rechazar raw SQL.
[ ] Rechazar stack trace.
[ ] Rechazar payment creation fields.
[ ] Rechazar bank reconciliation confirmation fields.
[ ] Rechazar account statement mutation fields.
[ ] Rechazar external AI flags.
```

---

## 32.2. Endpoint hardening

### Tasks

```text id="irzszz"
[ ] Verificar que no existan endpoints /api/v1/public/accounting.
[ ] Verificar que no existan endpoints /api/v1/public/tenants/{slug}/accounting.
[ ] Verificar que no existan endpoints /api/v1/me/accounting.
[ ] Verificar Cache-Control no-store.
[ ] Verificar CORS restrictivo.
[ ] Verificar WordPress sin acceso contable.
[ ] Aplicar rate limit en posting.
[ ] Aplicar rate limit en reversal.
[ ] Aplicar rate limit en closing.
[ ] Aplicar rate limit en exports.
[ ] Sanitizar errores.
[ ] Evitar stack traces en producción.
```

---

## 32.3. Accounting hardening

### Tasks

```text id="k9jc23"
[ ] Verificar double-entry obligatorio.
[ ] Verificar posted immutability.
[ ] Verificar source event idempotency.
[ ] Verificar closed period protection.
[ ] Verificar control account protection.
[ ] Verificar Decimal money.
[ ] Verificar no Payment creation.
[ ] Verificar no PaymentAllocation creation.
[ ] Verificar no Account Statements mutation.
[ ] Verificar no ReconciliationMatch creation.
[ ] Verificar no BankTransaction matched desde Accounting.
[ ] Verificar no Open Banking direct posting.
[ ] Verificar reports derived from posted ledger.
[ ] Verificar exports restricted.
```

---

# 33. EPIC-020-29 — CI/CD gates

## 33.1. Pipeline

### Tasks

```text id="zd48vh"
[ ] Agregar lint gate.
[ ] Agregar typecheck gate.
[ ] Agregar unit test gate.
[ ] Agregar value object test gate.
[ ] Agregar entity test gate.
[ ] Agregar policy test gate.
[ ] Agregar repository test gate.
[ ] Agregar service test gate.
[ ] Agregar posting engine test gate.
[ ] Agregar integration test gate.
[ ] Agregar API test gate.
[ ] Agregar authorization test gate.
[ ] Agregar multitenancy test gate.
[ ] Agregar accounting integrity test gate.
[ ] Agregar security test gate.
[ ] Agregar audit test gate.
[ ] Agregar observability test gate.
[ ] Agregar OpenAPI contract test gate.
[ ] Agregar regression test gate.
[ ] Agregar smoke test gate.
```

---

## 33.2. Gates críticos

### Tasks

```text id="c6p9ox"
[ ] Fallar CI si OpenAPI documenta endpoints públicos contables.
[ ] Fallar CI si OpenAPI documenta endpoints /me accounting.
[ ] Fallar CI si DTOs aceptan tenantId.
[ ] Fallar CI si DTOs aceptan actor fields.
[ ] Fallar CI si DTOs aceptan totalDebit/totalCredit como fuente de verdad.
[ ] Fallar CI si se detecta float/double para dinero.
[ ] Fallar CI si permite postear asiento desbalanceado.
[ ] Fallar CI si permite editar asiento posted.
[ ] Fallar CI si permite duplicar source event.
[ ] Fallar CI si permite postear en periodo closed.
[ ] Fallar CI si Ledger crea Payment.
[ ] Fallar CI si Ledger crea PaymentAllocation.
[ ] Fallar CI si Ledger modifica Account Statements.
[ ] Fallar CI si Ledger crea ReconciliationMatch.
[ ] Fallar CI si Ledger marca BankTransaction matched.
[ ] Fallar CI si Open Banking genera JournalEntry directo en MVP.
[ ] Fallar CI si logs contienen payloads completos.
[ ] Fallar CI si logs contienen storageKey.
[ ] Fallar CI si audit contiene datos prohibidos.
[ ] Fallar CI si externalAi está habilitado por defecto.
```

---

# 34. PRs sugeridos

```text id="enragm"
[ ] PR-020-01 — Module skeleton, enums, constants and configuration.
[ ] PR-020-02 — Value objects, entities and state machines.
[ ] PR-020-03 — Domain policies and error catalog.
[ ] PR-020-04 — Prisma schema, migration, constraints and indexes.
[ ] PR-020-05 — Repository ports and Prisma repositories.
[ ] PR-020-06 — Accounting Policy service and API.
[ ] PR-020-07 — Chart of Accounts service, API and generic template.
[ ] PR-020-08 — Accounting Accounts hierarchy and control account protection.
[ ] PR-020-09 — Accounting Periods and period generation.
[ ] PR-020-10 — Accounting Mapping Rules.
[ ] PR-020-11 — Journal Entries, lines, validation and draft lifecycle.
[ ] PR-020-12 — Journal Entry Posting and double-entry validation.
[ ] PR-020-13 — Source Event Links and idempotency.
[ ] PR-020-14 — Reversal accounting and posted immutability.
[ ] PR-020-15 — Posting Engine with Charges integration.
[ ] PR-020-16 — Posting Engine with Payments integration.
[ ] PR-020-17 — Regression boundaries: Account Statements, Bank Reconciliation, Payment Provider, Open Banking.
[ ] PR-020-18 — Balance calculation and balance snapshots.
[ ] PR-020-19 — Accounting Reports.
[ ] PR-020-20 — Period Closing Runs.
[ ] PR-020-21 — Exports via Secure Document Storage.
[ ] PR-020-22 — Audit, observability and OpenAPI.
[ ] PR-020-23 — Tests, hardening, performance and CI gates.
```

---

# 35. Smoke flow obligatorio

```text id="raypa0"
[ ] FinancialManager crea AccountingPolicy.
[ ] FinancialManager activa AccountingPolicy.
[ ] Accountant crea ChartOfAccounts.
[ ] Accountant crea cuentas mínimas.
[ ] FinancialManager activa ChartOfAccounts.
[ ] Accountant genera periodos mensuales.
[ ] Accountant crea mapping rule charge.issued.
[ ] Accountant activa mapping rule.
[ ] Dues & Fees emite Charge.
[ ] AccountingPostingEngine procesa charge.issued.
[ ] Sistema crea JournalEntry automatic.
[ ] Sistema crea JournalEntryLines.
[ ] Sistema valida totalDebit = totalCredit.
[ ] Sistema postea JournalEntry.
[ ] Sistema crea AccountingSourceEventLink.
[ ] Sistema rechaza reprocesar el mismo source event como duplicado/idempotente.
[ ] Accountant crea JournalEntry manual balanceado.
[ ] Accountant postea JournalEntry manual.
[ ] Accountant reversa JournalEntry manual.
[ ] Sistema consulta General Journal.
[ ] Sistema consulta General Ledger.
[ ] Sistema genera Trial Balance.
[ ] FinancialManager ejecuta ClosingRun.
[ ] Sistema cierra periodo.
[ ] Sistema exporta Trial Balance vía Secure Document Storage.
[ ] Sistema audita eventos críticos.
```

---

# 36. Checklist de Definition of Done

```text id="dbkp0v"
[ ] spec.md aprobado.
[ ] plan.md aprobado.
[ ] data-model.md aprobado.
[ ] api-contract.md aprobado.
[ ] test-plan.md aprobado.
[ ] tasks.md aprobado.
[ ] security-notes.md creado.
[ ] Módulo registrado.
[ ] Enums implementados.
[ ] Configuración implementada.
[ ] Feature flags implementados.
[ ] Value objects implementados.
[ ] Entidades implementadas.
[ ] State machines implementadas.
[ ] Policies implementadas.
[ ] Errores implementados.
[ ] Prisma schema implementado.
[ ] Migración creada.
[ ] Constraints creados.
[ ] Índices creados.
[ ] Repositorios implementados.
[ ] AccountingPolicy implementado.
[ ] ChartOfAccounts implementado.
[ ] AccountingAccounts implementado.
[ ] AccountingPeriods implementado.
[ ] AccountingMappingRules implementado.
[ ] JournalEntries implementado.
[ ] JournalEntryLines implementado.
[ ] Posting service implementado.
[ ] Posting engine implementado.
[ ] SourceEventLinks implementado.
[ ] Idempotencia implementada.
[ ] Reversal accounting implementado.
[ ] Charges integration implementada.
[ ] Payments integration implementada.
[ ] Regression boundaries implementados.
[ ] Balance calculation implementado.
[ ] Balance snapshots implementado.
[ ] Reports implementados.
[ ] Closing runs implementados.
[ ] Exports SDS implementados.
[ ] Controllers REST implementados.
[ ] Guards implementados.
[ ] Permisos registrados.
[ ] Audit implementado.
[ ] Observability implementado.
[ ] OpenAPI implementado.
[ ] Tests unitarios pasan.
[ ] Tests de repositorio pasan.
[ ] Tests de servicios pasan.
[ ] Tests de posting pasan.
[ ] Tests de integración pasan.
[ ] Tests API pasan.
[ ] Tests de autorización pasan.
[ ] Tests multitenant pasan.
[ ] Tests de integridad contable pasan.
[ ] Tests de seguridad pasan.
[ ] Tests de auditoría pasan.
[ ] Tests de observabilidad pasan.
[ ] Tests OpenAPI pasan.
[ ] Tests de performance mínimos pasan.
[ ] Tests de concurrencia pasan.
[ ] Smoke tests pasan.
[ ] CI pasa.
```

---

# 37. No aceptación

La implementación no debe aceptarse si queda alguna de estas condiciones:

```text id="igxkd1"
[ ] Permite accounting policy cross-tenant.
[ ] Permite chart of accounts cross-tenant.
[ ] Permite accounting account cross-tenant.
[ ] Permite accounting period cross-tenant.
[ ] Permite mapping rule cross-tenant.
[ ] Permite journal entry cross-tenant.
[ ] Permite journal entry line cross-tenant.
[ ] Permite source event link cross-tenant.
[ ] Permite balance snapshot cross-tenant.
[ ] Permite closing run cross-tenant.
[ ] Permite accounting report cross-tenant.
[ ] Acepta tenantId desde body.
[ ] Acepta actor fields desde body.
[ ] Acepta status directo sin endpoint de transición.
[ ] Usa findUnique por id simple en entidades tenant-scoped.
[ ] Acepta totalDebit como fuente de verdad del cliente.
[ ] Acepta totalCredit como fuente de verdad del cliente.
[ ] Permite postear asiento sin líneas.
[ ] Permite postear asiento con una sola línea.
[ ] Permite postear asiento desbalanceado.
[ ] Permite línea con debit y credit simultáneos.
[ ] Permite línea con ambos montos cero.
[ ] Permite línea con monto negativo.
[ ] Permite postear con cuenta inactive.
[ ] Permite postear con cuenta archived.
[ ] Permite postear en cuenta no posteable.
[ ] Permite postear manualmente en control account sin permiso.
[ ] Permite editar JournalEntry posted.
[ ] Permite borrar JournalEntry posted.
[ ] Permite reversar JournalEntry draft.
[ ] Permite reversar sin razón.
[ ] Duplica asiento por mismo source event.
[ ] Permite postear en periodo locked.
[ ] Permite postear en periodo closed.
[ ] Permite postear en periodo archived.
[ ] Cierra periodo con trial balance desbalanceado.
[ ] Cierra periodo con errores críticos sin registrarlos.
[ ] Reportes derivan directamente de Charges/Payments sin JournalEntries posted.
[ ] Ledger crea Payment.
[ ] Ledger crea PaymentAllocation.
[ ] Ledger modifica Account Statements.
[ ] Ledger crea ReconciliationMatch.
[ ] Ledger marca BankTransaction matched.
[ ] Ledger cierra ReconciliationSession.
[ ] Open Banking genera JournalEntry directo en MVP.
[ ] Existe endpoint público contable.
[ ] Existe endpoint /me contable.
[ ] WordPress accede a datos contables.
[ ] Datos contables reales se envían a IA externa.
[ ] Audit no está sanitizada.
[ ] Logs contienen payloads completos.
[ ] Logs contienen storageKey.
[ ] Logs contienen stack trace productivo.
[ ] Se usa float/double para dinero.
```

---

# 38. Resultado esperado

Al completar estas tareas, el módulo `020-accounting-ledger` quedará listo para implementación productiva gradual como base contable interna de RESIDENT Core.

Resultado esperado:

```text id="e7b4rx"
module foundation complete
enums complete
configuration complete
feature flags complete
value objects complete
domain entities complete
state machines complete
domain policies complete
error catalog complete
database migration complete
repositories complete
AccountingPolicy complete
ChartOfAccounts complete
AccountingAccounts complete
AccountingPeriods complete
AccountingMappingRules complete
JournalEntries complete
JournalEntryLines complete
double-entry validation complete
posting service complete
posting engine complete
source event links complete
source event idempotency complete
reversal accounting complete
Charges integration complete
Payments integration complete
Account Statements regression boundary complete
Bank Reconciliation regression boundary complete
Payment Provider regression boundary complete
Open Banking direct posting blocked
balance calculation complete
balance snapshots complete
general journal complete
general ledger complete
trial balance complete
income expense report complete
basic balance sheet complete
closing runs complete
exports via Secure Document Storage complete
audit complete
observability complete
OpenAPI complete
tests complete
security hardening complete
CI/CD gates complete
no Payment auto-creation
no PaymentAllocation auto-creation
no Account Statements mutation
no Bank Reconciliation final confirmation
no public accounting endpoints
no /me accounting endpoints
no WordPress accounting access
no external AI with real accounting data
```

---

# 39. Expediente actualizado

```text id="x5157u"
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
│   │       ├── data-model.md
│   │       ├── api-contract.md
│   │       ├── test-plan.md
│   │       └── tasks.md
```
