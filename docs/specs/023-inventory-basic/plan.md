# Plan — 023 Inventory Basic

## 1. Información del documento

| Campo                 | Valor                                                                                                                                         |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto              | RESIDENT Core                                                                                                                                 |
| Spec ID               | 023                                                                                                                                           |
| Módulo                | Inventory Basic                                                                                                                               |
| Documento             | Technical Plan                                                                                                                                |
| Ruta                  | `docs/specs/023-inventory-basic/plan.md`                                                                                                      |
| Versión               | 0.1                                                                                                                                           |
| Estado                | Borrador inicial                                                                                                                              |
| Fecha                 | 2026-07-23                                                                                                                                    |
| Documento base        | `docs/specs/023-inventory-basic/spec.md`                                                                                                      |
| Fase                  | FASE 2 — RESIDENT Core                                                                                                                        |
| Arquitectura objetivo | Monolito modular preparado para microservicios                                                                                                |
| Stack objetivo        | NestJS / TypeScript / PostgreSQL / Prisma / OpenAPI / Keycloak                                                                                |
| Naturaleza            | Tenant-scoped / Operational / Stock-controlled / Movement-driven / Maintenance-aware / Supplier-aware / Cost-aware / Audit-heavy / Non-public |

---

## 2. Propósito

Este documento define el plan técnico para implementar el módulo `023-inventory-basic`.

El módulo permitirá gestionar inventario operativo básico por tenant: categorías, unidades de medida, ítems, ubicaciones, saldos, movimientos, entradas, salidas, ajustes, transferencias, consumos asociados a mantenimiento, documentos, alertas de stock mínimo, reportes, exportaciones y auditoría.

Regla central del plan:

```text id="jlk3xq"
Inventory Basic debe implementarse como un módulo operativo tenant-scoped, stock-controlled, movement-driven, maintenance-aware, supplier-aware, cost-aware y audit-heavy, sin pagos directos, sin órdenes de pago a proveedor, sin iniciación bancaria, sin contabilidad directa, sin conciliación bancaria, sin endpoints públicos, sin endpoints /me, sin acceso desde WordPress público y sin uso de IA externa con datos reales.
```

---

## 3. Decisión técnica principal

El módulo se implementará como parte del monolito modular de RESIDENT Core.

Decisión:

```text id="kz19ed"
Implementar Inventory Basic como módulo NestJS independiente dentro del monolito modular, con modelo de dominio propio, repositorios tenant-scoped, movimientos como fuente de verdad, saldos derivados/snapshot, transacciones para operaciones críticas, puertos de integración, DTOs seguros, auditoría obligatoria y API REST privada.
```

Justificación:

```text id="v12q9a"
- El inventario es operativo y depende de Maintenance Work Orders, Supplier Payments, Secure Document Storage, Audit y Reports.
- No requiere microservicio físico inicial.
- Sí requiere límites de dominio claros para evitar mezclar inventario con pagos, compras, contabilidad o activos fijos.
- El patrón modular permite evolucionar a microservicio futuro si crecen los movimientos, bodegas o integraciones.
```

---

## 4. Nombre del módulo

Nombre técnico:

```text id="s1v3do"
inventory-basic
```

Ruta base recomendada:

```text id="gh3l9d"
apps/api/src/modules/inventory-basic/
```

Nombre de clase NestJS:

```typescript id="axp0yl"
InventoryBasicModule
```

---

## 5. Tipo de módulo

Clasificación:

```text id="enoyrw"
Operational module
Tenant-scoped module
Stock-controlled module
Movement-driven module
Maintenance-aware module
Supplier-aware module
Cost-aware module
Audit-heavy module
Non-public module
No /me module in MVP
No WordPress public access
```

No es:

```text id="vpuc0o"
- ERP completo;
- módulo de compras completo;
- módulo de activos fijos;
- módulo contable;
- módulo de pagos;
- módulo de conciliación bancaria;
- módulo de facturación;
- módulo público;
- módulo WordPress;
- módulo de IA;
- sistema de inventario serializado avanzado.
```

---

## 6. Alcance técnico MVP

### 6.1. Incluido

```text id="bko08s"
- InventoryCategory.
- InventoryUnitOfMeasure.
- InventoryItem.
- InventoryStorageLocation.
- InventoryStockBalance.
- InventoryMovement.
- InventoryStockAdjustment.
- InventoryTransfer.
- InventoryConsumption.
- InventoryDocument.
- InventoryAlert.
- InventoryReportExport.
- API tenant administrativa.
- Repositorios tenant-scoped.
- Stock por ítem y ubicación.
- Movimientos como fuente de verdad.
- Entradas.
- Salidas.
- Ajustes.
- Transferencias.
- Consumos vinculados a Maintenance Work Orders.
- Documentos vía Secure Document Storage.
- Vínculos referenciales con Supplier Payments.
- Alertas de bajo stock.
- Reportes básicos.
- Exportaciones vía Secure Document Storage.
- Auditoría.
- Observabilidad.
- OpenAPI.
- Tests de dominio, integración, API, seguridad, multitenancy, stock y concurrencia.
```

---

### 6.2. Fuera de alcance técnico MVP

```text id="yh3qty"
- purchase orders completas;
- requisiciones de compra avanzadas;
- aprobación avanzada de compras;
- cotizaciones multi-proveedor;
- licitaciones;
- recepción avanzada de compras;
- inventario serializado obligatorio;
- lotes y vencimientos obligatorios;
- códigos QR/barcode;
- RFID;
- conteo cíclico avanzado;
- app móvil offline;
- activos fijos;
- depreciación;
- costeo FIFO/LIFO oficial;
- kardex contable oficial;
- contabilidad automática;
- integración SRI;
- facturación electrónica;
- ventas;
- portal de proveedores;
- endpoints /me;
- endpoints públicos;
- acceso desde WordPress público;
- IA externa con datos reales.
```

---

## 7. Dependencias internas

### 7.1. `001-tenants`

Uso:

```text id="sp23ww"
- tenant isolation;
- tenant status;
- resolución de currentTenant;
- ownership de todo recurso de inventario;
- respuesta 404 ante referencias cross-tenant.
```

Regla:

```text id="g5ob2m"
Toda entidad de inventario debe pertenecer a un tenant activo.
```

---

### 7.2. `002-users-roles`

Uso:

```text id="k4yvah"
- autenticación Keycloak;
- UserProfile;
- TenantMembership;
- roles;
- permisos;
- resolución de actor server-side;
- responsables de ubicación;
- usuarios que registran, aprueban, postean, cancelan o revierten movimientos.
```

Regla:

```text id="d3gc9w"
Keycloak autentica; RESIDENT Core autoriza.
```

---

### 7.3. `022-maintenance-work-orders`

Uso:

```text id="jehg2c"
- validar maintenanceWorkOrderId;
- validar maintenanceTaskId;
- registrar consumos de materiales;
- consultar consumos por orden;
- vincular movimientos de inventario a ejecución de mantenimiento.
```

Regla:

```text id="jomtdw"
Inventory Basic puede registrar consumo vinculado a Maintenance Work Orders, pero no cierra órdenes, no cambia estados de mantenimiento y no altera costos aprobados de mantenimiento salvo integración futura explícita.
```

---

### 7.4. `021-supplier-payments`

Uso:

```text id="ayjujt"
- validar supplierId referencial;
- validar supplierPayableId referencial;
- asociar entradas a proveedor o cuenta por pagar;
- consultar datos mínimos de proveedor para reportes administrativos.
```

Regla:

```text id="o4zl9c"
Inventory Basic no crea pagos, no crea SupplierPaymentOrder, no marca obligaciones como paid y no inicia transferencias.
```

---

### 7.5. `016-secure-document-storage`

Uso:

```text id="nhkbb5"
- facturas;
- recibos;
- actas de recepción;
- evidencias de ajuste;
- fotos;
- inventarios físicos;
- reportes técnicos;
- exportaciones.
```

Regla:

```text id="tdku5n"
Inventory Basic no almacena binarios; solo referencia documentos seguros.
```

---

### 7.6. `020-accounting-ledger`

Uso directo:

```text id="x1h7vf"
ninguno en MVP
```

Regla:

```text id="qf0ucp"
Inventory Basic no crea ni modifica JournalEntries.
```

La valorización de stock en MVP es referencial, no contable oficial.

---

### 7.7. `017-bank-reconciliation`

Uso directo:

```text id="ektrhz"
ninguno en MVP
```

Regla:

```text id="ofjfuh"
Inventory Basic no crea BankTransactions, no crea ReconciliationMatches y no confirma conciliaciones.
```

---

### 7.8. `007-audit`

Uso:

```text id="egl3p5"
- auditoría de categorías;
- auditoría de unidades;
- auditoría de ítems;
- auditoría de ubicaciones;
- auditoría de movimientos;
- auditoría de stock;
- auditoría de ajustes;
- auditoría de transferencias;
- auditoría de consumos;
- auditoría de documentos;
- auditoría de alertas;
- auditoría de reportes;
- auditoría de exportaciones.
```

---

### 7.9. `008-basic-reports`

Uso:

```text id="t9lghs"
- reportes operativos básicos;
- exportaciones;
- filtros transversales;
- integración futura con dashboard.
```

---

## 8. Estructura técnica del módulo

```text id="v8ycwp"
apps/api/src/modules/inventory-basic/
├── inventory-basic.module.ts
│
├── controllers/
│   ├── inventory-categories.controller.ts
│   ├── inventory-units.controller.ts
│   ├── inventory-items.controller.ts
│   ├── inventory-locations.controller.ts
│   ├── inventory-stock.controller.ts
│   ├── inventory-movements.controller.ts
│   ├── inventory-adjustments.controller.ts
│   ├── inventory-transfers.controller.ts
│   ├── inventory-consumptions.controller.ts
│   ├── inventory-documents.controller.ts
│   ├── inventory-alerts.controller.ts
│   └── inventory-reports.controller.ts
│
├── application/
│   ├── services/
│   │   ├── inventory-category.service.ts
│   │   ├── inventory-unit.service.ts
│   │   ├── inventory-item.service.ts
│   │   ├── inventory-location.service.ts
│   │   ├── inventory-stock.service.ts
│   │   ├── inventory-movement.service.ts
│   │   ├── inventory-adjustment.service.ts
│   │   ├── inventory-transfer.service.ts
│   │   ├── inventory-consumption.service.ts
│   │   ├── inventory-document.service.ts
│   │   ├── inventory-alert.service.ts
│   │   ├── inventory-report.service.ts
│   │   ├── inventory-export.service.ts
│   │   ├── inventory-audit.service.ts
│   │   └── inventory-observability.service.ts
│   │
│   ├── use-cases/
│   │   ├── create-inventory-item.use-case.ts
│   │   ├── post-inventory-movement.use-case.ts
│   │   ├── reverse-inventory-movement.use-case.ts
│   │   ├── create-stock-adjustment.use-case.ts
│   │   ├── approve-stock-adjustment.use-case.ts
│   │   ├── post-stock-adjustment.use-case.ts
│   │   ├── post-inventory-transfer.use-case.ts
│   │   ├── post-maintenance-consumption.use-case.ts
│   │   ├── recalculate-stock-balance.use-case.ts
│   │   └── export-inventory-report.use-case.ts
│   │
│   └── ports/
│       ├── inventory-category.repository.port.ts
│       ├── inventory-unit.repository.port.ts
│       ├── inventory-item.repository.port.ts
│       ├── inventory-location.repository.port.ts
│       ├── inventory-stock.repository.port.ts
│       ├── inventory-movement.repository.port.ts
│       ├── inventory-adjustment.repository.port.ts
│       ├── inventory-transfer.repository.port.ts
│       ├── inventory-consumption.repository.port.ts
│       ├── inventory-document.repository.port.ts
│       ├── inventory-alert.repository.port.ts
│       ├── inventory-audit.port.ts
│       ├── inventory-document-storage.port.ts
│       ├── inventory-maintenance.port.ts
│       ├── inventory-supplier-payments.port.ts
│       └── inventory-report-export.port.ts
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
│   ├── documents/
│   ├── maintenance/
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

```text id="qaybin"
- recibir requests HTTP;
- aplicar AuthGuard, TenantGuard y PermissionGuard;
- validar DTOs;
- resolver currentTenant;
- delegar casos de uso;
- devolver responses seguros;
- no contener reglas complejas de stock.
```

Controllers:

```text id="dtdcad"
InventoryCategoriesController
InventoryUnitsController
InventoryItemsController
InventoryLocationsController
InventoryStockController
InventoryMovementsController
InventoryAdjustmentsController
InventoryTransfersController
InventoryConsumptionsController
InventoryDocumentsController
InventoryAlertsController
InventoryReportsController
```

---

### 9.2. Application services

Responsabilidad:

```text id="y0jpdh"
- coordinar reglas de negocio;
- validar tenant scope;
- validar permisos;
- validar estado;
- calcular cantidades y costos;
- postear movimientos;
- actualizar saldos;
- crear alertas;
- invocar puertos de integración;
- emitir auditoría;
- manejar transacciones.
```

---

### 9.3. Domain entities

Entidades de dominio:

```text id="s4k2uq"
InventoryCategory
InventoryUnitOfMeasure
InventoryItem
InventoryStorageLocation
InventoryStockBalance
InventoryMovement
InventoryStockAdjustment
InventoryTransfer
InventoryConsumption
InventoryDocument
InventoryAlert
InventoryReportExport
```

---

### 9.4. Value objects

Value objects recomendados:

```text id="kvfgmd"
InventoryCategoryCode
InventoryCategoryName
InventoryUnitCode
InventoryUnitName
InventoryUnitSymbol
InventoryItemCode
InventoryItemName
InventoryLocationCode
InventoryLocationName
InventoryMovementNumber
InventoryAdjustmentNumber
InventoryTransferNumber
InventoryConsumptionNumber
InventoryQuantity
InventoryUnitCost
InventoryTotalCost
InventoryCurrency
InventoryReason
InventoryDocumentReference
InventoryReportPeriod
InventoryStockThreshold
```

---

### 9.5. Policies

Policies recomendadas:

```text id="fz1ia3"
InventoryTenantPolicy
InventoryCategoryPolicy
InventoryUnitPolicy
InventoryItemPolicy
InventoryLocationPolicy
InventoryStockPolicy
InventoryMovementPolicy
InventoryMovementPostingPolicy
InventoryMovementReversePolicy
InventoryNegativeStockPolicy
InventoryAdjustmentPolicy
InventoryAdjustmentApprovalPolicy
InventoryTransferPolicy
InventoryConsumptionPolicy
InventoryMaintenanceReferencePolicy
InventorySupplierReferencePolicy
InventoryDocumentPolicy
InventoryAlertPolicy
InventoryReportPolicy
NoPublicInventoryEndpointPolicy
NoMeInventoryEndpointPolicy
NoWordPressInventoryAccessPolicy
NoDirectInventoryPaymentPolicy
NoDirectInventoryAccountingPolicy
NoExternalAiInventoryDataPolicy
```

---

## 10. Modelo de datos propuesto

Tablas MVP:

```text id="vjf2ae"
inventory_categories
inventory_units
inventory_items
inventory_storage_locations
inventory_stock_balances
inventory_movements
inventory_stock_adjustments
inventory_transfers
inventory_consumptions
inventory_documents
inventory_alerts
inventory_report_exports
```

Todas deben incluir:

```text id="utqgif"
id
tenant_id
created_at
updated_at
```

Las entidades archivables deben incluir:

```text id="oz06qq"
archived_at
archived_by
archive_reason
```

Las entidades con estado deben incluir:

```text id="ijb386"
status
status_changed_at opcional
```

---

## 11. Relaciones principales

```text id="fx5b2x"
Tenant 1 -> N InventoryCategory
Tenant 1 -> N InventoryUnitOfMeasure
Tenant 1 -> N InventoryItem
Tenant 1 -> N InventoryStorageLocation
Tenant 1 -> N InventoryStockBalance
Tenant 1 -> N InventoryMovement

InventoryCategory 1 -> N InventoryItem
InventoryUnitOfMeasure 1 -> N InventoryItem
InventoryStorageLocation 1 -> N InventoryStockBalance
InventoryItem 1 -> N InventoryStockBalance
InventoryItem 1 -> N InventoryMovement
InventoryItem 1 -> N InventoryStockAdjustment
InventoryItem 1 -> N InventoryTransfer
InventoryItem 1 -> N InventoryConsumption

InventoryMovement 1 -> 0..1 InventoryStockAdjustment
InventoryMovement 1 -> 0..1 InventoryTransfer outMovement
InventoryMovement 1 -> 0..1 InventoryTransfer inMovement
InventoryMovement 1 -> 0..1 InventoryConsumption

InventoryDocument N -> 1 SecureDocument
InventoryAlert N -> 1 InventoryItem
InventoryReportExport N -> 1 SecureDocument
```

Referencias externas:

```text id="iasyit"
supplierId -> 021-supplier-payments
supplierPayableId -> 021-supplier-payments
maintenanceWorkOrderId -> 022-maintenance-work-orders
maintenanceTaskId -> 022-maintenance-work-orders
secureDocumentId -> 016-secure-document-storage
createdBy/postedBy/approvedBy/etc. -> 002-users-roles/UserProfile
```

---

## 12. Estrategia de multitenancy

### 12.1. Patrón obligatorio

Toda consulta tenant-scoped debe usar:

```typescript id="yaiuv4"
where: {
  id: resourceId,
  tenantId: currentTenant.id,
  archivedAt: null
}
```

Prohibido:

```typescript id="pdl1i3"
where: {
  id: resourceId
}
```

---

### 12.2. Referencias externas

Toda referencia externa debe validarse contra el mismo tenant:

```text id="qd2xkb"
categoryId
unitOfMeasureId
itemId
storageLocationId
targetStorageLocationId
movementId
adjustmentId
transferId
consumptionId
secureDocumentId
supplierId
supplierPayableId
maintenanceWorkOrderId
maintenanceTaskId
responsibleUserId
```

---

### 12.3. Respuesta cross-tenant

Si el recurso existe en otro tenant:

```http id="oxope0"
404 Not Found
```

No se debe responder `403` cuando eso revele existencia cross-tenant.

---

## 13. State machines

### 13.1. InventoryItem

Estados:

```text id="dvq7st"
draft
active
inactive
archived
```

Transiciones:

```text id="fnlx30"
draft -> active
active -> inactive
inactive -> active
active -> archived
inactive -> archived
draft -> archived
```

Reglas:

```text id="dcc5md"
- active permite movimientos.
- inactive no permite nuevos movimientos salvo ajuste autorizado.
- archived no permite movimientos.
```

---

### 13.2. InventoryMovement

Estados:

```text id="kjwz4b"
draft
posted
cancelled
reversed
archived
```

Transiciones:

```text id="p3tvkd"
draft -> posted
draft -> cancelled
posted -> reversed
posted -> archived
cancelled -> archived
reversed -> archived
```

Reglas:

```text id="kvwqhv"
- draft no afecta stock.
- posted afecta stock.
- posted no se edita destructivamente.
- reversed debe preservar trazabilidad.
- cancelled requiere reason.
```

---

### 13.3. InventoryStockAdjustment

Estados:

```text id="ckai2c"
draft
submitted
approved
rejected
posted
cancelled
archived
```

Transiciones:

```text id="m6k6mm"
draft -> submitted
submitted -> approved
submitted -> rejected
approved -> posted
draft -> cancelled
submitted -> cancelled
posted -> archived
rejected -> archived
cancelled -> archived
```

Reglas:

```text id="pq8zz5"
- rejected requiere reason.
- cancelled requiere reason.
- posted crea InventoryMovement.
- adjustmentDecrease valida stock disponible.
```

---

### 13.4. InventoryTransfer

Estados:

```text id="n5b3bm"
draft
posted
cancelled
reversed
archived
```

Transiciones:

```text id="nz7f7e"
draft -> posted
draft -> cancelled
posted -> reversed
posted -> archived
cancelled -> archived
reversed -> archived
```

Reglas:

```text id="evufp1"
- posted crea transferOut y transferIn.
- sourceStorageLocationId != targetStorageLocationId.
- transferOut no puede dejar stock negativo.
```

---

### 13.5. InventoryConsumption

Estados:

```text id="n17f88"
draft
posted
cancelled
reversed
archived
```

Transiciones:

```text id="l9x5q0"
draft -> posted
draft -> cancelled
posted -> reversed
posted -> archived
cancelled -> archived
reversed -> archived
```

Reglas:

```text id="ds2crw"
- posted crea movement maintenanceConsumption.
- debe vincular maintenanceWorkOrderId.
- no cambia estado de la orden de mantenimiento.
```

---

### 13.6. InventoryAlert

Estados:

```text id="op5s5f"
open
acknowledged
resolved
dismissed
archived
```

Transiciones:

```text id="m9fp4z"
open -> acknowledged
open -> resolved
open -> dismissed
acknowledged -> resolved
acknowledged -> dismissed
resolved -> archived
dismissed -> archived
```

---

## 14. Estrategia de stock

### 14.1. Movimiento como fuente de verdad

La regla de cálculo base:

```text id="nd9fj2"
openingBalance
+ receipt
+ adjustmentIncrease
+ transferIn
+ returnToStock
- issue
- maintenanceConsumption
- adjustmentDecrease
- transferOut
= quantityOnHand
```

Solo movimientos `posted` afectan saldo.

---

### 14.2. Snapshot operacional

`InventoryStockBalance` se usará como snapshot para performance.

Reglas:

```text id="h5vzil"
- se actualiza dentro de la misma transacción del movimiento posted;
- se puede recalcular desde InventoryMovement;
- no se modifica directamente desde DTO;
- quantityOnHand, quantityReserved y quantityAvailable son server-side.
```

---

### 14.3. Stock negativo

Por defecto:

```text id="yqcn2g"
inventory.allowNegativeStock = false
```

Regla:

```text id="mwd6kt"
Ninguna salida, consumo, transferencia o ajuste negativo puede dejar stock negativo salvo política futura explícita aprobada por ADR.
```

---

### 14.4. Cantidades

Todas las cantidades deben ser Decimal.

```json id="csdbf7"
{
  "quantity": "3.50"
}
```

Prohibido:

```json id="g35mu9"
{
  "quantity": 3.5
}
```

La precisión depende de la unidad de medida.

---

## 15. Estrategia de costos

### 15.1. Costos referenciales

Inventory Basic puede manejar costos referenciales:

```text id="e5f3xf"
referenceUnitCostAmount
unitCostAmount
totalCostAmount
averageUnitCostAmount
```

Regla:

```text id="m7zkr1"
La valorización de Inventory Basic es referencial en MVP y no equivale a contabilidad oficial.
```

---

### 15.2. Fórmula

```text id="le6ltb"
totalCostAmount = quantity * unitCostAmount
```

La fórmula se calcula server-side.

El cliente no envía `totalCostAmount` como fuente de verdad.

---

### 15.3. Moneda

MVP:

```text id="lro5tb"
USD
```

---

### 15.4. Prohibiciones

Inventory Basic no debe:

```text id="m611su"
- crear JournalEntry;
- crear Payment;
- crear SupplierPaymentOrder;
- marcar payable como paid;
- iniciar transferencia bancaria;
- modificar estado de conciliación;
- producir kardex contable oficial.
```

---

## 16. Estrategia de integración con Maintenance Work Orders

### 16.1. Puerto

Crear puerto:

```typescript id="bml22o"
export interface InventoryMaintenancePort {
  validateWorkOrder(input: ValidateInventoryMaintenanceWorkOrderInput): Promise<ValidatedMaintenanceWorkOrderResult>;
  validateTask(input: ValidateInventoryMaintenanceTaskInput): Promise<ValidatedMaintenanceTaskResult>;
  getWorkOrderSummary(input: GetInventoryMaintenanceWorkOrderInput): Promise<MaintenanceWorkOrderSummary>;
}
```

---

### 16.2. Validaciones

```text id="yzlr7y"
- maintenanceWorkOrderId pertenece al tenant;
- maintenanceWorkOrder no está archived;
- maintenanceTaskId pertenece a la orden si existe;
- la orden permite registrar consumo según estado;
- el usuario tiene permiso para consumo.
```

---

### 16.3. Reglas

```text id="pash0z"
Inventory puede vincular consumos a órdenes de mantenimiento, pero no debe cerrar, completar, cancelar, reabrir ni modificar estados de Maintenance Work Orders.
```

---

## 17. Estrategia de integración con Supplier Payments

### 17.1. Puerto

Crear puerto:

```typescript id="v56pmc"
export interface InventorySupplierPaymentsPort {
  validateSupplier(input: ValidateInventorySupplierInput): Promise<ValidatedInventorySupplierResult>;
  validateSupplierPayable(input: ValidateInventorySupplierPayableInput): Promise<ValidatedInventorySupplierPayableResult>;
  getSupplierSummary(input: GetInventorySupplierInput): Promise<InventorySupplierSummary>;
}
```

---

### 17.2. Validar proveedor

```text id="hwk9r9"
- supplierId pertenece al tenant;
- supplier status active;
- supplier no blocked;
- supplier no archived.
```

---

### 17.3. Validar payable

```text id="zlahot"
- supplierPayableId pertenece al tenant;
- payable corresponde al supplier si supplierId se informa;
- payable no está archived;
- payable es referencial, no gobernado por Inventory.
```

---

### 17.4. Prohibiciones

Inventory Basic no debe:

```text id="ro1ey9"
- crear SupplierPayable salvo ADR futuro;
- crear SupplierPaymentOrder;
- marcar SupplierPaymentOrder paid;
- crear Payment;
- crear PaymentAllocation;
- iniciar transferencia bancaria;
- modificar cuenta bancaria de proveedor;
- modificar estado de pago.
```

---

## 18. Estrategia de integración con Secure Document Storage

### 18.1. Puerto

Crear puerto:

```typescript id="i02sa0"
export interface InventoryDocumentStoragePort {
  validateDocumentBelongsToTenant(input: ValidateInventoryDocumentInput): Promise<void>;
  getDownloadAvailability(input: InventoryDocumentDownloadAvailabilityInput): Promise<InventoryDocumentAvailabilityResult>;
  createReportExport(input: CreateInventoryReportExportInput): Promise<InventoryReportExportResult>;
}
```

---

### 18.2. Metadata recomendada

```text id="w7h5xd"
sourceModule = inventoryBasic
sourceResourceType = inventoryDocument | inventoryReportExport
visibility = administrative
sensitivity = internal | restricted
```

---

### 18.3. Reglas

```text id="p6d4p2"
- no storageKey en API;
- no signedUrl persistente;
- no base64 en JSON;
- no binarios en logs;
- no binarios en audit;
- documentos se descargan vía SDS;
- toda descarga sensible se audita.
```

---

## 19. API técnica

### 19.1. Base path

```text id="v9qthp"
/api/v1
```

---

### 19.2. Superficies API

```text id="rm9q1q"
Tenant Admin API:
  /api/v1/tenant/inventory-*

Own User API:
  no existe en MVP

Public API:
  no existe en MVP
```

---

### 19.3. Tenant Admin API

Categorías:

```text id="st0m09"
GET    /api/v1/tenant/inventory-categories
POST   /api/v1/tenant/inventory-categories
GET    /api/v1/tenant/inventory-categories/{categoryId}
PATCH  /api/v1/tenant/inventory-categories/{categoryId}
POST   /api/v1/tenant/inventory-categories/{categoryId}/archive
```

Unidades:

```text id="hliofe"
GET    /api/v1/tenant/inventory-units
POST   /api/v1/tenant/inventory-units
GET    /api/v1/tenant/inventory-units/{unitId}
PATCH  /api/v1/tenant/inventory-units/{unitId}
POST   /api/v1/tenant/inventory-units/{unitId}/archive
```

Ítems:

```text id="mgon3e"
GET    /api/v1/tenant/inventory-items
POST   /api/v1/tenant/inventory-items
GET    /api/v1/tenant/inventory-items/{itemId}
PATCH  /api/v1/tenant/inventory-items/{itemId}
POST   /api/v1/tenant/inventory-items/{itemId}/activate
POST   /api/v1/tenant/inventory-items/{itemId}/deactivate
POST   /api/v1/tenant/inventory-items/{itemId}/archive
```

Ubicaciones:

```text id="twycg4"
GET    /api/v1/tenant/inventory-locations
POST   /api/v1/tenant/inventory-locations
GET    /api/v1/tenant/inventory-locations/{locationId}
PATCH  /api/v1/tenant/inventory-locations/{locationId}
POST   /api/v1/tenant/inventory-locations/{locationId}/archive
```

Stock:

```text id="hllzbx"
GET    /api/v1/tenant/inventory-stock
GET    /api/v1/tenant/inventory-stock/{itemId}
POST   /api/v1/tenant/inventory-stock/recalculate
```

Movimientos:

```text id="yqc8ha"
GET    /api/v1/tenant/inventory-movements
POST   /api/v1/tenant/inventory-movements
GET    /api/v1/tenant/inventory-movements/{movementId}
POST   /api/v1/tenant/inventory-movements/{movementId}/post
POST   /api/v1/tenant/inventory-movements/{movementId}/cancel
POST   /api/v1/tenant/inventory-movements/{movementId}/reverse
POST   /api/v1/tenant/inventory-movements/{movementId}/archive
```

Ajustes:

```text id="e61wjp"
GET    /api/v1/tenant/inventory-adjustments
POST   /api/v1/tenant/inventory-adjustments
GET    /api/v1/tenant/inventory-adjustments/{adjustmentId}
POST   /api/v1/tenant/inventory-adjustments/{adjustmentId}/submit
POST   /api/v1/tenant/inventory-adjustments/{adjustmentId}/approve
POST   /api/v1/tenant/inventory-adjustments/{adjustmentId}/reject
POST   /api/v1/tenant/inventory-adjustments/{adjustmentId}/post
POST   /api/v1/tenant/inventory-adjustments/{adjustmentId}/cancel
```

Transferencias:

```text id="brf909"
GET    /api/v1/tenant/inventory-transfers
POST   /api/v1/tenant/inventory-transfers
GET    /api/v1/tenant/inventory-transfers/{transferId}
POST   /api/v1/tenant/inventory-transfers/{transferId}/post
POST   /api/v1/tenant/inventory-transfers/{transferId}/cancel
POST   /api/v1/tenant/inventory-transfers/{transferId}/reverse
```

Consumos:

```text id="u5pcd0"
GET    /api/v1/tenant/inventory-consumptions
POST   /api/v1/tenant/inventory-consumptions
GET    /api/v1/tenant/inventory-consumptions/{consumptionId}
POST   /api/v1/tenant/inventory-consumptions/{consumptionId}/post
POST   /api/v1/tenant/inventory-consumptions/{consumptionId}/cancel
POST   /api/v1/tenant/inventory-consumptions/{consumptionId}/reverse
GET    /api/v1/tenant/maintenance-work-orders/{workOrderId}/inventory-consumptions
```

Documentos, alertas y reportes:

```text id="ai7glq"
GET    /api/v1/tenant/inventory-documents
POST   /api/v1/tenant/inventory-documents
GET    /api/v1/tenant/inventory-documents/{documentId}
POST   /api/v1/tenant/inventory-documents/{documentId}/archive

GET    /api/v1/tenant/inventory-alerts
POST   /api/v1/tenant/inventory-alerts/{alertId}/acknowledge
POST   /api/v1/tenant/inventory-alerts/{alertId}/resolve
POST   /api/v1/tenant/inventory-alerts/{alertId}/dismiss

GET    /api/v1/tenant/inventory-reports/stock
GET    /api/v1/tenant/inventory-reports/movements
GET    /api/v1/tenant/inventory-reports/consumption
GET    /api/v1/tenant/inventory-reports/low-stock
GET    /api/v1/tenant/inventory-reports/valuation
GET    /api/v1/tenant/inventory-reports/export
```

---

### 19.4. Endpoints `/me` prohibidos

No implementar:

```text id="ff3cx7"
GET  /api/v1/me/inventory-items
GET  /api/v1/me/inventory-stock
GET  /api/v1/me/inventory-movements
POST /api/v1/me/inventory-consumptions
```

Respuesta esperada:

```http id="tasb3y"
404 Not Found
```

---

### 19.5. Endpoints públicos prohibidos

No implementar:

```text id="qqxcdd"
GET  /api/v1/public/inventory-items
GET  /api/v1/public/inventory-stock
GET  /api/v1/public/inventory-movements
GET  /api/v1/public/inventory-reports
GET  /api/v1/public/tenants/{slug}/inventory-items
GET  /api/v1/public/tenants/{slug}/inventory-stock
```

Respuesta esperada:

```http id="gmnrep"
404 Not Found
```

---

## 20. DTOs principales

### 20.1. Categorías

```text id="zfx88f"
CreateInventoryCategoryDto
UpdateInventoryCategoryDto
ArchiveInventoryCategoryDto
InventoryCategoryDto
InventoryCategoryListItemDto
InventoryCategoryFilterDto
```

---

### 20.2. Unidades de medida

```text id="rdlykn"
CreateInventoryUnitDto
UpdateInventoryUnitDto
ArchiveInventoryUnitDto
InventoryUnitDto
InventoryUnitListItemDto
InventoryUnitFilterDto
```

---

### 20.3. Ítems

```text id="h9ve70"
CreateInventoryItemDto
UpdateInventoryItemDto
ActivateInventoryItemDto
DeactivateInventoryItemDto
ArchiveInventoryItemDto
InventoryItemDto
InventoryItemListItemDto
InventoryItemFilterDto
```

---

### 20.4. Ubicaciones

```text id="jetavt"
CreateInventoryLocationDto
UpdateInventoryLocationDto
ArchiveInventoryLocationDto
InventoryLocationDto
InventoryLocationListItemDto
InventoryLocationFilterDto
```

---

### 20.5. Stock y movimientos

```text id="qcqst1"
InventoryStockBalanceDto
InventoryStockFilterDto
RecalculateInventoryStockDto

CreateInventoryMovementDto
PostInventoryMovementDto
CancelInventoryMovementDto
ReverseInventoryMovementDto
ArchiveInventoryMovementDto
InventoryMovementDto
InventoryMovementListItemDto
InventoryMovementFilterDto
```

---

### 20.6. Ajustes, transferencias y consumos

```text id="u61yx5"
CreateInventoryAdjustmentDto
SubmitInventoryAdjustmentDto
ApproveInventoryAdjustmentDto
RejectInventoryAdjustmentDto
PostInventoryAdjustmentDto
CancelInventoryAdjustmentDto
InventoryAdjustmentDto

CreateInventoryTransferDto
PostInventoryTransferDto
CancelInventoryTransferDto
ReverseInventoryTransferDto
InventoryTransferDto

CreateInventoryConsumptionDto
PostInventoryConsumptionDto
CancelInventoryConsumptionDto
ReverseInventoryConsumptionDto
InventoryConsumptionDto
```

---

### 20.7. Documentos, alertas y reportes

```text id="yygo37"
CreateInventoryDocumentDto
ArchiveInventoryDocumentDto
InventoryDocumentDto

InventoryAlertDto
AcknowledgeInventoryAlertDto
ResolveInventoryAlertDto
DismissInventoryAlertDto

InventoryReportFilterDto
InventoryStockReportDto
InventoryMovementReportDto
InventoryConsumptionReportDto
InventoryLowStockReportDto
InventoryValuationReportDto
InventoryReportExportDto
```

---

## 21. Campos prohibidos en DTOs externos

Todo DTO externo debe rechazar:

```text id="qu2g39"
tenantId
createdBy
updatedBy
postedBy
approvedBy
rejectedBy
cancelledBy
archivedBy
status directo fuera de endpoints de transición
quantityOnHand
quantityAvailable
quantityReserved
averageUnitCostAmount
totalCostAmount
movementNumber
adjustmentNumber
transferNumber
consumptionNumber
storageKey
signedUrl
base64
rawFilePayload
paymentOrderId
journalEntryId
bankTransactionId
reconciliationMatchId
paymentInitiation
bankTransferInstruction
openBankingPaymentInitiation
externalAiEnabled
```

---

## 22. Seguridad técnica

### 22.1. Guards

```text id="hlzvi1"
AuthGuard
TenantGuard
PermissionGuard
InventoryCategoryTenantGuard
InventoryUnitTenantGuard
InventoryItemTenantGuard
InventoryLocationTenantGuard
InventoryStockTenantGuard
InventoryMovementTenantGuard
InventoryAdjustmentTenantGuard
InventoryTransferTenantGuard
InventoryConsumptionTenantGuard
InventoryDocumentTenantGuard
InventoryAlertTenantGuard
```

---

### 22.2. Reglas de seguridad

```text id="ue450t"
- tenantId no se recibe desde cliente;
- actor se resuelve server-side;
- status se modifica solo por endpoints de transición;
- no endpoints públicos;
- no endpoints /me;
- no WordPress access;
- no storageKey;
- no signedUrl persistente;
- no base64;
- no raw file payload;
- no pagos directos;
- no SupplierPaymentOrder;
- no JournalEntry;
- no Bank Reconciliation;
- no IA externa con datos reales.
```

---

## 23. Auditoría

### 23.1. Eventos mínimos

```text id="f4ge83"
inventoryCategory.created
inventoryCategory.updated
inventoryCategory.archived

inventoryUnit.created
inventoryUnit.updated
inventoryUnit.archived

inventoryItem.created
inventoryItem.updated
inventoryItem.activated
inventoryItem.deactivated
inventoryItem.archived

inventoryLocation.created
inventoryLocation.updated
inventoryLocation.archived

inventoryMovement.created
inventoryMovement.posted
inventoryMovement.cancelled
inventoryMovement.reversed
inventoryMovement.archived

inventoryAdjustment.created
inventoryAdjustment.submitted
inventoryAdjustment.approved
inventoryAdjustment.rejected
inventoryAdjustment.posted
inventoryAdjustment.cancelled

inventoryTransfer.created
inventoryTransfer.posted
inventoryTransfer.cancelled
inventoryTransfer.reversed

inventoryConsumption.created
inventoryConsumption.posted
inventoryConsumption.cancelled
inventoryConsumption.reversed

inventoryDocument.created
inventoryDocument.downloaded
inventoryDocument.archived

inventoryAlert.created
inventoryAlert.acknowledged
inventoryAlert.resolved
inventoryAlert.dismissed

inventoryReport.generated
inventoryReport.exported
```

---

### 23.2. Metadata permitida

```text id="ipwdmy"
itemId
itemCode
categoryId
unitOfMeasureId
storageLocationId
movementId
movementNumber
movementType
movementDirection
quantity
unitCostAmount
totalCostAmount
currency
adjustmentId
transferId
consumptionId
maintenanceWorkOrderId
maintenanceTaskId
supplierId
supplierPayableId
secureDocumentId
alertId
reportType
format
fromStatus
toStatus
outcome
traceId
```

---

### 23.3. Metadata prohibida

```text id="ewt96s"
storageKey
signedUrl
base64
raw file payload
tokens
secrets
passwords
SQL raw
stack trace productivo
datos bancarios
raw supplier payload
raw payment payload
datos cross-tenant
```

---

## 24. Observabilidad

### 24.1. Logs

Eventos loggeables:

```text id="xtvqd9"
inventoryItem.created
inventoryItem.activated
inventoryMovement.created
inventoryMovement.posted
inventoryMovement.reversed
inventoryAdjustment.approved
inventoryAdjustment.posted
inventoryTransfer.posted
inventoryConsumption.posted
inventoryAlert.created
inventoryReport.exported
```

Campos permitidos:

```text id="mcbevl"
traceId
requestId
correlationId
action
outcome
itemType
movementType
movementDirection
status
alertType
severity
reportType
format
durationMs
errorCode
```

Campos prohibidos:

```text id="fvuuj7"
tenantId como label
itemId como label
locationId como label
movementId como label
userId como label
supplierId como label
maintenanceWorkOrderId como label
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

```text id="xmx98f"
inventory_items_total
inventory_active_items_total
inventory_stock_balances_total
inventory_low_stock_alerts_total
inventory_out_of_stock_alerts_total
inventory_movements_total
inventory_receipts_total
inventory_issues_total
inventory_adjustments_total
inventory_transfers_total
inventory_consumptions_total
inventory_consumption_quantity_total
inventory_report_exports_total
```

Labels permitidos:

```text id="c494wk"
itemType
movementType
movementDirection
status
alertType
severity
reportType
format
outcome
```

---

## 25. Reportes técnicos MVP

### 25.1. Stock actual

```text id="u12rea"
Muestra quantityOnHand, quantityReserved y quantityAvailable por ítem, categoría y ubicación.
```

---

### 25.2. Movimientos por periodo

```text id="kwhqad"
Muestra entradas, salidas, ajustes, transferencias, consumos y reversos por periodo, ítem y ubicación.
```

---

### 25.3. Consumo por mantenimiento

```text id="e3i5cj"
Muestra materiales consumidos por Maintenance Work Order, tarea, ítem, categoría, ubicación y periodo.
```

---

### 25.4. Bajo stock

```text id="qb9em4"
Muestra ítems con quantityAvailable menor o igual al minimumStockQuantity o reorderPointQuantity.
```

---

### 25.5. Valorización referencial

```text id="x3mgpm"
Muestra valorización referencial de stock usando averageUnitCostAmount o referenceUnitCostAmount.
```

Regla:

```text id="j9z2er"
Este reporte no es contable oficial.
```

---

## 26. OpenAPI

### 26.1. Tags

```text id="b2snh0"
Inventory Categories
Inventory Units
Inventory Items
Inventory Locations
Inventory Stock
Inventory Movements
Inventory Adjustments
Inventory Transfers
Inventory Consumptions
Inventory Documents
Inventory Alerts
Inventory Reports
```

---

### 26.2. Extensions

Todas las rutas tenant:

```yaml id="w1t928"
x-tenant-scope: true
x-auth-required: true
x-inventory-basic: true
x-public-exposure: false
```

Rutas con stock:

```yaml id="eh36ha"
x-stock-controlled: true
x-movement-driven: true
x-negative-stock-default: false
```

Rutas con documentos:

```yaml id="z6ogzp"
x-secure-document-storage: true
x-storage-key-exposed: false
```

Rutas con costos:

```yaml id="h0farz"
x-decimal-money: true
x-reference-valuation-only: true
x-direct-accounting: false
```

Rutas con Supplier Payments:

```yaml id="i4g4xd"
x-supplier-payments-linked: true
x-payment-creation: false
x-supplier-payment-order-created: false
x-supplier-payment-mark-paid: false
```

Restricciones globales:

```yaml id="zgd7q1"
x-public-endpoint: false
x-me-endpoint: false
x-wordpress-access: false
x-open-banking-payment-initiation: false
x-bank-transfer-initiation: false
x-external-ai-real-data: false
```

---

## 27. Estrategia de implementación

### 27.1. Fase 1 — Foundation

```text id="v2qspu"
1. Crear estructura del módulo.
2. Registrar módulo NestJS.
3. Crear configuración.
4. Crear feature flags.
5. Crear enums.
6. Crear errores de dominio.
7. Crear value objects.
8. Crear policies base.
```

---

### 27.2. Fase 2 — Modelo de datos

```text id="ax12hu"
1. Crear Prisma enums.
2. Crear Prisma models.
3. Crear migración 023.
4. Crear índices tenant-scoped.
5. Crear constraints.
6. Crear relaciones con Tenant.
7. Crear seeds mínimos.
```

---

### 27.3. Fase 3 — Catálogos base

```text id="jh6y34"
1. Implementar InventoryCategory.
2. Implementar InventoryUnitOfMeasure.
3. Implementar InventoryStorageLocation.
4. Implementar InventoryItem.
5. Implementar activación/inactivación/archivo.
6. Implementar tests.
```

---

### 27.4. Fase 4 — Stock y movimientos

```text id="uih6dp"
1. Implementar InventoryStockBalance.
2. Implementar InventoryMovement.
3. Implementar post movement.
4. Implementar cancel movement draft.
5. Implementar reverse movement posted.
6. Implementar actualización transaccional de saldos.
7. Implementar recalculation.
```

---

### 27.5. Fase 5 — Ajustes

```text id="nlko8n"
1. Implementar InventoryStockAdjustment.
2. Implementar submit.
3. Implementar approve.
4. Implementar reject.
5. Implementar post adjustment.
6. Crear movement asociado.
7. Auditar.
```

---

### 27.6. Fase 6 — Transferencias

```text id="skt0wp"
1. Implementar InventoryTransfer.
2. Validar origen/destino.
3. Validar stock disponible.
4. Postear transferOut.
5. Postear transferIn.
6. Actualizar saldos.
7. Auditar.
```

---

### 27.7. Fase 7 — Consumos de mantenimiento

```text id="w6un89"
1. Implementar InventoryConsumption.
2. Integrar Maintenance Work Orders mediante puerto.
3. Validar workOrder y task.
4. Crear movement maintenanceConsumption.
5. Actualizar stock.
6. No modificar estado de mantenimiento.
7. Auditar.
```

---

### 27.8. Fase 8 — Documentos y SDS

```text id="tghbfm"
1. Implementar InventoryDocument.
2. Integrar Secure Document Storage.
3. Validar secureDocumentId tenant-scoped.
4. Implementar documentos por entidad.
5. Implementar export vía SDS.
6. Probar no storageKey.
```

---

### 27.9. Fase 9 — Supplier Payments boundary

```text id="p2hd1v"
1. Crear puerto hacia Supplier Payments.
2. Validar supplierId.
3. Validar supplierPayableId.
4. Asociar supplier/payable a entrada si aplica.
5. Probar que no se crean pagos ni SupplierPaymentOrders.
```

---

### 27.10. Fase 10 — Alertas, reportes y exportaciones

```text id="w14zm0"
1. Implementar lowStock.
2. Implementar outOfStock.
3. Implementar acknowledge/resolve/dismiss.
4. Implementar reportes.
5. Implementar exports.
6. Auditar generación y exportación.
```

---

### 27.11. Fase 11 — Seguridad, auditoría y observabilidad

```text id="nvvvxz"
1. Implementar audit events.
2. Implementar log sanitizer.
3. Implementar métricas.
4. Implementar OpenAPI.
5. Implementar security tests.
6. Implementar CI gates.
```

---

## 28. Feature flags

```text id="n85yje"
inventoryBasic.enabled = true
inventoryBasic.categories.enabled = true
inventoryBasic.units.enabled = true
inventoryBasic.items.enabled = true
inventoryBasic.locations.enabled = true
inventoryBasic.stock.enabled = true
inventoryBasic.movements.enabled = true
inventoryBasic.adjustments.enabled = true
inventoryBasic.transfers.enabled = true
inventoryBasic.consumptions.enabled = true
inventoryBasic.documents.enabled = true
inventoryBasic.alerts.enabled = true
inventoryBasic.reports.enabled = true
inventoryBasic.exports.enabled = true
inventoryBasic.supplierPaymentsIntegration.enabled = true
inventoryBasic.maintenanceIntegration.enabled = true
inventoryBasic.allowNegativeStock.enabled = false
inventoryBasic.publicEndpoints.enabled = false
inventoryBasic.meEndpoints.enabled = false
inventoryBasic.wordpressAccess.enabled = false
inventoryBasic.directPayments.enabled = false
inventoryBasic.supplierPaymentOrderCreation.enabled = false
inventoryBasic.bankTransferInitiation.enabled = false
inventoryBasic.openBankingPaymentInitiation.enabled = false
inventoryBasic.directAccounting.enabled = false
inventoryBasic.externalAi.enabled = false
```

---

## 29. Variables de entorno recomendadas

```text id="x0o10c"
INVENTORY_BASIC_ENABLED=true
INVENTORY_DEFAULT_CURRENCY=USD
INVENTORY_ALLOW_NEGATIVE_STOCK=false
INVENTORY_REQUIRE_REASON_FOR_MANUAL_MOVEMENTS=true
INVENTORY_REQUIRE_REASON_FOR_ADJUSTMENTS=true
INVENTORY_REQUIRE_REASON_FOR_TRANSFERS=true
INVENTORY_REQUIRE_REASON_FOR_REVERSALS=true
INVENTORY_ADJUSTMENTS_REQUIRE_APPROVAL=true
INVENTORY_MAX_REPORT_PAGE_SIZE=100
INVENTORY_REPORT_EXPORT_ENABLED=true
INVENTORY_SUPPLIER_PAYMENTS_INTEGRATION_ENABLED=true
INVENTORY_MAINTENANCE_INTEGRATION_ENABLED=true
INVENTORY_PUBLIC_ENDPOINTS_ENABLED=false
INVENTORY_ME_ENDPOINTS_ENABLED=false
INVENTORY_WORDPRESS_ACCESS_ENABLED=false
INVENTORY_DIRECT_PAYMENTS_ENABLED=false
INVENTORY_SUPPLIER_PAYMENT_ORDER_CREATION_ENABLED=false
INVENTORY_BANK_TRANSFER_INITIATION_ENABLED=false
INVENTORY_OPEN_BANKING_PAYMENT_INITIATION_ENABLED=false
INVENTORY_DIRECT_ACCOUNTING_ENABLED=false
INVENTORY_EXTERNAL_AI_ENABLED=false
```

Regla:

```text id="j4tkw9"
El boot o CI debe fallar si una bandera prohibida se habilita en MVP sin ADR explícito.
```

---

## 30. Seeds iniciales

Categorías sugeridas:

```text id="mz0p4x"
CLEANING — Limpieza
PLUMBING — Plomería
ELECTRICAL — Electricidad
GARDENING — Jardinería
SECURITY — Seguridad
PAINTING — Pintura
MINOR_TOOLS — Herramientas menores
SPARE_PARTS — Repuestos
OFFICE — Oficina
SAFETY — Seguridad industrial
OTHER — Otros
```

Unidades sugeridas:

```text id="thnavi"
UNIT — Unidad
METER — Metro
LITER — Litro
GALLON — Galón
KILOGRAM — Kilogramo
PACKAGE — Paquete
BOX — Caja
ROLL — Rollo
PAIR — Par
SET — Juego
BOTTLE — Botella
BAG — Saco
```

Ubicaciones sugeridas:

```text id="ox1ugy"
MAIN_WAREHOUSE — Bodega principal
GUARDHOUSE — Garita
PUMP_ROOM — Cuarto de bombas
ADMIN_OFFICE — Oficina de administración
MAINTENANCE_ROOM — Área de mantenimiento
TECHNICAL_CABINET — Casillero técnico
TEMPORARY_STORAGE — Almacenamiento temporal
```

Regla:

```text id="epdp56"
Los seeds deben usar datos ficticios y no deben incluir proveedores, documentos, facturas, fotos ni datos reales.
```

---

## 31. Errores de dominio

Catálogo preliminar:

```text id="ovxpru"
INVENTORY_CATEGORY_NOT_FOUND
INVENTORY_CATEGORY_DUPLICATE_CODE
INVENTORY_CATEGORY_INVALID_STATUS

INVENTORY_UNIT_NOT_FOUND
INVENTORY_UNIT_DUPLICATE_CODE
INVENTORY_UNIT_INVALID_STATUS
INVENTORY_UNIT_DECIMAL_PRECISION_INVALID

INVENTORY_ITEM_NOT_FOUND
INVENTORY_ITEM_DUPLICATE_CODE
INVENTORY_ITEM_INVALID_STATUS
INVENTORY_ITEM_ARCHIVED
INVENTORY_ITEM_INACTIVE
INVENTORY_ITEM_CROSS_TENANT_REFERENCE

INVENTORY_LOCATION_NOT_FOUND
INVENTORY_LOCATION_DUPLICATE_CODE
INVENTORY_LOCATION_INVALID_STATUS
INVENTORY_LOCATION_ARCHIVED
INVENTORY_LOCATION_INACTIVE
INVENTORY_LOCATION_CROSS_TENANT_REFERENCE

INVENTORY_STOCK_BALANCE_NOT_FOUND
INVENTORY_STOCK_NEGATIVE_FORBIDDEN
INVENTORY_STOCK_INSUFFICIENT
INVENTORY_STOCK_RESERVED_EXCEEDS_ON_HAND

INVENTORY_MOVEMENT_NOT_FOUND
INVENTORY_MOVEMENT_INVALID_STATUS
INVENTORY_MOVEMENT_INVALID_TRANSITION
INVENTORY_MOVEMENT_QUANTITY_INVALID
INVENTORY_MOVEMENT_UNIT_COST_INVALID
INVENTORY_MOVEMENT_REASON_REQUIRED
INVENTORY_MOVEMENT_POSTED_IMMUTABLE

INVENTORY_ADJUSTMENT_NOT_FOUND
INVENTORY_ADJUSTMENT_INVALID_STATUS
INVENTORY_ADJUSTMENT_INVALID_TRANSITION
INVENTORY_ADJUSTMENT_REASON_REQUIRED
INVENTORY_ADJUSTMENT_REJECTION_REASON_REQUIRED

INVENTORY_TRANSFER_NOT_FOUND
INVENTORY_TRANSFER_INVALID_STATUS
INVENTORY_TRANSFER_INVALID_TRANSITION
INVENTORY_TRANSFER_SAME_LOCATION_FORBIDDEN
INVENTORY_TRANSFER_REASON_REQUIRED
INVENTORY_TRANSFER_INSUFFICIENT_STOCK

INVENTORY_CONSUMPTION_NOT_FOUND
INVENTORY_CONSUMPTION_INVALID_STATUS
INVENTORY_CONSUMPTION_WORK_ORDER_REQUIRED
INVENTORY_CONSUMPTION_WORK_ORDER_INVALID
INVENTORY_CONSUMPTION_TASK_INVALID
INVENTORY_CONSUMPTION_INSUFFICIENT_STOCK

INVENTORY_DOCUMENT_NOT_FOUND
INVENTORY_DOCUMENT_STORAGE_KEY_FORBIDDEN
INVENTORY_DOCUMENT_CROSS_TENANT_REFERENCE

INVENTORY_ALERT_NOT_FOUND
INVENTORY_ALERT_INVALID_STATUS

INVENTORY_SUPPLIER_NOT_FOUND
INVENTORY_SUPPLIER_INVALID_STATUS
INVENTORY_SUPPLIER_BLOCKED
INVENTORY_SUPPLIER_CROSS_TENANT_REFERENCE

INVENTORY_PAYABLE_NOT_FOUND
INVENTORY_PAYABLE_CROSS_TENANT_REFERENCE

INVENTORY_PUBLIC_ENDPOINT_FORBIDDEN
INVENTORY_ME_ENDPOINT_FORBIDDEN
INVENTORY_WORDPRESS_ACCESS_FORBIDDEN
INVENTORY_DIRECT_PAYMENT_FORBIDDEN
INVENTORY_SUPPLIER_PAYMENT_ORDER_FORBIDDEN
INVENTORY_DIRECT_ACCOUNTING_FORBIDDEN
INVENTORY_EXTERNAL_AI_FORBIDDEN
```

---

## 32. Testing plan resumido

El test-plan detallado se desarrollará en:

```text id="g5ais5"
docs/specs/023-inventory-basic/test-plan.md
```

Cobertura mínima esperada:

```text id="iakhna"
- Value objects.
- Entities.
- State machines.
- Domain policies.
- Repositories.
- Services.
- Stock calculations.
- Posting/reversal.
- Adjustments.
- Transfers.
- Consumption.
- Integrations.
- API.
- Authorization.
- Multitenancy.
- Security.
- Audit.
- Observability.
- OpenAPI.
- Reports.
- Exports.
- Performance.
- Concurrency.
- Regression.
- Smoke.
```

Tests críticos:

```text id="e5f6p9"
- tenant A no accede inventario tenant B;
- DTO rechaza tenantId;
- DTO rechaza quantityOnHand directo;
- DTO rechaza totalCostAmount directo;
- entrada posted incrementa stock;
- salida posted disminuye stock;
- consumo posted disminuye stock y vincula mantenimiento;
- salida mayor a stock disponible se rechaza;
- transferencia a misma ubicación se rechaza;
- posted movement no se edita destructivamente;
- stock balance se recalcula desde movimientos;
- no storageKey en API;
- Inventory no crea Payment;
- Inventory no crea SupplierPaymentOrder;
- Inventory no crea JournalEntry;
- no endpoints públicos;
- no endpoints /me;
- WordPress access bloqueado.
```

---

## 33. Performance

Objetivos iniciales:

```text id="bqztad"
p95 < 800 ms para listar ítems paginados.
p95 < 1000 ms para consultar stock paginado.
p95 < 1200 ms para listar movimientos paginados.
p95 < 1500 ms para reporte de stock actual.
p95 < 2000 ms para reporte de movimientos por periodo.
```

Controles:

```text id="pnmaff"
- pageSize max 100;
- índices por tenant/status/category/location/item/date;
- evitar N+1;
- DTOs list-item livianos;
- snapshots de stock para lectura;
- recalculation controlado;
- exportaciones pesadas vía job futuro si aplica.
```

---

## 34. Índices recomendados

```text id="s8a1vs"
inventory_categories:
  tenant_id, category_code unique active
  tenant_id, status

inventory_units:
  tenant_id, unit_code unique active
  tenant_id, status

inventory_items:
  tenant_id, item_code unique active
  tenant_id, category_id
  tenant_id, unit_of_measure_id
  tenant_id, status
  tenant_id, item_type
  tenant_id, preferred_supplier_id

inventory_storage_locations:
  tenant_id, location_code unique active
  tenant_id, status
  tenant_id, location_type
  tenant_id, responsible_user_id

inventory_stock_balances:
  tenant_id, item_id, storage_location_id unique
  tenant_id, item_id
  tenant_id, storage_location_id
  tenant_id, quantity_available

inventory_movements:
  tenant_id, movement_number unique
  tenant_id, item_id
  tenant_id, storage_location_id
  tenant_id, movement_type
  tenant_id, movement_direction
  tenant_id, status
  tenant_id, created_at
  tenant_id, posted_at
  tenant_id, reference_type, reference_id

inventory_stock_adjustments:
  tenant_id, adjustment_number unique
  tenant_id, item_id
  tenant_id, storage_location_id
  tenant_id, status

inventory_transfers:
  tenant_id, transfer_number unique
  tenant_id, item_id
  tenant_id, source_storage_location_id
  tenant_id, target_storage_location_id
  tenant_id, status

inventory_consumptions:
  tenant_id, consumption_number unique
  tenant_id, item_id
  tenant_id, maintenance_work_order_id
  tenant_id, maintenance_task_id
  tenant_id, status

inventory_documents:
  tenant_id, entity_type, entity_id
  tenant_id, secure_document_id

inventory_alerts:
  tenant_id, item_id
  tenant_id, storage_location_id
  tenant_id, alert_type
  tenant_id, status

inventory_report_exports:
  tenant_id, report_type
  tenant_id, status
  tenant_id, created_at
```

---

## 35. Riesgos técnicos

| Riesgo                         | Mitigación                                                |
| ------------------------------ | --------------------------------------------------------- |
| Stock negativo accidental      | Validación de stock disponible + transacciones + CI tests |
| Movimientos duplicados         | movementNumber único + idempotency futura                 |
| Saldo inconsistente            | StockBalance snapshot + recalculation desde movements     |
| Consumo sin orden válida       | InventoryMaintenancePort + tests                          |
| Proveedor bloqueado usado      | InventorySupplierPaymentsPort + policy                    |
| Costo tratado como contable    | Reference valuation only + no Ledger integration          |
| Entrada tratada como pago      | Supplier Payments boundary + tests                        |
| Documento expuesto             | SDS + no storageKey + audit                               |
| Reportes cross-tenant          | tenant-scoped queries + tests                             |
| Reversos mal implementados     | state machine + movimiento de reverso controlado          |
| Concurrencia en stock          | transacciones y locks por item/location                   |
| WordPress accede indebidamente | no public/no me/CORS restrictivo                          |

---

## 36. Plan de PRs sugerido

```text id="t9fikf"
PR-023-01 — Module skeleton, enums, config and feature flags.
PR-023-02 — Value objects, entities, state machines and policies.
PR-023-03 — Prisma schema, migration, constraints and indexes.
PR-023-04 — Repository ports and Prisma repositories.
PR-023-05 — Categories, units, locations and items.
PR-023-06 — Stock balances and recalculation.
PR-023-07 — Inventory movements posting/cancel/reverse.
PR-023-08 — Stock adjustments.
PR-023-09 — Transfers between locations.
PR-023-10 — Maintenance consumptions.
PR-023-11 — Documents via Secure Document Storage.
PR-023-12 — Supplier Payments references.
PR-023-13 — Alerts.
PR-023-14 — Reports and exports.
PR-023-15 — Audit, observability and OpenAPI.
PR-023-16 — Security hardening, regression tests and CI gates.
```

---

## 37. Smoke flow técnico

### 37.1. Catálogo y stock inicial

```text id="da2us8"
1. TenantAdmin crea categoría PLUMBING.
2. TenantAdmin crea unidad UNIT.
3. InventoryManager crea ubicación MAIN_WAREHOUSE.
4. InventoryManager crea ítem VALVE_1_2.
5. InventoryManager registra openingBalance.
6. Sistema postea movimiento.
7. Sistema crea o actualiza InventoryStockBalance.
8. Sistema audita inventoryMovement.posted.
```

---

### 37.2. Entrada y salida manual

```text id="fyh8q0"
1. InventoryManager registra receipt de 10 unidades.
2. Sistema valida item active.
3. Sistema valida ubicación active.
4. Sistema calcula totalCostAmount.
5. Sistema postea movimiento.
6. Stock incrementa.
7. InventoryManager registra issue de 2 unidades con reason.
8. Sistema valida stock disponible.
9. Sistema postea movimiento.
10. Stock disminuye.
```

---

### 37.3. Consumo en mantenimiento

```text id="z68ysc"
1. MaintenanceManager crea work order.
2. InventoryManager consulta stock disponible.
3. InventoryManager crea consumption vinculado a workOrder.
4. Sistema valida maintenanceWorkOrder tenant-scoped.
5. Sistema valida stock disponible.
6. Sistema postea consumption.
7. Sistema crea movement maintenanceConsumption.
8. Stock disminuye.
9. Maintenance Work Order no cambia de estado.
10. Sistema audita inventoryConsumption.posted.
```

---

### 37.4. Transferencia

```text id="hnvphx"
1. InventoryManager crea ubicación MAINTENANCE_ROOM.
2. InventoryManager crea transferencia desde MAIN_WAREHOUSE hacia MAINTENANCE_ROOM.
3. Sistema valida origen y destino.
4. Sistema valida stock disponible.
5. Sistema postea transferencia.
6. Sistema crea transferOut.
7. Sistema crea transferIn.
8. Stock origen disminuye.
9. Stock destino aumenta.
10. Sistema audita inventoryTransfer.posted.
```

---

### 37.5. Reporte y exportación

```text id="p7uxzd"
1. TenantAdmin consulta inventory-reports/stock.
2. TenantAdmin consulta inventory-reports/movements.
3. TenantAdmin exporta reporte.
4. Sistema crea SecureDocument.
5. Response incluye secureDocumentId.
6. Response no incluye storageKey.
7. Sistema audita inventoryReport.exported.
```

---

## 38. Definition of Done técnico

```text id="ykmc5r"
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
[ ] Unidades implementadas.
[ ] Ítems implementados.
[ ] Ubicaciones implementadas.
[ ] Stock balances implementados.
[ ] Movimientos implementados.
[ ] Posting de movimientos implementado.
[ ] Reverse de movimientos implementado.
[ ] Ajustes implementados.
[ ] Transferencias implementadas.
[ ] Consumos implementados.
[ ] Documentos vía SDS implementados.
[ ] Supplier references implementadas.
[ ] Maintenance references implementadas.
[ ] Alertas implementadas.
[ ] Reportes implementados.
[ ] Exports vía SDS implementados.
[ ] Audit implementado.
[ ] Observability implementada.
[ ] OpenAPI implementado.
[ ] Tests unitarios pasan.
[ ] Tests de integración pasan.
[ ] Tests API pasan.
[ ] Tests multitenancy pasan.
[ ] Tests de stock pasan.
[ ] Tests security pasan.
[ ] Smoke tests pasan.
[ ] CI pasa.
```

---

## 39. No aceptación técnica

No se acepta implementación si:

```text id="kfzfmh"
- permite inventory item cross-tenant;
- permite inventory location cross-tenant;
- permite inventory movement cross-tenant;
- permite inventory stock cross-tenant;
- permite inventory adjustment cross-tenant;
- permite inventory transfer cross-tenant;
- permite inventory consumption cross-tenant;
- permite secureDocument cross-tenant;
- permite supplier cross-tenant;
- permite maintenanceWorkOrder cross-tenant;
- acepta tenantId desde body;
- acepta actor fields desde body;
- acepta status directo sin endpoint de transición;
- acepta quantityOnHand directo;
- acepta quantityAvailable directo;
- acepta totalCostAmount directo;
- expone storageKey;
- expone signedUrl persistente;
- acepta base64;
- usa float/double para cantidades o costos;
- permite costo negativo;
- permite cantidad negativa;
- permite salida mayor al stock disponible sin política explícita;
- permite transferencia a la misma ubicación;
- permite movimiento posted editable destructivamente;
- crea Payment;
- crea SupplierPaymentOrder;
- marca paid;
- inicia transferencia bancaria;
- inicia Open Banking payment;
- crea JournalEntry;
- edita JournalEntry;
- confirma Bank Reconciliation;
- crea endpoints públicos;
- crea endpoints /me;
- permite acceso desde WordPress público;
- envía datos reales de inventario a IA externa;
- omite auditoría crítica.
```

---

## 40. Resultado esperado

Al implementar este plan, el módulo `023-inventory-basic` debe quedar preparado para controlar inventario operativo básico por conjunto residencial, con stock trazable, movimientos auditables, consumo vinculado a mantenimiento, referencias seguras a proveedores/documentos, reportes básicos y límites claros frente a pagos, contabilidad, conciliación, WordPress público e IA externa.

Resultado esperado:

```text id="ov2cfw"
module foundation definida
estructura NestJS definida
entidades definidas
state machines definidas
modelo de datos planificado
API tenant planificada
API /me prohibida
public API prohibida
stock movement-driven definido
stock balances planificados
movimientos planificados
ajustes planificados
transferencias planificadas
consumos planificados
SDS integration planificada
Supplier Payments boundary planificado
Maintenance Work Orders integration planificada
alertas planificadas
reportes planificados
exports planificados
auditoría planificada
observabilidad planificada
seguridad planificada
feature flags definidos
variables de entorno definidas
PRs sugeridos definidos
smoke flows definidos
DoD definido
```

---

## 41. Expediente actualizado

```text id="unot0c"
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
│   │   ├── 022-maintenance-work-orders/
│   │   └── 023-inventory-basic/
│   │       ├── spec.md
│   │       └── plan.md
```
