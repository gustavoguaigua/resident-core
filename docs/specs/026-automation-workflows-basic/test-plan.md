# Test Plan — 026 Automation Workflows Basic

## 1. Información del documento

| Campo           | Valor                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------ |
| Proyecto        | RESIDENT Core                                                                              |
| Spec ID         | 026                                                                                        |
| Módulo          | Automation Workflows Basic                                                                 |
| Documento       | Test Plan                                                                                  |
| Ruta            | `docs/specs/026-automation-workflows-basic/test-plan.md`                                   |
| Versión         | 0.1                                                                                        |
| Estado          | needs-review                                                                               |
| Fecha           | 2026-07-31                                                                                 |
| Documento base  | `docs/specs/026-automation-workflows-basic/spec.md`                                        |
| Plan técnico    | `docs/specs/026-automation-workflows-basic/plan.md`                                        |
| Modelo de datos | `docs/specs/026-automation-workflows-basic/data-model.md`                                  |
| Contrato API    | `docs/specs/026-automation-workflows-basic/api-contract.md`                                |
| Stack objetivo  | NestJS / TypeScript / PostgreSQL / Prisma / OpenAPI / Keycloak / BullMQ / Redis            |
| Naturaleza      | Tenant-scoped / Event-driven / Workflow-governed / Queue-backed / Audit-heavy / Non-public |

---

## 2. Propósito

Este documento define el plan de pruebas del módulo `026-automation-workflows-basic`.

El objetivo es validar que el módulo permita crear, versionar, activar, ejecutar, reintentar, auditar, consultar y exportar automatizaciones básicas de forma segura, tenant-scoped, idempotente y controlada, sin convertirse en un motor de ejecución arbitraria, sin scripts, sin raw SQL, sin webhooks públicos inseguros, sin acceso desde WordPress público, sin pagos automáticos, sin contabilidad automática, sin conciliación bancaria automática, sin hardware y sin IA externa con datos reales.

Regla central del plan de pruebas:

```text id="awb-test-rule"
Automation Workflows Basic solo puede aceptarse si todas sus pruebas demuestran tenant isolation, catálogo cerrado de triggers/actions, validación estricta de schemas, versionamiento correcto, activación controlada, ejecución idempotente, retries finitos, dead letter, logs sanitizados, auditoría completa, exportaciones vía Secure Document Storage, ausencia de secretos, ausencia de scripts, ausencia de raw SQL, ausencia de código ejecutable, ausencia de endpoints públicos, ausencia de webhooks públicos inseguros, ausencia de acceso desde WordPress público, ausencia de storageKey expuesto, ausencia de pagos ejecutados, ausencia de asientos contables creados, ausencia de conciliaciones bancarias confirmadas, ausencia de control físico de hardware y ausencia de IA externa con datos reales.
```

---

## 3. Objetivos de prueba

```text id="awb-test-objectives"
1. Verificar tenant isolation en workflows, versions, activations, executions, steps, logs, dead letters y exports.
2. Verificar que Platform API gestione catálogos globales sin datos reales de tenant.
3. Verificar que Tenant Admin API opere únicamente sobre el tenant actual.
4. Verificar que trigger definitions sean allowlisted, schema-validated y no ejecutables.
5. Verificar que action definitions sean allowlisted, schema-validated y no destructivas por defecto.
6. Verificar que workflow definitions sean tenant-scoped.
7. Verificar que workflow versions sean versionadas, validadas e inmutables al activarse.
8. Verificar lifecycle de review, approval, reject, activate, schedule, deactivate y archive.
9. Verificar event-driven workflows con sourceEventId.
10. Verificar scheduled workflows con scheduledWindowKey y timezone del tenant.
11. Verificar manual workflows con actor, permiso y reason cuando aplique.
12. Verificar idempotencyKey obligatorio.
13. Verificar que no se dupliquen ejecuciones por evento, ventana o ejecución manual.
14. Verificar ejecución de steps mediante catálogo de actions.
15. Verificar retries finitos.
16. Verificar dead letter al agotar retries.
17. Verificar cancelación controlada.
18. Verificar logs funcionales sanitizados.
19. Verificar exportaciones vía Secure Document Storage.
20. Verificar que no se expone storageKey.
21. Verificar auditoría obligatoria.
22. Verificar observabilidad sin datos sensibles.
23. Verificar OpenAPI sin rutas ni campos prohibidos.
24. Verificar límites explícitos: no public, no WordPress, no secrets, no executable payload, no payment execution, no accounting execution, no bank reconciliation confirmation, no hardware, no external AI.
```

---

## 4. Alcance de pruebas

### 4.1. Incluido

```text id="awb-test-scope-in"
- Value objects.
- Trigger/action validators.
- Condition evaluator.
- Action graph validator.
- Retry policy validator.
- Idempotency key builder.
- Payload sanitizers.
- Domain entities.
- State machines.
- Domain policies.
- DTO validation.
- Repository ports.
- Prisma repositories.
- BullMQ queue adapter.
- Redis lock adapter.
- Scheduler.
- Event dispatcher.
- Workflow execution engine.
- Step execution engine.
- Retry service.
- Dead letter service.
- Platform API.
- Tenant Admin API.
- Internal event publisher port.
- Integration ports.
- Secure Document Storage boundary.
- Audit boundary.
- Observability boundary.
- OpenAPI contract.
- Multitenancy tests.
- Security tests.
- Idempotency tests.
- Queue tests.
- Concurrency tests.
- Performance tests.
- Regression tests.
- Smoke tests.
- CI gates.
```

---

### 4.2. Fuera de alcance funcional

No se probarán como funcionalidades propias del MVP:

```text id="awb-test-scope-out"
- BPMN engine.
- Editor visual drag-and-drop.
- DSL ejecutable.
- JavaScript configurable.
- Python dinámico.
- Raw SQL.
- Expresiones arbitrarias inseguras.
- Public webhooks productivos.
- Conectores externos arbitrarios.
- n8n productivo con datos sensibles.
- Zapier/Make productivo con datos sensibles.
- Secrets manager embebido.
- Pagos automáticos.
- Reversos automáticos de pagos.
- Asientos contables automáticos directos.
- Confirmación automática de conciliación bancaria.
- Modificación directa de inventario.
- Modificación directa de AccessEvents.
- Apertura de portones.
- Control físico de hardware.
- Biometría.
- Reconocimiento facial.
- OCR automático.
- Agentes IA con datos reales.
- Marketplace de automatizaciones.
- Sagas distribuidas avanzadas.
```

Estas capacidades sí deben probarse como **prohibiciones** mediante tests negativos.

---

## 5. Estrategia de pruebas

### 5.1. Pirámide de pruebas

```text id="awb-test-pyramid"
1. Unit tests:
   - value objects;
   - trigger/action validators;
   - condition evaluator;
   - action graph validator;
   - retry policy;
   - idempotency key builder;
   - state machines;
   - domain policies;
   - sanitizers.

2. Integration tests:
   - Prisma repositories;
   - PostgreSQL constraints;
   - partial unique indexes;
   - queue adapters;
   - Redis locks;
   - event dispatcher;
   - scheduler;
   - execution engine;
   - retry engine;
   - dead letter;
   - SDS adapter;
   - audit adapter;
   - settings/policies adapter.

3. API tests:
   - Platform Trigger Definitions API;
   - Platform Action Definitions API;
   - Tenant Workflows API;
   - Tenant Workflow Versions API;
   - Tenant Workflow Executions API;
   - Tenant Dead Letters API;
   - Tenant Exports API;
   - DTO validation;
   - permissions;
   - sensitive permissions;
   - error mapping;
   - response sanitization.

4. Security tests:
   - tenant isolation;
   - forbidden fields;
   - no secrets;
   - no executable payload;
   - no raw SQL;
   - no scripts;
   - no public endpoints;
   - no public webhooks;
   - no WordPress access;
   - no storageKey exposure;
   - no payment execution;
   - no accounting execution;
   - no bank reconciliation confirmation;
   - no hardware control;
   - no external AI.

5. E2E / smoke tests:
   - PlatformAdmin seeds catalog;
   - TenantAdmin creates workflow;
   - TenantAdmin creates version;
   - BoardMember approves;
   - TenantAdmin activates;
   - Internal event enqueues execution;
   - Worker executes steps;
   - Retry/dead letter works;
   - Export via SDS works.
```

---

### 5.2. Criterio general de aceptación

```text id="awb-test-acceptance-general"
El módulo solo pasa si todos los tests unitarios, integración, API, seguridad, multitenancy, idempotencia, colas, retries, dead letter, auditoría, OpenAPI y smoke flows pasan en CI.
```

---

## 6. Ambientes de prueba

### 6.1. Local

```text id="awb-test-local-env"
- Docker Compose.
- PostgreSQL local.
- Redis local.
- BullMQ local.
- Keycloak local o auth mock.
- Prisma migrate dev/test.
- Seeds sintéticos.
- Secure Document Storage mock/local.
- Audit mock/local.
- Notifications mock.
- Reports mock.
- Tenant Settings and Policies mock.
```

---

### 6.2. CI

```text id="awb-test-ci-env"
- PostgreSQL efímero.
- Redis efímero.
- BullMQ worker test mode.
- Migración limpia.
- Seeds reproducibles.
- Tests unitarios.
- Tests integración.
- Tests API.
- Tests security.
- Tests queue/idempotency.
- Tests OpenAPI.
- Smoke tests.
- Coverage report.
```

---

### 6.3. Staging futuro

```text id="awb-test-staging-env"
- Keycloak staging.
- PostgreSQL staging.
- Redis staging.
- BullMQ workers.
- SDS staging.
- Audit activo.
- Metrics activo.
- Logs sanitizados.
- Datos sintéticos.
- Sin secretos reales.
- Sin datos reales de residentes.
- Sin automatizaciones productivas sensibles.
```

---

## 7. Datos de prueba

### 7.1. Tenants

```text id="awb-test-tenants"
tenantA = "Conjunto Demo Norte"
tenantB = "Conjunto Demo Sur"
```

Regla:

```text id="awb-test-tenant-rule"
tenantA nunca puede leer, crear, modificar, activar, ejecutar, reintentar, cancelar, resolver, exportar o consultar workflows, versions, activations, executions, steps, logs, dead letters o exports de tenantB.
```

---

### 7.2. Usuarios

```text id="awb-test-users"
platformAdmin
platformSupportReadOnly

tenantAdminA
boardMemberA
financialManagerA
securityManagerA
maintenanceManagerA
residentA1
guardA

tenantAdminB
boardMemberB
financialManagerB
residentB1

anonymousUser
```

---

### 7.3. Trigger definitions

```text id="awb-test-trigger-definitions"
payments.paymentValidated
payments.paymentRejected
financial.chargeDueSoon
reservations.reservationStartingSoon
meetings.meetingStartingSoon
maintenance.workOrderOverdue
inventory.lowStockDetected
access.openCheckInExceeded
schedule.daily
schedule.weekly
schedule.monthly
manual.runWorkflow
manual.generateReport
```

---

### 7.4. Action definitions

```text id="awb-test-action-definitions"
notifications.sendToResident
notifications.sendToUnit
notifications.sendToRole
notifications.sendToTenantAdmins
notifications.sendCriticalAlert
reports.generateBasicReport
reports.generateAndStoreExport
documents.createExportReference
operations.createAdministrativeTask
operations.createFollowUpReminder
operations.escalateToRole
maintenance.notifyWorkOrderOverdue
access.notifyOpenCheckInExceeded
inventory.notifyLowStock
payments.notifyPaymentValidationResult
dues.notifyChargeDueSoon
```

---

### 7.5. Prohibited actions

```text id="awb-test-prohibited-actions"
system.executeScript
system.executeSql
system.executeShellCommand
payments.createPayment
payments.validatePaymentAutomatically
payments.reversePayment
accounting.createJournalEntry
bankReconciliation.confirmMatch
supplierPayments.createPaymentOrder
inventory.postStockAdjustmentAutomatically
access.openGate
access.controlHardware
external.sendRealDataToAI
external.callUntrustedWebhook
```

---

### 7.6. Workflow fixtures

```text id="awb-test-workflows"
tenantA:
- wf_payment_validated_notification
- wf_due_soon_reminder
- wf_monthly_access_report
- wf_open_checkin_alert
- wf_low_stock_alert
- wf_failed_action_dead_letter

tenantB:
- wf_payment_validated_notification
```

---

### 7.7. Version fixtures

```text id="awb-test-versions"
tenantA:
- v1 active
- v2 draft
- v3 reviewReady
- v4 approved
- v5 scheduled
- v6 rejected
- v7 deactivated
- v8 archived

tenantB:
- v1 active
```

---

### 7.8. Execution fixtures

```text id="awb-test-executions"
eventExecutionSucceeded
eventExecutionFailed
eventExecutionRetrying
scheduledExecutionSucceeded
manualExecutionQueued
manualExecutionCancelled
executionDeadLettered
executionPartiallySucceeded
```

---

### 7.9. External mocks

```text id="awb-test-external-mocks"
secureDocumentA
secureDocumentB
notificationIdA
reportIdA
sourceEventPaymentValidatedA
sourceEventPaymentValidatedB
sourceEventAccessOpenCheckInA
traceIdA
traceIdB
correlationIdA
```

---

## 8. Unit tests — Value objects

### 8.1. WorkflowCode

```text id="awb-test-vo-workflow-code"
[ ] Acepta payment-validation-notification.
[ ] Acepta monthly-access-report.
[ ] Rechaza string vacío.
[ ] Rechaza espacios.
[ ] Rechaza caracteres peligrosos.
[ ] Rechaza longitud excesiva.
[ ] Rechaza scripts.
[ ] Rechaza raw SQL.
```

---

### 8.2. TriggerKey

```text id="awb-test-vo-trigger-key"
[ ] Acepta payments.paymentValidated.
[ ] Acepta schedule.monthly.
[ ] Acepta manual.runWorkflow.
[ ] Rechaza key sin categoría.
[ ] Rechaza string vacío.
[ ] Rechaza raw SQL.
[ ] Rechaza script tag.
[ ] Rechaza longitud excesiva.
```

---

### 8.3. ActionKey

```text id="awb-test-vo-action-key"
[ ] Acepta notifications.sendToResident.
[ ] Acepta reports.generateBasicReport.
[ ] Rechaza system.executeScript si no está allowlisted.
[ ] Rechaza system.executeSql.
[ ] Rechaza external.sendRealDataToAI.
[ ] Rechaza key inválida.
```

---

### 8.4. WorkflowVersionNumber

```text id="awb-test-vo-version-number"
[ ] Acepta entero positivo generado server-side.
[ ] Genera versionLabel v1.
[ ] Genera versionLabel v2.
[ ] Rechaza 0.
[ ] Rechaza negativos.
[ ] Rechaza versión enviada desde DTO externo.
```

---

### 8.5. EffectiveWindow

```text id="awb-test-vo-effective-window"
[ ] Acepta effectiveFrom sin effectiveUntil.
[ ] Acepta effectiveFrom < effectiveUntil.
[ ] Rechaza effectiveFrom >= effectiveUntil.
[ ] Evalúa effectiveAt dentro de ventana.
[ ] Evalúa effectiveAt fuera de ventana.
[ ] Rechaza fecha inválida.
```

---

### 8.6. IdempotencyKey

```text id="awb-test-vo-idempotency-key"
[ ] Genera key para event-driven.
[ ] Genera key para scheduled.
[ ] Genera key para manual.
[ ] Incluye tenant.
[ ] Incluye workflow.
[ ] Incluye triggerType.
[ ] Incluye source key.
[ ] No contiene datos sensibles.
[ ] Rechaza key vacía.
[ ] Rechaza key arbitraria desde cliente.
```

---

### 8.7. ScheduledWindowKey

```text id="awb-test-vo-scheduled-window-key"
[ ] Genera ventana diaria.
[ ] Genera ventana semanal.
[ ] Genera ventana mensual.
[ ] Usa timezone del tenant.
[ ] Normaliza windowStartUtc.
[ ] Rechaza frecuencia menor a 60 minutos.
[ ] No contiene datos sensibles.
```

---

### 8.8. RetryPolicy

```text id="awb-test-vo-retry-policy"
[ ] Acepta maxRetries=3.
[ ] Acepta backoff fixed.
[ ] Acepta backoff exponential.
[ ] Rechaza maxRetries negativo.
[ ] Rechaza maxRetries mayor al límite global.
[ ] Rechaza retries infinitos.
[ ] Rechaza maxDelaySeconds excesivo.
```

---

## 9. Unit tests — Validators and sanitizers

### 9.1. TriggerConfigValidator

```text id="awb-test-validator-trigger-config"
[ ] Valida event trigger contra schema.
[ ] Valida scheduled trigger contra schema.
[ ] Valida manual trigger contra schema.
[ ] Rechaza eventName distinto al trigger definition.
[ ] Rechaza sourceModule distinto al trigger definition.
[ ] Rechaza payloadFields no allowlisted.
[ ] Rechaza publicWebhookUrl.
[ ] Rechaza secret.
[ ] Rechaza rawSql.
[ ] Rechaza script.
[ ] Rechaza executableCode.
```

---

### 9.2. ActionConfigValidator

```text id="awb-test-validator-action-config"
[ ] Valida notifications.sendToResident.
[ ] Valida reports.generateBasicReport.
[ ] Valida operations.createAdministrativeTask.
[ ] Rechaza actionConfig que no cumple schema.
[ ] Rechaza additionalProperties no permitidas.
[ ] Rechaza action financiera prohibida.
[ ] Rechaza action destructiva prohibida.
[ ] Rechaza external untrusted action.
[ ] Rechaza secrets.
[ ] Rechaza scripts.
[ ] Rechaza rawSql.
[ ] Rechaza storageKey.
```

---

### 9.3. ConditionConfigValidator

```text id="awb-test-validator-condition-config"
[ ] Acepta equals.
[ ] Acepta notEquals.
[ ] Acepta in.
[ ] Acepta notIn.
[ ] Acepta greaterThan.
[ ] Acepta greaterThanOrEqual.
[ ] Acepta lessThan.
[ ] Acepta lessThanOrEqual.
[ ] Acepta exists.
[ ] Acepta notExists.
[ ] Acepta and.
[ ] Acepta or.
[ ] Acepta not.
[ ] Rechaza eval.
[ ] Rechaza Function.
[ ] Rechaza javascript.
[ ] Rechaza script.
[ ] Rechaza rawSql.
[ ] Rechaza externalLookup.
[ ] Rechaza crossTenantLookup.
[ ] Rechaza campo no allowlisted por trigger schema.
```

---

### 9.4. ActionGraphValidator

```text id="awb-test-validator-action-graph"
[ ] Acepta grafo lineal válido.
[ ] Acepta múltiples steps secuenciales.
[ ] Requiere steps.
[ ] Requiere stepKey.
[ ] Requiere stepOrder positivo.
[ ] Requiere actionKey.
[ ] Requiere actionConfig.
[ ] Requiere onFailure permitido.
[ ] Requiere timeoutSeconds permitido.
[ ] Rechaza stepKey duplicado.
[ ] Rechaza action fuera de catálogo.
[ ] Rechaza action archived.
[ ] Rechaza cycles.
[ ] Rechaza recursion.
[ ] Rechaza fan-out masivo.
[ ] Rechaza action financiera destructiva.
[ ] Rechaza hardware action.
[ ] Rechaza external AI action.
```

---

### 9.5. WorkflowPayloadSanitizer

```text id="awb-test-sanitizer-payload"
[ ] Elimina o rechaza secret.
[ ] Elimina o rechaza token.
[ ] Elimina o rechaza password.
[ ] Elimina o rechaza apiKey.
[ ] Elimina o rechaza privateKey.
[ ] Elimina o rechaza clientSecret.
[ ] Elimina o rechaza webhookSecret.
[ ] Elimina o rechaza databaseUrl.
[ ] Elimina o rechaza storageKey.
[ ] Elimina o rechaza signedUrl.
[ ] Elimina o rechaza rawSql.
[ ] Elimina o rechaza script.
[ ] Elimina o rechaza executableCode.
[ ] Elimina o rechaza raw stack trace productivo.
[ ] Limita tamaño del payload.
[ ] Limita profundidad del JSON.
```

---

## 10. Unit tests — Entities

### 10.1. WorkflowTriggerDefinition

```text id="awb-test-entity-trigger-definition"
[ ] Crea trigger definition active.
[ ] Requiere triggerKey.
[ ] Requiere sourceModule.
[ ] Requiere triggerType.
[ ] Requiere eventName si triggerType=event.
[ ] Valida schema.
[ ] Rechaza schema con secrets.
[ ] Rechaza schema con scripts.
[ ] Rechaza schema con rawSql.
[ ] Archiva definition.
[ ] Archived definition no se usa para nuevas versions.
```

---

### 10.2. WorkflowActionDefinition

```text id="awb-test-entity-action-definition"
[ ] Crea action definition active.
[ ] Requiere actionKey.
[ ] Requiere targetModule.
[ ] Requiere actionType.
[ ] Valida schema.
[ ] Rechaza schema con secrets.
[ ] Rechaza schema con scripts.
[ ] Rechaza schema con rawSql.
[ ] Rechaza isDestructive=true sin allowlist.
[ ] Rechaza isFinancial=true con payment execution.
[ ] Rechaza isExternal=true en MVP si no permitido.
[ ] Archiva definition.
```

---

### 10.3. TenantWorkflowDefinition

```text id="awb-test-entity-workflow-definition"
[ ] Crea workflow draft.
[ ] Requiere tenantId.
[ ] Requiere workflowCode.
[ ] Requiere name.
[ ] Activa workflow cuando existe version active.
[ ] Inactiva workflow.
[ ] Archiva workflow.
[ ] Archived workflow no ejecuta.
[ ] Workflow sin active version no ejecuta.
```

---

### 10.4. TenantWorkflowVersion

```text id="awb-test-entity-workflow-version"
[ ] Crea version draft.
[ ] Genera versionNumber server-side.
[ ] Genera versionLabel server-side.
[ ] Valida triggerConfig.
[ ] Valida conditionConfig.
[ ] Valida actionGraph.
[ ] Valida retryPolicy.
[ ] draft -> reviewReady.
[ ] reviewReady -> approved.
[ ] reviewReady -> rejected.
[ ] approved -> scheduled.
[ ] approved -> active.
[ ] scheduled -> active.
[ ] active -> superseded.
[ ] active -> deactivated.
[ ] rejected no puede activarse.
[ ] archived no puede activarse.
[ ] active no se edita destructivamente.
```

---

### 10.5. TenantWorkflowActivation

```text id="awb-test-entity-activation"
[ ] Crea activation immediate.
[ ] Crea activation scheduled.
[ ] Crea activation deactivation.
[ ] Crea activation replacement.
[ ] Requiere effectiveFrom.
[ ] Requiere activationReason.
[ ] Rechaza workflowVersion cross-tenant.
[ ] Rechaza overlap.
[ ] No borra historial.
```

---

### 10.6. WorkflowExecution

```text id="awb-test-entity-execution"
[ ] Crea execution queued.
[ ] Requiere tenantId.
[ ] Requiere workflowDefinitionId.
[ ] Requiere workflowVersionId.
[ ] Requiere triggerDefinitionId.
[ ] Requiere idempotencyKey.
[ ] Event-driven requiere sourceEventId.
[ ] Scheduled requiere scheduledWindowKey.
[ ] Manual requiere manualRunId.
[ ] Manual requiere triggeredByUserProfileId.
[ ] queued -> running.
[ ] running -> succeeded.
[ ] running -> partiallySucceeded.
[ ] running -> failed.
[ ] failed -> retrying.
[ ] failed -> deadLettered.
[ ] queued -> cancelled.
[ ] running -> cancelled.
[ ] succeeded no vuelve a running.
```

---

### 10.7. WorkflowStepExecution

```text id="awb-test-entity-step-execution"
[ ] Crea step pending.
[ ] Requiere workflowExecutionId.
[ ] Requiere stepKey.
[ ] Requiere actionDefinitionId.
[ ] Requiere actionKey.
[ ] Requiere targetModule.
[ ] pending -> running.
[ ] running -> succeeded.
[ ] running -> failed.
[ ] running -> retrying.
[ ] pending -> skipped.
[ ] failed -> skipped si policy lo permite.
[ ] Step no acepta output con storageKey.
```

---

### 10.8. WorkflowDeadLetter

```text id="awb-test-entity-dead-letter"
[ ] Crea dead letter open.
[ ] Requiere workflowExecutionId.
[ ] Requiere reasonCode.
[ ] Requiere failureReason.
[ ] lastErrorSanitized no contiene stack raw.
[ ] open -> underReview.
[ ] open -> resolved.
[ ] open -> ignored.
[ ] resolved -> archived.
[ ] ignored -> archived.
[ ] archived no vuelve a open.
```

---

### 10.9. WorkflowExport

```text id="awb-test-entity-export"
[ ] Crea export requested.
[ ] processing -> completed con secureDocumentId.
[ ] processing -> failed con failureReason.
[ ] completed requiere secureDocumentId.
[ ] failed requiere failureReason.
[ ] Rechaza storageKey.
[ ] Rechaza signedUrl persistente.
[ ] Archiva export.
```

---

## 11. Unit tests — Domain policies

### 11.1. WorkflowTenantIsolationPolicy

```text id="awb-test-policy-tenant-isolation"
[ ] Permite recurso del mismo tenant.
[ ] Rechaza recurso de tenant distinto.
[ ] Cross-tenant se mapea a 404.
```

---

### 11.2. WorkflowCatalogAllowlistPolicy

```text id="awb-test-policy-catalog-allowlist"
[ ] Permite trigger active.
[ ] Permite action active.
[ ] Rechaza trigger archived.
[ ] Rechaza action archived.
[ ] Rechaza trigger no existente.
[ ] Rechaza action no existente.
[ ] Rechaza action fuera del catálogo.
```

---

### 11.3. NoSecretsInWorkflowPolicy

```text id="awb-test-policy-no-secrets"
[ ] Rechaza secret.
[ ] Rechaza token.
[ ] Rechaza password.
[ ] Rechaza apiKey.
[ ] Rechaza privateKey.
[ ] Rechaza clientSecret.
[ ] Rechaza webhookSecret.
[ ] Rechaza databaseUrl.
[ ] Rechaza storageKey.
```

---

### 11.4. NoExecutableWorkflowPayloadPolicy

```text id="awb-test-policy-no-executable"
[ ] Rechaza script.
[ ] Rechaza javascript.
[ ] Rechaza Function.
[ ] Rechaza eval.
[ ] Rechaza functionBody.
[ ] Rechaza executableCode.
[ ] Rechaza shellCommand.
[ ] Rechaza cronCommand.
```

---

### 11.5. NoRawSqlWorkflowPolicy

```text id="awb-test-policy-no-raw-sql"
[ ] Rechaza rawSql.
[ ] Rechaza sql arbitrario.
[ ] Rechaza SELECT configurado por usuario.
[ ] Rechaza UPDATE configurado por usuario.
[ ] Rechaza DELETE configurado por usuario.
```

---

### 11.6. WorkflowIdempotencyPolicy

```text id="awb-test-policy-idempotency"
[ ] Exige idempotencyKey.
[ ] Exige sourceEventId para event.
[ ] Exige scheduledWindowKey para scheduled.
[ ] Exige manualRunId para manual.
[ ] Rechaza duplicado.
[ ] Permite retry con lineage controlado.
```

---

### 11.7. NoFinancialExecutionPolicy

```text id="awb-test-policy-no-financial-execution"
[ ] Bloquea payments.createPayment.
[ ] Bloquea payments.validatePaymentAutomatically.
[ ] Bloquea payments.reversePayment.
[ ] Bloquea supplierPayments.createPaymentOrder.
[ ] Bloquea accounting.createJournalEntry.
[ ] Bloquea bankReconciliation.confirmMatch.
[ ] Permite payments.notifyPaymentValidationResult.
[ ] Permite dues.notifyChargeDueSoon.
```

---

### 11.8. NoHardwareControlPolicy

```text id="awb-test-policy-no-hardware"
[ ] Bloquea access.openGate.
[ ] Bloquea access.controlHardware.
[ ] Bloquea gateOpenCommand.
[ ] Bloquea hardwareDeviceCommand.
[ ] Bloquea biometricTemplate.
[ ] Bloquea faceEmbedding.
```

---

### 11.9. NoExternalAiRealDataPolicy

```text id="awb-test-policy-no-ai"
[ ] Bloquea external.sendRealDataToAI.
[ ] Bloquea externalAiEnabled.
[ ] Bloquea externalAiRealDataAllowed.
[ ] Bloquea action externa de IA.
[ ] Permite datos sintéticos en tests/documentación.
```

---

## 12. Integration tests — Repositories

### 12.1. TriggerDefinitionRepository

```text id="awb-test-repo-trigger-definition"
[ ] create guarda trigger definition.
[ ] triggerKey único.
[ ] list filtra por status.
[ ] list filtra por category.
[ ] list filtra por sourceModule.
[ ] get by id.
[ ] get by triggerKey.
[ ] archive no borra físicamente.
[ ] archived no aparece en list active.
```

---

### 12.2. ActionDefinitionRepository

```text id="awb-test-repo-action-definition"
[ ] create guarda action definition.
[ ] actionKey único.
[ ] list filtra por status.
[ ] list filtra por category.
[ ] list filtra por targetModule.
[ ] list filtra por isDestructive.
[ ] list filtra por isFinancial.
[ ] get by id.
[ ] get by actionKey.
[ ] archive no borra físicamente.
```

---

### 12.3. TenantWorkflowDefinitionRepository

```text id="awb-test-repo-workflow-definition"
[ ] create workflow tenant-scoped.
[ ] workflowCode único por tenant.
[ ] mismo workflowCode permitido en tenant distinto.
[ ] list filtra tenantId.
[ ] get usa id + tenantId.
[ ] update usa id + tenantId.
[ ] archive usa id + tenantId.
[ ] tenantA no lee workflow tenantB.
[ ] tenantA no actualiza workflow tenantB.
```

---

### 12.4. TenantWorkflowVersionRepository

```text id="awb-test-repo-workflow-version"
[ ] create version tenant-scoped.
[ ] versionNumber único por tenant + workflow.
[ ] mismo versionNumber permitido en tenant distinto.
[ ] list versions filtra tenantId.
[ ] get version usa id + tenantId.
[ ] update draft usa id + tenantId.
[ ] tenantA no lee version tenantB.
[ ] query active by trigger funciona.
[ ] query effective by date funciona.
[ ] rejected no aparece como active.
[ ] archived no aparece como active.
```

---

### 12.5. TenantWorkflowActivationRepository

```text id="awb-test-repo-activation"
[ ] create activation tenant-scoped.
[ ] list activations filtra tenantId.
[ ] get activation usa id + tenantId.
[ ] scheduled query devuelve activaciones pendientes.
[ ] tenantA no lee activation tenantB.
[ ] overlap se rechaza por lógica/transacción.
```

---

### 12.6. WorkflowExecutionRepository

```text id="awb-test-repo-execution"
[ ] create execution tenant-scoped.
[ ] unique tenant + workflow + idempotencyKey.
[ ] list executions filtra tenantId.
[ ] get execution usa id + tenantId.
[ ] update status usa id + tenantId.
[ ] tenantA no lee execution tenantB.
[ ] sourceEventId query funciona.
[ ] scheduledWindowKey query funciona.
[ ] manualRunId query funciona.
```

---

### 12.7. WorkflowStepExecutionRepository

```text id="awb-test-repo-step-execution"
[ ] create step tenant-scoped.
[ ] stepKey único por execution.
[ ] list steps por execution filtra tenantId.
[ ] update status usa id + tenantId.
[ ] tenantA no lee step tenantB.
[ ] outputSanitized no contiene storageKey.
```

---

### 12.8. WorkflowExecutionLogRepository

```text id="awb-test-repo-execution-log"
[ ] create log tenant-scoped.
[ ] list logs por execution filtra tenantId.
[ ] logs no contienen secrets.
[ ] logs no contienen raw payload.
[ ] logs no contienen storageKey.
[ ] tenantA no lee logs tenantB.
```

---

### 12.9. WorkflowDeadLetterRepository

```text id="awb-test-repo-dead-letter"
[ ] create dead letter tenant-scoped.
[ ] workflowExecutionId único.
[ ] list dead letters filtra tenantId.
[ ] get dead letter usa id + tenantId.
[ ] resolve usa id + tenantId.
[ ] ignore usa id + tenantId.
[ ] tenantA no lee dead letter tenantB.
```

---

### 12.10. WorkflowExportRepository

```text id="awb-test-repo-export"
[ ] create export tenant-scoped.
[ ] mark processing.
[ ] mark completed con secureDocumentId.
[ ] mark failed con failureReason.
[ ] list exports filtra tenantId.
[ ] tenantA no lee export tenantB.
[ ] secureDocumentId no se confunde con storageKey.
```

---

## 13. Integration tests — Queue, scheduler and execution engine

### 13.1. BullMQ queue adapter

```text id="awb-test-queue-adapter"
[ ] enqueueExecution crea job.
[ ] jobId usa idempotencyKey determinístico.
[ ] enqueue duplicado no crea job duplicado.
[ ] enqueueStep crea job de step.
[ ] enqueueRetry crea job de retry.
[ ] payload de job no contiene secrets.
[ ] payload de job no contiene storageKey.
[ ] payload de job incluye tenantId.
[ ] payload de job incluye traceId.
```

---

### 13.2. Redis lock adapter

```text id="awb-test-lock-adapter"
[ ] Adquiere lock por tenant + workflow.
[ ] Rechaza lock duplicado.
[ ] Libera lock.
[ ] Lock expira.
[ ] Lock no mezcla tenants.
[ ] Lock por execution evita retry simultáneo.
```

---

### 13.3. Event dispatcher

```text id="awb-test-event-dispatcher"
[ ] Recibe evento interno válido.
[ ] Rechaza evento sin tenantId.
[ ] Rechaza evento sin sourceEventId.
[ ] Rechaza eventName no catalogado.
[ ] Busca workflows activos por trigger.
[ ] Evalúa condiciones.
[ ] Encola execution si aplica.
[ ] Usa idempotencyKey por sourceEventId.
[ ] No encola workflow inactive.
[ ] No encola workflow archived.
[ ] No encola version draft/rejected/archived.
```

---

### 13.4. Scheduler

```text id="awb-test-scheduler"
[ ] Calcula daily window.
[ ] Calcula weekly window.
[ ] Calcula monthly window.
[ ] Calcula cronBasic válido.
[ ] Usa timezone del tenant.
[ ] Rechaza frecuencia menor a 60 minutos.
[ ] Genera scheduledWindowKey.
[ ] No duplica ventana.
[ ] Respeta workflow active.
[ ] Respeta quiet hours para notifications.
```

---

### 13.5. Execution engine

```text id="awb-test-execution-engine"
[ ] Execution queued -> running.
[ ] Evalúa conditionConfig true.
[ ] Omite workflow si conditionConfig false.
[ ] Ejecuta steps en orden.
[ ] Registra step succeeded.
[ ] Registra workflow succeeded.
[ ] Registra partiallySucceeded si step continueWorkflow falla.
[ ] Registra failed si failWorkflow falla.
[ ] No ejecuta action fuera de catálogo.
[ ] No ejecuta script.
[ ] No ejecuta rawSql.
[ ] No ejecuta action financiera prohibida.
```

---

### 13.6. Retry engine

```text id="awb-test-retry-engine"
[ ] Retry automático respeta maxRetries.
[ ] Retry usa backoff fixed.
[ ] Retry usa backoff exponential.
[ ] Retry no duplica steps succeeded con failedStepsOnly.
[ ] Retry fullWorkflow respeta idempotencia.
[ ] Error no recuperable no reintenta.
[ ] Al agotar retries crea dead letter.
```

---

### 13.7. Dead letter engine

```text id="awb-test-dead-letter-engine"
[ ] Crea dead letter al agotar retries.
[ ] Crea dead letter por error no recuperable.
[ ] Dead letter contiene error sanitizado.
[ ] Dead letter no contiene raw stack trace.
[ ] Dead letter no contiene payload raw sensible.
[ ] Resolve no reintenta automáticamente.
[ ] Ignore no borra execution.
```

---

## 14. Integration tests — External adapters

### 14.1. Tenants adapter

```text id="awb-test-adapter-tenants"
[ ] validateTenantIsActive acepta tenant active.
[ ] validateTenantIsActive rechaza tenant suspended.
[ ] getTenantTimezone devuelve America/Guayaquil por default.
[ ] getTenantTimezone usa setting efectivo si existe.
[ ] No permite tenantB en contexto tenantA.
```

---

### 14.2. Users adapter

```text id="awb-test-adapter-users"
[ ] getActorProfile resuelve actor.
[ ] validateApprover acepta boardMemberA con permiso.
[ ] validateApprover rechaza residentA1.
[ ] validateApprover rechaza boardMemberB para tenantA.
[ ] Manual run registra actor server-side.
```

---

### 14.3. Settings and Policies adapter

```text id="awb-test-adapter-settings-policies"
[ ] resolveAutomationPolicy devuelve enabled=true.
[ ] resolveWorkflowLimits devuelve límites.
[ ] resolveRetryPolicy devuelve maxRetries.
[ ] resolveQuietHoursPolicy devuelve quiet hours.
[ ] tenant suspended o automation disabled bloquea execution.
[ ] No recibe ni devuelve secrets.
```

---

### 14.4. Notifications adapter

```text id="awb-test-adapter-notifications"
[ ] sendToResident invoca módulo 012.
[ ] sendToUnit invoca módulo 012.
[ ] sendToRole invoca módulo 012.
[ ] Respeta quiet hours.
[ ] Critical alert puede saltar quiet hours si policy lo permite.
[ ] No envía payload sensible completo.
[ ] Retorna notificationId.
```

---

### 14.5. Reports adapter

```text id="awb-test-adapter-reports"
[ ] generateBasicReport invoca módulo 008.
[ ] generateAndStoreExport retorna reportId.
[ ] Report sensible requiere permiso/policy.
[ ] No devuelve storageKey.
[ ] No genera report cross-tenant.
```

---

### 14.6. Secure Document Storage adapter

```text id="awb-test-adapter-sds"
[ ] createExportDocument devuelve secureDocumentId.
[ ] secureDocumentId pertenece al tenant.
[ ] Response no incluye storageKey.
[ ] Response no incluye signedUrl persistente.
[ ] Falla SDS marca export failed.
[ ] failureReason se sanitiza.
```

---

### 14.7. Audit adapter

```text id="awb-test-adapter-audit"
[ ] Audit incluye tenantId.
[ ] Audit incluye actor cuando aplica.
[ ] Audit incluye action.
[ ] Audit incluye resourceType.
[ ] Audit incluye resourceId.
[ ] Audit incluye traceId.
[ ] Audit no incluye secrets.
[ ] Audit no incluye storageKey.
[ ] Audit no incluye raw payload sensible.
[ ] Audit no incluye datos cross-tenant.
```

---

## 15. API tests — Platform Trigger Definitions

```text id="awb-test-api-trigger-definitions"
[ ] GET /platform/automation-trigger-definitions requiere auth.
[ ] GET requiere automationTriggerDefinitions.read.
[ ] POST requiere automationTriggerDefinitions.create.
[ ] POST crea trigger definition.
[ ] POST rechaza triggerKey duplicado.
[ ] POST rechaza key inválida.
[ ] POST rechaza schema inválido.
[ ] POST rechaza schema con secret.
[ ] POST rechaza schema con rawSql.
[ ] POST rechaza schema con script.
[ ] POST rechaza public webhook.
[ ] PATCH requiere automationTriggerDefinitions.update.
[ ] PATCH rechaza status directo.
[ ] PATCH rechaza actor fields.
[ ] Archive requiere automationTriggerDefinitions.archive.
[ ] Archive no borra físicamente.
```

---

## 16. API tests — Platform Action Definitions

```text id="awb-test-api-action-definitions"
[ ] GET /platform/automation-action-definitions requiere auth.
[ ] GET requiere automationActionDefinitions.read.
[ ] POST requiere automationActionDefinitions.create.
[ ] POST crea action definition.
[ ] POST rechaza actionKey duplicado.
[ ] POST rechaza key inválida.
[ ] POST rechaza schema inválido.
[ ] POST rechaza schema con secret.
[ ] POST rechaza schema con rawSql.
[ ] POST rechaza schema con script.
[ ] POST rechaza isDestructive=true sin permiso reforzado.
[ ] POST rechaza isFinancial=true con payment execution.
[ ] POST rechaza isExternal=true en MVP si no permitido.
[ ] PATCH requiere automationActionDefinitions.update.
[ ] PATCH rechaza status directo.
[ ] Archive requiere automationActionDefinitions.archive.
```

---

## 17. API tests — Tenant Workflow Definitions

```text id="awb-test-api-workflow-definitions"
[ ] GET /tenant/automation-workflows requiere auth.
[ ] GET requiere TenantGuard.
[ ] GET requiere tenantWorkflows.read.
[ ] GET lista solo workflows del tenant actual.
[ ] GET no lista tenantB.

[ ] POST /tenant/automation-workflows requiere tenantWorkflows.create.
[ ] POST crea workflow draft.
[ ] POST genera tenantId server-side.
[ ] POST genera createdBy server-side.
[ ] POST rechaza workflowCode duplicado en tenant.
[ ] POST permite mismo workflowCode en tenant distinto.
[ ] POST rechaza tenantId.
[ ] POST rechaza actor fields.
[ ] POST rechaza status directo.
[ ] POST no acepta triggerConfig.
[ ] POST no acepta actionGraph.

[ ] GET /tenant/automation-workflows/{workflowId} requiere tenantWorkflows.read.
[ ] GET workflow tenantA funciona.
[ ] GET workflow tenantB desde tenantA retorna 404.

[ ] PATCH workflow requiere tenantWorkflows.updateDraft.
[ ] PATCH actualiza metadata.
[ ] PATCH no actualiza actionGraph.
[ ] PATCH no actualiza active version.
[ ] PATCH rechaza status directo.

[ ] Archive requiere tenantWorkflows.archive.
[ ] Archive no borra físicamente.
[ ] Archived workflow no ejecuta.
```

---

## 18. API tests — Tenant Workflow Versions

```text id="awb-test-api-workflow-versions"
[ ] GET versions requiere tenantWorkflows.read.
[ ] GET versions lista solo tenant actual.
[ ] GET versions no lista tenantB.

[ ] POST version requiere tenantWorkflows.updateDraft.
[ ] POST crea draft.
[ ] POST genera versionNumber server-side.
[ ] POST genera versionLabel server-side.
[ ] POST valida triggerKey.
[ ] POST valida triggerConfig.
[ ] POST valida conditionConfig.
[ ] POST valida actionGraph.
[ ] POST valida retryPolicy.
[ ] POST rechaza tenantId.
[ ] POST rechaza versionNumber.
[ ] POST rechaza status directo.
[ ] POST rechaza secret.
[ ] POST rechaza rawSql.
[ ] POST rechaza script.
[ ] POST rechaza executableCode.
[ ] POST rechaza action fuera de catálogo.
[ ] POST rechaza trigger fuera de catálogo.
[ ] POST no modifica active version.

[ ] PATCH version requiere tenantWorkflows.updateDraft.
[ ] PATCH solo edita draft.
[ ] PATCH active retorna 409.
[ ] PATCH scheduled retorna 409.
[ ] PATCH rejected retorna 409.
[ ] PATCH archived retorna 409.

[ ] submit-review requiere tenantWorkflows.submitReview.
[ ] submit-review draft -> reviewReady.
[ ] submit-review valida configuración nuevamente.

[ ] approve requiere tenantWorkflows.approve.
[ ] approve sensitive requiere tenantWorkflows.approveSensitive.
[ ] approve reviewReady -> approved.
[ ] approve rejected retorna 409.
[ ] approve archived retorna 409.
[ ] approve registra approvedBy server-side.

[ ] reject requiere tenantWorkflows.reject.
[ ] reject reviewReady -> rejected.
[ ] rejected no puede activarse.
```

---

## 19. API tests — Activation and deactivation

```text id="awb-test-api-activation"
[ ] activate requiere tenantWorkflows.activate.
[ ] activate sensitive requiere tenantWorkflows.activateSensitive.
[ ] activate approved con effectiveFrom <= now marca active.
[ ] activate approved con effectiveFrom futuro marca scheduled.
[ ] activate crea TenantWorkflowActivation.
[ ] activate ajusta effectiveUntil de versión anterior.
[ ] activate workflow archived retorna 409.
[ ] activate rejected retorna 409.
[ ] activate archived retorna 409.
[ ] activate cross-tenant retorna 404.
[ ] activate con overlap retorna 409.
[ ] activate audita tenantWorkflowVersion.activated.

[ ] deactivate requiere tenantWorkflows.deactivate.
[ ] deactivate active funciona.
[ ] deactivate scheduled funciona.
[ ] deactivate draft retorna 409.
[ ] deactivate no borra historial.
[ ] deactivate audita tenantWorkflowVersion.deactivated.
```

---

## 20. API tests — Executions

```text id="awb-test-api-executions"
[ ] GET /tenant/automation-executions requiere auth.
[ ] GET requiere tenantWorkflowExecutions.read.
[ ] GET lista solo executions del tenant actual.
[ ] GET no devuelve input raw sensible.
[ ] GET no devuelve output raw sensible.
[ ] GET no devuelve secrets.
[ ] GET no devuelve storageKey.

[ ] GET executionId requiere tenantWorkflowExecutions.read.
[ ] GET execution tenantA funciona.
[ ] GET execution tenantB desde tenantA retorna 404.
[ ] includeSteps=true incluye steps tenant-scoped.
[ ] includeLogs=true requiere tenantWorkflowLogs.read.
[ ] includeLogs no expone raw payload.

[ ] POST /tenant/automation-workflows/{workflowId}/run requiere runManual.
[ ] manual run genera manualRunId server-side.
[ ] manual run genera idempotencyKey server-side.
[ ] manual run encola execution.
[ ] manual run requiere reason si workflow sensitive.
[ ] manual run sensitive requiere runSensitive.
[ ] manual run rechaza input con secrets.
[ ] manual run rechaza input con scripts.
[ ] manual run rechaza input con rawSql.
[ ] manual run workflow tenantB retorna 404.

[ ] cancel execution requiere tenantWorkflowExecutions.cancel.
[ ] cancel queued funciona.
[ ] cancel running es best-effort.
[ ] cancel succeeded retorna 409.
[ ] cancel tenantB desde tenantA retorna 404.

[ ] retry execution requiere tenantWorkflowExecutions.retry.
[ ] retry sensitive requiere retrySensitive.
[ ] retry failed funciona.
[ ] retry partiallySucceeded funciona.
[ ] retry succeeded retorna 409.
[ ] retry respeta maxRetries.
[ ] retry max excedido retorna 409.
[ ] retry no duplica steps succeeded con failedStepsOnly.
```

---

## 21. API tests — Dead Letters

```text id="awb-test-api-dead-letters"
[ ] GET /tenant/automation-dead-letters requiere tenantWorkflowExecutions.read.
[ ] GET lista solo dead letters del tenant actual.
[ ] GET no lista tenantB.
[ ] GET deadLetterId tenantA funciona.
[ ] GET deadLetterId tenantB desde tenantA retorna 404.
[ ] GET no devuelve raw stack trace.
[ ] GET no devuelve raw payload sensible.

[ ] resolve requiere tenantWorkflowExecutions.resolveDeadLetter.
[ ] resolve open funciona.
[ ] resolve underReview funciona.
[ ] resolve resolved retorna 409.
[ ] resolve requiere reason.
[ ] resolve no reintenta automáticamente.
[ ] resolve audita tenantWorkflowDeadLetter.resolved.

[ ] ignore requiere tenantWorkflowExecutions.resolveDeadLetter.
[ ] ignore open funciona.
[ ] ignore requiere reason.
[ ] ignore no borra execution.
[ ] ignore audita tenantWorkflowDeadLetter.ignored.
```

---

## 22. API tests — Exports

```text id="awb-test-api-exports"
[ ] GET /tenant/automation-exports requiere tenantWorkflowExports.read.
[ ] GET lista solo exports del tenant actual.
[ ] GET export tenantB desde tenantA retorna 404.
[ ] GET completed devuelve secureDocumentId.
[ ] GET no devuelve storageKey.
[ ] GET no devuelve signedUrl persistente.

[ ] POST /tenant/automation-exports requiere tenantWorkflowExports.create.
[ ] POST export workflows funciona.
[ ] POST export workflowVersions funciona.
[ ] POST export executions funciona.
[ ] POST export failedExecutions funciona.
[ ] POST export deadLetters funciona.
[ ] POST export auditSnapshot requiere reason.
[ ] POST export fullAutomationHistory requiere reason.
[ ] POST includeSensitive=true requiere tenantWorkflowExports.exportSensitive.
[ ] POST sanitiza filters.
[ ] POST rechaza filters con tenantId.
[ ] POST rechaza filters con rawSql.
[ ] POST rechaza filters con script.
[ ] POST crea WorkflowExport.
[ ] POST usa Secure Document Storage.
[ ] POST no devuelve storageKey.
[ ] POST audita tenantWorkflowExport.created.
```

---

## 23. Security tests — Auth and permissions

```text id="awb-test-security-auth"
[ ] Toda ruta platform requiere Bearer token.
[ ] Toda ruta tenant requiere Bearer token.
[ ] Usuario anónimo recibe 401.
[ ] Usuario autenticado sin permiso recibe 403.
[ ] Resident no accede Tenant Workflows API.
[ ] Resident no accede Platform API.
[ ] TenantAdmin sin approveSensitive no aprueba workflow sensible.
[ ] TenantAdmin sin activateSensitive no activa workflow sensible.
[ ] TenantAdmin sin runSensitive no ejecuta workflow sensible manualmente.
[ ] TenantAdmin sin exportSensitive no exporta datos sensibles.
[ ] PlatformSupportReadOnly no modifica catálogo.
[ ] PlatformAdmin no accede automáticamente a tenant workflows sin contexto y permiso.
```

---

## 24. Security tests — Forbidden fields

Todos los endpoints deben rechazar:

```text id="awb-test-security-forbidden-fields"
[ ] tenantId.
[ ] createdBy.
[ ] updatedBy.
[ ] approvedBy.
[ ] activatedBy.
[ ] deactivatedBy.
[ ] archivedBy.
[ ] triggeredBy.
[ ] status directo fuera de endpoint de transición.
[ ] versionNumber.
[ ] versionLabel.
[ ] executionId arbitrario para crear ejecución.
[ ] stepStatus arbitrario.
[ ] storageKey.
[ ] signedUrl.
[ ] secret.
[ ] token.
[ ] password.
[ ] apiKey.
[ ] privateKey.
[ ] clientSecret.
[ ] webhookSecret.
[ ] databaseUrl.
[ ] rawSql.
[ ] sql.
[ ] script.
[ ] javascript.
[ ] functionBody.
[ ] executableCode.
[ ] eval.
[ ] Function.
[ ] cronCommand.
[ ] shellCommand.
[ ] bashCommand.
[ ] pythonCode.
[ ] nodeCode.
[ ] paymentId.
[ ] journalEntryId.
[ ] bankTransactionId.
[ ] reconciliationMatchId.
[ ] gateOpenCommand.
[ ] hardwareDeviceCommand.
[ ] biometricTemplate.
[ ] faceEmbedding.
[ ] externalAiEnabled.
[ ] externalAiRealDataAllowed.
```

Respuesta esperada:

```http id="awb-test-security-forbidden-response"
422 Unprocessable Entity
```

---

## 25. Security tests — Multitenancy

```text id="awb-test-security-multitenancy"
[ ] tenantA no lee workflow tenantB.
[ ] tenantA no actualiza workflow tenantB.
[ ] tenantA no archiva workflow tenantB.
[ ] tenantA no lee version tenantB.
[ ] tenantA no actualiza draft tenantB.
[ ] tenantA no aprueba version tenantB.
[ ] tenantA no activa version tenantB.
[ ] tenantA no desactiva version tenantB.
[ ] tenantA no lee activation tenantB.
[ ] tenantA no lee execution tenantB.
[ ] tenantA no cancela execution tenantB.
[ ] tenantA no reintenta execution tenantB.
[ ] tenantA no lee step tenantB.
[ ] tenantA no lee logs tenantB.
[ ] tenantA no lee dead letter tenantB.
[ ] tenantA no resuelve dead letter tenantB.
[ ] tenantA no ignora dead letter tenantB.
[ ] tenantA no lee export tenantB.
[ ] tenantA no exporta workflow tenantB.
[ ] tenantA no consume sourceEventId tenantB.
```

Respuesta esperada:

```http id="awb-test-cross-tenant-response"
404 Not Found
```

---

## 26. Security tests — No public and no WordPress

### 26.1. No public endpoints

```text id="awb-test-security-no-public"
[ ] GET /api/v1/public/automation-workflows devuelve 404.
[ ] GET /api/v1/public/automation-executions devuelve 404.
[ ] GET /api/v1/public/automation-webhooks devuelve 404.
[ ] POST /api/v1/public/automation-webhooks/{webhookKey} devuelve 404.
[ ] GET /api/v1/public/tenants/{slug}/automation-workflows devuelve 404.
[ ] GET /api/v1/public/tenants/{slug}/automation-executions devuelve 404.
```

---

### 26.2. No WordPress access

```text id="awb-test-security-no-wordpress"
[ ] CORS no permite WordPress público para /tenant/automation-workflows.
[ ] CORS no permite WordPress público para /tenant/automation-executions.
[ ] CORS no permite WordPress público para /tenant/automation-dead-letters.
[ ] CORS no permite WordPress público para /tenant/automation-exports.
[ ] CORS no permite WordPress público para /platform/automation-trigger-definitions.
[ ] CORS no permite WordPress público para /platform/automation-action-definitions.
[ ] WordPress session no autentica Core.
[ ] WordPress público no ejecuta workflows.
[ ] WordPress público no expone webhooks.
```

---

## 27. Security tests — No secrets and no executable payload

### 27.1. No secrets

```text id="awb-test-security-no-secrets"
[ ] TriggerDefinition rechaza secret.
[ ] TriggerDefinition rechaza token.
[ ] TriggerDefinition rechaza password.
[ ] TriggerDefinition rechaza apiKey.
[ ] TriggerDefinition rechaza clientSecret.
[ ] ActionDefinition rechaza secret.
[ ] WorkflowVersion rechaza secrets en triggerConfig.
[ ] WorkflowVersion rechaza secrets en conditionConfig.
[ ] WorkflowVersion rechaza secrets en actionGraph.
[ ] ManualRun input rechaza secrets.
[ ] Execution inputSanitized no contiene secrets.
[ ] Step outputSanitized no contiene secrets.
[ ] DeadLetter lastErrorSanitized no contiene secrets.
[ ] Export excluye secrets.
[ ] Logs excluyen secrets.
[ ] Audit excluye secrets.
```

---

### 27.2. No executable payload

```text id="awb-test-security-no-executable"
[ ] Rechaza rawSql.
[ ] Rechaza sql arbitrario.
[ ] Rechaza script.
[ ] Rechaza javascript.
[ ] Rechaza functionBody.
[ ] Rechaza executableCode.
[ ] Rechaza eval.
[ ] Rechaza Function.
[ ] Rechaza shellCommand.
[ ] Rechaza cronCommand.
[ ] Rechaza bashCommand.
[ ] Rechaza pythonCode.
[ ] Rechaza nodeCode.
[ ] No existe executor de scripts.
[ ] No existe eval.
[ ] No existe Function constructor.
[ ] No existe SQL dinámico desde workflow payload.
```

---

### 27.3. No public webhooks

```text id="awb-test-security-no-public-webhooks"
[ ] AUTOMATION_WORKFLOWS_PUBLIC_WEBHOOKS_ENABLED=false.
[ ] Boot falla si AUTOMATION_WORKFLOWS_PUBLIC_WEBHOOKS_ENABLED=true.
[ ] No existe tabla public_webhooks.
[ ] No existe endpoint public webhook.
[ ] No existe webhookKey público.
[ ] No existe secret embebido de webhook.
```

---

### 27.4. No external AI

```text id="awb-test-security-no-ai"
[ ] AUTOMATION_WORKFLOWS_EXTERNAL_AI_ENABLED=false.
[ ] Boot falla si AUTOMATION_WORKFLOWS_EXTERNAL_AI_ENABLED=true.
[ ] Ningún DTO acepta externalAiEnabled.
[ ] Ningún DTO acepta externalAiRealDataAllowed.
[ ] Ninguna action envía payload real a IA externa.
[ ] Ningún worker invoca agente IA externo con datos reales.
[ ] Ningún export se envía a IA externa.
```

---

## 28. Boundary tests — No prohibited side effects

```text id="awb-test-boundary-no-side-effects"
[ ] Workflow no crea Payment.
[ ] Workflow no valida Payment automáticamente.
[ ] Workflow no reversa Payment.
[ ] Workflow no crea SupplierPayable.
[ ] Workflow no crea SupplierPaymentOrder.
[ ] Workflow no crea SupplierPaymentEvidence.
[ ] Workflow no crea JournalEntry.
[ ] Workflow no crea JournalEntryLine.
[ ] Workflow no confirma Bank Reconciliation.
[ ] Workflow no crea ReconciliationMatch confirmado.
[ ] Workflow no genera Charges automáticamente desde workflow.
[ ] Workflow no modifica InventoryMovement directamente.
[ ] Workflow no crea StockAdjustment directamente.
[ ] Workflow no modifica AccessEvent directamente.
[ ] Workflow no crea AccessCheckIn.
[ ] Workflow no crea AccessCheckOut.
[ ] Workflow no abre portones.
[ ] Workflow no controla hardware.
[ ] Workflow no procesa biometría.
[ ] Workflow no ejecuta reconocimiento facial.
```

---

## 29. Audit tests

### 29.1. Eventos mínimos

```text id="awb-test-audit-events"
[ ] automationTriggerDefinition.created.
[ ] automationTriggerDefinition.updated.
[ ] automationTriggerDefinition.archived.
[ ] automationActionDefinition.created.
[ ] automationActionDefinition.updated.
[ ] automationActionDefinition.archived.
[ ] tenantWorkflow.created.
[ ] tenantWorkflow.updated.
[ ] tenantWorkflow.archived.
[ ] tenantWorkflowVersion.created.
[ ] tenantWorkflowVersion.updated.
[ ] tenantWorkflowVersion.submittedForReview.
[ ] tenantWorkflowVersion.approved.
[ ] tenantWorkflowVersion.rejected.
[ ] tenantWorkflowVersion.activated.
[ ] tenantWorkflowVersion.deactivated.
[ ] tenantWorkflowVersion.superseded.
[ ] tenantWorkflowVersion.archived.
[ ] tenantWorkflowExecution.queued.
[ ] tenantWorkflowExecution.started.
[ ] tenantWorkflowExecution.succeeded.
[ ] tenantWorkflowExecution.partiallySucceeded.
[ ] tenantWorkflowExecution.failed.
[ ] tenantWorkflowExecution.cancelled.
[ ] tenantWorkflowExecution.retrying.
[ ] tenantWorkflowExecution.deadLettered.
[ ] tenantWorkflowStep.succeeded.
[ ] tenantWorkflowStep.failed.
[ ] tenantWorkflowDeadLetter.created.
[ ] tenantWorkflowDeadLetter.resolved.
[ ] tenantWorkflowDeadLetter.ignored.
[ ] tenantWorkflowExport.created.
[ ] tenantWorkflowExport.completed.
[ ] tenantWorkflowExport.failed.
```

---

### 29.2. Audit metadata

```text id="awb-test-audit-metadata"
[ ] Audit incluye tenantId cuando aplica.
[ ] Audit incluye actorUserProfileId cuando aplica.
[ ] Audit incluye action.
[ ] Audit incluye resourceType.
[ ] Audit incluye resourceId.
[ ] Audit incluye outcome.
[ ] Audit incluye traceId.
[ ] Audit incluye workflowId si aplica.
[ ] Audit incluye workflowVersionId si aplica.
[ ] Audit incluye executionId si aplica.
[ ] Audit incluye triggerKey si aplica.
[ ] Audit incluye actionKey si aplica.
[ ] Audit no incluye secret.
[ ] Audit no incluye token.
[ ] Audit no incluye password.
[ ] Audit no incluye apiKey.
[ ] Audit no incluye storageKey.
[ ] Audit no incluye rawSql.
[ ] Audit no incluye script.
[ ] Audit no incluye raw payload sensible.
```

---

## 30. Observability tests

### 30.1. Logs

```text id="awb-test-observability-logs"
[ ] workflow.execution.queued loggea action.
[ ] workflow.execution.started loggea workflowCode.
[ ] workflow.execution.completed loggea durationMs.
[ ] workflow.execution.failed loggea errorCode.
[ ] workflow.execution.retrying loggea retryCount.
[ ] workflow.execution.deadLettered loggea reasonCode.
[ ] workflow.step.succeeded loggea actionKey.
[ ] workflow.step.failed loggea actionKey y errorCode.
[ ] workflow.activation.created loggea status.
[ ] workflow.export.completed loggea exportType.
[ ] Logs no contienen secrets.
[ ] Logs no contienen raw payload.
[ ] Logs no contienen storageKey.
[ ] Logs no contienen authorization header.
[ ] Logs no contienen cookies.
```

---

### 30.2. Metrics

```text id="awb-test-observability-metrics"
[ ] automation_workflows_created_total incrementa.
[ ] automation_workflow_versions_created_total incrementa.
[ ] automation_workflow_activations_total incrementa.
[ ] automation_executions_queued_total incrementa.
[ ] automation_executions_succeeded_total incrementa.
[ ] automation_executions_failed_total incrementa.
[ ] automation_executions_dead_lettered_total incrementa.
[ ] automation_steps_succeeded_total incrementa.
[ ] automation_steps_failed_total incrementa.
[ ] automation_retries_total incrementa.
[ ] automation_exports_total incrementa.
[ ] automation_queue_depth se registra.
[ ] automation_execution_duration_ms se registra.
[ ] automation_step_duration_ms se registra.
[ ] Metrics usan labels permitidos.
[ ] Metrics no usan tenantId.
[ ] Metrics no usan userId.
[ ] Metrics no usan workflowId.
[ ] Metrics no usan executionId.
[ ] Metrics no usan idempotencyKey.
[ ] Metrics no usan traceId.
```

---

## 31. OpenAPI contract tests

```text id="awb-test-openapi"
[ ] OpenAPI documenta Platform Automation Trigger Definitions.
[ ] OpenAPI documenta Platform Automation Action Definitions.
[ ] OpenAPI documenta Tenant Automation Workflows.
[ ] OpenAPI documenta Tenant Automation Workflow Versions.
[ ] OpenAPI documenta Tenant Automation Executions.
[ ] OpenAPI documenta Tenant Automation Dead Letters.
[ ] OpenAPI documenta Tenant Automation Exports.
[ ] OpenAPI no documenta /api/v1/public/automation-workflows.
[ ] OpenAPI no documenta /api/v1/public/automation-executions.
[ ] OpenAPI no documenta /api/v1/public/automation-webhooks.
[ ] OpenAPI incluye x-auth-required=true.
[ ] OpenAPI incluye x-automation-workflows-basic=true.
[ ] OpenAPI incluye x-public-exposure=false.
[ ] OpenAPI incluye x-wordpress-access=false.
[ ] OpenAPI incluye x-secrets-storage=false.
[ ] OpenAPI incluye x-executable-workflow-payload=false.
[ ] OpenAPI incluye x-raw-sql-allowed=false.
[ ] OpenAPI incluye x-public-webhooks=false.
[ ] OpenAPI incluye x-payment-execution=false.
[ ] OpenAPI incluye x-accounting-execution=false.
[ ] OpenAPI incluye x-bank-reconciliation-confirmation=false.
[ ] OpenAPI incluye x-hardware-control=false.
[ ] OpenAPI incluye x-external-ai-real-data=false.
[ ] Rutas platform incluyen x-platform-scope=true.
[ ] Rutas tenant incluyen x-tenant-scope=true.
[ ] Rutas execution incluyen x-idempotency-required=true.
[ ] Rutas execution incluyen x-queue-backed=true.
[ ] Rutas export incluyen x-secure-document-storage=true.
[ ] Rutas export incluyen x-storage-key-exposed=false.
[ ] OpenAPI no documenta tenantId en DTOs externos.
[ ] OpenAPI no documenta actor fields.
[ ] OpenAPI no documenta versionNumber desde cliente.
[ ] OpenAPI no documenta status directo.
[ ] OpenAPI no documenta storageKey.
[ ] OpenAPI no documenta secrets.
[ ] OpenAPI no documenta rawSql.
[ ] OpenAPI no documenta scripts.
[ ] OpenAPI no documenta executableCode.
[ ] OpenAPI no documenta externalAiEnabled.
```

---

## 32. Performance tests

### 32.1. Dataset mínimo

```text id="awb-test-performance-dataset"
Global:
- 50 trigger definitions.
- 30 action definitions.

tenantA:
- 25 workflow definitions.
- 75 workflow versions históricas.
- 25 active workflow versions.
- 100 activations.
- 10,000 executions.
- 25,000 step executions.
- 50,000 execution logs.
- 500 dead letters.
- 100 exports.

tenantB:
- dataset parcial para aislamiento.
```

---

### 32.2. Objetivos

```text id="awb-test-performance-objectives"
[ ] Encolar ejecución p95 < 500 ms.
[ ] Buscar workflows activos por trigger p95 < 500 ms.
[ ] Listar workflows p95 < 800 ms.
[ ] Listar workflow versions p95 < 800 ms.
[ ] Listar executions p95 < 1200 ms.
[ ] Listar dead letters p95 < 1200 ms.
[ ] Procesar step simple p95 < 2000 ms.
[ ] Export pequeño p95 < 3000 ms.
[ ] pageSize máximo 100.
[ ] No existe N+1 evidente.
[ ] Payloads JSONB se mantienen acotados.
[ ] Queue depth se registra.
```

---

## 33. Concurrency tests

```text id="awb-test-concurrency"
[ ] Dos usuarios crean versionNumber para mismo workflow simultáneamente: no duplica.
[ ] Dos usuarios activan versiones distintas del mismo workflow: solo una queda efectiva.
[ ] Dos usuarios aprueban y rechazan la misma version simultáneamente: solo una transición válida.
[ ] Un usuario archiva workflow mientras otro activa version: consistencia por status.
[ ] Mismo evento llega dos veces: solo una execution.
[ ] Scheduler intenta ejecutar misma ventana dos veces: solo una execution.
[ ] Manual run duplicado con misma request controlada: idempotency conserva consistencia.
[ ] Retry automático y retry manual simultáneos: no duplica steps.
[ ] Cancelación mientras execution está running: estado final consistente.
[ ] Step termina después de cancelación: no cambia execution a succeeded indebidamente.
[ ] Dead letter se resuelve mientras retry se solicita: solo una transición válida.
[ ] Export se solicita dos veces con mismos filtros: ambas solicitudes controladas sin duplicar archivo si policy decide dedupe.
```

---

## 34. Regression tests

```text id="awb-test-regression"
[ ] Cambio en 001-tenants no rompe tenant validation.
[ ] Cambio en 002-users-roles no rompe permissions.
[ ] Cambio en 007-audit no filtra secrets.
[ ] Cambio en 008-basic-reports no expone storageKey.
[ ] Cambio en 012-communications-notifications no envía payload sensible.
[ ] Cambio en 016-secure-document-storage no expone storageKey.
[ ] Cambio en 025-tenant-settings-policies no rompe quiet hours.
[ ] Cambio en 025-tenant-settings-policies no rompe workflow limits.
[ ] Cambio en DTO validation no permite tenantId.
[ ] Cambio en OpenAPI no documenta public endpoints.
[ ] Cambio en CORS no permite WordPress público.
[ ] Cambio en queue adapter no duplica idempotencyKey.
[ ] Cambio en action catalog no habilita payment execution.
[ ] Cambio en action catalog no habilita hardware control.
```

---

## 35. Smoke flows

### 35.1. Smoke flow — seed catalog

```text id="awb-smoke-seed-catalog"
[ ] PlatformAdmin crea triggerDefinition payments.paymentValidated.
[ ] PlatformAdmin crea actionDefinition notifications.sendToResident.
[ ] Sistema valida schemas.
[ ] Sistema rechaza secrets.
[ ] Sistema rechaza scripts.
[ ] Sistema audita definitions.
```

---

### 35.2. Smoke flow — crear workflow y versión

```text id="awb-smoke-create-workflow-version"
[ ] TenantAdminA crea workflow payment-validation-notification.
[ ] Sistema crea workflow draft.
[ ] TenantAdminA crea version draft.
[ ] Sistema valida triggerConfig.
[ ] Sistema valida conditionConfig.
[ ] Sistema valida actionGraph.
[ ] Sistema genera versionNumber.
[ ] Sistema audita tenantWorkflowVersion.created.
```

---

### 35.3. Smoke flow — aprobación y activación

```text id="awb-smoke-approval-activation"
[ ] TenantAdminA envía version a review.
[ ] BoardMemberA aprueba version.
[ ] TenantAdminA activa version.
[ ] Sistema crea activation.
[ ] Sistema marca version active.
[ ] Sistema marca workflow active.
[ ] Sistema audita aprobación y activación.
```

---

### 35.4. Smoke flow — event-driven execution

```text id="awb-smoke-event-execution"
[ ] Módulo Payments mock publica payments.paymentValidated.
[ ] Evento incluye tenantId.
[ ] Evento incluye sourceEventId.
[ ] Dispatcher encuentra workflow active.
[ ] Condition evaluator retorna true.
[ ] Sistema genera idempotencyKey.
[ ] Sistema encola execution.
[ ] Worker ejecuta notifications.sendToResident.
[ ] Step termina succeeded.
[ ] Execution termina succeeded.
[ ] Audit registra ejecución.
```

---

### 35.5. Smoke flow — scheduled execution

```text id="awb-smoke-scheduled-execution"
[ ] TenantAdminA crea workflow schedule.monthly.
[ ] Sistema activa version.
[ ] Scheduler calcula ventana con timezone America/Guayaquil.
[ ] Sistema genera scheduledWindowKey.
[ ] Sistema encola execution.
[ ] Worker ejecuta reports.generateBasicReport.
[ ] Sistema guarda secureDocumentId si aplica.
[ ] Execution termina succeeded.
```

---

### 35.6. Smoke flow — manual run

```text id="awb-smoke-manual-run"
[ ] TenantAdminA solicita manual run.
[ ] Sistema valida permiso.
[ ] Sistema exige reason si sensible.
[ ] Sistema genera manualRunId.
[ ] Sistema genera idempotencyKey.
[ ] Sistema encola execution.
[ ] Worker ejecuta steps.
[ ] Execution termina succeeded.
```

---

### 35.7. Smoke flow — retry and dead letter

```text id="awb-smoke-retry-dead-letter"
[ ] Action mock falla con error recuperable.
[ ] Sistema marca execution failed.
[ ] Sistema reintenta según retryPolicy.
[ ] Action falla hasta maxRetries.
[ ] Sistema crea dead letter.
[ ] Admin consulta dead letter.
[ ] Admin resuelve dead letter.
[ ] Sistema audita resolución.
```

---

### 35.8. Smoke flow — export

```text id="awb-smoke-export"
[ ] TenantAdminA solicita export executions.
[ ] Sistema valida permiso.
[ ] Sistema sanitiza filtros.
[ ] Sistema crea WorkflowExport.
[ ] Sistema crea SecureDocument.
[ ] Response devuelve secureDocumentId.
[ ] Response no contiene storageKey.
[ ] Sistema audita export.
```

---

## 36. CI gates

El pipeline debe ejecutar:

```text id="awb-test-ci-gates"
[ ] unit tests.
[ ] value object tests.
[ ] trigger/action validator tests.
[ ] condition evaluator tests.
[ ] action graph validator tests.
[ ] retry policy tests.
[ ] idempotency tests.
[ ] sanitizer tests.
[ ] entity tests.
[ ] state machine tests.
[ ] domain policy tests.
[ ] repository tests.
[ ] queue adapter tests.
[ ] Redis lock tests.
[ ] scheduler tests.
[ ] event dispatcher tests.
[ ] execution engine tests.
[ ] retry/dead letter tests.
[ ] integration adapter tests.
[ ] Platform API tests.
[ ] Tenant Workflow API tests.
[ ] Tenant Workflow Version API tests.
[ ] Execution API tests.
[ ] Dead Letter API tests.
[ ] Export API tests.
[ ] authz tests.
[ ] sensitive permission tests.
[ ] multitenancy tests.
[ ] no secrets tests.
[ ] no executable payload tests.
[ ] no raw SQL tests.
[ ] no public tests.
[ ] no public webhooks tests.
[ ] no WordPress tests.
[ ] no storageKey tests.
[ ] no payment execution tests.
[ ] no accounting execution tests.
[ ] no bank reconciliation confirmation tests.
[ ] no hardware control tests.
[ ] no external AI tests.
[ ] audit tests.
[ ] observability tests.
[ ] OpenAPI contract tests.
[ ] performance baseline tests.
[ ] concurrency tests críticos.
[ ] smoke tests.
```

---

## 37. CI security gates

El pipeline debe fallar si:

```text id="awb-test-ci-security-gates"
[ ] Algún DTO acepta tenantId.
[ ] Algún DTO acepta actor fields.
[ ] Algún DTO acepta versionNumber desde cliente.
[ ] Algún DTO acepta versionLabel desde cliente.
[ ] Algún DTO acepta status directo fuera de transición.
[ ] Algún DTO acepta storageKey.
[ ] Algún DTO acepta signedUrl.
[ ] Algún DTO acepta secret.
[ ] Algún DTO acepta token.
[ ] Algún DTO acepta password.
[ ] Algún DTO acepta apiKey.
[ ] Algún DTO acepta privateKey.
[ ] Algún DTO acepta clientSecret.
[ ] Algún DTO acepta rawSql.
[ ] Algún DTO acepta script.
[ ] Algún DTO acepta functionBody.
[ ] Algún DTO acepta executableCode.
[ ] Algún DTO acepta externalAiEnabled.
[ ] Algún DTO acepta externalAiRealDataAllowed.
[ ] API permite workflows cross-tenant.
[ ] API permite versions cross-tenant.
[ ] API permite activations cross-tenant.
[ ] API permite executions cross-tenant.
[ ] API permite steps cross-tenant.
[ ] API permite logs cross-tenant.
[ ] API permite dead letters cross-tenant.
[ ] API permite exports cross-tenant.
[ ] API crea endpoint público.
[ ] API crea public webhook.
[ ] API permite WordPress público.
[ ] API expone storageKey.
[ ] API expone signedUrl persistente.
[ ] Logs contienen secrets.
[ ] Audit contiene secrets.
[ ] Export contiene secrets.
[ ] TriggerConfig permite rawSql.
[ ] ConditionConfig permite script.
[ ] ActionGraph permite executableCode.
[ ] ActionGraph permite action fuera de catálogo.
[ ] Workflow ejecuta Payment.
[ ] Workflow valida Payment automáticamente.
[ ] Workflow reversa Payment.
[ ] Workflow crea SupplierPaymentOrder.
[ ] Workflow crea JournalEntry.
[ ] Workflow confirma Bank Reconciliation.
[ ] Workflow modifica stock directamente.
[ ] Workflow modifica AccessEvent directamente.
[ ] Workflow controla hardware.
[ ] Workflow llama IA externa con datos reales.
[ ] Workflow permite retries infinitos.
[ ] Workflow omite idempotencyKey.
[ ] Workflow duplica ejecución del mismo evento.
```

---

## 38. Cobertura mínima

```text id="awb-test-coverage"
- Value objects: >= 95%.
- Validators: >= 95%.
- Sanitizers: >= 95%.
- Entities: >= 90%.
- State machines: >= 95%.
- Domain policies: >= 95%.
- Idempotency service: >= 95%.
- Scheduler service: >= 90%.
- Execution engine: >= 90%.
- Retry/dead letter services: >= 90%.
- Queue adapters: >= 85%.
- Repository integration: >= 85%.
- API controllers: >= 85%.
- Security tests críticos: 100% passing.
- Multitenancy tests críticos: 100% passing.
- No secrets tests críticos: 100% passing.
- No executable payload tests críticos: 100% passing.
- No prohibited side effects tests: 100% passing.
- OpenAPI contract tests críticos: 100% passing.
```

---

## 39. Matriz de trazabilidad

| Área                   | Spec | Plan | Data Model | API Contract | Tests                    |
| ---------------------- | ---- | ---- | ---------- | ------------ | ------------------------ |
| Trigger definitions    | Sí   | Sí   | Sí         | Sí           | Unit / API / Security    |
| Action definitions     | Sí   | Sí   | Sí         | Sí           | Unit / API / Security    |
| Workflow definitions   | Sí   | Sí   | Sí         | Sí           | Unit / API / MT          |
| Workflow versions      | Sí   | Sí   | Sí         | Sí           | Unit / API / Versioning  |
| Workflow activations   | Sí   | Sí   | Sí         | Sí           | Unit / API / Concurrency |
| Event dispatcher       | Sí   | Sí   | Sí         | Sí           | Integration / Queue      |
| Scheduled workflows    | Sí   | Sí   | Sí         | Sí           | Integration / Scheduler  |
| Manual workflows       | Sí   | Sí   | Sí         | Sí           | API / Authz              |
| Executions             | Sí   | Sí   | Sí         | Sí           | Integration / API        |
| Step executions        | Sí   | Sí   | Sí         | Sí           | Integration / Engine     |
| Retry policy           | Sí   | Sí   | Sí         | Sí           | Unit / Integration       |
| Dead letters           | Sí   | Sí   | Sí         | Sí           | API / Integration        |
| Exports via SDS        | Sí   | Sí   | Sí         | Sí           | API / SDS / Security     |
| Audit                  | Sí   | Sí   | Sí         | Sí           | Audit tests              |
| Observability          | Sí   | Sí   | Sí         | Sí           | Logs / Metrics           |
| No secrets             | Sí   | Sí   | Sí         | Sí           | Security                 |
| No executable payload  | Sí   | Sí   | Sí         | Sí           | Security                 |
| No public endpoints    | Sí   | Sí   | Sí         | Sí           | Security                 |
| No public webhooks     | Sí   | Sí   | Sí         | Sí           | Security                 |
| No WordPress access    | Sí   | Sí   | Sí         | Sí           | Security                 |
| No financial execution | Sí   | Sí   | Sí         | Sí           | Boundary                 |
| No hardware control    | Sí   | Sí   | Sí         | Sí           | Boundary                 |
| No external AI         | Sí   | Sí   | Sí         | Sí           | Security                 |

---

## 40. Definition of Done de pruebas

```text id="awb-test-dod"
[ ] Tests unitarios implementados.
[ ] Tests de value objects implementados.
[ ] Tests de trigger/action validators implementados.
[ ] Tests de condition evaluator implementados.
[ ] Tests de action graph validator implementados.
[ ] Tests de retry policy implementados.
[ ] Tests de idempotency key builder implementados.
[ ] Tests de sanitizers implementados.
[ ] Tests de entities implementados.
[ ] Tests de state machines implementados.
[ ] Tests de domain policies implementados.
[ ] Tests de repositories implementados.
[ ] Tests de PostgreSQL constraints implementados.
[ ] Tests de partial indexes implementados.
[ ] Tests de queue adapter implementados.
[ ] Tests de Redis locks implementados.
[ ] Tests de scheduler implementados.
[ ] Tests de event dispatcher implementados.
[ ] Tests de execution engine implementados.
[ ] Tests de step execution implementados.
[ ] Tests de retry engine implementados.
[ ] Tests de dead letter implementados.
[ ] Tests de external adapters implementados.
[ ] Tests Platform API implementados.
[ ] Tests Tenant Workflow API implementados.
[ ] Tests Workflow Versions API implementados.
[ ] Tests Execution API implementados.
[ ] Tests Dead Letter API implementados.
[ ] Tests Export API implementados.
[ ] Tests authz implementados.
[ ] Tests sensitive permissions implementados.
[ ] Tests multitenancy implementados.
[ ] Tests forbidden fields implementados.
[ ] Tests no secrets implementados.
[ ] Tests no executable payload implementados.
[ ] Tests no raw SQL implementados.
[ ] Tests no public implementados.
[ ] Tests no public webhooks implementados.
[ ] Tests no WordPress implementados.
[ ] Tests no storageKey implementados.
[ ] Tests no financial execution implementados.
[ ] Tests no accounting execution implementados.
[ ] Tests no bank reconciliation confirmation implementados.
[ ] Tests no hardware control implementados.
[ ] Tests no external AI implementados.
[ ] Tests audit implementados.
[ ] Tests observability implementados.
[ ] Tests OpenAPI implementados.
[ ] Tests performance básicos implementados.
[ ] Tests concurrency críticos implementados.
[ ] Smoke flows implementados.
[ ] CI gates implementados.
[ ] CI completo pasa.
```

---

## 41. No aceptación del test plan

No se acepta el módulo si las pruebas permiten:

```text id="awb-test-no-acceptance"
- workflows cross-tenant;
- versions cross-tenant;
- activations cross-tenant;
- executions cross-tenant;
- steps cross-tenant;
- logs cross-tenant;
- dead letters cross-tenant;
- exports cross-tenant;
- tenantId desde cliente;
- actor fields desde cliente;
- versionNumber desde cliente;
- versionLabel desde cliente;
- status directo fuera de endpoint de transición;
- action fuera de catálogo;
- trigger fuera de catálogo;
- triggerConfig con secret;
- actionGraph con secret;
- conditionConfig con rawSql;
- workflow payload con script;
- workflow payload con executableCode;
- public endpoints;
- public webhooks;
- WordPress public access;
- storageKey en request;
- storageKey en response;
- signedUrl persistente;
- execution sin idempotencyKey;
- event-driven sin sourceEventId;
- scheduled sin scheduledWindowKey;
- manual sin manualRunId;
- duplicado por mismo evento;
- duplicado por misma ventana scheduled;
- retries infinitos;
- dead letter con raw stack trace;
- logs con secrets;
- audit con secrets;
- export con secrets;
- Payment creado desde workflow;
- Payment validado automáticamente desde workflow;
- Payment reversado desde workflow;
- SupplierPaymentOrder creado desde workflow;
- JournalEntry creado desde workflow;
- Bank Reconciliation confirmada desde workflow;
- stock modificado directamente desde workflow;
- AccessEvent modificado directamente desde workflow;
- portón abierto desde workflow;
- hardware controlado desde workflow;
- biometría habilitada;
- reconocimiento facial habilitado;
- IA externa con datos reales.
```

---

## 42. Resultado esperado

Al completar este plan de pruebas, el módulo `026-automation-workflows-basic` tendrá cobertura suficiente para validar automatizaciones internas seguras, versionadas, auditadas, idempotentes, ejecutadas por cola, con retries finitos, dead letter, exportaciones seguras y límites explícitos de dominio.

Resultado esperado:

```text id="awb-test-expected-result"
unit tests definidos
value object tests definidos
trigger validator tests definidos
action validator tests definidos
condition evaluator tests definidos
action graph validator tests definidos
retry policy tests definidos
idempotency tests definidos
sanitizer tests definidos
entity tests definidos
state machine tests definidos
domain policy tests definidos
repository tests definidos
queue adapter tests definidos
Redis lock tests definidos
scheduler tests definidos
event dispatcher tests definidos
execution engine tests definidos
step execution tests definidos
retry engine tests definidos
dead letter tests definidos
external adapter tests definidos
Platform API tests definidos
Tenant Workflow API tests definidos
Workflow Versions API tests definidos
Execution API tests definidos
Dead Letter API tests definidos
Export API tests definidos
authz tests definidos
sensitive permission tests definidos
multitenancy tests definidos
forbidden fields tests definidos
no secrets tests definidos
no executable payload tests definidos
no raw SQL tests definidos
no public tests definidos
no public webhook tests definidos
no WordPress tests definidos
no storageKey tests definidos
no financial execution tests definidos
no accounting execution tests definidos
no bank reconciliation confirmation tests definidos
no hardware control tests definidos
no external AI tests definidos
audit tests definidos
observability tests definidos
OpenAPI contract tests definidos
performance tests definidos
concurrency tests definidos
smoke flows definidos
CI gates definidos
tenant isolation verificado
catalog allowlist verificado
schema validation verificada
versioning verificado
activation control verificado
idempotency verificada
queue execution verificada
retry finito verificado
dead letter verificado
SDS export verificado
no public endpoints verificado
no public webhooks verificado
no WordPress access verificado
no secrets verificado
no executable payload verificado
no payment execution verificado
no accounting execution verificado
no bank reconciliation confirmation verificado
no hardware control verificado
no external AI with real data verificado
```

---

## 43. Expediente actualizado

```text id="awb-test-expediente"
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
│   │       └── test-plan.md
```
