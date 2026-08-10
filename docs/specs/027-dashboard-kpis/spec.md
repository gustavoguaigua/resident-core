# Spec — 027 Dashboard and KPIs

## 1. Información del documento

| Campo                 | Valor                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------- |
| Proyecto              | RESIDENT Core                                                                          |
| Spec ID               | 027                                                                                    |
| Módulo                | Dashboard and KPIs                                                                     |
| Documento             | Functional Specification                                                               |
| Ruta                  | `docs/specs/027-dashboard-kpis/spec.md`                                                |
| Versión               | 0.1                                                                                    |
| Estado                | needs-review                                                                           |
| Fecha                 | 2026-08-01                                                                             |
| Fase                  | FASE 2 — RESIDENT Core                                                                 |
| Arquitectura objetivo | Monolito modular preparado para microservicios                                         |
| Stack objetivo        | NestJS / TypeScript / PostgreSQL / Prisma / OpenAPI / Keycloak / Redis                 |
| Naturaleza            | Tenant-scoped / Analytics-facing / Read-heavy / Role-aware / Non-public / Derived-data |

---

## 2. Propósito

El módulo `027-dashboard-kpis` permite construir tableros internos de indicadores para administradores, comité, responsables financieros, seguridad, mantenimiento y usuarios autorizados del conjunto residencial.

Su objetivo es ofrecer una vista ejecutiva, operativa y financiera del estado del tenant, derivada de los datos transaccionales ya registrados en los módulos de RESIDENT Core.

Este módulo no debe convertirse en fuente primaria de verdad, no debe modificar datos transaccionales y no debe ejecutar acciones financieras, contables, bancarias, operativas o de seguridad. Su función principal es consultar, agregar, calcular, resumir y presentar indicadores.

Regla central del módulo:

```text id="dk-rule"
Todo dashboard, widget, KPI, métrica, resumen, tendencia, alerta visual, filtro, consulta, snapshot, exportación y respuesta de Dashboard and KPIs debe pertenecer a un tenant, derivarse de fuentes transaccionales auditables, respetar autorización por rol y recurso, no convertirse en fuente primaria de verdad, no modificar datos operativos, no ejecutar pagos, no crear asientos contables, no confirmar conciliaciones, no abrir accesos físicos, no exponer datos personales innecesarios, no exponer datos cross-tenant, no estar disponible públicamente, no ser consumido desde WordPress público y mantener trazabilidad cuando se generen snapshots o exportaciones.
```

---

## 3. Contexto dentro de RESIDENT Core

`Dashboard and KPIs` es un módulo transversal de lectura, agregación y visualización.

```text id="dk-context-map"
RESIDENT Core
├── Tenants
│   └── valida tenant activo y configuración básica
├── Users, Roles and Permissions
│   └── controla acceso a dashboards y widgets
├── Residents and Properties
│   └── fuente de unidades, residentes, propietarios y ocupación
├── Dues and Fees
│   └── fuente de cargos emitidos, pendientes y vencidos
├── Payments
│   └── fuente de pagos, validaciones y rechazos
├── Account Statements
│   └── fuente de saldos por unidad
├── Basic Reports
│   └── fuente complementaria para consultas agregadas
├── Reservations
│   └── fuente de uso de áreas comunales
├── Fines and Sanctions
│   └── fuente de multas e impugnaciones
├── Meetings and Voting
│   └── fuente de participación y asistencia
├── Maintenance Work Orders
│   └── fuente de solicitudes, órdenes y cumplimiento
├── Inventory
│   └── fuente de stock bajo y consumos
├── Access Control and Visitors
│   └── fuente de accesos, visitantes e incidentes
├── Automation Workflows
│   └── fuente de automatizaciones, fallos y dead letters
├── Audit
│   └── fuente de eventos críticos
└── Dashboard and KPIs
    └── agrega, resume y presenta indicadores
```

---

## 4. Problema que resuelve

Sin dashboards y KPIs, la administración del conjunto depende de reportes aislados, hojas de cálculo externas, consultas manuales, revisiones módulo por módulo y procesamiento operativo reactivo.

Problemas a resolver:

```text id="dk-problems"
- falta de vista ejecutiva del estado financiero del conjunto;
- falta de visibilidad de mora;
- falta de seguimiento de pagos pendientes de validación;
- falta de indicadores de ocupación y unidades activas;
- falta de seguimiento de reservas y uso de áreas comunales;
- falta de visibilidad de mantenimiento pendiente;
- falta de seguimiento de incidentes de acceso;
- falta de indicadores de participación en reuniones;
- falta de control sobre automatizaciones fallidas;
- dependencia de reportes manuales;
- ausencia de alertas visuales por umbrales;
- dificultad para priorizar acciones administrativas;
- riesgo de mezclar información de tenants;
- exposición innecesaria de datos sensibles en vistas agregadas.
```

---

## 5. Objetivos funcionales

```text id="dk-objectives"
1. Proveer dashboards tenant-scoped.
2. Proveer KPIs financieros básicos.
3. Proveer KPIs operativos básicos.
4. Proveer KPIs de residentes y unidades.
5. Proveer KPIs de pagos y mora.
6. Proveer KPIs de mantenimiento.
7. Proveer KPIs de reservas.
8. Proveer KPIs de acceso y visitantes.
9. Proveer KPIs de reuniones, asistencia y votaciones.
10. Proveer KPIs de comunicaciones y automatizaciones.
11. Permitir widgets por rol.
12. Permitir filtros por periodo.
13. Permitir comparación con periodo anterior.
14. Permitir umbrales visuales.
15. Permitir snapshots opcionales.
16. Permitir exportación controlada.
17. Impedir edición de datos transaccionales.
18. Impedir exposición pública.
19. Impedir acceso desde WordPress público.
20. Mantener seguridad, privacidad, auditoría y trazabilidad.
```

---

## 6. Principios de diseño

### 6.1. Dashboard no es fuente de verdad

```text id="dk-principle-derived"
Dashboard and KPIs solo presenta información derivada. La fuente de verdad permanece en los módulos transaccionales correspondientes.
```

---

### 6.2. Lectura segura y tenant-scoped

```text id="dk-principle-tenant"
Toda consulta de dashboard debe resolverse dentro del tenant actual y nunca debe mezclar datos de tenants distintos.
```

---

### 6.3. Role-aware visibility

```text id="dk-principle-role-aware"
Cada usuario solo puede ver dashboards, widgets, métricas y niveles de detalle compatibles con sus permisos, rol, membresía y alcance funcional.
```

---

### 6.4. Menor detalle necesario

```text id="dk-principle-minimization"
El dashboard debe priorizar métricas agregadas. Los datos personales o financieros detallados solo se exponen cuando el rol y el permiso lo justifican.
```

---

### 6.5. Sin efectos secundarios

```text id="dk-principle-no-side-effects"
Consultar un dashboard no debe crear pagos, cargos, asientos, conciliaciones, movimientos de inventario, accesos, reservas, multas ni cambios operativos.
```

---

### 6.6. Snapshots controlados

```text id="dk-principle-snapshots"
Los snapshots de KPIs son evidencias históricas de lectura y no reemplazan la fuente transaccional.
```

---

### 6.7. Preparado para cache

```text id="dk-principle-cache"
El módulo debe estar preparado para cachear resultados agregados sin romper tenant isolation, autorización ni frescura mínima requerida.
```

---

## 7. Alcance MVP

### 7.1. Incluido

```text id="dk-scope-in"
- Dashboard ejecutivo tenant-scoped.
- Dashboard financiero básico.
- Dashboard operativo básico.
- Dashboard de administración de unidades y residentes.
- Dashboard de mantenimiento.
- Dashboard de accesos y visitantes.
- Dashboard de comunicaciones y automatizaciones.
- Catálogo de widgets.
- Configuración básica de dashboards por tenant.
- Widgets visibles por rol.
- KPIs agregados por periodo.
- KPIs con comparación contra periodo anterior.
- KPIs con umbrales visuales.
- Filtros por fecha.
- Filtros por módulo.
- Filtros por estado.
- Filtros por unidad cuando aplique.
- Snapshots opcionales de dashboard.
- Exportación controlada vía Secure Document Storage.
- Auditoría de snapshots y exports.
- Observabilidad.
- API REST privada.
- OpenAPI.
- Tests de multitenancy, seguridad, privacidad y performance.
```

---

### 7.2. Fuera de alcance MVP

```text id="dk-scope-out"
- BI avanzado.
- Cubos OLAP.
- Data warehouse dedicado.
- Lakehouse.
- Machine learning.
- Predicción de mora.
- IA generativa con datos reales.
- Dashboards públicos.
- Dashboards embebidos en WordPress público.
- Dashboards para visitantes.
- Dashboards para proveedores externos.
- Edición drag-and-drop avanzada.
- Constructor visual libre.
- SQL personalizado por usuario.
- Métricas configuradas con código.
- Fórmulas arbitrarias ejecutables.
- Streaming en tiempo real.
- Alertas automáticas complejas.
- Acciones automáticas desde widgets.
- Pagos desde dashboard.
- Contabilidad desde dashboard.
- Conciliación desde dashboard.
- Apertura de portones desde dashboard.
```

---

## 8. Tipos de dashboards MVP

### 8.1. Executive Dashboard

Vista general para administración o comité.

KPIs sugeridos:

```text id="dk-executive-dashboard"
- totalUnits;
- occupiedUnits;
- occupancyRate;
- totalResidents;
- monthlyChargesIssued;
- monthlyPaymentsValidated;
- outstandingBalance;
- overdueBalance;
- delinquencyRate;
- pendingPaymentValidations;
- openMaintenanceRequests;
- openAccessIncidents;
- upcomingMeetings;
- unreadCriticalCommunications;
- failedAutomationExecutions;
```

---

### 8.2. Financial Dashboard

Vista para administración financiera.

KPIs sugeridos:

```text id="dk-financial-dashboard"
- chargesIssuedAmount;
- chargesIssuedCount;
- paymentsSubmittedAmount;
- paymentsValidatedAmount;
- paymentsRejectedAmount;
- pendingPaymentValidationAmount;
- outstandingBalance;
- overdueBalance;
- delinquencyRate;
- collectionRate;
- averageDaysToPayment;
- topOverdueUnitsCount;
- accountStatementsGeneratedCount;
- chargeAdjustmentsAmount;
- paymentReversalsAmount;
```

Regla:

```text id="dk-financial-dashboard-rule"
El dashboard financiero puede mostrar saldos, pagos y mora de forma agregada o detallada según permiso, pero no puede validar pagos, crear pagos, reversar pagos ni modificar estados de cuenta.
```

---

### 8.3. Operations Dashboard

Vista operativa general.

KPIs sugeridos:

```text id="dk-operations-dashboard"
- reservationsThisMonth;
- reservationsPendingApproval;
- commonAreaUtilizationRate;
- finesIssuedThisMonth;
- finesAppealedCount;
- openMaintenanceRequests;
- overdueMaintenanceWorkOrders;
- lowStockItems;
- supplierPayablesPendingReview;
- openIncidents;
```

---

### 8.4. Residents and Units Dashboard

Vista sobre unidades, residentes y propietarios.

KPIs sugeridos:

```text id="dk-residents-dashboard"
- totalUnits;
- activeUnits;
- inactiveUnits;
- occupiedUnits;
- vacantUnits;
- ownerOccupiedUnits;
- rentedUnits;
- registeredResidents;
- activeResidents;
- residentsWithoutUserAccount;
- unitsWithoutAssignedResident;
- vehiclesRegistered;
- petsRegistered;
```

Regla:

```text id="dk-residents-dashboard-rule"
Los widgets de residentes y unidades deben minimizar datos personales. El detalle por persona solo debe estar disponible para roles autorizados.
```

---

### 8.5. Maintenance Dashboard

Vista para seguimiento de mantenimiento.

KPIs sugeridos:

```text id="dk-maintenance-dashboard"
- maintenanceRequestsCreated;
- maintenanceRequestsOpen;
- maintenanceRequestsInProgress;
- maintenanceRequestsCompleted;
- overdueWorkOrders;
- averageResolutionTime;
- pendingCostApprovals;
- workOrdersByPriority;
- workOrdersByCategory;
- workOrdersBySupplier;
```

---

### 8.6. Access and Visitors Dashboard

Vista para seguridad y administración.

KPIs sugeridos:

```text id="dk-access-dashboard"
- visitorsToday;
- visitorsThisWeek;
- openCheckIns;
- averageVisitDuration;
- deniedAccessCount;
- accessIncidentsOpen;
- recurringAuthorizationsActive;
- deliveriesPending;
- supplierVisitsToday;
- openCheckInsExceededThreshold;
```

Regla:

```text id="dk-access-dashboard-rule"
El dashboard de accesos debe ser especialmente restrictivo. No debe exponer identificación completa, placas completas, patrones detallados de personas o datos sensibles innecesarios.
```

---

### 8.7. Meetings and Governance Dashboard

Vista para reuniones, asistencia y votaciones.

KPIs sugeridos:

```text id="dk-governance-dashboard"
- upcomingMeetings;
- meetingsHeldThisYear;
- averageAttendanceRate;
- quorumAchievedCount;
- quorumFailedCount;
- votingSessionsOpened;
- votingSessionsClosed;
- certifiedMinutesPublished;
- pendingMinutesApproval;
```

---

### 8.8. Communications and Automation Dashboard

Vista de comunicaciones y automatizaciones.

KPIs sugeridos:

```text id="dk-communications-automation-dashboard"
- communicationsSent;
- criticalCommunicationsSent;
- unreadCriticalCommunications;
- notificationFailures;
- activeAutomationWorkflows;
- automationExecutionsSucceeded;
- automationExecutionsFailed;
- automationDeadLettersOpen;
- scheduledWorkflowsActive;
- manualRunsThisMonth;
```

---

## 9. Entidades funcionales

### 9.1. DashboardDefinition

Representa un dashboard disponible.

Campos conceptuales:

```text id="dk-entity-dashboard-definition"
- id;
- dashboardKey;
- name;
- description;
- category;
- scope;
- status;
- defaultRoleVisibility;
- createdAt;
- updatedAt;
```

Reglas:

```text id="dk-dashboard-definition-rules"
- dashboardKey debe ser único.
- Puede ser global o tenant-configurable.
- No contiene datos transaccionales.
- No contiene SQL arbitrario.
- No contiene scripts.
```

---

### 9.2. DashboardWidgetDefinition

Representa un widget disponible en un dashboard.

Campos conceptuales:

```text id="dk-entity-widget-definition"
- id;
- widgetKey;
- dashboardDefinitionId;
- name;
- description;
- widgetType;
- metricKey;
- sourceModule;
- requiredPermission;
- sensitivity;
- defaultSize;
- defaultOrder;
- status;
```

Tipos de widget:

```text id="dk-widget-types"
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

Reglas:

```text id="dk-widget-definition-rules"
- widgetKey debe ser único.
- metricKey debe existir en catálogo de métricas.
- requiredPermission obligatorio para widgets sensibles.
- No contiene SQL arbitrario.
- No contiene código ejecutable.
```

---

### 9.3. DashboardMetricDefinition

Define una métrica calculable.

Campos conceptuales:

```text id="dk-entity-metric-definition"
- id;
- metricKey;
- name;
- description;
- category;
- sourceModule;
- valueType;
- aggregationType;
- sensitivity;
- supportsComparison;
- supportsTrend;
- supportsBreakdown;
- requiredPermission;
- status;
```

Value types:

```text id="dk-value-types"
count
amount
percentage
duration
ratio
status
```

Aggregation types:

```text id="dk-aggregation-types"
sum
count
average
min
max
ratio
percentage
derived
```

Reglas:

```text id="dk-metric-definition-rules"
- metricKey debe ser único.
- sourceModule obligatorio.
- Cálculo debe estar implementado por servicio controlado.
- No se permite SQL definido por usuario.
- No se permite fórmula ejecutable arbitraria.
```

---

### 9.4. TenantDashboardConfiguration

Configuración de dashboards por tenant.

Campos conceptuales:

```text id="dk-entity-tenant-dashboard-config"
- id;
- tenantId;
- dashboardDefinitionId;
- isEnabled;
- displayName;
- defaultPeriod;
- refreshPolicy;
- createdBy;
- updatedBy;
- createdAt;
- updatedAt;
```

Reglas:

```text id="dk-tenant-dashboard-config-rules"
- tenantId obligatorio.
- Un dashboard puede habilitarse o deshabilitarse por tenant.
- No habilita dashboards públicos.
- No modifica datos transaccionales.
```

---

### 9.5. TenantDashboardWidgetConfiguration

Configuración de widgets por tenant.

Campos conceptuales:

```text id="dk-entity-tenant-widget-config"
- id;
- tenantId;
- dashboardDefinitionId;
- widgetDefinitionId;
- isEnabled;
- displayOrder;
- size;
- thresholdConfig;
- visibilityConfig;
- createdBy;
- updatedBy;
- createdAt;
- updatedAt;
```

Reglas:

```text id="dk-tenant-widget-config-rules"
- widgetDefinitionId debe existir.
- Widget debe pertenecer al dashboard.
- thresholdConfig debe ser declarativo.
- visibilityConfig no reemplaza PermissionGuard.
- No se permite fórmula ejecutable.
```

---

### 9.6. DashboardSnapshot

Representa una captura histórica opcional de KPIs.

Campos conceptuales:

```text id="dk-entity-dashboard-snapshot"
- id;
- tenantId;
- dashboardDefinitionId;
- snapshotCode;
- periodFrom;
- periodTo;
- generatedBy;
- generatedAt;
- snapshotDataSanitized;
- status;
```

Reglas:

```text id="dk-dashboard-snapshot-rules"
- Snapshot pertenece a tenant.
- Snapshot no reemplaza fuente transaccional.
- Snapshot contiene datos agregados y sanitizados.
- Snapshot no contiene storageKey.
- Snapshot no contiene datos cross-tenant.
```

---

### 9.7. DashboardExport

Representa una exportación de dashboard.

Campos conceptuales:

```text id="dk-entity-dashboard-export"
- id;
- tenantId;
- dashboardDefinitionId;
- exportType;
- format;
- filters;
- secureDocumentId;
- requestedBy;
- status;
- createdAt;
- completedAt;
- failedAt;
```

Reglas:

```text id="dk-dashboard-export-rules"
- Exportación usa Secure Document Storage.
- No devuelve storageKey.
- Export sensible requiere permiso reforzado.
- Export se audita.
```

---

## 10. Catálogo inicial de métricas MVP

### 10.1. Financial metrics

```text id="dk-financial-metrics"
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

### 10.2. Residents and units metrics

```text id="dk-residents-metrics"
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

### 10.3. Reservations metrics

```text id="dk-reservations-metrics"
reservations.createdCount
reservations.approvedCount
reservations.cancelledCount
reservations.pendingApprovalCount
reservations.commonAreaUtilizationRate
reservations.revenueAssociatedAmount
```

Regla:

```text id="dk-reservations-metrics-rule"
Si existe revenueAssociatedAmount, debe derivarse de cargos o pagos existentes; el dashboard no calcula ni crea cobros por sí mismo.
```

---

### 10.4. Fines metrics

```text id="dk-fines-metrics"
fines.issuedCount
fines.issuedAmount
fines.pendingCount
fines.appealedCount
fines.resolvedAppealsCount
fines.cancelledCount
```

---

### 10.5. Meetings and voting metrics

```text id="dk-meetings-metrics"
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

### 10.6. Maintenance metrics

```text id="dk-maintenance-metrics"
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

### 10.7. Inventory metrics

```text id="dk-inventory-metrics"
inventory.totalItems
inventory.lowStockItemsCount
inventory.outOfStockItemsCount
inventory.consumptionsThisMonth
inventory.adjustmentsThisMonth
inventory.itemsByCategoryBreakdown
```

---

### 10.8. Access Control metrics

```text id="dk-access-metrics"
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

### 10.9. Communications and automation metrics

```text id="dk-communications-automation-metrics"
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

### 10.10. Audit and security metrics

```text id="dk-audit-security-metrics"
audit.criticalEventsCount
audit.failedAccessAttemptsCount
audit.securityRelevantEventsCount
audit.platformAdminTenantAccessCount
audit.exportEventsCount
```

Regla:

```text id="dk-audit-security-rule"
Los widgets de auditoría y seguridad requieren permisos reforzados y no deben exponer metadata sensible completa.
```

---

## 11. Actores

### 11.1. TenantAdmin

Puede:

```text id="dk-actor-tenantadmin-can"
- consultar dashboards administrativos;
- consultar dashboard financiero si tiene permisos;
- configurar widgets básicos del tenant;
- generar snapshots;
- exportar dashboard si tiene permiso;
- consultar KPIs agregados.
```

No puede:

```text id="dk-actor-tenantadmin-cannot"
- modificar datos transaccionales desde el dashboard;
- consultar datos cross-tenant;
- acceder a widgets sensibles sin permiso;
- exportar storageKey;
```

---

### 11.2. BoardMember / Comité

Puede, según permisos:

```text id="dk-actor-board-can"
- consultar dashboard ejecutivo;
- consultar KPIs financieros agregados;
- consultar KPIs de reuniones;
- consultar KPIs operativos agregados;
- exportar vistas permitidas.
```

---

### 11.3. FinancialManager

Puede:

```text id="dk-actor-financial-can"
- consultar dashboard financiero;
- consultar mora;
- consultar pagos pendientes;
- consultar saldos agregados;
- exportar indicadores financieros si tiene permiso.
```

No puede desde dashboard:

```text id="dk-actor-financial-cannot"
- validar pagos;
- reversar pagos;
- crear cargos;
- crear asientos contables;
- confirmar conciliación bancaria.
```

---

### 11.4. SecurityManager

Puede:

```text id="dk-actor-security-can"
- consultar dashboard de accesos;
- consultar incidentes agregados;
- consultar check-ins abiertos;
- consultar visitas por periodo;
- exportar métricas de seguridad si tiene permiso.
```

No puede desde dashboard:

```text id="dk-actor-security-cannot"
- abrir portones;
- modificar AccessEvents;
- crear check-in/check-out;
- exponer identificaciones o placas completas.
```

---

### 11.5. MaintenanceManager

Puede:

```text id="dk-actor-maintenance-can"
- consultar dashboard de mantenimiento;
- consultar work orders pendientes;
- consultar tiempos promedio;
- consultar breakdown por prioridad/categoría;
- exportar métricas operativas.
```

---

### 11.6. Resident

En MVP:

```text id="dk-actor-resident"
Resident no accede a dashboards administrativos. Su vista propia se definirá en 030-resident-self-service-basic.
```

---

### 11.7. PlatformAdmin

Puede:

```text id="dk-actor-platform-can"
- administrar definiciones globales de dashboards, widgets y métricas;
- crear widgets base;
- revisar configuración técnica;
- no acceder automáticamente a datos de tenant sin contexto, permiso y auditoría.
```

---

## 12. Permisos

### 12.1. Dashboard definitions

```text id="dk-permissions-definitions"
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
```

---

### 12.2. Tenant dashboard access

```text id="dk-permissions-tenant"
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

### 12.3. Permisos reforzados

```text id="dk-permissions-sensitive"
tenantDashboards.exportSensitive
tenantDashboardMetrics.readPersonalData
tenantDashboardMetrics.readFinancialDetail
tenantDashboardMetrics.readSecurityDetail
tenantDashboardMetrics.readAuditDetail
dashboardDefinitions.manageSensitive
```

Regla:

```text id="dk-permission-rule"
Un permiso de dashboard no reemplaza permisos del módulo fuente. El usuario debe tener autorización para ver la categoría de datos que el KPI resume.
```

---

## 13. Estados

### 13.1. DashboardDefinitionStatus

```text id="dk-status-dashboard-definition"
active
deprecated
archived
```

---

### 13.2. DashboardWidgetDefinitionStatus

```text id="dk-status-widget-definition"
active
deprecated
archived
```

---

### 13.3. DashboardMetricDefinitionStatus

```text id="dk-status-metric-definition"
active
deprecated
archived
```

---

### 13.4. TenantDashboardConfigurationStatus

```text id="dk-status-tenant-dashboard-config"
active
inactive
archived
```

---

### 13.5. DashboardSnapshotStatus

```text id="dk-status-snapshot"
generated
archived
failed
```

---

### 13.6. DashboardExportStatus

```text id="dk-status-export"
requested
processing
completed
failed
archived
```

---

## 14. Reglas de negocio

### 14.1. Reglas generales

```text id="dk-br-general"
BR-001 Todo dashboard consultado debe pertenecer al tenant actual o ser definición global permitida.
BR-002 Toda métrica calculada debe resolverse dentro del tenant actual.
BR-003 Todo widget debe usar metricKey catalogado.
BR-004 No se permite SQL arbitrario definido por usuario.
BR-005 No se permite fórmula ejecutable.
BR-006 No se permite script.
BR-007 Dashboard no modifica datos transaccionales.
BR-008 Dashboard no ejecuta actions de otros módulos.
BR-009 Dashboard no reemplaza reportes auditables cuando estos sean requeridos.
BR-010 Cross-tenant debe responder 404.
```

---

### 14.2. Reglas de visibilidad

```text id="dk-br-visibility"
BR-011 Widget financiero requiere permiso financiero.
BR-012 Widget de seguridad requiere permiso de seguridad.
BR-013 Widget de auditoría requiere permiso de auditoría.
BR-014 Widget con datos personales requiere permiso reforzado.
BR-015 Widgets agregados deben preferirse sobre detalle.
BR-016 Resident no accede a dashboard administrativo en MVP.
BR-017 PlatformAdmin no ve datos de tenant sin contexto y auditoría.
```

---

### 14.3. Reglas de cálculo

```text id="dk-br-calculation"
BR-018 Todo KPI se calcula desde módulos fuente autorizados.
BR-019 Métricas financieras deben usar Decimal-safe calculations.
BR-020 Métricas monetarias usan USD por defecto según tenant settings.
BR-021 Métricas por periodo requieren periodFrom y periodTo.
BR-022 periodFrom debe ser menor o igual que periodTo.
BR-023 Comparación contra periodo anterior debe usar ventana equivalente.
BR-024 Datos incompletos deben marcarse como partial.
BR-025 Errores de fuente deben reflejarse como unavailable o partial, no como cero silencioso.
```

---

### 14.4. Reglas de cache

```text id="dk-br-cache"
BR-026 Cache debe ser tenant-scoped.
BR-027 Cache key debe incluir tenantId, dashboardKey, widgetKey, filtros y permisos efectivos cuando aplique.
BR-028 Cache no debe mezclar usuarios con diferentes permisos.
BR-029 Widgets sensibles pueden tener cache deshabilitado o TTL reducido.
BR-030 Cache invalidation puede ser eventual en MVP.
```

---

### 14.5. Reglas de snapshots

```text id="dk-br-snapshots"
BR-031 Snapshot pertenece a tenant.
BR-032 Snapshot se genera bajo permiso.
BR-033 Snapshot contiene datos agregados y sanitizados.
BR-034 Snapshot no reemplaza fuente de verdad.
BR-035 Snapshot no contiene storageKey.
BR-036 Snapshot se audita.
```

---

### 14.6. Reglas de exportación

```text id="dk-br-export"
BR-037 Export requiere permiso.
BR-038 Export sensible requiere permiso reforzado.
BR-039 Export usa Secure Document Storage.
BR-040 Export devuelve secureDocumentId.
BR-041 Export no devuelve storageKey.
BR-042 Export se audita.
BR-043 Export no contiene datos cross-tenant.
```

---

### 14.7. Reglas de límites de dominio

```text id="dk-br-boundaries"
BR-044 Dashboard no crea Payment.
BR-045 Dashboard no valida Payment.
BR-046 Dashboard no reversa Payment.
BR-047 Dashboard no crea Charge.
BR-048 Dashboard no crea JournalEntry.
BR-049 Dashboard no confirma Bank Reconciliation.
BR-050 Dashboard no crea SupplierPaymentOrder.
BR-051 Dashboard no modifica InventoryMovement.
BR-052 Dashboard no modifica AccessEvent.
BR-053 Dashboard no abre portones.
BR-054 Dashboard no controla hardware.
BR-055 Dashboard no envía datos reales a IA externa.
```

---

## 15. Casos de uso principales

### 15.1. Consultar dashboard ejecutivo

```text id="dk-usecase-executive"
1. Usuario autenticado accede al dashboard ejecutivo.
2. Sistema resuelve tenant actual.
3. Sistema valida tenantDashboards.read.
4. Sistema identifica widgets visibles para el rol.
5. Sistema calcula KPIs agregados.
6. Sistema aplica filtros de periodo.
7. Sistema retorna métricas agregadas.
8. Sistema registra observabilidad.
```

---

### 15.2. Consultar dashboard financiero

```text id="dk-usecase-financial"
1. Usuario autenticado solicita dashboard financiero.
2. Sistema valida permisos financieros.
3. Sistema calcula cargos emitidos, pagos validados, saldos y mora.
4. Sistema usa Decimal-safe calculations.
5. Sistema oculta detalle sensible si el usuario no tiene permiso reforzado.
6. Sistema retorna KPIs y tendencias.
```

---

### 15.3. Configurar widget del tenant

```text id="dk-usecase-configure-widget"
1. TenantAdmin autorizado abre configuración.
2. Sistema valida tenantDashboards.configure.
3. Usuario habilita o deshabilita widget.
4. Usuario ajusta orden, tamaño y umbral.
5. Sistema valida configuración.
6. Sistema guarda configuración tenant-scoped.
7. Sistema audita cambio.
```

---

### 15.4. Generar snapshot

```text id="dk-usecase-snapshot"
1. Usuario autorizado solicita snapshot.
2. Sistema valida tenantDashboards.snapshot.
3. Sistema calcula widgets permitidos.
4. Sistema sanitiza datos.
5. Sistema crea DashboardSnapshot.
6. Sistema audita dashboardSnapshot.generated.
```

---

### 15.5. Exportar dashboard

```text id="dk-usecase-export"
1. Usuario autorizado solicita export.
2. Sistema valida tenantDashboards.export.
3. Si incluye datos sensibles, valida tenantDashboards.exportSensitive.
4. Sistema calcula KPIs.
5. Sistema genera archivo.
6. Sistema guarda archivo vía Secure Document Storage.
7. Sistema retorna secureDocumentId.
8. Sistema audita dashboardExport.completed.
```

---

## 16. User stories

### US-001 — Dashboard ejecutivo

Como TenantAdmin, quiero ver un dashboard ejecutivo del conjunto para entender rápidamente el estado financiero, operativo y administrativo.

Acceptance criteria:

```text id="dk-us001-ac"
[ ] Requiere autenticación.
[ ] Requiere tenantDashboards.read.
[ ] Muestra solo datos del tenant actual.
[ ] Muestra KPIs agregados.
[ ] No permite modificar datos.
[ ] No expone datos sensibles no autorizados.
```

---

### US-002 — Dashboard financiero

Como FinancialManager, quiero ver KPIs financieros para monitorear cargos, pagos, mora y recaudación.

Acceptance criteria:

```text id="dk-us002-ac"
[ ] Requiere tenantDashboardMetrics.readFinancial.
[ ] Calcula montos Decimal-safe.
[ ] Permite filtro por periodo.
[ ] Muestra comparación con periodo anterior.
[ ] No valida pagos.
[ ] No crea asientos contables.
```

---

### US-003 — Dashboard de mantenimiento

Como MaintenanceManager, quiero ver solicitudes y órdenes pendientes para priorizar el trabajo operativo.

Acceptance criteria:

```text id="dk-us003-ac"
[ ] Requiere permiso operativo.
[ ] Muestra órdenes abiertas, vencidas y completadas.
[ ] Permite breakdown por prioridad y categoría.
[ ] No modifica órdenes.
[ ] No crea obligaciones de pago.
```

---

### US-004 — Dashboard de accesos

Como SecurityManager, quiero ver indicadores de visitantes, check-ins abiertos e incidentes para monitorear la seguridad del conjunto.

Acceptance criteria:

```text id="dk-us004-ac"
[ ] Requiere tenantDashboardMetrics.readSecurity.
[ ] Muestra métricas agregadas de acceso.
[ ] No expone identificaciones completas.
[ ] No expone placas completas.
[ ] No crea ni modifica eventos de acceso.
[ ] No abre portones.
```

---

### US-005 — Configurar widgets

Como TenantAdmin, quiero habilitar, deshabilitar y ordenar widgets para adaptar el dashboard a las necesidades del conjunto.

Acceptance criteria:

```text id="dk-us005-ac"
[ ] Requiere tenantDashboards.configure.
[ ] Configuración pertenece al tenant.
[ ] No permite SQL arbitrario.
[ ] No permite scripts.
[ ] No reemplaza permisos.
[ ] Se audita el cambio.
```

---

### US-006 — Exportar dashboard

Como BoardMember autorizado, quiero exportar el dashboard para revisarlo en una sesión administrativa.

Acceptance criteria:

```text id="dk-us006-ac"
[ ] Requiere tenantDashboards.export.
[ ] Export sensible requiere tenantDashboards.exportSensitive.
[ ] Export usa Secure Document Storage.
[ ] Retorna secureDocumentId.
[ ] No retorna storageKey.
[ ] Se audita.
```

---

### US-007 — Generar snapshot

Como TenantAdmin, quiero generar una captura de KPIs del mes para conservar evidencia administrativa.

Acceptance criteria:

```text id="dk-us007-ac"
[ ] Requiere tenantDashboards.snapshot.
[ ] Snapshot pertenece al tenant.
[ ] Snapshot contiene datos agregados.
[ ] Snapshot no reemplaza fuentes transaccionales.
[ ] Snapshot se audita.
```

---

## 17. Requerimientos funcionales

### 17.1. Dashboard definitions

```text id="dk-fr-dashboard-definitions"
FR-001 El sistema debe permitir definir dashboards globales.
FR-002 El sistema debe permitir listar dashboards disponibles.
FR-003 El sistema debe permitir archivar dashboards.
FR-004 El sistema debe impedir dashboards públicos.
FR-005 El sistema debe impedir dashboards con SQL arbitrario.
```

---

### 17.2. Widget definitions

```text id="dk-fr-widget-definitions"
FR-006 El sistema debe permitir definir widgets.
FR-007 El sistema debe asociar widgets a dashboards.
FR-008 El sistema debe asociar widgets a metricKey catalogado.
FR-009 El sistema debe definir permisos mínimos por widget.
FR-010 El sistema debe impedir widgets con código ejecutable.
```

---

### 17.3. Metric definitions

```text id="dk-fr-metric-definitions"
FR-011 El sistema debe permitir definir metricKeys.
FR-012 El sistema debe asociar metricKeys a módulos fuente.
FR-013 El sistema debe definir tipo de valor.
FR-014 El sistema debe definir sensibilidad.
FR-015 El sistema debe impedir métricas con fórmula ejecutable arbitraria.
```

---

### 17.4. Tenant dashboard configuration

```text id="dk-fr-tenant-config"
FR-016 El sistema debe permitir habilitar dashboards por tenant.
FR-017 El sistema debe permitir deshabilitar dashboards por tenant.
FR-018 El sistema debe permitir configurar widgets por tenant.
FR-019 El sistema debe permitir configurar umbrales visuales.
FR-020 El sistema debe validar que la configuración no reemplace permisos.
FR-021 El sistema debe auditar cambios de configuración.
```

---

### 17.5. KPI calculation

```text id="dk-fr-kpi-calculation"
FR-022 El sistema debe calcular KPIs por periodo.
FR-023 El sistema debe calcular KPIs financieros Decimal-safe.
FR-024 El sistema debe calcular comparación con periodo anterior.
FR-025 El sistema debe soportar breakdown por estado.
FR-026 El sistema debe soportar breakdown por categoría.
FR-027 El sistema debe marcar datos como partial si una fuente falla.
FR-028 El sistema debe marcar datos como unavailable si la fuente no está disponible.
```

---

### 17.6. Dashboard query

```text id="dk-fr-dashboard-query"
FR-029 El sistema debe consultar dashboard por dashboardKey.
FR-030 El sistema debe retornar widgets visibles por permiso.
FR-031 El sistema debe aplicar filtros de periodo.
FR-032 El sistema debe aplicar filtros de estado cuando aplique.
FR-033 El sistema debe aplicar filtros de módulo cuando aplique.
FR-034 El sistema debe impedir filtros cross-tenant.
FR-035 El sistema debe respetar pageSize máximo en widgets tipo tabla.
```

---

### 17.7. Snapshots

```text id="dk-fr-snapshots"
FR-036 El sistema debe generar snapshots.
FR-037 El sistema debe consultar snapshots.
FR-038 El sistema debe archivar snapshots.
FR-039 El sistema debe guardar snapshotDataSanitized.
FR-040 El sistema debe auditar snapshots.
```

---

### 17.8. Exports

```text id="dk-fr-exports"
FR-041 El sistema debe exportar dashboards.
FR-042 El sistema debe exportar snapshots.
FR-043 El sistema debe usar Secure Document Storage.
FR-044 El sistema debe retornar secureDocumentId.
FR-045 El sistema no debe retornar storageKey.
FR-046 El sistema debe auditar exports.
```

---

### 17.9. Seguridad funcional

```text id="dk-fr-security"
FR-047 El sistema debe rechazar tenantId desde cliente.
FR-048 El sistema debe rechazar actor fields.
FR-049 El sistema debe rechazar rawSql.
FR-050 El sistema debe rechazar script.
FR-051 El sistema debe rechazar executableCode.
FR-052 El sistema debe impedir endpoints públicos.
FR-053 El sistema debe impedir acceso desde WordPress público.
FR-054 El sistema debe impedir efectos secundarios transaccionales.
FR-055 El sistema debe impedir IA externa con datos reales.
```

---

## 18. Requerimientos no funcionales

### 18.1. Seguridad

```text id="dk-nfr-security"
NFR-001 Todas las rutas requieren autenticación.
NFR-002 Todas las rutas tenant requieren TenantGuard.
NFR-003 Todas las rutas requieren PermissionGuard.
NFR-004 Widgets sensibles requieren permisos reforzados.
NFR-005 Cross-tenant responde 404.
NFR-006 DTOs rechazan tenantId.
NFR-007 DTOs rechazan rawSql.
NFR-008 DTOs rechazan scripts.
NFR-009 Responses no exponen storageKey.
NFR-010 No existen endpoints públicos.
```

---

### 18.2. Privacidad

```text id="dk-nfr-privacy"
NFR-011 Widgets deben minimizar datos personales.
NFR-012 KPIs agregados se prefieren sobre detalle.
NFR-013 Métricas de acceso no exponen identificación completa.
NFR-014 Métricas de acceso no exponen placa completa.
NFR-015 Exports sensibles requieren permiso reforzado.
```

---

### 18.3. Performance

```text id="dk-nfr-performance"
NFR-016 Dashboard ejecutivo p95 < 1500 ms con cache.
NFR-017 Dashboard financiero p95 < 2000 ms con cache.
NFR-018 Dashboard operativo p95 < 2000 ms con cache.
NFR-019 Widget individual p95 < 800 ms con cache.
NFR-020 Export pequeño p95 < 3000 ms.
NFR-021 pageSize máximo = 100.
```

---

### 18.4. Disponibilidad y degradación

```text id="dk-nfr-availability"
NFR-022 Falla de un widget no debe tumbar todo el dashboard.
NFR-023 Widget con fuente caída debe marcarse unavailable.
NFR-024 Widget con datos parciales debe marcarse partial.
NFR-025 Dashboard debe retornar traceId.
```

---

### 18.5. Compatibilidad microservicios

```text id="dk-nfr-microservices"
NFR-026 Métricas deben consultar módulos por puertos.
NFR-027 No debe haber escritura directa en tablas externas.
NFR-028 metricKey debe ser estable.
NFR-029 dashboardKey debe ser estable.
NFR-030 widgetKey debe ser estable.
```

---

## 19. API preliminar

> El contrato formal se definirá en `api-contract.md`.

### 19.1. Platform API

```text id="dk-api-platform"
GET    /api/v1/platform/dashboard-definitions
POST   /api/v1/platform/dashboard-definitions
GET    /api/v1/platform/dashboard-definitions/{dashboardDefinitionId}
PATCH  /api/v1/platform/dashboard-definitions/{dashboardDefinitionId}
POST   /api/v1/platform/dashboard-definitions/{dashboardDefinitionId}/archive

GET    /api/v1/platform/dashboard-widget-definitions
POST   /api/v1/platform/dashboard-widget-definitions
GET    /api/v1/platform/dashboard-widget-definitions/{widgetDefinitionId}
PATCH  /api/v1/platform/dashboard-widget-definitions/{widgetDefinitionId}
POST   /api/v1/platform/dashboard-widget-definitions/{widgetDefinitionId}/archive

GET    /api/v1/platform/dashboard-metric-definitions
POST   /api/v1/platform/dashboard-metric-definitions
GET    /api/v1/platform/dashboard-metric-definitions/{metricDefinitionId}
PATCH  /api/v1/platform/dashboard-metric-definitions/{metricDefinitionId}
POST   /api/v1/platform/dashboard-metric-definitions/{metricDefinitionId}/archive
```

---

### 19.2. Tenant API

```text id="dk-api-tenant"
GET    /api/v1/tenant/dashboards
GET    /api/v1/tenant/dashboards/{dashboardKey}
GET    /api/v1/tenant/dashboards/{dashboardKey}/widgets
GET    /api/v1/tenant/dashboards/{dashboardKey}/kpis
PATCH  /api/v1/tenant/dashboards/{dashboardKey}/configuration
PATCH  /api/v1/tenant/dashboards/{dashboardKey}/widgets/{widgetKey}/configuration

POST   /api/v1/tenant/dashboards/{dashboardKey}/snapshots
GET    /api/v1/tenant/dashboard-snapshots
GET    /api/v1/tenant/dashboard-snapshots/{snapshotId}
POST   /api/v1/tenant/dashboard-snapshots/{snapshotId}/archive

POST   /api/v1/tenant/dashboard-exports
GET    /api/v1/tenant/dashboard-exports
GET    /api/v1/tenant/dashboard-exports/{exportId}
```

---

### 19.3. Public API prohibida

No implementar:

```text id="dk-api-public-forbidden"
/api/v1/public/dashboards
/api/v1/public/dashboard-kpis
/api/v1/public/tenants/{slug}/dashboards
/api/v1/public/tenants/{slug}/dashboard-kpis
```

Respuesta esperada:

```http id="dk-api-public-response"
404 Not Found
```

---

## 20. Integraciones

### 20.1. Tenants

Uso:

```text id="dk-integration-tenants"
- validar tenant activo;
- obtener timezone;
- obtener moneda;
- aplicar tenant isolation;
- resolver configuración base.
```

---

### 20.2. Users, Roles and Permissions

Uso:

```text id="dk-integration-users"
- validar actor;
- validar permisos;
- filtrar widgets visibles;
- aplicar permisos reforzados;
- impedir acceso de Resident a dashboards administrativos en MVP.
```

---

### 20.3. Tenant Settings and Policies

Uso:

```text id="dk-integration-settings"
- moneda;
- timezone;
- periodos por defecto;
- umbrales configurables;
- política de cache;
- política de exportación;
- visibilidad por rol.
```

---

### 20.4. Financial modules

Módulos:

```text id="dk-integration-financial"
004-dues-fees
005-payments
006-account-statements
017-bank-reconciliation
020-accounting-ledger
021-supplier-payments
```

Uso:

```text id="dk-financial-usage"
- leer cargos;
- leer pagos;
- leer saldos;
- leer mora;
- leer pagos pendientes;
- leer conciliaciones en estado informativo;
- leer obligaciones de proveedor de forma agregada;
- no modificar datos.
```

---

### 20.5. Operations modules

Módulos:

```text id="dk-integration-operations"
010-reservations-common-areas
011-fines-sanctions
013-meetings-attendance
014-voting-basic
015-certified-minutes
022-maintenance-work-orders
023-inventory-basic
024-access-control-visitors
026-automation-workflows-basic
```

Uso:

```text id="dk-operations-usage"
- leer reservas;
- leer multas;
- leer asistencia;
- leer votaciones agregadas;
- leer actas publicadas internamente;
- leer mantenimiento;
- leer inventario agregado;
- leer accesos agregados;
- leer automatizaciones.
```

---

### 20.6. Secure Document Storage

Uso:

```text id="dk-integration-sds"
- almacenar exportaciones;
- almacenar snapshots exportados si aplica;
- retornar secureDocumentId;
- no retornar storageKey.
```

---

### 20.7. Audit

Uso:

```text id="dk-integration-audit"
- auditar configuración de dashboard;
- auditar snapshot generado;
- auditar export generado;
- auditar acceso excepcional a widgets sensibles si aplica.
```

---

## 21. Seguridad

### 21.1. Controles mínimos

```text id="dk-security-controls"
- AuthGuard.
- TenantGuard.
- PermissionGuard.
- SensitivePermissionGuard.
- PlatformPermissionGuard.
- DTO whitelist.
- forbidNonWhitelisted.
- Metric catalog allowlist.
- Widget catalog allowlist.
- Dashboard catalog allowlist.
- No raw SQL.
- No scripts.
- No executable formulas.
- No public endpoints.
- No WordPress access.
- No storageKey exposure.
- No transactional side effects.
- No external AI with real data.
```

---

### 21.2. Campos prohibidos en DTOs externos

```text id="dk-forbidden-dto-fields"
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

### 21.3. Campos prohibidos en responses

```text id="dk-forbidden-response-fields"
storageKey
signedUrl persistente
secret
token
password
apiKey
rawSql
script
functionBody
executableCode
raw stack trace
datos cross-tenant
identificación completa no autorizada
placa completa no autorizada
payload sensible raw
```

---

### 21.4. Prohibiciones de dominio

```text id="dk-domain-forbidden"
- no crear Payment;
- no validar Payment;
- no reversar Payment;
- no crear Charge;
- no crear JournalEntry;
- no confirmar Bank Reconciliation;
- no crear SupplierPaymentOrder;
- no modificar InventoryMovement;
- no modificar AccessEvent;
- no crear AccessCheckIn;
- no crear AccessCheckOut;
- no abrir portones;
- no controlar hardware;
- no enviar datos reales a IA externa.
```

---

## 22. Auditoría

Eventos mínimos:

```text id="dk-audit-events"
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

```text id="dk-audit-metadata-allowed"
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

```text id="dk-audit-metadata-forbidden"
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

## 23. Observabilidad

### 23.1. Logs seguros

Eventos loggeables:

```text id="dk-observability-logs"
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

```text id="dk-observability-fields"
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

```text id="dk-observability-forbidden"
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

### 23.2. Métricas

```text id="dk-metrics"
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

```text id="dk-metric-labels-allowed"
dashboardKey
widgetType
metricKey
sourceModule
status
outcome
errorCode
```

Labels prohibidos:

```text id="dk-metric-labels-forbidden"
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

## 24. Cache

### 24.1. Estrategia MVP

```text id="dk-cache-strategy"
- Cache opcional con Redis.
- Cache tenant-scoped.
- Cache por dashboardKey, widgetKey, filtros y permiso efectivo.
- TTL corto para widgets financieros y de seguridad.
- TTL configurable por Tenant Settings and Policies.
- Cache deshabilitable por widget sensible.
```

---

### 24.2. Cache key conceptual

```text id="dk-cache-key"
tenant:{tenantId}:dashboard:{dashboardKey}:widget:{widgetKey}:period:{periodFrom}:{periodTo}:perm:{permissionHash}
```

Regla:

```text id="dk-cache-rule"
permissionHash debe evitar que usuarios con distintos permisos compartan respuestas sensibles.
```

---

## 25. Reportes y exports

### 25.1. Export types

```text id="dk-export-types"
dashboardCurrentView
dashboardSnapshot
financialKpiSummary
operationsKpiSummary
securityKpiSummary
maintenanceKpiSummary
fullDashboardSummary
```

---

### 25.2. Formatos

```text id="dk-export-formats"
json
xlsx
pdf
```

MVP recomendado:

```text id="dk-export-mvp"
json
xlsx
```

---

### 25.3. Reglas

```text id="dk-export-rules"
- Export requiere tenantDashboards.export.
- Export sensible requiere tenantDashboards.exportSensitive.
- Export financiero detallado requiere tenantDashboardMetrics.readFinancialDetail.
- Export de seguridad detallado requiere tenantDashboardMetrics.readSecurityDetail.
- Export de auditoría requiere tenantDashboardMetrics.readAuditDetail.
- Export usa Secure Document Storage.
- Export devuelve secureDocumentId.
- Export no devuelve storageKey.
```

---

## 26. Riesgos

| Riesgo                                        |      Nivel | Mitigación                                          |
| --------------------------------------------- | ---------: | --------------------------------------------------- |
| Mezcla de datos entre tenants                 |    Crítico | tenant_id, TenantGuard, tests cross-tenant          |
| Exposición de datos financieros sensibles     |       Alto | permisos financieros, minimización, exportSensitive |
| Exposición de datos de acceso/visitantes      |       Alto | permisos de seguridad, masking, agregación          |
| Dashboard usado como fuente de verdad         | Medio/Alto | documentación, no writes, derived-only              |
| Widget con SQL arbitrario                     |    Crítico | catálogo cerrado, no raw SQL                        |
| Fórmula ejecutable                            |    Crítico | no executable formulas                              |
| Cache compartido entre permisos distintos     |       Alto | permissionHash en cache key                         |
| Export con storageKey                         |    Crítico | SDS boundary tests                                  |
| Métrica calcula cero ante fuente caída        |      Medio | partial/unavailable                                 |
| Performance degradado por agregaciones        | Medio/Alto | cache, índices, materialización futura              |
| PlatformAdmin define widget sensible inseguro |       Alto | manageSensitive, review, CI                         |
| WordPress consume dashboard privado           |       Alto | no public endpoints, CORS restrictivo               |

---

## 27. Decisiones MVP

```text id="dk-mvp-decisions"
1. Dashboard and KPIs será read-only.
2. KPIs serán derivados de módulos fuente.
3. No habrá SQL personalizado por usuario.
4. No habrá fórmula ejecutable por usuario.
5. No habrá dashboards públicos.
6. No habrá acceso desde WordPress público.
7. Widgets estarán definidos por catálogo.
8. Métricas estarán definidas por catálogo.
9. Configuración tenant será limitada.
10. Cache será opcional y tenant-scoped.
11. Exports usarán Secure Document Storage.
12. Snapshots no reemplazarán datos transaccionales.
13. Resident dashboard se manejará en 030-resident-self-service-basic.
14. IA externa con datos reales queda prohibida.
```

---

## 28. OpenAPI preliminar

Tags esperados:

```text id="dk-openapi-tags"
Platform Dashboard Definitions
Platform Dashboard Widget Definitions
Platform Dashboard Metric Definitions
Tenant Dashboards
Tenant Dashboard Widgets
Tenant Dashboard KPIs
Tenant Dashboard Snapshots
Tenant Dashboard Exports
```

Extensiones esperadas:

```yaml id="dk-openapi-extensions"
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

---

## 29. Criterios de aceptación

```text id="dk-acceptance"
[ ] El módulo permite listar dashboards disponibles.
[ ] El módulo permite consultar dashboard ejecutivo.
[ ] El módulo permite consultar dashboard financiero con permisos.
[ ] El módulo permite consultar dashboard operativo.
[ ] El módulo permite consultar dashboard de residentes/unidades.
[ ] El módulo permite consultar dashboard de mantenimiento.
[ ] El módulo permite consultar dashboard de accesos con permisos.
[ ] El módulo permite consultar dashboard de reuniones/gobernanza.
[ ] El módulo permite consultar dashboard de comunicaciones/automatizaciones.
[ ] El módulo permite configurar widgets por tenant.
[ ] El módulo permite generar snapshots.
[ ] El módulo permite exportar dashboards vía SDS.
[ ] El módulo calcula KPIs por periodo.
[ ] El módulo compara contra periodo anterior.
[ ] El módulo marca fuentes fallidas como partial/unavailable.
[ ] El módulo no acepta tenantId desde cliente.
[ ] El módulo no acepta rawSql.
[ ] El módulo no acepta scripts.
[ ] El módulo no acepta fórmulas ejecutables.
[ ] El módulo no expone storageKey.
[ ] El módulo no expone endpoints públicos.
[ ] El módulo no permite acceso desde WordPress público.
[ ] El módulo no modifica datos transaccionales.
[ ] El módulo no ejecuta pagos.
[ ] El módulo no crea asientos contables.
[ ] El módulo no confirma conciliaciones.
[ ] El módulo no controla hardware.
[ ] El módulo no envía datos reales a IA externa.
```

---

## 30. No aceptación

No se acepta el módulo si:

```text id="dk-no-acceptance"
- mezcla datos de tenants;
- permite dashboard cross-tenant;
- permite widget cross-tenant;
- permite snapshot cross-tenant;
- permite export cross-tenant;
- acepta tenantId desde cliente;
- acepta actor fields desde cliente;
- acepta rawSql;
- acepta SQL personalizado;
- acepta script;
- acepta JavaScript configurable;
- acepta formulaCode ejecutable;
- usa eval;
- usa Function constructor;
- permite widget con métrica fuera de catálogo;
- permite métrica con fuente no controlada;
- expone storageKey;
- devuelve signedUrl persistente;
- crea endpoints públicos;
- permite acceso desde WordPress público;
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
- trata snapshot como fuente de verdad;
- oculta falla de fuente mostrando cero silenciosamente.
```

---

## 31. Resultado esperado

Al implementar `027-dashboard-kpis`, RESIDENT Core contará con una capa de visualización ejecutiva y operativa para tomar decisiones administrativas sin comprometer la integridad transaccional, la privacidad ni el aislamiento multitenant.

Resultado esperado:

```text id="dk-expected-result"
dashboard definitions definidas
widget definitions definidas
metric definitions definidas
tenant dashboard configuration definida
tenant widget configuration definida
executive dashboard definido
financial dashboard definido
operations dashboard definido
residents units dashboard definido
maintenance dashboard definido
access visitors dashboard definido
governance dashboard definido
communications automation dashboard definido
KPI catalog definido
role-aware visibility definida
period filters definidos
comparison periods definidos
thresholds definidos
snapshots definidos
exports vía SDS definidos
cache tenant-scoped definido
audit definido
observability definida
OpenAPI preliminar definido
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

## 32. Expediente actualizado

```text id="dk-expediente"
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
│   │       └── spec.md
```
