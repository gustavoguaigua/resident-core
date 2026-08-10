# API Contract — 022 Maintenance Work Orders

## 1. Información del documento

| Campo           | Valor                                                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Proyecto        | RESIDENT Core                                                                                                                  |
| Spec ID         | 022                                                                                                                            |
| Módulo          | Maintenance Work Orders                                                                                                        |
| Documento       | API Contract                                                                                                                   |
| Ruta            | `docs/specs/022-maintenance-work-orders/api-contract.md`                                                                       |
| Versión         | 0.1                                                                                                                            |
| Estado          | needs-review                                                                                                                   |
| Fecha           | 2026-07-23                                                                                                                     |
| Documento base  | `docs/specs/022-maintenance-work-orders/spec.md`                                                                               |
| Plan técnico    | `docs/specs/022-maintenance-work-orders/plan.md`                                                                               |
| Modelo de datos | `docs/specs/022-maintenance-work-orders/data-model.md`                                                                         |
| API base        | REST `/api/v1`                                                                                                                 |
| Naturaleza      | Tenant-scoped / Operational / Request-driven / Work-order-driven / Evidence-backed / Supplier-aware / Cost-aware / Audit-heavy |

---

## 2. Propósito

Este documento define el contrato API del módulo `022-maintenance-work-orders`.

El contrato cubre la superficie HTTP para administrar categorías de mantenimiento, activos mantenibles, solicitudes, solicitudes propias `/me`, órdenes de trabajo, asignaciones, tareas, visitas, evidencias, costos, aprobaciones, vínculos con proveedores, vínculos con cuentas por pagar, comentarios, reportes y exportaciones.

Regla central del contrato:

```text id="eh2te8"
Toda API de Maintenance Work Orders debe ser autenticada, tenant-scoped, permission-based, segura para /me, compatible con Secure Document Storage, auditable, sin endpoints públicos, sin exposición de storageKey, sin creación directa de pagos, sin creación directa de SupplierPaymentOrder, sin iniciación bancaria, sin contabilidad directa y sin acceso desde WordPress público.
```

---

## 3. Base path

```text id="mty2fn"
/api/v1
```

Superficies permitidas:

```text id="r63mui"
/api/v1/tenant/maintenance-*
/api/v1/me/maintenance-*
```

Superficies prohibidas:

```text id="y4ebjk"
/api/v1/public/maintenance-*
/api/v1/public/tenants/{slug}/maintenance-*
```

---

## 4. Autenticación

Todos los endpoints requieren:

```http id="os0suc"
Authorization: Bearer <access_token>
```

Reglas:

```text id="w827qy"
- Keycloak autentica.
- RESIDENT Core resuelve UserProfile.
- RESIDENT Core resuelve TenantMembership.
- RESIDENT Core resuelve currentTenant.
- Maintenance Work Orders valida permisos y reglas operativas.
```

No se permite:

```text id="gb6kgm"
- endpoint anónimo;
- API pública;
- API key pública;
- acceso por slug público;
- acceso desde WordPress público;
- acceso administrativo sin tenant context.
```

---

## 5. Tenant scope

### 5.1. Resolución de tenant

El tenant efectivo se obtiene del contexto autenticado.

```text id="nn5fpv"
currentTenant.id
```

No se acepta `tenantId` en:

```text id="pjzqxi"
body
query
path público
headers no confiables
metadata
```

---

### 5.2. Respuesta cross-tenant

Si un recurso existe pero pertenece a otro tenant, la API debe responder:

```http id="x82mtf"
404 Not Found
```

No debe responder `403` si eso revela existencia de recurso cross-tenant.

---

## 6. Formato general

### 6.1. JSON

```text id="mnyqbe"
Content-Type: application/json
```

Campos:

```text id="q6ix4y"
API JSON: camelCase
DB: snake_case
IDs: UUID string
Dates: ISO 8601 UTC
Money: string decimal
```

---

### 6.2. Respuesta estándar

```json id="gzl3wn"
{
  "data": {},
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

### 6.3. Respuesta paginada

```json id="sxusot"
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 125,
    "traceId": "trace-id"
  }
}
```

---

### 6.4. Error estándar

```json id="bkb4dk"
{
  "error": {
    "code": "MAINTENANCE_WORK_ORDER_NOT_FOUND",
    "message": "Maintenance work order not found.",
    "details": {},
    "traceId": "trace-id"
  }
}
```

---

## 7. Reglas transversales

Todos los endpoints deben aplicar:

```text id="c437pk"
- AuthGuard;
- TenantGuard en rutas /tenant;
- OwnResourceGuard en rutas /me;
- PermissionGuard en rutas administrativas;
- ValidationPipe whitelist;
- forbidNonWhitelisted;
- DTOs explícitos;
- no tenantId body;
- no actor fields body;
- no status directo salvo endpoint de transición;
- no storageKey;
- no signedUrl persistente;
- no base64;
- no raw file payload;
- no creación directa de pagos;
- no SupplierPaymentOrder directo;
- no JournalEntry directo;
- no Bank Reconciliation directo;
- audit en operaciones críticas.
```

---

## 8. Headers recomendados

Todas las respuestas administrativas y `/me` deben incluir:

```http id="ypnkff"
Cache-Control: no-store
Pragma: no-cache
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
```

---

## 9. Paginación, filtros y ordenamiento

### 9.1. Paginación

Query estándar:

```text id="oecbid"
page
pageSize
```

Reglas:

```text id="orlurm"
page >= 1
pageSize default = 20
pageSize max = 100
```

---

### 9.2. Ordenamiento

Parámetros:

```text id="jmw498"
sortBy
sortDirection
```

`sortDirection`:

```text id="auqosb"
asc
desc
```

Cada endpoint debe tener whitelist de campos ordenables.

---

### 9.3. Filtros comunes

Filtros transversales posibles:

```text id="l45nln"
status
categoryId
assetId
propertyUnitId
commonAreaId
priority
severity
supplierId
assignedUserId
dateFrom
dateTo
createdFrom
createdTo
closedFrom
closedTo
archived
```

Regla:

```text id="zm7ytg"
Todos los filtros por ID deben validarse tenant-scoped.
```

---

## 10. Permisos

### 10.1. Categorías

```text id="iyqfns"
maintenanceCategories.create
maintenanceCategories.read
maintenanceCategories.update
maintenanceCategories.archive
```

---

### 10.2. Activos

```text id="e07xrh"
maintenanceAssets.create
maintenanceAssets.read
maintenanceAssets.update
maintenanceAssets.archive
```

---

### 10.3. Solicitudes

```text id="wv6vrd"
maintenanceRequests.create
maintenanceRequests.read
maintenanceRequests.update
maintenanceRequests.review
maintenanceRequests.accept
maintenanceRequests.reject
maintenanceRequests.cancel
maintenanceRequests.markDuplicate
maintenanceRequests.convertToWorkOrder
maintenanceRequests.archive

maintenanceRequests.own.create
maintenanceRequests.own.read
maintenanceRequests.own.comment
maintenanceRequests.own.cancel
```

---

### 10.4. Órdenes

```text id="b6ys4z"
maintenanceWorkOrders.create
maintenanceWorkOrders.read
maintenanceWorkOrders.update
maintenanceWorkOrders.assign
maintenanceWorkOrders.schedule
maintenanceWorkOrders.start
maintenanceWorkOrders.pause
maintenanceWorkOrders.complete
maintenanceWorkOrders.close
maintenanceWorkOrders.reopen
maintenanceWorkOrders.cancel
maintenanceWorkOrders.archive
```

---

### 10.5. Tareas

```text id="qzbgsx"
maintenanceTasks.create
maintenanceTasks.read
maintenanceTasks.update
maintenanceTasks.complete
maintenanceTasks.archive
```

---

### 10.6. Visitas

```text id="kvfs45"
maintenanceVisits.create
maintenanceVisits.read
maintenanceVisits.update
maintenanceVisits.complete
maintenanceVisits.cancel
maintenanceVisits.archive
```

---

### 10.7. Evidencias

```text id="ow4qjl"
maintenanceEvidence.create
maintenanceEvidence.read
maintenanceEvidence.verify
maintenanceEvidence.reject
maintenanceEvidence.archive
maintenanceEvidence.download

maintenanceEvidence.own.create
maintenanceEvidence.own.read
maintenanceEvidence.own.download
```

---

### 10.8. Costos

```text id="u126db"
maintenanceCosts.create
maintenanceCosts.read
maintenanceCosts.update
maintenanceCosts.submit
maintenanceCosts.approve
maintenanceCosts.reject
maintenanceCosts.cancel
maintenanceCosts.convertToPayable
maintenanceCosts.archive
```

---

### 10.9. Proveedores y payables

```text id="v7j7vp"
maintenanceSupplierLinks.create
maintenanceSupplierLinks.read
maintenanceSupplierLinks.unlink

maintenancePayableLinks.create
maintenancePayableLinks.read
maintenancePayableLinks.archive
```

---

### 10.10. Comentarios

```text id="drge4g"
maintenanceComments.create
maintenanceComments.read
maintenanceComments.archive
maintenanceComments.own.create
maintenanceComments.own.read
```

---

### 10.11. Reportes

```text id="medbr0"
maintenanceReports.read
maintenanceReports.export
maintenanceReports.byStatus
maintenanceReports.byCategory
maintenanceReports.responseTimes
maintenanceReports.costs
maintenanceReports.bySupplier
```

---

## 11. Enums expuestos

La API expone los enums como strings camelCase.

### 11.1. MaintenanceRequestStatus

```text id="xupson"
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

---

### 11.2. MaintenanceWorkOrderStatus

```text id="u1uv3w"
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

---

### 11.3. MaintenancePriority

```text id="fz7dqb"
low
normal
high
urgent
emergency
```

---

### 11.4. MaintenanceSeverity

```text id="elwlvg"
minor
moderate
major
critical
safetyRisk
```

---

### 11.5. MaintenanceExecutionMode

```text id="o712uw"
internal
supplier
mixed
selfManaged
```

---

### 11.6. Currency

```text id="rntdtw"
USD
```

---

# 12. Maintenance Categories API

## 12.1. List categories

```http id="g5gm8d"
GET /api/v1/tenant/maintenance-categories
```

Permission:

```text id="jf33g4"
maintenanceCategories.read
```

Query:

```text id="egot5d"
status
allowsResidentRequests
page
pageSize
sortBy
sortDirection
```

Response:

```json id="mrjewp"
{
  "data": [
    {
      "id": "uuid",
      "categoryCode": "PLUMBING",
      "categoryName": "Plomería",
      "description": "Trabajos de agua y tuberías",
      "defaultPriority": "normal",
      "defaultSeverity": "moderate",
      "requiresApprovalByDefault": false,
      "allowsResidentRequests": true,
      "status": "active",
      "createdAt": "2026-07-23T00:00:00Z",
      "updatedAt": "2026-07-23T00:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "traceId": "trace-id"
  }
}
```

---

## 12.2. Create category

```http id="gq4b71"
POST /api/v1/tenant/maintenance-categories
```

Permission:

```text id="mn33cm"
maintenanceCategories.create
```

Request:

```json id="x5zxbu"
{
  "categoryCode": "PLUMBING",
  "categoryName": "Plomería",
  "description": "Trabajos de agua y tuberías",
  "defaultPriority": "normal",
  "defaultSeverity": "moderate",
  "requiresApprovalByDefault": false,
  "allowsResidentRequests": true
}
```

Response:

```http id="na0ghg"
201 Created
```

Audit:

```text id="w77zo1"
maintenanceCategory.created
```

---

## 12.3. Get category

```http id="qw0f6o"
GET /api/v1/tenant/maintenance-categories/{categoryId}
```

Permission:

```text id="gjdfki"
maintenanceCategories.read
```

Response:

```json id="racwfq"
{
  "data": {
    "id": "uuid",
    "categoryCode": "PLUMBING",
    "categoryName": "Plomería",
    "description": "Trabajos de agua y tuberías",
    "defaultPriority": "normal",
    "defaultSeverity": "moderate",
    "requiresApprovalByDefault": false,
    "allowsResidentRequests": true,
    "status": "active",
    "createdAt": "2026-07-23T00:00:00Z",
    "updatedAt": "2026-07-23T00:00:00Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 12.4. Update category

```http id="xfyha5"
PATCH /api/v1/tenant/maintenance-categories/{categoryId}
```

Permission:

```text id="ojjn7w"
maintenanceCategories.update
```

Request:

```json id="qs54ty"
{
  "categoryName": "Plomería y agua",
  "description": "Trabajos de agua, tuberías y fugas",
  "defaultPriority": "high",
  "allowsResidentRequests": true
}
```

Forbidden fields:

```text id="zycmad"
tenantId
status
createdBy
updatedBy
archivedBy
```

Audit:

```text id="fn6njs"
maintenanceCategory.updated
```

---

## 12.5. Archive category

```http id="pujnxt"
POST /api/v1/tenant/maintenance-categories/{categoryId}/archive
```

Permission:

```text id="ls0zkj"
maintenanceCategories.archive
```

Request:

```json id="ur2vpq"
{
  "reason": "Categoría reemplazada por una clasificación nueva."
}
```

Audit:

```text id="an89kk"
maintenanceCategory.archived
```

---

# 13. Maintenance Assets API

## 13.1. List assets

```http id="pu3ejb"
GET /api/v1/tenant/maintenance-assets
```

Permission:

```text id="i4juf1"
maintenanceAssets.read
```

Query:

```text id="ns41w4"
status
assetType
criticality
propertyUnitId
commonAreaId
page
pageSize
sortBy
sortDirection
```

Response item:

```json id="wtpub8"
{
  "id": "uuid",
  "assetCode": "GATE_VEHICLE",
  "assetName": "Portón vehicular",
  "assetType": "accessControl",
  "description": "Portón principal de ingreso vehicular",
  "locationDescription": "Ingreso principal",
  "propertyUnitId": null,
  "commonAreaId": "uuid",
  "parentAssetId": null,
  "status": "active",
  "criticality": "high",
  "createdAt": "2026-07-23T00:00:00Z",
  "updatedAt": "2026-07-23T00:00:00Z"
}
```

---

## 13.2. Create asset

```http id="kw9kk5"
POST /api/v1/tenant/maintenance-assets
```

Permission:

```text id="r45yho"
maintenanceAssets.create
```

Request:

```json id="dpehgc"
{
  "assetCode": "GATE_VEHICLE",
  "assetName": "Portón vehicular",
  "assetType": "accessControl",
  "description": "Portón principal de ingreso vehicular",
  "locationDescription": "Ingreso principal",
  "propertyUnitId": null,
  "commonAreaId": "uuid",
  "parentAssetId": null,
  "criticality": "high"
}
```

Validations:

```text id="ul3x4t"
- assetCode único por tenant.
- propertyUnitId tenant-scoped si existe.
- commonAreaId tenant-scoped si existe.
- parentAssetId tenant-scoped si existe.
```

Audit:

```text id="mbdnlv"
maintenanceAsset.created
```

---

## 13.3. Get asset

```http id="wgdmi0"
GET /api/v1/tenant/maintenance-assets/{assetId}
```

Permission:

```text id="f833k6"
maintenanceAssets.read
```

---

## 13.4. Update asset

```http id="e6uwp0"
PATCH /api/v1/tenant/maintenance-assets/{assetId}
```

Permission:

```text id="lqci0a"
maintenanceAssets.update
```

Request:

```json id="o9dxmm"
{
  "assetName": "Portón vehicular principal",
  "description": "Portón de ingreso vehicular del conjunto",
  "criticality": "critical"
}
```

Forbidden fields:

```text id="z4dlyq"
tenantId
createdBy
updatedBy
archivedBy
status directo
```

Audit:

```text id="uvmzwz"
maintenanceAsset.updated
```

---

## 13.5. Archive asset

```http id="oejfev"
POST /api/v1/tenant/maintenance-assets/{assetId}/archive
```

Permission:

```text id="xwm868"
maintenanceAssets.archive
```

Request:

```json id="rkd5vd"
{
  "reason": "Activo reemplazado."
}
```

Audit:

```text id="wq8xzf"
maintenanceAsset.archived
```

---

# 14. Maintenance Requests Admin API

## 14.1. List requests

```http id="ellzlp"
GET /api/v1/tenant/maintenance-requests
```

Permission:

```text id="lzx5jz"
maintenanceRequests.read
```

Query:

```text id="e264q6"
status
categoryId
assetId
propertyUnitId
commonAreaId
reportedByUserId
priority
severity
requestSource
createdFrom
createdTo
page
pageSize
sortBy
sortDirection
```

Response item:

```json id="w99h9c"
{
  "id": "uuid",
  "requestNumber": "MR-202607-000001",
  "title": "Fuga de agua en área comunal",
  "description": "Se observa fuga cerca de la cisterna.",
  "categoryId": "uuid",
  "assetId": "uuid",
  "propertyUnitId": null,
  "commonAreaId": "uuid",
  "reportedByUserId": "uuid",
  "reportedByPersonId": "uuid",
  "requestSource": "residentPortal",
  "visibility": "requesterOnly",
  "priority": "high",
  "severity": "major",
  "status": "submitted",
  "duplicateOfRequestId": null,
  "acceptedAsWorkOrderId": null,
  "submittedAt": "2026-07-23T00:00:00Z",
  "createdAt": "2026-07-23T00:00:00Z",
  "updatedAt": "2026-07-23T00:00:00Z"
}
```

---

## 14.2. Create admin request

```http id="suedv8"
POST /api/v1/tenant/maintenance-requests
```

Permission:

```text id="d1vxev"
maintenanceRequests.create
```

Request:

```json id="xmt387"
{
  "title": "Revisión de luminaria en garita",
  "description": "La luminaria principal de garita presenta intermitencia.",
  "categoryId": "uuid",
  "assetId": "uuid",
  "propertyUnitId": null,
  "commonAreaId": "uuid",
  "requestSource": "tenantAdmin",
  "visibility": "administrative",
  "priority": "normal",
  "severity": "moderate"
}
```

Server-side:

```text id="leu8u7"
- genera requestNumber;
- resuelve reportedByUserId;
- status inicial submitted o draft según política;
- audita maintenanceRequest.created/submitted.
```

Response:

```http id="rqkhnp"
201 Created
```

---

## 14.3. Get request

```http id="m98lin"
GET /api/v1/tenant/maintenance-requests/{requestId}
```

Permission:

```text id="rx2nkn"
maintenanceRequests.read
```

Response includes:

```text id="pp133s"
- solicitud;
- attachments administrativos;
- comentarios permitidos;
- work order vinculado si existe;
- estado;
- metadata segura.
```

No debe incluir:

```text id="tohubo"
storageKey
signedUrl persistente
raw file payload
datos cross-tenant
```

---

## 14.4. Update request

```http id="hb73uq"
PATCH /api/v1/tenant/maintenance-requests/{requestId}
```

Permission:

```text id="si1nea"
maintenanceRequests.update
```

Request:

```json id="srspuk"
{
  "title": "Revisión de luminaria principal en garita",
  "description": "La luminaria principal presenta intermitencia durante la noche.",
  "priority": "high",
  "severity": "moderate",
  "categoryId": "uuid",
  "assetId": "uuid"
}
```

Allowed statuses:

```text id="f665pt"
draft
submitted
underReview
accepted según política
```

Forbidden:

```text id="bqd9as"
tenantId
reportedByUserId
reportedByPersonId
status
acceptedAsWorkOrderId
createdBy
updatedBy
```

Audit:

```text id="jg0emu"
maintenanceRequest.updated
```

---

## 14.5. Review request

```http id="up9w6t"
POST /api/v1/tenant/maintenance-requests/{requestId}/review
```

Permission:

```text id="fl7li6"
maintenanceRequests.review
```

Request:

```json id="fsusjm"
{
  "comment": "Solicitud revisada por administración."
}
```

Transition:

```text id="kpx1gp"
submitted -> underReview
```

Audit:

```text id="qxwwhr"
maintenanceRequest.reviewed
```

---

## 14.6. Accept request

```http id="cz3w04"
POST /api/v1/tenant/maintenance-requests/{requestId}/accept
```

Permission:

```text id="rujuwr"
maintenanceRequests.accept
```

Request:

```json id="ozclix"
{
  "comment": "Procede atención por mantenimiento."
}
```

Transition:

```text id="ximwrq"
underReview -> accepted
```

Audit:

```text id="bt6vv3"
maintenanceRequest.accepted
```

---

## 14.7. Reject request

```http id="i78vfq"
POST /api/v1/tenant/maintenance-requests/{requestId}/reject
```

Permission:

```text id="o9jzt1"
maintenanceRequests.reject
```

Request:

```json id="qdwygt"
{
  "reason": "La solicitud corresponde a un área privada no cubierta por administración."
}
```

Transition:

```text id="ss24ld"
underReview -> rejected
```

Audit:

```text id="r094iv"
maintenanceRequest.rejected
```

Notification:

```text id="nka3yl"
maintenanceRequest.rejected
```

---

## 14.8. Cancel request

```http id="cztbzw"
POST /api/v1/tenant/maintenance-requests/{requestId}/cancel
```

Permission:

```text id="qw7k81"
maintenanceRequests.cancel
```

Request:

```json id="tx26rz"
{
  "reason": "La solicitud fue registrada por error."
}
```

Audit:

```text id="wh77wr"
maintenanceRequest.cancelled
```

---

## 14.9. Mark duplicate

```http id="uj70vx"
POST /api/v1/tenant/maintenance-requests/{requestId}/mark-duplicate
```

Permission:

```text id="oyfc2y"
maintenanceRequests.markDuplicate
```

Request:

```json id="dldebo"
{
  "duplicateOfRequestId": "uuid",
  "reason": "Solicitud ya registrada anteriormente."
}
```

Validations:

```text id="u67ieo"
- duplicateOfRequestId pertenece al mismo tenant.
- requestId != duplicateOfRequestId.
```

Audit:

```text id="kvpb4a"
maintenanceRequest.markedDuplicate
```

---

## 14.10. Convert to work order

```http id="kc91bv"
POST /api/v1/tenant/maintenance-requests/{requestId}/convert-to-work-order
```

Permission:

```text id="u233dj"
maintenanceRequests.convertToWorkOrder
```

Request:

```json id="so83jr"
{
  "title": "Reparación de fuga en cisterna",
  "description": "Atender fuga reportada y verificar causa.",
  "workOrderType": "corrective",
  "executionMode": "internal",
  "priority": "high",
  "severity": "major",
  "assignedInternalUserId": "uuid",
  "scheduledStartAt": "2026-07-24T14:00:00Z",
  "scheduledEndAt": "2026-07-24T18:00:00Z"
}
```

Server-side:

```text id="kduyw7"
- crea MaintenanceWorkOrder;
- genera workOrderNumber;
- actualiza request a convertedToWorkOrder;
- setea acceptedAsWorkOrderId;
- crea status history;
- audita.
```

Response:

```json id="ojhcvm"
{
  "data": {
    "maintenanceRequestId": "uuid",
    "workOrderId": "uuid",
    "workOrderNumber": "MWO-202607-000001"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Audit:

```text id="r3m9uv"
maintenanceRequest.convertedToWorkOrder
maintenanceWorkOrder.created
```

---

# 15. Maintenance Requests `/me` API

## 15.1. List own requests

```http id="x4qqzn"
GET /api/v1/me/maintenance-requests
```

Permission:

```text id="fqbth7"
maintenanceRequests.own.read
```

Query:

```text id="oar7dl"
status
categoryId
priority
createdFrom
createdTo
page
pageSize
```

Response item:

```json id="qiog8d"
{
  "id": "uuid",
  "requestNumber": "MR-202607-000001",
  "title": "Fuga de agua",
  "description": "Se observa fuga en área comunal.",
  "categoryId": "uuid",
  "assetId": "uuid",
  "propertyUnitId": "uuid",
  "commonAreaId": null,
  "priority": "normal",
  "severity": "moderate",
  "status": "submitted",
  "submittedAt": "2026-07-23T00:00:00Z",
  "createdAt": "2026-07-23T00:00:00Z",
  "updatedAt": "2026-07-23T00:00:00Z"
}
```

Must not include:

```text id="js8y09"
costs
supplierId
internal comments
admin metadata
full status history
audit metadata
internal evidence
```

---

## 15.2. Create own request

```http id="lq979e"
POST /api/v1/me/maintenance-requests
```

Permission:

```text id="pl6035"
maintenanceRequests.own.create
```

Request:

```json id="e87f34"
{
  "title": "Daño en luminaria del pasillo",
  "description": "La luminaria cercana a mi unidad no enciende.",
  "categoryId": "uuid",
  "assetId": "uuid",
  "propertyUnitId": "uuid",
  "commonAreaId": null,
  "priority": "normal",
  "severity": "minor"
}
```

Validations:

```text id="d2sn7m"
- categoryId permite solicitudes de residentes.
- propertyUnitId pertenece a una unidad vinculada al usuario.
- commonAreaId pertenece al tenant y está habilitada si aplica.
- assetId pertenece al tenant y es visible/solicitable si aplica.
```

Server-side:

```text id="j24our"
- genera requestNumber;
- reportedByUserId = currentUserProfile.id;
- reportedByPersonId se resuelve si existe;
- requestSource = residentPortal;
- status = submitted;
```

Response:

```http id="p8b3rs"
201 Created
```

Audit:

```text id="zlmfjs"
maintenanceRequest.created
maintenanceRequest.submitted
```

Notification:

```text id="bqt5vl"
maintenanceRequest.submitted
```

---

## 15.3. Get own request

```http id="r73mr2"
GET /api/v1/me/maintenance-requests/{requestId}
```

Permission:

```text id="k73f43"
maintenanceRequests.own.read
```

Response:

```json id="w7qfnd"
{
  "data": {
    "id": "uuid",
    "requestNumber": "MR-202607-000001",
    "title": "Daño en luminaria del pasillo",
    "description": "La luminaria cercana a mi unidad no enciende.",
    "categoryId": "uuid",
    "assetId": "uuid",
    "propertyUnitId": "uuid",
    "commonAreaId": null,
    "priority": "normal",
    "severity": "minor",
    "status": "submitted",
    "visibleComments": [],
    "visibleEvidence": [],
    "createdAt": "2026-07-23T00:00:00Z",
    "updatedAt": "2026-07-23T00:00:00Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

If not own:

```http id="kg72ck"
404 Not Found
```

---

## 15.4. Create own comment

```http id="zgg29t"
POST /api/v1/me/maintenance-requests/{requestId}/comments
```

Permission:

```text id="pasizt"
maintenanceRequests.own.comment
```

Request:

```json id="dt5awz"
{
  "commentBody": "El problema continúa después de la lluvia."
}
```

Server-side:

```text id="uvdclw"
visibility = visibleToRequester
createdBy = currentUserProfile.id
```

Audit:

```text id="k1a6e5"
maintenanceComment.created
```

---

## 15.5. Cancel own request

```http id="r4h7et"
POST /api/v1/me/maintenance-requests/{requestId}/cancel
```

Permission:

```text id="b2sk39"
maintenanceRequests.own.cancel
```

Request:

```json id="wlv82w"
{
  "reason": "La situación ya fue resuelta."
}
```

Allowed only if:

```text id="h55vsk"
- request is own;
- status submitted o underReview según política;
- no convertedToWorkOrder.
```

Audit:

```text id="vi22bc"
maintenanceRequest.cancelled
```

---

## 15.6. Add own evidence

```http id="n00wzl"
POST /api/v1/me/maintenance-requests/{requestId}/evidence
```

Permission:

```text id="lfx1ta"
maintenanceEvidence.own.create
```

Request:

```json id="a2e4vx"
{
  "secureDocumentId": "uuid",
  "attachmentType": "photo",
  "description": "Foto del daño reportado."
}
```

Server-side:

```text id="m2vyju"
visibility = requesterVisible
```

Validations:

```text id="m0k08x"
- request is own.
- secureDocumentId tenant-scoped.
- secureDocument source compatible.
- no storageKey.
```

Audit:

```text id="chnqcu"
maintenanceRequest.evidenceUploaded
```

---

# 16. Maintenance Work Orders API

## 16.1. List work orders

```http id="bpdoq6"
GET /api/v1/tenant/maintenance-work-orders
```

Permission:

```text id="nxl57j"
maintenanceWorkOrders.read
```

Query:

```text id="vpb8aj"
status
categoryId
assetId
propertyUnitId
commonAreaId
supplierId
assignedInternalUserId
priority
severity
executionMode
workOrderType
scheduledFrom
scheduledTo
closedFrom
closedTo
page
pageSize
sortBy
sortDirection
```

Response item:

```json id="l3u5dv"
{
  "id": "uuid",
  "workOrderNumber": "MWO-202607-000001",
  "maintenanceRequestId": "uuid",
  "title": "Reparación de fuga en cisterna",
  "categoryId": "uuid",
  "assetId": "uuid",
  "workOrderType": "corrective",
  "executionMode": "internal",
  "priority": "high",
  "severity": "major",
  "status": "assigned",
  "scheduledStartAt": "2026-07-24T14:00:00Z",
  "scheduledEndAt": "2026-07-24T18:00:00Z",
  "assignedInternalUserId": "uuid",
  "supplierId": null,
  "currency": "USD",
  "createdAt": "2026-07-23T00:00:00Z",
  "updatedAt": "2026-07-23T00:00:00Z"
}
```

---

## 16.2. Create work order

```http id="jol4v3"
POST /api/v1/tenant/maintenance-work-orders
```

Permission:

```text id="ink701"
maintenanceWorkOrders.create
```

Request:

```json id="ivuq1r"
{
  "maintenanceRequestId": null,
  "title": "Revisión preventiva del portón",
  "description": "Revisión del motor y sistema eléctrico del portón vehicular.",
  "categoryId": "uuid",
  "assetId": "uuid",
  "propertyUnitId": null,
  "commonAreaId": "uuid",
  "workOrderType": "preventiveBasic",
  "executionMode": "internal",
  "priority": "normal",
  "severity": "moderate",
  "scheduledStartAt": "2026-07-25T14:00:00Z",
  "scheduledEndAt": "2026-07-25T18:00:00Z",
  "assignedInternalUserId": "uuid",
  "supplierId": null,
  "requiresCostApproval": false,
  "closureEvidenceRequired": true
}
```

Server-side:

```text id="j83f0q"
- genera workOrderNumber;
- status inicial open o assigned según asignación;
- valida referencias tenant-scoped;
- valida supplier active si se envía supplierId;
- no crea pagos;
- no crea JournalEntry.
```

Response:

```http id="quyp8t"
201 Created
```

Audit:

```text id="pbi8yx"
maintenanceWorkOrder.created
```

---

## 16.3. Get work order

```http id="x085pg"
GET /api/v1/tenant/maintenance-work-orders/{workOrderId}
```

Permission:

```text id="f4nvp9"
maintenanceWorkOrders.read
```

Response includes:

```text id="efbop6"
- work order;
- request summary;
- assignments;
- tasks;
- visits;
- evidence metadata;
- costs if caller has maintenanceCosts.read;
- comments allowed;
- supplier links if caller has permission;
- payable links if caller has permission.
```

Does not include:

```text id="jk874u"
storageKey
signedUrl persistente
raw file payload
datos cross-tenant
```

---

## 16.4. Update work order

```http id="evblpk"
PATCH /api/v1/tenant/maintenance-work-orders/{workOrderId}
```

Permission:

```text id="ljksxs"
maintenanceWorkOrders.update
```

Request:

```json id="krf7eb"
{
  "title": "Revisión preventiva del portón principal",
  "description": "Revisión del motor, rieles y sistema eléctrico.",
  "priority": "high",
  "severity": "moderate",
  "scheduledStartAt": "2026-07-25T15:00:00Z",
  "scheduledEndAt": "2026-07-25T18:00:00Z"
}
```

Allowed statuses:

```text id="g9kbdo"
draft
open
pendingAssignment
assigned
scheduled
onHold según política
```

Forbidden:

```text id="tui12s"
tenantId
workOrderNumber
status
createdBy
closedBy
reopenedBy
supplierPayableId
journalEntryId
paymentOrderId
```

Audit:

```text id="m1i4ue"
maintenanceWorkOrder.updated
```

---

## 16.5. Assign work order

```http id="q5zqgp"
POST /api/v1/tenant/maintenance-work-orders/{workOrderId}/assign
```

Permission:

```text id="dxx3wi"
maintenanceWorkOrders.assign
```

Request for internal assignment:

```json id="eytj8v"
{
  "assignmentType": "internalUser",
  "assignedUserId": "uuid",
  "notes": "Asignar a técnico de turno."
}
```

Request for supplier assignment:

```json id="xviauy"
{
  "assignmentType": "supplier",
  "supplierId": "uuid",
  "notes": "Proveedor especializado en portones."
}
```

Validations:

```text id="b6ue97"
- assignedUserId pertenece al tenant membership si aplica.
- supplierId pertenece al tenant si aplica.
- supplier debe estar active.
- supplier blocked se rechaza.
```

Transition:

```text id="em1c3o"
open/pendingAssignment -> assigned
```

Audit:

```text id="tbhq8h"
maintenanceWorkOrder.assigned
maintenanceSupplierLink.created si supplier
```

---

## 16.6. Schedule work order

```http id="izh7iv"
POST /api/v1/tenant/maintenance-work-orders/{workOrderId}/schedule
```

Permission:

```text id="jfzwyc"
maintenanceWorkOrders.schedule
```

Request:

```json id="wibwpa"
{
  "scheduledStartAt": "2026-07-25T14:00:00Z",
  "scheduledEndAt": "2026-07-25T18:00:00Z",
  "comment": "Trabajo programado para la tarde."
}
```

Transition:

```text id="n44z8n"
assigned -> scheduled
```

Audit:

```text id="x0zbdi"
maintenanceWorkOrder.scheduled
```

---

## 16.7. Start work order

```http id="lnwakq"
POST /api/v1/tenant/maintenance-work-orders/{workOrderId}/start
```

Permission:

```text id="nrsdy3"
maintenanceWorkOrders.start
```

Request:

```json id="kmuqbq"
{
  "actualStartAt": "2026-07-25T14:10:00Z",
  "comment": "Se inicia revisión."
}
```

Transition:

```text id="w337ii"
assigned/scheduled/reopened -> inProgress
```

Audit:

```text id="nvsfab"
maintenanceWorkOrder.started
```

---

## 16.8. Pause work order

```http id="o1upjr"
POST /api/v1/tenant/maintenance-work-orders/{workOrderId}/pause
```

Permission:

```text id="zg9p8b"
maintenanceWorkOrders.pause
```

Request:

```json id="i157uz"
{
  "reason": "Se requiere repuesto adicional."
}
```

Transition:

```text id="fq14np"
inProgress -> onHold
```

Audit:

```text id="hlzam1"
maintenanceWorkOrder.paused
```

---

## 16.9. Complete work order

```http id="ykoqbf"
POST /api/v1/tenant/maintenance-work-orders/{workOrderId}/complete
```

Permission:

```text id="rkl1ov"
maintenanceWorkOrders.complete
```

Request:

```json id="cqtas4"
{
  "actualEndAt": "2026-07-25T17:30:00Z",
  "completionSummary": "Se reemplazó pieza dañada y se verificó funcionamiento."
}
```

Transition:

```text id="f6ufln"
inProgress -> completed
```

Audit:

```text id="jf4x7h"
maintenanceWorkOrder.completed
```

---

## 16.10. Close work order

```http id="ajlswm"
POST /api/v1/tenant/maintenance-work-orders/{workOrderId}/close
```

Permission:

```text id="fqe0d1"
maintenanceWorkOrders.close
```

Request:

```json id="r4l7ac"
{
  "completionSummary": "Trabajo cerrado con evidencia de funcionamiento correcto.",
  "closureReason": null
}
```

Validations:

```text id="bjuh81"
- status completed o pendingResidentConfirmation según política.
- completionSummary requerido.
- evidencia válida o closureReason controlada.
- no pagos creados.
- no JournalEntry creado.
```

Transition:

```text id="qprygq"
completed -> closed
```

Audit:

```text id="x6t5ql"
maintenanceWorkOrder.closed
```

Notification:

```text id="we0l9z"
maintenanceWorkOrder.closed
```

---

## 16.11. Reopen work order

```http id="sfppt3"
POST /api/v1/tenant/maintenance-work-orders/{workOrderId}/reopen
```

Permission:

```text id="qvpml3"
maintenanceWorkOrders.reopen
```

Request:

```json id="xzcwo1"
{
  "reason": "El problema se presentó nuevamente."
}
```

Transition:

```text id="heigkx"
closed -> reopened
```

Audit:

```text id="ld5b24"
maintenanceWorkOrder.reopened
```

---

## 16.12. Cancel work order

```http id="vjuxrr"
POST /api/v1/tenant/maintenance-work-orders/{workOrderId}/cancel
```

Permission:

```text id="bq5gqq"
maintenanceWorkOrders.cancel
```

Request:

```json id="l4my07"
{
  "reason": "Trabajo ya no requerido."
}
```

Audit:

```text id="sde49c"
maintenanceWorkOrder.cancelled
```

---

## 16.13. Archive work order

```http id="w1aibm"
POST /api/v1/tenant/maintenance-work-orders/{workOrderId}/archive
```

Permission:

```text id="brrdlv"
maintenanceWorkOrders.archive
```

Request:

```json id="ur0y0y"
{
  "reason": "Cierre histórico archivado."
}
```

Audit:

```text id="vmoypi"
maintenanceWorkOrder.archived
```

---

# 17. Maintenance Tasks API

## 17.1. List tasks

```http id="mo4asn"
GET /api/v1/tenant/maintenance-work-orders/{workOrderId}/tasks
```

Permission:

```text id="rfzzdy"
maintenanceTasks.read
```

Response item:

```json id="xw8mru"
{
  "id": "uuid",
  "workOrderId": "uuid",
  "taskNumber": 1,
  "title": "Revisar motor",
  "description": "Verificar el estado del motor del portón.",
  "status": "pending",
  "priority": "normal",
  "assignedUserId": "uuid",
  "dueAt": "2026-07-25T18:00:00Z",
  "createdAt": "2026-07-23T00:00:00Z"
}
```

---

## 17.2. Create task

```http id="m7v9wy"
POST /api/v1/tenant/maintenance-work-orders/{workOrderId}/tasks
```

Permission:

```text id="peuof9"
maintenanceTasks.create
```

Request:

```json id="dj8piw"
{
  "title": "Revisar motor",
  "description": "Verificar motor del portón.",
  "priority": "normal",
  "assignedUserId": "uuid",
  "dueAt": "2026-07-25T18:00:00Z"
}
```

Server-side:

```text id="xgt40n"
taskNumber secuencial por workOrder
status = pending
```

Audit:

```text id="qwus3u"
maintenanceTask.created
```

---

## 17.3. Get task

```http id="hac8v3"
GET /api/v1/tenant/maintenance-tasks/{taskId}
```

Permission:

```text id="x6x8n9"
maintenanceTasks.read
```

---

## 17.4. Update task

```http id="s7stjw"
PATCH /api/v1/tenant/maintenance-tasks/{taskId}
```

Permission:

```text id="ynfo0w"
maintenanceTasks.update
```

Request:

```json id="fng5vi"
{
  "title": "Revisar motor y riel",
  "description": "Verificar motor, riel y sensores.",
  "priority": "high",
  "assignedUserId": "uuid"
}
```

Forbidden:

```text id="y3of2q"
tenantId
workOrderId
taskNumber
status directo
completedBy
```

Audit:

```text id="psyjja"
maintenanceTask.updated
```

---

## 17.5. Complete task

```http id="ytol7h"
POST /api/v1/tenant/maintenance-tasks/{taskId}/complete
```

Permission:

```text id="xmgzb7"
maintenanceTasks.complete
```

Request:

```json id="e556sv"
{
  "comment": "Motor revisado correctamente."
}
```

Transition:

```text id="xrnxf5"
pending/inProgress/blocked -> completed
```

Audit:

```text id="fbkzgb"
maintenanceTask.completed
```

---

# 18. Maintenance Visits API

## 18.1. List visits

```http id="t4bhcd"
GET /api/v1/tenant/maintenance-work-orders/{workOrderId}/visits
```

Permission:

```text id="u7ahsv"
maintenanceVisits.read
```

---

## 18.2. Create visit

```http id="fkms8y"
POST /api/v1/tenant/maintenance-work-orders/{workOrderId}/visits
```

Permission:

```text id="c5z2yu"
maintenanceVisits.create
```

Request:

```json id="amvewv"
{
  "visitType": "inspection",
  "scheduledAt": "2026-07-25T14:00:00Z",
  "visitedByUserId": "uuid",
  "supplierId": null,
  "residentPersonId": null,
  "propertyUnitId": null,
  "notes": "Inspección inicial programada."
}
```

Validations:

```text id="z3cxtv"
- workOrderId tenant-scoped.
- visitedByUserId membership activo si existe.
- supplierId active si existe.
- propertyUnitId tenant-scoped si existe.
```

Audit:

```text id="bu2k4w"
maintenanceVisit.created
```

---

## 18.3. Get visit

```http id="z6b98w"
GET /api/v1/tenant/maintenance-visits/{visitId}
```

Permission:

```text id="mz80ya"
maintenanceVisits.read
```

---

## 18.4. Update visit

```http id="q08d7a"
PATCH /api/v1/tenant/maintenance-visits/{visitId}
```

Permission:

```text id="pm8iom"
maintenanceVisits.update
```

Request:

```json id="htmz64"
{
  "scheduledAt": "2026-07-25T15:00:00Z",
  "notes": "Se reprograma por disponibilidad."
}
```

---

## 18.5. Complete visit

```http id="z5m0ij"
POST /api/v1/tenant/maintenance-visits/{visitId}/complete
```

Permission:

```text id="kusj3x"
maintenanceVisits.complete
```

Request:

```json id="y5420u"
{
  "startedAt": "2026-07-25T15:00:00Z",
  "endedAt": "2026-07-25T16:00:00Z",
  "accessResult": "accessGranted",
  "notes": "Inspección completada."
}
```

Audit:

```text id="tt9rrk"
maintenanceVisit.completed
```

---

## 18.6. Cancel visit

```http id="e89pn9"
POST /api/v1/tenant/maintenance-visits/{visitId}/cancel
```

Permission:

```text id="gl1ezm"
maintenanceVisits.cancel
```

Request:

```json id="ye30cj"
{
  "reason": "Visita cancelada por lluvia."
}
```

Audit:

```text id="cgje6h"
maintenanceVisit.cancelled
```

---

# 19. Maintenance Evidence API

## 19.1. List evidence

```http id="svx9ju"
GET /api/v1/tenant/maintenance-work-orders/{workOrderId}/evidence
```

Permission:

```text id="rcvebg"
maintenanceEvidence.read
```

Query:

```text id="yjvte6"
status
evidenceType
evidenceStage
visibility
page
pageSize
```

Response item:

```json id="oovipr"
{
  "id": "uuid",
  "workOrderId": "uuid",
  "taskId": null,
  "visitId": "uuid",
  "secureDocumentId": "uuid",
  "evidenceType": "afterPhoto",
  "evidenceStage": "completion",
  "description": "Foto posterior al trabajo.",
  "visibility": "internal",
  "status": "active",
  "downloadAvailable": true,
  "createdAt": "2026-07-23T00:00:00Z"
}
```

Must not include:

```text id="sg8gtf"
storageKey
signedUrl persistente
base64
raw file payload
```

---

## 19.2. Create evidence

```http id="ya4tyg"
POST /api/v1/tenant/maintenance-work-orders/{workOrderId}/evidence
```

Permission:

```text id="qh9ock"
maintenanceEvidence.create
```

Request:

```json id="yibehq"
{
  "taskId": null,
  "visitId": "uuid",
  "secureDocumentId": "uuid",
  "evidenceType": "afterPhoto",
  "evidenceStage": "completion",
  "description": "Foto posterior al trabajo.",
  "visibility": "internal"
}
```

Validations:

```text id="r8hark"
- secureDocumentId tenant-scoped.
- taskId pertenece al workOrder si existe.
- visitId pertenece al workOrder si existe.
- no storageKey.
- no signedUrl.
```

Audit:

```text id="uw5h0q"
maintenanceEvidence.created
```

---

## 19.3. Get evidence

```http id="gn8np5"
GET /api/v1/tenant/maintenance-evidence/{evidenceId}
```

Permission:

```text id="k92srj"
maintenanceEvidence.read
```

---

## 19.4. Verify evidence

```http id="ztf9mt"
POST /api/v1/tenant/maintenance-evidence/{evidenceId}/verify
```

Permission:

```text id="j82gja"
maintenanceEvidence.verify
```

Request:

```json id="gs2p1r"
{
  "comment": "Evidencia validada."
}
```

Transition:

```text id="z8z4j9"
active -> verified
```

Audit:

```text id="lk8pxv"
maintenanceEvidence.verified
```

---

## 19.5. Reject evidence

```http id="bosdgx"
POST /api/v1/tenant/maintenance-evidence/{evidenceId}/reject
```

Permission:

```text id="rx1gou"
maintenanceEvidence.reject
```

Request:

```json id="hnuurq"
{
  "reason": "La imagen no corresponde al trabajo."
}
```

Transition:

```text id="o9y7p4"
active -> rejected
```

Audit:

```text id="bihsrc"
maintenanceEvidence.rejected
```

---

## 19.6. Archive evidence

```http id="s0aa8n"
POST /api/v1/tenant/maintenance-evidence/{evidenceId}/archive
```

Permission:

```text id="khdi7e"
maintenanceEvidence.archive
```

Request:

```json id="u7oc3y"
{
  "reason": "Evidencia duplicada."
}
```

Audit:

```text id="wf4bps"
maintenanceEvidence.archived
```

---

# 20. Maintenance Comments API

## 20.1. List comments

```http id="c2lgqx"
GET /api/v1/tenant/maintenance-work-orders/{workOrderId}/comments
```

Permission:

```text id="k39kny"
maintenanceComments.read
```

Query:

```text id="yxfeyx"
visibility
page
pageSize
```

Response item:

```json id="i03fri"
{
  "id": "uuid",
  "workOrderId": "uuid",
  "maintenanceRequestId": null,
  "commentBody": "Se coordina revisión con proveedor.",
  "visibility": "internal",
  "createdBy": "uuid",
  "createdAt": "2026-07-23T00:00:00Z"
}
```

---

## 20.2. Create comment

```http id="sxc540"
POST /api/v1/tenant/maintenance-work-orders/{workOrderId}/comments
```

Permission:

```text id="il1jww"
maintenanceComments.create
```

Request:

```json id="j5jyid"
{
  "commentBody": "Se coordina revisión con proveedor.",
  "visibility": "internal"
}
```

Allowed visibility:

```text id="xgwza9"
internal
visibleToRequester
visibleToBoard
```

Server-side:

```text id="in1xzu"
visibility system solo puede generarla el sistema
```

Audit:

```text id="mf5iis"
maintenanceComment.created
```

Notification if visible:

```text id="gmok4a"
maintenanceComment.visibleToRequester.created
```

---

# 21. Maintenance Costs API

## 21.1. List costs

```http id="yljn4p"
GET /api/v1/tenant/maintenance-work-orders/{workOrderId}/costs
```

Permission:

```text id="jj8ob6"
maintenanceCosts.read
```

Response item:

```json id="lh4o03"
{
  "id": "uuid",
  "workOrderId": "uuid",
  "costType": "supplierService",
  "description": "Servicio técnico de reparación",
  "estimatedAmount": "120.00",
  "approvedAmount": null,
  "actualAmount": null,
  "currency": "USD",
  "supplierId": "uuid",
  "supplierPayableId": null,
  "status": "draft",
  "createdAt": "2026-07-23T00:00:00Z"
}
```

---

## 21.2. Create cost

```http id="xufynt"
POST /api/v1/tenant/maintenance-work-orders/{workOrderId}/costs
```

Permission:

```text id="wvgptq"
maintenanceCosts.create
```

Request:

```json id="nbo0vr"
{
  "costType": "supplierService",
  "description": "Servicio técnico de reparación",
  "estimatedAmount": "120.00",
  "currency": "USD",
  "supplierId": "uuid"
}
```

Validations:

```text id="udqtpn"
- estimatedAmount string decimal.
- estimatedAmount >= 0.
- currency = USD.
- supplierId tenant-scoped y active si existe.
```

Forbidden:

```text id="z8uzjb"
tenantId
approvedAmount
actualAmount sin permiso
status
supplierPayableId
paymentOrderId
journalEntryId
```

Audit:

```text id="f55by2"
maintenanceCostEstimate.created
```

---

## 21.3. Get cost

```http id="w8pwhx"
GET /api/v1/tenant/maintenance-costs/{costEstimateId}
```

Permission:

```text id="meug5r"
maintenanceCosts.read
```

---

## 21.4. Update cost

```http id="vj02f2"
PATCH /api/v1/tenant/maintenance-costs/{costEstimateId}
```

Permission:

```text id="u895ha"
maintenanceCosts.update
```

Request:

```json id="udnwko"
{
  "description": "Servicio técnico de reparación y ajuste",
  "estimatedAmount": "135.00",
  "supplierId": "uuid"
}
```

Allowed statuses:

```text id="rq7tru"
draft
rejected según política
```

Audit:

```text id="w1ckwe"
maintenanceCostEstimate.updated
```

---

## 21.5. Submit cost

```http id="s69z10"
POST /api/v1/tenant/maintenance-costs/{costEstimateId}/submit
```

Permission:

```text id="syhqcw"
maintenanceCosts.submit
```

Request:

```json id="l0zywl"
{
  "comment": "Costo enviado para aprobación."
}
```

Transition:

```text id="kglssd"
draft -> submitted
```

Audit:

```text id="uuwas0"
maintenanceCostEstimate.submitted
```

---

## 21.6. Approve cost

```http id="fk5yk8"
POST /api/v1/tenant/maintenance-costs/{costEstimateId}/approve
```

Permission:

```text id="zw9drk"
maintenanceCosts.approve
```

Request:

```json id="cwwlr6"
{
  "approvedAmount": "120.00",
  "reason": "Costo aprobado para ejecución."
}
```

Validations:

```text id="jg1i7o"
- approvedAmount string decimal.
- approvedAmount >= 0.
- status submitted.
```

Transition:

```text id="k84yc1"
submitted -> approved
```

Audit:

```text id="ww9kb9"
maintenanceCostEstimate.approved
```

---

## 21.7. Reject cost

```http id="qa5ik4"
POST /api/v1/tenant/maintenance-costs/{costEstimateId}/reject
```

Permission:

```text id="d3py40"
maintenanceCosts.reject
```

Request:

```json id="i99acc"
{
  "reason": "Valor no justificado."
}
```

Transition:

```text id="ip0unn"
submitted -> rejected
```

Audit:

```text id="iqc99w"
maintenanceCostEstimate.rejected
```

---

## 21.8. Cancel cost

```http id="pln57r"
POST /api/v1/tenant/maintenance-costs/{costEstimateId}/cancel
```

Permission:

```text id="orqapd"
maintenanceCosts.cancel
```

Request:

```json id="o6tc9u"
{
  "reason": "Costo ya no requerido."
}
```

Audit:

```text id="xe6n34"
maintenanceCostEstimate.cancelled
```

---

## 21.9. Convert cost to payable

```http id="rr5a5d"
POST /api/v1/tenant/maintenance-costs/{costEstimateId}/convert-to-payable
```

Permission:

```text id="o8g1jq"
maintenanceCosts.convertToPayable
```

Request:

```json id="to8hzl"
{
  "dueDate": "2026-08-15",
  "description": "Cuenta por pagar derivada de mantenimiento.",
  "secureDocumentId": "uuid"
}
```

Validations:

```text id="kbyo59"
- costEstimate tenant-scoped.
- costEstimate status approved.
- workOrder tenant-scoped.
- supplierId requerido y active.
- no existe MaintenancePayableLink activo.
- Supplier Payments habilitado.
- secureDocumentId tenant-scoped si se envía.
```

Server-side:

```text id="q8phh5"
- invoca 021-supplier-payments mediante puerto.
- crea SupplierPayable draft/controlado.
- crea MaintenancePayableLink.
- no crea SupplierPaymentOrder.
- no marca paid.
- no inicia transferencia.
- no crea JournalEntry.
```

Response:

```json id="i5vw9p"
{
  "data": {
    "maintenancePayableLinkId": "uuid",
    "supplierPayableId": "uuid",
    "status": "active"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Audit:

```text id="fdul53"
maintenanceCostEstimate.convertedToPayable
maintenancePayableLink.created
```

---

# 22. Maintenance Supplier Links API

## 22.1. List supplier links

```http id="n5h81u"
GET /api/v1/tenant/maintenance-work-orders/{workOrderId}/supplier-links
```

Permission:

```text id="kk5132"
maintenanceSupplierLinks.read
```

Response item:

```json id="cat0d9"
{
  "id": "uuid",
  "workOrderId": "uuid",
  "supplierId": "uuid",
  "linkType": "assigned",
  "status": "active",
  "linkedAt": "2026-07-23T00:00:00Z"
}
```

---

## 22.2. Create supplier link

```http id="nqpa3u"
POST /api/v1/tenant/maintenance-work-orders/{workOrderId}/supplier-links
```

Permission:

```text id="ltt4s1"
maintenanceSupplierLinks.create
```

Request:

```json id="fr8hod"
{
  "supplierId": "uuid",
  "linkType": "assigned"
}
```

Validations:

```text id="bdajla"
- supplierId tenant-scoped.
- supplier active.
- supplier not blocked.
- workOrder tenant-scoped.
```

Audit:

```text id="ttr6xs"
maintenanceSupplierLink.created
```

---

## 22.3. Unlink supplier

```http id="cbex9o"
POST /api/v1/tenant/maintenance-supplier-links/{linkId}/unlink
```

Permission:

```text id="ep4imk"
maintenanceSupplierLinks.unlink
```

Request:

```json id="hs1r1o"
{
  "reason": "Proveedor reemplazado."
}
```

Audit:

```text id="zfqayb"
maintenanceSupplierLink.unlinked
```

---

# 23. Maintenance Payable Links API

## 23.1. List payable links

```http id="wjkaum"
GET /api/v1/tenant/maintenance-work-orders/{workOrderId}/payable-links
```

Permission:

```text id="ebfgzp"
maintenancePayableLinks.read
```

Response item:

```json id="ii3h50"
{
  "id": "uuid",
  "workOrderId": "uuid",
  "costEstimateId": "uuid",
  "supplierPayableId": "uuid",
  "status": "active",
  "createdAt": "2026-07-23T00:00:00Z"
}
```

---

# 24. Maintenance Reports API

## 24.1. By status

```http id="se71ml"
GET /api/v1/tenant/maintenance-reports/by-status
```

Permission:

```text id="hf64eb"
maintenanceReports.byStatus
```

Query:

```text id="ar7u9y"
dateFrom
dateTo
categoryId
priority
severity
```

Response:

```json id="ig09ep"
{
  "data": {
    "period": {
      "dateFrom": "2026-07-01",
      "dateTo": "2026-07-31"
    },
    "items": [
      {
        "status": "open",
        "count": 12
      },
      {
        "status": "closed",
        "count": 8
      }
    ]
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Audit:

```text id="vtx2op"
maintenanceReport.generated
```

---

## 24.2. By category

```http id="qpbyzl"
GET /api/v1/tenant/maintenance-reports/by-category
```

Permission:

```text id="wl5t24"
maintenanceReports.byCategory
```

Response item:

```json id="yyezqo"
{
  "categoryId": "uuid",
  "categoryName": "Plomería",
  "requestCount": 5,
  "workOrderCount": 4,
  "closedCount": 3,
  "approvedCostAmount": "320.00",
  "currency": "USD"
}
```

---

## 24.3. Response times

```http id="rx16xr"
GET /api/v1/tenant/maintenance-reports/response-times
```

Permission:

```text id="hwkgup"
maintenanceReports.responseTimes
```

Response:

```json id="g3whuq"
{
  "data": {
    "averageHoursSubmittedToAccepted": "5.25",
    "averageHoursAcceptedToWorkOrder": "2.40",
    "averageHoursOpenToClosed": "36.75",
    "items": []
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 24.4. Costs

```http id="tmt3zo"
GET /api/v1/tenant/maintenance-reports/costs
```

Permission:

```text id="xn8y1x"
maintenanceReports.costs
```

Response:

```json id="xjbm4v"
{
  "data": {
    "estimatedAmountTotal": "500.00",
    "approvedAmountTotal": "450.00",
    "actualAmountTotal": "430.00",
    "currency": "USD",
    "items": []
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 24.5. By supplier

```http id="v1n06b"
GET /api/v1/tenant/maintenance-reports/by-supplier
```

Permission:

```text id="e2odg7"
maintenanceReports.bySupplier
```

Response item:

```json id="upxalx"
{
  "supplierId": "uuid",
  "workOrderCount": 6,
  "closedCount": 5,
  "reopenedCount": 1,
  "approvedCostAmount": "700.00",
  "currency": "USD"
}
```

---

## 24.6. Export report

```http id="mpkgoi"
GET /api/v1/tenant/maintenance-reports/export
```

Permission:

```text id="bkex3t"
maintenanceReports.export
```

Query:

```text id="t5m3kk"
reportType
format
dateFrom
dateTo
categoryId
status
supplierId
```

Allowed reportType:

```text id="pyne27"
byStatus
byCategory
responseTimes
costs
bySupplier
```

Allowed format:

```text id="cvyi0a"
csv
xlsx
pdf
```

Response:

```json id="tf7key"
{
  "data": {
    "secureDocumentId": "uuid",
    "secureDocumentFileId": "uuid",
    "downloadAvailable": true
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Rules:

```text id="c5mwh4"
- export se guarda vía Secure Document Storage.
- no devuelve storageKey.
- no devuelve signedUrl persistente.
```

Audit:

```text id="lkn2pz"
maintenanceReport.exported
```

---

# 25. Endpoints públicos prohibidos

No crear ni documentar:

```text id="crhttc"
GET  /api/v1/public/maintenance-requests
GET  /api/v1/public/maintenance-work-orders
GET  /api/v1/public/maintenance-evidence
GET  /api/v1/public/maintenance-reports
GET  /api/v1/public/tenants/{slug}/maintenance-requests
GET  /api/v1/public/tenants/{slug}/maintenance-work-orders
POST /api/v1/public/maintenance-requests
POST /api/v1/public/tenants/{slug}/maintenance-requests
```

Respuesta esperada:

```http id="kbolzn"
404 Not Found
```

---

# 26. DTOs principales

## 26.1. CreateMaintenanceRequestDto

```typescript id="z716xm"
type CreateMaintenanceRequestDto = {
  title: string;
  description: string;
  categoryId: string;
  assetId?: string | null;
  propertyUnitId?: string | null;
  commonAreaId?: string | null;
  requestSource?: MaintenanceRequestSource;
  visibility?: MaintenanceRequestVisibility;
  priority?: MaintenancePriority;
  severity?: MaintenanceSeverity;
};
```

Forbidden:

```text id="feeh39"
tenantId
requestNumber
reportedByUserId
reportedByPersonId
status
createdBy
updatedBy
```

---

## 26.2. CreateOwnMaintenanceRequestDto

```typescript id="fi5bdf"
type CreateOwnMaintenanceRequestDto = {
  title: string;
  description: string;
  categoryId: string;
  assetId?: string | null;
  propertyUnitId?: string | null;
  commonAreaId?: string | null;
  priority?: MaintenancePriority;
  severity?: MaintenanceSeverity;
};
```

Server-side:

```text id="l73v5h"
requestSource = residentPortal
reportedByUserId = currentUserProfile.id
reportedByPersonId = resolved person id
visibility = requesterOnly
status = submitted
```

---

## 26.3. MaintenanceRequestDto administrativo

```typescript id="y84nti"
type MaintenanceRequestDto = {
  id: string;
  requestNumber: string;
  title: string;
  description: string;
  categoryId: string;
  assetId?: string | null;
  propertyUnitId?: string | null;
  commonAreaId?: string | null;
  reportedByUserId: string;
  reportedByPersonId?: string | null;
  requestSource: MaintenanceRequestSource;
  visibility: MaintenanceRequestVisibility;
  priority: MaintenancePriority;
  severity: MaintenanceSeverity;
  status: MaintenanceRequestStatus;
  duplicateOfRequestId?: string | null;
  acceptedAsWorkOrderId?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  acceptedAt?: string | null;
  rejectedAt?: string | null;
  cancelledAt?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};
```

---

## 26.4. OwnMaintenanceRequestDto

```typescript id="kdlkrc"
type OwnMaintenanceRequestDto = {
  id: string;
  requestNumber: string;
  title: string;
  description: string;
  categoryId: string;
  assetId?: string | null;
  propertyUnitId?: string | null;
  commonAreaId?: string | null;
  priority: MaintenancePriority;
  severity: MaintenanceSeverity;
  status: MaintenanceRequestStatus;
  visibleComments?: OwnMaintenanceCommentDto[];
  visibleEvidence?: OwnMaintenanceEvidenceDto[];
  submittedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};
```

Must not include:

```text id="hvgk4t"
internal comments
costs
supplierId
supplierPayableId
admin metadata
audit metadata
status history completo
```

---

## 26.5. CreateMaintenanceWorkOrderDto

```typescript id="gukna4"
type CreateMaintenanceWorkOrderDto = {
  maintenanceRequestId?: string | null;
  title: string;
  description: string;
  categoryId: string;
  assetId?: string | null;
  propertyUnitId?: string | null;
  commonAreaId?: string | null;
  workOrderType: MaintenanceWorkOrderType;
  executionMode: MaintenanceExecutionMode;
  priority?: MaintenancePriority;
  severity?: MaintenanceSeverity;
  scheduledStartAt?: string | null;
  scheduledEndAt?: string | null;
  assignedInternalUserId?: string | null;
  supplierId?: string | null;
  requiresCostApproval?: boolean;
  closureEvidenceRequired?: boolean;
};
```

Forbidden:

```text id="wf6f67"
tenantId
workOrderNumber
status
createdBy
supplierPayableId
paymentOrderId
journalEntryId
```

---

## 26.6. MaintenanceWorkOrderDto

```typescript id="cb3zj8"
type MaintenanceWorkOrderDto = {
  id: string;
  workOrderNumber: string;
  maintenanceRequestId?: string | null;
  title: string;
  description: string;
  categoryId: string;
  assetId?: string | null;
  propertyUnitId?: string | null;
  commonAreaId?: string | null;
  workOrderType: MaintenanceWorkOrderType;
  executionMode: MaintenanceExecutionMode;
  priority: MaintenancePriority;
  severity: MaintenanceSeverity;
  status: MaintenanceWorkOrderStatus;
  scheduledStartAt?: string | null;
  scheduledEndAt?: string | null;
  actualStartAt?: string | null;
  actualEndAt?: string | null;
  assignedInternalUserId?: string | null;
  supplierId?: string | null;
  estimatedCostAmount?: string | null;
  approvedCostAmount?: string | null;
  actualCostAmount?: string | null;
  currency: "USD";
  requiresCostApproval: boolean;
  costApprovalStatus?: MaintenanceCostApprovalStatus | null;
  completionSummary?: string | null;
  closureEvidenceRequired: boolean;
  closedAt?: string | null;
  reopenedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
};
```

---

## 26.7. CreateMaintenanceCostEstimateDto

```typescript id="c4mvut"
type CreateMaintenanceCostEstimateDto = {
  costType: MaintenanceCostType;
  description?: string | null;
  estimatedAmount?: string | null;
  currency: "USD";
  supplierId?: string | null;
};
```

Forbidden:

```text id="vrkf8x"
approvedAmount
actualAmount
status
supplierPayableId
paymentOrderId
journalEntryId
```

---

## 26.8. MaintenanceCostEstimateDto

```typescript id="mxoc7m"
type MaintenanceCostEstimateDto = {
  id: string;
  workOrderId: string;
  costType: MaintenanceCostType;
  description?: string | null;
  estimatedAmount?: string | null;
  approvedAmount?: string | null;
  actualAmount?: string | null;
  currency: "USD";
  supplierId?: string | null;
  supplierPayableId?: string | null;
  status: MaintenanceCostEstimateStatus;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  cancelledAt?: string | null;
};
```

---

## 26.9. CreateMaintenanceEvidenceDto

```typescript id="n96cqe"
type CreateMaintenanceEvidenceDto = {
  taskId?: string | null;
  visitId?: string | null;
  secureDocumentId: string;
  evidenceType: MaintenanceEvidenceType;
  evidenceStage: MaintenanceEvidenceStage;
  description?: string | null;
  visibility: MaintenanceEvidenceVisibility;
};
```

Forbidden:

```text id="m5ofv0"
storageKey
signedUrl
base64
raw file payload
```

---

# 27. Campos prohibidos en todos los DTOs

```text id="nfsyia"
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

---

# 28. Errores

## 28.1. Categorías y activos

```text id="spblpa"
MAINTENANCE_CATEGORY_NOT_FOUND
MAINTENANCE_CATEGORY_DUPLICATE_CODE
MAINTENANCE_CATEGORY_INVALID_STATUS

MAINTENANCE_ASSET_NOT_FOUND
MAINTENANCE_ASSET_DUPLICATE_CODE
MAINTENANCE_ASSET_INVALID_STATUS
MAINTENANCE_ASSET_CROSS_TENANT_REFERENCE
```

---

## 28.2. Solicitudes

```text id="hj7z9r"
MAINTENANCE_REQUEST_NOT_FOUND
MAINTENANCE_REQUEST_INVALID_STATUS
MAINTENANCE_REQUEST_INVALID_TRANSITION
MAINTENANCE_REQUEST_OWNERSHIP_FORBIDDEN
MAINTENANCE_REQUEST_CROSS_TENANT_REFERENCE
MAINTENANCE_REQUEST_DUPLICATE_INVALID
MAINTENANCE_REQUEST_REJECTION_REASON_REQUIRED
MAINTENANCE_REQUEST_CANCEL_REASON_REQUIRED
```

---

## 28.3. Órdenes

```text id="mzkhbx"
MAINTENANCE_WORK_ORDER_NOT_FOUND
MAINTENANCE_WORK_ORDER_INVALID_STATUS
MAINTENANCE_WORK_ORDER_INVALID_TRANSITION
MAINTENANCE_WORK_ORDER_ASSIGNMENT_REQUIRED
MAINTENANCE_WORK_ORDER_CLOSE_EVIDENCE_REQUIRED
MAINTENANCE_WORK_ORDER_REOPEN_REASON_REQUIRED
MAINTENANCE_WORK_ORDER_CANCEL_REASON_REQUIRED
MAINTENANCE_WORK_ORDER_CROSS_TENANT_REFERENCE
```

---

## 28.4. Tareas, visitas y evidencias

```text id="u590jf"
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
MAINTENANCE_EVIDENCE_REJECT_REASON_REQUIRED
```

---

## 28.5. Costos y proveedores

```text id="nmvxy4"
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
```

---

## 28.6. Seguridad

```text id="wyucpj"
MAINTENANCE_PUBLIC_ENDPOINT_FORBIDDEN
MAINTENANCE_WORDPRESS_ACCESS_FORBIDDEN
MAINTENANCE_DIRECT_PAYMENT_FORBIDDEN
MAINTENANCE_DIRECT_ACCOUNTING_FORBIDDEN
MAINTENANCE_OPEN_BANKING_PAYMENT_INITIATION_FORBIDDEN
MAINTENANCE_EXTERNAL_AI_FORBIDDEN
```

---

# 29. Matriz de endpoints

| Endpoint                                                  | Método | Permiso                                  | Audit                                        | Notificación |
| --------------------------------------------------------- | -----: | ---------------------------------------- | -------------------------------------------- | ------------ |
| `/tenant/maintenance-categories`                          |    GET | `maintenanceCategories.read`             | No                                           | No           |
| `/tenant/maintenance-categories`                          |   POST | `maintenanceCategories.create`           | `maintenanceCategory.created`                | No           |
| `/tenant/maintenance-categories/{id}`                     |  PATCH | `maintenanceCategories.update`           | `maintenanceCategory.updated`                | No           |
| `/tenant/maintenance-categories/{id}/archive`             |   POST | `maintenanceCategories.archive`          | `maintenanceCategory.archived`               | No           |
| `/tenant/maintenance-assets`                              |   POST | `maintenanceAssets.create`               | `maintenanceAsset.created`                   | No           |
| `/tenant/maintenance-requests`                            |   POST | `maintenanceRequests.create`             | `maintenanceRequest.created`                 | Opcional     |
| `/me/maintenance-requests`                                |   POST | `maintenanceRequests.own.create`         | `maintenanceRequest.submitted`               | Sí           |
| `/tenant/maintenance-requests/{id}/review`                |   POST | `maintenanceRequests.review`             | `maintenanceRequest.reviewed`                | No           |
| `/tenant/maintenance-requests/{id}/accept`                |   POST | `maintenanceRequests.accept`             | `maintenanceRequest.accepted`                | Sí           |
| `/tenant/maintenance-requests/{id}/reject`                |   POST | `maintenanceRequests.reject`             | `maintenanceRequest.rejected`                | Sí           |
| `/tenant/maintenance-requests/{id}/convert-to-work-order` |   POST | `maintenanceRequests.convertToWorkOrder` | `maintenanceRequest.convertedToWorkOrder`    | Sí           |
| `/tenant/maintenance-work-orders`                         |   POST | `maintenanceWorkOrders.create`           | `maintenanceWorkOrder.created`               | Opcional     |
| `/tenant/maintenance-work-orders/{id}/assign`             |   POST | `maintenanceWorkOrders.assign`           | `maintenanceWorkOrder.assigned`              | Sí           |
| `/tenant/maintenance-work-orders/{id}/start`              |   POST | `maintenanceWorkOrders.start`            | `maintenanceWorkOrder.started`               | Opcional     |
| `/tenant/maintenance-work-orders/{id}/complete`           |   POST | `maintenanceWorkOrders.complete`         | `maintenanceWorkOrder.completed`             | Sí           |
| `/tenant/maintenance-work-orders/{id}/close`              |   POST | `maintenanceWorkOrders.close`            | `maintenanceWorkOrder.closed`                | Sí           |
| `/tenant/maintenance-work-orders/{id}/reopen`             |   POST | `maintenanceWorkOrders.reopen`           | `maintenanceWorkOrder.reopened`              | Sí           |
| `/tenant/maintenance-work-orders/{id}/evidence`           |   POST | `maintenanceEvidence.create`             | `maintenanceEvidence.created`                | No           |
| `/tenant/maintenance-costs/{id}/approve`                  |   POST | `maintenanceCosts.approve`               | `maintenanceCostEstimate.approved`           | No           |
| `/tenant/maintenance-costs/{id}/convert-to-payable`       |   POST | `maintenanceCosts.convertToPayable`      | `maintenanceCostEstimate.convertedToPayable` | No           |
| `/tenant/maintenance-reports/export`                      |    GET | `maintenanceReports.export`              | `maintenanceReport.exported`                 | No           |

---

# 30. Integración con Secure Document Storage

Toda evidencia y exportación se maneja mediante `016-secure-document-storage`.

Request permitido:

```json id="jq8ja7"
{
  "secureDocumentId": "uuid"
}
```

Response permitido:

```json id="ucgd2f"
{
  "secureDocumentId": "uuid",
  "downloadAvailable": true
}
```

Prohibido:

```text id="gruutk"
storageKey
signedUrl persistente
base64
raw file payload
```

OpenAPI debe marcar:

```yaml id="o02cf5"
x-secure-document-storage: true
x-storage-key-exposed: false
```

---

# 31. Integración con Supplier Payments

El único flujo permitido es:

```text id="tvyrv5"
MaintenanceCostEstimate approved
  -> convert-to-payable
  -> SupplierPayable draft/controlado
  -> MaintenancePayableLink active
```

Prohibido desde Maintenance:

```text id="qhp0hy"
- crear SupplierPaymentOrder;
- marcar SupplierPaymentOrder paid;
- crear Payment;
- crear PaymentAllocation;
- iniciar transferencia bancaria;
- modificar cuenta bancaria de proveedor;
- modificar conciliación;
- crear JournalEntry.
```

OpenAPI debe marcar el endpoint `convert-to-payable` con:

```yaml id="jxi3r8"
x-supplier-payments-linked: true
x-creates-payment: false
x-creates-supplier-payment-order: false
x-bank-transfer-initiation: false
x-direct-accounting: false
```

---

# 32. Auditoría

Eventos mínimos:

```text id="e8nrwf"
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
maintenanceWorkOrder.created
maintenanceWorkOrder.updated
maintenanceWorkOrder.assigned
maintenanceWorkOrder.scheduled
maintenanceWorkOrder.started
maintenanceWorkOrder.paused
maintenanceWorkOrder.completed
maintenanceWorkOrder.closed
maintenanceWorkOrder.reopened
maintenanceWorkOrder.cancelled
maintenanceWorkOrder.archived
maintenanceTask.created
maintenanceTask.updated
maintenanceTask.completed
maintenanceVisit.created
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

Metadata permitida:

```text id="mzg8ed"
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

Metadata prohibida:

```text id="wz5r7p"
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

# 33. Observabilidad

## 33.1. Logs

Eventos loggeables:

```text id="wdts1m"
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

```text id="w8pgr9"
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

```text id="vsy8ul"
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

## 33.2. Métricas

```text id="e4dl9p"
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

```text id="oj4nzf"
requestStatus
workOrderStatus
priority
severity
category
executionMode
workOrderType
outcome
```

Labels prohibidos:

```text id="gc6ksh"
tenantId
userId
personId
propertyUnitId
supplierId
workOrderId
requestId
secureDocumentId
traceId
```

---

# 34. OpenAPI

## 34.1. Tags

```text id="v95t4a"
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

## 34.2. Extensiones obligatorias

Todas las rutas tenant:

```yaml id="x41bdu"
x-tenant-scope: true
x-auth-required: true
x-maintenance-work-orders: true
x-public-exposure: false
```

Rutas `/me`:

```yaml id="hylpyl"
x-own-resource: true
x-internal-fields-excluded: true
x-costs-exposed: false
x-internal-comments-exposed: false
```

Rutas con evidencias/documentos:

```yaml id="usowl9"
x-secure-document-storage: true
x-storage-key-exposed: false
```

Rutas con costos:

```yaml id="vx1ls2"
x-decimal-money: true
x-payment-creation: false
x-bank-transfer-initiation: false
x-direct-accounting: false
```

Rutas con Supplier Payments:

```yaml id="w7na2o"
x-supplier-payments-linked: true
x-supplier-payment-order-created: false
x-supplier-payment-mark-paid: false
```

Restricciones globales:

```yaml id="d7t21v"
x-public-endpoint: false
x-wordpress-access: false
x-open-banking-payment-initiation: false
x-external-ai-real-data: false
```

---

# 35. Rate limiting

Aplicar rate limit reforzado en:

```text id="otba9c"
POST /api/v1/me/maintenance-requests
POST /api/v1/me/maintenance-requests/{requestId}/comments
POST /api/v1/me/maintenance-requests/{requestId}/evidence
POST /api/v1/tenant/maintenance-requests/{requestId}/convert-to-work-order
POST /api/v1/tenant/maintenance-work-orders
POST /api/v1/tenant/maintenance-work-orders/{workOrderId}/close
POST /api/v1/tenant/maintenance-work-orders/{workOrderId}/reopen
POST /api/v1/tenant/maintenance-costs/{costEstimateId}/approve
POST /api/v1/tenant/maintenance-costs/{costEstimateId}/convert-to-payable
GET  /api/v1/tenant/maintenance-reports/export
```

---

# 36. CORS y WordPress

Regla:

```text id="c9dwmm"
WordPress público no consume Maintenance Work Orders.
```

No habilitar CORS público para:

```text id="b1qtgy"
/api/v1/tenant/maintenance-*
/api/v1/me/maintenance-*
```

Permitido:

```text id="kxdp7n"
frontend administrativo autenticado
portal autenticado de residentes si pertenece a RESIDENT Core
```

---

# 37. No aceptación del contrato API

El contrato no debe aceptarse si:

```text id="vxa5fu"
- documenta endpoints públicos;
- omite endpoints /me propios;
- /me expone costos internos;
- /me expone comentarios internos;
- /me expone proveedor interno sin permiso;
- acepta tenantId en DTOs;
- acepta actor fields en DTOs;
- acepta status directo fuera de transición;
- expone storageKey;
- expone signedUrl persistente;
- acepta base64;
- permite resident consultar solicitud ajena;
- permite resident crear solicitud sobre unidad ajena;
- permite work order cross-tenant;
- permite evidence cross-tenant;
- permite cost cross-tenant;
- permite supplier cross-tenant;
- permite cerrar orden sin evidencia ni razón;
- permite reabrir sin razón;
- usa number/float para money;
- crea Payment;
- crea SupplierPaymentOrder;
- marca paid;
- inicia transferencia bancaria;
- inicia Open Banking payment;
- crea JournalEntry;
- confirma Bank Reconciliation;
- permite acceso desde WordPress público;
- permite IA externa con datos reales.
```

---

# 38. Resultado esperado

Al implementar este contrato, el módulo `022-maintenance-work-orders` tendrá una API REST clara, segura y consistente para operar mantenimiento en RESIDENT Core.

Resultado esperado:

```text id="hbu3ta"
tenant admin API definida
/me own API definida
public API prohibida
maintenance categories endpoints definidos
maintenance assets endpoints definidos
maintenance requests endpoints definidos
maintenance work orders endpoints definidos
maintenance tasks endpoints definidos
maintenance visits endpoints definidos
maintenance evidence endpoints definidos
maintenance comments endpoints definidos
maintenance costs endpoints definidos
maintenance supplier links endpoints definidos
maintenance payable links endpoints definidos
maintenance reports endpoints definidos
DTOs principales definidos
permissions definidos
errors definidos
audit events definidos
observability definida
OpenAPI extensions definidas
SDS integration definida
Supplier Payments integration definida
no direct payments
no direct accounting
no WordPress public access
```

---

# 39. Expediente actualizado

```text id="zixx2z"
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
│   │       └── api-contract.md
```
