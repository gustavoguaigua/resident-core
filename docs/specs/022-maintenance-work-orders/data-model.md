# Data Model — 022 Maintenance Work Orders

## 1. Información del documento

| Campo                  | Valor                                                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Proyecto               | RESIDENT Core                                                                                                                  |
| Spec ID                | 022                                                                                                                            |
| Módulo                 | Maintenance Work Orders                                                                                                        |
| Documento              | Data Model                                                                                                                     |
| Ruta                   | `docs/specs/022-maintenance-work-orders/data-model.md`                                                                         |
| Versión                | 0.1                                                                                                                            |
| Estado                 | Borrador inicial                                                                                                               |
| Fecha                  | 2026-07-23                                                                                                                     |
| Documento base         | `docs/specs/022-maintenance-work-orders/spec.md`                                                                               |
| Plan técnico           | `docs/specs/022-maintenance-work-orders/plan.md`                                                                               |
| Base de datos objetivo | PostgreSQL                                                                                                                     |
| ORM objetivo           | Prisma                                                                                                                         |
| Estrategia multitenant | Shared database / shared schema / tenant_id                                                                                    |
| Naturaleza             | Tenant-scoped / Operational / Request-driven / Work-order-driven / Evidence-backed / Supplier-aware / Cost-aware / Audit-heavy |

---

## 2. Propósito

Este documento define el modelo de datos del módulo `022-maintenance-work-orders`.

El modelo cubre solicitudes de mantenimiento, activos mantenibles, órdenes de trabajo, tareas, visitas, evidencias, comentarios, costos, aprobaciones, vínculos con proveedores, vínculos con cuentas por pagar, historial de estados, auditoría e integración documental.

Regla central del modelo:

```text id="wm18hk"
Toda entidad de Maintenance Work Orders debe ser tenant-scoped, auditable, no pública, compatible con Secure Document Storage, segura para /me, protegida contra acceso cross-tenant, sin creación directa de pagos, sin iniciación bancaria, sin contabilidad directa, sin exposición de storageKey y sin uso de float/double para costos.
```

---

## 3. Principios de modelado

### 3.1. Tenant isolation obligatorio

Todas las tablas operativas incluyen:

```text id="t1xg33"
tenant_id
```

Nunca se debe consultar una entidad tenant-scoped solo por `id`.

Patrón obligatorio:

```typescript id="r8c2ww"
await prisma.maintenanceWorkOrder.findFirst({
  where: {
    id: workOrderId,
    tenantId: currentTenant.id,
    archivedAt: null
  }
});
```

Patrón prohibido:

```typescript id="n7wpke"
await prisma.maintenanceWorkOrder.findUnique({
  where: { id: workOrderId }
});
```

---

### 3.2. Solicitud y orden son entidades separadas

Una solicitud representa un reporte inicial.

Una orden representa una decisión operativa de gestión.

```text id="my330n"
maintenance_requests
  -> accepted
  -> convertedToWorkOrder
  -> maintenance_work_orders
```

No toda solicitud genera una orden.

---

### 3.3. Costos no equivalen a pagos

El módulo registra costos operativos, pero no registra pagos.

```text id="g95wqe"
maintenance_cost_estimates != supplier_payment_orders
maintenance_cost_estimates != payments
maintenance_cost_estimates != journal_entries
```

Si se requiere pago, se crea un vínculo controlado hacia `021-supplier-payments`.

---

### 3.4. Evidencias siempre mediante Secure Document Storage

El módulo no almacena archivos binarios ni `base64`.

Solo almacena referencias:

```text id="p1hwne"
secure_document_id
```

Prohibido:

```text id="bme858"
storageKey
signedUrl persistente
raw file payload
base64 document payload
```

---

### 3.5. Montos siempre Decimal

Todo monto debe persistirse como `Decimal(12,2)`.

En API se expone como string decimal.

```json id="y5c2dx"
{
  "approvedAmount": "125.50",
  "currency": "USD"
}
```

No se acepta `float`, `double` ni `number` como fuente de verdad monetaria.

---

### 3.6. Estados controlados

Las entidades con estados críticos deben moverse mediante endpoints de transición.

No se permite que el cliente actualice `status` directamente por `PATCH` ordinario.

---

### 3.7. Historial operativo inmutable

Las operaciones críticas deben conservar historial.

No se elimina físicamente:

```text id="z8vyxf"
- solicitud;
- orden;
- evidencia;
- tarea;
- visita;
- costo aprobado;
- comentario;
- vínculo con proveedor;
- vínculo con payable;
- historial de estado.
```

Se usa archivo lógico mediante `archived_at`.

---

## 4. Tablas del módulo

Tablas MVP:

```text id="dj1zhr"
maintenance_categories
maintenance_assets
maintenance_requests
maintenance_request_attachments
maintenance_work_orders
maintenance_work_order_assignments
maintenance_work_order_tasks
maintenance_visits
maintenance_evidence
maintenance_cost_estimates
maintenance_cost_approvals
maintenance_supplier_links
maintenance_payable_links
maintenance_comments
maintenance_status_history
```

---

## 5. Dependencias externas del modelo

| Módulo                             | Tabla / entidad referenciada     | Uso                                         |
| ---------------------------------- | -------------------------------- | ------------------------------------------- |
| `001-tenants`                      | `tenants`                        | Tenant owner de todos los registros         |
| `002-users-roles`                  | `user_profiles`                  | Actor, responsable, asignado, técnico       |
| `003-residents-properties`         | `persons`, `property_units`      | Solicitante, residente, propietario, unidad |
| `010-reservations-common-areas`    | `common_areas`                   | Área común afectada                         |
| `012-communications-notifications` | eventos internos                 | Notificaciones                              |
| `016-secure-document-storage`      | `secure_documents`               | Evidencias, adjuntos, exports               |
| `021-supplier-payments`            | `suppliers`, `supplier_payables` | Proveedor y cuenta por pagar                |
| `007-audit`                        | `audit_logs`                     | Auditoría                                   |
| `008-basic-reports`                | report registry                  | Reportes y exportación                      |

---

## 6. Entidades

---

# 6.1. `maintenance_categories`

## Propósito

Catálogo tenant-scoped de categorías de mantenimiento.

Ejemplos:

```text id="p3batq"
PLUMBING
ELECTRICAL
CLEANING
GARDENING
SECURITY_INFRA
COMMON_AREAS
STRUCTURE
LIGHTING
WATER_SYSTEMS
ACCESS_CONTROL
OTHER
```

## Campos

| Campo                          |         Tipo | Obligatorio | Descripción                                  |
| ------------------------------ | -----------: | ----------: | -------------------------------------------- |
| `id`                           |         UUID |          Sí | Identificador                                |
| `tenant_id`                    |         UUID |          Sí | Tenant owner                                 |
| `category_code`                |  varchar(50) |          Sí | Código único por tenant                      |
| `category_name`                | varchar(150) |          Sí | Nombre visible                               |
| `description`                  |         text |          No | Descripción                                  |
| `default_priority`             |         enum |          Sí | Prioridad por defecto                        |
| `default_severity`             |         enum |          Sí | Severidad por defecto                        |
| `requires_approval_by_default` |      boolean |          Sí | Si requiere aprobación operativa por defecto |
| `allows_resident_requests`     |      boolean |          Sí | Si residente puede usar esta categoría       |
| `status`                       |         enum |          Sí | active/inactive/archived                     |
| `created_by`                   |         UUID |          Sí | UserProfile actor                            |
| `updated_by`                   |         UUID |          No | Último actor                                 |
| `archived_by`                  |         UUID |          No | Actor de archivo                             |
| `created_at`                   |  timestamptz |          Sí | Fecha creación                               |
| `updated_at`                   |  timestamptz |          Sí | Fecha actualización                          |
| `archived_at`                  |  timestamptz |          No | Archivo lógico                               |
| `archive_reason`               |         text |          No | Razón de archivo                             |
| `metadata`                     |        jsonb |          No | Metadata sanitizada                          |

## Reglas

```text id="u6xs3a"
- category_code es único por tenant entre registros no archivados.
- archived no puede usarse para nuevas solicitudes u órdenes.
- inactive puede conservar historial, pero no debe ofrecerse por defecto.
- allows_resident_requests controla si aparece en /me.
```

---

# 6.2. `maintenance_assets`

## Propósito

Representa activos, áreas, equipos, zonas o ubicaciones mantenibles.

Ejemplos:

```text id="y7cyj5"
cancha múltiple
parque infantil
garita
portón vehicular
bomba de agua
cisterna
luminaria
cámara de seguridad
salón comunal
pasillo
jardín
unidad habitacional
```

## Campos

| Campo                  |         Tipo | Obligatorio | Descripción                   |
| ---------------------- | -----------: | ----------: | ----------------------------- |
| `id`                   |         UUID |          Sí | Identificador                 |
| `tenant_id`            |         UUID |          Sí | Tenant owner                  |
| `asset_code`           |  varchar(50) |          Sí | Código único por tenant       |
| `asset_name`           | varchar(180) |          Sí | Nombre del activo             |
| `asset_type`           |         enum |          Sí | Tipo de activo                |
| `description`          |         text |          No | Descripción                   |
| `location_description` |         text |          No | Ubicación textual             |
| `property_unit_id`     |         UUID |          No | Unidad habitacional vinculada |
| `common_area_id`       |         UUID |          No | Área común vinculada          |
| `parent_asset_id`      |         UUID |          No | Activo padre                  |
| `status`               |         enum |          Sí | Estado                        |
| `criticality`          |         enum |          Sí | Criticidad                    |
| `created_by`           |         UUID |          Sí | Actor creador                 |
| `updated_by`           |         UUID |          No | Actor actualización           |
| `archived_by`          |         UUID |          No | Actor archivo                 |
| `created_at`           |  timestamptz |          Sí | Creación                      |
| `updated_at`           |  timestamptz |          Sí | Actualización                 |
| `archived_at`          |  timestamptz |          No | Archivo lógico                |
| `archive_reason`       |         text |          No | Razón                         |
| `metadata`             |        jsonb |          No | Metadata sanitizada           |

## Reglas

```text id="epn5vd"
- asset_code es único por tenant entre activos no archivados.
- property_unit_id debe pertenecer al mismo tenant.
- common_area_id debe pertenecer al mismo tenant.
- parent_asset_id debe pertenecer al mismo tenant.
- archived no recibe nuevas solicitudes ni órdenes.
- decommissioned conserva historial, pero no se asigna a nuevas órdenes.
```

---

# 6.3. `maintenance_requests`

## Propósito

Representa solicitudes, reportes o incidencias de mantenimiento.

Puede ser creada por residentes, propietarios o administración.

## Campos

| Campo                       |         Tipo | Obligatorio | Descripción              |
| --------------------------- | -----------: | ----------: | ------------------------ |
| `id`                        |         UUID |          Sí | Identificador            |
| `tenant_id`                 |         UUID |          Sí | Tenant owner             |
| `request_number`            |  varchar(50) |          Sí | Número único por tenant  |
| `title`                     | varchar(180) |          Sí | Título                   |
| `description`               |         text |          Sí | Descripción del problema |
| `category_id`               |         UUID |          Sí | Categoría                |
| `asset_id`                  |         UUID |          No | Activo mantenible        |
| `property_unit_id`          |         UUID |          No | Unidad relacionada       |
| `common_area_id`            |         UUID |          No | Área común relacionada   |
| `reported_by_user_id`       |         UUID |          Sí | UserProfile solicitante  |
| `reported_by_person_id`     |         UUID |          No | Persona solicitante      |
| `request_source`            |         enum |          Sí | Fuente                   |
| `visibility`                |         enum |          Sí | Visibilidad              |
| `priority`                  |         enum |          Sí | Prioridad                |
| `severity`                  |         enum |          Sí | Severidad                |
| `status`                    |         enum |          Sí | Estado                   |
| `duplicate_of_request_id`   |         UUID |          No | Solicitud duplicada      |
| `accepted_as_work_order_id` |         UUID |          No | Orden creada             |
| `rejected_reason`           |         text |          No | Razón de rechazo         |
| `cancel_reason`             |         text |          No | Razón cancelación        |
| `closed_reason`             |         text |          No | Razón cierre sin orden   |
| `created_at`                |  timestamptz |          Sí | Creación                 |
| `updated_at`                |  timestamptz |          Sí | Actualización            |
| `submitted_at`              |  timestamptz |          No | Fecha envío              |
| `reviewed_at`               |  timestamptz |          No | Fecha revisión           |
| `reviewed_by`               |         UUID |          No | Actor revisión           |
| `accepted_at`               |  timestamptz |          No | Fecha aceptación         |
| `accepted_by`               |         UUID |          No | Actor aceptación         |
| `rejected_at`               |  timestamptz |          No | Fecha rechazo            |
| `rejected_by`               |         UUID |          No | Actor rechazo            |
| `cancelled_at`              |  timestamptz |          No | Fecha cancelación        |
| `cancelled_by`              |         UUID |          No | Actor cancelación        |
| `closed_at`                 |  timestamptz |          No | Fecha cierre             |
| `closed_by`                 |         UUID |          No | Actor cierre             |
| `archived_at`               |  timestamptz |          No | Archivo                  |
| `archived_by`               |         UUID |          No | Actor archivo            |
| `metadata`                  |        jsonb |          No | Metadata sanitizada      |

## Reglas

```text id="z354ij"
- request_number es único por tenant.
- reported_by_user_id se resuelve server-side en /me.
- resident solo accede a solicitudes propias.
- property_unit_id debe pertenecer al tenant.
- asset_id debe pertenecer al tenant.
- common_area_id debe pertenecer al tenant.
- duplicate_of_request_id debe pertenecer al mismo tenant.
- accepted_as_work_order_id debe pertenecer al mismo tenant.
- rejected requiere rejected_reason.
- cancelled requiere cancel_reason.
- convertedToWorkOrder requiere accepted_as_work_order_id.
```

---

# 6.4. `maintenance_request_attachments`

## Propósito

Adjuntos iniciales de una solicitud.

Se almacenan en Secure Document Storage.

## Campos

| Campo                    |        Tipo | Obligatorio | Descripción         |
| ------------------------ | ----------: | ----------: | ------------------- |
| `id`                     |        UUID |          Sí | Identificador       |
| `tenant_id`              |        UUID |          Sí | Tenant owner        |
| `maintenance_request_id` |        UUID |          Sí | Solicitud           |
| `secure_document_id`     |        UUID |          Sí | Documento seguro    |
| `attachment_type`        |        enum |          Sí | Tipo                |
| `description`            |        text |          No | Descripción         |
| `visibility`             |        enum |          Sí | Visibilidad         |
| `status`                 |        enum |          Sí | Estado              |
| `created_by`             |        UUID |          Sí | Actor               |
| `archived_by`            |        UUID |          No | Actor archivo       |
| `created_at`             | timestamptz |          Sí | Creación            |
| `archived_at`            | timestamptz |          No | Archivo             |
| `archive_reason`         |        text |          No | Razón               |
| `metadata`               |       jsonb |          No | Metadata sanitizada |

## Reglas

```text id="r5p80a"
- secure_document_id debe pertenecer al tenant.
- no se almacena storageKey.
- no se almacena signedUrl persistente.
- /me solo ve attachments requesterVisible.
- archived no se devuelve por defecto.
```

---

# 6.5. `maintenance_work_orders`

## Propósito

Representa una orden de trabajo operativa.

Puede crearse desde una solicitud aceptada o directamente por administración.

## Campos

| Campo                       |          Tipo | Obligatorio | Descripción                     |
| --------------------------- | ------------: | ----------: | ------------------------------- |
| `id`                        |          UUID |          Sí | Identificador                   |
| `tenant_id`                 |          UUID |          Sí | Tenant owner                    |
| `work_order_number`         |   varchar(50) |          Sí | Número único por tenant         |
| `maintenance_request_id`    |          UUID |          No | Solicitud origen                |
| `title`                     |  varchar(180) |          Sí | Título                          |
| `description`               |          text |          Sí | Descripción                     |
| `category_id`               |          UUID |          Sí | Categoría                       |
| `asset_id`                  |          UUID |          No | Activo                          |
| `property_unit_id`          |          UUID |          No | Unidad                          |
| `common_area_id`            |          UUID |          No | Área común                      |
| `work_order_type`           |          enum |          Sí | Tipo                            |
| `execution_mode`            |          enum |          Sí | Modo de ejecución               |
| `priority`                  |          enum |          Sí | Prioridad                       |
| `severity`                  |          enum |          Sí | Severidad                       |
| `status`                    |          enum |          Sí | Estado                          |
| `scheduled_start_at`        |   timestamptz |          No | Inicio programado               |
| `scheduled_end_at`          |   timestamptz |          No | Fin programado                  |
| `actual_start_at`           |   timestamptz |          No | Inicio real                     |
| `actual_end_at`             |   timestamptz |          No | Fin real                        |
| `assigned_internal_user_id` |          UUID |          No | Usuario interno asignado        |
| `supplier_id`               |          UUID |          No | Proveedor                       |
| `estimated_cost_amount`     | Decimal(12,2) |          No | Costo estimado agregado         |
| `approved_cost_amount`      | Decimal(12,2) |          No | Costo aprobado agregado         |
| `actual_cost_amount`        | Decimal(12,2) |          No | Costo real referencial agregado |
| `currency`                  |          enum |          Sí | USD                             |
| `requires_cost_approval`    |       boolean |          Sí | Requiere aprobación             |
| `cost_approval_status`      |          enum |          No | Estado aprobación costo         |
| `completion_summary`        |          text |          No | Resumen finalización            |
| `closure_evidence_required` |       boolean |          Sí | Requiere evidencia              |
| `closure_reason`            |          text |          No | Razón de cierre sin evidencia   |
| `closed_by`                 |          UUID |          No | Actor cierre                    |
| `closed_at`                 |   timestamptz |          No | Fecha cierre                    |
| `reopened_by`               |          UUID |          No | Actor reapertura                |
| `reopened_at`               |   timestamptz |          No | Fecha reapertura                |
| `reopen_reason`             |          text |          No | Razón reapertura                |
| `cancelled_by`              |          UUID |          No | Actor cancelación               |
| `cancelled_at`              |   timestamptz |          No | Fecha cancelación               |
| `cancel_reason`             |          text |          No | Razón cancelación               |
| `created_by`                |          UUID |          Sí | Actor creación                  |
| `updated_by`                |          UUID |          No | Actor actualización             |
| `archived_by`               |          UUID |          No | Actor archivo                   |
| `created_at`                |   timestamptz |          Sí | Creación                        |
| `updated_at`                |   timestamptz |          Sí | Actualización                   |
| `archived_at`               |   timestamptz |          No | Archivo                         |
| `archive_reason`            |          text |          No | Razón archivo                   |
| `metadata`                  |         jsonb |          No | Metadata sanitizada             |

## Reglas

```text id="q35bsj"
- work_order_number es único por tenant.
- maintenance_request_id debe pertenecer al mismo tenant.
- category_id debe pertenecer al mismo tenant.
- asset_id debe pertenecer al mismo tenant.
- property_unit_id debe pertenecer al mismo tenant.
- common_area_id debe pertenecer al mismo tenant.
- supplier_id debe validarse contra Supplier Payments.
- closed requiere completion_summary.
- closed requiere evidencia válida o closure_reason controlada.
- reopened requiere reopen_reason.
- cancelled requiere cancel_reason.
- no puede crear pagos.
- no puede crear JournalEntries.
```

---

# 6.6. `maintenance_work_order_assignments`

## Propósito

Registra asignaciones internas o externas de una orden.

## Campos

| Campo              |        Tipo | Obligatorio | Descripción         |
| ------------------ | ----------: | ----------: | ------------------- |
| `id`               |        UUID |          Sí | Identificador       |
| `tenant_id`        |        UUID |          Sí | Tenant owner        |
| `work_order_id`    |        UUID |          Sí | Orden               |
| `assignment_type`  |        enum |          Sí | Tipo de asignación  |
| `assigned_user_id` |        UUID |          No | Usuario interno     |
| `supplier_id`      |        UUID |          No | Proveedor           |
| `assigned_by`      |        UUID |          Sí | Actor asignador     |
| `assigned_at`      | timestamptz |          Sí | Fecha asignación    |
| `accepted_at`      | timestamptz |          No | Fecha aceptación    |
| `rejected_at`      | timestamptz |          No | Fecha rechazo       |
| `completed_at`     | timestamptz |          No | Fecha completado    |
| `status`           |        enum |          Sí | Estado              |
| `reject_reason`    |        text |          No | Razón rechazo       |
| `notes`            |        text |          No | Notas               |
| `metadata`         |       jsonb |          No | Metadata sanitizada |
| `created_at`       | timestamptz |          Sí | Creación            |
| `updated_at`       | timestamptz |          Sí | Actualización       |
| `archived_at`      | timestamptz |          No | Archivo             |

## Reglas

```text id="g0mydh"
- work_order_id debe pertenecer al tenant.
- assigned_user_id debe pertenecer a user_profiles con membership del tenant.
- supplier_id debe pertenecer al tenant y estar active.
- supplier blocked no puede recibir asignación nueva.
- assignment_type internalUser requiere assigned_user_id.
- assignment_type supplier requiere supplier_id.
```

---

# 6.7. `maintenance_work_order_tasks`

## Propósito

Tareas específicas dentro de una orden de trabajo.

## Campos

| Campo              |         Tipo | Obligatorio | Descripción                          |
| ------------------ | -----------: | ----------: | ------------------------------------ |
| `id`               |         UUID |          Sí | Identificador                        |
| `tenant_id`        |         UUID |          Sí | Tenant owner                         |
| `work_order_id`    |         UUID |          Sí | Orden                                |
| `task_number`      |          int |          Sí | Número secuencial dentro de la orden |
| `title`            | varchar(180) |          Sí | Título                               |
| `description`      |         text |          No | Descripción                          |
| `status`           |         enum |          Sí | Estado                               |
| `priority`         |         enum |          Sí | Prioridad                            |
| `assigned_user_id` |         UUID |          No | Responsable                          |
| `due_at`           |  timestamptz |          No | Fecha límite                         |
| `started_at`       |  timestamptz |          No | Inicio                               |
| `completed_at`     |  timestamptz |          No | Completado                           |
| `completed_by`     |         UUID |          No | Actor                                |
| `created_by`       |         UUID |          Sí | Actor                                |
| `updated_by`       |         UUID |          No | Actor                                |
| `created_at`       |  timestamptz |          Sí | Creación                             |
| `updated_at`       |  timestamptz |          Sí | Actualización                        |
| `archived_at`      |  timestamptz |          No | Archivo                              |
| `metadata`         |        jsonb |          No | Metadata sanitizada                  |

## Reglas

```text id="lap859"
- task_number es único por work_order_id.
- work_order_id debe pertenecer al tenant.
- completed requiere completed_at y completed_by.
- archived no se lista por defecto.
```

---

# 6.8. `maintenance_visits`

## Propósito

Registra visitas técnicas, inspecciones o ejecuciones en sitio.

## Campos

| Campo                |        Tipo | Obligatorio | Descripción           |
| -------------------- | ----------: | ----------: | --------------------- |
| `id`                 |        UUID |          Sí | Identificador         |
| `tenant_id`          |        UUID |          Sí | Tenant owner          |
| `work_order_id`      |        UUID |          Sí | Orden                 |
| `visit_type`         |        enum |          Sí | Tipo de visita        |
| `scheduled_at`       | timestamptz |          No | Fecha programada      |
| `started_at`         | timestamptz |          No | Inicio real           |
| `ended_at`           | timestamptz |          No | Fin real              |
| `visited_by_user_id` |        UUID |          No | Técnico interno       |
| `supplier_id`        |        UUID |          No | Proveedor             |
| `resident_person_id` |        UUID |          No | Residente relacionado |
| `property_unit_id`   |        UUID |          No | Unidad visitada       |
| `status`             |        enum |          Sí | Estado                |
| `notes`              |        text |          No | Notas sanitizadas     |
| `access_result`      |        enum |          No | Resultado de acceso   |
| `created_by`         |        UUID |          Sí | Actor                 |
| `updated_by`         |        UUID |          No | Actor                 |
| `created_at`         | timestamptz |          Sí | Creación              |
| `updated_at`         | timestamptz |          Sí | Actualización         |
| `archived_at`        | timestamptz |          No | Archivo               |
| `metadata`           |       jsonb |          No | Metadata sanitizada   |

## Reglas

```text id="vmdoru"
- work_order_id debe pertenecer al tenant.
- supplier_id debe pertenecer al tenant si existe.
- property_unit_id debe pertenecer al tenant si existe.
- completed requiere ended_at.
- cancelled requiere razón en metadata o campo futuro si se modela explícito.
```

---

# 6.9. `maintenance_evidence`

## Propósito

Evidencia asociada a orden, tarea, visita o cierre.

## Campos

| Campo                |        Tipo | Obligatorio | Descripción         |
| -------------------- | ----------: | ----------: | ------------------- |
| `id`                 |        UUID |          Sí | Identificador       |
| `tenant_id`          |        UUID |          Sí | Tenant owner        |
| `work_order_id`      |        UUID |          Sí | Orden               |
| `task_id`            |        UUID |          No | Tarea               |
| `visit_id`           |        UUID |          No | Visita              |
| `secure_document_id` |        UUID |          Sí | Documento seguro    |
| `evidence_type`      |        enum |          Sí | Tipo                |
| `evidence_stage`     |        enum |          Sí | Etapa               |
| `description`        |        text |          No | Descripción         |
| `visibility`         |        enum |          Sí | Visibilidad         |
| `status`             |        enum |          Sí | Estado              |
| `created_by`         |        UUID |          Sí | Actor               |
| `verified_by`        |        UUID |          No | Actor verificación  |
| `rejected_by`        |        UUID |          No | Actor rechazo       |
| `archived_by`        |        UUID |          No | Actor archivo       |
| `created_at`         | timestamptz |          Sí | Creación            |
| `verified_at`        | timestamptz |          No | Verificación        |
| `rejected_at`        | timestamptz |          No | Rechazo             |
| `archived_at`        | timestamptz |          No | Archivo             |
| `reject_reason`      |        text |          No | Razón rechazo       |
| `archive_reason`     |        text |          No | Razón archivo       |
| `metadata`           |       jsonb |          No | Metadata sanitizada |

## Reglas

```text id="s1w0zz"
- secure_document_id debe pertenecer al tenant.
- work_order_id debe pertenecer al tenant.
- task_id debe pertenecer al mismo work_order_id si existe.
- visit_id debe pertenecer al mismo work_order_id si existe.
- rejected requiere reject_reason.
- verified requiere verified_at y verified_by.
- rejected no soporta cierre.
- no se expone storageKey.
```

---

# 6.10. `maintenance_cost_estimates`

## Propósito

Registra costos estimados, aprobados y reales referenciales de mantenimiento.

No representa pagos.

## Campos

| Campo                 |          Tipo | Obligatorio | Descripción          |
| --------------------- | ------------: | ----------: | -------------------- |
| `id`                  |          UUID |          Sí | Identificador        |
| `tenant_id`           |          UUID |          Sí | Tenant owner         |
| `work_order_id`       |          UUID |          Sí | Orden                |
| `cost_type`           |          enum |          Sí | Tipo de costo        |
| `description`         |          text |          No | Descripción          |
| `estimated_amount`    | Decimal(12,2) |          No | Estimado             |
| `approved_amount`     | Decimal(12,2) |          No | Aprobado             |
| `actual_amount`       | Decimal(12,2) |          No | Real referencial     |
| `currency`            |          enum |          Sí | USD                  |
| `supplier_id`         |          UUID |          No | Proveedor            |
| `supplier_payable_id` |          UUID |          No | Payable vinculado    |
| `status`              |          enum |          Sí | Estado               |
| `created_by`          |          UUID |          Sí | Actor                |
| `approved_by`         |          UUID |          No | Actor aprobación     |
| `rejected_by`         |          UUID |          No | Actor rechazo        |
| `cancelled_by`        |          UUID |          No | Actor cancelación    |
| `created_at`          |   timestamptz |          Sí | Creación             |
| `updated_at`          |   timestamptz |          Sí | Actualización        |
| `submitted_at`        |   timestamptz |          No | Enviado a aprobación |
| `approved_at`         |   timestamptz |          No | Aprobado             |
| `rejected_at`         |   timestamptz |          No | Rechazado            |
| `cancelled_at`        |   timestamptz |          No | Cancelado            |
| `archived_at`         |   timestamptz |          No | Archivo              |
| `reject_reason`       |          text |          No | Razón rechazo        |
| `cancel_reason`       |          text |          No | Razón cancelación    |
| `metadata`            |         jsonb |          No | Metadata sanitizada  |

## Reglas

```text id="kzteya"
- estimated_amount >= 0.
- approved_amount >= 0.
- actual_amount >= 0.
- currency = USD en MVP.
- supplier_id debe pertenecer al tenant si existe.
- approved requiere approved_amount, approved_by y approved_at.
- rejected requiere rejected_by, rejected_at y reject_reason.
- cancelled requiere cancel_reason.
- convertedToPayable requiere supplier_payable_id o MaintenancePayableLink activo.
- no crea pago.
- no crea JournalEntry.
```

---

# 6.11. `maintenance_cost_approvals`

## Propósito

Registra aprobaciones explícitas de costos.

## Campos

| Campo              |        Tipo | Obligatorio | Descripción         |
| ------------------ | ----------: | ----------: | ------------------- |
| `id`               |        UUID |          Sí | Identificador       |
| `tenant_id`        |        UUID |          Sí | Tenant owner        |
| `work_order_id`    |        UUID |          Sí | Orden               |
| `cost_estimate_id` |        UUID |          Sí | Costo               |
| `approval_step`    |         int |          Sí | Paso                |
| `approval_status`  |        enum |          Sí | Estado              |
| `requested_by`     |        UUID |          Sí | Solicitante         |
| `approved_by`      |        UUID |          No | Aprobador           |
| `rejected_by`      |        UUID |          No | Rechazador          |
| `requested_at`     | timestamptz |          Sí | Fecha solicitud     |
| `approved_at`      | timestamptz |          No | Fecha aprobación    |
| `rejected_at`      | timestamptz |          No | Fecha rechazo       |
| `reason`           |        text |          No | Razón               |
| `metadata`         |       jsonb |          No | Metadata sanitizada |

## Reglas

```text id="vcqe9l"
- cost_estimate_id debe pertenecer al tenant.
- work_order_id debe pertenecer al tenant.
- pending único por cost_estimate_id y approval_step.
- approved requiere approved_by y approved_at.
- rejected requiere rejected_by, rejected_at y reason.
```

---

# 6.12. `maintenance_supplier_links`

## Propósito

Vincula una orden de trabajo con proveedor.

## Campos

| Campo           |        Tipo | Obligatorio | Descripción          |
| --------------- | ----------: | ----------: | -------------------- |
| `id`            |        UUID |          Sí | Identificador        |
| `tenant_id`     |        UUID |          Sí | Tenant owner         |
| `work_order_id` |        UUID |          Sí | Orden                |
| `supplier_id`   |        UUID |          Sí | Proveedor            |
| `link_type`     |        enum |          Sí | Tipo                 |
| `status`        |        enum |          Sí | Estado               |
| `linked_by`     |        UUID |          Sí | Actor                |
| `linked_at`     | timestamptz |          Sí | Fecha vínculo        |
| `unlinked_by`   |        UUID |          No | Actor desvincula     |
| `unlinked_at`   | timestamptz |          No | Fecha desvinculación |
| `unlink_reason` |        text |          No | Razón                |
| `metadata`      |       jsonb |          No | Metadata sanitizada  |

## Reglas

```text id="i24cte"
- work_order_id debe pertenecer al tenant.
- supplier_id debe pertenecer al tenant.
- supplier debe estar active.
- supplier blocked no puede recibir nuevo link assigned/executed.
- unlink requiere unlink_reason.
```

---

# 6.13. `maintenance_payable_links`

## Propósito

Vincula orden/costo de mantenimiento con una obligación por pagar de Supplier Payments.

## Campos

| Campo                 |        Tipo | Obligatorio | Descripción                  |
| --------------------- | ----------: | ----------: | ---------------------------- |
| `id`                  |        UUID |          Sí | Identificador                |
| `tenant_id`           |        UUID |          Sí | Tenant owner                 |
| `work_order_id`       |        UUID |          Sí | Orden                        |
| `cost_estimate_id`    |        UUID |          Sí | Costo aprobado               |
| `supplier_payable_id` |        UUID |          Sí | Payable en Supplier Payments |
| `status`              |        enum |          Sí | Estado                       |
| `created_by`          |        UUID |          Sí | Actor                        |
| `created_at`          | timestamptz |          Sí | Creación                     |
| `archived_by`         |        UUID |          No | Actor archivo                |
| `archived_at`         | timestamptz |          No | Archivo                      |
| `archive_reason`      |        text |          No | Razón                        |
| `metadata`            |       jsonb |          No | Metadata sanitizada          |

## Reglas

```text id="gfdgoi"
- work_order_id debe pertenecer al tenant.
- cost_estimate_id debe pertenecer al tenant.
- supplier_payable_id debe pertenecer al tenant.
- solo debe existir un link activo por cost_estimate_id.
- Maintenance no gobierna el estado del payable.
- Maintenance no crea SupplierPaymentOrder.
- Maintenance no marca paid.
```

---

# 6.14. `maintenance_comments`

## Propósito

Comentarios internos, visibles al solicitante o de sistema.

## Campos

| Campo                    |        Tipo | Obligatorio | Descripción           |
| ------------------------ | ----------: | ----------: | --------------------- |
| `id`                     |        UUID |          Sí | Identificador         |
| `tenant_id`              |        UUID |          Sí | Tenant owner          |
| `maintenance_request_id` |        UUID |          No | Solicitud             |
| `work_order_id`          |        UUID |          No | Orden                 |
| `comment_body`           |        text |          Sí | Comentario sanitizado |
| `visibility`             |        enum |          Sí | Visibilidad           |
| `created_by`             |        UUID |          Sí | Actor                 |
| `created_at`             | timestamptz |          Sí | Creación              |
| `updated_at`             | timestamptz |          Sí | Actualización         |
| `archived_at`            | timestamptz |          No | Archivo               |
| `metadata`               |       jsonb |          No | Metadata sanitizada   |

## Reglas

```text id="xpxazf"
- Debe vincularse a maintenance_request_id o work_order_id.
- internal no se expone en /me.
- visibleToRequester se puede exponer en /me si el usuario es propietario de la solicitud.
- system solo se crea server-side.
- comment_body debe sanitizar HTML/script.
```

---

# 6.15. `maintenance_status_history`

## Propósito

Historial de cambios de estado.

## Campos

| Campo         |        Tipo | Obligatorio | Descripción         |
| ------------- | ----------: | ----------: | ------------------- |
| `id`          |        UUID |          Sí | Identificador       |
| `tenant_id`   |        UUID |          Sí | Tenant owner        |
| `entity_type` |        enum |          Sí | Tipo de entidad     |
| `entity_id`   |        UUID |          Sí | ID de entidad       |
| `from_status` | varchar(80) |          No | Estado anterior     |
| `to_status`   | varchar(80) |          Sí | Estado nuevo        |
| `changed_by`  |        UUID |          Sí | Actor               |
| `changed_at`  | timestamptz |          Sí | Fecha               |
| `reason`      |        text |          No | Razón               |
| `metadata`    |       jsonb |          No | Metadata sanitizada |

## Reglas

```text id="xaslad"
- entity_id debe pertenecer al tenant según entity_type.
- Se crea en toda transición crítica.
- No se borra físicamente.
- No debe contener datos sensibles completos.
```

---

## 7. Enums

### 7.1. Categorías y activos

```text id="th8fcn"
MaintenanceCategoryStatus:
- active
- inactive
- archived

MaintenanceAssetType:
- commonArea
- propertyUnit
- equipment
- infrastructure
- accessControl
- waterSystem
- electrical
- security
- garden
- furniture
- technology
- other

MaintenanceAssetStatus:
- active
- inactive
- underMaintenance
- decommissioned
- archived

MaintenanceAssetCriticality:
- low
- medium
- high
- critical
```

---

### 7.2. Solicitudes

```text id="jc1b4v"
MaintenanceRequestSource:
- residentPortal
- tenantAdmin
- maintenanceManager
- internalInspection
- meetingResolution
- communicationFollowUp
- manual
- system

MaintenanceRequestVisibility:
- requesterOnly
- administrative
- boardVisible

MaintenanceRequestStatus:
- draft
- submitted
- underReview
- accepted
- rejected
- convertedToWorkOrder
- cancelled
- closed
- archived

MaintenanceAttachmentType:
- photo
- video
- document
- inspectionNote
- other

MaintenanceAttachmentStatus:
- active
- archived
```

---

### 7.3. Prioridad y severidad

```text id="w4q66x"
MaintenancePriority:
- low
- normal
- high
- urgent
- emergency

MaintenanceSeverity:
- minor
- moderate
- major
- critical
- safetyRisk
```

---

### 7.4. Órdenes, asignaciones, tareas y visitas

```text id="xlbh0v"
MaintenanceWorkOrderType:
- corrective
- preventiveBasic
- inspection
- improvement
- emergency
- followUp
- other

MaintenanceExecutionMode:
- internal
- supplier
- mixed
- selfManaged

MaintenanceWorkOrderStatus:
- draft
- open
- pendingAssignment
- assigned
- scheduled
- inProgress
- onHold
- pendingCostApproval
- pendingResidentConfirmation
- completed
- closed
- reopened
- cancelled
- archived

MaintenanceAssignmentType:
- internalUser
- supplier
- team
- other

MaintenanceAssignmentStatus:
- assigned
- accepted
- rejected
- completed
- cancelled
- archived

MaintenanceTaskStatus:
- pending
- inProgress
- completed
- blocked
- cancelled
- archived

MaintenanceVisitType:
- inspection
- diagnosis
- repair
- verification
- followUp
- other

MaintenanceVisitStatus:
- scheduled
- inProgress
- completed
- missed
- cancelled
- rescheduled
- archived

MaintenanceVisitAccessResult:
- accessGranted
- accessDenied
- residentAbsent
- notRequired
- rescheduled
- other
```

---

### 7.5. Evidencia, costos, links y comentarios

```text id="q29hrb"
MaintenanceEvidenceType:
- beforePhoto
- duringPhoto
- afterPhoto
- technicalReport
- residentConfirmation
- supplierInvoice
- supplierQuote
- materialReceipt
- other

MaintenanceEvidenceStage:
- request
- diagnosis
- execution
- completion
- closure
- reopening

MaintenanceEvidenceVisibility:
- internal
- requesterVisible
- boardVisible

MaintenanceEvidenceStatus:
- active
- verified
- rejected
- archived

MaintenanceCostType:
- labor
- materials
- supplierService
- transport
- emergency
- other

MaintenanceCostEstimateStatus:
- draft
- submitted
- approved
- rejected
- cancelled
- convertedToPayable
- archived

MaintenanceCostApprovalStatus:
- pending
- approved
- rejected
- cancelled

MaintenanceSupplierLinkType:
- quoted
- assigned
- executed
- invoiced
- other

MaintenanceSupplierLinkStatus:
- active
- unlinked
- archived

MaintenancePayableLinkStatus:
- active
- archived
- failed

MaintenanceCommentVisibility:
- internal
- visibleToRequester
- visibleToBoard
- system

MaintenanceStatusHistoryEntityType:
- maintenanceRequest
- maintenanceWorkOrder
- maintenanceTask
- maintenanceVisit
- maintenanceCostEstimate

Currency:
- USD
```

---

## 8. Prisma schema preliminar

> Este bloque es una guía inicial. El schema final puede ajustarse durante `plan.md`, `api-contract.md`, `test-plan.md` y la implementación real.

```prisma id="vlog5x"
enum MaintenanceCategoryStatus {
  ACTIVE   @map("active")
  INACTIVE @map("inactive")
  ARCHIVED @map("archived")
}

enum MaintenanceAssetType {
  COMMON_AREA     @map("commonArea")
  PROPERTY_UNIT   @map("propertyUnit")
  EQUIPMENT       @map("equipment")
  INFRASTRUCTURE  @map("infrastructure")
  ACCESS_CONTROL  @map("accessControl")
  WATER_SYSTEM    @map("waterSystem")
  ELECTRICAL      @map("electrical")
  SECURITY        @map("security")
  GARDEN          @map("garden")
  FURNITURE       @map("furniture")
  TECHNOLOGY      @map("technology")
  OTHER           @map("other")
}

enum MaintenanceAssetStatus {
  ACTIVE            @map("active")
  INACTIVE          @map("inactive")
  UNDER_MAINTENANCE @map("underMaintenance")
  DECOMMISSIONED    @map("decommissioned")
  ARCHIVED          @map("archived")
}

enum MaintenanceAssetCriticality {
  LOW      @map("low")
  MEDIUM   @map("medium")
  HIGH     @map("high")
  CRITICAL @map("critical")
}

enum MaintenanceRequestSource {
  RESIDENT_PORTAL         @map("residentPortal")
  TENANT_ADMIN            @map("tenantAdmin")
  MAINTENANCE_MANAGER     @map("maintenanceManager")
  INTERNAL_INSPECTION     @map("internalInspection")
  MEETING_RESOLUTION      @map("meetingResolution")
  COMMUNICATION_FOLLOW_UP @map("communicationFollowUp")
  MANUAL                  @map("manual")
  SYSTEM                  @map("system")
}

enum MaintenanceRequestVisibility {
  REQUESTER_ONLY @map("requesterOnly")
  ADMINISTRATIVE @map("administrative")
  BOARD_VISIBLE  @map("boardVisible")
}

enum MaintenanceRequestStatus {
  DRAFT                  @map("draft")
  SUBMITTED              @map("submitted")
  UNDER_REVIEW           @map("underReview")
  ACCEPTED               @map("accepted")
  REJECTED               @map("rejected")
  CONVERTED_TO_WORK_ORDER @map("convertedToWorkOrder")
  CANCELLED              @map("cancelled")
  CLOSED                 @map("closed")
  ARCHIVED               @map("archived")
}

enum MaintenancePriority {
  LOW       @map("low")
  NORMAL    @map("normal")
  HIGH      @map("high")
  URGENT    @map("urgent")
  EMERGENCY @map("emergency")
}

enum MaintenanceSeverity {
  MINOR       @map("minor")
  MODERATE    @map("moderate")
  MAJOR       @map("major")
  CRITICAL    @map("critical")
  SAFETY_RISK @map("safetyRisk")
}

enum MaintenanceAttachmentType {
  PHOTO           @map("photo")
  VIDEO           @map("video")
  DOCUMENT        @map("document")
  INSPECTION_NOTE @map("inspectionNote")
  OTHER           @map("other")
}

enum MaintenanceAttachmentStatus {
  ACTIVE   @map("active")
  ARCHIVED @map("archived")
}

enum MaintenanceWorkOrderType {
  CORRECTIVE       @map("corrective")
  PREVENTIVE_BASIC @map("preventiveBasic")
  INSPECTION       @map("inspection")
  IMPROVEMENT      @map("improvement")
  EMERGENCY        @map("emergency")
  FOLLOW_UP        @map("followUp")
  OTHER            @map("other")
}

enum MaintenanceExecutionMode {
  INTERNAL     @map("internal")
  SUPPLIER     @map("supplier")
  MIXED        @map("mixed")
  SELF_MANAGED @map("selfManaged")
}

enum MaintenanceWorkOrderStatus {
  DRAFT                         @map("draft")
  OPEN                          @map("open")
  PENDING_ASSIGNMENT            @map("pendingAssignment")
  ASSIGNED                      @map("assigned")
  SCHEDULED                     @map("scheduled")
  IN_PROGRESS                   @map("inProgress")
  ON_HOLD                       @map("onHold")
  PENDING_COST_APPROVAL         @map("pendingCostApproval")
  PENDING_RESIDENT_CONFIRMATION @map("pendingResidentConfirmation")
  COMPLETED                     @map("completed")
  CLOSED                        @map("closed")
  REOPENED                      @map("reopened")
  CANCELLED                     @map("cancelled")
  ARCHIVED                      @map("archived")
}

enum MaintenanceAssignmentType {
  INTERNAL_USER @map("internalUser")
  SUPPLIER      @map("supplier")
  TEAM          @map("team")
  OTHER         @map("other")
}

enum MaintenanceAssignmentStatus {
  ASSIGNED  @map("assigned")
  ACCEPTED  @map("accepted")
  REJECTED  @map("rejected")
  COMPLETED @map("completed")
  CANCELLED @map("cancelled")
  ARCHIVED  @map("archived")
}

enum MaintenanceTaskStatus {
  PENDING     @map("pending")
  IN_PROGRESS @map("inProgress")
  COMPLETED   @map("completed")
  BLOCKED     @map("blocked")
  CANCELLED   @map("cancelled")
  ARCHIVED    @map("archived")
}

enum MaintenanceVisitType {
  INSPECTION   @map("inspection")
  DIAGNOSIS    @map("diagnosis")
  REPAIR       @map("repair")
  VERIFICATION @map("verification")
  FOLLOW_UP    @map("followUp")
  OTHER        @map("other")
}

enum MaintenanceVisitStatus {
  SCHEDULED   @map("scheduled")
  IN_PROGRESS @map("inProgress")
  COMPLETED   @map("completed")
  MISSED       @map("missed")
  CANCELLED   @map("cancelled")
  RESCHEDULED @map("rescheduled")
  ARCHIVED    @map("archived")
}

enum MaintenanceVisitAccessResult {
  ACCESS_GRANTED  @map("accessGranted")
  ACCESS_DENIED   @map("accessDenied")
  RESIDENT_ABSENT @map("residentAbsent")
  NOT_REQUIRED    @map("notRequired")
  RESCHEDULED     @map("rescheduled")
  OTHER           @map("other")
}

enum MaintenanceEvidenceType {
  BEFORE_PHOTO          @map("beforePhoto")
  DURING_PHOTO          @map("duringPhoto")
  AFTER_PHOTO           @map("afterPhoto")
  TECHNICAL_REPORT      @map("technicalReport")
  RESIDENT_CONFIRMATION @map("residentConfirmation")
  SUPPLIER_INVOICE      @map("supplierInvoice")
  SUPPLIER_QUOTE        @map("supplierQuote")
  MATERIAL_RECEIPT      @map("materialReceipt")
  OTHER                 @map("other")
}

enum MaintenanceEvidenceStage {
  REQUEST    @map("request")
  DIAGNOSIS  @map("diagnosis")
  EXECUTION  @map("execution")
  COMPLETION @map("completion")
  CLOSURE    @map("closure")
  REOPENING  @map("reopening")
}

enum MaintenanceEvidenceVisibility {
  INTERNAL          @map("internal")
  REQUESTER_VISIBLE @map("requesterVisible")
  BOARD_VISIBLE     @map("boardVisible")
}

enum MaintenanceEvidenceStatus {
  ACTIVE   @map("active")
  VERIFIED @map("verified")
  REJECTED @map("rejected")
  ARCHIVED @map("archived")
}

enum MaintenanceCostType {
  LABOR            @map("labor")
  MATERIALS        @map("materials")
  SUPPLIER_SERVICE @map("supplierService")
  TRANSPORT        @map("transport")
  EMERGENCY        @map("emergency")
  OTHER            @map("other")
}

enum MaintenanceCostEstimateStatus {
  DRAFT                @map("draft")
  SUBMITTED            @map("submitted")
  APPROVED             @map("approved")
  REJECTED             @map("rejected")
  CANCELLED            @map("cancelled")
  CONVERTED_TO_PAYABLE @map("convertedToPayable")
  ARCHIVED             @map("archived")
}

enum MaintenanceCostApprovalStatus {
  PENDING   @map("pending")
  APPROVED  @map("approved")
  REJECTED  @map("rejected")
  CANCELLED @map("cancelled")
}

enum MaintenanceSupplierLinkType {
  QUOTED   @map("quoted")
  ASSIGNED @map("assigned")
  EXECUTED @map("executed")
  INVOICED @map("invoiced")
  OTHER    @map("other")
}

enum MaintenanceSupplierLinkStatus {
  ACTIVE   @map("active")
  UNLINKED @map("unlinked")
  ARCHIVED @map("archived")
}

enum MaintenancePayableLinkStatus {
  ACTIVE   @map("active")
  ARCHIVED @map("archived")
  FAILED   @map("failed")
}

enum MaintenanceCommentVisibility {
  INTERNAL             @map("internal")
  VISIBLE_TO_REQUESTER @map("visibleToRequester")
  VISIBLE_TO_BOARD     @map("visibleToBoard")
  SYSTEM               @map("system")
}

enum MaintenanceStatusHistoryEntityType {
  MAINTENANCE_REQUEST       @map("maintenanceRequest")
  MAINTENANCE_WORK_ORDER    @map("maintenanceWorkOrder")
  MAINTENANCE_TASK          @map("maintenanceTask")
  MAINTENANCE_VISIT         @map("maintenanceVisit")
  MAINTENANCE_COST_ESTIMATE @map("maintenanceCostEstimate")
}
```

---

## 9. Prisma models preliminares

```prisma id="z6s2up"
model MaintenanceCategory {
  id                        String                    @id @default(uuid()) @db.Uuid
  tenantId                  String                    @map("tenant_id") @db.Uuid
  categoryCode              String                    @map("category_code") @db.VarChar(50)
  categoryName              String                    @map("category_name") @db.VarChar(150)
  description               String?
  defaultPriority           MaintenancePriority       @default(NORMAL) @map("default_priority")
  defaultSeverity           MaintenanceSeverity       @default(MODERATE) @map("default_severity")
  requiresApprovalByDefault Boolean                   @default(false) @map("requires_approval_by_default")
  allowsResidentRequests    Boolean                   @default(true) @map("allows_resident_requests")
  status                    MaintenanceCategoryStatus @default(ACTIVE)
  createdBy                 String                    @map("created_by") @db.Uuid
  updatedBy                 String?                   @map("updated_by") @db.Uuid
  archivedBy                String?                   @map("archived_by") @db.Uuid
  createdAt                 DateTime                  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt                 DateTime                  @updatedAt @map("updated_at") @db.Timestamptz
  archivedAt                DateTime?                 @map("archived_at") @db.Timestamptz
  archiveReason             String?                   @map("archive_reason")
  metadata                  Json?

  tenant                    Tenant                    @relation(fields: [tenantId], references: [id])

  requests                  MaintenanceRequest[]
  workOrders                MaintenanceWorkOrder[]

  @@index([tenantId, status])
  @@index([tenantId, categoryCode])
  @@map("maintenance_categories")
}

model MaintenanceAsset {
  id                  String                     @id @default(uuid()) @db.Uuid
  tenantId            String                     @map("tenant_id") @db.Uuid
  assetCode           String                     @map("asset_code") @db.VarChar(50)
  assetName           String                     @map("asset_name") @db.VarChar(180)
  assetType           MaintenanceAssetType       @map("asset_type")
  description         String?
  locationDescription String?                    @map("location_description")
  propertyUnitId      String?                    @map("property_unit_id") @db.Uuid
  commonAreaId        String?                    @map("common_area_id") @db.Uuid
  parentAssetId       String?                    @map("parent_asset_id") @db.Uuid
  status              MaintenanceAssetStatus     @default(ACTIVE)
  criticality         MaintenanceAssetCriticality @default(MEDIUM)
  createdBy           String                     @map("created_by") @db.Uuid
  updatedBy           String?                    @map("updated_by") @db.Uuid
  archivedBy          String?                    @map("archived_by") @db.Uuid
  createdAt           DateTime                   @default(now()) @map("created_at") @db.Timestamptz
  updatedAt           DateTime                   @updatedAt @map("updated_at") @db.Timestamptz
  archivedAt          DateTime?                  @map("archived_at") @db.Timestamptz
  archiveReason       String?                    @map("archive_reason")
  metadata            Json?

  tenant              Tenant                     @relation(fields: [tenantId], references: [id])
  parentAsset         MaintenanceAsset?          @relation("MaintenanceAssetHierarchy", fields: [parentAssetId], references: [id])
  childAssets         MaintenanceAsset[]         @relation("MaintenanceAssetHierarchy")

  requests            MaintenanceRequest[]
  workOrders          MaintenanceWorkOrder[]

  @@index([tenantId, assetCode])
  @@index([tenantId, assetType])
  @@index([tenantId, status])
  @@index([tenantId, propertyUnitId])
  @@index([tenantId, commonAreaId])
  @@index([tenantId, parentAssetId])
  @@map("maintenance_assets")
}

model MaintenanceRequest {
  id                    String                       @id @default(uuid()) @db.Uuid
  tenantId              String                       @map("tenant_id") @db.Uuid
  requestNumber         String                       @map("request_number") @db.VarChar(50)
  title                 String                       @db.VarChar(180)
  description           String
  categoryId            String                       @map("category_id") @db.Uuid
  assetId               String?                      @map("asset_id") @db.Uuid
  propertyUnitId        String?                      @map("property_unit_id") @db.Uuid
  commonAreaId          String?                      @map("common_area_id") @db.Uuid
  reportedByUserId      String                       @map("reported_by_user_id") @db.Uuid
  reportedByPersonId    String?                      @map("reported_by_person_id") @db.Uuid
  requestSource         MaintenanceRequestSource     @map("request_source")
  visibility            MaintenanceRequestVisibility @default(REQUESTER_ONLY)
  priority              MaintenancePriority          @default(NORMAL)
  severity              MaintenanceSeverity          @default(MODERATE)
  status                MaintenanceRequestStatus     @default(SUBMITTED)
  duplicateOfRequestId  String?                      @map("duplicate_of_request_id") @db.Uuid
  acceptedAsWorkOrderId String?                      @map("accepted_as_work_order_id") @db.Uuid
  rejectedReason        String?                      @map("rejected_reason")
  cancelReason          String?                      @map("cancel_reason")
  closedReason          String?                      @map("closed_reason")
  createdAt             DateTime                     @default(now()) @map("created_at") @db.Timestamptz
  updatedAt             DateTime                     @updatedAt @map("updated_at") @db.Timestamptz
  submittedAt           DateTime?                    @map("submitted_at") @db.Timestamptz
  reviewedAt            DateTime?                    @map("reviewed_at") @db.Timestamptz
  reviewedBy            String?                      @map("reviewed_by") @db.Uuid
  acceptedAt            DateTime?                    @map("accepted_at") @db.Timestamptz
  acceptedBy            String?                      @map("accepted_by") @db.Uuid
  rejectedAt            DateTime?                    @map("rejected_at") @db.Timestamptz
  rejectedBy            String?                      @map("rejected_by") @db.Uuid
  cancelledAt           DateTime?                    @map("cancelled_at") @db.Timestamptz
  cancelledBy           String?                      @map("cancelled_by") @db.Uuid
  closedAt              DateTime?                    @map("closed_at") @db.Timestamptz
  closedBy              String?                      @map("closed_by") @db.Uuid
  archivedAt            DateTime?                    @map("archived_at") @db.Timestamptz
  archivedBy            String?                      @map("archived_by") @db.Uuid
  metadata              Json?

  tenant                Tenant                       @relation(fields: [tenantId], references: [id])
  category              MaintenanceCategory          @relation(fields: [categoryId], references: [id])
  asset                 MaintenanceAsset?            @relation(fields: [assetId], references: [id])
  duplicateOfRequest    MaintenanceRequest?          @relation("MaintenanceRequestDuplicate", fields: [duplicateOfRequestId], references: [id])
  duplicateRequests     MaintenanceRequest[]         @relation("MaintenanceRequestDuplicate")

  attachments           MaintenanceRequestAttachment[]
  comments              MaintenanceComment[]
  workOrders            MaintenanceWorkOrder[]

  @@index([tenantId, requestNumber])
  @@index([tenantId, status])
  @@index([tenantId, categoryId])
  @@index([tenantId, assetId])
  @@index([tenantId, propertyUnitId])
  @@index([tenantId, commonAreaId])
  @@index([tenantId, reportedByUserId])
  @@index([tenantId, reportedByPersonId])
  @@index([tenantId, priority])
  @@index([tenantId, severity])
  @@index([tenantId, createdAt])
  @@map("maintenance_requests")
}

model MaintenanceRequestAttachment {
  id                   String                      @id @default(uuid()) @db.Uuid
  tenantId             String                      @map("tenant_id") @db.Uuid
  maintenanceRequestId String                      @map("maintenance_request_id") @db.Uuid
  secureDocumentId     String                      @map("secure_document_id") @db.Uuid
  attachmentType       MaintenanceAttachmentType   @map("attachment_type")
  description          String?
  visibility           MaintenanceEvidenceVisibility @default(REQUESTER_VISIBLE)
  status               MaintenanceAttachmentStatus @default(ACTIVE)
  createdBy            String                      @map("created_by") @db.Uuid
  archivedBy           String?                     @map("archived_by") @db.Uuid
  createdAt            DateTime                    @default(now()) @map("created_at") @db.Timestamptz
  archivedAt           DateTime?                   @map("archived_at") @db.Timestamptz
  archiveReason        String?                     @map("archive_reason")
  metadata             Json?

  tenant               Tenant                      @relation(fields: [tenantId], references: [id])
  maintenanceRequest   MaintenanceRequest          @relation(fields: [maintenanceRequestId], references: [id])

  @@index([tenantId, maintenanceRequestId])
  @@index([tenantId, secureDocumentId])
  @@index([tenantId, status])
  @@map("maintenance_request_attachments")
}
```

---

## 10. Prisma models — órdenes y operación

```prisma id="qp3p2c"
model MaintenanceWorkOrder {
  id                       String                       @id @default(uuid()) @db.Uuid
  tenantId                 String                       @map("tenant_id") @db.Uuid
  workOrderNumber          String                       @map("work_order_number") @db.VarChar(50)
  maintenanceRequestId     String?                      @map("maintenance_request_id") @db.Uuid
  title                    String                       @db.VarChar(180)
  description              String
  categoryId               String                       @map("category_id") @db.Uuid
  assetId                  String?                      @map("asset_id") @db.Uuid
  propertyUnitId           String?                      @map("property_unit_id") @db.Uuid
  commonAreaId             String?                      @map("common_area_id") @db.Uuid
  workOrderType            MaintenanceWorkOrderType     @map("work_order_type")
  executionMode            MaintenanceExecutionMode     @map("execution_mode")
  priority                 MaintenancePriority          @default(NORMAL)
  severity                 MaintenanceSeverity          @default(MODERATE)
  status                   MaintenanceWorkOrderStatus   @default(OPEN)
  scheduledStartAt         DateTime?                    @map("scheduled_start_at") @db.Timestamptz
  scheduledEndAt           DateTime?                    @map("scheduled_end_at") @db.Timestamptz
  actualStartAt            DateTime?                    @map("actual_start_at") @db.Timestamptz
  actualEndAt              DateTime?                    @map("actual_end_at") @db.Timestamptz
  assignedInternalUserId   String?                      @map("assigned_internal_user_id") @db.Uuid
  supplierId               String?                      @map("supplier_id") @db.Uuid
  estimatedCostAmount      Decimal?                     @map("estimated_cost_amount") @db.Decimal(12, 2)
  approvedCostAmount       Decimal?                     @map("approved_cost_amount") @db.Decimal(12, 2)
  actualCostAmount         Decimal?                     @map("actual_cost_amount") @db.Decimal(12, 2)
  currency                 Currency                     @default(USD)
  requiresCostApproval     Boolean                      @default(false) @map("requires_cost_approval")
  costApprovalStatus       MaintenanceCostApprovalStatus? @map("cost_approval_status")
  completionSummary        String?                      @map("completion_summary")
  closureEvidenceRequired  Boolean                      @default(true) @map("closure_evidence_required")
  closureReason            String?                      @map("closure_reason")
  closedBy                 String?                      @map("closed_by") @db.Uuid
  closedAt                 DateTime?                    @map("closed_at") @db.Timestamptz
  reopenedBy               String?                      @map("reopened_by") @db.Uuid
  reopenedAt               DateTime?                    @map("reopened_at") @db.Timestamptz
  reopenReason             String?                      @map("reopen_reason")
  cancelledBy              String?                      @map("cancelled_by") @db.Uuid
  cancelledAt              DateTime?                    @map("cancelled_at") @db.Timestamptz
  cancelReason             String?                      @map("cancel_reason")
  createdBy                String                       @map("created_by") @db.Uuid
  updatedBy                String?                      @map("updated_by") @db.Uuid
  archivedBy               String?                      @map("archived_by") @db.Uuid
  createdAt                DateTime                     @default(now()) @map("created_at") @db.Timestamptz
  updatedAt                DateTime                     @updatedAt @map("updated_at") @db.Timestamptz
  archivedAt               DateTime?                    @map("archived_at") @db.Timestamptz
  archiveReason            String?                      @map("archive_reason")
  metadata                 Json?

  tenant                   Tenant                       @relation(fields: [tenantId], references: [id])
  maintenanceRequest       MaintenanceRequest?          @relation(fields: [maintenanceRequestId], references: [id])
  category                 MaintenanceCategory          @relation(fields: [categoryId], references: [id])
  asset                    MaintenanceAsset?            @relation(fields: [assetId], references: [id])

  assignments              MaintenanceWorkOrderAssignment[]
  tasks                    MaintenanceWorkOrderTask[]
  visits                   MaintenanceVisit[]
  evidence                 MaintenanceEvidence[]
  costs                    MaintenanceCostEstimate[]
  comments                 MaintenanceComment[]
  supplierLinks            MaintenanceSupplierLink[]
  payableLinks             MaintenancePayableLink[]

  @@index([tenantId, workOrderNumber])
  @@index([tenantId, status])
  @@index([tenantId, categoryId])
  @@index([tenantId, assetId])
  @@index([tenantId, propertyUnitId])
  @@index([tenantId, commonAreaId])
  @@index([tenantId, supplierId])
  @@index([tenantId, assignedInternalUserId])
  @@index([tenantId, scheduledStartAt])
  @@index([tenantId, closedAt])
  @@index([tenantId, priority])
  @@index([tenantId, severity])
  @@map("maintenance_work_orders")
}

model MaintenanceWorkOrderAssignment {
  id             String                      @id @default(uuid()) @db.Uuid
  tenantId       String                      @map("tenant_id") @db.Uuid
  workOrderId    String                      @map("work_order_id") @db.Uuid
  assignmentType MaintenanceAssignmentType   @map("assignment_type")
  assignedUserId String?                     @map("assigned_user_id") @db.Uuid
  supplierId     String?                     @map("supplier_id") @db.Uuid
  assignedBy     String                      @map("assigned_by") @db.Uuid
  assignedAt     DateTime                    @default(now()) @map("assigned_at") @db.Timestamptz
  acceptedAt     DateTime?                   @map("accepted_at") @db.Timestamptz
  rejectedAt     DateTime?                   @map("rejected_at") @db.Timestamptz
  completedAt    DateTime?                   @map("completed_at") @db.Timestamptz
  status         MaintenanceAssignmentStatus @default(ASSIGNED)
  rejectReason   String?                     @map("reject_reason")
  notes          String?
  metadata       Json?
  createdAt      DateTime                    @default(now()) @map("created_at") @db.Timestamptz
  updatedAt      DateTime                    @updatedAt @map("updated_at") @db.Timestamptz
  archivedAt     DateTime?                   @map("archived_at") @db.Timestamptz

  tenant         Tenant                      @relation(fields: [tenantId], references: [id])
  workOrder      MaintenanceWorkOrder        @relation(fields: [workOrderId], references: [id])

  @@index([tenantId, workOrderId])
  @@index([tenantId, assignedUserId])
  @@index([tenantId, supplierId])
  @@index([tenantId, status])
  @@map("maintenance_work_order_assignments")
}

model MaintenanceWorkOrderTask {
  id             String                @id @default(uuid()) @db.Uuid
  tenantId       String                @map("tenant_id") @db.Uuid
  workOrderId    String                @map("work_order_id") @db.Uuid
  taskNumber     Int                   @map("task_number")
  title          String                @db.VarChar(180)
  description    String?
  status         MaintenanceTaskStatus @default(PENDING)
  priority       MaintenancePriority   @default(NORMAL)
  assignedUserId String?               @map("assigned_user_id") @db.Uuid
  dueAt          DateTime?             @map("due_at") @db.Timestamptz
  startedAt      DateTime?             @map("started_at") @db.Timestamptz
  completedAt    DateTime?             @map("completed_at") @db.Timestamptz
  completedBy    String?               @map("completed_by") @db.Uuid
  createdBy      String                @map("created_by") @db.Uuid
  updatedBy      String?               @map("updated_by") @db.Uuid
  createdAt      DateTime              @default(now()) @map("created_at") @db.Timestamptz
  updatedAt      DateTime              @updatedAt @map("updated_at") @db.Timestamptz
  archivedAt     DateTime?             @map("archived_at") @db.Timestamptz
  metadata       Json?

  tenant         Tenant                @relation(fields: [tenantId], references: [id])
  workOrder      MaintenanceWorkOrder  @relation(fields: [workOrderId], references: [id])
  evidence       MaintenanceEvidence[]

  @@index([tenantId, workOrderId])
  @@index([tenantId, status])
  @@index([tenantId, assignedUserId])
  @@unique([workOrderId, taskNumber])
  @@map("maintenance_work_order_tasks")
}

model MaintenanceVisit {
  id               String                        @id @default(uuid()) @db.Uuid
  tenantId         String                        @map("tenant_id") @db.Uuid
  workOrderId      String                        @map("work_order_id") @db.Uuid
  visitType        MaintenanceVisitType          @map("visit_type")
  scheduledAt      DateTime?                     @map("scheduled_at") @db.Timestamptz
  startedAt        DateTime?                     @map("started_at") @db.Timestamptz
  endedAt          DateTime?                     @map("ended_at") @db.Timestamptz
  visitedByUserId  String?                       @map("visited_by_user_id") @db.Uuid
  supplierId       String?                       @map("supplier_id") @db.Uuid
  residentPersonId String?                       @map("resident_person_id") @db.Uuid
  propertyUnitId   String?                       @map("property_unit_id") @db.Uuid
  status           MaintenanceVisitStatus        @default(SCHEDULED)
  notes            String?
  accessResult     MaintenanceVisitAccessResult? @map("access_result")
  createdBy        String                        @map("created_by") @db.Uuid
  updatedBy        String?                       @map("updated_by") @db.Uuid
  createdAt        DateTime                      @default(now()) @map("created_at") @db.Timestamptz
  updatedAt        DateTime                      @updatedAt @map("updated_at") @db.Timestamptz
  archivedAt       DateTime?                     @map("archived_at") @db.Timestamptz
  metadata         Json?

  tenant           Tenant                        @relation(fields: [tenantId], references: [id])
  workOrder        MaintenanceWorkOrder          @relation(fields: [workOrderId], references: [id])
  evidence         MaintenanceEvidence[]

  @@index([tenantId, workOrderId])
  @@index([tenantId, scheduledAt])
  @@index([tenantId, status])
  @@index([tenantId, visitedByUserId])
  @@index([tenantId, supplierId])
  @@index([tenantId, propertyUnitId])
  @@map("maintenance_visits")
}
```

---

## 11. Prisma models — evidencia, costos, links, comentarios e historial

```prisma id="tb2n7m"
model MaintenanceEvidence {
  id               String                        @id @default(uuid()) @db.Uuid
  tenantId         String                        @map("tenant_id") @db.Uuid
  workOrderId      String                        @map("work_order_id") @db.Uuid
  taskId           String?                       @map("task_id") @db.Uuid
  visitId          String?                       @map("visit_id") @db.Uuid
  secureDocumentId String                        @map("secure_document_id") @db.Uuid
  evidenceType     MaintenanceEvidenceType       @map("evidence_type")
  evidenceStage    MaintenanceEvidenceStage      @map("evidence_stage")
  description      String?
  visibility       MaintenanceEvidenceVisibility @default(INTERNAL)
  status           MaintenanceEvidenceStatus     @default(ACTIVE)
  createdBy        String                        @map("created_by") @db.Uuid
  verifiedBy       String?                       @map("verified_by") @db.Uuid
  rejectedBy       String?                       @map("rejected_by") @db.Uuid
  archivedBy       String?                       @map("archived_by") @db.Uuid
  createdAt        DateTime                      @default(now()) @map("created_at") @db.Timestamptz
  verifiedAt       DateTime?                     @map("verified_at") @db.Timestamptz
  rejectedAt       DateTime?                     @map("rejected_at") @db.Timestamptz
  archivedAt       DateTime?                     @map("archived_at") @db.Timestamptz
  rejectReason     String?                       @map("reject_reason")
  archiveReason    String?                       @map("archive_reason")
  metadata         Json?

  tenant           Tenant                        @relation(fields: [tenantId], references: [id])
  workOrder        MaintenanceWorkOrder          @relation(fields: [workOrderId], references: [id])
  task             MaintenanceWorkOrderTask?     @relation(fields: [taskId], references: [id])
  visit            MaintenanceVisit?             @relation(fields: [visitId], references: [id])

  @@index([tenantId, workOrderId])
  @@index([tenantId, taskId])
  @@index([tenantId, visitId])
  @@index([tenantId, secureDocumentId])
  @@index([tenantId, status])
  @@index([tenantId, evidenceStage])
  @@index([tenantId, visibility])
  @@map("maintenance_evidence")
}

model MaintenanceCostEstimate {
  id                String                         @id @default(uuid()) @db.Uuid
  tenantId          String                         @map("tenant_id") @db.Uuid
  workOrderId       String                         @map("work_order_id") @db.Uuid
  costType          MaintenanceCostType            @map("cost_type")
  description       String?
  estimatedAmount   Decimal?                       @map("estimated_amount") @db.Decimal(12, 2)
  approvedAmount    Decimal?                       @map("approved_amount") @db.Decimal(12, 2)
  actualAmount      Decimal?                       @map("actual_amount") @db.Decimal(12, 2)
  currency          Currency                       @default(USD)
  supplierId        String?                        @map("supplier_id") @db.Uuid
  supplierPayableId String?                        @map("supplier_payable_id") @db.Uuid
  status            MaintenanceCostEstimateStatus  @default(DRAFT)
  createdBy         String                         @map("created_by") @db.Uuid
  approvedBy        String?                        @map("approved_by") @db.Uuid
  rejectedBy        String?                        @map("rejected_by") @db.Uuid
  cancelledBy       String?                        @map("cancelled_by") @db.Uuid
  createdAt         DateTime                       @default(now()) @map("created_at") @db.Timestamptz
  updatedAt         DateTime                       @updatedAt @map("updated_at") @db.Timestamptz
  submittedAt       DateTime?                      @map("submitted_at") @db.Timestamptz
  approvedAt        DateTime?                      @map("approved_at") @db.Timestamptz
  rejectedAt        DateTime?                      @map("rejected_at") @db.Timestamptz
  cancelledAt       DateTime?                      @map("cancelled_at") @db.Timestamptz
  archivedAt        DateTime?                      @map("archived_at") @db.Timestamptz
  rejectReason      String?                        @map("reject_reason")
  cancelReason      String?                        @map("cancel_reason")
  metadata          Json?

  tenant            Tenant                         @relation(fields: [tenantId], references: [id])
  workOrder         MaintenanceWorkOrder           @relation(fields: [workOrderId], references: [id])
  approvals         MaintenanceCostApproval[]
  payableLinks      MaintenancePayableLink[]

  @@index([tenantId, workOrderId])
  @@index([tenantId, supplierId])
  @@index([tenantId, supplierPayableId])
  @@index([tenantId, status])
  @@index([tenantId, approvedAt])
  @@map("maintenance_cost_estimates")
}

model MaintenanceCostApproval {
  id             String                        @id @default(uuid()) @db.Uuid
  tenantId       String                        @map("tenant_id") @db.Uuid
  workOrderId    String                        @map("work_order_id") @db.Uuid
  costEstimateId String                        @map("cost_estimate_id") @db.Uuid
  approvalStep   Int                           @map("approval_step")
  approvalStatus MaintenanceCostApprovalStatus @default(PENDING) @map("approval_status")
  requestedBy    String                        @map("requested_by") @db.Uuid
  approvedBy     String?                       @map("approved_by") @db.Uuid
  rejectedBy     String?                       @map("rejected_by") @db.Uuid
  requestedAt    DateTime                      @default(now()) @map("requested_at") @db.Timestamptz
  approvedAt     DateTime?                     @map("approved_at") @db.Timestamptz
  rejectedAt     DateTime?                     @map("rejected_at") @db.Timestamptz
  reason         String?
  metadata       Json?

  tenant         Tenant                        @relation(fields: [tenantId], references: [id])
  workOrder      MaintenanceWorkOrder          @relation(fields: [workOrderId], references: [id])
  costEstimate   MaintenanceCostEstimate       @relation(fields: [costEstimateId], references: [id])

  @@index([tenantId, workOrderId])
  @@index([tenantId, costEstimateId])
  @@index([tenantId, approvalStatus])
  @@unique([costEstimateId, approvalStep, approvalStatus])
  @@map("maintenance_cost_approvals")
}

model MaintenanceSupplierLink {
  id           String                        @id @default(uuid()) @db.Uuid
  tenantId     String                        @map("tenant_id") @db.Uuid
  workOrderId  String                        @map("work_order_id") @db.Uuid
  supplierId   String                        @map("supplier_id") @db.Uuid
  linkType     MaintenanceSupplierLinkType   @map("link_type")
  status       MaintenanceSupplierLinkStatus @default(ACTIVE)
  linkedBy     String                        @map("linked_by") @db.Uuid
  linkedAt     DateTime                      @default(now()) @map("linked_at") @db.Timestamptz
  unlinkedBy   String?                       @map("unlinked_by") @db.Uuid
  unlinkedAt   DateTime?                     @map("unlinked_at") @db.Timestamptz
  unlinkReason String?                       @map("unlink_reason")
  metadata     Json?

  tenant       Tenant                        @relation(fields: [tenantId], references: [id])
  workOrder    MaintenanceWorkOrder          @relation(fields: [workOrderId], references: [id])

  @@index([tenantId, workOrderId])
  @@index([tenantId, supplierId])
  @@index([tenantId, status])
  @@map("maintenance_supplier_links")
}

model MaintenancePayableLink {
  id                String                       @id @default(uuid()) @db.Uuid
  tenantId          String                       @map("tenant_id") @db.Uuid
  workOrderId       String                       @map("work_order_id") @db.Uuid
  costEstimateId    String                       @map("cost_estimate_id") @db.Uuid
  supplierPayableId String                       @map("supplier_payable_id") @db.Uuid
  status            MaintenancePayableLinkStatus @default(ACTIVE)
  createdBy         String                       @map("created_by") @db.Uuid
  createdAt         DateTime                     @default(now()) @map("created_at") @db.Timestamptz
  archivedBy        String?                      @map("archived_by") @db.Uuid
  archivedAt        DateTime?                    @map("archived_at") @db.Timestamptz
  archiveReason     String?                      @map("archive_reason")
  metadata          Json?

  tenant            Tenant                       @relation(fields: [tenantId], references: [id])
  workOrder         MaintenanceWorkOrder         @relation(fields: [workOrderId], references: [id])
  costEstimate      MaintenanceCostEstimate      @relation(fields: [costEstimateId], references: [id])

  @@index([tenantId, workOrderId])
  @@index([tenantId, costEstimateId])
  @@index([tenantId, supplierPayableId])
  @@index([tenantId, status])
  @@map("maintenance_payable_links")
}

model MaintenanceComment {
  id                   String                       @id @default(uuid()) @db.Uuid
  tenantId             String                       @map("tenant_id") @db.Uuid
  maintenanceRequestId String?                      @map("maintenance_request_id") @db.Uuid
  workOrderId          String?                      @map("work_order_id") @db.Uuid
  commentBody          String                       @map("comment_body")
  visibility           MaintenanceCommentVisibility
  createdBy            String                       @map("created_by") @db.Uuid
  createdAt            DateTime                     @default(now()) @map("created_at") @db.Timestamptz
  updatedAt            DateTime                     @updatedAt @map("updated_at") @db.Timestamptz
  archivedAt           DateTime?                    @map("archived_at") @db.Timestamptz
  metadata             Json?

  tenant               Tenant                       @relation(fields: [tenantId], references: [id])
  maintenanceRequest   MaintenanceRequest?          @relation(fields: [maintenanceRequestId], references: [id])
  workOrder            MaintenanceWorkOrder?        @relation(fields: [workOrderId], references: [id])

  @@index([tenantId, maintenanceRequestId])
  @@index([tenantId, workOrderId])
  @@index([tenantId, visibility])
  @@map("maintenance_comments")
}

model MaintenanceStatusHistory {
  id          String                             @id @default(uuid()) @db.Uuid
  tenantId    String                             @map("tenant_id") @db.Uuid
  entityType  MaintenanceStatusHistoryEntityType @map("entity_type")
  entityId    String                             @map("entity_id") @db.Uuid
  fromStatus  String?                            @map("from_status") @db.VarChar(80)
  toStatus    String                             @map("to_status") @db.VarChar(80)
  changedBy   String                             @map("changed_by") @db.Uuid
  changedAt   DateTime                           @default(now()) @map("changed_at") @db.Timestamptz
  reason      String?
  metadata    Json?

  tenant      Tenant                             @relation(fields: [tenantId], references: [id])

  @@index([tenantId, entityType, entityId])
  @@index([tenantId, changedAt])
  @@map("maintenance_status_history")
}
```

---

## 12. Relaciones a agregar en `Tenant`

Agregar al modelo `Tenant`:

```prisma id="wp2urt"
model Tenant {
  // existing fields...

  maintenanceCategories         MaintenanceCategory[]
  maintenanceAssets             MaintenanceAsset[]
  maintenanceRequests           MaintenanceRequest[]
  maintenanceRequestAttachments MaintenanceRequestAttachment[]
  maintenanceWorkOrders         MaintenanceWorkOrder[]
  maintenanceWorkOrderAssignments MaintenanceWorkOrderAssignment[]
  maintenanceWorkOrderTasks     MaintenanceWorkOrderTask[]
  maintenanceVisits             MaintenanceVisit[]
  maintenanceEvidence           MaintenanceEvidence[]
  maintenanceCostEstimates      MaintenanceCostEstimate[]
  maintenanceCostApprovals      MaintenanceCostApproval[]
  maintenanceSupplierLinks      MaintenanceSupplierLink[]
  maintenancePayableLinks       MaintenancePayableLink[]
  maintenanceComments           MaintenanceComment[]
  maintenanceStatusHistory      MaintenanceStatusHistory[]
}
```

---

## 13. Extensiones en Secure Document Storage

El módulo `016-secure-document-storage` debe reconocer:

```text id="tug277"
sourceModule = maintenanceWorkOrders
```

Tipos de recurso recomendados:

```text id="dq4d2d"
maintenanceRequestAttachment
maintenanceEvidence
maintenanceTechnicalReport
maintenanceSupplierQuote
maintenanceSupplierInvoice
maintenanceMaterialReceipt
maintenanceReportExport
```

Clasificación recomendada:

```text id="hmt3me"
visibility:
- administrative
- requesterVisible

sensitivity:
- internal
- restricted
```

---

## 14. Índices recomendados

### 14.1. Categorías

```sql id="bk63gu"
CREATE UNIQUE INDEX uq_maintenance_categories_tenant_code_active
ON maintenance_categories (tenant_id, category_code)
WHERE archived_at IS NULL;
```

---

### 14.2. Activos

```sql id="dvnebb"
CREATE UNIQUE INDEX uq_maintenance_assets_tenant_code_active
ON maintenance_assets (tenant_id, asset_code)
WHERE archived_at IS NULL;

CREATE INDEX idx_maintenance_assets_tenant_status
ON maintenance_assets (tenant_id, status);

CREATE INDEX idx_maintenance_assets_tenant_type
ON maintenance_assets (tenant_id, asset_type);

CREATE INDEX idx_maintenance_assets_tenant_property_unit
ON maintenance_assets (tenant_id, property_unit_id);

CREATE INDEX idx_maintenance_assets_tenant_common_area
ON maintenance_assets (tenant_id, common_area_id);
```

---

### 14.3. Solicitudes

```sql id="oxeqvp"
CREATE UNIQUE INDEX uq_maintenance_requests_tenant_number
ON maintenance_requests (tenant_id, request_number);

CREATE INDEX idx_maintenance_requests_tenant_status
ON maintenance_requests (tenant_id, status);

CREATE INDEX idx_maintenance_requests_tenant_category
ON maintenance_requests (tenant_id, category_id);

CREATE INDEX idx_maintenance_requests_tenant_reported_by
ON maintenance_requests (tenant_id, reported_by_user_id);

CREATE INDEX idx_maintenance_requests_tenant_property_unit
ON maintenance_requests (tenant_id, property_unit_id);

CREATE INDEX idx_maintenance_requests_tenant_priority
ON maintenance_requests (tenant_id, priority);

CREATE INDEX idx_maintenance_requests_tenant_created
ON maintenance_requests (tenant_id, created_at);
```

---

### 14.4. Órdenes

```sql id="b3a1bh"
CREATE UNIQUE INDEX uq_maintenance_work_orders_tenant_number
ON maintenance_work_orders (tenant_id, work_order_number);

CREATE INDEX idx_maintenance_work_orders_tenant_status
ON maintenance_work_orders (tenant_id, status);

CREATE INDEX idx_maintenance_work_orders_tenant_category
ON maintenance_work_orders (tenant_id, category_id);

CREATE INDEX idx_maintenance_work_orders_tenant_asset
ON maintenance_work_orders (tenant_id, asset_id);

CREATE INDEX idx_maintenance_work_orders_tenant_supplier
ON maintenance_work_orders (tenant_id, supplier_id);

CREATE INDEX idx_maintenance_work_orders_tenant_assigned_user
ON maintenance_work_orders (tenant_id, assigned_internal_user_id);

CREATE INDEX idx_maintenance_work_orders_tenant_scheduled
ON maintenance_work_orders (tenant_id, scheduled_start_at);

CREATE INDEX idx_maintenance_work_orders_tenant_closed
ON maintenance_work_orders (tenant_id, closed_at);

CREATE INDEX idx_maintenance_work_orders_tenant_priority
ON maintenance_work_orders (tenant_id, priority);
```

---

### 14.5. Tareas, visitas, evidencia y costos

```sql id="r788nj"
CREATE UNIQUE INDEX uq_maintenance_tasks_work_order_task_number
ON maintenance_work_order_tasks (work_order_id, task_number);

CREATE INDEX idx_maintenance_visits_tenant_work_order
ON maintenance_visits (tenant_id, work_order_id);

CREATE INDEX idx_maintenance_visits_tenant_scheduled
ON maintenance_visits (tenant_id, scheduled_at);

CREATE INDEX idx_maintenance_evidence_tenant_work_order
ON maintenance_evidence (tenant_id, work_order_id);

CREATE INDEX idx_maintenance_evidence_tenant_document
ON maintenance_evidence (tenant_id, secure_document_id);

CREATE INDEX idx_maintenance_cost_estimates_tenant_work_order
ON maintenance_cost_estimates (tenant_id, work_order_id);

CREATE INDEX idx_maintenance_cost_estimates_tenant_supplier
ON maintenance_cost_estimates (tenant_id, supplier_id);

CREATE INDEX idx_maintenance_cost_estimates_tenant_status
ON maintenance_cost_estimates (tenant_id, status);
```

---

### 14.6. Links y comentarios

```sql id="wsffac"
CREATE UNIQUE INDEX uq_maintenance_payable_links_active_cost
ON maintenance_payable_links (tenant_id, cost_estimate_id)
WHERE status = 'active';

CREATE INDEX idx_maintenance_supplier_links_tenant_work_order
ON maintenance_supplier_links (tenant_id, work_order_id);

CREATE INDEX idx_maintenance_supplier_links_tenant_supplier
ON maintenance_supplier_links (tenant_id, supplier_id);

CREATE INDEX idx_maintenance_comments_tenant_request
ON maintenance_comments (tenant_id, maintenance_request_id);

CREATE INDEX idx_maintenance_comments_tenant_work_order
ON maintenance_comments (tenant_id, work_order_id);

CREATE INDEX idx_maintenance_status_history_entity
ON maintenance_status_history (tenant_id, entity_type, entity_id);
```

---

## 15. Constraints recomendados

### 15.1. Costos no negativos

```sql id="j8os1l"
ALTER TABLE maintenance_cost_estimates
ADD CONSTRAINT chk_maintenance_cost_estimates_non_negative
CHECK (
  (estimated_amount IS NULL OR estimated_amount >= 0)
  AND (approved_amount IS NULL OR approved_amount >= 0)
  AND (actual_amount IS NULL OR actual_amount >= 0)
);
```

---

### 15.2. Costo aprobado

```sql id="psmyq7"
ALTER TABLE maintenance_cost_estimates
ADD CONSTRAINT chk_maintenance_cost_approved_fields
CHECK (
  status <> 'approved'
  OR (approved_amount IS NOT NULL AND approved_by IS NOT NULL AND approved_at IS NOT NULL)
);
```

---

### 15.3. Costo rechazado

```sql id="kk3qpw"
ALTER TABLE maintenance_cost_estimates
ADD CONSTRAINT chk_maintenance_cost_rejected_fields
CHECK (
  status <> 'rejected'
  OR (rejected_by IS NOT NULL AND rejected_at IS NOT NULL AND reject_reason IS NOT NULL)
);
```

---

### 15.4. Cierre de orden

```sql id="z6mvbi"
ALTER TABLE maintenance_work_orders
ADD CONSTRAINT chk_maintenance_work_order_closed_fields
CHECK (
  status <> 'closed'
  OR (closed_by IS NOT NULL AND closed_at IS NOT NULL AND completion_summary IS NOT NULL)
);
```

La evidencia de cierre debe validarse en servicio porque depende de existencia de registros asociados.

---

### 15.5. Reapertura

```sql id="i5zvz7"
ALTER TABLE maintenance_work_orders
ADD CONSTRAINT chk_maintenance_work_order_reopened_fields
CHECK (
  status <> 'reopened'
  OR (reopened_by IS NOT NULL AND reopened_at IS NOT NULL AND reopen_reason IS NOT NULL)
);
```

---

### 15.6. Cancelación

```sql id="pm6kwc"
ALTER TABLE maintenance_work_orders
ADD CONSTRAINT chk_maintenance_work_order_cancelled_fields
CHECK (
  status <> 'cancelled'
  OR (cancelled_by IS NOT NULL AND cancelled_at IS NOT NULL AND cancel_reason IS NOT NULL)
);
```

---

### 15.7. Evidencia verificada/rechazada

```sql id="jogz75"
ALTER TABLE maintenance_evidence
ADD CONSTRAINT chk_maintenance_evidence_verified_fields
CHECK (
  status <> 'verified'
  OR (verified_by IS NOT NULL AND verified_at IS NOT NULL)
);

ALTER TABLE maintenance_evidence
ADD CONSTRAINT chk_maintenance_evidence_rejected_fields
CHECK (
  status <> 'rejected'
  OR (rejected_by IS NOT NULL AND rejected_at IS NOT NULL AND reject_reason IS NOT NULL)
);
```

---

### 15.8. Comentarios vinculados

```sql id="jw7px7"
ALTER TABLE maintenance_comments
ADD CONSTRAINT chk_maintenance_comments_target
CHECK (
  maintenance_request_id IS NOT NULL
  OR work_order_id IS NOT NULL
);
```

---

### 15.9. Asignaciones

```sql id="rb6kh9"
ALTER TABLE maintenance_work_order_assignments
ADD CONSTRAINT chk_maintenance_assignment_target
CHECK (
  assigned_user_id IS NOT NULL
  OR supplier_id IS NOT NULL
);
```

---

## 16. Validaciones que Prisma/DB no deben ser las únicas en controlar

Deben validarse en servicios de dominio:

```text id="xe5c1h"
- propertyUnitId pertenece al tenant.
- commonAreaId pertenece al tenant.
- supplierId pertenece al tenant y está active.
- supplier blocked no se asigna a nueva orden.
- secureDocumentId pertenece al tenant.
- assignedUserId tiene membership activo en tenant.
- resident solo crea solicitud sobre unidad propia.
- resident solo lee solicitud propia.
- /me no expone comentarios internos.
- /me no expone costos internos.
- /me no expone datos internos de proveedor.
- evidencia de cierre existe o closureReason controlada.
- Maintenance no crea Payment.
- Maintenance no crea SupplierPaymentOrder.
- Maintenance no crea JournalEntry.
- Maintenance no confirma Bank Reconciliation.
```

---

## 17. Generación de números

### 17.1. `request_number`

Formato recomendado:

```text id="w7nmgp"
MR-{YYYYMM}-{sequence}
```

Ejemplo:

```text id="g2ebvf"
MR-202607-000001
```

Debe ser único por tenant.

---

### 17.2. `work_order_number`

Formato recomendado:

```text id="r28v23"
MWO-{YYYYMM}-{sequence}
```

Ejemplo:

```text id="x1dcmn"
MWO-202607-000001
```

Debe ser único por tenant.

---

### 17.3. `task_number`

Secuencial dentro de la orden:

```text id="scrys9"
1, 2, 3, 4...
```

Debe ser único por `work_order_id`.

---

## 18. Estrategia `/me`

Los endpoints `/me` consultan `maintenance_requests` con control propio.

Condición conceptual:

```text id="pbpbze"
tenant_id = currentTenant.id
AND reported_by_user_id = currentUserProfile.id
```

También se puede permitir por relación persona/unidad:

```text id="lx1en0"
UserProfile -> Person -> PropertyUnit
```

Reglas de respuesta `/me`:

```text id="ee60rs"
- No incluir costos.
- No incluir comentarios internal.
- No incluir supplier internal data.
- No incluir audit metadata completa.
- No incluir status history completa.
- No incluir evidencias internal.
- No incluir secureDocument storageKey.
```

DTO `/me` debe ser distinto del DTO administrativo.

---

## 19. Estrategia de archivo

El modelo usa archivo lógico:

```text id="ms5haw"
archived_at
archived_by
archive_reason
```

Reglas:

```text id="n7h6ic"
- archived no se lista por defecto.
- archived conserva historial.
- archived no permite operaciones nuevas.
- evidencia archived no elimina documento físico.
- costos archived no eliminan trazabilidad financiera.
- links archived no eliminan payable real.
```

---

## 20. Estrategia de auditoría de datos

Los campos `created_by`, `updated_by`, `approved_by`, `closed_by`, etc. se resuelven server-side.

Prohibido desde cliente:

```text id="mf19uj"
createdBy
updatedBy
reportedByUserId
assignedBy
approvedBy
rejectedBy
closedBy
reopenedBy
archivedBy
```

Cada operación crítica debe crear evento en `007-audit`.

---

## 21. Datos prohibidos en `metadata`

No debe guardarse en `metadata`:

```text id="c39acy"
storageKey
signedUrl
base64
raw file payload
tokens
secrets
passwords
SQL raw
stack trace productivo
datos personales innecesarios
datos cross-tenant
datos bancarios
raw supplier payload
raw payment payload
```

---

## 22. Consultas conceptuales

### 22.1. Solicitudes propias

```sql id="n1imfj"
SELECT *
FROM maintenance_requests
WHERE tenant_id = :tenantId
  AND reported_by_user_id = :currentUserId
  AND archived_at IS NULL
ORDER BY created_at DESC
LIMIT :limit OFFSET :offset;
```

---

### 22.2. Órdenes abiertas por prioridad

```sql id="pnlypg"
SELECT *
FROM maintenance_work_orders
WHERE tenant_id = :tenantId
  AND status IN ('open', 'pendingAssignment', 'assigned', 'scheduled', 'inProgress', 'onHold')
  AND archived_at IS NULL
ORDER BY priority DESC, created_at ASC
LIMIT :limit OFFSET :offset;
```

---

### 22.3. Costos aprobados por periodo

```sql id="gcasf0"
SELECT
  cost_type,
  supplier_id,
  SUM(approved_amount) AS approved_total
FROM maintenance_cost_estimates
WHERE tenant_id = :tenantId
  AND status IN ('approved', 'convertedToPayable')
  AND approved_at >= :dateFrom
  AND approved_at < :dateTo
GROUP BY cost_type, supplier_id;
```

---

### 22.4. Tiempos de atención

```sql id="qlsaij"
SELECT
  id,
  request_number,
  submitted_at,
  accepted_at,
  EXTRACT(EPOCH FROM (accepted_at - submitted_at)) / 3600 AS hours_to_accept
FROM maintenance_requests
WHERE tenant_id = :tenantId
  AND submitted_at IS NOT NULL
  AND accepted_at IS NOT NULL;
```

---

## 23. Reportes soportados por el modelo

### 23.1. By status

Fuente:

```text id="r3ha86"
maintenance_requests
maintenance_work_orders
```

Dimensiones:

```text id="a5ba5g"
status
priority
severity
categoryId
createdAt
closedAt
```

---

### 23.2. By category

Fuente:

```text id="b9jn7f"
maintenance_work_orders
maintenance_categories
maintenance_cost_estimates
```

---

### 23.3. Response times

Fuente:

```text id="vftv54"
maintenance_requests.submitted_at
maintenance_requests.accepted_at
maintenance_work_orders.created_at
maintenance_work_orders.actual_start_at
maintenance_work_orders.closed_at
```

---

### 23.4. Costs

Fuente:

```text id="cmknuw"
maintenance_cost_estimates
maintenance_work_orders
maintenance_supplier_links
```

---

### 23.5. By supplier

Fuente:

```text id="m8khaj"
maintenance_work_orders.supplier_id
maintenance_supplier_links
maintenance_cost_estimates
maintenance_payable_links
```

---

## 24. Migración recomendada

Nombre:

```text id="dtztfg"
022_create_maintenance_work_orders
```

Contenido:

```text id="zelbsw"
- Crear enums Maintenance.
- Crear maintenance_categories.
- Crear maintenance_assets.
- Crear maintenance_requests.
- Crear maintenance_request_attachments.
- Crear maintenance_work_orders.
- Crear maintenance_work_order_assignments.
- Crear maintenance_work_order_tasks.
- Crear maintenance_visits.
- Crear maintenance_evidence.
- Crear maintenance_cost_estimates.
- Crear maintenance_cost_approvals.
- Crear maintenance_supplier_links.
- Crear maintenance_payable_links.
- Crear maintenance_comments.
- Crear maintenance_status_history.
- Crear foreign keys internas.
- Crear índices tenant-scoped.
- Crear índices únicos parciales.
- Crear constraints monetarios.
- Crear constraints de estados críticos.
- Extender Secure Document Storage sourceModule.
```

---

## 25. Seeds iniciales

Categorías sugeridas:

```text id="vvm0ak"
PLUMBING — Plomería
ELECTRICAL — Electricidad
CLEANING — Limpieza
GARDENING — Jardinería
SECURITY_INFRA — Seguridad física
COMMON_AREAS — Áreas comunales
STRUCTURE — Infraestructura
LIGHTING — Iluminación
WATER_SYSTEMS — Bombas / cisterna / agua
ACCESS_CONTROL — Portones / accesos
OTHER — Otros
```

Activos sugeridos por tenant demo:

```text id="lhu8k0"
GATE_VEHICLE — Portón vehicular
GATE_PEDESTRIAN — Portón peatonal
GUARDHOUSE — Garita
COURT_MAIN — Cancha múltiple
PLAYGROUND — Parque infantil
WATER_PUMP_MAIN — Bomba principal
CISTERN_MAIN — Cisterna principal
LIGHTING_COMMON — Iluminación común
GARDENS — Jardines
COMMUNAL_HALL — Salón comunal
```

---

## 26. DTO y modelo de datos

### 26.1. Campos que nunca se aceptan desde cliente

```text id="y06bbo"
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
status directo
costApprovalStatus directo
workOrderNumber
requestNumber
supplierPayableId fuera de convert-to-payable
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

### 26.2. Campos que no se devuelven en `/me`

```text id="i3q5vu"
estimatedCostAmount
approvedCostAmount
actualCostAmount
supplierId
supplierPayableId
internal comments
internal evidence
audit metadata
admin metadata
status history completa
```

---

## 27. Compatibilidad con futuros microservicios

El modelo debe permitir separar el módulo en microservicio futuro mediante:

```text id="fa7hck"
- IDs UUID globales.
- tenant_id explícito.
- integración por puertos.
- no foreign keys obligatorias hacia módulos externos en dominios que puedan separarse.
- eventos de dominio.
- audit desacoplado.
- Secure Document Storage vía referencia.
- Supplier Payments vía puerto.
```

Recomendación:

```text id="m34oml"
Las referencias externas como supplierId, supplierPayableId, propertyUnitId, commonAreaId y secureDocumentId pueden mantenerse como UUID con validación de aplicación, evitando acoplamiento físico excesivo.
```

---

## 28. No aceptación del modelo

El modelo no debe aceptarse si:

```text id="mrd6wr"
- alguna tabla operativa no tiene tenant_id;
- permite consultar entidades tenant-scoped por id simple;
- no modela separación entre request y work order;
- no modela evidencia vía secure_document_id;
- almacena storageKey;
- almacena signedUrl persistente;
- almacena base64;
- usa float/double para costos;
- no tiene Decimal para montos;
- permite costos negativos;
- permite status crítico sin trazabilidad;
- no permite historial de estados;
- no permite /me propio de manera segura;
- mezcla pagos dentro de maintenance;
- mezcla contabilidad dentro de maintenance;
- mezcla conciliación bancaria dentro de maintenance;
- expone campos internos a residentes;
- no soporta auditoría;
- no soporta reportes básicos;
- no soporta exportaciones vía SDS.
```

---

## 29. Resultado esperado

Al implementar este modelo de datos, el módulo `022-maintenance-work-orders` tendrá una base persistente segura y extensible para gestionar mantenimiento operativo en RESIDENT Core.

Resultado esperado:

```text id="gz0mgo"
maintenance_categories modelado
maintenance_assets modelado
maintenance_requests modelado
maintenance_request_attachments modelado
maintenance_work_orders modelado
maintenance_work_order_assignments modelado
maintenance_work_order_tasks modelado
maintenance_visits modelado
maintenance_evidence modelado
maintenance_cost_estimates modelado
maintenance_cost_approvals modelado
maintenance_supplier_links modelado
maintenance_payable_links modelado
maintenance_comments modelado
maintenance_status_history modelado
tenant isolation modelado
own requests modelado
Secure Document Storage references modeladas
Supplier Payments links modelados
cost tracking con Decimal modelado
state history modelado
soft archive modelado
reports soportados
exports soportados
no direct payments
no direct accounting
no public exposure
```

---

## 30. Expediente actualizado

```text id="wk4tml"
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
│   │       └── data-model.md
```
