# Security Notes — 023 Inventory Basic

## 1. Información del documento

| Campo           | Valor                                                                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                 |
| Spec ID         | 023                                                                                                                                           |
| Módulo          | Inventory Basic                                                                                                                               |
| Documento       | Security Notes                                                                                                                                |
| Ruta            | `docs/specs/023-inventory-basic/security-notes.md`                                                                                            |
| Versión         | 0.1                                                                                                                                           |
| Estado          | needs-review                                                                                                                                  |
| Fecha           | 2026-07-24                                                                                                                                    |
| Documento base  | `docs/specs/023-inventory-basic/spec.md`                                                                                                      |
| Plan técnico    | `docs/specs/023-inventory-basic/plan.md`                                                                                                      |
| Modelo de datos | `docs/specs/023-inventory-basic/data-model.md`                                                                                                |
| Contrato API    | `docs/specs/023-inventory-basic/api-contract.md`                                                                                              |
| Plan de pruebas | `docs/specs/023-inventory-basic/test-plan.md`                                                                                                 |
| Tareas          | `docs/specs/023-inventory-basic/tasks.md`                                                                                                     |
| Stack objetivo  | NestJS / TypeScript / PostgreSQL / Prisma / OpenAPI / Keycloak                                                                                |
| Naturaleza      | Tenant-scoped / Operational / Stock-controlled / Movement-driven / Maintenance-aware / Supplier-aware / Cost-aware / Audit-heavy / Non-public |

---

## 2. Propósito

Este documento define las notas de seguridad del módulo `023-inventory-basic`.

El objetivo es establecer controles obligatorios para proteger inventario, saldos, movimientos, ajustes, transferencias, consumos, documentos, reportes, referencias a proveedores, referencias a mantenimiento, auditoría, logs, métricas, endpoints y límites de dominio.

Regla central de seguridad:

```text id="s5m0ww"
Toda categoría, unidad, ítem, ubicación, saldo, movimiento, ajuste, transferencia, consumo, documento, alerta, reporte, exportación y evento de auditoría de Inventory Basic debe proteger tenant isolation, integridad de stock, trazabilidad por movimiento, cantidades y costos Decimal-safe, documentos vía Secure Document Storage, referencias externas tenant-scoped, ausencia de stock negativo no autorizado, ausencia de modificación destructiva de movimientos posteados, ausencia de pagos directos, ausencia de SupplierPaymentOrders, ausencia de contabilidad directa, ausencia de conciliación bancaria, ausencia de endpoints públicos, ausencia de endpoints /me, ausencia de acceso desde WordPress público y ausencia de IA externa con datos reales.
```

---

## 3. Principio de seguridad del módulo

```text id="ne2wfb"
Inventory Basic administra existencias operativas; no administra dinero, no inicia pagos, no crea obligaciones financieras, no contabiliza, no concilia bancos, no publica datos y no expone información operacional a residentes ni a WordPress público en MVP.
```

---

## 4. Clasificación de datos

### 4.1. Datos operativos internos

```text id="x9d6gr"
- Categorías de inventario.
- Unidades de medida.
- Ítems de inventario.
- Ubicaciones de almacenamiento.
- Saldos por ítem y ubicación.
- Movimientos de inventario.
- Ajustes.
- Transferencias.
- Consumos.
- Alertas.
- Reportes.
```

Clasificación:

```text id="tb2v0z"
confidentiality = internal
integrity = high
availability = medium-high
```

---

### 4.2. Datos sensibles administrativos

```text id="fo54h2"
- Costos unitarios referenciales.
- Valorización referencial.
- Proveedores referenciales.
- Cuentas por pagar referenciales.
- Documentos de soporte.
- Facturas.
- Actas de recepción.
- Evidencias de ajuste.
- Reportes exportados.
```

Clasificación:

```text id="wd7c1o"
confidentiality = restricted
integrity = high
availability = medium
```

---

### 4.3. Datos altamente controlados por integridad

```text id="dlzaeh"
- quantityOnHand.
- quantityReserved.
- quantityAvailable.
- InventoryMovement posted.
- Reverse movement.
- Adjustment posted.
- Transfer posted.
- Consumption posted.
- Recalculation.
```

Clasificación:

```text id="ftlnag"
confidentiality = internal
integrity = critical
availability = medium-high
```

---

## 5. Activos protegidos

```text id="yiz9rd"
- inventory_categories.
- inventory_units.
- inventory_items.
- inventory_storage_locations.
- inventory_stock_balances.
- inventory_movements.
- inventory_stock_adjustments.
- inventory_transfers.
- inventory_consumptions.
- inventory_documents.
- inventory_alerts.
- inventory_report_exports.
- secureDocumentId.
- supplierId.
- supplierPayableId.
- maintenanceWorkOrderId.
- maintenanceTaskId.
- audit events.
- OpenAPI contract.
- feature flags.
- stock consistency.
```

---

## 6. Trust boundaries

### 6.1. Usuario autenticado → RESIDENT Core API

```text id="w2ao57"
Boundary:
Client administrativo autenticado -> API tenant inventory
```

Controles:

```text id="qev1gr"
- Bearer Token.
- Keycloak OIDC.
- AuthGuard.
- TenantGuard.
- PermissionGuard.
- ValidationPipe whitelist.
- forbidNonWhitelisted.
- DTO denylist.
- tenant context server-side.
```

---

### 6.2. RESIDENT Core API → PostgreSQL

```text id="ofo7be"
Boundary:
Application service -> Prisma -> PostgreSQL
```

Controles:

```text id="y5l8xd"
- id + tenantId en toda consulta.
- Transacciones para operaciones críticas.
- Constraints de cantidades.
- Constraints de costos.
- Constraints de transferencias.
- Índices tenant-scoped.
- Unique constraints por tenant.
- No update destructivo de posted movements.
```

---

### 6.3. Inventory Basic → Secure Document Storage

```text id="v9d62v"
Boundary:
Inventory Basic -> Secure Document Storage
```

Controles:

```text id="t7xgx1"
- secureDocumentId tenant-scoped.
- No storageKey.
- No signedUrl persistente.
- No base64.
- No binarios en JSON.
- Descargas delegadas a SDS.
- Audit de descargas sensibles.
```

---

### 6.4. Inventory Basic → Supplier Payments

```text id="rlbhsy"
Boundary:
Inventory Basic -> Supplier Payments
```

Controles:

```text id="hfjfrz"
- Validar supplierId tenant-scoped.
- Validar supplier active.
- Rechazar supplier blocked.
- Validar supplierPayableId tenant-scoped.
- No create SupplierPayable en MVP.
- No create SupplierPaymentOrder.
- No mark paid.
- No Payment.
- No bank transfer.
```

---

### 6.5. Inventory Basic → Maintenance Work Orders

```text id="w9ri09"
Boundary:
Inventory Basic -> Maintenance Work Orders
```

Controles:

```text id="cs0f0n"
- Validar maintenanceWorkOrderId tenant-scoped.
- Validar maintenanceTaskId pertenece a la orden.
- Validar work order no archived.
- Validar estado compatible con consumo.
- No cambiar status de mantenimiento.
- No cerrar orden.
- No crear costos de mantenimiento.
- No crear payables.
```

---

### 6.6. Inventory Basic → Accounting Ledger

Uso permitido:

```text id="iqmezu"
ninguno en MVP
```

Controles:

```text id="fo7ole"
- No JournalEntry.
- No JournalEntryLine.
- No AccountingPeriod changes.
- No balances contables.
- Reporte de valorización = referenceOnly.
```

---

### 6.7. Inventory Basic → Bank Reconciliation

Uso permitido:

```text id="hcdhrf"
ninguno en MVP
```

Controles:

```text id="giov85"
- No BankTransaction.
- No ReconciliationMatch.
- No confirmación de conciliación.
- No cierre de sesión de conciliación.
```

---

### 6.8. WordPress público → Inventory Basic

Uso permitido:

```text id="yxwpyf"
ninguno
```

Controles:

```text id="uzlywi"
- No public endpoints.
- No /me endpoints.
- CORS restrictivo.
- No wildcard.
- WordPress público sin acceso.
```

---

## 7. Amenazas principales

### 7.1. Spoofing

Riesgo:

```text id="trx14a"
Un usuario intenta actuar como otro usuario, tenant, aprobador, posteador o responsable.
```

Controles:

```text id="pjdsax"
- Keycloak OIDC.
- Actor server-side.
- Prohibido createdBy/postedBy/approvedBy desde cliente.
- TenantMembership activo.
- PermissionGuard.
- Audit con actor real.
```

---

### 7.2. Tampering

Riesgo:

```text id="wlujv9"
Un usuario manipula saldos, movimientos, costos, estados, documentos o cantidades.
```

Controles:

```text id="en6kzh"
- quantityOnHand no editable por API.
- quantityAvailable no editable por API.
- totalCostAmount calculado server-side.
- movementNumber server-side.
- posted movement immutable.
- reverse/correction auditable.
- Decimal string.
- DB constraints.
- Transacciones.
- DTO denylist.
```

---

### 7.3. Repudiation

Riesgo:

```text id="lct3u1"
Un usuario niega haber creado, posteado, reversado, ajustado, transferido o consumido inventario.
```

Controles:

```text id="kh1sf9"
- Audit obligatorio.
- traceId.
- actorUserProfileId.
- action.
- resourceType.
- resourceId.
- oldValue/newValue sanitizados.
- metadata sanitizada.
- timestamps server-side.
```

---

### 7.4. Information disclosure

Riesgo:

```text id="m7q4bq"
Exposición de inventario, costos, proveedores, documentos, reportes, storageKey o datos cross-tenant.
```

Controles:

```text id="nwj8gw"
- Tenant isolation.
- 404 en cross-tenant.
- No endpoints públicos.
- No /me endpoints.
- No WordPress access.
- No storageKey.
- No signedUrl persistente.
- No base64.
- Logs sanitizados.
- Audit sanitizado.
- Reports tenant-scoped.
```

---

### 7.5. Denial of Service

Riesgo:

```text id="kn31mt"
Abuso de endpoints de movimientos, recalculation, reportes o exports.
```

Controles:

```text id="f32foe"
- Rate limit reforzado.
- pageSize máximo 100.
- Índices tenant-scoped.
- Recalculation controlada.
- Exports pesados vía job futuro si aplica.
- Timeouts.
- Métricas de duración.
```

---

### 7.6. Elevation of privilege

Riesgo:

```text id="gp6icf"
Un usuario sin permiso opera inventario, postea movimientos, aprueba ajustes, reversa stock o exporta reportes.
```

Controles:

```text id="r8cw4y"
- PermissionGuard por endpoint.
- Permisos granulares.
- TenantMembership activo.
- Resource-level authorization.
- Resident sin acceso en MVP.
- PlatformAdmin sin acceso automático.
```

---

## 8. Reglas de autenticación

Todos los endpoints deben requerir:

```http id="anmy0f"
Authorization: Bearer <access_token>
```

Reglas:

```text id="yi8ckq"
- Keycloak autentica.
- RESIDENT Core resuelve UserProfile.
- RESIDENT Core resuelve TenantMembership.
- RESIDENT Core autoriza.
- No se acepta userId como actor desde cliente.
- No se acepta tenantId desde cliente.
- No se acepta token en query string.
- No se delega autenticación a WordPress.
```

---

## 9. Reglas de autorización

### 9.1. Permisos obligatorios

```text id="tcoet3"
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

### 9.2. Usuarios sin acceso por defecto

```text id="q158bx"
- Resident.
- PropertyOwner.
- SupplierUser.
- Anonymous.
- WordPress visitor.
```

---

### 9.3. PlatformAdmin

Regla:

```text id="x142mr"
PlatformAdmin no accede automáticamente al inventario de tenants.
```

Debe requerir:

```text id="sq2h3e"
- tenant context explícito;
- permiso explícito;
- justificación operativa si aplica;
- auditoría reforzada.
```

---

## 10. Tenant isolation

### 10.1. Regla obligatoria

Toda consulta debe incluir:

```typescript id="bp2pqm"
where: {
  id: resourceId,
  tenantId: currentTenant.id,
  archivedAt: null
}
```

Prohibido:

```typescript id="wbownx"
where: {
  id: resourceId
}
```

---

### 10.2. Cross-tenant response

Si un recurso existe en otro tenant:

```http id="dg7y7z"
404 Not Found
```

No usar `403` si eso revela existencia del recurso.

---

### 10.3. Referencias externas tenant-scoped

Validar siempre:

```text id="lm1x3u"
categoryId
unitId
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

## 11. Seguridad de stock

### 11.1. Movimiento como fuente de verdad

Regla:

```text id="dh8s2e"
Solo InventoryMovement.status = posted afecta stock.
```

No afectan stock:

```text id="h11ml3"
draft
cancelled
archived
```

`reversed` debe conservar trazabilidad y aplicar reverso controlado.

---

### 11.2. Campos protegidos

No aceptar desde cliente:

```text id="a1ppyz"
quantityOnHand
quantityReserved
quantityAvailable
averageUnitCostAmount
lastMovementId
lastMovementAt
```

---

### 11.3. Stock negativo

MVP:

```text id="o3cszi"
INVENTORY_ALLOW_NEGATIVE_STOCK=false
```

Bloquear:

```text id="e7ppg8"
- issue mayor a quantityAvailable.
- maintenanceConsumption mayor a quantityAvailable.
- adjustmentDecrease mayor a quantityAvailable.
- transferOut mayor a quantityAvailable.
```

---

### 11.4. Concurrencia

Controles requeridos:

```text id="jphgt5"
- Transacción por post movement.
- Transacción por post transfer.
- Transacción por post consumption.
- Transacción por post adjustment.
- Lock lógico o DB-level sobre item/location balance.
- Double-post prevention.
- Double-reverse prevention.
- Idempotency-Key recomendado.
```

---

## 12. Seguridad de movimientos

### 12.1. Movimiento draft

```text id="voxzzd"
- Puede cancelarse.
- Puede postearse si pasa validaciones.
- No afecta stock.
```

---

### 12.2. Movimiento posted

```text id="wfw4by"
- Afecta stock.
- No puede editarse destructivamente.
- Solo puede reversarse mediante operación controlada.
- Debe tener postedBy y postedAt server-side.
```

---

### 12.3. Movimiento reversed

```text id="t8npip"
- Debe conservar referencia al movimiento original.
- Debe preservar audit trail.
- No debe borrar movimientos originales.
- Debe impedir doble reverso.
```

---

### 12.4. Campos server-side

```text id="gsy0mr"
movementNumber
movementDirection
totalCostAmount
status
createdBy
postedBy
cancelledBy
reversedBy
archivedBy
createdAt
postedAt
cancelledAt
reversedAt
archivedAt
```

---

## 13. Seguridad de ajustes

Reglas:

```text id="u1nyeg"
- Todo ajuste requiere reason.
- Adjustment decrease valida stock disponible.
- Si INVENTORY_ADJUSTMENTS_REQUIRE_APPROVAL=true, no se postea sin aprobación.
- Rejected requiere rejectReason.
- Cancelled requiere cancelReason.
- Posted crea movement asociado.
- Posted no se edita destructivamente.
```

Riesgo principal:

```text id="gmllmc"
Ajustes pueden usarse para ocultar pérdida, error, robo o manipulación de stock.
```

Controles:

```text id="bovuph"
- Aprobación configurable.
- Audit de submit/approve/reject/post.
- Documento soporte opcional.
- Reason obligatorio.
- Reporte de ajustes.
```

---

## 14. Seguridad de transferencias

Reglas:

```text id="zc159p"
- sourceStorageLocationId y targetStorageLocationId deben pertenecer al tenant.
- sourceStorageLocationId != targetStorageLocationId.
- transfer posted crea transferOut y transferIn.
- transfer posted es transaccional.
- no debe dejar stock negativo en origen.
- reverse conserva trazabilidad.
```

Riesgo principal:

```text id="qqube3"
Transferencias mal implementadas pueden duplicar stock o perder stock entre ubicaciones.
```

Controles:

```text id="r0qhvw"
- Una sola transacción.
- Validación de stock antes de transferOut.
- Creación atómica de transferOut y transferIn.
- Audit de transferencia.
- Tests de concurrencia.
```

---

## 15. Seguridad de consumos de mantenimiento

Reglas:

```text id="cvx5o4"
- Todo consumo posted requiere maintenanceWorkOrderId válido.
- maintenanceWorkOrderId debe pertenecer al tenant.
- maintenanceTaskId debe pertenecer a la orden si existe.
- workOrder no debe estar archived.
- item debe estar active.
- location debe estar active.
- consumo no puede exceder stock disponible.
- consumo no modifica estado de Maintenance Work Orders.
```

Prohibido:

```text id="gzr3tm"
- cerrar work order;
- completar work order;
- cancelar work order;
- aprobar costos de mantenimiento;
- crear MaintenanceCost;
- crear SupplierPayable;
- crear Payment;
```

---

## 16. Seguridad documental

### 16.1. Regla SDS

Todo documento se referencia por:

```text id="xs8f2l"
secureDocumentId
```

Prohibido:

```text id="q7njx9"
storageKey
signedUrl persistente
base64
rawFilePayload
binaryPayload
```

---

### 16.2. Validaciones SDS

```text id="i06esc"
- secureDocumentId pertenece al tenant.
- Documento está activo.
- sourceModule compatible.
- visibility = administrative.
- sensitivity = internal | restricted.
- Usuario tiene permiso.
```

---

### 16.3. Responses

La API puede devolver:

```text id="fo3aex"
secureDocumentId
downloadAvailable
documentType
visibility
status
createdAt
```

No debe devolver:

```text id="fcep1z"
storageKey
signedUrl persistente
base64
raw file payload
internal bucket
provider path
```

---

## 17. Seguridad de Supplier Payments boundary

### 17.1. Uso permitido

```text id="nsxw3i"
- preferredSupplierId en InventoryItem.
- supplierId en InventoryMovement.
- supplierPayableId en InventoryMovement.
- validar proveedor.
- validar cuenta por pagar existente.
- consultar resumen mínimo de proveedor.
```

---

### 17.2. Uso prohibido

```text id="tilgm5"
- crear SupplierPayable en MVP.
- crear SupplierPaymentOrder.
- marcar paid.
- crear Payment.
- crear PaymentAllocation.
- iniciar transferencia bancaria.
- modificar cuenta bancaria de proveedor.
- modificar estado financiero de proveedor.
```

---

### 17.3. Controles

```text id="e7d06e"
- Supplier active requerido.
- Supplier blocked rechazado.
- Supplier archived rechazado.
- Supplier tenantB rechazado.
- SupplierPayable tenantB rechazado.
- Audit de referencias relevantes.
```

---

## 18. Seguridad de Accounting Ledger boundary

Uso directo permitido:

```text id="mj26rb"
ninguno
```

Prohibido:

```text id="rgx2mq"
JournalEntry
JournalEntryLine
AccountingPeriod changes
AccountingBalanceSnapshot changes
posting contable
reversal contable
```

Regla:

```text id="v8p4ul"
La valorización de inventario es referencial y no contable oficial.
```

---

## 19. Seguridad de Bank Reconciliation boundary

Uso directo permitido:

```text id="cbiyg2"
ninguno
```

Prohibido:

```text id="n2693q"
BankTransaction
ReconciliationMatch
ReconciliationSession close
matched status
bank reconciliation confirmation
```

---

## 20. Endpoints prohibidos

### 20.1. `/me`

No implementar:

```text id="ep8ok4"
GET    /api/v1/me/inventory-items
GET    /api/v1/me/inventory-stock
GET    /api/v1/me/inventory-movements
GET    /api/v1/me/inventory-reports
POST   /api/v1/me/inventory-consumptions
```

Respuesta:

```http id="uts4ve"
404 Not Found
```

---

### 20.2. Public

No implementar:

```text id="nl5x1l"
GET    /api/v1/public/inventory-items
GET    /api/v1/public/inventory-stock
GET    /api/v1/public/inventory-movements
GET    /api/v1/public/inventory-reports
GET    /api/v1/public/tenants/{slug}/inventory-items
GET    /api/v1/public/tenants/{slug}/inventory-stock
POST   /api/v1/public/inventory-movements
```

Respuesta:

```http id="y77tk9"
404 Not Found
```

---

### 20.3. WordPress público

Prohibido:

```text id="rdjo6g"
- consultar stock desde WordPress público;
- consultar reportes desde WordPress público;
- crear movimientos desde WordPress público;
- descargar documentos de inventario desde WordPress público;
- exponer inventario por slug de conjunto.
```

---

## 21. Campos prohibidos en requests

Todos los DTO externos deben rechazar:

```text id="phco2m"
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

Respuesta recomendada:

```http id="pu828i"
422 Unprocessable Entity
```

---

## 22. Campos prohibidos en responses

```text id="cwx8d1"
storageKey
signedUrl persistente
base64
raw file payload
raw supplier payload
raw payment payload
raw banking payload
tokens
secrets
passwords
SQL raw
stack trace productivo
datos cross-tenant
```

---

## 23. Seguridad de cantidades y costos

### 23.1. Cantidades

Regla:

```text id="xlckcw"
Las cantidades se reciben y devuelven como string decimal.
```

Ejemplo válido:

```json id="gltw9x"
{
  "quantity": "10.5000"
}
```

Prohibido:

```json id="dz0adx"
{
  "quantity": 10.5
}
```

---

### 23.2. Costos

Regla:

```text id="f6aad3"
Los costos se reciben y devuelven como string decimal.
```

Ejemplo válido:

```json id="s935wh"
{
  "unitCostAmount": "2.35",
  "totalCostAmount": "23.50",
  "currency": "USD"
}
```

`totalCostAmount` siempre se calcula server-side.

---

### 23.3. Validaciones

```text id="pjwcf6"
- quantity > 0 en movimientos operativos.
- quantity respeta decimalPrecision de unidad.
- unitCostAmount >= 0.
- totalCostAmount >= 0.
- currency = USD.
- no float/double como fuente de verdad.
```

---

## 24. Auditoría

### 24.1. Eventos mínimos

```text id="k535cs"
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
inventoryStock.recalculated
```

---

### 24.2. Campos mínimos de audit

```text id="rjhmzp"
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

---

### 24.3. Metadata permitida

```text id="oocvb3"
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

---

### 24.4. Metadata prohibida

```text id="o5lps3"
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
cookies
refresh tokens
access tokens
```

---

## 25. Logs seguros

### 25.1. Eventos loggeables

```text id="fqwg1b"
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

### 25.2. Campos permitidos

```text id="zggpu7"
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

---

### 25.3. Campos prohibidos

```text id="qzd8y5"
tenantId como label de alta cardinalidad
itemId como label
locationId como label
movementId como label
userId como label
supplierId como label
maintenanceWorkOrderId como label
secureDocumentId como label
storageKey
signedUrl
base64
raw payload
raw file payload
tokens
secrets
SQL raw
stack trace productivo
```

---

## 26. Métricas seguras

Métricas permitidas:

```text id="tsymxh"
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

```text id="m48br0"
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

```text id="w3ip4r"
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

## 27. Rate limiting

Aplicar rate limit reforzado en:

```text id="qplkqs"
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

```text id="o9f16k"
- evitar abuso de movimientos;
- evitar race conditions inducidas;
- evitar recalculations masivas;
- evitar exports excesivos;
- proteger saldos.
```

---

## 28. Headers y CORS

### 28.1. Headers

Todas las respuestas deben incluir:

```http id="wx7g4u"
Cache-Control: no-store
Pragma: no-cache
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
```

---

### 28.2. CORS

Reglas:

```text id="i8ih90"
- no wildcard;
- no WordPress público;
- solo frontend administrativo autenticado;
- orígenes explícitos por ambiente;
- credentials solo si están justificados y configurados de forma segura.
```

---

## 29. Validaciones de base de datos

Constraints obligatorios:

```text id="vcgg4h"
- quantity > 0 en movements, adjustments, transfers y consumptions.
- costs >= 0.
- quantityOnHand >= 0 por defecto.
- quantityReserved >= 0.
- quantityReserved <= quantityOnHand.
- quantityAvailable = quantityOnHand - quantityReserved.
- sourceStorageLocationId != targetStorageLocationId.
- posted requiere postedBy y postedAt.
- cancelled requiere cancelledBy, cancelledAt y cancelReason.
- reversed requiere reversedBy, reversedAt y reverseReason.
- completed export requiere secureDocumentId.
```

---

## 30. Seguridad transaccional

Deben ejecutarse en transacción:

```text id="v52kzi"
- post movement.
- reverse movement.
- post adjustment.
- post transfer.
- post consumption.
- recalculate stock.
- export report status update.
- create report export + secure document link.
```

Rollback obligatorio si:

```text id="gvg0qw"
- falla validación tenant.
- falla validación de stock.
- falla creación de movement derivado.
- falla actualización de StockBalance.
- falla creación de audit crítico si la política lo exige.
- falla creación de SecureDocument en export.
```

---

## 31. Feature flags de seguridad

Valores MVP requeridos:

```text id="diie2v"
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

El boot o CI debe fallar si:

```text id="xgd8ex"
INVENTORY_PUBLIC_ENDPOINTS_ENABLED=true
INVENTORY_ME_ENDPOINTS_ENABLED=true
INVENTORY_WORDPRESS_ACCESS_ENABLED=true
INVENTORY_DIRECT_PAYMENTS_ENABLED=true
INVENTORY_SUPPLIER_PAYMENT_ORDER_CREATION_ENABLED=true
INVENTORY_BANK_TRANSFER_INITIATION_ENABLED=true
INVENTORY_OPEN_BANKING_PAYMENT_INITIATION_ENABLED=true
INVENTORY_DIRECT_ACCOUNTING_ENABLED=true
INVENTORY_EXTERNAL_AI_ENABLED=true
```

---

## 32. OpenAPI security

Todas las rutas tenant deben incluir:

```yaml id="z6oft3"
x-tenant-scope: true
x-auth-required: true
x-inventory-basic: true
x-public-exposure: false
```

Rutas de stock:

```yaml id="gb706u"
x-stock-controlled: true
x-movement-driven: true
x-negative-stock-default: false
```

Rutas con documentos:

```yaml id="zh4084"
x-secure-document-storage: true
x-storage-key-exposed: false
```

Rutas con costos:

```yaml id="k0biib"
x-decimal-money: true
x-reference-valuation-only: true
x-direct-accounting: false
```

Rutas con Supplier Payments:

```yaml id="q1fyq4"
x-supplier-payments-linked: true
x-payment-creation: false
x-supplier-payment-order-created: false
x-supplier-payment-mark-paid: false
```

Restricciones globales:

```yaml id="mfysh3"
x-public-endpoint: false
x-me-endpoint: false
x-wordpress-access: false
x-open-banking-payment-initiation: false
x-bank-transfer-initiation: false
x-external-ai-real-data: false
```

OpenAPI no debe documentar:

```text id="whtcg3"
storageKey
signedUrl persistente
base64
rawFilePayload
tenantId en DTO externo
actor fields en DTO externo
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

## 33. Pruebas de seguridad obligatorias

### 33.1. Auth y permisos

```text id="ljf3nh"
[ ] Toda ruta requiere Bearer token.
[ ] Sin token retorna 401.
[ ] Sin permiso retorna 403.
[ ] Resident retorna 403 o 404 según ruta.
[ ] PlatformAdmin sin tenant context no accede.
[ ] PlatformAdmin sin permiso no accede.
```

---

### 33.2. Multitenancy

```text id="lj751t"
[ ] tenantA no lee item tenantB.
[ ] tenantA no usa location tenantB.
[ ] tenantA no postea movement tenantB.
[ ] tenantA no recalcula stock tenantB.
[ ] tenantA no usa supplier tenantB.
[ ] tenantA no usa secureDocument tenantB.
[ ] tenantA no usa maintenanceWorkOrder tenantB.
[ ] tenantA no exporta datos tenantB.
```

---

### 33.3. Stock integrity

```text id="fhz2bq"
[ ] issue mayor a stock disponible retorna 409.
[ ] consumption mayor a stock disponible retorna 409.
[ ] transfer mayor a stock disponible retorna 409.
[ ] adjustmentDecrease mayor a stock disponible retorna 409.
[ ] draft movement no afecta stock.
[ ] posted movement afecta stock.
[ ] posted movement no se edita destructivamente.
[ ] reverse conserva historial.
```

---

### 33.4. Forbidden fields

```text id="n51lhk"
[ ] tenantId rechazado.
[ ] actor fields rechazados.
[ ] quantityOnHand rechazado.
[ ] quantityAvailable rechazado.
[ ] totalCostAmount rechazado.
[ ] movementNumber rechazado.
[ ] storageKey rechazado.
[ ] signedUrl rechazado.
[ ] base64 rechazado.
[ ] paymentOrderId rechazado.
[ ] journalEntryId rechazado.
[ ] externalAiEnabled rechazado.
```

---

### 33.5. Boundary tests

```text id="ex2oc9"
[ ] Inventory no crea Payment.
[ ] Inventory no crea SupplierPaymentOrder.
[ ] Inventory no marca paid.
[ ] Inventory no crea JournalEntry.
[ ] Inventory no confirma Bank Reconciliation.
[ ] Inventory no modifica Maintenance Work Order status.
[ ] Inventory no crea MaintenanceCost.
[ ] Inventory no crea SupplierPayable en MVP.
```

---

## 34. CI security gates

El pipeline debe fallar si:

```text id="xvqtji"
[ ] Algún DTO acepta tenantId.
[ ] Algún DTO acepta actor fields.
[ ] Algún DTO acepta quantityOnHand.
[ ] Algún DTO acepta totalCostAmount.
[ ] Algún DTO acepta storageKey.
[ ] API permite cross-tenant.
[ ] API permite stock negativo.
[ ] API permite public endpoints.
[ ] API permite /me endpoints.
[ ] API permite acceso WordPress público.
[ ] API crea Payment.
[ ] API crea SupplierPaymentOrder.
[ ] API crea JournalEntry.
[ ] API confirma Bank Reconciliation.
[ ] API documenta campos prohibidos.
[ ] Logs contienen storageKey.
[ ] Audit contiene storageKey.
[ ] INVENTORY_EXTERNAL_AI_ENABLED=true.
```

---

## 35. Abuse cases

### 35.1. Manipular stock desde PATCH item

Intento:

```json id="fopkgy"
{
  "quantityOnHand": "9999.0000"
}
```

Resultado esperado:

```http id="jo176c"
422 Unprocessable Entity
```

---

### 35.2. Crear movimiento posteado desde create

Intento:

```json id="oliz25"
{
  "movementType": "receipt",
  "quantity": "10.0000",
  "status": "posted",
  "postedBy": "uuid"
}
```

Resultado esperado:

```http id="udxxm1"
422 Unprocessable Entity
```

---

### 35.3. Consumir stock de otro tenant

Resultado esperado:

```http id="fr9wha"
404 Not Found
```

---

### 35.4. Transferir a la misma ubicación

Resultado esperado:

```http id="rb3hld"
409 Conflict
```

---

### 35.5. Forzar pago desde inventario

Intento:

```json id="ody4wn"
{
  "supplierPaymentOrderId": "uuid",
  "paymentInitiation": true
}
```

Resultado esperado:

```http id="byu45u"
422 Unprocessable Entity
```

---

### 35.6. Enviar storageKey

Intento:

```json id="ahql4s"
{
  "storageKey": "tenant-a/private/inventory/file.pdf"
}
```

Resultado esperado:

```http id="rwyx1a"
422 Unprocessable Entity
```

---

## 36. Checklist de revisión de PR

Antes de aprobar cualquier PR del módulo:

```text id="uwxmb7"
[ ] No introduce endpoints públicos.
[ ] No introduce endpoints /me.
[ ] No habilita WordPress access.
[ ] No acepta tenantId en DTOs.
[ ] No acepta actor fields.
[ ] No acepta stock directo.
[ ] No acepta totalCostAmount directo.
[ ] No acepta storageKey.
[ ] No acepta base64.
[ ] No usa float/double para cantidades o costos.
[ ] Todas las queries usan tenantId.
[ ] Cross-tenant retorna 404.
[ ] Movimientos posted son inmutables.
[ ] Stock negativo se bloquea por defecto.
[ ] Operaciones críticas son transaccionales.
[ ] Audit está implementado.
[ ] Logs están sanitizados.
[ ] OpenAPI no documenta campos prohibidos.
[ ] No crea Payment.
[ ] No crea SupplierPaymentOrder.
[ ] No crea JournalEntry.
[ ] No confirma Bank Reconciliation.
[ ] No envía datos reales a IA externa.
```

---

## 37. Definition of Done de seguridad

```text id="sl234l"
[ ] Security notes aprobadas.
[ ] AuthGuard aplicado a todas las rutas.
[ ] TenantGuard aplicado a todas las rutas.
[ ] PermissionGuard aplicado a todas las rutas.
[ ] DTO denylist implementado.
[ ] Tenant isolation probado.
[ ] Stock integrity probado.
[ ] Movement immutability probado.
[ ] Reverse traceability probado.
[ ] SDS boundary probado.
[ ] Supplier Payments boundary probado.
[ ] Maintenance Work Orders boundary probado.
[ ] No public endpoints probado.
[ ] No /me endpoints probado.
[ ] No WordPress access probado.
[ ] No direct payments probado.
[ ] No SupplierPaymentOrder probado.
[ ] No direct accounting probado.
[ ] No Bank Reconciliation probado.
[ ] No external AI probado.
[ ] Audit sanitizer probado.
[ ] Log sanitizer probado.
[ ] Metrics labels validadas.
[ ] OpenAPI security extensions validadas.
[ ] CI security gates activos.
```

---

## 38. No aceptación de seguridad

No se acepta el módulo si:

```text id="o10la9"
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
- acepta tenantId desde cliente;
- acepta actor fields desde cliente;
- acepta status directo fuera de endpoint de transición;
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
- permite editar movement posted destructivamente;
- reverse borra historial original;
- adjustment posted no crea movement;
- transfer posted no crea transferOut y transferIn;
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

## 39. Resultado esperado

Al aplicar estas notas de seguridad, `023-inventory-basic` quedará protegido contra accesos cross-tenant, manipulación de stock, exposición documental, abuso de movimientos, elevación de privilegios, uso indebido de proveedores, mezcla con pagos, mezcla con contabilidad, exposición pública y acceso indebido desde WordPress.

Resultado esperado:

```text id="figb6k"
tenant isolation protegido
stock integrity protegido
movement immutability protegida
reverse traceability protegida
Decimal quantities protegidas
Decimal costs protegidos
DTO denylist protegido
SDS boundary protegido
Supplier Payments boundary protegido
Maintenance Work Orders boundary protegido
Accounting Ledger boundary protegido
Bank Reconciliation boundary protegido
no public endpoints protegido
no /me endpoints protegido
no WordPress access protegido
no direct payments protegido
no SupplierPaymentOrder protegido
no direct accounting protegido
no Bank Reconciliation protegido
no external AI protegido
audit sanitizado
logs sanitizados
metrics seguras
OpenAPI seguro
CI gates definidos
security DoD definido
```

---

## 40. Expediente actualizado

```text id="bn58ws"
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
│   │       ├── tasks.md
│   │       └── security-notes.md
```

---

## 41. Cierre del paquete 023

Con este documento queda completo el paquete SDD del módulo `023-inventory-basic`:

```text id="euo6pb"
docs/specs/023-inventory-basic/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```
