# Test Plan — 027 Dashboard and KPIs

## 1. Información del documento

| Campo           | Valor                                                                  |
| --------------- | ---------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                          |
| Spec ID         | 027                                                                    |
| Módulo          | Dashboard and KPIs                                                     |
| Documento       | Test Plan                                                              |
| Ruta            | `docs/specs/027-dashboard-kpis/test-plan.md`                           |
| Versión         | 0.1                                                                    |
| Estado          | Borrador inicial                                                       |
| Fecha           | 2026-08-02                                                             |
| Documento base  | `docs/specs/027-dashboard-kpis/spec.md`                                |
| Modelo de datos | `docs/specs/027-dashboard-kpis/data-model.md`                          |
| Stack objetivo  | NestJS / TypeScript / PostgreSQL / Prisma / Redis / OpenAPI / Keycloak |
| Naturaleza      | Tenant-scoped / Read-heavy / Derived-data / Role-aware / Non-public    |

---

## 2. Propósito

Este documento define el plan de pruebas para el módulo `027-dashboard-kpis`.

El objetivo es validar que el módulo permita consultar dashboards, widgets, KPIs, snapshots y exportaciones de forma segura, tenant-scoped, derivada, read-only y role-aware.

Regla central de pruebas:

```text id="dk-test-rule"
Dashboard and KPIs solo puede aceptarse si las pruebas demuestran que todos los dashboards, widgets, métricas, snapshots y exportaciones respetan tenant isolation, autorización por rol, minimización de datos, catálogo cerrado de métricas/widgets, ausencia de SQL arbitrario, ausencia de scripts, ausencia de fórmulas ejecutables, ausencia de storageKey, ausencia de endpoints públicos, ausencia de acceso desde WordPress público y ausencia total de efectos transaccionales.
```

---

## 3. Objetivos de prueba

```text id="dk-test-objectives"
1. Verificar tenant isolation en configuraciones, snapshots y exports.
2. Verificar que los dashboards son read-only.
3. Verificar que los KPIs se calculan desde fuentes autorizadas.
4. Verificar que los widgets visibles dependen de permisos y sensibilidad.
5. Verificar que los snapshots almacenan datos agregados y sanitizados.
6. Verificar que los exports usan Secure Document Storage.
7. Verificar que no se expone storageKey.
8. Verificar que no se acepta raw SQL, scripts ni fórmulas ejecutables.
9. Verificar que no existen endpoints públicos.
10. Verificar que WordPress público no puede consumir dashboards privados.
11. Verificar que fallas de fuente se reportan como partial o unavailable.
12. Verificar performance mínima para dashboards principales.
```

---

## 4. Alcance

### 4.1. Incluido

```text id="dk-test-scope-in"
- Dashboard definitions.
- Widget definitions.
- Metric definitions.
- Tenant dashboard configurations.
- Tenant widget configurations.
- KPI calculation services.
- Role-aware widget visibility.
- Dashboard query API.
- Snapshot generation.
- Dashboard exports via Secure Document Storage.
- Cache tenant-scoped.
- Audit events.
- Observability.
- OpenAPI checks.
- Multitenancy tests.
- Security tests.
- Performance baseline.
- Smoke tests.
```

---

### 4.2. Fuera de alcance funcional

Estas capacidades no se implementan en MVP, pero deben probarse como prohibiciones:

```text id="dk-test-scope-out"
- BI avanzado.
- SQL personalizado por usuario.
- Fórmulas ejecutables.
- Dashboards públicos.
- Dashboards embebidos en WordPress público.
- Acciones desde widgets.
- Pagos desde dashboard.
- Contabilidad desde dashboard.
- Conciliación bancaria desde dashboard.
- Apertura de portones.
- Control de hardware.
- IA externa con datos reales.
```

---

## 5. Estrategia de pruebas

```text id="dk-test-strategy"
1. Unit tests:
   - value objects;
   - validators;
   - permission filters;
   - metric catalog;
   - widget catalog;
   - cache key builder;
   - sanitizers.

2. Integration tests:
   - Prisma repositories;
   - Redis cache;
   - metric source ports;
   - Secure Document Storage adapter;
   - Audit adapter.

3. API tests:
   - platform definitions;
   - tenant dashboards;
   - widgets;
   - KPIs;
   - snapshots;
   - exports.

4. Security tests:
   - tenant isolation;
   - permissions;
   - no raw SQL;
   - no scripts;
   - no executable formulas;
   - no storageKey;
   - no public endpoints;
   - no WordPress access;
   - no transactional side effects.

5. Smoke tests:
   - seed definitions;
   - configure dashboard;
   - query executive dashboard;
   - query financial dashboard;
   - generate snapshot;
   - export dashboard.
```

---

## 6. Datos de prueba

### 6.1. Tenants

```text id="dk-test-tenants"
tenantA = "Conjunto Demo Norte"
tenantB = "Conjunto Demo Sur"
```

Regla:

```text id="dk-test-tenant-rule"
tenantA no puede leer, consultar, calcular, configurar, exportar ni generar snapshots con datos de tenantB.
```

---

### 6.2. Usuarios

```text id="dk-test-users"
platformAdmin
tenantAdminA
boardMemberA
financialManagerA
securityManagerA
maintenanceManagerA
residentA
tenantAdminB
financialManagerB
anonymousUser
```

---

### 6.3. Dashboards de prueba

```text id="dk-test-dashboards"
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

### 6.4. Métricas mínimas de prueba

```text id="dk-test-metrics"
financial.outstandingBalance
financial.collectionRate
financial.overdueBalance
properties.totalUnits
properties.occupiedUnits
maintenance.overdueWorkOrdersCount
access.openCheckInsCount
communications.unreadCriticalCount
automation.deadLettersOpenCount
audit.criticalEventsCount
```

---

## 7. Unit tests

### 7.1. Dashboard keys

```text id="dk-test-unit-dashboard-key"
[ ] Acepta executive.
[ ] Acepta residents-units.
[ ] Rechaza string vacío.
[ ] Rechaza espacios.
[ ] Rechaza caracteres peligrosos.
[ ] Rechaza rawSql.
[ ] Rechaza script.
```

---

### 7.2. Widget keys

```text id="dk-test-unit-widget-key"
[ ] Acepta executive.total-units.
[ ] Acepta financial.collection-rate.
[ ] Rechaza widget sin dashboard.
[ ] Rechaza widget con rawSql.
[ ] Rechaza widget con script.
[ ] Rechaza widget no catalogado.
```

---

### 7.3. Metric keys

```text id="dk-test-unit-metric-key"
[ ] Acepta financial.outstandingBalance.
[ ] Acepta maintenance.overdueWorkOrdersCount.
[ ] Rechaza métrica sin categoría.
[ ] Rechaza métrica no catalogada.
[ ] Rechaza rawSql.
[ ] Rechaza formulaCode.
```

---

### 7.4. Period filters

```text id="dk-test-unit-period"
[ ] Acepta periodFrom <= periodTo.
[ ] Rechaza periodFrom > periodTo.
[ ] Calcula currentMonth.
[ ] Calcula previousEquivalentPeriod.
[ ] Usa timezone del tenant.
```

---

### 7.5. Threshold config

```text id="dk-test-unit-threshold"
[ ] Acepta greaterThan.
[ ] Acepta greaterThanOrEqual.
[ ] Acepta lessThan.
[ ] Acepta lessThanOrEqual.
[ ] Acepta equals.
[ ] Rechaza operador no permitido.
[ ] Rechaza script.
[ ] Rechaza rawSql.
```

---

### 7.6. Sanitizers

```text id="dk-test-unit-sanitizers"
[ ] Rechaza storageKey.
[ ] Rechaza signedUrl persistente.
[ ] Rechaza secret.
[ ] Rechaza token.
[ ] Rechaza apiKey.
[ ] Rechaza rawSql.
[ ] Rechaza script.
[ ] Rechaza formulaCode.
[ ] Rechaza executableCode.
[ ] Sanitiza failureReason.
[ ] Sanitiza snapshotData.
[ ] Sanitiza export filters.
```

---

## 8. Integration tests

### 8.1. DashboardDefinitionRepository

```text id="dk-test-repo-dashboard-definition"
[ ] Crea dashboard definition.
[ ] dashboardKey único.
[ ] Lista dashboards active.
[ ] Archiva dashboard sin physical delete.
[ ] Dashboard archived no se habilita en nuevo tenant.
```

---

### 8.2. DashboardMetricDefinitionRepository

```text id="dk-test-repo-metric-definition"
[ ] Crea metric definition.
[ ] metricKey único.
[ ] Valida sourceModule.
[ ] Rechaza calculationStrategy rawSql.
[ ] Métrica archived no se usa en nuevos widgets.
```

---

### 8.3. DashboardWidgetDefinitionRepository

```text id="dk-test-repo-widget-definition"
[ ] Crea widget definition.
[ ] widgetKey único.
[ ] Widget apunta a metric active.
[ ] Widget apunta a dashboard active.
[ ] Rechaza defaultConfig con rawSql.
[ ] Rechaza defaultConfig con script.
```

---

### 8.4. TenantDashboardConfigurationRepository

```text id="dk-test-repo-tenant-dashboard-config"
[ ] Crea configuración tenant-scoped.
[ ] unique tenantId + dashboardDefinitionId.
[ ] tenantA puede tener mismo dashboard que tenantB.
[ ] tenantA no lee configuración de tenantB.
[ ] tenantA no actualiza configuración de tenantB.
[ ] Cross-tenant retorna null.
```

---

### 8.5. TenantDashboardWidgetConfigurationRepository

```text id="dk-test-repo-tenant-widget-config"
[ ] Crea configuración de widget tenant-scoped.
[ ] Widget pertenece al dashboard.
[ ] unique tenant + dashboardConfig + widgetDefinition.
[ ] tenantA no lee widget config tenantB.
[ ] thresholdConfig rechaza rawSql.
[ ] visibilityConfig no amplía permisos.
```

---

### 8.6. DashboardSnapshotRepository

```text id="dk-test-repo-snapshot"
[ ] Crea snapshot tenant-scoped.
[ ] snapshotCode único por tenant.
[ ] tenantA no lee snapshot tenantB.
[ ] periodFrom <= periodTo.
[ ] snapshotDataSanitized no contiene storageKey.
[ ] Snapshot archived no se muestra por defecto.
```

---

### 8.7. DashboardExportRepository

```text id="dk-test-repo-export"
[ ] Crea export tenant-scoped.
[ ] completed requiere secureDocumentId.
[ ] failed requiere failureReason.
[ ] tenantA no lee export tenantB.
[ ] Export no contiene storageKey.
[ ] Export no contiene signedUrl persistente.
```

---

## 9. Metric source port tests

### 9.1. Financial metrics

```text id="dk-test-source-financial"
[ ] Calcula outstandingBalance.
[ ] Calcula overdueBalance.
[ ] Calcula collectionRate.
[ ] Usa Decimal-safe calculations.
[ ] No crea Payment.
[ ] No valida Payment.
[ ] No reversa Payment.
[ ] No crea JournalEntry.
[ ] Fuente caída retorna unavailable.
```

---

### 9.2. Properties and residents metrics

```text id="dk-test-source-properties"
[ ] Calcula totalUnits.
[ ] Calcula occupiedUnits.
[ ] Calcula activeResidents.
[ ] Minimiza datos personales.
[ ] No expone identificación completa sin permiso.
```

---

### 9.3. Maintenance metrics

```text id="dk-test-source-maintenance"
[ ] Calcula open requests.
[ ] Calcula overdue work orders.
[ ] Calcula averageResolutionTime.
[ ] No modifica work orders.
[ ] Fuente parcial retorna partial.
```

---

### 9.4. Access metrics

```text id="dk-test-source-access"
[ ] Calcula visitorsToday.
[ ] Calcula openCheckIns.
[ ] Calcula deniedAccessCount.
[ ] No expone placas completas.
[ ] No expone identificación completa.
[ ] No modifica AccessEvent.
[ ] No abre portones.
```

---

### 9.5. Automation metrics

```text id="dk-test-source-automation"
[ ] Calcula activeWorkflowsCount.
[ ] Calcula executionsFailedCount.
[ ] Calcula deadLettersOpenCount.
[ ] No reintenta executions.
[ ] No resuelve dead letters.
```

---

## 10. API tests

### 10.1. Platform dashboard definitions

```text id="dk-test-api-platform-dashboard-definitions"
[ ] GET requiere autenticación.
[ ] POST requiere dashboardDefinitions.create.
[ ] PATCH requiere dashboardDefinitions.update.
[ ] Archive requiere dashboardDefinitions.archive.
[ ] POST rechaza rawSql.
[ ] POST rechaza script.
[ ] POST rechaza fórmula ejecutable.
[ ] Archive no borra físicamente.
```

---

### 10.2. Platform widget definitions

```text id="dk-test-api-platform-widget-definitions"
[ ] GET requiere autenticación.
[ ] POST requiere dashboardWidgetDefinitions.create.
[ ] Widget debe usar metricKey existente.
[ ] Widget debe usar dashboardKey existente.
[ ] POST rechaza defaultConfig con storageKey.
[ ] POST rechaza rawSql.
[ ] POST rechaza script.
```

---

### 10.3. Platform metric definitions

```text id="dk-test-api-platform-metric-definitions"
[ ] GET requiere autenticación.
[ ] POST requiere dashboardMetricDefinitions.create.
[ ] metricKey debe ser único.
[ ] sourceModule obligatorio.
[ ] calculationStrategy rawSql se rechaza.
[ ] Fórmula ejecutable se rechaza.
```

---

### 10.4. Tenant dashboards

```text id="dk-test-api-tenant-dashboards"
[ ] GET /tenant/dashboards requiere auth.
[ ] GET requiere TenantGuard.
[ ] GET requiere tenantDashboards.read.
[ ] Lista solo dashboards habilitados del tenant.
[ ] tenantA no ve dashboards config tenantB.
[ ] Resident no accede dashboards administrativos en MVP.
```

---

### 10.5. Dashboard KPIs

```text id="dk-test-api-kpis"
[ ] GET dashboard ejecutivo funciona con permiso.
[ ] GET dashboard financiero requiere permiso financiero.
[ ] GET dashboard de accesos requiere permiso de seguridad.
[ ] Widget sensible se oculta sin permiso.
[ ] Widgets se ordenan por displayOrder.
[ ] Filtro por periodo funciona.
[ ] Comparación contra periodo anterior funciona.
[ ] Falla de fuente retorna partial/unavailable.
[ ] No modifica datos transaccionales.
```

---

### 10.6. Dashboard configuration

```text id="dk-test-api-configuration"
[ ] PATCH dashboard configuration requiere tenantDashboards.configure.
[ ] PATCH widget configuration requiere tenantDashboardWidgets.configure.
[ ] Rechaza tenantId.
[ ] Rechaza actor fields.
[ ] Rechaza rawSql.
[ ] Rechaza script.
[ ] Rechaza formulaCode.
[ ] Rechaza storageKey.
[ ] Configuración tenantB desde tenantA retorna 404.
[ ] Cambio se audita.
```

---

### 10.7. Snapshots

```text id="dk-test-api-snapshots"
[ ] POST snapshot requiere tenantDashboards.snapshot.
[ ] Snapshot pertenece al tenant actual.
[ ] Snapshot contiene datos agregados.
[ ] Snapshot no contiene storageKey.
[ ] Snapshot no contiene raw payload sensible.
[ ] GET snapshot tenantB desde tenantA retorna 404.
[ ] Archive snapshot no borra físicamente.
[ ] Snapshot se audita.
```

---

### 10.8. Exports

```text id="dk-test-api-exports"
[ ] POST export requiere tenantDashboards.export.
[ ] includeSensitive=true requiere tenantDashboards.exportSensitive.
[ ] financialKpiSummary requiere permiso financiero.
[ ] securityKpiSummary requiere permiso de seguridad.
[ ] fullDashboardSummary requiere reason.
[ ] Export usa Secure Document Storage.
[ ] Response devuelve secureDocumentId.
[ ] Response no devuelve storageKey.
[ ] GET export tenantB desde tenantA retorna 404.
[ ] Export se audita.
```

---

## 11. Security tests

### 11.1. Auth and permissions

```text id="dk-test-security-auth"
[ ] Usuario anónimo recibe 401.
[ ] Usuario autenticado sin permiso recibe 403.
[ ] Resident no accede dashboards administrativos.
[ ] Financial dashboard requiere permiso financiero.
[ ] Access dashboard requiere permiso de seguridad.
[ ] Audit dashboard requiere permiso de auditoría.
[ ] Export sensible requiere permiso reforzado.
```

---

### 11.2. Multitenancy

```text id="dk-test-security-multitenancy"
[ ] tenantA no lee dashboard config tenantB.
[ ] tenantA no actualiza widget config tenantB.
[ ] tenantA no genera snapshot para tenantB.
[ ] tenantA no lee snapshot tenantB.
[ ] tenantA no crea export con datos tenantB.
[ ] tenantA no lee export tenantB.
[ ] Cache tenantA no sirve datos tenantB.
```

Respuesta esperada para cross-tenant:

```http id="dk-test-cross-tenant-response"
404 Not Found
```

---

### 11.3. Forbidden payloads

```text id="dk-test-security-forbidden"
[ ] Rechaza tenantId en DTO externo.
[ ] Rechaza createdBy.
[ ] Rechaza updatedBy.
[ ] Rechaza generatedBy.
[ ] Rechaza requestedBy.
[ ] Rechaza rawSql.
[ ] Rechaza sql.
[ ] Rechaza script.
[ ] Rechaza javascript.
[ ] Rechaza functionBody.
[ ] Rechaza executableCode.
[ ] Rechaza formulaCode.
[ ] Rechaza eval.
[ ] Rechaza Function.
[ ] Rechaza storageKey.
[ ] Rechaza signedUrl.
[ ] Rechaza secret.
[ ] Rechaza token.
[ ] Rechaza password.
[ ] Rechaza apiKey.
[ ] Rechaza externalAiEnabled.
[ ] Rechaza externalAiRealDataAllowed.
```

---

### 11.4. No public and no WordPress

```text id="dk-test-security-public"
[ ] /api/v1/public/dashboards devuelve 404.
[ ] /api/v1/public/dashboard-kpis devuelve 404.
[ ] /api/v1/public/tenants/{slug}/dashboards devuelve 404.
[ ] /api/v1/public/tenants/{slug}/dashboard-kpis devuelve 404.
[ ] CORS no permite WordPress público para tenant dashboards.
[ ] Sesión WordPress no autentica Core.
```

---

### 11.5. No transactional side effects

```text id="dk-test-security-no-side-effects"
[ ] Dashboard no crea Payment.
[ ] Dashboard no valida Payment.
[ ] Dashboard no reversa Payment.
[ ] Dashboard no crea Charge.
[ ] Dashboard no crea JournalEntry.
[ ] Dashboard no confirma Bank Reconciliation.
[ ] Dashboard no crea SupplierPaymentOrder.
[ ] Dashboard no modifica InventoryMovement.
[ ] Dashboard no modifica AccessEvent.
[ ] Dashboard no crea AccessCheckIn.
[ ] Dashboard no crea AccessCheckOut.
[ ] Dashboard no abre portones.
[ ] Dashboard no controla hardware.
[ ] Dashboard no envía datos reales a IA externa.
```

---

## 12. Cache tests

```text id="dk-test-cache"
[ ] Cache key incluye tenantId.
[ ] Cache key incluye dashboardKey.
[ ] Cache key incluye widgetKey.
[ ] Cache key incluye periodFrom/periodTo.
[ ] Cache key incluye permissionHash.
[ ] Usuarios con permisos distintos no comparten respuesta sensible.
[ ] Cache tenantA no devuelve datos tenantB.
[ ] Widget sensible puede deshabilitar cache.
[ ] TTL respeta refreshPolicy.
```

---

## 13. Audit tests

```text id="dk-test-audit"
[ ] dashboardDefinition.created se audita.
[ ] dashboardWidgetDefinition.created se audita.
[ ] dashboardMetricDefinition.created se audita.
[ ] tenantDashboardConfiguration.updated se audita.
[ ] tenantDashboardWidgetConfiguration.updated se audita.
[ ] dashboardSnapshot.generated se audita.
[ ] dashboardSnapshot.failed se audita.
[ ] dashboardExport.requested se audita.
[ ] dashboardExport.completed se audita.
[ ] dashboardSensitiveMetric.accessed se audita cuando aplique.
[ ] Audit no contiene storageKey.
[ ] Audit no contiene rawSql.
[ ] Audit no contiene script.
[ ] Audit no contiene datos cross-tenant.
```

---

## 14. Observability tests

```text id="dk-test-observability"
[ ] dashboard.requested loggea dashboardKey.
[ ] dashboard.rendered loggea durationMs.
[ ] dashboard.widget.calculated loggea metricKey.
[ ] dashboard.widget.failed loggea errorCode.
[ ] dashboard.export.completed loggea exportType.
[ ] Logs no contienen storageKey.
[ ] Logs no contienen token.
[ ] Logs no contienen raw payload.
[ ] Metrics no usan tenantId como label.
[ ] Metrics no usan userId como label.
[ ] Metrics no usan snapshotId como label.
[ ] Metrics no usan exportId como label.
```

---

## 15. OpenAPI tests

```text id="dk-test-openapi"
[ ] OpenAPI documenta Platform Dashboard Definitions.
[ ] OpenAPI documenta Platform Widget Definitions.
[ ] OpenAPI documenta Platform Metric Definitions.
[ ] OpenAPI documenta Tenant Dashboards.
[ ] OpenAPI documenta Tenant Dashboard KPIs.
[ ] OpenAPI documenta Tenant Dashboard Snapshots.
[ ] OpenAPI documenta Tenant Dashboard Exports.
[ ] OpenAPI no documenta rutas públicas.
[ ] OpenAPI no documenta tenantId en DTOs externos.
[ ] OpenAPI no documenta actor fields.
[ ] OpenAPI no documenta storageKey.
[ ] OpenAPI no documenta rawSql.
[ ] OpenAPI no documenta scripts.
[ ] OpenAPI incluye x-derived-data=true.
[ ] OpenAPI incluye x-read-only=true.
[ ] OpenAPI incluye x-public-exposure=false.
[ ] OpenAPI incluye x-wordpress-access=false.
[ ] OpenAPI incluye x-storage-key-exposed=false.
[ ] OpenAPI incluye x-payment-execution=false.
[ ] OpenAPI incluye x-accounting-execution=false.
[ ] OpenAPI incluye x-bank-reconciliation-confirmation=false.
[ ] OpenAPI incluye x-hardware-control=false.
[ ] OpenAPI incluye x-external-ai-real-data=false.
```

---

## 16. Performance tests

### 16.1. Dataset mínimo

```text id="dk-test-performance-dataset"
Global:
- 9 dashboard definitions.
- 60 metric definitions.
- 50 widget definitions.

Por tenant:
- 9 dashboard configurations.
- 50 widget configurations.
- 120 snapshots.
- 200 exports.
```

---

### 16.2. Objetivos

```text id="dk-test-performance-objectives"
[ ] Dashboard ejecutivo p95 < 1500 ms con cache.
[ ] Dashboard financiero p95 < 2000 ms con cache.
[ ] Dashboard operativo p95 < 2000 ms con cache.
[ ] Widget individual p95 < 800 ms con cache.
[ ] Listar dashboards p95 < 800 ms.
[ ] Crear snapshot p95 < 3000 ms.
[ ] Export pequeño p95 < 3000 ms.
[ ] pageSize máximo = 100.
[ ] No N+1 evidente.
```

---

## 17. Concurrency tests

```text id="dk-test-concurrency"
[ ] Dos usuarios configuran el mismo widget simultáneamente sin corrupción de estado.
[ ] Dashboard archivado durante consulta no produce datos inconsistentes.
[ ] Snapshot generado durante cambio de widgets conserva datos coherentes.
[ ] Export simultáneo no mezcla archivos.
[ ] Cache invalidada durante cálculo no rompe respuesta.
[ ] Fuente transaccional cambia durante cálculo y dashboard responde available, partial o unavailable correctamente.
```

---

## 18. Smoke flows

### 18.1. Seed básico

```text id="dk-smoke-seed"
[ ] PlatformAdmin crea dashboard executive.
[ ] PlatformAdmin crea metric financial.outstandingBalance.
[ ] PlatformAdmin crea widget executive.outstanding-balance.
[ ] Seeds no contienen SQL.
[ ] Seeds no contienen scripts.
[ ] Seeds no contienen storageKey.
```

---

### 18.2. Dashboard ejecutivo

```text id="dk-smoke-executive"
[ ] TenantAdminA consulta dashboard executive.
[ ] Sistema resuelve tenant actual.
[ ] Sistema filtra widgets visibles.
[ ] Sistema calcula KPIs agregados.
[ ] Sistema retorna traceId.
[ ] Sistema no modifica datos transaccionales.
```

---

### 18.3. Dashboard financiero

```text id="dk-smoke-financial"
[ ] FinancialManagerA consulta dashboard financial.
[ ] Sistema valida permisos financieros.
[ ] Sistema calcula KPIs Decimal-safe.
[ ] Sistema compara periodo anterior.
[ ] Sistema no valida pagos.
[ ] Sistema no crea JournalEntry.
```

---

### 18.4. Snapshot

```text id="dk-smoke-snapshot"
[ ] TenantAdminA genera snapshot.
[ ] Sistema calcula widgets permitidos.
[ ] Sistema guarda snapshotDataSanitized.
[ ] Snapshot no contiene storageKey.
[ ] Snapshot se audita.
```

---

### 18.5. Export

```text id="dk-smoke-export"
[ ] TenantAdminA solicita export dashboardCurrentView.
[ ] Sistema valida permisos.
[ ] Sistema crea DashboardExport.
[ ] Sistema crea documento vía SDS.
[ ] Response devuelve secureDocumentId.
[ ] Response no devuelve storageKey.
[ ] Export se audita.
```

---

## 19. CI gates

El pipeline debe ejecutar:

```text id="dk-ci-gates"
[ ] Unit tests.
[ ] Validator tests.
[ ] Sanitizer tests.
[ ] Repository tests.
[ ] Metric source port tests.
[ ] API tests.
[ ] Security tests.
[ ] Multitenancy tests.
[ ] Cache tests.
[ ] Audit tests.
[ ] Observability tests.
[ ] OpenAPI tests.
[ ] Performance baseline.
[ ] Smoke tests.
```

El pipeline debe fallar si:

```text id="dk-ci-fail"
[ ] Algún DTO acepta tenantId.
[ ] Algún DTO acepta actor fields.
[ ] Algún DTO acepta rawSql.
[ ] Algún DTO acepta script.
[ ] Algún DTO acepta formulaCode.
[ ] Algún DTO acepta storageKey.
[ ] Algún response expone storageKey.
[ ] API permite dashboard cross-tenant.
[ ] API permite snapshot cross-tenant.
[ ] API permite export cross-tenant.
[ ] Existe endpoint público.
[ ] WordPress público accede a dashboards.
[ ] Dashboard ejecuta Payment.
[ ] Dashboard crea JournalEntry.
[ ] Dashboard confirma Bank Reconciliation.
[ ] Dashboard controla hardware.
[ ] Dashboard envía datos reales a IA externa.
```

---

## 20. Cobertura mínima

```text id="dk-coverage"
- Value objects: >= 90%.
- Validators: >= 95%.
- Sanitizers: >= 95%.
- Domain policies: >= 95%.
- Repositories: >= 85%.
- Metric source services: >= 85%.
- API controllers: >= 85%.
- Security critical tests: 100% passing.
- Multitenancy critical tests: 100% passing.
- No side effects tests: 100% passing.
- OpenAPI critical tests: 100% passing.
```

---

## 21. Definition of Done de pruebas

```text id="dk-test-dod"
[ ] Unit tests implementados.
[ ] Integration tests implementados.
[ ] API tests implementados.
[ ] Security tests implementados.
[ ] Multitenancy tests implementados.
[ ] Cache tests implementados.
[ ] Audit tests implementados.
[ ] Observability tests implementados.
[ ] OpenAPI tests implementados.
[ ] Performance baseline implementado.
[ ] Smoke tests implementados.
[ ] CI gates implementados.
[ ] CI completo pasa.
```

---

## 22. No aceptación

No se acepta el módulo si las pruebas permiten:

```text id="dk-test-no-acceptance"
- mezclar datos de tenants;
- consultar dashboard cross-tenant;
- generar snapshot cross-tenant;
- exportar datos cross-tenant;
- aceptar tenantId desde cliente;
- aceptar actor fields desde cliente;
- aceptar rawSql;
- aceptar scripts;
- aceptar formulaCode ejecutable;
- aceptar storageKey;
- devolver storageKey;
- crear endpoints públicos;
- permitir acceso desde WordPress público;
- mostrar datos financieros sensibles sin permiso;
- mostrar datos de seguridad sensibles sin permiso;
- mostrar identificación completa sin permiso;
- mostrar placa completa sin permiso;
- crear Payment;
- validar Payment;
- reversar Payment;
- crear Charge;
- crear JournalEntry;
- confirmar Bank Reconciliation;
- modificar InventoryMovement;
- modificar AccessEvent;
- abrir portones;
- controlar hardware;
- enviar datos reales a IA externa;
- tratar snapshot como fuente de verdad;
- convertir falla de fuente en cero silencioso.
```

---

## 23. Resultado esperado

Al completar este plan de pruebas, `027-dashboard-kpis` tendrá cobertura suficiente para validar dashboards y KPIs seguros, tenant-scoped, role-aware, read-only, derivados de fuentes transaccionales y preparados para operación MVP.

Resultado esperado:

```text id="dk-test-expected-result"
dashboard tests definidos
widget tests definidos
metric tests definidos
tenant configuration tests definidos
KPI calculation tests definidos
source port tests definidos
snapshot tests definidos
export tests definidos
cache tests definidos
audit tests definidos
observability tests definidos
OpenAPI tests definidos
security tests definidos
multitenancy tests definidos
no public endpoints verificado
no WordPress access verificado
no raw SQL verificado
no scripts verificado
no executable formulas verificado
no storageKey exposure verificado
no transactional side effects verificado
performance baseline definido
smoke flows definidos
CI gates definidos
```

---

## 24. Expediente actualizado

```text id="dk-test-expediente"
resident-core/
├── docs/
│   ├── specs/
│   │   ├── 026-automation-workflows-basic/
│   │   └── 027-dashboard-kpis/
│   │       ├── spec.md
│   │       ├── plan.md
│   │       ├── data-model.md
│   │       └── test-plan.md
```
