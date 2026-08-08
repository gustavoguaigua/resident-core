# Technical Plan — 026 Automation Workflows Basic

## 1. Información del documento

| Campo                 | Valor                                                                                         |
| --------------------- | --------------------------------------------------------------------------------------------- |
| Proyecto              | RESIDENT Core                                                                                 |
| Spec ID               | 026                                                                                           |
| Módulo                | Automation Workflows Basic                                                                    |
| Documento             | Technical Plan                                                                                |
| Ruta                  | `docs/specs/026-automation-workflows-basic/plan.md`                                           |
| Versión               | 0.1                                                                                           |
| Estado                | Borrador inicial                                                                              |
| Fecha                 | 2026-07-31                                                                                    |
| Documento base        | `docs/specs/026-automation-workflows-basic/spec.md`                                           |
| Stack objetivo        | NestJS / TypeScript / PostgreSQL / Prisma / OpenAPI / Keycloak / BullMQ / Redis               |
| Arquitectura objetivo | Monolito modular preparado para microservicios                                                |
| Naturaleza            | Tenant-scoped / Event-driven / Workflow-governed / Audit-heavy / Non-public / Safe automation |

---

## 2. Propósito

Este documento define el plan técnico de implementación del módulo `026-automation-workflows-basic`.

El módulo permitirá crear automatizaciones internas seguras, versionadas, auditadas e idempotentes para RESIDENT Core, usando un catálogo cerrado de triggers y actions, ejecución mediante colas, control de reintentos, dead letter, historial, exportaciones y límites estrictos de seguridad.

Regla central técnica:

```text id="awb-plan-rule"
Automation Workflows Basic debe implementarse como un módulo transversal, tenant-scoped, event-driven, queue-backed, audit-heavy y no público, capaz de ejecutar automatizaciones básicas mediante triggers y actions permitidos por catálogo, con versionamiento, activaciones, idempotencia, retries finitos, dead letter, observabilidad y exportaciones vía Secure Document Storage, sin almacenar secretos, sin aceptar scripts, sin aceptar raw SQL, sin aceptar código ejecutable, sin webhooks públicos inseguros, sin acceso desde WordPress público, sin ejecutar pagos, sin crear asientos contables, sin confirmar conciliaciones bancarias, sin modificar directamente datos transaccionales de módulos consumidores, sin controlar hardware y sin enviar datos reales a IA externa.
```

---

## 3. Decisión técnica principal

```text id="awb-main-decision"
Implementar Automation Workflows Basic como un módulo NestJS independiente dentro del monolito modular, con persistencia propia en PostgreSQL, ejecución asíncrona mediante BullMQ/Redis, catálogo cerrado de trigger/action definitions, workflows tenant-scoped versionados, activaciones auditadas, ejecuciones idempotentes, steps trazables, retries controlados, dead letter básico, puertos internos hacia módulos consumidores y API REST privada.
```

---

## 4. Nombre técnico del módulo

```text id="awb-module-name"
automation-workflows-basic
```

Ruta sugerida:

```text id="awb-module-path"
apps/api/src/modules/automation-workflows-basic/
```

Clase principal:

```typescript id="awb-module-class"
export class AutomationWorkflowsBasicModule {}
```

---

## 5. Clasificación arquitectónica

```text id="awb-architecture-classification"
Tipo: Core supporting module
Nivel: Cross-cutting orchestration module
Persistencia: Propia
Ejecución: Async queue-backed
Colas: BullMQ
Cache/Queue backend: Redis
Exposición externa: API privada autenticada
Exposición pública: No
Exposición WordPress pública: No
Consumo interno: Sí, mediante eventos y puertos
Preparación microservicios: Sí
```

Este módulo debe ser tratado como una capa de orquestación controlada. No reemplaza la lógica de dominio de los módulos consumidores y no escribe directamente en sus tablas.

---

## 6. Alcance técnico MVP

### 6.1. Incluido

```text id="awb-plan-scope-in"
- Módulo NestJS dedicado.
- Catálogo global de trigger definitions.
- Catálogo global de action definitions.
- Workflow definitions tenant-scoped.
- Workflow versions.
- Workflow activations.
- Event-driven workflows.
- Scheduled workflows básicos.
- Manual workflows autorizados.
- Condition config declarativa.
- Action graph simple y validado.
- Workflow executions.
- Workflow step executions.
- Execution logs sanitizados.
- Retry policy finita.
- Dead letter básico.
- Idempotency keys.
- BullMQ queues.
- Redis como backend de colas.
- Workers internos.
- Scheduler interno.
- Event dispatcher interno.
- API Platform privada para catálogo.
- API Tenant Admin privada para workflows.
- API Tenant Admin privada para executions/dead letters/exports.
- Internal service ports para publicación de eventos.
- Integración con Tenant Settings and Policies.
- Integración con Communications and Notifications.
- Integración con Basic Reports.
- Integración con Secure Document Storage.
- Integración con Audit.
- Observabilidad.
- OpenAPI privado.
- Tests de dominio, integración, API, seguridad, idempotencia y colas.
```

---

### 6.2. Fuera de alcance técnico MVP

```text id="awb-plan-scope-out"
- BPMN engine.
- Editor gráfico drag-and-drop.
- Lenguaje DSL ejecutable.
- JavaScript configurable por tenant.
- Python dinámico.
- Raw SQL.
- Expresiones arbitrarias inseguras.
- Webhooks públicos productivos.
- Conectores externos arbitrarios.
- Secrets manager embebido.
- Almacenamiento de credenciales.
- n8n como motor productivo con datos sensibles.
- Zapier/Make como motor productivo sensible.
- Pagos automáticos.
- Reversos automáticos de pagos.
- Asientos contables automáticos directos.
- Confirmación automática de conciliaciones bancarias.
- Modificación directa de inventario.
- Modificación directa de AccessEvents.
- Apertura de portones.
- Control físico de hardware.
- Biometría.
- Reconocimiento facial.
- OCR automático.
- IA externa con datos reales.
- Sagas distribuidas avanzadas.
- Compensaciones complejas.
- Workflow multi-firma avanzado.
- Marketplace de automatizaciones.
```

---

## 7. Dependencias del módulo

### 7.1. Dependencias internas obligatorias

| Módulo                             | Uso                                                                                    |
| ---------------------------------- | -------------------------------------------------------------------------------------- |
| `001-tenants`                      | Validar tenant, estado activo, timezone y tenant isolation                             |
| `002-users-roles`                  | Resolver actor, permisos, aprobadores y manual runs                                    |
| `007-audit`                        | Registrar cambios, activaciones, ejecuciones, fallos y exports                         |
| `008-basic-reports`                | Ejecutar generación controlada de reportes                                             |
| `012-communications-notifications` | Ejecutar acciones de notificación                                                      |
| `016-secure-document-storage`      | Guardar exportaciones e historial                                                      |
| `025-tenant-settings-policies`     | Resolver límites, habilitación, quiet hours, retry policy y permisos de automatización |

---

### 7.2. Módulos emisores de eventos iniciales

```text id="awb-event-source-modules"
004-dues-fees
005-payments
006-account-statements
010-reservations-common-areas
011-fines-sanctions
012-communications-notifications
013-meetings-attendance
014-voting-basic
015-certified-minutes
016-secure-document-storage
017-bank-reconciliation
020-accounting-ledger
021-supplier-payments
022-maintenance-work-orders
023-inventory-basic
024-access-control-visitors
025-tenant-settings-policies
```

---

### 7.3. Módulos consumidores de actions iniciales

```text id="awb-action-target-modules"
008-basic-reports
012-communications-notifications
016-secure-document-storage
022-maintenance-work-orders
023-inventory-basic
024-access-control-visitors
```

Regla:

```text id="awb-action-target-rule"
Automation Workflows Basic invoca puertos autorizados de módulos consumidores; no escribe directamente en tablas externas ni ejecuta acciones destructivas fuera del catálogo.
```

---

## 8. Estructura técnica propuesta

```text id="awb-folder-structure"
apps/api/src/modules/automation-workflows-basic/
├── automation-workflows-basic.module.ts
├── automation-workflows-basic.config.ts
├── automation-workflows-basic.constants.ts
├── controllers/
│   ├── platform-automation-trigger-definitions.controller.ts
│   ├── platform-automation-action-definitions.controller.ts
│   ├── tenant-automation-workflows.controller.ts
│   ├── tenant-automation-workflow-versions.controller.ts
│   ├── tenant-automation-executions.controller.ts
│   ├── tenant-automation-dead-letters.controller.ts
│   └── tenant-automation-exports.controller.ts
│
├── application/
│   ├── services/
│   │   ├── trigger-definition.service.ts
│   │   ├── action-definition.service.ts
│   │   ├── workflow-definition.service.ts
│   │   ├── workflow-version.service.ts
│   │   ├── workflow-activation.service.ts
│   │   ├── workflow-event-dispatcher.service.ts
│   │   ├── workflow-scheduler.service.ts
│   │   ├── workflow-execution.service.ts
│   │   ├── workflow-step-execution.service.ts
│   │   ├── workflow-condition-evaluator.service.ts
│   │   ├── workflow-action-executor.service.ts
│   │   ├── workflow-retry.service.ts
│   │   ├── workflow-dead-letter.service.ts
│   │   ├── workflow-export.service.ts
│   │   ├── workflow-audit.service.ts
│   │   └── workflow-observability.service.ts
│   │
│   ├── use-cases/
│   │   ├── create-trigger-definition.use-case.ts
│   │   ├── update-trigger-definition.use-case.ts
│   │   ├── archive-trigger-definition.use-case.ts
│   │   ├── create-action-definition.use-case.ts
│   │   ├── update-action-definition.use-case.ts
│   │   ├── archive-action-definition.use-case.ts
│   │   ├── create-tenant-workflow.use-case.ts
│   │   ├── update-tenant-workflow.use-case.ts
│   │   ├── archive-tenant-workflow.use-case.ts
│   │   ├── create-workflow-version.use-case.ts
│   │   ├── update-workflow-version.use-case.ts
│   │   ├── submit-workflow-version-review.use-case.ts
│   │   ├── approve-workflow-version.use-case.ts
│   │   ├── reject-workflow-version.use-case.ts
│   │   ├── activate-workflow-version.use-case.ts
│   │   ├── deactivate-workflow-version.use-case.ts
│   │   ├── enqueue-event-workflow-execution.use-case.ts
│   │   ├── enqueue-scheduled-workflow-execution.use-case.ts
│   │   ├── run-manual-workflow.use-case.ts
│   │   ├── execute-workflow.use-case.ts
│   │   ├── execute-workflow-step.use-case.ts
│   │   ├── retry-workflow-execution.use-case.ts
│   │   ├── cancel-workflow-execution.use-case.ts
│   │   ├── resolve-dead-letter.use-case.ts
│   │   └── export-workflow-history.use-case.ts
│   │
│   └── ports/
│       ├── trigger-definition.repository.port.ts
│       ├── action-definition.repository.port.ts
│       ├── workflow-definition.repository.port.ts
│       ├── workflow-version.repository.port.ts
│       ├── workflow-activation.repository.port.ts
│       ├── workflow-execution.repository.port.ts
│       ├── workflow-step-execution.repository.port.ts
│       ├── workflow-execution-log.repository.port.ts
│       ├── workflow-dead-letter.repository.port.ts
│       ├── workflow-export.repository.port.ts
│       ├── workflow-queue.port.ts
│       ├── workflow-lock.port.ts
│       ├── workflow-tenants.port.ts
│       ├── workflow-users.port.ts
│       ├── workflow-settings-policies.port.ts
│       ├── workflow-notifications.port.ts
│       ├── workflow-reports.port.ts
│       ├── workflow-document-storage.port.ts
│       ├── workflow-audit.port.ts
│       └── workflow-action-target.port.ts
│
├── domain/
│   ├── entities/
│   │   ├── workflow-trigger-definition.entity.ts
│   │   ├── workflow-action-definition.entity.ts
│   │   ├── tenant-workflow-definition.entity.ts
│   │   ├── tenant-workflow-version.entity.ts
│   │   ├── tenant-workflow-activation.entity.ts
│   │   ├── workflow-execution.entity.ts
│   │   ├── workflow-step-execution.entity.ts
│   │   ├── workflow-execution-log.entity.ts
│   │   ├── workflow-dead-letter.entity.ts
│   │   └── workflow-export.entity.ts
│   ├── value-objects/
│   │   ├── workflow-code.vo.ts
│   │   ├── workflow-name.vo.ts
│   │   ├── trigger-key.vo.ts
│   │   ├── action-key.vo.ts
│   │   ├── workflow-version-number.vo.ts
│   │   ├── workflow-version-label.vo.ts
│   │   ├── workflow-trigger-config.vo.ts
│   │   ├── workflow-condition-config.vo.ts
│   │   ├── workflow-action-graph.vo.ts
│   │   ├── workflow-idempotency-key.vo.ts
│   │   ├── scheduled-window-key.vo.ts
│   │   ├── source-event-id.vo.ts
│   │   ├── manual-run-id.vo.ts
│   │   ├── retry-policy.vo.ts
│   │   ├── failure-reason.vo.ts
│   │   └── sanitized-json.vo.ts
│   ├── events/
│   ├── policies/
│   └── errors/
│
├── infrastructure/
│   ├── persistence/
│   ├── queue/
│   │   ├── bullmq-workflow-queue.adapter.ts
│   │   ├── workflow-execution.processor.ts
│   │   └── workflow-scheduler.processor.ts
│   ├── locks/
│   │   └── redis-workflow-lock.adapter.ts
│   ├── validation/
│   │   ├── trigger-config-validator.ts
│   │   ├── action-config-validator.ts
│   │   ├── condition-config-validator.ts
│   │   ├── action-graph-validator.ts
│   │   └── workflow-payload-sanitizer.ts
│   ├── tenants/
│   ├── users/
│   ├── settings-policies/
│   ├── notifications/
│   ├── reports/
│   ├── documents/
│   ├── audit/
│   └── observability/
│
├── dto/
├── guards/
├── mappers/
├── schemas/
├── seeds/
├── workers/
└── tests/
```

---

## 9. Componentes principales

### 9.1. Controllers

| Controller                                       | Responsabilidad                                                    |
| ------------------------------------------------ | ------------------------------------------------------------------ |
| `PlatformAutomationTriggerDefinitionsController` | Gestionar catálogo global de triggers                              |
| `PlatformAutomationActionDefinitionsController`  | Gestionar catálogo global de actions                               |
| `TenantAutomationWorkflowsController`            | Gestionar workflows tenant-scoped                                  |
| `TenantAutomationWorkflowVersionsController`     | Gestionar versiones, revisión, aprobación y activación             |
| `TenantAutomationExecutionsController`           | Consultar, ejecutar manualmente, cancelar y reintentar ejecuciones |
| `TenantAutomationDeadLettersController`          | Consultar, resolver e ignorar dead letters                         |
| `TenantAutomationExportsController`              | Exportar historial vía SDS                                         |

---

### 9.2. Application services

```text id="awb-application-services"
TriggerDefinitionService:
  - gestiona catálogo de triggers.

ActionDefinitionService:
  - gestiona catálogo de actions.

WorkflowDefinitionService:
  - gestiona workflows tenant-scoped.

WorkflowVersionService:
  - gestiona versiones y lifecycle.

WorkflowActivationService:
  - activa, programa y desactiva versiones.

WorkflowEventDispatcherService:
  - recibe eventos internos y determina workflows compatibles.

WorkflowSchedulerService:
  - calcula ventanas programadas por tenant/timezone.

WorkflowExecutionService:
  - crea, encola, ejecuta, completa, falla o cancela executions.

WorkflowStepExecutionService:
  - registra ejecución de cada action/step.

WorkflowConditionEvaluatorService:
  - evalúa condiciones declarativas allowlisted.

WorkflowActionExecutorService:
  - ejecuta actions permitidas mediante puertos.

WorkflowRetryService:
  - aplica retry policy finita.

WorkflowDeadLetterService:
  - administra fallos no recuperables.

WorkflowExportService:
  - genera exports vía SDS.

WorkflowAuditService:
  - registra auditoría.

WorkflowObservabilityService:
  - logs, métricas y trazas seguras.
```

---

### 9.3. Domain entities

```text id="awb-domain-entities"
WorkflowTriggerDefinition
WorkflowActionDefinition
TenantWorkflowDefinition
TenantWorkflowVersion
TenantWorkflowActivation
WorkflowExecution
WorkflowStepExecution
WorkflowExecutionLog
WorkflowDeadLetter
WorkflowExport
```

---

### 9.4. Value objects

```text id="awb-value-objects"
WorkflowCode
WorkflowName
TriggerKey
ActionKey
WorkflowVersionNumber
WorkflowVersionLabel
WorkflowTriggerConfig
WorkflowConditionConfig
WorkflowActionGraph
WorkflowIdempotencyKey
SourceEventId
ScheduledWindowKey
ManualRunId
RetryPolicy
FailureReason
SanitizedWorkflowPayload
EffectiveWindow
ActivationReason
ApprovalReason
RejectionReason
ArchiveReason
```

---

### 9.5. Domain policies

```text id="awb-domain-policies"
WorkflowTenantIsolationPolicy
WorkflowCatalogAllowlistPolicy
WorkflowTriggerPolicy
WorkflowActionPolicy
WorkflowVersioningPolicy
WorkflowActivationPolicy
WorkflowConditionPolicy
WorkflowIdempotencyPolicy
WorkflowRetryPolicy
WorkflowDeadLetterPolicy
NoPublicWebhookPolicy
NoWordPressAutomationAccessPolicy
NoSecretsInWorkflowPolicy
NoExecutableWorkflowPayloadPolicy
NoRawSqlWorkflowPolicy
NoDestructiveActionPolicy
NoFinancialExecutionPolicy
NoHardwareControlPolicy
NoExternalAiRealDataPolicy
WorkflowAuditPolicy
WorkflowPayloadSanitizationPolicy
```

---

## 10. Modelo de datos técnico preliminar

El modelo formal se detallará en `data-model.md`.

Tablas esperadas:

```text id="awb-plan-tables"
workflow_trigger_definitions
workflow_action_definitions
tenant_workflow_definitions
tenant_workflow_versions
tenant_workflow_activations
workflow_executions
workflow_step_executions
workflow_execution_logs
workflow_dead_letters
workflow_exports
```

---

### 10.1. Tablas platform/global

```text id="awb-platform-tables"
workflow_trigger_definitions
workflow_action_definitions
```

Reglas:

```text id="awb-platform-table-rules"
- No contienen datos reales de tenant.
- No almacenan secretos.
- No almacenan código ejecutable.
- No contienen raw SQL.
- Son gestionadas por PlatformAdmin autorizado.
```

---

### 10.2. Tablas tenant-scoped

```text id="awb-tenant-tables"
tenant_workflow_definitions
tenant_workflow_versions
tenant_workflow_activations
workflow_executions
workflow_step_executions
workflow_execution_logs
workflow_dead_letters
workflow_exports
```

Regla:

```text id="awb-tenant-table-rule"
Toda consulta, mutación, ejecución, cancelación, retry, dead letter, log o export tenant-scoped debe filtrar por tenant_id.
```

---

## 11. Estrategia de multitenancy

### 11.1. Patrón obligatorio

```typescript id="awb-tenant-pattern"
await prisma.tenantWorkflowDefinition.findFirst({
  where: {
    id: workflowId,
    tenantId: currentTenant.id,
    archivedAt: null
  }
});
```

---

### 11.2. Patrón prohibido

```typescript id="awb-tenant-forbidden-pattern"
await prisma.tenantWorkflowDefinition.findUnique({
  where: {
    id: workflowId
  }
});
```

---

### 11.3. Respuesta cross-tenant

```http id="awb-cross-tenant-response"
404 Not Found
```

Regla:

```text id="awb-cross-tenant-rule"
No usar 403 para recursos cross-tenant cuando pueda revelar existencia de workflows, executions, logs, dead letters o exports de otro tenant.
```

---

## 12. Estrategia de catálogo

### 12.1. Trigger definitions

Cada trigger permitido debe declarar:

```text id="awb-trigger-definition-fields"
triggerKey
category
sourceModule
triggerType
eventName
schema
description
sensitivity
isTenantEnabled
status
```

Tipos de trigger:

```text id="awb-trigger-types"
event
scheduled
manual
system
```

Reglas:

```text id="awb-trigger-definition-plan-rules"
- triggerKey único.
- triggerKey estable.
- triggerConfig valida contra schema.
- No public webhooks en MVP.
- No triggers de WordPress público.
- No secrets.
- No scripts.
```

---

### 12.2. Action definitions

Cada action permitida debe declarar:

```text id="awb-action-definition-fields"
actionKey
category
targetModule
actionType
schema
description
sensitivity
requiresPermission
requiresApproval
isDestructive
isFinancial
isExternal
status
```

Tipos de action:

```text id="awb-action-types"
notification
report
document
administrativeTask
reviewRequest
escalation
moduleNotification
```

Reglas:

```text id="awb-action-definition-plan-rules"
- actionKey único.
- targetModule obligatorio.
- actionConfig valida contra schema.
- Actions destructivas deshabilitadas en MVP salvo allowlist explícita.
- Actions financieras no crean pagos ni asientos.
- No actions externas no confiables.
- No secrets.
- No scripts.
```

---

## 13. Estrategia de workflows

### 13.1. TenantWorkflowDefinition

Representa el contenedor lógico del workflow.

Reglas:

```text id="awb-workflow-definition-plan-rules"
- workflowCode único por tenant.
- name obligatorio.
- ownerUserProfileId server-side o validado.
- No ejecuta sin active version.
- Archive no borra versiones ni executions.
```

---

### 13.2. TenantWorkflowVersion

Representa el contenido versionado.

Incluye:

```text id="awb-workflow-version-content"
triggerDefinitionId
triggerConfig
conditionConfig
actionGraph
retryPolicy
effectiveFrom
effectiveUntil
status
```

Reglas:

```text id="awb-workflow-version-plan-rules"
- versionNumber server-side.
- draft editable.
- active no editable destructivamente.
- cambios crean nueva versión.
- triggerConfig valida contra trigger schema.
- actionGraph valida contra action catalog.
- conditionConfig no ejecutable.
- no scripts.
- no raw SQL.
- no secrets.
```

---

### 13.3. Workflow activation

Reglas:

```text id="awb-activation-plan-rules"
- Solo versiones approved pueden activarse.
- Una sola versión active por workflow y effectiveAt.
- Activación futura no ejecuta antes de effectiveFrom.
- Desactivación conserva historial.
- Cache/lookup de active workflows se invalida post-commit.
- Toda activación se audita.
```

---

## 14. Estrategia de action graph

### 14.1. Modelo MVP

El MVP soportará un grafo lineal o semi-lineal simple.

```text id="awb-action-graph-mvp"
start
  -> step_1
  -> step_2
  -> step_n
end
```

Permitido:

```text id="awb-action-graph-allowed"
- steps secuenciales;
- steps opcionales por condición simple;
- fail-fast;
- continue-on-error controlado;
- retry por step;
- timeout por step;
- output sanitizado.
```

No permitido en MVP:

```text id="awb-action-graph-forbidden"
- ciclos arbitrarios;
- recursion;
- loops configurables;
- fan-out masivo sin límite;
- joins complejos;
- compensaciones distribuidas;
- código dinámico;
- actions creadas por usuario;
- actions fuera de catálogo;
```

---

### 14.2. Shape conceptual

```json id="awb-action-graph-shape"
{
  "steps": [
    {
      "stepKey": "notify_resident",
      "actionKey": "notifications.sendToResident",
      "actionConfig": {
        "templateKey": "payment.validated",
        "audience": "sourceResident"
      },
      "onFailure": "failWorkflow",
      "timeoutSeconds": 30,
      "maxRetries": 2
    }
  ]
}
```

---

## 15. Estrategia de condiciones

### 15.1. Operadores permitidos

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

### 15.2. Prohibido

```text id="awb-condition-forbidden"
eval
Function
javascript
script
rawSql
regex peligrosa sin límite
templateExpressionUnsafe
externalLookup
crossTenantLookup
```

---

### 15.3. Shape conceptual

```json id="awb-condition-shape"
{
  "and": [
    {
      "field": "event.payment.status",
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

Regla:

```text id="awb-condition-rule"
Las condiciones operan sobre payload sanitizado y campos allowlisted por trigger schema.
```

---

## 16. Estrategia de eventos internos

### 16.1. Envelope de evento interno

```typescript id="awb-internal-event-envelope"
type AutomationEventEnvelope = {
  eventName: string;
  tenantId: string;
  sourceModule: string;
  sourceEventId: string;
  occurredAt: string;
  payload: Record<string, unknown>;
  sensitivity: "internal" | "restricted" | "financialSensitive" | "privacySensitive" | "securitySensitive";
  correlationId: string;
  traceId: string;
};
```

---

### 16.2. Reglas

```text id="awb-internal-event-rules"
- eventName debe existir en trigger definitions.
- tenantId obligatorio.
- sourceEventId obligatorio.
- sourceModule obligatorio.
- payload debe estar sanitizado.
- No incluir secretos.
- No incluir storageKey.
- No incluir documentos raw.
- No incluir comprobantes base64.
- No incluir datos personales masivos.
```

---

### 16.3. Publicación de eventos

Los módulos emisores deben publicar eventos mediante puerto interno:

```typescript id="awb-event-port"
export interface AutomationEventPublisherPort {
  publishAutomationEvent(event: AutomationEventEnvelope): Promise<void>;
}
```

---

## 17. Estrategia de colas y workers

### 17.1. Tecnología

```text id="awb-queue-tech"
BullMQ + Redis
```

Colas sugeridas:

```text id="awb-queues"
automation-events
automation-executions
automation-steps
automation-scheduled
automation-retries
automation-dead-letter
```

---

### 17.2. Workers

```text id="awb-workers"
AutomationEventWorker:
  - procesa eventos internos y crea executions.

AutomationExecutionWorker:
  - ejecuta workflow completo o coordina steps.

AutomationStepWorker:
  - ejecuta action individual.

AutomationSchedulerWorker:
  - evalúa scheduled workflows.

AutomationRetryWorker:
  - gestiona retries.

AutomationDeadLetterWorker:
  - mueve fallos definitivos a dead letter.
```

---

### 17.3. Reglas de ejecución

```text id="awb-worker-rules"
- Worker siempre valida tenantId.
- Worker siempre valida workflow active.
- Worker siempre valida idempotencyKey.
- Worker no ejecuta actions fuera de catálogo.
- Worker no ejecuta scripts.
- Worker no ejecuta SQL dinámico.
- Worker no ejecuta actions financieras prohibidas.
- Worker registra step execution.
- Worker audita eventos críticos.
- Worker sanitiza logs.
```

---

## 18. Estrategia de idempotencia

### 18.1. Idempotency key

Formato recomendado:

```text id="awb-idempotency-format"
tenant:{tenantId}:workflow:{workflowDefinitionId}:trigger:{triggerType}:source:{sourceKey}
```

Ejemplos:

```text id="awb-idempotency-examples"
tenant:T1:workflow:W1:trigger:event:source:paymentValidated-123
tenant:T1:workflow:W1:trigger:scheduled:source:2026-08-01-monthly
tenant:T1:workflow:W1:trigger:manual:source:manualRun-456
```

---

### 18.2. Reglas

```text id="awb-idempotency-rules"
- Toda execution requiere idempotencyKey.
- idempotencyKey único por tenant + workflow + source.
- Reintentos no crean nuevas acciones duplicadas.
- Scheduled usa scheduledWindowKey.
- Event usa sourceEventId.
- Manual usa manualRunId.
```

---

### 18.3. Constraint esperada

```text id="awb-idempotency-constraint"
unique(tenant_id, workflow_definition_id, idempotency_key)
```

---

## 19. Estrategia de scheduled workflows

### 19.1. Tipos soportados

```text id="awb-schedule-types"
daily
weekly
monthly
cronBasic
```

---

### 19.2. Timezone

```text id="awb-schedule-timezone"
Usar timezone efectivo del tenant desde 025-tenant-settings-policies o 001-tenants.
Default: America/Guayaquil.
```

---

### 19.3. Frecuencia mínima

Regla MVP:

```text id="awb-schedule-frequency"
No permitir schedules con frecuencia menor a 1 hora en MVP.
```

---

### 19.4. Quiet hours

```text id="awb-quiet-hours"
Scheduled workflows que envían notificaciones deben respetar quiet hours del tenant, salvo action marcada como criticalAlert y permitida por policy.
```

---

## 20. Estrategia de retries y dead letter

### 20.1. Retry policy

Shape recomendado:

```json id="awb-retry-policy-shape"
{
  "maxRetries": 3,
  "backoffStrategy": "exponential",
  "initialDelaySeconds": 60,
  "maxDelaySeconds": 3600
}
```

---

### 20.2. Backoff permitido

```text id="awb-backoff-types"
fixed
exponential
```

---

### 20.3. Reglas

```text id="awb-retry-rules"
- No retries infinitos.
- maxRetries debe tener límite global.
- Error no recuperable no se reintenta.
- Reintento manual requiere permiso.
- Reintento sensible requiere permiso reforzado.
- Reintento no debe duplicar actions idempotentes.
- Al agotar retries se crea WorkflowDeadLetter.
```

---

### 20.4. Dead letter

Reglas:

```text id="awb-dead-letter-rules-plan"
- Dead letter siempre tenant-scoped.
- Contiene error sanitizado.
- No contiene payload raw sensible.
- Puede resolverse o ignorarse.
- Resolver dead letter no borra execution.
- Reprocess requiere permiso y mantiene idempotencia.
```

---

## 21. Estrategia de API

### 21.1. Base path

```text id="awb-base-path"
/api/v1
```

---

### 21.2. Platform API

```text id="awb-platform-api-plan"
/api/v1/platform/automation-trigger-definitions
/api/v1/platform/automation-action-definitions
```

---

### 21.3. Tenant Admin API

```text id="awb-tenant-api-plan"
/api/v1/tenant/automation-workflows
/api/v1/tenant/automation-executions
/api/v1/tenant/automation-dead-letters
/api/v1/tenant/automation-exports
```

---

### 21.4. Internal API

```text id="awb-internal-api-plan"
publishAutomationEvent(event)
enqueueWorkflowExecution(command)
executeWorkflowStep(command)
resolveWorkflowCatalog(triggerKey, actionKeys)
```

---

### 21.5. Public API prohibida

No implementar:

```text id="awb-public-api-forbidden"
/api/v1/public/automation-workflows
/api/v1/public/automation-executions
/api/v1/public/automation-webhooks
/api/v1/public/tenants/{slug}/automation-workflows
```

Respuesta esperada:

```http id="awb-public-api-response"
404 Not Found
```

---

## 22. DTO strategy

### 22.1. DTOs principales

```text id="awb-dtos"
CreateWorkflowTriggerDefinitionDto
UpdateWorkflowTriggerDefinitionDto
ArchiveWorkflowTriggerDefinitionDto

CreateWorkflowActionDefinitionDto
UpdateWorkflowActionDefinitionDto
ArchiveWorkflowActionDefinitionDto

CreateTenantWorkflowDto
UpdateTenantWorkflowDto
ArchiveTenantWorkflowDto

CreateTenantWorkflowVersionDto
UpdateTenantWorkflowVersionDto
SubmitWorkflowVersionReviewDto
ApproveWorkflowVersionDto
RejectWorkflowVersionDto
ActivateWorkflowVersionDto
DeactivateWorkflowVersionDto
ArchiveWorkflowVersionDto

ManualRunWorkflowDto
CancelWorkflowExecutionDto
RetryWorkflowExecutionDto

ResolveWorkflowDeadLetterDto
IgnoreWorkflowDeadLetterDto

CreateWorkflowExportDto
```

---

### 22.2. Campos prohibidos

Todo DTO externo debe rechazar:

```text id="awb-plan-forbidden-dto"
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

### 22.3. DTO mapping seguro

Prohibido:

```typescript id="awb-dto-map-forbidden"
const data = { ...dto };
await prisma.tenantWorkflowVersion.create({ data });
```

Permitido:

```typescript id="awb-dto-map-safe"
const command = CreateTenantWorkflowVersionCommand.fromDto(dto, {
  tenantId: currentTenant.id,
  actorUserProfileId: currentUser.id,
  traceId: requestContext.traceId
});
```

---

## 23. Guards

### 23.1. Guards obligatorios

```text id="awb-guards"
AuthGuard
TenantGuard
PermissionGuard
SensitivePermissionGuard
PlatformPermissionGuard
WorkflowTenantGuard
WorkflowVersionTenantGuard
WorkflowExecutionTenantGuard
WorkflowDeadLetterTenantGuard
WorkflowExportTenantGuard
InternalAutomationEventGuard
```

---

### 23.2. Uso por superficie

| Superficie            | Guards                                                                 |
| --------------------- | ---------------------------------------------------------------------- |
| Platform API          | AuthGuard, PlatformPermissionGuard                                     |
| Tenant Workflows API  | AuthGuard, TenantGuard, PermissionGuard, WorkflowTenantGuard           |
| Workflow Versions API | AuthGuard, TenantGuard, PermissionGuard, WorkflowVersionTenantGuard    |
| Executions API        | AuthGuard, TenantGuard, PermissionGuard, WorkflowExecutionTenantGuard  |
| Dead Letters API      | AuthGuard, TenantGuard, PermissionGuard, WorkflowDeadLetterTenantGuard |
| Exports API           | AuthGuard, TenantGuard, PermissionGuard, WorkflowExportTenantGuard     |
| Sensitive actions     | SensitivePermissionGuard                                               |
| Internal events       | InternalAutomationEventGuard                                           |

---

## 24. Permisos

### 24.1. Permisos platform

```text id="awb-platform-permissions"
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

### 24.2. Permisos tenant

```text id="awb-tenant-permissions"
tenantWorkflows.read
tenantWorkflows.create
tenantWorkflows.updateDraft
tenantWorkflows.submitReview
tenantWorkflows.approve
tenantWorkflows.reject
tenantWorkflows.activate
tenantWorkflows.deactivate
tenantWorkflows.archive

tenantWorkflowExecutions.read
tenantWorkflowExecutions.runManual
tenantWorkflowExecutions.cancel
tenantWorkflowExecutions.retry
tenantWorkflowExecutions.resolveDeadLetter

tenantWorkflowLogs.read
tenantWorkflowExports.create
tenantWorkflowExports.read
```

---

### 24.3. Permisos sensibles

```text id="awb-plan-sensitive-permissions"
tenantWorkflows.approveSensitive
tenantWorkflows.activateSensitive
tenantWorkflowExecutions.runSensitive
tenantWorkflowExecutions.retrySensitive
tenantWorkflowExports.exportSensitive
```

---

## 25. Integraciones técnicas

### 25.1. Tenants port

```typescript id="awb-tenants-port"
export interface AutomationTenantsPort {
  validateTenantIsActive(tenantId: string): Promise<void>;
  getTenantTimezone(tenantId: string): Promise<string>;
  getTenantOperationalSummary(tenantId: string): Promise<TenantOperationalSummary>;
}
```

---

### 25.2. Users port

```typescript id="awb-users-port"
export interface AutomationUsersPort {
  getActorProfile(userProfileId: string): Promise<ActorProfile>;
  validateApprover(tenantId: string, userProfileId: string, permission: string): Promise<void>;
}
```

---

### 25.3. Settings and policies port

```typescript id="awb-settings-port"
export interface AutomationSettingsPoliciesPort {
  resolveAutomationPolicy(tenantId: string): Promise<AutomationPolicy>;
  resolveQuietHoursPolicy(tenantId: string): Promise<QuietHoursPolicy>;
  resolveRetryPolicy(tenantId: string): Promise<RetryPolicy>;
  resolveWorkflowLimits(tenantId: string): Promise<WorkflowLimits>;
}
```

---

### 25.4. Notifications port

```typescript id="awb-notifications-port"
export interface AutomationNotificationsPort {
  sendNotification(input: AutomationNotificationInput): Promise<{
    notificationId: string;
  }>;
}
```

---

### 25.5. Reports port

```typescript id="awb-reports-port"
export interface AutomationReportsPort {
  generateReport(input: AutomationReportInput): Promise<{
    reportId: string;
    secureDocumentId?: string;
  }>;
}
```

---

### 25.6. Secure Document Storage port

```typescript id="awb-sds-port"
export interface AutomationDocumentStoragePort {
  createExportDocument(input: CreateAutomationExportDocumentInput): Promise<{
    secureDocumentId: string;
  }>;
}
```

---

### 25.7. Audit port

```typescript id="awb-audit-port"
export interface AutomationAuditPort {
  record(event: AutomationAuditEvent): Promise<void>;
}
```

---

### 25.8. Queue port

```typescript id="awb-queue-port"
export interface WorkflowQueuePort {
  enqueueExecution(command: EnqueueWorkflowExecutionCommand): Promise<void>;
  enqueueStep(command: EnqueueWorkflowStepCommand): Promise<void>;
  enqueueRetry(command: EnqueueWorkflowRetryCommand): Promise<void>;
}
```

---

## 26. Límites explícitos de dominio

### 26.1. No acciones financieras destructivas

Prohibido:

```text id="awb-no-financial-destructive"
- crear Payment;
- validar Payment automáticamente;
- reversar Payment;
- crear SupplierPaymentOrder;
- crear SupplierPayable;
- crear JournalEntry;
- crear JournalEntryLine;
- confirmar Bank Reconciliation;
- crear ReconciliationMatch confirmado;
- generar cargos financieros automáticamente desde workflow;
```

---

### 26.2. No acciones de hardware

Prohibido:

```text id="awb-no-hardware"
- abrir portones;
- cerrar portones;
- controlar torniquetes;
- activar cerraduras;
- consumir cámaras CCTV;
- reconocimiento facial;
- biometría;
- OCR automático de placas;
- enviar gateOpenCommand;
- enviar hardwareDeviceCommand;
```

---

### 26.3. No external AI

Prohibido:

```text id="awb-no-external-ai"
- enviar payloads reales de workflow a IA externa;
- enviar eventos reales a IA externa;
- enviar reportes reales a IA externa;
- enviar datos financieros reales a IA externa;
- enviar datos personales reales a IA externa;
- ejecutar agent workflows con datos reales.
```

---

## 27. Estrategia de exportaciones

### 27.1. Export types

```text id="awb-export-types"
workflows
workflowVersions
executions
failedExecutions
deadLetters
auditSnapshot
fullAutomationHistory
```

---

### 27.2. Formatos

```text id="awb-export-formats"
json
xlsx
pdf
```

MVP recomendado:

```text id="awb-export-mvp-format"
json + xlsx
```

---

### 27.3. Reglas

```text id="awb-export-rules-plan"
- Export requiere permiso.
- Export sensible requiere permiso reforzado.
- Export requiere reason si incluye fallos sensibles o historial completo.
- Export usa Secure Document Storage.
- Response devuelve secureDocumentId.
- Response no devuelve storageKey.
- Export no incluye secretos.
- Export no incluye raw event payload sensible.
- Export no incluye scripts.
- Export se audita.
```

---

## 28. Auditoría técnica

### 28.1. Eventos obligatorios

```text id="awb-plan-audit-events"
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

### 28.2. Metadata permitida

```text id="awb-plan-audit-allowed"
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

---

### 28.3. Metadata prohibida

```text id="awb-plan-audit-forbidden"
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

## 29. Observabilidad técnica

### 29.1. Logs permitidos

```text id="awb-plan-logs"
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

---

### 29.2. Métricas

```text id="awb-plan-metrics"
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

---

### 29.3. Labels permitidos

```text id="awb-plan-metric-labels-allowed"
triggerType
triggerKey
actionKey
sourceModule
targetModule
status
outcome
errorCode
```

---

### 29.4. Labels prohibidos

```text id="awb-plan-metric-labels-forbidden"
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

## 30. OpenAPI strategy

### 30.1. Tags

```text id="awb-openapi-tags"
Platform Automation Trigger Definitions
Platform Automation Action Definitions
Tenant Automation Workflows
Tenant Automation Workflow Versions
Tenant Automation Executions
Tenant Automation Dead Letters
Tenant Automation Exports
```

---

### 30.2. Extensiones globales

```yaml id="awb-openapi-extensions"
x-auth-required: true
x-tenant-scope: true
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

### 30.3. Rutas platform

```yaml id="awb-openapi-platform"
x-platform-scope: true
x-platform-admin-required: true
```

---

### 30.4. Rutas tenant

```yaml id="awb-openapi-tenant"
x-tenant-scope: true
x-permission-required: true
```

---

### 30.5. Rutas de ejecución

```yaml id="awb-openapi-execution"
x-idempotency-required: true
x-queue-backed: true
x-audit-required: true
```

---

### 30.6. Rutas de exportación

```yaml id="awb-openapi-export"
x-secure-document-storage: true
x-storage-key-exposed: false
```

---

## 31. Configuración y feature flags

### 31.1. Variables recomendadas

```text id="awb-env-vars"
AUTOMATION_WORKFLOWS_ENABLED=true
AUTOMATION_WORKFLOWS_QUEUE_ENABLED=true
AUTOMATION_WORKFLOWS_SCHEDULER_ENABLED=true
AUTOMATION_WORKFLOWS_EXPORT_ENABLED=true
AUTOMATION_WORKFLOWS_PUBLIC_ENDPOINTS_ENABLED=false
AUTOMATION_WORKFLOWS_PUBLIC_WEBHOOKS_ENABLED=false
AUTOMATION_WORKFLOWS_WORDPRESS_ACCESS_ENABLED=false
AUTOMATION_WORKFLOWS_EXECUTABLE_PAYLOADS_ENABLED=false
AUTOMATION_WORKFLOWS_RAW_SQL_ENABLED=false
AUTOMATION_WORKFLOWS_SECRET_STORAGE_ENABLED=false
AUTOMATION_WORKFLOWS_EXTERNAL_AI_ENABLED=false
AUTOMATION_WORKFLOWS_PAYMENT_EXECUTION_ENABLED=false
AUTOMATION_WORKFLOWS_ACCOUNTING_EXECUTION_ENABLED=false
AUTOMATION_WORKFLOWS_BANK_RECONCILIATION_CONFIRM_ENABLED=false
AUTOMATION_WORKFLOWS_HARDWARE_CONTROL_ENABLED=false
AUTOMATION_WORKFLOWS_MAX_RETRIES=3
AUTOMATION_WORKFLOWS_MIN_SCHEDULE_INTERVAL_MINUTES=60
AUTOMATION_WORKFLOWS_MAX_STEPS_PER_WORKFLOW=10
AUTOMATION_WORKFLOWS_MAX_EXECUTIONS_PER_HOUR_PER_TENANT=100
```

---

### 31.2. Boot validation

El boot debe fallar si:

```text id="awb-boot-validation"
AUTOMATION_WORKFLOWS_PUBLIC_ENDPOINTS_ENABLED=true
AUTOMATION_WORKFLOWS_PUBLIC_WEBHOOKS_ENABLED=true
AUTOMATION_WORKFLOWS_WORDPRESS_ACCESS_ENABLED=true
AUTOMATION_WORKFLOWS_EXECUTABLE_PAYLOADS_ENABLED=true
AUTOMATION_WORKFLOWS_RAW_SQL_ENABLED=true
AUTOMATION_WORKFLOWS_SECRET_STORAGE_ENABLED=true
AUTOMATION_WORKFLOWS_EXTERNAL_AI_ENABLED=true
AUTOMATION_WORKFLOWS_PAYMENT_EXECUTION_ENABLED=true
AUTOMATION_WORKFLOWS_ACCOUNTING_EXECUTION_ENABLED=true
AUTOMATION_WORKFLOWS_BANK_RECONCILIATION_CONFIRM_ENABLED=true
AUTOMATION_WORKFLOWS_HARDWARE_CONTROL_ENABLED=true
```

---

## 32. Seeds iniciales

### 32.1. Trigger definitions iniciales

```text id="awb-seed-trigger-definitions"
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

### 32.2. Action definitions iniciales

```text id="awb-seed-action-definitions"
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

### 32.3. Reglas de seeds

```text id="awb-seed-rules"
- Seeds deben ser idempotentes.
- Seeds no deben contener datos reales.
- Seeds no deben contener secretos.
- Seeds no deben contener scripts.
- Seeds no deben habilitar actions destructivas.
- Seeds no deben habilitar pagos.
- Seeds no deben habilitar contabilidad directa.
- Seeds no deben habilitar webhooks públicos.
- Seeds no deben habilitar IA externa.
```

---

## 33. Testing strategy

El detalle completo se definirá en `test-plan.md`.

### 33.1. Tests unitarios

```text id="awb-unit-tests"
- value objects;
- trigger/action validators;
- condition evaluator;
- action graph validator;
- idempotency key builder;
- retry policy;
- state machines;
- domain policies;
- sanitizers.
```

---

### 33.2. Tests de integración

```text id="awb-integration-tests"
- Prisma repositories;
- unique constraints;
- queue adapters;
- workflow event dispatch;
- workflow scheduling;
- idempotency;
- retries;
- dead letter;
- SDS export adapter;
- audit adapter;
- settings policies adapter.
```

---

### 33.3. Tests API

```text id="awb-api-tests"
- Platform trigger definitions API.
- Platform action definitions API.
- Tenant workflows API.
- Workflow versions API.
- Executions API.
- Dead letters API.
- Exports API.
- DTO validation.
- permission checks.
- sensitive permission checks.
- cross-tenant 404.
```

---

### 33.4. Tests de seguridad

```text id="awb-security-tests"
- no tenantId in DTO.
- no actor fields in DTO.
- no versionNumber in DTO.
- no status direct transition.
- no secrets.
- no executable payload.
- no scripts.
- no raw SQL.
- no public endpoints.
- no public webhooks.
- no WordPress access.
- no storageKey exposure.
- no payment execution.
- no accounting execution.
- no bank reconciliation confirmation.
- no hardware control.
- no external AI.
```

---

## 34. Performance strategy

### 34.1. Objetivos

```text id="awb-performance-targets"
- Encolar ejecución p95 < 500 ms.
- Listar workflows p95 < 800 ms.
- Listar executions p95 < 1200 ms.
- Procesar step simple p95 < 2000 ms.
- Export pequeño p95 < 3000 ms.
- pageSize máximo = 100.
```

---

### 34.2. Optimización

```text id="awb-performance-optimization"
- Índices por tenantId + workflowCode.
- Índices por tenantId + workflowDefinitionId + status.
- Índices por tenantId + triggerKey.
- Índices por tenantId + idempotencyKey.
- Índices por tenantId + execution status.
- Índices por scheduledWindowKey.
- Workers con concurrencia limitada.
- Rate limits por tenant.
- select explícito.
- payloads sanitizados y acotados.
- paginación obligatoria.
```

---

## 35. Concurrency strategy

Casos críticos:

```text id="awb-concurrency-cases"
- dos usuarios activan versiones distintas del mismo workflow;
- dos usuarios crean versionNumber simultáneo;
- evento duplicado llega dos veces;
- scheduler intenta ejecutar misma ventana dos veces;
- retry manual y retry automático simultáneos;
- cancelación mientras ejecución está running;
- step termina después de cancelación;
- dead letter se resuelve mientras se reintenta;
- export se solicita dos veces con mismos filtros.
```

Controles:

```text id="awb-concurrency-controls"
- transacciones;
- unique constraints;
- idempotencyKey único;
- locks por tenant + workflow;
- locks por execution;
- update condicional por status;
- BullMQ jobId determinístico;
- retry lineage;
- audit de conflictos;
```

---

## 36. Plan de implementación por fases

### 36.1. Fase 1 — Base del módulo

```text id="awb-phase-1"
- Crear módulo NestJS.
- Crear config y feature flags.
- Crear enums.
- Crear errores.
- Crear value objects.
- Crear validators base.
- Crear domain policies.
```

---

### 36.2. Fase 2 — Persistencia

```text id="awb-phase-2"
- Crear Prisma schema.
- Crear migración.
- Crear repositories.
- Crear índices y constraints.
- Crear seeds de trigger/action definitions.
```

---

### 36.3. Fase 3 — Catálogo platform

```text id="awb-phase-3"
- Implementar TriggerDefinitions API.
- Implementar ActionDefinitions API.
- Implementar validación de catálogo.
- Implementar audit de catálogo.
```

---

### 36.4. Fase 4 — Workflows y versiones

```text id="awb-phase-4"
- Implementar TenantWorkflowDefinition.
- Implementar TenantWorkflowVersion.
- Implementar review/approval/rejection.
- Implementar activation/deactivation.
- Implementar versioning.
```

---

### 36.5. Fase 5 — Colas, scheduler e idempotencia

```text id="awb-phase-5"
- Implementar BullMQ queues.
- Implementar execution queue.
- Implementar scheduler worker.
- Implementar event dispatcher.
- Implementar idempotency.
- Implementar locks.
```

---

### 36.6. Fase 6 — Execution engine básico

```text id="awb-phase-6"
- Implementar WorkflowExecutionService.
- Implementar StepExecutionService.
- Implementar ConditionEvaluator.
- Implementar ActionExecutor.
- Implementar retry policy.
- Implementar dead letter.
```

---

### 36.7. Fase 7 — Integraciones permitidas

```text id="awb-phase-7"
- Integrar Notifications.
- Integrar Basic Reports.
- Integrar Secure Document Storage.
- Integrar Tenant Settings and Policies.
- Integrar Audit.
```

---

### 36.8. Fase 8 — API administrativa

```text id="awb-phase-8"
- Implementar executions API.
- Implementar dead letters API.
- Implementar exports API.
- Implementar filtros y paginación.
```

---

### 36.9. Fase 9 — Seguridad, observabilidad y OpenAPI

```text id="awb-phase-9"
- Implementar guards.
- Implementar sensitive permissions.
- Implementar log sanitizer.
- Implementar metrics.
- Implementar OpenAPI.
- Implementar security tests.
```

---

### 36.10. Fase 10 — Hardening

```text id="awb-phase-10"
- Ejecutar tests de concurrencia.
- Ejecutar tests de idempotencia.
- Ejecutar tests de performance.
- Ejecutar smoke tests.
- Ajustar CI gates.
```

---

## 37. Riesgos técnicos y mitigaciones

| Riesgo                                     |      Nivel | Mitigación                                                  |
| ------------------------------------------ | ---------: | ----------------------------------------------------------- |
| Workflow duplica una acción                |       Alto | idempotencyKey, jobId determinístico, unique constraints    |
| Workflow cross-tenant                      |    Crítico | tenantId obligatorio, repositories tenant-scoped, tests 404 |
| Action catalog inseguro                    |       Alto | allowlist, review platform, no destructive by default       |
| Payload ejecutable                         |    Crítico | validators, denylist, no eval, no Function                  |
| Raw SQL en condición                       |    Crítico | conditionConfig declarativo, rawSql forbidden               |
| Retry infinito                             |       Alto | maxRetries global y por step                                |
| Dead letter contiene payload sensible      |       Alto | sanitización obligatoria                                    |
| Scheduler ejecuta varias veces una ventana |       Alto | scheduledWindowKey unique                                   |
| Worker ejecuta action prohibida            |    Crítico | catalog validation antes de enqueue y antes de execute      |
| Notificaciones masivas generan spam        | Medio/Alto | rate limits, quiet hours, workflow limits                   |
| n8n recibe datos reales sensibles          |       Alto | fuera de alcance MVP, ADR obligatorio                       |
| Public webhook accidental                  |    Crítico | feature flag false + boot validation                        |
| Acción financiera indebida                 |    Crítico | no payment execution, boundary tests                        |
| Cache/locks mezclan tenants                |       Alto | keys tenant-scoped, tests de aislamiento                    |

---

## 38. Decisiones técnicas MVP

```text id="awb-technical-decisions"
1. Usar monolito modular.
2. Usar PostgreSQL + Prisma para persistencia.
3. Usar BullMQ + Redis para colas.
4. Usar catálogo cerrado de triggers.
5. Usar catálogo cerrado de actions.
6. Usar workflow versions inmutables al activarse.
7. Usar idempotencyKey obligatorio.
8. Usar scheduledWindowKey para workflows programados.
9. Usar sourceEventId para event-driven workflows.
10. Usar manualRunId para ejecuciones manuales.
11. Usar retries finitos.
12. Usar dead letter básico.
13. Usar Secure Document Storage para exports.
14. Usar Audit para toda operación crítica.
15. No permitir scripts.
16. No permitir raw SQL.
17. No permitir secrets.
18. No permitir endpoints públicos.
19. No permitir WordPress público.
20. No permitir pagos/contabilidad/conciliación directa.
21. No permitir control de hardware.
22. No permitir IA externa con datos reales.
```

---

## 39. Definition of Done técnico

```text id="awb-plan-dod"
[ ] Módulo NestJS creado.
[ ] Configuración creada.
[ ] Feature flags implementadas.
[ ] Boot validation implementada.
[ ] Enums y errores definidos.
[ ] Value objects implementados.
[ ] Domain entities implementadas.
[ ] Domain policies implementadas.
[ ] Validators implementados.
[ ] Sanitizers implementados.
[ ] Prisma schema implementado.
[ ] Migración implementada.
[ ] Repositories implementados.
[ ] DTOs implementados.
[ ] Guards implementados.
[ ] Platform Trigger Definitions API implementada.
[ ] Platform Action Definitions API implementada.
[ ] Tenant Workflows API implementada.
[ ] Workflow Versions API implementada.
[ ] Workflow Activations implementadas.
[ ] Workflow Executions API implementada.
[ ] Dead Letters API implementada.
[ ] Exports API implementada.
[ ] Internal event publisher port implementado.
[ ] BullMQ queues implementadas.
[ ] Workers implementados.
[ ] Scheduler implementado.
[ ] Idempotency implementada.
[ ] Retry policy implementada.
[ ] Dead letter implementado.
[ ] Action executor implementado.
[ ] Condition evaluator implementado.
[ ] Integración Notifications implementada.
[ ] Integración Reports implementada.
[ ] Integración SDS implementada.
[ ] Integración Settings/Policies implementada.
[ ] Audit implementado.
[ ] Observability implementada.
[ ] OpenAPI implementado.
[ ] Seeds implementados.
[ ] Tests unitarios pasan.
[ ] Tests integración pasan.
[ ] Tests API pasan.
[ ] Tests security pasan.
[ ] Tests multitenancy pasan.
[ ] Tests idempotency pasan.
[ ] Tests queue pasan.
[ ] Tests retry/dead letter pasan.
[ ] Tests OpenAPI pasan.
[ ] Tests performance básicos pasan.
[ ] Tests concurrency críticos pasan.
[ ] Smoke tests pasan.
[ ] CI completo pasa.
```

---

## 40. No aceptación técnica

No se acepta la implementación si:

```text id="awb-plan-no-acceptance"
- permite workflows cross-tenant;
- permite executions cross-tenant;
- permite steps cross-tenant;
- permite logs cross-tenant;
- permite dead letters cross-tenant;
- permite exports cross-tenant;
- acepta tenantId desde cliente;
- acepta actor fields desde cliente;
- acepta versionNumber desde cliente;
- acepta versionLabel desde cliente;
- acepta status directo fuera de transición;
- acepta storageKey;
- devuelve storageKey;
- devuelve signedUrl persistente;
- almacena secretos;
- almacena tokens;
- almacena passwords;
- almacena apiKeys;
- almacena privateKeys;
- almacena clientSecrets;
- almacena databaseUrl;
- almacena raw SQL;
- almacena scripts;
- almacena JavaScript configurable;
- almacena functionBody;
- almacena executableCode;
- usa eval;
- usa Function constructor;
- permite action fuera de catálogo;
- permite trigger fuera de catálogo;
- permite webhook público inseguro;
- permite acceso desde WordPress público;
- crea endpoints públicos;
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
- usa n8n productivo con datos sensibles sin ADR y controles;
- permite retries infinitos;
- omite idempotencyKey;
- duplica ejecución de mismo evento;
- omite auditoría de ejecución crítica;
- logs contienen payload sensible.
```

---

## 41. Plan de Pull Requests sugerido

### PR-026-01 — Module skeleton, config, flags and enums

```text id="awb-pr-01"
[ ] Module foundation.
[ ] Configuración.
[ ] Feature flags.
[ ] Boot validation.
[ ] Enums.
[ ] Errores.
```

Acceptance:

```text id="awb-pr-01-ac"
[ ] Módulo compila.
[ ] Flags inseguros fallan boot.
[ ] No hay endpoints públicos.
```

---

### PR-026-02 — Value objects, validators, entities and policies

```text id="awb-pr-02"
[ ] Value objects.
[ ] Trigger/action validators.
[ ] Condition validator.
[ ] Action graph validator.
[ ] Sanitizers.
[ ] Domain entities.
[ ] Domain policies.
```

Acceptance:

```text id="awb-pr-02-ac"
[ ] No secrets tests pasan.
[ ] No executable payload tests pasan.
[ ] No raw SQL tests pasan.
```

---

### PR-026-03 — Prisma schema, migration and repositories

```text id="awb-pr-03"
[ ] Prisma schema.
[ ] Migration.
[ ] Indexes.
[ ] Constraints.
[ ] Repository ports.
[ ] Prisma repositories.
```

Acceptance:

```text id="awb-pr-03-ac"
[ ] Migración limpia.
[ ] Tablas tenant-scoped tienen tenant_id.
[ ] Repositories filtran tenantId.
```

---

### PR-026-04 — Platform catalog API

```text id="awb-pr-04"
[ ] Trigger Definitions API.
[ ] Action Definitions API.
[ ] Catalog validation.
[ ] Platform guards.
[ ] Catalog seeds.
```

Acceptance:

```text id="awb-pr-04-ac"
[ ] Catálogo no acepta secrets/scripts/rawSql.
[ ] Actions prohibidas no se habilitan.
```

---

### PR-026-05 — Tenant workflows and versions API

```text id="awb-pr-05"
[ ] Tenant Workflow API.
[ ] Workflow Versions API.
[ ] Review/approval/rejection.
[ ] Activation/deactivation.
```

Acceptance:

```text id="awb-pr-05-ac"
[ ] Version lifecycle funciona.
[ ] Active no editable.
[ ] Activation auditada.
```

---

### PR-026-06 — Queue, scheduler and idempotency

```text id="awb-pr-06"
[ ] BullMQ queues.
[ ] Redis adapter.
[ ] Scheduler.
[ ] Event dispatcher.
[ ] Idempotency.
[ ] Locks.
```

Acceptance:

```text id="awb-pr-06-ac"
[ ] Ejecuciones duplicadas se bloquean.
[ ] ScheduledWindowKey funciona.
[ ] sourceEventId funciona.
```

---

### PR-026-07 — Execution engine, steps, retry and dead letter

```text id="awb-pr-07"
[ ] WorkflowExecutionService.
[ ] StepExecutionService.
[ ] ConditionEvaluator.
[ ] ActionExecutor.
[ ] RetryPolicy.
[ ] DeadLetter.
```

Acceptance:

```text id="awb-pr-07-ac"
[ ] Steps se registran.
[ ] Retries finitos.
[ ] Dead letter al agotar retries.
```

---

### PR-026-08 — Allowed integrations

```text id="awb-pr-08"
[ ] Notifications adapter.
[ ] Reports adapter.
[ ] SDS adapter.
[ ] Settings/Policies adapter.
[ ] Audit adapter.
```

Acceptance:

```text id="awb-pr-08-ac"
[ ] Actions invocan puertos.
[ ] No escritura directa en tablas externas.
[ ] No storageKey.
```

---

### PR-026-09 — Executions, dead letters and exports API

```text id="awb-pr-09"
[ ] Executions API.
[ ] Dead Letters API.
[ ] Exports API.
[ ] Filtros.
[ ] Paginación.
```

Acceptance:

```text id="awb-pr-09-ac"
[ ] APIs tenant-scoped.
[ ] Exports vía SDS.
[ ] No payload raw sensible.
```

---

### PR-026-10 — Audit, observability, OpenAPI and hardening

```text id="awb-pr-10"
[ ] Audit completo.
[ ] Logs sanitizados.
[ ] Métricas.
[ ] OpenAPI.
[ ] Security tests.
[ ] Performance/concurrency.
[ ] Smoke tests.
```

Acceptance:

```text id="awb-pr-10-ac"
[ ] CI completo pasa.
[ ] OpenAPI no documenta campos prohibidos.
[ ] Security gates pasan.
```

---

## 42. Resultado esperado

Al implementar este plan, `026-automation-workflows-basic` quedará preparado como módulo transversal de automatizaciones básicas internas, con catálogo cerrado, versionamiento, activaciones, ejecución por colas, idempotencia, retries, dead letter, auditoría, observabilidad, exportaciones y límites estrictos de seguridad.

Resultado esperado:

```text id="awb-plan-expected-result"
module structure definida
technical boundaries definidos
dependencies definidas
trigger catalog planificado
action catalog planificado
tenant workflows planificados
workflow versions planificadas
workflow activations planificadas
event workflows planificados
scheduled workflows planificados
manual workflows planificados
condition evaluator definido
action graph definido
queue strategy definida
worker strategy definida
scheduler strategy definida
idempotency strategy definida
retry strategy definida
dead letter strategy definida
API strategy definida
DTO strategy definida
guards definidos
permissions definidos
integration ports definidos
SDS export definido
audit definido
observability definida
OpenAPI strategy definida
feature flags definidos
seeds definidos
testing strategy definida
performance strategy definida
concurrency strategy definida
implementation phases definidas
PR plan definido
no public endpoints
no WordPress access
no secrets
no executable workflow payload
no raw SQL
no public webhooks
no payment execution
no accounting execution
no bank reconciliation confirmation
no hardware control
no external AI with real data
```

---

## 43. Expediente actualizado

```text id="awb-plan-expediente"
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
│   │       └── plan.md
```
