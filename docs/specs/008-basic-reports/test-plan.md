# Test Plan — Spec 008 Basic Reports and Operational Dashboards

## 1. Información del documento

| Campo                    | Valor                                                                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Proyecto                 | RESIDENT Core                                                                                                                        |
| Spec ID                  | 008                                                                                                                                  |
| Módulo                   | Basic Reports                                                                                                                        |
| Documento                | Test Plan                                                                                                                            |
| Ruta                     | `docs/specs/008-basic-reports/test-plan.md`                                                                                          |
| Versión                  | 0.1                                                                                                                                  |
| Estado                   | Borrador inicial                                                                                                                     |
| Fecha                    | 2026-07-14                                                                                                                           |
| Documento base           | `docs/specs/008-basic-reports/spec.md`                                                                                               |
| Plan técnico             | `docs/specs/008-basic-reports/plan.md`                                                                                               |
| Modelo de datos          | `docs/specs/008-basic-reports/data-model.md`                                                                                         |
| Contrato API             | `docs/specs/008-basic-reports/api-contract.md`                                                                                       |
| Depende de               | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements`, `007-audit` |
| Framework sugerido       | Jest + Supertest                                                                                                                     |
| Base de datos de pruebas | PostgreSQL test database                                                                                                             |
| Prioridad                | Alta                                                                                                                                 |

---

## 2. Propósito

Este documento define el plan de pruebas para el módulo `008-basic-reports`.

El objetivo es validar que RESIDENT Core pueda consultar y exportar reportes básicos de forma:

* read-only;
* tenant-scoped;
* autorizada;
* financieramente consistente;
* segura para datos personales;
* segura para exportación;
* auditable;
* paginada cuando aplique;
* trazable;
* compatible con los módulos fuente `001` a `007`.

Regla central:

```text id="tv437c"
Ningún reporte básico debe modificar datos fuente, mezclar tenants, exponer datos sin permiso, calcular dinero con float, exportar sin auditoría o presentar información financiera incompatible con cargos, pagos, balances y estados de cuenta.
```

---

## 3. Alcance de pruebas

### 3.1. Incluido

Este plan cubre:

```text id="vr2e5v"
Unit tests
Domain tests
Application tests
DTO validation tests
Permission policy tests
Report filter validation tests
Repository integration tests
API tests
Authorization tests
Multitenancy tests
Financial regression tests
Personal data protection tests
Export tests
CSV injection tests
Audit integration tests
Read-only behavior tests
Observability tests
OpenAPI tests
Smoke tests
```

---

### 3.2. No incluido

No cubre todavía:

```text id="or7mcd"
BI avanzado
OLAP
data warehouse
data lake
materialized views productivas
report_snapshots
scheduled_reports
report_templates
PDF avanzado
envío automático por email
envío automático por WhatsApp
IA para análisis financiero
forecast de recaudación
mora avanzada con intereses
cobranza automatizada
reportes contables formales
conciliación bancaria
facturación electrónica
reportes regulatorios avanzados
```

Estos temas quedan diferidos para specs futuras.

---

## 4. Estrategia general

El módulo se probará por capas:

```text id="rzfcoe"
1. Value objects.
2. DTOs y filtros.
3. Políticas de permisos.
4. Servicios de reportes.
5. Repositorios read-only.
6. Casos de uso.
7. API endpoints.
8. Exportación JSON/CSV.
9. Integración con auditoría.
10. Multitenancy.
11. Regresión financiera.
12. Seguridad de datos personales.
13. Observabilidad.
14. OpenAPI.
15. Smoke tests.
```

Reglas obligatorias:

```text id="xb2rwa"
1. Todo endpoint privado debe tener prueba 401 sin token.
2. Todo endpoint debe tener prueba 403 sin permiso.
3. Todo reporte debe probar tenant isolation.
4. Todo reporte financiero debe requerir reports.readFinancial.
5. Todo reporte de datos personales debe requerir reports.readPersonalData.
6. Toda exportación debe requerir reports.export o permiso específico.
7. Toda exportación financiera debe requerir reports.exportFinancial.
8. Toda exportación de datos personales debe requerir reports.exportPersonalData.
9. Toda exportación de actividad debe requerir reports.exportActivity.
10. Toda exportación debe generar evento audit.
11. Todo monto debe validarse como string decimal.
12. Ningún reporte debe usar float/double para dinero.
13. Ningún reporte debe modificar datos fuente.
14. Todo reporte detallado debe paginar.
15. Todo sortBy debe validarse contra whitelist.
16. CSV debe neutralizar formula injection.
17. Ninguna prueba debe usar datos reales.
```

---

## 5. Criterios globales de aceptación

La implementación cumple este plan si:

* todos los reportes se consultan bajo `/api/v1/tenant/reports`;
* todos los reportes son read-only;
* todos los reportes filtran por tenant activo;
* todos los reportes financieros requieren permiso financiero;
* todos los reportes personales requieren permiso de datos personales;
* todos los reportes de actividad requieren permiso de actividad o auditoría;
* los reportes detallados paginan;
* los filtros se validan;
* el ordenamiento usa whitelist;
* los montos se devuelven como string;
* no se usa float para dinero;
* cargos cancelados/reversados no cuentan como deuda activa;
* pagos reversados no cuentan como recaudación activa;
* allocations reversadas no cuentan como pagos aplicados;
* pagos no asignados se muestran separados;
* saldos se derivan de `unit_balances`;
* estados de cuenta se derivan de `account_statements`;
* exportación JSON funciona;
* exportación CSV funciona;
* CSV injection está neutralizado;
* exportaciones generan auditoría;
* logs no contienen export completo;
* OpenAPI está actualizado;
* pruebas pasan en CI.

---

## 6. Datos base de prueba

### 6.1. Tenants

Reusar fixtures de `001-tenants`:

```text id="jadcps"
tenantActiveA: villa-club-demo
tenantActiveB: altos-del-norte-demo
tenantSuspended: tenant-suspendido-demo
tenantArchived: tenant-archivado-demo
```

---

### 6.2. Usuarios

Reusar fixtures de `002-users-roles`:

```text id="ur44po"
platformAdmin
tenantAdminA
tenantAdminB
treasurerA
treasurerB
tenantAuditorA
tenantAuditorB
boardMemberA
boardMemberLimitedA
propertyOwnerUserA
residentUserA
userWithoutMembership
userWithoutPermission
disabledUser
anonymousUser
```

---

### 6.3. Permisos de reportes

Fixtures requeridos:

```text id="v6mbt4"
reportsReaderA
reportsExporterA
financialReportsReaderA
financialReportsExporterA
personalDataReportsReaderA
personalDataReportsExporterA
activityReportsReaderA
activityReportsExporterA
reportsNoPermissionUser
reportsReadOnlyUser
reportsFinancialReadOnlyUser
```

Permisos:

```text id="t6u9vk"
reports.read
reports.export
reports.readFinancial
reports.exportFinancial
reports.readPersonalData
reports.exportPersonalData
reports.readActivity
reports.exportActivity
audit.read
```

---

### 6.4. Unidades

Fixtures requeridos:

```text id="fl7uqo"
unitA1: Casa 01, tenantActiveA, active
unitA2: Casa 02, tenantActiveA, active
unitA3: Casa 03, tenantActiveA, inactive
unitA4: Casa 04, tenantActiveA, archived
unitB1: A-101, tenantActiveB, active
```

---

### 6.5. Personas y relaciones

Fixtures requeridos:

```text id="cq4ccd"
ownerPersonA1
residentPersonA1
tenantPersonA1
ownerPersonB1
ownershipA1Active
residencyA1Active
leaseA1Active
ownershipB1Active
```

---

### 6.6. Cargos

Fixtures requeridos:

```text id="wbjiut"
chargeA1Issued
chargeA1Paid
chargeA1Cancelled
chargeA1Reversed
chargeA2Overdue
chargeA2NotDue
chargeB1Issued
chargeAdjustmentA1Positive
chargeAdjustmentA1Negative
chargeReversalA1
```

---

### 6.7. Pagos

Fixtures requeridos:

```text id="v49g7t"
paymentA1Confirmed
paymentA1Allocated
paymentA1PartiallyAllocated
paymentA1Unallocated
paymentA1PendingValidation
paymentA1Reported
paymentA1Rejected
paymentA1Reversed
paymentB1Confirmed
paymentReceiptA1Uploaded
paymentReceiptA1Accepted
paymentReceiptA1Rejected
paymentAllocationA1Active
paymentAllocationA1Reversed
```

---

### 6.8. Estados de cuenta y balances

Fixtures requeridos:

```text id="vjyvm8"
unitBalanceA1WithDebt
unitBalanceA2Overdue
unitBalanceA3Credit
unitBalanceA4Stale
unitBalanceB1WithDebt
accountStatementA1Generated
accountStatementA1Published
accountStatementA1Closed
accountStatementA1Locked
accountStatementA1Superseded
accountStatementA1Archived
```

---

### 6.9. Auditoría

Fixtures requeridos de `007-audit`:

```text id="gvx2nh"
auditPaymentConfirmedA
auditChargeCreatedA
auditStatementGeneratedA
auditRoleAssignedA
auditAccessDeniedA
auditReportExportedA
auditPaymentConfirmedB
```

---

### 6.10. Datos prohibidos

No usar:

```text id="dgtlc2"
datos reales de residentes
datos reales de propietarios
cédulas reales
emails reales
teléfonos reales
direcciones reales
contraseñas
tokens
headers Authorization reales
comprobantes reales
archivos reales
exports reales
datos bancarios reales
payloads completos reales
```

---

## 7. Factories recomendadas

Crear factories:

```text id="sttwr3"
createReportContext()
createReportQuery()
createFinancialReportQuery()
createPropertyUnitsReportQuery()
createResidentsOwnersReportQuery()
createActivityReportQuery()
createExportReportQuery()
createReportResult()
createReportRow()
createOperationalOverviewFixture()
createFinancialOverviewFixture()
createPropertyUnitReportRow()
createResidentOwnerReportRow()
createPendingPaymentValidationRow()
createDelinquencyReportRow()
createActivityReportRow()
```

Ejemplo:

```text id="fivh2l"
createReportContext({
  tenantId: tenantActiveA.id,
  actorUserId: treasurerA.id,
  permissions: ["reports.readFinancial", "reports.exportFinancial"],
  reportKey: "financialOverview",
  traceId: "req_test_reports_financial"
})
```

---

# 8. Pruebas unitarias de value objects

## 8.1. ReportKey

Archivo sugerido:

```text id="s7x66g"
report-key.vo.spec.ts
```

| ID             | Caso                                | Resultado esperado |
| -------------- | ----------------------------------- | ------------------ |
| UT-REP-KEY-001 | `operationalOverview` válido        | válido             |
| UT-REP-KEY-002 | `financialOverview` válido          | válido             |
| UT-REP-KEY-003 | `propertyUnits` válido              | válido             |
| UT-REP-KEY-004 | `residentsOwners` válido            | válido             |
| UT-REP-KEY-005 | `chargesSummary` válido             | válido             |
| UT-REP-KEY-006 | `paymentsSummary` válido            | válido             |
| UT-REP-KEY-007 | `pendingPaymentValidation` válido   | válido             |
| UT-REP-KEY-008 | `balancesSummary` válido            | válido             |
| UT-REP-KEY-009 | `accountStatementsSummary` válido   | válido             |
| UT-REP-KEY-010 | `delinquency` válido                | válido             |
| UT-REP-KEY-011 | `collectionSummary` válido          | válido             |
| UT-REP-KEY-012 | `activity` válido                   | válido             |
| UT-REP-KEY-013 | reportKey vacío                     | error              |
| UT-REP-KEY-014 | reportKey desconocido               | error              |
| UT-REP-KEY-015 | reportKey con caracteres peligrosos | error              |

---

## 8.2. ReportCategory

Archivo sugerido:

```text id="ejzjlu"
report-category.vo.spec.ts
```

| ID             | Caso                  | Resultado esperado |
| -------------- | --------------------- | ------------------ |
| UT-REP-CAT-001 | `operational` válido  | válido             |
| UT-REP-CAT-002 | `financial` válido    | válido             |
| UT-REP-CAT-003 | `personalData` válido | válido             |
| UT-REP-CAT-004 | `activity` válido     | válido             |
| UT-REP-CAT-005 | `mixed` válido        | válido             |
| UT-REP-CAT-006 | categoría inválida    | error              |

---

## 8.3. ReportFormat

Archivo sugerido:

```text id="hpewpn"
report-format.vo.spec.ts
```

| ID             | Caso                | Resultado esperado |
| -------------- | ------------------- | ------------------ |
| UT-REP-FMT-001 | `json` válido       | válido             |
| UT-REP-FMT-002 | `csv` válido        | válido             |
| UT-REP-FMT-003 | `pdf` diferido      | error              |
| UT-REP-FMT-004 | `xlsx` no soportado | error              |
| UT-REP-FMT-005 | formato vacío       | error              |

---

## 8.4. ReportPeriod

Archivo sugerido:

```text id="be606b"
report-period.vo.spec.ts
```

| ID             | Caso                          | Resultado esperado |
| -------------- | ----------------------------- | ------------------ |
| UT-REP-PER-001 | periodCode `2026-07` válido   | válido             |
| UT-REP-PER-002 | periodCode `2026-7` inválido  | error              |
| UT-REP-PER-003 | periodCode `2026-13` inválido | error              |
| UT-REP-PER-004 | billingPeriodId válido        | válido             |
| UT-REP-PER-005 | ambos coinciden               | válido             |
| UT-REP-PER-006 | ambos no coinciden            | error              |

---

## 8.5. ReportDateRange

Archivo sugerido:

```text id="y6b5fc"
report-date-range.vo.spec.ts
```

| ID              | Caso                   | Resultado esperado |
| --------------- | ---------------------- | ------------------ |
| UT-REP-DATE-001 | dateFrom <= dateTo     | válido             |
| UT-REP-DATE-002 | dateFrom > dateTo      | error              |
| UT-REP-DATE-003 | fecha inválida         | error              |
| UT-REP-DATE-004 | rango máximo permitido | válido             |
| UT-REP-DATE-005 | rango demasiado amplio | error              |

---

## 8.6. ReportMoney

Archivo sugerido:

```text id="t5vp6y"
report-money.vo.spec.ts
```

| ID             | Caso                             | Resultado esperado |
| -------------- | -------------------------------- | ------------------ |
| UT-REP-MNY-001 | Decimal válido                   | válido             |
| UT-REP-MNY-002 | retorna string                   | válido             |
| UT-REP-MNY-003 | USD válido                       | válido             |
| UT-REP-MNY-004 | float prohibido                  | error              |
| UT-REP-MNY-005 | suma Decimal exacta              | correcto           |
| UT-REP-MNY-006 | redondeo explícito a 2 decimales | correcto           |

---

## 8.7. ReportPagination

Archivo sugerido:

```text id="uysnvx"
report-pagination.vo.spec.ts
```

| ID             | Caso                 | Resultado esperado |
| -------------- | -------------------- | ------------------ |
| UT-REP-PAG-001 | page default 1       | válido             |
| UT-REP-PAG-002 | pageSize default 20  | válido             |
| UT-REP-PAG-003 | pageSize 100         | válido             |
| UT-REP-PAG-004 | pageSize 101         | error              |
| UT-REP-PAG-005 | page 0               | error              |
| UT-REP-PAG-006 | totalPages calculado | correcto           |

---

## 8.8. ReportSort

Archivo sugerido:

```text id="pskotd"
report-sort.vo.spec.ts
```

| ID              | Caso                        | Resultado esperado |
| --------------- | --------------------------- | ------------------ |
| UT-REP-SORT-001 | sortBy permitido            | válido             |
| UT-REP-SORT-002 | sortBy arbitrario           | error              |
| UT-REP-SORT-003 | sortOrder asc               | válido             |
| UT-REP-SORT-004 | sortOrder desc              | válido             |
| UT-REP-SORT-005 | sortOrder inválido          | error              |
| UT-REP-SORT-006 | sort financiero sin permiso | error              |

---

# 9. Pruebas unitarias de entidades

## 9.1. ReportResult

Archivo sugerido:

```text id="oyupfh"
report-result.entity.spec.ts
```

| ID             | Caso                          | Resultado esperado |
| -------------- | ----------------------------- | ------------------ |
| UT-REP-RES-001 | Crear ReportResult operativo  | válido             |
| UT-REP-RES-002 | Crear ReportResult financiero | válido             |
| UT-REP-RES-003 | Sin tenantId                  | error              |
| UT-REP-RES-004 | Sin reportKey                 | error              |
| UT-REP-RES-005 | Sin generatedAt               | error              |
| UT-REP-RES-006 | Montos como string            | válido             |
| UT-REP-RES-007 | Incluye warnings              | válido             |
| UT-REP-RES-008 | No permite datos cross-tenant | error              |

---

## 9.2. ReportContext

Archivo sugerido:

```text id="vsdd7d"
report-context.entity.spec.ts
```

| ID             | Caso                | Resultado esperado                |
| -------------- | ------------------- | --------------------------------- |
| UT-REP-CTX-001 | Contexto válido     | válido                            |
| UT-REP-CTX-002 | Sin tenantId        | error                             |
| UT-REP-CTX-003 | Sin actorUserId     | válido para system según política |
| UT-REP-CTX-004 | Permisos incluidos  | válido                            |
| UT-REP-CTX-005 | TraceId incluido    | válido                            |
| UT-REP-CTX-006 | No contiene payload | válido                            |

---

## 9.3. ReportExport

Archivo sugerido:

```text id="legpnc"
report-export.entity.spec.ts
```

| ID             | Caso                                             | Resultado esperado |
| -------------- | ------------------------------------------------ | ------------------ |
| UT-REP-EXP-001 | Export JSON válido                               | válido             |
| UT-REP-EXP-002 | Export CSV válido                                | válido             |
| UT-REP-EXP-003 | Export sin reportKey                             | error              |
| UT-REP-EXP-004 | Export sin tenantId                              | error              |
| UT-REP-EXP-005 | rowCount >= 0                                    | válido             |
| UT-REP-EXP-006 | rowCount negativo                                | error              |
| UT-REP-EXP-007 | No contiene contenido completo en metadata audit | válido             |

---

# 10. Pruebas de DTOs y validación

## 10.1. CommonReportQueryDto

Archivo sugerido:

```text id="de0f85"
common-report-query.dto.spec.ts
```

| ID              | Caso                | Resultado esperado |
| --------------- | ------------------- | ------------------ |
| DTO-REP-COM-001 | Query vacía válida  | defaults           |
| DTO-REP-COM-002 | periodCode válido   | válido             |
| DTO-REP-COM-003 | periodCode inválido | 422                |
| DTO-REP-COM-004 | dateFrom > dateTo   | 422                |
| DTO-REP-COM-005 | pageSize > 100      | 422                |
| DTO-REP-COM-006 | sortBy no permitido | 422                |
| DTO-REP-COM-007 | sortOrder inválido  | 422                |

---

## 10.2. FinancialReportQueryDto

Archivo sugerido:

```text id="kmhrmq"
financial-report-query.dto.spec.ts
```

| ID              | Caso                             | Resultado esperado |
| --------------- | -------------------------------- | ------------------ |
| DTO-REP-FIN-001 | includeReversed default false    | válido             |
| DTO-REP-FIN-002 | includeCancelled default false   | válido             |
| DTO-REP-FIN-003 | includeUnallocated default true  | válido             |
| DTO-REP-FIN-004 | paymentMethod válido             | válido             |
| DTO-REP-FIN-005 | minOverdueBalance string decimal | válido             |
| DTO-REP-FIN-006 | minOverdueBalance float inválido | error              |
| DTO-REP-FIN-007 | propertyUnitId UUID inválido     | error              |

---

## 10.3. ExportReportQueryDto

Archivo sugerido:

```text id="dlwdmn"
export-report-query.dto.spec.ts
```

| ID              | Caso                | Resultado esperado |
| --------------- | ------------------- | ------------------ |
| DTO-REP-EXP-001 | format json         | válido             |
| DTO-REP-EXP-002 | format csv          | válido             |
| DTO-REP-EXP-003 | format pdf          | 422                |
| DTO-REP-EXP-004 | filtros válidos     | válido             |
| DTO-REP-EXP-005 | date range inválido | 422                |
| DTO-REP-EXP-006 | reportKey inválido  | 422/404            |

---

# 11. Pruebas de servicios

## 11.1. ReportPermissionPolicyService

Archivo sugerido:

```text id="lc2c3z"
report-permission-policy.service.spec.ts
```

| ID               | Caso                                                | Resultado esperado   |
| ---------------- | --------------------------------------------------- | -------------------- |
| SRV-REP-PERM-001 | operationalOverview requiere reports.read           | permitido            |
| SRV-REP-PERM-002 | financialOverview requiere reports.readFinancial    | permitido            |
| SRV-REP-PERM-003 | financial sin permiso                               | denegado             |
| SRV-REP-PERM-004 | residentsOwners requiere reports.readPersonalData   | permitido            |
| SRV-REP-PERM-005 | personal sin permiso                                | denegado             |
| SRV-REP-PERM-006 | activity requiere reports.readActivity              | permitido            |
| SRV-REP-PERM-007 | activity permite audit.read                         | permitido            |
| SRV-REP-PERM-008 | export requiere reports.export                      | denegado sin permiso |
| SRV-REP-PERM-009 | financial export requiere reports.exportFinancial   | denegado sin permiso |
| SRV-REP-PERM-010 | personal export requiere reports.exportPersonalData | denegado sin permiso |

---

## 11.2. ReportFilterValidatorService

Archivo sugerido:

```text id="wqgimd"
report-filter-validator.service.spec.ts
```

| ID                 | Caso                                   | Resultado esperado |
| ------------------ | -------------------------------------- | ------------------ |
| SRV-REP-FILTER-001 | Valida periodCode                      | correcto           |
| SRV-REP-FILTER-002 | Valida billingPeriodId del tenant      | correcto           |
| SRV-REP-FILTER-003 | Rechaza billingPeriodId de otro tenant | error              |
| SRV-REP-FILTER-004 | Valida date range                      | correcto           |
| SRV-REP-FILTER-005 | Rechaza rango amplio                   | error              |
| SRV-REP-FILTER-006 | Valida sort whitelist por reporte      | correcto           |
| SRV-REP-FILTER-007 | Rechaza sort arbitrario                | error              |
| SRV-REP-FILTER-008 | Valida pageSize                        | correcto           |

---

## 11.3. ReportMoneyService

Archivo sugerido:

```text id="wgcrtk"
report-money.service.spec.ts
```

| ID              | Caso                                        | Resultado esperado |
| --------------- | ------------------------------------------- | ------------------ |
| SRV-REP-MNY-001 | Suma Decimal exacta                         | correcto           |
| SRV-REP-MNY-002 | Resta Decimal exacta                        | correcto           |
| SRV-REP-MNY-003 | Divide para collectionRate                  | correcto           |
| SRV-REP-MNY-004 | chargesIssued 0 produce collectionRate null | correcto           |
| SRV-REP-MNY-005 | Convierte monto a string                    | correcto           |
| SRV-REP-MNY-006 | Rechaza float                               | error              |

---

## 11.4. ReportExportService

Archivo sugerido:

```text id="mq9298"
report-export.service.spec.ts
```

| ID              | Caso                               | Resultado esperado |
| --------------- | ---------------------------------- | ------------------ |
| SRV-REP-EXP-001 | Export JSON válido                 | éxito              |
| SRV-REP-EXP-002 | Export CSV válido                  | éxito              |
| SRV-REP-EXP-003 | Formato inválido                   | error              |
| SRV-REP-EXP-004 | Aplica columnas permitidas         | correcto           |
| SRV-REP-EXP-005 | No exporta columnas no autorizadas | correcto           |
| SRV-REP-EXP-006 | CSV neutraliza `=`                 | correcto           |
| SRV-REP-EXP-007 | CSV neutraliza `+`                 | correcto           |
| SRV-REP-EXP-008 | CSV neutraliza `-`                 | correcto           |
| SRV-REP-EXP-009 | CSV neutraliza `@`                 | correcto           |
| SRV-REP-EXP-010 | Export demasiado grande            | error              |

---

## 11.5. ReportAuditService

Archivo sugerido:

```text id="o3rig2"
report-audit.service.spec.ts
```

| ID              | Caso                                          | Resultado esperado |
| --------------- | --------------------------------------------- | ------------------ |
| SRV-REP-AUD-001 | Audita report.exported                        | éxito              |
| SRV-REP-AUD-002 | Audita financialReport.exported               | éxito              |
| SRV-REP-AUD-003 | Audita personalDataReport.exported            | éxito              |
| SRV-REP-AUD-004 | Audita activityReport.exported                | éxito              |
| SRV-REP-AUD-005 | Audita report.accessDenied                    | éxito              |
| SRV-REP-AUD-006 | Metadata no contiene resultado completo       | correcto           |
| SRV-REP-AUD-007 | Metadata contiene reportKey, format, rowCount | correcto           |

---

# 12. Pruebas de casos de uso

## 12.1. GetOperationalOverviewReportUseCase

| ID             | Caso                                      | Resultado esperado |
| -------------- | ----------------------------------------- | ------------------ |
| APP-REP-OP-001 | Usuario con reports.read consulta resumen | éxito              |
| APP-REP-OP-002 | Sin reports.read                          | 403                |
| APP-REP-OP-003 | Solo cuenta tenant activo                 | correcto           |
| APP-REP-OP-004 | No expone datos personales detallados     | correcto           |
| APP-REP-OP-005 | Incluye generatedAt                       | correcto           |
| APP-REP-OP-006 | Tenant sin datos retorna ceros            | correcto           |

---

## 12.2. GetFinancialOverviewReportUseCase

| ID              | Caso                                       | Resultado esperado |
| --------------- | ------------------------------------------ | ------------------ |
| APP-REP-FIN-001 | Usuario con reports.readFinancial consulta | éxito              |
| APP-REP-FIN-002 | Sin reports.readFinancial                  | 403                |
| APP-REP-FIN-003 | Montos como string                         | correcto           |
| APP-REP-FIN-004 | Excluye cargos cancelados                  | correcto           |
| APP-REP-FIN-005 | Excluye cargos reversados                  | correcto           |
| APP-REP-FIN-006 | Excluye pagos reversados                   | correcto           |
| APP-REP-FIN-007 | Separa pagos no asignados                  | correcto           |
| APP-REP-FIN-008 | collectionRate correcto                    | correcto           |
| APP-REP-FIN-009 | chargesIssued 0 produce null               | correcto           |
| APP-REP-FIN-010 | Saldos stale generan warning               | correcto           |

---

## 12.3. GetPropertyUnitsReportUseCase

| ID                | Caso                                     | Resultado esperado |
| ----------------- | ---------------------------------------- | ------------------ |
| APP-REP-UNITS-001 | Con reports.read lista unidades          | éxito              |
| APP-REP-UNITS-002 | Sin reports.read                         | 403                |
| APP-REP-UNITS-003 | Sin permiso financiero no incluye saldos | correcto           |
| APP-REP-UNITS-004 | Con permiso financiero incluye saldos    | correcto           |
| APP-REP-UNITS-005 | Filtra por status                        | correcto           |
| APP-REP-UNITS-006 | Filtra hasDebt                           | correcto           |
| APP-REP-UNITS-007 | Ordena por unitCode                      | correcto           |
| APP-REP-UNITS-008 | Orden financiero sin permiso             | 403/422            |
| APP-REP-UNITS-009 | Pagina                                   | meta correcto      |

---

## 12.4. GetResidentsOwnersReportUseCase

| ID                 | Caso                                  | Resultado esperado |
| ------------------ | ------------------------------------- | ------------------ |
| APP-REP-PEOPLE-001 | Con reports.readPersonalData consulta | éxito              |
| APP-REP-PEOPLE-002 | Sin reports.readPersonalData          | 403                |
| APP-REP-PEOPLE-003 | Filtra relationshipType owner         | correcto           |
| APP-REP-PEOPLE-004 | Filtra propertyUnitId propio          | correcto           |
| APP-REP-PEOPLE-005 | propertyUnitId otro tenant            | 403/422            |
| APP-REP-PEOPLE-006 | No expone cédula/email/teléfono       | correcto           |
| APP-REP-PEOPLE-007 | Pagina                                | correcto           |

---

## 12.5. GetChargesSummaryReportUseCase

| ID              | Caso                                             | Resultado esperado |
| --------------- | ------------------------------------------------ | ------------------ |
| APP-REP-CHG-001 | Consulta por periodo                             | éxito              |
| APP-REP-CHG-002 | Sin permiso financiero                           | 403                |
| APP-REP-CHG-003 | Agrupa por concepto                              | correcto           |
| APP-REP-CHG-004 | Cuenta cancelados                                | correcto           |
| APP-REP-CHG-005 | Cuenta reversados                                | correcto           |
| APP-REP-CHG-006 | activeChargesTotal excluye cancelados/reversados | correcto           |
| APP-REP-CHG-007 | Montos como string                               | correcto           |

---

## 12.6. GetPaymentsSummaryReportUseCase

| ID              | Caso                                   | Resultado esperado |
| --------------- | -------------------------------------- | ------------------ |
| APP-REP-PAY-001 | Consulta por rango de fechas           | éxito              |
| APP-REP-PAY-002 | Sin permiso financiero                 | 403                |
| APP-REP-PAY-003 | Suma confirmed                         | correcto           |
| APP-REP-PAY-004 | Suma pendingValidation                 | correcto           |
| APP-REP-PAY-005 | Suma rejected                          | correcto           |
| APP-REP-PAY-006 | Excluye reversed de recaudación activa | correcto           |
| APP-REP-PAY-007 | Separa unallocated                     | correcto           |
| APP-REP-PAY-008 | Agrupa por método                      | correcto           |
| APP-REP-PAY-009 | No incluye comprobante completo        | correcto           |

---

## 12.7. GetPendingPaymentValidationReportUseCase

| ID               | Caso                            | Resultado esperado |
| ---------------- | ------------------------------- | ------------------ |
| APP-REP-PEND-001 | Lista pagos pendingValidation   | éxito              |
| APP-REP-PEND-002 | Lista pagos reported            | éxito              |
| APP-REP-PEND-003 | No incluye confirmados          | correcto           |
| APP-REP-PEND-004 | Calcula daysPending             | correcto           |
| APP-REP-PEND-005 | No incluye comprobante completo | correcto           |
| APP-REP-PEND-006 | Filtra por método               | correcto           |
| APP-REP-PEND-007 | Pagina                          | correcto           |

---

## 12.8. GetBalancesSummaryReportUseCase

| ID              | Caso                       | Resultado esperado |
| --------------- | -------------------------- | ------------------ |
| APP-REP-BAL-001 | Suma outstanding           | correcto           |
| APP-REP-BAL-002 | Suma overdue               | correcto           |
| APP-REP-BAL-003 | Suma notDue                | correcto           |
| APP-REP-BAL-004 | Suma credit                | correcto           |
| APP-REP-BAL-005 | Suma unallocated           | correcto           |
| APP-REP-BAL-006 | Cuenta unitsWithDebt       | correcto           |
| APP-REP-BAL-007 | Cuenta stale balances      | correcto           |
| APP-REP-BAL-008 | Warning con stale balances | correcto           |

---

## 12.9. GetAccountStatementsSummaryReportUseCase

| ID               | Caso                              | Resultado esperado |
| ---------------- | --------------------------------- | ------------------ |
| APP-REP-STMT-001 | Cuenta generated                  | correcto           |
| APP-REP-STMT-002 | Cuenta published                  | correcto           |
| APP-REP-STMT-003 | Cuenta closed                     | correcto           |
| APP-REP-STMT-004 | Cuenta locked                     | correcto           |
| APP-REP-STMT-005 | Superseded no cuenta como vigente | correcto           |
| APP-REP-STMT-006 | Archived excluido salvo filtro    | correcto           |
| APP-REP-STMT-007 | Suma closingBalance               | correcto           |
| APP-REP-STMT-008 | Suma creditBalance                | correcto           |

---

## 12.10. GetDelinquencyReportUseCase

| ID                 | Caso                                  | Resultado esperado |
| ------------------ | ------------------------------------- | ------------------ |
| APP-REP-DELINQ-001 | Lista unidades con overdueBalance > 0 | éxito              |
| APP-REP-DELINQ-002 | No incluye unidades sin mora          | correcto           |
| APP-REP-DELINQ-003 | Calcula oldestDueDate                 | correcto           |
| APP-REP-DELINQ-004 | Calcula daysOverdue                   | correcto           |
| APP-REP-DELINQ-005 | Cuenta pendingCharges                 | correcto           |
| APP-REP-DELINQ-006 | Excluye cargos cancelados             | correcto           |
| APP-REP-DELINQ-007 | Excluye cargos reversados             | correcto           |
| APP-REP-DELINQ-008 | Muestra último pago                   | correcto           |
| APP-REP-DELINQ-009 | Pagina                                | correcto           |

---

## 12.11. GetCollectionSummaryReportUseCase

| ID               | Caso                                        | Resultado esperado |
| ---------------- | ------------------------------------------- | ------------------ |
| APP-REP-COLL-001 | Suma totalConfirmedPayments                 | correcto           |
| APP-REP-COLL-002 | Suma totalAllocatedPayments                 | correcto           |
| APP-REP-COLL-003 | Suma totalUnallocatedPayments               | correcto           |
| APP-REP-COLL-004 | Calcula collectionRate                      | correcto           |
| APP-REP-COLL-005 | chargesIssued 0 retorna collectionRate null | correcto           |
| APP-REP-COLL-006 | Agrupa por paymentMethod                    | correcto           |
| APP-REP-COLL-007 | Excluye pagos reversados                    | correcto           |

---

## 12.12. GetAdministrativeActivityReportUseCase

| ID              | Caso                                  | Resultado esperado |
| --------------- | ------------------------------------- | ------------------ |
| APP-REP-ACT-001 | Con reports.readActivity consulta     | éxito              |
| APP-REP-ACT-002 | Con audit.read consulta               | éxito              |
| APP-REP-ACT-003 | Sin permiso                           | 403                |
| APP-REP-ACT-004 | Filtra por date range                 | correcto           |
| APP-REP-ACT-005 | Filtra por action                     | correcto           |
| APP-REP-ACT-006 | Filtra por actorUserId                | correcto           |
| APP-REP-ACT-007 | No expone oldValue/newValue completos | correcto           |
| APP-REP-ACT-008 | Pagina                                | correcto           |

---

## 12.13. ExportReportUseCase

| ID              | Caso                                        | Resultado esperado |
| --------------- | ------------------------------------------- | ------------------ |
| APP-REP-EXP-001 | Export operational JSON                     | éxito              |
| APP-REP-EXP-002 | Export operational CSV                      | éxito              |
| APP-REP-EXP-003 | Export financial requiere exportFinancial   | 403 sin permiso    |
| APP-REP-EXP-004 | Export personal requiere exportPersonalData | 403 sin permiso    |
| APP-REP-EXP-005 | Export activity requiere exportActivity     | 403 sin permiso    |
| APP-REP-EXP-006 | Export audita evento correcto               | pasa               |
| APP-REP-EXP-007 | Export demasiado grande                     | 422                |
| APP-REP-EXP-008 | CSV seguro                                  | pasa               |
| APP-REP-EXP-009 | No exporta campos no autorizados            | pasa               |

---

# 13. Pruebas de integración de repositorios

## 13.1. Operational overview repository

| ID             | Caso                           | Resultado esperado |
| -------------- | ------------------------------ | ------------------ |
| INT-REP-OP-001 | Cuenta unidades por estado     | correcto           |
| INT-REP-OP-002 | Cuenta propietarios activos    | correcto           |
| INT-REP-OP-003 | Cuenta residentes activos      | correcto           |
| INT-REP-OP-004 | Cuenta usuarios activos        | correcto           |
| INT-REP-OP-005 | Cuenta invitaciones pendientes | correcto           |
| INT-REP-OP-006 | Tenant sin datos retorna ceros | correcto           |
| INT-REP-OP-007 | No incluye Tenant B            | correcto           |

---

## 13.2. Financial overview repository

| ID              | Caso                               | Resultado esperado |
| --------------- | ---------------------------------- | ------------------ |
| INT-REP-FIN-001 | Suma cargos emitidos               | correcto           |
| INT-REP-FIN-002 | Excluye cancelados de deuda activa | correcto           |
| INT-REP-FIN-003 | Excluye reversados de deuda activa | correcto           |
| INT-REP-FIN-004 | Suma pagos confirmados             | correcto           |
| INT-REP-FIN-005 | Excluye pagos reversados           | correcto           |
| INT-REP-FIN-006 | Suma allocations activas           | correcto           |
| INT-REP-FIN-007 | Excluye allocations reversadas     | correcto           |
| INT-REP-FIN-008 | Lee unit_balances                  | correcto           |
| INT-REP-FIN-009 | No incluye Tenant B                | correcto           |

---

## 13.3. Property units repository

| ID                | Caso                         | Resultado esperado |
| ----------------- | ---------------------------- | ------------------ |
| INT-REP-UNITS-001 | Lista unidades Tenant A      | correcto           |
| INT-REP-UNITS-002 | Excluye Tenant B             | correcto           |
| INT-REP-UNITS-003 | Filtra status                | correcto           |
| INT-REP-UNITS-004 | Filtra hasDebt               | correcto           |
| INT-REP-UNITS-005 | Incluye owner/resident count | correcto           |
| INT-REP-UNITS-006 | Incluye saldos con permiso   | correcto           |
| INT-REP-UNITS-007 | Pagina                       | correcto           |

---

## 13.4. Residents owners repository

| ID                 | Caso                                | Resultado esperado |
| ------------------ | ----------------------------------- | ------------------ |
| INT-REP-PEOPLE-001 | Lista propietarios activos          | correcto           |
| INT-REP-PEOPLE-002 | Lista residentes activos            | correcto           |
| INT-REP-PEOPLE-003 | Filtra relationshipType             | correcto           |
| INT-REP-PEOPLE-004 | Filtra unidad                       | correcto           |
| INT-REP-PEOPLE-005 | Excluye ended si includeEnded false | correcto           |
| INT-REP-PEOPLE-006 | Incluye ended si includeEnded true  | correcto           |
| INT-REP-PEOPLE-007 | Excluye Tenant B                    | correcto           |

---

## 13.5. Charges summary repository

| ID              | Caso                    | Resultado esperado |
| --------------- | ----------------------- | ------------------ |
| INT-REP-CHG-001 | Agrupa por concepto     | correcto           |
| INT-REP-CHG-002 | Suma chargesTotal       | correcto           |
| INT-REP-CHG-003 | Cuenta issued           | correcto           |
| INT-REP-CHG-004 | Cuenta cancelled        | correcto           |
| INT-REP-CHG-005 | Cuenta reversed         | correcto           |
| INT-REP-CHG-006 | Suma activeChargesTotal | correcto           |
| INT-REP-CHG-007 | Excluye Tenant B        | correcto           |

---

## 13.6. Payments summary repository

| ID              | Caso                                   | Resultado esperado |
| --------------- | -------------------------------------- | ------------------ |
| INT-REP-PAY-001 | Suma confirmed                         | correcto           |
| INT-REP-PAY-002 | Suma pendingValidation                 | correcto           |
| INT-REP-PAY-003 | Suma rejected                          | correcto           |
| INT-REP-PAY-004 | Cuenta reversed                        | correcto           |
| INT-REP-PAY-005 | Excluye reversed de recaudación activa | correcto           |
| INT-REP-PAY-006 | Suma allocated                         | correcto           |
| INT-REP-PAY-007 | Calcula unallocated                    | correcto           |
| INT-REP-PAY-008 | Agrupa por método                      | correcto           |
| INT-REP-PAY-009 | Excluye Tenant B                       | correcto           |

---

## 13.7. Pending validation repository

| ID               | Caso                       | Resultado esperado |
| ---------------- | -------------------------- | ------------------ |
| INT-REP-PEND-001 | Lista reported             | correcto           |
| INT-REP-PEND-002 | Lista pendingValidation    | correcto           |
| INT-REP-PEND-003 | Excluye confirmed          | correcto           |
| INT-REP-PEND-004 | Excluye rejected           | correcto           |
| INT-REP-PEND-005 | Calcula daysPending        | correcto           |
| INT-REP-PEND-006 | No carga archivo de recibo | correcto           |
| INT-REP-PEND-007 | Excluye Tenant B           | correcto           |

---

## 13.8. Balances summary repository

| ID              | Caso                    | Resultado esperado |
| --------------- | ----------------------- | ------------------ |
| INT-REP-BAL-001 | Suma outstanding        | correcto           |
| INT-REP-BAL-002 | Suma overdue            | correcto           |
| INT-REP-BAL-003 | Suma notDue             | correcto           |
| INT-REP-BAL-004 | Suma credit             | correcto           |
| INT-REP-BAL-005 | Suma unallocatedPayment | correcto           |
| INT-REP-BAL-006 | Cuenta stale            | correcto           |
| INT-REP-BAL-007 | Excluye Tenant B        | correcto           |

---

## 13.9. Account statements summary repository

| ID               | Caso                          | Resultado esperado |
| ---------------- | ----------------------------- | ------------------ |
| INT-REP-STMT-001 | Cuenta generated              | correcto           |
| INT-REP-STMT-002 | Cuenta published              | correcto           |
| INT-REP-STMT-003 | Cuenta closed                 | correcto           |
| INT-REP-STMT-004 | Cuenta locked                 | correcto           |
| INT-REP-STMT-005 | Cuenta superseded separado    | correcto           |
| INT-REP-STMT-006 | Archived excluido por defecto | correcto           |
| INT-REP-STMT-007 | Suma closingBalance           | correcto           |
| INT-REP-STMT-008 | Excluye Tenant B              | correcto           |

---

## 13.10. Activity repository

| ID              | Caso                         | Resultado esperado |
| --------------- | ---------------------------- | ------------------ |
| INT-REP-ACT-001 | Lista audit logs Tenant A    | correcto           |
| INT-REP-ACT-002 | Excluye Tenant B             | correcto           |
| INT-REP-ACT-003 | Filtra por action            | correcto           |
| INT-REP-ACT-004 | Filtra por category          | correcto           |
| INT-REP-ACT-005 | Filtra por actorUserId       | correcto           |
| INT-REP-ACT-006 | No retorna oldValue/newValue | correcto           |
| INT-REP-ACT-007 | Pagina                       | correcto           |

---

# 14. Pruebas API

## 14.1. Operational Overview API

Endpoint:

```text id="jd23f7"
GET /api/v1/tenant/reports/operational-overview
```

| ID             | Caso                         | Resultado esperado |
| -------------- | ---------------------------- | ------------------ |
| API-REP-OP-001 | Usuario autorizado           | 200                |
| API-REP-OP-002 | Sin token                    | 401                |
| API-REP-OP-003 | Sin membership               | 403                |
| API-REP-OP-004 | Sin reports.read             | 403                |
| API-REP-OP-005 | Tenant A no incluye Tenant B | pasa               |
| API-REP-OP-006 | Response shape correcto      | pasa               |

---

## 14.2. Financial Overview API

Endpoint:

```text id="g88cke"
GET /api/v1/tenant/reports/financial-overview
```

| ID              | Caso                              | Resultado esperado |
| --------------- | --------------------------------- | ------------------ |
| API-REP-FIN-001 | Usuario con reports.readFinancial | 200                |
| API-REP-FIN-002 | Sin token                         | 401                |
| API-REP-FIN-003 | Sin reports.readFinancial         | 403                |
| API-REP-FIN-004 | periodCode válido                 | 200                |
| API-REP-FIN-005 | periodCode inválido               | 422                |
| API-REP-FIN-006 | billingPeriodId otro tenant       | 403/422            |
| API-REP-FIN-007 | Montos como string                | pasa               |
| API-REP-FIN-008 | Warning stale balances            | pasa               |

---

## 14.3. Property Units API

Endpoint:

```text id="nxn7bl"
GET /api/v1/tenant/reports/property-units
```

| ID                | Caso                                   | Resultado esperado                |
| ----------------- | -------------------------------------- | --------------------------------- |
| API-REP-UNITS-001 | Usuario con reports.read               | 200                               |
| API-REP-UNITS-002 | Sin reports.read                       | 403                               |
| API-REP-UNITS-003 | includeBalances sin permiso financiero | omite saldos o 403 según política |
| API-REP-UNITS-004 | includeBalances con permiso financiero | incluye saldos                    |
| API-REP-UNITS-005 | hasDebt filtra                         | correcto                          |
| API-REP-UNITS-006 | pageSize > 100                         | 422                               |
| API-REP-UNITS-007 | sortBy inválido                        | 422                               |
| API-REP-UNITS-008 | Tenant isolation                       | pasa                              |

---

## 14.4. Residents Owners API

Endpoint:

```text id="d9mke5"
GET /api/v1/tenant/reports/residents-owners
```

| ID                 | Caso                                    | Resultado esperado            |
| ------------------ | --------------------------------------- | ----------------------------- |
| API-REP-PEOPLE-001 | Con reports.readPersonalData            | 200                           |
| API-REP-PEOPLE-002 | Sin permiso personal                    | 403                           |
| API-REP-PEOPLE-003 | No expone identificación/email/teléfono | pasa                          |
| API-REP-PEOPLE-004 | propertyUnitId otro tenant              | 403/422                       |
| API-REP-PEOPLE-005 | includeEnded false                      | excluye relaciones terminadas |
| API-REP-PEOPLE-006 | Paginación                              | correcta                      |
| API-REP-PEOPLE-007 | Tenant isolation                        | pasa                          |

---

## 14.5. Financial report APIs

Endpoints:

```text id="ggu58o"
GET /api/v1/tenant/reports/charges/summary
GET /api/v1/tenant/reports/payments/summary
GET /api/v1/tenant/reports/payments/pending-validation
GET /api/v1/tenant/reports/balances/summary
GET /api/v1/tenant/reports/account-statements/summary
GET /api/v1/tenant/reports/delinquency
GET /api/v1/tenant/reports/collections/summary
```

| ID                 | Caso                                 | Resultado esperado |
| ------------------ | ------------------------------------ | ------------------ |
| API-REP-FINSET-001 | Cada endpoint con permiso financiero | 200                |
| API-REP-FINSET-002 | Cada endpoint sin permiso financiero | 403                |
| API-REP-FINSET-003 | Filtros válidos                      | 200                |
| API-REP-FINSET-004 | Filtros inválidos                    | 422                |
| API-REP-FINSET-005 | Montos como string                   | pasa               |
| API-REP-FINSET-006 | Tenant isolation                     | pasa               |
| API-REP-FINSET-007 | Sin payloads sensibles               | pasa               |

---

## 14.6. Activity API

Endpoint:

```text id="trpwgj"
GET /api/v1/tenant/reports/activity
```

| ID              | Caso                        | Resultado esperado |
| --------------- | --------------------------- | ------------------ |
| API-REP-ACT-001 | Con reports.readActivity    | 200                |
| API-REP-ACT-002 | Con audit.read              | 200                |
| API-REP-ACT-003 | Sin permisos                | 403                |
| API-REP-ACT-004 | Filtra por action           | correcto           |
| API-REP-ACT-005 | Filtra por category         | correcto           |
| API-REP-ACT-006 | No expone oldValue/newValue | pasa               |
| API-REP-ACT-007 | Tenant isolation            | pasa               |

---

## 14.7. Export API

Endpoint:

```text id="p5ffht"
GET /api/v1/tenant/reports/{reportKey}/export
```

| ID              | Caso                                           | Resultado esperado |
| --------------- | ---------------------------------------------- | ------------------ |
| API-REP-EXP-001 | Export operational JSON                        | 200                |
| API-REP-EXP-002 | Export operational CSV                         | 200                |
| API-REP-EXP-003 | Export sin reports.export                      | 403                |
| API-REP-EXP-004 | Export financial sin reports.exportFinancial   | 403                |
| API-REP-EXP-005 | Export personal sin reports.exportPersonalData | 403                |
| API-REP-EXP-006 | Export activity sin reports.exportActivity     | 403                |
| API-REP-EXP-007 | format pdf                                     | 422                |
| API-REP-EXP-008 | reportKey inválido                             | 404/422            |
| API-REP-EXP-009 | export demasiado grande                        | 422                |
| API-REP-EXP-010 | CSV injection neutralizado                     | pasa               |
| API-REP-EXP-011 | Export genera audit event                      | pasa               |
| API-REP-EXP-012 | Export no incluye Tenant B                     | pasa               |

---

# 15. Pruebas de autorización

## 15.1. Permisos generales

| ID           | Usuario               | Endpoint             | Resultado |
| ------------ | --------------------- | -------------------- | --------- |
| AUTH-REP-001 | reportsReaderA        | operational overview | 200       |
| AUTH-REP-002 | userWithoutPermission | operational overview | 403       |
| AUTH-REP-003 | anonymousUser         | operational overview | 401       |
| AUTH-REP-004 | disabledUser          | operational overview | 403       |
| AUTH-REP-005 | userWithoutMembership | operational overview | 403       |

---

## 15.2. Permisos financieros

| ID               | Usuario                           | Endpoint           | Resultado |
| ---------------- | --------------------------------- | ------------------ | --------- |
| AUTH-REP-FIN-001 | financialReportsReaderA           | financial overview | 200       |
| AUTH-REP-FIN-002 | reportsReaderA sin financial      | financial overview | 403       |
| AUTH-REP-FIN-003 | tenantAuditorA con financial      | delinquency        | 200       |
| AUTH-REP-FIN-004 | boardMemberLimitedA sin financial | delinquency        | 403       |

---

## 15.3. Permisos personales

| ID               | Usuario                     | Endpoint         | Resultado |
| ---------------- | --------------------------- | ---------------- | --------- |
| AUTH-REP-PER-001 | personalDataReportsReaderA  | residents owners | 200       |
| AUTH-REP-PER-002 | reportsReaderA sin personal | residents owners | 403       |
| AUTH-REP-PER-003 | treasurerA sin personal     | residents owners | 403       |

---

## 15.4. Permisos de actividad

| ID               | Usuario                           | Endpoint | Resultado |
| ---------------- | --------------------------------- | -------- | --------- |
| AUTH-REP-ACT-001 | activityReportsReaderA            | activity | 200       |
| AUTH-REP-ACT-002 | tenantAuditorA con audit.read     | activity | 200       |
| AUTH-REP-ACT-003 | reportsReaderA sin activity/audit | activity | 403       |

---

## 15.5. Permisos de exportación

| ID               | Usuario                                           | Endpoint           | Resultado |
| ---------------- | ------------------------------------------------- | ------------------ | --------- |
| AUTH-REP-EXP-001 | reportsExporterA                                  | export operational | 200       |
| AUTH-REP-EXP-002 | reportsReaderA sin export                         | export operational | 403       |
| AUTH-REP-EXP-003 | financialReportsExporterA                         | export financial   | 200       |
| AUTH-REP-EXP-004 | financialReportsReaderA sin exportFinancial       | export financial   | 403       |
| AUTH-REP-EXP-005 | personalDataReportsExporterA                      | export personal    | 200       |
| AUTH-REP-EXP-006 | personalDataReportsReaderA sin exportPersonalData | export personal    | 403       |

---

## 15.6. Separation of duties

| ID               | Caso                                                           | Resultado esperado |
| ---------------- | -------------------------------------------------------------- | ------------------ |
| AUTH-REP-SOD-001 | reports.read no implica reports.export                         | 403                |
| AUTH-REP-SOD-002 | reports.read no implica reports.readFinancial                  | 403                |
| AUTH-REP-SOD-003 | reports.readFinancial no implica reports.exportFinancial       | 403                |
| AUTH-REP-SOD-004 | reports.readPersonalData no implica reports.exportPersonalData | 403                |
| AUTH-REP-SOD-005 | reports.readActivity no implica reports.exportActivity         | 403                |

---

# 16. Pruebas multitenant

| ID | Caso | Resultado esperado |
|---|---|
| MT-REP-001 | Tenant A operational no incluye Tenant B | pasa |
| MT-REP-002 | Tenant A financial no incluye cargos B | pasa |
| MT-REP-003 | Tenant A payments no incluye pagos B | pasa |
| MT-REP-004 | Tenant A balances no incluye balances B | pasa |
| MT-REP-005 | Tenant A statements no incluye statements B | pasa |
| MT-REP-006 | Tenant A activity no incluye audit logs B | pasa |
| MT-REP-007 | Tenant A export no incluye Tenant B | pasa |
| MT-REP-008 | propertyUnitId de Tenant B en Tenant A | 403/422 |
| MT-REP-009 | billingPeriodId de Tenant B en Tenant A | 403/422 |
| MT-REP-010 | tenantId enviado por query es ignorado/rechazado | 422 |

---

# 17. Financial regression tests

## 17.1. Cargos

| ID              | Caso                                 | Resultado esperado |
| --------------- | ------------------------------------ | ------------------ |
| FIN-REP-CHG-001 | Cargo issued suma en chargesIssued   | correcto           |
| FIN-REP-CHG-002 | Cargo cancelled no suma deuda activa | correcto           |
| FIN-REP-CHG-003 | Cargo reversed no suma deuda activa  | correcto           |
| FIN-REP-CHG-004 | Cargo archived no suma               | correcto           |
| FIN-REP-CHG-005 | Ajuste positivo suma correctamente   | correcto           |
| FIN-REP-CHG-006 | Ajuste negativo resta correctamente  | correcto           |
| FIN-REP-CHG-007 | Reversal se reporta separado         | correcto           |

---

## 17.2. Pagos

| ID              | Caso                                        | Resultado esperado |
| --------------- | ------------------------------------------- | ------------------ |
| FIN-REP-PAY-001 | Pago confirmed suma recaudación             | correcto           |
| FIN-REP-PAY-002 | Pago allocated suma aplicado                | correcto           |
| FIN-REP-PAY-003 | Pago partiallyAllocated separa no asignado  | correcto           |
| FIN-REP-PAY-004 | Pago reversed no reduce deuda               | correcto           |
| FIN-REP-PAY-005 | Pago rejected no suma recaudación           | correcto           |
| FIN-REP-PAY-006 | Pago cancelled no suma                      | correcto           |
| FIN-REP-PAY-007 | PaymentAllocation reversed no suma aplicado | correcto           |

---

## 17.3. Balances

| ID              | Caso                                  | Resultado esperado |
| --------------- | ------------------------------------- | ------------------ |
| FIN-REP-BAL-001 | totalOutstanding = suma unit_balances | correcto           |
| FIN-REP-BAL-002 | totalOverdue = suma unit_balances     | correcto           |
| FIN-REP-BAL-003 | totalCredit = suma unit_balances      | correcto           |
| FIN-REP-BAL-004 | stale balances generan warning        | correcto           |
| FIN-REP-BAL-005 | unitBalance Tenant B excluido         | correcto           |

---

## 17.4. Collection rate

| ID               | Caso                      | Resultado esperado |
| ---------------- | ------------------------- | ------------------ |
| FIN-REP-COLL-001 | allocated / issued        | correcto           |
| FIN-REP-COLL-002 | issued = 0 => null        | correcto           |
| FIN-REP-COLL-003 | reversed payment excluido | correcto           |
| FIN-REP-COLL-004 | unallocated separado      | correcto           |

---

## 17.5. Morosidad

| ID                 | Caso                         | Resultado esperado |
| ------------------ | ---------------------------- | ------------------ |
| FIN-REP-DELINQ-001 | overdueBalance > 0 incluido  | correcto           |
| FIN-REP-DELINQ-002 | overdueBalance = 0 excluido  | correcto           |
| FIN-REP-DELINQ-003 | oldestDueDate correcto       | correcto           |
| FIN-REP-DELINQ-004 | daysOverdue correcto         | correcto           |
| FIN-REP-DELINQ-005 | cargos cancelados no cuentan | correcto           |
| FIN-REP-DELINQ-006 | cargos reversados no cuentan | correcto           |

---

# 18. Pruebas de datos personales

| ID            | Caso                                               | Resultado esperado |
| ------------- | -------------------------------------------------- | ------------------ |
| PDATA-REP-001 | Sin permiso personal no consulta residentsOwners   | 403                |
| PDATA-REP-002 | Con permiso personal consulta                      | 200                |
| PDATA-REP-003 | No expone identificación completa                  | pasa               |
| PDATA-REP-004 | No expone email                                    | pasa               |
| PDATA-REP-005 | No expone teléfono                                 | pasa               |
| PDATA-REP-006 | No expone dirección                                | pasa               |
| PDATA-REP-007 | Export personal requiere exportPersonalData        | 403 sin permiso    |
| PDATA-REP-008 | Export personal audita personalDataReport.exported | pasa               |

---

# 19. Pruebas de exportación

| ID          | Caso                                   | Resultado esperado |
| ----------- | -------------------------------------- | ------------------ |
| EXP-REP-001 | Export JSON operational                | válido             |
| EXP-REP-002 | Export CSV operational                 | válido             |
| EXP-REP-003 | Export JSON financial                  | válido con permiso |
| EXP-REP-004 | Export CSV financial                   | válido con permiso |
| EXP-REP-005 | Export JSON personal                   | válido con permiso |
| EXP-REP-006 | Export CSV personal                    | válido con permiso |
| EXP-REP-007 | Export activity                        | válido con permiso |
| EXP-REP-008 | Export sin permiso                     | 403                |
| EXP-REP-009 | Export demasiado grande                | 422                |
| EXP-REP-010 | Formato inválido                       | 422                |
| EXP-REP-011 | Export respeta columnas permitidas     | pasa               |
| EXP-REP-012 | Export no incluye datos no autorizados | pasa               |
| EXP-REP-013 | Export genera audit event              | pasa               |
| EXP-REP-014 | Export no loggea resultado completo    | pasa               |

---

# 20. CSV injection tests

| ID          | Campo                | Valor peligroso   | Resultado esperado |
| ----------- | -------------------- | ----------------- | ------------------ |
| CSV-REP-001 | unitCode             | `=cmd`            | neutralizado       |
| CSV-REP-002 | displayName          | `+SUM(1,1)`       | neutralizado       |
| CSV-REP-003 | propertyUnitCode     | `-10+20`          | neutralizado       |
| CSV-REP-004 | chargeConceptName    | `@HYPERLINK(...)` | neutralizado       |
| CSV-REP-005 | method               | `=IMPORTXML(...)` | neutralizado       |
| CSV-REP-006 | action               | `=cmd`            | neutralizado       |
| CSV-REP-007 | resourceType         | `+test`           | neutralizado       |
| CSV-REP-008 | metadata serializada | `@evil`           | neutralizado       |

---

# 21. Read-only behavior tests

| ID         | Caso                                        | Resultado esperado |
| ---------- | ------------------------------------------- | ------------------ |
| RO-REP-001 | Operational overview no hace writes         | pasa               |
| RO-REP-002 | Financial overview no hace writes           | pasa               |
| RO-REP-003 | Property units report no modifica unidades  | pasa               |
| RO-REP-004 | Payments summary no modifica pagos          | pasa               |
| RO-REP-005 | Balances summary no recalcula balances      | pasa               |
| RO-REP-006 | Statements summary no genera statements     | pasa               |
| RO-REP-007 | Delinquency no genera cobranza              | pasa               |
| RO-REP-008 | Activity report no modifica audit logs      | pasa               |
| RO-REP-009 | Export solo escribe AuditLog de exportación | pasa               |

---

# 22. Auditoría de reportes

| ID          | Caso                                                | Evento esperado                                   |
| ----------- | --------------------------------------------------- | ------------------------------------------------- |
| AUD-REP-001 | Export operational                                  | report.exported                                   |
| AUD-REP-002 | Export financialOverview                            | financialReport.exported                          |
| AUD-REP-003 | Export residentsOwners                              | personalDataReport.exported                       |
| AUD-REP-004 | Export activity                                     | activityReport.exported                           |
| AUD-REP-005 | Consulta financiera sensible                        | financialReport.viewed si política lo habilita    |
| AUD-REP-006 | Consulta personal sensible                          | personalDataReport.viewed si política lo habilita |
| AUD-REP-007 | Acceso financiero denegado                          | financialReport.accessDenied                      |
| AUD-REP-008 | Acceso personal denegado                            | personalDataReport.accessDenied                   |
| AUD-REP-009 | Metadata audit no contiene resultado completo       | pasa                                              |
| AUD-REP-010 | Metadata audit incluye reportKey, filters, rowCount | pasa                                              |

---

# 23. Observabilidad

| ID          | Caso                                                   | Resultado esperado |
| ----------- | ------------------------------------------------------ | ------------------ |
| OBS-REP-001 | Consulta exitosa incrementa reports_query_total        | pasa               |
| OBS-REP-002 | Consulta fallida incrementa reports_query_failed_total | pasa               |
| OBS-REP-003 | Export exitoso incrementa reports_export_total         | pasa               |
| OBS-REP-004 | Export fallido incrementa reports_export_failed_total  | pasa               |
| OBS-REP-005 | Access denied incrementa reports_access_denied_total   | pasa               |
| OBS-REP-006 | Logs contienen traceId                                 | pasa               |
| OBS-REP-007 | Logs no contienen resultado completo                   | pasa               |
| OBS-REP-008 | Logs no contienen CSV completo                         | pasa               |
| OBS-REP-009 | Métricas no usan tenantId como label                   | pasa               |
| OBS-REP-010 | Métricas no usan propertyUnitId como label             | pasa               |
| OBS-REP-011 | Métricas no usan actorUserId como label                | pasa               |
| OBS-REP-012 | Métricas no usan traceId como label                    | pasa               |

---

# 24. OpenAPI tests

| ID           | Caso                               | Resultado esperado |
| ------------ | ---------------------------------- | ------------------ |
| OAPI-REP-001 | Operational endpoint documentado   | pasa               |
| OAPI-REP-002 | Financial endpoints documentados   | pasa               |
| OAPI-REP-003 | Personal endpoint documentado      | pasa               |
| OAPI-REP-004 | Activity endpoint documentado      | pasa               |
| OAPI-REP-005 | Export endpoint documentado        | pasa               |
| OAPI-REP-006 | Permisos documentados              | pasa               |
| OAPI-REP-007 | Money as string documentado        | pasa               |
| OAPI-REP-008 | Paginación documentada             | pasa               |
| OAPI-REP-009 | CSV export documentado             | pasa               |
| OAPI-REP-010 | No documenta POST/PUT/PATCH/DELETE | pasa               |
| OAPI-REP-011 | Errores documentados               | pasa               |

---

# 25. Smoke tests

Smoke tests post-deploy:

| ID            | Caso                                                        | Resultado esperado |
| ------------- | ----------------------------------------------------------- | ------------------ |
| SMOKE-REP-001 | `GET /api/v1/health`                                        | 200                |
| SMOKE-REP-002 | `GET /api/v1/tenant/reports/operational-overview` sin token | 401                |
| SMOKE-REP-003 | Usuario autorizado consulta operational                     | 200                |
| SMOKE-REP-004 | Usuario sin permiso consulta operational                    | 403                |
| SMOKE-REP-005 | Usuario sin financiero consulta financial                   | 403                |
| SMOKE-REP-006 | Usuario autorizado consulta balances summary                | 200                |
| SMOKE-REP-007 | Error contiene traceId                                      | pasa               |

No ejecutar exportaciones masivas en smoke test ordinario.

---

# 26. Organización de archivos de prueba

```text id="he1gsy"
apps/api/src/modules/reports/tests/
├── unit/
│   ├── report-key.vo.spec.ts
│   ├── report-category.vo.spec.ts
│   ├── report-format.vo.spec.ts
│   ├── report-period.vo.spec.ts
│   ├── report-date-range.vo.spec.ts
│   ├── report-money.vo.spec.ts
│   ├── report-pagination.vo.spec.ts
│   ├── report-sort.vo.spec.ts
│   ├── report-result.entity.spec.ts
│   ├── report-context.entity.spec.ts
│   └── report-export.entity.spec.ts
│
├── application/
│   ├── report-permission-policy.service.spec.ts
│   ├── report-filter-validator.service.spec.ts
│   ├── report-money.service.spec.ts
│   ├── report-export.service.spec.ts
│   ├── report-audit.service.spec.ts
│   ├── get-operational-overview-report.use-case.spec.ts
│   ├── get-financial-overview-report.use-case.spec.ts
│   ├── get-property-units-report.use-case.spec.ts
│   ├── get-residents-owners-report.use-case.spec.ts
│   ├── get-charges-summary-report.use-case.spec.ts
│   ├── get-payments-summary-report.use-case.spec.ts
│   ├── get-pending-payment-validation-report.use-case.spec.ts
│   ├── get-balances-summary-report.use-case.spec.ts
│   ├── get-account-statements-summary-report.use-case.spec.ts
│   ├── get-delinquency-report.use-case.spec.ts
│   ├── get-collection-summary-report.use-case.spec.ts
│   ├── get-administrative-activity-report.use-case.spec.ts
│   └── export-report.use-case.spec.ts
│
├── integration/
│   ├── operational-overview.repository.spec.ts
│   ├── financial-overview.repository.spec.ts
│   ├── property-units-report.repository.spec.ts
│   ├── residents-owners-report.repository.spec.ts
│   ├── charges-summary.repository.spec.ts
│   ├── payments-summary.repository.spec.ts
│   ├── pending-validation.repository.spec.ts
│   ├── balances-summary.repository.spec.ts
│   ├── account-statements-summary.repository.spec.ts
│   ├── delinquency.repository.spec.ts
│   ├── collection-summary.repository.spec.ts
│   └── activity-report.repository.spec.ts
│
├── api/
│   ├── operational-overview.api.spec.ts
│   ├── financial-overview.api.spec.ts
│   ├── property-units-report.api.spec.ts
│   ├── residents-owners-report.api.spec.ts
│   ├── financial-reports.api.spec.ts
│   ├── activity-report.api.spec.ts
│   └── report-export.api.spec.ts
│
├── authorization/
│   ├── reports.authorization.spec.ts
│   ├── reports-financial.authorization.spec.ts
│   ├── reports-personal-data.authorization.spec.ts
│   ├── reports-activity.authorization.spec.ts
│   └── reports-export.authorization.spec.ts
│
├── multitenancy/
│   └── reports.multitenancy.spec.ts
│
├── financial/
│   ├── reports-charges.financial.spec.ts
│   ├── reports-payments.financial.spec.ts
│   ├── reports-balances.financial.spec.ts
│   ├── reports-collection.financial.spec.ts
│   └── reports-delinquency.financial.spec.ts
│
├── export/
│   ├── reports-export.spec.ts
│   └── reports-csv-injection.spec.ts
│
├── security/
│   ├── reports-read-only.security.spec.ts
│   ├── reports-personal-data.security.spec.ts
│   └── reports-logging.security.spec.ts
│
└── openapi/
    └── reports.openapi.spec.ts
```

---

# 27. Comandos esperados

Comandos específicos sugeridos:

```bash id="t61iqy"
npm run test:reports
npm run test:reports:unit
npm run test:reports:application
npm run test:reports:integration
npm run test:reports:api
npm run test:reports:authorization
npm run test:reports:multitenancy
npm run test:reports:financial
npm run test:reports:export
npm run test:reports:security
```

Comandos generales:

```bash id="loj3yw"
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run test:api
npm run test:authorization
npm run test:multitenancy
npm run test:security
npm run openapi:validate
npm run build
```

---

# 28. Requisitos para CI

En pull request deben correr como mínimo:

```text id="fwksj3"
lint
typecheck
unit tests
application tests
DTO validation tests
permission policy tests
repository integration tests críticos
API tests críticos
authorization tests
multitenancy tests
financial regression tests
export tests
CSV injection tests
read-only tests
OpenAPI validation
build
```

Antes de producción:

```text id="v4r1m9"
full reports test suite
all API tests
all authorization tests
all financial regression tests
all multitenancy tests
all export tests
all personal data tests
all observability tests
smoke tests staging
```

---

# 29. Gates de calidad

No se permite merge si falla:

* tenant isolation;
* read-only behavior;
* financial permission;
* personal data permission;
* export permission;
* money as string;
* no float money;
* financial regression;
* CSV injection protection;
* export audit;
* no cross-tenant export;
* no personal data exposure;
* no POST/PUT/PATCH/DELETE report endpoints;
* OpenAPI validation.

---

# 30. Matriz de trazabilidad

| Requisito                         | Pruebas asociadas              |
| --------------------------------- | ------------------------------ |
| FR-001 Operational overview       | APP-REP-OP, API-REP-OP         |
| FR-002 Property units report      | APP-REP-UNITS, API-REP-UNITS   |
| FR-003 Residents owners report    | APP-REP-PEOPLE, API-REP-PEOPLE |
| FR-004 Charges summary            | APP-REP-CHG, INT-REP-CHG       |
| FR-005 Payments summary           | APP-REP-PAY, INT-REP-PAY       |
| FR-006 Balances summary           | APP-REP-BAL, INT-REP-BAL       |
| FR-007 Account statements summary | APP-REP-STMT, INT-REP-STMT     |
| FR-008 Delinquency report         | APP-REP-DELINQ, FIN-REP-DELINQ |
| FR-009 Collection summary         | APP-REP-COLL, FIN-REP-COLL     |
| FR-010 Pending validation         | APP-REP-PEND, INT-REP-PEND     |
| FR-011 Activity report            | APP-REP-ACT, API-REP-ACT       |
| FR-012 Filters                    | DTO-REP, SRV-REP-FILTER        |
| FR-013 Pagination                 | UT-REP-PAG, API tests          |
| FR-014 Export                     | APP-REP-EXP, EXP-REP           |
| FR-015 Audit exports              | AUD-REP                        |
| FR-016 Financial protection       | AUTH-REP-FIN                   |
| FR-017 Personal protection        | PDATA-REP                      |
| FR-018 Multitenancy               | MT-REP                         |
| FR-019 Cutoff date                | APP report tests               |
| FR-020 Read-only                  | RO-REP                         |

---

# 31. Riesgos cubiertos

| Riesgo                        | Pruebas                 |
| ----------------------------- | ----------------------- |
| Reportes mezclan tenants      | MT-REP                  |
| Reporte financiero incorrecto | FIN-REP                 |
| Uso de float                  | UT-REP-MNY, SRV-REP-MNY |
| Datos personales expuestos    | PDATA-REP               |
| Export sin permiso            | AUTH-REP-EXP, EXP-REP   |
| Export financiero sin permiso | AUTH-REP-EXP            |
| CSV injection                 | CSV-REP                 |
| Reporte modifica datos fuente | RO-REP                  |
| Auditoría export omitida      | AUD-REP                 |
| Logs con datos sensibles      | OBS-REP, security tests |
| Sort injection                | DTO-REP, SRV-REP-FILTER |
| Date range abusivo            | DTO-REP, API tests      |

---

# 32. Criterios de salida

El módulo `008-basic-reports` puede considerarse probado si:

* todos los unit tests pasan;
* tests de DTOs pasan;
* tests de políticas pasan;
* tests de servicios pasan;
* tests de repositorios pasan;
* API tests pasan;
* authorization tests pasan;
* multitenancy tests pasan;
* financial regression tests pasan;
* personal data tests pasan;
* export tests pasan;
* CSV injection tests pasan;
* read-only tests pasan;
* audit integration tests pasan;
* observability tests pasan;
* OpenAPI tests pasan;
* smoke tests pasan;
* no hay datos reales en fixtures;
* no hay uso de float en dinero;
* no hay endpoints de escritura en reportes;
* no hay exportación sin auditoría;
* CI pasa.

---

# 33. Pendientes controlados

Pendientes aceptados para esta spec:

```text id="ly1kfu"
BI avanzado diferido
data warehouse diferido
materialized views diferidas
report_snapshots diferidos
scheduled_reports diferidos
PDF avanzado diferido
envío automático diferido
IA para reportes diferida
mora avanzada diferida
cobranza automatizada diferida
reportes contables formales diferidos
conciliación bancaria diferida
facturación electrónica diferida
```

Estos pendientes no bloquean `008-basic-reports`.

---

## 34. Decisión final del test plan

El módulo `008-basic-reports` deberá probarse con unit tests, DTO validation tests, application tests, repository integration tests, API tests, authorization tests, multitenancy tests, financial regression tests, personal data protection tests, export tests, CSV injection tests, read-only tests, audit integration tests, observability tests, OpenAPI tests y smoke tests.

Las pruebas se enfocarán especialmente en:

```text id="hclcj6"
- reportes read-only;
- aislamiento multitenant;
- permisos por tipo de reporte;
- protección financiera;
- protección de datos personales;
- exactitud de agregaciones;
- montos como string decimal;
- exclusión de cargos cancelados/reversados;
- exclusión de pagos reversados;
- separación de pagos no asignados;
- uso de unit_balances;
- uso de account_statements;
- paginación;
- filtros seguros;
- sort whitelist;
- exportación autorizada;
- auditoría de exportación;
- CSV injection protection;
- logs y métricas sanitizadas;
- OpenAPI consistente.
```

Ninguna implementación debe aceptarse si permite reportes cross-tenant, modifica datos fuente, usa float para dinero, expone datos personales sin permiso, exporta sin permiso, omite auditoría de exportación, incluye cargos cancelados como deuda activa, incluye pagos reversados como recaudación activa, mezcla pagos no asignados con pagos aplicados o permite CSV vulnerable a fórmula injection.
