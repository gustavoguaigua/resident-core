# Functional Specification — Spec 021 Supplier Payments

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                                               |
| Spec ID         | 021                                                                                                                                                                                         |
| Módulo          | Supplier Payments                                                                                                                                                                           |
| Documento       | Functional Specification                                                                                                                                                                    |
| Ruta            | `docs/specs/021-supplier-payments/spec.md`                                                                                                                                                  |
| Versión         | 0.1                                                                                                                                                                                         |
| Estado          | Borrador inicial                                                                                                                                                                            |
| Fecha           | 2026-07-23                                                                                                                                                                                  |
| Depende de      | `001-tenants`, `002-users-roles`, `007-audit`, `008-basic-reports`, `016-secure-document-storage`, `017-bank-reconciliation`, `020-accounting-ledger`                                       |
| Relacionado con | proveedores, cuentas por pagar, egresos, facturas de proveedor, órdenes de pago, aprobaciones, comprobantes, gastos, pagos administrativos, evidencias, contabilidad, conciliación bancaria |
| API Style       | REST                                                                                                                                                                                        |
| Naturaleza      | Tenant-scoped / Supplier-aware / Payable-driven / Approval-controlled / Evidence-backed / Accounting-linked / Reconciliation-ready / Audit-heavy / Non-public                               |

---

## 2. Propósito

El módulo `021-supplier-payments` define la gestión básica de proveedores, obligaciones por pagar y pagos administrativos realizados por cada conjunto residencial.

Su propósito es permitir que cada tenant registre proveedores, documentos de obligación, facturas, cuentas por pagar, aprobaciones internas, órdenes de pago, evidencias de pago y vínculos contables, manteniendo trazabilidad, control financiero, auditoría y seguridad.

Regla central:

```text id="r93hwa"
Todo proveedor, obligación, factura, orden de pago, aprobación, comprobante, egreso, vínculo contable y evidencia documental debe pertenecer a un tenant, tener autorización explícita, usar Decimal, preservar trazabilidad documental, integrarse con Accounting Ledger, poder relacionarse con Bank Reconciliation cuando exista movimiento bancario, no iniciar transferencias bancarias automáticamente en MVP, no reemplazar facturación electrónica/SRI, no exponer datos en endpoints públicos y no permitir acceso desde WordPress.
```

---

## 3. Contexto dentro de RESIDENT Core

Hasta este punto, RESIDENT Core ya contempla:

```text id="f3y6fp"
016-secure-document-storage
  └── almacenamiento seguro de documentos, evidencias y exports

017-bank-reconciliation
  └── cuentas bancarias, movimientos bancarios, conciliación y evidencia bancaria

020-accounting-ledger
  └── plan de cuentas, asientos contables, libro diario, libro mayor y cierre básico
```

`021-supplier-payments` introduce el flujo de egresos administrativos.

Relación conceptual:

```text id="hvcumi"
Supplier
  └── Supplier Invoice / Payable
        └── Approval Workflow
              └── Supplier Payment Order
                    └── Payment Evidence
                          └── Accounting Ledger
                                └── Bank Reconciliation
```

Este módulo no reemplaza la contabilidad. La contabilidad se registra en `020-accounting-ledger`.

Este módulo no ejecuta transferencias bancarias automáticas. Registra, controla y evidencia pagos.

---

## 4. Problema que resuelve

En la administración de un conjunto residencial, existen egresos frecuentes:

```text id="d8z25j"
- mantenimiento;
- limpieza;
- seguridad;
- jardinería;
- servicios básicos;
- reparaciones;
- administración;
- honorarios;
- materiales;
- comisiones bancarias;
- servicios profesionales;
- proveedores recurrentes.
```

Sin un módulo formal, estos egresos se gestionan manualmente mediante hojas de cálculo, chats, comprobantes dispersos o registros contables posteriores.

Problemas que resuelve:

```text id="yznzth"
- falta de registro formal de proveedores;
- falta de control de facturas y obligaciones por pagar;
- pagos sin aprobación documentada;
- comprobantes de egreso dispersos;
- dificultad para saber qué facturas están pendientes, aprobadas o pagadas;
- falta de trazabilidad entre pago, proveedor, factura, banco y asiento contable;
- dificultad para conciliar egresos bancarios con obligaciones registradas;
- riesgo de pagos duplicados;
- riesgo de pagos a proveedores no autorizados;
- falta de evidencia documental;
- falta de reportes de egresos por proveedor, categoría o periodo.
```

---

## 5. Objetivo funcional

El sistema debe permitir:

```text id="hrpifv"
- registrar proveedores por tenant;
- clasificar proveedores;
- registrar datos administrativos y de contacto del proveedor;
- registrar cuentas bancarias de proveedor de forma segura;
- registrar documentos de proveedor;
- registrar facturas, recibos u obligaciones por pagar;
- adjuntar evidencia documental mediante Secure Document Storage;
- validar y aprobar obligaciones;
- crear órdenes de pago;
- aprobar órdenes de pago;
- marcar órdenes como pagadas de forma manual con evidencia;
- vincular pagos de proveedor con movimientos bancarios conciliados;
- generar efectos contables hacia Accounting Ledger;
- prevenir pagos duplicados;
- consultar cuentas por pagar;
- consultar historial de pagos por proveedor;
- generar reportes de egresos;
- auditar operaciones críticas;
- impedir exposición pública;
- impedir acceso desde WordPress;
- impedir transferencias bancarias automáticas en MVP.
```

---

## 6. Alcance incluido en MVP

El MVP de `Supplier Payments` incluye:

```text id="k9xiow"
1. Supplier registry por tenant.
2. Supplier categories.
3. Supplier contacts.
4. Supplier bank account references con datos protegidos.
5. Supplier documents mediante Secure Document Storage.
6. Supplier invoices / payable documents.
7. Payable status lifecycle.
8. Payment approval workflow básico.
9. Supplier payment orders.
10. Supplier payment order items.
11. Manual payment execution recording.
12. Payment evidence attachments.
13. Duplicate detection por supplier + invoice number + amount + issueDate.
14. Due date tracking.
15. Partial payment support básico.
16. Payment cancellation / void before paid.
17. Payment reversal/correction request básico.
18. Integration con Accounting Ledger.
19. Integration con Bank Reconciliation.
20. Reports de proveedores, obligaciones, pagos y egresos.
21. Audit completo.
22. Logs seguros.
23. Métricas seguras.
24. REST API privada tenant.
25. No public endpoints.
26. No `/me` supplier payment endpoints en MVP.
27. No WordPress access.
28. No automatic bank transfers.
29. No Open Banking payment initiation.
30. No SRI/electronic invoicing.
31. No tax compliance completo.
32. No external AI con datos reales.
```

---

## 7. Fuera de alcance del MVP

No implementar en esta spec:

```text id="a9vqys"
- transferencias bancarias automáticas;
- iniciación de pagos Open Banking;
- generación de archivos bancarios de pago masivo;
- cash management avanzado;
- tesorería avanzada;
- cuentas por pagar completas enterprise;
- aging avanzado con workflow complejo;
- órdenes de compra formales;
- recepción de bienes/servicios avanzada;
- contratos de proveedor avanzados;
- retenciones tributarias;
- facturación electrónica;
- integración SRI;
- validación tributaria automática;
- anexos tributarios;
- inventarios;
- activos fijos;
- presupuesto avanzado;
- centros de costo avanzados;
- aprobaciones multi-nivel complejas;
- firma electrónica;
- pagos recurrentes automáticos;
- domiciliación bancaria;
- conciliación bancaria automática final;
- IA para validar facturas reales;
- OCR de facturas reales en MVP;
- scoring de proveedores;
- portal público de proveedores.
```

---

## 8. Principios de diseño

### 8.1. Tenant isolation

Todo proveedor, factura, orden de pago, evidencia y reporte pertenece a un tenant.

Regla:

```text id="sz5wae"
Un proveedor registrado en tenant A no existe ni es visible para tenant B.
```

---

### 8.2. Supplier registry como entidad administrativa

El proveedor es una entidad administrativa interna del tenant.

No es usuario del sistema en MVP.

```text id="snjncw"
Supplier no equivale a UserProfile.
Supplier no accede al Core.
Supplier no tiene login.
```

---

### 8.3. Payable-driven

El flujo parte de una obligación por pagar:

```text id="2xxmy1"
SupplierInvoice / SupplierPayable
  -> approval
  -> payment order
  -> payment evidence
  -> accounting
  -> bank reconciliation
```

---

### 8.4. No bank payment initiation in MVP

RESIDENT Core no mueve dinero.

```text id="bvg6to"
El sistema registra y controla el pago; no ejecuta la transferencia bancaria.
```

---

### 8.5. Evidence-backed

Todo pago de proveedor marcado como pagado debe tener evidencia mínima:

```text id="z69ca4"
- referencia de pago;
- fecha de pago;
- método de pago;
- monto;
- actor responsable;
- comprobante o documento adjunto cuando aplique;
- trazabilidad bancaria si existe.
```

---

### 8.6. Accounting-linked

Los efectos contables deben integrarse con `020-accounting-ledger`.

Ejemplos conceptuales:

```text id="wwdc5x"
Registro de obligación:
Dr Expense / Asset
Cr AccountsPayable

Registro de pago:
Dr AccountsPayable
Cr Bank / Cash / PaymentClearing
```

---

### 8.7. Reconciliation-ready

Un pago a proveedor debe poder asociarse posteriormente con un movimiento bancario conciliado.

```text id="r8m5vs"
Supplier Payment registra el egreso.
Bank Reconciliation confirma el movimiento bancario.
Accounting Ledger registra el efecto contable.
```

---

### 8.8. Duplicate prevention

El sistema debe prevenir pagos duplicados y facturas duplicadas.

Clave conceptual:

```text id="jaff7p"
tenantId + supplierId + invoiceNumber + issueDate + totalAmount
```

---

### 8.9. Decimal money

Todos los montos usan Decimal.

Prohibido:

```text id="k3kl09"
float
double
JavaScript number como fuente de verdad monetaria
```

---

### 8.10. No public exposure

Proveedor, factura y pagos son información administrativa privada.

No debe existir API pública ni `/me` para este módulo en MVP.

---

## 9. Actores

### 9.1. TenantAdmin

Puede consultar configuración general y reportes si tiene permisos.

No debe aprobar pagos por defecto salvo permiso explícito.

---

### 9.2. FinancialManager

Puede administrar proveedores, obligaciones, aprobación, órdenes de pago, reportes y cierre operativo de egresos.

---

### 9.3. Accountant

Puede registrar facturas, revisar cuentas por pagar, generar órdenes de pago, vincular contabilidad y consultar reportes.

---

### 9.4. BoardMember

Puede consultar reportes agregados y pagos aprobados si tiene permisos.

No registra ni aprueba pagos por defecto.

---

### 9.5. PropertyOwner / Resident

No accede a Supplier Payments en MVP.

---

### 9.6. Supplier

No es usuario del sistema en MVP.

No tiene portal propio.

---

### 9.7. System

Calcula estados, valida duplicados, genera eventos, prepara integración contable, registra auditoría y emite métricas.

---

## 10. Definiciones funcionales

### 10.1. Supplier

Proveedor del tenant.

Puede ser:

```text id="nhvz98"
- empresa;
- persona natural;
- contratista;
- profesional independiente;
- servicio recurrente;
- proveedor ocasional.
```

---

### 10.2. Supplier Category

Clasificación administrativa del proveedor.

Ejemplos:

```text id="g7s4u7"
seguridad
limpieza
jardinería
mantenimiento
servicios básicos
administración
profesionales
materiales
otros
```

---

### 10.3. Supplier Bank Account Reference

Referencia protegida de cuenta bancaria del proveedor.

No debe almacenar datos bancarios completos innecesarios.

Debe usar:

```text id="db06jj"
accountNumberMasked
accountNumberHash
bankName
accountType
beneficiaryName
```

---

### 10.4. Supplier Invoice / Payable

Documento u obligación por pagar.

Puede representar:

```text id="zcy97w"
- factura;
- recibo;
- nota de venta;
- contrato;
- cuota de servicio;
- obligación manual;
- gasto aprobado;
- comprobante administrativo.
```

---

### 10.5. Supplier Payment Order

Orden interna para pagar una o varias obligaciones.

No ejecuta transferencia bancaria automática.

---

### 10.6. Supplier Payment Order Item

Detalle que vincula una orden de pago con una obligación específica.

---

### 10.7. Supplier Payment Evidence

Evidencia de pago.

Puede incluir:

```text id="hlt3ne"
- comprobante bancario;
- recibo;
- captura;
- PDF;
- imagen;
- referencia bancaria;
- número de transacción;
- documento interno.
```

---

### 10.8. Supplier Payment Accounting Link

Relación entre Supplier Payments y Accounting Ledger.

---

### 10.9. Supplier Payment Bank Reconciliation Link

Relación entre Supplier Payments y Bank Reconciliation.

---

## 11. Entidades conceptuales

### 11.1. Supplier

Campos conceptuales:

```text id="osf3zk"
id
tenantId
supplierCode
supplierName
supplierType
identificationType
identificationNumber
identificationNumberHash
email
phone
address
status
categoryId
defaultExpenseAccountId
defaultAccountsPayableAccountId
createdBy
updatedBy
activatedBy
disabledBy
archivedBy
createdAt
updatedAt
activatedAt
disabledAt
archivedAt
metadata
```

---

### 11.2. SupplierCategory

Campos conceptuales:

```text id="qe3poi"
id
tenantId
categoryCode
categoryName
description
status
createdBy
updatedBy
archivedBy
createdAt
updatedAt
archivedAt
metadata
```

---

### 11.3. SupplierContact

Campos conceptuales:

```text id="lvhkb7"
id
tenantId
supplierId
contactName
role
email
phone
isPrimary
status
createdBy
updatedBy
archivedBy
createdAt
updatedAt
archivedAt
metadata
```

---

### 11.4. SupplierBankAccount

Campos conceptuales:

```text id="efeeqz"
id
tenantId
supplierId
bankName
accountType
accountNumberMasked
accountNumberHash
beneficiaryName
beneficiaryIdentificationMasked
beneficiaryIdentificationHash
currency
status
verifiedAt
verifiedBy
disabledAt
disabledBy
archivedAt
archivedBy
createdAt
updatedAt
metadata
```

---

### 11.5. SupplierDocument

Representa vínculo lógico con Secure Document Storage.

Campos conceptuales:

```text id="gxaz4f"
id
tenantId
supplierId
secureDocumentId
documentType
description
status
createdBy
archivedBy
createdAt
archivedAt
metadata
```

---

### 11.6. SupplierPayable

Obligación por pagar.

Campos conceptuales:

```text id="n2s9g7"
id
tenantId
supplierId
payableNumber
externalDocumentNumber
documentType
issueDate
receivedDate
dueDate
description
subtotalAmount
taxAmount
discountAmount
totalAmount
outstandingAmount
currency
status
categoryId
expenseAccountId
accountsPayableAccountId
secureDocumentId
duplicateFingerprint
approvalStatus
approvedAt
approvedBy
rejectedAt
rejectedBy
cancelledAt
cancelledBy
archivedAt
archivedBy
createdBy
updatedBy
createdAt
updatedAt
metadata
```

---

### 11.7. SupplierPayableApproval

Registro de aprobación de una obligación.

Campos conceptuales:

```text id="otdd4n"
id
tenantId
supplierPayableId
approvalStep
approvalStatus
requestedBy
approvedBy
rejectedBy
requestedAt
approvedAt
rejectedAt
reason
metadata
```

---

### 11.8. SupplierPaymentOrder

Orden interna de pago.

Campos conceptuales:

```text id="ivk1t8"
id
tenantId
paymentOrderNumber
supplierId
paymentMethod
plannedPaymentDate
actualPaymentDate
description
totalAmount
paidAmount
currency
status
supplierBankAccountId
bankAccountId
paymentReference
secureDocumentId
accountingJournalEntryId
bankTransactionId
reconciliationMatchId
approvedAt
approvedBy
paidAt
paidBy
voidedAt
voidedBy
cancelledAt
cancelledBy
archivedAt
archivedBy
createdBy
updatedBy
createdAt
updatedAt
metadata
```

---

### 11.9. SupplierPaymentOrderItem

Detalle de una orden de pago.

Campos conceptuales:

```text id="j6rj73"
id
tenantId
supplierPaymentOrderId
supplierPayableId
lineNumber
amount
currency
description
createdAt
metadata
```

---

### 11.10. SupplierPaymentEvidence

Evidencia de pago.

Campos conceptuales:

```text id="d408mp"
id
tenantId
supplierPaymentOrderId
secureDocumentId
evidenceType
paymentReference
paymentDate
amount
currency
status
createdBy
verifiedBy
archivedBy
createdAt
verifiedAt
archivedAt
metadata
```

---

### 11.11. SupplierAccountingLink

Vínculo con Accounting Ledger.

Campos conceptuales:

```text id="ok28lp"
id
tenantId
supplierPayableId
supplierPaymentOrderId
journalEntryId
accountingEventType
status
createdAt
metadata
```

---

### 11.12. SupplierBankReconciliationLink

Vínculo con Bank Reconciliation.

Campos conceptuales:

```text id="6mx3ck"
id
tenantId
supplierPaymentOrderId
bankTransactionId
reconciliationMatchId
status
linkedAt
linkedBy
unlinkedAt
unlinkedBy
metadata
```

---

## 12. Enums iniciales

### 12.1. SupplierStatus

```text id="b5yetb"
draft
active
inactive
blocked
archived
```

---

### 12.2. SupplierType

```text id="n4j65v"
company
individual
contractor
publicUtility
professional
other
```

---

### 12.3. SupplierCategoryStatus

```text id="vii03k"
active
inactive
archived
```

---

### 12.4. SupplierContactStatus

```text id="cqrzkx"
active
inactive
archived
```

---

### 12.5. SupplierBankAccountStatus

```text id="f5k8jm"
draft
verified
active
inactive
rejected
archived
```

---

### 12.6. SupplierDocumentType

```text id="dgqnme"
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

### 12.7. SupplierDocumentStatus

```text id="o179qf"
active
archived
```

---

### 12.8. SupplierPayableDocumentType

```text id="baot79"
invoice
receipt
note
contractObligation
manualObligation
utilityBill
other
```

---

### 12.9. SupplierPayableStatus

```text id="dux31s"
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

### 12.10. SupplierPayableApprovalStatus

```text id="pa7rwn"
pending
approved
rejected
cancelled
```

---

### 12.11. SupplierPaymentOrderStatus

```text id="ffmp3s"
draft
pendingApproval
approved
scheduled
paid
partiallyPaid
failed
voided
cancelled
archived
```

---

### 12.12. SupplierPaymentMethod

```text id="m2grfh"
bankTransferManual
cash
check
debitCard
creditCard
providerPayment
other
```

MVP recomendado:

```text id="x706ym"
bankTransferManual
cash
check
other
```

---

### 12.13. SupplierPaymentEvidenceType

```text id="r4h8vp"
bankReceipt
cashReceipt
checkCopy
providerReceipt
internalDocument
other
```

---

### 12.14. SupplierPaymentEvidenceStatus

```text id="flvtzp"
uploaded
verified
rejected
archived
```

---

### 12.15. SupplierAccountingEventType

```text id="v2z14k"
payableApproved
paymentRecorded
paymentVoided
paymentReversed
adjustment
```

---

### 12.16. SupplierLinkStatus

```text id="g5xymc"
active
unlinked
archived
```

---

### 12.17. Currency

```text id="nettkf"
USD
```

---

## 13. Reglas de negocio

### BR-001 — Tenant obligatorio

Toda entidad operativa del módulo debe tener `tenantId`.

---

### BR-002 — No `tenantId` desde body

El cliente nunca debe enviar `tenantId` para crear proveedores, facturas, órdenes de pago o evidencias.

---

### BR-003 — Proveedor activo requerido para nuevas obligaciones

Solo proveedores `active` pueden recibir nuevas obligaciones por pagar.

---

### BR-004 — Proveedor bloqueado no puede recibir pagos

Un proveedor `blocked` no puede tener nuevas órdenes de pago aprobadas.

---

### BR-005 — Código de proveedor único

`supplierCode` debe ser único por tenant.

---

### BR-006 — Documento externo no debe duplicarse

El sistema debe detectar posible duplicado por:

```text id="jwvjzf"
tenantId + supplierId + externalDocumentNumber + issueDate + totalAmount
```

---

### BR-007 — Montos Decimal

Todo monto debe usar Decimal.

---

### BR-008 — Total calculado server-side

Para SupplierPayable:

```text id="ohlnki"
totalAmount = subtotalAmount + taxAmount - discountAmount
```

Debe calcularse server-side o validarse estrictamente.

---

### BR-009 — Outstanding amount

```text id="ajcxbh"
outstandingAmount = totalAmount - sum(paymentOrderItems paid/valid)
```

Debe calcularse server-side.

---

### BR-010 — Payable aprobado antes de pago

Una obligación debe estar `approved` antes de incluirse en una orden de pago aprobada.

---

### BR-011 — Pago no puede exceder saldo pendiente

La suma de pagos válidos no debe superar `outstandingAmount`.

---

### BR-012 — Partial payments permitidos

Una obligación puede quedar `partiallyPaid` si el pago cubre parte del total.

---

### BR-013 — Paid cuando outstanding = 0

Una obligación pasa a `paid` cuando su saldo pendiente llega a cero.

---

### BR-014 — Orden de pago requiere ítems

Una `SupplierPaymentOrder` debe tener al menos un item.

---

### BR-015 — Orden de pago requiere aprobación antes de paid

Una orden no puede marcarse `paid` sin aprobación, salvo permiso excepcional auditado.

---

### BR-016 — Pago manual requiere evidencia

Todo pago marcado `paid` debe tener al menos referencia o documento de evidencia.

---

### BR-017 — No transferencia automática

El estado `paid` registra que el pago fue realizado fuera del sistema o manualmente.

No ejecuta transferencia.

---

### BR-018 — SupplierBankAccount protegida

No almacenar número completo de cuenta en texto plano si no es estrictamente necesario.

Usar:

```text id="mj6fie"
accountNumberMasked
accountNumberHash
```

---

### BR-019 — Evidencia vía Secure Document Storage

Todo documento adjunto debe usar `016-secure-document-storage`.

---

### BR-020 — No storageKey en API

La API no debe exponer `storageKey`.

---

### BR-021 — Accounting Ledger como destino contable

Los eventos de obligación aprobada y pago registrado pueden generar eventos contables hacia `020-accounting-ledger`.

---

### BR-022 — No modificar Accounting Ledger directamente

Supplier Payments no debe editar JournalEntries posted.

Debe usar eventos o puertos definidos.

---

### BR-023 — Bank Reconciliation confirma banco

Supplier Payments no debe marcar movimientos bancarios como conciliados.

Solo puede vincularse a un match ya confirmado o candidato según política.

---

### BR-024 — No Open Banking payment initiation

Este módulo no inicia pagos Open Banking en MVP.

---

### BR-025 — No SRI/electronic invoicing

Este módulo no valida ni emite documentos tributarios electrónicos en MVP.

---

### BR-026 — No endpoint público

No debe existir endpoint público de proveedores, facturas u órdenes de pago.

---

### BR-027 — No WordPress access

WordPress no puede acceder a Supplier Payments.

---

### BR-028 — No IA externa con datos reales

No enviar proveedores, facturas, comprobantes, montos ni egresos reales a IA externa.

---

### BR-029 — Audit obligatorio

Toda operación crítica debe auditarse.

---

### BR-030 — Reportes derivados de datos tenant-scoped

Los reportes deben filtrar siempre por tenant.

---

### BR-031 — Pago void/cancel controlado

Una orden no pagada puede cancelarse o anularse bajo permisos.

Una orden pagada no se edita; requiere reverso/corrección.

---

### BR-032 — Evidencia rechazada no valida pago

Si la evidencia es `rejected`, no debe ser considerada como soporte válido de pago.

---

### BR-033 — Proveedor archivado mantiene historial

Archivar proveedor no elimina facturas ni pagos históricos.

---

### BR-034 — Cambio de cuenta bancaria de proveedor se audita

La creación, verificación, desactivación o archivo de cuenta bancaria del proveedor debe auditarse.

---

### BR-035 — Control de concurrencia

Dos pagos simultáneos no deben pagar dos veces la misma obligación.

---

## 14. Historias de usuario

### US-001 — Registrar proveedor

Como FinancialManager, quiero registrar un proveedor para poder asociarle facturas y pagos.

Criterios:

```text id="lgeixv"
- requiere permiso;
- supplierCode único;
- status inicial draft o active según política;
- audita supplier.created.
```

---

### US-002 — Activar proveedor

Como FinancialManager, quiero activar un proveedor validado para usarlo en nuevas obligaciones.

Criterios:

```text id="u7b43w"
- proveedor pertenece al tenant;
- datos mínimos completos;
- audita supplier.activated.
```

---

### US-003 — Registrar cuenta bancaria de proveedor

Como Accountant, quiero registrar una cuenta bancaria de proveedor para documentar pagos manuales.

Criterios:

```text id="fc5cvi"
- no exponer número completo;
- almacenar masked/hash;
- requiere permiso;
- audita supplierBankAccount.created.
```

---

### US-004 — Registrar factura u obligación por pagar

Como Accountant, quiero registrar una factura de proveedor para controlar el pago pendiente.

Criterios:

```text id="f5fjwb"
- proveedor activo;
- monto Decimal;
- número de documento;
- fecha de emisión;
- fecha de vencimiento opcional;
- detección de duplicado;
- documento adjunto opcional;
- audita supplierPayable.created.
```

---

### US-005 — Aprobar obligación por pagar

Como FinancialManager, quiero aprobar una obligación para que pueda ser pagada.

Criterios:

```text id="t3hck9"
- requiere permiso;
- payable en pendingReview;
- no duplicado crítico;
- audita supplierPayable.approved.
```

---

### US-006 — Crear orden de pago

Como Accountant, quiero crear una orden de pago para una o varias obligaciones aprobadas.

Criterios:

```text id="hnsx3j"
- proveedor activo;
- payables aprobados;
- no excede saldo pendiente;
- genera totalAmount server-side;
- status draft.
```

---

### US-007 — Aprobar orden de pago

Como FinancialManager, quiero aprobar una orden de pago antes de registrar el egreso.

Criterios:

```text id="hm0mj0"
- requiere permiso;
- orden con ítems;
- proveedor no bloqueado;
- monto válido;
- audita supplierPaymentOrder.approved.
```

---

### US-008 — Marcar pago como realizado

Como Accountant, quiero marcar una orden aprobada como pagada adjuntando evidencia.

Criterios:

```text id="vxl000"
- orden approved o scheduled;
- fecha de pago;
- método;
- referencia;
- evidencia o razón;
- actualiza outstanding;
- genera evento contable;
- audita supplierPaymentOrder.paid.
```

---

### US-009 — Vincular pago con movimiento bancario

Como Accountant, quiero vincular un pago de proveedor con un movimiento bancario conciliado.

Criterios:

```text id="a25029"
- BankTransaction pertenece al tenant;
- monto compatible;
- no marca conciliación final desde este módulo;
- audita supplierPaymentOrder.bankTransactionLinked.
```

---

### US-010 — Consultar cuentas por pagar

Como FinancialManager, quiero consultar obligaciones pendientes por proveedor, vencimiento y categoría.

Criterios:

```text id="t8qyow"
- filtra por estado;
- muestra saldos pendientes;
- tenant-scoped;
- paginado.
```

---

### US-011 — Consultar historial de pagos

Como BoardMember autorizado, quiero consultar pagos realizados a proveedores.

Criterios:

```text id="sk1znn"
- permiso requerido;
- datos agregados o detallados según permiso;
- no permite edición;
- tenant-scoped.
```

---

### US-012 — Generar reporte de egresos

Como FinancialManager, quiero generar reportes de egresos por proveedor, categoría y periodo.

Criterios:

```text id="mggdlq"
- derivado de datos tenant-scoped;
- montos Decimal;
- exportable vía Secure Document Storage;
- auditado.
```

---

## 15. Requisitos funcionales

### FR-001 — Supplier registry

El sistema debe permitir crear, consultar, actualizar, activar, bloquear, desactivar y archivar proveedores.

---

### FR-002 — Supplier categories

El sistema debe permitir administrar categorías de proveedores.

---

### FR-003 — Supplier contacts

El sistema debe permitir registrar contactos asociados a proveedores.

---

### FR-004 — Supplier bank accounts

El sistema debe permitir registrar referencias bancarias protegidas de proveedores.

---

### FR-005 — Supplier documents

El sistema debe permitir vincular documentos de proveedor usando Secure Document Storage.

---

### FR-006 — Supplier payables

El sistema debe permitir registrar obligaciones por pagar.

---

### FR-007 — Duplicate detection

El sistema debe detectar posibles duplicados de obligaciones.

---

### FR-008 — Approval workflow básico

El sistema debe permitir aprobar o rechazar obligaciones.

---

### FR-009 — Payment orders

El sistema debe permitir crear órdenes de pago para obligaciones aprobadas.

---

### FR-010 — Payment order approval

El sistema debe permitir aprobar órdenes de pago.

---

### FR-011 — Payment recording

El sistema debe permitir marcar una orden aprobada como pagada de forma manual.

---

### FR-012 — Payment evidence

El sistema debe permitir adjuntar y verificar evidencia de pago.

---

### FR-013 — Partial payments

El sistema debe soportar pagos parciales básicos.

---

### FR-014 — Outstanding balance

El sistema debe calcular saldo pendiente por obligación.

---

### FR-015 — Cancellation / void

El sistema debe permitir cancelar/anular obligaciones u órdenes no pagadas bajo reglas.

---

### FR-016 — Paid correction

El sistema debe permitir reverso o corrección de pagos registrados, sin edición directa del histórico.

---

### FR-017 — Accounting integration

El sistema debe emitir eventos hacia Accounting Ledger.

---

### FR-018 — Bank reconciliation integration

El sistema debe permitir vincular pagos con movimientos bancarios conciliados o candidatos según política.

---

### FR-019 — Reports

El sistema debe generar reportes de proveedores, obligaciones, pagos, vencimientos y egresos.

---

### FR-020 — Export

El sistema debe exportar reportes mediante Secure Document Storage.

---

### FR-021 — Audit

El sistema debe auditar operaciones críticas.

---

### FR-022 — No public endpoints

No debe existir API pública de Supplier Payments.

---

### FR-023 — No `/me` endpoints

No debe existir API `/me` para proveedores y egresos en MVP.

---

### FR-024 — No bank payment initiation

El sistema no debe ejecutar transferencias bancarias automáticas.

---

### FR-025 — No external AI with real data

El sistema no debe enviar datos reales de proveedores, facturas o pagos a IA externa.

---

## 16. Requisitos no funcionales

### NFR-001 — Seguridad

Debe cumplir `docs/sdd/security.md`.

---

### NFR-002 — Multitenancy

Todas las entidades deben ser tenant-scoped.

---

### NFR-003 — Precisión monetaria

Todos los montos deben usar Decimal.

---

### NFR-004 — Trazabilidad

Todo pago debe ser trazable hacia proveedor, obligación, orden, evidencia y actor.

---

### NFR-005 — Idempotencia

Operaciones sensibles deben prevenir duplicados.

---

### NFR-006 — Auditabilidad

Toda acción crítica debe dejar audit log sanitizado.

---

### NFR-007 — Integridad financiera

No debe existir pago por encima del saldo pendiente.

---

### NFR-008 — Privacidad

Datos de proveedores, cuentas bancarias y documentos deben protegerse.

---

### NFR-009 — Performance

Objetivos iniciales:

```text id="ph79t0"
p95 < 800 ms para listar proveedores paginados.
p95 < 1000 ms para listar obligaciones paginadas.
p95 < 1200 ms para listar órdenes de pago paginadas.
p95 < 1500 ms para generar reporte de cuentas por pagar típico.
p95 < 2000 ms para reporte de egresos mensual típico.
```

---

### NFR-010 — API-first

Toda funcionalidad administrativa debe exponerse mediante REST privado.

---

## 17. Permisos iniciales

### 17.1. Suppliers

```text id="t5v9og"
suppliers.create
suppliers.read
suppliers.update
suppliers.activate
suppliers.disable
suppliers.block
suppliers.archive
```

---

### 17.2. Supplier categories

```text id="ikpj9a"
supplierCategories.create
supplierCategories.read
supplierCategories.update
supplierCategories.archive
```

---

### 17.3. Supplier contacts

```text id="g110jk"
supplierContacts.create
supplierContacts.read
supplierContacts.update
supplierContacts.archive
```

---

### 17.4. Supplier bank accounts

```text id="ucnaft"
supplierBankAccounts.create
supplierBankAccounts.read
supplierBankAccounts.update
supplierBankAccounts.verify
supplierBankAccounts.disable
supplierBankAccounts.archive
```

---

### 17.5. Supplier documents

```text id="l4spck"
supplierDocuments.create
supplierDocuments.read
supplierDocuments.archive
supplierDocuments.download
```

---

### 17.6. Supplier payables

```text id="h7tr3e"
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

### 17.7. Supplier payment orders

```text id="k4c8mc"
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

### 17.8. Payment evidence

```text id="z496wi"
supplierPaymentEvidence.create
supplierPaymentEvidence.read
supplierPaymentEvidence.verify
supplierPaymentEvidence.reject
supplierPaymentEvidence.archive
supplierPaymentEvidence.download
```

---

### 17.9. Reconciliation links

```text id="ayhm06"
supplierPaymentReconciliationLinks.create
supplierPaymentReconciliationLinks.read
supplierPaymentReconciliationLinks.unlink
```

---

### 17.10. Reports

```text id="at738f"
supplierPaymentReports.read
supplierPaymentReports.export
supplierPaymentReports.payablesAging
supplierPaymentReports.paymentsBySupplier
supplierPaymentReports.expensesByCategory
supplierPaymentReports.cashOutflow
```

---

### 17.11. Audit

```text id="o8fdmv"
supplierPayments.audit.read
```

---

## 18. API preliminar

### 18.1. Supplier categories

```text id="sig4fu"
GET    /api/v1/tenant/supplier-payment-categories
POST   /api/v1/tenant/supplier-payment-categories
GET    /api/v1/tenant/supplier-payment-categories/{categoryId}
PATCH  /api/v1/tenant/supplier-payment-categories/{categoryId}
POST   /api/v1/tenant/supplier-payment-categories/{categoryId}/archive
```

---

### 18.2. Suppliers

```text id="goztol"
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

### 18.3. Supplier contacts

```text id="ai19xp"
GET    /api/v1/tenant/suppliers/{supplierId}/contacts
POST   /api/v1/tenant/suppliers/{supplierId}/contacts
GET    /api/v1/tenant/supplier-contacts/{contactId}
PATCH  /api/v1/tenant/supplier-contacts/{contactId}
POST   /api/v1/tenant/supplier-contacts/{contactId}/archive
```

---

### 18.4. Supplier bank accounts

```text id="tx5t7m"
GET    /api/v1/tenant/suppliers/{supplierId}/bank-accounts
POST   /api/v1/tenant/suppliers/{supplierId}/bank-accounts
GET    /api/v1/tenant/supplier-bank-accounts/{bankAccountId}
PATCH  /api/v1/tenant/supplier-bank-accounts/{bankAccountId}
POST   /api/v1/tenant/supplier-bank-accounts/{bankAccountId}/verify
POST   /api/v1/tenant/supplier-bank-accounts/{bankAccountId}/disable
POST   /api/v1/tenant/supplier-bank-accounts/{bankAccountId}/archive
```

---

### 18.5. Supplier documents

```text id="h0njur"
GET    /api/v1/tenant/suppliers/{supplierId}/documents
POST   /api/v1/tenant/suppliers/{supplierId}/documents
GET    /api/v1/tenant/supplier-documents/{supplierDocumentId}
POST   /api/v1/tenant/supplier-documents/{supplierDocumentId}/archive
```

---

### 18.6. Supplier payables

```text id="xcn3k7"
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

### 18.7. Supplier payment orders

```text id="um4krk"
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

### 18.8. Supplier payment evidence

```text id="gy9xlk"
GET    /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/evidence
POST   /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/evidence
GET    /api/v1/tenant/supplier-payment-evidence/{evidenceId}
POST   /api/v1/tenant/supplier-payment-evidence/{evidenceId}/verify
POST   /api/v1/tenant/supplier-payment-evidence/{evidenceId}/reject
POST   /api/v1/tenant/supplier-payment-evidence/{evidenceId}/archive
```

---

### 18.9. Reconciliation links

```text id="f5nu8e"
GET    /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/reconciliation-links
POST   /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/reconciliation-links
POST   /api/v1/tenant/supplier-payment-reconciliation-links/{linkId}/unlink
```

---

### 18.10. Reports

```text id="xz4u7l"
GET    /api/v1/tenant/supplier-payment-reports/payables-aging
GET    /api/v1/tenant/supplier-payment-reports/payments-by-supplier
GET    /api/v1/tenant/supplier-payment-reports/expenses-by-category
GET    /api/v1/tenant/supplier-payment-reports/cash-outflow
GET    /api/v1/tenant/supplier-payment-reports/export
```

---

### 18.11. Endpoints públicos prohibidos

No crear:

```text id="uzj3qz"
GET  /api/v1/public/suppliers
GET  /api/v1/public/supplier-payables
GET  /api/v1/public/supplier-payment-orders
GET  /api/v1/public/supplier-payment-reports
GET  /api/v1/public/tenants/{slug}/suppliers
GET  /api/v1/public/tenants/{slug}/supplier-payables
GET  /api/v1/public/tenants/{slug}/supplier-payment-orders
```

---

### 18.12. Endpoints `/me` prohibidos en MVP

No crear:

```text id="ev6pfe"
GET  /api/v1/me/suppliers
GET  /api/v1/me/supplier-payables
GET  /api/v1/me/supplier-payment-orders
GET  /api/v1/me/supplier-payment-reports
```

---

## 19. Integraciones

### 19.1. `016-secure-document-storage`

Uso:

```text id="vbuaka"
- documentos de proveedor;
- facturas;
- recibos;
- comprobantes de pago;
- evidencia bancaria;
- contratos;
- reportes exportados.
```

Clasificación recomendada:

```text id="q4l1yd"
sourceModule = supplierPayments
visibility = administrative
sensitivity = restricted
```

---

### 19.2. `020-accounting-ledger`

Eventos contables candidatos:

```text id="r1y0jm"
supplierPayable.approved
supplierPaymentOrder.paid
supplierPaymentOrder.voided
supplierPaymentOrder.reversed
supplierPayable.adjusted
```

Ejemplo conceptual:

```text id="cqlz18"
supplierPayable.approved
  Dr Expense
  Cr AccountsPayable
```

```text id="qf8aj4"
supplierPaymentOrder.paid
  Dr AccountsPayable
  Cr Bank / Cash / PaymentClearing
```

Regla:

```text id="vfkzl8"
Supplier Payments no edita JournalEntries posted; solo emite eventos o invoca puertos autorizados.
```

---

### 19.3. `017-bank-reconciliation`

Uso:

```text id="kdy9qs"
- vincular pago de proveedor con movimiento bancario;
- comparar monto, fecha, referencia y cuenta bancaria;
- crear candidatos de conciliación si el módulo 017 lo permite;
- consultar match confirmado.
```

Regla:

```text id="hi38xp"
Supplier Payments no confirma conciliación bancaria final.
```

---

### 19.4. `007-audit`

Uso:

```text id="wczvsx"
- auditar proveedor;
- auditar cuenta bancaria de proveedor;
- auditar factura/obligación;
- auditar aprobación;
- auditar orden de pago;
- auditar marcado como pagado;
- auditar evidencia;
- auditar vínculos contables;
- auditar vínculos bancarios;
- auditar reportes y exports.
```

---

### 19.5. `008-basic-reports`

Uso:

```text id="vxeklg"
- reportes de cuentas por pagar;
- pagos por proveedor;
- egresos por categoría;
- flujo de salida de caja;
- exportación administrativa.
```

---

### 19.6. `012-communications-notifications` futuro/opcional

Uso futuro:

```text id="w220xe"
- notificar aprobación pendiente;
- notificar pago registrado;
- notificar obligación vencida;
- notificar rechazo.
```

No obligatorio para MVP.

---

### 19.7. `019-open-banking-integration`

Uso indirecto:

```text id="elgb4u"
- Open Banking sincroniza movimientos bancarios;
- Bank Reconciliation procesa movimientos;
- Supplier Payments puede vincularse posteriormente con transacciones conciliadas.
```

Prohibido:

```text id="mjckbb"
Supplier Payments no inicia pagos mediante Open Banking en MVP.
```

---

## 20. Flujos funcionales principales

### 20.1. Registro de proveedor

```text id="qf2g06"
1. FinancialManager crea Supplier.
2. Sistema valida tenant activo.
3. Sistema valida supplierCode único.
4. Sistema crea Supplier draft/active según política.
5. Sistema registra contactos y categoría si aplica.
6. Sistema audita supplier.created.
```

---

### 20.2. Registro de obligación por pagar

```text id="sf7ui9"
1. Accountant selecciona proveedor active.
2. Registra documento/factura/obligación.
3. Adjunta documento opcional vía Secure Document Storage.
4. Sistema calcula totalAmount.
5. Sistema calcula duplicateFingerprint.
6. Sistema detecta posible duplicado.
7. SupplierPayable queda draft o pendingReview.
8. Sistema audita supplierPayable.created.
```

---

### 20.3. Aprobación de obligación

```text id="b4tu40"
1. FinancialManager revisa SupplierPayable.
2. Verifica documento y monto.
3. Aprueba o rechaza.
4. Si aprueba, status = approved.
5. Sistema puede emitir evento supplierPayable.approved hacia Accounting Ledger.
6. Sistema audita supplierPayable.approved.
```

---

### 20.4. Creación de orden de pago

```text id="gc4bnq"
1. Accountant crea SupplierPaymentOrder.
2. Selecciona supplier.
3. Agrega payables approved.
4. Define método y fecha planificada.
5. Sistema valida outstandingAmount.
6. Sistema calcula totalAmount.
7. Orden queda draft.
8. Sistema audita supplierPaymentOrder.created.
```

---

### 20.5. Aprobación de orden de pago

```text id="cu9yz6"
1. FinancialManager revisa orden.
2. Verifica proveedor, banco, documentos y montos.
3. Aprueba orden.
4. Status = approved.
5. Sistema audita supplierPaymentOrder.approved.
```

---

### 20.6. Registro manual de pago realizado

```text id="fwya99"
1. Accountant marca orden approved/scheduled como paid.
2. Registra fecha real de pago.
3. Registra referencia.
4. Adjunta evidencia si aplica.
5. Sistema valida monto.
6. Sistema actualiza paidAmount.
7. Sistema actualiza outstandingAmount de payables.
8. Sistema puede emitir supplierPaymentOrder.paid hacia Accounting Ledger.
9. Sistema audita supplierPaymentOrder.paid.
```

---

### 20.7. Vinculación con conciliación bancaria

```text id="jcl5ib"
1. Accountant selecciona SupplierPaymentOrder paid.
2. Selecciona BankTransaction o ReconciliationMatch.
3. Sistema valida tenant.
4. Sistema valida monto/fecha/referencia.
5. Crea SupplierBankReconciliationLink.
6. No confirma conciliación final.
7. Sistema audita supplierPaymentOrder.bankTransactionLinked.
```

---

### 20.8. Reverso/corrección de pago

```text id="xrdu2h"
1. Usuario autorizado solicita reverso/corrección.
2. Sistema valida orden paid.
3. Sistema requiere razón.
4. Sistema crea evento de reverso.
5. Accounting Ledger registra efecto contable por reverso si aplica.
6. Sistema no edita histórico de forma destructiva.
7. Sistema audita supplierPaymentOrder.reversed.
```

---

## 21. Estados principales

### 21.1. Supplier

```text id="bzvvqj"
draft -> active
active -> inactive
inactive -> active
active -> blocked
blocked -> active
draft -> archived
inactive -> archived
blocked -> archived
```

---

### 21.2. SupplierPayable

```text id="a2xqfw"
draft -> pendingReview
pendingReview -> approved
pendingReview -> rejected
approved -> scheduledForPayment
scheduledForPayment -> partiallyPaid
scheduledForPayment -> paid
approved -> partiallyPaid
partiallyPaid -> paid
draft -> cancelled
pendingReview -> cancelled
approved -> cancelled si no tiene pagos
draft -> voided
rejected -> archived
cancelled -> archived
paid -> archived
```

---

### 21.3. SupplierPayableApproval

```text id="p0mm5x"
pending -> approved
pending -> rejected
pending -> cancelled
```

---

### 21.4. SupplierPaymentOrder

```text id="tgsmio"
draft -> pendingApproval
pendingApproval -> approved
pendingApproval -> rejected
approved -> scheduled
approved -> paid
scheduled -> paid
approved -> voided
draft -> voided
pendingApproval -> voided
approved -> cancelled si no paid
paid -> archived
voided -> archived
cancelled -> archived
```

---

### 21.5. SupplierPaymentEvidence

```text id="e20q21"
uploaded -> verified
uploaded -> rejected
verified -> archived
rejected -> archived
```

---

### 21.6. SupplierBankReconciliationLink

```text id="a4u7t1"
active -> unlinked
active -> archived
unlinked -> archived
```

---

## 22. Seguridad

### 22.1. Amenazas prioritarias

```text id="g50qb4"
- proveedor cross-tenant;
- factura cross-tenant;
- orden de pago cross-tenant;
- evidencia cross-tenant;
- pago duplicado;
- pago por encima del saldo pendiente;
- pago a proveedor bloqueado;
- pago sin aprobación;
- pago sin evidencia;
- modificación destructiva de pago pagado;
- exposición de cuenta bancaria completa;
- exposición de storageKey;
- endpoint público de proveedores;
- acceso desde WordPress;
- creación de transferencia bancaria automática no autorizada;
- creación de asiento contable duplicado;
- alteración de JournalEntry posted;
- marcar conciliación bancaria desde Supplier Payments;
- IA externa con facturas o pagos reales.
```

---

### 22.2. Controles obligatorios

```text id="uxxzss"
- AuthGuard;
- TenantGuard;
- PermissionGuard;
- SupplierTenantPolicy;
- SupplierStatusPolicy;
- SupplierBankAccountPrivacyPolicy;
- SupplierPayableDuplicatePolicy;
- SupplierPayableApprovalPolicy;
- SupplierPaymentOrderApprovalPolicy;
- SupplierPaymentAmountPolicy;
- SupplierPaymentEvidencePolicy;
- SupplierPaymentImmutabilityPolicy;
- SupplierAccountingIntegrationPolicy;
- SupplierBankReconciliationBoundaryPolicy;
- NoBankTransferInitiationPolicy;
- NoOpenBankingPaymentInitiationPolicy;
- NoPublicSupplierPaymentEndpointPolicy;
- NoWordPressSupplierPaymentAccessPolicy;
- NoExternalAiSupplierPaymentDataPolicy;
- AuditSanitizationPolicy;
- LogSanitizationPolicy.
```

---

### 22.3. Datos prohibidos

```text id="zf5xtd"
tokens
passwords
secrets
full bank account number
raw bank payload
raw provider payload
storageKey
signedUrl persistente
SQL raw
stack trace en producción
datos cross-tenant
datos reales enviados a IA externa
```

---

## 23. Auditoría

### 23.1. Eventos mínimos

```text id="g6s7ti"
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

supplierBankReconciliationLink.created
supplierBankReconciliationLink.unlinked

supplierPaymentReport.generated
supplierPaymentReport.exported
```

---

### 23.2. Metadata permitida

```text id="z74isx"
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

### 23.3. Metadata prohibida

```text id="j1omqq"
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

## 24. Observabilidad

### 24.1. Logs sugeridos

```text id="quxq9e"
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

### 24.2. Métricas sugeridas

```text id="b647zt"
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

### 24.3. Labels permitidos

```text id="ucymvi"
supplierType
payableStatus
paymentOrderStatus
paymentMethod
documentType
currency
outcome
```

---

### 24.4. Labels prohibidos

```text id="eij8l4"
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

## 25. OpenAPI extensions

Para endpoints tenant:

```yaml id="cfv80u"
x-tenant-scope: true
x-auth-required: true
x-supplier-payments: true
x-public-exposure: false
```

Para payables:

```yaml id="z246r2"
x-payable-controlled: true
x-approval-required: true
x-duplicate-detection: true
x-decimal-money: true
```

Para payment orders:

```yaml id="o6z1az"
x-payment-order: true
x-bank-transfer-initiation: false
x-evidence-required-for-paid: true
x-accounting-linked: true
x-reconciliation-ready: true
```

Para documents:

```yaml id="bu5xcp"
x-secure-document-storage: true
x-storage-key-exposed: false
```

Para restricciones:

```yaml id="syro3t"
x-public-endpoint: false
x-wordpress-access: false
x-open-banking-payment-initiation: false
x-external-ai-real-data: false
```

---

## 26. Reportes iniciales

### 26.1. Payables Aging

Debe mostrar:

```text id="ope35n"
supplier
payableNumber
documentType
issueDate
dueDate
totalAmount
outstandingAmount
daysOverdue
status
currency
```

---

### 26.2. Payments by Supplier

Debe mostrar:

```text id="b0pldl"
supplier
period
paymentOrdersCount
totalPaid
paymentMethods
currency
```

---

### 26.3. Expenses by Category

Debe mostrar:

```text id="r1hka9"
category
payablesCount
approvedAmount
paidAmount
outstandingAmount
currency
```

---

### 26.4. Cash Outflow

Debe mostrar:

```text id="t2qvt6"
period
plannedPayments
actualPayments
paymentMethod
supplier
category
currency
```

---

### 26.5. Export

Formatos sugeridos:

```text id="lfh4ga"
csv
xlsx
pdf
```

Si se persiste:

```text id="a0chic"
usar Secure Document Storage
sourceModule=supplierPayments
sensitivity=restricted
visibility=administrative
```

---

## 27. Pruebas requeridas

### 27.1. Unit tests

```text id="j7z3hk"
Supplier entity
SupplierCategory entity
SupplierContact entity
SupplierBankAccount entity
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
```

---

### 27.2. Integration tests

```text id="bjapim"
supplier creation flow
supplier activation flow
supplier payable creation
duplicate payable detection
payable approval flow
payment order creation
payment order approval
mark paid with evidence
partial payment
accounting ledger integration
bank reconciliation link
SDS document attachment
report generation
export via SDS
audit integration
```

---

### 27.3. API tests

```text id="wu6q4w"
supplier categories CRUD/state transitions
suppliers CRUD/state transitions
supplier contacts CRUD
supplier bank accounts CRUD/verify/disable/archive
supplier documents link/archive
supplier payables CRUD/approve/reject/cancel/void/archive
supplier payment orders CRUD/approve/schedule/mark-paid/reverse/archive
supplier payment evidence create/verify/reject/archive
reconciliation links create/unlink
reports
exports
```

---

### 27.4. Security tests

```text id="ozc95q"
no tenantId body
no cross-tenant suppliers
no cross-tenant payables
no cross-tenant payment orders
no cross-tenant evidence
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

## 28. Criterios de aceptación

### 28.1. Funcionales

```text id="c6ij83"
- permite crear proveedores;
- permite activar/bloquear/archivar proveedores;
- permite crear categorías;
- permite registrar contactos;
- permite registrar cuentas bancarias protegidas;
- permite vincular documentos;
- permite registrar obligaciones por pagar;
- detecta posibles duplicados;
- permite aprobar/rechazar obligaciones;
- permite crear órdenes de pago;
- permite aprobar órdenes de pago;
- permite marcar pagos manuales como realizados;
- permite adjuntar evidencia;
- permite pagos parciales;
- calcula outstandingAmount;
- permite vincular con Bank Reconciliation;
- emite eventos hacia Accounting Ledger;
- genera reportes;
- exporta reportes vía Secure Document Storage;
- audita operaciones críticas.
```

---

### 28.2. Seguridad

```text id="nckik3"
- no acepta tenantId desde body;
- no permite recursos cross-tenant;
- no expone número completo de cuenta bancaria;
- no expone storageKey;
- no permite pagos duplicados evidentes;
- no permite pagar más del saldo pendiente;
- no permite pagar proveedor bloqueado;
- no permite marcar paid sin aprobación;
- no permite transferencia automática;
- no permite Open Banking payment initiation;
- no edita JournalEntry posted;
- no marca conciliación bancaria final;
- no expone endpoints públicos;
- no expone endpoints /me;
- no permite acceso desde WordPress;
- no envía datos reales a IA externa.
```

---

### 28.3. Integridad financiera

```text id="qwgptf"
- totalAmount se calcula/valida server-side;
- outstandingAmount se calcula server-side;
- paymentOrder total se calcula desde items;
- paidAmount no excede totalAmount;
- payable partiallyPaid conserva saldo correcto;
- payable paid llega a outstandingAmount=0;
- reverse/correction no edita destructivamente historial;
- accounting links son trazables;
- reconciliation links son trazables.
```

---

### 28.4. Performance

```text id="bj8mwp"
- consultas paginadas;
- pageSize máximo 100;
- índices por tenant, supplier, status, dueDate y paymentDate;
- reportes pesados preparados para jobs futuros;
- exports controlados.
```

---

## 29. Casos borde

| Caso                                          | Resultado esperado                      |
| --------------------------------------------- | --------------------------------------- |
| Crear supplier con supplierCode duplicado     | 409                                     |
| Crear supplier con tenantId en body           | 422                                     |
| Crear payable para supplier inactive          | 409                                     |
| Crear payable duplicado                       | warning/controlado o 409 según política |
| Crear payable con total negativo              | 422                                     |
| Aprobar payable sin documento requerido       | 409 según política                      |
| Crear payment order sin items                 | 422                                     |
| Crear payment order con payable no aprobado   | 409                                     |
| Crear payment order cross-tenant              | 404/403                                 |
| Aprobar orden para supplier blocked           | 409                                     |
| Marcar paid sin aprobación                    | 409                                     |
| Marcar paid sin referencia/evidencia          | 422/409                                 |
| Pagar más del outstandingAmount               | 409                                     |
| Dos pagos simultáneos sobre mismo payable     | uno exitoso, otro 409/idempotente       |
| Exponer número completo de cuenta bancaria    | falla crítica                           |
| Exponer storageKey                            | falla crítica                           |
| Crear transferencia bancaria automática       | falla crítica                           |
| Iniciar Open Banking payment                  | falla crítica                           |
| Supplier Payments edita JournalEntry posted   | falla crítica                           |
| Supplier Payments confirma conciliación final | falla crítica                           |
| Endpoint público existe                       | falla crítica                           |
| WordPress accede a supplier payments          | falla crítica                           |
| IA externa procesa factura real               | falla crítica                           |

---

## 30. Riesgos

| Riesgo                                     | Impacto | Mitigación                                    |
| ------------------------------------------ | ------: | --------------------------------------------- |
| Pago duplicado                             | Crítico | Duplicate policy + idempotencia + constraints |
| Pago por encima del saldo                  | Crítico | SupplierPaymentAmountPolicy                   |
| Pago sin aprobación                        |    Alto | Approval workflow + guards                    |
| Pago a proveedor bloqueado                 |    Alto | SupplierStatusPolicy                          |
| Cross-tenant payables                      | Crítico | TenantGuard + repositories tenant-scoped      |
| Cuenta bancaria expuesta                   |    Alto | masked/hash + DTO sanitizado                  |
| Evidencia expuesta                         |    Alto | Secure Document Storage                       |
| Ledger inconsistente                       |    Alto | Accounting integration via events             |
| Conciliación alterada indebidamente        | Crítico | boundary con Bank Reconciliation              |
| Transferencia bancaria accidental          | Crítico | NoBankTransferInitiationPolicy                |
| Open Banking payment initiation accidental | Crítico | feature flag false + policy                   |
| Reportes cross-tenant                      | Crítico | report tenant policy                          |
| IA con datos reales                        | Crítico | externalAi false + policy                     |

---

## 31. Dependencias futuras

Quedan como futuras specs o extensiones:

```text id="xd3ja7"
022-bank-rules-automation
023-advanced-reconciliation
024-financial-closing
025-reconciliation-ai-assistance
026-bank-statement-ocr
027-cash-management
028-multi-currency
029-provider-refunds-disputes
030-recurring-payments
031-payment-links-and-qr
032-electronic-invoicing
033-open-banking-payment-initiation
034-bank-consent-compliance
035-treasury-management
036-tax-compliance
037-budgeting-and-forecasting
038-cost-centers
039-accounts-payable-advanced
040-fixed-assets
041-purchase-orders
042-vendor-portal
043-contract-management
```

---

## 32. Preguntas abiertas

```text id="ggm0en"
1. ¿El MVP debe requerir documento adjunto para toda obligación?
2. ¿Se permitirá crear payables manuales sin factura formal?
3. ¿Se exigirá identificación tributaria de proveedor en MVP?
4. ¿Se permitirá proveedor persona natural y empresa desde el inicio?
5. ¿Se permitirá más de una cuenta bancaria por proveedor?
6. ¿Quién verifica las cuentas bancarias de proveedor?
7. ¿Se manejarán aprobaciones por monto?
8. ¿Qué rol puede aprobar pagos?
9. ¿Qué rol puede marcar pagos como realizados?
10. ¿Se permitirá pago en efectivo?
11. ¿Se permitirá pago con cheque?
12. ¿Se permitirá pago parcial desde el MVP?
13. ¿La obligación aprobada generará asiento contable inmediatamente?
14. ¿El pago registrado generará asiento contable inmediatamente?
15. ¿Qué cuenta contable se usará por defecto para gastos?
16. ¿Qué cuenta contable se usará por defecto para cuentas por pagar?
17. ¿Los servicios básicos serán proveedores o categoría especial?
18. ¿Se integrará con SRI en una spec posterior?
19. ¿Se usará OCR de facturas en una fase posterior?
20. ¿Se permitirá portal de proveedores en una fase posterior?
```

---

## 33. Decisión MVP recomendada

Para el MVP se recomienda:

```text id="p6sl03"
- supplier registry tenant-scoped;
- supplier categories;
- supplier contacts;
- supplier bank account masked/hash;
- supplier documents via Secure Document Storage;
- supplier payables;
- duplicate detection básica;
- approval workflow simple;
- supplier payment orders;
- manual mark-paid con evidencia;
- partial payments básicos;
- outstandingAmount calculado;
- accounting events hacia Accounting Ledger;
- bank reconciliation link sin confirmación final;
- reports básicos;
- exports vía Secure Document Storage;
- audit estricto;
- no bank transfer initiation;
- no Open Banking payment initiation;
- no SRI/electronic invoicing;
- no tax compliance completo;
- no public endpoints;
- no /me endpoints;
- no WordPress access;
- no external AI with real data.
```

---

## 34. Archivos derivados esperados

```text id="ed1dcx"
docs/specs/021-supplier-payments/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

---

## 35. Resultado esperado

Al finalizar el módulo `021-supplier-payments`, RESIDENT Core contará con una base segura para gestión de proveedores y egresos administrativos.

Resultado esperado:

```text id="o53jdg"
- proveedores por tenant;
- categorías de proveedor;
- contactos de proveedor;
- cuentas bancarias protegidas;
- documentos de proveedor;
- obligaciones por pagar;
- detección de duplicados;
- aprobación de obligaciones;
- órdenes de pago;
- aprobación de órdenes;
- registro manual de pago;
- evidencia de pago;
- pagos parciales;
- saldo pendiente;
- vínculos contables;
- vínculos con conciliación bancaria;
- reportes de cuentas por pagar;
- reportes de egresos;
- exports vía Secure Document Storage;
- auditoría completa;
- no transferencias automáticas;
- no Open Banking payment initiation;
- no SRI/electronic invoicing;
- no endpoints públicos;
- no endpoints /me;
- no WordPress access;
- no external AI with real supplier/payment data.
```

---

## 36. Conclusión

`021-supplier-payments` debe implementarse como el módulo de egresos administrativos y cuentas por pagar básicas de RESIDENT Core.

Su función no es mover dinero automáticamente ni resolver obligaciones tributarias, sino controlar el ciclo administrativo del egreso:

```text id="u6b32n"
proveedor
obligación
aprobación
orden de pago
evidencia
contabilidad
conciliación
reporte
auditoría
```

El módulo queda preparado para evolucionar hacia:

```text id="oy3fgi"
cuentas por pagar avanzadas
órdenes de compra
contratos
tesorería
cash management
Open Banking payment initiation
facturación electrónica
SRI
tax compliance
centros de costo
presupuestos
portal de proveedores
```

---

## 37. Expediente actualizado

```text id="gacugs"
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
│   │       └── spec.md
```
