# Data Model — 026 Automation Workflows Basic

## 1. Información del documento

| Campo                  | Valor                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| Proyecto               | RESIDENT Core                                                                              |
| Spec ID                | 026                                                                                        |
| Módulo                 | Automation Workflows Basic                                                                 |
| Documento              | Data Model                                                                                 |
| Ruta                   | `docs/specs/026-automation-workflows-basic/data-model.md`                                  |
| Versión                | 0.1                                                                                        |
| Estado                 | Borrador inicial                                                                           |
| Fecha                  | 2026-07-31                                                                                 |
| Documento base         | `docs/specs/026-automation-workflows-basic/spec.md`                                        |
| Plan técnico           | `docs/specs/026-automation-workflows-basic/plan.md`                                        |
| Base de datos          | PostgreSQL                                                                                 |
| ORM                    | Prisma                                                                                     |
| Estrategia multitenant | Shared database / shared schema / tenant_id                                                |
| Naturaleza             | Tenant-scoped / Event-driven / Workflow-governed / Queue-backed / Audit-heavy / Non-public |

---

## 2. Propósito

Este documento define el modelo de datos del módulo `026-automation-workflows-basic`.

El modelo permite administrar catálogos de triggers y actions, workflows tenant-scoped, versiones, activaciones, ejecuciones, steps, logs sanitizados, dead letters, exportaciones, idempotencia, reintentos y trazabilidad de automatizaciones internas seguras.

Regla central del modelo de datos:

```text id="awb-dm-rule"
Todo trigger, action, workflow, versión, activación, ejecución, step, log, dead letter y exportación de Automation Workflows Basic debe respetar tenant isolation, catálogo cerrado, versionamiento, idempotencia, retries finitos, trazabilidad, auditoría, payloads sanitizados, ausencia de secretos, ausencia de scripts, ausencia de raw SQL, ausencia de código ejecutable, ausencia de webhooks públicos inseguros, ausencia de storageKey expuesto, ausencia de acceso desde WordPress público, ausencia de pagos ejecutados, ausencia de asientos contables directos, ausencia de conciliaciones bancarias confirmadas, ausencia de control físico de hardware y ausencia de IA externa con datos reales.
```

---

## 3. Principios del modelo

```text id="awb-dm-principles"
1. Catálogo global; workflows tenant-scoped.
2. Trigger definitions y action definitions son globales y controladas por PlatformAdmin.
3. Workflows, versions, activations, executions, steps, logs, dead letters y exports siempre tienen tenant_id.
4. El contenido ejecutable de un workflow siempre está versionado.
5. Una versión activa no se edita destructivamente.
6. Toda ejecución requiere idempotency_key.
7. Event-driven deduplica por source_event_id.
8. Scheduled deduplica por scheduled_window_key.
9. Manual run deduplica por manual_run_id.
10. Retries son finitos.
11. Dead letter conserva fallo sanitizado.
12. Logs y outputs se sanitizan.
13. JSONB se valida por schema y denylist.
14. No se almacenan secretos.
15. No se almacenan scripts ni raw SQL.
16. No se almacena storageKey.
17. Exportaciones usan Secure Document Storage.
18. No existen tablas para webhooks públicos en MVP.
19. No existen tablas para pagos, ledger, conciliación, hardware o IA externa.
20. El módulo orquesta actions permitidas, pero no escribe directamente en tablas de módulos consumidores.
```

---

## 4. Tablas del módulo

### 4.1. Tablas platform/global

```text id="awb-dm-platform-tables"
workflow_trigger_definitions
workflow_action_definitions
```

Estas tablas definen el catálogo global de triggers y actions permitidos por la plataforma.

No contienen datos reales de tenants.

---

### 4.2. Tablas tenant-scoped

```text id="awb-dm-tenant-tables"
tenant_workflow_definitions
tenant_workflow_versions
tenant_workflow_activations
workflow_executions
workflow_step_executions
workflow_execution_logs
workflow_dead_letters
workflow_exports
```

Todas estas tablas deben incluir:

```text id="awb-dm-common-tenant-fields"
tenant_id
created_at
updated_at
archived_at cuando aplique
```

---

## 5. Dependencias externas

### 5.1. Referencias internas

```text id="awb-dm-internal-references"
tenant_id -> tenants.id
created_by -> user_profiles.id
updated_by -> user_profiles.id
reviewed_by -> user_profiles.id
approved_by -> user_profiles.id
rejected_by -> user_profiles.id
activated_by -> user_profiles.id
deactivated_by -> user_profiles.id
archived_by -> user_profiles.id
triggered_by_user_profile_id -> user_profiles.id
cancelled_by -> user_profiles.id
retried_by -> user_profiles.id
resolved_by -> user_profiles.id
ignored_by -> user_profiles.id
requested_by -> user_profiles.id
```

---

### 5.2. Referencias por puerto

Algunas referencias se conservan como UUID o string sin FK directa para mantener bajo acoplamiento entre módulos:

```text id="awb-dm-port-references"
source_event_id
target_resource_id
secure_document_id
notification_id
report_id
source_resource_id
action_result_resource_id
```

Reglas:

```text id="awb-dm-port-reference-rules"
- source_event_id identifica el evento de origen emitido por otro módulo.
- target_resource_id se valida mediante el módulo dueño si aplica.
- secure_document_id se valida mediante Secure Document Storage.
- notification_id se valida mediante Communications and Notifications.
- report_id se valida mediante Basic Reports.
- No se usan FK directas a tablas transaccionales de módulos consumidores.
- No se crean efectos transaccionales desde este módulo.
```

---

## 6. Tabla `workflow_trigger_definitions`

### 6.1. Propósito

Define los triggers permitidos por la plataforma.

Ejemplos:

```text id="awb-dm-trigger-definition-examples"
payments.paymentValidated
access.visitorCheckedIn
maintenance.workOrderOverdue
schedule.monthly
manual.runWorkflow
```

---

### 6.2. Campos

| Campo                 |         Tipo | Requerido | Descripción                      |
| --------------------- | -----------: | --------: | -------------------------------- |
| `id`                  |         UUID |        Sí | Identificador de la definición   |
| `trigger_key`         | varchar(180) |        Sí | Clave única del trigger          |
| `category`            |         enum |        Sí | Categoría funcional              |
| `source_module`       | varchar(120) |        Sí | Módulo emisor                    |
| `trigger_type`        |         enum |        Sí | event/scheduled/manual/system    |
| `event_name`          | varchar(180) |        No | Nombre de evento interno         |
| `schema`              |        jsonb |        Sí | JSON Schema para `triggerConfig` |
| `description`         |         text |        No | Descripción funcional            |
| `sensitivity`         |         enum |        Sí | Sensibilidad                     |
| `is_tenant_enabled`   |      boolean |        Sí | Si puede ser usado por tenants   |
| `requires_permission` | varchar(160) |        No | Permiso adicional si aplica      |
| `status`              |         enum |        Sí | Estado                           |
| `created_by`          |         UUID |        Sí | Actor creador                    |
| `updated_by`          |         UUID |        No | Actor modificador                |
| `archived_by`         |         UUID |        No | Actor archivador                 |
| `created_at`          |  timestamptz |        Sí | Fecha creación                   |
| `updated_at`          |  timestamptz |        Sí | Fecha actualización              |
| `archived_at`         |  timestamptz |        No | Archivo lógico                   |

---

### 6.3. Reglas

```text id="awb-trigger-definition-rules"
- trigger_key debe ser único.
- trigger_key debe usar formato category.name.
- source_module obligatorio.
- trigger_type obligatorio.
- event_name obligatorio si trigger_type=event.
- schema obligatorio y no ejecutable.
- No se permiten schemas con scripts.
- No se permiten schemas con rawSql.
- No se permiten schemas con secrets.
- Public webhooks no existen en MVP.
- WordPress público no puede emitir triggers.
```

---

## 7. Tabla `workflow_action_definitions`

### 7.1. Propósito

Define las actions permitidas por la plataforma.

Ejemplos:

```text id="awb-dm-action-definition-examples"
notifications.sendToResident
reports.generateBasicReport
operations.createAdministrativeTask
access.notifyOpenCheckInExceeded
inventory.notifyLowStock
```

---

### 7.2. Campos

| Campo                 |         Tipo | Requerido | Descripción                              |
| --------------------- | -----------: | --------: | ---------------------------------------- |
| `id`                  |         UUID |        Sí | Identificador de la definición           |
| `action_key`          | varchar(180) |        Sí | Clave única de la action                 |
| `category`            |         enum |        Sí | Categoría funcional                      |
| `target_module`       | varchar(120) |        Sí | Módulo destino                           |
| `action_type`         |         enum |        Sí | Tipo de action                           |
| `schema`              |        jsonb |        Sí | JSON Schema para `actionConfig`          |
| `description`         |         text |        No | Descripción funcional                    |
| `sensitivity`         |         enum |        Sí | Sensibilidad                             |
| `requires_permission` | varchar(160) |        No | Permiso requerido                        |
| `requires_approval`   |      boolean |        Sí | Requiere aprobación                      |
| `is_destructive`      |      boolean |        Sí | Si puede destruir/modificar críticamente |
| `is_financial`        |      boolean |        Sí | Si toca dominio financiero               |
| `is_external`         |      boolean |        Sí | Si invoca servicio externo               |
| `is_tenant_enabled`   |      boolean |        Sí | Si tenants pueden usarla                 |
| `status`              |         enum |        Sí | Estado                                   |
| `created_by`          |         UUID |        Sí | Actor creador                            |
| `updated_by`          |         UUID |        No | Actor modificador                        |
| `archived_by`         |         UUID |        No | Actor archivador                         |
| `created_at`          |  timestamptz |        Sí | Fecha creación                           |
| `updated_at`          |  timestamptz |        Sí | Fecha actualización                      |
| `archived_at`         |  timestamptz |        No | Archivo lógico                           |

---

### 7.3. Reglas

```text id="awb-action-definition-rules"
- action_key debe ser único.
- action_key debe usar formato category.name.
- target_module obligatorio.
- schema obligatorio y no ejecutable.
- is_destructive=true está bloqueado en MVP salvo allowlist explícita.
- is_financial=true no puede crear pagos, asientos ni conciliaciones.
- is_external=true queda restringido en MVP.
- No se permiten actions con secrets.
- No se permiten actions con rawSql.
- No se permiten actions con scripts.
- No se permiten actions fuera del catálogo.
```

---

## 8. Tabla `tenant_workflow_definitions`

### 8.1. Propósito

Representa el contenedor lógico de una automatización dentro de un tenant.

---

### 8.2. Campos

| Campo                   |         Tipo | Requerido | Descripción                    |
| ----------------------- | -----------: | --------: | ------------------------------ |
| `id`                    |         UUID |        Sí | Identificador del workflow     |
| `tenant_id`             |         UUID |        Sí | Tenant propietario             |
| `workflow_code`         | varchar(120) |        Sí | Código único por tenant        |
| `name`                  | varchar(180) |        Sí | Nombre visible                 |
| `description`           |         text |        No | Descripción                    |
| `category`              |         enum |        Sí | Categoría funcional            |
| `status`                |         enum |        Sí | draft/active/inactive/archived |
| `owner_user_profile_id` |         UUID |        No | Responsable funcional          |
| `created_by`            |         UUID |        Sí | Actor creador                  |
| `updated_by`            |         UUID |        No | Actor modificador              |
| `archived_by`           |         UUID |        No | Actor archivador               |
| `created_at`            |  timestamptz |        Sí | Fecha creación                 |
| `updated_at`            |  timestamptz |        Sí | Fecha actualización            |
| `archived_at`           |  timestamptz |        No | Archivo lógico                 |

---

### 8.3. Reglas

```text id="awb-workflow-definition-rules"
- tenant_id obligatorio.
- workflow_code único por tenant.
- name obligatorio.
- Workflow archived no ejecuta.
- Workflow inactive no ejecuta.
- Workflow sin versión activa no ejecuta.
- No physical delete ordinario.
- No contiene actionGraph; el contenido ejecutable vive en versions.
```

---

## 9. Tabla `tenant_workflow_versions`

### 9.1. Propósito

Representa una versión concreta del contenido del workflow: trigger, condiciones, steps, actions, retry policy y vigencia.

---

### 9.2. Campos

| Campo                    |         Tipo | Requerido | Descripción                        |
| ------------------------ | -----------: | --------: | ---------------------------------- |
| `id`                     |         UUID |        Sí | Identificador de versión           |
| `tenant_id`              |         UUID |        Sí | Tenant propietario                 |
| `workflow_definition_id` |         UUID |        Sí | Workflow padre                     |
| `version_number`         |      integer |        Sí | Número incremental                 |
| `version_label`          |  varchar(40) |        Sí | Etiqueta visible, ejemplo v1       |
| `trigger_definition_id`  |         UUID |        Sí | Trigger usado                      |
| `trigger_key`            | varchar(180) |        Sí | Copia de triggerKey                |
| `trigger_config`         |        jsonb |        Sí | Configuración validada del trigger |
| `condition_config`       |        jsonb |        No | Condiciones declarativas           |
| `action_graph`           |        jsonb |        Sí | Steps/actions permitidas           |
| `retry_policy`           |        jsonb |        Sí | Política de reintentos             |
| `status`                 |         enum |        Sí | Estado de versión                  |
| `effective_from`         |  timestamptz |        No | Inicio vigencia                    |
| `effective_until`        |  timestamptz |        No | Fin vigencia                       |
| `change_reason`          |         text |        Sí | Razón de cambio                    |
| `review_notes`           |         text |        No | Notas de revisión                  |
| `rejection_reason`       |         text |        No | Razón de rechazo                   |
| `created_by`             |         UUID |        Sí | Actor creador                      |
| `updated_by`             |         UUID |        No | Actor actualizador                 |
| `reviewed_by`            |         UUID |        No | Actor revisor                      |
| `approved_by`            |         UUID |        No | Actor aprobador                    |
| `rejected_by`            |         UUID |        No | Actor que rechazó                  |
| `activated_by`           |         UUID |        No | Actor activador                    |
| `deactivated_by`         |         UUID |        No | Actor desactivador                 |
| `archived_by`            |         UUID |        No | Actor archivador                   |
| `created_at`             |  timestamptz |        Sí | Fecha creación                     |
| `updated_at`             |  timestamptz |        Sí | Fecha actualización                |
| `reviewed_at`            |  timestamptz |        No | Fecha revisión                     |
| `approved_at`            |  timestamptz |        No | Fecha aprobación                   |
| `rejected_at`            |  timestamptz |        No | Fecha rechazo                      |
| `activated_at`           |  timestamptz |        No | Fecha activación                   |
| `deactivated_at`         |  timestamptz |        No | Fecha desactivación                |
| `archived_at`            |  timestamptz |        No | Archivo lógico                     |

---

### 9.3. Reglas

```text id="awb-workflow-version-rules"
- tenant_id obligatorio.
- workflow_definition_id debe pertenecer al mismo tenant.
- version_number se genera server-side.
- version_label se genera server-side.
- trigger_definition_id debe existir y estar active.
- trigger_config valida contra schema del trigger.
- condition_config usa operadores permitidos.
- action_graph usa solo actions activas y permitidas.
- retry_policy debe tener maxRetries finito.
- active no se edita destructivamente.
- scheduled no se edita destructivamente.
- rejected no puede activarse.
- archived no puede activarse.
- change_reason obligatorio.
- No se aceptan secrets.
- No se aceptan scripts.
- No se acepta rawSql.
- No se acepta executableCode.
```

---

## 10. Tabla `tenant_workflow_activations`

### 10.1. Propósito

Registra activaciones, programaciones, desactivaciones y sustituciones de versiones de workflow.

---

### 10.2. Campos

| Campo                          |        Tipo | Requerido | Descripción                                            |
| ------------------------------ | ----------: | --------: | ------------------------------------------------------ |
| `id`                           |        UUID |        Sí | Identificador de activación                            |
| `tenant_id`                    |        UUID |        Sí | Tenant propietario                                     |
| `workflow_definition_id`       |        UUID |        Sí | Workflow padre                                         |
| `workflow_version_id`          |        UUID |        Sí | Versión activada                                       |
| `activation_type`              |        enum |        Sí | immediate/scheduled/deactivation/replacement           |
| `status`                       |        enum |        Sí | scheduled/active/deactivated/cancelled/failed/archived |
| `effective_from`               | timestamptz |        Sí | Inicio de vigencia                                     |
| `effective_until`              | timestamptz |        No | Fin de vigencia                                        |
| `activation_reason`            |        text |        Sí | Razón                                                  |
| `previous_workflow_version_id` |        UUID |        No | Versión anterior                                       |
| `created_by`                   |        UUID |        Sí | Actor creador                                          |
| `activated_by`                 |        UUID |        No | Actor activador                                        |
| `deactivated_by`               |        UUID |        No | Actor desactivador                                     |
| `cancelled_by`                 |        UUID |        No | Actor cancelador                                       |
| `archived_by`                  |        UUID |        No | Actor archivador                                       |
| `created_at`                   | timestamptz |        Sí | Fecha creación                                         |
| `updated_at`                   | timestamptz |        Sí | Fecha actualización                                    |
| `activated_at`                 | timestamptz |        No | Fecha activación                                       |
| `deactivated_at`               | timestamptz |        No | Fecha desactivación                                    |
| `cancelled_at`                 | timestamptz |        No | Fecha cancelación                                      |
| `archived_at`                  | timestamptz |        No | Archivo lógico                                         |

---

### 10.3. Reglas

```text id="awb-workflow-activation-rules"
- Activación siempre tenant-scoped.
- workflow_definition_id y workflow_version_id deben pertenecer al mismo tenant.
- Solo una versión puede estar efectiva por workflow + effectiveAt.
- scheduled no ejecuta antes de effective_from.
- deactivated no ejecuta.
- cancelled no ejecuta.
- archived no ejecuta.
- Activación no borra historial.
- activation_reason obligatorio.
```

---

## 11. Tabla `workflow_executions`

### 11.1. Propósito

Representa una ejecución concreta de un workflow.

---

### 11.2. Campos

| Campo                          |         Tipo | Requerido | Descripción                   |
| ------------------------------ | -----------: | --------: | ----------------------------- |
| `id`                           |         UUID |        Sí | Identificador de ejecución    |
| `tenant_id`                    |         UUID |        Sí | Tenant propietario            |
| `workflow_definition_id`       |         UUID |        Sí | Workflow ejecutado            |
| `workflow_version_id`          |         UUID |        Sí | Versión ejecutada             |
| `trigger_definition_id`        |         UUID |        Sí | Trigger aplicado              |
| `trigger_key`                  | varchar(180) |        Sí | Trigger key                   |
| `trigger_type`                 |         enum |        Sí | event/scheduled/manual/system |
| `source_module`                | varchar(120) |        No | Módulo emisor                 |
| `source_event_id`              | varchar(180) |        No | Evento fuente                 |
| `scheduled_window_key`         | varchar(180) |        No | Ventana programada            |
| `manual_run_id`                |         UUID |        No | ID de ejecución manual        |
| `idempotency_key`              | varchar(300) |        Sí | Clave idempotente             |
| `status`                       |         enum |        Sí | Estado                        |
| `priority`                     |      integer |        Sí | Prioridad                     |
| `input_sanitized`              |        jsonb |        No | Input sanitizado              |
| `output_sanitized`             |        jsonb |        No | Output sanitizado             |
| `failure_reason`               |         text |        No | Fallo sanitizado              |
| `error_code`                   | varchar(120) |        No | Código de error               |
| `retry_count`                  |      integer |        Sí | Reintentos realizados         |
| `max_retries`                  |      integer |        Sí | Máximo permitido              |
| `triggered_by_user_profile_id` |         UUID |        No | Actor manual si aplica        |
| `started_at`                   |  timestamptz |        No | Inicio                        |
| `finished_at`                  |  timestamptz |        No | Fin                           |
| `failed_at`                    |  timestamptz |        No | Fallo                         |
| `cancelled_at`                 |  timestamptz |        No | Cancelación                   |
| `queued_at`                    |  timestamptz |        Sí | Encolado                      |
| `correlation_id`               | varchar(120) |        Sí | Correlación                   |
| `trace_id`                     | varchar(120) |        Sí | Trazabilidad                  |
| `created_at`                   |  timestamptz |        Sí | Fecha creación                |
| `updated_at`                   |  timestamptz |        Sí | Fecha actualización           |

---

### 11.3. Reglas

```text id="awb-execution-rules"
- tenant_id obligatorio.
- workflow_definition_id debe pertenecer al tenant.
- workflow_version_id debe pertenecer al tenant.
- idempotency_key obligatorio.
- idempotency_key único por tenant + workflow_definition_id.
- Event-driven requiere source_event_id.
- Scheduled requiere scheduled_window_key.
- Manual requiere manual_run_id y triggered_by_user_profile_id.
- input_sanitized no debe contener payload raw sensible.
- output_sanitized no debe contener secrets.
- failure_reason debe estar sanitizado.
- No physical delete ordinario.
```

---

## 12. Tabla `workflow_step_executions`

### 12.1. Propósito

Registra la ejecución de cada step/action dentro de una ejecución de workflow.

---

### 12.2. Campos

| Campo                    |         Tipo | Requerido | Descripción                      |
| ------------------------ | -----------: | --------: | -------------------------------- |
| `id`                     |         UUID |        Sí | Identificador del step execution |
| `tenant_id`              |         UUID |        Sí | Tenant propietario               |
| `workflow_execution_id`  |         UUID |        Sí | Ejecución padre                  |
| `workflow_definition_id` |         UUID |        Sí | Workflow relacionado             |
| `workflow_version_id`    |         UUID |        Sí | Versión relacionada              |
| `step_key`               | varchar(120) |        Sí | Clave del step                   |
| `step_order`             |      integer |        Sí | Orden                            |
| `action_definition_id`   |         UUID |        Sí | Action usada                     |
| `action_key`             | varchar(180) |        Sí | Action key                       |
| `target_module`          | varchar(120) |        Sí | Módulo destino                   |
| `status`                 |         enum |        Sí | Estado del step                  |
| `input_sanitized`        |        jsonb |        No | Input sanitizado                 |
| `output_sanitized`       |        jsonb |        No | Output sanitizado                |
| `target_resource_type`   | varchar(100) |        No | Tipo de recurso destino          |
| `target_resource_id`     |         UUID |        No | Recurso destino                  |
| `failure_reason`         |         text |        No | Fallo sanitizado                 |
| `error_code`             | varchar(120) |        No | Código de error                  |
| `retry_count`            |      integer |        Sí | Reintentos                       |
| `max_retries`            |      integer |        Sí | Máximo                           |
| `started_at`             |  timestamptz |        No | Inicio                           |
| `finished_at`            |  timestamptz |        No | Fin                              |
| `failed_at`              |  timestamptz |        No | Fallo                            |
| `cancelled_at`           |  timestamptz |        No | Cancelación                      |
| `created_at`             |  timestamptz |        Sí | Fecha creación                   |
| `updated_at`             |  timestamptz |        Sí | Fecha actualización              |

---

### 12.3. Reglas

```text id="awb-step-rules"
- tenant_id debe coincidir con workflow_execution.tenant_id.
- workflow_execution_id debe pertenecer al tenant.
- action_definition_id debe estar active.
- action_key debe coincidir con action definition.
- step_key único por execution.
- input_sanitized no incluye secrets.
- output_sanitized no incluye storageKey.
- Step no ejecuta action fuera de catálogo.
- Step no escribe directamente en tablas externas.
```

---

## 13. Tabla `workflow_execution_logs`

### 13.1. Propósito

Registra logs funcionales sanitizados de una ejecución.

No reemplaza observabilidad técnica ni Audit.

---

### 13.2. Campos

| Campo                        |         Tipo | Requerido | Descripción           |
| ---------------------------- | -----------: | --------: | --------------------- |
| `id`                         |         UUID |        Sí | Identificador         |
| `tenant_id`                  |         UUID |        Sí | Tenant propietario    |
| `workflow_execution_id`      |         UUID |        Sí | Ejecución asociada    |
| `workflow_step_execution_id` |         UUID |        No | Step asociado         |
| `level`                      |         enum |        Sí | debug/info/warn/error |
| `message`                    | varchar(500) |        Sí | Mensaje sanitizado    |
| `metadata_sanitized`         |        jsonb |        No | Metadata segura       |
| `created_at`                 |  timestamptz |        Sí | Fecha creación        |

---

### 13.3. Reglas

```text id="awb-execution-log-rules"
- tenant_id obligatorio.
- workflow_execution_id tenant-scoped.
- metadata_sanitized no contiene secrets.
- metadata_sanitized no contiene raw payload.
- metadata_sanitized no contiene storageKey.
- message no contiene tokens.
- No update ordinario.
- No physical delete ordinario.
```

---

## 14. Tabla `workflow_dead_letters`

### 14.1. Propósito

Registra ejecuciones fallidas no recuperables o con retries agotados.

---

### 14.2. Campos

| Campo                    |         Tipo | Requerido | Descripción                                |
| ------------------------ | -----------: | --------: | ------------------------------------------ |
| `id`                     |         UUID |        Sí | Identificador                              |
| `tenant_id`              |         UUID |        Sí | Tenant propietario                         |
| `workflow_execution_id`  |         UUID |        Sí | Ejecución fallida                          |
| `workflow_definition_id` |         UUID |        Sí | Workflow                                   |
| `workflow_version_id`    |         UUID |        Sí | Versión                                    |
| `reason_code`            | varchar(120) |        Sí | Código de causa                            |
| `failure_reason`         |         text |        Sí | Fallo sanitizado                           |
| `last_error_sanitized`   |        jsonb |        No | Último error sanitizado                    |
| `retry_count`            |      integer |        Sí | Reintentos usados                          |
| `status`                 |         enum |        Sí | open/underReview/resolved/ignored/archived |
| `resolved_by`            |         UUID |        No | Actor que resolvió                         |
| `ignored_by`             |         UUID |        No | Actor que ignoró                           |
| `archived_by`            |         UUID |        No | Actor que archivó                          |
| `created_at`             |  timestamptz |        Sí | Fecha creación                             |
| `updated_at`             |  timestamptz |        Sí | Fecha actualización                        |
| `resolved_at`            |  timestamptz |        No | Fecha resolución                           |
| `ignored_at`             |  timestamptz |        No | Fecha ignorado                             |
| `archived_at`            |  timestamptz |        No | Archivo lógico                             |

---

### 14.3. Reglas

```text id="awb-dead-letter-rules"
- tenant_id obligatorio.
- workflow_execution_id debe pertenecer al tenant.
- Se crea al agotar retries o detectar error no recuperable.
- failure_reason se sanitiza.
- last_error_sanitized no contiene raw stack trace productivo.
- resolved no reintenta automáticamente.
- ignored no borra execution.
- archived no elimina historial.
```

---

## 15. Tabla `workflow_exports`

### 15.1. Propósito

Registra exportaciones administrativas de workflows, versions, executions, dead letters e historial.

---

### 15.2. Campos

| Campo                |        Tipo | Requerido | Descripción                                    |
| -------------------- | ----------: | --------: | ---------------------------------------------- |
| `id`                 |        UUID |        Sí | Identificador                                  |
| `tenant_id`          |        UUID |        Sí | Tenant propietario                             |
| `export_type`        |        enum |        Sí | Tipo de export                                 |
| `format`             |        enum |        Sí | json/xlsx/pdf                                  |
| `filters`            |       jsonb |        No | Filtros sanitizados                            |
| `status`             |        enum |        Sí | requested/processing/completed/failed/archived |
| `secure_document_id` |        UUID |        No | Documento seguro                               |
| `requested_by`       |        UUID |        Sí | Actor solicitante                              |
| `completed_at`       | timestamptz |        No | Fecha completado                               |
| `failed_at`          | timestamptz |        No | Fecha fallido                                  |
| `failure_reason`     |        text |        No | Razón sanitizada                               |
| `created_at`         | timestamptz |        Sí | Fecha creación                                 |
| `updated_at`         | timestamptz |        Sí | Fecha actualización                            |
| `archived_at`        | timestamptz |        No | Archivo lógico                                 |

---

### 15.3. Reglas

```text id="awb-export-rules"
- Export siempre tenant-scoped.
- Export sensible requiere permiso reforzado.
- filters se sanitiza.
- completed requiere secure_document_id.
- failed requiere failure_reason.
- No se guarda storageKey.
- No se guarda signedUrl persistente.
- No se guarda archivo raw.
- Export se audita.
```

---

## 16. Enums

### 16.1. `AutomationCategory`

```text id="awb-enum-category"
financial
payments
accountStatements
reservations
fines
meetings
voting
certifiedMinutes
communications
documents
maintenance
inventory
accessControl
reports
operations
security
privacy
system
manual
schedule
```

---

### 16.2. `WorkflowTriggerType`

```text id="awb-enum-trigger-type"
event
scheduled
manual
system
```

---

### 16.3. `WorkflowActionType`

```text id="awb-enum-action-type"
notification
report
document
administrativeTask
reviewRequest
escalation
moduleNotification
systemNote
```

---

### 16.4. `AutomationSensitivity`

```text id="awb-enum-sensitivity"
internal
restricted
financialSensitive
privacySensitive
securitySensitive
operationalSensitive
```

---

### 16.5. `AutomationDefinitionStatus`

```text id="awb-enum-definition-status"
active
deprecated
archived
```

---

### 16.6. `TenantWorkflowDefinitionStatus`

```text id="awb-enum-workflow-status"
draft
active
inactive
archived
```

---

### 16.7. `TenantWorkflowVersionStatus`

```text id="awb-enum-version-status"
draft
reviewReady
approved
rejected
scheduled
active
superseded
deactivated
archived
```

---

### 16.8. `TenantWorkflowActivationType`

```text id="awb-enum-activation-type"
immediate
scheduled
deactivation
replacement
system
```

---

### 16.9. `TenantWorkflowActivationStatus`

```text id="awb-enum-activation-status"
scheduled
active
deactivated
cancelled
failed
archived
```

---

### 16.10. `WorkflowExecutionStatus`

```text id="awb-enum-execution-status"
queued
running
succeeded
partiallySucceeded
failed
cancelled
retrying
deadLettered
skipped
```

---

### 16.11. `WorkflowStepExecutionStatus`

```text id="awb-enum-step-status"
pending
running
succeeded
failed
skipped
retrying
cancelled
```

---

### 16.12. `WorkflowExecutionLogLevel`

```text id="awb-enum-log-level"
debug
info
warn
error
```

---

### 16.13. `WorkflowDeadLetterStatus`

```text id="awb-enum-dead-letter-status"
open
underReview
resolved
ignored
archived
```

---

### 16.14. `WorkflowExportType`

```text id="awb-enum-export-type"
workflows
workflowVersions
executions
failedExecutions
deadLetters
auditSnapshot
fullAutomationHistory
```

---

### 16.15. `WorkflowExportFormat`

```text id="awb-enum-export-format"
json
xlsx
pdf
```

---

### 16.16. `WorkflowExportStatus`

```text id="awb-enum-export-status"
requested
processing
completed
failed
archived
```

---

## 17. Prisma schema preliminar

> Este bloque es una propuesta inicial. El schema final puede ajustarse durante implementación, pero debe respetar las reglas de seguridad, multitenancy, idempotencia, versionamiento y auditoría definidas en este documento.

```prisma id="awb-prisma-schema"
enum AutomationCategory {
  financial
  payments
  accountStatements
  reservations
  fines
  meetings
  voting
  certifiedMinutes
  communications
  documents
  maintenance
  inventory
  accessControl
  reports
  operations
  security
  privacy
  system
  manual
  schedule
}

enum WorkflowTriggerType {
  event
  scheduled
  manual
  system
}

enum WorkflowActionType {
  notification
  report
  document
  administrativeTask
  reviewRequest
  escalation
  moduleNotification
  systemNote
}

enum AutomationSensitivity {
  internal
  restricted
  financialSensitive
  privacySensitive
  securitySensitive
  operationalSensitive
}

enum AutomationDefinitionStatus {
  active
  deprecated
  archived
}

enum TenantWorkflowDefinitionStatus {
  draft
  active
  inactive
  archived
}

enum TenantWorkflowVersionStatus {
  draft
  reviewReady
  approved
  rejected
  scheduled
  active
  superseded
  deactivated
  archived
}

enum TenantWorkflowActivationType {
  immediate
  scheduled
  deactivation
  replacement
  system
}

enum TenantWorkflowActivationStatus {
  scheduled
  active
  deactivated
  cancelled
  failed
  archived
}

enum WorkflowExecutionStatus {
  queued
  running
  succeeded
  partiallySucceeded
  failed
  cancelled
  retrying
  deadLettered
  skipped
}

enum WorkflowStepExecutionStatus {
  pending
  running
  succeeded
  failed
  skipped
  retrying
  cancelled
}

enum WorkflowExecutionLogLevel {
  debug
  info
  warn
  error
}

enum WorkflowDeadLetterStatus {
  open
  underReview
  resolved
  ignored
  archived
}

enum WorkflowExportType {
  workflows
  workflowVersions
  executions
  failedExecutions
  deadLetters
  auditSnapshot
  fullAutomationHistory
}

enum WorkflowExportFormat {
  json
  xlsx
  pdf
}

enum WorkflowExportStatus {
  requested
  processing
  completed
  failed
  archived
}

model WorkflowTriggerDefinition {
  id                 String                     @id @default(uuid()) @db.Uuid
  triggerKey         String                     @unique @map("trigger_key") @db.VarChar(180)
  category           AutomationCategory
  sourceModule       String                     @map("source_module") @db.VarChar(120)
  triggerType        WorkflowTriggerType        @map("trigger_type")
  eventName          String?                    @map("event_name") @db.VarChar(180)
  schema             Json
  description        String?
  sensitivity        AutomationSensitivity      @default(internal)
  isTenantEnabled    Boolean                    @default(true) @map("is_tenant_enabled")
  requiresPermission String?                    @map("requires_permission") @db.VarChar(160)
  status             AutomationDefinitionStatus @default(active)

  createdBy          String                     @map("created_by") @db.Uuid
  updatedBy          String?                    @map("updated_by") @db.Uuid
  archivedBy         String?                    @map("archived_by") @db.Uuid

  createdAt          DateTime                   @default(now()) @map("created_at") @db.Timestamptz
  updatedAt          DateTime                   @updatedAt @map("updated_at") @db.Timestamptz
  archivedAt         DateTime?                  @map("archived_at") @db.Timestamptz

  workflowVersions   TenantWorkflowVersion[]
  executions         WorkflowExecution[]

  @@index([category, status])
  @@index([sourceModule])
  @@index([triggerType])
  @@index([sensitivity])
  @@map("workflow_trigger_definitions")
}

model WorkflowActionDefinition {
  id                 String                     @id @default(uuid()) @db.Uuid
  actionKey          String                     @unique @map("action_key") @db.VarChar(180)
  category           AutomationCategory
  targetModule       String                     @map("target_module") @db.VarChar(120)
  actionType         WorkflowActionType         @map("action_type")
  schema             Json
  description        String?
  sensitivity        AutomationSensitivity      @default(internal)
  requiresPermission String?                    @map("requires_permission") @db.VarChar(160)
  requiresApproval   Boolean                    @default(false) @map("requires_approval")
  isDestructive      Boolean                    @default(false) @map("is_destructive")
  isFinancial        Boolean                    @default(false) @map("is_financial")
  isExternal         Boolean                    @default(false) @map("is_external")
  isTenantEnabled    Boolean                    @default(true) @map("is_tenant_enabled")
  status             AutomationDefinitionStatus @default(active)

  createdBy          String                     @map("created_by") @db.Uuid
  updatedBy          String?                    @map("updated_by") @db.Uuid
  archivedBy         String?                    @map("archived_by") @db.Uuid

  createdAt          DateTime                   @default(now()) @map("created_at") @db.Timestamptz
  updatedAt          DateTime                   @updatedAt @map("updated_at") @db.Timestamptz
  archivedAt         DateTime?                  @map("archived_at") @db.Timestamptz

  stepExecutions     WorkflowStepExecution[]

  @@index([category, status])
  @@index([targetModule])
  @@index([actionType])
  @@index([sensitivity])
  @@index([isDestructive, isFinancial, isExternal])
  @@map("workflow_action_definitions")
}

model TenantWorkflowDefinition {
  id                 String                         @id @default(uuid()) @db.Uuid
  tenantId           String                         @map("tenant_id") @db.Uuid
  workflowCode       String                         @map("workflow_code") @db.VarChar(120)
  name               String                         @db.VarChar(180)
  description        String?
  category           AutomationCategory
  status             TenantWorkflowDefinitionStatus @default(draft)
  ownerUserProfileId String?                        @map("owner_user_profile_id") @db.Uuid

  createdBy          String                         @map("created_by") @db.Uuid
  updatedBy          String?                        @map("updated_by") @db.Uuid
  archivedBy         String?                        @map("archived_by") @db.Uuid

  createdAt          DateTime                       @default(now()) @map("created_at") @db.Timestamptz
  updatedAt          DateTime                       @updatedAt @map("updated_at") @db.Timestamptz
  archivedAt         DateTime?                      @map("archived_at") @db.Timestamptz

  tenant             Tenant                         @relation(fields: [tenantId], references: [id])
  versions           TenantWorkflowVersion[]
  activations        TenantWorkflowActivation[]
  executions         WorkflowExecution[]
  stepExecutions     WorkflowStepExecution[]
  deadLetters        WorkflowDeadLetter[]

  @@unique([tenantId, workflowCode])
  @@index([tenantId, category, status])
  @@index([tenantId, ownerUserProfileId])
  @@map("tenant_workflow_definitions")
}

model TenantWorkflowVersion {
  id                    String                      @id @default(uuid()) @db.Uuid
  tenantId              String                      @map("tenant_id") @db.Uuid
  workflowDefinitionId  String                      @map("workflow_definition_id") @db.Uuid
  versionNumber         Int                         @map("version_number")
  versionLabel          String                      @map("version_label") @db.VarChar(40)

  triggerDefinitionId   String                      @map("trigger_definition_id") @db.Uuid
  triggerKey            String                      @map("trigger_key") @db.VarChar(180)
  triggerConfig         Json                        @map("trigger_config")
  conditionConfig       Json?                       @map("condition_config")
  actionGraph           Json                        @map("action_graph")
  retryPolicy           Json                        @map("retry_policy")

  status                TenantWorkflowVersionStatus @default(draft)
  effectiveFrom         DateTime?                   @map("effective_from") @db.Timestamptz
  effectiveUntil        DateTime?                   @map("effective_until") @db.Timestamptz
  changeReason          String                      @map("change_reason")
  reviewNotes           String?                     @map("review_notes")
  rejectionReason       String?                     @map("rejection_reason")

  createdBy             String                      @map("created_by") @db.Uuid
  updatedBy             String?                     @map("updated_by") @db.Uuid
  reviewedBy            String?                     @map("reviewed_by") @db.Uuid
  approvedBy            String?                     @map("approved_by") @db.Uuid
  rejectedBy            String?                     @map("rejected_by") @db.Uuid
  activatedBy           String?                     @map("activated_by") @db.Uuid
  deactivatedBy         String?                     @map("deactivated_by") @db.Uuid
  archivedBy            String?                     @map("archived_by") @db.Uuid

  createdAt             DateTime                    @default(now()) @map("created_at") @db.Timestamptz
  updatedAt             DateTime                    @updatedAt @map("updated_at") @db.Timestamptz
  reviewedAt            DateTime?                   @map("reviewed_at") @db.Timestamptz
  approvedAt            DateTime?                   @map("approved_at") @db.Timestamptz
  rejectedAt            DateTime?                   @map("rejected_at") @db.Timestamptz
  activatedAt           DateTime?                   @map("activated_at") @db.Timestamptz
  deactivatedAt         DateTime?                   @map("deactivated_at") @db.Timestamptz
  archivedAt            DateTime?                   @map("archived_at") @db.Timestamptz

  tenant                Tenant                      @relation(fields: [tenantId], references: [id])
  workflowDefinition    TenantWorkflowDefinition    @relation(fields: [workflowDefinitionId], references: [id])
  triggerDefinition     WorkflowTriggerDefinition   @relation(fields: [triggerDefinitionId], references: [id])
  activations           TenantWorkflowActivation[]
  executions            WorkflowExecution[]
  stepExecutions        WorkflowStepExecution[]
  deadLetters           WorkflowDeadLetter[]

  @@unique([tenantId, workflowDefinitionId, versionNumber])
  @@index([tenantId, workflowDefinitionId, status])
  @@index([tenantId, triggerKey, status])
  @@index([tenantId, effectiveFrom, effectiveUntil])
  @@map("tenant_workflow_versions")
}

model TenantWorkflowActivation {
  id                         String                         @id @default(uuid()) @db.Uuid
  tenantId                   String                         @map("tenant_id") @db.Uuid
  workflowDefinitionId       String                         @map("workflow_definition_id") @db.Uuid
  workflowVersionId          String                         @map("workflow_version_id") @db.Uuid
  activationType             TenantWorkflowActivationType   @map("activation_type")
  status                     TenantWorkflowActivationStatus @default(scheduled)
  effectiveFrom              DateTime                       @map("effective_from") @db.Timestamptz
  effectiveUntil             DateTime?                      @map("effective_until") @db.Timestamptz
  activationReason           String                         @map("activation_reason")
  previousWorkflowVersionId  String?                        @map("previous_workflow_version_id") @db.Uuid

  createdBy                  String                         @map("created_by") @db.Uuid
  activatedBy                String?                        @map("activated_by") @db.Uuid
  deactivatedBy              String?                        @map("deactivated_by") @db.Uuid
  cancelledBy                String?                        @map("cancelled_by") @db.Uuid
  archivedBy                 String?                        @map("archived_by") @db.Uuid

  createdAt                  DateTime                       @default(now()) @map("created_at") @db.Timestamptz
  updatedAt                  DateTime                       @updatedAt @map("updated_at") @db.Timestamptz
  activatedAt                DateTime?                      @map("activated_at") @db.Timestamptz
  deactivatedAt              DateTime?                      @map("deactivated_at") @db.Timestamptz
  cancelledAt                DateTime?                      @map("cancelled_at") @db.Timestamptz
  archivedAt                 DateTime?                      @map("archived_at") @db.Timestamptz

  tenant                     Tenant                         @relation(fields: [tenantId], references: [id])
  workflowDefinition          TenantWorkflowDefinition       @relation(fields: [workflowDefinitionId], references: [id])
  workflowVersion             TenantWorkflowVersion          @relation(fields: [workflowVersionId], references: [id])

  @@index([tenantId, workflowDefinitionId, status])
  @@index([tenantId, workflowVersionId])
  @@index([tenantId, effectiveFrom, effectiveUntil])
  @@map("tenant_workflow_activations")
}

model WorkflowExecution {
  id                         String                  @id @default(uuid()) @db.Uuid
  tenantId                   String                  @map("tenant_id") @db.Uuid
  workflowDefinitionId       String                  @map("workflow_definition_id") @db.Uuid
  workflowVersionId          String                  @map("workflow_version_id") @db.Uuid
  triggerDefinitionId        String                  @map("trigger_definition_id") @db.Uuid
  triggerKey                 String                  @map("trigger_key") @db.VarChar(180)
  triggerType                WorkflowTriggerType     @map("trigger_type")
  sourceModule               String?                 @map("source_module") @db.VarChar(120)
  sourceEventId              String?                 @map("source_event_id") @db.VarChar(180)
  scheduledWindowKey         String?                 @map("scheduled_window_key") @db.VarChar(180)
  manualRunId                String?                 @map("manual_run_id") @db.Uuid
  idempotencyKey             String                  @map("idempotency_key") @db.VarChar(300)
  status                     WorkflowExecutionStatus @default(queued)
  priority                   Int                     @default(0)
  inputSanitized             Json?                   @map("input_sanitized")
  outputSanitized            Json?                   @map("output_sanitized")
  failureReason              String?                 @map("failure_reason")
  errorCode                  String?                 @map("error_code") @db.VarChar(120)
  retryCount                 Int                     @default(0) @map("retry_count")
  maxRetries                 Int                     @default(3) @map("max_retries")
  triggeredByUserProfileId   String?                 @map("triggered_by_user_profile_id") @db.Uuid

  startedAt                  DateTime?               @map("started_at") @db.Timestamptz
  finishedAt                 DateTime?               @map("finished_at") @db.Timestamptz
  failedAt                   DateTime?               @map("failed_at") @db.Timestamptz
  cancelledAt                DateTime?               @map("cancelled_at") @db.Timestamptz
  queuedAt                   DateTime                @default(now()) @map("queued_at") @db.Timestamptz
  correlationId              String                  @map("correlation_id") @db.VarChar(120)
  traceId                    String                  @map("trace_id") @db.VarChar(120)

  createdAt                  DateTime                @default(now()) @map("created_at") @db.Timestamptz
  updatedAt                  DateTime                @updatedAt @map("updated_at") @db.Timestamptz

  tenant                     Tenant                  @relation(fields: [tenantId], references: [id])
  workflowDefinition          TenantWorkflowDefinition @relation(fields: [workflowDefinitionId], references: [id])
  workflowVersion             TenantWorkflowVersion  @relation(fields: [workflowVersionId], references: [id])
  triggerDefinition           WorkflowTriggerDefinition @relation(fields: [triggerDefinitionId], references: [id])
  stepExecutions              WorkflowStepExecution[]
  executionLogs               WorkflowExecutionLog[]
  deadLetter                  WorkflowDeadLetter?

  @@unique([tenantId, workflowDefinitionId, idempotencyKey])
  @@index([tenantId, workflowDefinitionId, status])
  @@index([tenantId, workflowVersionId])
  @@index([tenantId, triggerKey, status])
  @@index([tenantId, sourceEventId])
  @@index([tenantId, scheduledWindowKey])
  @@index([tenantId, manualRunId])
  @@index([tenantId, queuedAt])
  @@index([tenantId, createdAt])
  @@map("workflow_executions")
}

model WorkflowStepExecution {
  id                       String                      @id @default(uuid()) @db.Uuid
  tenantId                 String                      @map("tenant_id") @db.Uuid
  workflowExecutionId      String                      @map("workflow_execution_id") @db.Uuid
  workflowDefinitionId     String                      @map("workflow_definition_id") @db.Uuid
  workflowVersionId        String                      @map("workflow_version_id") @db.Uuid
  stepKey                  String                      @map("step_key") @db.VarChar(120)
  stepOrder                Int                         @map("step_order")
  actionDefinitionId       String                      @map("action_definition_id") @db.Uuid
  actionKey                String                      @map("action_key") @db.VarChar(180)
  targetModule             String                      @map("target_module") @db.VarChar(120)
  status                   WorkflowStepExecutionStatus @default(pending)
  inputSanitized           Json?                       @map("input_sanitized")
  outputSanitized          Json?                       @map("output_sanitized")
  targetResourceType       String?                     @map("target_resource_type") @db.VarChar(100)
  targetResourceId         String?                     @map("target_resource_id") @db.Uuid
  failureReason            String?                     @map("failure_reason")
  errorCode                String?                     @map("error_code") @db.VarChar(120)
  retryCount               Int                         @default(0) @map("retry_count")
  maxRetries               Int                         @default(0) @map("max_retries")

  startedAt                DateTime?                   @map("started_at") @db.Timestamptz
  finishedAt               DateTime?                   @map("finished_at") @db.Timestamptz
  failedAt                 DateTime?                   @map("failed_at") @db.Timestamptz
  cancelledAt              DateTime?                   @map("cancelled_at") @db.Timestamptz

  createdAt                DateTime                    @default(now()) @map("created_at") @db.Timestamptz
  updatedAt                DateTime                    @updatedAt @map("updated_at") @db.Timestamptz

  tenant                   Tenant                      @relation(fields: [tenantId], references: [id])
  workflowExecution        WorkflowExecution           @relation(fields: [workflowExecutionId], references: [id])
  workflowDefinition        TenantWorkflowDefinition    @relation(fields: [workflowDefinitionId], references: [id])
  workflowVersion           TenantWorkflowVersion       @relation(fields: [workflowVersionId], references: [id])
  actionDefinition          WorkflowActionDefinition    @relation(fields: [actionDefinitionId], references: [id])
  executionLogs             WorkflowExecutionLog[]

  @@unique([tenantId, workflowExecutionId, stepKey])
  @@index([tenantId, workflowExecutionId, status])
  @@index([tenantId, actionKey, status])
  @@index([tenantId, targetModule])
  @@index([tenantId, targetResourceType, targetResourceId])
  @@map("workflow_step_executions")
}

model WorkflowExecutionLog {
  id                       String                    @id @default(uuid()) @db.Uuid
  tenantId                 String                    @map("tenant_id") @db.Uuid
  workflowExecutionId      String                    @map("workflow_execution_id") @db.Uuid
  workflowStepExecutionId  String?                   @map("workflow_step_execution_id") @db.Uuid
  level                    WorkflowExecutionLogLevel
  message                  String                    @db.VarChar(500)
  metadataSanitized        Json?                     @map("metadata_sanitized")
  createdAt                DateTime                  @default(now()) @map("created_at") @db.Timestamptz

  tenant                   Tenant                    @relation(fields: [tenantId], references: [id])
  workflowExecution        WorkflowExecution         @relation(fields: [workflowExecutionId], references: [id])
  workflowStepExecution    WorkflowStepExecution?    @relation(fields: [workflowStepExecutionId], references: [id])

  @@index([tenantId, workflowExecutionId])
  @@index([tenantId, workflowStepExecutionId])
  @@index([tenantId, level])
  @@index([tenantId, createdAt])
  @@map("workflow_execution_logs")
}

model WorkflowDeadLetter {
  id                    String                   @id @default(uuid()) @db.Uuid
  tenantId              String                   @map("tenant_id") @db.Uuid
  workflowExecutionId   String                   @unique @map("workflow_execution_id") @db.Uuid
  workflowDefinitionId  String                   @map("workflow_definition_id") @db.Uuid
  workflowVersionId     String                   @map("workflow_version_id") @db.Uuid
  reasonCode            String                   @map("reason_code") @db.VarChar(120)
  failureReason         String                   @map("failure_reason")
  lastErrorSanitized    Json?                    @map("last_error_sanitized")
  retryCount            Int                      @default(0) @map("retry_count")
  status                WorkflowDeadLetterStatus @default(open)

  resolvedBy            String?                  @map("resolved_by") @db.Uuid
  ignoredBy             String?                  @map("ignored_by") @db.Uuid
  archivedBy            String?                  @map("archived_by") @db.Uuid

  createdAt             DateTime                 @default(now()) @map("created_at") @db.Timestamptz
  updatedAt             DateTime                 @updatedAt @map("updated_at") @db.Timestamptz
  resolvedAt            DateTime?                @map("resolved_at") @db.Timestamptz
  ignoredAt             DateTime?                @map("ignored_at") @db.Timestamptz
  archivedAt            DateTime?                @map("archived_at") @db.Timestamptz

  tenant                Tenant                   @relation(fields: [tenantId], references: [id])
  workflowExecution     WorkflowExecution        @relation(fields: [workflowExecutionId], references: [id])
  workflowDefinition    TenantWorkflowDefinition @relation(fields: [workflowDefinitionId], references: [id])
  workflowVersion       TenantWorkflowVersion    @relation(fields: [workflowVersionId], references: [id])

  @@index([tenantId, status])
  @@index([tenantId, workflowDefinitionId])
  @@index([tenantId, createdAt])
  @@map("workflow_dead_letters")
}

model WorkflowExport {
  id                 String               @id @default(uuid()) @db.Uuid
  tenantId           String               @map("tenant_id") @db.Uuid
  exportType         WorkflowExportType   @map("export_type")
  format             WorkflowExportFormat
  filters            Json?
  status             WorkflowExportStatus @default(requested)
  secureDocumentId   String?              @map("secure_document_id") @db.Uuid
  requestedBy        String               @map("requested_by") @db.Uuid
  completedAt        DateTime?            @map("completed_at") @db.Timestamptz
  failedAt           DateTime?            @map("failed_at") @db.Timestamptz
  failureReason      String?              @map("failure_reason")
  createdAt          DateTime             @default(now()) @map("created_at") @db.Timestamptz
  updatedAt          DateTime             @updatedAt @map("updated_at") @db.Timestamptz
  archivedAt         DateTime?            @map("archived_at") @db.Timestamptz

  tenant             Tenant               @relation(fields: [tenantId], references: [id])

  @@index([tenantId, exportType, status])
  @@index([tenantId, createdAt])
  @@index([tenantId, secureDocumentId])
  @@map("workflow_exports")
}
```

---

## 18. Relaciones a agregar en `Tenant`

Agregar relaciones lógicas al modelo `Tenant` existente:

```prisma id="awb-tenant-relations"
model Tenant {
  // existing fields...

  tenantWorkflowDefinitions  TenantWorkflowDefinition[]
  tenantWorkflowVersions     TenantWorkflowVersion[]
  tenantWorkflowActivations  TenantWorkflowActivation[]
  workflowExecutions         WorkflowExecution[]
  workflowStepExecutions     WorkflowStepExecution[]
  workflowExecutionLogs      WorkflowExecutionLog[]
  workflowDeadLetters        WorkflowDeadLetter[]
  workflowExports            WorkflowExport[]
}
```

---

## 19. Índices recomendados

### 19.1. Catálogo global

```text id="awb-index-catalog"
workflow_trigger_definitions:
- unique(trigger_key)
- index(category, status)
- index(source_module)
- index(trigger_type)
- index(sensitivity)

workflow_action_definitions:
- unique(action_key)
- index(category, status)
- index(target_module)
- index(action_type)
- index(sensitivity)
- index(is_destructive, is_financial, is_external)
```

---

### 19.2. Workflows

```text id="awb-index-workflows"
tenant_workflow_definitions:
- unique(tenant_id, workflow_code)
- index(tenant_id, category, status)
- index(tenant_id, owner_user_profile_id)
```

---

### 19.3. Versions and activations

```text id="awb-index-versions-activations"
tenant_workflow_versions:
- unique(tenant_id, workflow_definition_id, version_number)
- index(tenant_id, workflow_definition_id, status)
- index(tenant_id, trigger_key, status)
- index(tenant_id, effective_from, effective_until)

tenant_workflow_activations:
- index(tenant_id, workflow_definition_id, status)
- index(tenant_id, workflow_version_id)
- index(tenant_id, effective_from, effective_until)
```

---

### 19.4. Executions

```text id="awb-index-executions"
workflow_executions:
- unique(tenant_id, workflow_definition_id, idempotency_key)
- index(tenant_id, workflow_definition_id, status)
- index(tenant_id, workflow_version_id)
- index(tenant_id, trigger_key, status)
- index(tenant_id, source_event_id)
- index(tenant_id, scheduled_window_key)
- index(tenant_id, manual_run_id)
- index(tenant_id, queued_at)
- index(tenant_id, created_at)
```

---

### 19.5. Steps, logs, dead letters and exports

```text id="awb-index-steps-logs"
workflow_step_executions:
- unique(tenant_id, workflow_execution_id, step_key)
- index(tenant_id, workflow_execution_id, status)
- index(tenant_id, action_key, status)
- index(tenant_id, target_module)
- index(tenant_id, target_resource_type, target_resource_id)

workflow_execution_logs:
- index(tenant_id, workflow_execution_id)
- index(tenant_id, workflow_step_execution_id)
- index(tenant_id, level)
- index(tenant_id, created_at)

workflow_dead_letters:
- unique(workflow_execution_id)
- index(tenant_id, status)
- index(tenant_id, workflow_definition_id)
- index(tenant_id, created_at)

workflow_exports:
- index(tenant_id, export_type, status)
- index(tenant_id, created_at)
- index(tenant_id, secure_document_id)
```

---

## 20. Constraints recomendadas

### 20.1. Effective windows

```text id="awb-constraints-effective"
- effective_until IS NULL OR effective_until > effective_from.
- activated_at requerido si activation status = active.
- deactivated_at requerido si activation status = deactivated.
- approved_at y approved_by requeridos si version status = approved.
- rejected_at, rejected_by y rejection_reason requeridos si version status = rejected.
```

---

### 20.2. Idempotencia

```text id="awb-constraints-idempotency"
- workflow_executions.idempotency_key NOT NULL.
- unique(tenant_id, workflow_definition_id, idempotency_key).
- source_event_id requerido si trigger_type=event.
- scheduled_window_key requerido si trigger_type=scheduled.
- manual_run_id requerido si trigger_type=manual.
- triggered_by_user_profile_id requerido si trigger_type=manual.
```

---

### 20.3. Partial indexes recomendados en PostgreSQL

Prisma puede no expresar todos los partial indexes directamente. Deben agregarse en migraciones SQL manuales.

```sql id="awb-partial-indexes"
CREATE UNIQUE INDEX uq_workflow_active_current
ON tenant_workflow_versions (tenant_id, workflow_definition_id)
WHERE status = 'active' AND effective_until IS NULL AND archived_at IS NULL;

CREATE UNIQUE INDEX uq_workflow_scheduled_same_effective
ON tenant_workflow_versions (tenant_id, workflow_definition_id, effective_from)
WHERE status = 'scheduled' AND archived_at IS NULL;

CREATE UNIQUE INDEX uq_execution_event_source
ON workflow_executions (tenant_id, workflow_definition_id, source_event_id)
WHERE trigger_type = 'event' AND source_event_id IS NOT NULL;

CREATE UNIQUE INDEX uq_execution_scheduled_window
ON workflow_executions (tenant_id, workflow_definition_id, scheduled_window_key)
WHERE trigger_type = 'scheduled' AND scheduled_window_key IS NOT NULL;

CREATE UNIQUE INDEX uq_execution_manual_run
ON workflow_executions (tenant_id, workflow_definition_id, manual_run_id)
WHERE trigger_type = 'manual' AND manual_run_id IS NOT NULL;
```

---

## 21. Estrategia de JSONB

### 21.1. Campos JSONB permitidos

```text id="awb-jsonb-allowed"
workflow_trigger_definitions.schema
workflow_action_definitions.schema
tenant_workflow_versions.trigger_config
tenant_workflow_versions.condition_config
tenant_workflow_versions.action_graph
tenant_workflow_versions.retry_policy
workflow_executions.input_sanitized
workflow_executions.output_sanitized
workflow_step_executions.input_sanitized
workflow_step_executions.output_sanitized
workflow_execution_logs.metadata_sanitized
workflow_dead_letters.last_error_sanitized
workflow_exports.filters
```

---

### 21.2. Claves prohibidas en JSONB

```text id="awb-jsonb-forbidden-keys"
secret
token
password
apiKey
privateKey
clientSecret
webhookSecret
databaseUrl
rawSql
sql
script
javascript
functionBody
executableCode
eval
Function
cronCommand
shellCommand
bashCommand
pythonCode
nodeCode
dynamicExpressionUnsafe
templateExpressionUnsafe
storageKey
signedUrl
paymentId
journalEntryId
bankTransactionId
reconciliationMatchId
gateOpenCommand
hardwareDeviceCommand
biometricTemplate
faceEmbedding
externalAiEnabled
externalAiRealDataAllowed
```

---

### 21.3. Reglas de validación

```text id="awb-jsonb-rules"
- JSONB debe validar contra schema correspondiente.
- JSONB no debe contener secretos.
- JSONB no debe contener código ejecutable.
- JSONB no debe contener raw SQL.
- JSONB no debe contener storageKey.
- JSONB no debe contener signedUrl persistente.
- JSONB no debe contener comandos de hardware.
- JSONB no debe contener payloads financieros destructivos.
- JSONB no debe contener datos personales masivos.
- JSONB no debe usarse para evadir estados, permisos o actores.
```

---

### 21.4. Sanitización previa a persistencia

Antes de persistir JSONB:

```text id="awb-jsonb-sanitization"
[ ] Validar schema.
[ ] Validar allowlist de claves.
[ ] Rechazar forbidden keys recursivamente.
[ ] Rechazar scripts.
[ ] Rechazar raw SQL.
[ ] Rechazar código ejecutable.
[ ] Rechazar storageKey.
[ ] Rechazar signedUrl persistente.
[ ] Rechazar payload raw sensible.
[ ] Limitar profundidad.
[ ] Limitar tamaño.
[ ] Sanitizar textos libres.
[ ] Sanitizar errores.
[ ] Sanitizar outputs de módulos consumidores.
```

---

## 22. Shape de `trigger_config`

### 22.1. Event trigger

```json id="awb-trigger-config-event"
{
  "eventName": "payments.paymentValidated",
  "sourceModule": "005-payments",
  "payloadFields": [
    "paymentId",
    "propertyUnitId",
    "status"
  ]
}
```

Reglas:

```text id="awb-trigger-event-rules"
- eventName debe coincidir con trigger definition.
- sourceModule debe coincidir con trigger definition.
- payloadFields debe estar en allowlist.
- No incluir payload completo si contiene datos sensibles.
```

---

### 22.2. Scheduled trigger

```json id="awb-trigger-config-scheduled"
{
  "scheduleType": "monthly",
  "dayOfMonth": 1,
  "time": "08:00",
  "timezoneSource": "tenant",
  "minimumIntervalMinutes": 60
}
```

Reglas:

```text id="awb-trigger-scheduled-rules"
- minimumIntervalMinutes >= 60.
- timezone se resuelve desde tenant/settings.
- No contiene comandos.
- No contiene cronCommand.
```

---

### 22.3. Manual trigger

```json id="awb-trigger-config-manual"
{
  "requiresReason": true,
  "allowedRoles": [
    "tenantAdmin",
    "financialManager"
  ]
}
```

Reglas:

```text id="awb-trigger-manual-rules"
- Manual run requiere actor.
- Manual run sensible requiere reason.
- allowedRoles no reemplaza PermissionGuard.
```

---

## 23. Shape de `condition_config`

### 23.1. Operadores permitidos

```text id="awb-condition-operators"
equals
notEquals
in
notIn
greaterThan
greaterThanOrEqual
lessThan
lessThanOrEqual
exists
notExists
and
or
not
```

---

### 23.2. Ejemplo

```json id="awb-condition-config-example"
{
  "and": [
    {
      "field": "event.status",
      "operator": "equals",
      "value": "validated"
    },
    {
      "field": "event.amount",
      "operator": "greaterThan",
      "value": "0.00"
    }
  ]
}
```

---

### 23.3. Reglas

```text id="awb-condition-config-rules"
- Solo campos allowlisted del trigger.
- No eval.
- No Function.
- No JavaScript.
- No rawSql.
- No regex peligrosa sin límite.
- No externalLookup.
- No crossTenantLookup.
- No acceso directo a DB.
```

---

## 24. Shape de `action_graph`

### 24.1. Grafo lineal MVP

```json id="awb-action-graph-example"
{
  "steps": [
    {
      "stepKey": "notify_resident",
      "stepOrder": 1,
      "actionKey": "notifications.sendToResident",
      "actionConfig": {
        "templateKey": "payments.paymentValidated",
        "audience": "sourceResident"
      },
      "onFailure": "failWorkflow",
      "timeoutSeconds": 30,
      "maxRetries": 2
    },
    {
      "stepKey": "create_followup_note",
      "stepOrder": 2,
      "actionKey": "operations.markWorkflowNote",
      "actionConfig": {
        "noteType": "system",
        "message": "Payment validation notification workflow completed."
      },
      "onFailure": "continueWorkflow",
      "timeoutSeconds": 15,
      "maxRetries": 0
    }
  ]
}
```

---

### 24.2. Reglas

```text id="awb-action-graph-rules"
- steps obligatorio.
- stepKey único por version.
- stepOrder entero positivo.
- actionKey debe existir en catálogo.
- actionConfig valida contra action schema.
- maxRetries por step no excede límite global.
- timeoutSeconds obligatorio o default controlado.
- onFailure = failWorkflow | continueWorkflow | skipStep.
- No ciclos.
- No recursion.
- No fan-out masivo.
- No actions fuera de catálogo.
- No actions financieras destructivas.
```

---

## 25. Shape de `retry_policy`

```json id="awb-retry-policy-example"
{
  "maxRetries": 3,
  "backoffStrategy": "exponential",
  "initialDelaySeconds": 60,
  "maxDelaySeconds": 3600
}
```

Reglas:

```text id="awb-retry-policy-rules"
- maxRetries obligatorio.
- maxRetries <= AUTOMATION_WORKFLOWS_MAX_RETRIES.
- backoffStrategy = fixed | exponential.
- initialDelaySeconds >= 1.
- maxDelaySeconds <= 3600 en MVP.
- No retries infinitos.
```

---

## 26. Estrategia de idempotencia

### 26.1. Formato recomendado

```text id="awb-idempotency-format"
tenant:{tenantId}:workflow:{workflowDefinitionId}:trigger:{triggerType}:source:{sourceKey}
```

---

### 26.2. Source keys

```text id="awb-idempotency-source-keys"
event-driven:
  source_event_id

scheduled:
  scheduled_window_key

manual:
  manual_run_id
```

---

### 26.3. Reglas

```text id="awb-idempotency-rules"
- idempotency_key se genera server-side.
- idempotency_key no se acepta arbitrariamente desde cliente.
- idempotency_key no contiene datos sensibles.
- idempotency_key único por tenant + workflow.
- Reintentos reutilizan execution lineage.
- Actions idempotentes deben recibir executionId/stepId cuando aplique.
```

---

## 27. Estrategia de estados y transiciones

### 27.1. `TenantWorkflowDefinitionStatus`

```text id="awb-status-workflow-definition-transitions"
draft -> active
draft -> archived
active -> inactive
active -> archived
inactive -> active
inactive -> archived
```

Prohibido:

```text id="awb-status-workflow-definition-forbidden"
archived -> active
archived -> inactive
```

---

### 27.2. `TenantWorkflowVersionStatus`

```text id="awb-status-workflow-version-transitions"
draft -> reviewReady
reviewReady -> approved
reviewReady -> rejected
approved -> scheduled
approved -> active
scheduled -> active
active -> superseded
active -> deactivated
superseded -> archived
deactivated -> archived
rejected -> archived
```

Prohibido:

```text id="awb-status-workflow-version-forbidden"
active -> draft
scheduled -> draft
rejected -> active
archived -> active
superseded -> active directo
```

---

### 27.3. `WorkflowExecutionStatus`

```text id="awb-status-execution-transitions"
queued -> running
queued -> cancelled
running -> succeeded
running -> partiallySucceeded
running -> failed
running -> retrying
running -> cancelled
retrying -> queued
failed -> retrying
failed -> deadLettered
failed -> cancelled
deadLettered -> cancelled
```

Prohibido:

```text id="awb-status-execution-forbidden"
succeeded -> running
cancelled -> running
deadLettered -> running automático
```

---

### 27.4. `WorkflowStepExecutionStatus`

```text id="awb-status-step-transitions"
pending -> running
pending -> skipped
running -> succeeded
running -> failed
running -> retrying
running -> cancelled
retrying -> running
failed -> retrying
failed -> skipped
```

---

### 27.5. `WorkflowDeadLetterStatus`

```text id="awb-status-dead-letter-transitions"
open -> underReview
open -> resolved
open -> ignored
underReview -> resolved
underReview -> ignored
resolved -> archived
ignored -> archived
```

Prohibido:

```text id="awb-status-dead-letter-forbidden"
resolved -> open
ignored -> open
archived -> open
```

---

## 28. Estrategia de scheduled windows

### 28.1. Formato recomendado

```text id="awb-scheduled-window-key-format"
{workflowDefinitionId}:{scheduleType}:{windowStartUtc}
```

Ejemplo:

```text id="awb-scheduled-window-key-example"
7a7e2f9e:monthly:2026-08-01T00:00:00.000Z
```

---

### 28.2. Reglas

```text id="awb-scheduled-window-rules"
- scheduled_window_key se genera server-side.
- Se calcula con timezone efectivo del tenant.
- Debe ser único por workflow.
- Debe impedir doble ejecución de la misma ventana.
- Frecuencia mínima MVP: 60 minutos.
```

---

## 29. Estrategia de retención

### 29.1. Catálogo

```text id="awb-retention-catalog"
- No physical delete ordinario.
- Usar archived_at.
- Definitions archivadas no se usan para nuevas versiones.
- Definitions usadas históricamente se conservan.
```

---

### 29.2. Workflows y versions

```text id="awb-retention-workflows"
- No physical delete ordinario.
- Workflow archived conserva versions.
- Version active/superseded/deactivated conserva historial.
- Version archived no se consume.
```

---

### 29.3. Executions

```text id="awb-retention-executions"
- No physical delete ordinario.
- Retención configurable futura.
- Execution conserva status final.
- input/output deben estar sanitizados.
- No almacenar payload raw sensible.
```

---

### 29.4. Logs y dead letters

```text id="awb-retention-logs-deadletters"
- Logs funcionales no reemplazan Audit.
- Logs pueden tener política de retención.
- Dead letters se conservan hasta resolución/archivo.
- Dead letter no contiene error raw sensible.
```

---

### 29.5. Exports

```text id="awb-retention-exports"
- Export record se conserva mientras exista secureDocumentId.
- Archivar export no elimina documento.
- Eliminación documental se gestiona en Secure Document Storage.
```

---

## 30. Migración inicial

### 30.1. Nombre sugerido

```text id="awb-migration-name"
026_create_automation_workflows_basic
```

---

### 30.2. Contenido

```text id="awb-migration-content"
[ ] Crear enums.
[ ] Crear workflow_trigger_definitions.
[ ] Crear workflow_action_definitions.
[ ] Crear tenant_workflow_definitions.
[ ] Crear tenant_workflow_versions.
[ ] Crear tenant_workflow_activations.
[ ] Crear workflow_executions.
[ ] Crear workflow_step_executions.
[ ] Crear workflow_execution_logs.
[ ] Crear workflow_dead_letters.
[ ] Crear workflow_exports.
[ ] Crear índices.
[ ] Crear unique constraints.
[ ] Crear partial indexes SQL.
[ ] Crear checks básicos.
[ ] Agregar relaciones en Prisma.
```

---

### 30.3. Seeds posteriores

```text id="awb-seed-process"
[ ] Ejecutar seed de workflow_trigger_definitions.
[ ] Ejecutar seed de workflow_action_definitions.
[ ] Validar idempotencia.
[ ] Validar que no existen secrets.
[ ] Validar que no existen scripts.
[ ] Validar que no existen actions destructivas.
[ ] Validar que no existen webhooks públicos.
[ ] Validar que no existe IA externa.
```

---

## 31. Seed inicial recomendado

### 31.1. Trigger definitions

```text id="awb-trigger-definitions-seed"
financial.chargeCreated
financial.chargeDueSoon
financial.chargeOverdue
payments.paymentSubmitted
payments.paymentValidated
payments.paymentRejected
accountStatements.statementGenerated

reservations.reservationCreated
reservations.reservationApproved
reservations.reservationCancelled
reservations.reservationStartingSoon

fines.fineCreated
fines.fineAppealSubmitted
fines.fineAppealResolved

meetings.meetingScheduled
meetings.meetingStartingSoon
meetings.attendanceClosed
voting.votingOpened
voting.votingClosed
certifiedMinutes.minutesPublished

communications.notificationFailed
communications.criticalNoticeUnread
communications.deliveryCompleted

documents.documentCreated
documents.documentPublished
documents.documentDownloadFailed

maintenance.requestCreated
maintenance.workOrderAssigned
maintenance.workOrderCompleted
maintenance.workOrderOverdue

inventory.lowStockDetected
inventory.stockAdjustmentApproved
inventory.consumptionPosted

access.visitorAuthorizationCreated
access.visitorCheckedIn
access.visitorCheckedOut
access.deniedAccessRecorded
access.openCheckInExceeded
access.incidentCreated

schedule.daily
schedule.weekly
schedule.monthly
schedule.cronBasic

manual.runWorkflow
manual.generateReport
manual.sendReminder
manual.reprocessFailedExecution
```

---

### 31.2. Action definitions

```text id="awb-action-definitions-seed"
notifications.sendToResident
notifications.sendToUnit
notifications.sendToRole
notifications.sendToTenantAdmins
notifications.sendCriticalAlert
notifications.sendDigest

reports.generateBasicReport
reports.generateAndStoreExport
reports.sendReportLinkToAdmins

documents.createExportReference
documents.notifyDocumentAvailable

operations.createAdministrativeTask
operations.createFollowUpReminder
operations.markWorkflowNote
operations.escalateToRole
operations.createReviewRequest

maintenance.notifyWorkOrderOverdue
access.notifyOpenCheckInExceeded
inventory.notifyLowStock
reservations.notifyUpcomingReservation
meetings.notifyUpcomingMeeting
payments.notifyPaymentValidationResult
dues.notifyChargeDueSoon
```

---

## 32. Consultas críticas

### 32.1. Obtener workflow activo por trigger

```typescript id="awb-query-active-workflows-by-trigger"
const activeVersions = await prisma.tenantWorkflowVersion.findMany({
  where: {
    tenantId,
    triggerKey,
    status: "active",
    archivedAt: null,
    effectiveFrom: { lte: effectiveAt },
    OR: [
      { effectiveUntil: null },
      { effectiveUntil: { gt: effectiveAt } }
    ],
    workflowDefinition: {
      tenantId,
      status: "active",
      archivedAt: null
    }
  },
  orderBy: {
    effectiveFrom: "desc"
  }
});
```

---

### 32.2. Crear execution idempotente

```typescript id="awb-query-create-idempotent-execution"
const execution = await prisma.workflowExecution.create({
  data: {
    tenantId,
    workflowDefinitionId,
    workflowVersionId,
    triggerDefinitionId,
    triggerKey,
    triggerType,
    sourceEventId,
    scheduledWindowKey,
    manualRunId,
    idempotencyKey,
    status: "queued",
    correlationId,
    traceId
  }
});
```

Constraint requerida:

```text id="awb-query-idempotency-constraint"
unique(tenant_id, workflow_definition_id, idempotency_key)
```

---

### 32.3. Listar executions

```typescript id="awb-query-list-executions"
const executions = await prisma.workflowExecution.findMany({
  where: {
    tenantId,
    workflowDefinitionId,
    status,
    createdAt: {
      gte: dateFrom,
      lte: dateTo
    }
  },
  orderBy: {
    createdAt: "desc"
  },
  take: pageSize,
  skip
});
```

---

### 32.4. Obtener dead letters abiertas

```typescript id="awb-query-dead-letters"
const deadLetters = await prisma.workflowDeadLetter.findMany({
  where: {
    tenantId,
    status: {
      in: ["open", "underReview"]
    }
  },
  orderBy: {
    createdAt: "desc"
  }
});
```

---

## 33. Performance

### 33.1. Dataset esperado MVP

```text id="awb-performance-dataset"
Global:
- 50 trigger definitions.
- 30 action definitions.

Por tenant:
- 25 workflow definitions.
- 75 workflow versions históricas.
- 25 active workflow versions.
- 100 activations.
- 10,000 executions.
- 25,000 step executions.
- 50,000 execution logs.
- 500 dead letters.
- 100 exports.
```

---

### 33.2. Objetivos

```text id="awb-performance-objectives"
- Encolar ejecución p95 < 500 ms.
- Buscar workflows activos por trigger p95 < 500 ms.
- Listar workflows p95 < 800 ms.
- Listar executions p95 < 1200 ms.
- Listar dead letters p95 < 1200 ms.
- Procesar step simple p95 < 2000 ms.
- Export pequeño p95 < 3000 ms.
- pageSize máximo = 100.
```

---

### 33.3. Consideraciones

```text id="awb-performance-considerations"
- Indexar tenant_id + trigger_key + status.
- Indexar tenant_id + workflow_definition_id + idempotency_key.
- Indexar tenant_id + status + created_at.
- Usar select explícito.
- Evitar N+1.
- Limitar tamaño de payloads JSONB.
- Usar paginación obligatoria.
- Mantener logs funcionales acotados.
- Separar logs técnicos de logs funcionales.
```

---

## 34. Concurrencia

### 34.1. Casos críticos

```text id="awb-concurrency-cases"
- Dos usuarios crean versionNumber para el mismo workflow.
- Dos usuarios activan versiones distintas del mismo workflow.
- El mismo evento llega dos veces.
- Scheduler intenta ejecutar dos veces la misma ventana.
- Retry automático y retry manual ocurren simultáneamente.
- Cancelación ocurre mientras execution está running.
- Step termina después de cancelación.
- Dead letter se resuelve mientras se reintenta.
- Export se solicita dos veces con los mismos filtros.
```

---

### 34.2. Controles

```text id="awb-concurrency-controls"
- Transacciones.
- Unique tenant_id + workflow_definition_id + version_number.
- Unique tenant_id + workflow_definition_id + idempotency_key.
- Unique event source por workflow.
- Unique scheduled window por workflow.
- Locks por tenant + workflow.
- Locks por execution.
- Update condicional por status.
- BullMQ jobId determinístico.
- Retry lineage.
- Audit de conflictos.
```

---

## 35. Data governance

### 35.1. Datos sensibles

```text id="awb-sensitive-data"
- action_graph.
- condition_config.
- trigger_config.
- input_sanitized.
- output_sanitized.
- execution logs.
- dead letter error data.
- exports.
- workflow activations.
- workflow execution metadata.
```

---

### 35.2. Datos prohibidos

```text id="awb-data-governance-prohibited"
- secretos;
- tokens;
- contraseñas;
- API keys;
- private keys;
- client secrets;
- storageKey;
- signedUrl persistente;
- raw SQL;
- scripts;
- código ejecutable;
- datos personales masivos;
- comprobantes raw;
- documentos raw;
- payloads completos no sanitizados;
- credenciales externas;
- comandos de hardware;
- datos biométricos;
- face embeddings;
- datos reales enviados a IA externa.
```

---

### 35.3. IA externa

```text id="awb-ai-rule"
Ningún workflow, triggerConfig, actionGraph, execution, step, log, dead letter, export o payload real de tenant debe enviarse a IA externa en MVP.
```

Permitido:

```text id="awb-ai-allowed"
- documentación técnica;
- fixtures sintéticos;
- ejemplos ficticios;
- schemas sin datos reales;
- análisis local sin envío externo.
```

---

## 36. Compatibilidad con microservicios

El modelo se prepara para extracción futura porque:

```text id="awb-microservices-compat"
- Catálogos usan keys estables.
- Workflows usan UUIDs.
- Versions son inmutables una vez activas.
- Events usan envelope con eventName, tenantId y sourceEventId.
- Actions invocan puertos, no tablas externas.
- Queue abstraction permite worker separado.
- Idempotency keys son persistentes.
- Audit y observabilidad están desacopladas por puertos.
- Referencias externas se conservan como UUID/string, no FK fuerte.
```

---

## 37. Campos prohibidos

### 37.1. Prohibidos como columnas

No deben existir columnas con estos nombres en tablas del módulo:

```text id="awb-prohibited-columns"
secret
token
password
api_key
private_key
client_secret
webhook_secret
database_url
storage_key
signed_url
raw_sql
script
javascript
function_body
executable_code
cron_command
shell_command
payment_id
journal_entry_id
bank_transaction_id
reconciliation_match_id
gate_open_command
hardware_device_command
biometric_template
face_embedding
external_ai_enabled
external_ai_real_data_allowed
```

---

### 37.2. Prohibidos en JSONB

```text id="awb-prohibited-jsonb"
secret
token
password
apiKey
privateKey
clientSecret
webhookSecret
databaseUrl
storageKey
signedUrl
rawSql
sql
script
javascript
functionBody
executableCode
cronCommand
shellCommand
paymentId
journalEntryId
bankTransactionId
reconciliationMatchId
gateOpenCommand
hardwareDeviceCommand
biometricTemplate
faceEmbedding
externalAiEnabled
externalAiRealDataAllowed
```

---

### 37.3. Prohibidos desde DTO externo

```text id="awb-prohibited-external-dto"
tenantId
createdBy
updatedBy
approvedBy
activatedBy
deactivatedBy
archivedBy
triggeredBy
status
versionNumber
versionLabel
executionId arbitrario para crear ejecución
stepStatus arbitrario
storageKey
signedUrl
secret
token
password
apiKey
privateKey
clientSecret
webhookSecret
databaseUrl
rawSql
script
javascript
functionBody
executableCode
cronCommand
shellCommand
paymentId
journalEntryId
bankTransactionId
reconciliationMatchId
gateOpenCommand
hardwareDeviceCommand
biometricTemplate
faceEmbedding
externalAiEnabled
externalAiRealDataAllowed
```

---

## 38. Seguridad de storage

### 38.1. Secure Document Storage

```text id="awb-storage-sds"
workflow_exports.secure_document_id referencia un documento administrado por Secure Document Storage.
```

Reglas:

```text id="awb-storage-rules"
- No guardar storageKey.
- No guardar signedUrl persistente.
- No guardar base64.
- No guardar rawFilePayload.
- No exponer binarios desde este módulo.
- Export se descarga mediante SDS bajo permisos del módulo 016.
```

---

## 39. Auditoría de datos

### 39.1. Eventos auditables

El módulo debe emitir eventos al módulo `007-audit` para:

```text id="awb-dm-audit-events"
automationTriggerDefinition.created
automationTriggerDefinition.updated
automationTriggerDefinition.archived
automationActionDefinition.created
automationActionDefinition.updated
automationActionDefinition.archived
tenantWorkflow.created
tenantWorkflow.updated
tenantWorkflow.archived
tenantWorkflowVersion.created
tenantWorkflowVersion.updated
tenantWorkflowVersion.submittedForReview
tenantWorkflowVersion.approved
tenantWorkflowVersion.rejected
tenantWorkflowVersion.activated
tenantWorkflowVersion.deactivated
tenantWorkflowVersion.superseded
tenantWorkflowVersion.archived
tenantWorkflowExecution.queued
tenantWorkflowExecution.started
tenantWorkflowExecution.succeeded
tenantWorkflowExecution.partiallySucceeded
tenantWorkflowExecution.failed
tenantWorkflowExecution.cancelled
tenantWorkflowExecution.retrying
tenantWorkflowExecution.deadLettered
tenantWorkflowStep.succeeded
tenantWorkflowStep.failed
tenantWorkflowDeadLetter.created
tenantWorkflowDeadLetter.resolved
tenantWorkflowDeadLetter.ignored
tenantWorkflowExport.created
tenantWorkflowExport.completed
tenantWorkflowExport.failed
```

---

### 39.2. Logs funcionales vs Audit

```text id="awb-logs-vs-audit"
WorkflowExecutionLog es una bitácora funcional sanitizada para operación.
Audit es la evidencia formal de seguridad, trazabilidad y cumplimiento.
```

Regla:

```text id="awb-audit-rule"
Un WorkflowExecutionLog nunca reemplaza un evento audit crítico.
```

---

## 40. No aceptación del modelo

No se acepta el modelo si:

```text id="awb-dm-no-acceptance"
- tenant_workflow_definitions no tiene tenant_id;
- tenant_workflow_versions no tiene tenant_id;
- tenant_workflow_activations no tiene tenant_id;
- workflow_executions no tiene tenant_id;
- workflow_step_executions no tiene tenant_id;
- workflow_execution_logs no tiene tenant_id;
- workflow_dead_letters no tiene tenant_id;
- workflow_exports no tiene tenant_id;
- permite workflows cross-tenant;
- permite executions cross-tenant;
- permite steps cross-tenant;
- permite logs cross-tenant;
- permite dead letters cross-tenant;
- permite exports cross-tenant;
- permite versionNumber desde cliente;
- permite status directo desde cliente;
- almacena secretos;
- almacena tokens;
- almacena passwords;
- almacena apiKeys;
- almacena privateKeys;
- almacena clientSecrets;
- almacena raw SQL;
- almacena scripts;
- almacena código ejecutable;
- guarda storageKey;
- guarda signedUrl persistente;
- permite actionGraph con actions fuera de catálogo;
- permite conditionConfig ejecutable;
- omite idempotencyKey;
- permite ejecuciones duplicadas por evento;
- permite schedules con frecuencia abusiva;
- permite retries infinitos;
- crea Payment;
- crea SupplierPaymentOrder;
- crea JournalEntry;
- confirma Bank Reconciliation;
- modifica stock directamente;
- modifica AccessEvent directamente;
- contiene columnas de hardware, biometría o IA externa;
- permite endpoints públicos;
- permite WordPress público;
- exporta sin Secure Document Storage.
```

---

## 41. Resultado esperado

Al implementar este modelo de datos, `026-automation-workflows-basic` contará con persistencia segura, tenant-scoped, versionada, auditada, idempotente y preparada para ejecución por colas.

Resultado esperado:

```text id="awb-dm-expected-result"
workflow_trigger_definitions modelado
workflow_action_definitions modelado
tenant_workflow_definitions modelado
tenant_workflow_versions modelado
tenant_workflow_activations modelado
workflow_executions modelado
workflow_step_executions modelado
workflow_execution_logs modelado
workflow_dead_letters modelado
workflow_exports modelado
enums definidos
Prisma schema preliminar definido
tenant_id obligatorio definido
catálogo global definido
workflows tenant-scoped definidos
versions tenant-scoped definidas
activations auditables definidas
executions idempotentes definidas
steps trazables definidos
logs sanitizados definidos
dead letters definidos
exports vía SDS definidos
indexes definidos
constraints definidos
partial indexes recomendados
JSONB security definida
action graph definido
condition config definido
retry policy definido
scheduled windows definidos
no secrets
no executable payload
no raw SQL
no storageKey
no public exposure
no WordPress access
no payment execution
no accounting execution
no bank reconciliation confirmation
no hardware control
no external AI with real data
```

---

## 42. Expediente actualizado

```text id="awb-dm-expediente"
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
│   │   ├── 023-inventory-basic/
│   │   ├── 024-access-control-visitors/
│   │   ├── 025-tenant-settings-policies/
│   │   └── 026-automation-workflows-basic/
│   │       ├── spec.md
│   │       ├── plan.md
│   │       └── data-model.md
```
