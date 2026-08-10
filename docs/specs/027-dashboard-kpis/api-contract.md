# API Contract — 027 Dashboard and KPIs

## 1. Información del documento

| Campo           | Valor                                                                                  |
| --------------- | -------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                          |
| Spec ID         | 027                                                                                    |
| Módulo          | Dashboard and KPIs                                                                     |
| Documento       | API Contract                                                                           |
| Ruta            | `docs/specs/027-dashboard-kpis/api-contract.md`                                        |
| Versión         | 0.1                                                                                    |
| Estado          | needs-review                                                                           |
| Fecha           | 2026-08-02                                                                             |
| Documento base  | `docs/specs/027-dashboard-kpis/spec.md`                                                |
| Plan técnico    | `docs/specs/027-dashboard-kpis/plan.md`                                                |
| Modelo de datos | `docs/specs/027-dashboard-kpis/data-model.md`                                          |
| API Style       | REST                                                                                   |
| Base path       | `/api/v1`                                                                              |
| Formato         | JSON                                                                                   |
| Autenticación   | Bearer Token / Keycloak OIDC                                                           |
| Autorización    | RESIDENT Core tenant-aware permissions                                                 |
| Naturaleza      | Tenant-scoped / Analytics-facing / Read-heavy / Derived-data / Role-aware / Non-public |

---

## 2. Propósito

Este documento define el contrato API del módulo `027-dashboard-kpis`.

El contrato cubre endpoints, DTOs, responses, filtros, errores, permisos, validaciones, superficies API, consulta de dashboards, consulta de KPIs, configuración tenant-scoped, snapshots, exportaciones, auditoría, observabilidad y OpenAPI.

Regla central del contrato:

```text id="dk-api-rule"
Toda API de Dashboard and KPIs debe ser autenticada, tenant-scoped, permission-based, role-aware, read-heavy, derived-data, audit-aware y no pública; debe permitir administrar definiciones globales, configurar dashboards por tenant, consultar dashboards, calcular KPIs, generar snapshots y exportar resultados vía Secure Document Storage, sin aceptar tenantId desde cliente, sin aceptar actor fields, sin aceptar raw SQL, sin aceptar scripts, sin aceptar fórmulas ejecutables, sin exponer storageKey, sin exponer datos cross-tenant, sin habilitar acceso desde WordPress público, sin modificar datos transaccionales, sin ejecutar pagos, sin crear asientos contables, sin confirmar conciliaciones bancarias, sin controlar hardware y sin enviar datos reales a IA externa.
```

---

## 3. Convenciones generales

### 3.1. Base URL

```text id="dk-api-base-url"
/api/v1
```

---

### 3.2. Content-Type

```http id="dk-api-content-type"
Content-Type: application/json
Accept: application/json
```

---

### 3.3. Autenticación

Todos los endpoints permitidos requieren:

```http id="dk-api-auth-header"
Authorization: Bearer <access_token>
```

Reglas:

```text id="dk-api-auth-rules"
- Keycloak autentica.
- RESIDENT Core resuelve UserProfile.
- RESIDENT Core resuelve TenantMembership.
- RESIDENT Core resuelve currentTenant.
- RESIDENT Core autoriza por permiso, rol, sensibilidad y recurso.
```

Prohibido:

```text id="dk-api-auth-forbidden"
- acceso anónimo;
- API key pública;
- token por query string;
- sesión WordPress como autenticación Core;
- userId enviado por cliente como actor;
- tenantId enviado por cliente como autoridad;
- consumo desde WordPress público;
- dashboards públicos.
```

---

### 3.4. Fechas

Todas las fechas deben manejarse en ISO 8601 UTC.

Ejemplo:

```json id="dk-api-date-example"
{
  "periodFrom": "2026-08-01T00:00:00.000Z",
  "periodTo": "2026-08-31T23:59:59.000Z"
}
```

---

### 3.5. Moneda y decimales

Los montos monetarios deben enviarse como string decimal.

```json id="dk-api-money-example"
{
  "valueType": "amount",
  "value": "1250.75",
  "currency": "USD"
}
```

Reglas:

```text id="dk-api-money-rules"
- No usar float para dinero.
- Moneda default del tenant: USD.
- Cálculos financieros deben ser Decimal-safe.
```

---

### 3.6. Response envelope

Respuesta simple:

```json id="dk-api-envelope-single"
{
  "data": {
    "id": "uuid"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Respuesta paginada:

```json id="dk-api-envelope-page"
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

Respuesta de error:

```json id="dk-api-error-envelope"
{
  "error": {
    "code": "DASHBOARD_NOT_FOUND",
    "message": "Dashboard not found.",
    "details": {},
    "traceId": "trace-id"
  }
}
```

---

## 4. Superficies API

### 4.1. Platform API

```text id="dk-api-platform-surface"
/api/v1/platform/dashboard-definitions
/api/v1/platform/dashboard-widget-definitions
/api/v1/platform/dashboard-metric-definitions
```

Uso:

```text id="dk-api-platform-use"
Administración del catálogo global de dashboards, widgets y métricas por PlatformAdmin autorizado.
```

---

### 4.2. Tenant API

```text id="dk-api-tenant-surface"
/api/v1/tenant/dashboards
/api/v1/tenant/dashboard-snapshots
/api/v1/tenant/dashboard-exports
```

Uso:

```text id="dk-api-tenant-use"
Consulta, configuración, snapshot y exportación de dashboards del tenant actual.
```

---

### 4.3. Internal service ports

No son endpoints públicos. Se implementan como puertos internos.

```text id="dk-api-internal-surface"
calculateDashboard(command)
calculateWidget(command)
calculateMetric(command)
resolveVisibleWidgets(command)
generateDashboardSnapshot(command)
generateDashboardExport(command)
```

---

### 4.4. Public API prohibida

No implementar:

```text id="dk-api-public-forbidden"
/api/v1/public/dashboards
/api/v1/public/dashboard-kpis
/api/v1/public/tenants/{slug}/dashboards
/api/v1/public/tenants/{slug}/dashboard-kpis
/api/v1/public/tenants/{slug}/dashboard-widgets
/api/v1/public/tenants/{slug}/dashboard-exports
```

Respuesta esperada:

```http id="dk-api-public-response"
404 Not Found
```

---

## 5. Tenant context

El tenant se resuelve server-side desde el contexto autenticado.

No se acepta `tenantId` en body, query o path para operaciones tenant ordinarias.

Request prohibido:

```json id="dk-api-tenantid-forbidden"
{
  "tenantId": "uuid",
  "dashboardKey": "financial"
}
```

Respuesta esperada:

```http id="dk-api-tenantid-response"
422 Unprocessable Entity
```

Regla cross-tenant:

```text id="dk-api-cross-tenant-rule"
Si un recurso existe pero pertenece a otro tenant, la API debe responder 404 Not Found.
```

---

## 6. Paginación, filtros y ordenamiento

### 6.1. Parámetros estándar

```text id="dk-api-pagination"
page
pageSize
sortBy
sortDirection
```

Reglas:

```text id="dk-api-pagination-rules"
- page inicia en 1.
- pageSize default = 25.
- pageSize máximo = 100.
- sortDirection = asc | desc.
- sortBy debe pertenecer a whitelist por endpoint.
```

---

### 6.2. Filtros comunes

```text id="dk-api-common-filters"
dashboardKey
widgetKey
metricKey
category
sourceModule
status
sensitivity
periodFrom
periodTo
comparison
includeDisabled
includeArchived
includeSnapshots
includeWidgets
includeKpis
includeSensitive
```

---

### 6.3. Reglas de filtros

```text id="dk-api-filter-rules"
- periodFrom <= periodTo.
- periodFrom y periodTo son obligatorios para cálculo de KPIs cuando defaultPeriod no aplica.
- pageSize no puede superar 100.
- sortBy debe estar permitido por endpoint.
- No se acepta tenantId como filtro externo.
- No se acepta rawSql.
- No se aceptan filtros ejecutables.
- includeSensitive requiere permiso reforzado.
```

---

## 7. Permisos

### 7.1. Definiciones globales

```text id="dk-api-permissions-definitions"
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

### 7.2. Dashboards tenant

```text id="dk-api-permissions-tenant"
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

### 7.3. Permisos reforzados

```text id="dk-api-permissions-sensitive"
tenantDashboards.exportSensitive
tenantDashboardMetrics.readPersonalData
tenantDashboardMetrics.readFinancialDetail
tenantDashboardMetrics.readSecurityDetail
tenantDashboardMetrics.readAuditDetail
dashboardDefinitions.manageSensitive
```

Regla:

```text id="dk-api-permission-rule"
Un permiso de dashboard no reemplaza los permisos del módulo fuente. El usuario debe tener autorización para ver la categoría de datos que el KPI resume.
```

---

# 8. Platform API — Dashboard Definitions

## 8.1. List dashboard definitions

```http id="dk-api-list-dashboard-definitions"
GET /api/v1/platform/dashboard-definitions
```

Permiso:

```text id="dk-api-perm-list-dashboard-definitions"
dashboardDefinitions.read
```

Query params:

```text id="dk-api-query-dashboard-definitions"
category
scope
status
search
page
pageSize
sortBy
sortDirection
```

Response:

```json id="dk-api-response-dashboard-definitions"
{
  "data": [
    {
      "id": "uuid",
      "dashboardKey": "executive",
      "name": "Dashboard ejecutivo",
      "description": "Vista general del tenant.",
      "category": "executive",
      "scope": "tenantConfigurable",
      "status": "active",
      "createdAt": "2026-08-02T22:00:00.000Z",
      "updatedAt": "2026-08-02T22:00:00.000Z"
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

## 8.2. Create dashboard definition

```http id="dk-api-create-dashboard-definition"
POST /api/v1/platform/dashboard-definitions
```

Permiso:

```text id="dk-api-perm-create-dashboard-definition"
dashboardDefinitions.create
```

Permiso adicional si contiene configuración sensible:

```text id="dk-api-perm-create-dashboard-definition-sensitive"
dashboardDefinitions.manageSensitive
```

Request:

```json id="dk-api-request-create-dashboard-definition"
{
  "dashboardKey": "financial",
  "name": "Dashboard financiero",
  "description": "Vista de cargos, pagos, saldos y mora.",
  "category": "financial",
  "scope": "tenantConfigurable",
  "defaultRoleVisibility": {
    "roles": ["tenantAdmin", "boardMember", "financialManager"],
    "requiresAnyPermission": ["tenantDashboardMetrics.readFinancial"],
    "requiresAllPermissions": []
  },
  "defaultFilters": {
    "period": "currentMonth",
    "comparison": "previousEquivalentPeriod",
    "includeArchived": false
  }
}
```

Reglas:

```text id="dk-api-create-dashboard-definition-rules"
- dashboardKey debe ser único.
- dashboardKey debe usar kebab-case.
- name obligatorio.
- category obligatoria.
- scope obligatorio.
- defaultRoleVisibility debe ser declarativo.
- defaultFilters debe ser declarativo.
- No se acepta rawSql.
- No se acepta script.
- No se acepta formulaCode.
- No se acepta executableCode.
- No se acepta storageKey.
- createdBy se resuelve server-side.
- Debe auditar dashboardDefinition.created.
```

Response:

```http id="dk-api-created-dashboard-definition-http"
201 Created
```

```json id="dk-api-response-create-dashboard-definition"
{
  "data": {
    "id": "uuid",
    "dashboardKey": "financial",
    "status": "active",
    "createdAt": "2026-08-02T22:00:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 8.3. Get dashboard definition

```http id="dk-api-get-dashboard-definition"
GET /api/v1/platform/dashboard-definitions/{dashboardDefinitionId}
```

Permiso:

```text id="dk-api-perm-get-dashboard-definition"
dashboardDefinitions.read
```

---

## 8.4. Update dashboard definition

```http id="dk-api-update-dashboard-definition"
PATCH /api/v1/platform/dashboard-definitions/{dashboardDefinitionId}
```

Permiso:

```text id="dk-api-perm-update-dashboard-definition"
dashboardDefinitions.update
```

Request:

```json id="dk-api-request-update-dashboard-definition"
{
  "name": "Dashboard financiero",
  "description": "Vista financiera agregada y segura para administración.",
  "defaultFilters": {
    "period": "currentMonth",
    "comparison": "previousEquivalentPeriod"
  }
}
```

Reglas:

```text id="dk-api-update-dashboard-definition-rules"
- No acepta status directo.
- No acepta actor fields.
- No acepta rawSql.
- No acepta scripts.
- No acepta formulaCode.
- No modifica datos tenant.
- Debe auditar dashboardDefinition.updated.
```

---

## 8.5. Archive dashboard definition

```http id="dk-api-archive-dashboard-definition"
POST /api/v1/platform/dashboard-definitions/{dashboardDefinitionId}/archive
```

Permiso:

```text id="dk-api-perm-archive-dashboard-definition"
dashboardDefinitions.archive
```

Request:

```json id="dk-api-request-archive-dashboard-definition"
{
  "archiveReason": "Dashboard reemplazado por nueva definición."
}
```

Reglas:

```text id="dk-api-archive-dashboard-definition-rules"
- No borra físicamente.
- Dashboard archived no puede habilitarse en nuevas configuraciones tenant.
- Configuraciones históricas se conservan.
- Debe auditar dashboardDefinition.archived.
```

---

# 9. Platform API — Dashboard Metric Definitions

## 9.1. List metric definitions

```http id="dk-api-list-metric-definitions"
GET /api/v1/platform/dashboard-metric-definitions
```

Permiso:

```text id="dk-api-perm-list-metric-definitions"
dashboardMetricDefinitions.read
```

Query params:

```text id="dk-api-query-metric-definitions"
category
sourceModule
valueType
aggregationType
sensitivity
status
search
page
pageSize
sortBy
sortDirection
```

---

## 9.2. Create metric definition

```http id="dk-api-create-metric-definition"
POST /api/v1/platform/dashboard-metric-definitions
```

Permiso:

```text id="dk-api-perm-create-metric-definition"
dashboardMetricDefinitions.create
```

Permiso adicional si es sensible:

```text id="dk-api-perm-create-metric-definition-sensitive"
dashboardDefinitions.manageSensitive
```

Request:

```json id="dk-api-request-create-metric-definition"
{
  "metricKey": "financial.outstandingBalance",
  "name": "Saldo pendiente",
  "description": "Total pendiente de cobro en el periodo.",
  "category": "financial",
  "sourceModule": "006-account-statements",
  "valueType": "amount",
  "aggregationType": "sum",
  "sensitivity": "financialSensitive",
  "supportsComparison": true,
  "supportsTrend": true,
  "supportsBreakdown": true,
  "requiredPermission": "tenantDashboardMetrics.readFinancial",
  "requiredSensitivePermission": "tenantDashboardMetrics.readFinancialDetail",
  "calculationStrategy": "sourcePort"
}
```

Reglas:

```text id="dk-api-create-metric-definition-rules"
- metricKey debe ser único.
- metricKey debe usar formato category.name.
- sourceModule obligatorio.
- valueType obligatorio.
- aggregationType obligatorio.
- calculationStrategy debe ser sourcePort, derivedComposite o staticDefinition.
- No se permite calculationStrategy=rawSql.
- No se permite rawSql.
- No se permite formulaCode.
- No se permite script.
- Métricas sensibles requieren requiredPermission.
- Métricas altamente sensibles requieren requiredSensitivePermission.
- Debe auditar dashboardMetricDefinition.created.
```

Response:

```http id="dk-api-created-metric-definition-http"
201 Created
```

```json id="dk-api-response-create-metric-definition"
{
  "data": {
    "id": "uuid",
    "metricKey": "financial.outstandingBalance",
    "status": "active",
    "createdAt": "2026-08-02T22:00:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 9.3. Get metric definition

```http id="dk-api-get-metric-definition"
GET /api/v1/platform/dashboard-metric-definitions/{metricDefinitionId}
```

Permiso:

```text id="dk-api-perm-get-metric-definition"
dashboardMetricDefinitions.read
```

---

## 9.4. Update metric definition

```http id="dk-api-update-metric-definition"
PATCH /api/v1/platform/dashboard-metric-definitions/{metricDefinitionId}
```

Permiso:

```text id="dk-api-perm-update-metric-definition"
dashboardMetricDefinitions.update
```

Reglas:

```text id="dk-api-update-metric-definition-rules"
- No acepta rawSql.
- No acepta SQL personalizado.
- No acepta script.
- No acepta formulaCode.
- No acepta executableCode.
- No acepta status directo.
- Metric archived no puede reactivarse sin endpoint explícito futuro.
- Debe auditar dashboardMetricDefinition.updated.
```

---

## 9.5. Archive metric definition

```http id="dk-api-archive-metric-definition"
POST /api/v1/platform/dashboard-metric-definitions/{metricDefinitionId}/archive
```

Permiso:

```text id="dk-api-perm-archive-metric-definition"
dashboardMetricDefinitions.archive
```

Request:

```json id="dk-api-request-archive-metric-definition"
{
  "archiveReason": "Métrica reemplazada por nueva estrategia de cálculo."
}
```

Reglas:

```text id="dk-api-archive-metric-definition-rules"
- No borra físicamente.
- Metric archived no puede asociarse a nuevos widgets.
- Widgets históricos conservan referencia.
- Debe auditar dashboardMetricDefinition.archived.
```

---

# 10. Platform API — Dashboard Widget Definitions

## 10.1. List widget definitions

```http id="dk-api-list-widget-definitions"
GET /api/v1/platform/dashboard-widget-definitions
```

Permiso:

```text id="dk-api-perm-list-widget-definitions"
dashboardWidgetDefinitions.read
```

Query params:

```text id="dk-api-query-widget-definitions"
dashboardKey
metricKey
category
sourceModule
widgetType
sensitivity
status
search
page
pageSize
sortBy
sortDirection
```

---

## 10.2. Create widget definition

```http id="dk-api-create-widget-definition"
POST /api/v1/platform/dashboard-widget-definitions
```

Permiso:

```text id="dk-api-perm-create-widget-definition"
dashboardWidgetDefinitions.create
```

Permiso adicional si es sensible:

```text id="dk-api-perm-create-widget-definition-sensitive"
dashboardDefinitions.manageSensitive
```

Request:

```json id="dk-api-request-create-widget-definition"
{
  "widgetKey": "financial.outstanding-balance-card",
  "dashboardDefinitionId": "uuid",
  "metricDefinitionId": "uuid",
  "name": "Saldo pendiente",
  "description": "Muestra el saldo pendiente agregado.",
  "widgetType": "currencyCard",
  "sourceModule": "006-account-statements",
  "sensitivity": "financialSensitive",
  "requiredPermission": "tenantDashboardMetrics.readFinancial",
  "requiredSensitivePermission": "tenantDashboardMetrics.readFinancialDetail",
  "defaultSize": "medium",
  "defaultOrder": 1,
  "defaultConfig": {
    "showComparison": true,
    "displayCurrency": true
  }
}
```

Reglas:

```text id="dk-api-create-widget-definition-rules"
- widgetKey debe ser único.
- widgetKey debe usar formato dashboard.metric-widget.
- dashboardDefinitionId debe existir y estar active.
- metricDefinitionId debe existir y estar active.
- widgetType debe estar permitido.
- sensitivity debe ser compatible con la métrica.
- defaultConfig debe ser declarativo.
- No se acepta rawSql.
- No se acepta script.
- No se acepta formulaCode.
- No se acepta executableCode.
- No se acepta storageKey.
- Debe auditar dashboardWidgetDefinition.created.
```

Response:

```http id="dk-api-created-widget-definition-http"
201 Created
```

```json id="dk-api-response-create-widget-definition"
{
  "data": {
    "id": "uuid",
    "widgetKey": "financial.outstanding-balance-card",
    "status": "active",
    "createdAt": "2026-08-02T22:00:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 10.3. Get widget definition

```http id="dk-api-get-widget-definition"
GET /api/v1/platform/dashboard-widget-definitions/{widgetDefinitionId}
```

Permiso:

```text id="dk-api-perm-get-widget-definition"
dashboardWidgetDefinitions.read
```

---

## 10.4. Update widget definition

```http id="dk-api-update-widget-definition"
PATCH /api/v1/platform/dashboard-widget-definitions/{widgetDefinitionId}
```

Permiso:

```text id="dk-api-perm-update-widget-definition"
dashboardWidgetDefinitions.update
```

Reglas:

```text id="dk-api-update-widget-definition-rules"
- No acepta status directo.
- No acepta rawSql.
- No acepta scripts.
- No acepta formulaCode.
- No acepta storageKey.
- Debe auditar dashboardWidgetDefinition.updated.
```

---

## 10.5. Archive widget definition

```http id="dk-api-archive-widget-definition"
POST /api/v1/platform/dashboard-widget-definitions/{widgetDefinitionId}/archive
```

Permiso:

```text id="dk-api-perm-archive-widget-definition"
dashboardWidgetDefinitions.archive
```

Request:

```json id="dk-api-request-archive-widget-definition"
{
  "archiveReason": "Widget reemplazado por nueva versión visual."
}
```

---

# 11. Tenant API — Dashboards

## 11.1. List tenant dashboards

```http id="dk-api-list-tenant-dashboards"
GET /api/v1/tenant/dashboards
```

Permiso:

```text id="dk-api-perm-list-tenant-dashboards"
tenantDashboards.read
```

Query params:

```text id="dk-api-query-tenant-dashboards"
category
status
includeDisabled
page
pageSize
sortBy
sortDirection
```

Response:

```json id="dk-api-response-tenant-dashboards"
{
  "data": [
    {
      "dashboardKey": "executive",
      "name": "Dashboard ejecutivo",
      "displayName": "Resumen general",
      "category": "executive",
      "isEnabled": true,
      "configurationStatus": "active",
      "defaultPeriod": "currentMonth",
      "refreshPolicy": "standardTtl",
      "visibleWidgetsCount": 7
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

```text id="dk-api-list-tenant-dashboards-rules"
- Lista solo dashboards del tenant actual.
- Solo muestra dashboards compatibles con permisos del usuario.
- No muestra dashboards archived por defecto.
- No expone datos transaccionales.
```

---

## 11.2. Get tenant dashboard

```http id="dk-api-get-tenant-dashboard"
GET /api/v1/tenant/dashboards/{dashboardKey}
```

Permiso:

```text id="dk-api-perm-get-tenant-dashboard"
tenantDashboards.read
```

Query params:

```text id="dk-api-query-get-dashboard"
periodFrom
periodTo
comparison
includeWidgets
includeKpis
includeUnavailable
```

Response:

```json id="dk-api-response-get-dashboard"
{
  "data": {
    "dashboardKey": "financial",
    "name": "Dashboard financiero",
    "displayName": "Finanzas",
    "category": "financial",
    "period": {
      "from": "2026-08-01T00:00:00.000Z",
      "to": "2026-08-31T23:59:59.000Z"
    },
    "comparison": {
      "type": "previousEquivalentPeriod",
      "from": "2026-07-01T00:00:00.000Z",
      "to": "2026-07-31T23:59:59.000Z"
    },
    "availability": "available",
    "widgets": [
      {
        "widgetKey": "financial.outstanding-balance-card",
        "name": "Saldo pendiente",
        "widgetType": "currencyCard",
        "size": "medium",
        "displayOrder": 1,
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
    ]
  },
  "meta": {
    "traceId": "trace-id",
    "cacheStatus": "miss"
  }
}
```

Reglas:

```text id="dk-api-get-dashboard-rules"
- dashboardKey debe estar habilitado para el tenant.
- Widget visible requiere permisos.
- Widget financiero requiere permiso financiero.
- Widget de seguridad requiere permiso de seguridad.
- Widget de auditoría requiere permiso de auditoría.
- No muestra datos sensibles sin permiso reforzado.
- Falla de widget no tumba todo el dashboard.
- Widget con fuente caída se marca unavailable.
- Widget con datos incompletos se marca partial.
- No modifica datos transaccionales.
```

---

## 11.3. Get tenant dashboard widgets

```http id="dk-api-get-dashboard-widgets"
GET /api/v1/tenant/dashboards/{dashboardKey}/widgets
```

Permiso:

```text id="dk-api-perm-get-dashboard-widgets"
tenantDashboardWidgets.read
```

Response:

```json id="dk-api-response-dashboard-widgets"
{
  "data": [
    {
      "widgetKey": "executive.outstanding-balance",
      "name": "Saldo pendiente",
      "widgetType": "currencyCard",
      "metricKey": "financial.outstandingBalance",
      "sourceModule": "006-account-statements",
      "sensitivity": "financialSensitive",
      "isEnabled": true,
      "displayOrder": 1,
      "size": "medium",
      "thresholdConfig": {
        "warning": {
          "operator": "greaterThanOrEqual",
          "value": "1000.00"
        }
      }
    }
  ],
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 11.4. Get dashboard KPIs

```http id="dk-api-get-dashboard-kpis"
GET /api/v1/tenant/dashboards/{dashboardKey}/kpis
```

Permiso:

```text id="dk-api-perm-get-dashboard-kpis"
tenantDashboardMetrics.read
```

Query params:

```text id="dk-api-query-dashboard-kpis"
metricKey
widgetKey
periodFrom
periodTo
comparison
breakdown
includeSensitive
```

Response:

```json id="dk-api-response-dashboard-kpis"
{
  "data": [
    {
      "metricKey": "financial.collectionRate",
      "widgetKey": "financial.collection-rate-trend",
      "valueType": "percentage",
      "value": "87.50",
      "periodFrom": "2026-08-01T00:00:00.000Z",
      "periodTo": "2026-08-31T23:59:59.000Z",
      "availability": "available",
      "comparison": {
        "previousValue": "82.25",
        "delta": "5.25",
        "deltaPercentage": "6.38"
      },
      "sourceModules": ["004-dues-fees", "005-payments"]
    }
  ],
  "meta": {
    "traceId": "trace-id",
    "cacheStatus": "hit"
  }
}
```

Reglas:

```text id="dk-api-dashboard-kpis-rules"
- metricKey debe existir y estar active.
- Usuario debe tener permiso requerido por la métrica.
- includeSensitive=true requiere permiso reforzado.
- breakdown=true requiere supportsBreakdown=true.
- comparison requiere supportsComparison=true.
- No se devuelve detalle personal sin permiso específico.
- No se devuelve storageKey.
```

---

# 12. Tenant API — Dashboard Configuration

## 12.1. Configure tenant dashboard

```http id="dk-api-configure-dashboard"
PATCH /api/v1/tenant/dashboards/{dashboardKey}/configuration
```

Permiso:

```text id="dk-api-perm-configure-dashboard"
tenantDashboards.configure
```

Request:

```json id="dk-api-request-configure-dashboard"
{
  "isEnabled": true,
  "displayName": "Resumen financiero",
  "defaultPeriod": "currentMonth",
  "refreshPolicy": "standardTtl"
}
```

Reglas:

```text id="dk-api-configure-dashboard-rules"
- dashboardKey debe existir y estar active.
- Configuración pertenece al tenant actual.
- No acepta tenantId.
- No acepta actor fields.
- No acepta status directo.
- No habilita dashboard público.
- No modifica definiciones globales.
- Debe auditar tenantDashboardConfiguration.updated.
```

Response:

```json id="dk-api-response-configure-dashboard"
{
  "data": {
    "dashboardKey": "financial",
    "isEnabled": true,
    "displayName": "Resumen financiero",
    "defaultPeriod": "currentMonth",
    "refreshPolicy": "standardTtl",
    "updatedAt": "2026-08-02T22:00:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 12.2. Configure tenant widget

```http id="dk-api-configure-widget"
PATCH /api/v1/tenant/dashboards/{dashboardKey}/widgets/{widgetKey}/configuration
```

Permiso:

```text id="dk-api-perm-configure-widget"
tenantDashboardWidgets.configure
```

Request:

```json id="dk-api-request-configure-widget"
{
  "isEnabled": true,
  "displayOrder": 2,
  "size": "medium",
  "customLabel": "Mora acumulada",
  "thresholdConfig": {
    "warning": {
      "operator": "greaterThanOrEqual",
      "value": "1000.00"
    },
    "critical": {
      "operator": "greaterThanOrEqual",
      "value": "2500.00"
    },
    "displayMode": "badge"
  },
  "visibilityConfig": {
    "hiddenForRoles": ["resident"],
    "requiresAnyPermission": ["tenantDashboardMetrics.readFinancial"]
  }
}
```

Reglas:

```text id="dk-api-configure-widget-rules"
- dashboardKey debe pertenecer a dashboard activo.
- widgetKey debe pertenecer a dashboard.
- Configuración pertenece al tenant actual.
- thresholdConfig debe ser declarativo.
- visibilityConfig no puede ampliar permisos.
- No acepta rawSql.
- No acepta scripts.
- No acepta formulaCode.
- No acepta storageKey.
- Debe auditar tenantDashboardWidgetConfiguration.updated.
```

Response:

```json id="dk-api-response-configure-widget"
{
  "data": {
    "dashboardKey": "financial",
    "widgetKey": "financial.overdue-balance-card",
    "isEnabled": true,
    "displayOrder": 2,
    "size": "medium",
    "updatedAt": "2026-08-02T22:00:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

# 13. Tenant API — Dashboard Snapshots

## 13.1. Generate dashboard snapshot

```http id="dk-api-create-snapshot"
POST /api/v1/tenant/dashboards/{dashboardKey}/snapshots
```

Permiso:

```text id="dk-api-perm-create-snapshot"
tenantDashboards.snapshot
```

Request:

```json id="dk-api-request-create-snapshot"
{
  "periodFrom": "2026-08-01T00:00:00.000Z",
  "periodTo": "2026-08-31T23:59:59.000Z",
  "filters": {
    "comparison": "previousEquivalentPeriod",
    "includeUnavailable": true
  },
  "generationReason": "Cierre administrativo mensual."
}
```

Reglas:

```text id="dk-api-create-snapshot-rules"
- dashboardKey debe estar habilitado.
- periodFrom <= periodTo.
- filters se sanitiza.
- Snapshot contiene datos agregados y sanitizados.
- Snapshot no contiene storageKey.
- Snapshot no contiene datos cross-tenant.
- Snapshot no reemplaza fuente transaccional.
- generatedBy se resuelve server-side.
- Debe auditar dashboardSnapshot.generated.
```

Response:

```http id="dk-api-create-snapshot-http"
201 Created
```

```json id="dk-api-response-create-snapshot"
{
  "data": {
    "snapshotId": "uuid",
    "snapshotCode": "financial-2026-08",
    "dashboardKey": "financial",
    "periodFrom": "2026-08-01T00:00:00.000Z",
    "periodTo": "2026-08-31T23:59:59.000Z",
    "status": "generated",
    "generatedAt": "2026-08-31T23:59:59.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 13.2. List dashboard snapshots

```http id="dk-api-list-snapshots"
GET /api/v1/tenant/dashboard-snapshots
```

Permiso:

```text id="dk-api-perm-list-snapshots"
tenantDashboards.snapshot
```

Query params:

```text id="dk-api-query-snapshots"
dashboardKey
status
periodFrom
periodTo
generatedFrom
generatedTo
page
pageSize
sortBy
sortDirection
```

Response:

```json id="dk-api-response-snapshots"
{
  "data": [
    {
      "id": "uuid",
      "snapshotCode": "financial-2026-08",
      "dashboardKey": "financial",
      "periodFrom": "2026-08-01T00:00:00.000Z",
      "periodTo": "2026-08-31T23:59:59.000Z",
      "status": "generated",
      "generatedAt": "2026-08-31T23:59:59.000Z"
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

## 13.3. Get dashboard snapshot

```http id="dk-api-get-snapshot"
GET /api/v1/tenant/dashboard-snapshots/{snapshotId}
```

Permiso:

```text id="dk-api-perm-get-snapshot"
tenantDashboards.snapshot
```

Query params:

```text id="dk-api-query-get-snapshot"
includeData
```

Response:

```json id="dk-api-response-get-snapshot"
{
  "data": {
    "id": "uuid",
    "snapshotCode": "financial-2026-08",
    "dashboardKey": "financial",
    "periodFrom": "2026-08-01T00:00:00.000Z",
    "periodTo": "2026-08-31T23:59:59.000Z",
    "status": "generated",
    "snapshotData": {
      "dashboardKey": "financial",
      "widgets": [
        {
          "widgetKey": "financial.outstanding-balance-card",
          "metricKey": "financial.outstandingBalance",
          "valueType": "amount",
          "value": "1250.75",
          "currency": "USD",
          "availability": "available"
        }
      ]
    },
    "generatedAt": "2026-08-31T23:59:59.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="dk-api-get-snapshot-rules"
- snapshotId debe pertenecer al tenant actual.
- includeData puede requerir permisos sensibles si snapshot contiene métricas sensibles.
- No devuelve storageKey.
- No devuelve raw payload sensible.
```

---

## 13.4. Archive dashboard snapshot

```http id="dk-api-archive-snapshot"
POST /api/v1/tenant/dashboard-snapshots/{snapshotId}/archive
```

Permiso:

```text id="dk-api-perm-archive-snapshot"
tenantDashboards.snapshot
```

Request:

```json id="dk-api-request-archive-snapshot"
{
  "archiveReason": "Snapshot reemplazado por cierre corregido."
}
```

Reglas:

```text id="dk-api-archive-snapshot-rules"
- No borra físicamente.
- snapshotId debe pertenecer al tenant actual.
- Debe auditar dashboardSnapshot.archived.
```

---

# 14. Tenant API — Dashboard Exports

## 14.1. List dashboard exports

```http id="dk-api-list-exports"
GET /api/v1/tenant/dashboard-exports
```

Permiso:

```text id="dk-api-perm-list-exports"
tenantDashboards.export
```

Query params:

```text id="dk-api-query-exports"
dashboardKey
exportType
format
status
createdFrom
createdTo
page
pageSize
sortBy
sortDirection
```

Response:

```json id="dk-api-response-exports"
{
  "data": [
    {
      "id": "uuid",
      "dashboardKey": "financial",
      "exportType": "financialKpiSummary",
      "format": "xlsx",
      "status": "completed",
      "secureDocumentId": "uuid",
      "includeSensitive": false,
      "createdAt": "2026-08-31T23:59:59.000Z",
      "completedAt": "2026-09-01T00:00:05.000Z"
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

## 14.2. Create dashboard export

```http id="dk-api-create-export"
POST /api/v1/tenant/dashboard-exports
```

Permiso:

```text id="dk-api-perm-create-export"
tenantDashboards.export
```

Permiso adicional si incluye datos sensibles:

```text id="dk-api-perm-create-sensitive-export"
tenantDashboards.exportSensitive
```

Request:

```json id="dk-api-request-create-export"
{
  "dashboardKey": "financial",
  "dashboardSnapshotId": "uuid",
  "exportType": "financialKpiSummary",
  "format": "xlsx",
  "periodFrom": "2026-08-01T00:00:00.000Z",
  "periodTo": "2026-08-31T23:59:59.000Z",
  "filters": {
    "comparison": "previousEquivalentPeriod"
  },
  "includeSensitive": false,
  "reason": "Revisión de cierre mensual."
}
```

Valores permitidos:

```text id="dk-api-export-values"
exportType = dashboardCurrentView | dashboardSnapshot | financialKpiSummary | operationsKpiSummary | securityKpiSummary | maintenanceKpiSummary | fullDashboardSummary
format = json | xlsx | pdf
```

Reglas:

```text id="dk-api-create-export-rules"
- Export requiere permiso tenantDashboards.export.
- includeSensitive=true requiere tenantDashboards.exportSensitive.
- financialKpiSummary requiere permiso financiero.
- securityKpiSummary requiere permiso de seguridad.
- audit-related export requiere permiso de auditoría.
- fullDashboardSummary requiere reason.
- dashboardSnapshot export requiere snapshotId tenant-scoped.
- Export usa Secure Document Storage.
- Response devuelve secureDocumentId cuando esté completed.
- Response no devuelve storageKey.
- Export no incluye secrets.
- Export no incluye raw payload sensible.
- Export no incluye scripts.
- Export no incluye rawSql.
- Debe auditar dashboardExport.requested/completed/failed.
```

Response:

```http id="dk-api-create-export-http"
202 Accepted
```

```json id="dk-api-response-create-export"
{
  "data": {
    "exportId": "uuid",
    "dashboardKey": "financial",
    "exportType": "financialKpiSummary",
    "format": "xlsx",
    "status": "requested",
    "createdAt": "2026-08-31T23:59:59.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 14.3. Get dashboard export

```http id="dk-api-get-export"
GET /api/v1/tenant/dashboard-exports/{exportId}
```

Permiso:

```text id="dk-api-perm-get-export"
tenantDashboards.export
```

Response:

```json id="dk-api-response-get-export"
{
  "data": {
    "id": "uuid",
    "dashboardKey": "financial",
    "exportType": "financialKpiSummary",
    "format": "xlsx",
    "status": "completed",
    "secureDocumentId": "uuid",
    "downloadAvailable": true,
    "includeSensitive": false,
    "createdAt": "2026-08-31T23:59:59.000Z",
    "completedAt": "2026-09-01T00:00:05.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="dk-api-get-export-rules"
- exportId debe pertenecer al tenant actual.
- No devuelve storageKey.
- No devuelve signedUrl persistente.
- Descarga se delega a Secure Document Storage.
```

---

# 15. Internal API / Service Ports

## 15.1. Calculate dashboard

```typescript id="dk-api-internal-calculate-dashboard"
calculateDashboard(command: CalculateDashboardCommand): Promise<DashboardResult>
```

Command:

```typescript id="dk-api-internal-calculate-dashboard-command"
type CalculateDashboardCommand = {
  tenantId: string;
  actorUserProfileId: string;
  dashboardKey: string;
  periodFrom: string;
  periodTo: string;
  comparison?: "none" | "previousEquivalentPeriod";
  filters?: Record<string, unknown>;
  includeUnavailable?: boolean;
  traceId: string;
};
```

Reglas:

```text id="dk-api-internal-calculate-dashboard-rules"
- Requiere tenantId.
- Requiere actor.
- Requiere dashboardKey.
- Requiere periodFrom y periodTo.
- No modifica datos.
- No ejecuta acciones transaccionales.
- Retorna widgets visibles según permisos.
```

---

## 15.2. Calculate metric

```typescript id="dk-api-internal-calculate-metric"
calculateMetric(command: CalculateMetricCommand): Promise<DashboardKpiResult>
```

Command:

```typescript id="dk-api-internal-calculate-metric-command"
type CalculateMetricCommand = {
  tenantId: string;
  actorUserProfileId: string;
  metricKey: string;
  periodFrom: string;
  periodTo: string;
  comparison?: "none" | "previousEquivalentPeriod";
  breakdown?: boolean;
  filters?: Record<string, unknown>;
  traceId: string;
};
```

Reglas:

```text id="dk-api-internal-calculate-metric-rules"
- metricKey debe existir y estar active.
- Cálculo usa puerto interno del sourceModule.
- No usa raw SQL definido por usuario.
- No ejecuta script.
- No modifica datos.
- Falla de fuente retorna unavailable o partial.
```

---

## 15.3. Resolve visible widgets

```typescript id="dk-api-internal-visible-widgets"
resolveVisibleWidgets(command: ResolveVisibleWidgetsCommand): Promise<VisibleDashboardWidget[]>
```

Reglas:

```text id="dk-api-internal-visible-widget-rules"
- Considera permisos del usuario.
- Considera sensibilidad del widget.
- Considera visibilityConfig.
- visibilityConfig no puede ampliar permisos.
- Resident no accede a dashboards administrativos en MVP.
```

---

# 16. DTOs principales

## 16.1. `CreateDashboardDefinitionDto`

```typescript id="dk-api-dto-create-dashboard-definition"
type CreateDashboardDefinitionDto = {
  dashboardKey: string;
  name: string;
  description?: string;
  category: DashboardCategory;
  scope: DashboardScope;
  defaultRoleVisibility?: Record<string, unknown>;
  defaultFilters?: Record<string, unknown>;
};
```

---

## 16.2. `CreateDashboardMetricDefinitionDto`

```typescript id="dk-api-dto-create-metric-definition"
type CreateDashboardMetricDefinitionDto = {
  metricKey: string;
  name: string;
  description?: string;
  category: DashboardCategory;
  sourceModule: string;
  valueType: DashboardMetricValueType;
  aggregationType: DashboardAggregationType;
  sensitivity: DashboardSensitivity;
  supportsComparison: boolean;
  supportsTrend: boolean;
  supportsBreakdown: boolean;
  requiredPermission?: string;
  requiredSensitivePermission?: string;
  calculationStrategy: DashboardCalculationStrategy;
};
```

---

## 16.3. `CreateDashboardWidgetDefinitionDto`

```typescript id="dk-api-dto-create-widget-definition"
type CreateDashboardWidgetDefinitionDto = {
  widgetKey: string;
  dashboardDefinitionId: string;
  metricDefinitionId: string;
  name: string;
  description?: string;
  widgetType: DashboardWidgetType;
  sourceModule: string;
  sensitivity: DashboardSensitivity;
  requiredPermission?: string;
  requiredSensitivePermission?: string;
  defaultSize: DashboardWidgetSize;
  defaultOrder: number;
  defaultConfig?: Record<string, unknown>;
};
```

---

## 16.4. `ConfigureTenantDashboardDto`

```typescript id="dk-api-dto-configure-dashboard"
type ConfigureTenantDashboardDto = {
  isEnabled?: boolean;
  displayName?: string;
  defaultPeriod?: DashboardDefaultPeriod;
  refreshPolicy?: DashboardRefreshPolicy;
};
```

---

## 16.5. `ConfigureTenantDashboardWidgetDto`

```typescript id="dk-api-dto-configure-widget"
type ConfigureTenantDashboardWidgetDto = {
  isEnabled?: boolean;
  displayOrder?: number;
  size?: DashboardWidgetSize;
  thresholdConfig?: Record<string, unknown>;
  visibilityConfig?: Record<string, unknown>;
  customLabel?: string;
};
```

---

## 16.6. `GenerateDashboardSnapshotDto`

```typescript id="dk-api-dto-generate-snapshot"
type GenerateDashboardSnapshotDto = {
  periodFrom: string;
  periodTo: string;
  filters?: Record<string, unknown>;
  generationReason?: string;
};
```

---

## 16.7. `CreateDashboardExportDto`

```typescript id="dk-api-dto-create-export"
type CreateDashboardExportDto = {
  dashboardKey?: string;
  dashboardSnapshotId?: string;
  exportType: DashboardExportType;
  format: DashboardExportFormat;
  periodFrom?: string;
  periodTo?: string;
  filters?: Record<string, unknown>;
  includeSensitive?: boolean;
  reason?: string;
};
```

---

# 17. Campos prohibidos en DTOs externos

Todos los DTOs externos deben rechazar:

```text id="dk-api-forbidden-dto-fields"
tenantId
createdBy
updatedBy
generatedBy
requestedBy
archivedBy
actorUserProfileId
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
privateKey
clientSecret
webhookSecret
databaseUrl
paymentId para mutación
journalEntryId para mutación
bankTransactionId para mutación
reconciliationMatchId para mutación
gateOpenCommand
hardwareDeviceCommand
externalAiEnabled
externalAiRealDataAllowed
```

Respuesta esperada:

```http id="dk-api-forbidden-dto-response"
422 Unprocessable Entity
```

---

# 18. Campos prohibidos en responses

```text id="dk-api-forbidden-response-fields"
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
formulaCode
raw stack trace
datos cross-tenant
identificación completa no autorizada
placa completa no autorizada
payload sensible raw
authorization header
cookie
```

---

# 19. Enums API

## 19.1. DashboardCategory

```text id="dk-api-enum-category"
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

## 19.2. DashboardScope

```text id="dk-api-enum-scope"
platformDefault
tenantConfigurable
```

---

## 19.3. DashboardWidgetType

```text id="dk-api-enum-widget-type"
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

## 19.4. DashboardWidgetSize

```text id="dk-api-enum-widget-size"
small
medium
large
full
```

---

## 19.5. DashboardMetricValueType

```text id="dk-api-enum-value-type"
count
amount
percentage
duration
ratio
status
```

---

## 19.6. DashboardAggregationType

```text id="dk-api-enum-aggregation-type"
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

## 19.7. DashboardSensitivity

```text id="dk-api-enum-sensitivity"
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

## 19.8. DashboardCalculationStrategy

```text id="dk-api-enum-calculation-strategy"
sourcePort
derivedComposite
staticDefinition
```

---

## 19.9. DashboardDefaultPeriod

```text id="dk-api-enum-default-period"
today
currentWeek
currentMonth
currentQuarter
currentYear
custom
```

---

## 19.10. DashboardRefreshPolicy

```text id="dk-api-enum-refresh-policy"
noCache
shortTtl
standardTtl
longTtl
```

---

## 19.11. DashboardSnapshotStatus

```text id="dk-api-enum-snapshot-status"
generated
failed
archived
```

---

## 19.12. DashboardExportType, Format and Status

```text id="dk-api-enum-export"
DashboardExportType:
- dashboardCurrentView
- dashboardSnapshot
- financialKpiSummary
- operationsKpiSummary
- securityKpiSummary
- maintenanceKpiSummary
- fullDashboardSummary

DashboardExportFormat:
- json
- xlsx
- pdf

DashboardExportStatus:
- requested
- processing
- completed
- failed
- archived
```

---

## 19.13. DashboardDataAvailabilityStatus

```text id="dk-api-enum-data-availability"
available
partial
unavailable
```

---

# 20. Errores

## 20.1. Dashboard definitions

```text id="dk-api-errors-dashboard-definitions"
DASHBOARD_DEFINITION_NOT_FOUND
DASHBOARD_DEFINITION_DUPLICATE_KEY
DASHBOARD_DEFINITION_INVALID_KEY
DASHBOARD_DEFINITION_INVALID_STATUS
DASHBOARD_DEFINITION_ARCHIVED
DASHBOARD_DEFINITION_RAW_SQL_FORBIDDEN
DASHBOARD_DEFINITION_EXECUTABLE_PAYLOAD_FORBIDDEN
DASHBOARD_DEFINITION_SECRET_FORBIDDEN
```

---

## 20.2. Metric definitions

```text id="dk-api-errors-metric-definitions"
DASHBOARD_METRIC_DEFINITION_NOT_FOUND
DASHBOARD_METRIC_DEFINITION_DUPLICATE_KEY
DASHBOARD_METRIC_DEFINITION_INVALID_KEY
DASHBOARD_METRIC_DEFINITION_INVALID_SOURCE_MODULE
DASHBOARD_METRIC_DEFINITION_INVALID_CALCULATION_STRATEGY
DASHBOARD_METRIC_DEFINITION_RAW_SQL_FORBIDDEN
DASHBOARD_METRIC_DEFINITION_FORMULA_FORBIDDEN
DASHBOARD_METRIC_DEFINITION_ARCHIVED
DASHBOARD_METRIC_DEFINITION_SENSITIVE_PERMISSION_REQUIRED
```

---

## 20.3. Widget definitions

```text id="dk-api-errors-widget-definitions"
DASHBOARD_WIDGET_DEFINITION_NOT_FOUND
DASHBOARD_WIDGET_DEFINITION_DUPLICATE_KEY
DASHBOARD_WIDGET_DEFINITION_INVALID_KEY
DASHBOARD_WIDGET_DEFINITION_INVALID_DASHBOARD
DASHBOARD_WIDGET_DEFINITION_INVALID_METRIC
DASHBOARD_WIDGET_DEFINITION_INVALID_TYPE
DASHBOARD_WIDGET_DEFINITION_ARCHIVED
DASHBOARD_WIDGET_DEFINITION_RAW_SQL_FORBIDDEN
DASHBOARD_WIDGET_DEFINITION_FORMULA_FORBIDDEN
```

---

## 20.4. Tenant dashboards

```text id="dk-api-errors-tenant-dashboards"
DASHBOARD_NOT_FOUND
DASHBOARD_DISABLED
DASHBOARD_ARCHIVED
DASHBOARD_WIDGET_NOT_FOUND
DASHBOARD_WIDGET_DISABLED
DASHBOARD_METRIC_NOT_FOUND
DASHBOARD_METRIC_UNAVAILABLE
DASHBOARD_METRIC_PARTIAL
DASHBOARD_PERMISSION_REQUIRED
DASHBOARD_SENSITIVE_PERMISSION_REQUIRED
DASHBOARD_CROSS_TENANT_REFERENCE
```

---

## 20.5. Snapshots and exports

```text id="dk-api-errors-snapshots-exports"
DASHBOARD_SNAPSHOT_NOT_FOUND
DASHBOARD_SNAPSHOT_INVALID_PERIOD
DASHBOARD_SNAPSHOT_GENERATION_FAILED
DASHBOARD_SNAPSHOT_CROSS_TENANT_REFERENCE

DASHBOARD_EXPORT_NOT_FOUND
DASHBOARD_EXPORT_INVALID_TYPE
DASHBOARD_EXPORT_INVALID_FORMAT
DASHBOARD_EXPORT_REASON_REQUIRED
DASHBOARD_EXPORT_SENSITIVE_PERMISSION_REQUIRED
DASHBOARD_EXPORT_STORAGE_KEY_FORBIDDEN
DASHBOARD_EXPORT_FAILED
DASHBOARD_EXPORT_CROSS_TENANT_REFERENCE
```

---

## 20.6. Security and boundaries

```text id="dk-api-errors-security"
DASHBOARD_TENANT_ID_FORBIDDEN
DASHBOARD_ACTOR_FIELD_FORBIDDEN
DASHBOARD_STATUS_DIRECT_TRANSITION_FORBIDDEN
DASHBOARD_RAW_SQL_FORBIDDEN
DASHBOARD_SCRIPT_FORBIDDEN
DASHBOARD_EXECUTABLE_FORMULA_FORBIDDEN
DASHBOARD_STORAGE_KEY_FORBIDDEN
DASHBOARD_PUBLIC_ENDPOINT_FORBIDDEN
DASHBOARD_WORDPRESS_ACCESS_FORBIDDEN
DASHBOARD_PAYMENT_EXECUTION_FORBIDDEN
DASHBOARD_ACCOUNTING_EXECUTION_FORBIDDEN
DASHBOARD_BANK_RECONCILIATION_CONFIRMATION_FORBIDDEN
DASHBOARD_HARDWARE_CONTROL_FORBIDDEN
DASHBOARD_EXTERNAL_AI_FORBIDDEN
```

---

# 21. Códigos HTTP

| Caso                            |                                  Código |
| ------------------------------- | --------------------------------------: |
| Creación exitosa                |                           `201 Created` |
| Export encolado                 |                          `202 Accepted` |
| Lectura exitosa                 |                                `200 OK` |
| Actualización exitosa           |                                `200 OK` |
| Transición exitosa              |                                `200 OK` |
| Validación fallida              |                           `400` o `422` |
| No autenticado                  |                      `401 Unauthorized` |
| Sin permiso                     |                         `403 Forbidden` |
| Recurso no encontrado           |                         `404 Not Found` |
| Recurso cross-tenant            |                         `404 Not Found` |
| Estado inválido                 |                          `409 Conflict` |
| Fuente de métrica no disponible | `200 OK` con `availability=unavailable` |
| Fuente parcial                  |     `200 OK` con `availability=partial` |
| Rate limit                      |                 `429 Too Many Requests` |
| Error interno                   |             `500 Internal Server Error` |

---

# 22. Integración con Secure Document Storage

## 22.1. Uso permitido

```text id="dk-api-sds-use"
dashboard_exports.secureDocumentId
dashboardCurrentView
dashboardSnapshot
financialKpiSummary
operationsKpiSummary
securityKpiSummary
maintenanceKpiSummary
fullDashboardSummary
```

---

## 22.2. Prohibido

```text id="dk-api-sds-forbidden"
storageKey
signedUrl persistente
base64
rawFilePayload
binary payload en JSON
```

---

## 22.3. Reglas

```text id="dk-api-sds-rules"
- secureDocumentId pertenece al tenant.
- secureDocumentId se genera mediante módulo 016.
- Response no devuelve storageKey.
- Descarga se delega a Secure Document Storage.
- Export se audita.
```

---

# 23. Auditoría

Eventos mínimos:

```text id="dk-api-audit-events"
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

Metadata permitida:

```text id="dk-api-audit-allowed"
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

Metadata prohibida:

```text id="dk-api-audit-forbidden"
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

# 24. Observabilidad

## 24.1. Logs seguros

Eventos loggeables:

```text id="dk-api-logs"
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

Campos permitidos:

```text id="dk-api-log-fields-allowed"
traceId
requestId
correlationId
dashboardKey
widgetKey
metricKey
status
outcome
durationMs
errorCode
sourceModule
```

Campos prohibidos:

```text id="dk-api-log-fields-forbidden"
tenantId como label de alta cardinalidad
userId como label de alta cardinalidad
personId
propertyUnitId
identificationNumber
vehiclePlate
storageKey
secret
token
raw payload
authorization header
cookie
```

---

## 24.2. Métricas

```text id="dk-api-metrics"
dashboard_requests_total
dashboard_render_duration_ms
dashboard_widget_calculation_duration_ms
dashboard_widget_failures_total
dashboard_snapshots_generated_total
dashboard_exports_total
dashboard_cache_hits_total
dashboard_cache_misses_total
```

Labels permitidos:

```text id="dk-api-metric-labels-allowed"
dashboardKey
widgetType
metricKey
sourceModule
status
outcome
errorCode
```

Labels prohibidos:

```text id="dk-api-metric-labels-forbidden"
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

# 25. Rate limiting

Aplicar rate limit reforzado en:

```text id="dk-api-rate-limited"
POST  /api/v1/platform/dashboard-definitions
POST  /api/v1/platform/dashboard-widget-definitions
POST  /api/v1/platform/dashboard-metric-definitions
PATCH /api/v1/tenant/dashboards/{dashboardKey}/configuration
PATCH /api/v1/tenant/dashboards/{dashboardKey}/widgets/{widgetKey}/configuration
POST  /api/v1/tenant/dashboards/{dashboardKey}/snapshots
POST  /api/v1/tenant/dashboard-exports
```

Objetivo:

```text id="dk-api-rate-limit-objectives"
- evitar cambios masivos de configuración;
- proteger cálculos costosos;
- proteger exportaciones;
- evitar abuso de snapshots;
- proteger catálogo platform;
- evitar extracción masiva de información.
```

---

# 26. Headers de seguridad

Todas las respuestas privadas deben incluir:

```http id="dk-api-security-headers"
Cache-Control: no-store
Pragma: no-cache
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
```

Recomendados:

```http id="dk-api-security-headers-recommended"
Content-Security-Policy: default-src 'none'
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

CORS:

```text id="dk-api-cors"
- no wildcard;
- no WordPress público;
- solo frontends autenticados permitidos;
- orígenes explícitos por ambiente;
- credentials solo si están justificados.
```

---

# 27. OpenAPI

## 27.1. Tags

```text id="dk-api-openapi-tags"
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

## 27.2. Extensiones globales

```yaml id="dk-api-openapi-global"
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

## 27.3. Rutas platform

```yaml id="dk-api-openapi-platform"
x-platform-scope: true
x-platform-admin-required: true
```

---

## 27.4. Rutas tenant

```yaml id="dk-api-openapi-tenant"
x-tenant-scope: true
x-permission-required: true
```

---

## 27.5. Rutas de KPI

```yaml id="dk-api-openapi-kpi"
x-derived-data: true
x-read-only: true
x-source-module-permissions-required: true
```

---

## 27.6. Rutas de exportación

```yaml id="dk-api-openapi-export"
x-secure-document-storage: true
x-storage-key-exposed: false
```

---

## 27.7. OpenAPI no debe documentar

```text id="dk-api-openapi-forbidden"
tenantId en DTOs externos
actor fields en DTOs externos
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
signedUrl persistente
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
/api/v1/public/dashboards
/api/v1/public/dashboard-kpis
/api/v1/public/tenants/{slug}/dashboards
/api/v1/public/tenants/{slug}/dashboard-kpis
```

---

# 28. Endpoints públicos prohibidos

No implementar:

```text id="dk-api-forbidden-public-endpoints"
GET  /api/v1/public/dashboards
GET  /api/v1/public/dashboard-kpis
GET  /api/v1/public/dashboard-widgets
GET  /api/v1/public/tenants/{slug}/dashboards
GET  /api/v1/public/tenants/{slug}/dashboard-kpis
GET  /api/v1/public/tenants/{slug}/dashboard-widgets
POST /api/v1/public/tenants/{slug}/dashboard-exports
```

Respuesta esperada:

```http id="dk-api-forbidden-public-response"
404 Not Found
```

---

# 29. Casos de borde

## 29.1. Dashboard inexistente

Respuesta:

```http id="dk-api-edge-dashboard-not-found-http"
404 Not Found
```

Error:

```json id="dk-api-edge-dashboard-not-found"
{
  "error": {
    "code": "DASHBOARD_NOT_FOUND",
    "message": "Dashboard not found.",
    "details": {},
    "traceId": "trace-id"
  }
}
```

---

## 29.2. Dashboard deshabilitado

Respuesta:

```http id="dk-api-edge-dashboard-disabled-http"
409 Conflict
```

Error:

```json id="dk-api-edge-dashboard-disabled"
{
  "error": {
    "code": "DASHBOARD_DISABLED",
    "message": "Dashboard is disabled for this tenant.",
    "details": {
      "dashboardKey": "financial"
    },
    "traceId": "trace-id"
  }
}
```

---

## 29.3. Métrica sensible sin permiso

Respuesta:

```http id="dk-api-edge-sensitive-permission-http"
403 Forbidden
```

Error:

```json id="dk-api-edge-sensitive-permission"
{
  "error": {
    "code": "DASHBOARD_SENSITIVE_PERMISSION_REQUIRED",
    "message": "Sensitive dashboard metric permission is required.",
    "details": {
      "metricKey": "financial.outstandingBalance"
    },
    "traceId": "trace-id"
  }
}
```

---

## 29.4. Fuente de métrica caída

Respuesta:

```http id="dk-api-edge-source-unavailable-http"
200 OK
```

Payload:

```json id="dk-api-edge-source-unavailable"
{
  "data": [
    {
      "metricKey": "maintenance.overdueWorkOrdersCount",
      "valueType": "count",
      "value": null,
      "availability": "unavailable",
      "errorCode": "SOURCE_MODULE_UNAVAILABLE",
      "sourceModules": ["022-maintenance-work-orders"]
    }
  ],
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 29.5. Payload con rawSql

Respuesta:

```http id="dk-api-edge-rawsql-http"
422 Unprocessable Entity
```

Error:

```json id="dk-api-edge-rawsql"
{
  "error": {
    "code": "DASHBOARD_RAW_SQL_FORBIDDEN",
    "message": "Raw SQL is not allowed in dashboard configuration.",
    "details": {
      "field": "rawSql"
    },
    "traceId": "trace-id"
  }
}
```

---

## 29.6. Export con storageKey

Respuesta:

```http id="dk-api-edge-storagekey-http"
422 Unprocessable Entity
```

Error:

```json id="dk-api-edge-storagekey"
{
  "error": {
    "code": "DASHBOARD_STORAGE_KEY_FORBIDDEN",
    "message": "storageKey is not allowed.",
    "details": {
      "field": "storageKey"
    },
    "traceId": "trace-id"
  }
}
```

---

# 30. Validaciones críticas por endpoint

## 30.1. Create metric definition

```text id="dk-api-validate-create-metric-definition"
[ ] AuthGuard.
[ ] PlatformPermissionGuard.
[ ] SensitivePermissionGuard si sensibilidad alta.
[ ] Validar metricKey.
[ ] Validar sourceModule.
[ ] Validar valueType.
[ ] Validar aggregationType.
[ ] Validar calculationStrategy.
[ ] Rechazar rawSql.
[ ] Rechazar formulaCode.
[ ] Rechazar script.
[ ] Rechazar executableCode.
[ ] Rechazar storageKey.
[ ] Resolver createdBy server-side.
[ ] Auditar dashboardMetricDefinition.created.
```

---

## 30.2. Configure widget

```text id="dk-api-validate-configure-widget"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard tenantDashboardWidgets.configure.
[ ] Validar dashboardKey.
[ ] Validar widgetKey.
[ ] Validar tenant-scoped dashboard configuration.
[ ] Validar thresholdConfig declarativo.
[ ] Validar visibilityConfig restrictivo.
[ ] Rechazar tenantId.
[ ] Rechazar actor fields.
[ ] Rechazar rawSql.
[ ] Rechazar script.
[ ] Rechazar formulaCode.
[ ] Rechazar storageKey.
[ ] Auditar tenantDashboardWidgetConfiguration.updated.
```

---

## 30.3. Get dashboard

```text id="dk-api-validate-get-dashboard"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard tenantDashboards.read.
[ ] Validar dashboardKey.
[ ] Validar configuración tenant.
[ ] Resolver widgets visibles.
[ ] Validar permisos por widget.
[ ] Validar permisos por métrica.
[ ] Aplicar periodo.
[ ] Aplicar filtros sanitizados.
[ ] Calcular KPIs por puertos.
[ ] Marcar partial/unavailable si aplica.
[ ] No modificar datos.
[ ] No exponer storageKey.
```

---

## 30.4. Generate snapshot

```text id="dk-api-validate-generate-snapshot"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard tenantDashboards.snapshot.
[ ] Validar dashboardKey.
[ ] Validar periodFrom/periodTo.
[ ] Sanitizar filters.
[ ] Calcular dashboard.
[ ] Sanitizar snapshotData.
[ ] Crear DashboardSnapshot.
[ ] Resolver generatedBy server-side.
[ ] Auditar dashboardSnapshot.generated.
```

---

## 30.5. Create export

```text id="dk-api-validate-create-export"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard tenantDashboards.export.
[ ] SensitivePermissionGuard si includeSensitive=true.
[ ] Validar exportType.
[ ] Validar format.
[ ] Validar dashboardKey o snapshotId.
[ ] Validar snapshot tenant-scoped si aplica.
[ ] Requerir reason si fullDashboardSummary/securityKpiSummary/audit.
[ ] Sanitizar filters.
[ ] Calcular o leer snapshot.
[ ] Sanitizar contenido exportado.
[ ] Crear DashboardExport.
[ ] Crear SecureDocument.
[ ] Guardar secureDocumentId.
[ ] No devolver storageKey.
[ ] Auditar dashboardExport.requested/completed/failed.
```

---

# 31. Criterios de aceptación API

```text id="dk-api-acceptance"
[ ] Platform Dashboard Definitions API requiere autenticación.
[ ] Platform Dashboard Widget Definitions API requiere autenticación.
[ ] Platform Dashboard Metric Definitions API requiere autenticación.
[ ] Platform API requiere PlatformPermissionGuard.
[ ] Tenant API requiere AuthGuard.
[ ] Tenant API requiere TenantGuard.
[ ] Tenant API requiere PermissionGuard.
[ ] Widgets sensibles requieren SensitivePermissionGuard o permiso reforzado.
[ ] Métricas sensibles requieren permiso de categoría.
[ ] Métricas altamente sensibles requieren permiso reforzado.
[ ] List dashboards funciona tenant-scoped.
[ ] Get dashboard calcula widgets visibles.
[ ] Get KPIs calcula métricas por periodo.
[ ] Dashboard financiero requiere permiso financiero.
[ ] Dashboard de seguridad requiere permiso de seguridad.
[ ] Dashboard de auditoría requiere permiso de auditoría.
[ ] Configure dashboard funciona tenant-scoped.
[ ] Configure widget funciona tenant-scoped.
[ ] Snapshot se genera con datos sanitizados.
[ ] Export usa Secure Document Storage.
[ ] Response no devuelve storageKey.
[ ] DTOs rechazan tenantId.
[ ] DTOs rechazan actor fields.
[ ] DTOs rechazan rawSql.
[ ] DTOs rechazan scripts.
[ ] DTOs rechazan formulaCode.
[ ] DTOs rechazan executableCode.
[ ] DTOs rechazan storageKey.
[ ] No existen endpoints públicos.
[ ] No existe acceso WordPress público.
[ ] API no modifica datos transaccionales.
[ ] API no ejecuta pagos.
[ ] API no crea JournalEntry.
[ ] API no confirma Bank Reconciliation.
[ ] API no controla hardware.
[ ] API no envía datos reales a IA externa.
[ ] Audit se emite en operaciones críticas.
[ ] OpenAPI no documenta campos prohibidos.
```

---

# 32. No aceptación

No se acepta el contrato si:

```text id="dk-api-no-acceptance"
- define endpoints públicos de dashboards;
- permite acceso desde WordPress público;
- permite tenantId en body;
- permite actor fields en body;
- permite rawSql;
- permite SQL personalizado por usuario;
- permite script;
- permite JavaScript configurable;
- permite formulaCode ejecutable;
- permite executableCode;
- permite eval;
- permite Function;
- permite dashboard cross-tenant;
- permite widget cross-tenant;
- permite snapshot cross-tenant;
- permite export cross-tenant;
- permite métrica fuera de catálogo;
- permite widget fuera de catálogo;
- expone storageKey;
- devuelve signedUrl persistente;
- muestra datos financieros sensibles sin permiso;
- muestra datos de seguridad sensibles sin permiso;
- muestra datos de auditoría sensibles sin permiso;
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
- oculta falla de fuente mostrando cero silenciosamente;
- omite auditoría de snapshot o export;
- logs contienen payload sensible.
```

---

# 33. Resultado esperado

Al implementar este contrato, `027-dashboard-kpis` tendrá una API REST privada, segura, tenant-scoped, role-aware, read-heavy y preparada para consultar KPIs derivados sin comprometer la integridad transaccional del Core.

Resultado esperado:

```text id="dk-api-expected-result"
Platform Dashboard Definitions API definida
Platform Dashboard Metric Definitions API definida
Platform Dashboard Widget Definitions API definida
Tenant Dashboards API definida
Tenant Dashboard Widgets API definida
Tenant Dashboard KPIs API definida
Tenant Dashboard Configuration API definida
Tenant Dashboard Snapshots API definida
Tenant Dashboard Exports API definida
Internal calculation ports definidos
permissions definidos
sensitive permissions definidos
DTOs definidos
forbidden fields definidos
errors definidos
OpenAPI extensions definidas
tenant isolation definido
role-aware visibility definida
metric catalog allowlist definido
widget catalog allowlist definido
dashboard catalog allowlist definido
period filters definidos
comparison definido
availability partial/unavailable definida
SDS export definido
audit definido
observability definida
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

# 34. Expediente actualizado

```text id="dk-api-expediente"
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
│   │       ├── data-model.md
│   │       └── api-contract.md
```
