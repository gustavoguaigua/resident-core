# Security Notes — 022 Maintenance Work Orders

## 1. Información del documento

| Campo           | Valor                                                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Proyecto        | RESIDENT Core                                                                                                                  |
| Spec ID         | 022                                                                                                                            |
| Módulo          | Maintenance Work Orders                                                                                                        |
| Documento       | Security Notes                                                                                                                 |
| Ruta            | `docs/specs/022-maintenance-work-orders/security-notes.md`                                                                     |
| Versión         | 0.1                                                                                                                            |
| Estado          | needs-review                                                                                                                   |
| Fecha           | 2026-07-23                                                                                                                     |
| Documento base  | `docs/specs/022-maintenance-work-orders/spec.md`                                                                               |
| Plan técnico    | `docs/specs/022-maintenance-work-orders/plan.md`                                                                               |
| Modelo de datos | `docs/specs/022-maintenance-work-orders/data-model.md`                                                                         |
| Contrato API    | `docs/specs/022-maintenance-work-orders/api-contract.md`                                                                       |
| Plan de pruebas | `docs/specs/022-maintenance-work-orders/test-plan.md`                                                                          |
| Tasks           | `docs/specs/022-maintenance-work-orders/tasks.md`                                                                              |
| Stack objetivo  | NestJS / TypeScript / PostgreSQL / Prisma / OpenAPI / Keycloak                                                                 |
| Naturaleza      | Tenant-scoped / Operational / Request-driven / Work-order-driven / Evidence-backed / Supplier-aware / Cost-aware / Audit-heavy |

---

## 2. Propósito

Este documento define las notas de seguridad del módulo `022-maintenance-work-orders`.

El objetivo es consolidar los controles de seguridad, privacidad, autorización, multitenancy, auditoría, protección documental, protección de datos operativos, protección de evidencias, límites financieros y límites de exposición para el módulo de mantenimiento de RESIDENT Core.

Regla central de seguridad:

```text id="tj941w"
Toda solicitud, orden de trabajo, tarea, visita, evidencia, comentario, costo, aprobación, vínculo con proveedor, vínculo con cuenta por pagar, reporte y exportación de Maintenance Work Orders debe proteger tenant isolation, autorización por permisos, acceso propio /me, privacidad de residentes, confidencialidad de evidencias, integridad operativa, trazabilidad auditable, ausencia de pagos directos, ausencia de contabilidad directa, ausencia de endpoints públicos, ausencia de acceso desde WordPress público, ausencia de storageKey expuesto y ausencia de IA externa con datos reales.
```

---

## 3. Clasificación de seguridad del módulo

`Maintenance Work Orders` es un módulo operativo con exposición parcial a residentes mediante `/me`.

Clasificación:

```text id="rnh8v6"
- Tenant-scoped.
- Resident-facing limitado.
- Administrativo-operativo.
- Evidence-backed.
- Supplier-aware.
- Cost-aware.
- Audit-heavy.
- Non-public.
- No WordPress public access.
- No direct financial authority.
- No direct accounting authority.
```

Implicación:

```text id="edvgiz"
El módulo maneja información operativa sensible: reportes de daños, fotos, comentarios, unidades habitacionales, residentes, proveedores, costos referenciales, evidencia documental y decisiones administrativas. Por tanto, debe tratarse como información privada del tenant.
```

---

## 4. Activos protegidos

El módulo debe proteger los siguientes activos:

```text id="tqtbos"
- maintenance_categories;
- maintenance_assets;
- maintenance_requests;
- maintenance_request_attachments;
- maintenance_work_orders;
- maintenance_work_order_assignments;
- maintenance_work_order_tasks;
- maintenance_visits;
- maintenance_evidence;
- maintenance_cost_estimates;
- maintenance_cost_approvals;
- maintenance_supplier_links;
- maintenance_payable_links;
- maintenance_comments;
- maintenance_status_history;
- reportes de mantenimiento;
- exportaciones de mantenimiento;
- evidencias fotográficas;
- informes técnicos;
- cotizaciones;
- comprobantes;
- referencias a Secure Document Storage;
- vínculos con Supplier Payments;
- datos de residentes, propietarios, unidades y proveedores.
```

---

## 5. Datos sensibles y datos internos

### 5.1. Datos sensibles

Se consideran sensibles o privados:

```text id="f3cotp"
- nombres de residentes si aparecen en solicitudes o comentarios;
- unidades habitacionales;
- fotos de daños o interiores;
- fotos de áreas privadas;
- informes técnicos;
- comentarios de residentes;
- comentarios administrativos internos;
- datos de proveedores;
- costos estimados;
- costos aprobados;
- costos reales referenciales;
- vínculos con cuentas por pagar;
- documentos adjuntos;
- evidencia de cierre;
- trazabilidad de visitas;
- datos de acceso a unidades;
- razones de rechazo, cancelación o reapertura.
```

---

### 5.2. Datos internos no visibles en `/me`

Los residentes no deben ver por defecto:

```text id="rn2lmc"
- comentarios internal;
- costos internos;
- estimatedCostAmount;
- approvedCostAmount;
- actualCostAmount;
- supplierId;
- supplierPayableId;
- MaintenancePayableLink;
- MaintenanceSupplierLink interno;
- auditoría completa;
- status history completa;
- metadata administrativa;
- evidencias internal;
- información interna de proveedor;
- razones administrativas internas no destinadas al solicitante.
```

---

### 5.3. Datos prohibidos en cualquier response

Nunca exponer:

```text id="kaeeku"
storageKey
signedUrl persistente
base64
raw file payload
tokens
secrets
passwords
SQL raw
stack trace productivo
datos cross-tenant
datos internos de otro residente
datos bancarios
raw supplier payload
raw payment payload
```

---

## 6. Modelo de amenazas STRIDE

### 6.1. Spoofing

Riesgo:

```text id="w7hnkl"
Un atacante intenta actuar como residente, técnico, administrador o responsable financiero para crear solicitudes, cerrar órdenes o aprobar costos.
```

Controles:

```text id="hm9rxz"
- Autenticación obligatoria con Bearer token.
- Keycloak como IdP.
- Resolución server-side de UserProfile.
- Validación de TenantMembership.
- PermissionGuard en rutas administrativas.
- OwnResourceGuard en rutas /me.
- Actor fields prohibidos en body.
- Auditoría de operaciones críticas.
```

---

### 6.2. Tampering

Riesgo:

```text id="i0veae"
Un usuario manipula estados, costos, evidencias, proveedores o vínculos financieros mediante payloads alterados.
```

Controles:

```text id="atjjqe"
- ValidationPipe whitelist.
- forbidNonWhitelisted.
- DTOs explícitos.
- Prohibición de status directo.
- Endpoints de transición controlados.
- Decimal money.
- Constraints de montos no negativos.
- Validación tenant-scoped de referencias.
- Evidencias mediante SDS.
- No storageKey en request ni response.
- Historial de estados.
- Auditoría de cambios críticos.
```

---

### 6.3. Repudiation

Riesgo:

```text id="gf02k1"
Un usuario niega haber creado una solicitud, aprobado un costo, cerrado una orden, rechazado una evidencia o convertido un costo a payable.
```

Controles:

```text id="w02gmw"
- Audit obligatorio.
- actorUserProfileId server-side.
- traceId.
- requestId.
- correlationId.
- timestamp UTC.
- MaintenanceStatusHistory.
- registro de reason en reject/cancel/reopen.
- evidencia de cierre.
```

---

### 6.4. Information Disclosure

Riesgo:

```text id="yk44cr"
Se exponen solicitudes, evidencias, comentarios internos, costos, proveedores, documentos o datos de otro tenant o residente.
```

Controles:

```text id="d7c1mp"
- tenantId obligatorio en toda consulta.
- 404 para cross-tenant.
- DTOs diferenciados admin vs /me.
- /me solo recursos propios.
- internal comments excluidos de /me.
- costos excluidos de /me.
- evidence visibility.
- no storageKey.
- no signedUrl persistente.
- no endpoint público.
- no WordPress public access.
- CORS restrictivo.
- logs sanitizados.
- audit sanitizado.
```

---

### 6.5. Denial of Service

Riesgo:

```text id="zr5u8i"
Abuso de creación de solicitudes, carga de evidencias, comentarios, exportaciones o reportes pesados.
```

Controles:

```text id="kvzmk0"
- rate limit reforzado en endpoints sensibles.
- pageSize máximo 100.
- límites de tamaño de archivo en SDS.
- exportaciones mediante SDS.
- jobs futuros para exports pesados.
- índices por tenant/status/fecha.
- validaciones tempranas.
- no base64 en JSON.
```

---

### 6.6. Elevation of Privilege

Riesgo:

```text id="wmf11g"
Un residente intenta aprobar costos, cerrar órdenes, ver comentarios internos, crear payables, asignar proveedores o consultar reportes administrativos.
```

Controles:

```text id="w6n7ef"
- permisos granulares.
- rutas /tenant separadas de /me.
- PermissionGuard por endpoint.
- OwnResourceGuard para /me.
- roles no equivalen a permisos implícitos.
- validación server-side de reglas.
- tests de autorización.
- no exposición de endpoints administrativos por accidente.
```

---

## 7. Autenticación

Todos los endpoints del módulo requieren autenticación.

```http id="ixawim"
Authorization: Bearer <access_token>
```

Reglas:

```text id="gqf9mb"
- Keycloak autentica.
- RESIDENT Core resuelve UserProfile.
- RESIDENT Core resuelve tenant context.
- RESIDENT Core resuelve membresía.
- Maintenance Work Orders valida permisos y reglas operativas.
```

Prohibido:

```text id="mkr0t3"
- endpoints anónimos;
- API key pública;
- acceso por slug público;
- acceso administrativo sin tenant context;
- autenticación delegada a WordPress;
- confiar en userId enviado por cliente.
```

---

## 8. Autorización

### 8.1. Principio

```text id="ddwbit"
Todo endpoint debe validar autenticación, tenant context, permisos y reglas de recurso.
```

La autorización se compone de:

```text id="m8wv5s"
AuthGuard
+ TenantGuard
+ PermissionGuard
+ ResourcePolicy
+ StatePolicy
+ OwnResourceGuard si aplica
```

---

### 8.2. Permisos administrativos

El acceso administrativo requiere permisos explícitos:

```text id="h9foq2"
maintenanceCategories.*
maintenanceAssets.*
maintenanceRequests.*
maintenanceWorkOrders.*
maintenanceTasks.*
maintenanceVisits.*
maintenanceEvidence.*
maintenanceCosts.*
maintenanceSupplierLinks.*
maintenancePayableLinks.*
maintenanceComments.*
maintenanceReports.*
```

---

### 8.3. Permisos `/me`

El acceso propio requiere permisos limitados:

```text id="xqdxur"
maintenanceRequests.own.create
maintenanceRequests.own.read
maintenanceRequests.own.comment
maintenanceRequests.own.cancel
maintenanceEvidence.own.create
maintenanceEvidence.own.read
maintenanceEvidence.own.download
maintenanceComments.own.create
maintenanceComments.own.read
```

---

### 8.4. Residente

Un residente puede:

```text id="il4c7j"
- crear solicitudes propias;
- consultar solicitudes propias;
- adjuntar evidencia propia;
- comentar solicitudes propias;
- cancelar solicitud propia en estados permitidos;
- ver comentarios visibleToRequester;
- ver evidencias requesterVisible.
```

Un residente no puede:

```text id="bq0d26"
- consultar solicitudes de otros residentes;
- consultar todas las órdenes del tenant;
- aprobar solicitudes;
- crear órdenes;
- asignar técnicos;
- asignar proveedores;
- aprobar costos;
- convertir costos a payable;
- ver costos internos;
- ver comentarios internal;
- ver datos internos de proveedores;
- ver status history completa;
- ver auditoría completa;
- acceder a reportes administrativos.
```

---

### 8.5. PlatformAdmin

Regla:

```text id="rqwx0k"
PlatformAdmin no tiene acceso automático a solicitudes, órdenes, evidencias o costos de tenants.
```

Acceso excepcional requiere:

```text id="l5u700"
- tenant context explícito;
- permiso explícito;
- justificación;
- auditoría reforzada.
```

---

## 9. Multitenancy

### 9.1. Regla obligatoria

Toda entidad operativa debe incluir `tenant_id`.

```text id="jtr8mv"
maintenance_categories.tenant_id
maintenance_assets.tenant_id
maintenance_requests.tenant_id
maintenance_work_orders.tenant_id
maintenance_evidence.tenant_id
maintenance_cost_estimates.tenant_id
maintenance_comments.tenant_id
```

---

### 9.2. Patrón seguro de consulta

Obligatorio:

```typescript id="w8urux"
await prisma.maintenanceWorkOrder.findFirst({
  where: {
    id: workOrderId,
    tenantId: currentTenant.id,
    archivedAt: null
  }
});
```

Prohibido:

```typescript id="u6mzqa"
await prisma.maintenanceWorkOrder.findUnique({
  where: {
    id: workOrderId
  }
});
```

---

### 9.3. Cross-tenant behavior

Si un recurso existe pero pertenece a otro tenant:

```http id="vwk3th"
404 Not Found
```

No usar `403 Forbidden` para recursos cross-tenant, porque puede revelar existencia.

---

### 9.4. Referencias externas tenant-scoped

Se debe validar tenant en:

```text id="taatxk"
categoryId
assetId
propertyUnitId
commonAreaId
maintenanceRequestId
workOrderId
taskId
visitId
secureDocumentId
supplierId
supplierPayableId
assignedInternalUserId
reportedByPersonId
duplicateOfRequestId
acceptedAsWorkOrderId
```

---

## 10. Seguridad `/me`

### 10.1. Regla de acceso propio

La API `/me` solo puede acceder a solicitudes propias.

Validación mínima:

```text id="f35yd5"
currentTenant.id
+
currentUserProfile.id
+
reportedByUserId
```

Validación extendida:

```text id="p6xycw"
UserProfile
  -> Person
  -> PropertyUnit
  -> active relationship
```

---

### 10.2. Filtro `/me`

Toda consulta `/me` debe incluir:

```typescript id="v4018k"
where: {
  tenantId: currentTenant.id,
  reportedByUserId: currentUserProfile.id,
  archivedAt: null
}
```

Si se permite acceso por unidad:

```text id="tejyip"
propertyUnitId IN unidades vinculadas al usuario autenticado
```

---

### 10.3. DTO propio

El DTO `/me` debe excluir:

```text id="cz9k6n"
estimatedCostAmount
approvedCostAmount
actualCostAmount
supplierId
supplierPayableId
MaintenanceSupplierLink
MaintenancePayableLink
internal comments
internal evidence
audit metadata
admin metadata
status history completa
```

---

### 10.4. Evidencia `/me`

El usuario `/me` solo puede ver evidencia:

```text id="kfsevn"
visibility = requesterVisible
```

No puede ver:

```text id="td6pgs"
internal
boardVisible salvo política futura explícita
```

---

### 10.5. Comentarios `/me`

El usuario `/me` solo puede ver comentarios:

```text id="vcvi0c"
visibility = visibleToRequester
```

No puede ver:

```text id="ed8eai"
internal
visibleToBoard
system interno sensible
```

---

## 11. Seguridad de estados

### 11.1. Estado no editable directamente

Prohibido en `PATCH`:

```text id="ycj580"
status
costApprovalStatus
```

Los estados solo cambian por endpoints explícitos:

```text id="do3yfm"
/review
/accept
/reject
/cancel
/convert-to-work-order
/assign
/schedule
/start
/pause
/complete
/close
/reopen
/submit
/approve
/convert-to-payable
/archive
```

---

### 11.2. Transiciones auditadas

Toda transición crítica debe:

```text id="fruk6f"
- validar estado origen;
- validar estado destino;
- validar permiso;
- validar tenant;
- validar reason si aplica;
- registrar MaintenanceStatusHistory;
- registrar audit;
- emitir evento si corresponde.
```

---

### 11.3. Reglas críticas

```text id="aefick"
- reject requiere reason.
- cancel requiere reason.
- reopen requiere reason.
- close requiere completionSummary.
- close requiere evidencia válida o closureReason controlada.
- convertedToWorkOrder requiere workOrderId.
- convertedToPayable requiere SupplierPayable controlado.
```

---

## 12. Seguridad documental

### 12.1. Regla SDS

Todo archivo debe pasar por `016-secure-document-storage`.

Permitido:

```text id="r9t1nd"
secureDocumentId
downloadAvailable
secureDocumentFileId en exportaciones si aplica
```

Prohibido:

```text id="s1kj0e"
storageKey
signedUrl persistente
base64
raw file payload
binary in JSON
file bytes in logs
file bytes in audit
```

---

### 12.2. Validación de documento

Cada `secureDocumentId` debe validarse contra:

```text id="z4ncq8"
tenantId
sourceModule compatible
visibility compatible
sensitivity compatible
status activo
```

---

### 12.3. Metadata recomendada SDS

```text id="fi1urq"
sourceModule = maintenanceWorkOrders
sourceResourceType = maintenanceRequestAttachment | maintenanceEvidence | maintenanceReportExport
sourceResourceId = UUID
visibility = administrative | requesterVisible
sensitivity = internal | restricted
```

---

### 12.4. Descargas

Toda descarga o disponibilidad de descarga debe:

```text id="m37usd"
- validar tenant;
- validar permiso;
- validar visibility;
- auditar maintenanceEvidence.downloaded si aplica;
- no exponer storageKey;
- no exponer signedUrl persistente.
```

---

## 13. Seguridad de comentarios

### 13.1. Visibilidades

```text id="yk6z24"
internal
visibleToRequester
visibleToBoard
system
```

---

### 13.2. Reglas

```text id="spcxki"
- internal solo administración autorizada.
- visibleToRequester visible para solicitante propio.
- visibleToBoard requiere permiso administrativo/directivo.
- system solo se crea server-side.
- ningún comentario debe aceptar HTML/script sin sanitización.
- comentarios sensibles no deben loggearse completos.
```

---

### 13.3. XSS e inyección de contenido

Los campos de texto deben sanitizar:

```text id="lvyz3m"
title
description
commentBody
reason
completionSummary
notes
metadata textual
```

Controles:

```text id="pkiaix"
- trim;
- longitud máxima;
- escape o sanitización HTML;
- rechazo de script tags;
- rechazo de payloads peligrosos;
- render seguro en frontend.
```

---

## 14. Seguridad de costos

### 14.1. Decimal obligatorio

Todos los montos se manejan como Decimal.

En API:

```json id="del1e4"
{
  "estimatedAmount": "120.00",
  "currency": "USD"
}
```

Prohibido:

```json id="qg3hwj"
{
  "estimatedAmount": 120.0
}
```

---

### 14.2. Reglas de costo

```text id="n0ptuz"
- estimatedAmount >= 0.
- approvedAmount >= 0.
- actualAmount >= 0.
- currency = USD en MVP.
- approvedAmount solo endpoint approve.
- actualAmount solo usuario autorizado.
- supplierPayableId solo endpoint convert-to-payable.
- costos no crean pagos.
- costos no crean asientos contables.
```

---

### 14.3. Campos prohibidos en costos

```text id="gbf41x"
tenantId
approvedBy
rejectedBy
cancelledBy
status directo
supplierPayableId fuera de convert-to-payable
paymentOrderId
journalEntryId
bankTransactionId
reconciliationMatchId
```

---

## 15. Límites con Supplier Payments

### 15.1. Integración permitida

Único flujo permitido:

```text id="irlgc1"
MaintenanceCostEstimate approved
  -> convert-to-payable
  -> SupplierPayable draft/controlado
  -> MaintenancePayableLink active
```

---

### 15.2. Condiciones

Para convertir costo a payable:

```text id="dq74jh"
- workOrder tenant-scoped;
- costEstimate tenant-scoped;
- costEstimate status approved;
- supplierId requerido;
- supplier active;
- supplier no blocked;
- no existe MaintenancePayableLink active previo;
- usuario tiene maintenanceCosts.convertToPayable;
- Supplier Payments está habilitado;
- secureDocumentId tenant-scoped si se envía.
```

---

### 15.3. Prohibiciones

Maintenance Work Orders no puede:

```text id="pkyrqh"
- crear Payment;
- crear PaymentAllocation;
- crear SupplierPaymentOrder;
- marcar SupplierPaymentOrder como paid;
- iniciar transferencia bancaria;
- iniciar Open Banking payment;
- modificar cuenta bancaria de proveedor;
- modificar estado del payable fuera del contrato;
- modificar conciliación bancaria;
- crear JournalEntry.
```

---

## 16. Límites con Accounting Ledger

Regla:

```text id="xa4q81"
Maintenance Work Orders no tiene autoridad contable.
```

Prohibido:

```text id="zm1igu"
- crear JournalEntry;
- editar JournalEntry;
- publicar asiento contable;
- revertir asiento contable;
- modificar JournalEntryLine;
- afectar balances contables;
- afectar accounting periods;
- modificar reportes contables.
```

Cualquier impacto financiero debe pasar por:

```text id="x07lir"
Supplier Payments
  -> Accounting Ledger
```

---

## 17. Límites con Bank Reconciliation y Open Banking

Maintenance Work Orders no debe interactuar directamente con conciliación bancaria.

Prohibido:

```text id="o767z4"
- crear BankTransaction;
- modificar BankTransaction;
- crear ReconciliationMatch;
- confirmar match bancario;
- cerrar ReconciliationSession;
- marcar transacción como matched;
- iniciar pagos Open Banking;
- usar credenciales bancarias;
- procesar tokens bancarios.
```

---

## 18. WordPress y endpoints públicos

### 18.1. Regla

```text id="mye2nl"
WordPress público no consume Maintenance Work Orders.
```

---

### 18.2. Endpoints prohibidos

No crear:

```text id="w3j7rb"
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

```http id="h2cqxz"
404 Not Found
```

---

### 18.3. CORS

No habilitar CORS público para:

```text id="n7y5pm"
/api/v1/tenant/maintenance-*
/api/v1/me/maintenance-*
```

Permitido únicamente:

```text id="tj6po3"
- frontend administrativo autenticado;
- portal autenticado de residentes si pertenece a RESIDENT Core;
- orígenes explícitos configurados;
- nunca wildcard.
```

---

## 19. Protección contra mass assignment

### 19.1. Campos prohibidos en todos los DTOs

```text id="yjfgnf"
tenantId
createdBy
updatedBy
reportedByUserId
reportedByPersonId
assignedBy
approvedBy
rejectedBy
closedBy
reopenedBy
archivedBy
status
costApprovalStatus
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

### 19.2. Configuración NestJS

Obligatorio:

```typescript id="he6d10"
new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true
});
```

---

## 20. Seguridad de reportes y exportaciones

### 20.1. Reportes

Todo reporte debe:

```text id="m8mg0v"
- filtrar por tenant;
- validar permisos;
- validar filtros por ID;
- no mezclar datos cross-tenant;
- no exponer datos internos a roles no autorizados;
- exponer montos como string decimal;
- auditar generación si el reporte es sensible.
```

---

### 20.2. Exportaciones

Toda exportación debe:

```text id="v6bi9y"
- generarse vía Secure Document Storage;
- devolver secureDocumentId;
- no devolver storageKey;
- no devolver signedUrl persistente;
- auditar maintenanceReport.exported;
- respetar permisos y tenant;
- aplicar límites de tamaño y rate limit.
```

---

## 21. Rate limiting

Aplicar rate limit reforzado en:

```text id="dlkxoa"
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

Objetivo:

```text id="xi9vep"
- prevenir spam de solicitudes;
- prevenir abuso de comentarios;
- prevenir abuso de evidencia;
- prevenir generación excesiva de exportaciones;
- proteger operaciones críticas.
```

---

## 22. Auditoría

### 22.1. Eventos obligatorios

```text id="fk538d"
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

---

### 22.2. Metadata permitida

```text id="edx7x5"
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

### 22.3. Metadata prohibida

```text id="gklkvz"
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
datos bancarios
raw supplier payload
raw payment payload
```

---

## 23. Logging seguro

### 23.1. Logs permitidos

```text id="kjn19q"
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

---

### 23.2. Campos permitidos en logs

```text id="g6mvx6"
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

---

### 23.3. Campos prohibidos en logs

```text id="t6bkva"
storageKey
signedUrl
base64
raw payload
raw file payload
comentarios internos completos
fotos
documentos
tokens
secrets
passwords
SQL raw
stack trace productivo
datos personales innecesarios
```

---

## 24. Métricas seguras

### 24.1. Métricas permitidas

```text id="aovbxv"
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

---

### 24.2. Labels permitidos

```text id="d2ji64"
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

### 24.3. Labels prohibidos

```text id="eeetj5"
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

## 25. OpenAPI security

### 25.1. Extensiones obligatorias

Rutas tenant:

```yaml id="t5p08g"
x-tenant-scope: true
x-auth-required: true
x-maintenance-work-orders: true
x-public-exposure: false
```

Rutas `/me`:

```yaml id="xgukxw"
x-own-resource: true
x-internal-fields-excluded: true
x-costs-exposed: false
x-internal-comments-exposed: false
```

Rutas con documentos:

```yaml id="ndwzsg"
x-secure-document-storage: true
x-storage-key-exposed: false
```

Rutas con costos:

```yaml id="hlyqqe"
x-decimal-money: true
x-payment-creation: false
x-bank-transfer-initiation: false
x-direct-accounting: false
```

Rutas con Supplier Payments:

```yaml id="wpkr48"
x-supplier-payments-linked: true
x-supplier-payment-order-created: false
x-supplier-payment-mark-paid: false
```

Restricciones globales:

```yaml id="jwn6zc"
x-public-endpoint: false
x-wordpress-access: false
x-open-banking-payment-initiation: false
x-external-ai-real-data: false
```

---

### 25.2. OpenAPI no debe documentar

```text id="xwbmsb"
storageKey
signedUrl persistente
base64
paymentOrderId en Maintenance
journalEntryId en Maintenance
bankTransactionId en Maintenance
reconciliationMatchId en Maintenance
externalAiEnabled
endpoints públicos maintenance
```

---

## 26. Seguridad de errores

### 26.1. Formato estándar

```json id="r435xw"
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

### 26.2. Reglas

```text id="hg9qcw"
- No exponer stack trace productivo.
- No revelar si un recurso existe en otro tenant.
- Cross-tenant debe responder 404.
- Mensajes deben ser claros pero no revelar datos internos.
- details debe sanitizarse.
- traceId permitido.
```

---

## 27. Seguridad de notificaciones

Las notificaciones de mantenimiento no deben incluir:

```text id="sfhtdf"
storageKey
signedUrl
costos internos
comentarios internal
datos internos de proveedor
datos de otros residentes
adjuntos completos
metadata administrativa sensible
```

Eventos notificables permitidos:

```text id="v7evnn"
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

Si falla Notifications:

```text id="bjtmfn"
- no revertir solicitud u orden por defecto;
- registrar warning sanitizado;
- auditar si corresponde;
- reintentar por outbox futuro si se implementa.
```

---

## 28. Seguridad frente a IA externa

### 28.1. Regla

```text id="q31uly"
Maintenance Work Orders no debe enviar datos reales a IA externa en MVP.
```

Prohibido enviar a IA:

```text id="s2a1h0"
- fotos reales;
- informes técnicos reales;
- solicitudes reales;
- comentarios reales;
- nombres de residentes;
- unidades habitacionales;
- documentos reales;
- evidencias reales;
- costos reales;
- proveedores reales;
- exports reales;
- audit logs;
- metadata sensible.
```

---

### 28.2. Feature flag

Debe permanecer:

```text id="vy3n5b"
MAINTENANCE_EXTERNAL_AI_ENABLED=false
```

Si se habilita en el futuro requiere:

```text id="jwd2sh"
- ADR específico;
- anonimización;
- evaluación legal;
- evaluación de privacidad;
- DPIA si aplica;
- consentimiento o base legal;
- pruebas de no fuga;
- contratos/proveedor IA aprobado.
```

---

## 29. Cabeceras HTTP

Todas las respuestas deben incluir:

```http id="x0cein"
Cache-Control: no-store
Pragma: no-cache
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
```

Recomendado:

```http id="leqevb"
Content-Security-Policy: default-src 'self'
```

La política CSP final puede definirse a nivel frontend/gateway.

---

## 30. Validaciones de entrada

### 30.1. Texto

Validar:

```text id="c9bdmj"
title
description
commentBody
reason
completionSummary
notes
archiveReason
rejectReason
cancelReason
```

Controles:

```text id="lo9ri6"
- requerido según caso;
- longitud máxima;
- trim;
- sanitización HTML;
- rechazo de script;
- rechazo de payloads excesivos;
- no SQL raw;
- no JSON arbitrario no validado.
```

---

### 30.2. UUIDs

Validar formato UUID en:

```text id="zqrhrw"
categoryId
assetId
requestId
workOrderId
taskId
visitId
evidenceId
costEstimateId
supplierId
supplierPayableId
secureDocumentId
propertyUnitId
commonAreaId
assignedUserId
```

Luego validar tenant ownership.

---

### 30.3. Fechas

Validar:

```text id="pdnuq0"
scheduledStartAt <= scheduledEndAt
actualStartAt <= actualEndAt
closedAt server-side
reopenedAt server-side
approvedAt server-side
submittedAt server-side
```

---

### 30.4. Montos

Validar:

```text id="ml13zd"
- string decimal;
- no number;
- no negativo;
- máximo Decimal(12,2);
- moneda USD;
- no NaN;
- no Infinity;
- no notación científica si la política lo prohíbe.
```

---

## 31. Seguridad de concurrencia

Operaciones críticas deben ser transaccionales:

```text id="ltroao"
- convertir request a work order;
- cerrar work order;
- reabrir work order;
- aprobar costo;
- convertir costo a payable;
- crear taskNumber;
- crear requestNumber;
- crear workOrderNumber;
- crear payable link.
```

Riesgos:

```text id="rw19jw"
- doble conversión de request;
- doble cierre de orden;
- doble aprobación de costo;
- doble conversión a payable;
- taskNumber duplicado;
- requestNumber duplicado;
- workOrderNumber duplicado.
```

Controles:

```text id="bhmvau"
- transacciones DB;
- locks optimistas o pesimistas donde aplique;
- índices únicos;
- validación de estado dentro de la transacción;
- idempotency-key para operaciones sensibles si se implementa.
```

---

## 32. Seguridad de retención y archivo

### 32.1. Archivo lógico

Usar:

```text id="au3r7b"
archivedAt
archivedBy
archiveReason
```

---

### 32.2. Reglas

```text id="a9c5ux"
- archived no se lista por defecto.
- archived conserva historial.
- archived no permite operaciones nuevas.
- evidencia archived no elimina documento físico.
- costos archived no borran trazabilidad.
- links archived no eliminan payable real.
- eliminación física no forma parte del MVP.
```

---

## 33. Privacidad y minimización

Principios:

```text id="p4hl5r"
- almacenar solo datos necesarios;
- no copiar información personal innecesaria en comments;
- no incluir fotos o documentos en logs;
- no incluir datos privados en notificaciones;
- usar IDs internos y referencias seguras;
- separar DTO admin y DTO /me;
- limitar board visibility;
- limitar reportes según permisos.
```

---

## 34. Checklist de seguridad por endpoint

### 34.1. Categorías

```text id="g25gp4"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard.
[ ] tenantId server-side.
[ ] No status directo por PATCH.
[ ] Audit create/update/archive.
[ ] Código único por tenant.
```

---

### 34.2. Activos

```text id="ixtpz4"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard.
[ ] Validar propertyUnitId tenant-scoped.
[ ] Validar commonAreaId tenant-scoped.
[ ] Validar parentAssetId tenant-scoped.
[ ] No cross-tenant.
[ ] Audit create/update/archive.
```

---

### 34.3. Solicitudes admin

```text id="ndszay"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard.
[ ] requestNumber server-side.
[ ] reportedByUserId server-side.
[ ] No tenantId body.
[ ] No status directo.
[ ] Validar category/asset/unit/commonArea tenant-scoped.
[ ] Reason obligatorio para reject/cancel.
[ ] Status history.
[ ] Audit.
[ ] Notifications sanitizadas.
```

---

### 34.4. Solicitudes `/me`

```text id="rkilw0"
[ ] AuthGuard.
[ ] OwnResourceGuard.
[ ] Validar relación UserProfile -> Person -> Unit.
[ ] No solicitud sobre unidad ajena.
[ ] No lectura de solicitud ajena.
[ ] No costos.
[ ] No comentarios internal.
[ ] No evidence internal.
[ ] No supplierPayableId.
[ ] No audit metadata.
[ ] No storageKey.
```

---

### 34.5. Work Orders

```text id="k8q2c1"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard.
[ ] workOrderNumber server-side.
[ ] No status directo.
[ ] Validar request/category/asset/unit/commonArea tenant-scoped.
[ ] Validar assignedUser membership.
[ ] Validar supplier active.
[ ] Rechazar supplier blocked.
[ ] Close requiere completionSummary.
[ ] Close requiere evidencia o closureReason.
[ ] Reopen requiere reason.
[ ] Cancel requiere reason.
[ ] No Payment.
[ ] No SupplierPaymentOrder.
[ ] No JournalEntry.
[ ] Audit.
```

---

### 34.6. Evidencias

```text id="b2i5ht"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard u OwnResourceGuard.
[ ] Validar secureDocumentId tenant-scoped.
[ ] Validar taskId/visitId dentro de workOrder.
[ ] No storageKey.
[ ] No signedUrl persistente.
[ ] No base64.
[ ] No raw file payload.
[ ] Visibility control.
[ ] Audit upload/verify/reject/download/archive.
```

---

### 34.7. Costos

```text id="sul6gp"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard.
[ ] Decimal string.
[ ] No number/float.
[ ] No monto negativo.
[ ] USD only MVP.
[ ] Rechazar supplierPayableId fuera de convert-to-payable.
[ ] Rechazar paymentOrderId.
[ ] Rechazar journalEntryId.
[ ] Approve solo con permiso.
[ ] Convert-to-payable solo con permiso.
[ ] No Payment.
[ ] No SupplierPaymentOrder.
[ ] No JournalEntry.
[ ] Audit.
```

---

### 34.8. Reportes/exportaciones

```text id="pxcw5w"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard.
[ ] Filtros tenant-scoped.
[ ] Montos string decimal.
[ ] No datos cross-tenant.
[ ] Export vía SDS.
[ ] No storageKey.
[ ] Rate limit.
[ ] Audit.
```

---

## 35. Pruebas de seguridad obligatorias

El módulo debe tener pruebas para:

```text id="vnfvdh"
- tenant isolation;
- /me own access;
- forbidden fields;
- no storageKey exposure;
- no internal comments in /me;
- no costs in /me;
- no supplierPayableId in /me;
- no public endpoints;
- no WordPress CORS;
- no direct Payment;
- no direct SupplierPaymentOrder;
- no direct JournalEntry;
- no bank transfer initiation;
- no Open Banking payment initiation;
- no external AI;
- audit sanitizer;
- log sanitizer;
- metrics labels safe;
- OpenAPI security extensions.
```

---

## 36. CI security gates

El pipeline debe fallar si:

```text id="cu82sd"
- algún DTO acepta tenantId;
- algún DTO acepta actor fields;
- algún DTO acepta status directo fuera de transición;
- algún DTO acepta storageKey;
- algún DTO acepta signedUrl;
- algún DTO acepta base64;
- algún DTO acepta journalEntryId;
- algún DTO acepta paymentOrderId;
- /me expone internal comments;
- /me expone costos internos;
- /me expone supplierPayableId;
- /me permite solicitud sobre unidad ajena;
- API permite request cross-tenant;
- API permite workOrder cross-tenant;
- API permite evidence cross-tenant;
- API permite cost cross-tenant;
- API permite supplier cross-tenant;
- API crea Payment;
- API crea SupplierPaymentOrder;
- API crea JournalEntry;
- API inicia transferencia bancaria;
- API documenta endpoint público;
- API expone storageKey;
- logs contienen storageKey;
- audit contiene storageKey;
- MAINTENANCE_EXTERNAL_AI_ENABLED=true;
- MAINTENANCE_PUBLIC_ENDPOINTS_ENABLED=true;
- MAINTENANCE_WORDPRESS_ACCESS_ENABLED=true;
- MAINTENANCE_DIRECT_PAYMENTS_ENABLED=true;
- MAINTENANCE_DIRECT_ACCOUNTING_ENABLED=true.
```

---

## 37. Riesgos residuales

| Riesgo                                             |      Nivel | Mitigación                                         |
| -------------------------------------------------- | ---------: | -------------------------------------------------- |
| Residente sube evidencia sensible accidentalmente  |      Medio | SDS, visibility, permisos, políticas de privacidad |
| Comentarios incluyen datos personales innecesarios |      Medio | Sanitización, minimización, guías UI               |
| Administrador clasifica mal una evidencia          |      Medio | audit, verification status, corrección controlada  |
| Costos usados como pago informal                   |       Alto | Supplier Payments boundary, no Payment, tests      |
| Proveedor bloqueado asignado por error             |       Alto | validateSupplier, tests, PermissionGuard           |
| Reportes filtrados incorrectamente                 |       Alto | tenant-scoped queries, tests                       |
| Exportaciones con datos excesivos                  | Medio/Alto | permisos, filtros, SDS, audit                      |
| Cierre sin evidencia suficiente                    |      Medio | closure policy                                     |
| Cross-tenant por bug de repositorio                |       Alto | repository tests, CI gates                         |
| Exposición desde WordPress                         |       Alto | no public endpoints, CORS restrictivo              |
| Uso futuro de IA con datos reales                  |       Alto | feature flag false, ADR obligatorio                |

---

## 38. No aceptación de seguridad

El módulo no debe aceptarse si:

```text id="ki66ag"
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
- logs contienen datos prohibidos;
- audit contiene datos prohibidos.
```

---

## 39. Resultado esperado

Al aplicar estas notas de seguridad, el módulo `022-maintenance-work-orders` queda protegido contra exposición de datos operativos, acceso cross-tenant, abuso de `/me`, manipulación de estados, manipulación de costos, exposición documental, acoplamiento financiero indebido y acceso público no autorizado.

Resultado esperado:

```text id="ppscdv"
tenant isolation protegido
/me own access protegido
resident privacy protegida
internal comments protegidos
costs protegidos
supplier data protegido
evidence via SDS protegida
storageKey no expuesto
signedUrl persistente no expuesto
Decimal money protegido
state transitions protegidas
status history protegido
audit obligatorio
logs sanitizados
metrics seguras
reports tenant-scoped
exports vía SDS
Supplier Payments boundary protegido
no direct payments
no SupplierPaymentOrder directo
no direct accounting
no Bank Reconciliation directo
no Open Banking payment initiation
no public endpoints
no WordPress public access
no external AI with real data
CI security gates definidos
```

---

## 40. Expediente actualizado

```text id="cc2y5n"
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
│   │       ├── tasks.md
│   │       └── security-notes.md
```

---

## 41. Estado del paquete 022

Con este documento, el expediente del módulo queda completo:

```text id="sv72um"
docs/specs/022-maintenance-work-orders/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```
