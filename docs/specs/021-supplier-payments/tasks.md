# Tasks — Spec 021 Supplier Payments

## 1. Información del documento

| Campo           | Valor                                                                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                 |
| Spec ID         | 021                                                                                                                                                           |
| Módulo          | Supplier Payments                                                                                                                                             |
| Documento       | Tasks                                                                                                                                                         |
| Ruta            | `docs/specs/021-supplier-payments/tasks.md`                                                                                                                   |
| Versión         | 0.1                                                                                                                                                           |
| Estado          | needs-review                                                                                                                                                  |
| Fecha           | 2026-07-23                                                                                                                                                    |
| Documento base  | `docs/specs/021-supplier-payments/spec.md`                                                                                                                    |
| Plan técnico    | `docs/specs/021-supplier-payments/plan.md`                                                                                                                    |
| Modelo de datos | `docs/specs/021-supplier-payments/data-model.md`                                                                                                              |
| Contrato API    | `docs/specs/021-supplier-payments/api-contract.md`                                                                                                            |
| Plan de pruebas | `docs/specs/021-supplier-payments/test-plan.md`                                                                                                               |
| Depende de      | `001-tenants`, `002-users-roles`, `007-audit`, `008-basic-reports`, `016-secure-document-storage`, `017-bank-reconciliation`, `020-accounting-ledger`         |
| Naturaleza      | Tenant-scoped / Supplier-aware / Payable-driven / Approval-controlled / Evidence-backed / Accounting-linked / Reconciliation-ready / Audit-heavy / Non-public |

---

## 2. Propósito

Este documento define el backlog técnico ejecutable del módulo `021-supplier-payments`.

El objetivo es convertir la especificación funcional, el plan técnico, el modelo de datos, el contrato API y el plan de pruebas en una lista de tareas implementables, verificables y trazables.

Regla central de implementación:

```text id="kdfx91"
Supplier Payments debe implementarse como un módulo financiero-administrativo tenant-scoped para proveedores, obligaciones por pagar, órdenes de pago, evidencias, pagos manuales, vínculos contables y vínculos bancarios, sin iniciar transferencias bancarias, sin Open Banking payment initiation, sin facturación electrónica/SRI en MVP, sin edición destructiva de pagos registrados, sin mutación directa de JournalEntries posted, sin confirmación final de Bank Reconciliation, sin endpoints públicos, sin endpoints /me, sin acceso desde WordPress y sin uso de IA externa con datos reales.
```

---

## 3. Convenciones

### 3.1. Estados de tarea

```text id="ss5zxp"
[ ] Pendiente
[x] Completada
[-] No aplica / descartada
[~] En progreso
[!] Bloqueada
```

---

### 3.2. Criterio para marcar una tarea como completada

Una tarea solo debe marcarse `[x]` si:

```text id="iqx8b4"
- el código fue implementado;
- los tests asociados pasan;
- cumple spec.md;
- cumple plan.md;
- cumple data-model.md;
- cumple api-contract.md;
- cumple test-plan.md;
- no rompe tenant isolation;
- no acepta tenantId desde body;
- no acepta actor fields desde body;
- no expone número completo de cuenta bancaria;
- no expone accountNumberHash en DTO estándar;
- no expone identificationNumberHash en DTO estándar;
- no expone storageKey;
- no permite pagos superiores al outstandingAmount;
- no permite pagos a supplier blocked;
- no permite marcar paid sin aprobación;
- no permite marcar paid sin referencia/evidencia mínima;
- no inicia transferencia bancaria;
- no inicia pago Open Banking;
- no edita JournalEntry posted;
- no crea ReconciliationMatch final;
- no marca BankTransaction matched;
- no cierra ReconciliationSession;
- no crea endpoints públicos;
- no crea endpoints /me;
- no habilita acceso desde WordPress;
- no envía datos reales a IA externa;
- audita operaciones críticas;
- pasa lint, typecheck, tests y CI.
```

---

## 4. Épicas de implementación

```text id="l7hv0n"
EPIC-021-01 — Module foundation
EPIC-021-02 — Enums, constants and configuration
EPIC-021-03 — Domain value objects
EPIC-021-04 — Domain entities and state machines
EPIC-021-05 — Domain policies and errors
EPIC-021-06 — Database schema and migrations
EPIC-021-07 — Repository layer
EPIC-021-08 — Supplier categories
EPIC-021-09 — Suppliers
EPIC-021-10 — Supplier contacts
EPIC-021-11 — Supplier bank accounts
EPIC-021-12 — Supplier documents
EPIC-021-13 — Supplier payables
EPIC-021-14 — Supplier payable approvals
EPIC-021-15 — Supplier payment orders and items
EPIC-021-16 — Mark-paid, evidence and partial payments
EPIC-021-17 — Reversal and correction flow
EPIC-021-18 — Secure Document Storage integration
EPIC-021-19 — Accounting Ledger integration
EPIC-021-20 — Bank Reconciliation link integration
EPIC-021-21 — Reports and exports
EPIC-021-22 — REST API controllers
EPIC-021-23 — Authorization, guards and permissions
EPIC-021-24 — Audit
EPIC-021-25 — Observability
EPIC-021-26 — OpenAPI
EPIC-021-27 — Tests
EPIC-021-28 — Security hardening
EPIC-021-29 — CI/CD gates
```

---

# 5. EPIC-021-01 — Module foundation

## 5.1. Estructura base

```text id="g6s753"
apps/api/src/modules/supplier-payments/
```

### Tasks

```text id="nenhcm"
[ ] Crear carpeta apps/api/src/modules/supplier-payments.
[ ] Crear supplier-payments.module.ts.
[ ] Registrar SupplierPaymentsModule en el módulo raíz.
[ ] Crear carpeta controllers.
[ ] Crear carpeta application.
[ ] Crear carpeta application/services.
[ ] Crear carpeta application/use-cases.
[ ] Crear carpeta application/ports.
[ ] Crear carpeta domain.
[ ] Crear carpeta domain/entities.
[ ] Crear carpeta domain/value-objects.
[ ] Crear carpeta domain/events.
[ ] Crear carpeta domain/errors.
[ ] Crear carpeta infrastructure.
[ ] Crear carpeta infrastructure/persistence.
[ ] Crear carpeta infrastructure/integrations.
[ ] Crear carpeta infrastructure/documents.
[ ] Crear carpeta infrastructure/accounting.
[ ] Crear carpeta infrastructure/reconciliation.
[ ] Crear carpeta infrastructure/reports.
[ ] Crear carpeta infrastructure/exports.
[ ] Crear carpeta infrastructure/audit.
[ ] Crear carpeta infrastructure/observability.
[ ] Crear carpeta dto.
[ ] Crear carpeta guards.
[ ] Crear carpeta policies.
[ ] Crear carpeta mappers.
[ ] Crear carpeta tests.
[ ] Crear barrel exports si el proyecto lo usa.
[ ] Validar que el módulo no registre rutas públicas.
[ ] Validar que el módulo no registre rutas /me.
[ ] Validar que el módulo no registre rutas de iniciación de transferencia bancaria.
[ ] Validar que el módulo no registre rutas Open Banking payment initiation.
```

---

## 5.2. Convenciones internas

### Tasks

```text id="pz09rf"
[ ] Definir naming convention supplier-payments.
[ ] Definir prefijo de errores SUPPLIER_* y SUPPLIER_PAYMENT_*.
[ ] Definir prefijo de métricas supplier_payments_*.
[ ] Definir categoría audit supplierPayments.
[ ] Definir sourceModule supplierPayments para Secure Document Storage.
[ ] Definir sourceModule supplierPayments para integraciones contables.
[ ] Definir reglas de DTO camelCase.
[ ] Definir reglas DB snake_case.
[ ] Definir uso de Decimal para dinero.
[ ] Definir uso de UTC para persistencia temporal.
[ ] Definir uso de America/Guayaquil para interpretación de fechas administrativas si aplica.
[ ] Definir criterio de soft archive.
[ ] Definir criterio de respuestas cross-tenant 404.
```

---

# 6. EPIC-021-02 — Enums, constants and configuration

## 6.1. Enums

### Tasks

```text id="uoov2u"
[ ] Implementar SupplierStatus.
[ ] Implementar SupplierType.
[ ] Implementar SupplierCategoryStatus.
[ ] Implementar SupplierContactStatus.
[ ] Implementar SupplierBankAccountStatus.
[ ] Implementar SupplierDocumentType.
[ ] Implementar SupplierDocumentStatus.
[ ] Implementar SupplierPayableDocumentType.
[ ] Implementar SupplierPayableStatus.
[ ] Implementar SupplierPayableApprovalStatus.
[ ] Implementar SupplierPaymentOrderStatus.
[ ] Implementar SupplierPaymentMethod.
[ ] Implementar SupplierPaymentEvidenceType.
[ ] Implementar SupplierPaymentEvidenceStatus.
[ ] Implementar SupplierAccountingEventType.
[ ] Implementar SupplierAccountingLinkStatus.
[ ] Implementar SupplierBankReconciliationLinkStatus.
[ ] Confirmar Currency=USD para MVP.
[ ] Validar mapeo Prisma ↔ TypeScript ↔ API.
```

---

## 6.2. Feature flags

### Tasks

```text id="j8uc2q"
[ ] Definir supplierPayments.enabled.
[ ] Definir supplierPayments.supplierRegistry.enabled.
[ ] Definir supplierPayments.bankAccounts.enabled.
[ ] Definir supplierPayments.documents.enabled.
[ ] Definir supplierPayments.payables.enabled.
[ ] Definir supplierPayments.approvals.enabled.
[ ] Definir supplierPayments.paymentOrders.enabled.
[ ] Definir supplierPayments.partialPayments.enabled.
[ ] Definir supplierPayments.paymentEvidence.enabled.
[ ] Definir supplierPayments.accountingIntegration.enabled.
[ ] Definir supplierPayments.bankReconciliationLink.enabled.
[ ] Definir supplierPayments.reports.enabled.
[ ] Definir supplierPayments.exports.enabled.
[ ] Definir supplierPayments.bankTransferInitiation.enabled=false.
[ ] Definir supplierPayments.openBankingPaymentInitiation.enabled=false.
[ ] Definir supplierPayments.electronicInvoicing.enabled=false.
[ ] Definir supplierPayments.externalAi.enabled=false.
[ ] Crear SupplierPaymentsFeatureFlagService.
[ ] Crear tests de defaults MVP.
[ ] Fallar boot si bankTransferInitiation=true en MVP.
[ ] Fallar boot si openBankingPaymentInitiation=true en MVP.
[ ] Fallar boot si electronicInvoicing=true en MVP.
[ ] Fallar boot si externalAi=true en entorno no permitido.
```

---

## 6.3. Variables de configuración

### Tasks

```text id="z0yput"
[ ] Definir SUPPLIER_PAYMENTS_ENABLED=true.
[ ] Definir SUPPLIER_PAYMENTS_DEFAULT_CURRENCY=USD.
[ ] Definir SUPPLIER_PAYMENTS_REQUIRE_PAYABLE_APPROVAL=true.
[ ] Definir SUPPLIER_PAYMENTS_REQUIRE_PAYMENT_ORDER_APPROVAL=true.
[ ] Definir SUPPLIER_PAYMENTS_REQUIRE_EVIDENCE_FOR_PAID=true.
[ ] Definir SUPPLIER_PAYMENTS_ALLOW_PARTIAL_PAYMENTS=true.
[ ] Definir SUPPLIER_PAYMENTS_ALLOW_CASH_PAYMENTS=true.
[ ] Definir SUPPLIER_PAYMENTS_ALLOW_CHECK_PAYMENTS=true.
[ ] Definir SUPPLIER_PAYMENTS_ALLOW_BANK_TRANSFER_MANUAL=true.
[ ] Definir SUPPLIER_PAYMENTS_MAX_REPORT_PAGE_SIZE=100.
[ ] Definir SUPPLIER_PAYMENTS_DUPLICATE_DETECTION_ENABLED=true.
[ ] Definir SUPPLIER_PAYMENTS_ACCOUNTING_INTEGRATION_ENABLED=true.
[ ] Definir SUPPLIER_PAYMENTS_BANK_RECONCILIATION_LINK_ENABLED=true.
[ ] Definir SUPPLIER_PAYMENTS_REPORT_EXPORT_ENABLED=true.
[ ] Definir SUPPLIER_PAYMENTS_BANK_TRANSFER_INITIATION_ENABLED=false.
[ ] Definir SUPPLIER_PAYMENTS_OPEN_BANKING_PAYMENT_INITIATION_ENABLED=false.
[ ] Definir SUPPLIER_PAYMENTS_ELECTRONIC_INVOICING_ENABLED=false.
[ ] Definir SUPPLIER_PAYMENTS_EXTERNAL_AI_ENABLED=false.
[ ] Crear SupplierPaymentsConfigService.
[ ] Validar configuración al boot.
[ ] Crear tests para configuración segura.
```

---

# 7. EPIC-021-03 — Domain value objects

## 7.1. Value objects

### Tasks

```text id="s0f1ak"
[ ] Implementar SupplierCode.
[ ] Implementar SupplierName.
[ ] Implementar SupplierIdentification.
[ ] Implementar SupplierEmail.
[ ] Implementar SupplierPhone.
[ ] Implementar SupplierBankAccountMasked.
[ ] Implementar SupplierBankAccountHash.
[ ] Implementar SupplierBeneficiaryIdentification.
[ ] Implementar SupplierPayableNumber.
[ ] Implementar SupplierExternalDocumentNumber.
[ ] Implementar SupplierPayableDuplicateFingerprint.
[ ] Implementar SupplierPaymentOrderNumber.
[ ] Implementar SupplierPaymentReference.
[ ] Implementar SupplierPaymentReferenceHash.
[ ] Implementar SupplierPaymentAmount.
[ ] Implementar SupplierOutstandingAmount.
[ ] Implementar SupplierDueDate.
[ ] Implementar SupplierPaymentDescription.
[ ] Implementar SupplierDocumentReference.
[ ] Implementar SupplierReportPeriod.
```

---

## 7.2. Validaciones de value objects

### Tasks

```text id="z0oclr"
[ ] Rechazar SupplierCode vacío.
[ ] Rechazar SupplierCode con caracteres inseguros.
[ ] Rechazar SupplierName vacío.
[ ] Rechazar HTML/script en SupplierName.
[ ] Generar identificationNumberMasked.
[ ] Generar identificationNumberHash.
[ ] No exponer identificationNumberHash en DTO estándar.
[ ] Validar SupplierEmail.
[ ] Validar SupplierPhone.
[ ] Generar accountNumberMasked desde accountNumber.
[ ] Generar accountNumberHash desde accountNumber.
[ ] No persistir accountNumber completo.
[ ] No exponer accountNumberHash en DTO estándar.
[ ] Generar beneficiaryIdentificationMasked.
[ ] Generar beneficiaryIdentificationHash.
[ ] Generar SupplierPayableNumber server-side.
[ ] Normalizar externalDocumentNumber.
[ ] Generar duplicateFingerprint.
[ ] Generar SupplierPaymentOrderNumber server-side.
[ ] Generar paymentReferenceHash.
[ ] Validar montos como string decimal.
[ ] Rechazar number/float/double como fuente de verdad.
[ ] Rechazar montos negativos.
[ ] Rechazar más de dos decimales si aplica.
[ ] Validar currency USD.
[ ] Calcular outstandingAmount con Decimal.
[ ] Validar dueDate opcional.
[ ] Rechazar storageKey como document reference.
[ ] Rechazar signedUrl como document reference.
[ ] Rechazar base64 como document reference.
```

---

# 8. EPIC-021-04 — Domain entities and state machines

## 8.1. Entidades

### Tasks

```text id="ja5gb2"
[ ] Implementar SupplierCategory.
[ ] Implementar Supplier.
[ ] Implementar SupplierContact.
[ ] Implementar SupplierBankAccount.
[ ] Implementar SupplierDocument.
[ ] Implementar SupplierPayable.
[ ] Implementar SupplierPayableApproval.
[ ] Implementar SupplierPaymentOrder.
[ ] Implementar SupplierPaymentOrderItem.
[ ] Implementar SupplierPaymentEvidence.
[ ] Implementar SupplierAccountingLink.
[ ] Implementar SupplierBankReconciliationLink.
```

---

## 8.2. State machines

### Tasks

```text id="j1kqe4"
[ ] Implementar transiciones SupplierCategory.
[ ] Implementar transiciones Supplier.
[ ] Implementar transiciones SupplierContact.
[ ] Implementar transiciones SupplierBankAccount.
[ ] Implementar transiciones SupplierDocument.
[ ] Implementar transiciones SupplierPayable.
[ ] Implementar transiciones SupplierPayableApproval.
[ ] Implementar transiciones SupplierPaymentOrder.
[ ] Implementar transiciones SupplierPaymentEvidence.
[ ] Implementar transiciones SupplierAccountingLink.
[ ] Implementar transiciones SupplierBankReconciliationLink.
[ ] Bloquear archived -> active en entidades archivadas.
[ ] Bloquear paid -> draft.
[ ] Bloquear paid -> pendingApproval.
[ ] Bloquear paid -> approved.
[ ] Bloquear rejected evidence como soporte válido de pago.
[ ] Bloquear supplier blocked para aprobación de órdenes.
[ ] Emitir eventos de dominio por transición crítica.
```

---

## 8.3. Domain events

### Tasks

```text id="beiefm"
[ ] Implementar SupplierCategoryCreatedEvent.
[ ] Implementar SupplierCategoryUpdatedEvent.
[ ] Implementar SupplierCategoryArchivedEvent.
[ ] Implementar SupplierCreatedEvent.
[ ] Implementar SupplierUpdatedEvent.
[ ] Implementar SupplierActivatedEvent.
[ ] Implementar SupplierDisabledEvent.
[ ] Implementar SupplierBlockedEvent.
[ ] Implementar SupplierArchivedEvent.
[ ] Implementar SupplierContactCreatedEvent.
[ ] Implementar SupplierContactUpdatedEvent.
[ ] Implementar SupplierContactArchivedEvent.
[ ] Implementar SupplierBankAccountCreatedEvent.
[ ] Implementar SupplierBankAccountUpdatedEvent.
[ ] Implementar SupplierBankAccountVerifiedEvent.
[ ] Implementar SupplierBankAccountDisabledEvent.
[ ] Implementar SupplierBankAccountArchivedEvent.
[ ] Implementar SupplierDocumentLinkedEvent.
[ ] Implementar SupplierDocumentArchivedEvent.
[ ] Implementar SupplierDocumentDownloadedEvent.
[ ] Implementar SupplierPayableCreatedEvent.
[ ] Implementar SupplierPayableUpdatedDraftEvent.
[ ] Implementar SupplierPayableSubmittedForReviewEvent.
[ ] Implementar SupplierPayableApprovedEvent.
[ ] Implementar SupplierPayableRejectedEvent.
[ ] Implementar SupplierPayableCancelledEvent.
[ ] Implementar SupplierPayableVoidedEvent.
[ ] Implementar SupplierPayableArchivedEvent.
[ ] Implementar SupplierPayableDuplicateDetectedEvent.
[ ] Implementar SupplierPayableApprovalCreatedEvent.
[ ] Implementar SupplierPayableApprovalApprovedEvent.
[ ] Implementar SupplierPayableApprovalRejectedEvent.
[ ] Implementar SupplierPayableApprovalCancelledEvent.
[ ] Implementar SupplierPaymentOrderCreatedEvent.
[ ] Implementar SupplierPaymentOrderUpdatedDraftEvent.
[ ] Implementar SupplierPaymentOrderSubmittedForApprovalEvent.
[ ] Implementar SupplierPaymentOrderApprovedEvent.
[ ] Implementar SupplierPaymentOrderRejectedEvent.
[ ] Implementar SupplierPaymentOrderScheduledEvent.
[ ] Implementar SupplierPaymentOrderPaidEvent.
[ ] Implementar SupplierPaymentOrderPartiallyPaidEvent.
[ ] Implementar SupplierPaymentOrderVoidedEvent.
[ ] Implementar SupplierPaymentOrderCancelledEvent.
[ ] Implementar SupplierPaymentOrderReversedEvent.
[ ] Implementar SupplierPaymentOrderArchivedEvent.
[ ] Implementar SupplierPaymentEvidenceCreatedEvent.
[ ] Implementar SupplierPaymentEvidenceVerifiedEvent.
[ ] Implementar SupplierPaymentEvidenceRejectedEvent.
[ ] Implementar SupplierPaymentEvidenceArchivedEvent.
[ ] Implementar SupplierPaymentEvidenceDownloadedEvent.
[ ] Implementar SupplierAccountingLinkCreatedEvent.
[ ] Implementar SupplierAccountingLinkFailedEvent.
[ ] Implementar SupplierAccountingLinkReversedEvent.
[ ] Implementar SupplierBankReconciliationLinkCreatedEvent.
[ ] Implementar SupplierBankReconciliationLinkUnlinkedEvent.
[ ] Implementar SupplierPaymentReportGeneratedEvent.
[ ] Implementar SupplierPaymentReportExportedEvent.
```

---

# 9. EPIC-021-05 — Domain policies and errors

## 9.1. Policies

### Tasks

```text id="ptvpeq"
[ ] Implementar SupplierTenantPolicy.
[ ] Implementar SupplierStatusPolicy.
[ ] Implementar SupplierBlockedPolicy.
[ ] Implementar SupplierCategoryPolicy.
[ ] Implementar SupplierContactPolicy.
[ ] Implementar SupplierBankAccountPrivacyPolicy.
[ ] Implementar SupplierBankAccountVerificationPolicy.
[ ] Implementar SupplierDocumentPolicy.
[ ] Implementar SupplierPayableDuplicatePolicy.
[ ] Implementar SupplierPayableAmountPolicy.
[ ] Implementar SupplierPayableApprovalPolicy.
[ ] Implementar SupplierPaymentOrderApprovalPolicy.
[ ] Implementar SupplierPaymentOrderItemPolicy.
[ ] Implementar SupplierPaymentAmountPolicy.
[ ] Implementar SupplierPaymentEvidencePolicy.
[ ] Implementar SupplierPaymentImmutabilityPolicy.
[ ] Implementar SupplierPaymentReversalPolicy.
[ ] Implementar SupplierAccountingIntegrationPolicy.
[ ] Implementar SupplierBankReconciliationBoundaryPolicy.
[ ] Implementar NoBankTransferInitiationPolicy.
[ ] Implementar NoOpenBankingPaymentInitiationPolicy.
[ ] Implementar NoPublicSupplierPaymentEndpointPolicy.
[ ] Implementar NoMeSupplierPaymentEndpointPolicy.
[ ] Implementar NoWordPressSupplierPaymentAccessPolicy.
[ ] Implementar NoExternalAiSupplierPaymentDataPolicy.
[ ] Implementar AuditSanitizationPolicy.
[ ] Implementar LogSanitizationPolicy.
```

---

## 9.2. Domain errors

### Tasks

```text id="fd7k52"
[ ] Implementar SUPPLIER_NOT_FOUND.
[ ] Implementar SUPPLIER_INVALID_STATUS.
[ ] Implementar SUPPLIER_CODE_DUPLICATE.
[ ] Implementar SUPPLIER_BLOCKED.
[ ] Implementar SUPPLIER_INACTIVE.
[ ] Implementar SUPPLIER_ARCHIVED.
[ ] Implementar SUPPLIER_CROSS_TENANT_REFERENCE.
[ ] Implementar SUPPLIER_CATEGORY_NOT_FOUND.
[ ] Implementar SUPPLIER_CATEGORY_INVALID_STATUS.
[ ] Implementar SUPPLIER_CATEGORY_CODE_DUPLICATE.
[ ] Implementar SUPPLIER_CATEGORY_CROSS_TENANT_REFERENCE.
[ ] Implementar SUPPLIER_CONTACT_NOT_FOUND.
[ ] Implementar SUPPLIER_CONTACT_INVALID_STATUS.
[ ] Implementar SUPPLIER_CONTACT_CROSS_TENANT_REFERENCE.
[ ] Implementar SUPPLIER_BANK_ACCOUNT_NOT_FOUND.
[ ] Implementar SUPPLIER_BANK_ACCOUNT_INVALID_STATUS.
[ ] Implementar SUPPLIER_BANK_ACCOUNT_UNVERIFIED.
[ ] Implementar SUPPLIER_BANK_ACCOUNT_FULL_NUMBER_FORBIDDEN.
[ ] Implementar SUPPLIER_BANK_ACCOUNT_CROSS_TENANT_REFERENCE.
[ ] Implementar SUPPLIER_DOCUMENT_NOT_FOUND.
[ ] Implementar SUPPLIER_DOCUMENT_STORAGE_KEY_FORBIDDEN.
[ ] Implementar SUPPLIER_DOCUMENT_CROSS_TENANT_REFERENCE.
[ ] Implementar SUPPLIER_PAYABLE_NOT_FOUND.
[ ] Implementar SUPPLIER_PAYABLE_INVALID_STATUS.
[ ] Implementar SUPPLIER_PAYABLE_DUPLICATE_DETECTED.
[ ] Implementar SUPPLIER_PAYABLE_AMOUNT_INVALID.
[ ] Implementar SUPPLIER_PAYABLE_OUTSTANDING_INVALID.
[ ] Implementar SUPPLIER_PAYABLE_APPROVAL_REQUIRED.
[ ] Implementar SUPPLIER_PAYABLE_CROSS_TENANT_REFERENCE.
[ ] Implementar SUPPLIER_PAYABLE_APPROVAL_NOT_FOUND.
[ ] Implementar SUPPLIER_PAYABLE_APPROVAL_INVALID_STATUS.
[ ] Implementar SUPPLIER_PAYMENT_ORDER_NOT_FOUND.
[ ] Implementar SUPPLIER_PAYMENT_ORDER_INVALID_STATUS.
[ ] Implementar SUPPLIER_PAYMENT_ORDER_NO_ITEMS.
[ ] Implementar SUPPLIER_PAYMENT_ORDER_APPROVAL_REQUIRED.
[ ] Implementar SUPPLIER_PAYMENT_ORDER_AMOUNT_INVALID.
[ ] Implementar SUPPLIER_PAYMENT_ORDER_OVERPAYMENT.
[ ] Implementar SUPPLIER_PAYMENT_ORDER_EVIDENCE_REQUIRED.
[ ] Implementar SUPPLIER_PAYMENT_ORDER_ALREADY_PAID.
[ ] Implementar SUPPLIER_PAYMENT_ORDER_REVERSAL_FORBIDDEN.
[ ] Implementar SUPPLIER_PAYMENT_ORDER_CROSS_TENANT_REFERENCE.
[ ] Implementar SUPPLIER_PAYMENT_ORDER_ITEM_INVALID.
[ ] Implementar SUPPLIER_PAYMENT_ORDER_ITEM_AMOUNT_INVALID.
[ ] Implementar SUPPLIER_PAYMENT_ORDER_ITEM_PAYABLE_NOT_APPROVED.
[ ] Implementar SUPPLIER_PAYMENT_ORDER_ITEM_OVERPAYMENT.
[ ] Implementar SUPPLIER_PAYMENT_ORDER_ITEM_CROSS_TENANT_REFERENCE.
[ ] Implementar SUPPLIER_PAYMENT_EVIDENCE_NOT_FOUND.
[ ] Implementar SUPPLIER_PAYMENT_EVIDENCE_INVALID_STATUS.
[ ] Implementar SUPPLIER_PAYMENT_EVIDENCE_REJECTED.
[ ] Implementar SUPPLIER_PAYMENT_EVIDENCE_CROSS_TENANT_REFERENCE.
[ ] Implementar SUPPLIER_ACCOUNTING_LINK_FAILED.
[ ] Implementar SUPPLIER_ACCOUNTING_LINK_NOT_FOUND.
[ ] Implementar SUPPLIER_ACCOUNTING_POSTING_FORBIDDEN.
[ ] Implementar SUPPLIER_BANK_RECONCILIATION_LINK_NOT_FOUND.
[ ] Implementar SUPPLIER_BANK_RECONCILIATION_LINK_INVALID.
[ ] Implementar SUPPLIER_BANK_RECONCILIATION_CONFIRMATION_FORBIDDEN.
[ ] Implementar SUPPLIER_PAYMENT_REPORT_FORBIDDEN.
[ ] Implementar SUPPLIER_PAYMENT_REPORT_EXPORT_FAILED.
[ ] Implementar SUPPLIER_PAYMENT_PUBLIC_ENDPOINT_FORBIDDEN.
[ ] Implementar SUPPLIER_PAYMENT_ME_ENDPOINT_FORBIDDEN.
[ ] Implementar SUPPLIER_PAYMENT_WORDPRESS_ACCESS_FORBIDDEN.
[ ] Implementar SUPPLIER_PAYMENT_BANK_TRANSFER_INITIATION_FORBIDDEN.
[ ] Implementar SUPPLIER_PAYMENT_OPEN_BANKING_PAYMENT_INITIATION_FORBIDDEN.
[ ] Implementar SUPPLIER_PAYMENT_ELECTRONIC_INVOICING_FORBIDDEN.
[ ] Implementar SUPPLIER_PAYMENT_EXTERNAL_AI_FORBIDDEN.
```

---

# 10. EPIC-021-06 — Database schema and migrations

## 10.1. Prisma schema

### Tasks

```text id="jpf1m4"
[ ] Agregar enums Supplier Payments en Prisma.
[ ] Crear modelo SupplierCategory.
[ ] Crear modelo Supplier.
[ ] Crear modelo SupplierContact.
[ ] Crear modelo SupplierBankAccount.
[ ] Crear modelo SupplierDocument.
[ ] Crear modelo SupplierPayable.
[ ] Crear modelo SupplierPayableApproval.
[ ] Crear modelo SupplierPaymentOrder.
[ ] Crear modelo SupplierPaymentOrderItem.
[ ] Crear modelo SupplierPaymentEvidence.
[ ] Crear modelo SupplierAccountingLink.
[ ] Crear modelo SupplierBankReconciliationLink.
[ ] Agregar relaciones con Tenant.
[ ] Agregar relaciones con SecureDocument.
[ ] Agregar relaciones con BankAccount.
[ ] Agregar relaciones con BankTransaction.
[ ] Agregar relaciones con ReconciliationMatch.
[ ] Agregar relaciones con JournalEntry.
[ ] Extender SourceModule de Secure Document Storage con supplierPayments.
[ ] Validar que todas las tablas operativas tengan tenantId.
[ ] Validar Decimal(12,2) en todos los montos.
```

---

## 10.2. Migración

### Tasks

```text id="oq2th3"
[ ] Crear migración 021_create_supplier_payments.
[ ] Crear enums.
[ ] Crear supplier_categories.
[ ] Crear suppliers.
[ ] Crear supplier_contacts.
[ ] Crear supplier_bank_accounts.
[ ] Crear supplier_documents.
[ ] Crear supplier_payables.
[ ] Crear supplier_payable_approvals.
[ ] Crear supplier_payment_orders.
[ ] Crear supplier_payment_order_items.
[ ] Crear supplier_payment_evidence.
[ ] Crear supplier_accounting_links.
[ ] Crear supplier_bank_reconciliation_links.
[ ] Crear foreign keys.
[ ] Crear índices básicos.
[ ] Crear índices por tenant_id.
[ ] Crear índices por supplier_id.
[ ] Crear índices por status.
[ ] Crear índices por due_date.
[ ] Crear índices por planned_payment_date.
[ ] Crear índices por actual_payment_date.
[ ] Crear índices por payment_method.
[ ] Crear índices parciales raw SQL.
[ ] Crear constraints raw SQL.
[ ] Ejecutar prisma migrate en local.
[ ] Ejecutar prisma generate.
[ ] Validar migración en entorno test.
[ ] Documentar rollback si aplica.
```

---

## 10.3. Índices parciales críticos

### Tasks

```text id="o8xach"
[ ] Crear unique supplierCategory categoryCode por tenant.
[ ] Crear unique supplierCode por tenant.
[ ] Crear unique identificationNumberHash opcional por tenant.
[ ] Crear unique primary contact activo por supplier si policy aplica.
[ ] Crear unique active/verified supplier bank account hash por supplier.
[ ] Crear unique supplier document link activo.
[ ] Crear unique payableNumber por tenant.
[ ] Crear índice duplicateFingerprint para payables.
[ ] Crear índice payables aging.
[ ] Crear unique pending approval step.
[ ] Crear unique paymentOrderNumber por tenant.
[ ] Crear índice paymentReferenceHash.
[ ] Crear unique payment order item lineNumber.
[ ] Crear unique payable per payment order.
[ ] Crear unique supplier accounting link por payable/event.
[ ] Crear unique supplier accounting link por order/event.
[ ] Crear unique reconciliation link por order/bankTransaction.
[ ] Crear unique reconciliation link por order/reconciliationMatch.
```

---

## 10.4. Constraints

### Tasks

```text id="oexbma"
[ ] Constraint supplier_payables amounts non-negative.
[ ] Constraint supplier_payables totalAmount consistent.
[ ] Constraint supplier_payables outstandingAmount <= totalAmount.
[ ] Constraint supplier_payables paid requires outstandingAmount = 0.
[ ] Constraint supplier_payables partiallyPaid requires intermediate outstanding.
[ ] Constraint supplier_payables approved fields.
[ ] Constraint supplier_payables rejected fields.
[ ] Constraint supplier_payables cancelled fields.
[ ] Constraint supplier_payables voided fields.
[ ] Constraint supplier_payment_orders amounts non-negative.
[ ] Constraint supplier_payment_orders paidAmount <= totalAmount.
[ ] Constraint supplier_payment_orders paid requires paidAt.
[ ] Constraint supplier_payment_orders paid requires reference or document.
[ ] Constraint supplier_payment_orders rejected fields.
[ ] Constraint supplier_payment_order_items amount > 0.
[ ] Constraint supplier_payment_evidence amount non-negative.
[ ] Constraint supplier_payment_evidence verified fields.
[ ] Constraint supplier_payment_evidence rejected fields.
[ ] Constraint supplier_accounting_links target exists.
[ ] Constraint supplier_accounting_links failed fields.
[ ] Constraint supplier_bank_reconciliation_links target exists.
```

---

# 11. EPIC-021-07 — Repository layer

## 11.1. Repository ports

### Tasks

```text id="y95mk7"
[ ] Crear SupplierCategoryRepositoryPort.
[ ] Crear SupplierRepositoryPort.
[ ] Crear SupplierContactRepositoryPort.
[ ] Crear SupplierBankAccountRepositoryPort.
[ ] Crear SupplierDocumentRepositoryPort.
[ ] Crear SupplierPayableRepositoryPort.
[ ] Crear SupplierPayableApprovalRepositoryPort.
[ ] Crear SupplierPaymentOrderRepositoryPort.
[ ] Crear SupplierPaymentOrderItemRepositoryPort.
[ ] Crear SupplierPaymentEvidenceRepositoryPort.
[ ] Crear SupplierAccountingLinkRepositoryPort.
[ ] Crear SupplierBankReconciliationLinkRepositoryPort.
```

---

## 11.2. Prisma repositories

### Tasks

```text id="tm20lp"
[ ] Implementar PrismaSupplierCategoryRepository.
[ ] Implementar PrismaSupplierRepository.
[ ] Implementar PrismaSupplierContactRepository.
[ ] Implementar PrismaSupplierBankAccountRepository.
[ ] Implementar PrismaSupplierDocumentRepository.
[ ] Implementar PrismaSupplierPayableRepository.
[ ] Implementar PrismaSupplierPayableApprovalRepository.
[ ] Implementar PrismaSupplierPaymentOrderRepository.
[ ] Implementar PrismaSupplierPaymentOrderItemRepository.
[ ] Implementar PrismaSupplierPaymentEvidenceRepository.
[ ] Implementar PrismaSupplierAccountingLinkRepository.
[ ] Implementar PrismaSupplierBankReconciliationLinkRepository.
[ ] Usar findFirst con tenantId para búsquedas por id.
[ ] Prohibir findUnique por id simple en entidades tenant-scoped.
[ ] Excluir archived por defecto.
[ ] Implementar filtros del API Contract.
[ ] Implementar paginación estándar.
[ ] Implementar ordenamiento seguro.
[ ] Implementar transacciones para approve, mark-paid, reverse y reconciliation link.
```

---

# 12. EPIC-021-08 — Supplier categories

## 12.1. Service

### Tasks

```text id="ug5khg"
[ ] Crear SupplierCategoryService.
[ ] Implementar create.
[ ] Implementar list.
[ ] Implementar get.
[ ] Implementar update.
[ ] Implementar archive.
[ ] Validar categoryCode único por tenant.
[ ] Validar categoryName requerido.
[ ] Validar status.
[ ] Bloquear uso de archived para nuevos suppliers.
[ ] Emitir auditoría.
```

---

## 12.2. DTOs

### Tasks

```text id="sacva1"
[ ] Crear CreateSupplierCategoryDto.
[ ] Crear UpdateSupplierCategoryDto.
[ ] Crear ArchiveSupplierCategoryDto.
[ ] Crear SupplierCategoryDto.
[ ] Crear SupplierCategoryListItemDto.
[ ] Crear SupplierCategoryFilterDto.
[ ] Rechazar tenantId.
[ ] Rechazar actor fields.
[ ] Rechazar status directo salvo transición permitida.
```

---

# 13. EPIC-021-09 — Suppliers

## 13.1. Service

### Tasks

```text id="idvq5r"
[ ] Crear SupplierService.
[ ] Implementar create.
[ ] Implementar list.
[ ] Implementar get.
[ ] Implementar update.
[ ] Implementar activate.
[ ] Implementar disable.
[ ] Implementar block.
[ ] Implementar archive.
[ ] Validar supplierCode único por tenant.
[ ] Validar supplierName requerido.
[ ] Generar supplierCode server-side si no se envía y la política lo permite.
[ ] Generar identificationNumberMasked.
[ ] Generar identificationNumberHash.
[ ] Validar categoryId tenant-scoped.
[ ] Validar defaultExpenseAccountId tenant-scoped.
[ ] Validar defaultAccountsPayableAccountId tenant-scoped.
[ ] Rechazar operaciones nuevas en supplier archived.
[ ] Rechazar nuevas obligaciones para inactive/archived.
[ ] Rechazar aprobación de órdenes para blocked.
[ ] Emitir auditoría.
```

---

## 13.2. DTOs

### Tasks

```text id="fukcj2"
[ ] Crear CreateSupplierDto.
[ ] Crear UpdateSupplierDto.
[ ] Crear ActivateSupplierDto.
[ ] Crear DisableSupplierDto.
[ ] Crear BlockSupplierDto.
[ ] Crear ArchiveSupplierDto.
[ ] Crear SupplierDto.
[ ] Crear SupplierListItemDto.
[ ] Crear SupplierFilterDto.
[ ] Rechazar tenantId.
[ ] Rechazar status directo.
[ ] Rechazar actor fields.
[ ] Rechazar identificationNumberHash desde cliente.
[ ] No devolver identificationNumber completo.
[ ] No devolver identificationNumberHash.
```

---

# 14. EPIC-021-10 — Supplier contacts

## 14.1. Service

### Tasks

```text id="plxahd"
[ ] Crear SupplierContactService.
[ ] Implementar create.
[ ] Implementar list by supplier.
[ ] Implementar get.
[ ] Implementar update.
[ ] Implementar archive.
[ ] Validar supplierId tenant-scoped.
[ ] Validar supplier no archived.
[ ] Validar email si se envía.
[ ] Validar phone si se envía.
[ ] Implementar primary contact único si policy activa.
[ ] Reemplazar primary contact anterior si policy lo permite.
[ ] Emitir auditoría.
```

---

## 14.2. DTOs

### Tasks

```text id="h9i3dp"
[ ] Crear CreateSupplierContactDto.
[ ] Crear UpdateSupplierContactDto.
[ ] Crear ArchiveSupplierContactDto.
[ ] Crear SupplierContactDto.
[ ] Crear SupplierContactListItemDto.
[ ] Rechazar tenantId.
[ ] Rechazar supplierId cross-tenant.
[ ] Rechazar actor fields.
[ ] Rechazar status directo.
```

---

# 15. EPIC-021-11 — Supplier bank accounts

## 15.1. Service

### Tasks

```text id="zo6r75"
[ ] Crear SupplierBankAccountService.
[ ] Implementar create.
[ ] Implementar list by supplier.
[ ] Implementar get.
[ ] Implementar update.
[ ] Implementar verify.
[ ] Implementar disable.
[ ] Implementar archive.
[ ] Validar supplierId tenant-scoped.
[ ] Validar supplier no archived.
[ ] Validar bankName requerido.
[ ] Validar accountNumber recibido solo para masked/hash.
[ ] Generar accountNumberMasked.
[ ] Generar accountNumberHash.
[ ] Generar beneficiaryIdentificationMasked.
[ ] Generar beneficiaryIdentificationHash.
[ ] Validar accountNumberHash único para active/verified.
[ ] No persistir full bank account number.
[ ] No devolver accountNumber completo.
[ ] No devolver accountNumberHash.
[ ] Bloquear rejected para uso en órdenes.
[ ] Bloquear archived para uso en órdenes.
[ ] Emitir auditoría.
```

---

## 15.2. DTOs

### Tasks

```text id="ch3x4y"
[ ] Crear CreateSupplierBankAccountDto.
[ ] Crear UpdateSupplierBankAccountDto.
[ ] Crear VerifySupplierBankAccountDto.
[ ] Crear DisableSupplierBankAccountDto.
[ ] Crear ArchiveSupplierBankAccountDto.
[ ] Crear SupplierBankAccountDto.
[ ] Crear SupplierBankAccountListItemDto.
[ ] Rechazar tenantId.
[ ] Rechazar accountNumberHash desde cliente.
[ ] Rechazar beneficiaryIdentificationHash desde cliente.
[ ] Rechazar fullBankAccountNumber.
[ ] Rechazar bank credentials.
[ ] Rechazar OTP/MFA/token fields.
```

---

# 16. EPIC-021-12 — Supplier documents

## 16.1. Service

### Tasks

```text id="jrkbyz"
[ ] Crear SupplierDocumentService.
[ ] Implementar link document.
[ ] Implementar list by supplier.
[ ] Implementar get.
[ ] Implementar archive.
[ ] Validar supplierId tenant-scoped.
[ ] Validar secureDocumentId tenant-scoped.
[ ] Validar sourceModule compatible si aplica.
[ ] Validar documentType.
[ ] No exponer storageKey.
[ ] No exponer signedUrl persistente.
[ ] Responder downloadAvailable.
[ ] Integrar descarga vía 016-secure-document-storage.
[ ] Emitir auditoría supplierDocument.linked.
[ ] Emitir auditoría supplierDocument.archived.
[ ] Emitir auditoría supplierDocument.downloaded cuando aplique.
```

---

## 16.2. DTOs

### Tasks

```text id="s0qdd5"
[ ] Crear LinkSupplierDocumentDto.
[ ] Crear ArchiveSupplierDocumentDto.
[ ] Crear SupplierDocumentDto.
[ ] Crear SupplierDocumentListItemDto.
[ ] Rechazar tenantId.
[ ] Rechazar storageKey.
[ ] Rechazar signedUrl.
[ ] Rechazar base64.
[ ] Rechazar binary payload.
```

---

# 17. EPIC-021-13 — Supplier payables

## 17.1. Service

### Tasks

```text id="r5d6be"
[ ] Crear SupplierPayableService.
[ ] Implementar create.
[ ] Implementar list.
[ ] Implementar get.
[ ] Implementar updateDraft.
[ ] Implementar submitReview.
[ ] Implementar approve.
[ ] Implementar reject.
[ ] Implementar cancel.
[ ] Implementar void.
[ ] Implementar archive.
[ ] Validar supplierId tenant-scoped.
[ ] Validar supplier active para crear.
[ ] Rechazar supplier inactive.
[ ] Rechazar supplier archived.
[ ] Validar categoryId tenant-scoped.
[ ] Validar expenseAccountId tenant-scoped.
[ ] Validar accountsPayableAccountId tenant-scoped.
[ ] Validar secureDocumentId tenant-scoped.
[ ] Generar payableNumber server-side.
[ ] Normalizar externalDocumentNumber.
[ ] Calcular totalAmount server-side.
[ ] Calcular outstandingAmount inicial.
[ ] Calcular duplicateFingerprint.
[ ] Ejecutar duplicate detection.
[ ] Bloquear update de approved/paid.
[ ] Bloquear pago de rejected/cancelled/voided.
[ ] Actualizar status según outstandingAmount.
[ ] Emitir evento supplierPayable.created.
[ ] Emitir evento supplierPayable.duplicateDetected.
[ ] Emitir evento supplierPayable.approved.
[ ] Emitir auditoría.
```

---

## 17.2. Duplicate detection

### Tasks

```text id="xbpyx4"
[ ] Crear SupplierDuplicateDetectionService.
[ ] Implementar fingerprint sha256(tenantId + supplierId + externalDocumentNumberNormalized + issueDate + totalAmount).
[ ] Detectar duplicado activo.
[ ] Ignorar archived si policy aplica.
[ ] Ignorar voided/cancelled si policy aplica.
[ ] Rechazar duplicado crítico si policy bloquea.
[ ] Emitir warning controlado si policy permite continuar.
[ ] Auditar duplicateDetected.
[ ] Probar tenant distinto no duplica.
```

---

## 17.3. DTOs

### Tasks

```text id="w08riq"
[ ] Crear CreateSupplierPayableDto.
[ ] Crear UpdateDraftSupplierPayableDto.
[ ] Crear SubmitSupplierPayableReviewDto.
[ ] Crear ApproveSupplierPayableDto.
[ ] Crear RejectSupplierPayableDto.
[ ] Crear CancelSupplierPayableDto.
[ ] Crear VoidSupplierPayableDto.
[ ] Crear ArchiveSupplierPayableDto.
[ ] Crear SupplierPayableDto.
[ ] Crear SupplierPayableListItemDto.
[ ] Crear SupplierPayableFilterDto.
[ ] Rechazar tenantId.
[ ] Rechazar status directo.
[ ] Rechazar actor fields.
[ ] Rechazar totalAmount como fuente de verdad no autorizada.
[ ] Rechazar outstandingAmount.
[ ] Rechazar duplicateFingerprint.
[ ] Rechazar monto number/float.
```

---

# 18. EPIC-021-14 — Supplier payable approvals

## 18.1. Service

### Tasks

```text id="q7k44c"
[ ] Crear SupplierPayableApprovalService.
[ ] Implementar create pending approval.
[ ] Implementar approve.
[ ] Implementar reject.
[ ] Implementar cancel.
[ ] Implementar list by payable.
[ ] Validar supplierPayableId tenant-scoped.
[ ] Validar payable pendingReview.
[ ] Validar approvalStep.
[ ] Validar unique pending step.
[ ] Requerir reason para reject.
[ ] Setear approvedAt/approvedBy server-side.
[ ] Setear rejectedAt/rejectedBy server-side.
[ ] Emitir auditoría.
```

---

## 18.2. DTOs

### Tasks

```text id="tc3voz"
[ ] Crear SupplierPayableApprovalDto.
[ ] Crear SupplierPayableApprovalListItemDto.
[ ] Crear ApproveSupplierPayableApprovalDto.
[ ] Crear RejectSupplierPayableApprovalDto.
[ ] Crear CancelSupplierPayableApprovalDto.
[ ] Rechazar tenantId.
[ ] Rechazar actor fields.
[ ] Rechazar approvalStatus directo fuera de transición.
```

---

# 19. EPIC-021-15 — Supplier payment orders and items

## 19.1. Payment order service

### Tasks

```text id="cirm3l"
[ ] Crear SupplierPaymentOrderService.
[ ] Implementar create.
[ ] Implementar list.
[ ] Implementar get.
[ ] Implementar updateDraft.
[ ] Implementar submitApproval.
[ ] Implementar approve.
[ ] Implementar reject.
[ ] Implementar schedule.
[ ] Implementar void.
[ ] Implementar cancel.
[ ] Implementar archive.
[ ] Generar paymentOrderNumber server-side.
[ ] Validar supplierId tenant-scoped.
[ ] Validar supplier active.
[ ] Rechazar approve si supplier blocked.
[ ] Validar supplierBankAccountId tenant-scoped.
[ ] Validar supplierBankAccount active/verified según policy.
[ ] Validar bankAccountId tenant-scoped.
[ ] Validar paymentMethod permitido en MVP.
[ ] Calcular totalAmount desde items.
[ ] Inicializar paidAmount en 0.
[ ] Rechazar order sin items para submit/approve.
[ ] Rechazar update de paid.
[ ] Rechazar update destructivo de reversed.
[ ] Emitir auditoría.
```

---

## 19.2. Payment order item service

### Tasks

```text id="ur2bpq"
[ ] Crear SupplierPaymentOrderItemService.
[ ] Implementar create items.
[ ] Implementar replace items en draft.
[ ] Implementar list by order.
[ ] Validar supplierPaymentOrderId tenant-scoped.
[ ] Validar supplierPayableId tenant-scoped.
[ ] Validar payable approved/partiallyPaid.
[ ] Validar payable supplierId igual al supplierId de la orden.
[ ] Validar amount > 0.
[ ] Validar amount <= outstandingAmount.
[ ] Asignar lineNumber server-side.
[ ] Validar currency USD.
[ ] Rechazar duplicate payable in same order.
[ ] Recalcular totalAmount.
```

---

## 19.3. DTOs

### Tasks

```text id="aqim4j"
[ ] Crear CreateSupplierPaymentOrderDto.
[ ] Crear UpdateDraftSupplierPaymentOrderDto.
[ ] Crear CreateSupplierPaymentOrderItemDto.
[ ] Crear SubmitSupplierPaymentOrderApprovalDto.
[ ] Crear ApproveSupplierPaymentOrderDto.
[ ] Crear RejectSupplierPaymentOrderDto.
[ ] Crear ScheduleSupplierPaymentOrderDto.
[ ] Crear VoidSupplierPaymentOrderDto.
[ ] Crear CancelSupplierPaymentOrderDto.
[ ] Crear ArchiveSupplierPaymentOrderDto.
[ ] Crear SupplierPaymentOrderDto.
[ ] Crear SupplierPaymentOrderItemDto.
[ ] Crear SupplierPaymentOrderListItemDto.
[ ] Crear SupplierPaymentOrderFilterDto.
[ ] Rechazar tenantId.
[ ] Rechazar status directo.
[ ] Rechazar actor fields.
[ ] Rechazar totalAmount como fuente de verdad.
[ ] Rechazar paidAmount fuera de mark-paid controlado.
[ ] Rechazar payment initiation fields.
[ ] Rechazar Open Banking payment initiation fields.
```

---

# 20. EPIC-021-16 — Mark-paid, evidence and partial payments

## 20.1. Mark-paid flow

### Tasks

```text id="iiffoq"
[ ] Implementar markPaid en SupplierPaymentOrderService.
[ ] Validar order tenant-scoped.
[ ] Validar status approved o scheduled.
[ ] Validar aprobación previa.
[ ] Validar paidAmount > 0.
[ ] Validar paidAmount <= totalAmount.
[ ] Validar paymentReference o secureDocumentId.
[ ] Validar secureDocumentId tenant-scoped si se envía.
[ ] Validar no supplier blocked al momento de pago si policy aplica.
[ ] Actualizar actualPaymentDate.
[ ] Actualizar paymentReference.
[ ] Generar paymentReferenceHash.
[ ] Actualizar paidAmount.
[ ] Actualizar status paid o partiallyPaid.
[ ] Actualizar outstandingAmount de payables relacionados.
[ ] Marcar payables como paid o partiallyPaid.
[ ] Emitir evento supplierPaymentOrder.paid.
[ ] Invocar Accounting Ledger si createAccountingEvent=true y flag activo.
[ ] No iniciar transferencia bancaria.
[ ] No iniciar Open Banking payment.
[ ] No confirmar conciliación bancaria.
[ ] Ejecutar todo en transacción.
[ ] Emitir auditoría.
```

---

## 20.2. Payment evidence service

### Tasks

```text id="nloz9o"
[ ] Crear SupplierPaymentEvidenceService.
[ ] Implementar create evidence.
[ ] Implementar list by payment order.
[ ] Implementar get evidence.
[ ] Implementar verify.
[ ] Implementar reject.
[ ] Implementar archive.
[ ] Validar paymentOrderId tenant-scoped.
[ ] Validar secureDocumentId tenant-scoped si existe.
[ ] Validar evidenceType.
[ ] Validar paymentReference.
[ ] Generar paymentReferenceHash.
[ ] Validar amount Decimal si existe.
[ ] Validar currency USD.
[ ] Rechazar rejected como soporte válido.
[ ] No exponer storageKey.
[ ] No exponer signedUrl persistente.
[ ] Emitir auditoría.
```

---

## 20.3. Partial payments

### Tasks

```text id="iyqnzp"
[ ] Crear SupplierPaymentAmountService.
[ ] Implementar calculatePayableOutstanding.
[ ] Implementar calculatePaymentOrderTotal.
[ ] Implementar applyPartialPayment.
[ ] Implementar applyFullPayment.
[ ] Implementar recalculatePayableStatus.
[ ] Ignorar payment orders voided/cancelled/reversed según política.
[ ] Rechazar outstandingAmount negativo.
[ ] Rechazar overpayment.
[ ] Rechazar item amount mayor al outstanding.
[ ] Probar múltiples pagos parciales.
[ ] Probar concurrencia de pagos parciales.
```

---

## 20.4. DTOs

### Tasks

```text id="t6s03d"
[ ] Crear MarkSupplierPaymentOrderPaidDto.
[ ] Crear CreateSupplierPaymentEvidenceDto.
[ ] Crear VerifySupplierPaymentEvidenceDto.
[ ] Crear RejectSupplierPaymentEvidenceDto.
[ ] Crear ArchiveSupplierPaymentEvidenceDto.
[ ] Crear SupplierPaymentEvidenceDto.
[ ] Crear SupplierPaymentEvidenceListItemDto.
[ ] Rechazar tenantId.
[ ] Rechazar paidBy.
[ ] Rechazar verifiedBy.
[ ] Rechazar rejectedBy.
[ ] Rechazar storageKey.
[ ] Rechazar signedUrl.
[ ] Rechazar base64.
```

---

# 21. EPIC-021-17 — Reversal and correction flow

## 21.1. Reversal service

### Tasks

```text id="m1r88s"
[ ] Crear SupplierPaymentReversalService.
[ ] Implementar reverse payment order.
[ ] Validar paymentOrder tenant-scoped.
[ ] Validar status paid o partiallyPaid.
[ ] Rechazar draft.
[ ] Rechazar pendingApproval.
[ ] Rechazar rejected.
[ ] Rechazar voided.
[ ] Rechazar cancelled.
[ ] Rechazar archived.
[ ] Requerir reason.
[ ] Recalcular outstandingAmount de payables.
[ ] Marcar payment order como reversed o mantener paid con reversal record según decisión final.
[ ] Crear evento supplierPaymentOrder.reversed.
[ ] Invocar Accounting Ledger para reversal si createAccountingReversal=true.
[ ] Desvincular conciliación si unlinkReconciliation=true y policy lo permite.
[ ] No editar evidencia histórica.
[ ] No editar JournalEntry posted.
[ ] Ejecutar en transacción.
[ ] Emitir auditoría.
```

---

## 21.2. Correction strategy

### Tasks

```text id="wrze7p"
[ ] Documentar flujo payment order reversal.
[ ] Documentar flujo supplier payable adjustment futuro.
[ ] Documentar flujo accounting reversal.
[ ] Documentar flujo bank reconciliation unlink.
[ ] Prohibir edición destructiva de paid order.
[ ] Prohibir edición destructiva de evidence histórica.
[ ] Prohibir borrado físico de pagos registrados.
```

---

# 22. EPIC-021-18 — Secure Document Storage integration

## 22.1. Port

### Tasks

```text id="gv5vh7"
[ ] Crear SecureDocumentStoragePort.
[ ] Implementar validateDocumentBelongsToTenant.
[ ] Implementar createSupplierReportExportDocument.
[ ] Implementar getDownloadAvailability.
[ ] Implementar auditDownloadDelegation.
[ ] Validar sourceModule supplierPayments.
[ ] Validar visibility administrative.
[ ] Validar sensitivity restricted.
```

---

## 22.2. Integration

### Tasks

```text id="nz1ya9"
[ ] Integrar SupplierDocument con SecureDocument.
[ ] Integrar SupplierPayable con SecureDocument.
[ ] Integrar SupplierPaymentOrder con SecureDocument.
[ ] Integrar SupplierPaymentEvidence con SecureDocument.
[ ] Integrar SupplierPaymentReportExport con SecureDocument.
[ ] No exponer storageKey.
[ ] No exponer signedUrl persistente.
[ ] No persistir base64.
[ ] Auditar descargas.
[ ] Crear tests SDS.
```

---

# 23. EPIC-021-19 — Accounting Ledger integration

## 23.1. Port

### Tasks

```text id="bqbke7"
[ ] Crear SupplierAccountingLedgerPort.
[ ] Implementar postSupplierPayableApproved.
[ ] Implementar postSupplierPaymentRecorded.
[ ] Implementar postSupplierPaymentReversed.
[ ] Definir DTO PostSupplierPayableApprovedInput.
[ ] Definir DTO PostSupplierPaymentRecordedInput.
[ ] Definir DTO PostSupplierPaymentReversedInput.
[ ] Definir SupplierAccountingResult.
[ ] Asegurar idempotencia por source event.
```

---

## 23.2. Integration service

### Tasks

```text id="vis1a3"
[ ] Crear SupplierAccountingIntegrationService.
[ ] Integrar supplierPayable.approved.
[ ] Integrar supplierPaymentOrder.paid.
[ ] Integrar supplierPaymentOrder.partiallyPaid.
[ ] Integrar supplierPaymentOrder.reversed.
[ ] Crear SupplierAccountingLink active en éxito.
[ ] Crear SupplierAccountingLink failed en error.
[ ] Guardar errorCode sanitizado.
[ ] Guardar errorMessage sanitizado.
[ ] Reintentar de forma controlada si aplica.
[ ] No escribir JournalEntry por SQL directo.
[ ] No editar JournalEntry posted.
[ ] No crear Payment ni PaymentAllocation.
[ ] Emitir auditoría supplierAccountingLink.created.
[ ] Emitir auditoría supplierAccountingLink.failed.
```

---

# 24. EPIC-021-20 — Bank Reconciliation link integration

## 24.1. Port

### Tasks

```text id="b7t653"
[ ] Crear SupplierBankReconciliationPort.
[ ] Implementar findCandidateBankTransactions.
[ ] Implementar linkPaymentOrderToBankTransaction.
[ ] Implementar unlinkPaymentOrderFromBankTransaction.
[ ] Definir BankTransactionCandidate.
[ ] Definir LinkSupplierPaymentOrderToBankTransactionInput.
[ ] Definir SupplierBankReconciliationLinkResult.
```

---

## 24.2. Link service

### Tasks

```text id="g4bx8l"
[ ] Crear SupplierBankReconciliationLinkService.
[ ] Implementar list links by payment order.
[ ] Implementar create link.
[ ] Implementar unlink.
[ ] Validar paymentOrder tenant-scoped.
[ ] Validar paymentOrder paid/partiallyPaid si policy aplica.
[ ] Validar bankTransactionId tenant-scoped.
[ ] Validar reconciliationMatchId tenant-scoped.
[ ] Validar al menos bankTransactionId o reconciliationMatchId.
[ ] Validar compatibilidad de monto si policy aplica.
[ ] Validar compatibilidad de fecha si policy aplica.
[ ] Validar compatibilidad de referencia si policy aplica.
[ ] No crear ReconciliationMatch final.
[ ] No marcar BankTransaction matched.
[ ] No cerrar ReconciliationSession.
[ ] No marcar Payment reconciled.
[ ] Emitir auditoría link/unlink.
```

---

# 25. EPIC-021-21 — Reports and exports

## 25.1. Report service

### Tasks

```text id="u0aq1f"
[ ] Crear SupplierPaymentReportService.
[ ] Implementar payables aging report.
[ ] Implementar payments by supplier report.
[ ] Implementar expenses by category report.
[ ] Implementar cash outflow report.
[ ] Aplicar tenantId en todas las consultas.
[ ] Aplicar permisos por reporte.
[ ] Implementar filtros del API contract.
[ ] Usar Decimal en totales.
[ ] Exponer montos como string decimal.
[ ] Implementar pageSize max 100.
[ ] Excluir archived por defecto.
[ ] No incluir datos tenant B.
[ ] No mutar datos al generar reportes.
[ ] Emitir auditoría supplierPaymentReport.generated.
```

---

## 25.2. Export service

### Tasks

```text id="u8hsyj"
[ ] Crear SupplierPaymentExportService.
[ ] Implementar export payablesAging.
[ ] Implementar export paymentsBySupplier.
[ ] Implementar export expensesByCategory.
[ ] Implementar export cashOutflow.
[ ] Soportar csv.
[ ] Soportar xlsx si plataforma lo soporta.
[ ] Soportar pdf si plataforma lo soporta.
[ ] Integrar Secure Document Storage.
[ ] Usar sourceModule=supplierPayments.
[ ] Usar visibility=administrative.
[ ] Usar sensitivity=restricted.
[ ] No exponer storageKey.
[ ] No exponer signedUrl persistente.
[ ] Emitir auditoría supplierPaymentReport.exported.
```

---

# 26. EPIC-021-22 — REST API controllers

## 26.1. Controllers

### Tasks

```text id="t4u96b"
[ ] Crear SupplierCategoriesController.
[ ] Crear SuppliersController.
[ ] Crear SupplierContactsController.
[ ] Crear SupplierBankAccountsController.
[ ] Crear SupplierDocumentsController.
[ ] Crear SupplierPayablesController.
[ ] Crear SupplierPayableApprovalsController si se expone por separado.
[ ] Crear SupplierPaymentOrdersController.
[ ] Crear SupplierPaymentEvidenceController.
[ ] Crear SupplierReconciliationLinksController.
[ ] Crear SupplierPaymentReportsController.
[ ] Aplicar AuthGuard a todos.
[ ] Aplicar TenantGuard a todos.
[ ] Aplicar PermissionGuard a todos.
[ ] Aplicar ValidationPipe whitelist/forbidNonWhitelisted.
```

---

## 26.2. Supplier categories endpoints

### Tasks

```text id="tci2jz"
[ ] Implementar GET /api/v1/tenant/supplier-payment-categories.
[ ] Implementar POST /api/v1/tenant/supplier-payment-categories.
[ ] Implementar GET /api/v1/tenant/supplier-payment-categories/{categoryId}.
[ ] Implementar PATCH /api/v1/tenant/supplier-payment-categories/{categoryId}.
[ ] Implementar POST /api/v1/tenant/supplier-payment-categories/{categoryId}/archive.
```

---

## 26.3. Suppliers endpoints

### Tasks

```text id="fij3wi"
[ ] Implementar GET /api/v1/tenant/suppliers.
[ ] Implementar POST /api/v1/tenant/suppliers.
[ ] Implementar GET /api/v1/tenant/suppliers/{supplierId}.
[ ] Implementar PATCH /api/v1/tenant/suppliers/{supplierId}.
[ ] Implementar POST /api/v1/tenant/suppliers/{supplierId}/activate.
[ ] Implementar POST /api/v1/tenant/suppliers/{supplierId}/disable.
[ ] Implementar POST /api/v1/tenant/suppliers/{supplierId}/block.
[ ] Implementar POST /api/v1/tenant/suppliers/{supplierId}/archive.
```

---

## 26.4. Contacts, bank accounts and documents endpoints

### Tasks

```text id="dam1ld"
[ ] Implementar GET /api/v1/tenant/suppliers/{supplierId}/contacts.
[ ] Implementar POST /api/v1/tenant/suppliers/{supplierId}/contacts.
[ ] Implementar GET /api/v1/tenant/supplier-contacts/{contactId}.
[ ] Implementar PATCH /api/v1/tenant/supplier-contacts/{contactId}.
[ ] Implementar POST /api/v1/tenant/supplier-contacts/{contactId}/archive.
[ ] Implementar GET /api/v1/tenant/suppliers/{supplierId}/bank-accounts.
[ ] Implementar POST /api/v1/tenant/suppliers/{supplierId}/bank-accounts.
[ ] Implementar GET /api/v1/tenant/supplier-bank-accounts/{bankAccountId}.
[ ] Implementar PATCH /api/v1/tenant/supplier-bank-accounts/{bankAccountId}.
[ ] Implementar POST /api/v1/tenant/supplier-bank-accounts/{bankAccountId}/verify.
[ ] Implementar POST /api/v1/tenant/supplier-bank-accounts/{bankAccountId}/disable.
[ ] Implementar POST /api/v1/tenant/supplier-bank-accounts/{bankAccountId}/archive.
[ ] Implementar GET /api/v1/tenant/suppliers/{supplierId}/documents.
[ ] Implementar POST /api/v1/tenant/suppliers/{supplierId}/documents.
[ ] Implementar GET /api/v1/tenant/supplier-documents/{supplierDocumentId}.
[ ] Implementar POST /api/v1/tenant/supplier-documents/{supplierDocumentId}/archive.
```

---

## 26.5. Payables endpoints

### Tasks

```text id="vqwkq1"
[ ] Implementar GET /api/v1/tenant/supplier-payables.
[ ] Implementar POST /api/v1/tenant/supplier-payables.
[ ] Implementar GET /api/v1/tenant/supplier-payables/{payableId}.
[ ] Implementar PATCH /api/v1/tenant/supplier-payables/{payableId}.
[ ] Implementar POST /api/v1/tenant/supplier-payables/{payableId}/submit-review.
[ ] Implementar POST /api/v1/tenant/supplier-payables/{payableId}/approve.
[ ] Implementar POST /api/v1/tenant/supplier-payables/{payableId}/reject.
[ ] Implementar POST /api/v1/tenant/supplier-payables/{payableId}/cancel.
[ ] Implementar POST /api/v1/tenant/supplier-payables/{payableId}/void.
[ ] Implementar POST /api/v1/tenant/supplier-payables/{payableId}/archive.
```

---

## 26.6. Payment orders endpoints

### Tasks

```text id="z9hyjx"
[ ] Implementar GET /api/v1/tenant/supplier-payment-orders.
[ ] Implementar POST /api/v1/tenant/supplier-payment-orders.
[ ] Implementar GET /api/v1/tenant/supplier-payment-orders/{paymentOrderId}.
[ ] Implementar PATCH /api/v1/tenant/supplier-payment-orders/{paymentOrderId}.
[ ] Implementar POST /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/submit-approval.
[ ] Implementar POST /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/approve.
[ ] Implementar POST /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/reject.
[ ] Implementar POST /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/schedule.
[ ] Implementar POST /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/mark-paid.
[ ] Implementar POST /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/void.
[ ] Implementar POST /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/cancel.
[ ] Implementar POST /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/reverse.
[ ] Implementar POST /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/archive.
```

---

## 26.7. Evidence, reconciliation and reports endpoints

### Tasks

```text id="lawjd0"
[ ] Implementar GET /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/evidence.
[ ] Implementar POST /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/evidence.
[ ] Implementar GET /api/v1/tenant/supplier-payment-evidence/{evidenceId}.
[ ] Implementar POST /api/v1/tenant/supplier-payment-evidence/{evidenceId}/verify.
[ ] Implementar POST /api/v1/tenant/supplier-payment-evidence/{evidenceId}/reject.
[ ] Implementar POST /api/v1/tenant/supplier-payment-evidence/{evidenceId}/archive.
[ ] Implementar GET /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/reconciliation-links.
[ ] Implementar POST /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/reconciliation-links.
[ ] Implementar POST /api/v1/tenant/supplier-payment-reconciliation-links/{linkId}/unlink.
[ ] Implementar GET /api/v1/tenant/supplier-payment-reports/payables-aging.
[ ] Implementar GET /api/v1/tenant/supplier-payment-reports/payments-by-supplier.
[ ] Implementar GET /api/v1/tenant/supplier-payment-reports/expenses-by-category.
[ ] Implementar GET /api/v1/tenant/supplier-payment-reports/cash-outflow.
[ ] Implementar GET /api/v1/tenant/supplier-payment-reports/export.
```

---

# 27. EPIC-021-23 — Authorization, guards and permissions

## 27.1. Guards

### Tasks

```text id="dwgdap"
[ ] Crear SupplierPaymentPermissionGuard.
[ ] Crear SupplierTenantGuard.
[ ] Crear SupplierCategoryTenantGuard.
[ ] Crear SupplierContactTenantGuard.
[ ] Crear SupplierBankAccountTenantGuard.
[ ] Crear SupplierDocumentTenantGuard.
[ ] Crear SupplierPayableTenantGuard.
[ ] Crear SupplierPaymentOrderTenantGuard.
[ ] Crear SupplierPaymentEvidenceTenantGuard.
[ ] Crear SupplierReconciliationLinkTenantGuard.
[ ] Crear SupplierReportGuard.
[ ] Aplicar AuthGuard a todas las rutas tenant.
[ ] Aplicar TenantGuard a todas las rutas tenant.
[ ] Aplicar PermissionGuard por endpoint.
[ ] Validar PlatformAdmin sin acceso automático a egresos tenant.
[ ] Validar Resident/PropertyOwner sin acceso en MVP.
```

---

## 27.2. Permission wiring

### Tasks

```text id="d1eq3k"
[ ] Registrar permisos suppliers.*.
[ ] Registrar permisos supplierCategories.*.
[ ] Registrar permisos supplierContacts.*.
[ ] Registrar permisos supplierBankAccounts.*.
[ ] Registrar permisos supplierDocuments.*.
[ ] Registrar permisos supplierPayables.*.
[ ] Registrar permisos supplierPaymentOrders.*.
[ ] Registrar permisos supplierPaymentEvidence.*.
[ ] Registrar permisos supplierPaymentReconciliationLinks.*.
[ ] Registrar permisos supplierPaymentReports.*.
[ ] Registrar permiso supplierPayments.audit.read.
[ ] Crear seeds de permisos.
[ ] Asociar permisos a roles recomendados.
[ ] Crear tests por rol.
```

---

# 28. EPIC-021-24 — Audit

## 28.1. Audit service

### Tasks

```text id="bt4nux"
[ ] Crear SupplierPaymentAuditService.
[ ] Integrar AuditPort.
[ ] Emitir supplier.created.
[ ] Emitir supplier.updated.
[ ] Emitir supplier.activated.
[ ] Emitir supplier.disabled.
[ ] Emitir supplier.blocked.
[ ] Emitir supplier.archived.
[ ] Emitir supplierCategory.created.
[ ] Emitir supplierCategory.updated.
[ ] Emitir supplierCategory.archived.
[ ] Emitir supplierContact.created.
[ ] Emitir supplierContact.updated.
[ ] Emitir supplierContact.archived.
[ ] Emitir supplierBankAccount.created.
[ ] Emitir supplierBankAccount.updated.
[ ] Emitir supplierBankAccount.verified.
[ ] Emitir supplierBankAccount.disabled.
[ ] Emitir supplierBankAccount.archived.
[ ] Emitir supplierDocument.linked.
[ ] Emitir supplierDocument.archived.
[ ] Emitir supplierDocument.downloaded.
[ ] Emitir supplierPayable.created.
[ ] Emitir supplierPayable.updatedDraft.
[ ] Emitir supplierPayable.submittedForReview.
[ ] Emitir supplierPayable.approved.
[ ] Emitir supplierPayable.rejected.
[ ] Emitir supplierPayable.cancelled.
[ ] Emitir supplierPayable.voided.
[ ] Emitir supplierPayable.archived.
[ ] Emitir supplierPayable.duplicateDetected.
[ ] Emitir supplierPayableApproval.created.
[ ] Emitir supplierPayableApproval.approved.
[ ] Emitir supplierPayableApproval.rejected.
[ ] Emitir supplierPayableApproval.cancelled.
[ ] Emitir supplierPaymentOrder.created.
[ ] Emitir supplierPaymentOrder.updatedDraft.
[ ] Emitir supplierPaymentOrder.submittedForApproval.
[ ] Emitir supplierPaymentOrder.approved.
[ ] Emitir supplierPaymentOrder.rejected.
[ ] Emitir supplierPaymentOrder.scheduled.
[ ] Emitir supplierPaymentOrder.paid.
[ ] Emitir supplierPaymentOrder.partiallyPaid.
[ ] Emitir supplierPaymentOrder.voided.
[ ] Emitir supplierPaymentOrder.cancelled.
[ ] Emitir supplierPaymentOrder.reversed.
[ ] Emitir supplierPaymentOrder.archived.
[ ] Emitir supplierPaymentEvidence.created.
[ ] Emitir supplierPaymentEvidence.verified.
[ ] Emitir supplierPaymentEvidence.rejected.
[ ] Emitir supplierPaymentEvidence.archived.
[ ] Emitir supplierPaymentEvidence.downloaded.
[ ] Emitir supplierAccountingLink.created.
[ ] Emitir supplierAccountingLink.failed.
[ ] Emitir supplierAccountingLink.reversed.
[ ] Emitir supplierBankReconciliationLink.created.
[ ] Emitir supplierBankReconciliationLink.unlinked.
[ ] Emitir supplierPaymentReport.generated.
[ ] Emitir supplierPaymentReport.exported.
```

---

## 28.2. Audit sanitizer

### Tasks

```text id="g0z5it"
[ ] Crear SupplierPaymentAuditSanitizer.
[ ] Permitir supplierId.
[ ] Permitir supplierCode.
[ ] Permitir supplierCategoryId.
[ ] Permitir supplierPayableId.
[ ] Permitir payableNumber.
[ ] Permitir externalDocumentNumberMasked.
[ ] Permitir supplierPaymentOrderId.
[ ] Permitir paymentOrderNumber.
[ ] Permitir supplierPaymentEvidenceId.
[ ] Permitir supplierBankAccountId.
[ ] Permitir paymentMethod.
[ ] Permitir amount.
[ ] Permitir currency.
[ ] Permitir status.
[ ] Permitir approvalStatus.
[ ] Permitir journalEntryId.
[ ] Permitir bankTransactionId.
[ ] Permitir reconciliationMatchId.
[ ] Permitir secureDocumentId.
[ ] Permitir outcome.
[ ] Permitir traceId.
[ ] Remover tokens.
[ ] Remover secrets.
[ ] Remover passwords.
[ ] Remover full bank account number.
[ ] Remover accountNumberHash.
[ ] Remover identificationNumberHash.
[ ] Remover raw bank payload.
[ ] Remover raw provider payload.
[ ] Remover storageKey.
[ ] Remover signedUrl.
[ ] Remover SQL raw.
[ ] Remover stack trace.
[ ] Remover facturas completas como payload.
[ ] Remover comprobantes completos como payload.
[ ] Remover datos cross-tenant.
```

---

# 29. EPIC-021-25 — Observability

## 29.1. Logs

### Tasks

```text id="q0uwsv"
[ ] Crear SupplierPaymentLogger.
[ ] Loggear supplier.created.
[ ] Loggear supplier.blocked.
[ ] Loggear supplierPayable.approved.
[ ] Loggear supplierPayable.duplicateDetected.
[ ] Loggear supplierPaymentOrder.approved.
[ ] Loggear supplierPaymentOrder.paid.
[ ] Loggear supplierPaymentOrder.reversed.
[ ] Loggear supplierAccountingLink.failed.
[ ] Loggear supplierBankReconciliationLink.created.
[ ] Loggear supplierPaymentReport.exported.
[ ] Incluir traceId.
[ ] Incluir requestId.
[ ] Incluir correlationId.
[ ] Incluir action.
[ ] Incluir outcome.
[ ] Incluir supplierType.
[ ] Incluir payableStatus.
[ ] Incluir paymentOrderStatus.
[ ] Incluir paymentMethod.
[ ] Incluir documentType.
[ ] Incluir currency.
[ ] Incluir durationMs.
[ ] Incluir errorCode.
[ ] No loggear tenantId como label.
[ ] No loggear userId como label.
[ ] No loggear supplierId como label.
[ ] No loggear cuenta bancaria completa.
[ ] No loggear accountNumberHash.
[ ] No loggear identificationNumberHash.
[ ] No loggear storageKey.
[ ] No loggear signedUrl.
[ ] No loggear raw payload.
[ ] No loggear SQL raw.
[ ] No loggear stack trace productivo.
```

---

## 29.2. Metrics

### Tasks

```text id="xeiu9t"
[ ] Crear SupplierPaymentMetricsService.
[ ] Emitir supplier_payments_suppliers_total.
[ ] Emitir supplier_payments_payables_total.
[ ] Emitir supplier_payments_payables_approved_total.
[ ] Emitir supplier_payments_payables_overdue_total.
[ ] Emitir supplier_payments_orders_total.
[ ] Emitir supplier_payments_orders_paid_total.
[ ] Emitir supplier_payments_duplicate_payables_detected_total.
[ ] Emitir supplier_payments_total_amount_paid.
[ ] Emitir supplier_payments_accounting_links_failed_total.
[ ] Emitir supplier_payments_reports_exported_total.
[ ] Usar labels permitidos.
[ ] Prohibir tenantId como label.
[ ] Prohibir userId como label.
[ ] Prohibir supplierId como label.
[ ] Prohibir supplierPayableId como label.
[ ] Prohibir supplierPaymentOrderId como label.
[ ] Prohibir supplierBankAccountId como label.
[ ] Prohibir secureDocumentId como label.
[ ] Prohibir journalEntryId como label.
[ ] Prohibir bankTransactionId como label.
[ ] Prohibir traceId como label.
```

---

# 30. EPIC-021-26 — OpenAPI

## 30.1. Tags

### Tasks

```text id="ipeea4"
[ ] Crear tag Supplier Categories.
[ ] Crear tag Suppliers.
[ ] Crear tag Supplier Contacts.
[ ] Crear tag Supplier Bank Accounts.
[ ] Crear tag Supplier Documents.
[ ] Crear tag Supplier Payables.
[ ] Crear tag Supplier Payable Approvals.
[ ] Crear tag Supplier Payment Orders.
[ ] Crear tag Supplier Payment Evidence.
[ ] Crear tag Supplier Payment Reconciliation Links.
[ ] Crear tag Supplier Payment Reports.
```

---

## 30.2. Extensions

### Tasks

```text id="x5z6cu"
[ ] Agregar x-tenant-scope=true.
[ ] Agregar x-auth-required=true.
[ ] Agregar x-supplier-payments=true.
[ ] Agregar x-public-exposure=false.
[ ] Agregar x-payable-controlled=true.
[ ] Agregar x-approval-required=true.
[ ] Agregar x-duplicate-detection=true.
[ ] Agregar x-decimal-money=true.
[ ] Agregar x-payment-order=true.
[ ] Agregar x-bank-transfer-initiation=false.
[ ] Agregar x-evidence-required-for-paid=true.
[ ] Agregar x-accounting-linked=true.
[ ] Agregar x-reconciliation-ready=true.
[ ] Agregar x-secure-document-storage=true.
[ ] Agregar x-storage-key-exposed=false.
[ ] Agregar x-public-endpoint=false.
[ ] Agregar x-me-endpoint=false.
[ ] Agregar x-wordpress-access=false.
[ ] Agregar x-open-banking-payment-initiation=false.
[ ] Agregar x-electronic-invoicing=false.
[ ] Agregar x-external-ai-real-data=false.
[ ] Validar que no se documenten rutas /public supplier payments.
[ ] Validar que no se documenten rutas /me supplier payments.
```

---

# 31. EPIC-021-27 — Tests

## 31.1. Unit tests

### Tasks

```text id="l80gxf"
[ ] Crear tests para SupplierCode.
[ ] Crear tests para SupplierName.
[ ] Crear tests para SupplierIdentification.
[ ] Crear tests para SupplierEmail.
[ ] Crear tests para SupplierPhone.
[ ] Crear tests para SupplierBankAccountMasked.
[ ] Crear tests para SupplierBankAccountHash.
[ ] Crear tests para SupplierPayableNumber.
[ ] Crear tests para SupplierExternalDocumentNumber.
[ ] Crear tests para SupplierPayableDuplicateFingerprint.
[ ] Crear tests para SupplierPaymentOrderNumber.
[ ] Crear tests para SupplierPaymentReference.
[ ] Crear tests para SupplierPaymentAmount.
[ ] Crear tests para SupplierOutstandingAmount.
[ ] Crear tests para SupplierDueDate.
[ ] Crear tests para SupplierDocumentReference.
[ ] Crear tests para SupplierCategory entity.
[ ] Crear tests para Supplier entity.
[ ] Crear tests para SupplierContact entity.
[ ] Crear tests para SupplierBankAccount entity.
[ ] Crear tests para SupplierDocument entity.
[ ] Crear tests para SupplierPayable entity.
[ ] Crear tests para SupplierPayableApproval entity.
[ ] Crear tests para SupplierPaymentOrder entity.
[ ] Crear tests para SupplierPaymentOrderItem entity.
[ ] Crear tests para SupplierPaymentEvidence entity.
[ ] Crear tests para SupplierAccountingLink entity.
[ ] Crear tests para SupplierBankReconciliationLink entity.
```

---

## 31.2. Policy tests

### Tasks

```text id="p1j1l5"
[ ] Test SupplierTenantPolicy.
[ ] Test SupplierStatusPolicy.
[ ] Test SupplierBlockedPolicy.
[ ] Test SupplierBankAccountPrivacyPolicy.
[ ] Test SupplierBankAccountVerificationPolicy.
[ ] Test SupplierDocumentPolicy.
[ ] Test SupplierPayableDuplicatePolicy.
[ ] Test SupplierPayableAmountPolicy.
[ ] Test SupplierPayableApprovalPolicy.
[ ] Test SupplierPaymentOrderApprovalPolicy.
[ ] Test SupplierPaymentOrderItemPolicy.
[ ] Test SupplierPaymentAmountPolicy.
[ ] Test SupplierPaymentEvidencePolicy.
[ ] Test SupplierPaymentImmutabilityPolicy.
[ ] Test SupplierPaymentReversalPolicy.
[ ] Test SupplierAccountingIntegrationPolicy.
[ ] Test SupplierBankReconciliationBoundaryPolicy.
[ ] Test NoBankTransferInitiationPolicy.
[ ] Test NoOpenBankingPaymentInitiationPolicy.
[ ] Test NoPublicSupplierPaymentEndpointPolicy.
[ ] Test NoMeSupplierPaymentEndpointPolicy.
[ ] Test NoWordPressSupplierPaymentAccessPolicy.
[ ] Test NoExternalAiSupplierPaymentDataPolicy.
```

---

## 31.3. Repository and service tests

### Tasks

```text id="geijyi"
[ ] Test SupplierCategoryRepository.
[ ] Test SupplierRepository.
[ ] Test SupplierContactRepository.
[ ] Test SupplierBankAccountRepository.
[ ] Test SupplierDocumentRepository.
[ ] Test SupplierPayableRepository.
[ ] Test SupplierPayableApprovalRepository.
[ ] Test SupplierPaymentOrderRepository.
[ ] Test SupplierPaymentOrderItemRepository.
[ ] Test SupplierPaymentEvidenceRepository.
[ ] Test SupplierAccountingLinkRepository.
[ ] Test SupplierBankReconciliationLinkRepository.
[ ] Test SupplierCategoryService.
[ ] Test SupplierService.
[ ] Test SupplierContactService.
[ ] Test SupplierBankAccountService.
[ ] Test SupplierDocumentService.
[ ] Test SupplierPayableService.
[ ] Test SupplierPayableApprovalService.
[ ] Test SupplierPaymentOrderService.
[ ] Test SupplierPaymentOrderItemService.
[ ] Test SupplierPaymentEvidenceService.
[ ] Test SupplierPaymentAmountService.
[ ] Test SupplierDuplicateDetectionService.
[ ] Test SupplierAccountingIntegrationService.
[ ] Test SupplierBankReconciliationLinkService.
[ ] Test SupplierPaymentReportService.
[ ] Test SupplierPaymentExportService.
```

---

## 31.4. API, security and integration tests

### Tasks

```text id="mrdx3v"
[ ] Test Supplier Categories API.
[ ] Test Suppliers API.
[ ] Test Supplier Contacts API.
[ ] Test Supplier Bank Accounts API.
[ ] Test Supplier Documents API.
[ ] Test Supplier Payables API.
[ ] Test Supplier Payment Orders API.
[ ] Test Supplier Payment Evidence API.
[ ] Test Reconciliation Links API.
[ ] Test Reports API.
[ ] Test Secure Document Storage integration.
[ ] Test Accounting Ledger integration.
[ ] Test Bank Reconciliation boundary.
[ ] Test audit integration.
[ ] Test observability.
[ ] Test OpenAPI.
[ ] Test no public endpoints.
[ ] Test no /me endpoints.
[ ] Test no WordPress access.
[ ] Test no bank transfer initiation.
[ ] Test no Open Banking payment initiation.
[ ] Test external AI disabled.
```

---

## 31.5. Financial integrity, performance and concurrency tests

### Tasks

```text id="pgun8q"
[ ] Test Decimal money.
[ ] Test totalAmount calculation.
[ ] Test outstandingAmount calculation.
[ ] Test paymentOrder total calculation.
[ ] Test payment item <= outstandingAmount.
[ ] Test partial payments.
[ ] Test no overpayment.
[ ] Test duplicate detection.
[ ] Test paid immutability.
[ ] Test reversal flow.
[ ] Test two create supplier same code concurrent.
[ ] Test two payables duplicate concurrent.
[ ] Test two payments same payable concurrent.
[ ] Test two mark-paid same order concurrent.
[ ] Test two reversals same order concurrent.
[ ] Test report p95 targets.
[ ] Test pageSize max 100.
[ ] Test no N+1 evidente.
```

---

# 32. EPIC-021-28 — Security hardening

## 32.1. DTO hardening

### Tasks

```text id="kr51ro"
[ ] Activar whitelist.
[ ] Activar forbidNonWhitelisted.
[ ] Rechazar tenantId.
[ ] Rechazar createdBy.
[ ] Rechazar updatedBy.
[ ] Rechazar activatedBy.
[ ] Rechazar disabledBy.
[ ] Rechazar blockedBy.
[ ] Rechazar approvedBy.
[ ] Rechazar rejectedBy.
[ ] Rechazar paidBy.
[ ] Rechazar verifiedBy.
[ ] Rechazar archivedBy.
[ ] Rechazar status directo salvo endpoints de transición.
[ ] Rechazar totalAmount como fuente de verdad no autorizada.
[ ] Rechazar outstandingAmount.
[ ] Rechazar duplicateFingerprint.
[ ] Rechazar accountNumberHash.
[ ] Rechazar identificationNumberHash.
[ ] Rechazar beneficiaryIdentificationHash.
[ ] Rechazar fullBankAccountNumber.
[ ] Rechazar raw bank payload.
[ ] Rechazar raw provider payload.
[ ] Rechazar storageKey.
[ ] Rechazar signedUrl.
[ ] Rechazar accountingJournalEntryId directo.
[ ] Rechazar bankTransactionId directo fuera del endpoint controlado.
[ ] Rechazar reconciliationMatchId directo fuera del endpoint controlado.
[ ] Rechazar payment initiation fields.
[ ] Rechazar Open Banking payment initiation fields.
[ ] Rechazar external AI flags.
```

---

## 32.2. Endpoint hardening

### Tasks

```text id="nyah0q"
[ ] Verificar que no existan endpoints /api/v1/public/suppliers.
[ ] Verificar que no existan endpoints /api/v1/public/supplier-payables.
[ ] Verificar que no existan endpoints /api/v1/public/supplier-payment-orders.
[ ] Verificar que no existan endpoints /api/v1/public/supplier-payment-reports.
[ ] Verificar que no existan endpoints /api/v1/me/suppliers.
[ ] Verificar que no existan endpoints /api/v1/me/supplier-payables.
[ ] Verificar que no existan endpoints /api/v1/me/supplier-payment-orders.
[ ] Verificar que no existan endpoints /api/v1/me/supplier-payment-reports.
[ ] Verificar Cache-Control no-store.
[ ] Verificar CORS restrictivo.
[ ] Verificar WordPress sin acceso a supplier payments.
[ ] Aplicar rate limit en approve payable.
[ ] Aplicar rate limit en approve payment order.
[ ] Aplicar rate limit en mark-paid.
[ ] Aplicar rate limit en reverse.
[ ] Aplicar rate limit en exports.
[ ] Sanitizar errores.
[ ] Evitar stack traces en producción.
```

---

## 32.3. Financial hardening

### Tasks

```text id="e78cb3"
[ ] Verificar Decimal money.
[ ] Verificar no float/double.
[ ] Verificar totalAmount server-side.
[ ] Verificar outstandingAmount server-side.
[ ] Verificar no overpayment.
[ ] Verificar no paymentOrder sin items.
[ ] Verificar no payable no aprobado en order.
[ ] Verificar no mark-paid sin aprobación.
[ ] Verificar no mark-paid sin referencia/evidencia.
[ ] Verificar no pago a supplier blocked.
[ ] Verificar no full bank account exposure.
[ ] Verificar no bank transfer initiation.
[ ] Verificar no Open Banking payment initiation.
[ ] Verificar no JournalEntry posted mutation.
[ ] Verificar no ReconciliationMatch creation.
[ ] Verificar no BankTransaction matched mutation.
[ ] Verificar no ReconciliationSession close.
```

---

# 33. EPIC-021-29 — CI/CD gates

## 33.1. Pipeline

### Tasks

```text id="b7jj66"
[ ] Agregar lint gate.
[ ] Agregar typecheck gate.
[ ] Agregar unit test gate.
[ ] Agregar value object test gate.
[ ] Agregar entity test gate.
[ ] Agregar policy test gate.
[ ] Agregar repository test gate.
[ ] Agregar service test gate.
[ ] Agregar integration test gate.
[ ] Agregar API test gate.
[ ] Agregar authorization test gate.
[ ] Agregar multitenancy test gate.
[ ] Agregar financial integrity test gate.
[ ] Agregar security test gate.
[ ] Agregar audit test gate.
[ ] Agregar observability test gate.
[ ] Agregar OpenAPI contract test gate.
[ ] Agregar regression test gate.
[ ] Agregar smoke test gate.
```

---

## 33.2. Gates críticos

### Tasks

```text id="yi26dc"
[ ] Fallar CI si OpenAPI documenta endpoints públicos supplier payments.
[ ] Fallar CI si OpenAPI documenta endpoints /me supplier payments.
[ ] Fallar CI si DTOs aceptan tenantId.
[ ] Fallar CI si DTOs aceptan actor fields.
[ ] Fallar CI si DTOs exponen fullBankAccountNumber.
[ ] Fallar CI si DTOs exponen accountNumberHash.
[ ] Fallar CI si DTOs exponen identificationNumberHash.
[ ] Fallar CI si DTOs exponen storageKey.
[ ] Fallar CI si se detecta float/double para dinero.
[ ] Fallar CI si permite supplier cross-tenant.
[ ] Fallar CI si permite payable cross-tenant.
[ ] Fallar CI si permite payment order cross-tenant.
[ ] Fallar CI si permite pago superior al outstandingAmount.
[ ] Fallar CI si permite pago a supplier blocked.
[ ] Fallar CI si permite paid sin aprobación.
[ ] Fallar CI si permite paid sin evidencia/referencia.
[ ] Fallar CI si inicia transferencia bancaria.
[ ] Fallar CI si inicia Open Banking payment.
[ ] Fallar CI si Supplier Payments edita JournalEntry posted.
[ ] Fallar CI si Supplier Payments crea ReconciliationMatch final.
[ ] Fallar CI si Supplier Payments marca BankTransaction matched.
[ ] Fallar CI si logs contienen cuenta bancaria completa.
[ ] Fallar CI si logs contienen storageKey.
[ ] Fallar CI si audit contiene datos prohibidos.
[ ] Fallar CI si externalAi está habilitado por defecto.
```

---

# 34. PRs sugeridos

```text id="s2m5oz"
[ ] PR-021-01 — Module skeleton, enums, constants and configuration.
[ ] PR-021-02 — Value objects, entities and state machines.
[ ] PR-021-03 — Domain policies and error catalog.
[ ] PR-021-04 — Prisma schema, migration, constraints and indexes.
[ ] PR-021-05 — Repository ports and Prisma repositories.
[ ] PR-021-06 — Supplier categories and suppliers.
[ ] PR-021-07 — Supplier contacts and bank account references.
[ ] PR-021-08 — Supplier documents via Secure Document Storage.
[ ] PR-021-09 — Supplier payables and duplicate detection.
[ ] PR-021-10 — Supplier payable approvals.
[ ] PR-021-11 — Supplier payment orders and items.
[ ] PR-021-12 — Mark-paid flow, evidence and partial payments.
[ ] PR-021-13 — Reversal/correction flow.
[ ] PR-021-14 — Accounting Ledger integration.
[ ] PR-021-15 — Bank Reconciliation link integration.
[ ] PR-021-16 — Reports and exports.
[ ] PR-021-17 — REST controllers, guards and permissions.
[ ] PR-021-18 — Audit, observability and OpenAPI.
[ ] PR-021-19 — Tests, security hardening, performance and CI gates.
```

---

# 35. Smoke flow obligatorio

```text id="fc7glc"
[ ] FinancialManager crea SupplierCategory.
[ ] FinancialManager crea Supplier.
[ ] FinancialManager activa Supplier.
[ ] Accountant crea SupplierBankAccount.
[ ] FinancialManager verifica SupplierBankAccount.
[ ] Accountant vincula SupplierDocument vía Secure Document Storage.
[ ] Accountant crea SupplierPayable.
[ ] Sistema calcula totalAmount.
[ ] Sistema calcula outstandingAmount.
[ ] Sistema calcula duplicateFingerprint.
[ ] Accountant envía SupplierPayable a revisión.
[ ] FinancialManager aprueba SupplierPayable.
[ ] Sistema emite supplierPayable.approved hacia Accounting Ledger si está habilitado.
[ ] Sistema crea SupplierAccountingLink.
[ ] Accountant crea SupplierPaymentOrder con item.
[ ] Sistema valida outstandingAmount.
[ ] Sistema calcula totalAmount de la orden.
[ ] Accountant envía orden a aprobación.
[ ] FinancialManager aprueba orden.
[ ] Accountant adjunta SupplierPaymentEvidence.
[ ] Accountant marca SupplierPaymentOrder como paid.
[ ] Sistema valida referencia/evidencia.
[ ] Sistema actualiza paidAmount.
[ ] Sistema actualiza outstandingAmount del payable.
[ ] Sistema marca payable como paid.
[ ] Sistema emite supplierPaymentOrder.paid hacia Accounting Ledger si está habilitado.
[ ] Accountant vincula pago con BankTransaction.
[ ] Sistema crea SupplierBankReconciliationLink sin confirmar conciliación final.
[ ] FinancialManager consulta Payables Aging.
[ ] FinancialManager consulta Payments by Supplier.
[ ] FinancialManager exporta reporte vía Secure Document Storage.
[ ] Sistema audita eventos críticos.
```

---

# 36. Checklist de Definition of Done

```text id="z7hw5v"
[ ] spec.md aprobado.
[ ] plan.md aprobado.
[ ] data-model.md aprobado.
[ ] api-contract.md aprobado.
[ ] test-plan.md aprobado.
[ ] tasks.md aprobado.
[ ] security-notes.md creado.
[ ] Módulo registrado.
[ ] Enums implementados.
[ ] Configuración implementada.
[ ] Feature flags implementados.
[ ] Value objects implementados.
[ ] Entidades implementadas.
[ ] State machines implementadas.
[ ] Policies implementadas.
[ ] Errores implementados.
[ ] Prisma schema implementado.
[ ] Migración creada.
[ ] Constraints creados.
[ ] Índices creados.
[ ] Repositorios implementados.
[ ] SupplierCategory implementado.
[ ] Supplier implementado.
[ ] SupplierContact implementado.
[ ] SupplierBankAccount implementado.
[ ] SupplierDocument implementado.
[ ] SupplierPayable implementado.
[ ] SupplierPayableApproval implementado.
[ ] SupplierPaymentOrder implementado.
[ ] SupplierPaymentOrderItem implementado.
[ ] SupplierPaymentEvidence implementado.
[ ] SupplierAccountingLink implementado.
[ ] SupplierBankReconciliationLink implementado.
[ ] Duplicate detection implementado.
[ ] Decimal money implementado.
[ ] OutstandingAmount implementado.
[ ] Partial payments implementado.
[ ] Mark-paid manual implementado.
[ ] Reversal/correction implementado.
[ ] Secure Document Storage integration implementada.
[ ] Accounting Ledger integration implementada.
[ ] Bank Reconciliation link implementada.
[ ] Reports implementados.
[ ] Exports implementados.
[ ] Controllers REST implementados.
[ ] Guards implementados.
[ ] Permisos registrados.
[ ] Audit implementado.
[ ] Observability implementado.
[ ] OpenAPI implementado.
[ ] Tests unitarios pasan.
[ ] Tests de repositorio pasan.
[ ] Tests de servicios pasan.
[ ] Tests de integración pasan.
[ ] Tests API pasan.
[ ] Tests de autorización pasan.
[ ] Tests multitenant pasan.
[ ] Tests de integridad financiera pasan.
[ ] Tests de seguridad pasan.
[ ] Tests de auditoría pasan.
[ ] Tests de observabilidad pasan.
[ ] Tests OpenAPI pasan.
[ ] Tests de performance mínimos pasan.
[ ] Tests de concurrencia pasan.
[ ] Smoke tests pasan.
[ ] CI pasa.
```

---

# 37. No aceptación

La implementación no debe aceptarse si queda alguna de estas condiciones:

```text id="y05tll"
[ ] Permite supplier category cross-tenant.
[ ] Permite supplier cross-tenant.
[ ] Permite supplier contact cross-tenant.
[ ] Permite supplier bank account cross-tenant.
[ ] Permite supplier document cross-tenant.
[ ] Permite supplier payable cross-tenant.
[ ] Permite supplier payable approval cross-tenant.
[ ] Permite supplier payment order cross-tenant.
[ ] Permite supplier payment order item cross-tenant.
[ ] Permite supplier payment evidence cross-tenant.
[ ] Permite supplier accounting link cross-tenant.
[ ] Permite supplier bank reconciliation link cross-tenant.
[ ] Permite supplier payment report cross-tenant.
[ ] Acepta tenantId desde body.
[ ] Acepta actor fields desde body.
[ ] Acepta status directo sin endpoint de transición.
[ ] Usa findUnique por id simple en entidades tenant-scoped.
[ ] Expone full bank account number.
[ ] Expone accountNumberHash en DTO estándar.
[ ] Expone identificationNumberHash en DTO estándar.
[ ] Expone storageKey.
[ ] Expone signedUrl persistente.
[ ] Usa float/double para dinero.
[ ] Permite totalAmount inconsistente.
[ ] Permite outstandingAmount negativo.
[ ] Permite paymentOrder sin items.
[ ] Permite paymentOrder con payable no aprobado.
[ ] Permite paymentOrder item mayor al outstandingAmount.
[ ] Permite paid sin aprobación.
[ ] Permite paid sin referencia o evidencia.
[ ] Permite pago superior al totalAmount.
[ ] Permite pago superior al outstandingAmount.
[ ] Permite pago a supplier blocked.
[ ] Permite payable para supplier inactive.
[ ] Permite payable para supplier archived.
[ ] Permite duplicate payable aprobado sin control.
[ ] Permite evidence rejected como soporte válido.
[ ] Inicia transferencia bancaria automática.
[ ] Inicia Open Banking payment.
[ ] Supplier Payments edita JournalEntry posted.
[ ] Supplier Payments crea ReconciliationMatch final.
[ ] Supplier Payments marca BankTransaction matched.
[ ] Supplier Payments cierra ReconciliationSession.
[ ] Crea endpoint público supplier payments.
[ ] Crea endpoint /me supplier payments.
[ ] Permite acceso desde WordPress.
[ ] Envía datos reales a IA externa.
[ ] Audit no está sanitizada.
[ ] Logs contienen cuenta bancaria completa.
[ ] Logs contienen storageKey.
[ ] Logs contienen stack trace productivo.
```

---

# 38. Resultado esperado

Al completar estas tareas, el módulo `021-supplier-payments` quedará listo para implementación productiva gradual como base de proveedores, cuentas por pagar y egresos administrativos de RESIDENT Core.

Resultado esperado:

```text id="j9mi4u"
module foundation complete
enums complete
configuration complete
feature flags complete
value objects complete
domain entities complete
state machines complete
domain policies complete
error catalog complete
database migration complete
repositories complete
SupplierCategory complete
Supplier complete
SupplierContact complete
SupplierBankAccount protected
SupplierDocument via SDS complete
SupplierPayable complete
SupplierPayableApproval complete
SupplierPaymentOrder complete
SupplierPaymentOrderItem complete
SupplierPaymentEvidence complete
SupplierAccountingLink complete
SupplierBankReconciliationLink complete
duplicate detection complete
Decimal money complete
totalAmount server-side complete
outstandingAmount server-side complete
approval workflow complete
manual mark-paid complete
payment evidence complete
partial payments complete
reversal/correction complete
Secure Document Storage integration complete
Accounting Ledger integration complete
Bank Reconciliation link complete
payables aging report complete
payments by supplier report complete
expenses by category report complete
cash outflow report complete
exports via Secure Document Storage complete
audit complete
observability complete
OpenAPI complete
tests complete
security hardening complete
CI/CD gates complete
no bank transfer initiation
no Open Banking payment initiation
no electronic invoicing
no public endpoints
no /me endpoints
no WordPress access
no external AI with real supplier/payment data
```

---

# 39. Expediente actualizado

```text id="i8nr94"
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
│   │       └── tasks.md
```
