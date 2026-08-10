# Tasks — 028 Data Import and Migration

## 1. Información del documento

| Campo          | Valor                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------------- |
| Proyecto       | RESIDENT Core                                                                                   |
| Spec ID        | 028                                                                                             |
| Módulo         | Data Import and Migration                                                                       |
| Documento      | Tasks                                                                                           |
| Ruta           | `docs/specs/028-data-import-migration/tasks.md`                                                 |
| Versión        | 0.1                                                                                             |
| Estado         | needs-review                                                                                    |
| Fecha          | 2026-08-03                                                                                      |
| Stack objetivo | NestJS / TypeScript / PostgreSQL / Prisma / Redis / BullMQ / OpenAPI / Keycloak                 |
| Naturaleza     | Tenant-scoped / Batch-oriented / Validation-heavy / Audit-heavy / Controlled-write / Non-public |

---

## 2. Propósito

Definir el backlog técnico para implementar `028-data-import-migration`.

El módulo debe permitir importar datos iniciales o históricos mediante archivos controlados, con validación, preview, dry-run, aprobación, ejecución idempotente, resultados por fila, reportes vía Secure Document Storage y auditoría completa.

Regla central:

```text id="dim-task-rule"
Ninguna tarea se considera completa si permite importaciones cross-tenant, tenantId desde cliente, storageKey, raw SQL, scripts, fórmulas ejecutables, endpoints públicos, acceso WordPress público, commit sin validación, commit sin dry-run requerido, commit sin aprobación requerida, escritura directa no autorizada en módulos externos, pagos reales, asientos contables directos, conciliación bancaria automática, control de hardware o IA externa con datos reales.
```

---

## 3. Convenciones

```text id="dim-task-status"
[ ] Pendiente
[x] Completado
[~] En progreso
[!] Bloqueado
[-] No aplica
```

---

## 4. Dependencias previas

```text id="dim-task-dependencies"
[ ] spec.md aprobado.
[ ] plan.md aprobado.
[ ] data-model.md aprobado.
[ ] api-contract.md aprobado.
[ ] test-plan.md aprobado.
[ ] 001-tenants disponible o mockeable.
[ ] 002-users-roles disponible o mockeable.
[ ] 003-residents-properties disponible o mockeable.
[ ] 004-dues-fees disponible o mockeable.
[ ] 005-payments disponible o mockeable.
[ ] 006-account-statements disponible o mockeable.
[ ] 007-audit disponible o mockeable.
[ ] 016-secure-document-storage disponible o mockeable.
[ ] 023-inventory-basic disponible o mockeable.
[ ] 024-access-control-visitors disponible o mockeable.
[ ] 025-tenant-settings-policies disponible o mockeable.
[ ] PostgreSQL disponible.
[ ] Prisma configurado.
[ ] Redis disponible.
[ ] BullMQ disponible.
[ ] Keycloak/OIDC o auth mock disponible.
[ ] OpenAPI pipeline disponible.
```

---

# 5. EPIC-028-01 — Module foundation

```text id="dim-epic-01"
[ ] Crear apps/api/src/modules/data-import-migration/.
[ ] Crear DataImportMigrationModule.
[ ] Registrar módulo en app principal.
[ ] Crear data-import-migration.config.ts.
[ ] Crear data-import-migration.constants.ts.
[ ] Crear estructura controllers/.
[ ] Crear estructura application/services/.
[ ] Crear estructura application/use-cases/.
[ ] Crear estructura application/ports/.
[ ] Crear estructura domain/entities/.
[ ] Crear estructura domain/value-objects/.
[ ] Crear estructura domain/policies/.
[ ] Crear estructura domain/errors/.
[ ] Crear estructura infrastructure/persistence/.
[ ] Crear estructura infrastructure/queue/.
[ ] Crear estructura infrastructure/parsers/.
[ ] Crear estructura infrastructure/documents/.
[ ] Crear estructura infrastructure/source-modules/.
[ ] Crear estructura infrastructure/audit/.
[ ] Crear estructura infrastructure/observability/.
[ ] Crear estructura dto/.
[ ] Crear estructura guards/.
[ ] Crear estructura mappers/.
[ ] Crear estructura schemas/.
[ ] Crear estructura seeds/.
[ ] Crear estructura tests/.
```

Acceptance:

```text id="dim-epic-01-ac"
[ ] El módulo compila.
[ ] No expone endpoints públicos.
[ ] No contiene SQL dinámico.
[ ] No contiene scripting.
[ ] No contiene adaptadores de pago real.
[ ] No contiene adaptadores de hardware.
[ ] No contiene integración IA externa.
```

---

# 6. EPIC-028-02 — Configuración y feature flags

```text id="dim-epic-02"
[ ] Crear DATA_IMPORT_ENABLED=true.
[ ] Crear DATA_IMPORT_FILE_UPLOAD_ENABLED=true.
[ ] Crear DATA_IMPORT_DRY_RUN_REQUIRED=true.
[ ] Crear DATA_IMPORT_APPROVAL_REQUIRED=true.
[ ] Crear DATA_IMPORT_PUBLIC_ENDPOINTS_ENABLED=false.
[ ] Crear DATA_IMPORT_WORDPRESS_ACCESS_ENABLED=false.
[ ] Crear DATA_IMPORT_RAW_SQL_ENABLED=false.
[ ] Crear DATA_IMPORT_SCRIPTING_ENABLED=false.
[ ] Crear DATA_IMPORT_EXTERNAL_AI_ENABLED=false.
[ ] Crear DATA_IMPORT_DIRECT_DB_WRITE_ENABLED=false.
[ ] Crear DATA_IMPORT_PAYMENT_EXECUTION_ENABLED=false.
[ ] Crear DATA_IMPORT_ACCOUNTING_EXECUTION_ENABLED=false.
[ ] Crear DATA_IMPORT_BANK_RECONCILIATION_CONFIRM_ENABLED=false.
[ ] Crear DATA_IMPORT_MAX_FILE_SIZE_MB.
[ ] Crear DATA_IMPORT_MAX_ROWS_PER_FILE.
[ ] Crear DATA_IMPORT_MAX_COLUMNS_PER_FILE.
[ ] Crear DATA_IMPORT_BATCH_SIZE.
[ ] Crear DATA_IMPORT_WORKER_CONCURRENCY.
[ ] Implementar boot validation.
```

Acceptance:

```text id="dim-epic-02-ac"
[ ] Boot falla si se habilitan endpoints públicos.
[ ] Boot falla si se habilita WordPress access.
[ ] Boot falla si se habilita raw SQL.
[ ] Boot falla si se habilita scripting.
[ ] Boot falla si se habilita IA externa con datos reales.
[ ] Boot falla si se habilita direct DB write.
[ ] Boot falla si se habilita pago real, contabilidad directa o conciliación automática.
```

---

# 7. EPIC-028-03 — Enums, errores y value objects

```text id="dim-epic-03"
[ ] Crear ImportType.
[ ] Crear ImportSourceFormat.
[ ] Crear ImportTemplateStatus.
[ ] Crear ImportBatchStatus.
[ ] Crear ImportFileStatus.
[ ] Crear ImportMappingStatus.
[ ] Crear ImportValidationRunStatus.
[ ] Crear ImportValidationSeverity.
[ ] Crear ImportPreviewStatus.
[ ] Crear ImportExecutionMode.
[ ] Crear ImportExecutionStatus.
[ ] Crear ImportRowResultStatus.
[ ] Crear ImportReportType.
[ ] Crear ImportReportFormat.
[ ] Crear ImportReportStatus.
[ ] Crear ImportBatchCode.
[ ] Crear ImportTemplateKey.
[ ] Crear ImportColumnMapping.
[ ] Crear ImportRowNumber.
[ ] Crear ImportIdempotencyKey.
[ ] Crear ImportConflictKey.
[ ] Crear SanitizedImportPayload.
[ ] Crear catálogo de errores IMPORT_*.
[ ] Mapear errores a HTTP status.
```

Acceptance:

```text id="dim-epic-03-ac"
[ ] Cross-tenant se mapea a 404.
[ ] Campo prohibido se mapea a 422.
[ ] Estado inválido se mapea a 409.
[ ] Archivo grande se mapea a 413.
[ ] Formato no soportado se mapea a 415.
```

---

# 8. EPIC-028-04 — Domain entities and state machines

```text id="dim-epic-04"
[ ] Crear ImportTemplate entity.
[ ] Crear ImportBatch entity.
[ ] Crear ImportFile entity.
[ ] Crear ImportMapping entity.
[ ] Crear ImportValidationRun entity.
[ ] Crear ImportValidationIssue entity.
[ ] Crear ImportPreview entity.
[ ] Crear ImportExecution entity.
[ ] Crear ImportRowResult entity.
[ ] Crear ImportReport entity.
[ ] Implementar state machine de ImportBatch.
[ ] Implementar state machine de ImportExecution.
[ ] Implementar state machine de ImportReport.
```

Transiciones mínimas:

```text id="dim-epic-04-transitions"
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
[ ] completed/partiallyCompleted/failed/cancelled -> archived.
```

---

# 9. EPIC-028-05 — Domain policies

```text id="dim-epic-05"
[ ] Crear ImportTenantIsolationPolicy.
[ ] Crear ImportPermissionPolicy.
[ ] Crear ImportTemplatePolicy.
[ ] Crear ImportFileSafetyPolicy.
[ ] Crear ImportMappingPolicy.
[ ] Crear ImportValidationPolicy.
[ ] Crear ImportDryRunPolicy.
[ ] Crear ImportApprovalPolicy.
[ ] Crear ImportExecutionPolicy.
[ ] Crear ImportIdempotencyPolicy.
[ ] Crear NoRawSqlImportPolicy.
[ ] Crear NoScriptImportPolicy.
[ ] Crear NoStorageKeyExposurePolicy.
[ ] Crear NoPublicImportPolicy.
[ ] Crear NoWordPressImportAccessPolicy.
[ ] Crear NoExternalAiRealDataPolicy.
[ ] Crear NoFinancialExecutionPolicy.
[ ] Crear NoDirectDbWritePolicy.
```

Acceptance:

```text id="dim-epic-05-ac"
[ ] Policies bloquean cross-tenant.
[ ] Policies bloquean storageKey.
[ ] Policies bloquean raw SQL.
[ ] Policies bloquean scripts.
[ ] Policies bloquean commit sin dry-run requerido.
[ ] Policies bloquean commit sin aprobación requerida.
[ ] Policies bloquean pagos reales y contabilidad directa.
```

---

# 10. EPIC-028-06 — Validators and sanitizers

```text id="dim-epic-06"
[ ] Crear ImportTemplateValidator.
[ ] Crear ImportFileValidator.
[ ] Crear ImportMappingValidator.
[ ] Crear ImportRowStructureValidator.
[ ] Crear ImportDomainValidator.
[ ] Crear ImportExecutionValidator.
[ ] Crear ImportReportValidator.
[ ] Crear ImportPayloadSanitizer.
[ ] Crear ImportIssueSanitizer.
[ ] Crear ImportRowResultSanitizer.
[ ] Crear ImportReportSanitizer.
[ ] Crear ForbiddenKeysValidator recursivo.
[ ] Rechazar tenantId desde cliente.
[ ] Rechazar actor fields.
[ ] Rechazar status directo.
[ ] Rechazar storageKey.
[ ] Rechazar signedUrl persistente.
[ ] Rechazar rawSql.
[ ] Rechazar script.
[ ] Rechazar formulaCode.
[ ] Rechazar executableCode.
[ ] Rechazar secret/token/password/apiKey.
[ ] Rechazar externalAiEnabled.
[ ] Rechazar externalAiRealDataAllowed.
```

Acceptance:

```text id="dim-epic-06-ac"
[ ] Ningún DTO acepta campos prohibidos.
[ ] Ningún JSONB acepta campos prohibidos.
[ ] Logs no reciben filas completas sensibles.
[ ] Audit no recibe archivo crudo.
```

---

# 11. EPIC-028-07 — Prisma schema and migration

```text id="dim-epic-07"
[ ] Agregar enums Prisma.
[ ] Crear model ImportTemplate.
[ ] Crear model ImportBatch.
[ ] Crear model ImportFile.
[ ] Crear model ImportMapping.
[ ] Crear model ImportValidationRun.
[ ] Crear model ImportValidationIssue.
[ ] Crear model ImportPreview.
[ ] Crear model ImportExecution.
[ ] Crear model ImportRowResult.
[ ] Crear model ImportReport.
[ ] Agregar relaciones en Tenant.
[ ] Crear migración 028_create_data_import_migration.
[ ] Crear unique template_key.
[ ] Crear unique tenant_id + batch_code.
[ ] Crear unique tenant_id + import_batch_id + idempotency_key.
[ ] Crear índices tenant-scoped.
[ ] Crear checks básicos.
[ ] Ejecutar prisma format.
[ ] Ejecutar migración local.
[ ] Ejecutar migración test.
```

Acceptance:

```text id="dim-epic-07-ac"
[ ] Todas las tablas tenant-scoped tienen tenant_id.
[ ] No existen columnas storage_key.
[ ] No existen columnas raw_sql.
[ ] No existen columnas script/formula_code.
[ ] No existen columnas de pago real, ledger directo o hardware.
```

---

# 12. EPIC-028-08 — Repositories

```text id="dim-epic-08"
[ ] Crear ImportTemplateRepositoryPort.
[ ] Crear PrismaImportTemplateRepository.
[ ] Crear ImportBatchRepositoryPort.
[ ] Crear PrismaImportBatchRepository.
[ ] Crear ImportFileRepositoryPort.
[ ] Crear PrismaImportFileRepository.
[ ] Crear ImportMappingRepositoryPort.
[ ] Crear PrismaImportMappingRepository.
[ ] Crear ImportValidationRunRepositoryPort.
[ ] Crear PrismaImportValidationRunRepository.
[ ] Crear ImportValidationIssueRepositoryPort.
[ ] Crear PrismaImportValidationIssueRepository.
[ ] Crear ImportPreviewRepositoryPort.
[ ] Crear PrismaImportPreviewRepository.
[ ] Crear ImportExecutionRepositoryPort.
[ ] Crear PrismaImportExecutionRepository.
[ ] Crear ImportRowResultRepositoryPort.
[ ] Crear PrismaImportRowResultRepository.
[ ] Crear ImportReportRepositoryPort.
[ ] Crear PrismaImportReportRepository.
```

Regla:

```text id="dim-epic-08-rule"
Toda consulta tenant-scoped usa id + tenantId, batchId + tenantId o clave + tenantId.
```

Acceptance:

```text id="dim-epic-08-ac"
[ ] tenantA no lee batches tenantB.
[ ] tenantA no lee files tenantB.
[ ] tenantA no lee mappings tenantB.
[ ] tenantA no lee issues tenantB.
[ ] tenantA no lee executions tenantB.
[ ] tenantA no lee row results tenantB.
[ ] tenantA no lee reports tenantB.
```

---

# 13. EPIC-028-09 — DTOs, guards and permissions

```text id="dim-epic-09"
[ ] Crear CreateImportBatchDto.
[ ] Crear UpdateImportBatchDto.
[ ] Crear UploadImportFileDto.
[ ] Crear ConfigureImportMappingDto.
[ ] Crear ValidateImportBatchDto.
[ ] Crear PreviewImportBatchDto.
[ ] Crear RunDryRunDto.
[ ] Crear SubmitImportApprovalDto.
[ ] Crear ApproveImportBatchDto.
[ ] Crear ExecuteImportBatchDto.
[ ] Crear CancelImportBatchDto.
[ ] Crear ArchiveImportBatchDto.
[ ] Crear CreateImportReportDto.
[ ] Crear query DTOs.
[ ] Aplicar ValidationPipe whitelist.
[ ] Aplicar forbidNonWhitelisted.
[ ] Aplicar AuthGuard.
[ ] Aplicar TenantGuard.
[ ] Aplicar PermissionGuard.
[ ] Aplicar SensitivePermissionGuard.
[ ] Crear ImportBatchTenantGuard.
[ ] Crear ImportExecutionTenantGuard.
[ ] Crear ImportReportTenantGuard.
```

Acceptance:

```text id="dim-epic-09-ac"
[ ] Sin token retorna 401.
[ ] Sin permiso retorna 403.
[ ] Cross-tenant retorna 404.
[ ] Importaciones sensibles requieren permiso sensible.
```

---

# 14. EPIC-028-10 — Import Templates API

```text id="dim-epic-10"
[ ] Implementar GET /api/v1/tenant/import-templates.
[ ] Implementar GET /api/v1/tenant/import-templates/{templateKey}.
[ ] Filtrar templates active por defecto.
[ ] Validar importTemplates.read.
[ ] No devolver rawSql.
[ ] No devolver scripts.
[ ] No devolver storageKey.
[ ] Crear tests API.
```

Acceptance:

```text id="dim-epic-10-ac"
[ ] Templates se listan con permiso.
[ ] Template archived no se usa en nuevo batch.
[ ] Response no contiene datos reales de tenants.
```

---

# 15. EPIC-028-11 — Import Batches API

```text id="dim-epic-11"
[ ] Implementar GET /api/v1/tenant/import-batches.
[ ] Implementar POST /api/v1/tenant/import-batches.
[ ] Implementar GET /api/v1/tenant/import-batches/{batchId}.
[ ] Implementar PATCH /api/v1/tenant/import-batches/{batchId}.
[ ] Generar batchCode server-side.
[ ] Resolver createdBy server-side.
[ ] Resolver dryRunRequired desde política.
[ ] Resolver approvalRequired desde política.
[ ] Impedir status directo.
[ ] Impedir tenantId.
[ ] Auditar importBatch.created.
[ ] Auditar importBatch.updated.
[ ] Crear tests API.
```

Acceptance:

```text id="dim-epic-11-ac"
[ ] Batch inicia en draft.
[ ] Batch pertenece al tenant actual.
[ ] PATCH solo actualiza metadata permitida.
[ ] Batch completed/cancelled/archived no se edita.
```

---

# 16. EPIC-028-12 — Upload file and SDS

```text id="dim-epic-12"
[ ] Implementar POST /api/v1/tenant/import-batches/{batchId}/upload-file.
[ ] Crear ImportFileService.
[ ] Crear SecureDocumentStorageImportAdapter.
[ ] Validar secureDocumentId.
[ ] Validar pertenencia al tenant.
[ ] Validar formato xlsx/csv/json.
[ ] Validar MIME.
[ ] Validar tamaño máximo.
[ ] Validar checksum si aplica.
[ ] Rechazar storageKey.
[ ] Rechazar signedUrl.
[ ] Rechazar base64 en JSON.
[ ] Cambiar batch a fileUploaded.
[ ] Auditar importBatch.fileUploaded.
```

Acceptance:

```text id="dim-epic-12-ac"
[ ] Archivo se referencia con secureDocumentId.
[ ] No se almacena storageKey.
[ ] No se almacena binario.
[ ] Formato no permitido retorna 415.
```

---

# 17. EPIC-028-13 — Parsers

```text id="dim-epic-13"
[ ] Crear ImportParserService.
[ ] Crear XlsxImportParser.
[ ] Crear CsvImportParser.
[ ] Crear JsonImportParser.
[ ] Leer encabezados.
[ ] Ignorar filas vacías.
[ ] Limitar filas máximas.
[ ] Limitar columnas máximas.
[ ] Detectar columnas requeridas faltantes.
[ ] Detectar encoding inválido en CSV.
[ ] Rechazar macros/contenido ejecutable.
[ ] Rechazar SQL dumps.
[ ] Sanitizar errores de parseo.
```

Acceptance:

```text id="dim-epic-13-ac"
[ ] Parser no registra archivo crudo en logs.
[ ] Parser no devuelve storageKey.
[ ] Parser rechaza formatos no permitidos.
```

---

# 18. EPIC-028-14 — Mapping

```text id="dim-epic-14"
[ ] Implementar POST /api/v1/tenant/import-batches/{batchId}/configure-mapping.
[ ] Crear ImportMappingService.
[ ] Validar mapping contra template.
[ ] Validar sourceColumn.
[ ] Validar targetField.
[ ] Validar required columns.
[ ] Rechazar rawSql.
[ ] Rechazar script.
[ ] Rechazar formulaCode.
[ ] Rechazar tenantId.
[ ] Guardar mappingConfig sanitizado.
[ ] Cambiar batch a mappingConfigured.
[ ] Auditar importBatch.mappingConfigured.
```

Acceptance:

```text id="dim-epic-14-ac"
[ ] Mapping es declarativo.
[ ] Mapping no amplía permisos.
[ ] Mapping no ejecuta transformaciones arbitrarias.
```

---

# 19. EPIC-028-15 — Validation and issues

```text id="dim-epic-15"
[ ] Implementar POST /api/v1/tenant/import-batches/{batchId}/validate.
[ ] Implementar GET /api/v1/tenant/import-batches/{batchId}/issues.
[ ] Crear ImportValidationService.
[ ] Crear ImportValidationIssueService.
[ ] Crear validation worker.
[ ] Validar estructura.
[ ] Validar tipos.
[ ] Validar fechas.
[ ] Validar montos.
[ ] Validar duplicados internos.
[ ] Validar conflictos contra datos existentes.
[ ] Generar issues por fila/campo.
[ ] Marcar severity info/warning/error/critical.
[ ] Cambiar batch a validated o validationFailed.
[ ] Auditar validationStarted/completed/failed.
```

Acceptance:

```text id="dim-epic-15-ac"
[ ] Validación no modifica datos transaccionales.
[ ] Critical issue bloquea preview/dry-run/commit.
[ ] Issues no exponen fila completa sensible.
```

---

# 20. EPIC-028-16 — Preview

```text id="dim-epic-16"
[ ] Implementar POST /api/v1/tenant/import-batches/{batchId}/preview.
[ ] Crear ImportPreviewService.
[ ] Crear preview worker.
[ ] Calcular filas a crear.
[ ] Calcular filas a actualizar.
[ ] Calcular filas a omitir.
[ ] Calcular advertencias.
[ ] Guardar previewDataSanitized.
[ ] Guardar summarySanitized.
[ ] Cambiar batch a previewReady.
[ ] Auditar importBatch.previewGenerated.
```

Acceptance:

```text id="dim-epic-16-ac"
[ ] Preview no modifica datos fuente.
[ ] Preview no contiene storageKey.
[ ] Preview no contiene datos sensibles innecesarios.
```

---

# 21. EPIC-028-17 — Dry-run

```text id="dim-epic-17"
[ ] Implementar POST /api/v1/tenant/import-batches/{batchId}/dry-run.
[ ] Crear ImportDryRunService.
[ ] Crear dry-run worker.
[ ] Crear ImportExecution mode=dryRun.
[ ] Generar idempotencyKey server-side.
[ ] Simular creación/actualización por fila.
[ ] Generar ImportRowResult simulados.
[ ] No llamar commits reales en módulos propietarios.
[ ] Auditar dryRunStarted.
[ ] Auditar dryRunCompleted.
```

Acceptance:

```text id="dim-epic-17-ac"
[ ] Dry-run no modifica datos.
[ ] Dry-run es idempotente.
[ ] Dry-run es requerido si política lo exige.
```

---

# 22. EPIC-028-18 — Approval flow

```text id="dim-epic-18"
[ ] Implementar POST /api/v1/tenant/import-batches/{batchId}/submit-approval.
[ ] Implementar POST /api/v1/tenant/import-batches/{batchId}/approve.
[ ] Crear ImportApprovalService.
[ ] Requerir previewReady.
[ ] Requerir dry-run exitoso si dryRunRequired=true.
[ ] Cambiar batch a pendingApproval.
[ ] Validar tenantImports.approve.
[ ] Validar permisos sensibles por importType.
[ ] Resolver approvedBy server-side.
[ ] Registrar approvedAt.
[ ] Cambiar batch a approved.
[ ] Auditar submittedForApproval.
[ ] Auditar importBatch.approved.
```

Acceptance:

```text id="dim-epic-18-ac"
[ ] No se aprueba validationFailed.
[ ] No se aprueba sin dry-run requerido.
[ ] No se aprueba importación sensible sin permiso sensible.
```

---

# 23. EPIC-028-19 — Commit execution

```text id="dim-epic-19"
[ ] Implementar POST /api/v1/tenant/import-batches/{batchId}/execute.
[ ] Crear ImportExecutionService.
[ ] Crear commit worker.
[ ] Crear ImportExecution mode=commit.
[ ] Generar idempotencyKey server-side.
[ ] Revalidar batch approved.
[ ] Revalidar dry-run si requerido.
[ ] Revalidar ausencia de critical issues.
[ ] Procesar por lotes.
[ ] Llamar únicamente owner ports.
[ ] Registrar ImportRowResult por fila.
[ ] Marcar batch executing.
[ ] Marcar completed/partiallyCompleted/failed.
[ ] Auditar executionStarted/completed/partiallyCompleted/failed.
```

Acceptance:

```text id="dim-epic-19-ac"
[ ] Commit no se ejecuta sin aprobación requerida.
[ ] Commit no se ejecuta sin dry-run requerido.
[ ] Commit no escribe directamente en tablas externas.
[ ] Retry no duplica registros.
```

---

# 24. EPIC-028-20 — Owner ports

```text id="dim-epic-20"
[ ] Crear ResidentsPropertiesImportPort.
[ ] Crear UsersRolesImportPort.
[ ] Crear DuesFeesImportPort.
[ ] Crear PaymentsHistoricalImportPort.
[ ] Crear AccountStatementsImportPort.
[ ] Crear InventoryImportPort.
[ ] Crear AccessControlImportPort.
[ ] Crear AuditImportPort.
[ ] Implementar adapters mockeables.
[ ] Validar tenant en cada puerto.
[ ] Validar reglas de negocio del módulo propietario.
[ ] Rechazar storageKey en puertos.
[ ] Rechazar rawSql en puertos.
[ ] Rechazar payload no sanitizado.
```

Prohibiciones:

```text id="dim-epic-20-forbidden"
[ ] No ejecutar pagos reales.
[ ] No validar pagos automáticamente.
[ ] No reversar pagos.
[ ] No crear JournalEntry directo.
[ ] No confirmar Bank Reconciliation.
[ ] No abrir portones.
[ ] No controlar hardware.
```

---

# 25. EPIC-028-21 — Row results

```text id="dim-epic-21"
[ ] Implementar GET /api/v1/tenant/import-batches/{batchId}/row-results.
[ ] Crear ImportRowResultService.
[ ] Guardar status por fila.
[ ] Guardar targetModule.
[ ] Guardar targetResourceType.
[ ] Guardar targetResourceId solo si permitido.
[ ] Guardar conflictKey.
[ ] Guardar inputSanitized.
[ ] Guardar outputSanitized.
[ ] Guardar errorCode.
[ ] Guardar failureReason sanitizado.
[ ] Aplicar paginación.
[ ] Aplicar filtros por status/rowNumber/targetModule.
```

Acceptance:

```text id="dim-epic-21-ac"
[ ] Row results son tenant-scoped.
[ ] No exponen datos personales completos sin permiso.
[ ] No exponen storageKey.
```

---

# 26. EPIC-028-22 — Reports via SDS

```text id="dim-epic-22"
[ ] Implementar GET /api/v1/tenant/import-batches/{batchId}/reports.
[ ] Implementar POST /api/v1/tenant/import-batches/{batchId}/reports.
[ ] Crear ImportReportService.
[ ] Generar report validation.
[ ] Generar report preview.
[ ] Generar report execution.
[ ] Generar report errors.
[ ] Generar report full.
[ ] Implementar formato json.
[ ] Implementar formato xlsx.
[ ] Dejar pdf opcional si engine existe.
[ ] Guardar reporte vía SDS.
[ ] Guardar secureDocumentId.
[ ] No guardar storageKey.
[ ] No devolver storageKey.
[ ] Auditar importReport.generated.
```

Acceptance:

```text id="dim-epic-22-ac"
[ ] Reporte completed tiene secureDocumentId.
[ ] Reporte no devuelve storageKey.
[ ] Reporte tenantB no es visible para tenantA.
```

---

# 27. EPIC-028-23 — Queue and workers

```text id="dim-epic-23"
[ ] Crear DataImportQueuePort.
[ ] Crear BullMqDataImportQueueAdapter.
[ ] Crear queue data-import.validation.
[ ] Crear queue data-import.preview.
[ ] Crear queue data-import.dry-run.
[ ] Crear queue data-import.execution.
[ ] Crear queue data-import.report.
[ ] Configurar jobId determinístico.
[ ] Configurar concurrency.
[ ] Configurar retry finito.
[ ] Configurar dead-letter básico.
[ ] Sanitizar payload de jobs.
[ ] Revalidar tenant activo en workers.
[ ] Revalidar estado del batch en workers.
[ ] Revalidar idempotencyKey en workers.
```

Acceptance:

```text id="dim-epic-23-ac"
[ ] Job payload no contiene storageKey.
[ ] Job payload no contiene archivo completo.
[ ] Worker no ejecuta batch archived/cancelled.
[ ] Worker no duplica commit.
```

---

# 28. EPIC-028-24 — Cancel and archive

```text id="dim-epic-24"
[ ] Implementar POST /api/v1/tenant/import-batches/{batchId}/cancel.
[ ] Implementar POST /api/v1/tenant/import-batches/{batchId}/archive.
[ ] Crear CancelImportBatchUseCase.
[ ] Crear ArchiveImportBatchUseCase.
[ ] Validar tenantImports.cancel.
[ ] Validar tenantImports.archive.
[ ] Resolver cancelledBy server-side.
[ ] Resolver archivedBy server-side.
[ ] No physical delete.
[ ] No eliminar documentos SDS automáticamente.
[ ] Auditar importBatch.cancelled.
[ ] Auditar importBatch.archived.
```

Acceptance:

```text id="dim-epic-24-ac"
[ ] Cancelación durante running es best effort.
[ ] Cancelación no revierte filas confirmadas.
[ ] Archive conserva trazabilidad.
```

---

# 29. EPIC-028-25 — Audit and observability

```text id="dim-epic-25"
[ ] Crear DataImportAuditService.
[ ] Crear DataImportObservabilityService.
[ ] Auditar importBatch.created.
[ ] Auditar importBatch.updated.
[ ] Auditar importBatch.fileUploaded.
[ ] Auditar importBatch.mappingConfigured.
[ ] Auditar importBatch.validationStarted/completed/failed.
[ ] Auditar importBatch.previewGenerated.
[ ] Auditar importBatch.dryRunStarted/completed.
[ ] Auditar importBatch.submittedForApproval.
[ ] Auditar importBatch.approved.
[ ] Auditar importBatch.executionStarted/completed/partiallyCompleted/failed.
[ ] Auditar importBatch.cancelled/archived.
[ ] Auditar importReport.generated.
[ ] Crear logs seguros.
[ ] Crear métricas data_import_*.
[ ] Sanitizar audit metadata.
[ ] Sanitizar logs.
```

Acceptance:

```text id="dim-epic-25-ac"
[ ] Audit no contiene storageKey.
[ ] Audit no contiene archivo completo.
[ ] Logs no contienen datos personales completos.
[ ] Metrics no usan tenantId/userId como labels.
```

---

# 30. EPIC-028-26 — Seeds

```text id="dim-epic-26"
[ ] Crear seed residents-properties-initial-load-xlsx.
[ ] Crear seed users-initial-load-xlsx.
[ ] Crear seed dues-opening-balances-xlsx.
[ ] Crear seed charges-initial-load-xlsx.
[ ] Crear seed payments-historical-reference-csv.
[ ] Crear seed common-areas-initial-load-xlsx.
[ ] Crear seed suppliers-initial-load-xlsx.
[ ] Crear seed inventory-initial-load-xlsx.
[ ] Crear seed access-residents-vehicles-initial-load-xlsx.
[ ] Validar idempotencia de seeds.
[ ] Validar que seeds no contienen rawSql.
[ ] Validar que seeds no contienen scripts.
[ ] Validar que seeds no contienen datos reales.
```

Acceptance:

```text id="dim-epic-26-ac"
[ ] Seeds son idempotentes.
[ ] Seeds son seguros por defecto.
[ ] Seeds no contienen datos reales ni secretos.
```

---

# 31. EPIC-028-27 — OpenAPI

```text id="dim-epic-27"
[ ] Documentar Tenant Import Templates.
[ ] Documentar Tenant Import Batches.
[ ] Documentar Tenant Import Files.
[ ] Documentar Tenant Import Mapping.
[ ] Documentar Tenant Import Validation.
[ ] Documentar Tenant Import Preview.
[ ] Documentar Tenant Import Execution.
[ ] Documentar Tenant Import Row Results.
[ ] Documentar Tenant Import Reports.
[ ] Agregar x-auth-required=true.
[ ] Agregar x-tenant-scope=true.
[ ] Agregar x-data-import-migration=true.
[ ] Agregar x-batch-processing=true.
[ ] Agregar x-controlled-write=true.
[ ] Agregar x-public-exposure=false.
[ ] Agregar x-wordpress-access=false.
[ ] Agregar x-storage-key-exposed=false.
[ ] Agregar x-raw-sql-allowed=false.
[ ] Agregar x-scripting-allowed=false.
[ ] Agregar x-secure-document-storage=true.
```

No documentar:

```text id="dim-epic-27-forbidden"
[ ] Rutas públicas.
[ ] tenantId en DTOs.
[ ] actor fields.
[ ] status directo.
[ ] storageKey.
[ ] rawSql.
[ ] script.
[ ] formulaCode.
[ ] secrets.
```

---

# 32. EPIC-028-28 — Security hardening and CI

```text id="dim-epic-28"
[ ] Ejecutar forbidden fields tests.
[ ] Ejecutar multitenancy tests.
[ ] Ejecutar permission tests.
[ ] Ejecutar sensitive import tests.
[ ] Ejecutar file safety tests.
[ ] Ejecutar no public endpoint tests.
[ ] Ejecutar no WordPress access tests.
[ ] Ejecutar no storageKey tests.
[ ] Ejecutar no raw SQL tests.
[ ] Ejecutar no script tests.
[ ] Ejecutar no direct DB write tests.
[ ] Ejecutar no payment execution tests.
[ ] Ejecutar no accounting direct tests.
[ ] Ejecutar no bank reconciliation confirmation tests.
[ ] Ejecutar no hardware control tests.
[ ] Ejecutar no external AI tests.
[ ] Ejecutar idempotency tests.
[ ] Ejecutar smoke tests.
[ ] Agregar gates al CI.
```

Acceptance:

```text id="dim-epic-28-ac"
[ ] Tests críticos de seguridad pasan 100%.
[ ] Tests críticos multitenant pasan 100%.
[ ] Tests de idempotencia pasan 100%.
[ ] CI falla ante cualquier endpoint público o storageKey expuesto.
```

---

# 33. Plan de Pull Requests sugerido

```text id="dim-pr-plan"
PR-028-01 — Module foundation, config, flags, enums and errors.
PR-028-02 — Domain entities, state machines, value objects and policies.
PR-028-03 — Validators, sanitizers, Prisma schema and repositories.
PR-028-04 — DTOs, guards, permissions and Import Templates/Batches API.
PR-028-05 — SDS upload, parsers and mapping.
PR-028-06 — Validation, issues, preview and dry-run.
PR-028-07 — Approval, commit execution and owner ports.
PR-028-08 — Row results, reports, queues and workers.
PR-028-09 — Audit, observability, seeds and OpenAPI.
PR-028-10 — Security hardening, performance and smoke tests.
```

---

# 34. Checklist por endpoint

```text id="dim-endpoint-checklist"
[ ] GET    /api/v1/tenant/import-templates
[ ] GET    /api/v1/tenant/import-templates/{templateKey}

[ ] GET    /api/v1/tenant/import-batches
[ ] POST   /api/v1/tenant/import-batches
[ ] GET    /api/v1/tenant/import-batches/{batchId}
[ ] PATCH  /api/v1/tenant/import-batches/{batchId}
[ ] POST   /api/v1/tenant/import-batches/{batchId}/upload-file
[ ] POST   /api/v1/tenant/import-batches/{batchId}/configure-mapping
[ ] POST   /api/v1/tenant/import-batches/{batchId}/validate
[ ] POST   /api/v1/tenant/import-batches/{batchId}/preview
[ ] POST   /api/v1/tenant/import-batches/{batchId}/dry-run
[ ] POST   /api/v1/tenant/import-batches/{batchId}/submit-approval
[ ] POST   /api/v1/tenant/import-batches/{batchId}/approve
[ ] POST   /api/v1/tenant/import-batches/{batchId}/execute
[ ] POST   /api/v1/tenant/import-batches/{batchId}/cancel
[ ] POST   /api/v1/tenant/import-batches/{batchId}/archive

[ ] GET    /api/v1/tenant/import-batches/{batchId}/issues
[ ] GET    /api/v1/tenant/import-batches/{batchId}/row-results
[ ] GET    /api/v1/tenant/import-batches/{batchId}/reports
[ ] POST   /api/v1/tenant/import-batches/{batchId}/reports
```

---

# 35. Definition of Done

```text id="dim-dod"
[ ] spec.md aprobado.
[ ] plan.md aprobado.
[ ] data-model.md aprobado.
[ ] api-contract.md aprobado.
[ ] test-plan.md aprobado.
[ ] tasks.md aprobado.
[ ] security-notes.md creado y aprobado.
[ ] Módulo NestJS implementado.
[ ] Configuración y flags implementados.
[ ] Prisma schema y migración implementados.
[ ] Repositories implementados.
[ ] DTOs seguros implementados.
[ ] Guards y permisos implementados.
[ ] Templates API implementada.
[ ] Batches API implementada.
[ ] Upload vía SDS implementado.
[ ] Parsers implementados.
[ ] Mapping implementado.
[ ] Validation e issues implementados.
[ ] Preview implementado.
[ ] Dry-run implementado.
[ ] Approval implementado.
[ ] Commit execution implementado.
[ ] Owner ports implementados.
[ ] Row results implementados.
[ ] Reports vía SDS implementados.
[ ] Queues y workers implementados.
[ ] Audit implementado.
[ ] Observability implementada.
[ ] Seeds implementados.
[ ] OpenAPI implementado.
[ ] Security hardening ejecutado.
[ ] Smoke tests pasan.
[ ] CI completo pasa.
```

---

# 36. No aceptación

No se acepta implementación si:

```text id="dim-no-acceptance"
- permite importaciones cross-tenant;
- acepta tenantId desde cliente;
- acepta actor fields desde cliente;
- acepta status directo;
- acepta storageKey;
- devuelve storageKey;
- acepta signedUrl persistente;
- acepta rawSql;
- acepta scripts;
- acepta formulaCode ejecutable;
- acepta secretos;
- crea endpoints públicos;
- permite acceso WordPress público;
- procesa archivo fuera de SDS;
- acepta archivo base64 en JSON;
- ejecuta commit sin validación;
- ejecuta commit sin dry-run requerido;
- ejecuta commit sin aprobación requerida;
- duplica datos por retry;
- escribe directamente en tablas externas sin puerto autorizado;
- ejecuta pagos reales;
- valida pagos automáticamente;
- crea JournalEntry directo;
- confirma Bank Reconciliation;
- abre portones;
- controla hardware;
- envía datos reales a IA externa;
- omite auditoría crítica.
```

---

# 37. Resultado esperado

```text id="dim-expected-result"
tasks definidas
épicas implementables definidas
PR plan definido
endpoint checklist definido
DoD definido
no acceptance definido
módulo importación controlada definido
validación por lote definida
preview definido
dry-run requerido definido
approval definido
commit idempotente definido
owner ports definidos
reports SDS definidos
security hardening definido
CI gates definidos
```

---

# 38. Expediente actualizado

```text id="dim-expediente"
resident-core/
├── docs/
│   ├── specs/
│   │   └── 028-data-import-migration/
│   │       ├── spec.md
│   │       ├── plan.md
│   │       ├── data-model.md
│   │       ├── api-contract.md
│   │       ├── test-plan.md
│   │       └── tasks.md
```
