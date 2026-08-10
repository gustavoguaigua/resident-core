# API Contract — Spec 017 Bank Reconciliation

## 1. Información del documento

| Campo           | Valor                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------ |
| Proyecto        | RESIDENT Core                                                                                                |
| Spec ID         | 017                                                                                                          |
| Módulo          | Bank Reconciliation                                                                                          |
| Documento       | API Contract                                                                                                 |
| Ruta            | `docs/specs/017-bank-reconciliation/api-contract.md`                                                         |
| Versión         | 0.1                                                                                                          |
| Estado          | needs-review                                                                                                 |
| Fecha           | 2026-07-21                                                                                                   |
| Documento base  | `docs/specs/017-bank-reconciliation/spec.md`                                                                 |
| Plan técnico    | `docs/specs/017-bank-reconciliation/plan.md`                                                                 |
| Modelo de datos | `docs/specs/017-bank-reconciliation/data-model.md`                                                           |
| API Style       | REST                                                                                                         |
| API Version     | `/api/v1`                                                                                                    |
| Naturaleza      | Tenant-scoped / Financial-control / Import-driven / Match-aware / Exception-aware / Audit-heavy / Non-public |

---

## 2. Propósito

Este documento define el contrato REST del módulo `017-bank-reconciliation`.

El contrato cubre endpoints, permisos, DTOs, filtros, respuestas, errores, reglas de autorización, reglas de multitenancy, reglas financieras, integración con Secure Document Storage, integración con Payments, auditoría, observabilidad y restricciones de seguridad.

Regla central:

```text id="awn3v7"
Toda API de conciliación bancaria debe ser autenticada, autorizada, tenant-scoped, financial-control-aware, duplicate-safe, reversible, audit-heavy, no-public, sin exposición de datos bancarios completos, sin storageKey y sin confirmación automática irreversible.
```

---

## 3. Principios generales de la API

### 3.1. Base path

```text id="ebjhwk"
/api/v1
```

---

### 3.2. Scope

Todos los endpoints del módulo son privados.

No existen endpoints públicos para conciliación bancaria en MVP.

---

### 3.3. Autenticación

Todos los endpoints requieren:

```http id="rfjjci"
Authorization: Bearer <access_token>
```

Keycloak autentica.

RESIDENT Core autoriza.

---

### 3.4. Tenant efectivo

El tenant efectivo se obtiene desde el contexto autenticado:

```text id="h5si8s"
currentTenant.id
```

Prohibido aceptar `tenantId` desde body, query o path para operaciones tenant-scoped.

---

### 3.5. Formato JSON

Request y response usan JSON `camelCase`.

Base de datos usa `snake_case`.

---

### 3.6. Fechas

Fechas en ISO 8601.

```text id="tpgsjr"
2026-07-21T10:30:00-05:00
```

Internamente se normaliza a UTC.

---

### 3.7. Dinero

Montos como string decimal.

```json id="gd9847"
{
  "amount": "125.50",
  "currency": "USD"
}
```

Prohibido usar `number` para dinero en contratos externos.

---

### 3.8. Paginación

Parámetros estándar:

```text id="qu2p5p"
page
pageSize
sortBy
sortOrder
```

Reglas:

```text id="lvpxu2"
page >= 1
pageSize default = 20
pageSize max = 100
sortOrder = asc | desc
```

---

### 3.9. Idempotencia

Operaciones críticas pueden aceptar:

```http id="bvxaup"
Idempotency-Key: <key>
```

Aplicable especialmente a:

```text id="z04yiu"
- importación de archivo bancario;
- procesamiento de importación;
- creación de match;
- confirmación de match;
- reverso de match.
```

---

### 3.10. Respuesta estándar

```json id="h4sx54"
{
  "data": {},
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

### 3.11. Error estándar

```json id="pzf27d"
{
  "error": {
    "code": "BANK_ACCOUNT_NOT_FOUND",
    "message": "Bank account not found.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

## 4. Seguridad transversal

### 4.1. Reglas obligatorias

```text id="gmb5b0"
- no aceptar tenantId desde body;
- no aceptar createdBy, importedBy, confirmedBy o campos actor desde body;
- no exponer número completo de cuenta bancaria;
- no exponer accountNumberHash por DTO estándar;
- no exponer storageKey;
- no exponer signedUrl persistente;
- no exponer archivo bancario completo en JSON;
- no exponer fila bancaria completa sin sanitización;
- no conciliar paymentId de otro tenant;
- no conciliar bankTransactionId de otro tenant;
- no modificar pagos desde candidates;
- no confirmar matches automáticamente en MVP;
- no crear endpoints públicos;
- no enviar datos reales a IA externa.
```

---

### 4.2. Respuesta ante cross-tenant

Recomendación general:

```text id="kn9ykq"
Responder 404 para recursos pertenecientes a otro tenant.
```

Puede usarse 403 si la política del módulo lo requiere, pero debe ser consistente y no revelar existencia de recursos externos.

---

### 4.3. Headers recomendados

```http id="uxcwgy"
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
X-Request-Id: <request-id>
X-Correlation-Id: <correlation-id>
Idempotency-Key: <idempotency-key>
```

Para upload:

```http id="fulqqs"
Content-Type: multipart/form-data
```

---

## 5. Permisos

### 5.1. Cuentas bancarias

```text id="zgijj8"
bankAccounts.create
bankAccounts.read
bankAccounts.update
bankAccounts.activate
bankAccounts.deactivate
bankAccounts.archive
```

---

### 5.2. Importaciones bancarias

```text id="e018gq"
bankStatementImports.create
bankStatementImports.read
bankStatementImports.process
bankStatementImports.cancel
bankStatementImports.archive
```

---

### 5.3. Movimientos bancarios

```text id="sztc5e"
bankTransactions.read
bankTransactions.updateClassification
bankTransactions.ignore
bankTransactions.archive
```

---

### 5.4. Sesiones de conciliación

```text id="n3ue92"
reconciliationSessions.create
reconciliationSessions.read
reconciliationSessions.update
reconciliationSessions.close
reconciliationSessions.reopen
reconciliationSessions.archive
```

---

### 5.5. Candidatos

```text id="wjg1yp"
reconciliationCandidates.generate
reconciliationCandidates.read
reconciliationCandidates.accept
reconciliationCandidates.reject
```

---

### 5.6. Matches

```text id="fd435c"
reconciliationMatches.create
reconciliationMatches.read
reconciliationMatches.confirm
reconciliationMatches.reverse
reconciliationMatches.archive
```

---

### 5.7. Excepciones

```text id="snpzxd"
reconciliationExceptions.create
reconciliationExceptions.read
reconciliationExceptions.update
reconciliationExceptions.resolve
reconciliationExceptions.ignore
reconciliationExceptions.archive
```

---

### 5.8. Reportes

```text id="bwb57i"
reconciliationReports.read
reconciliationReports.export
```

---

### 5.9. Auditoría

```text id="selkzd"
reconciliation.audit.read
```

---

## 6. Enums expuestos por API

### 6.1. `BankAccountStatus`

```text id="g2rkg3"
draft
active
inactive
archived
```

---

### 6.2. `BankAccountType`

```text id="uup498"
checking
savings
virtual
cash
other
```

---

### 6.3. `Currency`

```text id="rn5jfz"
USD
```

---

### 6.4. `BankStatementImportType`

```text id="ib1fn4"
csv
xlsx
manual
apiFuture
```

MVP externo permitido:

```text id="xiw1aq"
csv
xlsx
```

---

### 6.5. `BankStatementImportStatus`

```text id="mcbhrl"
uploaded
validating
validated
processing
processed
processedWithWarnings
failed
cancelled
archived
```

---

### 6.6. `BankTransactionType`

```text id="zvce9k"
deposit
transferIn
transferOut
withdrawal
bankFee
interest
reversal
adjustment
unknown
other
```

---

### 6.7. `BankTransactionDirection`

```text id="cxrtd9"
credit
debit
neutral
```

---

### 6.8. `BankTransactionStatus`

```text id="cqbaax"
pending
candidateFound
matched
partiallyMatched
unmatched
duplicate
ignored
exception
archived
```

---

### 6.9. `ReconciliationSessionStatus`

```text id="sw5vfc"
draft
open
reviewing
closed
reopened
archived
```

---

### 6.10. `ReconciliationCandidateStatus`

```text id="paezyx"
suggested
accepted
rejected
expired
superseded
archived
```

---

### 6.11. `ReconciliationScoreBand`

```text id="mu60ts"
high
medium
low
ignored
```

---

### 6.12. `ReconciliationMatchType`

```text id="xk55bc"
oneBankTransactionToOnePayment
oneBankTransactionToManyPayments
manyBankTransactionsToOnePayment
manyToMany
manual
```

MVP permitido:

```text id="fmctpd"
oneBankTransactionToOnePayment
oneBankTransactionToManyPayments
manyBankTransactionsToOnePayment
manual
```

---

### 6.13. `ReconciliationMatchStatus`

```text id="fu21sf"
confirmed
reversed
archived
```

---

### 6.14. `ReconciliationExceptionType`

```text id="mxyj6c"
bankTransactionWithoutPayment
paymentWithoutBankTransaction
amountMismatch
dateMismatch
ambiguousReference
duplicateBankTransaction
duplicatePaymentCandidate
bankFee
interest
reversal
transferBetweenAccounts
unknownDeposit
manualReview
other
```

---

### 6.15. `ReconciliationExceptionStatus`

```text id="ewevpz"
open
inReview
resolved
ignored
archived
```

---

### 6.16. `ReconciliationExceptionSeverity`

```text id="ah016u"
low
medium
high
critical
```

---

# 7. API — Cuentas bancarias

## 7.1. `GET /api/v1/tenant/bank-accounts`

Lista cuentas bancarias del tenant activo.

### Permiso

```text id="dtacss"
bankAccounts.read
```

### Query params

```text id="z85ey9"
status
currency
accountType
isDefault
archived
q
page
pageSize
sortBy
sortOrder
```

### Sort permitido

```text id="x5vs4d"
createdAt
updatedAt
bankName
accountName
status
```

### Response `200`

```json id="qla721"
{
  "data": [
    {
      "id": "bank_account_uuid",
      "bankName": "Banco Demo",
      "accountName": "Cuenta Administración",
      "accountNumberMasked": "**** **** 1234",
      "accountType": "checking",
      "currency": "USD",
      "status": "active",
      "isDefault": true,
      "description": "Cuenta principal del conjunto",
      "createdAt": "2026-07-21T10:00:00Z",
      "updatedAt": "2026-07-21T10:00:00Z",
      "activatedAt": "2026-07-21T10:05:00Z",
      "deactivatedAt": null,
      "archivedAt": null
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

### No debe incluir

```text id="ggvrhu"
accountNumber completo
accountNumberHash
tenantId
```

---

## 7.2. `POST /api/v1/tenant/bank-accounts`

Crea una cuenta bancaria.

### Permiso

```text id="n3trr6"
bankAccounts.create
```

### Request body

```json id="t09ppb"
{
  "bankName": "Banco Demo",
  "accountName": "Cuenta Administración",
  "accountNumber": "1234567890",
  "accountType": "checking",
  "currency": "USD",
  "isDefault": true,
  "description": "Cuenta principal del conjunto",
  "metadata": {
    "notes": "Cuenta para recepción de alícuotas"
  }
}
```

### Reglas

```text id="xdoegd"
- accountNumber se recibe solo para generar accountNumberMasked y accountNumberHash;
- accountNumber completo no se devuelve;
- accountNumber completo no se guarda en metadata;
- currency debe ser USD en MVP;
- tenantId se deriva del contexto;
- audita bankAccount.created.
```

### Response `201`

```json id="z1m2nx"
{
  "data": {
    "id": "bank_account_uuid",
    "bankName": "Banco Demo",
    "accountName": "Cuenta Administración",
    "accountNumberMasked": "**** **** 7890",
    "accountType": "checking",
    "currency": "USD",
    "status": "draft",
    "isDefault": true,
    "description": "Cuenta principal del conjunto",
    "createdAt": "2026-07-21T10:00:00Z",
    "updatedAt": "2026-07-21T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Rechazar

```text id="fsd5ae"
tenantId
accountNumberHash
status
createdBy
updatedBy
archivedBy
createdAt
updatedAt
metadata con accountNumber completo
metadata con secretos
```

---

## 7.3. `GET /api/v1/tenant/bank-accounts/{bankAccountId}`

Obtiene una cuenta bancaria.

### Permiso

```text id="y73k71"
bankAccounts.read
```

### Response `200`

```json id="nv82q2"
{
  "data": {
    "id": "bank_account_uuid",
    "bankName": "Banco Demo",
    "accountName": "Cuenta Administración",
    "accountNumberMasked": "**** **** 7890",
    "accountType": "checking",
    "currency": "USD",
    "status": "active",
    "isDefault": true,
    "description": "Cuenta principal del conjunto",
    "createdAt": "2026-07-21T10:00:00Z",
    "updatedAt": "2026-07-21T10:00:00Z",
    "activatedAt": "2026-07-21T10:05:00Z",
    "deactivatedAt": null,
    "archivedAt": null,
    "metadata": {
      "notes": "Cuenta para recepción de alícuotas"
    }
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 7.4. `PATCH /api/v1/tenant/bank-accounts/{bankAccountId}`

Actualiza metadata básica de una cuenta bancaria.

### Permiso

```text id="s87ttv"
bankAccounts.update
```

### Request body

```json id="i3tlqb"
{
  "bankName": "Banco Demo",
  "accountName": "Cuenta Administración Actualizada",
  "accountType": "checking",
  "isDefault": true,
  "description": "Cuenta principal actualizada",
  "metadata": {
    "notes": "Actualización administrativa"
  }
}
```

### Reglas

```text id="q8cuuy"
- no cambia accountNumber en PATCH ordinario;
- cambio de número de cuenta requiere flujo futuro específico;
- no cambia status;
- no acepta tenantId;
- audita bankAccount.updated.
```

### Response `200`

Devuelve `BankAccountDto`.

---

## 7.5. `POST /api/v1/tenant/bank-accounts/{bankAccountId}/activate`

Activa una cuenta bancaria.

### Permiso

```text id="ustw4t"
bankAccounts.activate
```

### Request body

```json id="at46ev"
{
  "reason": "Cuenta validada por administración"
}
```

### Response `200`

```json id="f6pfz6"
{
  "data": {
    "id": "bank_account_uuid",
    "status": "active",
    "activatedAt": "2026-07-21T10:05:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 7.6. `POST /api/v1/tenant/bank-accounts/{bankAccountId}/deactivate`

Desactiva una cuenta bancaria.

### Permiso

```text id="asf64k"
bankAccounts.deactivate
```

### Request body

```json id="net6vd"
{
  "reason": "Cuenta temporalmente no usada"
}
```

### Response `200`

```json id="s80mey"
{
  "data": {
    "id": "bank_account_uuid",
    "status": "inactive",
    "deactivatedAt": "2026-07-21T11:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 7.7. `POST /api/v1/tenant/bank-accounts/{bankAccountId}/archive`

Archiva una cuenta bancaria.

### Permiso

```text id="fjmv0q"
bankAccounts.archive
```

### Request body

```json id="u5a0rk"
{
  "reason": "Cuenta reemplazada por nueva cuenta bancaria"
}
```

### Reglas

```text id="iu88uy"
- no elimina movimientos;
- no elimina sesiones;
- no elimina importaciones;
- puede bloquear si existen sesiones abiertas;
- audita bankAccount.archived.
```

### Response `200`

```json id="yza8g0"
{
  "data": {
    "id": "bank_account_uuid",
    "status": "archived",
    "archivedAt": "2026-07-21T12:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 8. API — Importaciones bancarias

## 8.1. `GET /api/v1/tenant/bank-statement-imports`

Lista importaciones.

### Permiso

```text id="h5xrj4"
bankStatementImports.read
```

### Query params

```text id="u924py"
bankAccountId
status
importType
periodStart
periodEnd
importedFrom
importedTo
processedFrom
processedTo
archived
page
pageSize
sortBy
sortOrder
```

### Response `200`

```json id="lpkmjv"
{
  "data": [
    {
      "id": "import_uuid",
      "bankAccountId": "bank_account_uuid",
      "importType": "csv",
      "originalFileName": "movimientos-julio.csv",
      "hashPrefix": "a1b2c3d4",
      "hashAlgorithm": "SHA-256",
      "status": "processedWithWarnings",
      "periodStart": "2026-07-01",
      "periodEnd": "2026-07-31",
      "importedAt": "2026-07-21T10:00:00Z",
      "processedAt": "2026-07-21T10:01:00Z",
      "totalRows": 100,
      "validRows": 96,
      "invalidRows": 2,
      "duplicateRows": 2,
      "createdTransactions": 96
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

### No debe incluir

```text id="g9c5pe"
fileHash completo
storageKey
archivo completo
filas completas
```

---

## 8.2. `POST /api/v1/tenant/bank-accounts/{bankAccountId}/statement-imports`

Carga un archivo CSV/XLSX de movimientos bancarios.

### Permiso

```text id="czyczj"
bankStatementImports.create
```

### Content-Type

```http id="zqarkl"
multipart/form-data
```

### Multipart fields

```text id="um5xzi"
file
importType
periodStart
periodEnd
templateKey
description
metadata
```

### Ejemplo conceptual

```text id="gmt188"
file = movimientos-julio.csv
importType = csv
periodStart = 2026-07-01
periodEnd = 2026-07-31
templateKey = genericCsv
description = Estado bancario julio
```

### Reglas

```text id="ryenkt"
- bankAccount debe pertenecer al tenant;
- bankAccount debe estar active;
- file obligatorio;
- CSV/XLSX únicamente;
- archivo no vacío;
- archivo se guarda en Secure Document Storage;
- no aceptar storageKey;
- calcular fileHash en servidor;
- crear BankStatementImport status uploaded;
- auditar bankStatementImport.created.
```

### Response `201`

```json id="vj2ycq"
{
  "data": {
    "id": "import_uuid",
    "bankAccountId": "bank_account_uuid",
    "secureDocumentId": "secure_document_uuid",
    "secureDocumentFileId": "secure_document_file_uuid",
    "importType": "csv",
    "originalFileName": "movimientos-julio.csv",
    "hashPrefix": "a1b2c3d4",
    "hashAlgorithm": "SHA-256",
    "status": "uploaded",
    "periodStart": "2026-07-01",
    "periodEnd": "2026-07-31",
    "totalRows": 0,
    "validRows": 0,
    "invalidRows": 0,
    "duplicateRows": 0,
    "createdTransactions": 0,
    "importedAt": "2026-07-21T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 8.3. `GET /api/v1/tenant/bank-statement-imports/{importId}`

Obtiene detalle de una importación.

### Permiso

```text id="g22pvw"
bankStatementImports.read
```

### Response `200`

```json id="funbr1"
{
  "data": {
    "id": "import_uuid",
    "bankAccountId": "bank_account_uuid",
    "secureDocumentId": "secure_document_uuid",
    "secureDocumentFileId": "secure_document_file_uuid",
    "importType": "csv",
    "originalFileName": "movimientos-julio.csv",
    "hashPrefix": "a1b2c3d4",
    "hashAlgorithm": "SHA-256",
    "status": "processed",
    "periodStart": "2026-07-01",
    "periodEnd": "2026-07-31",
    "importedAt": "2026-07-21T10:00:00Z",
    "processedAt": "2026-07-21T10:01:00Z",
    "totalRows": 100,
    "validRows": 100,
    "invalidRows": 0,
    "duplicateRows": 0,
    "createdTransactions": 100,
    "errorSummary": null,
    "metadata": {
      "templateKey": "genericCsv"
    }
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 8.4. `POST /api/v1/tenant/bank-statement-imports/{importId}/validate`

Valida una importación cargada sin crear movimientos finales, si la política separa validación y procesamiento.

### Permiso

```text id="gcux9w"
bankStatementImports.process
```

### Request body

```json id="nhnsel"
{
  "templateKey": "genericCsv",
  "strictMode": false
}
```

### Response `200`

```json id="orjte2"
{
  "data": {
    "id": "import_uuid",
    "status": "validated",
    "totalRows": 100,
    "validRows": 98,
    "invalidRows": 2,
    "duplicateRows": 0,
    "errorSummary": {
      "errors": 2,
      "warnings": 0
    }
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 8.5. `POST /api/v1/tenant/bank-statement-imports/{importId}/process`

Procesa la importación y crea movimientos bancarios normalizados.

### Permiso

```text id="l56o2v"
bankStatementImports.process
```

### Request body

```json id="w32srv"
{
  "templateKey": "genericCsv",
  "strictMode": false,
  "allowPartialProcessing": true,
  "duplicatePolicy": "markDuplicate"
}
```

### Reglas

```text id="s2uv9x"
- import debe pertenecer al tenant;
- import debe estar uploaded o validated;
- cuenta debe estar active;
- archivo debe existir en Secure Document Storage;
- calcular fingerprint por movimiento;
- no duplicar movimientos;
- registrar errores por fila;
- crear BankTransaction para filas válidas;
- actualizar conteos;
- auditar bankStatementImport.processed.
```

### Response `200`

```json id="a34ia0"
{
  "data": {
    "id": "import_uuid",
    "status": "processedWithWarnings",
    "totalRows": 100,
    "validRows": 96,
    "invalidRows": 2,
    "duplicateRows": 2,
    "createdTransactions": 96,
    "processedAt": "2026-07-21T10:01:00Z",
    "errorSummary": {
      "errors": 2,
      "warnings": 2,
      "duplicates": 2
    }
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 8.6. `POST /api/v1/tenant/bank-statement-imports/{importId}/cancel`

Cancela una importación no procesada.

### Permiso

```text id="m7o6o7"
bankStatementImports.cancel
```

### Request body

```json id="f38bhu"
{
  "reason": "Archivo cargado por error"
}
```

### Response `200`

```json id="re4c3n"
{
  "data": {
    "id": "import_uuid",
    "status": "cancelled",
    "cancelledAt": "2026-07-21T11:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 8.7. `POST /api/v1/tenant/bank-statement-imports/{importId}/archive`

Archiva una importación.

### Permiso

```text id="kl99wn"
bankStatementImports.archive
```

### Request body

```json id="ta01tb"
{
  "reason": "Importación histórica archivada"
}
```

### Response `200`

```json id="wi888o"
{
  "data": {
    "id": "import_uuid",
    "status": "archived",
    "archivedAt": "2026-07-21T12:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 8.8. `GET /api/v1/tenant/bank-statement-imports/{importId}/errors`

Lista errores de importación.

### Permiso

```text id="s59zb2"
bankStatementImports.read
```

### Query params

```text id="vzqixs"
severity
errorCode
page
pageSize
sortBy
sortOrder
```

### Response `200`

```json id="dmdrd8"
{
  "data": [
    {
      "id": "import_error_uuid",
      "statementImportId": "import_uuid",
      "rowNumber": 12,
      "errorCode": "BANK_STATEMENT_IMPORT_ROW_INVALID",
      "errorMessage": "Amount is required.",
      "severity": "error",
      "rawRowPreview": {
        "transactionDate": "2026-07-10",
        "amount": null,
        "currency": "USD"
      },
      "normalizedPreview": null,
      "createdAt": "2026-07-21T10:01:00Z"
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

# 9. API — Movimientos bancarios

## 9.1. `GET /api/v1/tenant/bank-transactions`

Lista movimientos bancarios.

### Permiso

```text id="qjckrd"
bankTransactions.read
```

### Query params

```text id="qifzda"
bankAccountId
statementImportId
transactionDateFrom
transactionDateTo
postedDateFrom
postedDateTo
direction
transactionType
status
isDuplicate
amountMin
amountMax
currency
q
page
pageSize
sortBy
sortOrder
```

### Sort permitido

```text id="a4fdh0"
transactionDate
postedDate
amount
status
createdAt
```

### Response `200`

```json id="qmi3pt"
{
  "data": [
    {
      "id": "bank_transaction_uuid",
      "bankAccountId": "bank_account_uuid",
      "statementImportId": "import_uuid",
      "transactionDate": "2026-07-10",
      "postedDate": "2026-07-10",
      "description": "DEPÓSITO TRANSFERENCIA ALÍCUOTA",
      "referencePreview": "REF***123",
      "bankReferencePreview": "BNK***456",
      "transactionType": "deposit",
      "direction": "credit",
      "amount": "125.50",
      "currency": "USD",
      "balanceAfter": "1520.75",
      "status": "pending",
      "isDuplicate": false,
      "duplicateOfTransactionId": null,
      "createdAt": "2026-07-21T10:01:00Z",
      "updatedAt": "2026-07-21T10:01:00Z"
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

### No debe incluir

```text id="s32sf6"
fingerprint
referencia completa sensible
bankReference completa sensible
archivo bancario completo
tenantId
```

---

## 9.2. `GET /api/v1/tenant/bank-transactions/{bankTransactionId}`

Obtiene detalle de un movimiento bancario.

### Permiso

```text id="ik89lk"
bankTransactions.read
```

### Response `200`

```json id="iyurjl"
{
  "data": {
    "id": "bank_transaction_uuid",
    "bankAccountId": "bank_account_uuid",
    "statementImportId": "import_uuid",
    "transactionDate": "2026-07-10",
    "postedDate": "2026-07-10",
    "description": "DEPÓSITO TRANSFERENCIA ALÍCUOTA",
    "referencePreview": "REF***123",
    "bankReferencePreview": "BNK***456",
    "transactionType": "deposit",
    "direction": "credit",
    "amount": "125.50",
    "currency": "USD",
    "balanceAfter": "1520.75",
    "status": "pending",
    "isDuplicate": false,
    "duplicateOfTransactionId": null,
    "createdAt": "2026-07-21T10:01:00Z",
    "updatedAt": "2026-07-21T10:01:00Z",
    "metadata": {
      "importTemplate": "genericCsv"
    }
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 9.3. `PATCH /api/v1/tenant/bank-transactions/{bankTransactionId}/classification`

Actualiza clasificación del movimiento.

### Permiso

```text id="dlg22x"
bankTransactions.updateClassification
```

### Request body

```json id="h25gvs"
{
  "transactionType": "bankFee",
  "reason": "Comisión bancaria identificada"
}
```

### Response `200`

```json id="gp4azx"
{
  "data": {
    "id": "bank_transaction_uuid",
    "transactionType": "bankFee",
    "classificationUpdatedAt": "2026-07-21T12:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 9.4. `POST /api/v1/tenant/bank-transactions/{bankTransactionId}/ignore`

Marca un movimiento como ignorado.

### Permiso

```text id="vukxeg"
bankTransactions.ignore
```

### Request body

```json id="eyra7w"
{
  "reason": "Movimiento informativo sin impacto en conciliación"
}
```

### Reglas

```text id="qftpt2"
- movimiento debe pertenecer al tenant;
- movimiento no debe estar matched;
- sesión cerrada relacionada puede bloquear la operación;
- audita bankTransaction.ignored.
```

### Response `200`

```json id="bczt4r"
{
  "data": {
    "id": "bank_transaction_uuid",
    "status": "ignored",
    "ignoredAt": "2026-07-21T12:10:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 9.5. `POST /api/v1/tenant/bank-transactions/{bankTransactionId}/archive`

Archiva un movimiento.

### Permiso

```text id="debeiv"
bankTransactions.archive
```

### Request body

```json id="fsopig"
{
  "reason": "Movimiento histórico archivado"
}
```

### Response `200`

```json id="al6zn6"
{
  "data": {
    "id": "bank_transaction_uuid",
    "status": "archived",
    "archivedAt": "2026-07-21T12:20:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 10. API — Sesiones de conciliación

## 10.1. `GET /api/v1/tenant/reconciliation-sessions`

Lista sesiones de conciliación.

### Permiso

```text id="czivib"
reconciliationSessions.read
```

### Query params

```text id="wcsp4l"
bankAccountId
status
periodStart
periodEnd
createdFrom
createdTo
closedFrom
closedTo
page
pageSize
sortBy
sortOrder
```

### Response `200`

```json id="mr6qe6"
{
  "data": [
    {
      "id": "session_uuid",
      "bankAccountId": "bank_account_uuid",
      "periodStart": "2026-07-01",
      "periodEnd": "2026-07-31",
      "status": "open",
      "openingBalance": "1000.00",
      "closingBalance": null,
      "totalBankCredits": "500.00",
      "totalBankDebits": "50.00",
      "totalMatchedAmount": "300.00",
      "totalUnmatchedAmount": "200.00",
      "totalExceptions": 1,
      "createdAt": "2026-07-21T10:00:00Z",
      "openedAt": "2026-07-21T10:05:00Z",
      "closedAt": null
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

## 10.2. `POST /api/v1/tenant/reconciliation-sessions`

Crea una sesión de conciliación.

### Permiso

```text id="m3ptfu"
reconciliationSessions.create
```

### Request body

```json id="n1xq8n"
{
  "bankAccountId": "bank_account_uuid",
  "periodStart": "2026-07-01",
  "periodEnd": "2026-07-31",
  "openingBalance": "1000.00",
  "metadata": {
    "notes": "Conciliación julio"
  }
}
```

### Reglas

```text id="v8ec3g"
- bankAccount debe pertenecer al tenant;
- bankAccount debe estar active;
- periodStart <= periodEnd;
- no duplicar sesión activa para misma cuenta y periodo;
- status inicial draft;
- audita reconciliationSession.created.
```

### Response `201`

```json id="jxlwec"
{
  "data": {
    "id": "session_uuid",
    "bankAccountId": "bank_account_uuid",
    "periodStart": "2026-07-01",
    "periodEnd": "2026-07-31",
    "status": "draft",
    "openingBalance": "1000.00",
    "closingBalance": null,
    "totalBankCredits": "0.00",
    "totalBankDebits": "0.00",
    "totalMatchedAmount": "0.00",
    "totalUnmatchedAmount": "0.00",
    "totalExceptions": 0,
    "createdAt": "2026-07-21T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 10.3. `GET /api/v1/tenant/reconciliation-sessions/{sessionId}`

Obtiene una sesión.

### Permiso

```text id="gyx70q"
reconciliationSessions.read
```

### Response `200`

Devuelve `ReconciliationSessionDto`.

---

## 10.4. `PATCH /api/v1/tenant/reconciliation-sessions/{sessionId}`

Actualiza datos permitidos de una sesión no cerrada.

### Permiso

```text id="mpd4kx"
reconciliationSessions.update
```

### Request body

```json id="hfbac4"
{
  "openingBalance": "1000.00",
  "closingBalance": "1550.00",
  "metadata": {
    "notes": "Balance revisado"
  }
}
```

### Reglas

```text id="o4h0xa"
- no permite modificar sesión closed o archived;
- no permite cambiar tenantId;
- no permite cambiar status directamente;
- audita reconciliationSession.updated.
```

### Response `200`

Devuelve `ReconciliationSessionDto`.

---

## 10.5. `POST /api/v1/tenant/reconciliation-sessions/{sessionId}/open`

Abre una sesión en draft.

### Permiso

```text id="ked95x"
reconciliationSessions.update
```

### Request body

```json id="zbbt02"
{
  "reason": "Inicio de revisión mensual"
}
```

### Response `200`

```json id="pplzsk"
{
  "data": {
    "id": "session_uuid",
    "status": "open",
    "openedAt": "2026-07-21T10:05:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 10.6. `POST /api/v1/tenant/reconciliation-sessions/{sessionId}/close`

Cierra una sesión de conciliación.

### Permiso

```text id="la239c"
reconciliationSessions.close
```

### Request body

```json id="d6fv0s"
{
  "closingBalance": "1550.00",
  "reason": "Conciliación de julio revisada y cerrada"
}
```

### Reglas

```text id="oc01lv"
- sesión debe estar open, reviewing o reopened;
- puede bloquear si existen excepciones high/critical abiertas;
- calcula resumen final;
- bloquea cambios ordinarios;
- audita reconciliationSession.closed.
```

### Response `200`

```json id="uai27x"
{
  "data": {
    "id": "session_uuid",
    "status": "closed",
    "closingBalance": "1550.00",
    "closedAt": "2026-07-21T18:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 10.7. `POST /api/v1/tenant/reconciliation-sessions/{sessionId}/reopen`

Reabre una sesión cerrada.

### Permiso

```text id="auaiap"
reconciliationSessions.reopen
```

### Request body

```json id="amts5f"
{
  "reason": "Se detectó un pago conciliado incorrectamente"
}
```

### Reglas

```text id="mhl96f"
- sesión debe estar closed;
- requiere razón;
- requiere auditoría reforzada;
- no pierde historial;
- audita reconciliationSession.reopened.
```

### Response `200`

```json id="um0tds"
{
  "data": {
    "id": "session_uuid",
    "status": "reopened",
    "reopenedAt": "2026-07-22T09:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 10.8. `POST /api/v1/tenant/reconciliation-sessions/{sessionId}/archive`

Archiva una sesión.

### Permiso

```text id="g1tfdu"
reconciliationSessions.archive
```

### Request body

```json id="ulaczz"
{
  "reason": "Sesión histórica archivada"
}
```

### Response `200`

```json id="jvxbsg"
{
  "data": {
    "id": "session_uuid",
    "status": "archived",
    "archivedAt": "2026-07-22T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 10.9. `GET /api/v1/tenant/reconciliation-sessions/{sessionId}/summary`

Obtiene resumen de sesión.

### Permiso

```text id="dsftfe"
reconciliationSessions.read
```

### Response `200`

```json id="u93d9m"
{
  "data": {
    "sessionId": "session_uuid",
    "bankAccountId": "bank_account_uuid",
    "periodStart": "2026-07-01",
    "periodEnd": "2026-07-31",
    "status": "open",
    "totalBankCredits": "500.00",
    "totalBankDebits": "50.00",
    "totalMatchedAmount": "300.00",
    "totalUnmatchedAmount": "200.00",
    "bankTransactionsCount": 10,
    "matchedTransactionsCount": 6,
    "unmatchedTransactionsCount": 4,
    "paymentsMatchedCount": 6,
    "paymentsUnmatchedCount": 3,
    "exceptionsOpenCount": 1,
    "exceptionsCriticalCount": 0
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 11. API — Candidatos de conciliación

## 11.1. `GET /api/v1/tenant/reconciliation-sessions/{sessionId}/candidates`

Lista candidatos de una sesión.

### Permiso

```text id="s5lgy0"
reconciliationCandidates.read
```

### Query params

```text id="x0opp2"
bankTransactionId
paymentId
status
scoreMin
scoreMax
scoreBand
matchType
page
pageSize
sortBy
sortOrder
```

### Response `200`

```json id="ussmpb"
{
  "data": [
    {
      "id": "candidate_uuid",
      "reconciliationSessionId": "session_uuid",
      "bankTransactionId": "bank_transaction_uuid",
      "paymentId": "payment_uuid",
      "score": 95,
      "scoreBand": "high",
      "scoreReason": {
        "amount": "exact",
        "date": "within_1_day",
        "reference": "partial_match"
      },
      "matchType": "oneBankTransactionToOnePayment",
      "status": "suggested",
      "createdAt": "2026-07-21T10:30:00Z",
      "expiresAt": "2026-08-01T00:00:00Z"
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

## 11.2. `POST /api/v1/tenant/reconciliation-sessions/{sessionId}/candidates/generate`

Genera candidatos determinísticos.

### Permiso

```text id="wbzstx"
reconciliationCandidates.generate
```

### Request body

```json id="vih37g"
{
  "bankAccountId": "bank_account_uuid",
  "dateToleranceDays": 3,
  "amountTolerance": "0.00",
  "minScore": 50,
  "includeAlreadySuggested": false
}
```

### Reglas

```text id="zrkpmv"
- sesión debe estar open, reviewing o reopened;
- no genera candidatos para sesión closed;
- no modifica pagos;
- no confirma matches;
- no modifica bankTransactions salvo que la política marque candidateFound después de persistir candidatos;
- score debe ser determinístico;
- audita reconciliationCandidate.generated.
```

### Response `200`

```json id="awpg2j"
{
  "data": {
    "sessionId": "session_uuid",
    "generatedCandidates": 12,
    "highScoreCandidates": 5,
    "mediumScoreCandidates": 4,
    "lowScoreCandidates": 3,
    "ignoredPairs": 20
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 11.3. `GET /api/v1/tenant/reconciliation-candidates/{candidateId}`

Obtiene un candidato.

### Permiso

```text id="ctew2h"
reconciliationCandidates.read
```

### Response `200`

Devuelve `ReconciliationCandidateDto`.

---

## 11.4. `POST /api/v1/tenant/reconciliation-candidates/{candidateId}/accept`

Acepta un candidato.

### Permiso

```text id="d9eodm"
reconciliationCandidates.accept
```

### Request body

```json id="fbz7z5"
{
  "notes": "Coincidencia verificada visualmente"
}
```

### Reglas

```text id="v9qzwg"
- aceptar candidate no necesariamente confirma match si se usa flujo separado;
- puede crear match en estado confirmed solo si el endpoint se define como aceptación confirmatoria;
- decisión recomendada MVP: accept crea un ReconciliationMatch confirmado;
- debe auditar reconciliationCandidate.accepted y reconciliationMatch.confirmed.
```

### Response `200`

```json id="vq0fcc"
{
  "data": {
    "candidateId": "candidate_uuid",
    "status": "accepted",
    "matchId": "match_uuid"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 11.5. `POST /api/v1/tenant/reconciliation-candidates/{candidateId}/reject`

Rechaza un candidato.

### Permiso

```text id="s65klh"
reconciliationCandidates.reject
```

### Request body

```json id="rlgkg6"
{
  "reason": "Referencia no corresponde al pago sugerido"
}
```

### Response `200`

```json id="b4cdok"
{
  "data": {
    "id": "candidate_uuid",
    "status": "rejected",
    "reviewedAt": "2026-07-21T11:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 12. API — Matches de conciliación

## 12.1. `GET /api/v1/tenant/reconciliation-sessions/{sessionId}/matches`

Lista matches de una sesión.

### Permiso

```text id="j4g4p1"
reconciliationMatches.read
```

### Query params

```text id="m142o6"
status
matchType
paymentId
bankTransactionId
confirmedFrom
confirmedTo
reversedFrom
reversedTo
page
pageSize
sortBy
sortOrder
```

### Response `200`

```json id="nsonmt"
{
  "data": [
    {
      "id": "match_uuid",
      "reconciliationSessionId": "session_uuid",
      "matchType": "oneBankTransactionToOnePayment",
      "status": "confirmed",
      "totalBankAmount": "125.50",
      "totalPaymentAmount": "125.50",
      "differenceAmount": "0.00",
      "differenceReason": null,
      "confirmedAt": "2026-07-21T11:10:00Z",
      "reversedAt": null
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

## 12.2. `POST /api/v1/tenant/reconciliation-sessions/{sessionId}/matches`

Crea y confirma un match manual.

### Permiso

```text id="lh01ox"
reconciliationMatches.create
```

### Request body — 1:1

```json id="u2bu9r"
{
  "matchType": "oneBankTransactionToOnePayment",
  "bankTransactionIds": ["bank_transaction_uuid"],
  "paymentIds": ["payment_uuid"],
  "differenceReason": null,
  "notes": "Conciliación manual verificada"
}
```

### Request body — 1:N

```json id="xifuzd"
{
  "matchType": "oneBankTransactionToManyPayments",
  "bankTransactionIds": ["bank_transaction_uuid"],
  "paymentIds": ["payment_uuid_1", "payment_uuid_2"],
  "differenceReason": null,
  "notes": "Depósito agrupado"
}
```

### Request body — N:1

```json id="whqr2y"
{
  "matchType": "manyBankTransactionsToOnePayment",
  "bankTransactionIds": ["bank_transaction_uuid_1", "bank_transaction_uuid_2"],
  "paymentIds": ["payment_uuid"],
  "differenceReason": null,
  "notes": "Pago dividido en dos transferencias"
}
```

### Reglas

```text id="h4trmr"
- session debe pertenecer al tenant;
- session debe estar open, reviewing o reopened;
- bankTransactionIds deben pertenecer al tenant;
- paymentIds deben pertenecer al tenant;
- pagos deben estar en estado conciliable;
- movimientos deben estar en estado conciliable;
- diferencia requiere reason;
- crea reconciliationMatch;
- crea reconciliationMatchItems;
- actualiza bankTransactions;
- actualiza Payments mediante PaymentReconciliationPort;
- audita reconciliationMatch.confirmed.
```

### Response `201`

```json id="c2yzvq"
{
  "data": {
    "id": "match_uuid",
    "reconciliationSessionId": "session_uuid",
    "matchType": "oneBankTransactionToOnePayment",
    "status": "confirmed",
    "totalBankAmount": "125.50",
    "totalPaymentAmount": "125.50",
    "differenceAmount": "0.00",
    "differenceReason": null,
    "confirmedAt": "2026-07-21T11:10:00Z",
    "items": [
      {
        "id": "item_uuid_1",
        "itemType": "bankTransaction",
        "bankTransactionId": "bank_transaction_uuid",
        "paymentId": null,
        "amountApplied": "125.50",
        "currency": "USD"
      },
      {
        "id": "item_uuid_2",
        "itemType": "payment",
        "bankTransactionId": null,
        "paymentId": "payment_uuid",
        "amountApplied": "125.50",
        "currency": "USD"
      }
    ]
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 12.3. `GET /api/v1/tenant/reconciliation-matches/{matchId}`

Obtiene un match.

### Permiso

```text id="vy3alw"
reconciliationMatches.read
```

### Response `200`

Devuelve `ReconciliationMatchDto` con `items`.

---

## 12.4. `POST /api/v1/tenant/reconciliation-matches/{matchId}/confirm`

Confirma un match si se permite flujo de creación previa no confirmada.

### Permiso

```text id="ev249c"
reconciliationMatches.confirm
```

### Request body

```json id="ur7m6v"
{
  "notes": "Confirmación revisada por administración"
}
```

### Nota MVP

Decisión recomendada:

```text id="dkc3kj"
En MVP, POST /matches crea directamente un match confirmado. Este endpoint se conserva para compatibilidad futura o para flujos donde primero se crea un match draft.
```

### Response `200`

```json id="um6p7o"
{
  "data": {
    "id": "match_uuid",
    "status": "confirmed",
    "confirmedAt": "2026-07-21T11:15:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 12.5. `POST /api/v1/tenant/reconciliation-matches/{matchId}/reverse`

Revierte un match confirmado.

### Permiso

```text id="dyu8a7"
reconciliationMatches.reverse
```

### Request body

```json id="zlqbuc"
{
  "reason": "El movimiento correspondía a otro pago"
}
```

### Reglas

```text id="m8pob0"
- match debe estar confirmed;
- requiere reason;
- no elimina match;
- no elimina items;
- cambia status a reversed;
- actualiza bankTransactions;
- actualiza Payment.reconciliationStatus;
- audita reconciliationMatch.reversed.
```

### Response `200`

```json id="zlvgpn"
{
  "data": {
    "id": "match_uuid",
    "status": "reversed",
    "reversedAt": "2026-07-21T12:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 12.6. `POST /api/v1/tenant/reconciliation-matches/{matchId}/archive`

Archiva un match.

### Permiso

```text id="ht7aw8"
reconciliationMatches.archive
```

### Request body

```json id="uuvaag"
{
  "reason": "Match histórico archivado"
}
```

### Response `200`

```json id="rx1z0o"
{
  "data": {
    "id": "match_uuid",
    "status": "archived",
    "archivedAt": "2026-07-22T09:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 13. API — Excepciones

## 13.1. `GET /api/v1/tenant/reconciliation-sessions/{sessionId}/exceptions`

Lista excepciones de una sesión.

### Permiso

```text id="vrhjpr"
reconciliationExceptions.read
```

### Query params

```text id="trf107"
bankTransactionId
paymentId
exceptionType
status
severity
createdFrom
createdTo
resolvedFrom
resolvedTo
page
pageSize
sortBy
sortOrder
```

### Response `200`

```json id="i12mo8"
{
  "data": [
    {
      "id": "exception_uuid",
      "reconciliationSessionId": "session_uuid",
      "bankTransactionId": "bank_transaction_uuid",
      "paymentId": null,
      "exceptionType": "unknownDeposit",
      "status": "open",
      "severity": "medium",
      "description": "Depósito no identificado",
      "createdAt": "2026-07-21T11:20:00Z",
      "resolvedAt": null
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

## 13.2. `POST /api/v1/tenant/reconciliation-sessions/{sessionId}/exceptions`

Crea una excepción.

### Permiso

```text id="cdcz1u"
reconciliationExceptions.create
```

### Request body

```json id="zm83nl"
{
  "bankTransactionId": "bank_transaction_uuid",
  "paymentId": null,
  "exceptionType": "unknownDeposit",
  "severity": "medium",
  "description": "Depósito sin comprobante asociado",
  "metadata": {
    "reviewHint": "Verificar con administración"
  }
}
```

### Reglas

```text id="qxonzp"
- session debe pertenecer al tenant;
- session no debe estar closed o archived;
- bankTransactionId, si existe, debe pertenecer al tenant;
- paymentId, si existe, debe pertenecer al tenant;
- description obligatoria;
- audita reconciliationException.created.
```

### Response `201`

```json id="hmw533"
{
  "data": {
    "id": "exception_uuid",
    "reconciliationSessionId": "session_uuid",
    "bankTransactionId": "bank_transaction_uuid",
    "paymentId": null,
    "exceptionType": "unknownDeposit",
    "status": "open",
    "severity": "medium",
    "description": "Depósito sin comprobante asociado",
    "createdAt": "2026-07-21T11:20:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 13.3. `GET /api/v1/tenant/reconciliation-exceptions/{exceptionId}`

Obtiene una excepción.

### Permiso

```text id="lxwj7c"
reconciliationExceptions.read
```

### Response `200`

Devuelve `ReconciliationExceptionDto`.

---

## 13.4. `PATCH /api/v1/tenant/reconciliation-exceptions/{exceptionId}`

Actualiza una excepción abierta o en revisión.

### Permiso

```text id="dkuuwv"
reconciliationExceptions.update
```

### Request body

```json id="f1s785"
{
  "severity": "high",
  "description": "Depósito no identificado de monto significativo",
  "metadata": {
    "reviewHint": "Revisar con tesorería"
  }
}
```

### Response `200`

Devuelve `ReconciliationExceptionDto`.

---

## 13.5. `POST /api/v1/tenant/reconciliation-exceptions/{exceptionId}/resolve`

Resuelve una excepción.

### Permiso

```text id="fqbbxm"
reconciliationExceptions.resolve
```

### Request body

```json id="agmr24"
{
  "resolutionNotes": "Se identificó como pago reportado por unidad A101"
}
```

### Response `200`

```json id="qul08k"
{
  "data": {
    "id": "exception_uuid",
    "status": "resolved",
    "resolvedAt": "2026-07-21T15:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 13.6. `POST /api/v1/tenant/reconciliation-exceptions/{exceptionId}/ignore`

Ignora una excepción.

### Permiso

```text id="z8znat"
reconciliationExceptions.ignore
```

### Request body

```json id="uf55wq"
{
  "reason": "Movimiento bancario informativo no conciliable"
}
```

### Response `200`

```json id="tnr0xi"
{
  "data": {
    "id": "exception_uuid",
    "status": "ignored",
    "ignoredAt": "2026-07-21T15:10:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 13.7. `POST /api/v1/tenant/reconciliation-exceptions/{exceptionId}/archive`

Archiva una excepción.

### Permiso

```text id="q7ljaw"
reconciliationExceptions.archive
```

### Request body

```json id="fcdu9x"
{
  "reason": "Excepción histórica archivada"
}
```

### Response `200`

```json id="bmpuh6"
{
  "data": {
    "id": "exception_uuid",
    "status": "archived",
    "archivedAt": "2026-07-22T09:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 14. API — Reportes de conciliación

## 14.1. `GET /api/v1/tenant/reconciliation-reports/summary`

Resumen general de conciliación.

### Permiso

```text id="s7sctc"
reconciliationReports.read
```

### Query params

```text id="q9yvvm"
bankAccountId
periodStart
periodEnd
status
```

### Response `200`

```json id="wz01t6"
{
  "data": {
    "periodStart": "2026-07-01",
    "periodEnd": "2026-07-31",
    "bankAccountsCount": 2,
    "sessionsCount": 1,
    "bankTransactionsCount": 100,
    "matchedTransactionsCount": 80,
    "unmatchedTransactionsCount": 20,
    "paymentsMatchedCount": 78,
    "paymentsUnmatchedCount": 8,
    "exceptionsOpenCount": 3,
    "totalBankCredits": "5000.00",
    "totalBankDebits": "250.00",
    "totalMatchedAmount": "4500.00",
    "totalUnmatchedBankAmount": "500.00",
    "currency": "USD"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 14.2. `GET /api/v1/tenant/reconciliation-reports/unmatched-bank-transactions`

Movimientos bancarios no conciliados.

### Permiso

```text id="jyh31r"
reconciliationReports.read
```

### Query params

```text id="ejig5s"
bankAccountId
periodStart
periodEnd
direction
transactionType
severity
page
pageSize
```

### Response `200`

```json id="oc3ib0"
{
  "data": [
    {
      "bankTransactionId": "bank_transaction_uuid",
      "transactionDate": "2026-07-10",
      "direction": "credit",
      "amount": "125.50",
      "currency": "USD",
      "transactionType": "deposit",
      "status": "unmatched",
      "description": "DEPÓSITO TRANSFERENCIA",
      "referencePreview": "REF***123"
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

## 14.3. `GET /api/v1/tenant/reconciliation-reports/unmatched-payments`

Pagos no conciliados.

### Permiso

```text id="g5qsqm"
reconciliationReports.read
```

### Query params

```text id="uil053"
periodStart
periodEnd
propertyUnitId
paymentStatus
page
pageSize
```

### Response `200`

```json id="dhpp9n"
{
  "data": [
    {
      "paymentId": "payment_uuid",
      "propertyUnitId": "property_unit_uuid",
      "paymentDate": "2026-07-10",
      "amount": "125.50",
      "currency": "USD",
      "paymentStatus": "confirmed",
      "reconciliationStatus": "pending"
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

## 14.4. `GET /api/v1/tenant/reconciliation-reports/exceptions`

Reporte de excepciones.

### Permiso

```text id="gw769p"
reconciliationReports.read
```

### Query params

```text id="xybdxh"
periodStart
periodEnd
exceptionType
status
severity
page
pageSize
```

### Response `200`

```json id="g45qak"
{
  "data": [
    {
      "exceptionId": "exception_uuid",
      "reconciliationSessionId": "session_uuid",
      "exceptionType": "unknownDeposit",
      "status": "open",
      "severity": "medium",
      "description": "Depósito no identificado",
      "createdAt": "2026-07-21T11:20:00Z"
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

## 14.5. `GET /api/v1/tenant/reconciliation-reports/bank-account-balances`

Resumen de saldos bancarios importados.

### Permiso

```text id="kxlg36"
reconciliationReports.read
```

### Query params

```text id="dld5l6"
bankAccountId
periodStart
periodEnd
```

### Response `200`

```json id="nhfmhm"
{
  "data": [
    {
      "bankAccountId": "bank_account_uuid",
      "accountNumberMasked": "**** **** 7890",
      "currency": "USD",
      "openingBalance": "1000.00",
      "closingBalance": "1550.00",
      "totalCredits": "500.00",
      "totalDebits": "50.00",
      "lastTransactionDate": "2026-07-31"
    }
  ],
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 14.6. `GET /api/v1/tenant/reconciliation-reports/export`

Exporta reporte de conciliación.

### Permiso

```text id="bto6xe"
reconciliationReports.export
```

### Query params

```text id="xg08bs"
reportType
bankAccountId
periodStart
periodEnd
format
```

### Valores permitidos

```text id="yzktsi"
reportType = summary | unmatchedBankTransactions | unmatchedPayments | exceptions | bankAccountBalances
format = xlsx | csv | pdf
```

### Reglas

```text id="argx84"
- si el archivo se persiste, debe almacenarse en Secure Document Storage;
- no exponer storageKey;
- no incluir número completo de cuenta;
- auditar exportación.
```

### Response `200`

```json id="tdmnfp"
{
  "data": {
    "reportType": "summary",
    "format": "xlsx",
    "secureDocumentId": "secure_document_uuid",
    "secureDocumentFileId": "secure_document_file_uuid",
    "downloadAvailable": true,
    "createdAt": "2026-07-21T16:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 15. Endpoints `/me`

No se implementan endpoints `/me` directos en MVP para conciliación bancaria.

La información visible para propietarios o residentes debe exponerse a través de:

```text id="uue7ru"
005-payments
006-account-statements
```

Endpoint futuro opcional:

```text id="uceqr1"
GET /api/v1/me/payments/{paymentId}/reconciliation-status
```

Regla:

```text id="zkj5r3"
Un propietario o residente no debe acceder directamente a cuentas bancarias, movimientos bancarios, sesiones de conciliación, archivos bancarios importados ni reportes de conciliación interna.
```

---

# 16. Endpoints públicos prohibidos

No crear:

```text id="ty84nb"
GET /api/v1/public/bank-accounts
GET /api/v1/public/bank-transactions
GET /api/v1/public/reconciliation-sessions
GET /api/v1/public/reconciliation-reports
GET /api/v1/public/tenants/{slug}/bank-accounts
GET /api/v1/public/tenants/{slug}/bank-transactions
GET /api/v1/public/tenants/{slug}/reconciliation-sessions
GET /api/v1/public/tenants/{slug}/reconciliation-reports
GET /api/v1/public/tenants/{slug}/reconciliation-reports/summary
```

Resultado esperado:

```text id="ny0sgp"
404 route not found
```

Sin revelar:

```text id="xdcnyx"
si el tenant existe
si la cuenta existe
si el movimiento existe
si la sesión existe
si el usuario tendría acceso
```

---

# 17. DTOs

## 17.1. `CreateBankAccountDto`

```typescript id="xbc3xs"
type CreateBankAccountDto = {
  bankName: string;
  accountName: string;
  accountNumber: string;
  accountType: "checking" | "savings" | "virtual" | "cash" | "other";
  currency: "USD";
  isDefault?: boolean;
  description?: string;
  metadata?: Record<string, unknown>;
};
```

Rechazar:

```text id="mk8vix"
tenantId
accountNumberHash
accountNumberMasked manual
status
createdBy
updatedBy
archivedBy
createdAt
updatedAt
```

---

## 17.2. `UpdateBankAccountDto`

```typescript id="f7pxfy"
type UpdateBankAccountDto = {
  bankName?: string;
  accountName?: string;
  accountType?: "checking" | "savings" | "virtual" | "cash" | "other";
  isDefault?: boolean;
  description?: string;
  metadata?: Record<string, unknown>;
};
```

---

## 17.3. `BankAccountDto`

```typescript id="c38tax"
type BankAccountDto = {
  id: string;
  bankName: string;
  accountName: string;
  accountNumberMasked: string;
  accountType: string;
  currency: "USD";
  status: string;
  isDefault: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
  activatedAt?: string | null;
  deactivatedAt?: string | null;
  archivedAt?: string | null;
  metadata?: Record<string, unknown>;
};
```

No incluir:

```text id="tiwxho"
accountNumber
accountNumberHash
tenantId
```

---

## 17.4. `CreateBankStatementImportDto`

Multipart conceptual:

```typescript id="p03rfz"
type CreateBankStatementImportDto = {
  file: File;
  importType: "csv" | "xlsx";
  periodStart: string;
  periodEnd: string;
  templateKey?: "genericCsv" | "genericXlsx";
  description?: string;
  metadata?: Record<string, unknown>;
};
```

Rechazar:

```text id="pn8anu"
tenantId
fileHash
hashAlgorithm
secureDocumentId
secureDocumentFileId
storageKey
status
importedBy
processedBy
```

---

## 17.5. `ProcessBankStatementImportDto`

```typescript id="yslgsi"
type ProcessBankStatementImportDto = {
  templateKey?: "genericCsv" | "genericXlsx";
  strictMode?: boolean;
  allowPartialProcessing?: boolean;
  duplicatePolicy?: "markDuplicate" | "skip";
};
```

---

## 17.6. `BankStatementImportDto`

```typescript id="hppnic"
type BankStatementImportDto = {
  id: string;
  bankAccountId: string;
  secureDocumentId?: string | null;
  secureDocumentFileId?: string | null;
  importType: string;
  originalFileName: string;
  hashPrefix: string;
  hashAlgorithm: "SHA-256";
  status: string;
  periodStart: string;
  periodEnd: string;
  importedAt: string;
  processedAt?: string | null;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
  createdTransactions: number;
  errorSummary?: Record<string, unknown> | null;
  metadata?: Record<string, unknown>;
};
```

No incluir:

```text id="iyzpse"
fileHash completo
storageKey
archivo completo
filas completas
```

---

## 17.7. `BankTransactionDto`

```typescript id="ii4g8u"
type BankTransactionDto = {
  id: string;
  bankAccountId: string;
  statementImportId: string;
  transactionDate: string;
  postedDate?: string | null;
  description?: string | null;
  referencePreview?: string | null;
  bankReferencePreview?: string | null;
  transactionType: string;
  direction: "credit" | "debit" | "neutral";
  amount: string;
  currency: "USD";
  balanceAfter?: string | null;
  status: string;
  isDuplicate: boolean;
  duplicateOfTransactionId?: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
  metadata?: Record<string, unknown>;
};
```

No incluir:

```text id="bzfr57"
fingerprint
reference sensible completa
bankReference sensible completa
description sin sanitizar
```

---

## 17.8. `CreateReconciliationSessionDto`

```typescript id="i2is1u"
type CreateReconciliationSessionDto = {
  bankAccountId: string;
  periodStart: string;
  periodEnd: string;
  openingBalance?: string;
  metadata?: Record<string, unknown>;
};
```

---

## 17.9. `ReconciliationSessionDto`

```typescript id="uoblxg"
type ReconciliationSessionDto = {
  id: string;
  bankAccountId: string;
  periodStart: string;
  periodEnd: string;
  status: string;
  openingBalance?: string | null;
  closingBalance?: string | null;
  totalBankCredits: string;
  totalBankDebits: string;
  totalMatchedAmount: string;
  totalUnmatchedAmount: string;
  totalExceptions: number;
  createdAt: string;
  openedAt?: string | null;
  closedAt?: string | null;
  reopenedAt?: string | null;
  archivedAt?: string | null;
  metadata?: Record<string, unknown>;
};
```

---

## 17.10. `GenerateReconciliationCandidatesDto`

```typescript id="x2hdsa"
type GenerateReconciliationCandidatesDto = {
  bankAccountId?: string;
  dateToleranceDays?: number;
  amountTolerance?: string;
  minScore?: number;
  includeAlreadySuggested?: boolean;
};
```

---

## 17.11. `ReconciliationCandidateDto`

```typescript id="xkvptw"
type ReconciliationCandidateDto = {
  id: string;
  reconciliationSessionId: string;
  bankTransactionId: string;
  paymentId: string;
  score: number;
  scoreBand: "high" | "medium" | "low" | "ignored";
  scoreReason: Record<string, unknown>;
  matchType: string;
  status: string;
  createdAt: string;
  reviewedAt?: string | null;
  expiresAt?: string | null;
  rejectReason?: string | null;
  metadata?: Record<string, unknown>;
};
```

---

## 17.12. `CreateReconciliationMatchDto`

```typescript id="h09stj"
type CreateReconciliationMatchDto = {
  matchType:
    | "oneBankTransactionToOnePayment"
    | "oneBankTransactionToManyPayments"
    | "manyBankTransactionsToOnePayment"
    | "manual";
  bankTransactionIds: string[];
  paymentIds: string[];
  differenceReason?: string | null;
  notes?: string;
  metadata?: Record<string, unknown>;
};
```

Reglas:

```text id="h66yy6"
- bankTransactionIds no vacío;
- paymentIds no vacío;
- IDs deben pertenecer al tenant;
- differenceReason requerido si hay diferencia;
- no aceptar totalBankAmount desde cliente como fuente de verdad;
- no aceptar totalPaymentAmount desde cliente como fuente de verdad.
```

---

## 17.13. `ReconciliationMatchDto`

```typescript id="owtl68"
type ReconciliationMatchDto = {
  id: string;
  reconciliationSessionId: string;
  matchType: string;
  status: string;
  confirmedAt: string;
  reversedAt?: string | null;
  archivedAt?: string | null;
  reverseReason?: string | null;
  totalBankAmount: string;
  totalPaymentAmount: string;
  differenceAmount: string;
  differenceReason?: string | null;
  items: ReconciliationMatchItemDto[];
  metadata?: Record<string, unknown>;
};
```

---

## 17.14. `ReconciliationMatchItemDto`

```typescript id="j85we3"
type ReconciliationMatchItemDto = {
  id: string;
  reconciliationMatchId: string;
  bankTransactionId?: string | null;
  paymentId?: string | null;
  itemType: "bankTransaction" | "payment";
  amountApplied: string;
  currency: "USD";
  createdAt: string;
  metadata?: Record<string, unknown>;
};
```

---

## 17.15. `CreateReconciliationExceptionDto`

```typescript id="x972ks"
type CreateReconciliationExceptionDto = {
  bankTransactionId?: string | null;
  paymentId?: string | null;
  exceptionType:
    | "bankTransactionWithoutPayment"
    | "paymentWithoutBankTransaction"
    | "amountMismatch"
    | "dateMismatch"
    | "ambiguousReference"
    | "duplicateBankTransaction"
    | "duplicatePaymentCandidate"
    | "bankFee"
    | "interest"
    | "reversal"
    | "transferBetweenAccounts"
    | "unknownDeposit"
    | "manualReview"
    | "other";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  metadata?: Record<string, unknown>;
};
```

---

## 17.16. `ReconciliationExceptionDto`

```typescript id="lrk63h"
type ReconciliationExceptionDto = {
  id: string;
  reconciliationSessionId: string;
  bankTransactionId?: string | null;
  paymentId?: string | null;
  exceptionType: string;
  status: string;
  severity: string;
  description: string;
  resolutionNotes?: string | null;
  ignoreReason?: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  ignoredAt?: string | null;
  archivedAt?: string | null;
  metadata?: Record<string, unknown>;
};
```

---

# 18. Matriz de endpoints

| Endpoint                                                     | Método | Permiso                                 | Audit event                                                         |
| ------------------------------------------------------------ | -----: | --------------------------------------- | ------------------------------------------------------------------- |
| `/tenant/bank-accounts`                                      |    GET | `bankAccounts.read`                     | —                                                                   |
| `/tenant/bank-accounts`                                      |   POST | `bankAccounts.create`                   | `bankAccount.created`                                               |
| `/tenant/bank-accounts/{id}`                                 |    GET | `bankAccounts.read`                     | —                                                                   |
| `/tenant/bank-accounts/{id}`                                 |  PATCH | `bankAccounts.update`                   | `bankAccount.updated`                                               |
| `/tenant/bank-accounts/{id}/activate`                        |   POST | `bankAccounts.activate`                 | `bankAccount.activated`                                             |
| `/tenant/bank-accounts/{id}/deactivate`                      |   POST | `bankAccounts.deactivate`               | `bankAccount.deactivated`                                           |
| `/tenant/bank-accounts/{id}/archive`                         |   POST | `bankAccounts.archive`                  | `bankAccount.archived`                                              |
| `/tenant/bank-statement-imports`                             |    GET | `bankStatementImports.read`             | —                                                                   |
| `/tenant/bank-accounts/{id}/statement-imports`               |   POST | `bankStatementImports.create`           | `bankStatementImport.created`                                       |
| `/tenant/bank-statement-imports/{id}`                        |    GET | `bankStatementImports.read`             | —                                                                   |
| `/tenant/bank-statement-imports/{id}/validate`               |   POST | `bankStatementImports.process`          | `bankStatementImport.validated`                                     |
| `/tenant/bank-statement-imports/{id}/process`                |   POST | `bankStatementImports.process`          | `bankStatementImport.processed`                                     |
| `/tenant/bank-statement-imports/{id}/cancel`                 |   POST | `bankStatementImports.cancel`           | `bankStatementImport.cancelled`                                     |
| `/tenant/bank-statement-imports/{id}/archive`                |   POST | `bankStatementImports.archive`          | `bankStatementImport.archived`                                      |
| `/tenant/bank-statement-imports/{id}/errors`                 |    GET | `bankStatementImports.read`             | —                                                                   |
| `/tenant/bank-transactions`                                  |    GET | `bankTransactions.read`                 | —                                                                   |
| `/tenant/bank-transactions/{id}`                             |    GET | `bankTransactions.read`                 | —                                                                   |
| `/tenant/bank-transactions/{id}/classification`              |  PATCH | `bankTransactions.updateClassification` | `bankTransaction.classificationUpdated`                             |
| `/tenant/bank-transactions/{id}/ignore`                      |   POST | `bankTransactions.ignore`               | `bankTransaction.ignored`                                           |
| `/tenant/bank-transactions/{id}/archive`                     |   POST | `bankTransactions.archive`              | `bankTransaction.archived`                                          |
| `/tenant/reconciliation-sessions`                            |    GET | `reconciliationSessions.read`           | —                                                                   |
| `/tenant/reconciliation-sessions`                            |   POST | `reconciliationSessions.create`         | `reconciliationSession.created`                                     |
| `/tenant/reconciliation-sessions/{id}`                       |    GET | `reconciliationSessions.read`           | —                                                                   |
| `/tenant/reconciliation-sessions/{id}`                       |  PATCH | `reconciliationSessions.update`         | `reconciliationSession.updated`                                     |
| `/tenant/reconciliation-sessions/{id}/open`                  |   POST | `reconciliationSessions.update`         | `reconciliationSession.opened`                                      |
| `/tenant/reconciliation-sessions/{id}/close`                 |   POST | `reconciliationSessions.close`          | `reconciliationSession.closed`                                      |
| `/tenant/reconciliation-sessions/{id}/reopen`                |   POST | `reconciliationSessions.reopen`         | `reconciliationSession.reopened`                                    |
| `/tenant/reconciliation-sessions/{id}/archive`               |   POST | `reconciliationSessions.archive`        | `reconciliationSession.archived`                                    |
| `/tenant/reconciliation-sessions/{id}/summary`               |    GET | `reconciliationSessions.read`           | —                                                                   |
| `/tenant/reconciliation-sessions/{id}/candidates`            |    GET | `reconciliationCandidates.read`         | —                                                                   |
| `/tenant/reconciliation-sessions/{id}/candidates/generate`   |   POST | `reconciliationCandidates.generate`     | `reconciliationCandidate.generated`                                 |
| `/tenant/reconciliation-candidates/{id}`                     |    GET | `reconciliationCandidates.read`         | —                                                                   |
| `/tenant/reconciliation-candidates/{id}/accept`              |   POST | `reconciliationCandidates.accept`       | `reconciliationCandidate.accepted`, `reconciliationMatch.confirmed` |
| `/tenant/reconciliation-candidates/{id}/reject`              |   POST | `reconciliationCandidates.reject`       | `reconciliationCandidate.rejected`                                  |
| `/tenant/reconciliation-sessions/{id}/matches`               |    GET | `reconciliationMatches.read`            | —                                                                   |
| `/tenant/reconciliation-sessions/{id}/matches`               |   POST | `reconciliationMatches.create`          | `reconciliationMatch.confirmed`                                     |
| `/tenant/reconciliation-matches/{id}`                        |    GET | `reconciliationMatches.read`            | —                                                                   |
| `/tenant/reconciliation-matches/{id}/confirm`                |   POST | `reconciliationMatches.confirm`         | `reconciliationMatch.confirmed`                                     |
| `/tenant/reconciliation-matches/{id}/reverse`                |   POST | `reconciliationMatches.reverse`         | `reconciliationMatch.reversed`                                      |
| `/tenant/reconciliation-matches/{id}/archive`                |   POST | `reconciliationMatches.archive`         | `reconciliationMatch.archived`                                      |
| `/tenant/reconciliation-sessions/{id}/exceptions`            |    GET | `reconciliationExceptions.read`         | —                                                                   |
| `/tenant/reconciliation-sessions/{id}/exceptions`            |   POST | `reconciliationExceptions.create`       | `reconciliationException.created`                                   |
| `/tenant/reconciliation-exceptions/{id}`                     |    GET | `reconciliationExceptions.read`         | —                                                                   |
| `/tenant/reconciliation-exceptions/{id}`                     |  PATCH | `reconciliationExceptions.update`       | `reconciliationException.updated`                                   |
| `/tenant/reconciliation-exceptions/{id}/resolve`             |   POST | `reconciliationExceptions.resolve`      | `reconciliationException.resolved`                                  |
| `/tenant/reconciliation-exceptions/{id}/ignore`              |   POST | `reconciliationExceptions.ignore`       | `reconciliationException.ignored`                                   |
| `/tenant/reconciliation-exceptions/{id}/archive`             |   POST | `reconciliationExceptions.archive`      | `reconciliationException.archived`                                  |
| `/tenant/reconciliation-reports/summary`                     |    GET | `reconciliationReports.read`            | —                                                                   |
| `/tenant/reconciliation-reports/unmatched-bank-transactions` |    GET | `reconciliationReports.read`            | —                                                                   |
| `/tenant/reconciliation-reports/unmatched-payments`          |    GET | `reconciliationReports.read`            | —                                                                   |
| `/tenant/reconciliation-reports/exceptions`                  |    GET | `reconciliationReports.read`            | —                                                                   |
| `/tenant/reconciliation-reports/bank-account-balances`       |    GET | `reconciliationReports.read`            | —                                                                   |
| `/tenant/reconciliation-reports/export`                      |    GET | `reconciliationReports.export`          | `reconciliationReport.exported`                                     |

---

# 19. Códigos de error

## 19.1. Generales

```text id="wvx0x2"
UNAUTHORIZED
FORBIDDEN
VALIDATION_ERROR
NOT_FOUND
CONFLICT
RATE_LIMITED
INTERNAL_ERROR
```

---

## 19.2. Cuentas bancarias

```text id="vju8r0"
BANK_ACCOUNT_NOT_FOUND
BANK_ACCOUNT_FORBIDDEN
BANK_ACCOUNT_INVALID_STATUS
BANK_ACCOUNT_INACTIVE
BANK_ACCOUNT_ARCHIVED
BANK_ACCOUNT_CROSS_TENANT_REFERENCE
BANK_ACCOUNT_NUMBER_INVALID
BANK_ACCOUNT_NUMBER_EXPOSED_FORBIDDEN
BANK_ACCOUNT_CURRENCY_UNSUPPORTED
BANK_ACCOUNT_DEFAULT_ALREADY_EXISTS
```

---

## 19.3. Importaciones

```text id="d20jkm"
BANK_STATEMENT_IMPORT_NOT_FOUND
BANK_STATEMENT_IMPORT_FORBIDDEN
BANK_STATEMENT_IMPORT_INVALID_STATUS
BANK_STATEMENT_IMPORT_FILE_REQUIRED
BANK_STATEMENT_IMPORT_FILE_INVALID
BANK_STATEMENT_IMPORT_FILE_TOO_LARGE
BANK_STATEMENT_IMPORT_FORMAT_UNSUPPORTED
BANK_STATEMENT_IMPORT_TEMPLATE_UNSUPPORTED
BANK_STATEMENT_IMPORT_PARSE_FAILED
BANK_STATEMENT_IMPORT_VALIDATION_FAILED
BANK_STATEMENT_IMPORT_ALREADY_PROCESSED
BANK_STATEMENT_IMPORT_DUPLICATE_FILE
BANK_STATEMENT_IMPORT_ROW_INVALID
BANK_STATEMENT_IMPORT_PROCESSING_FAILED
```

---

## 19.4. Movimientos

```text id="pvzmuf"
BANK_TRANSACTION_NOT_FOUND
BANK_TRANSACTION_FORBIDDEN
BANK_TRANSACTION_DUPLICATE
BANK_TRANSACTION_NOT_RECONCILABLE
BANK_TRANSACTION_ALREADY_MATCHED
BANK_TRANSACTION_INVALID_CLASSIFICATION
BANK_TRANSACTION_ARCHIVED
BANK_TRANSACTION_CROSS_TENANT_REFERENCE
```

---

## 19.5. Sesiones

```text id="xtkyw1"
RECONCILIATION_SESSION_NOT_FOUND
RECONCILIATION_SESSION_FORBIDDEN
RECONCILIATION_SESSION_INVALID_STATUS
RECONCILIATION_SESSION_ALREADY_EXISTS
RECONCILIATION_SESSION_CLOSED
RECONCILIATION_SESSION_ARCHIVED
RECONCILIATION_SESSION_REOPEN_REASON_REQUIRED
RECONCILIATION_SESSION_CLOSE_BLOCKED_BY_EXCEPTIONS
RECONCILIATION_SESSION_CROSS_TENANT_REFERENCE
```

---

## 19.6. Candidatos

```text id="fomlfm"
RECONCILIATION_CANDIDATE_NOT_FOUND
RECONCILIATION_CANDIDATE_FORBIDDEN
RECONCILIATION_CANDIDATE_INVALID_STATUS
RECONCILIATION_CANDIDATE_EXPIRED
RECONCILIATION_CANDIDATE_NO_EFFECT
RECONCILIATION_CANDIDATE_CROSS_TENANT_REFERENCE
```

---

## 19.7. Matches

```text id="egcyfs"
RECONCILIATION_MATCH_NOT_FOUND
RECONCILIATION_MATCH_FORBIDDEN
RECONCILIATION_MATCH_INVALID_STATUS
RECONCILIATION_MATCH_AMOUNT_MISMATCH
RECONCILIATION_MATCH_DIFFERENCE_REASON_REQUIRED
RECONCILIATION_MATCH_PAYMENT_NOT_RECONCILABLE
RECONCILIATION_MATCH_BANK_TRANSACTION_NOT_RECONCILABLE
RECONCILIATION_MATCH_CROSS_TENANT_REFERENCE
RECONCILIATION_MATCH_REVERSE_REASON_REQUIRED
RECONCILIATION_MATCH_ALREADY_REVERSED
RECONCILIATION_MATCH_SESSION_CLOSED
```

---

## 19.8. Excepciones

```text id="vmqm7d"
RECONCILIATION_EXCEPTION_NOT_FOUND
RECONCILIATION_EXCEPTION_FORBIDDEN
RECONCILIATION_EXCEPTION_INVALID_STATUS
RECONCILIATION_EXCEPTION_RESOLUTION_REQUIRED
RECONCILIATION_EXCEPTION_IGNORE_REASON_REQUIRED
RECONCILIATION_EXCEPTION_CROSS_TENANT_REFERENCE
```

---

## 19.9. Payments integration

```text id="qpj9vr"
PAYMENT_RECONCILIATION_PAYMENT_NOT_FOUND
PAYMENT_RECONCILIATION_PAYMENT_NOT_RECONCILABLE
PAYMENT_RECONCILIATION_PAYMENT_ALREADY_RECONCILED
PAYMENT_RECONCILIATION_CROSS_TENANT_REFERENCE
PAYMENT_RECONCILIATION_UPDATE_FAILED
```

---

## 19.10. Secure Document Storage integration

```text id="ccz809"
SECURE_DOCUMENT_STORAGE_UPLOAD_FAILED
SECURE_DOCUMENT_STORAGE_FILE_NOT_FOUND
SECURE_DOCUMENT_STORAGE_ACCESS_FORBIDDEN
SECURE_DOCUMENT_STORAGE_KEY_EXPOSURE_FORBIDDEN
```

---

# 20. Auditoría

## 20.1. Eventos obligatorios

```text id="l7lmc7"
bankAccount.created
bankAccount.updated
bankAccount.activated
bankAccount.deactivated
bankAccount.archived

bankStatementImport.created
bankStatementImport.validated
bankStatementImport.processed
bankStatementImport.failed
bankStatementImport.cancelled
bankStatementImport.archived

bankTransaction.created
bankTransaction.markedDuplicate
bankTransaction.classificationUpdated
bankTransaction.ignored
bankTransaction.archived

reconciliationSession.created
reconciliationSession.updated
reconciliationSession.opened
reconciliationSession.reviewing
reconciliationSession.closed
reconciliationSession.reopened
reconciliationSession.archived

reconciliationCandidate.generated
reconciliationCandidate.accepted
reconciliationCandidate.rejected
reconciliationCandidate.expired
reconciliationCandidate.superseded

reconciliationMatch.created
reconciliationMatch.confirmed
reconciliationMatch.reversed
reconciliationMatch.archived

reconciliationException.created
reconciliationException.updated
reconciliationException.resolved
reconciliationException.ignored
reconciliationException.archived

reconciliationReport.exported
```

---

## 20.2. Metadata permitida

```text id="fulbu3"
bankAccountId
statementImportId
bankTransactionId
reconciliationSessionId
candidateId
matchId
exceptionId
paymentId
paymentIds
transactionCount
paymentCount
amount
currency
differenceAmount
status
outcome
importStatus
matchType
exceptionType
severity
hashPrefix
traceId
```

---

## 20.3. Metadata prohibida

```text id="hb7216"
accountNumber completo
accountNumberHash
storageKey
signedUrl
archivo completo
fila bancaria completa
contenido completo de descripción bancaria
referencias bancarias sensibles completas
identificación completa
email completo
teléfono completo
cédula
tokens
cookies
Authorization header
secretos
SQL raw
stack trace
payload completo del archivo
```

---

# 21. Observabilidad

## 21.1. Logs seguros

Eventos sugeridos:

```text id="lg57y5"
bankAccount.created
bankStatementImport.created
bankStatementImport.processed
bankStatementImport.failed
bankTransaction.created
bankTransaction.duplicateDetected
reconciliationCandidate.generated
reconciliationMatch.confirmed
reconciliationMatch.reversed
reconciliationException.created
reconciliationSession.closed
```

Campos permitidos:

```text id="rdzcse"
traceId
requestId
correlationId
action
outcome
status
durationMs
errorCode
importStatus
transactionType
direction
matchType
exceptionType
severity
currency
```

Campos prohibidos:

```text id="b0p9sw"
tenantId como label de métrica
bankAccountId como label de métrica
bankTransactionId como label de métrica
paymentId como label de métrica
accountNumber completo
reference completa
bankReference completa
description completa
fileHash completo
storageKey
signedUrl
tokens
cookies
Authorization header
SQL raw
stack trace en producción
```

---

## 21.2. Métricas

```text id="sd9w7t"
bank_accounts_total
bank_statement_imports_total
bank_statement_import_rows_total
bank_statement_import_failed_total
bank_transactions_imported_total
bank_transactions_duplicate_total
reconciliation_candidates_generated_total
reconciliation_matches_confirmed_total
reconciliation_matches_reversed_total
reconciliation_exceptions_open_total
reconciliation_sessions_closed_total
reconciliation_unmatched_bank_amount_total
reconciliation_unmatched_payment_amount_total
```

Labels permitidos:

```text id="ny36dt"
status
importStatus
transactionType
direction
matchType
exceptionType
severity
currency
outcome
```

Labels prohibidos:

```text id="xb6jdi"
tenantId
bankAccountId
bankTransactionId
paymentId
userId
personId
propertyUnitId
accountNumber
reference
bankReference
description
fileHash
storageKey
traceId
```

---

# 22. OpenAPI

## 22.1. Tags

```text id="tzzti5"
Bank Accounts
Bank Statement Imports
Bank Transactions
Reconciliation Sessions
Reconciliation Candidates
Reconciliation Matches
Reconciliation Exceptions
Reconciliation Reports
```

---

## 22.2. Extensiones requeridas

Para endpoints tenant:

```yaml id="snvddx"
x-tenant-scope: true
x-auth-required: true
x-financial-control: true
x-public-exposure: false
```

Para endpoints de importación:

```yaml id="tykv7x"
x-file-upload: true
x-secure-document-storage: true
x-storage-key-exposed: false
x-financial-import: true
x-audit-event: bankStatementImport.created
```

Para endpoints de matching:

```yaml id="rvewtg"
x-reconciliation-match: true
x-manual-confirmation-required: true
x-audit-event: reconciliationMatch.confirmed
x-candidate-side-effect: false
```

Para endpoints de reportes:

```yaml id="u2hxq9"
x-financial-report: true
x-auth-required: true
x-required-permission: reconciliationReports.read
x-public-exposure: false
```

Para endpoints prohibidos:

```text id="clxjb3"
OpenAPI no debe documentar rutas públicas de conciliación bancaria.
```

---

# 23. Reglas de integración con `005-payments`

## 23.1. Pagos conciliables

Estados recomendados:

```text id="z7o7rs"
confirmed
partiallyAllocated
allocated
```

Estados no conciliables:

```text id="r7wgek"
draft
reported
pendingValidation
rejected
cancelled
reversed
archived
```

---

## 23.2. Actualización esperada

Al confirmar match:

```text id="bph94g"
- Payment.reconciliationStatus pasa a reconciled o partiallyReconciled;
- Payment.reconciledAt se actualiza;
- Payment.reconciledBy se actualiza;
- Payment.reconciliationMatchId se actualiza si aplica;
- se audita desde Bank Reconciliation y Payments si corresponde.
```

---

## 23.3. Reverso

Al revertir match:

```text id="c61voh"
- Payment.reconciliationStatus vuelve a pending, candidateFound o reconciliationReversed según política;
- Payment.reconciledAt puede conservarse en historial o limpiarse según decisión de Payments;
- no se elimina historial de match;
- se audita.
```

---

## 23.4. Restricción cross-tenant

```text id="bw79ui"
payment.tenantId debe ser igual a currentTenant.id.
```

---

# 24. Reglas de integración con `016-secure-document-storage`

## 24.1. Archivo importado

Todo archivo bancario importado debe crear o asociar:

```text id="c2xgl2"
secureDocumentId
secureDocumentFileId
```

Clasificación recomendada:

```json id="qqdzrd"
{
  "category": "administrativeDocument",
  "sourceModule": "bankReconciliation",
  "sourceResourceType": "bankStatementImport",
  "sensitivity": "restricted",
  "visibility": "administrative",
  "ownerType": "tenant"
}
```

---

## 24.2. Reglas

```text id="iuxajw"
- no exponer storageKey;
- no permitir descarga desde /me;
- no permitir endpoint public;
- permitir descarga solo con permisos financieros/documentales explícitos;
- auditar acceso documental;
- no incluir archivo bancario completo en logs ni auditoría.
```

---

# 25. Casos borde obligatorios

| Caso                                            | Resultado                 |
| ----------------------------------------------- | ------------------------- |
| Crear cuenta con `tenantId` en body             | 422                       |
| Crear cuenta sin `bankName`                     | 422                       |
| Crear cuenta sin `accountNumber`                | 422                       |
| Exponer `accountNumber` completo                | Falla crítica             |
| Exponer `accountNumberHash` por DTO estándar    | Falla crítica             |
| Importar en cuenta inactive                     | 409                       |
| Importar en cuenta tenant B                     | 404/403                   |
| Importar archivo vacío                          | 422                       |
| Importar MIME no permitido                      | 415                       |
| Importar archivo duplicado                      | 409 o idempotent response |
| Procesar importación ya procesada               | 409                       |
| Reimportar movimientos existentes               | No duplica                |
| Consultar movimiento tenant B                   | 404/403                   |
| Conciliar movimiento tenant B con pago tenant A | 404/403                   |
| Conciliar pago rejected                         | 409                       |
| Conciliar pago reversed                         | 409                       |
| Conciliar movimiento duplicate                  | 409                       |
| Crear candidate modifica Payment                | Falla crítica             |
| Match con diferencia sin reason                 | 422                       |
| Revertir match sin reason                       | 422                       |
| Modificar sesión closed                         | 409                       |
| Reabrir sesión sin permiso                      | 403                       |
| Cerrar sesión con excepciones critical abiertas | 409                       |
| Endpoint público existe                         | Falla crítica             |
| OpenAPI documenta endpoint público              | Falla crítica             |

---

# 26. No aceptación del contrato

La API no debe aceptarse si:

```text id="mdavpe"
- acepta tenantId desde body;
- permite cuentas bancarias cross-tenant;
- permite importaciones cross-tenant;
- permite movimientos cross-tenant;
- permite sesiones cross-tenant;
- permite candidatos cross-tenant;
- permite matches cross-tenant;
- permite excepciones cross-tenant;
- permite conciliar paymentId de otro tenant;
- permite usar secureDocumentId de otro tenant;
- busca entidades solo por id;
- expone número completo de cuenta;
- expone accountNumberHash en DTO estándar;
- expone storageKey;
- expone signedUrl persistente;
- expone archivo bancario completo en JSON;
- expone filas completas no sanitizadas;
- duplica movimientos al reimportar;
- usa float/double para dinero;
- permite candidate con side effect financiero;
- confirma matches automáticamente sin permiso;
- permite match con diferencia sin razón;
- permite reverso sin razón;
- permite modificar sesión closed;
- omite auditoría financiera crítica;
- registra datos bancarios completos en logs;
- registra archivo bancario completo en auditoría;
- crea endpoints públicos;
- documenta endpoints públicos en OpenAPI;
- expone conciliación bancaria a WordPress público;
- envía datos reales a IA externa.
```

---

# 27. Resultado esperado

Este contrato API define una superficie REST segura para `017-bank-reconciliation`.

Debe permitir:

```text id="sncx5y"
- administrar cuentas bancarias;
- proteger números de cuenta;
- importar archivos bancarios CSV/XLSX;
- registrar archivos importados en Secure Document Storage;
- validar y procesar importaciones;
- registrar errores de importación;
- listar movimientos bancarios;
- clasificar movimientos;
- ignorar movimientos no conciliables;
- crear sesiones de conciliación;
- abrir, cerrar y reabrir sesiones;
- generar candidatos determinísticos;
- aceptar/rechazar candidatos;
- crear matches manuales;
- confirmar matches;
- revertir matches;
- gestionar excepciones;
- producir reportes;
- exportar reportes;
- integrar Payments;
- integrar Account Statements;
- integrar Secure Document Storage;
- auditar operaciones críticas;
- mantener tenant isolation;
- impedir exposición pública.
```

---

# 28. Decisión final del contrato

El módulo `017-bank-reconciliation` expondrá únicamente APIs privadas tenant-scoped bajo `/api/v1/tenant`.

No habrá endpoints `/me` directos en MVP.

No habrá endpoints `/public`.

La API debe priorizar:

```text id="ghqgn6"
1. Tenant isolation.
2. Protección de datos bancarios.
3. Integridad financiera.
4. Idempotencia de importación.
5. Detección de duplicados.
6. Matching determinístico.
7. Confirmación humana.
8. Reversibilidad.
9. Auditoría.
10. Observabilidad segura.
11. Integración con Payments.
12. Integración con Secure Document Storage.
```
