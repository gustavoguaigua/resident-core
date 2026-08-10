# Security Notes — 026 Automation Workflows Basic

## 1. Información del documento

| Campo           | Valor                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------ |
| Proyecto        | RESIDENT Core                                                                                                |
| Spec ID         | 026                                                                                                          |
| Módulo          | Automation Workflows Basic                                                                                   |
| Documento       | Security Notes                                                                                               |
| Ruta            | `docs/specs/026-automation-workflows-basic/security-notes.md`                                                |
| Versión         | 0.1                                                                                                          |
| Estado          | needs-review                                                                                                 |
| Fecha           | 2026-08-01                                                                                                   |
| Documento base  | `docs/specs/026-automation-workflows-basic/spec.md`                                                          |
| Plan técnico    | `docs/specs/026-automation-workflows-basic/plan.md`                                                          |
| Modelo de datos | `docs/specs/026-automation-workflows-basic/data-model.md`                                                    |
| Contrato API    | `docs/specs/026-automation-workflows-basic/api-contract.md`                                                  |
| Plan de pruebas | `docs/specs/026-automation-workflows-basic/test-plan.md`                                                     |
| Backlog técnico | `docs/specs/026-automation-workflows-basic/tasks.md`                                                         |
| Stack objetivo  | NestJS / TypeScript / PostgreSQL / Prisma / OpenAPI / Keycloak / BullMQ / Redis                              |
| Naturaleza      | Tenant-scoped / Event-driven / Workflow-governed / Queue-backed / Audit-heavy / Non-public / Safe automation |

---

## 2. Propósito

Este documento define las notas de seguridad del módulo `026-automation-workflows-basic`.

El módulo permite crear automatizaciones internas, versionadas, auditadas, idempotentes y ejecutadas por cola dentro de RESIDENT Core. Por su naturaleza transversal, tiene capacidad de invocar otros módulos mediante actions permitidas; por ello debe tener límites de seguridad estrictos para impedir que se convierta en un motor de ejecución arbitraria, un mecanismo de evasión de autorización, un canal de exfiltración de datos o una vía indirecta para ejecutar acciones financieras, contables, bancarias, físicas o externas no aprobadas.

Regla central de seguridad:

```text id="awb-sec-rule"
Toda automatización, trigger definition, action definition, workflow, versión, activación, evento, ejecución, step, retry, dead letter, log, exportación, job, lock, payload, response, métrica y evento de auditoría de Automation Workflows Basic debe proteger tenant isolation, autorización explícita, catálogo cerrado de triggers/actions, validación estricta de schema, idempotencia, límites de frecuencia, retries finitos, sanitización de payloads, trazabilidad completa, ausencia de secretos, ausencia de scripts, ausencia de raw SQL, ausencia de código ejecutable, ausencia de webhooks públicos inseguros, ausencia de endpoints públicos, ausencia de acceso desde WordPress público, ausencia de storageKey expuesto, ausencia de acciones fuera de catálogo, ausencia de pagos automáticos, ausencia de asientos contables directos, ausencia de conciliaciones bancarias confirmadas, ausencia de modificación directa de datos transaccionales de módulos consumidores, ausencia de control físico de hardware, ausencia de biometría, ausencia de reconocimiento facial y ausencia de IA externa con datos reales.
```

---

## 3. Clasificación de seguridad

### 3.1. Clasificación del módulo

```text id="awb-sec-classification"
Security-sensitive
Privacy-sensitive
Configuration-sensitive
Tenant-scoped
Event-driven
Queue-backed
Workflow-governed
Catalog-restricted
Idempotency-critical
Audit-heavy
Non-public
No public webhooks in MVP
No secrets storage
No executable payload
No direct financial execution
No hardware control
No external AI with real data
```

---

### 3.2. Nivel de sensibilidad por componente

| Componente                | Sensibilidad | Justificación                                                      |
| ------------------------- | -----------: | ------------------------------------------------------------------ |
| WorkflowTriggerDefinition |   Media/Alta | Define qué eventos pueden disparar automatizaciones                |
| WorkflowActionDefinition  |         Alta | Define qué acciones puede ejecutar el sistema                      |
| TenantWorkflowDefinition  |         Alta | Contenedor funcional de automatización del tenant                  |
| TenantWorkflowVersion     |      Crítica | Contiene triggerConfig, conditionConfig, actionGraph y retryPolicy |
| TenantWorkflowActivation  |         Alta | Determina qué versión se ejecuta y desde cuándo                    |
| WorkflowExecution         |         Alta | Evidencia de ejecución e idempotencia                              |
| WorkflowStepExecution     |         Alta | Evidencia de acciones ejecutadas                                   |
| WorkflowExecutionLog      |         Alta | Puede contener datos operativos si no se sanitiza                  |
| WorkflowDeadLetter        |         Alta | Puede contener fallos y metadatos sensibles                        |
| WorkflowExport            |         Alta | Consolida historial o ejecución de automatizaciones                |
| BullMQ job payload        |         Alta | Puede transportar comandos internos si no se limita                |
| Redis lock/key            |   Media/Alta | Puede afectar idempotencia y aislamiento por tenant                |
| Internal event envelope   |         Alta | Puede originar ejecución automática                                |

---

## 4. Principios de seguridad

```text id="awb-sec-principles"
1. Keycloak autentica; RESIDENT Core autoriza.
2. Tenant isolation es obligatorio.
3. Ningún workflow opera sin tenant.
4. Ninguna execution opera sin tenant.
5. Ningún step opera fuera del tenant de su execution.
6. Platform catalog no contiene datos reales de tenants.
7. Workflows tenant-scoped no pueden referenciar recursos cross-tenant.
8. Todo trigger debe existir en catálogo.
9. Toda action debe existir en catálogo.
10. No se permite action fuera de catálogo.
11. No se permite trigger fuera de catálogo.
12. No se permite JavaScript configurable.
13. No se permite Python dinámico.
14. No se permite raw SQL configurable.
15. No se permite shell command configurable.
16. No se permite eval.
17. No se permite Function constructor.
18. No se permite código ejecutable.
19. No se almacenan secretos.
20. No se aceptan tokens, passwords, apiKeys ni clientSecrets.
21. No existen endpoints públicos.
22. No existen public webhooks en MVP.
23. WordPress público no accede.
24. Toda execution requiere idempotencyKey.
25. Event-driven requiere sourceEventId.
26. Scheduled requiere scheduledWindowKey.
27. Manual run requiere manualRunId y actor.
28. Retries son finitos.
29. Dead letters se sanitizan.
30. Logs funcionales se sanitizan.
31. Audit no contiene secretos ni payload raw sensible.
32. Exports usan Secure Document Storage.
33. No se devuelve storageKey.
34. No se ejecutan pagos desde workflows.
35. No se crean asientos contables desde workflows.
36. No se confirma conciliación bancaria desde workflows.
37. No se modifica inventario directamente desde workflows.
38. No se modifica AccessEvent directamente desde workflows.
39. No se abren portones.
40. No se controla hardware físico.
41. No se procesa biometría.
42. No se ejecuta reconocimiento facial.
43. No se envían datos reales a IA externa.
```

---

## 5. Modelo de amenazas

### 5.1. Activos protegidos

```text id="awb-sec-assets"
- Catálogo de triggers.
- Catálogo de actions.
- Workflow definitions por tenant.
- Workflow versions.
- Trigger configs.
- Condition configs.
- Action graphs.
- Retry policies.
- Activaciones.
- Eventos internos.
- Idempotency keys.
- Manual run inputs.
- Scheduled windows.
- Workflow executions.
- Step executions.
- Execution logs.
- Dead letters.
- Exportaciones.
- Payloads sanitizados.
- Queue jobs.
- Redis locks.
- Audit events.
- Correlation IDs.
- Trace IDs.
- Referencias a recursos de módulos consumidores.
- SecureDocumentId de exportaciones.
```

---

### 5.2. Actores potencialmente maliciosos

```text id="awb-sec-threat-actors"
- Usuario anónimo.
- Residente intentando administrar workflows.
- TenantAdmin intentando ejecutar action prohibida.
- TenantAdmin intentando usar workflow como bypass de autorización.
- Usuario de otro tenant intentando consultar ejecuciones.
- PlatformAdmin configurando catálogo inseguro.
- PlatformSupport accediendo a payloads tenant sin permiso.
- Actor intentando inyectar tenantId.
- Actor intentando inyectar actor fields.
- Actor intentando inyectar versionNumber o status.
- Actor intentando almacenar secrets en JSONB.
- Actor intentando introducir rawSql.
- Actor intentando introducir JavaScript o shell commands.
- Actor intentando crear webhook público.
- Actor intentando usar WordPress como canal de ejecución.
- Actor intentando duplicar eventos para generar spam.
- Actor intentando abusar de retries.
- Actor intentando extraer storageKey vía export.
- Actor intentando ejecutar pagos.
- Actor intentando crear JournalEntry.
- Actor intentando confirmar conciliación bancaria.
- Actor intentando abrir portones.
- Actor intentando invocar IA externa con datos reales.
```

---

### 5.3. Amenazas principales

| Amenaza                           |  Riesgo | Control                                                       |
| --------------------------------- | ------: | ------------------------------------------------------------- |
| Workflow cross-tenant             | Crítico | TenantGuard, tenant_id, repositorios tenant-scoped, tests 404 |
| Execution cross-tenant            | Crítico | tenant_id obligatorio, execution guard                        |
| Action fuera de catálogo          | Crítico | WorkflowCatalogAllowlistPolicy                                |
| Trigger fuera de catálogo         |    Alto | TriggerDefinition validation                                  |
| Payload ejecutable                | Crítico | NoExecutableWorkflowPayloadPolicy                             |
| Raw SQL en condition/action       | Crítico | NoRawSqlWorkflowPolicy                                        |
| Secret en workflow config         | Crítico | NoSecretsInWorkflowPolicy                                     |
| Webhook público inseguro          | Crítico | No public webhooks MVP, boot fail                             |
| Acceso desde WordPress público    | Crítico | No public routes, CORS restrictivo                            |
| Duplicación de execution          |    Alto | idempotencyKey, unique constraints                            |
| Reintentos infinitos              |    Alto | RetryPolicy finita                                            |
| Queue payload con datos sensibles |    Alto | queue sanitizer                                               |
| Logs con payload sensible         |    Alto | log sanitizer                                                 |
| Dead letter con stack raw         |    Alto | error sanitizer                                               |
| Export con secrets                | Crítico | export sanitizer + SDS                                        |
| Action financiera destructiva     | Crítico | NoFinancialExecutionPolicy                                    |
| JournalEntry directo              | Crítico | boundary tests                                                |
| Conciliación bancaria confirmada  | Crítico | boundary tests                                                |
| Hardware control                  | Crítico | NoHardwareControlPolicy                                       |
| IA externa con datos reales       |    Alto | NoExternalAiRealDataPolicy                                    |
| Platform catalog inseguro         |    Alto | PlatformPermissionGuard + review + CI gates                   |

---

## 6. Superficies de ataque

### 6.1. Platform API

```text id="awb-sec-platform-api"
/api/v1/platform/automation-trigger-definitions
/api/v1/platform/automation-action-definitions
```

Riesgos:

```text id="awb-sec-platform-risks"
- Crear trigger definition insegura.
- Crear action definition destructiva.
- Marcar action financiera como permitida.
- Introducir schema que permita secrets.
- Introducir schema que permita executable payload.
- Habilitar action externa no confiable.
- Archivar definition usada por workflows sin control.
```

Controles:

```text id="awb-sec-platform-controls"
- AuthGuard.
- PlatformPermissionGuard.
- automationCatalog.manageSensitive para definitions sensibles.
- Schema validation.
- ForbiddenKeysValidator recursivo.
- NoSecretsInWorkflowPolicy.
- NoExecutableWorkflowPayloadPolicy.
- NoRawSqlWorkflowPolicy.
- NoDestructiveActionPolicy.
- NoFinancialExecutionPolicy.
- Audit obligatorio.
- OpenAPI contract tests.
```

---

### 6.2. Tenant Admin API

```text id="awb-sec-tenant-api"
/api/v1/tenant/automation-workflows
/api/v1/tenant/automation-executions
/api/v1/tenant/automation-dead-letters
/api/v1/tenant/automation-exports
```

Riesgos:

```text id="awb-sec-tenant-risks"
- Crear workflow con action prohibida.
- Crear workflow con payload ejecutable.
- Activar workflow sensible sin aprobación.
- Ejecutar manual run sobre demasiados destinatarios.
- Reintentar execution sensible sin permiso.
- Consultar executions de otro tenant.
- Exportar historial sensible.
- Inyectar tenantId o actor fields.
```

Controles:

```text id="awb-sec-tenant-controls"
- AuthGuard.
- TenantGuard.
- PermissionGuard.
- SensitivePermissionGuard.
- Resource tenant guards.
- DTO whitelist.
- forbidNonWhitelisted.
- Schema validation.
- Catalog allowlist.
- Idempotency enforcement.
- Rate limit por tenant.
- Audit obligatorio.
- Response sanitizer.
```

---

### 6.3. Internal event publisher

```text id="awb-sec-internal-event-surface"
publishAutomationEvent(event)
```

Riesgos:

```text id="awb-sec-internal-event-risks"
- Módulo emisor publica evento sin tenant.
- Evento de tenantB dispara workflow tenantA.
- sourceEventId duplicado genera spam.
- Payload contiene datos sensibles completos.
- Payload contiene storageKey.
- EventName no catalogado dispara workflow indebido.
```

Controles:

```text id="awb-sec-internal-event-controls"
- InternalAutomationEventGuard.
- tenantId obligatorio.
- sourceEventId obligatorio.
- eventName catalogado.
- sourceModule validado.
- payload sanitizer.
- idempotencyKey.
- unique constraints.
- audit.
```

---

### 6.4. BullMQ / Redis

Riesgos:

```text id="awb-sec-queue-risks"
- Job payload contiene secrets.
- Job payload contiene storageKey.
- Job duplicado ejecuta action dos veces.
- Redis lock no incluye tenant.
- Worker ejecuta job manipulado.
- Worker ejecuta action archived.
- Worker no revalida catálogo antes de ejecutar.
```

Controles:

```text id="awb-sec-queue-controls"
- Queue payload sanitizer.
- jobId determinístico por idempotencyKey.
- locks tenant-scoped.
- worker revalida tenant.
- worker revalida workflow active.
- worker revalida action catalog.
- worker revalida idempotency.
- retry finito.
- dead letter sanitizado.
```

---

### 6.5. Exportaciones

Riesgos:

```text id="awb-sec-export-risks"
- Export contiene secrets.
- Export contiene payload raw sensible.
- Export contiene storageKey.
- Export incluye datos cross-tenant.
- Export full history sin razón.
- Export usado como canal de exfiltración.
```

Controles:

```text id="awb-sec-export-controls"
- tenantWorkflowExports.create.
- tenantWorkflowExports.exportSensitive si includeSensitive=true.
- reason obligatorio para auditSnapshot/fullAutomationHistory.
- export sanitizer.
- Secure Document Storage.
- secureDocumentId únicamente.
- no storageKey.
- audit.
```

---

## 7. Autenticación

Todos los endpoints permitidos requieren:

```http id="awb-sec-auth-header"
Authorization: Bearer <access_token>
```

Reglas:

```text id="awb-sec-auth-rules"
- Keycloak valida identidad.
- RESIDENT Core resuelve UserProfile.
- RESIDENT Core resuelve TenantMembership.
- RESIDENT Core resuelve currentTenant.
- RESIDENT Core autoriza por permiso, sensibilidad y recurso.
```

Prohibido:

```text id="awb-sec-auth-forbidden"
- Acceso anónimo.
- API keys públicas.
- Tokens en query string.
- Sesión WordPress como autenticación Core.
- userId enviado por cliente como actor.
- tenantId enviado por cliente como autoridad.
- Webhook público sin firma.
- Ejecución de workflow desde dominio público.
```

---

## 8. Autorización

### 8.1. Capas obligatorias

```text id="awb-sec-authz-layers"
1. AuthGuard.
2. TenantGuard para rutas tenant.
3. PermissionGuard.
4. SensitivePermissionGuard cuando aplique.
5. PlatformPermissionGuard para catálogo.
6. Resource tenant guard.
7. WorkflowCatalogAllowlistPolicy.
8. Domain policy por acción.
9. DTO denylist.
10. Response sanitizer.
```

---

### 8.2. Permisos platform

```text id="awb-sec-platform-permissions"
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

### 8.3. Permisos tenant

```text id="awb-sec-tenant-permissions"
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

### 8.4. Permisos sensibles

```text id="awb-sec-sensitive-permissions"
tenantWorkflows.approveSensitive
tenantWorkflows.activateSensitive
tenantWorkflowExecutions.runSensitive
tenantWorkflowExecutions.retrySensitive
tenantWorkflowExports.exportSensitive
automationCatalog.manageSensitive
```

Regla:

```text id="awb-sec-sensitive-rule"
Todo workflow, trigger, action, execution, retry, dead letter o export marcado como restricted, financialSensitive, privacySensitive, securitySensitive u operationalSensitive requiere permiso sensible adicional para aprobación, activación, ejecución manual, reintento o exportación.
```

---

## 9. Tenant isolation

### 9.1. Regla obligatoria

Toda consulta tenant-scoped debe filtrar por `tenantId`.

Patrón permitido:

```typescript id="awb-sec-tenant-query-safe"
await prisma.workflowExecution.findFirst({
  where: {
    id: executionId,
    tenantId: currentTenant.id
  }
});
```

Patrón prohibido:

```typescript id="awb-sec-tenant-query-forbidden"
await prisma.workflowExecution.findUnique({
  where: {
    id: executionId
  }
});
```

---

### 9.2. Recursos tenant-scoped

```text id="awb-sec-tenant-resources"
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

### 9.3. Respuesta cross-tenant

Si un recurso existe pero pertenece a otro tenant:

```http id="awb-sec-cross-tenant-response"
404 Not Found
```

No usar `403` cuando pueda revelar existencia del recurso.

---

## 10. Catálogo cerrado de triggers y actions

### 10.1. Trigger allowlist

Reglas:

```text id="awb-sec-trigger-allowlist"
- Todo triggerKey debe existir en workflow_trigger_definitions.
- El trigger debe estar active.
- El trigger debe estar isTenantEnabled=true para workflows tenant.
- triggerConfig debe validar contra schema.
- eventName debe coincidir con la definition.
- sourceModule debe coincidir con la definition.
- No se aceptan triggers externos públicos en MVP.
- No se aceptan triggers desde WordPress público.
```

---

### 10.2. Action allowlist

Reglas:

```text id="awb-sec-action-allowlist"
- Toda actionKey debe existir en workflow_action_definitions.
- La action debe estar active.
- La action debe estar isTenantEnabled=true para workflows tenant.
- actionConfig debe validar contra schema.
- Actions destructivas están bloqueadas en MVP salvo ADR explícito.
- Actions financieras no pueden crear, validar, reversar ni contabilizar.
- Actions externas están bloqueadas salvo allowlist interna no sensible.
```

---

### 10.3. Actions prohibidas

```text id="awb-sec-actions-forbidden"
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
inventory.postTransferAutomatically
access.openGate
access.controlHardware
documents.exposeStorageKey
external.callUntrustedWebhook
external.sendRealDataToAI
```

---

## 11. No secrets storage

### 11.1. Secretos prohibidos

No se permite almacenar ni transportar en workflows, configs, events, jobs, logs, dead letters o exports:

```text id="awb-sec-secrets-forbidden"
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
jwtSigningKey
encryptionKey
bankCredential
providerCredential
smtpPassword
awsSecretAccessKey
oidcClientSecret
```

---

### 11.2. Controles

```text id="awb-sec-secrets-controls"
- ForbiddenKeysValidator recursivo.
- DTO denylist.
- JSONB sanitizer.
- Queue payload sanitizer.
- Execution input/output sanitizer.
- Step input/output sanitizer.
- Log sanitizer.
- Audit sanitizer.
- Export sanitizer.
- OpenAPI contract tests.
- CI no-secrets gate.
```

---

### 11.3. Regla futura

```text id="awb-sec-secrets-future-rule"
Si una automatización futura requiere secretos para conectores externos, deberá usarse secrets manager externo, referencia opaca no sensible, ADR, threat model, rotación, auditoría, pruebas de seguridad y aprobación explícita.
```

---

## 12. No executable workflow payload

### 12.1. Payloads ejecutables prohibidos

```text id="awb-sec-executable-forbidden"
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
webhookScript
```

---

### 12.2. Prohibiciones técnicas

```text id="awb-sec-executable-technical-forbidden"
- No usar eval.
- No usar Function constructor.
- No ejecutar SQL desde conditionConfig.
- No ejecutar SQL desde actionConfig.
- No ejecutar shell commands.
- No ejecutar JavaScript configurable.
- No ejecutar Python dinámico.
- No ejecutar templates inseguros.
- No permitir expressions arbitrarias sin allowlist.
```

---

### 12.3. Permitido en MVP

```text id="awb-sec-payload-allowed"
- booleanos;
- enums;
- strings controlados;
- números;
- fechas ISO 8601;
- arrays acotados;
- objetos JSON validados por schema;
- operadores declarativos permitidos;
- action keys catalogadas;
- trigger keys catalogadas;
- retry policy finita;
- schedule config validado.
```

---

## 13. Seguridad de JSONB

### 13.1. Campos JSONB permitidos

```text id="awb-sec-jsonb-fields"
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

### 13.2. Validaciones obligatorias

Antes de persistir cualquier JSONB:

```text id="awb-sec-jsonb-validation"
[ ] Validar schema.
[ ] Validar allowlist de claves.
[ ] Rechazar forbidden keys recursivamente.
[ ] Rechazar secretos.
[ ] Rechazar scripts.
[ ] Rechazar raw SQL.
[ ] Rechazar código ejecutable.
[ ] Rechazar storageKey.
[ ] Rechazar signedUrl persistente.
[ ] Rechazar publicWebhookUrl.
[ ] Rechazar externalAiEnabled.
[ ] Rechazar externalAiRealDataAllowed.
[ ] Limitar tamaño.
[ ] Limitar profundidad.
[ ] Sanitizar texto libre.
```

---

### 13.3. No usar JSONB para evadir modelo

```text id="awb-sec-jsonb-boundary"
JSONB no debe usarse para ocultar tenantId, actores, permisos, estados, versionNumber, pagos, asientos contables, conciliaciones bancarias, comandos de hardware, datos biométricos, credenciales externas, storageKey, scripts, raw SQL o integraciones de IA externa.
```

---

## 14. Mass assignment protection

Todo DTO debe usar whitelist estricta.

Reglas:

```text id="awb-sec-mass-assignment-rules"
- tenantId se resuelve server-side.
- actor se resuelve server-side.
- versionNumber se genera server-side.
- versionLabel se genera server-side.
- status cambia solo por endpoints de transición.
- idempotencyKey se genera server-side.
- manualRunId se genera server-side.
- scheduledWindowKey se genera server-side.
- createdBy/updatedBy/approvedBy/activatedBy se resuelven server-side.
- secureDocumentId se genera desde Secure Document Storage.
- storageKey nunca se acepta.
```

Patrón prohibido:

```typescript id="awb-sec-mass-assignment-forbidden"
await prisma.tenantWorkflowVersion.create({
  data: req.body
});
```

Patrón permitido:

```typescript id="awb-sec-mass-assignment-safe"
const command = CreateTenantWorkflowVersionCommand.fromDto(dto, {
  tenantId: currentTenant.id,
  actorUserProfileId: currentUser.id,
  traceId: requestContext.traceId
});
```

---

## 15. Campos prohibidos

### 15.1. Prohibidos en DTOs externos

```text id="awb-sec-forbidden-dto-fields"
tenantId
createdBy
updatedBy
approvedBy
activatedBy
deactivatedBy
archivedBy
triggeredBy
cancelledBy
retriedBy
resolvedBy
ignoredBy
requestedBy
actorUserProfileId
status directo fuera de endpoint de transición
versionNumber
versionLabel
executionId arbitrario para crear ejecución
stepStatus arbitrario
idempotencyKey arbitrario
manualRunId arbitrario
scheduledWindowKey arbitrario
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

```http id="awb-sec-forbidden-dto-response"
422 Unprocessable Entity
```

---

### 15.2. Prohibidos en responses

```text id="awb-sec-forbidden-response-fields"
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
authorization header
cookie
```

---

### 15.3. Prohibidos en logs

```text id="awb-sec-forbidden-log-fields"
tenantId como label de alta cardinalidad
userId como label de alta cardinalidad
workflowId como label de alta cardinalidad
executionId como label de alta cardinalidad
idempotencyKey
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
raw event payload
raw action payload
raw request body
authorization header
cookie
```

---

### 15.4. Prohibidos en auditoría

```text id="awb-sec-forbidden-audit-fields"
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

## 16. Seguridad de versionamiento

### 16.1. Reglas de versión

```text id="awb-sec-versioning-rules"
- versionNumber se genera server-side.
- versionLabel se genera server-side.
- draft puede editarse.
- reviewReady no debe editarse destructivamente.
- approved no debe alterarse silenciosamente.
- scheduled no debe editarse destructivamente.
- active no debe editarse destructivamente.
- superseded conserva historial.
- deactivated conserva historial.
- rejected no se activa.
- archived no se activa.
```

---

### 16.2. Estados prohibidos desde cliente

El cliente no puede enviar directamente:

```text id="awb-sec-status-client-forbidden"
draft
reviewReady
approved
rejected
scheduled
active
superseded
deactivated
archived
queued
running
succeeded
partiallySucceeded
failed
retrying
deadLettered
cancelled
```

Debe usar endpoints específicos:

```text id="awb-sec-transition-endpoints"
submit-review
approve
reject
activate
deactivate
archive
run
cancel
retry
resolve
ignore
```

---

### 16.3. Inmutabilidad de versiones activas

```text id="awb-sec-active-version-immutability"
Una TenantWorkflowVersion active no debe actualizar triggerConfig, conditionConfig, actionGraph, retryPolicy, versionNumber, versionLabel, effectiveFrom, createdBy, approvedBy o activatedBy. Todo cambio funcional debe crear una nueva versión.
```

---

## 17. Seguridad de activaciones

### 17.1. Activación inmediata

Controles:

```text id="awb-sec-immediate-activation-controls"
[ ] Versión tenant-scoped.
[ ] Workflow tenant-scoped.
[ ] Estado approved.
[ ] effectiveFrom obligatorio.
[ ] No overlap.
[ ] PermissionGuard.
[ ] SensitivePermissionGuard si aplica.
[ ] Lock tenant + workflow.
[ ] Transacción.
[ ] Invalidación de lookup/cache post-commit si aplica.
[ ] Audit.
```

---

### 17.2. Activación futura

Controles:

```text id="awb-sec-scheduled-activation-controls"
[ ] effectiveFrom futuro.
[ ] Estado scheduled.
[ ] No ejecución antes de effectiveFrom.
[ ] ScheduledActivationProcessor controlado.
[ ] Revalidación antes de activar.
[ ] Lock tenant + workflow.
[ ] Audit.
```

---

### 17.3. Desactivación

Regla:

```text id="awb-sec-deactivation-rule"
La desactivación no borra versions, activations, executions, logs ni dead letters. Solo impide nuevas ejecuciones desde la vigencia indicada.
```

---

## 18. Seguridad de condiciones

### 18.1. Operadores permitidos

```text id="awb-sec-condition-operators"
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

### 18.2. Prohibido

```text id="awb-sec-condition-forbidden"
eval
Function
javascript
script
rawSql
sql
regex peligrosa sin límite
templateExpressionUnsafe
externalLookup
crossTenantLookup
databaseLookup
httpCall
fileRead
```

---

### 18.3. Regla

```text id="awb-sec-condition-rule"
Las condiciones operan únicamente sobre payload sanitizado y campos allowlisted por trigger schema. No pueden consultar base de datos directamente, invocar servicios externos ni ejecutar código.
```

---

## 19. Seguridad de action graph

### 19.1. Permitido en MVP

```text id="awb-sec-action-graph-allowed"
- steps secuenciales;
- steps con condition simple;
- failWorkflow;
- continueWorkflow;
- skipStep;
- maxRetries por step;
- timeoutSeconds por step;
- output sanitizado;
- actions catalogadas.
```

---

### 19.2. Prohibido en MVP

```text id="awb-sec-action-graph-forbidden"
- ciclos arbitrarios;
- recursion;
- loops configurables;
- fan-out masivo sin límite;
- joins complejos;
- compensaciones distribuidas;
- actions creadas por usuario;
- actions fuera de catálogo;
- scripts;
- raw SQL;
- shell commands;
- actions financieras destructivas;
- hardware commands;
- external AI actions;
- public webhook calls no confiables.
```

---

### 19.3. Validaciones obligatorias

```text id="awb-sec-action-graph-validations"
[ ] steps obligatorio.
[ ] stepKey único.
[ ] stepOrder positivo.
[ ] actionKey existente.
[ ] actionDefinition active.
[ ] actionConfig válido.
[ ] timeoutSeconds dentro de límite.
[ ] maxRetries dentro de límite.
[ ] onFailure permitido.
[ ] no cycles.
[ ] no recursion.
[ ] no secrets.
[ ] no scripts.
[ ] no rawSql.
[ ] no storageKey.
```

---

## 20. Seguridad de eventos internos

### 20.1. Envelope obligatorio

```typescript id="awb-sec-event-envelope"
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

---

### 20.2. Validaciones

```text id="awb-sec-event-validations"
[ ] eventName catalogado.
[ ] tenantId obligatorio.
[ ] tenant activo.
[ ] sourceModule obligatorio.
[ ] sourceEventId obligatorio.
[ ] occurredAt válido.
[ ] payload sanitizado.
[ ] sensitivity válida.
[ ] traceId obligatorio.
[ ] correlationId obligatorio.
[ ] no secrets.
[ ] no storageKey.
[ ] no raw files.
[ ] no comprobantes base64.
[ ] no datos personales masivos.
```

---

### 20.3. Idempotencia por evento

```text id="awb-sec-event-idempotency"
Un mismo sourceEventId no debe generar más de una execution para el mismo workflow y tenant.
```

---

## 21. Seguridad de scheduled workflows

### 21.1. Reglas

```text id="awb-sec-scheduled-rules"
- Scheduled workflow debe ser tenant-scoped.
- Timezone se resuelve desde 025 o 001.
- Default timezone: America/Guayaquil.
- Frecuencia mínima MVP: 60 minutos.
- scheduledWindowKey se genera server-side.
- scheduledWindowKey debe ser único por workflow.
- No se ejecuta workflow inactive.
- No se ejecuta workflow archived.
- No se ejecuta version draft/rejected/archived.
- Notificaciones respetan quiet hours salvo criticalAlert permitido.
```

---

### 21.2. Prohibido

```text id="awb-sec-scheduled-forbidden"
- cronCommand.
- shellCommand.
- schedule con frecuencia abusiva.
- schedule sin tenant.
- schedule sin idempotencyKey.
- schedule que ejecute action financiera destructiva.
- schedule que ejecute hardware control.
- schedule que envíe datos reales a IA externa.
```

---

## 22. Seguridad de manual run

### 22.1. Reglas

```text id="awb-sec-manual-run-rules"
- Requiere autenticación.
- Requiere TenantGuard.
- Requiere tenantWorkflowExecutions.runManual.
- Requiere permiso sensible si aplica.
- Requiere reason si workflow/action sensible.
- Actor se resuelve server-side.
- manualRunId se genera server-side.
- idempotencyKey se genera server-side.
- input se sanitiza.
- input se valida contra schema si aplica.
- manual run se audita.
```

---

### 22.2. Prohibido

```text id="awb-sec-manual-run-forbidden"
- tenantId en body.
- actor en body.
- idempotencyKey arbitrario.
- manualRunId arbitrario.
- input con secrets.
- input con scripts.
- input con rawSql.
- input con storageKey.
- input con commands de hardware.
- input con externalAiRealDataAllowed.
```

---

## 23. Seguridad de idempotencia

### 23.1. Reglas

```text id="awb-sec-idempotency-rules"
- Toda execution requiere idempotencyKey.
- idempotencyKey se genera server-side.
- idempotencyKey no contiene datos sensibles.
- Event-driven usa sourceEventId.
- Scheduled usa scheduledWindowKey.
- Manual usa manualRunId.
- Reintentos conservan lineage.
- Steps idempotentes reciben executionId/stepId cuando aplique.
```

---

### 23.2. Constraint requerida

```text id="awb-sec-idempotency-constraint"
unique(tenant_id, workflow_definition_id, idempotency_key)
```

---

### 23.3. Riesgos controlados

| Riesgo                  | Control                          |
| ----------------------- | -------------------------------- |
| Evento duplicado        | unique idempotencyKey            |
| Scheduler duplicado     | scheduledWindowKey único         |
| Retry duplicado         | execution lock                   |
| Manual run repetido     | manualRunId server-side          |
| Worker reiniciado       | estado persistente + idempotency |
| Action externa repetida | step idempotency metadata        |

---

## 24. Seguridad de retries

### 24.1. Reglas

```text id="awb-sec-retry-rules"
- maxRetries obligatorio.
- maxRetries <= AUTOMATION_WORKFLOWS_MAX_RETRIES.
- backoffStrategy allowlisted.
- No retries infinitos.
- Error no recuperable no se reintenta.
- Reintento manual requiere permiso.
- Reintento sensible requiere permiso reforzado.
- Retry failedStepsOnly no duplica steps succeeded.
- Retry fullWorkflow debe respetar idempotencia.
```

---

### 24.2. Dead letter

```text id="awb-sec-dead-letter-rules"
- Dead letter se crea al agotar retries.
- Dead letter se crea en error no recuperable.
- Dead letter es tenant-scoped.
- lastErrorSanitized no contiene stack trace productivo.
- failureReason está sanitizado.
- resolve no reintenta automáticamente.
- ignore no borra execution.
- archived no borra historial.
```

---

## 25. Seguridad de colas y workers

### 25.1. Queue payload

Debe contener solo:

```text id="awb-sec-queue-payload-allowed"
tenantId
workflowDefinitionId
workflowVersionId
executionId
stepExecutionId
triggerKey
actionKey
sourceEventId
scheduledWindowKey
manualRunId
idempotencyKey
traceId
correlationId
sanitizedInput
```

No debe contener:

```text id="awb-sec-queue-payload-forbidden"
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
rawFilePayload
base64
raw event payload sensible
raw request body
authorization header
cookie
rawSql
script
executableCode
```

---

### 25.2. Worker validation

Cada worker debe revalidar:

```text id="awb-sec-worker-validation"
[ ] tenant activo.
[ ] workflowDefinition tenant-scoped.
[ ] workflowVersion tenant-scoped.
[ ] workflow active.
[ ] version active.
[ ] execution status válido.
[ ] idempotencyKey.
[ ] actionDefinition active.
[ ] action permitida.
[ ] payload sanitizado.
[ ] retry count.
[ ] cancellation status.
```

---

### 25.3. Redis locks

Locks deben incluir tenant:

```text id="awb-sec-lock-keys"
tenant:{tenantId}:automation:workflow:{workflowDefinitionId}
tenant:{tenantId}:automation:execution:{executionId}
tenant:{tenantId}:automation:scheduled:{workflowDefinitionId}:{scheduledWindowKey}
```

Prohibido:

```text id="awb-sec-lock-keys-forbidden"
automation:workflow:{workflowDefinitionId}
automation:execution:{executionId}
```

---

## 26. Seguridad documental

### 26.1. Secure Document Storage

Regla:

```text id="awb-sec-sds-rule"
Automation Workflows Basic nunca almacena, acepta ni devuelve storageKey. Las exportaciones administrativas solo deben referenciar secureDocumentId generado por Secure Document Storage.
```

---

### 26.2. Exportaciones permitidas

```text id="awb-sec-export-types"
workflows
workflowVersions
executions
failedExecutions
deadLetters
auditSnapshot
fullAutomationHistory
```

---

### 26.3. Controles

```text id="awb-sec-export-control-requirements"
- tenantWorkflowExports.create requerido.
- tenantWorkflowExports.exportSensitive requerido si includeSensitive=true.
- reason obligatorio para auditSnapshot.
- reason obligatorio para fullAutomationHistory.
- filters sanitizados.
- contenido exportado sanitizado.
- no secrets.
- no raw payload sensible.
- no scripts.
- no rawSql.
- no storageKey.
- secureDocumentId únicamente.
- audit obligatorio.
```

---

## 27. No public endpoints

No implementar:

```text id="awb-sec-no-public-endpoints"
GET  /api/v1/public/automation-workflows
GET  /api/v1/public/automation-executions
GET  /api/v1/public/automation-webhooks
POST /api/v1/public/automation-webhooks/{webhookKey}
GET  /api/v1/public/tenants/{slug}/automation-workflows
GET  /api/v1/public/tenants/{slug}/automation-executions
POST /api/v1/public/tenants/{slug}/automation-workflows/run
```

Respuesta esperada:

```http id="awb-sec-public-response"
404 Not Found
```

---

## 28. No WordPress access

WordPress es capa pública informativa y no debe operar automatizaciones del Core.

Prohibido para WordPress público:

```text id="awb-sec-wordpress-forbidden"
- consultar workflows;
- consultar workflow versions;
- consultar actionGraph;
- consultar executions;
- consultar logs;
- consultar dead letters;
- consultar exports;
- ejecutar manual run;
- publicar eventos internos;
- crear public webhooks;
- aprobar workflows;
- activar workflows;
- reintentar executions;
- resolver dead letters;
- almacenar tokens Core;
- usar sesión WordPress como auth Core.
```

Controles:

```text id="awb-sec-wordpress-controls"
- No public endpoints.
- CORS sin wildcard.
- CORS no permite dominio WordPress público en rutas automation.
- No cookies WordPress como auth Core.
- No shortcodes WordPress para automation.
- No templates WordPress consumiendo automation payloads.
```

---

## 29. No financial execution

Automation Workflows Basic no debe ejecutar acciones financieras destructivas.

Prohibido:

```text id="awb-sec-financial-forbidden"
payments.createPayment
payments.validatePaymentAutomatically
payments.reversePayment
supplierPayments.createPaymentOrder
supplierPayments.createPaymentEvidence
dues.generateChargesAutomaticallyFromWorkflow
accounting.createJournalEntry
accounting.createJournalEntryLine
bankReconciliation.confirmMatch
bankReconciliation.confirmSession
paymentProvider.capturePayment
openBanking.initiatePayment
```

Permitido:

```text id="awb-sec-financial-allowed"
payments.notifyPaymentValidationResult
dues.notifyChargeDueSoon
reports.generateBasicReport
reports.generateAndStoreExport
operations.createReviewRequest
operations.escalateToRole
```

Regla:

```text id="awb-sec-financial-rule"
El workflow puede notificar, escalar, generar reportes o crear tareas administrativas, pero no puede crear, validar, reversar, contabilizar, conciliar ni mover dinero.
```

---

## 30. No hardware control

Prohibido:

```text id="awb-sec-hardware-forbidden"
access.openGate
access.closeGate
access.controlHardware
gateOpenCommand
hardwareDeviceCommand
cameraStreamUrl
cameraFrame
plateOcrPayload
biometricTemplate
fingerprintTemplate
faceEmbedding
voicePrint
irisTemplate
```

Regla:

```text id="awb-sec-hardware-rule"
Automation Workflows Basic puede notificar incidentes o check-ins abiertos, pero no puede controlar portones, cámaras, cerraduras, biometría, OCR de placas ni hardware físico en MVP.
```

---

## 31. No external AI with real data

Prohibido enviar a IA externa:

```text id="awb-sec-ai-forbidden"
- workflow definitions reales;
- workflow versions reales;
- actionGraph real;
- triggerConfig real;
- conditionConfig real;
- event payload real;
- execution input/output real;
- step input/output real;
- dead letters reales;
- logs reales;
- exports reales;
- datos de residentes;
- datos financieros;
- datos bancarios;
- comprobantes;
- documentos;
- identificaciones;
- placas;
- patrones de acceso;
- información de seguridad del tenant.
```

Permitido:

```text id="awb-sec-ai-allowed"
- documentación técnica;
- fixtures sintéticos;
- ejemplos ficticios;
- schemas sin datos reales;
- análisis local sin envío externo;
- pruebas con datos completamente sintéticos.
```

Controles:

```text id="awb-sec-ai-controls"
- AUTOMATION_WORKFLOWS_EXTERNAL_AI_ENABLED=false.
- Boot falla si AUTOMATION_WORKFLOWS_EXTERNAL_AI_ENABLED=true.
- DTOs rechazan externalAiEnabled.
- DTOs rechazan externalAiRealDataAllowed.
- No existen action definitions de IA externa en MVP.
- CI no external AI.
```

---

## 32. n8n, Zapier, Make y herramientas externas

### 32.1. Uso permitido en MVP

```text id="awb-sec-external-tools-allowed"
- prototipos;
- laboratorios;
- documentación;
- demos con datos ficticios;
- pruebas con datos sintéticos;
- automatizaciones no sensibles fuera de producción;
- diseño futuro con ADR.
```

---

### 32.2. Uso prohibido en MVP

```text id="awb-sec-external-tools-forbidden"
- n8n productivo con datos sensibles reales;
- Zapier/Make productivo con datos sensibles reales;
- webhooks públicos sin firma;
- tokens Core almacenados sin secrets manager aprobado;
- envío de datos financieros reales;
- envío de datos personales reales;
- envío de comprobantes reales;
- ejecución de pagos;
- modificación de datos transaccionales;
- operación sin auditoría en RESIDENT Core.
```

---

### 32.3. Regla futura

```text id="awb-sec-external-tools-future-rule"
Cualquier integración productiva con n8n, Zapier, Make, agentes externos o webhooks públicos requiere ADR, threat model, firma de webhooks, secrets manager, rate limiting, scopes mínimos, auditoría, pruebas de seguridad y aprobación explícita.
```

---

## 33. Rate limiting

Aplicar rate limit reforzado en:

```text id="awb-sec-rate-limited-routes"
POST  /api/v1/platform/automation-trigger-definitions
POST  /api/v1/platform/automation-action-definitions
POST  /api/v1/tenant/automation-workflows
POST  /api/v1/tenant/automation-workflows/{workflowId}/versions
POST  /api/v1/tenant/automation-workflows/{workflowId}/versions/{versionId}/activate
POST  /api/v1/tenant/automation-workflows/{workflowId}/run
POST  /api/v1/tenant/automation-executions/{executionId}/retry
POST  /api/v1/tenant/automation-exports
```

Objetivos:

```text id="awb-sec-rate-limit-objectives"
- Evitar spam de notificaciones.
- Evitar abuso de manual runs.
- Proteger colas y workers.
- Evitar reintentos abusivos.
- Proteger exportaciones.
- Proteger catálogo platform.
- Evitar creación masiva accidental de workflows.
```

Respuesta:

```http id="awb-sec-rate-limit-response"
429 Too Many Requests
```

---

## 34. Seguridad de logs

### 34.1. Eventos loggeables

```text id="awb-sec-log-events"
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

### 34.2. Campos permitidos

```text id="awb-sec-log-allowed"
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
queueName
jobType
```

---

### 34.3. Campos prohibidos

```text id="awb-sec-log-forbidden"
tenantId como label de alta cardinalidad
userId como label de alta cardinalidad
workflowId como label de alta cardinalidad
executionId como label de alta cardinalidad
idempotencyKey
secret
token
password
apiKey
privateKey
clientSecret
storageKey
signedUrl
rawSql
script
functionBody
executableCode
raw event payload
raw action payload
raw request body
authorization header
cookie
```

---

## 35. Auditoría

### 35.1. Eventos obligatorios

```text id="awb-sec-audit-events"
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

### 35.2. Metadata permitida

```text id="awb-sec-audit-metadata-allowed"
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

### 35.3. Metadata prohibida

```text id="awb-sec-audit-metadata-forbidden"
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

## 36. Observabilidad y métricas

### 36.1. Métricas permitidas

```text id="awb-sec-metrics"
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

### 36.2. Labels permitidos

```text id="awb-sec-metric-labels-allowed"
triggerType
triggerKey
actionKey
sourceModule
targetModule
status
outcome
errorCode
queueName
```

---

### 36.3. Labels prohibidos

```text id="awb-sec-metric-labels-forbidden"
tenantId
userId
workflowId
workflowVersionId
executionId
sourceEventId
idempotencyKey
traceId
requestId
secretKey
```

---

## 37. CORS y headers

### 37.1. CORS

```text id="awb-sec-cors-rules"
- No wildcard.
- No permitir WordPress público para rutas automation.
- Permitir solo frontends autenticados autorizados.
- Orígenes explícitos por ambiente.
- Credentials solo si existe justificación.
- Métodos limitados por endpoint.
```

---

### 37.2. Headers obligatorios

```http id="awb-sec-headers"
Cache-Control: no-store
Pragma: no-cache
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
```

Recomendados:

```http id="awb-sec-headers-recommended"
Content-Security-Policy: default-src 'none'
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

---

## 38. Seguridad de OpenAPI

### 38.1. Extensiones requeridas

```yaml id="awb-sec-openapi-required"
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

Para rutas platform:

```yaml id="awb-sec-openapi-platform"
x-platform-scope: true
x-platform-admin-required: true
```

Para rutas tenant:

```yaml id="awb-sec-openapi-tenant"
x-tenant-scope: true
x-permission-required: true
```

Para rutas execution:

```yaml id="awb-sec-openapi-execution"
x-idempotency-required: true
x-queue-backed: true
x-audit-required: true
```

Para rutas export:

```yaml id="awb-sec-openapi-export"
x-secure-document-storage: true
x-storage-key-exposed: false
```

---

### 38.2. OpenAPI no debe documentar

```text id="awb-sec-openapi-forbidden"
tenantId en DTOs externos
actor fields
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

## 39. Validaciones críticas por caso de uso

### 39.1. Crear trigger definition

```text id="awb-sec-create-trigger-definition"
[ ] AuthGuard.
[ ] PlatformPermissionGuard.
[ ] Validar triggerKey.
[ ] Validar sourceModule.
[ ] Validar triggerType.
[ ] Validar eventName si triggerType=event.
[ ] Validar schema.
[ ] Rechazar secrets.
[ ] Rechazar scripts.
[ ] Rechazar rawSql.
[ ] Rechazar public webhooks.
[ ] Resolver createdBy server-side.
[ ] Auditar automationTriggerDefinition.created.
```

---

### 39.2. Crear action definition

```text id="awb-sec-create-action-definition"
[ ] AuthGuard.
[ ] PlatformPermissionGuard.
[ ] SensitivePermissionGuard si isDestructive/isFinancial/isExternal.
[ ] Validar actionKey.
[ ] Validar targetModule.
[ ] Validar actionType.
[ ] Validar schema.
[ ] Rechazar secrets.
[ ] Rechazar scripts.
[ ] Rechazar rawSql.
[ ] Rechazar actions prohibidas.
[ ] Resolver createdBy server-side.
[ ] Auditar automationActionDefinition.created.
```

---

### 39.3. Crear workflow version

```text id="awb-sec-create-workflow-version"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard.
[ ] WorkflowTenantGuard.
[ ] Rechazar tenantId.
[ ] Rechazar actor fields.
[ ] Rechazar versionNumber.
[ ] Rechazar status directo.
[ ] Validar workflow tenant-scoped.
[ ] Validar triggerKey.
[ ] Validar triggerConfig.
[ ] Validar conditionConfig.
[ ] Validar actionGraph.
[ ] Validar retryPolicy.
[ ] Rechazar secrets.
[ ] Rechazar scripts.
[ ] Rechazar rawSql.
[ ] Rechazar executableCode.
[ ] Rechazar action fuera de catálogo.
[ ] Generar versionNumber server-side.
[ ] Generar versionLabel server-side.
[ ] Crear draft.
[ ] Auditar tenantWorkflowVersion.created.
```

---

### 39.4. Activar workflow version

```text id="awb-sec-activate-workflow-version"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard.
[ ] SensitivePermissionGuard si aplica.
[ ] Validar workflow tenant-scoped.
[ ] Validar version tenant-scoped.
[ ] Validar status approved.
[ ] Validar effectiveFrom.
[ ] Validar no overlap.
[ ] Lock tenant + workflow.
[ ] Crear TenantWorkflowActivation.
[ ] Actualizar version status.
[ ] Actualizar workflow status.
[ ] Auditar tenantWorkflowVersion.activated.
```

---

### 39.5. Publicar evento interno

```text id="awb-sec-publish-event"
[ ] InternalAutomationEventGuard.
[ ] Validar eventName catalogado.
[ ] Validar tenantId.
[ ] Validar tenant activo.
[ ] Validar sourceModule.
[ ] Validar sourceEventId.
[ ] Sanitizar payload.
[ ] Rechazar secrets.
[ ] Rechazar storageKey.
[ ] Rechazar raw files.
[ ] Generar idempotencyKey.
[ ] Encolar execution.
[ ] Auditar tenantWorkflowExecution.queued.
```

---

### 39.6. Ejecutar manual run

```text id="awb-sec-manual-run-validation"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard tenantWorkflowExecutions.runManual.
[ ] SensitivePermissionGuard si aplica.
[ ] Validar workflow tenant-scoped.
[ ] Validar version tenant-scoped.
[ ] Requerir reason si sensible.
[ ] Sanitizar input.
[ ] Rechazar secrets.
[ ] Rechazar scripts.
[ ] Rechazar rawSql.
[ ] Generar manualRunId.
[ ] Generar idempotencyKey.
[ ] Encolar execution.
[ ] Auditar tenantWorkflowExecution.queued.
```

---

### 39.7. Exportar automatizaciones

```text id="awb-sec-export-validation"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard tenantWorkflowExports.create.
[ ] SensitivePermissionGuard si includeSensitive=true.
[ ] Validar exportType.
[ ] Validar format.
[ ] Requerir reason si auditSnapshot/fullAutomationHistory.
[ ] Sanitizar filters.
[ ] Sanitizar contenido exportado.
[ ] Excluir secrets.
[ ] Excluir scripts.
[ ] Excluir rawSql.
[ ] Excluir raw payload sensible.
[ ] Crear WorkflowExport.
[ ] Crear SecureDocument.
[ ] Guardar secureDocumentId.
[ ] No devolver storageKey.
[ ] Auditar tenantWorkflowExport.created/completed.
```

---

## 40. Feature flags de seguridad

```text id="awb-sec-feature-flags"
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

Regla:

```text id="awb-sec-feature-flags-rule"
El boot debe fallar en MVP si se habilitan endpoints públicos, public webhooks, acceso WordPress, payloads ejecutables, raw SQL, secret storage, IA externa, pagos automáticos, contabilidad directa, confirmación de conciliación bancaria o control de hardware.
```

---

## 41. CI security gates

El pipeline debe fallar si:

```text id="awb-sec-ci-gates"
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

## 42. Checklist de revisión de seguridad

```text id="awb-sec-review-checklist"
[ ] Todas las rutas requieren AuthGuard.
[ ] Rutas tenant requieren TenantGuard.
[ ] Rutas tenant requieren PermissionGuard.
[ ] Rutas platform requieren PlatformPermissionGuard.
[ ] Rutas sensibles requieren SensitivePermissionGuard.
[ ] Recursos tenant-scoped usan id + tenantId.
[ ] Cross-tenant responde 404.
[ ] DTOs usan whitelist.
[ ] DTOs usan forbidNonWhitelisted.
[ ] No se acepta tenantId desde cliente.
[ ] No se aceptan actor fields desde cliente.
[ ] No se acepta versionNumber desde cliente.
[ ] No se acepta status directo fuera de transición.
[ ] No se acepta idempotencyKey arbitrario.
[ ] No se acepta storageKey.
[ ] No se aceptan secrets.
[ ] No se aceptan rawSql.
[ ] No se aceptan scripts.
[ ] No se acepta executableCode.
[ ] Trigger catalog es allowlisted.
[ ] Action catalog es allowlisted.
[ ] Active version es inmutable.
[ ] Activaciones usan lock.
[ ] Event-driven requiere sourceEventId.
[ ] Scheduled requiere scheduledWindowKey.
[ ] Manual requiere manualRunId.
[ ] Retries son finitos.
[ ] Dead letters están sanitizados.
[ ] Queue payload está sanitizado.
[ ] Logs están sanitizados.
[ ] Audit está sanitizado.
[ ] Exports usan SDS.
[ ] Response no expone storageKey.
[ ] No existen endpoints públicos.
[ ] No existen public webhooks.
[ ] WordPress público no accede.
[ ] No se ejecutan pagos.
[ ] No se crean JournalEntries.
[ ] No se confirma Bank Reconciliation.
[ ] No se controla hardware.
[ ] No se invoca IA externa con datos reales.
[ ] OpenAPI no documenta campos prohibidos.
[ ] CI security gates pasan.
```

---

## 43. Riesgos residuales

| Riesgo residual                                                      |      Nivel | Mitigación                                             |
| -------------------------------------------------------------------- | ---------: | ------------------------------------------------------ |
| TenantAdmin configura workflow con audiencia amplia                  | Medio/Alto | approval, rate limits, quiet hours, audit              |
| PlatformAdmin crea action definition demasiado permisiva             |       Alto | manageSensitive, review, CI, ADR para actions críticas |
| Worker reintenta acción no idempotente                               |       Alto | step idempotency, adapter contracts, retry tests       |
| Queue payload crece excesivamente                                    |      Medio | payload size limit, sanitizer, event payload allowlist |
| Logs funcionales capturan datos sensibles por error                  |       Alto | log sanitizer, CI no-secrets, security review          |
| Dead letter contiene error sensible                                  |       Alto | error sanitizer, stack trace stripping                 |
| Export legítimo se comparte fuera del sistema                        | Medio/Alto | SDS, permissions, reason, audit                        |
| Quiet hours mal configuradas generan notificaciones fuera de horario |      Medio | policies 025, tests, defaults seguros                  |
| Scheduler ejecuta ventana duplicada                                  |       Alto | scheduledWindowKey unique, locks                       |
| Action permitida cambia comportamiento futuro                        |       Alto | contract tests por adapter, catalog review             |
| Manual run masivo causa spam                                         |       Alto | rate limit, sensitive reason, permissions              |
| n8n futuro mal configurado exfiltra datos                            |       Alto | fuera de MVP, ADR, signed webhooks, secrets manager    |

---

## 44. Recomendaciones futuras

Estas capacidades requieren ADR, threat model, pruebas y aprobación explícita:

```text id="awb-sec-future-recommendations"
- webhooks firmados para integraciones externas;
- n8n productivo con datos no sensibles o anonimizados;
- secrets manager externo;
- workflows multi-aprobador;
- workflow simulation / dry-run avanzado;
- policy impact analysis;
- marketplace de workflow templates;
- action catalog versioning avanzado;
- connector framework seguro;
- workflow visual editor;
- saga orchestration avanzada;
- compensaciones distribuidas;
- workflow analytics avanzado;
- IA local o privada para análisis de workflows;
- IA externa solo con datos sintéticos o anonimización irreversible;
- integración con hardware físico;
- OCR de placas;
- biometría;
- reconocimiento facial.
```

Regla:

```text id="awb-sec-future-rule"
Ninguna capacidad futura relacionada con webhooks públicos, conectores externos, secretos, scripts, IA, pagos, contabilidad, conciliación bancaria, hardware, biometría u OCR debe implementarse como extensión menor del MVP; requiere ADR, especificación, security-notes, test-plan y aprobación explícita.
```

---

## 45. Criterios de aceptación de seguridad

```text id="awb-sec-acceptance"
[ ] Todas las rutas requieren autenticación.
[ ] Rutas tenant requieren TenantGuard.
[ ] Rutas tenant requieren PermissionGuard.
[ ] Rutas platform requieren PlatformPermissionGuard.
[ ] Rutas sensibles requieren SensitivePermissionGuard.
[ ] Cross-tenant responde 404.
[ ] DTOs rechazan tenantId.
[ ] DTOs rechazan actor fields.
[ ] DTOs rechazan versionNumber.
[ ] DTOs rechazan versionLabel.
[ ] DTOs rechazan status directo.
[ ] DTOs rechazan idempotencyKey arbitrario.
[ ] DTOs rechazan manualRunId arbitrario.
[ ] DTOs rechazan scheduledWindowKey arbitrario.
[ ] DTOs rechazan secrets.
[ ] DTOs rechazan scripts.
[ ] DTOs rechazan rawSql.
[ ] DTOs rechazan executableCode.
[ ] DTOs rechazan storageKey.
[ ] Responses no exponen storageKey.
[ ] Responses no exponen signedUrl persistente.
[ ] Trigger catalog es cerrado.
[ ] Action catalog es cerrado.
[ ] Workflow active version no se edita destructivamente.
[ ] Event-driven requiere sourceEventId.
[ ] Scheduled requiere scheduledWindowKey.
[ ] Manual run requiere manualRunId y actor server-side.
[ ] Toda execution requiere idempotencyKey.
[ ] Retries son finitos.
[ ] Dead letters están sanitizados.
[ ] Queue payload está sanitizado.
[ ] Logs están sanitizados.
[ ] Audit está sanitizado.
[ ] Export usa Secure Document Storage.
[ ] No existen endpoints públicos.
[ ] No existen public webhooks.
[ ] WordPress público no accede.
[ ] No se ejecutan pagos.
[ ] No se crean asientos contables.
[ ] No se confirma conciliación bancaria.
[ ] No se controla hardware.
[ ] No hay biometría.
[ ] No hay reconocimiento facial.
[ ] No hay IA externa con datos reales.
[ ] OpenAPI no documenta campos prohibidos.
[ ] CI security gates pasan.
```

---

## 46. No aceptación de seguridad

No se acepta el módulo si:

```text id="awb-sec-no-acceptance"
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
- acepta idempotencyKey arbitrario desde cliente;
- acepta manualRunId arbitrario desde cliente;
- acepta scheduledWindowKey arbitrario desde cliente;
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
- crea SupplierPayable;
- crea JournalEntry;
- crea JournalEntryLine;
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
- duplica ejecución de misma ventana scheduled;
- omite auditoría de ejecución crítica;
- logs contienen payload sensible;
- dead letters contienen stack trace productivo;
- exports contienen secrets.
```

---

## 47. Resultado esperado

Al aplicar estas notas de seguridad, `026-automation-workflows-basic` quedará protegido contra ejecución arbitraria, acceso cross-tenant, automatizaciones inseguras, exfiltración de datos, exposición pública, abuso de colas, duplicidad de acciones, filtración de secretos, uso indebido de workflows para pagos o contabilidad, control físico de hardware e integración externa no autorizada.

Resultado esperado:

```text id="awb-sec-expected-result"
auth obligatorio protegido
tenant isolation protegido
platform catalog protegido
tenant workflows protegidos
workflow versions protegidas
workflow activations protegidas
event-driven execution protegida
scheduled execution protegida
manual run protegido
idempotency protegida
queue payload protegido
Redis locks tenant-scoped protegidos
execution engine protegido
step execution protegido
retry finito protegido
dead letter sanitizado protegido
execution logs sanitizados protegidos
exports vía SDS protegidos
storageKey no expuesto
trigger allowlist protegida
action allowlist protegida
condition evaluator no ejecutable
action graph no ejecutable
no secrets storage
no raw SQL
no scripts
no executable payload
no public endpoints
no public webhooks
no WordPress access
no payment execution
no accounting execution
no bank reconciliation confirmation
no direct inventory mutation
no direct access event mutation
no hardware control
no biometric processing
no face recognition
no external AI with real data
audit completo
logs seguros
metrics seguras
OpenAPI seguro
CI security gates definidos
security review checklist definido
```

---

## 48. Expediente actualizado

```text id="awb-sec-expediente"
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
│   │       ├── tasks.md
│   │       └── security-notes.md
```

---

## 49. Cierre del paquete 026

Con este documento queda completo el paquete SDD del módulo:

```text id="awb-package-complete"
docs/specs/026-automation-workflows-basic/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```
