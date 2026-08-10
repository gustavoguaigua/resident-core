# Tasks — 022 Maintenance Work Orders

## 1. Información del documento

| Campo           | Valor                                                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Proyecto        | RESIDENT Core                                                                                                                  |
| Spec ID         | 022                                                                                                                            |
| Módulo          | Maintenance Work Orders                                                                                                        |
| Documento       | Tasks                                                                                                                          |
| Ruta            | `docs/specs/022-maintenance-work-orders/tasks.md`                                                                              |
| Versión         | 0.1                                                                                                                            |
| Estado          | needs-review                                                                                                                   |
| Fecha           | 2026-07-23                                                                                                                     |
| Documento base  | `docs/specs/022-maintenance-work-orders/spec.md`                                                                               |
| Plan técnico    | `docs/specs/022-maintenance-work-orders/plan.md`                                                                               |
| Modelo de datos | `docs/specs/022-maintenance-work-orders/data-model.md`                                                                         |
| Contrato API    | `docs/specs/022-maintenance-work-orders/api-contract.md`                                                                       |
| Plan de pruebas | `docs/specs/022-maintenance-work-orders/test-plan.md`                                                                          |
| Stack objetivo  | NestJS / TypeScript / PostgreSQL / Prisma / OpenAPI / Keycloak                                                                 |
| Naturaleza      | Tenant-scoped / Operational / Request-driven / Work-order-driven / Evidence-backed / Supplier-aware / Cost-aware / Audit-heavy |

---

## 2. Propósito

Este documento define el backlog técnico inicial para implementar el módulo `022-maintenance-work-orders`.

El objetivo es transformar la especificación funcional, el plan técnico, el modelo de datos, el contrato API y el plan de pruebas en tareas implementables.

Regla central del backlog:

```text id="hclj00"
Cada tarea de Maintenance Work Orders debe preservar tenant isolation, seguridad /me, control de permisos, evidencia vía Secure Document Storage, costos con Decimal, auditoría obligatoria, límites con Supplier Payments, ausencia de pagos directos, ausencia de contabilidad directa, ausencia de endpoints públicos, ausencia de acceso desde WordPress público y ausencia de IA externa con datos reales.
```

---

## 3. Convenciones del backlog

### 3.1. Formato

Cada tarea se expresa como checkbox Markdown:

```text id="ospvg3"
- [ ] Tarea pendiente.
- [x] Tarea completada.
```

---

### 3.2. Criterio de avance

Una tarea solo debe marcarse como completada cuando:

```text id="qift3j"
- el código está implementado;
- los tests relacionados pasan;
- OpenAPI queda actualizado si aplica;
- audit/logging queda implementado si aplica;
- no se rompe tenant isolation;
- no se rompe seguridad /me;
- no se exponen campos prohibidos;
- el comportamiento cumple spec.md, plan.md, data-model.md, api-contract.md y test-plan.md.
```

---

### 3.3. Orden recomendado

El orden recomendado de ejecución es:

```text id="o0rq0x"
1. Foundation.
2. Modelo de datos.
3. Repositorios.
4. Categorías y activos.
5. Solicitudes administrativas.
6. Solicitudes /me.
7. Órdenes de trabajo.
8. Tareas, visitas y comentarios.
9. Evidencias y SDS.
10. Costos.
11. Supplier Payments integration.
12. Reportes y exportaciones.
13. Auditoría y observabilidad.
14. OpenAPI.
15. Tests.
16. Seguridad y hardening.
17. Smoke flow.
```

---

## 4. Épicas

```text id="qgs5gd"
EPIC-022-01 — Module foundation.
EPIC-022-02 — Database and Prisma model.
EPIC-022-03 — Domain model, value objects and policies.
EPIC-022-04 — Maintenance categories and assets.
EPIC-022-05 — Maintenance requests admin API.
EPIC-022-06 — Maintenance requests /me API.
EPIC-022-07 — Maintenance work orders lifecycle.
EPIC-022-08 — Tasks, visits and comments.
EPIC-022-09 — Evidence and Secure Document Storage.
EPIC-022-10 — Costs and approvals.
EPIC-022-11 — Supplier links and payable conversion.
EPIC-022-12 — Reports and exports.
EPIC-022-13 — Audit and observability.
EPIC-022-14 — OpenAPI and API contract.
EPIC-022-15 — Testing and CI gates.
EPIC-022-16 — Security hardening.
```

---

# EPIC-022-01 — Module foundation

## 5. Estructura base del módulo

```text id="xwylib"
apps/api/src/modules/maintenance-work-orders/
```

Tareas:

```text id="fx8xss"
- [ ] Crear carpeta `apps/api/src/modules/maintenance-work-orders/`.
- [ ] Crear `maintenance-work-orders.module.ts`.
- [ ] Registrar `MaintenanceWorkOrdersModule` en el módulo principal de la API.
- [ ] Crear carpeta `controllers/`.
- [ ] Crear carpeta `application/services/`.
- [ ] Crear carpeta `application/use-cases/`.
- [ ] Crear carpeta `application/ports/`.
- [ ] Crear carpeta `domain/entities/`.
- [ ] Crear carpeta `domain/value-objects/`.
- [ ] Crear carpeta `domain/events/`.
- [ ] Crear carpeta `domain/policies/`.
- [ ] Crear carpeta `domain/errors/`.
- [ ] Crear carpeta `infrastructure/persistence/`.
- [ ] Crear carpeta `infrastructure/documents/`.
- [ ] Crear carpeta `infrastructure/notifications/`.
- [ ] Crear carpeta `infrastructure/supplier-payments/`.
- [ ] Crear carpeta `infrastructure/reports/`.
- [ ] Crear carpeta `infrastructure/exports/`.
- [ ] Crear carpeta `infrastructure/audit/`.
- [ ] Crear carpeta `infrastructure/observability/`.
- [ ] Crear carpeta `dto/`.
- [ ] Crear carpeta `guards/`.
- [ ] Crear carpeta `mappers/`.
- [ ] Crear carpeta `tests/`.
```

---

## 6. Configuración y feature flags

Tareas:

```text id="rlyrtq"
- [ ] Crear configuración `MaintenanceWorkOrdersConfig`.
- [ ] Agregar `MAINTENANCE_WORK_ORDERS_ENABLED`.
- [ ] Agregar `MAINTENANCE_ME_REQUESTS_ENABLED`.
- [ ] Agregar `MAINTENANCE_DEFAULT_CURRENCY=USD`.
- [ ] Agregar `MAINTENANCE_REQUIRE_EVIDENCE_FOR_CLOSE=true`.
- [ ] Agregar `MAINTENANCE_ALLOW_RESIDENT_REQUESTS=true`.
- [ ] Agregar `MAINTENANCE_ALLOW_RESIDENT_ATTACHMENTS=true`.
- [ ] Agregar `MAINTENANCE_ALLOW_RESIDENT_COMMENTS=true`.
- [ ] Agregar `MAINTENANCE_MAX_REPORT_PAGE_SIZE=100`.
- [ ] Agregar `MAINTENANCE_REPORT_EXPORT_ENABLED=true`.
- [ ] Agregar `MAINTENANCE_SUPPLIER_PAYMENTS_INTEGRATION_ENABLED=true`.
- [ ] Agregar `MAINTENANCE_NOTIFICATIONS_ENABLED=true`.
- [ ] Agregar `MAINTENANCE_PUBLIC_ENDPOINTS_ENABLED=false`.
- [ ] Agregar `MAINTENANCE_WORDPRESS_ACCESS_ENABLED=false`.
- [ ] Agregar `MAINTENANCE_DIRECT_PAYMENTS_ENABLED=false`.
- [ ] Agregar `MAINTENANCE_BANK_TRANSFER_INITIATION_ENABLED=false`.
- [ ] Agregar `MAINTENANCE_OPEN_BANKING_PAYMENT_INITIATION_ENABLED=false`.
- [ ] Agregar `MAINTENANCE_DIRECT_ACCOUNTING_ENABLED=false`.
- [ ] Agregar `MAINTENANCE_EXTERNAL_AI_ENABLED=false`.
- [ ] Implementar validación de boot para fallar si flags prohibidas están activadas en MVP.
- [ ] Agregar tests de configuración segura.
```

---

## 7. Constantes y enums TypeScript

Tareas:

```text id="ydlui9"
- [ ] Crear enum `MaintenanceCategoryStatus`.
- [ ] Crear enum `MaintenanceAssetType`.
- [ ] Crear enum `MaintenanceAssetStatus`.
- [ ] Crear enum `MaintenanceAssetCriticality`.
- [ ] Crear enum `MaintenanceRequestSource`.
- [ ] Crear enum `MaintenanceRequestVisibility`.
- [ ] Crear enum `MaintenanceRequestStatus`.
- [ ] Crear enum `MaintenancePriority`.
- [ ] Crear enum `MaintenanceSeverity`.
- [ ] Crear enum `MaintenanceAttachmentType`.
- [ ] Crear enum `MaintenanceAttachmentStatus`.
- [ ] Crear enum `MaintenanceWorkOrderType`.
- [ ] Crear enum `MaintenanceExecutionMode`.
- [ ] Crear enum `MaintenanceWorkOrderStatus`.
- [ ] Crear enum `MaintenanceAssignmentType`.
- [ ] Crear enum `MaintenanceAssignmentStatus`.
- [ ] Crear enum `MaintenanceTaskStatus`.
- [ ] Crear enum `MaintenanceVisitType`.
- [ ] Crear enum `MaintenanceVisitStatus`.
- [ ] Crear enum `MaintenanceVisitAccessResult`.
- [ ] Crear enum `MaintenanceEvidenceType`.
- [ ] Crear enum `MaintenanceEvidenceStage`.
- [ ] Crear enum `MaintenanceEvidenceVisibility`.
- [ ] Crear enum `MaintenanceEvidenceStatus`.
- [ ] Crear enum `MaintenanceCostType`.
- [ ] Crear enum `MaintenanceCostEstimateStatus`.
- [ ] Crear enum `MaintenanceCostApprovalStatus`.
- [ ] Crear enum `MaintenanceSupplierLinkType`.
- [ ] Crear enum `MaintenanceSupplierLinkStatus`.
- [ ] Crear enum `MaintenancePayableLinkStatus`.
- [ ] Crear enum `MaintenanceCommentVisibility`.
- [ ] Crear enum `MaintenanceStatusHistoryEntityType`.
- [ ] Validar que todos los enums se expongan en API como strings camelCase.
```

---

# EPIC-022-02 — Database and Prisma model

## 8. Prisma enums

Tareas:

```text id="ty2a5o"
- [ ] Agregar Prisma enum `MaintenanceCategoryStatus`.
- [ ] Agregar Prisma enum `MaintenanceAssetType`.
- [ ] Agregar Prisma enum `MaintenanceAssetStatus`.
- [ ] Agregar Prisma enum `MaintenanceAssetCriticality`.
- [ ] Agregar Prisma enum `MaintenanceRequestSource`.
- [ ] Agregar Prisma enum `MaintenanceRequestVisibility`.
- [ ] Agregar Prisma enum `MaintenanceRequestStatus`.
- [ ] Agregar Prisma enum `MaintenancePriority`.
- [ ] Agregar Prisma enum `MaintenanceSeverity`.
- [ ] Agregar Prisma enum `MaintenanceAttachmentType`.
- [ ] Agregar Prisma enum `MaintenanceAttachmentStatus`.
- [ ] Agregar Prisma enum `MaintenanceWorkOrderType`.
- [ ] Agregar Prisma enum `MaintenanceExecutionMode`.
- [ ] Agregar Prisma enum `MaintenanceWorkOrderStatus`.
- [ ] Agregar Prisma enum `MaintenanceAssignmentType`.
- [ ] Agregar Prisma enum `MaintenanceAssignmentStatus`.
- [ ] Agregar Prisma enum `MaintenanceTaskStatus`.
- [ ] Agregar Prisma enum `MaintenanceVisitType`.
- [ ] Agregar Prisma enum `MaintenanceVisitStatus`.
- [ ] Agregar Prisma enum `MaintenanceVisitAccessResult`.
- [ ] Agregar Prisma enum `MaintenanceEvidenceType`.
- [ ] Agregar Prisma enum `MaintenanceEvidenceStage`.
- [ ] Agregar Prisma enum `MaintenanceEvidenceVisibility`.
- [ ] Agregar Prisma enum `MaintenanceEvidenceStatus`.
- [ ] Agregar Prisma enum `MaintenanceCostType`.
- [ ] Agregar Prisma enum `MaintenanceCostEstimateStatus`.
- [ ] Agregar Prisma enum `MaintenanceCostApprovalStatus`.
- [ ] Agregar Prisma enum `MaintenanceSupplierLinkType`.
- [ ] Agregar Prisma enum `MaintenanceSupplierLinkStatus`.
- [ ] Agregar Prisma enum `MaintenancePayableLinkStatus`.
- [ ] Agregar Prisma enum `MaintenanceCommentVisibility`.
- [ ] Agregar Prisma enum `MaintenanceStatusHistoryEntityType`.
```

---

## 9. Prisma models

Tareas:

```text id="k6jlml"
- [ ] Crear modelo `MaintenanceCategory`.
- [ ] Crear modelo `MaintenanceAsset`.
- [ ] Crear modelo `MaintenanceRequest`.
- [ ] Crear modelo `MaintenanceRequestAttachment`.
- [ ] Crear modelo `MaintenanceWorkOrder`.
- [ ] Crear modelo `MaintenanceWorkOrderAssignment`.
- [ ] Crear modelo `MaintenanceWorkOrderTask`.
- [ ] Crear modelo `MaintenanceVisit`.
- [ ] Crear modelo `MaintenanceEvidence`.
- [ ] Crear modelo `MaintenanceCostEstimate`.
- [ ] Crear modelo `MaintenanceCostApproval`.
- [ ] Crear modelo `MaintenanceSupplierLink`.
- [ ] Crear modelo `MaintenancePayableLink`.
- [ ] Crear modelo `MaintenanceComment`.
- [ ] Crear modelo `MaintenanceStatusHistory`.
- [ ] Agregar relaciones correspondientes en `Tenant`.
- [ ] Validar que todas las tablas operativas incluyan `tenantId`.
- [ ] Validar que todas las entidades archivables incluyan `archivedAt`.
- [ ] Validar que las entidades críticas incluyan campos de actor server-side.
- [ ] Validar que todos los montos usen `Decimal(12,2)`.
- [ ] Ejecutar `prisma format`.
- [ ] Ejecutar `prisma generate`.
```

---

## 10. Migración 022

Nombre recomendado:

```text id="fco386"
022_create_maintenance_work_orders
```

Tareas:

```text id="vvcnwj"
- [ ] Crear migración `022_create_maintenance_work_orders`.
- [ ] Crear tabla `maintenance_categories`.
- [ ] Crear tabla `maintenance_assets`.
- [ ] Crear tabla `maintenance_requests`.
- [ ] Crear tabla `maintenance_request_attachments`.
- [ ] Crear tabla `maintenance_work_orders`.
- [ ] Crear tabla `maintenance_work_order_assignments`.
- [ ] Crear tabla `maintenance_work_order_tasks`.
- [ ] Crear tabla `maintenance_visits`.
- [ ] Crear tabla `maintenance_evidence`.
- [ ] Crear tabla `maintenance_cost_estimates`.
- [ ] Crear tabla `maintenance_cost_approvals`.
- [ ] Crear tabla `maintenance_supplier_links`.
- [ ] Crear tabla `maintenance_payable_links`.
- [ ] Crear tabla `maintenance_comments`.
- [ ] Crear tabla `maintenance_status_history`.
- [ ] Agregar foreign keys internas.
- [ ] Agregar índices tenant-scoped.
- [ ] Agregar índices únicos parciales.
- [ ] Agregar constraints de montos no negativos.
- [ ] Agregar constraints de estados críticos.
- [ ] Agregar constraints de comentarios vinculados.
- [ ] Agregar constraints de asignaciones.
- [ ] Ejecutar migración en base local.
- [ ] Ejecutar migración en base test.
```

---

## 11. Índices

Tareas:

```text id="jy938p"
- [ ] Crear índice único parcial `uq_maintenance_categories_tenant_code_active`.
- [ ] Crear índice único parcial `uq_maintenance_assets_tenant_code_active`.
- [ ] Crear índice único `uq_maintenance_requests_tenant_number`.
- [ ] Crear índice único `uq_maintenance_work_orders_tenant_number`.
- [ ] Crear índice único `uq_maintenance_tasks_work_order_task_number`.
- [ ] Crear índice único parcial `uq_maintenance_payable_links_active_cost`.
- [ ] Crear índices por `tenant_id, status` en solicitudes.
- [ ] Crear índices por `tenant_id, status` en órdenes.
- [ ] Crear índices por `tenant_id, category_id`.
- [ ] Crear índices por `tenant_id, asset_id`.
- [ ] Crear índices por `tenant_id, property_unit_id`.
- [ ] Crear índices por `tenant_id, common_area_id`.
- [ ] Crear índices por `tenant_id, supplier_id`.
- [ ] Crear índices por `tenant_id, assigned_internal_user_id`.
- [ ] Crear índices por fechas `created_at`, `scheduled_start_at`, `closed_at`.
- [ ] Crear índice para `maintenance_status_history (tenant_id, entity_type, entity_id)`.
```

---

## 12. Seeds

Tareas:

```text id="b8p5lu"
- [ ] Crear seed de categorías demo.
- [ ] Crear categoría `PLUMBING`.
- [ ] Crear categoría `ELECTRICAL`.
- [ ] Crear categoría `CLEANING`.
- [ ] Crear categoría `GARDENING`.
- [ ] Crear categoría `SECURITY_INFRA`.
- [ ] Crear categoría `COMMON_AREAS`.
- [ ] Crear categoría `STRUCTURE`.
- [ ] Crear categoría `LIGHTING`.
- [ ] Crear categoría `WATER_SYSTEMS`.
- [ ] Crear categoría `ACCESS_CONTROL`.
- [ ] Crear categoría `OTHER`.
- [ ] Crear seed de activos demo.
- [ ] Crear activo `GATE_VEHICLE`.
- [ ] Crear activo `GATE_PEDESTRIAN`.
- [ ] Crear activo `GUARDHOUSE`.
- [ ] Crear activo `COURT_MAIN`.
- [ ] Crear activo `PLAYGROUND`.
- [ ] Crear activo `WATER_PUMP_MAIN`.
- [ ] Crear activo `CISTERN_MAIN`.
- [ ] Crear activo `LIGHTING_COMMON`.
- [ ] Crear activo `GARDENS`.
- [ ] Crear activo `COMMUNAL_HALL`.
- [ ] Garantizar que seeds usen datos ficticios.
- [ ] Garantizar que seeds no incluyan documentos, fotos, nombres reales ni proveedores reales.
```

---

# EPIC-022-03 — Domain model, value objects and policies

## 13. Value objects

Tareas:

```text id="qzliq2"
- [ ] Implementar `MaintenanceCategoryCode`.
- [ ] Implementar `MaintenanceCategoryName`.
- [ ] Implementar `MaintenanceAssetCode`.
- [ ] Implementar `MaintenanceAssetName`.
- [ ] Implementar `MaintenanceRequestNumber`.
- [ ] Implementar `MaintenanceWorkOrderNumber`.
- [ ] Implementar `MaintenanceTitle`.
- [ ] Implementar `MaintenanceDescription`.
- [ ] Implementar `MaintenancePriorityValue`.
- [ ] Implementar `MaintenanceSeverityValue`.
- [ ] Implementar `MaintenanceStatusValue`.
- [ ] Implementar `MaintenanceCommentBody`.
- [ ] Implementar `MaintenanceLocationDescription`.
- [ ] Implementar `MaintenanceCostAmount`.
- [ ] Implementar `MaintenanceCurrency`.
- [ ] Implementar `MaintenanceClosureSummary`.
- [ ] Implementar `MaintenanceReason`.
- [ ] Implementar `MaintenanceDocumentReference`.
- [ ] Implementar `MaintenanceReportPeriod`.
- [ ] Agregar sanitización básica de texto para título, descripción, comentario y razón.
- [ ] Agregar validación de Decimal string para montos.
- [ ] Agregar rechazo de `number`, `float`, `double`.
```

---

## 14. Domain entities

Tareas:

```text id="zv5x95"
- [ ] Implementar entidad `MaintenanceCategory`.
- [ ] Implementar entidad `MaintenanceAsset`.
- [ ] Implementar entidad `MaintenanceRequest`.
- [ ] Implementar entidad `MaintenanceRequestAttachment`.
- [ ] Implementar entidad `MaintenanceWorkOrder`.
- [ ] Implementar entidad `MaintenanceWorkOrderAssignment`.
- [ ] Implementar entidad `MaintenanceWorkOrderTask`.
- [ ] Implementar entidad `MaintenanceVisit`.
- [ ] Implementar entidad `MaintenanceEvidence`.
- [ ] Implementar entidad `MaintenanceCostEstimate`.
- [ ] Implementar entidad `MaintenanceCostApproval`.
- [ ] Implementar entidad `MaintenanceSupplierLink`.
- [ ] Implementar entidad `MaintenancePayableLink`.
- [ ] Implementar entidad `MaintenanceComment`.
- [ ] Implementar entidad `MaintenanceStatusHistory`.
```

---

## 15. State machines

Tareas:

```text id="w7r8fy"
- [ ] Implementar state machine de `MaintenanceRequest`.
- [ ] Implementar transición `draft -> submitted`.
- [ ] Implementar transición `submitted -> underReview`.
- [ ] Implementar transición `submitted -> cancelled`.
- [ ] Implementar transición `underReview -> accepted`.
- [ ] Implementar transición `underReview -> rejected`.
- [ ] Implementar transición `accepted -> convertedToWorkOrder`.
- [ ] Implementar transición `accepted -> closed`.
- [ ] Implementar transición `rejected -> archived`.
- [ ] Implementar transición `cancelled -> archived`.
- [ ] Implementar transición `closed -> archived`.
- [ ] Implementar state machine de `MaintenanceWorkOrder`.
- [ ] Implementar transición `draft -> open`.
- [ ] Implementar transición `open -> pendingAssignment`.
- [ ] Implementar transición `open -> assigned`.
- [ ] Implementar transición `assigned -> scheduled`.
- [ ] Implementar transición `scheduled -> inProgress`.
- [ ] Implementar transición `inProgress -> onHold`.
- [ ] Implementar transición `onHold -> inProgress`.
- [ ] Implementar transición `inProgress -> completed`.
- [ ] Implementar transición `completed -> pendingResidentConfirmation`.
- [ ] Implementar transición `completed -> closed`.
- [ ] Implementar transición `closed -> reopened`.
- [ ] Implementar transición `reopened -> inProgress`.
- [ ] Implementar transición a `cancelled`.
- [ ] Implementar transición a `archived`.
- [ ] Implementar state machine de `MaintenanceCostEstimate`.
- [ ] Implementar state machine de `MaintenanceEvidence`.
- [ ] Agregar tests unitarios de transiciones válidas.
- [ ] Agregar tests unitarios de transiciones inválidas.
```

---

## 16. Policies

Tareas:

```text id="nzwp50"
- [ ] Implementar `MaintenanceTenantPolicy`.
- [ ] Implementar `MaintenanceOwnResourcePolicy`.
- [ ] Implementar `MaintenanceRequestSubmissionPolicy`.
- [ ] Implementar `MaintenanceRequestReviewPolicy`.
- [ ] Implementar `MaintenanceRequestDuplicatePolicy`.
- [ ] Implementar `MaintenanceWorkOrderCreationPolicy`.
- [ ] Implementar `MaintenanceWorkOrderAssignmentPolicy`.
- [ ] Implementar `MaintenanceWorkOrderStatePolicy`.
- [ ] Implementar `MaintenanceWorkOrderClosurePolicy`.
- [ ] Implementar `MaintenanceWorkOrderReopenPolicy`.
- [ ] Implementar `MaintenanceEvidencePolicy`.
- [ ] Implementar `MaintenanceCostPolicy`.
- [ ] Implementar `MaintenanceCostApprovalPolicy`.
- [ ] Implementar `MaintenanceSupplierLinkPolicy`.
- [ ] Implementar `MaintenancePayableConversionPolicy`.
- [ ] Implementar `MaintenanceCommentVisibilityPolicy`.
- [ ] Implementar `MaintenanceReportPolicy`.
- [ ] Implementar `NoPublicMaintenanceEndpointPolicy`.
- [ ] Implementar `NoWordPressMaintenanceAccessPolicy`.
- [ ] Implementar `NoDirectPaymentPolicy`.
- [ ] Implementar `NoDirectAccountingPolicy`.
- [ ] Implementar `NoExternalAiMaintenanceDataPolicy`.
```

---

## 17. Domain errors

Tareas:

```text id="kqhzfi"
- [ ] Crear error `MAINTENANCE_CATEGORY_NOT_FOUND`.
- [ ] Crear error `MAINTENANCE_CATEGORY_DUPLICATE_CODE`.
- [ ] Crear error `MAINTENANCE_CATEGORY_INVALID_STATUS`.
- [ ] Crear error `MAINTENANCE_ASSET_NOT_FOUND`.
- [ ] Crear error `MAINTENANCE_ASSET_DUPLICATE_CODE`.
- [ ] Crear error `MAINTENANCE_ASSET_INVALID_STATUS`.
- [ ] Crear error `MAINTENANCE_ASSET_CROSS_TENANT_REFERENCE`.
- [ ] Crear error `MAINTENANCE_REQUEST_NOT_FOUND`.
- [ ] Crear error `MAINTENANCE_REQUEST_INVALID_STATUS`.
- [ ] Crear error `MAINTENANCE_REQUEST_INVALID_TRANSITION`.
- [ ] Crear error `MAINTENANCE_REQUEST_OWNERSHIP_FORBIDDEN`.
- [ ] Crear error `MAINTENANCE_REQUEST_CROSS_TENANT_REFERENCE`.
- [ ] Crear error `MAINTENANCE_REQUEST_DUPLICATE_INVALID`.
- [ ] Crear error `MAINTENANCE_REQUEST_REJECTION_REASON_REQUIRED`.
- [ ] Crear error `MAINTENANCE_REQUEST_CANCEL_REASON_REQUIRED`.
- [ ] Crear error `MAINTENANCE_WORK_ORDER_NOT_FOUND`.
- [ ] Crear error `MAINTENANCE_WORK_ORDER_INVALID_STATUS`.
- [ ] Crear error `MAINTENANCE_WORK_ORDER_INVALID_TRANSITION`.
- [ ] Crear error `MAINTENANCE_WORK_ORDER_ASSIGNMENT_REQUIRED`.
- [ ] Crear error `MAINTENANCE_WORK_ORDER_CLOSE_EVIDENCE_REQUIRED`.
- [ ] Crear error `MAINTENANCE_WORK_ORDER_REOPEN_REASON_REQUIRED`.
- [ ] Crear error `MAINTENANCE_WORK_ORDER_CANCEL_REASON_REQUIRED`.
- [ ] Crear error `MAINTENANCE_WORK_ORDER_CROSS_TENANT_REFERENCE`.
- [ ] Crear error `MAINTENANCE_TASK_NOT_FOUND`.
- [ ] Crear error `MAINTENANCE_VISIT_NOT_FOUND`.
- [ ] Crear error `MAINTENANCE_EVIDENCE_NOT_FOUND`.
- [ ] Crear error `MAINTENANCE_EVIDENCE_STORAGE_KEY_FORBIDDEN`.
- [ ] Crear error `MAINTENANCE_COST_NOT_FOUND`.
- [ ] Crear error `MAINTENANCE_COST_AMOUNT_INVALID`.
- [ ] Crear error `MAINTENANCE_SUPPLIER_BLOCKED`.
- [ ] Crear error `MAINTENANCE_PAYABLE_LINK_DUPLICATE`.
- [ ] Crear error `MAINTENANCE_DIRECT_PAYMENT_FORBIDDEN`.
- [ ] Crear error `MAINTENANCE_DIRECT_ACCOUNTING_FORBIDDEN`.
- [ ] Crear error `MAINTENANCE_PUBLIC_ENDPOINT_FORBIDDEN`.
- [ ] Crear error `MAINTENANCE_WORDPRESS_ACCESS_FORBIDDEN`.
- [ ] Crear error `MAINTENANCE_EXTERNAL_AI_FORBIDDEN`.
```

---

# EPIC-022-04 — Repository ports and persistence

## 18. Repository ports

Tareas:

```text id="n3buk9"
- [ ] Crear `MaintenanceCategoryRepositoryPort`.
- [ ] Crear `MaintenanceAssetRepositoryPort`.
- [ ] Crear `MaintenanceRequestRepositoryPort`.
- [ ] Crear `MaintenanceRequestAttachmentRepositoryPort`.
- [ ] Crear `MaintenanceWorkOrderRepositoryPort`.
- [ ] Crear `MaintenanceWorkOrderAssignmentRepositoryPort`.
- [ ] Crear `MaintenanceWorkOrderTaskRepositoryPort`.
- [ ] Crear `MaintenanceVisitRepositoryPort`.
- [ ] Crear `MaintenanceEvidenceRepositoryPort`.
- [ ] Crear `MaintenanceCostRepositoryPort`.
- [ ] Crear `MaintenanceCostApprovalRepositoryPort`.
- [ ] Crear `MaintenanceSupplierLinkRepositoryPort`.
- [ ] Crear `MaintenancePayableLinkRepositoryPort`.
- [ ] Crear `MaintenanceCommentRepositoryPort`.
- [ ] Crear `MaintenanceStatusHistoryRepositoryPort`.
```

---

## 19. Prisma repositories

Tareas:

```text id="mcshz2"
- [ ] Implementar `PrismaMaintenanceCategoryRepository`.
- [ ] Implementar `PrismaMaintenanceAssetRepository`.
- [ ] Implementar `PrismaMaintenanceRequestRepository`.
- [ ] Implementar `PrismaMaintenanceRequestAttachmentRepository`.
- [ ] Implementar `PrismaMaintenanceWorkOrderRepository`.
- [ ] Implementar `PrismaMaintenanceWorkOrderAssignmentRepository`.
- [ ] Implementar `PrismaMaintenanceWorkOrderTaskRepository`.
- [ ] Implementar `PrismaMaintenanceVisitRepository`.
- [ ] Implementar `PrismaMaintenanceEvidenceRepository`.
- [ ] Implementar `PrismaMaintenanceCostRepository`.
- [ ] Implementar `PrismaMaintenanceCostApprovalRepository`.
- [ ] Implementar `PrismaMaintenanceSupplierLinkRepository`.
- [ ] Implementar `PrismaMaintenancePayableLinkRepository`.
- [ ] Implementar `PrismaMaintenanceCommentRepository`.
- [ ] Implementar `PrismaMaintenanceStatusHistoryRepository`.
- [ ] Garantizar que todos los métodos reciban `tenantId`.
- [ ] Prohibir consultas `findUnique({ id })` en entidades tenant-scoped.
- [ ] Usar `findFirst({ where: { id, tenantId } })` para recursos tenant-scoped.
- [ ] Agregar tests de repositorio cross-tenant.
```

---

# EPIC-022-05 — Maintenance categories and assets

## 20. Categorías

Tareas:

```text id="l15zf7"
- [ ] Crear `MaintenanceCategoryService`.
- [ ] Crear `MaintenanceCategoriesController`.
- [ ] Crear `CreateMaintenanceCategoryDto`.
- [ ] Crear `UpdateMaintenanceCategoryDto`.
- [ ] Crear `ArchiveMaintenanceCategoryDto`.
- [ ] Crear `MaintenanceCategoryDto`.
- [ ] Crear `MaintenanceCategoryListItemDto`.
- [ ] Implementar `GET /api/v1/tenant/maintenance-categories`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-categories`.
- [ ] Implementar `GET /api/v1/tenant/maintenance-categories/{categoryId}`.
- [ ] Implementar `PATCH /api/v1/tenant/maintenance-categories/{categoryId}`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-categories/{categoryId}/archive`.
- [ ] Validar código único por tenant.
- [ ] Validar que `PATCH` no acepte `status` directo.
- [ ] Auditar `maintenanceCategory.created`.
- [ ] Auditar `maintenanceCategory.updated`.
- [ ] Auditar `maintenanceCategory.archived`.
- [ ] Agregar tests API de categorías.
```

---

## 21. Activos

Tareas:

```text id="h8mn4m"
- [ ] Crear `MaintenanceAssetService`.
- [ ] Crear `MaintenanceAssetsController`.
- [ ] Crear `CreateMaintenanceAssetDto`.
- [ ] Crear `UpdateMaintenanceAssetDto`.
- [ ] Crear `ArchiveMaintenanceAssetDto`.
- [ ] Crear `MaintenanceAssetDto`.
- [ ] Crear `MaintenanceAssetListItemDto`.
- [ ] Implementar `GET /api/v1/tenant/maintenance-assets`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-assets`.
- [ ] Implementar `GET /api/v1/tenant/maintenance-assets/{assetId}`.
- [ ] Implementar `PATCH /api/v1/tenant/maintenance-assets/{assetId}`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-assets/{assetId}/archive`.
- [ ] Validar `propertyUnitId` tenant-scoped.
- [ ] Validar `commonAreaId` tenant-scoped.
- [ ] Validar `parentAssetId` tenant-scoped.
- [ ] Validar código único por tenant.
- [ ] Rechazar activo archivado para nuevas solicitudes.
- [ ] Auditar `maintenanceAsset.created`.
- [ ] Auditar `maintenanceAsset.updated`.
- [ ] Auditar `maintenanceAsset.archived`.
- [ ] Agregar tests API de activos.
```

---

# EPIC-022-06 — Maintenance requests admin API

## 22. Solicitudes administrativas

Tareas:

```text id="ok5reu"
- [ ] Crear `MaintenanceRequestService`.
- [ ] Crear `MaintenanceRequestReviewService`.
- [ ] Crear `MaintenanceRequestsController`.
- [ ] Crear `CreateMaintenanceRequestDto`.
- [ ] Crear `UpdateMaintenanceRequestDto`.
- [ ] Crear `ReviewMaintenanceRequestDto`.
- [ ] Crear `AcceptMaintenanceRequestDto`.
- [ ] Crear `RejectMaintenanceRequestDto`.
- [ ] Crear `CancelMaintenanceRequestDto`.
- [ ] Crear `MarkDuplicateMaintenanceRequestDto`.
- [ ] Crear `ConvertMaintenanceRequestToWorkOrderDto`.
- [ ] Crear `MaintenanceRequestDto`.
- [ ] Crear `MaintenanceRequestListItemDto`.
- [ ] Implementar `GET /api/v1/tenant/maintenance-requests`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-requests`.
- [ ] Implementar `GET /api/v1/tenant/maintenance-requests/{requestId}`.
- [ ] Implementar `PATCH /api/v1/tenant/maintenance-requests/{requestId}`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-requests/{requestId}/review`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-requests/{requestId}/accept`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-requests/{requestId}/reject`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-requests/{requestId}/cancel`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-requests/{requestId}/mark-duplicate`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-requests/{requestId}/convert-to-work-order`.
```

---

## 23. Reglas de solicitudes administrativas

Tareas:

```text id="f01eig"
- [ ] Generar `requestNumber` server-side.
- [ ] Resolver `reportedByUserId` server-side.
- [ ] Rechazar `tenantId` desde body.
- [ ] Rechazar `reportedByUserId` desde body.
- [ ] Rechazar `status` directo en `PATCH`.
- [ ] Validar `categoryId` tenant-scoped.
- [ ] Validar `assetId` tenant-scoped.
- [ ] Validar `propertyUnitId` tenant-scoped.
- [ ] Validar `commonAreaId` tenant-scoped.
- [ ] Validar `duplicateOfRequestId` tenant-scoped.
- [ ] Requerir reason para reject.
- [ ] Requerir reason para cancel.
- [ ] Crear `MaintenanceStatusHistory` en transiciones críticas.
- [ ] Auditar creación, revisión, aceptación, rechazo, cancelación, duplicado y conversión.
- [ ] Emitir notificaciones relevantes.
```

---

# EPIC-022-07 — Maintenance requests `/me` API

## 24. Solicitudes propias

Tareas:

```text id="d4lskm"
- [ ] Crear `MaintenanceMeRequestsController`.
- [ ] Crear `CreateOwnMaintenanceRequestDto`.
- [ ] Crear `OwnMaintenanceRequestDto`.
- [ ] Crear `OwnMaintenanceRequestListItemDto`.
- [ ] Crear `CreateOwnMaintenanceCommentDto`.
- [ ] Crear `CreateOwnMaintenanceEvidenceDto`.
- [ ] Crear `OwnMaintenanceRequestGuard`.
- [ ] Crear `OwnMaintenanceEvidenceGuard`.
- [ ] Implementar `GET /api/v1/me/maintenance-requests`.
- [ ] Implementar `POST /api/v1/me/maintenance-requests`.
- [ ] Implementar `GET /api/v1/me/maintenance-requests/{requestId}`.
- [ ] Implementar `POST /api/v1/me/maintenance-requests/{requestId}/comments`.
- [ ] Implementar `POST /api/v1/me/maintenance-requests/{requestId}/cancel`.
- [ ] Implementar `GET /api/v1/me/maintenance-requests/{requestId}/evidence`.
- [ ] Implementar `POST /api/v1/me/maintenance-requests/{requestId}/evidence`.
```

---

## 25. Reglas `/me`

Tareas:

```text id="njk05x"
- [ ] Resolver `reportedByUserId = currentUserProfile.id`.
- [ ] Resolver `reportedByPersonId` server-side si existe.
- [ ] Validar relación `UserProfile -> Person -> PropertyUnit`.
- [ ] Rechazar solicitud sobre unidad ajena.
- [ ] Rechazar solicitud sobre tenant B.
- [ ] Validar categoría `allowsResidentRequests=true`.
- [ ] Responder 404 si solicitud no es propia.
- [ ] No devolver costos internos.
- [ ] No devolver comentarios `internal`.
- [ ] No devolver datos internos de proveedor.
- [ ] No devolver `supplierPayableId`.
- [ ] No devolver audit metadata.
- [ ] No devolver status history completa.
- [ ] No devolver evidencias internas.
- [ ] No devolver `storageKey`.
- [ ] Agregar tests de OwnResourceGuard.
```

---

# EPIC-022-08 — Maintenance work orders lifecycle

## 26. Órdenes de trabajo

Tareas:

```text id="zwjlug"
- [ ] Crear `MaintenanceWorkOrderService`.
- [ ] Crear `MaintenanceWorkOrdersController`.
- [ ] Crear `CreateMaintenanceWorkOrderDto`.
- [ ] Crear `UpdateMaintenanceWorkOrderDto`.
- [ ] Crear `AssignMaintenanceWorkOrderDto`.
- [ ] Crear `ScheduleMaintenanceWorkOrderDto`.
- [ ] Crear `StartMaintenanceWorkOrderDto`.
- [ ] Crear `PauseMaintenanceWorkOrderDto`.
- [ ] Crear `CompleteMaintenanceWorkOrderDto`.
- [ ] Crear `CloseMaintenanceWorkOrderDto`.
- [ ] Crear `ReopenMaintenanceWorkOrderDto`.
- [ ] Crear `CancelMaintenanceWorkOrderDto`.
- [ ] Crear `ArchiveMaintenanceWorkOrderDto`.
- [ ] Crear `MaintenanceWorkOrderDto`.
- [ ] Crear `MaintenanceWorkOrderListItemDto`.
- [ ] Implementar `GET /api/v1/tenant/maintenance-work-orders`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-work-orders`.
- [ ] Implementar `GET /api/v1/tenant/maintenance-work-orders/{workOrderId}`.
- [ ] Implementar `PATCH /api/v1/tenant/maintenance-work-orders/{workOrderId}`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-work-orders/{workOrderId}/assign`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-work-orders/{workOrderId}/schedule`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-work-orders/{workOrderId}/start`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-work-orders/{workOrderId}/pause`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-work-orders/{workOrderId}/complete`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-work-orders/{workOrderId}/close`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-work-orders/{workOrderId}/reopen`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-work-orders/{workOrderId}/cancel`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-work-orders/{workOrderId}/archive`.
```

---

## 27. Reglas de órdenes

Tareas:

```text id="bh3spi"
- [ ] Generar `workOrderNumber` server-side.
- [ ] Validar `maintenanceRequestId` tenant-scoped si existe.
- [ ] Validar que request esté `accepted` para conversión.
- [ ] Validar `categoryId` tenant-scoped.
- [ ] Validar `assetId` tenant-scoped.
- [ ] Validar `propertyUnitId` tenant-scoped.
- [ ] Validar `commonAreaId` tenant-scoped.
- [ ] Validar `assignedInternalUserId` con membership activo.
- [ ] Validar `supplierId` contra Supplier Payments si existe.
- [ ] Rechazar supplier `blocked`.
- [ ] Rechazar supplier `inactive`.
- [ ] Rechazar supplier tenant B.
- [ ] Rechazar `paymentOrderId` desde DTO.
- [ ] Rechazar `journalEntryId` desde DTO.
- [ ] Cerrar solo si hay evidencia válida o `closureReason`.
- [ ] Requerir `completionSummary` para cierre.
- [ ] Requerir `reopenReason` para reapertura.
- [ ] Requerir `cancelReason` para cancelación.
- [ ] Impedir edición destructiva de orden cerrada.
- [ ] Crear `MaintenanceStatusHistory` por transición.
- [ ] Auditar todas las transiciones críticas.
```

---

# EPIC-022-09 — Tasks, visits and comments

## 28. Tareas

Tareas:

```text id="fgrzf2"
- [ ] Crear `MaintenanceTaskService`.
- [ ] Crear `MaintenanceTasksController`.
- [ ] Crear `CreateMaintenanceTaskDto`.
- [ ] Crear `UpdateMaintenanceTaskDto`.
- [ ] Crear `CompleteMaintenanceTaskDto`.
- [ ] Crear `MaintenanceTaskDto`.
- [ ] Implementar `GET /api/v1/tenant/maintenance-work-orders/{workOrderId}/tasks`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-work-orders/{workOrderId}/tasks`.
- [ ] Implementar `GET /api/v1/tenant/maintenance-tasks/{taskId}`.
- [ ] Implementar `PATCH /api/v1/tenant/maintenance-tasks/{taskId}`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-tasks/{taskId}/complete`.
- [ ] Generar `taskNumber` server-side.
- [ ] Garantizar unicidad de `taskNumber` por work order.
- [ ] Rechazar `taskNumber` desde cliente.
- [ ] Rechazar `status` directo por `PATCH`.
- [ ] Auditar creación, actualización y completado.
```

---

## 29. Visitas

Tareas:

```text id="liyba8"
- [ ] Crear `MaintenanceVisitService`.
- [ ] Crear `MaintenanceVisitsController`.
- [ ] Crear `CreateMaintenanceVisitDto`.
- [ ] Crear `UpdateMaintenanceVisitDto`.
- [ ] Crear `CompleteMaintenanceVisitDto`.
- [ ] Crear `CancelMaintenanceVisitDto`.
- [ ] Crear `MaintenanceVisitDto`.
- [ ] Implementar `GET /api/v1/tenant/maintenance-work-orders/{workOrderId}/visits`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-work-orders/{workOrderId}/visits`.
- [ ] Implementar `GET /api/v1/tenant/maintenance-visits/{visitId}`.
- [ ] Implementar `PATCH /api/v1/tenant/maintenance-visits/{visitId}`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-visits/{visitId}/complete`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-visits/{visitId}/cancel`.
- [ ] Validar `visitedByUserId` con membership activo.
- [ ] Validar `supplierId` active.
- [ ] Validar `propertyUnitId` tenant-scoped.
- [ ] Requerir `endedAt` para completed.
- [ ] Auditar creación, actualización, completado y cancelación.
```

---

## 30. Comentarios

Tareas:

```text id="tnzhn1"
- [ ] Crear `MaintenanceCommentService`.
- [ ] Crear `MaintenanceCommentsController`.
- [ ] Crear `CreateMaintenanceCommentDto`.
- [ ] Crear `MaintenanceCommentDto`.
- [ ] Crear `OwnMaintenanceCommentDto`.
- [ ] Implementar `GET /api/v1/tenant/maintenance-work-orders/{workOrderId}/comments`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-work-orders/{workOrderId}/comments`.
- [ ] Implementar comentarios sobre solicitudes.
- [ ] Implementar comentarios sobre órdenes.
- [ ] Implementar visibilidad `internal`.
- [ ] Implementar visibilidad `visibleToRequester`.
- [ ] Implementar visibilidad `visibleToBoard`.
- [ ] Implementar visibilidad `system` solo server-side.
- [ ] Rechazar `system` desde cliente.
- [ ] Sanitizar HTML/script.
- [ ] Ocultar `internal` en `/me`.
- [ ] Emitir notificación si comentario es `visibleToRequester`.
- [ ] Auditar creación de comentario.
```

---

# EPIC-022-10 — Evidence and Secure Document Storage

## 31. Puerto SDS

Tareas:

```text id="nl4z24"
- [ ] Crear `MaintenanceDocumentStoragePort`.
- [ ] Implementar `validateDocumentBelongsToTenant`.
- [ ] Implementar `getDownloadAvailability`.
- [ ] Implementar `createReportExport`.
- [ ] Crear adapter hacia `016-secure-document-storage`.
- [ ] Validar `sourceModule=maintenanceWorkOrders`.
- [ ] Validar `visibility=administrative | requesterVisible`.
- [ ] Validar `sensitivity=internal | restricted`.
```

---

## 32. Evidencias

Tareas:

```text id="orzrp3"
- [ ] Crear `MaintenanceEvidenceService`.
- [ ] Crear `MaintenanceEvidenceController`.
- [ ] Crear `CreateMaintenanceEvidenceDto`.
- [ ] Crear `VerifyMaintenanceEvidenceDto`.
- [ ] Crear `RejectMaintenanceEvidenceDto`.
- [ ] Crear `ArchiveMaintenanceEvidenceDto`.
- [ ] Crear `MaintenanceEvidenceDto`.
- [ ] Crear `OwnMaintenanceEvidenceDto`.
- [ ] Implementar `GET /api/v1/tenant/maintenance-work-orders/{workOrderId}/evidence`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-work-orders/{workOrderId}/evidence`.
- [ ] Implementar `GET /api/v1/tenant/maintenance-evidence/{evidenceId}`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-evidence/{evidenceId}/verify`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-evidence/{evidenceId}/reject`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-evidence/{evidenceId}/archive`.
- [ ] Validar `secureDocumentId` tenant-scoped.
- [ ] Validar `taskId` pertenece al work order.
- [ ] Validar `visitId` pertenece al work order.
- [ ] Rechazar `storageKey`.
- [ ] Rechazar `signedUrl`.
- [ ] Rechazar `base64`.
- [ ] Rechazar raw file payload.
- [ ] No devolver `storageKey`.
- [ ] No devolver signed URL persistente.
- [ ] Auditar evidencia creada, verificada, rechazada, archivada y descargada.
```

---

# EPIC-022-11 — Costs and approvals

## 33. Costos

Tareas:

```text id="isds3n"
- [ ] Crear `MaintenanceCostService`.
- [ ] Crear `MaintenanceCostsController`.
- [ ] Crear `CreateMaintenanceCostEstimateDto`.
- [ ] Crear `UpdateMaintenanceCostEstimateDto`.
- [ ] Crear `SubmitMaintenanceCostEstimateDto`.
- [ ] Crear `ApproveMaintenanceCostEstimateDto`.
- [ ] Crear `RejectMaintenanceCostEstimateDto`.
- [ ] Crear `CancelMaintenanceCostEstimateDto`.
- [ ] Crear `ConvertMaintenanceCostToPayableDto`.
- [ ] Crear `MaintenanceCostEstimateDto`.
- [ ] Implementar `GET /api/v1/tenant/maintenance-work-orders/{workOrderId}/costs`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-work-orders/{workOrderId}/costs`.
- [ ] Implementar `GET /api/v1/tenant/maintenance-costs/{costEstimateId}`.
- [ ] Implementar `PATCH /api/v1/tenant/maintenance-costs/{costEstimateId}`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-costs/{costEstimateId}/submit`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-costs/{costEstimateId}/approve`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-costs/{costEstimateId}/reject`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-costs/{costEstimateId}/cancel`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-costs/{costEstimateId}/convert-to-payable`.
```

---

## 34. Reglas de costos

Tareas:

```text id="hpuwyf"
- [ ] Usar Decimal para `estimatedAmount`.
- [ ] Usar Decimal para `approvedAmount`.
- [ ] Usar Decimal para `actualAmount`.
- [ ] Exponer montos como string decimal.
- [ ] Rechazar números JS como fuente de verdad monetaria.
- [ ] Rechazar montos negativos.
- [ ] Rechazar currency distinta de `USD`.
- [ ] Rechazar `approvedAmount` en creación.
- [ ] Rechazar `actualAmount` si usuario no tiene permiso.
- [ ] Rechazar `supplierPayableId` fuera del endpoint controlado.
- [ ] Rechazar `paymentOrderId`.
- [ ] Rechazar `journalEntryId`.
- [ ] Requerir reason para reject.
- [ ] Requerir reason para cancel.
- [ ] Impedir edición destructiva de costo `convertedToPayable`.
- [ ] Auditar creación, submit, approve, reject, cancel y convert-to-payable.
```

---

## 35. Aprobaciones de costo

Tareas:

```text id="g29hw2"
- [ ] Crear `MaintenanceCostApprovalService`.
- [ ] Crear entidad de aprobación por paso.
- [ ] Crear approval record al someter costo si aplica.
- [ ] Validar aprobación por permiso `maintenanceCosts.approve`.
- [ ] Validar que solo exista pending approval activo por paso.
- [ ] Registrar `approvedBy` server-side.
- [ ] Registrar `approvedAt` server-side.
- [ ] Registrar `rejectedBy` server-side.
- [ ] Registrar `rejectedAt` server-side.
- [ ] Auditar aprobación y rechazo.
```

---

# EPIC-022-12 — Supplier links and payable conversion

## 36. Puerto Supplier Payments

Tareas:

```text id="v4a59d"
- [ ] Crear `MaintenanceSupplierPaymentsPort`.
- [ ] Implementar `validateSupplier`.
- [ ] Implementar `createPayableFromMaintenanceCost`.
- [ ] Implementar `getSupplierPayable`.
- [ ] Crear adapter hacia `021-supplier-payments`.
- [ ] Validar supplier tenant-scoped.
- [ ] Validar supplier active.
- [ ] Rechazar supplier blocked.
- [ ] Rechazar supplier inactive.
- [ ] Rechazar supplier archived.
```

---

## 37. Supplier links

Tareas:

```text id="efzt9r"
- [ ] Crear `MaintenanceSupplierLinkService`.
- [ ] Crear `MaintenanceSupplierLinksController`.
- [ ] Crear `CreateMaintenanceSupplierLinkDto`.
- [ ] Crear `UnlinkMaintenanceSupplierDto`.
- [ ] Crear `MaintenanceSupplierLinkDto`.
- [ ] Implementar `GET /api/v1/tenant/maintenance-work-orders/{workOrderId}/supplier-links`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-work-orders/{workOrderId}/supplier-links`.
- [ ] Implementar `POST /api/v1/tenant/maintenance-supplier-links/{linkId}/unlink`.
- [ ] Validar supplier tenant-scoped.
- [ ] Validar supplier active.
- [ ] Rechazar supplier blocked.
- [ ] Requerir reason para unlink.
- [ ] Auditar link y unlink.
```

---

## 38. Payable links

Tareas:

```text id="iry1qj"
- [ ] Crear `MaintenancePayableLinkService`.
- [ ] Crear `MaintenancePayableLinksController`.
- [ ] Crear `MaintenancePayableLinkDto`.
- [ ] Implementar `GET /api/v1/tenant/maintenance-work-orders/{workOrderId}/payable-links`.
- [ ] Crear `MaintenancePayableLink` después de convert-to-payable exitoso.
- [ ] Impedir más de un link activo por `costEstimateId`.
- [ ] Registrar estado `active`.
- [ ] Registrar estado `failed` si falla integración de forma controlada.
- [ ] No gobernar estado del payable desde Maintenance.
- [ ] Auditar `maintenancePayableLink.created`.
```

---

## 39. Prohibiciones financieras

Tareas:

```text id="vknoq9"
- [ ] Agregar test que verifique que Maintenance no crea `Payment`.
- [ ] Agregar test que verifique que Maintenance no crea `PaymentAllocation`.
- [ ] Agregar test que verifique que Maintenance no crea `SupplierPaymentOrder`.
- [ ] Agregar test que verifique que Maintenance no marca `paid`.
- [ ] Agregar test que verifique que Maintenance no inicia transferencia bancaria.
- [ ] Agregar test que verifique que Maintenance no inicia Open Banking payment.
- [ ] Agregar test que verifique que Maintenance no crea `JournalEntry`.
- [ ] Agregar test que verifique que Maintenance no confirma Bank Reconciliation.
```

---

# EPIC-022-13 — Reports and exports

## 40. Reportes

Tareas:

```text id="tzne11"
- [ ] Crear `MaintenanceReportService`.
- [ ] Crear `MaintenanceReportsController`.
- [ ] Crear `MaintenanceReportFilterDto`.
- [ ] Crear `MaintenanceReportByStatusDto`.
- [ ] Crear `MaintenanceReportByCategoryDto`.
- [ ] Crear `MaintenanceReportResponseTimesDto`.
- [ ] Crear `MaintenanceReportCostsDto`.
- [ ] Crear `MaintenanceReportBySupplierDto`.
- [ ] Implementar `GET /api/v1/tenant/maintenance-reports/by-status`.
- [ ] Implementar `GET /api/v1/tenant/maintenance-reports/by-category`.
- [ ] Implementar `GET /api/v1/tenant/maintenance-reports/response-times`.
- [ ] Implementar `GET /api/v1/tenant/maintenance-reports/costs`.
- [ ] Implementar `GET /api/v1/tenant/maintenance-reports/by-supplier`.
- [ ] Validar filtros tenant-scoped.
- [ ] Exponer montos como string decimal.
- [ ] Impedir reportes cross-tenant.
- [ ] Auditar `maintenanceReport.generated`.
```

---

## 41. Exportaciones

Tareas:

```text id="arsuzx"
- [ ] Crear `MaintenanceExportService`.
- [ ] Crear `MaintenanceReportExportDto`.
- [ ] Implementar `GET /api/v1/tenant/maintenance-reports/export`.
- [ ] Soportar `reportType=byStatus`.
- [ ] Soportar `reportType=byCategory`.
- [ ] Soportar `reportType=responseTimes`.
- [ ] Soportar `reportType=costs`.
- [ ] Soportar `reportType=bySupplier`.
- [ ] Soportar `format=csv`.
- [ ] Soportar `format=xlsx` si el módulo de exportación ya lo soporta.
- [ ] Soportar `format=pdf` si el módulo de exportación ya lo soporta.
- [ ] Crear export vía Secure Document Storage.
- [ ] Devolver `secureDocumentId`.
- [ ] No devolver `storageKey`.
- [ ] No devolver signed URL persistente.
- [ ] Auditar `maintenanceReport.exported`.
```

---

# EPIC-022-14 — Audit and observability

## 42. Audit

Tareas:

```text id="hoxhic"
- [ ] Crear `MaintenanceAuditPort`.
- [ ] Crear adapter hacia `007-audit`.
- [ ] Implementar sanitizer de metadata.
- [ ] Auditar `maintenanceCategory.created`.
- [ ] Auditar `maintenanceCategory.updated`.
- [ ] Auditar `maintenanceCategory.archived`.
- [ ] Auditar `maintenanceAsset.created`.
- [ ] Auditar `maintenanceAsset.updated`.
- [ ] Auditar `maintenanceAsset.archived`.
- [ ] Auditar `maintenanceRequest.created`.
- [ ] Auditar `maintenanceRequest.submitted`.
- [ ] Auditar `maintenanceRequest.reviewed`.
- [ ] Auditar `maintenanceRequest.accepted`.
- [ ] Auditar `maintenanceRequest.rejected`.
- [ ] Auditar `maintenanceRequest.cancelled`.
- [ ] Auditar `maintenanceRequest.markedDuplicate`.
- [ ] Auditar `maintenanceRequest.convertedToWorkOrder`.
- [ ] Auditar `maintenanceWorkOrder.created`.
- [ ] Auditar `maintenanceWorkOrder.updated`.
- [ ] Auditar `maintenanceWorkOrder.assigned`.
- [ ] Auditar `maintenanceWorkOrder.scheduled`.
- [ ] Auditar `maintenanceWorkOrder.started`.
- [ ] Auditar `maintenanceWorkOrder.paused`.
- [ ] Auditar `maintenanceWorkOrder.completed`.
- [ ] Auditar `maintenanceWorkOrder.closed`.
- [ ] Auditar `maintenanceWorkOrder.reopened`.
- [ ] Auditar `maintenanceWorkOrder.cancelled`.
- [ ] Auditar `maintenanceTask.created`.
- [ ] Auditar `maintenanceTask.updated`.
- [ ] Auditar `maintenanceTask.completed`.
- [ ] Auditar `maintenanceVisit.created`.
- [ ] Auditar `maintenanceVisit.completed`.
- [ ] Auditar `maintenanceVisit.cancelled`.
- [ ] Auditar `maintenanceEvidence.created`.
- [ ] Auditar `maintenanceEvidence.verified`.
- [ ] Auditar `maintenanceEvidence.rejected`.
- [ ] Auditar `maintenanceEvidence.downloaded`.
- [ ] Auditar `maintenanceCostEstimate.created`.
- [ ] Auditar `maintenanceCostEstimate.submitted`.
- [ ] Auditar `maintenanceCostEstimate.approved`.
- [ ] Auditar `maintenanceCostEstimate.rejected`.
- [ ] Auditar `maintenanceCostEstimate.convertedToPayable`.
- [ ] Auditar `maintenanceSupplierLink.created`.
- [ ] Auditar `maintenanceSupplierLink.unlinked`.
- [ ] Auditar `maintenancePayableLink.created`.
- [ ] Auditar `maintenanceComment.created`.
- [ ] Auditar `maintenanceReport.generated`.
- [ ] Auditar `maintenanceReport.exported`.
```

---

## 43. Audit sanitizer

Tareas:

```text id="f0ekro"
- [ ] Impedir `storageKey` en audit.
- [ ] Impedir `signedUrl` en audit.
- [ ] Impedir `base64` en audit.
- [ ] Impedir raw file payload en audit.
- [ ] Impedir tokens en audit.
- [ ] Impedir secrets en audit.
- [ ] Impedir passwords en audit.
- [ ] Impedir SQL raw en audit.
- [ ] Impedir stack trace productivo en audit.
- [ ] Minimizar comentarios internos completos en audit.
- [ ] Agregar tests de sanitizer.
```

---

## 44. Logs

Tareas:

```text id="x2c6oh"
- [ ] Crear logger específico del módulo.
- [ ] Loggear `maintenanceRequest.submitted`.
- [ ] Loggear `maintenanceRequest.accepted`.
- [ ] Loggear `maintenanceRequest.rejected`.
- [ ] Loggear `maintenanceRequest.convertedToWorkOrder`.
- [ ] Loggear `maintenanceWorkOrder.created`.
- [ ] Loggear `maintenanceWorkOrder.assigned`.
- [ ] Loggear `maintenanceWorkOrder.started`.
- [ ] Loggear `maintenanceWorkOrder.completed`.
- [ ] Loggear `maintenanceWorkOrder.closed`.
- [ ] Loggear `maintenanceWorkOrder.reopened`.
- [ ] Loggear `maintenanceCostEstimate.approved`.
- [ ] Loggear `maintenanceCostEstimate.convertedToPayable`.
- [ ] Loggear `maintenanceEvidence.created`.
- [ ] Loggear `maintenanceReport.exported`.
- [ ] Garantizar `traceId`.
- [ ] Garantizar `durationMs`.
- [ ] No loggear `storageKey`.
- [ ] No loggear signed URL.
- [ ] No loggear base64.
- [ ] No loggear comentarios internos completos.
- [ ] No loggear stack trace productivo.
```

---

## 45. Métricas

Tareas:

```text id="tebbsv"
- [ ] Crear métrica `maintenance_requests_total`.
- [ ] Crear métrica `maintenance_requests_open_total`.
- [ ] Crear métrica `maintenance_requests_rejected_total`.
- [ ] Crear métrica `maintenance_work_orders_total`.
- [ ] Crear métrica `maintenance_work_orders_open_total`.
- [ ] Crear métrica `maintenance_work_orders_closed_total`.
- [ ] Crear métrica `maintenance_work_orders_reopened_total`.
- [ ] Crear métrica `maintenance_work_orders_overdue_total`.
- [ ] Crear métrica `maintenance_costs_approved_total`.
- [ ] Crear métrica `maintenance_costs_amount_approved`.
- [ ] Crear métrica `maintenance_evidence_uploaded_total`.
- [ ] Crear métrica `maintenance_reports_exported_total`.
- [ ] Permitir labels `requestStatus`.
- [ ] Permitir labels `workOrderStatus`.
- [ ] Permitir labels `priority`.
- [ ] Permitir labels `severity`.
- [ ] Permitir labels `category`.
- [ ] Permitir labels `executionMode`.
- [ ] Permitir labels `workOrderType`.
- [ ] Permitir labels `outcome`.
- [ ] Prohibir label `tenantId`.
- [ ] Prohibir label `userId`.
- [ ] Prohibir label `workOrderId`.
- [ ] Prohibir label `requestId`.
- [ ] Prohibir label `secureDocumentId`.
- [ ] Prohibir label `traceId`.
```

---

# EPIC-022-15 — OpenAPI and API contract

## 46. OpenAPI tags

Tareas:

```text id="sr4ua5"
- [ ] Crear tag `Maintenance Categories`.
- [ ] Crear tag `Maintenance Assets`.
- [ ] Crear tag `Maintenance Requests`.
- [ ] Crear tag `Maintenance My Requests`.
- [ ] Crear tag `Maintenance Work Orders`.
- [ ] Crear tag `Maintenance Tasks`.
- [ ] Crear tag `Maintenance Visits`.
- [ ] Crear tag `Maintenance Evidence`.
- [ ] Crear tag `Maintenance Costs`.
- [ ] Crear tag `Maintenance Supplier Links`.
- [ ] Crear tag `Maintenance Payable Links`.
- [ ] Crear tag `Maintenance Comments`.
- [ ] Crear tag `Maintenance Reports`.
```

---

## 47. OpenAPI extensions

Tareas:

```text id="t5978p"
- [ ] Agregar `x-tenant-scope: true` a rutas tenant.
- [ ] Agregar `x-auth-required: true`.
- [ ] Agregar `x-maintenance-work-orders: true`.
- [ ] Agregar `x-public-exposure: false`.
- [ ] Agregar `x-own-resource: true` a rutas `/me`.
- [ ] Agregar `x-internal-fields-excluded: true` a rutas `/me`.
- [ ] Agregar `x-costs-exposed: false` a rutas `/me`.
- [ ] Agregar `x-internal-comments-exposed: false` a rutas `/me`.
- [ ] Agregar `x-secure-document-storage: true` a rutas con evidencia/documentos.
- [ ] Agregar `x-storage-key-exposed: false`.
- [ ] Agregar `x-decimal-money: true` a rutas con costos.
- [ ] Agregar `x-payment-creation: false`.
- [ ] Agregar `x-bank-transfer-initiation: false`.
- [ ] Agregar `x-direct-accounting: false`.
- [ ] Agregar `x-supplier-payments-linked: true` al endpoint `convert-to-payable`.
- [ ] Agregar `x-supplier-payment-order-created: false`.
- [ ] Agregar `x-supplier-payment-mark-paid: false`.
- [ ] Agregar `x-wordpress-access: false`.
- [ ] Agregar `x-external-ai-real-data: false`.
```

---

## 48. OpenAPI contract tests

Tareas:

```text id="mj79ne"
- [ ] Validar que no exista `/api/v1/public/maintenance-*`.
- [ ] Validar que no se documente `storageKey`.
- [ ] Validar que no se documente `signedUrl` persistente.
- [ ] Validar que no se documente `base64`.
- [ ] Validar que money esté documentado como string decimal.
- [ ] Validar que rutas `/me` no expongan costos.
- [ ] Validar que rutas `/me` no expongan comentarios internos.
- [ ] Validar que `convert-to-payable` no cree payment.
- [ ] Validar que `convert-to-payable` no cree SupplierPaymentOrder.
- [ ] Validar que `convert-to-payable` no cree JournalEntry.
```

---

# EPIC-022-16 — Testing

## 49. Unit tests

Tareas:

```text id="i1su6i"
- [ ] Crear tests de `MaintenanceCategoryCode`.
- [ ] Crear tests de `MaintenanceAssetCode`.
- [ ] Crear tests de `MaintenanceRequestNumber`.
- [ ] Crear tests de `MaintenanceWorkOrderNumber`.
- [ ] Crear tests de `MaintenanceTitle`.
- [ ] Crear tests de `MaintenanceDescription`.
- [ ] Crear tests de `MaintenanceCostAmount`.
- [ ] Crear tests de `MaintenanceReason`.
- [ ] Crear tests de `MaintenanceDocumentReference`.
- [ ] Crear tests de entidad `MaintenanceCategory`.
- [ ] Crear tests de entidad `MaintenanceAsset`.
- [ ] Crear tests de entidad `MaintenanceRequest`.
- [ ] Crear tests de entidad `MaintenanceWorkOrder`.
- [ ] Crear tests de entidad `MaintenanceWorkOrderTask`.
- [ ] Crear tests de entidad `MaintenanceVisit`.
- [ ] Crear tests de entidad `MaintenanceEvidence`.
- [ ] Crear tests de entidad `MaintenanceCostEstimate`.
- [ ] Crear tests de entidad `MaintenanceComment`.
```

---

## 50. Policy tests

Tareas:

```text id="u0l4pp"
- [ ] Testear `MaintenanceTenantPolicy`.
- [ ] Testear `MaintenanceOwnResourcePolicy`.
- [ ] Testear `MaintenanceRequestSubmissionPolicy`.
- [ ] Testear `MaintenanceRequestReviewPolicy`.
- [ ] Testear `MaintenanceRequestDuplicatePolicy`.
- [ ] Testear `MaintenanceWorkOrderClosurePolicy`.
- [ ] Testear `MaintenanceWorkOrderReopenPolicy`.
- [ ] Testear `MaintenanceCostPolicy`.
- [ ] Testear `MaintenanceSupplierLinkPolicy`.
- [ ] Testear `MaintenancePayableConversionPolicy`.
- [ ] Testear `NoDirectPaymentPolicy`.
- [ ] Testear `NoDirectAccountingPolicy`.
- [ ] Testear `MaintenanceCommentVisibilityPolicy`.
```

---

## 51. Repository tests

Tareas:

```text id="vj1mfs"
- [ ] Testear repositorio de categorías.
- [ ] Testear repositorio de activos.
- [ ] Testear repositorio de solicitudes.
- [ ] Testear repositorio de adjuntos.
- [ ] Testear repositorio de órdenes.
- [ ] Testear repositorio de asignaciones.
- [ ] Testear repositorio de tareas.
- [ ] Testear repositorio de visitas.
- [ ] Testear repositorio de evidencias.
- [ ] Testear repositorio de costos.
- [ ] Testear repositorio de aprobaciones.
- [ ] Testear repositorio de supplier links.
- [ ] Testear repositorio de payable links.
- [ ] Testear repositorio de comentarios.
- [ ] Testear repositorio de status history.
- [ ] Verificar que todos filtren por tenant.
- [ ] Verificar que cross-tenant retorna null o 404.
```

---

## 52. API tests

Tareas:

```text id="i3jz4h"
- [ ] Testear API de categorías.
- [ ] Testear API de activos.
- [ ] Testear API de solicitudes admin.
- [ ] Testear API de solicitudes `/me`.
- [ ] Testear API de órdenes.
- [ ] Testear API de tareas.
- [ ] Testear API de visitas.
- [ ] Testear API de evidencias.
- [ ] Testear API de comentarios.
- [ ] Testear API de costos.
- [ ] Testear API de supplier links.
- [ ] Testear API de payable links.
- [ ] Testear API de reportes.
- [ ] Testear API de exportaciones.
```

---

## 53. Security tests

Tareas:

```text id="akbzrt"
- [ ] Probar rechazo de `tenantId` en todos los DTOs.
- [ ] Probar rechazo de actor fields en todos los DTOs.
- [ ] Probar rechazo de `status` directo.
- [ ] Probar rechazo de `storageKey`.
- [ ] Probar rechazo de `signedUrl`.
- [ ] Probar rechazo de `base64`.
- [ ] Probar rechazo de `journalEntryId`.
- [ ] Probar rechazo de `paymentOrderId`.
- [ ] Probar rechazo de `bankTransactionId`.
- [ ] Probar rechazo de `reconciliationMatchId`.
- [ ] Probar que `/me` no expone comentarios internos.
- [ ] Probar que `/me` no expone costos internos.
- [ ] Probar que `/me` no expone proveedor interno por defecto.
- [ ] Probar que `/me` no expone `supplierPayableId`.
- [ ] Probar que `/me` no expone audit metadata.
- [ ] Probar que no existe endpoint público.
- [ ] Probar que CORS no habilita WordPress público para maintenance privado.
- [ ] Probar que no se habilita IA externa.
```

---

## 54. Multitenancy tests

Tareas:

```text id="nhjvxm"
- [ ] tenantA no lee category tenantB.
- [ ] tenantA no lee asset tenantB.
- [ ] tenantA no lee request tenantB.
- [ ] tenantA no lee workOrder tenantB.
- [ ] tenantA no lee task tenantB.
- [ ] tenantA no lee visit tenantB.
- [ ] tenantA no lee evidence tenantB.
- [ ] tenantA no lee cost tenantB.
- [ ] tenantA no lee supplierLink tenantB.
- [ ] tenantA no lee payableLink tenantB.
- [ ] tenantA no lee comments tenantB.
- [ ] tenantA no usa secureDocument tenantB.
- [ ] tenantA no usa supplier tenantB.
- [ ] tenantA no usa propertyUnit tenantB.
- [ ] tenantA no usa commonArea tenantB.
- [ ] tenantA no ve reportes tenantB.
```

---

## 55. Performance tests

Tareas:

```text id="vcep0v"
- [ ] Crear dataset de 1,000 solicitudes en tenant A.
- [ ] Crear dataset de 500 órdenes en tenant A.
- [ ] Crear dataset de 2,000 tareas en tenant A.
- [ ] Crear dataset de 1,000 evidencias en tenant A.
- [ ] Crear dataset de 500 costos en tenant A.
- [ ] Crear dataset parcial en tenant B.
- [ ] Validar listado solicitudes p95 < 800 ms.
- [ ] Validar listado órdenes p95 < 1000 ms.
- [ ] Validar reporte by-status p95 < 1500 ms.
- [ ] Validar reporte costs p95 < 2000 ms.
- [ ] Validar pageSize máximo 100.
- [ ] Validar ausencia de N+1 evidente.
```

---

## 56. Concurrency tests

Tareas:

```text id="ipjy64"
- [ ] Dos usuarios crean misma `categoryCode`: solo una operación exitosa.
- [ ] Dos usuarios crean mismo `assetCode`: solo una operación exitosa.
- [ ] Dos usuarios convierten misma request a work order: solo una operación exitosa.
- [ ] Dos usuarios cierran misma work order: solo una operación exitosa.
- [ ] Dos usuarios reabren misma work order: estado consistente.
- [ ] Dos usuarios aprueban mismo cost estimate: solo una aprobación efectiva.
- [ ] Dos usuarios convierten mismo cost estimate a payable: solo un link activo.
- [ ] Dos usuarios crean task simultánea: `taskNumber` único.
```

---

# EPIC-022-17 — Security hardening

## 57. Guards

Tareas:

```text id="z4q9or"
- [ ] Aplicar `AuthGuard` a todas las rutas.
- [ ] Aplicar `TenantGuard` a rutas `/tenant`.
- [ ] Aplicar `PermissionGuard` a rutas administrativas.
- [ ] Aplicar `OwnMaintenanceRequestGuard` a rutas `/me/maintenance-requests`.
- [ ] Aplicar `OwnMaintenanceEvidenceGuard` a evidencias `/me`.
- [ ] Crear guard de tenant para categorías.
- [ ] Crear guard de tenant para activos.
- [ ] Crear guard de tenant para solicitudes.
- [ ] Crear guard de tenant para órdenes.
- [ ] Crear guard de tenant para tareas.
- [ ] Crear guard de tenant para visitas.
- [ ] Crear guard de tenant para evidencias.
- [ ] Crear guard de tenant para costos.
- [ ] Crear guard de tenant para supplier links.
- [ ] Crear guard de tenant para payable links.
```

---

## 58. DTO hardening

Tareas:

```text id="vzww5k"
- [ ] Configurar `ValidationPipe whitelist`.
- [ ] Configurar `forbidNonWhitelisted`.
- [ ] Rechazar `tenantId`.
- [ ] Rechazar `createdBy`.
- [ ] Rechazar `updatedBy`.
- [ ] Rechazar `reportedByUserId`.
- [ ] Rechazar `assignedBy`.
- [ ] Rechazar `approvedBy`.
- [ ] Rechazar `rejectedBy`.
- [ ] Rechazar `closedBy`.
- [ ] Rechazar `reopenedBy`.
- [ ] Rechazar `archivedBy`.
- [ ] Rechazar `status` directo.
- [ ] Rechazar `requestNumber`.
- [ ] Rechazar `workOrderNumber`.
- [ ] Rechazar `taskNumber`.
- [ ] Rechazar `supplierPayableId` fuera de endpoint controlado.
- [ ] Rechazar `paymentOrderId`.
- [ ] Rechazar `journalEntryId`.
- [ ] Rechazar `bankTransactionId`.
- [ ] Rechazar `reconciliationMatchId`.
- [ ] Rechazar `storageKey`.
- [ ] Rechazar `signedUrl`.
- [ ] Rechazar `base64`.
- [ ] Rechazar raw file payload.
- [ ] Rechazar `externalAiEnabled`.
```

---

## 59. Headers, CORS y cache

Tareas:

```text id="xaawqb"
- [ ] Agregar `Cache-Control: no-store`.
- [ ] Agregar `Pragma: no-cache`.
- [ ] Agregar `X-Content-Type-Options: nosniff`.
- [ ] Agregar `X-Frame-Options: DENY`.
- [ ] Agregar `Referrer-Policy: no-referrer`.
- [ ] No habilitar CORS wildcard.
- [ ] No habilitar CORS de WordPress público para `/tenant/maintenance-*`.
- [ ] No habilitar CORS de WordPress público para `/me/maintenance-*`.
- [ ] Permitir solo frontend administrativo autenticado.
- [ ] Permitir portal autenticado de residentes si corresponde.
```

---

# EPIC-022-18 — Smoke flows

## 60. Smoke flow — resident request

Tareas:

```text id="y9reva"
- [ ] TenantAdmin crea categoría `PLUMBING`.
- [ ] TenantAdmin crea asset `WATER_PUMP_MAIN`.
- [ ] Resident crea solicitud propia desde `/me`.
- [ ] Resident adjunta evidencia `requesterVisible` vía SDS.
- [ ] Resident consulta su solicitud.
- [ ] Otro resident no puede consultar esa solicitud.
- [ ] MaintenanceManager revisa solicitud.
- [ ] MaintenanceManager acepta solicitud.
- [ ] MaintenanceManager convierte solicitud en work order.
- [ ] Sistema audita eventos.
- [ ] Sistema notifica cambios relevantes.
```

---

## 61. Smoke flow — internal work order

Tareas:

```text id="u5qegu"
- [ ] MaintenanceManager crea work order directa.
- [ ] MaintenanceManager asigna técnico interno.
- [ ] MaintenanceManager programa work order.
- [ ] Técnico inicia work order.
- [ ] Técnico crea tarea.
- [ ] Técnico registra visita.
- [ ] Técnico adjunta evidencia `afterPhoto` vía SDS.
- [ ] Técnico completa tarea.
- [ ] MaintenanceManager completa work order.
- [ ] MaintenanceManager cierra work order con evidencia.
- [ ] Sistema audita cierre.
```

---

## 62. Smoke flow — supplier and payable

Tareas:

```text id="nc0gwh"
- [ ] MaintenanceManager crea work order con supplier active.
- [ ] MaintenanceManager registra costo `supplierService`.
- [ ] FinancialManager envía costo a aprobación.
- [ ] FinancialManager aprueba costo.
- [ ] FinancialManager convierte costo a SupplierPayable.
- [ ] Sistema crea `MaintenancePayableLink`.
- [ ] Verificar que Supplier Payments recibió draft/control request.
- [ ] Verificar que no se creó SupplierPaymentOrder.
- [ ] Verificar que no se creó Payment.
- [ ] Verificar que no se creó JournalEntry.
```

---

## 63. Smoke flow — reports and export

Tareas:

```text id="smpeit"
- [ ] TenantAdmin consulta reporte by-status.
- [ ] TenantAdmin consulta reporte by-category.
- [ ] FinancialManager consulta reporte costs.
- [ ] TenantAdmin exporta reporte.
- [ ] Sistema crea SecureDocument.
- [ ] Response incluye `secureDocumentId`.
- [ ] Response no incluye `storageKey`.
- [ ] Audit registra `maintenanceReport.exported`.
```

---

# EPIC-022-19 — CI gates

## 64. Gates generales

Tareas:

```text id="vd5hf6"
- [ ] Ejecutar unit tests en CI.
- [ ] Ejecutar integration tests en CI.
- [ ] Ejecutar API tests en CI.
- [ ] Ejecutar security tests en CI.
- [ ] Ejecutar multitenancy tests en CI.
- [ ] Ejecutar `/me` own-resource tests en CI.
- [ ] Ejecutar OpenAPI contract tests en CI.
- [ ] Ejecutar audit tests en CI.
- [ ] Ejecutar observability tests en CI.
- [ ] Ejecutar smoke tests mínimos en CI.
```

---

## 65. Gates críticos

El pipeline debe fallar si:

```text id="sv8lcf"
- [ ] Algún DTO acepta tenantId.
- [ ] Algún DTO acepta actor fields.
- [ ] Algún DTO acepta status directo fuera de transición.
- [ ] Algún DTO acepta storageKey.
- [ ] Algún DTO acepta signedUrl.
- [ ] Algún DTO acepta base64.
- [ ] Algún DTO acepta journalEntryId.
- [ ] Algún DTO acepta paymentOrderId.
- [ ] `/me` expone internal comments.
- [ ] `/me` expone costos internos.
- [ ] `/me` expone supplierPayableId.
- [ ] `/me` permite solicitud sobre unidad ajena.
- [ ] API permite request cross-tenant.
- [ ] API permite workOrder cross-tenant.
- [ ] API permite evidence cross-tenant.
- [ ] API permite cost cross-tenant.
- [ ] API permite supplier cross-tenant.
- [ ] API crea Payment.
- [ ] API crea SupplierPaymentOrder.
- [ ] API crea JournalEntry.
- [ ] API inicia transferencia bancaria.
- [ ] API documenta endpoint público.
- [ ] API expone storageKey.
- [ ] Logs contienen storageKey.
- [ ] Audit contiene storageKey.
- [ ] `MAINTENANCE_EXTERNAL_AI_ENABLED=true`.
```

---

## 66. Definition of Done del módulo

El módulo se considera listo cuando:

```text id="xg4nnf"
- [ ] `spec.md` aprobado.
- [ ] `plan.md` aprobado.
- [ ] `data-model.md` aprobado.
- [ ] `api-contract.md` aprobado.
- [ ] `test-plan.md` aprobado.
- [ ] `tasks.md` aprobado.
- [ ] `security-notes.md` creado y aprobado.
- [ ] Prisma schema implementado.
- [ ] Migración 022 implementada.
- [ ] Repositorios implementados.
- [ ] Servicios implementados.
- [ ] Controllers implementados.
- [ ] DTOs implementados.
- [ ] Guards implementados.
- [ ] Policies implementadas.
- [ ] Categorías implementadas.
- [ ] Activos implementados.
- [ ] Solicitudes admin implementadas.
- [ ] Solicitudes `/me` implementadas.
- [ ] Work orders implementadas.
- [ ] Tareas implementadas.
- [ ] Visitas implementadas.
- [ ] Comentarios implementados.
- [ ] Evidencias con SDS implementadas.
- [ ] Costos implementados.
- [ ] Aprobaciones implementadas.
- [ ] Supplier links implementados.
- [ ] Payable links implementados.
- [ ] Reportes implementados.
- [ ] Exports implementados vía SDS.
- [ ] Audit implementado.
- [ ] Logs seguros implementados.
- [ ] Métricas implementadas.
- [ ] OpenAPI implementado.
- [ ] Tests unitarios pasan.
- [ ] Tests integración pasan.
- [ ] Tests API pasan.
- [ ] Tests seguridad pasan.
- [ ] Tests multitenancy pasan.
- [ ] Tests `/me` pasan.
- [ ] Smoke flows pasan.
- [ ] CI completo pasa.
```

---

## 67. No aceptación

No se acepta implementación si:

```text id="on7q8s"
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

## 68. Resultado esperado

Al completar estas tareas, el módulo `022-maintenance-work-orders` quedará implementado como un módulo operativo seguro, auditable y correctamente integrado con el resto de RESIDENT Core.

Resultado esperado:

```text id="mzvz4q"
module foundation implemented
database migration implemented
Prisma models implemented
domain model implemented
state machines implemented
policies implemented
repositories implemented
tenant admin API implemented
/me own API implemented
categories implemented
assets implemented
requests implemented
work orders implemented
tasks implemented
visits implemented
comments implemented
evidence via SDS implemented
costs implemented
cost approvals implemented
supplier links implemented
payable links implemented
reports implemented
exports implemented
audit implemented
observability implemented
OpenAPI implemented
tests implemented
CI gates implemented
security hardening implemented
no public endpoints
no WordPress public access
no direct payments
no direct accounting
no storageKey exposure
no external AI with real data
```

---

## 69. Expediente actualizado

```text id="rwv27v"
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
│   │       ├── test-plan.md
│   │       └── tasks.md
```
