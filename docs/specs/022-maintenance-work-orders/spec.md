# Spec — 022 Maintenance Work Orders

## 1. Información del documento

| Campo                 | Valor                                                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Proyecto              | RESIDENT Core                                                                                                                  |
| Spec ID               | 022                                                                                                                            |
| Módulo                | Maintenance Work Orders                                                                                                        |
| Documento             | Functional Specification                                                                                                       |
| Ruta                  | `docs/specs/022-maintenance-work-orders/spec.md`                                                                               |
| Versión               | 0.1                                                                                                                            |
| Estado                | Borrador inicial                                                                                                               |
| Fecha                 | 2026-07-23                                                                                                                     |
| Fase                  | FASE 2 — RESIDENT Core                                                                                                         |
| Arquitectura objetivo | Monolito modular preparado para microservicios                                                                                 |
| Stack objetivo        | NestJS / TypeScript / PostgreSQL / Prisma / OpenAPI / Keycloak                                                                 |
| Naturaleza            | Tenant-scoped / Operational / Request-driven / Work-order-driven / Evidence-backed / Supplier-aware / Cost-aware / Audit-heavy |

---

## 2. Propósito

El módulo `022-maintenance-work-orders` permite gestionar solicitudes de mantenimiento, incidencias, inspecciones, órdenes de trabajo, asignaciones, tareas, visitas técnicas, evidencias, costos estimados, aprobaciones operativas, cierres y reportes relacionados con el mantenimiento de bienes, áreas comunales, infraestructura y unidades habitacionales dentro de cada conjunto residencial.

Este módulo cubre el ciclo operativo desde que un residente, propietario, administrador o usuario autorizado reporta una novedad hasta que la administración evalúa, planifica, asigna, ejecuta, documenta, cierra y audita la atención.

Regla central:

```text id="jm9y7z"
Toda solicitud de mantenimiento, orden de trabajo, asignación, tarea, visita, evidencia, costo, aprobación, comentario, cambio de estado y reporte debe pertenecer a un tenant, estar vinculado a un recurso mantenible o ubicación válida, respetar permisos, proteger datos personales, conservar trazabilidad, usar documentos seguros, no crear pagos directamente, no iniciar transferencias, no editar contabilidad, no exponer datos operativos en endpoints públicos y no permitir acceso directo desde WordPress público.
```

---

## 3. Contexto dentro de RESIDENT Core

`Maintenance Work Orders` pertenece al bounded context operativo de administración del conjunto.

Relación conceptual:

```text id="vc0fvl"
Residents / Properties
  └── reportan solicitudes de mantenimiento

Maintenance Work Orders
  ├── clasifica solicitudes
  ├── evalúa prioridad
  ├── crea órdenes de trabajo
  ├── asigna responsables
  ├── registra tareas
  ├── registra visitas
  ├── adjunta evidencias
  ├── estima costos
  ├── aprueba trabajos
  └── cierra casos

Supplier Payments
  └── gestiona obligaciones por pagar derivadas de trabajos aprobados

Secure Document Storage
  └── almacena fotografías, informes, cotizaciones, actas y evidencias

Communications / Notifications
  └── notifica cambios relevantes

Audit
  └── registra trazabilidad de operaciones críticas
```

---

## 4. Problema que resuelve

Sin un módulo formal de mantenimiento, la administración del conjunto tiende a gestionar incidentes por WhatsApp, hojas de cálculo, mensajes informales o registros dispersos.

Esto produce problemas como:

```text id="vj5j5s"
- solicitudes duplicadas;
- pérdida de evidencia;
- falta de seguimiento;
- ausencia de responsables claros;
- reclamos sin trazabilidad;
- trabajos cerrados sin comprobación;
- costos no aprobados formalmente;
- proveedores asignados sin control;
- dificultad para priorizar urgencias;
- falta de indicadores de mantenimiento;
- imposibilidad de auditar decisiones;
- conflictos entre residentes y administración;
- pagos a proveedores sin vínculo operativo.
```

Este módulo centraliza el flujo operativo de mantenimiento y lo conecta con los módulos financieros y documentales sin reemplazarlos.

---

## 5. Objetivos funcionales

El módulo debe permitir:

```text id="y0pmcg"
1. Configurar categorías de mantenimiento.
2. Configurar activos, áreas, equipos o ubicaciones mantenibles.
3. Permitir que residentes/propietarios creen solicitudes propias.
4. Permitir que administración cree solicitudes internas.
5. Clasificar solicitudes por tipo, prioridad, severidad y ubicación.
6. Adjuntar evidencia inicial mediante Secure Document Storage.
7. Evitar solicitudes duplicadas cuando aplique.
8. Evaluar y aceptar/rechazar solicitudes.
9. Convertir solicitudes aceptadas en órdenes de trabajo.
10. Crear órdenes de trabajo internas o externas.
11. Asignar responsables internos.
12. Vincular proveedores si el trabajo requiere tercero externo.
13. Registrar tareas de trabajo.
14. Registrar visitas técnicas.
15. Registrar avances.
16. Adjuntar evidencias antes/durante/después.
17. Registrar costos estimados.
18. Registrar costos aprobados.
19. Registrar costos reales referenciales.
20. Solicitar aprobación administrativa para costos.
21. Cerrar órdenes de trabajo con evidencia.
22. Reabrir órdenes cerradas bajo condiciones controladas.
23. Generar reportes operativos.
24. Integrarse con Supplier Payments cuando exista obligación por pagar.
25. Integrarse con Communications para notificaciones.
26. Mantener auditoría completa.
```

---

## 6. Principios de diseño

### 6.1. Tenant isolation obligatorio

Toda entidad del módulo debe pertenecer a un tenant.

```text id="h6dvka"
maintenance tenant A != maintenance tenant B
```

Ninguna consulta debe recuperar datos de otro conjunto.

---

### 6.2. Solicitud no equivale a orden de trabajo

Una solicitud representa un reporte o necesidad.

Una orden de trabajo representa una decisión operativa de atender, planificar y ejecutar.

```text id="zo8v58"
MaintenanceRequest
  -> puede convertirse en
MaintenanceWorkOrder
```

No toda solicitud genera orden de trabajo.

---

### 6.3. Orden de trabajo no equivale a pago

Una orden de trabajo puede tener costos y proveedor asociado, pero no paga al proveedor.

```text id="x1aowj"
MaintenanceWorkOrder
  -> puede generar solicitud/candidato de payable
Supplier Payments
  -> gobierna obligación por pagar y pago
```

---

### 6.4. Evidencia obligatoria para cierres críticos

Una orden cerrada debe conservar evidencia mínima:

```text id="d5qzpw"
- comentario de cierre;
- responsable;
- fecha de cierre;
- estado final;
- evidencia o justificación controlada.
```

---

### 6.5. No edición destructiva de historial

Cambios críticos deben registrarse mediante eventos, historial de estados o comentarios auditados.

No se debe borrar:

```text id="ss74mb"
- solicitud;
- orden;
- evidencia;
- asignación histórica;
- visita registrada;
- costo aprobado;
- cierre.
```

---

### 6.6. Cost-aware, no payment-authoritative

El módulo puede registrar costos operativos, estimaciones y aprobaciones, pero no es fuente de verdad de pagos.

```text id="udswql"
Maintenance cost approved != Supplier payment paid
```

---

### 6.7. Resident self-service controlado

Residentes y propietarios pueden crear y consultar solicitudes propias mediante endpoints `/me`, pero no pueden acceder a la operación interna completa.

---

### 6.8. WordPress público no accede al módulo

El portal WordPress público no debe consultar órdenes de trabajo, evidencias, costos ni reportes de mantenimiento.

---

## 7. Alcance MVP

Incluye:

```text id="f5vnid"
- categorías de mantenimiento;
- activos/ubicaciones mantenibles básicos;
- solicitudes de mantenimiento;
- solicitudes propias desde /me;
- adjuntos/evidencias mediante Secure Document Storage;
- evaluación administrativa de solicitudes;
- creación de órdenes de trabajo;
- asignación a responsable interno;
- vinculación opcional con proveedor;
- tareas de orden de trabajo;
- visitas técnicas;
- comentarios internos y visibles al solicitante;
- evidencias de avance y cierre;
- prioridad y severidad;
- costos estimados;
- costos aprobados;
- costos reales referenciales;
- aprobación básica de costos;
- cierre y reapertura controlada;
- reportes básicos;
- notificaciones básicas;
- auditoría;
- permisos;
- OpenAPI;
- tests de seguridad y multitenancy.
```

---

## 8. Fuera de alcance MVP

No incluye:

```text id="vvpu22"
- inventario avanzado de repuestos;
- órdenes de compra completas;
- recepción formal de bienes;
- gestión avanzada de contratos de mantenimiento;
- mantenimiento predictivo con IoT;
- programación preventiva avanzada;
- SLA contractual avanzado;
- geolocalización en tiempo real de técnicos;
- app móvil offline para técnicos;
- firma digital del residente;
- firma electrónica legal;
- cotización multi-proveedor avanzada;
- licitación o comparación formal de ofertas;
- generación automática de pagos;
- iniciación de transferencias bancarias;
- integración Open Banking payment initiation;
- facturación electrónica;
- integración SRI;
- contabilidad directa desde mantenimiento;
- depreciación de activos;
- gestión completa de activos fijos;
- publicación pública de órdenes;
- portal público de proveedores;
- IA externa con fotos o datos reales.
```

---

## 9. Actores

### 9.1. PlatformAdmin

Usuario de plataforma.

Puede administrar configuración global de la plataforma, pero no accede automáticamente a solicitudes u órdenes tenant.

Acceso excepcional requiere permiso explícito, contexto tenant y auditoría.

---

### 9.2. TenantAdmin

Administrador del conjunto.

Puede configurar categorías, activos, revisar solicitudes, crear órdenes, asignar responsables, aprobar costos y consultar reportes, según permisos.

---

### 9.3. MaintenanceManager

Responsable operativo de mantenimiento.

Puede evaluar solicitudes, crear órdenes, asignar tareas, registrar avances, programar visitas, revisar evidencias y cerrar órdenes según permisos.

---

### 9.4. FinancialManager

Responsable financiero.

Puede revisar costos, aprobar costos operativos y autorizar generación de solicitud/candidato de payable hacia Supplier Payments.

No ejecuta pagos desde este módulo.

---

### 9.5. Accountant

Puede consultar costos y vínculos con Supplier Payments si tiene permiso.

No modifica órdenes operativas salvo permisos explícitos.

---

### 9.6. BoardMember

Miembro de directiva.

Puede consultar reportes y casos relevantes si tiene permisos.

No opera solicitudes ni órdenes por defecto.

---

### 9.7. Resident

Residente asociado a una unidad.

Puede crear solicitudes propias, adjuntar evidencia, consultar estado de solicitudes propias y agregar comentarios permitidos.

No ve costos internos, proveedores internos ni reportes administrativos salvo política futura.

---

### 9.8. PropertyOwner

Propietario asociado a una unidad.

Puede crear y consultar solicitudes propias o de sus unidades, según política del tenant.

No ve información operativa interna completa.

---

### 9.9. InternalTechnician

Usuario interno o colaborador asignado.

Puede ver órdenes asignadas, registrar avances, tareas, visitas y evidencias, según permisos.

---

### 9.10. SupplierUser

Usuario externo de proveedor.

No forma parte del MVP.

En MVP, los proveedores se vinculan como entidades administrativas desde `021-supplier-payments`, pero no acceden al sistema.

---

### 9.11. System

Actor técnico.

Puede generar notificaciones, auditoría, eventos internos, indicadores y vínculos controlados.

---

## 10. Entidades principales

### 10.1. `MaintenanceCategory`

Categoría de mantenimiento.

Ejemplos:

```text id="c0q4a6"
plomería
electricidad
jardinería
seguridad física
limpieza
pintura
infraestructura
ascensores
bombas de agua
iluminación
áreas comunales
otros
```

Campos conceptuales:

```text id="d8qnj6"
id
tenantId
categoryCode
categoryName
description
defaultPriority
defaultSeverity
requiresApprovalByDefault
allowsResidentRequests
status
createdBy
updatedBy
archivedBy
createdAt
updatedAt
archivedAt
archiveReason
```

---

### 10.2. `MaintenanceAsset`

Representa un activo, área, equipo o ubicación mantenible.

Ejemplos:

```text id="e8uz8o"
cancha múltiple
parque infantil
garita
portón vehicular
portón peatonal
bomba de agua
cisterna
luminaria
cámara de seguridad
área BBQ
salón comunal
pasillo
jardín
unidad habitacional
```

Campos conceptuales:

```text id="xfuo66"
id
tenantId
assetCode
assetName
assetType
description
locationDescription
propertyUnitId
commonAreaId
parentAssetId
status
criticality
createdBy
updatedBy
archivedBy
createdAt
updatedAt
archivedAt
archiveReason
metadata
```

Reglas:

```text id="g74n6o"
- asset pertenece a tenant;
- asset puede vincularse a unidad habitacional;
- asset puede vincularse a área comunal;
- asset puede ser común o privado;
- archived no recibe nuevas órdenes.
```

---

### 10.3. `MaintenanceRequest`

Representa la solicitud, reporte o incidencia inicial.

Campos conceptuales:

```text id="cicffa"
id
tenantId
requestNumber
title
description
categoryId
assetId
propertyUnitId
commonAreaId
reportedByUserId
reportedByPersonId
requestSource
visibility
priority
severity
status
duplicateOfRequestId
acceptedAsWorkOrderId
rejectedReason
cancelReason
closedReason
createdAt
updatedAt
submittedAt
acceptedAt
rejectedAt
cancelledAt
closedAt
metadata
```

Fuentes posibles:

```text id="f6k0w6"
residentPortal
tenantAdmin
maintenanceManager
internalInspection
meetingResolution
communicationFollowUp
manual
system
```

Estados principales:

```text id="fy6b1b"
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

### 10.4. `MaintenanceRequestAttachment`

Vincula una solicitud con documentos o evidencias iniciales en Secure Document Storage.

Campos conceptuales:

```text id="wb3zgy"
id
tenantId
maintenanceRequestId
secureDocumentId
attachmentType
description
visibility
status
createdBy
archivedBy
createdAt
archivedAt
archiveReason
```

Tipos:

```text id="xw3wos"
photo
video
document
inspectionNote
other
```

---

### 10.5. `MaintenanceWorkOrder`

Representa una orden de trabajo creada para gestionar la atención.

Campos conceptuales:

```text id="eucmo1"
id
tenantId
workOrderNumber
maintenanceRequestId
title
description
categoryId
assetId
propertyUnitId
commonAreaId
workOrderType
executionMode
priority
severity
status
scheduledStartAt
scheduledEndAt
actualStartAt
actualEndAt
assignedInternalUserId
supplierId
estimatedCostAmount
approvedCostAmount
actualCostAmount
currency
requiresCostApproval
costApprovalStatus
completionSummary
closureEvidenceRequired
closedBy
closedAt
reopenedBy
reopenedAt
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

```text id="rm76xt"
corrective
preventiveBasic
inspection
improvement
emergency
followUp
other
```

Modos de ejecución:

```text id="wzc7a9"
internal
supplier
mixed
selfManaged
```

Estados:

```text id="nlm5jv"
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

### 10.6. `MaintenanceWorkOrderAssignment`

Registra asignaciones internas o externas.

Campos conceptuales:

```text id="jx08jp"
id
tenantId
workOrderId
assignmentType
assignedUserId
supplierId
assignedBy
assignedAt
acceptedAt
rejectedAt
completedAt
status
rejectReason
notes
metadata
```

Tipos:

```text id="kt7tcr"
internalUser
supplier
team
other
```

Estados:

```text id="xgwccc"
assigned
accepted
rejected
completed
cancelled
archived
```

---

### 10.7. `MaintenanceWorkOrderTask`

Tarea específica dentro de una orden.

Campos conceptuales:

```text id="bqu98s"
id
tenantId
workOrderId
taskNumber
title
description
status
priority
assignedUserId
dueAt
startedAt
completedAt
createdBy
updatedBy
createdAt
updatedAt
metadata
```

Estados:

```text id="s36z6v"
pending
inProgress
completed
blocked
cancelled
archived
```

---

### 10.8. `MaintenanceVisit`

Registro de visita técnica, inspección o ejecución en sitio.

Campos conceptuales:

```text id="ve3eum"
id
tenantId
workOrderId
visitType
scheduledAt
startedAt
endedAt
visitedByUserId
supplierId
residentPersonId
propertyUnitId
status
notes
accessResult
createdBy
updatedBy
createdAt
updatedAt
metadata
```

Tipos:

```text id="ugm8a4"
inspection
diagnosis
repair
verification
followUp
other
```

Resultados de acceso:

```text id="xqlzqn"
accessGranted
accessDenied
residentAbsent
notRequired
rescheduled
other
```

---

### 10.9. `MaintenanceEvidence`

Evidencia asociada a una orden, tarea, visita o cierre.

Campos conceptuales:

```text id="f23c26"
id
tenantId
workOrderId
taskId
visitId
secureDocumentId
evidenceType
evidenceStage
description
visibility
status
createdBy
verifiedBy
rejectedBy
archivedBy
createdAt
verifiedAt
rejectedAt
archivedAt
rejectReason
archiveReason
metadata
```

Tipos:

```text id="rxmhx3"
beforePhoto
duringPhoto
afterPhoto
technicalReport
residentConfirmation
supplierInvoice
supplierQuote
materialReceipt
other
```

Etapas:

```text id="yq0a4l"
request
diagnosis
execution
completion
closure
reopening
```

---

### 10.10. `MaintenanceCostEstimate`

Registro de costos estimados, aprobados y reales referenciales.

Campos conceptuales:

```text id="qurz1i"
id
tenantId
workOrderId
costType
description
estimatedAmount
approvedAmount
actualAmount
currency
supplierId
supplierPayableId
status
createdBy
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

```text id="tef637"
labor
materials
supplierService
transport
emergency
other
```

Estados:

```text id="mpbah9"
draft
submitted
approved
rejected
cancelled
convertedToPayable
archived
```

Regla:

```text id="qh62oz"
MaintenanceCostEstimate no representa un pago. Si se requiere pago, debe integrarse con Supplier Payments.
```

---

### 10.11. `MaintenanceCostApproval`

Aprobación de costos operativos.

Campos conceptuales:

```text id="r1cevd"
id
tenantId
workOrderId
costEstimateId
approvalStep
approvalStatus
requestedBy
approvedBy
rejectedBy
requestedAt
approvedAt
rejectedAt
reason
metadata
```

Estados:

```text id="z7laab"
pending
approved
rejected
cancelled
```

---

### 10.12. `MaintenanceSupplierLink`

Vínculo entre una orden de trabajo y proveedor del módulo Supplier Payments.

Campos conceptuales:

```text id="xy11zk"
id
tenantId
workOrderId
supplierId
linkType
status
linkedBy
linkedAt
unlinkedBy
unlinkedAt
unlinkReason
metadata
```

Tipos:

```text id="je39bj"
quoted
assigned
executed
invoiced
other
```

---

### 10.13. `MaintenancePayableLink`

Vínculo entre una orden/costo de mantenimiento y una obligación por pagar en Supplier Payments.

Campos conceptuales:

```text id="u5hm24"
id
tenantId
workOrderId
costEstimateId
supplierPayableId
status
createdBy
createdAt
archivedBy
archivedAt
archiveReason
metadata
```

Regla:

```text id="qd0qo4"
Maintenance Work Orders puede solicitar o vincular un payable, pero Supplier Payments gobierna su aprobación, saldo, orden de pago y pago final.
```

---

### 10.14. `MaintenanceComment`

Comentario operativo.

Campos conceptuales:

```text id="rqk49n"
id
tenantId
maintenanceRequestId
workOrderId
commentBody
visibility
createdBy
createdAt
updatedAt
archivedAt
metadata
```

Visibilidad:

```text id="uujzha"
internal
visibleToRequester
visibleToBoard
system
```

---

### 10.15. `MaintenanceStatusHistory`

Historial de estado para solicitudes y órdenes.

Campos conceptuales:

```text id="n4xgo7"
id
tenantId
entityType
entityId
fromStatus
toStatus
changedBy
changedAt
reason
metadata
```

Entidades:

```text id="p7untz"
maintenanceRequest
maintenanceWorkOrder
maintenanceTask
maintenanceVisit
maintenanceCostEstimate
```

---

## 11. Reglas de negocio

### 11.1. Reglas generales

```text id="ezpmhk"
BR-001: Toda entidad debe incluir tenantId.
BR-002: Ninguna entidad tenant-scoped puede consultarse solo por id.
BR-003: El cliente no puede enviar tenantId.
BR-004: El cliente no puede enviar actor fields.
BR-005: Todo cambio crítico debe auditarse.
BR-006: Todo documento debe almacenarse vía Secure Document Storage.
BR-007: Ningún response debe exponer storageKey.
BR-008: Ningún monto debe usar float/double.
BR-009: Ningún endpoint público debe exponer solicitudes, órdenes, evidencias o costos.
BR-010: WordPress público no debe consumir este módulo.
```

---

### 11.2. Solicitudes de mantenimiento

```text id="g8d4ps"
BR-011: Un residente solo puede crear solicitudes asociadas a sus unidades o a áreas comunales permitidas.
BR-012: Un residente solo puede consultar solicitudes propias.
BR-013: Un administrador puede crear solicitudes internas.
BR-014: Una solicitud submitted puede pasar a underReview.
BR-015: Una solicitud underReview puede ser accepted o rejected.
BR-016: Una solicitud accepted puede convertirse en work order.
BR-017: Una solicitud rejected requiere reason.
BR-018: Una solicitud cancelled requiere reason.
BR-019: Una solicitud convertedToWorkOrder no puede editarse destructivamente.
BR-020: Una solicitud puede ser marcada como duplicada de otra solicitud del mismo tenant.
```

---

### 11.3. Órdenes de trabajo

```text id="j4bpam"
BR-021: Una orden de trabajo puede crearse desde una solicitud aceptada.
BR-022: Una orden de trabajo puede crearse directamente por administración.
BR-023: Una orden debe tener categoría, título, prioridad y descripción mínima.
BR-024: Una orden puede estar asociada a asset, unidad, área comunal o ubicación textual.
BR-025: Una orden assigned debe tener responsable interno, proveedor o equipo.
BR-026: Una orden inProgress debe tener fecha de inicio o evento equivalente.
BR-027: Una orden completed debe tener resumen de finalización.
BR-028: Una orden closed debe tener cierre auditado.
BR-029: Una orden closed no puede editarse destructivamente.
BR-030: Una orden closed puede reabrirse solo con permiso y reason.
BR-031: Una orden cancelled requiere reason.
BR-032: Una orden archived conserva historial.
```

---

### 11.4. Evidencias

```text id="b1wkc4"
BR-033: Toda evidencia debe vincularse a Secure Document Storage.
BR-034: Toda evidencia debe pertenecer al tenant.
BR-035: La evidencia puede ser interna o visible al solicitante.
BR-036: Evidencia rejected no puede soportar cierre.
BR-037: Cierre crítico requiere evidencia o justificación controlada.
BR-038: Las descargas de evidencia deben auditarse.
BR-039: No se permite base64 de archivos en JSON.
BR-040: No se permite storageKey en requests ni responses.
```

---

### 11.5. Costos

```text id="sy47ox"
BR-041: Los costos deben usar Decimal.
BR-042: Los costos deben expresarse como string decimal en API.
BR-043: estimatedAmount no puede ser negativo.
BR-044: approvedAmount no puede exceder policy limit sin aprobación.
BR-045: actualAmount es referencial, no pago.
BR-046: CostEstimate approved puede vincularse a Supplier Payments.
BR-047: CostEstimate convertedToPayable no puede editarse destructivamente.
BR-048: CostEstimate rejected requiere reason.
BR-049: CostEstimate cancelled requiere reason.
BR-050: Mantenimiento no crea pagos.
```

---

### 11.6. Proveedores y Supplier Payments

```text id="hpmjnq"
BR-051: Una orden puede vincularse a supplier tenant-scoped.
BR-052: El supplier debe estar active para asignación nueva.
BR-053: El supplier blocked no puede recibir nueva asignación aprobada.
BR-054: Maintenance Work Orders no crea SupplierPaymentOrder.
BR-055: Maintenance Work Orders no marca SupplierPaymentOrder como paid.
BR-056: Maintenance Work Orders no inicia transferencia bancaria.
BR-057: Maintenance Work Orders puede solicitar creación de SupplierPayable solo mediante integración controlada.
BR-058: Supplier Payments mantiene autoridad sobre payable, aprobación de pago y pago.
```

---

### 11.7. Comunicaciones y notificaciones

```text id="ou0nwg"
BR-059: Cambios relevantes pueden emitir notificaciones.
BR-060: Notificaciones a residentes deben minimizar información interna.
BR-061: Comentarios internal no se muestran al solicitante.
BR-062: Comentarios visibleToRequester pueden mostrarse en /me.
BR-063: Notificaciones no deben incluir storageKey.
BR-064: Notificaciones no deben incluir costos internos salvo permiso/política.
```

---

### 11.8. Seguridad y privacidad

```text id="sqnknh"
BR-065: Resident no ve datos de otros residentes.
BR-066: Resident no ve costos internos por defecto.
BR-067: Resident no ve proveedor interno por defecto.
BR-068: Resident no ve comentarios internos.
BR-069: BoardMember solo ve reportes si tiene permiso.
BR-070: PlatformAdmin no accede automáticamente a órdenes tenant.
BR-071: Logs no deben incluir datos personales innecesarios.
BR-072: Audit no debe incluir documentos completos.
BR-073: No se permite IA externa con fotos, informes o solicitudes reales.
```

---

## 12. Estados

### 12.1. `MaintenanceRequestStatus`

```text id="eozify"
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

Transiciones permitidas:

```text id="enkguw"
draft -> submitted
submitted -> underReview
submitted -> cancelled
underReview -> accepted
underReview -> rejected
accepted -> convertedToWorkOrder
accepted -> closed
convertedToWorkOrder -> closed
rejected -> archived
cancelled -> archived
closed -> archived
```

---

### 12.2. `MaintenanceWorkOrderStatus`

```text id="s4cqem"
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

Transiciones base:

```text id="qajvyf"
draft -> open
open -> pendingAssignment
open -> assigned
pendingAssignment -> assigned
assigned -> scheduled
assigned -> inProgress
scheduled -> inProgress
inProgress -> onHold
onHold -> inProgress
inProgress -> pendingCostApproval
pendingCostApproval -> inProgress
inProgress -> completed
completed -> pendingResidentConfirmation
pendingResidentConfirmation -> closed
completed -> closed
closed -> reopened
reopened -> inProgress
open -> cancelled
assigned -> cancelled
scheduled -> cancelled
inProgress -> cancelled
cancelled -> archived
closed -> archived
```

---

### 12.3. `MaintenanceTaskStatus`

```text id="kp5g0c"
pending
inProgress
completed
blocked
cancelled
archived
```

---

### 12.4. `MaintenanceVisitStatus`

```text id="hw5n0w"
scheduled
inProgress
completed
missed
cancelled
rescheduled
archived
```

---

### 12.5. `MaintenanceCostEstimateStatus`

```text id="ma3pj5"
draft
submitted
approved
rejected
cancelled
convertedToPayable
archived
```

---

## 13. Prioridad y severidad

### 13.1. Prioridad

```text id="e0s6tb"
low
normal
high
urgent
emergency
```

Uso:

```text id="lgb35m"
priority indica orden operativo de atención.
```

---

### 13.2. Severidad

```text id="ni861m"
minor
moderate
major
critical
safetyRisk
```

Uso:

```text id="ebpgl5"
severity indica impacto o riesgo.
```

---

### 13.3. Reglas

```text id="pxeclb"
- emergency debe escalar notificación administrativa.
- safetyRisk debe auditarse con severidad alta.
- urgent/emergency puede requerir aprobación posterior de costo según política.
- resident no debe poder auto-clasificar una emergencia como resuelta.
```

---

## 14. User stories

### 14.1. Solicitudes propias

```text id="yksi08"
US-001: Como residente, quiero reportar un problema de mantenimiento para que la administración lo revise.
US-002: Como residente, quiero adjuntar fotos a mi solicitud para documentar el problema.
US-003: Como residente, quiero consultar el estado de mis solicitudes para saber si están siendo atendidas.
US-004: Como propietario, quiero crear solicitudes relacionadas con mis unidades para gestionar incidencias.
```

---

### 14.2. Gestión administrativa

```text id="mcjo03"
US-005: Como administrador, quiero revisar solicitudes para aceptarlas, rechazarlas o marcarlas como duplicadas.
US-006: Como responsable de mantenimiento, quiero crear órdenes de trabajo para organizar la ejecución.
US-007: Como responsable de mantenimiento, quiero asignar una orden a un técnico o proveedor.
US-008: Como técnico interno, quiero registrar avances y evidencias de una orden asignada.
US-009: Como administrador, quiero cerrar una orden con evidencia y resumen.
US-010: Como administrador, quiero reabrir una orden cerrada si el problema persiste.
```

---

### 14.3. Costos y proveedores

```text id="d2w625"
US-011: Como responsable de mantenimiento, quiero registrar costos estimados para solicitar aprobación.
US-012: Como responsable financiero, quiero aprobar costos antes de comprometer gastos relevantes.
US-013: Como responsable financiero, quiero vincular un costo aprobado con Supplier Payments para gestionar la obligación por pagar.
US-014: Como administrador, quiero consultar qué proveedor atendió una orden.
```

---

### 14.4. Reportes

```text id="xiwsg5"
US-015: Como administrador, quiero ver órdenes abiertas por prioridad para gestionar el trabajo pendiente.
US-016: Como directivo autorizado, quiero ver reportes de mantenimiento por categoría y estado.
US-017: Como responsable financiero, quiero ver costos de mantenimiento por periodo.
US-018: Como administrador, quiero exportar reportes de mantenimiento de forma segura.
```

---

## 15. Requisitos funcionales

### 15.1. Configuración

```text id="dtd7k2"
FR-001: El sistema debe permitir crear categorías de mantenimiento por tenant.
FR-002: El sistema debe permitir configurar activos/ubicaciones mantenibles.
FR-003: El sistema debe permitir archivar categorías y activos sin borrar historial.
FR-004: El sistema debe permitir definir prioridad/severidad por defecto.
```

---

### 15.2. Solicitudes

```text id="nxptvf"
FR-005: El sistema debe permitir crear solicitudes desde administración.
FR-006: El sistema debe permitir crear solicitudes propias desde /me.
FR-007: El sistema debe permitir adjuntar evidencia inicial.
FR-008: El sistema debe permitir listar solicitudes administrativas.
FR-009: El sistema debe permitir listar solicitudes propias.
FR-010: El sistema debe permitir revisar solicitudes.
FR-011: El sistema debe permitir aceptar solicitudes.
FR-012: El sistema debe permitir rechazar solicitudes con razón.
FR-013: El sistema debe permitir cancelar solicitudes con razón.
FR-014: El sistema debe permitir marcar solicitudes como duplicadas.
FR-015: El sistema debe permitir convertir solicitud aceptada en orden de trabajo.
```

---

### 15.3. Órdenes de trabajo

```text id="hohhyq"
FR-016: El sistema debe permitir crear órdenes desde solicitud.
FR-017: El sistema debe permitir crear órdenes internas directas.
FR-018: El sistema debe permitir listar órdenes por filtros.
FR-019: El sistema debe permitir consultar detalle de orden.
FR-020: El sistema debe permitir actualizar órdenes draft/open.
FR-021: El sistema debe permitir asignar responsables.
FR-022: El sistema debe permitir programar órdenes.
FR-023: El sistema debe permitir iniciar ejecución.
FR-024: El sistema debe permitir pausar/on-hold una orden.
FR-025: El sistema debe permitir completar una orden.
FR-026: El sistema debe permitir cerrar una orden.
FR-027: El sistema debe permitir reabrir una orden cerrada.
FR-028: El sistema debe permitir cancelar una orden con razón.
FR-029: El sistema debe permitir archivar una orden.
```

---

### 15.4. Tareas y visitas

```text id="j08mou"
FR-030: El sistema debe permitir crear tareas dentro de una orden.
FR-031: El sistema debe permitir actualizar estado de tareas.
FR-032: El sistema debe permitir asignar tareas.
FR-033: El sistema debe permitir registrar visitas técnicas.
FR-034: El sistema debe permitir registrar resultado de acceso.
FR-035: El sistema debe permitir registrar notas de visita.
```

---

### 15.5. Evidencias

```text id="ufcoxl"
FR-036: El sistema debe permitir vincular evidencia a solicitud.
FR-037: El sistema debe permitir vincular evidencia a orden.
FR-038: El sistema debe permitir vincular evidencia a tarea.
FR-039: El sistema debe permitir vincular evidencia a visita.
FR-040: El sistema debe permitir verificar evidencia.
FR-041: El sistema debe permitir rechazar evidencia con razón.
FR-042: El sistema debe permitir descargar evidencia mediante SDS.
```

---

### 15.6. Costos

```text id="vmkxdl"
FR-043: El sistema debe permitir registrar costos estimados.
FR-044: El sistema debe permitir someter costos a aprobación.
FR-045: El sistema debe permitir aprobar costos.
FR-046: El sistema debe permitir rechazar costos con razón.
FR-047: El sistema debe permitir registrar costos reales referenciales.
FR-048: El sistema debe permitir vincular costos aprobados con Supplier Payments.
FR-049: El sistema debe impedir que mantenimiento cree pagos directamente.
```

---

### 15.7. Comentarios y comunicación

```text id="m8uhzw"
FR-050: El sistema debe permitir comentarios internos.
FR-051: El sistema debe permitir comentarios visibles al solicitante.
FR-052: El sistema debe emitir notificaciones por cambios relevantes.
FR-053: El sistema debe minimizar contenido sensible en notificaciones.
```

---

### 15.8. Reportes

```text id="cmboy6"
FR-054: El sistema debe generar reporte de órdenes por estado.
FR-055: El sistema debe generar reporte de órdenes por categoría.
FR-056: El sistema debe generar reporte de tiempos de atención.
FR-057: El sistema debe generar reporte de costos por periodo.
FR-058: El sistema debe generar reporte de órdenes por proveedor.
FR-059: El sistema debe permitir exportar reportes vía Secure Document Storage.
```

---

## 16. Requisitos no funcionales

### 16.1. Seguridad

```text id="k9j0gg"
NFR-001: Todos los endpoints administrativos requieren autenticación.
NFR-002: Todos los endpoints administrativos requieren tenant context.
NFR-003: Todos los endpoints administrativos requieren permisos.
NFR-004: Endpoints /me solo acceden a recursos propios.
NFR-005: Ningún endpoint público debe exponer mantenimiento.
NFR-006: Ningún response debe exponer storageKey.
NFR-007: Ningún response debe exponer comentarios internos a residentes.
```

---

### 16.2. Auditoría

```text id="o7gz17"
NFR-008: Todo cambio crítico debe auditarse.
NFR-009: Toda descarga de evidencia debe auditarse.
NFR-010: Toda aprobación de costo debe auditarse.
NFR-011: Todo cierre y reapertura debe auditarse.
```

---

### 16.3. Performance

```text id="ilbxc0"
NFR-012: Listado de solicitudes paginadas p95 < 800 ms.
NFR-013: Listado de órdenes paginadas p95 < 1000 ms.
NFR-014: Reporte operativo básico p95 < 1500 ms.
NFR-015: Exportación puede ejecutarse como job si excede tiempo máximo.
```

---

### 16.4. Disponibilidad

```text id="l3ai5z"
NFR-016: El módulo debe degradar elegantemente si Notifications falla.
NFR-017: El módulo debe conservar orden aunque falle notificación.
NFR-018: El módulo debe registrar link failed si Supplier Payments falla.
NFR-019: El módulo debe conservar evidencia aunque falle notificación.
```

---

### 16.5. Privacidad

```text id="qthpew"
NFR-020: Residentes no deben ver información de otros residentes.
NFR-021: Residentes no deben ver costos internos por defecto.
NFR-022: Residentes no deben ver comentarios internos.
NFR-023: Residentes no deben ver datos internos de proveedor por defecto.
NFR-024: Datos reales no deben enviarse a IA externa.
```

---

## 17. Permisos

### 17.1. Categorías y activos

```text id="w75ob5"
maintenanceCategories.create
maintenanceCategories.read
maintenanceCategories.update
maintenanceCategories.archive

maintenanceAssets.create
maintenanceAssets.read
maintenanceAssets.update
maintenanceAssets.archive
```

---

### 17.2. Solicitudes

```text id="y81m82"
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

### 17.3. Órdenes

```text id="wlyspo"
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

### 17.4. Tareas, visitas y evidencias

```text id="cwngmy"
maintenanceTasks.create
maintenanceTasks.read
maintenanceTasks.update
maintenanceTasks.complete
maintenanceTasks.archive

maintenanceVisits.create
maintenanceVisits.read
maintenanceVisits.update
maintenanceVisits.complete
maintenanceVisits.cancel
maintenanceVisits.archive

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

### 17.5. Costos y proveedores

```text id="o71gmv"
maintenanceCosts.create
maintenanceCosts.read
maintenanceCosts.update
maintenanceCosts.submit
maintenanceCosts.approve
maintenanceCosts.reject
maintenanceCosts.cancel
maintenanceCosts.convertToPayable
maintenanceCosts.archive

maintenanceSupplierLinks.create
maintenanceSupplierLinks.read
maintenanceSupplierLinks.unlink

maintenancePayableLinks.create
maintenancePayableLinks.read
maintenancePayableLinks.archive
```

---

### 17.6. Reportes

```text id="z23wc6"
maintenanceReports.read
maintenanceReports.export
maintenanceReports.byStatus
maintenanceReports.byCategory
maintenanceReports.responseTimes
maintenanceReports.costs
maintenanceReports.bySupplier
```

---

## 18. API preliminar

### 18.1. Tenant admin API

```text id="bt10ty"
GET    /api/v1/tenant/maintenance-categories
POST   /api/v1/tenant/maintenance-categories
GET    /api/v1/tenant/maintenance-categories/{categoryId}
PATCH  /api/v1/tenant/maintenance-categories/{categoryId}
POST   /api/v1/tenant/maintenance-categories/{categoryId}/archive

GET    /api/v1/tenant/maintenance-assets
POST   /api/v1/tenant/maintenance-assets
GET    /api/v1/tenant/maintenance-assets/{assetId}
PATCH  /api/v1/tenant/maintenance-assets/{assetId}
POST   /api/v1/tenant/maintenance-assets/{assetId}/archive

GET    /api/v1/tenant/maintenance-requests
POST   /api/v1/tenant/maintenance-requests
GET    /api/v1/tenant/maintenance-requests/{requestId}
PATCH  /api/v1/tenant/maintenance-requests/{requestId}
POST   /api/v1/tenant/maintenance-requests/{requestId}/review
POST   /api/v1/tenant/maintenance-requests/{requestId}/accept
POST   /api/v1/tenant/maintenance-requests/{requestId}/reject
POST   /api/v1/tenant/maintenance-requests/{requestId}/cancel
POST   /api/v1/tenant/maintenance-requests/{requestId}/mark-duplicate
POST   /api/v1/tenant/maintenance-requests/{requestId}/convert-to-work-order

GET    /api/v1/tenant/maintenance-work-orders
POST   /api/v1/tenant/maintenance-work-orders
GET    /api/v1/tenant/maintenance-work-orders/{workOrderId}
PATCH  /api/v1/tenant/maintenance-work-orders/{workOrderId}
POST   /api/v1/tenant/maintenance-work-orders/{workOrderId}/assign
POST   /api/v1/tenant/maintenance-work-orders/{workOrderId}/schedule
POST   /api/v1/tenant/maintenance-work-orders/{workOrderId}/start
POST   /api/v1/tenant/maintenance-work-orders/{workOrderId}/pause
POST   /api/v1/tenant/maintenance-work-orders/{workOrderId}/complete
POST   /api/v1/tenant/maintenance-work-orders/{workOrderId}/close
POST   /api/v1/tenant/maintenance-work-orders/{workOrderId}/reopen
POST   /api/v1/tenant/maintenance-work-orders/{workOrderId}/cancel
POST   /api/v1/tenant/maintenance-work-orders/{workOrderId}/archive
```

---

### 18.2. Tasks, visits, evidence and comments API

```text id="j54t58"
GET    /api/v1/tenant/maintenance-work-orders/{workOrderId}/tasks
POST   /api/v1/tenant/maintenance-work-orders/{workOrderId}/tasks
GET    /api/v1/tenant/maintenance-tasks/{taskId}
PATCH  /api/v1/tenant/maintenance-tasks/{taskId}
POST   /api/v1/tenant/maintenance-tasks/{taskId}/complete
POST   /api/v1/tenant/maintenance-tasks/{taskId}/archive

GET    /api/v1/tenant/maintenance-work-orders/{workOrderId}/visits
POST   /api/v1/tenant/maintenance-work-orders/{workOrderId}/visits
GET    /api/v1/tenant/maintenance-visits/{visitId}
PATCH  /api/v1/tenant/maintenance-visits/{visitId}
POST   /api/v1/tenant/maintenance-visits/{visitId}/complete
POST   /api/v1/tenant/maintenance-visits/{visitId}/cancel

GET    /api/v1/tenant/maintenance-work-orders/{workOrderId}/evidence
POST   /api/v1/tenant/maintenance-work-orders/{workOrderId}/evidence
GET    /api/v1/tenant/maintenance-evidence/{evidenceId}
POST   /api/v1/tenant/maintenance-evidence/{evidenceId}/verify
POST   /api/v1/tenant/maintenance-evidence/{evidenceId}/reject
POST   /api/v1/tenant/maintenance-evidence/{evidenceId}/archive

GET    /api/v1/tenant/maintenance-work-orders/{workOrderId}/comments
POST   /api/v1/tenant/maintenance-work-orders/{workOrderId}/comments
```

---

### 18.3. Costs and supplier links API

```text id="xj5t6d"
GET    /api/v1/tenant/maintenance-work-orders/{workOrderId}/costs
POST   /api/v1/tenant/maintenance-work-orders/{workOrderId}/costs
GET    /api/v1/tenant/maintenance-costs/{costEstimateId}
PATCH  /api/v1/tenant/maintenance-costs/{costEstimateId}
POST   /api/v1/tenant/maintenance-costs/{costEstimateId}/submit
POST   /api/v1/tenant/maintenance-costs/{costEstimateId}/approve
POST   /api/v1/tenant/maintenance-costs/{costEstimateId}/reject
POST   /api/v1/tenant/maintenance-costs/{costEstimateId}/cancel
POST   /api/v1/tenant/maintenance-costs/{costEstimateId}/convert-to-payable

GET    /api/v1/tenant/maintenance-work-orders/{workOrderId}/supplier-links
POST   /api/v1/tenant/maintenance-work-orders/{workOrderId}/supplier-links
POST   /api/v1/tenant/maintenance-supplier-links/{linkId}/unlink

GET    /api/v1/tenant/maintenance-work-orders/{workOrderId}/payable-links
```

---

### 18.4. Reports API

```text id="a6ecwn"
GET /api/v1/tenant/maintenance-reports/by-status
GET /api/v1/tenant/maintenance-reports/by-category
GET /api/v1/tenant/maintenance-reports/response-times
GET /api/v1/tenant/maintenance-reports/costs
GET /api/v1/tenant/maintenance-reports/by-supplier
GET /api/v1/tenant/maintenance-reports/export
```

---

### 18.5. `/me` API

Permitida para residentes/propietarios bajo reglas propias.

```text id="yr6ud1"
GET    /api/v1/me/maintenance-requests
POST   /api/v1/me/maintenance-requests
GET    /api/v1/me/maintenance-requests/{requestId}
POST   /api/v1/me/maintenance-requests/{requestId}/comments
POST   /api/v1/me/maintenance-requests/{requestId}/cancel
GET    /api/v1/me/maintenance-requests/{requestId}/evidence
POST   /api/v1/me/maintenance-requests/{requestId}/evidence
```

Reglas:

```text id="z6c7hv"
- solo solicitudes propias;
- solo unidades vinculadas al usuario;
- no costos internos;
- no proveedor interno por defecto;
- no comentarios internos;
- no audit completo;
- no reportes administrativos;
- no órdenes internas salvo resumen seguro.
```

---

### 18.6. Endpoints públicos prohibidos

No crear:

```text id="w254bf"
GET  /api/v1/public/maintenance-requests
GET  /api/v1/public/maintenance-work-orders
GET  /api/v1/public/maintenance-evidence
GET  /api/v1/public/maintenance-reports
GET  /api/v1/public/tenants/{slug}/maintenance-requests
GET  /api/v1/public/tenants/{slug}/maintenance-work-orders
POST /api/v1/public/maintenance-requests
```

Respuesta esperada:

```text id="mwr81x"
404 Not Found
```

---

## 19. Integraciones

### 19.1. `003-residents-properties`

Uso:

```text id="ligknx"
- validar propertyUnitId;
- validar owner/resident vinculado;
- validar solicitudes propias;
- asociar solicitudes a unidades;
- asociar activos a unidades.
```

Regla:

```text id="f7flm9"
Un usuario /me solo puede crear solicitud sobre una unidad donde tiene relación vigente o área comunal permitida.
```

---

### 19.2. `010-reservations-common-areas`

Uso opcional:

```text id="ahc0yb"
- vincular órdenes a commonAreaId;
- bloquear reservas futuras si área entra en mantenimiento;
- notificar indisponibilidad si la política lo define.
```

Regla:

```text id="l13upk"
Maintenance puede informar indisponibilidad, pero Reservations gobierna reservas.
```

---

### 19.3. `012-communications-notifications`

Eventos notificables:

```text id="k130d7"
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

Regla:

```text id="rw25me"
Las notificaciones no deben incluir comentarios internos, costos internos, storageKey ni datos sensibles de proveedor.
```

---

### 19.4. `016-secure-document-storage`

Uso:

```text id="b86qnh"
- fotografías de solicitud;
- fotografías antes/durante/después;
- informes técnicos;
- cotizaciones;
- comprobantes;
- evidencias de cierre;
- exportaciones.
```

Metadata recomendada:

```text id="nficjx"
sourceModule = maintenanceWorkOrders
visibility = administrative | requesterVisible
sensitivity = internal | restricted
```

---

### 19.5. `021-supplier-payments`

Uso:

```text id="abwpxp"
- validar supplierId;
- vincular proveedor a orden;
- convertir costo aprobado en SupplierPayable;
- consultar supplierPayableId vinculado;
- mantener trazabilidad operativa-financiera.
```

Prohibido:

```text id="vom08l"
- crear SupplierPaymentOrder;
- marcar SupplierPaymentOrder paid;
- iniciar transferencia bancaria;
- modificar cuenta bancaria de proveedor;
- modificar pago;
- modificar conciliación bancaria.
```

---

### 19.6. `020-accounting-ledger`

Regla:

```text id="cbxj25"
Maintenance Work Orders no debe contabilizar directamente.
```

Si existe impacto contable, debe pasar por Supplier Payments u otro módulo financiero autorizado.

Prohibido:

```text id="dcikx5"
- crear JournalEntry desde Maintenance;
- editar JournalEntry;
- publicar asiento contable;
- afectar balances;
- modificar reportes contables.
```

---

### 19.7. `007-audit`

Todo evento crítico se audita.

Eventos mínimos:

```text id="mii416"
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
maintenanceRequest.archived

maintenanceWorkOrder.created
maintenanceWorkOrder.updated
maintenanceWorkOrder.assigned
maintenanceWorkOrder.scheduled
maintenanceWorkOrder.started
maintenanceWorkOrder.paused
maintenanceWorkOrder.resumed
maintenanceWorkOrder.completed
maintenanceWorkOrder.closed
maintenanceWorkOrder.reopened
maintenanceWorkOrder.cancelled
maintenanceWorkOrder.archived

maintenanceTask.created
maintenanceTask.updated
maintenanceTask.completed
maintenanceTask.archived

maintenanceVisit.created
maintenanceVisit.updated
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
maintenanceReport.generated
maintenanceReport.exported
```

---

## 20. Seguridad

### 20.1. Controles obligatorios

```text id="n0qb0q"
- AuthGuard en rutas tenant y /me;
- TenantGuard en rutas tenant;
- OwnResourceGuard en rutas /me;
- PermissionGuard en rutas administrativas;
- ValidationPipe whitelist;
- forbidNonWhitelisted;
- no tenantId en body;
- no actor fields en body;
- no status directo salvo endpoint de transición;
- no storageKey;
- no signedUrl persistente;
- no base64 en JSON;
- Decimal para dinero;
- audit obligatorio;
- logs sanitizados;
- reportes tenant-scoped.
```

---

### 20.2. Campos prohibidos en requests

```text id="x52bct"
tenantId
createdBy
updatedBy
assignedBy
approvedBy
rejectedBy
closedBy
reopenedBy
archivedBy
status directo
costApprovalStatus directo
actualCostAmount sin permiso
supplierPayableId directo fuera de endpoint controlado
storageKey
signedUrl
base64
raw file payload
journalEntryId
paymentOrderId
bankTransactionId
reconciliationMatchId
payment initiation fields
Open Banking payment initiation fields
external AI flags
```

---

### 20.3. Campos prohibidos en responses ordinarios

```text id="cyyscn"
storageKey
signedUrl persistente
comentarios internos para /me
costos internos para /me
supplier internal data para /me
audit metadata completa para /me
datos de otros residentes
datos cross-tenant
raw file payload
raw supplier payload
stack trace
```

---

## 21. Auditoría y trazabilidad

Toda operación crítica debe dejar evidencia auditable con:

```text id="s26fdt"
tenantId
actorUserProfileId
action
category = maintenance
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

```text id="bjaboc"
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

```text id="gx1frf"
storageKey
signedUrl
base64
raw file payload
comentarios internos completos si no son necesarios
datos personales innecesarios
datos cross-tenant
tokens
secrets
passwords
stack trace
SQL raw
```

---

## 22. Observabilidad

### 22.1. Logs permitidos

```text id="tmyvwq"
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

### 22.2. Métricas

```text id="f91rah"
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

### 22.3. Labels permitidos

```text id="fgzhzx"
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

```text id="i1qwrf"
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

## 23. Reportes MVP

### 23.1. Órdenes por estado

```text id="ny8g3u"
cantidad de órdenes agrupadas por estado y periodo
```

---

### 23.2. Órdenes por categoría

```text id="fhuoh8"
cantidad de órdenes agrupadas por categoría, prioridad y severidad
```

---

### 23.3. Tiempos de atención

```text id="qfgz1h"
tiempo desde submitted hasta accepted
tiempo desde accepted hasta work order
tiempo desde open hasta closed
```

---

### 23.4. Costos de mantenimiento

```text id="j9mbr7"
estimatedAmount
approvedAmount
actualAmount referencial
costos por categoría
costos por proveedor
costos por periodo
```

---

### 23.5. Órdenes por proveedor

```text id="wy3lg4"
cantidad de órdenes vinculadas a supplier
costos aprobados por supplier
órdenes abiertas por supplier
órdenes cerradas por supplier
```

---

## 24. Flujos principales

### 24.1. Solicitud propia de residente

```text id="p5nzdo"
1. Resident accede a /me.
2. Sistema valida UserProfile.
3. Sistema valida Person vinculada.
4. Sistema valida unidad asociada o área permitida.
5. Resident crea solicitud.
6. Sistema asigna requestNumber.
7. Sistema guarda solicitud submitted.
8. Resident adjunta evidencia vía SDS.
9. Sistema emite maintenanceRequest.submitted.
10. Sistema notifica a administración.
11. Sistema audita.
```

---

### 24.2. Evaluación administrativa

```text id="ryljfe"
1. MaintenanceManager lista solicitudes submitted.
2. Revisa descripción, categoría, unidad y evidencia.
3. Puede marcar underReview.
4. Puede aceptar.
5. Puede rechazar con razón.
6. Puede marcar duplicada.
7. Si acepta, puede convertir en WorkOrder.
8. Sistema audita cada transición.
```

---

### 24.3. Orden de trabajo interna

```text id="k5te45"
1. MaintenanceManager crea o convierte orden.
2. Define prioridad/severidad.
3. Asigna responsable interno.
4. Programa fecha.
5. Técnico inicia trabajo.
6. Técnico registra tareas.
7. Técnico adjunta evidencia.
8. Técnico marca completed.
9. MaintenanceManager valida y cierra.
10. Sistema notifica al solicitante si aplica.
11. Sistema audita.
```

---

### 24.4. Orden de trabajo con proveedor

```text id="w80ry8"
1. MaintenanceManager crea WorkOrder.
2. Vincula Supplier activo.
3. Registra costo estimado.
4. Solicita aprobación de costo.
5. FinancialManager aprueba costo.
6. Proveedor ejecuta trabajo fuera del sistema.
7. Usuario autorizado registra evidencia.
8. Se completa y cierra la orden.
9. Si corresponde, costo aprobado se convierte a SupplierPayable.
10. Supplier Payments gobierna el pago.
11. Sistema audita.
```

---

### 24.5. Reapertura

```text id="e5e5w2"
1. Resident o administrador reporta persistencia.
2. Usuario autorizado solicita reapertura.
3. Sistema valida estado closed.
4. Sistema requiere reason.
5. Sistema pasa closed -> reopened.
6. Sistema puede pasar reopened -> inProgress.
7. Sistema conserva cierre anterior.
8. Sistema audita.
```

---

## 25. Reglas de integración con Supplier Payments

### 25.1. Conversión a payable

Permitida solo si:

```text id="u4co8f"
- workOrder pertenece al tenant;
- costEstimate pertenece al tenant;
- costEstimate está approved;
- supplierId existe;
- supplier está active;
- no existe payable link activo previo para el mismo costEstimate;
- usuario tiene maintenanceCosts.convertToPayable;
- Supplier Payments está habilitado.
```

---

### 25.2. Datos enviados

```text id="rejhbh"
supplierId
description
documentType = manualObligation | invoice | receipt según evidencia
issueDate opcional
receivedDate
dueDate opcional
subtotalAmount / totalAmount según política
categoryId opcional
secureDocumentId opcional
sourceModule = maintenanceWorkOrders
sourceResourceType = maintenanceCostEstimate
sourceResourceId = costEstimateId
```

---

### 25.3. Prohibido

```text id="nk2eku"
- crear pago;
- crear orden de pago;
- marcar paid;
- iniciar transferencia;
- modificar cuenta bancaria;
- modificar estado de conciliación;
- modificar contabilidad.
```

---

## 26. Criterios de aceptación

```text id="awrfrf"
[ ] Se pueden configurar categorías de mantenimiento.
[ ] Se pueden configurar activos/ubicaciones mantenibles.
[ ] Resident puede crear solicitud propia.
[ ] Resident puede adjuntar evidencia propia vía SDS.
[ ] Resident solo consulta solicitudes propias.
[ ] Administración puede revisar solicitudes.
[ ] Administración puede aceptar/rechazar/cancelar solicitudes.
[ ] Solicitud aceptada puede convertirse en orden.
[ ] Administración puede crear orden directa.
[ ] Orden puede asignarse a usuario interno.
[ ] Orden puede vincularse a supplier activo.
[ ] Orden puede programarse.
[ ] Orden puede iniciar ejecución.
[ ] Orden puede registrar tareas.
[ ] Orden puede registrar visitas.
[ ] Orden puede adjuntar evidencias.
[ ] Orden puede completarse.
[ ] Orden puede cerrarse con evidencia o justificación.
[ ] Orden cerrada puede reabrirse con permiso y razón.
[ ] Costos estimados pueden registrarse.
[ ] Costos pueden aprobarse.
[ ] Costos aprobados pueden vincularse a Supplier Payments.
[ ] Mantenimiento no crea pagos.
[ ] Mantenimiento no inicia transferencias.
[ ] Mantenimiento no crea asientos contables.
[ ] Reportes básicos funcionan.
[ ] Exportación usa SDS.
[ ] Audit registra eventos críticos.
[ ] No hay endpoints públicos.
[ ] WordPress público no tiene acceso.
[ ] /me no expone información interna.
[ ] Tenant isolation se respeta.
```

---

## 27. No aceptación

El módulo no debe aceptarse si:

```text id="qw3bjl"
- permite solicitudes cross-tenant;
- permite órdenes cross-tenant;
- permite evidencias cross-tenant;
- permite costos cross-tenant;
- permite supplier cross-tenant;
- permite propertyUnit cross-tenant;
- permite commonArea cross-tenant;
- permite secureDocument cross-tenant;
- acepta tenantId desde body;
- acepta actor fields desde body;
- acepta status directo sin endpoint de transición;
- expone storageKey;
- expone signedUrl persistente;
- expone comentarios internos en /me;
- expone costos internos en /me sin permiso;
- expone proveedor interno en /me sin permiso;
- permite resident ver solicitudes de otro resident;
- permite resident crear solicitud sobre unidad ajena;
- permite cerrar orden sin evidencia ni justificación;
- permite reabrir orden sin razón;
- permite costo negativo;
- usa float/double para dinero;
- crea pagos desde Maintenance Work Orders;
- inicia transferencia bancaria;
- inicia Open Banking payment;
- crea JournalEntry;
- edita JournalEntry;
- confirma Bank Reconciliation;
- crea endpoint público de maintenance requests;
- crea endpoint público de maintenance work orders;
- permite acceso desde WordPress público;
- envía fotos reales, informes reales o solicitudes reales a IA externa;
- omite auditoría crítica.
```

---

## 28. Riesgos y mitigaciones

| Riesgo                               | Mitigación                                      |
| ------------------------------------ | ----------------------------------------------- |
| Solicitudes duplicadas               | `duplicateOfRequestId`, revisión administrativa |
| Resident reporta unidad ajena        | OwnResourceGuard con vínculo persona-unidad     |
| Evidencia sensible expuesta          | Secure Document Storage + permisos              |
| Cierre sin evidencia                 | `closureEvidenceRequired` y razón obligatoria   |
| Costos manipulados                   | Decimal, permisos, approval workflow            |
| Pago creado indebidamente            | Supplier Payments como autoridad financiera     |
| Comentarios internos expuestos       | `visibility` y DTOs diferenciados               |
| Proveedor bloqueado asignado         | Validación contra Supplier Payments             |
| Órdenes cross-tenant                 | tenantId obligatorio en todas las consultas     |
| Reportes con datos de otro tenant    | filtros tenant-scoped y tests                   |
| WordPress accede a operación interna | no public endpoints + CORS restrictivo          |

---

## 29. Decisiones MVP

```text id="r47qls"
- Se permite /me para solicitudes propias.
- No se permite endpoint público.
- No se permite acceso desde WordPress público.
- Se modelan categorías de mantenimiento.
- Se modelan activos/ubicaciones básicas.
- Se modelan solicitudes y órdenes separadas.
- Se soportan órdenes internas, de proveedor y mixtas.
- Se soportan tareas y visitas.
- Se soportan evidencias vía Secure Document Storage.
- Se soportan costos estimados, aprobados y reales referenciales.
- Se soporta conversión controlada hacia Supplier Payments.
- No se crean pagos.
- No se inicia transferencia bancaria.
- No se contabiliza directamente.
- No se confirma conciliación bancaria.
- No se implementa mantenimiento predictivo.
- No se implementa inventario avanzado.
- No se implementa workflow de cotizaciones múltiples.
- No se implementa portal de proveedores.
- No se usa IA externa con datos reales.
```

---

## 30. Resultado esperado

Al completar esta especificación, RESIDENT Core contará con una base funcional para gestionar mantenimiento operativo dentro de cada conjunto residencial.

Resultado esperado:

```text id="b0ntmx"
MaintenanceCategory definido
MaintenanceAsset definido
MaintenanceRequest definido
MaintenanceRequestAttachment definido
MaintenanceWorkOrder definido
MaintenanceWorkOrderAssignment definido
MaintenanceWorkOrderTask definido
MaintenanceVisit definido
MaintenanceEvidence definido
MaintenanceCostEstimate definido
MaintenanceCostApproval definido
MaintenanceSupplierLink definido
MaintenancePayableLink definido
MaintenanceComment definido
MaintenanceStatusHistory definido
tenant isolation definido
/me own maintenance requests definido
admin maintenance workflow definido
evidence via Secure Document Storage definido
supplier link definido
payable link definido
no payment creation definido
no bank transfer initiation definido
no direct accounting definido
notifications definido
audit definido
observability definido
reports definido
security boundaries definido
```

---

## 31. Expediente actualizado

```text id="j5mv2a"
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
│   │       └── spec.md
```
