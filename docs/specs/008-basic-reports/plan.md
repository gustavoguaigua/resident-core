# Plan — Spec 008 Basic Reports and Operational Dashboards

## 1. Información del documento

| Campo                 | Valor                                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Proyecto              | RESIDENT Core                                                                                                                        |
| Spec ID               | 008                                                                                                                                  |
| Módulo                | Basic Reports                                                                                                                        |
| Documento             | Implementation Plan                                                                                                                  |
| Ruta                  | `docs/specs/008-basic-reports/plan.md`                                                                                               |
| Versión               | 0.1                                                                                                                                  |
| Estado                | needs-review                                                                                                                         |
| Fecha                 | 2026-07-14                                                                                                                           |
| Documento base        | `docs/specs/008-basic-reports/spec.md`                                                                                               |
| Depende de            | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements`, `007-audit` |
| Arquitectura          | Monolito modular NestJS                                                                                                              |
| Base de datos         | PostgreSQL + Prisma                                                                                                                  |
| Autorización          | Tenant-aware RBAC + permisos de reportes                                                                                             |
| Naturaleza del módulo | Read-only / Reporting                                                                                                                |
| Prioridad             | Alta                                                                                                                                 |

---

## 2. Propósito

Este documento transforma la especificación funcional `008-basic-reports/spec.md` en un plan técnico de implementación.

El módulo `008-basic-reports` entregará la primera capa de reportes operativos y financieros básicos de RESIDENT Core.

Debe permitir consultar información consolidada sobre:

* estado operativo del tenant;
* unidades habitacionales;
* propietarios;
* residentes;
* cargos;
* pagos;
* balances;
* estados de cuenta;
* deuda básica;
* recaudación;
* pagos pendientes de validación;
* actividad administrativa;
* exportaciones básicas.

Regla central:

```text id="vw6e7f"
Los reportes básicos no son fuente primaria de verdad; deben derivarse de datos transaccionales auditables, tenant-scoped y financieramente consistentes.
```

---

## 3. Resumen de implementación

El módulo se implementará como módulo interno de NestJS dentro del monolito modular.

Nombre recomendado del módulo:

```text id="ni7hlc"
reports
```

Ruta recomendada:

```text id="z0z17h"
apps/api/src/modules/reports/
```

Componentes principales:

```text id="j50gtf"
ReportsModule
ReportsController
ReportsExportController
OperationalReportsService
FinancialReportsService
PropertyReportsService
ActivityReportsService
ReportExportService
ReportPermissionPolicyService
ReportQueryService
ReportAuditService
```

Naturaleza del módulo:

```text id="gr07f6"
read-only
tenant-scoped
permissioned
auditable
exportable
derived
non-transactional
```

Relación conceptual:

```text id="oytm6l"
RESIDENT Core Transactional Modules
    ↓
Reports Reader Ports
    ↓
Reports Application Services
    ↓
Reports Controllers
    ↓
JSON / CSV responses
```

---

## 4. Decisiones técnicas aplicables

Este módulo debe cumplir:

```text id="kylapg"
ADR-001 — Architecture Style
ADR-002 — Backend Framework
ADR-003 — Database Strategy
ADR-004 — Multitenancy Strategy
ADR-007 — Authorization Strategy
ADR-010 — Observability Strategy
ADR-011 — Testing Strategy
ADR-012 — CI/CD Strategy
```

Reglas clave:

* El módulo es read-only.
* No ejecuta operaciones financieras.
* No modifica cargos.
* No modifica pagos.
* No modifica estados de cuenta.
* No modifica balances.
* No modifica auditoría.
* Todo reporte debe filtrar por `tenantId`.
* Todo reporte financiero debe usar Decimal.
* Todos los montos se devuelven como string.
* Reportes financieros requieren `reports.readFinancial`.
* Reportes personales requieren `reports.readPersonalData`.
* Exportaciones requieren `reports.export`.
* Exportaciones financieras requieren `reports.exportFinancial`.
* Exportaciones se auditan.
* CSV debe proteger contra formula injection.
* No se implementa BI avanzado en MVP.
* No se implementa data warehouse en MVP.
* No se implementa PDF avanzado en MVP.

---

## 5. Alcance técnico

### 5.1. Incluido

La implementación inicial cubre:

```text id="k99j87"
Operational Overview Report
Property Units Report
Residents and Owners Report
Charges Summary Report
Payments Summary Report
Pending Payment Validation Report
Balances Summary Report
Account Statements Summary Report
Basic Delinquency Report
Collection Summary Report
Administrative Activity Report
Report Export JSON
Report Export CSV
Report permissions
Report filters
Report pagination
Report sorting
Report audit events
Report observability
OpenAPI
Tests
```

---

### 5.2. Diferido

No se implementará todavía:

```text id="f1u66h"
BI avanzado
OLAP
data warehouse
data lake
dashboards gráficos avanzados
reportes predictivos
IA para reportes
forecast de recaudación
detección automática de anomalías
mora avanzada con intereses
cobranza automatizada
reportes contables formales
balance general contable
estado de resultados contable
flujo de caja contable
conciliación bancaria
facturación electrónica
PDF avanzado
envío por email
envío por WhatsApp
programación automática de reportes
constructor visual de reportes
reportes personalizados
reportes platform detallados
```

---

## 6. Estructura de carpetas recomendada

```text id="y45e9q"
apps/api/src/modules/reports/
├── reports.module.ts
│
├── reports.controller.ts
├── reports-export.controller.ts
│
├── application/
│   ├── use-cases/
│   │   ├── get-operational-overview-report.use-case.ts
│   │   ├── get-financial-overview-report.use-case.ts
│   │   ├── get-property-units-report.use-case.ts
│   │   ├── get-residents-owners-report.use-case.ts
│   │   ├── get-charges-summary-report.use-case.ts
│   │   ├── get-payments-summary-report.use-case.ts
│   │   ├── get-pending-payment-validation-report.use-case.ts
│   │   ├── get-balances-summary-report.use-case.ts
│   │   ├── get-account-statements-summary-report.use-case.ts
│   │   ├── get-delinquency-report.use-case.ts
│   │   ├── get-collection-summary-report.use-case.ts
│   │   ├── get-administrative-activity-report.use-case.ts
│   │   └── export-report.use-case.ts
│   │
│   ├── services/
│   │   ├── operational-reports.service.ts
│   │   ├── financial-reports.service.ts
│   │   ├── property-reports.service.ts
│   │   ├── activity-reports.service.ts
│   │   ├── report-query.service.ts
│   │   ├── report-permission-policy.service.ts
│   │   ├── report-export.service.ts
│   │   ├── report-audit.service.ts
│   │   ├── report-money.service.ts
│   │   └── report-filter-validator.service.ts
│   │
│   └── ports/
│       ├── reports-reader.port.ts
│       ├── tenant-report-reader.port.ts
│       ├── property-report-reader.port.ts
│       ├── financial-report-reader.port.ts
│       ├── payments-report-reader.port.ts
│       ├── account-statements-report-reader.port.ts
│       ├── audit-report-reader.port.ts
│       ├── report-export.port.ts
│       └── report-audit.port.ts
│
├── domain/
│   ├── entities/
│   │   ├── report-result.entity.ts
│   │   ├── report-row.entity.ts
│   │   ├── report-context.entity.ts
│   │   └── report-export.entity.ts
│   │
│   ├── value-objects/
│   │   ├── report-key.vo.ts
│   │   ├── report-category.vo.ts
│   │   ├── report-format.vo.ts
│   │   ├── report-period.vo.ts
│   │   ├── report-date-range.vo.ts
│   │   ├── report-money.vo.ts
│   │   ├── report-sort.vo.ts
│   │   └── report-pagination.vo.ts
│   │
│   ├── events/
│   │   ├── report-viewed-sensitive.event.ts
│   │   ├── report-exported.event.ts
│   │   ├── financial-report-exported.event.ts
│   │   ├── personal-data-report-exported.event.ts
│   │   └── report-access-denied.event.ts
│   │
│   └── errors/
│       ├── report-not-found.error.ts
│       ├── report-forbidden.error.ts
│       ├── report-export-forbidden.error.ts
│       ├── report-invalid-filter.error.ts
│       ├── report-invalid-date-range.error.ts
│       ├── report-export-format-not-supported.error.ts
│       ├── report-export-too-large.error.ts
│       └── report-cross-tenant-reference.error.ts
│
├── infrastructure/
│   ├── persistence/
│   │   ├── prisma-reports-reader.repository.ts
│   │   └── reports.mapper.ts
│   │
│   ├── export/
│   │   └── report-export.adapter.ts
│   │
│   └── audit/
│       └── report-audit.adapter.ts
│
├── policies/
│   ├── report-permission.guard.ts
│   ├── financial-report.guard.ts
│   ├── personal-data-report.guard.ts
│   └── report-export.guard.ts
│
├── dto/
└── tests/
```

---

## 7. Documentación esperada

```text id="wqojvk"
docs/specs/008-basic-reports/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

Este documento corresponde a:

```text id="ctjzq6"
plan.md
```

---

# 8. Diseño de dominio

## 8.1. ReportResult

Representa el resultado de un reporte.

Campos conceptuales:

```text id="k5vbdf"
reportKey
tenantId
generatedAt
asOfDate nullable
dateFrom nullable
dateTo nullable
periodCode nullable
summary
rows nullable
totals nullable
pagination nullable
filters
```

Reglas:

* `reportKey` obligatorio.
* `tenantId` obligatorio.
* `generatedAt` obligatorio.
* Si es financiero, debe incluir fecha de corte o periodo.
* Montos como string.
* No debe contener datos de otro tenant.

---

## 8.2. ReportRow

Representa una fila de reporte detallado.

Ejemplos:

* unidad;
* residente;
* cargo;
* pago;
* estado de cuenta;
* evento de actividad;
* unidad morosa.

Reglas:

* Debe estar dentro del tenant.
* Debe respetar permisos.
* No debe exponer datos sensibles sin permiso.
* Debe ser serializable a JSON/CSV.

---

## 8.3. ReportContext

Representa el contexto de ejecución.

Campos:

```text id="cgebpq"
tenantId
actorUserId
permissions
reportKey
filters
traceId
requestId
correlationId
generatedAt
```

---

## 8.4. ReportExport

Representa una exportación de reporte.

Campos conceptuales:

```text id="f9axjm"
reportKey
tenantId
actorUserId
format
filters
rowCount
generatedAt
traceId
```

MVP:

```text id="ekdu9f"
No se materializa ReportExport en tabla.
Se registra auditoría de exportación mediante 007-audit.
```

---

# 9. Value Objects

## 9.1. ReportKey

Valores MVP:

```text id="ig136b"
operationalOverview
financialOverview
propertyUnits
residentsOwners
chargesSummary
paymentsSummary
pendingPaymentValidation
balancesSummary
accountStatementsSummary
delinquency
collectionSummary
activity
```

Responsabilidad:

* validar reporte solicitado;
* mapear endpoint a reporte;
* mapear reporte a permisos;
* mapear reporte a categoría.

---

## 9.2. ReportCategory

Valores:

```text id="k32h0w"
operational
financial
personalData
activity
mixed
```

---

## 9.3. ReportFormat

Valores MVP:

```text id="c4u1qq"
json
csv
```

PDF queda diferido.

---

## 9.4. ReportPeriod

Representa periodo financiero.

Campos:

```text id="qirz72"
billingPeriodId
periodCode
```

Reglas:

* `periodCode` debe usar formato `YYYY-MM`.
* Si se envía `billingPeriodId`, debe pertenecer al tenant.
* Si se envía `periodCode`, debe resolverse dentro del tenant.

---

## 9.5. ReportDateRange

Campos:

```text id="s5dumq"
dateFrom
dateTo
```

Reglas:

* `dateFrom <= dateTo`.
* usar UTC para almacenamiento;
* usar America/Guayaquil para presentación si aplica;
* rango máximo configurable para reportes pesados.

---

## 9.6. ReportMoney

Reglas:

* usar Decimal internamente;
* exponer string;
* currency MVP `USD`;
* no usar float;
* no redondear silenciosamente.

---

## 9.7. ReportSort

Reglas:

* `sortBy` debe pertenecer a lista permitida por reporte;
* `sortOrder` solo `asc` o `desc`;
* no permitir campos arbitrarios.

---

## 9.8. ReportPagination

Reglas:

```text id="fl1ddf"
page default 1
pageSize default 20
pageSize max 100
```

---

# 10. Persistencia y modelo de datos

## 10.1. Decisión MVP

Para MVP:

```text id="xkrxpr"
No crear tablas transaccionales nuevas para reportes.
```

Los reportes se calculan bajo demanda desde:

```text id="xb7owi"
tenants
user_profiles
memberships
property_units
persons
property_ownerships
residencies
charges
charge_adjustments
charge_reversals
payments
payment_receipts
payment_allocations
account_statements
account_statement_lines
unit_balances
audit_logs
```

---

## 10.2. Tablas nuevas

MVP:

```text id="eix6j2"
ninguna tabla obligatoria
```

Opcional futuro:

```text id="h96012"
report_snapshots
report_exports
scheduled_reports
report_templates
```

---

## 10.3. Razón para no materializar en MVP

* reduce complejidad;
* evita duplicar datos;
* mantiene fuente primaria en módulos transaccionales;
* evita inconsistencias;
* permite validar consultas antes de optimizar;
* tenants MVP serán pequeños/medianos.

---

## 10.4. Optimización futura

Si los reportes son lentos, evaluar:

```text id="ub9q30"
materialized views
report_snapshots
read replicas
precomputed aggregates
data warehouse
partitioning
caching controlado
```

No implementar en MVP salvo necesidad medida.

---

# 11. Puertos de lectura

## 11.1. ReportsReaderPort

Puerto general para reportes.

Contrato conceptual:

```text id="g4g5h9"
getOperationalOverview(context)
getFinancialOverview(context, query)
getPropertyUnitsReport(context, query)
getResidentsOwnersReport(context, query)
getChargesSummary(context, query)
getPaymentsSummary(context, query)
getPendingPaymentValidation(context, query)
getBalancesSummary(context, query)
getAccountStatementsSummary(context, query)
getDelinquencyReport(context, query)
getCollectionSummary(context, query)
getActivityReport(context, query)
```

---

## 11.2. TenantReportReaderPort

Responsable de leer:

```text id="sgqnpe"
tenant profile
tenant status
tenant configuration
active billing period
```

---

## 11.3. PropertyReportReaderPort

Responsable de leer:

```text id="f4picg"
property_units
property_ownerships
residencies
persons summary
vehicles
pets
```

Reglas:

* siempre filtrar por tenant;
* no devolver datos personales completos sin permiso.

---

## 11.4. FinancialReportReaderPort

Responsable de leer:

```text id="w0a2x4"
charges
charge_adjustments
charge_reversals
unit_balances
billing_periods
```

Reglas:

* excluir cargos cancelados/reversados de deuda activa;
* usar Decimal;
* filtrar tenant.

---

## 11.5. PaymentsReportReaderPort

Responsable de leer:

```text id="hpfhll"
payments
payment_receipts
payment_allocations
payment_reversals
```

Reglas:

* excluir pagos reversados de recaudación activa;
* separar pagos no asignados;
* filtrar tenant.

---

## 11.6. AccountStatementsReportReaderPort

Responsable de leer:

```text id="ix0sh7"
account_statements
account_statement_lines si aplica
unit_balances
balance_snapshots si aplica
```

Reglas:

* distinguir estados;
* no usar superseded como vigente;
* filtrar tenant.

---

## 11.7. AuditReportReaderPort

Responsable de leer:

```text id="h9sczg"
audit_logs
```

Reglas:

* delegar permisos sensibles a policy;
* filtrar tenant;
* no exponer secretos.

---

## 11.8. ReportExportPort

Responsable de exportar:

```text id="qlajuf"
JSON
CSV
```

Reglas:

* CSV injection protection;
* respetar columnas permitidas;
* no exportar campos no autorizados.

---

## 11.9. ReportAuditPort

Puerto hacia `007-audit`.

Eventos:

```text id="yr1h1r"
report.viewedSensitive
financialReport.viewed
personalDataReport.viewed
activityReport.viewed
report.exported
financialReport.exported
personalDataReport.exported
activityReport.exported
report.accessDenied
```

---

# 12. Servicios de aplicación

## 12.1. OperationalReportsService

Responsabilidad:

* resumen operativo;
* conteo de unidades;
* conteo de propietarios/residentes;
* conteo de vehículos/mascotas;
* invitaciones pendientes;
* usuarios activos.

No debe incluir saldos salvo que se delegue a FinancialReportsService.

---

## 12.2. FinancialReportsService

Responsabilidad:

* resumen financiero;
* cargos;
* pagos;
* saldos;
* deuda;
* recaudación;
* pagos pendientes;
* estados de cuenta.

Reglas:

* usar Decimal;
* montos como string;
* excluir movimientos inválidos;
* separar no asignados;
* respetar periodos.

---

## 12.3. PropertyReportsService

Responsabilidad:

* unidades;
* propietarios;
* residentes;
* relaciones vigentes;
* filtros por estado/tipo.

Reglas:

* proteger datos personales;
* ocultar nombres si no existe permiso;
* filtrar tenant.

---

## 12.4. ActivityReportsService

Responsabilidad:

* leer `audit_logs`;
* resumir actividad administrativa;
* aplicar filtros;
* aplicar permisos.

No reemplaza la API completa de auditoría.

---

## 12.5. ReportQueryService

Responsabilidad:

* validar filtros;
* normalizar periodo;
* validar date ranges;
* aplicar paginación;
* aplicar ordenamiento permitido;
* definir `asOfDate`.

---

## 12.6. ReportPermissionPolicyService

Responsabilidad:

* mapear reportKey a permisos;
* validar reportes financieros;
* validar reportes personales;
* validar actividad;
* validar exportación;
* validar permisos combinados.

Reglas:

```text id="gsxuw1"
reports.read ≠ reports.export
reports.read ≠ reports.readFinancial
reports.readFinancial ≠ reports.exportFinancial
reports.readPersonalData ≠ reports.exportPersonalData
```

---

## 12.7. ReportExportService

Responsabilidad:

* exportar JSON;
* exportar CSV;
* aplicar columnas permitidas;
* sanitizar CSV;
* auditar exportación;
* limitar volumen.

---

## 12.8. ReportAuditService

Responsabilidad:

* enviar eventos al módulo `007-audit`;
* auditar exportaciones;
* auditar consultas sensibles si aplica;
* auditar accesos denegados relevantes.

---

## 12.9. ReportMoneyService

Responsabilidad:

* sumar Decimal;
* formatear como string;
* validar USD;
* evitar float.

---

## 12.10. ReportFilterValidatorService

Responsabilidad:

* validar `periodCode`;
* validar `dateFrom/dateTo`;
* validar `pageSize`;
* validar `sortBy`;
* validar filtros por reporte.

---

# 13. Casos de uso

## 13.1. GetOperationalOverviewReportUseCase

Endpoint:

```text id="lqvcei"
GET /api/v1/tenant/reports/operational-overview
```

Permiso:

```text id="hmr78q"
reports.read
```

Responsabilidades:

* validar tenant activo;
* validar permiso;
* contar unidades;
* contar personas vinculadas;
* contar usuarios activos;
* contar invitaciones pendientes;
* devolver resumen.

---

## 13.2. GetFinancialOverviewReportUseCase

Endpoint:

```text id="or65bp"
GET /api/v1/tenant/reports/financial-overview
```

Permiso:

```text id="j6dn8y"
reports.readFinancial
```

Responsabilidades:

* resolver periodo/corte;
* sumar cargos emitidos;
* sumar pagos confirmados;
* sumar pagos asignados;
* separar no asignados;
* leer `unit_balances`;
* calcular deuda total;
* calcular deuda vencida;
* calcular saldo a favor total.

---

## 13.3. GetPropertyUnitsReportUseCase

Endpoint:

```text id="uufv1n"
GET /api/v1/tenant/reports/property-units
```

Permiso base:

```text id="hww2ml"
reports.read
```

Permiso adicional para saldos:

```text id="l12qrt"
reports.readFinancial
```

Responsabilidades:

* listar unidades;
* aplicar filtros;
* incluir conteos de propietarios/residentes;
* incluir saldos solo con permiso;
* paginar.

---

## 13.4. GetResidentsOwnersReportUseCase

Endpoint:

```text id="znec7u"
GET /api/v1/tenant/reports/residents-owners
```

Permiso:

```text id="oaknb9"
reports.readPersonalData
```

Responsabilidades:

* listar relaciones persona-unidad;
* distinguir owner/resident/tenant;
* ocultar campos sensibles no autorizados;
* paginar.

---

## 13.5. GetChargesSummaryReportUseCase

Endpoint:

```text id="z6rq56"
GET /api/v1/tenant/reports/charges/summary
```

Permiso:

```text id="yxld11"
reports.readFinancial
```

Responsabilidades:

* sumar cargos por periodo;
* agrupar por concepto;
* contar cancelados;
* contar reversados;
* sumar ajustes;
* excluir cancelados de deuda activa.

---

## 13.6. GetPaymentsSummaryReportUseCase

Endpoint:

```text id="l9j4u9"
GET /api/v1/tenant/reports/payments/summary
```

Permiso:

```text id="n47210"
reports.readFinancial
```

Responsabilidades:

* sumar pagos confirmados;
* sumar pagos pendientes;
* sumar rechazados;
* sumar reversados;
* sumar asignados;
* separar no asignados;
* agrupar por método.

---

## 13.7. GetPendingPaymentValidationReportUseCase

Endpoint:

```text id="sp1n8m"
GET /api/v1/tenant/reports/payments/pending-validation
```

Permiso:

```text id="qhz8ie"
reports.readFinancial
```

Responsabilidades:

* listar pagos reportados o pendingValidation;
* calcular días pendientes;
* mostrar estado de comprobante;
* no incluir comprobante completo;
* paginar.

---

## 13.8. GetBalancesSummaryReportUseCase

Endpoint:

```text id="cqn0ig"
GET /api/v1/tenant/reports/balances/summary
```

Permiso:

```text id="h926t7"
reports.readFinancial
```

Responsabilidades:

* leer `unit_balances`;
* sumar outstanding;
* sumar overdue;
* sumar notDue;
* sumar credit;
* sumar unallocated;
* contar unidades con deuda/crédito/mora.

---

## 13.9. GetAccountStatementsSummaryReportUseCase

Endpoint:

```text id="yn30c4"
GET /api/v1/tenant/reports/account-statements/summary
```

Permiso:

```text id="kly8d7"
reports.readFinancial
```

Responsabilidades:

* contar statements por estado;
* sumar closingBalance;
* sumar creditBalance;
* filtrar por periodo;
* excluir archived;
* distinguir superseded.

---

## 13.10. GetDelinquencyReportUseCase

Endpoint:

```text id="xuiic1"
GET /api/v1/tenant/reports/delinquency
```

Permiso:

```text id="s0mkx0"
reports.readFinancial
```

Responsabilidades:

* listar unidades con overdueBalance > 0;
* calcular oldestDueDate;
* calcular daysOverdue;
* contar cargos pendientes;
* mostrar último pago;
* no calcular intereses;
* paginar.

---

## 13.11. GetCollectionSummaryReportUseCase

Endpoint:

```text id="fjvh98"
GET /api/v1/tenant/reports/collections/summary
```

Permiso:

```text id="iuwvu9"
reports.readFinancial
```

Responsabilidades:

* sumar pagos confirmados;
* sumar pagos asignados;
* sumar pagos no asignados;
* calcular collectionRate básico;
* agrupar por método;
* filtrar por periodo/fecha.

---

## 13.12. GetAdministrativeActivityReportUseCase

Endpoint:

```text id="c1pagy"
GET /api/v1/tenant/reports/activity
```

Permiso:

```text id="z4lrgf"
reports.readActivity
```

Alternativa permitida:

```text id="arlfdh"
audit.read
```

Responsabilidades:

* leer audit logs;
* filtrar por fecha, actor, categoría y acción;
* devolver actividad resumida;
* no reemplazar Audit API;
* paginar.

---

## 13.13. ExportReportUseCase

Endpoint:

```text id="qo8qnl"
GET /api/v1/tenant/reports/{reportKey}/export
```

Responsabilidades:

* validar reportKey;
* validar permisos base;
* validar permisos de exportación;
* validar permisos de categoría;
* ejecutar reporte;
* limitar volumen;
* exportar JSON/CSV;
* auditar exportación.

---

# 14. Controladores REST

## 14.1. ReportsController

Ruta base:

```text id="xx64h7"
/api/v1/tenant/reports
```

Endpoints:

```text id="svg1b3"
GET /operational-overview
GET /financial-overview
GET /property-units
GET /residents-owners
GET /charges/summary
GET /payments/summary
GET /payments/pending-validation
GET /balances/summary
GET /account-statements/summary
GET /delinquency
GET /collections/summary
GET /activity
```

Guards:

```text id="lw66v8"
AuthGuard
TenantGuard
TenantPermissionGuard
ReportPermissionGuard
FinancialReportGuard cuando aplique
PersonalDataReportGuard cuando aplique
```

---

## 14.2. ReportsExportController

Ruta base:

```text id="pqvztu"
/api/v1/tenant/reports
```

Endpoint:

```text id="hbhxyx"
GET /:reportKey/export
```

Guards:

```text id="hhcc85"
AuthGuard
TenantGuard
TenantPermissionGuard
ReportExportGuard
```

---

# 15. DTOs principales

## 15.1. CommonReportQueryDto

Campos:

```text id="v7rh7j"
dateFrom
dateTo
billingPeriodId
periodCode
asOfDate
page
pageSize
sortBy
sortOrder
```

Validaciones:

* `dateFrom <= dateTo`;
* `periodCode` formato `YYYY-MM`;
* `page >= 1`;
* `pageSize <= 100`;
* `sortBy` permitido por reporte;
* `sortOrder` asc/desc.

---

## 15.2. FinancialReportQueryDto

Extiende `CommonReportQueryDto`.

Campos adicionales:

```text id="sam4x8"
includeReversed
includeCancelled
includeUnallocated
propertyUnitId
chargeConceptId
paymentMethod
status
```

Defaults recomendados:

```text id="itq9o2"
includeReversed = false
includeCancelled = false
includeUnallocated = true
```

---

## 15.3. PropertyUnitsReportQueryDto

Campos:

```text id="meqmkf"
status
unitType
hasDebt
hasCredit
overdueOnly
page
pageSize
sortBy
sortOrder
```

---

## 15.4. ResidentsOwnersReportQueryDto

Campos:

```text id="vp6tgj"
relationshipType
propertyUnitId
status
includeEnded
page
pageSize
sortBy
sortOrder
```

---

## 15.5. ActivityReportQueryDto

Campos:

```text id="yx24uj"
dateFrom
dateTo
actorUserId
category
action
resourceType
outcome
page
pageSize
sortBy
sortOrder
```

---

## 15.6. ExportReportQueryDto

Campos:

```text id="o4dqdw"
format
dateFrom
dateTo
billingPeriodId
periodCode
asOfDate
filters específicos por reporte
```

Formatos:

```text id="rz7te0"
json
csv
```

---

# 16. Autenticación y autorización

## 16.1. Endpoints tenant

Todos los endpoints requieren:

```text id="pxkfr8"
AuthGuard
TenantGuard
TenantPermissionGuard
```

---

## 16.2. Permisos

Permisos iniciales:

```text id="flxq7d"
reports.read
reports.export
reports.readFinancial
reports.exportFinancial
reports.readPersonalData
reports.exportPersonalData
reports.readActivity
reports.exportActivity
```

---

## 16.3. Matriz de permisos

| Reporte                  | Permiso de lectura                    | Permiso export               |
| ------------------------ | ------------------------------------- | ---------------------------- |
| operationalOverview      | `reports.read`                        | `reports.export`             |
| financialOverview        | `reports.readFinancial`               | `reports.exportFinancial`    |
| propertyUnits            | `reports.read`                        | `reports.export`             |
| propertyUnits con saldos | `reports.readFinancial`               | `reports.exportFinancial`    |
| residentsOwners          | `reports.readPersonalData`            | `reports.exportPersonalData` |
| chargesSummary           | `reports.readFinancial`               | `reports.exportFinancial`    |
| paymentsSummary          | `reports.readFinancial`               | `reports.exportFinancial`    |
| pendingPaymentValidation | `reports.readFinancial`               | `reports.exportFinancial`    |
| balancesSummary          | `reports.readFinancial`               | `reports.exportFinancial`    |
| accountStatementsSummary | `reports.readFinancial`               | `reports.exportFinancial`    |
| delinquency              | `reports.readFinancial`               | `reports.exportFinancial`    |
| collectionSummary        | `reports.readFinancial`               | `reports.exportFinancial`    |
| activity                 | `reports.readActivity` o `audit.read` | `reports.exportActivity`     |

---

## 16.4. Separación de funciones

Reglas:

```text id="gncvki"
reports.read no implica reports.export
reports.read no implica reports.readFinancial
reports.readFinancial no implica reports.exportFinancial
reports.readPersonalData no implica reports.exportPersonalData
reports.readActivity no implica reports.exportActivity
```

---

# 17. Auditoría

## 17.1. Eventos de consulta sensible

Auditar si aplica:

```text id="utvy8t"
report.viewedSensitive
financialReport.viewed
personalDataReport.viewed
activityReport.viewed
```

No auditar toda consulta ordinaria si genera volumen innecesario.

---

## 17.2. Eventos de exportación

Siempre auditar:

```text id="q8foh6"
report.exported
financialReport.exported
personalDataReport.exported
activityReport.exported
```

Metadata permitida:

```text id="sswav6"
reportKey
format
filters sanitizados
rowCount
result
traceId
```

No registrar:

```text id="s8q438"
resultado completo
CSV completo
JSON completo exportado
datos personales innecesarios
payload completo
```

---

## 17.3. Accesos denegados

Auditar accesos denegados relevantes:

```text id="g7vf0g"
report.accessDenied
financialReport.accessDenied
personalDataReport.accessDenied
```

---

# 18. Exportación

## 18.1. Formatos

MVP:

```text id="geoh3v"
json
csv
```

---

## 18.2. Seguridad CSV

Neutralizar celdas que inicien con:

```text id="pdl6ul"
=
+
-
@
```

Aplica a:

* textos;
* nombres;
* códigos;
* descripciones;
* metadata serializada;
* razones;
* columnas libres.

---

## 18.3. Límites

Valores recomendados:

```text id="ddxvda"
pageSize max 100
maxExportRows configurable
dateRange máximo configurable
```

---

## 18.4. Columnas por reporte

Cada reporte debe declarar explícitamente columnas exportables.

Regla:

```text id="f6gpwe"
No exportar campos que no estén definidos en el contrato del reporte.
```

---

# 19. Observabilidad

## 19.1. Logs técnicos

Registrar:

```text id="vzzd0p"
report.query.executed
report.query.failed
report.export.requested
report.export.completed
report.export.failed
report.access.denied
```

No registrar:

```text id="bilqz1"
resultado completo
export completo
CSV completo
datos personales innecesarios
tokens
secretos
payload financiero completo
```

---

## 19.2. Métricas

Métricas sugeridas:

```text id="nzw2jv"
reports_query_total
reports_query_failed_total
reports_export_total
reports_export_failed_total
reports_access_denied_total
reports_query_latency_ms
reports_export_latency_ms
```

Labels permitidos:

```text id="a7n73y"
reportKey
category
outcome
scope
```

Labels prohibidos:

```text id="un1fv3"
tenantId
actorUserId
propertyUnitId
resourceId
traceId
requestId
```

---

# 20. Performance

## 20.1. Objetivo MVP

Soportar inicialmente:

```text id="lveutv"
hasta 500 unidades por tenant
hasta 24 periodos consultables
hasta 10.000 movimientos financieros por tenant
```

---

## 20.2. Estrategias iniciales

* índices existentes en módulos fuente;
* consultas agregadas SQL;
* paginación obligatoria;
* filtros por tenant;
* filtros por periodo;
* evitar cargar relaciones innecesarias;
* evitar N+1 queries;
* usar `unit_balances` para saldos;
* usar `account_statements` para resúmenes por periodo;
* usar `audit_logs` con índices por tenant/fecha/categoría.

---

## 20.3. Optimización futura

Si se detecta lentitud:

```text id="gtwrom"
materialized views
precomputed aggregates
report_snapshots
read replicas
data warehouse
cache controlado
partitioning
```

---

# 21. Seguridad

## 21.1. Controles obligatorios

```text id="k563ii"
AuthGuard
TenantGuard
TenantPermissionGuard
ReportPermissionPolicyService
tenantId filter
Decimal
CSV sanitizer
export audit
logs sanitizados
metrics sin alta cardinalidad
```

---

## 21.2. Riesgos

| Riesgo                        | Mitigación                   |
| ----------------------------- | ---------------------------- |
| Mezcla de tenants             | tenantId filter + tests      |
| Reporte financiero incorrecto | financial regression tests   |
| Datos personales expuestos    | reports.readPersonalData     |
| Export sin permiso            | reports.export               |
| CSV injection                 | CSV sanitizer                |
| Consultas muy grandes         | filtros, límites, paginación |
| Reporte modifica datos        | read-only services           |
| Logs con datos sensibles      | logging policy               |

---

# 22. Migración y base de datos

## 22.1. Migración MVP

No se requiere migración obligatoria para reportes.

Motivo:

```text id="umr1u0"
Los reportes MVP se calculan bajo demanda desde tablas existentes.
```

---

## 22.2. Prisma

No se crean modelos nuevos obligatorios.

Se crearán queries/read repositories que consumen modelos existentes.

---

## 22.3. Seeds

No se requieren seeds propios obligatorios.

Se reutilizan seeds de:

```text id="a1ylzq"
001-tenants
002-users-roles
003-residents-properties
004-dues-fees
005-payments
006-account-statements
007-audit
```

Opcional:

```text id="efcpw6"
fixtures específicos de reportes para pruebas
```

---

# 23. Testing plan resumido

El documento completo será:

```text id="o90a2m"
docs/specs/008-basic-reports/test-plan.md
```

## 23.1. Unit tests

* ReportKey.
* ReportCategory.
* ReportFormat.
* ReportPeriod.
* ReportDateRange.
* ReportMoney.
* ReportSort.
* ReportPagination.
* ReportPermissionPolicyService.
* ReportFilterValidatorService.
* ReportExportService.

---

## 23.2. Integration tests

* Operational overview.
* Financial overview.
* Property units.
* Residents owners.
* Charges summary.
* Payments summary.
* Pending validation.
* Balances summary.
* Account statements summary.
* Delinquency.
* Collection summary.
* Activity report.

---

## 23.3. API tests

* todos los endpoints;
* filtros;
* paginación;
* permisos;
* exportación;
* errores.

---

## 23.4. Authorization tests

* sin token;
* sin tenant membership;
* sin `reports.read`;
* sin `reports.readFinancial`;
* sin `reports.readPersonalData`;
* sin `reports.export`;
* sin `reports.exportFinancial`.

---

## 23.5. Multitenancy tests

* Tenant A no ve Tenant B;
* export Tenant A no incluye Tenant B;
* filtros con resourceId de otro tenant no devuelven datos.

---

## 23.6. Financial regression tests

* cargos cancelados no cuentan como deuda activa;
* cargos reversados no cuentan como deuda activa;
* pagos reversados no reducen deuda;
* allocations reversadas no reducen deuda;
* pagos no asignados separados;
* saldos cuadran con `unit_balances`.

---

## 23.7. Export tests

* JSON;
* CSV;
* permisos;
* límites;
* CSV injection;
* audit events.

---

# 24. Orden recomendado de desarrollo

## Incremento 1 — Base del módulo

```text id="hg0p3r"
ReportsModule
ReportsController
DTOs comunes
Value objects
Permission policy
Filter validator
```

---

## Incremento 2 — Reportes operativos

```text id="evq6rb"
Operational Overview
Property Units Report sin saldos
Residents Owners Report
```

---

## Incremento 3 — Reportes financieros base

```text id="j3hutv"
Financial Overview
Charges Summary
Payments Summary
Balances Summary
```

---

## Incremento 4 — Reportes financieros detallados

```text id="zw4i0g"
Pending Payment Validation
Account Statements Summary
Delinquency
Collection Summary
```

---

## Incremento 5 — Actividad administrativa

```text id="v5dz8q"
Administrative Activity Report
AuditReader integration
Activity permissions
```

---

## Incremento 6 — Exportación

```text id="stnjdt"
ReportExportService
JSON export
CSV export
CSV injection protection
export audit
```

---

## Incremento 7 — Hardening

```text id="a7zdo6"
authorization tests
multitenancy tests
financial regression tests
OpenAPI
observability
CI gates
```

---

# 25. Criterios técnicos de aceptación

La implementación técnica se acepta si:

* módulo `reports` creado;
* endpoints REST implementados;
* reportes son read-only;
* reportes filtran por tenant;
* permisos se aplican;
* reportes financieros requieren permiso financiero;
* reportes personales requieren permiso personal;
* exportación requiere permiso;
* exportación se audita;
* montos usan Decimal;
* montos se devuelven como string;
* cargos cancelados/reversados no cuentan como deuda activa;
* pagos reversados no reducen deuda;
* pagos no asignados se muestran separados;
* reportes detallados paginan;
* filtros se validan;
* CSV export es seguro;
* logs sanitizados;
* métricas implementadas;
* OpenAPI actualizado;
* pruebas unitarias pasan;
* pruebas de integración pasan;
* pruebas API pasan;
* pruebas de autorización pasan;
* pruebas multitenant pasan;
* pruebas financieras pasan;
* CI pasa.

---

# 26. Comandos esperados

Comandos generales:

```bash id="qa3637"
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

Comandos específicos sugeridos:

```bash id="eey9jm"
npm run test:reports
npm run test:reports:unit
npm run test:reports:integration
npm run test:reports:api
npm run test:reports:authorization
npm run test:reports:multitenancy
npm run test:reports:financial
npm run test:reports:export
npm run test:reports:security
```

---

# 27. Riesgos de implementación

| Riesgo                          | Impacto | Mitigación                               |
| ------------------------------- | ------- | ---------------------------------------- |
| Reportes mezclan tenants        | Crítico | tenant filter + multitenancy tests       |
| Totales financieros incorrectos | Alto    | financial regression tests               |
| Uso de float                    | Alto    | ReportMoney + Decimal tests              |
| Datos personales expuestos      | Alto    | reports.readPersonalData + DTO filtering |
| Export sin permiso              | Alto    | reports.export + tests                   |
| Export financiero sin permiso   | Alto    | reports.exportFinancial                  |
| CSV injection                   | Alto    | CSV sanitizer                            |
| N+1 queries                     | Medio   | repository queries agregadas             |
| Reportes lentos                 | Medio   | índices + paginación + filtros           |
| Reportes modifican datos fuente | Crítico | read-only services + tests               |
| Auditoría de export omitida     | Alto    | ReportAuditService                       |
| Logs con datos sensibles        | Alto    | logging policy                           |

---

# 28. Checklist para agentes IA

Antes de generar código para este módulo, el agente debe leer:

```text id="jtjk2a"
docs/sdd/constitution.md
docs/sdd/domain-map.md
docs/sdd/architecture.md
docs/sdd/security.md
docs/sdd/api-guidelines.md
docs/sdd/data-governance.md
docs/specs/004-dues-fees/
docs/specs/005-payments/
docs/specs/006-account-statements/
docs/specs/007-audit/
docs/specs/008-basic-reports/spec.md
docs/specs/008-basic-reports/plan.md
```

El agente no debe:

```text id="kgn8us"
crear cargos
modificar pagos
reversar pagos
generar estados de cuenta
recalcular balances
modificar auditoría
usar float
mezclar tenants
exportar sin permiso
exponer datos personales sin permiso
guardar reportes en tablas sin spec
implementar BI avanzado
implementar PDF avanzado
implementar envío automático
implementar IA para reportes
```

---

# 29. Pendientes para documentos derivados

## 29.1. `data-model.md`

Debe detallar:

* decisión de no crear tablas obligatorias;
* posibles modelos futuros;
* fuentes por reporte;
* vistas conceptuales;
* índices requeridos en módulos fuente;
* reglas de consulta;
* reglas de agregación;
* reglas de money.

---

## 29.2. `api-contract.md`

Debe detallar:

* endpoints;
* query params;
* responses;
* permisos;
* errores;
* exportación;
* OpenAPI.

---

## 29.3. `test-plan.md`

Debe detallar:

* unit tests;
* integration tests;
* API tests;
* authorization tests;
* multitenancy tests;
* financial regression tests;
* export tests;
* security tests.

---

## 29.4. `tasks.md`

Debe convertir este plan en tareas ejecutables.

---

## 29.5. `security-notes.md`

Debe detallar:

* riesgos de reportes financieros;
* riesgos de datos personales;
* riesgos de exportación;
* multitenancy;
* CSV injection;
* auditoría de exportación;
* logs y métricas.

---

# 30. Decisión final de implementación

El módulo `008-basic-reports` se implementará como módulo `reports`, read-only, tenant-scoped y protegido por permisos.

Para MVP:

```text id="pje7r2"
- No se crearán tablas obligatorias.
- No se materializarán reportes.
- No se implementará BI avanzado.
- No se implementará PDF avanzado.
- No se implementará envío automático.
- No se implementará IA para análisis.
- Los reportes se calcularán bajo demanda.
- Se usará PostgreSQL como fuente.
- Se reutilizarán balances y estados de cuenta.
- Se auditarán exportaciones.
- Se expondrán JSON y CSV.
```

El módulo debe garantizar:

```text id="bzc8ks"
read-only behavior
tenant isolation
permissioned access
financial consistency
Decimal money
safe export
CSV injection protection
audit integration
observability
OpenAPI consistency
```

La implementación no debe aceptarse si permite reportes cross-tenant, modifica datos fuente, usa float para montos, expone datos personales sin permiso, exporta sin auditoría, incluye cargos cancelados como deuda activa, incluye pagos reversados como recaudación activa o permite CSV vulnerable a fórmula injection.
