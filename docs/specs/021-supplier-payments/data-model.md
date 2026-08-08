# Data Model — Spec 021 Supplier Payments

## 1. Información del documento

| Campo                  | Valor                                                                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto               | RESIDENT Core                                                                                                                                                 |
| Spec ID                | 021                                                                                                                                                           |
| Módulo                 | Supplier Payments                                                                                                                                             |
| Documento              | Data Model                                                                                                                                                    |
| Ruta                   | `docs/specs/021-supplier-payments/data-model.md`                                                                                                              |
| Versión                | 0.1                                                                                                                                                           |
| Estado                 | Borrador inicial                                                                                                                                              |
| Fecha                  | 2026-07-23                                                                                                                                                    |
| Documento base         | `docs/specs/021-supplier-payments/spec.md`                                                                                                                    |
| Plan técnico           | `docs/specs/021-supplier-payments/plan.md`                                                                                                                    |
| Base de datos          | PostgreSQL                                                                                                                                                    |
| ORM                    | Prisma                                                                                                                                                        |
| Estrategia multitenant | Shared database / shared schema / tenant_id                                                                                                                   |
| Naturaleza             | Tenant-scoped / Supplier-aware / Payable-driven / Approval-controlled / Evidence-backed / Accounting-linked / Reconciliation-ready / Audit-heavy / Non-public |

---

## 2. Propósito

Este documento define el modelo de datos del módulo `021-supplier-payments`.

El objetivo es establecer las tablas, relaciones, enums, constraints, índices, reglas de persistencia, reglas de multitenancy, reglas de integridad financiera y lineamientos de migración necesarios para implementar la gestión básica de proveedores, cuentas por pagar, órdenes de pago, evidencias, vínculos contables y vínculos bancarios en RESIDENT Core.

Regla central:

```text id="ozfq3z"
Todo proveedor, categoría, contacto, cuenta bancaria de proveedor, documento, obligación por pagar, aprobación, orden de pago, ítem de pago, evidencia, vínculo contable y vínculo bancario debe pertenecer a un tenant, proteger datos sensibles, usar Decimal para dinero, evitar pagos duplicados, impedir pagos superiores al saldo pendiente, integrarse con Accounting Ledger sin editar asientos posted, vincularse con Bank Reconciliation sin confirmar conciliación final, no iniciar transferencias bancarias, no iniciar pagos Open Banking, no exponer storageKey, no crear endpoints públicos y no permitir acceso desde WordPress.
```

---

## 3. Decisión principal del modelo

El módulo incorporará doce tablas principales:

```text id="feifxf"
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

## 4. Clasificación de tablas

### 4.1. Tablas tenant-scoped

Todas las tablas MVP son tenant-scoped:

```text id="stl1up"
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

Todas deben incluir:

```text id="owwozl"
tenant_id
```

---

### 4.2. Tablas platform-scoped

No se requieren tablas platform-scoped en el MVP.

En una fase futura podrían existir plantillas globales:

```text id="xp2uc0"
supplier_category_templates
supplier_approval_policy_templates
payment_method_templates
```

Estas no forman parte de esta especificación.

---

## 5. Tablas externas relacionadas

El modelo se relaciona con tablas existentes de RESIDENT Core:

```text id="ghlnmg"
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

Relación conceptual:

```text id="t2jdll"
Supplier
  └── SupplierPayable
        └── SupplierPaymentOrder
              └── SupplierPaymentEvidence
                    ├── Secure Document Storage
                    ├── Accounting Ledger
                    └── Bank Reconciliation
```

---

## 6. Principios de modelado

### 6.1. Tenant isolation obligatorio

Toda tabla operativa debe tener `tenant_id`.

Toda consulta debe filtrar por `tenant_id`.

Patrón permitido:

```typescript id="ydfv73"
await prisma.supplierPayable.findFirst({
  where: {
    id: payableId,
    tenantId: currentTenant.id,
    archivedAt: null
  }
});
```

Patrón prohibido:

```typescript id="vu0gfz"
await prisma.supplierPayable.findUnique({
  where: { id: payableId }
});
```

---

### 6.2. Supplier registry tenant-scoped

Un proveedor pertenece a un solo tenant.

```text id="p3v7ti"
supplier tenant A != supplier tenant B
```

No existe proveedor global en MVP.

---

### 6.3. Payable-driven

La obligación por pagar es la entidad financiera central del módulo.

```text id="plgoaj"
SupplierPayable
  -> Approval
  -> PaymentOrderItem
  -> PaymentOrder
  -> Evidence
  -> AccountingLink
  -> ReconciliationLink
```

---

### 6.4. No bank transfer initiation

El modelo registra pagos realizados o planificados, pero no ejecuta pagos.

No almacenar:

```text id="jcy1ft"
bank transfer tokens
bank API credentials
Open Banking payment consent
payment initiation instruction
bank OTP
bank MFA
```

---

### 6.5. Evidence-backed payments

Un pago marcado como `paid` debe tener soporte mínimo:

```text id="ek57nm"
paymentReference
actualPaymentDate
paidAmount
paymentMethod
actor
evidence o razón controlada
```

---

### 6.6. Accounting-linked

El módulo no escribe directamente en tablas contables por SQL.

Debe mantener vínculos trazables hacia `journal_entries` mediante `supplier_accounting_links`.

---

### 6.7. Reconciliation-ready

El módulo puede vincular una orden de pago pagada con `bank_transactions` o `reconciliation_matches`, pero no confirma conciliación final.

---

### 6.8. Decimal money

Todos los montos usan:

```text id="qfmb7d"
Decimal(12,2)
```

Prohibido:

```text id="xklcfx"
float
double
JavaScript number como fuente de verdad monetaria
```

---

### 6.9. Soft archive

Ninguna entidad crítica se elimina físicamente en flujos ordinarios.

Usar:

```text id="ahkmp0"
archived_at
archived_by
archive_reason
```

---

## 7. Tablas del modelo

---

# 8. Entidad `SupplierCategory`

## 8.1. Propósito

Representa una categoría administrativa de proveedor dentro de un tenant.

Ejemplos:

```text id="w0racn"
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

## 8.2. Tabla

```text id="o63yh5"
supplier_categories
```

---

## 8.3. Campos

| Campo         |     Tipo | Requerido | Descripción                  |
| ------------- | -------: | --------: | ---------------------------- |
| id            |     UUID |        Sí | Identificador                |
| tenantId      |     UUID |        Sí | Tenant propietario           |
| categoryCode  |   String |        Sí | Código único por tenant      |
| categoryName  |   String |        Sí | Nombre de categoría          |
| description   |   String |        No | Descripción                  |
| status        |     Enum |        Sí | active / inactive / archived |
| createdBy     |     UUID |        No | Usuario creador              |
| updatedBy     |     UUID |        No | Usuario actualizador         |
| archivedBy    |     UUID |        No | Usuario archivador           |
| createdAt     | DateTime |        Sí | Fecha creación               |
| updatedAt     | DateTime |        Sí | Fecha actualización          |
| archivedAt    | DateTime |        No | Fecha archivo                |
| archiveReason |   String |        No | Razón archivo                |
| metadata      |     Json |        No | Metadata segura              |

---

## 8.4. Reglas

```text id="po5b52"
- tenantId obligatorio.
- categoryCode único por tenant.
- categoryName requerido.
- archived no se usa para nuevos proveedores.
- proveedores históricos conservan referencia a categoría archivada.
```

---

# 9. Entidad `Supplier`

## 9.1. Propósito

Representa un proveedor administrativo del tenant.

Puede ser empresa, persona natural, contratista, servicio público, profesional o proveedor ocasional.

---

## 9.2. Tabla

```text id="hms12b"
suppliers
```

---

## 9.3. Campos

| Campo                           |     Tipo | Requerido | Descripción                                                              |
| ------------------------------- | -------: | --------: | ------------------------------------------------------------------------ |
| id                              |     UUID |        Sí | Identificador                                                            |
| tenantId                        |     UUID |        Sí | Tenant propietario                                                       |
| supplierCode                    |   String |        Sí | Código único por tenant                                                  |
| supplierName                    |   String |        Sí | Nombre comercial o legal                                                 |
| supplierType                    |     Enum |        Sí | company / individual / contractor / publicUtility / professional / other |
| identificationType              |   String |        No | Tipo de identificación                                                   |
| identificationNumberMasked      |   String |        No | Identificación enmascarada                                               |
| identificationNumberHash        |   String |        No | Hash de identificación                                                   |
| email                           |   String |        No | Email administrativo                                                     |
| phone                           |   String |        No | Teléfono                                                                 |
| address                         |   String |        No | Dirección                                                                |
| status                          |     Enum |        Sí | draft / active / inactive / blocked / archived                           |
| categoryId                      |     UUID |        No | Categoría del proveedor                                                  |
| defaultExpenseAccountId         |     UUID |        No | Cuenta contable de gasto por defecto                                     |
| defaultAccountsPayableAccountId |     UUID |        No | Cuenta contable por pagar por defecto                                    |
| createdBy                       |     UUID |        No | Usuario creador                                                          |
| updatedBy                       |     UUID |        No | Usuario actualizador                                                     |
| activatedBy                     |     UUID |        No | Usuario activador                                                        |
| disabledBy                      |     UUID |        No | Usuario deshabilitador                                                   |
| blockedBy                       |     UUID |        No | Usuario bloqueador                                                       |
| archivedBy                      |     UUID |        No | Usuario archivador                                                       |
| createdAt                       | DateTime |        Sí | Fecha creación                                                           |
| updatedAt                       | DateTime |        Sí | Fecha actualización                                                      |
| activatedAt                     | DateTime |        No | Fecha activación                                                         |
| disabledAt                      | DateTime |        No | Fecha deshabilitación                                                    |
| blockedAt                       | DateTime |        No | Fecha bloqueo                                                            |
| archivedAt                      | DateTime |        No | Fecha archivo                                                            |
| disableReason                   |   String |        No | Razón deshabilitación                                                    |
| blockReason                     |   String |        No | Razón bloqueo                                                            |
| archiveReason                   |   String |        No | Razón archivo                                                            |
| metadata                        |     Json |        No | Metadata segura                                                          |

---

## 9.4. Reglas

```text id="xajd3m"
- tenantId obligatorio.
- supplierCode único por tenant.
- supplierName requerido.
- active puede recibir nuevas obligaciones.
- inactive no debe recibir nuevas obligaciones.
- blocked no puede recibir nuevas órdenes aprobadas.
- archived conserva historial pero no opera.
- identificationNumber completo no debe exponerse.
- defaultExpenseAccountId debe pertenecer al mismo tenant si se usa.
- defaultAccountsPayableAccountId debe pertenecer al mismo tenant si se usa.
```

---

# 10. Entidad `SupplierContact`

## 10.1. Propósito

Representa contactos administrativos de un proveedor.

---

## 10.2. Tabla

```text id="uwkpso"
supplier_contacts
```

---

## 10.3. Campos

| Campo         |     Tipo | Requerido | Descripción                  |
| ------------- | -------: | --------: | ---------------------------- |
| id            |     UUID |        Sí | Identificador                |
| tenantId      |     UUID |        Sí | Tenant propietario           |
| supplierId    |     UUID |        Sí | Proveedor                    |
| contactName   |   String |        Sí | Nombre del contacto          |
| role          |   String |        No | Cargo o rol                  |
| email         |   String |        No | Email                        |
| phone         |   String |        No | Teléfono                     |
| isPrimary     |  Boolean |        Sí | Contacto principal           |
| status        |     Enum |        Sí | active / inactive / archived |
| createdBy     |     UUID |        No | Usuario creador              |
| updatedBy     |     UUID |        No | Usuario actualizador         |
| archivedBy    |     UUID |        No | Usuario archivador           |
| createdAt     | DateTime |        Sí | Fecha creación               |
| updatedAt     | DateTime |        Sí | Fecha actualización          |
| archivedAt    | DateTime |        No | Fecha archivo                |
| archiveReason |   String |        No | Razón archivo                |
| metadata      |     Json |        No | Metadata segura              |

---

## 10.4. Reglas

```text id="ne16hs"
- supplierId debe pertenecer al tenant.
- contacto primary único por supplier activo si la política lo exige.
- archived no aparece por defecto.
- no almacenar datos personales innecesarios.
```

---

# 11. Entidad `SupplierBankAccount`

## 11.1. Propósito

Representa una referencia bancaria protegida del proveedor.

No ejecuta pagos.

No almacena credenciales bancarias.

---

## 11.2. Tabla

```text id="n7s9cc"
supplier_bank_accounts
```

---

## 11.3. Campos

| Campo                           |        Tipo | Requerido | Descripción                                                |
| ------------------------------- | ----------: | --------: | ---------------------------------------------------------- |
| id                              |        UUID |        Sí | Identificador                                              |
| tenantId                        |        UUID |        Sí | Tenant propietario                                         |
| supplierId                      |        UUID |        Sí | Proveedor                                                  |
| bankName                        |      String |        Sí | Nombre del banco                                           |
| accountType                     | String/Enum |        No | Tipo de cuenta                                             |
| accountNumberMasked             |      String |        Sí | Número enmascarado                                         |
| accountNumberHash               |      String |        Sí | Hash del número                                            |
| beneficiaryName                 |      String |        Sí | Nombre beneficiario                                        |
| beneficiaryIdentificationMasked |      String |        No | Identificación enmascarada                                 |
| beneficiaryIdentificationHash   |      String |        No | Hash identificación                                        |
| currency                        |        Enum |        Sí | USD MVP                                                    |
| status                          |        Enum |        Sí | draft / verified / active / inactive / rejected / archived |
| verifiedAt                      |    DateTime |        No | Fecha verificación                                         |
| verifiedBy                      |        UUID |        No | Usuario verificador                                        |
| disabledAt                      |    DateTime |        No | Fecha deshabilitación                                      |
| disabledBy                      |        UUID |        No | Usuario deshabilitador                                     |
| archivedAt                      |    DateTime |        No | Fecha archivo                                              |
| archivedBy                      |        UUID |        No | Usuario archivador                                         |
| createdBy                       |        UUID |        No | Usuario creador                                            |
| updatedBy                       |        UUID |        No | Usuario actualizador                                       |
| createdAt                       |    DateTime |        Sí | Fecha creación                                             |
| updatedAt                       |    DateTime |        Sí | Fecha actualización                                        |
| disableReason                   |      String |        No | Razón deshabilitación                                      |
| rejectReason                    |      String |        No | Razón rechazo                                              |
| archiveReason                   |      String |        No | Razón archivo                                              |
| metadata                        |        Json |        No | Metadata segura                                            |

---

## 11.4. Reglas

```text id="lzlcjt"
- supplierId debe pertenecer al tenant.
- accountNumberMasked requerido.
- accountNumberHash requerido.
- accountNumberHash único por tenant/supplier si active.
- no almacenar número completo en texto plano.
- active puede usarse en orden de pago.
- rejected no puede usarse.
- archived no puede usarse.
- verificación debe auditarse.
```

---

# 12. Entidad `SupplierDocument`

## 12.1. Propósito

Representa un vínculo lógico entre proveedor y documento almacenado en Secure Document Storage.

---

## 12.2. Tabla

```text id="if0c5x"
supplier_documents
```

---

## 12.3. Campos

| Campo            |     Tipo | Requerido | Descripción                                                                                         |
| ---------------- | -------: | --------: | --------------------------------------------------------------------------------------------------- |
| id               |     UUID |        Sí | Identificador                                                                                       |
| tenantId         |     UUID |        Sí | Tenant propietario                                                                                  |
| supplierId       |     UUID |        Sí | Proveedor                                                                                           |
| secureDocumentId |     UUID |        Sí | Documento seguro                                                                                    |
| documentType     |     Enum |        Sí | identification / taxDocument / contract / certificate / invoice / receipt / paymentEvidence / other |
| description      |   String |        No | Descripción                                                                                         |
| status           |     Enum |        Sí | active / archived                                                                                   |
| createdBy        |     UUID |        No | Usuario creador                                                                                     |
| archivedBy       |     UUID |        No | Usuario archivador                                                                                  |
| createdAt        | DateTime |        Sí | Fecha creación                                                                                      |
| archivedAt       | DateTime |        No | Fecha archivo                                                                                       |
| archiveReason    |   String |        No | Razón archivo                                                                                       |
| metadata         |     Json |        No | Metadata segura                                                                                     |

---

## 12.4. Reglas

```text id="nb0bwc"
- supplierId debe pertenecer al tenant.
- secureDocumentId debe pertenecer al tenant.
- no exponer storageKey.
- no exponer signedUrl persistente.
- descarga debe pasar por Secure Document Storage.
- archived no elimina archivo físico.
```

---

# 13. Entidad `SupplierPayable`

## 13.1. Propósito

Representa una obligación por pagar a un proveedor.

Puede ser factura, recibo, nota, contrato, servicio básico u obligación manual.

---

## 13.2. Tabla

```text id="rylhmz"
supplier_payables
```

---

## 13.3. Campos

| Campo                            |     Tipo | Requerido | Descripción                                                                            |
| -------------------------------- | -------: | --------: | -------------------------------------------------------------------------------------- |
| id                               |     UUID |        Sí | Identificador                                                                          |
| tenantId                         |     UUID |        Sí | Tenant propietario                                                                     |
| supplierId                       |     UUID |        Sí | Proveedor                                                                              |
| payableNumber                    |   String |        Sí | Número interno                                                                         |
| externalDocumentNumber           |   String |        No | Número externo del documento                                                           |
| externalDocumentNumberNormalized |   String |        No | Número externo normalizado                                                             |
| documentType                     |     Enum |        Sí | invoice / receipt / note / contractObligation / manualObligation / utilityBill / other |
| issueDate                        | DateTime |        No | Fecha emisión                                                                          |
| receivedDate                     | DateTime |        No | Fecha recepción                                                                        |
| dueDate                          | DateTime |        No | Fecha vencimiento                                                                      |
| description                      |   String |        Sí | Descripción                                                                            |
| subtotalAmount                   |  Decimal |        Sí | Subtotal                                                                               |
| taxAmount                        |  Decimal |        Sí | Impuesto                                                                               |
| discountAmount                   |  Decimal |        Sí | Descuento                                                                              |
| totalAmount                      |  Decimal |        Sí | Total                                                                                  |
| outstandingAmount                |  Decimal |        Sí | Saldo pendiente                                                                        |
| currency                         |     Enum |        Sí | USD                                                                                    |
| status                           |     Enum |        Sí | Estado                                                                                 |
| categoryId                       |     UUID |        No | Categoría                                                                              |
| expenseAccountId                 |     UUID |        No | Cuenta contable gasto                                                                  |
| accountsPayableAccountId         |     UUID |        No | Cuenta contable por pagar                                                              |
| secureDocumentId                 |     UUID |        No | Documento principal                                                                    |
| duplicateFingerprint             |   String |        No | Huella de duplicado                                                                    |
| approvalStatus                   |     Enum |        Sí | pending / approved / rejected / cancelled                                              |
| approvedAt                       | DateTime |        No | Fecha aprobación                                                                       |
| approvedBy                       |     UUID |        No | Aprobador                                                                              |
| rejectedAt                       | DateTime |        No | Fecha rechazo                                                                          |
| rejectedBy                       |     UUID |        No | Usuario rechazo                                                                        |
| cancelledAt                      | DateTime |        No | Fecha cancelación                                                                      |
| cancelledBy                      |     UUID |        No | Usuario cancelación                                                                    |
| voidedAt                         | DateTime |        No | Fecha anulación                                                                        |
| voidedBy                         |     UUID |        No | Usuario anulación                                                                      |
| archivedAt                       | DateTime |        No | Fecha archivo                                                                          |
| archivedBy                       |     UUID |        No | Usuario archivador                                                                     |
| createdBy                        |     UUID |        No | Usuario creador                                                                        |
| updatedBy                        |     UUID |        No | Usuario actualizador                                                                   |
| createdAt                        | DateTime |        Sí | Fecha creación                                                                         |
| updatedAt                        | DateTime |        Sí | Fecha actualización                                                                    |
| rejectReason                     |   String |        No | Razón rechazo                                                                          |
| cancelReason                     |   String |        No | Razón cancelación                                                                      |
| voidReason                       |   String |        No | Razón anulación                                                                        |
| archiveReason                    |   String |        No | Razón archivo                                                                          |
| metadata                         |     Json |        No | Metadata segura                                                                        |

---

## 13.4. Reglas

```text id="w3p9r8"
- supplierId debe pertenecer al tenant.
- supplier debe estar active para crear nuevas obligaciones.
- payableNumber único por tenant.
- totalAmount = subtotalAmount + taxAmount - discountAmount.
- outstandingAmount inicia igual a totalAmount.
- outstandingAmount nunca puede ser negativo.
- approved habilita pago.
- rejected no se paga.
- cancelled no se paga.
- voided no se paga.
- paid requiere outstandingAmount = 0.
- partiallyPaid requiere outstandingAmount > 0 y < totalAmount.
- duplicateFingerprint se calcula server-side.
- secureDocumentId no expone storageKey.
```

---

# 14. Entidad `SupplierPayableApproval`

## 14.1. Propósito

Registra la aprobación o rechazo de una obligación por pagar.

Permite trazabilidad aunque el MVP use aprobación simple.

---

## 14.2. Tabla

```text id="zz9rz3"
supplier_payable_approvals
```

---

## 14.3. Campos

| Campo             |     Tipo | Requerido | Descripción                               |
| ----------------- | -------: | --------: | ----------------------------------------- |
| id                |     UUID |        Sí | Identificador                             |
| tenantId          |     UUID |        Sí | Tenant propietario                        |
| supplierPayableId |     UUID |        Sí | Obligación                                |
| approvalStep      |      Int |        Sí | Paso de aprobación                        |
| approvalStatus    |     Enum |        Sí | pending / approved / rejected / cancelled |
| requestedBy       |     UUID |        No | Solicitante                               |
| approvedBy        |     UUID |        No | Aprobador                                 |
| rejectedBy        |     UUID |        No | Rechazador                                |
| requestedAt       | DateTime |        Sí | Fecha solicitud                           |
| approvedAt        | DateTime |        No | Fecha aprobación                          |
| rejectedAt        | DateTime |        No | Fecha rechazo                             |
| cancelledAt       | DateTime |        No | Fecha cancelación                         |
| reason            |   String |        No | Razón o comentario                        |
| metadata          |     Json |        No | Metadata segura                           |

---

## 14.4. Reglas

```text id="wyluyc"
- supplierPayableId debe pertenecer al tenant.
- pending puede pasar a approved, rejected o cancelled.
- approved requiere approvedAt y approvedBy.
- rejected requiere rejectedAt y rejectedBy.
- aprobación debe auditarse.
```

---

# 15. Entidad `SupplierPaymentOrder`

## 15.1. Propósito

Representa una orden interna para pagar una o varias obligaciones aprobadas.

No ejecuta transferencia bancaria.

---

## 15.2. Tabla

```text id="zv5bpd"
supplier_payment_orders
```

---

## 15.3. Campos

| Campo                    |     Tipo | Requerido | Descripción                               |
| ------------------------ | -------: | --------: | ----------------------------------------- |
| id                       |     UUID |        Sí | Identificador                             |
| tenantId                 |     UUID |        Sí | Tenant propietario                        |
| paymentOrderNumber       |   String |        Sí | Número interno                            |
| supplierId               |     UUID |        Sí | Proveedor                                 |
| paymentMethod            |     Enum |        Sí | bankTransferManual / cash / check / other |
| plannedPaymentDate       | DateTime |        No | Fecha planificada                         |
| actualPaymentDate        | DateTime |        No | Fecha real                                |
| description              |   String |        No | Descripción                               |
| totalAmount              |  Decimal |        Sí | Total calculado                           |
| paidAmount               |  Decimal |        Sí | Monto pagado registrado                   |
| currency                 |     Enum |        Sí | USD                                       |
| status                   |     Enum |        Sí | Estado                                    |
| supplierBankAccountId    |     UUID |        No | Cuenta bancaria proveedor                 |
| bankAccountId            |     UUID |        No | Cuenta bancaria interna del tenant        |
| paymentReference         |   String |        No | Referencia de pago                        |
| paymentReferenceHash     |   String |        No | Hash de referencia                        |
| secureDocumentId         |     UUID |        No | Evidencia/documento principal             |
| accountingJournalEntryId |     UUID |        No | JournalEntry relacionado                  |
| bankTransactionId        |     UUID |        No | Movimiento bancario relacionado           |
| reconciliationMatchId    |     UUID |        No | Match relacionado                         |
| approvedAt               | DateTime |        No | Fecha aprobación                          |
| approvedBy               |     UUID |        No | Usuario aprobador                         |
| rejectedAt               | DateTime |        No | Fecha rechazo                             |
| rejectedBy               |     UUID |        No | Usuario rechazo                           |
| scheduledAt              | DateTime |        No | Fecha scheduling                          |
| scheduledBy              |     UUID |        No | Usuario scheduling                        |
| paidAt                   | DateTime |        No | Fecha marcado como pagado                 |
| paidBy                   |     UUID |        No | Usuario pago                              |
| voidedAt                 | DateTime |        No | Fecha anulación                           |
| voidedBy                 |     UUID |        No | Usuario anulación                         |
| cancelledAt              | DateTime |        No | Fecha cancelación                         |
| cancelledBy              |     UUID |        No | Usuario cancelación                       |
| reversedAt               | DateTime |        No | Fecha reverso                             |
| reversedBy               |     UUID |        No | Usuario reverso                           |
| archivedAt               | DateTime |        No | Fecha archivo                             |
| archivedBy               |     UUID |        No | Usuario archivo                           |
| createdBy                |     UUID |        No | Usuario creador                           |
| updatedBy                |     UUID |        No | Usuario actualizador                      |
| createdAt                | DateTime |        Sí | Fecha creación                            |
| updatedAt                | DateTime |        Sí | Fecha actualización                       |
| rejectReason             |   String |        No | Razón rechazo                             |
| voidReason               |   String |        No | Razón anulación                           |
| cancelReason             |   String |        No | Razón cancelación                         |
| reverseReason            |   String |        No | Razón reverso                             |
| archiveReason            |   String |        No | Razón archivo                             |
| metadata                 |     Json |        No | Metadata segura                           |

---

## 15.4. Reglas

```text id="kxh5qo"
- supplierId debe pertenecer al tenant.
- supplier debe estar active para aprobar orden.
- supplier blocked no puede recibir orden aprobada.
- paymentOrderNumber único por tenant.
- debe tener al menos un item para submit/approve/paid.
- totalAmount se calcula desde items.
- paidAmount no puede exceder totalAmount.
- mark-paid requiere approved o scheduled.
- mark-paid requiere referencia o evidencia.
- no ejecuta transferencia bancaria.
- paid no se edita destructivamente.
- bankTransactionId no confirma conciliación.
- reconciliationMatchId no se crea desde este módulo.
```

---

# 16. Entidad `SupplierPaymentOrderItem`

## 16.1. Propósito

Representa el detalle de una orden de pago, vinculando una obligación con un monto a pagar.

---

## 16.2. Tabla

```text id="rwzi2l"
supplier_payment_order_items
```

---

## 16.3. Campos

| Campo                  |     Tipo | Requerido | Descripción        |
| ---------------------- | -------: | --------: | ------------------ |
| id                     |     UUID |        Sí | Identificador      |
| tenantId               |     UUID |        Sí | Tenant propietario |
| supplierPaymentOrderId |     UUID |        Sí | Orden de pago      |
| supplierPayableId      |     UUID |        Sí | Obligación         |
| lineNumber             |      Int |        Sí | Número de línea    |
| amount                 |  Decimal |        Sí | Monto del ítem     |
| currency               |     Enum |        Sí | USD                |
| description            |   String |        No | Descripción        |
| createdAt              | DateTime |        Sí | Fecha creación     |
| metadata               |     Json |        No | Metadata segura    |

---

## 16.4. Reglas

```text id="ltdncq"
- supplierPaymentOrderId debe pertenecer al tenant.
- supplierPayableId debe pertenecer al tenant.
- payable debe estar approved o partiallyPaid según política.
- amount > 0.
- amount no puede exceder outstandingAmount.
- lineNumber único por orden.
- currency debe coincidir con la orden.
```

---

# 17. Entidad `SupplierPaymentEvidence`

## 17.1. Propósito

Representa evidencia documental o referencial de un pago a proveedor.

---

## 17.2. Tabla

```text id="m5xvwf"
supplier_payment_evidence
```

---

## 17.3. Campos

| Campo                  |     Tipo | Requerido | Descripción                                                                        |
| ---------------------- | -------: | --------: | ---------------------------------------------------------------------------------- |
| id                     |     UUID |        Sí | Identificador                                                                      |
| tenantId               |     UUID |        Sí | Tenant propietario                                                                 |
| supplierPaymentOrderId |     UUID |        Sí | Orden de pago                                                                      |
| secureDocumentId       |     UUID |        No | Documento seguro                                                                   |
| evidenceType           |     Enum |        Sí | bankReceipt / cashReceipt / checkCopy / providerReceipt / internalDocument / other |
| paymentReference       |   String |        No | Referencia                                                                         |
| paymentReferenceHash   |   String |        No | Hash de referencia                                                                 |
| paymentDate            | DateTime |        No | Fecha pago                                                                         |
| amount                 |  Decimal |        No | Monto evidenciado                                                                  |
| currency               |     Enum |        Sí | USD                                                                                |
| status                 |     Enum |        Sí | uploaded / verified / rejected / archived                                          |
| createdBy              |     UUID |        No | Usuario creador                                                                    |
| verifiedBy             |     UUID |        No | Usuario verificador                                                                |
| rejectedBy             |     UUID |        No | Usuario rechazador                                                                 |
| archivedBy             |     UUID |        No | Usuario archivador                                                                 |
| createdAt              | DateTime |        Sí | Fecha creación                                                                     |
| verifiedAt             | DateTime |        No | Fecha verificación                                                                 |
| rejectedAt             | DateTime |        No | Fecha rechazo                                                                      |
| archivedAt             | DateTime |        No | Fecha archivo                                                                      |
| rejectReason           |   String |        No | Razón rechazo                                                                      |
| archiveReason          |   String |        No | Razón archivo                                                                      |
| metadata               |     Json |        No | Metadata segura                                                                    |

---

## 17.4. Reglas

```text id="coqfnl"
- supplierPaymentOrderId debe pertenecer al tenant.
- secureDocumentId debe pertenecer al tenant si existe.
- evidence rejected no valida pago.
- evidence verified puede soportar mark-paid.
- no exponer storageKey.
- no almacenar payload binario en JSON.
```

---

# 18. Entidad `SupplierAccountingLink`

## 18.1. Propósito

Representa el vínculo entre Supplier Payments y Accounting Ledger.

Permite trazabilidad desde payables y payment orders hacia JournalEntries.

---

## 18.2. Tabla

```text id="r6lmga"
supplier_accounting_links
```

---

## 18.3. Campos

| Campo                  |     Tipo | Requerido | Descripción                                                                      |
| ---------------------- | -------: | --------: | -------------------------------------------------------------------------------- |
| id                     |     UUID |        Sí | Identificador                                                                    |
| tenantId               |     UUID |        Sí | Tenant propietario                                                               |
| supplierPayableId      |     UUID |        No | Obligación vinculada                                                             |
| supplierPaymentOrderId |     UUID |        No | Orden vinculada                                                                  |
| journalEntryId         |     UUID |        No | JournalEntry                                                                     |
| accountingEventType    |     Enum |        Sí | payableApproved / paymentRecorded / paymentVoided / paymentReversed / adjustment |
| status                 |     Enum |        Sí | active / failed / reversed / archived                                            |
| errorCode              |   String |        No | Código error                                                                     |
| errorMessage           |   String |        No | Error sanitizado                                                                 |
| createdAt              | DateTime |        Sí | Fecha creación                                                                   |
| archivedAt             | DateTime |        No | Fecha archivo                                                                    |
| archivedBy             |     UUID |        No | Usuario archivador                                                               |
| metadata               |     Json |        No | Metadata segura                                                                  |

---

## 18.4. Reglas

```text id="efbwi5"
- supplierPayableId o supplierPaymentOrderId debe existir.
- journalEntryId debe pertenecer al tenant si existe.
- no editar JournalEntry posted desde Supplier Payments.
- failed requiere errorCode/errorMessage sanitizado.
- active mantiene trazabilidad contable.
```

---

# 19. Entidad `SupplierBankReconciliationLink`

## 19.1. Propósito

Representa el vínculo administrativo entre una orden de pago a proveedor y una entidad de conciliación bancaria.

---

## 19.2. Tabla

```text id="n8flfa"
supplier_bank_reconciliation_links
```

---

## 19.3. Campos

| Campo                  |     Tipo | Requerido | Descripción                  |
| ---------------------- | -------: | --------: | ---------------------------- |
| id                     |     UUID |        Sí | Identificador                |
| tenantId               |     UUID |        Sí | Tenant propietario           |
| supplierPaymentOrderId |     UUID |        Sí | Orden de pago                |
| bankTransactionId      |     UUID |        No | Movimiento bancario          |
| reconciliationMatchId  |     UUID |        No | Match de conciliación        |
| status                 |     Enum |        Sí | active / unlinked / archived |
| linkedAt               | DateTime |        Sí | Fecha vínculo                |
| linkedBy               |     UUID |        No | Usuario vinculador           |
| unlinkedAt             | DateTime |        No | Fecha desvinculación         |
| unlinkedBy             |     UUID |        No | Usuario desvinculador        |
| archivedAt             | DateTime |        No | Fecha archivo                |
| archivedBy             |     UUID |        No | Usuario archivador           |
| unlinkReason           |   String |        No | Razón desvinculación         |
| archiveReason          |   String |        No | Razón archivo                |
| metadata               |     Json |        No | Metadata segura              |

---

## 19.4. Reglas

```text id="z8c0cl"
- supplierPaymentOrderId debe pertenecer al tenant.
- bankTransactionId debe pertenecer al tenant si existe.
- reconciliationMatchId debe pertenecer al tenant si existe.
- al menos bankTransactionId o reconciliationMatchId debe existir.
- no crea ReconciliationMatch final.
- no marca BankTransaction matched.
- no cierra ReconciliationSession.
- unlink debe auditarse.
```

---

## 20. Enums del modelo

### 20.1. `SupplierStatus`

```text id="vy0ajt"
draft
active
inactive
blocked
archived
```

---

### 20.2. `SupplierType`

```text id="szpjau"
company
individual
contractor
publicUtility
professional
other
```

---

### 20.3. `SupplierCategoryStatus`

```text id="yzdf5a"
active
inactive
archived
```

---

### 20.4. `SupplierContactStatus`

```text id="zt61tn"
active
inactive
archived
```

---

### 20.5. `SupplierBankAccountStatus`

```text id="i9yhzh"
draft
verified
active
inactive
rejected
archived
```

---

### 20.6. `SupplierDocumentType`

```text id="vgi6t5"
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

### 20.7. `SupplierDocumentStatus`

```text id="amhwgt"
active
archived
```

---

### 20.8. `SupplierPayableDocumentType`

```text id="yion2j"
invoice
receipt
note
contractObligation
manualObligation
utilityBill
other
```

---

### 20.9. `SupplierPayableStatus`

```text id="bl5tel"
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

### 20.10. `SupplierPayableApprovalStatus`

```text id="cz84ia"
pending
approved
rejected
cancelled
```

---

### 20.11. `SupplierPaymentOrderStatus`

```text id="k837vl"
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

### 20.12. `SupplierPaymentMethod`

```text id="yo65hv"
bankTransferManual
cash
check
debitCard
creditCard
providerPayment
other
```

MVP recomendado:

```text id="c39nn2"
bankTransferManual
cash
check
other
```

---

### 20.13. `SupplierPaymentEvidenceType`

```text id="mqc6xx"
bankReceipt
cashReceipt
checkCopy
providerReceipt
internalDocument
other
```

---

### 20.14. `SupplierPaymentEvidenceStatus`

```text id="h854da"
uploaded
verified
rejected
archived
```

---

### 20.15. `SupplierAccountingEventType`

```text id="j7v0g9"
payableApproved
paymentRecorded
paymentVoided
paymentReversed
adjustment
```

---

### 20.16. `SupplierAccountingLinkStatus`

```text id="kl6u18"
active
failed
reversed
archived
```

---

### 20.17. `SupplierBankReconciliationLinkStatus`

```text id="g8ypqn"
active
unlinked
archived
```

---

### 20.18. `Currency`

```text id="o8dh9z"
USD
```

---

## 21. Prisma schema preliminar

> Nota: este esquema es preliminar. Debe ajustarse a las convenciones exactas del repositorio RESIDENT Core, nombres existentes de modelos, enums globales y relaciones ya creadas.

```prisma id="c7jfph"
enum SupplierStatus {
  DRAFT     @map("draft")
  ACTIVE    @map("active")
  INACTIVE  @map("inactive")
  BLOCKED   @map("blocked")
  ARCHIVED  @map("archived")

  @@map("supplier_status")
}

enum SupplierType {
  COMPANY        @map("company")
  INDIVIDUAL     @map("individual")
  CONTRACTOR     @map("contractor")
  PUBLIC_UTILITY @map("publicUtility")
  PROFESSIONAL   @map("professional")
  OTHER          @map("other")

  @@map("supplier_type")
}

enum SupplierCategoryStatus {
  ACTIVE    @map("active")
  INACTIVE  @map("inactive")
  ARCHIVED  @map("archived")

  @@map("supplier_category_status")
}

enum SupplierContactStatus {
  ACTIVE    @map("active")
  INACTIVE  @map("inactive")
  ARCHIVED  @map("archived")

  @@map("supplier_contact_status")
}

enum SupplierBankAccountStatus {
  DRAFT     @map("draft")
  VERIFIED  @map("verified")
  ACTIVE    @map("active")
  INACTIVE  @map("inactive")
  REJECTED  @map("rejected")
  ARCHIVED  @map("archived")

  @@map("supplier_bank_account_status")
}

enum SupplierDocumentType {
  IDENTIFICATION    @map("identification")
  TAX_DOCUMENT      @map("taxDocument")
  CONTRACT          @map("contract")
  CERTIFICATE       @map("certificate")
  INVOICE           @map("invoice")
  RECEIPT           @map("receipt")
  PAYMENT_EVIDENCE  @map("paymentEvidence")
  OTHER             @map("other")

  @@map("supplier_document_type")
}

enum SupplierDocumentStatus {
  ACTIVE    @map("active")
  ARCHIVED  @map("archived")

  @@map("supplier_document_status")
}

enum SupplierPayableDocumentType {
  INVOICE              @map("invoice")
  RECEIPT              @map("receipt")
  NOTE                 @map("note")
  CONTRACT_OBLIGATION  @map("contractObligation")
  MANUAL_OBLIGATION    @map("manualObligation")
  UTILITY_BILL         @map("utilityBill")
  OTHER                @map("other")

  @@map("supplier_payable_document_type")
}

enum SupplierPayableStatus {
  DRAFT                  @map("draft")
  PENDING_REVIEW         @map("pendingReview")
  APPROVED               @map("approved")
  REJECTED               @map("rejected")
  SCHEDULED_FOR_PAYMENT  @map("scheduledForPayment")
  PARTIALLY_PAID         @map("partiallyPaid")
  PAID                   @map("paid")
  CANCELLED              @map("cancelled")
  VOIDED                 @map("voided")
  ARCHIVED               @map("archived")

  @@map("supplier_payable_status")
}

enum SupplierPayableApprovalStatus {
  PENDING    @map("pending")
  APPROVED   @map("approved")
  REJECTED   @map("rejected")
  CANCELLED  @map("cancelled")

  @@map("supplier_payable_approval_status")
}

enum SupplierPaymentOrderStatus {
  DRAFT             @map("draft")
  PENDING_APPROVAL  @map("pendingApproval")
  APPROVED          @map("approved")
  REJECTED          @map("rejected")
  SCHEDULED         @map("scheduled")
  PAID              @map("paid")
  PARTIALLY_PAID    @map("partiallyPaid")
  FAILED            @map("failed")
  VOIDED            @map("voided")
  CANCELLED         @map("cancelled")
  ARCHIVED          @map("archived")

  @@map("supplier_payment_order_status")
}

enum SupplierPaymentMethod {
  BANK_TRANSFER_MANUAL  @map("bankTransferManual")
  CASH                  @map("cash")
  CHECK                 @map("check")
  DEBIT_CARD            @map("debitCard")
  CREDIT_CARD           @map("creditCard")
  PROVIDER_PAYMENT      @map("providerPayment")
  OTHER                 @map("other")

  @@map("supplier_payment_method")
}

enum SupplierPaymentEvidenceType {
  BANK_RECEIPT       @map("bankReceipt")
  CASH_RECEIPT       @map("cashReceipt")
  CHECK_COPY         @map("checkCopy")
  PROVIDER_RECEIPT   @map("providerReceipt")
  INTERNAL_DOCUMENT  @map("internalDocument")
  OTHER              @map("other")

  @@map("supplier_payment_evidence_type")
}

enum SupplierPaymentEvidenceStatus {
  UPLOADED  @map("uploaded")
  VERIFIED  @map("verified")
  REJECTED  @map("rejected")
  ARCHIVED  @map("archived")

  @@map("supplier_payment_evidence_status")
}

enum SupplierAccountingEventType {
  PAYABLE_APPROVED  @map("payableApproved")
  PAYMENT_RECORDED  @map("paymentRecorded")
  PAYMENT_VOIDED    @map("paymentVoided")
  PAYMENT_REVERSED  @map("paymentReversed")
  ADJUSTMENT         @map("adjustment")

  @@map("supplier_accounting_event_type")
}

enum SupplierAccountingLinkStatus {
  ACTIVE    @map("active")
  FAILED    @map("failed")
  REVERSED  @map("reversed")
  ARCHIVED  @map("archived")

  @@map("supplier_accounting_link_status")
}

enum SupplierBankReconciliationLinkStatus {
  ACTIVE    @map("active")
  UNLINKED  @map("unlinked")
  ARCHIVED  @map("archived")

  @@map("supplier_bank_reconciliation_link_status")
}

model SupplierCategory {
  id            String                 @id @default(uuid()) @db.Uuid
  tenantId      String                 @map("tenant_id") @db.Uuid
  categoryCode  String                 @map("category_code") @db.VarChar(80)
  categoryName  String                 @map("category_name") @db.VarChar(160)
  description   String?                @db.Text
  status        SupplierCategoryStatus @default(ACTIVE)

  createdBy     String?                @map("created_by") @db.Uuid
  updatedBy     String?                @map("updated_by") @db.Uuid
  archivedBy    String?                @map("archived_by") @db.Uuid

  createdAt     DateTime               @default(now()) @map("created_at")
  updatedAt     DateTime               @updatedAt @map("updated_at")
  archivedAt    DateTime?              @map("archived_at")
  archiveReason String?                @map("archive_reason") @db.Text

  metadata      Json?

  tenant        Tenant                 @relation(fields: [tenantId], references: [id])
  suppliers     Supplier[]
  payables      SupplierPayable[]

  @@index([tenantId])
  @@index([tenantId, categoryCode])
  @@index([tenantId, categoryName])
  @@index([tenantId, status])
  @@index([createdAt])
  @@map("supplier_categories")
}

model Supplier {
  id                              String         @id @default(uuid()) @db.Uuid
  tenantId                        String         @map("tenant_id") @db.Uuid
  supplierCode                    String         @map("supplier_code") @db.VarChar(80)
  supplierName                    String         @map("supplier_name") @db.VarChar(200)
  supplierType                    SupplierType   @map("supplier_type")
  identificationType              String?        @map("identification_type") @db.VarChar(60)
  identificationNumberMasked      String?        @map("identification_number_masked") @db.VarChar(80)
  identificationNumberHash        String?        @map("identification_number_hash") @db.VarChar(128)
  email                           String?        @db.VarChar(160)
  phone                           String?        @db.VarChar(60)
  address                         String?        @db.Text
  status                          SupplierStatus @default(DRAFT)

  categoryId                      String?        @map("category_id") @db.Uuid
  defaultExpenseAccountId         String?        @map("default_expense_account_id") @db.Uuid
  defaultAccountsPayableAccountId String?        @map("default_accounts_payable_account_id") @db.Uuid

  createdBy                       String?        @map("created_by") @db.Uuid
  updatedBy                       String?        @map("updated_by") @db.Uuid
  activatedBy                     String?        @map("activated_by") @db.Uuid
  disabledBy                      String?        @map("disabled_by") @db.Uuid
  blockedBy                       String?        @map("blocked_by") @db.Uuid
  archivedBy                      String?        @map("archived_by") @db.Uuid

  createdAt                       DateTime       @default(now()) @map("created_at")
  updatedAt                       DateTime       @updatedAt @map("updated_at")
  activatedAt                     DateTime?      @map("activated_at")
  disabledAt                      DateTime?      @map("disabled_at")
  blockedAt                       DateTime?      @map("blocked_at")
  archivedAt                      DateTime?      @map("archived_at")

  disableReason                   String?        @map("disable_reason") @db.Text
  blockReason                     String?        @map("block_reason") @db.Text
  archiveReason                   String?        @map("archive_reason") @db.Text
  metadata                        Json?

  tenant                          Tenant            @relation(fields: [tenantId], references: [id])
  category                        SupplierCategory? @relation(fields: [categoryId], references: [id])
  contacts                        SupplierContact[]
  bankAccounts                    SupplierBankAccount[]
  documents                       SupplierDocument[]
  payables                        SupplierPayable[]
  paymentOrders                   SupplierPaymentOrder[]

  @@index([tenantId])
  @@index([tenantId, supplierCode])
  @@index([tenantId, supplierName])
  @@index([tenantId, supplierType])
  @@index([tenantId, identificationNumberHash])
  @@index([tenantId, categoryId])
  @@index([tenantId, status])
  @@index([createdAt])
  @@map("suppliers")
}

model SupplierContact {
  id            String                @id @default(uuid()) @db.Uuid
  tenantId      String                @map("tenant_id") @db.Uuid
  supplierId    String                @map("supplier_id") @db.Uuid
  contactName   String                @map("contact_name") @db.VarChar(160)
  role          String?               @db.VarChar(120)
  email         String?               @db.VarChar(160)
  phone         String?               @db.VarChar(60)
  isPrimary     Boolean               @default(false) @map("is_primary")
  status        SupplierContactStatus @default(ACTIVE)

  createdBy     String?               @map("created_by") @db.Uuid
  updatedBy     String?               @map("updated_by") @db.Uuid
  archivedBy    String?               @map("archived_by") @db.Uuid

  createdAt     DateTime              @default(now()) @map("created_at")
  updatedAt     DateTime              @updatedAt @map("updated_at")
  archivedAt    DateTime?             @map("archived_at")
  archiveReason String?               @map("archive_reason") @db.Text
  metadata      Json?

  tenant        Tenant                @relation(fields: [tenantId], references: [id])
  supplier      Supplier              @relation(fields: [supplierId], references: [id])

  @@index([tenantId])
  @@index([tenantId, supplierId])
  @@index([tenantId, email])
  @@index([tenantId, isPrimary])
  @@index([tenantId, status])
  @@index([createdAt])
  @@map("supplier_contacts")
}

model SupplierBankAccount {
  id                               String                    @id @default(uuid()) @db.Uuid
  tenantId                         String                    @map("tenant_id") @db.Uuid
  supplierId                       String                    @map("supplier_id") @db.Uuid
  bankName                         String                    @map("bank_name") @db.VarChar(160)
  accountType                      String?                   @map("account_type") @db.VarChar(80)
  accountNumberMasked              String                    @map("account_number_masked") @db.VarChar(80)
  accountNumberHash                String                    @map("account_number_hash") @db.VarChar(128)
  beneficiaryName                  String                    @map("beneficiary_name") @db.VarChar(200)
  beneficiaryIdentificationMasked  String?                   @map("beneficiary_identification_masked") @db.VarChar(80)
  beneficiaryIdentificationHash    String?                   @map("beneficiary_identification_hash") @db.VarChar(128)
  currency                         Currency                  @default(USD)
  status                           SupplierBankAccountStatus @default(DRAFT)

  verifiedAt                       DateTime?                 @map("verified_at")
  verifiedBy                       String?                   @map("verified_by") @db.Uuid
  disabledAt                       DateTime?                 @map("disabled_at")
  disabledBy                       String?                   @map("disabled_by") @db.Uuid
  archivedAt                       DateTime?                 @map("archived_at")
  archivedBy                       String?                   @map("archived_by") @db.Uuid
  createdBy                        String?                   @map("created_by") @db.Uuid
  updatedBy                        String?                   @map("updated_by") @db.Uuid

  createdAt                        DateTime                  @default(now()) @map("created_at")
  updatedAt                        DateTime                  @updatedAt @map("updated_at")
  disableReason                    String?                   @map("disable_reason") @db.Text
  rejectReason                     String?                   @map("reject_reason") @db.Text
  archiveReason                    String?                   @map("archive_reason") @db.Text
  metadata                         Json?

  tenant                           Tenant                    @relation(fields: [tenantId], references: [id])
  supplier                         Supplier                  @relation(fields: [supplierId], references: [id])
  paymentOrders                    SupplierPaymentOrder[]

  @@index([tenantId])
  @@index([tenantId, supplierId])
  @@index([tenantId, bankName])
  @@index([tenantId, accountNumberHash])
  @@index([tenantId, status])
  @@index([createdAt])
  @@map("supplier_bank_accounts")
}

model SupplierDocument {
  id               String                 @id @default(uuid()) @db.Uuid
  tenantId         String                 @map("tenant_id") @db.Uuid
  supplierId       String                 @map("supplier_id") @db.Uuid
  secureDocumentId String                 @map("secure_document_id") @db.Uuid
  documentType     SupplierDocumentType   @map("document_type")
  description      String?                @db.Text
  status           SupplierDocumentStatus @default(ACTIVE)

  createdBy        String?                @map("created_by") @db.Uuid
  archivedBy       String?                @map("archived_by") @db.Uuid
  createdAt        DateTime               @default(now()) @map("created_at")
  archivedAt       DateTime?              @map("archived_at")
  archiveReason    String?                @map("archive_reason") @db.Text
  metadata         Json?

  tenant           Tenant                 @relation(fields: [tenantId], references: [id])
  supplier         Supplier               @relation(fields: [supplierId], references: [id])
  secureDocument   SecureDocument         @relation(fields: [secureDocumentId], references: [id])

  @@index([tenantId])
  @@index([tenantId, supplierId])
  @@index([tenantId, secureDocumentId])
  @@index([tenantId, documentType])
  @@index([tenantId, status])
  @@index([createdAt])
  @@map("supplier_documents")
}

model SupplierPayable {
  id                            String                         @id @default(uuid()) @db.Uuid
  tenantId                      String                         @map("tenant_id") @db.Uuid
  supplierId                    String                         @map("supplier_id") @db.Uuid
  payableNumber                 String                         @map("payable_number") @db.VarChar(80)
  externalDocumentNumber        String?                        @map("external_document_number") @db.VarChar(120)
  externalDocumentNumberNormalized String?                     @map("external_document_number_normalized") @db.VarChar(120)
  documentType                  SupplierPayableDocumentType    @map("document_type")
  issueDate                     DateTime?                      @map("issue_date")
  receivedDate                  DateTime?                      @map("received_date")
  dueDate                       DateTime?                      @map("due_date")
  description                   String                         @db.Text

  subtotalAmount                Decimal                        @default(0) @map("subtotal_amount") @db.Decimal(12, 2)
  taxAmount                     Decimal                        @default(0) @map("tax_amount") @db.Decimal(12, 2)
  discountAmount                Decimal                        @default(0) @map("discount_amount") @db.Decimal(12, 2)
  totalAmount                   Decimal                        @default(0) @map("total_amount") @db.Decimal(12, 2)
  outstandingAmount             Decimal                        @default(0) @map("outstanding_amount") @db.Decimal(12, 2)
  currency                      Currency                       @default(USD)

  status                        SupplierPayableStatus          @default(DRAFT)
  approvalStatus                SupplierPayableApprovalStatus  @default(PENDING) @map("approval_status")
  categoryId                    String?                        @map("category_id") @db.Uuid
  expenseAccountId              String?                        @map("expense_account_id") @db.Uuid
  accountsPayableAccountId      String?                        @map("accounts_payable_account_id") @db.Uuid
  secureDocumentId              String?                        @map("secure_document_id") @db.Uuid
  duplicateFingerprint          String?                        @map("duplicate_fingerprint") @db.VarChar(128)

  approvedAt                    DateTime?                      @map("approved_at")
  approvedBy                    String?                        @map("approved_by") @db.Uuid
  rejectedAt                    DateTime?                      @map("rejected_at")
  rejectedBy                    String?                        @map("rejected_by") @db.Uuid
  cancelledAt                   DateTime?                      @map("cancelled_at")
  cancelledBy                   String?                        @map("cancelled_by") @db.Uuid
  voidedAt                      DateTime?                      @map("voided_at")
  voidedBy                      String?                        @map("voided_by") @db.Uuid
  archivedAt                    DateTime?                      @map("archived_at")
  archivedBy                    String?                        @map("archived_by") @db.Uuid
  createdBy                     String?                        @map("created_by") @db.Uuid
  updatedBy                     String?                        @map("updated_by") @db.Uuid

  createdAt                     DateTime                       @default(now()) @map("created_at")
  updatedAt                     DateTime                       @updatedAt @map("updated_at")
  rejectReason                  String?                        @map("reject_reason") @db.Text
  cancelReason                  String?                        @map("cancel_reason") @db.Text
  voidReason                    String?                        @map("void_reason") @db.Text
  archiveReason                 String?                        @map("archive_reason") @db.Text
  metadata                      Json?

  tenant                        Tenant                         @relation(fields: [tenantId], references: [id])
  supplier                      Supplier                       @relation(fields: [supplierId], references: [id])
  category                      SupplierCategory?              @relation(fields: [categoryId], references: [id])
  secureDocument                SecureDocument?                @relation(fields: [secureDocumentId], references: [id])
  approvals                     SupplierPayableApproval[]
  paymentOrderItems             SupplierPaymentOrderItem[]
  accountingLinks               SupplierAccountingLink[]

  @@index([tenantId])
  @@index([tenantId, supplierId])
  @@index([tenantId, payableNumber])
  @@index([tenantId, externalDocumentNumberNormalized])
  @@index([tenantId, documentType])
  @@index([tenantId, issueDate])
  @@index([tenantId, receivedDate])
  @@index([tenantId, dueDate])
  @@index([tenantId, status])
  @@index([tenantId, approvalStatus])
  @@index([tenantId, categoryId])
  @@index([tenantId, duplicateFingerprint])
  @@index([tenantId, outstandingAmount])
  @@index([createdAt])
  @@map("supplier_payables")
}

model SupplierPayableApproval {
  id                String                        @id @default(uuid()) @db.Uuid
  tenantId          String                        @map("tenant_id") @db.Uuid
  supplierPayableId String                        @map("supplier_payable_id") @db.Uuid
  approvalStep      Int                           @default(1) @map("approval_step")
  approvalStatus    SupplierPayableApprovalStatus @default(PENDING) @map("approval_status")

  requestedBy       String?                       @map("requested_by") @db.Uuid
  approvedBy        String?                       @map("approved_by") @db.Uuid
  rejectedBy        String?                       @map("rejected_by") @db.Uuid

  requestedAt       DateTime                      @default(now()) @map("requested_at")
  approvedAt        DateTime?                     @map("approved_at")
  rejectedAt        DateTime?                     @map("rejected_at")
  cancelledAt       DateTime?                     @map("cancelled_at")
  reason            String?                       @db.Text
  metadata          Json?

  tenant            Tenant                        @relation(fields: [tenantId], references: [id])
  supplierPayable   SupplierPayable               @relation(fields: [supplierPayableId], references: [id])

  @@index([tenantId])
  @@index([tenantId, supplierPayableId])
  @@index([tenantId, approvalStatus])
  @@index([tenantId, approvalStep])
  @@index([requestedAt])
  @@map("supplier_payable_approvals")
}

model SupplierPaymentOrder {
  id                    String                     @id @default(uuid()) @db.Uuid
  tenantId              String                     @map("tenant_id") @db.Uuid
  paymentOrderNumber    String                     @map("payment_order_number") @db.VarChar(80)
  supplierId            String                     @map("supplier_id") @db.Uuid
  paymentMethod         SupplierPaymentMethod      @map("payment_method")
  plannedPaymentDate    DateTime?                  @map("planned_payment_date")
  actualPaymentDate     DateTime?                  @map("actual_payment_date")
  description           String?                    @db.Text

  totalAmount           Decimal                    @default(0) @map("total_amount") @db.Decimal(12, 2)
  paidAmount            Decimal                    @default(0) @map("paid_amount") @db.Decimal(12, 2)
  currency              Currency                   @default(USD)
  status                SupplierPaymentOrderStatus @default(DRAFT)

  supplierBankAccountId String?                    @map("supplier_bank_account_id") @db.Uuid
  bankAccountId         String?                    @map("bank_account_id") @db.Uuid
  paymentReference      String?                    @map("payment_reference") @db.VarChar(160)
  paymentReferenceHash  String?                    @map("payment_reference_hash") @db.VarChar(128)
  secureDocumentId      String?                    @map("secure_document_id") @db.Uuid
  accountingJournalEntryId String?                 @map("accounting_journal_entry_id") @db.Uuid
  bankTransactionId     String?                    @map("bank_transaction_id") @db.Uuid
  reconciliationMatchId String?                    @map("reconciliation_match_id") @db.Uuid

  approvedAt            DateTime?                  @map("approved_at")
  approvedBy            String?                    @map("approved_by") @db.Uuid
  rejectedAt            DateTime?                  @map("rejected_at")
  rejectedBy            String?                    @map("rejected_by") @db.Uuid
  scheduledAt           DateTime?                  @map("scheduled_at")
  scheduledBy           String?                    @map("scheduled_by") @db.Uuid
  paidAt                DateTime?                  @map("paid_at")
  paidBy                String?                    @map("paid_by") @db.Uuid
  voidedAt              DateTime?                  @map("voided_at")
  voidedBy              String?                    @map("voided_by") @db.Uuid
  cancelledAt           DateTime?                  @map("cancelled_at")
  cancelledBy           String?                    @map("cancelled_by") @db.Uuid
  reversedAt            DateTime?                  @map("reversed_at")
  reversedBy            String?                    @map("reversed_by") @db.Uuid
  archivedAt            DateTime?                  @map("archived_at")
  archivedBy            String?                    @map("archived_by") @db.Uuid
  createdBy             String?                    @map("created_by") @db.Uuid
  updatedBy             String?                    @map("updated_by") @db.Uuid

  createdAt             DateTime                   @default(now()) @map("created_at")
  updatedAt             DateTime                   @updatedAt @map("updated_at")
  rejectReason          String?                    @map("reject_reason") @db.Text
  voidReason            String?                    @map("void_reason") @db.Text
  cancelReason          String?                    @map("cancel_reason") @db.Text
  reverseReason         String?                    @map("reverse_reason") @db.Text
  archiveReason         String?                    @map("archive_reason") @db.Text
  metadata              Json?

  tenant                Tenant                     @relation(fields: [tenantId], references: [id])
  supplier              Supplier                   @relation(fields: [supplierId], references: [id])
  supplierBankAccount   SupplierBankAccount?       @relation(fields: [supplierBankAccountId], references: [id])
  bankAccount           BankAccount?               @relation(fields: [bankAccountId], references: [id])
  secureDocument        SecureDocument?            @relation(fields: [secureDocumentId], references: [id])
  journalEntry          JournalEntry?              @relation(fields: [accountingJournalEntryId], references: [id])
  bankTransaction       BankTransaction?           @relation(fields: [bankTransactionId], references: [id])
  reconciliationMatch   ReconciliationMatch?       @relation(fields: [reconciliationMatchId], references: [id])

  items                 SupplierPaymentOrderItem[]
  evidence              SupplierPaymentEvidence[]
  accountingLinks       SupplierAccountingLink[]
  reconciliationLinks   SupplierBankReconciliationLink[]

  @@index([tenantId])
  @@index([tenantId, paymentOrderNumber])
  @@index([tenantId, supplierId])
  @@index([tenantId, paymentMethod])
  @@index([tenantId, plannedPaymentDate])
  @@index([tenantId, actualPaymentDate])
  @@index([tenantId, status])
  @@index([tenantId, supplierBankAccountId])
  @@index([tenantId, bankAccountId])
  @@index([tenantId, paymentReferenceHash])
  @@index([tenantId, accountingJournalEntryId])
  @@index([tenantId, bankTransactionId])
  @@index([tenantId, reconciliationMatchId])
  @@index([createdAt])
  @@map("supplier_payment_orders")
}

model SupplierPaymentOrderItem {
  id                     String               @id @default(uuid()) @db.Uuid
  tenantId               String               @map("tenant_id") @db.Uuid
  supplierPaymentOrderId String               @map("supplier_payment_order_id") @db.Uuid
  supplierPayableId      String               @map("supplier_payable_id") @db.Uuid
  lineNumber             Int                  @map("line_number")
  amount                 Decimal              @db.Decimal(12, 2)
  currency               Currency             @default(USD)
  description            String?              @db.Text
  createdAt              DateTime             @default(now()) @map("created_at")
  metadata               Json?

  tenant                 Tenant               @relation(fields: [tenantId], references: [id])
  supplierPaymentOrder   SupplierPaymentOrder @relation(fields: [supplierPaymentOrderId], references: [id])
  supplierPayable        SupplierPayable      @relation(fields: [supplierPayableId], references: [id])

  @@index([tenantId])
  @@index([tenantId, supplierPaymentOrderId])
  @@index([tenantId, supplierPayableId])
  @@index([tenantId, lineNumber])
  @@index([createdAt])
  @@map("supplier_payment_order_items")
}

model SupplierPaymentEvidence {
  id                     String                        @id @default(uuid()) @db.Uuid
  tenantId               String                        @map("tenant_id") @db.Uuid
  supplierPaymentOrderId String                        @map("supplier_payment_order_id") @db.Uuid
  secureDocumentId       String?                       @map("secure_document_id") @db.Uuid
  evidenceType           SupplierPaymentEvidenceType   @map("evidence_type")
  paymentReference       String?                       @map("payment_reference") @db.VarChar(160)
  paymentReferenceHash   String?                       @map("payment_reference_hash") @db.VarChar(128)
  paymentDate            DateTime?                     @map("payment_date")
  amount                 Decimal?                      @db.Decimal(12, 2)
  currency               Currency                      @default(USD)
  status                 SupplierPaymentEvidenceStatus @default(UPLOADED)

  createdBy              String?                       @map("created_by") @db.Uuid
  verifiedBy             String?                       @map("verified_by") @db.Uuid
  rejectedBy             String?                       @map("rejected_by") @db.Uuid
  archivedBy             String?                       @map("archived_by") @db.Uuid
  createdAt              DateTime                      @default(now()) @map("created_at")
  verifiedAt             DateTime?                     @map("verified_at")
  rejectedAt             DateTime?                     @map("rejected_at")
  archivedAt             DateTime?                     @map("archived_at")
  rejectReason           String?                       @map("reject_reason") @db.Text
  archiveReason          String?                       @map("archive_reason") @db.Text
  metadata               Json?

  tenant                 Tenant                        @relation(fields: [tenantId], references: [id])
  supplierPaymentOrder   SupplierPaymentOrder          @relation(fields: [supplierPaymentOrderId], references: [id])
  secureDocument         SecureDocument?               @relation(fields: [secureDocumentId], references: [id])

  @@index([tenantId])
  @@index([tenantId, supplierPaymentOrderId])
  @@index([tenantId, secureDocumentId])
  @@index([tenantId, evidenceType])
  @@index([tenantId, paymentReferenceHash])
  @@index([tenantId, paymentDate])
  @@index([tenantId, status])
  @@index([createdAt])
  @@map("supplier_payment_evidence")
}

model SupplierAccountingLink {
  id                     String                       @id @default(uuid()) @db.Uuid
  tenantId               String                       @map("tenant_id") @db.Uuid
  supplierPayableId      String?                      @map("supplier_payable_id") @db.Uuid
  supplierPaymentOrderId String?                      @map("supplier_payment_order_id") @db.Uuid
  journalEntryId         String?                      @map("journal_entry_id") @db.Uuid
  accountingEventType    SupplierAccountingEventType  @map("accounting_event_type")
  status                 SupplierAccountingLinkStatus @default(ACTIVE)
  errorCode              String?                      @map("error_code") @db.VarChar(120)
  errorMessage           String?                      @map("error_message") @db.Text
  createdAt              DateTime                     @default(now()) @map("created_at")
  archivedAt             DateTime?                    @map("archived_at")
  archivedBy             String?                      @map("archived_by") @db.Uuid
  metadata               Json?

  tenant                 Tenant                       @relation(fields: [tenantId], references: [id])
  supplierPayable        SupplierPayable?             @relation(fields: [supplierPayableId], references: [id])
  supplierPaymentOrder   SupplierPaymentOrder?        @relation(fields: [supplierPaymentOrderId], references: [id])
  journalEntry           JournalEntry?                @relation(fields: [journalEntryId], references: [id])

  @@index([tenantId])
  @@index([tenantId, supplierPayableId])
  @@index([tenantId, supplierPaymentOrderId])
  @@index([tenantId, journalEntryId])
  @@index([tenantId, accountingEventType])
  @@index([tenantId, status])
  @@index([createdAt])
  @@map("supplier_accounting_links")
}

model SupplierBankReconciliationLink {
  id                     String                               @id @default(uuid()) @db.Uuid
  tenantId               String                               @map("tenant_id") @db.Uuid
  supplierPaymentOrderId String                               @map("supplier_payment_order_id") @db.Uuid
  bankTransactionId      String?                              @map("bank_transaction_id") @db.Uuid
  reconciliationMatchId  String?                              @map("reconciliation_match_id") @db.Uuid
  status                 SupplierBankReconciliationLinkStatus @default(ACTIVE)

  linkedAt               DateTime                             @default(now()) @map("linked_at")
  linkedBy               String?                              @map("linked_by") @db.Uuid
  unlinkedAt             DateTime?                            @map("unlinked_at")
  unlinkedBy             String?                              @map("unlinked_by") @db.Uuid
  archivedAt             DateTime?                            @map("archived_at")
  archivedBy             String?                              @map("archived_by") @db.Uuid
  unlinkReason           String?                              @map("unlink_reason") @db.Text
  archiveReason          String?                              @map("archive_reason") @db.Text
  metadata               Json?

  tenant                 Tenant                               @relation(fields: [tenantId], references: [id])
  supplierPaymentOrder   SupplierPaymentOrder                 @relation(fields: [supplierPaymentOrderId], references: [id])
  bankTransaction        BankTransaction?                     @relation(fields: [bankTransactionId], references: [id])
  reconciliationMatch    ReconciliationMatch?                 @relation(fields: [reconciliationMatchId], references: [id])

  @@index([tenantId])
  @@index([tenantId, supplierPaymentOrderId])
  @@index([tenantId, bankTransactionId])
  @@index([tenantId, reconciliationMatchId])
  @@index([tenantId, status])
  @@index([linkedAt])
  @@map("supplier_bank_reconciliation_links")
}
```

---

## 22. Relaciones requeridas en modelos existentes

### 22.1. `Tenant`

Agregar relaciones:

```prisma id="ufrflg"
model Tenant {
  // campos existentes...

  supplierCategories              SupplierCategory[]
  suppliers                       Supplier[]
  supplierContacts                SupplierContact[]
  supplierBankAccounts            SupplierBankAccount[]
  supplierDocuments               SupplierDocument[]
  supplierPayables                SupplierPayable[]
  supplierPayableApprovals        SupplierPayableApproval[]
  supplierPaymentOrders           SupplierPaymentOrder[]
  supplierPaymentOrderItems       SupplierPaymentOrderItem[]
  supplierPaymentEvidence         SupplierPaymentEvidence[]
  supplierAccountingLinks         SupplierAccountingLink[]
  supplierBankReconciliationLinks SupplierBankReconciliationLink[]
}
```

---

### 22.2. `SecureDocument`

Agregar relaciones:

```prisma id="m4pb1h"
model SecureDocument {
  // campos existentes...

  supplierDocuments       SupplierDocument[]
  supplierPayables        SupplierPayable[]
  supplierPaymentOrders   SupplierPaymentOrder[]
  supplierPaymentEvidence SupplierPaymentEvidence[]
}
```

---

### 22.3. `SourceModule`

Extender enum de Secure Document Storage:

```prisma id="wzokzw"
enum SourceModule {
  // valores existentes...

  SUPPLIER_PAYMENTS @map("supplierPayments")
}
```

Uso recomendado:

```text id="bmox67"
sourceModule = supplierPayments
sourceResourceType = supplierDocument | supplierPayable | supplierPaymentOrder | supplierPaymentEvidence | supplierPaymentReportExport
```

---

### 22.4. `BankAccount`

Agregar relación opcional:

```prisma id="woz6o8"
model BankAccount {
  // campos existentes...

  supplierPaymentOrders SupplierPaymentOrder[]
}
```

---

### 22.5. `BankTransaction`

Agregar relación opcional:

```prisma id="d7ymk8"
model BankTransaction {
  // campos existentes...

  supplierPaymentOrders           SupplierPaymentOrder[]
  supplierBankReconciliationLinks SupplierBankReconciliationLink[]
}
```

---

### 22.6. `ReconciliationMatch`

Agregar relación opcional:

```prisma id="tpf35j"
model ReconciliationMatch {
  // campos existentes...

  supplierPaymentOrders           SupplierPaymentOrder[]
  supplierBankReconciliationLinks SupplierBankReconciliationLink[]
}
```

---

### 22.7. `JournalEntry`

Agregar relación opcional:

```prisma id="ny8ld4"
model JournalEntry {
  // campos existentes...

  supplierPaymentOrders   SupplierPaymentOrder[]
  supplierAccountingLinks SupplierAccountingLink[]
}
```

---

## 23. Índices recomendados

### 23.1. `supplier_categories`

```text id="z56f8l"
tenant_id
tenant_id + category_code
tenant_id + category_name
tenant_id + status
created_at
```

Índice único:

```sql id="fp4f12"
CREATE UNIQUE INDEX uq_supplier_categories_code
ON supplier_categories (tenant_id, category_code)
WHERE archived_at IS NULL;
```

---

### 23.2. `suppliers`

```text id="cymbon"
tenant_id
tenant_id + supplier_code
tenant_id + supplier_name
tenant_id + supplier_type
tenant_id + identification_number_hash
tenant_id + category_id
tenant_id + status
created_at
```

Índice único:

```sql id="jerz7v"
CREATE UNIQUE INDEX uq_suppliers_code
ON suppliers (tenant_id, supplier_code)
WHERE archived_at IS NULL;
```

Índice opcional para identificación:

```sql id="maym9u"
CREATE UNIQUE INDEX uq_suppliers_identification_hash
ON suppliers (tenant_id, identification_number_hash)
WHERE identification_number_hash IS NOT NULL
  AND archived_at IS NULL;
```

---

### 23.3. `supplier_contacts`

```text id="nhpccm"
tenant_id
tenant_id + supplier_id
tenant_id + email
tenant_id + is_primary
tenant_id + status
created_at
```

Índice opcional para contacto principal:

```sql id="ff74dv"
CREATE UNIQUE INDEX uq_supplier_contacts_primary
ON supplier_contacts (tenant_id, supplier_id)
WHERE is_primary = true
  AND status = 'active'
  AND archived_at IS NULL;
```

---

### 23.4. `supplier_bank_accounts`

```text id="rqsgcr"
tenant_id
tenant_id + supplier_id
tenant_id + bank_name
tenant_id + account_number_hash
tenant_id + status
created_at
```

Índice único:

```sql id="uimzra"
CREATE UNIQUE INDEX uq_supplier_bank_accounts_active_hash
ON supplier_bank_accounts (tenant_id, supplier_id, account_number_hash)
WHERE status IN ('verified', 'active')
  AND archived_at IS NULL;
```

---

### 23.5. `supplier_documents`

```text id="w57yvo"
tenant_id
tenant_id + supplier_id
tenant_id + secure_document_id
tenant_id + document_type
tenant_id + status
created_at
```

Índice único opcional:

```sql id="g8x0b3"
CREATE UNIQUE INDEX uq_supplier_documents_secure_document
ON supplier_documents (tenant_id, supplier_id, secure_document_id)
WHERE archived_at IS NULL;
```

---

### 23.6. `supplier_payables`

```text id="sz3rqp"
tenant_id
tenant_id + supplier_id
tenant_id + payable_number
tenant_id + external_document_number_normalized
tenant_id + document_type
tenant_id + issue_date
tenant_id + received_date
tenant_id + due_date
tenant_id + status
tenant_id + approval_status
tenant_id + category_id
tenant_id + duplicate_fingerprint
tenant_id + outstanding_amount
created_at
```

Índice único:

```sql id="lrg0w6"
CREATE UNIQUE INDEX uq_supplier_payables_number
ON supplier_payables (tenant_id, payable_number)
WHERE archived_at IS NULL;
```

Índice para duplicados:

```sql id="sfczdn"
CREATE INDEX idx_supplier_payables_duplicate_fingerprint
ON supplier_payables (tenant_id, duplicate_fingerprint)
WHERE duplicate_fingerprint IS NOT NULL
  AND archived_at IS NULL;
```

Índice para cuentas por pagar vencidas:

```sql id="w9p1xu"
CREATE INDEX idx_supplier_payables_aging
ON supplier_payables (tenant_id, status, due_date, outstanding_amount)
WHERE archived_at IS NULL;
```

---

### 23.7. `supplier_payable_approvals`

```text id="lepdat"
tenant_id
tenant_id + supplier_payable_id
tenant_id + approval_status
tenant_id + approval_step
requested_at
```

Índice único por paso pendiente:

```sql id="zyat1f"
CREATE UNIQUE INDEX uq_supplier_payable_approval_pending_step
ON supplier_payable_approvals (tenant_id, supplier_payable_id, approval_step)
WHERE approval_status = 'pending';
```

---

### 23.8. `supplier_payment_orders`

```text id="az7957"
tenant_id
tenant_id + payment_order_number
tenant_id + supplier_id
tenant_id + payment_method
tenant_id + planned_payment_date
tenant_id + actual_payment_date
tenant_id + status
tenant_id + supplier_bank_account_id
tenant_id + bank_account_id
tenant_id + payment_reference_hash
tenant_id + accounting_journal_entry_id
tenant_id + bank_transaction_id
tenant_id + reconciliation_match_id
created_at
```

Índice único:

```sql id="m52irp"
CREATE UNIQUE INDEX uq_supplier_payment_orders_number
ON supplier_payment_orders (tenant_id, payment_order_number)
WHERE archived_at IS NULL;
```

Índice para referencia de pago:

```sql id="w33jkg"
CREATE INDEX idx_supplier_payment_orders_reference_hash
ON supplier_payment_orders (tenant_id, payment_reference_hash)
WHERE payment_reference_hash IS NOT NULL
  AND archived_at IS NULL;
```

---

### 23.9. `supplier_payment_order_items`

```text id="fff1m4"
tenant_id
tenant_id + supplier_payment_order_id
tenant_id + supplier_payable_id
tenant_id + line_number
created_at
```

Índice único:

```sql id="hbc4ky"
CREATE UNIQUE INDEX uq_supplier_payment_order_items_line
ON supplier_payment_order_items (tenant_id, supplier_payment_order_id, line_number);
```

Índice para evitar duplicación de payable dentro de la misma orden:

```sql id="ozti6k"
CREATE UNIQUE INDEX uq_supplier_payment_order_items_payable_per_order
ON supplier_payment_order_items (tenant_id, supplier_payment_order_id, supplier_payable_id);
```

---

### 23.10. `supplier_payment_evidence`

```text id="oxkcmm"
tenant_id
tenant_id + supplier_payment_order_id
tenant_id + secure_document_id
tenant_id + evidence_type
tenant_id + payment_reference_hash
tenant_id + payment_date
tenant_id + status
created_at
```

---

### 23.11. `supplier_accounting_links`

```text id="k5dcqc"
tenant_id
tenant_id + supplier_payable_id
tenant_id + supplier_payment_order_id
tenant_id + journal_entry_id
tenant_id + accounting_event_type
tenant_id + status
created_at
```

Índice único parcial para evento contable activo por payable:

```sql id="ck0e7i"
CREATE UNIQUE INDEX uq_supplier_accounting_link_payable_event
ON supplier_accounting_links (tenant_id, supplier_payable_id, accounting_event_type)
WHERE supplier_payable_id IS NOT NULL
  AND status = 'active'
  AND archived_at IS NULL;
```

Índice único parcial para evento contable activo por order:

```sql id="lgl6va"
CREATE UNIQUE INDEX uq_supplier_accounting_link_order_event
ON supplier_accounting_links (tenant_id, supplier_payment_order_id, accounting_event_type)
WHERE supplier_payment_order_id IS NOT NULL
  AND status = 'active'
  AND archived_at IS NULL;
```

---

### 23.12. `supplier_bank_reconciliation_links`

```text id="pplqfd"
tenant_id
tenant_id + supplier_payment_order_id
tenant_id + bank_transaction_id
tenant_id + reconciliation_match_id
tenant_id + status
linked_at
```

Índice único para vínculo activo por orden y bank transaction:

```sql id="jijuta"
CREATE UNIQUE INDEX uq_supplier_reconciliation_link_bank_transaction
ON supplier_bank_reconciliation_links (tenant_id, supplier_payment_order_id, bank_transaction_id)
WHERE bank_transaction_id IS NOT NULL
  AND status = 'active'
  AND archived_at IS NULL;
```

Índice único para vínculo activo por orden y match:

```sql id="wumtam"
CREATE UNIQUE INDEX uq_supplier_reconciliation_link_match
ON supplier_bank_reconciliation_links (tenant_id, supplier_payment_order_id, reconciliation_match_id)
WHERE reconciliation_match_id IS NOT NULL
  AND status = 'active'
  AND archived_at IS NULL;
```

---

## 24. Constraints recomendados

### 24.1. Montos no negativos en `supplier_payables`

```sql id="ed083g"
ALTER TABLE supplier_payables
ADD CONSTRAINT chk_supplier_payables_amounts_non_negative
CHECK (
  subtotal_amount >= 0
  AND tax_amount >= 0
  AND discount_amount >= 0
  AND total_amount >= 0
  AND outstanding_amount >= 0
);
```

---

### 24.2. Total calculado consistente

```sql id="rh3w3d"
ALTER TABLE supplier_payables
ADD CONSTRAINT chk_supplier_payables_total_consistent
CHECK (total_amount = subtotal_amount + tax_amount - discount_amount);
```

---

### 24.3. Outstanding no mayor al total

```sql id="b3e5d7"
ALTER TABLE supplier_payables
ADD CONSTRAINT chk_supplier_payables_outstanding_lte_total
CHECK (outstanding_amount <= total_amount);
```

---

### 24.4. Paid requiere outstanding cero

```sql id="qz6ik4"
ALTER TABLE supplier_payables
ADD CONSTRAINT chk_supplier_payables_paid_outstanding_zero
CHECK (
  status != 'paid'
  OR outstanding_amount = 0
);
```

---

### 24.5. Partially paid requiere saldo intermedio

```sql id="d1lmze"
ALTER TABLE supplier_payables
ADD CONSTRAINT chk_supplier_payables_partially_paid_amount
CHECK (
  status != 'partiallyPaid'
  OR (
    outstanding_amount > 0
    AND outstanding_amount < total_amount
  )
);
```

---

### 24.6. Approved fields

```sql id="kv8fer"
ALTER TABLE supplier_payables
ADD CONSTRAINT chk_supplier_payables_approved_fields
CHECK (
  status != 'approved'
  OR approved_at IS NOT NULL
);
```

---

### 24.7. Rejected fields

```sql id="dx36vd"
ALTER TABLE supplier_payables
ADD CONSTRAINT chk_supplier_payables_rejected_fields
CHECK (
  status != 'rejected'
  OR (rejected_at IS NOT NULL AND reject_reason IS NOT NULL)
);
```

---

### 24.8. Cancelled fields

```sql id="i0c99k"
ALTER TABLE supplier_payables
ADD CONSTRAINT chk_supplier_payables_cancelled_fields
CHECK (
  status != 'cancelled'
  OR (cancelled_at IS NOT NULL AND cancel_reason IS NOT NULL)
);
```

---

### 24.9. Voided fields

```sql id="azrbop"
ALTER TABLE supplier_payables
ADD CONSTRAINT chk_supplier_payables_voided_fields
CHECK (
  status != 'voided'
  OR (voided_at IS NOT NULL AND void_reason IS NOT NULL)
);
```

---

### 24.10. Montos no negativos en órdenes

```sql id="oyed7f"
ALTER TABLE supplier_payment_orders
ADD CONSTRAINT chk_supplier_payment_orders_amounts_non_negative
CHECK (
  total_amount >= 0
  AND paid_amount >= 0
);
```

---

### 24.11. Paid amount no mayor al total

```sql id="bge5x6"
ALTER TABLE supplier_payment_orders
ADD CONSTRAINT chk_supplier_payment_orders_paid_lte_total
CHECK (paid_amount <= total_amount);
```

---

### 24.12. Paid requiere paidAt

```sql id="d5mcb9"
ALTER TABLE supplier_payment_orders
ADD CONSTRAINT chk_supplier_payment_orders_paid_fields
CHECK (
  status != 'paid'
  OR (paid_at IS NOT NULL AND actual_payment_date IS NOT NULL)
);
```

---

### 24.13. Paid requiere referencia o documento

```sql id="b0jl0n"
ALTER TABLE supplier_payment_orders
ADD CONSTRAINT chk_supplier_payment_orders_paid_reference_or_document
CHECK (
  status != 'paid'
  OR (
    payment_reference IS NOT NULL
    OR secure_document_id IS NOT NULL
  )
);
```

---

### 24.14. Orden rechazada requiere razón

```sql id="kzpzmj"
ALTER TABLE supplier_payment_orders
ADD CONSTRAINT chk_supplier_payment_orders_rejected_fields
CHECK (
  status != 'rejected'
  OR (rejected_at IS NOT NULL AND reject_reason IS NOT NULL)
);
```

---

### 24.15. Orden reversada requiere razón

```sql id="f7d4lu"
ALTER TABLE supplier_payment_orders
ADD CONSTRAINT chk_supplier_payment_orders_reversed_fields
CHECK (
  status != 'paid'
  OR reverse_reason IS NULL OR reversed_at IS NOT NULL
);
```

> Nota: la semántica exacta de reverso puede refinarse en `api-contract.md` y `tasks.md`.

---

### 24.16. Payment order item amount válido

```sql id="cf9pyn"
ALTER TABLE supplier_payment_order_items
ADD CONSTRAINT chk_supplier_payment_order_items_amount_positive
CHECK (amount > 0);
```

---

### 24.17. Payment evidence amount no negativo

```sql id="a6yk1p"
ALTER TABLE supplier_payment_evidence
ADD CONSTRAINT chk_supplier_payment_evidence_amount_non_negative
CHECK (amount IS NULL OR amount >= 0);
```

---

### 24.18. Evidence verified fields

```sql id="tp1tu6"
ALTER TABLE supplier_payment_evidence
ADD CONSTRAINT chk_supplier_payment_evidence_verified_fields
CHECK (
  status != 'verified'
  OR verified_at IS NOT NULL
);
```

---

### 24.19. Evidence rejected fields

```sql id="tx9lss"
ALTER TABLE supplier_payment_evidence
ADD CONSTRAINT chk_supplier_payment_evidence_rejected_fields
CHECK (
  status != 'rejected'
  OR (rejected_at IS NOT NULL AND reject_reason IS NOT NULL)
);
```

---

### 24.20. Accounting link target

```sql id="pu1kbi"
ALTER TABLE supplier_accounting_links
ADD CONSTRAINT chk_supplier_accounting_links_target
CHECK (
  supplier_payable_id IS NOT NULL
  OR supplier_payment_order_id IS NOT NULL
);
```

---

### 24.21. Accounting link failed fields

```sql id="ff2y4u"
ALTER TABLE supplier_accounting_links
ADD CONSTRAINT chk_supplier_accounting_links_failed_fields
CHECK (
  status != 'failed'
  OR error_code IS NOT NULL
);
```

---

### 24.22. Reconciliation link target

```sql id="ys0g5o"
ALTER TABLE supplier_bank_reconciliation_links
ADD CONSTRAINT chk_supplier_reconciliation_links_target
CHECK (
  bank_transaction_id IS NOT NULL
  OR reconciliation_match_id IS NOT NULL
);
```

---

## 25. Validaciones que Prisma no garantiza por sí solo

El servicio debe validar tenant en todas las referencias:

```text id="k3mlbz"
supplierId
categoryId
supplierBankAccountId
supplierPayableId
supplierPaymentOrderId
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

También debe validar:

```text id="x32woo"
- supplier pertenece al tenant;
- supplier active para nuevas obligaciones;
- supplier no blocked para aprobar pagos;
- category pertenece al tenant;
- secureDocument pertenece al tenant;
- bankAccount interno pertenece al tenant;
- bankTransaction pertenece al tenant;
- reconciliationMatch pertenece al tenant;
- journalEntry pertenece al tenant;
- account contable pertenece al tenant;
- payment order items pertenecen al mismo tenant;
- payable de item pertenece al mismo supplier de la orden, salvo política futura;
- evidence pertenece a la orden y tenant;
- report filters no cruzan tenants.
```

---

## 26. Estrategia de dinero

### 26.1. Tipo

Todos los campos monetarios usan:

```text id="vewe80"
Decimal(12,2)
```

---

### 26.2. Campos monetarios

```text id="tj44w5"
supplier_payables.subtotal_amount
supplier_payables.tax_amount
supplier_payables.discount_amount
supplier_payables.total_amount
supplier_payables.outstanding_amount
supplier_payment_orders.total_amount
supplier_payment_orders.paid_amount
supplier_payment_order_items.amount
supplier_payment_evidence.amount
```

---

### 26.3. Reglas

```text id="s0ac7n"
- no usar float.
- no usar double.
- no usar JavaScript number como fuente de verdad.
- exponer montos como string decimal.
- currency MVP = USD.
- totalAmount se calcula/valida server-side.
- outstandingAmount se calcula server-side.
- paymentOrder.totalAmount se calcula desde items.
- paidAmount no puede exceder totalAmount.
```

---

## 27. Estrategia de datos sensibles

### 27.1. Identificación de proveedor

No exponer identificación completa si no es estrictamente necesario.

Usar:

```text id="aarq5y"
identificationNumberMasked
identificationNumberHash
```

---

### 27.2. Cuenta bancaria de proveedor

No almacenar número completo en texto plano.

Usar:

```text id="xxocfp"
accountNumberMasked
accountNumberHash
```

---

### 27.3. Beneficiario

Usar:

```text id="sd3afb"
beneficiaryIdentificationMasked
beneficiaryIdentificationHash
```

---

### 27.4. Datos prohibidos

```text id="yw5bcx"
bank username
bank password
OTP
MFA secret
raw bank token
raw bank payload
full account number
storageKey
signedUrl persistente
```

---

## 28. Estrategia de numeración

### 28.1. Supplier code

Formato recomendado:

```text id="fzy79i"
SUP-{sequence}
```

Ejemplo:

```text id="h1maz9"
SUP-000001
```

---

### 28.2. Payable number

Formato recomendado:

```text id="df43qv"
PAY-{periodCode}-{sequence}
```

Ejemplo:

```text id="rnjz33"
PAY-2026-07-000001
```

---

### 28.3. Payment order number

Formato recomendado:

```text id="cb0hxp"
SPO-{periodCode}-{sequence}
```

Ejemplo:

```text id="gxa2at"
SPO-2026-07-000001
```

---

### 28.4. Reglas

```text id="b7v45t"
- numeración server-side.
- no aceptar supplierCode manual salvo permiso/política.
- no aceptar payableNumber manual salvo política.
- no aceptar paymentOrderNumber manual salvo política.
- no reutilizar números archivados.
```

---

## 29. Estrategia de duplicados

### 29.1. Supplier duplicate

Claves:

```text id="t5x2z5"
tenantId + supplierCode
tenantId + identificationNumberHash opcional
```

---

### 29.2. SupplierPayable duplicate

Fingerprint:

```text id="dt7pp6"
sha256(tenantId + supplierId + externalDocumentNumberNormalized + issueDate + totalAmount)
```

---

### 29.3. Payment order duplicate

Se previene por:

```text id="x7kb4a"
- outstandingAmount calculado;
- locks/transacciones;
- validación de items;
- no overpayment;
- paymentReferenceHash como señal secundaria.
```

---

## 30. DTOs derivados del modelo

### 30.1. `SupplierCategoryDto`

Incluye:

```text id="d3v1p5"
id
categoryCode
categoryName
description
status
createdAt
updatedAt
archivedAt
metadata segura
```

No incluye:

```text id="orexqv"
tenantId
createdBy
updatedBy
archivedBy
```

---

### 30.2. `SupplierDto`

Incluye:

```text id="ulzxpx"
id
supplierCode
supplierName
supplierType
identificationType
identificationNumberMasked
email
phone
address
status
categoryId
defaultExpenseAccountId
defaultAccountsPayableAccountId
createdAt
updatedAt
activatedAt
disabledAt
blockedAt
archivedAt
metadata segura
```

No incluye:

```text id="yj2gsn"
tenantId
identificationNumberHash
actor fields internos
```

---

### 30.3. `SupplierContactDto`

Incluye:

```text id="fxpu7w"
id
supplierId
contactName
role
email
phone
isPrimary
status
createdAt
updatedAt
archivedAt
metadata segura
```

---

### 30.4. `SupplierBankAccountDto`

Incluye:

```text id="bjtdec"
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
disabledAt
archivedAt
createdAt
updatedAt
metadata segura
```

No incluye:

```text id="fnkfiw"
accountNumberHash
beneficiaryIdentificationHash
full account number
```

---

### 30.5. `SupplierDocumentDto`

Incluye:

```text id="wmxiag"
id
supplierId
secureDocumentId
documentType
description
status
createdAt
archivedAt
downloadAvailable
metadata segura
```

No incluye:

```text id="ps8nz2"
storageKey
signedUrl persistente
```

---

### 30.6. `SupplierPayableDto`

Incluye:

```text id="e14mo0"
id
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
approvalStatus
approvedAt
rejectedAt
cancelledAt
voidedAt
archivedAt
createdAt
updatedAt
metadata segura
```

No incluye:

```text id="imwktf"
duplicateFingerprint completo por defecto
tenantId
actor fields
```

---

### 30.7. `SupplierPayableApprovalDto`

Incluye:

```text id="u7um5o"
id
supplierPayableId
approvalStep
approvalStatus
requestedAt
approvedAt
rejectedAt
cancelledAt
reason
metadata segura
```

---

### 30.8. `SupplierPaymentOrderDto`

Incluye:

```text id="v1s4tp"
id
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
rejectedAt
scheduledAt
paidAt
voidedAt
cancelledAt
reversedAt
archivedAt
createdAt
updatedAt
items
evidence
metadata segura
```

No incluye:

```text id="p75imk"
paymentReferenceHash
tenantId
actor fields
```

---

### 30.9. `SupplierPaymentOrderItemDto`

Incluye:

```text id="epwadj"
id
supplierPaymentOrderId
supplierPayableId
lineNumber
amount
currency
description
createdAt
metadata segura
```

---

### 30.10. `SupplierPaymentEvidenceDto`

Incluye:

```text id="bu840j"
id
supplierPaymentOrderId
secureDocumentId
evidenceType
paymentReference
paymentDate
amount
currency
status
createdAt
verifiedAt
rejectedAt
archivedAt
metadata segura
```

No incluye:

```text id="jjzmrh"
paymentReferenceHash
storageKey
signedUrl persistente
```

---

### 30.11. `SupplierAccountingLinkDto`

Incluye:

```text id="fn7yxi"
id
supplierPayableId
supplierPaymentOrderId
journalEntryId
accountingEventType
status
errorCode
errorMessage sanitizado
createdAt
archivedAt
metadata segura
```

---

### 30.12. `SupplierBankReconciliationLinkDto`

Incluye:

```text id="qyk8po"
id
supplierPaymentOrderId
bankTransactionId
reconciliationMatchId
status
linkedAt
unlinkedAt
archivedAt
metadata segura
```

---

## 31. Campos prohibidos en requests

Los DTOs externos deben rechazar:

```text id="b12hnf"
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
status directo salvo endpoints de transición
totalAmount como fuente de verdad si puede calcularse
outstandingAmount
paidAmount como fuente de verdad
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
bankTransactionId directo sin endpoint controlado
reconciliationMatchId directo sin endpoint controlado
payment initiation fields
Open Banking payment initiation fields
external AI flags
```

---

## 32. Consultas conceptuales

### 32.1. Listar obligaciones pendientes

```sql id="vmiam3"
SELECT *
FROM supplier_payables
WHERE tenant_id = :tenant_id
  AND status IN ('approved', 'scheduledForPayment', 'partiallyPaid')
  AND outstanding_amount > 0
  AND archived_at IS NULL
ORDER BY due_date ASC NULLS LAST, created_at ASC;
```

---

### 32.2. Detectar payable duplicado

```sql id="y5q4mk"
SELECT id
FROM supplier_payables
WHERE tenant_id = :tenant_id
  AND duplicate_fingerprint = :duplicate_fingerprint
  AND status NOT IN ('cancelled', 'voided', 'archived')
  AND archived_at IS NULL;
```

---

### 32.3. Aging de cuentas por pagar

```sql id="hgw9m3"
SELECT
  sp.id,
  sp.payable_number,
  sp.supplier_id,
  sp.due_date,
  sp.total_amount,
  sp.outstanding_amount,
  sp.status
FROM supplier_payables sp
WHERE sp.tenant_id = :tenant_id
  AND sp.outstanding_amount > 0
  AND sp.status IN ('approved', 'scheduledForPayment', 'partiallyPaid')
  AND sp.archived_at IS NULL
ORDER BY sp.due_date ASC NULLS LAST;
```

---

### 32.4. Pagos por proveedor

```sql id="gijthp"
SELECT
  spo.supplier_id,
  COUNT(*) AS payment_orders_count,
  SUM(spo.paid_amount) AS total_paid
FROM supplier_payment_orders spo
WHERE spo.tenant_id = :tenant_id
  AND spo.status IN ('paid', 'partiallyPaid')
  AND spo.actual_payment_date BETWEEN :date_from AND :date_to
  AND spo.archived_at IS NULL
GROUP BY spo.supplier_id
ORDER BY total_paid DESC;
```

---

### 32.5. Egresos por categoría

```sql id="bbt7ez"
SELECT
  sp.category_id,
  COUNT(*) AS payables_count,
  SUM(sp.total_amount) AS approved_amount,
  SUM(sp.total_amount - sp.outstanding_amount) AS paid_amount,
  SUM(sp.outstanding_amount) AS outstanding_amount
FROM supplier_payables sp
WHERE sp.tenant_id = :tenant_id
  AND sp.status IN ('approved', 'scheduledForPayment', 'partiallyPaid', 'paid')
  AND sp.archived_at IS NULL
GROUP BY sp.category_id;
```

---

## 33. Reglas de archivo y retención

### 33.1. Soft archive

Entidades archivables:

```text id="czybf0"
SupplierCategory
Supplier
SupplierContact
SupplierBankAccount
SupplierDocument
SupplierPayable
SupplierPaymentOrder
SupplierPaymentEvidence
SupplierAccountingLink
SupplierBankReconciliationLink
```

---

### 33.2. Supplier archived

Archivar proveedor:

```text id="qqwm52"
- no elimina payables;
- no elimina payment orders;
- no elimina evidence;
- no elimina accounting links;
- conserva historial.
```

---

### 33.3. Payable paid

Un payable `paid` no debe eliminarse.

Solo puede archivarse para ocultamiento administrativo histórico.

---

### 33.4. Payment order paid

Una orden `paid` no se edita destructivamente.

Corrección:

```text id="nczvkx"
paid order
  -> reversal/correction event
  -> accounting reversal si aplica
  -> bank reconciliation unlink si aplica
```

---

### 33.5. Evidence

La evidencia no se borra físicamente desde este módulo.

La retención se gestiona mediante Secure Document Storage.

---

## 34. Integridad con módulos financieros

### 34.1. Integridad con Accounting Ledger

```text id="mx3bb6"
SupplierPayable.approved puede generar JournalEntry.
SupplierPaymentOrder.paid puede generar JournalEntry.
SupplierPaymentOrder.reversed puede generar JournalEntry reverso.
Supplier Payments no edita JournalEntry posted.
SupplierAccountingLink mantiene trazabilidad.
```

---

### 34.2. Integridad con Bank Reconciliation

```text id="p2lkgi"
SupplierPaymentOrder puede vincularse a BankTransaction.
SupplierPaymentOrder puede vincularse a ReconciliationMatch.
Supplier Payments no crea ReconciliationMatch final.
Supplier Payments no marca BankTransaction matched.
Supplier Payments no cierra ReconciliationSession.
```

---

### 34.3. Integridad con Secure Document Storage

```text id="f7v2t5"
SupplierDocument usa SecureDocument.
SupplierPayable puede usar SecureDocument.
SupplierPaymentOrder puede usar SecureDocument.
SupplierPaymentEvidence puede usar SecureDocument.
API no expone storageKey.
```

---

### 34.4. Integridad con Open Banking

```text id="n9j9id"
Supplier Payments no inicia pagos Open Banking.
Open Banking puede alimentar Bank Reconciliation.
Supplier Payments se vincula indirectamente vía Bank Reconciliation.
```

---

## 35. Auditoría vinculada al modelo

### 35.1. Eventos mínimos

```text id="cn5sei"
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

### 35.2. Metadata permitida

```text id="y85mc9"
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

### 35.3. Metadata prohibida

```text id="y64v7a"
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

## 36. Observabilidad vinculada al modelo

### 36.1. Métricas derivables

```text id="r066sh"
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

### 36.2. Labels permitidos

```text id="c4y9xc"
supplierType
payableStatus
paymentOrderStatus
paymentMethod
documentType
currency
outcome
```

---

### 36.3. Labels prohibidos

```text id="l4ydoe"
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

## 37. Migración propuesta

### 37.1. Nombre de migración

```text id="j1lv4n"
021_create_supplier_payments
```

---

### 37.2. Contenido de migración

```text id="f1hssi"
1. Crear enums Supplier Payments.
2. Crear supplier_categories.
3. Crear suppliers.
4. Crear supplier_contacts.
5. Crear supplier_bank_accounts.
6. Crear supplier_documents.
7. Crear supplier_payables.
8. Crear supplier_payable_approvals.
9. Crear supplier_payment_orders.
10. Crear supplier_payment_order_items.
11. Crear supplier_payment_evidence.
12. Crear supplier_accounting_links.
13. Crear supplier_bank_reconciliation_links.
14. Agregar relaciones a Tenant.
15. Extender SourceModule con supplierPayments.
16. Crear índices básicos.
17. Crear índices parciales raw.
18. Crear constraints raw.
19. Ejecutar prisma generate.
20. Validar migración en entorno test.
```

---

## 38. Seeds recomendados

Crear seeds ficticios:

```text id="luq53h"
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

supplierPayableApprovalPendingA
supplierPayableApprovalApprovedA
supplierPayableApprovalRejectedA
supplierPayableApprovalTenantB

supplierPaymentOrderDraftA
supplierPaymentOrderPendingApprovalA
supplierPaymentOrderApprovedA
supplierPaymentOrderScheduledA
supplierPaymentOrderPaidA
supplierPaymentOrderPartiallyPaidA
supplierPaymentOrderVoidedA
supplierPaymentOrderCancelledA
supplierPaymentOrderTenantB

supplierPaymentOrderItemA
supplierPaymentOrderItemPartialA
supplierPaymentOrderItemTenantB

supplierPaymentEvidenceUploadedA
supplierPaymentEvidenceVerifiedA
supplierPaymentEvidenceRejectedA
supplierPaymentEvidenceTenantB

supplierAccountingLinkActiveA
supplierAccountingLinkFailedA
supplierAccountingLinkTenantB

supplierBankReconciliationLinkActiveA
supplierBankReconciliationLinkUnlinkedA
supplierBankReconciliationLinkTenantB
```

---

## 39. Datos prohibidos en seeds

```text id="bpi2fk"
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

## 40. Reglas de testing para modelo

### 40.1. Repository tests

Debe probar:

```text id="jj2wog"
- create supplier category;
- create supplier;
- create supplier contact;
- create supplier bank account;
- create supplier document;
- create supplier payable;
- create supplier payable approval;
- create supplier payment order;
- create supplier payment order item;
- create supplier payment evidence;
- create supplier accounting link;
- create supplier bank reconciliation link;
- tenant A no ve datos tenant B;
- findFirst con tenantId funciona;
- findUnique por id simple no se usa;
- índices únicos previenen duplicados;
- constraints monetarios funcionan;
- constraints de estado funcionan;
- supplierCode único por tenant;
- payableNumber único por tenant;
- paymentOrderNumber único por tenant;
- duplicateFingerprint detecta duplicados.
```

---

### 40.2. Integrity tests

Debe probar:

```text id="d9kqb6"
- totalAmount = subtotalAmount + taxAmount - discountAmount;
- outstandingAmount <= totalAmount;
- paid payable requiere outstandingAmount = 0;
- partiallyPaid requiere outstanding intermedio;
- paymentOrder paid requiere paidAt;
- paymentOrder paid requiere referencia o documento;
- paymentOrder item amount > 0;
- evidence verified requiere verifiedAt;
- accounting link requiere payable u order;
- reconciliation link requiere bankTransaction o match.
```

---

### 40.3. Security tests

Debe probar:

```text id="f7ozpu"
- no tenantId desde body;
- no supplier cross-tenant;
- no category cross-tenant;
- no contact cross-tenant;
- no bank account cross-tenant;
- no document cross-tenant;
- no payable cross-tenant;
- no payment order cross-tenant;
- no evidence cross-tenant;
- no accounting link cross-tenant;
- no reconciliation link cross-tenant;
- no storageKey exposure;
- no full account number exposure;
- no payment above outstanding;
- no payment to blocked supplier;
- no bank transfer initiation;
- no Open Banking payment initiation;
- no JournalEntry posted mutation;
- no Bank Reconciliation final confirmation.
```

---

## 41. No aceptación del modelo

El modelo no debe aceptarse si:

```text id="yp43q8"
- omite tenant_id en tablas operativas;
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
- acepta tenantId desde body;
- favorece findUnique por id simple;
- expone accountNumberHash en DTO público ordinario;
- expone número completo de cuenta bancaria;
- expone identificationNumberHash en DTO público ordinario;
- expone storageKey;
- permite supplierCode duplicado;
- permite payableNumber duplicado;
- permite paymentOrderNumber duplicado;
- permite totalAmount inconsistente;
- permite outstandingAmount negativo;
- permite paid con outstandingAmount > 0;
- permite paymentOrder paid sin referencia o evidencia;
- permite paymentOrder item con amount <= 0;
- permite paymentOrder item mayor al outstandingAmount;
- permite pago a proveedor blocked;
- permite pago a proveedor archived;
- permite payable para supplier inactive/archived;
- permite evidencia rejected como soporte válido;
- permite accounting link sin payable/order;
- permite reconciliation link sin bankTransaction/match;
- Supplier Payments crea transferencia bancaria;
- Supplier Payments inicia Open Banking payment;
- Supplier Payments edita JournalEntry posted;
- Supplier Payments crea ReconciliationMatch final;
- Supplier Payments marca BankTransaction matched;
- Supplier Payments cierra ReconciliationSession;
- permite reportes cross-tenant;
- permite acceso desde WordPress;
- permite IA externa con datos reales;
- usa float/double para dinero.
```

---

## 42. Resultado esperado

Este modelo de datos debe permitir implementar `021-supplier-payments` como módulo seguro de proveedores, obligaciones por pagar y egresos administrativos.

Resultado esperado:

```text id="ql23sb"
- SupplierCategory tenant-scoped;
- Supplier tenant-scoped;
- SupplierContact tenant-scoped;
- SupplierBankAccount protected;
- SupplierDocument via Secure Document Storage;
- SupplierPayable;
- SupplierPayableApproval;
- SupplierPaymentOrder;
- SupplierPaymentOrderItem;
- SupplierPaymentEvidence;
- SupplierAccountingLink;
- SupplierBankReconciliationLink;
- Decimal money;
- duplicate detection;
- outstandingAmount control;
- partial payments;
- payment evidence;
- accounting traceability;
- bank reconciliation traceability;
- no bank transfer initiation;
- no Open Banking payment initiation;
- no SRI/electronic invoicing;
- no full bank account exposure;
- no storageKey exposure;
- no JournalEntry posted mutation;
- no Bank Reconciliation final confirmation;
- no public endpoints;
- no /me endpoints;
- no WordPress access;
- no external AI with real supplier/payment data.
```

---

## 43. Expediente actualizado

```text id="xp8n20"
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
│   │       └── data-model.md
```
