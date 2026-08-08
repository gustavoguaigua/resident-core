# API Contract — Spec 021 Supplier Payments

## 1. Información del documento

| Campo           | Valor                                                                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                 |
| Spec ID         | 021                                                                                                                                                           |
| Módulo          | Supplier Payments                                                                                                                                             |
| Documento       | API Contract                                                                                                                                                  |
| Ruta            | `docs/specs/021-supplier-payments/api-contract.md`                                                                                                            |
| Versión         | 0.1                                                                                                                                                           |
| Estado          | Borrador inicial                                                                                                                                              |
| Fecha           | 2026-07-23                                                                                                                                                    |
| Documento base  | `docs/specs/021-supplier-payments/spec.md`                                                                                                                    |
| Plan técnico    | `docs/specs/021-supplier-payments/plan.md`                                                                                                                    |
| Modelo de datos | `docs/specs/021-supplier-payments/data-model.md`                                                                                                              |
| API Style       | REST                                                                                                                                                          |
| Base path       | `/api/v1`                                                                                                                                                     |
| Naturaleza      | Tenant-scoped / Supplier-aware / Payable-driven / Approval-controlled / Evidence-backed / Accounting-linked / Reconciliation-ready / Audit-heavy / Non-public |

---

## 2. Propósito

Este documento define el contrato API del módulo `021-supplier-payments`.

El objetivo es establecer endpoints, permisos, DTOs, filtros, responses, errores, reglas de seguridad, reglas de idempotencia, contratos de integración y restricciones OpenAPI para gestionar proveedores, categorías, contactos, cuentas bancarias protegidas, documentos, obligaciones por pagar, aprobaciones, órdenes de pago, evidencias, vínculos contables, vínculos bancarios, reportes y exportaciones.

Regla central del contrato:

```text id="ocz2lf"
Toda API de Supplier Payments debe ser autenticada, tenant-scoped, permission-based, Decimal-safe, evidence-backed, approval-controlled, audit-heavy, sin tenantId en body, sin datos bancarios completos, sin storageKey, sin transferencias automáticas, sin Open Banking payment initiation, sin mutación directa de Accounting Ledger, sin confirmación final de Bank Reconciliation, sin endpoints públicos, sin endpoints /me y sin acceso desde WordPress.
```

---

## 3. Superficies API

El módulo expone únicamente API tenant privada.

```text id="kn7z44"
Tenant Admin API
  /api/v1/tenant/supplier-payment-categories
  /api/v1/tenant/suppliers
  /api/v1/tenant/supplier-contacts
  /api/v1/tenant/supplier-bank-accounts
  /api/v1/tenant/supplier-documents
  /api/v1/tenant/supplier-payables
  /api/v1/tenant/supplier-payment-orders
  /api/v1/tenant/supplier-payment-evidence
  /api/v1/tenant/supplier-payment-reconciliation-links
  /api/v1/tenant/supplier-payment-reports
```

No existe superficie pública.

No existe superficie `/me` en MVP.

No existe superficie WordPress.

No existe endpoint para iniciar transferencias bancarias.

No existe endpoint para iniciar pagos Open Banking.

---

## 4. Autenticación

Todos los endpoints requieren token Bearer:

```http id="v5jj36"
Authorization: Bearer <access_token>
```

Responsabilidades:

```text id="e9feci"
Keycloak autentica.
RESIDENT Core resuelve usuario.
RESIDENT Core resuelve tenant actual.
RESIDENT Core valida membership.
RESIDENT Core valida permisos.
Supplier Payments valida reglas financieras y administrativas.
```

---

## 5. Resolución de tenant

### 5.1. Fuente del tenant

El tenant se resuelve desde el contexto autenticado del usuario y su membership activa.

```text id="zi4wrr"
currentTenant.id
```

---

### 5.2. Prohibido

No aceptar `tenantId` desde:

```text id="a1447o"
body
query
path
headers no confiables
metadata enviada por cliente
```

---

### 5.3. Regla de consulta

Toda búsqueda tenant-scoped debe usar:

```typescript id="rtqgj3"
where: {
  id: resourceId,
  tenantId: currentTenant.id,
  archivedAt: null
}
```

---

## 6. Formato estándar

### 6.1. JSON

```text id="ahde08"
Content-Type: application/json
Accept: application/json
```

---

### 6.2. Naming

```text id="cne9mw"
API JSON: camelCase
DB: snake_case
TypeScript: camelCase
Enums API: camelCase string
```

---

### 6.3. Fechas

```text id="qd7f43"
ISO 8601 UTC
```

Ejemplo:

```json id="u3ao1c"
{
  "createdAt": "2026-07-23T20:15:00.000Z"
}
```

---

### 6.4. Dinero

Todos los montos se envían y reciben como string decimal.

Correcto:

```json id="h8n28n"
{
  "totalAmount": "125.50",
  "currency": "USD"
}
```

Incorrecto:

```json id="ltspim"
{
  "totalAmount": 125.5
}
```

---

### 6.5. Moneda MVP

```text id="ga4s9w"
USD
```

---

## 7. Response estándar

### 7.1. Single resource

```json id="a0wvrr"
{
  "data": {
    "id": "uuid"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

### 7.2. List response

```json id="mw9uqj"
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 0,
    "traceId": "trace-id"
  }
}
```

---

### 7.3. Empty transition response

Las transiciones pueden devolver el recurso actualizado.

```json id="gz1rzg"
{
  "data": {
    "id": "uuid",
    "status": "approved"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 8. Error response estándar

```json id="s1pikx"
{
  "error": {
    "code": "SUPPLIER_PAYABLE_NOT_FOUND",
    "message": "Supplier payable was not found.",
    "details": {},
    "traceId": "trace-id"
  }
}
```

---

## 9. Headers

### 9.1. Request headers

```http id="m5pdu9"
Authorization: Bearer <token>
Content-Type: application/json
Accept: application/json
X-Request-Id: <optional-request-id>
X-Correlation-Id: <optional-correlation-id>
Idempotency-Key: <optional-idempotency-key>
```

---

### 9.2. Response headers recomendados

```http id="h9c3yw"
Cache-Control: no-store
Pragma: no-cache
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
```

---

## 10. Paginación

Parámetros estándar:

```text id="r85hd0"
page
pageSize
sortBy
sortDirection
```

Reglas:

```text id="z5qg13"
page >= 1
pageSize default = 20
pageSize max = 100
sortBy solo permite campos whitelisted
sortDirection = asc | desc
```

---

## 11. Idempotencia

### 11.1. Operaciones recomendadas con `Idempotency-Key`

```text id="gg558r"
POST /tenant/suppliers
POST /tenant/supplier-payables
POST /tenant/supplier-payment-orders
POST /tenant/supplier-payment-orders/{paymentOrderId}/mark-paid
POST /tenant/supplier-payment-orders/{paymentOrderId}/reverse
POST /tenant/supplier-payment-orders/{paymentOrderId}/reconciliation-links
GET  /tenant/supplier-payment-reports/export
```

---

### 11.2. Regla

```text id="n4t7cs"
Idempotency-Key no reemplaza validaciones financieras ni constraints de base de datos.
```

---

### 11.3. Duplicados de payables

El sistema debe calcular server-side:

```text id="e7lxq1"
duplicateFingerprint = sha256(tenantId + supplierId + externalDocumentNumberNormalized + issueDate + totalAmount)
```

---

## 12. Permisos

### 12.1. Supplier categories

```text id="b42erw"
supplierCategories.create
supplierCategories.read
supplierCategories.update
supplierCategories.archive
```

---

### 12.2. Suppliers

```text id="qnqx59"
suppliers.create
suppliers.read
suppliers.update
suppliers.activate
suppliers.disable
suppliers.block
suppliers.archive
```

---

### 12.3. Supplier contacts

```text id="tk8dvn"
supplierContacts.create
supplierContacts.read
supplierContacts.update
supplierContacts.archive
```

---

### 12.4. Supplier bank accounts

```text id="rot4r4"
supplierBankAccounts.create
supplierBankAccounts.read
supplierBankAccounts.update
supplierBankAccounts.verify
supplierBankAccounts.disable
supplierBankAccounts.archive
```

---

### 12.5. Supplier documents

```text id="cc6zix"
supplierDocuments.create
supplierDocuments.read
supplierDocuments.archive
supplierDocuments.download
```

---

### 12.6. Supplier payables

```text id="r7vym8"
supplierPayables.create
supplierPayables.read
supplierPayables.updateDraft
supplierPayables.submitReview
supplierPayables.approve
supplierPayables.reject
supplierPayables.cancel
supplierPayables.void
supplierPayables.archive
```

---

### 12.7. Supplier payment orders

```text id="aaod31"
supplierPaymentOrders.create
supplierPaymentOrders.read
supplierPaymentOrders.updateDraft
supplierPaymentOrders.submitApproval
supplierPaymentOrders.approve
supplierPaymentOrders.reject
supplierPaymentOrders.schedule
supplierPaymentOrders.markPaid
supplierPaymentOrders.void
supplierPaymentOrders.cancel
supplierPaymentOrders.reverse
supplierPaymentOrders.archive
```

---

### 12.8. Supplier payment evidence

```text id="ti4loe"
supplierPaymentEvidence.create
supplierPaymentEvidence.read
supplierPaymentEvidence.verify
supplierPaymentEvidence.reject
supplierPaymentEvidence.archive
supplierPaymentEvidence.download
```

---

### 12.9. Reconciliation links

```text id="mcmz46"
supplierPaymentReconciliationLinks.create
supplierPaymentReconciliationLinks.read
supplierPaymentReconciliationLinks.unlink
```

---

### 12.10. Reports

```text id="izx6rs"
supplierPaymentReports.read
supplierPaymentReports.export
supplierPaymentReports.payablesAging
supplierPaymentReports.paymentsBySupplier
supplierPaymentReports.expensesByCategory
supplierPaymentReports.cashOutflow
```

---

## 13. Enums API

### 13.1. `SupplierStatus`

```text id="c1p0kh"
draft
active
inactive
blocked
archived
```

---

### 13.2. `SupplierType`

```text id="s3oy9u"
company
individual
contractor
publicUtility
professional
other
```

---

### 13.3. `SupplierCategoryStatus`

```text id="sl3052"
active
inactive
archived
```

---

### 13.4. `SupplierContactStatus`

```text id="w9gsp0"
active
inactive
archived
```

---

### 13.5. `SupplierBankAccountStatus`

```text id="u9dm6e"
draft
verified
active
inactive
rejected
archived
```

---

### 13.6. `SupplierDocumentType`

```text id="sa201p"
identification
taxDocument
contract
certificate
invoice
receipt
paymentEvidence
other
```

---

### 13.7. `SupplierDocumentStatus`

```text id="emfi23"
active
archived
```

---

### 13.8. `SupplierPayableDocumentType`

```text id="uzlnoy"
invoice
receipt
note
contractObligation
manualObligation
utilityBill
other
```

---

### 13.9. `SupplierPayableStatus`

```text id="chkvx7"
draft
pendingReview
approved
rejected
scheduledForPayment
partiallyPaid
paid
cancelled
voided
archived
```

---

### 13.10. `SupplierPayableApprovalStatus`

```text id="zsjdzo"
pending
approved
rejected
cancelled
```

---

### 13.11. `SupplierPaymentOrderStatus`

```text id="yuldch"
draft
pendingApproval
approved
rejected
scheduled
paid
partiallyPaid
failed
voided
cancelled
archived
```

---

### 13.12. `SupplierPaymentMethod`

```text id="v6x8lh"
bankTransferManual
cash
check
debitCard
creditCard
providerPayment
other
```

MVP permitido por defecto:

```text id="bux380"
bankTransferManual
cash
check
other
```

---

### 13.13. `SupplierPaymentEvidenceType`

```text id="i241dt"
bankReceipt
cashReceipt
checkCopy
providerReceipt
internalDocument
other
```

---

### 13.14. `SupplierPaymentEvidenceStatus`

```text id="i09pvm"
uploaded
verified
rejected
archived
```

---

### 13.15. `SupplierAccountingEventType`

```text id="usvl48"
payableApproved
paymentRecorded
paymentVoided
paymentReversed
adjustment
```

---

### 13.16. `SupplierAccountingLinkStatus`

```text id="d03ot7"
active
failed
reversed
archived
```

---

### 13.17. `SupplierBankReconciliationLinkStatus`

```text id="fl2b1j"
active
unlinked
archived
```

---

## 14. Supplier Categories API

### 14.1. List supplier categories

```http id="u6ts9h"
GET /api/v1/tenant/supplier-payment-categories
```

Permiso:

```text id="x37koo"
supplierCategories.read
```

Query params:

```text id="jsreyd"
status
search
page
pageSize
sortBy
sortDirection
```

Response:

```json id="jpcmd0"
{
  "data": [
    {
      "id": "uuid",
      "categoryCode": "SECURITY",
      "categoryName": "Seguridad",
      "description": "Servicios de seguridad",
      "status": "active",
      "createdAt": "2026-07-23T20:00:00.000Z",
      "updatedAt": "2026-07-23T20:00:00.000Z",
      "archivedAt": null
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "traceId": "trace-id"
  }
}
```

---

### 14.2. Create supplier category

```http id="vcxyyb"
POST /api/v1/tenant/supplier-payment-categories
```

Permiso:

```text id="fgbjt0"
supplierCategories.create
```

Request:

```json id="a0m5p6"
{
  "categoryCode": "SECURITY",
  "categoryName": "Seguridad",
  "description": "Servicios de seguridad"
}
```

Response `201`:

```json id="zgg7rj"
{
  "data": {
    "id": "uuid",
    "categoryCode": "SECURITY",
    "categoryName": "Seguridad",
    "description": "Servicios de seguridad",
    "status": "active",
    "createdAt": "2026-07-23T20:00:00.000Z",
    "updatedAt": "2026-07-23T20:00:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

### 14.3. Get supplier category

```http id="rqnaj7"
GET /api/v1/tenant/supplier-payment-categories/{categoryId}
```

Permiso:

```text id="okpsww"
supplierCategories.read
```

---

### 14.4. Update supplier category

```http id="l1yxve"
PATCH /api/v1/tenant/supplier-payment-categories/{categoryId}
```

Permiso:

```text id="zgg74s"
supplierCategories.update
```

Request:

```json id="sok3xx"
{
  "categoryName": "Seguridad privada",
  "description": "Servicios de vigilancia y seguridad privada"
}
```

---

### 14.5. Archive supplier category

```http id="hupe31"
POST /api/v1/tenant/supplier-payment-categories/{categoryId}/archive
```

Permiso:

```text id="pi687e"
supplierCategories.archive
```

Request:

```json id="b75i5s"
{
  "reason": "Categoría reemplazada por otra clasificación"
}
```

---

## 15. Suppliers API

### 15.1. List suppliers

```http id="jwzq4l"
GET /api/v1/tenant/suppliers
```

Permiso:

```text id="lzx3xw"
suppliers.read
```

Query params:

```text id="qekruj"
status
supplierType
categoryId
search
createdFrom
createdTo
page
pageSize
sortBy
sortDirection
```

Response:

```json id="bgw9e0"
{
  "data": [
    {
      "id": "uuid",
      "supplierCode": "SUP-000001",
      "supplierName": "Proveedor demo",
      "supplierType": "company",
      "identificationType": "ruc",
      "identificationNumberMasked": "179****001",
      "email": "contacto@example.com",
      "phone": "+593999999999",
      "address": "Dirección referencial",
      "status": "active",
      "categoryId": "uuid",
      "createdAt": "2026-07-23T20:00:00.000Z",
      "updatedAt": "2026-07-23T20:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "traceId": "trace-id"
  }
}
```

---

### 15.2. Create supplier

```http id="d0iax2"
POST /api/v1/tenant/suppliers
```

Permiso:

```text id="owjvxv"
suppliers.create
```

Request:

```json id="fvabrk"
{
  "supplierCode": "SUP-000001",
  "supplierName": "Proveedor demo",
  "supplierType": "company",
  "identificationType": "ruc",
  "identificationNumber": "1790000000001",
  "email": "contacto@example.com",
  "phone": "+593999999999",
  "address": "Dirección referencial",
  "categoryId": "uuid",
  "defaultExpenseAccountId": "uuid",
  "defaultAccountsPayableAccountId": "uuid"
}
```

Notas:

```text id="lb67jk"
- identificationNumber se recibe para generar masked/hash.
- identificationNumber completo no se devuelve.
- defaultExpenseAccountId debe pertenecer al tenant.
- defaultAccountsPayableAccountId debe pertenecer al tenant.
```

Response `201`:

```json id="piprse"
{
  "data": {
    "id": "uuid",
    "supplierCode": "SUP-000001",
    "supplierName": "Proveedor demo",
    "supplierType": "company",
    "identificationType": "ruc",
    "identificationNumberMasked": "179****001",
    "email": "contacto@example.com",
    "phone": "+593999999999",
    "address": "Dirección referencial",
    "status": "draft",
    "categoryId": "uuid",
    "defaultExpenseAccountId": "uuid",
    "defaultAccountsPayableAccountId": "uuid",
    "createdAt": "2026-07-23T20:00:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

### 15.3. Get supplier

```http id="yjsbd0"
GET /api/v1/tenant/suppliers/{supplierId}
```

Permiso:

```text id="w86sf7"
suppliers.read
```

---

### 15.4. Update supplier

```http id="wtsyda"
PATCH /api/v1/tenant/suppliers/{supplierId}
```

Permiso:

```text id="b6dar6"
suppliers.update
```

Request:

```json id="x40bqi"
{
  "supplierName": "Proveedor demo actualizado",
  "email": "nuevo@example.com",
  "phone": "+593988888888",
  "address": "Nueva dirección",
  "categoryId": "uuid"
}
```

---

### 15.5. Activate supplier

```http id="gd2tgi"
POST /api/v1/tenant/suppliers/{supplierId}/activate
```

Permiso:

```text id="hc8qo4"
suppliers.activate
```

Request:

```json id="apqe5d"
{
  "reason": "Datos validados"
}
```

---

### 15.6. Disable supplier

```http id="comzdx"
POST /api/v1/tenant/suppliers/{supplierId}/disable
```

Permiso:

```text id="o6ytzs"
suppliers.disable
```

Request:

```json id="l77hc7"
{
  "reason": "Proveedor temporalmente inactivo"
}
```

---

### 15.7. Block supplier

```http id="b7qwtw"
POST /api/v1/tenant/suppliers/{supplierId}/block
```

Permiso:

```text id="tzo6ie"
suppliers.block
```

Request:

```json id="iiroge"
{
  "reason": "Observación administrativa pendiente"
}
```

---

### 15.8. Archive supplier

```http id="n5opql"
POST /api/v1/tenant/suppliers/{supplierId}/archive
```

Permiso:

```text id="enc42d"
suppliers.archive
```

Request:

```json id="jl8w2z"
{
  "reason": "Proveedor ya no se utiliza"
}
```

---

## 16. Supplier Contacts API

### 16.1. List supplier contacts

```http id="hkk57g"
GET /api/v1/tenant/suppliers/{supplierId}/contacts
```

Permiso:

```text id="j462qr"
supplierContacts.read
```

Query params:

```text id="n69kx7"
status
isPrimary
page
pageSize
```

---

### 16.2. Create supplier contact

```http id="c8g8nr"
POST /api/v1/tenant/suppliers/{supplierId}/contacts
```

Permiso:

```text id="rtzy1s"
supplierContacts.create
```

Request:

```json id="ygdsrm"
{
  "contactName": "Contacto Demo",
  "role": "Administrador",
  "email": "contacto@example.com",
  "phone": "+593999999999",
  "isPrimary": true
}
```

---

### 16.3. Get supplier contact

```http id="i3fxnr"
GET /api/v1/tenant/supplier-contacts/{contactId}
```

Permiso:

```text id="okkrxo"
supplierContacts.read
```

---

### 16.4. Update supplier contact

```http id="e47hjx"
PATCH /api/v1/tenant/supplier-contacts/{contactId}
```

Permiso:

```text id="coc8bb"
supplierContacts.update
```

---

### 16.5. Archive supplier contact

```http id="o5kes7"
POST /api/v1/tenant/supplier-contacts/{contactId}/archive
```

Permiso:

```text id="fgztma"
supplierContacts.archive
```

Request:

```json id="k9rnyk"
{
  "reason": "Contacto reemplazado"
}
```

---

## 17. Supplier Bank Accounts API

### 17.1. List supplier bank accounts

```http id="hw2x9b"
GET /api/v1/tenant/suppliers/{supplierId}/bank-accounts
```

Permiso:

```text id="z6yez4"
supplierBankAccounts.read
```

Query params:

```text id="h1yjz4"
status
bankName
currency
page
pageSize
```

---

### 17.2. Create supplier bank account

```http id="qehesh"
POST /api/v1/tenant/suppliers/{supplierId}/bank-accounts
```

Permiso:

```text id="ofqr57"
supplierBankAccounts.create
```

Request:

```json id="d5tm2m"
{
  "bankName": "Banco Demo",
  "accountType": "savings",
  "accountNumber": "0000000000000000",
  "beneficiaryName": "Proveedor Demo",
  "beneficiaryIdentification": "1790000000001",
  "currency": "USD"
}
```

Notas:

```text id="qzgmyr"
- accountNumber se usa solo para generar accountNumberMasked y accountNumberHash.
- beneficiaryIdentification se usa solo para generar masked/hash.
- La API no devuelve accountNumber completo.
```

Response:

```json id="ps2v5u"
{
  "data": {
    "id": "uuid",
    "supplierId": "uuid",
    "bankName": "Banco Demo",
    "accountType": "savings",
    "accountNumberMasked": "************0000",
    "beneficiaryName": "Proveedor Demo",
    "beneficiaryIdentificationMasked": "179****001",
    "currency": "USD",
    "status": "draft",
    "createdAt": "2026-07-23T20:00:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

### 17.3. Get supplier bank account

```http id="h6bkg6"
GET /api/v1/tenant/supplier-bank-accounts/{bankAccountId}
```

Permiso:

```text id="nkjwg8"
supplierBankAccounts.read
```

---

### 17.4. Update supplier bank account

```http id="y86zuf"
PATCH /api/v1/tenant/supplier-bank-accounts/{bankAccountId}
```

Permiso:

```text id="ng3ji1"
supplierBankAccounts.update
```

---

### 17.5. Verify supplier bank account

```http id="fhr9ce"
POST /api/v1/tenant/supplier-bank-accounts/{bankAccountId}/verify
```

Permiso:

```text id="d2t4qn"
supplierBankAccounts.verify
```

Request:

```json id="vobk0q"
{
  "reason": "Cuenta validada administrativamente"
}
```

---

### 17.6. Disable supplier bank account

```http id="v70gkw"
POST /api/v1/tenant/supplier-bank-accounts/{bankAccountId}/disable
```

Permiso:

```text id="pjd005"
supplierBankAccounts.disable
```

Request:

```json id="q4xz22"
{
  "reason": "Cuenta reemplazada"
}
```

---

### 17.7. Archive supplier bank account

```http id="m5m7bd"
POST /api/v1/tenant/supplier-bank-accounts/{bankAccountId}/archive
```

Permiso:

```text id="ybe6lf"
supplierBankAccounts.archive
```

Request:

```json id="ysncgf"
{
  "reason": "Archivo histórico"
}
```

---

## 18. Supplier Documents API

### 18.1. List supplier documents

```http id="wcq0uw"
GET /api/v1/tenant/suppliers/{supplierId}/documents
```

Permiso:

```text id="uclswx"
supplierDocuments.read
```

Query params:

```text id="xkzljk"
documentType
status
page
pageSize
```

---

### 18.2. Link supplier document

```http id="cukwm2"
POST /api/v1/tenant/suppliers/{supplierId}/documents
```

Permiso:

```text id="tzz4p7"
supplierDocuments.create
```

Request:

```json id="m9c0b4"
{
  "secureDocumentId": "uuid",
  "documentType": "contract",
  "description": "Contrato de prestación de servicios"
}
```

Response:

```json id="qsga30"
{
  "data": {
    "id": "uuid",
    "supplierId": "uuid",
    "secureDocumentId": "uuid",
    "documentType": "contract",
    "description": "Contrato de prestación de servicios",
    "status": "active",
    "downloadAvailable": true,
    "createdAt": "2026-07-23T20:00:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Prohibido en response:

```text id="zbosyo"
storageKey
signedUrl persistente
payload binario
base64
```

---

### 18.3. Get supplier document

```http id="vkmpfd"
GET /api/v1/tenant/supplier-documents/{supplierDocumentId}
```

Permiso:

```text id="na7ouh"
supplierDocuments.read
```

---

### 18.4. Archive supplier document

```http id="a03128"
POST /api/v1/tenant/supplier-documents/{supplierDocumentId}/archive
```

Permiso:

```text id="nkex98"
supplierDocuments.archive
```

Request:

```json id="kqjqf2"
{
  "reason": "Documento reemplazado"
}
```

---

## 19. Supplier Payables API

### 19.1. List supplier payables

```http id="rx9w2i"
GET /api/v1/tenant/supplier-payables
```

Permiso:

```text id="tmiadr"
supplierPayables.read
```

Query params:

```text id="v5b8vu"
supplierId
status
approvalStatus
documentType
categoryId
dueDateFrom
dueDateTo
issueDateFrom
issueDateTo
outstandingOnly
overdueOnly
search
page
pageSize
sortBy
sortDirection
```

Response:

```json id="s986z9"
{
  "data": [
    {
      "id": "uuid",
      "supplierId": "uuid",
      "payableNumber": "PAY-2026-07-000001",
      "externalDocumentNumber": "FAC-001",
      "documentType": "invoice",
      "issueDate": "2026-07-20T00:00:00.000Z",
      "receivedDate": "2026-07-21T00:00:00.000Z",
      "dueDate": "2026-08-05T00:00:00.000Z",
      "description": "Servicio de mantenimiento",
      "subtotalAmount": "100.00",
      "taxAmount": "12.00",
      "discountAmount": "0.00",
      "totalAmount": "112.00",
      "outstandingAmount": "112.00",
      "currency": "USD",
      "status": "approved",
      "approvalStatus": "approved",
      "categoryId": "uuid",
      "secureDocumentId": "uuid",
      "createdAt": "2026-07-23T20:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "traceId": "trace-id"
  }
}
```

---

### 19.2. Create supplier payable

```http id="ycv9d8"
POST /api/v1/tenant/supplier-payables
```

Permiso:

```text id="jp7hjm"
supplierPayables.create
```

Request:

```json id="zsbij8"
{
  "supplierId": "uuid",
  "externalDocumentNumber": "FAC-001",
  "documentType": "invoice",
  "issueDate": "2026-07-20T00:00:00.000Z",
  "receivedDate": "2026-07-21T00:00:00.000Z",
  "dueDate": "2026-08-05T00:00:00.000Z",
  "description": "Servicio de mantenimiento",
  "subtotalAmount": "100.00",
  "taxAmount": "12.00",
  "discountAmount": "0.00",
  "currency": "USD",
  "categoryId": "uuid",
  "expenseAccountId": "uuid",
  "accountsPayableAccountId": "uuid",
  "secureDocumentId": "uuid"
}
```

Reglas:

```text id="io5ktz"
- supplier debe estar active.
- totalAmount se calcula/valida server-side.
- outstandingAmount se calcula server-side.
- duplicateFingerprint se calcula server-side.
- secureDocumentId debe pertenecer al tenant.
```

Response `201`:

```json id="lzyecs"
{
  "data": {
    "id": "uuid",
    "supplierId": "uuid",
    "payableNumber": "PAY-2026-07-000001",
    "externalDocumentNumber": "FAC-001",
    "documentType": "invoice",
    "subtotalAmount": "100.00",
    "taxAmount": "12.00",
    "discountAmount": "0.00",
    "totalAmount": "112.00",
    "outstandingAmount": "112.00",
    "currency": "USD",
    "status": "draft",
    "approvalStatus": "pending",
    "createdAt": "2026-07-23T20:00:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

### 19.3. Get supplier payable

```http id="rzdm60"
GET /api/v1/tenant/supplier-payables/{payableId}
```

Permiso:

```text id="far1si"
supplierPayables.read
```

---

### 19.4. Update draft supplier payable

```http id="pb2zsd"
PATCH /api/v1/tenant/supplier-payables/{payableId}
```

Permiso:

```text id="e1umnq"
supplierPayables.updateDraft
```

Request:

```json id="xmrqpc"
{
  "description": "Servicio de mantenimiento actualizado",
  "dueDate": "2026-08-10T00:00:00.000Z",
  "subtotalAmount": "100.00",
  "taxAmount": "12.00",
  "discountAmount": "5.00",
  "categoryId": "uuid"
}
```

Reglas:

```text id="y4tmvz"
- solo draft puede editarse por este endpoint.
- approved/paid no se editan destructivamente.
```

---

### 19.5. Submit payable for review

```http id="j9mb8d"
POST /api/v1/tenant/supplier-payables/{payableId}/submit-review
```

Permiso:

```text id="q1erwb"
supplierPayables.submitReview
```

Request:

```json id="jmu1nm"
{
  "comment": "Enviar a revisión"
}
```

---

### 19.6. Approve payable

```http id="lmpv7l"
POST /api/v1/tenant/supplier-payables/{payableId}/approve
```

Permiso:

```text id="i44mu0"
supplierPayables.approve
```

Request:

```json id="l1zos5"
{
  "reason": "Documento validado",
  "postToAccounting": true
}
```

Reglas:

```text id="wbtlkr"
- payable debe estar pendingReview.
- supplier debe estar active.
- duplicado crítico debe bloquear o requerir override explícito según política futura.
- si postToAccounting=true, se invoca integración con Accounting Ledger.
- no se edita JournalEntry posted.
```

---

### 19.7. Reject payable

```http id="w7liix"
POST /api/v1/tenant/supplier-payables/{payableId}/reject
```

Permiso:

```text id="lyxz6t"
supplierPayables.reject
```

Request:

```json id="cefwmy"
{
  "reason": "Documento incompleto"
}
```

---

### 19.8. Cancel payable

```http id="b6nhsw"
POST /api/v1/tenant/supplier-payables/{payableId}/cancel
```

Permiso:

```text id="wixv6u"
supplierPayables.cancel
```

Request:

```json id="b4u4qh"
{
  "reason": "Obligación anulada administrativamente"
}
```

---

### 19.9. Void payable

```http id="nk8qhz"
POST /api/v1/tenant/supplier-payables/{payableId}/void
```

Permiso:

```text id="gr4hz6"
supplierPayables.void
```

Request:

```json id="ft2sfg"
{
  "reason": "Registro creado por error"
}
```

---

### 19.10. Archive payable

```http id="g2x6ag"
POST /api/v1/tenant/supplier-payables/{payableId}/archive
```

Permiso:

```text id="qwu4j1"
supplierPayables.archive
```

Request:

```json id="nxziqg"
{
  "reason": "Archivo histórico"
}
```

---

## 20. Supplier Payment Orders API

### 20.1. List payment orders

```http id="frxtpy"
GET /api/v1/tenant/supplier-payment-orders
```

Permiso:

```text id="xm7lan"
supplierPaymentOrders.read
```

Query params:

```text id="m0gk4h"
supplierId
status
paymentMethod
plannedPaymentDateFrom
plannedPaymentDateTo
actualPaymentDateFrom
actualPaymentDateTo
paidOnly
pendingOnly
search
page
pageSize
sortBy
sortDirection
```

---

### 20.2. Create payment order

```http id="d7ow6j"
POST /api/v1/tenant/supplier-payment-orders
```

Permiso:

```text id="ftqa6u"
supplierPaymentOrders.create
```

Request:

```json id="cjiyui"
{
  "supplierId": "uuid",
  "paymentMethod": "bankTransferManual",
  "plannedPaymentDate": "2026-07-30T00:00:00.000Z",
  "description": "Pago de factura de mantenimiento",
  "supplierBankAccountId": "uuid",
  "bankAccountId": "uuid",
  "items": [
    {
      "supplierPayableId": "uuid",
      "amount": "112.00",
      "description": "Pago total factura FAC-001"
    }
  ]
}
```

Reglas:

```text id="lvyylz"
- supplier debe estar active.
- payable debe estar approved o partiallyPaid según política.
- items deben pertenecer al mismo tenant.
- items no pueden exceder outstandingAmount.
- totalAmount se calcula server-side.
- paymentOrderNumber se genera server-side.
- no se ejecuta transferencia.
```

Response `201`:

```json id="vg7760"
{
  "data": {
    "id": "uuid",
    "paymentOrderNumber": "SPO-2026-07-000001",
    "supplierId": "uuid",
    "paymentMethod": "bankTransferManual",
    "plannedPaymentDate": "2026-07-30T00:00:00.000Z",
    "totalAmount": "112.00",
    "paidAmount": "0.00",
    "currency": "USD",
    "status": "draft",
    "items": [
      {
        "id": "uuid",
        "supplierPayableId": "uuid",
        "lineNumber": 1,
        "amount": "112.00",
        "currency": "USD"
      }
    ],
    "createdAt": "2026-07-23T20:00:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

### 20.3. Get payment order

```http id="wrfp25"
GET /api/v1/tenant/supplier-payment-orders/{paymentOrderId}
```

Permiso:

```text id="ym38nb"
supplierPaymentOrders.read
```

---

### 20.4. Update draft payment order

```http id="s0u6i5"
PATCH /api/v1/tenant/supplier-payment-orders/{paymentOrderId}
```

Permiso:

```text id="eg9er2"
supplierPaymentOrders.updateDraft
```

Reglas:

```text id="x61xwf"
- solo draft puede editarse.
- paid no se edita destructivamente.
- totalAmount se recalcula desde items.
```

---

### 20.5. Submit payment order for approval

```http id="fqxe13"
POST /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/submit-approval
```

Permiso:

```text id="j39mum"
supplierPaymentOrders.submitApproval
```

Request:

```json id="eac9ga"
{
  "comment": "Enviar orden para aprobación"
}
```

---

### 20.6. Approve payment order

```http id="xsn1j2"
POST /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/approve
```

Permiso:

```text id="f21yj7"
supplierPaymentOrders.approve
```

Request:

```json id="gzde34"
{
  "reason": "Pago aprobado"
}
```

Reglas:

```text id="koyqy0"
- supplier no puede estar blocked.
- orden debe tener items.
- no debe exceder outstandingAmount.
```

---

### 20.7. Reject payment order

```http id="hupw3x"
POST /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/reject
```

Permiso:

```text id="o3y2cj"
supplierPaymentOrders.reject
```

Request:

```json id="v0a1gt"
{
  "reason": "Pago no autorizado"
}
```

---

### 20.8. Schedule payment order

```http id="clia20"
POST /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/schedule
```

Permiso:

```text id="jo1xvx"
supplierPaymentOrders.schedule
```

Request:

```json id="awb9w0"
{
  "plannedPaymentDate": "2026-07-30T00:00:00.000Z",
  "reason": "Pago programado"
}
```

---

### 20.9. Mark payment order as paid

```http id="k5cjnc"
POST /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/mark-paid
```

Permiso:

```text id="o9en6v"
supplierPaymentOrders.markPaid
```

Request:

```json id="k3jtgw"
{
  "actualPaymentDate": "2026-07-30T00:00:00.000Z",
  "paymentReference": "TRX-123456",
  "paidAmount": "112.00",
  "secureDocumentId": "uuid",
  "createAccountingEvent": true,
  "comment": "Pago realizado mediante transferencia manual"
}
```

Reglas:

```text id="ek6763"
- orden debe estar approved o scheduled.
- paidAmount no puede exceder totalAmount.
- debe tener paymentReference o secureDocumentId.
- secureDocumentId debe pertenecer al tenant.
- no inicia transferencia bancaria.
- si createAccountingEvent=true, se invoca Accounting Ledger.
- no confirma conciliación bancaria.
```

Response:

```json id="x6i5hn"
{
  "data": {
    "id": "uuid",
    "paymentOrderNumber": "SPO-2026-07-000001",
    "status": "paid",
    "totalAmount": "112.00",
    "paidAmount": "112.00",
    "actualPaymentDate": "2026-07-30T00:00:00.000Z",
    "paymentReference": "TRX-123456",
    "secureDocumentId": "uuid",
    "accountingJournalEntryId": "uuid",
    "paidAt": "2026-07-30T15:00:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

### 20.10. Void payment order

```http id="umdnqg"
POST /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/void
```

Permiso:

```text id="a6fw6o"
supplierPaymentOrders.void
```

Request:

```json id="pwq82v"
{
  "reason": "Orden creada por error"
}
```

---

### 20.11. Cancel payment order

```http id="y99iea"
POST /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/cancel
```

Permiso:

```text id="wfutpe"
supplierPaymentOrders.cancel
```

Request:

```json id="mxzh26"
{
  "reason": "Pago cancelado antes de ejecución"
}
```

---

### 20.12. Reverse payment order

```http id="be2swl"
POST /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/reverse
```

Permiso:

```text id="puj1me"
supplierPaymentOrders.reverse
```

Request:

```json id="f0ky9f"
{
  "reason": "Pago registrado incorrectamente",
  "createAccountingReversal": true,
  "unlinkReconciliation": true
}
```

Reglas:

```text id="s5h895"
- requiere razón.
- no edita destructivamente el histórico.
- puede crear evento contable de reverso.
- puede desvincular conciliación si la política lo permite.
- no edita JournalEntry posted.
```

---

### 20.13. Archive payment order

```http id="my88vp"
POST /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/archive
```

Permiso:

```text id="zgbfht"
supplierPaymentOrders.archive
```

Request:

```json id="hpfyai"
{
  "reason": "Archivo histórico"
}
```

---

## 21. Supplier Payment Evidence API

### 21.1. List evidence for payment order

```http id="md6v13"
GET /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/evidence
```

Permiso:

```text id="gdfwsq"
supplierPaymentEvidence.read
```

---

### 21.2. Create payment evidence

```http id="iq1q8x"
POST /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/evidence
```

Permiso:

```text id="qt3hwp"
supplierPaymentEvidence.create
```

Request:

```json id="s0s0l8"
{
  "secureDocumentId": "uuid",
  "evidenceType": "bankReceipt",
  "paymentReference": "TRX-123456",
  "paymentDate": "2026-07-30T00:00:00.000Z",
  "amount": "112.00",
  "currency": "USD"
}
```

Response:

```json id="obipew"
{
  "data": {
    "id": "uuid",
    "supplierPaymentOrderId": "uuid",
    "secureDocumentId": "uuid",
    "evidenceType": "bankReceipt",
    "paymentReference": "TRX-123456",
    "paymentDate": "2026-07-30T00:00:00.000Z",
    "amount": "112.00",
    "currency": "USD",
    "status": "uploaded",
    "createdAt": "2026-07-30T15:00:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

### 21.3. Get payment evidence

```http id="cyhdym"
GET /api/v1/tenant/supplier-payment-evidence/{evidenceId}
```

Permiso:

```text id="drfy94"
supplierPaymentEvidence.read
```

---

### 21.4. Verify payment evidence

```http id="yejpb4"
POST /api/v1/tenant/supplier-payment-evidence/{evidenceId}/verify
```

Permiso:

```text id="m6my3g"
supplierPaymentEvidence.verify
```

Request:

```json id="p16lr0"
{
  "reason": "Comprobante verificado"
}
```

---

### 21.5. Reject payment evidence

```http id="uaxop5"
POST /api/v1/tenant/supplier-payment-evidence/{evidenceId}/reject
```

Permiso:

```text id="evbfjl"
supplierPaymentEvidence.reject
```

Request:

```json id="p2sclp"
{
  "reason": "Comprobante ilegible"
}
```

---

### 21.6. Archive payment evidence

```http id="ppkloi"
POST /api/v1/tenant/supplier-payment-evidence/{evidenceId}/archive
```

Permiso:

```text id="jq3h2o"
supplierPaymentEvidence.archive
```

Request:

```json id="w9xmh8"
{
  "reason": "Evidencia reemplazada"
}
```

---

## 22. Supplier Payment Reconciliation Links API

### 22.1. List reconciliation links

```http id="z5b9w0"
GET /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/reconciliation-links
```

Permiso:

```text id="odg7qn"
supplierPaymentReconciliationLinks.read
```

---

### 22.2. Create reconciliation link

```http id="wc684n"
POST /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/reconciliation-links
```

Permiso:

```text id="uh0ahc"
supplierPaymentReconciliationLinks.create
```

Request:

```json id="gytegh"
{
  "bankTransactionId": "uuid",
  "reconciliationMatchId": "uuid",
  "reason": "Movimiento bancario asociado al pago"
}
```

Reglas:

```text id="a1rm5u"
- paymentOrder debe pertenecer al tenant.
- bankTransactionId debe pertenecer al tenant si se envía.
- reconciliationMatchId debe pertenecer al tenant si se envía.
- al menos bankTransactionId o reconciliationMatchId debe existir.
- no crea ReconciliationMatch.
- no marca BankTransaction como matched.
- no cierra ReconciliationSession.
```

Response:

```json id="e184wb"
{
  "data": {
    "id": "uuid",
    "supplierPaymentOrderId": "uuid",
    "bankTransactionId": "uuid",
    "reconciliationMatchId": "uuid",
    "status": "active",
    "linkedAt": "2026-07-30T15:00:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

### 22.3. Unlink reconciliation link

```http id="fkjrxa"
POST /api/v1/tenant/supplier-payment-reconciliation-links/{linkId}/unlink
```

Permiso:

```text id="e2zlle"
supplierPaymentReconciliationLinks.unlink
```

Request:

```json id="hafo7d"
{
  "reason": "Vínculo incorrecto"
}
```

---

## 23. Supplier Payment Reports API

### 23.1. Payables aging report

```http id="vfyjbs"
GET /api/v1/tenant/supplier-payment-reports/payables-aging
```

Permiso:

```text id="pon8b5"
supplierPaymentReports.payablesAging
```

Query params:

```text id="jhbige"
asOfDate
supplierId
categoryId
includeNotDue
includeOverdue
page
pageSize
```

Response:

```json id="i5jlkc"
{
  "data": [
    {
      "supplierId": "uuid",
      "supplierName": "Proveedor demo",
      "payableId": "uuid",
      "payableNumber": "PAY-2026-07-000001",
      "externalDocumentNumber": "FAC-001",
      "documentType": "invoice",
      "issueDate": "2026-07-20T00:00:00.000Z",
      "dueDate": "2026-08-05T00:00:00.000Z",
      "totalAmount": "112.00",
      "outstandingAmount": "112.00",
      "daysOverdue": 0,
      "status": "approved",
      "currency": "USD"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "traceId": "trace-id"
  }
}
```

---

### 23.2. Payments by supplier report

```http id="cx6lbf"
GET /api/v1/tenant/supplier-payment-reports/payments-by-supplier
```

Permiso:

```text id="g53rob"
supplierPaymentReports.paymentsBySupplier
```

Query params:

```text id="sd8xwy"
dateFrom
dateTo
supplierId
paymentMethod
page
pageSize
```

---

### 23.3. Expenses by category report

```http id="eefqvc"
GET /api/v1/tenant/supplier-payment-reports/expenses-by-category
```

Permiso:

```text id="ulkud5"
supplierPaymentReports.expensesByCategory
```

Query params:

```text id="cygpt1"
dateFrom
dateTo
categoryId
status
page
pageSize
```

---

### 23.4. Cash outflow report

```http id="e8s5wc"
GET /api/v1/tenant/supplier-payment-reports/cash-outflow
```

Permiso:

```text id="a5y1tl"
supplierPaymentReports.cashOutflow
```

Query params:

```text id="s2tcry"
dateFrom
dateTo
paymentMethod
supplierId
categoryId
plannedOnly
actualOnly
page
pageSize
```

---

### 23.5. Export supplier payment report

```http id="fchahk"
GET /api/v1/tenant/supplier-payment-reports/export
```

Permiso:

```text id="qask39"
supplierPaymentReports.export
```

Query params:

```text id="jdx9bj"
reportType = payablesAging | paymentsBySupplier | expensesByCategory | cashOutflow
format = csv | xlsx | pdf
dateFrom
dateTo
supplierId
categoryId
paymentMethod
```

Response:

```json id="olwux4"
{
  "data": {
    "secureDocumentId": "uuid",
    "secureDocumentFileId": "uuid",
    "reportType": "payablesAging",
    "format": "xlsx",
    "downloadAvailable": true,
    "createdAt": "2026-07-30T15:00:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Prohibido:

```text id="yd9suo"
storageKey
signedUrl persistente
payload base64
```

---

## 24. DTOs principales

### 24.1. `CreateSupplierCategoryDto`

```typescript id="dtwm34"
type CreateSupplierCategoryDto = {
  categoryCode: string;
  categoryName: string;
  description?: string;
};
```

---

### 24.2. `SupplierCategoryDto`

```typescript id="j3mfzo"
type SupplierCategoryDto = {
  id: string;
  categoryCode: string;
  categoryName: string;
  description?: string;
  status: "active" | "inactive" | "archived";
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
};
```

---

### 24.3. `CreateSupplierDto`

```typescript id="zdd4iq"
type CreateSupplierDto = {
  supplierCode?: string;
  supplierName: string;
  supplierType: "company" | "individual" | "contractor" | "publicUtility" | "professional" | "other";
  identificationType?: string;
  identificationNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
  categoryId?: string;
  defaultExpenseAccountId?: string;
  defaultAccountsPayableAccountId?: string;
};
```

---

### 24.4. `SupplierDto`

```typescript id="qe9tkb"
type SupplierDto = {
  id: string;
  supplierCode: string;
  supplierName: string;
  supplierType: string;
  identificationType?: string | null;
  identificationNumberMasked?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  status: string;
  categoryId?: string | null;
  defaultExpenseAccountId?: string | null;
  defaultAccountsPayableAccountId?: string | null;
  createdAt: string;
  updatedAt: string;
  activatedAt?: string | null;
  disabledAt?: string | null;
  blockedAt?: string | null;
  archivedAt?: string | null;
};
```

---

### 24.5. `CreateSupplierBankAccountDto`

```typescript id="ea3xbj"
type CreateSupplierBankAccountDto = {
  bankName: string;
  accountType?: string;
  accountNumber: string;
  beneficiaryName: string;
  beneficiaryIdentification?: string;
  currency: "USD";
};
```

---

### 24.6. `SupplierBankAccountDto`

```typescript id="ax4ktf"
type SupplierBankAccountDto = {
  id: string;
  supplierId: string;
  bankName: string;
  accountType?: string | null;
  accountNumberMasked: string;
  beneficiaryName: string;
  beneficiaryIdentificationMasked?: string | null;
  currency: "USD";
  status: "draft" | "verified" | "active" | "inactive" | "rejected" | "archived";
  verifiedAt?: string | null;
  disabledAt?: string | null;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};
```

---

### 24.7. `CreateSupplierPayableDto`

```typescript id="oaalei"
type CreateSupplierPayableDto = {
  supplierId: string;
  externalDocumentNumber?: string;
  documentType: "invoice" | "receipt" | "note" | "contractObligation" | "manualObligation" | "utilityBill" | "other";
  issueDate?: string;
  receivedDate?: string;
  dueDate?: string;
  description: string;
  subtotalAmount: string;
  taxAmount: string;
  discountAmount: string;
  currency: "USD";
  categoryId?: string;
  expenseAccountId?: string;
  accountsPayableAccountId?: string;
  secureDocumentId?: string;
};
```

---

### 24.8. `SupplierPayableDto`

```typescript id="x68mmp"
type SupplierPayableDto = {
  id: string;
  supplierId: string;
  payableNumber: string;
  externalDocumentNumber?: string | null;
  documentType: string;
  issueDate?: string | null;
  receivedDate?: string | null;
  dueDate?: string | null;
  description: string;
  subtotalAmount: string;
  taxAmount: string;
  discountAmount: string;
  totalAmount: string;
  outstandingAmount: string;
  currency: "USD";
  status: string;
  approvalStatus: string;
  categoryId?: string | null;
  expenseAccountId?: string | null;
  accountsPayableAccountId?: string | null;
  secureDocumentId?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  cancelledAt?: string | null;
  voidedAt?: string | null;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};
```

---

### 24.9. `CreateSupplierPaymentOrderDto`

```typescript id="a56jz6"
type CreateSupplierPaymentOrderDto = {
  supplierId: string;
  paymentMethod: "bankTransferManual" | "cash" | "check" | "other";
  plannedPaymentDate?: string;
  description?: string;
  supplierBankAccountId?: string;
  bankAccountId?: string;
  items: Array<{
    supplierPayableId: string;
    amount: string;
    description?: string;
  }>;
};
```

---

### 24.10. `SupplierPaymentOrderDto`

```typescript id="pgr71m"
type SupplierPaymentOrderDto = {
  id: string;
  paymentOrderNumber: string;
  supplierId: string;
  paymentMethod: string;
  plannedPaymentDate?: string | null;
  actualPaymentDate?: string | null;
  description?: string | null;
  totalAmount: string;
  paidAmount: string;
  currency: "USD";
  status: string;
  supplierBankAccountId?: string | null;
  bankAccountId?: string | null;
  paymentReference?: string | null;
  secureDocumentId?: string | null;
  accountingJournalEntryId?: string | null;
  bankTransactionId?: string | null;
  reconciliationMatchId?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  scheduledAt?: string | null;
  paidAt?: string | null;
  voidedAt?: string | null;
  cancelledAt?: string | null;
  reversedAt?: string | null;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: SupplierPaymentOrderItemDto[];
  evidence?: SupplierPaymentEvidenceDto[];
};
```

---

### 24.11. `SupplierPaymentOrderItemDto`

```typescript id="d4jgp4"
type SupplierPaymentOrderItemDto = {
  id: string;
  supplierPaymentOrderId: string;
  supplierPayableId: string;
  lineNumber: number;
  amount: string;
  currency: "USD";
  description?: string | null;
  createdAt: string;
};
```

---

### 24.12. `MarkSupplierPaymentOrderPaidDto`

```typescript id="p1cjby"
type MarkSupplierPaymentOrderPaidDto = {
  actualPaymentDate: string;
  paymentReference?: string;
  paidAmount: string;
  secureDocumentId?: string;
  createAccountingEvent?: boolean;
  comment?: string;
};
```

---

### 24.13. `CreateSupplierPaymentEvidenceDto`

```typescript id="g9eent"
type CreateSupplierPaymentEvidenceDto = {
  secureDocumentId?: string;
  evidenceType: "bankReceipt" | "cashReceipt" | "checkCopy" | "providerReceipt" | "internalDocument" | "other";
  paymentReference?: string;
  paymentDate?: string;
  amount?: string;
  currency: "USD";
};
```

---

### 24.14. `SupplierPaymentEvidenceDto`

```typescript id="xgkjs1"
type SupplierPaymentEvidenceDto = {
  id: string;
  supplierPaymentOrderId: string;
  secureDocumentId?: string | null;
  evidenceType: string;
  paymentReference?: string | null;
  paymentDate?: string | null;
  amount?: string | null;
  currency: "USD";
  status: string;
  createdAt: string;
  verifiedAt?: string | null;
  rejectedAt?: string | null;
  archivedAt?: string | null;
};
```

---

### 24.15. `CreateSupplierBankReconciliationLinkDto`

```typescript id="v2jt3j"
type CreateSupplierBankReconciliationLinkDto = {
  bankTransactionId?: string;
  reconciliationMatchId?: string;
  reason: string;
};
```

---

### 24.16. `SupplierBankReconciliationLinkDto`

```typescript id="aktpfg"
type SupplierBankReconciliationLinkDto = {
  id: string;
  supplierPaymentOrderId: string;
  bankTransactionId?: string | null;
  reconciliationMatchId?: string | null;
  status: "active" | "unlinked" | "archived";
  linkedAt: string;
  unlinkedAt?: string | null;
  archivedAt?: string | null;
};
```

---

## 25. Campos prohibidos en requests

Todos los DTOs externos deben rechazar:

```text id="i3fqi7"
tenantId
createdBy
updatedBy
activatedBy
disabledBy
blockedBy
approvedBy
rejectedBy
paidBy
verifiedBy
archivedBy
status directo salvo endpoint de transición
totalAmount como fuente de verdad si puede calcularse
outstandingAmount
paidAmount como fuente de verdad fuera de mark-paid controlado
duplicateFingerprint
accountNumberHash
identificationNumberHash
beneficiaryIdentificationHash
fullBankAccountNumber
raw bank payload
raw provider payload
storageKey
signedUrl
accountingJournalEntryId directo
bankTransactionId directo fuera de reconciliation link
reconciliationMatchId directo fuera de reconciliation link
payment initiation fields
Open Banking payment initiation fields
external AI flags
```

---

## 26. Error codes

### 26.1. Supplier

```text id="zi4ynl"
SUPPLIER_NOT_FOUND
SUPPLIER_INVALID_STATUS
SUPPLIER_CODE_DUPLICATE
SUPPLIER_BLOCKED
SUPPLIER_INACTIVE
SUPPLIER_ARCHIVED
SUPPLIER_CROSS_TENANT_REFERENCE
```

---

### 26.2. Supplier category

```text id="izyrx0"
SUPPLIER_CATEGORY_NOT_FOUND
SUPPLIER_CATEGORY_INVALID_STATUS
SUPPLIER_CATEGORY_CODE_DUPLICATE
SUPPLIER_CATEGORY_CROSS_TENANT_REFERENCE
```

---

### 26.3. Supplier contact

```text id="tdj4ug"
SUPPLIER_CONTACT_NOT_FOUND
SUPPLIER_CONTACT_INVALID_STATUS
SUPPLIER_CONTACT_CROSS_TENANT_REFERENCE
```

---

### 26.4. Supplier bank account

```text id="krbcwt"
SUPPLIER_BANK_ACCOUNT_NOT_FOUND
SUPPLIER_BANK_ACCOUNT_INVALID_STATUS
SUPPLIER_BANK_ACCOUNT_UNVERIFIED
SUPPLIER_BANK_ACCOUNT_FULL_NUMBER_FORBIDDEN
SUPPLIER_BANK_ACCOUNT_CROSS_TENANT_REFERENCE
```

---

### 26.5. Supplier document

```text id="f94aj7"
SUPPLIER_DOCUMENT_NOT_FOUND
SUPPLIER_DOCUMENT_STORAGE_KEY_FORBIDDEN
SUPPLIER_DOCUMENT_CROSS_TENANT_REFERENCE
```

---

### 26.6. Supplier payable

```text id="dw593c"
SUPPLIER_PAYABLE_NOT_FOUND
SUPPLIER_PAYABLE_INVALID_STATUS
SUPPLIER_PAYABLE_DUPLICATE_DETECTED
SUPPLIER_PAYABLE_AMOUNT_INVALID
SUPPLIER_PAYABLE_OUTSTANDING_INVALID
SUPPLIER_PAYABLE_APPROVAL_REQUIRED
SUPPLIER_PAYABLE_CROSS_TENANT_REFERENCE
```

---

### 26.7. Supplier payable approval

```text id="exq18b"
SUPPLIER_PAYABLE_APPROVAL_NOT_FOUND
SUPPLIER_PAYABLE_APPROVAL_INVALID_STATUS
```

---

### 26.8. Supplier payment order

```text id="r38zm5"
SUPPLIER_PAYMENT_ORDER_NOT_FOUND
SUPPLIER_PAYMENT_ORDER_INVALID_STATUS
SUPPLIER_PAYMENT_ORDER_NO_ITEMS
SUPPLIER_PAYMENT_ORDER_APPROVAL_REQUIRED
SUPPLIER_PAYMENT_ORDER_AMOUNT_INVALID
SUPPLIER_PAYMENT_ORDER_OVERPAYMENT
SUPPLIER_PAYMENT_ORDER_EVIDENCE_REQUIRED
SUPPLIER_PAYMENT_ORDER_ALREADY_PAID
SUPPLIER_PAYMENT_ORDER_REVERSAL_FORBIDDEN
SUPPLIER_PAYMENT_ORDER_CROSS_TENANT_REFERENCE
```

---

### 26.9. Supplier payment order item

```text id="oipinf"
SUPPLIER_PAYMENT_ORDER_ITEM_INVALID
SUPPLIER_PAYMENT_ORDER_ITEM_AMOUNT_INVALID
SUPPLIER_PAYMENT_ORDER_ITEM_PAYABLE_NOT_APPROVED
SUPPLIER_PAYMENT_ORDER_ITEM_OVERPAYMENT
SUPPLIER_PAYMENT_ORDER_ITEM_CROSS_TENANT_REFERENCE
```

---

### 26.10. Supplier payment evidence

```text id="wogehm"
SUPPLIER_PAYMENT_EVIDENCE_NOT_FOUND
SUPPLIER_PAYMENT_EVIDENCE_INVALID_STATUS
SUPPLIER_PAYMENT_EVIDENCE_REJECTED
SUPPLIER_PAYMENT_EVIDENCE_CROSS_TENANT_REFERENCE
```

---

### 26.11. Accounting integration

```text id="tgnnow"
SUPPLIER_ACCOUNTING_LINK_FAILED
SUPPLIER_ACCOUNTING_LINK_NOT_FOUND
SUPPLIER_ACCOUNTING_POSTING_FORBIDDEN
```

---

### 26.12. Bank reconciliation integration

```text id="nrdnlu"
SUPPLIER_BANK_RECONCILIATION_LINK_NOT_FOUND
SUPPLIER_BANK_RECONCILIATION_LINK_INVALID
SUPPLIER_BANK_RECONCILIATION_CONFIRMATION_FORBIDDEN
```

---

### 26.13. Reports

```text id="gnsrl0"
SUPPLIER_PAYMENT_REPORT_FORBIDDEN
SUPPLIER_PAYMENT_REPORT_EXPORT_FAILED
```

---

### 26.14. Security

```text id="yh4ysy"
SUPPLIER_PAYMENT_PUBLIC_ENDPOINT_FORBIDDEN
SUPPLIER_PAYMENT_ME_ENDPOINT_FORBIDDEN
SUPPLIER_PAYMENT_WORDPRESS_ACCESS_FORBIDDEN
SUPPLIER_PAYMENT_BANK_TRANSFER_INITIATION_FORBIDDEN
SUPPLIER_PAYMENT_OPEN_BANKING_PAYMENT_INITIATION_FORBIDDEN
SUPPLIER_PAYMENT_ELECTRONIC_INVOICING_FORBIDDEN
SUPPLIER_PAYMENT_EXTERNAL_AI_FORBIDDEN
```

---

### 26.15. Common

```text id="fvquhr"
VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
CONFLICT
RATE_LIMITED
INTERNAL_ERROR
```

---

## 27. Integración con Secure Document Storage

### 27.1. Uso permitido

```text id="w133ge"
supplierDocument
supplierPayable
supplierPaymentOrder
supplierPaymentEvidence
supplierPaymentReportExport
```

---

### 27.2. Metadata recomendada

```text id="o69hf8"
sourceModule = supplierPayments
visibility = administrative
sensitivity = restricted
```

---

### 27.3. Response segura

Permitido:

```json id="afed7g"
{
  "secureDocumentId": "uuid",
  "secureDocumentFileId": "uuid",
  "downloadAvailable": true
}
```

Prohibido:

```json id="njfr51"
{
  "storageKey": "internal/path/file.pdf",
  "signedUrl": "https://..."
}
```

---

## 28. Integración con Accounting Ledger

### 28.1. Eventos permitidos

```text id="snjfeb"
supplierPayable.approved
supplierPaymentOrder.paid
supplierPaymentOrder.partiallyPaid
supplierPaymentOrder.reversed
supplierPayable.adjusted
```

---

### 28.2. Reglas

```text id="xywgzk"
- Supplier Payments no escribe JournalEntry por SQL directo.
- Supplier Payments no edita JournalEntry posted.
- Supplier Payments usa puerto/evento hacia Accounting Ledger.
- SupplierAccountingLink mantiene trazabilidad.
- Si falla accounting, registrar supplierAccountingLink.failed.
```

---

### 28.3. Resultado esperado

```json id="s3ey0c"
{
  "supplierAccountingLinkId": "uuid",
  "journalEntryId": "uuid",
  "status": "active"
}
```

---

## 29. Integración con Bank Reconciliation

### 29.1. Permitido

```text id="w7oat8"
- vincular SupplierPaymentOrder con BankTransaction;
- vincular SupplierPaymentOrder con ReconciliationMatch;
- consultar candidatos;
- desvincular con razón;
- auditar link/unlink.
```

---

### 29.2. Prohibido

```text id="klyq0h"
- crear ReconciliationMatch final;
- marcar BankTransaction matched;
- cerrar ReconciliationSession;
- marcar Payment reconciled;
- confirmar conciliación bancaria final.
```

---

## 30. Endpoints públicos prohibidos

No crear ni documentar:

```text id="hoyjo7"
GET  /api/v1/public/suppliers
GET  /api/v1/public/supplier-payables
GET  /api/v1/public/supplier-payment-orders
GET  /api/v1/public/supplier-payment-reports
GET  /api/v1/public/tenants/{slug}/suppliers
GET  /api/v1/public/tenants/{slug}/supplier-payables
GET  /api/v1/public/tenants/{slug}/supplier-payment-orders
POST /api/v1/public/supplier-payment-orders
POST /api/v1/public/supplier-payables
```

Todos deben responder:

```text id="u48wp0"
404 Not Found
```

---

## 31. Endpoints `/me` prohibidos en MVP

No crear ni documentar:

```text id="klsuw7"
GET  /api/v1/me/suppliers
GET  /api/v1/me/supplier-payables
GET  /api/v1/me/supplier-payment-orders
GET  /api/v1/me/supplier-payment-reports
POST /api/v1/me/supplier-payables
POST /api/v1/me/supplier-payment-orders
```

Todos deben responder:

```text id="z9ps5b"
404 Not Found
```

---

## 32. Seguridad CORS / WordPress

Regla:

```text id="f962jk"
WordPress no accede a Supplier Payments.
```

Rutas `supplier-payments` no deben estar habilitadas para consumo desde portales públicos.

No permitir:

```text id="wvmxx5"
- CORS público para rutas supplier payments;
- API pública de proveedores;
- widgets WordPress de cuentas por pagar;
- enlaces directos a evidencias o reportes;
- storageKey o signedUrl persistente en frontend público.
```

---

## 33. OpenAPI extensions

### 33.1. Endpoints tenant

```yaml id="bp3wtf"
x-tenant-scope: true
x-auth-required: true
x-supplier-payments: true
x-public-exposure: false
```

---

### 33.2. Payables

```yaml id="f8b5kq"
x-payable-controlled: true
x-approval-required: true
x-duplicate-detection: true
x-decimal-money: true
```

---

### 33.3. Payment orders

```yaml id="jlik41"
x-payment-order: true
x-bank-transfer-initiation: false
x-evidence-required-for-paid: true
x-accounting-linked: true
x-reconciliation-ready: true
```

---

### 33.4. Documents

```yaml id="tubage"
x-secure-document-storage: true
x-storage-key-exposed: false
```

---

### 33.5. Restrictions

```yaml id="pjsreb"
x-public-endpoint: false
x-me-endpoint: false
x-wordpress-access: false
x-open-banking-payment-initiation: false
x-bank-transfer-initiation: false
x-electronic-invoicing: false
x-external-ai-real-data: false
```

---

## 34. Audit events by endpoint

| Endpoint group         | Main events                                                                                                                                                                                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Supplier categories    | `supplierCategory.created`, `supplierCategory.updated`, `supplierCategory.archived`                                                                                                                                                                                             |
| Suppliers              | `supplier.created`, `supplier.updated`, `supplier.activated`, `supplier.disabled`, `supplier.blocked`, `supplier.archived`                                                                                                                                                      |
| Supplier contacts      | `supplierContact.created`, `supplierContact.updated`, `supplierContact.archived`                                                                                                                                                                                                |
| Supplier bank accounts | `supplierBankAccount.created`, `supplierBankAccount.updated`, `supplierBankAccount.verified`, `supplierBankAccount.disabled`, `supplierBankAccount.archived`                                                                                                                    |
| Supplier documents     | `supplierDocument.linked`, `supplierDocument.archived`, `supplierDocument.downloaded`                                                                                                                                                                                           |
| Supplier payables      | `supplierPayable.created`, `supplierPayable.updatedDraft`, `supplierPayable.submittedForReview`, `supplierPayable.approved`, `supplierPayable.rejected`, `supplierPayable.cancelled`, `supplierPayable.voided`, `supplierPayable.archived`, `supplierPayable.duplicateDetected` |
| Payment orders         | `supplierPaymentOrder.created`, `supplierPaymentOrder.submittedForApproval`, `supplierPaymentOrder.approved`, `supplierPaymentOrder.rejected`, `supplierPaymentOrder.scheduled`, `supplierPaymentOrder.paid`, `supplierPaymentOrder.reversed`, `supplierPaymentOrder.archived`  |
| Evidence               | `supplierPaymentEvidence.created`, `supplierPaymentEvidence.verified`, `supplierPaymentEvidence.rejected`, `supplierPaymentEvidence.archived`, `supplierPaymentEvidence.downloaded`                                                                                             |
| Reconciliation links   | `supplierBankReconciliationLink.created`, `supplierBankReconciliationLink.unlinked`                                                                                                                                                                                             |
| Reports                | `supplierPaymentReport.generated`, `supplierPaymentReport.exported`                                                                                                                                                                                                             |

---

## 35. Observability

### 35.1. Logs permitidos

```text id="zckgek"
supplier.created
supplier.blocked
supplierPayable.approved
supplierPayable.duplicateDetected
supplierPaymentOrder.approved
supplierPaymentOrder.paid
supplierPaymentOrder.reversed
supplierAccountingLink.failed
supplierBankReconciliationLink.created
supplierPaymentReport.exported
```

---

### 35.2. Métricas permitidas

```text id="fo3zg1"
supplier_payments_suppliers_total
supplier_payments_payables_total
supplier_payments_payables_approved_total
supplier_payments_payables_overdue_total
supplier_payments_orders_total
supplier_payments_orders_paid_total
supplier_payments_duplicate_payables_detected_total
supplier_payments_total_amount_paid
supplier_payments_accounting_links_failed_total
supplier_payments_reports_exported_total
```

---

### 35.3. Labels permitidos

```text id="qnmh6k"
supplierType
payableStatus
paymentOrderStatus
paymentMethod
documentType
currency
outcome
```

---

### 35.4. Labels prohibidos

```text id="e5eeit"
tenantId
supplierId
supplierPayableId
supplierPaymentOrderId
supplierBankAccountId
secureDocumentId
journalEntryId
bankTransactionId
traceId
```

---

## 36. Rate limiting recomendado

Aplicar rate limit reforzado en:

```text id="fbz626"
POST /tenant/supplier-payables
POST /tenant/supplier-payables/{payableId}/approve
POST /tenant/supplier-payment-orders
POST /tenant/supplier-payment-orders/{paymentOrderId}/approve
POST /tenant/supplier-payment-orders/{paymentOrderId}/mark-paid
POST /tenant/supplier-payment-orders/{paymentOrderId}/reverse
GET  /tenant/supplier-payment-reports/export
```

---

## 37. Casos borde API

| Caso                                                       | Resultado esperado                      |
| ---------------------------------------------------------- | --------------------------------------- |
| Crear supplier con `tenantId`                              | 422                                     |
| Crear supplier con `supplierCode` duplicado                | 409                                     |
| Crear payable para supplier inactive                       | 409                                     |
| Crear payable para supplier blocked                        | 409 según política                      |
| Crear payable con monto negativo                           | 422                                     |
| Crear payable duplicado                                    | 409 o warning controlado según política |
| Aprobar payable cross-tenant                               | 404                                     |
| Crear payment order sin items                              | 422                                     |
| Crear payment order con payable no aprobado                | 409                                     |
| Crear payment order con item mayor al outstanding          | 409                                     |
| Aprobar payment order de supplier blocked                  | 409                                     |
| Mark-paid sin aprobación                                   | 409                                     |
| Mark-paid sin referencia/evidencia                         | 422/409                                 |
| Mark-paid con paidAmount mayor a totalAmount               | 409                                     |
| Crear evidence con secureDocument cross-tenant             | 404                                     |
| Crear reconciliation link con bankTransaction cross-tenant | 404                                     |
| Intentar iniciar transferencia bancaria                    | 404/403                                 |
| Intentar Open Banking payment initiation                   | 404/403                                 |
| Acceso desde endpoint público                              | 404                                     |
| Acceso desde `/me`                                         | 404                                     |
| Response expone storageKey                                 | falla crítica                           |
| Response expone accountNumberHash                          | falla crítica                           |

---

## 38. Criterios de aceptación del contrato

```text id="u5cd1j"
[ ] Todos los endpoints tenant requieren Bearer token.
[ ] Todos los endpoints tenant requieren TenantGuard.
[ ] Todos los endpoints aplican PermissionGuard.
[ ] Ningún DTO acepta tenantId.
[ ] Ningún DTO acepta actor fields.
[ ] Ningún DTO expone storageKey.
[ ] Ningún DTO expone full bank account number.
[ ] Montos se reciben como string decimal.
[ ] Montos se devuelven como string decimal.
[ ] SupplierBankAccount devuelve masked values.
[ ] Payable total se calcula/valida server-side.
[ ] Outstanding amount se calcula server-side.
[ ] PaymentOrder total se calcula desde items.
[ ] Mark-paid no inicia transferencia.
[ ] Mark-paid requiere aprobación.
[ ] Mark-paid requiere referencia o evidencia.
[ ] Reversal no edita destructivamente histórico.
[ ] Accounting Ledger se invoca por puerto/evento.
[ ] Supplier Payments no edita JournalEntry posted.
[ ] Bank Reconciliation link no confirma conciliación final.
[ ] No hay endpoints públicos.
[ ] No hay endpoints /me.
[ ] No hay acceso desde WordPress.
[ ] No hay Open Banking payment initiation.
[ ] No hay external AI con datos reales.
[ ] OpenAPI incluye extensiones de seguridad.
```

---

## 39. No aceptación

La API no debe aceptarse si:

```text id="zu9hut"
- permite supplier cross-tenant;
- permite supplier category cross-tenant;
- permite supplier contact cross-tenant;
- permite supplier bank account cross-tenant;
- permite supplier document cross-tenant;
- permite supplier payable cross-tenant;
- permite supplier payment order cross-tenant;
- permite supplier payment evidence cross-tenant;
- permite supplier accounting link cross-tenant;
- permite supplier reconciliation link cross-tenant;
- permite report cross-tenant;
- acepta tenantId desde body;
- acepta actor fields desde body;
- acepta status directo sin endpoint de transición;
- expone número completo de cuenta bancaria;
- expone accountNumberHash;
- expone identificationNumberHash;
- expone storageKey;
- expone signedUrl persistente;
- permite pago a supplier blocked;
- permite payable para supplier inactive/archived;
- permite aprobar payable duplicado crítico sin control;
- permite payment order sin items;
- permite payment order con payable no aprobado;
- permite pagar más del outstandingAmount;
- permite outstandingAmount negativo;
- permite paid sin aprobación;
- permite paid sin referencia/evidencia mínima;
- inicia transferencia bancaria;
- inicia pago Open Banking;
- edita destructivamente pago paid;
- edita JournalEntry posted;
- marca BankTransaction matched desde Supplier Payments;
- crea ReconciliationMatch final;
- cierra ReconciliationSession;
- crea endpoints públicos;
- documenta endpoints públicos en OpenAPI;
- crea endpoints /me;
- permite acceso desde WordPress;
- envía datos reales a IA externa;
- omite auditoría crítica;
- usa float/double para dinero.
```

---

## 40. Resultado esperado

Al implementar este contrato API, el módulo `021-supplier-payments` debe exponer una superficie REST privada, segura, tenant-scoped y auditada para gestionar proveedores y egresos administrativos.

Resultado esperado:

```text id="t2j33h"
Supplier Categories API definida
Suppliers API definida
Supplier Contacts API definida
Supplier Bank Accounts API definida
Supplier Documents API definida
Supplier Payables API definida
Supplier Payment Orders API definida
Supplier Payment Evidence API definida
Supplier Reconciliation Links API definida
Supplier Payment Reports API definida
DTOs seguros definidos
errores definidos
permisos definidos
OpenAPI seguro definido
no tenantId body
no full bank account exposure
no storageKey exposure
Decimal money
duplicate detection
approval-controlled payables
approval-controlled payment orders
manual mark-paid
payment evidence
partial payments
Accounting Ledger integration
Bank Reconciliation link
no bank transfer initiation
no Open Banking payment initiation
no public endpoints
no /me endpoints
no WordPress access
no external AI with real supplier/payment data
```

---

## 41. Expediente actualizado

```text id="m5htkm"
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
│   │   ├── 020-accounting-ledger/
│   │   └── 021-supplier-payments/
│   │       ├── spec.md
│   │       ├── plan.md
│   │       ├── data-model.md
│   │       └── api-contract.md
```
