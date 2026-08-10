# Test Plan — 022 Maintenance Work Orders

## 1. Información del documento

| Campo           | Valor                                                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Proyecto        | RESIDENT Core                                                                                                                  |
| Spec ID         | 022                                                                                                                            |
| Módulo          | Maintenance Work Orders                                                                                                        |
| Documento       | Test Plan                                                                                                                      |
| Ruta            | `docs/specs/022-maintenance-work-orders/test-plan.md`                                                                          |
| Versión         | 0.1                                                                                                                            |
| Estado          | needs-review                                                                                                                   |
| Fecha           | 2026-07-23                                                                                                                     |
| Documento base  | `docs/specs/022-maintenance-work-orders/spec.md`                                                                               |
| Plan técnico    | `docs/specs/022-maintenance-work-orders/plan.md`                                                                               |
| Modelo de datos | `docs/specs/022-maintenance-work-orders/data-model.md`                                                                         |
| Contrato API    | `docs/specs/022-maintenance-work-orders/api-contract.md`                                                                       |
| Stack objetivo  | NestJS / TypeScript / PostgreSQL / Prisma / OpenAPI / Keycloak                                                                 |
| Naturaleza      | Tenant-scoped / Operational / Request-driven / Work-order-driven / Evidence-backed / Supplier-aware / Cost-aware / Audit-heavy |

---

## 2. Propósito

Este documento define el plan de pruebas para el módulo `022-maintenance-work-orders`.

El objetivo es validar que las solicitudes de mantenimiento, órdenes de trabajo, asignaciones, tareas, visitas, evidencias, costos, aprobaciones, vínculos con proveedores, vínculos con cuentas por pagar, comentarios, reportes y exportaciones funcionen correctamente, respeten aislamiento multitenant, seguridad, autorización, reglas operativas, integridad documental, trazabilidad y límites con módulos financieros.

Regla central de pruebas:

```text id="tnmb9t"
Maintenance Work Orders solo puede aceptarse si todas sus pruebas demuestran tenant isolation, acceso /me limitado a recursos propios, protección de evidencias mediante Secure Document Storage, separación entre mantenimiento y pagos, separación entre mantenimiento y contabilidad, ausencia de endpoints públicos, ausencia de acceso desde WordPress, auditoría completa, logs seguros, costos con Decimal y no exposición de datos internos a residentes.
```

---

## 3. Alcance del plan de pruebas

Incluye pruebas para:

```text id="mfxnd0"
- value objects;
- entities;
- state machines;
- domain policies;
- DTO validation;
- repositories;
- services;
- use cases;
- API tenant administrativa;
- API /me;
- multitenancy;
- autorización;
- own-resource access;
- Secure Document Storage integration;
- Supplier Payments integration;
- Communications/Notifications integration;
- audit;
- observability;
- reports;
- exports;
- OpenAPI;
- performance básica;
- concurrencia;
- regresión;
- smoke tests.
```

---

## 4. Fuera de alcance de pruebas MVP

No se prueban en este módulo:

```text id="jml05v"
- pagos reales;
- transferencias bancarias;
- Open Banking payment initiation;
- JournalEntry posting;
- conciliación bancaria final;
- firma electrónica;
- portal de proveedores;
- app móvil offline;
- inventario avanzado;
- IoT;
- IA con datos reales;
- facturación electrónica;
- integración SRI.
```

Se deben probar como prohibiciones:

```text id="yvnmdn"
- que Maintenance no cree Payment;
- que Maintenance no cree SupplierPaymentOrder;
- que Maintenance no marque pagos como paid;
- que Maintenance no cree JournalEntry;
- que Maintenance no confirme Bank Reconciliation;
- que Maintenance no inicie transferencias;
- que Maintenance no envíe datos reales a IA externa.
```

---

## 5. Estrategia general

### 5.1. Pirámide de pruebas

```text id="h69pmk"
Unit tests
  -> value objects
  -> entities
  -> policies
  -> state machines

Integration tests
  -> repositories
  -> services
  -> database constraints
  -> module boundaries
  -> SDS / Supplier Payments / Notifications ports

API tests
  -> REST tenant endpoints
  -> REST /me endpoints
  -> permissions
  -> DTO validation
  -> error format

Security tests
  -> tenant isolation
  -> own-resource access
  -> forbidden fields
  -> no public endpoints
  -> no storageKey
  -> no internal leakage

E2E / smoke tests
  -> resident request lifecycle
  -> admin work order lifecycle
  -> supplier/cost/payable link lifecycle
```

---

### 5.2. Herramientas sugeridas

```text id="e9gp7q"
- Jest para unit e integration tests.
- Supertest para API tests.
- Testcontainers o PostgreSQL Docker para tests de integración.
- Prisma test database por suite.
- OpenAPI validator para contract tests.
- ESLint/TypeScript strict para static checks.
- Factories/fixtures sintéticas.
```

---

### 5.3. Reglas de datos de prueba

Permitido:

```text id="e1mkix"
- tenants ficticios;
- residentes ficticios;
- unidades ficticias;
- proveedores ficticios;
- documentos ficticios;
- evidencias sintéticas;
- costos ficticios;
- imágenes dummy sin datos reales.
```

Prohibido:

```text id="gotvsh"
- fotos reales de residentes;
- documentos reales;
- facturas reales;
- comprobantes reales;
- nombres reales de residentes;
- datos bancarios reales;
- datos de proveedores reales;
- reportes reales;
- tokens reales;
- secrets reales.
```

---

## 6. Ambientes de prueba

### 6.1. Unit test environment

```text id="oxx1hh"
NODE_ENV=test
DATABASE_URL no requerido para pruebas puras
MAINTENANCE_WORK_ORDERS_ENABLED=true
MAINTENANCE_EXTERNAL_AI_ENABLED=false
```

---

### 6.2. Integration test environment

```text id="lix69q"
NODE_ENV=test
DATABASE_URL=postgresql://resident_test:resident_test@localhost:5432/resident_test
MAINTENANCE_WORK_ORDERS_ENABLED=true
MAINTENANCE_ME_REQUESTS_ENABLED=true
MAINTENANCE_SUPPLIER_PAYMENTS_INTEGRATION_ENABLED=true
MAINTENANCE_NOTIFICATIONS_ENABLED=true
MAINTENANCE_PUBLIC_ENDPOINTS_ENABLED=false
MAINTENANCE_WORDPRESS_ACCESS_ENABLED=false
MAINTENANCE_DIRECT_PAYMENTS_ENABLED=false
MAINTENANCE_BANK_TRANSFER_INITIATION_ENABLED=false
MAINTENANCE_OPEN_BANKING_PAYMENT_INITIATION_ENABLED=false
MAINTENANCE_DIRECT_ACCOUNTING_ENABLED=false
MAINTENANCE_EXTERNAL_AI_ENABLED=false
```

---

### 6.3. Test database strategy

```text id="uu4x7w"
- Crear base limpia por ejecución.
- Ejecutar migraciones.
- Cargar seeds mínimos.
- Usar transactions o truncation entre tests.
- No depender de orden de ejecución.
- No compartir IDs hardcoded entre suites.
```

---

## 7. Fixtures base

### 7.1. Tenants

```text id="dysbf9"
tenantA = "Conjunto Altos del Norte"
tenantB = "Conjunto Jardines del Valle"
```

Objetivo:

```text id="xrmg00"
Probar aislamiento entre tenantA y tenantB.
```

---

### 7.2. Usuarios

```text id="xnomx0"
platformAdmin
tenantAdminA
tenantAdminB
maintenanceManagerA
maintenanceManagerB
financialManagerA
accountantA
boardMemberA
internalTechnicianA
residentUserA1
residentUserA2
ownerUserA1
residentUserB1
```

---

### 7.3. Unidades y personas

```text id="b2uxzx"
personA1 -> residentUserA1 -> unitA101
personA2 -> residentUserA2 -> unitA102
personB1 -> residentUserB1 -> unitB201
```

---

### 7.4. Categorías

```text id="e2xs76"
PLUMBING
ELECTRICAL
GARDENING
COMMON_AREAS
ACCESS_CONTROL
OTHER
```

---

### 7.5. Activos

```text id="i2rf01"
GATE_VEHICLE
GUARDHOUSE
COURT_MAIN
WATER_PUMP_MAIN
LIGHTING_COMMON
UNIT_A101_BATHROOM
```

---

### 7.6. Proveedores ficticios

```text id="weeqrg"
supplierActiveA
supplierBlockedA
supplierInactiveA
supplierActiveB
```

---

### 7.7. Secure documents ficticios

```text id="cc4dqd"
secureDocumentRequestPhotoA
secureDocumentBeforePhotoA
secureDocumentAfterPhotoA
secureDocumentQuoteA
secureDocumentReportExportA
secureDocumentTenantB
```

---

## 8. Unit tests — Value Objects

### 8.1. MaintenanceCategoryCode

```text id="ac3i7y"
[ ] Acepta código válido.
[ ] Rechaza código vacío.
[ ] Rechaza código con espacios extremos sin normalizar.
[ ] Rechaza caracteres inseguros.
[ ] Normaliza a uppercase si la política lo define.
```

---

### 8.2. MaintenanceAssetCode

```text id="atolqt"
[ ] Acepta código válido.
[ ] Rechaza código vacío.
[ ] Rechaza caracteres inseguros.
[ ] Rechaza longitud excesiva.
```

---

### 8.3. MaintenanceRequestNumber

```text id="rfv8zr"
[ ] Genera formato MR-{YYYYMM}-{sequence}.
[ ] Acepta número válido.
[ ] Rechaza número inválido.
[ ] Rechaza número vacío.
```

---

### 8.4. MaintenanceWorkOrderNumber

```text id="wn9qig"
[ ] Genera formato MWO-{YYYYMM}-{sequence}.
[ ] Acepta número válido.
[ ] Rechaza número inválido.
[ ] Rechaza número vacío.
```

---

### 8.5. MaintenanceTitle

```text id="uw64rb"
[ ] Acepta título válido.
[ ] Rechaza título vacío.
[ ] Rechaza título excesivamente largo.
[ ] Sanitiza HTML/script si corresponde.
```

---

### 8.6. MaintenanceDescription

```text id="q75zjw"
[ ] Acepta descripción válida.
[ ] Rechaza descripción vacía en solicitudes y órdenes.
[ ] Rechaza longitud excesiva.
[ ] Sanitiza HTML/script si corresponde.
```

---

### 8.7. MaintenanceCostAmount

```text id="f368px"
[ ] Acepta string decimal "120.00".
[ ] Acepta "0.00" si la política lo permite.
[ ] Rechaza monto negativo.
[ ] Rechaza number/float como fuente de verdad.
[ ] Rechaza más de dos decimales si aplica.
[ ] Rechaza moneda distinta de USD en MVP.
```

---

### 8.8. MaintenanceReason

```text id="l2u0bi"
[ ] Acepta razón válida.
[ ] Rechaza razón vacía en reject/cancel/reopen.
[ ] Rechaza HTML/script.
[ ] Rechaza longitud excesiva.
```

---

### 8.9. MaintenanceDocumentReference

```text id="ppzeq1"
[ ] Acepta secureDocumentId válido.
[ ] Rechaza storageKey.
[ ] Rechaza signedUrl.
[ ] Rechaza base64.
[ ] Rechaza raw file payload.
```

---

## 9. Unit tests — Entities

### 9.1. MaintenanceCategory

```text id="h6x5vu"
[ ] Crea categoría active.
[ ] Actualiza nombre y descripción.
[ ] Cambia allowsResidentRequests.
[ ] Archiva con reason.
[ ] Rechaza uso si status archived.
```

---

### 9.2. MaintenanceAsset

```text id="eckulq"
[ ] Crea activo común.
[ ] Crea activo asociado a propertyUnit.
[ ] Crea activo asociado a commonArea.
[ ] Permite parentAssetId.
[ ] Rechaza parentAssetId del mismo asset.
[ ] Cambia status underMaintenance.
[ ] Archiva con reason.
```

---

### 9.3. MaintenanceRequest

```text id="mh1oe2"
[ ] Crea solicitud submitted.
[ ] Crea solicitud draft si admin lo permite.
[ ] Cambia submitted -> underReview.
[ ] Cambia underReview -> accepted.
[ ] Cambia underReview -> rejected con reason.
[ ] Cambia submitted -> cancelled con reason.
[ ] Marca duplicateOfRequestId.
[ ] Cambia accepted -> convertedToWorkOrder.
[ ] Rechaza convertedToWorkOrder sin workOrderId.
[ ] Rechaza rejected sin reason.
[ ] Rechaza cancelled sin reason.
```

---

### 9.4. MaintenanceWorkOrder

```text id="fxios4"
[ ] Crea orden open.
[ ] Crea orden desde request accepted.
[ ] Crea orden directa administrativa.
[ ] Cambia open -> assigned.
[ ] Cambia assigned -> scheduled.
[ ] Cambia scheduled -> inProgress.
[ ] Cambia inProgress -> onHold.
[ ] Cambia onHold -> inProgress.
[ ] Cambia inProgress -> completed.
[ ] Cambia completed -> closed con evidencia.
[ ] Cambia completed -> closed con closureReason controlada.
[ ] Cambia closed -> reopened con reason.
[ ] Rechaza close sin completionSummary.
[ ] Rechaza close sin evidencia ni closureReason.
[ ] Rechaza reopen sin reason.
[ ] Rechaza update destructivo si closed.
```

---

### 9.5. MaintenanceWorkOrderTask

```text id="j2jkqo"
[ ] Crea tarea pending.
[ ] Asigna taskNumber secuencial.
[ ] Cambia pending -> inProgress.
[ ] Cambia inProgress -> completed.
[ ] Rechaza completed sin completedBy.
[ ] Rechaza taskNumber duplicado por workOrder.
```

---

### 9.6. MaintenanceVisit

```text id="p6q87b"
[ ] Crea visita scheduled.
[ ] Cambia scheduled -> inProgress.
[ ] Cambia inProgress -> completed.
[ ] Registra accessResult.
[ ] Rechaza completed sin endedAt.
[ ] Cancela visita con reason.
```

---

### 9.7. MaintenanceEvidence

```text id="cn830w"
[ ] Crea evidencia active.
[ ] Verifica evidencia.
[ ] Rechaza evidencia con reason.
[ ] Archiva evidencia.
[ ] Rechaza rejected como soporte de cierre.
[ ] Rechaza evidencia sin secureDocumentId.
```

---

### 9.8. MaintenanceCostEstimate

```text id="yxn1pw"
[ ] Crea costo draft.
[ ] Envía costo draft -> submitted.
[ ] Aprueba costo submitted -> approved.
[ ] Rechaza costo submitted -> rejected con reason.
[ ] Cancela costo draft/submitted con reason.
[ ] Convierte approved -> convertedToPayable.
[ ] Rechaza monto negativo.
[ ] Rechaza currency distinta de USD.
[ ] Rechaza convertedToPayable sin link controlado.
```

---

### 9.9. MaintenanceComment

```text id="fe9pes"
[ ] Crea comentario internal.
[ ] Crea comentario visibleToRequester.
[ ] Crea comentario visibleToBoard.
[ ] Crea comentario system solo server-side.
[ ] Rechaza comentario sin requestId ni workOrderId.
[ ] Sanitiza HTML/script.
```

---

## 10. Unit tests — State machines

### 10.1. MaintenanceRequestStatus

```text id="yt0mai"
[ ] draft -> submitted permitido.
[ ] submitted -> underReview permitido.
[ ] submitted -> cancelled permitido con reason.
[ ] underReview -> accepted permitido.
[ ] underReview -> rejected permitido con reason.
[ ] accepted -> convertedToWorkOrder permitido con workOrderId.
[ ] accepted -> closed permitido con reason si no requiere orden.
[ ] rejected -> archived permitido.
[ ] cancelled -> archived permitido.
[ ] closed -> archived permitido.
[ ] submitted -> convertedToWorkOrder rechazado.
[ ] rejected -> accepted rechazado.
[ ] convertedToWorkOrder -> submitted rechazado.
```

---

### 10.2. MaintenanceWorkOrderStatus

```text id="maqv8b"
[ ] draft -> open permitido.
[ ] open -> pendingAssignment permitido.
[ ] open -> assigned permitido.
[ ] pendingAssignment -> assigned permitido.
[ ] assigned -> scheduled permitido.
[ ] assigned -> inProgress permitido.
[ ] scheduled -> inProgress permitido.
[ ] inProgress -> onHold permitido.
[ ] onHold -> inProgress permitido.
[ ] inProgress -> pendingCostApproval permitido.
[ ] pendingCostApproval -> inProgress permitido.
[ ] inProgress -> completed permitido.
[ ] completed -> pendingResidentConfirmation permitido.
[ ] completed -> closed permitido.
[ ] pendingResidentConfirmation -> closed permitido.
[ ] closed -> reopened permitido con reason.
[ ] reopened -> inProgress permitido.
[ ] open -> cancelled permitido con reason.
[ ] assigned -> cancelled permitido con reason.
[ ] scheduled -> cancelled permitido con reason.
[ ] inProgress -> cancelled permitido con reason.
[ ] closed -> archived permitido.
[ ] cancelled -> archived permitido.
[ ] closed -> inProgress rechazado sin reopened.
[ ] completed -> open rechazado.
[ ] archived -> open rechazado.
```

---

### 10.3. MaintenanceCostEstimateStatus

```text id="zezh1m"
[ ] draft -> submitted permitido.
[ ] submitted -> approved permitido.
[ ] submitted -> rejected permitido con reason.
[ ] draft -> cancelled permitido con reason.
[ ] submitted -> cancelled permitido con reason.
[ ] approved -> convertedToPayable permitido.
[ ] approved -> archived permitido.
[ ] rejected -> archived permitido.
[ ] cancelled -> archived permitido.
[ ] convertedToPayable -> archived permitido.
[ ] convertedToPayable -> draft rechazado.
[ ] approved -> draft rechazado.
```

---

## 11. Unit tests — Policies

### 11.1. MaintenanceTenantPolicy

```text id="iw3t2u"
[ ] Permite recurso del currentTenant.
[ ] Rechaza recurso de tenant distinto.
[ ] Devuelve error equivalente a 404 para cross-tenant.
```

---

### 11.2. MaintenanceOwnResourcePolicy

```text id="oc52x7"
[ ] Resident accede a solicitud propia por reportedByUserId.
[ ] Resident accede a solicitud por relación Person/Unit válida.
[ ] Resident no accede a solicitud de otro residente.
[ ] Resident no accede a solicitud tenant B.
```

---

### 11.3. MaintenanceRequestSubmissionPolicy

```text id="m4tfkv"
[ ] Permite category allowsResidentRequests=true para /me.
[ ] Rechaza category allowsResidentRequests=false para /me.
[ ] Permite admin request en categoría administrativa.
[ ] Rechaza propertyUnitId no propio en /me.
[ ] Rechaza commonAreaId cross-tenant.
```

---

### 11.4. MaintenanceRequestReviewPolicy

```text id="pm8e6f"
[ ] Permite review si status submitted.
[ ] Rechaza review si status convertedToWorkOrder.
[ ] Requiere reason para reject.
[ ] Permite markDuplicate con request mismo tenant.
[ ] Rechaza duplicateOfRequestId cross-tenant.
```

---

### 11.5. MaintenanceWorkOrderClosurePolicy

```text id="nkohj7"
[ ] Permite close con evidencia verified.
[ ] Permite close con evidencia active si policy lo acepta.
[ ] Rechaza close con evidencia rejected.
[ ] Permite close sin evidencia solo con closureReason controlada.
[ ] Rechaza close sin completionSummary.
```

---

### 11.6. MaintenanceWorkOrderReopenPolicy

```text id="am77qk"
[ ] Permite reopen si status closed.
[ ] Rechaza reopen si status completed.
[ ] Rechaza reopen sin reason.
[ ] Rechaza reopen por usuario sin permiso.
```

---

### 11.7. MaintenanceCostPolicy

```text id="ojqddf"
[ ] Rechaza costos negativos.
[ ] Rechaza currency distinta de USD.
[ ] Rechaza number/float.
[ ] Permite string decimal.
[ ] Rechaza modificación de costo convertedToPayable.
```

---

### 11.8. MaintenanceSupplierLinkPolicy

```text id="kflmxq"
[ ] Permite supplier active.
[ ] Rechaza supplier blocked.
[ ] Rechaza supplier inactive.
[ ] Rechaza supplier archived.
[ ] Rechaza supplier tenant B.
```

---

### 11.9. MaintenancePayableConversionPolicy

```text id="vyvnfv"
[ ] Permite convert-to-payable con costo approved.
[ ] Rechaza costo draft.
[ ] Rechaza costo submitted.
[ ] Rechaza costo rejected.
[ ] Rechaza si no existe supplier active.
[ ] Rechaza si existe MaintenancePayableLink activo.
[ ] Rechaza si Supplier Payments está deshabilitado.
[ ] Garantiza que no se cree SupplierPaymentOrder.
[ ] Garantiza que no se marque paid.
```

---

### 11.10. NoDirectPaymentPolicy

```text id="df6mtk"
[ ] Bloquea creación de Payment desde Maintenance.
[ ] Bloquea creación de SupplierPaymentOrder desde Maintenance.
[ ] Bloquea mark-paid desde Maintenance.
[ ] Bloquea bank transfer initiation.
[ ] Bloquea Open Banking payment initiation.
```

---

### 11.11. NoDirectAccountingPolicy

```text id="l8psos"
[ ] Bloquea creación de JournalEntry desde Maintenance.
[ ] Bloquea edición de JournalEntry.
[ ] Bloquea posting contable directo.
```

---

### 11.12. MaintenanceCommentVisibilityPolicy

```text id="djh4na"
[ ] internal visible para admin con permiso.
[ ] internal invisible en /me.
[ ] visibleToRequester visible en /me para owner.
[ ] visibleToBoard visible solo con permiso.
[ ] system solo server-side.
```

---

## 12. Repository tests

### 12.1. MaintenanceCategoryRepository

```text id="iay04y"
[ ] create con tenantId.
[ ] findById usa tenantId.
[ ] list filtra tenantId.
[ ] update no afecta tenant B.
[ ] archive usa archivedAt.
[ ] unique categoryCode por tenant.
```

---

### 12.2. MaintenanceAssetRepository

```text id="eljttc"
[ ] create asset tenant A.
[ ] create asset tenant B con mismo assetCode permitido.
[ ] duplicate assetCode en tenant A rechazado.
[ ] findById cross-tenant retorna null.
[ ] list por status.
[ ] list por propertyUnitId.
[ ] list por commonAreaId.
```

---

### 12.3. MaintenanceRequestRepository

```text id="f9dt27"
[ ] create request con requestNumber único.
[ ] findById filtra tenantId.
[ ] listOwn filtra reportedByUserId.
[ ] listOwn no devuelve tenant B.
[ ] update status con transacción.
[ ] mark duplicate con request mismo tenant.
[ ] no permite duplicateOfRequestId tenant B.
```

---

### 12.4. MaintenanceWorkOrderRepository

```text id="tmlkqu"
[ ] create work order con workOrderNumber único.
[ ] findById filtra tenantId.
[ ] list por status.
[ ] list por supplierId.
[ ] list por assignedInternalUserId.
[ ] update closed fields.
[ ] no actualiza closed destructivamente.
```

---

### 12.5. MaintenanceTaskRepository

```text id="ripwyi"
[ ] create task con taskNumber secuencial.
[ ] unique taskNumber por workOrder.
[ ] list por workOrder.
[ ] complete task setea completedAt/completedBy.
```

---

### 12.6. MaintenanceVisitRepository

```text id="klxuqi"
[ ] create visit.
[ ] list por workOrder.
[ ] complete visit.
[ ] cancel visit.
[ ] filtra tenantId.
```

---

### 12.7. MaintenanceEvidenceRepository

```text id="rtrtw5"
[ ] create evidence.
[ ] findById filtra tenantId.
[ ] list por workOrder.
[ ] list por visibility.
[ ] verify evidence.
[ ] reject evidence con reason.
[ ] no devuelve archived por defecto.
```

---

### 12.8. MaintenanceCostRepository

```text id="cxlf7p"
[ ] create cost.
[ ] reject negative amount.
[ ] submit cost.
[ ] approve cost.
[ ] reject cost.
[ ] convert to payable.
[ ] unique active payable link por costEstimate.
```

---

### 12.9. MaintenanceCommentRepository

```text id="a7k78l"
[ ] create internal comment.
[ ] create visibleToRequester comment.
[ ] list admin incluye internal.
[ ] listOwn excluye internal.
[ ] listOwn incluye visibleToRequester si request propia.
```

---

## 13. Service tests

### 13.1. MaintenanceCategoryService

```text id="wbsxkl"
[ ] Crea categoría.
[ ] Rechaza código duplicado.
[ ] Actualiza categoría.
[ ] Archiva categoría.
[ ] Rechaza archivo sin reason.
[ ] Emite audit.
```

---

### 13.2. MaintenanceAssetService

```text id="apfahe"
[ ] Crea activo común.
[ ] Crea activo asociado a unidad tenant-scoped.
[ ] Rechaza unidad cross-tenant.
[ ] Crea activo asociado a área común tenant-scoped.
[ ] Rechaza área común cross-tenant.
[ ] Archiva activo con reason.
```

---

### 13.3. MaintenanceRequestService

```text id="j89fxy"
[ ] Crea solicitud administrativa.
[ ] Crea solicitud propia /me.
[ ] Genera requestNumber.
[ ] Valida categoría.
[ ] Valida asset.
[ ] Valida propertyUnit.
[ ] Rechaza propertyUnit ajena en /me.
[ ] Rechaza category no disponible para residentes.
[ ] Crea audit y notification.
```

---

### 13.4. MaintenanceRequestReviewService

```text id="yo3bxf"
[ ] Review submitted -> underReview.
[ ] Accept underReview -> accepted.
[ ] Reject underReview -> rejected.
[ ] Rechaza reject sin reason.
[ ] Cancel con reason.
[ ] Mark duplicate con request mismo tenant.
[ ] Convert accepted -> workOrder.
[ ] Crea status history.
```

---

### 13.5. MaintenanceWorkOrderService

```text id="jvu8x2"
[ ] Crea orden directa.
[ ] Crea orden desde solicitud accepted.
[ ] Rechaza solicitud no accepted si se convierte.
[ ] Genera workOrderNumber.
[ ] Asigna usuario interno.
[ ] Asigna proveedor active.
[ ] Rechaza proveedor blocked.
[ ] Schedule.
[ ] Start.
[ ] Pause.
[ ] Complete.
[ ] Close con evidencia.
[ ] Close con closureReason.
[ ] Reopen con reason.
[ ] Cancel con reason.
```

---

### 13.6. MaintenanceTaskService

```text id="i043cu"
[ ] Crea tarea.
[ ] Secuencia taskNumber.
[ ] Actualiza tarea.
[ ] Completa tarea.
[ ] Rechaza task cross-tenant.
```

---

### 13.7. MaintenanceVisitService

```text id="jwav18"
[ ] Crea visita.
[ ] Valida visitedByUserId.
[ ] Valida supplierId.
[ ] Completa visita con accessResult.
[ ] Cancela visita con reason.
```

---

### 13.8. MaintenanceEvidenceService

```text id="sionr8"
[ ] Crea evidencia con secureDocumentId.
[ ] Valida secureDocument tenant-scoped.
[ ] Rechaza storageKey.
[ ] Verifica evidencia.
[ ] Rechaza evidencia.
[ ] Archiva evidencia.
[ ] Calcula downloadAvailable.
```

---

### 13.9. MaintenanceCostService

```text id="guvkat"
[ ] Crea costo draft.
[ ] Rechaza costo negativo.
[ ] Rechaza number/float.
[ ] Submit.
[ ] Approve.
[ ] Reject.
[ ] Cancel.
[ ] Convert-to-payable.
[ ] Rechaza convert-to-payable si ya existe link.
```

---

### 13.10. MaintenanceCommentService

```text id="ys7brn"
[ ] Crea comentario internal.
[ ] Crea comentario visibleToRequester.
[ ] Crea comentario /me visibleToRequester.
[ ] Rechaza system desde cliente.
[ ] Sanitiza HTML/script.
[ ] Notifica si visibleToRequester.
```

---

## 14. Integration tests — Secure Document Storage

### 14.1. Validación documental

```text id="z179d2"
[ ] Evidencia acepta secureDocumentId tenant A.
[ ] Evidencia rechaza secureDocumentId tenant B.
[ ] Request attachment acepta secureDocumentId tenant A.
[ ] Export crea secureDocument con sourceModule=maintenanceWorkOrders.
```

---

### 14.2. No exposición de storageKey

```text id="zv29s8"
[ ] List evidence no devuelve storageKey.
[ ] Get evidence no devuelve storageKey.
[ ] Own evidence no devuelve storageKey.
[ ] Report export no devuelve storageKey.
[ ] Audit no contiene storageKey.
[ ] Logs no contienen storageKey.
```

---

### 14.3. Descargas

```text id="b2dgqy"
[ ] Admin puede consultar downloadAvailable.
[ ] /me solo puede descargar evidencia requesterVisible.
[ ] /me no puede descargar evidencia internal.
[ ] Descarga delegada audita maintenanceEvidence.downloaded.
```

---

## 15. Integration tests — Supplier Payments

### 15.1. Supplier validation

```text id="z91fie"
[ ] Work order acepta supplier active tenant A.
[ ] Work order rechaza supplier blocked tenant A.
[ ] Work order rechaza supplier inactive tenant A.
[ ] Work order rechaza supplier tenant B.
[ ] Supplier link acepta supplier active.
[ ] Supplier link rechaza supplier blocked.
```

---

### 15.2. Convert cost to payable

```text id="apbtq2"
[ ] Costo approved se convierte a SupplierPayable draft/controlado.
[ ] Se crea MaintenancePayableLink active.
[ ] Se rechaza conversión si costo draft.
[ ] Se rechaza conversión si costo submitted.
[ ] Se rechaza conversión si costo rejected.
[ ] Se rechaza conversión si no existe supplier active.
[ ] Se rechaza conversión duplicada.
[ ] Si Supplier Payments falla, no queda link active inconsistente.
```

---

### 15.3. Prohibiciones financieras

```text id="z1yo20"
[ ] Maintenance no crea SupplierPaymentOrder.
[ ] Maintenance no marca SupplierPaymentOrder como paid.
[ ] Maintenance no crea Payment.
[ ] Maintenance no crea PaymentAllocation.
[ ] Maintenance no inicia transferencia bancaria.
[ ] Maintenance no inicia Open Banking payment.
```

---

## 16. Integration tests — Notifications

### 16.1. Eventos notificables

```text id="nhpixa"
[ ] maintenanceRequest.submitted emite notificación.
[ ] maintenanceRequest.accepted emite notificación.
[ ] maintenanceRequest.rejected emite notificación.
[ ] maintenanceRequest.convertedToWorkOrder emite notificación.
[ ] maintenanceWorkOrder.assigned emite notificación.
[ ] maintenanceWorkOrder.closed emite notificación.
[ ] maintenanceWorkOrder.reopened emite notificación.
[ ] visibleToRequester comment emite notificación.
```

---

### 16.2. Sanitización de notificaciones

```text id="s81e8h"
[ ] Notificación no incluye storageKey.
[ ] Notificación no incluye costos internos.
[ ] Notificación no incluye comentarios internal.
[ ] Notificación no incluye datos internos de proveedor.
```

---

### 16.3. Degradación

```text id="sxq5yq"
[ ] Si Notifications falla, create request no revierte.
[ ] Si Notifications falla, close work order no revierte.
[ ] Falla queda loggeada de forma segura.
```

---

## 17. API tests — Categorías

```text id="ywh60j"
[ ] GET /tenant/maintenance-categories devuelve lista paginada.
[ ] POST /tenant/maintenance-categories crea categoría.
[ ] GET /tenant/maintenance-categories/{id} devuelve detalle.
[ ] PATCH /tenant/maintenance-categories/{id} actualiza campos permitidos.
[ ] POST /tenant/maintenance-categories/{id}/archive archiva.
[ ] POST rechaza tenantId en body.
[ ] PATCH rechaza status directo.
[ ] Tenant B no accede a categoría tenant A.
```

---

## 18. API tests — Activos

```text id="yxbbge"
[ ] GET /tenant/maintenance-assets devuelve lista.
[ ] POST /tenant/maintenance-assets crea activo.
[ ] GET /tenant/maintenance-assets/{id} devuelve detalle.
[ ] PATCH /tenant/maintenance-assets/{id} actualiza.
[ ] POST /tenant/maintenance-assets/{id}/archive archiva.
[ ] Rechaza propertyUnitId cross-tenant.
[ ] Rechaza commonAreaId cross-tenant.
[ ] Rechaza parentAssetId cross-tenant.
```

---

## 19. API tests — Requests tenant admin

```text id="lm3lrn"
[ ] GET /tenant/maintenance-requests lista solicitudes.
[ ] POST /tenant/maintenance-requests crea solicitud administrativa.
[ ] GET /tenant/maintenance-requests/{id} devuelve detalle.
[ ] PATCH /tenant/maintenance-requests/{id} actualiza campos permitidos.
[ ] POST /review cambia submitted -> underReview.
[ ] POST /accept cambia underReview -> accepted.
[ ] POST /reject requiere reason.
[ ] POST /cancel requiere reason.
[ ] POST /mark-duplicate valida duplicateOfRequestId mismo tenant.
[ ] POST /convert-to-work-order crea WorkOrder.
[ ] Rechaza tenantId en body.
[ ] Rechaza status directo.
[ ] Rechaza request cross-tenant.
```

---

## 20. API tests — Requests `/me`

```text id="c2zhio"
[ ] GET /me/maintenance-requests lista solo propias.
[ ] POST /me/maintenance-requests crea solicitud propia.
[ ] GET /me/maintenance-requests/{id} devuelve propia.
[ ] GET /me/maintenance-requests/{id} ajena devuelve 404.
[ ] POST /me/maintenance-requests/{id}/comments crea comentario visibleToRequester.
[ ] POST /me/maintenance-requests/{id}/cancel cancela si estado permitido.
[ ] POST /me/maintenance-requests/{id}/evidence adjunta evidencia requesterVisible.
[ ] Rechaza solicitud sobre propertyUnit ajena.
[ ] Rechaza solicitud sobre tenant B.
[ ] Rechaza categoría no habilitada para residentes.
[ ] No expone costos internos.
[ ] No expone comentarios internal.
[ ] No expone supplierId por defecto.
[ ] No expone audit metadata.
```

---

## 21. API tests — Work Orders

```text id="g12sxs"
[ ] GET /tenant/maintenance-work-orders lista órdenes.
[ ] POST /tenant/maintenance-work-orders crea orden directa.
[ ] GET /tenant/maintenance-work-orders/{id} devuelve detalle.
[ ] PATCH /tenant/maintenance-work-orders/{id} actualiza campos permitidos.
[ ] POST /assign asigna usuario interno.
[ ] POST /assign asigna supplier active.
[ ] POST /assign rechaza supplier blocked.
[ ] POST /schedule programa orden.
[ ] POST /start inicia orden.
[ ] POST /pause pausa orden con reason.
[ ] POST /complete completa orden.
[ ] POST /close cierra con evidencia.
[ ] POST /close cierra con closureReason controlada.
[ ] POST /close rechaza sin evidencia ni reason.
[ ] POST /reopen reabre con reason.
[ ] POST /reopen rechaza sin reason.
[ ] POST /cancel cancela con reason.
[ ] POST /archive archiva.
[ ] Rechaza workOrder cross-tenant.
[ ] Rechaza tenantId en body.
[ ] Rechaza paymentOrderId en body.
[ ] Rechaza journalEntryId en body.
```

---

## 22. API tests — Tasks

```text id="j0au6y"
[ ] GET /tenant/maintenance-work-orders/{workOrderId}/tasks lista tareas.
[ ] POST /tenant/maintenance-work-orders/{workOrderId}/tasks crea tarea.
[ ] GET /tenant/maintenance-tasks/{taskId} devuelve detalle.
[ ] PATCH /tenant/maintenance-tasks/{taskId} actualiza.
[ ] POST /tenant/maintenance-tasks/{taskId}/complete completa tarea.
[ ] Rechaza task cross-tenant.
[ ] Rechaza status directo por PATCH.
[ ] taskNumber se genera server-side.
```

---

## 23. API tests — Visits

```text id="e4ojir"
[ ] GET /tenant/maintenance-work-orders/{workOrderId}/visits lista visitas.
[ ] POST /tenant/maintenance-work-orders/{workOrderId}/visits crea visita.
[ ] GET /tenant/maintenance-visits/{visitId} devuelve detalle.
[ ] PATCH /tenant/maintenance-visits/{visitId} actualiza.
[ ] POST /tenant/maintenance-visits/{visitId}/complete completa visita.
[ ] POST /tenant/maintenance-visits/{visitId}/cancel cancela visita.
[ ] Rechaza visitedByUserId sin membership.
[ ] Rechaza supplierId blocked.
[ ] Rechaza propertyUnitId cross-tenant.
```

---

## 24. API tests — Evidence

```text id="nm0bq9"
[ ] GET /tenant/maintenance-work-orders/{workOrderId}/evidence lista evidencia.
[ ] POST /tenant/maintenance-work-orders/{workOrderId}/evidence crea evidencia.
[ ] GET /tenant/maintenance-evidence/{evidenceId} devuelve detalle.
[ ] POST /tenant/maintenance-evidence/{evidenceId}/verify verifica.
[ ] POST /tenant/maintenance-evidence/{evidenceId}/reject rechaza con reason.
[ ] POST /tenant/maintenance-evidence/{evidenceId}/archive archiva.
[ ] Rechaza secureDocumentId cross-tenant.
[ ] Rechaza taskId de otra orden.
[ ] Rechaza visitId de otra orden.
[ ] Rechaza storageKey.
[ ] Rechaza signedUrl.
[ ] Rechaza base64.
[ ] No expone storageKey.
```

---

## 25. API tests — Comments

```text id="e20vw1"
[ ] GET /tenant/maintenance-work-orders/{workOrderId}/comments lista comentarios.
[ ] POST /tenant/maintenance-work-orders/{workOrderId}/comments crea comentario internal.
[ ] POST crea comentario visibleToRequester.
[ ] POST rechaza visibility system desde cliente.
[ ] /me no ve comentarios internal.
[ ] /me ve comentarios visibleToRequester en solicitud propia.
[ ] Sanitiza HTML/script.
```

---

## 26. API tests — Costs

```text id="dsjn2v"
[ ] GET /tenant/maintenance-work-orders/{workOrderId}/costs lista costos.
[ ] POST /tenant/maintenance-work-orders/{workOrderId}/costs crea costo.
[ ] GET /tenant/maintenance-costs/{costEstimateId} devuelve detalle.
[ ] PATCH /tenant/maintenance-costs/{costEstimateId} actualiza draft.
[ ] POST /submit cambia draft -> submitted.
[ ] POST /approve cambia submitted -> approved.
[ ] POST /reject requiere reason.
[ ] POST /cancel requiere reason.
[ ] POST /convert-to-payable crea payable link.
[ ] Rechaza estimatedAmount negativo.
[ ] Rechaza number/float.
[ ] Rechaza currency distinta de USD.
[ ] Rechaza supplierId cross-tenant.
[ ] Rechaza supplier blocked.
[ ] Rechaza convert-to-payable duplicado.
```

---

## 27. API tests — Supplier and payable links

```text id="ykfv14"
[ ] GET /tenant/maintenance-work-orders/{workOrderId}/supplier-links lista links.
[ ] POST /tenant/maintenance-work-orders/{workOrderId}/supplier-links crea link active.
[ ] POST /tenant/maintenance-supplier-links/{linkId}/unlink desvincula con reason.
[ ] Rechaza unlink sin reason.
[ ] GET /tenant/maintenance-work-orders/{workOrderId}/payable-links lista links.
[ ] Rechaza supplier tenant B.
[ ] Rechaza supplier blocked.
```

---

## 28. API tests — Reports and exports

```text id="bb5on1"
[ ] GET /tenant/maintenance-reports/by-status devuelve reporte tenant-scoped.
[ ] GET /tenant/maintenance-reports/by-category devuelve reporte.
[ ] GET /tenant/maintenance-reports/response-times devuelve tiempos.
[ ] GET /tenant/maintenance-reports/costs devuelve montos string decimal.
[ ] GET /tenant/maintenance-reports/by-supplier devuelve reporte.
[ ] GET /tenant/maintenance-reports/export crea SecureDocument.
[ ] Export no devuelve storageKey.
[ ] Export no devuelve signedUrl persistente.
[ ] Reportes no incluyen tenant B.
[ ] Reportes aplican pageSize/filtros seguros si corresponde.
```

---

## 29. Authorization tests

### 29.1. Roles administrativos

```text id="q2gbhs"
[ ] TenantAdmin con permisos opera categorías.
[ ] MaintenanceManager opera solicitudes y órdenes.
[ ] InternalTechnician solo ve/actualiza órdenes asignadas si política lo permite.
[ ] FinancialManager aprueba costos.
[ ] Accountant consulta costos/payable links si tiene permiso.
[ ] BoardMember consulta reportes si tiene permiso.
```

---

### 29.2. Resident / owner

```text id="u7thje"
[ ] Resident crea solicitud propia.
[ ] Resident no lista solicitudes administrativas.
[ ] Resident no ve work orders administrativas.
[ ] Resident no ve costos.
[ ] Resident no aprueba costos.
[ ] Resident no convierte a payable.
[ ] Resident no ve comentarios internal.
```

---

### 29.3. PlatformAdmin

```text id="tyma5m"
[ ] PlatformAdmin no accede automáticamente a solicitudes tenant.
[ ] PlatformAdmin requiere tenant context explícito.
[ ] PlatformAdmin requiere permiso explícito.
[ ] Acceso excepcional queda auditado.
```

---

## 30. Multitenancy tests

```text id="h891da"
[ ] tenantA no lee category tenantB.
[ ] tenantA no lee asset tenantB.
[ ] tenantA no lee request tenantB.
[ ] tenantA no lee workOrder tenantB.
[ ] tenantA no lee task tenantB.
[ ] tenantA no lee visit tenantB.
[ ] tenantA no lee evidence tenantB.
[ ] tenantA no lee cost tenantB.
[ ] tenantA no lee supplierLink tenantB.
[ ] tenantA no lee payableLink tenantB.
[ ] tenantA no lee comments tenantB.
[ ] tenantA no ve reportes tenantB.
[ ] tenantA no usa secureDocument tenantB.
[ ] tenantA no usa supplier tenantB.
[ ] tenantA no usa propertyUnit tenantB.
[ ] tenantA no usa commonArea tenantB.
```

Respuesta esperada:

```text id="ibckuu"
404 Not Found
```

---

## 31. Security tests — Forbidden fields

Probar que todos los DTOs rechacen:

```text id="yhhgmh"
tenantId
createdBy
updatedBy
reportedByUserId
reportedByPersonId no permitido
assignedBy
approvedBy
rejectedBy
closedBy
reopenedBy
archivedBy
status directo fuera de transición
costApprovalStatus directo fuera de transición
requestNumber
workOrderNumber
taskNumber
supplierPayableId fuera de convert-to-payable
paymentOrderId
journalEntryId
bankTransactionId
reconciliationMatchId
storageKey
signedUrl
base64
rawFilePayload
paymentInitiation
bankTransferInstruction
openBankingPaymentInitiation
externalAiEnabled
```

Respuesta esperada:

```text id="ml2w4r"
400 Bad Request
o
422 Unprocessable Entity
```

Según convención global de API.

---

## 32. Security tests — Public and WordPress boundaries

```text id="wurqw3"
[ ] GET /api/v1/public/maintenance-requests retorna 404.
[ ] GET /api/v1/public/maintenance-work-orders retorna 404.
[ ] GET /api/v1/public/maintenance-evidence retorna 404.
[ ] GET /api/v1/public/maintenance-reports retorna 404.
[ ] POST /api/v1/public/maintenance-requests retorna 404.
[ ] GET /api/v1/public/tenants/{slug}/maintenance-requests retorna 404.
[ ] WordPress origin no tiene CORS habilitado para maintenance privado.
[ ] API no documenta endpoints públicos en OpenAPI.
```

---

## 33. Security tests — Data exposure

```text id="fsdu3p"
[ ] /me no expone internal comments.
[ ] /me no expone estimatedCostAmount.
[ ] /me no expone approvedCostAmount.
[ ] /me no expone actualCostAmount.
[ ] /me no expone supplierId por defecto.
[ ] /me no expone supplierPayableId.
[ ] /me no expone audit metadata.
[ ] /me no expone status history completa.
[ ] Evidence DTO no expone storageKey.
[ ] Export DTO no expone storageKey.
[ ] Ningún response expone signedUrl persistente.
[ ] Ningún response expone base64.
```

---

## 34. Security tests — Financial boundaries

```text id="db57mi"
[ ] POST /convert-to-payable no crea SupplierPaymentOrder.
[ ] POST /convert-to-payable no crea Payment.
[ ] POST /convert-to-payable no crea PaymentAllocation.
[ ] POST /convert-to-payable no marca paid.
[ ] WorkOrder close no crea SupplierPayable automáticamente.
[ ] WorkOrder close no crea Payment.
[ ] WorkOrder close no crea JournalEntry.
[ ] Cost approve no crea Payment.
[ ] Cost approve no crea JournalEntry.
[ ] No existen rutas maintenance para mark-paid.
[ ] No existen rutas maintenance para bank transfer.
[ ] No existen rutas maintenance para Open Banking payment initiation.
```

---

## 35. Security tests — Accounting and reconciliation boundaries

```text id="jwl3oh"
[ ] Maintenance no crea JournalEntry.
[ ] Maintenance no edita JournalEntry.
[ ] Maintenance no publica asientos contables.
[ ] Maintenance no crea ReconciliationMatch.
[ ] Maintenance no marca BankTransaction matched.
[ ] Maintenance no cierra ReconciliationSession.
[ ] DTO rechaza journalEntryId.
[ ] DTO rechaza bankTransactionId.
[ ] DTO rechaza reconciliationMatchId.
```

---

## 36. Audit tests

### 36.1. Eventos obligatorios

```text id="u42txa"
[ ] maintenanceCategory.created.
[ ] maintenanceCategory.updated.
[ ] maintenanceCategory.archived.
[ ] maintenanceAsset.created.
[ ] maintenanceAsset.updated.
[ ] maintenanceAsset.archived.
[ ] maintenanceRequest.created.
[ ] maintenanceRequest.submitted.
[ ] maintenanceRequest.reviewed.
[ ] maintenanceRequest.accepted.
[ ] maintenanceRequest.rejected.
[ ] maintenanceRequest.cancelled.
[ ] maintenanceRequest.markedDuplicate.
[ ] maintenanceRequest.convertedToWorkOrder.
[ ] maintenanceWorkOrder.created.
[ ] maintenanceWorkOrder.updated.
[ ] maintenanceWorkOrder.assigned.
[ ] maintenanceWorkOrder.scheduled.
[ ] maintenanceWorkOrder.started.
[ ] maintenanceWorkOrder.paused.
[ ] maintenanceWorkOrder.completed.
[ ] maintenanceWorkOrder.closed.
[ ] maintenanceWorkOrder.reopened.
[ ] maintenanceWorkOrder.cancelled.
[ ] maintenanceTask.created.
[ ] maintenanceTask.updated.
[ ] maintenanceTask.completed.
[ ] maintenanceVisit.created.
[ ] maintenanceVisit.completed.
[ ] maintenanceVisit.cancelled.
[ ] maintenanceEvidence.created.
[ ] maintenanceEvidence.verified.
[ ] maintenanceEvidence.rejected.
[ ] maintenanceEvidence.downloaded.
[ ] maintenanceCostEstimate.created.
[ ] maintenanceCostEstimate.submitted.
[ ] maintenanceCostEstimate.approved.
[ ] maintenanceCostEstimate.rejected.
[ ] maintenanceCostEstimate.convertedToPayable.
[ ] maintenanceSupplierLink.created.
[ ] maintenanceSupplierLink.unlinked.
[ ] maintenancePayableLink.created.
[ ] maintenanceComment.created.
[ ] maintenanceReport.generated.
[ ] maintenanceReport.exported.
```

---

### 36.2. Sanitización de auditoría

Audit no debe contener:

```text id="w1qeyy"
storageKey
signedUrl
base64
raw file payload
comentarios internos completos innecesarios
datos personales innecesarios
datos cross-tenant
tokens
secrets
passwords
SQL raw
stack trace productivo
```

---

## 37. Observability tests

### 37.1. Logs

```text id="d28eri"
[ ] Logs incluyen traceId.
[ ] Logs incluyen action.
[ ] Logs incluyen outcome.
[ ] Logs incluyen durationMs.
[ ] Logs no incluyen storageKey.
[ ] Logs no incluyen signedUrl.
[ ] Logs no incluyen base64.
[ ] Logs no incluyen comentarios internos completos.
[ ] Logs no incluyen stack trace productivo.
```

---

### 37.2. Metrics

```text id="f5idjj"
[ ] maintenance_requests_total incrementa.
[ ] maintenance_work_orders_total incrementa.
[ ] maintenance_work_orders_closed_total incrementa.
[ ] maintenance_costs_approved_total incrementa.
[ ] maintenance_reports_exported_total incrementa.
[ ] Métricas no usan tenantId como label.
[ ] Métricas no usan userId como label.
[ ] Métricas no usan workOrderId como label.
[ ] Métricas no usan requestId como label.
[ ] Métricas no usan secureDocumentId como label.
[ ] Métricas no usan traceId como label.
```

---

## 38. OpenAPI contract tests

```text id="tmz2t1"
[ ] OpenAPI incluye tags Maintenance Categories.
[ ] OpenAPI incluye tags Maintenance Assets.
[ ] OpenAPI incluye tags Maintenance Requests.
[ ] OpenAPI incluye tags Maintenance My Requests.
[ ] OpenAPI incluye tags Maintenance Work Orders.
[ ] OpenAPI incluye tags Maintenance Tasks.
[ ] OpenAPI incluye tags Maintenance Visits.
[ ] OpenAPI incluye tags Maintenance Evidence.
[ ] OpenAPI incluye tags Maintenance Costs.
[ ] OpenAPI incluye tags Maintenance Supplier Links.
[ ] OpenAPI incluye tags Maintenance Payable Links.
[ ] OpenAPI incluye tags Maintenance Comments.
[ ] OpenAPI incluye tags Maintenance Reports.
[ ] Todas las rutas tenant tienen x-tenant-scope=true.
[ ] Todas las rutas tienen x-auth-required=true.
[ ] Rutas /me tienen x-own-resource=true.
[ ] Rutas con evidencia tienen x-secure-document-storage=true.
[ ] No existe /api/v1/public/maintenance-*.
[ ] No se documenta storageKey.
[ ] Money se documenta como string decimal.
[ ] convert-to-payable tiene x-creates-payment=false.
[ ] convert-to-payable tiene x-creates-supplier-payment-order=false.
[ ] convert-to-payable tiene x-direct-accounting=false.
```

---

## 39. Performance tests

### 39.1. Targets

```text id="fgwdu6"
[ ] Listado de solicitudes paginadas p95 < 800 ms.
[ ] Listado de órdenes paginadas p95 < 1000 ms.
[ ] Reporte by-status p95 < 1500 ms.
[ ] Reporte costs p95 < 2000 ms.
[ ] Export pequeño p95 < 2000 ms o job controlado.
```

---

### 39.2. Dataset mínimo

```text id="f2idqf"
tenantA:
- 1,000 maintenance_requests
- 500 maintenance_work_orders
- 2,000 tasks
- 1,000 evidence rows
- 500 cost estimates

tenantB:
- 500 maintenance_requests
- 200 maintenance_work_orders
```

---

### 39.3. Performance assertions

```text id="gcfzxk"
[ ] PageSize max 100.
[ ] No N+1 evidente en list work orders.
[ ] No N+1 evidente en list requests.
[ ] Índices por tenant/status son usados.
[ ] Reportes filtran por tenant.
[ ] Export no bloquea operación si supera umbral definido.
```

---

## 40. Concurrency tests

```text id="d9tk7f"
[ ] Dos usuarios crean misma categoryCode en tenant A: solo una exitosa.
[ ] Dos usuarios crean mismo assetCode en tenant A: solo una exitosa.
[ ] Dos usuarios convierten misma request a workOrder: solo una exitosa.
[ ] Dos usuarios cierran misma workOrder: solo una exitosa.
[ ] Dos usuarios reabren misma workOrder: control de estado consistente.
[ ] Dos usuarios aprueban mismo costEstimate: solo una aprobación efectiva.
[ ] Dos usuarios convierten mismo costEstimate a payable: solo un MaintenancePayableLink activo.
[ ] Dos usuarios crean task simultánea: taskNumber único.
```

---

## 41. Regression tests

Cada cambio futuro debe verificar que no se rompa:

```text id="rrnyzo"
[ ] tenant isolation;
[ ] own-resource /me;
[ ] no storageKey exposure;
[ ] no internal comments in /me;
[ ] no costs in /me;
[ ] no direct payment;
[ ] no direct accounting;
[ ] no public endpoints;
[ ] Decimal money;
[ ] close/reopen rules;
[ ] Supplier Payments boundary;
[ ] SDS boundary;
[ ] audit events.
```

---

## 42. Smoke tests

### 42.1. Smoke flow — resident request

```text id="mgi4cb"
[ ] TenantAdmin crea categoría PLUMBING.
[ ] TenantAdmin crea asset WATER_PUMP_MAIN.
[ ] Resident crea solicitud propia desde /me.
[ ] Resident adjunta evidencia requesterVisible vía SDS.
[ ] Resident consulta su solicitud.
[ ] Otro resident no puede consultar esa solicitud.
[ ] MaintenanceManager revisa solicitud.
[ ] MaintenanceManager acepta solicitud.
[ ] MaintenanceManager convierte solicitud en work order.
[ ] Sistema audita eventos.
[ ] Sistema notifica cambios relevantes.
```

---

### 42.2. Smoke flow — internal work order

```text id="mcvd6h"
[ ] MaintenanceManager crea work order directa.
[ ] MaintenanceManager asigna técnico interno.
[ ] MaintenanceManager programa work order.
[ ] Técnico inicia work order.
[ ] Técnico crea tarea.
[ ] Técnico registra visita.
[ ] Técnico adjunta evidencia afterPhoto vía SDS.
[ ] Técnico completa tarea.
[ ] MaintenanceManager completa work order.
[ ] MaintenanceManager cierra work order con evidencia.
[ ] Sistema audita cierre.
```

---

### 42.3. Smoke flow — supplier and payable

```text id="evlpy9"
[ ] MaintenanceManager crea work order con supplier active.
[ ] MaintenanceManager registra costo supplierService.
[ ] FinancialManager envía costo a aprobación.
[ ] FinancialManager aprueba costo.
[ ] FinancialManager convierte costo a SupplierPayable.
[ ] Sistema crea MaintenancePayableLink.
[ ] Verificar que Supplier Payments recibió draft/control request.
[ ] Verificar que no se creó SupplierPaymentOrder.
[ ] Verificar que no se creó Payment.
[ ] Verificar que no se creó JournalEntry.
```

---

### 42.4. Smoke flow — reports/export

```text id="z6zxy9"
[ ] TenantAdmin consulta reporte by-status.
[ ] TenantAdmin consulta reporte by-category.
[ ] FinancialManager consulta reporte costs.
[ ] TenantAdmin exporta reporte.
[ ] Sistema crea SecureDocument.
[ ] Response incluye secureDocumentId.
[ ] Response no incluye storageKey.
[ ] Audit registra maintenanceReport.exported.
```

---

## 43. CI gates

El pipeline debe fallar si:

```text id="rc2255"
[ ] Unit tests fallan.
[ ] Integration tests fallan.
[ ] API tests fallan.
[ ] Security tests fallan.
[ ] OpenAPI contract tests fallan.
[ ] Multitenancy tests fallan.
[ ] /me own-resource tests fallan.
[ ] Audit tests fallan.
[ ] NoDirectPayment tests fallan.
[ ] NoDirectAccounting tests fallan.
[ ] NoPublicEndpoint tests fallan.
[ ] NoStorageKey tests fallan.
```

---

## 44. Gates críticos de seguridad

Fallar CI si:

```text id="tdyy34"
- algún DTO acepta tenantId;
- algún DTO acepta actor fields;
- algún DTO acepta status directo fuera de transición;
- algún DTO acepta storageKey;
- algún DTO acepta signedUrl;
- algún DTO acepta base64;
- algún DTO acepta journalEntryId;
- algún DTO acepta paymentOrderId;
- /me expone internal comments;
- /me expone costos internos;
- /me expone supplierPayableId;
- /me permite solicitud sobre unidad ajena;
- API permite request cross-tenant;
- API permite workOrder cross-tenant;
- API permite evidence cross-tenant;
- API permite cost cross-tenant;
- API permite supplier cross-tenant;
- API crea Payment;
- API crea SupplierPaymentOrder;
- API crea JournalEntry;
- API inicia transferencia bancaria;
- API documenta endpoint público;
- API expone storageKey;
- logs contienen storageKey;
- audit contiene storageKey;
- externalAi está habilitado por defecto.
```

---

## 45. Definition of Done de pruebas

El módulo puede pasar a implementación productiva gradual si:

```text id="d0vh48"
[ ] Value object tests pasan.
[ ] Entity tests pasan.
[ ] State machine tests pasan.
[ ] Policy tests pasan.
[ ] Repository tests pasan.
[ ] Service tests pasan.
[ ] Integration tests pasan.
[ ] API tenant tests pasan.
[ ] API /me tests pasan.
[ ] Authorization tests pasan.
[ ] Multitenancy tests pasan.
[ ] Security tests pasan.
[ ] SDS integration tests pasan.
[ ] Supplier Payments boundary tests pasan.
[ ] Notifications tests pasan.
[ ] Audit tests pasan.
[ ] Observability tests pasan.
[ ] OpenAPI contract tests pasan.
[ ] Performance mínima validada.
[ ] Concurrency tests críticos pasan.
[ ] Smoke flows pasan.
[ ] CI completo pasa.
```

---

## 46. No aceptación

No se acepta el módulo si alguna prueba demuestra que:

```text id="btx827"
- permite maintenance request cross-tenant;
- permite maintenance work order cross-tenant;
- permite maintenance evidence cross-tenant;
- permite maintenance cost cross-tenant;
- permite supplier cross-tenant;
- permite propertyUnit cross-tenant;
- permite commonArea cross-tenant;
- permite secureDocument cross-tenant;
- acepta tenantId desde body;
- acepta actor fields desde body;
- acepta status directo sin endpoint de transición;
- expone storageKey;
- expone signedUrl persistente;
- acepta base64;
- resident ve solicitud ajena;
- resident crea solicitud sobre unidad ajena;
- /me expone comentarios internos;
- /me expone costos internos;
- /me expone supplierId o supplierPayableId sin permiso;
- permite cerrar orden sin evidencia ni justificación;
- permite reabrir sin razón;
- permite costo negativo;
- usa number/float para dinero;
- crea Payment;
- crea SupplierPaymentOrder;
- marca paid;
- inicia transferencia bancaria;
- inicia Open Banking payment;
- crea JournalEntry;
- edita JournalEntry;
- confirma Bank Reconciliation;
- documenta endpoints públicos;
- permite acceso desde WordPress público;
- envía fotos, informes o solicitudes reales a IA externa;
- omite auditoría crítica;
- logs contienen datos prohibidos.
```

---

## 47. Resultado esperado

Al ejecutar este plan de pruebas, el módulo `022-maintenance-work-orders` debe demostrar que su implementación es funcional, segura, auditable, tenant-scoped y correctamente separada de pagos, contabilidad, conciliación bancaria, WordPress público e IA externa.

Resultado esperado:

```text id="xxg8b1"
value objects tested
entities tested
state machines tested
policies tested
repositories tested
services tested
tenant admin API tested
/me API tested
own-resource access tested
multitenancy tested
authorization tested
DTO hardening tested
SDS integration tested
Supplier Payments boundary tested
Notifications integration tested
audit tested
observability tested
OpenAPI tested
reports tested
exports tested
performance tested
concurrency tested
smoke flows tested
no public endpoints
no storageKey exposure
no direct payments
no direct accounting
no WordPress public access
no external AI with real data
```

---

## 48. Expediente actualizado

```text id="nd56bo"
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
│   │   ├── 021-supplier-payments/
│   │   └── 022-maintenance-work-orders/
│   │       ├── spec.md
│   │       ├── plan.md
│   │       ├── data-model.md
│   │       ├── api-contract.md
│   │       └── test-plan.md
```
