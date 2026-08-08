# Spec — 023 Inventory Basic

## 1. Información del documento

| Campo                 | Valor                                                                                                                                         |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto              | RESIDENT Core                                                                                                                                 |
| Spec ID               | 023                                                                                                                                           |
| Módulo                | Inventory Basic                                                                                                                               |
| Documento             | Functional Specification                                                                                                                      |
| Ruta                  | `docs/specs/023-inventory-basic/spec.md`                                                                                                      |
| Versión               | 0.1                                                                                                                                           |
| Estado                | Borrador inicial                                                                                                                              |
| Fecha                 | 2026-07-23                                                                                                                                    |
| Fase                  | FASE 2 — RESIDENT Core                                                                                                                        |
| Arquitectura objetivo | Monolito modular preparado para microservicios                                                                                                |
| Stack objetivo        | NestJS / TypeScript / PostgreSQL / Prisma / OpenAPI / Keycloak                                                                                |
| Naturaleza            | Tenant-scoped / Operational / Stock-controlled / Movement-driven / Maintenance-aware / Supplier-aware / Cost-aware / Audit-heavy / Non-public |

---

## 2. Propósito

El módulo `023-inventory-basic` permite gestionar inventario básico de insumos, materiales, repuestos, herramientas menores y suministros operativos utilizados por la administración de cada conjunto residencial.

El módulo cubre el registro de ítems, categorías, unidades de medida, ubicaciones de almacenamiento, saldos de stock, movimientos de entrada, salida, ajuste, transferencia, consumo asociado a órdenes de mantenimiento, evidencias documentales, alertas de stock mínimo, reportes básicos y trazabilidad operativa.

Regla central:

```text id="y0r4xp"
Todo ítem, categoría, ubicación, saldo, movimiento, ajuste, transferencia, consumo, documento, costo referencial, alerta y reporte de Inventory Basic debe pertenecer a un tenant, respetar permisos, mantener stock no negativo salvo política controlada, registrar trazabilidad auditable, usar cantidades y costos seguros, integrarse con Maintenance Work Orders cuando exista consumo operativo, integrarse de forma limitada con Supplier Payments cuando exista referencia de proveedor o cuenta por pagar, no crear pagos directamente, no iniciar compras automáticas, no modificar contabilidad directamente, no exponer datos en endpoints públicos y no permitir acceso desde WordPress público.
```

---

## 3. Contexto dentro de RESIDENT Core

`Inventory Basic` pertenece al bounded context operativo y financiero-administrativo de RESIDENT Core.

Relación conceptual:

```text id="v3c4hn"
Supplier Payments
  └── registra proveedores, obligaciones y pagos

Inventory Basic
  ├── registra ítems
  ├── registra ubicaciones
  ├── controla saldos
  ├── registra entradas
  ├── registra salidas
  ├── registra ajustes
  ├── registra transferencias
  ├── registra consumo operativo
  └── reporta stock y valorización referencial

Maintenance Work Orders
  └── consume materiales, repuestos o suministros

Secure Document Storage
  └── almacena facturas, actas, evidencias, comprobantes y exports

Audit
  └── registra trazabilidad de operaciones críticas

Basic Reports
  └── consolida reportes operativos
```

---

## 4. Problema que resuelve

Sin un módulo formal de inventario, la administración del conjunto suele controlar insumos y repuestos mediante hojas de cálculo, mensajes informales o registros manuales.

Esto genera problemas como:

```text id="c7ns1a"
- pérdida de materiales;
- falta de trazabilidad de consumos;
- compras duplicadas;
- desconocimiento de stock disponible;
- imposibilidad de saber qué material se usó en una orden de mantenimiento;
- salidas sin responsable;
- ajustes sin justificación;
- ausencia de stock mínimo;
- falta de reportes de consumo;
- dificultad para auditar existencias;
- costos referenciales no controlados;
- pagos a proveedores sin vínculo operativo;
- conflictos por uso de insumos comunes.
```

Este módulo centraliza el control básico de inventario sin convertirse en un ERP completo, un sistema avanzado de compras, un módulo contable ni un sistema de activos fijos.

---

## 5. Objetivos funcionales

El módulo debe permitir:

```text id="pnpp33"
1. Crear categorías de inventario por tenant.
2. Crear unidades de medida.
3. Registrar ítems de inventario.
4. Clasificar ítems como consumibles, repuestos, herramientas menores o suministros.
5. Crear ubicaciones de almacenamiento.
6. Consultar saldos por ítem y ubicación.
7. Registrar entradas manuales de inventario.
8. Registrar salidas manuales de inventario.
9. Registrar consumo asociado a órdenes de mantenimiento.
10. Registrar ajustes positivos o negativos con justificación.
11. Registrar transferencias entre ubicaciones.
12. Asociar evidencias documentales mediante Secure Document Storage.
13. Asociar proveedor referencial.
14. Asociar costo unitario referencial.
15. Mantener stock mínimo por ítem.
16. Generar alertas de bajo stock.
17. Generar reportes básicos de stock, movimientos, consumos y alertas.
18. Exportar reportes vía Secure Document Storage.
19. Mantener auditoría completa.
20. Evitar endpoints públicos.
21. Impedir acceso desde WordPress público.
22. Impedir pagos directos desde inventario.
23. Impedir contabilidad directa desde inventario.
```

---

## 6. Principios de diseño

### 6.1. Tenant isolation obligatorio

Todo registro de inventario pertenece a un único tenant.

```text id="s118v8"
inventory tenant A != inventory tenant B
```

No debe existir catálogo global compartido en el MVP.

---

### 6.2. Movimiento como fuente de verdad

El saldo de inventario debe derivarse de movimientos auditables.

```text id="lkdi3t"
saldo inicial
+ entradas
+ ajustes positivos
+ transferencias entrantes
- salidas
- consumos
- ajustes negativos
- transferencias salientes
= saldo actual
```

El saldo puede persistirse como snapshot operacional, pero los movimientos son la fuente de reconstrucción.

---

### 6.3. Inventario no equivale a contabilidad

El módulo puede registrar costos referenciales, pero no publica asientos contables.

```text id="e4u4u2"
Inventory cost != Accounting Ledger posting
```

Cualquier impacto contable futuro debe pasar por `020-accounting-ledger` mediante módulo autorizado y ADR específico.

---

### 6.4. Inventario no equivale a compras

El módulo puede registrar entrada de inventario y proveedor referencial, pero no implementa flujo completo de compras.

```text id="o8mlox"
Inventory receipt != Purchase Order
Inventory receipt != Supplier Payment
```

---

### 6.5. Inventario no crea pagos

Si una entrada proviene de compra o proveedor, el pago debe gestionarse en `021-supplier-payments`.

```text id="dmv8cu"
Inventory Basic
  -> puede referenciar supplierId o supplierPayableId
Supplier Payments
  -> gobierna obligación por pagar y pago
```

---

### 6.6. Maintenance-aware

Cuando un material se consume en mantenimiento, debe existir vínculo con una orden de trabajo.

```text id="lbwkao"
MaintenanceWorkOrder
  -> InventoryConsumption
    -> InventoryMovement issue
```

---

### 6.7. Evidencia documental segura

Facturas, actas de recepción, fotografías, comprobantes o anexos deben almacenarse en `016-secure-document-storage`.

Prohibido exponer:

```text id="xj5w4h"
storageKey
signedUrl persistente
base64
raw file payload
```

---

### 6.8. No endpoints públicos

Inventory Basic es operativo y privado.

No debe exponerse a:

```text id="rwaf2x"
- visitantes públicos;
- portal WordPress público;
- endpoints /public;
- usuarios anónimos;
- proveedores externos en MVP;
- residentes en MVP.
```

---

## 7. Alcance MVP

Incluye:

```text id="st17ut"
- categorías de inventario;
- unidades de medida básicas;
- ítems de inventario;
- ubicaciones de almacenamiento;
- stock por ítem y ubicación;
- movimientos de entrada;
- movimientos de salida;
- ajustes positivos y negativos;
- transferencias entre ubicaciones;
- consumo asociado a Maintenance Work Orders;
- documentos de soporte vía Secure Document Storage;
- proveedor referencial opcional;
- costo unitario referencial;
- stock mínimo;
- alertas de bajo stock;
- reportes básicos;
- exportaciones vía Secure Document Storage;
- auditoría;
- logs y métricas;
- OpenAPI;
- tests de seguridad, multitenancy y consistencia de stock.
```

---

## 8. Fuera de alcance MVP

No incluye:

```text id="o83wmx"
- órdenes de compra completas;
- cotizaciones multi-proveedor;
- licitaciones;
- recepción avanzada de compras;
- aprobación avanzada de compras;
- inventario serializado avanzado;
- lotes con vencimiento obligatorio;
- códigos de barra o QR;
- RFID;
- conteo cíclico avanzado;
- inventario físico con app móvil offline;
- activos fijos;
- depreciación;
- contabilidad automática;
- costeo FIFO/LIFO avanzado;
- kardex contable oficial;
- almacenes complejos multi-bodega empresariales;
- integración con SRI;
- facturación electrónica;
- ventas;
- e-commerce;
- portal de proveedores;
- acceso de residentes;
- acceso WordPress público;
- IA externa con datos reales de inventario.
```

---

## 9. Actores

### 9.1. PlatformAdmin

Usuario de plataforma.

No accede automáticamente al inventario de tenants.

Acceso excepcional requiere tenant context, permiso explícito y auditoría reforzada.

---

### 9.2. TenantAdmin

Administrador del conjunto.

Puede configurar categorías, unidades, ítems, ubicaciones, consultar stock, revisar reportes y administrar movimientos según permisos.

---

### 9.3. InventoryManager

Responsable operativo del inventario.

Puede crear ítems, registrar entradas, salidas, ajustes, transferencias, consultar saldos y generar reportes según permisos.

---

### 9.4. MaintenanceManager

Responsable de mantenimiento.

Puede consultar disponibilidad y registrar consumos vinculados a órdenes de trabajo si tiene permisos.

---

### 9.5. InternalTechnician

Técnico interno.

Puede solicitar o registrar consumo de materiales asignados a una orden si la política del tenant lo permite.

En MVP, su acceso puede ser limitado.

---

### 9.6. FinancialManager

Responsable financiero.

Puede consultar costos referenciales, reportes y vínculos con Supplier Payments.

No ejecuta pagos desde este módulo.

---

### 9.7. Accountant

Puede consultar reportes de stock y costos referenciales si tiene permisos.

No contabiliza desde este módulo.

---

### 9.8. BoardMember

Puede consultar reportes resumidos si tiene permisos.

No opera movimientos por defecto.

---

### 9.9. Resident / PropertyOwner

No tiene acceso al módulo en MVP.

---

### 9.10. SupplierUser

No forma parte del MVP.

Los proveedores se registran y gobiernan desde `021-supplier-payments`.

---

### 9.11. System

Actor técnico que puede generar alertas, métricas, auditoría, reportes, exports y eventos internos.

---

## 10. Entidades principales

### 10.1. `InventoryCategory`

Categoría de inventario por tenant.

Ejemplos:

```text id="ro5824"
limpieza
plomería
electricidad
jardinería
seguridad
pintura
herramientas menores
repuestos
oficina
otros
```

Campos conceptuales:

```text id="x7qzds"
id
tenantId
categoryCode
categoryName
description
status
createdBy
updatedBy
archivedBy
createdAt
updatedAt
archivedAt
archiveReason
metadata
```

---

### 10.2. `InventoryUnitOfMeasure`

Unidad de medida.

Ejemplos:

```text id="pu0id2"
unidad
metro
litro
galón
kilogramo
paquete
caja
rollo
par
juego
botella
saco
```

Campos conceptuales:

```text id="r0fupq"
id
tenantId
unitCode
unitName
unitSymbol
allowsDecimals
decimalPrecision
status
createdBy
updatedBy
archivedBy
createdAt
updatedAt
archivedAt
archiveReason
metadata
```

Regla:

```text id="ocam8f"
Las cantidades deben respetar la configuración de la unidad de medida.
```

---

### 10.3. `InventoryItem`

Ítem de inventario.

Campos conceptuales:

```text id="bb9mh1"
id
tenantId
itemCode
itemName
description
categoryId
unitOfMeasureId
itemType
stockTrackingMode
defaultStorageLocationId
minimumStockQuantity
reorderPointQuantity
referenceUnitCostAmount
currency
preferredSupplierId
status
createdBy
updatedBy
archivedBy
createdAt
updatedAt
archivedAt
archiveReason
metadata
```

Tipos:

```text id="e90l6d"
consumable
sparePart
minorTool
supply
safetyEquipment
cleaningSupply
officeSupply
other
```

Estados:

```text id="id7d9n"
draft
active
inactive
archived
```

---

### 10.4. `InventoryStorageLocation`

Ubicación de almacenamiento.

Ejemplos:

```text id="cavihl"
bodega principal
garita
cuarto de bombas
oficina de administración
área de mantenimiento
casillero técnico
```

Campos conceptuales:

```text id="vztclc"
id
tenantId
locationCode
locationName
description
locationType
responsibleUserId
status
createdBy
updatedBy
archivedBy
createdAt
updatedAt
archivedAt
archiveReason
metadata
```

Tipos:

```text id="h4osgr"
warehouse
maintenanceRoom
guardhouse
office
technicalCabinet
temporary
other
```

---

### 10.5. `InventoryStockBalance`

Saldo actual por ítem y ubicación.

Campos conceptuales:

```text id="gc0w5l"
id
tenantId
itemId
storageLocationId
quantityOnHand
quantityReserved
quantityAvailable
averageUnitCostAmount
currency
lastMovementAt
createdAt
updatedAt
metadata
```

Fórmula conceptual:

```text id="g0n1ac"
quantityAvailable = quantityOnHand - quantityReserved
```

Regla:

```text id="ukkngk"
El saldo puede persistirse para performance, pero debe ser reconstruible desde InventoryMovement.
```

---

### 10.6. `InventoryMovement`

Movimiento de inventario.

Campos conceptuales:

```text id="tshcol"
id
tenantId
movementNumber
itemId
storageLocationId
targetStorageLocationId
movementType
movementDirection
quantity
unitCostAmount
totalCostAmount
currency
reason
referenceType
referenceId
supplierId
supplierPayableId
maintenanceWorkOrderId
maintenanceTaskId
secureDocumentId
status
createdBy
approvedBy
cancelledBy
createdAt
approvedAt
cancelledAt
cancelReason
metadata
```

Tipos:

```text id="v1k59j"
openingBalance
receipt
issue
maintenanceConsumption
adjustmentIncrease
adjustmentDecrease
transferOut
transferIn
returnToStock
correction
```

Direcciones:

```text id="lm87v2"
in
out
neutral
```

Estados:

```text id="p43hd5"
draft
posted
cancelled
reversed
archived
```

Regla:

```text id="zf64ws"
Solo movimientos posted afectan stock.
```

---

### 10.7. `InventoryStockAdjustment`

Ajuste de stock.

Campos conceptuales:

```text id="kvwzld"
id
tenantId
adjustmentNumber
itemId
storageLocationId
adjustmentType
quantity
reason
secureDocumentId
movementId
status
requestedBy
approvedBy
rejectedBy
cancelledBy
createdAt
approvedAt
rejectedAt
cancelledAt
rejectReason
cancelReason
metadata
```

Tipos:

```text id="fdjdix"
increase
decrease
correction
loss
damage
found
expired
other
```

Regla:

```text id="mh2ph6"
Todo ajuste debe tener razón y movimiento asociado cuando se contabiliza operacionalmente.
```

---

### 10.8. `InventoryTransfer`

Transferencia entre ubicaciones.

Campos conceptuales:

```text id="doavkw"
id
tenantId
transferNumber
itemId
sourceStorageLocationId
targetStorageLocationId
quantity
reason
outMovementId
inMovementId
status
createdBy
postedBy
cancelledBy
createdAt
postedAt
cancelledAt
cancelReason
metadata
```

Estados:

```text id="l4igfs"
draft
posted
cancelled
reversed
archived
```

Regla:

```text id="tow1re"
Una transferencia posted debe crear un movimiento de salida y uno de entrada dentro del mismo tenant.
```

---

### 10.9. `InventoryConsumption`

Consumo operativo de inventario.

Campos conceptuales:

```text id="emq4up"
id
tenantId
consumptionNumber
itemId
storageLocationId
quantity
maintenanceWorkOrderId
maintenanceTaskId
consumedByUserId
reason
movementId
status
createdBy
postedBy
cancelledBy
createdAt
postedAt
cancelledAt
cancelReason
metadata
```

Estados:

```text id="wq0rpf"
draft
posted
cancelled
reversed
archived
```

Regla:

```text id="nyj8dd"
Todo consumo posted debe generar un movimiento maintenanceConsumption y debe vincularse a una orden de mantenimiento válida.
```

---

### 10.10. `InventoryDocument`

Documento asociado a ítem, movimiento, ajuste, transferencia o consumo.

Campos conceptuales:

```text id="hg2m2g"
id
tenantId
entityType
entityId
secureDocumentId
documentType
description
visibility
status
createdBy
archivedBy
createdAt
archivedAt
archiveReason
metadata
```

Tipos:

```text id="rfhsjm"
invoice
receipt
deliveryNote
adjustmentSupport
photo
technicalReport
inventoryCount
other
```

---

### 10.11. `InventoryAlert`

Alerta de inventario.

Campos conceptuales:

```text id="v1tioa"
id
tenantId
itemId
storageLocationId
alertType
severity
status
currentQuantity
thresholdQuantity
createdAt
acknowledgedBy
acknowledgedAt
resolvedAt
metadata
```

Tipos:

```text id="fke705"
lowStock
outOfStock
negativeStockAttempt
inactiveItemUsed
archivedLocationUsed
```

---

### 10.12. `InventoryReportExport`

Exportación de reporte de inventario.

Campos conceptuales:

```text id="i9sau5"
id
tenantId
reportType
format
filters
secureDocumentId
status
requestedBy
createdAt
completedAt
failedAt
failureReason
metadata
```

---

## 11. Reglas de negocio

### 11.1. Reglas generales

```text id="ypx95y"
BR-001: Toda entidad debe incluir tenantId.
BR-002: Ninguna entidad tenant-scoped puede consultarse solo por id.
BR-003: El cliente no puede enviar tenantId.
BR-004: El cliente no puede enviar actor fields.
BR-005: Todo cambio crítico debe auditarse.
BR-006: No deben existir endpoints públicos.
BR-007: WordPress público no debe acceder a inventario.
BR-008: Inventory Basic no debe crear pagos.
BR-009: Inventory Basic no debe crear SupplierPaymentOrder.
BR-010: Inventory Basic no debe crear JournalEntry.
BR-011: Inventory Basic no debe confirmar Bank Reconciliation.
BR-012: Todo documento debe almacenarse vía Secure Document Storage.
BR-013: Ningún response debe exponer storageKey.
```

---

### 11.2. Ítems

```text id="ls2h7z"
BR-014: itemCode debe ser único por tenant entre ítems no archivados.
BR-015: Un ítem active puede recibir movimientos.
BR-016: Un ítem inactive no debe recibir nuevos movimientos salvo ajuste autorizado.
BR-017: Un ítem archived no debe recibir movimientos.
BR-018: categoryId debe pertenecer al mismo tenant.
BR-019: unitOfMeasureId debe pertenecer al mismo tenant.
BR-020: preferredSupplierId debe validarse contra Supplier Payments si existe.
BR-021: referenceUnitCostAmount debe ser Decimal y no negativo.
BR-022: minimumStockQuantity no puede ser negativa.
BR-023: reorderPointQuantity no puede ser negativa.
```

---

### 11.3. Ubicaciones

```text id="q1f4rj"
BR-024: locationCode debe ser único por tenant.
BR-025: Una ubicación active puede recibir movimientos.
BR-026: Una ubicación inactive no debe recibir nuevos movimientos salvo ajuste autorizado.
BR-027: Una ubicación archived no debe recibir movimientos.
BR-028: responsibleUserId debe tener membership activo en el tenant.
```

---

### 11.4. Saldos

```text id="hhs6ru"
BR-029: Todo saldo debe pertenecer a un tenant.
BR-030: El saldo debe ser único por itemId y storageLocationId.
BR-031: quantityOnHand no debe ser negativa salvo política explícita.
BR-032: quantityReserved no debe exceder quantityOnHand.
BR-033: quantityAvailable debe calcularse como quantityOnHand - quantityReserved.
BR-034: Solo movimientos posted afectan saldos.
BR-035: Todo cambio de saldo debe ser trazable a InventoryMovement.
```

---

### 11.5. Movimientos

```text id="luptcb"
BR-036: Todo movimiento debe tener movementNumber único por tenant.
BR-037: Todo movimiento debe tener itemId tenant-scoped.
BR-038: Todo movimiento debe tener storageLocationId tenant-scoped.
BR-039: quantity debe ser Decimal positivo.
BR-040: unitCostAmount debe ser Decimal no negativo si existe.
BR-041: totalCostAmount debe calcularse server-side.
BR-042: movementDirection debe derivarse de movementType.
BR-043: Un movimiento draft no afecta stock.
BR-044: Un movimiento posted afecta stock.
BR-045: Un movimiento cancelled no afecta stock.
BR-046: Un movimiento reversed debe generar trazabilidad de reverso.
BR-047: No se permite editar destructivamente un movimiento posted.
BR-048: Una salida no puede dejar stock negativo salvo política autorizada.
BR-049: Todo movimiento manual debe tener reason.
BR-050: Todo movimiento con documento debe usar secureDocumentId.
```

---

### 11.6. Entradas

```text id="ahp0w5"
BR-051: Una entrada posted incrementa stock.
BR-052: Una entrada puede tener supplierId referencial.
BR-053: Una entrada puede tener supplierPayableId referencial.
BR-054: supplierId debe pertenecer al tenant.
BR-055: supplierPayableId debe pertenecer al tenant.
BR-056: Una entrada no crea pago.
BR-057: Una entrada no aprueba pago.
BR-058: Una entrada no crea SupplierPaymentOrder.
```

---

### 11.7. Salidas y consumos

```text id="k1n9ge"
BR-059: Una salida posted disminuye stock.
BR-060: Un consumo posted debe vincularse a Maintenance Work Order.
BR-061: maintenanceWorkOrderId debe pertenecer al tenant.
BR-062: maintenanceTaskId debe pertenecer a la orden si existe.
BR-063: La cantidad consumida no puede exceder stock disponible salvo política explícita.
BR-064: El consumo debe registrar responsable o actor server-side.
BR-065: El consumo no cierra automáticamente la orden de mantenimiento.
```

---

### 11.8. Ajustes

```text id="qxuqyj"
BR-066: Todo ajuste debe tener reason.
BR-067: Todo ajuste negativo debe validar stock disponible.
BR-068: Todo ajuste posted debe crear InventoryMovement.
BR-069: Todo ajuste rejected requiere reason.
BR-070: Todo ajuste cancelled requiere reason.
BR-071: Los ajustes deben auditarse con severidad operativa alta.
```

---

### 11.9. Transferencias

```text id="dch6m6"
BR-072: sourceStorageLocationId y targetStorageLocationId deben pertenecer al tenant.
BR-073: sourceStorageLocationId no puede ser igual a targetStorageLocationId.
BR-074: Una transferencia posted debe crear movement transferOut y transferIn.
BR-075: La transferencia no puede dejar stock negativo en origen.
BR-076: Una transferencia posted no puede editarse destructivamente.
BR-077: Una transferencia cancelled requiere reason.
```

---

### 11.10. Alertas

```text id="k0oqfp"
BR-078: Si quantityAvailable <= minimumStockQuantity, se puede generar lowStock.
BR-079: Si quantityAvailable = 0, se puede generar outOfStock.
BR-080: Las alertas deben ser tenant-scoped.
BR-081: Una alerta acknowledged no elimina el estado de bajo stock.
BR-082: Una alerta resolved requiere que la condición deje de cumplirse o que exista resolución administrativa.
```

---

### 11.11. Reportes y exportaciones

```text id="yvq46e"
BR-083: Todo reporte debe filtrar por tenant.
BR-084: Todo reporte debe validar permisos.
BR-085: Todo monto debe exponerse como string decimal.
BR-086: Toda exportación debe usar Secure Document Storage.
BR-087: Ninguna exportación debe devolver storageKey.
BR-088: La generación de reportes debe auditarse si contiene información sensible.
```

---

## 12. Estados

### 12.1. `InventoryItemStatus`

```text id="h4qtw8"
draft
active
inactive
archived
```

Transiciones permitidas:

```text id="ng5eo5"
draft -> active
active -> inactive
inactive -> active
active -> archived
inactive -> archived
draft -> archived
```

---

### 12.2. `InventoryLocationStatus`

```text id="c5e53a"
active
inactive
archived
```

---

### 12.3. `InventoryMovementStatus`

```text id="oat491"
draft
posted
cancelled
reversed
archived
```

Transiciones permitidas:

```text id="yfqhoj"
draft -> posted
draft -> cancelled
posted -> reversed
posted -> archived
cancelled -> archived
reversed -> archived
```

---

### 12.4. `InventoryAdjustmentStatus`

```text id="so3gfd"
draft
submitted
approved
rejected
posted
cancelled
archived
```

Transiciones permitidas:

```text id="qi50me"
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

---

### 12.5. `InventoryTransferStatus`

```text id="r0k6md"
draft
posted
cancelled
reversed
archived
```

---

### 12.6. `InventoryConsumptionStatus`

```text id="oal614"
draft
posted
cancelled
reversed
archived
```

---

### 12.7. `InventoryAlertStatus`

```text id="hvgjol"
open
acknowledged
resolved
dismissed
archived
```

---

## 13. Tipos y enums principales

### 13.1. `InventoryItemType`

```text id="dwjjz7"
consumable
sparePart
minorTool
supply
safetyEquipment
cleaningSupply
officeSupply
other
```

---

### 13.2. `InventoryStockTrackingMode`

```text id="o7hqq8"
quantityOnly
quantityAndCost
nonTrackedReference
```

Regla:

```text id="clhhrl"
En MVP, el modo principal será quantityAndCost para ítems controlados y quantityOnly para ítems sin valorización referencial.
```

---

### 13.3. `InventoryMovementType`

```text id="awww3x"
openingBalance
receipt
issue
maintenanceConsumption
adjustmentIncrease
adjustmentDecrease
transferOut
transferIn
returnToStock
correction
```

---

### 13.4. `InventoryMovementDirection`

```text id="oitf28"
in
out
neutral
```

---

### 13.5. `InventoryReferenceType`

```text id="s3ikpv"
manual
supplierReceipt
maintenanceWorkOrder
maintenanceTask
stockAdjustment
stockTransfer
stockCount
correction
other
```

---

### 13.6. `InventoryDocumentType`

```text id="tqffgt"
invoice
receipt
deliveryNote
adjustmentSupport
photo
technicalReport
inventoryCount
other
```

---

### 13.7. `InventoryAlertType`

```text id="y45bbp"
lowStock
outOfStock
negativeStockAttempt
inactiveItemUsed
archivedLocationUsed
```

---

### 13.8. `Currency`

```text id="t01rb4"
USD
```

---

## 14. User stories

### 14.1. Catálogo e inventario base

```text id="rivtyu"
US-001: Como administrador, quiero crear categorías de inventario para clasificar los insumos del conjunto.
US-002: Como administrador, quiero crear unidades de medida para registrar cantidades correctamente.
US-003: Como encargado de inventario, quiero registrar ítems para controlar existencias.
US-004: Como encargado de inventario, quiero crear ubicaciones de almacenamiento para saber dónde se encuentran los materiales.
```

---

### 14.2. Stock y movimientos

```text id="ff40xc"
US-005: Como encargado de inventario, quiero registrar entradas para aumentar stock.
US-006: Como encargado de inventario, quiero registrar salidas para disminuir stock.
US-007: Como encargado de inventario, quiero ajustar stock con justificación cuando exista diferencia física.
US-008: Como encargado de inventario, quiero transferir ítems entre ubicaciones.
US-009: Como administrador, quiero consultar saldos por ítem y ubicación.
```

---

### 14.3. Mantenimiento

```text id="jne12y"
US-010: Como responsable de mantenimiento, quiero registrar consumo de materiales en una orden de trabajo.
US-011: Como técnico autorizado, quiero registrar qué material usé en una tarea asignada.
US-012: Como administrador, quiero saber qué materiales se consumieron en cada orden de mantenimiento.
```

---

### 14.4. Proveedores y documentos

```text id="a9zhh7"
US-013: Como encargado de inventario, quiero asociar una entrada a un proveedor referencial.
US-014: Como encargado de inventario, quiero adjuntar factura o acta de recepción de forma segura.
US-015: Como financiero, quiero consultar el vínculo entre entrada de inventario y cuenta por pagar cuando exista.
```

---

### 14.5. Alertas y reportes

```text id="zgxg7e"
US-016: Como encargado de inventario, quiero recibir alertas de bajo stock.
US-017: Como administrador, quiero consultar reportes de existencias.
US-018: Como administrador, quiero consultar movimientos por periodo.
US-019: Como financiero, quiero consultar costos referenciales de inventario.
US-020: Como administrador, quiero exportar reportes de inventario de forma segura.
```

---

## 15. Requisitos funcionales

### 15.1. Configuración

```text id="ul55ot"
FR-001: El sistema debe permitir crear categorías de inventario por tenant.
FR-002: El sistema debe permitir actualizar categorías.
FR-003: El sistema debe permitir archivar categorías sin borrar historial.
FR-004: El sistema debe permitir crear unidades de medida.
FR-005: El sistema debe permitir configurar si una unidad permite decimales.
FR-006: El sistema debe permitir crear ubicaciones de almacenamiento.
FR-007: El sistema debe permitir archivar ubicaciones sin borrar historial.
```

---

### 15.2. Ítems

```text id="iabjth"
FR-008: El sistema debe permitir crear ítems de inventario.
FR-009: El sistema debe permitir actualizar ítems.
FR-010: El sistema debe permitir activar, inactivar y archivar ítems.
FR-011: El sistema debe permitir definir stock mínimo.
FR-012: El sistema debe permitir definir costo unitario referencial.
FR-013: El sistema debe permitir asociar proveedor preferido.
FR-014: El sistema debe impedir movimientos nuevos sobre ítems archivados.
```

---

### 15.3. Stock

```text id="zy0890"
FR-015: El sistema debe consultar stock por ítem.
FR-016: El sistema debe consultar stock por ubicación.
FR-017: El sistema debe consultar stock disponible.
FR-018: El sistema debe recalcular saldos desde movimientos si es necesario.
FR-019: El sistema debe impedir stock negativo salvo política explícita.
```

---

### 15.4. Movimientos

```text id="sjw10d"
FR-020: El sistema debe registrar entrada de inventario.
FR-021: El sistema debe registrar salida de inventario.
FR-022: El sistema debe registrar movimiento inicial de apertura.
FR-023: El sistema debe registrar retorno a stock.
FR-024: El sistema debe registrar correcciones controladas.
FR-025: El sistema debe generar movementNumber server-side.
FR-026: El sistema debe permitir cancelar movimiento draft.
FR-027: El sistema debe permitir reversar movimiento posted mediante operación controlada.
```

---

### 15.5. Ajustes

```text id="hhvuwn"
FR-028: El sistema debe crear ajuste de stock.
FR-029: El sistema debe someter ajuste a aprobación si la política lo exige.
FR-030: El sistema debe aprobar ajuste.
FR-031: El sistema debe rechazar ajuste con razón.
FR-032: El sistema debe postear ajuste aprobado.
FR-033: El sistema debe crear movimiento asociado al ajuste.
```

---

### 15.6. Transferencias

```text id="mwze0n"
FR-034: El sistema debe crear transferencia entre ubicaciones.
FR-035: El sistema debe validar stock disponible en origen.
FR-036: El sistema debe postear transferencia.
FR-037: El sistema debe crear movimiento de salida y entrada.
FR-038: El sistema debe cancelar transferencia draft con razón.
FR-039: El sistema debe reversar transferencia posted mediante operación controlada.
```

---

### 15.7. Consumo en mantenimiento

```text id="npmpnn"
FR-040: El sistema debe registrar consumo asociado a Maintenance Work Order.
FR-041: El sistema debe validar que la orden de mantenimiento pertenezca al tenant.
FR-042: El sistema debe validar que la tarea pertenezca a la orden si se informa.
FR-043: El sistema debe disminuir stock al postear consumo.
FR-044: El sistema debe impedir consumo mayor al stock disponible salvo política explícita.
FR-045: El sistema debe permitir consultar consumos por orden de mantenimiento.
```

---

### 15.8. Documentos

```text id="p4vgwu"
FR-046: El sistema debe asociar documentos a ítems, movimientos, ajustes, transferencias o consumos.
FR-047: El sistema debe validar documentos mediante Secure Document Storage.
FR-048: El sistema debe impedir storageKey en requests y responses.
FR-049: El sistema debe auditar descargas de documentos si aplica.
```

---

### 15.9. Alertas

```text id="tazn5f"
FR-050: El sistema debe generar alerta de bajo stock.
FR-051: El sistema debe generar alerta de stock cero.
FR-052: El sistema debe permitir reconocer una alerta.
FR-053: El sistema debe permitir resolver una alerta.
FR-054: El sistema debe listar alertas abiertas.
```

---

### 15.10. Reportes

```text id="sgjseh"
FR-055: El sistema debe generar reporte de stock actual.
FR-056: El sistema debe generar reporte de movimientos por periodo.
FR-057: El sistema debe generar reporte de consumo por mantenimiento.
FR-058: El sistema debe generar reporte de bajo stock.
FR-059: El sistema debe generar reporte de valorización referencial.
FR-060: El sistema debe exportar reportes vía Secure Document Storage.
```

---

## 16. Requisitos no funcionales

### 16.1. Seguridad

```text id="yg9noh"
NFR-001: Todos los endpoints requieren autenticación.
NFR-002: Todos los endpoints requieren tenant context.
NFR-003: Todos los endpoints requieren permisos.
NFR-004: No debe existir API pública.
NFR-005: WordPress público no debe acceder al módulo.
NFR-006: Ningún response debe exponer storageKey.
NFR-007: Ningún DTO debe aceptar tenantId.
NFR-008: Ningún DTO debe aceptar actor fields.
```

---

### 16.2. Integridad de stock

```text id="i5a6fo"
NFR-009: Toda variación de stock debe derivar de movimiento posted.
NFR-010: Los movimientos posted no deben editarse destructivamente.
NFR-011: Las operaciones críticas deben ser transaccionales.
NFR-012: El sistema debe prevenir stock negativo salvo política explícita.
```

---

### 16.3. Auditoría

```text id="jk60ic"
NFR-013: Toda creación de movimiento debe auditarse.
NFR-014: Todo posteo de movimiento debe auditarse.
NFR-015: Todo ajuste debe auditarse.
NFR-016: Toda transferencia debe auditarse.
NFR-017: Todo consumo de mantenimiento debe auditarse.
NFR-018: Toda exportación debe auditarse.
```

---

### 16.4. Performance

```text id="ezvgqg"
NFR-019: Listado de ítems paginados p95 < 800 ms.
NFR-020: Consulta de stock paginada p95 < 1000 ms.
NFR-021: Listado de movimientos paginado p95 < 1200 ms.
NFR-022: Reporte de stock p95 < 1500 ms.
NFR-023: Reporte de movimientos p95 < 2000 ms.
```

---

### 16.5. Privacidad

```text id="wgi0fs"
NFR-024: No se deben enviar datos reales de inventario a IA externa.
NFR-025: No se deben incluir documentos completos en logs.
NFR-026: No se deben incluir costos internos en logs innecesarios.
NFR-027: No se deben exponer documentos de proveedor a roles no autorizados.
```

---

## 17. Permisos

### 17.1. Categorías y unidades

```text id="gegnn8"
inventoryCategories.create
inventoryCategories.read
inventoryCategories.update
inventoryCategories.archive

inventoryUnits.create
inventoryUnits.read
inventoryUnits.update
inventoryUnits.archive
```

---

### 17.2. Ítems y ubicaciones

```text id="mnbzkj"
inventoryItems.create
inventoryItems.read
inventoryItems.update
inventoryItems.activate
inventoryItems.deactivate
inventoryItems.archive

inventoryLocations.create
inventoryLocations.read
inventoryLocations.update
inventoryLocations.archive
```

---

### 17.3. Stock y movimientos

```text id="bukdc0"
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

### 17.4. Ajustes y transferencias

```text id="e4eorg"
inventoryAdjustments.create
inventoryAdjustments.read
inventoryAdjustments.submit
inventoryAdjustments.approve
inventoryAdjustments.reject
inventoryAdjustments.post
inventoryAdjustments.cancel
inventoryAdjustments.archive

inventoryTransfers.create
inventoryTransfers.read
inventoryTransfers.post
inventoryTransfers.cancel
inventoryTransfers.reverse
inventoryTransfers.archive
```

---

### 17.5. Consumos

```text id="g6dhx2"
inventoryConsumptions.create
inventoryConsumptions.read
inventoryConsumptions.post
inventoryConsumptions.cancel
inventoryConsumptions.reverse
inventoryConsumptions.archive
inventoryConsumptions.byWorkOrder.read
```

---

### 17.6. Documentos, alertas y reportes

```text id="i4x0hh"
inventoryDocuments.create
inventoryDocuments.read
inventoryDocuments.archive
inventoryDocuments.download

inventoryAlerts.read
inventoryAlerts.acknowledge
inventoryAlerts.resolve
inventoryAlerts.dismiss
inventoryAlerts.archive

inventoryReports.read
inventoryReports.export
inventoryReports.stock
inventoryReports.movements
inventoryReports.consumption
inventoryReports.lowStock
inventoryReports.valuation
```

---

## 18. API preliminar

### 18.1. Tenant admin API

```text id="feqgum"
GET    /api/v1/tenant/inventory-categories
POST   /api/v1/tenant/inventory-categories
GET    /api/v1/tenant/inventory-categories/{categoryId}
PATCH  /api/v1/tenant/inventory-categories/{categoryId}
POST   /api/v1/tenant/inventory-categories/{categoryId}/archive

GET    /api/v1/tenant/inventory-units
POST   /api/v1/tenant/inventory-units
GET    /api/v1/tenant/inventory-units/{unitId}
PATCH  /api/v1/tenant/inventory-units/{unitId}
POST   /api/v1/tenant/inventory-units/{unitId}/archive

GET    /api/v1/tenant/inventory-items
POST   /api/v1/tenant/inventory-items
GET    /api/v1/tenant/inventory-items/{itemId}
PATCH  /api/v1/tenant/inventory-items/{itemId}
POST   /api/v1/tenant/inventory-items/{itemId}/activate
POST   /api/v1/tenant/inventory-items/{itemId}/deactivate
POST   /api/v1/tenant/inventory-items/{itemId}/archive

GET    /api/v1/tenant/inventory-locations
POST   /api/v1/tenant/inventory-locations
GET    /api/v1/tenant/inventory-locations/{locationId}
PATCH  /api/v1/tenant/inventory-locations/{locationId}
POST   /api/v1/tenant/inventory-locations/{locationId}/archive
```

---

### 18.2. Stock and movements API

```text id="xgij2y"
GET    /api/v1/tenant/inventory-stock
GET    /api/v1/tenant/inventory-stock/{itemId}
POST   /api/v1/tenant/inventory-stock/recalculate

GET    /api/v1/tenant/inventory-movements
POST   /api/v1/tenant/inventory-movements
GET    /api/v1/tenant/inventory-movements/{movementId}
POST   /api/v1/tenant/inventory-movements/{movementId}/post
POST   /api/v1/tenant/inventory-movements/{movementId}/cancel
POST   /api/v1/tenant/inventory-movements/{movementId}/reverse
POST   /api/v1/tenant/inventory-movements/{movementId}/archive
```

---

### 18.3. Adjustments, transfers and consumption API

```text id="yo3ssl"
GET    /api/v1/tenant/inventory-adjustments
POST   /api/v1/tenant/inventory-adjustments
GET    /api/v1/tenant/inventory-adjustments/{adjustmentId}
POST   /api/v1/tenant/inventory-adjustments/{adjustmentId}/submit
POST   /api/v1/tenant/inventory-adjustments/{adjustmentId}/approve
POST   /api/v1/tenant/inventory-adjustments/{adjustmentId}/reject
POST   /api/v1/tenant/inventory-adjustments/{adjustmentId}/post
POST   /api/v1/tenant/inventory-adjustments/{adjustmentId}/cancel

GET    /api/v1/tenant/inventory-transfers
POST   /api/v1/tenant/inventory-transfers
GET    /api/v1/tenant/inventory-transfers/{transferId}
POST   /api/v1/tenant/inventory-transfers/{transferId}/post
POST   /api/v1/tenant/inventory-transfers/{transferId}/cancel
POST   /api/v1/tenant/inventory-transfers/{transferId}/reverse

GET    /api/v1/tenant/inventory-consumptions
POST   /api/v1/tenant/inventory-consumptions
GET    /api/v1/tenant/inventory-consumptions/{consumptionId}
POST   /api/v1/tenant/inventory-consumptions/{consumptionId}/post
POST   /api/v1/tenant/inventory-consumptions/{consumptionId}/cancel
POST   /api/v1/tenant/inventory-consumptions/{consumptionId}/reverse
GET    /api/v1/tenant/maintenance-work-orders/{workOrderId}/inventory-consumptions
```

---

### 18.4. Documents, alerts and reports API

```text id="ld147j"
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

### 18.5. Endpoints `/me`

No se implementan en MVP.

Prohibido:

```text id="wokc9b"
GET  /api/v1/me/inventory-items
GET  /api/v1/me/inventory-stock
GET  /api/v1/me/inventory-movements
POST /api/v1/me/inventory-consumptions
```

Respuesta esperada:

```text id="i6m70o"
404 Not Found
```

---

### 18.6. Endpoints públicos prohibidos

No crear:

```text id="w3e2cg"
GET  /api/v1/public/inventory-items
GET  /api/v1/public/inventory-stock
GET  /api/v1/public/inventory-movements
GET  /api/v1/public/inventory-reports
GET  /api/v1/public/tenants/{slug}/inventory-items
GET  /api/v1/public/tenants/{slug}/inventory-stock
```

Respuesta esperada:

```text id="yvrj5m"
404 Not Found
```

---

## 19. Integraciones

### 19.1. `016-secure-document-storage`

Uso:

```text id="d9rleu"
- facturas;
- recibos;
- actas de recepción;
- evidencias de ajuste;
- fotografías;
- reportes técnicos;
- inventarios físicos;
- exportaciones.
```

Metadata recomendada:

```text id="zv3lrh"
sourceModule = inventoryBasic
visibility = administrative
sensitivity = internal | restricted
```

Regla:

```text id="bioi3s"
Inventory Basic no almacena archivos ni expone storageKey.
```

---

### 19.2. `022-maintenance-work-orders`

Uso:

```text id="qplfly"
- validar maintenanceWorkOrderId;
- validar maintenanceTaskId;
- registrar consumo de materiales;
- consultar consumos asociados a una orden;
- alimentar reportes de costo operativo referencial.
```

Regla:

```text id="jbpnjc"
Inventory puede registrar consumo vinculado a Maintenance Work Orders, pero no cierra órdenes ni modifica estados de mantenimiento.
```

---

### 19.3. `021-supplier-payments`

Uso:

```text id="vzqyol"
- validar supplierId;
- validar supplierPayableId referencial;
- asociar entrada de inventario con proveedor o payable;
- consultar datos mínimos del proveedor.
```

Prohibido:

```text id="nlulmn"
- crear SupplierPaymentOrder;
- marcar payable como paid;
- iniciar transferencia bancaria;
- modificar cuenta bancaria de proveedor;
- modificar estado de pago.
```

---

### 19.4. `020-accounting-ledger`

Uso directo MVP:

```text id="q012zj"
ninguno
```

Prohibido:

```text id="m4cmqw"
- crear JournalEntry;
- crear JournalEntryLine;
- postear asientos;
- modificar periodos contables;
- modificar balances.
```

---

### 19.5. `017-bank-reconciliation`

Uso directo MVP:

```text id="cvqg01"
ninguno
```

Prohibido:

```text id="qz6nzg"
- crear BankTransaction;
- crear ReconciliationMatch;
- confirmar conciliación;
- modificar movimientos bancarios.
```

---

### 19.6. `007-audit`

Todo evento crítico debe auditarse.

Eventos mínimos:

```text id="fsivsu"
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

### 19.7. `008-basic-reports`

Uso:

```text id="r6n8hj"
- reportes operativos básicos;
- posible integración futura con dashboard;
- exportaciones;
- filtros por periodo, categoría, ubicación, estado y tipo.
```

---

## 20. Flujos principales

### 20.1. Crear ítem de inventario

```text id="tngtb8"
1. InventoryManager crea categoría si no existe.
2. InventoryManager crea unidad de medida si no existe.
3. InventoryManager crea ítem.
4. Sistema genera itemCode o valida itemCode.
5. Sistema valida categoryId y unitOfMeasureId tenant-scoped.
6. Sistema guarda ítem draft o active.
7. Sistema audita inventoryItem.created.
```

---

### 20.2. Registrar entrada

```text id="lnfp2p"
1. InventoryManager registra movimiento receipt.
2. Sistema valida item active.
3. Sistema valida ubicación active.
4. Sistema valida supplierId si existe.
5. Sistema valida secureDocumentId si existe.
6. Sistema calcula totalCostAmount.
7. Sistema crea movimiento draft o posted según política.
8. Si se postea, incrementa stock.
9. Sistema audita inventoryMovement.posted.
```

---

### 20.3. Registrar salida manual

```text id="qkzi2j"
1. InventoryManager registra movimiento issue.
2. Sistema valida stock disponible.
3. Sistema exige reason.
4. Sistema crea movimiento.
5. Si se postea, disminuye stock.
6. Sistema audita.
```

---

### 20.4. Consumir material en mantenimiento

```text id="vc7639"
1. MaintenanceManager selecciona orden de mantenimiento.
2. Sistema valida maintenanceWorkOrderId tenant-scoped.
3. Sistema valida item active.
4. Sistema valida ubicación active.
5. Sistema valida stock disponible.
6. Sistema crea InventoryConsumption.
7. Sistema crea InventoryMovement maintenanceConsumption.
8. Sistema descuenta stock.
9. Sistema no modifica estado de la orden.
10. Sistema audita inventoryConsumption.posted.
```

---

### 20.5. Ajuste de stock

```text id="u01kuj"
1. InventoryManager crea ajuste con reason.
2. Sistema valida item y ubicación.
3. Si política requiere aprobación, queda submitted.
4. Usuario autorizado aprueba.
5. Sistema postea ajuste.
6. Sistema crea InventoryMovement adjustmentIncrease o adjustmentDecrease.
7. Sistema actualiza saldo.
8. Sistema audita.
```

---

### 20.6. Transferencia entre ubicaciones

```text id="b4s1zp"
1. InventoryManager crea transferencia.
2. Sistema valida ubicación origen y destino.
3. Sistema valida que origen != destino.
4. Sistema valida stock disponible.
5. Sistema postea transferencia.
6. Sistema crea transferOut.
7. Sistema crea transferIn.
8. Sistema actualiza ambos saldos.
9. Sistema audita.
```

---

### 20.7. Alerta de bajo stock

```text id="d6c2f5"
1. Movimiento posted actualiza stock.
2. Sistema recalcula quantityAvailable.
3. Sistema compara con minimumStockQuantity.
4. Si aplica, crea o mantiene alerta lowStock.
5. Si stock llega a cero, crea o mantiene alerta outOfStock.
6. Usuario autorizado reconoce o resuelve alerta.
```

---

### 20.8. Exportar reporte

```text id="jvotsr"
1. Usuario autorizado solicita reporte.
2. Sistema valida filtros tenant-scoped.
3. Sistema genera dataset.
4. Sistema crea archivo mediante Secure Document Storage.
5. Sistema devuelve secureDocumentId y downloadAvailable.
6. Sistema no devuelve storageKey.
7. Sistema audita inventoryReport.exported.
```

---

## 21. Seguridad

### 21.1. Controles obligatorios

```text id="ntftwh"
- AuthGuard en todas las rutas.
- TenantGuard en todas las rutas tenant.
- PermissionGuard por endpoint.
- ValidationPipe whitelist.
- forbidNonWhitelisted.
- no tenantId en body.
- no actor fields en body.
- no status directo salvo endpoint de transición.
- no storageKey.
- no signedUrl persistente.
- no base64.
- no raw file payload.
- Decimal para cantidades y costos.
- audit obligatorio.
- logs sanitizados.
- reportes tenant-scoped.
```

---

### 21.2. Campos prohibidos en requests

```text id="t5n4eh"
tenantId
createdBy
updatedBy
postedBy
approvedBy
rejectedBy
cancelledBy
archivedBy
status directo
quantityOnHand directo
quantityAvailable directo
quantityReserved directo
totalCostAmount directo
averageUnitCostAmount directo
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

### 21.3. Campos prohibidos en responses

```text id="kx02it"
storageKey
signedUrl persistente
base64
raw file payload
raw supplier payload
raw payment payload
datos cross-tenant
stack trace
tokens
secrets
SQL raw
```

---

## 22. Auditoría

Toda operación crítica debe dejar evidencia auditable con:

```text id="quf3ud"
tenantId
actorUserProfileId
action
category = inventory
resourceType
resourceId
outcome
oldValue sanitizado
newValue sanitizado
metadata sanitizada
traceId
occurredAt
```

Metadata permitida:

```text id="x06f0y"
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

Metadata prohibida:

```text id="km16bs"
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

## 23. Observabilidad

### 23.1. Logs permitidos

```text id="giydut"
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

---

### 23.2. Métricas

```text id="nbszhk"
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

---

### 23.3. Labels permitidos

```text id="le0jka"
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

```text id="m35sm3"
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

## 24. Reportes MVP

### 24.1. Stock actual

```text id="l9pu36"
Reporte de quantityOnHand, quantityReserved y quantityAvailable por ítem, categoría y ubicación.
```

---

### 24.2. Movimientos por periodo

```text id="cxcnt2"
Reporte de entradas, salidas, ajustes, transferencias y consumos por periodo.
```

---

### 24.3. Consumo por mantenimiento

```text id="j069ue"
Reporte de materiales consumidos por Maintenance Work Order, tarea, categoría e ítem.
```

---

### 24.4. Bajo stock

```text id="khqnpx"
Reporte de ítems con quantityAvailable <= minimumStockQuantity.
```

---

### 24.5. Valorización referencial

```text id="gwn6iu"
Reporte de stock valorizado usando averageUnitCostAmount o referenceUnitCostAmount.
```

Regla:

```text id="y3rq46"
La valorización MVP es referencial, no contable oficial.
```

---

## 25. OpenAPI extensions

Todas las rutas tenant:

```yaml id="c44hu8"
x-tenant-scope: true
x-auth-required: true
x-inventory-basic: true
x-public-exposure: false
```

Rutas con stock:

```yaml id="kcf8kn"
x-stock-controlled: true
x-movement-driven: true
x-negative-stock-default: false
```

Rutas con documentos:

```yaml id="znh7kn"
x-secure-document-storage: true
x-storage-key-exposed: false
```

Rutas con costos:

```yaml id="m4dbug"
x-decimal-money: true
x-reference-valuation-only: true
x-direct-accounting: false
```

Rutas con Supplier Payments:

```yaml id="w5mvi1"
x-supplier-payments-linked: true
x-payment-creation: false
x-supplier-payment-order-created: false
x-supplier-payment-mark-paid: false
```

Restricciones globales:

```yaml id="v15iur"
x-public-endpoint: false
x-me-endpoint: false
x-wordpress-access: false
x-open-banking-payment-initiation: false
x-bank-transfer-initiation: false
x-external-ai-real-data: false
```

---

## 26. Criterios de aceptación

```text id="zya4en"
[ ] Se pueden crear categorías de inventario.
[ ] Se pueden crear unidades de medida.
[ ] Se pueden crear ubicaciones de almacenamiento.
[ ] Se pueden crear ítems.
[ ] itemCode es único por tenant.
[ ] locationCode es único por tenant.
[ ] Se puede consultar stock por ítem.
[ ] Se puede consultar stock por ubicación.
[ ] Se pueden registrar entradas.
[ ] Entradas posted incrementan stock.
[ ] Se pueden registrar salidas.
[ ] Salidas posted disminuyen stock.
[ ] Se impide stock negativo por defecto.
[ ] Se pueden registrar ajustes con razón.
[ ] Ajustes posted generan movimiento.
[ ] Se pueden registrar transferencias.
[ ] Transferencias posted generan salida y entrada.
[ ] Se pueden registrar consumos vinculados a Maintenance Work Orders.
[ ] Consumos posted disminuyen stock.
[ ] Se validan proveedores tenant-scoped.
[ ] Se validan documentos vía SDS.
[ ] No se expone storageKey.
[ ] Se generan alertas de bajo stock.
[ ] Se generan reportes básicos.
[ ] Exportaciones usan SDS.
[ ] Audit registra eventos críticos.
[ ] No existen endpoints públicos.
[ ] No existen endpoints /me.
[ ] WordPress público no tiene acceso.
[ ] Inventory no crea pagos.
[ ] Inventory no crea SupplierPaymentOrder.
[ ] Inventory no crea JournalEntry.
[ ] Tenant isolation se respeta.
```

---

## 27. No aceptación

El módulo no debe aceptarse si:

```text id="x17j11"
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

## 28. Riesgos y mitigaciones

| Riesgo                            | Mitigación                                             |
| --------------------------------- | ------------------------------------------------------ |
| Stock negativo accidental         | Validación de stock disponible + transacciones         |
| Movimientos duplicados            | Idempotencia futura + movementNumber único + auditoría |
| Consumo sin orden real            | Validación contra Maintenance Work Orders              |
| Ítems duplicados                  | itemCode único por tenant                              |
| Ubicaciones duplicadas            | locationCode único por tenant                          |
| Ajustes fraudulentos              | reason obligatorio + aprobación opcional + audit       |
| Entrada usada como pago informal  | Supplier Payments boundary                             |
| Costos tratados como contabilidad | reference valuation only + no JournalEntry             |
| Documento expuesto                | SDS + no storageKey                                    |
| Cross-tenant en reportes          | filtros tenant-scoped + tests                          |
| WordPress accede al módulo        | no public/no me/CORS restrictivo                       |
| IA con datos reales               | feature flag false + ADR futuro                        |

---

## 29. Decisiones MVP

```text id="k1svu6"
- Se implementa inventario básico, no ERP.
- Se implementan categorías por tenant.
- Se implementan unidades de medida por tenant.
- Se implementan ítems por tenant.
- Se implementan ubicaciones de almacenamiento por tenant.
- Se implementan saldos por ítem y ubicación.
- Se implementan movimientos como fuente de verdad.
- Se implementan entradas, salidas, ajustes, transferencias y consumos.
- Se permite vínculo con Maintenance Work Orders.
- Se permite vínculo referencial con Supplier Payments.
- Se permite costo unitario referencial.
- La valorización es referencial, no contable.
- No se implementan órdenes de compra.
- No se implementa inventario serializado avanzado.
- No se implementa FIFO/LIFO oficial.
- No se implementa activos fijos ni depreciación.
- No se crean pagos.
- No se crean órdenes de pago a proveedor.
- No se crean asientos contables.
- No se confirma conciliación bancaria.
- No se implementa /me.
- No se implementan endpoints públicos.
- No se permite WordPress público.
- No se permite IA externa con datos reales.
```

---

## 30. Resultado esperado

Al completar esta especificación, RESIDENT Core contará con una base funcional para controlar inventario operativo básico por conjunto residencial.

Resultado esperado:

```text id="n9w7xx"
InventoryCategory definido
InventoryUnitOfMeasure definido
InventoryItem definido
InventoryStorageLocation definido
InventoryStockBalance definido
InventoryMovement definido
InventoryStockAdjustment definido
InventoryTransfer definido
InventoryConsumption definido
InventoryDocument definido
InventoryAlert definido
InventoryReportExport definido
tenant isolation definido
stock movement-driven definido
stock balances definido
entries definido
issues definido
adjustments definido
transfers definido
maintenance consumption definido
supplier reference definido
SDS documents definido
low stock alerts definido
reports definido
exports definido
audit definido
observability definido
security boundaries definido
no public endpoints
no /me endpoints
no WordPress access
no direct payments
no SupplierPaymentOrder
no direct accounting
no external AI with real data
```

---

## 31. Expediente actualizado

```text id="gyof7m"
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
│   │       └── spec.md
```
