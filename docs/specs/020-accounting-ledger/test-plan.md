# Test Plan — Spec 020 Accounting Ledger

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                                                                                                       |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                                                                                                               |
| Spec ID         | 020                                                                                                                                                                                                                                                         |
| Módulo          | Accounting Ledger                                                                                                                                                                                                                                           |
| Documento       | Test Plan                                                                                                                                                                                                                                                   |
| Ruta            | `docs/specs/020-accounting-ledger/test-plan.md`                                                                                                                                                                                                             |
| Versión         | 0.1                                                                                                                                                                                                                                                         |
| Estado          | Borrador inicial                                                                                                                                                                                                                                            |
| Fecha           | 2026-07-23                                                                                                                                                                                                                                                  |
| Documento base  | `docs/specs/020-accounting-ledger/spec.md`                                                                                                                                                                                                                  |
| Plan técnico    | `docs/specs/020-accounting-ledger/plan.md`                                                                                                                                                                                                                  |
| Modelo de datos | `docs/specs/020-accounting-ledger/data-model.md`                                                                                                                                                                                                            |
| Contrato API    | `docs/specs/020-accounting-ledger/api-contract.md`                                                                                                                                                                                                          |
| Depende de      | `001-tenants`, `002-users-roles`, `004-dues-fees`, `005-payments`, `006-account-statements`, `007-audit`, `008-basic-reports`, `016-secure-document-storage`, `017-bank-reconciliation`, `018-payment-provider-integration`, `019-open-banking-integration` |
| Naturaleza      | Tenant-scoped / Double-entry / Source-linked / Posting-driven / Period-aware / Immutable-after-posting / Audit-heavy / Report-ready / Non-public                                                                                                            |

---

## 2. Propósito

Este documento define el plan de pruebas del módulo `020-accounting-ledger`.

El objetivo es validar que Accounting Ledger funcione como una capa contable interna segura, consistente y extensible, basada en partida doble, trazabilidad a eventos fuente, inmutabilidad de asientos contabilizados, periodos contables, reversos auditados, reportes contables y cierre básico.

Regla central de pruebas:

```text id="afqz4p"
Accounting Ledger debe probarse como un módulo financiero-contable crítico: ningún test debe permitir asientos cross-tenant, asientos posted desbalanceados, edición de asientos posted, duplicación por source event, posting en periodo cerrado, uso de float/double para dinero, reportes cross-tenant, creación de Payment, mutación de Account Statements, confirmación de Bank Reconciliation, contabilización directa desde Open Banking, endpoints públicos, endpoints /me o acceso contable desde WordPress.
```

---

## 3. Objetivos del plan de pruebas

El plan debe validar:

```text id="p8g7qx"
- AccountingPolicy tenant-scoped;
- ChartOfAccounts tenant-scoped;
- AccountingAccounts jerárquicas;
- control accounts protegidas;
- AccountingPeriods;
- AccountingMappingRules;
- JournalEntries manuales;
- JournalEntries automáticos;
- JournalEntryLines debit/credit;
- totalDebit = totalCredit;
- Decimal money;
- posting seguro;
- posted immutability;
- reversal accounting;
- source event links;
- source event idempotency;
- automatic posting desde Charges;
- automatic posting desde Payments;
- no automatic posting directo desde Open Banking;
- no Payment auto-creation;
- no PaymentAllocation auto-creation;
- no Account Statements mutation;
- no Bank Reconciliation final confirmation;
- General Journal;
- General Ledger;
- Trial Balance;
- Income and Expense report;
- Basic Balance Sheet;
- Period closing;
- Balance snapshots;
- export vía Secure Document Storage;
- audit completo;
- observabilidad segura;
- OpenAPI seguro;
- autorización por permisos;
- multitenancy;
- ausencia de endpoints públicos;
- ausencia de endpoints /me;
- ausencia de acceso desde WordPress;
- ausencia de IA externa con datos contables reales.
```

---

## 4. Alcance de pruebas

### 4.1. Incluido

```text id="fdciyo"
1. Unit tests.
2. Value object tests.
3. Entity tests.
4. State machine tests.
5. Domain policy tests.
6. Repository tests.
7. Service tests.
8. Posting engine tests.
9. Source event idempotency tests.
10. Journal entry balance tests.
11. Journal entry immutability tests.
12. Reversal tests.
13. Period tests.
14. Control account tests.
15. Mapping rule tests.
16. Integration tests con Charges.
17. Integration tests con Payments.
18. Regression tests con Account Statements.
19. Regression tests con Bank Reconciliation.
20. Regression tests con Payment Provider Integration.
21. Regression tests con Open Banking Integration.
22. Report tests.
23. Export tests.
24. API tests.
25. Authorization tests.
26. Multitenancy tests.
27. Accounting integrity tests.
28. Security tests.
29. Audit tests.
30. Observability tests.
31. OpenAPI contract tests.
32. Performance tests.
33. Concurrency tests.
34. Smoke tests.
35. CI/CD gates.
```

---

### 4.2. Fuera de alcance del MVP

No se prueban como funcionalidad activa:

```text id="iekpgh"
- contabilidad tributaria completa;
- integración SRI;
- facturación electrónica;
- retenciones;
- anexos tributarios;
- nómina;
- depreciaciones automáticas;
- activos fijos;
- supplier payments completo;
- accounts payable completo;
- presupuestos avanzados;
- centros de costo avanzados;
- multi-moneda;
- consolidación multi-tenant;
- estados financieros legalmente certificados;
- firma electrónica de libros;
- auditoría externa formal;
- integración con software contable externo;
- automatización contable con IA;
- contabilización automática irreversible desde movimientos bancarios no conciliados;
- payment initiation;
- cash management avanzado;
- ledger tributario formal.
```

Aunque no se implementen, se deben probar las prohibiciones relevantes.

---

## 5. Estrategia general de pruebas

### 5.1. Pirámide de pruebas

```text id="mxki0s"
Value objects / domain policies / entities
  -> Repository tests
      -> Service tests
          -> Posting engine tests
              -> API tests
                  -> Integration and regression tests
                      -> Security / accounting integrity / smoke tests
```

---

### 5.2. Principios

```text id="t37gc9"
- probar reglas contables antes que controladores;
- probar partida doble como regla innegociable;
- probar inmutabilidad de posted entries;
- probar idempotencia por source event;
- probar tenant isolation en cada capa;
- probar permisos positivos y negativos;
- probar que reportes deriven de JournalEntries posted;
- probar que accounting no muta módulos operativos;
- probar que Open Banking no contabiliza directamente en MVP;
- probar que logs, audit y métricas no filtren información sensible;
- probar que no existan rutas públicas ni /me.
```

---

## 6. Datos base de prueba

### 6.1. Tenants

```text id="lta4gv"
tenantA: active
tenantB: active
tenantSuspended: suspended
tenantArchived: archived
```

---

### 6.2. Usuarios

```text id="a6kiz2"
platformAdmin
tenantAdminA
financialManagerA
accountantA
boardMemberA
residentA
propertyOwnerA
unauthorizedUserA
financialManagerB
accountantB
disabledUserA
userWithoutMembership
```

---

### 6.3. Accounting policies

```text id="jpy1gg"
accountingPolicyDraftA
accountingPolicyActiveA
accountingPolicyInactiveA
accountingPolicyArchivedA
accountingPolicyActiveB
accountingPolicyAllowControlPostingA
accountingPolicyRequireApprovalA
```

---

### 6.4. Chart of accounts

```text id="nss0h0"
chartOfAccountsDraftA
chartOfAccountsActiveA
chartOfAccountsInactiveA
chartOfAccountsArchivedA
chartOfAccountsActiveB
chartOfAccountsMissingRequiredAccountsA
```

---

### 6.5. Accounting accounts

```text id="p0dpug"
accountAssetCashA
accountAssetBankA
accountAccountsReceivableA
accountPaymentClearingA
accountLiabilityAccountsPayableA
accountEquityRetainedEarningsA
accountIncomeDuesA
accountIncomeFinesA
accountIncomeReservationsA
accountIncomeOtherA
accountExpenseBankFeesA
accountExpenseMaintenanceA
accountExpenseAdministrationA
accountParentAssetA
accountInactiveA
accountArchivedA
accountControlA
accountNonPostingParentA
accountTenantB
```

---

### 6.6. Accounting periods

```text id="c6hwqa"
accountingPeriodOpenA
accountingPeriodLockedA
accountingPeriodClosedA
accountingPeriodReopenedA
accountingPeriodArchivedA
accountingPeriodOpenB
accountingPeriodOverlappingCandidateA
accountingPeriodPreviousOpenA
accountingPeriodNextOpenA
```

---

### 6.7. Mapping rules

```text id="v1qyko"
mappingRuleChargeIssuedA
mappingRuleChargeAdjustedA
mappingRuleChargeReversedA
mappingRulePaymentAllocatedA
mappingRulePaymentReversedA
mappingRuleBankFeeDetectedA
mappingRuleProviderSettlementReviewedA
mappingRuleInactiveA
mappingRuleArchivedA
mappingRuleInvalidAccountsA
mappingRuleTenantB
```

---

### 6.8. Journal entries

```text id="lb15ss"
journalEntryDraftManualBalancedA
journalEntryDraftManualUnbalancedA
journalEntryPendingApprovalA
journalEntryApprovedA
journalEntryPostedAutomaticChargeA
journalEntryPostedAutomaticPaymentA
journalEntryPostedManualA
journalEntryReversalA
journalEntryReversedOriginalA
journalEntryVoidedA
journalEntryArchivedA
journalEntryClosedPeriodCandidateA
journalEntryControlAccountManualA
journalEntryTenantB
```

---

### 6.9. Journal entry lines

```text id="hxq6xx"
journalEntryLineDebitA
journalEntryLineCreditA
journalEntryLineBothDebitAndCreditA
journalEntryLineZeroAmountsA
journalEntryLineNegativeAmountA
journalEntryLineInactiveAccountA
journalEntryLineCrossTenantAccountA
journalEntryLineTenantB
```

---

### 6.10. Source event links

```text id="xqirx8"
sourceEventLinkChargeIssuedA
sourceEventLinkPaymentAllocatedA
sourceEventLinkPaymentReversedA
sourceEventLinkDuplicateCandidateA
sourceEventLinkReversedA
sourceEventLinkArchivedA
sourceEventLinkTenantB
```

---

### 6.11. Closing runs

```text id="nf87gu"
closingRunDraftA
closingRunRunningA
closingRunCompletedA
closingRunCompletedWithWarningsA
closingRunFailedA
closingRunCancelledA
closingRunArchivedA
closingRunTenantB
```

---

### 6.12. Datos prohibidos en fixtures

Los fixtures no deben contener:

```text id="lpv6te"
datos financieros reales
balances reales de conjuntos
nombres reales
cédulas reales
emails reales
teléfonos reales
números bancarios reales
tokens
secrets
storageKeys reales
signedUrls reales
payloads bancarios reales
payloads de proveedor reales
datos productivos
datos tributarios reales
datos contables reales
```

---

## 7. Unit tests — Value Objects

### 7.1. `AccountingAccountCode`

Debe probar:

```text id="lu7gvs"
- acepta código válido;
- rechaza vacío;
- rechaza caracteres inseguros;
- rechaza longitud excesiva;
- normaliza espacios;
- conserva jerarquía tipo 1.1.01;
- no acepta código duplicado sin validación externa.
```

---

### 7.2. `AccountingAccountName`

Debe probar:

```text id="n708jy"
- acepta nombre válido;
- rechaza vacío;
- rechaza longitud excesiva;
- sanitiza caracteres de control;
- conserva caracteres en español;
- no contiene HTML ejecutable.
```

---

### 7.3. `AccountingPeriodCode`

Debe probar:

```text id="gawj4v"
- acepta 2026-07;
- acepta 2026;
- rechaza vacío;
- rechaza formato inseguro;
- normaliza espacios;
- mantiene unicidad delegada al repositorio.
```

---

### 7.4. `AccountingPeriodRange`

Debe probar:

```text id="ecpd3g"
- acepta startDate <= endDate;
- rechaza startDate > endDate;
- detecta fecha dentro del rango;
- detecta solapamiento;
- normaliza UTC;
- respeta timezone America/Guayaquil para input de usuario si aplica.
```

---

### 7.5. `JournalNumber`

Debe probar:

```text id="w3wpgt"
- genera formato JE-2026-07-000001;
- incrementa secuencia;
- rechaza formato inseguro;
- no acepta manual si policy no lo permite;
- mantiene unicidad por tenant.
```

---

### 7.6. `JournalEntryAmount`

Debe probar:

```text id="k6fl75"
- acepta string decimal;
- rechaza number;
- rechaza float;
- rechaza NaN;
- rechaza negativos;
- rechaza más de 2 decimales si la política lo exige;
- conserva precisión Decimal;
- 0.10 + 0.20 = 0.30 usando Decimal.
```

---

### 7.7. `DebitCreditAmount`

Debe probar:

```text id="mabq5o"
- acepta debit > 0 y credit = 0;
- acepta credit > 0 y debit = 0;
- rechaza debit > 0 y credit > 0;
- rechaza debit = 0 y credit = 0;
- rechaza negativos;
- expone montos como string decimal.
```

---

### 7.8. `NormalBalance`

Debe probar:

```text id="acyriz"
- asset default debit;
- expense default debit;
- liability default credit;
- equity default credit;
- income default credit;
- rechaza valores desconocidos.
```

---

### 7.9. `AccountingCurrency`

Debe probar:

```text id="koqxvw"
- acepta USD;
- rechaza moneda distinta en MVP;
- rechaza vacío;
- rechaza valores desconocidos;
- valida consistencia entre JournalEntry y líneas.
```

---

### 7.10. `SourceEventIdentity`

Debe probar:

```text id="tuwqxr"
- incluye tenantId;
- incluye sourceModule;
- incluye sourceResourceType;
- incluye sourceResourceId;
- incluye sourceEventType;
- rechaza campos vacíos;
- produce identidad estable;
- no acepta tenantId desde cliente.
```

---

### 7.11. `AccountingIdempotencyKey`

Debe probar:

```text id="k14dlb"
- genera hash determinístico;
- mismo source event produce misma key;
- tenant distinto produce key distinta;
- sourceEventType distinto produce key distinta;
- no acepta key arbitraria del cliente para eventos automáticos;
- no se expone por DTO estándar.
```

---

### 7.12. `AccountingDescription`

Debe probar:

```text id="cdqbbx"
- acepta descripción válida;
- rechaza vacío cuando requerido;
- sanitiza HTML/script;
- limita longitud;
- conserva caracteres en español.
```

---

## 8. Unit tests — Entidades

### 8.1. `AccountingPolicy`

Debe probar:

```text id="l5q2n4"
- crear draft;
- activar draft;
- pasar active -> inactive;
- pasar inactive -> active;
- archivar draft;
- archivar inactive;
- archivar active bajo política;
- impedir archived -> active;
- impedir baseCurrency distinta de USD en MVP;
- impedir allowPostingToClosedPeriod=true en MVP;
- emitir eventos de dominio.
```

---

### 8.2. `ChartOfAccounts`

Debe probar:

```text id="felwn5"
- crear draft;
- activar con cuentas mínimas;
- rechazar activación sin cuentas mínimas;
- pasar active -> inactive;
- pasar inactive -> active;
- archivar;
- impedir archived -> active;
- manejar isDefault;
- emitir eventos de dominio.
```

---

### 8.3. `AccountingAccount`

Debe probar:

```text id="e8sbpm"
- crear draft;
- activar cuenta válida;
- inactivar cuenta active;
- reactivar inactive;
- archivar;
- impedir archived -> active;
- calcular level;
- impedir parent cycle;
- impedir parent cross-chart;
- impedir posting si inactive;
- impedir posting si isPostingAllowed=false;
- marcar control account;
- emitir eventos.
```

---

### 8.4. `AccountingPeriod`

Debe probar:

```text id="cqvec6"
- crear open;
- lock open;
- unlock locked;
- close open;
- close locked;
- reopen closed;
- close reopened;
- archive open;
- archive closed;
- rechazar rango inválido;
- rechazar posting si closed;
- rechazar posting si locked;
- permitir posting si open/reopened;
- emitir eventos.
```

---

### 8.5. `AccountingMappingRule`

Debe probar:

```text id="tep7fn"
- crear draft;
- activar con cuentas válidas;
- rechazar cuentas inactive;
- rechazar cuentas archived;
- rechazar debitAccountId = creditAccountId salvo policy explícita;
- deshabilitar;
- reactivar;
- archivar;
- impedir archived -> active;
- validar vigencia effectiveFrom/effectiveTo;
- emitir eventos.
```

---

### 8.6. `JournalEntry`

Debe probar:

```text id="krfum5"
- crear draft manual;
- crear automatic con source;
- rechazar automatic sin source;
- agregar líneas;
- recalcular totalDebit;
- recalcular totalCredit;
- detectar balanced;
- detectar unbalanced;
- aprobar;
- postear;
- impedir posted sin líneas;
- impedir posted con una sola línea;
- impedir posted desbalanceado;
- impedir editar posted;
- reversar posted;
- impedir reversar draft;
- void draft;
- impedir void posted;
- archivar histórico;
- emitir eventos.
```

---

### 8.7. `JournalEntryLine`

Debe probar:

```text id="y4bz9g"
- crear línea débito válida;
- crear línea crédito válida;
- rechazar debit y credit simultáneos;
- rechazar ambos montos cero;
- rechazar negativos;
- validar currency;
- validar lineNumber;
- impedir edición si entry posted.
```

---

### 8.8. `AccountingSourceEventLink`

Debe probar:

```text id="az0pco"
- crear active link;
- calcular idempotencyKey;
- rechazar duplicado active;
- marcar reversed;
- marcar superseded;
- archivar;
- preservar trazabilidad;
- no exponer raw source payload.
```

---

### 8.9. `AccountingBalanceSnapshot`

Debe probar:

```text id="l7rlch"
- crear snapshot válido;
- rechazar montos negativos;
- asociar periodo;
- asociar cuenta;
- asociar closingRun;
- no considerarlo fuente primaria;
- regenerar bajo policy si aplica.
```

---

### 8.10. `AccountingClosingRun`

Debe probar:

```text id="x8sjef"
- crear draft;
- pasar draft -> running;
- running -> completed;
- running -> completedWithWarnings;
- running -> failed;
- draft -> cancelled;
- running -> cancelled si policy permite;
- completed -> archived;
- failed -> archived;
- completed requiere completedAt;
- failed requiere failedAt y errorCode;
- conteos no negativos.
```

---

## 9. Unit tests — Policies contables

### 9.1. `JournalEntryBalancePolicy`

Debe probar:

```text id="a8qphm"
- totalDebit = totalCredit permite posting;
- totalDebit != totalCredit rechaza posting;
- diferencias por rounding no se aceptan salvo policy explícita;
- montos se calculan desde líneas, no desde cliente;
- múltiples líneas debit/credit cuadran correctamente.
```

---

### 9.2. `JournalEntryImmutabilityPolicy`

Debe probar:

```text id="m8r4bm"
- draft editable;
- pendingApproval editable bajo permiso;
- approved editable bajo policy si aplica;
- posted no editable;
- reversed no editable;
- voided no editable;
- archived no editable.
```

---

### 9.3. `ClosedPeriodPostingPolicy`

Debe probar:

```text id="yujkl5"
- open permite posting;
- reopened permite posting controlado;
- locked rechaza posting ordinario;
- closed rechaza posting;
- archived rechaza posting;
- allowPostingToClosedPeriod=false se respeta.
```

---

### 9.4. `ControlAccountPostingPolicy`

Debe probar:

```text id="yl0hfp"
- automatic puede usar control account si mapping rule válida;
- manual sin permiso no puede usar control account;
- manual con journalEntries.postToControlAccounts puede usarla si policy permite;
- uso manual de control account se audita reforzado.
```

---

### 9.5. `SourceEventIdempotencyPolicy`

Debe probar:

```text id="o4vbwv"
- mismo source event no genera dos JournalEntries;
- retry retorna resultado idempotente;
- tenant distinto no colisiona;
- sourceEventType distinto no colisiona;
- reversal no se bloquea por source event original.
```

---

### 9.6. `NoPaymentCreationFromAccountingPolicy`

Debe probar:

```text id="i7ygpo"
- JournalEntry posting no crea Payment;
- reversal no crea Payment;
- closing run no crea Payment;
- reports no crean Payment;
- automatic posting desde Payment source no crea nuevo Payment.
```

---

### 9.7. `NoAccountStatementMutationPolicy`

Debe probar:

```text id="izje4h"
- JournalEntry posting no crea statement lines;
- reversal no modifica Account Statements;
- closing run no modifica Account Statements;
- reports no modifican balances operativos.
```

---

### 9.8. `NoBankReconciliationConfirmationPolicy`

Debe probar:

```text id="ff8mv8"
- Accounting no crea ReconciliationMatch;
- Accounting no marca BankTransaction matched;
- Accounting no cierra ReconciliationSession;
- Accounting no marca Payment reconciled.
```

---

## 10. Repository tests

### 10.1. Reglas generales

Cada repositorio tenant-scoped debe probar:

```text id="zazyps"
- create;
- findByIdAndTenant;
- listByTenant;
- update tenant-scoped;
- archive tenant-scoped;
- tenant A no ve tenant B;
- tenant B no modifica tenant A;
- no findUnique por id simple;
- archived no aparece por defecto;
- filtros funcionan;
- paginación funciona;
- índices únicos previenen duplicados.
```

---

### 10.2. `AccountingPolicyRepository`

Debe probar:

```text id="m1qzbx"
- create policy;
- list by tenant;
- find active by tenant;
- unique active policy per tenant;
- activate;
- disable;
- archive;
- tenant isolation.
```

---

### 10.3. `ChartOfAccountsRepository`

Debe probar:

```text id="jd8dks"
- create chart;
- list tenant charts;
- find default active;
- unique active default per tenant;
- activate;
- archive;
- tenant isolation.
```

---

### 10.4. `AccountingAccountRepository`

Debe probar:

```text id="otdk5m"
- create account;
- accountCode unique per tenant/chart;
- list hierarchy;
- find children;
- find active posting account;
- activate;
- disable;
- archive;
- parent same tenant/chart;
- tenant isolation.
```

---

### 10.5. `AccountingPeriodRepository`

Debe probar:

```text id="e8lqwg"
- create period;
- periodCode unique per tenant;
- find by postingDate;
- reject overlap;
- lock;
- close;
- reopen;
- archive;
- tenant isolation.
```

---

### 10.6. `AccountingMappingRuleRepository`

Debe probar:

```text id="l88gga"
- create mapping rule;
- find active by source;
- respect priority;
- filter by effectiveAt;
- disable;
- archive;
- debit/credit accounts same tenant;
- tenant isolation.
```

---

### 10.7. `JournalEntryRepository`

Debe probar:

```text id="iwvw47"
- create draft;
- create posted automatic;
- list by period;
- list by account through lines;
- journalNumber unique per tenant;
- idempotencyKey unique;
- update draft;
- prevent update posted at service layer;
- reverse relation;
- archive;
- tenant isolation.
```

---

### 10.8. `JournalEntryLineRepository`

Debe probar:

```text id="d5s0m7"
- create lines;
- lineNumber unique per journalEntry;
- list by journalEntry;
- list by account;
- reject invalid debit/credit via DB constraints;
- tenant isolation.
```

---

### 10.9. `AccountingSourceEventLinkRepository`

Debe probar:

```text id="px506c"
- create link;
- find by idempotencyKey;
- unique active idempotencyKey;
- mark reversed;
- mark superseded;
- archive;
- tenant isolation.
```

---

### 10.10. `AccountingBalanceSnapshotRepository`

Debe probar:

```text id="k4gl87"
- create snapshot;
- list by period;
- list by account;
- unique per period/account/closingRun;
- reject negative values;
- tenant isolation.
```

---

### 10.11. `AccountingClosingRunRepository`

Debe probar:

```text id="o7ubsz"
- create draft;
- prevent draft/running duplicate for period;
- mark running;
- mark completed;
- mark completedWithWarnings;
- mark failed;
- mark cancelled;
- archive;
- tenant isolation.
```

---

## 11. Service tests

### 11.1. `AccountingPolicyService`

Debe probar:

```text id="y49taw"
- create draft policy;
- reject USD mismatch;
- reject postingToClosedPeriod=true;
- activate policy;
- prevent two active policies;
- disable active policy;
- archive policy;
- audit events;
- permission checks.
```

---

### 11.2. `ChartOfAccountsService`

Debe probar:

```text id="i9f8dr"
- create chart;
- update chart;
- activate chart with required accounts;
- reject activation without required accounts;
- enforce single active default chart;
- archive chart;
- audit events.
```

---

### 11.3. `AccountingAccountService`

Debe probar:

```text id="r1iw10"
- create account;
- reject duplicate code;
- validate parent same chart;
- reject parent cycle;
- calculate level;
- create control account with permission;
- reject control account without permission;
- activate account;
- disable account;
- archive account;
- audit events.
```

---

### 11.4. `AccountingPeriodService`

Debe probar:

```text id="e6tux8"
- create period;
- generate monthly periods;
- reject invalid date range;
- reject overlapping periods;
- lock period;
- close period;
- reopen closed period;
- reject reopen without permission;
- archive period;
- audit events.
```

---

### 11.5. `AccountingMappingRuleService`

Debe probar:

```text id="adj9bt"
- create mapping rule;
- validate debit account tenant;
- validate credit account tenant;
- validate accounts active for activation;
- reject archived accounts;
- activate rule;
- disable rule;
- archive rule;
- resolve active rule by source;
- respect priority;
- audit events.
```

---

### 11.6. `JournalEntryService`

Debe probar:

```text id="vrl459"
- create manual draft;
- calculate totals;
- reject invalid lines;
- reject cross-tenant account lines;
- update draft;
- reject update posted;
- approve entry;
- void draft;
- archive historical entry;
- audit events.
```

---

### 11.7. `JournalEntryPostingService`

Debe probar:

```text id="ey511l"
- post balanced draft;
- post approved entry;
- reject no lines;
- reject one line;
- reject unbalanced;
- reject inactive account;
- reject non-posting account;
- reject closed period;
- reject locked period;
- reject manual control account without permission;
- set postedAt server-side;
- freeze posted entry;
- audit journalEntry.posted.
```

---

### 11.8. `JournalEntryReversalService`

Debe probar:

```text id="lbhdum"
- reverse posted entry;
- create reversal entry;
- invert debit/credit lines;
- use new journalNumber;
- set reversalOfJournalEntryId;
- set reversalJournalEntryId on original;
- mark original reversed;
- reject draft reversal;
- reject voided reversal;
- reject already reversed according to policy;
- require reason;
- audit journalEntry.reversed.
```

---

### 11.9. `AccountingPostingEngineService`

Debe probar:

```text id="e03lxj"
- receive source event;
- validate tenant;
- compute idempotencyKey;
- detect duplicate source event;
- resolve active mapping rule;
- reject missing mapping rule;
- resolve posting period;
- reject no open period;
- resolve debit/credit accounts;
- calculate amount Decimal;
- create JournalEntry automatic;
- create lines;
- post entry;
- create source link;
- audit.
```

---

### 11.10. `AccountingBalanceService`

Debe probar:

```text id="pi01ze"
- calculate account balance from posted lines;
- ignore draft entries;
- ignore voided entries;
- handle reversal entries;
- calculate opening balance;
- calculate period debit/credit;
- calculate closing balance;
- generate balance snapshots;
- use Decimal only.
```

---

### 11.11. `AccountingClosingRunService`

Debe probar:

```text id="is4eac"
- create closing run;
- reject concurrent run;
- execute closing run;
- validate trial balance;
- detect draft critical entries;
- detect unbalanced entries;
- generate snapshots;
- close period on success;
- not close period on failure;
- completedWithWarnings policy;
- cancel draft/running if allowed;
- archive run;
- audit events.
```

---

### 11.12. `AccountingReportService`

Debe probar:

```text id="v4qqox"
- general journal report;
- general ledger report;
- trial balance report;
- income/expense report;
- balance sheet basic;
- derive from posted entries only;
- exclude tenant B;
- use pagination;
- calculate totals with Decimal;
- no mutation side effects.
```

---

### 11.13. `AccountingExportService`

Debe probar:

```text id="brzmt9"
- export general journal;
- export general ledger;
- export trial balance;
- export income/expense;
- export balance sheet;
- use Secure Document Storage;
- sourceModule=accountingLedger;
- sensitivity=restricted;
- visibility=administrative;
- no storageKey in response;
- audit accountingReport.exported.
```

---

## 12. Integration tests — Financial source modules

### 12.1. `004-dues-fees` — `charge.issued`

Debe probar:

```text id="zitg1r"
- charge issued genera JournalEntry automatic;
- Dr AccountsReceivable;
- Cr DuesRevenue;
- amount = charge.amount;
- source link creado;
- duplicate charge.issued no duplica asiento;
- JournalEntry no modifica Charge;
- audit journalEntry.posted.
```

---

### 12.2. `004-dues-fees` — `charge.adjusted`

Debe probar:

```text id="sr9al5"
- positive adjustment genera asiento correcto;
- negative adjustment genera asiento correcto o reversal según regla;
- amount usa Decimal;
- source link creado;
- idempotencia.
```

---

### 12.3. `004-dues-fees` — `charge.reversed`

Debe probar:

```text id="m1k73a"
- charge reversal genera efecto contable inverso;
- no edita asiento original posted;
- crea reversal/correction entry;
- source link creado;
- idempotencia.
```

---

### 12.4. `005-payments` — `payment.allocated`

Debe probar:

```text id="c3p9s7"
- payment allocation genera JournalEntry;
- Dr Cash/Bank/PaymentClearing;
- Cr AccountsReceivable;
- amount = allocation.amount;
- no crea Payment;
- no crea PaymentAllocation;
- no modifica Payment status;
- source link creado;
- idempotencia.
```

---

### 12.5. `005-payments` — `payment.reversed`

Debe probar:

```text id="k8w7bp"
- payment reversal genera asiento inverso;
- no edita asiento original;
- no crea PaymentReversal;
- source link creado;
- idempotencia.
```

---

### 12.6. `017-bank-reconciliation`

Debe probar cuando esté habilitado:

```text id="jzcpwe"
- bankTransaction.reconciled puede generar evento contable;
- bankFee.detected puede generar gasto bancario;
- bankInterest.detected puede generar ingreso;
- Accounting no crea ReconciliationMatch;
- Accounting no marca BankTransaction matched;
- Accounting no cierra ReconciliationSession.
```

---

### 12.7. `018-payment-provider-integration`

Debe probar cuando esté habilitado:

```text id="qia37k"
- providerSettlement.reviewed puede generar asiento si policy lo permite;
- providerFee.confirmed puede generar gasto/comisión;
- no altera ProviderPaymentMapping;
- no marca settlement reconciled automáticamente;
- no resuelve chargebacks automáticamente.
```

---

### 12.8. `019-open-banking-integration`

Debe probar:

```text id="y1u743"
- openBankingTransaction.imported no genera JournalEntry directo;
- openBankingTransaction.sentToReconciliation no genera JournalEntry directo en MVP;
- Open Banking alimenta Bank Reconciliation;
- Accounting recibe efectos posteriores solo desde fuentes autorizadas.
```

---

## 13. API tests

### 13.1. Accounting Policies API

Debe probar endpoints:

```text id="lcjz4w"
GET /tenant/accounting/policies
POST /tenant/accounting/policies
GET /tenant/accounting/policies/{policyId}
PATCH /tenant/accounting/policies/{policyId}
POST /tenant/accounting/policies/{policyId}/activate
POST /tenant/accounting/policies/{policyId}/disable
POST /tenant/accounting/policies/{policyId}/archive
```

Casos:

```text id="fbjid3"
- usuario autorizado puede crear;
- usuario sin permiso recibe 403;
- tenantId en body recibe 422;
- segunda policy active recibe 409;
- allowPostingToClosedPeriod=true recibe 422;
- policy cross-tenant responde 404;
- eventos audit emitidos.
```

---

### 13.2. Chart of Accounts API

Debe probar endpoints:

```text id="d4i69i"
GET /tenant/accounting/chart-of-accounts
POST /tenant/accounting/chart-of-accounts
GET /tenant/accounting/chart-of-accounts/{chartId}
PATCH /tenant/accounting/chart-of-accounts/{chartId}
POST /tenant/accounting/chart-of-accounts/{chartId}/activate
POST /tenant/accounting/chart-of-accounts/{chartId}/archive
```

Casos:

```text id="ai0f38"
- crear chart draft;
- activar chart con cuentas mínimas;
- rechazar chart sin cuentas mínimas;
- cross-tenant 404;
- no status directo en PATCH;
- audit.
```

---

### 13.3. Accounting Accounts API

Debe probar endpoints:

```text id="ofjdih"
GET /tenant/accounting/accounts
POST /tenant/accounting/accounts
GET /tenant/accounting/accounts/{accountId}
PATCH /tenant/accounting/accounts/{accountId}
POST /tenant/accounting/accounts/{accountId}/activate
POST /tenant/accounting/accounts/{accountId}/disable
POST /tenant/accounting/accounts/{accountId}/archive
```

Casos:

```text id="x9cpq5"
- accountCode duplicado 409;
- parentAccountId cross-tenant 404/403;
- chartOfAccountsId cross-tenant 404/403;
- isControlAccount=true sin permiso 403;
- status directo 422;
- level enviado por cliente se ignora o rechaza;
- cuenta archived no se usa para posting.
```

---

### 13.4. Accounting Periods API

Debe probar endpoints:

```text id="yfqss0"
GET /tenant/accounting/periods
POST /tenant/accounting/periods
POST /tenant/accounting/periods/generate
GET /tenant/accounting/periods/{periodId}
PATCH /tenant/accounting/periods/{periodId}
POST /tenant/accounting/periods/{periodId}/lock
POST /tenant/accounting/periods/{periodId}/close
POST /tenant/accounting/periods/{periodId}/reopen
POST /tenant/accounting/periods/{periodId}/archive
```

Casos:

```text id="x66gon"
- periodo inválido 422;
- periodo solapado 409;
- periodCode duplicado 409;
- generate mensual crea periodos esperados;
- close valida trial balance;
- reopen requiere permiso;
- cross-tenant 404.
```

---

### 13.5. Mapping Rules API

Debe probar endpoints:

```text id="oyikdt"
GET /tenant/accounting/mapping-rules
POST /tenant/accounting/mapping-rules
GET /tenant/accounting/mapping-rules/{ruleId}
PATCH /tenant/accounting/mapping-rules/{ruleId}
POST /tenant/accounting/mapping-rules/{ruleId}/activate
POST /tenant/accounting/mapping-rules/{ruleId}/disable
POST /tenant/accounting/mapping-rules/{ruleId}/archive
```

Casos:

```text id="ma1k39"
- crear regla draft;
- activar con cuentas active;
- rechazar cuenta inactive;
- rechazar debitAccount cross-tenant;
- rechazar creditAccount cross-tenant;
- resolver prioridad;
- cross-tenant 404;
- audit.
```

---

### 13.6. Journal Entries API

Debe probar endpoints:

```text id="zc290x"
GET /tenant/accounting/journal-entries
POST /tenant/accounting/journal-entries
GET /tenant/accounting/journal-entries/{journalEntryId}
PATCH /tenant/accounting/journal-entries/{journalEntryId}
POST /tenant/accounting/journal-entries/{journalEntryId}/approve
POST /tenant/accounting/journal-entries/{journalEntryId}/post
POST /tenant/accounting/journal-entries/{journalEntryId}/reverse
POST /tenant/accounting/journal-entries/{journalEntryId}/void
POST /tenant/accounting/journal-entries/{journalEntryId}/archive
```

Casos:

```text id="w7lqhp"
- crear draft balanceado;
- crear draft desbalanceado permitido o rechazado según policy, pero no posted;
- post balanced exitoso;
- post unbalanced 422;
- post sin líneas 422;
- post con cuenta inactive 409;
- post en periodo closed 409;
- editar posted 409;
- reverse posted crea reversal;
- void draft funciona;
- void posted 409;
- cross-tenant 404;
- audit.
```

---

### 13.7. Automatic Posting API / Internal Use

Debe probar:

```text id="k7qrno"
POST /tenant/accounting/posting/source-events
```

Casos:

```text id="omwp12"
- source event válido genera asiento;
- duplicate source event retorna idempotente;
- missing mapping rule retorna 409/pending controlado;
- sourceResource cross-tenant rechaza;
- Open Banking source directo rechaza en MVP;
- no crea Payment;
- no modifica Account Statements.
```

---

### 13.8. Source Event Links API

Debe probar:

```text id="ipe608"
GET /tenant/accounting/source-event-links
GET /tenant/accounting/source-event-links/{sourceEventLinkId}
```

Casos:

```text id="ij5gzq"
- lista links tenant A;
- no lista tenant B;
- no expone idempotencyKey completo por defecto;
- no expone raw source payload;
- filtros funcionan.
```

---

### 13.9. Closing Runs API

Debe probar:

```text id="m9ps67"
GET /tenant/accounting/closing-runs
POST /tenant/accounting/periods/{periodId}/closing-runs
GET /tenant/accounting/closing-runs/{closingRunId}
POST /tenant/accounting/closing-runs/{closingRunId}/execute
POST /tenant/accounting/closing-runs/{closingRunId}/cancel
POST /tenant/accounting/closing-runs/{closingRunId}/archive
```

Casos:

```text id="v3vx7j"
- crear closing run;
- impedir duplicate running/draft;
- execute success cierra periodo;
- execute failed no cierra periodo;
- trial balance desbalanceado falla;
- drafts críticos generan failed/warnings según policy;
- cancel requiere reason;
- cross-tenant 404.
```

---

### 13.10. Reports API

Debe probar:

```text id="lnw2op"
GET /tenant/accounting/reports/general-journal
GET /tenant/accounting/reports/general-ledger
GET /tenant/accounting/reports/trial-balance
GET /tenant/accounting/reports/income-expense
GET /tenant/accounting/reports/balance-sheet
GET /tenant/accounting/reports/export
```

Casos:

```text id="i9etbo"
- reportes derivan de posted entries;
- draft entries no aparecen;
- voided entries no aparecen;
- tenant B no aparece;
- pageSize max 100;
- export usa Secure Document Storage;
- response no expone storageKey;
- sin permiso recibe 403;
- audit accountingReport.generated/exported.
```

---

## 14. Multitenancy tests

### 14.1. Recursos tenant-scoped

Debe probar que tenant A no puede leer, modificar, activar, postear, reversar, cerrar, exportar ni archivar recursos de tenant B:

```text id="pmmoxa"
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
AccountingReport
SecureDocument exportado por accounting
```

---

### 14.2. Casos críticos

```text id="lwx021"
- tenant A no usa chartOfAccountsId tenant B;
- tenant A no usa parentAccountId tenant B;
- tenant A no usa accountingAccountId tenant B en líneas;
- tenant A no usa accountingPeriodId tenant B;
- tenant A no usa debitAccountId tenant B;
- tenant A no usa creditAccountId tenant B;
- tenant A no reversa JournalEntry tenant B;
- tenant A no consulta libro mayor de account tenant B;
- tenant A no exporta reporte con datos tenant B.
```

---

### 14.3. Respuesta esperada

```text id="bs3koy"
404 recomendado para recursos cross-tenant.
403 permitido si la política lo define.
Nunca revelar existencia de recurso contable de otro tenant.
```

---

## 15. Authorization tests

### 15.1. PlatformAdmin

Debe probar:

```text id="nbkuuw"
- no accede automáticamente a ledger tenant;
- no lista journal entries tenant sin contexto/permiso explícito;
- no puede postear asientos tenant por defecto;
- acceso excepcional requiere permiso y auditoría reforzada.
```

---

### 15.2. TenantAdmin

Debe probar:

```text id="ea9j6i"
- puede leer configuración contable si tiene permiso;
- no puede postear asientos sin journalEntries.post;
- no puede reversar sin journalEntries.reverse;
- no puede exportar reportes sin accountingReports.export.
```

---

### 15.3. FinancialManager

Debe probar:

```text id="pneppp"
- puede administrar policy;
- puede activar chart;
- puede cerrar/reabrir periodos si tiene permisos;
- puede ejecutar closing runs;
- puede leer reportes;
- puede exportar reportes.
```

---

### 15.4. Accountant

Debe probar:

```text id="pposq9"
- puede crear cuentas si tiene permiso;
- puede crear mapping rules si tiene permiso;
- puede crear journal entries manuales;
- puede aprobar/postear/reversar según permisos;
- no puede postear control accounts sin permiso especial.
```

---

### 15.5. BoardMember

Debe probar:

```text id="ij21og"
- puede leer reportes agregados si tiene permiso;
- no puede editar chart;
- no puede crear journal entries;
- no puede postear;
- no puede reversar;
- no puede cerrar periodos.
```

---

### 15.6. Resident / PropertyOwner

Debe probar:

```text id="d2bskj"
- no existe /me accounting;
- no puede leer journal entries;
- no puede leer accounts;
- no puede leer reports;
- no puede exportar accounting;
- recibe 404/403 según superficie.
```

---

## 16. Accounting integrity tests

### 16.1. Double-entry

Debe probar:

```text id="j4d2ns"
- posted requiere totalDebit = totalCredit;
- totalDebit/totalCredit se recalculan desde líneas;
- cliente no puede forzar totales;
- líneas válidas suman correctamente;
- diferencias de centavos no se aceptan sin policy explícita.
```

---

### 16.2. Line integrity

Debe probar:

```text id="ihtjoj"
- línea debit-only válida;
- línea credit-only válida;
- línea debit+credit inválida;
- línea zero-zero inválida;
- línea negativa inválida;
- línea currency mismatch inválida;
- línea account inactive inválida para posting.
```

---

### 16.3. Posting integrity

Debe probar:

```text id="vn35qd"
- draft puede postear si válido;
- approved puede postear si válido;
- posted no se postea otra vez;
- voided no se postea;
- archived no se postea;
- postingDate determina periodo;
- no posting si no existe periodo.
```

---

### 16.4. Immutability

Debe probar:

```text id="yhavku"
- posted no admite PATCH;
- posted no admite cambios de líneas;
- posted no admite cambio de total;
- posted no admite eliminación;
- posted se corrige por reversal.
```

---

### 16.5. Reversal integrity

Debe probar:

```text id="gebzr1"
- reversal invierte todas las líneas;
- reversal usa nuevo journalNumber;
- reversal se vincula al original;
- original no se modifica salvo status/reversal pointer permitido;
- reversal debe cuadrar;
- reversal requiere periodo open/reopened.
```

---

### 16.6. Source event integrity

Debe probar:

```text id="glxh09"
- automatic entry requiere source;
- source event link se crea;
- duplicate source event no duplica;
- source event cross-tenant rechaza;
- sourceResourceId se trata como referencia, no como permiso automático.
```

---

### 16.7. Report integrity

Debe probar:

```text id="n38tdh"
- general journal solo posted entries;
- general ledger solo posted lines;
- trial balance cuadra;
- income/expense usa cuentas income/expense;
- balance sheet usa asset/liability/equity;
- reports no derivan directamente de Charges/Payments sin ledger posted;
- reports no mutan datos.
```

---

## 17. Security tests

### 17.1. Input hardening

Debe probar rechazo de:

```text id="xxverh"
tenantId
createdBy
updatedBy
postedBy
approvedBy
reversedBy
closedBy
archivedBy
status directo
totalDebit como fuente de verdad
totalCredit como fuente de verdad
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

### 17.2. Public endpoints forbidden

Debe probar que retornan 404:

```text id="ckef6f"
GET  /api/v1/public/accounting
GET  /api/v1/public/accounting/accounts
GET  /api/v1/public/accounting/journal-entries
GET  /api/v1/public/accounting/reports
GET  /api/v1/public/tenants/{slug}/accounting
GET  /api/v1/public/tenants/{slug}/accounting/accounts
GET  /api/v1/public/tenants/{slug}/accounting/journal-entries
GET  /api/v1/public/tenants/{slug}/accounting/reports
```

---

### 17.3. `/me` endpoints forbidden

Debe probar que retornan 404:

```text id="n6w8p7"
GET  /api/v1/me/accounting
GET  /api/v1/me/accounting/accounts
GET  /api/v1/me/accounting/journal-entries
GET  /api/v1/me/accounting/reports
GET  /api/v1/me/accounting/trial-balance
GET  /api/v1/me/accounting/general-ledger
```

---

### 17.4. WordPress isolation

Debe probar:

```text id="h07cjx"
- WordPress no puede consultar accounting;
- WordPress no puede consultar reports;
- WordPress no puede generar exports;
- WordPress no puede postear JournalEntries;
- CORS no permite operaciones contables desde dominio público no autorizado.
```

---

### 17.5. External AI prohibition

Debe probar:

```text id="i6i30o"
- accountingLedger.externalAi.enabled=false;
- ACCOUNTING_EXTERNAL_AI_ENABLED=false;
- no journal entries reales se envían a IA;
- no balances reales se envían a IA;
- no exports reales se envían a IA;
- solo fixtures sintéticos pueden usarse.
```

---

## 18. Audit tests

### 18.1. Eventos obligatorios

Debe probar emisión de:

```text id="dlz72k"
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
accountingPeriod.generated
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

### 18.2. Metadata permitida

Debe validar que audit puede incluir:

```text id="mzvilw"
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

### 18.3. Metadata prohibida

Debe validar ausencia de:

```text id="qj0rt4"
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
datos cross-tenant
```

---

### 18.4. Auditoría reforzada

Debe probar auditoría reforzada en:

```text id="pd7flj"
- activación de policy;
- activación de chart;
- marcar cuenta como control account;
- posting manual en control account;
- posting rechazado;
- asiento desbalanceado rechazado;
- source event duplicado;
- reversal;
- cierre de periodo;
- reapertura de periodo;
- export de reportes;
- acceso excepcional PlatformAdmin.
```

---

## 19. Observability tests

### 19.1. Logs permitidos

Debe probar emisión segura para:

```text id="um0n9s"
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

### 19.2. Campos permitidos en logs

```text id="wy2gwg"
traceId
requestId
correlationId
action
outcome
entryType
entryStatus
sourceModule
sourceEventType
periodStatus
accountType
currency
durationMs
errorCode
```

---

### 19.3. Campos prohibidos en logs

```text id="jdqkbd"
tenantId como label
userId como label
journalEntryId como label
accountingAccountId como label
sourceResourceId como label
paymentId como label
chargeId como label
bankTransactionId como label
raw payload
storageKey
signedUrl
SQL raw
stack trace en producción
```

---

### 19.4. Métricas

Debe probar emisión de:

```text id="hly5kf"
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

### 19.5. Labels permitidos

```text id="gxaqlc"
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

### 19.6. Labels prohibidos

```text id="zlpfsi"
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

## 20. OpenAPI contract tests

Debe validar:

```text id="t8d7dm"
- OpenAPI contiene tags esperados;
- endpoints tenant documentados correctamente;
- no documenta endpoints públicos contables;
- no documenta endpoints /me accounting;
- DTOs no contienen tenantId;
- DTOs no contienen actor fields;
- DTOs no aceptan totalDebit/totalCredit como fuente de verdad;
- DTOs monetarios usan string decimal;
- x-tenant-scope presente;
- x-auth-required presente;
- x-accounting-ledger presente;
- x-public-exposure=false;
- x-double-entry-required en journal entries;
- x-posted-entry-immutable en journal entries;
- x-source-linked en posting;
- x-idempotent-source-event en posting;
- x-period-aware en posting/closing;
- x-closing-operation en closing;
- x-derived-from-posted-ledger en reportes;
- x-export-via-secure-document-storage en exports;
- x-creates-payment=false;
- x-updates-account-statement=false;
- x-confirms-bank-reconciliation=false.
```

---

## 21. Performance tests

### 21.1. Objetivos

```text id="c14ciy"
p95 < 800 ms para listar cuentas paginadas.
p95 < 1000 ms para listar asientos paginados.
p95 < 1500 ms para consultar libro mayor de una cuenta en periodo mensual típico.
p95 < 2000 ms para balance de comprobación mensual típico.
p95 < 3000 ms para cierre de periodo pequeño/mediano, excluyendo jobs pesados.
```

---

### 21.2. Escenarios

```text id="a3sdsf"
- listar 100 cuentas;
- listar 1000 journal entries paginados;
- consultar general journal mensual;
- consultar general ledger de cuenta con 1000 líneas;
- generar trial balance con 100 cuentas;
- generar income/expense;
- generar balance sheet básico;
- ejecutar closing run con 1000 journal entries;
- generar balance snapshots;
- exportar reporte XLSX/PDF/CSV.
```

---

### 21.3. Validaciones técnicas

```text id="gg52af"
- no N+1 evidente;
- pageSize máximo 100;
- índices por tenant, period, account y status;
- reportes pesados preparados para jobs;
- snapshots disponibles para cierre/reportes;
- consultas reportes filtran tenantId siempre.
```

---

## 22. Concurrency tests

Debe probar:

```text id="f2a3xk"
- dos postings del mismo draft no duplican posted;
- dos source events iguales simultáneos no duplican asiento;
- dos reversals simultáneos no duplican reverso;
- dos closing runs simultáneos del mismo periodo no corren juntos;
- update draft y post simultáneo terminan en estado consistente;
- close period y post simultáneo respetan transacción;
- generate journal number simultáneo no duplica número;
- create account con mismo accountCode simultáneo retorna un éxito y un 409.
```

---

## 23. Regression tests

### 23.1. `004-dues-fees`

Debe verificar:

```text id="c2ob7d"
- generación de cargos sigue funcionando;
- ajustes siguen funcionando;
- reversos siguen funcionando;
- accounting posting no modifica Charge;
- idempotencia evita doble asiento para el mismo Charge.
```

---

### 23.2. `005-payments`

Debe verificar:

```text id="hdb5l2"
- pagos manuales siguen funcionando;
- pagos provider siguen funcionando;
- allocations siguen funcionando;
- accounting posting no crea Payment;
- accounting posting no crea PaymentAllocation;
- reversal contable no crea PaymentReversal.
```

---

### 23.3. `006-account-statements`

Debe verificar:

```text id="qqwofo"
- estados de cuenta siguen derivados de cargos/pagos;
- JournalEntries no crean statement lines;
- reversal contable no modifica saldos operativos;
- reportes contables no reemplazan estados de cuenta.
```

---

### 23.4. `017-bank-reconciliation`

Debe verificar:

```text id="jhid8d"
- Bank Reconciliation sigue creando/confirmando matches;
- Accounting no crea ReconciliationMatch;
- Accounting no marca BankTransaction matched;
- closing accounting no cierra reconciliation sessions.
```

---

### 23.5. `018-payment-provider-integration`

Debe verificar:

```text id="tzk9xd"
- provider payments siguen funcionando;
- provider settlements no se marcan reconciled desde Accounting;
- provider mappings no se alteran desde Accounting;
- provider fees se contabilizan solo bajo evento/policy habilitada.
```

---

### 23.6. `019-open-banking-integration`

Debe verificar:

```text id="hpk36j"
- Open Banking sync sigue funcionando;
- Open Banking transactions no generan JournalEntry directo;
- Open Banking send-to-reconciliation no contabiliza directo;
- efectos contables pasan por fuentes autorizadas posteriores.
```

---

### 23.7. `016-secure-document-storage`

Debe verificar:

```text id="c4a5m1"
- sourceModule=accountingLedger funciona;
- exports se almacenan sin storageKey expuesto;
- permisos de descarga se respetan;
- audit de descarga permanece activo.
```

---

## 24. Smoke tests

Debe ejecutar flujo mínimo:

```text id="qz8k41"
1. FinancialManager crea AccountingPolicy.
2. FinancialManager activa AccountingPolicy.
3. Accountant crea ChartOfAccounts.
4. Accountant crea cuentas mínimas.
5. FinancialManager activa ChartOfAccounts.
6. Accountant genera periodos mensuales.
7. Accountant crea mapping rule charge.issued.
8. Accountant activa mapping rule.
9. Dues & Fees emite Charge.
10. AccountingPostingEngine procesa charge.issued.
11. Sistema crea JournalEntry automatic.
12. Sistema crea JournalEntryLines.
13. Sistema valida totalDebit = totalCredit.
14. Sistema postea JournalEntry.
15. Sistema crea AccountingSourceEventLink.
16. Sistema rechaza reprocesar el mismo source event como duplicado.
17. Accountant crea JournalEntry manual balanceado.
18. Accountant postea JournalEntry manual.
19. Accountant reversa JournalEntry manual.
20. Sistema consulta General Journal.
21. Sistema consulta General Ledger.
22. Sistema genera Trial Balance.
23. FinancialManager ejecuta ClosingRun.
24. Sistema cierra periodo.
25. Sistema exporta Trial Balance vía Secure Document Storage.
26. Sistema audita eventos críticos.
```

---

## 25. CI/CD gates

El pipeline debe fallar si:

```text id="oqpv3h"
- falla lint;
- falla typecheck;
- fallan unit tests;
- fallan value object tests;
- fallan entity tests;
- fallan policy tests;
- fallan repository tests;
- fallan service tests;
- fallan posting engine tests;
- fallan integration tests;
- fallan API tests;
- fallan authorization tests;
- fallan multitenancy tests;
- fallan accounting integrity tests;
- fallan security tests;
- fallan audit tests;
- fallan observability tests;
- fallan OpenAPI tests;
- fallan regression tests;
- fallan smoke tests;
- OpenAPI documenta endpoints públicos contables;
- OpenAPI documenta endpoints /me accounting;
- DTOs aceptan tenantId;
- DTOs aceptan actor fields;
- DTOs aceptan totalDebit/totalCredit como fuente de verdad;
- se detecta float/double para dinero;
- se permite postear asiento desbalanceado;
- se permite editar asiento posted;
- se permite duplicar source event;
- se permite postear en periodo closed;
- ledger crea Payment;
- ledger crea PaymentAllocation;
- ledger modifica Account Statements;
- ledger crea ReconciliationMatch;
- ledger marca BankTransaction matched;
- Open Banking genera JournalEntry directo en MVP;
- logs contienen payloads completos o storageKey;
- audit contiene datos prohibidos;
- externalAi está habilitado por defecto.
```

---

## 26. Cobertura mínima recomendada

```text id="h86oua"
Value Objects: 95%
Entities / state machines: 95%
Domain policies: 95%
Repositories: 90%
Services: 90%
Posting engine: 95%
Source event idempotency: 95%
Journal entry balance validation: 95%
Journal entry immutability: 95%
Reversal logic: 95%
Period closing: 90%
Reports: 85%
Authorization: 90%
Multitenancy: 95%
Security tests: 95%
API controllers: 85%
Observability: 75%
```

Advertencia:

```text id="odbbno"
La cobertura no reemplaza pruebas de integridad contable. Un módulo con alta cobertura pero sin pruebas de partida doble, inmutabilidad, idempotencia, periodos cerrados y no mutación de módulos operativos no debe aceptarse.
```

---

## 27. Matriz de trazabilidad

| Requisito                           | Tests mínimos                           |
| ----------------------------------- | --------------------------------------- |
| Tenant isolation                    | Repository, API, security, reports      |
| Double-entry                        | Value object, entity, posting, API      |
| Decimal money                       | Value object, service, report, CI       |
| Posted immutability                 | Entity, service, API, security          |
| Source event idempotency            | Posting engine, repository, concurrency |
| Manual entries                      | API, service, authorization             |
| Control accounts                    | Policy, service, API, audit             |
| Period-aware posting                | Period service, posting, API            |
| Closed period protection            | Policy, posting, API                    |
| Reversal                            | Entity, service, API, reports           |
| Charges integration                 | Integration tests                       |
| Payments integration                | Integration tests                       |
| No Payment creation                 | Policy, integration, regression         |
| No Account Statements mutation      | Policy, regression                      |
| No Bank Reconciliation confirmation | Policy, regression                      |
| No Open Banking direct posting      | Integration, regression, security       |
| Reports from ledger posted          | Report tests                            |
| Exports via SDS                     | Export integration tests                |
| Audit                               | Audit tests                             |
| Observability                       | Logs/metrics tests                      |
| OpenAPI safe                        | Contract tests                          |
| No public endpoints                 | API route tests                         |
| No /me endpoints                    | API route tests                         |
| No WordPress access                 | CORS/security tests                     |
| No external AI real data            | Feature flag/security tests             |

---

## 28. Checklist de aceptación de pruebas

```text id="m1cyta"
[ ] Unit tests implementados.
[ ] Value object tests implementados.
[ ] Entity tests implementados.
[ ] State machine tests implementados.
[ ] Domain policy tests implementados.
[ ] Repository tests implementados.
[ ] Service tests implementados.
[ ] Posting engine tests implementados.
[ ] Source event idempotency tests implementados.
[ ] Journal entry balance tests implementados.
[ ] Journal entry immutability tests implementados.
[ ] Reversal tests implementados.
[ ] Period tests implementados.
[ ] Control account tests implementados.
[ ] Mapping rule tests implementados.
[ ] Integration tests con Charges implementados.
[ ] Integration tests con Payments implementados.
[ ] Regression tests con Account Statements implementados.
[ ] Regression tests con Bank Reconciliation implementados.
[ ] Regression tests con Payment Provider Integration implementados.
[ ] Regression tests con Open Banking Integration implementados.
[ ] Report tests implementados.
[ ] Export tests implementados.
[ ] API tests implementados.
[ ] Authorization tests implementados.
[ ] Multitenancy tests implementados.
[ ] Accounting integrity tests implementados.
[ ] Security tests implementados.
[ ] Audit tests implementados.
[ ] Observability tests implementados.
[ ] OpenAPI contract tests implementados.
[ ] Performance tests mínimos implementados.
[ ] Concurrency tests implementados.
[ ] Smoke tests implementados.
[ ] CI/CD gates configurados.
```

---

## 29. No aceptación

La implementación no debe aceptarse si las pruebas permiten:

```text id="kw5d0c"
- accounting policy cross-tenant;
- chart of accounts cross-tenant;
- accounting account cross-tenant;
- accounting period cross-tenant;
- mapping rule cross-tenant;
- journal entry cross-tenant;
- journal entry line cross-tenant;
- source event link cross-tenant;
- balance snapshot cross-tenant;
- closing run cross-tenant;
- accounting report cross-tenant;
- tenantId desde body;
- actor fields desde body;
- totalDebit/totalCredit como fuente de verdad del cliente;
- postear asiento sin líneas;
- postear asiento con una sola línea;
- postear asiento desbalanceado;
- línea con debit y credit simultáneos;
- línea con ambos montos cero;
- línea con monto negativo;
- postear con cuenta inactive;
- postear con cuenta archived;
- postear en cuenta no posteable;
- postear manualmente en control account sin permiso;
- editar JournalEntry posted;
- borrar JournalEntry posted;
- reversar JournalEntry draft;
- reversar sin razón;
- duplicar asiento por mismo source event;
- postear en periodo locked/closed/archived;
- cerrar periodo con trial balance desbalanceado;
- cerrar periodo con errores críticos sin registrarlos;
- reportes derivados directamente de Charges/Payments sin JournalEntries posted;
- ledger crea Payment;
- ledger crea PaymentAllocation;
- ledger modifica Account Statements;
- ledger crea ReconciliationMatch;
- ledger marca BankTransaction matched;
- ledger cierra ReconciliationSession;
- Open Banking genera JournalEntry directo en MVP;
- endpoint público contable;
- endpoint /me contable;
- acceso contable desde WordPress;
- datos contables reales enviados a IA externa;
- audit sin sanitización;
- logs con payloads completos, storageKey o stack trace productivo;
- float/double para dinero.
```

---

## 30. Resultado esperado

Al ejecutar este plan, el módulo `020-accounting-ledger` debe quedar validado como una base contable interna, segura y extensible.

Resultado esperado:

```text id="jhtsbu"
AccountingPolicy tested
ChartOfAccounts tested
AccountingAccounts tested
AccountingPeriods tested
AccountingMappingRules tested
JournalEntries tested
JournalEntryLines tested
double-entry tested
Decimal money tested
posted immutability tested
reversal accounting tested
source event links tested
source event idempotency tested
automatic posting from Charges tested
automatic posting from Payments tested
manual entries tested
control account protection tested
closed period protection tested
balance calculation tested
balance snapshots tested
general journal tested
general ledger tested
trial balance tested
income expense report tested
balance sheet tested
closing run tested
exports via Secure Document Storage tested
audit tested
observability tested
OpenAPI tested
authorization tested
multitenancy tested
security tested
performance smoke tested
concurrency tested
regression tested
smoke flow tested
CI gates ready
no Payment auto-creation tested
no Account Statements mutation tested
no Bank Reconciliation final confirmation tested
no Open Banking direct posting tested
no public endpoints tested
no /me endpoints tested
no WordPress accounting access tested
no external AI with real accounting data tested
```

---

## 31. Expediente actualizado

```text id="jjv528"
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
│   │       └── test-plan.md
```
