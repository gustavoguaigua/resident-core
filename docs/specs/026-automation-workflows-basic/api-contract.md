# API Contract — 026 Automation Workflows Basic

## 1. Información del documento

| Campo           | Valor                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------ |
| Proyecto        | RESIDENT Core                                                                              |
| Spec ID         | 026                                                                                        |
| Módulo          | Automation Workflows Basic                                                                 |
| Documento       | API Contract                                                                               |
| Ruta            | `docs/specs/026-automation-workflows-basic/api-contract.md`                                |
| Versión         | 0.1                                                                                        |
| Estado          | needs-review                                                                               |
| Fecha           | 2026-07-31                                                                                 |
| Documento base  | `docs/specs/026-automation-workflows-basic/spec.md`                                        |
| Plan técnico    | `docs/specs/026-automation-workflows-basic/plan.md`                                        |
| Modelo de datos | `docs/specs/026-automation-workflows-basic/data-model.md`                                  |
| API Style       | REST                                                                                       |
| Base path       | `/api/v1`                                                                                  |
| Formato         | JSON                                                                                       |
| Autenticación   | Bearer Token / Keycloak OIDC                                                               |
| Autorización    | RESIDENT Core tenant-aware permissions                                                     |
| Naturaleza      | Tenant-scoped / Event-driven / Workflow-governed / Queue-backed / Audit-heavy / Non-public |

---

## 2. Propósito

Este documento define el contrato API del módulo `026-automation-workflows-basic`.

El contrato cubre endpoints, DTOs, responses, errores, permisos, validaciones, superficies API, ejecución manual, consulta de ejecuciones, dead letters, exportaciones, auditoría, observabilidad, OpenAPI e integración interna por eventos.

Regla central del contrato:

```text id="awb-api-rule"
Toda API de Automation Workflows Basic debe ser autenticada, tenant-scoped, permission-based, idempotency-aware, schema-validated, audit-heavy, queue-backed y explícitamente no pública; debe permitir gestionar catálogos platform, workflows tenant-scoped, versiones, activaciones, ejecuciones, reintentos, dead letters y exportaciones, sin aceptar tenantId desde cliente, sin aceptar actor fields, sin aceptar versionNumber arbitrario, sin aceptar status directo fuera de endpoints de transición, sin almacenar secretos, sin aceptar scripts, sin aceptar raw SQL, sin aceptar código ejecutable, sin webhooks públicos inseguros, sin acceso desde WordPress público, sin devolver storageKey, sin ejecutar pagos, sin crear asientos contables, sin confirmar conciliaciones bancarias, sin controlar hardware y sin enviar datos reales a IA externa.
```

---

## 3. Convenciones generales

### 3.1. Base URL

```text id="awb-api-base-url"
/api/v1
```

---

### 3.2. Content-Type

```http id="awb-api-content-type"
Content-Type: application/json
Accept: application/json
```

---

### 3.3. Fechas

Todas las fechas se reciben y devuelven en ISO 8601 UTC.

Ejemplo:

```json id="awb-api-date-example"
{
  "effectiveFrom": "2026-08-01T00:00:00.000Z"
}
```

---

### 3.4. Campos JSON

API JSON:

```text id="awb-api-json-style"
camelCase
```

Base de datos:

```text id="awb-api-db-style"
snake_case
```

---

### 3.5. Response envelope

Respuesta simple:

```json id="awb-api-envelope-single"
{
  "data": {
    "id": "uuid"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Respuesta paginada:

```json id="awb-api-envelope-page"
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

Error estándar:

```json id="awb-api-error-envelope"
{
  "error": {
    "code": "AUTOMATION_WORKFLOW_NOT_FOUND",
    "message": "Automation workflow not found.",
    "details": {},
    "traceId": "trace-id"
  }
}
```

---

## 4. Superficies API

### 4.1. Platform API

```text id="awb-api-platform-surface"
/api/v1/platform/automation-trigger-definitions
/api/v1/platform/automation-action-definitions
```

Uso:

```text id="awb-api-platform-use"
Administración del catálogo global de trigger definitions y action definitions por PlatformAdmin autorizado.
```

---

### 4.2. Tenant Admin API

```text id="awb-api-tenant-surface"
/api/v1/tenant/automation-workflows
/api/v1/tenant/automation-executions
/api/v1/tenant/automation-dead-letters
/api/v1/tenant/automation-exports
```

Uso:

```text id="awb-api-tenant-use"
Administración autenticada de workflows, versiones, activaciones, ejecuciones, reintentos, dead letters y exportaciones del tenant actual.
```

---

### 4.3. Internal service ports

No son endpoints públicos. Se implementan como puertos internos del monolito modular.

```text id="awb-api-internal-surface"
publishAutomationEvent(event)
enqueueWorkflowExecution(command)
executeWorkflowStep(command)
resolveWorkflowCatalog(triggerKey, actionKeys)
```

---

### 4.4. Public API prohibida

No implementar:

```text id="awb-api-public-forbidden"
/api/v1/public/automation-workflows
/api/v1/public/automation-executions
/api/v1/public/automation-webhooks
/api/v1/public/tenants/{slug}/automation-workflows
/api/v1/public/tenants/{slug}/automation-executions
```

Respuesta esperada:

```http id="awb-api-public-404"
404 Not Found
```

---

## 5. Autenticación

Todos los endpoints permitidos requieren:

```http id="awb-api-auth-header"
Authorization: Bearer <access_token>
```

Reglas:

```text id="awb-api-auth-rules"
- Keycloak autentica.
- RESIDENT Core resuelve UserProfile.
- RESIDENT Core resuelve TenantMembership.
- RESIDENT Core resuelve currentTenant.
- RESIDENT Core autoriza por permiso, sensibilidad, recurso y superficie API.
```

Prohibido:

```text id="awb-api-auth-forbidden"
- acceso anónimo;
- API key pública;
- token por query string;
- sesión WordPress como autenticación Core;
- userId enviado por cliente como actor;
- tenantId enviado por cliente como autoridad;
- webhook público no firmado en MVP.
```

---

## 6. Tenant context

El tenant se resuelve server-side desde el contexto autenticado.

No se acepta `tenantId` en body, query o path para operaciones tenant ordinarias.

Request prohibido:

```json id="awb-api-tenantid-forbidden"
{
  "tenantId": "uuid",
  "name": "Recordatorio mensual de alícuotas"
}
```

Respuesta esperada:

```http id="awb-api-tenantid-response"
422 Unprocessable Entity
```

Regla cross-tenant:

```text id="awb-api-cross-tenant-rule"
Si un recurso existe pero pertenece a otro tenant, la API debe responder 404 Not Found.
```

---

## 7. Paginación, filtros y ordenamiento

### 7.1. Parámetros estándar

```text id="awb-api-pagination"
page
pageSize
sortBy
sortDirection
```

Reglas:

```text id="awb-api-pagination-rules"
- page inicia en 1.
- pageSize default = 25.
- pageSize máximo = 100.
- sortDirection = asc | desc.
- sortBy debe pertenecer a whitelist por endpoint.
```

---

### 7.2. Filtros comunes

```text id="awb-api-common-filters"
category
status
triggerKey
triggerType
actionKey
sourceModule
targetModule
workflowCode
workflowId
versionId
executionId
dateFrom
dateTo
createdFrom
createdTo
queuedFrom
queuedTo
startedFrom
startedTo
finishedFrom
finishedTo
```

---

### 7.3. Reglas de filtros

```text id="awb-api-filter-rules"
- dateFrom <= dateTo.
- pageSize no puede superar 100.
- sortBy debe estar permitido por endpoint.
- No se acepta tenantId como filtro externo.
- No se acepta rawSql.
- No se aceptan filtros ejecutables.
```

---

## 8. Permisos

### 8.1. Platform catalog

```text id="awb-api-permissions-platform"
automationTriggerDefinitions.read
automationTriggerDefinitions.create
automationTriggerDefinitions.update
automationTriggerDefinitions.archive

automationActionDefinitions.read
automationActionDefinitions.create
automationActionDefinitions.update
automationActionDefinitions.archive

automationCatalog.manageSensitive
```

---

### 8.2. Tenant workflows

```text id="awb-api-permissions-workflows"
tenantWorkflows.read
tenantWorkflows.create
tenantWorkflows.updateDraft
tenantWorkflows.submitReview
tenantWorkflows.approve
tenantWorkflows.reject
tenantWorkflows.activate
tenantWorkflows.deactivate
tenantWorkflows.archive
```

---

### 8.3. Tenant executions

```text id="awb-api-permissions-executions"
tenantWorkflowExecutions.read
tenantWorkflowExecutions.runManual
tenantWorkflowExecutions.cancel
tenantWorkflowExecutions.retry
tenantWorkflowExecutions.resolveDeadLetter
```

---

### 8.4. Logs and exports

```text id="awb-api-permissions-logs-exports"
tenantWorkflowLogs.read
tenantWorkflowExports.create
tenantWorkflowExports.read
```

---

### 8.5. Permisos sensibles

```text id="awb-api-permissions-sensitive"
tenantWorkflows.approveSensitive
tenantWorkflows.activateSensitive
tenantWorkflowExecutions.runSensitive
tenantWorkflowExecutions.retrySensitive
tenantWorkflowExports.exportSensitive
automationCatalog.manageSensitive
```

Regla:

```text id="awb-api-sensitive-permission-rule"
Todo workflow, trigger, action, ejecución o exportación marcada como restricted, financialSensitive, privacySensitive, securitySensitive u operationalSensitive requiere permiso sensible adicional para aprobación, activación, ejecución manual, reintento o exportación.
```

---

# 9. Platform API — Automation Trigger Definitions

## 9.1. List trigger definitions

```http id="awb-api-list-trigger-definitions"
GET /api/v1/platform/automation-trigger-definitions
```

Permiso:

```text id="awb-api-perm-list-trigger-definitions"
automationTriggerDefinitions.read
```

Query params:

```text id="awb-api-query-trigger-definitions"
category
sourceModule
triggerType
sensitivity
status
isTenantEnabled
search
page
pageSize
sortBy
sortDirection
```

Response:

```json id="awb-api-response-trigger-definitions"
{
  "data": [
    {
      "id": "uuid",
      "triggerKey": "payments.paymentValidated",
      "category": "payments",
      "sourceModule": "005-payments",
      "triggerType": "event",
      "eventName": "payments.paymentValidated",
      "description": "Se emite cuando un pago es validado.",
      "sensitivity": "financialSensitive",
      "isTenantEnabled": true,
      "requiresPermission": null,
      "status": "active",
      "createdAt": "2026-07-31T22:45:00.000Z",
      "updatedAt": "2026-07-31T22:45:00.000Z"
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

## 9.2. Create trigger definition

```http id="awb-api-create-trigger-definition"
POST /api/v1/platform/automation-trigger-definitions
```

Permiso:

```text id="awb-api-perm-create-trigger-definition"
automationTriggerDefinitions.create
```

Request:

```json id="awb-api-request-create-trigger-definition"
{
  "triggerKey": "payments.paymentValidated",
  "category": "payments",
  "sourceModule": "005-payments",
  "triggerType": "event",
  "eventName": "payments.paymentValidated",
  "schema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "eventName": { "type": "string" },
      "sourceModule": { "type": "string" },
      "payloadFields": {
        "type": "array",
        "items": { "type": "string" }
      }
    },
    "required": ["eventName", "sourceModule"]
  },
  "description": "Se emite cuando un pago es validado.",
  "sensitivity": "financialSensitive",
  "isTenantEnabled": true,
  "requiresPermission": null
}
```

Reglas:

```text id="awb-api-create-trigger-definition-rules"
- triggerKey debe ser único.
- triggerKey debe usar formato category.name.
- sourceModule obligatorio.
- triggerType obligatorio.
- eventName obligatorio si triggerType=event.
- schema obligatorio.
- schema no puede contener secrets.
- schema no puede contener scripts.
- schema no puede contener rawSql.
- schema no puede contener executableCode.
- No se permiten public webhooks en MVP.
- createdBy se resuelve server-side.
```

Response:

```http id="awb-api-created-trigger-definition-http"
201 Created
```

```json id="awb-api-created-trigger-definition-response"
{
  "data": {
    "id": "uuid",
    "triggerKey": "payments.paymentValidated",
    "status": "active",
    "createdAt": "2026-07-31T22:45:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 9.3. Get trigger definition

```http id="awb-api-get-trigger-definition"
GET /api/v1/platform/automation-trigger-definitions/{definitionId}
```

Permiso:

```text id="awb-api-perm-get-trigger-definition"
automationTriggerDefinitions.read
```

---

## 9.4. Update trigger definition

```http id="awb-api-update-trigger-definition"
PATCH /api/v1/platform/automation-trigger-definitions/{definitionId}
```

Permiso:

```text id="awb-api-perm-update-trigger-definition"
automationTriggerDefinitions.update
```

Request:

```json id="awb-api-request-update-trigger-definition"
{
  "description": "Trigger emitido después de validación manual o automática controlada del pago.",
  "isTenantEnabled": true
}
```

Prohibido:

```json id="awb-api-update-trigger-definition-forbidden"
{
  "createdBy": "uuid",
  "status": "archived",
  "script": "return true",
  "rawSql": "SELECT * FROM payments"
}
```

---

## 9.5. Archive trigger definition

```http id="awb-api-archive-trigger-definition"
POST /api/v1/platform/automation-trigger-definitions/{definitionId}/archive
```

Permiso:

```text id="awb-api-perm-archive-trigger-definition"
automationTriggerDefinitions.archive
```

Request:

```json id="awb-api-request-archive-trigger-definition"
{
  "archiveReason": "Trigger reemplazado por nueva definición versionada."
}
```

Reglas:

```text id="awb-api-archive-trigger-definition-rules"
- No borra físicamente.
- Definition archivada no puede usarse para nuevas workflow versions.
- Versions históricas conservan referencia.
- Debe auditar automationTriggerDefinition.archived.
```

---

# 10. Platform API — Automation Action Definitions

## 10.1. List action definitions

```http id="awb-api-list-action-definitions"
GET /api/v1/platform/automation-action-definitions
```

Permiso:

```text id="awb-api-perm-list-action-definitions"
automationActionDefinitions.read
```

Query params:

```text id="awb-api-query-action-definitions"
category
targetModule
actionType
sensitivity
isDestructive
isFinancial
isExternal
status
isTenantEnabled
search
page
pageSize
sortBy
sortDirection
```

---

## 10.2. Create action definition

```http id="awb-api-create-action-definition"
POST /api/v1/platform/automation-action-definitions
```

Permiso:

```text id="awb-api-perm-create-action-definition"
automationActionDefinitions.create
```

Request:

```json id="awb-api-request-create-action-definition"
{
  "actionKey": "notifications.sendToResident",
  "category": "communications",
  "targetModule": "012-communications-notifications",
  "actionType": "notification",
  "schema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "templateKey": { "type": "string" },
      "audience": {
        "type": "string",
        "enum": ["sourceResident", "sourceUnit", "tenantAdmins"]
      }
    },
    "required": ["templateKey", "audience"]
  },
  "description": "Envía una notificación a un residente derivado del evento fuente.",
  "sensitivity": "internal",
  "requiresPermission": "tenantWorkflowExecutions.runManual",
  "requiresApproval": false,
  "isDestructive": false,
  "isFinancial": false,
  "isExternal": false,
  "isTenantEnabled": true
}
```

Reglas:

```text id="awb-api-create-action-definition-rules"
- actionKey debe ser único.
- actionKey debe usar formato category.name.
- targetModule obligatorio.
- schema obligatorio.
- schema no puede contener secrets.
- schema no puede contener scripts.
- schema no puede contener rawSql.
- schema no puede contener executableCode.
- isDestructive=true requiere automationCatalog.manageSensitive y queda bloqueado por defecto en MVP.
- isFinancial=true no permite crear Payment, JournalEntry o ReconciliationMatch.
- isExternal=true queda restringido en MVP.
```

Response:

```http id="awb-api-created-action-definition-http"
201 Created
```

```json id="awb-api-created-action-definition-response"
{
  "data": {
    "id": "uuid",
    "actionKey": "notifications.sendToResident",
    "status": "active",
    "createdAt": "2026-07-31T22:45:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 10.3. Get action definition

```http id="awb-api-get-action-definition"
GET /api/v1/platform/automation-action-definitions/{definitionId}
```

Permiso:

```text id="awb-api-perm-get-action-definition"
automationActionDefinitions.read
```

---

## 10.4. Update action definition

```http id="awb-api-update-action-definition"
PATCH /api/v1/platform/automation-action-definitions/{definitionId}
```

Permiso:

```text id="awb-api-perm-update-action-definition"
automationActionDefinitions.update
```

---

## 10.5. Archive action definition

```http id="awb-api-archive-action-definition"
POST /api/v1/platform/automation-action-definitions/{definitionId}/archive
```

Permiso:

```text id="awb-api-perm-archive-action-definition"
automationActionDefinitions.archive
```

Request:

```json id="awb-api-request-archive-action-definition"
{
  "archiveReason": "Action reemplazada por nueva versión de catálogo."
}
```

---

# 11. Tenant Admin API — Workflow Definitions

## 11.1. List workflows

```http id="awb-api-list-workflows"
GET /api/v1/tenant/automation-workflows
```

Permiso:

```text id="awb-api-perm-list-workflows"
tenantWorkflows.read
```

Query params:

```text id="awb-api-query-workflows"
category
status
ownerUserProfileId
workflowCode
search
page
pageSize
sortBy
sortDirection
```

Response:

```json id="awb-api-response-workflows"
{
  "data": [
    {
      "id": "uuid",
      "workflowCode": "payment-validation-notification",
      "name": "Notificar pago validado",
      "description": "Envía notificación al residente cuando su pago es validado.",
      "category": "payments",
      "status": "active",
      "ownerUserProfileId": "uuid",
      "activeVersionId": "uuid",
      "activeVersionLabel": "v1",
      "createdAt": "2026-07-31T22:45:00.000Z",
      "updatedAt": "2026-07-31T22:45:00.000Z"
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

## 11.2. Create workflow

```http id="awb-api-create-workflow"
POST /api/v1/tenant/automation-workflows
```

Permiso:

```text id="awb-api-perm-create-workflow"
tenantWorkflows.create
```

Request:

```json id="awb-api-request-create-workflow"
{
  "workflowCode": "payment-validation-notification",
  "name": "Notificar pago validado",
  "description": "Envía notificación al residente cuando su pago es validado.",
  "category": "payments",
  "ownerUserProfileId": "uuid"
}
```

Reglas:

```text id="awb-api-create-workflow-rules"
- workflowCode único por tenant.
- tenantId se resuelve server-side.
- createdBy se resuelve server-side.
- ownerUserProfileId debe pertenecer al tenant si se envía.
- No ejecuta nada sin versión activa.
- No acepta triggerConfig ni actionGraph en esta entidad.
```

Response:

```http id="awb-api-created-workflow-http"
201 Created
```

```json id="awb-api-response-create-workflow"
{
  "data": {
    "id": "uuid",
    "workflowCode": "payment-validation-notification",
    "name": "Notificar pago validado",
    "status": "draft",
    "createdAt": "2026-07-31T22:45:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 11.3. Get workflow

```http id="awb-api-get-workflow"
GET /api/v1/tenant/automation-workflows/{workflowId}
```

Permiso:

```text id="awb-api-perm-get-workflow"
tenantWorkflows.read
```

Reglas:

```text id="awb-api-get-workflow-rules"
- workflowId debe pertenecer al tenant actual.
- Cross-tenant responde 404.
- Puede incluir summary de versión activa.
- No devuelve payload sensible completo salvo permiso correspondiente.
```

---

## 11.4. Update workflow

```http id="awb-api-update-workflow"
PATCH /api/v1/tenant/automation-workflows/{workflowId}
```

Permiso:

```text id="awb-api-perm-update-workflow"
tenantWorkflows.updateDraft
```

Request:

```json id="awb-api-request-update-workflow"
{
  "name": "Notificación de pago validado",
  "description": "Notifica al residente y registra nota operativa.",
  "ownerUserProfileId": "uuid"
}
```

Reglas:

```text id="awb-api-update-workflow-rules"
- Solo actualiza metadata del workflow.
- No actualiza version active.
- No actualiza actionGraph.
- No acepta status directo.
- updatedBy se resuelve server-side.
```

---

## 11.5. Archive workflow

```http id="awb-api-archive-workflow"
POST /api/v1/tenant/automation-workflows/{workflowId}/archive
```

Permiso:

```text id="awb-api-perm-archive-workflow"
tenantWorkflows.archive
```

Request:

```json id="awb-api-request-archive-workflow"
{
  "archiveReason": "Workflow reemplazado por una nueva automatización."
}
```

Reglas:

```text id="awb-api-archive-workflow-rules"
- No borra físicamente.
- Workflow archived no ejecuta.
- Versions y executions históricas se conservan.
- Debe auditar tenantWorkflow.archived.
```

---

# 12. Tenant Admin API — Workflow Versions

## 12.1. List workflow versions

```http id="awb-api-list-workflow-versions"
GET /api/v1/tenant/automation-workflows/{workflowId}/versions
```

Permiso:

```text id="awb-api-perm-list-workflow-versions"
tenantWorkflows.read
```

Query params:

```text id="awb-api-query-workflow-versions"
status
triggerKey
createdFrom
createdTo
page
pageSize
sortBy
sortDirection
```

Response:

```json id="awb-api-response-workflow-versions"
{
  "data": [
    {
      "id": "uuid",
      "workflowId": "uuid",
      "versionNumber": 1,
      "versionLabel": "v1",
      "triggerKey": "payments.paymentValidated",
      "status": "active",
      "effectiveFrom": "2026-08-01T00:00:00.000Z",
      "effectiveUntil": null,
      "changeReason": "Versión inicial.",
      "createdAt": "2026-07-31T22:45:00.000Z",
      "approvedAt": "2026-07-31T22:50:00.000Z",
      "activatedAt": "2026-08-01T00:00:00.000Z"
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

## 12.2. Create workflow version

```http id="awb-api-create-workflow-version"
POST /api/v1/tenant/automation-workflows/{workflowId}/versions
```

Permiso:

```text id="awb-api-perm-create-workflow-version"
tenantWorkflows.updateDraft
```

Request:

```json id="awb-api-request-create-workflow-version"
{
  "triggerKey": "payments.paymentValidated",
  "triggerConfig": {
    "eventName": "payments.paymentValidated",
    "sourceModule": "005-payments",
    "payloadFields": ["paymentId", "propertyUnitId", "status"]
  },
  "conditionConfig": {
    "and": [
      {
        "field": "event.status",
        "operator": "equals",
        "value": "validated"
      }
    ]
  },
  "actionGraph": {
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
      }
    ]
  },
  "retryPolicy": {
    "maxRetries": 3,
    "backoffStrategy": "exponential",
    "initialDelaySeconds": 60,
    "maxDelaySeconds": 3600
  },
  "changeReason": "Automatizar notificación de pago validado."
}
```

Reglas:

```text id="awb-api-create-workflow-version-rules"
- workflowId debe pertenecer al tenant.
- triggerKey debe existir en catálogo y estar active.
- triggerConfig debe validar contra trigger schema.
- conditionConfig debe usar operadores permitidos.
- actionGraph debe usar actions activas del catálogo.
- actionConfig debe validar contra action schema.
- retryPolicy debe tener maxRetries finito.
- versionNumber se genera server-side.
- versionLabel se genera server-side.
- Nueva versión inicia como draft.
- No altera versión activa.
- No acepta tenantId.
- No acepta versionNumber.
- No acepta status.
- No acepta secrets.
- No acepta scripts.
- No acepta rawSql.
- No acepta executableCode.
- Debe auditar tenantWorkflowVersion.created.
```

Response:

```http id="awb-api-created-workflow-version-http"
201 Created
```

```json id="awb-api-response-create-workflow-version"
{
  "data": {
    "id": "uuid",
    "workflowId": "uuid",
    "versionNumber": 2,
    "versionLabel": "v2",
    "status": "draft",
    "createdAt": "2026-07-31T22:45:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 12.3. Get workflow version

```http id="awb-api-get-workflow-version"
GET /api/v1/tenant/automation-workflows/{workflowId}/versions/{versionId}
```

Permiso:

```text id="awb-api-perm-get-workflow-version"
tenantWorkflows.read
```

Response:

```json id="awb-api-response-get-workflow-version"
{
  "data": {
    "id": "uuid",
    "workflowId": "uuid",
    "versionNumber": 2,
    "versionLabel": "v2",
    "triggerKey": "payments.paymentValidated",
    "triggerConfig": {
      "eventName": "payments.paymentValidated",
      "sourceModule": "005-payments",
      "payloadFields": ["paymentId", "propertyUnitId", "status"]
    },
    "conditionConfig": {
      "and": [
        {
          "field": "event.status",
          "operator": "equals",
          "value": "validated"
        }
      ]
    },
    "actionGraph": {
      "steps": [
        {
          "stepKey": "notify_resident",
          "stepOrder": 1,
          "actionKey": "notifications.sendToResident",
          "onFailure": "failWorkflow",
          "timeoutSeconds": 30,
          "maxRetries": 2
        }
      ]
    },
    "retryPolicy": {
      "maxRetries": 3,
      "backoffStrategy": "exponential",
      "initialDelaySeconds": 60,
      "maxDelaySeconds": 3600
    },
    "status": "draft",
    "changeReason": "Automatizar notificación de pago validado.",
    "createdAt": "2026-07-31T22:45:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="awb-api-get-workflow-version-rules"
- versionId debe pertenecer al workflow y tenant.
- No devuelve secrets.
- No devuelve raw payload sensible.
- No devuelve storageKey.
```

---

## 12.4. Update draft workflow version

```http id="awb-api-update-workflow-version"
PATCH /api/v1/tenant/automation-workflows/{workflowId}/versions/{versionId}
```

Permiso:

```text id="awb-api-perm-update-workflow-version"
tenantWorkflows.updateDraft
```

Request:

```json id="awb-api-request-update-workflow-version"
{
  "conditionConfig": {
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
  },
  "changeReason": "Agregar validación de monto mayor a cero."
}
```

Reglas:

```text id="awb-api-update-workflow-version-rules"
- Solo draft puede editarse.
- active/scheduled/superseded/deactivated/archived no se editan destructivamente.
- triggerConfig, conditionConfig, actionGraph y retryPolicy se validan nuevamente.
- Debe auditar tenantWorkflowVersion.updated.
```

---

## 12.5. Submit workflow version for review

```http id="awb-api-submit-workflow-version-review"
POST /api/v1/tenant/automation-workflows/{workflowId}/versions/{versionId}/submit-review
```

Permiso:

```text id="awb-api-perm-submit-workflow-version-review"
tenantWorkflows.submitReview
```

Request:

```json id="awb-api-request-submit-workflow-version-review"
{
  "reviewReason": "Lista para revisión administrativa."
}
```

Reglas:

```text id="awb-api-submit-workflow-review-rules"
- Solo draft puede pasar a reviewReady.
- Debe validar trigger/action/condition/retry nuevamente.
- Debe auditar tenantWorkflowVersion.submittedForReview.
```

---

## 12.6. Approve workflow version

```http id="awb-api-approve-workflow-version"
POST /api/v1/tenant/automation-workflows/{workflowId}/versions/{versionId}/approve
```

Permiso:

```text id="awb-api-perm-approve-workflow-version"
tenantWorkflows.approve
```

Permiso adicional si es sensible:

```text id="awb-api-perm-approve-sensitive-workflow-version"
tenantWorkflows.approveSensitive
```

Request:

```json id="awb-api-request-approve-workflow-version"
{
  "approvalReason": "Aprobado por administración.",
  "reviewNotes": "Workflow revisado; solo contiene actions permitidas."
}
```

Reglas:

```text id="awb-api-approve-workflow-version-rules"
- Solo reviewReady puede aprobarse.
- Workflows sensibles requieren approveSensitive.
- approvedBy se resuelve server-side.
- approvedAt se genera server-side.
- No activa automáticamente.
- Debe auditar tenantWorkflowVersion.approved.
```

---

## 12.7. Reject workflow version

```http id="awb-api-reject-workflow-version"
POST /api/v1/tenant/automation-workflows/{workflowId}/versions/{versionId}/reject
```

Permiso:

```text id="awb-api-perm-reject-workflow-version"
tenantWorkflows.reject
```

Request:

```json id="awb-api-request-reject-workflow-version"
{
  "rejectionReason": "La automatización debe limitar la audiencia antes de activarse."
}
```

Reglas:

```text id="awb-api-reject-workflow-version-rules"
- Solo reviewReady puede rechazarse.
- rejected no puede activarse.
- Debe auditar tenantWorkflowVersion.rejected.
```

---

## 12.8. Activate workflow version

```http id="awb-api-activate-workflow-version"
POST /api/v1/tenant/automation-workflows/{workflowId}/versions/{versionId}/activate
```

Permiso:

```text id="awb-api-perm-activate-workflow-version"
tenantWorkflows.activate
```

Permiso adicional si es sensible:

```text id="awb-api-perm-activate-sensitive-workflow-version"
tenantWorkflows.activateSensitive
```

Request:

```json id="awb-api-request-activate-workflow-version"
{
  "effectiveFrom": "2026-08-01T00:00:00.000Z",
  "activationReason": "Activar automatización para inicio del nuevo período."
}
```

Reglas:

```text id="awb-api-activate-workflow-version-rules"
- Versión debe estar approved.
- effectiveFrom obligatorio.
- No debe existir solapamiento incompatible.
- Crea TenantWorkflowActivation.
- Marca versión como active si effectiveFrom <= now.
- Marca versión como scheduled si effectiveFrom > now.
- Ajusta effectiveUntil de versión anterior si aplica.
- WorkflowDefinition pasa a active si aplica.
- Debe auditar tenantWorkflowVersion.activated o tenantWorkflowVersion.scheduled.
```

Response:

```json id="awb-api-response-activate-workflow-version"
{
  "data": {
    "workflowId": "uuid",
    "workflowVersionId": "uuid",
    "activationId": "uuid",
    "versionLabel": "v2",
    "status": "scheduled",
    "effectiveFrom": "2026-08-01T00:00:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 12.9. Deactivate workflow version

```http id="awb-api-deactivate-workflow-version"
POST /api/v1/tenant/automation-workflows/{workflowId}/versions/{versionId}/deactivate
```

Permiso:

```text id="awb-api-perm-deactivate-workflow-version"
tenantWorkflows.deactivate
```

Request:

```json id="awb-api-request-deactivate-workflow-version"
{
  "deactivationReason": "Automatización pausada por revisión operativa.",
  "effectiveFrom": "2026-08-15T00:00:00.000Z"
}
```

Reglas:

```text id="awb-api-deactivate-workflow-version-rules"
- Solo active o scheduled puede desactivarse.
- Desactivación no borra historial.
- Workflow sin versión activa no ejecuta.
- Debe auditar tenantWorkflowVersion.deactivated.
```

---

## 12.10. Archive workflow version

```http id="awb-api-archive-workflow-version"
POST /api/v1/tenant/automation-workflows/{workflowId}/versions/{versionId}/archive
```

Permiso:

```text id="awb-api-perm-archive-workflow-version"
tenantWorkflows.archive
```

Request:

```json id="awb-api-request-archive-workflow-version"
{
  "archiveReason": "Versión descartada."
}
```

Reglas:

```text id="awb-api-archive-workflow-version-rules"
- No puede archivar active si no existe alternativa o desactivación.
- No borra físicamente.
- Debe auditar tenantWorkflowVersion.archived.
```

---

# 13. Tenant Admin API — Workflow Executions

## 13.1. List executions

```http id="awb-api-list-executions"
GET /api/v1/tenant/automation-executions
```

Permiso:

```text id="awb-api-perm-list-executions"
tenantWorkflowExecutions.read
```

Query params:

```text id="awb-api-query-executions"
workflowId
workflowCode
workflowVersionId
triggerKey
triggerType
sourceModule
status
dateFrom
dateTo
page
pageSize
sortBy
sortDirection
```

Response:

```json id="awb-api-response-executions"
{
  "data": [
    {
      "id": "uuid",
      "workflowId": "uuid",
      "workflowCode": "payment-validation-notification",
      "workflowVersionId": "uuid",
      "versionLabel": "v1",
      "triggerKey": "payments.paymentValidated",
      "triggerType": "event",
      "status": "succeeded",
      "retryCount": 0,
      "maxRetries": 3,
      "queuedAt": "2026-08-01T10:00:00.000Z",
      "startedAt": "2026-08-01T10:00:01.000Z",
      "finishedAt": "2026-08-01T10:00:03.000Z",
      "correlationId": "correlation-id",
      "traceId": "trace-id"
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

Reglas:

```text id="awb-api-list-executions-rules"
- Solo executions del tenant actual.
- No devuelve input raw sensible.
- No devuelve output raw sensible.
- No devuelve secrets.
- No devuelve storageKey.
```

---

## 13.2. Get execution

```http id="awb-api-get-execution"
GET /api/v1/tenant/automation-executions/{executionId}
```

Permiso:

```text id="awb-api-perm-get-execution"
tenantWorkflowExecutions.read
```

Query params:

```text id="awb-api-query-get-execution"
includeSteps
includeLogs
```

Response:

```json id="awb-api-response-get-execution"
{
  "data": {
    "id": "uuid",
    "workflowId": "uuid",
    "workflowVersionId": "uuid",
    "triggerKey": "payments.paymentValidated",
    "triggerType": "event",
    "sourceModule": "005-payments",
    "sourceEventId": "payment-event-uuid",
    "idempotencyKeyMasked": "tenant:***:workflow:***:trigger:event:source:payment-event-uuid",
    "status": "succeeded",
    "inputSanitized": {
      "eventName": "payments.paymentValidated",
      "paymentId": "uuid",
      "status": "validated"
    },
    "outputSanitized": {
      "completedSteps": 1
    },
    "retryCount": 0,
    "maxRetries": 3,
    "queuedAt": "2026-08-01T10:00:00.000Z",
    "startedAt": "2026-08-01T10:00:01.000Z",
    "finishedAt": "2026-08-01T10:00:03.000Z",
    "steps": [
      {
        "id": "uuid",
        "stepKey": "notify_resident",
        "actionKey": "notifications.sendToResident",
        "status": "succeeded",
        "targetModule": "012-communications-notifications",
        "startedAt": "2026-08-01T10:00:01.000Z",
        "finishedAt": "2026-08-01T10:00:03.000Z"
      }
    ]
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="awb-api-get-execution-rules"
- executionId debe pertenecer al tenant.
- includeLogs requiere tenantWorkflowLogs.read.
- Logs deben estar sanitizados.
- No devuelve stack trace productivo.
```

---

## 13.3. Run workflow manually

```http id="awb-api-run-workflow-manual"
POST /api/v1/tenant/automation-workflows/{workflowId}/run
```

Permiso:

```text id="awb-api-perm-run-workflow-manual"
tenantWorkflowExecutions.runManual
```

Permiso adicional si es sensible:

```text id="awb-api-perm-run-sensitive-workflow"
tenantWorkflowExecutions.runSensitive
```

Request:

```json id="awb-api-request-run-workflow-manual"
{
  "versionId": "uuid",
  "reason": "Ejecutar recordatorio manual autorizado.",
  "input": {
    "targetScope": "tenantAdmins",
    "dryRun": false
  }
}
```

Reglas:

```text id="awb-api-run-manual-rules"
- workflowId debe pertenecer al tenant.
- versionId opcional; si no se envía, se usa versión activa.
- Workflow debe tener trigger manual o permitir manual run según policy.
- Manual run requiere actor server-side.
- Workflow sensible requiere reason.
- input se valida contra schema manual si aplica.
- input no puede contener secrets.
- input no puede contener scripts.
- input no puede contener rawSql.
- Genera manualRunId server-side.
- Genera idempotencyKey server-side.
- Encola execution.
- Debe auditar tenantWorkflowExecution.queued.
```

Response:

```http id="awb-api-run-manual-http"
202 Accepted
```

```json id="awb-api-response-run-manual"
{
  "data": {
    "executionId": "uuid",
    "workflowId": "uuid",
    "workflowVersionId": "uuid",
    "status": "queued",
    "manualRunId": "uuid",
    "queuedAt": "2026-08-01T10:00:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 13.4. Cancel execution

```http id="awb-api-cancel-execution"
POST /api/v1/tenant/automation-executions/{executionId}/cancel
```

Permiso:

```text id="awb-api-perm-cancel-execution"
tenantWorkflowExecutions.cancel
```

Request:

```json id="awb-api-request-cancel-execution"
{
  "cancelReason": "Cancelación manual por revisión administrativa."
}
```

Reglas:

```text id="awb-api-cancel-execution-rules"
- Solo queued/running/retrying pueden cancelarse.
- Cancelación running es best-effort.
- Steps ya completados no se revierten automáticamente.
- Debe auditar tenantWorkflowExecution.cancelled.
```

---

## 13.5. Retry execution

```http id="awb-api-retry-execution"
POST /api/v1/tenant/automation-executions/{executionId}/retry
```

Permiso:

```text id="awb-api-perm-retry-execution"
tenantWorkflowExecutions.retry
```

Permiso adicional si es sensible:

```text id="awb-api-perm-retry-sensitive-execution"
tenantWorkflowExecutions.retrySensitive
```

Request:

```json id="awb-api-request-retry-execution"
{
  "retryReason": "Error temporal resuelto.",
  "retryMode": "failedStepsOnly"
}
```

Valores:

```text id="awb-api-retry-mode"
retryMode = failedStepsOnly | fullWorkflow
```

Reglas:

```text id="awb-api-retry-execution-rules"
- executionId debe pertenecer al tenant.
- Execution debe estar failed, partiallySucceeded o deadLettered si se permite.
- retryCount no puede superar maxRetries salvo permiso reforzado.
- Reintento mantiene lineage.
- No duplica actions idempotentes.
- Debe auditar tenantWorkflowExecution.retrying.
```

Response:

```http id="awb-api-retry-execution-http"
202 Accepted
```

```json id="awb-api-response-retry-execution"
{
  "data": {
    "executionId": "uuid",
    "status": "retrying",
    "retryCount": 1
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

# 14. Tenant Admin API — Dead Letters

## 14.1. List dead letters

```http id="awb-api-list-dead-letters"
GET /api/v1/tenant/automation-dead-letters
```

Permiso:

```text id="awb-api-perm-list-dead-letters"
tenantWorkflowExecutions.read
```

Query params:

```text id="awb-api-query-dead-letters"
workflowId
status
reasonCode
dateFrom
dateTo
page
pageSize
sortBy
sortDirection
```

Response:

```json id="awb-api-response-dead-letters"
{
  "data": [
    {
      "id": "uuid",
      "workflowExecutionId": "uuid",
      "workflowId": "uuid",
      "workflowVersionId": "uuid",
      "reasonCode": "ACTION_TIMEOUT",
      "failureReason": "The action timed out.",
      "retryCount": 3,
      "status": "open",
      "createdAt": "2026-08-01T10:05:00.000Z"
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

## 14.2. Get dead letter

```http id="awb-api-get-dead-letter"
GET /api/v1/tenant/automation-dead-letters/{deadLetterId}
```

Permiso:

```text id="awb-api-perm-get-dead-letter"
tenantWorkflowExecutions.read
```

Reglas:

```text id="awb-api-get-dead-letter-rules"
- deadLetterId debe pertenecer al tenant.
- lastErrorSanitized no contiene stack trace productivo.
- No devuelve raw payload sensible.
```

---

## 14.3. Resolve dead letter

```http id="awb-api-resolve-dead-letter"
POST /api/v1/tenant/automation-dead-letters/{deadLetterId}/resolve
```

Permiso:

```text id="awb-api-perm-resolve-dead-letter"
tenantWorkflowExecutions.resolveDeadLetter
```

Request:

```json id="awb-api-request-resolve-dead-letter"
{
  "resolutionReason": "El caso fue revisado manualmente y no requiere reintento."
}
```

Reglas:

```text id="awb-api-resolve-dead-letter-rules"
- Solo open o underReview puede resolverse.
- No borra execution.
- No reintenta automáticamente.
- Debe auditar tenantWorkflowDeadLetter.resolved.
```

---

## 14.4. Ignore dead letter

```http id="awb-api-ignore-dead-letter"
POST /api/v1/tenant/automation-dead-letters/{deadLetterId}/ignore
```

Permiso:

```text id="awb-api-perm-ignore-dead-letter"
tenantWorkflowExecutions.resolveDeadLetter
```

Request:

```json id="awb-api-request-ignore-dead-letter"
{
  "ignoreReason": "Fallo no relevante para el proceso actual."
}
```

Reglas:

```text id="awb-api-ignore-dead-letter-rules"
- ignored no se reintenta.
- No borra historial.
- Debe auditar tenantWorkflowDeadLetter.ignored.
```

---

# 15. Tenant Admin API — Exports

## 15.1. List workflow exports

```http id="awb-api-list-exports"
GET /api/v1/tenant/automation-exports
```

Permiso:

```text id="awb-api-perm-list-exports"
tenantWorkflowExports.read
```

Query params:

```text id="awb-api-query-exports"
exportType
format
status
dateFrom
dateTo
page
pageSize
sortBy
sortDirection
```

---

## 15.2. Get workflow export

```http id="awb-api-get-export"
GET /api/v1/tenant/automation-exports/{exportId}
```

Permiso:

```text id="awb-api-perm-get-export"
tenantWorkflowExports.read
```

Response:

```json id="awb-api-response-get-export"
{
  "data": {
    "id": "uuid",
    "exportType": "executions",
    "format": "xlsx",
    "status": "completed",
    "secureDocumentId": "uuid",
    "downloadAvailable": true,
    "createdAt": "2026-08-01T10:00:00.000Z",
    "completedAt": "2026-08-01T10:00:04.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="awb-api-get-export-rules"
- exportId debe pertenecer al tenant.
- No devuelve storageKey.
- No devuelve signedUrl persistente.
```

---

## 15.3. Create workflow export

```http id="awb-api-create-export"
POST /api/v1/tenant/automation-exports
```

Permiso:

```text id="awb-api-perm-create-export"
tenantWorkflowExports.create
```

Permiso adicional si es sensible:

```text id="awb-api-perm-create-sensitive-export"
tenantWorkflowExports.exportSensitive
```

Request:

```json id="awb-api-request-create-export"
{
  "exportType": "executions",
  "format": "xlsx",
  "filters": {
    "workflowId": "uuid",
    "status": "failed",
    "dateFrom": "2026-08-01T00:00:00.000Z",
    "dateTo": "2026-08-31T23:59:59.000Z"
  },
  "includeLogs": false,
  "includeSensitive": false,
  "reason": "Revisión administrativa mensual."
}
```

Valores:

```text id="awb-api-export-values"
exportType = workflows | workflowVersions | executions | failedExecutions | deadLetters | auditSnapshot | fullAutomationHistory
format = json | xlsx | pdf
```

Reglas:

```text id="awb-api-create-export-rules"
- Export requiere permiso.
- includeSensitive=true requiere tenantWorkflowExports.exportSensitive.
- fullAutomationHistory requiere reason.
- auditSnapshot requiere reason.
- Export usa Secure Document Storage.
- Response devuelve secureDocumentId.
- Response no devuelve storageKey.
- Export no incluye secrets.
- Export no incluye raw payload sensible.
- Export no incluye scripts.
- Export se audita.
```

Response:

```http id="awb-api-create-export-http"
202 Accepted
```

```json id="awb-api-response-create-export"
{
  "data": {
    "exportId": "uuid",
    "exportType": "executions",
    "format": "xlsx",
    "status": "requested",
    "createdAt": "2026-08-01T10:00:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

# 16. Internal API / Service Ports

## 16.1. Publish automation event

```typescript id="awb-api-internal-publish-event"
publishAutomationEvent(event: AutomationEventEnvelope): Promise<void>
```

Envelope:

```typescript id="awb-api-internal-event-envelope"
type AutomationEventEnvelope = {
  eventName: string;
  tenantId: string;
  sourceModule: string;
  sourceEventId: string;
  occurredAt: string;
  payload: Record<string, unknown>;
  sensitivity: "internal" | "restricted" | "financialSensitive" | "privacySensitive" | "securitySensitive" | "operationalSensitive";
  correlationId: string;
  traceId: string;
};
```

Reglas:

```text id="awb-api-internal-event-rules"
- eventName debe existir en trigger definitions.
- tenantId obligatorio.
- sourceEventId obligatorio.
- payload debe estar sanitizado.
- No secrets.
- No storageKey.
- No raw files.
- No comprobantes base64.
- No datos personales masivos.
- Se encola procesamiento.
```

---

## 16.2. Enqueue workflow execution

```typescript id="awb-api-internal-enqueue-execution"
enqueueWorkflowExecution(command: EnqueueWorkflowExecutionCommand): Promise<{
  executionId: string;
  status: "queued" | "skipped";
}>
```

Reglas:

```text id="awb-api-internal-enqueue-rules"
- Requiere tenantId.
- Requiere workflowDefinitionId.
- Requiere workflowVersionId.
- Requiere idempotencyKey.
- Duplicado idempotente retorna skipped o execution existente.
```

---

## 16.3. Execute workflow step

```typescript id="awb-api-internal-execute-step"
executeWorkflowStep(command: ExecuteWorkflowStepCommand): Promise<WorkflowStepResult>
```

Reglas:

```text id="awb-api-internal-execute-step-rules"
- actionKey debe existir en catálogo.
- actionDefinition debe estar active.
- actionConfig valida contra schema.
- No ejecuta scripts.
- No ejecuta rawSql.
- No ejecuta actions financieras prohibidas.
- Invoca puertos del módulo dueño.
```

---

# 17. DTOs principales

## 17.1. `CreateWorkflowTriggerDefinitionDto`

```typescript id="awb-api-dto-create-trigger-definition"
type CreateWorkflowTriggerDefinitionDto = {
  triggerKey: string;
  category: AutomationCategory;
  sourceModule: string;
  triggerType: WorkflowTriggerType;
  eventName?: string;
  schema: Record<string, unknown>;
  description?: string;
  sensitivity: AutomationSensitivity;
  isTenantEnabled: boolean;
  requiresPermission?: string;
};
```

---

## 17.2. `CreateWorkflowActionDefinitionDto`

```typescript id="awb-api-dto-create-action-definition"
type CreateWorkflowActionDefinitionDto = {
  actionKey: string;
  category: AutomationCategory;
  targetModule: string;
  actionType: WorkflowActionType;
  schema: Record<string, unknown>;
  description?: string;
  sensitivity: AutomationSensitivity;
  requiresPermission?: string;
  requiresApproval: boolean;
  isDestructive: boolean;
  isFinancial: boolean;
  isExternal: boolean;
  isTenantEnabled: boolean;
};
```

---

## 17.3. `CreateTenantWorkflowDto`

```typescript id="awb-api-dto-create-workflow"
type CreateTenantWorkflowDto = {
  workflowCode: string;
  name: string;
  description?: string;
  category: AutomationCategory;
  ownerUserProfileId?: string;
};
```

---

## 17.4. `CreateTenantWorkflowVersionDto`

```typescript id="awb-api-dto-create-workflow-version"
type CreateTenantWorkflowVersionDto = {
  triggerKey: string;
  triggerConfig: Record<string, unknown>;
  conditionConfig?: Record<string, unknown>;
  actionGraph: {
    steps: Array<{
      stepKey: string;
      stepOrder: number;
      actionKey: string;
      actionConfig: Record<string, unknown>;
      onFailure: "failWorkflow" | "continueWorkflow" | "skipStep";
      timeoutSeconds: number;
      maxRetries: number;
    }>;
  };
  retryPolicy: {
    maxRetries: number;
    backoffStrategy: "fixed" | "exponential";
    initialDelaySeconds: number;
    maxDelaySeconds: number;
  };
  changeReason: string;
};
```

---

## 17.5. `ApproveWorkflowVersionDto`

```typescript id="awb-api-dto-approve-workflow-version"
type ApproveWorkflowVersionDto = {
  approvalReason: string;
  reviewNotes?: string;
};
```

---

## 17.6. `ActivateWorkflowVersionDto`

```typescript id="awb-api-dto-activate-workflow-version"
type ActivateWorkflowVersionDto = {
  effectiveFrom: string;
  activationReason: string;
};
```

---

## 17.7. `ManualRunWorkflowDto`

```typescript id="awb-api-dto-manual-run"
type ManualRunWorkflowDto = {
  versionId?: string;
  reason?: string;
  input?: Record<string, unknown>;
};
```

---

## 17.8. `RetryWorkflowExecutionDto`

```typescript id="awb-api-dto-retry-execution"
type RetryWorkflowExecutionDto = {
  retryReason: string;
  retryMode: "failedStepsOnly" | "fullWorkflow";
};
```

---

## 17.9. `CreateWorkflowExportDto`

```typescript id="awb-api-dto-create-export"
type CreateWorkflowExportDto = {
  exportType: WorkflowExportType;
  format: WorkflowExportFormat;
  filters?: Record<string, unknown>;
  includeLogs?: boolean;
  includeSensitive?: boolean;
  reason?: string;
};
```

---

# 18. Campos prohibidos en DTOs externos

Todos los DTOs externos deben rechazar:

```text id="awb-api-forbidden-dto-fields"
tenantId
createdBy
updatedBy
approvedBy
activatedBy
deactivatedBy
archivedBy
triggeredBy
status directo fuera de endpoint de transición
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

Respuesta esperada:

```http id="awb-api-forbidden-dto-response"
422 Unprocessable Entity
```

---

# 19. Campos prohibidos en responses

```text id="awb-api-forbidden-response-fields"
storageKey
signedUrl persistente
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
functionBody
executableCode
raw event payload sensible
raw workflow payload sensible
raw stack trace
SQL raw
datos cross-tenant
```

---

# 20. Enums API

## 20.1. AutomationCategory

```text id="awb-api-enum-category"
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

## 20.2. WorkflowTriggerType

```text id="awb-api-enum-trigger-type"
event
scheduled
manual
system
```

---

## 20.3. WorkflowActionType

```text id="awb-api-enum-action-type"
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

## 20.4. AutomationSensitivity

```text id="awb-api-enum-sensitivity"
internal
restricted
financialSensitive
privacySensitive
securitySensitive
operationalSensitive
```

---

## 20.5. AutomationDefinitionStatus

```text id="awb-api-enum-definition-status"
active
deprecated
archived
```

---

## 20.6. TenantWorkflowDefinitionStatus

```text id="awb-api-enum-workflow-definition-status"
draft
active
inactive
archived
```

---

## 20.7. TenantWorkflowVersionStatus

```text id="awb-api-enum-workflow-version-status"
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

## 20.8. WorkflowExecutionStatus

```text id="awb-api-enum-execution-status"
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

## 20.9. WorkflowStepExecutionStatus

```text id="awb-api-enum-step-status"
pending
running
succeeded
failed
skipped
retrying
cancelled
```

---

## 20.10. WorkflowDeadLetterStatus

```text id="awb-api-enum-dead-letter-status"
open
underReview
resolved
ignored
archived
```

---

## 20.11. WorkflowExportType and Format

```text id="awb-api-enum-export"
WorkflowExportType:
- workflows
- workflowVersions
- executions
- failedExecutions
- deadLetters
- auditSnapshot
- fullAutomationHistory

WorkflowExportFormat:
- json
- xlsx
- pdf

WorkflowExportStatus:
- requested
- processing
- completed
- failed
- archived
```

---

# 21. Errores

## 21.1. Trigger definitions

```text id="awb-api-errors-trigger-definitions"
AUTOMATION_TRIGGER_DEFINITION_NOT_FOUND
AUTOMATION_TRIGGER_DEFINITION_DUPLICATE_KEY
AUTOMATION_TRIGGER_DEFINITION_INVALID_KEY
AUTOMATION_TRIGGER_DEFINITION_INVALID_SCHEMA
AUTOMATION_TRIGGER_DEFINITION_ARCHIVED
AUTOMATION_TRIGGER_DEFINITION_SECRET_FORBIDDEN
AUTOMATION_TRIGGER_DEFINITION_EXECUTABLE_PAYLOAD_FORBIDDEN
AUTOMATION_TRIGGER_DEFINITION_PUBLIC_WEBHOOK_FORBIDDEN
```

---

## 21.2. Action definitions

```text id="awb-api-errors-action-definitions"
AUTOMATION_ACTION_DEFINITION_NOT_FOUND
AUTOMATION_ACTION_DEFINITION_DUPLICATE_KEY
AUTOMATION_ACTION_DEFINITION_INVALID_KEY
AUTOMATION_ACTION_DEFINITION_INVALID_SCHEMA
AUTOMATION_ACTION_DEFINITION_ARCHIVED
AUTOMATION_ACTION_DEFINITION_SECRET_FORBIDDEN
AUTOMATION_ACTION_DEFINITION_EXECUTABLE_PAYLOAD_FORBIDDEN
AUTOMATION_ACTION_DEFINITION_DESTRUCTIVE_FORBIDDEN
AUTOMATION_ACTION_DEFINITION_FINANCIAL_EXECUTION_FORBIDDEN
AUTOMATION_ACTION_DEFINITION_EXTERNAL_FORBIDDEN
```

---

## 21.3. Workflows

```text id="awb-api-errors-workflows"
AUTOMATION_WORKFLOW_NOT_FOUND
AUTOMATION_WORKFLOW_DUPLICATE_CODE
AUTOMATION_WORKFLOW_INVALID_STATUS
AUTOMATION_WORKFLOW_ARCHIVED
AUTOMATION_WORKFLOW_INACTIVE
AUTOMATION_WORKFLOW_NO_ACTIVE_VERSION
AUTOMATION_WORKFLOW_CROSS_TENANT_REFERENCE
```

---

## 21.4. Workflow versions

```text id="awb-api-errors-workflow-versions"
AUTOMATION_WORKFLOW_VERSION_NOT_FOUND
AUTOMATION_WORKFLOW_VERSION_INVALID_STATUS
AUTOMATION_WORKFLOW_VERSION_SCHEMA_VALIDATION_FAILED
AUTOMATION_WORKFLOW_VERSION_CHANGE_REASON_REQUIRED
AUTOMATION_WORKFLOW_VERSION_APPROVAL_REQUIRED
AUTOMATION_WORKFLOW_VERSION_SENSITIVE_PERMISSION_REQUIRED
AUTOMATION_WORKFLOW_VERSION_ACTIVE_IMMUTABLE
AUTOMATION_WORKFLOW_VERSION_REJECTED_CANNOT_ACTIVATE
AUTOMATION_WORKFLOW_VERSION_ARCHIVED_CANNOT_ACTIVATE
AUTOMATION_WORKFLOW_VERSION_EFFECTIVE_OVERLAP
AUTOMATION_WORKFLOW_VERSION_CROSS_TENANT_REFERENCE
```

---

## 21.5. Executions

```text id="awb-api-errors-executions"
AUTOMATION_EXECUTION_NOT_FOUND
AUTOMATION_EXECUTION_INVALID_STATUS
AUTOMATION_EXECUTION_IDEMPOTENCY_REQUIRED
AUTOMATION_EXECUTION_DUPLICATE_IDEMPOTENCY_KEY
AUTOMATION_EXECUTION_SOURCE_EVENT_REQUIRED
AUTOMATION_EXECUTION_SCHEDULED_WINDOW_REQUIRED
AUTOMATION_EXECUTION_MANUAL_RUN_REQUIRED
AUTOMATION_EXECUTION_MANUAL_REASON_REQUIRED
AUTOMATION_EXECUTION_CANCEL_FORBIDDEN
AUTOMATION_EXECUTION_RETRY_FORBIDDEN
AUTOMATION_EXECUTION_MAX_RETRIES_EXCEEDED
AUTOMATION_EXECUTION_SENSITIVE_PERMISSION_REQUIRED
```

---

## 21.6. Dead letters and exports

```text id="awb-api-errors-deadletters-exports"
AUTOMATION_DEAD_LETTER_NOT_FOUND
AUTOMATION_DEAD_LETTER_INVALID_STATUS
AUTOMATION_DEAD_LETTER_RESOLUTION_REASON_REQUIRED

AUTOMATION_EXPORT_NOT_FOUND
AUTOMATION_EXPORT_INVALID_TYPE
AUTOMATION_EXPORT_INVALID_FORMAT
AUTOMATION_EXPORT_REASON_REQUIRED
AUTOMATION_EXPORT_SENSITIVE_PERMISSION_REQUIRED
AUTOMATION_EXPORT_STORAGE_KEY_FORBIDDEN
AUTOMATION_EXPORT_FAILED
```

---

## 21.7. Security and boundaries

```text id="awb-api-errors-security"
AUTOMATION_TENANT_ID_FORBIDDEN
AUTOMATION_ACTOR_FIELD_FORBIDDEN
AUTOMATION_STATUS_DIRECT_TRANSITION_FORBIDDEN
AUTOMATION_VERSION_NUMBER_FORBIDDEN
AUTOMATION_SECRET_FORBIDDEN
AUTOMATION_RAW_SQL_FORBIDDEN
AUTOMATION_SCRIPT_FORBIDDEN
AUTOMATION_EXECUTABLE_PAYLOAD_FORBIDDEN
AUTOMATION_STORAGE_KEY_FORBIDDEN
AUTOMATION_PUBLIC_ENDPOINT_FORBIDDEN
AUTOMATION_WORDPRESS_ACCESS_FORBIDDEN
AUTOMATION_PUBLIC_WEBHOOK_FORBIDDEN
AUTOMATION_PAYMENT_EXECUTION_FORBIDDEN
AUTOMATION_ACCOUNTING_EXECUTION_FORBIDDEN
AUTOMATION_BANK_RECONCILIATION_CONFIRMATION_FORBIDDEN
AUTOMATION_HARDWARE_CONTROL_FORBIDDEN
AUTOMATION_EXTERNAL_AI_FORBIDDEN
```

---

# 22. Códigos HTTP

| Caso                  |                                                       Código |
| --------------------- | -----------------------------------------------------------: |
| Creación exitosa      |                                                `201 Created` |
| Encolado exitoso      |                                               `202 Accepted` |
| Lectura exitosa       |                                                     `200 OK` |
| Actualización exitosa |                                                     `200 OK` |
| Transición exitosa    |                                                     `200 OK` |
| Validación fallida    |                                                `400` o `422` |
| No autenticado        |                                           `401 Unauthorized` |
| Sin permiso           |                                              `403 Forbidden` |
| Recurso no encontrado |                                              `404 Not Found` |
| Recurso cross-tenant  |                                              `404 Not Found` |
| Estado inválido       |                                               `409 Conflict` |
| Duplicado idempotente | `409 Conflict` o `200 OK` si se devuelve ejecución existente |
| Rate limit            |                                      `429 Too Many Requests` |
| Error interno         |                                  `500 Internal Server Error` |

---

# 23. Integración con Secure Document Storage

## 23.1. Uso permitido

```text id="awb-api-sds-use"
workflow_exports.secureDocumentId
exports de workflows
exports de workflow versions
exports de executions
exports de failed executions
exports de dead letters
exports de audit snapshot
exports de full automation history
```

---

## 23.2. Prohibido

```text id="awb-api-sds-forbidden"
storageKey
signedUrl persistente
base64
rawFilePayload
binary payload en JSON
```

---

## 23.3. Reglas

```text id="awb-api-sds-rules"
- secureDocumentId pertenece al tenant.
- secureDocumentId se genera mediante módulo 016.
- Response no devuelve storageKey.
- Descarga se delega a Secure Document Storage.
- Export se audita.
```

---

# 24. Auditoría

Eventos mínimos:

```text id="awb-api-audit-events"
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

Metadata permitida:

```text id="awb-api-audit-allowed"
workflowId
workflowCode
workflowVersionId
versionNumber
triggerKey
actionKey
executionId
stepKey
sourceEventId
scheduledWindowKey
manualRunId
idempotencyKey
status
reason
retryCount
errorCode
exportType
format
traceId
correlationId
```

Metadata prohibida:

```text id="awb-api-audit-forbidden"
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
script
functionBody
executableCode
raw payload sensible
datos cross-tenant
authorization header
cookie
```

---

# 25. Observabilidad

## 25.1. Logs seguros

Eventos loggeables:

```text id="awb-api-logs"
workflow.execution.queued
workflow.execution.started
workflow.execution.completed
workflow.execution.failed
workflow.execution.retrying
workflow.execution.deadLettered
workflow.step.succeeded
workflow.step.failed
workflow.activation.created
workflow.version.approved
workflow.export.completed
```

Campos permitidos:

```text id="awb-api-log-fields-allowed"
traceId
requestId
correlationId
workflowCode
triggerKey
actionKey
status
outcome
durationMs
retryCount
errorCode
sourceModule
targetModule
```

Campos prohibidos:

```text id="awb-api-log-fields-forbidden"
tenantId como label de alta cardinalidad
userId como label de alta cardinalidad
secret
token
password
apiKey
storageKey
signedUrl
raw event payload
raw action payload
raw request body
authorization header
cookie
```

---

## 25.2. Métricas

```text id="awb-api-metrics"
automation_workflows_created_total
automation_workflow_versions_created_total
automation_workflow_activations_total
automation_executions_queued_total
automation_executions_succeeded_total
automation_executions_failed_total
automation_executions_dead_lettered_total
automation_steps_succeeded_total
automation_steps_failed_total
automation_retries_total
automation_exports_total
automation_queue_depth
automation_execution_duration_ms
automation_step_duration_ms
```

Labels permitidos:

```text id="awb-api-metric-labels-allowed"
triggerType
triggerKey
actionKey
sourceModule
targetModule
status
outcome
errorCode
```

Labels prohibidos:

```text id="awb-api-metric-labels-forbidden"
tenantId
userId
workflowId
workflowVersionId
executionId
sourceEventId
idempotencyKey
traceId
secretKey
```

---

# 26. Rate limiting

Aplicar rate limit reforzado en:

```text id="awb-api-rate-limited"
POST  /api/v1/tenant/automation-workflows
POST  /api/v1/tenant/automation-workflows/{workflowId}/versions
POST  /api/v1/tenant/automation-workflows/{workflowId}/versions/{versionId}/activate
POST  /api/v1/tenant/automation-workflows/{workflowId}/run
POST  /api/v1/tenant/automation-executions/{executionId}/retry
POST  /api/v1/tenant/automation-exports
POST  /api/v1/platform/automation-trigger-definitions
POST  /api/v1/platform/automation-action-definitions
```

Objetivo:

```text id="awb-api-rate-limit-objectives"
- evitar creación masiva accidental de workflows;
- evitar spam de notificaciones;
- proteger colas;
- proteger workers;
- evitar reintentos abusivos;
- proteger exportaciones;
- proteger catálogo platform.
```

---

# 27. Headers de seguridad

Todas las respuestas privadas deben incluir:

```http id="awb-api-security-headers"
Cache-Control: no-store
Pragma: no-cache
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
```

Recomendados:

```http id="awb-api-security-headers-recommended"
Content-Security-Policy: default-src 'none'
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

CORS:

```text id="awb-api-cors"
- no wildcard;
- no WordPress público;
- solo frontends autenticados permitidos;
- orígenes explícitos por ambiente;
- credentials solo si están justificados y configurados de forma segura.
```

---

# 28. OpenAPI

## 28.1. Tags

```text id="awb-api-openapi-tags"
Platform Automation Trigger Definitions
Platform Automation Action Definitions
Tenant Automation Workflows
Tenant Automation Workflow Versions
Tenant Automation Executions
Tenant Automation Dead Letters
Tenant Automation Exports
```

---

## 28.2. Extensiones globales

```yaml id="awb-api-openapi-global"
x-auth-required: true
x-automation-workflows-basic: true
x-public-exposure: false
x-wordpress-access: false
x-secrets-storage: false
x-executable-workflow-payload: false
x-raw-sql-allowed: false
x-public-webhooks: false
x-payment-execution: false
x-accounting-execution: false
x-bank-reconciliation-confirmation: false
x-hardware-control: false
x-external-ai-real-data: false
```

---

## 28.3. Rutas platform

```yaml id="awb-api-openapi-platform"
x-platform-scope: true
x-platform-admin-required: true
```

---

## 28.4. Rutas tenant

```yaml id="awb-api-openapi-tenant"
x-tenant-scope: true
x-permission-required: true
```

---

## 28.5. Rutas de ejecución

```yaml id="awb-api-openapi-execution"
x-idempotency-required: true
x-queue-backed: true
x-audit-required: true
```

---

## 28.6. Rutas de exportación

```yaml id="awb-api-openapi-export"
x-secure-document-storage: true
x-storage-key-exposed: false
```

---

## 28.7. OpenAPI no debe documentar

```text id="awb-api-openapi-forbidden"
tenantId en DTOs externos
actor fields en DTOs externos
versionNumber desde cliente
versionLabel desde cliente
status directo fuera de transición
storageKey
signedUrl persistente
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
/api/v1/public/automation-workflows
/api/v1/public/automation-executions
/api/v1/public/automation-webhooks
```

---

# 29. Endpoints públicos prohibidos

No implementar:

```text id="awb-api-forbidden-public-endpoints"
GET  /api/v1/public/automation-workflows
GET  /api/v1/public/automation-executions
GET  /api/v1/public/automation-webhooks
POST /api/v1/public/automation-webhooks/{webhookKey}
GET  /api/v1/public/tenants/{slug}/automation-workflows
GET  /api/v1/public/tenants/{slug}/automation-executions
```

Respuesta esperada:

```http id="awb-api-public-endpoints-response"
404 Not Found
```

---

# 30. Casos de borde

## 30.1. Workflow cross-tenant

Respuesta:

```http id="awb-api-edge-cross-tenant-http"
404 Not Found
```

Error:

```json id="awb-api-edge-cross-tenant"
{
  "error": {
    "code": "AUTOMATION_WORKFLOW_NOT_FOUND",
    "message": "Automation workflow not found.",
    "details": {},
    "traceId": "trace-id"
  }
}
```

---

## 30.2. Payload con secret

Respuesta:

```http id="awb-api-edge-secret-http"
422 Unprocessable Entity
```

Error:

```json id="awb-api-edge-secret"
{
  "error": {
    "code": "AUTOMATION_SECRET_FORBIDDEN",
    "message": "Secrets are not allowed in automation workflows.",
    "details": {
      "field": "clientSecret"
    },
    "traceId": "trace-id"
  }
}
```

---

## 30.3. Payload ejecutable

Respuesta:

```http id="awb-api-edge-executable-http"
422 Unprocessable Entity
```

Error:

```json id="awb-api-edge-executable"
{
  "error": {
    "code": "AUTOMATION_EXECUTABLE_PAYLOAD_FORBIDDEN",
    "message": "Executable workflow payloads are not allowed.",
    "details": {
      "field": "script"
    },
    "traceId": "trace-id"
  }
}
```

---

## 30.4. Action fuera de catálogo

Respuesta:

```http id="awb-api-edge-action-catalog-http"
422 Unprocessable Entity
```

Error:

```json id="awb-api-edge-action-catalog"
{
  "error": {
    "code": "AUTOMATION_ACTION_DEFINITION_NOT_FOUND",
    "message": "Action definition not found or not enabled.",
    "details": {
      "actionKey": "system.executeScript"
    },
    "traceId": "trace-id"
  }
}
```

---

## 30.5. Ejecución duplicada

Respuesta posible:

```http id="awb-api-edge-duplicate-http"
409 Conflict
```

o, si se decide devolver ejecución existente:

```http id="awb-api-edge-duplicate-ok-http"
200 OK
```

Error:

```json id="awb-api-edge-duplicate"
{
  "error": {
    "code": "AUTOMATION_EXECUTION_DUPLICATE_IDEMPOTENCY_KEY",
    "message": "Workflow execution already exists for this idempotency key.",
    "details": {},
    "traceId": "trace-id"
  }
}
```

---

## 30.6. Retry máximo excedido

Respuesta:

```http id="awb-api-edge-max-retry-http"
409 Conflict
```

Error:

```json id="awb-api-edge-max-retry"
{
  "error": {
    "code": "AUTOMATION_EXECUTION_MAX_RETRIES_EXCEEDED",
    "message": "Maximum retry count exceeded.",
    "details": {},
    "traceId": "trace-id"
  }
}
```

---

## 30.7. Webhook público

Respuesta:

```http id="awb-api-edge-public-webhook-http"
404 Not Found
```

Error no requerido si la ruta no existe.

---

# 31. Validaciones críticas por endpoint

## 31.1. Create workflow version

```text id="awb-api-validate-create-version"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard.
[ ] Rechaza tenantId.
[ ] Rechaza versionNumber.
[ ] Rechaza status directo.
[ ] Valida workflow tenant-scoped.
[ ] Valida triggerKey.
[ ] Valida triggerConfig contra schema.
[ ] Valida conditionConfig.
[ ] Valida actionGraph.
[ ] Valida actionConfig por step.
[ ] Valida retryPolicy.
[ ] Rechaza secrets.
[ ] Rechaza scripts.
[ ] Rechaza rawSql.
[ ] Rechaza executableCode.
[ ] Genera versionNumber server-side.
[ ] Crea draft.
[ ] Audita tenantWorkflowVersion.created.
```

---

## 31.2. Activate workflow version

```text id="awb-api-validate-activate-version"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard.
[ ] SensitivePermissionGuard si aplica.
[ ] Valida workflow tenant-scoped.
[ ] Valida version tenant-scoped.
[ ] Valida status approved.
[ ] Valida effectiveFrom.
[ ] Valida no overlap.
[ ] Crea activation.
[ ] Marca active/scheduled.
[ ] Actualiza workflow status si aplica.
[ ] Audita tenantWorkflowVersion.activated.
```

---

## 31.3. Manual run

```text id="awb-api-validate-manual-run"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard tenantWorkflowExecutions.runManual.
[ ] SensitivePermissionGuard si aplica.
[ ] Valida workflow tenant-scoped.
[ ] Valida version active o versionId permitido.
[ ] Valida workflow manual-enabled.
[ ] Requiere reason si sensible.
[ ] Sanitiza input.
[ ] Rechaza secrets.
[ ] Rechaza scripts.
[ ] Rechaza rawSql.
[ ] Genera manualRunId.
[ ] Genera idempotencyKey.
[ ] Encola execution.
[ ] Audita tenantWorkflowExecution.queued.
```

---

## 31.4. Retry execution

```text id="awb-api-validate-retry"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard tenantWorkflowExecutions.retry.
[ ] SensitivePermissionGuard si aplica.
[ ] Valida execution tenant-scoped.
[ ] Valida status retryable.
[ ] Valida maxRetries.
[ ] Mantiene idempotencia.
[ ] No duplica steps succeeded si retryMode=failedStepsOnly.
[ ] Encola retry.
[ ] Audita tenantWorkflowExecution.retrying.
```

---

## 31.5. Export

```text id="awb-api-validate-export"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard tenantWorkflowExports.create.
[ ] SensitivePermissionGuard si includeSensitive=true.
[ ] Valida exportType.
[ ] Valida format.
[ ] Requiere reason si fullAutomationHistory o auditSnapshot.
[ ] Sanitiza filters.
[ ] Excluye secrets.
[ ] Excluye scripts.
[ ] Excluye rawSql.
[ ] Crea WorkflowExport.
[ ] Crea SecureDocument.
[ ] Devuelve secureDocumentId.
[ ] No devuelve storageKey.
[ ] Audita tenantWorkflowExport.created/completed.
```

---

# 32. Criterios de aceptación API

```text id="awb-api-acceptance"
[ ] Platform Trigger Definitions API requiere autenticación.
[ ] Platform Action Definitions API requiere autenticación.
[ ] Platform API requiere PlatformPermissionGuard.
[ ] Tenant API requiere AuthGuard.
[ ] Tenant API requiere TenantGuard.
[ ] Tenant API requiere PermissionGuard.
[ ] Sensitive workflows requieren SensitivePermissionGuard.
[ ] Workflow create funciona tenant-scoped.
[ ] Workflow version create funciona y genera versionNumber server-side.
[ ] TriggerConfig valida contra schema.
[ ] ConditionConfig valida operadores permitidos.
[ ] ActionGraph valida catálogo cerrado.
[ ] ActionConfig valida contra schema.
[ ] No se acepta action fuera de catálogo.
[ ] No se acepta trigger fuera de catálogo.
[ ] Review/approve/reject funcionan.
[ ] Activate/deactivate funcionan.
[ ] Active version no se edita destructivamente.
[ ] Manual run encola execution.
[ ] Manual run genera idempotencyKey.
[ ] Event internal port usa sourceEventId.
[ ] Scheduled execution usa scheduledWindowKey.
[ ] Retry respeta maxRetries.
[ ] Dead letter puede resolverse o ignorarse.
[ ] Exports usan Secure Document Storage.
[ ] Response no devuelve storageKey.
[ ] DTOs rechazan tenantId.
[ ] DTOs rechazan actor fields.
[ ] DTOs rechazan versionNumber.
[ ] DTOs rechazan status directo.
[ ] DTOs rechazan secrets.
[ ] DTOs rechazan scripts.
[ ] DTOs rechazan rawSql.
[ ] DTOs rechazan executableCode.
[ ] No existen endpoints públicos.
[ ] No existe acceso WordPress público.
[ ] No existen public webhooks.
[ ] API no ejecuta pagos.
[ ] API no crea JournalEntry.
[ ] API no confirma Bank Reconciliation.
[ ] API no controla hardware.
[ ] API no envía datos reales a IA externa.
[ ] Audit se emite en operaciones críticas.
[ ] OpenAPI no documenta campos prohibidos.
```

---

# 33. No aceptación

No se acepta el contrato si:

```text id="awb-api-no-acceptance"
- define endpoints públicos de automatizaciones;
- define public webhooks en MVP;
- permite acceso desde WordPress público;
- permite tenantId en body;
- permite actor fields en body;
- permite versionNumber desde cliente;
- permite versionLabel desde cliente;
- permite status directo fuera de transición;
- permite workflow cross-tenant;
- permite execution cross-tenant;
- permite dead letter cross-tenant;
- permite export cross-tenant;
- permite secrets;
- permite tokens;
- permite passwords;
- permite apiKeys;
- permite privateKeys;
- permite clientSecrets;
- permite storageKey;
- devuelve storageKey;
- devuelve signedUrl persistente;
- permite rawSql;
- permite scripts;
- permite JavaScript configurable;
- permite functionBody;
- permite executableCode;
- permite action fuera de catálogo;
- permite trigger fuera de catálogo;
- permite retries infinitos;
- omite idempotencyKey;
- omite sourceEventId para event-driven;
- omite scheduledWindowKey para scheduled;
- ejecuta Payment;
- valida Payment automáticamente;
- reversa Payment;
- crea SupplierPaymentOrder;
- crea JournalEntry;
- confirma Bank Reconciliation;
- modifica stock directamente;
- modifica AccessEvent directamente;
- abre portones;
- controla hardware;
- habilita biometría;
- habilita reconocimiento facial;
- llama IA externa con datos reales;
- omite auditoría de ejecución crítica;
- logs contienen payload sensible.
```

---

# 34. Resultado esperado

Al implementar este contrato, `026-automation-workflows-basic` tendrá una API REST privada, segura, tenant-scoped, idempotente, versionada, auditada y preparada para ejecutar automatizaciones básicas por colas.

Resultado esperado:

```text id="awb-api-expected-result"
Platform Trigger Definitions API definida
Platform Action Definitions API definida
Tenant Workflow Definitions API definida
Tenant Workflow Versions API definida
Workflow Activation API definida
Workflow Execution API definida
Manual Run API definida
Retry Execution API definida
Cancel Execution API definida
Dead Letter API definida
Workflow Export API definida
Internal Automation Event Port definido
permissions definidos
sensitive permissions definidos
DTOs definidos
forbidden fields definidos
errors definidos
OpenAPI extensions definidas
tenant isolation definido
catalog allowlist definido
schema validation definida
action graph validation definida
condition validation definida
idempotency definida
sourceEventId definido
scheduledWindowKey definido
manualRunId definido
queue-backed execution definida
retry finito definido
dead letter definido
SDS export definido
audit definido
observability definida
no public endpoints
no public webhooks
no WordPress access
no secrets
no executable workflow payload
no raw SQL
no storageKey exposure
no payment execution
no accounting execution
no bank reconciliation confirmation
no hardware control
no external AI with real data
```

---

# 35. Expediente actualizado

```text id="awb-api-expediente"
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
│   │       ├── data-model.md
│   │       └── api-contract.md
```
