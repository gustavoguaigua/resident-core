# Security Notes — Spec 020 Accounting Ledger

## 1. Información del documento

| Campo           | Valor                                                                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Proyecto        | RESIDENT Core                                                                                                                                    |
| Spec ID         | 020                                                                                                                                              |
| Módulo          | Accounting Ledger                                                                                                                                |
| Documento       | Security Notes                                                                                                                                   |
| Ruta            | `docs/specs/020-accounting-ledger/security-notes.md`                                                                                             |
| Versión         | 0.1                                                                                                                                              |
| Estado          | Borrador inicial                                                                                                                                 |
| Fecha           | 2026-07-23                                                                                                                                       |
| Documento base  | `docs/specs/020-accounting-ledger/spec.md`                                                                                                       |
| Plan técnico    | `docs/specs/020-accounting-ledger/plan.md`                                                                                                       |
| Modelo de datos | `docs/specs/020-accounting-ledger/data-model.md`                                                                                                 |
| Contrato API    | `docs/specs/020-accounting-ledger/api-contract.md`                                                                                               |
| Plan de pruebas | `docs/specs/020-accounting-ledger/test-plan.md`                                                                                                  |
| Tasks           | `docs/specs/020-accounting-ledger/tasks.md`                                                                                                      |
| Naturaleza      | Tenant-scoped / Double-entry / Source-linked / Posting-driven / Period-aware / Immutable-after-posting / Audit-heavy / Report-ready / Non-public |

---

## 2. Propósito

Este documento define las notas de seguridad del módulo `020-accounting-ledger`.

El objetivo es establecer controles específicos para proteger la integridad contable, la confidencialidad financiera, la trazabilidad, la inmutabilidad de asientos contabilizados, el aislamiento multitenant, la autorización por permisos, la idempotencia por evento fuente, los cierres de periodo, la auditoría y la no exposición pública de información contable.

Regla central de seguridad:

```text id="7xj7ez"
Todo recurso de Accounting Ledger debe proteger tenant isolation, partida doble, Decimal money, inmutabilidad de asientos posted, idempotencia por source event, periodos cerrados, cuentas de control, reversos auditados, reportes derivados solo del ledger contabilizado, ausencia de endpoints públicos, ausencia de endpoints /me, ausencia de acceso desde WordPress, ausencia de creación de Payment, ausencia de mutación de Account Statements, ausencia de confirmación de Bank Reconciliation y ausencia total de IA externa con datos contables reales.
```

---

## 3. Principio dominante

Accounting Ledger es un módulo financiero-contable crítico.

Su seguridad no se limita a autenticación y permisos. Debe preservar:

```text id="mvvcqj"
- integridad contable;
- consistencia financiera;
- aislamiento multitenant;
- trazabilidad de origen;
- inmutabilidad posterior al posting;
- reversibilidad mediante asientos de reverso;
- confidencialidad administrativa;
- auditoría completa;
- control de cierres;
- no mutación de módulos operativos;
- no exposición pública.
```

Principio:

```text id="cgcmuf"
Un asiento posted incorrecto no se corrige editándolo; se corrige mediante un reverso auditable y, si aplica, un nuevo asiento correctivo.
```

---

## 4. Alcance de seguridad

Incluye controles sobre:

```text id="gbe34f"
- AccountingPolicy;
- ChartOfAccounts;
- AccountingAccount;
- AccountingPeriod;
- AccountingMappingRule;
- JournalEntry;
- JournalEntryLine;
- AccountingSourceEventLink;
- AccountingBalanceSnapshot;
- AccountingClosingRun;
- General Journal;
- General Ledger;
- Trial Balance;
- Income and Expense report;
- Basic Balance Sheet;
- Accounting exports;
- Source event posting;
- Manual entries;
- Automatic entries;
- Reversal entries;
- Period closing;
- Audit;
- Observability;
- OpenAPI;
- CI/CD gates.
```

---

## 5. Fuera del alcance permitido

El módulo no debe implementar ni permitir por accidente:

```text id="addhny"
- creación de Payment;
- creación de PaymentAllocation;
- creación de PaymentReversal;
- modificación de Account Statements;
- creación de statement lines;
- modificación de saldos operativos;
- creación de ReconciliationMatch;
- marcado de BankTransaction como matched;
- cierre de ReconciliationSession;
- conciliación bancaria final;
- contabilización directa desde Open Banking en MVP;
- exposición pública de ledger;
- endpoints /me accounting;
- consumo desde WordPress;
- IA externa con asientos reales;
- edición de asientos posted;
- eliminación física de asientos posted;
- uso de float/double para dinero;
- reportes cross-tenant;
- exportaciones sin control de acceso.
```

---

# 6. Activos protegidos

## 6.1. Activos funcionales

```text id="piqb8s"
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
accounting reports
accounting exports
audit logs
```

---

## 6.2. Activos financieros

```text id="moqhm1"
- saldos contables;
- libro diario;
- libro mayor;
- balance de comprobación;
- ingresos;
- gastos;
- patrimonio;
- activos;
- pasivos;
- cuentas por cobrar;
- cuentas puente;
- asientos manuales;
- asientos automáticos;
- reversos;
- cierres de periodo.
```

---

## 6.3. Activos de integridad

```text id="x4bl30"
- relación source event -> journal entry;
- idempotencyKey interno;
- journalNumber;
- postingDate;
- accountingPeriodId;
- reversalOfJournalEntryId;
- reversalJournalEntryId;
- totalDebit;
- totalCredit;
- JournalEntryLines;
- accountCode;
- control account flags;
- closing run status;
- balance snapshots;
- audit events.
```

---

## 6.4. Activos de confidencialidad

```text id="8ocqu3"
- reportes contables;
- exportaciones contables;
- detalles de asientos;
- cuentas contables;
- montos;
- referencias fuente;
- metadata contable;
- evidencia de cierre;
- comparaciones contables-operativas.
```

---

# 7. Clasificación de datos

## 7.1. Datos prohibidos

Nunca almacenar, exponer, auditar ni loggear:

```text id="s1pw24"
tokens
passwords
secrets
raw provider payload
raw bank payload
storageKey
signedUrl persistente
Authorization header
cookies
SQL raw
stack trace productivo
datos cross-tenant
datos contables reales enviados a IA externa
```

---

## 7.2. Datos altamente sensibles

```text id="wj8z9r"
journalEntryId
journalNumber
accountingAccountId
accountCode
sourceResourceId
sourceEventType
amount
balance
closingRunId
secureDocumentId
secureDocumentFileId
reversal references
idempotencyKey interno
```

Regla:

```text id="eat73i"
Pueden existir en base de datos y auditoría sanitizada, pero no deben usarse como labels de métricas ni exponerse innecesariamente.
```

---

## 7.3. Datos administrativos restringidos

```text id="1s3xg3"
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
```

Regla:

```text id="sjgm96"
Solo usuarios tenant autorizados pueden consultarlos.
```

---

## 7.4. Datos públicos

No hay datos públicos del módulo Accounting Ledger en MVP.

```text id="t2t3f6"
Accounting Ledger no expone datos públicos.
```

---

# 8. Modelo de amenazas STRIDE

## 8.1. Spoofing

Amenazas:

```text id="vd2il8"
- usuario se hace pasar por contador;
- usuario intenta actuar como FinancialManager;
- PlatformAdmin intenta operar tenant sin permiso explícito;
- request intenta inyectar tenantId;
- WordPress intenta consumir API contable;
- source event falso intenta generar asiento.
```

Controles:

```text id="bsycyq"
- Keycloak/OIDC;
- AuthGuard;
- TenantGuard;
- PermissionGuard;
- currentTenant desde contexto autenticado;
- no tenantId en body/query/path;
- verificación de membership;
- verificación de permisos;
- validación de source resource tenant-scoped;
- endpoints internos protegidos para posting source-events.
```

---

## 8.2. Tampering

Amenazas:

```text id="td83rz"
- modificar asiento posted;
- alterar líneas de asiento posted;
- alterar totalDebit/totalCredit desde cliente;
- cambiar postingDate para evadir periodo cerrado;
- cambiar accountCode con historial;
- cambiar mapping rule para alterar interpretación histórica;
- manipular balance snapshots;
- manipular closing run;
- inyectar source event duplicado;
- crear asiento desbalanceado.
```

Controles:

```text id="lhl0hl"
- JournalEntryImmutabilityPolicy;
- JournalEntryBalancePolicy;
- ClosedPeriodPostingPolicy;
- SourceEventIdempotencyPolicy;
- totals calculados server-side;
- constraints DB;
- transacciones de posting/reversal/closing;
- no edición de posted;
- reversos auditados;
- snapshots no son fuente primaria;
- auditoría de cambios críticos.
```

---

## 8.3. Repudiation

Amenazas:

```text id="amv4rc"
- usuario niega haber posteado asiento;
- usuario niega haber reversado asiento;
- usuario niega haber cerrado periodo;
- usuario niega haber exportado reporte;
- usuario niega haber cambiado cuenta de control;
- sistema no puede explicar origen de asiento automático.
```

Controles:

```text id="slv8k7"
- audit events obligatorios;
- actorId desde token;
- traceId;
- correlationId;
- source event links;
- journalNumber;
- postedAt;
- reversedAt;
- closingRun records;
- reason obligatorio en operaciones críticas;
- auditoría reforzada para cierre/reapertura/reversos/control accounts.
```

---

## 8.4. Information Disclosure

Amenazas:

```text id="nkz5c4"
- tenant A ve ledger de tenant B;
- residente ve libro contable;
- WordPress expone asientos;
- logs contienen montos masivos o payloads;
- audit contiene storageKey;
- export expone signedUrl persistente;
- reportes sin paginación revelan información masiva;
- OpenAPI documenta rutas públicas no permitidas.
```

Controles:

```text id="wdnv26"
- tenant-scoped repositories;
- permisos accountingReports.*;
- no endpoints públicos;
- no endpoints /me;
- no WordPress access;
- no storageKey en response;
- logs sanitizados;
- audit sanitizado;
- pagination;
- Secure Document Storage para exports;
- OpenAPI gate.
```

---

## 8.5. Denial of Service

Amenazas:

```text id="o9gg96"
- reportes contables pesados;
- exportaciones masivas;
- closing runs repetidos;
- posting source event masivo;
- intentos concurrentes de reversal;
- generación de periodos duplicada;
- consultas sin paginación.
```

Controles:

```text id="ykf6ep"
- paginación obligatoria;
- pageSize máximo 100;
- rate limit en posting/reversal/closing/export;
- índices por tenant/period/account/status;
- unique constraints;
- jobs futuros para reportes pesados;
- closingRun único draft/running por periodo;
- timeouts controlados;
- métricas de duración.
```

---

## 8.6. Elevation of Privilege

Amenazas:

```text id="kd5j0t"
- BoardMember intenta postear asiento;
- TenantAdmin sin permiso intenta cerrar periodo;
- Accountant intenta usar control account sin permiso especial;
- residente intenta acceder a /me/accounting;
- PlatformAdmin intenta leer ledger tenant automáticamente;
- usuario intenta enviar status directo.
```

Controles:

```text id="64pb65"
- permisos granulares;
- journalEntries.postToControlAccounts;
- accountingPeriods.reopen;
- accountingReports.export;
- no /me accounting;
- status transitions por endpoint;
- DTO whitelist/forbidNonWhitelisted;
- policy checks por caso de uso;
- audit de intentos denegados críticos.
```

---

# 9. Autenticación

## 9.1. Regla

Todos los endpoints tenant deben requerir:

```http id="1nbiau"
Authorization: Bearer <access_token>
```

---

## 9.2. Responsabilidades

```text id="fy61bz"
Keycloak autentica.
RESIDENT Core resuelve tenant.
RESIDENT Core valida membership.
RESIDENT Core valida permisos.
Accounting Ledger valida reglas contables.
```

---

## 9.3. No confiar en claims para autorización contable completa

Aunque el token incluya roles o claims, el Core debe validar:

```text id="8ft96j"
- tenant actual;
- membership activa;
- permisos vigentes;
- estado del tenant;
- permisos sobre recurso;
- políticas contables;
- estado del periodo;
- estado del asiento.
```

---

# 10. Autorización

## 10.1. Permisos críticos

```text id="q7crgw"
accountingPolicies.*
chartOfAccounts.*
accountingAccounts.*
accountingPeriods.*
accountingMappingRules.*
journalEntries.*
accountingSourceEventLinks.read
accountingClosingRuns.*
accountingReports.*
accounting.audit.read
```

---

## 10.2. Permisos de alto riesgo

```text id="ev6bc5"
journalEntries.post
journalEntries.reverse
journalEntries.postToControlAccounts
accountingPeriods.close
accountingPeriods.reopen
accountingClosingRuns.execute
accountingReports.export
accountingAccounts.manageControlAccounts
accountingMappingRules.activate
```

Regla:

```text id="zbmm9n"
Los permisos de alto riesgo deben ser asignados de forma explícita y auditados.
```

---

## 10.3. PlatformAdmin

Regla:

```text id="m743ew"
PlatformAdmin no tiene acceso automático a los libros contables de tenants.
```

Acceso excepcional:

```text id="477anf"
- debe requerir permiso explícito;
- debe requerir tenant context;
- debe auditarse como acceso excepcional;
- debe minimizar datos devueltos.
```

---

## 10.4. Resident / PropertyOwner

Regla:

```text id="akj7vs"
Residentes y propietarios no acceden a Accounting Ledger en MVP.
```

No crear:

```text id="zz5n3v"
/api/v1/me/accounting
/api/v1/me/accounting/reports
/api/v1/me/accounting/journal-entries
```

---

# 11. Multitenancy

## 11.1. Regla obligatoria

Toda tabla operativa contable debe incluir:

```text id="k63np4"
tenant_id
```

Toda query debe filtrar por:

```text id="k95wby"
tenantId = currentTenant.id
```

---

## 11.2. Patrón permitido

```typescript id="qn3sst"
await prisma.journalEntry.findFirst({
  where: {
    id: journalEntryId,
    tenantId: currentTenant.id,
    archivedAt: null
  }
});
```

---

## 11.3. Patrón prohibido

```typescript id="dr234l"
await prisma.journalEntry.findUnique({
  where: {
    id: journalEntryId
  }
});
```

---

## 11.4. Respuesta cross-tenant

Respuesta recomendada:

```text id="lcsugi"
404 Not Found
```

Razón:

```text id="39jmot"
No revelar la existencia de recursos contables de otro tenant.
```

---

## 11.5. Relaciones tenant-scoped críticas

Deben validarse contra el mismo tenant:

```text id="h8gugv"
chartOfAccountsId
parentAccountId
accountingAccountId
accountingPeriodId
accountingMappingRuleId
debitAccountId
creditAccountId
journalEntryId
journalEntryLineId
sourceEventLinkId
closingRunId
secureDocumentId
secureDocumentFileId
```

---

# 12. Seguridad de DTOs

## 12.1. Configuración obligatoria

Usar validación estricta:

```text id="g0msod"
whitelist = true
forbidNonWhitelisted = true
transform = true con cuidado
```

---

## 12.2. Campos prohibidos en requests

Los DTOs externos deben rechazar:

```text id="su5rmm"
tenantId
createdBy
updatedBy
activatedBy
disabledBy
approvedBy
postedBy
reversedBy
voidedBy
closedBy
archivedBy
status directo
totalDebit como fuente de verdad
totalCredit como fuente de verdad
journalNumber si no está permitido por política
idempotencyKey en eventos automáticos
postedAt
reversedAt
closedAt
storageKey
signedUrl
rawSql
stackTrace
payment fields
paymentAllocation fields
accountStatement mutation fields
bankReconciliation confirmation fields
externalAi flags
```

---

## 12.3. Totales

Regla:

```text id="f3yxow"
totalDebit y totalCredit siempre se calculan server-side desde JournalEntryLines.
```

El cliente puede enviar líneas, pero no puede establecer totales como fuente de verdad.

---

# 13. Seguridad monetaria

## 13.1. Decimal obligatorio

Todos los montos deben usar:

```text id="9vmcn7"
Decimal
```

Campos protegidos:

```text id="vrd05x"
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

## 13.2. Prohibido

```text id="c8a0wn"
float
double
JavaScript number como fuente de verdad
redondeo implícito
cálculo monetario en frontend como verdad
```

---

## 13.3. API

Los montos deben exponerse como string decimal:

```json id="84yc6g"
{
  "totalDebit": "125.50",
  "totalCredit": "125.50",
  "currency": "USD"
}
```

---

# 14. Seguridad de partida doble

## 14.1. Regla

Todo asiento `posted` debe cumplir:

```text id="dcg26c"
totalDebit = totalCredit
```

---

## 14.2. Controles

```text id="f3q6ou"
- validación en dominio;
- validación en servicio antes de posting;
- constraint DB para status=posted;
- tests unitarios;
- tests API;
- CI gate.
```

---

## 14.3. Líneas

Cada línea debe tener exactamente un lado:

```text id="agguwh"
debitAmount > 0 y creditAmount = 0
```

o:

```text id="v0nn25"
creditAmount > 0 y debitAmount = 0
```

Prohibido:

```text id="n1tpzk"
debitAmount > 0 y creditAmount > 0
debitAmount = 0 y creditAmount = 0
montos negativos
```

---

# 15. Seguridad de posting

## 15.1. Posting permitido

Solo puede postearse si:

```text id="c7crig"
- usuario tiene permiso journalEntries.post;
- asiento pertenece al tenant;
- asiento está en status permitido;
- tiene mínimo dos líneas;
- totalDebit = totalCredit;
- periodo está open o reopened;
- cuentas están active;
- cuentas permiten posting;
- moneda es USD;
- no viola control account policy;
- no duplica source event;
- se ejecuta en transacción.
```

---

## 15.2. Posting prohibido

```text id="4hpy6h"
- periodo locked;
- periodo closed;
- periodo archived;
- asiento sin líneas;
- asiento con una línea;
- asiento desbalanceado;
- cuenta inactive;
- cuenta archived;
- cuenta isPostingAllowed=false;
- cuenta cross-tenant;
- control account manual sin permiso;
- source event duplicado;
- Open Banking direct source en MVP.
```

---

## 15.3. Transacción

El posting debe ocurrir en una sola transacción:

```text id="jrtq2q"
1. recalcular totales;
2. validar periodo;
3. validar cuentas;
4. validar idempotencia;
5. actualizar JournalEntry a posted;
6. crear/confirmar JournalEntryLines;
7. crear AccountingSourceEventLink si aplica;
8. emitir auditoría o registrar intento.
```

---

# 16. Inmutabilidad de asientos posted

## 16.1. Regla

```text id="h0jl38"
JournalEntry.status = posted implica no modificación directa.
```

---

## 16.2. Prohibido en posted

```text id="o05g3u"
- cambiar entryDate;
- cambiar postingDate;
- cambiar description;
- cambiar totalDebit;
- cambiar totalCredit;
- cambiar currency;
- cambiar accountingPeriodId;
- cambiar sourceModule;
- cambiar sourceResourceId;
- cambiar sourceEventType;
- cambiar líneas;
- eliminar líneas;
- agregar líneas;
- borrar asiento.
```

---

## 16.3. Corrección permitida

```text id="bsl7gf"
posted JournalEntry
  -> reversal JournalEntry
  -> correcting JournalEntry si aplica
```

---

# 17. Seguridad de reversos

## 17.1. Reglas

```text id="qvtkfc"
- solo puede reversarse un asiento posted;
- requiere permiso journalEntries.reverse;
- requiere razón;
- crea nuevo asiento type=reversal;
- invierte líneas debit/credit;
- usa nuevo journalNumber;
- referencia reversalOfJournalEntryId;
- no edita el asiento original salvo punteros/status permitidos;
- debe postear en periodo open/reopened;
- debe auditarse.
```

---

## 17.2. Prohibido

```text id="4vutxa"
- reversar draft;
- reversar voided;
- reversar archived;
- reversar sin reason;
- editar asiento original;
- duplicar reverso por concurrencia;
- reversar en periodo closed;
- reversar con líneas incompletas.
```

---

# 18. Seguridad de source events e idempotencia

## 18.1. Identidad de source event

```text id="kuqdaz"
tenantId
sourceModule
sourceResourceType
sourceResourceId
sourceEventType
```

---

## 18.2. Idempotency key

Debe calcularse server-side:

```text id="tov64j"
sha256(tenantId + sourceModule + sourceResourceType + sourceResourceId + sourceEventType)
```

---

## 18.3. Reglas

```text id="ak9zf9"
- no aceptar idempotencyKey externo para eventos automáticos;
- no exponer idempotencyKey completo en DTO estándar;
- un source event activo no genera dos JournalEntries;
- retries deben ser idempotentes;
- tenant distinto no colisiona;
- sourceEventType distinto no colisiona;
- reversal usa evento contable separado.
```

---

## 18.4. Source event permitido en MVP

```text id="hjr5b7"
charge.issued
charge.adjusted
charge.reversed
payment.allocated
payment.reversed
```

---

## 18.5. Source event restringido/futuro

```text id="pw11q4"
bankTransaction.reconciled
bankFee.detected
bankInterest.detected
providerSettlement.reviewed
providerFee.confirmed
```

Estos requieren feature flags y revisión adicional.

---

## 18.6. Source event prohibido en MVP

```text id="eschtj"
openBankingTransaction.imported
openBankingTransaction.sentToReconciliation
```

Regla:

```text id="hfifqc"
Open Banking no genera JournalEntries directos en MVP.
```

---

# 19. Seguridad de periodos contables

## 19.1. Estados

```text id="4tb5em"
open
locked
closed
reopened
archived
```

---

## 19.2. Posting permitido

```text id="dfhhxf"
open
reopened
```

---

## 19.3. Posting prohibido

```text id="7a9vvx"
locked
closed
archived
```

---

## 19.4. Reapertura

Reabrir un periodo cerrado requiere:

```text id="h5nmho"
- accountingPeriods.reopen;
- razón obligatoria;
- auditoría reforzada;
- registro de reopenedAt/reopenedBy;
- evaluación de impacto sobre cierres y snapshots;
- no permitir reapertura silenciosa.
```

---

## 19.5. Cierre

Cerrar periodo requiere:

```text id="h8p6ys"
- accountingPeriods.close o accountingClosingRuns.execute;
- trial balance cuadrado;
- no asientos críticos draft si la política lo exige;
- no asientos desbalanceados;
- transacción;
- auditoría;
- snapshots si aplica.
```

---

# 20. Seguridad de cuentas contables

## 20.1. Account code

Reglas:

```text id="rckbal"
- único por tenant/chart;
- validado contra caracteres inseguros;
- no debe cambiarse libremente si tiene movimientos posted;
- cambios deben auditarse.
```

---

## 20.2. Jerarquía

Reglas:

```text id="3yw4ol"
- parentAccount pertenece al mismo tenant;
- parentAccount pertenece al mismo chart;
- no se permiten ciclos;
- level se calcula server-side;
- cuentas agrupadoras pueden tener isPostingAllowed=false.
```

---

## 20.3. Control accounts

Cuentas de control:

```text id="d5ad3a"
AccountsReceivable
Cash
Bank
PaymentClearing
ProviderSettlementClearing
DuesRevenue
FinesRevenue
ReservationRevenue
BankFeesExpense
```

Reglas:

```text id="rtm8qc"
- automatic posting puede usar control accounts mediante mapping rule activa;
- manual posting a control account requiere journalEntries.postToControlAccounts;
- cambio de isControlAccount requiere accountingAccounts.manageControlAccounts;
- todo uso manual de control account debe auditarse.
```

---

# 21. Seguridad de mapping rules

## 21.1. Activación segura

Una regla solo puede activarse si:

```text id="w1q52i"
- pertenece al tenant;
- tiene sourceModule válido;
- tiene sourceEventType válido;
- tiene sourceResourceType válido;
- debitAccount pertenece al tenant;
- creditAccount pertenece al tenant;
- debitAccount y creditAccount están active;
- cuentas permiten posting;
- effectiveFrom/effectiveTo son válidos;
- no crea ambigüedad peligrosa.
```

---

## 21.2. Riesgos

```text id="przyaa"
- regla apunta a cuenta equivocada;
- regla cruza tenant;
- regla activa histórica se modifica y altera trazabilidad conceptual;
- amountSource incorrecto;
- sourceEventType demasiado genérico;
- priority mal definida.
```

---

## 21.3. Controles

```text id="g3jr0m"
- AccountingMappingRuleActivationPolicy;
- validación tenant-scoped de cuentas;
- versionamiento futuro si se requiere;
- auditoría de cambios;
- pruebas de eventos fuente;
- no aplicar regla si no existe mapping activo confiable.
```

---

# 22. Seguridad de reportes

## 22.1. Regla

Los reportes contables derivan de:

```text id="pzxwur"
JournalEntries posted
JournalEntryLines posted
```

No derivan directamente de:

```text id="trrehi"
Charges
Payments
AccountStatements
BankTransactions
OpenBankingTransactions
```

---

## 22.2. Reportes protegidos

```text id="zbrwhb"
General Journal
General Ledger
Trial Balance
Income and Expense
Basic Balance Sheet
```

---

## 22.3. Controles

```text id="c3i0f4"
- accountingReports.read;
- permiso específico por reporte;
- tenantId obligatorio en queries;
- paginación;
- pageSize máximo 100;
- filtros validados;
- no datos tenant B;
- no export sin permiso;
- no response masiva sin control;
- Cache-Control: no-store.
```

---

## 22.4. Trial balance

Debe validar:

```text id="nf113e"
totalDebit = totalCredit
```

Si no cuadra:

```text id="85m9q9"
- reportarlo como isBalanced=false;
- impedir cierre exitoso;
- auditar anomalía si se ejecuta closing run.
```

---

# 23. Seguridad de exports

## 23.1. Regla

Todo export persistido debe usar Secure Document Storage.

```text id="nu34su"
sourceModule = accountingLedger
visibility = administrative
sensitivity = restricted
```

---

## 23.2. Prohibido

```text id="nqki15"
- exponer storageKey;
- exponer signedUrl persistente;
- adjuntar export a endpoint público;
- enviar export a WordPress;
- enviar export a IA externa;
- generar export sin permiso accountingReports.export;
- generar export cross-tenant.
```

---

## 23.3. Respuesta segura

Permitido:

```json id="cr8pgv"
{
  "secureDocumentId": "secure_document_uuid",
  "secureDocumentFileId": "secure_document_file_uuid",
  "downloadAvailable": true
}
```

No permitido:

```json id="is76fe"
{
  "storageKey": "documents/tenant/...",
  "signedUrl": "https://..."
}
```

---

# 24. Seguridad de balance snapshots

## 24.1. Regla

```text id="rom6qq"
AccountingBalanceSnapshot no es fuente primaria.
```

Fuente primaria:

```text id="bsz2ax"
JournalEntryLines posted
```

---

## 24.2. Riesgos

```text id="s3anzl"
- manipular snapshots para alterar reportes;
- regenerar snapshots sin control;
- usar snapshots obsoletos;
- mezclar snapshots cross-tenant;
- cerrar periodo con snapshots inconsistentes.
```

---

## 24.3. Controles

```text id="pjqroj"
- snapshots generados por closing run;
- tenantId obligatorio;
- relation con period/account/closingRun;
- montos no negativos;
- auditoría;
- reportes críticos pueden recalcular desde ledger posted si hay duda;
- no edición manual ordinaria.
```

---

# 25. Seguridad de closing runs

## 25.1. Riesgos

```text id="pn6n1i"
- cerrar periodo con asientos desbalanceados;
- cerrar periodo con drafts críticos;
- ejecutar cierres concurrentes;
- cerrar periodo equivocado;
- cerrar periodo de otro tenant;
- cerrar periodo sin permisos;
- cerrar periodo y luego seguir posteando.
```

---

## 25.2. Controles

```text id="t6q95q"
- accountingClosingRuns.execute;
- accountingPeriods.close;
- unique draft/running closingRun por periodo;
- transacción;
- trial balance validation;
- draft entries validation;
- period status check;
- closing run status machine;
- no close on failure;
- audit started/completed/failed;
- closed period blocks posting.
```

---

## 25.3. Reapertura posterior

Reabrir debe:

```text id="dutdus"
- requerir permiso específico;
- requerir razón;
- auditar;
- preservar historial de closing runs;
- no borrar snapshots anteriores sin flujo controlado;
- permitir correcciones solo con asiento de reverso/correctivo.
```

---

# 26. Seguridad frente a módulos operativos

## 26.1. Payments

Prohibido:

```text id="z9rgwf"
- crear Payment;
- crear PaymentAllocation;
- crear PaymentReversal;
- modificar Payment.status;
- validar Payment;
- emitir comprobante;
- marcar Payment reconciled.
```

Permitido:

```text id="ullbac"
- recibir evento payment.allocated;
- crear JournalEntry automático;
- crear source link;
- consultar referencia read-only si es necesario.
```

---

## 26.2. Account Statements

Prohibido:

```text id="vjcz8m"
- crear statement lines;
- modificar balances operativos;
- recalcular saldos de residente desde Accounting Ledger;
- sustituir Account Statements.
```

Permitido:

```text id="kg2w3y"
- comparar saldos operativos vs contables en reportes internos;
- no mutar.
```

---

## 26.3. Bank Reconciliation

Prohibido:

```text id="lrxfgf"
- crear ReconciliationMatch;
- marcar BankTransaction como matched;
- cerrar ReconciliationSession;
- confirmar conciliación final;
- marcar Payment reconciled.
```

Permitido:

```text id="2hmrua"
- recibir evento reconciled ya confirmado;
- contabilizar efecto posterior si feature flag y mapping rule lo permiten.
```

---

## 26.4. Payment Provider Integration

Prohibido:

```text id="r3o3xv"
- alterar ProviderPaymentMapping;
- marcar settlement reconciled desde Accounting;
- resolver chargebacks automáticamente;
- crear refunds.
```

Permitido:

```text id="v4zpy1"
- contabilizar providerFee.confirmed o providerSettlement.reviewed si feature flag está activo.
```

---

## 26.5. Open Banking

Prohibido en MVP:

```text id="ry1lvg"
- Open Banking direct posting;
- contabilizar openBankingTransaction.imported;
- contabilizar openBankingTransaction.sentToReconciliation;
- crear asientos desde movimientos bancarios no conciliados.
```

Permitido:

```text id="nmsxpw"
- Open Banking alimenta Bank Reconciliation;
- Accounting recibe efectos posteriores desde fuentes autorizadas.
```

---

# 27. Seguridad de WordPress

## 27.1. Regla

```text id="gz98yg"
WordPress no accede a Accounting Ledger.
```

---

## 27.2. Prohibido

```text id="7a6wxv"
- endpoints públicos contables;
- endpoints consumibles por portal público;
- CORS para rutas accounting desde dominios WordPress públicos;
- widgets WordPress con ledger;
- exposición de reportes contables en portal público;
- enlaces directos a exports contables.
```

---

## 27.3. Controles

```text id="rf7rle"
- no registrar /api/v1/public/accounting;
- no registrar /api/v1/public/tenants/{slug}/accounting;
- no registrar /api/v1/me/accounting;
- CORS restrictivo;
- Cache-Control no-store;
- OpenAPI sin rutas públicas contables.
```

---

# 28. Seguridad de IA

## 28.1. Regla

```text id="io6uqr"
No enviar datos contables reales a servicios externos de IA en MVP.
```

---

## 28.2. Prohibido enviar a IA

```text id="tqxrmt"
journal entries reales
journal lines reales
balances reales
trial balance real
general ledger real
general journal real
exports reales
sourceResourceIds reales
tenantId real
datos bancarios reales
datos de pagos reales
datos de residentes reales
metadata contable sensible
```

---

## 28.3. Permitido

```text id="9fhgi1"
- documentación;
- código;
- fixtures sintéticos;
- ejemplos ficticios;
- datos anonimizados bajo política futura;
- pruebas locales sin datos productivos.
```

---

## 28.4. Feature flag

Debe permanecer:

```text id="96nfju"
ACCOUNTING_EXTERNAL_AI_ENABLED=false
accountingLedger.externalAi.enabled=false
```

---

# 29. Seguridad de logs

## 29.1. Logs permitidos

```text id="rytnkp"
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

## 29.2. Campos permitidos

```text id="jgaff7"
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

## 29.3. Campos prohibidos

```text id="s1i1sl"
tenantId como label
userId como label
journalEntryId como label
accountingAccountId como label
sourceResourceId como label
paymentId como label
chargeId como label
bankTransactionId como label
traceId como métrica label
raw payload
storageKey
signedUrl
SQL raw
stack trace en producción
```

---

# 30. Seguridad de métricas

## 30.1. Métricas permitidas

```text id="upga7g"
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

## 30.2. Labels permitidos

```text id="fgdqx4"
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

## 30.3. Labels prohibidos

```text id="omh7s3"
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

# 31. Seguridad de auditoría

## 31.1. Eventos obligatorios

```text id="lv5gx1"
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

## 31.2. Auditoría reforzada

Obligatoria para:

```text id="a2ptkd"
- activar política contable;
- activar plan de cuentas;
- cambiar cuenta de control;
- postear manualmente en cuenta de control;
- postear asiento;
- rechazar asiento desbalanceado;
- detectar source event duplicado;
- reversar asiento;
- cerrar periodo;
- reabrir periodo;
- exportar reporte;
- acceso excepcional platform.
```

---

## 31.3. Metadata permitida

```text id="ssukrw"
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

## 31.4. Metadata prohibida

```text id="l0wkoz"
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

# 32. Seguridad de OpenAPI

## 32.1. Extensiones requeridas

Endpoints tenant:

```yaml id="iq1jz9"
x-tenant-scope: true
x-auth-required: true
x-accounting-ledger: true
x-public-exposure: false
```

Journal entries:

```yaml id="8fnmqq"
x-double-entry-required: true
x-posted-entry-immutable: true
x-source-linked: true
x-idempotent-source-event: true
```

Closing:

```yaml id="h4vsnx"
x-period-aware: true
x-closing-operation: true
x-audit-required: true
```

Reports:

```yaml id="8sfn3w"
x-accounting-report: true
x-derived-from-posted-ledger: true
x-export-via-secure-document-storage: true
```

Restricciones:

```yaml id="eunica"
x-creates-payment: false
x-updates-account-statement: false
x-confirms-bank-reconciliation: false
x-public-endpoint: false
```

---

## 32.2. OpenAPI no debe documentar

```text id="kj48tz"
/api/v1/public/accounting
/api/v1/public/tenants/{slug}/accounting
/api/v1/me/accounting
```

---

# 33. Headers y cache

## 33.1. Headers recomendados

Para endpoints contables:

```http id="tuj00h"
Cache-Control: no-store
Pragma: no-cache
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
```

---

## 33.2. CORS

Regla:

```text id="zdg46k"
Rutas de Accounting Ledger no deben habilitarse para consumo desde portales públicos WordPress.
```

---

# 34. Rate limiting

Aplicar rate limit más estricto en:

```text id="7ske71"
POST /tenant/accounting/journal-entries/{id}/post
POST /tenant/accounting/journal-entries/{id}/reverse
POST /tenant/accounting/posting/source-events
POST /tenant/accounting/closing-runs/{id}/execute
GET  /tenant/accounting/reports/export
```

Motivo:

```text id="ejrmzu"
Estas operaciones tienen impacto financiero, contable, de performance o de confidencialidad.
```

---

# 35. Concurrencia

## 35.1. Riesgos

```text id="ztweph"
- dos postings del mismo asiento;
- dos source events iguales;
- dos reversos del mismo asiento;
- dos closing runs del mismo periodo;
- cierre y posting simultáneo;
- journalNumber duplicado;
- accountCode duplicado.
```

---

## 35.2. Controles

```text id="hvw5fr"
- transacciones DB;
- unique constraints;
- locks optimistas o pesimistas según operación;
- idempotencyKey único;
- unique journalNumber;
- unique running closingRun;
- relectura de estado antes de confirmar;
- respuesta idempotente en retries seguros.
```

---

# 36. Backups y restauración

## 36.1. Requisitos

Backups deben preservar consistencia entre:

```text id="79om0w"
journal_entries
journal_entry_lines
accounting_source_event_links
accounting_periods
accounting_balance_snapshots
accounting_closing_runs
audit_logs
secure_documents relacionados
```

---

## 36.2. Restauración

Después de restaurar backup se debe validar:

```text id="pqc5uh"
- totalDebit = totalCredit en posted entries;
- source event links no duplicados;
- journalNumber único;
- periods coherentes;
- closing runs coherentes;
- reports recalculables;
- exports no referencian storage inexistente;
- audit logs presentes.
```

---

# 37. Pruebas de seguridad obligatorias

```text id="awid2z"
- no tenantId body;
- no actor fields body;
- no status directo;
- no totalDebit/totalCredit client source;
- no postedAt desde cliente;
- no cross-tenant policy;
- no cross-tenant chart;
- no cross-tenant account;
- no cross-tenant period;
- no cross-tenant mapping rule;
- no cross-tenant journal entry;
- no cross-tenant line;
- no cross-tenant source link;
- no cross-tenant closing run;
- no cross-tenant report;
- posted immutable;
- unbalanced rejected;
- duplicate source rejected;
- closed period posting rejected;
- control account manual posting rejected without permission;
- no Payment creation;
- no Account Statements mutation;
- no Bank Reconciliation confirmation;
- no Open Banking direct posting;
- no public accounting endpoints;
- no /me accounting endpoints;
- no WordPress access;
- external AI disabled.
```

---

# 38. CI/CD security gates

El pipeline debe fallar si:

```text id="om0lmm"
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
- logs contienen payloads completos;
- logs contienen storageKey;
- audit contiene datos prohibidos;
- externalAi está habilitado por defecto.
```

---

# 39. Checklist de revisión de seguridad

```text id="fohswt"
[ ] Todas las tablas operativas tienen tenant_id.
[ ] Todas las queries críticas filtran por tenantId.
[ ] No se usa findUnique por id simple en entidades tenant-scoped.
[ ] DTOs rechazan tenantId.
[ ] DTOs rechazan actor fields.
[ ] DTOs rechazan status directo.
[ ] DTOs rechazan totalDebit/totalCredit como fuente de verdad.
[ ] Montos usan Decimal.
[ ] No hay float/double para dinero.
[ ] JournalEntry posted no se puede editar.
[ ] JournalEntry posted no se puede borrar.
[ ] Posting recalcula totales.
[ ] Posting valida debit=credit.
[ ] Posting valida periodo open/reopened.
[ ] Posting rechaza periodo closed.
[ ] Posting rechaza cuenta inactive.
[ ] Posting rechaza cuenta no posteable.
[ ] Manual posting a control account requiere permiso.
[ ] Reversal crea asiento inverso.
[ ] Reversal requiere razón.
[ ] Source event idempotency funciona.
[ ] Open Banking direct posting está bloqueado.
[ ] Ledger no crea Payment.
[ ] Ledger no crea PaymentAllocation.
[ ] Ledger no modifica Account Statements.
[ ] Ledger no crea ReconciliationMatch.
[ ] Ledger no marca BankTransaction matched.
[ ] Reports derivan de posted ledger.
[ ] Reports son tenant-scoped.
[ ] Exports usan Secure Document Storage.
[ ] Exports no exponen storageKey.
[ ] No existen endpoints públicos contables.
[ ] No existen endpoints /me accounting.
[ ] WordPress no accede a accounting.
[ ] IA externa está deshabilitada para datos reales.
[ ] Audit está sanitizada.
[ ] Logs están sanitizados.
[ ] Métricas no tienen labels sensibles.
[ ] OpenAPI tiene extensiones de seguridad.
[ ] CI/CD gates están activos.
```

---

# 40. No aceptación

No aceptar la implementación si:

```text id="qqz212"
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
- permite accounting report cross-tenant;
- acepta tenantId desde body;
- acepta actor fields desde body;
- acepta status directo sin endpoint de transición;
- usa findUnique por id simple en entidades tenant-scoped;
- acepta totalDebit como fuente de verdad del cliente;
- acepta totalCredit como fuente de verdad del cliente;
- permite postear asiento sin líneas;
- permite postear asiento con una sola línea;
- permite postear asiento desbalanceado;
- permite línea con debit y credit simultáneos;
- permite línea con ambos montos cero;
- permite línea con monto negativo;
- permite postear con cuenta inactive;
- permite postear con cuenta archived;
- permite postear en cuenta no posteable;
- permite postear manualmente en control account sin permiso;
- permite editar JournalEntry posted;
- permite borrar JournalEntry posted;
- permite reversar JournalEntry draft;
- permite reversar sin razón;
- duplica asiento por mismo source event;
- permite postear en periodo locked;
- permite postear en periodo closed;
- permite postear en periodo archived;
- cierra periodo con trial balance desbalanceado;
- cierra periodo con errores críticos sin registrarlos;
- reportes derivan directamente de Charges/Payments sin JournalEntries posted;
- ledger crea Payment;
- ledger crea PaymentAllocation;
- ledger modifica Account Statements;
- ledger crea ReconciliationMatch;
- ledger marca BankTransaction matched;
- ledger cierra ReconciliationSession;
- Open Banking genera JournalEntry directo en MVP;
- existe endpoint público contable;
- existe endpoint /me contable;
- WordPress accede a datos contables;
- datos contables reales se envían a IA externa;
- audit no está sanitizada;
- logs contienen payloads completos;
- logs contienen storageKey;
- logs contienen stack trace productivo;
- métricas usan labels sensibles;
- se usa float/double para dinero.
```

---

# 41. Resultado esperado

Al aplicar estas notas de seguridad, el módulo `020-accounting-ledger` debe quedar protegido como una capa contable interna, privada, trazable y consistente.

Resultado esperado:

```text id="mkzf18"
tenant isolation protegido
autorización granular aplicada
partida doble obligatoria
Decimal money obligatorio
posted entries inmutables
reversos auditados
source event idempotency protegida
periodos cerrados protegidos
control accounts protegidas
mapping rules validadas
reports derivados de ledger posted
exports restringidos vía Secure Document Storage
closing runs controlados
audit sanitizada
logs sanitizados
métricas seguras
OpenAPI sin rutas públicas
sin endpoints /me accounting
sin acceso desde WordPress
sin Payment auto-creation
sin PaymentAllocation auto-creation
sin Account Statements mutation
sin Bank Reconciliation final confirmation
sin Open Banking direct posting
sin IA externa con datos reales
CI/CD gates de seguridad activos
```

---

# 42. Expediente actualizado

```text id="hls41l"
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
│   │       ├── tasks.md
│   │       └── security-notes.md
```

---

# 43. Cierre del paquete 020

Con este documento queda completo el paquete SDD del módulo:

```text id="hsg3a1"
docs/specs/020-accounting-ledger/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

El módulo `020-accounting-ledger` queda listo como especificación formal para implementación posterior del ledger contable interno de RESIDENT Core.
