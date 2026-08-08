# Plan — Spec 020 Accounting Ledger

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                                                                                                       |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                                                                                                               |
| Spec ID         | 020                                                                                                                                                                                                                                                         |
| Módulo          | Accounting Ledger                                                                                                                                                                                                                                           |
| Documento       | Plan técnico                                                                                                                                                                                                                                                |
| Ruta            | `docs/specs/020-accounting-ledger/plan.md`                                                                                                                                                                                                                  |
| Versión         | 0.1                                                                                                                                                                                                                                                         |
| Estado          | Borrador inicial                                                                                                                                                                                                                                            |
| Fecha           | 2026-07-23                                                                                                                                                                                                                                                  |
| Documento base  | `docs/specs/020-accounting-ledger/spec.md`                                                                                                                                                                                                                  |
| Depende de      | `001-tenants`, `002-users-roles`, `004-dues-fees`, `005-payments`, `006-account-statements`, `007-audit`, `008-basic-reports`, `016-secure-document-storage`, `017-bank-reconciliation`, `018-payment-provider-integration`, `019-open-banking-integration` |
| Relacionado con | contabilidad, plan de cuentas, partida doble, libro diario, libro mayor, asientos, periodos, cierres, reportes contables                                                                                                                                    |
| API Style       | REST                                                                                                                                                                                                                                                        |
| Arquitectura    | Monolito modular preparado para microservicios                                                                                                                                                                                                              |
| Stack objetivo  | NestJS, TypeScript, PostgreSQL, Prisma, Decimal, OpenAPI, Keycloak/OIDC, Docker, Secure Document Storage                                                                                                                                                    |

---

## 2. Propósito

Este documento define el plan técnico para implementar el módulo `020-accounting-ledger`.

El módulo incorporará una capa contable interna para RESIDENT Core, basada en partida doble, plan de cuentas por tenant, periodos contables, asientos, reglas de mapeo, libro diario, libro mayor, balance de comprobación, cierres básicos y reportes contables administrativos.

Regla central:

```text id="pqgq1d"
Accounting Ledger debe registrar efectos contables derivados de eventos financieros confiables, cumpliendo partida doble, tenant isolation, Decimal money, source-event traceability, idempotencia, period awareness, inmutabilidad de asientos contabilizados, reversos auditados, reportes derivados del ledger y ausencia total de endpoints públicos o mutaciones operativas sobre Payments, Account Statements o Bank Reconciliation.
```

---

## 3. Decisión técnica inicial

### 3.1. Nombre técnico del módulo

```text id="bkz2ln"
accounting-ledger
```

---

### 3.2. Ruta sugerida

```text id="zx2vtc"
apps/api/src/modules/accounting-ledger/
```

---

### 3.3. Tipo de módulo

```text id="aj053m"
Financial accounting module
Tenant-scoped
Double-entry
Source-linked
Posting-driven
Period-aware
Immutable-after-posting
Reversal-based
Report-ready
Audit-heavy
Non-public administrative surface
```

---

### 3.4. Estilo arquitectónico

El módulo seguirá el patrón general de RESIDENT Core:

```text id="xt3tro"
monolito modular
API-first
NestJS
TypeScript
PostgreSQL
Prisma
REST
OpenAPI
Keycloak/OIDC para autenticación
autorización propia dentro de RESIDENT Core
Decimal para dinero
event-source mapping
idempotencia por evento fuente
auditoría financiera obligatoria
observabilidad segura
preparado para separación futura como microservicio contable
```

---

## 4. Decisión MVP

El MVP será un **ledger contable interno de partida doble**, no un sistema tributario completo.

Incluye:

```text id="bb6pay"
- política contable por tenant;
- plan de cuentas por tenant;
- cuentas contables jerárquicas;
- cuentas de control protegidas;
- periodos contables mensuales y anuales;
- reglas de mapeo contable;
- asientos automáticos desde eventos financieros soportados;
- asientos manuales autorizados;
- líneas debit/credit;
- validación totalDebit = totalCredit;
- posting en periodos abiertos;
- inmutabilidad de asientos posted;
- reversos auditados;
- idempotencia por source event;
- source event links;
- libro diario;
- libro mayor;
- balance de comprobación;
- reporte básico de ingresos y gastos;
- balance general básico;
- cierre de periodo básico;
- snapshots de balance opcionales para performance;
- export de reportes mediante Secure Document Storage;
- auditoría completa;
- logs y métricas seguras;
- OpenAPI privado;
- cero endpoints públicos;
- cero endpoints /me en MVP;
- cero acceso contable desde WordPress;
- cero IA externa con datos contables reales.
```

---

## 5. Fuera de alcance técnico MVP

No implementar en esta spec:

```text id="fyfxge"
- contabilidad tributaria completa;
- declaración de impuestos;
- integración SRI;
- facturación electrónica;
- retenciones;
- anexos tributarios;
- nómina;
- depreciaciones automáticas;
- activos fijos;
- cuentas por pagar completas;
- supplier payments completo;
- presupuestos contables avanzados;
- centros de costo avanzados;
- proyectos contables;
- multi-moneda;
- consolidación multi-tenant;
- estados financieros legalmente certificados;
- firma electrónica de libros;
- cierre fiscal formal;
- auditoría externa formal;
- integración con software contable externo;
- asientos irreversibles generados desde movimientos bancarios no conciliados;
- contabilización directa desde Open Banking;
- creación de pagos desde ledger;
- mutación de estados de cuenta desde ledger;
- confirmación de conciliación bancaria desde ledger;
- IA contable con datos reales.
```

---

## 6. Dependencias funcionales

### 6.1. `001-tenants`

Uso:

```text id="tfbrsb"
- validar tenant activo;
- aplicar tenant_id en políticas, planes, cuentas, periodos, reglas, asientos, líneas, source links, snapshots y cierres;
- impedir reportes cross-tenant;
- impedir asientos cross-tenant;
- bloquear operación si tenant está suspended/archived.
```

---

### 6.2. `002-users-roles`

Uso:

```text id="qwyv5x"
- validar usuario autenticado;
- validar membership activa;
- validar permisos contables;
- auditar actor real;
- impedir acceso contable a residentes/propietarios en MVP;
- impedir acceso automático de PlatformAdmin a libros contables tenant.
```

---

### 6.3. `004-dues-fees`

Eventos candidatos:

```text id="byvrwl"
charge.issued
charge.adjusted
charge.reversed
charge.cancelled
```

Uso:

```text id="d6f43i"
- crear asientos automáticos por cargos emitidos;
- crear asientos por ajustes;
- crear reversos contables por reversos/cancelaciones;
- mantener source link hacia Charge, ChargeAdjustment o ChargeReversal.
```

Regla:

```text id="f8qkn0"
Accounting Ledger no modifica Charges.
```

---

### 6.4. `005-payments`

Eventos candidatos:

```text id="q3mi2o"
payment.validated
payment.allocated
payment.reversed
payment.receiptIssued
```

Uso:

```text id="lrcgp3"
- crear asiento por pago validado/asignado;
- registrar reducción de cuentas por cobrar;
- registrar ingreso a caja/banco/cuenta puente;
- crear reverso contable si el pago se reversa;
- mantener source link hacia Payment, PaymentAllocation o PaymentReversal.
```

Regla:

```text id="tgylng"
Accounting Ledger no crea Payments ni PaymentAllocations.
```

---

### 6.5. `006-account-statements`

Uso:

```text id="m20z9q"
- comparar saldos operativos contra saldos contables;
- alimentar reportes de diferencias si aplica;
- no mutar líneas ni balances de Account Statements.
```

Regla:

```text id="z3ibzt"
Account Statements sigue siendo fuente operativa de saldos de residentes/unidades; Accounting Ledger es representación contable.
```

---

### 6.6. `007-audit`

Uso:

```text id="ftfli4"
- auditar creación y activación de política contable;
- auditar plan de cuentas;
- auditar cuentas contables;
- auditar periodos;
- auditar reglas de mapeo;
- auditar asientos;
- auditar posting;
- auditar reversos;
- auditar cierres;
- auditar reaperturas;
- auditar reportes y exports.
```

---

### 6.7. `008-basic-reports`

Uso:

```text id="k63ap4"
- integrar reportes contables básicos;
- permitir exportación;
- alimentar dashboards administrativos futuros.
```

---

### 6.8. `016-secure-document-storage`

Uso:

```text id="d3z6rw"
- almacenar exports de libro diario;
- almacenar exports de libro mayor;
- almacenar balance de comprobación;
- almacenar reportes de ingresos/gastos;
- almacenar balance general básico;
- almacenar evidencia de cierre contable.
```

Recomendación:

```text id="txu9pn"
Extender SourceModule de Secure Document Storage con accountingLedger.
```

---

### 6.9. `017-bank-reconciliation`

Eventos candidatos:

```text id="sfxw85"
bankTransaction.reconciled
bankTransaction.unreconciled
bankFee.detected
bankInterest.detected
```

Uso:

```text id="ddzeok"
- registrar fees bancarios confirmados;
- registrar intereses bancarios confirmados;
- registrar efectos derivados de conciliaciones confirmadas;
- impedir contabilización automática desde movimientos no conciliados.
```

Regla:

```text id="h62k7e"
Bank Reconciliation confirma conciliación; Accounting Ledger registra el efecto contable posterior cuando existe regla activa.
```

---

### 6.10. `018-payment-provider-integration`

Eventos candidatos:

```text id="e8exml"
providerPayment.verified
providerSettlement.reviewed
providerFee.confirmed
providerChargeback.requiresReview
```

Uso:

```text id="mk8sdc"
- registrar fees de proveedor cuando estén confirmados;
- registrar liquidaciones revisadas;
- registrar reversos o chargebacks solo bajo flujo controlado futuro;
- cruzar PaymentProvider mappings como source links.
```

Regla:

```text id="g0sscd"
Provider settlements no se contabilizan como definitivos sin revisión o conciliación según política.
```

---

### 6.11. `019-open-banking-integration`

Uso:

```text id="gp38qu"
- no contabilizar directamente movimientos Open Banking en MVP;
- recibir efectos contables únicamente después de Bank Reconciliation o revisión autorizada;
- mantener separación entre lectura bancaria y ledger contable.
```

Regla:

```text id="xqycag"
Open Banking no genera JournalEntries directos en MVP.
```

---

## 7. Estructura de carpetas propuesta

```text id="krj7yp"
apps/api/src/modules/accounting-ledger/
├── accounting-ledger.module.ts
├── controllers/
│   ├── accounting-policies.controller.ts
│   ├── chart-of-accounts.controller.ts
│   ├── accounting-accounts.controller.ts
│   ├── accounting-periods.controller.ts
│   ├── accounting-mapping-rules.controller.ts
│   ├── journal-entries.controller.ts
│   ├── accounting-source-event-links.controller.ts
│   ├── accounting-closing-runs.controller.ts
│   └── accounting-reports.controller.ts
│
├── application/
│   ├── use-cases/
│   ├── services/
│   └── ports/
│
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   └── errors/
│
├── infrastructure/
│   ├── persistence/
│   ├── integrations/
│   ├── posting/
│   ├── reports/
│   ├── exports/
│   ├── audit/
│   └── observability/
│
├── dto/
├── guards/
├── policies/
├── mappers/
└── tests/
```

---

## 8. Componentes principales

### 8.1. Módulo NestJS

```text id="b2o61c"
AccountingLedgerModule
```

Responsabilidades:

```text id="mh944e"
- registrar controladores;
- registrar servicios de aplicación;
- registrar repositorios;
- registrar policies;
- registrar integraciones financieras;
- registrar posting engine;
- registrar report engine;
- registrar audit integration;
- registrar observabilidad;
- publicar OpenAPI seguro.
```

---

### 8.2. Controladores

```text id="vg8j5u"
AccountingPoliciesController
ChartOfAccountsController
AccountingAccountsController
AccountingPeriodsController
AccountingMappingRulesController
JournalEntriesController
AccountingSourceEventLinksController
AccountingClosingRunsController
AccountingReportsController
```

---

### 8.3. Servicios de aplicación

```text id="ff9hpb"
AccountingPolicyService
ChartOfAccountsService
AccountingAccountService
AccountingPeriodService
AccountingMappingRuleService
JournalEntryService
JournalEntryPostingService
JournalEntryReversalService
AccountingSourceEventService
AccountingPostingEngineService
AccountingBalanceService
AccountingClosingRunService
AccountingReportService
AccountingExportService
AccountingAuditService
AccountingObservabilityService
```

---

### 8.4. Entidades de dominio

```text id="tj1rwk"
AccountingPolicy
ChartOfAccounts
AccountingAccount
AccountingPeriod
AccountingMappingRule
JournalEntry
JournalEntryLine
AccountingSourceEventLink
AccountingBalanceSnapshot
AccountingClosingRun
```

---

### 8.5. Value Objects

```text id="xpcori"
AccountingAccountCode
AccountingAccountName
AccountingPeriodCode
AccountingPeriodRange
JournalNumber
JournalEntryAmount
DebitCreditAmount
NormalBalance
AccountingCurrency
SourceEventIdentity
AccountingIdempotencyKey
AccountingDescription
ClosingRunSummary
```

---

### 8.6. Puertos de aplicación

```text id="zixz2u"
AccountingPolicyRepositoryPort
ChartOfAccountsRepositoryPort
AccountingAccountRepositoryPort
AccountingPeriodRepositoryPort
AccountingMappingRuleRepositoryPort
JournalEntryRepositoryPort
JournalEntryLineRepositoryPort
AccountingSourceEventLinkRepositoryPort
AccountingBalanceSnapshotRepositoryPort
AccountingClosingRunRepositoryPort

DuesFeesIntegrationPort
PaymentsIntegrationPort
AccountStatementsIntegrationPort
BankReconciliationIntegrationPort
PaymentProviderIntegrationPort
OpenBankingIntegrationPort
SecureDocumentStorageIntegrationPort
AuditPort
ClockPort
IdempotencyPort
DecimalMathPort
ReportExportPort
ObservabilityPort
```

---

### 8.7. Repositorios Prisma

```text id="ndgj6c"
PrismaAccountingPolicyRepository
PrismaChartOfAccountsRepository
PrismaAccountingAccountRepository
PrismaAccountingPeriodRepository
PrismaAccountingMappingRuleRepository
PrismaJournalEntryRepository
PrismaJournalEntryLineRepository
PrismaAccountingSourceEventLinkRepository
PrismaAccountingBalanceSnapshotRepository
PrismaAccountingClosingRunRepository
```

---

## 9. Modelo de datos previsto

### 9.1. Tablas nuevas MVP

```text id="vn4xif"
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

### 9.2. Tablas externas relacionadas

```text id="q4w2mv"
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

---

### 9.3. Regla multitenant

Todas las tablas operativas deben incluir:

```text id="mbs09i"
tenant_id
```

Excepción futura opcional:

```text id="t55ixv"
chart_of_accounts_templates puede ser platform-scoped si se implementa en una spec posterior o extensión del módulo.
```

Patrón requerido:

```typescript id="gm23dn"
await prisma.journalEntry.findFirst({
  where: {
    id: journalEntryId,
    tenantId: currentTenant.id,
    archivedAt: null
  }
});
```

Patrón prohibido:

```typescript id="d59aki"
await prisma.journalEntry.findUnique({
  where: { id: journalEntryId }
});
```

---

## 10. Diseño de estados

### 10.1. AccountingPolicy

Estados:

```text id="k9gpej"
draft
active
inactive
archived
```

Transiciones:

```text id="u927ar"
draft -> active
active -> inactive
inactive -> active
draft -> archived
inactive -> archived
active -> archived
```

Reglas:

```text id="whvyr9"
- solo una política active por tenant si se define como restricción;
- active requiere baseCurrency;
- active requiere fiscal year start;
- archived no se reactiva.
```

---

### 10.2. ChartOfAccounts

Estados:

```text id="g4pfmp"
draft
active
inactive
archived
```

Transiciones:

```text id="g82ubj"
draft -> active
active -> inactive
inactive -> active
draft -> archived
inactive -> archived
active -> archived
```

Reglas:

```text id="rmnqyd"
- active requiere cuentas mínimas;
- active requiere accountCode únicos;
- archived no se usa en nuevos postings.
```

---

### 10.3. AccountingAccount

Estados:

```text id="v23e0l"
draft
active
inactive
archived
```

Transiciones:

```text id="v0q6ib"
draft -> active
active -> inactive
inactive -> active
draft -> archived
inactive -> archived
active -> archived
```

Reglas:

```text id="dg8z3d"
- solo active puede recibir posting;
- cuentas padre agrupadoras pueden tener isPostingAllowed=false;
- control accounts requieren permisos especiales para asiento manual.
```

---

### 10.4. AccountingPeriod

Estados:

```text id="hd9q51"
open
locked
closed
reopened
archived
```

Transiciones:

```text id="t7gd1k"
open -> locked
locked -> open
open -> closed
locked -> closed
closed -> reopened
reopened -> closed
open -> archived
closed -> archived
```

Reglas:

```text id="tyk6wi"
- open permite posting ordinario;
- locked bloquea posting ordinario temporal;
- closed bloquea posting;
- reopened permite correcciones controladas;
- archived solo histórico.
```

---

### 10.5. AccountingMappingRule

Estados:

```text id="ehcgp3"
draft
active
inactive
archived
```

Transiciones:

```text id="tfixad"
draft -> active
active -> inactive
inactive -> active
draft -> archived
inactive -> archived
active -> archived
```

Reglas:

```text id="ass055"
- active requiere debitAccount y creditAccount válidas;
- active requiere sourceModule y sourceEventType;
- si no hay regla activa para un evento, no se inventan cuentas.
```

---

### 10.6. JournalEntry

Estados:

```text id="h9djwe"
draft
pendingApproval
approved
posted
reversed
voided
archived
```

Transiciones:

```text id="xx7d50"
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

Reglas:

```text id="bo3a5v"
- posted es inmutable;
- posted no vuelve a draft;
- reversed se obtiene mediante asiento de reverso;
- voided solo aplica antes de posting;
- archived solo histórico.
```

---

### 10.7. AccountingClosingRun

Estados:

```text id="f04hmh"
draft
running
completed
completedWithWarnings
failed
cancelled
archived
```

Transiciones:

```text id="k7akrt"
draft -> running
running -> completed
running -> completedWithWarnings
running -> failed
draft -> cancelled
running -> cancelled
completed -> archived
completedWithWarnings -> archived
failed -> archived
cancelled -> archived
```

Reglas:

```text id="g2rr60"
- running valida el periodo;
- completed puede cerrar periodo;
- failed no cambia periodo a closed;
- completedWithWarnings requiere metadata de advertencias.
```

---

## 11. Posting engine

### 11.1. Propósito

El `AccountingPostingEngineService` será el componente encargado de transformar eventos fuente en asientos contables.

Responsabilidades:

```text id="uasp7s"
- recibir evento fuente normalizado;
- validar tenant;
- buscar mapping rule activa;
- resolver periodo contable;
- resolver cuentas contables;
- calcular montos Decimal;
- construir JournalEntry;
- construir JournalEntryLines;
- validar partida doble;
- validar periodo abierto;
- validar idempotencia;
- postear asiento;
- crear source event link;
- auditar.
```

---

### 11.2. Flujo general

```text id="zeyq2k"
1. Recibir SourceEvent.
2. Validar tenant activo.
3. Validar sourceModule/sourceEventType.
4. Calcular idempotencyKey.
5. Verificar que no exista JournalEntry posted activo para el mismo evento.
6. Buscar AccountingMappingRule active.
7. Resolver AccountingPeriod por postingDate.
8. Validar periodo open/reopened.
9. Resolver debitAccount y creditAccount.
10. Validar cuentas active.
11. Construir líneas.
12. Validar totalDebit = totalCredit.
13. Crear JournalEntry.
14. Crear JournalEntryLines.
15. Marcar posted.
16. Crear AccountingSourceEventLink.
17. Auditar.
```

---

### 11.3. Idempotency key

Formato conceptual:

```text id="s48ead"
tenantId:sourceModule:sourceResourceType:sourceResourceId:sourceEventType
```

Hash recomendado:

```text id="zt7nr2"
SHA-256
```

---

### 11.4. Eventos fuente MVP

Primera oleada recomendada:

```text id="n9uvqc"
charge.issued
charge.adjusted
charge.reversed
payment.allocated
payment.reversed
```

Segunda oleada recomendada:

```text id="xj2flg"
bankTransaction.reconciled
bankFee.detected
providerSettlement.reviewed
providerFee.confirmed
```

No recomendado en MVP:

```text id="j1pkqd"
openBankingTransaction.imported
openBankingTransaction.sentToReconciliation
```

---

## 12. Estrategia de plan de cuentas

### 12.1. Plantilla inicial genérica

El MVP puede incluir una plantilla base:

```text id="xvf668"
1 Activo
  1.1 Caja
  1.2 Bancos
  1.3 Cuentas por cobrar
  1.4 Cuenta puente de pagos

2 Pasivo
  2.1 Cuentas por pagar
  2.2 Ingresos recibidos por anticipado

3 Patrimonio
  3.1 Fondo patrimonial
  3.2 Resultados acumulados

4 Ingresos
  4.1 Ingresos por alícuotas
  4.2 Ingresos por multas
  4.3 Ingresos por reservas
  4.4 Otros ingresos

5 Gastos
  5.1 Mantenimiento
  5.2 Servicios básicos
  5.3 Seguridad
  5.4 Administración
  5.5 Comisiones bancarias
```

---

### 12.2. Reglas de cuenta

```text id="qdxfl1"
- accountCode único por tenant/chart;
- accountName requerido;
- accountType requerido;
- normalBalance derivado o explícito;
- parentAccountId opcional;
- level calculado;
- isPostingAllowed=false para cuentas agrupadoras;
- isControlAccount=true para cuentas protegidas;
- archived no se usa en nuevos postings.
```

---

### 12.3. Cuentas mínimas para activación

Para activar un chart se recomienda exigir:

```text id="u56ic1"
AccountsReceivable
CashOrBank
PaymentClearing
DuesRevenue
FinesRevenue
ReservationRevenue
BankFeesExpense
EquityOrRetainedEarnings
```

---

## 13. Estrategia de periodos contables

### 13.1. Tipos MVP

```text id="qlzfhl"
monthly
annual
```

---

### 13.2. Generación recomendada

El sistema debe permitir:

```text id="vfhvop"
- crear periodo individual;
- generar periodos mensuales para un año;
- validar no solapamiento;
- validar startDate <= endDate;
- cerrar periodos en orden cronológico si la política lo exige.
```

---

### 13.3. Posting date

Regla:

```text id="wlgz7t"
postingDate determina el AccountingPeriod.
```

Si no existe periodo para `postingDate`:

```text id="e96x4i"
- no postear automáticamente;
- retornar error controlado;
- auditar journalEntry.postingRejected.
```

---

## 14. Estrategia de asientos manuales

### 14.1. Permitido

```text id="tgl212"
- crear draft;
- agregar líneas;
- editar draft;
- void draft;
- aprobar si aplica;
- postear si cuadra;
- reversar después de posted.
```

---

### 14.2. Prohibido

```text id="k8fbp1"
- editar posted;
- borrar posted;
- postear desbalanceado;
- postear en periodo closed;
- postear en cuenta inactive;
- postear en cuenta control account sin permiso;
- crear Payment;
- crear BankTransaction;
- modificar Account Statements.
```

---

### 14.3. Permiso especial

Para cuentas de control:

```text id="u7nur9"
journalEntries.postToControlAccounts
```

---

## 15. Estrategia de reversos

### 15.1. Principio

Un asiento posted se corrige con otro asiento.

No se modifica el original.

---

### 15.2. Flujo

```text id="ea8828"
1. Usuario solicita reversal con reason.
2. Sistema valida asiento original posted.
3. Sistema valida que no esté already reversed, salvo idempotencia.
4. Sistema crea JournalEntry type=reversal.
5. Sistema invierte debit/credit de cada línea.
6. Sistema usa periodo abierto/reopened según postingDate de reverso.
7. Sistema postea reversal.
8. Sistema marca original reversed.
9. Sistema audita.
```

---

### 15.3. Reversal line mapping

Original:

```text id="e76b67"
Dr Account A 100.00
Cr Account B 100.00
```

Reversal:

```text id="spisfs"
Dr Account B 100.00
Cr Account A 100.00
```

---

## 16. Estrategia de balances

### 16.1. On-demand primero

Para MVP se recomienda calcular balances desde `journal_entries` y `journal_entry_lines` posted.

---

### 16.2. Snapshots para performance

`AccountingBalanceSnapshot` se puede usar:

```text id="eh6mza"
- durante cierre de periodo;
- para reportes pesados;
- para libro mayor histórico;
- para acelerar trial balance.
```

---

### 16.3. Regla

```text id="h9d29q"
Los snapshots no son fuente primaria; la fuente primaria son JournalEntryLines posted.
```

---

## 17. Estrategia de cierre contable

### 17.1. Closing run

`AccountingClosingRun` ejecuta validaciones y opcionalmente genera snapshots.

---

### 17.2. Validaciones mínimas

```text id="s9fzt5"
- periodo existe y pertenece al tenant;
- periodo open/locked/reopened;
- no hay asientos desbalanceados;
- no hay draft críticos;
- no hay source events pendientes críticos si la política lo exige;
- trial balance cuadra;
- no hay periodos previos abiertos si la política exige cierre secuencial;
- export/evidencia opcional creada.
```

---

### 17.3. Resultado

Si todo pasa:

```text id="vjfyrg"
AccountingPeriod.status = closed
AccountingClosingRun.status = completed
```

Si hay advertencias permitidas:

```text id="l49xzt"
AccountingClosingRun.status = completedWithWarnings
AccountingPeriod.status = closed si la política lo permite
```

Si falla:

```text id="ve8sme"
AccountingClosingRun.status = failed
AccountingPeriod.status no cambia a closed
```

---

## 18. API prevista

### 18.1. Accounting policies

```text id="f2rv23"
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

```text id="qel4ia"
GET    /api/v1/tenant/accounting/chart-of-accounts
POST   /api/v1/tenant/accounting/chart-of-accounts
GET    /api/v1/tenant/accounting/chart-of-accounts/{chartId}
PATCH  /api/v1/tenant/accounting/chart-of-accounts/{chartId}
POST   /api/v1/tenant/accounting/chart-of-accounts/{chartId}/activate
POST   /api/v1/tenant/accounting/chart-of-accounts/{chartId}/archive
```

---

### 18.3. Accounting accounts

```text id="cqcyuq"
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

```text id="np41ui"
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

```text id="ushz7w"
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

```text id="k3feob"
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

### 18.7. Source event links

```text id="fbku6y"
GET    /api/v1/tenant/accounting/source-event-links
GET    /api/v1/tenant/accounting/source-event-links/{sourceEventLinkId}
```

---

### 18.8. Closing runs

```text id="tsn5g4"
GET    /api/v1/tenant/accounting/closing-runs
POST   /api/v1/tenant/accounting/periods/{periodId}/closing-runs
GET    /api/v1/tenant/accounting/closing-runs/{closingRunId}
POST   /api/v1/tenant/accounting/closing-runs/{closingRunId}/execute
POST   /api/v1/tenant/accounting/closing-runs/{closingRunId}/cancel
POST   /api/v1/tenant/accounting/closing-runs/{closingRunId}/archive
```

---

### 18.9. Reports

```text id="hvnyhu"
GET    /api/v1/tenant/accounting/reports/general-journal
GET    /api/v1/tenant/accounting/reports/general-ledger
GET    /api/v1/tenant/accounting/reports/trial-balance
GET    /api/v1/tenant/accounting/reports/income-expense
GET    /api/v1/tenant/accounting/reports/balance-sheet
GET    /api/v1/tenant/accounting/reports/export
```

---

### 18.10. Endpoints prohibidos

```text id="a8x7cm"
GET  /api/v1/public/accounting
GET  /api/v1/public/accounting/accounts
GET  /api/v1/public/accounting/journal-entries
GET  /api/v1/public/accounting/reports
GET  /api/v1/public/tenants/{slug}/accounting

GET  /api/v1/me/accounting
GET  /api/v1/me/accounting/accounts
GET  /api/v1/me/accounting/journal-entries
GET  /api/v1/me/accounting/reports
```

---

## 19. DTOs previstos

### 19.1. Accounting policies

```text id="dntiqr"
CreateAccountingPolicyDto
UpdateAccountingPolicyDto
ActivateAccountingPolicyDto
DisableAccountingPolicyDto
ArchiveAccountingPolicyDto
AccountingPolicyDto
AccountingPolicyListItemDto
AccountingPolicyFilterDto
```

---

### 19.2. Chart of accounts

```text id="a3x75g"
CreateChartOfAccountsDto
UpdateChartOfAccountsDto
ActivateChartOfAccountsDto
ArchiveChartOfAccountsDto
ChartOfAccountsDto
ChartOfAccountsListItemDto
ChartOfAccountsFilterDto
```

---

### 19.3. Accounting accounts

```text id="whsbzd"
CreateAccountingAccountDto
UpdateAccountingAccountDto
ActivateAccountingAccountDto
DisableAccountingAccountDto
ArchiveAccountingAccountDto
AccountingAccountDto
AccountingAccountListItemDto
AccountingAccountFilterDto
```

---

### 19.4. Accounting periods

```text id="r6v9tq"
CreateAccountingPeriodDto
GenerateAccountingPeriodsDto
UpdateAccountingPeriodDto
LockAccountingPeriodDto
CloseAccountingPeriodDto
ReopenAccountingPeriodDto
ArchiveAccountingPeriodDto
AccountingPeriodDto
AccountingPeriodListItemDto
AccountingPeriodFilterDto
```

---

### 19.5. Mapping rules

```text id="e2cgyv"
CreateAccountingMappingRuleDto
UpdateAccountingMappingRuleDto
ActivateAccountingMappingRuleDto
DisableAccountingMappingRuleDto
ArchiveAccountingMappingRuleDto
AccountingMappingRuleDto
AccountingMappingRuleListItemDto
AccountingMappingRuleFilterDto
```

---

### 19.6. Journal entries

```text id="d4wo99"
CreateJournalEntryDto
UpdateDraftJournalEntryDto
CreateJournalEntryLineDto
UpdateJournalEntryLineDto
ApproveJournalEntryDto
PostJournalEntryDto
ReverseJournalEntryDto
VoidJournalEntryDto
ArchiveJournalEntryDto
JournalEntryDto
JournalEntryLineDto
JournalEntryListItemDto
JournalEntryFilterDto
```

---

### 19.7. Source event links

```text id="p670vn"
AccountingSourceEventLinkDto
AccountingSourceEventLinkListItemDto
AccountingSourceEventLinkFilterDto
```

---

### 19.8. Closing runs

```text id="hewi52"
CreateAccountingClosingRunDto
ExecuteAccountingClosingRunDto
CancelAccountingClosingRunDto
ArchiveAccountingClosingRunDto
AccountingClosingRunDto
AccountingClosingRunListItemDto
AccountingClosingRunFilterDto
```

---

### 19.9. Reports

```text id="cj6wru"
GeneralJournalReportDto
GeneralLedgerReportDto
TrialBalanceReportDto
IncomeExpenseReportDto
BalanceSheetReportDto
AccountingReportExportDto
```

---

## 20. Campos prohibidos en requests externos

Los DTOs deben rechazar:

```text id="jboefv"
tenantId
createdBy
updatedBy
postedBy
reversedBy
closedBy
archivedBy
status directo salvo endpoint de transición
totalDebit calculado por cliente
totalCredit calculado por cliente
journalNumber manual si política server-side lo genera
idempotencyKey manual en eventos automáticos
source links arbitrarios sin permiso interno
postedAt
reversedAt
closedAt
storageKey
signedUrl
raw SQL
stack trace
payment creation fields
bank reconciliation confirmation fields
account statement mutation fields
external AI flags
```

---

## 21. Permisos

### 21.1. Accounting policies

```text id="lf9hlb"
accountingPolicies.create
accountingPolicies.read
accountingPolicies.update
accountingPolicies.activate
accountingPolicies.disable
accountingPolicies.archive
```

---

### 21.2. Chart of accounts

```text id="guaf5v"
chartOfAccounts.create
chartOfAccounts.read
chartOfAccounts.update
chartOfAccounts.activate
chartOfAccounts.archive
```

---

### 21.3. Accounting accounts

```text id="rkcdda"
accountingAccounts.create
accountingAccounts.read
accountingAccounts.update
accountingAccounts.activate
accountingAccounts.disable
accountingAccounts.archive
accountingAccounts.manageControlAccounts
```

---

### 21.4. Accounting periods

```text id="uiz62c"
accountingPeriods.create
accountingPeriods.read
accountingPeriods.update
accountingPeriods.lock
accountingPeriods.close
accountingPeriods.reopen
accountingPeriods.archive
```

---

### 21.5. Mapping rules

```text id="glhtue"
accountingMappingRules.create
accountingMappingRules.read
accountingMappingRules.update
accountingMappingRules.activate
accountingMappingRules.disable
accountingMappingRules.archive
```

---

### 21.6. Journal entries

```text id="bgtjqi"
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

### 21.7. Reports

```text id="ysv3eq"
accountingReports.read
accountingReports.export
accountingReports.trialBalance
accountingReports.generalLedger
accountingReports.generalJournal
accountingReports.incomeExpense
accountingReports.balanceSheet
```

---

### 21.8. Closing runs

```text id="hwbgic"
accountingClosingRuns.create
accountingClosingRuns.read
accountingClosingRuns.execute
accountingClosingRuns.cancel
accountingClosingRuns.archive
```

---

### 21.9. Audit

```text id="w2q3b1"
accounting.audit.read
```

---

## 22. Guards y policies

### 22.1. Guards

```text id="sfn3hk"
AccountingPermissionGuard
TenantAccountingGuard
AccountingPolicyGuard
ChartOfAccountsTenantGuard
AccountingAccountTenantGuard
AccountingPeriodTenantGuard
AccountingMappingRuleTenantGuard
JournalEntryTenantGuard
AccountingClosingRunTenantGuard
AccountingReportGuard
```

---

### 22.2. Policies

```text id="l41p04"
JournalEntryBalancePolicy
JournalEntryImmutabilityPolicy
JournalEntryPostingPolicy
JournalEntryReversalPolicy
JournalEntryApprovalPolicy
ControlAccountPostingPolicy
ClosedPeriodPostingPolicy
SourceEventIdempotencyPolicy
AccountingMappingRuleActivationPolicy
AccountingAccountPostingPolicy
AccountingPeriodClosingPolicy
AccountingPeriodReopenPolicy
AccountingReportTenantPolicy
NoPaymentCreationFromAccountingPolicy
NoAccountStatementMutationPolicy
NoBankReconciliationConfirmationPolicy
NoPublicAccountingEndpointPolicy
NoExternalAiAccountingDataPolicy
AuditSanitizationPolicy
LogSanitizationPolicy
```

---

## 23. Seguridad técnica

Reglas obligatorias:

```text id="ckov7f"
- no aceptar tenantId desde body;
- no consultar entidades tenant-scoped solo por id;
- no permitir posting desbalanceado;
- no permitir edición de posted;
- no permitir posting en periodo closed;
- no permitir posting manual en cuenta de control sin permiso;
- no duplicar asientos por source event;
- no crear Payment;
- no crear PaymentAllocation;
- no modificar Account Statements;
- no crear ReconciliationMatch;
- no marcar conciliación bancaria final;
- no exponer storageKey;
- no exponer datos contables por API pública;
- no exponer accounting por /me en MVP;
- no permitir WordPress accounting access;
- no enviar datos contables reales a IA externa.
```

---

## 24. Auditoría

### 24.1. Eventos obligatorios

```text id="mg3uaj"
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

### 24.2. Metadata permitida

```text id="kgzjt2"
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

### 24.3. Metadata prohibida

```text id="dg9kww"
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

## 25. Observabilidad

### 25.1. Logs sugeridos

```text id="meqtyf"
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

### 25.2. Métricas sugeridas

```text id="nkxb3y"
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

### 25.3. Labels permitidos

```text id="bfhv40"
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

### 25.4. Labels prohibidos

```text id="e4xd7v"
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

## 26. OpenAPI

### 26.1. Tags sugeridos

```text id="ak4p20"
Accounting Policies
Chart of Accounts
Accounting Accounts
Accounting Periods
Accounting Mapping Rules
Journal Entries
Accounting Source Event Links
Accounting Closing Runs
Accounting Reports
```

---

### 26.2. Extensiones requeridas

Para endpoints tenant:

```yaml id="n3i9pj"
x-tenant-scope: true
x-auth-required: true
x-accounting-ledger: true
x-public-exposure: false
```

Para journal entries:

```yaml id="habdsu"
x-double-entry-required: true
x-posted-entry-immutable: true
x-source-linked: true
x-idempotent-source-event: true
```

Para period closing:

```yaml id="vwh6i7"
x-period-aware: true
x-closing-operation: true
x-audit-required: true
```

Para reportes:

```yaml id="t5x931"
x-accounting-report: true
x-derived-from-posted-ledger: true
x-export-via-secure-document-storage: true
```

Para restricciones financieras:

```yaml id="v8w8hv"
x-creates-payment: false
x-updates-account-statement: false
x-confirms-bank-reconciliation: false
x-public-endpoint: false
```

---

## 27. Implementación por fases

### 27.1. Orden recomendado

```text id="xx4han"
1. Crear estructura base del módulo.
2. Implementar enums y constantes.
3. Implementar value objects.
4. Implementar entidades de dominio.
5. Implementar state machines.
6. Crear Prisma schema y migración.
7. Implementar repositorios tenant-scoped.
8. Implementar AccountingPolicyService.
9. Implementar ChartOfAccountsService.
10. Implementar AccountingAccountService.
11. Implementar AccountingPeriodService.
12. Implementar AccountingMappingRuleService.
13. Implementar JournalEntryService.
14. Implementar JournalEntryPostingService.
15. Implementar JournalEntryReversalService.
16. Implementar SourceEventIdempotencyPolicy.
17. Implementar AccountingPostingEngineService.
18. Implementar integraciones iniciales con Charges.
19. Implementar integraciones iniciales con Payments.
20. Implementar SourceEventLink.
21. Implementar AccountingBalanceService.
22. Implementar reportes general journal/general ledger/trial balance.
23. Implementar income-expense y balance sheet básico.
24. Implementar AccountingClosingRunService.
25. Implementar exports con Secure Document Storage.
26. Implementar audit.
27. Implementar observability.
28. Implementar controllers REST.
29. Implementar OpenAPI.
30. Implementar tests.
31. Ejecutar hardening final.
```

---

### 27.2. PRs sugeridos

```text id="vpdyem"
PR-020-01 — Module skeleton, enums and constants.
PR-020-02 — Value objects, entities and state machines.
PR-020-03 — Prisma schema, migration, constraints and indexes.
PR-020-04 — Repository ports and Prisma repositories.
PR-020-05 — Accounting policies and chart of accounts.
PR-020-06 — Accounting accounts and account hierarchy.
PR-020-07 — Accounting periods.
PR-020-08 — Accounting mapping rules.
PR-020-09 — Journal entries, lines, validation and posting.
PR-020-10 — Journal entry reversals and immutability.
PR-020-11 — Source event links and idempotency.
PR-020-12 — Posting engine with Charges integration.
PR-020-13 — Posting engine with Payments integration.
PR-020-14 — Balance calculation and snapshots.
PR-020-15 — Accounting reports.
PR-020-16 — Period closing runs.
PR-020-17 — Exports via Secure Document Storage.
PR-020-18 — Audit, observability and OpenAPI.
PR-020-19 — Tests, security hardening, performance and CI gates.
```

---

## 28. Testing plan resumido

### 28.1. Unit tests

```text id="pwltmo"
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
JournalEntryImmutabilityPolicy
```

---

### 28.2. Repository tests

```text id="ab1r9o"
tenant A no ve accounting policies tenant B
tenant A no ve chart tenant B
tenant A no ve accounts tenant B
tenant A no ve periods tenant B
tenant A no ve mapping rules tenant B
tenant A no ve journal entries tenant B
tenant A no ve source links tenant B
tenant A no ve closing runs tenant B
accountCode unique por tenant/chart
source event unique por tenant/source identity
journalNumber unique por tenant
```

---

### 28.3. Integration tests

```text id="bufhie"
charge.issued -> journal entry posted
charge.adjusted -> journal entry posted
charge.reversed -> reversal accounting effect
payment.allocated -> journal entry posted
payment.reversed -> reversal entry
bankTransaction.reconciled -> accounting event cuando aplique
providerSettlement.reviewed -> accounting event cuando aplique
manual journal entry flow
period closing flow
report generation
export via Secure Document Storage
audit integration
```

---

### 28.4. API tests

```text id="gbufpp"
accounting policies CRUD/state transitions
chart of accounts CRUD/state transitions
accounting accounts CRUD/state transitions
accounting periods CRUD/state transitions
mapping rules CRUD/state transitions
journal entries draft/post/reverse/void/archive
source event links query
closing runs create/execute/cancel/archive
general journal report
general ledger report
trial balance report
income expense report
balance sheet report
export report
```

---

### 28.5. Security tests

```text id="zc2u4w"
no tenantId body
no cross-tenant accounting policy
no cross-tenant chart
no cross-tenant accounts
no cross-tenant periods
no cross-tenant mapping rules
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

## 29. Performance objetivo

### 29.1. Objetivos MVP

```text id="h7cs5n"
p95 < 800 ms para listar cuentas paginadas.
p95 < 1000 ms para listar asientos paginados.
p95 < 1500 ms para consultar libro mayor de una cuenta en periodo mensual típico.
p95 < 2000 ms para balance de comprobación mensual típico.
p95 < 3000 ms para cierre de periodo pequeño/mediano, excluyendo jobs pesados.
```

---

### 29.2. Reglas técnicas

```text id="ag49ps"
- paginación obligatoria;
- pageSize máximo 100;
- índices por tenant_id;
- índices por accounting_period_id;
- índices por accounting_account_id;
- índices por journal_entry_id;
- índices por status;
- índices por sourceModule/sourceEventType;
- no N+1 evidente;
- reportes pesados preparados para jobs;
- snapshots de balance disponibles para optimización.
```

---

## 30. Feature flags

```text id="otnbz0"
accountingLedger.enabled
accountingLedger.manualEntries.enabled
accountingLedger.automaticPosting.enabled
accountingLedger.chargePosting.enabled
accountingLedger.paymentPosting.enabled
accountingLedger.bankReconciliationPosting.enabled
accountingLedger.providerSettlementPosting.enabled
accountingLedger.openBankingDirectPosting.enabled
accountingLedger.periodClosing.enabled
accountingLedger.balanceSnapshots.enabled
accountingLedger.reports.enabled
accountingLedger.exports.enabled
accountingLedger.externalAi.enabled
```

Defaults MVP:

```text id="a4a50y"
accountingLedger.enabled = true
accountingLedger.manualEntries.enabled = true
accountingLedger.automaticPosting.enabled = true
accountingLedger.chargePosting.enabled = true
accountingLedger.paymentPosting.enabled = true
accountingLedger.bankReconciliationPosting.enabled = false
accountingLedger.providerSettlementPosting.enabled = false
accountingLedger.openBankingDirectPosting.enabled = false
accountingLedger.periodClosing.enabled = true
accountingLedger.balanceSnapshots.enabled = true
accountingLedger.reports.enabled = true
accountingLedger.exports.enabled = true
accountingLedger.externalAi.enabled = false
```

---

## 31. Variables de configuración sugeridas

```text id="lr68b7"
ACCOUNTING_LEDGER_ENABLED=true
ACCOUNTING_DEFAULT_CURRENCY=USD
ACCOUNTING_DEFAULT_METHOD=accrual
ACCOUNTING_ALLOW_MANUAL_ENTRIES=true
ACCOUNTING_REQUIRE_APPROVAL_FOR_MANUAL_ENTRIES=false
ACCOUNTING_ALLOW_POSTING_TO_CONTROL_ACCOUNTS=false
ACCOUNTING_ALLOW_POSTING_TO_CLOSED_PERIOD=false
ACCOUNTING_ALLOW_PERIOD_REOPEN=true
ACCOUNTING_MAX_REPORT_PAGE_SIZE=100
ACCOUNTING_BALANCE_SNAPSHOTS_ENABLED=true
ACCOUNTING_REPORT_EXPORT_ENABLED=true
ACCOUNTING_AUTOMATIC_CHARGE_POSTING_ENABLED=true
ACCOUNTING_AUTOMATIC_PAYMENT_POSTING_ENABLED=true
ACCOUNTING_BANK_RECONCILIATION_POSTING_ENABLED=false
ACCOUNTING_PROVIDER_SETTLEMENT_POSTING_ENABLED=false
ACCOUNTING_OPEN_BANKING_DIRECT_POSTING_ENABLED=false
ACCOUNTING_EXTERNAL_AI_ENABLED=false
```

---

## 32. Errores esperados

Catálogo inicial:

```text id="qyjist"
ACCOUNTING_POLICY_NOT_FOUND
ACCOUNTING_POLICY_INVALID_STATUS
ACCOUNTING_POLICY_ALREADY_ACTIVE

CHART_OF_ACCOUNTS_NOT_FOUND
CHART_OF_ACCOUNTS_INVALID_STATUS
CHART_OF_ACCOUNTS_ALREADY_ACTIVE
CHART_OF_ACCOUNTS_MISSING_REQUIRED_ACCOUNTS

ACCOUNTING_ACCOUNT_NOT_FOUND
ACCOUNTING_ACCOUNT_INVALID_STATUS
ACCOUNTING_ACCOUNT_CODE_DUPLICATE
ACCOUNTING_ACCOUNT_PARENT_INVALID
ACCOUNTING_ACCOUNT_POSTING_NOT_ALLOWED
ACCOUNTING_CONTROL_ACCOUNT_REQUIRES_PERMISSION

ACCOUNTING_PERIOD_NOT_FOUND
ACCOUNTING_PERIOD_INVALID_STATUS
ACCOUNTING_PERIOD_OVERLAPS
ACCOUNTING_PERIOD_CLOSED
ACCOUNTING_PERIOD_LOCKED
ACCOUNTING_PERIOD_REOPEN_FORBIDDEN

ACCOUNTING_MAPPING_RULE_NOT_FOUND
ACCOUNTING_MAPPING_RULE_INVALID_STATUS
ACCOUNTING_MAPPING_RULE_SOURCE_DUPLICATE
ACCOUNTING_MAPPING_RULE_ACCOUNT_INVALID
ACCOUNTING_MAPPING_RULE_NOT_ACTIVE

JOURNAL_ENTRY_NOT_FOUND
JOURNAL_ENTRY_INVALID_STATUS
JOURNAL_ENTRY_UNBALANCED
JOURNAL_ENTRY_NO_LINES
JOURNAL_ENTRY_POSTED_IMMUTABLE
JOURNAL_ENTRY_ALREADY_POSTED
JOURNAL_ENTRY_ALREADY_REVERSED
JOURNAL_ENTRY_REVERSAL_FORBIDDEN
JOURNAL_ENTRY_DUPLICATE_SOURCE_EVENT
JOURNAL_ENTRY_POSTING_REJECTED

JOURNAL_ENTRY_LINE_INVALID
JOURNAL_ENTRY_LINE_BOTH_DEBIT_AND_CREDIT
JOURNAL_ENTRY_LINE_ZERO_AMOUNT
JOURNAL_ENTRY_LINE_ACCOUNT_INVALID

ACCOUNTING_SOURCE_EVENT_LINK_DUPLICATE
ACCOUNTING_SOURCE_EVENT_LINK_NOT_FOUND

ACCOUNTING_CLOSING_RUN_NOT_FOUND
ACCOUNTING_CLOSING_RUN_INVALID_STATUS
ACCOUNTING_CLOSING_RUN_FAILED
ACCOUNTING_CLOSING_RUN_UNBALANCED_TRIAL_BALANCE
ACCOUNTING_CLOSING_RUN_DRAFT_ENTRIES_FOUND

ACCOUNTING_REPORT_FORBIDDEN
ACCOUNTING_REPORT_EXPORT_FAILED

ACCOUNTING_PUBLIC_ENDPOINT_FORBIDDEN
ACCOUNTING_EXTERNAL_AI_FORBIDDEN
ACCOUNTING_PAYMENT_CREATION_FORBIDDEN
ACCOUNTING_ACCOUNT_STATEMENT_MUTATION_FORBIDDEN
ACCOUNTING_BANK_RECONCILIATION_CONFIRMATION_FORBIDDEN

VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
CONFLICT
RATE_LIMITED
INTERNAL_ERROR
```

---

## 33. Seeds y datos demo

Crear seeds ficticios para:

```text id="ty5g8n"
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
mappingRulePaymentAllocatedA
mappingRulePaymentReversedA
mappingRuleInactiveA
mappingRuleTenantB

journalEntryDraftManualA
journalEntryPostedAutomaticA
journalEntryPostedManualA
journalEntryReversedA
journalEntryVoidedA
journalEntryTenantB

sourceEventLinkChargeIssuedA
sourceEventLinkPaymentAllocatedA
sourceEventLinkTenantB

balanceSnapshotPeriodA
closingRunCompletedA
closingRunFailedA
closingRunTenantB
```

Datos prohibidos en seeds:

```text id="fz8vkv"
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
```

---

## 34. Riesgos técnicos

| Riesgo                              | Impacto | Mitigación                               |
| ----------------------------------- | ------: | ---------------------------------------- |
| Asiento desbalanceado               | Crítico | JournalEntryBalancePolicy                |
| Asiento duplicado por evento fuente |    Alto | SourceEventIdempotencyPolicy             |
| Cross-tenant ledger                 | Crítico | TenantGuard + tenant-scoped repositories |
| Edición de asiento posted           | Crítico | JournalEntryImmutabilityPolicy           |
| Posting en periodo cerrado          |    Alto | ClosedPeriodPostingPolicy                |
| Cuenta de control mal usada         |    Alto | ControlAccountPostingPolicy              |
| Mapping rule incorrecta             |    Alto | revisión, tests y auditoría              |
| Reporte inconsistente               |    Alto | reportes desde posted entries            |
| Ledger crea Payment                 | Crítico | prohibición + tests                      |
| Ledger modifica Account Statements  | Crítico | integración read-only                    |
| Ledger confirma conciliación        | Crítico | Bank Reconciliation authority            |
| Export contable no autorizado       |    Alto | permisos + SDS                           |
| Datos reales en IA externa          | Crítico | feature flag false + policy              |
| Performance de reportes             |   Medio | índices + snapshots                      |

---

## 35. Criterios de aceptación técnica

La implementación debe cumplir:

```text id="hazfoh"
- AccountingPolicy funciona por tenant.
- ChartOfAccounts funciona por tenant.
- AccountingAccount jerárquico funciona.
- AccountingPeriod funciona.
- AccountingMappingRule funciona.
- JournalEntry manual funciona.
- JournalEntry automático funciona.
- JournalEntryLine valida debit/credit.
- Posting valida totalDebit=totalCredit.
- Posted entries son inmutables.
- Reversal crea asiento inverso.
- SourceEventLink evita duplicados.
- Period closed bloquea posting.
- Control accounts bloquean posting manual ordinario.
- Libro diario funciona.
- Libro mayor funciona.
- Trial balance cuadra.
- Income/Expense report funciona.
- Balance Sheet básico funciona.
- ClosingRun funciona.
- Export usa Secure Document Storage.
- Audit se emite.
- Logs son seguros.
- Métricas son seguras.
- OpenAPI no expone endpoints públicos.
- No existe /me accounting en MVP.
- WordPress no accede a accounting.
- Ledger no crea Payments.
- Ledger no modifica Account Statements.
- Ledger no confirma Bank Reconciliation.
- IA externa está deshabilitada con datos reales.
- CI pasa.
```

---

## 36. Definition of Done

El módulo se considera listo cuando:

```text id="cm0u9m"
1. spec.md está aprobado.
2. plan.md está aprobado.
3. data-model.md está creado.
4. api-contract.md está creado.
5. test-plan.md está creado.
6. tasks.md está creado.
7. security-notes.md está creado.
8. Prisma schema está implementado.
9. Migración está ejecutada en test.
10. Repositorios tenant-scoped funcionan.
11. AccountingPolicyService funciona.
12. ChartOfAccountsService funciona.
13. AccountingAccountService funciona.
14. AccountingPeriodService funciona.
15. AccountingMappingRuleService funciona.
16. JournalEntryService funciona.
17. JournalEntryPostingService funciona.
18. JournalEntryReversalService funciona.
19. AccountingPostingEngineService funciona.
20. Integración con Charges funciona.
21. Integración con Payments funciona.
22. SourceEventLink funciona.
23. Balance calculation funciona.
24. Reports funcionan.
25. ClosingRun funciona.
26. Export vía SDS funciona.
27. Audit funciona.
28. Observability funciona.
29. Controllers funcionan.
30. OpenAPI está actualizado.
31. Tests unitarios pasan.
32. Tests de repositorio pasan.
33. Tests de integración pasan.
34. Tests API pasan.
35. Tests de autorización pasan.
36. Tests multitenant pasan.
37. Tests de seguridad pasan.
38. Tests de integridad contable pasan.
39. Tests de reportes pasan.
40. Smoke tests pasan.
41. Build pasa.
42. CI pasa.
```

---

## 37. No aceptación

No se acepta implementación si:

```text id="rr1vdn"
- permite accounting policy cross-tenant;
- permite chart of accounts cross-tenant;
- permite accounting accounts cross-tenant;
- permite periods cross-tenant;
- permite mapping rules cross-tenant;
- permite journal entries cross-tenant;
- permite source event links cross-tenant;
- permite reports cross-tenant;
- acepta tenantId desde body;
- busca entidades tenant-scoped solo por id;
- permite postear asiento sin líneas;
- permite postear asiento desbalanceado;
- permite línea con debit y credit simultáneos;
- permite editar asiento posted;
- permite borrar asiento posted;
- permite postear en periodo closed;
- permite postear manualmente en cuenta control sin permiso;
- duplica asientos por mismo source event;
- reportes derivan de fuentes operativas en vez de posted ledger;
- ledger crea Payment;
- ledger crea PaymentAllocation;
- ledger modifica Account Statements;
- ledger crea ReconciliationMatch;
- ledger marca conciliación bancaria final;
- Open Banking genera asientos directos en MVP;
- crea endpoints públicos contables;
- documenta endpoints públicos contables en OpenAPI;
- crea /me accounting en MVP;
- permite acceso contable desde WordPress;
- envía datos contables reales a IA externa;
- omite auditoría crítica;
- usa float/double para dinero.
```

---

## 38. Resultado esperado

Al finalizar la implementación de `020-accounting-ledger`, RESIDENT Core tendrá una base contable formal para traducir eventos financieros confiables en registros contables auditables.

Resultado esperado:

```text id="dzf1zu"
- AccountingPolicy por tenant;
- ChartOfAccounts por tenant;
- AccountingAccounts jerárquicas;
- AccountingPeriods;
- AccountingMappingRules;
- JournalEntries;
- JournalEntryLines;
- double-entry validation;
- posted entry immutability;
- reversal entries;
- source event idempotency;
- AccountingSourceEventLinks;
- automatic posting from Charges;
- automatic posting from Payments;
- manual entries authorized;
- control account protection;
- closed period protection;
- balance calculation;
- balance snapshots;
- general journal;
- general ledger;
- trial balance;
- income and expense report;
- basic balance sheet;
- period closing;
- exports via Secure Document Storage;
- audit trail;
- safe logs;
- safe metrics;
- safe OpenAPI;
- no Payment creation;
- no Account Statements mutation;
- no Bank Reconciliation final confirmation;
- no direct Open Banking posting;
- no public endpoints;
- no /me accounting in MVP;
- no WordPress accounting access;
- no external AI with real accounting data.
```

El módulo quedará preparado para futuras specs de:

```text id="crid8n"
financial-closing
supplier-payments
accounts-payable
tax-compliance
electronic-invoicing
budgeting-and-forecasting
cost-centers
fixed-assets
multi-currency
treasury-management
accounting-system-integration
```
