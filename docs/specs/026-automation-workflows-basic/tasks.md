# Tasks — 026 Automation Workflows Basic

## 1. Información del documento

| Campo           | Valor                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------ |
| Proyecto        | RESIDENT Core                                                                              |
| Spec ID         | 026                                                                                        |
| Módulo          | Automation Workflows Basic                                                                 |
| Documento       | Tasks                                                                                      |
| Ruta            | `docs/specs/026-automation-workflows-basic/tasks.md`                                       |
| Versión         | 0.1                                                                                        |
| Estado          | needs-review                                                                               |
| Fecha           | 2026-07-31                                                                                 |
| Documento base  | `docs/specs/026-automation-workflows-basic/spec.md`                                        |
| Plan técnico    | `docs/specs/026-automation-workflows-basic/plan.md`                                        |
| Modelo de datos | `docs/specs/026-automation-workflows-basic/data-model.md`                                  |
| Contrato API    | `docs/specs/026-automation-workflows-basic/api-contract.md`                                |
| Plan de pruebas | `docs/specs/026-automation-workflows-basic/test-plan.md`                                   |
| Stack objetivo  | NestJS / TypeScript / PostgreSQL / Prisma / OpenAPI / Keycloak / BullMQ / Redis            |
| Naturaleza      | Tenant-scoped / Event-driven / Workflow-governed / Queue-backed / Audit-heavy / Non-public |

---

## 2. Propósito

Este documento define el backlog técnico ejecutable para implementar el módulo `026-automation-workflows-basic`.

El objetivo es transformar la especificación funcional, el plan técnico, el modelo de datos, el contrato API y el plan de pruebas en tareas concretas de implementación, agrupadas por épicas y con criterios de aceptación verificables.

Regla central de implementación:

```text id="awb-tasks-rule"
Automation Workflows Basic debe implementarse como un módulo transversal, tenant-scoped, event-driven, queue-backed, audit-heavy, idempotente y no público, capaz de administrar catálogos de triggers/actions, workflows tenant-scoped, versiones, activaciones, ejecuciones, steps, retries, dead letters, logs sanitizados y exportaciones vía Secure Document Storage, sin almacenar secretos, sin aceptar scripts, sin aceptar raw SQL, sin aceptar código ejecutable, sin webhooks públicos inseguros, sin acceso desde WordPress público, sin devolver storageKey, sin ejecutar pagos, sin crear asientos contables, sin confirmar conciliaciones bancarias, sin modificar directamente datos transaccionales de módulos consumidores, sin controlar hardware y sin enviar datos reales a IA externa.
```

---

## 3. Convenciones de estado

```text id="awb-task-status"
[ ] Pendiente
[x] Completado
[-] No aplica
[~] En progreso
[!] Bloqueado
```

---

## 4. Dependencias previas

Antes de iniciar la implementación debe existir:

```text id="awb-task-dependencies"
[ ] docs/specs/026-automation-workflows-basic/spec.md aprobado.
[ ] docs/specs/026-automation-workflows-basic/plan.md aprobado.
[ ] docs/specs/026-automation-workflows-basic/data-model.md aprobado.
[ ] docs/specs/026-automation-workflows-basic/api-contract.md aprobado.
[ ] docs/specs/026-automation-workflows-basic/test-plan.md aprobado.
[ ] Módulo 001-tenants disponible o mockeable.
[ ] Módulo 002-users-roles disponible o mockeable.
[ ] Módulo 007-audit disponible o mockeable.
[ ] Módulo 008-basic-reports disponible o mockeable.
[ ] Módulo 012-communications-notifications disponible o mockeable.
[ ] Módulo 016-secure-document-storage disponible o mockeable.
[ ] Módulo 025-tenant-settings-policies disponible o mockeable.
[ ] PostgreSQL disponible.
[ ] Prisma configurado.
[ ] Redis disponible.
[ ] BullMQ disponible.
[ ] Keycloak/OIDC o auth mock disponible.
[ ] OpenAPI pipeline disponible.
[ ] CI ejecutando unit, integration, API, security, OpenAPI y smoke tests.
```

---

# 5. EPIC-026-01 — Module foundation

## Objetivo

Crear la estructura base del módulo `automation-workflows-basic`.

## Tasks

```text id="awb-task-epic-01"
[ ] Crear directorio apps/api/src/modules/automation-workflows-basic/.
[ ] Crear automation-workflows-basic.module.ts.
[ ] Registrar AutomationWorkflowsBasicModule en el módulo raíz correspondiente.
[ ] Crear automation-workflows-basic.config.ts.
[ ] Crear automation-workflows-basic.constants.ts.
[ ] Crear estructura controllers/.
[ ] Crear estructura application/services/.
[ ] Crear estructura application/use-cases/.
[ ] Crear estructura application/ports/.
[ ] Crear estructura domain/entities/.
[ ] Crear estructura domain/value-objects/.
[ ] Crear estructura domain/events/.
[ ] Crear estructura domain/policies/.
[ ] Crear estructura domain/errors/.
[ ] Crear estructura infrastructure/persistence/.
[ ] Crear estructura infrastructure/queue/.
[ ] Crear estructura infrastructure/locks/.
[ ] Crear estructura infrastructure/validation/.
[ ] Crear estructura infrastructure/tenants/.
[ ] Crear estructura infrastructure/users/.
[ ] Crear estructura infrastructure/settings-policies/.
[ ] Crear estructura infrastructure/notifications/.
[ ] Crear estructura infrastructure/reports/.
[ ] Crear estructura infrastructure/documents/.
[ ] Crear estructura infrastructure/audit/.
[ ] Crear estructura infrastructure/observability/.
[ ] Crear estructura dto/.
[ ] Crear estructura guards/.
[ ] Crear estructura mappers/.
[ ] Crear estructura schemas/.
[ ] Crear estructura seeds/.
[ ] Crear estructura workers/.
[ ] Crear estructura tests/.
```

## Acceptance criteria

```text id="awb-task-epic-01-ac"
[ ] El módulo compila.
[ ] El módulo está registrado.
[ ] El módulo no expone endpoints públicos.
[ ] El módulo no contiene adaptadores de pagos.
[ ] El módulo no contiene adaptadores de ledger.
[ ] El módulo no contiene adaptadores de conciliación bancaria.
[ ] El módulo no contiene adaptadores de hardware.
[ ] El módulo no contiene adaptadores de IA externa.
```

---

# 6. EPIC-026-02 — Configuration and feature flags

## Objetivo

Definir configuración, límites y flags de seguridad del módulo.

## Tasks

```text id="awb-task-epic-02"
[ ] Crear AUTOMATION_WORKFLOWS_ENABLED=true.
[ ] Crear AUTOMATION_WORKFLOWS_QUEUE_ENABLED=true.
[ ] Crear AUTOMATION_WORKFLOWS_SCHEDULER_ENABLED=true.
[ ] Crear AUTOMATION_WORKFLOWS_EXPORT_ENABLED=true.
[ ] Crear AUTOMATION_WORKFLOWS_PUBLIC_ENDPOINTS_ENABLED=false.
[ ] Crear AUTOMATION_WORKFLOWS_PUBLIC_WEBHOOKS_ENABLED=false.
[ ] Crear AUTOMATION_WORKFLOWS_WORDPRESS_ACCESS_ENABLED=false.
[ ] Crear AUTOMATION_WORKFLOWS_EXECUTABLE_PAYLOADS_ENABLED=false.
[ ] Crear AUTOMATION_WORKFLOWS_RAW_SQL_ENABLED=false.
[ ] Crear AUTOMATION_WORKFLOWS_SECRET_STORAGE_ENABLED=false.
[ ] Crear AUTOMATION_WORKFLOWS_EXTERNAL_AI_ENABLED=false.
[ ] Crear AUTOMATION_WORKFLOWS_PAYMENT_EXECUTION_ENABLED=false.
[ ] Crear AUTOMATION_WORKFLOWS_ACCOUNTING_EXECUTION_ENABLED=false.
[ ] Crear AUTOMATION_WORKFLOWS_BANK_RECONCILIATION_CONFIRM_ENABLED=false.
[ ] Crear AUTOMATION_WORKFLOWS_HARDWARE_CONTROL_ENABLED=false.
[ ] Crear AUTOMATION_WORKFLOWS_MAX_RETRIES=3.
[ ] Crear AUTOMATION_WORKFLOWS_MIN_SCHEDULE_INTERVAL_MINUTES=60.
[ ] Crear AUTOMATION_WORKFLOWS_MAX_STEPS_PER_WORKFLOW=10.
[ ] Crear AUTOMATION_WORKFLOWS_MAX_EXECUTIONS_PER_HOUR_PER_TENANT=100.
[ ] Crear AUTOMATION_WORKFLOWS_DEFAULT_PAGE_SIZE=25.
[ ] Crear AUTOMATION_WORKFLOWS_MAX_PAGE_SIZE=100.
[ ] Implementar boot validation.
[ ] Implementar tests de configuración.
```

## Acceptance criteria

```text id="awb-task-epic-02-ac"
[ ] Boot falla si AUTOMATION_WORKFLOWS_PUBLIC_ENDPOINTS_ENABLED=true.
[ ] Boot falla si AUTOMATION_WORKFLOWS_PUBLIC_WEBHOOKS_ENABLED=true.
[ ] Boot falla si AUTOMATION_WORKFLOWS_WORDPRESS_ACCESS_ENABLED=true.
[ ] Boot falla si AUTOMATION_WORKFLOWS_EXECUTABLE_PAYLOADS_ENABLED=true.
[ ] Boot falla si AUTOMATION_WORKFLOWS_RAW_SQL_ENABLED=true.
[ ] Boot falla si AUTOMATION_WORKFLOWS_SECRET_STORAGE_ENABLED=true.
[ ] Boot falla si AUTOMATION_WORKFLOWS_EXTERNAL_AI_ENABLED=true.
[ ] Boot falla si AUTOMATION_WORKFLOWS_PAYMENT_EXECUTION_ENABLED=true.
[ ] Boot falla si AUTOMATION_WORKFLOWS_ACCOUNTING_EXECUTION_ENABLED=true.
[ ] Boot falla si AUTOMATION_WORKFLOWS_BANK_RECONCILIATION_CONFIRM_ENABLED=true.
[ ] Boot falla si AUTOMATION_WORKFLOWS_HARDWARE_CONTROL_ENABLED=true.
```

---

# 7. EPIC-026-03 — Enums and domain errors

## Objetivo

Crear enums y catálogo de errores del módulo.

## Tasks

```text id="awb-task-epic-03"
[ ] Crear AutomationCategory.
[ ] Crear WorkflowTriggerType.
[ ] Crear WorkflowActionType.
[ ] Crear AutomationSensitivity.
[ ] Crear AutomationDefinitionStatus.
[ ] Crear TenantWorkflowDefinitionStatus.
[ ] Crear TenantWorkflowVersionStatus.
[ ] Crear TenantWorkflowActivationType.
[ ] Crear TenantWorkflowActivationStatus.
[ ] Crear WorkflowExecutionStatus.
[ ] Crear WorkflowStepExecutionStatus.
[ ] Crear WorkflowExecutionLogLevel.
[ ] Crear WorkflowDeadLetterStatus.
[ ] Crear WorkflowExportType.
[ ] Crear WorkflowExportFormat.
[ ] Crear WorkflowExportStatus.
[ ] Crear catálogo de errores AUTOMATION_TRIGGER_DEFINITION_*.
[ ] Crear catálogo de errores AUTOMATION_ACTION_DEFINITION_*.
[ ] Crear catálogo de errores AUTOMATION_WORKFLOW_*.
[ ] Crear catálogo de errores AUTOMATION_WORKFLOW_VERSION_*.
[ ] Crear catálogo de errores AUTOMATION_EXECUTION_*.
[ ] Crear catálogo de errores AUTOMATION_DEAD_LETTER_*.
[ ] Crear catálogo de errores AUTOMATION_EXPORT_*.
[ ] Crear catálogo de errores AUTOMATION_SECURITY_*.
[ ] Mapear errores a HTTP status.
[ ] Crear tests de errores.
```

## Acceptance criteria

```text id="awb-task-epic-03-ac"
[ ] Enums coinciden con api-contract.md.
[ ] Cross-tenant se mapea a 404.
[ ] Estado inválido se mapea a 409.
[ ] Campo prohibido se mapea a 422.
[ ] Falta de permiso se mapea a 403.
[ ] No autenticado se mapea a 401.
```

---

# 8. EPIC-026-04 — Value objects

## Objetivo

Implementar objetos de valor del dominio.

## Tasks

```text id="awb-task-epic-04"
[ ] Crear WorkflowCode.
[ ] Crear WorkflowName.
[ ] Crear TriggerKey.
[ ] Crear ActionKey.
[ ] Crear WorkflowVersionNumber.
[ ] Crear WorkflowVersionLabel.
[ ] Crear WorkflowTriggerConfig.
[ ] Crear WorkflowConditionConfig.
[ ] Crear WorkflowActionGraph.
[ ] Crear WorkflowIdempotencyKey.
[ ] Crear SourceEventId.
[ ] Crear ScheduledWindowKey.
[ ] Crear ManualRunId.
[ ] Crear RetryPolicy.
[ ] Crear FailureReason.
[ ] Crear SanitizedWorkflowPayload.
[ ] Crear EffectiveWindow.
[ ] Crear ActivationReason.
[ ] Crear ApprovalReason.
[ ] Crear RejectionReason.
[ ] Crear ArchiveReason.
```

## Tests

```text id="awb-task-epic-04-tests"
[ ] WorkflowCode rechaza caracteres peligrosos.
[ ] TriggerKey usa formato category.name.
[ ] ActionKey usa formato category.name.
[ ] WorkflowVersionNumber se genera server-side.
[ ] WorkflowVersionLabel se genera server-side.
[ ] EffectiveWindow valida fechas.
[ ] IdempotencyKey no contiene datos sensibles.
[ ] ScheduledWindowKey respeta timezone.
[ ] RetryPolicy rechaza retries infinitos.
[ ] SanitizedWorkflowPayload rechaza secrets.
```

---

# 9. EPIC-026-05 — Validators and sanitizers

## Objetivo

Implementar validadores de schemas, conditions, action graph y sanitización de payloads.

## Tasks

```text id="awb-task-epic-05"
[ ] Crear TriggerConfigValidator.
[ ] Crear ActionConfigValidator.
[ ] Crear ConditionConfigValidator.
[ ] Crear ActionGraphValidator.
[ ] Crear RetryPolicyValidator.
[ ] Crear WorkflowPayloadSanitizer.
[ ] Crear WorkflowErrorSanitizer.
[ ] Crear WorkflowExportSanitizer.
[ ] Crear WorkflowLogSanitizer.
[ ] Crear ForbiddenKeysValidator recursivo.
[ ] Validar schema de trigger definitions.
[ ] Validar schema de action definitions.
[ ] Validar triggerConfig contra trigger schema.
[ ] Validar actionConfig contra action schema.
[ ] Validar conditionConfig con operadores allowlisted.
[ ] Validar actionGraph lineal MVP.
[ ] Validar max steps por workflow.
[ ] Validar max retries por workflow.
[ ] Validar timeoutSeconds por step.
[ ] Rechazar additionalProperties cuando schema lo indique.
[ ] Rechazar secrets.
[ ] Rechazar rawSql.
[ ] Rechazar scripts.
[ ] Rechazar executableCode.
[ ] Rechazar eval.
[ ] Rechazar Function.
[ ] Rechazar storageKey.
[ ] Rechazar signedUrl persistente.
[ ] Rechazar publicWebhookUrl.
[ ] Rechazar externalAiEnabled.
[ ] Rechazar externalAiRealDataAllowed.
[ ] Limitar profundidad JSON.
[ ] Limitar tamaño de payload.
[ ] Crear tests de validators.
[ ] Crear tests de sanitizers.
```

## Acceptance criteria

```text id="awb-task-epic-05-ac"
[ ] Ningún triggerConfig acepta secretos.
[ ] Ningún actionConfig acepta scripts.
[ ] Ningún conditionConfig acepta rawSql.
[ ] Ningún actionGraph acepta actions fuera de catálogo.
[ ] Ningún payload acepta storageKey.
[ ] Ningún payload acepta externalAiRealDataAllowed.
```

---

# 10. EPIC-026-06 — Domain entities

## Objetivo

Implementar entidades de dominio.

## Tasks

```text id="awb-task-epic-06"
[ ] Crear WorkflowTriggerDefinition entity.
[ ] Crear WorkflowActionDefinition entity.
[ ] Crear TenantWorkflowDefinition entity.
[ ] Crear TenantWorkflowVersion entity.
[ ] Crear TenantWorkflowActivation entity.
[ ] Crear WorkflowExecution entity.
[ ] Crear WorkflowStepExecution entity.
[ ] Crear WorkflowExecutionLog entity.
[ ] Crear WorkflowDeadLetter entity.
[ ] Crear WorkflowExport entity.
```

## Tests

```text id="awb-task-epic-06-tests"
[ ] WorkflowTriggerDefinition lifecycle.
[ ] WorkflowActionDefinition lifecycle.
[ ] TenantWorkflowDefinition lifecycle.
[ ] TenantWorkflowVersion lifecycle.
[ ] TenantWorkflowActivation lifecycle.
[ ] WorkflowExecution lifecycle.
[ ] WorkflowStepExecution lifecycle.
[ ] WorkflowExecutionLog immutable behavior.
[ ] WorkflowDeadLetter lifecycle.
[ ] WorkflowExport lifecycle.
```

## Acceptance criteria

```text id="awb-task-epic-06-ac"
[ ] Version active no se edita destructivamente.
[ ] Workflow archived no ejecuta.
[ ] Execution requiere idempotencyKey.
[ ] Step requiere action catalogada.
[ ] Dead letter conserva error sanitizado.
[ ] Export completed requiere secureDocumentId.
```

---

# 11. EPIC-026-07 — State machines

## Objetivo

Implementar transiciones válidas de estados.

## Tasks

```text id="awb-task-epic-07"
[ ] Crear TenantWorkflowDefinitionStateMachine.
[ ] Crear TenantWorkflowVersionStateMachine.
[ ] Crear TenantWorkflowActivationStateMachine.
[ ] Crear WorkflowExecutionStateMachine.
[ ] Crear WorkflowStepExecutionStateMachine.
[ ] Crear WorkflowDeadLetterStateMachine.
[ ] Crear WorkflowExportStateMachine.
```

## Required transitions

```text id="awb-task-state-machine-required"
[ ] WorkflowDefinition: draft -> active.
[ ] WorkflowDefinition: active -> inactive.
[ ] WorkflowDefinition: active -> archived.
[ ] WorkflowDefinition: inactive -> active.
[ ] WorkflowDefinition: archived no vuelve a active.

[ ] WorkflowVersion: draft -> reviewReady.
[ ] WorkflowVersion: reviewReady -> approved.
[ ] WorkflowVersion: reviewReady -> rejected.
[ ] WorkflowVersion: approved -> scheduled.
[ ] WorkflowVersion: approved -> active.
[ ] WorkflowVersion: scheduled -> active.
[ ] WorkflowVersion: active -> superseded.
[ ] WorkflowVersion: active -> deactivated.
[ ] WorkflowVersion: rejected -> archived.
[ ] WorkflowVersion: archived no vuelve a active.

[ ] Execution: queued -> running.
[ ] Execution: running -> succeeded.
[ ] Execution: running -> partiallySucceeded.
[ ] Execution: running -> failed.
[ ] Execution: failed -> retrying.
[ ] Execution: retrying -> queued.
[ ] Execution: failed -> deadLettered.
[ ] Execution: queued/running -> cancelled.

[ ] DeadLetter: open -> underReview.
[ ] DeadLetter: open -> resolved.
[ ] DeadLetter: open -> ignored.
[ ] DeadLetter: underReview -> resolved.
[ ] DeadLetter: underReview -> ignored.
[ ] DeadLetter: resolved/ignored -> archived.
```

---

# 12. EPIC-026-08 — Domain policies

## Objetivo

Implementar políticas de dominio y límites de seguridad.

## Tasks

```text id="awb-task-epic-08"
[ ] Crear WorkflowTenantIsolationPolicy.
[ ] Crear WorkflowCatalogAllowlistPolicy.
[ ] Crear WorkflowTriggerPolicy.
[ ] Crear WorkflowActionPolicy.
[ ] Crear WorkflowVersioningPolicy.
[ ] Crear WorkflowActivationPolicy.
[ ] Crear WorkflowConditionPolicy.
[ ] Crear WorkflowIdempotencyPolicy.
[ ] Crear WorkflowRetryPolicy.
[ ] Crear WorkflowDeadLetterPolicy.
[ ] Crear NoPublicWebhookPolicy.
[ ] Crear NoWordPressAutomationAccessPolicy.
[ ] Crear NoSecretsInWorkflowPolicy.
[ ] Crear NoExecutableWorkflowPayloadPolicy.
[ ] Crear NoRawSqlWorkflowPolicy.
[ ] Crear NoDestructiveActionPolicy.
[ ] Crear NoFinancialExecutionPolicy.
[ ] Crear NoHardwareControlPolicy.
[ ] Crear NoExternalAiRealDataPolicy.
[ ] Crear WorkflowAuditPolicy.
[ ] Crear WorkflowPayloadSanitizationPolicy.
```

## Acceptance criteria

```text id="awb-task-epic-08-ac"
[ ] Policies bloquean cross-tenant.
[ ] Policies bloquean actions fuera de catálogo.
[ ] Policies bloquean triggers fuera de catálogo.
[ ] Policies bloquean secrets.
[ ] Policies bloquean scripts.
[ ] Policies bloquean rawSql.
[ ] Policies bloquean public webhooks.
[ ] Policies bloquean WordPress público.
[ ] Policies bloquean pagos automáticos.
[ ] Policies bloquean ledger directo.
[ ] Policies bloquean conciliación automática.
[ ] Policies bloquean hardware.
[ ] Policies bloquean IA externa con datos reales.
```

---

# 13. EPIC-026-09 — Prisma schema and migration

## Objetivo

Implementar persistencia en PostgreSQL mediante Prisma.

## Tasks

```text id="awb-task-epic-09"
[ ] Agregar Prisma enums del módulo.
[ ] Crear model WorkflowTriggerDefinition.
[ ] Crear model WorkflowActionDefinition.
[ ] Crear model TenantWorkflowDefinition.
[ ] Crear model TenantWorkflowVersion.
[ ] Crear model TenantWorkflowActivation.
[ ] Crear model WorkflowExecution.
[ ] Crear model WorkflowStepExecution.
[ ] Crear model WorkflowExecutionLog.
[ ] Crear model WorkflowDeadLetter.
[ ] Crear model WorkflowExport.
[ ] Agregar relaciones en Tenant.
[ ] Crear migración 026_create_automation_workflows_basic.
[ ] Crear índices de workflow_trigger_definitions.
[ ] Crear índices de workflow_action_definitions.
[ ] Crear índices de tenant_workflow_definitions.
[ ] Crear índices de tenant_workflow_versions.
[ ] Crear índices de tenant_workflow_activations.
[ ] Crear índices de workflow_executions.
[ ] Crear índices de workflow_step_executions.
[ ] Crear índices de workflow_execution_logs.
[ ] Crear índices de workflow_dead_letters.
[ ] Crear índices de workflow_exports.
[ ] Crear unique constraint tenant_id + workflow_code.
[ ] Crear unique constraint tenant_id + workflow_definition_id + version_number.
[ ] Crear unique constraint tenant_id + workflow_definition_id + idempotency_key.
[ ] Crear partial unique indexes SQL.
[ ] Crear checks básicos SQL donde aplique.
[ ] Ejecutar prisma format.
[ ] Ejecutar migración local.
[ ] Ejecutar migración test.
```

## Acceptance criteria

```text id="awb-task-epic-09-ac"
[ ] Todas las tablas tenant-scoped tienen tenant_id.
[ ] Catálogo global no contiene datos reales de tenant.
[ ] No existen columnas secret/token/password/api_key.
[ ] No existe storage_key.
[ ] No existe signed_url persistente.
[ ] No existen columnas raw_sql/script/executable_code.
[ ] No existen columnas payment_id/journal_entry_id/bank_transaction_id.
[ ] Migración corre limpia.
```

---

# 14. EPIC-026-10 — Repository ports and Prisma repositories

## Objetivo

Implementar repositorios tenant-scoped y puertos de persistencia.

## Tasks

```text id="awb-task-epic-10"
[ ] Crear WorkflowTriggerDefinitionRepositoryPort.
[ ] Crear PrismaWorkflowTriggerDefinitionRepository.
[ ] Crear WorkflowActionDefinitionRepositoryPort.
[ ] Crear PrismaWorkflowActionDefinitionRepository.
[ ] Crear TenantWorkflowDefinitionRepositoryPort.
[ ] Crear PrismaTenantWorkflowDefinitionRepository.
[ ] Crear TenantWorkflowVersionRepositoryPort.
[ ] Crear PrismaTenantWorkflowVersionRepository.
[ ] Crear TenantWorkflowActivationRepositoryPort.
[ ] Crear PrismaTenantWorkflowActivationRepository.
[ ] Crear WorkflowExecutionRepositoryPort.
[ ] Crear PrismaWorkflowExecutionRepository.
[ ] Crear WorkflowStepExecutionRepositoryPort.
[ ] Crear PrismaWorkflowStepExecutionRepository.
[ ] Crear WorkflowExecutionLogRepositoryPort.
[ ] Crear PrismaWorkflowExecutionLogRepository.
[ ] Crear WorkflowDeadLetterRepositoryPort.
[ ] Crear PrismaWorkflowDeadLetterRepository.
[ ] Crear WorkflowExportRepositoryPort.
[ ] Crear PrismaWorkflowExportRepository.
```

## Required query pattern

```text id="awb-task-repo-query-pattern"
[ ] Toda consulta tenant-scoped usa id + tenantId.
[ ] Toda lista tenant-scoped filtra tenantId.
[ ] Todo update tenant-scoped filtra id + tenantId.
[ ] Todo archive tenant-scoped filtra id + tenantId.
[ ] Toda búsqueda de execution usa tenantId.
[ ] Toda búsqueda de step usa tenantId.
[ ] Toda búsqueda de dead letter usa tenantId.
[ ] Toda búsqueda de export usa tenantId.
[ ] Cross-tenant retorna null.
```

## Tests

```text id="awb-task-repo-tests"
[ ] tenantA no lee workflow tenantB.
[ ] tenantA no actualiza workflow tenantB.
[ ] tenantA no lee version tenantB.
[ ] tenantA no activa version tenantB.
[ ] tenantA no lee execution tenantB.
[ ] tenantA no lee step tenantB.
[ ] tenantA no lee logs tenantB.
[ ] tenantA no resuelve dead letter tenantB.
[ ] tenantA no lee export tenantB.
[ ] idempotencyKey único funciona.
[ ] versionNumber único funciona.
```

---

# 15. EPIC-026-11 — DTOs and validation

## Objetivo

Implementar DTOs externos seguros.

## Tasks

```text id="awb-task-epic-11"
[ ] Crear CreateWorkflowTriggerDefinitionDto.
[ ] Crear UpdateWorkflowTriggerDefinitionDto.
[ ] Crear ArchiveWorkflowTriggerDefinitionDto.
[ ] Crear CreateWorkflowActionDefinitionDto.
[ ] Crear UpdateWorkflowActionDefinitionDto.
[ ] Crear ArchiveWorkflowActionDefinitionDto.
[ ] Crear CreateTenantWorkflowDto.
[ ] Crear UpdateTenantWorkflowDto.
[ ] Crear ArchiveTenantWorkflowDto.
[ ] Crear CreateTenantWorkflowVersionDto.
[ ] Crear UpdateTenantWorkflowVersionDto.
[ ] Crear SubmitWorkflowVersionReviewDto.
[ ] Crear ApproveWorkflowVersionDto.
[ ] Crear RejectWorkflowVersionDto.
[ ] Crear ActivateWorkflowVersionDto.
[ ] Crear DeactivateWorkflowVersionDto.
[ ] Crear ArchiveWorkflowVersionDto.
[ ] Crear ManualRunWorkflowDto.
[ ] Crear CancelWorkflowExecutionDto.
[ ] Crear RetryWorkflowExecutionDto.
[ ] Crear ResolveWorkflowDeadLetterDto.
[ ] Crear IgnoreWorkflowDeadLetterDto.
[ ] Crear CreateWorkflowExportDto.
[ ] Crear pagination DTOs.
[ ] Crear filter DTOs.
[ ] Aplicar ValidationPipe whitelist.
[ ] Aplicar forbidNonWhitelisted.
```

## Forbidden fields tests

```text id="awb-task-dto-forbidden-tests"
[ ] DTOs rechazan tenantId.
[ ] DTOs rechazan actor fields.
[ ] DTOs rechazan status directo.
[ ] DTOs rechazan versionNumber.
[ ] DTOs rechazan versionLabel.
[ ] DTOs rechazan executionId arbitrario para crear ejecución.
[ ] DTOs rechazan stepStatus arbitrario.
[ ] DTOs rechazan storageKey.
[ ] DTOs rechazan signedUrl.
[ ] DTOs rechazan secret.
[ ] DTOs rechazan token.
[ ] DTOs rechazan password.
[ ] DTOs rechazan apiKey.
[ ] DTOs rechazan privateKey.
[ ] DTOs rechazan clientSecret.
[ ] DTOs rechazan webhookSecret.
[ ] DTOs rechazan databaseUrl.
[ ] DTOs rechazan rawSql.
[ ] DTOs rechazan script.
[ ] DTOs rechazan executableCode.
[ ] DTOs rechazan paymentId.
[ ] DTOs rechazan journalEntryId.
[ ] DTOs rechazan bankTransactionId.
[ ] DTOs rechazan reconciliationMatchId.
[ ] DTOs rechazan gateOpenCommand.
[ ] DTOs rechazan hardwareDeviceCommand.
[ ] DTOs rechazan biometricTemplate.
[ ] DTOs rechazan faceEmbedding.
[ ] DTOs rechazan externalAiEnabled.
[ ] DTOs rechazan externalAiRealDataAllowed.
```

---

# 16. EPIC-026-12 — Guards and authorization

## Objetivo

Implementar autenticación, autorización, permisos sensibles y guards por recurso.

## Tasks

```text id="awb-task-epic-12"
[ ] Aplicar AuthGuard a todas las rutas.
[ ] Aplicar TenantGuard a rutas tenant.
[ ] Aplicar PermissionGuard a rutas tenant.
[ ] Crear PlatformPermissionGuard.
[ ] Crear SensitivePermissionGuard.
[ ] Crear WorkflowTenantGuard.
[ ] Crear WorkflowVersionTenantGuard.
[ ] Crear WorkflowExecutionTenantGuard.
[ ] Crear WorkflowDeadLetterTenantGuard.
[ ] Crear WorkflowExportTenantGuard.
[ ] Crear InternalAutomationEventGuard.
[ ] Mapear permisos de Platform API.
[ ] Mapear permisos de Tenant Workflows API.
[ ] Mapear permisos de Tenant Workflow Versions API.
[ ] Mapear permisos de Executions API.
[ ] Mapear permisos de Dead Letters API.
[ ] Mapear permisos de Exports API.
[ ] Validar permisos sensibles por sensitivity.
[ ] Validar PlatformAdmin sin acceso automático a workflows tenant.
[ ] Validar Resident sin acceso a Tenant Admin API.
```

## Acceptance criteria

```text id="awb-task-epic-12-ac"
[ ] Sin token retorna 401.
[ ] Sin permiso retorna 403.
[ ] Cross-tenant retorna 404.
[ ] Workflow sensible requiere permiso sensible.
[ ] Manual run sensible requiere permiso sensible.
[ ] Retry sensible requiere permiso sensible.
[ ] Export sensible requiere permiso sensible.
```

---

# 17. EPIC-026-13 — Platform Trigger Definitions API

## Objetivo

Implementar administración del catálogo global de triggers.

## Tasks

```text id="awb-task-epic-13"
[ ] Crear PlatformAutomationTriggerDefinitionsController.
[ ] Crear TriggerDefinitionService.
[ ] Crear CreateTriggerDefinitionUseCase.
[ ] Crear UpdateTriggerDefinitionUseCase.
[ ] Crear ArchiveTriggerDefinitionUseCase.
[ ] Implementar GET /api/v1/platform/automation-trigger-definitions.
[ ] Implementar POST /api/v1/platform/automation-trigger-definitions.
[ ] Implementar GET /api/v1/platform/automation-trigger-definitions/{definitionId}.
[ ] Implementar PATCH /api/v1/platform/automation-trigger-definitions/{definitionId}.
[ ] Implementar POST /api/v1/platform/automation-trigger-definitions/{definitionId}/archive.
[ ] Validar triggerKey único.
[ ] Validar formato triggerKey.
[ ] Validar sourceModule.
[ ] Validar triggerType.
[ ] Validar eventName si triggerType=event.
[ ] Validar schema.
[ ] Rechazar secrets.
[ ] Rechazar scripts.
[ ] Rechazar rawSql.
[ ] Rechazar public webhooks.
[ ] Resolver createdBy server-side.
[ ] Resolver updatedBy server-side.
[ ] Resolver archivedBy server-side.
[ ] Auditar automationTriggerDefinition.created.
[ ] Auditar automationTriggerDefinition.updated.
[ ] Auditar automationTriggerDefinition.archived.
[ ] Crear tests API.
```

## Acceptance criteria

```text id="awb-task-epic-13-ac"
[ ] Solo PlatformAdmin autorizado administra trigger definitions.
[ ] Trigger definitions no aceptan secrets.
[ ] Trigger definitions no aceptan scripts.
[ ] Trigger definitions no habilitan public webhooks.
[ ] Definition archivada no se usa para nuevas versions.
```

---

# 18. EPIC-026-14 — Platform Action Definitions API

## Objetivo

Implementar administración del catálogo global de actions.

## Tasks

```text id="awb-task-epic-14"
[ ] Crear PlatformAutomationActionDefinitionsController.
[ ] Crear ActionDefinitionService.
[ ] Crear CreateActionDefinitionUseCase.
[ ] Crear UpdateActionDefinitionUseCase.
[ ] Crear ArchiveActionDefinitionUseCase.
[ ] Implementar GET /api/v1/platform/automation-action-definitions.
[ ] Implementar POST /api/v1/platform/automation-action-definitions.
[ ] Implementar GET /api/v1/platform/automation-action-definitions/{definitionId}.
[ ] Implementar PATCH /api/v1/platform/automation-action-definitions/{definitionId}.
[ ] Implementar POST /api/v1/platform/automation-action-definitions/{definitionId}/archive.
[ ] Validar actionKey único.
[ ] Validar formato actionKey.
[ ] Validar targetModule.
[ ] Validar actionType.
[ ] Validar schema.
[ ] Validar isDestructive.
[ ] Validar isFinancial.
[ ] Validar isExternal.
[ ] Rechazar actions prohibidas.
[ ] Rechazar secrets.
[ ] Rechazar scripts.
[ ] Rechazar rawSql.
[ ] Rechazar executableCode.
[ ] Resolver createdBy server-side.
[ ] Resolver updatedBy server-side.
[ ] Resolver archivedBy server-side.
[ ] Auditar automationActionDefinition.created.
[ ] Auditar automationActionDefinition.updated.
[ ] Auditar automationActionDefinition.archived.
[ ] Crear tests API.
```

## Acceptance criteria

```text id="awb-task-epic-14-ac"
[ ] Solo PlatformAdmin autorizado administra action definitions.
[ ] Actions fuera de catálogo no se usan.
[ ] Actions destructivas prohibidas quedan bloqueadas.
[ ] Actions financieras destructivas quedan bloqueadas.
[ ] Actions externas no confiables quedan bloqueadas.
```

---

# 19. EPIC-026-15 — Tenant Workflow Definitions API

## Objetivo

Implementar administración de workflows tenant-scoped.

## Tasks

```text id="awb-task-epic-15"
[ ] Crear TenantAutomationWorkflowsController.
[ ] Crear WorkflowDefinitionService.
[ ] Crear CreateTenantWorkflowUseCase.
[ ] Crear UpdateTenantWorkflowUseCase.
[ ] Crear ArchiveTenantWorkflowUseCase.
[ ] Implementar GET /api/v1/tenant/automation-workflows.
[ ] Implementar POST /api/v1/tenant/automation-workflows.
[ ] Implementar GET /api/v1/tenant/automation-workflows/{workflowId}.
[ ] Implementar PATCH /api/v1/tenant/automation-workflows/{workflowId}.
[ ] Implementar POST /api/v1/tenant/automation-workflows/{workflowId}/archive.
[ ] Validar workflowCode único por tenant.
[ ] Validar ownerUserProfileId tenant-scoped si se envía.
[ ] Resolver tenantId server-side.
[ ] Resolver createdBy server-side.
[ ] Resolver updatedBy server-side.
[ ] Resolver archivedBy server-side.
[ ] Impedir triggerConfig en workflow definition.
[ ] Impedir actionGraph en workflow definition.
[ ] Impedir status directo.
[ ] Auditar tenantWorkflow.created.
[ ] Auditar tenantWorkflow.updated.
[ ] Auditar tenantWorkflow.archived.
[ ] Crear tests API.
[ ] Crear tests multitenancy.
```

## Acceptance criteria

```text id="awb-task-epic-15-ac"
[ ] Workflow se crea como draft.
[ ] Workflow no ejecuta sin active version.
[ ] Workflow archived no ejecuta.
[ ] tenantA no accede a workflows tenantB.
```

---

# 20. EPIC-026-16 — Tenant Workflow Versions API

## Objetivo

Implementar versionamiento de workflows.

## Tasks

```text id="awb-task-epic-16"
[ ] Crear TenantAutomationWorkflowVersionsController.
[ ] Crear WorkflowVersionService.
[ ] Crear CreateWorkflowVersionUseCase.
[ ] Crear UpdateWorkflowVersionUseCase.
[ ] Crear SubmitWorkflowVersionReviewUseCase.
[ ] Crear ApproveWorkflowVersionUseCase.
[ ] Crear RejectWorkflowVersionUseCase.
[ ] Crear ArchiveWorkflowVersionUseCase.
[ ] Implementar GET /api/v1/tenant/automation-workflows/{workflowId}/versions.
[ ] Implementar POST /api/v1/tenant/automation-workflows/{workflowId}/versions.
[ ] Implementar GET /api/v1/tenant/automation-workflows/{workflowId}/versions/{versionId}.
[ ] Implementar PATCH /api/v1/tenant/automation-workflows/{workflowId}/versions/{versionId}.
[ ] Implementar POST /submit-review.
[ ] Implementar POST /approve.
[ ] Implementar POST /reject.
[ ] Implementar POST /archive.
[ ] Generar versionNumber server-side.
[ ] Generar versionLabel server-side.
[ ] Validar triggerKey.
[ ] Validar triggerConfig.
[ ] Validar conditionConfig.
[ ] Validar actionGraph.
[ ] Validar retryPolicy.
[ ] Validar max steps.
[ ] Validar actions sensibles.
[ ] Validar workflow tenant-scoped.
[ ] Validar version tenant-scoped.
[ ] Impedir edición destructiva de active/scheduled/superseded/deactivated/archived.
[ ] Rechazar secrets.
[ ] Rechazar scripts.
[ ] Rechazar rawSql.
[ ] Rechazar executableCode.
[ ] Rechazar action fuera de catálogo.
[ ] Rechazar trigger fuera de catálogo.
[ ] Auditar tenantWorkflowVersion.created.
[ ] Auditar tenantWorkflowVersion.updated.
[ ] Auditar tenantWorkflowVersion.submittedForReview.
[ ] Auditar tenantWorkflowVersion.approved.
[ ] Auditar tenantWorkflowVersion.rejected.
[ ] Auditar tenantWorkflowVersion.archived.
[ ] Crear tests API.
```

## Acceptance criteria

```text id="awb-task-epic-16-ac"
[ ] Nueva version inicia draft.
[ ] Draft puede editarse.
[ ] Active no se edita destructivamente.
[ ] Rejected no puede activarse.
[ ] Archived no puede activarse.
[ ] versionNumber no se acepta desde cliente.
```

---

# 21. EPIC-026-17 — Workflow activation and deactivation

## Objetivo

Implementar activación, programación, sustitución y desactivación de versiones.

## Tasks

```text id="awb-task-epic-17"
[ ] Crear WorkflowActivationService.
[ ] Crear ActivateWorkflowVersionUseCase.
[ ] Crear DeactivateWorkflowVersionUseCase.
[ ] Crear ScheduledActivationProcessor.
[ ] Implementar POST /api/v1/tenant/automation-workflows/{workflowId}/versions/{versionId}/activate.
[ ] Implementar POST /api/v1/tenant/automation-workflows/{workflowId}/versions/{versionId}/deactivate.
[ ] Validar status approved para activar.
[ ] Validar effectiveFrom.
[ ] Validar no overlap.
[ ] Validar sensibilidad.
[ ] Crear TenantWorkflowActivation.
[ ] Marcar versión active si effectiveFrom <= now.
[ ] Marcar versión scheduled si effectiveFrom > now.
[ ] Ajustar effectiveUntil de versión anterior.
[ ] Marcar versión anterior superseded si aplica.
[ ] Marcar workflowDefinition active si aplica.
[ ] Desactivar active version.
[ ] Programar activación futura.
[ ] Procesar scheduled activation.
[ ] Usar lock tenant + workflow.
[ ] Invalidar lookup/cache de active workflow si aplica.
[ ] Auditar tenantWorkflowVersion.activated.
[ ] Auditar tenantWorkflowVersion.deactivated.
[ ] Auditar tenantWorkflowVersion.superseded.
[ ] Crear tests de concurrencia.
```

## Acceptance criteria

```text id="awb-task-epic-17-ac"
[ ] Solo una versión queda efectiva por workflow.
[ ] Scheduled no ejecuta antes de effectiveFrom.
[ ] Deactivation no borra historial.
[ ] Activation cross-tenant retorna 404.
[ ] Activation overlap retorna 409.
```

---

# 22. EPIC-026-18 — BullMQ queues and Redis locks

## Objetivo

Implementar infraestructura de colas, jobs y locks.

## Tasks

```text id="awb-task-epic-18"
[ ] Crear WorkflowQueuePort.
[ ] Crear BullMqWorkflowQueueAdapter.
[ ] Crear WorkflowLockPort.
[ ] Crear RedisWorkflowLockAdapter.
[ ] Crear queue automation-events.
[ ] Crear queue automation-executions.
[ ] Crear queue automation-steps.
[ ] Crear queue automation-scheduled.
[ ] Crear queue automation-retries.
[ ] Crear queue automation-dead-letter.
[ ] Configurar jobId determinístico por idempotencyKey.
[ ] Configurar retry/backoff controlado.
[ ] Configurar concurrency por worker.
[ ] Configurar rate limit por tenant.
[ ] Configurar payload sanitizer previo a enqueue.
[ ] Configurar dead-letter fallback.
[ ] Configurar logs de queue sin payload sensible.
[ ] Crear tests de queue adapter.
[ ] Crear tests de Redis locks.
```

## Acceptance criteria

```text id="awb-task-epic-18-ac"
[ ] Jobs duplicados por idempotencyKey no se duplican.
[ ] Queue payload no contiene secrets.
[ ] Queue payload no contiene storageKey.
[ ] Locks no mezclan tenants.
[ ] Falla de worker no tumba proceso completo.
```

---

# 23. EPIC-026-19 — Internal event dispatcher

## Objetivo

Implementar publicación y despacho de eventos internos hacia workflows activos.

## Tasks

```text id="awb-task-epic-19"
[ ] Crear AutomationEventPublisherPort.
[ ] Crear WorkflowEventDispatcherService.
[ ] Crear EnqueueEventWorkflowExecutionUseCase.
[ ] Crear AutomationEventWorker.
[ ] Definir AutomationEventEnvelope.
[ ] Validar eventName.
[ ] Validar tenantId.
[ ] Validar sourceModule.
[ ] Validar sourceEventId.
[ ] Validar occurredAt.
[ ] Validar payload sanitizado.
[ ] Rechazar secrets.
[ ] Rechazar storageKey.
[ ] Rechazar raw files.
[ ] Buscar workflows activos por trigger.
[ ] Evaluar conditionConfig.
[ ] Crear idempotencyKey por sourceEventId.
[ ] Encolar execution si condition=true.
[ ] Marcar skipped si condition=false.
[ ] Auditar tenantWorkflowExecution.queued.
[ ] Crear tests de dispatcher.
```

## Acceptance criteria

```text id="awb-task-epic-19-ac"
[ ] Evento sin tenantId se rechaza.
[ ] Evento sin sourceEventId se rechaza.
[ ] EventName no catalogado se rechaza.
[ ] Evento duplicado no crea ejecución duplicada.
[ ] Workflow inactive/archived no se ejecuta.
```

---

# 24. EPIC-026-20 — Scheduler

## Objetivo

Implementar ejecución programada segura y tenant-scoped.

## Tasks

```text id="awb-task-epic-20"
[ ] Crear WorkflowSchedulerService.
[ ] Crear AutomationSchedulerWorker.
[ ] Crear EnqueueScheduledWorkflowExecutionUseCase.
[ ] Implementar schedule.daily.
[ ] Implementar schedule.weekly.
[ ] Implementar schedule.monthly.
[ ] Implementar schedule.cronBasic validado.
[ ] Resolver timezone desde 025 o 001.
[ ] Aplicar default America/Guayaquil.
[ ] Validar frecuencia mínima 60 minutos.
[ ] Generar scheduledWindowKey.
[ ] Crear idempotencyKey por scheduledWindowKey.
[ ] Evitar doble ejecución de ventana.
[ ] Respetar workflow active.
[ ] Respetar version active.
[ ] Respetar quiet hours para notifications.
[ ] Encolar execution.
[ ] Auditar tenantWorkflowExecution.queued.
[ ] Crear tests de scheduler.
```

## Acceptance criteria

```text id="awb-task-epic-20-ac"
[ ] ScheduledWindowKey es único por workflow.
[ ] Misma ventana no se ejecuta dos veces.
[ ] Timezone del tenant se respeta.
[ ] Frecuencia menor a 60 minutos se rechaza.
[ ] Quiet hours se respetan salvo criticalAlert permitido.
```

---

# 25. EPIC-026-21 — Manual run

## Objetivo

Implementar ejecución manual autorizada.

## Tasks

```text id="awb-task-epic-21"
[ ] Crear RunManualWorkflowUseCase.
[ ] Implementar POST /api/v1/tenant/automation-workflows/{workflowId}/run.
[ ] Validar tenantWorkflows.runManual.
[ ] Validar tenantWorkflowExecutions.runManual.
[ ] Validar permiso sensible si aplica.
[ ] Validar workflow tenant-scoped.
[ ] Resolver active version si versionId no se envía.
[ ] Validar versionId tenant-scoped si se envía.
[ ] Validar manual trigger o manual run enabled.
[ ] Requerir reason si workflow sensible.
[ ] Sanitizar input.
[ ] Rechazar secrets.
[ ] Rechazar scripts.
[ ] Rechazar rawSql.
[ ] Generar manualRunId server-side.
[ ] Generar idempotencyKey server-side.
[ ] Encolar execution.
[ ] Auditar tenantWorkflowExecution.queued.
[ ] Crear tests API.
```

## Acceptance criteria

```text id="awb-task-epic-21-ac"
[ ] Manual run sin permiso retorna 403.
[ ] Manual run sensible sin reason retorna 422.
[ ] Manual run genera manualRunId.
[ ] Manual run genera idempotencyKey.
[ ] Manual run cross-tenant retorna 404.
```

---

# 26. EPIC-026-22 — Execution engine

## Objetivo

Implementar motor de ejecución básico de workflows.

## Tasks

```text id="awb-task-epic-22"
[ ] Crear WorkflowExecutionService.
[ ] Crear WorkflowStepExecutionService.
[ ] Crear WorkflowConditionEvaluatorService.
[ ] Crear WorkflowActionExecutorService.
[ ] Crear ExecuteWorkflowUseCase.
[ ] Crear ExecuteWorkflowStepUseCase.
[ ] Crear AutomationExecutionWorker.
[ ] Crear AutomationStepWorker.
[ ] Implementar queued -> running.
[ ] Evaluar conditionConfig.
[ ] Marcar skipped si condition=false.
[ ] Ejecutar steps por stepOrder.
[ ] Validar actionDefinition active antes de ejecutar.
[ ] Validar actionConfig antes de ejecutar.
[ ] Ejecutar action mediante puerto del módulo dueño.
[ ] Registrar step pending/running/succeeded/failed/skipped.
[ ] Registrar outputSanitized.
[ ] Registrar failureReason sanitizado.
[ ] Aplicar onFailure failWorkflow.
[ ] Aplicar onFailure continueWorkflow.
[ ] Aplicar onFailure skipStep.
[ ] Marcar execution succeeded.
[ ] Marcar execution partiallySucceeded.
[ ] Marcar execution failed.
[ ] Auditar tenantWorkflowExecution.started.
[ ] Auditar tenantWorkflowExecution.succeeded.
[ ] Auditar tenantWorkflowExecution.partiallySucceeded.
[ ] Auditar tenantWorkflowExecution.failed.
[ ] Auditar tenantWorkflowStep.succeeded.
[ ] Auditar tenantWorkflowStep.failed.
[ ] Crear tests de execution engine.
```

## Acceptance criteria

```text id="awb-task-epic-22-ac"
[ ] Steps se ejecutan en orden.
[ ] Action fuera de catálogo se bloquea.
[ ] Action archived se bloquea.
[ ] Payload ejecutable se bloquea.
[ ] Output no contiene storageKey.
[ ] Fallo de step no tumba worker completo.
```

---

# 27. EPIC-026-23 — Action executor and allowed integrations

## Objetivo

Implementar ejecución de actions permitidas mediante puertos internos.

## Tasks

```text id="awb-task-epic-23"
[ ] Crear WorkflowActionTargetPort.
[ ] Crear AutomationNotificationsPort.
[ ] Crear AutomationReportsPort.
[ ] Crear AutomationDocumentStoragePort.
[ ] Crear AutomationOperationsPort.
[ ] Crear MaintenanceNotificationActionAdapter.
[ ] Crear AccessNotificationActionAdapter.
[ ] Crear InventoryNotificationActionAdapter.
[ ] Crear ReservationsNotificationActionAdapter.
[ ] Crear MeetingsNotificationActionAdapter.
[ ] Crear PaymentsNotificationActionAdapter.
[ ] Crear DuesNotificationActionAdapter.
[ ] Implementar notifications.sendToResident.
[ ] Implementar notifications.sendToUnit.
[ ] Implementar notifications.sendToRole.
[ ] Implementar notifications.sendToTenantAdmins.
[ ] Implementar notifications.sendCriticalAlert.
[ ] Implementar notifications.sendDigest.
[ ] Implementar reports.generateBasicReport.
[ ] Implementar reports.generateAndStoreExport.
[ ] Implementar reports.sendReportLinkToAdmins.
[ ] Implementar documents.createExportReference.
[ ] Implementar documents.notifyDocumentAvailable.
[ ] Implementar operations.createAdministrativeTask.
[ ] Implementar operations.createFollowUpReminder.
[ ] Implementar operations.markWorkflowNote.
[ ] Implementar operations.escalateToRole.
[ ] Implementar operations.createReviewRequest.
[ ] Implementar maintenance.notifyWorkOrderOverdue.
[ ] Implementar access.notifyOpenCheckInExceeded.
[ ] Implementar inventory.notifyLowStock.
[ ] Implementar reservations.notifyUpcomingReservation.
[ ] Implementar meetings.notifyUpcomingMeeting.
[ ] Implementar payments.notifyPaymentValidationResult.
[ ] Implementar dues.notifyChargeDueSoon.
[ ] Crear tests de adapters.
```

## Boundary tasks

```text id="awb-task-epic-23-boundary"
[ ] Bloquear payments.createPayment.
[ ] Bloquear payments.validatePaymentAutomatically.
[ ] Bloquear payments.reversePayment.
[ ] Bloquear supplierPayments.createPaymentOrder.
[ ] Bloquear accounting.createJournalEntry.
[ ] Bloquear bankReconciliation.confirmMatch.
[ ] Bloquear inventory.postStockAdjustmentAutomatically.
[ ] Bloquear access.openGate.
[ ] Bloquear access.controlHardware.
[ ] Bloquear external.sendRealDataToAI.
[ ] Bloquear external.callUntrustedWebhook.
[ ] Bloquear system.executeScript.
[ ] Bloquear system.executeSql.
[ ] Bloquear system.executeShellCommand.
```

## Acceptance criteria

```text id="awb-task-epic-23-ac"
[ ] Actions permitidas invocan puertos, no tablas externas.
[ ] No se ejecutan pagos.
[ ] No se crean asientos contables.
[ ] No se confirma conciliación.
[ ] No se controla hardware.
[ ] No se invoca IA externa con datos reales.
```

---

# 28. EPIC-026-24 — Retry and dead letter

## Objetivo

Implementar reintentos finitos y dead letter.

## Tasks

```text id="awb-task-epic-24"
[ ] Crear WorkflowRetryService.
[ ] Crear WorkflowDeadLetterService.
[ ] Crear RetryWorkflowExecutionUseCase.
[ ] Crear ResolveWorkflowDeadLetterUseCase.
[ ] Crear IgnoreWorkflowDeadLetterUseCase.
[ ] Crear AutomationRetryWorker.
[ ] Crear AutomationDeadLetterWorker.
[ ] Implementar retry policy fixed.
[ ] Implementar retry policy exponential.
[ ] Validar maxRetries global.
[ ] Validar maxRetries por step.
[ ] Implementar retry failedStepsOnly.
[ ] Implementar retry fullWorkflow.
[ ] Mantener lineage de retry.
[ ] Evitar duplicar steps succeeded.
[ ] Detectar error no recuperable.
[ ] Crear WorkflowDeadLetter al agotar retries.
[ ] Sanitizar lastError.
[ ] Implementar GET /api/v1/tenant/automation-dead-letters.
[ ] Implementar GET /api/v1/tenant/automation-dead-letters/{deadLetterId}.
[ ] Implementar POST /resolve.
[ ] Implementar POST /ignore.
[ ] Auditar tenantWorkflowExecution.retrying.
[ ] Auditar tenantWorkflowExecution.deadLettered.
[ ] Auditar tenantWorkflowDeadLetter.created.
[ ] Auditar tenantWorkflowDeadLetter.resolved.
[ ] Auditar tenantWorkflowDeadLetter.ignored.
[ ] Crear tests de retry.
[ ] Crear tests de dead letter.
```

## Acceptance criteria

```text id="awb-task-epic-24-ac"
[ ] No existen retries infinitos.
[ ] Dead letter se crea al agotar retries.
[ ] Dead letter no contiene stack trace productivo.
[ ] Resolve no reintenta automáticamente.
[ ] Ignore no borra execution.
```

---

# 29. EPIC-026-25 — Executions API

## Objetivo

Implementar consulta, cancelación y reintento de ejecuciones.

## Tasks

```text id="awb-task-epic-25"
[ ] Crear TenantAutomationExecutionsController.
[ ] Implementar GET /api/v1/tenant/automation-executions.
[ ] Implementar GET /api/v1/tenant/automation-executions/{executionId}.
[ ] Implementar POST /api/v1/tenant/automation-executions/{executionId}/cancel.
[ ] Implementar POST /api/v1/tenant/automation-executions/{executionId}/retry.
[ ] Implementar includeSteps.
[ ] Implementar includeLogs.
[ ] Requerir tenantWorkflowLogs.read para includeLogs.
[ ] Implementar filtros por workflowId.
[ ] Implementar filtros por workflowCode.
[ ] Implementar filtros por workflowVersionId.
[ ] Implementar filtros por triggerKey.
[ ] Implementar filtros por triggerType.
[ ] Implementar filtros por sourceModule.
[ ] Implementar filtros por status.
[ ] Implementar filtros por dateFrom/dateTo.
[ ] Aplicar pageSize máximo 100.
[ ] Sanitizar inputSanitized/outputSanitized.
[ ] Enmascarar idempotencyKey si se devuelve.
[ ] No devolver raw payload sensible.
[ ] No devolver storageKey.
[ ] Auditar cancelación.
[ ] Auditar retry.
[ ] Crear tests API.
```

## Acceptance criteria

```text id="awb-task-epic-25-ac"
[ ] Execution tenantB desde tenantA retorna 404.
[ ] includeLogs sin permiso retorna 403.
[ ] Cancel succeeded retorna 409.
[ ] Retry succeeded retorna 409.
[ ] Retry maxRetries excedido retorna 409.
```

---

# 30. EPIC-026-26 — Workflow execution logs

## Objetivo

Implementar logs funcionales sanitizados.

## Tasks

```text id="awb-task-epic-26"
[ ] Crear WorkflowExecutionLogService.
[ ] Crear WorkflowExecutionLogRepositoryPort.
[ ] Implementar create execution log.
[ ] Implementar create step log.
[ ] Implementar list logs by execution.
[ ] Sanitizar message.
[ ] Sanitizar metadata.
[ ] Rechazar secrets.
[ ] Rechazar tokens.
[ ] Rechazar raw payload.
[ ] Rechazar storageKey.
[ ] Rechazar signedUrl.
[ ] Rechazar raw stack trace productivo.
[ ] Impedir update ordinario.
[ ] Impedir physical delete ordinario.
[ ] Crear tests de logs.
```

## Acceptance criteria

```text id="awb-task-epic-26-ac"
[ ] Logs no reemplazan Audit.
[ ] Logs no contienen secrets.
[ ] Logs no contienen storageKey.
[ ] Logs no contienen authorization header.
[ ] Logs tenantB no son visibles para tenantA.
```

---

# 31. EPIC-026-27 — Workflow exports via Secure Document Storage

## Objetivo

Implementar exportaciones administrativas seguras.

## Tasks

```text id="awb-task-epic-27"
[ ] Crear TenantAutomationExportsController.
[ ] Crear WorkflowExportService.
[ ] Crear CreateWorkflowExportUseCase.
[ ] Crear AutomationDocumentStoragePort.
[ ] Crear SecureDocumentStorageAutomationAdapter.
[ ] Implementar GET /api/v1/tenant/automation-exports.
[ ] Implementar GET /api/v1/tenant/automation-exports/{exportId}.
[ ] Implementar POST /api/v1/tenant/automation-exports.
[ ] Implementar export workflows.
[ ] Implementar export workflowVersions.
[ ] Implementar export executions.
[ ] Implementar export failedExecutions.
[ ] Implementar export deadLetters.
[ ] Implementar export auditSnapshot.
[ ] Implementar export fullAutomationHistory.
[ ] Implementar formato json.
[ ] Implementar formato xlsx.
[ ] Dejar formato pdf como opcional si engine existe.
[ ] Validar includeSensitive.
[ ] Requerir permiso tenantWorkflowExports.exportSensitive si includeSensitive=true.
[ ] Requerir reason para auditSnapshot.
[ ] Requerir reason para fullAutomationHistory.
[ ] Sanitizar filters.
[ ] Sanitizar contenido exportado.
[ ] Excluir secrets.
[ ] Excluir scripts.
[ ] Excluir rawSql.
[ ] Excluir raw payload sensible.
[ ] Crear SecureDocument.
[ ] Guardar secureDocumentId.
[ ] No devolver storageKey.
[ ] No devolver signedUrl persistente.
[ ] Marcar export completed.
[ ] Marcar export failed con failureReason sanitizado.
[ ] Auditar tenantWorkflowExport.created.
[ ] Auditar tenantWorkflowExport.completed.
[ ] Auditar tenantWorkflowExport.failed.
[ ] Crear tests SDS.
[ ] Crear tests API.
```

## Acceptance criteria

```text id="awb-task-epic-27-ac"
[ ] Export usa SDS.
[ ] Export devuelve secureDocumentId.
[ ] Export no devuelve storageKey.
[ ] Export no contiene secrets.
[ ] Export tenantB no es visible para tenantA.
```

---

# 32. EPIC-026-28 — Internal integration ports

## Objetivo

Implementar puertos hacia dependencias internas.

## Tasks

```text id="awb-task-epic-28"
[ ] Crear AutomationTenantsPort.
[ ] Crear TenantsAutomationAdapter.
[ ] Implementar validateTenantIsActive.
[ ] Implementar getTenantTimezone.
[ ] Implementar getTenantOperationalSummary.
[ ] Crear AutomationUsersPort.
[ ] Crear UsersAutomationAdapter.
[ ] Implementar getActorProfile.
[ ] Implementar validateApprover.
[ ] Crear AutomationSettingsPoliciesPort.
[ ] Crear TenantSettingsPoliciesAutomationAdapter.
[ ] Implementar resolveAutomationPolicy.
[ ] Implementar resolveQuietHoursPolicy.
[ ] Implementar resolveRetryPolicy.
[ ] Implementar resolveWorkflowLimits.
[ ] Crear AutomationNotificationsPort.
[ ] Crear CommunicationsAutomationAdapter.
[ ] Crear AutomationReportsPort.
[ ] Crear BasicReportsAutomationAdapter.
[ ] Crear AutomationDocumentStoragePort.
[ ] Crear SecureDocumentStorageAutomationAdapter.
[ ] Crear AutomationAuditPort.
[ ] Crear AuditAutomationAdapter.
[ ] Crear tests de adapters.
```

## Acceptance criteria

```text id="awb-task-epic-28-ac"
[ ] Tenant suspended bloquea workflow execution.
[ ] Automation disabled bloquea execution.
[ ] Quiet hours se respetan.
[ ] Adapters no reciben secrets.
[ ] Adapters no devuelven storageKey.
```

---

# 33. EPIC-026-29 — Seeds

## Objetivo

Crear seed inicial de trigger/action definitions.

## Tasks

```text id="awb-task-epic-29"
[ ] Crear seed financial.chargeCreated.
[ ] Crear seed financial.chargeDueSoon.
[ ] Crear seed financial.chargeOverdue.
[ ] Crear seed payments.paymentSubmitted.
[ ] Crear seed payments.paymentValidated.
[ ] Crear seed payments.paymentRejected.
[ ] Crear seed accountStatements.statementGenerated.
[ ] Crear seed reservations.reservationCreated.
[ ] Crear seed reservations.reservationApproved.
[ ] Crear seed reservations.reservationCancelled.
[ ] Crear seed reservations.reservationStartingSoon.
[ ] Crear seed fines.fineCreated.
[ ] Crear seed fines.fineAppealSubmitted.
[ ] Crear seed fines.fineAppealResolved.
[ ] Crear seed meetings.meetingScheduled.
[ ] Crear seed meetings.meetingStartingSoon.
[ ] Crear seed meetings.attendanceClosed.
[ ] Crear seed voting.votingOpened.
[ ] Crear seed voting.votingClosed.
[ ] Crear seed certifiedMinutes.minutesPublished.
[ ] Crear seed communications.notificationFailed.
[ ] Crear seed communications.criticalNoticeUnread.
[ ] Crear seed communications.deliveryCompleted.
[ ] Crear seed documents.documentCreated.
[ ] Crear seed documents.documentPublished.
[ ] Crear seed documents.documentDownloadFailed.
[ ] Crear seed maintenance.requestCreated.
[ ] Crear seed maintenance.workOrderAssigned.
[ ] Crear seed maintenance.workOrderCompleted.
[ ] Crear seed maintenance.workOrderOverdue.
[ ] Crear seed inventory.lowStockDetected.
[ ] Crear seed inventory.stockAdjustmentApproved.
[ ] Crear seed inventory.consumptionPosted.
[ ] Crear seed access.visitorAuthorizationCreated.
[ ] Crear seed access.visitorCheckedIn.
[ ] Crear seed access.visitorCheckedOut.
[ ] Crear seed access.deniedAccessRecorded.
[ ] Crear seed access.openCheckInExceeded.
[ ] Crear seed access.incidentCreated.
[ ] Crear seed schedule.daily.
[ ] Crear seed schedule.weekly.
[ ] Crear seed schedule.monthly.
[ ] Crear seed schedule.cronBasic.
[ ] Crear seed manual.runWorkflow.
[ ] Crear seed manual.generateReport.
[ ] Crear seed manual.sendReminder.
[ ] Crear seed manual.reprocessFailedExecution.
[ ] Crear seed notifications.sendToResident.
[ ] Crear seed notifications.sendToUnit.
[ ] Crear seed notifications.sendToRole.
[ ] Crear seed notifications.sendToTenantAdmins.
[ ] Crear seed notifications.sendCriticalAlert.
[ ] Crear seed notifications.sendDigest.
[ ] Crear seed reports.generateBasicReport.
[ ] Crear seed reports.generateAndStoreExport.
[ ] Crear seed reports.sendReportLinkToAdmins.
[ ] Crear seed documents.createExportReference.
[ ] Crear seed documents.notifyDocumentAvailable.
[ ] Crear seed operations.createAdministrativeTask.
[ ] Crear seed operations.createFollowUpReminder.
[ ] Crear seed operations.markWorkflowNote.
[ ] Crear seed operations.escalateToRole.
[ ] Crear seed operations.createReviewRequest.
[ ] Crear seed maintenance.notifyWorkOrderOverdue.
[ ] Crear seed access.notifyOpenCheckInExceeded.
[ ] Crear seed inventory.notifyLowStock.
[ ] Crear seed reservations.notifyUpcomingReservation.
[ ] Crear seed meetings.notifyUpcomingMeeting.
[ ] Crear seed payments.notifyPaymentValidationResult.
[ ] Crear seed dues.notifyChargeDueSoon.
[ ] Validar idempotencia de seeds.
[ ] Validar que seeds no contienen secrets.
[ ] Validar que seeds no contienen scripts.
[ ] Validar que seeds no habilitan actions destructivas.
[ ] Validar que seeds no habilitan pagos.
[ ] Validar que seeds no habilitan ledger directo.
[ ] Validar que seeds no habilitan conciliación automática.
[ ] Validar que seeds no habilitan hardware.
[ ] Validar que seeds no habilitan IA externa.
```

## Acceptance criteria

```text id="awb-task-epic-29-ac"
[ ] Seeds son idempotentes.
[ ] Seeds son seguros por defecto.
[ ] Seeds no contienen datos reales.
[ ] Seeds no contienen secretos.
[ ] Seeds no habilitan actions prohibidas.
```

---

# 34. EPIC-026-30 — Audit implementation

## Objetivo

Registrar auditoría obligatoria.

## Tasks

```text id="awb-task-epic-30"
[ ] Crear WorkflowAuditService.
[ ] Integrar AutomationAuditPort.
[ ] Auditar automationTriggerDefinition.created.
[ ] Auditar automationTriggerDefinition.updated.
[ ] Auditar automationTriggerDefinition.archived.
[ ] Auditar automationActionDefinition.created.
[ ] Auditar automationActionDefinition.updated.
[ ] Auditar automationActionDefinition.archived.
[ ] Auditar tenantWorkflow.created.
[ ] Auditar tenantWorkflow.updated.
[ ] Auditar tenantWorkflow.archived.
[ ] Auditar tenantWorkflowVersion.created.
[ ] Auditar tenantWorkflowVersion.updated.
[ ] Auditar tenantWorkflowVersion.submittedForReview.
[ ] Auditar tenantWorkflowVersion.approved.
[ ] Auditar tenantWorkflowVersion.rejected.
[ ] Auditar tenantWorkflowVersion.activated.
[ ] Auditar tenantWorkflowVersion.deactivated.
[ ] Auditar tenantWorkflowVersion.superseded.
[ ] Auditar tenantWorkflowVersion.archived.
[ ] Auditar tenantWorkflowExecution.queued.
[ ] Auditar tenantWorkflowExecution.started.
[ ] Auditar tenantWorkflowExecution.succeeded.
[ ] Auditar tenantWorkflowExecution.partiallySucceeded.
[ ] Auditar tenantWorkflowExecution.failed.
[ ] Auditar tenantWorkflowExecution.cancelled.
[ ] Auditar tenantWorkflowExecution.retrying.
[ ] Auditar tenantWorkflowExecution.deadLettered.
[ ] Auditar tenantWorkflowStep.succeeded.
[ ] Auditar tenantWorkflowStep.failed.
[ ] Auditar tenantWorkflowDeadLetter.created.
[ ] Auditar tenantWorkflowDeadLetter.resolved.
[ ] Auditar tenantWorkflowDeadLetter.ignored.
[ ] Auditar tenantWorkflowExport.created.
[ ] Auditar tenantWorkflowExport.completed.
[ ] Auditar tenantWorkflowExport.failed.
[ ] Sanitizar audit metadata.
[ ] Excluir secrets.
[ ] Excluir storageKey.
[ ] Excluir rawSql.
[ ] Excluir scripts.
[ ] Excluir raw payload sensible.
[ ] Crear tests audit.
```

## Acceptance criteria

```text id="awb-task-epic-30-ac"
[ ] Operaciones críticas tienen audit.
[ ] Audit incluye tenantId cuando aplica.
[ ] Audit incluye actor cuando aplica.
[ ] Audit incluye traceId.
[ ] Audit no incluye secrets.
[ ] Audit no incluye storageKey.
```

---

# 35. EPIC-026-31 — Observability

## Objetivo

Implementar logs, métricas y trazabilidad segura.

## Tasks

```text id="awb-task-epic-31"
[ ] Crear WorkflowObservabilityService.
[ ] Loggear workflow.execution.queued.
[ ] Loggear workflow.execution.started.
[ ] Loggear workflow.execution.completed.
[ ] Loggear workflow.execution.failed.
[ ] Loggear workflow.execution.retrying.
[ ] Loggear workflow.execution.deadLettered.
[ ] Loggear workflow.step.succeeded.
[ ] Loggear workflow.step.failed.
[ ] Loggear workflow.activation.created.
[ ] Loggear workflow.version.approved.
[ ] Loggear workflow.export.completed.
[ ] Crear metric automation_workflows_created_total.
[ ] Crear metric automation_workflow_versions_created_total.
[ ] Crear metric automation_workflow_activations_total.
[ ] Crear metric automation_executions_queued_total.
[ ] Crear metric automation_executions_succeeded_total.
[ ] Crear metric automation_executions_failed_total.
[ ] Crear metric automation_executions_dead_lettered_total.
[ ] Crear metric automation_steps_succeeded_total.
[ ] Crear metric automation_steps_failed_total.
[ ] Crear metric automation_retries_total.
[ ] Crear metric automation_exports_total.
[ ] Crear metric automation_queue_depth.
[ ] Crear metric automation_execution_duration_ms.
[ ] Crear metric automation_step_duration_ms.
[ ] Bloquear labels prohibidos.
[ ] Sanitizar logs.
[ ] Crear tests de logs.
[ ] Crear tests de metrics.
```

## Acceptance criteria

```text id="awb-task-epic-31-ac"
[ ] Logs no contienen secrets.
[ ] Logs no contienen raw request body.
[ ] Logs no contienen storageKey.
[ ] Metrics no usan tenantId.
[ ] Metrics no usan userId.
[ ] Metrics no usan executionId.
[ ] Metrics no usan idempotencyKey.
```

---

# 36. EPIC-026-32 — OpenAPI

## Objetivo

Documentar contrato API y extensiones de seguridad.

## Tasks

```text id="awb-task-epic-32"
[ ] Agregar tag Platform Automation Trigger Definitions.
[ ] Agregar tag Platform Automation Action Definitions.
[ ] Agregar tag Tenant Automation Workflows.
[ ] Agregar tag Tenant Automation Workflow Versions.
[ ] Agregar tag Tenant Automation Executions.
[ ] Agregar tag Tenant Automation Dead Letters.
[ ] Agregar tag Tenant Automation Exports.
[ ] Documentar rutas /api/v1/platform/automation-trigger-definitions.
[ ] Documentar rutas /api/v1/platform/automation-action-definitions.
[ ] Documentar rutas /api/v1/tenant/automation-workflows.
[ ] Documentar rutas /api/v1/tenant/automation-workflows/{workflowId}/versions.
[ ] Documentar rutas /api/v1/tenant/automation-executions.
[ ] Documentar rutas /api/v1/tenant/automation-dead-letters.
[ ] Documentar rutas /api/v1/tenant/automation-exports.
[ ] Agregar x-auth-required=true.
[ ] Agregar x-automation-workflows-basic=true.
[ ] Agregar x-public-exposure=false.
[ ] Agregar x-wordpress-access=false.
[ ] Agregar x-secrets-storage=false.
[ ] Agregar x-executable-workflow-payload=false.
[ ] Agregar x-raw-sql-allowed=false.
[ ] Agregar x-public-webhooks=false.
[ ] Agregar x-payment-execution=false.
[ ] Agregar x-accounting-execution=false.
[ ] Agregar x-bank-reconciliation-confirmation=false.
[ ] Agregar x-hardware-control=false.
[ ] Agregar x-external-ai-real-data=false.
[ ] Agregar x-platform-scope=true en rutas platform.
[ ] Agregar x-tenant-scope=true en rutas tenant.
[ ] Agregar x-idempotency-required=true en rutas execution.
[ ] Agregar x-queue-backed=true en rutas execution.
[ ] Agregar x-audit-required=true en rutas execution.
[ ] Agregar x-secure-document-storage=true en export.
[ ] Agregar x-storage-key-exposed=false en export.
[ ] Crear OpenAPI contract tests.
```

## No documentar

```text id="awb-task-openapi-forbidden"
[ ] No documentar /api/v1/public/automation-workflows.
[ ] No documentar /api/v1/public/automation-executions.
[ ] No documentar /api/v1/public/automation-webhooks.
[ ] No documentar tenantId en DTOs externos.
[ ] No documentar actor fields.
[ ] No documentar versionNumber desde cliente.
[ ] No documentar versionLabel desde cliente.
[ ] No documentar storageKey.
[ ] No documentar signedUrl persistente.
[ ] No documentar secrets.
[ ] No documentar rawSql.
[ ] No documentar scripts.
[ ] No documentar executableCode.
[ ] No documentar externalAiEnabled.
```

---

# 37. EPIC-026-33 — Security hardening

## Objetivo

Ejecutar endurecimiento de seguridad antes del cierre del módulo.

## Tasks

```text id="awb-task-epic-33"
[ ] Ejecutar forbidden fields tests.
[ ] Ejecutar no secrets tests.
[ ] Ejecutar no executable payload tests.
[ ] Ejecutar no raw SQL tests.
[ ] Ejecutar no scripts tests.
[ ] Ejecutar multitenancy tests.
[ ] Ejecutar sensitive permission tests.
[ ] Ejecutar no public endpoints tests.
[ ] Ejecutar no public webhooks tests.
[ ] Ejecutar no WordPress tests.
[ ] Ejecutar no storageKey tests.
[ ] Ejecutar no payment execution tests.
[ ] Ejecutar no accounting execution tests.
[ ] Ejecutar no bank reconciliation confirmation tests.
[ ] Ejecutar no hardware control tests.
[ ] Ejecutar no external AI tests.
[ ] Verificar CORS sin wildcard.
[ ] Verificar headers de seguridad.
[ ] Verificar error sanitizer.
[ ] Verificar audit sanitizer.
[ ] Verificar log sanitizer.
[ ] Verificar export sanitizer.
[ ] Verificar OpenAPI sin campos prohibidos.
[ ] Verificar feature flags prohibidos false.
```

## Acceptance criteria

```text id="awb-task-epic-33-ac"
[ ] Security tests críticos pasan 100%.
[ ] No existen rutas públicas.
[ ] No existen public webhooks.
[ ] WordPress público no accede.
[ ] No se aceptan secrets.
[ ] No se aceptan scripts.
[ ] No se acepta rawSql.
[ ] No se expone storageKey.
[ ] No se ejecutan actions prohibidas.
```

---

# 38. EPIC-026-34 — Performance and concurrency

## Objetivo

Validar desempeño, colas, locks e idempotencia bajo carga básica.

## Tasks

```text id="awb-task-epic-34"
[ ] Preparar dataset global con 50 trigger definitions.
[ ] Preparar dataset global con 30 action definitions.
[ ] Preparar tenantA con 25 workflows.
[ ] Preparar tenantA con 75 versions.
[ ] Preparar tenantA con 25 active versions.
[ ] Preparar tenantA con 100 activations.
[ ] Preparar tenantA con 10,000 executions.
[ ] Preparar tenantA con 25,000 step executions.
[ ] Preparar tenantA con 50,000 execution logs.
[ ] Preparar tenantA con 500 dead letters.
[ ] Preparar tenantA con 100 exports.
[ ] Test enqueue execution p95 < 500 ms.
[ ] Test buscar workflows activos por trigger p95 < 500 ms.
[ ] Test listar workflows p95 < 800 ms.
[ ] Test listar workflow versions p95 < 800 ms.
[ ] Test listar executions p95 < 1200 ms.
[ ] Test listar dead letters p95 < 1200 ms.
[ ] Test procesar step simple p95 < 2000 ms.
[ ] Test export pequeño p95 < 3000 ms.
[ ] Test pageSize máximo 100.
[ ] Test sin N+1 evidente.
[ ] Test dos usuarios crean versionNumber simultáneo.
[ ] Test dos usuarios activan versiones simultáneas.
[ ] Test mismo evento llega dos veces.
[ ] Test scheduler ejecuta misma ventana dos veces.
[ ] Test retry automático y manual simultáneo.
[ ] Test cancelación mientras execution running.
[ ] Test dead letter resolve y retry simultáneo.
```

## Acceptance criteria

```text id="awb-task-epic-34-ac"
[ ] No se duplican versionNumbers.
[ ] No hay dos versiones activas efectivas.
[ ] No se duplica execution por sourceEventId.
[ ] No se duplica execution por scheduledWindowKey.
[ ] Retries no duplican steps exitosos.
[ ] Locks no mezclan tenants.
```

---

# 39. EPIC-026-35 — CI gates

## Objetivo

Configurar validaciones obligatorias del pipeline.

## Tasks

```text id="awb-task-epic-35"
[ ] Agregar unit tests al pipeline.
[ ] Agregar value object tests al pipeline.
[ ] Agregar trigger/action validator tests al pipeline.
[ ] Agregar condition evaluator tests al pipeline.
[ ] Agregar action graph validator tests al pipeline.
[ ] Agregar retry policy tests al pipeline.
[ ] Agregar idempotency tests al pipeline.
[ ] Agregar sanitizer tests al pipeline.
[ ] Agregar entity tests al pipeline.
[ ] Agregar state machine tests al pipeline.
[ ] Agregar domain policy tests al pipeline.
[ ] Agregar repository tests al pipeline.
[ ] Agregar queue adapter tests al pipeline.
[ ] Agregar Redis lock tests al pipeline.
[ ] Agregar scheduler tests al pipeline.
[ ] Agregar event dispatcher tests al pipeline.
[ ] Agregar execution engine tests al pipeline.
[ ] Agregar retry/dead letter tests al pipeline.
[ ] Agregar external adapter tests al pipeline.
[ ] Agregar Platform API tests al pipeline.
[ ] Agregar Tenant Workflow API tests al pipeline.
[ ] Agregar Tenant Workflow Version API tests al pipeline.
[ ] Agregar Execution API tests al pipeline.
[ ] Agregar Dead Letter API tests al pipeline.
[ ] Agregar Export API tests al pipeline.
[ ] Agregar authz tests al pipeline.
[ ] Agregar sensitive permission tests al pipeline.
[ ] Agregar multitenancy tests al pipeline.
[ ] Agregar no secrets tests al pipeline.
[ ] Agregar no executable payload tests al pipeline.
[ ] Agregar no raw SQL tests al pipeline.
[ ] Agregar no public tests al pipeline.
[ ] Agregar no public webhooks tests al pipeline.
[ ] Agregar no WordPress tests al pipeline.
[ ] Agregar no storageKey tests al pipeline.
[ ] Agregar no payment execution tests al pipeline.
[ ] Agregar no accounting execution tests al pipeline.
[ ] Agregar no bank reconciliation confirmation tests al pipeline.
[ ] Agregar no hardware control tests al pipeline.
[ ] Agregar no external AI tests al pipeline.
[ ] Agregar audit tests al pipeline.
[ ] Agregar observability tests al pipeline.
[ ] Agregar OpenAPI contract tests al pipeline.
[ ] Agregar performance baseline tests al pipeline.
[ ] Agregar concurrency critical tests al pipeline.
[ ] Agregar smoke tests al pipeline.
```

## Pipeline must fail if

```text id="awb-task-ci-fail"
[ ] Algún DTO acepta tenantId.
[ ] Algún DTO acepta actor fields.
[ ] Algún DTO acepta versionNumber desde cliente.
[ ] Algún DTO acepta status directo fuera de transición.
[ ] Algún DTO acepta storageKey.
[ ] Algún DTO acepta secret.
[ ] Algún DTO acepta rawSql.
[ ] Algún DTO acepta script.
[ ] Algún DTO acepta executableCode.
[ ] API permite workflows cross-tenant.
[ ] API permite executions cross-tenant.
[ ] API crea endpoint público.
[ ] API crea public webhook.
[ ] API permite WordPress público.
[ ] API expone storageKey.
[ ] Logs contienen secrets.
[ ] Audit contiene secrets.
[ ] Export contiene secrets.
[ ] ActionGraph permite action fuera de catálogo.
[ ] Workflow ejecuta Payment.
[ ] Workflow crea JournalEntry.
[ ] Workflow confirma Bank Reconciliation.
[ ] Workflow controla hardware.
[ ] Workflow llama IA externa con datos reales.
[ ] Workflow permite retries infinitos.
[ ] Workflow omite idempotencyKey.
[ ] Workflow duplica ejecución del mismo evento.
```

---

# 40. EPIC-026-36 — Smoke tests

## Objetivo

Validar flujos completos mínimos del módulo.

## Tasks

```text id="awb-task-epic-36"
[ ] Implementar smoke seed catalog.
[ ] Implementar smoke create workflow.
[ ] Implementar smoke create workflow version.
[ ] Implementar smoke submit review.
[ ] Implementar smoke approve workflow version.
[ ] Implementar smoke activate workflow version.
[ ] Implementar smoke event-driven execution.
[ ] Implementar smoke scheduled execution.
[ ] Implementar smoke manual run.
[ ] Implementar smoke retry and dead letter.
[ ] Implementar smoke export via SDS.
[ ] Implementar smoke audit.
[ ] Implementar smoke no storageKey.
[ ] Implementar smoke no secrets.
[ ] Agregar smoke tests al CI.
```

## Smoke base

```text id="awb-task-smoke-base"
[ ] PlatformAdmin crea triggerDefinition payments.paymentValidated.
[ ] PlatformAdmin crea actionDefinition notifications.sendToResident.
[ ] TenantAdminA crea workflow payment-validation-notification.
[ ] TenantAdminA crea version draft.
[ ] Sistema genera versionNumber.
[ ] TenantAdminA envía version a review.
[ ] BoardMemberA aprueba version.
[ ] TenantAdminA activa version.
[ ] Sistema crea TenantWorkflowActivation.
[ ] Sistema marca version active.
[ ] Payments mock publica payments.paymentValidated.
[ ] Dispatcher genera idempotencyKey.
[ ] Dispatcher encola execution.
[ ] Worker ejecuta notifications.sendToResident.
[ ] Step termina succeeded.
[ ] Execution termina succeeded.
[ ] Sistema audita ejecución.
[ ] TenantAdminA exporta executions.
[ ] Sistema crea SecureDocument.
[ ] Response devuelve secureDocumentId.
[ ] Response no contiene storageKey.
```

---

# 41. Plan de Pull Requests sugerido

## PR-026-01 — Module skeleton, config, flags and enums

Incluye:

```text id="awb-pr-01"
[ ] EPIC-026-01.
[ ] EPIC-026-02.
[ ] EPIC-026-03.
```

Acceptance:

```text id="awb-pr-01-ac"
[ ] Módulo compila.
[ ] Feature flags inseguros fallan boot.
[ ] Enums y errores definidos.
```

---

## PR-026-02 — Value objects, validators, entities and policies

Incluye:

```text id="awb-pr-02"
[ ] EPIC-026-04.
[ ] EPIC-026-05.
[ ] EPIC-026-06.
[ ] EPIC-026-07.
[ ] EPIC-026-08.
```

Acceptance:

```text id="awb-pr-02-ac"
[ ] Value objects pasan tests.
[ ] Validators pasan tests.
[ ] No secrets tests pasan.
[ ] No executable payload tests pasan.
[ ] No raw SQL tests pasan.
```

---

## PR-026-03 — Prisma schema, migration and repositories

Incluye:

```text id="awb-pr-03"
[ ] EPIC-026-09.
[ ] EPIC-026-10.
```

Acceptance:

```text id="awb-pr-03-ac"
[ ] Migración limpia.
[ ] Tablas tenant-scoped tienen tenant_id.
[ ] Repositories filtran tenantId.
[ ] Idempotency constraints funcionan.
```

---

## PR-026-04 — DTOs, guards and authorization

Incluye:

```text id="awb-pr-04"
[ ] EPIC-026-11.
[ ] EPIC-026-12.
```

Acceptance:

```text id="awb-pr-04-ac"
[ ] DTOs rechazan campos prohibidos.
[ ] Guards funcionan.
[ ] Sensitive permissions funcionan.
```

---

## PR-026-05 — Platform catalog API and seeds

Incluye:

```text id="awb-pr-05"
[ ] EPIC-026-13.
[ ] EPIC-026-14.
[ ] EPIC-026-29.
```

Acceptance:

```text id="awb-pr-05-ac"
[ ] Trigger Definitions API funciona.
[ ] Action Definitions API funciona.
[ ] Seeds idempotentes.
[ ] Catálogo no habilita actions prohibidas.
```

---

## PR-026-06 — Tenant workflows, versions and activations

Incluye:

```text id="awb-pr-06"
[ ] EPIC-026-15.
[ ] EPIC-026-16.
[ ] EPIC-026-17.
```

Acceptance:

```text id="awb-pr-06-ac"
[ ] Workflow API funciona.
[ ] Version lifecycle funciona.
[ ] Activation/deactivation funciona.
[ ] Active version immutable.
```

---

## PR-026-07 — Queues, event dispatcher and scheduler

Incluye:

```text id="awb-pr-07"
[ ] EPIC-026-18.
[ ] EPIC-026-19.
[ ] EPIC-026-20.
[ ] EPIC-026-21.
```

Acceptance:

```text id="awb-pr-07-ac"
[ ] BullMQ queues funcionan.
[ ] Redis locks funcionan.
[ ] Event dispatcher funciona.
[ ] Scheduler funciona.
[ ] Manual run encola execution.
```

---

## PR-026-08 — Execution engine and allowed actions

Incluye:

```text id="awb-pr-08"
[ ] EPIC-026-22.
[ ] EPIC-026-23.
```

Acceptance:

```text id="awb-pr-08-ac"
[ ] Execution engine ejecuta steps en orden.
[ ] Actions permitidas invocan puertos.
[ ] Actions prohibidas quedan bloqueadas.
[ ] No hay efectos financieros destructivos.
```

---

## PR-026-09 — Retry, dead letter, executions API and logs

Incluye:

```text id="awb-pr-09"
[ ] EPIC-026-24.
[ ] EPIC-026-25.
[ ] EPIC-026-26.
```

Acceptance:

```text id="awb-pr-09-ac"
[ ] Retries finitos.
[ ] Dead letter funciona.
[ ] Executions API funciona.
[ ] Logs sanitizados.
```

---

## PR-026-10 — Exports and internal integrations

Incluye:

```text id="awb-pr-10"
[ ] EPIC-026-27.
[ ] EPIC-026-28.
```

Acceptance:

```text id="awb-pr-10-ac"
[ ] Exports vía SDS.
[ ] No storageKey.
[ ] Internal adapters funcionan.
```

---

## PR-026-11 — Audit, observability and OpenAPI

Incluye:

```text id="awb-pr-11"
[ ] EPIC-026-30.
[ ] EPIC-026-31.
[ ] EPIC-026-32.
```

Acceptance:

```text id="awb-pr-11-ac"
[ ] Audit completo.
[ ] Logs sanitizados.
[ ] Metrics seguras.
[ ] OpenAPI sin campos prohibidos.
```

---

## PR-026-12 — Hardening, performance, concurrency and smoke

Incluye:

```text id="awb-pr-12"
[ ] EPIC-026-33.
[ ] EPIC-026-34.
[ ] EPIC-026-35.
[ ] EPIC-026-36.
```

Acceptance:

```text id="awb-pr-12-ac"
[ ] Security hardening pasa.
[ ] Performance baseline pasa.
[ ] Concurrency critical tests pasan.
[ ] Smoke tests pasan.
[ ] CI completo pasa.
```

---

# 42. Checklist por endpoint

## 42.1. Platform Trigger Definitions

```text id="awb-endpoint-platform-trigger-definitions"
[ ] GET    /api/v1/platform/automation-trigger-definitions.
[ ] POST   /api/v1/platform/automation-trigger-definitions.
[ ] GET    /api/v1/platform/automation-trigger-definitions/{definitionId}.
[ ] PATCH  /api/v1/platform/automation-trigger-definitions/{definitionId}.
[ ] POST   /api/v1/platform/automation-trigger-definitions/{definitionId}/archive.
```

---

## 42.2. Platform Action Definitions

```text id="awb-endpoint-platform-action-definitions"
[ ] GET    /api/v1/platform/automation-action-definitions.
[ ] POST   /api/v1/platform/automation-action-definitions.
[ ] GET    /api/v1/platform/automation-action-definitions/{definitionId}.
[ ] PATCH  /api/v1/platform/automation-action-definitions/{definitionId}.
[ ] POST   /api/v1/platform/automation-action-definitions/{definitionId}/archive.
```

---

## 42.3. Tenant Workflow Definitions

```text id="awb-endpoint-workflows"
[ ] GET    /api/v1/tenant/automation-workflows.
[ ] POST   /api/v1/tenant/automation-workflows.
[ ] GET    /api/v1/tenant/automation-workflows/{workflowId}.
[ ] PATCH  /api/v1/tenant/automation-workflows/{workflowId}.
[ ] POST   /api/v1/tenant/automation-workflows/{workflowId}/archive.
```

---

## 42.4. Tenant Workflow Versions

```text id="awb-endpoint-workflow-versions"
[ ] GET    /api/v1/tenant/automation-workflows/{workflowId}/versions.
[ ] POST   /api/v1/tenant/automation-workflows/{workflowId}/versions.
[ ] GET    /api/v1/tenant/automation-workflows/{workflowId}/versions/{versionId}.
[ ] PATCH  /api/v1/tenant/automation-workflows/{workflowId}/versions/{versionId}.
[ ] POST   /api/v1/tenant/automation-workflows/{workflowId}/versions/{versionId}/submit-review.
[ ] POST   /api/v1/tenant/automation-workflows/{workflowId}/versions/{versionId}/approve.
[ ] POST   /api/v1/tenant/automation-workflows/{workflowId}/versions/{versionId}/reject.
[ ] POST   /api/v1/tenant/automation-workflows/{workflowId}/versions/{versionId}/activate.
[ ] POST   /api/v1/tenant/automation-workflows/{workflowId}/versions/{versionId}/deactivate.
[ ] POST   /api/v1/tenant/automation-workflows/{workflowId}/versions/{versionId}/archive.
```

---

## 42.5. Tenant Workflow Executions

```text id="awb-endpoint-executions"
[ ] GET    /api/v1/tenant/automation-executions.
[ ] GET    /api/v1/tenant/automation-executions/{executionId}.
[ ] POST   /api/v1/tenant/automation-workflows/{workflowId}/run.
[ ] POST   /api/v1/tenant/automation-executions/{executionId}/cancel.
[ ] POST   /api/v1/tenant/automation-executions/{executionId}/retry.
```

---

## 42.6. Tenant Dead Letters

```text id="awb-endpoint-dead-letters"
[ ] GET    /api/v1/tenant/automation-dead-letters.
[ ] GET    /api/v1/tenant/automation-dead-letters/{deadLetterId}.
[ ] POST   /api/v1/tenant/automation-dead-letters/{deadLetterId}/resolve.
[ ] POST   /api/v1/tenant/automation-dead-letters/{deadLetterId}/ignore.
```

---

## 42.7. Tenant Exports

```text id="awb-endpoint-exports"
[ ] GET    /api/v1/tenant/automation-exports.
[ ] GET    /api/v1/tenant/automation-exports/{exportId}.
[ ] POST   /api/v1/tenant/automation-exports.
```

---

# 43. Checklist de seguridad final

```text id="awb-final-security-checklist"
[ ] Todas las rutas requieren AuthGuard.
[ ] Rutas tenant requieren TenantGuard.
[ ] Rutas tenant requieren PermissionGuard.
[ ] Rutas sensibles requieren SensitivePermissionGuard.
[ ] Rutas platform requieren PlatformPermissionGuard.
[ ] Internal events requieren InternalAutomationEventGuard.
[ ] Ningún DTO acepta tenantId.
[ ] Ningún DTO acepta actor fields.
[ ] Ningún DTO acepta status directo fuera de transición.
[ ] Ningún DTO acepta versionNumber.
[ ] Ningún DTO acepta versionLabel.
[ ] Ningún DTO acepta storageKey.
[ ] Ningún DTO acepta signedUrl.
[ ] Ningún DTO acepta secret.
[ ] Ningún DTO acepta token.
[ ] Ningún DTO acepta password.
[ ] Ningún DTO acepta apiKey.
[ ] Ningún DTO acepta privateKey.
[ ] Ningún DTO acepta clientSecret.
[ ] Ningún DTO acepta rawSql.
[ ] Ningún DTO acepta script.
[ ] Ningún DTO acepta executableCode.
[ ] Ninguna response expone storageKey.
[ ] Ninguna response expone signedUrl persistente.
[ ] Ninguna response expone secrets.
[ ] Ninguna response expone payload sensible raw.
[ ] No existen endpoints públicos.
[ ] No existen public webhooks.
[ ] WordPress público no accede.
[ ] No se almacenan secretos.
[ ] No se ejecutan scripts.
[ ] No se ejecuta raw SQL.
[ ] No se ejecuta código configurable.
[ ] No se permite action fuera de catálogo.
[ ] No se permite trigger fuera de catálogo.
[ ] No se ejecutan pagos.
[ ] No se crean SupplierPaymentOrders.
[ ] No se crean JournalEntries.
[ ] No se confirma Bank Reconciliation.
[ ] No se modifica stock directamente.
[ ] No se modifica AccessEvent directamente.
[ ] No se abren portones.
[ ] No se controla hardware.
[ ] No hay biometría.
[ ] No hay reconocimiento facial.
[ ] No hay IA externa con datos reales.
[ ] Logs no contienen secretos.
[ ] Audit no contiene secretos.
[ ] Exports no contienen secretos.
[ ] OpenAPI no documenta campos prohibidos.
```

---

# 44. Definition of Done

```text id="awb-task-dod"
[ ] spec.md aprobado.
[ ] plan.md aprobado.
[ ] data-model.md aprobado.
[ ] api-contract.md aprobado.
[ ] test-plan.md aprobado.
[ ] tasks.md aprobado.
[ ] security-notes.md creado y aprobado.
[ ] Módulo NestJS implementado.
[ ] Configuración implementada.
[ ] Feature flags implementadas.
[ ] Boot validation implementada.
[ ] Enums implementados.
[ ] Errores implementados.
[ ] Value objects implementados.
[ ] Validators implementados.
[ ] Sanitizers implementados.
[ ] Domain entities implementadas.
[ ] State machines implementadas.
[ ] Domain policies implementadas.
[ ] Prisma schema implementado.
[ ] Migración implementada.
[ ] Repositories implementados.
[ ] DTOs implementados.
[ ] Guards implementados.
[ ] Platform Trigger Definitions API implementada.
[ ] Platform Action Definitions API implementada.
[ ] Tenant Workflow Definitions API implementada.
[ ] Tenant Workflow Versions API implementada.
[ ] Workflow Activation API implementada.
[ ] Workflow Execution API implementada.
[ ] Manual Run API implementada.
[ ] Retry API implementada.
[ ] Cancel API implementada.
[ ] Dead Letter API implementada.
[ ] Export API implementada.
[ ] Internal event publisher implementado.
[ ] BullMQ queues implementadas.
[ ] Redis locks implementados.
[ ] Scheduler implementado.
[ ] Execution engine implementado.
[ ] Action executor implementado.
[ ] Allowed integrations implementadas.
[ ] Retry engine implementado.
[ ] Dead letter engine implementado.
[ ] Execution logs implementados.
[ ] SDS exports implementados.
[ ] Internal integration ports implementados.
[ ] Seeds implementados.
[ ] Audit implementado.
[ ] Observability implementada.
[ ] OpenAPI implementado.
[ ] Security hardening ejecutado.
[ ] Performance tests básicos pasan.
[ ] Concurrency tests críticos pasan.
[ ] CI gates implementados.
[ ] Smoke tests pasan.
[ ] CI completo pasa.
```

---

# 45. No aceptación

No se acepta implementación si:

```text id="awb-task-no-acceptance"
- permite workflows cross-tenant;
- permite versions cross-tenant;
- permite activations cross-tenant;
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

# 46. Resultado esperado

Al completar este backlog, el módulo `026-automation-workflows-basic` quedará listo para implementación controlada dentro de RESIDENT Core.

Resultado esperado:

```text id="awb-task-expected-result"
module foundation tasks definidas
configuration tasks definidas
feature flags tasks definidas
enums tasks definidas
errors tasks definidas
value objects tasks definidas
validators tasks definidas
sanitizers tasks definidas
entities tasks definidas
state machines tasks definidas
domain policies tasks definidas
Prisma migration tasks definidas
repository tasks definidas
DTO tasks definidas
guards tasks definidas
Platform Trigger Definitions API tasks definidas
Platform Action Definitions API tasks definidas
Tenant Workflow Definitions API tasks definidas
Tenant Workflow Versions API tasks definidas
Workflow Activation API tasks definidas
BullMQ queues tasks definidas
Redis lock tasks definidas
Event Dispatcher tasks definidas
Scheduler tasks definidas
Manual Run tasks definidas
Execution Engine tasks definidas
Action Executor tasks definidas
Retry tasks definidas
Dead Letter tasks definidas
Executions API tasks definidas
Execution Logs tasks definidas
SDS Exports tasks definidas
Internal Integration Ports tasks definidas
Seeds tasks definidas
Audit tasks definidas
Observability tasks definidas
OpenAPI tasks definidas
Security Hardening tasks definidas
Performance tasks definidas
Concurrency tasks definidas
CI gates tasks definidas
Smoke tasks definidas
PR plan definido
endpoint checklist definido
security checklist definido
DoD definido
no acceptance definido
```

---

# 47. Expediente actualizado

```text id="awb-task-expediente"
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
│   │       ├── api-contract.md
│   │       ├── test-plan.md
│   │       └── tasks.md
```
