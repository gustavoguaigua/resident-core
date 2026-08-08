# API Contract — 023 Inventory Basic

## 1. Información del documento

| Campo           | Valor                                                                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                 |
| Spec ID         | 023                                                                                                                                           |
| Módulo          | Inventory Basic                                                                                                                               |
| Documento       | API Contract                                                                                                                                  |
| Ruta            | `docs/specs/023-inventory-basic/api-contract.md`                                                                                              |
| Versión         | 0.1                                                                                                                                           |
| Estado          | Borrador inicial                                                                                                                              |
| Fecha           | 2026-07-24                                                                                                                                    |
| Documento base  | `docs/specs/023-inventory-basic/spec.md`                                                                                                      |
| Plan técnico    | `docs/specs/023-inventory-basic/plan.md`                                                                                                      |
| Modelo de datos | `docs/specs/023-inventory-basic/data-model.md`                                                                                                |
| API Style       | REST                                                                                                                                          |
| Base path       | `/api/v1`                                                                                                                                     |
| Formato         | JSON                                                                                                                                          |
| Autenticación   | Bearer Token / Keycloak OIDC                                                                                                                  |
| Autorización    | RESIDENT Core tenant-aware permissions                                                                                                        |
| Naturaleza      | Tenant-scoped / Operational / Stock-controlled / Movement-driven / Maintenance-aware / Supplier-aware / Cost-aware / Audit-heavy / Non-public |

---

## 2. Propósito

Este documento define el contrato API del módulo `023-inventory-basic`.

El contrato cubre endpoints, convenciones, DTOs, responses, errores, permisos, reglas de validación, límites de seguridad, extensiones OpenAPI e integraciones para controlar inventario básico por tenant.

Regla central del contrato:

```text id="jsm9od"
Toda API de Inventory Basic debe ser autenticada, tenant-scoped, permission-based, movement-driven, Decimal-safe, audit-heavy, no pública, sin endpoints /me en MVP, sin acceso desde WordPress público, sin storageKey expuesto, sin pagos directos, sin creación de SupplierPaymentOrder, sin iniciación bancaria, sin contabilidad directa, sin conciliación bancaria y sin IA externa con datos reales.
```

---

## 3. Convenciones generales

### 3.1. Base URL

```text id="l7t4np"
/api/v1
```

---

### 3.2. Superficie permitida

Solo se permite API tenant administrativa:

```text id="x0mdbm"
/api/v1/tenant/inventory-*
```

---

### 3.3. Superficies prohibidas

No se implementan en MVP:

```text id="qf539q"
/api/v1/me/inventory-*
/api/v1/public/inventory-*
/api/v1/public/tenants/{slug}/inventory-*
```

Respuesta esperada:

```http id="x05co1"
404 Not Found
```

---

### 3.4. Content-Type

```http id="rx5zks"
Content-Type: application/json
Accept: application/json
```

---

### 3.5. Fechas

Todas las fechas se exponen en ISO 8601 UTC.

Ejemplo:

```json id="s2446h"
{
  "createdAt": "2026-07-24T16:30:00.000Z"
}
```

---

### 3.6. Cantidades

Las cantidades se exponen como string decimal.

Ejemplo:

```json id="on6e6w"
{
  "quantity": "10.5000"
}
```

Prohibido como fuente de verdad:

```json id="j88fb7"
{
  "quantity": 10.5
}
```

---

### 3.7. Montos

Los montos se exponen como string decimal.

Ejemplo:

```json id="b2ngkd"
{
  "unitCostAmount": "2.35",
  "totalCostAmount": "23.50",
  "currency": "USD"
}
```

Prohibido:

```json id="cduvnp"
{
  "unitCostAmount": 2.35
}
```

---

### 3.8. Moneda

MVP:

```text id="pdlxbj"
USD
```

---

### 3.9. Nombres de campos

API JSON:

```text id="k2sm2s"
camelCase
```

Base de datos:

```text id="j9w93n"
snake_case
```

---

## 4. Autenticación

Todos los endpoints requieren:

```http id="v4c58z"
Authorization: Bearer <access_token>
```

Reglas:

```text id="dtivhp"
- Keycloak autentica.
- RESIDENT Core resuelve UserProfile.
- RESIDENT Core resuelve TenantMembership.
- RESIDENT Core resuelve tenant context.
- Inventory Basic valida permisos y reglas de recurso.
```

Prohibido:

```text id="y0z0gq"
- API anónima.
- API key pública.
- token enviado en query string.
- autenticación delegada a WordPress.
- userId enviado por cliente como actor.
```

---

## 5. Tenant context

El tenant se resuelve por contexto autenticado y membresía activa.

No se acepta `tenantId` en body, query o path para operaciones tenant ordinarias.

Prohibido:

```json id="dvjftz"
{
  "tenantId": "7b0a33a8-69fc-4d99-bb6b-25aa9ab3f54d"
}
```

Respuesta esperada:

```http id="vj8l5h"
422 Unprocessable Entity
```

o según convención global:

```http id="c4vjyl"
400 Bad Request
```

---

## 6. Response envelope

### 6.1. Respuesta simple

```json id="km59al"
{
  "data": {
    "id": "uuid"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

### 6.2. Respuesta paginada

```json id="rloyk7"
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 100,
    "traceId": "trace-id"
  }
}
```

---

### 6.3. Error estándar

```json id="jfap5n"
{
  "error": {
    "code": "INVENTORY_ITEM_NOT_FOUND",
    "message": "Inventory item not found.",
    "details": {},
    "traceId": "trace-id"
  }
}
```

---

## 7. Paginación, filtros y ordenamiento

### 7.1. Parámetros estándar

```text id="u10bs6"
page
pageSize
sortBy
sortDirection
```

Reglas:

```text id="marcup"
- page inicia en 1.
- pageSize default = 25.
- pageSize máximo = 100.
- sortDirection = asc | desc.
- sortBy debe pertenecer a whitelist por endpoint.
```

---

### 7.2. Filtros de fecha

```text id="ctd3ld"
dateFrom
dateTo
```

Regla:

```text id="n0yiiz"
dateFrom <= dateTo
```

---

### 7.3. Filtros por ID

Todo filtro por ID debe validarse como UUID y tenant-scoped cuando aplique.

Ejemplos:

```text id="j0kjj0"
categoryId
unitId
itemId
storageLocationId
movementId
supplierId
maintenanceWorkOrderId
secureDocumentId
```

---

## 8. Idempotencia

Para operaciones críticas se recomienda aceptar:

```http id="gu8rio"
Idempotency-Key: <unique-key>
```

Endpoints recomendados para idempotencia:

```text id="o7xamk"
POST /api/v1/tenant/inventory-movements/{movementId}/post
POST /api/v1/tenant/inventory-movements/{movementId}/reverse
POST /api/v1/tenant/inventory-adjustments/{adjustmentId}/post
POST /api/v1/tenant/inventory-transfers/{transferId}/post
POST /api/v1/tenant/inventory-consumptions/{consumptionId}/post
GET  /api/v1/tenant/inventory-reports/export
```

MVP puede iniciar sin tabla de idempotencia propia si las transacciones, state machines e índices únicos garantizan consistencia.

---

## 9. Permisos

### 9.1. Categorías

```text id="j9sx6o"
inventoryCategories.create
inventoryCategories.read
inventoryCategories.update
inventoryCategories.archive
```

---

### 9.2. Unidades

```text id="awm040"
inventoryUnits.create
inventoryUnits.read
inventoryUnits.update
inventoryUnits.archive
```

---

### 9.3. Ítems

```text id="gmmi19"
inventoryItems.create
inventoryItems.read
inventoryItems.update
inventoryItems.activate
inventoryItems.deactivate
inventoryItems.archive
```

---

### 9.4. Ubicaciones

```text id="b9n1h0"
inventoryLocations.create
inventoryLocations.read
inventoryLocations.update
inventoryLocations.archive
```

---

### 9.5. Stock y movimientos

```text id="odnzfx"
inventoryStock.read
inventoryStock.recalculate

inventoryMovements.create
inventoryMovements.read
inventoryMovements.post
inventoryMovements.cancel
inventoryMovements.reverse
inventoryMovements.archive
```

---

### 9.6. Ajustes

```text id="oz9z7j"
inventoryAdjustments.create
inventoryAdjustments.read
inventoryAdjustments.submit
inventoryAdjustments.approve
inventoryAdjustments.reject
inventoryAdjustments.post
inventoryAdjustments.cancel
inventoryAdjustments.archive
```

---

### 9.7. Transferencias

```text id="aw6npg"
inventoryTransfers.create
inventoryTransfers.read
inventoryTransfers.post
inventoryTransfers.cancel
inventoryTransfers.reverse
inventoryTransfers.archive
```

---

### 9.8. Consumos

```text id="ek4m2b"
inventoryConsumptions.create
inventoryConsumptions.read
inventoryConsumptions.post
inventoryConsumptions.cancel
inventoryConsumptions.reverse
inventoryConsumptions.archive
inventoryConsumptions.byWorkOrder.read
```

---

### 9.9. Documentos, alertas y reportes

```text id="n12l5c"
inventoryDocuments.create
inventoryDocuments.read
inventoryDocuments.archive
inventoryDocuments.download

inventoryAlerts.read
inventoryAlerts.acknowledge
inventoryAlerts.resolve
inventoryAlerts.dismiss
inventoryAlerts.archive

inventoryReports.stock
inventoryReports.movements
inventoryReports.consumption
inventoryReports.lowStock
inventoryReports.valuation
inventoryReports.export
```

---

# 10. Endpoints — Categories

## 10.1. List categories

```http id="y8bsx7"
GET /api/v1/tenant/inventory-categories
```

Permiso:

```text id="ggox4u"
inventoryCategories.read
```

Query params:

```text id="g0eo0a"
status
search
page
pageSize
sortBy
sortDirection
```

Response:

```json id="smwfyk"
{
  "data": [
    {
      "id": "uuid",
      "categoryCode": "PLUMBING",
      "categoryName": "Plomería",
      "description": "Materiales y repuestos de plomería",
      "status": "active",
      "createdAt": "2026-07-24T16:30:00.000Z",
      "updatedAt": "2026-07-24T16:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 1,
    "traceId": "trace-id"
  }
}
```

---

## 10.2. Create category

```http id="x3w3mu"
POST /api/v1/tenant/inventory-categories
```

Permiso:

```text id="m6c1uk"
inventoryCategories.create
```

Request:

```json id="ijeg5p"
{
  "categoryCode": "PLUMBING",
  "categoryName": "Plomería",
  "description": "Materiales y repuestos de plomería"
}
```

Response:

```http id="p20tvj"
201 Created
```

```json id="o6dwxd"
{
  "data": {
    "id": "uuid",
    "categoryCode": "PLUMBING",
    "categoryName": "Plomería",
    "description": "Materiales y repuestos de plomería",
    "status": "active",
    "createdAt": "2026-07-24T16:30:00.000Z",
    "updatedAt": "2026-07-24T16:30:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Errores:

```text id="klfody"
INVENTORY_CATEGORY_DUPLICATE_CODE
VALIDATION_ERROR
```

---

## 10.3. Get category

```http id="ysbyai"
GET /api/v1/tenant/inventory-categories/{categoryId}
```

Permiso:

```text id="as02ci"
inventoryCategories.read
```

Response:

```json id="k2am50"
{
  "data": {
    "id": "uuid",
    "categoryCode": "PLUMBING",
    "categoryName": "Plomería",
    "description": "Materiales y repuestos de plomería",
    "status": "active",
    "createdAt": "2026-07-24T16:30:00.000Z",
    "updatedAt": "2026-07-24T16:30:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 10.4. Update category

```http id="swcpqz"
PATCH /api/v1/tenant/inventory-categories/{categoryId}
```

Permiso:

```text id="w52t0i"
inventoryCategories.update
```

Request:

```json id="j1zt93"
{
  "categoryName": "Plomería y sanitarios",
  "description": "Repuestos, accesorios y materiales de plomería"
}
```

Prohibido:

```json id="hwonfd"
{
  "status": "archived",
  "tenantId": "uuid"
}
```

---

## 10.5. Archive category

```http id="gvyakj"
POST /api/v1/tenant/inventory-categories/{categoryId}/archive
```

Permiso:

```text id="zs0lno"
inventoryCategories.archive
```

Request:

```json id="xa7ph7"
{
  "archiveReason": "Categoría reemplazada por clasificación más específica."
}
```

Response:

```json id="m175ay"
{
  "data": {
    "id": "uuid",
    "status": "archived",
    "archivedAt": "2026-07-24T16:30:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

# 11. Endpoints — Units of measure

## 11.1. List units

```http id="fk9iul"
GET /api/v1/tenant/inventory-units
```

Permiso:

```text id="inr42x"
inventoryUnits.read
```

Query params:

```text id="bjqll3"
status
allowsDecimals
search
page
pageSize
sortBy
sortDirection
```

---

## 11.2. Create unit

```http id="etfysb"
POST /api/v1/tenant/inventory-units
```

Permiso:

```text id="wla27b"
inventoryUnits.create
```

Request:

```json id="m1ckxn"
{
  "unitCode": "UNIT",
  "unitName": "Unidad",
  "unitSymbol": "und",
  "allowsDecimals": false,
  "decimalPrecision": 0
}
```

Request con decimales:

```json id="s1kerf"
{
  "unitCode": "LITER",
  "unitName": "Litro",
  "unitSymbol": "L",
  "allowsDecimals": true,
  "decimalPrecision": 4
}
```

Reglas:

```text id="aqx7mg"
- decimalPrecision entre 0 y 4.
- si allowsDecimals=false, decimalPrecision debe ser 0.
- unitCode único por tenant.
```

---

## 11.3. Get unit

```http id="thlxfl"
GET /api/v1/tenant/inventory-units/{unitId}
```

Permiso:

```text id="r8bamh"
inventoryUnits.read
```

---

## 11.4. Update unit

```http id="dis2is"
PATCH /api/v1/tenant/inventory-units/{unitId}
```

Permiso:

```text id="lr4mv1"
inventoryUnits.update
```

Request:

```json id="goixhm"
{
  "unitName": "Unidad",
  "unitSymbol": "u"
}
```

---

## 11.5. Archive unit

```http id="zmtxqb"
POST /api/v1/tenant/inventory-units/{unitId}/archive
```

Permiso:

```text id="alzk9w"
inventoryUnits.archive
```

Request:

```json id="oorpqj"
{
  "archiveReason": "Unidad duplicada."
}
```

---

# 12. Endpoints — Items

## 12.1. List items

```http id="l7refl"
GET /api/v1/tenant/inventory-items
```

Permiso:

```text id="v9rf6g"
inventoryItems.read
```

Query params:

```text id="gb81sw"
status
itemType
stockTrackingMode
categoryId
unitId
storageLocationId
preferredSupplierId
lowStockOnly
search
page
pageSize
sortBy
sortDirection
```

Response:

```json id="nsskzg"
{
  "data": [
    {
      "id": "uuid",
      "itemCode": "PVC_VALVE_1_2",
      "itemName": "Válvula PVC 1/2",
      "categoryId": "uuid",
      "categoryName": "Plomería",
      "unitId": "uuid",
      "unitName": "Unidad",
      "itemType": "sparePart",
      "stockTrackingMode": "quantityAndCost",
      "minimumStockQuantity": "5.0000",
      "reorderPointQuantity": "10.0000",
      "referenceUnitCostAmount": "2.50",
      "currency": "USD",
      "status": "active"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 1,
    "traceId": "trace-id"
  }
}
```

---

## 12.2. Create item

```http id="vygu3u"
POST /api/v1/tenant/inventory-items
```

Permiso:

```text id="hhpgco"
inventoryItems.create
```

Request:

```json id="rslmk4"
{
  "itemCode": "PVC_VALVE_1_2",
  "itemName": "Válvula PVC 1/2",
  "description": "Repuesto para mantenimiento de tuberías",
  "categoryId": "uuid",
  "unitId": "uuid",
  "itemType": "sparePart",
  "stockTrackingMode": "quantityAndCost",
  "defaultStorageLocationId": "uuid",
  "minimumStockQuantity": "5.0000",
  "reorderPointQuantity": "10.0000",
  "referenceUnitCostAmount": "2.50",
  "currency": "USD",
  "preferredSupplierId": "uuid"
}
```

Reglas:

```text id="yffxjx"
- categoryId tenant-scoped.
- unitId tenant-scoped.
- defaultStorageLocationId tenant-scoped si existe.
- preferredSupplierId validado contra Supplier Payments si existe.
- minimumStockQuantity >= 0.
- reorderPointQuantity >= 0.
- referenceUnitCostAmount >= 0.
- currency = USD.
- itemCode único por tenant.
```

Response:

```http id="rtgs3n"
201 Created
```

---

## 12.3. Get item

```http id="o5k2av"
GET /api/v1/tenant/inventory-items/{itemId}
```

Permiso:

```text id="u8gemi"
inventoryItems.read
```

Response:

```json id="i5ikfj"
{
  "data": {
    "id": "uuid",
    "itemCode": "PVC_VALVE_1_2",
    "itemName": "Válvula PVC 1/2",
    "description": "Repuesto para mantenimiento de tuberías",
    "categoryId": "uuid",
    "unitId": "uuid",
    "itemType": "sparePart",
    "stockTrackingMode": "quantityAndCost",
    "defaultStorageLocationId": "uuid",
    "minimumStockQuantity": "5.0000",
    "reorderPointQuantity": "10.0000",
    "referenceUnitCostAmount": "2.50",
    "currency": "USD",
    "preferredSupplierId": "uuid",
    "status": "active",
    "createdAt": "2026-07-24T16:30:00.000Z",
    "updatedAt": "2026-07-24T16:30:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 12.4. Update item

```http id="gqeq0y"
PATCH /api/v1/tenant/inventory-items/{itemId}
```

Permiso:

```text id="aq4l47"
inventoryItems.update
```

Request:

```json id="mdlit9"
{
  "itemName": "Válvula PVC 1/2 reforzada",
  "minimumStockQuantity": "8.0000",
  "reorderPointQuantity": "12.0000",
  "referenceUnitCostAmount": "2.75"
}
```

Prohibido:

```json id="fcalvo"
{
  "quantityOnHand": "100.0000",
  "quantityAvailable": "100.0000",
  "status": "active",
  "tenantId": "uuid"
}
```

---

## 12.5. Activate item

```http id="q701kk"
POST /api/v1/tenant/inventory-items/{itemId}/activate
```

Permiso:

```text id="gk8jp7"
inventoryItems.activate
```

Request:

```json id="yxyyvb"
{
  "reason": "Ítem validado para uso operativo."
}
```

---

## 12.6. Deactivate item

```http id="uarrbi"
POST /api/v1/tenant/inventory-items/{itemId}/deactivate
```

Permiso:

```text id="esqulz"
inventoryItems.deactivate
```

Request:

```json id="io1bz6"
{
  "reason": "Ítem temporalmente fuera de uso."
}
```

---

## 12.7. Archive item

```http id="kbo0en"
POST /api/v1/tenant/inventory-items/{itemId}/archive
```

Permiso:

```text id="e5gmyn"
inventoryItems.archive
```

Request:

```json id="tz59wl"
{
  "archiveReason": "Ítem descontinuado."
}
```

---

# 13. Endpoints — Storage locations

## 13.1. List locations

```http id="uul9y4"
GET /api/v1/tenant/inventory-locations
```

Permiso:

```text id="vqbleh"
inventoryLocations.read
```

Query params:

```text id="dpaon0"
status
locationType
responsibleUserId
search
page
pageSize
sortBy
sortDirection
```

---

## 13.2. Create location

```http id="y66szm"
POST /api/v1/tenant/inventory-locations
```

Permiso:

```text id="dk1oot"
inventoryLocations.create
```

Request:

```json id="cs4t3y"
{
  "locationCode": "MAIN_WAREHOUSE",
  "locationName": "Bodega principal",
  "description": "Bodega de administración",
  "locationType": "warehouse",
  "responsibleUserId": "uuid"
}
```

Reglas:

```text id="nm7xcf"
- locationCode único por tenant.
- responsibleUserId debe tener membership activo en tenant.
```

---

## 13.3. Get location

```http id="fvm602"
GET /api/v1/tenant/inventory-locations/{locationId}
```

Permiso:

```text id="l6ygqu"
inventoryLocations.read
```

---

## 13.4. Update location

```http id="xj20xc"
PATCH /api/v1/tenant/inventory-locations/{locationId}
```

Permiso:

```text id="h4kd8e"
inventoryLocations.update
```

Request:

```json id="dg7ynw"
{
  "locationName": "Bodega principal administrativa",
  "responsibleUserId": "uuid"
}
```

---

## 13.5. Archive location

```http id="t2jqym"
POST /api/v1/tenant/inventory-locations/{locationId}/archive
```

Permiso:

```text id="kusdvj"
inventoryLocations.archive
```

Request:

```json id="jck9ht"
{
  "archiveReason": "Ubicación ya no existe físicamente."
}
```

---

# 14. Endpoints — Stock

## 14.1. List stock balances

```http id="gc681u"
GET /api/v1/tenant/inventory-stock
```

Permiso:

```text id="ni3x4e"
inventoryStock.read
```

Query params:

```text id="fg71se"
itemId
categoryId
storageLocationId
itemType
lowStockOnly
outOfStockOnly
page
pageSize
sortBy
sortDirection
```

Response:

```json id="y9l1ea"
{
  "data": [
    {
      "itemId": "uuid",
      "itemCode": "PVC_VALVE_1_2",
      "itemName": "Válvula PVC 1/2",
      "categoryId": "uuid",
      "categoryName": "Plomería",
      "unitId": "uuid",
      "unitSymbol": "und",
      "storageLocationId": "uuid",
      "storageLocationName": "Bodega principal",
      "quantityOnHand": "25.0000",
      "quantityReserved": "0.0000",
      "quantityAvailable": "25.0000",
      "averageUnitCostAmount": "2.45",
      "currency": "USD",
      "lastMovementAt": "2026-07-24T16:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 1,
    "traceId": "trace-id"
  }
}
```

---

## 14.2. Get stock by item

```http id="sw0uza"
GET /api/v1/tenant/inventory-stock/{itemId}
```

Permiso:

```text id="qf438p"
inventoryStock.read
```

Response:

```json id="ylif1e"
{
  "data": {
    "itemId": "uuid",
    "itemCode": "PVC_VALVE_1_2",
    "itemName": "Válvula PVC 1/2",
    "totalQuantityOnHand": "25.0000",
    "totalQuantityReserved": "0.0000",
    "totalQuantityAvailable": "25.0000",
    "currency": "USD",
    "locations": [
      {
        "storageLocationId": "uuid",
        "storageLocationName": "Bodega principal",
        "quantityOnHand": "25.0000",
        "quantityReserved": "0.0000",
        "quantityAvailable": "25.0000",
        "averageUnitCostAmount": "2.45"
      }
    ]
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 14.3. Recalculate stock

```http id="y8h6fd"
POST /api/v1/tenant/inventory-stock/recalculate
```

Permiso:

```text id="ar8gaz"
inventoryStock.recalculate
```

Request:

```json id="yr0s0e"
{
  "itemId": "uuid",
  "storageLocationId": "uuid",
  "reason": "Reconciliación operativa de stock desde movimientos."
}
```

Reglas:

```text id="kkqw4g"
- itemId opcional.
- storageLocationId opcional.
- ambos deben ser tenant-scoped si se informan.
- operación auditable.
- no acepta quantityOnHand desde cliente.
```

Response:

```json id="zeygga"
{
  "data": {
    "recalculated": true,
    "itemId": "uuid",
    "storageLocationId": "uuid",
    "affectedBalances": 1
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

# 15. Endpoints — Movements

## 15.1. List movements

```http id="na2205"
GET /api/v1/tenant/inventory-movements
```

Permiso:

```text id="aelofw"
inventoryMovements.read
```

Query params:

```text id="y66dsb"
movementType
movementDirection
status
itemId
storageLocationId
targetStorageLocationId
supplierId
supplierPayableId
maintenanceWorkOrderId
maintenanceTaskId
referenceType
referenceId
dateFrom
dateTo
page
pageSize
sortBy
sortDirection
```

---

## 15.2. Create movement

```http id="ksp533"
POST /api/v1/tenant/inventory-movements
```

Permiso:

```text id="xhx5pm"
inventoryMovements.create
```

Request — receipt:

```json id="jagp8z"
{
  "itemId": "uuid",
  "storageLocationId": "uuid",
  "movementType": "receipt",
  "quantity": "20.0000",
  "unitCostAmount": "2.35",
  "currency": "USD",
  "reason": "Compra registrada para reposición de stock.",
  "referenceType": "supplierReceipt",
  "supplierId": "uuid",
  "supplierPayableId": "uuid",
  "secureDocumentId": "uuid"
}
```

Request — issue:

```json id="g2xrvj"
{
  "itemId": "uuid",
  "storageLocationId": "uuid",
  "movementType": "issue",
  "quantity": "3.0000",
  "reason": "Salida manual por uso operativo.",
  "referenceType": "manual"
}
```

Response:

```http id="u821xz"
201 Created
```

```json id="xj0put"
{
  "data": {
    "id": "uuid",
    "movementNumber": "IM-202607-000001",
    "itemId": "uuid",
    "storageLocationId": "uuid",
    "movementType": "receipt",
    "movementDirection": "in",
    "quantity": "20.0000",
    "unitCostAmount": "2.35",
    "totalCostAmount": "47.00",
    "currency": "USD",
    "status": "draft",
    "createdAt": "2026-07-24T16:30:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="uqi730"
- movementNumber se genera server-side.
- movementDirection se deriva de movementType.
- totalCostAmount se calcula server-side.
- itemId tenant-scoped.
- storageLocationId tenant-scoped.
- supplierId se valida con Supplier Payments si existe.
- supplierPayableId se valida con Supplier Payments si existe.
- secureDocumentId se valida con SDS si existe.
- draft no afecta stock.
```

Prohibido:

```json id="vawklc"
{
  "movementNumber": "IM-202607-000001",
  "movementDirection": "in",
  "totalCostAmount": "47.00",
  "quantityOnHand": "100.0000",
  "postedBy": "uuid",
  "status": "posted"
}
```

---

## 15.3. Get movement

```http id="vh89wj"
GET /api/v1/tenant/inventory-movements/{movementId}
```

Permiso:

```text id="b85vbx"
inventoryMovements.read
```

---

## 15.4. Post movement

```http id="bmh7d2"
POST /api/v1/tenant/inventory-movements/{movementId}/post
```

Permiso:

```text id="borpjy"
inventoryMovements.post
```

Request:

```json id="j4oa9e"
{
  "reason": "Movimiento verificado y posteado."
}
```

Reglas:

```text id="jlwbqx"
- Solo movement draft puede pasar a posted.
- posted afecta stock.
- issue, maintenanceConsumption, adjustmentDecrease y transferOut validan stock disponible.
- receipt, openingBalance, transferIn, adjustmentIncrease y returnToStock incrementan stock.
- operación transaccional.
- genera o actualiza InventoryStockBalance.
- puede generar InventoryAlert.
- audita inventoryMovement.posted.
```

Response:

```json id="ivpco0"
{
  "data": {
    "id": "uuid",
    "movementNumber": "IM-202607-000001",
    "status": "posted",
    "postedAt": "2026-07-24T16:30:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 15.5. Cancel movement

```http id="l0sbcj"
POST /api/v1/tenant/inventory-movements/{movementId}/cancel
```

Permiso:

```text id="rmrtrp"
inventoryMovements.cancel
```

Request:

```json id="o71xaa"
{
  "cancelReason": "Movimiento creado por error antes de postear."
}
```

Reglas:

```text id="fgdwif"
- Solo draft puede cancelarse.
- Cancelled no afecta stock.
- cancelReason obligatorio.
```

---

## 15.6. Reverse movement

```http id="r2zs04"
POST /api/v1/tenant/inventory-movements/{movementId}/reverse
```

Permiso:

```text id="nbsjjr"
inventoryMovements.reverse
```

Request:

```json id="d6dlo6"
{
  "reverseReason": "Corrección por registro operativo duplicado."
}
```

Reglas:

```text id="j2lv5b"
- Solo posted puede reversarse.
- posted no se edita destructivamente.
- reverse crea movimiento compensatorio o registra reverso controlado según implementación.
- debe preservar reversedMovementId y reversalMovementId.
- reverseReason obligatorio.
- operación transaccional.
- audita inventoryMovement.reversed.
```

---

## 15.7. Archive movement

```http id="mkh7lx"
POST /api/v1/tenant/inventory-movements/{movementId}/archive
```

Permiso:

```text id="p3ckz4"
inventoryMovements.archive
```

Request:

```json id="aqyg9z"
{
  "archiveReason": "Histórico cerrado."
}
```

Regla:

```text id="c5rkki"
Archivar no elimina trazabilidad ni revierte stock.
```

---

# 16. Endpoints — Adjustments

## 16.1. List adjustments

```http id="p8q02i"
GET /api/v1/tenant/inventory-adjustments
```

Permiso:

```text id="relfrx"
inventoryAdjustments.read
```

Query params:

```text id="o6dwih"
status
adjustmentType
itemId
storageLocationId
dateFrom
dateTo
page
pageSize
sortBy
sortDirection
```

---

## 16.2. Create adjustment

```http id="lt5jl7"
POST /api/v1/tenant/inventory-adjustments
```

Permiso:

```text id="g2t2uy"
inventoryAdjustments.create
```

Request:

```json id="rdlxnf"
{
  "itemId": "uuid",
  "storageLocationId": "uuid",
  "adjustmentType": "decrease",
  "quantity": "2.0000",
  "reason": "Diferencia detectada en conteo físico.",
  "secureDocumentId": "uuid"
}
```

Response:

```http id="tasmje"
201 Created
```

Reglas:

```text id="jg6q0a"
- quantity > 0.
- reason obligatorio.
- itemId tenant-scoped.
- storageLocationId tenant-scoped.
- secureDocumentId tenant-scoped si existe.
- draft no afecta stock.
```

---

## 16.3. Get adjustment

```http id="m1h4j8"
GET /api/v1/tenant/inventory-adjustments/{adjustmentId}
```

Permiso:

```text id="n85dxn"
inventoryAdjustments.read
```

---

## 16.4. Submit adjustment

```http id="yys3zl"
POST /api/v1/tenant/inventory-adjustments/{adjustmentId}/submit
```

Permiso:

```text id="kct42j"
inventoryAdjustments.submit
```

Request:

```json id="fq4p9a"
{
  "reason": "Enviado a aprobación."
}
```

---

## 16.5. Approve adjustment

```http id="yeqt0c"
POST /api/v1/tenant/inventory-adjustments/{adjustmentId}/approve
```

Permiso:

```text id="ayciuj"
inventoryAdjustments.approve
```

Request:

```json id="wbrs24"
{
  "reason": "Ajuste validado contra conteo físico."
}
```

---

## 16.6. Reject adjustment

```http id="xeqhm9"
POST /api/v1/tenant/inventory-adjustments/{adjustmentId}/reject
```

Permiso:

```text id="bpeqis"
inventoryAdjustments.reject
```

Request:

```json id="mt738b"
{
  "rejectReason": "No existe soporte suficiente para el ajuste."
}
```

---

## 16.7. Post adjustment

```http id="pzlk6h"
POST /api/v1/tenant/inventory-adjustments/{adjustmentId}/post
```

Permiso:

```text id="df4ihp"
inventoryAdjustments.post
```

Request:

```json id="vkl90g"
{
  "reason": "Ajuste aprobado y posteado."
}
```

Reglas:

```text id="xlt7bn"
- adjustment debe estar approved si la política exige aprobación.
- adjustmentIncrease crea movimiento adjustmentIncrease.
- adjustmentDecrease crea movimiento adjustmentDecrease.
- adjustmentDecrease valida stock disponible.
- operación transaccional.
- posted debe crear movementId.
- audita inventoryAdjustment.posted e inventoryMovement.posted.
```

---

## 16.8. Cancel adjustment

```http id="avjdii"
POST /api/v1/tenant/inventory-adjustments/{adjustmentId}/cancel
```

Permiso:

```text id="ysklho"
inventoryAdjustments.cancel
```

Request:

```json id="fi52et"
{
  "cancelReason": "Ajuste creado por error."
}
```

---

# 17. Endpoints — Transfers

## 17.1. List transfers

```http id="ii4c1i"
GET /api/v1/tenant/inventory-transfers
```

Permiso:

```text id="y0xlao"
inventoryTransfers.read
```

Query params:

```text id="cv5784"
status
itemId
sourceStorageLocationId
targetStorageLocationId
dateFrom
dateTo
page
pageSize
sortBy
sortDirection
```

---

## 17.2. Create transfer

```http id="bl7xaw"
POST /api/v1/tenant/inventory-transfers
```

Permiso:

```text id="mhvrva"
inventoryTransfers.create
```

Request:

```json id="nqo6eg"
{
  "itemId": "uuid",
  "sourceStorageLocationId": "uuid",
  "targetStorageLocationId": "uuid",
  "quantity": "5.0000",
  "reason": "Traslado a cuarto de mantenimiento."
}
```

Reglas:

```text id="mdmg0b"
- sourceStorageLocationId tenant-scoped.
- targetStorageLocationId tenant-scoped.
- sourceStorageLocationId != targetStorageLocationId.
- quantity > 0.
- draft no afecta stock.
```

---

## 17.3. Get transfer

```http id="h6rbyc"
GET /api/v1/tenant/inventory-transfers/{transferId}
```

Permiso:

```text id="ofj7rw"
inventoryTransfers.read
```

---

## 17.4. Post transfer

```http id="zagku9"
POST /api/v1/tenant/inventory-transfers/{transferId}/post
```

Permiso:

```text id="ly7t3u"
inventoryTransfers.post
```

Request:

```json id="e70hsl"
{
  "reason": "Transferencia verificada."
}
```

Reglas:

```text id="eu89x9"
- valida stock disponible en origen.
- crea movimiento transferOut.
- crea movimiento transferIn.
- ambos movimientos se crean en la misma transacción.
- actualiza saldo origen y destino.
- no permite stock negativo.
- audita inventoryTransfer.posted.
```

---

## 17.5. Cancel transfer

```http id="xurbww"
POST /api/v1/tenant/inventory-transfers/{transferId}/cancel
```

Permiso:

```text id="o3cxps"
inventoryTransfers.cancel
```

Request:

```json id="y1v70a"
{
  "cancelReason": "Transferencia no requerida."
}
```

---

## 17.6. Reverse transfer

```http id="z115tz"
POST /api/v1/tenant/inventory-transfers/{transferId}/reverse
```

Permiso:

```text id="bhy9g3"
inventoryTransfers.reverse
```

Request:

```json id="mkdq1s"
{
  "reverseReason": "Transferencia registrada en sentido incorrecto."
}
```

Reglas:

```text id="bd2dl0"
- Solo transfer posted puede reversarse.
- Debe crear movimientos compensatorios o reverse controlado.
- No borra movimientos originales.
- Audita inventoryTransfer.reversed.
```

---

# 18. Endpoints — Consumptions

## 18.1. List consumptions

```http id="gxc4g6"
GET /api/v1/tenant/inventory-consumptions
```

Permiso:

```text id="otdx7h"
inventoryConsumptions.read
```

Query params:

```text id="h8qctq"
status
itemId
storageLocationId
maintenanceWorkOrderId
maintenanceTaskId
consumedByUserId
dateFrom
dateTo
page
pageSize
sortBy
sortDirection
```

---

## 18.2. Create consumption

```http id="kox75e"
POST /api/v1/tenant/inventory-consumptions
```

Permiso:

```text id="vy5ox4"
inventoryConsumptions.create
```

Request:

```json id="r0q8mw"
{
  "itemId": "uuid",
  "storageLocationId": "uuid",
  "quantity": "2.0000",
  "maintenanceWorkOrderId": "uuid",
  "maintenanceTaskId": "uuid",
  "consumedByUserId": "uuid",
  "reason": "Material utilizado en reparación de tubería."
}
```

Reglas:

```text id="ryhlvi"
- maintenanceWorkOrderId obligatorio.
- maintenanceWorkOrderId tenant-scoped.
- maintenanceTaskId debe pertenecer a la orden si existe.
- item active.
- location active.
- quantity > 0.
- draft no afecta stock.
- no cambia estado de Maintenance Work Orders.
```

---

## 18.3. Get consumption

```http id="fxhj96"
GET /api/v1/tenant/inventory-consumptions/{consumptionId}
```

Permiso:

```text id="zpst6q"
inventoryConsumptions.read
```

---

## 18.4. Post consumption

```http id="ptxl5g"
POST /api/v1/tenant/inventory-consumptions/{consumptionId}/post
```

Permiso:

```text id="t4tz3h"
inventoryConsumptions.post
```

Request:

```json id="quwjfm"
{
  "reason": "Consumo verificado en orden de mantenimiento."
}
```

Reglas:

```text id="rhyfhu"
- valida stock disponible.
- crea movement maintenanceConsumption.
- actualiza stock.
- no modifica estado de la orden.
- no crea costo de mantenimiento automáticamente.
- audita inventoryConsumption.posted.
```

---

## 18.5. Cancel consumption

```http id="b08aq2"
POST /api/v1/tenant/inventory-consumptions/{consumptionId}/cancel
```

Permiso:

```text id="mklw32"
inventoryConsumptions.cancel
```

Request:

```json id="ksnkac"
{
  "cancelReason": "Consumo creado por error antes de postear."
}
```

---

## 18.6. Reverse consumption

```http id="yw579x"
POST /api/v1/tenant/inventory-consumptions/{consumptionId}/reverse
```

Permiso:

```text id="xkwnmc"
inventoryConsumptions.reverse
```

Request:

```json id="v7pyd0"
{
  "reverseReason": "Material devuelto a bodega."
}
```

---

## 18.7. List consumptions by work order

```http id="t95v2h"
GET /api/v1/tenant/maintenance-work-orders/{workOrderId}/inventory-consumptions
```

Permiso:

```text id="qtsfad"
inventoryConsumptions.byWorkOrder.read
```

Reglas:

```text id="qk98f9"
- workOrderId tenant-scoped.
- No devuelve datos cross-tenant.
- No modifica Maintenance Work Orders.
```

Response:

```json id="ai4w9q"
{
  "data": [
    {
      "id": "uuid",
      "consumptionNumber": "IC-202607-000001",
      "itemId": "uuid",
      "itemCode": "PVC_VALVE_1_2",
      "itemName": "Válvula PVC 1/2",
      "quantity": "2.0000",
      "storageLocationId": "uuid",
      "storageLocationName": "Bodega principal",
      "maintenanceWorkOrderId": "uuid",
      "maintenanceTaskId": "uuid",
      "status": "posted",
      "postedAt": "2026-07-24T16:30:00.000Z"
    }
  ],
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

# 19. Endpoints — Documents

## 19.1. List inventory documents

```http id="jc89kn"
GET /api/v1/tenant/inventory-documents
```

Permiso:

```text id="u0q4eh"
inventoryDocuments.read
```

Query params:

```text id="ysst0p"
entityType
entityId
documentType
status
page
pageSize
sortBy
sortDirection
```

---

## 19.2. Create inventory document link

```http id="lkjifx"
POST /api/v1/tenant/inventory-documents
```

Permiso:

```text id="w0fcgp"
inventoryDocuments.create
```

Request:

```json id="g83xnu"
{
  "entityType": "inventoryMovement",
  "entityId": "uuid",
  "secureDocumentId": "uuid",
  "documentType": "invoice",
  "description": "Factura de compra asociada al ingreso de inventario."
}
```

Reglas:

```text id="jhb3sl"
- secureDocumentId tenant-scoped.
- entityId tenant-scoped según entityType.
- visibility = administrative en MVP.
- no storageKey.
- no signedUrl persistente.
- no base64.
```

Response:

```http id="d2kxwb"
201 Created
```

```json id="xj6hgf"
{
  "data": {
    "id": "uuid",
    "entityType": "inventoryMovement",
    "entityId": "uuid",
    "secureDocumentId": "uuid",
    "documentType": "invoice",
    "visibility": "administrative",
    "status": "active",
    "downloadAvailable": true,
    "createdAt": "2026-07-24T16:30:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 19.3. Get inventory document

```http id="za5hac"
GET /api/v1/tenant/inventory-documents/{documentId}
```

Permiso:

```text id="b9pmyi"
inventoryDocuments.read
```

Response no debe incluir:

```text id="yon5t7"
storageKey
signedUrl persistente
base64
raw file payload
```

---

## 19.4. Archive inventory document

```http id="yyzllb"
POST /api/v1/tenant/inventory-documents/{documentId}/archive
```

Permiso:

```text id="fp7mfr"
inventoryDocuments.archive
```

Request:

```json id="p62vbv"
{
  "archiveReason": "Documento vinculado por error."
}
```

---

# 20. Endpoints — Alerts

## 20.1. List alerts

```http id="xm8j1x"
GET /api/v1/tenant/inventory-alerts
```

Permiso:

```text id="l88of9"
inventoryAlerts.read
```

Query params:

```text id="cqzp41"
status
alertType
severity
itemId
storageLocationId
page
pageSize
sortBy
sortDirection
```

Response:

```json id="n7h123"
{
  "data": [
    {
      "id": "uuid",
      "itemId": "uuid",
      "itemCode": "PVC_VALVE_1_2",
      "itemName": "Válvula PVC 1/2",
      "storageLocationId": "uuid",
      "storageLocationName": "Bodega principal",
      "alertType": "lowStock",
      "severity": "warning",
      "status": "open",
      "currentQuantity": "4.0000",
      "thresholdQuantity": "5.0000",
      "message": "Stock disponible por debajo del mínimo configurado.",
      "createdAt": "2026-07-24T16:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 1,
    "traceId": "trace-id"
  }
}
```

---

## 20.2. Acknowledge alert

```http id="n4e9cd"
POST /api/v1/tenant/inventory-alerts/{alertId}/acknowledge
```

Permiso:

```text id="s9fg1v"
inventoryAlerts.acknowledge
```

Request:

```json id="rghlja"
{
  "reason": "Alerta revisada por inventario."
}
```

---

## 20.3. Resolve alert

```http id="qkbvbm"
POST /api/v1/tenant/inventory-alerts/{alertId}/resolve
```

Permiso:

```text id="eauueh"
inventoryAlerts.resolve
```

Request:

```json id="xfr5cf"
{
  "resolutionReason": "Stock repuesto mediante ingreso de inventario."
}
```

---

## 20.4. Dismiss alert

```http id="yjgwib"
POST /api/v1/tenant/inventory-alerts/{alertId}/dismiss
```

Permiso:

```text id="x55148"
inventoryAlerts.dismiss
```

Request:

```json id="ez1vsh"
{
  "dismissReason": "Umbral configurado incorrectamente."
}
```

---

## 20.5. Archive alert

```http id="ysnnbr"
POST /api/v1/tenant/inventory-alerts/{alertId}/archive
```

Permiso:

```text id="veyy90"
inventoryAlerts.archive
```

Request:

```json id="x7t209"
{
  "archiveReason": "Alerta histórica archivada."
}
```

---

# 21. Endpoints — Reports

## 21.1. Stock report

```http id="r7nhrf"
GET /api/v1/tenant/inventory-reports/stock
```

Permiso:

```text id="xmnnsh"
inventoryReports.stock
```

Query params:

```text id="pn1y5z"
categoryId
itemId
storageLocationId
itemType
status
lowStockOnly
page
pageSize
sortBy
sortDirection
```

Response:

```json id="zxuw05"
{
  "data": [
    {
      "itemId": "uuid",
      "itemCode": "PVC_VALVE_1_2",
      "itemName": "Válvula PVC 1/2",
      "categoryName": "Plomería",
      "unitSymbol": "und",
      "storageLocationName": "Bodega principal",
      "quantityOnHand": "25.0000",
      "quantityReserved": "0.0000",
      "quantityAvailable": "25.0000",
      "minimumStockQuantity": "5.0000",
      "reorderPointQuantity": "10.0000"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 1,
    "traceId": "trace-id"
  }
}
```

---

## 21.2. Movements report

```http id="j1i292"
GET /api/v1/tenant/inventory-reports/movements
```

Permiso:

```text id="pwadwc"
inventoryReports.movements
```

Query params:

```text id="qf5948"
dateFrom
dateTo
movementType
movementDirection
itemId
storageLocationId
supplierId
maintenanceWorkOrderId
page
pageSize
sortBy
sortDirection
```

---

## 21.3. Consumption report

```http id="w0kpgq"
GET /api/v1/tenant/inventory-reports/consumption
```

Permiso:

```text id="edsff7"
inventoryReports.consumption
```

Query params:

```text id="jc0sus"
dateFrom
dateTo
maintenanceWorkOrderId
maintenanceTaskId
itemId
categoryId
storageLocationId
page
pageSize
sortBy
sortDirection
```

---

## 21.4. Low stock report

```http id="k203i9"
GET /api/v1/tenant/inventory-reports/low-stock
```

Permiso:

```text id="waq93g"
inventoryReports.lowStock
```

Query params:

```text id="lmpwdr"
categoryId
storageLocationId
itemType
severity
includeAcknowledged
page
pageSize
sortBy
sortDirection
```

---

## 21.5. Valuation report

```http id="hn4grz"
GET /api/v1/tenant/inventory-reports/valuation
```

Permiso:

```text id="lroksf"
inventoryReports.valuation
```

Query params:

```text id="t6p7yp"
categoryId
itemId
storageLocationId
dateFrom
dateTo
valuationMethod
page
pageSize
sortBy
sortDirection
```

Response:

```json id="xvebe4"
{
  "data": [
    {
      "itemId": "uuid",
      "itemCode": "PVC_VALVE_1_2",
      "itemName": "Válvula PVC 1/2",
      "storageLocationId": "uuid",
      "quantityOnHand": "25.0000",
      "unitCostAmount": "2.45",
      "referenceValueAmount": "61.25",
      "currency": "USD",
      "valuationNature": "referenceOnly"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 1,
    "traceId": "trace-id"
  }
}
```

Regla:

```text id="l4fj82"
La valorización es referencial, no contable oficial.
```

---

## 21.6. Export report

```http id="gz0uc2"
GET /api/v1/tenant/inventory-reports/export
```

Permiso:

```text id="i6r45t"
inventoryReports.export
```

Query params:

```text id="xwrx7p"
reportType
format
dateFrom
dateTo
categoryId
itemId
storageLocationId
movementType
maintenanceWorkOrderId
lowStockOnly
```

Valores:

```text id="avurmx"
reportType = stock | movements | consumption | lowStock | valuation
format = csv | xlsx | pdf
```

Response:

```json id="vi21qf"
{
  "data": {
    "exportId": "uuid",
    "reportType": "stock",
    "format": "xlsx",
    "status": "completed",
    "secureDocumentId": "uuid",
    "downloadAvailable": true,
    "createdAt": "2026-07-24T16:30:00.000Z",
    "completedAt": "2026-07-24T16:30:03.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

No debe devolver:

```text id="c1nl15"
storageKey
signedUrl persistente
base64
raw file payload
```

---

# 22. DTOs principales

## 22.1. `CreateInventoryCategoryDto`

```typescript id="jbgbem"
type CreateInventoryCategoryDto = {
  categoryCode: string;
  categoryName: string;
  description?: string;
};
```

---

## 22.2. `CreateInventoryUnitDto`

```typescript id="a639uy"
type CreateInventoryUnitDto = {
  unitCode: string;
  unitName: string;
  unitSymbol?: string;
  allowsDecimals: boolean;
  decimalPrecision: number;
};
```

---

## 22.3. `CreateInventoryItemDto`

```typescript id="g459ja"
type CreateInventoryItemDto = {
  itemCode: string;
  itemName: string;
  description?: string;
  categoryId: string;
  unitId: string;
  itemType: InventoryItemType;
  stockTrackingMode: InventoryStockTrackingMode;
  defaultStorageLocationId?: string;
  minimumStockQuantity?: string;
  reorderPointQuantity?: string;
  referenceUnitCostAmount?: string;
  currency: "USD";
  preferredSupplierId?: string;
};
```

---

## 22.4. `CreateInventoryMovementDto`

```typescript id="jbekpp"
type CreateInventoryMovementDto = {
  itemId: string;
  storageLocationId: string;
  targetStorageLocationId?: string;
  movementType: InventoryMovementType;
  quantity: string;
  unitCostAmount?: string;
  currency?: "USD";
  reason?: string;
  referenceType?: InventoryReferenceType;
  referenceId?: string;
  supplierId?: string;
  supplierPayableId?: string;
  maintenanceWorkOrderId?: string;
  maintenanceTaskId?: string;
  secureDocumentId?: string;
};
```

Campos calculados server-side:

```text id="u3xs7n"
movementNumber
movementDirection
totalCostAmount
status
createdBy
postedBy
postedAt
```

---

## 22.5. `CreateInventoryAdjustmentDto`

```typescript id="jue1bp"
type CreateInventoryAdjustmentDto = {
  itemId: string;
  storageLocationId: string;
  adjustmentType: InventoryAdjustmentType;
  quantity: string;
  reason: string;
  secureDocumentId?: string;
};
```

---

## 22.6. `CreateInventoryTransferDto`

```typescript id="rigcgz"
type CreateInventoryTransferDto = {
  itemId: string;
  sourceStorageLocationId: string;
  targetStorageLocationId: string;
  quantity: string;
  reason: string;
};
```

---

## 22.7. `CreateInventoryConsumptionDto`

```typescript id="s2kmox"
type CreateInventoryConsumptionDto = {
  itemId: string;
  storageLocationId: string;
  quantity: string;
  maintenanceWorkOrderId: string;
  maintenanceTaskId?: string;
  consumedByUserId?: string;
  reason?: string;
};
```

---

## 22.8. `CreateInventoryDocumentDto`

```typescript id="odrh3r"
type CreateInventoryDocumentDto = {
  entityType: InventoryDocumentEntityType;
  entityId: string;
  secureDocumentId: string;
  documentType: InventoryDocumentType;
  description?: string;
};
```

---

# 23. Campos prohibidos en DTOs externos

Todos los DTOs externos deben rechazar:

```text id="m4r9y5"
tenantId
createdBy
updatedBy
postedBy
submittedBy
approvedBy
rejectedBy
cancelledBy
reversedBy
archivedBy
requestedBy
acknowledgedBy
resolvedBy
dismissedBy
status directo fuera de endpoint de transición
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
supplierPaymentOrderId
journalEntryId
bankTransactionId
reconciliationMatchId
paymentInitiation
bankTransferInstruction
openBankingPaymentInitiation
externalAiEnabled
```

Respuesta esperada:

```http id="curkj4"
422 Unprocessable Entity
```

---

# 24. Enums API

## 24.1. Item

```text id="tt8qvp"
InventoryItemType:
- consumable
- sparePart
- minorTool
- supply
- safetyEquipment
- cleaningSupply
- officeSupply
- other

InventoryStockTrackingMode:
- quantityOnly
- quantityAndCost
- nonTrackedReference

InventoryItemStatus:
- draft
- active
- inactive
- archived
```

---

## 24.2. Location

```text id="xnw5ui"
InventoryLocationType:
- warehouse
- maintenanceRoom
- guardhouse
- office
- technicalCabinet
- temporary
- other

InventoryLocationStatus:
- active
- inactive
- archived
```

---

## 24.3. Movement

```text id="z3qpkd"
InventoryMovementType:
- openingBalance
- receipt
- issue
- maintenanceConsumption
- adjustmentIncrease
- adjustmentDecrease
- transferOut
- transferIn
- returnToStock
- correction

InventoryMovementDirection:
- in
- out
- neutral

InventoryMovementStatus:
- draft
- posted
- cancelled
- reversed
- archived

InventoryReferenceType:
- manual
- supplierReceipt
- maintenanceWorkOrder
- maintenanceTask
- stockAdjustment
- stockTransfer
- stockCount
- correction
- other
```

---

## 24.4. Adjustment, transfer, consumption

```text id="v9bgyr"
InventoryAdjustmentType:
- increase
- decrease
- correction
- loss
- damage
- found
- expired
- other

InventoryAdjustmentStatus:
- draft
- submitted
- approved
- rejected
- posted
- cancelled
- archived

InventoryTransferStatus:
- draft
- posted
- cancelled
- reversed
- archived

InventoryConsumptionStatus:
- draft
- posted
- cancelled
- reversed
- archived
```

---

## 24.5. Documents, alerts and reports

```text id="j2zhr3"
InventoryDocumentEntityType:
- inventoryItem
- inventoryMovement
- inventoryAdjustment
- inventoryTransfer
- inventoryConsumption
- inventoryCount
- inventoryReportExport

InventoryDocumentType:
- invoice
- receipt
- deliveryNote
- adjustmentSupport
- photo
- technicalReport
- inventoryCount
- other

InventoryDocumentVisibility:
- administrative

InventoryAlertType:
- lowStock
- outOfStock
- negativeStockAttempt
- inactiveItemUsed
- archivedLocationUsed

InventoryAlertSeverity:
- info
- warning
- critical

InventoryAlertStatus:
- open
- acknowledged
- resolved
- dismissed
- archived

InventoryReportType:
- stock
- movements
- consumption
- lowStock
- valuation

InventoryExportFormat:
- csv
- xlsx
- pdf
```

---

# 25. Errores

## 25.1. Categorías y unidades

```text id="t1sjwg"
INVENTORY_CATEGORY_NOT_FOUND
INVENTORY_CATEGORY_DUPLICATE_CODE
INVENTORY_CATEGORY_INVALID_STATUS

INVENTORY_UNIT_NOT_FOUND
INVENTORY_UNIT_DUPLICATE_CODE
INVENTORY_UNIT_INVALID_STATUS
INVENTORY_UNIT_DECIMAL_PRECISION_INVALID
```

---

## 25.2. Ítems y ubicaciones

```text id="lxivef"
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
```

---

## 25.3. Stock y movimientos

```text id="w8myey"
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
```

---

## 25.4. Ajustes, transferencias y consumos

```text id="y7bz0r"
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
```

---

## 25.5. Documentos, proveedores, reportes y seguridad

```text id="scq5h8"
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

# 26. Códigos HTTP

| Caso                         |                      Código |
| ---------------------------- | --------------------------: |
| Creación exitosa             |               `201 Created` |
| Lectura exitosa              |                    `200 OK` |
| Actualización exitosa        |                    `200 OK` |
| Transición exitosa           |                    `200 OK` |
| Eliminación lógica / archivo |                    `200 OK` |
| Validación fallida           |               `400` o `422` |
| No autenticado               |          `401 Unauthorized` |
| Sin permiso                  |             `403 Forbidden` |
| Recurso no encontrado        |             `404 Not Found` |
| Recurso cross-tenant         |             `404 Not Found` |
| Conflicto de estado          |              `409 Conflict` |
| Stock insuficiente           |              `409 Conflict` |
| Código duplicado             |              `409 Conflict` |
| Rate limit                   |     `429 Too Many Requests` |
| Error interno                | `500 Internal Server Error` |

---

# 27. Integración con Secure Document Storage

## 27.1. Uso permitido

```text id="ljd6r4"
- inventory_documents.secureDocumentId
- inventory_movements.secureDocumentId
- inventory_stock_adjustments.secureDocumentId
- inventory_report_exports.secureDocumentId
```

---

## 27.2. Validaciones

Para todo `secureDocumentId`:

```text id="yl7au7"
- pertenece al tenant;
- está activo;
- sourceModule compatible;
- visibility = administrative;
- sensitivity = internal | restricted;
- usuario tiene permiso;
```

---

## 27.3. Prohibiciones

La API no debe aceptar ni devolver:

```text id="qz18bv"
storageKey
signedUrl persistente
base64
raw file payload
binary payload
```

---

# 28. Integración con Supplier Payments

## 28.1. Uso permitido

```text id="zv7ylg"
preferredSupplierId en InventoryItem
supplierId en InventoryMovement
supplierPayableId en InventoryMovement
```

---

## 28.2. Validaciones

```text id="y7zgla"
- supplierId tenant-scoped.
- supplier active.
- supplier no blocked.
- supplier no archived.
- supplierPayableId tenant-scoped.
- supplierPayableId corresponde al proveedor si ambos se informan.
```

---

## 28.3. Prohibiciones

Inventory Basic no debe:

```text id="vanxcc"
- crear SupplierPayable en MVP;
- crear SupplierPaymentOrder;
- marcar SupplierPaymentOrder como paid;
- crear Payment;
- crear PaymentAllocation;
- iniciar transferencia bancaria;
- modificar cuenta bancaria de proveedor;
- modificar estado financiero de proveedor;
- modificar Accounting Ledger.
```

---

# 29. Integración con Maintenance Work Orders

## 29.1. Uso permitido

```text id="frn1tk"
maintenanceWorkOrderId en InventoryConsumption
maintenanceTaskId en InventoryConsumption
maintenanceWorkOrderId en InventoryMovement
maintenanceTaskId en InventoryMovement
GET /api/v1/tenant/maintenance-work-orders/{workOrderId}/inventory-consumptions
```

---

## 29.2. Validaciones

```text id="zrjwlu"
- maintenanceWorkOrderId tenant-scoped.
- maintenanceWorkOrder no archived.
- maintenanceWorkOrder status permite registrar consumo.
- maintenanceTaskId pertenece a la orden si se informa.
```

---

## 29.3. Prohibiciones

Inventory Basic no debe:

```text id="aaanj9"
- crear MaintenanceWorkOrder;
- modificar MaintenanceWorkOrder status;
- cerrar orden de mantenimiento;
- completar orden de mantenimiento;
- aprobar costos de mantenimiento;
- crear cuenta por pagar de mantenimiento;
- crear comentarios de mantenimiento automáticamente.
```

---

# 30. Límites contables, bancarios y de pago

## 30.1. Accounting Ledger

Prohibido:

```text id="pg117w"
- crear JournalEntry;
- crear JournalEntryLine;
- modificar JournalEntry;
- postear asiento;
- revertir asiento;
- modificar balances;
- modificar periodos contables.
```

---

## 30.2. Bank Reconciliation

Prohibido:

```text id="wcwk4k"
- crear BankTransaction;
- modificar BankTransaction;
- crear ReconciliationMatch;
- confirmar conciliación;
- cerrar sesión de conciliación;
- marcar transacción como matched.
```

---

## 30.3. Payments

Prohibido:

```text id="i40yxr"
- crear Payment;
- crear PaymentAllocation;
- crear SupplierPaymentOrder;
- marcar paid;
- iniciar transferencia bancaria;
- iniciar Open Banking payment;
```

---

# 31. Auditoría

Todo endpoint crítico debe emitir audit event.

Eventos mínimos:

```text id="anf4i4"
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

inventoryAlert.acknowledged
inventoryAlert.resolved
inventoryAlert.dismissed
inventoryAlert.archived

inventoryReport.generated
inventoryReport.exported
```

Metadata permitida:

```text id="cryqct"
itemId
itemCode
categoryId
unitId
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

Metadata prohibida:

```text id="x1io6x"
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

# 32. Observabilidad

## 32.1. Logs seguros

Eventos loggeables:

```text id="f2e1va"
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

```text id="u4pagv"
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

```text id="sqcq1f"
storageKey
signedUrl
base64
raw payload
raw file payload
tokens
secrets
passwords
SQL raw
stack trace productivo
```

---

## 32.2. Métricas

```text id="b0fajl"
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

```text id="h2imwc"
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

Labels prohibidos:

```text id="bdkp65"
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

# 33. OpenAPI

## 33.1. Tags

```text id="m5b7tg"
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

## 33.2. Extensiones globales

Todas las rutas tenant deben incluir:

```yaml id="kqjbhc"
x-tenant-scope: true
x-auth-required: true
x-inventory-basic: true
x-public-exposure: false
```

Rutas de stock:

```yaml id="xwddyb"
x-stock-controlled: true
x-movement-driven: true
x-negative-stock-default: false
```

Rutas con documentos:

```yaml id="t8nu45"
x-secure-document-storage: true
x-storage-key-exposed: false
```

Rutas con costos:

```yaml id="bavolv"
x-decimal-money: true
x-reference-valuation-only: true
x-direct-accounting: false
```

Rutas con Supplier Payments:

```yaml id="d7mbvs"
x-supplier-payments-linked: true
x-payment-creation: false
x-supplier-payment-order-created: false
x-supplier-payment-mark-paid: false
```

Restricciones globales:

```yaml id="q72t41"
x-public-endpoint: false
x-me-endpoint: false
x-wordpress-access: false
x-open-banking-payment-initiation: false
x-bank-transfer-initiation: false
x-external-ai-real-data: false
```

---

## 33.3. OpenAPI no debe documentar

```text id="vvzdfh"
storageKey
signedUrl persistente
base64
rawFilePayload
tenantId en DTOs externos
actor fields en DTOs externos
quantityOnHand editable
quantityAvailable editable
totalCostAmount editable
paymentOrderId
supplierPaymentOrderId
journalEntryId
bankTransactionId
reconciliationMatchId
externalAiEnabled
/api/v1/me/inventory-*
/api/v1/public/inventory-*
```

---

# 34. Rate limiting

Aplicar rate limit reforzado en:

```text id="gshm3k"
POST /api/v1/tenant/inventory-movements
POST /api/v1/tenant/inventory-movements/{movementId}/post
POST /api/v1/tenant/inventory-movements/{movementId}/reverse
POST /api/v1/tenant/inventory-adjustments/{adjustmentId}/post
POST /api/v1/tenant/inventory-transfers/{transferId}/post
POST /api/v1/tenant/inventory-consumptions/{consumptionId}/post
POST /api/v1/tenant/inventory-stock/recalculate
GET  /api/v1/tenant/inventory-reports/export
```

Objetivo:

```text id="b2p8ga"
- evitar abuso de movimientos;
- evitar recalculaciones excesivas;
- evitar exports masivos;
- proteger consistencia de stock;
- proteger operaciones transaccionales.
```

---

# 35. Headers de seguridad

Todas las respuestas deben incluir:

```http id="xl6edo"
Cache-Control: no-store
Pragma: no-cache
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
```

CORS:

```text id="yjxz31"
- no wildcard;
- no WordPress público para inventory;
- solo frontend administrativo autenticado;
- orígenes explícitos por ambiente.
```

---

# 36. Endpoints prohibidos

## 36.1. `/me`

No implementar:

```text id="nq10su"
GET    /api/v1/me/inventory-items
GET    /api/v1/me/inventory-stock
GET    /api/v1/me/inventory-movements
GET    /api/v1/me/inventory-reports
POST   /api/v1/me/inventory-consumptions
```

Respuesta:

```http id="q84678"
404 Not Found
```

---

## 36.2. Public

No implementar:

```text id="c32jr0"
GET    /api/v1/public/inventory-items
GET    /api/v1/public/inventory-stock
GET    /api/v1/public/inventory-movements
GET    /api/v1/public/inventory-reports
GET    /api/v1/public/tenants/{slug}/inventory-items
GET    /api/v1/public/tenants/{slug}/inventory-stock
POST   /api/v1/public/inventory-movements
```

Respuesta:

```http id="p08jr3"
404 Not Found
```

---

# 37. Casos de borde

## 37.1. Stock insuficiente

Caso:

```text id="f11dcy"
Issue de 10 unidades cuando quantityAvailable = 5.
```

Respuesta:

```http id="gqlcls"
409 Conflict
```

Error:

```json id="z9z8qs"
{
  "error": {
    "code": "INVENTORY_STOCK_INSUFFICIENT",
    "message": "Insufficient inventory stock.",
    "details": {
      "available": "5.0000",
      "requested": "10.0000"
    },
    "traceId": "trace-id"
  }
}
```

---

## 37.2. Transferencia a la misma ubicación

Respuesta:

```http id="vif6fe"
409 Conflict
```

Error:

```json id="la9ea7"
{
  "error": {
    "code": "INVENTORY_TRANSFER_SAME_LOCATION_FORBIDDEN",
    "message": "Source and target storage locations must be different.",
    "details": {},
    "traceId": "trace-id"
  }
}
```

---

## 37.3. Movimiento posted editable

Respuesta:

```http id="qio0go"
409 Conflict
```

Error:

```json id="ahhxod"
{
  "error": {
    "code": "INVENTORY_MOVEMENT_POSTED_IMMUTABLE",
    "message": "Posted movements cannot be edited destructively.",
    "details": {},
    "traceId": "trace-id"
  }
}
```

---

## 37.4. Recurso cross-tenant

Respuesta:

```http id="c0lxe2"
404 Not Found
```

Error:

```json id="e1ycsz"
{
  "error": {
    "code": "INVENTORY_ITEM_NOT_FOUND",
    "message": "Inventory item not found.",
    "details": {},
    "traceId": "trace-id"
  }
}
```

---

## 37.5. Documento con storageKey

Respuesta:

```http id="kxlhq5"
422 Unprocessable Entity
```

Error:

```json id="k2bhfc"
{
  "error": {
    "code": "INVENTORY_DOCUMENT_STORAGE_KEY_FORBIDDEN",
    "message": "Storage keys are not accepted by Inventory Basic API.",
    "details": {},
    "traceId": "trace-id"
  }
}
```

---

# 38. Validaciones críticas por endpoint

## 38.1. Create movement

```text id="siog4l"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard.
[ ] Rechaza tenantId.
[ ] Rechaza actor fields.
[ ] Rechaza movementNumber.
[ ] Rechaza totalCostAmount.
[ ] Valida item tenant-scoped.
[ ] Valida location tenant-scoped.
[ ] Valida quantity string decimal.
[ ] Valida unitCostAmount string decimal.
[ ] Deriva movementDirection.
[ ] Calcula totalCostAmount server-side.
[ ] No afecta stock hasta post.
```

---

## 38.2. Post movement

```text id="mvte09"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard.
[ ] Valida estado draft.
[ ] Valida stock disponible para out.
[ ] Actualiza stock en transacción.
[ ] Genera alertas si aplica.
[ ] Audita inventoryMovement.posted.
[ ] No crea Payment.
[ ] No crea SupplierPaymentOrder.
[ ] No crea JournalEntry.
```

---

## 38.3. Post transfer

```text id="hztky8"
[ ] Valida source tenant-scoped.
[ ] Valida target tenant-scoped.
[ ] Rechaza source = target.
[ ] Valida stock disponible en source.
[ ] Crea transferOut.
[ ] Crea transferIn.
[ ] Actualiza ambos saldos en transacción.
[ ] Audita.
```

---

## 38.4. Post consumption

```text id="prns2r"
[ ] Valida workOrder tenant-scoped.
[ ] Valida task pertenece a workOrder.
[ ] Valida item active.
[ ] Valida location active.
[ ] Valida stock disponible.
[ ] Crea maintenanceConsumption movement.
[ ] Actualiza stock.
[ ] No modifica WorkOrder status.
[ ] Audita.
```

---

# 39. Criterios de aceptación API

```text id="b6xbmr"
[ ] Todas las rutas inventory están bajo /api/v1/tenant.
[ ] Todas las rutas requieren autenticación.
[ ] Todas las rutas requieren tenant context.
[ ] Todas las rutas requieren permisos.
[ ] No existen rutas /api/v1/me/inventory-*.
[ ] No existen rutas /api/v1/public/inventory-*.
[ ] Categories CRUD lógico funciona.
[ ] Units CRUD lógico funciona.
[ ] Items CRUD lógico y activate/deactivate/archive funcionan.
[ ] Locations CRUD lógico funciona.
[ ] Stock list y get by item funcionan.
[ ] Recalculate stock funciona sin recibir saldos desde cliente.
[ ] Movements create/post/cancel/reverse/archive funcionan.
[ ] Posted movements afectan stock.
[ ] Draft movements no afectan stock.
[ ] Posted movements no se editan destructivamente.
[ ] Adjustments lifecycle funciona.
[ ] Transfers lifecycle funciona.
[ ] Transfers crean movement out/in.
[ ] Consumptions lifecycle funciona.
[ ] Consumptions validan Maintenance Work Orders.
[ ] Documents usan Secure Document Storage.
[ ] Alerts se consultan y gestionan.
[ ] Reports funcionan tenant-scoped.
[ ] Exports devuelven secureDocumentId.
[ ] No se expone storageKey.
[ ] No se acepta base64.
[ ] No se aceptan floats como cantidades/costos.
[ ] No se acepta tenantId desde cliente.
[ ] No se aceptan actor fields.
[ ] Inventory no crea Payment.
[ ] Inventory no crea SupplierPaymentOrder.
[ ] Inventory no crea JournalEntry.
[ ] Inventory no confirma Bank Reconciliation.
[ ] WordPress público no tiene acceso.
```

---

# 40. No aceptación

No se acepta el contrato si:

```text id="tv54i9"
- define endpoints públicos de inventario;
- define endpoints /me de inventario en MVP;
- permite tenantId en body;
- permite actor fields en body;
- permite editar quantityOnHand desde API;
- permite editar quantityAvailable desde API;
- permite enviar totalCostAmount como fuente de verdad;
- permite storageKey;
- permite signedUrl persistente;
- permite base64;
- permite raw file payload;
- usa number/float para cantidades o costos;
- no valida item tenant-scoped;
- no valida location tenant-scoped;
- no valida supplier tenant-scoped;
- no valida maintenanceWorkOrder tenant-scoped;
- permite salida mayor que stock disponible;
- permite transferencia a la misma ubicación;
- permite movimiento posted editable destructivamente;
- crea Payment;
- crea SupplierPaymentOrder;
- marca paid;
- inicia transferencia bancaria;
- crea JournalEntry;
- confirma Bank Reconciliation;
- permite acceso desde WordPress público;
- omite auditoría crítica;
- omite OpenAPI security extensions.
```

---

# 41. Resultado esperado

Al implementar este contrato, el módulo `023-inventory-basic` dispondrá de una API REST privada, segura, tenant-scoped y consistente para controlar inventario operativo básico dentro de RESIDENT Core.

Resultado esperado:

```text id="r2h7is"
tenant inventory API definida
categories API definida
units API definida
items API definida
locations API definida
stock API definida
movements API definida
adjustments API definida
transfers API definida
consumptions API definida
documents API definida
alerts API definida
reports API definida
exports API definida
permissions definidos
DTOs definidos
errors definidos
OpenAPI extensions definidas
Decimal quantities definido
Decimal costs definido
stock movement-driven definido
SDS boundary definido
Supplier Payments boundary definido
Maintenance Work Orders boundary definido
no public endpoints
no /me endpoints
no WordPress access
no direct payments
no SupplierPaymentOrder
no direct accounting
no Bank Reconciliation
no storageKey exposure
audit definido
observability definida
```

---

# 42. Expediente actualizado

```text id="ew7wqf"
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
│   │       └── api-contract.md
```
