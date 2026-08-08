# Tasks — 027 Dashboard and KPIs

## 1. Información del documento

| Campo          | Valor                                                                  |
| -------------- | ---------------------------------------------------------------------- |
| Proyecto       | RESIDENT Core                                                          |
| Spec ID        | 027                                                                    |
| Módulo         | Dashboard and KPIs                                                     |
| Documento      | Tasks                                                                  |
| Ruta           | `docs/specs/027-dashboard-kpis/tasks.md`                               |
| Versión        | 0.1                                                                    |
| Estado         | Borrador inicial                                                       |
| Fecha          | 2026-08-02                                                             |
| Stack objetivo | NestJS / TypeScript / PostgreSQL / Prisma / Redis / OpenAPI / Keycloak |
| Naturaleza     | Tenant-scoped / Read-heavy / Derived-data / Role-aware / Non-public    |

---

## 2. Propósito

Definir el backlog técnico para implementar el módulo `027-dashboard-kpis`.

El módulo debe permitir dashboards, widgets, KPIs, snapshots y exportaciones administrativas de forma segura, tenant-scoped, read-only y derivada de los módulos transaccionales.

Regla central:

```text id="dk-task-rule"
Dashboard and KPIs debe implementarse como un módulo de lectura, agregación y visualización, sin efectos transaccionales, sin SQL arbitrario, sin scripts, sin fórmulas ejecutables, sin endpoints públicos, sin acceso WordPress público, sin exposición de storageKey, sin datos cross-tenant y sin envío de datos reales a IA externa.
```

---

## 3. Convenciones de estado

```text id="dk-task-status"
[ ] Pendiente
[x] Completado
[~] En progreso
[!] Bloqueado
[-] No aplica
```

---

## 4. Dependencias previas

```text id="dk-task-dependencies"
[ ] spec.md aprobado.
[ ] plan.md aprobado.
[ ] data-model.md aprobado.
[ ] api-contract.md aprobado.
[ ] test-plan.md aprobado.
[ ] Módulo 001-tenants disponible o mockeable.
[ ] Módulo 002-users-roles disponible o mockeable.
[ ] Módulo 004-dues-fees disponible o mockeable.
[ ] Módulo 005-payments disponible o mockeable.
[ ] Módulo 006-account-statements disponible o mockeable.
[ ] Módulo 007-audit disponible o mockeable.
[ ] Módulo 016-secure-document-storage disponible o mockeable.
[ ] Módulo 025-tenant-settings-policies disponible o mockeable.
[ ] Módulo 026-automation-workflows-basic disponible o mockeable.
[ ] PostgreSQL disponible.
[ ] Prisma configurado.
[ ] Redis disponible para cache.
[ ] Keycloak/OIDC o auth mock disponible.
[ ] OpenAPI pipeline disponible.
```

---

# 5. EPIC-027-01 — Module foundation

## Objetivo

Crear la estructura base del módulo.

```text id="dk-epic-01"
[ ] Crear apps/api/src/modules/dashboard-kpis/.
[ ] Crear dashboard-kpis.module.ts.
[ ] Crear dashboard-kpis.config.ts.
[ ] Crear dashboard-kpis.constants.ts.
[ ] Registrar DashboardKpisModule.
[ ] Crear carpetas controllers/.
[ ] Crear carpetas application/services/.
[ ] Crear carpetas application/use-cases/.
[ ] Crear carpetas application/ports/.
[ ] Crear carpetas domain/entities/.
[ ] Crear carpetas domain/value-objects/.
[ ] Crear carpetas domain/policies/.
[ ] Crear carpetas infrastructure/persistence/.
[ ] Crear carpetas infrastructure/cache/.
[ ] Crear carpetas infrastructure/metrics-sources/.
[ ] Crear carpetas infrastructure/documents/.
[ ] Crear carpetas infrastructure/audit/.
[ ] Crear carpetas infrastructure/observability/.
[ ] Crear carpetas dto/.
[ ] Crear carpetas guards/.
[ ] Crear carpetas mappers/.
[ ] Crear carpetas seeds/.
[ ] Crear carpetas tests/.
```

Acceptance:

```text id="dk-epic-01-ac"
[ ] El módulo compila.
[ ] No expone endpoints públicos.
[ ] No contiene lógica de pagos.
[ ] No contiene lógica contable.
[ ] No contiene lógica de conciliación.
[ ] No contiene control de hardware.
[ ] No contiene integración IA externa.
```

---

# 6. EPIC-027-02 — Configuración y feature flags

```text id="dk-epic-02"
[ ] Crear DASHBOARD_KPIS_ENABLED=true.
[ ] Crear DASHBOARD_KPIS_CACHE_ENABLED=true.
[ ] Crear DASHBOARD_KPIS_EXPORT_ENABLED=true.
[ ] Crear DASHBOARD_KPIS_PUBLIC_ENDPOINTS_ENABLED=false.
[ ] Crear DASHBOARD_KPIS_WORDPRESS_ACCESS_ENABLED=false.
[ ] Crear DASHBOARD_KPIS_RAW_SQL_ENABLED=false.
[ ] Crear DASHBOARD_KPIS_EXECUTABLE_FORMULAS_ENABLED=false.
[ ] Crear DASHBOARD_KPIS_EXTERNAL_AI_ENABLED=false.
[ ] Crear DASHBOARD_KPIS_PAYMENT_EXECUTION_ENABLED=false.
[ ] Crear DASHBOARD_KPIS_ACCOUNTING_EXECUTION_ENABLED=false.
[ ] Crear DASHBOARD_KPIS_HARDWARE_CONTROL_ENABLED=false.
[ ] Crear DASHBOARD_KPIS_DEFAULT_PAGE_SIZE=25.
[ ] Crear DASHBOARD_KPIS_MAX_PAGE_SIZE=100.
[ ] Crear DASHBOARD_KPIS_WIDGET_TIMEOUT_MS=3000.
[ ] Crear DASHBOARD_KPIS_CACHE_TTL_SECONDS=300.
[ ] Implementar boot validation.
```

Acceptance:

```text id="dk-epic-02-ac"
[ ] Boot falla si se habilitan endpoints públicos.
[ ] Boot falla si se habilita acceso WordPress público.
[ ] Boot falla si se habilita raw SQL.
[ ] Boot falla si se habilitan fórmulas ejecutables.
[ ] Boot falla si se habilita IA externa con datos reales.
[ ] Boot falla si se habilitan pagos, contabilidad, conciliación o hardware.
```

---

# 7. EPIC-027-03 — Enums, errores y value objects

```text id="dk-epic-03"
[ ] Crear DashboardCategory.
[ ] Crear DashboardScope.
[ ] Crear DashboardDefinitionStatus.
[ ] Crear DashboardWidgetType.
[ ] Crear DashboardWidgetSize.
[ ] Crear DashboardMetricValueType.
[ ] Crear DashboardAggregationType.
[ ] Crear DashboardSensitivity.
[ ] Crear DashboardCalculationStrategy.
[ ] Crear DashboardDefaultPeriod.
[ ] Crear DashboardRefreshPolicy.
[ ] Crear DashboardSnapshotStatus.
[ ] Crear DashboardExportType.
[ ] Crear DashboardExportFormat.
[ ] Crear DashboardExportStatus.
[ ] Crear DashboardDataAvailabilityStatus.
[ ] Crear DashboardKey.
[ ] Crear WidgetKey.
[ ] Crear MetricKey.
[ ] Crear PeriodRange.
[ ] Crear PermissionHash.
[ ] Crear FilterHash.
[ ] Crear DashboardSnapshotCode.
[ ] Crear DashboardMoneyValue.
[ ] Crear catálogo de errores DASHBOARD_*.
[ ] Mapear errores a HTTP status.
```

Acceptance:

```text id="dk-epic-03-ac"
[ ] Cross-tenant se mapea a 404.
[ ] Falta de permiso se mapea a 403.
[ ] Campo prohibido se mapea a 422.
[ ] Estado inválido se mapea a 409.
[ ] Montos financieros usan decimal string.
```

---

# 8. EPIC-027-04 — Validators y sanitizers

```text id="dk-epic-04"
[ ] Crear DashboardDefinitionValidator.
[ ] Crear DashboardMetricDefinitionValidator.
[ ] Crear DashboardWidgetDefinitionValidator.
[ ] Crear TenantDashboardConfigurationValidator.
[ ] Crear TenantDashboardWidgetConfigurationValidator.
[ ] Crear ThresholdConfigValidator.
[ ] Crear VisibilityConfigValidator.
[ ] Crear DashboardFiltersValidator.
[ ] Crear DashboardSnapshotSanitizer.
[ ] Crear DashboardExportSanitizer.
[ ] Crear DashboardResponseSanitizer.
[ ] Crear ForbiddenKeysValidator recursivo.
[ ] Rechazar tenantId desde cliente.
[ ] Rechazar rawSql.
[ ] Rechazar script.
[ ] Rechazar formulaCode.
[ ] Rechazar executableCode.
[ ] Rechazar storageKey.
[ ] Rechazar signedUrl persistente.
[ ] Rechazar secretos.
[ ] Rechazar externalAiEnabled.
[ ] Rechazar externalAiRealDataAllowed.
[ ] Enmascarar identificación completa sin permiso.
[ ] Enmascarar placa completa sin permiso.
```

Acceptance:

```text id="dk-epic-04-ac"
[ ] Ningún JSONB acepta rawSql.
[ ] Ningún JSONB acepta script.
[ ] Ningún JSONB acepta formulaCode.
[ ] Ningún response expone storageKey.
[ ] Datos personales sensibles se minimizan.
```

---

# 9. EPIC-027-05 — Domain entities and policies

```text id="dk-epic-05"
[ ] Crear DashboardDefinition entity.
[ ] Crear DashboardMetricDefinition entity.
[ ] Crear DashboardWidgetDefinition entity.
[ ] Crear TenantDashboardConfiguration entity.
[ ] Crear TenantDashboardWidgetConfiguration entity.
[ ] Crear DashboardSnapshot entity.
[ ] Crear DashboardExport entity.
[ ] Crear DashboardTenantIsolationPolicy.
[ ] Crear DashboardReadOnlyPolicy.
[ ] Crear DashboardPermissionPolicy.
[ ] Crear DashboardSensitiveMetricPolicy.
[ ] Crear DashboardMetricCatalogPolicy.
[ ] Crear DashboardWidgetCatalogPolicy.
[ ] Crear NoRawSqlDashboardPolicy.
[ ] Crear NoExecutableFormulaPolicy.
[ ] Crear NoPublicDashboardPolicy.
[ ] Crear NoWordPressDashboardAccessPolicy.
[ ] Crear NoTransactionalSideEffectsPolicy.
[ ] Crear NoStorageKeyExposurePolicy.
[ ] Crear NoExternalAiRealDataPolicy.
```

Acceptance:

```text id="dk-epic-05-ac"
[ ] Policies bloquean datos cross-tenant.
[ ] Policies bloquean widgets fuera de catálogo.
[ ] Policies bloquean métricas fuera de catálogo.
[ ] Policies bloquean SQL arbitrario.
[ ] Policies bloquean efectos transaccionales.
```

---

# 10. EPIC-027-06 — Prisma schema and migrations

```text id="dk-epic-06"
[ ] Agregar enums Prisma.
[ ] Crear model DashboardDefinition.
[ ] Crear model DashboardMetricDefinition.
[ ] Crear model DashboardWidgetDefinition.
[ ] Crear model TenantDashboardConfiguration.
[ ] Crear model TenantDashboardWidgetConfiguration.
[ ] Crear model DashboardSnapshot.
[ ] Crear model DashboardExport.
[ ] Agregar relaciones en Tenant.
[ ] Crear migración 027_create_dashboard_kpis.
[ ] Crear índices globales.
[ ] Crear índices tenant-scoped.
[ ] Crear unique dashboard_key.
[ ] Crear unique metric_key.
[ ] Crear unique widget_key.
[ ] Crear unique tenant_id + dashboard_definition_id.
[ ] Crear unique tenant_id + snapshot_code.
[ ] Crear checks de period_from <= period_to.
[ ] Ejecutar prisma format.
[ ] Ejecutar migración local.
[ ] Ejecutar migración test.
```

Acceptance:

```text id="dk-epic-06-ac"
[ ] Tablas tenant-scoped tienen tenant_id.
[ ] No existen columnas storage_key.
[ ] No existen columnas raw_sql.
[ ] No existen columnas script.
[ ] No existen columnas formula_code.
[ ] No existen columnas de pago/ledger/hardware.
```

---

# 11. EPIC-027-07 — Repositories

```text id="dk-epic-07"
[ ] Crear DashboardDefinitionRepositoryPort.
[ ] Crear PrismaDashboardDefinitionRepository.
[ ] Crear DashboardMetricDefinitionRepositoryPort.
[ ] Crear PrismaDashboardMetricDefinitionRepository.
[ ] Crear DashboardWidgetDefinitionRepositoryPort.
[ ] Crear PrismaDashboardWidgetDefinitionRepository.
[ ] Crear TenantDashboardConfigurationRepositoryPort.
[ ] Crear PrismaTenantDashboardConfigurationRepository.
[ ] Crear TenantDashboardWidgetConfigurationRepositoryPort.
[ ] Crear PrismaTenantDashboardWidgetConfigurationRepository.
[ ] Crear DashboardSnapshotRepositoryPort.
[ ] Crear PrismaDashboardSnapshotRepository.
[ ] Crear DashboardExportRepositoryPort.
[ ] Crear PrismaDashboardExportRepository.
```

Regla:

```text id="dk-epic-07-rule"
Toda consulta tenant-scoped usa id + tenantId o clave + tenantId.
```

Acceptance:

```text id="dk-epic-07-ac"
[ ] tenantA no lee configuraciones tenantB.
[ ] tenantA no lee snapshots tenantB.
[ ] tenantA no lee exports tenantB.
[ ] Cross-tenant retorna null para mapear a 404.
```

---

# 12. EPIC-027-08 — DTOs and guards

```text id="dk-epic-08"
[ ] Crear CreateDashboardDefinitionDto.
[ ] Crear UpdateDashboardDefinitionDto.
[ ] Crear ArchiveDashboardDefinitionDto.
[ ] Crear CreateDashboardMetricDefinitionDto.
[ ] Crear UpdateDashboardMetricDefinitionDto.
[ ] Crear ArchiveDashboardMetricDefinitionDto.
[ ] Crear CreateDashboardWidgetDefinitionDto.
[ ] Crear UpdateDashboardWidgetDefinitionDto.
[ ] Crear ArchiveDashboardWidgetDefinitionDto.
[ ] Crear UpdateTenantDashboardConfigurationDto.
[ ] Crear UpdateTenantDashboardWidgetConfigurationDto.
[ ] Crear CreateDashboardSnapshotDto.
[ ] Crear ArchiveDashboardSnapshotDto.
[ ] Crear CreateDashboardExportDto.
[ ] Crear DashboardQueryDto.
[ ] Crear DashboardKpiQueryDto.
[ ] Crear DashboardPaginationDto.
[ ] Aplicar ValidationPipe whitelist.
[ ] Aplicar forbidNonWhitelisted.
[ ] Aplicar AuthGuard.
[ ] Aplicar TenantGuard.
[ ] Aplicar PermissionGuard.
[ ] Aplicar SensitivePermissionGuard.
[ ] Aplicar PlatformPermissionGuard.
```

Acceptance:

```text id="dk-epic-08-ac"
[ ] DTOs rechazan tenantId.
[ ] DTOs rechazan actor fields.
[ ] DTOs rechazan rawSql.
[ ] DTOs rechazan script.
[ ] DTOs rechazan formulaCode.
[ ] DTOs rechazan storageKey.
```

---

# 13. EPIC-027-09 — Platform APIs

## Dashboard Definitions

```text id="dk-epic-09-dashboard-definitions"
[ ] Implementar GET /api/v1/platform/dashboard-definitions.
[ ] Implementar POST /api/v1/platform/dashboard-definitions.
[ ] Implementar GET /api/v1/platform/dashboard-definitions/{dashboardDefinitionId}.
[ ] Implementar PATCH /api/v1/platform/dashboard-definitions/{dashboardDefinitionId}.
[ ] Implementar POST /api/v1/platform/dashboard-definitions/{dashboardDefinitionId}/archive.
```

## Metric Definitions

```text id="dk-epic-09-metric-definitions"
[ ] Implementar GET /api/v1/platform/dashboard-metric-definitions.
[ ] Implementar POST /api/v1/platform/dashboard-metric-definitions.
[ ] Implementar GET /api/v1/platform/dashboard-metric-definitions/{metricDefinitionId}.
[ ] Implementar PATCH /api/v1/platform/dashboard-metric-definitions/{metricDefinitionId}.
[ ] Implementar POST /api/v1/platform/dashboard-metric-definitions/{metricDefinitionId}/archive.
```

## Widget Definitions

```text id="dk-epic-09-widget-definitions"
[ ] Implementar GET /api/v1/platform/dashboard-widget-definitions.
[ ] Implementar POST /api/v1/platform/dashboard-widget-definitions.
[ ] Implementar GET /api/v1/platform/dashboard-widget-definitions/{widgetDefinitionId}.
[ ] Implementar PATCH /api/v1/platform/dashboard-widget-definitions/{widgetDefinitionId}.
[ ] Implementar POST /api/v1/platform/dashboard-widget-definitions/{widgetDefinitionId}/archive.
```

Acceptance:

```text id="dk-epic-09-ac"
[ ] Platform API requiere PlatformPermissionGuard.
[ ] No acepta SQL arbitrario.
[ ] No acepta scripts.
[ ] No acepta fórmulas ejecutables.
[ ] Archive no borra físicamente.
```

---

# 14. EPIC-027-10 — Tenant Dashboard APIs

```text id="dk-epic-10"
[ ] Implementar GET /api/v1/tenant/dashboards.
[ ] Implementar GET /api/v1/tenant/dashboards/{dashboardKey}.
[ ] Implementar GET /api/v1/tenant/dashboards/{dashboardKey}/widgets.
[ ] Implementar GET /api/v1/tenant/dashboards/{dashboardKey}/kpis.
[ ] Implementar PATCH /api/v1/tenant/dashboards/{dashboardKey}/configuration.
[ ] Implementar PATCH /api/v1/tenant/dashboards/{dashboardKey}/widgets/{widgetKey}/configuration.
[ ] Filtrar widgets por permiso.
[ ] Filtrar KPIs por permiso.
[ ] Aplicar filtros de periodo.
[ ] Aplicar comparación contra periodo anterior.
[ ] Marcar widgets partial/unavailable si falla fuente.
[ ] Impedir acceso de Resident a dashboards administrativos en MVP.
```

Acceptance:

```text id="dk-epic-10-ac"
[ ] Dashboard retorna solo datos tenant actual.
[ ] Usuario ve solo widgets autorizados.
[ ] Falla de un widget no tumba dashboard.
[ ] Dashboard no modifica datos fuente.
```

---

# 15. EPIC-027-11 — Metric calculation services

```text id="dk-epic-11"
[ ] Crear DashboardMetricCalculationService.
[ ] Crear DashboardWidgetCalculationService.
[ ] Crear DashboardFinancialMetricsPort.
[ ] Crear DashboardResidentsPropertiesMetricsPort.
[ ] Crear DashboardReservationsMetricsPort.
[ ] Crear DashboardFinesMetricsPort.
[ ] Crear DashboardMeetingsVotingMetricsPort.
[ ] Crear DashboardMaintenanceMetricsPort.
[ ] Crear DashboardInventoryMetricsPort.
[ ] Crear DashboardAccessMetricsPort.
[ ] Crear DashboardCommunicationsMetricsPort.
[ ] Crear DashboardAutomationMetricsPort.
[ ] Crear DashboardAuditMetricsPort.
[ ] Implementar cálculo financial.outstandingBalance.
[ ] Implementar cálculo financial.collectionRate.
[ ] Implementar cálculo properties.totalUnits.
[ ] Implementar cálculo maintenance.overdueWorkOrdersCount.
[ ] Implementar cálculo access.openCheckInsCount.
[ ] Implementar cálculo automation.deadLettersOpenCount.
[ ] Implementar cálculo communications.unreadCriticalCount.
[ ] Implementar comparación con periodo anterior.
[ ] Implementar breakdowns básicos.
[ ] Implementar availability=available/partial/unavailable.
```

Acceptance:

```text id="dk-epic-11-ac"
[ ] Cálculos financieros usan decimal string.
[ ] No se consulta SQL arbitrario.
[ ] No se escriben tablas fuente.
[ ] Errores de fuente no se transforman en cero silencioso.
```

---

# 16. EPIC-027-12 — Cache

```text id="dk-epic-12"
[ ] Crear DashboardCachePort.
[ ] Crear RedisDashboardCacheAdapter.
[ ] Generar cache key con tenantId.
[ ] Generar cache key con dashboardKey.
[ ] Generar cache key con widgetKey.
[ ] Generar cache key con periodRange.
[ ] Generar cache key con filterHash.
[ ] Generar cache key con permissionHash.
[ ] Implementar TTL por refreshPolicy.
[ ] Deshabilitar cache para widgets sensibles si aplica.
[ ] Invalidar cache al cambiar configuración.
```

Acceptance:

```text id="dk-epic-12-ac"
[ ] Cache no mezcla tenants.
[ ] Cache no mezcla usuarios con permisos distintos.
[ ] Cache no almacena storageKey.
[ ] Cache no almacena datos sensibles innecesarios.
```

---

# 17. EPIC-027-13 — Snapshots

```text id="dk-epic-13"
[ ] Implementar POST /api/v1/tenant/dashboards/{dashboardKey}/snapshots.
[ ] Implementar GET /api/v1/tenant/dashboard-snapshots.
[ ] Implementar GET /api/v1/tenant/dashboard-snapshots/{snapshotId}.
[ ] Implementar POST /api/v1/tenant/dashboard-snapshots/{snapshotId}/archive.
[ ] Crear GenerateDashboardSnapshotUseCase.
[ ] Crear ArchiveDashboardSnapshotUseCase.
[ ] Generar snapshotCode server-side.
[ ] Guardar filtersSanitized.
[ ] Guardar snapshotDataSanitized.
[ ] Rechazar storageKey.
[ ] Rechazar raw payload sensible.
[ ] Auditar dashboardSnapshot.generated.
[ ] Auditar dashboardSnapshot.failed.
[ ] Auditar dashboardSnapshot.archived.
```

Acceptance:

```text id="dk-epic-13-ac"
[ ] Snapshot pertenece al tenant.
[ ] Snapshot no reemplaza fuente transaccional.
[ ] Snapshot no contiene storageKey.
[ ] Snapshot no contiene datos cross-tenant.
```

---

# 18. EPIC-027-14 — Exports vía SDS

```text id="dk-epic-14"
[ ] Implementar POST /api/v1/tenant/dashboard-exports.
[ ] Implementar GET /api/v1/tenant/dashboard-exports.
[ ] Implementar GET /api/v1/tenant/dashboard-exports/{exportId}.
[ ] Crear CreateDashboardExportUseCase.
[ ] Crear DashboardExportService.
[ ] Crear DashboardSecureDocumentStoragePort.
[ ] Crear SecureDocumentStorageDashboardAdapter.
[ ] Implementar export dashboardCurrentView.
[ ] Implementar export dashboardSnapshot.
[ ] Implementar export financialKpiSummary.
[ ] Implementar export operationsKpiSummary.
[ ] Implementar export securityKpiSummary.
[ ] Implementar export maintenanceKpiSummary.
[ ] Implementar export fullDashboardSummary.
[ ] Implementar formato json.
[ ] Implementar formato xlsx.
[ ] Dejar pdf como opcional si engine existe.
[ ] Guardar secureDocumentId.
[ ] No guardar storageKey.
[ ] No devolver storageKey.
[ ] Auditar dashboardExport.requested.
[ ] Auditar dashboardExport.completed.
[ ] Auditar dashboardExport.failed.
```

Acceptance:

```text id="dk-epic-14-ac"
[ ] Export usa SDS.
[ ] Export retorna secureDocumentId.
[ ] Export no retorna storageKey.
[ ] Export sensible requiere permiso reforzado.
[ ] Export tenantB no es visible para tenantA.
```

---

# 19. EPIC-027-15 — Seeds

```text id="dk-epic-15"
[ ] Crear seed dashboard executive.
[ ] Crear seed dashboard financial.
[ ] Crear seed dashboard operations.
[ ] Crear seed dashboard residents-units.
[ ] Crear seed dashboard maintenance.
[ ] Crear seed dashboard access-visitors.
[ ] Crear seed dashboard governance.
[ ] Crear seed dashboard communications-automation.
[ ] Crear seed dashboard audit-security.
[ ] Crear seeds de métricas financieras.
[ ] Crear seeds de métricas de residentes/unidades.
[ ] Crear seeds de métricas de mantenimiento.
[ ] Crear seeds de métricas de accesos.
[ ] Crear seeds de métricas de comunicaciones.
[ ] Crear seeds de métricas de automatización.
[ ] Crear seeds de métricas de auditoría.
[ ] Crear seeds de widgets base.
[ ] Validar idempotencia de seeds.
```

Acceptance:

```text id="dk-epic-15-ac"
[ ] Seeds son idempotentes.
[ ] Seeds no contienen datos reales.
[ ] Seeds no contienen rawSql.
[ ] Seeds no contienen scripts.
[ ] Seeds no habilitan dashboards públicos.
```

---

# 20. EPIC-027-16 — Audit and observability

```text id="dk-epic-16"
[ ] Crear DashboardAuditService.
[ ] Crear DashboardObservabilityService.
[ ] Auditar dashboardDefinition.created/updated/archived.
[ ] Auditar dashboardMetricDefinition.created/updated/archived.
[ ] Auditar dashboardWidgetDefinition.created/updated/archived.
[ ] Auditar tenantDashboardConfiguration.updated.
[ ] Auditar tenantDashboardWidgetConfiguration.updated.
[ ] Auditar dashboardSnapshot.generated/failed/archived.
[ ] Auditar dashboardExport.requested/completed/failed.
[ ] Auditar dashboardSensitiveMetric.accessed.
[ ] Loggear dashboard.requested.
[ ] Loggear dashboard.rendered.
[ ] Loggear dashboard.widget.calculated.
[ ] Loggear dashboard.widget.failed.
[ ] Crear métrica dashboard_requests_total.
[ ] Crear métrica dashboard_render_duration_ms.
[ ] Crear métrica dashboard_widget_failures_total.
[ ] Crear métrica dashboard_cache_hits_total.
[ ] Crear métrica dashboard_cache_misses_total.
```

Acceptance:

```text id="dk-epic-16-ac"
[ ] Audit no contiene storageKey.
[ ] Audit no contiene raw payload sensible.
[ ] Logs no contienen authorization header.
[ ] Metrics no usan tenantId como label.
```

---

# 21. EPIC-027-17 — OpenAPI

```text id="dk-epic-17"
[ ] Documentar Platform Dashboard Definitions.
[ ] Documentar Platform Dashboard Metric Definitions.
[ ] Documentar Platform Dashboard Widget Definitions.
[ ] Documentar Tenant Dashboards.
[ ] Documentar Tenant Dashboard KPIs.
[ ] Documentar Tenant Dashboard Snapshots.
[ ] Documentar Tenant Dashboard Exports.
[ ] Agregar x-auth-required=true.
[ ] Agregar x-tenant-scope=true.
[ ] Agregar x-dashboard-kpis=true.
[ ] Agregar x-derived-data=true.
[ ] Agregar x-read-only=true.
[ ] Agregar x-public-exposure=false.
[ ] Agregar x-wordpress-access=false.
[ ] Agregar x-storage-key-exposed=false.
[ ] Agregar x-raw-sql-allowed=false.
[ ] Agregar x-executable-formula=false.
[ ] Agregar x-payment-execution=false.
[ ] Agregar x-accounting-execution=false.
[ ] Agregar x-bank-reconciliation-confirmation=false.
[ ] Agregar x-hardware-control=false.
[ ] Agregar x-external-ai-real-data=false.
```

No documentar:

```text id="dk-epic-17-forbidden"
[ ] /api/v1/public/dashboards.
[ ] /api/v1/public/dashboard-kpis.
[ ] tenantId en DTOs externos.
[ ] rawSql.
[ ] script.
[ ] formulaCode.
[ ] storageKey.
[ ] secrets.
```

---

# 22. EPIC-027-18 — Security hardening

```text id="dk-epic-18"
[ ] Ejecutar forbidden fields tests.
[ ] Ejecutar multitenancy tests.
[ ] Ejecutar permission tests.
[ ] Ejecutar privacy tests.
[ ] Ejecutar no public endpoint tests.
[ ] Ejecutar no WordPress access tests.
[ ] Ejecutar no raw SQL tests.
[ ] Ejecutar no executable formula tests.
[ ] Ejecutar no storageKey tests.
[ ] Ejecutar no side effects tests.
[ ] Ejecutar no payment execution tests.
[ ] Ejecutar no accounting execution tests.
[ ] Ejecutar no bank reconciliation confirmation tests.
[ ] Ejecutar no hardware control tests.
[ ] Ejecutar no external AI tests.
[ ] Verificar CORS restrictivo.
[ ] Verificar headers de seguridad.
[ ] Verificar OpenAPI sin campos prohibidos.
```

Acceptance:

```text id="dk-epic-18-ac"
[ ] Security critical tests pasan 100%.
[ ] No existen endpoints públicos.
[ ] WordPress público no accede.
[ ] No se exponen datos sensibles sin permiso.
[ ] No existen efectos transaccionales.
```

---

# 23. EPIC-027-19 — Performance and smoke tests

```text id="dk-epic-19"
[ ] Preparar dataset de 9 dashboard definitions.
[ ] Preparar dataset de 60 metric definitions.
[ ] Preparar dataset de 50 widget definitions.
[ ] Preparar tenant con 9 dashboard configurations.
[ ] Preparar tenant con 50 widget configurations.
[ ] Preparar tenant con 120 snapshots.
[ ] Preparar tenant con 200 exports.
[ ] Validar dashboard ejecutivo p95 < 1500 ms con cache.
[ ] Validar dashboard financiero p95 < 2000 ms con cache.
[ ] Validar widget individual p95 < 800 ms con cache.
[ ] Validar export pequeño p95 < 3000 ms.
[ ] Validar sin N+1 evidente.
[ ] Implementar smoke dashboard executive.
[ ] Implementar smoke dashboard financial.
[ ] Implementar smoke snapshot.
[ ] Implementar smoke export.
```

---

# 24. Plan de Pull Requests sugerido

```text id="dk-pr-plan"
PR-027-01 — Module foundation, config, enums and errors.
PR-027-02 — Value objects, validators, sanitizers and policies.
PR-027-03 — Prisma schema, migration and repositories.
PR-027-04 — DTOs, guards and Platform APIs.
PR-027-05 — Tenant Dashboard APIs and KPI calculation services.
PR-027-06 — Cache, snapshots and exports via SDS.
PR-027-07 — Seeds, audit, observability and OpenAPI.
PR-027-08 — Security hardening, performance and smoke tests.
```

---

# 25. Checklist por endpoint

```text id="dk-endpoints"
[ ] GET    /api/v1/platform/dashboard-definitions
[ ] POST   /api/v1/platform/dashboard-definitions
[ ] GET    /api/v1/platform/dashboard-definitions/{dashboardDefinitionId}
[ ] PATCH  /api/v1/platform/dashboard-definitions/{dashboardDefinitionId}
[ ] POST   /api/v1/platform/dashboard-definitions/{dashboardDefinitionId}/archive

[ ] GET    /api/v1/platform/dashboard-metric-definitions
[ ] POST   /api/v1/platform/dashboard-metric-definitions
[ ] GET    /api/v1/platform/dashboard-metric-definitions/{metricDefinitionId}
[ ] PATCH  /api/v1/platform/dashboard-metric-definitions/{metricDefinitionId}
[ ] POST   /api/v1/platform/dashboard-metric-definitions/{metricDefinitionId}/archive

[ ] GET    /api/v1/platform/dashboard-widget-definitions
[ ] POST   /api/v1/platform/dashboard-widget-definitions
[ ] GET    /api/v1/platform/dashboard-widget-definitions/{widgetDefinitionId}
[ ] PATCH  /api/v1/platform/dashboard-widget-definitions/{widgetDefinitionId}
[ ] POST   /api/v1/platform/dashboard-widget-definitions/{widgetDefinitionId}/archive

[ ] GET    /api/v1/tenant/dashboards
[ ] GET    /api/v1/tenant/dashboards/{dashboardKey}
[ ] GET    /api/v1/tenant/dashboards/{dashboardKey}/widgets
[ ] GET    /api/v1/tenant/dashboards/{dashboardKey}/kpis
[ ] PATCH  /api/v1/tenant/dashboards/{dashboardKey}/configuration
[ ] PATCH  /api/v1/tenant/dashboards/{dashboardKey}/widgets/{widgetKey}/configuration

[ ] POST   /api/v1/tenant/dashboards/{dashboardKey}/snapshots
[ ] GET    /api/v1/tenant/dashboard-snapshots
[ ] GET    /api/v1/tenant/dashboard-snapshots/{snapshotId}
[ ] POST   /api/v1/tenant/dashboard-snapshots/{snapshotId}/archive

[ ] POST   /api/v1/tenant/dashboard-exports
[ ] GET    /api/v1/tenant/dashboard-exports
[ ] GET    /api/v1/tenant/dashboard-exports/{exportId}
```

---

# 26. Definition of Done

```text id="dk-dod"
[ ] spec.md aprobado.
[ ] plan.md aprobado.
[ ] data-model.md aprobado.
[ ] api-contract.md aprobado.
[ ] test-plan.md aprobado.
[ ] tasks.md aprobado.
[ ] security-notes.md creado y aprobado.
[ ] Módulo NestJS implementado.
[ ] Prisma schema implementado.
[ ] Migración implementada.
[ ] Repositories implementados.
[ ] DTOs implementados.
[ ] Guards implementados.
[ ] Platform APIs implementadas.
[ ] Tenant APIs implementadas.
[ ] Metric calculation services implementados.
[ ] Cache implementado.
[ ] Snapshots implementados.
[ ] Exports vía SDS implementados.
[ ] Seeds implementados.
[ ] Audit implementado.
[ ] Observability implementada.
[ ] OpenAPI implementado.
[ ] Security hardening ejecutado.
[ ] Smoke tests pasan.
[ ] CI completo pasa.
```

---

# 27. No aceptación

No se acepta implementación si:

```text id="dk-no-acceptance"
- permite datos cross-tenant;
- acepta tenantId desde cliente;
- acepta rawSql;
- acepta scripts;
- acepta formulaCode;
- expone storageKey;
- expone signedUrl persistente;
- crea endpoints públicos;
- permite acceso WordPress público;
- muestra datos sensibles sin permiso;
- cache mezcla permisos;
- snapshot reemplaza fuente transaccional;
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

# 28. Resultado esperado

```text id="dk-expected-result"
tasks definidas
épicas compactas definidas
PR plan definido
endpoint checklist definido
DoD definido
no acceptance definido
implementación read-only definida
tenant isolation requerido
permission-aware dashboard requerido
cache tenant-scoped requerida
exports SDS requeridos
security hardening requerido
CI gates requeridos
```

---

# 29. Expediente actualizado

```text id="dk-expediente"
resident-core/
├── docs/
│   ├── specs/
│   │   └── 027-dashboard-kpis/
│   │       ├── spec.md
│   │       ├── plan.md
│   │       ├── data-model.md
│   │       ├── api-contract.md
│   │       ├── test-plan.md
│   │       └── tasks.md
```
