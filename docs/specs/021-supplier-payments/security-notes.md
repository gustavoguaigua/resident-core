# Security Notes — Spec 021 Supplier Payments

## 1. Información del documento

| Campo           | Valor                                                                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                 |
| Spec ID         | 021                                                                                                                                                           |
| Módulo          | Supplier Payments                                                                                                                                             |
| Documento       | Security Notes                                                                                                                                                |
| Ruta            | `docs/specs/021-supplier-payments/security-notes.md`                                                                                                          |
| Versión         | 0.1                                                                                                                                                           |
| Estado          | Borrador inicial                                                                                                                                              |
| Fecha           | 2026-07-23                                                                                                                                                    |
| Documento base  | `docs/specs/021-supplier-payments/spec.md`                                                                                                                    |
| Plan técnico    | `docs/specs/021-supplier-payments/plan.md`                                                                                                                    |
| Modelo de datos | `docs/specs/021-supplier-payments/data-model.md`                                                                                                              |
| Contrato API    | `docs/specs/021-supplier-payments/api-contract.md`                                                                                                            |
| Plan de pruebas | `docs/specs/021-supplier-payments/test-plan.md`                                                                                                               |
| Backlog         | `docs/specs/021-supplier-payments/tasks.md`                                                                                                                   |
| Depende de      | `001-tenants`, `002-users-roles`, `007-audit`, `008-basic-reports`, `016-secure-document-storage`, `017-bank-reconciliation`, `020-accounting-ledger`         |
| Naturaleza      | Tenant-scoped / Supplier-aware / Payable-driven / Approval-controlled / Evidence-backed / Accounting-linked / Reconciliation-ready / Audit-heavy / Non-public |

---

## 2. Propósito

Este documento define las notas de seguridad del módulo `021-supplier-payments`.

El objetivo es establecer controles obligatorios para proteger proveedores, cuentas bancarias de proveedores, documentos, facturas, obligaciones por pagar, órdenes de pago, evidencias, reportes, vínculos contables y vínculos bancarios.

Regla central de seguridad:

```text id="f2xcw0"
Toda categoría, proveedor, contacto, cuenta bancaria, documento, obligación por pagar, aprobación, orden de pago, ítem, evidencia, vínculo contable, vínculo bancario, reporte, exportación y evento de auditoría de Supplier Payments debe proteger tenant isolation, datos sensibles del proveedor, referencias bancarias, integridad financiera, aprobación previa, evidencia mínima, trazabilidad contable, frontera con Bank Reconciliation, logs seguros, auditoría sanitizada, ausencia de transferencias bancarias automáticas, ausencia de Open Banking payment initiation, ausencia de facturación electrónica/SRI en MVP, ausencia de endpoints públicos, ausencia de endpoints /me, ausencia de acceso desde WordPress y ausencia de IA externa con datos reales.
```

---

## 3. Resumen ejecutivo de seguridad

`Supplier Payments` es un módulo financiero-administrativo crítico porque administra egresos del conjunto residencial.

Los riesgos principales son:

```text id="j6xwpi"
- registrar proveedores falsos;
- manipular cuentas bancarias de proveedores;
- crear obligaciones duplicadas;
- pagar una obligación más de una vez;
- pagar por encima del saldo pendiente;
- marcar pagos como realizados sin aprobación;
- marcar pagos como realizados sin evidencia;
- exponer números completos de cuenta bancaria;
- exponer identificaciones completas;
- exponer storageKey de documentos;
- alterar asientos contables posted;
- confirmar conciliaciones bancarias desde el módulo equivocado;
- crear endpoints públicos por error;
- permitir acceso desde WordPress;
- usar datos reales en herramientas de IA externa.
```

Principio dominante:

```text id="lrx00n"
Supplier Payments registra obligaciones y pagos administrativos; no mueve dinero, no inicia transferencias, no reemplaza Accounting Ledger y no confirma Bank Reconciliation.
```

Implicaciones:

```text id="y943pe"
proveedor registrado no equivale a proveedor validado;
cuenta bancaria registrada no equivale a cuenta bancaria segura para transferencia automática;
orden de pago aprobada no equivale a transferencia ejecutada;
mark-paid registra evidencia de pago manual, no inicia pago;
evidencia adjunta no equivale a conciliación bancaria final;
Supplier Payments puede emitir eventos contables, pero Accounting Ledger mantiene autoridad contable;
Supplier Payments puede vincular movimientos bancarios, pero Bank Reconciliation mantiene autoridad de conciliación.
```

---

## 4. Alcance de seguridad

Incluido:

```text id="sb06ua"
- autenticación;
- autorización por permisos;
- tenant isolation;
- protección de proveedores;
- protección de contactos;
- protección de identificaciones;
- protección de referencias bancarias;
- protección de documentos vía Secure Document Storage;
- validación de obligaciones por pagar;
- aprobación de obligaciones;
- aprobación de órdenes de pago;
- control de pagos parciales;
- prevención de overpayment;
- prevención de duplicados;
- evidencia mínima de pago;
- reversos y correcciones;
- integración segura con Accounting Ledger;
- frontera con Bank Reconciliation;
- reportes administrativos;
- exportaciones;
- auditoría;
- logs;
- métricas;
- OpenAPI;
- CI/CD security gates;
- prohibición de endpoints públicos;
- prohibición de endpoints /me;
- prohibición de WordPress access;
- prohibición de IA externa con datos reales.
```

Fuera de alcance MVP y explícitamente bloqueado:

```text id="rp6mql"
- transferencias bancarias automáticas;
- iniciación de pagos Open Banking;
- archivos bancarios de pago masivo;
- cash management avanzado;
- tesorería avanzada;
- workflow multi-nivel avanzado;
- órdenes de compra formales;
- recepción de bienes/servicios;
- retenciones tributarias;
- facturación electrónica;
- integración SRI;
- validación tributaria automática;
- anexos tributarios;
- inventarios;
- activos fijos;
- firma electrónica;
- pagos recurrentes automáticos;
- domiciliación bancaria;
- OCR de facturas reales;
- IA para validar facturas reales;
- portal público de proveedores.
```

---

## 5. Activos protegidos

### 5.1. Activos principales

```text id="i14kus"
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
supplier payment reports
supplier payment exports
audit events
```

---

### 5.2. Datos especialmente sensibles

```text id="eyjy7v"
identificationNumberMasked
identificationNumberHash
accountNumberMasked
accountNumberHash
beneficiaryIdentificationMasked
beneficiaryIdentificationHash
paymentReference
paymentReferenceHash
secureDocumentId
journalEntryId
bankTransactionId
reconciliationMatchId
externalDocumentNumber
duplicateFingerprint
report exports
```

---

### 5.3. Datos prohibidos

No deben persistirse ni exponerse:

```text id="z9mce3"
número completo de cuenta bancaria en texto plano
accountNumberHash en DTO estándar
identificationNumberHash en DTO estándar
beneficiaryIdentificationHash en DTO estándar
storageKey
signedUrl persistente
factura completa como payload JSON
comprobante completo como payload JSON
base64 de documentos
usuario bancario
contraseña bancaria
OTP
MFA secret
token bancario
raw bank payload
raw provider payload
raw SQL
stack trace productivo
datos cross-tenant
```

---

## 6. Clasificación de información

### 6.1. Prohibida

```text id="g5zqyd"
bank username
bank password
OTP
MFA secret
raw bank token
full bank account number
full unmasked identification number in responses
raw bank payload
raw provider payload
storageKey
persistent signedUrl
binary document payload in JSON
base64 document payload
SQL raw
production stack trace
real supplier/payment data sent to external AI
```

---

### 6.2. Altamente sensible

```text id="p284bu"
accountNumberHash
identificationNumberHash
beneficiaryIdentificationHash
paymentReferenceHash
duplicateFingerprint
secureDocumentId
secureDocumentFileId
journalEntryId
bankTransactionId
reconciliationMatchId
supplierBankAccountId
supplierPaymentEvidenceId
supplierAccountingLinkId
supplierBankReconciliationLinkId
```

---

### 6.3. Confidencial

```text id="m1it37"
supplierName
supplierCode
supplierType
identificationNumberMasked
email
phone
address
accountNumberMasked
beneficiaryName
beneficiaryIdentificationMasked
externalDocumentNumber
payableNumber
paymentOrderNumber
paymentReference
amount
currency
dueDate
actualPaymentDate
```

---

### 6.4. Administrativo estándar

```text id="mdvy34"
categoryCode
categoryName
supplier status
payable status
payment order status
payment method
document type
report type
createdAt
updatedAt
archivedAt
```

---

## 7. Fronteras de confianza

### 7.1. Cliente autenticado → RESIDENT Core API

Riesgos:

```text id="lfar1p"
- tenantId manipulado;
- actor fields manipulados;
- status directo manipulado;
- montos manipulados;
- pago sin aprobación;
- pago sin evidencia;
- proveedor cross-tenant;
- documento cross-tenant;
- cuenta bancaria cross-tenant;
- campos bancarios sensibles enviados indebidamente.
```

Controles:

```text id="kwunif"
- AuthGuard;
- TenantGuard;
- PermissionGuard;
- ValidationPipe whitelist;
- forbidNonWhitelisted;
- no tenantId body;
- no actor fields body;
- DTOs estrictos;
- validación tenant-scoped de referencias;
- Decimal money server-side;
- state machines;
- audit obligatorio.
```

---

### 7.2. Supplier Payments → Secure Document Storage

Riesgos:

```text id="kzg9lo"
- acceso a documento de otro tenant;
- exposición de storageKey;
- signedUrl persistente;
- descarga no auditada;
- documento sensible mal clasificado.
```

Controles:

```text id="fc54w7"
- validar secureDocumentId con tenantId;
- sourceModule=supplierPayments;
- visibility=administrative;
- sensitivity=restricted;
- no storageKey en responses;
- no signedUrl persistente;
- descarga delegada a SDS;
- audit de descarga.
```

---

### 7.3. Supplier Payments → Accounting Ledger

Riesgos:

```text id="z8j1jg"
- asiento duplicado;
- asiento cross-tenant;
- edición de JournalEntry posted;
- inconsistencia entre pago operativo y contabilidad;
- pérdida de trazabilidad si falla el asiento.
```

Controles:

```text id="l0g1f2"
- integración vía puerto/evento;
- no SQL directo a journal_entries;
- no edición de JournalEntry posted;
- idempotencia por source event;
- SupplierAccountingLink;
- estado failed si falla Accounting Ledger;
- retry controlado;
- audit.
```

---

### 7.4. Supplier Payments → Bank Reconciliation

Riesgos:

```text id="k6r5xx"
- vincular BankTransaction cross-tenant;
- crear ReconciliationMatch final desde módulo equivocado;
- marcar BankTransaction matched indebidamente;
- cerrar ReconciliationSession indebidamente;
- alterar evidencia bancaria.
```

Controles:

```text id="wyehnv"
- validar BankTransaction tenant-scoped;
- validar ReconciliationMatch tenant-scoped;
- SupplierBankReconciliationLink solo crea vínculo administrativo;
- no crear ReconciliationMatch final;
- no marcar BankTransaction matched;
- no cerrar ReconciliationSession;
- no confirmar conciliación final;
- audit link/unlink.
```

---

### 7.5. Supplier Payments → WordPress

Riesgo:

```text id="fm6z5p"
WordPress podría exponer información financiera-administrativa no pública si se habilitan rutas por error.
```

Control:

```text id="tb7e5q"
Supplier Payments no debe tener endpoints públicos ni endpoints consumibles desde WordPress en MVP.
```

---

### 7.6. Supplier Payments → IA externa

Riesgos:

```text id="wuemnn"
- exposición de facturas reales;
- exposición de comprobantes reales;
- exposición de proveedores reales;
- exposición de cuentas bancarias;
- exposición de reportes financieros.
```

Control:

```text id="l16tpx"
No se permite enviar datos reales de Supplier Payments a servicios de IA externa en MVP.
```

---

## 8. Threat model STRIDE

### 8.1. Spoofing

Riesgos:

```text id="l6rsdd"
- usuario no autorizado finge ser administrador financiero;
- actor intenta aprobar pago sin permiso;
- actor intenta marcar paid sin permiso;
- actor intenta usar tenant de otro conjunto;
- PlatformAdmin accede sin contexto tenant explícito.
```

Controles:

```text id="yc843x"
- Keycloak/OIDC;
- UserProfile activo;
- tenant membership activa;
- permisos granulares;
- TenantGuard;
- PermissionGuard;
- audit actor real;
- no actor fields desde body.
```

---

### 8.2. Tampering

Riesgos:

```text id="ozorqp"
- modificar monto de payable aprobado;
- modificar paid order destructivamente;
- manipular outstandingAmount;
- inyectar totalAmount;
- cambiar supplierId de una orden;
- cambiar bankTransactionId sin endpoint controlado;
- manipular JournalEntryId;
- manipular storageKey.
```

Controles:

```text id="o9cmku"
- state machines;
- DTO whitelist;
- no totalAmount como fuente de verdad;
- no outstandingAmount desde cliente;
- no paidAmount excepto mark-paid;
- paid order inmutable;
- correction vía reversal;
- validación tenant-scoped;
- constraints DB;
- transacciones;
- audit.
```

---

### 8.3. Repudiation

Riesgos:

```text id="gc97qu"
- usuario niega haber aprobado una obligación;
- usuario niega haber aprobado una orden;
- usuario niega haber marcado pago como realizado;
- usuario niega haber cambiado una cuenta bancaria;
- usuario niega haber vinculado conciliación.
```

Controles:

```text id="uat8hz"
- audit obligatorio;
- traceId;
- requestId;
- actor userProfileId;
- tenantId;
- timestamps;
- old/new sanitized;
- reason obligatoria en operaciones críticas;
- no borrado físico ordinario.
```

---

### 8.4. Information disclosure

Riesgos:

```text id="ridpjk"
- exponer cuenta bancaria completa;
- exponer hashes;
- exponer storageKey;
- exponer documentos;
- exponer reportes cross-tenant;
- exponer logs con datos sensibles;
- exponer audit metadata sensible.
```

Controles:

```text id="jhmjph"
- masked values;
- no hashes en DTO estándar;
- no storageKey;
- no signedUrl persistente;
- SDS;
- tenant-scoped queries;
- audit sanitizer;
- log sanitizer;
- report guard;
- no public endpoints;
- no /me endpoints.
```

---

### 8.5. Denial of service

Riesgos:

```text id="fa2s1k"
- reportes pesados;
- exports grandes;
- listados sin paginación;
- múltiples mark-paid concurrentes;
- aprobaciones repetidas;
- intentos masivos de crear duplicados.
```

Controles:

```text id="pnoz06"
- paginación obligatoria;
- pageSize max 100;
- rate limiting;
- índices por tenant/status/date;
- idempotency key;
- constraints únicas;
- locks/transacciones en operaciones críticas;
- report jobs futuros.
```

---

### 8.6. Elevation of privilege

Riesgos:

```text id="rjyfuk"
- usuario lector intenta aprobar pagos;
- residente intenta ver egresos;
- PlatformAdmin accede a tenant sin permiso;
- usuario modifica permisos mediante payload;
- endpoint público accidental.
```

Controles:

```text id="xbptnh"
- permisos granulares;
- no endpoints /me;
- no endpoints públicos;
- no roles desde body;
- autorización server-side;
- tests por rol;
- OpenAPI contract tests;
- CI gates.
```

---

## 9. Autenticación

Todos los endpoints requieren:

```text id="h7fmen"
Authorization: Bearer <access_token>
```

Reglas:

```text id="fkjwfr"
Keycloak autentica.
RESIDENT Core resuelve UserProfile.
RESIDENT Core valida tenant membership.
RESIDENT Core autoriza por permisos.
Supplier Payments valida reglas financieras y administrativas.
```

No se permite:

```text id="wxyefo"
- API key pública para Supplier Payments;
- endpoints sin autenticación;
- consumo desde WordPress público;
- acceso por slug público de tenant;
- acceso /me en MVP.
```

---

## 10. Autorización

### 10.1. Permisos obligatorios

```text id="h6nw64"
suppliers.create
suppliers.read
suppliers.update
suppliers.activate
suppliers.disable
suppliers.block
suppliers.archive

supplierCategories.create
supplierCategories.read
supplierCategories.update
supplierCategories.archive

supplierContacts.create
supplierContacts.read
supplierContacts.update
supplierContacts.archive

supplierBankAccounts.create
supplierBankAccounts.read
supplierBankAccounts.update
supplierBankAccounts.verify
supplierBankAccounts.disable
supplierBankAccounts.archive

supplierDocuments.create
supplierDocuments.read
supplierDocuments.archive
supplierDocuments.download

supplierPayables.create
supplierPayables.read
supplierPayables.updateDraft
supplierPayables.submitReview
supplierPayables.approve
supplierPayables.reject
supplierPayables.cancel
supplierPayables.void
supplierPayables.archive

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

supplierPaymentEvidence.create
supplierPaymentEvidence.read
supplierPaymentEvidence.verify
supplierPaymentEvidence.reject
supplierPaymentEvidence.archive
supplierPaymentEvidence.download

supplierPaymentReconciliationLinks.create
supplierPaymentReconciliationLinks.read
supplierPaymentReconciliationLinks.unlink

supplierPaymentReports.read
supplierPaymentReports.export
supplierPaymentReports.payablesAging
supplierPaymentReports.paymentsBySupplier
supplierPaymentReports.expensesByCategory
supplierPaymentReports.cashOutflow

supplierPayments.audit.read
```

---

### 10.2. PlatformAdmin

Regla:

```text id="l5wknb"
PlatformAdmin no obtiene acceso automático a proveedores, obligaciones, órdenes, evidencias, cuentas bancarias o reportes de un tenant.
```

Acceso excepcional requiere:

```text id="mqcyzc"
- tenant context explícito;
- permiso explícito;
- justificación;
- auditoría reforzada;
- DTO minimizado;
- trazabilidad de actor.
```

---

### 10.3. Residentes y propietarios

En MVP:

```text id="t94f3x"
Resident y PropertyOwner no tienen acceso a Supplier Payments.
```

No existen:

```text id="a2l6w0"
GET /api/v1/me/suppliers
GET /api/v1/me/supplier-payables
GET /api/v1/me/supplier-payment-orders
GET /api/v1/me/supplier-payment-reports
```

---

## 11. Tenant isolation

Todas las tablas operativas son tenant-scoped.

Regla obligatoria:

```text id="rmr9l8"
Toda operación debe usar currentTenant.id resuelto del contexto autenticado, nunca tenantId enviado por el cliente.
```

Patrón permitido:

```typescript id="yo4vnj"
await prisma.supplierPaymentOrder.findFirst({
  where: {
    id: paymentOrderId,
    tenantId: currentTenant.id,
    archivedAt: null
  }
});
```

Patrón prohibido:

```typescript id="nv9xcf"
await prisma.supplierPaymentOrder.findUnique({
  where: { id: paymentOrderId }
});
```

Referencias que deben validarse con tenant:

```text id="agyunf"
supplierId
categoryId
supplierContactId
supplierBankAccountId
supplierDocumentId
supplierPayableId
supplierPayableApprovalId
supplierPaymentOrderId
supplierPaymentOrderItemId
supplierPaymentEvidenceId
supplierAccountingLinkId
supplierBankReconciliationLinkId
secureDocumentId
bankAccountId
bankTransactionId
reconciliationMatchId
journalEntryId
expenseAccountId
accountsPayableAccountId
```

Respuesta recomendada para cross-tenant:

```text id="p0di2z"
404 Not Found
```

---

## 12. Seguridad de proveedores

### 12.1. Creación

Controles:

```text id="kxec2s"
- supplierName requerido;
- supplierCode único por tenant;
- identificationNumber usado solo para masked/hash;
- identificationNumber completo no se devuelve;
- categoryId tenant-scoped;
- cuentas contables tenant-scoped;
- status inicial controlado;
- audit supplier.created.
```

---

### 12.2. Estados

```text id="tpy8e5"
draft
active
inactive
blocked
archived
```

Reglas:

```text id="k33t9b"
active puede recibir obligaciones;
inactive no debe recibir nuevas obligaciones;
blocked no puede recibir órdenes aprobadas;
archived no permite operaciones nuevas;
archived conserva historial.
```

---

### 12.3. Bloqueo

Bloquear un proveedor requiere:

```text id="mhnpt6"
- permiso suppliers.block;
- reason obligatoria;
- audit reforzado;
- no eliminar payables históricos;
- no eliminar órdenes históricas;
- no ocultar evidencias históricas.
```

---

## 13. Seguridad de cuentas bancarias de proveedor

### 13.1. Principio

```text id="d3v2os"
SupplierBankAccount es una referencia administrativa protegida; no es una credencial bancaria ni una instrucción de transferencia automática.
```

---

### 13.2. Permitido

```text id="q9c2g7"
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

### 13.3. Prohibido

```text id="ed8siz"
full bank account number persisted
full bank account number returned
bank username
bank password
OTP
MFA secret
bank token
raw bank payload
payment initiation instruction
```

---

### 13.4. DTO seguro

`SupplierBankAccountDto` puede devolver:

```text id="o7a7s6"
id
supplierId
bankName
accountType
accountNumberMasked
beneficiaryName
beneficiaryIdentificationMasked
currency
status
verifiedAt
createdAt
updatedAt
```

No debe devolver:

```text id="sb6gna"
accountNumber
accountNumberHash
beneficiaryIdentification
beneficiaryIdentificationHash
bank credentials
tokens
```

---

## 14. Seguridad de documentos

Todo documento debe pasar por `016-secure-document-storage`.

Permitido en responses:

```text id="bwj8aq"
secureDocumentId
secureDocumentFileId
downloadAvailable
documentType
status
createdAt
```

Prohibido:

```text id="p6hj49"
storageKey
signedUrl persistente
base64
binary payload
raw file payload
```

Clasificación recomendada:

```text id="zj5fey"
sourceModule = supplierPayments
visibility = administrative
sensitivity = restricted
```

Descargas:

```text id="lqj5ea"
- deben ser autorizadas;
- deben ser tenant-scoped;
- deben ser auditadas;
- deben usar mecanismo temporal de SDS;
- no deben exponerse en WordPress.
```

---

## 15. Seguridad de obligaciones por pagar

### 15.1. Creación

Debe validar:

```text id="vnbvgt"
- supplierId tenant-scoped;
- supplier active;
- categoryId tenant-scoped;
- secureDocumentId tenant-scoped;
- expenseAccountId tenant-scoped;
- accountsPayableAccountId tenant-scoped;
- montos string decimal;
- moneda USD;
- totalAmount server-side;
- outstandingAmount server-side;
- duplicateFingerprint server-side.
```

---

### 15.2. Monto total

Regla:

```text id="c673fs"
totalAmount = subtotalAmount + taxAmount - discountAmount
```

Controles:

```text id="n7hjgh"
- subtotalAmount >= 0;
- taxAmount >= 0;
- discountAmount >= 0;
- totalAmount >= 0;
- totalAmount no depende del frontend;
- no float/double;
- no JavaScript number como fuente de verdad.
```

---

### 15.3. Saldo pendiente

Regla:

```text id="c0qep0"
outstandingAmount = totalAmount - sum(valid paid amounts)
```

Controles:

```text id="e8twm8"
- outstandingAmount no se recibe desde cliente;
- outstandingAmount nunca negativo;
- paid requiere outstandingAmount = 0;
- partiallyPaid requiere outstandingAmount > 0 y menor que totalAmount;
- reversal recalcula outstandingAmount;
- concurrency lock en mark-paid.
```

---

### 15.4. Duplicate detection

Fingerprint conceptual:

```text id="yvt28f"
sha256(tenantId + supplierId + externalDocumentNumberNormalized + issueDate + totalAmount)
```

Controles:

```text id="dgzvj0"
- fingerprint server-side;
- tenant incluido;
- supplier incluido;
- amount incluido;
- duplicado crítico bloquea o requiere override futuro;
- auditoría supplierPayable.duplicateDetected;
- no exponer duplicateFingerprint completo por defecto.
```

---

## 16. Seguridad de aprobaciones

### 16.1. Payable approval

Requiere:

```text id="mkwivj"
supplierPayables.approve
```

Debe validar:

```text id="cdbp9j"
- payable tenant-scoped;
- estado pendingReview;
- supplier active;
- duplicado crítico controlado;
- reason/comment según política;
- actor server-side;
- approvedAt server-side;
- audit supplierPayable.approved.
```

---

### 16.2. Payment order approval

Requiere:

```text id="mgz8wy"
supplierPaymentOrders.approve
```

Debe validar:

```text id="lfpz01"
- order tenant-scoped;
- estado pendingApproval;
- supplier active;
- supplier no blocked;
- al menos un item;
- items válidos;
- amount <= outstandingAmount;
- currency USD;
- audit supplierPaymentOrder.approved.
```

---

## 17. Seguridad de órdenes de pago

### 17.1. Principio

```text id="yrjeoo"
SupplierPaymentOrder representa una decisión administrativa interna; no ejecuta transferencia bancaria.
```

---

### 17.2. Creación segura

Debe validar:

```text id="dcbtuk"
- supplierId tenant-scoped;
- supplier active;
- supplierBankAccountId tenant-scoped si existe;
- bankAccountId tenant-scoped si existe;
- items obligatorios;
- payables tenant-scoped;
- payables del mismo supplier;
- payables approved/partiallyPaid;
- amount > 0;
- amount <= outstandingAmount;
- totalAmount server-side.
```

---

### 17.3. Mark-paid

Requiere:

```text id="r38wfl"
supplierPaymentOrders.markPaid
```

Debe validar:

```text id="gqsagj"
- order tenant-scoped;
- estado approved o scheduled;
- aprobación previa;
- paidAmount > 0;
- paidAmount <= totalAmount;
- paymentReference o secureDocumentId;
- secureDocumentId tenant-scoped;
- no overpayment;
- no concurrencia duplicada;
- no bank transfer initiation;
- no Open Banking payment initiation;
- no final bank reconciliation.
```

---

### 17.4. Evidencia mínima

Un pago marcado como `paid` debe tener al menos:

```text id="m5ezjc"
paymentReference
o secureDocumentId
```

Recomendado:

```text id="lgp5bq"
actualPaymentDate
paymentMethod
paidAmount
paymentReference
secureDocumentId
actor
audit event
```

---

## 18. Seguridad de pagos parciales

Permitido:

```text id="ti5shu"
- pago parcial sobre payable aprobado;
- múltiples pagos parciales;
- recalcular outstandingAmount;
- marcar payable partiallyPaid;
- completar payable cuando outstandingAmount = 0.
```

Prohibido:

```text id="ujgtgj"
- paidAmount negativo;
- amount = 0;
- overpayment;
- outstandingAmount negativo;
- pago parcial sin trazabilidad;
- pago parcial sin aprobación;
- pago parcial sin referencia/evidencia mínima;
- edición destructiva de pagos parciales.
```

Controles:

```text id="eaatge"
- transacciones DB;
- locks por payable/payment order;
- constraints;
- Decimal;
- idempotency key;
- audit.
```

---

## 19. Seguridad de reversos y correcciones

Principio:

```text id="o01z12"
Un pago registrado no se edita destructivamente; se corrige mediante reverso trazable.
```

Reversal requiere:

```text id="m37ue4"
supplierPaymentOrders.reverse
```

Debe validar:

```text id="aj373o"
- order tenant-scoped;
- estado paid o partiallyPaid;
- reason obligatoria;
- actor server-side;
- recalcular outstandingAmount;
- crear evento contable de reverso si aplica;
- desvincular conciliación si policy lo permite;
- no editar evidencia histórica;
- no borrar pago histórico;
- no editar JournalEntry posted;
- audit supplierPaymentOrder.reversed.
```

---

## 20. Seguridad de Accounting Ledger

### 20.1. Regla central

```text id="ucbr9c"
Supplier Payments emite eventos contables; Accounting Ledger registra y gobierna los asientos.
```

---

### 20.2. Permitido

```text id="p9s9p9"
supplierPayable.approved
supplierPaymentOrder.paid
supplierPaymentOrder.partiallyPaid
supplierPaymentOrder.reversed
supplierPayable.adjusted
```

---

### 20.3. Prohibido

```text id="l1jrwh"
- insertar JournalEntry por SQL directo;
- editar JournalEntry posted;
- borrar JournalEntry;
- modificar JournalEntryLine posted;
- forzar accountingJournalEntryId desde body;
- duplicar asiento por retry;
- usar Accounting Ledger sin tenant validation.
```

---

### 20.4. SupplierAccountingLink

Debe registrar:

```text id="dqj62d"
tenantId
supplierPayableId opcional
supplierPaymentOrderId opcional
journalEntryId opcional
accountingEventType
status
errorCode sanitizado
errorMessage sanitizado
createdAt
```

Si falla Accounting Ledger:

```text id="x860hn"
- no ocultar el pago operativo;
- crear SupplierAccountingLink failed;
- auditar;
- exponer requiresReview administrativo;
- permitir retry controlado.
```

---

## 21. Seguridad de Bank Reconciliation

### 21.1. Regla central

```text id="paq412"
Supplier Payments puede vincular pagos a evidencia bancaria, pero Bank Reconciliation conserva la autoridad de conciliación final.
```

---

### 21.2. Permitido

```text id="de3s07"
- crear SupplierBankReconciliationLink;
- vincular paymentOrder con BankTransaction;
- vincular paymentOrder con ReconciliationMatch existente;
- desvincular con reason;
- consultar candidatos bajo permiso;
- auditar link/unlink.
```

---

### 21.3. Prohibido

```text id="myn1tl"
- crear ReconciliationMatch final;
- marcar BankTransaction matched;
- cerrar ReconciliationSession;
- marcar Payment reconciled;
- alterar conciliación bancaria final;
- vincular bankTransaction cross-tenant;
- vincular reconciliationMatch cross-tenant.
```

---

## 22. Reportes y exportaciones

### 22.1. Reportes permitidos

```text id="sjdhkv"
payables aging
payments by supplier
expenses by category
cash outflow
```

---

### 22.2. Controles

```text id="j0w22r"
- permiso por reporte;
- tenant-scoped filters;
- pageSize max 100;
- Decimal totals;
- no storageKey;
- no datos tenant B;
- no side effects;
- audit supplierPaymentReport.generated;
- export vía Secure Document Storage;
- audit supplierPaymentReport.exported.
```

---

### 22.3. Exportaciones

Toda exportación debe:

```text id="zftzdy"
- crear SecureDocument;
- usar sourceModule=supplierPayments;
- usar visibility=administrative;
- usar sensitivity=restricted;
- retornar secureDocumentId;
- no retornar storageKey;
- no retornar signedUrl persistente;
- auditar.
```

---

## 23. Endpoints públicos prohibidos

No crear ni documentar:

```text id="xczxht"
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

Respuesta esperada:

```text id="hmvmm2"
404 Not Found
```

---

## 24. Endpoints `/me` prohibidos en MVP

No crear ni documentar:

```text id="ilq12j"
GET  /api/v1/me/suppliers
GET  /api/v1/me/supplier-payables
GET  /api/v1/me/supplier-payment-orders
GET  /api/v1/me/supplier-payment-reports
POST /api/v1/me/supplier-payables
POST /api/v1/me/supplier-payment-orders
```

Respuesta esperada:

```text id="vnywf4"
404 Not Found
```

---

## 25. WordPress access prohibido

Regla:

```text id="o9jq2p"
WordPress no accede a Supplier Payments en MVP.
```

Prohibido:

```text id="ozjb9v"
- widgets WordPress de proveedores;
- widgets WordPress de cuentas por pagar;
- widgets WordPress de pagos a proveedores;
- widgets WordPress de reportes de egresos;
- CORS público para supplier payments;
- enlaces públicos a evidencias;
- enlaces públicos a reportes;
- endpoints por tenant slug para supplier payments.
```

---

## 26. IA externa prohibida con datos reales

Prohibido enviar a IA externa:

```text id="s42b3z"
datos reales de proveedores
identificaciones reales
cuentas bancarias
facturas reales
comprobantes reales
órdenes de pago reales
reportes reales
exports reales
audit logs reales
```

Permitido:

```text id="q5ixw6"
- documentación técnica;
- código;
- tests;
- fixtures sintéticos;
- datos ficticios;
- diagramas sin datos reales.
```

Feature flag:

```text id="g4z5al"
SUPPLIER_PAYMENTS_EXTERNAL_AI_ENABLED=false
```

---

## 27. Auditoría obligatoria

### 27.1. Eventos mínimos

```text id="dcf2z7"
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

supplierPayableApproval.created
supplierPayableApproval.approved
supplierPayableApproval.rejected
supplierPayableApproval.cancelled

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

```text id="mqzdtj"
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

```text id="b78c0p"
tokens
secrets
passwords
full bank account number
accountNumberHash
identificationNumberHash
beneficiaryIdentificationHash
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

## 28. Logs seguros

### 28.1. Eventos loggeables

```text id="blo143"
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

### 28.2. Campos permitidos

```text id="jbul4t"
traceId
requestId
correlationId
action
outcome
supplierType
payableStatus
paymentOrderStatus
paymentMethod
documentType
currency
durationMs
errorCode
```

---

### 28.3. Campos prohibidos

```text id="qpy9jw"
tenantId como label
userId como label
supplierId como label
supplierPayableId como label
supplierPaymentOrderId como label
supplierBankAccountId como label
secureDocumentId como label
journalEntryId como label
bankTransactionId como label
traceId como métrica label
full bank account number
accountNumberHash
identificationNumberHash
beneficiaryIdentificationHash
storageKey
signedUrl
raw payload
SQL raw
stack trace productivo
```

---

### 28.4. Ejemplo de log seguro

```json id="rzkg4n"
{
  "level": "info",
  "action": "supplierPaymentOrder.paid",
  "outcome": "success",
  "paymentMethod": "bankTransferManual",
  "paymentOrderStatus": "paid",
  "currency": "USD",
  "durationMs": 143,
  "traceId": "trace-id"
}
```

---

## 29. Métricas seguras

Métricas permitidas:

```text id="xa7jdi"
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

Labels permitidos:

```text id="yh2pfw"
supplierType
payableStatus
paymentOrderStatus
paymentMethod
documentType
currency
outcome
```

Labels prohibidos:

```text id="ta2b3w"
tenantId
userId
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

## 30. Constraints de seguridad en base de datos

### 30.1. Montos

Debe existir protección contra:

```text id="ln91rm"
- subtotal negativo;
- tax negativo;
- discount negativo;
- total negativo;
- outstanding negativo;
- paidAmount negativo;
- paidAmount > totalAmount;
- item amount <= 0;
- item amount > outstandingAmount;
```

---

### 30.2. Estados

Debe existir protección contra:

```text id="d3ggrv"
- paid payable con outstandingAmount > 0;
- partiallyPaid sin saldo intermedio;
- rejected sin reason;
- cancelled sin reason;
- voided sin reason;
- evidence verified sin verifiedAt;
- evidence rejected sin reason;
- accountingLink failed sin errorCode;
- reconciliationLink sin bankTransactionId ni reconciliationMatchId.
```

---

### 30.3. Índices críticos

```text id="s0qg0y"
- supplierCode único por tenant;
- categoryCode único por tenant;
- identificationNumberHash único opcional por tenant;
- accountNumberHash único para active/verified por supplier;
- payableNumber único por tenant;
- duplicateFingerprint indexado;
- paymentOrderNumber único por tenant;
- paymentReferenceHash indexado;
- payable único por payment order;
- accounting link único por source event;
- reconciliation link único por order/bankTransaction activo;
- reconciliation link único por order/reconciliationMatch activo.
```

---

## 31. Transacciones obligatorias

Deben ejecutarse dentro de transacción DB:

```text id="h24fet"
- approve supplier payable;
- reject supplier payable;
- create supplier payment order with items;
- approve supplier payment order;
- mark-paid;
- partial payment;
- reversal;
- create accounting link;
- create reconciliation link;
- unlink reconciliation link;
- report export document creation.
```

Regla crítica:

```text id="l32w7m"
Si mark-paid no puede actualizar outstandingAmount de forma consistente, la orden no debe quedar en paid.
```

---

## 32. Concurrencia

Escenarios críticos:

```text id="ps91or"
- dos usuarios crean el mismo supplierCode;
- dos usuarios crean la misma obligación;
- dos usuarios crean órdenes sobre el mismo payable;
- dos usuarios hacen mark-paid sobre la misma orden;
- dos usuarios pagan parcialmente la misma obligación;
- approve y reject simultáneos;
- reverse simultáneo;
- link y unlink simultáneo de conciliación.
```

Controles:

```text id="uml5hu"
- índices únicos;
- transacciones;
- locks por payable/payment order;
- idempotency key;
- validación post-lock;
- audit de conflictos.
```

---

## 33. Rate limiting

Aplicar rate limit reforzado en:

```text id="b8wxky"
POST /api/v1/tenant/supplier-payables
POST /api/v1/tenant/supplier-payables/{payableId}/approve
POST /api/v1/tenant/supplier-payment-orders
POST /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/approve
POST /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/mark-paid
POST /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/reverse
GET  /api/v1/tenant/supplier-payment-reports/export
```

Criterios:

```text id="fln6w1"
- por usuario;
- por tenant;
- por IP;
- por endpoint crítico;
- con logging seguro;
- sin exponer existencia cross-tenant.
```

---

## 34. Headers, CORS y caché

Headers recomendados:

```http id="cs1ppb"
Cache-Control: no-store
Pragma: no-cache
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
```

CORS:

```text id="rdmb0o"
- no wildcard;
- no habilitar dominios WordPress públicos para Supplier Payments;
- permitir solo frontend administrativo autenticado;
- no permitir credenciales desde orígenes no autorizados.
```

---

## 35. Configuración segura

Variables recomendadas:

```text id="ucv0ma"
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

Debe fallar boot o CI si en MVP:

```text id="h56j2i"
SUPPLIER_PAYMENTS_BANK_TRANSFER_INITIATION_ENABLED=true
SUPPLIER_PAYMENTS_OPEN_BANKING_PAYMENT_INITIATION_ENABLED=true
SUPPLIER_PAYMENTS_ELECTRONIC_INVOICING_ENABLED=true
SUPPLIER_PAYMENTS_EXTERNAL_AI_ENABLED=true
```

---

## 36. Abuse cases

| Caso de abuso                        | Control esperado      |
| ------------------------------------ | --------------------- |
| Crear proveedor en tenant ajeno      | 404                   |
| Crear payable con supplier tenant B  | 404                   |
| Crear order con payable tenant B     | 404                   |
| Adjuntar document tenant B           | 404                   |
| Pagar más que outstanding            | 409                   |
| Pagar supplier blocked               | 409                   |
| Mark-paid sin aprobación             | 409                   |
| Mark-paid sin evidencia/referencia   | 409/422               |
| Reutilizar número de cuenta completo | No persistir completo |
| Exponer accountNumberHash            | Falla crítica         |
| Exponer storageKey                   | Falla crítica         |
| Enviar tenantId en body              | 422                   |
| Enviar actor fields                  | 422                   |
| Iniciar transferencia bancaria       | 403/404               |
| Open Banking payment initiation      | 403/404               |
| Editar JournalEntry posted           | 403/409               |
| Crear ReconciliationMatch final      | 403/404               |
| Acceso público                       | 404                   |
| Acceso `/me`                         | 404                   |
| Acceso desde WordPress               | Bloqueado             |
| IA externa con datos reales          | Bloqueado             |

---

## 37. Security tests obligatorios

Debe probarse:

```text id="nqgn6m"
- no tenantId body;
- no actor fields body;
- no status directo;
- no supplier cross-tenant;
- no supplier bank account cross-tenant;
- no supplier document cross-tenant;
- no supplier payable cross-tenant;
- no supplier payment order cross-tenant;
- no supplier payment evidence cross-tenant;
- no accounting link cross-tenant;
- no reconciliation link cross-tenant;
- no report cross-tenant;
- no full bank account exposure;
- no accountNumberHash exposure;
- no identificationNumberHash exposure;
- no storageKey exposure;
- Decimal money;
- no float/double;
- no overpayment;
- no payment to blocked supplier;
- no paid without approval;
- no paid without evidence/reference;
- no rejected evidence as valid support;
- no bank transfer initiation;
- no Open Banking payment initiation;
- no JournalEntry posted mutation;
- no ReconciliationMatch final creation;
- no BankTransaction matched mutation;
- no public endpoints;
- no /me endpoints;
- no WordPress access;
- no external AI real data.
```

---

## 38. CI/CD security gates

El pipeline debe fallar si:

```text id="t0gh33"
- OpenAPI documenta endpoints públicos supplier payments;
- OpenAPI documenta endpoints /me supplier payments;
- DTOs aceptan tenantId;
- DTOs aceptan actor fields;
- DTOs aceptan status directo no permitido;
- DTOs exponen fullBankAccountNumber;
- DTOs exponen accountNumberHash;
- DTOs exponen identificationNumberHash;
- DTOs exponen storageKey;
- se detecta float/double para dinero;
- se permite supplier cross-tenant;
- se permite payable cross-tenant;
- se permite payment order cross-tenant;
- se permite payment evidence cross-tenant;
- se permite pago superior al outstandingAmount;
- se permite pago a supplier blocked;
- se permite paid sin aprobación;
- se permite paid sin evidencia/referencia;
- se inicia transferencia bancaria;
- se inicia Open Banking payment;
- Supplier Payments edita JournalEntry posted;
- Supplier Payments crea ReconciliationMatch final;
- Supplier Payments marca BankTransaction matched;
- logs contienen cuenta bancaria completa;
- logs contienen storageKey;
- audit contiene datos prohibidos;
- externalAi está habilitado por defecto.
```

---

## 39. Checklist de revisión de PR

```text id="h8k85d"
[ ] ¿Todas las consultas filtran tenantId?
[ ] ¿Se evita findUnique por id simple en entidades tenant-scoped?
[ ] ¿El DTO rechaza tenantId?
[ ] ¿El DTO rechaza actor fields?
[ ] ¿El DTO rechaza status directo no permitido?
[ ] ¿Los montos usan Decimal?
[ ] ¿Los montos se exponen como string decimal?
[ ] ¿totalAmount se calcula server-side?
[ ] ¿outstandingAmount se calcula server-side?
[ ] ¿Se impide overpayment?
[ ] ¿Se impide paid sin aprobación?
[ ] ¿Se impide paid sin evidencia/referencia?
[ ] ¿Se impide pago a supplier blocked?
[ ] ¿Se protege accountNumber completo?
[ ] ¿Se oculta accountNumberHash?
[ ] ¿Se oculta identificationNumberHash?
[ ] ¿Se oculta storageKey?
[ ] ¿Los documentos pasan por SDS?
[ ] ¿Accounting Ledger se invoca por puerto/evento?
[ ] ¿Se impide editar JournalEntry posted?
[ ] ¿Bank Reconciliation solo recibe vínculos?
[ ] ¿Se impide crear ReconciliationMatch final?
[ ] ¿Se impide marcar BankTransaction matched?
[ ] ¿No existen endpoints públicos?
[ ] ¿No existen endpoints /me?
[ ] ¿No hay acceso desde WordPress?
[ ] ¿No hay transferencia bancaria automática?
[ ] ¿No hay Open Banking payment initiation?
[ ] ¿No hay IA externa con datos reales?
[ ] ¿Audit está sanitizada?
[ ] ¿Logs están sanitizados?
[ ] ¿Tests de seguridad pasan?
```

---

## 40. Definition of Done de seguridad

El módulo cumple seguridad cuando:

```text id="kbosem"
- Tenant isolation probado.
- AuthGuard aplicado.
- TenantGuard aplicado.
- PermissionGuard aplicado.
- DTO whitelist aplicado.
- tenantId body rechazado.
- actor fields rechazados.
- full bank account number no persistido ni expuesto.
- hashes sensibles no expuestos en DTO estándar.
- storageKey no expuesto.
- Decimal money aplicado.
- overpayment bloqueado.
- paid sin aprobación bloqueado.
- paid sin evidencia/referencia bloqueado.
- supplier blocked no puede recibir pago aprobado.
- pagos registrados son inmutables destructivamente.
- reversos son trazables.
- Accounting Ledger no se modifica directamente.
- JournalEntry posted no se edita.
- Bank Reconciliation no se confirma desde Supplier Payments.
- endpoints públicos inexistentes.
- endpoints /me inexistentes.
- WordPress access bloqueado.
- bank transfer initiation bloqueado.
- Open Banking payment initiation bloqueado.
- electronic invoicing/SRI deshabilitado.
- external AI con datos reales bloqueada.
- audit completo y sanitizado.
- logs seguros.
- métricas seguras.
- OpenAPI seguro.
- CI gates activos.
```

---

## 41. No aceptación

No se acepta implementación si:

```text id="z9f2qj"
- permite supplier category cross-tenant;
- permite supplier cross-tenant;
- permite supplier contact cross-tenant;
- permite supplier bank account cross-tenant;
- permite supplier document cross-tenant;
- permite supplier payable cross-tenant;
- permite supplier payable approval cross-tenant;
- permite supplier payment order cross-tenant;
- permite supplier payment order item cross-tenant;
- permite supplier payment evidence cross-tenant;
- permite supplier accounting link cross-tenant;
- permite supplier bank reconciliation link cross-tenant;
- permite supplier payment report cross-tenant;
- acepta tenantId desde body;
- acepta actor fields desde body;
- acepta status directo sin endpoint de transición;
- usa findUnique por id simple en entidades tenant-scoped;
- expone full bank account number;
- expone accountNumberHash;
- expone identificationNumberHash;
- expone beneficiaryIdentificationHash;
- expone storageKey;
- expone signedUrl persistente;
- usa float/double para dinero;
- permite totalAmount inconsistente;
- permite outstandingAmount negativo;
- permite paymentOrder sin items;
- permite paymentOrder con payable no aprobado;
- permite paymentOrder item mayor al outstandingAmount;
- permite paid sin aprobación;
- permite paid sin referencia o evidencia;
- permite pago superior al totalAmount;
- permite pago superior al outstandingAmount;
- permite pago a supplier blocked;
- permite payable para supplier inactive;
- permite payable para supplier archived;
- permite duplicate payable aprobado sin control;
- permite evidence rejected como soporte válido;
- inicia transferencia bancaria automática;
- inicia Open Banking payment;
- edita JournalEntry posted;
- crea ReconciliationMatch final;
- marca BankTransaction matched;
- cierra ReconciliationSession;
- crea endpoint público Supplier Payments;
- crea endpoint /me Supplier Payments;
- permite acceso desde WordPress;
- envía datos reales a IA externa;
- audit no está sanitizada;
- logs contienen cuenta bancaria completa;
- logs contienen storageKey;
- logs contienen stack trace productivo.
```

---

## 42. Resultado esperado

Estas notas de seguridad deben garantizar que `021-supplier-payments` se implemente como un módulo financiero-administrativo seguro, trazable y correctamente aislado.

Resultado esperado:

```text id="uab7j2"
tenant isolation
permission-based access
supplier data protection
supplier bank account protection
masked account numbers
hashes hidden from standard DTOs
Secure Document Storage integration
no storageKey exposure
payable duplicate detection
Decimal money
server-side totalAmount
server-side outstandingAmount
approval-controlled payables
approval-controlled payment orders
manual mark-paid only
payment evidence required
partial payment control
overpayment prevention
immutable paid orders
traceable reversal
Accounting Ledger event integration
no JournalEntry posted mutation
SupplierAccountingLink traceability
Bank Reconciliation link only
no final reconciliation from Supplier Payments
safe reports
safe exports
safe audit
safe logs
safe metrics
safe OpenAPI
no public endpoints
no /me endpoints
no WordPress access
no bank transfer initiation
no Open Banking payment initiation
no electronic invoicing/SRI in MVP
no external AI with real supplier/payment data
```

---

## 43. Expediente actualizado

```text id="ngzoq3"
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
│   │       ├── api-contract.md
│   │       ├── test-plan.md
│   │       ├── tasks.md
│   │       └── security-notes.md
```

---

## 44. Cierre de paquete documental

Con este documento queda cerrado el paquete documental inicial de:

```text id="f3gzgq"
docs/specs/021-supplier-payments/
```

Archivos completados:

```text id="na6z6s"
spec.md
plan.md
data-model.md
api-contract.md
test-plan.md
tasks.md
security-notes.md
```
