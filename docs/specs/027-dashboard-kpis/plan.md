# Technical Plan — 027 Dashboard and KPIs

## 1. Información del documento

| Campo                 | Valor                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------- |
| Proyecto              | RESIDENT Core                                                                          |
| Spec ID               | 027                                                                                    |
| Módulo                | Dashboard and KPIs                                                                     |
| Documento             | Technical Plan                                                                         |
| Ruta                  | `docs/specs/027-dashboard-kpis/plan.md`                                                |
| Versión               | 0.1                                                                                    |
| Estado                | needs-review                                                                           |
| Fecha                 | 2026-08-02                                                                             |
| Documento base        | `docs/specs/027-dashboard-kpis/spec.md`                                                |
| Stack objetivo        | NestJS / TypeScript / PostgreSQL / Prisma / OpenAPI / Keycloak / Redis                 |
| Arquitectura objetivo | Monolito modular preparado para microservicios                                         |
| Naturaleza            | Tenant-scoped / Analytics-facing / Read-heavy / Role-aware / Derived-data / Non-public |

---

## 2. Propósito

Este documento define el plan técnico de implementación del módulo `027-dashboard-kpis`.

El módulo permitirá construir dashboards internos, widgets, métricas, KPIs, snapshots y exportaciones administrativas para RESIDENT Core, siempre derivados de datos transaccionales existentes, con visibilidad por rol, permisos, filtros, cache opcional, trazabilidad y límites estrictos de seguridad.

Regla central técnica:

```text id="dk-plan-rule"
Dashboard and KPIs debe implementarse como un módulo transversal, tenant-scoped, read-heavy, role-aware, cache-aware, derived-data y no público, capaz de consultar métricas agregadas desde módulos fuente mediante puertos controlados, presentar dashboards y widgets configurables por tenant, generar snapshots y exportaciones vía Secure Document Storage, sin convertirse en fuente primaria de verdad, sin aceptar SQL arbitrario, sin aceptar fórmulas ejecutables, sin scripts, sin modificar datos transaccionales, sin ejecutar pagos, sin crear asientos contables, sin confirmar conciliaciones bancarias, sin controlar hardware, sin exponer storageKey, sin acceso desde WordPress público y sin enviar datos reales a IA externa.
```

---

## 3. Decisión técnica principal

```text id="dk-main-decision"
Implementar Dashboard and KPIs como un módulo NestJS independiente dentro del monolito modular, con definiciones globales de dashboards, widgets y métricas, configuración tenant-scoped, cálculo de KPIs mediante servicios controlados y puertos internos hacia módulos fuente, cache opcional tenant-scoped con Redis, snapshots persistidos, exportaciones vía Secure Document Storage, API REST privada, autorización por permisos y respuesta minimizada según sensibilidad.
```

---

## 4. Nombre técnico del módulo

```text id="dk-module-name"
dashboard-kpis
```

Ruta sugerida:

```text id="dk-module-path"
apps/api/src/modules/dashboard-kpis/
```

Clase principal:

```typescript id="dk-module-class"
export class DashboardKpisModule {}
```

---

## 5. Clasificación arquitectónica

```text id="dk-architecture-classification"
Tipo: Core supporting module
Nivel: Cross-cutting analytics module
Persistencia: Propia para definiciones, configuraciones, snapshots y exports
Ejecución: Read-heavy / synchronous query / optional async export
Cache: Redis opcional
Exposición externa: API privada autenticada
Exposición pública: No
Exposición WordPress pública: No
Consumo interno: Sí, mediante puertos de métricas
Preparación microservicios: Sí
```

Este módulo se considera una capa de consulta, agregación y visualización. No reemplaza la lógica de dominio de los módulos transaccionales y no escribe directamente en sus tablas.

---

## 6. Alcance técnico MVP

### 6.1. Incluido

```text id="dk-plan-scope-in"
- Módulo NestJS dedicado.
- Catálogo global de dashboard definitions.
- Catálogo global de widget definitions.
- Catálogo global de metric definitions.
- Configuración de dashboards por tenant.
- Configuración de widgets por tenant.
- Dashboard ejecutivo.
- Dashboard financiero.
- Dashboard operativo.
- Dashboard de residentes y unidades.
- Dashboard de mantenimiento.
- Dashboard de accesos y visitantes.
- Dashboard de reuniones y gobernanza.
- Dashboard de comunicaciones y automatizaciones.
- Metric calculation services.
- Widget rendering services.
- Filtros por periodo.
- Comparación contra periodo anterior.
- Breakdown por estado/categoría cuando aplique.
- Threshold config declarativo.
- Role-aware widget visibility.
- Permission-aware metric visibility.
- Cache opcional tenant-scoped.
- Snapshot generation.
- Exportación vía Secure Document Storage.
- API Platform privada para definiciones.
- API Tenant privada para dashboards, KPIs, configuración, snapshots y exports.
- Puertos internos hacia módulos fuente.
- Integración con Tenant Settings and Policies.
- Integración con Secure Document Storage.
- Integración con Audit.
- Observabilidad.
- OpenAPI privado.
- Tests de multitenancy, privacidad, seguridad, performance y no side-effects.
```

---

### 6.2. Fuera de alcance técnico MVP

```text id="dk-plan-scope-out"
- Data warehouse dedicado.
- OLAP/cubos.
- Lakehouse.
- BI avanzado.
- SQL personalizado por usuario.
- Query builder libre.
- Fórmulas ejecutables.
- JavaScript configurable.
- Python dinámico.
- Raw SQL configurable.
- Widgets definidos por código desde cliente.
- Constructor visual drag-and-drop avanzado.
- Dashboards públicos.
- Dashboards embebidos en WordPress público.
- Dashboards para residentes en este módulo.
- Streaming en tiempo real.
- Machine learning.
- Predicción de mora.
- IA generativa con datos reales.
- Alertas automáticas complejas.
- Acciones automáticas desde widgets.
- Pagos desde dashboard.
- Validación de pagos desde dashboard.
- Reversos de pagos desde dashboard.
- Asientos contables desde dashboard.
- Confirmación de conciliaciones desde dashboard.
- Apertura de portones desde dashboard.
- Control de hardware desde dashboard.
```

---

## 7. Dependencias del módulo

### 7.1. Dependencias internas obligatorias

| Módulo                         | Uso                                                                               |
| ------------------------------ | --------------------------------------------------------------------------------- |
| `001-tenants`                  | Validar tenant activo, timezone, moneda y tenant isolation                        |
| `002-users-roles`              | Resolver actor, permisos, roles y visibilidad                                     |
| `007-audit`                    | Auditar configuración, snapshots, exports y accesos sensibles                     |
| `016-secure-document-storage`  | Guardar exportaciones                                                             |
| `025-tenant-settings-policies` | Resolver timezone, moneda, default period, cache policy, thresholds y visibilidad |

---

### 7.2. Módulos fuente de métricas

```text id="dk-source-modules"
003-residents-properties
004-dues-fees
005-payments
006-account-statements
008-basic-reports
010-reservations-common-areas
011-fines-sanctions
012-communications-notifications
013-meetings-attendance
014-voting-basic
015-certified-minutes
017-bank-reconciliation
020-accounting-ledger
021-supplier-payments
022-maintenance-work-orders
023-inventory-basic
024-access-control-visitors
026-automation-workflows-basic
007-audit
```

Regla:

```text id="dk-source-module-rule"
Dashboard and KPIs consulta datos agregados mediante puertos autorizados de módulos fuente; no escribe directamente en sus tablas, no modifica estados y no ejecuta acciones de dominio.
```

---

## 8. Estructura técnica propuesta

```text id="dk-folder-structure"
apps/api/src/modules/dashboard-kpis/
├── dashboard-kpis.module.ts
├── dashboard-kpis.config.ts
├── dashboard-kpis.constants.ts
├── controllers/
│   ├── platform-dashboard-definitions.controller.ts
│   ├── platform-dashboard-widget-definitions.controller.ts
│   ├── platform-dashboard-metric-definitions.controller.ts
│   ├── tenant-dashboards.controller.ts
│   ├── tenant-dashboard-kpis.controller.ts
│   ├── tenant-dashboard-configuration.controller.ts
│   ├── tenant-dashboard-snapshots.controller.ts
│   └── tenant-dashboard-exports.controller.ts
│
├── application/
│   ├── services/
│   │   ├── dashboard-definition.service.ts
│   │   ├── dashboard-widget-definition.service.ts
│   │   ├── dashboard-metric-definition.service.ts
│   │   ├── tenant-dashboard-configuration.service.ts
│   │   ├── tenant-widget-configuration.service.ts
│   │   ├── dashboard-query.service.ts
│   │   ├── dashboard-widget-rendering.service.ts
│   │   ├── dashboard-metric-calculation.service.ts
│   │   ├── dashboard-period.service.ts
│   │   ├── dashboard-comparison.service.ts
│   │   ├── dashboard-threshold.service.ts
│   │   ├── dashboard-cache.service.ts
│   │   ├── dashboard-snapshot.service.ts
│   │   ├── dashboard-export.service.ts
│   │   ├── dashboard-visibility.service.ts
│   │   ├── dashboard-audit.service.ts
│   │   └── dashboard-observability.service.ts
│   │
│   ├── use-cases/
│   │   ├── create-dashboard-definition.use-case.ts
│   │   ├── update-dashboard-definition.use-case.ts
│   │   ├── archive-dashboard-definition.use-case.ts
│   │   ├── create-widget-definition.use-case.ts
│   │   ├── update-widget-definition.use-case.ts
│   │   ├── archive-widget-definition.use-case.ts
│   │   ├── create-metric-definition.use-case.ts
│   │   ├── update-metric-definition.use-case.ts
│   │   ├── archive-metric-definition.use-case.ts
│   │   ├── get-tenant-dashboards.use-case.ts
│   │   ├── get-tenant-dashboard.use-case.ts
│   │   ├── get-dashboard-kpis.use-case.ts
│   │   ├── update-dashboard-configuration.use-case.ts
│   │   ├── update-widget-configuration.use-case.ts
│   │   ├── generate-dashboard-snapshot.use-case.ts
│   │   ├── archive-dashboard-snapshot.use-case.ts
│   │   ├── create-dashboard-export.use-case.ts
│   │   └── get-dashboard-export.use-case.ts
│   │
│   └── ports/
│       ├── dashboard-definition.repository.port.ts
│       ├── dashboard-widget-definition.repository.port.ts
│       ├── dashboard-metric-definition.repository.port.ts
│       ├── tenant-dashboard-configuration.repository.port.ts
│       ├── tenant-widget-configuration.repository.port.ts
│       ├── dashboard-snapshot.repository.port.ts
│       ├── dashboard-export.repository.port.ts
│       ├── dashboard-cache.port.ts
│       ├── dashboard-tenants.port.ts
│       ├── dashboard-users.port.ts
│       ├── dashboard-settings-policies.port.ts
│       ├── dashboard-document-storage.port.ts
│       ├── dashboard-audit.port.ts
│       ├── dashboard-metric-source.port.ts
│       ├── financial-metrics-source.port.ts
│       ├── residents-properties-metrics-source.port.ts
│       ├── operations-metrics-source.port.ts
│       ├── maintenance-metrics-source.port.ts
│       ├── access-metrics-source.port.ts
│       ├── governance-metrics-source.port.ts
│       └── automation-metrics-source.port.ts
│
├── domain/
│   ├── entities/
│   │   ├── dashboard-definition.entity.ts
│   │   ├── dashboard-widget-definition.entity.ts
│   │   ├── dashboard-metric-definition.entity.ts
│   │   ├── tenant-dashboard-configuration.entity.ts
│   │   ├── tenant-dashboard-widget-configuration.entity.ts
│   │   ├── dashboard-snapshot.entity.ts
│   │   └── dashboard-export.entity.ts
│   ├── value-objects/
│   │   ├── dashboard-key.vo.ts
│   │   ├── widget-key.vo.ts
│   │   ├── metric-key.vo.ts
│   │   ├── dashboard-period.vo.ts
│   │   ├── comparison-period.vo.ts
│   │   ├── metric-value.vo.ts
│   │   ├── metric-result.vo.ts
│   │   ├── widget-result.vo.ts
│   │   ├── threshold-config.vo.ts
│   │   ├── visibility-config.vo.ts
│   │   ├── dashboard-filter.vo.ts
│   │   ├── cache-key.vo.ts
│   │   ├── export-filter.vo.ts
│   │   └── sanitized-dashboard-payload.vo.ts
│   ├── policies/
│   ├── events/
│   └── errors/
│
├── infrastructure/
│   ├── persistence/
│   ├── cache/
│   ├── metrics-sources/
│   │   ├── financial/
│   │   ├── residents-properties/
│   │   ├── reservations/
│   │   ├── fines/
│   │   ├── governance/
│   │   ├── maintenance/
│   │   ├── inventory/
│   │   ├── access/
│   │   ├── communications/
│   │   ├── automation/
│   │   └── audit/
│   ├── documents/
│   ├── audit/
│   ├── tenants/
│   ├── users/
│   ├── settings-policies/
│   ├── validation/
│   └── observability/
│
├── dto/
├── guards/
├── mappers/
├── schemas/
├── seeds/
└── tests/
```

---

## 9. Componentes principales

### 9.1. Controllers

| Controller                                     | Responsabilidad                                       |
| ---------------------------------------------- | ----------------------------------------------------- |
| `PlatformDashboardDefinitionsController`       | Administrar definiciones globales de dashboards       |
| `PlatformDashboardWidgetDefinitionsController` | Administrar definiciones globales de widgets          |
| `PlatformDashboardMetricDefinitionsController` | Administrar definiciones globales de métricas         |
| `TenantDashboardsController`                   | Listar y consultar dashboards disponibles para tenant |
| `TenantDashboardKpisController`                | Consultar KPIs y widgets calculados                   |
| `TenantDashboardConfigurationController`       | Configurar dashboards y widgets del tenant            |
| `TenantDashboardSnapshotsController`           | Generar, consultar y archivar snapshots               |
| `TenantDashboardExportsController`             | Exportar dashboards y consultar exports               |

---

### 9.2. Application services

```text id="dk-application-services"
DashboardDefinitionService:
  - gestiona definiciones globales de dashboards.

DashboardWidgetDefinitionService:
  - gestiona definiciones globales de widgets.

DashboardMetricDefinitionService:
  - gestiona catálogo de métricas.

TenantDashboardConfigurationService:
  - administra configuración de dashboard por tenant.

TenantWidgetConfigurationService:
  - administra configuración de widgets por tenant.

DashboardQueryService:
  - orquesta consulta completa de dashboard.

DashboardWidgetRenderingService:
  - transforma metric results en widget results.

DashboardMetricCalculationService:
  - resuelve metricKey y delega cálculo a source adapters.

DashboardPeriodService:
  - calcula periodos, timezone y defaults.

DashboardComparisonService:
  - calcula comparación con periodo anterior.

DashboardThresholdService:
  - aplica thresholds declarativos.

DashboardCacheService:
  - maneja cache tenant-scoped y permission-aware.

DashboardSnapshotService:
  - genera snapshots sanitizados.

DashboardExportService:
  - genera exports vía Secure Document Storage.

DashboardVisibilityService:
  - filtra dashboards/widgets/métricas por permisos.

DashboardAuditService:
  - registra eventos auditables.

DashboardObservabilityService:
  - logs, métricas y trazas seguras.
```

---

## 10. Domain entities

```text id="dk-domain-entities"
DashboardDefinition
DashboardWidgetDefinition
DashboardMetricDefinition
TenantDashboardConfiguration
TenantDashboardWidgetConfiguration
DashboardSnapshot
DashboardExport
```

---

## 11. Value objects

```text id="dk-value-objects"
DashboardKey
WidgetKey
MetricKey
DashboardPeriod
ComparisonPeriod
MetricValue
MetricResult
WidgetResult
DashboardFilter
ThresholdConfig
VisibilityConfig
DashboardCacheKey
DashboardSnapshotCode
DashboardExportFilter
DashboardExportFormat
SanitizedDashboardPayload
```

---

## 12. Domain policies

```text id="dk-domain-policies"
DashboardTenantIsolationPolicy
DashboardDefinitionPolicy
DashboardWidgetDefinitionPolicy
DashboardMetricDefinitionPolicy
DashboardVisibilityPolicy
DashboardPermissionPolicy
SensitiveMetricPolicy
NoRawSqlDashboardPolicy
NoExecutableFormulaPolicy
NoPublicDashboardPolicy
NoWordPressDashboardAccessPolicy
NoTransactionalSideEffectsPolicy
NoFinancialExecutionFromDashboardPolicy
NoHardwareControlFromDashboardPolicy
NoExternalAiRealDataPolicy
DashboardCacheIsolationPolicy
DashboardSnapshotPolicy
DashboardExportPolicy
DashboardPayloadSanitizationPolicy
```

---

## 13. Modelo de datos técnico preliminar

El modelo formal se detallará en `data-model.md`.

Tablas esperadas:

```text id="dk-plan-tables"
dashboard_definitions
dashboard_widget_definitions
dashboard_metric_definitions
tenant_dashboard_configurations
tenant_dashboard_widget_configurations
dashboard_snapshots
dashboard_exports
```

---

### 13.1. Tablas platform/global

```text id="dk-platform-tables"
dashboard_definitions
dashboard_widget_definitions
dashboard_metric_definitions
```

Reglas:

```text id="dk-platform-tables-rules"
- No contienen datos transaccionales reales de tenant.
- No contienen SQL arbitrario.
- No contienen fórmulas ejecutables.
- No contienen scripts.
- No contienen secretos.
- Son gestionadas por PlatformAdmin autorizado.
```

---

### 13.2. Tablas tenant-scoped

```text id="dk-tenant-tables"
tenant_dashboard_configurations
tenant_dashboard_widget_configurations
dashboard_snapshots
dashboard_exports
```

Regla:

```text id="dk-tenant-table-rule"
Toda consulta, mutación, snapshot, exportación o configuración tenant-scoped debe filtrar por tenant_id.
```

---

## 14. Estrategia de multitenancy

### 14.1. Patrón obligatorio

```typescript id="dk-tenant-pattern"
await prisma.tenantDashboardConfiguration.findFirst({
  where: {
    id: configurationId,
    tenantId: currentTenant.id,
    archivedAt: null
  }
});
```

---

### 14.2. Patrón prohibido

```typescript id="dk-tenant-forbidden-pattern"
await prisma.tenantDashboardConfiguration.findUnique({
  where: {
    id: configurationId
  }
});
```

---

### 14.3. Respuesta cross-tenant

```http id="dk-cross-tenant-response"
404 Not Found
```

Regla:

```text id="dk-cross-tenant-rule"
No usar 403 para recursos cross-tenant cuando pueda revelar existencia de dashboards, configuraciones, snapshots o exports de otro tenant.
```

---

## 15. Estrategia de catálogos

### 15.1. Dashboard definitions

Cada dashboard global debe declarar:

```text id="dk-dashboard-definition-fields"
dashboardKey
name
description
category
scope
defaultRoleVisibility
status
```

Reglas:

```text id="dk-dashboard-definition-rules"
- dashboardKey único.
- dashboardKey estable.
- No contiene datos transaccionales.
- No contiene SQL.
- No contiene scripts.
- No contiene fórmula ejecutable.
```

---

### 15.2. Widget definitions

Cada widget debe declarar:

```text id="dk-widget-definition-fields"
widgetKey
dashboardDefinitionId
name
description
widgetType
metricKey
sourceModule
requiredPermission
sensitivity
defaultSize
defaultOrder
status
```

Reglas:

```text id="dk-widget-definition-rules"
- widgetKey único.
- widgetKey estable.
- metricKey debe existir.
- sourceModule debe coincidir con metric source.
- requiredPermission obligatorio si sensitivity != internal.
- No contiene SQL.
- No contiene código ejecutable.
```

---

### 15.3. Metric definitions

Cada métrica debe declarar:

```text id="dk-metric-definition-fields"
metricKey
name
description
category
sourceModule
valueType
aggregationType
sensitivity
supportsComparison
supportsTrend
supportsBreakdown
requiredPermission
status
```

Reglas:

```text id="dk-metric-definition-rules"
- metricKey único.
- Cálculo implementado por código interno controlado.
- No se acepta fórmula definida por usuario.
- No se acepta SQL desde cliente.
- No se aceptan source modules no allowlisted.
```

---

## 16. Estrategia de cálculo de métricas

### 16.1. Resolución de metricKey

```text id="dk-metric-resolution"
1. Recibir dashboardKey y filtros.
2. Resolver dashboard definition.
3. Resolver widgets habilitados.
4. Resolver metric definitions.
5. Filtrar por permisos.
6. Construir DashboardPeriod.
7. Consultar cache si aplica.
8. Calcular métrica mediante adapter del módulo fuente.
9. Aplicar comparison si aplica.
10. Aplicar threshold si aplica.
11. Sanitizar resultado.
12. Devolver WidgetResult.
```

---

### 16.2. Contrato interno de cálculo

```typescript id="dk-metric-calculator-contract"
export interface DashboardMetricCalculator {
  supports(metricKey: string): boolean;

  calculate(input: DashboardMetricCalculationInput): Promise<DashboardMetricCalculationResult>;
}
```

Input conceptual:

```typescript id="dk-metric-calculation-input"
type DashboardMetricCalculationInput = {
  tenantId: string;
  metricKey: string;
  periodFrom: string;
  periodTo: string;
  comparisonPeriodFrom?: string;
  comparisonPeriodTo?: string;
  filters: Record<string, unknown>;
  actorUserProfileId: string;
  permissions: string[];
  traceId: string;
};
```

Result conceptual:

```typescript id="dk-metric-calculation-result"
type DashboardMetricCalculationResult = {
  metricKey: string;
  value: string | number | boolean | null;
  valueType: "count" | "amount" | "percentage" | "duration" | "ratio" | "status";
  currency?: string;
  status: "available" | "partial" | "unavailable";
  comparison?: {
    previousValue: string | number | null;
    delta: string | number | null;
    deltaPercentage?: string | number | null;
  };
  breakdown?: Array<{
    key: string;
    label: string;
    value: string | number;
  }>;
  sourceModule: string;
  calculatedAt: string;
};
```

---

### 16.3. Manejo de fuentes fallidas

Reglas:

```text id="dk-source-failure-rules"
- Si una fuente falla, el widget debe marcarse unavailable.
- Si una fuente retorna datos incompletos, el widget debe marcarse partial.
- No se debe mostrar cero silencioso si la fuente falló.
- El error técnico debe sanitizarse.
- El dashboard completo no debe fallar por un solo widget salvo que sea crítico.
```

---

## 17. Estrategia de widgets

### 17.1. Widget types MVP

```text id="dk-widget-types-plan"
kpiCard
numberCard
currencyCard
percentageCard
trendCard
statusBreakdown
barChart
lineChart
donutChart
tableSummary
alertList
```

---

### 17.2. Widget result shape

```typescript id="dk-widget-result-shape"
type DashboardWidgetResult = {
  widgetKey: string;
  widgetType: string;
  title: string;
  description?: string;
  metricKey: string;
  value: string | number | boolean | null;
  valueType: string;
  displayValue: string;
  status: "available" | "partial" | "unavailable";
  sensitivity: string;
  comparison?: Record<string, unknown>;
  breakdown?: Array<Record<string, unknown>>;
  threshold?: {
    status: "normal" | "warning" | "critical" | "neutral";
    label?: string;
  };
  sourceModule: string;
  calculatedAt: string;
};
```

---

### 17.3. Reglas de rendering

```text id="dk-widget-rendering-rules"
- WidgetResult no contiene raw records salvo widget tipo tableSummary autorizado.
- WidgetResult no contiene datos personales completos salvo permiso reforzado.
- WidgetResult no contiene storageKey.
- WidgetResult no contiene SQL.
- WidgetResult no contiene stack trace.
- Widget unavailable conserva errorCode sanitizado.
```

---

## 18. Estrategia de visibilidad

### 18.1. Filtros de visibilidad

```text id="dk-visibility-filters"
- Authenticated user.
- Current tenant membership.
- Tenant role.
- Permissions.
- Sensitive permissions.
- Widget requiredPermission.
- Metric requiredPermission.
- Source module permission.
- Tenant dashboard configuration.
- Tenant widget configuration.
```

---

### 18.2. Regla de doble autorización

```text id="dk-double-authz-rule"
Para ver una métrica sensible, el usuario debe tener permiso de dashboard y permiso compatible con la categoría del módulo fuente.
```

Ejemplo:

```text id="dk-double-authz-example"
tenantDashboards.read + tenantDashboardMetrics.readFinancial
```

Para detalle financiero:

```text id="dk-financial-detail-authz"
tenantDashboards.read + tenantDashboardMetrics.readFinancialDetail
```

---

## 19. Estrategia de periodos

### 19.1. Periodos soportados

```text id="dk-supported-periods"
today
thisWeek
thisMonth
previousMonth
thisQuarter
thisYear
custom
```

---

### 19.2. Timezone

```text id="dk-timezone"
Usar timezone efectivo del tenant desde 025-tenant-settings-policies o 001-tenants.
Default: America/Guayaquil.
```

---

### 19.3. Comparación contra periodo anterior

Regla:

```text id="dk-comparison-rule"
La comparación contra periodo anterior debe usar una ventana equivalente en duración y timezone.
```

Ejemplo:

```text id="dk-comparison-example"
periodFrom=2026-08-01
periodTo=2026-08-31

comparisonPeriodFrom=2026-07-01
comparisonPeriodTo=2026-07-31
```

---

## 20. Estrategia de cache

### 20.1. Tecnología

```text id="dk-cache-tech"
Redis opcional mediante DashboardCachePort.
```

---

### 20.2. Cache key

```text id="dk-cache-key"
tenant:{tenantId}:dashboard:{dashboardKey}:widget:{widgetKey}:period:{periodHash}:filters:{filterHash}:perm:{permissionHash}
```

---

### 20.3. Reglas

```text id="dk-cache-rules"
- Cache tenant-scoped obligatorio.
- Cache debe incluir permissionHash.
- Cache debe incluir filtros.
- Cache debe incluir periodo.
- Widgets sensibles pueden deshabilitar cache.
- Widgets financieros pueden usar TTL corto.
- Widgets de seguridad pueden usar TTL muy corto o cache disabled.
- No cachear responses con datos personales detallados salvo permiso y TTL reducido.
- Invalidation puede ser eventual en MVP.
```

---

### 20.4. TTL recomendado MVP

```text id="dk-cache-ttl"
general widgets: 300 segundos
financial widgets: 120 segundos
security widgets: 60 segundos
audit widgets: 60 segundos
sensitive detailed widgets: cache disabled
```

---

## 21. Estrategia de snapshots

### 21.1. Uso

```text id="dk-snapshot-use"
Snapshots sirven para conservar una captura administrativa de KPIs calculados en un periodo determinado.
```

---

### 21.2. Reglas

```text id="dk-snapshot-rules"
- Snapshot pertenece a tenant.
- Snapshot requiere tenantDashboards.snapshot.
- Snapshot solo incluye widgets visibles para el actor o para el scope solicitado permitido.
- Snapshot contiene snapshotDataSanitized.
- Snapshot no contiene storageKey.
- Snapshot no contiene datos cross-tenant.
- Snapshot no reemplaza fuente transaccional.
- Snapshot se audita.
```

---

### 21.3. Status

```text id="dk-snapshot-status"
generated
failed
archived
```

---

## 22. Estrategia de exports

### 22.1. Export types

```text id="dk-export-types-plan"
dashboardCurrentView
dashboardSnapshot
financialKpiSummary
operationsKpiSummary
securityKpiSummary
maintenanceKpiSummary
fullDashboardSummary
```

---

### 22.2. Formatos

```text id="dk-export-formats-plan"
json
xlsx
pdf
```

MVP recomendado:

```text id="dk-export-mvp-formats"
json
xlsx
```

---

### 22.3. Reglas

```text id="dk-export-rules-plan"
- Export requiere tenantDashboards.export.
- Export sensible requiere tenantDashboards.exportSensitive.
- Export financiero detallado requiere tenantDashboardMetrics.readFinancialDetail.
- Export seguridad detallada requiere tenantDashboardMetrics.readSecurityDetail.
- Export auditoría requiere tenantDashboardMetrics.readAuditDetail.
- Export usa Secure Document Storage.
- Response devuelve secureDocumentId.
- Response no devuelve storageKey.
- Export no contiene SQL.
- Export no contiene scripts.
- Export no contiene datos cross-tenant.
- Export se audita.
```

---

## 23. Estrategia de API

### 23.1. Base path

```text id="dk-base-path"
/api/v1
```

---

### 23.2. Platform API

```text id="dk-platform-api-plan"
/api/v1/platform/dashboard-definitions
/api/v1/platform/dashboard-widget-definitions
/api/v1/platform/dashboard-metric-definitions
```

---

### 23.3. Tenant API

```text id="dk-tenant-api-plan"
/api/v1/tenant/dashboards
/api/v1/tenant/dashboard-snapshots
/api/v1/tenant/dashboard-exports
```

---

### 23.4. Internal API

```text id="dk-internal-api-plan"
calculateMetric(input)
calculateDashboard(input)
resolveDashboardVisibility(input)
generateDashboardSnapshot(input)
```

---

### 23.5. Public API prohibida

No implementar:

```text id="dk-public-api-forbidden"
/api/v1/public/dashboards
/api/v1/public/dashboard-kpis
/api/v1/public/tenants/{slug}/dashboards
/api/v1/public/tenants/{slug}/dashboard-kpis
```

Respuesta esperada:

```http id="dk-public-api-response"
404 Not Found
```

---

## 24. DTO strategy

### 24.1. DTOs principales

```text id="dk-dtos"
CreateDashboardDefinitionDto
UpdateDashboardDefinitionDto
ArchiveDashboardDefinitionDto

CreateDashboardWidgetDefinitionDto
UpdateDashboardWidgetDefinitionDto
ArchiveDashboardWidgetDefinitionDto

CreateDashboardMetricDefinitionDto
UpdateDashboardMetricDefinitionDto
ArchiveDashboardMetricDefinitionDto

UpdateTenantDashboardConfigurationDto
UpdateTenantDashboardWidgetConfigurationDto

DashboardQueryDto
DashboardKpiQueryDto

GenerateDashboardSnapshotDto
ArchiveDashboardSnapshotDto

CreateDashboardExportDto
```

---

### 24.2. Campos prohibidos

Todo DTO externo debe rechazar:

```text id="dk-plan-forbidden-dto"
tenantId
createdBy
updatedBy
generatedBy
requestedBy
archivedBy
status directo fuera de endpoint de transición
rawSql
sql
script
javascript
functionBody
executableCode
formulaCode
eval
Function
storageKey
signedUrl
secret
token
password
apiKey
paymentId para mutación
journalEntryId para mutación
bankTransactionId para mutación
reconciliationMatchId para mutación
gateOpenCommand
hardwareDeviceCommand
externalAiEnabled
externalAiRealDataAllowed
```

---

### 24.3. DTO mapping seguro

Prohibido:

```typescript id="dk-dto-map-forbidden"
const data = { ...dto };
await prisma.dashboardMetricDefinition.create({ data });
```

Permitido:

```typescript id="dk-dto-map-safe"
const command = CreateDashboardMetricDefinitionCommand.fromDto(dto, {
  actorUserProfileId: currentUser.id,
  traceId: requestContext.traceId
});
```

---

## 25. Guards

### 25.1. Guards obligatorios

```text id="dk-guards"
AuthGuard
TenantGuard
PermissionGuard
SensitivePermissionGuard
PlatformPermissionGuard
DashboardTenantGuard
DashboardConfigurationTenantGuard
DashboardSnapshotTenantGuard
DashboardExportTenantGuard
DashboardMetricVisibilityGuard
```

---

### 25.2. Uso por superficie

| Superficie            | Guards                                                                                        |
| --------------------- | --------------------------------------------------------------------------------------------- |
| Platform API          | AuthGuard, PlatformPermissionGuard                                                            |
| Tenant Dashboards API | AuthGuard, TenantGuard, PermissionGuard                                                       |
| Tenant KPIs API       | AuthGuard, TenantGuard, PermissionGuard, DashboardMetricVisibilityGuard                       |
| Tenant Config API     | AuthGuard, TenantGuard, PermissionGuard                                                       |
| Snapshots API         | AuthGuard, TenantGuard, PermissionGuard, DashboardSnapshotTenantGuard                         |
| Exports API           | AuthGuard, TenantGuard, PermissionGuard, SensitivePermissionGuard, DashboardExportTenantGuard |
| Sensitive widgets     | SensitivePermissionGuard, DashboardMetricVisibilityGuard                                      |

---

## 26. Permisos

### 26.1. Platform

```text id="dk-platform-permissions"
dashboardDefinitions.read
dashboardDefinitions.create
dashboardDefinitions.update
dashboardDefinitions.archive

dashboardWidgetDefinitions.read
dashboardWidgetDefinitions.create
dashboardWidgetDefinitions.update
dashboardWidgetDefinitions.archive

dashboardMetricDefinitions.read
dashboardMetricDefinitions.create
dashboardMetricDefinitions.update
dashboardMetricDefinitions.archive

dashboardDefinitions.manageSensitive
```

---

### 26.2. Tenant

```text id="dk-tenant-permissions"
tenantDashboards.read
tenantDashboards.configure
tenantDashboards.snapshot
tenantDashboards.export

tenantDashboardWidgets.read
tenantDashboardWidgets.configure

tenantDashboardMetrics.read
tenantDashboardMetrics.readFinancial
tenantDashboardMetrics.readOperational
tenantDashboardMetrics.readSecurity
tenantDashboardMetrics.readAudit
tenantDashboardMetrics.readSensitive
```

---

### 26.3. Sensibles

```text id="dk-sensitive-permissions"
tenantDashboards.exportSensitive
tenantDashboardMetrics.readPersonalData
tenantDashboardMetrics.readFinancialDetail
tenantDashboardMetrics.readSecurityDetail
tenantDashboardMetrics.readAuditDetail
dashboardDefinitions.manageSensitive
```

---

## 27. Puertos de integración

### 27.1. Tenants port

```typescript id="dk-tenants-port"
export interface DashboardTenantsPort {
  validateTenantIsActive(tenantId: string): Promise<void>;
  getTenantTimezone(tenantId: string): Promise<string>;
  getTenantCurrency(tenantId: string): Promise<string>;
  getTenantOperationalSummary(tenantId: string): Promise<TenantOperationalSummary>;
}
```

---

### 27.2. Users port

```typescript id="dk-users-port"
export interface DashboardUsersPort {
  getActorProfile(userProfileId: string): Promise<ActorProfile>;
  getActorPermissions(tenantId: string, userProfileId: string): Promise<string[]>;
  validateDashboardAccess(tenantId: string, userProfileId: string, permission: string): Promise<void>;
}
```

---

### 27.3. Settings and policies port

```typescript id="dk-settings-port"
export interface DashboardSettingsPoliciesPort {
  resolveDashboardPolicy(tenantId: string): Promise<DashboardPolicy>;
  resolveDefaultDashboardPeriod(tenantId: string): Promise<DefaultDashboardPeriod>;
  resolveDashboardCachePolicy(tenantId: string): Promise<DashboardCachePolicy>;
  resolveDashboardThresholds(tenantId: string): Promise<DashboardThresholdPolicy>;
  resolveDashboardExportPolicy(tenantId: string): Promise<DashboardExportPolicy>;
}
```

---

### 27.4. Metric source port

```typescript id="dk-metric-source-port"
export interface DashboardMetricSourcePort {
  supports(metricKey: string): boolean;
  calculate(input: DashboardMetricCalculationInput): Promise<DashboardMetricCalculationResult>;
}
```

---

### 27.5. Secure Document Storage port

```typescript id="dk-sds-port"
export interface DashboardDocumentStoragePort {
  createExportDocument(input: CreateDashboardExportDocumentInput): Promise<{
    secureDocumentId: string;
  }>;
}
```

---

### 27.6. Audit port

```typescript id="dk-audit-port"
export interface DashboardAuditPort {
  record(event: DashboardAuditEvent): Promise<void>;
}
```

---

## 28. Source adapters iniciales

```text id="dk-source-adapters"
FinancialMetricsAdapter:
  - 004-dues-fees
  - 005-payments
  - 006-account-statements
  - 017-bank-reconciliation
  - 020-accounting-ledger
  - 021-supplier-payments

ResidentsPropertiesMetricsAdapter:
  - 003-residents-properties

ReservationsMetricsAdapter:
  - 010-reservations-common-areas

FinesMetricsAdapter:
  - 011-fines-sanctions

GovernanceMetricsAdapter:
  - 013-meetings-attendance
  - 014-voting-basic
  - 015-certified-minutes

MaintenanceMetricsAdapter:
  - 022-maintenance-work-orders

InventoryMetricsAdapter:
  - 023-inventory-basic

AccessMetricsAdapter:
  - 024-access-control-visitors

CommunicationsMetricsAdapter:
  - 012-communications-notifications

AutomationMetricsAdapter:
  - 026-automation-workflows-basic

AuditSecurityMetricsAdapter:
  - 007-audit
```

---

## 29. Límites explícitos de dominio

### 29.1. No acciones financieras

Prohibido desde dashboards:

```text id="dk-no-financial-actions"
- crear Payment;
- validar Payment;
- rechazar Payment;
- reversar Payment;
- crear Charge;
- generar ChargeBatch;
- crear SupplierPaymentOrder;
- crear SupplierPayable;
- crear JournalEntry;
- crear JournalEntryLine;
- confirmar Bank Reconciliation;
- crear ReconciliationMatch confirmado;
```

---

### 29.2. No acciones operativas destructivas

Prohibido desde dashboards:

```text id="dk-no-operational-actions"
- crear reservas;
- aprobar reservas;
- cancelar reservas;
- crear multas;
- resolver apelaciones;
- crear work orders;
- modificar inventory movements;
- crear stock adjustments;
- crear access events;
- crear check-ins;
- crear check-outs;
```

---

### 29.3. No hardware

Prohibido:

```text id="dk-no-hardware"
- abrir portones;
- cerrar portones;
- controlar torniquetes;
- activar cerraduras;
- consumir cámaras;
- OCR automático de placas;
- biometría;
- reconocimiento facial;
- enviar gateOpenCommand;
- enviar hardwareDeviceCommand;
```

---

### 29.4. No external AI

Prohibido:

```text id="dk-no-external-ai"
- enviar dashboards reales a IA externa;
- enviar KPIs reales a IA externa;
- enviar snapshots reales a IA externa;
- enviar exports reales a IA externa;
- enviar datos financieros reales a IA externa;
- enviar datos personales reales a IA externa;
- enviar datos de seguridad o acceso a IA externa.
```

---

## 30. Estrategia de auditoría

### 30.1. Eventos obligatorios

```text id="dk-plan-audit-events"
dashboardDefinition.created
dashboardDefinition.updated
dashboardDefinition.archived

dashboardWidgetDefinition.created
dashboardWidgetDefinition.updated
dashboardWidgetDefinition.archived

dashboardMetricDefinition.created
dashboardMetricDefinition.updated
dashboardMetricDefinition.archived

tenantDashboardConfiguration.created
tenantDashboardConfiguration.updated
tenantDashboardConfiguration.archived

tenantDashboardWidgetConfiguration.created
tenantDashboardWidgetConfiguration.updated
tenantDashboardWidgetConfiguration.archived

dashboardSnapshot.generated
dashboardSnapshot.archived
dashboardSnapshot.failed

dashboardExport.requested
dashboardExport.completed
dashboardExport.failed
dashboardExport.archived

dashboardSensitiveMetric.accessed
```

---

### 30.2. Metadata permitida

```text id="dk-plan-audit-allowed"
dashboardKey
widgetKey
metricKey
snapshotId
exportId
periodFrom
periodTo
format
exportType
status
reason
traceId
correlationId
```

---

### 30.3. Metadata prohibida

```text id="dk-plan-audit-forbidden"
storageKey
signedUrl
secret
token
password
apiKey
rawSql
script
raw payload sensible
datos cross-tenant
identificación completa
placa completa
authorization header
cookie
```

---

## 31. Observabilidad técnica

### 31.1. Logs permitidos

```text id="dk-plan-logs"
dashboard.requested
dashboard.rendered
dashboard.widget.calculated
dashboard.widget.failed
dashboard.snapshot.generated
dashboard.export.requested
dashboard.export.completed
dashboard.export.failed
dashboard.configuration.updated
```

---

### 31.2. Métricas

```text id="dk-plan-metrics"
dashboard_requests_total
dashboard_render_duration_ms
dashboard_widget_calculation_duration_ms
dashboard_widget_failures_total
dashboard_snapshots_generated_total
dashboard_exports_total
dashboard_cache_hits_total
dashboard_cache_misses_total
```

---

### 31.3. Labels permitidos

```text id="dk-plan-metric-labels-allowed"
dashboardKey
widgetType
metricKey
sourceModule
status
outcome
errorCode
```

---

### 31.4. Labels prohibidos

```text id="dk-plan-metric-labels-forbidden"
tenantId
userId
personId
propertyUnitId
snapshotId
exportId
traceId
secretKey
```

---

## 32. OpenAPI strategy

### 32.1. Tags

```text id="dk-openapi-tags-plan"
Platform Dashboard Definitions
Platform Dashboard Widget Definitions
Platform Dashboard Metric Definitions
Tenant Dashboards
Tenant Dashboard Widgets
Tenant Dashboard KPIs
Tenant Dashboard Snapshots
Tenant Dashboard Exports
```

---

### 32.2. Extensiones globales

```yaml id="dk-openapi-extensions-plan"
x-auth-required: true
x-dashboard-kpis: true
x-derived-data: true
x-read-only: true
x-public-exposure: false
x-wordpress-access: false
x-storage-key-exposed: false
x-raw-sql-allowed: false
x-executable-formula: false
x-payment-execution: false
x-accounting-execution: false
x-bank-reconciliation-confirmation: false
x-hardware-control: false
x-external-ai-real-data: false
```

---

### 32.3. Rutas platform

```yaml id="dk-openapi-platform"
x-platform-scope: true
x-platform-admin-required: true
```

---

### 32.4. Rutas tenant

```yaml id="dk-openapi-tenant"
x-tenant-scope: true
x-permission-required: true
```

---

### 32.5. Rutas de exportación

```yaml id="dk-openapi-export"
x-secure-document-storage: true
x-storage-key-exposed: false
```

---

## 33. Configuración y feature flags

### 33.1. Variables recomendadas

```text id="dk-env-vars"
DASHBOARD_KPIS_ENABLED=true
DASHBOARD_KPIS_CACHE_ENABLED=true
DASHBOARD_KPIS_REDIS_CACHE_ENABLED=false
DASHBOARD_KPIS_SNAPSHOTS_ENABLED=true
DASHBOARD_KPIS_EXPORT_ENABLED=true
DASHBOARD_KPIS_PUBLIC_ENDPOINTS_ENABLED=false
DASHBOARD_KPIS_WORDPRESS_ACCESS_ENABLED=false
DASHBOARD_KPIS_RAW_SQL_ENABLED=false
DASHBOARD_KPIS_EXECUTABLE_FORMULAS_ENABLED=false
DASHBOARD_KPIS_EXTERNAL_AI_ENABLED=false
DASHBOARD_KPIS_PAYMENT_EXECUTION_ENABLED=false
DASHBOARD_KPIS_ACCOUNTING_EXECUTION_ENABLED=false
DASHBOARD_KPIS_BANK_RECONCILIATION_CONFIRM_ENABLED=false
DASHBOARD_KPIS_HARDWARE_CONTROL_ENABLED=false
DASHBOARD_KPIS_DEFAULT_CACHE_TTL_SECONDS=300
DASHBOARD_KPIS_FINANCIAL_CACHE_TTL_SECONDS=120
DASHBOARD_KPIS_SECURITY_CACHE_TTL_SECONDS=60
DASHBOARD_KPIS_MAX_WIDGETS_PER_DASHBOARD=30
DASHBOARD_KPIS_DEFAULT_PAGE_SIZE=25
DASHBOARD_KPIS_MAX_PAGE_SIZE=100
```

---

### 33.2. Boot validation

El boot debe fallar si:

```text id="dk-boot-validation"
DASHBOARD_KPIS_PUBLIC_ENDPOINTS_ENABLED=true
DASHBOARD_KPIS_WORDPRESS_ACCESS_ENABLED=true
DASHBOARD_KPIS_RAW_SQL_ENABLED=true
DASHBOARD_KPIS_EXECUTABLE_FORMULAS_ENABLED=true
DASHBOARD_KPIS_EXTERNAL_AI_ENABLED=true
DASHBOARD_KPIS_PAYMENT_EXECUTION_ENABLED=true
DASHBOARD_KPIS_ACCOUNTING_EXECUTION_ENABLED=true
DASHBOARD_KPIS_BANK_RECONCILIATION_CONFIRM_ENABLED=true
DASHBOARD_KPIS_HARDWARE_CONTROL_ENABLED=true
```

---

## 34. Seeds iniciales

### 34.1. Dashboard definitions

```text id="dk-seed-dashboard-definitions"
executive.overview
financial.overview
operations.overview
residentsUnits.overview
maintenance.overview
accessVisitors.overview
governance.overview
communicationsAutomation.overview
```

---

### 34.2. Widget definitions por dashboard

```text id="dk-seed-widget-definitions"
executive.totalUnits
executive.occupancyRate
executive.outstandingBalance
executive.overdueBalance
executive.pendingPaymentValidations
executive.openMaintenanceRequests
executive.openAccessIncidents
executive.failedAutomationExecutions

financial.chargesIssuedAmount
financial.paymentsValidatedAmount
financial.outstandingBalance
financial.overdueBalance
financial.delinquencyRate
financial.collectionRate
financial.averageDaysToPayment
financial.pendingPaymentValidationAmount

operations.reservationsThisMonth
operations.reservationsPendingApproval
operations.commonAreaUtilizationRate
operations.finesIssuedThisMonth
operations.openMaintenanceRequests
operations.lowStockItems
operations.openIncidents

residents.totalUnits
residents.occupiedUnits
residents.vacantUnits
residents.registeredResidents
residents.withoutUserAccount
residents.vehiclesRegistered
residents.petsRegistered

maintenance.requestsOpen
maintenance.requestsInProgress
maintenance.requestsCompleted
maintenance.overdueWorkOrders
maintenance.averageResolutionTime
maintenance.pendingCostApprovals
maintenance.byPriorityBreakdown

access.visitorsToday
access.openCheckIns
access.deniedAccessCount
access.openIncidents
access.openCheckInsExceededThreshold
access.supplierVisitsToday

governance.upcomingMeetings
governance.averageAttendanceRate
governance.quorumAchievedCount
governance.votingSessionsClosed
governance.certifiedMinutesPublished

communications.sentCount
communications.unreadCriticalCount
communications.deliveryFailedCount
automation.activeWorkflows
automation.executionsFailed
automation.deadLettersOpen
```

---

### 34.3. Metric definitions

El catálogo inicial debe incluir las métricas definidas en `spec.md`:

```text id="dk-seed-metric-definitions"
financial.*
properties.*
residents.*
reservations.*
fines.*
meetings.*
voting.*
certifiedMinutes.*
maintenance.*
inventory.*
access.*
communications.*
automation.*
audit.*
```

---

### 34.4. Reglas de seeds

```text id="dk-seed-rules"
- Seeds deben ser idempotentes.
- Seeds no deben contener datos reales.
- Seeds no deben contener SQL.
- Seeds no deben contener scripts.
- Seeds no deben habilitar widgets públicos.
- Seeds no deben habilitar widgets de WordPress público.
- Seeds no deben habilitar acciones transaccionales.
- Seeds no deben habilitar IA externa.
```

---

## 35. Testing strategy

El detalle completo se definirá en `test-plan.md`.

### 35.1. Tests unitarios

```text id="dk-unit-tests"
- value objects;
- metric key validators;
- dashboard key validators;
- widget key validators;
- period calculator;
- comparison calculator;
- threshold evaluator;
- visibility policy;
- cache key builder;
- sanitizers.
```

---

### 35.2. Tests de integración

```text id="dk-integration-tests"
- Prisma repositories;
- source adapters;
- metric calculation service;
- widget rendering service;
- cache adapter;
- snapshot service;
- export service;
- SDS adapter;
- audit adapter;
- settings policies adapter.
```

---

### 35.3. Tests API

```text id="dk-api-tests"
- Platform Dashboard Definitions API.
- Platform Widget Definitions API.
- Platform Metric Definitions API.
- Tenant Dashboards API.
- Tenant KPIs API.
- Tenant Configuration API.
- Snapshot API.
- Export API.
- Permissions.
- Sensitive permissions.
- Cross-tenant 404.
- Response minimization.
```

---

### 35.4. Tests de seguridad

```text id="dk-security-tests"
- no tenantId in DTO;
- no actor fields in DTO;
- no raw SQL;
- no scripts;
- no executable formulas;
- no public endpoints;
- no WordPress access;
- no storageKey exposure;
- no financial execution;
- no accounting execution;
- no bank reconciliation confirmation;
- no hardware control;
- no external AI;
- privacy masking;
- cache permission isolation.
```

---

## 36. Performance strategy

### 36.1. Objetivos MVP

```text id="dk-performance-targets"
- Dashboard ejecutivo p95 < 1500 ms con cache.
- Dashboard financiero p95 < 2000 ms con cache.
- Dashboard operativo p95 < 2000 ms con cache.
- Widget individual p95 < 800 ms con cache.
- Widget individual p95 < 1500 ms sin cache en dataset MVP.
- Export pequeño p95 < 3000 ms.
- pageSize máximo = 100.
```

---

### 36.2. Optimización

```text id="dk-performance-optimization"
- Índices por tenant_id en configuraciones, snapshots y exports.
- Índices por dashboard_key, widget_key y metric_key.
- select explícito.
- Puertos de métricas agregadas.
- Evitar N+1.
- Cache por widget.
- TTL corto para datos sensibles.
- Paginación obligatoria en tableSummary.
- Límite de widgets por dashboard.
```

---

## 37. Concurrency strategy

Casos críticos:

```text id="dk-concurrency-cases"
- dos usuarios actualizan configuración del mismo dashboard;
- dos usuarios actualizan orden del mismo widget;
- snapshot se genera mientras cambian widgets;
- export se solicita mientras una fuente está parcial;
- cache se invalida mientras se calcula widget;
- PlatformAdmin archiva metric definition usada por widget;
- TenantAdmin deshabilita dashboard mientras otro usuario lo consulta.
```

Controles:

```text id="dk-concurrency-controls"
- transacciones;
- optimistic locking con updatedAt donde aplique;
- validación de status post-load;
- cache invalidation post-commit;
- snapshots usan definición y configuración en momento de generación;
- exports registran filtros y periodo;
- audit de conflictos.
```

---

## 38. Plan de implementación por fases

### 38.1. Fase 1 — Base del módulo

```text id="dk-phase-1"
- Crear módulo NestJS.
- Crear config y feature flags.
- Crear enums.
- Crear errores.
- Crear value objects.
- Crear validators base.
- Crear domain policies.
```

---

### 38.2. Fase 2 — Persistencia

```text id="dk-phase-2"
- Crear Prisma schema.
- Crear migración.
- Crear repositories.
- Crear índices y constraints.
- Crear seeds de dashboards, widgets y métricas.
```

---

### 38.3. Fase 3 — Platform catalog API

```text id="dk-phase-3"
- Implementar DashboardDefinitions API.
- Implementar WidgetDefinitions API.
- Implementar MetricDefinitions API.
- Implementar validaciones de catálogo.
- Implementar audit de catálogo.
```

---

### 38.4. Fase 4 — Tenant configuration

```text id="dk-phase-4"
- Implementar configuración de dashboards.
- Implementar configuración de widgets.
- Implementar thresholds.
- Implementar visibilityConfig.
- Implementar audit de configuración.
```

---

### 38.5. Fase 5 — Metric engine

```text id="dk-phase-5"
- Implementar DashboardMetricCalculationService.
- Implementar period service.
- Implementar comparison service.
- Implementar source adapters iniciales.
- Implementar status partial/unavailable.
```

---

### 38.6. Fase 6 — Dashboard query and widget rendering

```text id="dk-phase-6"
- Implementar DashboardQueryService.
- Implementar WidgetRenderingService.
- Implementar VisibilityService.
- Implementar threshold evaluation.
- Implementar response sanitizer.
```

---

### 38.7. Fase 7 — Cache

```text id="dk-phase-7"
- Implementar DashboardCachePort.
- Implementar RedisDashboardCacheAdapter opcional.
- Implementar cache keys.
- Implementar permissionHash.
- Implementar TTL por sensibilidad.
- Implementar invalidation básica.
```

---

### 38.8. Fase 8 — Snapshots and exports

```text id="dk-phase-8"
- Implementar snapshot service.
- Implementar snapshot API.
- Implementar export service.
- Integrar Secure Document Storage.
- Implementar export API.
```

---

### 38.9. Fase 9 — Security, observability and OpenAPI

```text id="dk-phase-9"
- Implementar guards.
- Implementar sensitive permissions.
- Implementar privacy masking.
- Implementar log sanitizer.
- Implementar metrics.
- Implementar OpenAPI.
- Implementar security tests.
```

---

### 38.10. Fase 10 — Hardening

```text id="dk-phase-10"
- Ejecutar tests de multitenancy.
- Ejecutar tests de cache isolation.
- Ejecutar tests de privacy.
- Ejecutar tests de no side-effects.
- Ejecutar tests de performance.
- Ejecutar smoke tests.
- Ajustar CI gates.
```

---

## 39. Riesgos técnicos y mitigaciones

| Riesgo                                    |      Nivel | Mitigación                                                    |
| ----------------------------------------- | ---------: | ------------------------------------------------------------- |
| Mezcla de datos entre tenants             |    Crítico | tenant_id, TenantGuard, repositories tenant-scoped, tests 404 |
| Cache compartido entre permisos distintos |       Alto | permissionHash en cache key                                   |
| KPI financiero visible sin permiso        |       Alto | SensitivePermissionGuard + metric requiredPermission          |
| Dashboard expone datos personales         |       Alto | minimización, masking, permisos reforzados                    |
| Fuente falla y KPI muestra cero           | Medio/Alto | status partial/unavailable                                    |
| Widget con SQL arbitrario                 |    Crítico | no raw SQL, metric catalog cerrado                            |
| Fórmula ejecutable                        |    Crítico | no executable formulas                                        |
| Export con storageKey                     |    Crítico | SDS boundary tests                                            |
| WordPress consume dashboard privado       |       Alto | no public endpoints, CORS restrictivo                         |
| Performance pobre por agregaciones        | Medio/Alto | cache, índices, metric source ports                           |
| PlatformAdmin define métrica insegura     |       Alto | manageSensitive, review, CI gates                             |
| Dashboard usado como fuente de verdad     |      Medio | read-only, no side effects, documentación                     |
| Export sensible usado para exfiltración   |       Alto | permissions, reason, audit, SDS                               |

---

## 40. Decisiones técnicas MVP

```text id="dk-technical-decisions"
1. Usar monolito modular.
2. Usar PostgreSQL + Prisma para persistencia.
3. Usar Redis opcional para cache.
4. Usar catálogo cerrado de dashboards.
5. Usar catálogo cerrado de widgets.
6. Usar catálogo cerrado de métricas.
7. No permitir SQL personalizado.
8. No permitir fórmulas ejecutables.
9. No permitir dashboards públicos.
10. No permitir acceso desde WordPress público.
11. Usar puertos hacia módulos fuente.
12. No escribir directamente en tablas de módulos fuente.
13. No modificar datos transaccionales.
14. Usar Secure Document Storage para exports.
15. Usar snapshots solo como evidencia derivada.
16. Usar permiso por widget y por métrica.
17. Usar permissionHash en cache.
18. Usar partial/unavailable cuando una fuente falle.
19. No ejecutar pagos/contabilidad/conciliación desde dashboard.
20. No controlar hardware.
21. No enviar datos reales a IA externa.
```

---

## 41. Definition of Done técnico

```text id="dk-plan-dod"
[ ] Módulo NestJS creado.
[ ] Configuración creada.
[ ] Feature flags implementadas.
[ ] Boot validation implementada.
[ ] Enums y errores definidos.
[ ] Value objects implementados.
[ ] Domain entities implementadas.
[ ] Domain policies implementadas.
[ ] Validators implementados.
[ ] Sanitizers implementados.
[ ] Prisma schema implementado.
[ ] Migración implementada.
[ ] Repositories implementados.
[ ] DTOs implementados.
[ ] Guards implementados.
[ ] Platform Dashboard Definitions API implementada.
[ ] Platform Widget Definitions API implementada.
[ ] Platform Metric Definitions API implementada.
[ ] Tenant Dashboards API implementada.
[ ] Tenant KPIs API implementada.
[ ] Tenant Configuration API implementada.
[ ] Snapshot API implementada.
[ ] Export API implementada.
[ ] Metric calculation engine implementado.
[ ] Widget rendering implementado.
[ ] Period service implementado.
[ ] Comparison service implementado.
[ ] Threshold service implementado.
[ ] Visibility service implementado.
[ ] Cache service implementado.
[ ] Source adapters implementados.
[ ] SDS export implementado.
[ ] Audit implementado.
[ ] Observability implementada.
[ ] OpenAPI implementado.
[ ] Seeds implementados.
[ ] Tests unitarios pasan.
[ ] Tests integración pasan.
[ ] Tests API pasan.
[ ] Tests security pasan.
[ ] Tests multitenancy pasan.
[ ] Tests privacy pasan.
[ ] Tests cache isolation pasan.
[ ] Tests no side-effects pasan.
[ ] Tests OpenAPI pasan.
[ ] Tests performance básicos pasan.
[ ] Smoke tests pasan.
[ ] CI completo pasa.
```

---

## 42. No aceptación técnica

No se acepta la implementación si:

```text id="dk-plan-no-acceptance"
- permite dashboards cross-tenant;
- permite widgets cross-tenant;
- permite snapshots cross-tenant;
- permite exports cross-tenant;
- acepta tenantId desde cliente;
- acepta actor fields desde cliente;
- acepta rawSql;
- acepta SQL personalizado;
- acepta scripts;
- acepta JavaScript configurable;
- acepta formulaCode ejecutable;
- usa eval;
- usa Function constructor;
- permite widget con metricKey fuera de catálogo;
- permite metric source no controlado;
- expone storageKey;
- devuelve signedUrl persistente;
- crea endpoints públicos;
- permite acceso desde WordPress público;
- cache mezcla usuarios con permisos distintos;
- muestra datos financieros sensibles sin permiso;
- muestra datos de seguridad sensibles sin permiso;
- muestra identificación completa sin permiso;
- muestra placa completa sin permiso;
- crea Payment;
- valida Payment;
- reversa Payment;
- crea Charge;
- crea JournalEntry;
- confirma Bank Reconciliation;
- crea SupplierPaymentOrder;
- modifica InventoryMovement;
- modifica AccessEvent;
- abre portones;
- controla hardware;
- envía datos reales a IA externa;
- trata snapshots como fuente de verdad;
- oculta falla de fuente mostrando cero silenciosamente.
```

---

## 43. Plan de Pull Requests sugerido

### PR-027-01 — Module skeleton, config, flags and enums

```text id="dk-pr-01"
[ ] Module foundation.
[ ] Configuración.
[ ] Feature flags.
[ ] Boot validation.
[ ] Enums.
[ ] Errores.
```

Acceptance:

```text id="dk-pr-01-ac"
[ ] Módulo compila.
[ ] Flags inseguros fallan boot.
[ ] No hay endpoints públicos.
```

---

### PR-027-02 — Value objects, validators, entities and policies

```text id="dk-pr-02"
[ ] Value objects.
[ ] Dashboard/widget/metric validators.
[ ] Period calculator.
[ ] Comparison calculator.
[ ] Threshold validator.
[ ] Sanitizers.
[ ] Domain entities.
[ ] Domain policies.
```

Acceptance:

```text id="dk-pr-02-ac"
[ ] No raw SQL tests pasan.
[ ] No executable formula tests pasan.
[ ] No storageKey tests pasan.
```

---

### PR-027-03 — Prisma schema, migration and repositories

```text id="dk-pr-03"
[ ] Prisma schema.
[ ] Migration.
[ ] Indexes.
[ ] Constraints.
[ ] Repository ports.
[ ] Prisma repositories.
```

Acceptance:

```text id="dk-pr-03-ac"
[ ] Migración limpia.
[ ] Tablas tenant-scoped tienen tenant_id.
[ ] Repositories filtran tenantId.
```

---

### PR-027-04 — DTOs, guards and authorization

```text id="dk-pr-04"
[ ] DTOs.
[ ] AuthGuard integration.
[ ] TenantGuard integration.
[ ] PermissionGuard.
[ ] SensitivePermissionGuard.
[ ] Visibility guard.
```

Acceptance:

```text id="dk-pr-04-ac"
[ ] DTOs rechazan campos prohibidos.
[ ] Sensitive permissions funcionan.
[ ] Cross-tenant retorna 404.
```

---

### PR-027-05 — Platform definitions API and seeds

```text id="dk-pr-05"
[ ] Dashboard Definitions API.
[ ] Widget Definitions API.
[ ] Metric Definitions API.
[ ] Seeds iniciales.
```

Acceptance:

```text id="dk-pr-05-ac"
[ ] Catálogo funciona.
[ ] Seeds idempotentes.
[ ] Catálogo no permite SQL ni fórmulas ejecutables.
```

---

### PR-027-06 — Tenant configuration API

```text id="dk-pr-06"
[ ] Tenant Dashboards API.
[ ] Tenant Dashboard Configuration API.
[ ] Tenant Widget Configuration API.
[ ] Threshold config.
[ ] Visibility config.
```

Acceptance:

```text id="dk-pr-06-ac"
[ ] Configuración tenant-scoped funciona.
[ ] No reemplaza permisos.
[ ] Cambios se auditan.
```

---

### PR-027-07 — Metric engine and source adapters

```text id="dk-pr-07"
[ ] Metric calculation service.
[ ] Period service.
[ ] Comparison service.
[ ] Source adapters iniciales.
[ ] partial/unavailable handling.
```

Acceptance:

```text id="dk-pr-07-ac"
[ ] KPIs principales calculan correctamente.
[ ] Fuente fallida no se muestra como cero silencioso.
[ ] No hay escrituras en módulos fuente.
```

---

### PR-027-08 — Dashboard rendering and cache

```text id="dk-pr-08"
[ ] Dashboard query service.
[ ] Widget rendering service.
[ ] Visibility service.
[ ] Cache service.
[ ] Redis adapter opcional.
[ ] PermissionHash.
```

Acceptance:

```text id="dk-pr-08-ac"
[ ] Dashboard ejecutivo responde.
[ ] Widget visibility funciona.
[ ] Cache no mezcla permisos.
```

---

### PR-027-09 — Snapshots and exports

```text id="dk-pr-09"
[ ] Snapshot service.
[ ] Snapshot API.
[ ] Export service.
[ ] Export API.
[ ] SDS adapter.
```

Acceptance:

```text id="dk-pr-09-ac"
[ ] Snapshots tenant-scoped.
[ ] Exports vía SDS.
[ ] No storageKey.
```

---

### PR-027-10 — Audit, observability, OpenAPI and hardening

```text id="dk-pr-10"
[ ] Audit completo.
[ ] Logs sanitizados.
[ ] Métricas.
[ ] OpenAPI.
[ ] Security hardening.
[ ] Performance baseline.
[ ] Smoke tests.
```

Acceptance:

```text id="dk-pr-10-ac"
[ ] CI completo pasa.
[ ] OpenAPI no documenta campos prohibidos.
[ ] No side-effects tests pasan.
```

---

## 44. Resultado esperado

Al implementar este plan, `027-dashboard-kpis` quedará preparado como módulo transversal de visualización interna, con dashboards, widgets, métricas, KPIs, configuración por tenant, cache opcional, snapshots, exportaciones, auditoría, observabilidad y límites estrictos de seguridad.

Resultado esperado:

```text id="dk-plan-expected-result"
module structure definida
technical boundaries definidos
dependencies definidas
dashboard catalog planificado
widget catalog planificado
metric catalog planificado
tenant dashboard configuration planificada
tenant widget configuration planificada
metric calculation engine definido
source adapters definidos
widget rendering definido
period service definido
comparison service definido
threshold service definido
visibility service definido
cache strategy definida
snapshot strategy definida
export strategy definida
API strategy definida
DTO strategy definida
guards definidos
permissions definidos
integration ports definidos
SDS export definido
audit definido
observability definida
OpenAPI strategy definida
feature flags definidos
seeds definidos
testing strategy definida
performance strategy definida
concurrency strategy definida
implementation phases definidas
PR plan definido
no public endpoints
no WordPress access
no raw SQL
no executable formulas
no storageKey exposure
no transactional side effects
no payment execution
no accounting execution
no bank reconciliation confirmation
no hardware control
no external AI with real data
```

---

## 45. Expediente actualizado

```text id="dk-plan-expediente"
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
│   │   └── 027-dashboard-kpis/
│   │       ├── spec.md
│   │       └── plan.md
```
