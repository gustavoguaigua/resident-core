# Data Model — 028 Data Import and Migration

## 1. Información del documento

| Campo                  | Valor                                                                                           |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| Proyecto               | RESIDENT Core                                                                                   |
| Spec ID                | 028                                                                                             |
| Módulo                 | Data Import and Migration                                                                       |
| Documento              | Data Model                                                                                      |
| Ruta                   | `docs/specs/028-data-import-migration/data-model.md`                                            |
| Versión                | 0.1                                                                                             |
| Estado                 | Borrador inicial                                                                                |
| Fecha                  | 2026-08-02                                                                                      |
| Base de datos          | PostgreSQL                                                                                      |
| ORM                    | Prisma                                                                                          |
| Estrategia multitenant | Shared database / shared schema / tenant_id                                                     |
| Naturaleza             | Tenant-scoped / Batch-oriented / Validation-heavy / Audit-heavy / Controlled-write / Non-public |

---

## 2. Propósito

Definir el modelo de datos para importar, validar, previsualizar, aprobar, ejecutar y auditar cargas iniciales o migraciones de datos hacia RESIDENT Core.

El modelo debe permitir staging controlado, resultados por fila, dry-run, aprobación previa, ejecución idempotente y reportes seguros mediante Secure Document Storage.

Regla central:

```text id="dim-dm-rule"
Todo template, lote, archivo, mapping, validación, issue, preview, ejecución, resultado por fila y reporte de Data Import and Migration debe ser tenant-scoped cuando corresponda, auditable, idempotente, validado, sanitizado, sin storageKey, sin SQL arbitrario, sin scripts, sin escritura directa no autorizada, sin endpoints públicos, sin WordPress público y sin IA externa con datos reales.
```

---

## 3. Principios del modelo

```text id="dim-dm-principles"
1. Las importaciones pertenecen siempre a un tenant.
2. Los archivos se almacenan en Secure Document Storage.
3. El módulo guarda secureDocumentId, nunca storageKey.
4. Todo lote conserva estado, actor, timestamps y trazabilidad.
5. Las validaciones generan issues por fila y por campo.
6. El preview no modifica datos transaccionales.
7. El dry-run es obligatorio cuando la política lo exige.
8. El commit requiere aprobación cuando la política lo exige.
9. La ejecución final usa puertos de módulos propietarios.
10. Retry no debe duplicar registros.
11. No se permite raw SQL.
12. No se permite scripting.
13. No se permite fórmula ejecutable.
14. No se permite importación pública desde WordPress.
15. No se envían datos reales a IA externa.
```

---

## 4. Tablas principales

```text id="dim-dm-tables"
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

---

## 5. Tabla `import_templates`

Define plantillas de importación permitidas.

| Campo                    |         Tipo | Requerido | Descripción                |
| ------------------------ | -----------: | --------: | -------------------------- |
| `id`                     |         UUID |        Sí | Identificador              |
| `template_key`           | varchar(160) |        Sí | Clave única                |
| `import_type`            |         enum |        Sí | Tipo de importación        |
| `name`                   | varchar(180) |        Sí | Nombre                     |
| `description`            |         text |        No | Descripción                |
| `source_format`          |         enum |        Sí | xlsx/csv/json              |
| `schema_definition`      |        jsonb |        Sí | Estructura esperada        |
| `mapping_schema`         |        jsonb |        No | Mapping esperado           |
| `is_tenant_configurable` |      boolean |        Sí | Permite ajustes por tenant |
| `status`                 |         enum |        Sí | active/deprecated/archived |
| `created_by`             |         UUID |        Sí | Actor creador              |
| `updated_by`             |         UUID |        No | Actor modificador          |
| `archived_by`            |         UUID |        No | Actor archivador           |
| `created_at`             |  timestamptz |        Sí | Creación                   |
| `updated_at`             |  timestamptz |        Sí | Actualización              |
| `archived_at`            |  timestamptz |        No | Archivo lógico             |

Reglas:

```text id="dim-template-rules"
- template_key único.
- schema_definition no puede contener rawSql.
- schema_definition no puede contener scripts.
- schema_definition no puede contener storageKey.
- Plantilla archived no puede usarse en nuevos lotes.
```

---

## 6. Tabla `import_batches`

Representa el lote principal de importación.

| Campo               |         Tipo | Requerido | Descripción             |
| ------------------- | -----------: | --------: | ----------------------- |
| `id`                |         UUID |        Sí | Identificador           |
| `tenant_id`         |         UUID |        Sí | Tenant propietario      |
| `batch_code`        | varchar(160) |        Sí | Código único por tenant |
| `import_type`       |         enum |        Sí | Tipo de importación     |
| `template_id`       |         UUID |        Sí | Plantilla usada         |
| `source_format`     |         enum |        Sí | Formato fuente          |
| `status`            |         enum |        Sí | Estado del lote         |
| `title`             | varchar(180) |        Sí | Título                  |
| `description`       |         text |        No | Descripción             |
| `row_count`         |      integer |        No | Total de filas          |
| `valid_row_count`   |      integer |        No | Filas válidas           |
| `invalid_row_count` |      integer |        No | Filas inválidas         |
| `warning_count`     |      integer |        No | Advertencias            |
| `error_count`       |      integer |        No | Errores                 |
| `dry_run_required`  |      boolean |        Sí | Requiere dry-run        |
| `approval_required` |      boolean |        Sí | Requiere aprobación     |
| `approved_at`       |  timestamptz |        No | Fecha aprobación        |
| `approved_by`       |         UUID |        No | Actor aprobador         |
| `approval_reason`   |         text |        No | Motivo                  |
| `created_by`        |         UUID |        Sí | Actor creador           |
| `updated_by`        |         UUID |        No | Actor modificador       |
| `cancelled_by`      |         UUID |        No | Actor cancelador        |
| `archived_by`       |         UUID |        No | Actor archivador        |
| `created_at`        |  timestamptz |        Sí | Creación                |
| `updated_at`        |  timestamptz |        Sí | Actualización           |
| `cancelled_at`      |  timestamptz |        No | Cancelación             |
| `archived_at`       |  timestamptz |        No | Archivo lógico          |

Reglas:

```text id="dim-batch-rules"
- tenant_id obligatorio.
- batch_code único por tenant.
- status cambia solo por transiciones controladas.
- approved_by se resuelve server-side.
- No puede ejecutarse si validationFailed.
- No puede ejecutarse si requiere aprobación y no está approved.
- No physical delete ordinario.
```

---

## 7. Tabla `import_files`

Referencia archivos cargados vía Secure Document Storage.

| Campo                |         Tipo | Requerido | Descripción                       |
| -------------------- | -----------: | --------: | --------------------------------- |
| `id`                 |         UUID |        Sí | Identificador                     |
| `tenant_id`          |         UUID |        Sí | Tenant propietario                |
| `import_batch_id`    |         UUID |        Sí | Lote                              |
| `secure_document_id` |         UUID |        Sí | Documento seguro                  |
| `original_file_name` | varchar(240) |        Sí | Nombre original                   |
| `source_format`      |         enum |        Sí | xlsx/csv/json                     |
| `mime_type`          | varchar(120) |        Sí | MIME                              |
| `file_size_bytes`    |       bigint |        Sí | Tamaño                            |
| `checksum_sha256`    | varchar(128) |        No | Checksum                          |
| `status`             |         enum |        Sí | uploaded/parsed/rejected/archived |
| `uploaded_by`        |         UUID |        Sí | Actor                             |
| `created_at`         |  timestamptz |        Sí | Creación                          |
| `archived_at`        |  timestamptz |        No | Archivo lógico                    |

Reglas:

```text id="dim-file-rules"
- No almacenar storageKey.
- No almacenar signedUrl persistente.
- No almacenar binario en tablas propias.
- Archivo debe pertenecer al tenant.
- Formato debe estar permitido.
```

---

## 8. Tabla `import_mappings`

Define correspondencia entre columnas del archivo y campos destino.

| Campo             |        Tipo | Requerido | Descripción               |
| ----------------- | ----------: | --------: | ------------------------- |
| `id`              |        UUID |        Sí | Identificador             |
| `tenant_id`       |        UUID |        Sí | Tenant                    |
| `import_batch_id` |        UUID |        Sí | Lote                      |
| `mapping_config`  |       jsonb |        Sí | Mapping sanitizado        |
| `status`          |        enum |        Sí | draft/configured/archived |
| `configured_by`   |        UUID |        Sí | Actor                     |
| `created_at`      | timestamptz |        Sí | Creación                  |
| `updated_at`      | timestamptz |        Sí | Actualización             |
| `archived_at`     | timestamptz |        No | Archivo lógico            |

Reglas:

```text id="dim-mapping-rules"
- mapping_config debe ser declarativo.
- No permite rawSql.
- No permite script.
- No permite formulaCode ejecutable.
- No permite tenantId desde cliente.
- No permite campos de auditoría desde cliente.
```

---

## 9. Tabla `import_validation_runs`

Registra una ejecución de validación.

| Campo               |        Tipo | Requerido | Descripción                     |
| ------------------- | ----------: | --------: | ------------------------------- |
| `id`                |        UUID |        Sí | Identificador                   |
| `tenant_id`         |        UUID |        Sí | Tenant                          |
| `import_batch_id`   |        UUID |        Sí | Lote                            |
| `status`            |        enum |        Sí | queued/running/succeeded/failed |
| `row_count`         |     integer |        No | Total                           |
| `valid_row_count`   |     integer |        No | Válidas                         |
| `invalid_row_count` |     integer |        No | Inválidas                       |
| `warning_count`     |     integer |        No | Advertencias                    |
| `error_count`       |     integer |        No | Errores                         |
| `started_at`        | timestamptz |        No | Inicio                          |
| `finished_at`       | timestamptz |        No | Fin                             |
| `failure_reason`    |        text |        No | Error sanitizado                |
| `requested_by`      |        UUID |        Sí | Actor                           |
| `created_at`        | timestamptz |        Sí | Creación                        |

Reglas:

```text id="dim-validation-run-rules"
- Validación no modifica datos transaccionales.
- failure_reason debe estar sanitizado.
- No debe contener datos sensibles crudos.
```

---

## 10. Tabla `import_validation_issues`

Registra errores y advertencias por fila/campo.

| Campo                |         Tipo | Requerido | Descripción                 |
| -------------------- | -----------: | --------: | --------------------------- |
| `id`                 |         UUID |        Sí | Identificador               |
| `tenant_id`          |         UUID |        Sí | Tenant                      |
| `import_batch_id`    |         UUID |        Sí | Lote                        |
| `validation_run_id`  |         UUID |        Sí | Validación                  |
| `row_number`         |      integer |        No | Número de fila              |
| `column_name`        | varchar(160) |        No | Columna                     |
| `target_field`       | varchar(160) |        No | Campo destino               |
| `severity`           |         enum |        Sí | info/warning/error/critical |
| `issue_code`         | varchar(160) |        Sí | Código                      |
| `message`            |         text |        Sí | Mensaje seguro              |
| `metadata_sanitized` |        jsonb |        No | Metadata sanitizada         |
| `created_at`         |  timestamptz |        Sí | Creación                    |

Reglas:

```text id="dim-issue-rules"
- message no debe contener payload sensible completo.
- metadata_sanitized no debe contener storageKey.
- severity=critical bloquea ejecución.
```

---

## 11. Tabla `import_previews`

Guarda preview agregado del impacto esperado.

| Campo                    |        Tipo | Requerido | Descripción               |
| ------------------------ | ----------: | --------: | ------------------------- |
| `id`                     |        UUID |        Sí | Identificador             |
| `tenant_id`              |        UUID |        Sí | Tenant                    |
| `import_batch_id`        |        UUID |        Sí | Lote                      |
| `preview_data_sanitized` |       jsonb |        Sí | Preview seguro            |
| `summary_sanitized`      |       jsonb |        No | Resumen                   |
| `status`                 |        enum |        Sí | generated/failed/archived |
| `generated_by`           |        UUID |        Sí | Actor                     |
| `generated_at`           | timestamptz |        Sí | Fecha                     |
| `failure_reason`         |        text |        No | Error sanitizado          |
| `created_at`             | timestamptz |        Sí | Creación                  |
| `archived_at`            | timestamptz |        No | Archivo lógico            |

Reglas:

```text id="dim-preview-rules"
- Preview no ejecuta commit.
- Preview no modifica datos fuente.
- preview_data_sanitized no contiene datos sensibles innecesarios.
- No contiene storageKey.
```

---

## 12. Tabla `import_executions`

Registra dry-run o ejecución real.

| Campo             |         Tipo | Requerido | Descripción                                                  |
| ----------------- | -----------: | --------: | ------------------------------------------------------------ |
| `id`              |         UUID |        Sí | Identificador                                                |
| `tenant_id`       |         UUID |        Sí | Tenant                                                       |
| `import_batch_id` |         UUID |        Sí | Lote                                                         |
| `execution_mode`  |         enum |        Sí | dryRun/commit                                                |
| `idempotency_key` | varchar(240) |        Sí | Idempotencia                                                 |
| `status`          |         enum |        Sí | queued/running/succeeded/partiallySucceeded/failed/cancelled |
| `total_rows`      |      integer |        No | Total                                                        |
| `processed_rows`  |      integer |        No | Procesadas                                                   |
| `created_rows`    |      integer |        No | Creadas                                                      |
| `updated_rows`    |      integer |        No | Actualizadas                                                 |
| `skipped_rows`    |      integer |        No | Saltadas                                                     |
| `failed_rows`     |      integer |        No | Fallidas                                                     |
| `started_at`      |  timestamptz |        No | Inicio                                                       |
| `finished_at`     |  timestamptz |        No | Fin                                                          |
| `failure_reason`  |         text |        No | Error sanitizado                                             |
| `requested_by`    |         UUID |        Sí | Actor                                                        |
| `created_at`      |  timestamptz |        Sí | Creación                                                     |

Reglas:

```text id="dim-execution-rules"
- idempotency_key obligatorio.
- unique tenant_id + import_batch_id + idempotency_key.
- dryRun no modifica datos.
- commit requiere validación válida.
- commit requiere aprobación si approval_required=true.
- Retry no duplica registros.
```

---

## 13. Tabla `import_row_results`

Conserva resultado por fila procesada.

| Campo                  |         Tipo | Requerido | Descripción                |
| ---------------------- | -----------: | --------: | -------------------------- |
| `id`                   |         UUID |        Sí | Identificador              |
| `tenant_id`            |         UUID |        Sí | Tenant                     |
| `import_batch_id`      |         UUID |        Sí | Lote                       |
| `import_execution_id`  |         UUID |        Sí | Ejecución                  |
| `row_number`           |      integer |        Sí | Número de fila             |
| `status`               |         enum |        Sí | Resultado                  |
| `target_module`        | varchar(120) |        Sí | Módulo destino             |
| `target_resource_type` | varchar(120) |        No | Tipo recurso               |
| `target_resource_id`   |         UUID |        No | Recurso creado/actualizado |
| `conflict_key`         | varchar(240) |        No | Detección de duplicado     |
| `input_sanitized`      |        jsonb |        No | Input seguro               |
| `output_sanitized`     |        jsonb |        No | Output seguro              |
| `error_code`           | varchar(160) |        No | Error                      |
| `failure_reason`       |         text |        No | Error sanitizado           |
| `created_at`           |  timestamptz |        Sí | Creación                   |

Reglas:

```text id="dim-row-result-rules"
- tenant_id debe coincidir con batch y execution.
- input_sanitized no debe contener secretos.
- output_sanitized no debe contener storageKey.
- target_resource_id solo se registra después de commit exitoso.
```

---

## 14. Tabla `import_reports`

Registra reportes generados.

| Campo                 |        Tipo | Requerido | Descripción                                    |
| --------------------- | ----------: | --------: | ---------------------------------------------- |
| `id`                  |        UUID |        Sí | Identificador                                  |
| `tenant_id`           |        UUID |        Sí | Tenant                                         |
| `import_batch_id`     |        UUID |        Sí | Lote                                           |
| `import_execution_id` |        UUID |        No | Ejecución                                      |
| `report_type`         |        enum |        Sí | validation/preview/execution/errors/full       |
| `format`              |        enum |        Sí | json/xlsx/pdf                                  |
| `status`              |        enum |        Sí | requested/processing/completed/failed/archived |
| `secure_document_id`  |        UUID |        No | Documento SDS                                  |
| `requested_by`        |        UUID |        Sí | Actor                                          |
| `created_at`          | timestamptz |        Sí | Creación                                       |
| `completed_at`        | timestamptz |        No | Completado                                     |
| `failed_at`           | timestamptz |        No | Fallo                                          |
| `failure_reason`      |        text |        No | Error sanitizado                               |
| `archived_at`         | timestamptz |        No | Archivo lógico                                 |

Reglas:

```text id="dim-report-rules"
- Reporte usa SDS.
- completed requiere secure_document_id.
- No almacenar storageKey.
- No almacenar signedUrl persistente.
- No almacenar archivo base64.
```

---

## 15. Enums

```text id="dim-enums"
ImportType:
- residentsPropertiesInitialLoad
- usersInitialLoad
- duesOpeningBalances
- chargesInitialLoad
- paymentsHistoricalReference
- commonAreasInitialLoad
- suppliersInitialLoad
- inventoryInitialLoad
- accessResidentsVehiclesInitialLoad

ImportSourceFormat:
- xlsx
- csv
- json

ImportTemplateStatus:
- active
- deprecated
- archived

ImportBatchStatus:
- draft
- fileUploaded
- mappingConfigured
- validated
- validationFailed
- previewReady
- pendingApproval
- approved
- executing
- completed
- partiallyCompleted
- failed
- cancelled
- archived

ImportFileStatus:
- uploaded
- parsed
- rejected
- archived

ImportMappingStatus:
- draft
- configured
- archived

ImportValidationRunStatus:
- queued
- running
- succeeded
- failed

ImportValidationSeverity:
- info
- warning
- error
- critical

ImportPreviewStatus:
- generated
- failed
- archived

ImportExecutionMode:
- dryRun
- commit

ImportExecutionStatus:
- queued
- running
- succeeded
- partiallySucceeded
- failed
- cancelled

ImportRowResultStatus:
- pending
- valid
- warning
- invalid
- skipped
- created
- updated
- unchanged
- failed

ImportReportType:
- validation
- preview
- execution
- errors
- full

ImportReportFormat:
- json
- xlsx
- pdf

ImportReportStatus:
- requested
- processing
- completed
- failed
- archived
```

---

## 16. Prisma schema preliminar compacto

```prisma id="dim-prisma-compact"
model ImportTemplate {
  id                   String               @id @default(uuid()) @db.Uuid
  templateKey          String               @unique @map("template_key") @db.VarChar(160)
  importType           ImportType           @map("import_type")
  name                 String               @db.VarChar(180)
  description          String?
  sourceFormat         ImportSourceFormat   @map("source_format")
  schemaDefinition     Json                 @map("schema_definition")
  mappingSchema        Json?                @map("mapping_schema")
  isTenantConfigurable Boolean              @default(false) @map("is_tenant_configurable")
  status               ImportTemplateStatus @default(active)

  createdBy            String               @map("created_by") @db.Uuid
  updatedBy            String?              @map("updated_by") @db.Uuid
  archivedBy           String?              @map("archived_by") @db.Uuid
  createdAt            DateTime             @default(now()) @map("created_at") @db.Timestamptz
  updatedAt            DateTime             @updatedAt @map("updated_at") @db.Timestamptz
  archivedAt           DateTime?            @map("archived_at") @db.Timestamptz

  batches              ImportBatch[]

  @@index([importType, status])
  @@index([sourceFormat])
  @@map("import_templates")
}

model ImportBatch {
  id                String            @id @default(uuid()) @db.Uuid
  tenantId          String            @map("tenant_id") @db.Uuid
  batchCode         String            @map("batch_code") @db.VarChar(160)
  importType        ImportType        @map("import_type")
  templateId        String            @map("template_id") @db.Uuid
  sourceFormat      ImportSourceFormat @map("source_format")
  status            ImportBatchStatus @default(draft)
  title             String            @db.VarChar(180)
  description       String?
  rowCount          Int?              @map("row_count")
  validRowCount     Int?              @map("valid_row_count")
  invalidRowCount   Int?              @map("invalid_row_count")
  warningCount      Int?              @map("warning_count")
  errorCount        Int?              @map("error_count")
  dryRunRequired    Boolean           @default(true) @map("dry_run_required")
  approvalRequired  Boolean           @default(true) @map("approval_required")
  approvedAt        DateTime?         @map("approved_at") @db.Timestamptz
  approvedBy        String?           @map("approved_by") @db.Uuid
  approvalReason    String?           @map("approval_reason")

  createdBy         String            @map("created_by") @db.Uuid
  updatedBy         String?           @map("updated_by") @db.Uuid
  cancelledBy       String?           @map("cancelled_by") @db.Uuid
  archivedBy        String?           @map("archived_by") @db.Uuid
  createdAt         DateTime          @default(now()) @map("created_at") @db.Timestamptz
  updatedAt         DateTime          @updatedAt @map("updated_at") @db.Timestamptz
  cancelledAt       DateTime?         @map("cancelled_at") @db.Timestamptz
  archivedAt        DateTime?         @map("archived_at") @db.Timestamptz

  tenant            Tenant            @relation(fields: [tenantId], references: [id])
  template          ImportTemplate    @relation(fields: [templateId], references: [id])
  files             ImportFile[]
  mappings          ImportMapping[]
  validationRuns    ImportValidationRun[]
  previews          ImportPreview[]
  executions        ImportExecution[]
  rowResults        ImportRowResult[]
  reports           ImportReport[]

  @@unique([tenantId, batchCode])
  @@index([tenantId, importType, status])
  @@index([tenantId, createdAt])
  @@map("import_batches")
}

model ImportFile {
  id               String           @id @default(uuid()) @db.Uuid
  tenantId         String           @map("tenant_id") @db.Uuid
  importBatchId    String           @map("import_batch_id") @db.Uuid
  secureDocumentId String           @map("secure_document_id") @db.Uuid
  originalFileName String           @map("original_file_name") @db.VarChar(240)
  sourceFormat     ImportSourceFormat @map("source_format")
  mimeType         String           @map("mime_type") @db.VarChar(120)
  fileSizeBytes    BigInt           @map("file_size_bytes")
  checksumSha256   String?          @map("checksum_sha256") @db.VarChar(128)
  status           ImportFileStatus @default(uploaded)
  uploadedBy       String           @map("uploaded_by") @db.Uuid
  createdAt        DateTime         @default(now()) @map("created_at") @db.Timestamptz
  archivedAt       DateTime?        @map("archived_at") @db.Timestamptz

  tenant           Tenant           @relation(fields: [tenantId], references: [id])
  batch            ImportBatch      @relation(fields: [importBatchId], references: [id])

  @@index([tenantId, importBatchId])
  @@index([tenantId, secureDocumentId])
  @@map("import_files")
}

model ImportMapping {
  id              String              @id @default(uuid()) @db.Uuid
  tenantId        String              @map("tenant_id") @db.Uuid
  importBatchId   String              @map("import_batch_id") @db.Uuid
  mappingConfig   Json                @map("mapping_config")
  status          ImportMappingStatus @default(draft)
  configuredBy    String              @map("configured_by") @db.Uuid
  createdAt       DateTime            @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime            @updatedAt @map("updated_at") @db.Timestamptz
  archivedAt      DateTime?           @map("archived_at") @db.Timestamptz

  tenant          Tenant              @relation(fields: [tenantId], references: [id])
  batch           ImportBatch         @relation(fields: [importBatchId], references: [id])

  @@index([tenantId, importBatchId, status])
  @@map("import_mappings")
}

model ImportValidationRun {
  id              String                    @id @default(uuid()) @db.Uuid
  tenantId        String                    @map("tenant_id") @db.Uuid
  importBatchId   String                    @map("import_batch_id") @db.Uuid
  status          ImportValidationRunStatus @default(queued)
  rowCount        Int?                      @map("row_count")
  validRowCount   Int?                      @map("valid_row_count")
  invalidRowCount Int?                      @map("invalid_row_count")
  warningCount    Int?                      @map("warning_count")
  errorCount      Int?                      @map("error_count")
  startedAt       DateTime?                 @map("started_at") @db.Timestamptz
  finishedAt      DateTime?                 @map("finished_at") @db.Timestamptz
  failureReason   String?                   @map("failure_reason")
  requestedBy     String                    @map("requested_by") @db.Uuid
  createdAt       DateTime                  @default(now()) @map("created_at") @db.Timestamptz

  tenant          Tenant                    @relation(fields: [tenantId], references: [id])
  batch           ImportBatch               @relation(fields: [importBatchId], references: [id])
  issues          ImportValidationIssue[]

  @@index([tenantId, importBatchId, status])
  @@map("import_validation_runs")
}

model ImportValidationIssue {
  id                String                   @id @default(uuid()) @db.Uuid
  tenantId          String                   @map("tenant_id") @db.Uuid
  importBatchId     String                   @map("import_batch_id") @db.Uuid
  validationRunId   String                   @map("validation_run_id") @db.Uuid
  rowNumber         Int?                     @map("row_number")
  columnName        String?                  @map("column_name") @db.VarChar(160)
  targetField       String?                  @map("target_field") @db.VarChar(160)
  severity          ImportValidationSeverity
  issueCode         String                   @map("issue_code") @db.VarChar(160)
  message           String
  metadataSanitized Json?                    @map("metadata_sanitized")
  createdAt         DateTime                 @default(now()) @map("created_at") @db.Timestamptz

  tenant            Tenant                   @relation(fields: [tenantId], references: [id])
  batch             ImportBatch              @relation(fields: [importBatchId], references: [id])
  validationRun     ImportValidationRun      @relation(fields: [validationRunId], references: [id])

  @@index([tenantId, importBatchId, severity])
  @@index([tenantId, validationRunId])
  @@map("import_validation_issues")
}

model ImportPreview {
  id                   String              @id @default(uuid()) @db.Uuid
  tenantId             String              @map("tenant_id") @db.Uuid
  importBatchId        String              @map("import_batch_id") @db.Uuid
  previewDataSanitized Json                @map("preview_data_sanitized")
  summarySanitized     Json?               @map("summary_sanitized")
  status               ImportPreviewStatus @default(generated)
  generatedBy          String              @map("generated_by") @db.Uuid
  generatedAt          DateTime            @default(now()) @map("generated_at") @db.Timestamptz
  failureReason        String?             @map("failure_reason")
  createdAt            DateTime            @default(now()) @map("created_at") @db.Timestamptz
  archivedAt           DateTime?           @map("archived_at") @db.Timestamptz

  tenant               Tenant              @relation(fields: [tenantId], references: [id])
  batch                ImportBatch         @relation(fields: [importBatchId], references: [id])

  @@index([tenantId, importBatchId, status])
  @@map("import_previews")
}

model ImportExecution {
  id              String                @id @default(uuid()) @db.Uuid
  tenantId        String                @map("tenant_id") @db.Uuid
  importBatchId   String                @map("import_batch_id") @db.Uuid
  executionMode   ImportExecutionMode   @map("execution_mode")
  idempotencyKey  String                @map("idempotency_key") @db.VarChar(240)
  status          ImportExecutionStatus @default(queued)
  totalRows       Int?                  @map("total_rows")
  processedRows   Int?                  @map("processed_rows")
  createdRows     Int?                  @map("created_rows")
  updatedRows     Int?                  @map("updated_rows")
  skippedRows     Int?                  @map("skipped_rows")
  failedRows      Int?                  @map("failed_rows")
  startedAt       DateTime?             @map("started_at") @db.Timestamptz
  finishedAt      DateTime?             @map("finished_at") @db.Timestamptz
  failureReason   String?               @map("failure_reason")
  requestedBy     String                @map("requested_by") @db.Uuid
  createdAt       DateTime              @default(now()) @map("created_at") @db.Timestamptz

  tenant          Tenant                @relation(fields: [tenantId], references: [id])
  batch           ImportBatch           @relation(fields: [importBatchId], references: [id])
  rowResults      ImportRowResult[]
  reports         ImportReport[]

  @@unique([tenantId, importBatchId, idempotencyKey])
  @@index([tenantId, importBatchId, executionMode, status])
  @@map("import_executions")
}

model ImportRowResult {
  id                String                @id @default(uuid()) @db.Uuid
  tenantId          String                @map("tenant_id") @db.Uuid
  importBatchId     String                @map("import_batch_id") @db.Uuid
  importExecutionId String                @map("import_execution_id") @db.Uuid
  rowNumber         Int                   @map("row_number")
  status            ImportRowResultStatus
  targetModule      String                @map("target_module") @db.VarChar(120)
  targetResourceType String?              @map("target_resource_type") @db.VarChar(120)
  targetResourceId  String?               @map("target_resource_id") @db.Uuid
  conflictKey       String?               @map("conflict_key") @db.VarChar(240)
  inputSanitized    Json?                 @map("input_sanitized")
  outputSanitized   Json?                 @map("output_sanitized")
  errorCode         String?               @map("error_code") @db.VarChar(160)
  failureReason     String?               @map("failure_reason")
  createdAt         DateTime              @default(now()) @map("created_at") @db.Timestamptz

  tenant            Tenant                @relation(fields: [tenantId], references: [id])
  batch             ImportBatch           @relation(fields: [importBatchId], references: [id])
  execution         ImportExecution       @relation(fields: [importExecutionId], references: [id])

  @@index([tenantId, importBatchId, status])
  @@index([tenantId, importExecutionId, rowNumber])
  @@index([tenantId, conflictKey])
  @@map("import_row_results")
}

model ImportReport {
  id                String             @id @default(uuid()) @db.Uuid
  tenantId          String             @map("tenant_id") @db.Uuid
  importBatchId     String             @map("import_batch_id") @db.Uuid
  importExecutionId String?            @map("import_execution_id") @db.Uuid
  reportType        ImportReportType   @map("report_type")
  format            ImportReportFormat
  status            ImportReportStatus @default(requested)
  secureDocumentId  String?            @map("secure_document_id") @db.Uuid
  requestedBy       String             @map("requested_by") @db.Uuid
  createdAt         DateTime           @default(now()) @map("created_at") @db.Timestamptz
  completedAt       DateTime?          @map("completed_at") @db.Timestamptz
  failedAt          DateTime?          @map("failed_at") @db.Timestamptz
  failureReason     String?            @map("failure_reason")
  archivedAt        DateTime?          @map("archived_at") @db.Timestamptz

  tenant            Tenant             @relation(fields: [tenantId], references: [id])
  batch             ImportBatch        @relation(fields: [importBatchId], references: [id])
  execution         ImportExecution?   @relation(fields: [importExecutionId], references: [id])

  @@index([tenantId, importBatchId, reportType, status])
  @@index([tenantId, secureDocumentId])
  @@map("import_reports")
}
```

---

## 17. Relaciones a agregar en `Tenant`

```prisma id="dim-tenant-relations"
model Tenant {
  // existing fields...

  importBatches           ImportBatch[]
  importFiles             ImportFile[]
  importMappings          ImportMapping[]
  importValidationRuns    ImportValidationRun[]
  importValidationIssues  ImportValidationIssue[]
  importPreviews          ImportPreview[]
  importExecutions        ImportExecution[]
  importRowResults        ImportRowResult[]
  importReports           ImportReport[]
}
```

---

## 18. JSONB permitidos

```text id="dim-jsonb-fields"
import_templates.schema_definition
import_templates.mapping_schema
import_mappings.mapping_config
import_validation_issues.metadata_sanitized
import_previews.preview_data_sanitized
import_previews.summary_sanitized
import_row_results.input_sanitized
import_row_results.output_sanitized
```

Claves prohibidas recursivamente:

```text id="dim-jsonb-forbidden"
tenantId
createdBy
updatedBy
approvedBy
executedBy
cancelledBy
archivedBy
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
privateKey
clientSecret
webhookSecret
databaseUrl
externalAiEnabled
externalAiRealDataAllowed
```

---

## 19. Índices y constraints

```text id="dim-indexes"
import_templates:
- unique(template_key)
- index(import_type, status)

import_batches:
- unique(tenant_id, batch_code)
- index(tenant_id, import_type, status)
- index(tenant_id, created_at)

import_files:
- index(tenant_id, import_batch_id)
- index(tenant_id, secure_document_id)

import_mappings:
- index(tenant_id, import_batch_id, status)

import_validation_runs:
- index(tenant_id, import_batch_id, status)

import_validation_issues:
- index(tenant_id, import_batch_id, severity)
- index(tenant_id, validation_run_id)

import_executions:
- unique(tenant_id, import_batch_id, idempotency_key)
- index(tenant_id, import_batch_id, execution_mode, status)

import_row_results:
- index(tenant_id, import_batch_id, status)
- index(tenant_id, import_execution_id, row_number)
- index(tenant_id, conflict_key)

import_reports:
- index(tenant_id, import_batch_id, report_type, status)
- index(tenant_id, secure_document_id)
```

---

## 20. Reglas de estado

```text id="dim-state-rules"
- draft -> fileUploaded.
- fileUploaded -> mappingConfigured.
- mappingConfigured -> validated o validationFailed.
- validated -> previewReady.
- previewReady -> pendingApproval.
- pendingApproval -> approved.
- approved -> executing.
- executing -> completed, partiallyCompleted o failed.
- Cualquier estado previo a executing puede pasar a cancelled si tiene permiso.
- completed, failed, cancelled y archived no se ejecutan nuevamente sin nuevo batch.
```

---

## 21. Shapes conceptuales

### 21.1. `mapping_config`

```json id="dim-shape-mapping"
{
  "columns": [
    {
      "sourceColumn": "Unidad",
      "targetField": "propertyUnit.code",
      "required": true
    },
    {
      "sourceColumn": "Propietario",
      "targetField": "person.fullName",
      "required": true
    }
  ]
}
```

---

### 21.2. `preview_data_sanitized`

```json id="dim-shape-preview"
{
  "summary": {
    "rows": 100,
    "validRows": 95,
    "invalidRows": 5,
    "warnings": 12
  },
  "impact": {
    "toCreate": 80,
    "toUpdate": 15,
    "toSkip": 5
  }
}
```

---

### 21.3. `input_sanitized`

```json id="dim-shape-row-input"
{
  "rowNumber": 10,
  "propertyUnitCode": "A-101",
  "operation": "createOrUpdate",
  "conflictKey": "unit:A-101"
}
```

---

## 22. Seguridad de datos

```text id="dim-data-security"
- No guardar storageKey.
- No guardar signedUrl persistente.
- No guardar archivos binarios.
- No guardar secretos.
- No guardar rawSql.
- No guardar scripts.
- No guardar fórmulas ejecutables.
- Sanitizar nombres, correos, identificaciones, placas y valores financieros.
- En reportes, exponer solo lo permitido por rol.
- En logs/audit, no incluir filas completas con datos personales.
```

---

## 23. Compatibilidad con microservicios

```text id="dim-microservices"
- Los batches tienen IDs UUID.
- Los templates usan templateKey estable.
- Las ejecuciones usan idempotencyKey.
- Los resultados por fila registran targetModule.
- El commit se realiza por puertos de módulos propietarios.
- No hay dependencia de joins directos a tablas externas.
- El módulo puede extraerse como servicio de migración controlado.
```

---

## 24. Migración inicial

Nombre sugerido:

```text id="dim-migration-name"
028_create_data_import_migration
```

Contenido:

```text id="dim-migration-content"
[ ] Crear enums.
[ ] Crear import_templates.
[ ] Crear import_batches.
[ ] Crear import_files.
[ ] Crear import_mappings.
[ ] Crear import_validation_runs.
[ ] Crear import_validation_issues.
[ ] Crear import_previews.
[ ] Crear import_executions.
[ ] Crear import_row_results.
[ ] Crear import_reports.
[ ] Crear índices.
[ ] Crear constraints.
[ ] Agregar relaciones en Tenant.
```

---

## 25. No aceptación del modelo

No se acepta el modelo si:

```text id="dim-dm-no-acceptance"
- alguna tabla tenant-scoped no tiene tenant_id;
- permite datos cross-tenant;
- almacena storageKey;
- almacena signedUrl persistente;
- almacena archivos binarios;
- almacena rawSql;
- almacena scripts;
- almacena formulaCode ejecutable;
- almacena secretos;
- permite status directo desde cliente;
- permite ejecución sin idempotencyKey;
- permite commit sin dry-run cuando es requerido;
- permite commit sin aprobación cuando es requerida;
- permite escritura directa no autorizada en módulos externos;
- permite pagos reales;
- permite asientos contables directos;
- permite conciliación automática;
- permite WordPress público;
- permite endpoints públicos;
- permite IA externa con datos reales.
```

---

## 26. Resultado esperado

```text id="dim-dm-expected-result"
import_templates modelado
import_batches modelado
import_files modelado
import_mappings modelado
import_validation_runs modelado
import_validation_issues modelado
import_previews modelado
import_executions modelado
import_row_results modelado
import_reports modelado
tenant_id obligatorio
secureDocumentId usado
storageKey prohibido
idempotencyKey definido
row results definidos
dry-run soportado
approval soportado
commit controlado
audit soportado
microservices-ready
```

---

## 27. Expediente actualizado

```text id="dim-dm-expediente"
resident-core/
├── docs/
│   ├── specs/
│   │   └── 028-data-import-migration/
│   │       ├── spec.md
│   │       ├── plan.md
│   │       └── data-model.md
```
