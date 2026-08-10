# Plan — 028 Data Import and Migration

## 1. Información del documento

| Campo          | Valor                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------------- |
| Proyecto       | RESIDENT Core                                                                                   |
| Spec ID        | 028                                                                                             |
| Módulo         | Data Import and Migration                                                                       |
| Documento      | Implementation Plan                                                                             |
| Ruta           | `docs/specs/028-data-import-migration/plan.md`                                                  |
| Versión        | 0.1                                                                                             |
| Estado         | needs-review                                                                                    |
| Fecha          | 2026-08-02                                                                                      |
| Stack objetivo | NestJS / TypeScript / PostgreSQL / Prisma / Redis / BullMQ / OpenAPI / Keycloak                 |
| Naturaleza     | Tenant-scoped / Batch-oriented / Validation-heavy / Audit-heavy / Non-public / Controlled-write |

---

## 2. Propósito

Definir el plan técnico para implementar el módulo `028-data-import-migration`, encargado de importar, validar, previsualizar y migrar datos iniciales o históricos hacia RESIDENT Core de forma segura, controlada, auditable e idempotente.

Este módulo será utilizado principalmente para carga inicial de información de conjuntos residenciales, migración desde hojas de cálculo, sistemas anteriores o registros manuales.

Regla central:

```text id="dim-plan-rule"
Data Import and Migration debe permitir importar datos tenant-scoped mediante archivos o plantillas controladas, ejecutar validaciones estrictas, mostrar resultados de dry-run, requerir aprobación antes de commit, registrar auditoría completa, mantener trazabilidad por fila, evitar duplicados, impedir escrituras directas no autorizadas, no aceptar SQL arbitrario, no aceptar scripts, no exponer storageKey, no usar WordPress público, no habilitar endpoints públicos y no enviar datos reales a IA externa.
```

---

## 3. Decisión técnica principal

El módulo se implementará como un **servicio interno de importación por lotes**, con procesamiento asíncrono mediante colas.

Decisión:

```text id="dim-plan-main-decision"
Implementar Data Import and Migration como módulo NestJS tenant-scoped, con upload controlado vía Secure Document Storage, staging interno, validación por lote, dry-run obligatorio, aprobación explícita y commit mediante puertos de los módulos dueños.
```

Implicación:

```text id="dim-plan-implication"
El módulo no escribirá directamente en tablas de módulos externos cuando exista un puerto de dominio disponible. La creación final de residentes, unidades, propietarios, saldos iniciales, cargos iniciales u otros registros debe realizarse mediante servicios o puertos controlados del módulo propietario.
```

---

## 4. Clasificación del módulo

```text id="dim-plan-classification"
Core supporting module
Tenant-scoped
Batch-processing module
Controlled-write module
Validation-heavy
Audit-heavy
Queue-backed
File-ingestion module
Migration-assistant module
Non-public
Microservices-ready
```

---

## 5. Nombre técnico

```text id="dim-plan-module-name"
data-import-migration
```

Ruta sugerida:

```text id="dim-plan-module-path"
apps/api/src/modules/data-import-migration/
```

Clase NestJS:

```text id="dim-plan-module-class"
DataImportMigrationModule
```

---

## 6. Responsabilidades

El módulo debe responsabilizarse de:

```text id="dim-plan-responsibilities"
- recibir solicitudes de importación;
- registrar lotes de importación;
- asociar archivos importados a Secure Document Storage;
- leer archivos permitidos;
- normalizar filas;
- validar estructura;
- validar datos;
- detectar duplicados;
- detectar conflictos con datos existentes;
- generar reporte de errores;
- generar preview;
- ejecutar dry-run;
- requerir aprobación para commit;
- ejecutar commit por lotes;
- registrar resultado por fila;
- soportar retry controlado;
- permitir cancelación antes del commit;
- generar reportes de importación;
- auditar todo el ciclo de vida.
```

No debe responsabilizarse de:

```text id="dim-plan-non-responsibilities"
- definir reglas de negocio finales de otros módulos;
- crear datos saltándose módulos propietarios;
- procesar pagos reales;
- validar pagos automáticamente;
- crear asientos contables directos;
- confirmar conciliaciones bancarias;
- almacenar archivos binarios directamente;
- exponer storageKey;
- ejecutar SQL definido por usuario;
- ejecutar scripts;
- actuar como ETL genérico sin control.
```

---

## 7. Tipos de importación MVP

### 7.1. Importaciones incluidas

```text id="dim-plan-import-types"
residentsPropertiesInitialLoad
usersInitialLoad
duesOpeningBalances
chargesInitialLoad
paymentsHistoricalReference
commonAreasInitialLoad
suppliersInitialLoad
inventoryInitialLoad
accessResidentsVehiclesInitialLoad
```

---

### 7.2. Fuera de alcance MVP

```text id="dim-plan-out-of-scope"
- migración automática desde bases externas conectadas;
- conexión directa a sistemas legacy;
- ejecución de SQL del usuario;
- transformaciones programables con scripts;
- importación de pagos en línea;
- conciliación automática;
- creación directa de asientos contables;
- OCR automático;
- IA externa para limpiar datos reales;
- conectores n8n productivos con datos sensibles;
- importaciones públicas desde WordPress.
```

---

## 8. Dependencias internas

```text id="dim-plan-dependencies"
001-tenants
002-users-roles
003-residents-properties
004-dues-fees
005-payments
006-account-statements
007-audit
008-basic-reports
016-secure-document-storage
020-accounting-ledger
023-inventory-basic
024-access-control-visitors
025-tenant-settings-policies
027-dashboard-kpis
```

Uso esperado:

```text id="dim-plan-dependency-usage"
- Tenants: validar tenant activo.
- Users/Roles: validar actor y permisos.
- Residents/Properties: crear o actualizar personas, unidades y relaciones.
- Dues/Fees: importar cargos iniciales o saldos iniciales permitidos.
- Payments: importar referencias históricas, no ejecutar pagos.
- Account Statements: recalcular o consultar saldos derivados.
- Audit: registrar trazabilidad.
- SDS: almacenar plantillas, archivos fuente y reportes.
- Inventory: importar inventario inicial.
- Access Control: importar vehículos o autorizaciones base permitidas.
- Tenant Settings: límites, formatos y políticas.
- Dashboard/KPIs: mostrar estado de migraciones.
```

---

## 9. Estructura sugerida

```text id="dim-plan-folder-structure"
apps/api/src/modules/data-import-migration/
├── data-import-migration.module.ts
├── data-import-migration.config.ts
├── data-import-migration.constants.ts
├── controllers/
│   ├── tenant-import-batches.controller.ts
│   ├── tenant-import-files.controller.ts
│   ├── tenant-import-templates.controller.ts
│   ├── tenant-import-validations.controller.ts
│   ├── tenant-import-executions.controller.ts
│   └── tenant-import-reports.controller.ts
├── application/
│   ├── services/
│   │   ├── import-batch.service.ts
│   │   ├── import-template.service.ts
│   │   ├── import-file.service.ts
│   │   ├── import-parser.service.ts
│   │   ├── import-mapping.service.ts
│   │   ├── import-validation.service.ts
│   │   ├── import-preview.service.ts
│   │   ├── import-dry-run.service.ts
│   │   ├── import-approval.service.ts
│   │   ├── import-execution.service.ts
│   │   ├── import-row-result.service.ts
│   │   ├── import-report.service.ts
│   │   └── import-sanitizer.service.ts
│   ├── use-cases/
│   └── ports/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── policies/
│   └── errors/
├── infrastructure/
│   ├── persistence/
│   ├── queue/
│   ├── parsers/
│   ├── documents/
│   ├── audit/
│   ├── source-modules/
│   └── observability/
├── dto/
├── guards/
├── mappers/
├── schemas/
├── seeds/
└── tests/
```

---

## 10. Entidades principales

```text id="dim-plan-entities"
ImportTemplate
ImportBatch
ImportFile
ImportMapping
ImportValidationRun
ImportValidationIssue
ImportPreview
ImportExecution
ImportRowResult
ImportReport
```

Resumen:

```text id="dim-plan-entity-summary"
ImportTemplate define estructura esperada.
ImportBatch agrupa una importación tenant-scoped.
ImportFile referencia archivo fuente en SDS.
ImportMapping define correspondencia de columnas.
ImportValidationRun registra validación.
ImportValidationIssue registra errores o advertencias.
ImportPreview muestra resultado previo.
ImportExecution registra commit o dry-run.
ImportRowResult conserva resultado por fila.
ImportReport referencia reporte generado en SDS.
```

---

## 11. Value objects

```text id="dim-plan-value-objects"
ImportBatchCode
ImportTemplateKey
ImportType
ImportSourceFormat
ImportFileReference
ImportColumnMapping
ImportValidationSeverity
ImportRowNumber
ImportDryRunResult
ImportExecutionMode
ImportIdempotencyKey
ImportConflictKey
ImportReportType
SanitizedImportPayload
```

---

## 12. Estados

### 12.1. ImportBatchStatus

```text id="dim-plan-batch-status"
draft
fileUploaded
mappingConfigured
validated
validationFailed
previewReady
pendingApproval
approved
executing
completed
partiallyCompleted
failed
cancelled
archived
```

---

### 12.2. ImportExecutionStatus

```text id="dim-plan-execution-status"
queued
running
succeeded
partiallySucceeded
failed
cancelled
```

---

### 12.3. ImportRowResultStatus

```text id="dim-plan-row-status"
pending
valid
warning
invalid
skipped
created
updated
unchanged
failed
```

---

## 13. Persistencia

Tablas sugeridas:

```text id="dim-plan-tables"
import_templates
import_batches
import_files
import_mappings
import_validation_runs
import_validation_issues
import_previews
import_executions
import_row_results
import_reports
```

Reglas:

```text id="dim-plan-persistence-rules"
- import_templates puede ser global o tenant-configurable.
- import_batches siempre tiene tenant_id.
- import_files siempre tiene tenant_id.
- import_mappings siempre tiene tenant_id.
- import_validation_runs siempre tiene tenant_id.
- import_validation_issues siempre tiene tenant_id.
- import_executions siempre tiene tenant_id.
- import_row_results siempre tiene tenant_id.
- import_reports siempre tiene tenant_id.
- No almacenar storageKey.
- No almacenar archivo binario.
- No almacenar secretos.
- No almacenar SQL arbitrario.
- No almacenar scripts.
```

---

## 14. Formatos soportados

MVP:

```text id="dim-plan-supported-formats"
xlsx
csv
json
```

Reglas:

```text id="dim-plan-format-rules"
- xlsx recomendado para carga inicial.
- csv permitido para datos simples.
- json permitido para integraciones internas controladas.
- pdf no se procesa como fuente de datos en MVP.
- imágenes no se procesan como fuente de datos en MVP.
- OCR queda fuera de alcance.
```

---

## 15. Flujo principal

```text id="dim-plan-main-flow"
1. Usuario autorizado crea ImportBatch.
2. Usuario descarga o selecciona ImportTemplate.
3. Usuario carga archivo.
4. Sistema guarda archivo vía Secure Document Storage.
5. Sistema registra ImportFile con secureDocumentId.
6. Usuario configura mapping si aplica.
7. Sistema ejecuta validación.
8. Sistema registra issues por fila.
9. Sistema genera preview.
10. Usuario ejecuta dry-run.
11. Sistema muestra resumen de impacto.
12. Usuario autorizado aprueba.
13. Sistema encola ejecución.
14. Worker ejecuta commit por lotes.
15. Módulo llama puertos de módulos propietarios.
16. Sistema registra resultados por fila.
17. Sistema genera reporte final.
18. Sistema audita todo el ciclo.
```

---

## 16. Arquitectura de ejecución

```text id="dim-plan-execution-architecture"
API Controller
  ↓
Use Case
  ↓
Validation / Mapping / Parser Services
  ↓
Import Batch Repository
  ↓
Queue Producer
  ↓
BullMQ Worker
  ↓
Module Owner Ports
  ↓
Audit / Reports / SDS
```

---

## 17. Colas

```text id="dim-plan-queues"
data-import.validation
data-import.preview
data-import.dry-run
data-import.execution
data-import.report
```

Reglas:

```text id="dim-plan-queue-rules"
- jobId debe usar importBatchId + tenantId + executionMode.
- payload de job debe estar sanitizado.
- no incluir storageKey.
- no incluir archivo completo.
- no incluir datos sensibles innecesarios.
- revalidar permisos y estado antes de ejecución.
```

---

## 18. Idempotencia

```text id="dim-plan-idempotency"
- Cada ImportBatch tiene batchCode único por tenant.
- Cada ejecución tiene idempotencyKey.
- Cada fila puede tener importConflictKey.
- El commit debe evitar duplicados.
- Retry no debe crear registros duplicados.
```

Constraint sugerida:

```text id="dim-plan-idempotency-constraint"
unique(tenant_id, import_batch_id, idempotency_key)
```

---

## 19. Validaciones

### 19.1. Validaciones de archivo

```text id="dim-plan-file-validations"
- formato permitido;
- tamaño máximo;
- extensión permitida;
- MIME permitido;
- antivirus futuro si aplica;
- archivo asociado a tenant;
- secureDocumentId válido;
- no storageKey;
```

---

### 19.2. Validaciones de estructura

```text id="dim-plan-structure-validations"
- columnas requeridas;
- tipos de datos;
- formatos de fecha;
- formato monetario;
- longitud máxima;
- valores enum;
- filas vacías;
- columnas desconocidas según política;
```

---

### 19.3. Validaciones de dominio

```text id="dim-plan-domain-validations"
- unidad existente o nueva según modo;
- persona duplicada;
- identificación duplicada;
- correo duplicado;
- relación propietario-unidad válida;
- saldo inicial permitido;
- cargo inicial permitido;
- pago histórico como referencia, no pago ejecutado;
- inventario inicial válido;
- vehículo asociado a residente/unidad permitida;
```

---

## 20. Políticas de seguridad

```text id="dim-plan-security-policies"
ImportTenantIsolationPolicy
ImportPermissionPolicy
ImportTemplatePolicy
ImportFileSafetyPolicy
ImportMappingPolicy
ImportValidationPolicy
ImportApprovalPolicy
ImportExecutionPolicy
ImportIdempotencyPolicy
NoRawSqlImportPolicy
NoScriptImportPolicy
NoStorageKeyExposurePolicy
NoPublicImportPolicy
NoWordPressImportAccessPolicy
NoExternalAiRealDataPolicy
NoFinancialExecutionPolicy
```

---

## 21. Permisos

```text id="dim-plan-permissions"
tenantImports.read
tenantImports.create
tenantImports.uploadFile
tenantImports.configureMapping
tenantImports.validate
tenantImports.preview
tenantImports.runDryRun
tenantImports.approve
tenantImports.execute
tenantImports.cancel
tenantImports.archive
tenantImports.exportReport

tenantImports.executeSensitive
tenantImports.importFinancialOpeningBalances
tenantImports.importResidentsPersonalData
tenantImports.importAccessData
tenantImports.importInventoryData

importTemplates.read
importTemplates.create
importTemplates.update
importTemplates.archive
```

---

## 22. Puertos hacia módulos propietarios

```text id="dim-plan-owner-ports"
ResidentsPropertiesImportPort
UsersRolesImportPort
DuesFeesImportPort
PaymentsHistoricalImportPort
AccountStatementsImportPort
InventoryImportPort
AccessControlImportPort
AuditImportPort
SecureDocumentStorageImportPort
```

Regla:

```text id="dim-plan-port-rule"
Los puertos de importación deben validar nuevamente reglas de negocio del módulo propietario. Data Import and Migration no puede saltarse validaciones internas.
```

---

## 23. API preliminar

> El detalle formal se definirá en `api-contract.md`.

```text id="dim-plan-api"
GET    /api/v1/tenant/import-templates
GET    /api/v1/tenant/import-templates/{templateKey}

GET    /api/v1/tenant/import-batches
POST   /api/v1/tenant/import-batches
GET    /api/v1/tenant/import-batches/{batchId}
PATCH  /api/v1/tenant/import-batches/{batchId}
POST   /api/v1/tenant/import-batches/{batchId}/upload-file
POST   /api/v1/tenant/import-batches/{batchId}/configure-mapping
POST   /api/v1/tenant/import-batches/{batchId}/validate
POST   /api/v1/tenant/import-batches/{batchId}/preview
POST   /api/v1/tenant/import-batches/{batchId}/dry-run
POST   /api/v1/tenant/import-batches/{batchId}/submit-approval
POST   /api/v1/tenant/import-batches/{batchId}/approve
POST   /api/v1/tenant/import-batches/{batchId}/execute
POST   /api/v1/tenant/import-batches/{batchId}/cancel
POST   /api/v1/tenant/import-batches/{batchId}/archive

GET    /api/v1/tenant/import-batches/{batchId}/issues
GET    /api/v1/tenant/import-batches/{batchId}/row-results
GET    /api/v1/tenant/import-batches/{batchId}/reports
POST   /api/v1/tenant/import-batches/{batchId}/reports
```

Endpoints prohibidos:

```text id="dim-plan-api-forbidden"
/api/v1/public/imports
/api/v1/public/import-batches
/api/v1/public/tenants/{slug}/imports
/api/v1/public/import-upload
```

---

## 24. DTOs principales

```text id="dim-plan-dtos"
CreateImportBatchDto
UpdateImportBatchDto
UploadImportFileDto
ConfigureImportMappingDto
ValidateImportBatchDto
PreviewImportBatchDto
RunDryRunDto
SubmitImportApprovalDto
ApproveImportBatchDto
ExecuteImportBatchDto
CancelImportBatchDto
ArchiveImportBatchDto
CreateImportReportDto
```

Campos prohibidos en DTOs:

```text id="dim-plan-forbidden-dto-fields"
tenantId
createdBy
updatedBy
approvedBy
executedBy
cancelledBy
archivedBy
status directo
storageKey
signedUrl
rawSql
sql
script
javascript
functionBody
executableCode
formulaCode
secret
token
password
apiKey
databaseUrl
externalAiEnabled
externalAiRealDataAllowed
```

---

## 25. Auditoría

Eventos mínimos:

```text id="dim-plan-audit-events"
importBatch.created
importBatch.updated
importBatch.fileUploaded
importBatch.mappingConfigured
importBatch.validationStarted
importBatch.validationCompleted
importBatch.validationFailed
importBatch.previewGenerated
importBatch.dryRunStarted
importBatch.dryRunCompleted
importBatch.submittedForApproval
importBatch.approved
importBatch.executionStarted
importBatch.executionCompleted
importBatch.executionPartiallyCompleted
importBatch.executionFailed
importBatch.cancelled
importBatch.archived
importReport.generated
```

Metadata permitida:

```text id="dim-plan-audit-allowed"
batchId
batchCode
importType
templateKey
sourceFormat
rowCount
validRowCount
invalidRowCount
warningCount
executionMode
status
reason
traceId
correlationId
```

Metadata prohibida:

```text id="dim-plan-audit-forbidden"
storageKey
signedUrl
rawSql
script
secret
token
password
apiKey
raw file content
raw personal data
datos cross-tenant
```

---

## 26. Observabilidad

Logs:

```text id="dim-plan-logs"
dataImport.batch.created
dataImport.file.uploaded
dataImport.validation.started
dataImport.validation.completed
dataImport.preview.generated
dataImport.dryRun.completed
dataImport.execution.started
dataImport.execution.completed
dataImport.execution.failed
dataImport.report.generated
```

Métricas:

```text id="dim-plan-metrics"
data_import_batches_created_total
data_import_validations_total
data_import_validation_failures_total
data_import_executions_total
data_import_execution_failures_total
data_import_rows_processed_total
data_import_rows_failed_total
data_import_reports_generated_total
data_import_duration_ms
```

---

## 27. Feature flags

```text id="dim-plan-feature-flags"
DATA_IMPORT_ENABLED=true
DATA_IMPORT_FILE_UPLOAD_ENABLED=true
DATA_IMPORT_DRY_RUN_REQUIRED=true
DATA_IMPORT_APPROVAL_REQUIRED=true
DATA_IMPORT_PUBLIC_ENDPOINTS_ENABLED=false
DATA_IMPORT_WORDPRESS_ACCESS_ENABLED=false
DATA_IMPORT_RAW_SQL_ENABLED=false
DATA_IMPORT_SCRIPTING_ENABLED=false
DATA_IMPORT_EXTERNAL_AI_ENABLED=false
DATA_IMPORT_DIRECT_DB_WRITE_ENABLED=false
DATA_IMPORT_PAYMENT_EXECUTION_ENABLED=false
DATA_IMPORT_ACCOUNTING_EXECUTION_ENABLED=false
DATA_IMPORT_BANK_RECONCILIATION_CONFIRM_ENABLED=false
```

Regla:

```text id="dim-plan-feature-rule"
El boot debe fallar si se habilitan endpoints públicos, WordPress access, raw SQL, scripting, IA externa con datos reales, escritura directa de base, ejecución de pagos, contabilidad directa o conciliación bancaria automática.
```

---

## 28. Estrategia de implementación

### Fase 1 — Fundación

```text id="dim-plan-phase-01"
[ ] Crear módulo NestJS.
[ ] Crear configuración.
[ ] Crear feature flags.
[ ] Crear enums.
[ ] Crear errores.
[ ] Crear value objects.
```

---

### Fase 2 — Modelo y persistencia

```text id="dim-plan-phase-02"
[ ] Crear Prisma schema.
[ ] Crear migración.
[ ] Crear repositorios.
[ ] Crear constraints.
[ ] Crear índices tenant-scoped.
```

---

### Fase 3 — Templates, archivos y mapping

```text id="dim-plan-phase-03"
[ ] Crear ImportTemplateService.
[ ] Crear ImportFileService.
[ ] Integrar SDS.
[ ] Crear parsers xlsx/csv/json.
[ ] Crear mapping validator.
```

---

### Fase 4 — Validación y preview

```text id="dim-plan-phase-04"
[ ] Crear ImportValidationService.
[ ] Crear ImportValidationIssueService.
[ ] Crear ImportPreviewService.
[ ] Crear dry-run.
[ ] Registrar resultados por fila.
```

---

### Fase 5 — Aprobación y ejecución

```text id="dim-plan-phase-05"
[ ] Crear approval flow.
[ ] Crear execution service.
[ ] Crear workers BullMQ.
[ ] Integrar puertos de módulos propietarios.
[ ] Ejecutar commit por lotes.
[ ] Implementar idempotencia.
```

---

### Fase 6 — Reportes, auditoría y observabilidad

```text id="dim-plan-phase-06"
[ ] Generar reportes.
[ ] Guardar reportes vía SDS.
[ ] Implementar audit.
[ ] Implementar logs seguros.
[ ] Implementar métricas.
```

---

### Fase 7 — Seguridad y pruebas

```text id="dim-plan-phase-07"
[ ] Implementar tests unitarios.
[ ] Implementar tests integración.
[ ] Implementar tests API.
[ ] Implementar tests multitenancy.
[ ] Implementar tests seguridad.
[ ] Implementar smoke tests.
[ ] Validar no public endpoints.
[ ] Validar no storageKey.
[ ] Validar no raw SQL.
[ ] Validar no scripts.
```

---

## 29. Plan de PRs sugerido

```text id="dim-plan-prs"
PR-028-01 — Module foundation, config, flags, enums and errors.
PR-028-02 — Domain entities, value objects, validators and policies.
PR-028-03 — Prisma schema, migration and repositories.
PR-028-04 — Templates, file references, parsers and mapping.
PR-028-05 — Validation, preview and dry-run.
PR-028-06 — Approval, queue workers and execution.
PR-028-07 — Module owner ports and controlled commit.
PR-028-08 — Reports, audit, observability and OpenAPI.
PR-028-09 — Security hardening, performance and smoke tests.
```

---

## 30. Riesgos técnicos

| Riesgo                              |      Nivel | Mitigación                                         |
| ----------------------------------- | ---------: | -------------------------------------------------- |
| Datos duplicados                    |       Alto | idempotencyKey, conflictKey, dry-run               |
| Datos mal formateados               | Medio/Alto | templates, validators, issues por fila             |
| Cross-tenant                        |    Crítico | tenant_id, guards, repo filters                    |
| Importación financiera indebida     |    Crítico | permisos sensibles, módulos propietarios           |
| Escritura directa a tablas externas |       Alto | owner ports                                        |
| Archivo con datos sensibles         |       Alto | SDS, permisos, audit                               |
| Exposición storageKey               |    Crítico | solo secureDocumentId                              |
| Importación parcial inconsistente   |       Alto | transacciones por lote y row results               |
| Reintento duplica datos             |       Alto | idempotencia                                       |
| Uso como ETL inseguro               |       Alto | no raw SQL, no scripts, no external connectors MVP |

---

## 31. Definition of Done

```text id="dim-plan-dod"
[ ] Módulo NestJS creado.
[ ] Configuración creada.
[ ] Feature flags implementadas.
[ ] Boot validation implementada.
[ ] Entidades de dominio creadas.
[ ] Policies implementadas.
[ ] Prisma schema implementado.
[ ] Migración implementada.
[ ] Repositories implementados.
[ ] DTOs seguros implementados.
[ ] Guards implementados.
[ ] APIs tenant implementadas.
[ ] Upload vía SDS implementado.
[ ] Parsers xlsx/csv/json implementados.
[ ] Mapping implementado.
[ ] Validation implementada.
[ ] Preview implementado.
[ ] Dry-run implementado.
[ ] Approval flow implementado.
[ ] Execution por colas implementado.
[ ] Owner ports implementados.
[ ] Row results implementados.
[ ] Reports vía SDS implementados.
[ ] Audit implementado.
[ ] Observability implementada.
[ ] OpenAPI implementado.
[ ] Security tests pasan.
[ ] Smoke tests pasan.
[ ] CI completo pasa.
```

---

## 32. No aceptación

No se acepta implementación si:

```text id="dim-plan-no-acceptance"
- permite importaciones cross-tenant;
- acepta tenantId desde cliente;
- expone storageKey;
- almacena archivo binario en tablas propias;
- acepta rawSql;
- acepta scripts;
- acepta fórmulas ejecutables;
- permite endpoints públicos;
- permite acceso desde WordPress público;
- permite commit sin dry-run cuando la política exige dry-run;
- permite commit sin aprobación cuando la política exige aprobación;
- escribe directamente en tablas externas sin puerto autorizado;
- ejecuta pagos;
- crea asientos contables directos;
- confirma conciliación bancaria;
- importa datos sensibles sin permiso reforzado;
- envía datos reales a IA externa;
- omite auditoría;
- retry duplica datos.
```

---

## 33. Resultado esperado

```text id="dim-plan-expected-result"
plan técnico definido
módulo data-import-migration diseñado
arquitectura por lotes definida
upload vía SDS definido
staging definido
mapping definido
validation definida
preview definido
dry-run definido
approval definido
controlled commit definido
owner ports definidos
row results definidos
reports definidos
idempotencia definida
audit definido
observability definida
security boundaries definidos
no public endpoints
no WordPress access
no storageKey exposure
no raw SQL
no scripts
no direct DB write
no external AI with real data
```

---

## 34. Expediente actualizado

```text id="dim-plan-expediente"
resident-core/
├── docs/
│   ├── specs/
│   │   ├── 027-dashboard-kpis/
│   │   └── 028-data-import-migration/
│   │       ├── spec.md
│   │       └── plan.md
```
