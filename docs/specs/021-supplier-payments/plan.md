# Plan — Spec 021 Supplier Payments

## 1. Información del documento

| Campo           | Valor                                                                                                                                                 |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                         |
| Spec ID         | 021                                                                                                                                                   |
| Módulo          | Supplier Payments                                                                                                                                     |
| Documento       | Plan técnico                                                                                                                                          |
| Ruta            | `docs/specs/021-supplier-payments/plan.md`                                                                                                            |
| Versión         | 0.1                                                                                                                                                   |
| Estado          | Borrador inicial                                                                                                                                      |
| Fecha           | 2026-07-23                                                                                                                                            |
| Documento base  | `docs/specs/021-supplier-payments/spec.md`                                                                                                            |
| Depende de      | `001-tenants`, `002-users-roles`, `007-audit`, `008-basic-reports`, `016-secure-document-storage`, `017-bank-reconciliation`, `020-accounting-ledger` |
| Relacionado con | proveedores, cuentas por pagar, facturas, órdenes de pago, egresos, evidencias, contabilidad, conciliación bancaria                                   |
| API Style       | REST                                                                                                                                                  |
| Arquitectura    | Monolito modular preparado para microservicios                                                                                                        |
| Stack objetivo  | NestJS, TypeScript, PostgreSQL, Prisma, Decimal, OpenAPI, Keycloak/OIDC, Docker, Secure Document Storage                                              |

---

## 2. Propósito

Este documento define el plan técnico para implementar el módulo `021-supplier-payments`.

El módulo permitirá gestionar proveedores, categorías, contactos, referencias bancarias, documentos, obligaciones por pagar, aprobaciones, órdenes de pago, evidencias, pagos manuales, pagos parciales, vínculos contables, vínculos con conciliación bancaria, reportes y exportaciones administrativas.

Regla central:

```text id="tdmptc"
Supplier Payments debe operar como módulo financiero-administrativo tenant-scoped, proveedor-aware, payable-driven, approval-controlled, evidence-backed, accounting-linked, reconciliation-ready, audit-heavy y sin capacidad de iniciar transferencias bancarias, sin Open Banking payment initiation, sin facturación electrónica/SRI en MVP, sin endpoints públicos, sin endpoints /me y sin acceso desde WordPress.
```

---

## 3. Decisión técnica inicial

### 3.1. Nombre técnico del módulo

```text id="ld75ga"
supplier-payments
```

---

### 3.2. Ruta sugerida

```text id="mnr69q"
apps/api/src/modules/supplier-payments/
```

---

### 3.3. Tipo de módulo

```text id="is5qm9"
Financial administrative module
Tenant-scoped
Supplier-aware
Accounts-payable basic
Approval-controlled
Manual-payment-recording
Evidence-backed
Accounting-linked
Reconciliation-ready
Audit-heavy
Non-public administrative surface
```

---

### 3.4. Estilo arquitectónico

El módulo seguirá el patrón general de RESIDENT Core:

```text id="k05ssu"
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
Secure Document Storage para evidencias
Accounting Ledger para efectos contables
Bank Reconciliation para trazabilidad bancaria
auditoría financiera obligatoria
observabilidad segura
preparado para separación futura como microservicio de cuentas por pagar
```

---

## 4. Decisión MVP

El MVP será un módulo de **proveedores y cuentas por pagar básicas**, con registro manual de pagos.

Incluye:

```text id="z1srda"
- supplier registry por tenant;
- supplier categories;
- supplier contacts;
- supplier bank account references protegidas;
- supplier documents vía Secure Document Storage;
- supplier payables;
- duplicate detection básica;
- approval workflow básico;
- supplier payment orders;
- supplier payment order items;
- approval de órdenes;
- mark-paid manual;
- payment evidence;
- partial payments básicos;
- outstanding amount server-side;
- payment reversal/correction básico;
- accounting events hacia Accounting Ledger;
- bank reconciliation links;
- reports básicos;
- exports vía Secure Document Storage;
- auditoría completa;
- logs y métricas seguras;
- OpenAPI privado;
- no public endpoints;
- no `/me` endpoints;
- no WordPress access;
- no automatic bank transfer;
- no Open Banking payment initiation;
- no electronic invoicing/SRI;
- no tax compliance completo;
- no external AI con datos reales.
```

---

## 5. Fuera de alcance técnico MVP

No implementar en esta spec:

```text id="yzja8l"
- transferencias bancarias automáticas;
- payment initiation vía Open Banking;
- archivos bancarios de pago masivo;
- cash management avanzado;
- tesorería avanzada;
- cuentas por pagar enterprise;
- workflow complejo multi-nivel;
- aprobación por matriz avanzada;
- órdenes de compra formales;
- recepción de bienes/servicios;
- contratos avanzados;
- retenciones tributarias;
- facturación electrónica;
- integración SRI;
- validación tributaria automática;
- anexos tributarios;
- inventarios;
- activos fijos;
- presupuestos avanzados;
- centros de costo avanzados;
- firma electrónica;
- pagos recurrentes automáticos;
- domiciliación bancaria;
- conciliación bancaria automática final;
- OCR de facturas reales;
- IA para validar facturas reales;
- portal público de proveedores.
```

---

## 6. Dependencias funcionales

### 6.1. `001-tenants`

Uso:

```text id="q5jz2k"
- validar tenant activo;
- aplicar tenant_id en suppliers, categories, contacts, bank accounts, documents, payables, approvals, payment orders, order items, evidence, accounting links, reconciliation links y reports;
- impedir proveedores cross-tenant;
- impedir pagos cross-tenant;
- bloquear operación si tenant está suspended/archived.
```

---

### 6.2. `002-users-roles`

Uso:

```text id="lq3eg5"
- validar usuario autenticado;
- validar membership activa;
- validar permisos supplierPayments;
- auditar actor real;
- impedir acceso a residentes/propietarios en MVP;
- impedir acceso automático de PlatformAdmin a egresos tenant.
```

---

### 6.3. `007-audit`

Uso:

```text id="h05knv"
- auditar proveedores;
- auditar categorías;
- auditar contactos;
- auditar cuentas bancarias;
- auditar documentos;
- auditar obligaciones;
- auditar aprobaciones;
- auditar órdenes de pago;
- auditar evidencias;
- auditar mark-paid;
- auditar reversos;
- auditar vínculos contables;
- auditar vínculos bancarios;
- auditar reportes y exports.
```

---

### 6.4. `008-basic-reports`

Uso:

```text id="datyo2"
- integrar reportes de cuentas por pagar;
- integrar reportes de pagos por proveedor;
- integrar egresos por categoría;
- integrar cash outflow básico;
- permitir exports administrativos.
```

---

### 6.5. `016-secure-document-storage`

Uso:

```text id="krcgon"
- documentos de proveedor;
- facturas;
- recibos;
- contratos;
- comprobantes bancarios;
- evidencias de pago;
- reportes exportados.
```

Recomendación:

```text id="g26nas"
Extender SourceModule de Secure Document Storage con supplierPayments.
```

Clasificación recomendada:

```text id="sj8qzo"
visibility = administrative
sensitivity = restricted
```

---

### 6.6. `017-bank-reconciliation`

Uso:

```text id="s2d34d"
- vincular SupplierPaymentOrder paid con BankTransaction;
- vincular SupplierPaymentOrder paid con ReconciliationMatch;
- comparar monto, fecha, referencia y cuenta;
- consultar movimientos conciliados;
- no confirmar conciliación final desde Supplier Payments.
```

Regla:

```text id="zj12gu"
Bank Reconciliation confirma movimientos bancarios; Supplier Payments solo mantiene vínculo administrativo.
```

---

### 6.7. `020-accounting-ledger`

Eventos candidatos:

```text id="nsm6l3"
supplierPayable.approved
supplierPaymentOrder.paid
supplierPaymentOrder.partiallyPaid
supplierPaymentOrder.voided
supplierPaymentOrder.reversed
supplierPayable.adjusted
```

Uso:

```text id="k562is"
- generar asiento por obligación aprobada;
- generar asiento por pago registrado;
- generar asiento por reverso/corrección;
- mantener SupplierAccountingLink hacia JournalEntry;
- no editar JournalEntry posted.
```

Regla:

```text id="mvgkkj"
Supplier Payments emite eventos contables; Accounting Ledger registra efectos contables.
```

---

### 6.8. `019-open-banking-integration`

Uso indirecto:

```text id="p67kd5"
- Open Banking sincroniza movimientos;
- Bank Reconciliation procesa movimientos;
- Supplier Payments puede vincular pagos con transacciones ya procesadas por Bank Reconciliation.
```

Prohibido:

```text id="spka29"
Supplier Payments no inicia pagos mediante Open Banking en MVP.
```

---

## 7. Estructura de carpetas propuesta

```text id="rknt2j"
apps/api/src/modules/supplier-payments/
├── supplier-payments.module.ts
├── controllers/
│   ├── supplier-categories.controller.ts
│   ├── suppliers.controller.ts
│   ├── supplier-contacts.controller.ts
│   ├── supplier-bank-accounts.controller.ts
│   ├── supplier-documents.controller.ts
│   ├── supplier-payables.controller.ts
│   ├── supplier-payable-approvals.controller.ts
│   ├── supplier-payment-orders.controller.ts
│   ├── supplier-payment-evidence.controller.ts
│   ├── supplier-reconciliation-links.controller.ts
│   └── supplier-payment-reports.controller.ts
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
│   ├── documents/
│   ├── accounting/
│   ├── reconciliation/
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

```text id="z2m6cu"
SupplierPaymentsModule
```

Responsabilidades:

```text id="xytewi"
- registrar controladores;
- registrar servicios de aplicación;
- registrar repositorios;
- registrar policies;
- registrar integraciones SDS;
- registrar integraciones Accounting Ledger;
- registrar integraciones Bank Reconciliation;
- registrar audit integration;
- registrar observabilidad;
- publicar OpenAPI seguro.
```

---

### 8.2. Controladores

```text id="loazxz"
SupplierCategoriesController
SuppliersController
SupplierContactsController
SupplierBankAccountsController
SupplierDocumentsController
SupplierPayablesController
SupplierPayableApprovalsController
SupplierPaymentOrdersController
SupplierPaymentEvidenceController
SupplierReconciliationLinksController
SupplierPaymentReportsController
```

---

### 8.3. Servicios de aplicación

```text id="c8k44c"
SupplierCategoryService
SupplierService
SupplierContactService
SupplierBankAccountService
SupplierDocumentService
SupplierPayableService
SupplierPayableApprovalService
SupplierPaymentOrderService
SupplierPaymentOrderItemService
SupplierPaymentEvidenceService
SupplierPaymentAmountService
SupplierDuplicateDetectionService
SupplierAccountingIntegrationService
SupplierBankReconciliationLinkService
SupplierPaymentReportService
SupplierPaymentExportService
SupplierPaymentAuditService
SupplierPaymentObservabilityService
```

---

### 8.4. Entidades de dominio

```text id="eqc5pk"
Supplier
SupplierCategory
SupplierContact
SupplierBankAccount
SupplierDocument
SupplierPayable
SupplierPayableApproval
SupplierPaymentOrder
SupplierPaymentOrderItem
SupplierPaymentEvidence
SupplierAccountingLink
SupplierBankReconciliationLink
```

---

### 8.5. Value Objects

```text id="c3qfkh"
SupplierCode
SupplierName
SupplierIdentification
SupplierEmail
SupplierPhone
SupplierBankAccountMasked
SupplierBankAccountHash
SupplierPayableNumber
SupplierExternalDocumentNumber
SupplierPayableDuplicateFingerprint
SupplierPaymentOrderNumber
SupplierPaymentReference
SupplierPaymentAmount
SupplierOutstandingAmount
SupplierDueDate
SupplierPaymentDescription
SupplierDocumentReference
```

---

### 8.6. Puertos de aplicación

```text id="u97gys"
SupplierCategoryRepositoryPort
SupplierRepositoryPort
SupplierContactRepositoryPort
SupplierBankAccountRepositoryPort
SupplierDocumentRepositoryPort
SupplierPayableRepositoryPort
SupplierPayableApprovalRepositoryPort
SupplierPaymentOrderRepositoryPort
SupplierPaymentOrderItemRepositoryPort
SupplierPaymentEvidenceRepositoryPort
SupplierAccountingLinkRepositoryPort
SupplierBankReconciliationLinkRepositoryPort

SecureDocumentStoragePort
AccountingLedgerPort
BankReconciliationPort
AuditPort
ClockPort
IdempotencyPort
DecimalMathPort
ReportExportPort
ObservabilityPort
```

---

### 8.7. Repositorios Prisma

```text id="k103kw"
PrismaSupplierCategoryRepository
PrismaSupplierRepository
PrismaSupplierContactRepository
PrismaSupplierBankAccountRepository
PrismaSupplierDocumentRepository
PrismaSupplierPayableRepository
PrismaSupplierPayableApprovalRepository
PrismaSupplierPaymentOrderRepository
PrismaSupplierPaymentOrderItemRepository
PrismaSupplierPaymentEvidenceRepository
PrismaSupplierAccountingLinkRepository
PrismaSupplierBankReconciliationLinkRepository
```

---

## 9. Modelo de datos previsto

### 9.1. Tablas nuevas MVP

```text id="u0fxu7"
supplier_categories
suppliers
supplier_contacts
supplier_bank_accounts
supplier_documents
supplier_payables
supplier_payable_approvals
supplier_payment_orders
supplier_payment_order_items
supplier_payment_evidence
supplier_accounting_links
supplier_bank_reconciliation_links
```

---

### 9.2. Tablas externas relacionadas

```text id="nbfp6f"
tenants
user_profiles
secure_documents
secure_document_files
bank_accounts
bank_transactions
reconciliation_matches
journal_entries
journal_entry_lines
accounting_source_event_links
audit_logs
```

---

### 9.3. Regla multitenant

Todas las tablas operativas deben incluir:

```text id="todgz8"
tenant_id
```

Patrón requerido:

```typescript id="wqjdk9"
await prisma.supplierPayable.findFirst({
  where: {
    id: payableId,
    tenantId: currentTenant.id,
    archivedAt: null
  }
});
```

Patrón prohibido:

```typescript id="znpgup"
await prisma.supplierPayable.findUnique({
  where: { id: payableId }
});
```

---

## 10. Diseño de estados

### 10.1. Supplier

Estados:

```text id="g28kaj"
draft
active
inactive
blocked
archived
```

Transiciones:

```text id="ncs4qi"
draft -> active
active -> inactive
inactive -> active
active -> blocked
blocked -> active
draft -> archived
inactive -> archived
blocked -> archived
active -> archived
```

Reglas:

```text id="ln90mk"
- active puede recibir nuevas obligaciones;
- blocked no puede recibir nuevas órdenes aprobadas;
- archived conserva historial;
- archived no se reactiva.
```

---

### 10.2. SupplierCategory

Estados:

```text id="s5bchq"
active
inactive
archived
```

Transiciones:

```text id="wjhbry"
active -> inactive
inactive -> active
active -> archived
inactive -> archived
```

---

### 10.3. SupplierContact

Estados:

```text id="fhlw7s"
active
inactive
archived
```

---

### 10.4. SupplierBankAccount

Estados:

```text id="vxysuu"
draft
verified
active
inactive
rejected
archived
```

Transiciones:

```text id="lu9v8d"
draft -> verified
verified -> active
draft -> rejected
active -> inactive
inactive -> active
draft -> archived
verified -> archived
active -> archived
inactive -> archived
rejected -> archived
```

Reglas:

```text id="yblkxn"
- active puede usarse en órdenes de pago;
- rejected no puede usarse;
- archived no puede usarse;
- no exponer número completo.
```

---

### 10.5. SupplierPayable

Estados:

```text id="r2enqh"
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

Transiciones:

```text id="gjwfp7"
draft -> pendingReview
pendingReview -> approved
pendingReview -> rejected
approved -> scheduledForPayment
approved -> partiallyPaid
approved -> paid
scheduledForPayment -> partiallyPaid
scheduledForPayment -> paid
partiallyPaid -> paid
draft -> cancelled
pendingReview -> cancelled
approved -> cancelled si no tiene pagos
draft -> voided
rejected -> archived
cancelled -> archived
voided -> archived
paid -> archived
```

Reglas:

```text id="r5935u"
- approved habilita pago;
- partiallyPaid conserva outstandingAmount > 0;
- paid requiere outstandingAmount = 0;
- cancelled no debe tener pagos válidos;
- paid no se edita destructivamente.
```

---

### 10.6. SupplierPayableApproval

Estados:

```text id="x922t2"
pending
approved
rejected
cancelled
```

---

### 10.7. SupplierPaymentOrder

Estados:

```text id="hjscpx"
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

Transiciones:

```text id="pkuc33"
draft -> pendingApproval
pendingApproval -> approved
pendingApproval -> rejected
approved -> scheduled
approved -> paid
scheduled -> paid
approved -> partiallyPaid
scheduled -> partiallyPaid
partiallyPaid -> paid
approved -> voided
draft -> voided
pendingApproval -> voided
approved -> cancelled si no paid
paid -> archived
partiallyPaid -> archived bajo política
voided -> archived
cancelled -> archived
failed -> archived
```

Reglas:

```text id="vt7753"
- paid registra ejecución externa/manual;
- paid no inicia transferencia;
- paid requiere evidencia o referencia;
- paid debe actualizar saldos pendientes;
- paid puede generar evento contable;
- paid no se edita destructivamente.
```

---

### 10.8. SupplierPaymentEvidence

Estados:

```text id="zibgdb"
uploaded
verified
rejected
archived
```

---

### 10.9. SupplierAccountingLink

Estados:

```text id="w8zhjc"
active
failed
reversed
archived
```

---

### 10.10. SupplierBankReconciliationLink

Estados:

```text id="pd5ujb"
active
unlinked
archived
```

---

## 11. Estrategia de datos bancarios de proveedor

### 11.1. Objetivo

Registrar referencias bancarias suficientes para documentar pagos manuales, sin almacenar datos innecesarios o inseguros.

---

### 11.2. Campos permitidos

```text id="glldx0"
bankName
accountType
accountNumberMasked
accountNumberHash
beneficiaryName
beneficiaryIdentificationMasked
beneficiaryIdentificationHash
currency
status
```

---

### 11.3. Campos prohibidos

```text id="b82fia"
número completo de cuenta en texto plano
clave bancaria
usuario bancario
contraseña bancaria
OTP
MFA secret
token bancario
payload bancario crudo
```

---

### 11.4. Hash recomendado

```text id="hno5rb"
SHA-256 con pepper tenant-aware o secret global protegido
```

---

## 12. Estrategia de documentos y evidencias

### 12.1. Secure Document Storage

Todo documento debe vincularse mediante `016-secure-document-storage`.

Tipos:

```text id="wkbx8n"
supplierDocument
supplierInvoice
supplierReceipt
supplierContract
supplierPaymentEvidence
supplierReportExport
```

---

### 12.2. Metadata recomendada

```text id="r6j079"
sourceModule = supplierPayments
sourceResourceType = supplier | supplierPayable | supplierPaymentOrder | supplierPaymentEvidence | supplierReportExport
visibility = administrative
sensitivity = restricted
```

---

### 12.3. API

La API puede devolver:

```text id="tge6ra"
secureDocumentId
secureDocumentFileId
downloadAvailable
```

La API no debe devolver:

```text id="d87grt"
storageKey
signedUrl persistente
ruta interna del storage
payload binario
base64 del archivo
```

---

## 13. Estrategia de montos

### 13.1. Decimal obligatorio

Todos los montos usan:

```text id="qa4qps"
Decimal(12,2)
```

---

### 13.2. Campos monetarios principales

```text id="d66qxz"
subtotalAmount
taxAmount
discountAmount
totalAmount
outstandingAmount
paymentOrder.totalAmount
paymentOrder.paidAmount
paymentOrderItem.amount
paymentEvidence.amount
```

---

### 13.3. Fórmulas server-side

Total payable:

```text id="s1th8f"
totalAmount = subtotalAmount + taxAmount - discountAmount
```

Outstanding:

```text id="tl2igo"
outstandingAmount = totalAmount - sum(validPaidItems)
```

Payment order total:

```text id="m04yc9"
paymentOrder.totalAmount = sum(paymentOrderItems.amount)
```

---

### 13.4. Prohibido

```text id="t0mt23"
float
double
JavaScript number como fuente de verdad
cálculo monetario confiado al frontend
pago mayor al outstandingAmount
```

---

## 14. Estrategia de duplicados

### 14.1. Supplier duplicates

Control básico:

```text id="q20y6y"
tenantId + supplierCode
```

Opcional:

```text id="pimnay"
tenantId + identificationNumberHash
```

---

### 14.2. Payable duplicates

Fingerprint conceptual:

```text id="pfyjin"
tenantId + supplierId + externalDocumentNumber + issueDate + totalAmount
```

Hash:

```text id="f372st"
SHA-256
```

---

### 14.3. Payment duplicate prevention

Validar:

```text id="knpo6z"
- payable outstandingAmount;
- payment order items no exceden saldo;
- misma payable no se paga simultáneamente dos veces;
- paymentReference duplicada bajo mismo supplier/monto/fecha se marca como sospechosa.
```

---

## 15. Estrategia de aprobación

### 15.1. Aprobación MVP

El MVP tendrá aprobación simple:

```text id="xk8qoz"
pendingReview -> approved | rejected
pendingApproval -> approved | rejected
```

---

### 15.2. Payable approval

Requiere:

```text id="mx6vo3"
supplierPayables.approve
```

---

### 15.3. Payment order approval

Requiere:

```text id="c8r3va"
supplierPaymentOrders.approve
```

---

### 15.4. Futuro

Quedan para evolución:

```text id="pec5z1"
aprobaciones por monto
aprobaciones multi-nivel
aprobaciones por categoría
aprobación del consejo
firma electrónica
reglas por presupuesto
```

---

## 16. Estrategia de órdenes de pago

### 16.1. Propósito

Una `SupplierPaymentOrder` agrupa uno o varios payables aprobados para registrar una intención interna de pago.

---

### 16.2. Reglas

```text id="a8vbxb"
- requiere supplierId;
- requiere al menos un item;
- todos los items deben pertenecer al mismo tenant;
- por defecto todos los items deben pertenecer al mismo supplier;
- totalAmount se calcula server-side;
- no puede exceder outstandingAmount de cada payable;
- no ejecuta transferencia bancaria;
- mark-paid requiere aprobación previa;
- paid requiere referencia o evidencia.
```

---

## 17. Estrategia de pagos parciales

### 17.1. Permitido en MVP

Una obligación puede pagarse parcialmente.

Reglas:

```text id="hud0sf"
- amount del item debe ser > 0;
- amount del item no puede exceder outstandingAmount;
- payable pasa a partiallyPaid si outstandingAmount > 0;
- payable pasa a paid si outstandingAmount = 0;
- order puede ser partiallyPaid si no todos sus items quedan cubiertos.
```

---

### 17.2. Prohibido

```text id="j2xqt1"
- paidAmount negativo;
- outstandingAmount negativo;
- overpayment;
- pago parcial sin trazabilidad;
- edición destructiva de pago parcial registrado.
```

---

## 18. Estrategia de reversos/correcciones

### 18.1. Principio

Un pago registrado no se modifica destructivamente.

Se corrige mediante:

```text id="qlmyej"
payment order reversal
supplier payable adjustment
accounting reversal
bank reconciliation unlink si aplica
```

---

### 18.2. Reversal básico

Debe:

```text id="m8dmbj"
- requerir permiso supplierPaymentOrders.reverse;
- requerir reason;
- validar estado paid/partiallyPaid;
- crear evento supplierPaymentOrder.reversed;
- recalcular outstandingAmount;
- crear SupplierAccountingLink de reverso si aplica;
- no editar evidencia histórica;
- auditar.
```

---

## 19. Estrategia de Accounting Ledger

### 19.1. Puerto

```typescript id="seahuh"
interface SupplierAccountingLedgerPort {
  postSupplierPayableApproved(input: PostSupplierPayableApprovedInput): Promise<SupplierAccountingResult>;
  postSupplierPaymentRecorded(input: PostSupplierPaymentRecordedInput): Promise<SupplierAccountingResult>;
  postSupplierPaymentReversed(input: PostSupplierPaymentReversedInput): Promise<SupplierAccountingResult>;
}
```

---

### 19.2. Eventos contables

```text id="a6yust"
supplierPayable.approved
supplierPaymentOrder.paid
supplierPaymentOrder.partiallyPaid
supplierPaymentOrder.reversed
supplierPayable.adjusted
```

---

### 19.3. Ejemplos conceptuales

Obligación aprobada:

```text id="bdfgtw"
Dr Expense
Cr AccountsPayable
```

Pago registrado:

```text id="jjulmp"
Dr AccountsPayable
Cr Bank / Cash / PaymentClearing
```

Reverso:

```text id="w0p5k9"
Dr Bank / Cash / PaymentClearing
Cr AccountsPayable
```

---

### 19.4. Reglas

```text id="m917i3"
- Supplier Payments no crea JournalEntry directamente por DB;
- Supplier Payments no edita JournalEntry posted;
- integración por puerto/evento;
- SupplierAccountingLink mantiene trazabilidad;
- fallos contables deben registrarse y auditarse;
- pago operativo no debe perderse si falla accounting, pero queda accountingLink.failed/requiresReview.
```

---

## 20. Estrategia de Bank Reconciliation

### 20.1. Puerto

```typescript id="tpkibq"
interface SupplierBankReconciliationPort {
  findCandidateBankTransactions(input: FindSupplierBankTransactionCandidatesInput): Promise<BankTransactionCandidate[]>;
  linkPaymentOrderToBankTransaction(input: LinkSupplierPaymentOrderToBankTransactionInput): Promise<SupplierBankReconciliationLinkResult>;
  unlinkPaymentOrderFromBankTransaction(input: UnlinkSupplierPaymentOrderFromBankTransactionInput): Promise<void>;
}
```

---

### 20.2. Reglas

```text id="kgqzoh"
- validar tenant;
- validar BankTransaction tenant-scoped;
- validar amount/date/reference compatibility;
- no crear ReconciliationMatch final;
- no marcar BankTransaction matched;
- no cerrar ReconciliationSession;
- no marcar Payment reconciled;
- auditar link/unlink.
```

---

## 21. API prevista

### 21.1. Supplier categories

```text id="bmvesj"
GET    /api/v1/tenant/supplier-payment-categories
POST   /api/v1/tenant/supplier-payment-categories
GET    /api/v1/tenant/supplier-payment-categories/{categoryId}
PATCH  /api/v1/tenant/supplier-payment-categories/{categoryId}
POST   /api/v1/tenant/supplier-payment-categories/{categoryId}/archive
```

---

### 21.2. Suppliers

```text id="md6ttv"
GET    /api/v1/tenant/suppliers
POST   /api/v1/tenant/suppliers
GET    /api/v1/tenant/suppliers/{supplierId}
PATCH  /api/v1/tenant/suppliers/{supplierId}
POST   /api/v1/tenant/suppliers/{supplierId}/activate
POST   /api/v1/tenant/suppliers/{supplierId}/disable
POST   /api/v1/tenant/suppliers/{supplierId}/block
POST   /api/v1/tenant/suppliers/{supplierId}/archive
```

---

### 21.3. Supplier contacts

```text id="frxeje"
GET    /api/v1/tenant/suppliers/{supplierId}/contacts
POST   /api/v1/tenant/suppliers/{supplierId}/contacts
GET    /api/v1/tenant/supplier-contacts/{contactId}
PATCH  /api/v1/tenant/supplier-contacts/{contactId}
POST   /api/v1/tenant/supplier-contacts/{contactId}/archive
```

---

### 21.4. Supplier bank accounts

```text id="qb2ywu"
GET    /api/v1/tenant/suppliers/{supplierId}/bank-accounts
POST   /api/v1/tenant/suppliers/{supplierId}/bank-accounts
GET    /api/v1/tenant/supplier-bank-accounts/{bankAccountId}
PATCH  /api/v1/tenant/supplier-bank-accounts/{bankAccountId}
POST   /api/v1/tenant/supplier-bank-accounts/{bankAccountId}/verify
POST   /api/v1/tenant/supplier-bank-accounts/{bankAccountId}/disable
POST   /api/v1/tenant/supplier-bank-accounts/{bankAccountId}/archive
```

---

### 21.5. Supplier documents

```text id="x1smbe"
GET    /api/v1/tenant/suppliers/{supplierId}/documents
POST   /api/v1/tenant/suppliers/{supplierId}/documents
GET    /api/v1/tenant/supplier-documents/{supplierDocumentId}
POST   /api/v1/tenant/supplier-documents/{supplierDocumentId}/archive
```

---

### 21.6. Supplier payables

```text id="x6epq1"
GET    /api/v1/tenant/supplier-payables
POST   /api/v1/tenant/supplier-payables
GET    /api/v1/tenant/supplier-payables/{payableId}
PATCH  /api/v1/tenant/supplier-payables/{payableId}
POST   /api/v1/tenant/supplier-payables/{payableId}/submit-review
POST   /api/v1/tenant/supplier-payables/{payableId}/approve
POST   /api/v1/tenant/supplier-payables/{payableId}/reject
POST   /api/v1/tenant/supplier-payables/{payableId}/cancel
POST   /api/v1/tenant/supplier-payables/{payableId}/void
POST   /api/v1/tenant/supplier-payables/{payableId}/archive
```

---

### 21.7. Supplier payment orders

```text id="azjgz0"
GET    /api/v1/tenant/supplier-payment-orders
POST   /api/v1/tenant/supplier-payment-orders
GET    /api/v1/tenant/supplier-payment-orders/{paymentOrderId}
PATCH  /api/v1/tenant/supplier-payment-orders/{paymentOrderId}
POST   /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/submit-approval
POST   /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/approve
POST   /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/reject
POST   /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/schedule
POST   /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/mark-paid
POST   /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/void
POST   /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/cancel
POST   /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/reverse
POST   /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/archive
```

---

### 21.8. Supplier payment evidence

```text id="j04iio"
GET    /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/evidence
POST   /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/evidence
GET    /api/v1/tenant/supplier-payment-evidence/{evidenceId}
POST   /api/v1/tenant/supplier-payment-evidence/{evidenceId}/verify
POST   /api/v1/tenant/supplier-payment-evidence/{evidenceId}/reject
POST   /api/v1/tenant/supplier-payment-evidence/{evidenceId}/archive
```

---

### 21.9. Reconciliation links

```text id="ajhm35"
GET    /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/reconciliation-links
POST   /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/reconciliation-links
POST   /api/v1/tenant/supplier-payment-reconciliation-links/{linkId}/unlink
```

---

### 21.10. Reports

```text id="kfld3g"
GET    /api/v1/tenant/supplier-payment-reports/payables-aging
GET    /api/v1/tenant/supplier-payment-reports/payments-by-supplier
GET    /api/v1/tenant/supplier-payment-reports/expenses-by-category
GET    /api/v1/tenant/supplier-payment-reports/cash-outflow
GET    /api/v1/tenant/supplier-payment-reports/export
```

---

### 21.11. Endpoints prohibidos

```text id="e4jmrt"
GET  /api/v1/public/suppliers
GET  /api/v1/public/supplier-payables
GET  /api/v1/public/supplier-payment-orders
GET  /api/v1/public/supplier-payment-reports
GET  /api/v1/public/tenants/{slug}/suppliers
GET  /api/v1/public/tenants/{slug}/supplier-payables
GET  /api/v1/public/tenants/{slug}/supplier-payment-orders

GET  /api/v1/me/suppliers
GET  /api/v1/me/supplier-payables
GET  /api/v1/me/supplier-payment-orders
GET  /api/v1/me/supplier-payment-reports
```

---

## 22. DTOs previstos

### 22.1. Supplier categories

```text id="e4xx15"
CreateSupplierCategoryDto
UpdateSupplierCategoryDto
ArchiveSupplierCategoryDto
SupplierCategoryDto
SupplierCategoryListItemDto
SupplierCategoryFilterDto
```

---

### 22.2. Suppliers

```text id="lnpfq3"
CreateSupplierDto
UpdateSupplierDto
ActivateSupplierDto
DisableSupplierDto
BlockSupplierDto
ArchiveSupplierDto
SupplierDto
SupplierListItemDto
SupplierFilterDto
```

---

### 22.3. Supplier contacts

```text id="rl6nyn"
CreateSupplierContactDto
UpdateSupplierContactDto
ArchiveSupplierContactDto
SupplierContactDto
SupplierContactListItemDto
```

---

### 22.4. Supplier bank accounts

```text id="piy2jc"
CreateSupplierBankAccountDto
UpdateSupplierBankAccountDto
VerifySupplierBankAccountDto
DisableSupplierBankAccountDto
ArchiveSupplierBankAccountDto
SupplierBankAccountDto
SupplierBankAccountListItemDto
```

---

### 22.5. Supplier documents

```text id="g64ukq"
LinkSupplierDocumentDto
ArchiveSupplierDocumentDto
SupplierDocumentDto
SupplierDocumentListItemDto
```

---

### 22.6. Supplier payables

```text id="tkbyye"
CreateSupplierPayableDto
UpdateDraftSupplierPayableDto
SubmitSupplierPayableReviewDto
ApproveSupplierPayableDto
RejectSupplierPayableDto
CancelSupplierPayableDto
VoidSupplierPayableDto
ArchiveSupplierPayableDto
SupplierPayableDto
SupplierPayableListItemDto
SupplierPayableFilterDto
```

---

### 22.7. Supplier payment orders

```text id="lylkgq"
CreateSupplierPaymentOrderDto
UpdateDraftSupplierPaymentOrderDto
CreateSupplierPaymentOrderItemDto
SubmitSupplierPaymentOrderApprovalDto
ApproveSupplierPaymentOrderDto
RejectSupplierPaymentOrderDto
ScheduleSupplierPaymentOrderDto
MarkSupplierPaymentOrderPaidDto
VoidSupplierPaymentOrderDto
CancelSupplierPaymentOrderDto
ReverseSupplierPaymentOrderDto
ArchiveSupplierPaymentOrderDto
SupplierPaymentOrderDto
SupplierPaymentOrderItemDto
SupplierPaymentOrderListItemDto
SupplierPaymentOrderFilterDto
```

---

### 22.8. Supplier payment evidence

```text id="u5z1ql"
CreateSupplierPaymentEvidenceDto
VerifySupplierPaymentEvidenceDto
RejectSupplierPaymentEvidenceDto
ArchiveSupplierPaymentEvidenceDto
SupplierPaymentEvidenceDto
SupplierPaymentEvidenceListItemDto
```

---

### 22.9. Reconciliation links

```text id="hskjje"
CreateSupplierBankReconciliationLinkDto
UnlinkSupplierBankReconciliationLinkDto
SupplierBankReconciliationLinkDto
```

---

### 22.10. Reports

```text id="m6dft5"
PayablesAgingReportDto
PaymentsBySupplierReportDto
ExpensesByCategoryReportDto
CashOutflowReportDto
SupplierPaymentReportExportDto
```

---

## 23. Campos prohibidos en requests externos

Los DTOs deben rechazar:

```text id="nb6lhs"
tenantId
createdBy
updatedBy
approvedBy
rejectedBy
paidBy
verifiedBy
archivedBy
status directo salvo endpoint de transición
totalAmount como fuente de verdad si puede calcularse
outstandingAmount
paidAmount como fuente de verdad
duplicateFingerprint
accountNumberHash
identificationNumberHash
fullBankAccountNumber
raw bank payload
raw provider payload
storageKey
signedUrl
accountingJournalEntryId directo
bankTransactionId directo sin endpoint controlado
reconciliationMatchId directo sin endpoint controlado
external AI flags
```

---

## 24. Permisos

### 24.1. Suppliers

```text id="bw3b4k"
suppliers.create
suppliers.read
suppliers.update
suppliers.activate
suppliers.disable
suppliers.block
suppliers.archive
```

---

### 24.2. Supplier categories

```text id="el9qds"
supplierCategories.create
supplierCategories.read
supplierCategories.update
supplierCategories.archive
```

---

### 24.3. Supplier contacts

```text id="o3fqml"
supplierContacts.create
supplierContacts.read
supplierContacts.update
supplierContacts.archive
```

---

### 24.4. Supplier bank accounts

```text id="nni59k"
supplierBankAccounts.create
supplierBankAccounts.read
supplierBankAccounts.update
supplierBankAccounts.verify
supplierBankAccounts.disable
supplierBankAccounts.archive
```

---

### 24.5. Supplier documents

```text id="zfm1la"
supplierDocuments.create
supplierDocuments.read
supplierDocuments.archive
supplierDocuments.download
```

---

### 24.6. Supplier payables

```text id="p4nxbf"
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

### 24.7. Supplier payment orders

```text id="mx97dw"
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

### 24.8. Payment evidence

```text id="qdr5ny"
supplierPaymentEvidence.create
supplierPaymentEvidence.read
supplierPaymentEvidence.verify
supplierPaymentEvidence.reject
supplierPaymentEvidence.archive
supplierPaymentEvidence.download
```

---

### 24.9. Reconciliation links

```text id="flg90i"
supplierPaymentReconciliationLinks.create
supplierPaymentReconciliationLinks.read
supplierPaymentReconciliationLinks.unlink
```

---

### 24.10. Reports

```text id="wkfhmq"
supplierPaymentReports.read
supplierPaymentReports.export
supplierPaymentReports.payablesAging
supplierPaymentReports.paymentsBySupplier
supplierPaymentReports.expensesByCategory
supplierPaymentReports.cashOutflow
```

---

### 24.11. Audit

```text id="fk9wt8"
supplierPayments.audit.read
```

---

## 25. Guards y policies

### 25.1. Guards

```text id="y39hcm"
SupplierPaymentPermissionGuard
SupplierTenantGuard
SupplierCategoryTenantGuard
SupplierContactTenantGuard
SupplierBankAccountTenantGuard
SupplierDocumentTenantGuard
SupplierPayableTenantGuard
SupplierPaymentOrderTenantGuard
SupplierPaymentEvidenceTenantGuard
SupplierReconciliationLinkTenantGuard
SupplierReportGuard
```

---

### 25.2. Policies

```text id="kxzoif"
SupplierTenantPolicy
SupplierStatusPolicy
SupplierBlockedPolicy
SupplierCategoryPolicy
SupplierContactPolicy
SupplierBankAccountPrivacyPolicy
SupplierBankAccountVerificationPolicy
SupplierDocumentPolicy
SupplierPayableDuplicatePolicy
SupplierPayableAmountPolicy
SupplierPayableApprovalPolicy
SupplierPaymentOrderApprovalPolicy
SupplierPaymentOrderItemPolicy
SupplierPaymentAmountPolicy
SupplierPaymentEvidencePolicy
SupplierPaymentImmutabilityPolicy
SupplierPaymentReversalPolicy
SupplierAccountingIntegrationPolicy
SupplierBankReconciliationBoundaryPolicy
NoBankTransferInitiationPolicy
NoOpenBankingPaymentInitiationPolicy
NoPublicSupplierPaymentEndpointPolicy
NoMeSupplierPaymentEndpointPolicy
NoWordPressSupplierPaymentAccessPolicy
NoExternalAiSupplierPaymentDataPolicy
AuditSanitizationPolicy
LogSanitizationPolicy
```

---

## 26. Seguridad técnica

Reglas obligatorias:

```text id="m9es24"
- no aceptar tenantId desde body;
- no consultar entidades tenant-scoped solo por id;
- no permitir proveedor cross-tenant;
- no permitir payable cross-tenant;
- no permitir payment order cross-tenant;
- no permitir evidence cross-tenant;
- no permitir bank account cross-tenant;
- no exponer número completo de cuenta bancaria;
- no exponer storageKey;
- no permitir pago a proveedor blocked;
- no permitir pago sin aprobación;
- no permitir payment order sin items;
- no permitir pagar más del outstandingAmount;
- no permitir outstandingAmount negativo;
- no iniciar transferencia bancaria;
- no iniciar pago Open Banking;
- no editar pago paid destructivamente;
- no editar JournalEntry posted;
- no confirmar conciliación bancaria final;
- no crear endpoint público;
- no crear endpoint /me;
- no permitir acceso desde WordPress;
- no enviar datos reales a IA externa.
```

---

## 27. Auditoría

### 27.1. Eventos obligatorios

```text id="gkbprk"
supplier.created
supplier.updated
supplier.activated
supplier.disabled
supplier.blocked
supplier.archived

supplierCategory.created
supplierCategory.updated
supplierCategory.archived

supplierContact.created
supplierContact.updated
supplierContact.archived

supplierBankAccount.created
supplierBankAccount.updated
supplierBankAccount.verified
supplierBankAccount.disabled
supplierBankAccount.archived

supplierDocument.linked
supplierDocument.archived
supplierDocument.downloaded

supplierPayable.created
supplierPayable.updatedDraft
supplierPayable.submittedForReview
supplierPayable.approved
supplierPayable.rejected
supplierPayable.cancelled
supplierPayable.voided
supplierPayable.archived
supplierPayable.duplicateDetected

supplierPaymentOrder.created
supplierPaymentOrder.updatedDraft
supplierPaymentOrder.submittedForApproval
supplierPaymentOrder.approved
supplierPaymentOrder.rejected
supplierPaymentOrder.scheduled
supplierPaymentOrder.paid
supplierPaymentOrder.partiallyPaid
supplierPaymentOrder.voided
supplierPaymentOrder.cancelled
supplierPaymentOrder.reversed
supplierPaymentOrder.archived

supplierPaymentEvidence.created
supplierPaymentEvidence.verified
supplierPaymentEvidence.rejected
supplierPaymentEvidence.archived
supplierPaymentEvidence.downloaded

supplierAccountingLink.created
supplierAccountingLink.failed
supplierAccountingLink.reversed

supplierBankReconciliationLink.created
supplierBankReconciliationLink.unlinked

supplierPaymentReport.generated
supplierPaymentReport.exported
```

---

### 27.2. Metadata permitida

```text id="deqluf"
supplierId
supplierCode
supplierCategoryId
supplierPayableId
payableNumber
externalDocumentNumberMasked
supplierPaymentOrderId
paymentOrderNumber
supplierPaymentEvidenceId
supplierBankAccountId
paymentMethod
amount
currency
status
approvalStatus
journalEntryId
bankTransactionId
reconciliationMatchId
secureDocumentId
outcome
traceId
```

---

### 27.3. Metadata prohibida

```text id="wbbcc5"
tokens
secrets
passwords
full bank account number
raw bank payload
raw provider payload
storageKey
signedUrl
SQL raw
stack trace
datos personales innecesarios
datos cross-tenant
facturas completas como payload
comprobantes completos como payload
```

---

## 28. Observabilidad

### 28.1. Logs sugeridos

```text id="rzrh6p"
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

### 28.2. Métricas sugeridas

```text id="i723lj"
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

### 28.3. Labels permitidos

```text id="z9y4k5"
supplierType
payableStatus
paymentOrderStatus
paymentMethod
documentType
currency
outcome
```

---

### 28.4. Labels prohibidos

```text id="w2vtyo"
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

## 29. OpenAPI

### 29.1. Tags sugeridos

```text id="pfugjr"
Supplier Categories
Suppliers
Supplier Contacts
Supplier Bank Accounts
Supplier Documents
Supplier Payables
Supplier Payable Approvals
Supplier Payment Orders
Supplier Payment Evidence
Supplier Payment Reconciliation Links
Supplier Payment Reports
```

---

### 29.2. Extensiones requeridas

Para endpoints tenant:

```yaml id="spjzm2"
x-tenant-scope: true
x-auth-required: true
x-supplier-payments: true
x-public-exposure: false
```

Para payables:

```yaml id="b6v1pr"
x-payable-controlled: true
x-approval-required: true
x-duplicate-detection: true
x-decimal-money: true
```

Para payment orders:

```yaml id="o79qas"
x-payment-order: true
x-bank-transfer-initiation: false
x-evidence-required-for-paid: true
x-accounting-linked: true
x-reconciliation-ready: true
```

Para documents:

```yaml id="m87tlo"
x-secure-document-storage: true
x-storage-key-exposed: false
```

Para restricciones:

```yaml id="a4jlr6"
x-public-endpoint: false
x-wordpress-access: false
x-open-banking-payment-initiation: false
x-external-ai-real-data: false
```

---

## 30. Implementación por fases

### 30.1. Orden recomendado

```text id="zml8lk"
1. Crear estructura base del módulo.
2. Implementar enums y constantes.
3. Implementar feature flags y config service.
4. Implementar value objects.
5. Implementar entidades y state machines.
6. Implementar domain errors y policies.
7. Crear Prisma schema y migración.
8. Implementar repositorios tenant-scoped.
9. Implementar SupplierCategoryService.
10. Implementar SupplierService.
11. Implementar SupplierContactService.
12. Implementar SupplierBankAccountService.
13. Implementar SupplierDocumentService.
14. Implementar SupplierPayableService.
15. Implementar SupplierPayableApprovalService.
16. Implementar SupplierPaymentOrderService.
17. Implementar SupplierPaymentEvidenceService.
18. Implementar duplicate detection.
19. Implementar payment amount calculation.
20. Implementar partial payments.
21. Implementar reversal/correction básico.
22. Implementar SDS integration.
23. Implementar Accounting Ledger integration.
24. Implementar Bank Reconciliation link.
25. Implementar reports.
26. Implementar exports.
27. Implementar controllers REST.
28. Implementar guards y permisos.
29. Implementar audit.
30. Implementar observability.
31. Implementar OpenAPI.
32. Implementar tests.
33. Ejecutar hardening final.
```

---

### 30.2. PRs sugeridos

```text id="qtbzg4"
PR-021-01 — Module skeleton, enums, constants and configuration.
PR-021-02 — Value objects, entities and state machines.
PR-021-03 — Domain policies and error catalog.
PR-021-04 — Prisma schema, migration, constraints and indexes.
PR-021-05 — Repository ports and Prisma repositories.
PR-021-06 — Supplier categories and suppliers.
PR-021-07 — Supplier contacts and bank account references.
PR-021-08 — Supplier documents via Secure Document Storage.
PR-021-09 — Supplier payables and duplicate detection.
PR-021-10 — Supplier payable approvals.
PR-021-11 — Supplier payment orders and items.
PR-021-12 — Mark-paid flow, evidence and partial payments.
PR-021-13 — Reversal/correction flow.
PR-021-14 — Accounting Ledger integration.
PR-021-15 — Bank Reconciliation link integration.
PR-021-16 — Reports and exports.
PR-021-17 — REST controllers, guards and permissions.
PR-021-18 — Audit, observability and OpenAPI.
PR-021-19 — Tests, security hardening, performance and CI gates.
```

---

## 31. Testing plan resumido

### 31.1. Unit tests

```text id="dzhdhh"
Supplier entity
SupplierCategory entity
SupplierContact entity
SupplierBankAccount entity
SupplierDocument entity
SupplierPayable entity
SupplierPayableApproval entity
SupplierPaymentOrder entity
SupplierPaymentOrderItem entity
SupplierPaymentEvidence entity
SupplierAccountingLink entity
SupplierBankReconciliationLink entity
SupplierPayableDuplicatePolicy
SupplierPaymentAmountPolicy
SupplierPaymentEvidencePolicy
NoBankTransferInitiationPolicy
NoOpenBankingPaymentInitiationPolicy
```

---

### 31.2. Repository tests

```text id="x6r62b"
tenant A no ve suppliers tenant B
tenant A no ve supplier categories tenant B
tenant A no ve supplier contacts tenant B
tenant A no ve supplier bank accounts tenant B
tenant A no ve supplier documents tenant B
tenant A no ve payables tenant B
tenant A no ve payment orders tenant B
tenant A no ve evidence tenant B
tenant A no ve reconciliation links tenant B
supplierCode unique por tenant
payable duplicate fingerprint unique/warning según política
paymentOrderNumber unique por tenant
```

---

### 31.3. Integration tests

```text id="jv3zcw"
supplier creation flow
supplier activation flow
supplier bank account protection
supplier payable creation
duplicate payable detection
payable approval flow
payment order creation
payment order approval
mark paid with evidence
partial payment
payment reversal
SDS document attachment
Accounting Ledger integration
Bank Reconciliation link
report generation
export via SDS
audit integration
```

---

### 31.4. API tests

```text id="wuxrfd"
supplier categories CRUD/state transitions
suppliers CRUD/state transitions
supplier contacts CRUD/archive
supplier bank accounts CRUD/verify/disable/archive
supplier documents link/archive
supplier payables CRUD/approve/reject/cancel/void/archive
supplier payment orders CRUD/approve/schedule/mark-paid/reverse/archive
supplier payment evidence create/verify/reject/archive
reconciliation links create/unlink
reports
exports
public endpoints forbidden
/me endpoints forbidden
```

---

### 31.5. Security tests

```text id="j7qx90"
no tenantId body
no cross-tenant suppliers
no cross-tenant payables
no cross-tenant payment orders
no cross-tenant evidence
no cross-tenant bank accounts
no full bank account exposure
no storageKey exposure
no payment above outstanding amount
no payment to blocked supplier
no paid order without approval
no paid order without evidence/reference
no bank transfer initiation
no Open Banking payment initiation
no Accounting Ledger posted mutation
no Bank Reconciliation final confirmation
no public endpoints
no /me endpoints
no WordPress access
external AI disabled
```

---

## 32. Performance objetivo

### 32.1. Objetivos MVP

```text id="nkd27r"
p95 < 800 ms para listar proveedores paginados.
p95 < 1000 ms para listar obligaciones paginadas.
p95 < 1200 ms para listar órdenes de pago paginadas.
p95 < 1500 ms para generar reporte de cuentas por pagar típico.
p95 < 2000 ms para reporte de egresos mensual típico.
```

---

### 32.2. Reglas técnicas

```text id="v3rvbj"
- paginación obligatoria;
- pageSize máximo 100;
- índices por tenant_id;
- índices por supplier_id;
- índices por status;
- índices por due_date;
- índices por planned_payment_date;
- índices por actual_payment_date;
- índices por payment_method;
- no N+1 evidente;
- reports pesados preparados para jobs futuros;
- exports controlados por permiso.
```

---

## 33. Feature flags

```text id="kg8sml"
supplierPayments.enabled
supplierPayments.supplierRegistry.enabled
supplierPayments.bankAccounts.enabled
supplierPayments.documents.enabled
supplierPayments.payables.enabled
supplierPayments.approvals.enabled
supplierPayments.paymentOrders.enabled
supplierPayments.partialPayments.enabled
supplierPayments.paymentEvidence.enabled
supplierPayments.accountingIntegration.enabled
supplierPayments.bankReconciliationLink.enabled
supplierPayments.reports.enabled
supplierPayments.exports.enabled
supplierPayments.bankTransferInitiation.enabled
supplierPayments.openBankingPaymentInitiation.enabled
supplierPayments.electronicInvoicing.enabled
supplierPayments.externalAi.enabled
```

Defaults MVP:

```text id="e4gd9a"
supplierPayments.enabled = true
supplierPayments.supplierRegistry.enabled = true
supplierPayments.bankAccounts.enabled = true
supplierPayments.documents.enabled = true
supplierPayments.payables.enabled = true
supplierPayments.approvals.enabled = true
supplierPayments.paymentOrders.enabled = true
supplierPayments.partialPayments.enabled = true
supplierPayments.paymentEvidence.enabled = true
supplierPayments.accountingIntegration.enabled = true
supplierPayments.bankReconciliationLink.enabled = true
supplierPayments.reports.enabled = true
supplierPayments.exports.enabled = true
supplierPayments.bankTransferInitiation.enabled = false
supplierPayments.openBankingPaymentInitiation.enabled = false
supplierPayments.electronicInvoicing.enabled = false
supplierPayments.externalAi.enabled = false
```

---

## 34. Variables de configuración sugeridas

```text id="s1g0yt"
SUPPLIER_PAYMENTS_ENABLED=true
SUPPLIER_PAYMENTS_DEFAULT_CURRENCY=USD
SUPPLIER_PAYMENTS_REQUIRE_PAYABLE_APPROVAL=true
SUPPLIER_PAYMENTS_REQUIRE_PAYMENT_ORDER_APPROVAL=true
SUPPLIER_PAYMENTS_REQUIRE_EVIDENCE_FOR_PAID=true
SUPPLIER_PAYMENTS_ALLOW_PARTIAL_PAYMENTS=true
SUPPLIER_PAYMENTS_ALLOW_CASH_PAYMENTS=true
SUPPLIER_PAYMENTS_ALLOW_CHECK_PAYMENTS=true
SUPPLIER_PAYMENTS_ALLOW_BANK_TRANSFER_MANUAL=true
SUPPLIER_PAYMENTS_MAX_REPORT_PAGE_SIZE=100
SUPPLIER_PAYMENTS_DUPLICATE_DETECTION_ENABLED=true
SUPPLIER_PAYMENTS_ACCOUNTING_INTEGRATION_ENABLED=true
SUPPLIER_PAYMENTS_BANK_RECONCILIATION_LINK_ENABLED=true
SUPPLIER_PAYMENTS_REPORT_EXPORT_ENABLED=true
SUPPLIER_PAYMENTS_BANK_TRANSFER_INITIATION_ENABLED=false
SUPPLIER_PAYMENTS_OPEN_BANKING_PAYMENT_INITIATION_ENABLED=false
SUPPLIER_PAYMENTS_ELECTRONIC_INVOICING_ENABLED=false
SUPPLIER_PAYMENTS_EXTERNAL_AI_ENABLED=false
```

---

## 35. Errores esperados

Catálogo inicial:

```text id="kzjfsq"
SUPPLIER_NOT_FOUND
SUPPLIER_INVALID_STATUS
SUPPLIER_CODE_DUPLICATE
SUPPLIER_BLOCKED
SUPPLIER_INACTIVE
SUPPLIER_ARCHIVED
SUPPLIER_CROSS_TENANT_REFERENCE

SUPPLIER_CATEGORY_NOT_FOUND
SUPPLIER_CATEGORY_INVALID_STATUS
SUPPLIER_CATEGORY_CODE_DUPLICATE
SUPPLIER_CATEGORY_CROSS_TENANT_REFERENCE

SUPPLIER_CONTACT_NOT_FOUND
SUPPLIER_CONTACT_INVALID_STATUS
SUPPLIER_CONTACT_CROSS_TENANT_REFERENCE

SUPPLIER_BANK_ACCOUNT_NOT_FOUND
SUPPLIER_BANK_ACCOUNT_INVALID_STATUS
SUPPLIER_BANK_ACCOUNT_UNVERIFIED
SUPPLIER_BANK_ACCOUNT_FULL_NUMBER_FORBIDDEN
SUPPLIER_BANK_ACCOUNT_CROSS_TENANT_REFERENCE

SUPPLIER_DOCUMENT_NOT_FOUND
SUPPLIER_DOCUMENT_STORAGE_KEY_FORBIDDEN
SUPPLIER_DOCUMENT_CROSS_TENANT_REFERENCE

SUPPLIER_PAYABLE_NOT_FOUND
SUPPLIER_PAYABLE_INVALID_STATUS
SUPPLIER_PAYABLE_DUPLICATE_DETECTED
SUPPLIER_PAYABLE_AMOUNT_INVALID
SUPPLIER_PAYABLE_OUTSTANDING_INVALID
SUPPLIER_PAYABLE_APPROVAL_REQUIRED
SUPPLIER_PAYABLE_CROSS_TENANT_REFERENCE

SUPPLIER_PAYABLE_APPROVAL_NOT_FOUND
SUPPLIER_PAYABLE_APPROVAL_INVALID_STATUS

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

SUPPLIER_PAYMENT_ORDER_ITEM_INVALID
SUPPLIER_PAYMENT_ORDER_ITEM_AMOUNT_INVALID
SUPPLIER_PAYMENT_ORDER_ITEM_PAYABLE_NOT_APPROVED
SUPPLIER_PAYMENT_ORDER_ITEM_OVERPAYMENT
SUPPLIER_PAYMENT_ORDER_ITEM_CROSS_TENANT_REFERENCE

SUPPLIER_PAYMENT_EVIDENCE_NOT_FOUND
SUPPLIER_PAYMENT_EVIDENCE_INVALID_STATUS
SUPPLIER_PAYMENT_EVIDENCE_REJECTED
SUPPLIER_PAYMENT_EVIDENCE_CROSS_TENANT_REFERENCE

SUPPLIER_ACCOUNTING_LINK_FAILED
SUPPLIER_ACCOUNTING_LINK_NOT_FOUND
SUPPLIER_ACCOUNTING_POSTING_FORBIDDEN

SUPPLIER_BANK_RECONCILIATION_LINK_NOT_FOUND
SUPPLIER_BANK_RECONCILIATION_LINK_INVALID
SUPPLIER_BANK_RECONCILIATION_CONFIRMATION_FORBIDDEN

SUPPLIER_PAYMENT_REPORT_FORBIDDEN
SUPPLIER_PAYMENT_REPORT_EXPORT_FAILED

SUPPLIER_PAYMENT_PUBLIC_ENDPOINT_FORBIDDEN
SUPPLIER_PAYMENT_ME_ENDPOINT_FORBIDDEN
SUPPLIER_PAYMENT_WORDPRESS_ACCESS_FORBIDDEN
SUPPLIER_PAYMENT_BANK_TRANSFER_INITIATION_FORBIDDEN
SUPPLIER_PAYMENT_OPEN_BANKING_PAYMENT_INITIATION_FORBIDDEN
SUPPLIER_PAYMENT_ELECTRONIC_INVOICING_FORBIDDEN
SUPPLIER_PAYMENT_EXTERNAL_AI_FORBIDDEN

VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
CONFLICT
RATE_LIMITED
INTERNAL_ERROR
```

---

## 36. Seeds y datos demo

Crear seeds ficticios para:

```text id="uhej2f"
supplierCategorySecurityA
supplierCategoryCleaningA
supplierCategoryMaintenanceA
supplierCategoryUtilitiesA
supplierCategoryProfessionalA
supplierCategoryTenantB

supplierDraftA
supplierActiveA
supplierInactiveA
supplierBlockedA
supplierArchivedA
supplierActiveB

supplierContactPrimaryA
supplierContactSecondaryA
supplierContactTenantB

supplierBankAccountDraftA
supplierBankAccountVerifiedA
supplierBankAccountActiveA
supplierBankAccountInactiveA
supplierBankAccountRejectedA
supplierBankAccountTenantB

supplierDocumentContractA
supplierDocumentTaxA
supplierDocumentInvoiceA
supplierDocumentTenantB

supplierPayableDraftA
supplierPayablePendingReviewA
supplierPayableApprovedA
supplierPayableRejectedA
supplierPayableScheduledA
supplierPayablePartiallyPaidA
supplierPayablePaidA
supplierPayableOverdueA
supplierPayableDuplicateCandidateA
supplierPayableTenantB

supplierPaymentOrderDraftA
supplierPaymentOrderPendingApprovalA
supplierPaymentOrderApprovedA
supplierPaymentOrderScheduledA
supplierPaymentOrderPaidA
supplierPaymentOrderPartiallyPaidA
supplierPaymentOrderVoidedA
supplierPaymentOrderCancelledA
supplierPaymentOrderTenantB

supplierPaymentEvidenceUploadedA
supplierPaymentEvidenceVerifiedA
supplierPaymentEvidenceRejectedA
supplierPaymentEvidenceTenantB

supplierAccountingLinkActiveA
supplierAccountingLinkFailedA
supplierBankReconciliationLinkActiveA
supplierBankReconciliationLinkTenantB
```

Datos prohibidos en seeds:

```text id="l1aq3y"
datos reales de proveedores
nombres reales de empresas
cédulas/RUC reales
emails reales
teléfonos reales
números bancarios reales completos
tokens
secrets
storageKeys reales
signedUrls reales
payloads bancarios reales
payloads de proveedor reales
facturas reales
comprobantes reales
balances reales
datos productivos
```

---

## 37. Riesgos técnicos

| Riesgo                                     | Impacto | Mitigación                                    |
| ------------------------------------------ | ------: | --------------------------------------------- |
| Pago duplicado                             | Crítico | Duplicate policy + idempotencia + constraints |
| Overpayment                                | Crítico | SupplierPaymentAmountPolicy                   |
| Pago sin aprobación                        |    Alto | Approval workflow + guards                    |
| Pago a proveedor bloqueado                 |    Alto | SupplierStatusPolicy                          |
| Cross-tenant supplier/payable/order        | Crítico | TenantGuard + tenant-scoped repositories      |
| Exposición de cuenta bancaria              |    Alto | masked/hash + DTO sanitizado                  |
| Exposición de evidence storageKey          |    Alto | Secure Document Storage                       |
| Ledger inconsistente                       |    Alto | Accounting events + SupplierAccountingLink    |
| Fallo contable posterior al pago           |    Alto | accountingLink.failed + revisión              |
| Conciliación alterada indebidamente        | Crítico | boundary con Bank Reconciliation              |
| Transferencia bancaria accidental          | Crítico | NoBankTransferInitiationPolicy                |
| Open Banking payment initiation accidental | Crítico | feature flag false + policy                   |
| Reporte cross-tenant                       | Crítico | SupplierPaymentReportTenantPolicy             |
| IA con datos reales                        | Crítico | externalAi false + policy                     |
| Performance en reportes                    |   Medio | índices + paginación + jobs futuros           |

---

## 38. Criterios de aceptación técnica

La implementación debe cumplir:

```text id="zrttct"
- SupplierCategory funciona por tenant.
- Supplier funciona por tenant.
- SupplierContact funciona por tenant.
- SupplierBankAccount protege número completo.
- SupplierDocument usa Secure Document Storage.
- SupplierPayable funciona.
- Duplicate detection funciona.
- SupplierPayableApproval funciona.
- SupplierPaymentOrder funciona.
- SupplierPaymentOrderItems calculan total.
- Mark-paid funciona sin iniciar transferencia.
- Payment evidence funciona.
- Partial payments funcionan.
- Outstanding amount se calcula server-side.
- Reversal/correction funciona.
- Accounting Ledger integration funciona.
- SupplierAccountingLink funciona.
- Bank Reconciliation link funciona sin confirmar conciliación.
- Reports funcionan.
- Exports usan Secure Document Storage.
- Audit se emite.
- Logs son seguros.
- Métricas son seguras.
- OpenAPI no expone endpoints públicos.
- No existe /me supplier payments en MVP.
- WordPress no accede a supplier payments.
- No bank transfer initiation.
- No Open Banking payment initiation.
- No electronic invoicing/SRI.
- IA externa está deshabilitada con datos reales.
- CI pasa.
```

---

## 39. Definition of Done

El módulo se considera listo cuando:

```text id="jkumqc"
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
11. SupplierCategoryService funciona.
12. SupplierService funciona.
13. SupplierContactService funciona.
14. SupplierBankAccountService funciona.
15. SupplierDocumentService funciona.
16. SupplierPayableService funciona.
17. SupplierPayableApprovalService funciona.
18. SupplierPaymentOrderService funciona.
19. SupplierPaymentEvidenceService funciona.
20. SupplierDuplicateDetectionService funciona.
21. SupplierPaymentAmountService funciona.
22. SupplierAccountingIntegrationService funciona.
23. SupplierBankReconciliationLinkService funciona.
24. Reports funcionan.
25. Exports vía SDS funcionan.
26. Audit funciona.
27. Observability funciona.
28. Controllers funcionan.
29. OpenAPI está actualizado.
30. Tests unitarios pasan.
31. Tests de repositorio pasan.
32. Tests de integración pasan.
33. Tests API pasan.
34. Tests de autorización pasan.
35. Tests multitenant pasan.
36. Tests de seguridad pasan.
37. Tests de integridad financiera pasan.
38. Tests de reportes pasan.
39. Smoke tests pasan.
40. Build pasa.
41. CI pasa.
```

---

## 40. No aceptación

No se acepta implementación si:

```text id="qe088j"
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
- busca entidades tenant-scoped solo por id;
- expone número completo de cuenta bancaria;
- expone identificationNumber completo si no está permitido;
- expone storageKey;
- expone signedUrl persistente;
- permite pago a proveedor blocked;
- permite crear payable para proveedor inactive/archived;
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

## 41. Resultado esperado

Al finalizar la implementación de `021-supplier-payments`, RESIDENT Core tendrá una base segura para proveedores, cuentas por pagar y egresos administrativos.

Resultado esperado:

```text id="hysxzs"
SupplierCategory por tenant
Supplier por tenant
SupplierContact por tenant
SupplierBankAccount protegida
SupplierDocument vía SDS
SupplierPayable
SupplierPayableApproval
SupplierPaymentOrder
SupplierPaymentOrderItem
SupplierPaymentEvidence
SupplierAccountingLink
SupplierBankReconciliationLink
duplicate detection
approval workflow básico
manual mark-paid
partial payments
outstandingAmount server-side
reversal/correction básico
Accounting Ledger integration
Bank Reconciliation link
payables aging report
payments by supplier report
expenses by category report
cash outflow report
exports vía Secure Document Storage
audit trail
safe logs
safe metrics
safe OpenAPI
no bank transfer initiation
no Open Banking payment initiation
no electronic invoicing
no public endpoints
no /me endpoints
no WordPress access
no external AI with real supplier/payment data
```

El módulo quedará preparado para futuras specs de:

```text id="a8zv3p"
accounts-payable-advanced
purchase-orders
contract-management
tax-compliance
electronic-invoicing
cash-management
treasury-management
open-banking-payment-initiation
budgeting-and-forecasting
cost-centers
fixed-assets
vendor-portal
```

---

## 42. Expediente actualizado

```text id="bn8nqr"
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
│   │       └── plan.md
```
