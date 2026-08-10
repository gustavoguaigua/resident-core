# Security Notes — 027 Dashboard and KPIs

## 1. Información del documento

| Campo      | Valor                                                               |
| ---------- | ------------------------------------------------------------------- |
| Proyecto   | RESIDENT Core                                                       |
| Spec ID    | 027                                                                 |
| Módulo     | Dashboard and KPIs                                                  |
| Documento  | Security Notes                                                      |
| Ruta       | `docs/specs/027-dashboard-kpis/security-notes.md`                   |
| Versión    | 0.1                                                                 |
| Estado     | needs-review                                                        |
| Fecha      | 2026-08-02                                                          |
| Naturaleza | Tenant-scoped / Read-heavy / Derived-data / Role-aware / Non-public |

---

## 2. Propósito

Definir los controles de seguridad del módulo `027-dashboard-kpis`.

Este módulo presenta información agregada y derivada de otros módulos del Core. Por tanto, debe proteger el aislamiento multitenant, la privacidad, la autorización por rol, la integridad de los datos fuente y la no exposición de información sensible.

Regla central:

```text id="dk-sec-rule"
Dashboard and KPIs debe ser un módulo privado, autenticado, tenant-scoped, read-only y derivado; no debe exponer datos cross-tenant, no debe aceptar SQL arbitrario, no debe ejecutar scripts, no debe permitir fórmulas ejecutables, no debe exponer storageKey, no debe operar desde WordPress público, no debe modificar datos transaccionales, no debe ejecutar pagos, no debe crear asientos contables, no debe confirmar conciliaciones, no debe controlar hardware y no debe enviar datos reales a IA externa.
```

---

## 3. Clasificación de seguridad

```text id="dk-sec-classification"
Security-sensitive
Privacy-sensitive
Financial-data-sensitive
Read-heavy
Derived-data
Tenant-scoped
Role-aware
Non-public
No public dashboard
No WordPress access
No raw SQL
No executable formula
No storageKey exposure
No transactional side effects
```

Componentes sensibles:

```text id="dk-sec-sensitive-components"
- Dashboard financiero.
- Dashboard de accesos y visitantes.
- Dashboard de auditoría.
- Dashboard de comunicaciones.
- Dashboard de automatizaciones.
- Snapshots.
- Exportaciones.
- Configuración de visibilidad por rol.
- Cache de widgets.
- KPIs por unidad o persona.
```

---

## 4. Principios de seguridad

```text id="dk-sec-principles"
1. Keycloak autentica; RESIDENT Core autoriza.
2. Todo dashboard tenant-scoped requiere TenantGuard.
3. Todo widget sensible requiere permiso explícito.
4. Todo KPI se deriva de módulos fuente autorizados.
5. El dashboard no es fuente de verdad.
6. El dashboard no modifica datos transaccionales.
7. El dashboard no ejecuta acciones operativas.
8. Se priorizan métricas agregadas sobre detalle personal.
9. Los datos financieros detallados requieren permiso reforzado.
10. Los datos de seguridad/acceso requieren permiso reforzado.
11. Los datos de auditoría requieren permiso reforzado.
12. El cache debe incluir tenantId y permissionHash.
13. Los snapshots deben estar sanitizados.
14. Las exportaciones deben usar Secure Document Storage.
15. No se debe devolver storageKey.
16. No existen endpoints públicos.
17. WordPress público no accede.
18. No se permite SQL de usuario.
19. No se permiten scripts.
20. No se permiten fórmulas ejecutables.
21. No se permite IA externa con datos reales.
```

---

## 5. Modelo de amenazas

| Amenaza                                 |  Riesgo | Control                                            |
| --------------------------------------- | ------: | -------------------------------------------------- |
| Dashboard cross-tenant                  | Crítico | TenantGuard, tenant_id, repositorios tenant-scoped |
| Widget visible sin permiso              |    Alto | PermissionGuard + SensitivePermissionGuard         |
| Métrica financiera expuesta             |    Alto | permisos financieros reforzados                    |
| Métrica de accesos expuesta             |    Alto | masking + permisos de seguridad                    |
| Identificación o placa completa visible |    Alto | minimización + response sanitizer                  |
| SQL arbitrario en métrica               | Crítico | metric catalog allowlist                           |
| Fórmula ejecutable                      | Crítico | NoExecutableFormulaPolicy                          |
| Cache compartido entre permisos         |    Alto | permissionHash en cache key                        |
| Export con storageKey                   | Crítico | SDS boundary + sanitizer                           |
| Snapshot con datos sensibles raw        |    Alto | snapshot sanitizer                                 |
| WordPress accediendo dashboard privado  |    Alto | no public API + CORS restrictivo                   |
| Dashboard ejecutando acciones           | Crítico | ReadOnlyPolicy + no side effects tests             |
| Datos reales enviados a IA externa      |    Alto | feature flag false + DTO denylist                  |

---

## 6. Superficies de ataque

### 6.1. Platform API

```text id="dk-sec-platform-api"
/api/v1/platform/dashboard-definitions
/api/v1/platform/dashboard-widget-definitions
/api/v1/platform/dashboard-metric-definitions
```

Riesgos:

```text id="dk-sec-platform-risks"
- Crear metric definition insegura.
- Crear widget con fuente no autorizada.
- Agregar rawSql en configuración.
- Agregar formulaCode ejecutable.
- Configurar widget sensible sin permiso mínimo.
```

Controles:

```text id="dk-sec-platform-controls"
- AuthGuard.
- PlatformPermissionGuard.
- dashboardDefinitions.manageSensitive.
- DTO whitelist.
- ForbiddenKeysValidator.
- Metric catalog allowlist.
- NoRawSqlDashboardPolicy.
- NoExecutableFormulaPolicy.
- Audit obligatorio.
```

---

### 6.2. Tenant API

```text id="dk-sec-tenant-api"
/api/v1/tenant/dashboards
/api/v1/tenant/dashboard-snapshots
/api/v1/tenant/dashboard-exports
```

Riesgos:

```text id="dk-sec-tenant-risks"
- Consultar dashboard de otro tenant.
- Ver widgets sensibles sin permiso.
- Exportar datos financieros o de seguridad.
- Configurar widgets para ampliar permisos.
- Generar snapshot con datos sensibles raw.
```

Controles:

```text id="dk-sec-tenant-controls"
- AuthGuard.
- TenantGuard.
- PermissionGuard.
- SensitivePermissionGuard.
- Resource tenant guard.
- Response sanitizer.
- Snapshot sanitizer.
- Export sanitizer.
- Audit obligatorio.
```

---

### 6.3. Cache Redis

Riesgos:

```text id="dk-sec-cache-risks"
- Cache mezclado entre tenants.
- Cache compartido entre usuarios con permisos distintos.
- Cache de datos sensibles sin TTL adecuado.
```

Controles:

```text id="dk-sec-cache-controls"
- Cache key con tenantId.
- Cache key con permissionHash.
- Cache key con filterHash.
- TTL corto para widgets sensibles.
- Cache deshabilitable por widget.
- No cachear storageKey.
```

Cache key obligatoria:

```text id="dk-sec-cache-key"
tenant:{tenantId}:dashboard:{dashboardKey}:widget:{widgetKey}:period:{periodFrom}:{periodTo}:perm:{permissionHash}:filters:{filterHash}
```

---

## 7. Autenticación y autorización

### 7.1. Autenticación

Todos los endpoints privados requieren:

```http id="dk-sec-auth-header"
Authorization: Bearer <access_token>
```

Prohibido:

```text id="dk-sec-auth-forbidden"
- acceso anónimo;
- token por query string;
- sesión WordPress como autenticación Core;
- API pública para dashboard;
- uso de tenantId enviado por cliente como autoridad.
```

---

### 7.2. Permisos principales

```text id="dk-sec-permissions"
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

```text id="dk-sec-sensitive-permissions"
tenantDashboards.exportSensitive
tenantDashboardMetrics.readPersonalData
tenantDashboardMetrics.readFinancialDetail
tenantDashboardMetrics.readSecurityDetail
tenantDashboardMetrics.readAuditDetail
dashboardDefinitions.manageSensitive
```

Regla:

```text id="dk-sec-permission-rule"
Un permiso de dashboard nunca reemplaza los permisos del módulo fuente. Si el KPI resume datos financieros, de seguridad, personales o de auditoría, el usuario debe tener permisos compatibles.
```

---

## 8. Tenant isolation

Regla:

```text id="dk-sec-tenant-rule"
Toda configuración, snapshot, exportación, consulta KPI y cache debe resolverse con tenantId del contexto autenticado.
```

Patrón seguro:

```typescript id="dk-sec-tenant-safe-query"
await prisma.dashboardSnapshot.findFirst({
  where: {
    id: snapshotId,
    tenantId: currentTenant.id
  }
});
```

Patrón prohibido:

```typescript id="dk-sec-tenant-forbidden-query"
await prisma.dashboardSnapshot.findUnique({
  where: { id: snapshotId }
});
```

Respuesta cross-tenant:

```http id="dk-sec-cross-tenant-response"
404 Not Found
```

---

## 9. Campos prohibidos

### 9.1. Prohibidos en DTOs externos

```text id="dk-sec-forbidden-dto-fields"
tenantId
createdBy
updatedBy
generatedBy
requestedBy
archivedBy
status directo fuera de transición
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

Respuesta:

```http id="dk-sec-forbidden-response"
422 Unprocessable Entity
```

---

### 9.2. Prohibidos en responses

```text id="dk-sec-forbidden-response-fields"
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
raw stack trace
datos cross-tenant
identificación completa no autorizada
placa completa no autorizada
payload sensible raw
authorization header
cookie
```

---

### 9.3. Prohibidos en logs y audit

```text id="dk-sec-forbidden-logs-audit"
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

## 10. No SQL arbitrario ni fórmulas ejecutables

Prohibido:

```text id="dk-sec-no-exec"
rawSql
sql
script
javascript
formulaCode
functionBody
executableCode
eval
Function
templateExpressionUnsafe
dynamicExpressionUnsafe
databaseLookupFromWidget
```

Permitido:

```text id="dk-sec-allowed-config"
- metricKey catalogado;
- widgetKey catalogado;
- thresholdConfig declarativo;
- visibilityConfig restrictivo;
- filtros de periodo;
- filtros por estado permitidos;
- comparación contra periodo anterior;
- breakdowns controlados;
- calculationStrategy sourcePort / derivedComposite / staticDefinition.
```

Regla:

```text id="dk-sec-no-sql-rule"
Las métricas se calculan mediante servicios internos y puertos controlados. Ningún usuario define SQL, scripts ni fórmulas ejecutables.
```

---

## 11. Seguridad de widgets y métricas

### 11.1. Widget visibility

```text id="dk-sec-widget-visibility"
- Widget financiero requiere permiso financiero.
- Widget de seguridad requiere permiso de seguridad.
- Widget de auditoría requiere permiso de auditoría.
- Widget con datos personales requiere permiso reforzado.
- visibilityConfig puede restringir, pero nunca ampliar permisos.
```

---

### 11.2. Metric source control

```text id="dk-sec-metric-source"
- metricKey debe existir en catálogo.
- sourceModule debe estar permitido.
- calculationStrategy debe ser controlada.
- La métrica debe consultar módulos fuente por puertos.
- No se permiten joins arbitrarios hacia tablas externas.
- No se permiten mutaciones.
```

---

## 12. Privacidad y minimización

Reglas:

```text id="dk-sec-privacy-rules"
- Preferir agregados sobre detalle.
- No exponer identificación completa sin permiso.
- No exponer placa completa sin permiso.
- No exponer datos personales masivos en widgets.
- No exponer patrones de acceso de personas sin permiso reforzado.
- No incluir payload raw en snapshots.
- No incluir payload raw en exports.
- No incluir datos sensibles en logs.
```

Masking mínimo recomendado:

```text id="dk-sec-masking"
identificationNumber: ******1234
vehiclePlate: ABC-***
email: g***@domain.com
phone: ******789
```

---

## 13. Seguridad de snapshots

Reglas:

```text id="dk-sec-snapshot-rules"
- Snapshot pertenece a tenant.
- Snapshot requiere tenantDashboards.snapshot.
- Snapshot usa snapshotCode generado server-side.
- Snapshot almacena snapshotDataSanitized.
- Snapshot no reemplaza fuente transaccional.
- Snapshot no contiene storageKey.
- Snapshot no contiene raw payload sensible.
- Snapshot no contiene datos cross-tenant.
- Snapshot se audita.
```

Prohibido:

```text id="dk-sec-snapshot-forbidden"
- storageKey;
- signedUrl persistente;
- secretos;
- rawSql;
- scripts;
- formulaCode;
- identificación completa no autorizada;
- placa completa no autorizada;
- payload transaccional raw.
```

---

## 14. Seguridad de exportaciones

Reglas:

```text id="dk-sec-export-rules"
- Export requiere tenantDashboards.export.
- Export sensible requiere tenantDashboards.exportSensitive.
- Export financiero detallado requiere tenantDashboardMetrics.readFinancialDetail.
- Export de seguridad requiere tenantDashboardMetrics.readSecurityDetail.
- Export de auditoría requiere tenantDashboardMetrics.readAuditDetail.
- Export usa Secure Document Storage.
- Export retorna secureDocumentId.
- Export no retorna storageKey.
- Export no retorna signedUrl persistente.
- Export se audita.
```

Export types:

```text id="dk-sec-export-types"
dashboardCurrentView
dashboardSnapshot
financialKpiSummary
operationsKpiSummary
securityKpiSummary
maintenanceKpiSummary
fullDashboardSummary
```

---

## 15. No public endpoints

No implementar:

```text id="dk-sec-no-public"
GET /api/v1/public/dashboards
GET /api/v1/public/dashboard-kpis
GET /api/v1/public/tenants/{slug}/dashboards
GET /api/v1/public/tenants/{slug}/dashboard-kpis
GET /api/v1/public/dashboard-snapshots
GET /api/v1/public/dashboard-exports
```

Respuesta esperada:

```http id="dk-sec-no-public-response"
404 Not Found
```

---

## 16. No WordPress access

WordPress es portal informativo y no debe consumir dashboards privados del Core.

Prohibido para WordPress público:

```text id="dk-sec-wordpress-forbidden"
- consultar dashboards administrativos;
- consultar KPIs privados;
- consultar snapshots;
- consultar exports;
- mostrar widgets financieros;
- mostrar widgets de accesos;
- mostrar widgets de auditoría;
- usar sesión WordPress como auth Core;
- almacenar tokens Core en WordPress público.
```

Controles:

```text id="dk-sec-wordpress-controls"
- No public endpoints.
- CORS restrictivo.
- No wildcard.
- No cookies WordPress como auth Core.
- No shortcodes públicos para dashboards Core.
```

---

## 17. No efectos transaccionales

El módulo es read-only.

Prohibido desde dashboards:

```text id="dk-sec-no-side-effects"
- crear Payment;
- validar Payment;
- reversar Payment;
- crear Charge;
- crear JournalEntry;
- confirmar Bank Reconciliation;
- crear SupplierPaymentOrder;
- modificar InventoryMovement;
- modificar AccessEvent;
- crear AccessCheckIn;
- crear AccessCheckOut;
- abrir portones;
- controlar hardware;
- ejecutar automatizaciones;
- enviar datos reales a IA externa.
```

Regla:

```text id="dk-sec-readonly-rule"
Consultar un dashboard, calcular un KPI, generar un snapshot o exportar un dashboard no debe cambiar el estado transaccional de ningún módulo fuente.
```

---

## 18. Seguridad de IA externa

Prohibido enviar a IA externa:

```text id="dk-sec-ai-forbidden"
- KPIs reales del tenant;
- dashboards reales;
- snapshots reales;
- exports reales;
- datos financieros;
- datos de mora;
- datos de residentes;
- datos de accesos;
- datos de auditoría;
- identificaciones;
- placas;
- patrones de visitas;
- payloads operativos.
```

Permitido:

```text id="dk-sec-ai-allowed"
- documentación técnica;
- ejemplos ficticios;
- fixtures sintéticos;
- análisis local sin envío externo;
- datos completamente anonimizados con ADR futuro.
```

---

## 19. Rate limiting

Aplicar rate limit reforzado en:

```text id="dk-sec-rate-limit-routes"
POST  /api/v1/platform/dashboard-definitions
POST  /api/v1/platform/dashboard-metric-definitions
POST  /api/v1/platform/dashboard-widget-definitions
PATCH /api/v1/tenant/dashboards/{dashboardKey}/configuration
PATCH /api/v1/tenant/dashboards/{dashboardKey}/widgets/{widgetKey}/configuration
POST  /api/v1/tenant/dashboards/{dashboardKey}/snapshots
POST  /api/v1/tenant/dashboard-exports
```

Objetivos:

```text id="dk-sec-rate-limit-objectives"
- evitar abuso de exports;
- evitar generación masiva de snapshots;
- proteger fuentes de métricas;
- proteger cache;
- evitar configuración masiva accidental.
```

---

## 20. Auditoría

Eventos mínimos:

```text id="dk-sec-audit-events"
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

Metadata permitida:

```text id="dk-sec-audit-allowed"
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

```text id="dk-sec-audit-forbidden"
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

## 21. Observabilidad segura

Eventos loggeables:

```text id="dk-sec-logs"
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

```text id="dk-sec-log-fields-allowed"
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

```text id="dk-sec-log-fields-forbidden"
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

Métricas esperadas:

```text id="dk-sec-metrics"
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

## 22. CORS y headers

CORS:

```text id="dk-sec-cors"
- No wildcard.
- No permitir WordPress público en rutas dashboard privadas.
- Permitir solo frontends autenticados.
- Orígenes explícitos por ambiente.
```

Headers privados:

```http id="dk-sec-headers"
Cache-Control: no-store
Pragma: no-cache
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
```

---

## 23. Feature flags de seguridad

```text id="dk-sec-flags"
DASHBOARD_KPIS_ENABLED=true
DASHBOARD_KPIS_CACHE_ENABLED=true
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
```

Regla:

```text id="dk-sec-flags-rule"
El boot debe fallar si se habilitan endpoints públicos, acceso WordPress, raw SQL, fórmulas ejecutables, IA externa con datos reales, pagos, contabilidad, conciliación bancaria o control de hardware.
```

---

## 24. OpenAPI seguro

Extensiones requeridas:

```yaml id="dk-sec-openapi"
x-auth-required: true
x-tenant-scope: true
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

OpenAPI no debe documentar:

```text id="dk-sec-openapi-forbidden"
tenantId en DTOs externos
rawSql
script
formulaCode
storageKey
signedUrl persistente
secret
token
/api/v1/public/dashboards
/api/v1/public/dashboard-kpis
```

---

## 25. CI security gates

El pipeline debe fallar si:

```text id="dk-sec-ci-gates"
[ ] Algún DTO acepta tenantId.
[ ] Algún DTO acepta rawSql.
[ ] Algún DTO acepta script.
[ ] Algún DTO acepta formulaCode.
[ ] Algún DTO acepta storageKey.
[ ] Algún response devuelve storageKey.
[ ] Algún dashboard retorna datos cross-tenant.
[ ] Cache mezcla tenants.
[ ] Cache mezcla permisos.
[ ] OpenAPI documenta rutas públicas.
[ ] WordPress público accede.
[ ] Dashboard ejecuta Payment.
[ ] Dashboard crea JournalEntry.
[ ] Dashboard confirma Bank Reconciliation.
[ ] Dashboard controla hardware.
[ ] Dashboard envía datos reales a IA externa.
[ ] Logs contienen payload sensible.
[ ] Audit contiene storageKey.
[ ] Export no usa SDS.
```

---

## 26. Checklist de revisión de seguridad

```text id="dk-sec-review-checklist"
[ ] Todas las rutas requieren AuthGuard.
[ ] Rutas tenant requieren TenantGuard.
[ ] Rutas tenant requieren PermissionGuard.
[ ] Rutas sensibles requieren SensitivePermissionGuard.
[ ] Rutas platform requieren PlatformPermissionGuard.
[ ] Cross-tenant responde 404.
[ ] DTOs usan whitelist.
[ ] DTOs usan forbidNonWhitelisted.
[ ] No se acepta tenantId desde cliente.
[ ] No se acepta rawSql.
[ ] No se acepta script.
[ ] No se acepta formulaCode.
[ ] No se acepta storageKey.
[ ] No se exponen datos sensibles sin permiso.
[ ] Widgets se filtran por permisos.
[ ] Métricas se filtran por permisos.
[ ] Cache incluye tenantId.
[ ] Cache incluye permissionHash.
[ ] Snapshot está sanitizado.
[ ] Export usa SDS.
[ ] No se devuelve storageKey.
[ ] No existen endpoints públicos.
[ ] WordPress público no accede.
[ ] No hay efectos transaccionales.
[ ] No hay IA externa con datos reales.
[ ] OpenAPI no documenta campos prohibidos.
[ ] CI security gates pasan.
```

---

## 27. Riesgos residuales

| Riesgo residual                              |      Nivel | Mitigación                          |
| -------------------------------------------- | ---------: | ----------------------------------- |
| Widget sensible mal clasificado              |       Alto | revisión platform + manageSensitive |
| Cache con permisos incorrectos               |       Alto | permissionHash + tests              |
| Métrica agregada revela patrón sensible      | Medio/Alto | minimización + thresholds           |
| Export legítimo compartido fuera del sistema |      Medio | SDS + audit + permisos              |
| Fuente caída interpretada como cero          |      Medio | partial/unavailable                 |
| PlatformAdmin define métrica insegura        |       Alto | allowlist + CI + review             |
| Dashboard lento por agregaciones             |      Medio | cache + timeout por widget          |
| Cambios en módulos fuente rompen cálculos    |      Medio | contract tests por puerto           |

---

## 28. Recomendaciones futuras

Requieren ADR, threat model y pruebas de seguridad:

```text id="dk-sec-future"
- dashboards públicos limitados;
- embedding seguro en portal autenticado;
- data warehouse;
- read models materializados;
- alertas automáticas basadas en KPIs;
- predicción de mora;
- IA local o privada para análisis;
- IA externa solo con anonimización irreversible;
- constructor visual avanzado;
- métricas personalizadas declarativas;
- exports programados;
- integración BI externa.
```

---

## 29. Criterios de aceptación de seguridad

```text id="dk-sec-acceptance"
[ ] Todas las rutas requieren autenticación.
[ ] Rutas tenant son tenant-scoped.
[ ] Rutas sensibles requieren permisos reforzados.
[ ] Cross-tenant responde 404.
[ ] DTOs rechazan tenantId.
[ ] DTOs rechazan rawSql.
[ ] DTOs rechazan script.
[ ] DTOs rechazan formulaCode.
[ ] DTOs rechazan storageKey.
[ ] Responses no exponen storageKey.
[ ] Widgets visibles respetan permisos.
[ ] Métricas sensibles respetan permisos.
[ ] Cache no mezcla tenants ni permisos.
[ ] Snapshots están sanitizados.
[ ] Exports usan Secure Document Storage.
[ ] No existen endpoints públicos.
[ ] WordPress público no accede.
[ ] No hay efectos transaccionales.
[ ] No se ejecutan pagos.
[ ] No se crean asientos contables.
[ ] No se confirma conciliación.
[ ] No se controla hardware.
[ ] No se envían datos reales a IA externa.
[ ] OpenAPI no documenta campos prohibidos.
[ ] CI security gates pasan.
```

---

## 30. No aceptación de seguridad

No se acepta el módulo si:

```text id="dk-sec-no-acceptance"
- permite dashboards cross-tenant;
- permite KPIs cross-tenant;
- permite snapshots cross-tenant;
- permite exports cross-tenant;
- acepta tenantId desde cliente;
- acepta rawSql;
- acepta scripts;
- acepta formulaCode;
- usa eval;
- usa Function constructor;
- expone storageKey;
- devuelve signedUrl persistente;
- crea endpoints públicos;
- permite acceso WordPress público;
- muestra datos financieros sensibles sin permiso;
- muestra datos de seguridad sensibles sin permiso;
- muestra identificación completa sin permiso;
- muestra placa completa sin permiso;
- cache mezcla permisos;
- snapshot contiene payload sensible raw;
- export no usa SDS;
- dashboard crea Payment;
- dashboard valida Payment;
- dashboard crea Charge;
- dashboard crea JournalEntry;
- dashboard confirma Bank Reconciliation;
- dashboard modifica InventoryMovement;
- dashboard modifica AccessEvent;
- dashboard abre portones;
- dashboard controla hardware;
- dashboard envía datos reales a IA externa.
```

---

## 31. Resultado esperado

```text id="dk-sec-expected-result"
seguridad dashboard definida
tenant isolation protegido
role-aware visibility protegido
metric catalog protegido
widget catalog protegido
cache tenant-scoped protegido
permission-aware cache protegido
snapshots sanitizados protegidos
exports vía SDS protegidos
storageKey no expuesto
no raw SQL
no scripts
no executable formulas
no public endpoints
no WordPress access
no transactional side effects
no payment execution
no accounting execution
no bank reconciliation confirmation
no hardware control
no external AI with real data
audit seguro
logs seguros
OpenAPI seguro
CI security gates definidos
```

---

## 32. Expediente actualizado

```text id="dk-sec-expediente"
resident-core/
├── docs/
│   ├── specs/
│   │   └── 027-dashboard-kpis/
│   │       ├── spec.md
│   │       ├── plan.md
│   │       ├── data-model.md
│   │       ├── api-contract.md
│   │       ├── test-plan.md
│   │       ├── tasks.md
│   │       └── security-notes.md
```

---

## 33. Cierre del paquete 027

Con este documento queda cerrado el paquete SDD:

```text id="dk-package-complete"
docs/specs/027-dashboard-kpis/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```
