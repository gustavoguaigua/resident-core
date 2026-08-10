# Spec — 028 Data Import and Migration

## 1. Información del documento

| Campo                 | Valor                                                                                               |
| --------------------- | --------------------------------------------------------------------------------------------------- |
| Proyecto              | RESIDENT Core                                                                                       |
| Spec ID               | 028                                                                                                 |
| Módulo                | Data Import and Migration                                                                           |
| Documento             | Functional Specification                                                                            |
| Ruta                  | `docs/specs/028-data-import-migration/spec.md`                                                      |
| Versión               | 0.1                                                                                                 |
| Estado                | needs-review                                                                                        |
| Fecha                 | 2026-08-02                                                                                          |
| Fase                  | FASE 2 — RESIDENT Core                                                                              |
| Arquitectura objetivo | Monolito modular preparado para microservicios                                                      |
| Stack objetivo        | NestJS / TypeScript / PostgreSQL / Prisma / OpenAPI / Keycloak / Redis / Secure Document Storage    |
| Naturaleza            | Tenant-scoped / Batch-oriented / Validation-heavy / Audit-heavy / Non-public / Controlled migration |

---

## 2. Propósito

El módulo `028-data-import-migration` permite importar, validar, previsualizar, ejecutar y auditar cargas iniciales o migraciones controladas de datos hacia RESIDENT Core.

Su objetivo es facilitar la puesta en marcha de nuevos conjuntos residenciales que ya tienen información en hojas de cálculo, sistemas anteriores o registros manuales.

El módulo debe permitir importar datos como unidades, propietarios, residentes, vehículos, mascotas, saldos iniciales, cargos históricos, pagos históricos, proveedores básicos, inventario inicial y otros datos permitidos por catálogo.

Regla central:

```text id="dim-rule"
Toda importación, plantilla, archivo, lote, fila, validación, previsualización, ejecución, error, corrección, resultado, rollback lógico, snapshot, exportación y auditoría de Data Import and Migration debe pertenecer a un tenant, ejecutarse solo por usuarios autorizados, usar plantillas y tipos de importación permitidos, validar datos antes de escribir, no mezclar tenants, no aceptar tenantId desde cliente, no crear datos financieros confirmados sin aprobación, no sobrescribir registros auditados sin control, no exponer archivos ni storageKey, no ejecutar SQL arbitrario, no ejecutar scripts, no importar secretos, no crear usuarios Keycloak sin flujo autorizado, no usar WordPress público, no exponer endpoints públicos y no enviar datos reales a IA externa.
```

---

## 3. Contexto dentro de RESIDENT Core

`Data Import and Migration` es un módulo transversal de soporte operativo.

```text id="dim-context"
RESIDENT Core
├── Tenants
│   └── valida tenant activo
├── Users, Roles and Permissions
│   └── valida actor, permisos y aprobaciones
├── Residents and Properties
│   └── destino de unidades, propietarios, residentes, vehículos y mascotas
├── Dues and Fees
│   └── destino de cargos iniciales o históricos controlados
├── Payments
│   └── destino de pagos históricos controlados
├── Account Statements
│   └── recibe saldos iniciales derivados o importados como apertura
├── Suppliers
│   └── destino de proveedores básicos si aplica
├── Inventory
│   └── destino de inventario inicial
├── Secure Document Storage
│   └── almacena archivos fuente, resultados y reportes de error
├── Audit
│   └── registra todo el proceso
└── Data Import and Migration
    └── orquesta validación y carga controlada
```

---

## 4. Problema que resuelve

Al incorporar un conjunto residencial existente, la administración suele tener información en Excel, CSV, documentos manuales o sistemas anteriores. Sin un proceso formal, la carga inicial puede generar datos duplicados, saldos incorrectos, inconsistencias entre unidades y residentes, errores de pagos históricos, fuga de información sensible y pérdida de trazabilidad.

Problemas a resolver:

```text id="dim-problems"
- carga manual lenta y propensa a errores;
- ausencia de validación previa;
- duplicación de unidades, residentes o propietarios;
- saldos iniciales inconsistentes;
- pagos históricos sin trazabilidad;
- archivos fuente sin control documental;
- correcciones sin auditoría;
- importaciones parciales no identificadas;
- mezcla accidental de datos entre tenants;
- ausencia de reporte de errores por fila;
- dificultad para migrar desde hojas de cálculo;
- riesgo de sobrescribir datos transaccionales existentes;
- exposición de datos personales y financieros;
- falta de rollback lógico o compensación controlada.
```

---

## 5. Objetivos funcionales

```text id="dim-objectives"
1. Permitir definir tipos de importación permitidos.
2. Permitir descargar plantillas oficiales.
3. Permitir cargar archivos CSV/XLSX.
4. Guardar archivos fuente mediante Secure Document Storage.
5. Validar estructura del archivo.
6. Validar datos por fila.
7. Validar relaciones entre filas.
8. Detectar duplicados.
9. Generar previsualización antes de ejecutar.
10. Generar reporte de errores.
11. Permitir corrección y reintento.
12. Ejecutar importación por lotes.
13. Registrar resultados por fila.
14. Crear datos solo en módulos permitidos.
15. Proteger registros existentes.
16. Permitir importación dry-run.
17. Permitir importación final con aprobación.
18. Mantener trazabilidad auditable.
19. Permitir rollback lógico cuando sea viable.
20. Evitar endpoints públicos, WordPress público, scripts, SQL arbitrario, storageKey e IA externa con datos reales.
```

---

## 6. Principios de diseño

### 6.1. Validar antes de escribir

```text id="dim-principle-validate-first"
Ninguna importación debe escribir datos finales sin validación estructural, validación por fila, validación de relaciones y previsualización.
```

---

### 6.2. Importación controlada por catálogo

```text id="dim-principle-catalog"
Solo se permiten tipos de importación definidos por catálogo. No se aceptan importaciones libres hacia tablas arbitrarias.
```

---

### 6.3. Tenant isolation obligatorio

```text id="dim-principle-tenant"
Todo archivo, lote, fila, error, resultado y dato destino debe pertenecer al tenant actual.
```

---

### 6.4. No SQL ni scripts

```text id="dim-principle-no-code"
El módulo no permite SQL personalizado, scripts, macros, fórmulas ejecutables, comandos shell, expresiones dinámicas inseguras ni código definido por usuarios.
```

---

### 6.5. Archivo fuente protegido

```text id="dim-principle-file"
Todo archivo fuente debe guardarse en Secure Document Storage. La API nunca debe exponer storageKey ni signedUrl persistente.
```

---

### 6.6. Escritura mediante puertos del módulo dueño

```text id="dim-principle-owner-module"
Data Import and Migration no debe escribir directamente tablas de negocio externas si existe un servicio o puerto del módulo dueño para crear datos con sus reglas.
```

---

### 6.7. Auditoría completa

```text id="dim-principle-audit"
Toda carga, validación, aprobación, ejecución, error, cancelación, rollback lógico y exportación de resultados debe auditarse.
```

---

## 7. Alcance MVP

### 7.1. Incluido

```text id="dim-scope-in"
- Catálogo de tipos de importación.
- Plantillas oficiales CSV/XLSX.
- Upload de archivo fuente.
- Almacenamiento seguro del archivo fuente en SDS.
- Import jobs tenant-scoped.
- Validación estructural.
- Validación por fila.
- Validación de duplicados.
- Validación de relaciones básicas.
- Previsualización de resultados.
- Dry-run.
- Ejecución final por lotes.
- Resultados por fila.
- Reporte de errores.
- Exportación de resultados vía SDS.
- Importación de unidades.
- Importación de propietarios.
- Importación de residentes.
- Importación de vehículos.
- Importación de mascotas.
- Importación de saldos iniciales.
- Importación de cargos históricos básicos.
- Importación de pagos históricos básicos.
- Importación de proveedores básicos.
- Importación de inventario inicial.
- Auditoría.
- Observabilidad.
- API REST privada.
- OpenAPI.
- Tests de multitenancy, seguridad, validación y consistencia.
```

---

### 7.2. Fuera de alcance MVP

```text id="dim-scope-out"
- ETL avanzado.
- Conectores directos a sistemas externos.
- Migración automática desde bancos.
- Open banking ingestion.
- Importación desde WordPress público.
- Importación por webhook público.
- SQL personalizado.
- Scripts de transformación definidos por usuario.
- Macros Excel.
- Fórmulas ejecutables.
- OCR automático de documentos.
- IA externa con datos reales.
- Creación automática masiva de usuarios Keycloak sin flujo aprobado.
- Importación de credenciales.
- Importación de tokens.
- Conciliación bancaria automática.
- Validación automática de pagos reales.
- Reversos financieros masivos.
- Creación directa de asientos contables.
- Rollback físico destructivo.
```

---

## 8. Tipos de importación MVP

### 8.1. Residentes y propiedades

```text id="dim-import-residents-properties"
properties.units
properties.owners
properties.residents
properties.unitAssignments
properties.vehicles
properties.pets
```

Destino:

```text id="dim-destination-residents-properties"
003-residents-properties
```

---

### 8.2. Finanzas iniciales

```text id="dim-import-financial"
financial.openingBalances
financial.historicalCharges
financial.historicalPayments
financial.pendingDues
```

Destinos:

```text id="dim-destination-financial"
004-dues-fees
005-payments
006-account-statements
```

Regla:

```text id="dim-financial-rule"
Los datos financieros importados deben marcarse como origen migration/import y no deben confirmarse como movimientos operativos ordinarios sin trazabilidad, aprobación y reglas del módulo financiero correspondiente.
```

---

### 8.3. Proveedores e inventario

```text id="dim-import-suppliers-inventory"
suppliers.basicSuppliers
inventory.initialItems
inventory.initialStockBalances
```

Destinos:

```text id="dim-destination-suppliers-inventory"
021-supplier-payments
023-inventory-basic
```

---

### 8.4. Operación básica opcional

```text id="dim-import-optional-ops"
maintenance.initialOpenRequests
access.initialVehicleAuthorizations
communications.contactDirectory
```

Regla:

```text id="dim-optional-ops-rule"
Los tipos operativos opcionales solo se habilitan si el tenant y los módulos destino están configurados. En MVP pueden quedar como plantillas preparadas pero no activas.
```

---

## 9. Entidades funcionales

### 9.1. ImportTypeDefinition

Define un tipo de importación permitido.

Campos conceptuales:

```text id="dim-entity-import-type"
- id;
- importTypeKey;
- name;
- description;
- targetModule;
- templateVersion;
- schemaDefinition;
- requiredPermission;
- sensitivity;
- status;
```

Reglas:

```text id="dim-import-type-rules"
- importTypeKey debe ser único.
- targetModule debe estar permitido.
- schemaDefinition no puede contener SQL ni scripts.
- status archived no puede usarse en nuevos jobs.
```

---

### 9.2. ImportTemplate

Define una plantilla descargable.

Campos conceptuales:

```text id="dim-entity-template"
- id;
- importTypeDefinitionId;
- templateVersion;
- format;
- columnsDefinition;
- secureDocumentId;
- status;
```

Reglas:

```text id="dim-template-rules"
- Las plantillas oficiales son versionadas.
- Las plantillas se descargan desde SDS.
- La API no expone storageKey.
```

---

### 9.3. ImportJob

Representa una importación solicitada por un tenant.

Campos conceptuales:

```text id="dim-entity-job"
- id;
- tenantId;
- importTypeDefinitionId;
- importTypeKey;
- sourceFileDocumentId;
- originalFileName;
- fileFormat;
- status;
- mode;
- requestedBy;
- approvedBy;
- startedAt;
- completedAt;
- failedAt;
```

Modos:

```text id="dim-import-modes"
dryRun
finalRun
```

---

### 9.4. ImportBatch

Representa un lote dentro de un job.

Campos conceptuales:

```text id="dim-entity-batch"
- id;
- tenantId;
- importJobId;
- batchNumber;
- status;
- totalRows;
- validRows;
- invalidRows;
- processedRows;
- failedRows;
```

---

### 9.5. ImportRow

Representa una fila del archivo importado.

Campos conceptuales:

```text id="dim-entity-row"
- id;
- tenantId;
- importJobId;
- importBatchId;
- rowNumber;
- rawDataSanitized;
- normalizedData;
- validationStatus;
- processingStatus;
- targetResourceType;
- targetResourceId;
- errorSummary;
```

Reglas:

```text id="dim-row-rules"
- rawDataSanitized no contiene secretos.
- normalizedData no contiene scripts.
- targetResourceId se asigna solo después de ejecución exitosa.
```

---

### 9.6. ImportValidationError

Representa errores de validación.

Campos conceptuales:

```text id="dim-entity-error"
- id;
- tenantId;
- importJobId;
- importRowId;
- errorCode;
- fieldName;
- message;
- severity;
```

Severidades:

```text id="dim-error-severity"
warning
error
critical
```

---

### 9.7. ImportExecutionResult

Resume el resultado de ejecución.

Campos conceptuales:

```text id="dim-entity-execution-result"
- id;
- tenantId;
- importJobId;
- totalRows;
- createdCount;
- updatedCount;
- skippedCount;
- failedCount;
- resultSummary;
- resultDocumentId;
```

---

### 9.8. ImportRollbackRecord

Registra rollback lógico o compensación.

Campos conceptuales:

```text id="dim-entity-rollback"
- id;
- tenantId;
- importJobId;
- rollbackType;
- status;
- affectedResourceType;
- affectedResourceId;
- reason;
- performedBy;
```

Regla:

```text id="dim-rollback-rule"
El rollback MVP debe ser lógico o compensatorio. No se permite borrado físico destructivo de registros financieros, auditables o vinculados.
```

---

## 10. Estados

### 10.1. ImportJobStatus

```text id="dim-status-job"
uploaded
validating
validationFailed
validated
previewReady
approvalRequired
approved
queued
processing
completed
completedWithErrors
failed
cancelled
rolledBack
archived
```

---

### 10.2. ImportBatchStatus

```text id="dim-status-batch"
pending
processing
completed
completedWithErrors
failed
cancelled
```

---

### 10.3. ImportRowValidationStatus

```text id="dim-status-row-validation"
pending
valid
warning
invalid
critical
```

---

### 10.4. ImportRowProcessingStatus

```text id="dim-status-row-processing"
pending
skipped
created
updated
failed
cancelled
```

---

### 10.5. ImportTemplateStatus

```text id="dim-status-template"
active
deprecated
archived
```

---

## 11. Actores

### 11.1. PlatformAdmin

Puede:

```text id="dim-actor-platform"
- crear tipos de importación;
- versionar plantillas;
- archivar plantillas;
- revisar configuración global;
- no acceder a datos reales de tenant sin contexto, permiso y auditoría.
```

---

### 11.2. TenantAdmin

Puede:

```text id="dim-actor-tenantadmin"
- descargar plantillas;
- subir archivos;
- ejecutar validación;
- revisar previsualización;
- solicitar ejecución final;
- aprobar importaciones no sensibles si tiene permiso;
- consultar resultados;
- exportar errores.
```

---

### 11.3. FinancialManager

Puede:

```text id="dim-actor-financial"
- importar saldos iniciales si tiene permiso;
- importar cargos históricos controlados;
- importar pagos históricos controlados;
- aprobar importaciones financieras si tiene permiso reforzado.
```

No puede:

```text id="dim-actor-financial-cannot"
- validar pagos operativos desde este módulo;
- reversar pagos masivamente;
- crear asientos contables directos;
- confirmar conciliación bancaria.
```

---

### 11.4. Resident

```text id="dim-actor-resident"
Resident no accede al módulo de importación en MVP.
```

---

## 12. Permisos

### 12.1. Platform

```text id="dim-permissions-platform"
importTypeDefinitions.read
importTypeDefinitions.create
importTypeDefinitions.update
importTypeDefinitions.archive

importTemplates.read
importTemplates.create
importTemplates.update
importTemplates.archive
```

---

### 12.2. Tenant

```text id="dim-permissions-tenant"
tenantImports.read
tenantImports.upload
tenantImports.validate
tenantImports.preview
tenantImports.approve
tenantImports.execute
tenantImports.cancel
tenantImports.rollback
tenantImports.exportResults
```

---

### 12.3. Permisos sensibles

```text id="dim-permissions-sensitive"
tenantImports.importPersonalData
tenantImports.importFinancialData
tenantImports.approveFinancialImport
tenantImports.executeFinancialImport
tenantImports.rollbackFinancialImport
tenantImports.exportSensitiveResults
importTypeDefinitions.manageSensitive
```

Regla:

```text id="dim-sensitive-rule"
Toda importación de datos personales, financieros, saldos iniciales, pagos históricos, accesos o documentos sensibles requiere permiso reforzado.
```

---

## 13. Flujos funcionales principales

### 13.1. Descargar plantilla

```text id="dim-flow-template"
1. Usuario solicita plantilla por importTypeKey.
2. Sistema valida permiso.
3. Sistema obtiene template active.
4. Sistema retorna referencia segura de descarga vía SDS.
5. Sistema no expone storageKey.
```

---

### 13.2. Subir archivo

```text id="dim-flow-upload"
1. Usuario sube archivo CSV/XLSX.
2. Sistema valida importTypeKey.
3. Sistema valida formato y tamaño.
4. Sistema guarda archivo en SDS.
5. Sistema crea ImportJob en estado uploaded.
6. Sistema audita importJob.uploaded.
```

---

### 13.3. Validar archivo

```text id="dim-flow-validate"
1. Usuario solicita validación.
2. Sistema cambia estado a validating.
3. Sistema lee archivo desde SDS mediante puerto seguro.
4. Sistema valida columnas obligatorias.
5. Sistema normaliza filas.
6. Sistema valida datos por fila.
7. Sistema valida relaciones.
8. Sistema detecta duplicados.
9. Sistema genera errores por fila.
10. Sistema cambia estado a validated o validationFailed.
11. Sistema audita resultado.
```

---

### 13.4. Previsualizar importación

```text id="dim-flow-preview"
1. Usuario consulta preview.
2. Sistema valida permisos.
3. Sistema retorna resumen de filas válidas, inválidas y advertencias.
4. Sistema muestra impactos previstos.
5. Sistema no escribe datos finales.
```

---

### 13.5. Ejecutar dry-run

```text id="dim-flow-dry-run"
1. Usuario ejecuta dry-run.
2. Sistema valida job validated.
3. Sistema simula escritura mediante puertos destino.
4. Sistema genera resultado sin persistir datos finales.
5. Sistema marca previewReady o approvalRequired.
```

---

### 13.6. Aprobar importación

```text id="dim-flow-approve"
1. Usuario autorizado revisa preview.
2. Sistema valida permiso.
3. Si importación es financiera o sensible, exige permiso reforzado.
4. Sistema marca job approved.
5. Sistema audita importJob.approved.
```

---

### 13.7. Ejecutar importación final

```text id="dim-flow-final-run"
1. Usuario autorizado solicita ejecución.
2. Sistema valida job approved.
3. Sistema encola procesamiento por lotes.
4. Sistema procesa filas válidas.
5. Sistema escribe mediante puertos del módulo destino.
6. Sistema registra resultado por fila.
7. Sistema genera resumen.
8. Sistema marca completed o completedWithErrors.
9. Sistema audita importJob.completed.
```

---

### 13.8. Exportar errores o resultados

```text id="dim-flow-export"
1. Usuario solicita exportación de errores/resultados.
2. Sistema valida permiso.
3. Sistema genera archivo.
4. Sistema guarda archivo en SDS.
5. Sistema retorna secureDocumentId.
6. Sistema no retorna storageKey.
```

---

### 13.9. Rollback lógico

```text id="dim-flow-rollback"
1. Usuario autorizado solicita rollback.
2. Sistema valida que el job permita rollback.
3. Sistema calcula recursos afectados.
4. Sistema ejecuta reversión lógica o compensación permitida.
5. Sistema no borra registros auditables físicamente.
6. Sistema audita rollback.
```

---

## 14. Reglas de negocio

### 14.1. Reglas generales

```text id="dim-br-general"
BR-001 Todo ImportJob pertenece a un tenant.
BR-002 Todo ImportRow pertenece al tenant del ImportJob.
BR-003 Todo archivo fuente debe almacenarse en SDS.
BR-004 La API no debe exponer storageKey.
BR-005 Solo se permiten importTypeKey catalogados.
BR-006 No se permite importar hacia tablas arbitrarias.
BR-007 No se acepta tenantId desde cliente.
BR-008 Cross-tenant responde 404.
BR-009 No se permite SQL arbitrario.
BR-010 No se permite script ni fórmula ejecutable.
```

---

### 14.2. Reglas de validación

```text id="dim-br-validation"
BR-011 La estructura del archivo debe coincidir con la plantilla.
BR-012 Columnas obligatorias deben existir.
BR-013 Tipos de datos deben validarse antes de ejecutar.
BR-014 Emails deben normalizarse.
BR-015 Fechas deben validarse en formato permitido.
BR-016 Montos deben validarse como decimal string.
BR-017 Identificadores externos deben normalizarse.
BR-018 Duplicados deben reportarse antes de ejecución.
BR-019 Relaciones obligatorias deben existir.
BR-020 Errores críticos impiden ejecución final.
```

---

### 14.3. Reglas financieras

```text id="dim-br-financial"
BR-021 Importar saldos iniciales requiere permiso financiero.
BR-022 Importar pagos históricos requiere permiso financiero reforzado.
BR-023 Pagos históricos deben marcarse como importados.
BR-024 Cargos históricos deben marcarse como importados.
BR-025 Importación financiera requiere approval.
BR-026 No se valida Payment operativo desde este módulo.
BR-027 No se reversa Payment desde este módulo.
BR-028 No se crea JournalEntry directo desde este módulo.
BR-029 No se confirma Bank Reconciliation desde este módulo.
BR-030 Ajustes posteriores deben pasar por módulos financieros correspondientes.
```

---

### 14.4. Reglas de residentes y unidades

```text id="dim-br-residents"
BR-031 No puede existir unidad duplicada dentro del tenant.
BR-032 Propietario debe asociarse a unidad válida.
BR-033 Residente debe asociarse a unidad válida si corresponde.
BR-034 Vehículo debe asociarse a persona o unidad válida.
BR-035 Mascota debe asociarse a persona o unidad válida.
BR-036 Datos personales deben minimizarse.
BR-037 No se crean usuarios Keycloak automáticamente salvo flujo aprobado.
```

---

### 14.5. Reglas de ejecución

```text id="dim-br-execution"
BR-038 Job debe estar validated antes de preview.
BR-039 Job debe estar approved antes de finalRun si es sensible.
BR-040 Execution debe ser idempotente por jobId + rowNumber.
BR-041 Fila fallida no debe detener todo el job salvo error crítico.
BR-042 Resultados por fila deben persistirse.
BR-043 completedWithErrors debe indicar fallos parciales.
BR-044 Cancelación debe ser best-effort.
BR-045 Reintentos no deben duplicar registros ya creados.
```

---

### 14.6. Reglas de rollback

```text id="dim-br-rollback"
BR-046 Rollback físico destructivo no está permitido en MVP.
BR-047 Rollback financiero requiere permiso reforzado.
BR-048 Rollback debe registrar recursos afectados.
BR-049 Rollback no debe eliminar auditoría.
BR-050 Rollback debe ejecutarse mediante puertos del módulo dueño.
```

---

## 15. User stories

### US-001 — Descargar plantilla

Como TenantAdmin, quiero descargar una plantilla oficial para preparar correctamente la información del conjunto.

Acceptance:

```text id="dim-us001-ac"
[ ] Requiere autenticación.
[ ] Requiere permiso de importación.
[ ] Retorna plantilla activa.
[ ] No expone storageKey.
```

---

### US-002 — Subir archivo

Como TenantAdmin, quiero subir un archivo de importación para iniciar una carga de datos.

Acceptance:

```text id="dim-us002-ac"
[ ] Requiere tenantImports.upload.
[ ] Archivo se guarda en SDS.
[ ] Job queda en uploaded.
[ ] Se audita upload.
```

---

### US-003 — Validar archivo

Como TenantAdmin, quiero validar el archivo antes de ejecutar la carga para corregir errores.

Acceptance:

```text id="dim-us003-ac"
[ ] Requiere tenantImports.validate.
[ ] Valida columnas y filas.
[ ] Detecta duplicados.
[ ] Genera errores por fila.
[ ] No escribe datos finales.
```

---

### US-004 — Previsualizar impacto

Como administrador, quiero ver una previsualización del impacto antes de confirmar la importación.

Acceptance:

```text id="dim-us004-ac"
[ ] Requiere tenantImports.preview.
[ ] Muestra creados/actualizados/omitidos esperados.
[ ] No escribe datos finales.
[ ] Oculta datos sensibles sin permiso.
```

---

### US-005 — Ejecutar importación final

Como usuario autorizado, quiero ejecutar la importación final para cargar datos validados.

Acceptance:

```text id="dim-us005-ac"
[ ] Requiere tenantImports.execute.
[ ] Requiere approval si es sensible.
[ ] Procesa por lotes.
[ ] Registra resultado por fila.
[ ] No duplica datos en reintentos.
```

---

### US-006 — Importar saldos iniciales

Como FinancialManager, quiero importar saldos iniciales para empezar la operación financiera del conjunto.

Acceptance:

```text id="dim-us006-ac"
[ ] Requiere tenantImports.importFinancialData.
[ ] Requiere approval financiero.
[ ] Montos usan decimal string.
[ ] Saldos quedan marcados como importados.
[ ] No crea asientos contables directos.
```

---

### US-007 — Exportar errores

Como TenantAdmin, quiero exportar errores de importación para corregir el archivo.

Acceptance:

```text id="dim-us007-ac"
[ ] Requiere tenantImports.exportResults.
[ ] Export usa SDS.
[ ] Retorna secureDocumentId.
[ ] No retorna storageKey.
```

---

### US-008 — Rollback lógico

Como usuario autorizado, quiero revertir lógicamente una importación permitida cuando detecte un error grave.

Acceptance:

```text id="dim-us008-ac"
[ ] Requiere tenantImports.rollback.
[ ] Requiere permiso reforzado si contiene datos financieros.
[ ] No borra auditoría.
[ ] No ejecuta borrado físico destructivo.
[ ] Registra rollback record.
```

---

## 16. Requerimientos funcionales

### 16.1. Catálogo y plantillas

```text id="dim-fr-catalog"
FR-001 El sistema debe permitir definir import types.
FR-002 El sistema debe permitir versionar plantillas.
FR-003 El sistema debe permitir descargar plantillas activas.
FR-004 El sistema debe impedir plantillas con scripts o macros.
FR-005 El sistema debe auditar cambios de catálogo.
```

---

### 16.2. Upload y almacenamiento

```text id="dim-fr-upload"
FR-006 El sistema debe permitir upload CSV/XLSX.
FR-007 El sistema debe validar tamaño máximo.
FR-008 El sistema debe guardar archivo fuente en SDS.
FR-009 El sistema debe crear ImportJob.
FR-010 El sistema no debe exponer storageKey.
```

---

### 16.3. Validación

```text id="dim-fr-validation"
FR-011 El sistema debe validar estructura de archivo.
FR-012 El sistema debe validar columnas obligatorias.
FR-013 El sistema debe validar tipos de datos.
FR-014 El sistema debe validar duplicados.
FR-015 El sistema debe validar relaciones.
FR-016 El sistema debe registrar errores por fila.
FR-017 El sistema debe impedir ejecución con errores críticos.
```

---

### 16.4. Preview y dry-run

```text id="dim-fr-preview"
FR-018 El sistema debe generar preview.
FR-019 El sistema debe soportar dry-run.
FR-020 El sistema debe mostrar impacto estimado.
FR-021 El sistema no debe persistir datos finales en dry-run.
```

---

### 16.5. Ejecución

```text id="dim-fr-execution"
FR-022 El sistema debe ejecutar importación por lotes.
FR-023 El sistema debe registrar resultado por fila.
FR-024 El sistema debe soportar completedWithErrors.
FR-025 El sistema debe ser idempotente por job + row.
FR-026 El sistema debe permitir cancelación best-effort.
```

---

### 16.6. Export y rollback

```text id="dim-fr-export-rollback"
FR-027 El sistema debe exportar errores/resultados vía SDS.
FR-028 El sistema debe retornar secureDocumentId.
FR-029 El sistema debe soportar rollback lógico permitido.
FR-030 El sistema debe auditar rollback.
```

---

### 16.7. Seguridad funcional

```text id="dim-fr-security"
FR-031 El sistema debe rechazar tenantId desde cliente.
FR-032 El sistema debe rechazar rawSql.
FR-033 El sistema debe rechazar scripts.
FR-034 El sistema debe rechazar macros.
FR-035 El sistema debe rechazar secretos.
FR-036 El sistema debe impedir endpoints públicos.
FR-037 El sistema debe impedir acceso WordPress público.
FR-038 El sistema debe impedir IA externa con datos reales.
```

---

## 17. Requerimientos no funcionales

### 17.1. Seguridad

```text id="dim-nfr-security"
NFR-001 Todas las rutas requieren autenticación.
NFR-002 Todas las rutas tenant requieren TenantGuard.
NFR-003 Rutas sensibles requieren SensitivePermissionGuard.
NFR-004 Cross-tenant responde 404.
NFR-005 Archivos se almacenan en SDS.
NFR-006 No se expone storageKey.
```

---

### 17.2. Performance

```text id="dim-nfr-performance"
NFR-007 Validar 1.000 filas p95 < 10 s.
NFR-008 Procesar 1.000 filas p95 < 30 s en MVP local/controlado.
NFR-009 Listar jobs p95 < 800 ms.
NFR-010 Consultar preview p95 < 1500 ms.
NFR-011 Export de errores pequeño p95 < 3000 ms.
```

---

### 17.3. Resiliencia

```text id="dim-nfr-resilience"
NFR-012 Fallo de una fila no debe detener todo el job salvo error crítico.
NFR-013 Job interrumpido puede reintentarse sin duplicar registros.
NFR-014 Cancelación es best-effort.
NFR-015 Errores deben ser recuperables y exportables.
```

---

### 17.4. Auditabilidad

```text id="dim-nfr-audit"
NFR-016 Todo cambio de estado del job se audita.
NFR-017 Toda ejecución final se audita.
NFR-018 Todo rollback se audita.
NFR-019 Todo export se audita.
NFR-020 Audit no contiene datos sensibles raw.
```

---

## 18. API preliminar

> El contrato formal se definirá en `api-contract.md`.

### 18.1. Platform API

```text id="dim-api-platform"
GET    /api/v1/platform/import-type-definitions
POST   /api/v1/platform/import-type-definitions
GET    /api/v1/platform/import-type-definitions/{definitionId}
PATCH  /api/v1/platform/import-type-definitions/{definitionId}
POST   /api/v1/platform/import-type-definitions/{definitionId}/archive

GET    /api/v1/platform/import-templates
POST   /api/v1/platform/import-templates
GET    /api/v1/platform/import-templates/{templateId}
PATCH  /api/v1/platform/import-templates/{templateId}
POST   /api/v1/platform/import-templates/{templateId}/archive
```

---

### 18.2. Tenant API

```text id="dim-api-tenant"
GET    /api/v1/tenant/import-types
GET    /api/v1/tenant/import-templates/{importTypeKey}/download

GET    /api/v1/tenant/import-jobs
POST   /api/v1/tenant/import-jobs
GET    /api/v1/tenant/import-jobs/{jobId}
POST   /api/v1/tenant/import-jobs/{jobId}/validate
GET    /api/v1/tenant/import-jobs/{jobId}/preview
POST   /api/v1/tenant/import-jobs/{jobId}/dry-run
POST   /api/v1/tenant/import-jobs/{jobId}/approve
POST   /api/v1/tenant/import-jobs/{jobId}/execute
POST   /api/v1/tenant/import-jobs/{jobId}/cancel
POST   /api/v1/tenant/import-jobs/{jobId}/rollback

GET    /api/v1/tenant/import-jobs/{jobId}/rows
GET    /api/v1/tenant/import-jobs/{jobId}/errors
POST   /api/v1/tenant/import-jobs/{jobId}/exports
GET    /api/v1/tenant/import-exports/{exportId}
```

---

### 18.3. Public API prohibida

No implementar:

```text id="dim-api-public-forbidden"
/api/v1/public/imports
/api/v1/public/import-jobs
/api/v1/public/import-templates
/api/v1/public/tenants/{slug}/imports
/api/v1/public/tenants/{slug}/import-jobs
```

Respuesta esperada:

```http id="dim-api-public-response"
404 Not Found
```

---

## 19. Integraciones

### 19.1. Secure Document Storage

Uso:

```text id="dim-integration-sds"
- almacenar archivos fuente;
- almacenar plantillas oficiales;
- almacenar reportes de error;
- almacenar reportes de resultado;
- retornar secureDocumentId;
- no retornar storageKey.
```

---

### 19.2. Residents and Properties

Uso:

```text id="dim-integration-residents"
- crear unidades;
- crear personas;
- asociar propietarios;
- asociar residentes;
- registrar vehículos;
- registrar mascotas;
```

---

### 19.3. Financial modules

Uso:

```text id="dim-integration-financial"
- crear saldos iniciales controlados;
- registrar cargos históricos importados;
- registrar pagos históricos importados;
- marcar origen import/migration;
- no validar pagos operativos;
- no crear asientos contables directos.
```

---

### 19.4. Inventory and suppliers

Uso:

```text id="dim-integration-inventory-suppliers"
- crear proveedores básicos;
- crear ítems de inventario;
- registrar stock inicial controlado.
```

---

### 19.5. Audit

Uso:

```text id="dim-integration-audit"
- auditar upload;
- auditar validation;
- auditar approval;
- auditar execution;
- auditar errors;
- auditar export;
- auditar rollback.
```

---

## 20. Seguridad

### 20.1. Controles mínimos

```text id="dim-security-controls"
- AuthGuard.
- TenantGuard.
- PermissionGuard.
- SensitivePermissionGuard.
- PlatformPermissionGuard.
- DTO whitelist.
- forbidNonWhitelisted.
- Import type allowlist.
- Template validation.
- File type validation.
- Row sanitizer.
- Result sanitizer.
- SDS boundary.
- Audit obligatorio.
- No public endpoints.
- No WordPress access.
- No raw SQL.
- No scripts.
- No macros.
- No external AI real data.
```

---

### 20.2. Campos prohibidos en DTOs

```text id="dim-forbidden-dto-fields"
tenantId
createdBy
updatedBy
requestedBy
approvedBy
executedBy
cancelledBy
rolledBackBy
status directo fuera de transición
storageKey
signedUrl
secret
token
password
apiKey
privateKey
clientSecret
databaseUrl
rawSql
sql
script
macro
javascript
functionBody
executableCode
formulaCode
eval
Function
paymentValidationCommand
journalEntryCommand
bankReconciliationCommand
gateOpenCommand
hardwareDeviceCommand
externalAiEnabled
externalAiRealDataAllowed
```

---

### 20.3. Prohibiciones de dominio

```text id="dim-domain-forbidden"
- no endpoints públicos;
- no WordPress público;
- no importación cross-tenant;
- no SQL arbitrario;
- no scripts;
- no macros;
- no almacenamiento de secretos;
- no storageKey en request o response;
- no importación de credenciales;
- no creación automática de usuarios Keycloak sin flujo aprobado;
- no validación operativa de pagos;
- no reversos masivos;
- no creación directa de JournalEntry;
- no confirmación de conciliación bancaria;
- no rollback físico destructivo;
- no control de hardware;
- no IA externa con datos reales.
```

---

## 21. Auditoría

Eventos mínimos:

```text id="dim-audit-events"
importTypeDefinition.created
importTypeDefinition.updated
importTypeDefinition.archived

importTemplate.created
importTemplate.updated
importTemplate.archived

importJob.uploaded
importJob.validationStarted
importJob.validationCompleted
importJob.validationFailed
importJob.previewGenerated
importJob.dryRunCompleted
importJob.approved
importJob.queued
importJob.processingStarted
importJob.completed
importJob.completedWithErrors
importJob.failed
importJob.cancelled
importJob.rollbackRequested
importJob.rolledBack

importExport.created
importExport.completed
importExport.failed
```

Metadata permitida:

```text id="dim-audit-allowed"
importTypeKey
jobId
batchId
rowCount
validRows
invalidRows
createdCount
updatedCount
skippedCount
failedCount
fileFormat
status
reason
traceId
correlationId
```

Metadata prohibida:

```text id="dim-audit-forbidden"
storageKey
signedUrl
secret
token
password
apiKey
rawSql
script
macro
raw row data sensible
datos cross-tenant
authorization header
cookie
```

---

## 22. Observabilidad

Logs seguros:

```text id="dim-logs"
import.job.uploaded
import.job.validation.started
import.job.validation.completed
import.job.execution.started
import.job.execution.completed
import.job.execution.failed
import.job.rollback.requested
import.job.export.completed
```

Métricas:

```text id="dim-metrics"
import_jobs_total
import_jobs_completed_total
import_jobs_failed_total
import_rows_validated_total
import_rows_invalid_total
import_rows_processed_total
import_rows_failed_total
import_validation_duration_ms
import_execution_duration_ms
import_exports_total
```

Labels prohibidos:

```text id="dim-metric-labels-forbidden"
tenantId
userId
personId
propertyUnitId
jobId
rowId
storageKey
traceId
```

---

## 23. Riesgos

| Riesgo                                |   Nivel | Mitigación                                 |
| ------------------------------------- | ------: | ------------------------------------------ |
| Mezcla de datos entre tenants         | Crítico | TenantGuard, tenant_id, tests cross-tenant |
| Archivo con datos sensibles expuesto  | Crítico | SDS, no storageKey, permisos               |
| Importación con errores masivos       |    Alto | validation, preview, dry-run               |
| Duplicación de registros              |    Alto | dedupe, idempotency por job + row          |
| Carga financiera incorrecta           | Crítico | permiso reforzado, approval, audit         |
| Sobrescritura de registros existentes |    Alto | conflict policy, preview, approval         |
| Macros o fórmulas maliciosas          |    Alto | rechazo de macros/scripts/formulaCode      |
| Rollback destructivo                  | Crítico | solo rollback lógico                       |
| IA externa con datos reales           |    Alto | prohibido en MVP                           |
| WordPress público como canal de carga |    Alto | no public, CORS restrictivo                |

---

## 24. Decisiones MVP

```text id="dim-decisions"
1. Importaciones solo mediante tipos catalogados.
2. Archivos fuente se almacenan en Secure Document Storage.
3. MVP soporta CSV/XLSX.
4. Toda importación pasa por validación y preview.
5. Importaciones sensibles requieren aprobación.
6. Ejecución final se hace por lotes.
7. Resultados se registran por fila.
8. Errores pueden exportarse vía SDS.
9. Rollback MVP es lógico o compensatorio.
10. No hay SQL personalizado.
11. No hay scripts ni macros.
12. No hay endpoints públicos.
13. No hay acceso WordPress público.
14. No hay IA externa con datos reales.
15. No hay validación operativa de pagos ni contabilidad directa.
```

---

## 25. OpenAPI preliminar

Tags esperados:

```text id="dim-openapi-tags"
Platform Import Type Definitions
Platform Import Templates
Tenant Import Types
Tenant Import Jobs
Tenant Import Rows
Tenant Import Errors
Tenant Import Exports
```

Extensiones esperadas:

```yaml id="dim-openapi-extensions"
x-auth-required: true
x-tenant-scope: true
x-data-import-migration: true
x-batch-processing: true
x-validation-required: true
x-preview-required: true
x-public-exposure: false
x-wordpress-access: false
x-storage-key-exposed: false
x-raw-sql-allowed: false
x-executable-script: false
x-payment-validation: false
x-accounting-execution: false
x-bank-reconciliation-confirmation: false
x-hardware-control: false
x-external-ai-real-data: false
```

---

## 26. Criterios de aceptación

```text id="dim-acceptance"
[ ] El módulo permite listar tipos de importación permitidos.
[ ] El módulo permite descargar plantillas oficiales.
[ ] El módulo permite subir CSV/XLSX.
[ ] El módulo guarda archivos en SDS.
[ ] El módulo no expone storageKey.
[ ] El módulo valida columnas.
[ ] El módulo valida filas.
[ ] El módulo detecta duplicados.
[ ] El módulo genera preview.
[ ] El módulo soporta dry-run.
[ ] El módulo requiere approval para importaciones sensibles.
[ ] El módulo ejecuta importación por lotes.
[ ] El módulo registra resultado por fila.
[ ] El módulo exporta errores vía SDS.
[ ] El módulo soporta rollback lógico permitido.
[ ] El módulo audita operaciones críticas.
[ ] El módulo impide tenantId desde cliente.
[ ] El módulo impide cross-tenant.
[ ] El módulo impide rawSql.
[ ] El módulo impide scripts/macros.
[ ] El módulo impide endpoints públicos.
[ ] El módulo impide WordPress público.
[ ] El módulo impide IA externa con datos reales.
[ ] El módulo no valida pagos operativos.
[ ] El módulo no crea JournalEntry directo.
[ ] El módulo no confirma conciliación bancaria.
```

---

## 27. No aceptación

No se acepta el módulo si:

```text id="dim-no-acceptance"
- permite importación cross-tenant;
- acepta tenantId desde cliente;
- expone storageKey;
- expone signedUrl persistente;
- almacena secretos;
- permite rawSql;
- permite scripts;
- permite macros;
- permite formulaCode ejecutable;
- permite importación hacia tablas arbitrarias;
- permite endpoints públicos;
- permite upload desde WordPress público;
- crea usuarios Keycloak masivos sin flujo aprobado;
- valida pagos operativos;
- reversa pagos;
- crea JournalEntry directo;
- confirma Bank Reconciliation;
- ejecuta rollback físico destructivo;
- duplica registros en reintentos;
- ejecuta importación final sin validación;
- ejecuta importación sensible sin approval;
- envía datos reales a IA externa;
- omite auditoría crítica.
```

---

## 28. Resultado esperado

```text id="dim-expected-result"
import type catalog definido
import templates definidas
upload seguro definido
SDS boundary definido
ImportJob definido
ImportBatch definido
ImportRow definido
ImportValidationError definido
ImportExecutionResult definido
ImportRollbackRecord definido
validación estructural definida
validación por fila definida
preview definido
dry-run definido
approval definido
ejecución por lotes definida
idempotencia por job y fila definida
errores exportables definidos
rollback lógico definido
audit definido
observability definida
OpenAPI preliminar definido
no public endpoints
no WordPress access
no raw SQL
no scripts
no macros
no storageKey exposure
no payment validation
no accounting execution
no bank reconciliation confirmation
no external AI with real data
```

---

## 29. Expediente actualizado

```text id="dim-expediente"
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
│   │   ├── 026-automation-workflows-basic/
│   │   ├── 027-dashboard-kpis/
│   │   └── 028-data-import-migration/
│   │       └── spec.md
```
