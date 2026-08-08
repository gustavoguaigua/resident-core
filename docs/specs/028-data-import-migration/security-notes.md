# Security Notes — 028 Data Import and Migration

## 1. Información del documento

| Campo          | Valor                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------------- |
| Proyecto       | RESIDENT Core                                                                                   |
| Spec ID        | 028                                                                                             |
| Módulo         | Data Import and Migration                                                                       |
| Documento      | Security Notes                                                                                  |
| Ruta           | `docs/specs/028-data-import-migration/security-notes.md`                                        |
| Versión        | 0.1                                                                                             |
| Estado         | Borrador inicial                                                                                |
| Fecha          | 2026-08-03                                                                                      |
| Stack objetivo | NestJS / TypeScript / PostgreSQL / Prisma / Redis / BullMQ / OpenAPI / Keycloak                 |
| Naturaleza     | Tenant-scoped / Batch-oriented / Validation-heavy / Audit-heavy / Controlled-write / Non-public |

---

## 2. Propósito

Definir los controles de seguridad del módulo `028-data-import-migration`.

Este módulo tiene riesgo alto porque procesa archivos externos, datos personales, datos financieros iniciales, datos operativos y registros históricos. Por tanto, toda importación debe ser validada, sanitizada, auditada, tenant-scoped, aprobada cuando corresponda e idempotente.

Regla central de seguridad:

```text id="dim-sec-rule"
Data Import and Migration debe impedir importaciones cross-tenant, archivos inseguros, storageKey expuesto, raw SQL, scripts, fórmulas ejecutables, endpoints públicos, acceso desde WordPress público, commit sin validación, commit sin dry-run requerido, commit sin aprobación requerida, escritura directa no autorizada, pagos reales, asientos contables directos, conciliación bancaria automática, control de hardware e IA externa con datos reales.
```

---

## 3. Clasificación de seguridad

```text id="dim-sec-classification"
Security-sensitive
Privacy-sensitive
Financial-sensitive
Batch-processing
File-ingestion
Controlled-write
Tenant-scoped
Audit-heavy
Validation-heavy
Non-public
No public upload
No WordPress access
No raw SQL
No scripting
No storageKey exposure
No external AI with real data
```

---

## 4. Activos protegidos

```text id="dim-sec-assets"
- Import templates.
- Import batches.
- Import files.
- SecureDocumentId.
- Mapping configuration.
- Validation runs.
- Validation issues.
- Preview data.
- Dry-run results.
- Approval metadata.
- Commit executions.
- Row results.
- Import reports.
- Source files.
- Personal data.
- Financial opening balances.
- Historical payment references.
- Access/vehicle data.
- Inventory data.
- Audit events.
- Queue jobs.
- Idempotency keys.
```

---

## 5. Principios de seguridad

```text id="dim-sec-principles"
1. Keycloak autentica; RESIDENT Core autoriza.
2. Toda importación pertenece a un tenant.
3. Cross-tenant responde 404.
4. Los archivos se gestionan mediante Secure Document Storage.
5. El módulo nunca almacena ni devuelve storageKey.
6. Todo archivo debe validarse por formato, MIME, tamaño y pertenencia al tenant.
7. Toda importación requiere validación.
8. Dry-run es obligatorio cuando la política lo exige.
9. Aprobación es obligatoria cuando la política lo exige.
10. El commit final usa puertos de módulos propietarios.
11. No se permite escritura directa no autorizada.
12. No se acepta SQL arbitrario.
13. No se aceptan scripts.
14. No se aceptan fórmulas ejecutables.
15. No se aceptan archivos ejecutables, macros, dumps SQL ni backups de base.
16. No existen endpoints públicos.
17. WordPress público no accede.
18. No se ejecutan pagos reales.
19. No se validan pagos automáticamente.
20. No se crean asientos contables directos.
21. No se confirma conciliación bancaria.
22. No se controla hardware.
23. No se envían datos reales a IA externa.
24. Toda ejecución es idempotente.
25. Toda operación crítica se audita.
```

---

## 6. Superficies de ataque

### 6.1. API tenant

```text id="dim-sec-api-surface"
GET    /api/v1/tenant/import-templates
GET    /api/v1/tenant/import-batches
POST   /api/v1/tenant/import-batches
POST   /api/v1/tenant/import-batches/{batchId}/upload-file
POST   /api/v1/tenant/import-batches/{batchId}/configure-mapping
POST   /api/v1/tenant/import-batches/{batchId}/validate
POST   /api/v1/tenant/import-batches/{batchId}/preview
POST   /api/v1/tenant/import-batches/{batchId}/dry-run
POST   /api/v1/tenant/import-batches/{batchId}/approve
POST   /api/v1/tenant/import-batches/{batchId}/execute
GET    /api/v1/tenant/import-batches/{batchId}/row-results
POST   /api/v1/tenant/import-batches/{batchId}/reports
```

Controles:

```text id="dim-sec-api-controls"
- AuthGuard.
- TenantGuard.
- PermissionGuard.
- SensitivePermissionGuard.
- ImportBatchTenantGuard.
- DTO whitelist.
- forbidNonWhitelisted.
- State machine validation.
- Audit obligatorio.
- Rate limiting.
```

---

### 6.2. Archivos

Riesgos:

```text id="dim-sec-file-risks"
- archivo con macros;
- archivo ejecutable disfrazado;
- archivo demasiado grande;
- MIME falso;
- SQL dump;
- script embebido;
- CSV injection;
- datos cross-tenant;
- archivo con datos sensibles innecesarios;
- intento de usar storageKey directamente.
```

Controles:

```text id="dim-sec-file-controls"
- Formatos permitidos: xlsx, csv, json.
- Validación de extensión.
- Validación de MIME.
- Validación de tamaño máximo.
- Validación de checksum si aplica.
- SDS obligatorio.
- No base64 en JSON.
- No storageKey.
- No signedUrl persistente.
- Parser seguro.
- Sanitización de contenido.
```

---

### 6.3. Mapping

Riesgos:

```text id="dim-sec-mapping-risks"
- mapping hacia campos no permitidos;
- tenantId inyectado;
- actor fields inyectados;
- raw SQL como transformación;
- JavaScript como transformación;
- fórmula ejecutable;
- escalamiento de permisos por mapping.
```

Controles:

```text id="dim-sec-mapping-controls"
- Mapping declarativo.
- targetField allowlisted por template.
- ForbiddenKeysValidator recursivo.
- No rawSql.
- No script.
- No formulaCode.
- No tenantId.
- No actor fields.
- No permisos ampliados por mapping.
```

---

### 6.4. Workers y colas

Riesgos:

```text id="dim-sec-worker-risks"
- job duplicado;
- retry que duplica datos;
- job con payload sensible;
- worker ejecuta batch cancelled;
- worker ejecuta batch archived;
- worker ejecuta commit sin aprobación;
- worker escribe directamente en tablas externas.
```

Controles:

```text id="dim-sec-worker-controls"
- jobId determinístico.
- idempotencyKey obligatorio.
- payload sanitizado.
- revalidación de tenant activo.
- revalidación de estado del batch.
- revalidación de dry-run.
- revalidación de approval.
- retries finitos.
- commit mediante owner ports.
```

---

## 7. Autenticación y autorización

### 7.1. Reglas

```text id="dim-sec-auth-rules"
- Todas las rutas requieren token Bearer.
- Ninguna ruta acepta usuario anónimo.
- Ninguna ruta usa sesión WordPress.
- tenantId se resuelve server-side.
- actor se resuelve server-side.
- permisos se validan antes de cada transición.
```

---

### 7.2. Permisos base

```text id="dim-sec-permissions"
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
importTemplates.read
```

---

### 7.3. Permisos sensibles

```text id="dim-sec-sensitive-permissions"
tenantImports.executeSensitive
tenantImports.importFinancialOpeningBalances
tenantImports.importResidentsPersonalData
tenantImports.importAccessData
tenantImports.importInventoryData
```

Regla:

```text id="dim-sec-sensitive-rule"
Toda importación que contenga datos financieros, personales, acceso, vehículos o inventario debe requerir permiso sensible adicional para aprobación y ejecución.
```

---

## 8. Tenant isolation

Regla obligatoria:

```text id="dim-sec-tenant-rule"
Toda consulta, archivo, batch, mapping, issue, preview, execution, row result y report debe filtrarse por tenantId.
```

Patrón seguro:

```typescript id="dim-sec-safe-query"
await prisma.importBatch.findFirst({
  where: {
    id: batchId,
    tenantId: currentTenant.id
  }
});
```

Patrón prohibido:

```typescript id="dim-sec-unsafe-query"
await prisma.importBatch.findUnique({
  where: {
    id: batchId
  }
});
```

Respuesta cross-tenant:

```http id="dim-sec-cross-tenant-response"
404 Not Found
```

---

## 9. Campos prohibidos

### 9.1. Prohibidos en DTOs

```text id="dim-sec-forbidden-dto-fields"
tenantId
createdBy
updatedBy
approvedBy
executedBy
cancelledBy
archivedBy
uploadedBy
requestedBy
status
storageKey
signedUrl
rawSql
sql
script
javascript
functionBody
executableCode
formulaCode
eval
Function
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

Respuesta:

```http id="dim-sec-forbidden-dto-response"
422 Unprocessable Entity
```

---

### 9.2. Prohibidos en responses

```text id="dim-sec-forbidden-response-fields"
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
raw file content
raw personal data innecesaria
datos cross-tenant
authorization header
cookie
```

---

### 9.3. Prohibidos en logs y auditoría

```text id="dim-sec-forbidden-log-audit-fields"
storageKey
signedUrl
secret
token
password
apiKey
rawSql
script
file content completo
fila completa con datos personales
identificación completa
placa completa
datos financieros raw innecesarios
authorization header
cookie
```

---

## 10. Seguridad de archivos

### 10.1. Formatos permitidos

```text id="dim-sec-allowed-formats"
xlsx
csv
json
```

---

### 10.2. Formatos prohibidos

```text id="dim-sec-forbidden-formats"
pdf como fuente de datos
imágenes como fuente de datos
exe
bat
sh
js
py
jar
zip arbitrario
SQL dump
backup de base de datos
archivo con macros
archivo cifrado no validable
```

---

### 10.3. Reglas

```text id="dim-sec-file-rules"
- Archivo debe estar en Secure Document Storage.
- API solo persiste secureDocumentId.
- No se acepta storageKey.
- No se acepta signedUrl persistente.
- No se acepta base64 en JSON.
- No se procesa archivo sin batch tenant-scoped.
- No se procesa archivo si batch está archived/cancelled/completed.
```

---

## 11. Seguridad de validación

```text id="dim-sec-validation-rules"
- Validación no modifica datos.
- Validación debe detectar estructura inválida.
- Validación debe detectar formatos inválidos.
- Validación debe detectar duplicados.
- Validación debe detectar conflictos.
- Critical issues bloquean preview, dry-run, approval y commit.
- Issues deben ser sanitizados.
- Issues no deben exponer filas completas con datos sensibles.
```

---

## 12. Seguridad de preview

```text id="dim-sec-preview-rules"
- Preview no modifica datos.
- Preview muestra impacto agregado.
- Preview no contiene storageKey.
- Preview no contiene archivo completo.
- Preview no expone datos personales innecesarios.
- Preview requiere validación previa.
- Preview falla si existen critical issues.
```

---

## 13. Seguridad de dry-run

```text id="dim-sec-dry-run-rules"
- Dry-run no escribe en módulos propietarios.
- Dry-run genera ImportExecution mode=dryRun.
- Dry-run genera idempotencyKey server-side.
- Dry-run registra row results simulados.
- Dry-run es obligatorio si DATA_IMPORT_DRY_RUN_REQUIRED=true.
- Dry-run debe pasar antes de submit-approval cuando sea requerido.
```

---

## 14. Seguridad de aprobación

```text id="dim-sec-approval-rules"
- Approval requiere tenantImports.approve.
- Approval sensible requiere permisos sensibles por importType.
- approvedBy se resuelve server-side.
- approvedAt se registra server-side.
- approvalReason obligatorio para importaciones sensibles.
- No se acepta approvedBy desde cliente.
- No se aprueba batch validationFailed.
- No se aprueba batch sin dry-run requerido.
```

---

## 15. Seguridad de commit

```text id="dim-sec-commit-rules"
- Commit requiere tenantImports.execute.
- Commit sensible requiere permisos sensibles.
- Commit requiere validación sin critical issues.
- Commit requiere dry-run exitoso si aplica.
- Commit requiere approval si aplica.
- Commit genera idempotencyKey server-side.
- Commit procesa por lotes.
- Commit usa owner ports.
- Commit no escribe directamente en tablas externas.
- Commit no ejecuta pagos reales.
- Commit no crea JournalEntry directo.
- Commit no confirma Bank Reconciliation.
- Commit no controla hardware.
```

---

## 16. Idempotencia

Controles:

```text id="dim-sec-idempotency-controls"
- batchCode único por tenant.
- idempotencyKey único por tenant + batch + execution.
- conflictKey por fila.
- jobId determinístico.
- retry finito.
- owner ports idempotentes.
- worker revalida execution antes de procesar.
```

Constraint:

```text id="dim-sec-idempotency-constraint"
unique(tenant_id, import_batch_id, idempotency_key)
```

Riesgos mitigados:

```text id="dim-sec-idempotency-risks"
- doble click en execute;
- retry de worker;
- job duplicado;
- archivo reenviado;
- fila duplicada;
- reinicio durante commit.
```

---

## 17. Puertos de módulos propietarios

Regla:

```text id="dim-sec-owner-port-rule"
Data Import and Migration no debe saltarse reglas de negocio. Toda escritura final debe ejecutarse mediante puertos autorizados de los módulos propietarios.
```

Puertos permitidos:

```text id="dim-sec-owner-ports"
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

Cada puerto debe:

```text id="dim-sec-owner-port-controls"
- validar tenant;
- validar permisos o contexto técnico;
- validar reglas de negocio propias;
- rechazar storageKey;
- rechazar rawSql;
- rechazar payload no sanitizado;
- ser idempotente;
- registrar resultado por fila.
```

---

## 18. Prohibiciones financieras y contables

Prohibido:

```text id="dim-sec-financial-forbidden"
payments.createPayment
payments.validatePaymentAutomatically
payments.reversePayment
paymentProvider.capturePayment
openBanking.initiatePayment
accounting.createJournalEntry
accounting.createJournalEntryLine
bankReconciliation.confirmMatch
bankReconciliation.confirmSession
supplierPayments.createPaymentOrder
```

Permitido:

```text id="dim-sec-financial-allowed"
- importar saldos iniciales permitidos mediante DuesFeesImportPort;
- importar cargos iniciales permitidos mediante DuesFeesImportPort;
- registrar referencias históricas de pagos sin ejecutar ni validar pagos reales;
- generar reportes de importación;
- auditar la carga.
```

---

## 19. No public endpoints

No implementar:

```text id="dim-sec-public-forbidden"
/api/v1/public/imports
/api/v1/public/import-batches
/api/v1/public/import-templates
/api/v1/public/import-upload
/api/v1/public/tenants/{slug}/imports
/api/v1/public/tenants/{slug}/import-batches
```

Respuesta esperada:

```http id="dim-sec-public-response"
404 Not Found
```

---

## 20. No WordPress access

WordPress público no debe:

```text id="dim-sec-wordpress-forbidden"
- crear import batches;
- subir archivos;
- configurar mappings;
- validar importaciones;
- aprobar importaciones;
- ejecutar commit;
- consultar row results;
- descargar reportes sensibles;
- usar sesión WordPress como auth Core;
- almacenar tokens Core;
- actuar como puente público de importación.
```

Controles:

```text id="dim-sec-wordpress-controls"
- No public endpoints.
- CORS restrictivo.
- Auth Core con Bearer token.
- No cookies WordPress.
- No shortcodes WordPress para importaciones.
```

---

## 21. No external AI with real data

Prohibido enviar a IA externa:

```text id="dim-sec-ai-forbidden"
- archivos importados reales;
- filas reales;
- datos personales;
- identificaciones;
- correos;
- teléfonos;
- placas;
- saldos;
- cargos;
- pagos históricos;
- inventario real;
- access data real;
- validation issues con datos crudos;
- row results con datos sensibles;
- reportes de importación reales.
```

Permitido:

```text id="dim-sec-ai-allowed"
- documentación técnica;
- ejemplos ficticios;
- plantillas vacías;
- fixtures sintéticos;
- análisis con datos completamente anonimizados y aprobados.
```

---

## 22. Seguridad de reportes

```text id="dim-sec-report-rules"
- Reportes se generan vía Secure Document Storage.
- Response devuelve secureDocumentId.
- Nunca devuelve storageKey.
- Nunca devuelve signedUrl persistente.
- Reporte sensible requiere permiso reforzado.
- Reporte no debe contener secretos.
- Reporte no debe contener archivo fuente completo salvo autorización explícita y segura.
- Reporte debe minimizar datos personales.
```

---

## 23. Rate limiting

Aplicar rate limit reforzado en:

```text id="dim-sec-rate-limit-routes"
POST /api/v1/tenant/import-batches
POST /api/v1/tenant/import-batches/{batchId}/upload-file
POST /api/v1/tenant/import-batches/{batchId}/configure-mapping
POST /api/v1/tenant/import-batches/{batchId}/validate
POST /api/v1/tenant/import-batches/{batchId}/preview
POST /api/v1/tenant/import-batches/{batchId}/dry-run
POST /api/v1/tenant/import-batches/{batchId}/approve
POST /api/v1/tenant/import-batches/{batchId}/execute
POST /api/v1/tenant/import-batches/{batchId}/reports
```

Objetivos:

```text id="dim-sec-rate-limit-objectives"
- evitar abuso de upload;
- evitar ejecución masiva de validaciones;
- proteger workers;
- proteger SDS;
- evitar spam de reportes;
- reducir riesgo de DoS.
```

---

## 24. Auditoría

Eventos obligatorios:

```text id="dim-sec-audit-events"
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

```text id="dim-sec-audit-allowed"
batchId
batchCode
importType
templateKey
sourceFormat
rowCount
validRowCount
invalidRowCount
warningCount
errorCount
executionMode
status
reason
traceId
correlationId
```

Metadata prohibida:

```text id="dim-sec-audit-forbidden"
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
authorization header
cookie
```

---

## 25. Observabilidad segura

Logs permitidos:

```text id="dim-sec-logs"
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

```text id="dim-sec-metrics"
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

Labels prohibidos:

```text id="dim-sec-metric-labels-forbidden"
tenantId
userId
personId
propertyUnitId
identificationNumber
vehiclePlate
batchId
rowNumber
traceId
secretKey
```

---

## 26. CORS y headers

```text id="dim-sec-cors-rules"
- No CORS wildcard.
- No permitir WordPress público para rutas de importación.
- Permitir únicamente frontends administrativos autorizados.
- No usar cookies WordPress como autenticación.
```

Headers recomendados:

```http id="dim-sec-headers"
Cache-Control: no-store
Pragma: no-cache
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

---

## 27. Feature flags de seguridad

```text id="dim-sec-feature-flags"
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

```text id="dim-sec-feature-flag-rule"
El boot debe fallar si se habilitan endpoints públicos, acceso WordPress, raw SQL, scripting, IA externa con datos reales, escritura directa de base, ejecución de pagos, contabilidad directa o conciliación automática.
```

---

## 28. OpenAPI security

Extensiones requeridas:

```yaml id="dim-sec-openapi-extensions"
x-auth-required: true
x-tenant-scope: true
x-data-import-migration: true
x-batch-processing: true
x-controlled-write: true
x-public-exposure: false
x-wordpress-access: false
x-storage-key-exposed: false
x-raw-sql-allowed: false
x-scripting-allowed: false
x-executable-formula: false
x-dry-run-supported: true
x-approval-supported: true
x-secure-document-storage: true
x-payment-execution: false
x-accounting-execution: false
x-bank-reconciliation-confirmation: false
x-hardware-control: false
x-external-ai-real-data: false
```

No documentar:

```text id="dim-sec-openapi-forbidden"
- rutas públicas;
- tenantId;
- actor fields;
- status directo;
- storageKey;
- signedUrl persistente;
- rawSql;
- script;
- formulaCode;
- secrets;
- externalAiEnabled.
```

---

## 29. CI security gates

Pipeline debe fallar si:

```text id="dim-sec-ci-gates"
[ ] Cualquier DTO acepta tenantId.
[ ] Cualquier DTO acepta actor fields.
[ ] Cualquier DTO acepta status directo.
[ ] Cualquier DTO acepta storageKey.
[ ] Cualquier DTO acepta rawSql.
[ ] Cualquier DTO acepta script.
[ ] Cualquier DTO acepta formulaCode.
[ ] Cualquier response devuelve storageKey.
[ ] Existe endpoint público.
[ ] WordPress público accede.
[ ] tenantA accede a datos tenantB.
[ ] Se procesa archivo fuera de SDS.
[ ] Se acepta archivo base64 en JSON.
[ ] Se ejecuta commit sin validación.
[ ] Se ejecuta commit sin dry-run requerido.
[ ] Se ejecuta commit sin aprobación requerida.
[ ] Retry duplica datos.
[ ] Se escribe directamente en tabla externa sin puerto autorizado.
[ ] Se ejecuta pago real.
[ ] Se crea JournalEntry directo.
[ ] Se confirma Bank Reconciliation.
[ ] Se controla hardware.
[ ] Se envían datos reales a IA externa.
[ ] Audit contiene archivo completo.
[ ] Logs contienen datos personales completos.
```

---

## 30. Checklist de revisión de seguridad

```text id="dim-sec-review-checklist"
[ ] Todas las rutas usan AuthGuard.
[ ] Todas las rutas tenant usan TenantGuard.
[ ] Todas las rutas usan PermissionGuard.
[ ] Rutas sensibles usan SensitivePermissionGuard.
[ ] Cross-tenant responde 404.
[ ] DTOs usan whitelist.
[ ] DTOs usan forbidNonWhitelisted.
[ ] No se acepta tenantId.
[ ] No se aceptan actor fields.
[ ] No se acepta status directo.
[ ] No se acepta storageKey.
[ ] No se acepta rawSql.
[ ] No se aceptan scripts.
[ ] No se acepta formulaCode.
[ ] No existen endpoints públicos.
[ ] WordPress público no accede.
[ ] Archivos usan SDS.
[ ] No se almacena binario en tablas propias.
[ ] Mapping es declarativo.
[ ] Validación no modifica datos.
[ ] Preview no modifica datos.
[ ] Dry-run no modifica datos.
[ ] Commit requiere validación.
[ ] Commit requiere dry-run si aplica.
[ ] Commit requiere aprobación si aplica.
[ ] Commit usa owner ports.
[ ] Commit es idempotente.
[ ] Reports usan SDS.
[ ] Audit está sanitizado.
[ ] Logs están sanitizados.
[ ] OpenAPI no documenta campos prohibidos.
[ ] CI security gates pasan.
```

---

## 31. Riesgos residuales

| Riesgo residual                                              |      Nivel | Mitigación                                            |
| ------------------------------------------------------------ | ---------: | ----------------------------------------------------- |
| Archivo contiene datos erróneos pero válidos sintácticamente | Medio/Alto | dry-run, preview, approval, reportes                  |
| Usuario autorizado aprueba datos incorrectos                 | Medio/Alto | permisos sensibles, reason, audit, revisión previa    |
| Retry duplica registros por fallo del módulo propietario     |       Alto | idempotencyKey, conflictKey, owner ports idempotentes |
| Reporte contiene más datos de los necesarios                 |       Alto | sanitizer, permisos sensibles, SDS                    |
| Parser no detecta contenido malicioso nuevo                  | Medio/Alto | allowlist, límites, hardening, tests                  |
| Datos históricos inconsistentes                              |      Medio | validation issues, import policy, row results         |
| Archivo grande afecta performance                            |      Medio | límites, colas, batch size, rate limit                |
| Future connector externo mal configurado                     |       Alto | fuera de MVP, ADR obligatorio                         |

---

## 32. Recomendaciones futuras

Requieren ADR y security review:

```text id="dim-sec-future"
- importación desde sistemas legacy conectados;
- conectores n8n productivos;
- webhooks externos firmados;
- importación incremental recurrente;
- reconciliación automática de datos importados;
- importación desde APIs bancarias;
- OCR;
- IA para limpieza de datos;
- deduplicación inteligente;
- rollback avanzado;
- staging visual avanzado;
- aprobación multi-firma;
- firma digital de lotes importados.
```

Regla:

```text id="dim-sec-future-rule"
Ninguna extensión futura que implique conectores externos, IA, OCR, pagos, bancos, contabilidad, scripts, SQL, rollback avanzado o datos sensibles debe implementarse sin ADR, threat model, security-notes, test-plan y aprobación explícita.
```

---

## 33. Criterios de aceptación de seguridad

```text id="dim-sec-acceptance"
[ ] Todas las rutas requieren autenticación.
[ ] Todas las rutas son tenant-scoped.
[ ] Cross-tenant responde 404.
[ ] DTOs rechazan tenantId.
[ ] DTOs rechazan actor fields.
[ ] DTOs rechazan status directo.
[ ] DTOs rechazan storageKey.
[ ] DTOs rechazan rawSql.
[ ] DTOs rechazan scripts.
[ ] DTOs rechazan formulaCode.
[ ] Archivos se procesan desde SDS.
[ ] No se almacena binario en tablas propias.
[ ] Validation no modifica datos.
[ ] Preview no modifica datos.
[ ] Dry-run no modifica datos.
[ ] Commit requiere validación.
[ ] Commit requiere dry-run si aplica.
[ ] Commit requiere aprobación si aplica.
[ ] Commit usa owner ports.
[ ] Commit es idempotente.
[ ] Reportes usan SDS.
[ ] No existen endpoints públicos.
[ ] WordPress público no accede.
[ ] No se ejecutan pagos reales.
[ ] No se crean asientos contables directos.
[ ] No se confirma conciliación bancaria.
[ ] No se controla hardware.
[ ] No se envían datos reales a IA externa.
[ ] Audit no contiene datos prohibidos.
[ ] Logs no contienen datos prohibidos.
[ ] OpenAPI no documenta campos prohibidos.
[ ] CI security gates pasan.
```

---

## 34. No aceptación de seguridad

No se acepta el módulo si:

```text id="dim-sec-no-acceptance"
- permite importaciones cross-tenant;
- acepta tenantId desde cliente;
- acepta actor fields desde cliente;
- acepta status directo;
- acepta storageKey;
- devuelve storageKey;
- acepta signedUrl persistente;
- procesa archivo fuera de SDS;
- almacena binario en tablas propias;
- acepta archivo base64 en JSON;
- acepta rawSql;
- acepta scripts;
- acepta formulaCode ejecutable;
- acepta secretos;
- crea endpoints públicos;
- permite acceso WordPress público;
- permite commit sin validación;
- permite commit sin dry-run requerido;
- permite commit sin aprobación requerida;
- duplica datos por retry;
- escribe directamente en tablas externas sin puerto autorizado;
- ejecuta pagos reales;
- valida pagos automáticamente;
- reversa pagos;
- crea JournalEntry directo;
- confirma Bank Reconciliation;
- abre portones;
- controla hardware;
- envía datos reales a IA externa;
- omite auditoría crítica;
- logs contienen datos personales completos;
- reportes exponen datos sensibles sin permiso.
```

---

## 35. Resultado esperado

```text id="dim-sec-expected-result"
security notes definidas
tenant isolation protegido
file ingestion protegido
SDS obligatorio
storageKey prohibido
mapping declarativo protegido
validation segura
preview seguro
dry-run seguro
approval seguro
commit controlado
owner ports obligatorios
idempotencia protegida
reports seguros
audit seguro
observability segura
no public endpoints
no WordPress access
no raw SQL
no scripts
no direct DB write
no payment execution
no accounting direct execution
no bank reconciliation confirmation
no hardware control
no external AI with real data
CI security gates definidos
security review checklist definido
```

---

## 36. Expediente actualizado

```text id="dim-sec-expediente"
resident-core/
├── docs/
│   ├── specs/
│   │   └── 028-data-import-migration/
│   │       ├── spec.md
│   │       ├── plan.md
│   │       ├── data-model.md
│   │       ├── api-contract.md
│   │       ├── test-plan.md
│   │       ├── tasks.md
│   │       └── security-notes.md
```

---

## 37. Cierre del paquete 028

Con este documento queda completo el paquete SDD:

```text id="dim-package-complete"
docs/specs/028-data-import-migration/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```
