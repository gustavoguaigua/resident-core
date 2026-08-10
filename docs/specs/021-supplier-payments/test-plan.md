# Test Plan — Spec 021 Supplier Payments

## 1. Información del documento

| Campo           | Valor                                                                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                 |
| Spec ID         | 021                                                                                                                                                           |
| Módulo          | Supplier Payments                                                                                                                                             |
| Documento       | Test Plan                                                                                                                                                     |
| Ruta            | `docs/specs/021-supplier-payments/test-plan.md`                                                                                                               |
| Versión         | 0.1                                                                                                                                                           |
| Estado          | needs-review                                                                                                                                                  |
| Fecha           | 2026-07-23                                                                                                                                                    |
| Documento base  | `docs/specs/021-supplier-payments/spec.md`                                                                                                                    |
| Plan técnico    | `docs/specs/021-supplier-payments/plan.md`                                                                                                                    |
| Modelo de datos | `docs/specs/021-supplier-payments/data-model.md`                                                                                                              |
| Contrato API    | `docs/specs/021-supplier-payments/api-contract.md`                                                                                                            |
| Depende de      | `001-tenants`, `002-users-roles`, `007-audit`, `008-basic-reports`, `016-secure-document-storage`, `017-bank-reconciliation`, `020-accounting-ledger`         |
| Naturaleza      | Tenant-scoped / Supplier-aware / Payable-driven / Approval-controlled / Evidence-backed / Accounting-linked / Reconciliation-ready / Audit-heavy / Non-public |

---

## 2. Propósito

Este documento define el plan de pruebas del módulo `021-supplier-payments`.

El objetivo es validar que Supplier Payments funcione como una capa segura para proveedores, cuentas por pagar, órdenes de pago, evidencias, egresos administrativos, vínculos contables, vínculos con conciliación bancaria, reportes y exportaciones.

Regla central de pruebas:

```text id="y1ez8a"
Supplier Payments debe probarse como un módulo financiero-administrativo crítico: ningún test debe permitir proveedores cross-tenant, obligaciones cross-tenant, órdenes cross-tenant, pagos duplicados, pagos superiores al saldo pendiente, pagos a proveedores bloqueados, pagos sin aprobación, pagos sin evidencia mínima, exposición de cuentas bancarias completas, exposición de storageKey, iniciación de transferencias bancarias, Open Banking payment initiation, edición de JournalEntry posted, confirmación final de Bank Reconciliation, endpoints públicos, endpoints /me, acceso desde WordPress o uso de IA externa con datos reales.
```

---

## 3. Objetivos del plan de pruebas

El plan debe validar:

```text id="j6ldeh"
- SupplierCategory tenant-scoped;
- Supplier tenant-scoped;
- SupplierContact tenant-scoped;
- SupplierBankAccount protegida;
- SupplierDocument vía Secure Document Storage;
- SupplierPayable;
- SupplierPayableApproval;
- SupplierPaymentOrder;
- SupplierPaymentOrderItem;
- SupplierPaymentEvidence;
- SupplierAccountingLink;
- SupplierBankReconciliationLink;
- estados y transiciones;
- validación de proveedores activos/bloqueados;
- duplicate detection;
- Decimal money;
- totalAmount server-side;
- outstandingAmount server-side;
- paidAmount controlado;
- partial payments;
- approval workflow básico;
- mark-paid manual;
- evidencia de pago;
- reversal/correction básico;
- integración con Accounting Ledger;
- boundary con Bank Reconciliation;
- integración con Secure Document Storage;
- reportes de cuentas por pagar;
- reportes de pagos por proveedor;
- reportes de egresos por categoría;
- cash outflow básico;
- export vía Secure Document Storage;
- audit completo;
- observabilidad segura;
- OpenAPI seguro;
- autorización por permisos;
- multitenancy;
- ausencia de endpoints públicos;
- ausencia de endpoints /me;
- ausencia de acceso desde WordPress;
- ausencia de transferencias bancarias automáticas;
- ausencia de Open Banking payment initiation;
- ausencia de electronic invoicing/SRI;
- ausencia de IA externa con datos reales.
```

---

## 4. Alcance de pruebas

### 4.1. Incluido

```text id="y0cuei"
1. Unit tests.
2. Value object tests.
3. Entity tests.
4. State machine tests.
5. Domain policy tests.
6. Repository tests.
7. Service tests.
8. Duplicate detection tests.
9. Decimal money tests.
10. Payable amount tests.
11. Outstanding amount tests.
12. Approval workflow tests.
13. Payment order tests.
14. Payment evidence tests.
15. Partial payment tests.
16. Reversal/correction tests.
17. Secure Document Storage integration tests.
18. Accounting Ledger integration tests.
19. Bank Reconciliation link tests.
20. Report tests.
21. Export tests.
22. API tests.
23. Authorization tests.
24. Multitenancy tests.
25. Financial integrity tests.
26. Security tests.
27. Audit tests.
28. Observability tests.
29. OpenAPI contract tests.
30. Performance tests.
31. Concurrency tests.
32. Regression tests.
33. Smoke tests.
34. CI/CD gates.
```

---

### 4.2. Fuera de alcance del MVP

No se prueban como funcionalidad activa:

```text id="jdncgt"
- transferencias bancarias automáticas;
- Open Banking payment initiation;
- archivos bancarios de pago masivo;
- tesorería avanzada;
- cash management avanzado;
- cuentas por pagar enterprise;
- workflow multi-nivel avanzado;
- órdenes de compra;
- recepción de bienes/servicios;
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
- OCR de facturas reales;
- IA para validar facturas reales;
- portal público de proveedores.
```

Aunque estén fuera de alcance, deben existir pruebas que verifiquen que estas capacidades no se habiliten accidentalmente cuando impliquen riesgo financiero, bancario, tributario o de exposición pública.

---

## 5. Estrategia general de pruebas

### 5.1. Pirámide de pruebas

```text id="z80vnu"
Value objects / entities / policies
  -> Repository tests
      -> Service tests
          -> Integration tests
              -> API tests
                  -> Security / financial integrity tests
                      -> Regression / smoke / CI gates
```

---

### 5.2. Principios

```text id="qk99if"
- probar tenant isolation en cada capa;
- probar reglas financieras antes que controladores;
- probar Decimal money antes que reportes;
- probar aprobación antes de pago;
- probar evidencia antes de paid;
- probar no overpayment;
- probar no duplicate payable;
- probar no payment initiation;
- probar no Open Banking payment initiation;
- probar que Supplier Payments no edita JournalEntry posted;
- probar que Supplier Payments no confirma Bank Reconciliation;
- probar que reportes y exports no exponen datos sensibles;
- probar que no existan rutas públicas ni /me;
- probar que WordPress no tenga acceso al módulo.
```

---

## 6. Datos base de prueba

### 6.1. Tenants

```text id="pcuzno"
tenantA: active
tenantB: active
tenantSuspended: suspended
tenantArchived: archived
```

---

### 6.2. Usuarios

```text id="i94w15"
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

### 6.3. Categorías

```text id="tg670i"
supplierCategorySecurityA
supplierCategoryCleaningA
supplierCategoryMaintenanceA
supplierCategoryUtilitiesA
supplierCategoryProfessionalA
supplierCategoryInactiveA
supplierCategoryArchivedA
supplierCategoryTenantB
```

---

### 6.4. Proveedores

```text id="e23ilv"
supplierDraftA
supplierActiveA
supplierInactiveA
supplierBlockedA
supplierArchivedA
supplierActiveWithoutBankAccountA
supplierActiveWithVerifiedBankAccountA
supplierActiveWithUnverifiedBankAccountA
supplierDuplicateCodeCandidateA
supplierDuplicateIdentificationCandidateA
supplierActiveB
```

---

### 6.5. Contactos

```text id="my0b5c"
supplierContactPrimaryA
supplierContactSecondaryA
supplierContactInactiveA
supplierContactArchivedA
supplierContactTenantB
```

---

### 6.6. Cuentas bancarias de proveedor

```text id="ydlnqv"
supplierBankAccountDraftA
supplierBankAccountVerifiedA
supplierBankAccountActiveA
supplierBankAccountInactiveA
supplierBankAccountRejectedA
supplierBankAccountArchivedA
supplierBankAccountDuplicateHashCandidateA
supplierBankAccountTenantB
```

---

### 6.7. Documentos

```text id="t6pedt"
supplierDocumentContractA
supplierDocumentTaxA
supplierDocumentInvoiceA
supplierDocumentReceiptA
supplierDocumentPaymentEvidenceA
supplierDocumentArchivedA
supplierDocumentTenantB
secureDocumentSupplierA
secureDocumentPayableA
secureDocumentEvidenceA
secureDocumentTenantB
```

---

### 6.8. Obligaciones por pagar

```text id="xemr7p"
supplierPayableDraftA
supplierPayablePendingReviewA
supplierPayableApprovedA
supplierPayableRejectedA
supplierPayableScheduledA
supplierPayablePartiallyPaidA
supplierPayablePaidA
supplierPayableCancelledA
supplierPayableVoidedA
supplierPayableArchivedA
supplierPayableOverdueA
supplierPayableDuplicateCandidateA
supplierPayableNegativeAmountCandidateA
supplierPayableOverpaymentCandidateA
supplierPayableTenantB
```

---

### 6.9. Aprobaciones

```text id="ohcsp8"
supplierPayableApprovalPendingA
supplierPayableApprovalApprovedA
supplierPayableApprovalRejectedA
supplierPayableApprovalCancelledA
supplierPayableApprovalTenantB
```

---

### 6.10. Órdenes de pago

```text id="tnn7md"
supplierPaymentOrderDraftA
supplierPaymentOrderPendingApprovalA
supplierPaymentOrderApprovedA
supplierPaymentOrderRejectedA
supplierPaymentOrderScheduledA
supplierPaymentOrderPaidA
supplierPaymentOrderPartiallyPaidA
supplierPaymentOrderFailedA
supplierPaymentOrderVoidedA
supplierPaymentOrderCancelledA
supplierPaymentOrderArchivedA
supplierPaymentOrderWithoutItemsA
supplierPaymentOrderWithoutEvidenceA
supplierPaymentOrderOverpaymentCandidateA
supplierPaymentOrderBlockedSupplierCandidateA
supplierPaymentOrderTenantB
```

---

### 6.11. Ítems de orden de pago

```text id="rhyk4t"
supplierPaymentOrderItemFullA
supplierPaymentOrderItemPartialA
supplierPaymentOrderItemInvalidAmountA
supplierPaymentOrderItemOverOutstandingA
supplierPaymentOrderItemCrossTenantPayableA
supplierPaymentOrderItemTenantB
```

---

### 6.12. Evidencias de pago

```text id="j7h77e"
supplierPaymentEvidenceUploadedA
supplierPaymentEvidenceVerifiedA
supplierPaymentEvidenceRejectedA
supplierPaymentEvidenceArchivedA
supplierPaymentEvidenceWithoutDocumentA
supplierPaymentEvidenceWithReferenceA
supplierPaymentEvidenceCrossTenantDocumentA
supplierPaymentEvidenceTenantB
```

---

### 6.13. Vínculos contables

```text id="zj99br"
supplierAccountingLinkPayableApprovedA
supplierAccountingLinkPaymentRecordedA
supplierAccountingLinkPaymentReversedA
supplierAccountingLinkFailedA
supplierAccountingLinkArchivedA
supplierAccountingLinkTenantB
```

---

### 6.14. Vínculos con conciliación bancaria

```text id="y353hs"
supplierBankReconciliationLinkActiveA
supplierBankReconciliationLinkUnlinkedA
supplierBankReconciliationLinkArchivedA
supplierBankReconciliationLinkCrossTenantBankTransactionA
supplierBankReconciliationLinkTenantB
```

---

### 6.15. Datos prohibidos en fixtures

Los fixtures no deben contener:

```text id="rxdo10"
datos reales de proveedores
nombres reales de empresas
RUC reales
cédulas reales
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
datos tributarios reales
```

---

## 7. Unit tests — Value Objects

### 7.1. `SupplierCode`

Debe probar:

```text id="qs2nif"
- acepta código válido;
- rechaza vacío;
- rechaza caracteres inseguros;
- normaliza espacios;
- rechaza longitud excesiva;
- mantiene unicidad delegada al repositorio;
- permite formato SUP-000001.
```

---

### 7.2. `SupplierName`

Debe probar:

```text id="f56lsr"
- acepta nombre válido;
- rechaza vacío;
- rechaza longitud excesiva;
- sanitiza caracteres de control;
- conserva caracteres en español;
- rechaza HTML/script ejecutable.
```

---

### 7.3. `SupplierIdentification`

Debe probar:

```text id="x023y1"
- acepta identificación válida;
- genera identificationNumberMasked;
- genera identificationNumberHash;
- no expone identificación completa en DTO;
- rechaza identificación vacía si la política la requiere;
- rechaza caracteres inseguros;
- permite identificación ausente si MVP lo permite.
```

---

### 7.4. `SupplierEmail`

Debe probar:

```text id="o3g0na"
- acepta email válido;
- rechaza email inválido;
- normaliza espacios;
- convierte a lowercase si se define la política;
- permite null si no es obligatorio.
```

---

### 7.5. `SupplierPhone`

Debe probar:

```text id="vudkbd"
- acepta teléfono válido;
- rechaza longitud excesiva;
- sanitiza caracteres inseguros;
- permite formato internacional;
- permite null.
```

---

### 7.6. `SupplierBankAccountMasked`

Debe probar:

```text id="speetj"
- genera masked desde número completo recibido;
- no conserva número completo;
- muestra solo últimos dígitos permitidos;
- rechaza cuenta vacía;
- rechaza longitud inválida;
- rechaza caracteres inseguros.
```

---

### 7.7. `SupplierBankAccountHash`

Debe probar:

```text id="uaj6ex"
- genera hash estable;
- mismo número produce mismo hash bajo mismo tenant/pepper;
- tenant distinto puede producir hash distinto si se usa tenant-aware pepper;
- no expone hash en DTO estándar;
- no acepta hash enviado por cliente.
```

---

### 7.8. `SupplierPayableNumber`

Debe probar:

```text id="z4fnpp"
- genera formato PAY-2026-07-000001;
- rechaza formato inválido si se permite manual;
- rechaza longitud excesiva;
- mantiene unicidad por tenant.
```

---

### 7.9. `SupplierExternalDocumentNumber`

Debe probar:

```text id="c4hakz"
- acepta número externo válido;
- normaliza espacios;
- genera externalDocumentNumberNormalized;
- rechaza caracteres inseguros;
- permite null para obligaciones manuales si la política lo permite.
```

---

### 7.10. `SupplierPayableDuplicateFingerprint`

Debe probar:

```text id="g0r5tk"
- genera fingerprint determinístico;
- incluye tenantId;
- incluye supplierId;
- incluye externalDocumentNumberNormalized;
- incluye issueDate;
- incluye totalAmount;
- cambia si cambia monto;
- cambia si cambia supplier;
- no se expone completo en DTO estándar.
```

---

### 7.11. `SupplierPaymentOrderNumber`

Debe probar:

```text id="m4z7iy"
- genera formato SPO-2026-07-000001;
- mantiene unicidad por tenant;
- rechaza formato inválido si se permite manual;
- no se reutiliza después de archive.
```

---

### 7.12. `SupplierPaymentReference`

Debe probar:

```text id="zuv985"
- acepta referencia válida;
- normaliza espacios;
- genera paymentReferenceHash;
- rechaza longitud excesiva;
- rechaza caracteres inseguros;
- permite null si existe secureDocumentId.
```

---

### 7.13. `SupplierPaymentAmount`

Debe probar:

```text id="rnkamk"
- acepta string decimal;
- rechaza number;
- rechaza float;
- rechaza NaN;
- rechaza negativos;
- rechaza más de 2 decimales si aplica;
- conserva precisión Decimal;
- 0.10 + 0.20 = 0.30 usando Decimal.
```

---

### 7.14. `SupplierOutstandingAmount`

Debe probar:

```text id="hf7dbd"
- total menos pagos válidos;
- nunca negativo;
- paid implica cero;
- partiallyPaid implica mayor que cero y menor que total;
- ignora órdenes voided/cancelled/reversed según política.
```

---

### 7.15. `SupplierDueDate`

Debe probar:

```text id="oc199u"
- acepta fecha válida;
- permite null;
- detecta overdue contra asOfDate;
- normaliza UTC;
- interpreta input de usuario con America/Guayaquil si aplica.
```

---

### 7.16. `SupplierPaymentDescription`

Debe probar:

```text id="sk8ip2"
- acepta descripción válida;
- rechaza longitud excesiva;
- sanitiza HTML/script;
- conserva caracteres en español;
- permite null cuando sea opcional.
```

---

### 7.17. `SupplierDocumentReference`

Debe probar:

```text id="evi937"
- acepta secureDocumentId válido;
- rechaza storageKey;
- rechaza signedUrl;
- rechaza base64;
- requiere validación tenant-scoped externa.
```

---

## 8. Unit tests — Entidades

### 8.1. `SupplierCategory`

Debe probar:

```text id="lxzsdg"
- crear active;
- actualizar datos;
- pasar active -> inactive;
- pasar inactive -> active;
- archivar active;
- archivar inactive;
- impedir archived -> active;
- emitir eventos de dominio.
```

---

### 8.2. `Supplier`

Debe probar:

```text id="p66oeq"
- crear draft;
- crear active si policy lo permite;
- activar draft;
- deshabilitar active;
- reactivar inactive;
- bloquear active;
- desbloquear blocked;
- archivar draft;
- archivar inactive;
- archivar blocked;
- impedir archived -> active;
- impedir creación sin supplierName;
- impedir creación con supplierCode inválido;
- no exponer identificación completa;
- emitir eventos.
```

---

### 8.3. `SupplierContact`

Debe probar:

```text id="f2ryiu"
- crear contacto active;
- crear contacto primary;
- actualizar contacto;
- inactivar contacto;
- archivar contacto;
- impedir archived -> active;
- validar email;
- validar supplierId requerido.
```

---

### 8.4. `SupplierBankAccount`

Debe probar:

```text id="ue51sw"
- crear draft;
- generar accountNumberMasked;
- generar accountNumberHash;
- verificar draft;
- activar verified;
- rechazar draft;
- deshabilitar active;
- reactivar inactive;
- archivar draft;
- archivar active;
- impedir rejected como cuenta usable;
- impedir archived como cuenta usable;
- no exponer número completo;
- emitir eventos.
```

---

### 8.5. `SupplierDocument`

Debe probar:

```text id="cbsxd6"
- vincular documento active;
- archivar documento;
- impedir exposición de storageKey;
- conservar secureDocumentId;
- validar documentType;
- emitir eventos.
```

---

### 8.6. `SupplierPayable`

Debe probar:

```text id="fpdeya"
- crear draft;
- calcular totalAmount;
- calcular outstandingAmount inicial;
- detectar duplicateFingerprint;
- pasar draft -> pendingReview;
- pendingReview -> approved;
- pendingReview -> rejected;
- approved -> scheduledForPayment;
- approved -> partiallyPaid;
- partiallyPaid -> paid;
- approved -> paid;
- draft -> cancelled;
- pendingReview -> cancelled;
- draft -> voided;
- rejected -> archived;
- paid -> archived;
- impedir paid si outstandingAmount > 0;
- impedir partiallyPaid si outstandingAmount = 0;
- impedir outstanding negativo;
- emitir eventos.
```

---

### 8.7. `SupplierPayableApproval`

Debe probar:

```text id="gj087t"
- crear pending;
- aprobar pending;
- rechazar pending;
- cancelar pending;
- impedir approved -> rejected;
- approved requiere approvedAt;
- rejected requiere rejectedAt y reason;
- conservar approvalStep.
```

---

### 8.8. `SupplierPaymentOrder`

Debe probar:

```text id="bzn00n"
- crear draft;
- agregar items;
- calcular totalAmount;
- pasar draft -> pendingApproval;
- pendingApproval -> approved;
- pendingApproval -> rejected;
- approved -> scheduled;
- approved -> paid;
- scheduled -> paid;
- approved -> partiallyPaid;
- approved -> voided;
- approved -> cancelled si no paid;
- paid -> archived;
- voided -> archived;
- cancelled -> archived;
- impedir paid sin aprobación;
- impedir paid sin referencia/evidencia;
- impedir paidAmount > totalAmount;
- impedir pago a supplier blocked;
- no iniciar transferencia;
- emitir eventos.
```

---

### 8.9. `SupplierPaymentOrderItem`

Debe probar:

```text id="qsozbx"
- crear item válido;
- amount > 0;
- rechazar amount = 0;
- rechazar amount negativo;
- rechazar amount > outstandingAmount;
- validar currency;
- validar lineNumber;
- validar payable aprobado;
- validar mismo tenant.
```

---

### 8.10. `SupplierPaymentEvidence`

Debe probar:

```text id="tzirja"
- crear uploaded;
- verificar uploaded;
- rechazar uploaded;
- archivar verified;
- archivar rejected;
- impedir rejected como evidencia válida;
- validar secureDocumentId opcional;
- validar paymentReference opcional;
- no exponer storageKey.
```

---

### 8.11. `SupplierAccountingLink`

Debe probar:

```text id="m3boh9"
- crear active para payable;
- crear active para payment order;
- crear failed con errorCode;
- marcar reversed;
- archivar;
- rechazar link sin payable/order;
- no editar JournalEntry posted.
```

---

### 8.12. `SupplierBankReconciliationLink`

Debe probar:

```text id="rgysw0"
- crear active con bankTransactionId;
- crear active con reconciliationMatchId;
- crear active con ambos;
- rechazar sin bankTransactionId ni reconciliationMatchId;
- unlink con reason;
- archivar;
- no crear ReconciliationMatch;
- no marcar BankTransaction matched.
```

---

## 9. Unit tests — Domain Policies

### 9.1. `SupplierTenantPolicy`

Debe probar:

```text id="k17shh"
- supplier pertenece al tenant;
- payable pertenece al tenant;
- paymentOrder pertenece al tenant;
- evidence pertenece al tenant;
- accountingLink pertenece al tenant;
- reconciliationLink pertenece al tenant;
- recursos tenant B son rechazados.
```

---

### 9.2. `SupplierStatusPolicy`

Debe probar:

```text id="pxumqv"
- active permite nuevas obligaciones;
- inactive rechaza nuevas obligaciones;
- blocked rechaza aprobación de órdenes;
- archived rechaza toda operación nueva;
- blocked puede conservar historial.
```

---

### 9.3. `SupplierBankAccountPrivacyPolicy`

Debe probar:

```text id="u9bqfg"
- no se almacena número completo;
- no se expone número completo;
- no se expone accountNumberHash en DTO estándar;
- accountNumberMasked se genera correctamente;
- cuenta rejected no se usa para pago.
```

---

### 9.4. `SupplierPayableDuplicatePolicy`

Debe probar:

```text id="u38121"
- mismo supplier/document/issueDate/amount detecta duplicado;
- supplier distinto no duplica;
- amount distinto no duplica;
- tenant distinto no duplica;
- payable cancelled puede excluirse según política;
- payable voided puede excluirse según política;
- evento supplierPayable.duplicateDetected se emite.
```

---

### 9.5. `SupplierPayableAmountPolicy`

Debe probar:

```text id="knp3uz"
- subtotal >= 0;
- tax >= 0;
- discount >= 0;
- total = subtotal + tax - discount;
- total >= 0;
- outstanding inicial = total;
- outstanding nunca negativo;
- currency USD.
```

---

### 9.6. `SupplierPayableApprovalPolicy`

Debe probar:

```text id="mq49uv"
- solo pendingReview puede aprobarse;
- supplier debe estar active;
- duplicado crítico bloquea aprobación según política;
- approval requiere permiso;
- rejected requiere reason;
- approved puede emitir evento contable.
```

---

### 9.7. `SupplierPaymentOrderApprovalPolicy`

Debe probar:

```text id="rlte1b"
- pendingApproval puede aprobarse;
- orden sin items se rechaza;
- supplier blocked se rechaza;
- items deben ser válidos;
- no excede outstanding;
- aprobación requiere permiso.
```

---

### 9.8. `SupplierPaymentOrderItemPolicy`

Debe probar:

```text id="e863g4"
- payable debe pertenecer al tenant;
- payable debe pertenecer al supplier de la orden salvo política futura;
- payable debe estar approved/partiallyPaid;
- amount > 0;
- amount <= outstandingAmount;
- lineNumber único.
```

---

### 9.9. `SupplierPaymentAmountPolicy`

Debe probar:

```text id="mt1dz4"
- paidAmount > 0;
- paidAmount <= totalAmount;
- sum(items) = totalAmount;
- payment item no excede outstanding;
- partial payment actualiza outstanding;
- paid actualiza outstanding a cero;
- no overpayment por concurrencia.
```

---

### 9.10. `SupplierPaymentEvidencePolicy`

Debe probar:

```text id="rxvjny"
- mark-paid requiere paymentReference o secureDocumentId;
- evidence rejected no valida pago;
- evidence verified valida pago;
- secureDocumentId cross-tenant se rechaza;
- no storageKey en DTO.
```

---

### 9.11. `SupplierPaymentImmutabilityPolicy`

Debe probar:

```text id="frkz9f"
- draft editable;
- pendingApproval editable bajo política;
- approved editable limitado;
- paid no editable destructivamente;
- reversed no editable destructivamente;
- archived no editable;
- corrección requiere reversal.
```

---

### 9.12. `SupplierPaymentReversalPolicy`

Debe probar:

```text id="w3h1ic"
- paid puede reversarse;
- partiallyPaid puede reversarse bajo política;
- draft no se reversa;
- voided no se reversa;
- cancelled no se reversa;
- requiere reason;
- puede generar accounting reversal;
- puede desvincular conciliación bajo política.
```

---

### 9.13. `SupplierAccountingIntegrationPolicy`

Debe probar:

```text id="tv7x2k"
- payableApproved puede emitir evento contable;
- paymentRecorded puede emitir evento contable;
- paymentReversed puede emitir evento contable;
- no SQL directo a JournalEntry;
- no edición de JournalEntry posted;
- fallo genera SupplierAccountingLink failed;
```

---

### 9.14. `SupplierBankReconciliationBoundaryPolicy`

Debe probar:

```text id="hwsdcg"
- puede vincular BankTransaction tenant-scoped;
- puede vincular ReconciliationMatch tenant-scoped;
- no crea ReconciliationMatch final;
- no marca BankTransaction matched;
- no cierra ReconciliationSession;
- no marca Payment reconciled.
```

---

### 9.15. `NoBankTransferInitiationPolicy`

Debe probar:

```text id="j6wzfy"
- mark-paid no inicia transferencia;
- approve no inicia transferencia;
- schedule no inicia transferencia;
- no existe endpoint transfer/initiate;
- feature flag bankTransferInitiation=false.
```

---

### 9.16. `NoOpenBankingPaymentInitiationPolicy`

Debe probar:

```text id="t9r41b"
- no existe endpoint Open Banking payment initiation;
- supplierPayments.openBankingPaymentInitiation.enabled=false;
- mark-paid no llama Open Banking payment initiation;
- schedule no llama Open Banking payment initiation.
```

---

### 9.17. `NoPublicSupplierPaymentEndpointPolicy`

Debe probar:

```text id="k2n4tk"
- no /public/suppliers;
- no /public/supplier-payables;
- no /public/supplier-payment-orders;
- no /public/supplier-payment-reports;
- rutas públicas retornan 404.
```

---

### 9.18. `NoMeSupplierPaymentEndpointPolicy`

Debe probar:

```text id="od850u"
- no /me/suppliers;
- no /me/supplier-payables;
- no /me/supplier-payment-orders;
- no /me/supplier-payment-reports;
- rutas /me retornan 404.
```

---

### 9.19. `NoWordPressSupplierPaymentAccessPolicy`

Debe probar:

```text id="n36gps"
- CORS público no permite Supplier Payments;
- WordPress no accede a payables;
- WordPress no accede a payment orders;
- WordPress no accede a evidence;
- WordPress no accede a reports.
```

---

### 9.20. `NoExternalAiSupplierPaymentDataPolicy`

Debe probar:

```text id="rh0rfd"
- supplierPayments.externalAi.enabled=false;
- no se envían facturas reales a IA;
- no se envían comprobantes reales a IA;
- no se envían datos bancarios reales a IA;
- no se envían reportes reales a IA;
- fixtures sintéticos permitidos.
```

---

## 10. Repository tests

### 10.1. Reglas generales

Cada repositorio tenant-scoped debe probar:

```text id="pj28zv"
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
- índices únicos previenen duplicados;
- constraints críticos funcionan.
```

---

### 10.2. `SupplierCategoryRepository`

Debe probar:

```text id="fsszcv"
- create category;
- categoryCode único por tenant;
- list active;
- archive;
- tenant isolation;
- archived excluded by default.
```

---

### 10.3. `SupplierRepository`

Debe probar:

```text id="ir1r59"
- create supplier;
- supplierCode único por tenant;
- identificationNumberHash único opcional por tenant;
- list by status;
- list by supplierType;
- list by category;
- activate;
- disable;
- block;
- archive;
- tenant isolation.
```

---

### 10.4. `SupplierContactRepository`

Debe probar:

```text id="c78axi"
- create contact;
- list by supplier;
- primary contact único si policy activa;
- update;
- archive;
- tenant isolation.
```

---

### 10.5. `SupplierBankAccountRepository`

Debe probar:

```text id="fju738"
- create bank account;
- accountNumberHash único para active/verified;
- list by supplier;
- verify;
- disable;
- archive;
- no full account number persisted;
- tenant isolation.
```

---

### 10.6. `SupplierDocumentRepository`

Debe probar:

```text id="bs4uj7"
- link secureDocument;
- secureDocument same tenant required at service layer;
- unique document link opcional;
- list by supplier;
- archive;
- tenant isolation.
```

---

### 10.7. `SupplierPayableRepository`

Debe probar:

```text id="k189g2"
- create payable;
- payableNumber único por tenant;
- duplicateFingerprint lookup;
- list by supplier;
- list by status;
- list by dueDate;
- list overdue;
- update draft;
- approve;
- reject;
- cancel;
- void;
- archive;
- total constraints;
- outstanding constraints;
- tenant isolation.
```

---

### 10.8. `SupplierPayableApprovalRepository`

Debe probar:

```text id="bh2827"
- create approval pending;
- unique pending step;
- approve;
- reject;
- cancel;
- list by payable;
- tenant isolation.
```

---

### 10.9. `SupplierPaymentOrderRepository`

Debe probar:

```text id="huyzrl"
- create order;
- paymentOrderNumber único por tenant;
- list by supplier;
- list by status;
- list by plannedPaymentDate;
- list by actualPaymentDate;
- approve;
- schedule;
- mark paid;
- reverse;
- archive;
- paid fields constraints;
- tenant isolation.
```

---

### 10.10. `SupplierPaymentOrderItemRepository`

Debe probar:

```text id="uljyoj"
- create item;
- lineNumber único por order;
- payable único por order;
- amount > 0;
- list by order;
- list by payable;
- tenant isolation.
```

---

### 10.11. `SupplierPaymentEvidenceRepository`

Debe probar:

```text id="u6wzft"
- create evidence;
- list by payment order;
- verify;
- reject;
- archive;
- verified requires verifiedAt;
- rejected requires reason;
- tenant isolation.
```

---

### 10.12. `SupplierAccountingLinkRepository`

Debe probar:

```text id="ru0xzf"
- create payable accounting link;
- create payment order accounting link;
- create failed link;
- unique active event by payable;
- unique active event by payment order;
- mark reversed;
- archive;
- tenant isolation.
```

---

### 10.13. `SupplierBankReconciliationLinkRepository`

Debe probar:

```text id="ryesrw"
- create link with bankTransaction;
- create link with reconciliationMatch;
- reject link without target;
- unique active link by bankTransaction;
- unique active link by match;
- unlink;
- archive;
- tenant isolation.
```

---

## 11. Service tests

### 11.1. `SupplierCategoryService`

Debe probar:

```text id="rqdns4"
- create category;
- reject duplicate categoryCode;
- list categories;
- update category;
- archive category;
- reject cross-tenant category;
- audit events.
```

---

### 11.2. `SupplierService`

Debe probar:

```text id="lb81w4"
- create supplier draft;
- create supplier with masked/hash identification;
- reject duplicate supplierCode;
- reject duplicate identification hash si policy activa;
- validate category tenant;
- validate accounting accounts tenant;
- activate supplier;
- disable supplier;
- block supplier;
- archive supplier;
- reject archived operation;
- audit events.
```

---

### 11.3. `SupplierContactService`

Debe probar:

```text id="o6e6ln"
- create contact for supplier;
- validate supplier tenant;
- set primary contact;
- replace primary contact si policy lo define;
- update contact;
- archive contact;
- reject cross-tenant contact;
- audit events.
```

---

### 11.4. `SupplierBankAccountService`

Debe probar:

```text id="uyjoab"
- create bank account reference;
- generate masked account number;
- generate account hash;
- generate beneficiary identification mask/hash;
- reject full account exposure;
- verify bank account;
- disable bank account;
- archive bank account;
- reject cross-tenant supplier;
- reject duplicate active account hash;
- audit events.
```

---

### 11.5. `SupplierDocumentService`

Debe probar:

```text id="oa4ixu"
- link secureDocument to supplier;
- validate supplier tenant;
- validate secureDocument tenant;
- reject storageKey in request;
- archive supplier document;
- return downloadAvailable only;
- audit events.
```

---

### 11.6. `SupplierPayableService`

Debe probar:

```text id="fkh7wg"
- create payable draft;
- validate supplier active;
- reject supplier inactive;
- reject supplier archived;
- calculate totalAmount;
- calculate outstandingAmount;
- calculate duplicateFingerprint;
- detect duplicate payable;
- update draft;
- reject update approved/paid;
- submit review;
- approve payable;
- reject payable;
- cancel payable;
- void payable;
- archive payable;
- emit accounting event if requested;
- audit events.
```

---

### 11.7. `SupplierPayableApprovalService`

Debe probar:

```text id="odxqcf"
- create approval pending;
- approve pending;
- reject pending;
- cancel pending;
- reject invalid transitions;
- validate payable tenant;
- audit events.
```

---

### 11.8. `SupplierPaymentOrderService`

Debe probar:

```text id="ebikxm"
- create payment order draft;
- validate supplier active;
- reject supplier blocked on approval;
- validate supplierBankAccount tenant;
- validate bankAccount tenant;
- validate items;
- calculate totalAmount;
- reject no items;
- submit approval;
- approve order;
- reject order;
- schedule order;
- mark paid;
- mark partially paid;
- void order;
- cancel order;
- reverse order;
- archive order;
- no bank transfer initiation;
- no Open Banking payment initiation;
- audit events.
```

---

### 11.9. `SupplierPaymentOrderItemService`

Debe probar:

```text id="s1k8rq"
- create valid item;
- validate payable tenant;
- validate payable supplier;
- validate payable approved;
- validate amount > 0;
- validate amount <= outstandingAmount;
- assign lineNumber;
- reject duplicate payable in same order;
- reject cross-tenant payable.
```

---

### 11.10. `SupplierPaymentEvidenceService`

Debe probar:

```text id="xgon60"
- create evidence with secureDocument;
- create evidence with paymentReference;
- validate paymentOrder tenant;
- validate secureDocument tenant;
- verify evidence;
- reject evidence;
- archive evidence;
- reject rejected evidence for paid support;
- no storageKey returned;
- audit events.
```

---

### 11.11. `SupplierPaymentAmountService`

Debe probar:

```text id="r8h3yw"
- calculate payable outstanding;
- calculate order total from items;
- calculate paid amount;
- partial payment updates payable status;
- full payment updates payable status;
- no outstanding negative;
- no overpayment;
- ignore voided/cancelled/reversed orders según política.
```

---

### 11.12. `SupplierDuplicateDetectionService`

Debe probar:

```text id="tkhsqw"
- calculate duplicate fingerprint;
- find duplicate candidate;
- ignore archived if policy;
- ignore voided if policy;
- tenant-specific duplicate detection;
- emit duplicate audit event.
```

---

### 11.13. `SupplierAccountingIntegrationService`

Debe probar:

```text id="y5x4xi"
- post supplierPayable.approved;
- post supplierPaymentOrder.paid;
- post supplierPaymentOrder.partiallyPaid;
- post supplierPaymentOrder.reversed;
- create SupplierAccountingLink active;
- create SupplierAccountingLink failed on error;
- no direct JournalEntry DB mutation;
- no JournalEntry posted edit;
- audit events.
```

---

### 11.14. `SupplierBankReconciliationLinkService`

Debe probar:

```text id="xq6s71"
- link payment order to bank transaction;
- link payment order to reconciliation match;
- validate payment order tenant;
- validate bankTransaction tenant;
- validate reconciliationMatch tenant;
- validate amount/date/reference compatibility if policy;
- unlink with reason;
- no create ReconciliationMatch;
- no mark BankTransaction matched;
- no close ReconciliationSession;
- audit events.
```

---

### 11.15. `SupplierPaymentReportService`

Debe probar:

```text id="thutro"
- payables aging report;
- payments by supplier report;
- expenses by category report;
- cash outflow report;
- tenant-scoped filters;
- Decimal totals;
- pagination;
- pageSize max;
- no mutation side effects;
- audit report generated.
```

---

### 11.16. `SupplierPaymentExportService`

Debe probar:

```text id="yc6szg"
- export payables aging;
- export payments by supplier;
- export expenses by category;
- export cash outflow;
- use Secure Document Storage;
- sourceModule=supplierPayments;
- sensitivity=restricted;
- visibility=administrative;
- no storageKey in response;
- audit report exported.
```

---

## 12. Integration tests

### 12.1. Secure Document Storage

Debe probar:

```text id="vxbnnl"
- link supplier document to SecureDocument;
- link payable document to SecureDocument;
- link payment evidence to SecureDocument;
- export report to SecureDocument;
- reject secureDocument cross-tenant;
- no storageKey exposure;
- download requires SDS permissions;
- audit supplierDocument.downloaded/supplierPaymentEvidence.downloaded.
```

---

### 12.2. Accounting Ledger — payable approved

Debe probar:

```text id="y9ffh5"
- approving payable emits supplierPayable.approved;
- Accounting Ledger receives source event;
- SupplierAccountingLink created active;
- journalEntryId stored if returned;
- no direct SQL to journal_entries;
- failure creates SupplierAccountingLink failed;
- retry does not duplicate accounting event if idempotency works.
```

---

### 12.3. Accounting Ledger — payment recorded

Debe probar:

```text id="q9fobt"
- mark-paid emits supplierPaymentOrder.paid;
- Accounting Ledger receives source event;
- SupplierAccountingLink created active;
- no JournalEntry posted mutation;
- paid operation remains auditable if accounting fails;
- accountingLink.failed requires review.
```

---

### 12.4. Accounting Ledger — payment reversed

Debe probar:

```text id="p69jik"
- reverse paid order emits supplierPaymentOrder.reversed;
- Accounting Ledger receives reversal event;
- SupplierAccountingLink reversed/active as policy defines;
- no destructive edit of original accounting link;
- no JournalEntry posted edit.
```

---

### 12.5. Bank Reconciliation

Debe probar:

```text id="j6b6vn"
- link paid order to BankTransaction;
- link paid order to ReconciliationMatch;
- validate bank transaction tenant;
- validate match tenant;
- reject cross-tenant bank transaction;
- reject cross-tenant match;
- unlink with reason;
- no ReconciliationMatch final creation;
- no BankTransaction matched mutation;
- no ReconciliationSession close.
```

---

### 12.6. Basic Reports

Debe probar:

```text id="h8metu"
- supplier reports integrate with basic reporting layer if applicable;
- report registry includes supplier payment reports;
- export sourceModule is supplierPayments;
- no public report exposure.
```

---

### 12.7. Audit

Debe probar:

```text id="ov5khq"
- all critical events are emitted;
- metadata is sanitized;
- no full account number in audit;
- no storageKey in audit;
- no raw documents in audit;
- traceId present.
```

---

## 13. API tests

### 13.1. Supplier Categories API

Debe probar endpoints:

```text id="t7lmsp"
GET    /api/v1/tenant/supplier-payment-categories
POST   /api/v1/tenant/supplier-payment-categories
GET    /api/v1/tenant/supplier-payment-categories/{categoryId}
PATCH  /api/v1/tenant/supplier-payment-categories/{categoryId}
POST   /api/v1/tenant/supplier-payment-categories/{categoryId}/archive
```

Casos:

```text id="tkpdcb"
- autorizado puede crear;
- sin permiso recibe 403;
- tenantId en body recibe 422;
- categoryCode duplicado recibe 409;
- cross-tenant recibe 404;
- archived no aparece por defecto;
- audit.
```

---

### 13.2. Suppliers API

Debe probar endpoints:

```text id="fwqh1t"
GET    /api/v1/tenant/suppliers
POST   /api/v1/tenant/suppliers
GET    /api/v1/tenant/suppliers/{supplierId}
PATCH  /api/v1/tenant/suppliers/{supplierId}
POST   /api/v1/tenant/suppliers/{supplierId}/activate
POST   /api/v1/tenant/suppliers/{supplierId}/disable
POST   /api/v1/tenant/suppliers/{supplierId}/block
POST   /api/v1/tenant/suppliers/{supplierId}/archive
```

Casos:

```text id="xh2adw"
- crear supplier;
- supplierCode duplicado 409;
- categoryId cross-tenant 404;
- defaultExpenseAccountId cross-tenant 404;
- defaultAccountsPayableAccountId cross-tenant 404;
- identificationNumber completo no se devuelve;
- status directo en PATCH 422;
- activar supplier draft;
- bloquear supplier active;
- archivar supplier;
- cross-tenant 404;
- audit.
```

---

### 13.3. Supplier Contacts API

Debe probar endpoints:

```text id="iqk9xz"
GET    /api/v1/tenant/suppliers/{supplierId}/contacts
POST   /api/v1/tenant/suppliers/{supplierId}/contacts
GET    /api/v1/tenant/supplier-contacts/{contactId}
PATCH  /api/v1/tenant/supplier-contacts/{contactId}
POST   /api/v1/tenant/supplier-contacts/{contactId}/archive
```

Casos:

```text id="bp4vsi"
- crear contacto;
- supplierId cross-tenant 404;
- contacto primary único si policy activa;
- archive funciona;
- cross-tenant contact 404;
- audit.
```

---

### 13.4. Supplier Bank Accounts API

Debe probar endpoints:

```text id="q0h2ra"
GET    /api/v1/tenant/suppliers/{supplierId}/bank-accounts
POST   /api/v1/tenant/suppliers/{supplierId}/bank-accounts
GET    /api/v1/tenant/supplier-bank-accounts/{bankAccountId}
PATCH  /api/v1/tenant/supplier-bank-accounts/{bankAccountId}
POST   /api/v1/tenant/supplier-bank-accounts/{bankAccountId}/verify
POST   /api/v1/tenant/supplier-bank-accounts/{bankAccountId}/disable
POST   /api/v1/tenant/supplier-bank-accounts/{bankAccountId}/archive
```

Casos:

```text id="k9yhje"
- crear cuenta bancaria;
- response muestra accountNumberMasked;
- response no muestra accountNumber;
- response no muestra accountNumberHash;
- verify funciona;
- disable funciona;
- rejected/archived no se usan para pago;
- duplicate active account hash 409;
- cross-tenant 404;
- audit.
```

---

### 13.5. Supplier Documents API

Debe probar endpoints:

```text id="hy6aay"
GET    /api/v1/tenant/suppliers/{supplierId}/documents
POST   /api/v1/tenant/suppliers/{supplierId}/documents
GET    /api/v1/tenant/supplier-documents/{supplierDocumentId}
POST   /api/v1/tenant/supplier-documents/{supplierDocumentId}/archive
```

Casos:

```text id="jlk03q"
- vincular SecureDocument;
- secureDocument cross-tenant 404;
- supplier cross-tenant 404;
- response no storageKey;
- response no signedUrl persistente;
- archive funciona;
- audit.
```

---

### 13.6. Supplier Payables API

Debe probar endpoints:

```text id="njowzd"
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

Casos:

```text id="hj3x22"
- crear payable para supplier active;
- crear payable para supplier inactive 409;
- crear payable para supplier archived 409;
- tenantId body 422;
- totalAmount en body como fuente de verdad 422 si no permitido;
- monto number en lugar de string 422;
- monto negativo 422;
- secureDocument cross-tenant 404;
- duplicate payable detectado;
- update draft funciona;
- update approved/paid 409;
- submit-review funciona;
- approve funciona;
- approve duplicate crítico 409 o controlled warning según policy;
- reject requiere reason;
- cancel requiere reason;
- void requiere reason;
- archive funciona;
- cross-tenant 404;
- audit.
```

---

### 13.7. Supplier Payment Orders API

Debe probar endpoints:

```text id="m0n2ep"
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

Casos:

```text id="l7gsit"
- crear order con items válidos;
- crear order sin items 422;
- item con payable no aprobado 409;
- item cross-tenant 404;
- item amount > outstanding 409;
- totalAmount calculado server-side;
- update draft funciona;
- update paid 409;
- submit-approval funciona;
- approve funciona;
- approve supplier blocked 409;
- reject requiere reason;
- schedule funciona;
- mark-paid approved funciona;
- mark-paid scheduled funciona;
- mark-paid pendingApproval 409;
- mark-paid sin reference/evidence 409/422;
- mark-paid paidAmount > totalAmount 409;
- mark-paid no inicia transferencia bancaria;
- mark-paid no inicia Open Banking payment;
- reverse paid funciona;
- reverse requiere reason;
- reverse no edita destructivamente;
- archive funciona;
- cross-tenant 404;
- audit.
```

---

### 13.8. Supplier Payment Evidence API

Debe probar endpoints:

```text id="u5an9k"
GET    /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/evidence
POST   /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/evidence
GET    /api/v1/tenant/supplier-payment-evidence/{evidenceId}
POST   /api/v1/tenant/supplier-payment-evidence/{evidenceId}/verify
POST   /api/v1/tenant/supplier-payment-evidence/{evidenceId}/reject
POST   /api/v1/tenant/supplier-payment-evidence/{evidenceId}/archive
```

Casos:

```text id="nr3m71"
- crear evidence con secureDocument;
- crear evidence con paymentReference;
- secureDocument cross-tenant 404;
- paymentOrder cross-tenant 404;
- verify funciona;
- reject requiere reason;
- rejected no valida mark-paid;
- response no storageKey;
- archive funciona;
- audit.
```

---

### 13.9. Reconciliation Links API

Debe probar endpoints:

```text id="t7g7n3"
GET  /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/reconciliation-links
POST /api/v1/tenant/supplier-payment-orders/{paymentOrderId}/reconciliation-links
POST /api/v1/tenant/supplier-payment-reconciliation-links/{linkId}/unlink
```

Casos:

```text id="oqedze"
- crear link con bankTransaction;
- crear link con reconciliationMatch;
- crear link sin ambos 422;
- bankTransaction cross-tenant 404;
- reconciliationMatch cross-tenant 404;
- unlink requiere reason;
- no crea ReconciliationMatch;
- no marca BankTransaction matched;
- no cierra ReconciliationSession;
- audit.
```

---

### 13.10. Reports API

Debe probar endpoints:

```text id="x79q8r"
GET /api/v1/tenant/supplier-payment-reports/payables-aging
GET /api/v1/tenant/supplier-payment-reports/payments-by-supplier
GET /api/v1/tenant/supplier-payment-reports/expenses-by-category
GET /api/v1/tenant/supplier-payment-reports/cash-outflow
GET /api/v1/tenant/supplier-payment-reports/export
```

Casos:

```text id="iqppcy"
- payables aging tenant-scoped;
- payments by supplier tenant-scoped;
- expenses by category tenant-scoped;
- cash outflow tenant-scoped;
- pageSize max 100;
- report totals use Decimal;
- export uses Secure Document Storage;
- export response no storageKey;
- no tenant B data;
- audit report generated/exported.
```

---

## 14. Multitenancy tests

### 14.1. Recursos tenant-scoped

Debe probar que tenant A no puede leer, modificar, aprobar, pagar, reversar, archivar, descargar ni exportar recursos de tenant B:

```text id="uomgyl"
SupplierCategory
Supplier
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
SupplierPaymentReport
SecureDocument vinculado
BankTransaction vinculado
ReconciliationMatch vinculado
JournalEntry vinculado
```

---

### 14.2. Casos críticos

```text id="zxhj7f"
- tenant A no crea payable con supplierId tenant B;
- tenant A no crea contact con supplierId tenant B;
- tenant A no crea bank account con supplierId tenant B;
- tenant A no vincula secureDocument tenant B;
- tenant A no crea order con payable tenant B;
- tenant A no crea evidence con order tenant B;
- tenant A no vincula bankTransaction tenant B;
- tenant A no vincula reconciliationMatch tenant B;
- tenant A no consulta reportes con datos tenant B;
- tenant A no descarga evidence tenant B.
```

---

### 14.3. Respuesta esperada

```text id="lc3dcw"
404 recomendado para recursos cross-tenant.
403 permitido si la política global lo define.
Nunca revelar existencia de recursos de otro tenant.
```

---

## 15. Authorization tests

### 15.1. PlatformAdmin

Debe probar:

```text id="f8gfxq"
- no accede automáticamente a proveedores tenant;
- no accede automáticamente a payables tenant;
- no aprueba pagos tenant por defecto;
- acceso excepcional requiere permiso explícito y tenant context;
- acceso excepcional se audita.
```

---

### 15.2. TenantAdmin

Debe probar:

```text id="k6qqbe"
- puede leer si tiene permisos;
- no puede aprobar payables sin supplierPayables.approve;
- no puede aprobar órdenes sin supplierPaymentOrders.approve;
- no puede marcar paid sin supplierPaymentOrders.markPaid;
- no puede exportar sin supplierPaymentReports.export.
```

---

### 15.3. FinancialManager

Debe probar:

```text id="xzcazv"
- puede administrar suppliers si tiene permisos;
- puede aprobar payables;
- puede aprobar payment orders;
- puede bloquear proveedores;
- puede consultar reportes;
- puede exportar reportes.
```

---

### 15.4. Accountant

Debe probar:

```text id="v75qca"
- puede crear payables si tiene permiso;
- puede crear payment orders si tiene permiso;
- puede marcar paid si tiene permiso;
- no puede aprobar si no tiene supplierPaymentOrders.approve;
- puede cargar evidence si tiene permiso;
- puede vincular conciliación si tiene permiso.
```

---

### 15.5. BoardMember

Debe probar:

```text id="ashlpa"
- puede leer reportes si tiene permiso;
- no crea proveedores por defecto;
- no crea payables por defecto;
- no aprueba pagos por defecto;
- no marca paid por defecto;
- no descarga evidencias salvo permiso explícito.
```

---

### 15.6. Resident / PropertyOwner

Debe probar:

```text id="y6tqh0"
- no existe /me supplier payments;
- no puede leer proveedores;
- no puede leer payables;
- no puede leer payment orders;
- no puede leer evidence;
- no puede leer reports;
- recibe 404/403 según superficie.
```

---

## 16. Financial integrity tests

### 16.1. Decimal money

Debe probar:

```text id="tk08qo"
- todos los montos aceptan string decimal;
- se rechaza number;
- se rechaza float;
- se rechaza NaN;
- se rechaza negativo;
- se conserva precisión Decimal;
- reportes usan Decimal;
- API devuelve string decimal.
```

---

### 16.2. Payable total

Debe probar:

```text id="bvt2nf"
- totalAmount = subtotalAmount + taxAmount - discountAmount;
- totalAmount no depende del frontend;
- totalAmount no puede ser negativo;
- discountAmount no puede producir total negativo;
- taxAmount no puede ser negativo.
```

---

### 16.3. Outstanding amount

Debe probar:

```text id="jon095"
- outstanding inicial = totalAmount;
- outstanding disminuye con pagos válidos;
- outstanding no cambia con payment order draft;
- outstanding no cambia con rejected/voided/cancelled order;
- outstanding aumenta/recalcula con reversal;
- outstanding nunca es negativo;
- paid requiere outstanding = 0;
- partiallyPaid requiere outstanding intermedio.
```

---

### 16.4. Payment order amount

Debe probar:

```text id="wuor03"
- totalAmount se calcula desde items;
- paidAmount no excede totalAmount;
- item amount no excede outstanding;
- item amount debe ser > 0;
- currency consistente;
- no payment order sin items.
```

---

### 16.5. Partial payment

Debe probar:

```text id="xnx9ru"
- pago parcial actualiza payable a partiallyPaid;
- saldo pendiente correcto;
- segundo pago completa payable;
- pagos parciales concurrentes no generan overpayment;
- reportes reflejan saldo parcial.
```

---

### 16.6. Duplicate prevention

Debe probar:

```text id="r8zuit"
- duplicateFingerprint detecta duplicado;
- payable duplicado emite warning/error según política;
- payable duplicado no se aprueba si política bloquea;
- retry de create no duplica si Idempotency-Key se usa;
- tenant distinto no duplica.
```

---

### 16.7. Payment immutability

Debe probar:

```text id="txqbaf"
- paid order no permite PATCH ordinario;
- paid order no permite editar items;
- paid order no permite cambiar supplier;
- paid order no permite cambiar amount;
- corrección usa reverse;
- reverse requiere reason;
- reverse conserva histórico.
```

---

## 17. Security tests

### 17.1. Input hardening

Debe probar rechazo de:

```text id="b2mn2u"
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
status directo
totalAmount como fuente de verdad no permitida
outstandingAmount
paidAmount fuera de mark-paid controlado
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
bankTransactionId directo fuera de endpoint controlado
reconciliationMatchId directo fuera de endpoint controlado
payment initiation fields
Open Banking payment initiation fields
external AI flags
```

---

### 17.2. Public endpoints forbidden

Debe probar que retornan 404:

```text id="tyjh92"
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

---

### 17.3. `/me` endpoints forbidden

Debe probar que retornan 404:

```text id="yuvms3"
GET  /api/v1/me/suppliers
GET  /api/v1/me/supplier-payables
GET  /api/v1/me/supplier-payment-orders
GET  /api/v1/me/supplier-payment-reports
POST /api/v1/me/supplier-payables
POST /api/v1/me/supplier-payment-orders
```

---

### 17.4. Bank data protection

Debe probar:

```text id="g0dyvf"
- accountNumber completo no se persiste como campo ordinario;
- accountNumber completo no se devuelve;
- accountNumberHash no se devuelve en DTO estándar;
- beneficiaryIdentificationHash no se devuelve;
- accountNumberMasked sí se devuelve;
- logs no contienen cuenta completa;
- audit no contiene cuenta completa.
```

---

### 17.5. Secure Document Storage protection

Debe probar:

```text id="lyksxh"
- storageKey no se devuelve;
- signedUrl persistente no se devuelve;
- base64 no se devuelve;
- secureDocumentId cross-tenant 404;
- downloads pasan por SDS;
- audit de descarga existe.
```

---

### 17.6. No bank transfer initiation

Debe probar:

```text id="x0gsy6"
- mark-paid no llama provider bancario;
- approve no llama provider bancario;
- schedule no llama provider bancario;
- no existe endpoint de transferencia;
- feature flag bankTransferInitiation=false;
- request con payment initiation fields se rechaza.
```

---

### 17.7. No Open Banking payment initiation

Debe probar:

```text id="feausu"
- no endpoint Open Banking payment initiation;
- mark-paid no llama Open Banking;
- schedule no llama Open Banking;
- openBankingPaymentInitiation=false;
- request con campos Open Banking payment initiation se rechaza.
```

---

### 17.8. WordPress isolation

Debe probar:

```text id="ev63k9"
- WordPress no puede consultar suppliers;
- WordPress no puede consultar payables;
- WordPress no puede consultar payment orders;
- WordPress no puede consultar reports;
- WordPress no puede descargar evidencias;
- CORS público no permite rutas supplier-payments.
```

---

### 17.9. External AI prohibition

Debe probar:

```text id="xxhopi"
- SUPPLIER_PAYMENTS_EXTERNAL_AI_ENABLED=false;
- supplierPayments.externalAi.enabled=false;
- no facturas reales se envían a IA;
- no comprobantes reales se envían a IA;
- no cuentas bancarias reales se envían a IA;
- no reportes reales se envían a IA;
- solo fixtures sintéticos pueden usarse.
```

---

## 18. Audit tests

### 18.1. Eventos obligatorios

Debe probar emisión de:

```text id="kp9js2"
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

### 18.2. Metadata permitida

Debe validar que audit puede incluir:

```text id="r80yas"
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

### 18.3. Metadata prohibida

Debe validar ausencia de:

```text id="k4os5y"
tokens
secrets
passwords
full bank account number
accountNumberHash
identificationNumberHash
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

### 18.4. Auditoría reforzada

Debe probar auditoría reforzada en:

```text id="xxt76o"
- bloqueo de proveedor;
- verificación de cuenta bancaria;
- detección de payable duplicado;
- aprobación de payable;
- aprobación de payment order;
- mark-paid;
- reverse payment order;
- vinculación con BankTransaction;
- desvinculación de BankTransaction;
- fallo de Accounting Ledger;
- export de reportes;
- acceso excepcional PlatformAdmin.
```

---

## 19. Observability tests

### 19.1. Logs permitidos

Debe probar emisión segura para:

```text id="ily991"
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

### 19.2. Campos permitidos en logs

```text id="ml2jbq"
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

### 19.3. Campos prohibidos en logs

```text id="ez97g3"
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
raw payload
storageKey
signedUrl
SQL raw
stack trace en producción
```

---

### 19.4. Métricas

Debe probar emisión de:

```text id="s1fp77"
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

### 19.5. Labels permitidos

```text id="i1lu5a"
supplierType
payableStatus
paymentOrderStatus
paymentMethod
documentType
currency
outcome
```

---

### 19.6. Labels prohibidos

```text id="kp35mo"
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

## 20. OpenAPI contract tests

Debe validar:

```text id="z26j68"
- OpenAPI contiene tags esperados;
- endpoints tenant documentados correctamente;
- no documenta endpoints públicos supplier payments;
- no documenta endpoints /me supplier payments;
- DTOs no contienen tenantId;
- DTOs no contienen actor fields;
- DTOs no exponen fullBankAccountNumber;
- DTOs no exponen accountNumberHash;
- DTOs no exponen storageKey;
- DTOs monetarios usan string decimal;
- x-tenant-scope=true;
- x-auth-required=true;
- x-supplier-payments=true;
- x-public-exposure=false;
- x-payable-controlled=true;
- x-approval-required=true;
- x-duplicate-detection=true;
- x-decimal-money=true;
- x-payment-order=true;
- x-bank-transfer-initiation=false;
- x-evidence-required-for-paid=true;
- x-accounting-linked=true;
- x-reconciliation-ready=true;
- x-secure-document-storage=true;
- x-storage-key-exposed=false;
- x-public-endpoint=false;
- x-me-endpoint=false;
- x-wordpress-access=false;
- x-open-banking-payment-initiation=false;
- x-electronic-invoicing=false;
- x-external-ai-real-data=false.
```

---

## 21. Performance tests

### 21.1. Objetivos

```text id="h899oj"
p95 < 800 ms para listar proveedores paginados.
p95 < 1000 ms para listar obligaciones paginadas.
p95 < 1200 ms para listar órdenes de pago paginadas.
p95 < 1500 ms para generar reporte de cuentas por pagar típico.
p95 < 2000 ms para reporte de egresos mensual típico.
```

---

### 21.2. Escenarios

```text id="yb3lxf"
- listar 100 proveedores;
- listar 1000 payables paginados;
- listar 1000 payment orders paginadas;
- generar payables aging con 1000 obligaciones;
- generar payments by supplier mensual;
- generar expenses by category mensual;
- generar cash outflow mensual;
- exportar reporte CSV/XLSX/PDF;
- consultar supplier con contacts/bankAccounts/documents;
- consultar payment order con items/evidence.
```

---

### 21.3. Validaciones técnicas

```text id="m2m83s"
- no N+1 evidente;
- pageSize máximo 100;
- índices por tenant, supplier, status, dueDate, plannedPaymentDate, actualPaymentDate;
- reportes pesados preparados para jobs futuros;
- exports controlados;
- queries siempre filtran tenantId.
```

---

## 22. Concurrency tests

Debe probar:

```text id="im1yyq"
- dos create supplier con mismo supplierCode: un éxito y un 409;
- dos create payable duplicados simultáneos: controlado por duplicate policy;
- dos pagos simultáneos sobre el mismo payable no generan overpayment;
- dos mark-paid simultáneos sobre la misma order no duplican paid;
- dos reverse simultáneos no duplican reverso;
- dos verification simultáneas de bank account no rompen estado;
- approve y reject simultáneos de payable terminan en estado consistente;
- close/update de payable y payment order concurrente respeta transacción;
- creation de paymentOrderNumber simultánea no duplica número.
```

---

## 23. Regression tests

### 23.1. `016-secure-document-storage`

Debe verificar:

```text id="ue1dal"
- documentos seguros siguen funcionando;
- downloads auditados siguen funcionando;
- sourceModule=supplierPayments funciona;
- no storageKey exposure;
- permisos de descarga se respetan;
- archivado lógico no borra documentos.
```

---

### 23.2. `017-bank-reconciliation`

Debe verificar:

```text id="snbcmj"
- conciliación bancaria sigue confirmando matches;
- Supplier Payments no crea ReconciliationMatch final;
- Supplier Payments no marca BankTransaction matched;
- Supplier Payments no cierra ReconciliationSession;
- link/unlink no afecta estado final de conciliación.
```

---

### 23.3. `020-accounting-ledger`

Debe verificar:

```text id="v40tqx"
- Accounting Ledger sigue posteando source events;
- Supplier Payments no edita JournalEntry posted;
- supplierPayable.approved no duplica asiento;
- supplierPaymentOrder.paid no duplica asiento;
- supplierPaymentOrder.reversed genera evento correcto;
- fallos contables quedan en SupplierAccountingLink failed.
```

---

### 23.4. `007-audit`

Debe verificar:

```text id="x92yju"
- audit logs siguen sanitizados;
- eventos de Supplier Payments aparecen;
- metadata prohibida no aparece;
- traceId se conserva;
- audit cross-tenant no ocurre.
```

---

### 23.5. `008-basic-reports`

Debe verificar:

```text id="d0m66q"
- report registry no rompe reportes existentes;
- supplier reports no exponen datos públicos;
- exports via SDS funcionan;
- pageSize max se respeta.
```

---

## 24. Smoke tests

Debe ejecutar flujo mínimo:

```text id="kqsbie"
1. FinancialManager crea SupplierCategory.
2. FinancialManager crea Supplier.
3. FinancialManager activa Supplier.
4. Accountant crea SupplierBankAccount.
5. FinancialManager verifica SupplierBankAccount.
6. Accountant vincula SupplierDocument vía Secure Document Storage.
7. Accountant crea SupplierPayable.
8. Sistema calcula totalAmount.
9. Sistema calcula outstandingAmount.
10. Sistema calcula duplicateFingerprint.
11. Accountant envía SupplierPayable a revisión.
12. FinancialManager aprueba SupplierPayable.
13. Sistema emite supplierPayable.approved hacia Accounting Ledger si está habilitado.
14. Sistema crea SupplierAccountingLink.
15. Accountant crea SupplierPaymentOrder con item.
16. Sistema valida outstandingAmount.
17. Sistema calcula totalAmount de la orden.
18. Accountant envía orden a aprobación.
19. FinancialManager aprueba orden.
20. Accountant adjunta SupplierPaymentEvidence.
21. Accountant marca SupplierPaymentOrder como paid.
22. Sistema valida referencia/evidencia.
23. Sistema actualiza paidAmount.
24. Sistema actualiza outstandingAmount del payable.
25. Sistema marca payable como paid.
26. Sistema emite supplierPaymentOrder.paid hacia Accounting Ledger si está habilitado.
27. Accountant vincula pago con BankTransaction.
28. Sistema crea SupplierBankReconciliationLink sin confirmar conciliación final.
29. FinancialManager consulta Payables Aging.
30. FinancialManager consulta Payments by Supplier.
31. FinancialManager exporta reporte vía Secure Document Storage.
32. Sistema audita eventos críticos.
```

---

## 25. CI/CD gates

El pipeline debe fallar si:

```text id="qa1ken"
- falla lint;
- falla typecheck;
- fallan unit tests;
- fallan value object tests;
- fallan entity tests;
- fallan policy tests;
- fallan repository tests;
- fallan service tests;
- fallan integration tests;
- fallan API tests;
- fallan authorization tests;
- fallan multitenancy tests;
- fallan financial integrity tests;
- fallan security tests;
- fallan audit tests;
- fallan observability tests;
- fallan OpenAPI tests;
- fallan regression tests;
- fallan smoke tests;
- OpenAPI documenta endpoints públicos supplier payments;
- OpenAPI documenta endpoints /me supplier payments;
- DTOs aceptan tenantId;
- DTOs aceptan actor fields;
- DTOs exponen fullBankAccountNumber;
- DTOs exponen accountNumberHash;
- DTOs exponen storageKey;
- se detecta float/double para dinero;
- se permite supplier cross-tenant;
- se permite payable cross-tenant;
- se permite payment order cross-tenant;
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

## 26. Cobertura mínima recomendada

```text id="z4nf0v"
Value Objects: 95%
Entities / state machines: 95%
Domain policies: 95%
Repositories: 90%
Services: 90%
Duplicate detection: 95%
Amount calculation: 95%
Outstanding calculation: 95%
Approval workflow: 90%
Payment order flow: 95%
Payment evidence: 90%
Partial payments: 95%
Accounting integration: 90%
Bank Reconciliation boundary: 90%
Reports: 85%
Authorization: 90%
Multitenancy: 95%
Security tests: 95%
API controllers: 85%
Observability: 75%
```

Advertencia:

```text id="znwaou"
La cobertura no reemplaza pruebas de integridad financiera. Un módulo con alta cobertura pero sin pruebas de no overpayment, no duplicate payable, no paid sin aprobación, no bank transfer initiation, no Open Banking payment initiation y no cross-tenant access no debe aceptarse.
```

---

## 27. Matriz de trazabilidad

| Requisito                          | Tests mínimos                        |
| ---------------------------------- | ------------------------------------ |
| Tenant isolation                   | Repository, API, security, reports   |
| Supplier registry                  | Entity, service, API                 |
| Supplier status                    | Entity, policy, service              |
| Supplier bank account protection   | Value object, service, API, security |
| Supplier documents                 | SDS integration, API, security       |
| Payable creation                   | Entity, service, API                 |
| Duplicate detection                | Value object, policy, service        |
| Decimal money                      | Value object, service, report, CI    |
| Outstanding amount                 | Service, financial integrity         |
| Payable approval                   | Policy, service, API, audit          |
| Payment order creation             | Service, API                         |
| Payment order approval             | Policy, service, API                 |
| Mark-paid manual                   | Service, API, financial integrity    |
| Evidence required                  | Policy, API, security                |
| Partial payments                   | Service, financial integrity         |
| Reversal/correction                | Service, API, accounting integration |
| No transfer initiation             | Policy, security, CI                 |
| No Open Banking payment initiation | Policy, security, CI                 |
| Accounting integration             | Integration, regression              |
| No JournalEntry posted mutation    | Integration, regression, security    |
| Bank reconciliation link           | Integration, API                     |
| No final reconciliation            | Integration, regression, security    |
| Reports                            | Report tests                         |
| Exports via SDS                    | Export integration                   |
| Audit                              | Audit tests                          |
| Observability                      | Logs/metrics tests                   |
| OpenAPI safe                       | Contract tests                       |
| No public endpoints                | API route tests                      |
| No /me endpoints                   | API route tests                      |
| No WordPress access                | CORS/security tests                  |
| No external AI real data           | Feature flag/security tests          |

---

## 28. Checklist de aceptación de pruebas

```text id="d7zevk"
[ ] Unit tests implementados.
[ ] Value object tests implementados.
[ ] Entity tests implementados.
[ ] State machine tests implementados.
[ ] Domain policy tests implementados.
[ ] Repository tests implementados.
[ ] Service tests implementados.
[ ] Duplicate detection tests implementados.
[ ] Decimal money tests implementados.
[ ] Payable amount tests implementados.
[ ] Outstanding amount tests implementados.
[ ] Approval workflow tests implementados.
[ ] Payment order tests implementados.
[ ] Payment evidence tests implementados.
[ ] Partial payment tests implementados.
[ ] Reversal/correction tests implementados.
[ ] Secure Document Storage integration tests implementados.
[ ] Accounting Ledger integration tests implementados.
[ ] Bank Reconciliation boundary tests implementados.
[ ] Report tests implementados.
[ ] Export tests implementados.
[ ] API tests implementados.
[ ] Authorization tests implementados.
[ ] Multitenancy tests implementados.
[ ] Financial integrity tests implementados.
[ ] Security tests implementados.
[ ] Audit tests implementados.
[ ] Observability tests implementados.
[ ] OpenAPI contract tests implementados.
[ ] Performance tests mínimos implementados.
[ ] Concurrency tests implementados.
[ ] Regression tests implementados.
[ ] Smoke tests implementados.
[ ] CI/CD gates configurados.
```

---

## 29. No aceptación

La implementación no debe aceptarse si las pruebas permiten:

```text id="v4yhqx"
- supplier category cross-tenant;
- supplier cross-tenant;
- supplier contact cross-tenant;
- supplier bank account cross-tenant;
- supplier document cross-tenant;
- supplier payable cross-tenant;
- supplier payable approval cross-tenant;
- supplier payment order cross-tenant;
- supplier payment order item cross-tenant;
- supplier payment evidence cross-tenant;
- supplier accounting link cross-tenant;
- supplier bank reconciliation link cross-tenant;
- supplier payment report cross-tenant;
- tenantId desde body;
- actor fields desde body;
- status directo sin endpoint de transición;
- findUnique por id simple en entidades tenant-scoped;
- full bank account number en response;
- accountNumberHash en response estándar;
- identificationNumberHash en response estándar;
- storageKey en response;
- signedUrl persistente en response;
- float/double para dinero;
- totalAmount inconsistente;
- outstandingAmount negativo;
- paymentOrder sin items;
- paymentOrder con payable no aprobado;
- paymentOrder item mayor al outstandingAmount;
- paid sin aprobación;
- paid sin referencia o evidencia;
- pago superior al totalAmount;
- pago superior al outstandingAmount;
- pago a supplier blocked;
- payable para supplier inactive;
- payable para supplier archived;
- duplicate payable aprobado sin control;
- evidence rejected como soporte válido;
- transferencia bancaria automática;
- Open Banking payment initiation;
- Supplier Payments edita JournalEntry posted;
- Supplier Payments crea ReconciliationMatch final;
- Supplier Payments marca BankTransaction matched;
- Supplier Payments cierra ReconciliationSession;
- endpoint público supplier payments;
- endpoint /me supplier payments;
- acceso desde WordPress;
- datos reales enviados a IA externa;
- audit sin sanitización;
- logs con cuenta bancaria completa;
- logs con storageKey;
- logs con stack trace productivo.
```

---

## 30. Resultado esperado

Al ejecutar este plan, el módulo `021-supplier-payments` debe quedar validado como una base segura para proveedores, cuentas por pagar y egresos administrativos.

Resultado esperado:

```text id="a1ttqm"
SupplierCategory tested
Supplier tested
SupplierContact tested
SupplierBankAccount tested
SupplierDocument tested
SupplierPayable tested
SupplierPayableApproval tested
SupplierPaymentOrder tested
SupplierPaymentOrderItem tested
SupplierPaymentEvidence tested
SupplierAccountingLink tested
SupplierBankReconciliationLink tested
tenant isolation tested
authorization tested
supplier status rules tested
bank account protection tested
Secure Document Storage integration tested
duplicate detection tested
Decimal money tested
totalAmount calculation tested
outstandingAmount calculation tested
approval workflow tested
payment order approval tested
manual mark-paid tested
payment evidence tested
partial payments tested
reversal/correction tested
Accounting Ledger integration tested
no JournalEntry posted mutation tested
Bank Reconciliation link tested
no final reconciliation tested
payables aging report tested
payments by supplier report tested
expenses by category report tested
cash outflow report tested
exports via Secure Document Storage tested
audit tested
observability tested
OpenAPI tested
performance smoke tested
concurrency tested
regression tested
smoke flow tested
CI gates ready
no bank transfer initiation tested
no Open Banking payment initiation tested
no electronic invoicing tested
no public endpoints tested
no /me endpoints tested
no WordPress access tested
no external AI with real supplier/payment data tested
```

---

## 31. Expediente actualizado

```text id="ebmqx4"
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
│   │       └── test-plan.md
```
