# API Contract — Spec 020 Accounting Ledger

## 1. Información del documento

| Campo           | Valor                                                                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Proyecto        | RESIDENT Core                                                                                                                                    |
| Spec ID         | 020                                                                                                                                              |
| Módulo          | Accounting Ledger                                                                                                                                |
| Documento       | API Contract                                                                                                                                     |
| Ruta            | `docs/specs/020-accounting-ledger/api-contract.md`                                                                                               |
| Versión         | 0.1                                                                                                                                              |
| Estado          | Borrador inicial                                                                                                                                 |
| Fecha           | 2026-07-23                                                                                                                                       |
| Documento base  | `docs/specs/020-accounting-ledger/spec.md`                                                                                                       |
| Plan técnico    | `docs/specs/020-accounting-ledger/plan.md`                                                                                                       |
| Modelo de datos | `docs/specs/020-accounting-ledger/data-model.md`                                                                                                 |
| API Style       | REST                                                                                                                                             |
| API Version     | `/api/v1`                                                                                                                                        |
| Naturaleza      | Tenant-scoped / Double-entry / Source-linked / Posting-driven / Period-aware / Immutable-after-posting / Audit-heavy / Report-ready / Non-public |

---

## 2. Propósito

Este documento define el contrato REST del módulo `020-accounting-ledger`.

El contrato cubre endpoints, permisos, DTOs, filtros, respuestas, errores, reglas de autenticación, autorización, multitenancy, idempotencia, validación de partida doble, posting, reversos, cierres contables, reportes, exportaciones, auditoría, observabilidad y OpenAPI.

Regla central:

```text id="juzk1j"
Toda API de Accounting Ledger debe ser autenticada, tenant-scoped, no pública, no expuesta por /me en MVP, basada en permisos, compatible con partida doble, inmutable después de posting, idempotente para eventos fuente, period-aware, audit-heavy, segura para reportes contables y sin capacidad para crear pagos, modificar estados de cuenta, confirmar conciliación bancaria o exponer datos contables a WordPress.
```

---

## 3. Principios generales de API

### 3.1. Base path

```text id="cbqj65"
/api/v1
```

---

### 3.2. Superficie tenant

Todas las APIs contables MVP son tenant-scoped:

```text id="pqx2j1"
/api/v1/tenant/accounting
```

---

### 3.3. Superficie platform

No se define Platform API obligatoria para el MVP.

Razón:

```text id="tgp22f"
El MVP usa plan de cuentas por tenant. Las plantillas globales platform-scoped pueden incorporarse después.
```

---

### 3.4. Superficie `/me`

No existe API `/me` para Accounting Ledger en MVP.

Regla:

```text id="prk1c6"
Residentes, propietarios y usuarios comunes no consultan ledger contable, asientos, cuentas, libro diario, libro mayor ni reportes contables en MVP.
```

---

### 3.5. Superficie pública

No existe API pública para Accounting Ledger.

Prohibido:

```text id="ttifus"
/api/v1/public/accounting
/api/v1/public/tenants/{slug}/accounting
```

---

## 4. Autenticación

Todos los endpoints tenant requieren:

```http id="vrnb24"
Authorization: Bearer <access_token>
```

Responsabilidades:

```text id="as2olt"
Keycloak autentica usuarios.
RESIDENT Core autoriza tenant, membership, roles, permisos, recurso y regla contable.
Accounting Ledger aplica políticas contables, periodo, partida doble e inmutabilidad.
```

---

## 5. Tenant efectivo

El tenant efectivo se obtiene desde el contexto autenticado:

```text id="ktry71"
currentTenant.id
```

Prohibido aceptar `tenantId` desde:

```text id="kc661f"
body
query
path
headers no confiables
```

Respuesta recomendada ante recurso cross-tenant:

```text id="chrys2"
404 Not Found
```

Motivo:

```text id="k0w0ew"
No revelar existencia de recursos contables de otro tenant.
```

---

## 6. Formato general

### 6.1. JSON

Requests y responses usan JSON `camelCase`.

Base de datos usa `snake_case`.

---

### 6.2. Fechas

Usar ISO 8601.

Ejemplo:

```text id="v2ibrw"
2026-07-23T10:30:00-05:00
```

Internamente se normaliza a UTC.

---

### 6.3. Dinero

Montos como string decimal:

```json id="m4ssv3"
{
  "debitAmount": "125.50",
  "creditAmount": "0.00",
  "currency": "USD"
}
```

Prohibido usar `number`, `float` o `double` como fuente de verdad monetaria.

---

### 6.4. Paginación

Parámetros estándar:

```text id="euxob7"
page
pageSize
sortBy
sortOrder
```

Reglas:

```text id="ifivff"
page >= 1
pageSize default = 20
pageSize max = 100
sortOrder = asc | desc
```

---

### 6.5. Respuesta estándar

```json id="fzyh50"
{
  "data": {},
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

### 6.6. Error estándar

```json id="lto3ah"
{
  "error": {
    "code": "JOURNAL_ENTRY_UNBALANCED",
    "message": "Journal entry is unbalanced.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

## 7. Headers

### 7.1. Headers generales

```http id="ndopmr"
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
X-Request-Id: <request-id>
X-Correlation-Id: <correlation-id>
Idempotency-Key: <idempotency-key>
```

---

### 7.2. `Idempotency-Key`

Recomendado en operaciones sensibles:

```text id="xlbwuc"
- crear asiento manual;
- postear asiento;
- reversar asiento;
- crear cierre contable;
- ejecutar cierre contable;
- exportar reporte;
```

Para asientos automáticos desde eventos fuente, la idempotencia principal se calcula server-side mediante:

```text id="nahvg5"
tenantId + sourceModule + sourceResourceType + sourceResourceId + sourceEventType
```

---

## 8. Seguridad transversal

### 8.1. Reglas obligatorias

```text id="hgkd9s"
- no aceptar tenantId desde body;
- no aceptar actor fields desde body;
- no aceptar status directo salvo endpoint de transición;
- no aceptar totalDebit como fuente de verdad;
- no aceptar totalCredit como fuente de verdad;
- no aceptar postedAt desde cliente;
- no aceptar reversedAt desde cliente;
- no aceptar closedAt desde cliente;
- no permitir edición de JournalEntry posted;
- no permitir posting desbalanceado;
- no permitir posting en periodo closed;
- no permitir posting manual en cuenta de control sin permiso especial;
- no permitir source event duplicado;
- no crear Payment;
- no crear PaymentAllocation;
- no modificar Account Statements;
- no crear ReconciliationMatch;
- no marcar conciliación bancaria final;
- no contabilizar directamente OpenBankingTransaction en MVP;
- no exponer endpoints públicos;
- no exponer endpoints /me;
- no permitir acceso desde WordPress;
- no enviar datos contables reales a IA externa.
```

---

### 8.2. Datos prohibidos en responses

```text id="mvjt9u"
tenantId
tokens
secrets
passwords
storageKey
signedUrl persistente
raw provider payload
raw bank payload
SQL raw
stack trace
datos cross-tenant
idempotencyKey interno salvo permiso técnico
datos contables masivos no paginados
```

---

## 9. Permisos

### 9.1. Accounting policies

```text id="o333wg"
accountingPolicies.create
accountingPolicies.read
accountingPolicies.update
accountingPolicies.activate
accountingPolicies.disable
accountingPolicies.archive
```

---

### 9.2. Chart of accounts

```text id="xgeqfr"
chartOfAccounts.create
chartOfAccounts.read
chartOfAccounts.update
chartOfAccounts.activate
chartOfAccounts.archive
```

---

### 9.3. Accounting accounts

```text id="s1edme"
accountingAccounts.create
accountingAccounts.read
accountingAccounts.update
accountingAccounts.activate
accountingAccounts.disable
accountingAccounts.archive
accountingAccounts.manageControlAccounts
```

---

### 9.4. Accounting periods

```text id="auf660"
accountingPeriods.create
accountingPeriods.read
accountingPeriods.update
accountingPeriods.lock
accountingPeriods.close
accountingPeriods.reopen
accountingPeriods.archive
```

---

### 9.5. Mapping rules

```text id="t34he4"
accountingMappingRules.create
accountingMappingRules.read
accountingMappingRules.update
accountingMappingRules.activate
accountingMappingRules.disable
accountingMappingRules.archive
```

---

### 9.6. Journal entries

```text id="jrfjc2"
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

### 9.7. Source event links

```text id="p5r3s8"
accountingSourceEventLinks.read
```

---

### 9.8. Closing runs

```text id="zy7yoq"
accountingClosingRuns.create
accountingClosingRuns.read
accountingClosingRuns.execute
accountingClosingRuns.cancel
accountingClosingRuns.archive
```

---

### 9.9. Reports

```text id="kg0ij4"
accountingReports.read
accountingReports.export
accountingReports.trialBalance
accountingReports.generalLedger
accountingReports.generalJournal
accountingReports.incomeExpense
accountingReports.balanceSheet
```

---

### 9.10. Audit

```text id="k35tpq"
accounting.audit.read
```

---

## 10. Enums expuestos por API

### 10.1. `AccountingPolicyStatus`

```text id="z5afgn"
draft
active
inactive
archived
```

---

### 10.2. `AccountingMethod`

```text id="wzyesr"
cash
accrual
hybrid
```

---

### 10.3. `JournalNumberingMode`

```text id="xmifj9"
systemSequential
periodSequential
manualWithValidation
```

---

### 10.4. `ChartOfAccountsStatus`

```text id="uok4of"
draft
active
inactive
archived
```

---

### 10.5. `AccountingAccountType`

```text id="jh7esu"
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

```text id="rsfopt"
asset
liability
equity
income
expense
```

---

### 10.6. `NormalBalance`

```text id="nyq08b"
debit
credit
```

---

### 10.7. `AccountingAccountStatus`

```text id="fchr1e"
draft
active
inactive
archived
```

---

### 10.8. `AccountingPeriodType`

```text id="gcmcxx"
monthly
quarterly
annual
custom
```

MVP recomendado:

```text id="mur64b"
monthly
annual
```

---

### 10.9. `AccountingPeriodStatus`

```text id="i0gpnf"
open
locked
closed
reopened
archived
```

---

### 10.10. `AccountingMappingRuleStatus`

```text id="ivtwpy"
draft
active
inactive
archived
```

---

### 10.11. `JournalEntryType`

```text id="n9lo81"
automatic
manual
reversal
adjustment
closing
opening
migration
```

---

### 10.12. `JournalEntryStatus`

```text id="qzawag"
draft
pendingApproval
approved
posted
reversed
voided
archived
```

---

### 10.13. `JournalEntrySourceType`

```text id="f5ouvf"
system
manual
integration
migration
closing
```

---

### 10.14. `AccountingSourceModule`

```text id="ygue76"
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

### 10.15. `AccountingSourceEventLinkStatus`

```text id="jgdlwd"
active
reversed
superseded
archived
```

---

### 10.16. `AccountingClosingRunStatus`

```text id="uqctxn"
draft
running
completed
completedWithWarnings
failed
cancelled
archived
```

---

### 10.17. `Currency`

```text id="ige3dk"
USD
```

---

# 11. API — Accounting Policies

## 11.1. `GET /api/v1/tenant/accounting/policies`

Lista políticas contables del tenant.

### Permiso

```text id="ufxhvm"
accountingPolicies.read
```

### Query params

```text id="j10wtf"
status
baseCurrency
accountingMethod
createdFrom
createdTo
page
pageSize
sortBy
sortOrder
```

### Response `200`

```json id="z39fqk"
{
  "data": [
    {
      "id": "accounting_policy_uuid",
      "baseCurrency": "USD",
      "accountingMethod": "accrual",
      "fiscalYearStartMonth": 1,
      "fiscalYearStartDay": 1,
      "journalNumberingMode": "periodSequential",
      "allowManualEntries": true,
      "requireApprovalForManualEntries": false,
      "allowPostingToClosedPeriod": false,
      "allowPostingToControlAccounts": false,
      "protectedControlAccountsEnabled": true,
      "status": "active",
      "createdAt": "2026-07-23T10:00:00Z",
      "updatedAt": "2026-07-23T10:10:00Z",
      "activatedAt": "2026-07-23T10:10:00Z"
    }
  ],
  "meta": {
    "traceId": "req_123456",
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

---

## 11.2. `POST /api/v1/tenant/accounting/policies`

Crea política contable.

### Permiso

```text id="kguyxo"
accountingPolicies.create
```

### Request body

```json id="gv0j34"
{
  "baseCurrency": "USD",
  "accountingMethod": "accrual",
  "fiscalYearStartMonth": 1,
  "fiscalYearStartDay": 1,
  "journalNumberingMode": "periodSequential",
  "allowManualEntries": true,
  "requireApprovalForManualEntries": false,
  "allowPostingToClosedPeriod": false,
  "allowPostingToControlAccounts": false,
  "protectedControlAccountsEnabled": true,
  "metadata": {
    "notes": "Política contable inicial"
  }
}
```

### Reglas

```text id="ftwobq"
- tenant activo requerido;
- baseCurrency MVP = USD;
- allowPostingToClosedPeriod debe ser false;
- status inicial draft;
- no activar automáticamente salvo decisión explícita;
- audita accountingPolicy.created.
```

### Response `201`

```json id="mpz9mu"
{
  "data": {
    "id": "accounting_policy_uuid",
    "baseCurrency": "USD",
    "accountingMethod": "accrual",
    "status": "draft",
    "createdAt": "2026-07-23T10:00:00Z",
    "updatedAt": "2026-07-23T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Rechazar

```text id="cl2p8x"
tenantId
createdBy
updatedBy
activatedBy
status
allowPostingToClosedPeriod=true en MVP
externalAi flags
```

---

## 11.3. `GET /api/v1/tenant/accounting/policies/{policyId}`

Obtiene política contable.

### Permiso

```text id="c9f0ix"
accountingPolicies.read
```

### Response `200`

Devuelve `AccountingPolicyDto`.

---

## 11.4. `PATCH /api/v1/tenant/accounting/policies/{policyId}`

Actualiza política en estado editable.

### Permiso

```text id="f00xyq"
accountingPolicies.update
```

### Request body

```json id="fno3t5"
{
  "accountingMethod": "accrual",
  "fiscalYearStartMonth": 1,
  "fiscalYearStartDay": 1,
  "journalNumberingMode": "periodSequential",
  "allowManualEntries": true,
  "requireApprovalForManualEntries": false,
  "allowPostingToControlAccounts": false,
  "metadata": {
    "notes": "Actualización de política"
  }
}
```

### Reglas

```text id="mgyofe"
- no cambia tenantId;
- no cambia status directo;
- no permite allowPostingToClosedPeriod=true en MVP;
- si la política está active, solo cambios no disruptivos salvo permiso;
- audita accountingPolicy.updated.
```

### Response `200`

Devuelve `AccountingPolicyDto`.

---

## 11.5. `POST /api/v1/tenant/accounting/policies/{policyId}/activate`

Activa política contable.

### Permiso

```text id="vfujni"
accountingPolicies.activate
```

### Request body

```json id="nepiin"
{
  "reason": "Política validada para uso contable"
}
```

### Reglas

```text id="igtmmu"
- policy debe pertenecer al tenant;
- debe estar draft o inactive;
- solo una política active por tenant;
- baseCurrency requerida;
- fiscalYearStart requerido;
- audita accountingPolicy.activated.
```

### Response `200`

```json id="sgjslk"
{
  "data": {
    "id": "accounting_policy_uuid",
    "status": "active",
    "activatedAt": "2026-07-23T10:10:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 11.6. `POST /api/v1/tenant/accounting/policies/{policyId}/disable`

Deshabilita política contable.

### Permiso

```text id="nqehpw"
accountingPolicies.disable
```

### Request body

```json id="x4yocr"
{
  "reason": "Reemplazada por nueva política"
}
```

### Response `200`

```json id="gvb645"
{
  "data": {
    "id": "accounting_policy_uuid",
    "status": "inactive",
    "disabledAt": "2026-07-23T11:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 11.7. `POST /api/v1/tenant/accounting/policies/{policyId}/archive`

Archiva política histórica.

### Permiso

```text id="xi7kl6"
accountingPolicies.archive
```

### Request body

```json id="zoyibv"
{
  "reason": "Política histórica archivada"
}
```

### Response `200`

```json id="xl5idr"
{
  "data": {
    "id": "accounting_policy_uuid",
    "status": "archived",
    "archivedAt": "2026-07-23T12:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 12. API — Chart of Accounts

## 12.1. `GET /api/v1/tenant/accounting/chart-of-accounts`

Lista planes de cuentas del tenant.

### Permiso

```text id="fahci0"
chartOfAccounts.read
```

### Query params

```text id="d56kwy"
status
isDefault
templateKey
createdFrom
createdTo
page
pageSize
sortBy
sortOrder
```

### Response `200`

```json id="scohm9"
{
  "data": [
    {
      "id": "chart_uuid",
      "name": "Plan de cuentas principal",
      "description": "Plan de cuentas base del conjunto",
      "status": "active",
      "templateKey": "residentGeneric",
      "version": "1.0",
      "isDefault": true,
      "createdAt": "2026-07-23T10:00:00Z",
      "updatedAt": "2026-07-23T10:15:00Z",
      "activatedAt": "2026-07-23T10:15:00Z"
    }
  ],
  "meta": {
    "traceId": "req_123456",
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

---

## 12.2. `POST /api/v1/tenant/accounting/chart-of-accounts`

Crea plan de cuentas.

### Permiso

```text id="otgrgt"
chartOfAccounts.create
```

### Request body

```json id="joyq51"
{
  "name": "Plan de cuentas principal",
  "description": "Plan de cuentas base del conjunto",
  "templateKey": "residentGeneric",
  "version": "1.0",
  "isDefault": true,
  "metadata": {
    "notes": "Creado desde plantilla base"
  }
}
```

### Reglas

```text id="hxv82q"
- tenant activo requerido;
- status inicial draft;
- si isDefault=true, no debe existir otro default active incompatible;
- audita chartOfAccounts.created.
```

### Response `201`

```json id="glfgkn"
{
  "data": {
    "id": "chart_uuid",
    "name": "Plan de cuentas principal",
    "status": "draft",
    "isDefault": true,
    "createdAt": "2026-07-23T10:00:00Z",
    "updatedAt": "2026-07-23T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 12.3. `GET /api/v1/tenant/accounting/chart-of-accounts/{chartId}`

Obtiene plan de cuentas.

### Permiso

```text id="kam9p5"
chartOfAccounts.read
```

### Response `200`

Devuelve `ChartOfAccountsDto`.

---

## 12.4. `PATCH /api/v1/tenant/accounting/chart-of-accounts/{chartId}`

Actualiza plan de cuentas.

### Permiso

```text id="xx376u"
chartOfAccounts.update
```

### Request body

```json id="f6bwxb"
{
  "name": "Plan de cuentas actualizado",
  "description": "Plan de cuentas operativo",
  "version": "1.1",
  "isDefault": true,
  "metadata": {
    "notes": "Ajuste de descripción"
  }
}
```

### Reglas

```text id="lt0hwm"
- no cambia tenantId;
- no cambia status directo;
- no debe alterar historial contable ya posteado de forma inconsistente;
- audita chartOfAccounts.updated.
```

### Response `200`

Devuelve `ChartOfAccountsDto`.

---

## 12.5. `POST /api/v1/tenant/accounting/chart-of-accounts/{chartId}/activate`

Activa plan de cuentas.

### Permiso

```text id="foq23g"
chartOfAccounts.activate
```

### Request body

```json id="qfrlap"
{
  "reason": "Plan de cuentas validado"
}
```

### Reglas

```text id="rf9oru"
- debe pertenecer al tenant;
- debe tener cuentas mínimas requeridas;
- no debe tener accountCode duplicados;
- solo un chart active/default por tenant en MVP;
- audita chartOfAccounts.activated.
```

### Response `200`

```json id="subn45"
{
  "data": {
    "id": "chart_uuid",
    "status": "active",
    "activatedAt": "2026-07-23T10:15:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 12.6. `POST /api/v1/tenant/accounting/chart-of-accounts/{chartId}/archive`

Archiva plan de cuentas.

### Permiso

```text id="mjijba"
chartOfAccounts.archive
```

### Request body

```json id="atpilq"
{
  "reason": "Plan histórico archivado"
}
```

### Reglas

```text id="o6zzu8"
- si tiene JournalEntries asociados, no eliminar físicamente;
- archived no se usa para nuevos postings;
- audita chartOfAccounts.archived.
```

### Response `200`

```json id="cqdj6i"
{
  "data": {
    "id": "chart_uuid",
    "status": "archived",
    "archivedAt": "2026-07-23T12:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 13. API — Accounting Accounts

## 13.1. `GET /api/v1/tenant/accounting/accounts`

Lista cuentas contables.

### Permiso

```text id="u48vq4"
accountingAccounts.read
```

### Query params

```text id="nlrzvg"
chartOfAccountsId
parentAccountId
accountCode
accountName
accountType
normalBalance
status
isPostingAllowed
isControlAccount
isSystemAccount
level
createdFrom
createdTo
page
pageSize
sortBy
sortOrder
```

### Response `200`

```json id="qa7m5k"
{
  "data": [
    {
      "id": "account_uuid",
      "chartOfAccountsId": "chart_uuid",
      "parentAccountId": null,
      "accountCode": "1.3",
      "accountName": "Cuentas por cobrar",
      "accountType": "asset",
      "normalBalance": "debit",
      "level": 2,
      "isPostingAllowed": true,
      "isControlAccount": true,
      "isSystemAccount": true,
      "status": "active",
      "description": "Cuenta de control para saldos por cobrar",
      "createdAt": "2026-07-23T10:00:00Z",
      "updatedAt": "2026-07-23T10:00:00Z"
    }
  ],
  "meta": {
    "traceId": "req_123456",
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

---

## 13.2. `POST /api/v1/tenant/accounting/accounts`

Crea cuenta contable.

### Permiso

```text id="vu6kwa"
accountingAccounts.create
```

### Request body

```json id="owhohf"
{
  "chartOfAccountsId": "chart_uuid",
  "parentAccountId": null,
  "accountCode": "1.3",
  "accountName": "Cuentas por cobrar",
  "accountType": "asset",
  "normalBalance": "debit",
  "isPostingAllowed": true,
  "isControlAccount": true,
  "isSystemAccount": false,
  "description": "Cuenta de control para valores por cobrar",
  "metadata": {
    "controlKey": "accountsReceivable"
  }
}
```

### Reglas

```text id="dzb3mh"
- chartOfAccountsId debe pertenecer al tenant;
- parentAccountId debe pertenecer al mismo tenant y chart;
- accountCode único por tenant/chart;
- level se calcula server-side;
- isControlAccount=true requiere accountingAccounts.manageControlAccounts;
- status inicial draft;
- audita accountingAccount.created.
```

### Response `201`

```json id="l7t68u"
{
  "data": {
    "id": "account_uuid",
    "chartOfAccountsId": "chart_uuid",
    "accountCode": "1.3",
    "accountName": "Cuentas por cobrar",
    "accountType": "asset",
    "normalBalance": "debit",
    "level": 2,
    "status": "draft",
    "createdAt": "2026-07-23T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Rechazar

```text id="v5h9dt"
tenantId
createdBy
updatedBy
status
level desde cliente si se calcula server-side
accountCode duplicado
parentAccountId cross-tenant
chartOfAccountsId cross-tenant
isControlAccount=true sin permiso especial
```

---

## 13.3. `GET /api/v1/tenant/accounting/accounts/{accountId}`

Obtiene cuenta contable.

### Permiso

```text id="lezvcy"
accountingAccounts.read
```

### Response `200`

Devuelve `AccountingAccountDto`.

---

## 13.4. `PATCH /api/v1/tenant/accounting/accounts/{accountId}`

Actualiza cuenta contable.

### Permiso

```text id="dgz4eu"
accountingAccounts.update
```

### Request body

```json id="anj2uq"
{
  "accountName": "Cuentas por cobrar residentes",
  "description": "Cuenta de control para cargos por cobrar",
  "isPostingAllowed": true,
  "metadata": {
    "controlKey": "accountsReceivable"
  }
}
```

### Reglas

```text id="qc17pj"
- no cambiar tenantId;
- no cambiar status directo;
- cambios sobre accountCode con movimientos posted requieren política estricta;
- cambio de isControlAccount requiere accountingAccounts.manageControlAccounts;
- audita accountingAccount.updated.
```

### Response `200`

Devuelve `AccountingAccountDto`.

---

## 13.5. `POST /api/v1/tenant/accounting/accounts/{accountId}/activate`

Activa cuenta contable.

### Permiso

```text id="tjm7m5"
accountingAccounts.activate
```

### Request body

```json id="j4ulqc"
{
  "reason": "Cuenta validada para uso contable"
}
```

### Reglas

```text id="w22dlm"
- cuenta debe pertenecer al tenant;
- chart debe estar activo o editable según política;
- accountCode único;
- parent válido si existe;
- audita accountingAccount.activated.
```

### Response `200`

```json id="goxd5z"
{
  "data": {
    "id": "account_uuid",
    "status": "active",
    "activatedAt": "2026-07-23T10:30:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 13.6. `POST /api/v1/tenant/accounting/accounts/{accountId}/disable`

Deshabilita cuenta.

### Permiso

```text id="jr1q46"
accountingAccounts.disable
```

### Request body

```json id="nw7q8m"
{
  "reason": "Cuenta reemplazada"
}
```

### Reglas

```text id="wveefa"
- cuenta disabled no recibe nuevos postings;
- no elimina historial;
- audita accountingAccount.disabled.
```

### Response `200`

```json id="tz96uh"
{
  "data": {
    "id": "account_uuid",
    "status": "inactive",
    "disabledAt": "2026-07-23T11:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 13.7. `POST /api/v1/tenant/accounting/accounts/{accountId}/archive`

Archiva cuenta.

### Permiso

```text id="d3hkpd"
accountingAccounts.archive
```

### Request body

```json id="ly452m"
{
  "reason": "Cuenta histórica archivada"
}
```

### Reglas

```text id="xg1dh2"
- no borrar físicamente si tiene JournalEntryLines;
- archived no recibe nuevos postings;
- audita accountingAccount.archived.
```

### Response `200`

```json id="o4cqye"
{
  "data": {
    "id": "account_uuid",
    "status": "archived",
    "archivedAt": "2026-07-23T12:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 14. API — Accounting Periods

## 14.1. `GET /api/v1/tenant/accounting/periods`

Lista periodos contables.

### Permiso

```text id="ggs9cs"
accountingPeriods.read
```

### Query params

```text id="hqddsa"
periodCode
periodType
status
startFrom
startTo
endFrom
endTo
page
pageSize
sortBy
sortOrder
```

### Response `200`

```json id="sexe3v"
{
  "data": [
    {
      "id": "period_uuid",
      "periodCode": "2026-07",
      "periodName": "Julio 2026",
      "periodType": "monthly",
      "startDate": "2026-07-01T00:00:00Z",
      "endDate": "2026-07-31T23:59:59Z",
      "status": "open",
      "lockedAt": null,
      "closedAt": null,
      "reopenedAt": null,
      "createdAt": "2026-07-23T10:00:00Z",
      "updatedAt": "2026-07-23T10:00:00Z"
    }
  ],
  "meta": {
    "traceId": "req_123456",
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

---

## 14.2. `POST /api/v1/tenant/accounting/periods`

Crea periodo contable.

### Permiso

```text id="xp2lpx"
accountingPeriods.create
```

### Request body

```json id="kqqam8"
{
  "periodCode": "2026-07",
  "periodName": "Julio 2026",
  "periodType": "monthly",
  "startDate": "2026-07-01T00:00:00Z",
  "endDate": "2026-07-31T23:59:59Z",
  "metadata": {
    "fiscalYear": "2026"
  }
}
```

### Reglas

```text id="qnyayb"
- periodCode único por tenant;
- startDate <= endDate;
- no solapar periodos operativos del mismo tipo si la política lo exige;
- status inicial open;
- audita accountingPeriod.created.
```

### Response `201`

```json id="vuvf7p"
{
  "data": {
    "id": "period_uuid",
    "periodCode": "2026-07",
    "periodName": "Julio 2026",
    "periodType": "monthly",
    "status": "open",
    "startDate": "2026-07-01T00:00:00Z",
    "endDate": "2026-07-31T23:59:59Z",
    "createdAt": "2026-07-23T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 14.3. `POST /api/v1/tenant/accounting/periods/generate`

Genera periodos mensuales para un rango.

### Permiso

```text id="bk07ja"
accountingPeriods.create
```

### Request body

```json id="kjtu7y"
{
  "year": 2026,
  "periodType": "monthly",
  "startMonth": 1,
  "endMonth": 12,
  "overwriteExisting": false
}
```

### Reglas

```text id="vvbz3h"
- no sobrescribir periodos existentes salvo política explícita;
- validar no solapamiento;
- crear 12 periodos si startMonth=1 y endMonth=12;
- auditar accountingPeriod.generated.
```

### Response `201`

```json id="m48q5e"
{
  "data": {
    "created": 12,
    "skipped": 0,
    "periodCodes": [
      "2026-01",
      "2026-02",
      "2026-03",
      "2026-04",
      "2026-05",
      "2026-06",
      "2026-07",
      "2026-08",
      "2026-09",
      "2026-10",
      "2026-11",
      "2026-12"
    ]
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 14.4. `GET /api/v1/tenant/accounting/periods/{periodId}`

Obtiene periodo contable.

### Permiso

```text id="jzhdeh"
accountingPeriods.read
```

### Response `200`

Devuelve `AccountingPeriodDto`.

---

## 14.5. `PATCH /api/v1/tenant/accounting/periods/{periodId}`

Actualiza periodo editable.

### Permiso

```text id="xg1we0"
accountingPeriods.update
```

### Request body

```json id="b5h9y6"
{
  "periodName": "Julio 2026 actualizado",
  "metadata": {
    "notes": "Cambio descriptivo"
  }
}
```

### Reglas

```text id="jwccgl"
- no cambiar tenantId;
- no cambiar status directo;
- cambios de fechas en periodo con postings requieren política estricta;
- no modificar periodo closed salvo reapertura formal;
- audita accountingPeriod.updated.
```

### Response `200`

Devuelve `AccountingPeriodDto`.

---

## 14.6. `POST /api/v1/tenant/accounting/periods/{periodId}/lock`

Bloquea periodo temporalmente.

### Permiso

```text id="g8e6yz"
accountingPeriods.lock
```

### Request body

```json id="klq7aj"
{
  "reason": "Periodo en revisión previa al cierre"
}
```

### Response `200`

```json id="x42cei"
{
  "data": {
    "id": "period_uuid",
    "status": "locked",
    "lockedAt": "2026-08-01T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 14.7. `POST /api/v1/tenant/accounting/periods/{periodId}/close`

Cierra periodo.

### Permiso

```text id="zb1aip"
accountingPeriods.close
```

### Request body

```json id="p2ay1z"
{
  "reason": "Cierre contable mensual",
  "createClosingRun": true,
  "generateBalanceSnapshots": true
}
```

### Reglas

```text id="t8m66t"
- valida periodo tenant-scoped;
- valida asientos posted cuadrados;
- valida ausencia de draft críticos si política lo exige;
- puede crear AccountingClosingRun;
- puede generar balance snapshots;
- status final closed si validaciones pasan;
- audita accountingPeriod.closed.
```

### Response `200`

```json id="dbn2gj"
{
  "data": {
    "id": "period_uuid",
    "status": "closed",
    "closedAt": "2026-08-01T12:00:00Z",
    "closingRunId": "closing_run_uuid"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 14.8. `POST /api/v1/tenant/accounting/periods/{periodId}/reopen`

Reabre periodo cerrado.

### Permiso

```text id="sd8dts"
accountingPeriods.reopen
```

### Request body

```json id="dhdk76"
{
  "reason": "Corrección contable autorizada"
}
```

### Reglas

```text id="q3i7oo"
- requiere permiso especial;
- requiere razón;
- periodo debe estar closed;
- audita accountingPeriod.reopened con auditoría reforzada.
```

### Response `200`

```json id="q7ke5u"
{
  "data": {
    "id": "period_uuid",
    "status": "reopened",
    "reopenedAt": "2026-08-02T09:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 14.9. `POST /api/v1/tenant/accounting/periods/{periodId}/archive`

Archiva periodo histórico.

### Permiso

```text id="a6dk3q"
accountingPeriods.archive
```

### Request body

```json id="wi2anv"
{
  "reason": "Periodo histórico archivado"
}
```

### Response `200`

```json id="dsfco4"
{
  "data": {
    "id": "period_uuid",
    "status": "archived",
    "archivedAt": "2026-08-03T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 15. API — Accounting Mapping Rules

## 15.1. `GET /api/v1/tenant/accounting/mapping-rules`

Lista reglas de mapeo contable.

### Permiso

```text id="nmg4df"
accountingMappingRules.read
```

### Query params

```text id="qahabj"
chartOfAccountsId
ruleCode
sourceModule
sourceEventType
sourceResourceType
status
debitAccountId
creditAccountId
effectiveAt
page
pageSize
sortBy
sortOrder
```

### Response `200`

```json id="xbmxa3"
{
  "data": [
    {
      "id": "mapping_rule_uuid",
      "chartOfAccountsId": "chart_uuid",
      "ruleCode": "CHARGE_ISSUED_DUES",
      "ruleName": "Cargo de alícuota emitido",
      "sourceModule": "duesFees",
      "sourceEventType": "charge.issued",
      "sourceResourceType": "charge",
      "status": "active",
      "priority": 100,
      "debitAccountId": "accounts_receivable_uuid",
      "creditAccountId": "dues_revenue_uuid",
      "amountSource": "charge.amount",
      "descriptionTemplate": "Cargo emitido: {{charge.code}}",
      "effectiveFrom": "2026-01-01T00:00:00Z",
      "effectiveTo": null,
      "createdAt": "2026-07-23T10:00:00Z",
      "updatedAt": "2026-07-23T10:10:00Z",
      "activatedAt": "2026-07-23T10:10:00Z"
    }
  ],
  "meta": {
    "traceId": "req_123456",
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

---

## 15.2. `POST /api/v1/tenant/accounting/mapping-rules`

Crea regla de mapeo.

### Permiso

```text id="jbxvzq"
accountingMappingRules.create
```

### Request body

```json id="zhysbo"
{
  "chartOfAccountsId": "chart_uuid",
  "ruleCode": "CHARGE_ISSUED_DUES",
  "ruleName": "Cargo de alícuota emitido",
  "sourceModule": "duesFees",
  "sourceEventType": "charge.issued",
  "sourceResourceType": "charge",
  "priority": 100,
  "debitAccountId": "accounts_receivable_uuid",
  "creditAccountId": "dues_revenue_uuid",
  "amountSource": "charge.amount",
  "descriptionTemplate": "Cargo emitido: {{charge.code}}",
  "effectiveFrom": "2026-01-01T00:00:00Z",
  "effectiveTo": null,
  "metadata": {
    "notes": "Regla inicial para alícuotas"
  }
}
```

### Reglas

```text id="e9t02n"
- chartOfAccountsId debe pertenecer al tenant;
- debitAccountId y creditAccountId deben pertenecer al tenant;
- debitAccountId y creditAccountId deben pertenecer al chart si se especifica;
- cuentas deben estar activas para activar la regla;
- status inicial draft;
- audita accountingMappingRule.created.
```

### Response `201`

```json id="j567pg"
{
  "data": {
    "id": "mapping_rule_uuid",
    "ruleCode": "CHARGE_ISSUED_DUES",
    "ruleName": "Cargo de alícuota emitido",
    "sourceModule": "duesFees",
    "sourceEventType": "charge.issued",
    "sourceResourceType": "charge",
    "status": "draft",
    "createdAt": "2026-07-23T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 15.3. `GET /api/v1/tenant/accounting/mapping-rules/{ruleId}`

Obtiene regla.

### Permiso

```text id="e5gzho"
accountingMappingRules.read
```

### Response `200`

Devuelve `AccountingMappingRuleDto`.

---

## 15.4. `PATCH /api/v1/tenant/accounting/mapping-rules/{ruleId}`

Actualiza regla editable.

### Permiso

```text id="f1vgql"
accountingMappingRules.update
```

### Request body

```json id="t074iy"
{
  "ruleName": "Cargo emitido por alícuota",
  "priority": 100,
  "debitAccountId": "accounts_receivable_uuid",
  "creditAccountId": "dues_revenue_uuid",
  "amountSource": "charge.amount",
  "descriptionTemplate": "Cargo emitido {{charge.code}}",
  "effectiveFrom": "2026-01-01T00:00:00Z",
  "effectiveTo": null
}
```

### Reglas

```text id="zcvhmx"
- no cambiar tenantId;
- no cambiar status directo;
- cambios en regla activa deben auditarse;
- evitar alterar interpretación histórica de asientos ya posteados;
- audita accountingMappingRule.updated.
```

### Response `200`

Devuelve `AccountingMappingRuleDto`.

---

## 15.5. `POST /api/v1/tenant/accounting/mapping-rules/{ruleId}/activate`

Activa regla de mapeo.

### Permiso

```text id="scyo73"
accountingMappingRules.activate
```

### Request body

```json id="b3si53"
{
  "reason": "Regla validada para contabilización automática"
}
```

### Reglas

```text id="njb6nw"
- debitAccount y creditAccount activas;
- cuentas posteables;
- no usar cuentas archived;
- sourceModule/sourceEventType requeridos;
- audita accountingMappingRule.activated.
```

### Response `200`

```json id="xl1w70"
{
  "data": {
    "id": "mapping_rule_uuid",
    "status": "active",
    "activatedAt": "2026-07-23T10:20:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 15.6. `POST /api/v1/tenant/accounting/mapping-rules/{ruleId}/disable`

Deshabilita regla.

### Permiso

```text id="q9n0k6"
accountingMappingRules.disable
```

### Request body

```json id="hg6863"
{
  "reason": "Regla reemplazada"
}
```

### Response `200`

```json id="cj87nd"
{
  "data": {
    "id": "mapping_rule_uuid",
    "status": "inactive",
    "disabledAt": "2026-07-23T11:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 15.7. `POST /api/v1/tenant/accounting/mapping-rules/{ruleId}/archive`

Archiva regla.

### Permiso

```text id="gbjj1h"
accountingMappingRules.archive
```

### Request body

```json id="izniip"
{
  "reason": "Regla histórica archivada"
}
```

### Response `200`

```json id="qlfr1o"
{
  "data": {
    "id": "mapping_rule_uuid",
    "status": "archived",
    "archivedAt": "2026-07-23T12:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 16. API — Journal Entries

## 16.1. `GET /api/v1/tenant/accounting/journal-entries`

Lista asientos contables.

### Permiso

```text id="hxf8ci"
journalEntries.read
```

### Query params

```text id="kw73ug"
accountingPeriodId
journalNumber
entryDateFrom
entryDateTo
postingDateFrom
postingDateTo
entryType
sourceType
sourceModule
sourceResourceType
sourceResourceId
sourceEventType
status
accountingAccountId
amountMin
amountMax
currency
createdFrom
createdTo
page
pageSize
sortBy
sortOrder
```

### Response `200`

```json id="bughex"
{
  "data": [
    {
      "id": "journal_entry_uuid",
      "accountingPeriodId": "period_uuid",
      "journalNumber": "JE-2026-07-000001",
      "entryDate": "2026-07-15T00:00:00Z",
      "postingDate": "2026-07-15T00:00:00Z",
      "entryType": "automatic",
      "sourceType": "system",
      "sourceModule": "duesFees",
      "sourceResourceType": "charge",
      "sourceResourceId": "charge_uuid",
      "sourceEventType": "charge.issued",
      "status": "posted",
      "description": "Cargo de alícuota emitido",
      "totalDebit": "125.50",
      "totalCredit": "125.50",
      "currency": "USD",
      "postedAt": "2026-07-15T10:00:00Z",
      "reversedAt": null,
      "createdAt": "2026-07-15T10:00:00Z",
      "updatedAt": "2026-07-15T10:00:00Z"
    }
  ],
  "meta": {
    "traceId": "req_123456",
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

---

## 16.2. `POST /api/v1/tenant/accounting/journal-entries`

Crea asiento manual draft.

### Permiso

```text id="qxdj8w"
journalEntries.create
journalEntries.createManual
```

### Request body

```json id="pv00jh"
{
  "accountingPeriodId": "period_uuid",
  "entryDate": "2026-07-20T00:00:00Z",
  "postingDate": "2026-07-20T00:00:00Z",
  "entryType": "manual",
  "description": "Ajuste contable autorizado",
  "currency": "USD",
  "lines": [
    {
      "accountingAccountId": "expense_account_uuid",
      "description": "Registro de gasto administrativo",
      "debitAmount": "50.00",
      "creditAmount": "0.00"
    },
    {
      "accountingAccountId": "cash_account_uuid",
      "description": "Salida de caja",
      "debitAmount": "0.00",
      "creditAmount": "50.00"
    }
  ],
  "metadata": {
    "reason": "Ajuste manual autorizado"
  }
}
```

### Reglas

```text id="cf4lpw"
- no aceptar totalDebit/totalCredit desde cliente como fuente de verdad;
- totalDebit/totalCredit se calculan server-side;
- accountingPeriodId debe pertenecer al tenant;
- postingDate debe caer dentro del periodo;
- periodo debe estar open/reopened para post posterior;
- cuentas deben pertenecer al tenant;
- si usa control accounts requiere journalEntries.postToControlAccounts;
- status inicial draft o pendingApproval según política;
- audita journalEntry.created.
```

### Response `201`

```json id="d3tynj"
{
  "data": {
    "id": "journal_entry_uuid",
    "accountingPeriodId": "period_uuid",
    "journalNumber": "JE-2026-07-000010",
    "entryDate": "2026-07-20T00:00:00Z",
    "postingDate": "2026-07-20T00:00:00Z",
    "entryType": "manual",
    "sourceType": "manual",
    "status": "draft",
    "description": "Ajuste contable autorizado",
    "totalDebit": "50.00",
    "totalCredit": "50.00",
    "currency": "USD",
    "lines": [
      {
        "id": "line_1_uuid",
        "lineNumber": 1,
        "accountingAccountId": "expense_account_uuid",
        "debitAmount": "50.00",
        "creditAmount": "0.00",
        "currency": "USD"
      },
      {
        "id": "line_2_uuid",
        "lineNumber": 2,
        "accountingAccountId": "cash_account_uuid",
        "debitAmount": "0.00",
        "creditAmount": "50.00",
        "currency": "USD"
      }
    ],
    "createdAt": "2026-07-23T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Rechazar

```text id="gumifv"
tenantId
status
postedAt
postedBy
totalDebit fuente de verdad
totalCredit fuente de verdad
sourceModule arbitrario para asiento manual ordinario
sourceEventLink arbitrario
línea con debit y credit simultáneos
línea con ambos montos en cero
cuenta cross-tenant
periodo closed
```

---

## 16.3. `GET /api/v1/tenant/accounting/journal-entries/{journalEntryId}`

Obtiene asiento con líneas.

### Permiso

```text id="jn6z2a"
journalEntries.read
```

### Response `200`

Devuelve `JournalEntryDto`.

---

## 16.4. `PATCH /api/v1/tenant/accounting/journal-entries/{journalEntryId}`

Actualiza asiento draft.

### Permiso

```text id="l279g5"
journalEntries.updateDraft
```

### Request body

```json id="cjhdkl"
{
  "entryDate": "2026-07-20T00:00:00Z",
  "postingDate": "2026-07-20T00:00:00Z",
  "description": "Ajuste contable actualizado",
  "lines": [
    {
      "id": "line_1_uuid",
      "accountingAccountId": "expense_account_uuid",
      "description": "Gasto administrativo",
      "debitAmount": "50.00",
      "creditAmount": "0.00"
    },
    {
      "id": "line_2_uuid",
      "accountingAccountId": "cash_account_uuid",
      "description": "Salida de caja",
      "debitAmount": "0.00",
      "creditAmount": "50.00"
    }
  ]
}
```

### Reglas

```text id="kmrdde"
- solo draft, pendingApproval o approved según política;
- posted no editable;
- reversed no editable;
- voided no editable;
- recalcular totales server-side;
- audita journalEntry.updatedDraft.
```

### Response `200`

Devuelve `JournalEntryDto`.

---

## 16.5. `POST /api/v1/tenant/accounting/journal-entries/{journalEntryId}/approve`

Aprueba asiento.

### Permiso

```text id="yoyyu1"
journalEntries.approve
```

### Request body

```json id="peozdb"
{
  "reason": "Asiento revisado y aprobado"
}
```

### Reglas

```text id="rrbdve"
- asiento debe pertenecer al tenant;
- status debe ser pendingApproval o draft según política;
- debe cuadrar antes de aprobar;
- no debe usar cuentas inválidas;
- audita journalEntry.approved.
```

### Response `200`

```json id="j3mv6b"
{
  "data": {
    "id": "journal_entry_uuid",
    "status": "approved",
    "approvedAt": "2026-07-23T11:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 16.6. `POST /api/v1/tenant/accounting/journal-entries/{journalEntryId}/post`

Contabiliza asiento.

### Permiso

```text id="o7swqw"
journalEntries.post
```

### Request body

```json id="y7cvrf"
{
  "reason": "Contabilización autorizada"
}
```

### Reglas

```text id="hh46l3"
- asiento debe pertenecer al tenant;
- status debe ser draft o approved según política;
- debe tener al menos dos líneas;
- totalDebit debe ser igual a totalCredit;
- totalDebit/totalCredit se recalculan antes de postear;
- postingDate debe caer en periodo open/reopened;
- no postear en periodo locked/closed/archived;
- cuentas deben estar active;
- cuentas deben permitir posting;
- control accounts requieren permiso especial si entryType=manual;
- postedAt se asigna server-side;
- posted es inmutable;
- audita journalEntry.posted.
```

### Response `200`

```json id="il3ix4"
{
  "data": {
    "id": "journal_entry_uuid",
    "status": "posted",
    "postedAt": "2026-07-23T11:10:00Z",
    "totalDebit": "50.00",
    "totalCredit": "50.00"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 16.7. `POST /api/v1/tenant/accounting/journal-entries/{journalEntryId}/reverse`

Reversa asiento posted.

### Permiso

```text id="agtp7k"
journalEntries.reverse
```

### Request body

```json id="ty2qt4"
{
  "reason": "Corrección contable autorizada",
  "postingDate": "2026-07-25T00:00:00Z",
  "description": "Reverso de asiento JE-2026-07-000010"
}
```

### Reglas

```text id="iuogmm"
- asiento original debe estar posted;
- original debe pertenecer al tenant;
- si ya está reversed, responder idempotente o 409 según política;
- postingDate de reverso debe caer en periodo open/reopened;
- crear nuevo JournalEntry type=reversal;
- invertir líneas debit/credit;
- no editar asiento original;
- marcar relación reversalOfJournalEntryId;
- audita journalEntry.reversed.
```

### Response `201`

```json id="dwoek5"
{
  "data": {
    "originalJournalEntryId": "journal_entry_uuid",
    "reversalJournalEntryId": "reversal_journal_entry_uuid",
    "originalStatus": "reversed",
    "reversalStatus": "posted",
    "reversedAt": "2026-07-23T12:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 16.8. `POST /api/v1/tenant/accounting/journal-entries/{journalEntryId}/void`

Anula asiento no posteado.

### Permiso

```text id="fmyjie"
journalEntries.voidDraft
```

### Request body

```json id="dxfnyw"
{
  "reason": "Asiento draft descartado"
}
```

### Reglas

```text id="qx8kpf"
- solo draft, pendingApproval o approved;
- posted no se anula: se reversa;
- requiere razón;
- audita journalEntry.voided.
```

### Response `200`

```json id="sqnmte"
{
  "data": {
    "id": "journal_entry_uuid",
    "status": "voided",
    "voidedAt": "2026-07-23T12:10:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 16.9. `POST /api/v1/tenant/accounting/journal-entries/{journalEntryId}/archive`

Archiva asiento histórico.

### Permiso

```text id="w48xbt"
journalEntries.archive
```

### Request body

```json id="z5shqr"
{
  "reason": "Asiento histórico archivado"
}
```

### Reglas

```text id="rboav4"
- no elimina físicamente;
- posted archivado conserva trazabilidad;
- no debe romper reportes históricos si la política incluye archivados;
- audita journalEntry.archived.
```

### Response `200`

```json id="c8zdze"
{
  "data": {
    "id": "journal_entry_uuid",
    "status": "archived",
    "archivedAt": "2026-07-23T13:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 17. API — Automatic Posting

## 17.1. `POST /api/v1/tenant/accounting/posting/source-events`

Procesa evento fuente para generar asiento automático.

### Permiso

```text id="y10vc4"
journalEntries.post
```

### Uso

Este endpoint puede reservarse para llamadas internas o herramientas administrativas controladas. En implementación productiva, los eventos deberían llegar mediante servicio interno, no desde clientes públicos.

### Request body

```json id="efcvsa"
{
  "sourceModule": "duesFees",
  "sourceResourceType": "charge",
  "sourceResourceId": "charge_uuid",
  "sourceEventType": "charge.issued",
  "sourceEventOccurredAt": "2026-07-15T10:00:00Z",
  "postingDate": "2026-07-15T00:00:00Z"
}
```

### Reglas

```text id="v4eptc"
- uso interno o administrativo controlado;
- tenant se toma del contexto;
- no aceptar tenantId;
- validar sourceResource pertenece al tenant;
- calcular idempotencyKey server-side;
- buscar mapping rule active;
- validar periodo open/reopened;
- crear JournalEntry automatic;
- crear JournalEntryLines;
- crear AccountingSourceEventLink;
- no duplicar si source event ya fue procesado;
- audita journalEntry.posted y accountingSourceEventLink.created.
```

### Response `201`

```json id="vflntx"
{
  "data": {
    "journalEntryId": "journal_entry_uuid",
    "journalNumber": "JE-2026-07-000020",
    "status": "posted",
    "sourceModule": "duesFees",
    "sourceResourceType": "charge",
    "sourceResourceId": "charge_uuid",
    "sourceEventType": "charge.issued",
    "idempotent": false
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Response idempotente `200`

```json id="e0qg22"
{
  "data": {
    "journalEntryId": "existing_journal_entry_uuid",
    "journalNumber": "JE-2026-07-000020",
    "status": "posted",
    "idempotent": true
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 18. API — Accounting Source Event Links

## 18.1. `GET /api/v1/tenant/accounting/source-event-links`

Lista vínculos entre eventos fuente y asientos.

### Permiso

```text id="s8dybi"
accountingSourceEventLinks.read
```

### Query params

```text id="c03o6p"
journalEntryId
sourceModule
sourceResourceType
sourceResourceId
sourceEventType
status
createdFrom
createdTo
page
pageSize
sortBy
sortOrder
```

### Response `200`

```json id="gggvyp"
{
  "data": [
    {
      "id": "source_event_link_uuid",
      "journalEntryId": "journal_entry_uuid",
      "sourceModule": "duesFees",
      "sourceResourceType": "charge",
      "sourceResourceId": "charge_uuid",
      "sourceEventType": "charge.issued",
      "sourceEventOccurredAt": "2026-07-15T10:00:00Z",
      "status": "active",
      "createdAt": "2026-07-15T10:00:01Z"
    }
  ],
  "meta": {
    "traceId": "req_123456",
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

No incluir por defecto:

```text id="zkr346"
idempotencyKey completo
raw source payload
datos operativos masivos
```

---

## 18.2. `GET /api/v1/tenant/accounting/source-event-links/{sourceEventLinkId}`

Obtiene vínculo fuente.

### Permiso

```text id="gcwyto"
accountingSourceEventLinks.read
```

### Response `200`

Devuelve `AccountingSourceEventLinkDto`.

---

# 19. API — Accounting Closing Runs

## 19.1. `GET /api/v1/tenant/accounting/closing-runs`

Lista cierres contables.

### Permiso

```text id="dsx527"
accountingClosingRuns.read
```

### Query params

```text id="rxvsyn"
accountingPeriodId
status
startedFrom
startedTo
completedFrom
completedTo
failedFrom
failedTo
page
pageSize
sortBy
sortOrder
```

### Response `200`

```json id="kqzbbh"
{
  "data": [
    {
      "id": "closing_run_uuid",
      "accountingPeriodId": "period_uuid",
      "status": "completed",
      "startedAt": "2026-08-01T10:00:00Z",
      "completedAt": "2026-08-01T10:00:10Z",
      "failedAt": null,
      "cancelledAt": null,
      "entriesChecked": 120,
      "entriesPosted": 120,
      "draftEntriesFound": 0,
      "unbalancedEntriesFound": 0,
      "warningsCount": 0,
      "errorCode": null,
      "errorMessage": null,
      "closePeriodOnSuccess": true,
      "createdAt": "2026-08-01T10:00:00Z",
      "updatedAt": "2026-08-01T10:00:10Z"
    }
  ],
  "meta": {
    "traceId": "req_123456",
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

---

## 19.2. `POST /api/v1/tenant/accounting/periods/{periodId}/closing-runs`

Crea closing run para un periodo.

### Permiso

```text id="ik59lk"
accountingClosingRuns.create
```

### Request body

```json id="t5y2pt"
{
  "closePeriodOnSuccess": true,
  "generateBalanceSnapshots": true,
  "metadata": {
    "reason": "Cierre mensual julio 2026"
  }
}
```

### Reglas

```text id="iuf098"
- periodId debe pertenecer al tenant;
- periodo debe estar open, locked o reopened;
- no debe existir closing run draft/running para el mismo periodo;
- status inicial draft;
- audita accountingClosingRun.created.
```

### Response `201`

```json id="vw3w3c"
{
  "data": {
    "id": "closing_run_uuid",
    "accountingPeriodId": "period_uuid",
    "status": "draft",
    "closePeriodOnSuccess": true,
    "createdAt": "2026-08-01T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 19.3. `GET /api/v1/tenant/accounting/closing-runs/{closingRunId}`

Obtiene closing run.

### Permiso

```text id="zacw4o"
accountingClosingRuns.read
```

### Response `200`

Devuelve `AccountingClosingRunDto`.

---

## 19.4. `POST /api/v1/tenant/accounting/closing-runs/{closingRunId}/execute`

Ejecuta cierre.

### Permiso

```text id="ht6qmc"
accountingClosingRuns.execute
```

### Request body

```json id="ws0iph"
{
  "reason": "Ejecutar cierre mensual",
  "generateBalanceSnapshots": true
}
```

### Reglas

```text id="syd3s6"
- closingRun debe pertenecer al tenant;
- status debe ser draft o failed reinteligible según política;
- validar trial balance;
- validar asientos desbalanceados;
- validar drafts críticos;
- generar snapshots si se solicita;
- si closePeriodOnSuccess=true, cerrar periodo;
- si falla, no cerrar periodo;
- audita accountingClosingRun.started/completed/failed y accountingPeriod.closed si aplica.
```

### Response `200`

```json id="m9wbdc"
{
  "data": {
    "id": "closing_run_uuid",
    "status": "completed",
    "accountingPeriodId": "period_uuid",
    "periodStatus": "closed",
    "entriesChecked": 120,
    "entriesPosted": 120,
    "draftEntriesFound": 0,
    "unbalancedEntriesFound": 0,
    "warningsCount": 0,
    "completedAt": "2026-08-01T10:00:10Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 19.5. `POST /api/v1/tenant/accounting/closing-runs/{closingRunId}/cancel`

Cancela cierre draft/running si aplica.

### Permiso

```text id="em7dyo"
accountingClosingRuns.cancel
```

### Request body

```json id="x6m07c"
{
  "reason": "Cierre cancelado por revisión pendiente"
}
```

### Response `200`

```json id="avxn2v"
{
  "data": {
    "id": "closing_run_uuid",
    "status": "cancelled",
    "cancelledAt": "2026-08-01T10:05:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 19.6. `POST /api/v1/tenant/accounting/closing-runs/{closingRunId}/archive`

Archiva cierre histórico.

### Permiso

```text id="i6bizo"
accountingClosingRuns.archive
```

### Request body

```json id="poh1e7"
{
  "reason": "Cierre histórico archivado"
}
```

### Response `200`

```json id="vynr0v"
{
  "data": {
    "id": "closing_run_uuid",
    "status": "archived",
    "archivedAt": "2026-08-02T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 20. API — Accounting Reports

## 20.1. `GET /api/v1/tenant/accounting/reports/general-journal`

Consulta libro diario.

### Permiso

```text id="tfx85e"
accountingReports.read
accountingReports.generalJournal
```

### Query params

```text id="g9w3sg"
accountingPeriodId
periodCode
entryDateFrom
entryDateTo
postingDateFrom
postingDateTo
entryType
sourceModule
sourceEventType
status
page
pageSize
sortBy
sortOrder
```

### Response `200`

```json id="ouduzl"
{
  "data": [
    {
      "journalEntryId": "journal_entry_uuid",
      "journalNumber": "JE-2026-07-000001",
      "entryDate": "2026-07-15T00:00:00Z",
      "postingDate": "2026-07-15T00:00:00Z",
      "periodCode": "2026-07",
      "entryType": "automatic",
      "sourceModule": "duesFees",
      "sourceEventType": "charge.issued",
      "description": "Cargo de alícuota emitido",
      "status": "posted",
      "totalDebit": "125.50",
      "totalCredit": "125.50",
      "currency": "USD"
    }
  ],
  "meta": {
    "traceId": "req_123456",
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

---

## 20.2. `GET /api/v1/tenant/accounting/reports/general-ledger`

Consulta libro mayor por cuenta.

### Permiso

```text id="r531cd"
accountingReports.read
accountingReports.generalLedger
```

### Query params

```text id="b7jlzc"
accountingAccountId
accountCode
accountingPeriodId
periodCode
postingDateFrom
postingDateTo
includeOpeningBalance
page
pageSize
sortBy
sortOrder
```

### Response `200`

```json id="r5myzi"
{
  "data": {
    "account": {
      "id": "account_uuid",
      "accountCode": "1.3",
      "accountName": "Cuentas por cobrar",
      "accountType": "asset",
      "normalBalance": "debit"
    },
    "period": {
      "id": "period_uuid",
      "periodCode": "2026-07",
      "periodName": "Julio 2026"
    },
    "openingBalance": "0.00",
    "periodDebit": "1250.00",
    "periodCredit": "900.00",
    "closingBalance": "350.00",
    "currency": "USD",
    "lines": [
      {
        "journalEntryId": "journal_entry_uuid",
        "journalNumber": "JE-2026-07-000001",
        "postingDate": "2026-07-15T00:00:00Z",
        "description": "Cargo de alícuota emitido",
        "debitAmount": "125.50",
        "creditAmount": "0.00",
        "runningBalance": "125.50"
      }
    ]
  },
  "meta": {
    "traceId": "req_123456",
    "page": 1,
    "pageSize": 20,
    "totalLines": 1
  }
}
```

---

## 20.3. `GET /api/v1/tenant/accounting/reports/trial-balance`

Genera balance de comprobación.

### Permiso

```text id="lfcvsa"
accountingReports.read
accountingReports.trialBalance
```

### Query params

```text id="pp45g5"
accountingPeriodId
periodCode
includeZeroBalances
accountType
```

### Response `200`

```json id="lzm5bh"
{
  "data": {
    "period": {
      "id": "period_uuid",
      "periodCode": "2026-07",
      "periodName": "Julio 2026"
    },
    "currency": "USD",
    "totalDebit": "1250.00",
    "totalCredit": "1250.00",
    "difference": "0.00",
    "isBalanced": true,
    "accounts": [
      {
        "accountingAccountId": "account_uuid",
        "accountCode": "1.3",
        "accountName": "Cuentas por cobrar",
        "accountType": "asset",
        "normalBalance": "debit",
        "debitBalance": "1250.00",
        "creditBalance": "0.00"
      }
    ]
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 20.4. `GET /api/v1/tenant/accounting/reports/income-expense`

Genera reporte básico de ingresos y gastos.

### Permiso

```text id="o7vi19"
accountingReports.read
accountingReports.incomeExpense
```

### Query params

```text id="on5slq"
accountingPeriodId
periodCode
dateFrom
dateTo
includeDetails
```

### Response `200`

```json id="zxx67v"
{
  "data": {
    "period": {
      "id": "period_uuid",
      "periodCode": "2026-07",
      "periodName": "Julio 2026"
    },
    "currency": "USD",
    "totalIncome": "2000.00",
    "totalExpense": "750.00",
    "netResult": "1250.00",
    "incomeAccounts": [
      {
        "accountCode": "4.1",
        "accountName": "Ingresos por alícuotas",
        "amount": "1800.00"
      }
    ],
    "expenseAccounts": [
      {
        "accountCode": "5.1",
        "accountName": "Mantenimiento",
        "amount": "750.00"
      }
    ]
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 20.5. `GET /api/v1/tenant/accounting/reports/balance-sheet`

Genera balance general básico.

### Permiso

```text id="vpgiid"
accountingReports.read
accountingReports.balanceSheet
```

### Query params

```text id="y0epar"
accountingPeriodId
periodCode
asOfDate
includeDetails
```

### Response `200`

```json id="b0q1ol"
{
  "data": {
    "asOfDate": "2026-07-31T23:59:59Z",
    "currency": "USD",
    "assets": {
      "total": "5000.00",
      "accounts": [
        {
          "accountCode": "1.2",
          "accountName": "Bancos",
          "amount": "3000.00"
        }
      ]
    },
    "liabilities": {
      "total": "1000.00",
      "accounts": []
    },
    "equity": {
      "total": "4000.00",
      "accounts": []
    },
    "equationDifference": "0.00",
    "isBalanced": true
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 20.6. `GET /api/v1/tenant/accounting/reports/export`

Exporta reporte contable.

### Permiso

```text id="afwncs"
accountingReports.export
```

### Query params

```text id="xd1ucl"
reportType
accountingPeriodId
periodCode
dateFrom
dateTo
format
```

Valores:

```text id="wwnjkw"
reportType = generalJournal | generalLedger | trialBalance | incomeExpense | balanceSheet
format = csv | xlsx | pdf
```

### Reglas

```text id="uj804g"
- export tenant-scoped;
- si se persiste, usar Secure Document Storage;
- no exponer storageKey;
- no incluir datos cross-tenant;
- no incluir información no paginada sin control;
- audita accountingReport.exported.
```

### Response `200`

```json id="ysrrv9"
{
  "data": {
    "reportType": "trialBalance",
    "format": "xlsx",
    "secureDocumentId": "secure_document_uuid",
    "secureDocumentFileId": "secure_document_file_uuid",
    "downloadAvailable": true,
    "createdAt": "2026-07-23T16:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 21. Endpoints públicos prohibidos

No crear:

```text id="hl4lkt"
GET  /api/v1/public/accounting
GET  /api/v1/public/accounting/accounts
GET  /api/v1/public/accounting/journal-entries
GET  /api/v1/public/accounting/reports
GET  /api/v1/public/tenants/{slug}/accounting
GET  /api/v1/public/tenants/{slug}/accounting/accounts
GET  /api/v1/public/tenants/{slug}/accounting/journal-entries
GET  /api/v1/public/tenants/{slug}/accounting/reports
```

Resultado esperado:

```text id="svgq5a"
404 route not found
```

---

# 22. Endpoints `/me` prohibidos en MVP

No crear:

```text id="z3u941"
GET  /api/v1/me/accounting
GET  /api/v1/me/accounting/accounts
GET  /api/v1/me/accounting/journal-entries
GET  /api/v1/me/accounting/reports
GET  /api/v1/me/accounting/trial-balance
GET  /api/v1/me/accounting/general-ledger
```

Resultado esperado:

```text id="r0wio9"
404 route not found
```

---

# 23. DTOs

## 23.1. `CreateAccountingPolicyDto`

```typescript id="m7drfl"
type CreateAccountingPolicyDto = {
  baseCurrency: "USD";
  accountingMethod: "cash" | "accrual" | "hybrid";
  fiscalYearStartMonth: number;
  fiscalYearStartDay: number;
  journalNumberingMode: "systemSequential" | "periodSequential" | "manualWithValidation";
  allowManualEntries?: boolean;
  requireApprovalForManualEntries?: boolean;
  allowPostingToClosedPeriod?: false;
  allowPostingToControlAccounts?: boolean;
  protectedControlAccountsEnabled?: boolean;
  metadata?: Record<string, unknown>;
};
```

---

## 23.2. `AccountingPolicyDto`

```typescript id="pgfplp"
type AccountingPolicyDto = {
  id: string;
  baseCurrency: "USD";
  accountingMethod: string;
  fiscalYearStartMonth: number;
  fiscalYearStartDay: number;
  journalNumberingMode: string;
  allowManualEntries: boolean;
  requireApprovalForManualEntries: boolean;
  allowPostingToClosedPeriod: boolean;
  allowPostingToControlAccounts: boolean;
  protectedControlAccountsEnabled: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  activatedAt?: string | null;
  disabledAt?: string | null;
  archivedAt?: string | null;
  metadata?: Record<string, unknown>;
};
```

---

## 23.3. `CreateChartOfAccountsDto`

```typescript id="amy8ez"
type CreateChartOfAccountsDto = {
  name: string;
  description?: string;
  templateKey?: string;
  version?: string;
  isDefault?: boolean;
  metadata?: Record<string, unknown>;
};
```

---

## 23.4. `ChartOfAccountsDto`

```typescript id="abnzov"
type ChartOfAccountsDto = {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  templateKey?: string | null;
  version?: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  activatedAt?: string | null;
  archivedAt?: string | null;
  metadata?: Record<string, unknown>;
};
```

---

## 23.5. `CreateAccountingAccountDto`

```typescript id="jry741"
type CreateAccountingAccountDto = {
  chartOfAccountsId: string;
  parentAccountId?: string | null;
  accountCode: string;
  accountName: string;
  accountType: "asset" | "liability" | "equity" | "income" | "expense";
  normalBalance: "debit" | "credit";
  isPostingAllowed?: boolean;
  isControlAccount?: boolean;
  isSystemAccount?: boolean;
  description?: string;
  metadata?: Record<string, unknown>;
};
```

---

## 23.6. `AccountingAccountDto`

```typescript id="dx4484"
type AccountingAccountDto = {
  id: string;
  chartOfAccountsId: string;
  parentAccountId?: string | null;
  accountCode: string;
  accountName: string;
  accountType: string;
  normalBalance: string;
  level: number;
  isPostingAllowed: boolean;
  isControlAccount: boolean;
  isSystemAccount: boolean;
  status: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  activatedAt?: string | null;
  disabledAt?: string | null;
  archivedAt?: string | null;
  metadata?: Record<string, unknown>;
};
```

---

## 23.7. `CreateAccountingPeriodDto`

```typescript id="t913ww"
type CreateAccountingPeriodDto = {
  periodCode: string;
  periodName: string;
  periodType: "monthly" | "annual" | "custom";
  startDate: string;
  endDate: string;
  metadata?: Record<string, unknown>;
};
```

---

## 23.8. `AccountingPeriodDto`

```typescript id="k26dc0"
type AccountingPeriodDto = {
  id: string;
  periodCode: string;
  periodName: string;
  periodType: string;
  startDate: string;
  endDate: string;
  status: string;
  lockedAt?: string | null;
  closedAt?: string | null;
  reopenedAt?: string | null;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
};
```

---

## 23.9. `CreateAccountingMappingRuleDto`

```typescript id="rjtrpr"
type CreateAccountingMappingRuleDto = {
  chartOfAccountsId?: string;
  ruleCode: string;
  ruleName: string;
  sourceModule: string;
  sourceEventType: string;
  sourceResourceType: string;
  priority?: number;
  debitAccountId: string;
  creditAccountId: string;
  amountSource: string;
  descriptionTemplate?: string;
  effectiveFrom?: string;
  effectiveTo?: string | null;
  metadata?: Record<string, unknown>;
};
```

---

## 23.10. `AccountingMappingRuleDto`

```typescript id="am9uj4"
type AccountingMappingRuleDto = {
  id: string;
  chartOfAccountsId?: string | null;
  ruleCode: string;
  ruleName: string;
  sourceModule: string;
  sourceEventType: string;
  sourceResourceType: string;
  status: string;
  priority: number;
  debitAccountId: string;
  creditAccountId: string;
  amountSource: string;
  descriptionTemplate?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  createdAt: string;
  updatedAt: string;
  activatedAt?: string | null;
  disabledAt?: string | null;
  archivedAt?: string | null;
  metadata?: Record<string, unknown>;
};
```

---

## 23.11. `CreateJournalEntryDto`

```typescript id="h49cek"
type CreateJournalEntryDto = {
  accountingPeriodId: string;
  entryDate: string;
  postingDate: string;
  entryType: "manual" | "adjustment" | "opening" | "migration";
  description: string;
  currency: "USD";
  lines: Array<{
    accountingAccountId: string;
    description?: string;
    debitAmount: string;
    creditAmount: string;
    sourceLineType?: string;
    sourceLineId?: string;
    metadata?: Record<string, unknown>;
  }>;
  metadata?: Record<string, unknown>;
};
```

---

## 23.12. `JournalEntryDto`

```typescript id="zpa54g"
type JournalEntryDto = {
  id: string;
  accountingPeriodId: string;
  journalNumber: string;
  entryDate: string;
  postingDate: string;
  entryType: string;
  sourceType: string;
  sourceModule?: string | null;
  sourceResourceType?: string | null;
  sourceResourceId?: string | null;
  sourceEventType?: string | null;
  status: string;
  description: string;
  totalDebit: string;
  totalCredit: string;
  currency: "USD";
  approvedAt?: string | null;
  postedAt?: string | null;
  reversedAt?: string | null;
  voidedAt?: string | null;
  archivedAt?: string | null;
  reversalOfJournalEntryId?: string | null;
  reversalJournalEntryId?: string | null;
  reverseReason?: string | null;
  voidReason?: string | null;
  createdAt: string;
  updatedAt: string;
  lines?: JournalEntryLineDto[];
  sourceEventLinks?: AccountingSourceEventLinkDto[];
  metadata?: Record<string, unknown>;
};
```

---

## 23.13. `JournalEntryLineDto`

```typescript id="f2kg2w"
type JournalEntryLineDto = {
  id: string;
  journalEntryId: string;
  accountingAccountId: string;
  lineNumber: number;
  description?: string | null;
  debitAmount: string;
  creditAmount: string;
  currency: "USD";
  sourceLineType?: string | null;
  sourceLineId?: string | null;
  createdAt: string;
  metadata?: Record<string, unknown>;
};
```

---

## 23.14. `AccountingSourceEventLinkDto`

```typescript id="pcz9ud"
type AccountingSourceEventLinkDto = {
  id: string;
  journalEntryId: string;
  sourceModule: string;
  sourceResourceType: string;
  sourceResourceId: string;
  sourceEventType: string;
  sourceEventOccurredAt?: string | null;
  status: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
};
```

---

## 23.15. `AccountingClosingRunDto`

```typescript id="ysdupk"
type AccountingClosingRunDto = {
  id: string;
  accountingPeriodId: string;
  status: string;
  startedAt?: string | null;
  completedAt?: string | null;
  failedAt?: string | null;
  cancelledAt?: string | null;
  archivedAt?: string | null;
  entriesChecked: number;
  entriesPosted: number;
  draftEntriesFound: number;
  unbalancedEntriesFound: number;
  warningsCount: number;
  errorCode?: string | null;
  errorMessage?: string | null;
  closePeriodOnSuccess: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
};
```

---

# 24. Matriz de endpoints

| Endpoint                                             | Método | Permiso                            | Audit event                                     |
| ---------------------------------------------------- | -----: | ---------------------------------- | ----------------------------------------------- |
| `/tenant/accounting/policies`                        |    GET | `accountingPolicies.read`          | —                                               |
| `/tenant/accounting/policies`                        |   POST | `accountingPolicies.create`        | `accountingPolicy.created`                      |
| `/tenant/accounting/policies/{id}`                   |    GET | `accountingPolicies.read`          | —                                               |
| `/tenant/accounting/policies/{id}`                   |  PATCH | `accountingPolicies.update`        | `accountingPolicy.updated`                      |
| `/tenant/accounting/policies/{id}/activate`          |   POST | `accountingPolicies.activate`      | `accountingPolicy.activated`                    |
| `/tenant/accounting/policies/{id}/disable`           |   POST | `accountingPolicies.disable`       | `accountingPolicy.disabled`                     |
| `/tenant/accounting/policies/{id}/archive`           |   POST | `accountingPolicies.archive`       | `accountingPolicy.archived`                     |
| `/tenant/accounting/chart-of-accounts`               |    GET | `chartOfAccounts.read`             | —                                               |
| `/tenant/accounting/chart-of-accounts`               |   POST | `chartOfAccounts.create`           | `chartOfAccounts.created`                       |
| `/tenant/accounting/chart-of-accounts/{id}`          |    GET | `chartOfAccounts.read`             | —                                               |
| `/tenant/accounting/chart-of-accounts/{id}`          |  PATCH | `chartOfAccounts.update`           | `chartOfAccounts.updated`                       |
| `/tenant/accounting/chart-of-accounts/{id}/activate` |   POST | `chartOfAccounts.activate`         | `chartOfAccounts.activated`                     |
| `/tenant/accounting/chart-of-accounts/{id}/archive`  |   POST | `chartOfAccounts.archive`          | `chartOfAccounts.archived`                      |
| `/tenant/accounting/accounts`                        |    GET | `accountingAccounts.read`          | —                                               |
| `/tenant/accounting/accounts`                        |   POST | `accountingAccounts.create`        | `accountingAccount.created`                     |
| `/tenant/accounting/accounts/{id}`                   |    GET | `accountingAccounts.read`          | —                                               |
| `/tenant/accounting/accounts/{id}`                   |  PATCH | `accountingAccounts.update`        | `accountingAccount.updated`                     |
| `/tenant/accounting/accounts/{id}/activate`          |   POST | `accountingAccounts.activate`      | `accountingAccount.activated`                   |
| `/tenant/accounting/accounts/{id}/disable`           |   POST | `accountingAccounts.disable`       | `accountingAccount.disabled`                    |
| `/tenant/accounting/accounts/{id}/archive`           |   POST | `accountingAccounts.archive`       | `accountingAccount.archived`                    |
| `/tenant/accounting/periods`                         |    GET | `accountingPeriods.read`           | —                                               |
| `/tenant/accounting/periods`                         |   POST | `accountingPeriods.create`         | `accountingPeriod.created`                      |
| `/tenant/accounting/periods/generate`                |   POST | `accountingPeriods.create`         | `accountingPeriod.generated`                    |
| `/tenant/accounting/periods/{id}`                    |    GET | `accountingPeriods.read`           | —                                               |
| `/tenant/accounting/periods/{id}`                    |  PATCH | `accountingPeriods.update`         | `accountingPeriod.updated`                      |
| `/tenant/accounting/periods/{id}/lock`               |   POST | `accountingPeriods.lock`           | `accountingPeriod.locked`                       |
| `/tenant/accounting/periods/{id}/close`              |   POST | `accountingPeriods.close`          | `accountingPeriod.closed`                       |
| `/tenant/accounting/periods/{id}/reopen`             |   POST | `accountingPeriods.reopen`         | `accountingPeriod.reopened`                     |
| `/tenant/accounting/periods/{id}/archive`            |   POST | `accountingPeriods.archive`        | `accountingPeriod.archived`                     |
| `/tenant/accounting/mapping-rules`                   |    GET | `accountingMappingRules.read`      | —                                               |
| `/tenant/accounting/mapping-rules`                   |   POST | `accountingMappingRules.create`    | `accountingMappingRule.created`                 |
| `/tenant/accounting/mapping-rules/{id}`              |    GET | `accountingMappingRules.read`      | —                                               |
| `/tenant/accounting/mapping-rules/{id}`              |  PATCH | `accountingMappingRules.update`    | `accountingMappingRule.updated`                 |
| `/tenant/accounting/mapping-rules/{id}/activate`     |   POST | `accountingMappingRules.activate`  | `accountingMappingRule.activated`               |
| `/tenant/accounting/mapping-rules/{id}/disable`      |   POST | `accountingMappingRules.disable`   | `accountingMappingRule.disabled`                |
| `/tenant/accounting/mapping-rules/{id}/archive`      |   POST | `accountingMappingRules.archive`   | `accountingMappingRule.archived`                |
| `/tenant/accounting/journal-entries`                 |    GET | `journalEntries.read`              | —                                               |
| `/tenant/accounting/journal-entries`                 |   POST | `journalEntries.createManual`      | `journalEntry.created`                          |
| `/tenant/accounting/journal-entries/{id}`            |    GET | `journalEntries.read`              | —                                               |
| `/tenant/accounting/journal-entries/{id}`            |  PATCH | `journalEntries.updateDraft`       | `journalEntry.updatedDraft`                     |
| `/tenant/accounting/journal-entries/{id}/approve`    |   POST | `journalEntries.approve`           | `journalEntry.approved`                         |
| `/tenant/accounting/journal-entries/{id}/post`       |   POST | `journalEntries.post`              | `journalEntry.posted`                           |
| `/tenant/accounting/journal-entries/{id}/reverse`    |   POST | `journalEntries.reverse`           | `journalEntry.reversed`                         |
| `/tenant/accounting/journal-entries/{id}/void`       |   POST | `journalEntries.voidDraft`         | `journalEntry.voided`                           |
| `/tenant/accounting/journal-entries/{id}/archive`    |   POST | `journalEntries.archive`           | `journalEntry.archived`                         |
| `/tenant/accounting/posting/source-events`           |   POST | `journalEntries.post`              | `journalEntry.posted`                           |
| `/tenant/accounting/source-event-links`              |    GET | `accountingSourceEventLinks.read`  | —                                               |
| `/tenant/accounting/source-event-links/{id}`         |    GET | `accountingSourceEventLinks.read`  | —                                               |
| `/tenant/accounting/closing-runs`                    |    GET | `accountingClosingRuns.read`       | —                                               |
| `/tenant/accounting/periods/{id}/closing-runs`       |   POST | `accountingClosingRuns.create`     | `accountingClosingRun.created`                  |
| `/tenant/accounting/closing-runs/{id}`               |    GET | `accountingClosingRuns.read`       | —                                               |
| `/tenant/accounting/closing-runs/{id}/execute`       |   POST | `accountingClosingRuns.execute`    | `accountingClosingRun.started/completed/failed` |
| `/tenant/accounting/closing-runs/{id}/cancel`        |   POST | `accountingClosingRuns.cancel`     | `accountingClosingRun.cancelled`                |
| `/tenant/accounting/closing-runs/{id}/archive`       |   POST | `accountingClosingRuns.archive`    | `accountingClosingRun.archived`                 |
| `/tenant/accounting/reports/general-journal`         |    GET | `accountingReports.generalJournal` | `accountingReport.generated`                    |
| `/tenant/accounting/reports/general-ledger`          |    GET | `accountingReports.generalLedger`  | `accountingReport.generated`                    |
| `/tenant/accounting/reports/trial-balance`           |    GET | `accountingReports.trialBalance`   | `accountingReport.generated`                    |
| `/tenant/accounting/reports/income-expense`          |    GET | `accountingReports.incomeExpense`  | `accountingReport.generated`                    |
| `/tenant/accounting/reports/balance-sheet`           |    GET | `accountingReports.balanceSheet`   | `accountingReport.generated`                    |
| `/tenant/accounting/reports/export`                  |    GET | `accountingReports.export`         | `accountingReport.exported`                     |

---

# 25. Códigos de error

## 25.1. Generales

```text id="qglwg4"
UNAUTHORIZED
FORBIDDEN
VALIDATION_ERROR
NOT_FOUND
CONFLICT
RATE_LIMITED
INTERNAL_ERROR
```

---

## 25.2. Accounting policies

```text id="yv3vf1"
ACCOUNTING_POLICY_NOT_FOUND
ACCOUNTING_POLICY_INVALID_STATUS
ACCOUNTING_POLICY_ALREADY_ACTIVE
ACCOUNTING_POLICY_CURRENCY_UNSUPPORTED
ACCOUNTING_POLICY_CLOSED_PERIOD_POSTING_FORBIDDEN
```

---

## 25.3. Chart of accounts

```text id="kp24jh"
CHART_OF_ACCOUNTS_NOT_FOUND
CHART_OF_ACCOUNTS_INVALID_STATUS
CHART_OF_ACCOUNTS_ALREADY_ACTIVE
CHART_OF_ACCOUNTS_MISSING_REQUIRED_ACCOUNTS
CHART_OF_ACCOUNTS_DEFAULT_CONFLICT
```

---

## 25.4. Accounting accounts

```text id="lyau24"
ACCOUNTING_ACCOUNT_NOT_FOUND
ACCOUNTING_ACCOUNT_INVALID_STATUS
ACCOUNTING_ACCOUNT_CODE_DUPLICATE
ACCOUNTING_ACCOUNT_PARENT_INVALID
ACCOUNTING_ACCOUNT_PARENT_CYCLE
ACCOUNTING_ACCOUNT_POSTING_NOT_ALLOWED
ACCOUNTING_CONTROL_ACCOUNT_REQUIRES_PERMISSION
ACCOUNTING_ACCOUNT_CROSS_TENANT_REFERENCE
```

---

## 25.5. Accounting periods

```text id="y1ldao"
ACCOUNTING_PERIOD_NOT_FOUND
ACCOUNTING_PERIOD_INVALID_STATUS
ACCOUNTING_PERIOD_OVERLAPS
ACCOUNTING_PERIOD_CLOSED
ACCOUNTING_PERIOD_LOCKED
ACCOUNTING_PERIOD_REOPEN_FORBIDDEN
ACCOUNTING_PERIOD_DATE_RANGE_INVALID
ACCOUNTING_PERIOD_NOT_FOUND_FOR_POSTING_DATE
```

---

## 25.6. Mapping rules

```text id="b3133x"
ACCOUNTING_MAPPING_RULE_NOT_FOUND
ACCOUNTING_MAPPING_RULE_INVALID_STATUS
ACCOUNTING_MAPPING_RULE_SOURCE_DUPLICATE
ACCOUNTING_MAPPING_RULE_ACCOUNT_INVALID
ACCOUNTING_MAPPING_RULE_NOT_ACTIVE
ACCOUNTING_MAPPING_RULE_CROSS_TENANT_REFERENCE
ACCOUNTING_MAPPING_RULE_AMOUNT_SOURCE_INVALID
```

---

## 25.7. Journal entries

```text id="xxyhgl"
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
JOURNAL_ENTRY_CONTROL_ACCOUNT_FORBIDDEN
JOURNAL_ENTRY_CLOSED_PERIOD_FORBIDDEN
JOURNAL_ENTRY_CROSS_TENANT_REFERENCE
```

---

## 25.8. Journal entry lines

```text id="abm73d"
JOURNAL_ENTRY_LINE_INVALID
JOURNAL_ENTRY_LINE_BOTH_DEBIT_AND_CREDIT
JOURNAL_ENTRY_LINE_ZERO_AMOUNT
JOURNAL_ENTRY_LINE_ACCOUNT_INVALID
JOURNAL_ENTRY_LINE_CURRENCY_MISMATCH
JOURNAL_ENTRY_LINE_CROSS_TENANT_REFERENCE
```

---

## 25.9. Source event links

```text id="v1m3z9"
ACCOUNTING_SOURCE_EVENT_LINK_DUPLICATE
ACCOUNTING_SOURCE_EVENT_LINK_NOT_FOUND
ACCOUNTING_SOURCE_EVENT_LINK_CROSS_TENANT_REFERENCE
```

---

## 25.10. Closing runs

```text id="s5zihg"
ACCOUNTING_CLOSING_RUN_NOT_FOUND
ACCOUNTING_CLOSING_RUN_INVALID_STATUS
ACCOUNTING_CLOSING_RUN_ALREADY_RUNNING
ACCOUNTING_CLOSING_RUN_FAILED
ACCOUNTING_CLOSING_RUN_UNBALANCED_TRIAL_BALANCE
ACCOUNTING_CLOSING_RUN_DRAFT_ENTRIES_FOUND
ACCOUNTING_CLOSING_RUN_CROSS_TENANT_REFERENCE
```

---

## 25.11. Reports

```text id="nd18si"
ACCOUNTING_REPORT_FORBIDDEN
ACCOUNTING_REPORT_EXPORT_FAILED
ACCOUNTING_REPORT_PERIOD_REQUIRED
ACCOUNTING_REPORT_ACCOUNT_REQUIRED
ACCOUNTING_REPORT_CROSS_TENANT_REFERENCE
```

---

## 25.12. Security

```text id="tink6i"
ACCOUNTING_PUBLIC_ENDPOINT_FORBIDDEN
ACCOUNTING_ME_ENDPOINT_FORBIDDEN
ACCOUNTING_EXTERNAL_AI_FORBIDDEN
ACCOUNTING_PAYMENT_CREATION_FORBIDDEN
ACCOUNTING_ACCOUNT_STATEMENT_MUTATION_FORBIDDEN
ACCOUNTING_BANK_RECONCILIATION_CONFIRMATION_FORBIDDEN
```

---

# 26. Integración con módulos fuente

## 26.1. `004-dues-fees`

Eventos soportados inicialmente:

```text id="t2iatx"
charge.issued
charge.adjusted
charge.reversed
```

Regla:

```text id="ds08u9"
Accounting Ledger puede crear JournalEntry desde Charge, pero no modifica Charge.
```

---

## 26.2. `005-payments`

Eventos soportados inicialmente:

```text id="g7dgx7"
payment.allocated
payment.reversed
```

Regla:

```text id="lgmbmp"
Accounting Ledger puede crear JournalEntry desde PaymentAllocation, pero no crea Payment ni PaymentAllocation.
```

---

## 26.3. `017-bank-reconciliation`

Eventos futuros/controlados:

```text id="i88dw9"
bankTransaction.reconciled
bankFee.detected
bankInterest.detected
```

Regla:

```text id="jboiq4"
Accounting Ledger no confirma conciliación bancaria.
```

---

## 26.4. `018-payment-provider-integration`

Eventos futuros/controlados:

```text id="bxgm00"
providerSettlement.reviewed
providerFee.confirmed
```

Regla:

```text id="xsvkpr"
Provider settlements no se contabilizan como definitivos sin revisión o conciliación según política.
```

---

## 26.5. `019-open-banking-integration`

Regla MVP:

```text id="kyqh80"
Open Banking no genera JournalEntries directos.
```

---

## 26.6. `016-secure-document-storage`

Exports persistidos deben usar:

```json id="q4slfy"
{
  "sourceModule": "accountingLedger",
  "sourceResourceType": "accountingReportExport",
  "visibility": "administrative",
  "sensitivity": "restricted"
}
```

---

# 27. Auditoría

## 27.1. Eventos obligatorios

```text id="qr760t"
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

## 27.2. Metadata permitida

```text id="g19zxg"
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

## 27.3. Metadata prohibida

```text id="rtsrd3"
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

# 28. Observabilidad

## 28.1. Logs permitidos

```text id="fjbb25"
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

Campos permitidos:

```text id="ouucuw"
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

Campos prohibidos:

```text id="qcm17t"
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

## 28.2. Métricas

```text id="yyjj0p"
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

Labels permitidos:

```text id="ztr6xv"
entryType
entryStatus
sourceModule
sourceEventType
periodStatus
accountType
currency
outcome
```

Labels prohibidos:

```text id="wu1o4s"
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

# 29. OpenAPI

## 29.1. Tags

```text id="dwe3ck"
Accounting Policies
Chart of Accounts
Accounting Accounts
Accounting Periods
Accounting Mapping Rules
Journal Entries
Accounting Posting
Accounting Source Event Links
Accounting Closing Runs
Accounting Reports
```

---

## 29.2. Extensiones requeridas

Para endpoints tenant:

```yaml id="x1hgdt"
x-tenant-scope: true
x-auth-required: true
x-accounting-ledger: true
x-public-exposure: false
```

Para journal entries:

```yaml id="k62f1g"
x-double-entry-required: true
x-posted-entry-immutable: true
x-source-linked: true
x-idempotent-source-event: true
```

Para period closing:

```yaml id="sdj6gn"
x-period-aware: true
x-closing-operation: true
x-audit-required: true
```

Para reportes:

```yaml id="gbgzuk"
x-accounting-report: true
x-derived-from-posted-ledger: true
x-export-via-secure-document-storage: true
```

Para restricciones financieras:

```yaml id="tmcnb6"
x-creates-payment: false
x-updates-account-statement: false
x-confirms-bank-reconciliation: false
x-public-endpoint: false
```

Regla:

```text id="iswc8j"
OpenAPI no debe documentar endpoints públicos de Accounting Ledger ni endpoints /me en MVP.
```

---

# 30. Casos borde obligatorios

| Caso                                        | Resultado esperado                                      |
| ------------------------------------------- | ------------------------------------------------------- |
| Crear policy con `tenantId`                 | 422                                                     |
| Activar segunda policy active               | 409                                                     |
| Crear chart con `tenantId`                  | 422                                                     |
| Activar chart sin cuentas mínimas           | 409                                                     |
| Crear account con code duplicado            | 409                                                     |
| Crear account con parent cross-tenant       | 404/403                                                 |
| Crear account control sin permiso           | 403                                                     |
| Crear period con fechas inválidas           | 422                                                     |
| Crear period solapado                       | 409                                                     |
| Postear asiento sin líneas                  | 422                                                     |
| Postear asiento con debit != credit         | 422                                                     |
| Línea con debit y credit                    | 422                                                     |
| Línea con ambos montos cero                 | 422                                                     |
| Postear con cuenta inactive                 | 409                                                     |
| Postear en periodo closed                   | 409                                                     |
| Editar asiento posted                       | 409                                                     |
| Reversar asiento draft                      | 409                                                     |
| Reversar asiento ya reversed                | 409/idempotente                                         |
| Procesar source event duplicado             | 200 idempotente o 409 controlado                        |
| Crear asiento automático sin mapping rule   | 409/pending controlado                                  |
| Manual entry en control account sin permiso | 403                                                     |
| Trial balance no cuadra                     | closing run failed                                      |
| Cierre con draft críticos                   | closing run failed/completedWithWarnings según política |
| Export sin permiso                          | 403                                                     |
| Endpoint público existe                     | Falla crítica                                           |
| Endpoint /me existe                         | Falla crítica                                           |
| Ledger crea Payment                         | Falla crítica                                           |
| Ledger modifica Account Statement           | Falla crítica                                           |
| Ledger crea ReconciliationMatch             | Falla crítica                                           |
| Open Banking genera asiento directo MVP     | Falla crítica                                           |

---

# 31. No aceptación del contrato

La API no debe aceptarse si:

```text id="b70fer"
- acepta tenantId desde body;
- permite accounting policy cross-tenant;
- permite chart cross-tenant;
- permite account cross-tenant;
- permite period cross-tenant;
- permite mapping rule cross-tenant;
- permite journal entry cross-tenant;
- permite journal entry line cross-tenant;
- permite source event link cross-tenant;
- permite closing run cross-tenant;
- permite report cross-tenant;
- permite crear asiento sin líneas;
- permite postear asiento desbalanceado;
- permite línea con débito y crédito simultáneos;
- permite línea con ambos montos cero;
- permite editar asiento posted;
- permite borrar asiento posted;
- permite postear en periodo closed;
- permite postear manualmente en cuenta de control sin permiso;
- duplica asientos por source event;
- permite reportes derivados de tablas operativas sin ledger posted;
- crea Payment desde ledger;
- crea PaymentAllocation desde ledger;
- modifica Account Statements desde ledger;
- crea ReconciliationMatch desde ledger;
- marca conciliación bancaria final desde ledger;
- permite Open Banking direct posting en MVP;
- crea endpoints públicos contables;
- documenta endpoints públicos contables;
- crea endpoints /me contables;
- permite acceso contable desde WordPress;
- envía datos contables reales a IA externa;
- omite auditoría crítica;
- usa number/float/double para dinero.
```

---

# 32. Resultado esperado

Este contrato API define una superficie REST privada, tenant-scoped y segura para `020-accounting-ledger`.

Debe permitir:

```text id="tolavu"
- administrar AccountingPolicy;
- administrar ChartOfAccounts;
- administrar AccountingAccounts;
- administrar AccountingPeriods;
- administrar AccountingMappingRules;
- crear JournalEntries manuales;
- actualizar JournalEntries draft;
- aprobar JournalEntries;
- postear JournalEntries balanceados;
- impedir edición de posted;
- reversar JournalEntries posted;
- anular JournalEntries no posteados;
- procesar source events idempotentes;
- consultar AccountingSourceEventLinks;
- ejecutar AccountingClosingRuns;
- generar general journal;
- generar general ledger;
- generar trial balance;
- generar income and expense report;
- generar balance sheet básico;
- exportar reportes mediante Secure Document Storage;
- auditar operaciones críticas;
- mantener logs y métricas seguras;
- proteger tenant isolation;
- impedir endpoints públicos;
- impedir endpoints /me en MVP;
- impedir acceso desde WordPress;
- impedir Payment auto-creation;
- impedir Account Statements mutation;
- impedir Bank Reconciliation final confirmation;
- impedir Open Banking direct posting en MVP.
```

---

# 33. Expediente actualizado

```text id="rb4d76"
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
│   │       └── api-contract.md
```
