# Test Plan — 023 Inventory Basic

## 1. Información del documento

| Campo           | Valor                                                                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                 |
| Spec ID         | 023                                                                                                                                           |
| Módulo          | Inventory Basic                                                                                                                               |
| Documento       | Test Plan                                                                                                                                     |
| Ruta            | `docs/specs/023-inventory-basic/test-plan.md`                                                                                                 |
| Versión         | 0.1                                                                                                                                           |
| Estado          | needs-review                                                                                                                                  |
| Fecha           | 2026-07-24                                                                                                                                    |
| Documento base  | `docs/specs/023-inventory-basic/spec.md`                                                                                                      |
| Plan técnico    | `docs/specs/023-inventory-basic/plan.md`                                                                                                      |
| Modelo de datos | `docs/specs/023-inventory-basic/data-model.md`                                                                                                |
| Contrato API    | `docs/specs/023-inventory-basic/api-contract.md`                                                                                              |
| Stack objetivo  | NestJS / TypeScript / PostgreSQL / Prisma / OpenAPI / Keycloak                                                                                |
| Naturaleza      | Tenant-scoped / Operational / Stock-controlled / Movement-driven / Maintenance-aware / Supplier-aware / Cost-aware / Audit-heavy / Non-public |

---

## 2. Propósito

Este documento define el plan de pruebas del módulo `023-inventory-basic`.

El objetivo es validar que Inventory Basic funcione como un módulo operativo seguro, multitenant, consistente y auditable para administrar categorías, unidades, ítems, ubicaciones, saldos, movimientos, ajustes, transferencias, consumos, documentos, alertas, reportes y exportaciones.

Regla central del plan de pruebas:

```text id="qie3pv"
Inventory Basic solo se considera correcto si todo cambio de stock deriva de movimientos posteados, todo recurso respeta tenant isolation, toda cantidad y costo usa Decimal string, todo documento pasa por Secure Document Storage, todo consumo valida Maintenance Work Orders, toda referencia a proveedor respeta Supplier Payments, y ninguna operación crea pagos, SupplierPaymentOrders, JournalEntries, conciliaciones bancarias, endpoints públicos, endpoints /me, acceso WordPress público ni uso de IA externa con datos reales.
```

---

## 3. Objetivos de prueba

```text id="f6atcn"
1. Verificar consistencia de stock.
2. Verificar que los movimientos posted sean la fuente de verdad.
3. Verificar que movimientos draft no afecten stock.
4. Verificar que movimientos posted no sean editables destructivamente.
5. Verificar prevención de stock negativo.
6. Verificar transacciones en movimientos, ajustes, transferencias y consumos.
7. Verificar tenant isolation en todas las entidades.
8. Verificar autorización por permisos.
9. Verificar rechazo de campos prohibidos.
10. Verificar integración segura con Secure Document Storage.
11. Verificar integración limitada con Supplier Payments.
12. Verificar integración limitada con Maintenance Work Orders.
13. Verificar ausencia de pagos, contabilidad y conciliación directa.
14. Verificar ausencia de endpoints públicos.
15. Verificar ausencia de endpoints /me en MVP.
16. Verificar ausencia de acceso desde WordPress público.
17. Verificar auditoría de eventos críticos.
18. Verificar logs y métricas seguras.
19. Verificar reportes y exportaciones tenant-scoped.
20. Verificar OpenAPI contract y extensiones de seguridad.
```

---

## 4. Alcance de pruebas

### 4.1. Incluido

```text id="rp1kcy"
- Value objects.
- Domain entities.
- State machines.
- Policies.
- Repository ports.
- Prisma repositories.
- Categorías.
- Unidades de medida.
- Ítems.
- Ubicaciones.
- Saldos.
- Movimientos.
- Posting engine.
- Reversal engine.
- Recalculation engine.
- Ajustes.
- Transferencias.
- Consumos de mantenimiento.
- Documentos vía Secure Document Storage.
- Referencias a Supplier Payments.
- Alertas.
- Reportes.
- Exportaciones.
- API REST tenant.
- Seguridad.
- Multitenancy.
- Auditoría.
- Observabilidad.
- OpenAPI.
- Performance.
- Concurrencia.
- Smoke tests.
- Regression tests.
```

---

### 4.2. Fuera de alcance

No se probarán como funcionalidades propias del módulo:

```text id="czgj87"
- purchase orders completas;
- cotizaciones multi-proveedor;
- licitaciones;
- inventario serializado avanzado;
- lotes con vencimiento obligatorio;
- códigos QR/barcode;
- RFID;
- app móvil offline;
- activos fijos;
- depreciación;
- FIFO/LIFO oficial;
- kardex contable oficial;
- contabilidad automática;
- pagos automáticos;
- transferencias bancarias;
- Open Banking payment initiation;
- SRI;
- facturación electrónica;
- ventas;
- portal de proveedores;
- endpoints /me;
- endpoints públicos;
- IA externa con datos reales.
```

---

## 5. Estrategia de pruebas

### 5.1. Pirámide de pruebas

```text id="z58hak"
1. Unit tests:
   - value objects;
   - entities;
   - policies;
   - state machines;
   - stock formulas.

2. Integration tests:
   - repositories;
   - Prisma;
   - transactions;
   - posting engine;
   - reversal engine;
   - recalculation;
   - SDS adapter;
   - Supplier Payments adapter mock;
   - Maintenance Work Orders adapter mock;
   - Audit adapter.

3. API tests:
   - endpoints REST;
   - DTO validation;
   - permissions;
   - error mapping;
   - response contract.

4. Security tests:
   - forbidden fields;
   - tenant isolation;
   - no storageKey;
   - no public endpoints;
   - no /me endpoints;
   - no payments;
   - no accounting;
   - no WordPress access.

5. E2E / smoke tests:
   - stock inicial;
   - entrada;
   - salida;
   - transferencia;
   - consumo de mantenimiento;
   - ajuste;
   - alerta;
   - reporte;
   - exportación.
```

---

### 5.2. Criterio general de aprobación

```text id="t6j0ny"
El módulo solo pasa si todos los tests unitarios, integración, API, multitenancy, seguridad, stock consistency, audit, OpenAPI y smoke flows pasan en CI.
```

---

## 6. Entornos de prueba

### 6.1. Local

```text id="jk8ux6"
- Docker Compose.
- PostgreSQL local.
- Redis local si aplica.
- Keycloak local o mock OIDC.
- Prisma migrate dev/test.
- Seeds ficticios.
```

---

### 6.2. CI

```text id="q4cz3r"
- PostgreSQL efímero.
- Migración limpia.
- Seeds de prueba.
- Tests paralelizables por suite.
- OpenAPI contract validation.
- Security gates.
- Coverage report.
```

---

### 6.3. Staging futuro

```text id="taydmv"
- Ambiente cloud.
- Datos sintéticos.
- Keycloak staging.
- SDS staging.
- Auditoría habilitada.
- Métricas habilitadas.
```

---

## 7. Datos de prueba

### 7.1. Tenants

```text id="az82bi"
tenantA = "Conjunto Demo Norte"
tenantB = "Conjunto Demo Sur"
```

Regla:

```text id="l5ohgp"
Los tests deben demostrar que tenantA nunca puede leer, crear, modificar, postear, reversar, exportar o relacionar recursos de tenantB.
```

---

### 7.2. Usuarios

```text id="sbkrs0"
tenantAdminA
inventoryManagerA
maintenanceManagerA
financialManagerA
boardMemberA
technicianA
residentA

tenantAdminB
inventoryManagerB
maintenanceManagerB

platformAdmin
unauthenticatedUser
```

---

### 7.3. Permisos base

```text id="lwmhjv"
inventoryCategories.*
inventoryUnits.*
inventoryItems.*
inventoryLocations.*
inventoryStock.*
inventoryMovements.*
inventoryAdjustments.*
inventoryTransfers.*
inventoryConsumptions.*
inventoryDocuments.*
inventoryAlerts.*
inventoryReports.*
```

---

### 7.4. Catálogos

```text id="b6w5ds"
CLEANING
PLUMBING
ELECTRICAL
GARDENING
SECURITY
MINOR_TOOLS
SPARE_PARTS
OTHER
```

---

### 7.5. Unidades

```text id="xodpt5"
UNIT — no decimals
LITER — decimals 4
METER — decimals 4
BOX — no decimals
GALLON — decimals 4
```

---

### 7.6. Ubicaciones

```text id="z1pqwv"
MAIN_WAREHOUSE
PUMP_ROOM
GUARDHOUSE
MAINTENANCE_ROOM
ADMIN_OFFICE
```

---

### 7.7. Ítems

```text id="nd33et"
PVC_VALVE_1_2
LED_BULB_12W
CHLORINE_BOTTLE
INDUSTRIAL_BROOM
WATER_PUMP_SEAL
WORK_GLOVES
```

---

### 7.8. Referencias externas mock

```text id="zt1c8x"
supplierActiveA
supplierBlockedA
supplierInactiveA
supplierTenantB

supplierPayableApprovedA
supplierPayableTenantB

maintenanceWorkOrderOpenA
maintenanceWorkOrderClosedA
maintenanceWorkOrderTenantB

maintenanceTaskA
maintenanceTaskTenantB

secureDocumentInventoryA
secureDocumentTenantB
secureDocumentWithStorageKeyHidden
```

---

## 8. Unit tests — Value objects

### 8.1. Códigos

```text id="nv0tz4"
[ ] InventoryCategoryCode acepta códigos alfanuméricos uppercase con guion bajo.
[ ] InventoryCategoryCode rechaza vacío.
[ ] InventoryCategoryCode rechaza longitud excesiva.
[ ] InventoryUnitCode acepta UNIT, LITER, METER.
[ ] InventoryItemCode acepta PVC_VALVE_1_2.
[ ] InventoryItemCode rechaza espacios peligrosos.
[ ] InventoryLocationCode acepta MAIN_WAREHOUSE.
[ ] InventoryMovementNumber valida formato IM-YYYYMM-sequence.
[ ] InventoryAdjustmentNumber valida formato IA-YYYYMM-sequence.
[ ] InventoryTransferNumber valida formato IT-YYYYMM-sequence.
[ ] InventoryConsumptionNumber valida formato IC-YYYYMM-sequence.
```

---

### 8.2. Nombres y texto

```text id="xl7xu7"
[ ] InventoryItemName rechaza vacío.
[ ] InventoryItemName aplica trim.
[ ] InventoryItemName rechaza longitud excesiva.
[ ] InventoryReason rechaza vacío cuando es requerido.
[ ] InventoryReason rechaza payload script.
[ ] InventoryReason sanitiza contenido HTML peligroso.
[ ] InventoryDocumentReference rechaza storageKey.
[ ] InventoryDocumentReference acepta secureDocumentId UUID válido.
```

---

### 8.3. Cantidades

```text id="f5ftfy"
[ ] InventoryQuantity acepta "1.0000".
[ ] InventoryQuantity acepta "10.5000" si la unidad permite decimales.
[ ] InventoryQuantity rechaza 1.5 como number.
[ ] InventoryQuantity rechaza "0.0000" para movimientos operativos.
[ ] InventoryQuantity rechaza negativos.
[ ] InventoryQuantity rechaza NaN.
[ ] InventoryQuantity rechaza Infinity.
[ ] InventoryQuantity rechaza notación científica si la política lo prohíbe.
[ ] InventoryQuantity respeta decimalPrecision de la unidad.
[ ] InventoryQuantity rechaza decimales si allowsDecimals=false.
```

---

### 8.4. Costos

```text id="cab9nh"
[ ] InventoryUnitCost acepta "2.35".
[ ] InventoryUnitCost acepta "0.00".
[ ] InventoryUnitCost rechaza negativos.
[ ] InventoryUnitCost rechaza number.
[ ] InventoryTotalCost se calcula server-side.
[ ] InventoryCurrency acepta USD.
[ ] InventoryCurrency rechaza moneda distinta de USD en MVP.
```

---

## 9. Unit tests — Entidades

### 9.1. InventoryCategory

```text id="or35bn"
[ ] Crea categoría active.
[ ] Rechaza categoryCode inválido.
[ ] Rechaza categoryName vacío.
[ ] Permite actualización de nombre.
[ ] Permite archive con reason.
[ ] Rechaza archive sin reason.
[ ] No elimina físicamente la categoría.
```

---

### 9.2. InventoryUnitOfMeasure

```text id="c2fdrq"
[ ] Crea unidad sin decimales.
[ ] Crea unidad con decimales.
[ ] Rechaza decimalPrecision > 4.
[ ] Rechaza decimalPrecision < 0.
[ ] Rechaza allowsDecimals=false con decimalPrecision > 0.
[ ] Permite archive con reason.
```

---

### 9.3. InventoryItem

```text id="krzy9u"
[ ] Crea ítem draft.
[ ] Activa ítem draft.
[ ] Inactiva ítem active.
[ ] Reactiva ítem inactive.
[ ] Archiva ítem draft.
[ ] Archiva ítem active.
[ ] Rechaza movimientos ordinarios sobre item archived.
[ ] Rechaza movimientos ordinarios sobre item inactive salvo política autorizada.
[ ] Valida minimumStockQuantity no negativa.
[ ] Valida reorderPointQuantity no negativa.
[ ] Valida referenceUnitCostAmount no negativo.
```

---

### 9.4. InventoryStorageLocation

```text id="stogjr"
[ ] Crea ubicación active.
[ ] Valida locationCode.
[ ] Valida responsibleUserId opcional.
[ ] Permite archive con reason.
[ ] Rechaza movimientos sobre ubicación archived.
[ ] Rechaza movimientos ordinarios sobre ubicación inactive salvo política autorizada.
```

---

### 9.5. InventoryStockBalance

```text id="ix0tco"
[ ] Crea saldo inicial en cero.
[ ] Calcula quantityAvailable = quantityOnHand - quantityReserved.
[ ] Rechaza quantityReserved > quantityOnHand.
[ ] Rechaza quantityOnHand negativo por defecto.
[ ] Actualiza lastMovementId.
[ ] Actualiza lastMovementAt.
```

---

### 9.6. InventoryMovement

```text id="c0o713"
[ ] Crea movimiento draft.
[ ] Deriva direction in para receipt.
[ ] Deriva direction out para issue.
[ ] Deriva direction out para maintenanceConsumption.
[ ] Deriva direction in para transferIn.
[ ] Deriva direction out para transferOut.
[ ] Calcula totalCostAmount desde quantity * unitCostAmount.
[ ] No acepta totalCostAmount desde cliente.
[ ] Postea movimiento draft.
[ ] Cancela movimiento draft.
[ ] Reversa movimiento posted.
[ ] Rechaza editar posted destructivamente.
[ ] Rechaza postear movimiento cancelled.
[ ] Rechaza reversar movimiento draft.
```

---

### 9.7. InventoryStockAdjustment

```text id="pwkhqk"
[ ] Crea ajuste draft.
[ ] Requiere reason.
[ ] Submit cambia draft -> submitted.
[ ] Approve cambia submitted -> approved.
[ ] Reject cambia submitted -> rejected.
[ ] Reject requiere rejectReason.
[ ] Post cambia approved -> posted.
[ ] Post crea movement asociado.
[ ] Adjustment decrease valida stock disponible.
```

---

### 9.8. InventoryTransfer

```text id="khjnp2"
[ ] Crea transferencia draft.
[ ] Rechaza origen igual a destino.
[ ] Rechaza quantity <= 0.
[ ] Post crea movement transferOut.
[ ] Post crea movement transferIn.
[ ] Post actualiza saldo origen.
[ ] Post actualiza saldo destino.
[ ] Reversa transferencia posted con trazabilidad.
```

---

### 9.9. InventoryConsumption

```text id="vxda1x"
[ ] Crea consumo draft.
[ ] Requiere maintenanceWorkOrderId.
[ ] Requiere itemId.
[ ] Requiere storageLocationId.
[ ] Post crea movement maintenanceConsumption.
[ ] Post descuenta stock.
[ ] No cambia estado de Maintenance Work Orders.
[ ] Rechaza consumo mayor al stock disponible.
```

---

### 9.10. InventoryDocument

```text id="acc1n7"
[ ] Crea vínculo documental con secureDocumentId.
[ ] Rechaza storageKey.
[ ] Rechaza signedUrl persistente.
[ ] Rechaza base64.
[ ] Archiva vínculo documental.
[ ] No elimina documento físico.
```

---

### 9.11. InventoryAlert

```text id="wqfpzp"
[ ] Crea alerta lowStock.
[ ] Crea alerta outOfStock.
[ ] Acknowledge cambia open -> acknowledged.
[ ] Resolve cambia open -> resolved.
[ ] Dismiss requiere reason.
[ ] Archived conserva trazabilidad.
```

---

## 10. Unit tests — State machines

### 10.1. InventoryItemStatus

```text id="o0t0mj"
[ ] draft -> active permitido.
[ ] active -> inactive permitido.
[ ] inactive -> active permitido.
[ ] active -> archived permitido.
[ ] inactive -> archived permitido.
[ ] draft -> archived permitido.
[ ] archived -> active prohibido.
[ ] archived -> inactive prohibido.
```

---

### 10.2. InventoryMovementStatus

```text id="rys8os"
[ ] draft -> posted permitido.
[ ] draft -> cancelled permitido.
[ ] posted -> reversed permitido.
[ ] posted -> archived permitido.
[ ] cancelled -> archived permitido.
[ ] reversed -> archived permitido.
[ ] posted -> draft prohibido.
[ ] cancelled -> posted prohibido.
[ ] reversed -> posted prohibido.
```

---

### 10.3. InventoryAdjustmentStatus

```text id="cowln8"
[ ] draft -> submitted permitido.
[ ] submitted -> approved permitido.
[ ] submitted -> rejected permitido.
[ ] approved -> posted permitido.
[ ] draft -> cancelled permitido.
[ ] submitted -> cancelled permitido.
[ ] rejected -> archived permitido.
[ ] posted -> archived permitido.
[ ] rejected -> approved prohibido.
[ ] posted -> approved prohibido.
```

---

### 10.4. InventoryTransferStatus

```text id="m5merd"
[ ] draft -> posted permitido.
[ ] draft -> cancelled permitido.
[ ] posted -> reversed permitido.
[ ] posted -> archived permitido.
[ ] cancelled -> archived permitido.
[ ] reversed -> archived permitido.
[ ] posted -> draft prohibido.
```

---

### 10.5. InventoryConsumptionStatus

```text id="owtquk"
[ ] draft -> posted permitido.
[ ] draft -> cancelled permitido.
[ ] posted -> reversed permitido.
[ ] posted -> archived permitido.
[ ] cancelled -> archived permitido.
[ ] reversed -> archived permitido.
[ ] cancelled -> posted prohibido.
```

---

### 10.6. InventoryAlertStatus

```text id="s4lob7"
[ ] open -> acknowledged permitido.
[ ] open -> resolved permitido.
[ ] open -> dismissed permitido.
[ ] acknowledged -> resolved permitido.
[ ] acknowledged -> dismissed permitido.
[ ] resolved -> archived permitido.
[ ] dismissed -> archived permitido.
[ ] resolved -> open prohibido.
```

---

## 11. Unit tests — Policies

### 11.1. Tenant policy

```text id="o76fw4"
[ ] InventoryTenantPolicy permite recurso del mismo tenant.
[ ] InventoryTenantPolicy rechaza recurso tenantB desde tenantA.
[ ] Cross-tenant se mapea a 404.
```

---

### 11.2. Stock policy

```text id="xeggc5"
[ ] InventoryStockPolicy permite entrada con cantidad positiva.
[ ] InventoryStockPolicy rechaza cantidad negativa.
[ ] InventoryStockPolicy rechaza stock negativo por defecto.
[ ] InventoryStockPolicy permite salida si stock suficiente.
[ ] InventoryStockPolicy rechaza salida si stock insuficiente.
[ ] InventoryNegativeStockPolicy está false por defecto.
```

---

### 11.3. Movement posting policy

```text id="la67nn"
[ ] Permite postear movement draft.
[ ] Rechaza postear movement posted.
[ ] Rechaza postear movement cancelled.
[ ] Rechaza postear movement archived.
[ ] Requiere item active.
[ ] Requiere location active.
[ ] Requiere reason para movimientos manuales si config lo exige.
```

---

### 11.4. Movement reversal policy

```text id="hygkb8"
[ ] Permite reversar movement posted.
[ ] Rechaza reversar movement draft.
[ ] Rechaza reversar movement cancelled.
[ ] Rechaza reversar dos veces el mismo movimiento.
[ ] Requiere reverseReason.
```

---

### 11.5. Adjustment policy

```text id="t3o66v"
[ ] Requiere reason.
[ ] Requiere aprobación si INVENTORY_ADJUSTMENTS_REQUIRE_APPROVAL=true.
[ ] Rechaza postear ajuste no aprobado si política exige aprobación.
[ ] Rechaza adjustmentDecrease si stock insuficiente.
```

---

### 11.6. Transfer policy

```text id="va9e6h"
[ ] Rechaza sourceStorageLocationId igual a targetStorageLocationId.
[ ] Requiere stock disponible en origen.
[ ] Requiere reason.
[ ] Exige que ambas ubicaciones pertenezcan al tenant.
```

---

### 11.7. Consumption policy

```text id="z5bq1c"
[ ] Requiere maintenanceWorkOrderId.
[ ] Requiere work order tenant-scoped.
[ ] Requiere task perteneciente a work order si se informa.
[ ] Rechaza work order archived.
[ ] Rechaza consumo si stock insuficiente.
[ ] No permite modificar estado de maintenance.
```

---

### 11.8. Supplier policy

```text id="gtflrz"
[ ] Permite supplier active del mismo tenant.
[ ] Rechaza supplier blocked.
[ ] Rechaza supplier inactive.
[ ] Rechaza supplier archived.
[ ] Rechaza supplier tenantB.
[ ] Rechaza supplierPayable tenantB.
```

---

### 11.9. Document policy

```text id="cboddb"
[ ] Permite secureDocumentId tenant-scoped.
[ ] Rechaza secureDocumentId tenantB.
[ ] Rechaza storageKey.
[ ] Rechaza signedUrl persistente.
[ ] Rechaza base64.
```

---

### 11.10. Boundary policies

```text id="i2d77d"
[ ] NoPublicInventoryEndpointPolicy bloquea rutas públicas.
[ ] NoMeInventoryEndpointPolicy bloquea rutas /me.
[ ] NoWordPressInventoryAccessPolicy bloquea origen WordPress público.
[ ] NoDirectInventoryPaymentPolicy impide Payment.
[ ] NoDirectInventoryPaymentPolicy impide SupplierPaymentOrder.
[ ] NoDirectInventoryAccountingPolicy impide JournalEntry.
[ ] NoExternalAiInventoryDataPolicy impide IA externa real.
```

---

## 12. Integration tests — Repositories

### 12.1. Category repository

```text id="mx4fnl"
[ ] create category con tenantId.
[ ] list categories filtra por tenantId.
[ ] get category usa id + tenantId.
[ ] update category no modifica tenantId.
[ ] archive category aplica archivedAt.
[ ] duplicate code por tenant falla.
[ ] mismo code en tenant distinto permitido.
```

---

### 12.2. Unit repository

```text id="jx8y7w"
[ ] create unit con tenantId.
[ ] duplicate unitCode por tenant falla.
[ ] same unitCode en tenant distinto permitido.
[ ] list units filtra por tenantId.
[ ] archive unit no borra físicamente.
```

---

### 12.3. Item repository

```text id="n6qr2e"
[ ] create item valida tenantId.
[ ] duplicate itemCode por tenant falla.
[ ] same itemCode en tenant distinto permitido.
[ ] list items filtra por tenantId.
[ ] get item tenantB desde tenantA retorna null.
[ ] update item no actualiza stock directo.
[ ] archive item conserva histórico.
```

---

### 12.4. Location repository

```text id="bjpwfd"
[ ] create location.
[ ] duplicate locationCode por tenant falla.
[ ] same locationCode en tenant distinto permitido.
[ ] get location tenantB desde tenantA retorna null.
[ ] archive location conserva histórico.
```

---

### 12.5. StockBalance repository

```text id="l5l4en"
[ ] create balance único por tenant/item/location.
[ ] update balance solo desde servicio interno.
[ ] get by item filtra tenant.
[ ] get by location filtra tenant.
[ ] no permite quantityReserved > quantityOnHand.
[ ] no permite quantityAvailable inconsistente.
```

---

### 12.6. Movement repository

```text id="i0yikd"
[ ] create movement draft.
[ ] movementNumber único por tenant.
[ ] list movements filtra tenant.
[ ] get movement tenantB desde tenantA retorna null.
[ ] update posted destructivo se bloquea a nivel service/repository si aplica.
[ ] indexes soportan consulta por movementType.
[ ] indexes soportan consulta por maintenanceWorkOrderId.
```

---

### 12.7. Adjustment repository

```text id="k951qi"
[ ] create adjustment draft.
[ ] adjustmentNumber único por tenant.
[ ] movementId único.
[ ] get adjustment tenantB desde tenantA retorna null.
```

---

### 12.8. Transfer repository

```text id="f9x2n0"
[ ] create transfer draft.
[ ] transferNumber único por tenant.
[ ] outMovementId único.
[ ] inMovementId único.
[ ] source != target enforced.
[ ] get transfer tenantB desde tenantA retorna null.
```

---

### 12.9. Consumption repository

```text id="nvksaw"
[ ] create consumption draft.
[ ] consumptionNumber único por tenant.
[ ] movementId único.
[ ] get consumption tenantB desde tenantA retorna null.
[ ] list by workOrder filtra tenant.
```

---

### 12.10. Document repository

```text id="cd0wcw"
[ ] create document link.
[ ] list documents filtra tenant.
[ ] get document tenantB desde tenantA retorna null.
[ ] archive document link no borra SecureDocument.
```

---

### 12.11. Alert repository

```text id="en2g5x"
[ ] create lowStock alert.
[ ] list open alerts filtra tenant.
[ ] acknowledge alert tenant-scoped.
[ ] resolve alert tenant-scoped.
[ ] dismiss alert tenant-scoped.
```

---

## 13. Integration tests — Stock engine

### 13.1. Opening balance

```text id="l22xbz"
[ ] openingBalance draft no afecta stock.
[ ] openingBalance posted crea StockBalance.
[ ] openingBalance posted incrementa quantityOnHand.
[ ] openingBalance posted actualiza quantityAvailable.
[ ] openingBalance posted audita evento.
```

---

### 13.2. Receipt

```text id="ph2wry"
[ ] receipt posted incrementa stock.
[ ] receipt calcula totalCostAmount server-side.
[ ] receipt actualiza averageUnitCostAmount si aplica.
[ ] receipt con supplier active permitido.
[ ] receipt con supplier blocked rechazado.
[ ] receipt con supplier tenantB rechazado.
[ ] receipt con secureDocument tenantA permitido.
[ ] receipt con secureDocument tenantB rechazado.
```

---

### 13.3. Issue

```text id="p1c0u9"
[ ] issue posted disminuye stock.
[ ] issue draft no afecta stock.
[ ] issue mayor a stock disponible falla.
[ ] issue igual a stock disponible deja stock cero.
[ ] issue genera outOfStock si stock llega a cero.
[ ] issue requiere reason si config lo exige.
```

---

### 13.4. Maintenance consumption

```text id="u4eib3"
[ ] maintenanceConsumption posted disminuye stock.
[ ] maintenanceConsumption requiere workOrder tenant-scoped.
[ ] maintenanceConsumption con workOrder tenantB falla.
[ ] maintenanceConsumption con task de otra orden falla.
[ ] maintenanceConsumption no modifica status de workOrder.
[ ] maintenanceConsumption no crea MaintenanceCost.
[ ] maintenanceConsumption no crea SupplierPayable.
```

---

### 13.5. Adjustment increase

```text id="n32yv5"
[ ] adjustmentIncrease posted incrementa stock.
[ ] adjustmentIncrease requiere reason.
[ ] adjustmentIncrease crea InventoryMovement.
[ ] adjustmentIncrease audita adjustment y movement.
```

---

### 13.6. Adjustment decrease

```text id="ljavmo"
[ ] adjustmentDecrease posted disminuye stock.
[ ] adjustmentDecrease mayor a stock disponible falla.
[ ] adjustmentDecrease requiere reason.
[ ] adjustmentDecrease requiere aprobación si config lo exige.
```

---

### 13.7. Transfer

```text id="t5di4m"
[ ] transfer posted disminuye stock origen.
[ ] transfer posted incrementa stock destino.
[ ] transfer posted crea transferOut.
[ ] transfer posted crea transferIn.
[ ] transfer se ejecuta en una sola transacción.
[ ] transfer falla completa si falla transferIn.
[ ] transfer falla completa si stock origen insuficiente.
```

---

### 13.8. Return to stock

```text id="ca5usv"
[ ] returnToStock incrementa stock.
[ ] returnToStock requiere referencia o razón.
[ ] returnToStock no marca automáticamente workOrder como reabierta.
```

---

### 13.9. Correction

```text id="spdg6e"
[ ] correction positiva incrementa stock si se define como inbound.
[ ] correction negativa disminuye stock si se define como outbound.
[ ] correction requiere reason.
[ ] correction no edita movimiento original.
```

---

## 14. Integration tests — Recalculation

```text id="kcd1zw"
[ ] Recalculate por tenant completo reconstruye saldos desde movements posted.
[ ] Recalculate por item reconstruye solo ese item.
[ ] Recalculate por item/location reconstruye solo ese saldo.
[ ] Recalculate ignora movements draft.
[ ] Recalculate ignora movements cancelled.
[ ] Recalculate considera reversals correctamente.
[ ] Recalculate preserva quantityReserved si aplica.
[ ] Recalculate recalcula quantityAvailable.
[ ] Recalculate registra audit.
[ ] Recalculate no acepta quantityOnHand desde cliente.
```

---

## 15. Integration tests — External adapters

### 15.1. Secure Document Storage adapter

```text id="mpjml2"
[ ] validateDocumentBelongsToTenant acepta document tenantA.
[ ] validateDocumentBelongsToTenant rechaza document tenantB.
[ ] createReportExport crea secureDocumentId.
[ ] getDownloadAvailability no retorna storageKey.
[ ] getDownloadAvailability no retorna signedUrl persistente.
[ ] adapter rechaza sourceModule incompatible si aplica.
```

---

### 15.2. Supplier Payments adapter

```text id="w5nsp0"
[ ] validateSupplier acepta supplier active tenantA.
[ ] validateSupplier rechaza supplier blocked.
[ ] validateSupplier rechaza supplier inactive.
[ ] validateSupplier rechaza supplier archived.
[ ] validateSupplier rechaza supplier tenantB.
[ ] validateSupplierPayable acepta payable tenantA.
[ ] validateSupplierPayable rechaza payable tenantB.
[ ] Inventory no llama createSupplierPaymentOrder.
[ ] Inventory no llama markPaid.
[ ] Inventory no llama createPayment.
```

---

### 15.3. Maintenance Work Orders adapter

```text id="b69hbs"
[ ] validateWorkOrder acepta workOrder open tenantA.
[ ] validateWorkOrder rechaza workOrder archived.
[ ] validateWorkOrder rechaza workOrder tenantB.
[ ] validateTask acepta task perteneciente a workOrder.
[ ] validateTask rechaza task de otra workOrder.
[ ] Inventory no llama closeWorkOrder.
[ ] Inventory no llama updateWorkOrderStatus.
[ ] Inventory no llama approveMaintenanceCost.
```

---

### 15.4. Audit adapter

```text id="osr990"
[ ] audit registra tenantId.
[ ] audit registra actor server-side.
[ ] audit registra action.
[ ] audit registra resourceType.
[ ] audit registra resourceId.
[ ] audit registra outcome.
[ ] audit sanitiza metadata.
[ ] audit no contiene storageKey.
[ ] audit no contiene signedUrl.
[ ] audit no contiene base64.
```

---

## 16. API tests — Categories

```text id="cc30z1"
[ ] GET /inventory-categories requiere auth.
[ ] GET /inventory-categories requiere permission read.
[ ] POST /inventory-categories crea categoría.
[ ] POST rechaza categoryCode duplicado.
[ ] POST rechaza tenantId.
[ ] PATCH actualiza nombre.
[ ] PATCH rechaza status directo.
[ ] archive requiere archiveReason.
[ ] archive cambia status a archived.
[ ] tenantA no lee categoría tenantB.
```

---

## 17. API tests — Units

```text id="sr76qh"
[ ] GET /inventory-units requiere auth.
[ ] POST crea unidad UNIT sin decimales.
[ ] POST crea unidad LITER con decimales.
[ ] POST rechaza decimalPrecision > 4.
[ ] POST rechaza allowsDecimals=false con decimalPrecision > 0.
[ ] PATCH actualiza unitSymbol.
[ ] PATCH rechaza tenantId.
[ ] archive requiere reason.
[ ] tenantA no lee unidad tenantB.
```

---

## 18. API tests — Items

```text id="fjzwby"
[ ] GET /inventory-items lista solo tenant actual.
[ ] POST crea item draft o active según política.
[ ] POST valida categoryId tenant-scoped.
[ ] POST valida unitId tenant-scoped.
[ ] POST valida defaultStorageLocationId tenant-scoped.
[ ] POST valida preferredSupplierId.
[ ] POST rechaza supplier tenantB.
[ ] POST rechaza referenceUnitCostAmount negativo.
[ ] POST rechaza currency distinta de USD.
[ ] PATCH actualiza minimumStockQuantity.
[ ] PATCH rechaza quantityOnHand.
[ ] PATCH rechaza quantityAvailable.
[ ] PATCH rechaza status directo.
[ ] activate cambia status.
[ ] deactivate cambia status.
[ ] archive cambia status y archivedAt.
[ ] item archived no recibe movimientos.
```

---

## 19. API tests — Locations

```text id="xv2j5c"
[ ] GET /inventory-locations lista ubicaciones tenant.
[ ] POST crea ubicación.
[ ] POST valida responsibleUserId con membership activo.
[ ] POST rechaza responsibleUserId tenantB.
[ ] PATCH actualiza responsibleUserId.
[ ] PATCH rechaza status directo.
[ ] archive requiere archiveReason.
[ ] ubicación archived no recibe movimientos.
```

---

## 20. API tests — Stock

```text id="fdxohp"
[ ] GET /inventory-stock requiere inventoryStock.read.
[ ] GET /inventory-stock filtra por itemId.
[ ] GET /inventory-stock filtra por storageLocationId.
[ ] GET /inventory-stock filtra por lowStockOnly.
[ ] GET /inventory-stock/{itemId} consolida por ubicaciones.
[ ] POST /inventory-stock/recalculate requiere permiso.
[ ] POST /recalculate rechaza itemId tenantB.
[ ] POST /recalculate rechaza storageLocationId tenantB.
[ ] POST /recalculate no acepta quantityOnHand.
[ ] POST /recalculate registra audit.
```

---

## 21. API tests — Movements

### 21.1. Create movement

```text id="b5bhe9"
[ ] POST /inventory-movements requiere permiso create.
[ ] POST crea movement draft.
[ ] POST genera movementNumber server-side.
[ ] POST deriva movementDirection.
[ ] POST calcula totalCostAmount.
[ ] POST rechaza totalCostAmount desde cliente.
[ ] POST rechaza movementNumber desde cliente.
[ ] POST rechaza status desde cliente.
[ ] POST rechaza postedBy desde cliente.
[ ] POST rechaza tenantId desde cliente.
[ ] POST valida item tenant-scoped.
[ ] POST valida location tenant-scoped.
[ ] POST valida target location si aplica.
[ ] POST valida quantity string decimal.
[ ] POST rechaza quantity number.
[ ] POST rechaza unitCostAmount number.
[ ] POST rechaza secureDocumentId tenantB.
[ ] POST rechaza supplierId tenantB.
```

---

### 21.2. Post movement

```text id="mtbuub"
[ ] POST /inventory-movements/{id}/post requiere permiso post.
[ ] Post movement draft cambia status a posted.
[ ] Post receipt incrementa stock.
[ ] Post issue disminuye stock.
[ ] Post issue con stock insuficiente devuelve 409.
[ ] Post movement cancelled devuelve 409.
[ ] Post movement posted devuelve 409.
[ ] Post genera audit.
[ ] Post genera alerta lowStock si aplica.
```

---

### 21.3. Cancel movement

```text id="igf3sm"
[ ] Cancel draft cambia status a cancelled.
[ ] Cancel requiere cancelReason.
[ ] Cancel posted devuelve 409.
[ ] Cancel no afecta stock.
[ ] Cancel audita evento.
```

---

### 21.4. Reverse movement

```text id="h8troe"
[ ] Reverse posted cambia estado/trazabilidad.
[ ] Reverse requiere reverseReason.
[ ] Reverse crea movimiento compensatorio si esa estrategia se usa.
[ ] Reverse actualiza stock correctamente.
[ ] Reverse draft devuelve 409.
[ ] Reverse cancelled devuelve 409.
[ ] Reverse dos veces devuelve 409.
[ ] Reverse no elimina movimiento original.
```

---

## 22. API tests — Adjustments

```text id="si31kt"
[ ] POST /inventory-adjustments crea draft.
[ ] POST requiere reason.
[ ] POST valida item tenant-scoped.
[ ] POST valida storageLocation tenant-scoped.
[ ] POST valida secureDocumentId tenant-scoped.
[ ] submit cambia draft -> submitted.
[ ] approve cambia submitted -> approved.
[ ] reject requiere rejectReason.
[ ] post approved crea InventoryMovement.
[ ] post adjustmentIncrease incrementa stock.
[ ] post adjustmentDecrease disminuye stock.
[ ] post adjustmentDecrease mayor a stock devuelve 409.
[ ] cancel requiere cancelReason.
[ ] tenantA no opera adjustment tenantB.
```

---

## 23. API tests — Transfers

```text id="w2ztv5"
[ ] POST /inventory-transfers crea draft.
[ ] POST rechaza source igual a target.
[ ] POST valida source tenant-scoped.
[ ] POST valida target tenant-scoped.
[ ] POST valida item tenant-scoped.
[ ] POST valida quantity string decimal.
[ ] post transfer valida stock disponible.
[ ] post transfer crea transferOut.
[ ] post transfer crea transferIn.
[ ] post transfer actualiza stock origen.
[ ] post transfer actualiza stock destino.
[ ] post transfer es transaccional.
[ ] cancel transfer draft requiere cancelReason.
[ ] reverse transfer posted requiere reverseReason.
[ ] tenantA no opera transfer tenantB.
```

---

## 24. API tests — Consumptions

```text id="aqr9jj"
[ ] POST /inventory-consumptions crea draft.
[ ] POST requiere maintenanceWorkOrderId.
[ ] POST valida maintenanceWorkOrder tenant-scoped.
[ ] POST rechaza maintenanceWorkOrder tenantB.
[ ] POST valida maintenanceTask pertenece a workOrder.
[ ] POST rechaza maintenanceTask de otra orden.
[ ] POST valida item active.
[ ] POST valida location active.
[ ] post consumption valida stock disponible.
[ ] post consumption crea movement maintenanceConsumption.
[ ] post consumption disminuye stock.
[ ] post consumption no modifica status de WorkOrder.
[ ] post consumption no crea MaintenanceCost.
[ ] post consumption no crea SupplierPayable.
[ ] cancel draft requiere cancelReason.
[ ] reverse posted requiere reverseReason.
[ ] GET /maintenance-work-orders/{workOrderId}/inventory-consumptions lista solo workOrder tenant.
```

---

## 25. API tests — Documents

```text id="mn6lzy"
[ ] POST /inventory-documents crea vínculo.
[ ] POST valida entityType.
[ ] POST valida entityId tenant-scoped.
[ ] POST valida secureDocumentId tenant-scoped.
[ ] POST rechaza secureDocumentId tenantB.
[ ] POST rechaza storageKey.
[ ] POST rechaza signedUrl.
[ ] POST rechaza base64.
[ ] GET document no devuelve storageKey.
[ ] GET document no devuelve signedUrl persistente.
[ ] archive document requiere archiveReason.
[ ] tenantA no lee document link tenantB.
```

---

## 26. API tests — Alerts

```text id="qf5abi"
[ ] GET /inventory-alerts lista alertas tenant.
[ ] GET filtra por status.
[ ] GET filtra por alertType.
[ ] acknowledge cambia open -> acknowledged.
[ ] acknowledge requiere permiso.
[ ] resolve cambia open/acknowledged -> resolved.
[ ] resolve requiere resolutionReason.
[ ] dismiss requiere dismissReason.
[ ] archive conserva histórico.
[ ] tenantA no opera alert tenantB.
```

---

## 27. API tests — Reports and exports

### 27.1. Stock report

```text id="xi06re"
[ ] GET /inventory-reports/stock requiere permiso.
[ ] Filtra por categoryId tenant-scoped.
[ ] Filtra por itemId tenant-scoped.
[ ] Filtra por storageLocationId tenant-scoped.
[ ] No mezcla datos tenantB.
[ ] Montos/cantidades se exponen como string decimal.
```

---

### 27.2. Movements report

```text id="bcr5bs"
[ ] GET /inventory-reports/movements requiere permiso.
[ ] Filtra por periodo.
[ ] Valida dateFrom <= dateTo.
[ ] Filtra por movementType.
[ ] Filtra por movementDirection.
[ ] Filtra por supplierId tenant-scoped.
[ ] Filtra por maintenanceWorkOrderId tenant-scoped.
```

---

### 27.3. Consumption report

```text id="dcphjh"
[ ] GET /inventory-reports/consumption requiere permiso.
[ ] Filtra por maintenanceWorkOrderId.
[ ] Filtra por maintenanceTaskId.
[ ] Filtra por itemId.
[ ] No devuelve consumos tenantB.
```

---

### 27.4. Low stock report

```text id="mq3c57"
[ ] GET /inventory-reports/low-stock lista ítems bajo mínimo.
[ ] Excluye ítems no activos salvo filtro explícito.
[ ] No mezcla tenants.
```

---

### 27.5. Valuation report

```text id="n10ma5"
[ ] GET /inventory-reports/valuation requiere permiso.
[ ] Calcula referenceValueAmount como string decimal.
[ ] Incluye valuationNature=referenceOnly.
[ ] No crea JournalEntry.
[ ] No modifica Accounting Ledger.
```

---

### 27.6. Export report

```text id="pfj68p"
[ ] GET /inventory-reports/export requiere permiso.
[ ] Valida reportType.
[ ] Valida format.
[ ] Valida filtros tenant-scoped.
[ ] Crea InventoryReportExport.
[ ] Crea SecureDocument.
[ ] Devuelve secureDocumentId.
[ ] No devuelve storageKey.
[ ] No devuelve signedUrl persistente.
[ ] Audita inventoryReport.exported.
```

---

## 28. Security tests — Auth and permissions

```text id="hjrziu"
[ ] Toda ruta inventory requiere Authorization Bearer.
[ ] Usuario no autenticado recibe 401.
[ ] Usuario autenticado sin permiso recibe 403.
[ ] Usuario con permiso correcto accede.
[ ] Resident no accede al módulo en MVP.
[ ] BoardMember sin permiso operativo no modifica inventario.
[ ] PlatformAdmin no accede automáticamente a tenant inventory.
[ ] PlatformAdmin requiere tenant context y permiso explícito.
```

---

## 29. Security tests — Forbidden fields

Todos los endpoints deben rechazar:

```text id="wi3t3u"
[ ] tenantId.
[ ] createdBy.
[ ] updatedBy.
[ ] postedBy.
[ ] submittedBy.
[ ] approvedBy.
[ ] rejectedBy.
[ ] cancelledBy.
[ ] reversedBy.
[ ] archivedBy.
[ ] requestedBy.
[ ] acknowledgedBy.
[ ] resolvedBy.
[ ] dismissedBy.
[ ] status directo fuera de endpoint de transición.
[ ] quantityOnHand.
[ ] quantityAvailable.
[ ] quantityReserved.
[ ] averageUnitCostAmount.
[ ] totalCostAmount.
[ ] movementNumber.
[ ] adjustmentNumber.
[ ] transferNumber.
[ ] consumptionNumber.
[ ] storageKey.
[ ] signedUrl.
[ ] base64.
[ ] rawFilePayload.
[ ] paymentOrderId.
[ ] supplierPaymentOrderId.
[ ] journalEntryId.
[ ] bankTransactionId.
[ ] reconciliationMatchId.
[ ] paymentInitiation.
[ ] bankTransferInstruction.
[ ] openBankingPaymentInitiation.
[ ] externalAiEnabled.
```

Respuesta esperada:

```http id="qi3mpw"
422 Unprocessable Entity
```

---

## 30. Security tests — Multitenancy

```text id="ik0hqi"
[ ] tenantA no lee category tenantB.
[ ] tenantA no actualiza category tenantB.
[ ] tenantA no archiva category tenantB.
[ ] tenantA no lee unit tenantB.
[ ] tenantA no usa unit tenantB en item.
[ ] tenantA no lee item tenantB.
[ ] tenantA no usa item tenantB en movement.
[ ] tenantA no lee location tenantB.
[ ] tenantA no usa location tenantB en movement.
[ ] tenantA no lee stock tenantB.
[ ] tenantA no recalcula stock tenantB.
[ ] tenantA no lee movement tenantB.
[ ] tenantA no postea movement tenantB.
[ ] tenantA no reversa movement tenantB.
[ ] tenantA no lee adjustment tenantB.
[ ] tenantA no aprueba adjustment tenantB.
[ ] tenantA no lee transfer tenantB.
[ ] tenantA no postea transfer tenantB.
[ ] tenantA no lee consumption tenantB.
[ ] tenantA no postea consumption tenantB.
[ ] tenantA no lee document tenantB.
[ ] tenantA no usa secureDocument tenantB.
[ ] tenantA no usa supplier tenantB.
[ ] tenantA no usa supplierPayable tenantB.
[ ] tenantA no usa maintenanceWorkOrder tenantB.
[ ] tenantA no usa maintenanceTask tenantB.
[ ] tenantA no lee alert tenantB.
[ ] tenantA no ve reports tenantB.
[ ] tenantA no exporta datos tenantB.
```

Respuesta para recursos cross-tenant:

```http id="a0gy8n"
404 Not Found
```

---

## 31. Security tests — No public, no /me, no WordPress

### 31.1. No `/me`

```text id="zar1hz"
[ ] GET /api/v1/me/inventory-items devuelve 404.
[ ] GET /api/v1/me/inventory-stock devuelve 404.
[ ] GET /api/v1/me/inventory-movements devuelve 404.
[ ] GET /api/v1/me/inventory-reports devuelve 404.
[ ] POST /api/v1/me/inventory-consumptions devuelve 404.
```

---

### 31.2. No public

```text id="we7ggz"
[ ] GET /api/v1/public/inventory-items devuelve 404.
[ ] GET /api/v1/public/inventory-stock devuelve 404.
[ ] GET /api/v1/public/inventory-movements devuelve 404.
[ ] GET /api/v1/public/inventory-reports devuelve 404.
[ ] GET /api/v1/public/tenants/{slug}/inventory-items devuelve 404.
[ ] GET /api/v1/public/tenants/{slug}/inventory-stock devuelve 404.
[ ] POST /api/v1/public/inventory-movements devuelve 404.
```

---

### 31.3. No WordPress public access

```text id="vlgwbp"
[ ] CORS no permite origen WordPress público para /tenant/inventory-*.
[ ] CORS no usa wildcard.
[ ] WordPress no puede consultar inventory-stock.
[ ] WordPress no puede consultar inventory-reports.
[ ] WordPress no puede crear movements.
```

---

## 32. Security tests — No payments, no accounting, no reconciliation

### 32.1. Payments

```text id="pte26q"
[ ] Crear receipt con supplierId no crea Payment.
[ ] Crear receipt con supplierPayableId no crea Payment.
[ ] Post movement no crea Payment.
[ ] Post consumption no crea Payment.
[ ] Post adjustment no crea Payment.
[ ] Post transfer no crea Payment.
[ ] Export report no crea Payment.
```

---

### 32.2. Supplier Payment Orders

```text id="dhlsas"
[ ] Inventory no llama createSupplierPaymentOrder.
[ ] Inventory no crea SupplierPaymentOrder.
[ ] Inventory no marca SupplierPaymentOrder como paid.
[ ] Inventory no modifica estado financiero de Supplier Payments.
```

---

### 32.3. Accounting Ledger

```text id="qtji5e"
[ ] Inventory no crea JournalEntry.
[ ] Inventory no crea JournalEntryLine.
[ ] Inventory no modifica AccountingPeriod.
[ ] Inventory no modifica AccountingBalanceSnapshot.
[ ] Valuation report no crea asiento contable.
```

---

### 32.4. Bank Reconciliation

```text id="zw6gem"
[ ] Inventory no crea BankTransaction.
[ ] Inventory no modifica BankTransaction.
[ ] Inventory no crea ReconciliationMatch.
[ ] Inventory no confirma conciliación.
[ ] Inventory no cierra ReconciliationSession.
```

---

## 33. Security tests — Document safety

```text id="jakodb"
[ ] API no acepta storageKey.
[ ] API no acepta signedUrl persistente.
[ ] API no acepta base64.
[ ] API no acepta raw file payload.
[ ] Response de document no incluye storageKey.
[ ] Response de document no incluye signedUrl persistente.
[ ] Response de export no incluye storageKey.
[ ] Audit no incluye storageKey.
[ ] Logs no incluyen storageKey.
[ ] secureDocumentId tenantB devuelve 404.
```

---

## 34. Security tests — External AI

```text id="nhflw6"
[ ] INVENTORY_EXTERNAL_AI_ENABLED=false por defecto.
[ ] Boot falla si INVENTORY_EXTERNAL_AI_ENABLED=true en MVP.
[ ] Ningún endpoint acepta externalAiEnabled.
[ ] Ningún servicio envía documentos reales a IA externa.
[ ] Ningún servicio envía stock real a IA externa.
[ ] Ningún servicio envía reportes reales a IA externa.
```

---

## 35. Audit tests

### 35.1. Eventos mínimos

```text id="prf3ay"
[ ] inventoryCategory.created.
[ ] inventoryCategory.updated.
[ ] inventoryCategory.archived.
[ ] inventoryUnit.created.
[ ] inventoryUnit.updated.
[ ] inventoryUnit.archived.
[ ] inventoryItem.created.
[ ] inventoryItem.updated.
[ ] inventoryItem.activated.
[ ] inventoryItem.deactivated.
[ ] inventoryItem.archived.
[ ] inventoryLocation.created.
[ ] inventoryLocation.updated.
[ ] inventoryLocation.archived.
[ ] inventoryMovement.created.
[ ] inventoryMovement.posted.
[ ] inventoryMovement.cancelled.
[ ] inventoryMovement.reversed.
[ ] inventoryMovement.archived.
[ ] inventoryAdjustment.created.
[ ] inventoryAdjustment.submitted.
[ ] inventoryAdjustment.approved.
[ ] inventoryAdjustment.rejected.
[ ] inventoryAdjustment.posted.
[ ] inventoryAdjustment.cancelled.
[ ] inventoryTransfer.created.
[ ] inventoryTransfer.posted.
[ ] inventoryTransfer.cancelled.
[ ] inventoryTransfer.reversed.
[ ] inventoryConsumption.created.
[ ] inventoryConsumption.posted.
[ ] inventoryConsumption.cancelled.
[ ] inventoryConsumption.reversed.
[ ] inventoryDocument.created.
[ ] inventoryDocument.downloaded.
[ ] inventoryDocument.archived.
[ ] inventoryAlert.created.
[ ] inventoryAlert.acknowledged.
[ ] inventoryAlert.resolved.
[ ] inventoryAlert.dismissed.
[ ] inventoryReport.generated.
[ ] inventoryReport.exported.
```

---

### 35.2. Audit metadata

```text id="ss3owi"
[ ] audit incluye tenantId.
[ ] audit incluye actorUserProfileId.
[ ] audit incluye action.
[ ] audit incluye resourceType.
[ ] audit incluye resourceId.
[ ] audit incluye outcome.
[ ] audit incluye traceId.
[ ] audit sanitiza metadata.
[ ] audit no incluye storageKey.
[ ] audit no incluye signedUrl.
[ ] audit no incluye base64.
[ ] audit no incluye raw file payload.
[ ] audit no incluye tokens.
[ ] audit no incluye secrets.
```

---

## 36. Observability tests

### 36.1. Logs

```text id="t6ecyt"
[ ] inventoryMovement.posted loggea action.
[ ] inventoryMovement.posted loggea outcome.
[ ] inventoryMovement.posted loggea durationMs.
[ ] inventoryMovement.posted loggea traceId.
[ ] inventoryReport.exported loggea reportType.
[ ] logs no contienen storageKey.
[ ] logs no contienen signedUrl.
[ ] logs no contienen base64.
[ ] logs no contienen raw payload.
[ ] logs no contienen stack trace productivo.
```

---

### 36.2. Metrics

```text id="l35yiw"
[ ] inventory_items_total se incrementa.
[ ] inventory_movements_total se incrementa.
[ ] inventory_receipts_total se incrementa.
[ ] inventory_issues_total se incrementa.
[ ] inventory_adjustments_total se incrementa.
[ ] inventory_transfers_total se incrementa.
[ ] inventory_consumptions_total se incrementa.
[ ] inventory_low_stock_alerts_total se incrementa.
[ ] inventory_report_exports_total se incrementa.
[ ] labels permitidos funcionan.
[ ] labels prohibidos no existen.
```

Labels prohibidos:

```text id="jbpqhk"
tenantId
itemId
locationId
movementId
userId
supplierId
maintenanceWorkOrderId
secureDocumentId
traceId
```

---

## 37. OpenAPI contract tests

```text id="vsgkil"
[ ] OpenAPI documenta todas las rutas /api/v1/tenant/inventory-*.
[ ] OpenAPI no documenta /api/v1/me/inventory-*.
[ ] OpenAPI no documenta /api/v1/public/inventory-*.
[ ] OpenAPI incluye x-tenant-scope=true.
[ ] OpenAPI incluye x-auth-required=true.
[ ] OpenAPI incluye x-inventory-basic=true.
[ ] OpenAPI incluye x-public-exposure=false.
[ ] Rutas de stock incluyen x-stock-controlled=true.
[ ] Rutas de documentos incluyen x-secure-document-storage=true.
[ ] Rutas de documentos incluyen x-storage-key-exposed=false.
[ ] Rutas con costos incluyen x-decimal-money=true.
[ ] Rutas de valorización incluyen x-reference-valuation-only=true.
[ ] Rutas con Supplier Payments incluyen x-payment-creation=false.
[ ] Rutas con Supplier Payments incluyen x-supplier-payment-order-created=false.
[ ] OpenAPI no documenta storageKey.
[ ] OpenAPI no documenta signedUrl persistente.
[ ] OpenAPI no documenta base64.
[ ] OpenAPI no documenta tenantId en DTOs externos.
[ ] OpenAPI no documenta actor fields en DTOs externos.
[ ] OpenAPI no documenta quantityOnHand editable.
[ ] OpenAPI no documenta totalCostAmount editable.
[ ] OpenAPI no documenta paymentOrderId.
[ ] OpenAPI no documenta journalEntryId.
[ ] OpenAPI no documenta bankTransactionId.
[ ] OpenAPI no documenta externalAiEnabled.
```

---

## 38. Performance tests

### 38.1. Dataset mínimo

```text id="y3sdyl"
tenantA:
- 200 categorías/unidades combinadas.
- 1,000 ítems.
- 20 ubicaciones.
- 10,000 movimientos.
- 2,000 saldos.
- 1,000 ajustes.
- 1,000 transferencias.
- 2,000 consumos.
- 500 alertas.
- 100 exports.

tenantB:
- dataset parcial para probar aislamiento.
```

---

### 38.2. Objetivos

```text id="taeb22"
[ ] Listar ítems paginados p95 < 800 ms.
[ ] Consultar stock paginado p95 < 1000 ms.
[ ] Listar movimientos paginados p95 < 1200 ms.
[ ] Reporte de stock p95 < 1500 ms.
[ ] Reporte de movimientos p95 < 2000 ms.
[ ] Reporte de bajo stock p95 < 1500 ms.
[ ] Exportación pequeña p95 < 3000 ms.
[ ] pageSize máximo 100.
[ ] No existe N+1 evidente.
```

---

## 39. Concurrency tests

### 39.1. Duplicados

```text id="nzbg6x"
[ ] Dos usuarios crean mismo categoryCode en tenantA: solo uno exitoso.
[ ] Dos usuarios crean mismo unitCode en tenantA: solo uno exitoso.
[ ] Dos usuarios crean mismo itemCode en tenantA: solo uno exitoso.
[ ] Dos usuarios crean mismo locationCode en tenantA: solo uno exitoso.
```

---

### 39.2. Stock

```text id="xmg67d"
[ ] Dos issues simultáneos no dejan stock negativo.
[ ] Dos consumptions simultáneos no dejan stock negativo.
[ ] Dos transfers simultáneos desde mismo origen no dejan stock negativo.
[ ] Dos adjustmentDecrease simultáneos no dejan stock negativo.
[ ] Post movement concurrente solo postea una vez.
[ ] Reverse movement concurrente solo reversa una vez.
[ ] Recalculate concurrente mantiene saldo consistente.
```

---

### 39.3. Transacciones

```text id="n9vjd8"
[ ] Transfer falla completa si falla transferIn.
[ ] Transfer falla completa si falla transferOut.
[ ] Adjustment post falla completo si falla movement.
[ ] Consumption post falla completo si falla movement.
[ ] Report export no deja export completed sin secureDocumentId.
```

---

## 40. Regression tests

```text id="ujsd6d"
[ ] Cambios en Supplier Payments no rompen validateSupplier mock.
[ ] Cambios en Maintenance Work Orders no rompen validateWorkOrder mock.
[ ] Cambios en Secure Document Storage no exponen storageKey.
[ ] Cambios en Accounting Ledger no introducen JournalEntry desde Inventory.
[ ] Cambios en API Gateway no exponen rutas públicas.
[ ] Cambios en WordPress Integration no habilitan inventory público.
[ ] Cambios en DTO validation no permiten tenantId.
[ ] Cambios en DTO validation no permiten actor fields.
[ ] Cambios en OpenAPI no documentan campos prohibidos.
```

---

## 41. Smoke flows

### 41.1. Smoke flow — catálogo y stock inicial

```text id="sfdks9"
[ ] TenantAdmin crea categoría PLUMBING.
[ ] TenantAdmin crea unidad UNIT.
[ ] InventoryManager crea ubicación MAIN_WAREHOUSE.
[ ] InventoryManager crea ítem PVC_VALVE_1_2.
[ ] InventoryManager activa ítem.
[ ] InventoryManager crea openingBalance.
[ ] InventoryManager postea openingBalance.
[ ] Sistema crea InventoryStockBalance.
[ ] Sistema muestra quantityOnHand correcto.
[ ] Sistema audita inventoryMovement.posted.
```

---

### 41.2. Smoke flow — entrada y salida

```text id="pazbhe"
[ ] InventoryManager crea receipt de 20 unidades.
[ ] Sistema calcula totalCostAmount.
[ ] InventoryManager postea receipt.
[ ] Stock incrementa.
[ ] InventoryManager crea issue de 5 unidades.
[ ] InventoryManager postea issue.
[ ] Stock disminuye.
[ ] Sistema no permite issue mayor al disponible.
[ ] Sistema audita ambos movimientos.
```

---

### 41.3. Smoke flow — ajuste

```text id="kkdc1f"
[ ] InventoryManager crea adjustment decrease con reason.
[ ] InventoryManager somete ajuste.
[ ] TenantAdmin aprueba ajuste.
[ ] InventoryManager postea ajuste.
[ ] Sistema crea movement adjustmentDecrease.
[ ] Stock disminuye.
[ ] Sistema audita adjustment y movement.
```

---

### 41.4. Smoke flow — transferencia

```text id="d6sgus"
[ ] InventoryManager crea ubicación PUMP_ROOM.
[ ] InventoryManager crea transferencia MAIN_WAREHOUSE -> PUMP_ROOM.
[ ] Sistema valida stock origen.
[ ] InventoryManager postea transferencia.
[ ] Sistema crea transferOut.
[ ] Sistema crea transferIn.
[ ] Stock origen disminuye.
[ ] Stock destino incrementa.
[ ] Sistema audita inventoryTransfer.posted.
```

---

### 41.5. Smoke flow — consumo de mantenimiento

```text id="pgdm9c"
[ ] MaintenanceManager crea work order.
[ ] InventoryManager crea consumption vinculado a workOrder.
[ ] Sistema valida workOrder.
[ ] Sistema valida task si existe.
[ ] Sistema valida stock disponible.
[ ] InventoryManager postea consumption.
[ ] Sistema crea movement maintenanceConsumption.
[ ] Stock disminuye.
[ ] WorkOrder no cambia de estado.
[ ] Sistema audita inventoryConsumption.posted.
```

---

### 41.6. Smoke flow — documentos

```text id="io15cr"
[ ] Secure Document Storage crea secureDocumentId.
[ ] InventoryManager crea inventoryDocument vinculado a movement.
[ ] Sistema valida secureDocumentId tenant-scoped.
[ ] Response incluye secureDocumentId.
[ ] Response no incluye storageKey.
[ ] Sistema audita inventoryDocument.created.
```

---

### 41.7. Smoke flow — alertas

```text id="o3976o"
[ ] Ítem tiene minimumStockQuantity = 10.
[ ] Issue deja quantityAvailable = 8.
[ ] Sistema crea lowStock alert.
[ ] InventoryManager lista alertas.
[ ] InventoryManager reconoce alerta.
[ ] Sistema audita inventoryAlert.acknowledged.
```

---

### 41.8. Smoke flow — reportes y exportación

```text id="vjw1pt"
[ ] TenantAdmin consulta stock report.
[ ] TenantAdmin consulta movements report.
[ ] FinancialManager consulta valuation report.
[ ] TenantAdmin exporta reporte xlsx.
[ ] Sistema crea InventoryReportExport.
[ ] Sistema crea SecureDocument.
[ ] Response incluye secureDocumentId.
[ ] Response no incluye storageKey.
[ ] Sistema audita inventoryReport.exported.
```

---

## 42. CI gates

El pipeline debe ejecutar:

```text id="endtoz"
[ ] unit tests.
[ ] integration tests.
[ ] API tests.
[ ] security tests.
[ ] multitenancy tests.
[ ] stock consistency tests.
[ ] concurrency tests críticos.
[ ] OpenAPI contract tests.
[ ] audit tests.
[ ] observability tests.
[ ] smoke tests mínimos.
```

---

## 43. CI security gates

El pipeline debe fallar si:

```text id="xrnayu"
[ ] Algún DTO acepta tenantId.
[ ] Algún DTO acepta actor fields.
[ ] Algún DTO acepta status directo fuera de transición.
[ ] Algún DTO acepta quantityOnHand.
[ ] Algún DTO acepta quantityAvailable.
[ ] Algún DTO acepta totalCostAmount.
[ ] Algún DTO acepta storageKey.
[ ] Algún DTO acepta signedUrl.
[ ] Algún DTO acepta base64.
[ ] Algún DTO acepta rawFilePayload.
[ ] Algún DTO acepta paymentOrderId.
[ ] Algún DTO acepta supplierPaymentOrderId.
[ ] Algún DTO acepta journalEntryId.
[ ] Algún DTO acepta bankTransactionId.
[ ] Algún DTO acepta reconciliationMatchId.
[ ] Algún DTO acepta externalAiEnabled.
[ ] API permite item cross-tenant.
[ ] API permite location cross-tenant.
[ ] API permite movement cross-tenant.
[ ] API permite stock cross-tenant.
[ ] API permite adjustment cross-tenant.
[ ] API permite transfer cross-tenant.
[ ] API permite consumption cross-tenant.
[ ] API permite secureDocument cross-tenant.
[ ] API permite supplier cross-tenant.
[ ] API permite maintenanceWorkOrder cross-tenant.
[ ] API permite salida mayor a stock disponible.
[ ] API permite transferencia a la misma ubicación.
[ ] API permite editar movement posted destructivamente.
[ ] API crea Payment.
[ ] API crea SupplierPaymentOrder.
[ ] API marca paid.
[ ] API crea JournalEntry.
[ ] API confirma Bank Reconciliation.
[ ] API documenta endpoints /me.
[ ] API documenta endpoints públicos.
[ ] API expone storageKey.
[ ] Logs contienen storageKey.
[ ] Audit contiene storageKey.
[ ] INVENTORY_PUBLIC_ENDPOINTS_ENABLED=true.
[ ] INVENTORY_ME_ENDPOINTS_ENABLED=true.
[ ] INVENTORY_WORDPRESS_ACCESS_ENABLED=true.
[ ] INVENTORY_DIRECT_PAYMENTS_ENABLED=true.
[ ] INVENTORY_SUPPLIER_PAYMENT_ORDER_CREATION_ENABLED=true.
[ ] INVENTORY_DIRECT_ACCOUNTING_ENABLED=true.
[ ] INVENTORY_EXTERNAL_AI_ENABLED=true.
```

---

## 44. Cobertura mínima

```text id="xwqxro"
- Domain value objects: >= 95%.
- Domain entities: >= 90%.
- Policies: >= 95%.
- Stock engine: >= 95%.
- API controllers: >= 85%.
- Application services: >= 90%.
- Repository integration: >= 85%.
- Security tests críticos: 100% passing.
- Multitenancy tests críticos: 100% passing.
- OpenAPI contract tests críticos: 100% passing.
```

---

## 45. Matriz de trazabilidad

| Área                    | Spec | Plan | Data Model | API Contract | Tests                                  |
| ----------------------- | ---- | ---- | ---------- | ------------ | -------------------------------------- |
| Categorías              | Sí   | Sí   | Sí         | Sí           | Unit / API / MT                        |
| Unidades                | Sí   | Sí   | Sí         | Sí           | Unit / API / MT                        |
| Ítems                   | Sí   | Sí   | Sí         | Sí           | Unit / API / MT                        |
| Ubicaciones             | Sí   | Sí   | Sí         | Sí           | Unit / API / MT                        |
| Stock balances          | Sí   | Sí   | Sí         | Sí           | Integration / API / Consistency        |
| Movimientos             | Sí   | Sí   | Sí         | Sí           | Unit / Integration / API / Concurrency |
| Ajustes                 | Sí   | Sí   | Sí         | Sí           | Unit / Integration / API               |
| Transferencias          | Sí   | Sí   | Sí         | Sí           | Integration / API / Concurrency        |
| Consumos                | Sí   | Sí   | Sí         | Sí           | Integration / API / Boundary           |
| SDS                     | Sí   | Sí   | Sí         | Sí           | Integration / Security                 |
| Supplier Payments       | Sí   | Sí   | Sí         | Sí           | Boundary / Security                    |
| Maintenance Work Orders | Sí   | Sí   | Sí         | Sí           | Boundary / API                         |
| Reportes                | Sí   | Sí   | Sí         | Sí           | API / Performance                      |
| Exportaciones           | Sí   | Sí   | Sí         | Sí           | Integration / Security                 |
| Auditoría               | Sí   | Sí   | Sí         | Sí           | Audit tests                            |
| Observabilidad          | Sí   | Sí   | Sí         | Sí           | Logs / Metrics                         |
| Seguridad               | Sí   | Sí   | Sí         | Sí           | Security gates                         |
| OpenAPI                 | Sí   | Sí   | Sí         | Sí           | Contract tests                         |

---

## 46. Definition of Done de pruebas

```text id="r32v1u"
[ ] Tests unitarios implementados.
[ ] Tests de entidades implementados.
[ ] Tests de state machines implementados.
[ ] Tests de policies implementados.
[ ] Tests de repositorios implementados.
[ ] Tests de stock engine implementados.
[ ] Tests de movement posting implementados.
[ ] Tests de reversal implementados.
[ ] Tests de recalculation implementados.
[ ] Tests de adjustments implementados.
[ ] Tests de transfers implementados.
[ ] Tests de consumptions implementados.
[ ] Tests de SDS integration implementados.
[ ] Tests de Supplier Payments boundary implementados.
[ ] Tests de Maintenance Work Orders boundary implementados.
[ ] Tests API implementados.
[ ] Tests authz implementados.
[ ] Tests multitenancy implementados.
[ ] Tests forbidden fields implementados.
[ ] Tests no public implementados.
[ ] Tests no /me implementados.
[ ] Tests no WordPress implementados.
[ ] Tests no payments implementados.
[ ] Tests no accounting implementados.
[ ] Tests no reconciliation implementados.
[ ] Tests no external AI implementados.
[ ] Tests audit implementados.
[ ] Tests observability implementados.
[ ] Tests OpenAPI implementados.
[ ] Tests performance básicos implementados.
[ ] Tests concurrency críticos implementados.
[ ] Smoke flows implementados.
[ ] CI gates implementados.
[ ] CI completo pasa.
```

---

## 47. No aceptación del test plan

No se acepta el módulo si las pruebas permiten:

```text id="uehut5"
- item cross-tenant;
- location cross-tenant;
- movement cross-tenant;
- stock cross-tenant;
- adjustment cross-tenant;
- transfer cross-tenant;
- consumption cross-tenant;
- secureDocument cross-tenant;
- supplier cross-tenant;
- maintenanceWorkOrder cross-tenant;
- tenantId desde cliente;
- actor fields desde cliente;
- status directo fuera de transición;
- quantityOnHand desde cliente;
- quantityAvailable desde cliente;
- totalCostAmount desde cliente;
- storageKey en request o response;
- signedUrl persistente en response;
- base64 en JSON;
- float/number como cantidad o costo;
- salida mayor al stock disponible;
- consumo mayor al stock disponible;
- transferencia mayor al stock disponible;
- transferencia a la misma ubicación;
- movement posted editable destructivamente;
- Payment creado desde Inventory;
- SupplierPaymentOrder creado desde Inventory;
- JournalEntry creado desde Inventory;
- Bank Reconciliation confirmado desde Inventory;
- endpoint público de inventario;
- endpoint /me de inventario;
- acceso desde WordPress público;
- IA externa con datos reales;
- audit crítica ausente;
- logs con datos prohibidos.
```

---

## 48. Resultado esperado

Al completar este plan de pruebas, el módulo `023-inventory-basic` tendrá una cobertura suficiente para validar seguridad, consistencia de stock, multitenancy, auditoría, integraciones controladas y límites de dominio.

Resultado esperado:

```text id="hcm2at"
unit tests definidos
entity tests definidos
state machine tests definidos
policy tests definidos
repository tests definidos
stock engine tests definidos
movement posting tests definidos
movement reversal tests definidos
stock recalculation tests definidos
adjustment tests definidos
transfer tests definidos
consumption tests definidos
SDS integration tests definidos
Supplier Payments boundary tests definidos
Maintenance Work Orders boundary tests definidos
API tests definidos
authz tests definidos
multitenancy tests definidos
security tests definidos
audit tests definidos
observability tests definidos
OpenAPI contract tests definidos
performance tests definidos
concurrency tests definidos
smoke flows definidos
CI gates definidos
no public endpoints verificado
no /me endpoints verificado
no WordPress access verificado
no direct payments verificado
no SupplierPaymentOrder verificado
no direct accounting verificado
no Bank Reconciliation verificado
no external AI verificado
```

---

## 49. Expediente actualizado

```text id="smk3ry"
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
│   │       └── test-plan.md
```
