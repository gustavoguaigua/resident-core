# Plan — 022 Maintenance Work Orders

## 1. Información del documento

| Campo                 | Valor                                                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Proyecto              | RESIDENT Core                                                                                                                  |
| Spec ID               | 022                                                                                                                            |
| Módulo                | Maintenance Work Orders                                                                                                        |
| Documento             | Technical Plan                                                                                                                 |
| Ruta                  | `docs/specs/022-maintenance-work-orders/plan.md`                                                                               |
| Versión               | 0.1                                                                                                                            |
| Estado                | Borrador inicial                                                                                                               |
| Fecha                 | 2026-07-23                                                                                                                     |
| Documento base        | `docs/specs/022-maintenance-work-orders/spec.md`                                                                               |
| Fase                  | FASE 2 — RESIDENT Core                                                                                                         |
| Arquitectura objetivo | Monolito modular preparado para microservicios                                                                                 |
| Stack objetivo        | NestJS / TypeScript / PostgreSQL / Prisma / OpenAPI / Keycloak                                                                 |
| Naturaleza            | Tenant-scoped / Operational / Request-driven / Work-order-driven / Evidence-backed / Supplier-aware / Cost-aware / Audit-heavy |

---

## 2. Propósito

Este documento define el plan técnico para implementar el módulo `022-maintenance-work-orders`.

El módulo permitirá gestionar solicitudes de mantenimiento, órdenes de trabajo, asignaciones, tareas, visitas, evidencias, costos, aprobaciones operativas, vínculos con proveedores, vínculos con cuentas por pagar, reportes y exportaciones.

Regla central del plan:

```text id="pjcg8w"
Maintenance Work Orders debe implementarse como un módulo operativo tenant-scoped, orientado a solicitudes y órdenes de trabajo, con evidencia segura, trazabilidad completa, costos controlados, integración limitada con Supplier Payments, integración documental con Secure Document Storage, notificaciones desacopladas, auditoría obligatoria, sin creación directa de pagos, sin iniciación de transferencias, sin contabilidad directa, sin endpoints públicos y sin acceso desde WordPress público.
```

---

## 3. Decisión técnica principal

El módulo se implementará como parte del monolito modular de RESIDENT Core.

Decisión:

```text id="ai60w1"
Implementar Maintenance Work Orders como módulo NestJS independiente dentro del monolito modular, con límites claros de dominio, puertos de integración, repositorios tenant-scoped, DTOs seguros, state machines explícitas, eventos auditables y API REST privada.
```

Justificación:

```text id="wqsv7j"
- El módulo depende de Tenants, Users/Roles, Residents/Properties, Secure Document Storage, Supplier Payments, Communications y Audit.
- Es un módulo operativo central, pero no requiere microservicio físico inicial.
- Puede evolucionar posteriormente a microservicio si crece la carga operativa o se requiere app móvil técnica.
- La separación modular permite mantener independencia de dominio sin sobrecargar la infraestructura inicial.
```

---

## 4. Nombre del módulo

Nombre técnico:

```text id="c44525"
maintenance-work-orders
```

Ruta base recomendada:

```text id="reflfi"
apps/api/src/modules/maintenance-work-orders/
```

Nombre de clase NestJS:

```typescript id="qh60w3"
MaintenanceWorkOrdersModule
```

---

## 5. Tipo de módulo

Clasificación:

```text id="i8kezy"
Operational module
Tenant-scoped module
Resident-facing limited /me module
Admin-facing private module
Evidence-backed module
Supplier-aware module
Cost-aware module
Audit-heavy module
Non-public module
```

No es:

```text id="yrj8w2"
- módulo financiero autoritativo;
- módulo de pagos;
- módulo contable;
- módulo de conciliación bancaria;
- módulo público;
- módulo WordPress;
- módulo de proveedores externos;
- módulo de IA;
- módulo de inventario avanzado.
```

---

## 6. Alcance técnico MVP

### 6.1. Incluido

```text id="agdi6v"
- MaintenanceCategory.
- MaintenanceAsset.
- MaintenanceRequest.
- MaintenanceRequestAttachment.
- MaintenanceWorkOrder.
- MaintenanceWorkOrderAssignment.
- MaintenanceWorkOrderTask.
- MaintenanceVisit.
- MaintenanceEvidence.
- MaintenanceCostEstimate.
- MaintenanceCostApproval.
- MaintenanceSupplierLink.
- MaintenancePayableLink.
- MaintenanceComment.
- MaintenanceStatusHistory.
- API tenant administrativa.
- API /me limitada para solicitudes propias.
- Integración con Secure Document Storage.
- Integración con Supplier Payments para supplier/payable link.
- Integración con Communications/Notifications.
- Auditoría.
- Reportes básicos.
- Exportaciones vía Secure Document Storage.
- OpenAPI.
- Tests de dominio, API, seguridad y multitenancy.
```

---

### 6.2. Fuera de alcance técnico MVP

```text id="rqhnqn"
- inventario avanzado de repuestos;
- compras y órdenes de compra completas;
- recepción formal de bienes;
- mantenimiento predictivo;
- IoT;
- app móvil offline;
- SLA contractual avanzado;
- portal de proveedores;
- firma digital o electrónica legal;
- cotización multi-proveedor avanzada;
- licitación;
- pagos automáticos;
- iniciación bancaria;
- Open Banking payment initiation;
- contabilidad directa;
- conciliación bancaria;
- facturación electrónica;
- integración SRI;
- IA con fotografías, informes o solicitudes reales.
```

---

## 7. Dependencias internas

### 7.1. `001-tenants`

Uso:

```text id="c9wef0"
- tenant isolation;
- tenant status;
- configuración por tenant;
- resolución de currentTenant;
- respuesta 404 en referencias cross-tenant.
```

Regla:

```text id="ranqqs"
Toda entidad de mantenimiento debe pertenecer a un tenant activo.
```

---

### 7.2. `002-users-roles`

Uso:

```text id="wc0234"
- autenticación Keycloak;
- UserProfile;
- TenantMembership;
- roles;
- permisos;
- endpoints /me;
- resolución del actor.
```

Regla:

```text id="z4oam5"
Keycloak autentica; RESIDENT Core autoriza.
```

---

### 7.3. `003-residents-properties`

Uso:

```text id="n4iwzv"
- validar propertyUnitId;
- validar relación persona-unidad;
- validar solicitudes propias;
- asociar solicitudes a unidades;
- asociar activos a unidades;
- validar owner/resident vigente.
```

Regla:

```text id="aar5sx"
Un usuario /me solo puede crear o consultar solicitudes asociadas a sus unidades, o a áreas comunales permitidas.
```

---

### 7.4. `010-reservations-common-areas`

Uso opcional:

```text id="cu6k8w"
- asociar work orders a commonAreaId;
- marcar indisponibilidad operativa;
- coordinar con reservas si un área queda en mantenimiento.
```

Regla:

```text id="tdhwdo"
Maintenance puede informar indisponibilidad; Reservations mantiene autoridad sobre reservas.
```

---

### 7.5. `012-communications-notifications`

Uso:

```text id="c5vpiv"
- notificar solicitud submitted;
- notificar solicitud accepted/rejected;
- notificar conversión a orden;
- notificar programación;
- notificar cierre;
- notificar reapertura;
- notificar comentario visible al solicitante.
```

Regla:

```text id="ss7sbs"
Las notificaciones deben minimizar datos internos y nunca incluir storageKey, costos internos, comentarios internos o datos sensibles de proveedor.
```

---

### 7.6. `016-secure-document-storage`

Uso:

```text id="ms0dmj"
- evidencia fotográfica;
- informes técnicos;
- cotizaciones;
- comprobantes;
- evidencias de cierre;
- exportaciones de reportes.
```

Regla:

```text id="vcdge0"
Maintenance Work Orders no almacena binarios; solo referencia documentos seguros.
```

---

### 7.7. `021-supplier-payments`

Uso:

```text id="fip5a5"
- validar supplierId;
- vincular proveedor a work order;
- convertir costo aprobado en SupplierPayable;
- consultar payable link.
```

Regla:

```text id="j39uz2"
Maintenance Work Orders no crea pagos, no crea órdenes de pago, no marca pagos como paid y no inicia transferencias.
```

---

### 7.8. `020-accounting-ledger`

Uso directo:

```text id="ief40q"
ninguno en MVP
```

Regla:

```text id="go8x54"
Maintenance Work Orders no crea ni modifica JournalEntries.
```

Cualquier efecto financiero debe pasar por `021-supplier-payments` u otro módulo financiero autorizado.

---

### 7.9. `007-audit`

Uso:

```text id="z5ylpo"
- auditoría de solicitudes;
- auditoría de órdenes;
- auditoría de asignaciones;
- auditoría de evidencias;
- auditoría de costos;
- auditoría de cierres;
- auditoría de reaperturas;
- auditoría de conversiones a payable;
- auditoría de exportaciones.
```

---

### 7.10. `008-basic-reports`

Uso:

```text id="ofodq5"
- posible registro de reportes básicos;
- exportaciones;
- consistencia de filtros;
- integración futura con dashboard.
```

---

## 8. Estructura técnica del módulo

```text id="c1fuhw"
apps/api/src/modules/maintenance-work-orders/
├── maintenance-work-orders.module.ts
│
├── controllers/
│   ├── maintenance-categories.controller.ts
│   ├── maintenance-assets.controller.ts
│   ├── maintenance-requests.controller.ts
│   ├── maintenance-me-requests.controller.ts
│   ├── maintenance-work-orders.controller.ts
│   ├── maintenance-tasks.controller.ts
│   ├── maintenance-visits.controller.ts
│   ├── maintenance-evidence.controller.ts
│   ├── maintenance-costs.controller.ts
│   ├── maintenance-supplier-links.controller.ts
│   ├── maintenance-payable-links.controller.ts
│   ├── maintenance-comments.controller.ts
│   └── maintenance-reports.controller.ts
│
├── application/
│   ├── services/
│   │   ├── maintenance-category.service.ts
│   │   ├── maintenance-asset.service.ts
│   │   ├── maintenance-request.service.ts
│   │   ├── maintenance-request-review.service.ts
│   │   ├── maintenance-work-order.service.ts
│   │   ├── maintenance-work-order-assignment.service.ts
│   │   ├── maintenance-task.service.ts
│   │   ├── maintenance-visit.service.ts
│   │   ├── maintenance-evidence.service.ts
│   │   ├── maintenance-cost.service.ts
│   │   ├── maintenance-cost-approval.service.ts
│   │   ├── maintenance-supplier-link.service.ts
│   │   ├── maintenance-payable-link.service.ts
│   │   ├── maintenance-comment.service.ts
│   │   ├── maintenance-status-history.service.ts
│   │   ├── maintenance-report.service.ts
│   │   └── maintenance-export.service.ts
│   │
│   ├── use-cases/
│   │   ├── create-maintenance-request.use-case.ts
│   │   ├── create-own-maintenance-request.use-case.ts
│   │   ├── review-maintenance-request.use-case.ts
│   │   ├── convert-request-to-work-order.use-case.ts
│   │   ├── assign-maintenance-work-order.use-case.ts
│   │   ├── close-maintenance-work-order.use-case.ts
│   │   ├── reopen-maintenance-work-order.use-case.ts
│   │   ├── approve-maintenance-cost.use-case.ts
│   │   └── convert-cost-to-payable.use-case.ts
│   │
│   └── ports/
│       ├── maintenance-category.repository.port.ts
│       ├── maintenance-asset.repository.port.ts
│       ├── maintenance-request.repository.port.ts
│       ├── maintenance-work-order.repository.port.ts
│       ├── maintenance-task.repository.port.ts
│       ├── maintenance-visit.repository.port.ts
│       ├── maintenance-evidence.repository.port.ts
│       ├── maintenance-cost.repository.port.ts
│       ├── maintenance-comment.repository.port.ts
│       ├── maintenance-audit.port.ts
│       ├── maintenance-document-storage.port.ts
│       ├── maintenance-notification.port.ts
│       ├── maintenance-supplier-payments.port.ts
│       └── maintenance-report-export.port.ts
│
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   ├── policies/
│   └── errors/
│
├── infrastructure/
│   ├── persistence/
│   │   ├── prisma-maintenance-category.repository.ts
│   │   ├── prisma-maintenance-asset.repository.ts
│   │   ├── prisma-maintenance-request.repository.ts
│   │   ├── prisma-maintenance-work-order.repository.ts
│   │   ├── prisma-maintenance-task.repository.ts
│   │   ├── prisma-maintenance-visit.repository.ts
│   │   ├── prisma-maintenance-evidence.repository.ts
│   │   ├── prisma-maintenance-cost.repository.ts
│   │   └── prisma-maintenance-comment.repository.ts
│   │
│   ├── documents/
│   ├── notifications/
│   ├── supplier-payments/
│   ├── reports/
│   ├── exports/
│   ├── audit/
│   └── observability/
│
├── dto/
├── guards/
├── mappers/
└── tests/
```

---

## 9. Componentes principales

### 9.1. Controllers

Responsabilidad:

```text id="zxtcxr"
- recibir requests HTTP;
- validar DTOs;
- aplicar guards;
- resolver currentTenant;
- delegar casos de uso;
- devolver responses seguros;
- no contener lógica de negocio compleja.
```

Controllers:

```text id="mki1tu"
MaintenanceCategoriesController
MaintenanceAssetsController
MaintenanceRequestsController
MaintenanceMeRequestsController
MaintenanceWorkOrdersController
MaintenanceTasksController
MaintenanceVisitsController
MaintenanceEvidenceController
MaintenanceCostsController
MaintenanceSupplierLinksController
MaintenancePayableLinksController
MaintenanceCommentsController
MaintenanceReportsController
```

---

### 9.2. Application services

Responsabilidad:

```text id="b0bdf4"
- coordinar reglas de negocio;
- validar transiciones;
- invocar repositorios;
- invocar puertos de integración;
- emitir auditoría;
- emitir eventos de dominio;
- manejar transacciones.
```

---

### 9.3. Domain entities

Entidades de dominio:

```text id="m5te4z"
MaintenanceCategory
MaintenanceAsset
MaintenanceRequest
MaintenanceRequestAttachment
MaintenanceWorkOrder
MaintenanceWorkOrderAssignment
MaintenanceWorkOrderTask
MaintenanceVisit
MaintenanceEvidence
MaintenanceCostEstimate
MaintenanceCostApproval
MaintenanceSupplierLink
MaintenancePayableLink
MaintenanceComment
MaintenanceStatusHistory
```

---

### 9.4. Value objects

Value objects recomendados:

```text id="u8hsv9"
MaintenanceCategoryCode
MaintenanceCategoryName
MaintenanceAssetCode
MaintenanceAssetName
MaintenanceRequestNumber
MaintenanceWorkOrderNumber
MaintenanceTitle
MaintenanceDescription
MaintenancePriority
MaintenanceSeverity
MaintenanceStatusValue
MaintenanceCommentBody
MaintenanceLocationDescription
MaintenanceCostAmount
MaintenanceCurrency
MaintenanceClosureSummary
MaintenanceReason
MaintenanceDocumentReference
MaintenanceReportPeriod
```

---

### 9.5. Policies

Policies recomendadas:

```text id="xwgts4"
MaintenanceTenantPolicy
MaintenanceOwnResourcePolicy
MaintenanceRequestSubmissionPolicy
MaintenanceRequestReviewPolicy
MaintenanceRequestDuplicatePolicy
MaintenanceWorkOrderCreationPolicy
MaintenanceWorkOrderAssignmentPolicy
MaintenanceWorkOrderStatePolicy
MaintenanceWorkOrderClosurePolicy
MaintenanceWorkOrderReopenPolicy
MaintenanceEvidencePolicy
MaintenanceCostPolicy
MaintenanceCostApprovalPolicy
MaintenanceSupplierLinkPolicy
MaintenancePayableConversionPolicy
MaintenanceCommentVisibilityPolicy
MaintenanceReportPolicy
NoPublicMaintenanceEndpointPolicy
NoWordPressMaintenanceAccessPolicy
NoDirectPaymentPolicy
NoDirectAccountingPolicy
NoExternalAiMaintenanceDataPolicy
```

---

## 10. Modelo de datos propuesto

Tablas MVP:

```text id="fx1n6o"
maintenance_categories
maintenance_assets
maintenance_requests
maintenance_request_attachments
maintenance_work_orders
maintenance_work_order_assignments
maintenance_work_order_tasks
maintenance_visits
maintenance_evidence
maintenance_cost_estimates
maintenance_cost_approvals
maintenance_supplier_links
maintenance_payable_links
maintenance_comments
maintenance_status_history
```

Todas deben incluir:

```text id="sgxns3"
id
tenant_id
created_at
updated_at
```

Las entidades archivables deben incluir:

```text id="j7c156"
archived_at
archived_by
archive_reason
```

Las entidades con estado deben incluir:

```text id="d7a8rc"
status
status_changed_at opcional
```

---

## 11. Relaciones principales

```text id="pksm9d"
Tenant 1 -> N MaintenanceCategory
Tenant 1 -> N MaintenanceAsset
Tenant 1 -> N MaintenanceRequest
Tenant 1 -> N MaintenanceWorkOrder

MaintenanceRequest 1 -> N MaintenanceRequestAttachment
MaintenanceRequest 1 -> 0..1 MaintenanceWorkOrder

MaintenanceWorkOrder 1 -> N MaintenanceWorkOrderAssignment
MaintenanceWorkOrder 1 -> N MaintenanceWorkOrderTask
MaintenanceWorkOrder 1 -> N MaintenanceVisit
MaintenanceWorkOrder 1 -> N MaintenanceEvidence
MaintenanceWorkOrder 1 -> N MaintenanceCostEstimate
MaintenanceWorkOrder 1 -> N MaintenanceComment
MaintenanceWorkOrder 1 -> N MaintenanceStatusHistory

MaintenanceCostEstimate 1 -> N MaintenanceCostApproval
MaintenanceCostEstimate 1 -> 0..1 MaintenancePayableLink

MaintenanceWorkOrder 1 -> N MaintenanceSupplierLink
MaintenanceWorkOrder 1 -> N MaintenancePayableLink
```

Referencias externas:

```text id="gfezya"
propertyUnitId -> 003-residents-properties
commonAreaId -> 010-reservations-common-areas
secureDocumentId -> 016-secure-document-storage
supplierId -> 021-supplier-payments
supplierPayableId -> 021-supplier-payments
createdBy/updatedBy/etc. -> 002-users-roles/UserProfile
```

---

## 12. Estrategia de multitenancy

### 12.1. Patrón obligatorio

Toda consulta sobre entidad tenant-scoped debe usar:

```typescript id="q8y4vy"
where: {
  id: resourceId,
  tenantId: currentTenant.id,
  archivedAt: null
}
```

Prohibido:

```typescript id="nd1zqr"
where: {
  id: resourceId
}
```

---

### 12.2. Referencias externas

Toda referencia externa debe validarse contra el mismo tenant:

```text id="tnk0cx"
propertyUnitId
commonAreaId
secureDocumentId
supplierId
supplierPayableId
assignedUserId
reportedByUserId
reportedByPersonId
```

---

### 12.3. `/me`

Los endpoints `/me` usan doble control:

```text id="he7gcb"
tenant membership activa
+
relación propia UserProfile -> Person -> Unit
```

---

## 13. State machines

### 13.1. MaintenanceRequest

Estados:

```text id="d43tc9"
draft
submitted
underReview
accepted
rejected
convertedToWorkOrder
cancelled
closed
archived
```

Transiciones:

```text id="ldpc0b"
draft -> submitted
submitted -> underReview
submitted -> cancelled
underReview -> accepted
underReview -> rejected
accepted -> convertedToWorkOrder
accepted -> closed
convertedToWorkOrder -> closed
rejected -> archived
cancelled -> archived
closed -> archived
```

Servicios responsables:

```text id="h4kqu2"
MaintenanceRequestService
MaintenanceRequestReviewService
ConvertRequestToWorkOrderUseCase
```

---

### 13.2. MaintenanceWorkOrder

Estados:

```text id="a33ero"
draft
open
pendingAssignment
assigned
scheduled
inProgress
onHold
pendingCostApproval
pendingResidentConfirmation
completed
closed
reopened
cancelled
archived
```

Transiciones:

```text id="jy9m96"
draft -> open
open -> pendingAssignment
open -> assigned
pendingAssignment -> assigned
assigned -> scheduled
assigned -> inProgress
scheduled -> inProgress
inProgress -> onHold
onHold -> inProgress
inProgress -> pendingCostApproval
pendingCostApproval -> inProgress
inProgress -> completed
completed -> pendingResidentConfirmation
pendingResidentConfirmation -> closed
completed -> closed
closed -> reopened
reopened -> inProgress
open -> cancelled
assigned -> cancelled
scheduled -> cancelled
inProgress -> cancelled
cancelled -> archived
closed -> archived
```

Servicios responsables:

```text id="wczd5x"
MaintenanceWorkOrderService
MaintenanceWorkOrderAssignmentService
CloseMaintenanceWorkOrderUseCase
ReopenMaintenanceWorkOrderUseCase
```

---

### 13.3. MaintenanceCostEstimate

Estados:

```text id="sw67ba"
draft
submitted
approved
rejected
cancelled
convertedToPayable
archived
```

Transiciones:

```text id="m1dssf"
draft -> submitted
submitted -> approved
submitted -> rejected
draft -> cancelled
submitted -> cancelled
approved -> convertedToPayable
approved -> archived
rejected -> archived
cancelled -> archived
convertedToPayable -> archived
```

---

### 13.4. MaintenanceEvidence

Estados:

```text id="m3vzfs"
active
verified
rejected
archived
```

Reglas:

```text id="pqju60"
- rejected no soporta cierre;
- archived no se devuelve por defecto;
- verified puede soportar cierre;
- active puede soportar cierre solo si la política del tenant lo permite.
```

---

## 14. Estrategia de costos

### 14.1. Tipos de costo

```text id="yqjdti"
labor
materials
supplierService
transport
emergency
other
```

---

### 14.2. Montos

Todos los montos deben usar Decimal.

En API:

```json id="wvoxrt"
{
  "estimatedAmount": "125.50",
  "currency": "USD"
}
```

No permitido:

```json id="zf4wcg"
{
  "estimatedAmount": 125.5
}
```

---

### 14.3. Costos no equivalen a pagos

Regla:

```text id="twu7v2"
MaintenanceCostEstimate registra una estimación, aprobación o referencia operativa; no registra pago.
```

Para pagar:

```text id="u02mt0"
MaintenanceCostEstimate approved
  -> convert-to-payable
    -> Supplier Payments
      -> SupplierPayable
      -> SupplierPaymentOrder
      -> mark-paid
```

---

## 15. Estrategia de integración con Supplier Payments

### 15.1. Puerto

Crear puerto:

```typescript id="ddmija"
export interface MaintenanceSupplierPaymentsPort {
  validateSupplier(input: ValidateMaintenanceSupplierInput): Promise<ValidatedSupplierResult>;
  createPayableFromMaintenanceCost(input: CreatePayableFromMaintenanceCostInput): Promise<CreatePayableFromMaintenanceCostResult>;
  getSupplierPayable(input: GetSupplierPayableInput): Promise<SupplierPayableSummary>;
}
```

---

### 15.2. Validar proveedor

Validar:

```text id="almmys"
- supplierId pertenece al tenant;
- supplier status active;
- supplier no blocked;
- supplier no archived.
```

---

### 15.3. Convertir costo a payable

Condiciones:

```text id="j4c1r4"
- workOrder tenant-scoped;
- costEstimate tenant-scoped;
- costEstimate approved;
- supplierId active;
- no existe MaintenancePayableLink activo;
- usuario tiene maintenanceCosts.convertToPayable;
- Supplier Payments habilitado.
```

---

### 15.4. Prohibiciones

Maintenance no debe:

```text id="wbsokk"
- crear SupplierPaymentOrder;
- marcar SupplierPaymentOrder paid;
- crear Payment;
- crear PaymentAllocation;
- iniciar transferencia bancaria;
- modificar cuenta bancaria de proveedor;
- modificar estado de conciliación;
- modificar JournalEntry.
```

---

## 16. Estrategia de integración con Secure Document Storage

### 16.1. Puerto

Crear puerto:

```typescript id="ij51sq"
export interface MaintenanceDocumentStoragePort {
  validateDocumentBelongsToTenant(input: ValidateMaintenanceDocumentInput): Promise<void>;
  getDownloadAvailability(input: MaintenanceDocumentDownloadAvailabilityInput): Promise<MaintenanceDocumentAvailabilityResult>;
  createReportExport(input: CreateMaintenanceReportExportInput): Promise<MaintenanceReportExportResult>;
}
```

---

### 16.2. Metadata recomendada

```text id="pnezkw"
sourceModule = maintenanceWorkOrders
visibility = administrative | requesterVisible
sensitivity = internal | restricted
```

---

### 16.3. Reglas

```text id="i4h0d5"
- no storageKey en API;
- no signedUrl persistente;
- no base64 en JSON;
- no binarios en logs;
- evidencia descargada se audita;
- /me solo puede descargar evidencia visible al solicitante.
```

---

## 17. Estrategia de integración con Notifications

### 17.1. Puerto

```typescript id="x25nzj"
export interface MaintenanceNotificationPort {
  notifyMaintenanceRequestSubmitted(input: MaintenanceRequestNotificationInput): Promise<void>;
  notifyMaintenanceRequestReviewed(input: MaintenanceRequestReviewedNotificationInput): Promise<void>;
  notifyWorkOrderStatusChanged(input: MaintenanceWorkOrderStatusNotificationInput): Promise<void>;
  notifyVisibleCommentCreated(input: MaintenanceVisibleCommentNotificationInput): Promise<void>;
}
```

---

### 17.2. Eventos notificables

```text id="m2x3jb"
maintenanceRequest.submitted
maintenanceRequest.accepted
maintenanceRequest.rejected
maintenanceRequest.convertedToWorkOrder
maintenanceWorkOrder.assigned
maintenanceWorkOrder.scheduled
maintenanceWorkOrder.inProgress
maintenanceWorkOrder.completed
maintenanceWorkOrder.closed
maintenanceWorkOrder.reopened
maintenanceComment.visibleToRequester.created
```

---

### 17.3. Degradación

Regla:

```text id="d5hvv1"
Si Notifications falla, la solicitud u orden no debe revertirse por defecto.
```

Debe registrarse:

```text id="wto9g2"
- warning seguro;
- audit o event metadata si aplica;
- retry futuro si se implementa outbox.
```

---

## 18. Estrategia de comentarios

### 18.1. Tipos de visibilidad

```text id="bpuu41"
internal
visibleToRequester
visibleToBoard
system
```

---

### 18.2. Reglas

```text id="wixpr7"
- internal no se expone en /me;
- visibleToRequester sí puede exponerse en /me;
- visibleToBoard requiere permiso;
- system se genera server-side;
- comentarios no deben contener HTML/script;
- comentarios se auditan si son críticos.
```

---

## 19. API técnica

### 19.1. Base path

```text id="gzftk2"
/api/v1
```

---

### 19.2. Superficies API

```text id="pj4swc"
Tenant Admin API:
  /api/v1/tenant/maintenance-*

Own User API:
  /api/v1/me/maintenance-*

Public API:
  no existe en MVP
```

---

### 19.3. Tenant Admin API

Categorías:

```text id="dwhpwh"
GET    /api/v1/tenant/maintenance-categories
POST   /api/v1/tenant/maintenance-categories
GET    /api/v1/tenant/maintenance-categories/{categoryId}
PATCH  /api/v1/tenant/maintenance-categories/{categoryId}
POST   /api/v1/tenant/maintenance-categories/{categoryId}/archive
```

Activos:

```text id="qzutwj"
GET    /api/v1/tenant/maintenance-assets
POST   /api/v1/tenant/maintenance-assets
GET    /api/v1/tenant/maintenance-assets/{assetId}
PATCH  /api/v1/tenant/maintenance-assets/{assetId}
POST   /api/v1/tenant/maintenance-assets/{assetId}/archive
```

Solicitudes:

```text id="jkl086"
GET    /api/v1/tenant/maintenance-requests
POST   /api/v1/tenant/maintenance-requests
GET    /api/v1/tenant/maintenance-requests/{requestId}
PATCH  /api/v1/tenant/maintenance-requests/{requestId}
POST   /api/v1/tenant/maintenance-requests/{requestId}/review
POST   /api/v1/tenant/maintenance-requests/{requestId}/accept
POST   /api/v1/tenant/maintenance-requests/{requestId}/reject
POST   /api/v1/tenant/maintenance-requests/{requestId}/cancel
POST   /api/v1/tenant/maintenance-requests/{requestId}/mark-duplicate
POST   /api/v1/tenant/maintenance-requests/{requestId}/convert-to-work-order
```

Órdenes:

```text id="ge4qnl"
GET    /api/v1/tenant/maintenance-work-orders
POST   /api/v1/tenant/maintenance-work-orders
GET    /api/v1/tenant/maintenance-work-orders/{workOrderId}
PATCH  /api/v1/tenant/maintenance-work-orders/{workOrderId}
POST   /api/v1/tenant/maintenance-work-orders/{workOrderId}/assign
POST   /api/v1/tenant/maintenance-work-orders/{workOrderId}/schedule
POST   /api/v1/tenant/maintenance-work-orders/{workOrderId}/start
POST   /api/v1/tenant/maintenance-work-orders/{workOrderId}/pause
POST   /api/v1/tenant/maintenance-work-orders/{workOrderId}/complete
POST   /api/v1/tenant/maintenance-work-orders/{workOrderId}/close
POST   /api/v1/tenant/maintenance-work-orders/{workOrderId}/reopen
POST   /api/v1/tenant/maintenance-work-orders/{workOrderId}/cancel
POST   /api/v1/tenant/maintenance-work-orders/{workOrderId}/archive
```

Tareas, visitas y evidencias:

```text id="lemokn"
GET    /api/v1/tenant/maintenance-work-orders/{workOrderId}/tasks
POST   /api/v1/tenant/maintenance-work-orders/{workOrderId}/tasks
GET    /api/v1/tenant/maintenance-tasks/{taskId}
PATCH  /api/v1/tenant/maintenance-tasks/{taskId}
POST   /api/v1/tenant/maintenance-tasks/{taskId}/complete

GET    /api/v1/tenant/maintenance-work-orders/{workOrderId}/visits
POST   /api/v1/tenant/maintenance-work-orders/{workOrderId}/visits
GET    /api/v1/tenant/maintenance-visits/{visitId}
PATCH  /api/v1/tenant/maintenance-visits/{visitId}
POST   /api/v1/tenant/maintenance-visits/{visitId}/complete
POST   /api/v1/tenant/maintenance-visits/{visitId}/cancel

GET    /api/v1/tenant/maintenance-work-orders/{workOrderId}/evidence
POST   /api/v1/tenant/maintenance-work-orders/{workOrderId}/evidence
GET    /api/v1/tenant/maintenance-evidence/{evidenceId}
POST   /api/v1/tenant/maintenance-evidence/{evidenceId}/verify
POST   /api/v1/tenant/maintenance-evidence/{evidenceId}/reject
POST   /api/v1/tenant/maintenance-evidence/{evidenceId}/archive
```

Costos y proveedores:

```text id="zriwb6"
GET    /api/v1/tenant/maintenance-work-orders/{workOrderId}/costs
POST   /api/v1/tenant/maintenance-work-orders/{workOrderId}/costs
GET    /api/v1/tenant/maintenance-costs/{costEstimateId}
PATCH  /api/v1/tenant/maintenance-costs/{costEstimateId}
POST   /api/v1/tenant/maintenance-costs/{costEstimateId}/submit
POST   /api/v1/tenant/maintenance-costs/{costEstimateId}/approve
POST   /api/v1/tenant/maintenance-costs/{costEstimateId}/reject
POST   /api/v1/tenant/maintenance-costs/{costEstimateId}/cancel
POST   /api/v1/tenant/maintenance-costs/{costEstimateId}/convert-to-payable

GET    /api/v1/tenant/maintenance-work-orders/{workOrderId}/supplier-links
POST   /api/v1/tenant/maintenance-work-orders/{workOrderId}/supplier-links
POST   /api/v1/tenant/maintenance-supplier-links/{linkId}/unlink

GET    /api/v1/tenant/maintenance-work-orders/{workOrderId}/payable-links
```

Reportes:

```text id="rej8e9"
GET /api/v1/tenant/maintenance-reports/by-status
GET /api/v1/tenant/maintenance-reports/by-category
GET /api/v1/tenant/maintenance-reports/response-times
GET /api/v1/tenant/maintenance-reports/costs
GET /api/v1/tenant/maintenance-reports/by-supplier
GET /api/v1/tenant/maintenance-reports/export
```

---

### 19.4. `/me` API

```text id="xamkjn"
GET    /api/v1/me/maintenance-requests
POST   /api/v1/me/maintenance-requests
GET    /api/v1/me/maintenance-requests/{requestId}
POST   /api/v1/me/maintenance-requests/{requestId}/comments
POST   /api/v1/me/maintenance-requests/{requestId}/cancel
GET    /api/v1/me/maintenance-requests/{requestId}/evidence
POST   /api/v1/me/maintenance-requests/{requestId}/evidence
```

Limitaciones:

```text id="n558da"
- solo solicitudes propias;
- no reportes administrativos;
- no costos internos;
- no proveedor interno por defecto;
- no comentarios internos;
- no status history completo;
- no evidencias internas;
- no datos de otros residentes.
```

---

### 19.5. Public API

No se implementa.

Rutas prohibidas:

```text id="telkum"
GET  /api/v1/public/maintenance-requests
GET  /api/v1/public/maintenance-work-orders
GET  /api/v1/public/maintenance-evidence
GET  /api/v1/public/maintenance-reports
GET  /api/v1/public/tenants/{slug}/maintenance-requests
GET  /api/v1/public/tenants/{slug}/maintenance-work-orders
POST /api/v1/public/maintenance-requests
```

---

## 20. DTOs principales

### 20.1. Categorías

```text id="qodsgl"
CreateMaintenanceCategoryDto
UpdateMaintenanceCategoryDto
ArchiveMaintenanceCategoryDto
MaintenanceCategoryDto
MaintenanceCategoryListItemDto
MaintenanceCategoryFilterDto
```

---

### 20.2. Activos

```text id="klb0bx"
CreateMaintenanceAssetDto
UpdateMaintenanceAssetDto
ArchiveMaintenanceAssetDto
MaintenanceAssetDto
MaintenanceAssetListItemDto
MaintenanceAssetFilterDto
```

---

### 20.3. Solicitudes

```text id="zv9gl4"
CreateMaintenanceRequestDto
CreateOwnMaintenanceRequestDto
UpdateMaintenanceRequestDto
ReviewMaintenanceRequestDto
AcceptMaintenanceRequestDto
RejectMaintenanceRequestDto
CancelMaintenanceRequestDto
MarkDuplicateMaintenanceRequestDto
ConvertMaintenanceRequestToWorkOrderDto
MaintenanceRequestDto
OwnMaintenanceRequestDto
MaintenanceRequestListItemDto
MaintenanceRequestFilterDto
```

---

### 20.4. Órdenes

```text id="d2dzyf"
CreateMaintenanceWorkOrderDto
UpdateMaintenanceWorkOrderDto
AssignMaintenanceWorkOrderDto
ScheduleMaintenanceWorkOrderDto
StartMaintenanceWorkOrderDto
PauseMaintenanceWorkOrderDto
CompleteMaintenanceWorkOrderDto
CloseMaintenanceWorkOrderDto
ReopenMaintenanceWorkOrderDto
CancelMaintenanceWorkOrderDto
ArchiveMaintenanceWorkOrderDto
MaintenanceWorkOrderDto
MaintenanceWorkOrderListItemDto
MaintenanceWorkOrderFilterDto
```

---

### 20.5. Tareas, visitas y evidencias

```text id="ozhvho"
CreateMaintenanceTaskDto
UpdateMaintenanceTaskDto
CompleteMaintenanceTaskDto
MaintenanceTaskDto

CreateMaintenanceVisitDto
UpdateMaintenanceVisitDto
CompleteMaintenanceVisitDto
CancelMaintenanceVisitDto
MaintenanceVisitDto

CreateMaintenanceEvidenceDto
VerifyMaintenanceEvidenceDto
RejectMaintenanceEvidenceDto
ArchiveMaintenanceEvidenceDto
MaintenanceEvidenceDto
OwnMaintenanceEvidenceDto
```

---

### 20.6. Costos y proveedores

```text id="v4lw0f"
CreateMaintenanceCostEstimateDto
UpdateMaintenanceCostEstimateDto
SubmitMaintenanceCostEstimateDto
ApproveMaintenanceCostEstimateDto
RejectMaintenanceCostEstimateDto
CancelMaintenanceCostEstimateDto
ConvertMaintenanceCostToPayableDto
MaintenanceCostEstimateDto

CreateMaintenanceSupplierLinkDto
UnlinkMaintenanceSupplierDto
MaintenanceSupplierLinkDto

MaintenancePayableLinkDto
```

---

### 20.7. Comentarios

```text id="kg1at5"
CreateMaintenanceCommentDto
CreateOwnMaintenanceCommentDto
MaintenanceCommentDto
OwnMaintenanceCommentDto
```

---

## 21. Campos prohibidos en DTOs externos

Todo DTO externo debe rechazar:

```text id="iscfwl"
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
status directo salvo endpoint de transición
costApprovalStatus directo
actualCostAmount sin permiso
supplierPayableId fuera de endpoint controlado
storageKey
signedUrl
base64
raw file payload
journalEntryId
paymentOrderId
bankTransactionId
reconciliationMatchId
payment initiation fields
Open Banking payment initiation fields
external AI flags
```

---

## 22. Seguridad técnica

### 22.1. Guards

```text id="oa7b3r"
AuthGuard
TenantGuard
PermissionGuard
OwnMaintenanceRequestGuard
OwnMaintenanceEvidenceGuard
MaintenanceCategoryTenantGuard
MaintenanceAssetTenantGuard
MaintenanceRequestTenantGuard
MaintenanceWorkOrderTenantGuard
MaintenanceTaskTenantGuard
MaintenanceVisitTenantGuard
MaintenanceEvidenceTenantGuard
MaintenanceCostTenantGuard
MaintenanceSupplierLinkTenantGuard
MaintenancePayableLinkTenantGuard
```

---

### 22.2. Reglas de seguridad

```text id="ewjcbr"
- tenantId no se recibe desde cliente;
- actor se resuelve server-side;
- status se modifica solo por endpoints de transición;
- /me solo muestra recursos propios;
- comentarios internos no se exponen en /me;
- costos internos no se exponen en /me;
- proveedor interno no se expone en /me por defecto;
- storageKey nunca se expone;
- signedUrl persistente nunca se expone;
- archivos no viajan como base64;
- evidencias se descargan vía SDS;
- no endpoints públicos;
- no WordPress access;
- no IA externa con datos reales.
```

---

## 23. Auditoría

### 23.1. Eventos mínimos

```text id="u7h6z3"
maintenanceCategory.created
maintenanceCategory.updated
maintenanceCategory.archived

maintenanceAsset.created
maintenanceAsset.updated
maintenanceAsset.archived

maintenanceRequest.created
maintenanceRequest.submitted
maintenanceRequest.reviewed
maintenanceRequest.accepted
maintenanceRequest.rejected
maintenanceRequest.cancelled
maintenanceRequest.markedDuplicate
maintenanceRequest.convertedToWorkOrder
maintenanceRequest.archived

maintenanceWorkOrder.created
maintenanceWorkOrder.updated
maintenanceWorkOrder.assigned
maintenanceWorkOrder.scheduled
maintenanceWorkOrder.started
maintenanceWorkOrder.paused
maintenanceWorkOrder.resumed
maintenanceWorkOrder.completed
maintenanceWorkOrder.closed
maintenanceWorkOrder.reopened
maintenanceWorkOrder.cancelled
maintenanceWorkOrder.archived

maintenanceTask.created
maintenanceTask.updated
maintenanceTask.completed
maintenanceTask.archived

maintenanceVisit.created
maintenanceVisit.updated
maintenanceVisit.completed
maintenanceVisit.cancelled

maintenanceEvidence.created
maintenanceEvidence.verified
maintenanceEvidence.rejected
maintenanceEvidence.downloaded
maintenanceEvidence.archived

maintenanceCostEstimate.created
maintenanceCostEstimate.submitted
maintenanceCostEstimate.approved
maintenanceCostEstimate.rejected
maintenanceCostEstimate.cancelled
maintenanceCostEstimate.convertedToPayable

maintenanceSupplierLink.created
maintenanceSupplierLink.unlinked

maintenancePayableLink.created

maintenanceComment.created
maintenanceReport.generated
maintenanceReport.exported
```

---

### 23.2. Metadata permitida

```text id="g6xqyy"
requestId
requestNumber
workOrderId
workOrderNumber
categoryId
assetId
propertyUnitId
commonAreaId
priority
severity
fromStatus
toStatus
assignmentType
supplierId
costEstimateId
costType
amount
currency
secureDocumentId
supplierPayableId
outcome
traceId
```

---

### 23.3. Metadata prohibida

```text id="x24owo"
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
stack trace
SQL raw
```

---

## 24. Observabilidad

### 24.1. Logs

Eventos loggeables:

```text id="qm4hoo"
maintenanceRequest.submitted
maintenanceRequest.accepted
maintenanceRequest.rejected
maintenanceRequest.convertedToWorkOrder
maintenanceWorkOrder.created
maintenanceWorkOrder.assigned
maintenanceWorkOrder.started
maintenanceWorkOrder.completed
maintenanceWorkOrder.closed
maintenanceWorkOrder.reopened
maintenanceCostEstimate.approved
maintenanceCostEstimate.convertedToPayable
maintenanceEvidence.created
maintenanceReport.exported
```

Campos permitidos:

```text id="m95211"
traceId
requestId
correlationId
action
outcome
requestStatus
workOrderStatus
priority
severity
category
executionMode
workOrderType
durationMs
errorCode
```

Campos prohibidos:

```text id="ka44ys"
tenantId como label
userId como label
personId como label
propertyUnitId como label
supplierId como label
workOrderId como label
requestId como métrica label
secureDocumentId como label
traceId como métrica label
storageKey
signedUrl
base64
raw payload
stack trace productivo
```

---

### 24.2. Métricas

```text id="zaqiuj"
maintenance_requests_total
maintenance_requests_open_total
maintenance_requests_rejected_total
maintenance_work_orders_total
maintenance_work_orders_open_total
maintenance_work_orders_closed_total
maintenance_work_orders_reopened_total
maintenance_work_orders_overdue_total
maintenance_costs_approved_total
maintenance_costs_amount_approved
maintenance_evidence_uploaded_total
maintenance_reports_exported_total
```

Labels permitidos:

```text id="m71b97"
requestStatus
workOrderStatus
priority
severity
category
executionMode
workOrderType
outcome
```

---

## 25. Reportes técnicos MVP

### 25.1. Work orders by status

```text id="sh5xei"
Agrupa órdenes por estado, periodo, prioridad y severidad.
```

---

### 25.2. Work orders by category

```text id="b2ms8z"
Agrupa órdenes por categoría, tipo y modo de ejecución.
```

---

### 25.3. Response times

```text id="oemxov"
Calcula tiempos entre:
submitted -> accepted
accepted -> convertedToWorkOrder
open -> closed
```

---

### 25.4. Maintenance costs

```text id="d6w2ch"
Reporta estimatedAmount, approvedAmount y actualAmount referencial por periodo, categoría y proveedor.
```

---

### 25.5. Work orders by supplier

```text id="thg1i3"
Agrupa órdenes por supplierId, estado, periodo y costos aprobados.
```

---

### 25.6. Exports

```text id="nnmu4d"
Todos los exports deben generarse vía Secure Document Storage.
```

---

## 26. OpenAPI

### 26.1. Tags

```text id="nypv7h"
Maintenance Categories
Maintenance Assets
Maintenance Requests
Maintenance My Requests
Maintenance Work Orders
Maintenance Tasks
Maintenance Visits
Maintenance Evidence
Maintenance Costs
Maintenance Supplier Links
Maintenance Payable Links
Maintenance Comments
Maintenance Reports
```

---

### 26.2. Extensions

Aplicar extensiones:

```yaml id="mktdz1"
x-tenant-scope: true
x-auth-required: true
x-maintenance-work-orders: true
x-public-exposure: false
```

Para `/me`:

```yaml id="q8b4lp"
x-own-resource: true
x-internal-fields-excluded: true
```

Para evidencias:

```yaml id="c28w5p"
x-secure-document-storage: true
x-storage-key-exposed: false
```

Para costos:

```yaml id="fi9kl3"
x-decimal-money: true
x-payment-creation: false
x-bank-transfer-initiation: false
x-direct-accounting: false
```

Para integración con Supplier Payments:

```yaml id="j8wllp"
x-supplier-payments-linked: true
x-supplier-payment-order-created: false
x-supplier-payment-mark-paid: false
```

Restricciones:

```yaml id="aq3pj3"
x-public-endpoint: false
x-wordpress-access: false
x-external-ai-real-data: false
```

---

## 27. Estrategia de implementación

### 27.1. Fase 1 — Foundation

```text id="usmqsp"
1. Crear estructura del módulo.
2. Crear enums.
3. Crear configuración.
4. Crear feature flags.
5. Crear value objects.
6. Crear errores de dominio.
7. Crear policies base.
```

---

### 27.2. Fase 2 — Modelo de datos

```text id="fwialh"
1. Crear Prisma models.
2. Crear migración 022.
3. Crear índices.
4. Crear constraints.
5. Crear relaciones.
6. Crear seeds mínimos.
```

---

### 27.3. Fase 3 — Categorías y activos

```text id="v71261"
1. Implementar MaintenanceCategory.
2. Implementar MaintenanceAsset.
3. Implementar repositorios.
4. Implementar servicios.
5. Implementar controllers.
6. Implementar tests.
```

---

### 27.4. Fase 4 — Solicitudes

```text id="xdu1jp"
1. Implementar MaintenanceRequest.
2. Implementar MaintenanceRequestAttachment.
3. Implementar /tenant requests.
4. Implementar /me requests.
5. Implementar OwnResourceGuard.
6. Implementar evidencias iniciales.
7. Implementar review/accept/reject/cancel/duplicate.
```

---

### 27.5. Fase 5 — Órdenes de trabajo

```text id="lj71yg"
1. Implementar MaintenanceWorkOrder.
2. Implementar conversión request -> work order.
3. Implementar creación directa admin.
4. Implementar assign/schedule/start/pause/complete/close/reopen/cancel.
5. Implementar status history.
6. Implementar tests de state machine.
```

---

### 27.6. Fase 6 — Tareas, visitas y comentarios

```text id="l1of82"
1. Implementar tasks.
2. Implementar visits.
3. Implementar comments.
4. Implementar visibilidad internal/visibleToRequester.
5. Implementar notificaciones básicas.
```

---

### 27.7. Fase 7 — Evidencias y SDS

```text id="r6j69c"
1. Implementar MaintenanceEvidence.
2. Integrar Secure Document Storage.
3. Validar secureDocument tenant-scoped.
4. Implementar verify/reject/archive.
5. Implementar download availability.
6. Implementar tests de no storageKey.
```

---

### 27.8. Fase 8 — Costos y Supplier Payments

```text id="bd2216"
1. Implementar MaintenanceCostEstimate.
2. Implementar MaintenanceCostApproval.
3. Implementar MaintenanceSupplierLink.
4. Implementar MaintenancePayableLink.
5. Integrar Supplier Payments.
6. Implementar convert-to-payable.
7. Probar que no se crean pagos ni órdenes de pago.
```

---

### 27.9. Fase 9 — Reportes y exportaciones

```text id="c8gt8q"
1. Implementar by-status.
2. Implementar by-category.
3. Implementar response-times.
4. Implementar costs.
5. Implementar by-supplier.
6. Implementar export vía SDS.
```

---

### 27.10. Fase 10 — Auditoría, observabilidad y seguridad

```text id="kgumie"
1. Implementar audit events.
2. Implementar log sanitizer.
3. Implementar metrics.
4. Implementar OpenAPI.
5. Implementar security tests.
6. Implementar CI gates.
```

---

## 28. Feature flags

```text id="oiztg8"
maintenanceWorkOrders.enabled = true
maintenanceWorkOrders.meRequests.enabled = true
maintenanceWorkOrders.categories.enabled = true
maintenanceWorkOrders.assets.enabled = true
maintenanceWorkOrders.requestAttachments.enabled = true
maintenanceWorkOrders.workOrders.enabled = true
maintenanceWorkOrders.tasks.enabled = true
maintenanceWorkOrders.visits.enabled = true
maintenanceWorkOrders.evidence.enabled = true
maintenanceWorkOrders.costs.enabled = true
maintenanceWorkOrders.costApprovals.enabled = true
maintenanceWorkOrders.supplierLinks.enabled = true
maintenanceWorkOrders.payableLinks.enabled = true
maintenanceWorkOrders.notifications.enabled = true
maintenanceWorkOrders.reports.enabled = true
maintenanceWorkOrders.exports.enabled = true
maintenanceWorkOrders.publicEndpoints.enabled = false
maintenanceWorkOrders.wordpressAccess.enabled = false
maintenanceWorkOrders.directPayments.enabled = false
maintenanceWorkOrders.bankTransferInitiation.enabled = false
maintenanceWorkOrders.openBankingPaymentInitiation.enabled = false
maintenanceWorkOrders.directAccounting.enabled = false
maintenanceWorkOrders.externalAi.enabled = false
```

---

## 29. Variables de entorno recomendadas

```text id="m5enke"
MAINTENANCE_WORK_ORDERS_ENABLED=true
MAINTENANCE_ME_REQUESTS_ENABLED=true
MAINTENANCE_DEFAULT_CURRENCY=USD
MAINTENANCE_REQUIRE_EVIDENCE_FOR_CLOSE=true
MAINTENANCE_ALLOW_RESIDENT_REQUESTS=true
MAINTENANCE_ALLOW_RESIDENT_ATTACHMENTS=true
MAINTENANCE_ALLOW_RESIDENT_COMMENTS=true
MAINTENANCE_MAX_REPORT_PAGE_SIZE=100
MAINTENANCE_REPORT_EXPORT_ENABLED=true
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

Regla:

```text id="jok3pm"
El boot o CI debe fallar si una bandera prohibida se habilita en MVP sin ADR explícito.
```

---

## 30. Seeds iniciales

Categorías sugeridas:

```text id="bx415n"
PLUMBING — Plomería
ELECTRICAL — Electricidad
CLEANING — Limpieza
GARDENING — Jardinería
SECURITY_INFRA — Seguridad física
COMMON_AREAS — Áreas comunales
STRUCTURE — Infraestructura
LIGHTING — Iluminación
WATER_SYSTEMS — Bombas / cisterna / agua
ACCESS_CONTROL — Portones / accesos
OTHER — Otros
```

Prioridades por defecto:

```text id="qjtn8v"
PLUMBING: normal
ELECTRICAL: high
SECURITY_INFRA: high
WATER_SYSTEMS: urgent
COMMON_AREAS: normal
OTHER: normal
```

---

## 31. Errores de dominio

Catálogo preliminar:

```text id="to0px5"
MAINTENANCE_CATEGORY_NOT_FOUND
MAINTENANCE_CATEGORY_DUPLICATE_CODE
MAINTENANCE_CATEGORY_INVALID_STATUS

MAINTENANCE_ASSET_NOT_FOUND
MAINTENANCE_ASSET_DUPLICATE_CODE
MAINTENANCE_ASSET_INVALID_STATUS
MAINTENANCE_ASSET_CROSS_TENANT_REFERENCE

MAINTENANCE_REQUEST_NOT_FOUND
MAINTENANCE_REQUEST_INVALID_STATUS
MAINTENANCE_REQUEST_INVALID_TRANSITION
MAINTENANCE_REQUEST_OWNERSHIP_FORBIDDEN
MAINTENANCE_REQUEST_CROSS_TENANT_REFERENCE
MAINTENANCE_REQUEST_DUPLICATE_INVALID
MAINTENANCE_REQUEST_REJECTION_REASON_REQUIRED
MAINTENANCE_REQUEST_CANCEL_REASON_REQUIRED

MAINTENANCE_WORK_ORDER_NOT_FOUND
MAINTENANCE_WORK_ORDER_INVALID_STATUS
MAINTENANCE_WORK_ORDER_INVALID_TRANSITION
MAINTENANCE_WORK_ORDER_ASSIGNMENT_REQUIRED
MAINTENANCE_WORK_ORDER_CLOSE_EVIDENCE_REQUIRED
MAINTENANCE_WORK_ORDER_REOPEN_REASON_REQUIRED
MAINTENANCE_WORK_ORDER_CANCEL_REASON_REQUIRED
MAINTENANCE_WORK_ORDER_CROSS_TENANT_REFERENCE

MAINTENANCE_TASK_NOT_FOUND
MAINTENANCE_TASK_INVALID_STATUS
MAINTENANCE_TASK_CROSS_TENANT_REFERENCE

MAINTENANCE_VISIT_NOT_FOUND
MAINTENANCE_VISIT_INVALID_STATUS
MAINTENANCE_VISIT_CROSS_TENANT_REFERENCE

MAINTENANCE_EVIDENCE_NOT_FOUND
MAINTENANCE_EVIDENCE_INVALID_STATUS
MAINTENANCE_EVIDENCE_STORAGE_KEY_FORBIDDEN
MAINTENANCE_EVIDENCE_CROSS_TENANT_REFERENCE

MAINTENANCE_COST_NOT_FOUND
MAINTENANCE_COST_INVALID_STATUS
MAINTENANCE_COST_AMOUNT_INVALID
MAINTENANCE_COST_APPROVAL_REQUIRED
MAINTENANCE_COST_CROSS_TENANT_REFERENCE

MAINTENANCE_SUPPLIER_NOT_FOUND
MAINTENANCE_SUPPLIER_INVALID_STATUS
MAINTENANCE_SUPPLIER_BLOCKED
MAINTENANCE_SUPPLIER_CROSS_TENANT_REFERENCE

MAINTENANCE_PAYABLE_LINK_NOT_FOUND
MAINTENANCE_PAYABLE_LINK_DUPLICATE
MAINTENANCE_PAYABLE_CONVERSION_FORBIDDEN

MAINTENANCE_PUBLIC_ENDPOINT_FORBIDDEN
MAINTENANCE_WORDPRESS_ACCESS_FORBIDDEN
MAINTENANCE_DIRECT_PAYMENT_FORBIDDEN
MAINTENANCE_DIRECT_ACCOUNTING_FORBIDDEN
MAINTENANCE_EXTERNAL_AI_FORBIDDEN
```

---

## 32. Testing plan resumido

El test-plan detallado se desarrollará en:

```text id="kex14o"
docs/specs/022-maintenance-work-orders/test-plan.md
```

Cobertura mínima esperada:

```text id="yapaxd"
- Value objects.
- Entities.
- State machines.
- Domain policies.
- Repositories.
- Services.
- Integrations.
- API.
- /me own access.
- Authorization.
- Multitenancy.
- Security.
- Audit.
- Observability.
- OpenAPI.
- Reports.
- Exports.
- Regression.
- Smoke.
```

Tests críticos:

```text id="kfqj81"
- resident no crea request en unidad ajena;
- resident no ve request de otro residente;
- /me no expone comentarios internos;
- /me no expone costos internos;
- /me no expone proveedor interno por defecto;
- admin no accede cross-tenant;
- evidence no expone storageKey;
- close sin evidencia/justificación se rechaza;
- reopen sin reason se rechaza;
- costo negativo se rechaza;
- Maintenance no crea pagos;
- Maintenance no crea JournalEntry;
- Maintenance no inicia transferencia;
- endpoints públicos retornan 404;
- WordPress access bloqueado.
```

---

## 33. Performance

Objetivos iniciales:

```text id="r7srwo"
p95 < 800 ms para listar solicitudes paginadas.
p95 < 1000 ms para listar órdenes paginadas.
p95 < 1500 ms para reporte operativo básico.
p95 < 2000 ms para reporte de costos mensual típico.
```

Controles:

```text id="fydm9u"
- pageSize max 100;
- índices por tenant/status/category/priority/severity;
- índices por scheduledStartAt/closedAt;
- evitar N+1;
- DTOs list-item livianos;
- exports pesados vía job futuro si aplica.
```

---

## 34. Índices recomendados

```text id="pxys0y"
maintenance_categories:
  tenant_id, category_code unique active

maintenance_assets:
  tenant_id, asset_code unique active
  tenant_id, asset_type
  tenant_id, property_unit_id
  tenant_id, common_area_id

maintenance_requests:
  tenant_id, request_number unique
  tenant_id, status
  tenant_id, category_id
  tenant_id, property_unit_id
  tenant_id, reported_by_user_id
  tenant_id, created_at
  tenant_id, priority
  tenant_id, severity

maintenance_work_orders:
  tenant_id, work_order_number unique
  tenant_id, status
  tenant_id, category_id
  tenant_id, asset_id
  tenant_id, supplier_id
  tenant_id, assigned_internal_user_id
  tenant_id, scheduled_start_at
  tenant_id, closed_at
  tenant_id, priority
  tenant_id, severity

maintenance_tasks:
  tenant_id, work_order_id
  tenant_id, status
  tenant_id, assigned_user_id

maintenance_visits:
  tenant_id, work_order_id
  tenant_id, scheduled_at
  tenant_id, status

maintenance_evidence:
  tenant_id, work_order_id
  tenant_id, secure_document_id
  tenant_id, status
  tenant_id, evidence_stage

maintenance_cost_estimates:
  tenant_id, work_order_id
  tenant_id, supplier_id
  tenant_id, status
  tenant_id, approved_at

maintenance_supplier_links:
  tenant_id, work_order_id
  tenant_id, supplier_id
  tenant_id, status

maintenance_payable_links:
  tenant_id, work_order_id
  tenant_id, cost_estimate_id
  tenant_id, supplier_payable_id
```

---

## 35. Riesgos técnicos

| Riesgo                                             | Mitigación                                                |
| -------------------------------------------------- | --------------------------------------------------------- |
| Solicitudes duplicadas                             | `duplicateOfRequestId`, revisión administrativa, reportes |
| Residentes crean solicitudes sobre unidades ajenas | OwnResourceGuard + validación Person/Unit                 |
| Evidencia expuesta                                 | SDS + DTO seguro + auditoría de descarga                  |
| Comentarios internos expuestos                     | visibilidad + DTO separado para `/me`                     |
| Costos manipulados                                 | Decimal + permisos + approval workflow                    |
| Pago creado por error desde mantenimiento          | puerto limitado a Supplier Payments + tests               |
| Contabilidad directa accidental                    | NoDirectAccountingPolicy + CI gate                        |
| Reportes lentos                                    | índices + paginación + jobs futuros                       |
| Cierre sin evidencia                               | closure policy                                            |
| WordPress accede indebidamente                     | no public endpoints + CORS restrictivo                    |

---

## 36. Plan de PRs sugerido

```text id="kyt354"
PR-022-01 — Module skeleton, enums, constants and configuration.
PR-022-02 — Value objects, entities, state machines and policies.
PR-022-03 — Prisma schema, migration, constraints and indexes.
PR-022-04 — Repository ports and Prisma repositories.
PR-022-05 — Maintenance categories and assets.
PR-022-06 — Maintenance requests admin API.
PR-022-07 — Maintenance /me requests and own guards.
PR-022-08 — Request review and convert-to-work-order flow.
PR-022-09 — Work orders lifecycle.
PR-022-10 — Assignments, tasks and visits.
PR-022-11 — Evidence integration with Secure Document Storage.
PR-022-12 — Comments and requester-visible communication.
PR-022-13 — Costs and cost approvals.
PR-022-14 — Supplier links and payable conversion.
PR-022-15 — Notifications integration.
PR-022-16 — Reports and exports.
PR-022-17 — Audit, observability and OpenAPI.
PR-022-18 — Security hardening, regression tests and CI gates.
```

---

## 37. Smoke flow técnico

```text id="wlilce"
1. TenantAdmin crea categoría de mantenimiento.
2. TenantAdmin crea asset mantenible.
3. Resident crea solicitud propia desde /me.
4. Resident adjunta evidencia vía SDS.
5. MaintenanceManager revisa solicitud.
6. MaintenanceManager acepta solicitud.
7. MaintenanceManager convierte solicitud en work order.
8. MaintenanceManager asigna responsable interno.
9. MaintenanceManager programa work order.
10. Técnico inicia work order.
11. Técnico crea tarea.
12. Técnico registra visita.
13. Técnico adjunta evidencia de ejecución.
14. Técnico marca tarea como completada.
15. MaintenanceManager registra costo estimado.
16. FinancialManager aprueba costo.
17. MaintenanceManager completa work order.
18. MaintenanceManager cierra work order con evidencia.
19. Sistema notifica al solicitante.
20. Sistema genera reporte by-status.
21. Sistema exporta reporte vía SDS.
22. Sistema audita eventos críticos.
```

Flujo con proveedor:

```text id="v5tcxx"
1. MaintenanceManager crea work order externa.
2. MaintenanceManager vincula supplier active.
3. MaintenanceManager registra costo supplierService.
4. FinancialManager aprueba costo.
5. FinancialManager convierte costo aprobado a SupplierPayable.
6. Sistema crea MaintenancePayableLink.
7. Supplier Payments gobierna pago posterior.
8. Maintenance no crea SupplierPaymentOrder.
9. Maintenance no marca paid.
```

---

## 38. Definition of Done técnico

```text id="qomuzr"
[ ] spec.md aprobado.
[ ] plan.md aprobado.
[ ] data-model.md creado.
[ ] api-contract.md creado.
[ ] test-plan.md creado.
[ ] tasks.md creado.
[ ] security-notes.md creado.
[ ] Módulo NestJS registrado.
[ ] Enums implementados.
[ ] Configuración implementada.
[ ] Feature flags implementadas.
[ ] Value objects implementados.
[ ] Entidades implementadas.
[ ] State machines implementadas.
[ ] Policies implementadas.
[ ] Prisma schema implementado.
[ ] Migración implementada.
[ ] Repositorios implementados.
[ ] Categorías implementadas.
[ ] Activos implementados.
[ ] Solicitudes implementadas.
[ ] /me implementado con own access.
[ ] Órdenes implementadas.
[ ] Asignaciones implementadas.
[ ] Tareas implementadas.
[ ] Visitas implementadas.
[ ] Evidencias implementadas vía SDS.
[ ] Costos implementados.
[ ] Aprobaciones de costo implementadas.
[ ] Supplier links implementados.
[ ] Payable links implementados.
[ ] Comentarios implementados.
[ ] Status history implementado.
[ ] Notifications integradas.
[ ] Reportes implementados.
[ ] Exports implementados vía SDS.
[ ] Audit implementado.
[ ] Observability implementada.
[ ] OpenAPI implementado.
[ ] Tests unitarios pasan.
[ ] Tests API pasan.
[ ] Tests multitenancy pasan.
[ ] Tests /me pasan.
[ ] Tests security pasan.
[ ] Smoke test pasa.
[ ] CI pasa.
```

---

## 39. No aceptación técnica

No se acepta implementación si:

```text id="ubxe8q"
- permite maintenance request cross-tenant;
- permite maintenance work order cross-tenant;
- permite maintenance evidence cross-tenant;
- permite maintenance cost cross-tenant;
- permite supplier cross-tenant;
- permite propertyUnit cross-tenant;
- permite secureDocument cross-tenant;
- acepta tenantId desde body;
- acepta actor fields desde body;
- acepta status directo sin transición;
- expone storageKey;
- expone signedUrl persistente;
- expone base64 de archivo;
- resident ve solicitud de otro resident;
- resident crea solicitud sobre unidad ajena;
- /me expone comentarios internos;
- /me expone costos internos;
- /me expone proveedor interno sin permiso;
- permite cerrar orden sin evidencia ni justificación;
- permite reabrir sin razón;
- permite costos negativos;
- usa float/double para dinero;
- crea pagos desde mantenimiento;
- crea SupplierPaymentOrder;
- marca SupplierPaymentOrder como paid;
- inicia transferencia bancaria;
- inicia Open Banking payment;
- crea JournalEntry;
- edita JournalEntry;
- confirma Bank Reconciliation;
- crea endpoints públicos;
- permite acceso desde WordPress público;
- envía datos reales a IA externa;
- omite auditoría crítica.
```

---

## 40. Resultado esperado

Al implementar este plan, el módulo `022-maintenance-work-orders` debe quedar preparado para construir la funcionalidad operativa de mantenimiento de RESIDENT Core con límites claros frente a pagos, contabilidad, documentos, comunicaciones y accesos de residentes.

Resultado esperado:

```text id="lmzqee"
module foundation definida
estructura NestJS definida
entidades definidas
state machines definidas
modelo de datos planificado
API tenant planificada
API /me planificada
public API prohibida
integración SDS planificada
integración Supplier Payments planificada
notificaciones planificadas
auditoría planificada
observabilidad planificada
reportes planificados
exports planificados
seguridad planificada
feature flags definidos
variables de entorno definidas
PRs sugeridos definidos
smoke flow definido
DoD definido
```

---

## 41. Expediente actualizado

```text id="h6anh0"
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
│   │       └── plan.md
```
