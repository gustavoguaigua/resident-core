# Spec — 026 Automation Workflows Basic

## 1. Información del documento

| Campo                 | Valor                                                                                         |
| --------------------- | --------------------------------------------------------------------------------------------- |
| Proyecto              | RESIDENT Core                                                                                 |
| Spec ID               | 026                                                                                           |
| Módulo                | Automation Workflows Basic                                                                    |
| Documento             | Functional Specification                                                                      |
| Ruta                  | `docs/specs/026-automation-workflows-basic/spec.md`                                           |
| Versión               | 0.1                                                                                           |
| Estado                | needs-review                                                                                  |
| Fecha                 | 2026-07-31                                                                                    |
| Fase                  | FASE 2 — RESIDENT Core                                                                        |
| Arquitectura objetivo | Monolito modular preparado para microservicios                                                |
| Stack objetivo        | NestJS / TypeScript / PostgreSQL / Prisma / OpenAPI / Keycloak / BullMQ / Redis               |
| Naturaleza            | Tenant-scoped / Event-driven / Workflow-governed / Audit-heavy / Non-public / Safe automation |

---

## 2. Propósito

El módulo `026-automation-workflows-basic` permite definir, activar, ejecutar y auditar automatizaciones básicas dentro de RESIDENT Core.

Su objetivo es coordinar flujos simples y seguros como recordatorios, notificaciones, generación programada de reportes, alertas operativas, tareas administrativas internas, escalamiento de eventos, avisos por vencimiento, validaciones periódicas y acciones permitidas entre módulos, siempre dentro del tenant correspondiente.

Este módulo no debe convertirse en un motor de scripting arbitrario, ni en una herramienta de automatización externa sin control, ni en una vía para ejecutar acciones sensibles sin autorización.

Regla central del módulo:

```text id="awb-rule"
Toda automatización, trigger, condición, acción, ejecución, reintento, resultado, log, exportación y evento de auditoría de Automation Workflows Basic debe pertenecer a un tenant, usar únicamente triggers y actions permitidos por catálogo, ejecutarse bajo autorización explícita, respetar tenant isolation, idempotencia, límites de frecuencia, auditoría completa, payloads sanitizados, ausencia de secretos, ausencia de scripts, ausencia de raw SQL, ausencia de código ejecutable, ausencia de webhooks públicos no controlados, ausencia de acceso desde WordPress público, ausencia de ejecución directa de pagos, ausencia de asientos contables directos, ausencia de conciliaciones automáticas, ausencia de control físico de hardware, ausencia de datos reales enviados a IA externa y ausencia de acciones destructivas no aprobadas.
```

---

## 3. Contexto dentro de RESIDENT Core

`Automation Workflows Basic` es un módulo transversal de orquestación controlada.

```text id="awb-context-map"
RESIDENT Core
├── Tenant Management
│   └── valida tenant activo
├── Users, Roles and Permissions
│   └── valida actor, permisos y ownership de workflows
├── Tenant Settings and Policies
│   └── define límites, políticas y habilitación de automatizaciones
├── Communications and Notifications
│   └── ejecuta notificaciones permitidas
├── Basic Reports
│   └── genera reportes programados
├── Secure Document Storage
│   └── almacena exportaciones y evidencias de ejecución
├── Audit
│   └── registra toda ejecución crítica
├── Financial Management
│   └── puede emitir eventos consumidos, pero no delega acciones financieras destructivas
├── Reservations / Meetings / Maintenance / Inventory / Access Control
│   └── emiten eventos operativos y consumen acciones permitidas
└── External Automation Tools
    └── integración futura controlada, por ejemplo n8n, sin exponer datos reales ni secretos en MVP
```

---

## 4. Problema que resuelve

Sin un módulo de automatizaciones gobernadas, las reglas repetitivas tienden a implementarse de forma dispersa en cada módulo, en cron jobs aislados, en scripts manuales, en integraciones externas no auditadas o en automatizaciones n8n sin control central.

Problemas a evitar:

```text id="awb-problems"
- automatizaciones dispersas sin auditoría;
- cron jobs hardcodeados;
- reglas repetitivas duplicadas en módulos;
- acciones automáticas sin idempotencia;
- notificaciones duplicadas;
- reportes programados sin trazabilidad;
- workflows ejecutándose fuera del tenant;
- automatizaciones externas con datos reales sin control;
- exposición accidental de secretos;
- scripts o SQL dinámico configurado por usuarios;
- webhooks públicos inseguros;
- acciones financieras ejecutadas sin aprobación;
- modificaciones destructivas sin evidencia;
- dependencia directa de WordPress para procesos internos;
- falta de historial de ejecución;
- imposibilidad de saber qué automatización generó una acción.
```

---

## 5. Objetivos funcionales

```text id="awb-objectives"
1. Definir automatizaciones básicas tenant-scoped.
2. Permitir triggers por evento interno.
3. Permitir triggers programados.
4. Permitir triggers manuales autorizados.
5. Permitir condiciones simples y declarativas.
6. Permitir actions desde un catálogo seguro.
7. Registrar ejecuciones.
8. Registrar resultados por paso.
9. Soportar reintentos controlados.
10. Soportar idempotencia.
11. Impedir automatizaciones cross-tenant.
12. Impedir scripts ejecutables.
13. Impedir raw SQL.
14. Impedir almacenamiento de secretos.
15. Impedir webhooks públicos inseguros.
16. Impedir acciones financieras destructivas directas.
17. Impedir control físico de hardware.
18. Impedir acceso desde WordPress público.
19. Impedir envío de datos reales a IA externa.
20. Integrarse con Audit, Notifications, Reports, SDS y Tenant Settings.
```

---

## 6. Principios de diseño

### 6.1. Automatización segura antes que automatización flexible

```text id="awb-principle-safe"
El MVP prioriza automatizaciones allowlisted, auditadas e idempotentes antes que flujos completamente configurables.
```

---

### 6.2. Catálogo cerrado de triggers y actions

```text id="awb-principle-catalog"
Todo trigger y toda action deben existir en un catálogo interno versionado. El usuario no puede crear código, SQL, scripts, expresiones dinámicas inseguras ni conectores arbitrarios.
```

---

### 6.3. Tenant isolation obligatorio

```text id="awb-principle-tenant"
Toda automatización, ejecución y resultado pertenece a un tenant. Un workflow de un tenant nunca puede leer ni ejecutar acciones sobre recursos de otro tenant.
```

---

### 6.4. Idempotencia obligatoria

```text id="awb-principle-idempotency"
Toda ejecución debe usar workflowExecutionId, idempotencyKey o sourceEventId para evitar acciones duplicadas.
```

---

### 6.5. Auditoría completa

```text id="awb-principle-audit"
Toda activación, desactivación, ejecución, fallo, reintento, cancelación y acción crítica debe ser auditable.
```

---

### 6.6. Automatización no reemplaza autorización del dominio

```text id="awb-principle-authz"
Automation Workflows Basic no omite reglas de negocio de los módulos consumidores; cada action debe invocar comandos o puertos autorizados del módulo dueño.
```

---

### 6.7. No secrets, no code

```text id="awb-principle-no-code"
Los workflows no almacenan secretos, scripts, SQL, tokens, credenciales, código ejecutable, comandos shell ni payloads dinámicos peligrosos.
```

---

### 6.8. No efectos destructivos por defecto

```text id="awb-principle-no-destructive"
El MVP no ejecuta acciones destructivas ni financieras críticas automáticamente. Las acciones sensibles requieren aprobación, permisos reforzados y módulo dueño.
```

---

## 7. Alcance MVP

### 7.1. Incluido

```text id="awb-scope-in"
- Catálogo de trigger definitions.
- Catálogo de action definitions.
- Workflow definitions por tenant.
- Workflow versions.
- Workflow activations.
- Event triggers internos.
- Scheduled triggers básicos.
- Manual triggers autorizados.
- Condiciones declarativas simples.
- Ejecuciones de workflow.
- Ejecuciones por paso.
- Reintentos controlados.
- Idempotency keys.
- Execution logs sanitizados.
- Dead-letter básico.
- Notificaciones como action permitida.
- Generación de reportes básicos como action permitida.
- Creación de tareas operativas internas permitidas.
- Escalamiento administrativo permitido.
- Exportación de historial vía Secure Document Storage.
- Auditoría obligatoria.
- Observabilidad.
- OpenAPI privado.
- Tests de multitenancy, seguridad, idempotencia y auditoría.
```

---

### 7.2. Fuera de alcance MVP

```text id="awb-scope-out"
- motor visual avanzado tipo BPMN;
- editor gráfico drag-and-drop;
- scripting JavaScript;
- Python dinámico;
- raw SQL;
- expresiones arbitrarias;
- conectores externos arbitrarios;
- secrets manager embebido;
- webhooks públicos sin firma;
- ejecución de pagos;
- creación directa de asientos contables;
- confirmación automática de conciliación bancaria;
- apertura de portones;
- control de hardware;
- biometría;
- reconocimiento facial;
- OCR automático;
- agentes IA con datos reales;
- integración directa full con n8n en producción con datos sensibles;
- workflows cross-tenant;
- marketplace de automatizaciones;
- workflows recursivos complejos;
- compensaciones distribuidas avanzadas;
- orquestación de larga duración estilo Saga completa;
- aprobación multi-firma avanzada;
- ejecución fuera de RESIDENT Core sin trazabilidad.
```

---

## 8. Tipos de automatización soportados

### 8.1. Event-driven workflows

Automatizaciones disparadas por eventos internos.

Ejemplos:

```text id="awb-event-driven-examples"
- Cuando se valida un pago, notificar al residente.
- Cuando se genera una multa, notificar al responsable.
- Cuando una reserva está próxima, enviar recordatorio.
- Cuando se registra un visitante, notificar a la unidad.
- Cuando una orden de mantenimiento cambia a completed, notificar al solicitante.
- Cuando un documento certificado se publica, notificar audiencia autorizada.
- Cuando hay check-ins abiertos por demasiado tiempo, notificar a seguridad.
```

Reglas:

```text id="awb-event-driven-rules"
- El evento debe ser interno y auditado.
- El evento debe incluir tenantId.
- El payload debe estar sanitizado.
- El workflow debe estar active.
- El trigger debe estar permitido.
- La ejecución debe ser idempotente por sourceEventId.
```

---

### 8.2. Scheduled workflows

Automatizaciones programadas por calendario o intervalo.

Ejemplos:

```text id="awb-scheduled-examples"
- Enviar recordatorio mensual de alícuotas.
- Generar reporte semanal de morosidad.
- Generar reporte mensual de accesos.
- Revisar autorizaciones vencidas de visitantes.
- Revisar check-ins abiertos.
- Enviar resumen semanal de mantenimiento.
- Exportar reporte administrativo mensual.
```

Reglas:

```text id="awb-scheduled-rules"
- La programación debe ser tenant-scoped.
- Debe respetar timezone del tenant.
- Debe respetar quiet hours si aplica.
- Debe tener límite de frecuencia.
- Debe generar idempotencyKey por ventana.
- No debe ejecutar acciones financieras destructivas.
```

---

### 8.3. Manual workflows

Automatizaciones iniciadas manualmente por usuario autorizado.

Ejemplos:

```text id="awb-manual-examples"
- Reenviar notificaciones de una reunión.
- Generar reporte bajo demanda.
- Ejecutar recordatorio de pago para unidades filtradas.
- Ejecutar revisión de check-ins abiertos.
- Ejecutar export de historial de automatizaciones.
```

Reglas:

```text id="awb-manual-rules"
- Requiere autenticación.
- Requiere permiso explícito.
- Requiere tenant context.
- Requiere reason si afecta muchos destinatarios o datos sensibles.
- Debe auditarse.
```

---

## 9. Entidades funcionales

### 9.1. WorkflowTriggerDefinition

Define un tipo de trigger permitido por la plataforma.

Campos conceptuales:

```text id="awb-entity-trigger-definition"
- id;
- triggerKey;
- category;
- sourceModule;
- triggerType;
- eventName;
- schema;
- description;
- sensitivity;
- isTenantEnabled;
- status;
```

Reglas:

```text id="awb-trigger-definition-rules"
- Solo PlatformAdmin autorizado gestiona definitions.
- triggerKey debe ser único.
- sourceModule debe existir.
- schema valida triggerConfig.
- No contiene secretos.
- No permite scripts.
```

---

### 9.2. WorkflowActionDefinition

Define una action permitida.

Campos conceptuales:

```text id="awb-entity-action-definition"
- id;
- actionKey;
- category;
- targetModule;
- actionType;
- schema;
- description;
- sensitivity;
- requiresPermission;
- requiresApproval;
- isDestructive;
- isFinancial;
- isExternal;
- status;
```

Reglas:

```text id="awb-action-definition-rules"
- actionKey debe ser único.
- targetModule obligatorio.
- schema valida actionConfig.
- isDestructive=true queda deshabilitado en MVP salvo allowlist explícita.
- isFinancial=true no puede ejecutar pagos ni contabilidad directa.
- No contiene secretos.
- No contiene scripts.
```

---

### 9.3. TenantWorkflowDefinition

Representa una automatización creada para un tenant.

Campos conceptuales:

```text id="awb-entity-workflow-definition"
- id;
- tenantId;
- workflowCode;
- name;
- description;
- category;
- status;
- ownerUserProfileId;
- createdBy;
- updatedBy;
- archivedBy;
- createdAt;
- updatedAt;
- archivedAt;
```

Reglas:

```text id="awb-workflow-definition-rules"
- tenantId obligatorio.
- workflowCode único por tenant.
- status controla lifecycle general.
- No ejecuta nada sin versión activa.
- No permite scripts.
- No permite secretos.
```

---

### 9.4. TenantWorkflowVersion

Define una versión concreta del workflow.

Campos conceptuales:

```text id="awb-entity-workflow-version"
- id;
- tenantId;
- workflowDefinitionId;
- versionNumber;
- versionLabel;
- triggerDefinitionId;
- triggerConfig;
- conditionConfig;
- actionGraph;
- status;
- effectiveFrom;
- effectiveUntil;
- changeReason;
- createdBy;
- reviewedBy;
- approvedBy;
- activatedBy;
- archivedBy;
- timestamps;
```

Reglas:

```text id="awb-workflow-version-rules"
- VersionNumber se genera server-side.
- triggerConfig valida contra trigger schema.
- conditionConfig usa operadores permitidos.
- actionGraph usa actions permitidas.
- active no se edita destructivamente.
- Cambios crean nueva versión.
- Payload no ejecutable.
```

---

### 9.5. TenantWorkflowActivation

Registra activación, desactivación o programación de una versión.

Campos conceptuales:

```text id="awb-entity-activation"
- id;
- tenantId;
- workflowDefinitionId;
- workflowVersionId;
- activationType;
- status;
- effectiveFrom;
- effectiveUntil;
- activationReason;
- previousWorkflowVersionId;
- activatedBy;
- deactivatedBy;
- timestamps;
```

Reglas:

```text id="awb-activation-rules"
- Toda activación se audita.
- Solo una versión activa por workflow y effectiveAt.
- Desactivación no borra historial.
- Programación futura no ejecuta antes de effectiveFrom.
```

---

### 9.6. WorkflowExecution

Representa una ejecución de workflow.

Campos conceptuales:

```text id="awb-entity-execution"
- id;
- tenantId;
- workflowDefinitionId;
- workflowVersionId;
- triggerDefinitionId;
- sourceEventId;
- scheduledWindowKey;
- manualRunId;
- idempotencyKey;
- status;
- triggerType;
- startedAt;
- finishedAt;
- failedAt;
- cancelledAt;
- retryCount;
- maxRetries;
- failureReason;
- triggeredByUserProfileId;
- correlationId;
- traceId;
```

Reglas:

```text id="awb-execution-rules"
- tenantId obligatorio.
- idempotencyKey obligatorio.
- sourceEventId único por workflow si trigger event-driven.
- scheduledWindowKey único por workflow si scheduled.
- Execution no debe contener payload sensible completo.
- No physical delete ordinario.
```

---

### 9.7. WorkflowStepExecution

Representa la ejecución de una action dentro del workflow.

Campos conceptuales:

```text id="awb-entity-step-execution"
- id;
- tenantId;
- workflowExecutionId;
- stepKey;
- actionDefinitionId;
- actionKey;
- status;
- startedAt;
- finishedAt;
- failedAt;
- retryCount;
- failureReason;
- inputSanitized;
- outputSanitized;
- targetResourceType;
- targetResourceId;
```

Reglas:

```text id="awb-step-execution-rules"
- Cada step pertenece al mismo tenant que execution.
- input/output se sanitizan.
- No secrets.
- No storageKey.
- No raw PII si no es estrictamente necesario.
- No action fuera de catálogo.
```

---

### 9.8. WorkflowExecutionLog

Log funcional sanitizado de ejecución.

Campos conceptuales:

```text id="awb-entity-execution-log"
- id;
- tenantId;
- workflowExecutionId;
- level;
- message;
- metadataSanitized;
- createdAt;
```

Reglas:

```text id="awb-execution-log-rules"
- No contiene secretos.
- No contiene tokens.
- No contiene payload raw.
- No contiene storageKey.
- No contiene datos cross-tenant.
```

---

### 9.9. WorkflowDeadLetter

Registra ejecuciones fallidas no recuperables.

Campos conceptuales:

```text id="awb-entity-dead-letter"
- id;
- tenantId;
- workflowExecutionId;
- workflowDefinitionId;
- workflowVersionId;
- reasonCode;
- failureReason;
- retryCount;
- lastErrorSanitized;
- status;
- createdAt;
- resolvedAt;
- resolvedBy;
```

Reglas:

```text id="awb-dead-letter-rules"
- Se crea cuando se agotan retries.
- Debe permitir revisión administrativa.
- No reintenta automáticamente indefinidamente.
- Resolución requiere permiso.
```

---

### 9.10. WorkflowExport

Exportación administrativa de ejecuciones e historial.

Campos conceptuales:

```text id="awb-entity-export"
- id;
- tenantId;
- exportType;
- format;
- filters;
- status;
- secureDocumentId;
- requestedBy;
- completedAt;
- failedAt;
- failureReason;
- createdAt;
```

Reglas:

```text id="awb-export-rules"
- Usa Secure Document Storage.
- No devuelve storageKey.
- Export sensible requiere permiso reforzado.
- Filtros y contenido sanitizados.
```

---

## 10. Catálogo inicial de triggers MVP

### 10.1. Triggers financieros informativos

```text id="awb-triggers-financial"
financial.chargeCreated
financial.chargeDueSoon
financial.chargeOverdue
payments.paymentSubmitted
payments.paymentValidated
payments.paymentRejected
accountStatements.statementGenerated
```

Restricción:

```text id="awb-triggers-financial-rule"
Estos triggers pueden iniciar notificaciones, reportes o tareas administrativas, pero no crean pagos, no validan pagos, no asignan pagos, no reversan pagos y no crean asientos contables.
```

---

### 10.2. Triggers de reservas

```text id="awb-triggers-reservations"
reservations.reservationCreated
reservations.reservationApproved
reservations.reservationCancelled
reservations.reservationStartingSoon
```

---

### 10.3. Triggers de multas

```text id="awb-triggers-fines"
fines.fineCreated
fines.fineAppealSubmitted
fines.fineAppealResolved
```

---

### 10.4. Triggers de reuniones y votaciones

```text id="awb-triggers-meetings"
meetings.meetingScheduled
meetings.meetingStartingSoon
meetings.attendanceClosed
voting.votingOpened
voting.votingClosed
certifiedMinutes.minutesPublished
```

---

### 10.5. Triggers de comunicaciones

```text id="awb-triggers-communications"
communications.notificationFailed
communications.criticalNoticeUnread
communications.deliveryCompleted
```

---

### 10.6. Triggers documentales

```text id="awb-triggers-documents"
documents.documentCreated
documents.documentPublished
documents.documentDownloadFailed
```

---

### 10.7. Triggers de mantenimiento

```text id="awb-triggers-maintenance"
maintenance.requestCreated
maintenance.workOrderAssigned
maintenance.workOrderCompleted
maintenance.workOrderOverdue
```

---

### 10.8. Triggers de inventario

```text id="awb-triggers-inventory"
inventory.lowStockDetected
inventory.stockAdjustmentApproved
inventory.consumptionPosted
```

---

### 10.9. Triggers de accesos y visitantes

```text id="awb-triggers-access"
access.visitorAuthorizationCreated
access.visitorCheckedIn
access.visitorCheckedOut
access.deniedAccessRecorded
access.openCheckInExceeded
access.incidentCreated
```

---

### 10.10. Triggers programados

```text id="awb-triggers-scheduled"
schedule.daily
schedule.weekly
schedule.monthly
schedule.cronBasic
```

Regla:

```text id="awb-schedule-cron-basic-rule"
schedule.cronBasic solo permite expresiones validadas, con frecuencia mínima controlada, timezone del tenant y sin comandos ejecutables.
```

---

### 10.11. Triggers manuales

```text id="awb-triggers-manual"
manual.runWorkflow
manual.generateReport
manual.sendReminder
manual.reprocessFailedExecution
```

---

## 11. Catálogo inicial de actions MVP

### 11.1. Actions de notificación

```text id="awb-actions-notifications"
notifications.sendToResident
notifications.sendToUnit
notifications.sendToRole
notifications.sendToTenantAdmins
notifications.sendCriticalAlert
notifications.sendDigest
```

Reglas:

```text id="awb-actions-notification-rules"
- La entrega la ejecuta Communications and Notifications.
- Debe respetar quiet hours salvo emergencia.
- Debe validar audiencia tenant-scoped.
- No debe exponer datos sensibles innecesarios.
```

---

### 11.2. Actions de reportes

```text id="awb-actions-reports"
reports.generateBasicReport
reports.generateAndStoreExport
reports.sendReportLinkToAdmins
```

Reglas:

```text id="awb-actions-report-rules"
- Reportes se generan mediante Basic Reports o módulo dueño.
- Exportaciones usan Secure Document Storage.
- No se devuelve storageKey.
- Reportes sensibles requieren permiso reforzado.
```

---

### 11.3. Actions documentales

```text id="awb-actions-documents"
documents.createExportReference
documents.notifyDocumentAvailable
```

Reglas:

```text id="awb-actions-docs-rules"
- Documentos se gestionan por Secure Document Storage.
- Automation solo referencia secureDocumentId.
- No acepta base64.
- No acepta rawFilePayload.
```

---

### 11.4. Actions operativas no destructivas

```text id="awb-actions-operational"
operations.createAdministrativeTask
operations.createFollowUpReminder
operations.markWorkflowNote
operations.escalateToRole
operations.createReviewRequest
```

Reglas:

```text id="awb-actions-operational-rules"
- Acciones no destructivas.
- No cambian saldos.
- No cambian inventario.
- No validan pagos.
- No cierran conciliaciones.
- No abren portones.
```

---

### 11.5. Actions permitidas sobre módulos consumidores

```text id="awb-actions-consumer"
maintenance.notifyWorkOrderOverdue
access.notifyOpenCheckInExceeded
inventory.notifyLowStock
reservations.notifyUpcomingReservation
meetings.notifyUpcomingMeeting
payments.notifyPaymentValidationResult
dues.notifyChargeDueSoon
```

Regla:

```text id="awb-actions-consumer-rule"
Estas actions deben invocar puertos del módulo dueño y no escribir directamente en sus tablas.
```

---

### 11.6. Actions prohibidas en MVP

```text id="awb-actions-forbidden"
payments.createPayment
payments.validatePaymentAutomatically
payments.reversePayment
accounting.createJournalEntry
bankReconciliation.confirmMatch
supplierPayments.createPaymentOrder
dues.generateChargesAutomaticallyFromWorkflow
inventory.postStockAdjustmentAutomatically
inventory.postTransferAutomatically
access.openGate
access.controlHardware
documents.exposeStorageKey
external.callUntrustedWebhook
external.sendRealDataToAI
system.executeScript
system.executeSql
system.executeShellCommand
```

---

## 12. Actores

### 12.1. PlatformAdmin

Puede:

```text id="awb-actor-platform-can"
- gestionar trigger definitions;
- gestionar action definitions;
- habilitar catálogo de automatizaciones;
- revisar fallos globales sin datos tenant sensibles salvo permiso;
- definir templates base no sensibles.
```

No puede automáticamente:

```text id="awb-actor-platform-cannot"
- ejecutar workflows de tenant sin contexto y permiso;
- ver payloads sensibles de tenant sin autorización;
- crear webhooks públicos;
- almacenar secretos en workflows.
```

---

### 12.2. TenantAdmin

Puede, según permisos:

```text id="awb-actor-tenant-admin-can"
- crear workflows del tenant;
- editar versiones draft;
- activar workflows aprobados;
- desactivar workflows;
- ejecutar workflows manuales permitidos;
- consultar ejecuciones;
- revisar dead letters;
- exportar historial.
```

---

### 12.3. BoardMember / Comité

Puede, según permisos:

```text id="awb-actor-board-can"
- revisar workflows sensibles;
- aprobar workflows sensibles;
- consultar historial;
- revisar ejecuciones críticas.
```

---

### 12.4. FinancialManager

Puede, según permisos:

```text id="awb-actor-financial-can"
- crear workflows informativos financieros;
- programar recordatorios de pago;
- programar reportes financieros;
- consultar ejecuciones financieras;
- no ejecutar pagos ni asientos desde workflows.
```

---

### 12.5. SecurityManager

Puede, según permisos:

```text id="awb-actor-security-can"
- crear workflows de alertas de acceso;
- configurar alertas de check-ins abiertos;
- escalar incidentes;
- revisar ejecuciones de seguridad.
```

---

### 12.6. Resident / PropertyOwner

Puede en MVP:

```text id="awb-actor-resident-can"
- recibir notificaciones generadas por workflows;
- no crear workflows;
- no ejecutar workflows;
- no consultar historial de automatización.
```

---

### 12.7. System

Puede:

```text id="awb-actor-system-can"
- recibir eventos internos;
- evaluar triggers;
- encolar ejecuciones;
- ejecutar actions permitidas;
- reintentar según política;
- registrar logs;
- mover a dead letter;
- auditar eventos.
```

No puede:

```text id="awb-actor-system-cannot"
- saltarse tenant isolation;
- ejecutar scripts;
- ejecutar SQL dinámico;
- crear pagos;
- crear asientos;
- confirmar conciliaciones;
- controlar hardware;
- enviar datos reales a IA externa.
```

---

## 13. Permisos

Permisos mínimos:

```text id="awb-permissions"
automationTriggerDefinitions.read
automationTriggerDefinitions.create
automationTriggerDefinitions.update
automationTriggerDefinitions.archive

automationActionDefinitions.read
automationActionDefinitions.create
automationActionDefinitions.update
automationActionDefinitions.archive

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

Permisos reforzados:

```text id="awb-sensitive-permissions"
tenantWorkflows.approveSensitive
tenantWorkflows.activateSensitive
tenantWorkflowExecutions.runSensitive
tenantWorkflowExecutions.retrySensitive
tenantWorkflowExports.exportSensitive
automationCatalog.manageSensitive
```

Reglas:

```text id="awb-permission-rules"
- Resident no administra workflows.
- Guard no administra workflows por defecto.
- PlatformAdmin no hereda acceso automático a workflows tenant.
- Actions sensibles requieren permisos reforzados.
- Manual run requiere permiso explícito.
```

---

## 14. Estados

### 14.1. WorkflowDefinitionStatus

```text id="awb-status-workflow-definition"
draft
active
inactive
archived
```

---

### 14.2. WorkflowVersionStatus

```text id="awb-status-workflow-version"
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

### 14.3. WorkflowActivationStatus

```text id="awb-status-activation"
scheduled
active
deactivated
cancelled
failed
archived
```

---

### 14.4. WorkflowExecutionStatus

```text id="awb-status-execution"
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

### 14.5. WorkflowStepExecutionStatus

```text id="awb-status-step"
pending
running
succeeded
failed
skipped
retrying
cancelled
```

---

### 14.6. WorkflowDeadLetterStatus

```text id="awb-status-dead-letter"
open
underReview
resolved
ignored
archived
```

---

### 14.7. WorkflowExportStatus

```text id="awb-status-export"
requested
processing
completed
failed
archived
```

---

## 15. Flujos funcionales

### 15.1. Crear workflow

```text id="awb-flow-create-workflow"
1. Usuario autorizado crea TenantWorkflowDefinition.
2. Sistema valida tenant activo.
3. Sistema valida permisos.
4. Sistema crea workflow en estado draft.
5. Sistema audita tenantWorkflow.created.
```

---

### 15.2. Crear versión de workflow

```text id="awb-flow-create-version"
1. Usuario crea una versión draft.
2. Sistema valida triggerDefinition.
3. Sistema valida actionDefinitions.
4. Sistema valida triggerConfig contra schema.
5. Sistema valida conditionConfig.
6. Sistema valida actionGraph.
7. Sistema rechaza secretos, scripts, rawSql y código ejecutable.
8. Sistema genera versionNumber.
9. Sistema guarda draft.
10. Sistema audita tenantWorkflowVersion.created.
```

---

### 15.3. Aprobar y activar workflow

```text id="awb-flow-approve-activate"
1. Usuario envía versión a revisión.
2. Aprobador autorizado aprueba.
3. Usuario autorizado activa versión.
4. Sistema valida no solapamiento.
5. Sistema crea WorkflowActivation.
6. Sistema marca versión active o scheduled.
7. Sistema desactiva versión anterior según vigencia.
8. Sistema audita activación.
```

---

### 15.4. Ejecutar workflow por evento

```text id="awb-flow-event-execution"
1. Módulo interno emite evento con tenantId.
2. Sistema identifica workflows activos compatibles.
3. Sistema valida idempotencyKey por sourceEventId.
4. Sistema evalúa condiciones.
5. Si condiciones se cumplen, crea WorkflowExecution queued.
6. Worker ejecuta steps permitidos.
7. Cada step registra resultado.
8. Sistema marca ejecución succeeded, partiallySucceeded o failed.
9. Sistema audita ejecución.
```

---

### 15.5. Ejecutar workflow programado

```text id="awb-flow-scheduled-execution"
1. Scheduler calcula ventana por timezone del tenant.
2. Sistema identifica workflows scheduled activos.
3. Sistema genera scheduledWindowKey.
4. Sistema valida idempotencia.
5. Sistema encola ejecución.
6. Worker ejecuta steps.
7. Sistema registra resultados y audit.
```

---

### 15.6. Ejecutar workflow manual

```text id="awb-flow-manual-execution"
1. Usuario autorizado solicita ejecución manual.
2. Sistema valida permisos.
3. Sistema exige reason si es sensible.
4. Sistema genera manualRunId e idempotencyKey.
5. Sistema encola ejecución.
6. Sistema registra actor.
7. Sistema audita manual run.
```

---

### 15.7. Reintentar ejecución fallida

```text id="awb-flow-retry"
1. Ejecución falla.
2. Sistema valida retry policy.
3. Sistema reintenta hasta maxRetries.
4. Si se agotan retries, crea WorkflowDeadLetter.
5. Admin autorizado revisa dead letter.
6. Admin puede resolver, ignorar o reintentar manualmente si tiene permiso.
```

---

## 16. Reglas de negocio

### 16.1. Reglas generales

```text id="awb-br-general"
BR-001 Todo workflow debe pertenecer a un tenant.
BR-002 Toda ejecución debe pertenecer a un tenant.
BR-003 Todo step debe pertenecer al mismo tenant que la ejecución.
BR-004 Todo trigger debe existir en catálogo.
BR-005 Toda action debe existir en catálogo.
BR-006 Workflow sin versión activa no se ejecuta.
BR-007 Version active no se edita destructivamente.
BR-008 Cambios de workflow crean nueva versión.
BR-009 Ejecuciones críticas se auditan.
BR-010 Cross-tenant responde 404.
```

---

### 16.2. Reglas de triggers

```text id="awb-br-triggers"
BR-011 Event trigger requiere sourceEventId.
BR-012 Event trigger requiere tenantId.
BR-013 Event trigger requiere eventName permitido.
BR-014 Scheduled trigger requiere scheduleConfig válido.
BR-015 Scheduled trigger respeta timezone del tenant.
BR-016 Manual trigger requiere usuario autenticado.
BR-017 Manual trigger requiere permiso runManual.
BR-018 TriggerConfig debe validar contra schema.
BR-019 No se permiten triggers externos públicos en MVP.
BR-020 No se permiten triggers desde WordPress público.
```

---

### 16.3. Reglas de actions

```text id="awb-br-actions"
BR-021 Action debe existir en catálogo.
BR-022 ActionConfig debe validar contra schema.
BR-023 Action sensible requiere permiso reforzado.
BR-024 Action destructiva no está permitida en MVP salvo allowlist explícita.
BR-025 Action financiera no puede crear pago ni asiento.
BR-026 Action no puede ejecutar SQL.
BR-027 Action no puede ejecutar scripts.
BR-028 Action no puede controlar hardware.
BR-029 Action no puede enviar datos reales a IA externa.
BR-030 Action debe invocar puerto del módulo dueño.
```

---

### 16.4. Reglas de condiciones

```text id="awb-br-conditions"
BR-031 Condiciones solo usan operadores permitidos.
BR-032 Condiciones no son código ejecutable.
BR-033 Condiciones no usan eval.
BR-034 Condiciones no usan Function constructor.
BR-035 Condiciones no usan raw SQL.
BR-036 Condiciones no acceden a datos cross-tenant.
BR-037 Condiciones deben operar sobre payload sanitizado.
```

---

### 16.5. Reglas de idempotencia

```text id="awb-br-idempotency"
BR-038 Toda ejecución requiere idempotencyKey.
BR-039 Event-driven usa sourceEventId como parte de idempotencyKey.
BR-040 Scheduled usa scheduledWindowKey como parte de idempotencyKey.
BR-041 Manual usa manualRunId como parte de idempotencyKey.
BR-042 No se ejecuta dos veces el mismo workflow para la misma key.
BR-043 Reintentos reutilizan executionId original o retry lineage.
```

---

### 16.6. Reglas de retries

```text id="awb-br-retries"
BR-044 Retry policy debe tener maxRetries.
BR-045 Retry policy debe tener backoff permitido.
BR-046 No hay retries infinitos.
BR-047 Error no recuperable va a dead letter.
BR-048 Reintento manual requiere permiso.
BR-049 Reintento sensible requiere permiso reforzado.
```

---

### 16.7. Reglas de seguridad

```text id="awb-br-security"
BR-050 No se aceptan secrets.
BR-051 No se aceptan tokens.
BR-052 No se aceptan storageKey.
BR-053 No se aceptan scripts.
BR-054 No se acepta rawSql.
BR-055 No se acepta executableCode.
BR-056 No existen endpoints públicos.
BR-057 WordPress público no accede.
BR-058 No se envían datos reales a IA externa.
BR-059 Logs se sanitizan.
BR-060 Exports usan Secure Document Storage.
```

---

### 16.8. Reglas de límites de dominio

```text id="awb-br-boundaries"
BR-061 El módulo no crea pagos.
BR-062 El módulo no valida pagos automáticamente.
BR-063 El módulo no reversa pagos.
BR-064 El módulo no crea SupplierPaymentOrder.
BR-065 El módulo no crea JournalEntry.
BR-066 El módulo no confirma Bank Reconciliation.
BR-067 El módulo no modifica stock directamente.
BR-068 El módulo no abre portones.
BR-069 El módulo no controla hardware.
BR-070 El módulo no modifica eventos críticos de otros módulos directamente.
```

---

## 17. User stories

### US-001 — Crear workflow básico

Como TenantAdmin, quiero crear un workflow básico para automatizar recordatorios o notificaciones repetitivas del conjunto.

Acceptance criteria:

```text id="awb-us001-ac"
[ ] Requiere autenticación.
[ ] Requiere tenantWorkflows.create.
[ ] Crea workflow tenant-scoped.
[ ] No acepta tenantId desde cliente.
[ ] No ejecuta nada sin versión activa.
```

---

### US-002 — Crear versión de workflow

Como TenantAdmin, quiero definir trigger, condiciones y actions permitidas dentro de una versión de workflow.

Acceptance criteria:

```text id="awb-us002-ac"
[ ] Requiere tenantWorkflows.updateDraft.
[ ] Trigger debe existir en catálogo.
[ ] Actions deben existir en catálogo.
[ ] Configs validan contra schema.
[ ] Se rechazan scripts y secrets.
[ ] Se genera versionNumber server-side.
```

---

### US-003 — Aprobar workflow sensible

Como BoardMember autorizado, quiero aprobar workflows sensibles antes de activarlos.

Acceptance criteria:

```text id="awb-us003-ac"
[ ] Requiere tenantWorkflows.approve.
[ ] Workflow sensible requiere tenantWorkflows.approveSensitive.
[ ] Solo reviewReady puede aprobarse.
[ ] Registra approvedBy y approvedAt server-side.
[ ] Audita tenantWorkflowVersion.approved.
```

---

### US-004 — Activar workflow

Como TenantAdmin autorizado, quiero activar una versión aprobada para que pueda ejecutarse.

Acceptance criteria:

```text id="awb-us004-ac"
[ ] Requiere tenantWorkflows.activate.
[ ] Valida versión approved.
[ ] Valida effectiveFrom.
[ ] Crea activation.
[ ] No solapa versiones activas.
[ ] Audita tenantWorkflowVersion.activated.
```

---

### US-005 — Ejecutar workflow por evento

Como sistema, quiero ejecutar workflows activos cuando ocurre un evento interno permitido.

Acceptance criteria:

```text id="awb-us005-ac"
[ ] Evento incluye tenantId.
[ ] Evento incluye sourceEventId.
[ ] Workflow está active.
[ ] Trigger coincide.
[ ] Idempotency evita duplicados.
[ ] Resultado queda registrado.
```

---

### US-006 — Ejecutar workflow programado

Como sistema, quiero ejecutar workflows programados respetando timezone del tenant.

Acceptance criteria:

```text id="awb-us006-ac"
[ ] Usa timezone del tenant.
[ ] Genera scheduledWindowKey.
[ ] Respeta frecuencia mínima.
[ ] No duplica ejecución de la misma ventana.
[ ] Audita ejecución programada.
```

---

### US-007 — Ejecutar workflow manual

Como TenantAdmin, quiero ejecutar manualmente un workflow permitido.

Acceptance criteria:

```text id="awb-us007-ac"
[ ] Requiere tenantWorkflowExecutions.runManual.
[ ] Requiere reason si sensible.
[ ] Genera manualRunId.
[ ] Registra actor.
[ ] Audita manual run.
```

---

### US-008 — Consultar ejecuciones

Como TenantAdmin, quiero consultar el historial de ejecuciones de automatizaciones del tenant.

Acceptance criteria:

```text id="awb-us008-ac"
[ ] Requiere tenantWorkflowExecutions.read.
[ ] Lista solo ejecuciones del tenant.
[ ] Permite filtrar por workflow, status y fecha.
[ ] No expone payload raw sensible.
```

---

### US-009 — Reintentar ejecución fallida

Como TenantAdmin autorizado, quiero reintentar una ejecución fallida si el error es recuperable.

Acceptance criteria:

```text id="awb-us009-ac"
[ ] Requiere tenantWorkflowExecutions.retry.
[ ] Requiere permiso sensible si workflow/action es sensible.
[ ] Respeta maxRetries.
[ ] Mantiene idempotencia.
[ ] Audita retry.
```

---

### US-010 — Revisar dead letters

Como administrador, quiero revisar ejecuciones fallidas no recuperables.

Acceptance criteria:

```text id="awb-us010-ac"
[ ] Requiere tenantWorkflowExecutions.resolveDeadLetter.
[ ] Muestra error sanitizado.
[ ] Permite resolver o ignorar.
[ ] No borra ejecución.
[ ] Audita resolución.
```

---

### US-011 — Exportar historial de automatizaciones

Como TenantAdmin, quiero exportar ejecuciones e historial para auditoría.

Acceptance criteria:

```text id="awb-us011-ac"
[ ] Requiere tenantWorkflowExports.create.
[ ] Export sensible requiere tenantWorkflowExports.exportSensitive.
[ ] Usa Secure Document Storage.
[ ] Devuelve secureDocumentId.
[ ] No devuelve storageKey.
```

---

## 18. Requerimientos funcionales

### 18.1. Trigger definitions

```text id="awb-fr-trigger-definitions"
FR-001 El sistema debe permitir listar trigger definitions.
FR-002 El sistema debe permitir crear trigger definitions a PlatformAdmin autorizado.
FR-003 El sistema debe permitir actualizar trigger definitions.
FR-004 El sistema debe permitir archivar trigger definitions.
FR-005 El sistema debe validar trigger schema.
FR-006 El sistema debe impedir triggers con scripts o secrets.
FR-007 El sistema debe impedir triggers públicos no firmados.
```

---

### 18.2. Action definitions

```text id="awb-fr-action-definitions"
FR-008 El sistema debe permitir listar action definitions.
FR-009 El sistema debe permitir crear action definitions a PlatformAdmin autorizado.
FR-010 El sistema debe permitir actualizar action definitions.
FR-011 El sistema debe permitir archivar action definitions.
FR-012 El sistema debe validar action schema.
FR-013 El sistema debe marcar actions sensibles.
FR-014 El sistema debe impedir actions prohibidas en MVP.
```

---

### 18.3. Workflow definitions

```text id="awb-fr-workflows"
FR-015 El sistema debe permitir crear workflows por tenant.
FR-016 El sistema debe permitir listar workflows del tenant.
FR-017 El sistema debe permitir consultar un workflow.
FR-018 El sistema debe permitir archivar workflows.
FR-019 El sistema debe impedir workflows cross-tenant.
FR-020 El sistema debe impedir ejecución sin versión activa.
```

---

### 18.4. Workflow versions

```text id="awb-fr-versions"
FR-021 El sistema debe permitir crear workflow versions.
FR-022 El sistema debe generar versionNumber server-side.
FR-023 El sistema debe validar triggerConfig.
FR-024 El sistema debe validar conditionConfig.
FR-025 El sistema debe validar actionGraph.
FR-026 El sistema debe permitir submit review.
FR-027 El sistema debe permitir approve/reject.
FR-028 El sistema debe permitir activate/schedule/deactivate.
FR-029 El sistema debe impedir editar active destructivamente.
FR-030 El sistema debe conservar historial.
```

---

### 18.5. Executions

```text id="awb-fr-executions"
FR-031 El sistema debe crear execution queued.
FR-032 El sistema debe ejecutar steps permitidos.
FR-033 El sistema debe registrar step status.
FR-034 El sistema debe registrar startedAt/finishedAt.
FR-035 El sistema debe registrar failureReason sanitizado.
FR-036 El sistema debe soportar retries.
FR-037 El sistema debe soportar dead letter.
FR-038 El sistema debe soportar cancelación controlada.
FR-039 El sistema debe consultar ejecuciones tenant-scoped.
FR-040 El sistema debe impedir ejecución duplicada por idempotencyKey.
```

---

### 18.6. Scheduled workflows

```text id="awb-fr-scheduled"
FR-041 El sistema debe soportar schedule diario.
FR-042 El sistema debe soportar schedule semanal.
FR-043 El sistema debe soportar schedule mensual.
FR-044 El sistema debe soportar cron básico validado.
FR-045 El sistema debe respetar timezone del tenant.
FR-046 El sistema debe generar scheduledWindowKey.
FR-047 El sistema debe impedir frecuencia abusiva.
```

---

### 18.7. Manual workflows

```text id="awb-fr-manual"
FR-048 El sistema debe permitir manual run.
FR-049 Manual run requiere permiso.
FR-050 Manual run sensible requiere reason.
FR-051 Manual run registra actor.
FR-052 Manual run se audita.
```

---

### 18.8. Exportaciones

```text id="awb-fr-exports"
FR-053 El sistema debe exportar workflows.
FR-054 El sistema debe exportar executions.
FR-055 El sistema debe exportar dead letters.
FR-056 Export usa Secure Document Storage.
FR-057 Export devuelve secureDocumentId.
FR-058 Export no devuelve storageKey.
FR-059 Export se audita.
```

---

### 18.9. Seguridad funcional

```text id="awb-fr-security"
FR-060 El sistema debe rechazar tenantId desde cliente.
FR-061 El sistema debe rechazar actor fields.
FR-062 El sistema debe rechazar scripts.
FR-063 El sistema debe rechazar rawSql.
FR-064 El sistema debe rechazar secrets.
FR-065 El sistema debe rechazar storageKey.
FR-066 El sistema debe impedir endpoints públicos.
FR-067 El sistema debe impedir acceso WordPress público.
FR-068 El sistema debe impedir efectos financieros directos.
FR-069 El sistema debe impedir IA externa con datos reales.
FR-070 El sistema debe auditar operaciones críticas.
```

---

## 19. Requerimientos no funcionales

### 19.1. Seguridad

```text id="awb-nfr-security"
NFR-001 Todas las rutas requieren autenticación.
NFR-002 Todas las rutas tenant requieren TenantGuard.
NFR-003 Todas las rutas requieren PermissionGuard.
NFR-004 Cross-tenant retorna 404.
NFR-005 DTOs rechazan tenantId.
NFR-006 DTOs rechazan actor fields.
NFR-007 DTOs rechazan secrets.
NFR-008 DTOs rechazan scripts.
NFR-009 DTOs rechazan rawSql.
NFR-010 No existen endpoints públicos.
```

---

### 19.2. Idempotencia

```text id="awb-nfr-idempotency"
NFR-011 Toda ejecución usa idempotencyKey.
NFR-012 Event-driven deduplica por sourceEventId.
NFR-013 Scheduled deduplica por scheduledWindowKey.
NFR-014 Manual deduplica por manualRunId.
NFR-015 Reintentos no duplican actions idempotentes.
```

---

### 19.3. Auditoría

```text id="awb-nfr-audit"
NFR-016 Toda creación, actualización, aprobación, activación, ejecución, fallo, reintento y exportación se audita.
NFR-017 Audit incluye tenantId, actor, action, resource y traceId.
NFR-018 Audit no contiene secrets.
NFR-019 Audit no contiene payload raw sensible.
```

---

### 19.4. Performance

```text id="awb-nfr-performance"
NFR-020 Encolar ejecución p95 < 500 ms.
NFR-021 Listar workflows p95 < 800 ms.
NFR-022 Listar executions p95 < 1200 ms.
NFR-023 Procesar step simple p95 < 2000 ms.
NFR-024 Export pequeño p95 < 3000 ms.
NFR-025 pageSize máximo = 100.
```

---

### 19.5. Resiliencia

```text id="awb-nfr-resilience"
NFR-026 Fallo de action no debe tumbar worker completo.
NFR-027 Error recuperable debe seguir retry policy.
NFR-028 Error no recuperable debe ir a dead letter.
NFR-029 Worker debe soportar reintento después de reinicio.
NFR-030 Idempotency debe sobrevivir reinicios.
```

---

### 19.6. Compatibilidad microservicios

```text id="awb-nfr-microservices"
NFR-031 Workflows deben usar UUIDs.
NFR-032 Actions deben invocar puertos, no tablas directas.
NFR-033 Eventos deben tener eventName, tenantId, sourceEventId.
NFR-034 El módulo debe poder extraerse como worker/orchestrator futuro.
NFR-035 El catálogo debe ser versionable.
```

---

## 20. API preliminar

> El contrato formal se definirá en `api-contract.md`.

### 20.1. Platform API

```text id="awb-api-platform"
GET    /api/v1/platform/automation-trigger-definitions
POST   /api/v1/platform/automation-trigger-definitions
GET    /api/v1/platform/automation-trigger-definitions/{definitionId}
PATCH  /api/v1/platform/automation-trigger-definitions/{definitionId}
POST   /api/v1/platform/automation-trigger-definitions/{definitionId}/archive

GET    /api/v1/platform/automation-action-definitions
POST   /api/v1/platform/automation-action-definitions
GET    /api/v1/platform/automation-action-definitions/{definitionId}
PATCH  /api/v1/platform/automation-action-definitions/{definitionId}
POST   /api/v1/platform/automation-action-definitions/{definitionId}/archive
```

---

### 20.2. Tenant Admin API

```text id="awb-api-tenant"
GET    /api/v1/tenant/automation-workflows
POST   /api/v1/tenant/automation-workflows
GET    /api/v1/tenant/automation-workflows/{workflowId}
PATCH  /api/v1/tenant/automation-workflows/{workflowId}
POST   /api/v1/tenant/automation-workflows/{workflowId}/archive

GET    /api/v1/tenant/automation-workflows/{workflowId}/versions
POST   /api/v1/tenant/automation-workflows/{workflowId}/versions
GET    /api/v1/tenant/automation-workflows/{workflowId}/versions/{versionId}
PATCH  /api/v1/tenant/automation-workflows/{workflowId}/versions/{versionId}
POST   /api/v1/tenant/automation-workflows/{workflowId}/versions/{versionId}/submit-review
POST   /api/v1/tenant/automation-workflows/{workflowId}/versions/{versionId}/approve
POST   /api/v1/tenant/automation-workflows/{workflowId}/versions/{versionId}/reject
POST   /api/v1/tenant/automation-workflows/{workflowId}/versions/{versionId}/activate
POST   /api/v1/tenant/automation-workflows/{workflowId}/versions/{versionId}/deactivate

GET    /api/v1/tenant/automation-executions
GET    /api/v1/tenant/automation-executions/{executionId}
POST   /api/v1/tenant/automation-workflows/{workflowId}/run
POST   /api/v1/tenant/automation-executions/{executionId}/cancel
POST   /api/v1/tenant/automation-executions/{executionId}/retry

GET    /api/v1/tenant/automation-dead-letters
GET    /api/v1/tenant/automation-dead-letters/{deadLetterId}
POST   /api/v1/tenant/automation-dead-letters/{deadLetterId}/resolve
POST   /api/v1/tenant/automation-dead-letters/{deadLetterId}/ignore

GET    /api/v1/tenant/automation-exports
GET    /api/v1/tenant/automation-exports/{exportId}
GET    /api/v1/tenant/automation-exports/create
```

---

### 20.3. Internal API / service ports

```text id="awb-api-internal"
publishAutomationEvent(event)
enqueueWorkflowExecution(command)
executeWorkflowStep(command)
resolveWorkflowCatalog(triggerKey, actionKeys)
```

---

### 20.4. Public API prohibida

No implementar:

```text id="awb-api-public-forbidden"
/api/v1/public/automation-workflows
/api/v1/public/automation-executions
/api/v1/public/tenants/{slug}/automation-workflows
/api/v1/public/automation-webhooks/*
```

---

## 21. Integraciones

### 21.1. Tenants

Uso:

```text id="awb-integration-tenants"
- validar tenant activo;
- obtener timezone del tenant;
- aplicar tenant isolation;
- resolver estado operativo.
```

---

### 21.2. Users, Roles and Permissions

Uso:

```text id="awb-integration-users"
- resolver actor server-side;
- validar permisos;
- validar aprobadores;
- validar manual run;
- validar permisos sensibles.
```

---

### 21.3. Tenant Settings and Policies

Uso:

```text id="awb-integration-settings"
- saber si automatizaciones están habilitadas;
- obtener límites de frecuencia;
- obtener quiet hours;
- obtener maxRetries default;
- obtener configuración de exports;
- obtener política de actions sensibles.
```

---

### 21.4. Communications and Notifications

Uso:

```text id="awb-integration-notifications"
- enviar notificaciones permitidas;
- enviar alertas;
- enviar digests;
- respetar preferencias y quiet hours.
```

---

### 21.5. Basic Reports

Uso:

```text id="awb-integration-reports"
- generar reportes programados;
- generar reportes bajo demanda;
- crear exportaciones administrativas.
```

---

### 21.6. Secure Document Storage

Uso:

```text id="awb-integration-sds"
- guardar exports;
- guardar evidencias administrativas;
- devolver secureDocumentId.
```

Regla:

```text id="awb-sds-rule"
Automation Workflows Basic solo guarda secureDocumentId; no guarda storageKey ni signedUrl persistente.
```

---

### 21.7. Audit

Uso:

```text id="awb-integration-audit"
- registrar cambios de workflow;
- registrar activaciones;
- registrar ejecuciones críticas;
- registrar fallos;
- registrar retries;
- registrar dead letters;
- registrar exports.
```

---

### 21.8. n8n y herramientas externas

En MVP, n8n no será motor de ejecución productivo para datos sensibles de RESIDENT Core.

Uso permitido:

```text id="awb-n8n-allowed"
- prototipos;
- ambientes de laboratorio;
- datos ficticios;
- documentación;
- automatizaciones administrativas no sensibles;
- integración futura mediante ADR y webhooks firmados.
```

Uso prohibido:

```text id="awb-n8n-forbidden"
- enviar datos reales de residentes;
- enviar datos financieros reales;
- enviar comprobantes reales;
- enviar identificaciones o placas reales;
- ejecutar pagos;
- modificar datos transaccionales;
- exponer webhooks públicos sin firma;
- almacenar tokens Core en n8n sin secrets manager aprobado;
- operar sin auditoría en RESIDENT Core.
```

---

## 22. Seguridad

### 22.1. Controles mínimos

```text id="awb-security-controls"
- AuthGuard.
- TenantGuard.
- PermissionGuard.
- SensitivePermissionGuard.
- PlatformPermissionGuard.
- ValidationPipe whitelist.
- forbidNonWhitelisted.
- DTO denylist.
- Trigger catalog allowlist.
- Action catalog allowlist.
- Schema validation.
- Idempotency enforcement.
- Rate limiting.
- Audit obligatorio.
- Logs sanitizados.
- No public endpoints.
- No WordPress access.
- No secrets.
- No executable payload.
- No raw SQL.
- No external AI real data.
```

---

### 22.2. Campos prohibidos en DTOs externos

```text id="awb-forbidden-dto-fields"
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

### 22.3. Campos prohibidos en responses

```text id="awb-forbidden-response-fields"
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
datos cross-tenant
```

---

## 23. Auditoría

Eventos mínimos:

```text id="awb-audit-events"
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

```text id="awb-audit-metadata-allowed"
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

```text id="awb-audit-metadata-forbidden"
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

## 24. Observabilidad

### 24.1. Logs seguros

Eventos loggeables:

```text id="awb-observability-logs"
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

```text id="awb-observability-fields"
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

```text id="awb-observability-forbidden"
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

### 24.2. Métricas

```text id="awb-metrics"
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
```

Labels permitidos:

```text id="awb-metric-labels-allowed"
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

```text id="awb-metric-labels-forbidden"
tenantId
userId
workflowId
executionId
sourceEventId
idempotencyKey
traceId
secretKey
```

---

## 25. Reportes MVP

Reportes administrativos básicos:

```text id="awb-reports"
- workflows activos por tenant;
- workflows inactivos;
- ejecuciones por periodo;
- ejecuciones fallidas;
- ejecuciones por trigger;
- ejecuciones por action;
- dead letters abiertas;
- retries por workflow;
- exports realizados;
- cambios de versión;
- activaciones históricas.
```

Reglas:

```text id="awb-report-rules"
- Reportes son tenant-scoped.
- Reportes requieren permisos.
- Exportaciones usan SDS.
- No se exportan secretos.
- No se exporta payload raw sensible.
```

---

## 26. Riesgos

| Riesgo                                 |      Nivel | Mitigación                                       |
| -------------------------------------- | ---------: | ------------------------------------------------ |
| Workflow ejecuta acción duplicada      |       Alto | idempotencyKey, unique constraints               |
| Workflow cross-tenant                  |    Crítico | tenant_id obligatorio, TenantGuard, tests        |
| Action catalog demasiado permisivo     |       Alto | allowlist, approval, security review             |
| Payload ejecutable                     |    Crítico | no scripts, no eval, no raw SQL                  |
| Automatización crea pago indebidamente |    Crítico | boundary tests, no financial destructive actions |
| n8n recibe datos reales sensibles      |       Alto | no external sensitive integration en MVP         |
| Webhook público inseguro               |    Crítico | no public webhooks MVP                           |
| Retry infinito                         |       Alto | maxRetries, dead letter                          |
| Logs filtran payload sensible          |       Alto | log sanitizer                                    |
| Cache o scheduler mezcla tenants       |    Crítico | tenant-scoped keys, tests                        |
| Activación no auditada                 |       Alto | audit mandatory                                  |
| Workflow mal configurado genera spam   | Medio/Alto | rate limit, quiet hours, frequency limits        |

---

## 27. Decisiones MVP

```text id="awb-mvp-decisions"
1. Usar catálogo cerrado de triggers.
2. Usar catálogo cerrado de actions.
3. Usar BullMQ/Redis para cola de ejecuciones.
4. Usar workflows versionados.
5. Usar activaciones auditadas.
6. Usar idempotencyKey obligatorio.
7. Usar retries finitos.
8. Usar dead letter básico.
9. Usar Secure Document Storage para exports.
10. No permitir scripts.
11. No permitir raw SQL.
12. No almacenar secretos.
13. No exponer endpoints públicos.
14. No permitir acceso desde WordPress público.
15. No ejecutar pagos ni contabilidad directa.
16. No controlar hardware.
17. No integrar IA externa con datos reales.
18. No usar n8n como motor productivo sensible en MVP.
```

---

## 28. Criterios de aceptación

```text id="awb-acceptance"
[ ] El módulo permite listar trigger definitions.
[ ] El módulo permite listar action definitions.
[ ] El módulo permite crear workflows tenant-scoped.
[ ] El módulo permite crear workflow versions.
[ ] El módulo valida triggerConfig contra schema.
[ ] El módulo valida conditionConfig.
[ ] El módulo valida actionGraph.
[ ] El módulo genera versionNumber server-side.
[ ] El módulo permite review/approve/reject.
[ ] El módulo permite activar una versión aprobada.
[ ] El módulo impide editar active destructivamente.
[ ] El módulo ejecuta event-driven workflows.
[ ] El módulo ejecuta scheduled workflows.
[ ] El módulo ejecuta manual workflows autorizados.
[ ] El módulo usa idempotencyKey.
[ ] El módulo evita ejecuciones duplicadas.
[ ] El módulo registra steps.
[ ] El módulo aplica retries finitos.
[ ] El módulo crea dead letter al agotar retries.
[ ] El módulo permite consultar ejecuciones tenant-scoped.
[ ] El módulo exporta historial vía SDS.
[ ] El módulo no devuelve storageKey.
[ ] El módulo audita operaciones críticas.
[ ] El módulo no acepta tenantId desde cliente.
[ ] El módulo no acepta actor fields.
[ ] El módulo no acepta secrets.
[ ] El módulo no acepta scripts.
[ ] El módulo no acepta rawSql.
[ ] El módulo no acepta executableCode.
[ ] El módulo no expone endpoints públicos.
[ ] El módulo no permite acceso desde WordPress público.
[ ] El módulo no crea pagos.
[ ] El módulo no crea asientos contables.
[ ] El módulo no confirma conciliaciones bancarias.
[ ] El módulo no controla hardware.
[ ] El módulo no envía datos reales a IA externa.
```

---

## 29. No aceptación

No se acepta el módulo si:

```text id="awb-no-acceptance"
- permite workflows cross-tenant;
- permite executions cross-tenant;
- permite steps cross-tenant;
- permite exports cross-tenant;
- acepta tenantId desde cliente;
- acepta actor fields desde cliente;
- acepta versionNumber desde cliente;
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

## 30. Resultado esperado

Al implementar `026-automation-workflows-basic`, RESIDENT Core contará con un módulo básico de automatizaciones internas seguras, auditadas, versionadas e idempotentes, capaz de ejecutar flujos repetitivos y programados sin comprometer tenant isolation, datos sensibles ni reglas de negocio de los módulos consumidores.

Resultado esperado:

```text id="awb-expected-result"
automation trigger definitions definidas
automation action definitions definidas
tenant workflow definitions definidas
tenant workflow versions definidas
workflow activations definidas
event triggers definidos
scheduled triggers definidos
manual triggers definidos
condition config definido
action graph definido
workflow executions definidas
step executions definidas
execution logs definidos
dead letters definidos
retries definidos
idempotency definido
exports vía SDS definidos
audit definido
observability definida
permissions definidos
no public endpoints
no WordPress access
no secrets
no scripts
no raw SQL
no executable payload
no unsafe webhooks
no payment execution
no accounting creation
no bank reconciliation confirmation
no hardware control
no external AI with real data
n8n boundary definido
```

---

## 31. Expediente actualizado

```text id="awb-expediente"
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
│   │       └── spec.md
```
