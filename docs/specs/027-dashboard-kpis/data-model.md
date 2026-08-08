# Data Model — 027 Dashboard and KPIs

## 1. Información del documento

| Campo                  | Valor                                                                                  |
| ---------------------- | -------------------------------------------------------------------------------------- |
| Proyecto               | RESIDENT Core                                                                          |
| Spec ID                | 027                                                                                    |
| Módulo                 | Dashboard and KPIs                                                                     |
| Documento              | Data Model                                                                             |
| Ruta                   | `docs/specs/027-dashboard-kpis/data-model.md`                                          |
| Versión                | 0.1                                                                                    |
| Estado                 | Borrador inicial                                                                       |
| Fecha                  | 2026-08-02                                                                             |
| Documento base         | `docs/specs/027-dashboard-kpis/spec.md`                                                |
| Plan técnico           | `docs/specs/027-dashboard-kpis/plan.md`                                                |
| Base de datos          | PostgreSQL                                                                             |
| ORM                    | Prisma                                                                                 |
| Estrategia multitenant | Shared database / shared schema / tenant_id                                            |
| Naturaleza             | Tenant-scoped / Analytics-facing / Read-heavy / Derived-data / Role-aware / Non-public |

---

## 2. Propósito

Este documento define el modelo de datos del módulo `027-dashboard-kpis`.

El modelo permite administrar definiciones globales de dashboards, widgets y métricas, además de configuraciones tenant-scoped, snapshots, exportaciones y referencias seguras a documentos generados.

El módulo está diseñado como una capa de lectura, agregación y presentación de indicadores. No almacena la fuente primaria de verdad financiera, operativa, contable, bancaria, documental, de acceso o de residentes.

Regla central del modelo de datos:

```text id="dk-dm-rule"
Todo dashboard, widget, métrica, configuración, snapshot, exportación, filtro, umbral, resultado agregado, referencia documental y evento de Dashboard and KPIs debe respetar tenant isolation, autorización por rol, minimización de datos, derivación desde fuentes transaccionales, ausencia de SQL arbitrario, ausencia de scripts, ausencia de fórmulas ejecutables, ausencia de secretos, ausencia de storageKey, ausencia de endpoints públicos, ausencia de acceso desde WordPress público, ausencia de efectos transaccionales, ausencia de pagos ejecutados, ausencia de asientos contables creados, ausencia de conciliaciones bancarias confirmadas, ausencia de control de hardware y ausencia de IA externa con datos reales.
```

---

## 3. Principios del modelo

```text id="dk-dm-principles"
1. Las definiciones globales no contienen datos reales de tenants.
2. Las configuraciones por tenant siempre tienen tenant_id.
3. Los dashboards son catálogos de presentación, no fuentes transaccionales.
4. Los widgets se basan en métricas catalogadas.
5. Las métricas se calculan por servicios controlados, no por SQL de usuario.
6. Los KPIs son derivados de módulos fuente.
7. Los snapshots conservan resultados agregados y sanitizados.
8. Las exportaciones usan Secure Document Storage.
9. El módulo no almacena storageKey ni signedUrl persistente.
10. El módulo no almacena secretos.
11. El módulo no almacena raw SQL.
12. El módulo no almacena scripts ni fórmulas ejecutables.
13. La visibilidad por rol no reemplaza PermissionGuard.
14. La cache debe ser tenant-scoped y permission-aware.
15. Las respuestas deben minimizar datos personales.
16. Los widgets sensibles requieren permisos reforzados.
17. Las fallas de fuentes deben marcarse como partial o unavailable.
18. Ninguna consulta de dashboard debe modificar datos transaccionales.
19. Ningún snapshot reemplaza los módulos fuente.
20. Ninguna exportación debe mezclar datos cross-tenant.
```

---

## 4. Tablas del módulo

### 4.1. Tablas platform/global

```text id="dk-dm-platform-tables"
dashboard_definitions
dashboard_widget_definitions
dashboard_metric_definitions
```

Estas tablas definen el catálogo global disponible para la plataforma.

Reglas:

```text id="dk-dm-platform-rules"
- No contienen datos transaccionales reales.
- No contienen datos personales reales.
- No contienen datos financieros reales.
- No contienen tenant_id.
- No contienen storageKey.
- No contienen rawSql.
- No contienen scripts.
- No contienen fórmulas ejecutables.
- Son administradas por PlatformAdmin autorizado.
```

---

### 4.2. Tablas tenant-scoped

```text id="dk-dm-tenant-tables"
tenant_dashboard_configurations
tenant_dashboard_widget_configurations
dashboard_snapshots
dashboard_exports
```

Reglas:

```text id="dk-dm-tenant-rules"
- Todas incluyen tenant_id.
- Toda consulta filtra por tenant_id.
- Cross-tenant debe responder 404.
- No se realiza physical delete ordinario.
- No contienen fuente transaccional primaria.
```

---

### 4.3. Datos no persistidos como tablas propias

Los resultados de KPIs en tiempo real no se almacenan como fuente primaria.

```text id="dk-dm-non-persistent"
- KPI results calculados on-demand.
- Widget results calculados on-demand.
- Dashboard responses calculadas on-demand.
- Cache temporal en Redis.
- Métricas técnicas en observabilidad.
- Eventos formales en Audit.
```

---

## 5. Dependencias externas

### 5.1. Referencias internas directas

```text id="dk-dm-direct-references"
tenant_id -> tenants.id
created_by -> user_profiles.id
updated_by -> user_profiles.id
archived_by -> user_profiles.id
generated_by -> user_profiles.id
requested_by -> user_profiles.id
```

---

### 5.2. Referencias por puerto

Para evitar acoplamiento fuerte, las referencias a módulos transaccionales se resuelven por puertos y no por FKs directas.

```text id="dk-dm-port-references"
source_module
metric_key
secure_document_id
dashboard_definition_id
widget_definition_id
metric_definition_id
```

Reglas:

```text id="dk-dm-port-reference-rules"
- source_module identifica el módulo fuente del KPI.
- metric_key identifica el cálculo controlado.
- secure_document_id se valida mediante Secure Document Storage.
- Los KPIs financieros leen módulos financieros mediante puertos.
- Los KPIs operativos leen módulos operativos mediante puertos.
- No se escriben tablas externas desde este módulo.
```

---

## 6. Tabla `dashboard_definitions`

### 6.1. Propósito

Define dashboards globales disponibles para los tenants.

Ejemplos:

```text id="dk-dashboard-definition-examples"
executive
financial
operations
residents-units
maintenance
access-visitors
governance
communications-automation
```

---

### 6.2. Campos

| Campo                     |         Tipo | Requerido | Descripción                          |
| ------------------------- | -----------: | --------: | ------------------------------------ |
| `id`                      |         UUID |        Sí | Identificador de la definición       |
| `dashboard_key`           | varchar(120) |        Sí | Clave única estable                  |
| `name`                    | varchar(180) |        Sí | Nombre visible                       |
| `description`             |         text |        No | Descripción                          |
| `category`                |         enum |        Sí | Categoría                            |
| `scope`                   |         enum |        Sí | platformDefault / tenantConfigurable |
| `default_role_visibility` |        jsonb |        No | Visibilidad inicial por rol          |
| `default_filters`         |        jsonb |        No | Filtros por defecto                  |
| `status`                  |         enum |        Sí | active/deprecated/archived           |
| `created_by`              |         UUID |        Sí | Actor creador                        |
| `updated_by`              |         UUID |        No | Actor modificador                    |
| `archived_by`             |         UUID |        No | Actor archivador                     |
| `created_at`              |  timestamptz |        Sí | Fecha de creación                    |
| `updated_at`              |  timestamptz |        Sí | Fecha de actualización               |
| `archived_at`             |  timestamptz |        No | Fecha de archivo lógico              |

---

### 6.3. Reglas

```text id="dk-dashboard-definition-rules"
- dashboard_key debe ser único.
- dashboard_key debe ser estable.
- dashboard_key debe usar kebab-case.
- name obligatorio.
- category obligatoria.
- status default = active.
- No puede contener SQL arbitrario.
- No puede contener script.
- No puede contener fórmula ejecutable.
- No puede contener datos reales de tenants.
- Archived dashboard no puede habilitarse en nuevos tenants.
```

---

## 7. Tabla `dashboard_metric_definitions`

### 7.1. Propósito

Define las métricas calculables y controladas por la plataforma.

Ejemplos:

```text id="dk-metric-definition-examples"
financial.outstandingBalance
financial.collectionRate
maintenance.overdueWorkOrdersCount
access.openCheckInsCount
automation.deadLettersOpenCount
```

---

### 7.2. Campos

| Campo                           |         Tipo | Requerido | Descripción                                        |
| ------------------------------- | -----------: | --------: | -------------------------------------------------- |
| `id`                            |         UUID |        Sí | Identificador de la métrica                        |
| `metric_key`                    | varchar(180) |        Sí | Clave única estable                                |
| `name`                          | varchar(180) |        Sí | Nombre visible                                     |
| `description`                   |         text |        No | Descripción                                        |
| `category`                      |         enum |        Sí | Categoría funcional                                |
| `source_module`                 | varchar(120) |        Sí | Módulo fuente                                      |
| `value_type`                    |         enum |        Sí | count/amount/percentage/duration/ratio/status      |
| `aggregation_type`              |         enum |        Sí | sum/count/average/min/max/ratio/percentage/derived |
| `sensitivity`                   |         enum |        Sí | Nivel de sensibilidad                              |
| `supports_comparison`           |      boolean |        Sí | Permite comparación contra periodo anterior        |
| `supports_trend`                |      boolean |        Sí | Permite tendencia                                  |
| `supports_breakdown`            |      boolean |        Sí | Permite breakdown                                  |
| `required_permission`           | varchar(160) |        No | Permiso mínimo                                     |
| `required_sensitive_permission` | varchar(160) |        No | Permiso reforzado                                  |
| `calculation_strategy`          |         enum |        Sí | sourcePort/derivedComposite/staticDefinition       |
| `status`                        |         enum |        Sí | active/deprecated/archived                         |
| `created_by`                    |         UUID |        Sí | Actor creador                                      |
| `updated_by`                    |         UUID |        No | Actor modificador                                  |
| `archived_by`                   |         UUID |        No | Actor archivador                                   |
| `created_at`                    |  timestamptz |        Sí | Fecha de creación                                  |
| `updated_at`                    |  timestamptz |        Sí | Fecha de actualización                             |
| `archived_at`                   |  timestamptz |        No | Fecha de archivo lógico                            |

---

### 7.3. Reglas

```text id="dk-metric-definition-rules"
- metric_key debe ser único.
- metric_key debe usar formato category.name.
- source_module obligatorio.
- value_type obligatorio.
- aggregation_type obligatorio.
- required_permission obligatorio para métricas sensibles.
- required_sensitive_permission obligatorio para métricas altamente sensibles.
- calculation_strategy no puede ser rawSql.
- No se permite SQL definido por usuario.
- No se permite formulaCode.
- No se permite script.
- Archived metric no puede asociarse a nuevos widgets.
```

---

## 8. Tabla `dashboard_widget_definitions`

### 8.1. Propósito

Define widgets disponibles y los vincula con dashboards y métricas catalogadas.

Ejemplos:

```text id="dk-widget-definition-examples"
executive.outstanding-balance-card
financial.collection-rate-trend
maintenance.overdue-work-orders-card
access.open-checkins-alert
automation.dead-letters-card
```

---

### 8.2. Campos

| Campo                           |         Tipo | Requerido | Descripción                        |
| ------------------------------- | -----------: | --------: | ---------------------------------- |
| `id`                            |         UUID |        Sí | Identificador del widget           |
| `widget_key`                    | varchar(180) |        Sí | Clave única estable                |
| `dashboard_definition_id`       |         UUID |        Sí | Dashboard al que pertenece         |
| `metric_definition_id`          |         UUID |        Sí | Métrica base                       |
| `name`                          | varchar(180) |        Sí | Nombre visible                     |
| `description`                   |         text |        No | Descripción                        |
| `widget_type`                   |         enum |        Sí | Tipo visual                        |
| `source_module`                 | varchar(120) |        Sí | Módulo fuente principal            |
| `sensitivity`                   |         enum |        Sí | Sensibilidad                       |
| `required_permission`           | varchar(160) |        No | Permiso mínimo                     |
| `required_sensitive_permission` | varchar(160) |        No | Permiso reforzado                  |
| `default_size`                  |         enum |        Sí | small/medium/large/full            |
| `default_order`                 |      integer |        Sí | Orden por defecto                  |
| `default_config`                |        jsonb |        No | Configuración visual no ejecutable |
| `status`                        |         enum |        Sí | active/deprecated/archived         |
| `created_by`                    |         UUID |        Sí | Actor creador                      |
| `updated_by`                    |         UUID |        No | Actor modificador                  |
| `archived_by`                   |         UUID |        No | Actor archivador                   |
| `created_at`                    |  timestamptz |        Sí | Fecha de creación                  |
| `updated_at`                    |  timestamptz |        Sí | Fecha de actualización             |
| `archived_at`                   |  timestamptz |        No | Fecha de archivo lógico            |

---

### 8.3. Reglas

```text id="dk-widget-definition-rules"
- widget_key debe ser único.
- dashboard_definition_id obligatorio.
- metric_definition_id obligatorio.
- metric_definition debe estar active.
- widget_type debe estar permitido.
- default_config no puede contener rawSql.
- default_config no puede contener script.
- default_config no puede contener fórmula ejecutable.
- default_config no puede contener storageKey.
- Archived widget no puede habilitarse en nuevas configuraciones tenant.
```

---

## 9. Tabla `tenant_dashboard_configurations`

### 9.1. Propósito

Configura dashboards por tenant.

---

### 9.2. Campos

| Campo                     |         Tipo | Requerido | Descripción                                                      |
| ------------------------- | -----------: | --------: | ---------------------------------------------------------------- |
| `id`                      |         UUID |        Sí | Identificador                                                    |
| `tenant_id`               |         UUID |        Sí | Tenant propietario                                               |
| `dashboard_definition_id` |         UUID |        Sí | Dashboard global                                                 |
| `dashboard_key`           | varchar(120) |        Sí | Copia de dashboardKey para consultas                             |
| `is_enabled`              |      boolean |        Sí | Si está habilitado                                               |
| `display_name`            | varchar(180) |        No | Nombre personalizado                                             |
| `default_period`          |         enum |        Sí | today/currentWeek/currentMonth/currentQuarter/currentYear/custom |
| `refresh_policy`          |         enum |        Sí | noCache/shortTtl/standardTtl/longTtl                             |
| `configuration_status`    |         enum |        Sí | active/inactive/archived                                         |
| `created_by`              |         UUID |        Sí | Actor creador                                                    |
| `updated_by`              |         UUID |        No | Actor modificador                                                |
| `archived_by`             |         UUID |        No | Actor archivador                                                 |
| `created_at`              |  timestamptz |        Sí | Fecha de creación                                                |
| `updated_at`              |  timestamptz |        Sí | Fecha de actualización                                           |
| `archived_at`             |  timestamptz |        No | Fecha de archivo lógico                                          |

---

### 9.3. Reglas

```text id="dk-tenant-dashboard-config-rules"
- tenant_id obligatorio.
- dashboard_definition_id obligatorio.
- unique tenant_id + dashboard_definition_id.
- dashboard_key se copia para búsqueda, pero la referencia fuerte es dashboard_definition_id.
- Dashboard archived no puede habilitarse.
- is_enabled=false impide respuesta ordinaria del dashboard.
- configuration_status=archived impide uso.
- No contiene datos transaccionales.
- No reemplaza permisos.
```

---

## 10. Tabla `tenant_dashboard_widget_configurations`

### 10.1. Propósito

Configura widgets por tenant dentro de un dashboard.

---

### 10.2. Campos

| Campo                               |         Tipo | Requerido | Descripción                        |
| ----------------------------------- | -----------: | --------: | ---------------------------------- |
| `id`                                |         UUID |        Sí | Identificador                      |
| `tenant_id`                         |         UUID |        Sí | Tenant propietario                 |
| `tenant_dashboard_configuration_id` |         UUID |        Sí | Configuración de dashboard         |
| `dashboard_definition_id`           |         UUID |        Sí | Dashboard global                   |
| `widget_definition_id`              |         UUID |        Sí | Widget global                      |
| `widget_key`                        | varchar(180) |        Sí | Copia de widgetKey                 |
| `is_enabled`                        |      boolean |        Sí | Si está habilitado                 |
| `display_order`                     |      integer |        Sí | Orden visual                       |
| `size`                              |         enum |        Sí | small/medium/large/full            |
| `threshold_config`                  |        jsonb |        No | Umbrales declarativos              |
| `visibility_config`                 |        jsonb |        No | Reglas declarativas de visibilidad |
| `custom_label`                      | varchar(180) |        No | Etiqueta personalizada             |
| `configuration_status`              |         enum |        Sí | active/inactive/archived           |
| `created_by`                        |         UUID |        Sí | Actor creador                      |
| `updated_by`                        |         UUID |        No | Actor modificador                  |
| `archived_by`                       |         UUID |        No | Actor archivador                   |
| `created_at`                        |  timestamptz |        Sí | Fecha de creación                  |
| `updated_at`                        |  timestamptz |        Sí | Fecha de actualización             |
| `archived_at`                       |  timestamptz |        No | Fecha de archivo lógico            |

---

### 10.3. Reglas

```text id="dk-tenant-widget-config-rules"
- tenant_id obligatorio.
- tenant_dashboard_configuration_id debe pertenecer al mismo tenant.
- widget_definition_id debe existir y estar active.
- widget_definition debe pertenecer al dashboard_definition.
- unique tenant_id + tenant_dashboard_configuration_id + widget_definition_id.
- threshold_config debe ser declarativo.
- visibility_config no reemplaza PermissionGuard.
- No se permite rawSql.
- No se permite script.
- No se permite formulaCode.
- No se permite storageKey.
```

---

## 11. Tabla `dashboard_snapshots`

### 11.1. Propósito

Conserva capturas históricas de resultados agregados de un dashboard en un periodo.

Un snapshot es evidencia administrativa de una lectura agregada, pero no reemplaza la fuente transaccional.

---

### 11.2. Campos

| Campo                     |         Tipo | Requerido | Descripción                 |
| ------------------------- | -----------: | --------: | --------------------------- |
| `id`                      |         UUID |        Sí | Identificador               |
| `tenant_id`               |         UUID |        Sí | Tenant propietario          |
| `dashboard_definition_id` |         UUID |        Sí | Dashboard capturado         |
| `dashboard_key`           | varchar(120) |        Sí | Clave del dashboard         |
| `snapshot_code`           | varchar(160) |        Sí | Código único por tenant     |
| `period_from`             |  timestamptz |        Sí | Inicio del periodo          |
| `period_to`               |  timestamptz |        Sí | Fin del periodo             |
| `filters_sanitized`       |        jsonb |        No | Filtros aplicados           |
| `snapshot_data_sanitized` |        jsonb |        Sí | Datos agregados sanitizados |
| `status`                  |         enum |        Sí | generated/failed/archived   |
| `generation_reason`       |         text |        No | Motivo de generación        |
| `generated_by`            |         UUID |        Sí | Usuario que generó          |
| `archived_by`             |         UUID |        No | Usuario que archivó         |
| `created_at`              |  timestamptz |        Sí | Fecha de creación           |
| `updated_at`              |  timestamptz |        Sí | Fecha de actualización      |
| `generated_at`            |  timestamptz |        Sí | Fecha de generación         |
| `failed_at`               |  timestamptz |        No | Fecha de fallo              |
| `failure_reason`          |         text |        No | Error sanitizado            |
| `archived_at`             |  timestamptz |        No | Fecha de archivo lógico     |

---

### 11.3. Reglas

```text id="dk-dashboard-snapshot-rules"
- tenant_id obligatorio.
- period_from <= period_to.
- snapshot_code único por tenant.
- snapshot_data_sanitized debe contener resultados agregados.
- snapshot_data_sanitized no contiene storageKey.
- snapshot_data_sanitized no contiene raw payload sensible.
- snapshot_data_sanitized no contiene datos cross-tenant.
- failed requiere failure_reason sanitizado.
- archived no borra físicamente.
```

---

## 12. Tabla `dashboard_exports`

### 12.1. Propósito

Registra exportaciones administrativas de dashboards, snapshots y resúmenes KPI.

---

### 12.2. Campos

| Campo                     |         Tipo | Requerido | Descripción                                    |
| ------------------------- | -----------: | --------: | ---------------------------------------------- |
| `id`                      |         UUID |        Sí | Identificador                                  |
| `tenant_id`               |         UUID |        Sí | Tenant propietario                             |
| `dashboard_definition_id` |         UUID |        No | Dashboard asociado                             |
| `dashboard_snapshot_id`   |         UUID |        No | Snapshot asociado                              |
| `dashboard_key`           | varchar(120) |        No | Clave de dashboard                             |
| `export_type`             |         enum |        Sí | Tipo de exportación                            |
| `format`                  |         enum |        Sí | json/xlsx/pdf                                  |
| `filters_sanitized`       |        jsonb |        No | Filtros seguros                                |
| `include_sensitive`       |      boolean |        Sí | Si incluye datos sensibles autorizados         |
| `reason`                  |         text |        No | Motivo                                         |
| `status`                  |         enum |        Sí | requested/processing/completed/failed/archived |
| `secure_document_id`      |         UUID |        No | Referencia SDS                                 |
| `requested_by`            |         UUID |        Sí | Usuario solicitante                            |
| `completed_at`            |  timestamptz |        No | Fecha de completado                            |
| `failed_at`               |  timestamptz |        No | Fecha de fallo                                 |
| `failure_reason`          |         text |        No | Error sanitizado                               |
| `created_at`              |  timestamptz |        Sí | Fecha de creación                              |
| `updated_at`              |  timestamptz |        Sí | Fecha de actualización                         |
| `archived_at`             |  timestamptz |        No | Fecha de archivo lógico                        |

---

### 12.3. Reglas

```text id="dk-dashboard-export-rules"
- tenant_id obligatorio.
- export_type obligatorio.
- format obligatorio.
- include_sensitive=true requiere permiso reforzado.
- fullDashboardSummary requiere reason.
- securityKpiSummary requiere reason y permiso de seguridad.
- audit-related export requiere permiso de auditoría.
- completed requiere secure_document_id.
- failed requiere failure_reason.
- No se guarda storageKey.
- No se guarda signedUrl persistente.
- No se guarda archivo base64.
- Export se audita.
```

---

## 13. Enums

### 13.1. `DashboardCategory`

```text id="dk-enum-dashboard-category"
executive
financial
operations
residentsUnits
maintenance
accessVisitors
governance
communicationsAutomation
auditSecurity
system
```

---

### 13.2. `DashboardScope`

```text id="dk-enum-dashboard-scope"
platformDefault
tenantConfigurable
```

---

### 13.3. `DashboardDefinitionStatus`

```text id="dk-enum-dashboard-definition-status"
active
deprecated
archived
```

---

### 13.4. `DashboardWidgetType`

```text id="dk-enum-widget-type"
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

### 13.5. `DashboardWidgetSize`

```text id="dk-enum-widget-size"
small
medium
large
full
```

---

### 13.6. `DashboardMetricValueType`

```text id="dk-enum-value-type"
count
amount
percentage
duration
ratio
status
```

---

### 13.7. `DashboardAggregationType`

```text id="dk-enum-aggregation-type"
sum
count
average
min
max
ratio
percentage
derived
```

---

### 13.8. `DashboardSensitivity`

```text id="dk-enum-sensitivity"
publicSummary
internal
restricted
financialSensitive
personalDataSensitive
securitySensitive
auditSensitive
operationalSensitive
```

---

### 13.9. `DashboardCalculationStrategy`

```text id="dk-enum-calculation-strategy"
sourcePort
derivedComposite
staticDefinition
```

---

### 13.10. `TenantDashboardConfigurationStatus`

```text id="dk-enum-tenant-config-status"
active
inactive
archived
```

---

### 13.11. `DashboardDefaultPeriod`

```text id="dk-enum-default-period"
today
currentWeek
currentMonth
currentQuarter
currentYear
custom
```

---

### 13.12. `DashboardRefreshPolicy`

```text id="dk-enum-refresh-policy"
noCache
shortTtl
standardTtl
longTtl
```

---

### 13.13. `DashboardSnapshotStatus`

```text id="dk-enum-snapshot-status"
generated
failed
archived
```

---

### 13.14. `DashboardExportType`

```text id="dk-enum-export-type"
dashboardCurrentView
dashboardSnapshot
financialKpiSummary
operationsKpiSummary
securityKpiSummary
maintenanceKpiSummary
fullDashboardSummary
```

---

### 13.15. `DashboardExportFormat`

```text id="dk-enum-export-format"
json
xlsx
pdf
```

---

### 13.16. `DashboardExportStatus`

```text id="dk-enum-export-status"
requested
processing
completed
failed
archived
```

---

### 13.17. `DashboardDataAvailabilityStatus`

```text id="dk-enum-data-availability"
available
partial
unavailable
```

---

## 14. Prisma schema preliminar

> Este schema es una propuesta inicial. Puede ajustarse durante implementación, pero debe respetar multitenancy, derivación de datos, seguridad, auditoría, ausencia de raw SQL, ausencia de código ejecutable y no exposición de storageKey.

```prisma id="dk-prisma-schema"
enum DashboardCategory {
  executive
  financial
  operations
  residentsUnits
  maintenance
  accessVisitors
  governance
  communicationsAutomation
  auditSecurity
  system
}

enum DashboardScope {
  platformDefault
  tenantConfigurable
}

enum DashboardDefinitionStatus {
  active
  deprecated
  archived
}

enum DashboardWidgetType {
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
}

enum DashboardWidgetSize {
  small
  medium
  large
  full
}

enum DashboardMetricValueType {
  count
  amount
  percentage
  duration
  ratio
  status
}

enum DashboardAggregationType {
  sum
  count
  average
  min
  max
  ratio
  percentage
  derived
}

enum DashboardSensitivity {
  publicSummary
  internal
  restricted
  financialSensitive
  personalDataSensitive
  securitySensitive
  auditSensitive
  operationalSensitive
}

enum DashboardCalculationStrategy {
  sourcePort
  derivedComposite
  staticDefinition
}

enum TenantDashboardConfigurationStatus {
  active
  inactive
  archived
}

enum DashboardDefaultPeriod {
  today
  currentWeek
  currentMonth
  currentQuarter
  currentYear
  custom
}

enum DashboardRefreshPolicy {
  noCache
  shortTtl
  standardTtl
  longTtl
}

enum DashboardSnapshotStatus {
  generated
  failed
  archived
}

enum DashboardExportType {
  dashboardCurrentView
  dashboardSnapshot
  financialKpiSummary
  operationsKpiSummary
  securityKpiSummary
  maintenanceKpiSummary
  fullDashboardSummary
}

enum DashboardExportFormat {
  json
  xlsx
  pdf
}

enum DashboardExportStatus {
  requested
  processing
  completed
  failed
  archived
}

model DashboardDefinition {
  id                    String                    @id @default(uuid()) @db.Uuid
  dashboardKey          String                    @unique @map("dashboard_key") @db.VarChar(120)
  name                  String                    @db.VarChar(180)
  description           String?
  category              DashboardCategory
  scope                 DashboardScope            @default(tenantConfigurable)
  defaultRoleVisibility Json?                     @map("default_role_visibility")
  defaultFilters        Json?                     @map("default_filters")
  status                DashboardDefinitionStatus @default(active)

  createdBy             String                    @map("created_by") @db.Uuid
  updatedBy             String?                   @map("updated_by") @db.Uuid
  archivedBy            String?                   @map("archived_by") @db.Uuid

  createdAt             DateTime                  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt             DateTime                  @updatedAt @map("updated_at") @db.Timestamptz
  archivedAt            DateTime?                 @map("archived_at") @db.Timestamptz

  widgets               DashboardWidgetDefinition[]
  tenantConfigurations  TenantDashboardConfiguration[]
  snapshots             DashboardSnapshot[]
  exports               DashboardExport[]

  @@index([category, status])
  @@index([scope, status])
  @@map("dashboard_definitions")
}

model DashboardMetricDefinition {
  id                          String                       @id @default(uuid()) @db.Uuid
  metricKey                   String                       @unique @map("metric_key") @db.VarChar(180)
  name                        String                       @db.VarChar(180)
  description                 String?
  category                    DashboardCategory
  sourceModule                String                       @map("source_module") @db.VarChar(120)
  valueType                   DashboardMetricValueType     @map("value_type")
  aggregationType             DashboardAggregationType     @map("aggregation_type")
  sensitivity                 DashboardSensitivity         @default(internal)
  supportsComparison          Boolean                      @default(false) @map("supports_comparison")
  supportsTrend               Boolean                      @default(false) @map("supports_trend")
  supportsBreakdown           Boolean                      @default(false) @map("supports_breakdown")
  requiredPermission          String?                      @map("required_permission") @db.VarChar(160)
  requiredSensitivePermission String?                      @map("required_sensitive_permission") @db.VarChar(160)
  calculationStrategy         DashboardCalculationStrategy @default(sourcePort) @map("calculation_strategy")
  status                      DashboardDefinitionStatus    @default(active)

  createdBy                   String                       @map("created_by") @db.Uuid
  updatedBy                   String?                      @map("updated_by") @db.Uuid
  archivedBy                  String?                      @map("archived_by") @db.Uuid

  createdAt                   DateTime                     @default(now()) @map("created_at") @db.Timestamptz
  updatedAt                   DateTime                     @updatedAt @map("updated_at") @db.Timestamptz
  archivedAt                  DateTime?                    @map("archived_at") @db.Timestamptz

  widgets                     DashboardWidgetDefinition[]

  @@index([category, status])
  @@index([sourceModule])
  @@index([sensitivity])
  @@index([valueType])
  @@index([aggregationType])
  @@map("dashboard_metric_definitions")
}

model DashboardWidgetDefinition {
  id                          String                    @id @default(uuid()) @db.Uuid
  widgetKey                   String                    @unique @map("widget_key") @db.VarChar(180)
  dashboardDefinitionId       String                    @map("dashboard_definition_id") @db.Uuid
  metricDefinitionId          String                    @map("metric_definition_id") @db.Uuid
  name                        String                    @db.VarChar(180)
  description                 String?
  widgetType                  DashboardWidgetType       @map("widget_type")
  sourceModule                String                    @map("source_module") @db.VarChar(120)
  sensitivity                 DashboardSensitivity      @default(internal)
  requiredPermission          String?                   @map("required_permission") @db.VarChar(160)
  requiredSensitivePermission String?                   @map("required_sensitive_permission") @db.VarChar(160)
  defaultSize                 DashboardWidgetSize       @default(medium) @map("default_size")
  defaultOrder                Int                       @default(0) @map("default_order")
  defaultConfig               Json?                     @map("default_config")
  status                      DashboardDefinitionStatus @default(active)

  createdBy                   String                    @map("created_by") @db.Uuid
  updatedBy                   String?                   @map("updated_by") @db.Uuid
  archivedBy                  String?                   @map("archived_by") @db.Uuid

  createdAt                   DateTime                  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt                   DateTime                  @updatedAt @map("updated_at") @db.Timestamptz
  archivedAt                  DateTime?                 @map("archived_at") @db.Timestamptz

  dashboardDefinition         DashboardDefinition       @relation(fields: [dashboardDefinitionId], references: [id])
  metricDefinition            DashboardMetricDefinition @relation(fields: [metricDefinitionId], references: [id])
  tenantConfigurations        TenantDashboardWidgetConfiguration[]

  @@index([dashboardDefinitionId, status])
  @@index([metricDefinitionId])
  @@index([widgetType])
  @@index([sourceModule])
  @@index([sensitivity])
  @@map("dashboard_widget_definitions")
}

model TenantDashboardConfiguration {
  id                    String                             @id @default(uuid()) @db.Uuid
  tenantId              String                             @map("tenant_id") @db.Uuid
  dashboardDefinitionId String                             @map("dashboard_definition_id") @db.Uuid
  dashboardKey          String                             @map("dashboard_key") @db.VarChar(120)
  isEnabled             Boolean                            @default(true) @map("is_enabled")
  displayName           String?                            @map("display_name") @db.VarChar(180)
  defaultPeriod         DashboardDefaultPeriod             @default(currentMonth) @map("default_period")
  refreshPolicy         DashboardRefreshPolicy             @default(standardTtl) @map("refresh_policy")
  configurationStatus   TenantDashboardConfigurationStatus @default(active) @map("configuration_status")

  createdBy             String                             @map("created_by") @db.Uuid
  updatedBy             String?                            @map("updated_by") @db.Uuid
  archivedBy            String?                            @map("archived_by") @db.Uuid

  createdAt             DateTime                           @default(now()) @map("created_at") @db.Timestamptz
  updatedAt             DateTime                           @updatedAt @map("updated_at") @db.Timestamptz
  archivedAt            DateTime?                          @map("archived_at") @db.Timestamptz

  tenant                Tenant                             @relation(fields: [tenantId], references: [id])
  dashboardDefinition   DashboardDefinition                @relation(fields: [dashboardDefinitionId], references: [id])
  widgetConfigurations  TenantDashboardWidgetConfiguration[]

  @@unique([tenantId, dashboardDefinitionId])
  @@index([tenantId, dashboardKey])
  @@index([tenantId, isEnabled, configurationStatus])
  @@map("tenant_dashboard_configurations")
}

model TenantDashboardWidgetConfiguration {
  id                              String                             @id @default(uuid()) @db.Uuid
  tenantId                        String                             @map("tenant_id") @db.Uuid
  tenantDashboardConfigurationId  String                             @map("tenant_dashboard_configuration_id") @db.Uuid
  dashboardDefinitionId           String                             @map("dashboard_definition_id") @db.Uuid
  widgetDefinitionId              String                             @map("widget_definition_id") @db.Uuid
  widgetKey                       String                             @map("widget_key") @db.VarChar(180)
  isEnabled                       Boolean                            @default(true) @map("is_enabled")
  displayOrder                    Int                                @default(0) @map("display_order")
  size                            DashboardWidgetSize                @default(medium)
  thresholdConfig                 Json?                              @map("threshold_config")
  visibilityConfig                Json?                              @map("visibility_config")
  customLabel                     String?                            @map("custom_label") @db.VarChar(180)
  configurationStatus             TenantDashboardConfigurationStatus @default(active) @map("configuration_status")

  createdBy                       String                             @map("created_by") @db.Uuid
  updatedBy                       String?                            @map("updated_by") @db.Uuid
  archivedBy                      String?                            @map("archived_by") @db.Uuid

  createdAt                       DateTime                           @default(now()) @map("created_at") @db.Timestamptz
  updatedAt                       DateTime                           @updatedAt @map("updated_at") @db.Timestamptz
  archivedAt                      DateTime?                          @map("archived_at") @db.Timestamptz

  tenant                          Tenant                             @relation(fields: [tenantId], references: [id])
  tenantDashboardConfiguration     TenantDashboardConfiguration       @relation(fields: [tenantDashboardConfigurationId], references: [id])
  dashboardDefinition              DashboardDefinition                @relation(fields: [dashboardDefinitionId], references: [id])
  widgetDefinition                 DashboardWidgetDefinition          @relation(fields: [widgetDefinitionId], references: [id])

  @@unique([tenantId, tenantDashboardConfigurationId, widgetDefinitionId])
  @@index([tenantId, widgetKey])
  @@index([tenantId, dashboardDefinitionId])
  @@index([tenantId, isEnabled, configurationStatus])
  @@index([tenantId, displayOrder])
  @@map("tenant_dashboard_widget_configurations")
}

model DashboardSnapshot {
  id                    String                  @id @default(uuid()) @db.Uuid
  tenantId              String                  @map("tenant_id") @db.Uuid
  dashboardDefinitionId String                  @map("dashboard_definition_id") @db.Uuid
  dashboardKey          String                  @map("dashboard_key") @db.VarChar(120)
  snapshotCode          String                  @map("snapshot_code") @db.VarChar(160)
  periodFrom            DateTime                @map("period_from") @db.Timestamptz
  periodTo              DateTime                @map("period_to") @db.Timestamptz
  filtersSanitized      Json?                   @map("filters_sanitized")
  snapshotDataSanitized Json                    @map("snapshot_data_sanitized")
  status                DashboardSnapshotStatus @default(generated)
  generationReason      String?                 @map("generation_reason")
  generatedBy           String                  @map("generated_by") @db.Uuid
  archivedBy            String?                 @map("archived_by") @db.Uuid

  createdAt             DateTime                @default(now()) @map("created_at") @db.Timestamptz
  updatedAt             DateTime                @updatedAt @map("updated_at") @db.Timestamptz
  generatedAt           DateTime                @default(now()) @map("generated_at") @db.Timestamptz
  failedAt              DateTime?               @map("failed_at") @db.Timestamptz
  failureReason         String?                 @map("failure_reason")
  archivedAt            DateTime?               @map("archived_at") @db.Timestamptz

  tenant                Tenant                  @relation(fields: [tenantId], references: [id])
  dashboardDefinition   DashboardDefinition     @relation(fields: [dashboardDefinitionId], references: [id])
  exports               DashboardExport[]

  @@unique([tenantId, snapshotCode])
  @@index([tenantId, dashboardKey])
  @@index([tenantId, dashboardDefinitionId])
  @@index([tenantId, periodFrom, periodTo])
  @@index([tenantId, status])
  @@index([tenantId, generatedAt])
  @@map("dashboard_snapshots")
}

model DashboardExport {
  id                    String                @id @default(uuid()) @db.Uuid
  tenantId              String                @map("tenant_id") @db.Uuid
  dashboardDefinitionId String?               @map("dashboard_definition_id") @db.Uuid
  dashboardSnapshotId   String?               @map("dashboard_snapshot_id") @db.Uuid
  dashboardKey          String?               @map("dashboard_key") @db.VarChar(120)
  exportType            DashboardExportType   @map("export_type")
  format                DashboardExportFormat
  filtersSanitized      Json?                 @map("filters_sanitized")
  includeSensitive      Boolean               @default(false) @map("include_sensitive")
  reason                String?
  status                DashboardExportStatus @default(requested)
  secureDocumentId      String?               @map("secure_document_id") @db.Uuid
  requestedBy           String                @map("requested_by") @db.Uuid

  completedAt           DateTime?             @map("completed_at") @db.Timestamptz
  failedAt              DateTime?             @map("failed_at") @db.Timestamptz
  failureReason         String?               @map("failure_reason")
  createdAt             DateTime              @default(now()) @map("created_at") @db.Timestamptz
  updatedAt             DateTime              @updatedAt @map("updated_at") @db.Timestamptz
  archivedAt            DateTime?             @map("archived_at") @db.Timestamptz

  tenant                Tenant                @relation(fields: [tenantId], references: [id])
  dashboardDefinition   DashboardDefinition?  @relation(fields: [dashboardDefinitionId], references: [id])
  dashboardSnapshot     DashboardSnapshot?    @relation(fields: [dashboardSnapshotId], references: [id])

  @@index([tenantId, exportType, status])
  @@index([tenantId, dashboardKey])
  @@index([tenantId, dashboardDefinitionId])
  @@index([tenantId, dashboardSnapshotId])
  @@index([tenantId, secureDocumentId])
  @@index([tenantId, createdAt])
  @@map("dashboard_exports")
}
```

---

## 15. Relaciones a agregar en `Tenant`

Agregar relaciones al modelo `Tenant` existente:

```prisma id="dk-tenant-relations"
model Tenant {
  // existing fields...

  tenantDashboardConfigurations        TenantDashboardConfiguration[]
  tenantDashboardWidgetConfigurations  TenantDashboardWidgetConfiguration[]
  dashboardSnapshots                   DashboardSnapshot[]
  dashboardExports                     DashboardExport[]
}
```

---

## 16. Índices recomendados

### 16.1. Definiciones globales

```text id="dk-index-global"
dashboard_definitions:
- unique(dashboard_key)
- index(category, status)
- index(scope, status)

dashboard_metric_definitions:
- unique(metric_key)
- index(category, status)
- index(source_module)
- index(sensitivity)
- index(value_type)
- index(aggregation_type)

dashboard_widget_definitions:
- unique(widget_key)
- index(dashboard_definition_id, status)
- index(metric_definition_id)
- index(widget_type)
- index(source_module)
- index(sensitivity)
```

---

### 16.2. Configuración tenant

```text id="dk-index-tenant-config"
tenant_dashboard_configurations:
- unique(tenant_id, dashboard_definition_id)
- index(tenant_id, dashboard_key)
- index(tenant_id, is_enabled, configuration_status)

tenant_dashboard_widget_configurations:
- unique(tenant_id, tenant_dashboard_configuration_id, widget_definition_id)
- index(tenant_id, widget_key)
- index(tenant_id, dashboard_definition_id)
- index(tenant_id, is_enabled, configuration_status)
- index(tenant_id, display_order)
```

---

### 16.3. Snapshots y exports

```text id="dk-index-snapshots-exports"
dashboard_snapshots:
- unique(tenant_id, snapshot_code)
- index(tenant_id, dashboard_key)
- index(tenant_id, dashboard_definition_id)
- index(tenant_id, period_from, period_to)
- index(tenant_id, status)
- index(tenant_id, generated_at)

dashboard_exports:
- index(tenant_id, export_type, status)
- index(tenant_id, dashboard_key)
- index(tenant_id, dashboard_definition_id)
- index(tenant_id, dashboard_snapshot_id)
- index(tenant_id, secure_document_id)
- index(tenant_id, created_at)
```

---

## 17. Constraints recomendadas

### 17.1. Ventanas de periodo

```text id="dk-constraints-period"
- period_to >= period_from.
- period_from y period_to obligatorios en snapshots.
- dateFrom <= dateTo en consultas.
```

---

### 17.2. Exportaciones

```text id="dk-constraints-exports"
- completed requiere secure_document_id.
- failed requiere failure_reason.
- fullDashboardSummary requiere reason.
- securityKpiSummary requiere reason.
- include_sensitive=true requiere permiso reforzado en capa de aplicación.
```

---

### 17.3. Configuración

```text id="dk-constraints-config"
- display_order >= 0.
- widget_definition debe pertenecer al dashboard_definition.
- dashboard archived no puede habilitarse.
- widget archived no puede habilitarse.
- metric archived no puede usarse en nuevos widgets.
```

---

## 18. JSONB permitido

### 18.1. Campos JSONB

```text id="dk-jsonb-fields"
dashboard_definitions.default_role_visibility
dashboard_definitions.default_filters
dashboard_widget_definitions.default_config
tenant_dashboard_widget_configurations.threshold_config
tenant_dashboard_widget_configurations.visibility_config
dashboard_snapshots.filters_sanitized
dashboard_snapshots.snapshot_data_sanitized
dashboard_exports.filters_sanitized
```

---

### 18.2. Claves prohibidas en JSONB

```text id="dk-jsonb-forbidden"
tenantId
createdBy
updatedBy
generatedBy
requestedBy
archivedBy
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
privateKey
clientSecret
webhookSecret
databaseUrl
paymentId
journalEntryId
bankTransactionId
reconciliationMatchId
gateOpenCommand
hardwareDeviceCommand
externalAiEnabled
externalAiRealDataAllowed
```

---

### 18.3. Reglas de validación JSONB

```text id="dk-jsonb-validation"
- Validar allowlist de claves.
- Rechazar forbidden keys recursivamente.
- Rechazar rawSql.
- Rechazar scripts.
- Rechazar fórmula ejecutable.
- Rechazar storageKey.
- Rechazar signedUrl persistente.
- Rechazar secretos.
- Limitar profundidad.
- Limitar tamaño.
- Sanitizar texto libre.
- Sanitizar errores.
```

---

## 19. Shapes conceptuales

### 19.1. `default_role_visibility`

```json id="dk-shape-role-visibility"
{
  "roles": ["tenantAdmin", "boardMember", "financialManager"],
  "requiresAnyPermission": ["tenantDashboards.read"],
  "requiresAllPermissions": []
}
```

Regla:

```text id="dk-shape-role-visibility-rule"
default_role_visibility ayuda a configurar visibilidad inicial, pero no reemplaza PermissionGuard ni validación del módulo fuente.
```

---

### 19.2. `default_filters`

```json id="dk-shape-default-filters"
{
  "period": "currentMonth",
  "comparison": "previousEquivalentPeriod",
  "includeArchived": false
}
```

---

### 19.3. `threshold_config`

```json id="dk-shape-threshold-config"
{
  "warning": {
    "operator": "greaterThanOrEqual",
    "value": "10"
  },
  "critical": {
    "operator": "greaterThanOrEqual",
    "value": "20"
  },
  "displayMode": "badge"
}
```

Reglas:

```text id="dk-threshold-rules"
- Operadores permitidos: greaterThan, greaterThanOrEqual, lessThan, lessThanOrEqual, equals.
- value debe ser string decimal o entero según valueType.
- No permite expresiones ejecutables.
- No permite rawSql.
- No permite scripts.
```

---

### 19.4. `visibility_config`

```json id="dk-shape-visibility-config"
{
  "hiddenForRoles": ["resident"],
  "requiresAnyPermission": ["tenantDashboardMetrics.readFinancial"],
  "requiresSensitivePermission": null
}
```

Regla:

```text id="dk-visibility-config-rule"
visibility_config puede restringir visualización, pero no puede ampliar permisos del usuario.
```

---

### 19.5. `snapshot_data_sanitized`

```json id="dk-shape-snapshot-data"
{
  "dashboardKey": "financial",
  "period": {
    "from": "2026-08-01T00:00:00.000Z",
    "to": "2026-08-31T23:59:59.000Z"
  },
  "widgets": [
    {
      "widgetKey": "financial.outstanding-balance-card",
      "metricKey": "financial.outstandingBalance",
      "valueType": "amount",
      "value": "1250.75",
      "currency": "USD",
      "availability": "available",
      "comparison": {
        "previousValue": "1400.00",
        "delta": "-149.25",
        "deltaPercentage": "-10.66"
      }
    }
  ],
  "generatedAt": "2026-08-31T23:59:59.000Z"
}
```

Reglas:

```text id="dk-snapshot-data-rules"
- Montos como string decimal.
- No incluir storageKey.
- No incluir datos personales completos.
- No incluir payload raw.
- No incluir datos cross-tenant.
- Marcar availability=partial/unavailable cuando aplique.
```

---

### 19.6. Resultado runtime de KPI

No necesariamente persistido.

```typescript id="dk-runtime-kpi-result"
type DashboardKpiResult = {
  metricKey: string;
  widgetKey?: string;
  valueType: "count" | "amount" | "percentage" | "duration" | "ratio" | "status";
  value: string | number | boolean | null;
  currency?: "USD";
  periodFrom: string;
  periodTo: string;
  availability: "available" | "partial" | "unavailable";
  comparison?: {
    previousValue: string | number | null;
    delta: string | number | null;
    deltaPercentage: string | null;
  };
  breakdown?: Array<{
    key: string;
    label: string;
    value: string | number;
  }>;
  sourceModules: string[];
};
```

---

## 20. Catálogo inicial de métricas

### 20.1. Financial

```text id="dk-seed-financial-metrics"
financial.chargesIssuedAmount
financial.chargesIssuedCount
financial.paymentsSubmittedAmount
financial.paymentsValidatedAmount
financial.paymentsRejectedAmount
financial.pendingPaymentValidationAmount
financial.outstandingBalance
financial.overdueBalance
financial.delinquencyRate
financial.collectionRate
financial.averageDaysToPayment
financial.paymentReversalsAmount
financial.chargeAdjustmentsAmount
```

---

### 20.2. Residents and units

```text id="dk-seed-residents-units-metrics"
properties.totalUnits
properties.activeUnits
properties.inactiveUnits
properties.occupiedUnits
properties.vacantUnits
properties.ownerOccupiedUnits
properties.rentedUnits
residents.registeredResidents
residents.activeResidents
residents.withoutUserAccount
properties.unitsWithoutAssignedResident
properties.vehiclesRegistered
properties.petsRegistered
```

---

### 20.3. Reservations

```text id="dk-seed-reservations-metrics"
reservations.createdCount
reservations.approvedCount
reservations.cancelledCount
reservations.pendingApprovalCount
reservations.commonAreaUtilizationRate
reservations.revenueAssociatedAmount
```

---

### 20.4. Fines

```text id="dk-seed-fines-metrics"
fines.issuedCount
fines.issuedAmount
fines.pendingCount
fines.appealedCount
fines.resolvedAppealsCount
fines.cancelledCount
```

---

### 20.5. Governance

```text id="dk-seed-governance-metrics"
meetings.upcomingCount
meetings.heldCount
meetings.averageAttendanceRate
meetings.quorumAchievedCount
meetings.quorumFailedCount
voting.sessionsOpenedCount
voting.sessionsClosedCount
certifiedMinutes.publishedCount
certifiedMinutes.pendingApprovalCount
```

---

### 20.6. Maintenance

```text id="dk-seed-maintenance-metrics"
maintenance.requestsCreatedCount
maintenance.requestsOpenCount
maintenance.requestsInProgressCount
maintenance.requestsCompletedCount
maintenance.overdueWorkOrdersCount
maintenance.averageResolutionTime
maintenance.pendingCostApprovalsCount
maintenance.byPriorityBreakdown
maintenance.byCategoryBreakdown
```

---

### 20.7. Inventory

```text id="dk-seed-inventory-metrics"
inventory.totalItems
inventory.lowStockItemsCount
inventory.outOfStockItemsCount
inventory.consumptionsThisMonth
inventory.adjustmentsThisMonth
inventory.itemsByCategoryBreakdown
```

---

### 20.8. Access Control

```text id="dk-seed-access-metrics"
access.visitorsTodayCount
access.visitorsThisWeekCount
access.openCheckInsCount
access.averageVisitDuration
access.deniedAccessCount
access.openIncidentsCount
access.recurringAuthorizationsActiveCount
access.deliveriesPendingCount
access.supplierVisitsTodayCount
access.openCheckInsExceededThresholdCount
```

---

### 20.9. Communications and Automation

```text id="dk-seed-communications-automation-metrics"
communications.sentCount
communications.criticalSentCount
communications.unreadCriticalCount
communications.deliveryFailedCount
automation.activeWorkflowsCount
automation.executionsSucceededCount
automation.executionsFailedCount
automation.deadLettersOpenCount
automation.scheduledWorkflowsActiveCount
automation.manualRunsCount
```

---

### 20.10. Audit and Security

```text id="dk-seed-audit-security-metrics"
audit.criticalEventsCount
audit.failedAccessAttemptsCount
audit.securityRelevantEventsCount
audit.platformAdminTenantAccessCount
audit.exportEventsCount
```

---

## 21. Cache

### 21.1. Persistencia

En MVP no se recomienda tabla relacional para cache de KPIs. Usar Redis.

```text id="dk-cache-persistence"
Cache primaria: Redis
Base de datos: no persistir cache como fuente oficial
```

---

### 21.2. Cache key

```text id="dk-cache-key"
tenant:{tenantId}:dashboard:{dashboardKey}:widget:{widgetKey}:period:{periodFrom}:{periodTo}:perm:{permissionHash}:filters:{filterHash}
```

---

### 21.3. Reglas

```text id="dk-cache-rules"
- Cache key incluye tenantId.
- Cache key incluye permissionHash.
- Cache key incluye filtros.
- Widgets sensibles pueden deshabilitar cache.
- TTL depende de refreshPolicy.
- No cachear storageKey.
- No cachear datos personales detallados si no es imprescindible.
- No compartir cache entre usuarios con permisos diferentes.
```

---

## 22. Estrategia de cálculos

### 22.1. Source ports

Cada grupo de métricas debe resolverse por puertos internos:

```text id="dk-source-ports"
DashboardFinancialMetricsPort
DashboardResidentsPropertiesMetricsPort
DashboardReservationsMetricsPort
DashboardFinesMetricsPort
DashboardMeetingsVotingMetricsPort
DashboardMaintenanceMetricsPort
DashboardInventoryMetricsPort
DashboardAccessMetricsPort
DashboardCommunicationsMetricsPort
DashboardAutomationMetricsPort
DashboardAuditMetricsPort
```

---

### 22.2. Regla de solo lectura

```text id="dk-read-only-rule"
Los puertos de Dashboard and KPIs solo pueden exponer métodos de lectura agregada. No deben exponer create, update, delete, validate, reverse, confirm, approve, openGate, execute o mutate.
```

---

### 22.3. Fallas de fuente

Si una fuente falla:

```text id="dk-source-failure-rule"
- No convertir fallo en cero silencioso.
- Marcar widget como unavailable si no hay datos.
- Marcar widget como partial si hay datos incompletos.
- Incluir errorCode sanitizado.
- Registrar observabilidad.
```

---

## 23. Queries críticas

### 23.1. Obtener dashboard tenant-scoped

```typescript id="dk-query-tenant-dashboard"
const dashboardConfig = await prisma.tenantDashboardConfiguration.findFirst({
  where: {
    tenantId: currentTenant.id,
    dashboardKey,
    isEnabled: true,
    configurationStatus: "active",
    archivedAt: null,
    dashboardDefinition: {
      status: "active",
      archivedAt: null
    }
  },
  include: {
    dashboardDefinition: true,
    widgetConfigurations: {
      where: {
        tenantId: currentTenant.id,
        isEnabled: true,
        configurationStatus: "active",
        archivedAt: null,
        widgetDefinition: {
          status: "active",
          archivedAt: null
        }
      },
      orderBy: {
        displayOrder: "asc"
      }
    }
  }
});
```

---

### 23.2. Listar widgets visibles

```typescript id="dk-query-visible-widgets"
const widgetConfigs = await prisma.tenantDashboardWidgetConfiguration.findMany({
  where: {
    tenantId: currentTenant.id,
    tenantDashboardConfigurationId,
    isEnabled: true,
    configurationStatus: "active",
    archivedAt: null
  },
  include: {
    widgetDefinition: {
      include: {
        metricDefinition: true
      }
    }
  },
  orderBy: {
    displayOrder: "asc"
  }
});

const visibleWidgets = widgetConfigs.filter((widget) =>
  permissionService.canReadWidget(currentUser, widget.widgetDefinition)
);
```

---

### 23.3. Crear snapshot

```typescript id="dk-query-create-snapshot"
const snapshot = await prisma.dashboardSnapshot.create({
  data: {
    tenantId: currentTenant.id,
    dashboardDefinitionId,
    dashboardKey,
    snapshotCode,
    periodFrom,
    periodTo,
    filtersSanitized,
    snapshotDataSanitized,
    status: "generated",
    generationReason,
    generatedBy: currentUser.id
  }
});
```

---

### 23.4. Crear export

```typescript id="dk-query-create-export"
const exportRecord = await prisma.dashboardExport.create({
  data: {
    tenantId: currentTenant.id,
    dashboardDefinitionId,
    dashboardSnapshotId,
    dashboardKey,
    exportType,
    format,
    filtersSanitized,
    includeSensitive,
    reason,
    status: "requested",
    requestedBy: currentUser.id
  }
});
```

---

## 24. Retención

### 24.1. Definiciones

```text id="dk-retention-definitions"
- No physical delete ordinario.
- Usar archived_at.
- Definiciones archived no se usan en nuevas configuraciones.
- Definiciones históricas se conservan para snapshots y exports previos.
```

---

### 24.2. Configuraciones tenant

```text id="dk-retention-tenant-config"
- No physical delete ordinario.
- Configuración archived no se usa.
- Historial de cambios se registra en Audit.
```

---

### 24.3. Snapshots

```text id="dk-retention-snapshots"
- Snapshots se conservan según política del tenant.
- Snapshot archived no se muestra por defecto.
- Snapshot no reemplaza datos fuente.
```

---

### 24.4. Exports

```text id="dk-retention-exports"
- Export record se conserva mientras exista secureDocumentId.
- Archivo se gestiona por Secure Document Storage.
- Archivar export no elimina automáticamente el documento.
```

---

## 25. Migración inicial

### 25.1. Nombre sugerido

```text id="dk-migration-name"
027_create_dashboard_kpis
```

---

### 25.2. Contenido de migración

```text id="dk-migration-content"
[ ] Crear enums.
[ ] Crear dashboard_definitions.
[ ] Crear dashboard_metric_definitions.
[ ] Crear dashboard_widget_definitions.
[ ] Crear tenant_dashboard_configurations.
[ ] Crear tenant_dashboard_widget_configurations.
[ ] Crear dashboard_snapshots.
[ ] Crear dashboard_exports.
[ ] Crear índices.
[ ] Crear unique constraints.
[ ] Crear checks básicos.
[ ] Agregar relaciones en Tenant.
[ ] Ejecutar prisma format.
[ ] Ejecutar migración local.
[ ] Ejecutar migración test.
```

---

## 26. Seeds iniciales

### 26.1. Dashboard definitions

```text id="dk-seed-dashboard-definitions"
executive
financial
operations
residents-units
maintenance
access-visitors
governance
communications-automation
audit-security
```

---

### 26.2. Widget definitions

Seeds mínimos por dashboard:

```text id="dk-seed-widget-definitions"
executive.total-units
executive.occupancy-rate
executive.outstanding-balance
executive.overdue-balance
executive.open-maintenance-requests
executive.open-access-incidents
executive.failed-automation-executions

financial.charges-issued-amount
financial.payments-validated-amount
financial.outstanding-balance
financial.overdue-balance
financial.collection-rate
financial.pending-payment-validations

operations.reservations-this-month
operations.fines-issued-this-month
operations.low-stock-items
operations.supplier-payables-pending-review

residents-units.total-units
residents-units.occupied-units
residents-units.registered-residents
residents-units.units-without-assigned-resident

maintenance.open-requests
maintenance.overdue-work-orders
maintenance.average-resolution-time
maintenance.pending-cost-approvals

access-visitors.visitors-today
access-visitors.open-checkins
access-visitors.denied-access-count
access-visitors.open-incidents

governance.upcoming-meetings
governance.average-attendance-rate
governance.quorum-failed-count
governance.certified-minutes-published

communications-automation.unread-critical-communications
communications-automation.notification-failures
communications-automation.active-automation-workflows
communications-automation.automation-dead-letters-open
```

---

### 26.3. Metric definitions

Usar catálogo definido en la sección 20.

Reglas:

```text id="dk-seed-rules"
- Seeds deben ser idempotentes.
- Seeds no contienen datos reales.
- Seeds no contienen SQL.
- Seeds no contienen scripts.
- Seeds no contienen fórmulas ejecutables.
- Seeds no contienen storageKey.
- Seeds no habilitan dashboards públicos.
- Seeds no habilitan WordPress access.
```

---

## 27. Performance

### 27.1. Dataset objetivo MVP

```text id="dk-performance-dataset"
Global:
- 9 dashboard definitions.
- 60 metric definitions.
- 50 widget definitions.

Por tenant:
- 9 tenant dashboard configurations.
- 50 tenant widget configurations.
- 120 dashboard snapshots.
- 200 dashboard exports.
```

---

### 27.2. Objetivos

```text id="dk-performance-objectives"
- Dashboard ejecutivo p95 < 1500 ms con cache.
- Dashboard financiero p95 < 2000 ms con cache.
- Dashboard operativo p95 < 2000 ms con cache.
- Widget individual p95 < 800 ms con cache.
- Listar dashboards p95 < 800 ms.
- Crear snapshot p95 < 3000 ms.
- Export pequeño p95 < 3000 ms.
- pageSize máximo = 100.
```

---

### 27.3. Consideraciones

```text id="dk-performance-considerations"
- Usar índices tenant_id + dashboard_key.
- Usar índices tenant_id + widget_key.
- Usar cache Redis para resultados agregados.
- Usar select explícito.
- Evitar N+1.
- Paralelizar cálculo de widgets cuando sea seguro.
- Aplicar timeout por widget.
- Marcar partial/unavailable ante fuente lenta o caída.
```

---

## 28. Concurrencia

### 28.1. Casos críticos

```text id="dk-concurrency-cases"
- Dos usuarios configuran el mismo widget simultáneamente.
- Un usuario archiva un dashboard mientras otro lo consulta.
- Un usuario genera snapshot mientras otro cambia widgets.
- Dos exports se solicitan con filtros similares.
- Cache se invalida mientras se calcula dashboard.
- Fuente transaccional cambia durante cálculo.
```

---

### 28.2. Controles

```text id="dk-concurrency-controls"
- Update condicional por status.
- Transacciones en configuración.
- Snapshot usa versión de definiciones al momento de generación.
- Export registra filtros y periodo.
- Cache eventual aceptable.
- Audit de cambios de configuración.
```

---

## 29. Data governance

### 29.1. Datos sensibles

```text id="dk-sensitive-data"
- KPIs financieros.
- KPIs de mora.
- KPIs de seguridad y acceso.
- KPIs de auditoría.
- Snapshots.
- Exports.
- Filtros con propertyUnitId.
- Métricas por unidad.
- Métricas con detalle personal.
```

---

### 29.2. Datos prohibidos

```text id="dk-data-prohibited"
- storageKey;
- signedUrl persistente;
- secretos;
- tokens;
- passwords;
- apiKeys;
- rawSql;
- scripts;
- formulaCode ejecutable;
- payload raw sensible;
- identificación completa sin permiso;
- placa completa sin permiso;
- datos cross-tenant;
- datos reales enviados a IA externa.
```

---

## 30. Campos prohibidos como columnas

No deben existir columnas con estos nombres en tablas del módulo:

```text id="dk-prohibited-columns"
secret
token
password
api_key
private_key
client_secret
webhook_secret
database_url
raw_sql
script
javascript
function_body
executable_code
formula_code
storage_key
signed_url
payment_id
journal_entry_id
bank_transaction_id
reconciliation_match_id
gate_open_command
hardware_device_command
external_ai_enabled
external_ai_real_data_allowed
```

---

## 31. Seguridad de storage

```text id="dk-storage-rule"
dashboard_exports.secure_document_id referencia un documento administrado por Secure Document Storage. El módulo nunca almacena ni retorna storageKey.
```

Reglas:

```text id="dk-storage-rules"
- No guardar storageKey.
- No guardar signedUrl persistente.
- No guardar base64.
- No guardar rawFilePayload.
- No servir binarios directamente.
- Descargar mediante módulo 016.
```

---

## 32. Auditoría de datos

### 32.1. Eventos auditables

```text id="dk-dm-audit-events"
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
dashboardSnapshot.failed
dashboardSnapshot.archived

dashboardExport.requested
dashboardExport.completed
dashboardExport.failed
dashboardExport.archived

dashboardSensitiveMetric.accessed
```

---

### 32.2. Metadata permitida

```text id="dk-dm-audit-allowed"
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

### 32.3. Metadata prohibida

```text id="dk-dm-audit-forbidden"
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

## 33. Compatibilidad con microservicios

El modelo está preparado para futura extracción porque:

```text id="dk-microservices-compat"
- dashboardKey, widgetKey y metricKey son claves estables.
- Las métricas se calculan mediante puertos.
- No hay joins obligatorios hacia tablas transaccionales externas.
- Snapshots almacenan datos agregados sanitizados.
- Exports usan SDS.
- Audit se comunica por puerto.
- Cache se abstrae con Redis.
- El módulo puede separarse como servicio read-model en el futuro.
```

---

## 34. No aceptación del modelo

No se acepta el modelo si:

```text id="dk-dm-no-acceptance"
- tenant_dashboard_configurations no tiene tenant_id;
- tenant_dashboard_widget_configurations no tiene tenant_id;
- dashboard_snapshots no tiene tenant_id;
- dashboard_exports no tiene tenant_id;
- mezcla datos de tenants;
- permite snapshots cross-tenant;
- permite exports cross-tenant;
- permite SQL arbitrario;
- permite scripts;
- permite JavaScript configurable;
- permite formulaCode ejecutable;
- usa rawSql como estrategia de cálculo;
- almacena storageKey;
- almacena signedUrl persistente;
- almacena secretos;
- almacena tokens;
- almacena passwords;
- almacena apiKeys;
- almacena payment_id para mutación;
- almacena journal_entry_id para mutación;
- almacena bank_transaction_id para mutación;
- almacena reconciliation_match_id para mutación;
- almacena gate_open_command;
- almacena hardware_device_command;
- almacena external_ai_enabled;
- almacena external_ai_real_data_allowed;
- permite widgets fuera de catálogo;
- permite métricas fuera de catálogo;
- trata snapshot como fuente de verdad transaccional;
- exporta sin Secure Document Storage;
- expone datos personales completos sin permiso;
- expone placas completas sin permiso;
- habilita dashboards públicos;
- habilita acceso desde WordPress público.
```

---

## 35. Resultado esperado

Al implementar este modelo, `027-dashboard-kpis` contará con una estructura de persistencia segura, tenant-scoped, read-heavy, basada en catálogo y preparada para calcular KPIs derivados de los módulos fuente sin comprometer la integridad transaccional del Core.

Resultado esperado:

```text id="dk-dm-expected-result"
dashboard_definitions modelado
dashboard_metric_definitions modelado
dashboard_widget_definitions modelado
tenant_dashboard_configurations modelado
tenant_dashboard_widget_configurations modelado
dashboard_snapshots modelado
dashboard_exports modelado
enums definidos
Prisma schema preliminar definido
tenant_id obligatorio definido
catálogo global definido
configuración tenant-scoped definida
snapshots sanitizados definidos
exports vía SDS definidos
metricKey estable definido
widgetKey estable definido
dashboardKey estable definido
cache tenant-scoped definida
permission-aware cache definida
puertos de métricas definidos
no SQL arbitrario
no scripts
no fórmulas ejecutables
no storageKey
no public exposure
no WordPress access
no transactional side effects
no payment execution
no accounting execution
no bank reconciliation confirmation
no hardware control
no external AI with real data
```

---

## 36. Expediente actualizado

```text id="dk-dm-expediente"
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
│   │       ├── plan.md
│   │       └── data-model.md
```
