# Test Plan — 028 Data Import and Migration

## 1. Información del documento

| Campo          | Valor                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------------- |
| Proyecto       | RESIDENT Core                                                                                   |
| Spec ID        | 028                                                                                             |
| Módulo         | Data Import and Migration                                                                       |
| Documento      | Test Plan                                                                                       |
| Ruta           | `docs/specs/028-data-import-migration/test-plan.md`                                             |
| Versión        | 0.1                                                                                             |
| Estado         | Borrador inicial                                                                                |
| Fecha          | 2026-08-03                                                                                      |
| Stack objetivo | NestJS / TypeScript / PostgreSQL / Prisma / Redis / BullMQ / OpenAPI / Keycloak                 |
| Naturaleza     | Tenant-scoped / Batch-oriented / Validation-heavy / Audit-heavy / Controlled-write / Non-public |

---

## 2. Propósito

Definir el conjunto de pruebas necesarias para validar que `028-data-import-migration` permita importar datos iniciales o históricos de forma segura, controlada, auditable, idempotente y sin romper las reglas de negocio de los módulos propietarios.

Regla central de pruebas:

```text id="dim-test-rule"
Data Import and Migration solo puede aceptarse si las pruebas demuestran aislamiento multitenant, uso exclusivo de Secure Document Storage para archivos, validación estricta, dry-run obligatorio cuando aplique, aprobación previa cuando aplique, ejecución idempotente, resultados por fila, auditoría completa, ausencia de storageKey, ausencia de raw SQL, ausencia de scripts, ausencia de endpoints públicos, ausencia de acceso desde WordPress público, ausencia de escrituras directas no autorizadas, ausencia de pagos reales, ausencia de asientos contables directos, ausencia de conciliación bancaria automática y ausencia de IA externa con datos reales.
```

---

## 3. Alcance de pruebas

Incluido:

```text id="dim-test-scope-in"
- Import templates.
- Import batches.
- Import files.
- Import mappings.
- Import validation runs.
- Import validation issues.
- Import previews.
- Dry-run.
- Approval flow.
- Commit execution.
- Row results.
- Import reports.
- Secure Document Storage integration.
- BullMQ workers.
- Idempotency.
- Tenant isolation.
- Permission checks.
- Sensitive import permissions.
- Audit.
- Observability.
- OpenAPI contract.
- CI gates.
```

Fuera de alcance:

```text id="dim-test-scope-out"
- OCR.
- Importación desde PDF como fuente de datos.
- Importación desde imágenes.
- Conexión directa a bases legacy.
- SQL dumps.
- Scripts de transformación de usuario.
- n8n productivo con datos reales.
- IA externa con datos reales.
- Importaciones públicas.
- Importaciones desde WordPress público.
```

---

## 4. Tipos de pruebas

```text id="dim-test-types"
1. Unit tests.
2. Validator tests.
3. Sanitizer tests.
4. Repository integration tests.
5. Parser tests.
6. Mapping tests.
7. Domain policy tests.
8. API tests.
9. Queue/worker tests.
10. Owner port integration tests.
11. Multitenancy tests.
12. Security tests.
13. Idempotency tests.
14. Audit tests.
15. Observability tests.
16. OpenAPI contract tests.
17. Performance baseline tests.
18. Smoke tests.
```

---

## 5. Datos de prueba mínimos

### 5.1. Tenants

```text id="dim-test-tenants"
tenantA = Conjunto Demo Norte
tenantB = Conjunto Demo Sur
```

Regla:

```text id="dim-test-tenant-rule"
Ningún archivo, batch, mapping, issue, preview, execution, row result o report de tenantB debe ser accesible desde tenantA.
```

---

### 5.2. Usuarios

```text id="dim-test-users"
platformAdmin
tenantAdminA
financialManagerA
securityManagerA
inventoryManagerA
residentManagerA
tenantAdminB
residentA
anonymousUser
```

---

### 5.3. Tipos de importación críticos

```text id="dim-test-import-types"
residentsPropertiesInitialLoad
usersInitialLoad
duesOpeningBalances
chargesInitialLoad
paymentsHistoricalReference
inventoryInitialLoad
accessResidentsVehiclesInitialLoad
```

---

### 5.4. Archivos de prueba

```text id="dim-test-files"
valid-residents-properties.xlsx
invalid-residents-properties.xlsx
duplicate-units.xlsx
opening-balances-valid.xlsx
opening-balances-invalid.xlsx
historical-payments-reference.csv
inventory-initial-load.xlsx
access-vehicles-valid.xlsx
unsupported-file.pdf
malicious-script.csv
raw-sql-payload.json
oversized-file.xlsx
```

---

## 6. Unit tests

### 6.1. Value objects

```text id="dim-unit-value-objects"
[ ] ImportBatchCode acepta código válido.
[ ] ImportBatchCode rechaza espacios y caracteres peligrosos.
[ ] ImportTemplateKey acepta residents-properties-initial-load-xlsx.
[ ] ImportTemplateKey rechaza rawSql.
[ ] ImportType acepta tipos permitidos.
[ ] ImportSourceFormat acepta xlsx, csv y json.
[ ] ImportSourceFormat rechaza pdf.
[ ] ImportIdempotencyKey se genera server-side.
[ ] ImportConflictKey no contiene datos sensibles.
[ ] ImportRowNumber rechaza valores menores a 1.
[ ] ImportColumnMapping rechaza targetField no permitido.
[ ] SanitizedImportPayload rechaza secrets.
```

---

### 6.2. State machines

```text id="dim-unit-state-machines"
[ ] draft -> fileUploaded.
[ ] fileUploaded -> mappingConfigured.
[ ] mappingConfigured -> validated.
[ ] mappingConfigured -> validationFailed.
[ ] validated -> previewReady.
[ ] previewReady -> pendingApproval.
[ ] pendingApproval -> approved.
[ ] approved -> executing.
[ ] executing -> completed.
[ ] executing -> partiallyCompleted.
[ ] executing -> failed.
[ ] completed -> archived.
[ ] cancelled -> archived.
[ ] archived no vuelve a executing.
[ ] completed no vuelve a executing.
[ ] validationFailed no pasa a executing.
```

---

## 7. Validator tests

### 7.1. File validators

```text id="dim-validator-file-tests"
[ ] Acepta xlsx válido.
[ ] Acepta csv válido.
[ ] Acepta json válido.
[ ] Rechaza pdf como fuente de datos.
[ ] Rechaza imágenes.
[ ] Rechaza ejecutables.
[ ] Rechaza SQL dump.
[ ] Rechaza archivo que excede tamaño máximo.
[ ] Rechaza MIME inconsistente.
[ ] Rechaza extensión inconsistente.
[ ] Rechaza upload sin secureDocumentId.
[ ] Rechaza storageKey.
[ ] Rechaza signedUrl persistente.
```

---

### 7.2. Mapping validators

```text id="dim-validator-mapping-tests"
[ ] Mapping acepta sourceColumn válido.
[ ] Mapping acepta targetField permitido.
[ ] Mapping rechaza targetField inexistente.
[ ] Mapping rechaza columnas requeridas faltantes.
[ ] Mapping rechaza rawSql.
[ ] Mapping rechaza script.
[ ] Mapping rechaza formulaCode.
[ ] Mapping rechaza executableCode.
[ ] Mapping rechaza tenantId.
[ ] Mapping rechaza actor fields.
```

---

### 7.3. Domain validators

```text id="dim-validator-domain-tests"
[ ] Detecta unidad duplicada en archivo.
[ ] Detecta unidad duplicada contra base existente.
[ ] Detecta identificación duplicada.
[ ] Detecta correo inválido.
[ ] Detecta correo duplicado.
[ ] Detecta formato monetario inválido.
[ ] Detecta fecha inválida.
[ ] Detecta propietario sin unidad.
[ ] Detecta residente sin relación válida.
[ ] Detecta saldo inicial negativo si política lo prohíbe.
[ ] Detecta pago histórico con estado no permitido.
[ ] Detecta vehículo sin unidad o persona asociada.
```

---

## 8. Sanitizer tests

```text id="dim-sanitizer-tests"
[ ] Sanitizer elimina storageKey.
[ ] Sanitizer elimina signedUrl.
[ ] Sanitizer elimina secret.
[ ] Sanitizer elimina token.
[ ] Sanitizer elimina password.
[ ] Sanitizer elimina apiKey.
[ ] Sanitizer elimina rawSql.
[ ] Sanitizer elimina script.
[ ] Sanitizer elimina formulaCode.
[ ] Sanitizer elimina executableCode.
[ ] Sanitizer elimina externalAiEnabled.
[ ] Sanitizer elimina externalAiRealDataAllowed.
[ ] Sanitizer enmascara identificación completa cuando no hay permiso.
[ ] Sanitizer enmascara placa completa cuando no hay permiso.
[ ] Sanitizer evita guardar fila completa en logs.
[ ] Sanitizer evita guardar archivo completo en audit.
```

---

## 9. Repository integration tests

```text id="dim-repository-tests"
[ ] ImportTemplateRepository lista templates active.
[ ] ImportBatchRepository crea batch tenant-scoped.
[ ] ImportBatchRepository exige batchCode único por tenant.
[ ] ImportFileRepository crea file reference con secureDocumentId.
[ ] ImportMappingRepository crea mapping tenant-scoped.
[ ] ImportValidationRunRepository crea validation run.
[ ] ImportValidationIssueRepository crea issues por fila.
[ ] ImportPreviewRepository crea preview sanitizado.
[ ] ImportExecutionRepository exige idempotencyKey único.
[ ] ImportRowResultRepository guarda resultado por fila.
[ ] ImportReportRepository guarda secureDocumentId.
[ ] tenantA no lee batches tenantB.
[ ] tenantA no lee files tenantB.
[ ] tenantA no lee mappings tenantB.
[ ] tenantA no lee issues tenantB.
[ ] tenantA no lee executions tenantB.
[ ] tenantA no lee row results tenantB.
[ ] tenantA no lee reports tenantB.
```

---

## 10. Parser tests

```text id="dim-parser-tests"
[ ] XLSX parser lee encabezados.
[ ] XLSX parser ignora filas vacías.
[ ] XLSX parser detecta columnas requeridas faltantes.
[ ] CSV parser respeta encoding configurado.
[ ] CSV parser detecta delimitador inválido.
[ ] JSON parser valida estructura esperada.
[ ] Parser rechaza macros o contenido ejecutable.
[ ] Parser limita número máximo de filas.
[ ] Parser limita número máximo de columnas.
[ ] Parser no registra contenido crudo en logs.
[ ] Parser no devuelve storageKey.
```

---

## 11. API tests

### 11.1. Import Templates API

```text id="dim-api-template-tests"
[ ] GET /api/v1/tenant/import-templates requiere auth.
[ ] GET requiere importTemplates.read.
[ ] GET filtra templates active.
[ ] GET /{templateKey} retorna schema seguro.
[ ] GET no retorna rawSql.
[ ] GET no retorna scripts.
[ ] GET no retorna storageKey.
```

---

### 11.2. Import Batches API

```text id="dim-api-batch-tests"
[ ] GET /api/v1/tenant/import-batches requiere tenantImports.read.
[ ] POST /api/v1/tenant/import-batches requiere tenantImports.create.
[ ] POST crea batch en draft.
[ ] POST genera batchCode server-side.
[ ] POST resuelve createdBy server-side.
[ ] POST rechaza tenantId.
[ ] POST rechaza status.
[ ] POST rechaza actor fields.
[ ] PATCH solo actualiza metadata permitida.
[ ] PATCH no cambia status directo.
[ ] GET batch tenantB desde tenantA retorna 404.
```

---

### 11.3. Upload File API

```text id="dim-api-upload-tests"
[ ] POST upload-file requiere tenantImports.uploadFile.
[ ] POST acepta secureDocumentId válido.
[ ] POST valida que secureDocumentId pertenece al tenant.
[ ] POST rechaza storageKey.
[ ] POST rechaza signedUrl.
[ ] POST rechaza archivo base64 en JSON.
[ ] POST rechaza formato no permitido.
[ ] POST cambia batch a fileUploaded.
[ ] POST audita importBatch.fileUploaded.
```

---

### 11.4. Configure Mapping API

```text id="dim-api-mapping-tests"
[ ] POST configure-mapping requiere tenantImports.configureMapping.
[ ] POST exige batch en estado compatible.
[ ] POST valida mapping contra template.
[ ] POST rechaza targetField desconocido.
[ ] POST rechaza rawSql.
[ ] POST rechaza script.
[ ] POST rechaza formulaCode.
[ ] POST cambia batch a mappingConfigured.
[ ] POST audita importBatch.mappingConfigured.
```

---

### 11.5. Validation API

```text id="dim-api-validation-tests"
[ ] POST validate requiere tenantImports.validate.
[ ] POST validate requiere archivo cargado.
[ ] POST validate requiere mapping si aplica.
[ ] POST validate encola job.
[ ] POST validate retorna 202.
[ ] Validación exitosa cambia batch a validated.
[ ] Validación con errores críticos cambia batch a validationFailed.
[ ] GET issues lista issues del tenant.
[ ] GET issues no devuelve fila completa sensible.
[ ] GET issues tenantB desde tenantA retorna 404.
```

---

### 11.6. Preview API

```text id="dim-api-preview-tests"
[ ] POST preview requiere tenantImports.preview.
[ ] POST preview requiere validación previa.
[ ] POST preview no modifica datos fuente.
[ ] POST preview encola job.
[ ] Preview exitoso cambia batch a previewReady.
[ ] Preview guarda previewDataSanitized.
[ ] Preview no contiene storageKey.
[ ] Preview no contiene raw personal data innecesario.
```

---

### 11.7. Dry-run API

```text id="dim-api-dry-run-tests"
[ ] POST dry-run requiere tenantImports.runDryRun.
[ ] POST dry-run requiere previewReady.
[ ] Dry-run crea ImportExecution con mode=dryRun.
[ ] Dry-run genera idempotencyKey server-side.
[ ] Dry-run no modifica módulos propietarios.
[ ] Dry-run genera row results simulados.
[ ] Dry-run audita importBatch.dryRunStarted.
[ ] Dry-run audita importBatch.dryRunCompleted.
```

---

### 11.8. Approval API

```text id="dim-api-approval-tests"
[ ] submit-approval requiere previewReady.
[ ] submit-approval exige dry-run exitoso si dryRunRequired=true.
[ ] submit-approval cambia batch a pendingApproval.
[ ] approve requiere tenantImports.approve.
[ ] approve requiere permiso sensible según importType.
[ ] approve rechaza approvedBy desde cliente.
[ ] approve resuelve approvedBy server-side.
[ ] approve cambia batch a approved.
[ ] approve audita importBatch.approved.
```

---

### 11.9. Execute API

```text id="dim-api-execute-tests"
[ ] execute requiere tenantImports.execute.
[ ] execute requiere approved si approvalRequired=true.
[ ] execute requiere dry-run exitoso si dryRunRequired=true.
[ ] execute rechaza batch con critical issues.
[ ] execute crea ImportExecution con mode=commit.
[ ] execute genera idempotencyKey server-side.
[ ] execute encola job.
[ ] execute retorna 202.
[ ] execute usa puertos de módulos propietarios.
[ ] execute no escribe directamente en tablas externas.
```

---

### 11.10. Reports API

```text id="dim-api-report-tests"
[ ] GET reports requiere tenantImports.read.
[ ] POST reports requiere tenantImports.exportReport.
[ ] POST reports genera reporte vía SDS.
[ ] Reporte completed tiene secureDocumentId.
[ ] Reporte no devuelve storageKey.
[ ] Reporte no devuelve signedUrl persistente.
[ ] Reporte tenantB desde tenantA retorna 404.
```

---

## 12. Queue and worker tests

```text id="dim-worker-tests"
[ ] Job validation usa tenantId + batchId.
[ ] Job preview usa tenantId + batchId.
[ ] Job dry-run usa tenantId + batchId + executionId.
[ ] Job commit usa tenantId + batchId + executionId.
[ ] Job report usa tenantId + reportId.
[ ] Job payload no contiene storageKey.
[ ] Job payload no contiene archivo completo.
[ ] Job payload no contiene secrets.
[ ] Worker revalida tenant activo.
[ ] Worker revalida batch state.
[ ] Worker revalida idempotencyKey.
[ ] Worker no ejecuta batch archived.
[ ] Worker no ejecuta batch cancelled.
[ ] Worker registra failureReason sanitizado.
```

---

## 13. Owner port tests

```text id="dim-owner-port-tests"
[ ] ResidentsPropertiesImportPort valida unidad antes de crear.
[ ] ResidentsPropertiesImportPort detecta duplicados.
[ ] UsersRolesImportPort no crea usuario sin datos mínimos.
[ ] DuesFeesImportPort valida saldo inicial permitido.
[ ] DuesFeesImportPort no crea cargos duplicados.
[ ] PaymentsHistoricalImportPort registra referencia histórica, no pago real.
[ ] PaymentsHistoricalImportPort no valida pagos.
[ ] AccountStatementsImportPort no reemplaza fuente financiera.
[ ] InventoryImportPort valida stock inicial.
[ ] AccessControlImportPort valida vehículo asociado.
[ ] Ningún owner port permite cross-tenant.
[ ] Ningún owner port recibe storageKey.
[ ] Ningún owner port recibe rawSql.
```

---

## 14. Security tests

### 14.1. Auth and permissions

```text id="dim-security-auth-tests"
[ ] Usuario anónimo recibe 401.
[ ] Usuario sin permiso recibe 403.
[ ] Resident no accede a importaciones administrativas.
[ ] tenantAdminA crea batch permitido.
[ ] financialManagerA requiere permiso financiero para duesOpeningBalances.
[ ] securityManagerA requiere permiso de access data para accessResidentsVehiclesInitialLoad.
[ ] inventoryManagerA requiere permiso de inventory data para inventoryInitialLoad.
```

---

### 14.2. Multitenancy

```text id="dim-security-multitenancy-tests"
[ ] tenantA no lista batches tenantB.
[ ] tenantA no consulta batch tenantB.
[ ] tenantA no sube archivo a batch tenantB.
[ ] tenantA no configura mapping tenantB.
[ ] tenantA no valida batch tenantB.
[ ] tenantA no genera preview tenantB.
[ ] tenantA no ejecuta dry-run tenantB.
[ ] tenantA no aprueba batch tenantB.
[ ] tenantA no ejecuta commit tenantB.
[ ] tenantA no consulta row results tenantB.
[ ] tenantA no consulta reports tenantB.
```

Respuesta esperada:

```http id="dim-cross-tenant-response"
404 Not Found
```

---

### 14.3. Forbidden fields

Todos los DTOs deben rechazar:

```text id="dim-security-forbidden-fields"
[ ] tenantId.
[ ] createdBy.
[ ] updatedBy.
[ ] approvedBy.
[ ] executedBy.
[ ] cancelledBy.
[ ] archivedBy.
[ ] uploadedBy.
[ ] requestedBy.
[ ] status directo.
[ ] storageKey.
[ ] signedUrl.
[ ] rawSql.
[ ] sql.
[ ] script.
[ ] javascript.
[ ] functionBody.
[ ] executableCode.
[ ] formulaCode.
[ ] eval.
[ ] Function.
[ ] secret.
[ ] token.
[ ] password.
[ ] apiKey.
[ ] privateKey.
[ ] clientSecret.
[ ] webhookSecret.
[ ] databaseUrl.
[ ] externalAiEnabled.
[ ] externalAiRealDataAllowed.
```

Respuesta esperada:

```http id="dim-forbidden-response"
422 Unprocessable Entity
```

---

### 14.4. No public / no WordPress

```text id="dim-security-public-tests"
[ ] GET /api/v1/public/imports retorna 404.
[ ] GET /api/v1/public/import-batches retorna 404.
[ ] POST /api/v1/public/import-upload retorna 404.
[ ] WordPress público no puede crear batches.
[ ] WordPress público no puede subir archivos.
[ ] WordPress público no puede ejecutar importaciones.
[ ] Sesión WordPress no autentica Core.
```

---

### 14.5. No prohibited effects

```text id="dim-security-effects-tests"
[ ] Importación no ejecuta pagos reales.
[ ] Importación no valida pagos automáticamente.
[ ] Importación no reversa pagos.
[ ] Importación no crea JournalEntry directo.
[ ] Importación no confirma Bank Reconciliation.
[ ] Importación no inicia pagos bancarios.
[ ] Importación no abre portones.
[ ] Importación no controla hardware.
[ ] Importación no envía datos reales a IA externa.
[ ] Importación no ejecuta SQL del usuario.
[ ] Importación no ejecuta scripts del usuario.
```

---

## 15. Idempotency tests

```text id="dim-idempotency-tests"
[ ] Mismo batchCode no se duplica dentro del tenant.
[ ] Mismo batchCode puede existir en otro tenant.
[ ] Mismo idempotencyKey no crea dos executions.
[ ] Retry de dry-run no duplica row results.
[ ] Retry de commit no duplica registros destino.
[ ] conflictKey evita duplicar unidades.
[ ] conflictKey evita duplicar personas.
[ ] conflictKey evita duplicar saldos iniciales.
[ ] Worker reiniciado no duplica commit.
[ ] Job duplicado retorna execution existente o se marca skipped.
```

---

## 16. Dry-run and approval tests

```text id="dim-dry-run-approval-tests"
[ ] Batch con dryRunRequired=true no pasa a approval sin dry-run.
[ ] Batch con approvalRequired=true no ejecuta commit sin approval.
[ ] Dry-run no modifica datos destino.
[ ] Dry-run calcula impacto esperado.
[ ] Approval requiere permisos sensibles según importType.
[ ] Approval registra approvedAt.
[ ] Approval registra approvedBy server-side.
[ ] Commit solo ejecuta batch approved.
[ ] Batch validationFailed no puede aprobarse.
```

---

## 17. Audit tests

Eventos mínimos:

```text id="dim-audit-tests"
[ ] importBatch.created.
[ ] importBatch.updated.
[ ] importBatch.fileUploaded.
[ ] importBatch.mappingConfigured.
[ ] importBatch.validationStarted.
[ ] importBatch.validationCompleted.
[ ] importBatch.validationFailed.
[ ] importBatch.previewGenerated.
[ ] importBatch.dryRunStarted.
[ ] importBatch.dryRunCompleted.
[ ] importBatch.submittedForApproval.
[ ] importBatch.approved.
[ ] importBatch.executionStarted.
[ ] importBatch.executionCompleted.
[ ] importBatch.executionPartiallyCompleted.
[ ] importBatch.executionFailed.
[ ] importBatch.cancelled.
[ ] importBatch.archived.
[ ] importReport.generated.
```

Metadata prohibida:

```text id="dim-audit-forbidden"
[ ] storageKey.
[ ] signedUrl.
[ ] rawSql.
[ ] script.
[ ] secret.
[ ] token.
[ ] password.
[ ] apiKey.
[ ] raw file content.
[ ] raw personal data.
[ ] datos cross-tenant.
[ ] authorization header.
[ ] cookie.
```

---

## 18. Observability tests

```text id="dim-observability-tests"
[ ] dataImport.batch.created registra importType.
[ ] dataImport.file.uploaded registra sourceFormat.
[ ] dataImport.validation.started registra batchCode.
[ ] dataImport.validation.completed registra row counts.
[ ] dataImport.execution.started registra executionMode.
[ ] dataImport.execution.completed registra processedRows.
[ ] dataImport.execution.failed registra errorCode.
[ ] dataImport.report.generated registra reportType.
[ ] Logs no contienen storageKey.
[ ] Logs no contienen raw file content.
[ ] Logs no contienen identificación completa.
[ ] Metrics no usan tenantId como label.
[ ] Metrics no usan userId como label.
[ ] Metrics no usan row-level personal data.
```

Métricas esperadas:

```text id="dim-observability-metrics"
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

## 19. OpenAPI contract tests

```text id="dim-openapi-tests"
[ ] OpenAPI documenta Tenant Import Templates.
[ ] OpenAPI documenta Tenant Import Batches.
[ ] OpenAPI documenta Tenant Import Files.
[ ] OpenAPI documenta Tenant Import Mapping.
[ ] OpenAPI documenta Tenant Import Validation.
[ ] OpenAPI documenta Tenant Import Preview.
[ ] OpenAPI documenta Tenant Import Execution.
[ ] OpenAPI documenta Tenant Import Row Results.
[ ] OpenAPI documenta Tenant Import Reports.
[ ] OpenAPI no documenta rutas públicas.
[ ] OpenAPI no documenta tenantId en DTOs.
[ ] OpenAPI no documenta actor fields.
[ ] OpenAPI no documenta status directo.
[ ] OpenAPI no documenta storageKey.
[ ] OpenAPI no documenta rawSql.
[ ] OpenAPI no documenta script.
[ ] OpenAPI incluye x-auth-required=true.
[ ] OpenAPI incluye x-tenant-scope=true.
[ ] OpenAPI incluye x-controlled-write=true.
[ ] OpenAPI incluye x-secure-document-storage=true.
[ ] OpenAPI incluye x-public-exposure=false.
[ ] OpenAPI incluye x-wordpress-access=false.
[ ] OpenAPI incluye x-storage-key-exposed=false.
[ ] OpenAPI incluye x-raw-sql-allowed=false.
[ ] OpenAPI incluye x-scripting-allowed=false.
```

---

## 20. Performance baseline tests

Dataset mínimo:

```text id="dim-performance-dataset"
- 10 import templates.
- 100 import batches por tenant.
- 10 archivos por batch crítico.
- 5,000 filas por archivo estándar.
- 50,000 import_row_results históricos por tenant.
- 10,000 validation_issues históricos por tenant.
```

Objetivos:

```text id="dim-performance-objectives"
[ ] Crear batch p95 < 500 ms.
[ ] Listar batches p95 < 800 ms.
[ ] Validar 5,000 filas p95 < 60 s en worker.
[ ] Generar preview 5,000 filas p95 < 30 s en worker.
[ ] Ejecutar dry-run 5,000 filas p95 < 60 s en worker.
[ ] Consultar issues p95 < 1000 ms.
[ ] Consultar row results p95 < 1200 ms.
[ ] Generar reporte pequeño p95 < 5000 ms.
[ ] pageSize máximo = 100.
[ ] No existe N+1 evidente.
```

---

## 21. Smoke tests

### 21.1. Smoke — Residents and Properties initial load

```text id="dim-smoke-residents-properties"
[ ] TenantAdminA crea batch residentsPropertiesInitialLoad.
[ ] TenantAdminA asocia archivo xlsx vía secureDocumentId.
[ ] Sistema configura mapping.
[ ] Sistema valida archivo.
[ ] Sistema genera preview.
[ ] Sistema ejecuta dry-run.
[ ] TenantAdminA envía batch a aprobación.
[ ] Usuario autorizado aprueba.
[ ] Sistema ejecuta commit.
[ ] ResidentsPropertiesImportPort crea unidades/personas/relaciones.
[ ] Sistema registra row results.
[ ] Sistema genera reporte final.
[ ] Reporte devuelve secureDocumentId.
[ ] Response no contiene storageKey.
```

---

### 21.2. Smoke — Opening balances

```text id="dim-smoke-opening-balances"
[ ] FinancialManagerA crea batch duesOpeningBalances.
[ ] Sistema exige permiso financiero sensible.
[ ] Sistema valida montos.
[ ] Sistema detecta duplicados.
[ ] Sistema ejecuta dry-run.
[ ] Usuario autorizado aprueba.
[ ] Sistema ejecuta commit mediante DuesFeesImportPort.
[ ] Sistema no crea Payment.
[ ] Sistema no crea JournalEntry directo.
[ ] Sistema genera reporte final.
```

---

### 21.3. Smoke — Rejected malicious file

```text id="dim-smoke-malicious"
[ ] Usuario sube archivo con rawSql.
[ ] Sistema rechaza validación.
[ ] Sistema crea validation issue crítico.
[ ] Sistema no genera preview exitoso.
[ ] Sistema no permite dry-run.
[ ] Sistema no permite approval.
[ ] Sistema no permite commit.
[ ] Audit no contiene payload malicioso completo.
```

---

## 22. CI gates

El pipeline debe ejecutar:

```text id="dim-ci-gates"
[ ] Unit tests.
[ ] Validator tests.
[ ] Sanitizer tests.
[ ] Parser tests.
[ ] Mapping tests.
[ ] Repository tests.
[ ] API tests.
[ ] Queue/worker tests.
[ ] Owner port tests.
[ ] Multitenancy tests.
[ ] Permission tests.
[ ] Sensitive import tests.
[ ] Idempotency tests.
[ ] Dry-run tests.
[ ] Approval tests.
[ ] SDS integration tests.
[ ] No public endpoint tests.
[ ] No WordPress access tests.
[ ] No raw SQL tests.
[ ] No script tests.
[ ] No storageKey tests.
[ ] No prohibited effects tests.
[ ] Audit tests.
[ ] Observability tests.
[ ] OpenAPI tests.
[ ] Smoke tests.
```

Pipeline debe fallar si:

```text id="dim-ci-fail"
[ ] Cualquier DTO acepta tenantId.
[ ] Cualquier DTO acepta status directo.
[ ] Cualquier DTO acepta storageKey.
[ ] Cualquier DTO acepta rawSql.
[ ] Cualquier DTO acepta script.
[ ] Cualquier DTO acepta formulaCode.
[ ] Cualquier response devuelve storageKey.
[ ] Existe endpoint público.
[ ] WordPress público accede.
[ ] tenantA accede a datos tenantB.
[ ] Commit ocurre sin validación.
[ ] Commit ocurre sin dry-run requerido.
[ ] Commit ocurre sin aprobación requerida.
[ ] Commit duplica registros por retry.
[ ] Se escribe directamente en tabla externa sin puerto autorizado.
[ ] Se ejecuta pago real.
[ ] Se crea JournalEntry directo.
[ ] Se confirma Bank Reconciliation.
[ ] Se controla hardware.
[ ] Se envían datos reales a IA externa.
```

---

## 23. Cobertura mínima

```text id="dim-coverage"
- Value objects: >= 90%.
- Validators: >= 95%.
- Sanitizers: >= 95%.
- State machines: >= 95%.
- Domain policies: >= 95%.
- Parser services: >= 85%.
- Mapping services: >= 85%.
- Repository integration: >= 85%.
- API controllers: >= 85%.
- Queue workers: >= 85%.
- Owner port adapters: >= 85%.
- Security critical tests: 100% passing.
- Multitenancy critical tests: 100% passing.
- Idempotency critical tests: 100% passing.
- No prohibited effects tests: 100% passing.
- OpenAPI critical tests: 100% passing.
```

---

## 24. Definition of Done de pruebas

```text id="dim-test-dod"
[ ] Unit tests implementados.
[ ] Validator tests implementados.
[ ] Sanitizer tests implementados.
[ ] Parser tests implementados.
[ ] Mapping tests implementados.
[ ] Repository tests implementados.
[ ] API tests implementados.
[ ] Queue/worker tests implementados.
[ ] Owner port tests implementados.
[ ] Security tests implementados.
[ ] Multitenancy tests implementados.
[ ] Idempotency tests implementados.
[ ] Dry-run tests implementados.
[ ] Approval tests implementados.
[ ] SDS tests implementados.
[ ] Audit tests implementados.
[ ] Observability tests implementados.
[ ] OpenAPI tests implementados.
[ ] Smoke tests implementados.
[ ] CI completo pasa.
```

---

## 25. No aceptación

No se acepta el módulo si las pruebas permiten:

```text id="dim-test-no-acceptance"
- importaciones cross-tenant;
- tenantId desde cliente;
- actor fields desde cliente;
- status directo desde cliente;
- storageKey en request o response;
- rawSql;
- scripts;
- formulaCode ejecutable;
- endpoints públicos;
- acceso WordPress público;
- procesamiento de archivo fuera de SDS;
- archivo base64 en JSON;
- commit sin validación;
- commit sin dry-run requerido;
- commit sin aprobación requerida;
- duplicados por retry;
- escritura directa no autorizada en módulos externos;
- ejecución de pagos reales;
- creación directa de JournalEntry;
- confirmación de Bank Reconciliation;
- control de hardware;
- envío de datos reales a IA externa;
- audit con archivo completo;
- logs con datos personales completos.
```

---

## 26. Resultado esperado

```text id="dim-test-expected-result"
test plan definido
unit tests definidos
validator tests definidos
sanitizer tests definidos
parser tests definidos
mapping tests definidos
repository tests definidos
API tests definidos
queue worker tests definidos
owner port tests definidos
security tests definidos
multitenancy tests definidos
idempotency tests definidos
dry-run tests definidos
approval tests definidos
SDS tests definidos
audit tests definidos
observability tests definidos
OpenAPI tests definidos
performance baseline definido
smoke tests definidos
CI gates definidos
no public endpoints verificado
no WordPress access verificado
no storageKey exposure verificado
no raw SQL verificado
no scripts verificado
no prohibited effects verificado
```

---

## 27. Expediente actualizado

```text id="dim-test-expediente"
resident-core/
├── docs/
│   ├── specs/
│   │   └── 028-data-import-migration/
│   │       ├── spec.md
│   │       ├── plan.md
│   │       ├── data-model.md
│   │       ├── api-contract.md
│   │       └── test-plan.md
```
