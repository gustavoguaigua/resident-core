# Tasks — 023 Inventory Basic

## 1. Información del documento

| Campo           | Valor                                                                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                 |
| Spec ID         | 023                                                                                                                                           |
| Módulo          | Inventory Basic                                                                                                                               |
| Documento       | Tasks                                                                                                                                         |
| Ruta            | `docs/specs/023-inventory-basic/tasks.md`                                                                                                     |
| Versión         | 0.1                                                                                                                                           |
| Estado          | needs-review                                                                                                                                  |
| Fecha           | 2026-07-24                                                                                                                                    |
| Documento base  | `docs/specs/023-inventory-basic/spec.md`                                                                                                      |
| Plan técnico    | `docs/specs/023-inventory-basic/plan.md`                                                                                                      |
| Modelo de datos | `docs/specs/023-inventory-basic/data-model.md`                                                                                                |
| Contrato API    | `docs/specs/023-inventory-basic/api-contract.md`                                                                                              |
| Plan de pruebas | `docs/specs/023-inventory-basic/test-plan.md`                                                                                                 |
| Stack objetivo  | NestJS / TypeScript / PostgreSQL / Prisma / OpenAPI / Keycloak                                                                                |
| Naturaleza      | Tenant-scoped / Operational / Stock-controlled / Movement-driven / Maintenance-aware / Supplier-aware / Cost-aware / Audit-heavy / Non-public |

---

## 2. Propósito

Este documento define el backlog técnico ejecutable para implementar el módulo `023-inventory-basic`.

El objetivo es transformar la especificación funcional, el plan técnico, el modelo de datos, el contrato API y el plan de pruebas en tareas implementables por fases, épicas y pull requests.

Regla central de implementación:

```text id="s0toc1"
Inventory Basic debe implementarse como un módulo operativo tenant-scoped, donde todo saldo derive de movimientos posted, toda cantidad y costo use Decimal, todo documento pase por Secure Document Storage, todo consumo valide Maintenance Work Orders, toda referencia a proveedor respete Supplier Payments, y ninguna tarea introduzca pagos directos, SupplierPaymentOrders, JournalEntries, conciliaciones bancarias, endpoints públicos, endpoints /me, acceso WordPress público ni IA externa con datos reales.
```

---

## 3. Convenciones de estado

```text id="dtpkug"
[ ] Pendiente
[x] Completado
[-] No aplica
[~] En progreso
[!] Bloqueado
```

---

## 4. Dependencias previas

Antes de iniciar implementación debe existir:

```text id="vvaw4t"
[ ] docs/specs/023-inventory-basic/spec.md aprobado.
[ ] docs/specs/023-inventory-basic/plan.md aprobado.
[ ] docs/specs/023-inventory-basic/data-model.md aprobado.
[ ] docs/specs/023-inventory-basic/api-contract.md aprobado.
[ ] docs/specs/023-inventory-basic/test-plan.md aprobado.
[ ] Módulos 001, 002, 007, 008, 016, 021 y 022 disponibles o mockeables.
[ ] Estrategia Keycloak/Core authz vigente.
[ ] Prisma configurado.
[ ] PostgreSQL configurado.
[ ] OpenAPI pipeline disponible.
[ ] CI ejecutando tests unitarios, integración, API y security gates.
```

---

# 5. EPIC-023-01 — Module foundation

## Objetivo

Crear la base técnica del módulo `inventory-basic`.

## Tasks

```text id="p86yhp"
[ ] Crear directorio apps/api/src/modules/inventory-basic/.
[ ] Crear InventoryBasicModule.
[ ] Registrar InventoryBasicModule en el módulo raíz correspondiente.
[ ] Crear estructura controllers/.
[ ] Crear estructura application/services/.
[ ] Crear estructura application/use-cases/.
[ ] Crear estructura application/ports/.
[ ] Crear estructura domain/entities/.
[ ] Crear estructura domain/value-objects/.
[ ] Crear estructura domain/events/.
[ ] Crear estructura domain/policies/.
[ ] Crear estructura domain/errors/.
[ ] Crear estructura infrastructure/persistence/.
[ ] Crear estructura infrastructure/documents/.
[ ] Crear estructura infrastructure/maintenance/.
[ ] Crear estructura infrastructure/supplier-payments/.
[ ] Crear estructura infrastructure/reports/.
[ ] Crear estructura infrastructure/exports/.
[ ] Crear estructura infrastructure/audit/.
[ ] Crear estructura infrastructure/observability/.
[ ] Crear estructura dto/.
[ ] Crear estructura guards/.
[ ] Crear estructura mappers/.
[ ] Crear estructura tests/.
```

## Acceptance criteria

```text id="q9524b"
[ ] El módulo compila.
[ ] El módulo está registrado.
[ ] No hay endpoints públicos.
[ ] No hay endpoints /me.
[ ] No hay dependencia directa a pagos, ledger o conciliación.
```

---

# 6. EPIC-023-02 — Configuration and feature flags

## Objetivo

Definir configuración operativa y flags de seguridad.

## Tasks

```text id="l35c1e"
[ ] Crear inventory-basic.config.ts.
[ ] Crear inventory-basic.constants.ts.
[ ] Crear inventory-basic-feature-flags.ts.
[ ] Registrar INVENTORY_BASIC_ENABLED.
[ ] Registrar INVENTORY_DEFAULT_CURRENCY=USD.
[ ] Registrar INVENTORY_ALLOW_NEGATIVE_STOCK=false.
[ ] Registrar INVENTORY_REQUIRE_REASON_FOR_MANUAL_MOVEMENTS=true.
[ ] Registrar INVENTORY_REQUIRE_REASON_FOR_ADJUSTMENTS=true.
[ ] Registrar INVENTORY_REQUIRE_REASON_FOR_TRANSFERS=true.
[ ] Registrar INVENTORY_REQUIRE_REASON_FOR_REVERSALS=true.
[ ] Registrar INVENTORY_ADJUSTMENTS_REQUIRE_APPROVAL=true.
[ ] Registrar INVENTORY_MAX_REPORT_PAGE_SIZE=100.
[ ] Registrar INVENTORY_REPORT_EXPORT_ENABLED=true.
[ ] Registrar INVENTORY_SUPPLIER_PAYMENTS_INTEGRATION_ENABLED=true.
[ ] Registrar INVENTORY_MAINTENANCE_INTEGRATION_ENABLED=true.
[ ] Registrar INVENTORY_PUBLIC_ENDPOINTS_ENABLED=false.
[ ] Registrar INVENTORY_ME_ENDPOINTS_ENABLED=false.
[ ] Registrar INVENTORY_WORDPRESS_ACCESS_ENABLED=false.
[ ] Registrar INVENTORY_DIRECT_PAYMENTS_ENABLED=false.
[ ] Registrar INVENTORY_SUPPLIER_PAYMENT_ORDER_CREATION_ENABLED=false.
[ ] Registrar INVENTORY_BANK_TRANSFER_INITIATION_ENABLED=false.
[ ] Registrar INVENTORY_OPEN_BANKING_PAYMENT_INITIATION_ENABLED=false.
[ ] Registrar INVENTORY_DIRECT_ACCOUNTING_ENABLED=false.
[ ] Registrar INVENTORY_EXTERNAL_AI_ENABLED=false.
[ ] Agregar validación de boot para flags prohibidos.
[ ] Agregar tests de configuración.
```

## Acceptance criteria

```text id="gagyeq"
[ ] El boot falla si INVENTORY_PUBLIC_ENDPOINTS_ENABLED=true.
[ ] El boot falla si INVENTORY_ME_ENDPOINTS_ENABLED=true.
[ ] El boot falla si INVENTORY_WORDPRESS_ACCESS_ENABLED=true.
[ ] El boot falla si INVENTORY_DIRECT_PAYMENTS_ENABLED=true.
[ ] El boot falla si INVENTORY_SUPPLIER_PAYMENT_ORDER_CREATION_ENABLED=true.
[ ] El boot falla si INVENTORY_DIRECT_ACCOUNTING_ENABLED=true.
[ ] El boot falla si INVENTORY_EXTERNAL_AI_ENABLED=true.
```

---

# 7. EPIC-023-03 — Enums and domain errors

## Objetivo

Implementar enums y errores de dominio.

## Tasks

```text id="hp47qg"
[ ] Crear InventoryCatalogStatus.
[ ] Crear InventoryItemType.
[ ] Crear InventoryStockTrackingMode.
[ ] Crear InventoryItemStatus.
[ ] Crear InventoryLocationType.
[ ] Crear InventoryLocationStatus.
[ ] Crear InventoryMovementType.
[ ] Crear InventoryMovementDirection.
[ ] Crear InventoryMovementStatus.
[ ] Crear InventoryReferenceType.
[ ] Crear InventoryAdjustmentType.
[ ] Crear InventoryAdjustmentStatus.
[ ] Crear InventoryTransferStatus.
[ ] Crear InventoryConsumptionStatus.
[ ] Crear InventoryDocumentEntityType.
[ ] Crear InventoryDocumentType.
[ ] Crear InventoryDocumentVisibility.
[ ] Crear InventoryDocumentStatus.
[ ] Crear InventoryAlertType.
[ ] Crear InventoryAlertSeverity.
[ ] Crear InventoryAlertStatus.
[ ] Crear InventoryReportType.
[ ] Crear InventoryExportFormat.
[ ] Crear InventoryReportExportStatus.
[ ] Crear Currency USD si no existe global.
[ ] Crear catálogo de errores INVENTORY_*.
[ ] Mapear errores de dominio a HTTP status.
[ ] Agregar tests de errores.
```

## Acceptance criteria

```text id="ldv7th"
[ ] Todos los enums coinciden con api-contract.md.
[ ] Todos los errores críticos están definidos.
[ ] Los errores cross-tenant se pueden mapear a 404.
[ ] Los conflictos de stock se mapean a 409.
```

---

# 8. EPIC-023-04 — Value objects

## Objetivo

Implementar objetos de valor.

## Tasks

```text id="j0397b"
[ ] Crear InventoryCategoryCode.
[ ] Crear InventoryCategoryName.
[ ] Crear InventoryUnitCode.
[ ] Crear InventoryUnitName.
[ ] Crear InventoryUnitSymbol.
[ ] Crear InventoryItemCode.
[ ] Crear InventoryItemName.
[ ] Crear InventoryLocationCode.
[ ] Crear InventoryLocationName.
[ ] Crear InventoryMovementNumber.
[ ] Crear InventoryAdjustmentNumber.
[ ] Crear InventoryTransferNumber.
[ ] Crear InventoryConsumptionNumber.
[ ] Crear InventoryQuantity.
[ ] Crear InventoryUnitCost.
[ ] Crear InventoryTotalCost.
[ ] Crear InventoryCurrency.
[ ] Crear InventoryReason.
[ ] Crear InventoryDocumentReference.
[ ] Crear InventoryReportPeriod.
[ ] Crear InventoryStockThreshold.
```

## Tests

```text id="nyjrv5"
[ ] Tests de códigos válidos.
[ ] Tests de códigos inválidos.
[ ] Tests de nombres vacíos.
[ ] Tests de longitud máxima.
[ ] Tests de quantity string decimal.
[ ] Tests de rechazo de quantity number.
[ ] Tests de rechazo de quantity negativa.
[ ] Tests de decimalPrecision.
[ ] Tests de unitCost string decimal.
[ ] Tests de rechazo de unitCost number.
[ ] Tests de currency USD.
[ ] Tests de rechazo de HTML/script en reason.
[ ] Tests de rechazo de storageKey.
```

## Acceptance criteria

```text id="qi33io"
[ ] Ningún value object permite datos peligrosos.
[ ] Cantidades y costos no usan float como fuente de verdad.
[ ] Las razones textuales se sanitizan.
```

---

# 9. EPIC-023-05 — Domain entities

## Objetivo

Implementar entidades de dominio.

## Tasks

```text id="gotwyg"
[ ] Crear InventoryCategory entity.
[ ] Crear InventoryUnitOfMeasure entity.
[ ] Crear InventoryItem entity.
[ ] Crear InventoryStorageLocation entity.
[ ] Crear InventoryStockBalance entity.
[ ] Crear InventoryMovement entity.
[ ] Crear InventoryStockAdjustment entity.
[ ] Crear InventoryTransfer entity.
[ ] Crear InventoryConsumption entity.
[ ] Crear InventoryDocument entity.
[ ] Crear InventoryAlert entity.
[ ] Crear InventoryReportExport entity.
```

## Tests

```text id="t1k39c"
[ ] InventoryCategory create/update/archive.
[ ] InventoryUnit create/update/archive.
[ ] InventoryItem draft/active/inactive/archived.
[ ] InventoryStorageLocation active/inactive/archived.
[ ] InventoryStockBalance available formula.
[ ] InventoryMovement draft/post/cancel/reverse/archive.
[ ] InventoryStockAdjustment lifecycle.
[ ] InventoryTransfer lifecycle.
[ ] InventoryConsumption lifecycle.
[ ] InventoryDocument active/archive.
[ ] InventoryAlert open/acknowledged/resolved/dismissed/archive.
[ ] InventoryReportExport requested/processing/completed/failed/archive.
```

## Acceptance criteria

```text id="esydsg"
[ ] Las entidades no aceptan tenantId desde cliente.
[ ] Las entidades no aceptan actor fields desde cliente.
[ ] Movimientos posted no son editables destructivamente.
```

---

# 10. EPIC-023-06 — Domain policies

## Objetivo

Implementar políticas de dominio.

## Tasks

```text id="vdxpov"
[ ] Crear InventoryTenantPolicy.
[ ] Crear InventoryCategoryPolicy.
[ ] Crear InventoryUnitPolicy.
[ ] Crear InventoryItemPolicy.
[ ] Crear InventoryLocationPolicy.
[ ] Crear InventoryStockPolicy.
[ ] Crear InventoryMovementPolicy.
[ ] Crear InventoryMovementPostingPolicy.
[ ] Crear InventoryMovementReversePolicy.
[ ] Crear InventoryNegativeStockPolicy.
[ ] Crear InventoryAdjustmentPolicy.
[ ] Crear InventoryAdjustmentApprovalPolicy.
[ ] Crear InventoryTransferPolicy.
[ ] Crear InventoryConsumptionPolicy.
[ ] Crear InventoryMaintenanceReferencePolicy.
[ ] Crear InventorySupplierReferencePolicy.
[ ] Crear InventoryDocumentPolicy.
[ ] Crear InventoryAlertPolicy.
[ ] Crear InventoryReportPolicy.
[ ] Crear NoPublicInventoryEndpointPolicy.
[ ] Crear NoMeInventoryEndpointPolicy.
[ ] Crear NoWordPressInventoryAccessPolicy.
[ ] Crear NoDirectInventoryPaymentPolicy.
[ ] Crear NoDirectInventoryAccountingPolicy.
[ ] Crear NoExternalAiInventoryDataPolicy.
```

## Tests

```text id="f2mv2s"
[ ] Tenant policy permite mismo tenant.
[ ] Tenant policy rechaza tenant distinto.
[ ] Stock policy rechaza stock negativo.
[ ] Movement posting policy rechaza posted/cancelled/archived.
[ ] Movement reverse policy rechaza doble reverso.
[ ] Adjustment policy exige razón.
[ ] Transfer policy rechaza misma ubicación.
[ ] Consumption policy exige workOrder.
[ ] Supplier policy rechaza supplier blocked.
[ ] Document policy rechaza storageKey.
[ ] Boundary policies bloquean pagos, ledger, public, /me, WordPress e IA.
```

## Acceptance criteria

```text id="fdpfwp"
[ ] Las policies bloquean violaciones críticas antes de persistir.
[ ] Las policies están cubiertas con tests de seguridad.
```

---

# 11. EPIC-023-07 — Prisma schema and migration

## Objetivo

Implementar modelo de datos en Prisma y PostgreSQL.

## Tasks

```text id="gai51p"
[ ] Crear enums Prisma de inventario.
[ ] Crear model InventoryCategory.
[ ] Crear model InventoryUnit.
[ ] Crear model InventoryItem.
[ ] Crear model InventoryStorageLocation.
[ ] Crear model InventoryStockBalance.
[ ] Crear model InventoryMovement.
[ ] Crear model InventoryStockAdjustment.
[ ] Crear model InventoryTransfer.
[ ] Crear model InventoryConsumption.
[ ] Crear model InventoryDocument.
[ ] Crear model InventoryAlert.
[ ] Crear model InventoryReportExport.
[ ] Agregar relaciones en Tenant.
[ ] Crear migración 023_create_inventory_basic.
[ ] Agregar índices tenant-scoped.
[ ] Agregar índices únicos por tenant.
[ ] Agregar índices únicos parciales donde aplique.
[ ] Agregar constraints de cantidades positivas.
[ ] Agregar constraints de costos no negativos.
[ ] Agregar constraints de saldos.
[ ] Agregar constraints de transferencias source != target.
[ ] Agregar constraints de estados posted/cancelled/reversed.
[ ] Ejecutar prisma format.
[ ] Ejecutar migración local.
[ ] Ejecutar migración test.
```

## Acceptance criteria

```text id="l3ewtx"
[ ] Todas las tablas operativas tienen tenant_id.
[ ] No existen campos storageKey.
[ ] No existen campos signedUrl persistente.
[ ] No existen campos base64.
[ ] No existen FK directas obligatorias a pagos, ledger o conciliación.
[ ] La migración corre limpia.
```

---

# 12. EPIC-023-08 — Repository ports and Prisma repositories

## Objetivo

Implementar puertos y repositorios tenant-scoped.

## Tasks

```text id="klvyso"
[ ] Crear InventoryCategoryRepositoryPort.
[ ] Crear PrismaInventoryCategoryRepository.
[ ] Crear InventoryUnitRepositoryPort.
[ ] Crear PrismaInventoryUnitRepository.
[ ] Crear InventoryItemRepositoryPort.
[ ] Crear PrismaInventoryItemRepository.
[ ] Crear InventoryLocationRepositoryPort.
[ ] Crear PrismaInventoryLocationRepository.
[ ] Crear InventoryStockRepositoryPort.
[ ] Crear PrismaInventoryStockRepository.
[ ] Crear InventoryMovementRepositoryPort.
[ ] Crear PrismaInventoryMovementRepository.
[ ] Crear InventoryAdjustmentRepositoryPort.
[ ] Crear PrismaInventoryAdjustmentRepository.
[ ] Crear InventoryTransferRepositoryPort.
[ ] Crear PrismaInventoryTransferRepository.
[ ] Crear InventoryConsumptionRepositoryPort.
[ ] Crear PrismaInventoryConsumptionRepository.
[ ] Crear InventoryDocumentRepositoryPort.
[ ] Crear PrismaInventoryDocumentRepository.
[ ] Crear InventoryAlertRepositoryPort.
[ ] Crear PrismaInventoryAlertRepository.
[ ] Crear InventoryReportExportRepositoryPort.
[ ] Crear PrismaInventoryReportExportRepository.
```

## Required query pattern

```text id="mxoe46"
[ ] Toda consulta por recurso usa id + tenantId.
[ ] Toda lista filtra por tenantId.
[ ] Todo update filtra por id + tenantId.
[ ] Todo archive filtra por id + tenantId.
[ ] Cross-tenant retorna null.
```

## Tests

```text id="vo4jq6"
[ ] tenantA no lee registros tenantB.
[ ] tenantA no actualiza registros tenantB.
[ ] tenantA no archiva registros tenantB.
[ ] Códigos únicos por tenant funcionan.
[ ] Mismo código en tenant distinto permitido.
```

---

# 13. EPIC-023-09 — DTOs and validation

## Objetivo

Implementar DTOs seguros y validaciones de entrada.

## Tasks

```text id="zquvzk"
[ ] Crear CreateInventoryCategoryDto.
[ ] Crear UpdateInventoryCategoryDto.
[ ] Crear ArchiveInventoryCategoryDto.
[ ] Crear CreateInventoryUnitDto.
[ ] Crear UpdateInventoryUnitDto.
[ ] Crear ArchiveInventoryUnitDto.
[ ] Crear CreateInventoryItemDto.
[ ] Crear UpdateInventoryItemDto.
[ ] Crear ActivateInventoryItemDto.
[ ] Crear DeactivateInventoryItemDto.
[ ] Crear ArchiveInventoryItemDto.
[ ] Crear CreateInventoryLocationDto.
[ ] Crear UpdateInventoryLocationDto.
[ ] Crear ArchiveInventoryLocationDto.
[ ] Crear CreateInventoryMovementDto.
[ ] Crear PostInventoryMovementDto.
[ ] Crear CancelInventoryMovementDto.
[ ] Crear ReverseInventoryMovementDto.
[ ] Crear ArchiveInventoryMovementDto.
[ ] Crear CreateInventoryAdjustmentDto.
[ ] Crear SubmitInventoryAdjustmentDto.
[ ] Crear ApproveInventoryAdjustmentDto.
[ ] Crear RejectInventoryAdjustmentDto.
[ ] Crear PostInventoryAdjustmentDto.
[ ] Crear CancelInventoryAdjustmentDto.
[ ] Crear CreateInventoryTransferDto.
[ ] Crear PostInventoryTransferDto.
[ ] Crear CancelInventoryTransferDto.
[ ] Crear ReverseInventoryTransferDto.
[ ] Crear CreateInventoryConsumptionDto.
[ ] Crear PostInventoryConsumptionDto.
[ ] Crear CancelInventoryConsumptionDto.
[ ] Crear ReverseInventoryConsumptionDto.
[ ] Crear CreateInventoryDocumentDto.
[ ] Crear ArchiveInventoryDocumentDto.
[ ] Crear AcknowledgeInventoryAlertDto.
[ ] Crear ResolveInventoryAlertDto.
[ ] Crear DismissInventoryAlertDto.
[ ] Crear InventoryReportFilterDto.
[ ] Crear InventoryReportExportDto.
```

## Forbidden fields tests

```text id="biwoah"
[ ] DTOs rechazan tenantId.
[ ] DTOs rechazan actor fields.
[ ] DTOs rechazan status directo fuera de transición.
[ ] DTOs rechazan quantityOnHand.
[ ] DTOs rechazan quantityAvailable.
[ ] DTOs rechazan quantityReserved.
[ ] DTOs rechazan averageUnitCostAmount.
[ ] DTOs rechazan totalCostAmount.
[ ] DTOs rechazan movementNumber.
[ ] DTOs rechazan adjustmentNumber.
[ ] DTOs rechazan transferNumber.
[ ] DTOs rechazan consumptionNumber.
[ ] DTOs rechazan storageKey.
[ ] DTOs rechazan signedUrl.
[ ] DTOs rechazan base64.
[ ] DTOs rechazan rawFilePayload.
[ ] DTOs rechazan paymentOrderId.
[ ] DTOs rechazan supplierPaymentOrderId.
[ ] DTOs rechazan journalEntryId.
[ ] DTOs rechazan bankTransactionId.
[ ] DTOs rechazan reconciliationMatchId.
[ ] DTOs rechazan externalAiEnabled.
```

---

# 14. EPIC-023-10 — Guards and authorization

## Objetivo

Implementar autorización por permisos y recurso.

## Tasks

```text id="m17f0z"
[ ] Aplicar AuthGuard a todas las rutas.
[ ] Aplicar TenantGuard a todas las rutas.
[ ] Aplicar PermissionGuard a todas las rutas.
[ ] Crear InventoryCategoryTenantGuard si aplica.
[ ] Crear InventoryUnitTenantGuard si aplica.
[ ] Crear InventoryItemTenantGuard si aplica.
[ ] Crear InventoryLocationTenantGuard si aplica.
[ ] Crear InventoryStockTenantGuard si aplica.
[ ] Crear InventoryMovementTenantGuard si aplica.
[ ] Crear InventoryAdjustmentTenantGuard si aplica.
[ ] Crear InventoryTransferTenantGuard si aplica.
[ ] Crear InventoryConsumptionTenantGuard si aplica.
[ ] Crear InventoryDocumentTenantGuard si aplica.
[ ] Crear InventoryAlertTenantGuard si aplica.
[ ] Mapear permisos por endpoint.
[ ] Verificar PlatformAdmin sin acceso automático.
[ ] Verificar Resident sin acceso en MVP.
```

## Acceptance criteria

```text id="gkeg38"
[ ] Sin token retorna 401.
[ ] Sin permiso retorna 403.
[ ] Recurso cross-tenant retorna 404.
[ ] Resident no accede al módulo.
[ ] PlatformAdmin requiere tenant context y permiso explícito.
```

---

# 15. EPIC-023-11 — Categories service and API

## Objetivo

Implementar categorías de inventario.

## Tasks

```text id="s77uyg"
[ ] Crear InventoryCategoryService.
[ ] Implementar list categories.
[ ] Implementar create category.
[ ] Implementar get category.
[ ] Implementar update category.
[ ] Implementar archive category.
[ ] Implementar InventoryCategoriesController.
[ ] Implementar mappers category entity -> DTO.
[ ] Agregar audit inventoryCategory.created.
[ ] Agregar audit inventoryCategory.updated.
[ ] Agregar audit inventoryCategory.archived.
[ ] Agregar tests unitarios.
[ ] Agregar tests API.
[ ] Agregar tests multitenancy.
```

## Acceptance criteria

```text id="cpb0j5"
[ ] categoryCode único por tenant.
[ ] Archive requiere reason.
[ ] No physical delete.
[ ] tenantA no accede category tenantB.
```

---

# 16. EPIC-023-12 — Units service and API

## Objetivo

Implementar unidades de medida.

## Tasks

```text id="ids5wu"
[ ] Crear InventoryUnitService.
[ ] Implementar list units.
[ ] Implementar create unit.
[ ] Implementar get unit.
[ ] Implementar update unit.
[ ] Implementar archive unit.
[ ] Implementar InventoryUnitsController.
[ ] Implementar mappers unit entity -> DTO.
[ ] Validar allowsDecimals.
[ ] Validar decimalPrecision.
[ ] Agregar audit inventoryUnit.created.
[ ] Agregar audit inventoryUnit.updated.
[ ] Agregar audit inventoryUnit.archived.
[ ] Agregar tests unitarios.
[ ] Agregar tests API.
```

## Acceptance criteria

```text id="kmwgss"
[ ] decimalPrecision entre 0 y 4.
[ ] allowsDecimals=false exige decimalPrecision=0.
[ ] unitCode único por tenant.
```

---

# 17. EPIC-023-13 — Locations service and API

## Objetivo

Implementar ubicaciones de almacenamiento.

## Tasks

```text id="w8rwlp"
[ ] Crear InventoryLocationService.
[ ] Implementar list locations.
[ ] Implementar create location.
[ ] Implementar get location.
[ ] Implementar update location.
[ ] Implementar archive location.
[ ] Implementar InventoryLocationsController.
[ ] Validar responsibleUserId membership.
[ ] Implementar mappers location entity -> DTO.
[ ] Agregar audit inventoryLocation.created.
[ ] Agregar audit inventoryLocation.updated.
[ ] Agregar audit inventoryLocation.archived.
[ ] Agregar tests unitarios.
[ ] Agregar tests API.
[ ] Agregar tests multitenancy.
```

## Acceptance criteria

```text id="j7f91z"
[ ] locationCode único por tenant.
[ ] responsibleUserId pertenece al tenant.
[ ] Ubicación archived no recibe movimientos.
```

---

# 18. EPIC-023-14 — Items service and API

## Objetivo

Implementar ítems de inventario.

## Tasks

```text id="z47x81"
[ ] Crear InventoryItemService.
[ ] Implementar list items.
[ ] Implementar create item.
[ ] Implementar get item.
[ ] Implementar update item.
[ ] Implementar activate item.
[ ] Implementar deactivate item.
[ ] Implementar archive item.
[ ] Implementar InventoryItemsController.
[ ] Validar categoryId tenant-scoped.
[ ] Validar unitId tenant-scoped.
[ ] Validar defaultStorageLocationId tenant-scoped.
[ ] Validar preferredSupplierId con Supplier Payments si existe.
[ ] Validar minimumStockQuantity >= 0.
[ ] Validar reorderPointQuantity >= 0.
[ ] Validar referenceUnitCostAmount >= 0.
[ ] Validar currency USD.
[ ] Implementar mappers item entity -> DTO.
[ ] Agregar audit inventoryItem.created.
[ ] Agregar audit inventoryItem.updated.
[ ] Agregar audit inventoryItem.activated.
[ ] Agregar audit inventoryItem.deactivated.
[ ] Agregar audit inventoryItem.archived.
[ ] Agregar tests unitarios.
[ ] Agregar tests API.
[ ] Agregar tests multitenancy.
```

## Acceptance criteria

```text id="bnggg5"
[ ] itemCode único por tenant.
[ ] Ítem archived no recibe movimientos.
[ ] No se puede actualizar stock desde item PATCH.
[ ] No se puede enviar quantityOnHand.
```

---

# 19. EPIC-023-15 — Stock balances service

## Objetivo

Implementar saldos como snapshot derivado.

## Tasks

```text id="o42xho"
[ ] Crear InventoryStockService.
[ ] Implementar get stock list.
[ ] Implementar get stock by item.
[ ] Implementar create or update stock balance interno.
[ ] Implementar apply inbound movement.
[ ] Implementar apply outbound movement.
[ ] Implementar quantityAvailable calculation.
[ ] Implementar lowStock detection.
[ ] Implementar outOfStock detection.
[ ] Implementar lastMovementId.
[ ] Implementar lastMovementAt.
[ ] Implementar InventoryStockController.
[ ] Implementar mappers stock balance -> DTO.
[ ] Agregar tests de stock.
```

## Acceptance criteria

```text id="lu678q"
[ ] quantityAvailable = quantityOnHand - quantityReserved.
[ ] Stock no se actualiza por DTO externo.
[ ] Stock se actualiza solo por movement posted.
[ ] Stock negativo se bloquea por defecto.
```

---

# 20. EPIC-023-16 — Movement posting engine

## Objetivo

Implementar motor transaccional de movimientos.

## Tasks

```text id="htlgfo"
[ ] Crear InventoryMovementService.
[ ] Crear PostInventoryMovementUseCase.
[ ] Crear ReverseInventoryMovementUseCase.
[ ] Crear InventoryMovementNumberGenerator.
[ ] Implementar create movement draft.
[ ] Implementar derive movementDirection.
[ ] Implementar calculate totalCostAmount server-side.
[ ] Implementar post openingBalance.
[ ] Implementar post receipt.
[ ] Implementar post issue.
[ ] Implementar post maintenanceConsumption.
[ ] Implementar post adjustmentIncrease.
[ ] Implementar post adjustmentDecrease.
[ ] Implementar post transferOut.
[ ] Implementar post transferIn.
[ ] Implementar post returnToStock.
[ ] Implementar post correction.
[ ] Implementar cancel draft movement.
[ ] Implementar reverse posted movement.
[ ] Implementar archive movement.
[ ] Implementar InventoryMovementsController.
[ ] Agregar audit inventoryMovement.created.
[ ] Agregar audit inventoryMovement.posted.
[ ] Agregar audit inventoryMovement.cancelled.
[ ] Agregar audit inventoryMovement.reversed.
[ ] Agregar audit inventoryMovement.archived.
```

## Tests

```text id="cq09d5"
[ ] Draft movement no afecta stock.
[ ] Posted receipt incrementa stock.
[ ] Posted issue disminuye stock.
[ ] Issue mayor al disponible falla.
[ ] Posted movement no se edita destructivamente.
[ ] Reverse mantiene trazabilidad.
[ ] Reverse no borra movimiento original.
[ ] Doble post falla.
[ ] Doble reverse falla.
```

---

# 21. EPIC-023-17 — Stock recalculation

## Objetivo

Implementar recálculo de stock desde movimientos posted.

## Tasks

```text id="ccdu1c"
[ ] Crear RecalculateStockBalanceUseCase.
[ ] Implementar recalculation por tenant.
[ ] Implementar recalculation por itemId.
[ ] Implementar recalculation por itemId + storageLocationId.
[ ] Ignorar movements draft.
[ ] Ignorar movements cancelled.
[ ] Considerar reversals correctamente.
[ ] Preservar quantityReserved si aplica.
[ ] Recalcular quantityAvailable.
[ ] Actualizar lastMovementAt.
[ ] Auditar inventoryStock.recalculated.
[ ] Agregar endpoint POST /inventory-stock/recalculate.
[ ] Agregar tests de recalculation.
```

## Acceptance criteria

```text id="d5nqmn"
[ ] Recalculation no acepta quantityOnHand desde cliente.
[ ] Recalculation filtra por tenant.
[ ] Recalculation no mezcla tenants.
```

---

# 22. EPIC-023-18 — Adjustments lifecycle

## Objetivo

Implementar ajustes de stock.

## Tasks

```text id="ev9f50"
[ ] Crear InventoryAdjustmentService.
[ ] Crear CreateStockAdjustmentUseCase.
[ ] Crear ApproveStockAdjustmentUseCase.
[ ] Crear PostStockAdjustmentUseCase.
[ ] Crear InventoryAdjustmentNumberGenerator.
[ ] Implementar create adjustment draft.
[ ] Implementar submit adjustment.
[ ] Implementar approve adjustment.
[ ] Implementar reject adjustment.
[ ] Implementar post adjustment.
[ ] Implementar cancel adjustment.
[ ] Implementar archive adjustment.
[ ] Implementar InventoryAdjustmentsController.
[ ] Validar reason obligatorio.
[ ] Validar secureDocumentId si existe.
[ ] Crear movement adjustmentIncrease al postear increase.
[ ] Crear movement adjustmentDecrease al postear decrease.
[ ] Validar stock disponible en decrease.
[ ] Agregar audit events.
[ ] Agregar tests unitarios, integración y API.
```

## Acceptance criteria

```text id="nvp1eu"
[ ] Ajuste decrease no deja stock negativo.
[ ] Ajuste posted crea movement.
[ ] Ajuste rejected requiere reason.
[ ] Ajuste cancelled requiere reason.
```

---

# 23. EPIC-023-19 — Transfers lifecycle

## Objetivo

Implementar transferencias entre ubicaciones.

## Tasks

```text id="pk6fmg"
[ ] Crear InventoryTransferService.
[ ] Crear PostInventoryTransferUseCase.
[ ] Crear InventoryTransferNumberGenerator.
[ ] Implementar create transfer draft.
[ ] Implementar get/list transfer.
[ ] Implementar post transfer.
[ ] Implementar cancel transfer.
[ ] Implementar reverse transfer.
[ ] Implementar archive transfer.
[ ] Implementar InventoryTransfersController.
[ ] Validar sourceStorageLocationId tenant-scoped.
[ ] Validar targetStorageLocationId tenant-scoped.
[ ] Rechazar source = target.
[ ] Validar stock disponible en source.
[ ] Crear transferOut.
[ ] Crear transferIn.
[ ] Actualizar saldo origen y destino en una sola transacción.
[ ] Agregar audit inventoryTransfer.posted.
[ ] Agregar tests de transacción.
```

## Acceptance criteria

```text id="zwumql"
[ ] Transferencia posted crea dos movements.
[ ] Falla completa si falla uno de los movements.
[ ] No deja stock negativo.
[ ] No permite misma ubicación origen/destino.
```

---

# 24. EPIC-023-20 — Maintenance consumptions

## Objetivo

Implementar consumos vinculados a Maintenance Work Orders.

## Tasks

```text id="wa65x3"
[ ] Crear InventoryConsumptionService.
[ ] Crear PostMaintenanceConsumptionUseCase.
[ ] Crear InventoryConsumptionNumberGenerator.
[ ] Implementar create consumption draft.
[ ] Implementar list consumptions.
[ ] Implementar get consumption.
[ ] Implementar post consumption.
[ ] Implementar cancel consumption.
[ ] Implementar reverse consumption.
[ ] Implementar archive consumption.
[ ] Implementar InventoryConsumptionsController.
[ ] Implementar GET /tenant/maintenance-work-orders/{workOrderId}/inventory-consumptions.
[ ] Crear InventoryMaintenancePort.
[ ] Crear adapter InventoryMaintenanceWorkOrdersAdapter.
[ ] Validar maintenanceWorkOrderId tenant-scoped.
[ ] Validar maintenanceTaskId pertenece a workOrder.
[ ] Validar workOrder no archived.
[ ] Validar workOrder permite consumo.
[ ] Crear movement maintenanceConsumption.
[ ] Descontar stock.
[ ] Impedir modificación de estado de workOrder.
[ ] Impedir creación automática de MaintenanceCost.
[ ] Impedir creación automática de SupplierPayable.
[ ] Agregar audit events.
[ ] Agregar tests de boundary.
```

## Acceptance criteria

```text id="hk44oy"
[ ] Consumo posted disminuye stock.
[ ] Consumo requiere workOrder válido.
[ ] No modifica Maintenance Work Orders.
[ ] No crea costos ni payables.
```

---

# 25. EPIC-023-21 — Secure Document Storage integration

## Objetivo

Integrar documentos y exportaciones con SDS.

## Tasks

```text id="k7lpc7"
[ ] Crear InventoryDocumentStoragePort.
[ ] Crear SecureDocumentStorageInventoryAdapter.
[ ] Implementar validateDocumentBelongsToTenant.
[ ] Implementar getDownloadAvailability.
[ ] Implementar createReportExport.
[ ] Crear InventoryDocumentService.
[ ] Implementar create document link.
[ ] Implementar list documents.
[ ] Implementar get document.
[ ] Implementar archive document.
[ ] Implementar InventoryDocumentsController.
[ ] Validar entityType.
[ ] Validar entityId tenant-scoped según entityType.
[ ] Validar secureDocumentId tenant-scoped.
[ ] Agregar metadata sourceModule=inventoryBasic.
[ ] Rechazar storageKey.
[ ] Rechazar signedUrl persistente.
[ ] Rechazar base64.
[ ] Rechazar rawFilePayload.
[ ] Agregar audit inventoryDocument.created.
[ ] Agregar audit inventoryDocument.downloaded.
[ ] Agregar audit inventoryDocument.archived.
```

## Acceptance criteria

```text id="fk80s3"
[ ] Response solo devuelve secureDocumentId y downloadAvailable.
[ ] Nunca devuelve storageKey.
[ ] Nunca devuelve signedUrl persistente.
[ ] Documentos cross-tenant devuelven 404.
```

---

# 26. EPIC-023-22 — Supplier Payments boundary

## Objetivo

Integrar referencias con Supplier Payments sin crear pagos.

## Tasks

```text id="dhzj4s"
[ ] Crear InventorySupplierPaymentsPort.
[ ] Crear InventorySupplierPaymentsAdapter.
[ ] Implementar validateSupplier.
[ ] Implementar validateSupplierPayable.
[ ] Implementar getSupplierSummary.
[ ] Validar preferredSupplierId en InventoryItem.
[ ] Validar supplierId en InventoryMovement.
[ ] Validar supplierPayableId en InventoryMovement.
[ ] Rechazar supplier blocked.
[ ] Rechazar supplier inactive.
[ ] Rechazar supplier archived.
[ ] Rechazar supplier tenantB.
[ ] Rechazar supplierPayable tenantB.
[ ] Impedir createSupplierPayable en MVP.
[ ] Impedir createSupplierPaymentOrder.
[ ] Impedir markPaid.
[ ] Impedir createPayment.
[ ] Impedir createPaymentAllocation.
[ ] Impedir bankTransferInstruction.
[ ] Agregar tests de boundary.
```

## Acceptance criteria

```text id="cghyun"
[ ] Inventory solo valida y referencia proveedores.
[ ] Inventory no crea pagos.
[ ] Inventory no crea SupplierPaymentOrder.
[ ] Inventory no marca paid.
```

---

# 27. EPIC-023-23 — Reports

## Objetivo

Implementar reportes básicos de inventario.

## Tasks

```text id="kr4v5i"
[ ] Crear InventoryReportService.
[ ] Implementar stock report.
[ ] Implementar movements report.
[ ] Implementar consumption report.
[ ] Implementar low stock report.
[ ] Implementar valuation report.
[ ] Implementar filtros tenant-scoped.
[ ] Implementar validación dateFrom <= dateTo.
[ ] Implementar page/pageSize.
[ ] Implementar max pageSize 100.
[ ] Exponer cantidades como string decimal.
[ ] Exponer montos como string decimal.
[ ] Etiquetar valuationNature=referenceOnly.
[ ] Impedir creación de JournalEntry desde valuation.
[ ] Implementar InventoryReportsController.
[ ] Agregar audit inventoryReport.generated.
[ ] Agregar tests API.
[ ] Agregar tests performance básicos.
```

## Acceptance criteria

```text id="sypqnf"
[ ] Reportes no mezclan tenants.
[ ] Valorización es referencial.
[ ] Reportes no crean contabilidad.
```

---

# 28. EPIC-023-24 — Report exports

## Objetivo

Implementar exportaciones vía SDS.

## Tasks

```text id="hiqkae"
[ ] Crear InventoryExportService.
[ ] Implementar export stock.
[ ] Implementar export movements.
[ ] Implementar export consumption.
[ ] Implementar export lowStock.
[ ] Implementar export valuation.
[ ] Crear InventoryReportExport record.
[ ] Generar archivo CSV.
[ ] Soportar XLSX si export engine global existe.
[ ] Soportar PDF si export engine global existe.
[ ] Crear SecureDocument vía SDS.
[ ] Actualizar export status completed.
[ ] Manejar export status failed.
[ ] Sanitizar filters.
[ ] No devolver storageKey.
[ ] No devolver signedUrl persistente.
[ ] Auditar inventoryReport.exported.
[ ] Agregar tests.
```

## Acceptance criteria

```text id="xei98o"
[ ] Export completed tiene secureDocumentId.
[ ] Response no contiene storageKey.
[ ] Response no contiene signedUrl persistente.
[ ] Export failed conserva failureReason sanitizado.
```

---

# 29. EPIC-023-25 — Alerts

## Objetivo

Implementar alertas de bajo stock y stock cero.

## Tasks

```text id="jmmpay"
[ ] Crear InventoryAlertService.
[ ] Implementar lowStock detection.
[ ] Implementar outOfStock detection.
[ ] Implementar negativeStockAttempt alert si aplica.
[ ] Implementar inactiveItemUsed alert si aplica.
[ ] Implementar archivedLocationUsed alert si aplica.
[ ] Implementar list alerts.
[ ] Implementar acknowledge alert.
[ ] Implementar resolve alert.
[ ] Implementar dismiss alert.
[ ] Implementar archive alert.
[ ] Implementar InventoryAlertsController.
[ ] Evitar duplicación innecesaria de alertas abiertas.
[ ] Agregar audit inventoryAlert.created.
[ ] Agregar audit inventoryAlert.acknowledged.
[ ] Agregar audit inventoryAlert.resolved.
[ ] Agregar audit inventoryAlert.dismissed.
[ ] Agregar tests.
```

## Acceptance criteria

```text id="mrsj09"
[ ] Issue que deja stock bajo genera lowStock.
[ ] Issue que deja stock cero genera outOfStock.
[ ] Acknowledge no resuelve condición.
[ ] Resolve requiere razón o condición corregida.
[ ] Dismiss requiere razón.
```

---

# 30. EPIC-023-26 — Audit implementation

## Objetivo

Registrar auditoría obligatoria de operaciones críticas.

## Tasks

```text id="fgz7ua"
[ ] Crear InventoryAuditPort.
[ ] Crear InventoryAuditService.
[ ] Integrar con módulo 007-audit.
[ ] Definir audit category = inventory.
[ ] Auditar category created/updated/archived.
[ ] Auditar unit created/updated/archived.
[ ] Auditar item created/updated/activated/deactivated/archived.
[ ] Auditar location created/updated/archived.
[ ] Auditar movement created/posted/cancelled/reversed/archived.
[ ] Auditar adjustment created/submitted/approved/rejected/posted/cancelled.
[ ] Auditar transfer created/posted/cancelled/reversed.
[ ] Auditar consumption created/posted/cancelled/reversed.
[ ] Auditar document created/downloaded/archived.
[ ] Auditar alert created/acknowledged/resolved/dismissed.
[ ] Auditar report generated/exported.
[ ] Sanitizar metadata.
[ ] Excluir storageKey.
[ ] Excluir signedUrl.
[ ] Excluir base64.
[ ] Excluir raw file payload.
[ ] Agregar audit tests.
```

## Acceptance criteria

```text id="pafytk"
[ ] Toda operación crítica tiene audit.
[ ] Audit incluye tenantId, actor, action, resource y traceId.
[ ] Audit no contiene datos prohibidos.
```

---

# 31. EPIC-023-27 — Observability

## Objetivo

Implementar logs, métricas y trazabilidad segura.

## Tasks

```text id="h9r8xv"
[ ] Crear InventoryObservabilityService.
[ ] Definir logs seguros para inventoryMovement.posted.
[ ] Definir logs seguros para inventoryMovement.reversed.
[ ] Definir logs seguros para inventoryAdjustment.posted.
[ ] Definir logs seguros para inventoryTransfer.posted.
[ ] Definir logs seguros para inventoryConsumption.posted.
[ ] Definir logs seguros para inventoryAlert.created.
[ ] Definir logs seguros para inventoryReport.exported.
[ ] Implementar metrics inventory_items_total.
[ ] Implementar metrics inventory_active_items_total.
[ ] Implementar metrics inventory_stock_balances_total.
[ ] Implementar metrics inventory_low_stock_alerts_total.
[ ] Implementar metrics inventory_out_of_stock_alerts_total.
[ ] Implementar metrics inventory_movements_total.
[ ] Implementar metrics inventory_receipts_total.
[ ] Implementar metrics inventory_issues_total.
[ ] Implementar metrics inventory_adjustments_total.
[ ] Implementar metrics inventory_transfers_total.
[ ] Implementar metrics inventory_consumptions_total.
[ ] Implementar metrics inventory_report_exports_total.
[ ] Bloquear labels prohibidos.
[ ] Agregar tests de logs.
[ ] Agregar tests de metrics.
```

## Acceptance criteria

```text id="fxgmeg"
[ ] Logs no contienen storageKey.
[ ] Logs no contienen raw payload.
[ ] Metrics no usan tenantId como label.
[ ] Metrics no usan itemId/locationId/movementId como label.
```

---

# 32. EPIC-023-28 — OpenAPI

## Objetivo

Documentar contrato API y extensiones de seguridad.

## Tasks

```text id="kbx3q6"
[ ] Agregar tags Inventory Categories.
[ ] Agregar tags Inventory Units.
[ ] Agregar tags Inventory Items.
[ ] Agregar tags Inventory Locations.
[ ] Agregar tags Inventory Stock.
[ ] Agregar tags Inventory Movements.
[ ] Agregar tags Inventory Adjustments.
[ ] Agregar tags Inventory Transfers.
[ ] Agregar tags Inventory Consumptions.
[ ] Agregar tags Inventory Documents.
[ ] Agregar tags Inventory Alerts.
[ ] Agregar tags Inventory Reports.
[ ] Documentar rutas /api/v1/tenant/inventory-*.
[ ] Agregar x-tenant-scope=true.
[ ] Agregar x-auth-required=true.
[ ] Agregar x-inventory-basic=true.
[ ] Agregar x-public-exposure=false.
[ ] Agregar x-stock-controlled=true en rutas de stock.
[ ] Agregar x-movement-driven=true.
[ ] Agregar x-negative-stock-default=false.
[ ] Agregar x-secure-document-storage=true en rutas con documentos.
[ ] Agregar x-storage-key-exposed=false.
[ ] Agregar x-decimal-money=true en rutas con costos.
[ ] Agregar x-reference-valuation-only=true en valuation report.
[ ] Agregar x-payment-creation=false.
[ ] Agregar x-supplier-payment-order-created=false.
[ ] Agregar x-supplier-payment-mark-paid=false.
[ ] Agregar x-public-endpoint=false.
[ ] Agregar x-me-endpoint=false.
[ ] Agregar x-wordpress-access=false.
[ ] Agregar x-external-ai-real-data=false.
[ ] Agregar OpenAPI tests.
```

## No documentar

```text id="lr7y15"
[ ] No documentar /api/v1/me/inventory-*.
[ ] No documentar /api/v1/public/inventory-*.
[ ] No documentar storageKey.
[ ] No documentar signedUrl persistente.
[ ] No documentar base64.
[ ] No documentar tenantId en DTOs.
[ ] No documentar actor fields.
[ ] No documentar quantityOnHand editable.
[ ] No documentar totalCostAmount editable.
[ ] No documentar paymentOrderId.
[ ] No documentar journalEntryId.
[ ] No documentar externalAiEnabled.
```

---

# 33. EPIC-023-29 — Security hardening

## Objetivo

Cerrar brechas de seguridad antes de merge final.

## Tasks

```text id="p6qk8h"
[ ] Ejecutar forbidden fields tests.
[ ] Ejecutar multitenancy tests.
[ ] Ejecutar no public tests.
[ ] Ejecutar no /me tests.
[ ] Ejecutar no WordPress tests.
[ ] Ejecutar no payment tests.
[ ] Ejecutar no SupplierPaymentOrder tests.
[ ] Ejecutar no accounting tests.
[ ] Ejecutar no reconciliation tests.
[ ] Ejecutar no external AI tests.
[ ] Verificar CORS sin wildcard.
[ ] Verificar headers de seguridad.
[ ] Verificar error sanitizer.
[ ] Verificar audit sanitizer.
[ ] Verificar log sanitizer.
[ ] Verificar OpenAPI sin campos prohibidos.
[ ] Verificar feature flags prohibidos false.
```

## Acceptance criteria

```text id="zc9gzc"
[ ] Security tests críticos pasan 100%.
[ ] No hay rutas públicas.
[ ] No hay rutas /me.
[ ] No hay exposición WordPress.
[ ] No hay storageKey en API/logs/audit.
```

---

# 34. EPIC-023-30 — Performance and concurrency

## Objetivo

Validar desempeño y consistencia bajo concurrencia.

## Tasks

```text id="g81s8q"
[ ] Preparar dataset performance tenantA.
[ ] Preparar dataset parcial tenantB.
[ ] Test listar ítems p95 < 800 ms.
[ ] Test consultar stock p95 < 1000 ms.
[ ] Test listar movimientos p95 < 1200 ms.
[ ] Test stock report p95 < 1500 ms.
[ ] Test movements report p95 < 2000 ms.
[ ] Test low stock report p95 < 1500 ms.
[ ] Test export pequeño p95 < 3000 ms.
[ ] Test pageSize max 100.
[ ] Test sin N+1 evidente.
[ ] Test dos issues simultáneos no dejan stock negativo.
[ ] Test dos consumptions simultáneos no dejan stock negativo.
[ ] Test dos transfers simultáneos no dejan stock negativo.
[ ] Test doble post movement.
[ ] Test doble reverse movement.
[ ] Test transfer transaccional.
[ ] Test adjustment transaccional.
[ ] Test consumption transaccional.
```

## Acceptance criteria

```text id="bzfoz1"
[ ] Stock permanece consistente bajo concurrencia.
[ ] No existen saldos negativos por carrera.
[ ] Operaciones críticas son transaccionales.
```

---

# 35. EPIC-023-31 — CI gates

## Objetivo

Configurar validaciones obligatorias del pipeline.

## Tasks

```text id="x5ti4f"
[ ] Agregar unit tests al pipeline.
[ ] Agregar integration tests al pipeline.
[ ] Agregar API tests al pipeline.
[ ] Agregar security tests al pipeline.
[ ] Agregar multitenancy tests al pipeline.
[ ] Agregar stock consistency tests al pipeline.
[ ] Agregar concurrency critical tests al pipeline.
[ ] Agregar audit tests al pipeline.
[ ] Agregar observability tests al pipeline.
[ ] Agregar OpenAPI contract tests al pipeline.
[ ] Agregar smoke tests al pipeline.
[ ] Agregar gate forbidden DTO fields.
[ ] Agregar gate no public endpoints.
[ ] Agregar gate no /me endpoints.
[ ] Agregar gate no storageKey.
[ ] Agregar gate no payments.
[ ] Agregar gate no SupplierPaymentOrder.
[ ] Agregar gate no JournalEntry.
[ ] Agregar gate no external AI.
```

## Pipeline must fail if

```text id="he3r37"
[ ] Algún DTO acepta tenantId.
[ ] Algún DTO acepta actor fields.
[ ] Algún DTO acepta quantityOnHand.
[ ] Algún DTO acepta totalCostAmount.
[ ] Algún DTO acepta storageKey.
[ ] API permite cross-tenant.
[ ] API permite stock negativo.
[ ] API permite public endpoints.
[ ] API permite /me endpoints.
[ ] API crea Payment.
[ ] API crea SupplierPaymentOrder.
[ ] API crea JournalEntry.
[ ] API confirma Bank Reconciliation.
[ ] INVENTORY_EXTERNAL_AI_ENABLED=true.
```

---

# 36. EPIC-023-32 — Seeds

## Objetivo

Crear datos iniciales ficticios.

## Tasks

```text id="w3zk3m"
[ ] Crear seed de categorías CLEANING.
[ ] Crear seed de categorías PLUMBING.
[ ] Crear seed de categorías ELECTRICAL.
[ ] Crear seed de categorías GARDENING.
[ ] Crear seed de categorías SECURITY.
[ ] Crear seed de categorías PAINTING.
[ ] Crear seed de categorías MINOR_TOOLS.
[ ] Crear seed de categorías SPARE_PARTS.
[ ] Crear seed de categorías OFFICE.
[ ] Crear seed de categorías SAFETY.
[ ] Crear seed de categorías OTHER.
[ ] Crear seed de unidad UNIT.
[ ] Crear seed de unidad METER.
[ ] Crear seed de unidad LITER.
[ ] Crear seed de unidad GALLON.
[ ] Crear seed de unidad KILOGRAM.
[ ] Crear seed de unidad PACKAGE.
[ ] Crear seed de unidad BOX.
[ ] Crear seed de unidad ROLL.
[ ] Crear seed de unidad PAIR.
[ ] Crear seed de unidad SET.
[ ] Crear seed de unidad BOTTLE.
[ ] Crear seed de unidad BAG.
[ ] Crear seed de ubicación MAIN_WAREHOUSE.
[ ] Crear seed de ubicación GUARDHOUSE.
[ ] Crear seed de ubicación PUMP_ROOM.
[ ] Crear seed de ubicación ADMIN_OFFICE.
[ ] Crear seed de ubicación MAINTENANCE_ROOM.
[ ] Crear seed de ubicación TECHNICAL_CABINET.
[ ] Crear seed opcional de ítems demo ficticios.
```

## Acceptance criteria

```text id="fv8ju0"
[ ] Seeds son tenant-scoped.
[ ] Seeds son ficticios.
[ ] Seeds no contienen proveedores reales.
[ ] Seeds no contienen facturas reales.
[ ] Seeds no contienen documentos reales.
[ ] Seeds no contienen datos personales reales.
```

---

# 37. EPIC-023-33 — Smoke tests

## Objetivo

Validar flujos completos.

## Tasks

```text id="klmt1u"
[ ] Implementar smoke catálogo y stock inicial.
[ ] Implementar smoke entrada y salida.
[ ] Implementar smoke ajuste.
[ ] Implementar smoke transferencia.
[ ] Implementar smoke consumo de mantenimiento.
[ ] Implementar smoke documentos SDS.
[ ] Implementar smoke alertas.
[ ] Implementar smoke reportes y exportación.
[ ] Agregar smoke tests al CI.
```

## Smoke base

```text id="tn8ujk"
[ ] Crear category PLUMBING.
[ ] Crear unit UNIT.
[ ] Crear location MAIN_WAREHOUSE.
[ ] Crear item PVC_VALVE_1_2.
[ ] Activar item.
[ ] Crear openingBalance.
[ ] Postear openingBalance.
[ ] Verificar stock.
[ ] Crear receipt.
[ ] Postear receipt.
[ ] Crear issue.
[ ] Postear issue.
[ ] Crear transfer.
[ ] Postear transfer.
[ ] Crear maintenance consumption.
[ ] Postear consumption.
[ ] Crear document link.
[ ] Generar lowStock alert.
[ ] Exportar stock report.
[ ] Verificar no storageKey.
[ ] Verificar audit.
```

---

# 38. Plan de Pull Requests sugerido

## PR-023-01 — Module skeleton, enums, config and feature flags

Incluye:

```text id="r452ud"
[ ] EPIC-023-01.
[ ] EPIC-023-02.
[ ] EPIC-023-03.
```

Acceptance:

```text id="n14rfu"
[ ] Módulo compila.
[ ] Flags prohibidos bloquean boot.
[ ] Enums y errores definidos.
```

---

## PR-023-02 — Value objects, entities, state machines and policies

Incluye:

```text id="urgzav"
[ ] EPIC-023-04.
[ ] EPIC-023-05.
[ ] EPIC-023-06.
```

Acceptance:

```text id="g4qc0t"
[ ] Domain tests pasan.
[ ] State machines pasan.
[ ] Policies críticas pasan.
```

---

## PR-023-03 — Prisma schema, migration, constraints and indexes

Incluye:

```text id="mpgw66"
[ ] EPIC-023-07.
```

Acceptance:

```text id="i0ofg2"
[ ] Migración limpia.
[ ] Índices creados.
[ ] Constraints creados.
[ ] Todas las tablas incluyen tenant_id.
```

---

## PR-023-04 — Repository ports and Prisma repositories

Incluye:

```text id="r6fujk"
[ ] EPIC-023-08.
```

Acceptance:

```text id="arifqc"
[ ] Repositories tenant-scoped.
[ ] Cross-tenant retorna null.
[ ] Tests de repositorios pasan.
```

---

## PR-023-05 — DTOs, guards and authorization

Incluye:

```text id="df8em2"
[ ] EPIC-023-09.
[ ] EPIC-023-10.
```

Acceptance:

```text id="qpwtfl"
[ ] Forbidden fields rechazados.
[ ] Sin permiso retorna 403.
[ ] Sin auth retorna 401.
```

---

## PR-023-06 — Categories, units, locations and items

Incluye:

```text id="ib65k7"
[ ] EPIC-023-11.
[ ] EPIC-023-12.
[ ] EPIC-023-13.
[ ] EPIC-023-14.
```

Acceptance:

```text id="rfqb0g"
[ ] CRUD lógico de catálogos funciona.
[ ] Ítems activan/inactivan/archivan.
[ ] Multitenancy pasa.
```

---

## PR-023-07 — Stock balances and movement posting engine

Incluye:

```text id="lob2et"
[ ] EPIC-023-15.
[ ] EPIC-023-16.
```

Acceptance:

```text id="eug974"
[ ] Draft no afecta stock.
[ ] Posted afecta stock.
[ ] Stock negativo bloqueado.
[ ] Reverse trazable.
```

---

## PR-023-08 — Stock recalculation and alerts

Incluye:

```text id="j3vcv3"
[ ] EPIC-023-17.
[ ] EPIC-023-25.
```

Acceptance:

```text id="hrhumg"
[ ] Recalculation reconstruye saldos.
[ ] LowStock/outOfStock funcionan.
[ ] No se aceptan saldos desde cliente.
```

---

## PR-023-09 — Stock adjustments

Incluye:

```text id="z44jye"
[ ] EPIC-023-18.
```

Acceptance:

```text id="j05qtt"
[ ] Ajustes crean movements.
[ ] Ajuste decrease valida stock.
[ ] Audit completo.
```

---

## PR-023-10 — Transfers

Incluye:

```text id="rrsnh2"
[ ] EPIC-023-19.
```

Acceptance:

```text id="cnz5lx"
[ ] Transfer crea transferOut y transferIn.
[ ] Transfer es transaccional.
[ ] No permite misma ubicación.
```

---

## PR-023-11 — Maintenance consumptions

Incluye:

```text id="mn77us"
[ ] EPIC-023-20.
```

Acceptance:

```text id="s73xmy"
[ ] Consumo valida WorkOrder.
[ ] Consumo descuenta stock.
[ ] No modifica Maintenance.
[ ] No crea costos ni payables.
```

---

## PR-023-12 — Secure Document Storage integration

Incluye:

```text id="m7rg98"
[ ] EPIC-023-21.
```

Acceptance:

```text id="pgq5j1"
[ ] Documentos vía SDS.
[ ] No storageKey.
[ ] No signedUrl persistente.
[ ] No base64.
```

---

## PR-023-13 — Supplier Payments boundary

Incluye:

```text id="b9laq5"
[ ] EPIC-023-22.
```

Acceptance:

```text id="h35xhp"
[ ] Supplier active permitido.
[ ] Supplier blocked rechazado.
[ ] No Payment.
[ ] No SupplierPaymentOrder.
```

---

## PR-023-14 — Reports and exports

Incluye:

```text id="de72hz"
[ ] EPIC-023-23.
[ ] EPIC-023-24.
```

Acceptance:

```text id="gvvsfh"
[ ] Reportes tenant-scoped.
[ ] Valuation referenceOnly.
[ ] Exports vía SDS.
[ ] No storageKey.
```

---

## PR-023-15 — Audit, observability and OpenAPI

Incluye:

```text id="vxk2t2"
[ ] EPIC-023-26.
[ ] EPIC-023-27.
[ ] EPIC-023-28.
```

Acceptance:

```text id="ybdxb6"
[ ] Audit completo.
[ ] Logs sanitizados.
[ ] Metrics seguras.
[ ] OpenAPI sin campos prohibidos.
```

---

## PR-023-16 — Security hardening and CI gates

Incluye:

```text id="q3hm48"
[ ] EPIC-023-29.
[ ] EPIC-023-31.
```

Acceptance:

```text id="x1hdrh"
[ ] CI security gates pasan.
[ ] No public.
[ ] No /me.
[ ] No WordPress.
[ ] No pagos.
[ ] No contabilidad.
[ ] No IA externa.
```

---

## PR-023-17 — Performance, concurrency, seeds and smoke tests

Incluye:

```text id="s0kvd7"
[ ] EPIC-023-30.
[ ] EPIC-023-32.
[ ] EPIC-023-33.
```

Acceptance:

```text id="e5xbxj"
[ ] Performance básica cumple.
[ ] Concurrency crítica cumple.
[ ] Seeds ficticios funcionan.
[ ] Smoke completo pasa.
```

---

# 39. Checklist de implementación por endpoint

## 39.1. Categories

```text id="w1cik9"
[ ] GET /api/v1/tenant/inventory-categories.
[ ] POST /api/v1/tenant/inventory-categories.
[ ] GET /api/v1/tenant/inventory-categories/{categoryId}.
[ ] PATCH /api/v1/tenant/inventory-categories/{categoryId}.
[ ] POST /api/v1/tenant/inventory-categories/{categoryId}/archive.
```

---

## 39.2. Units

```text id="htne9p"
[ ] GET /api/v1/tenant/inventory-units.
[ ] POST /api/v1/tenant/inventory-units.
[ ] GET /api/v1/tenant/inventory-units/{unitId}.
[ ] PATCH /api/v1/tenant/inventory-units/{unitId}.
[ ] POST /api/v1/tenant/inventory-units/{unitId}/archive.
```

---

## 39.3. Items

```text id="gizsew"
[ ] GET /api/v1/tenant/inventory-items.
[ ] POST /api/v1/tenant/inventory-items.
[ ] GET /api/v1/tenant/inventory-items/{itemId}.
[ ] PATCH /api/v1/tenant/inventory-items/{itemId}.
[ ] POST /api/v1/tenant/inventory-items/{itemId}/activate.
[ ] POST /api/v1/tenant/inventory-items/{itemId}/deactivate.
[ ] POST /api/v1/tenant/inventory-items/{itemId}/archive.
```

---

## 39.4. Locations

```text id="kwqvit"
[ ] GET /api/v1/tenant/inventory-locations.
[ ] POST /api/v1/tenant/inventory-locations.
[ ] GET /api/v1/tenant/inventory-locations/{locationId}.
[ ] PATCH /api/v1/tenant/inventory-locations/{locationId}.
[ ] POST /api/v1/tenant/inventory-locations/{locationId}/archive.
```

---

## 39.5. Stock

```text id="kz84ne"
[ ] GET /api/v1/tenant/inventory-stock.
[ ] GET /api/v1/tenant/inventory-stock/{itemId}.
[ ] POST /api/v1/tenant/inventory-stock/recalculate.
```

---

## 39.6. Movements

```text id="diprjq"
[ ] GET /api/v1/tenant/inventory-movements.
[ ] POST /api/v1/tenant/inventory-movements.
[ ] GET /api/v1/tenant/inventory-movements/{movementId}.
[ ] POST /api/v1/tenant/inventory-movements/{movementId}/post.
[ ] POST /api/v1/tenant/inventory-movements/{movementId}/cancel.
[ ] POST /api/v1/tenant/inventory-movements/{movementId}/reverse.
[ ] POST /api/v1/tenant/inventory-movements/{movementId}/archive.
```

---

## 39.7. Adjustments

```text id="ko2nr3"
[ ] GET /api/v1/tenant/inventory-adjustments.
[ ] POST /api/v1/tenant/inventory-adjustments.
[ ] GET /api/v1/tenant/inventory-adjustments/{adjustmentId}.
[ ] POST /api/v1/tenant/inventory-adjustments/{adjustmentId}/submit.
[ ] POST /api/v1/tenant/inventory-adjustments/{adjustmentId}/approve.
[ ] POST /api/v1/tenant/inventory-adjustments/{adjustmentId}/reject.
[ ] POST /api/v1/tenant/inventory-adjustments/{adjustmentId}/post.
[ ] POST /api/v1/tenant/inventory-adjustments/{adjustmentId}/cancel.
```

---

## 39.8. Transfers

```text id="eh1m9j"
[ ] GET /api/v1/tenant/inventory-transfers.
[ ] POST /api/v1/tenant/inventory-transfers.
[ ] GET /api/v1/tenant/inventory-transfers/{transferId}.
[ ] POST /api/v1/tenant/inventory-transfers/{transferId}/post.
[ ] POST /api/v1/tenant/inventory-transfers/{transferId}/cancel.
[ ] POST /api/v1/tenant/inventory-transfers/{transferId}/reverse.
```

---

## 39.9. Consumptions

```text id="q9wikt"
[ ] GET /api/v1/tenant/inventory-consumptions.
[ ] POST /api/v1/tenant/inventory-consumptions.
[ ] GET /api/v1/tenant/inventory-consumptions/{consumptionId}.
[ ] POST /api/v1/tenant/inventory-consumptions/{consumptionId}/post.
[ ] POST /api/v1/tenant/inventory-consumptions/{consumptionId}/cancel.
[ ] POST /api/v1/tenant/inventory-consumptions/{consumptionId}/reverse.
[ ] GET /api/v1/tenant/maintenance-work-orders/{workOrderId}/inventory-consumptions.
```

---

## 39.10. Documents, alerts and reports

```text id="x4grmn"
[ ] GET /api/v1/tenant/inventory-documents.
[ ] POST /api/v1/tenant/inventory-documents.
[ ] GET /api/v1/tenant/inventory-documents/{documentId}.
[ ] POST /api/v1/tenant/inventory-documents/{documentId}/archive.

[ ] GET /api/v1/tenant/inventory-alerts.
[ ] POST /api/v1/tenant/inventory-alerts/{alertId}/acknowledge.
[ ] POST /api/v1/tenant/inventory-alerts/{alertId}/resolve.
[ ] POST /api/v1/tenant/inventory-alerts/{alertId}/dismiss.
[ ] POST /api/v1/tenant/inventory-alerts/{alertId}/archive.

[ ] GET /api/v1/tenant/inventory-reports/stock.
[ ] GET /api/v1/tenant/inventory-reports/movements.
[ ] GET /api/v1/tenant/inventory-reports/consumption.
[ ] GET /api/v1/tenant/inventory-reports/low-stock.
[ ] GET /api/v1/tenant/inventory-reports/valuation.
[ ] GET /api/v1/tenant/inventory-reports/export.
```

---

# 40. Checklist de seguridad final

```text id="kj4zvb"
[ ] Todas las rutas requieren AuthGuard.
[ ] Todas las rutas requieren TenantGuard.
[ ] Todas las rutas requieren PermissionGuard.
[ ] Ningún DTO acepta tenantId.
[ ] Ningún DTO acepta actor fields.
[ ] Ningún DTO acepta status directo fuera de transición.
[ ] Ningún DTO acepta quantityOnHand.
[ ] Ningún DTO acepta quantityAvailable.
[ ] Ningún DTO acepta totalCostAmount.
[ ] Ningún DTO acepta storageKey.
[ ] Ningún DTO acepta signedUrl.
[ ] Ningún DTO acepta base64.
[ ] Ningún DTO acepta paymentOrderId.
[ ] Ningún DTO acepta supplierPaymentOrderId.
[ ] Ningún DTO acepta journalEntryId.
[ ] Ningún DTO acepta bankTransactionId.
[ ] Ningún DTO acepta reconciliationMatchId.
[ ] No existen endpoints públicos.
[ ] No existen endpoints /me.
[ ] WordPress público no accede.
[ ] Inventory no crea Payment.
[ ] Inventory no crea SupplierPaymentOrder.
[ ] Inventory no marca paid.
[ ] Inventory no inicia transferencia bancaria.
[ ] Inventory no crea JournalEntry.
[ ] Inventory no confirma Bank Reconciliation.
[ ] Inventory no envía datos reales a IA externa.
[ ] Logs no contienen datos prohibidos.
[ ] Audit no contiene datos prohibidos.
[ ] OpenAPI no documenta campos prohibidos.
```

---

# 41. Definition of Done

```text id="dghq8d"
[ ] spec.md aprobado.
[ ] plan.md aprobado.
[ ] data-model.md aprobado.
[ ] api-contract.md aprobado.
[ ] test-plan.md aprobado.
[ ] tasks.md aprobado.
[ ] security-notes.md creado y aprobado.
[ ] Módulo NestJS implementado.
[ ] Configuración implementada.
[ ] Feature flags implementadas.
[ ] Enums implementados.
[ ] Errores implementados.
[ ] Value objects implementados.
[ ] Entidades implementadas.
[ ] Policies implementadas.
[ ] Prisma schema implementado.
[ ] Migración implementada.
[ ] Repositorios implementados.
[ ] DTOs implementados.
[ ] Guards implementados.
[ ] Controllers implementados.
[ ] Services implementados.
[ ] Use cases implementados.
[ ] Stock engine implementado.
[ ] Reversal engine implementado.
[ ] Recalculation implementado.
[ ] Categorías implementadas.
[ ] Unidades implementadas.
[ ] Ubicaciones implementadas.
[ ] Ítems implementados.
[ ] Movimientos implementados.
[ ] Ajustes implementados.
[ ] Transferencias implementadas.
[ ] Consumos implementados.
[ ] Documentos SDS implementados.
[ ] Supplier boundary implementado.
[ ] Maintenance boundary implementado.
[ ] Alertas implementadas.
[ ] Reportes implementados.
[ ] Exportaciones implementadas.
[ ] Auditoría implementada.
[ ] Observabilidad implementada.
[ ] OpenAPI implementado.
[ ] Seeds implementados.
[ ] Tests unitarios pasan.
[ ] Tests integración pasan.
[ ] Tests API pasan.
[ ] Tests multitenancy pasan.
[ ] Tests security pasan.
[ ] Tests stock consistency pasan.
[ ] Tests concurrency críticos pasan.
[ ] Tests OpenAPI pasan.
[ ] Smoke tests pasan.
[ ] CI completo pasa.
```

---

# 42. No aceptación

No se acepta implementación si:

```text id="kcqmh6"
- permite inventory item cross-tenant;
- permite inventory location cross-tenant;
- permite inventory movement cross-tenant;
- permite inventory stock cross-tenant;
- permite inventory adjustment cross-tenant;
- permite inventory transfer cross-tenant;
- permite inventory consumption cross-tenant;
- permite secureDocument cross-tenant;
- permite supplier cross-tenant;
- permite supplierPayable cross-tenant;
- permite maintenanceWorkOrder cross-tenant;
- permite maintenanceTask cross-tenant;
- acepta tenantId desde body;
- acepta actor fields desde body;
- acepta status directo fuera de transición;
- acepta quantityOnHand desde cliente;
- acepta quantityAvailable desde cliente;
- acepta quantityReserved desde cliente;
- acepta totalCostAmount desde cliente;
- acepta movementNumber desde cliente;
- acepta adjustmentNumber desde cliente;
- acepta transferNumber desde cliente;
- acepta consumptionNumber desde cliente;
- acepta storageKey;
- acepta signedUrl persistente;
- acepta base64;
- acepta rawFilePayload;
- usa float/double para cantidad o costo;
- permite cantidad negativa;
- permite costo negativo;
- permite salida mayor al stock disponible;
- permite consumo mayor al stock disponible;
- permite transferencia mayor al stock disponible;
- permite transferencia a la misma ubicación;
- permite editar movimiento posted destructivamente;
- reverse borra historial original;
- adjustment posted no crea movement;
- transfer posted no crea transferOut/transferIn;
- consumption posted no crea movement;
- consumption modifica estado de Maintenance Work Orders;
- crea Payment;
- crea SupplierPaymentOrder;
- marca paid;
- inicia transferencia bancaria;
- inicia Open Banking payment;
- crea JournalEntry;
- modifica Accounting Ledger;
- confirma Bank Reconciliation;
- crea endpoints públicos;
- crea endpoints /me;
- permite acceso desde WordPress público;
- envía datos reales de inventario a IA externa;
- omite audit crítico;
- logs contienen storageKey;
- audit contiene storageKey;
- OpenAPI documenta campos prohibidos.
```

---

# 43. Resultado esperado

Al completar este backlog, el módulo `023-inventory-basic` quedará listo para implementación controlada dentro de RESIDENT Core.

Resultado esperado:

```text id="x9btgl"
module foundation tasks definidas
configuration tasks definidas
feature flags tasks definidas
enums tasks definidas
errors tasks definidas
value objects tasks definidas
entities tasks definidas
policies tasks definidas
Prisma migration tasks definidas
repository tasks definidas
DTO tasks definidas
guard tasks definidas
category tasks definidas
unit tasks definidas
location tasks definidas
item tasks definidas
stock tasks definidas
movement tasks definidas
recalculation tasks definidas
adjustment tasks definidas
transfer tasks definidas
consumption tasks definidas
SDS tasks definidas
Supplier Payments boundary tasks definidas
Maintenance Work Orders boundary tasks definidas
reports tasks definidas
exports tasks definidas
alerts tasks definidas
audit tasks definidas
observability tasks definidas
OpenAPI tasks definidas
security hardening tasks definidas
performance tasks definidas
concurrency tasks definidas
CI gates tasks definidas
seeds tasks definidas
smoke tasks definidas
PR plan definido
DoD definido
no acceptance definido
```

---

# 44. Expediente actualizado

```text id="e0jv75"
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
│   │       ├── plan.md
│   │       ├── data-model.md
│   │       ├── api-contract.md
│   │       ├── test-plan.md
│   │       └── tasks.md
```
