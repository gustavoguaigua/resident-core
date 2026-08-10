# API Contract — 028 Data Import and Migration

## 1. Información del documento

| Campo        | Valor                                                                                           |
| ------------ | ----------------------------------------------------------------------------------------------- |
| Proyecto     | RESIDENT Core                                                                                   |
| Spec ID      | 028                                                                                             |
| Módulo       | Data Import and Migration                                                                       |
| Documento    | API Contract                                                                                    |
| Ruta         | `docs/specs/028-data-import-migration/api-contract.md`                                          |
| Versión      | 0.1                                                                                             |
| Estado       | needs-review                                                                                    |
| Fecha        | 2026-08-02                                                                                      |
| API style    | REST                                                                                            |
| Base path    | `/api/v1`                                                                                       |
| Auth         | Bearer token / Keycloak OIDC                                                                    |
| Autorización | RESIDENT Core tenant-aware                                                                      |
| Naturaleza   | Tenant-scoped / Batch-oriented / Validation-heavy / Audit-heavy / Controlled-write / Non-public |

---

## 2. Propósito

Definir el contrato API del módulo `028-data-import-migration`.

Este módulo permite crear lotes de importación, asociar archivos seguros, configurar mapeos, validar datos, generar previews, ejecutar dry-run, aprobar, ejecutar commit controlado, consultar resultados por fila y generar reportes de importación.

Regla central de API:

```text id="dim-api-rule"
Toda API de Data Import and Migration debe ser autenticada, tenant-scoped, permission-based, validation-heavy, audit-heavy, idempotency-aware y no pública; debe aceptar únicamente archivos, formatos, plantillas y mappings permitidos, sin tenantId desde cliente, sin actor fields, sin status directo, sin storageKey, sin raw SQL, sin scripts, sin fórmulas ejecutables, sin endpoints públicos, sin acceso desde WordPress público, sin escritura directa no autorizada en módulos externos, sin pagos ejecutados, sin asientos contables directos, sin conciliación bancaria automática y sin IA externa con datos reales.
```

---

## 3. Convenciones generales

### 3.1. Headers

```http id="dim-api-headers"
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
```

Para upload lógico de archivo, la API debe recibir referencia o archivo controlado según implementación del gateway, pero el resultado persistido siempre debe ser `secureDocumentId`.

---

### 3.2. Response envelope

```json id="dim-api-response-envelope"
{
  "data": {},
  "meta": {
    "traceId": "trace-id"
  }
}
```

Para listas:

```json id="dim-api-list-envelope"
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 100,
    "traceId": "trace-id"
  }
}
```

---

### 3.3. Error envelope

```json id="dim-api-error-envelope"
{
  "error": {
    "code": "IMPORT_BATCH_NOT_FOUND",
    "message": "Import batch not found.",
    "details": {},
    "traceId": "trace-id"
  }
}
```

---

### 3.4. Formatos

```text id="dim-api-format-rules"
- Fechas: ISO 8601 UTC.
- Moneda: string decimal.
- JSON: camelCase.
- DB: snake_case.
- IDs: UUID.
- pageSize máximo: 100.
- Timezone default: America/Guayaquil.
```

---

## 4. Superficies API

### 4.1. Tenant API

```text id="dim-api-tenant-surface"
/api/v1/tenant/import-templates
/api/v1/tenant/import-batches
/api/v1/tenant/import-batches/{batchId}/...
```

---

### 4.2. Public API prohibida

No implementar:

```text id="dim-api-public-forbidden"
/api/v1/public/imports
/api/v1/public/import-batches
/api/v1/public/import-templates
/api/v1/public/import-upload
/api/v1/public/tenants/{slug}/imports
/api/v1/public/tenants/{slug}/import-batches
```

Respuesta esperada:

```http id="dim-api-public-response"
404 Not Found
```

---

## 5. Autenticación y autorización

### 5.1. Reglas

```text id="dim-api-auth-rules"
- Todas las rutas requieren AuthGuard.
- Todas las rutas tenant requieren TenantGuard.
- Todas las rutas requieren PermissionGuard.
- Operaciones sensibles requieren SensitivePermissionGuard.
- Keycloak autentica.
- RESIDENT Core autoriza por tenant, rol, permiso, sensibilidad y recurso.
```

---

### 5.2. Permisos

```text id="dim-api-permissions"
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
```

---

### 5.3. Permisos sensibles por tipo

```text id="dim-api-sensitive-permissions"
duesOpeningBalances -> tenantImports.importFinancialOpeningBalances
chargesInitialLoad -> tenantImports.importFinancialOpeningBalances
paymentsHistoricalReference -> tenantImports.importFinancialOpeningBalances
residentsPropertiesInitialLoad -> tenantImports.importResidentsPersonalData
usersInitialLoad -> tenantImports.importResidentsPersonalData
accessResidentsVehiclesInitialLoad -> tenantImports.importAccessData
inventoryInitialLoad -> tenantImports.importInventoryData
```

---

## 6. Tenant resolution

Reglas:

```text id="dim-api-tenant-resolution"
- tenantId no se acepta en body.
- tenantId no se acepta en query.
- tenantId no se acepta en path ordinario.
- tenantId se resuelve desde contexto autenticado.
- Todo recurso tenant-scoped se consulta por id + currentTenant.id.
- Cross-tenant retorna 404.
```

Respuesta cross-tenant:

```http id="dim-api-cross-tenant"
404 Not Found
```

---

## 7. Campos prohibidos en DTOs

Todos los DTOs externos deben rechazar:

```text id="dim-api-forbidden-fields"
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

Respuesta esperada:

```http id="dim-api-forbidden-response"
422 Unprocessable Entity
```

---

## 8. Import Templates API

### 8.1. Listar plantillas

```http id="dim-api-list-templates"
GET /api/v1/tenant/import-templates
```

Permiso:

```text id="dim-api-list-templates-permission"
importTemplates.read
```

Query params:

```text id="dim-api-list-templates-query"
importType
sourceFormat
status
page
pageSize
sort
```

Response:

```json id="dim-api-list-templates-response"
{
  "data": [
    {
      "id": "uuid",
      "templateKey": "residents-properties-initial-load-xlsx",
      "importType": "residentsPropertiesInitialLoad",
      "name": "Residents and Properties Initial Load",
      "sourceFormat": "xlsx",
      "isTenantConfigurable": false,
      "status": "active"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 1,
    "traceId": "trace-id"
  }
}
```

---

### 8.2. Obtener plantilla

```http id="dim-api-get-template"
GET /api/v1/tenant/import-templates/{templateKey}
```

Permiso:

```text id="dim-api-get-template-permission"
importTemplates.read
```

Response:

```json id="dim-api-get-template-response"
{
  "data": {
    "templateKey": "residents-properties-initial-load-xlsx",
    "importType": "residentsPropertiesInitialLoad",
    "sourceFormat": "xlsx",
    "schemaDefinition": {
      "columns": [
        {
          "name": "Unidad",
          "required": true,
          "targetField": "propertyUnit.code"
        }
      ]
    },
    "mappingSchema": {
      "allowCustomMapping": true
    }
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="dim-api-template-rules"
- No devolver rawSql.
- No devolver scripts.
- No devolver storageKey.
- No devolver datos reales de tenants.
```

---

## 9. Import Batches API

### 9.1. Listar lotes

```http id="dim-api-list-batches"
GET /api/v1/tenant/import-batches
```

Permiso:

```text id="dim-api-list-batches-permission"
tenantImports.read
```

Query params:

```text id="dim-api-list-batches-query"
importType
status
templateKey
createdFrom
createdTo
page
pageSize
sort
```

Response:

```json id="dim-api-list-batches-response"
{
  "data": [
    {
      "id": "uuid",
      "batchCode": "IMP-20260802-0001",
      "importType": "residentsPropertiesInitialLoad",
      "title": "Carga inicial San José La Salle 2",
      "status": "previewReady",
      "rowCount": 100,
      "validRowCount": 95,
      "invalidRowCount": 5,
      "warningCount": 12,
      "createdAt": "2026-08-02T23:27:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 1,
    "traceId": "trace-id"
  }
}
```

---

### 9.2. Crear lote

```http id="dim-api-create-batch"
POST /api/v1/tenant/import-batches
```

Permiso:

```text id="dim-api-create-batch-permission"
tenantImports.create
```

Request:

```json id="dim-api-create-batch-request"
{
  "templateKey": "residents-properties-initial-load-xlsx",
  "importType": "residentsPropertiesInitialLoad",
  "sourceFormat": "xlsx",
  "title": "Carga inicial San José La Salle 2",
  "description": "Carga inicial de unidades, propietarios y residentes"
}
```

Response:

```http id="dim-api-create-batch-status"
201 Created
```

```json id="dim-api-create-batch-response"
{
  "data": {
    "id": "uuid",
    "batchCode": "IMP-20260802-0001",
    "importType": "residentsPropertiesInitialLoad",
    "sourceFormat": "xlsx",
    "status": "draft",
    "dryRunRequired": true,
    "approvalRequired": true
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="dim-api-create-batch-rules"
- batchCode se genera server-side.
- status inicia en draft.
- dryRunRequired se resuelve desde política.
- approvalRequired se resuelve desde política.
- createdBy se resuelve server-side.
- Rechazar tenantId.
- Rechazar status.
- Rechazar actor fields.
```

---

### 9.3. Obtener lote

```http id="dim-api-get-batch"
GET /api/v1/tenant/import-batches/{batchId}
```

Permiso:

```text id="dim-api-get-batch-permission"
tenantImports.read
```

Response:

```json id="dim-api-get-batch-response"
{
  "data": {
    "id": "uuid",
    "batchCode": "IMP-20260802-0001",
    "importType": "residentsPropertiesInitialLoad",
    "templateKey": "residents-properties-initial-load-xlsx",
    "sourceFormat": "xlsx",
    "status": "previewReady",
    "title": "Carga inicial San José La Salle 2",
    "rowCount": 100,
    "validRowCount": 95,
    "invalidRowCount": 5,
    "warningCount": 12,
    "errorCount": 5,
    "dryRunRequired": true,
    "approvalRequired": true
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

### 9.4. Actualizar metadata del lote

```http id="dim-api-update-batch"
PATCH /api/v1/tenant/import-batches/{batchId}
```

Permiso:

```text id="dim-api-update-batch-permission"
tenantImports.create
```

Request:

```json id="dim-api-update-batch-request"
{
  "title": "Carga inicial actualizada",
  "description": "Carga revisada antes de validación"
}
```

Reglas:

```text id="dim-api-update-batch-rules"
- Solo permite metadata.
- No permite cambiar status directo.
- No permite cambiar importType después de fileUploaded.
- No permite cambiar template después de fileUploaded.
- No permite actualizar completed, failed, cancelled, archived.
```

---

## 10. Upload File API

### 10.1. Asociar archivo a lote

```http id="dim-api-upload-file"
POST /api/v1/tenant/import-batches/{batchId}/upload-file
```

Permiso:

```text id="dim-api-upload-file-permission"
tenantImports.uploadFile
```

Request conceptual:

```json id="dim-api-upload-file-request"
{
  "secureDocumentId": "uuid",
  "originalFileName": "residentes.xlsx",
  "sourceFormat": "xlsx",
  "mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "fileSizeBytes": 245760,
  "checksumSha256": "sha256"
}
```

Response:

```json id="dim-api-upload-file-response"
{
  "data": {
    "id": "uuid",
    "importBatchId": "uuid",
    "secureDocumentId": "uuid",
    "sourceFormat": "xlsx",
    "status": "uploaded"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="dim-api-upload-rules"
- secureDocumentId debe pertenecer al tenant.
- No aceptar storageKey.
- No aceptar signedUrl.
- No aceptar archivo base64.
- Formato permitido: xlsx, csv, json.
- MIME debe coincidir con formato.
- El lote pasa a fileUploaded.
```

---

## 11. Configure Mapping API

```http id="dim-api-configure-mapping"
POST /api/v1/tenant/import-batches/{batchId}/configure-mapping
```

Permiso:

```text id="dim-api-configure-mapping-permission"
tenantImports.configureMapping
```

Request:

```json id="dim-api-configure-mapping-request"
{
  "mappingConfig": {
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
}
```

Response:

```json id="dim-api-configure-mapping-response"
{
  "data": {
    "id": "uuid",
    "importBatchId": "uuid",
    "status": "configured"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="dim-api-mapping-rules"
- mappingConfig debe ser declarativo.
- targetField debe existir en template.
- No rawSql.
- No script.
- No formulaCode.
- No tenantId.
- Lote pasa a mappingConfigured.
```

---

## 12. Validation API

### 12.1. Ejecutar validación

```http id="dim-api-validate"
POST /api/v1/tenant/import-batches/{batchId}/validate
```

Permiso:

```text id="dim-api-validate-permission"
tenantImports.validate
```

Request:

```json id="dim-api-validate-request"
{
  "validationMode": "full"
}
```

Response:

```http id="dim-api-validate-status"
202 Accepted
```

```json id="dim-api-validate-response"
{
  "data": {
    "validationRunId": "uuid",
    "importBatchId": "uuid",
    "status": "queued"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="dim-api-validate-rules"
- Requiere archivo cargado.
- Requiere mapping si template exige mapping.
- No modifica datos transaccionales.
- Encola job de validación.
- Sanitiza payload.
```

---

### 12.2. Listar issues

```http id="dim-api-list-issues"
GET /api/v1/tenant/import-batches/{batchId}/issues
```

Permiso:

```text id="dim-api-list-issues-permission"
tenantImports.read
```

Query params:

```text id="dim-api-list-issues-query"
severity
rowNumber
columnName
issueCode
page
pageSize
```

Response:

```json id="dim-api-list-issues-response"
{
  "data": [
    {
      "id": "uuid",
      "rowNumber": 12,
      "columnName": "Correo",
      "targetField": "person.email",
      "severity": "error",
      "issueCode": "INVALID_EMAIL",
      "message": "Invalid email format."
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 1,
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="dim-api-issues-rules"
- No devolver fila completa con datos personales.
- No devolver raw file content.
- No devolver secrets.
```

---

## 13. Preview API

```http id="dim-api-preview"
POST /api/v1/tenant/import-batches/{batchId}/preview
```

Permiso:

```text id="dim-api-preview-permission"
tenantImports.preview
```

Response:

```http id="dim-api-preview-status"
202 Accepted
```

```json id="dim-api-preview-response"
{
  "data": {
    "importBatchId": "uuid",
    "status": "queued"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Preview result en GET batch o endpoint dedicado futuro:

```json id="dim-api-preview-result"
{
  "data": {
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
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="dim-api-preview-rules"
- Requiere validación previa.
- No modifica datos transaccionales.
- No muestra datos sensibles innecesarios.
- Lote pasa a previewReady si exitoso.
```

---

## 14. Dry-run API

```http id="dim-api-dry-run"
POST /api/v1/tenant/import-batches/{batchId}/dry-run
```

Permiso:

```text id="dim-api-dry-run-permission"
tenantImports.runDryRun
```

Request:

```json id="dim-api-dry-run-request"
{
  "reason": "Validación previa al commit de carga inicial"
}
```

Response:

```http id="dim-api-dry-run-status"
202 Accepted
```

```json id="dim-api-dry-run-response"
{
  "data": {
    "executionId": "uuid",
    "executionMode": "dryRun",
    "status": "queued"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="dim-api-dry-run-rules"
- dryRun no escribe datos transaccionales.
- Genera idempotencyKey server-side.
- Registra ImportExecution.
- Registra ImportRowResult simulados.
- Audita importBatch.dryRunStarted.
```

---

## 15. Approval API

### 15.1. Enviar a aprobación

```http id="dim-api-submit-approval"
POST /api/v1/tenant/import-batches/{batchId}/submit-approval
```

Permiso:

```text id="dim-api-submit-approval-permission"
tenantImports.preview
```

Request:

```json id="dim-api-submit-approval-request"
{
  "reason": "Lote validado y listo para revisión"
}
```

Reglas:

```text id="dim-api-submit-approval-rules"
- Requiere previewReady.
- Si dryRunRequired=true, requiere dry-run exitoso.
- Lote pasa a pendingApproval.
```

---

### 15.2. Aprobar lote

```http id="dim-api-approve"
POST /api/v1/tenant/import-batches/{batchId}/approve
```

Permiso:

```text id="dim-api-approve-permission"
tenantImports.approve
```

Permisos sensibles adicionales:

```text id="dim-api-approve-sensitive"
tenantImports.executeSensitive
tenantImports.importFinancialOpeningBalances
tenantImports.importResidentsPersonalData
tenantImports.importAccessData
tenantImports.importInventoryData
```

Request:

```json id="dim-api-approve-request"
{
  "approvalReason": "Datos revisados y aprobados para carga inicial"
}
```

Response:

```json id="dim-api-approve-response"
{
  "data": {
    "id": "uuid",
    "status": "approved",
    "approvedAt": "2026-08-02T23:27:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="dim-api-approve-rules"
- approvedBy se resuelve server-side.
- Requiere pendingApproval.
- Requiere permisos sensibles según importType.
- No acepta approvedBy desde cliente.
- Audita importBatch.approved.
```

---

## 16. Execute Commit API

```http id="dim-api-execute"
POST /api/v1/tenant/import-batches/{batchId}/execute
```

Permiso:

```text id="dim-api-execute-permission"
tenantImports.execute
```

Request:

```json id="dim-api-execute-request"
{
  "executionReason": "Ejecutar carga inicial aprobada"
}
```

Response:

```http id="dim-api-execute-status"
202 Accepted
```

```json id="dim-api-execute-response"
{
  "data": {
    "executionId": "uuid",
    "executionMode": "commit",
    "status": "queued"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="dim-api-execute-rules"
- Requiere approved si approvalRequired=true.
- Requiere dry-run exitoso si dryRunRequired=true.
- Requiere validación sin critical issues.
- Genera idempotencyKey server-side.
- Encola ejecución.
- Commit usa puertos de módulos propietarios.
- No escritura directa no autorizada.
- No ejecuta pagos reales.
- No crea asientos contables directos.
- No confirma conciliación bancaria.
```

---

## 17. Cancel and Archive API

### 17.1. Cancelar lote

```http id="dim-api-cancel"
POST /api/v1/tenant/import-batches/{batchId}/cancel
```

Permiso:

```text id="dim-api-cancel-permission"
tenantImports.cancel
```

Request:

```json id="dim-api-cancel-request"
{
  "cancelReason": "Archivo incorrecto"
}
```

Reglas:

```text id="dim-api-cancel-rules"
- Solo se puede cancelar antes o durante ejecución.
- Si execution está running, cancelación es best effort.
- No revierte filas ya confirmadas.
- cancelledBy se resuelve server-side.
- Audita importBatch.cancelled.
```

---

### 17.2. Archivar lote

```http id="dim-api-archive"
POST /api/v1/tenant/import-batches/{batchId}/archive
```

Permiso:

```text id="dim-api-archive-permission"
tenantImports.archive
```

Request:

```json id="dim-api-archive-request"
{
  "archiveReason": "Lote histórico cerrado"
}
```

Reglas:

```text id="dim-api-archive-rules"
- No physical delete.
- archivedBy se resuelve server-side.
- No archiva documentos SDS automáticamente.
- Audita importBatch.archived.
```

---

## 18. Row Results API

```http id="dim-api-row-results"
GET /api/v1/tenant/import-batches/{batchId}/row-results
```

Permiso:

```text id="dim-api-row-results-permission"
tenantImports.read
```

Query params:

```text id="dim-api-row-results-query"
executionId
status
rowNumber
targetModule
page
pageSize
```

Response:

```json id="dim-api-row-results-response"
{
  "data": [
    {
      "id": "uuid",
      "rowNumber": 10,
      "status": "created",
      "targetModule": "003-residents-properties",
      "targetResourceType": "PropertyUnit",
      "targetResourceId": "uuid",
      "conflictKey": "unit:A-101",
      "errorCode": null
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 1,
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="dim-api-row-results-rules"
- No devolver input completo con datos personales sin permiso.
- No devolver output sensible.
- No devolver storageKey.
- targetResourceId solo si el usuario tiene permiso compatible.
```

---

## 19. Reports API

### 19.1. Listar reportes

```http id="dim-api-list-reports"
GET /api/v1/tenant/import-batches/{batchId}/reports
```

Permiso:

```text id="dim-api-list-reports-permission"
tenantImports.read
```

Response:

```json id="dim-api-list-reports-response"
{
  "data": [
    {
      "id": "uuid",
      "reportType": "execution",
      "format": "xlsx",
      "status": "completed",
      "secureDocumentId": "uuid",
      "createdAt": "2026-08-02T23:27:00.000Z"
    }
  ],
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

### 19.2. Generar reporte

```http id="dim-api-create-report"
POST /api/v1/tenant/import-batches/{batchId}/reports
```

Permiso:

```text id="dim-api-create-report-permission"
tenantImports.exportReport
```

Request:

```json id="dim-api-create-report-request"
{
  "reportType": "execution",
  "format": "xlsx",
  "reason": "Descarga de reporte final"
}
```

Response:

```http id="dim-api-create-report-status"
202 Accepted
```

```json id="dim-api-create-report-response"
{
  "data": {
    "reportId": "uuid",
    "status": "requested"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="dim-api-report-rules"
- Reporte usa Secure Document Storage.
- Response devuelve secureDocumentId cuando esté completed.
- Nunca devuelve storageKey.
- Nunca devuelve signedUrl persistente.
- Reportes sensibles requieren permiso reforzado.
```

---

## 20. Estados y transiciones

```text id="dim-api-state-transitions"
draft -> fileUploaded
fileUploaded -> mappingConfigured
mappingConfigured -> validated
mappingConfigured -> validationFailed
validated -> previewReady
previewReady -> pendingApproval
pendingApproval -> approved
approved -> executing
executing -> completed
executing -> partiallyCompleted
executing -> failed
draft/fileUploaded/mappingConfigured/validated/validationFailed/previewReady/pendingApproval/approved/executing -> cancelled
completed/partiallyCompleted/failed/cancelled -> archived
```

Prohibido:

```text id="dim-api-state-forbidden"
- Cliente no envía status directo.
- Batch archived no se ejecuta.
- Batch completed no se ejecuta nuevamente.
- Batch failed requiere nuevo batch o retry controlado futuro.
```

---

## 21. Idempotencia

Reglas:

```text id="dim-api-idempotency-rules"
- idempotencyKey se genera server-side.
- dryRun genera idempotencyKey.
- commit genera idempotencyKey.
- Retry no duplica registros.
- conflictKey por fila ayuda a detectar duplicados.
- jobId de cola usa tenantId + batchId + executionMode.
```

Constraint:

```text id="dim-api-idempotency-constraint"
unique(tenant_id, import_batch_id, idempotency_key)
```

---

## 22. Seguridad de archivo

Formatos permitidos:

```text id="dim-api-file-formats"
xlsx
csv
json
```

Prohibidos en MVP:

```text id="dim-api-file-forbidden"
pdf como fuente de datos
imágenes como fuente de datos
macros
archivos ejecutables
zip arbitrario
scripts
SQL dumps
backups de base de datos
```

Reglas:

```text id="dim-api-file-rules"
- Validar extensión.
- Validar MIME.
- Validar tamaño máximo.
- Validar checksum si existe.
- Archivo debe estar en SDS.
- No procesar storageKey.
- No procesar signedUrl persistente.
```

---

## 23. Efectos transaccionales permitidos y prohibidos

### 23.1. Permitido mediante puertos propietarios

```text id="dim-api-allowed-effects"
- crear o actualizar unidades permitidas;
- crear o actualizar personas permitidas;
- crear relaciones propietario-residente-unidad;
- crear saldos iniciales permitidos;
- crear cargos iniciales permitidos;
- registrar referencias históricas de pagos sin ejecutarlos;
- crear inventario inicial;
- crear datos base de vehículos/residentes permitidos.
```

---

### 23.2. Prohibido

```text id="dim-api-forbidden-effects"
- ejecutar pagos reales;
- validar pagos automáticamente;
- reversar pagos;
- crear asientos contables directos;
- confirmar conciliación bancaria;
- iniciar pagos bancarios;
- modificar datos cross-tenant;
- abrir portones;
- controlar hardware;
- importar vía WordPress público;
- enviar datos reales a IA externa.
```

---

## 24. Códigos HTTP

```text id="dim-api-http-codes"
200 OK — lectura o transición síncrona exitosa.
201 Created — creación de lote, archivo, mapping o recurso.
202 Accepted — proceso encolado.
400 Bad Request — request malformado.
401 Unauthorized — sin autenticación.
403 Forbidden — sin permiso.
404 Not Found — inexistente o cross-tenant.
409 Conflict — estado inválido, duplicado o conflicto de importación.
413 Payload Too Large — archivo o payload excede límite.
415 Unsupported Media Type — formato no permitido.
422 Unprocessable Entity — validación de DTO o campos prohibidos.
429 Too Many Requests — rate limit.
500 Internal Server Error — error no esperado sanitizado.
```

---

## 25. Error codes

```text id="dim-api-error-codes"
IMPORT_TEMPLATE_NOT_FOUND
IMPORT_TEMPLATE_ARCHIVED
IMPORT_BATCH_NOT_FOUND
IMPORT_BATCH_INVALID_STATE
IMPORT_BATCH_ALREADY_EXECUTED
IMPORT_BATCH_APPROVAL_REQUIRED
IMPORT_BATCH_DRY_RUN_REQUIRED
IMPORT_FILE_REQUIRED
IMPORT_FILE_INVALID_FORMAT
IMPORT_FILE_TOO_LARGE
IMPORT_FILE_NOT_FOUND
IMPORT_MAPPING_REQUIRED
IMPORT_MAPPING_INVALID
IMPORT_VALIDATION_FAILED
IMPORT_VALIDATION_CRITICAL_ISSUES
IMPORT_PREVIEW_NOT_READY
IMPORT_EXECUTION_NOT_FOUND
IMPORT_EXECUTION_DUPLICATE
IMPORT_EXECUTION_FAILED
IMPORT_ROW_RESULT_NOT_FOUND
IMPORT_REPORT_NOT_FOUND
IMPORT_REPORT_GENERATION_FAILED
IMPORT_FORBIDDEN_FIELD
IMPORT_STORAGE_KEY_FORBIDDEN
IMPORT_RAW_SQL_FORBIDDEN
IMPORT_SCRIPT_FORBIDDEN
IMPORT_EXTERNAL_AI_FORBIDDEN
IMPORT_CROSS_TENANT_ACCESS
IMPORT_PERMISSION_DENIED
```

---

## 26. Rate limiting

Aplicar rate limit reforzado en:

```text id="dim-api-rate-limited"
POST /api/v1/tenant/import-batches
POST /api/v1/tenant/import-batches/{batchId}/upload-file
POST /api/v1/tenant/import-batches/{batchId}/validate
POST /api/v1/tenant/import-batches/{batchId}/preview
POST /api/v1/tenant/import-batches/{batchId}/dry-run
POST /api/v1/tenant/import-batches/{batchId}/approve
POST /api/v1/tenant/import-batches/{batchId}/execute
POST /api/v1/tenant/import-batches/{batchId}/reports
```

Respuesta:

```http id="dim-api-rate-limit-response"
429 Too Many Requests
```

---

## 27. Auditoría requerida

Eventos mínimos:

```text id="dim-api-audit-events"
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

```text id="dim-api-audit-allowed"
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

```text id="dim-api-audit-forbidden"
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

## 28. OpenAPI

Tags esperados:

```text id="dim-api-openapi-tags"
Tenant Import Templates
Tenant Import Batches
Tenant Import Files
Tenant Import Mapping
Tenant Import Validation
Tenant Import Preview
Tenant Import Execution
Tenant Import Row Results
Tenant Import Reports
```

Extensiones requeridas:

```yaml id="dim-api-openapi-extensions"
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

```text id="dim-api-openapi-forbidden"
- rutas públicas;
- tenantId en DTOs externos;
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

## 29. Checklist de endpoints

```text id="dim-api-endpoint-checklist"
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

## 30. Criterios de aceptación

```text id="dim-api-acceptance"
[ ] Todas las rutas requieren autenticación.
[ ] Todas las rutas son tenant-scoped.
[ ] Cross-tenant retorna 404.
[ ] DTOs rechazan tenantId.
[ ] DTOs rechazan actor fields.
[ ] DTOs rechazan status directo.
[ ] DTOs rechazan storageKey.
[ ] DTOs rechazan rawSql.
[ ] DTOs rechazan scripts.
[ ] DTOs rechazan fórmula ejecutable.
[ ] Se pueden listar templates.
[ ] Se puede crear batch.
[ ] Se puede asociar archivo SDS.
[ ] Se puede configurar mapping.
[ ] Se puede validar batch.
[ ] Se pueden consultar issues.
[ ] Se puede generar preview.
[ ] Se puede ejecutar dry-run.
[ ] Se puede enviar a aprobación.
[ ] Se puede aprobar con permiso.
[ ] Se puede ejecutar commit controlado.
[ ] Se pueden consultar row results.
[ ] Se pueden generar reportes vía SDS.
[ ] No se expone storageKey.
[ ] No existen endpoints públicos.
[ ] WordPress público no accede.
[ ] No se ejecutan pagos reales.
[ ] No se crean asientos contables directos.
[ ] No se confirma conciliación bancaria.
[ ] No se envían datos reales a IA externa.
```

---

## 31. No aceptación

No se acepta el contrato API si:

```text id="dim-api-no-acceptance"
- permite importaciones cross-tenant;
- acepta tenantId desde cliente;
- acepta status directo;
- acepta storageKey;
- devuelve storageKey;
- acepta rawSql;
- acepta scripts;
- acepta formulaCode ejecutable;
- acepta secretos;
- crea endpoints públicos;
- permite acceso desde WordPress público;
- permite upload público;
- procesa archivo fuera de SDS;
- acepta archivo binario base64 en JSON;
- permite commit sin validación;
- permite commit sin dry-run cuando es requerido;
- permite commit sin aprobación cuando es requerida;
- permite escritura directa no autorizada en módulos externos;
- ejecuta pagos reales;
- crea JournalEntry directo;
- confirma Bank Reconciliation;
- controla hardware;
- envía datos reales a IA externa;
- omite auditoría crítica.
```

---

## 32. Resultado esperado

```text id="dim-api-expected-result"
contrato API definido
tenant import templates API definida
tenant import batches API definida
upload-file API definida
configure-mapping API definida
validation API definida
issues API definida
preview API definida
dry-run API definida
approval API definida
execute API definida
cancel/archive API definida
row-results API definida
reports API definida
auth requerido
tenant isolation requerido
permisos definidos
campos prohibidos definidos
idempotencia definida
SDS requerido
storageKey prohibido
OpenAPI extensions definidas
no public endpoints
no WordPress access
no raw SQL
no scripts
no direct unauthorized writes
```

---

## 33. Expediente actualizado

```text id="dim-api-expediente"
resident-core/
├── docs/
│   ├── specs/
│   │   └── 028-data-import-migration/
│   │       ├── spec.md
│   │       ├── plan.md
│   │       ├── data-model.md
│   │       └── api-contract.md
```
