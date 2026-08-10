# Data Model — 023 Inventory Basic

## 1. Información del documento

| Campo                  | Valor                                                                                                                                         |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto               | RESIDENT Core                                                                                                                                 |
| Spec ID                | 023                                                                                                                                           |
| Módulo                 | Inventory Basic                                                                                                                               |
| Documento              | Data Model                                                                                                                                    |
| Ruta                   | `docs/specs/023-inventory-basic/data-model.md`                                                                                                |
| Versión                | 0.1                                                                                                                                           |
| Estado                 | needs-review                                                                                                                                  |
| Fecha                  | 2026-07-23                                                                                                                                    |
| Documento base         | `docs/specs/023-inventory-basic/spec.md`                                                                                                      |
| Plan técnico           | `docs/specs/023-inventory-basic/plan.md`                                                                                                      |
| Base de datos objetivo | PostgreSQL                                                                                                                                    |
| ORM objetivo           | Prisma                                                                                                                                        |
| Estrategia multitenant | Shared database / shared schema / tenant_id                                                                                                   |
| Naturaleza             | Tenant-scoped / Operational / Stock-controlled / Movement-driven / Maintenance-aware / Supplier-aware / Cost-aware / Audit-heavy / Non-public |

---

## 2. Propósito

Este documento define el modelo de datos del módulo `023-inventory-basic`.

El modelo cubre categorías, unidades de medida, ítems, ubicaciones de almacenamiento, saldos, movimientos, entradas, salidas, ajustes, transferencias, consumos vinculados a mantenimiento, documentos, alertas de stock, reportes exportados y trazabilidad operativa.

Regla central del modelo:

```text id="od33rd"
Todo dato de Inventory Basic debe pertenecer a un tenant, preservar trazabilidad por movimiento, impedir stock negativo por defecto, usar Decimal para cantidades y costos, impedir modificación destructiva de movimientos posteados, validar referencias tenant-scoped, almacenar documentos mediante Secure Document Storage, no exponer storageKey, no crear pagos, no crear SupplierPaymentOrder, no crear JournalEntry, no confirmar conciliaciones, no exponer endpoints públicos, no exponer endpoints /me y no permitir acceso desde WordPress público.
```

---

## 3. Principios de modelado

### 3.1. Tenant isolation obligatorio

Todas las tablas operativas incluyen:

```text id="a4oe63"
tenant_id
```

Ninguna entidad tenant-scoped debe consultarse únicamente por `id`.

Patrón obligatorio:

```typescript id="f9x2kt"
await prisma.inventoryItem.findFirst({
  where: {
    id: itemId,
    tenantId: currentTenant.id,
    archivedAt: null
  }
});
```

Patrón prohibido:

```typescript id="sfwsdv"
await prisma.inventoryItem.findUnique({
  where: { id: itemId }
});
```

---

### 3.2. Movimiento como fuente de verdad

El stock no debe ser una cifra aislada sin explicación.

La fuente de verdad operacional es:

```text id="agrip3"
inventory_movements
```

`inventory_stock_balances` funciona como snapshot de lectura y performance.

Regla:

```text id="qp9ifk"
Todo cambio de stock debe poder reconstruirse desde movimientos posted.
```

---

### 3.3. Saldos como snapshot recalculable

`InventoryStockBalance` persiste el saldo actual para consultas rápidas.

Pero debe ser recalculable desde:

```text id="z0fldw"
inventory_movements
WHERE status = 'posted'
```

No se permite que el cliente actualice directamente:

```text id="onrwug"
quantityOnHand
quantityReserved
quantityAvailable
averageUnitCostAmount
```

---

### 3.4. Cantidades y costos con Decimal

Todas las cantidades y costos se modelan con `Decimal`.

Cantidades:

```text id="fo44ed"
Decimal(14,4)
```

Costos:

```text id="vkj8eg"
Decimal(12,2)
```

API:

```json id="dphxfy"
{
  "quantity": "10.5000",
  "unitCostAmount": "2.35",
  "totalCostAmount": "24.68"
}
```

Prohibido usar `float`, `double` o `number` como fuente de verdad.

---

### 3.5. Movimientos posteados son inmutables

Un movimiento `posted` no se edita destructivamente.

Para corregir un movimiento posted se debe usar:

```text id="jfpr17"
reverse
correction
adjustment
```

Regla:

```text id="wne6ja"
Un error operativo se corrige con un nuevo movimiento auditable, no sobrescribiendo el movimiento original.
```

---

### 3.6. Inventario no es contabilidad

El módulo puede tener costos referenciales.

Pero no debe crear:

```text id="mupwdx"
JournalEntry
JournalEntryLine
AccountingPeriod changes
AccountingBalanceSnapshot
```

La valorización de inventario MVP es referencial.

---

### 3.7. Inventario no es pagos

El módulo puede referenciar proveedor o cuenta por pagar.

Pero no debe crear:

```text id="uum0rv"
Payment
PaymentAllocation
SupplierPaymentOrder
BankTransferInstruction
OpenBankingPaymentInitiation
```

---

### 3.8. Documentos mediante Secure Document Storage

El modelo solo guarda:

```text id="pqzosx"
secure_document_id
```

Prohibido guardar:

```text id="q2b9cr"
storageKey
signedUrl persistente
base64
raw file payload
binary payload
```

---

### 3.9. No `/me` en MVP

Inventory Basic no tiene endpoints ni modelo de visibilidad para residentes en MVP.

Por tanto, no se modelan permisos propios de residentes ni visibilidad `requesterVisible`.

---

## 4. Tablas del módulo

Tablas MVP:

```text id="xivjfs"
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

---

## 5. Dependencias externas del modelo

| Módulo                        | Tabla / entidad referenciada                              | Uso                                         |
| ----------------------------- | --------------------------------------------------------- | ------------------------------------------- |
| `001-tenants`                 | `tenants`                                                 | Tenant owner de todos los registros         |
| `002-users-roles`             | `user_profiles`                                           | Actores, responsables, aprobadores          |
| `016-secure-document-storage` | `secure_documents`                                        | Documentos, evidencias y exports            |
| `021-supplier-payments`       | `suppliers`, `supplier_payables`                          | Referencias de proveedor y cuenta por pagar |
| `022-maintenance-work-orders` | `maintenance_work_orders`, `maintenance_work_order_tasks` | Consumo de materiales                       |
| `007-audit`                   | `audit_logs`                                              | Auditoría                                   |
| `008-basic-reports`           | report registry                                           | Reportes y exportación                      |
| `020-accounting-ledger`       | Ninguna relación directa MVP                              | Prohibido crear contabilidad directa        |
| `017-bank-reconciliation`     | Ninguna relación directa MVP                              | Prohibido confirmar conciliación            |

---

## 6. Estrategia de referencias externas

Para mantener separación modular y preparar futura extracción a microservicios, las referencias hacia otros módulos se almacenan como UUID, pero se validan mediante puertos de aplicación.

Referencias externas sin foreign key física obligatoria:

```text id="tsqbcx"
supplier_id
supplier_payable_id
maintenance_work_order_id
maintenance_task_id
secure_document_id
responsible_user_id
created_by
posted_by
approved_by
rejected_by
cancelled_by
archived_by
```

Regla:

```text id="smrhgj"
La integridad con módulos externos se valida en servicios de dominio, no por acceso directo cross-module no controlado.
```

---

# 7. Entidades

---

## 7.1. `inventory_categories`

### Propósito

Catálogo tenant-scoped para clasificar ítems de inventario.

Ejemplos:

```text id="n6qzuk"
CLEANING
PLUMBING
ELECTRICAL
GARDENING
SECURITY
PAINTING
MINOR_TOOLS
SPARE_PARTS
OFFICE
SAFETY
OTHER
```

### Campos

| Campo            |         Tipo | Obligatorio | Descripción              |
| ---------------- | -----------: | ----------: | ------------------------ |
| `id`             |         UUID |          Sí | Identificador            |
| `tenant_id`      |         UUID |          Sí | Tenant owner             |
| `category_code`  |  varchar(50) |          Sí | Código único por tenant  |
| `category_name`  | varchar(150) |          Sí | Nombre visible           |
| `description`    |         text |          No | Descripción              |
| `status`         |         enum |          Sí | active/inactive/archived |
| `created_by`     |         UUID |          Sí | Actor creador            |
| `updated_by`     |         UUID |          No | Último actor modificador |
| `archived_by`    |         UUID |          No | Actor que archivó        |
| `created_at`     |  timestamptz |          Sí | Fecha creación           |
| `updated_at`     |  timestamptz |          Sí | Fecha actualización      |
| `archived_at`    |  timestamptz |          No | Archivo lógico           |
| `archive_reason` |         text |          No | Razón de archivo         |
| `metadata`       |        jsonb |          No | Metadata sanitizada      |

### Reglas

```text id="xb9ht5"
- category_code es único por tenant entre categorías no archivadas.
- archived no puede usarse para nuevos ítems.
- inactive conserva historial, pero no debe ofrecerse por defecto.
- no se elimina físicamente si tiene ítems relacionados.
```

---

## 7.2. `inventory_units`

### Propósito

Unidades de medida tenant-scoped.

Ejemplos:

```text id="wk8yv9"
UNIT
METER
LITER
GALLON
KILOGRAM
PACKAGE
BOX
ROLL
PAIR
SET
BOTTLE
BAG
```

### Campos

| Campo               |         Tipo | Obligatorio | Descripción                  |
| ------------------- | -----------: | ----------: | ---------------------------- |
| `id`                |         UUID |          Sí | Identificador                |
| `tenant_id`         |         UUID |          Sí | Tenant owner                 |
| `unit_code`         |  varchar(50) |          Sí | Código único por tenant      |
| `unit_name`         | varchar(120) |          Sí | Nombre                       |
| `unit_symbol`       |  varchar(20) |          No | Símbolo visible              |
| `allows_decimals`   |      boolean |          Sí | Permite cantidades decimales |
| `decimal_precision` |          int |          Sí | Precisión máxima permitida   |
| `status`            |         enum |          Sí | active/inactive/archived     |
| `created_by`        |         UUID |          Sí | Actor creador                |
| `updated_by`        |         UUID |          No | Último actor                 |
| `archived_by`       |         UUID |          No | Actor archivo                |
| `created_at`        |  timestamptz |          Sí | Fecha creación               |
| `updated_at`        |  timestamptz |          Sí | Fecha actualización          |
| `archived_at`       |  timestamptz |          No | Archivo lógico               |
| `archive_reason`    |         text |          No | Razón archivo                |
| `metadata`          |        jsonb |          No | Metadata sanitizada          |

### Reglas

```text id="g8mhtc"
- unit_code es único por tenant entre unidades no archivadas.
- decimal_precision debe estar entre 0 y 4 en MVP.
- si allows_decimals=false, decimal_precision debe ser 0.
- archived no puede usarse en nuevos ítems.
```

---

## 7.3. `inventory_items`

### Propósito

Ítems controlados por inventario.

Ejemplos:

```text id="q7dlv6"
válvula 1/2
foco LED
escoba industrial
pintura blanca
cloro
candado
manguera
repuesto de bomba
guantes de seguridad
papel de oficina
```

### Campos

| Campo                         |          Tipo | Obligatorio | Descripción                    |
| ----------------------------- | ------------: | ----------: | ------------------------------ |
| `id`                          |          UUID |          Sí | Identificador                  |
| `tenant_id`                   |          UUID |          Sí | Tenant owner                   |
| `item_code`                   |   varchar(80) |          Sí | Código único por tenant        |
| `item_name`                   |  varchar(180) |          Sí | Nombre del ítem                |
| `description`                 |          text |          No | Descripción                    |
| `category_id`                 |          UUID |          Sí | Categoría                      |
| `unit_id`                     |          UUID |          Sí | Unidad de medida               |
| `item_type`                   |          enum |          Sí | Tipo de ítem                   |
| `stock_tracking_mode`         |          enum |          Sí | Modo de control                |
| `default_storage_location_id` |          UUID |          No | Ubicación por defecto          |
| `minimum_stock_quantity`      | Decimal(14,4) |          No | Stock mínimo                   |
| `reorder_point_quantity`      | Decimal(14,4) |          No | Punto de reposición            |
| `reference_unit_cost_amount`  | Decimal(12,2) |          No | Costo unitario referencial     |
| `currency`                    |          enum |          Sí | USD en MVP                     |
| `preferred_supplier_id`       |          UUID |          No | Proveedor preferido            |
| `status`                      |          enum |          Sí | draft/active/inactive/archived |
| `created_by`                  |          UUID |          Sí | Actor creador                  |
| `updated_by`                  |          UUID |          No | Actor actualizador             |
| `archived_by`                 |          UUID |          No | Actor archivo                  |
| `created_at`                  |   timestamptz |          Sí | Fecha creación                 |
| `updated_at`                  |   timestamptz |          Sí | Fecha actualización            |
| `activated_at`                |   timestamptz |          No | Activación                     |
| `activated_by`                |          UUID |          No | Actor activación               |
| `deactivated_at`              |   timestamptz |          No | Inactivación                   |
| `deactivated_by`              |          UUID |          No | Actor inactivación             |
| `archived_at`                 |   timestamptz |          No | Archivo lógico                 |
| `archive_reason`              |          text |          No | Razón archivo                  |
| `metadata`                    |         jsonb |          No | Metadata sanitizada            |

### Reglas

```text id="ti62dp"
- item_code es único por tenant entre ítems no archivados.
- category_id debe pertenecer al mismo tenant.
- unit_id debe pertenecer al mismo tenant.
- default_storage_location_id debe pertenecer al mismo tenant.
- preferred_supplier_id debe validarse contra Supplier Payments.
- minimum_stock_quantity >= 0.
- reorder_point_quantity >= 0.
- reference_unit_cost_amount >= 0.
- currency = USD en MVP.
- active puede recibir movimientos.
- archived no puede recibir movimientos.
```

---

## 7.4. `inventory_storage_locations`

### Propósito

Ubicaciones donde se almacenan ítems.

Ejemplos:

```text id="eo18ia"
MAIN_WAREHOUSE
GUARDHOUSE
PUMP_ROOM
ADMIN_OFFICE
MAINTENANCE_ROOM
TECHNICAL_CABINET
TEMPORARY_STORAGE
```

### Campos

| Campo                 |         Tipo | Obligatorio | Descripción              |
| --------------------- | -----------: | ----------: | ------------------------ |
| `id`                  |         UUID |          Sí | Identificador            |
| `tenant_id`           |         UUID |          Sí | Tenant owner             |
| `location_code`       |  varchar(80) |          Sí | Código único por tenant  |
| `location_name`       | varchar(180) |          Sí | Nombre visible           |
| `description`         |         text |          No | Descripción              |
| `location_type`       |         enum |          Sí | Tipo de ubicación        |
| `responsible_user_id` |         UUID |          No | Responsable              |
| `status`              |         enum |          Sí | active/inactive/archived |
| `created_by`          |         UUID |          Sí | Actor creador            |
| `updated_by`          |         UUID |          No | Último actor             |
| `archived_by`         |         UUID |          No | Actor archivo            |
| `created_at`          |  timestamptz |          Sí | Fecha creación           |
| `updated_at`          |  timestamptz |          Sí | Fecha actualización      |
| `archived_at`         |  timestamptz |          No | Archivo lógico           |
| `archive_reason`      |         text |          No | Razón archivo            |
| `metadata`            |        jsonb |          No | Metadata sanitizada      |

### Reglas

```text id="rqaq3v"
- location_code es único por tenant entre ubicaciones no archivadas.
- responsible_user_id debe tener membership activo en el tenant.
- active puede recibir movimientos.
- inactive no debe recibir nuevos movimientos salvo ajuste autorizado.
- archived no puede recibir movimientos.
```

---

## 7.5. `inventory_stock_balances`

### Propósito

Snapshot del saldo actual por ítem y ubicación.

### Campos

| Campo                      |          Tipo | Obligatorio | Descripción                |
| -------------------------- | ------------: | ----------: | -------------------------- |
| `id`                       |          UUID |          Sí | Identificador              |
| `tenant_id`                |          UUID |          Sí | Tenant owner               |
| `item_id`                  |          UUID |          Sí | Ítem                       |
| `storage_location_id`      |          UUID |          Sí | Ubicación                  |
| `quantity_on_hand`         | Decimal(14,4) |          Sí | Cantidad física/registrada |
| `quantity_reserved`        | Decimal(14,4) |          Sí | Cantidad reservada         |
| `quantity_available`       | Decimal(14,4) |          Sí | Disponible                 |
| `average_unit_cost_amount` | Decimal(12,2) |          No | Costo promedio referencial |
| `currency`                 |          enum |          Sí | USD                        |
| `last_movement_id`         |          UUID |          No | Último movimiento aplicado |
| `last_movement_at`         |   timestamptz |          No | Fecha último movimiento    |
| `created_at`               |   timestamptz |          Sí | Creación                   |
| `updated_at`               |   timestamptz |          Sí | Actualización              |
| `metadata`                 |         jsonb |          No | Metadata sanitizada        |

### Reglas

```text id="ytqa37"
- Debe ser único por tenant_id + item_id + storage_location_id.
- quantity_on_hand >= 0 salvo política explícita.
- quantity_reserved >= 0.
- quantity_reserved <= quantity_on_hand.
- quantity_available = quantity_on_hand - quantity_reserved.
- Solo el sistema actualiza saldos.
- Debe ser reconstruible desde movimientos posted.
```

---

## 7.6. `inventory_movements`

### Propósito

Fuente de verdad de variaciones de stock.

### Campos

| Campo                        |          Tipo | Obligatorio | Descripción                              |
| ---------------------------- | ------------: | ----------: | ---------------------------------------- |
| `id`                         |          UUID |          Sí | Identificador                            |
| `tenant_id`                  |          UUID |          Sí | Tenant owner                             |
| `movement_number`            |   varchar(60) |          Sí | Número único por tenant                  |
| `item_id`                    |          UUID |          Sí | Ítem                                     |
| `storage_location_id`        |          UUID |          Sí | Ubicación origen/principal               |
| `target_storage_location_id` |          UUID |          No | Ubicación destino para transferencias    |
| `movement_type`              |          enum |          Sí | Tipo de movimiento                       |
| `movement_direction`         |          enum |          Sí | in/out/neutral                           |
| `quantity`                   | Decimal(14,4) |          Sí | Cantidad                                 |
| `unit_cost_amount`           | Decimal(12,2) |          No | Costo unitario referencial               |
| `total_cost_amount`          | Decimal(12,2) |          No | Total calculado                          |
| `currency`                   |          enum |          Sí | USD                                      |
| `reason`                     |          text |          No | Justificación                            |
| `reference_type`             |          enum |          Sí | Tipo de referencia                       |
| `reference_id`               |          UUID |          No | ID genérico de referencia                |
| `supplier_id`                |          UUID |          No | Proveedor referencial                    |
| `supplier_payable_id`        |          UUID |          No | Cuenta por pagar referencial             |
| `maintenance_work_order_id`  |          UUID |          No | Orden de mantenimiento                   |
| `maintenance_task_id`        |          UUID |          No | Tarea de mantenimiento                   |
| `secure_document_id`         |          UUID |          No | Documento soporte                        |
| `reversed_movement_id`       |          UUID |          No | Movimiento original reversado            |
| `reversal_movement_id`       |          UUID |          No | Movimiento de reverso                    |
| `status`                     |          enum |          Sí | draft/posted/cancelled/reversed/archived |
| `created_by`                 |          UUID |          Sí | Actor creador                            |
| `posted_by`                  |          UUID |          No | Actor posteo                             |
| `cancelled_by`               |          UUID |          No | Actor cancelación                        |
| `reversed_by`                |          UUID |          No | Actor reverso                            |
| `archived_by`                |          UUID |          No | Actor archivo                            |
| `created_at`                 |   timestamptz |          Sí | Creación                                 |
| `updated_at`                 |   timestamptz |          Sí | Actualización                            |
| `posted_at`                  |   timestamptz |          No | Fecha posteo                             |
| `cancelled_at`               |   timestamptz |          No | Fecha cancelación                        |
| `reversed_at`                |   timestamptz |          No | Fecha reverso                            |
| `archived_at`                |   timestamptz |          No | Fecha archivo                            |
| `cancel_reason`              |          text |          No | Razón cancelación                        |
| `reverse_reason`             |          text |          No | Razón reverso                            |
| `archive_reason`             |          text |          No | Razón archivo                            |
| `metadata`                   |         jsonb |          No | Metadata sanitizada                      |

### Reglas

```text id="kov23p"
- movement_number es único por tenant.
- quantity > 0.
- unit_cost_amount >= 0 si existe.
- total_cost_amount se calcula server-side.
- movement_direction se deriva de movement_type.
- posted afecta stock.
- draft no afecta stock.
- cancelled no afecta stock.
- reversed conserva trazabilidad.
- posted no se edita destructivamente.
- issue, maintenanceConsumption, transferOut y adjustmentDecrease validan stock disponible.
- receipt, openingBalance, transferIn, adjustmentIncrease y returnToStock incrementan stock.
```

---

## 7.7. `inventory_stock_adjustments`

### Propósito

Ajustes formales de stock con justificación y posible aprobación.

### Campos

| Campo                 |          Tipo | Obligatorio | Descripción                                                 |
| --------------------- | ------------: | ----------: | ----------------------------------------------------------- |
| `id`                  |          UUID |          Sí | Identificador                                               |
| `tenant_id`           |          UUID |          Sí | Tenant owner                                                |
| `adjustment_number`   |   varchar(60) |          Sí | Número único por tenant                                     |
| `item_id`             |          UUID |          Sí | Ítem                                                        |
| `storage_location_id` |          UUID |          Sí | Ubicación                                                   |
| `adjustment_type`     |          enum |          Sí | Tipo de ajuste                                              |
| `quantity`            | Decimal(14,4) |          Sí | Cantidad                                                    |
| `reason`              |          text |          Sí | Justificación                                               |
| `secure_document_id`  |          UUID |          No | Documento soporte                                           |
| `movement_id`         |          UUID |          No | Movimiento generado al postear                              |
| `status`              |          enum |          Sí | draft/submitted/approved/rejected/posted/cancelled/archived |
| `created_by`          |          UUID |          Sí | Actor creador                                               |
| `submitted_by`        |          UUID |          No | Actor envío                                                 |
| `approved_by`         |          UUID |          No | Actor aprobación                                            |
| `rejected_by`         |          UUID |          No | Actor rechazo                                               |
| `posted_by`           |          UUID |          No | Actor posteo                                                |
| `cancelled_by`        |          UUID |          No | Actor cancelación                                           |
| `archived_by`         |          UUID |          No | Actor archivo                                               |
| `created_at`          |   timestamptz |          Sí | Creación                                                    |
| `updated_at`          |   timestamptz |          Sí | Actualización                                               |
| `submitted_at`        |   timestamptz |          No | Envío                                                       |
| `approved_at`         |   timestamptz |          No | Aprobación                                                  |
| `rejected_at`         |   timestamptz |          No | Rechazo                                                     |
| `posted_at`           |   timestamptz |          No | Posteo                                                      |
| `cancelled_at`        |   timestamptz |          No | Cancelación                                                 |
| `archived_at`         |   timestamptz |          No | Archivo                                                     |
| `reject_reason`       |          text |          No | Razón rechazo                                               |
| `cancel_reason`       |          text |          No | Razón cancelación                                           |
| `archive_reason`      |          text |          No | Razón archivo                                               |
| `metadata`            |         jsonb |          No | Metadata sanitizada                                         |

### Reglas

```text id="kl05tk"
- adjustment_number es único por tenant.
- quantity > 0.
- reason es obligatorio.
- adjustmentDecrease valida stock disponible.
- posted debe tener movement_id.
- rejected requiere reject_reason.
- cancelled requiere cancel_reason.
- posted no se edita destructivamente.
```

---

## 7.8. `inventory_transfers`

### Propósito

Transferencias entre ubicaciones del mismo tenant.

### Campos

| Campo                        |          Tipo | Obligatorio | Descripción                              |
| ---------------------------- | ------------: | ----------: | ---------------------------------------- |
| `id`                         |          UUID |          Sí | Identificador                            |
| `tenant_id`                  |          UUID |          Sí | Tenant owner                             |
| `transfer_number`            |   varchar(60) |          Sí | Número único por tenant                  |
| `item_id`                    |          UUID |          Sí | Ítem                                     |
| `source_storage_location_id` |          UUID |          Sí | Ubicación origen                         |
| `target_storage_location_id` |          UUID |          Sí | Ubicación destino                        |
| `quantity`                   | Decimal(14,4) |          Sí | Cantidad                                 |
| `reason`                     |          text |          Sí | Justificación                            |
| `out_movement_id`            |          UUID |          No | Movimiento salida                        |
| `in_movement_id`             |          UUID |          No | Movimiento entrada                       |
| `status`                     |          enum |          Sí | draft/posted/cancelled/reversed/archived |
| `created_by`                 |          UUID |          Sí | Actor creador                            |
| `posted_by`                  |          UUID |          No | Actor posteo                             |
| `cancelled_by`               |          UUID |          No | Actor cancelación                        |
| `reversed_by`                |          UUID |          No | Actor reverso                            |
| `archived_by`                |          UUID |          No | Actor archivo                            |
| `created_at`                 |   timestamptz |          Sí | Creación                                 |
| `updated_at`                 |   timestamptz |          Sí | Actualización                            |
| `posted_at`                  |   timestamptz |          No | Posteo                                   |
| `cancelled_at`               |   timestamptz |          No | Cancelación                              |
| `reversed_at`                |   timestamptz |          No | Reverso                                  |
| `archived_at`                |   timestamptz |          No | Archivo                                  |
| `cancel_reason`              |          text |          No | Razón cancelación                        |
| `reverse_reason`             |          text |          No | Razón reverso                            |
| `archive_reason`             |          text |          No | Razón archivo                            |
| `metadata`                   |         jsonb |          No | Metadata sanitizada                      |

### Reglas

```text id="icmr9m"
- transfer_number es único por tenant.
- source_storage_location_id != target_storage_location_id.
- ambas ubicaciones deben pertenecer al tenant.
- quantity > 0.
- posted crea out_movement_id e in_movement_id.
- transferencia no puede dejar stock negativo en origen.
- posted no se edita destructivamente.
```

---

## 7.9. `inventory_consumptions`

### Propósito

Consumos de inventario asociados a órdenes de mantenimiento.

### Campos

| Campo                       |          Tipo | Obligatorio | Descripción                              |
| --------------------------- | ------------: | ----------: | ---------------------------------------- |
| `id`                        |          UUID |          Sí | Identificador                            |
| `tenant_id`                 |          UUID |          Sí | Tenant owner                             |
| `consumption_number`        |   varchar(60) |          Sí | Número único por tenant                  |
| `item_id`                   |          UUID |          Sí | Ítem                                     |
| `storage_location_id`       |          UUID |          Sí | Ubicación                                |
| `quantity`                  | Decimal(14,4) |          Sí | Cantidad consumida                       |
| `maintenance_work_order_id` |          UUID |          Sí | Orden de mantenimiento                   |
| `maintenance_task_id`       |          UUID |          No | Tarea de mantenimiento                   |
| `consumed_by_user_id`       |          UUID |          No | Usuario que consumió                     |
| `reason`                    |          text |          No | Justificación                            |
| `movement_id`               |          UUID |          No | Movimiento generado                      |
| `status`                    |          enum |          Sí | draft/posted/cancelled/reversed/archived |
| `created_by`                |          UUID |          Sí | Actor creador                            |
| `posted_by`                 |          UUID |          No | Actor posteo                             |
| `cancelled_by`              |          UUID |          No | Actor cancelación                        |
| `reversed_by`               |          UUID |          No | Actor reverso                            |
| `archived_by`               |          UUID |          No | Actor archivo                            |
| `created_at`                |   timestamptz |          Sí | Creación                                 |
| `updated_at`                |   timestamptz |          Sí | Actualización                            |
| `posted_at`                 |   timestamptz |          No | Posteo                                   |
| `cancelled_at`              |   timestamptz |          No | Cancelación                              |
| `reversed_at`               |   timestamptz |          No | Reverso                                  |
| `archived_at`               |   timestamptz |          No | Archivo                                  |
| `cancel_reason`             |          text |          No | Razón cancelación                        |
| `reverse_reason`            |          text |          No | Razón reverso                            |
| `archive_reason`            |          text |          No | Razón archivo                            |
| `metadata`                  |         jsonb |          No | Metadata sanitizada                      |

### Reglas

```text id="h5woru"
- consumption_number es único por tenant.
- maintenance_work_order_id debe pertenecer al tenant.
- maintenance_task_id debe pertenecer a la orden si existe.
- quantity > 0.
- posted crea movement_id de tipo maintenanceConsumption.
- posted disminuye stock.
- no modifica estados de Maintenance Work Orders.
```

---

## 7.10. `inventory_documents`

### Propósito

Relación entre entidades de inventario y documentos en Secure Document Storage.

### Campos

| Campo                |        Tipo | Obligatorio | Descripción               |
| -------------------- | ----------: | ----------: | ------------------------- |
| `id`                 |        UUID |          Sí | Identificador             |
| `tenant_id`          |        UUID |          Sí | Tenant owner              |
| `entity_type`        |        enum |          Sí | Tipo de entidad vinculada |
| `entity_id`          |        UUID |          Sí | ID de entidad             |
| `secure_document_id` |        UUID |          Sí | Documento seguro          |
| `document_type`      |        enum |          Sí | Tipo de documento         |
| `description`        |        text |          No | Descripción               |
| `visibility`         |        enum |          Sí | administrative en MVP     |
| `status`             |        enum |          Sí | active/archived           |
| `created_by`         |        UUID |          Sí | Actor creador             |
| `archived_by`        |        UUID |          No | Actor archivo             |
| `created_at`         | timestamptz |          Sí | Creación                  |
| `archived_at`        | timestamptz |          No | Archivo                   |
| `archive_reason`     |        text |          No | Razón archivo             |
| `metadata`           |       jsonb |          No | Metadata sanitizada       |

### Reglas

```text id="rb07ve"
- secure_document_id debe pertenecer al tenant.
- entity_id debe pertenecer al tenant según entity_type.
- no se almacena storageKey.
- no se almacena signedUrl persistente.
- archived no se lista por defecto.
```

---

## 7.11. `inventory_alerts`

### Propósito

Alertas de stock e intentos operativos relevantes.

### Campos

| Campo                 |          Tipo | Obligatorio | Descripción                                   |
| --------------------- | ------------: | ----------: | --------------------------------------------- |
| `id`                  |          UUID |          Sí | Identificador                                 |
| `tenant_id`           |          UUID |          Sí | Tenant owner                                  |
| `item_id`             |          UUID |          Sí | Ítem                                          |
| `storage_location_id` |          UUID |          No | Ubicación específica                          |
| `alert_type`          |          enum |          Sí | Tipo de alerta                                |
| `severity`            |          enum |          Sí | Severidad                                     |
| `status`              |          enum |          Sí | open/acknowledged/resolved/dismissed/archived |
| `current_quantity`    | Decimal(14,4) |          No | Cantidad actual                               |
| `threshold_quantity`  | Decimal(14,4) |          No | Umbral                                        |
| `message`             |          text |          No | Mensaje seguro                                |
| `created_at`          |   timestamptz |          Sí | Creación                                      |
| `acknowledged_by`     |          UUID |          No | Actor reconocimiento                          |
| `acknowledged_at`     |   timestamptz |          No | Fecha reconocimiento                          |
| `resolved_by`         |          UUID |          No | Actor resolución                              |
| `resolved_at`         |   timestamptz |          No | Fecha resolución                              |
| `dismissed_by`        |          UUID |          No | Actor descarte                                |
| `dismissed_at`        |   timestamptz |          No | Fecha descarte                                |
| `archived_by`         |          UUID |          No | Actor archivo                                 |
| `archived_at`         |   timestamptz |          No | Archivo                                       |
| `resolution_reason`   |          text |          No | Razón resolución                              |
| `dismiss_reason`      |          text |          No | Razón descarte                                |
| `archive_reason`      |          text |          No | Razón archivo                                 |
| `metadata`            |         jsonb |          No | Metadata sanitizada                           |

### Reglas

```text id="a0wkn2"
- lowStock se genera cuando quantityAvailable <= minimumStockQuantity.
- outOfStock se genera cuando quantityAvailable = 0.
- acknowledged no elimina condición de bajo stock.
- resolved requiere condición corregida o razón administrativa.
- dismissed requiere razón.
```

---

## 7.12. `inventory_report_exports`

### Propósito

Registro de exportaciones de reportes de inventario.

### Campos

| Campo                |        Tipo | Obligatorio | Descripción                                    |
| -------------------- | ----------: | ----------: | ---------------------------------------------- |
| `id`                 |        UUID |          Sí | Identificador                                  |
| `tenant_id`          |        UUID |          Sí | Tenant owner                                   |
| `report_type`        |        enum |          Sí | Tipo de reporte                                |
| `format`             |        enum |          Sí | csv/xlsx/pdf                                   |
| `filters`            |       jsonb |          Sí | Filtros sanitizados                            |
| `secure_document_id` |        UUID |          No | Documento generado                             |
| `status`             |        enum |          Sí | requested/processing/completed/failed/archived |
| `requested_by`       |        UUID |          Sí | Actor solicitante                              |
| `created_at`         | timestamptz |          Sí | Solicitud                                      |
| `completed_at`       | timestamptz |          No | Finalización                                   |
| `failed_at`          | timestamptz |          No | Fallo                                          |
| `archived_at`        | timestamptz |          No | Archivo                                        |
| `failure_reason`     |        text |          No | Razón de fallo sanitizada                      |
| `metadata`           |       jsonb |          No | Metadata sanitizada                            |

### Reglas

```text id="edyhok"
- export completed debe tener secure_document_id.
- secure_document_id debe pertenecer al tenant.
- filters no debe contener datos sensibles innecesarios.
- no se devuelve storageKey.
```

---

# 8. Enums

## 8.1. Catálogos

```text id="kwv1gh"
InventoryCatalogStatus:
- active
- inactive
- archived
```

---

## 8.2. Ítems

```text id="hojqot"
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

## 8.3. Ubicaciones

```text id="io9sp2"
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

## 8.4. Movimientos

```text id="e0r9uf"
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

## 8.5. Ajustes

```text id="cvxuui"
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
```

---

## 8.6. Transferencias y consumos

```text id="kyh8oe"
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

## 8.7. Documentos

```text id="f9333s"
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

InventoryDocumentStatus:
- active
- archived
```

---

## 8.8. Alertas y reportes

```text id="ly815c"
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

InventoryReportExportStatus:
- requested
- processing
- completed
- failed
- archived
```

---

## 8.9. Moneda

```text id="tykl17"
Currency:
- USD
```

---

# 9. Prisma schema preliminar — Enums

> Este bloque es una guía inicial. El schema final puede ajustarse durante `api-contract.md`, `test-plan.md`, `tasks.md` y la implementación real.

```prisma id="f6l27r"
enum InventoryCatalogStatus {
  ACTIVE   @map("active")
  INACTIVE @map("inactive")
  ARCHIVED @map("archived")
}

enum InventoryItemType {
  CONSUMABLE      @map("consumable")
  SPARE_PART      @map("sparePart")
  MINOR_TOOL      @map("minorTool")
  SUPPLY          @map("supply")
  SAFETY_EQUIPMENT @map("safetyEquipment")
  CLEANING_SUPPLY @map("cleaningSupply")
  OFFICE_SUPPLY   @map("officeSupply")
  OTHER           @map("other")
}

enum InventoryStockTrackingMode {
  QUANTITY_ONLY         @map("quantityOnly")
  QUANTITY_AND_COST     @map("quantityAndCost")
  NON_TRACKED_REFERENCE @map("nonTrackedReference")
}

enum InventoryItemStatus {
  DRAFT    @map("draft")
  ACTIVE   @map("active")
  INACTIVE @map("inactive")
  ARCHIVED @map("archived")
}

enum InventoryLocationType {
  WAREHOUSE         @map("warehouse")
  MAINTENANCE_ROOM  @map("maintenanceRoom")
  GUARDHOUSE        @map("guardhouse")
  OFFICE            @map("office")
  TECHNICAL_CABINET @map("technicalCabinet")
  TEMPORARY         @map("temporary")
  OTHER             @map("other")
}

enum InventoryLocationStatus {
  ACTIVE   @map("active")
  INACTIVE @map("inactive")
  ARCHIVED @map("archived")
}

enum InventoryMovementType {
  OPENING_BALANCE         @map("openingBalance")
  RECEIPT                 @map("receipt")
  ISSUE                   @map("issue")
  MAINTENANCE_CONSUMPTION @map("maintenanceConsumption")
  ADJUSTMENT_INCREASE     @map("adjustmentIncrease")
  ADJUSTMENT_DECREASE     @map("adjustmentDecrease")
  TRANSFER_OUT            @map("transferOut")
  TRANSFER_IN             @map("transferIn")
  RETURN_TO_STOCK         @map("returnToStock")
  CORRECTION              @map("correction")
}

enum InventoryMovementDirection {
  IN      @map("in")
  OUT     @map("out")
  NEUTRAL @map("neutral")
}

enum InventoryMovementStatus {
  DRAFT     @map("draft")
  POSTED    @map("posted")
  CANCELLED @map("cancelled")
  REVERSED  @map("reversed")
  ARCHIVED  @map("archived")
}

enum InventoryReferenceType {
  MANUAL                 @map("manual")
  SUPPLIER_RECEIPT       @map("supplierReceipt")
  MAINTENANCE_WORK_ORDER @map("maintenanceWorkOrder")
  MAINTENANCE_TASK       @map("maintenanceTask")
  STOCK_ADJUSTMENT       @map("stockAdjustment")
  STOCK_TRANSFER         @map("stockTransfer")
  STOCK_COUNT            @map("stockCount")
  CORRECTION             @map("correction")
  OTHER                  @map("other")
}

enum InventoryAdjustmentType {
  INCREASE   @map("increase")
  DECREASE   @map("decrease")
  CORRECTION @map("correction")
  LOSS       @map("loss")
  DAMAGE     @map("damage")
  FOUND      @map("found")
  EXPIRED    @map("expired")
  OTHER      @map("other")
}

enum InventoryAdjustmentStatus {
  DRAFT     @map("draft")
  SUBMITTED @map("submitted")
  APPROVED  @map("approved")
  REJECTED  @map("rejected")
  POSTED    @map("posted")
  CANCELLED @map("cancelled")
  ARCHIVED  @map("archived")
}

enum InventoryTransferStatus {
  DRAFT     @map("draft")
  POSTED    @map("posted")
  CANCELLED @map("cancelled")
  REVERSED  @map("reversed")
  ARCHIVED  @map("archived")
}

enum InventoryConsumptionStatus {
  DRAFT     @map("draft")
  POSTED    @map("posted")
  CANCELLED @map("cancelled")
  REVERSED  @map("reversed")
  ARCHIVED  @map("archived")
}

enum InventoryDocumentEntityType {
  INVENTORY_ITEM          @map("inventoryItem")
  INVENTORY_MOVEMENT      @map("inventoryMovement")
  INVENTORY_ADJUSTMENT    @map("inventoryAdjustment")
  INVENTORY_TRANSFER      @map("inventoryTransfer")
  INVENTORY_CONSUMPTION   @map("inventoryConsumption")
  INVENTORY_COUNT         @map("inventoryCount")
  INVENTORY_REPORT_EXPORT @map("inventoryReportExport")
}

enum InventoryDocumentType {
  INVOICE            @map("invoice")
  RECEIPT            @map("receipt")
  DELIVERY_NOTE      @map("deliveryNote")
  ADJUSTMENT_SUPPORT @map("adjustmentSupport")
  PHOTO              @map("photo")
  TECHNICAL_REPORT   @map("technicalReport")
  INVENTORY_COUNT    @map("inventoryCount")
  OTHER              @map("other")
}

enum InventoryDocumentVisibility {
  ADMINISTRATIVE @map("administrative")
}

enum InventoryDocumentStatus {
  ACTIVE   @map("active")
  ARCHIVED @map("archived")
}

enum InventoryAlertType {
  LOW_STOCK              @map("lowStock")
  OUT_OF_STOCK           @map("outOfStock")
  NEGATIVE_STOCK_ATTEMPT @map("negativeStockAttempt")
  INACTIVE_ITEM_USED     @map("inactiveItemUsed")
  ARCHIVED_LOCATION_USED @map("archivedLocationUsed")
}

enum InventoryAlertSeverity {
  INFO     @map("info")
  WARNING  @map("warning")
  CRITICAL @map("critical")
}

enum InventoryAlertStatus {
  OPEN         @map("open")
  ACKNOWLEDGED @map("acknowledged")
  RESOLVED     @map("resolved")
  DISMISSED    @map("dismissed")
  ARCHIVED     @map("archived")
}

enum InventoryReportType {
  STOCK       @map("stock")
  MOVEMENTS   @map("movements")
  CONSUMPTION @map("consumption")
  LOW_STOCK   @map("lowStock")
  VALUATION   @map("valuation")
}

enum InventoryExportFormat {
  CSV  @map("csv")
  XLSX @map("xlsx")
  PDF  @map("pdf")
}

enum InventoryReportExportStatus {
  REQUESTED  @map("requested")
  PROCESSING @map("processing")
  COMPLETED  @map("completed")
  FAILED     @map("failed")
  ARCHIVED   @map("archived")
}
```

---

# 10. Prisma schema preliminar — Models base

```prisma id="db3eia"
model InventoryCategory {
  id             String                 @id @default(uuid()) @db.Uuid
  tenantId       String                 @map("tenant_id") @db.Uuid
  categoryCode   String                 @map("category_code") @db.VarChar(50)
  categoryName   String                 @map("category_name") @db.VarChar(150)
  description    String?
  status         InventoryCatalogStatus @default(ACTIVE)
  createdBy      String                 @map("created_by") @db.Uuid
  updatedBy      String?                @map("updated_by") @db.Uuid
  archivedBy     String?                @map("archived_by") @db.Uuid
  createdAt      DateTime               @default(now()) @map("created_at") @db.Timestamptz
  updatedAt      DateTime               @updatedAt @map("updated_at") @db.Timestamptz
  archivedAt     DateTime?              @map("archived_at") @db.Timestamptz
  archiveReason  String?                @map("archive_reason")
  metadata       Json?

  tenant         Tenant                 @relation(fields: [tenantId], references: [id])
  items          InventoryItem[]

  @@index([tenantId, status])
  @@index([tenantId, categoryCode])
  @@map("inventory_categories")
}

model InventoryUnit {
  id               String                 @id @default(uuid()) @db.Uuid
  tenantId         String                 @map("tenant_id") @db.Uuid
  unitCode         String                 @map("unit_code") @db.VarChar(50)
  unitName         String                 @map("unit_name") @db.VarChar(120)
  unitSymbol       String?                @map("unit_symbol") @db.VarChar(20)
  allowsDecimals   Boolean                @default(false) @map("allows_decimals")
  decimalPrecision Int                    @default(0) @map("decimal_precision")
  status           InventoryCatalogStatus @default(ACTIVE)
  createdBy        String                 @map("created_by") @db.Uuid
  updatedBy        String?                @map("updated_by") @db.Uuid
  archivedBy       String?                @map("archived_by") @db.Uuid
  createdAt        DateTime               @default(now()) @map("created_at") @db.Timestamptz
  updatedAt        DateTime               @updatedAt @map("updated_at") @db.Timestamptz
  archivedAt       DateTime?              @map("archived_at") @db.Timestamptz
  archiveReason    String?                @map("archive_reason")
  metadata         Json?

  tenant           Tenant                 @relation(fields: [tenantId], references: [id])
  items            InventoryItem[]

  @@index([tenantId, status])
  @@index([tenantId, unitCode])
  @@map("inventory_units")
}

model InventoryItem {
  id                         String                     @id @default(uuid()) @db.Uuid
  tenantId                   String                     @map("tenant_id") @db.Uuid
  itemCode                   String                     @map("item_code") @db.VarChar(80)
  itemName                   String                     @map("item_name") @db.VarChar(180)
  description                String?
  categoryId                 String                     @map("category_id") @db.Uuid
  unitId                     String                     @map("unit_id") @db.Uuid
  itemType                   InventoryItemType          @map("item_type")
  stockTrackingMode          InventoryStockTrackingMode @default(QUANTITY_AND_COST) @map("stock_tracking_mode")
  defaultStorageLocationId   String?                    @map("default_storage_location_id") @db.Uuid
  minimumStockQuantity       Decimal?                   @map("minimum_stock_quantity") @db.Decimal(14, 4)
  reorderPointQuantity       Decimal?                   @map("reorder_point_quantity") @db.Decimal(14, 4)
  referenceUnitCostAmount    Decimal?                   @map("reference_unit_cost_amount") @db.Decimal(12, 2)
  currency                   Currency                   @default(USD)
  preferredSupplierId        String?                    @map("preferred_supplier_id") @db.Uuid
  status                     InventoryItemStatus        @default(DRAFT)
  createdBy                  String                     @map("created_by") @db.Uuid
  updatedBy                  String?                    @map("updated_by") @db.Uuid
  activatedBy                String?                    @map("activated_by") @db.Uuid
  deactivatedBy              String?                    @map("deactivated_by") @db.Uuid
  archivedBy                 String?                    @map("archived_by") @db.Uuid
  createdAt                  DateTime                   @default(now()) @map("created_at") @db.Timestamptz
  updatedAt                  DateTime                   @updatedAt @map("updated_at") @db.Timestamptz
  activatedAt                DateTime?                  @map("activated_at") @db.Timestamptz
  deactivatedAt              DateTime?                  @map("deactivated_at") @db.Timestamptz
  archivedAt                 DateTime?                  @map("archived_at") @db.Timestamptz
  archiveReason              String?                    @map("archive_reason")
  metadata                   Json?

  tenant                     Tenant                     @relation(fields: [tenantId], references: [id])
  category                   InventoryCategory          @relation(fields: [categoryId], references: [id])
  unit                       InventoryUnit              @relation(fields: [unitId], references: [id])
  defaultStorageLocation     InventoryStorageLocation?  @relation("InventoryItemDefaultLocation", fields: [defaultStorageLocationId], references: [id])

  stockBalances              InventoryStockBalance[]
  movements                  InventoryMovement[]
  adjustments                InventoryStockAdjustment[]
  transfers                  InventoryTransfer[]
  consumptions               InventoryConsumption[]
  alerts                     InventoryAlert[]

  @@index([tenantId, itemCode])
  @@index([tenantId, categoryId])
  @@index([tenantId, unitId])
  @@index([tenantId, status])
  @@index([tenantId, itemType])
  @@index([tenantId, preferredSupplierId])
  @@index([tenantId, defaultStorageLocationId])
  @@map("inventory_items")
}

model InventoryStorageLocation {
  id                String                  @id @default(uuid()) @db.Uuid
  tenantId          String                  @map("tenant_id") @db.Uuid
  locationCode      String                  @map("location_code") @db.VarChar(80)
  locationName      String                  @map("location_name") @db.VarChar(180)
  description       String?
  locationType      InventoryLocationType   @map("location_type")
  responsibleUserId String?                 @map("responsible_user_id") @db.Uuid
  status            InventoryLocationStatus @default(ACTIVE)
  createdBy         String                  @map("created_by") @db.Uuid
  updatedBy         String?                 @map("updated_by") @db.Uuid
  archivedBy        String?                 @map("archived_by") @db.Uuid
  createdAt         DateTime                @default(now()) @map("created_at") @db.Timestamptz
  updatedAt         DateTime                @updatedAt @map("updated_at") @db.Timestamptz
  archivedAt        DateTime?               @map("archived_at") @db.Timestamptz
  archiveReason     String?                 @map("archive_reason")
  metadata          Json?

  tenant            Tenant                  @relation(fields: [tenantId], references: [id])

  defaultItems      InventoryItem[]         @relation("InventoryItemDefaultLocation")
  stockBalances     InventoryStockBalance[]
  sourceMovements   InventoryMovement[]     @relation("InventoryMovementSourceLocation")
  targetMovements   InventoryMovement[]     @relation("InventoryMovementTargetLocation")
  adjustments       InventoryStockAdjustment[]
  sourceTransfers   InventoryTransfer[]     @relation("InventoryTransferSourceLocation")
  targetTransfers   InventoryTransfer[]     @relation("InventoryTransferTargetLocation")
  consumptions      InventoryConsumption[]
  alerts            InventoryAlert[]

  @@index([tenantId, locationCode])
  @@index([tenantId, status])
  @@index([tenantId, locationType])
  @@index([tenantId, responsibleUserId])
  @@map("inventory_storage_locations")
}
```

---

# 11. Prisma schema preliminar — Stock y movimientos

```prisma id="yrikqw"
model InventoryStockBalance {
  id                    String                   @id @default(uuid()) @db.Uuid
  tenantId              String                   @map("tenant_id") @db.Uuid
  itemId                String                   @map("item_id") @db.Uuid
  storageLocationId     String                   @map("storage_location_id") @db.Uuid
  quantityOnHand        Decimal                  @default(0) @map("quantity_on_hand") @db.Decimal(14, 4)
  quantityReserved      Decimal                  @default(0) @map("quantity_reserved") @db.Decimal(14, 4)
  quantityAvailable     Decimal                  @default(0) @map("quantity_available") @db.Decimal(14, 4)
  averageUnitCostAmount Decimal?                 @map("average_unit_cost_amount") @db.Decimal(12, 2)
  currency              Currency                 @default(USD)
  lastMovementId        String?                  @map("last_movement_id") @db.Uuid
  lastMovementAt        DateTime?                @map("last_movement_at") @db.Timestamptz
  createdAt             DateTime                 @default(now()) @map("created_at") @db.Timestamptz
  updatedAt             DateTime                 @updatedAt @map("updated_at") @db.Timestamptz
  metadata              Json?

  tenant                Tenant                   @relation(fields: [tenantId], references: [id])
  item                  InventoryItem            @relation(fields: [itemId], references: [id])
  storageLocation       InventoryStorageLocation @relation(fields: [storageLocationId], references: [id])

  @@unique([tenantId, itemId, storageLocationId])
  @@index([tenantId, itemId])
  @@index([tenantId, storageLocationId])
  @@index([tenantId, quantityAvailable])
  @@map("inventory_stock_balances")
}

model InventoryMovement {
  id                       String                     @id @default(uuid()) @db.Uuid
  tenantId                 String                     @map("tenant_id") @db.Uuid
  movementNumber           String                     @map("movement_number") @db.VarChar(60)
  itemId                   String                     @map("item_id") @db.Uuid
  storageLocationId        String                     @map("storage_location_id") @db.Uuid
  targetStorageLocationId  String?                    @map("target_storage_location_id") @db.Uuid
  movementType             InventoryMovementType      @map("movement_type")
  movementDirection        InventoryMovementDirection @map("movement_direction")
  quantity                 Decimal                    @db.Decimal(14, 4)
  unitCostAmount           Decimal?                   @map("unit_cost_amount") @db.Decimal(12, 2)
  totalCostAmount          Decimal?                   @map("total_cost_amount") @db.Decimal(12, 2)
  currency                 Currency                   @default(USD)
  reason                   String?
  referenceType            InventoryReferenceType     @default(MANUAL) @map("reference_type")
  referenceId              String?                    @map("reference_id") @db.Uuid
  supplierId               String?                    @map("supplier_id") @db.Uuid
  supplierPayableId        String?                    @map("supplier_payable_id") @db.Uuid
  maintenanceWorkOrderId   String?                    @map("maintenance_work_order_id") @db.Uuid
  maintenanceTaskId        String?                    @map("maintenance_task_id") @db.Uuid
  secureDocumentId         String?                    @map("secure_document_id") @db.Uuid
  reversedMovementId       String?                    @map("reversed_movement_id") @db.Uuid
  reversalMovementId       String?                    @map("reversal_movement_id") @db.Uuid
  status                   InventoryMovementStatus    @default(DRAFT)
  createdBy                String                     @map("created_by") @db.Uuid
  postedBy                 String?                    @map("posted_by") @db.Uuid
  cancelledBy              String?                    @map("cancelled_by") @db.Uuid
  reversedBy               String?                    @map("reversed_by") @db.Uuid
  archivedBy               String?                    @map("archived_by") @db.Uuid
  createdAt                DateTime                   @default(now()) @map("created_at") @db.Timestamptz
  updatedAt                DateTime                   @updatedAt @map("updated_at") @db.Timestamptz
  postedAt                 DateTime?                  @map("posted_at") @db.Timestamptz
  cancelledAt              DateTime?                  @map("cancelled_at") @db.Timestamptz
  reversedAt               DateTime?                  @map("reversed_at") @db.Timestamptz
  archivedAt               DateTime?                  @map("archived_at") @db.Timestamptz
  cancelReason             String?                    @map("cancel_reason")
  reverseReason            String?                    @map("reverse_reason")
  archiveReason            String?                    @map("archive_reason")
  metadata                 Json?

  tenant                   Tenant                     @relation(fields: [tenantId], references: [id])
  item                     InventoryItem              @relation(fields: [itemId], references: [id])
  storageLocation          InventoryStorageLocation   @relation("InventoryMovementSourceLocation", fields: [storageLocationId], references: [id])
  targetStorageLocation    InventoryStorageLocation?  @relation("InventoryMovementTargetLocation", fields: [targetStorageLocationId], references: [id])

  reversedMovement         InventoryMovement?         @relation("InventoryMovementReversal", fields: [reversedMovementId], references: [id])
  reversalMovements        InventoryMovement[]        @relation("InventoryMovementReversal")

  adjustment               InventoryStockAdjustment?  @relation("InventoryAdjustmentMovement")
  transferOut              InventoryTransfer?         @relation("InventoryTransferOutMovement")
  transferIn               InventoryTransfer?         @relation("InventoryTransferInMovement")
  consumption              InventoryConsumption?      @relation("InventoryConsumptionMovement")

  @@index([tenantId, movementNumber])
  @@index([tenantId, itemId])
  @@index([tenantId, storageLocationId])
  @@index([tenantId, targetStorageLocationId])
  @@index([tenantId, movementType])
  @@index([tenantId, movementDirection])
  @@index([tenantId, status])
  @@index([tenantId, createdAt])
  @@index([tenantId, postedAt])
  @@index([tenantId, referenceType, referenceId])
  @@index([tenantId, supplierId])
  @@index([tenantId, supplierPayableId])
  @@index([tenantId, maintenanceWorkOrderId])
  @@index([tenantId, maintenanceTaskId])
  @@index([tenantId, secureDocumentId])
  @@map("inventory_movements")
}
```

---

# 12. Prisma schema preliminar — Ajustes, transferencias y consumos

```prisma id="i00676"
model InventoryStockAdjustment {
  id                 String                    @id @default(uuid()) @db.Uuid
  tenantId           String                    @map("tenant_id") @db.Uuid
  adjustmentNumber   String                    @map("adjustment_number") @db.VarChar(60)
  itemId             String                    @map("item_id") @db.Uuid
  storageLocationId  String                    @map("storage_location_id") @db.Uuid
  adjustmentType     InventoryAdjustmentType   @map("adjustment_type")
  quantity           Decimal                   @db.Decimal(14, 4)
  reason             String
  secureDocumentId   String?                   @map("secure_document_id") @db.Uuid
  movementId         String?                   @unique @map("movement_id") @db.Uuid
  status             InventoryAdjustmentStatus @default(DRAFT)
  createdBy          String                    @map("created_by") @db.Uuid
  submittedBy        String?                   @map("submitted_by") @db.Uuid
  approvedBy         String?                   @map("approved_by") @db.Uuid
  rejectedBy         String?                   @map("rejected_by") @db.Uuid
  postedBy           String?                   @map("posted_by") @db.Uuid
  cancelledBy        String?                   @map("cancelled_by") @db.Uuid
  archivedBy         String?                   @map("archived_by") @db.Uuid
  createdAt          DateTime                  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt          DateTime                  @updatedAt @map("updated_at") @db.Timestamptz
  submittedAt        DateTime?                 @map("submitted_at") @db.Timestamptz
  approvedAt         DateTime?                 @map("approved_at") @db.Timestamptz
  rejectedAt         DateTime?                 @map("rejected_at") @db.Timestamptz
  postedAt           DateTime?                 @map("posted_at") @db.Timestamptz
  cancelledAt        DateTime?                 @map("cancelled_at") @db.Timestamptz
  archivedAt         DateTime?                 @map("archived_at") @db.Timestamptz
  rejectReason       String?                   @map("reject_reason")
  cancelReason       String?                   @map("cancel_reason")
  archiveReason      String?                   @map("archive_reason")
  metadata           Json?

  tenant             Tenant                    @relation(fields: [tenantId], references: [id])
  item               InventoryItem             @relation(fields: [itemId], references: [id])
  storageLocation    InventoryStorageLocation  @relation(fields: [storageLocationId], references: [id])
  movement           InventoryMovement?        @relation("InventoryAdjustmentMovement", fields: [movementId], references: [id])

  @@index([tenantId, adjustmentNumber])
  @@index([tenantId, itemId])
  @@index([tenantId, storageLocationId])
  @@index([tenantId, status])
  @@index([tenantId, adjustmentType])
  @@index([tenantId, secureDocumentId])
  @@map("inventory_stock_adjustments")
}

model InventoryTransfer {
  id                       String                  @id @default(uuid()) @db.Uuid
  tenantId                 String                  @map("tenant_id") @db.Uuid
  transferNumber           String                  @map("transfer_number") @db.VarChar(60)
  itemId                   String                  @map("item_id") @db.Uuid
  sourceStorageLocationId  String                  @map("source_storage_location_id") @db.Uuid
  targetStorageLocationId  String                  @map("target_storage_location_id") @db.Uuid
  quantity                 Decimal                 @db.Decimal(14, 4)
  reason                   String
  outMovementId            String?                 @unique @map("out_movement_id") @db.Uuid
  inMovementId             String?                 @unique @map("in_movement_id") @db.Uuid
  status                   InventoryTransferStatus @default(DRAFT)
  createdBy                String                  @map("created_by") @db.Uuid
  postedBy                 String?                 @map("posted_by") @db.Uuid
  cancelledBy              String?                 @map("cancelled_by") @db.Uuid
  reversedBy               String?                 @map("reversed_by") @db.Uuid
  archivedBy               String?                 @map("archived_by") @db.Uuid
  createdAt                DateTime                @default(now()) @map("created_at") @db.Timestamptz
  updatedAt                DateTime                @updatedAt @map("updated_at") @db.Timestamptz
  postedAt                 DateTime?               @map("posted_at") @db.Timestamptz
  cancelledAt              DateTime?               @map("cancelled_at") @db.Timestamptz
  reversedAt               DateTime?               @map("reversed_at") @db.Timestamptz
  archivedAt               DateTime?               @map("archived_at") @db.Timestamptz
  cancelReason             String?                 @map("cancel_reason")
  reverseReason            String?                 @map("reverse_reason")
  archiveReason            String?                 @map("archive_reason")
  metadata                 Json?

  tenant                   Tenant                  @relation(fields: [tenantId], references: [id])
  item                     InventoryItem           @relation(fields: [itemId], references: [id])
  sourceStorageLocation    InventoryStorageLocation @relation("InventoryTransferSourceLocation", fields: [sourceStorageLocationId], references: [id])
  targetStorageLocation    InventoryStorageLocation @relation("InventoryTransferTargetLocation", fields: [targetStorageLocationId], references: [id])
  outMovement              InventoryMovement?      @relation("InventoryTransferOutMovement", fields: [outMovementId], references: [id])
  inMovement               InventoryMovement?      @relation("InventoryTransferInMovement", fields: [inMovementId], references: [id])

  @@index([tenantId, transferNumber])
  @@index([tenantId, itemId])
  @@index([tenantId, sourceStorageLocationId])
  @@index([tenantId, targetStorageLocationId])
  @@index([tenantId, status])
  @@map("inventory_transfers")
}

model InventoryConsumption {
  id                       String                     @id @default(uuid()) @db.Uuid
  tenantId                 String                     @map("tenant_id") @db.Uuid
  consumptionNumber        String                     @map("consumption_number") @db.VarChar(60)
  itemId                   String                     @map("item_id") @db.Uuid
  storageLocationId        String                     @map("storage_location_id") @db.Uuid
  quantity                 Decimal                    @db.Decimal(14, 4)
  maintenanceWorkOrderId   String                     @map("maintenance_work_order_id") @db.Uuid
  maintenanceTaskId        String?                    @map("maintenance_task_id") @db.Uuid
  consumedByUserId         String?                    @map("consumed_by_user_id") @db.Uuid
  reason                   String?
  movementId               String?                    @unique @map("movement_id") @db.Uuid
  status                   InventoryConsumptionStatus @default(DRAFT)
  createdBy                String                     @map("created_by") @db.Uuid
  postedBy                 String?                    @map("posted_by") @db.Uuid
  cancelledBy              String?                    @map("cancelled_by") @db.Uuid
  reversedBy               String?                    @map("reversed_by") @db.Uuid
  archivedBy               String?                    @map("archived_by") @db.Uuid
  createdAt                DateTime                   @default(now()) @map("created_at") @db.Timestamptz
  updatedAt                DateTime                   @updatedAt @map("updated_at") @db.Timestamptz
  postedAt                 DateTime?                  @map("posted_at") @db.Timestamptz
  cancelledAt              DateTime?                  @map("cancelled_at") @db.Timestamptz
  reversedAt               DateTime?                  @map("reversed_at") @db.Timestamptz
  archivedAt               DateTime?                  @map("archived_at") @db.Timestamptz
  cancelReason             String?                    @map("cancel_reason")
  reverseReason            String?                    @map("reverse_reason")
  archiveReason            String?                    @map("archive_reason")
  metadata                 Json?

  tenant                   Tenant                     @relation(fields: [tenantId], references: [id])
  item                     InventoryItem              @relation(fields: [itemId], references: [id])
  storageLocation          InventoryStorageLocation   @relation(fields: [storageLocationId], references: [id])
  movement                 InventoryMovement?         @relation("InventoryConsumptionMovement", fields: [movementId], references: [id])

  @@index([tenantId, consumptionNumber])
  @@index([tenantId, itemId])
  @@index([tenantId, storageLocationId])
  @@index([tenantId, maintenanceWorkOrderId])
  @@index([tenantId, maintenanceTaskId])
  @@index([tenantId, status])
  @@map("inventory_consumptions")
}
```

---

# 13. Prisma schema preliminar — Documentos, alertas y exports

```prisma id="tm9cev"
model InventoryDocument {
  id               String                      @id @default(uuid()) @db.Uuid
  tenantId         String                      @map("tenant_id") @db.Uuid
  entityType       InventoryDocumentEntityType @map("entity_type")
  entityId         String                      @map("entity_id") @db.Uuid
  secureDocumentId String                      @map("secure_document_id") @db.Uuid
  documentType     InventoryDocumentType       @map("document_type")
  description      String?
  visibility       InventoryDocumentVisibility @default(ADMINISTRATIVE)
  status           InventoryDocumentStatus     @default(ACTIVE)
  createdBy        String                      @map("created_by") @db.Uuid
  archivedBy       String?                     @map("archived_by") @db.Uuid
  createdAt        DateTime                    @default(now()) @map("created_at") @db.Timestamptz
  archivedAt       DateTime?                   @map("archived_at") @db.Timestamptz
  archiveReason    String?                     @map("archive_reason")
  metadata         Json?

  tenant           Tenant                      @relation(fields: [tenantId], references: [id])

  @@index([tenantId, entityType, entityId])
  @@index([tenantId, secureDocumentId])
  @@index([tenantId, documentType])
  @@index([tenantId, status])
  @@map("inventory_documents")
}

model InventoryAlert {
  id                 String                 @id @default(uuid()) @db.Uuid
  tenantId           String                 @map("tenant_id") @db.Uuid
  itemId             String                 @map("item_id") @db.Uuid
  storageLocationId  String?                @map("storage_location_id") @db.Uuid
  alertType          InventoryAlertType     @map("alert_type")
  severity           InventoryAlertSeverity @default(WARNING)
  status             InventoryAlertStatus   @default(OPEN)
  currentQuantity    Decimal?               @map("current_quantity") @db.Decimal(14, 4)
  thresholdQuantity  Decimal?               @map("threshold_quantity") @db.Decimal(14, 4)
  message            String?
  createdAt          DateTime               @default(now()) @map("created_at") @db.Timestamptz
  acknowledgedBy     String?                @map("acknowledged_by") @db.Uuid
  acknowledgedAt     DateTime?              @map("acknowledged_at") @db.Timestamptz
  resolvedBy         String?                @map("resolved_by") @db.Uuid
  resolvedAt         DateTime?              @map("resolved_at") @db.Timestamptz
  dismissedBy        String?                @map("dismissed_by") @db.Uuid
  dismissedAt        DateTime?              @map("dismissed_at") @db.Timestamptz
  archivedBy         String?                @map("archived_by") @db.Uuid
  archivedAt         DateTime?              @map("archived_at") @db.Timestamptz
  resolutionReason   String?                @map("resolution_reason")
  dismissReason      String?                @map("dismiss_reason")
  archiveReason      String?                @map("archive_reason")
  metadata           Json?

  tenant             Tenant                 @relation(fields: [tenantId], references: [id])
  item               InventoryItem          @relation(fields: [itemId], references: [id])
  storageLocation    InventoryStorageLocation? @relation(fields: [storageLocationId], references: [id])

  @@index([tenantId, itemId])
  @@index([tenantId, storageLocationId])
  @@index([tenantId, alertType])
  @@index([tenantId, severity])
  @@index([tenantId, status])
  @@index([tenantId, createdAt])
  @@map("inventory_alerts")
}

model InventoryReportExport {
  id               String                      @id @default(uuid()) @db.Uuid
  tenantId         String                      @map("tenant_id") @db.Uuid
  reportType       InventoryReportType         @map("report_type")
  format           InventoryExportFormat
  filters          Json
  secureDocumentId String?                     @map("secure_document_id") @db.Uuid
  status           InventoryReportExportStatus @default(REQUESTED)
  requestedBy      String                      @map("requested_by") @db.Uuid
  createdAt        DateTime                    @default(now()) @map("created_at") @db.Timestamptz
  completedAt      DateTime?                   @map("completed_at") @db.Timestamptz
  failedAt         DateTime?                   @map("failed_at") @db.Timestamptz
  archivedAt       DateTime?                   @map("archived_at") @db.Timestamptz
  failureReason    String?                     @map("failure_reason")
  metadata         Json?

  tenant           Tenant                      @relation(fields: [tenantId], references: [id])

  @@index([tenantId, reportType])
  @@index([tenantId, format])
  @@index([tenantId, status])
  @@index([tenantId, createdAt])
  @@index([tenantId, secureDocumentId])
  @@map("inventory_report_exports")
}
```

---

# 14. Relaciones a agregar en `Tenant`

Agregar al modelo `Tenant`:

```prisma id="z7c7bi"
model Tenant {
  // existing fields...

  inventoryCategories       InventoryCategory[]
  inventoryUnits            InventoryUnit[]
  inventoryItems            InventoryItem[]
  inventoryStorageLocations InventoryStorageLocation[]
  inventoryStockBalances    InventoryStockBalance[]
  inventoryMovements        InventoryMovement[]
  inventoryStockAdjustments InventoryStockAdjustment[]
  inventoryTransfers        InventoryTransfer[]
  inventoryConsumptions     InventoryConsumption[]
  inventoryDocuments        InventoryDocument[]
  inventoryAlerts           InventoryAlert[]
  inventoryReportExports    InventoryReportExport[]
}
```

---

# 15. Índices recomendados

## 15.1. Categorías

```sql id="m9z7bk"
CREATE UNIQUE INDEX uq_inventory_categories_tenant_code_active
ON inventory_categories (tenant_id, category_code)
WHERE archived_at IS NULL;

CREATE INDEX idx_inventory_categories_tenant_status
ON inventory_categories (tenant_id, status);
```

---

## 15.2. Unidades

```sql id="tf1v8w"
CREATE UNIQUE INDEX uq_inventory_units_tenant_code_active
ON inventory_units (tenant_id, unit_code)
WHERE archived_at IS NULL;

CREATE INDEX idx_inventory_units_tenant_status
ON inventory_units (tenant_id, status);
```

---

## 15.3. Ítems

```sql id="tqb820"
CREATE UNIQUE INDEX uq_inventory_items_tenant_code_active
ON inventory_items (tenant_id, item_code)
WHERE archived_at IS NULL;

CREATE INDEX idx_inventory_items_tenant_category
ON inventory_items (tenant_id, category_id);

CREATE INDEX idx_inventory_items_tenant_unit
ON inventory_items (tenant_id, unit_id);

CREATE INDEX idx_inventory_items_tenant_status
ON inventory_items (tenant_id, status);

CREATE INDEX idx_inventory_items_tenant_type
ON inventory_items (tenant_id, item_type);

CREATE INDEX idx_inventory_items_tenant_supplier
ON inventory_items (tenant_id, preferred_supplier_id);
```

---

## 15.4. Ubicaciones

```sql id="q3smu7"
CREATE UNIQUE INDEX uq_inventory_locations_tenant_code_active
ON inventory_storage_locations (tenant_id, location_code)
WHERE archived_at IS NULL;

CREATE INDEX idx_inventory_locations_tenant_status
ON inventory_storage_locations (tenant_id, status);

CREATE INDEX idx_inventory_locations_tenant_type
ON inventory_storage_locations (tenant_id, location_type);

CREATE INDEX idx_inventory_locations_tenant_responsible
ON inventory_storage_locations (tenant_id, responsible_user_id);
```

---

## 15.5. Saldos

```sql id="l491ih"
CREATE UNIQUE INDEX uq_inventory_stock_balances_tenant_item_location
ON inventory_stock_balances (tenant_id, item_id, storage_location_id);

CREATE INDEX idx_inventory_stock_balances_tenant_item
ON inventory_stock_balances (tenant_id, item_id);

CREATE INDEX idx_inventory_stock_balances_tenant_location
ON inventory_stock_balances (tenant_id, storage_location_id);

CREATE INDEX idx_inventory_stock_balances_tenant_available
ON inventory_stock_balances (tenant_id, quantity_available);
```

---

## 15.6. Movimientos

```sql id="mnecnc"
CREATE UNIQUE INDEX uq_inventory_movements_tenant_number
ON inventory_movements (tenant_id, movement_number);

CREATE INDEX idx_inventory_movements_tenant_item
ON inventory_movements (tenant_id, item_id);

CREATE INDEX idx_inventory_movements_tenant_location
ON inventory_movements (tenant_id, storage_location_id);

CREATE INDEX idx_inventory_movements_tenant_target_location
ON inventory_movements (tenant_id, target_storage_location_id);

CREATE INDEX idx_inventory_movements_tenant_type
ON inventory_movements (tenant_id, movement_type);

CREATE INDEX idx_inventory_movements_tenant_direction
ON inventory_movements (tenant_id, movement_direction);

CREATE INDEX idx_inventory_movements_tenant_status
ON inventory_movements (tenant_id, status);

CREATE INDEX idx_inventory_movements_tenant_created
ON inventory_movements (tenant_id, created_at);

CREATE INDEX idx_inventory_movements_tenant_posted
ON inventory_movements (tenant_id, posted_at);

CREATE INDEX idx_inventory_movements_tenant_reference
ON inventory_movements (tenant_id, reference_type, reference_id);

CREATE INDEX idx_inventory_movements_tenant_maintenance_wo
ON inventory_movements (tenant_id, maintenance_work_order_id);

CREATE INDEX idx_inventory_movements_tenant_supplier
ON inventory_movements (tenant_id, supplier_id);
```

---

## 15.7. Ajustes

```sql id="b9t3c4"
CREATE UNIQUE INDEX uq_inventory_adjustments_tenant_number
ON inventory_stock_adjustments (tenant_id, adjustment_number);

CREATE INDEX idx_inventory_adjustments_tenant_item
ON inventory_stock_adjustments (tenant_id, item_id);

CREATE INDEX idx_inventory_adjustments_tenant_location
ON inventory_stock_adjustments (tenant_id, storage_location_id);

CREATE INDEX idx_inventory_adjustments_tenant_status
ON inventory_stock_adjustments (tenant_id, status);

CREATE INDEX idx_inventory_adjustments_tenant_type
ON inventory_stock_adjustments (tenant_id, adjustment_type);
```

---

## 15.8. Transferencias

```sql id="kelv3w"
CREATE UNIQUE INDEX uq_inventory_transfers_tenant_number
ON inventory_transfers (tenant_id, transfer_number);

CREATE INDEX idx_inventory_transfers_tenant_item
ON inventory_transfers (tenant_id, item_id);

CREATE INDEX idx_inventory_transfers_tenant_source
ON inventory_transfers (tenant_id, source_storage_location_id);

CREATE INDEX idx_inventory_transfers_tenant_target
ON inventory_transfers (tenant_id, target_storage_location_id);

CREATE INDEX idx_inventory_transfers_tenant_status
ON inventory_transfers (tenant_id, status);
```

---

## 15.9. Consumos

```sql id="uu52do"
CREATE UNIQUE INDEX uq_inventory_consumptions_tenant_number
ON inventory_consumptions (tenant_id, consumption_number);

CREATE INDEX idx_inventory_consumptions_tenant_item
ON inventory_consumptions (tenant_id, item_id);

CREATE INDEX idx_inventory_consumptions_tenant_location
ON inventory_consumptions (tenant_id, storage_location_id);

CREATE INDEX idx_inventory_consumptions_tenant_work_order
ON inventory_consumptions (tenant_id, maintenance_work_order_id);

CREATE INDEX idx_inventory_consumptions_tenant_task
ON inventory_consumptions (tenant_id, maintenance_task_id);

CREATE INDEX idx_inventory_consumptions_tenant_status
ON inventory_consumptions (tenant_id, status);
```

---

## 15.10. Documentos, alertas y exports

```sql id="x6qnsz"
CREATE INDEX idx_inventory_documents_tenant_entity
ON inventory_documents (tenant_id, entity_type, entity_id);

CREATE INDEX idx_inventory_documents_tenant_document
ON inventory_documents (tenant_id, secure_document_id);

CREATE INDEX idx_inventory_alerts_tenant_item
ON inventory_alerts (tenant_id, item_id);

CREATE INDEX idx_inventory_alerts_tenant_location
ON inventory_alerts (tenant_id, storage_location_id);

CREATE INDEX idx_inventory_alerts_tenant_status
ON inventory_alerts (tenant_id, status);

CREATE INDEX idx_inventory_report_exports_tenant_type
ON inventory_report_exports (tenant_id, report_type);

CREATE INDEX idx_inventory_report_exports_tenant_status
ON inventory_report_exports (tenant_id, status);

CREATE INDEX idx_inventory_report_exports_tenant_created
ON inventory_report_exports (tenant_id, created_at);
```

---

# 16. Constraints recomendados

## 16.1. Unidades

```sql id="hpodw8"
ALTER TABLE inventory_units
ADD CONSTRAINT chk_inventory_units_decimal_precision
CHECK (decimal_precision >= 0 AND decimal_precision <= 4);

ALTER TABLE inventory_units
ADD CONSTRAINT chk_inventory_units_decimal_flag
CHECK (
  allows_decimals = true
  OR decimal_precision = 0
);
```

---

## 16.2. Ítems

```sql id="q6fmxq"
ALTER TABLE inventory_items
ADD CONSTRAINT chk_inventory_items_minimum_stock_non_negative
CHECK (
  minimum_stock_quantity IS NULL
  OR minimum_stock_quantity >= 0
);

ALTER TABLE inventory_items
ADD CONSTRAINT chk_inventory_items_reorder_point_non_negative
CHECK (
  reorder_point_quantity IS NULL
  OR reorder_point_quantity >= 0
);

ALTER TABLE inventory_items
ADD CONSTRAINT chk_inventory_items_reference_cost_non_negative
CHECK (
  reference_unit_cost_amount IS NULL
  OR reference_unit_cost_amount >= 0
);
```

---

## 16.3. Saldos

```sql id="z1xbef"
ALTER TABLE inventory_stock_balances
ADD CONSTRAINT chk_inventory_stock_balances_quantities
CHECK (
  quantity_on_hand >= 0
  AND quantity_reserved >= 0
  AND quantity_available >= 0
  AND quantity_reserved <= quantity_on_hand
);

ALTER TABLE inventory_stock_balances
ADD CONSTRAINT chk_inventory_stock_balances_available_formula
CHECK (
  quantity_available = quantity_on_hand - quantity_reserved
);
```

---

## 16.4. Movimientos

```sql id="e2uqtv"
ALTER TABLE inventory_movements
ADD CONSTRAINT chk_inventory_movements_quantity_positive
CHECK (quantity > 0);

ALTER TABLE inventory_movements
ADD CONSTRAINT chk_inventory_movements_costs_non_negative
CHECK (
  (unit_cost_amount IS NULL OR unit_cost_amount >= 0)
  AND (total_cost_amount IS NULL OR total_cost_amount >= 0)
);

ALTER TABLE inventory_movements
ADD CONSTRAINT chk_inventory_movements_posted_fields
CHECK (
  status <> 'posted'
  OR (posted_by IS NOT NULL AND posted_at IS NOT NULL)
);

ALTER TABLE inventory_movements
ADD CONSTRAINT chk_inventory_movements_cancelled_fields
CHECK (
  status <> 'cancelled'
  OR (cancelled_by IS NOT NULL AND cancelled_at IS NOT NULL AND cancel_reason IS NOT NULL)
);

ALTER TABLE inventory_movements
ADD CONSTRAINT chk_inventory_movements_reversed_fields
CHECK (
  status <> 'reversed'
  OR (reversed_by IS NOT NULL AND reversed_at IS NOT NULL AND reverse_reason IS NOT NULL)
);
```

---

## 16.5. Ajustes

```sql id="s2jjya"
ALTER TABLE inventory_stock_adjustments
ADD CONSTRAINT chk_inventory_adjustments_quantity_positive
CHECK (quantity > 0);

ALTER TABLE inventory_stock_adjustments
ADD CONSTRAINT chk_inventory_adjustments_reason_required
CHECK (reason IS NOT NULL AND length(trim(reason)) > 0);

ALTER TABLE inventory_stock_adjustments
ADD CONSTRAINT chk_inventory_adjustments_rejected_fields
CHECK (
  status <> 'rejected'
  OR (rejected_by IS NOT NULL AND rejected_at IS NOT NULL AND reject_reason IS NOT NULL)
);

ALTER TABLE inventory_stock_adjustments
ADD CONSTRAINT chk_inventory_adjustments_cancelled_fields
CHECK (
  status <> 'cancelled'
  OR (cancelled_by IS NOT NULL AND cancelled_at IS NOT NULL AND cancel_reason IS NOT NULL)
);

ALTER TABLE inventory_stock_adjustments
ADD CONSTRAINT chk_inventory_adjustments_posted_fields
CHECK (
  status <> 'posted'
  OR (posted_by IS NOT NULL AND posted_at IS NOT NULL AND movement_id IS NOT NULL)
);
```

---

## 16.6. Transferencias

```sql id="gvfxrp"
ALTER TABLE inventory_transfers
ADD CONSTRAINT chk_inventory_transfers_quantity_positive
CHECK (quantity > 0);

ALTER TABLE inventory_transfers
ADD CONSTRAINT chk_inventory_transfers_different_locations
CHECK (source_storage_location_id <> target_storage_location_id);

ALTER TABLE inventory_transfers
ADD CONSTRAINT chk_inventory_transfers_reason_required
CHECK (reason IS NOT NULL AND length(trim(reason)) > 0);

ALTER TABLE inventory_transfers
ADD CONSTRAINT chk_inventory_transfers_posted_fields
CHECK (
  status <> 'posted'
  OR (posted_by IS NOT NULL AND posted_at IS NOT NULL AND out_movement_id IS NOT NULL AND in_movement_id IS NOT NULL)
);

ALTER TABLE inventory_transfers
ADD CONSTRAINT chk_inventory_transfers_cancelled_fields
CHECK (
  status <> 'cancelled'
  OR (cancelled_by IS NOT NULL AND cancelled_at IS NOT NULL AND cancel_reason IS NOT NULL)
);
```

---

## 16.7. Consumos

```sql id="itzhj7"
ALTER TABLE inventory_consumptions
ADD CONSTRAINT chk_inventory_consumptions_quantity_positive
CHECK (quantity > 0);

ALTER TABLE inventory_consumptions
ADD CONSTRAINT chk_inventory_consumptions_posted_fields
CHECK (
  status <> 'posted'
  OR (posted_by IS NOT NULL AND posted_at IS NOT NULL AND movement_id IS NOT NULL)
);

ALTER TABLE inventory_consumptions
ADD CONSTRAINT chk_inventory_consumptions_cancelled_fields
CHECK (
  status <> 'cancelled'
  OR (cancelled_by IS NOT NULL AND cancelled_at IS NOT NULL AND cancel_reason IS NOT NULL)
);
```

---

## 16.8. Report exports

```sql id="h5ozkw"
ALTER TABLE inventory_report_exports
ADD CONSTRAINT chk_inventory_report_exports_completed_document
CHECK (
  status <> 'completed'
  OR (secure_document_id IS NOT NULL AND completed_at IS NOT NULL)
);

ALTER TABLE inventory_report_exports
ADD CONSTRAINT chk_inventory_report_exports_failed_reason
CHECK (
  status <> 'failed'
  OR (failed_at IS NOT NULL AND failure_reason IS NOT NULL)
);
```

---

# 17. Validaciones de aplicación

Algunas reglas no deben depender solo de DB/Prisma.

Deben validarse en servicios de dominio:

```text id="zlrr34"
- categoryId pertenece al tenant.
- unitId pertenece al tenant.
- itemId pertenece al tenant.
- storageLocationId pertenece al tenant.
- targetStorageLocationId pertenece al tenant.
- secureDocumentId pertenece al tenant.
- supplierId pertenece al tenant y está active.
- supplierPayableId pertenece al tenant.
- maintenanceWorkOrderId pertenece al tenant.
- maintenanceTaskId pertenece a la orden.
- responsibleUserId tiene membership activo.
- item active para movimientos ordinarios.
- location active para movimientos ordinarios.
- movementDirection corresponde a movementType.
- totalCostAmount = quantity * unitCostAmount.
- quantity respeta decimalPrecision de la unidad.
- salida no deja stock negativo.
- consumo no deja stock negativo.
- transferencia no deja stock negativo en origen.
- ajuste negativo no deja stock negativo.
- posted movement no se edita destructivamente.
- Inventory no crea pagos.
- Inventory no crea SupplierPaymentOrder.
- Inventory no crea JournalEntry.
- Inventory no confirma Bank Reconciliation.
```

---

# 18. Estrategia de números secuenciales

## 18.1. `movement_number`

Formato recomendado:

```text id="va1d2f"
IM-{YYYYMM}-{sequence}
```

Ejemplo:

```text id="em6yc2"
IM-202607-000001
```

---

## 18.2. `adjustment_number`

Formato recomendado:

```text id="htjxog"
IA-{YYYYMM}-{sequence}
```

Ejemplo:

```text id="xb8imc"
IA-202607-000001
```

---

## 18.3. `transfer_number`

Formato recomendado:

```text id="o223yd"
IT-{YYYYMM}-{sequence}
```

Ejemplo:

```text id="zl7ja6"
IT-202607-000001
```

---

## 18.4. `consumption_number`

Formato recomendado:

```text id="o28nag"
IC-{YYYYMM}-{sequence}
```

Ejemplo:

```text id="bw44sa"
IC-202607-000001
```

---

## 18.5. Reglas

```text id="q83js0"
- Todos los números son únicos por tenant.
- La generación es server-side.
- Debe ser transaccional.
- No se aceptan desde DTO externo.
```

---

# 19. Estrategia de stock

## 19.1. Movimientos que aumentan stock

```text id="xthn0a"
openingBalance
receipt
adjustmentIncrease
transferIn
returnToStock
correction positivo
```

---

## 19.2. Movimientos que disminuyen stock

```text id="vcvn4e"
issue
maintenanceConsumption
adjustmentDecrease
transferOut
correction negativo
```

---

## 19.3. Movimientos neutrales

```text id="ig3w6a"
correction puede ser neutral si solo corrige metadata controlada
```

En MVP se recomienda evitar movimientos neutrales salvo caso explícito.

---

## 19.4. Fórmula conceptual de saldo

```text id="vk76v2"
quantityOnHand =
  SUM(posted inbound quantities)
  - SUM(posted outbound quantities)
```

`quantityAvailable`:

```text id="m08rp8"
quantityAvailable = quantityOnHand - quantityReserved
```

---

## 19.5. Recalculation

El endpoint de recalculation debe:

```text id="nra2aj"
- filtrar por tenant;
- opcionalmente filtrar por itemId;
- opcionalmente filtrar por storageLocationId;
- leer movimientos posted;
- recalcular quantityOnHand;
- preservar quantityReserved si aplica;
- recalcular quantityAvailable;
- registrar lastMovementAt;
- auditar operación.
```

---

# 20. Estrategia de costos referenciales

## 20.1. Campos

```text id="cuj2kt"
referenceUnitCostAmount
unitCostAmount
totalCostAmount
averageUnitCostAmount
currency
```

---

## 20.2. Reglas

```text id="nbxkrq"
- Todos los costos son Decimal(12,2).
- Todos los costos son no negativos.
- currency = USD en MVP.
- totalCostAmount se calcula server-side.
- averageUnitCostAmount se calcula server-side.
- La valorización es referencial, no contable.
```

---

## 20.3. Cálculo de promedio referencial

Estrategia MVP sugerida:

```text id="lelsrb"
averageUnitCostAmount =
  valor referencial acumulado / quantityOnHand
```

Regla:

```text id="au7273"
Este cálculo es operativo y referencial. No reemplaza FIFO, LIFO, promedio ponderado contable ni kardex oficial.
```

---

# 21. Documentos y Secure Document Storage

## 21.1. `sourceModule`

El módulo `016-secure-document-storage` debe reconocer:

```text id="x8n5rk"
sourceModule = inventoryBasic
```

---

## 21.2. `sourceResourceType`

Tipos recomendados:

```text id="rr0u9h"
inventoryDocument
inventoryMovement
inventoryAdjustment
inventoryTransfer
inventoryConsumption
inventoryReportExport
inventoryCount
```

---

## 21.3. Clasificación recomendada

```text id="uday5g"
visibility:
- administrative

sensitivity:
- internal
- restricted
```

---

## 21.4. Reglas

```text id="zwypxh"
- Inventory guarda secureDocumentId.
- Inventory no guarda storageKey.
- Inventory no guarda signedUrl persistente.
- Inventory no guarda base64.
- Inventory no guarda binarios.
- Descargas se delegan a SDS.
- Descargas sensibles se auditan.
```

---

# 22. Integración con Maintenance Work Orders

## 22.1. Campos relacionados

```text id="wpm0p8"
inventory_consumptions.maintenance_work_order_id
inventory_consumptions.maintenance_task_id
inventory_movements.maintenance_work_order_id
inventory_movements.maintenance_task_id
```

---

## 22.2. Reglas

```text id="p224lf"
- maintenance_work_order_id debe pertenecer al tenant.
- maintenance_task_id debe pertenecer a la orden si existe.
- consumo posted genera movement maintenanceConsumption.
- Inventory no modifica estados de Maintenance Work Orders.
- Inventory no cierra órdenes de mantenimiento.
- Inventory no aprueba costos de mantenimiento.
```

---

# 23. Integración con Supplier Payments

## 23.1. Campos relacionados

```text id="n0q5i5"
inventory_items.preferred_supplier_id
inventory_movements.supplier_id
inventory_movements.supplier_payable_id
```

---

## 23.2. Reglas

```text id="rbh8wb"
- supplierId debe pertenecer al tenant.
- supplier debe estar active.
- supplier blocked no se acepta.
- supplierPayableId debe pertenecer al tenant.
- supplierPayableId es referencia, no gobernado por Inventory.
- Inventory no crea SupplierPaymentOrder.
- Inventory no marca paid.
- Inventory no inicia transferencia.
```

---

# 24. Auditoría de datos

Campos actor server-side:

```text id="zecuio"
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
```

Prohibido desde cliente:

```text id="ndeyuw"
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
```

Eventos críticos a auditar:

```text id="yq10us"
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

# 25. Datos prohibidos en `metadata`

No guardar en `metadata`:

```text id="wedz6d"
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
credenciales
cookies
refresh tokens
access tokens
```

---

# 26. Campos prohibidos en DTOs externos

Todo DTO externo debe rechazar:

```text id="m5lvc3"
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

---

# 27. Queries conceptuales

## 27.1. Stock por ítem

```sql id="wz24fg"
SELECT
  b.item_id,
  i.item_code,
  i.item_name,
  SUM(b.quantity_on_hand) AS quantity_on_hand,
  SUM(b.quantity_reserved) AS quantity_reserved,
  SUM(b.quantity_available) AS quantity_available
FROM inventory_stock_balances b
JOIN inventory_items i ON i.id = b.item_id
WHERE b.tenant_id = :tenantId
  AND i.archived_at IS NULL
GROUP BY b.item_id, i.item_code, i.item_name
ORDER BY i.item_name ASC;
```

---

## 27.2. Stock por ubicación

```sql id="vyzpwu"
SELECT
  b.storage_location_id,
  l.location_code,
  l.location_name,
  b.item_id,
  i.item_code,
  i.item_name,
  b.quantity_on_hand,
  b.quantity_reserved,
  b.quantity_available
FROM inventory_stock_balances b
JOIN inventory_items i ON i.id = b.item_id
JOIN inventory_storage_locations l ON l.id = b.storage_location_id
WHERE b.tenant_id = :tenantId
ORDER BY l.location_name, i.item_name;
```

---

## 27.3. Movimientos por periodo

```sql id="sj1vyw"
SELECT
  movement_type,
  movement_direction,
  status,
  COUNT(*) AS movement_count,
  SUM(quantity) AS total_quantity,
  SUM(total_cost_amount) AS total_cost_amount
FROM inventory_movements
WHERE tenant_id = :tenantId
  AND created_at >= :dateFrom
  AND created_at < :dateTo
GROUP BY movement_type, movement_direction, status;
```

---

## 27.4. Consumo por orden de mantenimiento

```sql id="odim4u"
SELECT
  c.maintenance_work_order_id,
  c.maintenance_task_id,
  c.item_id,
  i.item_code,
  i.item_name,
  SUM(c.quantity) AS consumed_quantity
FROM inventory_consumptions c
JOIN inventory_items i ON i.id = c.item_id
WHERE c.tenant_id = :tenantId
  AND c.status = 'posted'
  AND c.maintenance_work_order_id = :workOrderId
GROUP BY c.maintenance_work_order_id, c.maintenance_task_id, c.item_id, i.item_code, i.item_name;
```

---

## 27.5. Bajo stock

```sql id="suhcv6"
SELECT
  i.id AS item_id,
  i.item_code,
  i.item_name,
  SUM(b.quantity_available) AS quantity_available,
  i.minimum_stock_quantity,
  i.reorder_point_quantity
FROM inventory_items i
JOIN inventory_stock_balances b ON b.item_id = i.id
WHERE i.tenant_id = :tenantId
  AND i.status = 'active'
  AND i.archived_at IS NULL
GROUP BY i.id, i.item_code, i.item_name, i.minimum_stock_quantity, i.reorder_point_quantity
HAVING SUM(b.quantity_available) <= COALESCE(i.minimum_stock_quantity, i.reorder_point_quantity, 0);
```

---

# 28. Reportes soportados por el modelo

## 28.1. Stock actual

Fuente:

```text id="zthag6"
inventory_stock_balances
inventory_items
inventory_categories
inventory_units
inventory_storage_locations
```

Dimensiones:

```text id="mu7qvh"
item
category
unit
location
status
itemType
```

---

## 28.2. Movimientos por periodo

Fuente:

```text id="xzsrr0"
inventory_movements
```

Dimensiones:

```text id="a92wet"
movementType
movementDirection
status
item
location
supplier
referenceType
date
```

---

## 28.3. Consumo por mantenimiento

Fuente:

```text id="rcylsi"
inventory_consumptions
inventory_movements
inventory_items
```

Dimensiones:

```text id="qlkr05"
maintenanceWorkOrderId
maintenanceTaskId
item
category
location
period
```

---

## 28.4. Bajo stock

Fuente:

```text id="xi9r1p"
inventory_stock_balances
inventory_items
inventory_alerts
```

Dimensiones:

```text id="ev7dvn"
item
category
location
threshold
alertType
severity
```

---

## 28.5. Valorización referencial

Fuente:

```text id="yivzcb"
inventory_stock_balances.averageUnitCostAmount
inventory_items.referenceUnitCostAmount
inventory_movements.unitCostAmount
```

Regla:

```text id="pmrjb6"
Este reporte es referencial, no contable oficial.
```

---

# 29. Migración recomendada

Nombre:

```text id="gnjrdi"
023_create_inventory_basic
```

Contenido:

```text id="ahj4la"
- Crear enums Inventory.
- Crear inventory_categories.
- Crear inventory_units.
- Crear inventory_items.
- Crear inventory_storage_locations.
- Crear inventory_stock_balances.
- Crear inventory_movements.
- Crear inventory_stock_adjustments.
- Crear inventory_transfers.
- Crear inventory_consumptions.
- Crear inventory_documents.
- Crear inventory_alerts.
- Crear inventory_report_exports.
- Agregar relaciones internas.
- Agregar relaciones a Tenant.
- Agregar índices tenant-scoped.
- Agregar índices únicos parciales.
- Agregar constraints de cantidades.
- Agregar constraints de costos.
- Agregar constraints de estado.
- Agregar constraints de stock.
- Agregar constraints de transferencia.
- Extender Secure Document Storage sourceModule = inventoryBasic.
```

---

# 30. Seeds iniciales

## 30.1. Categorías

```text id="wu8jt7"
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

---

## 30.2. Unidades

```text id="vqyxic"
UNIT — Unidad — und
METER — Metro — m
LITER — Litro — L
GALLON — Galón — gal
KILOGRAM — Kilogramo — kg
PACKAGE — Paquete — pq
BOX — Caja — caja
ROLL — Rollo — rollo
PAIR — Par — par
SET — Juego — set
BOTTLE — Botella — botella
BAG — Saco — saco
```

---

## 30.3. Ubicaciones

```text id="itp1et"
MAIN_WAREHOUSE — Bodega principal
GUARDHOUSE — Garita
PUMP_ROOM — Cuarto de bombas
ADMIN_OFFICE — Oficina de administración
MAINTENANCE_ROOM — Área de mantenimiento
TECHNICAL_CABINET — Casillero técnico
TEMPORARY_STORAGE — Almacenamiento temporal
```

---

## 30.4. Ítems demo opcionales

```text id="u3vbho"
LED_BULB_12W — Foco LED 12W
PVC_VALVE_1_2 — Válvula PVC 1/2
CHLORINE_BOTTLE — Botella de cloro
INDUSTRIAL_BROOM — Escoba industrial
WORK_GLOVES — Guantes de trabajo
PAINT_WHITE_GAL — Pintura blanca galón
WATER_PUMP_SEAL — Sello bomba de agua
```

Regla:

```text id="yikzeo"
Los seeds deben usar datos ficticios y no deben incluir facturas, fotos, documentos, proveedores reales ni datos personales reales.
```

---

# 31. Compatibilidad con microservicios futuros

El modelo permite separación futura porque:

```text id="rli06e"
- usa UUID globales;
- tenant_id explícito;
- referencias externas por UUID;
- validación externa mediante puertos;
- movimientos como evento operacional;
- auditoría desacoplada;
- documentos vía SDS;
- reportes vía API;
- no depende de acceso directo a tablas de pagos, contabilidad o mantenimiento.
```

Recomendación:

```text id="gb1nuh"
Mantener Inventory Basic como módulo dentro del monolito modular hasta que el volumen de movimientos, integraciones de compra, bodegas o consumo justifique extracción física.
```

---

# 32. No aceptación del modelo

El modelo no debe aceptarse si:

```text id="cdkgx7"
- alguna tabla operativa no tiene tenant_id;
- permite consultar entidades tenant-scoped por id simple;
- no modela InventoryMovement como fuente de verdad;
- permite modificar directamente quantityOnHand desde API;
- permite modificar directamente quantityAvailable desde API;
- permite totalCostAmount desde cliente como fuente de verdad;
- usa float/double para cantidades;
- usa float/double para costos;
- permite cantidades negativas;
- permite costos negativos;
- permite salida mayor al stock disponible sin política explícita;
- permite transferencia a la misma ubicación;
- no modela reverse para movimientos posted;
- permite edición destructiva de movimiento posted;
- no soporta consumo vinculado a Maintenance Work Orders;
- modifica estados de Maintenance Work Orders;
- crea Payment;
- crea SupplierPaymentOrder;
- crea JournalEntry;
- confirma Bank Reconciliation;
- almacena storageKey;
- almacena signedUrl persistente;
- almacena base64;
- almacena binarios;
- crea endpoints públicos;
- crea endpoints /me;
- permite acceso desde WordPress público;
- no soporta auditoría;
- no soporta reportes básicos;
- no soporta exportaciones vía SDS.
```

---

# 33. Resultado esperado

Al implementar este modelo de datos, `023-inventory-basic` tendrá una base persistente segura y extensible para controlar inventario básico por tenant, con saldos trazables, movimientos auditables, integración operacional con mantenimiento, referencias limitadas a proveedores, documentos seguros y reportes básicos.

Resultado esperado:

```text id="reuduy"
inventory_categories modelado
inventory_units modelado
inventory_items modelado
inventory_storage_locations modelado
inventory_stock_balances modelado
inventory_movements modelado
inventory_stock_adjustments modelado
inventory_transfers modelado
inventory_consumptions modelado
inventory_documents modelado
inventory_alerts modelado
inventory_report_exports modelado
tenant isolation modelado
movement-driven stock modelado
stock snapshots modelados
Decimal quantities modeladas
Decimal costs modelados
entries modeladas
issues modeladas
adjustments modelados
transfers modeladas
maintenance consumptions modelados
SDS documents modelados
Supplier Payments references modeladas
low stock alerts modeladas
reports soportados
exports soportados
audit soportado
no direct payments
no SupplierPaymentOrder
no direct accounting
no Bank Reconciliation
no public endpoints
no /me endpoints
no WordPress access
no external AI with real data
```

---

# 34. Expediente actualizado

```text id="qwa206"
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
│   │       └── data-model.md
```
