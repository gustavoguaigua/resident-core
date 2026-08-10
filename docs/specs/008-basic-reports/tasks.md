# Tasks — Spec 008 Basic Reports and Operational Dashboards

## 1. Información del documento

| Campo           | Valor                                                                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Proyecto        | RESIDENT Core                                                                                                                        |
| Spec ID         | 008                                                                                                                                  |
| Módulo          | Basic Reports                                                                                                                        |
| Documento       | Implementation Tasks                                                                                                                 |
| Ruta            | `docs/specs/008-basic-reports/tasks.md`                                                                                              |
| Versión         | 0.1                                                                                                                                  |
| Estado          | needs-review                                                                                                                         |
| Fecha           | 2026-07-14                                                                                                                           |
| Documento base  | `docs/specs/008-basic-reports/spec.md`                                                                                               |
| Plan técnico    | `docs/specs/008-basic-reports/plan.md`                                                                                               |
| Modelo de datos | `docs/specs/008-basic-reports/data-model.md`                                                                                         |
| Contrato API    | `docs/specs/008-basic-reports/api-contract.md`                                                                                       |
| Plan de pruebas | `docs/specs/008-basic-reports/test-plan.md`                                                                                          |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements`, `007-audit` |

---

## 2. Propósito

Este documento convierte la spec `008-basic-reports` en una lista ejecutable de tareas para implementar el módulo de reportes básicos operativos y financieros de RESIDENT Core.

El módulo debe permitir:

* consultar resumen operativo;
* consultar resumen financiero;
* consultar unidades habitacionales;
* consultar propietarios y residentes;
* consultar cargos por periodo;
* consultar pagos por periodo;
* consultar pagos pendientes de validación;
* consultar saldos;
* consultar estados de cuenta;
* consultar morosidad básica;
* consultar recaudación;
* consultar actividad administrativa;
* exportar reportes en JSON;
* exportar reportes en CSV;
* auditar exportaciones;
* proteger reportes financieros;
* proteger reportes con datos personales;
* mantener aislamiento multitenant;
* evitar modificaciones a datos fuente.

Regla central:

```text id="d1gk6x"
Los reportes básicos son consultas derivadas, read-only, tenant-scoped y autorizadas; no son una segunda fuente de verdad ni un mecanismo para modificar datos transaccionales.
```

---

## 3. Convenciones de estado

Usar:

```text id="uqqw3m"
[ ] Pending
[/] In Progress
[x] Done
[!] Blocked
[-] Deferred
```

Regla:

```text id="bt6arv"
No marcar una tarea como [x] hasta que exista evidencia real de implementación, prueba, revisión o commit.
```

---

## 4. Reglas obligatorias de ejecución

Antes de implementar código, revisar:

```text id="kbvtn6"
docs/sdd/constitution.md
docs/sdd/domain-map.md
docs/sdd/architecture.md
docs/sdd/security.md
docs/sdd/api-guidelines.md
docs/sdd/data-governance.md
docs/decisions/ADR-003-database-strategy.md
docs/decisions/ADR-004-multitenancy-strategy.md
docs/decisions/ADR-007-authorization-strategy.md
docs/decisions/ADR-010-observability-strategy.md
docs/decisions/ADR-011-testing-strategy.md
docs/decisions/ADR-012-ci-cd-strategy.md
docs/specs/001-tenants/
docs/specs/002-users-roles/
docs/specs/003-residents-properties/
docs/specs/004-dues-fees/
docs/specs/005-payments/
docs/specs/006-account-statements/
docs/specs/007-audit/
docs/specs/008-basic-reports/
```

Reglas de implementación:

```text id="uey6z8"
1. El módulo reports debe ser read-only.
2. No debe crear cargos.
3. No debe modificar cargos.
4. No debe confirmar pagos.
5. No debe rechazar pagos.
6. No debe reversar pagos.
7. No debe asignar pagos.
8. No debe generar estados de cuenta.
9. No debe publicar estados de cuenta.
10. No debe cerrar estados de cuenta.
11. No debe recalcular balances.
12. No debe modificar audit_logs.
13. Todo reporte debe filtrar por tenantId.
14. Ningún endpoint tenant debe aceptar tenantId desde query/body.
15. Los reportes financieros requieren reports.readFinancial.
16. Los reportes personales requieren reports.readPersonalData.
17. Los reportes de actividad requieren reports.readActivity o audit.read.
18. Toda exportación requiere permiso de exportación.
19. Toda exportación financiera requiere reports.exportFinancial.
20. Toda exportación de datos personales requiere reports.exportPersonalData.
21. Toda exportación de actividad requiere reports.exportActivity.
22. Toda exportación debe auditarse.
23. Todo monto debe manejarse con Decimal.
24. Todo monto debe exponerse como string.
25. No usar float/double para dinero.
26. Cargos cancelados/reversados no deben contar como deuda activa.
27. Pagos reversados no deben contar como recaudación activa.
28. Payment allocations reversadas no deben contar como pagos aplicados.
29. Pagos no asignados deben mostrarse separados.
30. Reportes detallados deben paginar.
31. sortBy debe validarse por whitelist.
32. CSV export debe neutralizar fórmula injection.
33. No implementar BI avanzado en esta spec.
34. No implementar PDF avanzado en esta spec.
35. No implementar envío automático en esta spec.
36. No implementar reportes con IA en esta spec.
```

---

## 5. Entregables esperados

Documentación:

```text id="r3l56c"
docs/specs/008-basic-reports/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

Backend:

```text id="zzfa1j"
apps/api/src/modules/reports/
├── reports.module.ts
├── reports.controller.ts
├── reports-export.controller.ts
├── application/
├── domain/
├── infrastructure/
├── policies/
├── dto/
└── tests/
```

---

# 6. Fase 0 — Preparación documental

## TASK-001 — Crear carpeta de spec

**Estado:** `[ ] Pending`

### Ruta

```text id="fjcbo4"
docs/specs/008-basic-reports/
```

### Criterios de aceptación

* Carpeta creada.
* Sigue estructura de specs anteriores.
* No reemplaza documentos de specs `001` a `007`.

---

## TASK-002 — Registrar spec funcional

**Estado:** `[ ] Pending`

### Archivo

```text id="rg3d0t"
docs/specs/008-basic-reports/spec.md
```

### Criterios de aceptación

* Define propósito.
* Define alcance.
* Define reportes MVP.
* Define actores.
* Define reglas de negocio.
* Define permisos.
* Define API preliminar.
* Define riesgos.
* Define criterios de aceptación.

---

## TASK-003 — Registrar plan técnico

**Estado:** `[ ] Pending`

### Archivo

```text id="usn48n"
docs/specs/008-basic-reports/plan.md
```

### Criterios de aceptación

* Define arquitectura del módulo.
* Define estructura de carpetas.
* Define servicios.
* Define casos de uso.
* Define puertos.
* Define controladores.
* Define estrategia de exportación.
* Define diferidos.

---

## TASK-004 — Registrar modelo de datos

**Estado:** `[ ] Pending`

### Archivo

```text id="xqj6nx"
docs/specs/008-basic-reports/data-model.md
```

### Criterios de aceptación

* Define que no hay tablas obligatorias MVP.
* Define fuentes por reporte.
* Define modelos conceptuales.
* Define vistas conceptuales.
* Define reglas financieras.
* Define reglas de exportación.
* Define índices requeridos en tablas fuente.
* Define modelos futuros diferidos.

---

## TASK-005 — Registrar contrato API

**Estado:** `[ ] Pending`

### Archivo

```text id="gxlxmy"
docs/specs/008-basic-reports/api-contract.md
```

### Criterios de aceptación

* Define endpoints.
* Define query params.
* Define response DTOs.
* Define permisos.
* Define exportaciones.
* Define errores.
* Define OpenAPI esperado.

---

## TASK-006 — Registrar plan de pruebas

**Estado:** `[ ] Pending`

### Archivo

```text id="s0cfap"
docs/specs/008-basic-reports/test-plan.md
```

### Criterios de aceptación

* Define unit tests.
* Define integration tests.
* Define API tests.
* Define authorization tests.
* Define multitenancy tests.
* Define financial regression tests.
* Define export tests.
* Define security tests.

---

## TASK-007 — Registrar tareas

**Estado:** `[ ] Pending`

### Archivo

```text id="jp80w4"
docs/specs/008-basic-reports/tasks.md
```

### Criterios de aceptación

* Tareas ordenadas por fases.
* Criterios claros.
* Diferidos documentados.
* Definition of Done incluida.

---

## TASK-008 — Registrar notas de seguridad

**Estado:** `[ ] Pending`

### Archivo

```text id="k7rbbb"
docs/specs/008-basic-reports/security-notes.md
```

### Criterios de aceptación

* Identifica riesgos de reportes financieros.
* Identifica riesgos de datos personales.
* Identifica riesgos de exportación.
* Define controles multitenant.
* Define controles de CSV injection.
* Define controles de auditoría.
* Define controles de logs y métricas.

---

# 7. Fase 1 — Estructura base del módulo

## TASK-009 — Crear módulo NestJS `reports`

**Estado:** `[ ] Pending`

### Archivo

```text id="y70nsa"
apps/api/src/modules/reports/reports.module.ts
```

### Criterios de aceptación

* Módulo compila.
* Está registrado en `AppModule`.
* No contiene lógica de negocio.
* Expone providers necesarios.
* Puede importar puertos de lectura y auditoría.

---

## TASK-010 — Crear estructura de carpetas

**Estado:** `[ ] Pending`

### Estructura

```text id="aragdv"
apps/api/src/modules/reports/
├── application/
│   ├── use-cases/
│   ├── services/
│   └── ports/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   └── errors/
├── infrastructure/
│   ├── persistence/
│   ├── export/
│   └── audit/
├── policies/
├── dto/
└── tests/
```

### Criterios de aceptación

* Estructura creada.
* Dominio no depende de Prisma.
* Controladores no usan Prisma directamente.
* Los servicios de reportes son read-only.

---

## TASK-011 — Crear controladores base

**Estado:** `[ ] Pending`

### Archivos

```text id="paq5v6"
reports.controller.ts
reports-export.controller.ts
```

### Criterios de aceptación

* Compilan.
* Están registrados en `ReportsModule`.
* Definen rutas base correctas.
* No contienen lógica de negocio.
* Invocan casos de uso.

---

# 8. Fase 2 — Value Objects

## TASK-012 — Implementar `ReportKey`

**Estado:** `[ ] Pending`

### Archivo

```text id="kc80md"
domain/value-objects/report-key.vo.ts
```

### Criterios de aceptación

* Valida reportes MVP.
* Rechaza claves desconocidas.
* Rechaza valores vacíos.
* Rechaza caracteres peligrosos.
* Tiene unit tests.

---

## TASK-013 — Implementar `ReportCategory`

**Estado:** `[ ] Pending`

### Archivo

```text id="o6j5ol"
domain/value-objects/report-category.vo.ts
```

### Criterios de aceptación

* Valida `operational`.
* Valida `financial`.
* Valida `personalData`.
* Valida `activity`.
* Valida `mixed`.
* Tiene unit tests.

---

## TASK-014 — Implementar `ReportFormat`

**Estado:** `[ ] Pending`

### Archivo

```text id="tcuh8q"
domain/value-objects/report-format.vo.ts
```

### Criterios de aceptación

* Valida `json`.
* Valida `csv`.
* Rechaza `pdf`.
* Rechaza `xlsx`.
* Tiene unit tests.

---

## TASK-015 — Implementar `ReportPeriod`

**Estado:** `[ ] Pending`

### Archivo

```text id="z4p76o"
domain/value-objects/report-period.vo.ts
```

### Criterios de aceptación

* Valida `periodCode` formato `YYYY-MM`.
* Valida `billingPeriodId`.
* Valida coincidencia entre `periodCode` y `billingPeriodId` cuando ambos existen.
* Tiene unit tests.

---

## TASK-016 — Implementar `ReportDateRange`

**Estado:** `[ ] Pending`

### Archivo

```text id="r9f28b"
domain/value-objects/report-date-range.vo.ts
```

### Criterios de aceptación

* Valida `dateFrom <= dateTo`.
* Valida fechas ISO.
* Valida rango máximo configurable.
* Tiene unit tests.

---

## TASK-017 — Implementar `ReportMoney`

**Estado:** `[ ] Pending`

### Archivo

```text id="xjy065"
domain/value-objects/report-money.vo.ts
```

### Criterios de aceptación

* Usa Decimal.
* Expone string.
* Rechaza float.
* Soporta suma, resta y división controlada.
* Tiene unit tests.

---

## TASK-018 — Implementar `ReportPagination`

**Estado:** `[ ] Pending`

### Archivo

```text id="cukl4i"
domain/value-objects/report-pagination.vo.ts
```

### Criterios de aceptación

* `page` default 1.
* `pageSize` default 20.
* `pageSize` máximo 100.
* Calcula `totalPages`.
* Tiene unit tests.

---

## TASK-019 — Implementar `ReportSort`

**Estado:** `[ ] Pending`

### Archivo

```text id="uc7nd0"
domain/value-objects/report-sort.vo.ts
```

### Criterios de aceptación

* Valida `sortBy` por whitelist.
* Valida `sortOrder`.
* Rechaza ordenamiento arbitrario.
* Rechaza sort financiero sin permiso cuando aplique.
* Tiene unit tests.

---

# 9. Fase 3 — Entidades de dominio

## TASK-020 — Implementar entidad `ReportResult`

**Estado:** `[ ] Pending`

### Archivo

```text id="cvv9ju"
domain/entities/report-result.entity.ts
```

### Criterios de aceptación

* Requiere `reportKey`.
* Requiere `tenantId`.
* Requiere `generatedAt`.
* Soporta `summary`.
* Soporta `totals`.
* Soporta `rows`.
* Soporta `warnings`.
* No permite datos cross-tenant.
* Tiene unit tests.

---

## TASK-021 — Implementar entidad `ReportRow`

**Estado:** `[ ] Pending`

### Archivo

```text id="xbb87w"
domain/entities/report-row.entity.ts
```

### Criterios de aceptación

* Representa fila serializable.
* Soporta columnas autorizadas.
* Compatible con CSV.
* No expone campos no contratados.
* Tiene unit tests básicos.

---

## TASK-022 — Implementar entidad `ReportContext`

**Estado:** `[ ] Pending`

### Archivo

```text id="e73azu"
domain/entities/report-context.entity.ts
```

### Criterios de aceptación

* Requiere `tenantId`.
* Incluye actor.
* Incluye permisos.
* Incluye reportKey.
* Incluye traceId/requestId/correlationId.
* No contiene payload.
* Tiene unit tests.

---

## TASK-023 — Implementar entidad `ReportExport`

**Estado:** `[ ] Pending`

### Archivo

```text id="ze5x5c"
domain/entities/report-export.entity.ts
```

### Criterios de aceptación

* Requiere reportKey.
* Requiere tenantId.
* Requiere formato.
* Requiere rowCount.
* No persiste en tabla MVP.
* No incluye contenido completo en metadata de auditoría.
* Tiene unit tests.

---

## TASK-024 — Implementar eventos internos de reportes

**Estado:** `[ ] Pending`

### Archivos

```text id="tx77oh"
report-viewed-sensitive.event.ts
report-exported.event.ts
financial-report-exported.event.ts
personal-data-report-exported.event.ts
activity-report-exported.event.ts
report-access-denied.event.ts
```

### Criterios de aceptación

* Incluyen tenantId.
* Incluyen actorUserId.
* Incluyen reportKey.
* Incluyen traceId.
* No incluyen resultado completo.
* No incluyen CSV completo.
* No incluyen datos personales innecesarios.

---

## TASK-025 — Implementar errores de dominio

**Estado:** `[ ] Pending`

### Archivos

```text id="xu8l0z"
report-not-found.error.ts
report-forbidden.error.ts
report-financial-permission-required.error.ts
report-personal-data-permission-required.error.ts
report-activity-permission-required.error.ts
report-export-forbidden.error.ts
report-export-format-not-supported.error.ts
report-export-too-large.error.ts
report-invalid-filter.error.ts
report-invalid-date-range.error.ts
report-invalid-period.error.ts
report-invalid-sort.error.ts
report-invalid-money-filter.error.ts
report-cross-tenant-reference.error.ts
```

### Criterios de aceptación

* Cada error tiene código estable.
* Cada error mapea a HTTP status.
* No expone SQL.
* No expone stack trace.
* No expone datos sensibles.

---

# 10. Fase 4 — DTOs y validación

## TASK-026 — Crear DTOs comunes

**Estado:** `[ ] Pending`

### Archivos

```text id="kgpaz9"
common-report-query.dto.ts
report-response.dto.ts
paginated-report-response.dto.ts
report-warning.dto.ts
```

### Criterios de aceptación

* Valida fechas.
* Valida periodCode.
* Valida page/pageSize.
* Valida sortBy/sortOrder.
* Incluye traceId en meta.

---

## TASK-027 — Crear DTOs financieros

**Estado:** `[ ] Pending`

### Archivos

```text id="fih2cs"
financial-report-query.dto.ts
financial-overview-report.dto.ts
charges-summary-report.dto.ts
payments-summary-report.dto.ts
balances-summary-report.dto.ts
account-statements-summary-report.dto.ts
collection-summary-report.dto.ts
```

### Criterios de aceptación

* Valida filtros financieros.
* Valida money filters como string decimal.
* Define montos como string.
* No usa number para dinero.

---

## TASK-028 — Crear DTOs de unidades

**Estado:** `[ ] Pending`

### Archivos

```text id="fa68fl"
property-units-report-query.dto.ts
property-unit-report-row.dto.ts
property-units-report.dto.ts
```

### Criterios de aceptación

* Valida status.
* Valida unitType.
* Valida hasDebt/hasCredit/overdueOnly.
* Valida includeBalances.
* Valida paginación.
* Valida sort permitido.

---

## TASK-029 — Crear DTOs de residentes y propietarios

**Estado:** `[ ] Pending`

### Archivos

```text id="h3uc5h"
residents-owners-report-query.dto.ts
resident-owner-report-row.dto.ts
residents-owners-report.dto.ts
```

### Criterios de aceptación

* Valida relationshipType.
* Valida propertyUnitId.
* Valida includeEnded.
* No incluye identificación/email/teléfono en MVP.
* Valida paginación.

---

## TASK-030 — Crear DTOs de pagos pendientes

**Estado:** `[ ] Pending`

### Archivos

```text id="y42o10"
pending-payment-validation-query.dto.ts
pending-payment-validation-row.dto.ts
pending-payment-validation-report.dto.ts
```

### Criterios de aceptación

* Valida fechas.
* Valida method.
* Valida receiptStatus.
* Valida daysPendingMin.
* No incluye comprobante completo.

---

## TASK-031 — Crear DTOs de morosidad

**Estado:** `[ ] Pending`

### Archivos

```text id="x5yh9g"
delinquency-report-query.dto.ts
delinquency-report-row.dto.ts
delinquency-report.dto.ts
```

### Criterios de aceptación

* Valida `minOverdueBalance`.
* Valida `daysOverdueMin`.
* Valida periodo.
* Valida paginación.
* Montos como string.

---

## TASK-032 — Crear DTOs de actividad

**Estado:** `[ ] Pending`

### Archivos

```text id="qpn9w8"
activity-report-query.dto.ts
activity-report-row.dto.ts
activity-report.dto.ts
```

### Criterios de aceptación

* Valida action.
* Valida category.
* Valida outcome.
* Valida actorUserId.
* No expone oldValue/newValue/metadata.

---

## TASK-033 — Crear DTOs de exportación

**Estado:** `[ ] Pending`

### Archivos

```text id="p9uqhu"
export-report-query.dto.ts
report-export-response.dto.ts
```

### Criterios de aceptación

* Valida reportKey.
* Valida format json/csv.
* Rechaza pdf/xlsx.
* Valida filtros por reporte.
* Incluye rowCount.
* No incluye columnas no autorizadas.

---

# 11. Fase 5 — Persistencia y repositorios read-only

## TASK-034 — Confirmar que no hay migración obligatoria

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Se documenta que no hay tablas nuevas obligatorias.
* No se crea `report_snapshots` en MVP.
* No se crea `report_exports` en MVP.
* No se crea `scheduled_reports` en MVP.
* No se crea `report_templates` en MVP.

---

## TASK-035 — Crear `ReportsReaderPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="gm9k48"
application/ports/reports-reader.port.ts
```

### Criterios de aceptación

* Define métodos para todos los reportes MVP.
* Es read-only.
* No depende de Prisma.
* Recibe ReportContext.

---

## TASK-036 — Crear puertos especializados

**Estado:** `[ ] Pending`

### Archivos

```text id="p71fgo"
tenant-report-reader.port.ts
property-report-reader.port.ts
financial-report-reader.port.ts
payments-report-reader.port.ts
account-statements-report-reader.port.ts
audit-report-reader.port.ts
report-export.port.ts
report-audit.port.ts
```

### Criterios de aceptación

* Separan responsabilidades.
* No exponen operaciones de escritura.
* No dependen de infraestructura.

---

## TASK-037 — Implementar `PrismaReportsReaderRepository`

**Estado:** `[ ] Pending`

### Archivo

```text id="opqbgz"
infrastructure/persistence/prisma-reports-reader.repository.ts
```

### Criterios de aceptación

* Ejecuta consultas read-only.
* Filtra por tenantId.
* Evita N+1.
* Usa Decimal.
* No modifica datos.
* Tiene integration tests.

---

## TASK-038 — Implementar mapper de reportes

**Estado:** `[ ] Pending`

### Archivo

```text id="rza69a"
infrastructure/persistence/reports.mapper.ts
```

### Criterios de aceptación

* Convierte resultados DB a DTOs.
* Convierte Decimal a string.
* Oculta campos no autorizados.
* No expone datos personales sin permiso.
* No expone comprobantes.

---

## TASK-039 — Validar índices en tablas fuente

**Estado:** `[ ] Pending`

### Tablas

```text id="hw0qy5"
property_units
persons
property_ownerships
residencies
charges
payments
payment_allocations
unit_balances
account_statements
audit_logs
```

### Criterios de aceptación

* Índices existentes revisados.
* Índices faltantes documentados.
* No se agregan índices sin ADR/migración correspondiente.
* Reportes críticos tienen queries eficientes.

---

# 12. Fase 6 — Servicios de aplicación

## TASK-040 — Implementar `ReportPermissionPolicyService`

**Estado:** `[ ] Pending`

### Archivo

```text id="i2gfcz"
application/services/report-permission-policy.service.ts
```

### Criterios de aceptación

* Mapea reportKey a permiso.
* Valida reportes financieros.
* Valida reportes personales.
* Valida reportes de actividad.
* Valida exportación.
* Respeta separación de funciones.
* Tiene tests.

---

## TASK-041 — Implementar `ReportFilterValidatorService`

**Estado:** `[ ] Pending`

### Archivo

```text id="p09tpq"
application/services/report-filter-validator.service.ts
```

### Criterios de aceptación

* Valida periodCode.
* Valida billingPeriodId del tenant.
* Valida date range.
* Valida rango máximo.
* Valida sort whitelist.
* Valida pageSize.
* Tiene tests.

---

## TASK-042 — Implementar `ReportMoneyService`

**Estado:** `[ ] Pending`

### Archivo

```text id="soehw4"
application/services/report-money.service.ts
```

### Criterios de aceptación

* Usa Decimal.
* Convierte a string.
* Suma exacta.
* Resta exacta.
* Calcula collectionRate.
* Rechaza float.
* Tiene tests.

---

## TASK-043 — Implementar `OperationalReportsService`

**Estado:** `[ ] Pending`

### Archivo

```text id="iots1l"
application/services/operational-reports.service.ts
```

### Criterios de aceptación

* Cuenta unidades.
* Cuenta propietarios.
* Cuenta residentes.
* Cuenta vehículos.
* Cuenta mascotas.
* Cuenta usuarios activos.
* Cuenta invitaciones pendientes.
* No expone datos personales detallados.
* Tiene tests.

---

## TASK-044 — Implementar `FinancialReportsService`

**Estado:** `[ ] Pending`

### Archivo

```text id="hub5o2"
application/services/financial-reports.service.ts
```

### Criterios de aceptación

* Calcula resumen financiero.
* Calcula cargos.
* Calcula pagos.
* Calcula saldos.
* Calcula morosidad.
* Calcula recaudación.
* Excluye cancelados/reversados según regla.
* Usa Decimal.
* Tiene tests.

---

## TASK-045 — Implementar `PropertyReportsService`

**Estado:** `[ ] Pending`

### Archivo

```text id="m3pp61"
application/services/property-reports.service.ts
```

### Criterios de aceptación

* Lista unidades.
* Cuenta propietarios/residentes por unidad.
* Incluye saldos solo con permiso financiero.
* Filtra por status/unitType/deuda.
* Pagina.
* Tiene tests.

---

## TASK-046 — Implementar `ActivityReportsService`

**Estado:** `[ ] Pending`

### Archivo

```text id="wq7uo7"
application/services/activity-reports.service.ts
```

### Criterios de aceptación

* Lee audit_logs.
* Filtra por fecha/action/category/actor.
* No expone oldValue/newValue/metadata.
* Respeta permisos.
* Pagina.
* Tiene tests.

---

## TASK-047 — Implementar `ReportExportService`

**Estado:** `[ ] Pending`

### Archivo

```text id="mhv4vk"
application/services/report-export.service.ts
```

### Criterios de aceptación

* Exporta JSON.
* Exporta CSV.
* Aplica columnas permitidas.
* Protege CSV contra fórmula injection.
* Limita filas.
* Respeta permisos.
* Tiene tests.

---

## TASK-048 — Implementar `ReportAuditService`

**Estado:** `[ ] Pending`

### Archivo

```text id="tkl98u"
application/services/report-audit.service.ts
```

### Criterios de aceptación

* Audita exportaciones.
* Audita consultas sensibles si aplica.
* Audita accesos denegados relevantes.
* Usa `007-audit`.
* No registra resultado completo.
* Tiene tests.

---

# 13. Fase 7 — Casos de uso

## TASK-049 — Implementar `GetOperationalOverviewReportUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="q184g2"
GET /api/v1/tenant/reports/operational-overview
```

### Criterios de aceptación

* Valida `reports.read`.
* Usa tenant activo.
* Devuelve conteos.
* Incluye generatedAt.
* No incluye datos de otro tenant.
* Tiene tests.

---

## TASK-050 — Implementar `GetFinancialOverviewReportUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="qc6lr9"
GET /api/v1/tenant/reports/financial-overview
```

### Criterios de aceptación

* Valida `reports.readFinancial`.
* Resuelve periodo.
* Calcula cargos/pagos/saldos.
* Montos como string.
* Usa Decimal.
* Tiene tests.

---

## TASK-051 — Implementar `GetPropertyUnitsReportUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="jzlsxp"
GET /api/v1/tenant/reports/property-units
```

### Criterios de aceptación

* Valida `reports.read`.
* Incluye saldos solo con `reports.readFinancial`.
* Filtra.
* Pagina.
* Tiene tests.

---

## TASK-052 — Implementar `GetResidentsOwnersReportUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="cc9g1c"
GET /api/v1/tenant/reports/residents-owners
```

### Criterios de aceptación

* Valida `reports.readPersonalData`.
* Lista relaciones.
* No expone identificación/email/teléfono en MVP.
* Filtra y pagina.
* Tiene tests.

---

## TASK-053 — Implementar `GetChargesSummaryReportUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="gjnh1f"
GET /api/v1/tenant/reports/charges/summary
```

### Criterios de aceptación

* Valida `reports.readFinancial`.
* Agrupa por concepto.
* Excluye cancelados/reversados de deuda activa.
* Montos como string.
* Tiene tests.

---

## TASK-054 — Implementar `GetPaymentsSummaryReportUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="wuqmoh"
GET /api/v1/tenant/reports/payments/summary
```

### Criterios de aceptación

* Valida `reports.readFinancial`.
* Suma pagos por estado.
* Excluye reversados de recaudación activa.
* Separa no asignados.
* Agrupa por método.
* Tiene tests.

---

## TASK-055 — Implementar `GetPendingPaymentValidationReportUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="qij5y1"
GET /api/v1/tenant/reports/payments/pending-validation
```

### Criterios de aceptación

* Valida `reports.readFinancial`.
* Lista pagos reported/pendingValidation.
* Calcula daysPending.
* No incluye comprobante.
* Pagina.
* Tiene tests.

---

## TASK-056 — Implementar `GetBalancesSummaryReportUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="q3u907"
GET /api/v1/tenant/reports/balances/summary
```

### Criterios de aceptación

* Valida `reports.readFinancial`.
* Usa `unit_balances`.
* Suma saldos.
* Advierte stale balances.
* Montos como string.
* Tiene tests.

---

## TASK-057 — Implementar `GetAccountStatementsSummaryReportUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="jhrkj7"
GET /api/v1/tenant/reports/account-statements/summary
```

### Criterios de aceptación

* Valida `reports.readFinancial`.
* Cuenta por estado.
* Excluye archived por defecto.
* Distingue superseded.
* Montos como string.
* Tiene tests.

---

## TASK-058 — Implementar `GetDelinquencyReportUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="x0z9g7"
GET /api/v1/tenant/reports/delinquency
```

### Criterios de aceptación

* Valida `reports.readFinancial`.
* Lista unidades con mora.
* Calcula oldestDueDate.
* Calcula daysOverdue.
* Excluye cancelados/reversados.
* Pagina.
* Tiene tests.

---

## TASK-059 — Implementar `GetCollectionSummaryReportUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="qwkfe4"
GET /api/v1/tenant/reports/collections/summary
```

### Criterios de aceptación

* Valida `reports.readFinancial`.
* Calcula confirmed/allocated/unallocated.
* Calcula collectionRate.
* Si chargesIssued = 0, collectionRate null.
* Agrupa por método.
* Tiene tests.

---

## TASK-060 — Implementar `GetAdministrativeActivityReportUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="sms2sj"
GET /api/v1/tenant/reports/activity
```

### Criterios de aceptación

* Valida `reports.readActivity` o `audit.read`.
* Lee audit_logs.
* No expone oldValue/newValue/metadata.
* Filtra.
* Pagina.
* Tiene tests.

---

## TASK-061 — Implementar `ExportReportUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="xkssxu"
GET /api/v1/tenant/reports/{reportKey}/export
```

### Criterios de aceptación

* Valida reportKey.
* Valida permisos de export.
* Valida permisos por categoría.
* Ejecuta reporte.
* Limita filas.
* Exporta JSON/CSV.
* Protege CSV.
* Audita exportación.
* Tiene tests.

---

# 14. Fase 8 — Guards, policies y autorización

## TASK-062 — Reutilizar `AuthGuard`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Bloquea no autenticados.
* Bloquea usuarios deshabilitados.
* Provee UserProfile.

---

## TASK-063 — Reutilizar `TenantGuard`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Resuelve tenant activo.
* Valida membership activa.
* Bloquea tenant suspendido según política.
* No confía solo en header.

---

## TASK-064 — Reutilizar `TenantPermissionGuard`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida permisos tenant.
* Compatible con permisos `reports.*`.
* No permite permisos platform como sustituto.

---

## TASK-065 — Crear `ReportPermissionGuard`

**Estado:** `[ ] Pending`

### Archivo

```text id="qrtv8i"
policies/report-permission.guard.ts
```

### Criterios de aceptación

* Lee metadata de permiso requerido.
* Valida permiso base.
* Soporta reportKey.
* Tiene tests.

---

## TASK-066 — Crear `FinancialReportGuard`

**Estado:** `[ ] Pending`

### Archivo

```text id="m8q1i3"
policies/financial-report.guard.ts
```

### Criterios de aceptación

* Valida `reports.readFinancial`.
* Valida `reports.exportFinancial` en export.
* Bloquea sin permiso.
* Tiene tests.

---

## TASK-067 — Crear `PersonalDataReportGuard`

**Estado:** `[ ] Pending`

### Archivo

```text id="tvk9jk"
policies/personal-data-report.guard.ts
```

### Criterios de aceptación

* Valida `reports.readPersonalData`.
* Valida `reports.exportPersonalData` en export.
* Bloquea sin permiso.
* Tiene tests.

---

## TASK-068 — Crear `ReportExportGuard`

**Estado:** `[ ] Pending`

### Archivo

```text id="d2bbpv"
policies/report-export.guard.ts
```

### Criterios de aceptación

* Valida `reports.export`.
* Valida permiso específico según categoría.
* Bloquea export financiero sin permiso financiero.
* Bloquea export personal sin permiso personal.
* Bloquea export activity sin permiso de actividad.
* Tiene tests.

---

## TASK-069 — Crear decorators de permisos reports

**Estado:** `[ ] Pending`

### Decorators sugeridos

```text id="ct2k70"
@RequireReportPermission()
@RequireFinancialReportPermission()
@RequirePersonalDataReportPermission()
@RequireReportExportPermission()
```

### Criterios de aceptación

* Exponen metadata.
* No contienen lógica de negocio.
* Compatibles con OpenAPI.
* Tienen tests básicos.

---

# 15. Fase 9 — Controladores y endpoints

## TASK-070 — Implementar `ReportsController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="pgmnk5"
GET /api/v1/tenant/reports/operational-overview
GET /api/v1/tenant/reports/financial-overview
GET /api/v1/tenant/reports/property-units
GET /api/v1/tenant/reports/residents-owners
GET /api/v1/tenant/reports/charges/summary
GET /api/v1/tenant/reports/payments/summary
GET /api/v1/tenant/reports/payments/pending-validation
GET /api/v1/tenant/reports/balances/summary
GET /api/v1/tenant/reports/account-statements/summary
GET /api/v1/tenant/reports/delinquency
GET /api/v1/tenant/reports/collections/summary
GET /api/v1/tenant/reports/activity
```

### Criterios de aceptación

* Usa guards.
* Usa DTOs.
* Usa casos de uso.
* No usa Prisma directo.
* No permite métodos de escritura.
* Tiene API tests.

---

## TASK-071 — Implementar `ReportsExportController`

**Estado:** `[ ] Pending`

### Endpoint

```text id="svdpss"
GET /api/v1/tenant/reports/:reportKey/export
```

### Criterios de aceptación

* Usa ReportExportGuard.
* Valida reportKey.
* Valida formato.
* Usa ExportReportUseCase.
* Devuelve JSON/CSV.
* Tiene API tests.

---

# 16. Fase 10 — Errores y responses

## TASK-072 — Mapear errores a HTTP

**Estado:** `[ ] Pending`

### Mapeos

```text id="oshg9s"
REPORT_NOT_FOUND -> 404
REPORT_FORBIDDEN -> 403
REPORT_FINANCIAL_PERMISSION_REQUIRED -> 403
REPORT_PERSONAL_DATA_PERMISSION_REQUIRED -> 403
REPORT_ACTIVITY_PERMISSION_REQUIRED -> 403
REPORT_EXPORT_FORBIDDEN -> 403
REPORT_EXPORT_FORMAT_NOT_SUPPORTED -> 422
REPORT_EXPORT_TOO_LARGE -> 422
REPORT_INVALID_FILTER -> 422
REPORT_INVALID_DATE_RANGE -> 422
REPORT_INVALID_PERIOD -> 422
REPORT_INVALID_SORT -> 422
REPORT_INVALID_MONEY_FILTER -> 422
REPORT_CROSS_TENANT_REFERENCE -> 403/422
```

### Criterios de aceptación

* Error estándar.
* Incluye traceId.
* No expone SQL.
* No expone stack trace.
* No expone datos sensibles.

---

## TASK-073 — Implementar response wrapper estándar

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Usa `data`.
* Usa `meta.traceId`.
* Respuestas paginadas incluyen page/pageSize/total/totalPages.
* Reportes incluyen generatedAt.
* Montos salen como string.
* No retorna entidades internas.

---

# 17. Fase 11 — Exportación

## TASK-074 — Implementar export JSON

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Exporta solo columnas permitidas.
* Respeta permisos.
* Respeta filtros.
* Incluye rowCount.
* No incluye datos no autorizados.
* Tiene tests.

---

## TASK-075 — Implementar export CSV

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Exporta solo columnas permitidas.
* Define headers.
* Escapa comillas.
* Respeta delimitador.
* Usa encoding seguro.
* Tiene tests.

---

## TASK-076 — Implementar CSV injection protection

**Estado:** `[ ] Pending`

### Reglas

Neutralizar valores que inicien con:

```text id="z4e4h9"
=
+
-
@
```

### Criterios de aceptación

* Aplica a todos los campos textuales.
* Aplica a metadata serializada si existe.
* Tiene tests `CSV-REP-001` a `CSV-REP-008`.

---

## TASK-077 — Implementar límite de exportación

**Estado:** `[ ] Pending`

### Config

```text id="b77eua"
REPORTS_MAX_EXPORT_ROWS
```

### Valor inicial sugerido

```text id="qa01hz"
10000
```

### Criterios de aceptación

* Export demasiado grande falla con 422.
* Error incluye maxExportRows.
* Tiene tests.

---

## TASK-078 — Auditar exportaciones

**Estado:** `[ ] Pending`

### Eventos

```text id="wd8k5l"
report.exported
financialReport.exported
personalDataReport.exported
activityReport.exported
```

### Criterios de aceptación

* Toda exportación genera evento.
* Metadata contiene reportKey, format, filters, rowCount.
* Metadata no contiene resultado completo.
* Tiene tests.

---

# 18. Fase 12 — OpenAPI

## TASK-079 — Documentar reportes operativos

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `operational-overview` documentado.
* `property-units` documentado.
* Permisos documentados.
* Ejemplos incluidos.

---

## TASK-080 — Documentar reportes financieros

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `financial-overview` documentado.
* `charges/summary` documentado.
* `payments/summary` documentado.
* `payments/pending-validation` documentado.
* `balances/summary` documentado.
* `account-statements/summary` documentado.
* `delinquency` documentado.
* `collections/summary` documentado.
* Money as string documentado.

---

## TASK-081 — Documentar reportes personales y actividad

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `residents-owners` documentado.
* `activity` documentado.
* Permisos personales documentados.
* Permisos de actividad documentados.
* Campos sensibles documentados.

---

## TASK-082 — Documentar exportación

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoint export documentado.
* Formatos JSON/CSV documentados.
* PDF marcado como no soportado.
* CSV injection protection documentado.
* Eventos auditables documentados.

---

## TASK-083 — Agregar extensiones OpenAPI

**Estado:** `[ ] Pending`

### Extensiones sugeridas

```yaml id="kzpve8"
x-required-permission: reports.readFinancial
x-report-key: financialOverview
x-report-category: financial
x-tenant-scope: tenant
x-money-as-string: true
x-read-only: true
```

```yaml id="j06oqj"
x-required-permission: reports.exportFinancial
x-audit-event: financialReport.exported
x-sensitive-export: true
x-csv-injection-protection: true
```

### Criterios de aceptación

* Extensiones agregadas.
* No documenta POST/PUT/PATCH/DELETE.
* OpenAPI valida.

---

# 19. Fase 13 — Pruebas unitarias

## TASK-084 — Implementar unit tests de value objects

**Estado:** `[ ] Pending`

### Archivos

```text id="w8ccn7"
report-key.vo.spec.ts
report-category.vo.spec.ts
report-format.vo.spec.ts
report-period.vo.spec.ts
report-date-range.vo.spec.ts
report-money.vo.spec.ts
report-pagination.vo.spec.ts
report-sort.vo.spec.ts
```

### Criterios de aceptación

* Cubren casos UT-REP.
* Pasan en CI.

---

## TASK-085 — Implementar unit tests de entidades

**Estado:** `[ ] Pending`

### Archivos

```text id="ozkga3"
report-result.entity.spec.ts
report-context.entity.spec.ts
report-export.entity.spec.ts
```

### Criterios de aceptación

* Cubren creación válida.
* Cubren errores.
* Cubren tenant.
* Cubren money string.
* Cubren export.
* Pasan en CI.

---

## TASK-086 — Implementar tests de DTOs

**Estado:** `[ ] Pending`

### Criterios de aceptación

* CommonReportQueryDto.
* FinancialReportQueryDto.
* ExportReportQueryDto.
* Query invalid retorna 422.
* Paginación y sort validados.

---

# 20. Fase 14 — Pruebas de aplicación

## TASK-087 — Implementar tests de políticas de permisos

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `reports.read`.
* `reports.readFinancial`.
* `reports.readPersonalData`.
* `reports.readActivity`.
* `audit.read`.
* `reports.export`.
* `reports.exportFinancial`.
* `reports.exportPersonalData`.
* `reports.exportActivity`.

---

## TASK-088 — Implementar tests de filtros

**Estado:** `[ ] Pending`

### Criterios de aceptación

* periodCode.
* billingPeriodId del tenant.
* date range.
* rango máximo.
* sort whitelist.
* pageSize.
* money filters.

---

## TASK-089 — Implementar tests de dinero

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Decimal.
* String output.
* Suma exacta.
* Resta exacta.
* collectionRate.
* Rechazo de float.

---

## TASK-090 — Implementar tests de exportación

**Estado:** `[ ] Pending`

### Criterios de aceptación

* JSON.
* CSV.
* columnas permitidas.
* columnas no autorizadas omitidas.
* formato inválido.
* export demasiado grande.
* CSV injection.

---

## TASK-091 — Implementar tests de auditoría de reportes

**Estado:** `[ ] Pending`

### Criterios de aceptación

* report.exported.
* financialReport.exported.
* personalDataReport.exported.
* activityReport.exported.
* report.accessDenied.
* Metadata sanitizada.

---

## TASK-092 — Implementar tests de casos de uso

**Estado:** `[ ] Pending`

### Use cases

```text id="hwum9v"
GetOperationalOverviewReportUseCase
GetFinancialOverviewReportUseCase
GetPropertyUnitsReportUseCase
GetResidentsOwnersReportUseCase
GetChargesSummaryReportUseCase
GetPaymentsSummaryReportUseCase
GetPendingPaymentValidationReportUseCase
GetBalancesSummaryReportUseCase
GetAccountStatementsSummaryReportUseCase
GetDelinquencyReportUseCase
GetCollectionSummaryReportUseCase
GetAdministrativeActivityReportUseCase
ExportReportUseCase
```

### Criterios de aceptación

* Caminos felices.
* Permisos.
* Errores.
* Multitenancy.
* Money string.
* Read-only.
* Export audit.

---

# 21. Fase 15 — Pruebas de integración

## TASK-093 — Implementar repository tests de operational overview

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Cuenta unidades.
* Cuenta propietarios.
* Cuenta residentes.
* Cuenta usuarios activos.
* Cuenta invitaciones pendientes.
* No incluye Tenant B.

---

## TASK-094 — Implementar repository tests financieros

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Financial overview.
* Charges summary.
* Payments summary.
* Balances summary.
* Account statements summary.
* Collection summary.
* No incluye Tenant B.
* Montos correctos.

---

## TASK-095 — Implementar repository tests de unidades/personas

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Property units.
* Residents owners.
* Filtros.
* Paginación.
* Permisos de saldos.
* No incluye Tenant B.

---

## TASK-096 — Implementar repository tests de morosidad y pendientes

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Pending payment validation.
* Delinquency.
* daysPending.
* daysOverdue.
* oldestDueDate.
* Último pago.
* Excluye cancelados/reversados.

---

## TASK-097 — Implementar repository tests de actividad

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Lee audit_logs.
* Filtra por tenant.
* Filtra por action/category/actor.
* No retorna oldValue/newValue.
* Pagina.

---

# 22. Fase 16 — Pruebas API

## TASK-098 — Implementar API tests de Operational Overview

**Estado:** `[ ] Pending`

### Criterios de aceptación

* 200 autorizado.
* 401 sin token.
* 403 sin permiso.
* Tenant isolation.
* Response shape.

---

## TASK-099 — Implementar API tests de Financial Overview

**Estado:** `[ ] Pending`

### Criterios de aceptación

* 200 con permiso financiero.
* 403 sin permiso financiero.
* periodCode inválido 422.
* billingPeriod otro tenant 403/422.
* Montos string.
* Warnings.

---

## TASK-100 — Implementar API tests de Property Units

**Estado:** `[ ] Pending`

### Criterios de aceptación

* 200 con reports.read.
* includeBalances con permiso.
* includeBalances sin permiso.
* pageSize > 100.
* sortBy inválido.
* Tenant isolation.

---

## TASK-101 — Implementar API tests de Residents Owners

**Estado:** `[ ] Pending`

### Criterios de aceptación

* 200 con permiso personal.
* 403 sin permiso personal.
* No expone identificación/email/teléfono.
* propertyUnit otro tenant.
* Paginación.

---

## TASK-102 — Implementar API tests financieros agregados

**Estado:** `[ ] Pending`

### Endpoints

```text id="j1vixq"
charges/summary
payments/summary
payments/pending-validation
balances/summary
account-statements/summary
delinquency
collections/summary
```

### Criterios de aceptación

* 200 con permiso financiero.
* 403 sin permiso financiero.
* Filtros.
* Montos string.
* Tenant isolation.
* No payloads sensibles.

---

## TASK-103 — Implementar API tests de Activity

**Estado:** `[ ] Pending`

### Criterios de aceptación

* reports.readActivity permite.
* audit.read permite.
* Sin permiso bloquea.
* Filtra.
* No expone oldValue/newValue.
* Tenant isolation.

---

## TASK-104 — Implementar API tests de Export

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Export JSON.
* Export CSV.
* Export sin permiso 403.
* Export financial sin exportFinancial 403.
* Export personal sin exportPersonalData 403.
* Export activity sin exportActivity 403.
* Formato inválido.
* reportKey inválido.
* Export too large.
* CSV seguro.
* Audit event.

---

# 23. Fase 17 — Authorization, multitenancy y seguridad

## TASK-105 — Implementar authorization tests generales

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Sin token 401.
* Sin membership 403.
* Sin reports.read 403.
* Usuario deshabilitado 403.
* Usuario autorizado 200.

---

## TASK-106 — Implementar authorization tests financieros

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Sin reports.readFinancial 403.
* Con reports.readFinancial 200.
* BoardMember limitado bloqueado.
* Treasurer autorizado.

---

## TASK-107 — Implementar authorization tests personales

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Sin reports.readPersonalData 403.
* Con reports.readPersonalData 200.
* Treasurer sin permiso personal bloqueado.
* Export personal requiere exportPersonalData.

---

## TASK-108 — Implementar authorization tests de actividad

**Estado:** `[ ] Pending`

### Criterios de aceptación

* reports.readActivity permite.
* audit.read permite.
* Sin ambos bloquea.
* Export activity requiere exportActivity.

---

## TASK-109 — Implementar separation-of-duties tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* reports.read no implica export.
* reports.read no implica financial.
* reports.readFinancial no implica exportFinancial.
* reports.readPersonalData no implica exportPersonalData.
* reports.readActivity no implica exportActivity.

---

## TASK-110 — Implementar multitenancy tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Tenant A no ve unidades B.
* Tenant A no ve cargos B.
* Tenant A no ve pagos B.
* Tenant A no ve balances B.
* Tenant A no ve statements B.
* Tenant A no ve audit logs B.
* Export Tenant A no incluye Tenant B.
* tenantId query rechazado o ignorado de forma segura.

---

## TASK-111 — Implementar personal data protection tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* No expone cédula.
* No expone email.
* No expone teléfono.
* No expone dirección.
* No expone contactos de emergencia.
* Export personal requiere permiso.
* Export personal auditado.

---

# 24. Fase 18 — Financial regression tests

## TASK-112 — Implementar tests de cargos

**Estado:** `[ ] Pending`

### Criterios de aceptación

* issued suma.
* cancelled no suma deuda activa.
* reversed no suma deuda activa.
* archived no suma.
* ajustes positivos suman.
* ajustes negativos restan.
* reversals se reportan separados.

---

## TASK-113 — Implementar tests de pagos

**Estado:** `[ ] Pending`

### Criterios de aceptación

* confirmed suma.
* allocated suma aplicado.
* partiallyAllocated separa no asignado.
* reversed excluido.
* rejected excluido.
* cancelled excluido.
* allocation reversed excluida.

---

## TASK-114 — Implementar tests de balances

**Estado:** `[ ] Pending`

### Criterios de aceptación

* outstanding suma.
* overdue suma.
* credit suma.
* stale genera warning.
* Tenant B excluido.

---

## TASK-115 — Implementar tests de collection rate

**Estado:** `[ ] Pending`

### Criterios de aceptación

* allocated / issued.
* issued = 0 => null.
* reversed payment excluido.
* unallocated separado.

---

## TASK-116 — Implementar tests de morosidad

**Estado:** `[ ] Pending`

### Criterios de aceptación

* overdueBalance > 0 incluido.
* overdueBalance = 0 excluido.
* oldestDueDate.
* daysOverdue.
* cancelados excluidos.
* reversados excluidos.

---

# 25. Fase 19 — Exportación, CSV y read-only

## TASK-117 — Implementar export tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* JSON operational.
* CSV operational.
* JSON financial.
* CSV financial.
* JSON personal.
* CSV personal.
* Activity export.
* Sin permiso.
* Too large.
* No campos no autorizados.
* Audit event.

---

## TASK-118 — Implementar CSV injection tests

**Estado:** `[ ] Pending`

### Casos

```text id="a7vpzw"
=cmd
+SUM(1,1)
-10+20
@HYPERLINK(...)
=IMPORTXML(...)
```

### Criterios de aceptación

* Todos se neutralizan.
* Aplica a unitCode.
* Aplica a displayName.
* Aplica a chargeConceptName.
* Aplica a method.
* Aplica a action.
* Aplica a metadata serializada.

---

## TASK-119 — Implementar read-only behavior tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* No crea cargos.
* No modifica cargos.
* No modifica pagos.
* No recalcula balances.
* No genera statements.
* No modifica audit_logs.
* Export solo escribe AuditLog de exportación.

---

# 26. Fase 20 — Observabilidad

## TASK-120 — Agregar logs estructurados

**Estado:** `[ ] Pending`

### Logs

```text id="d2jh13"
report.query.executed
report.query.failed
report.export.requested
report.export.completed
report.export.failed
report.access.denied
```

### Criterios de aceptación

* Incluyen traceId.
* No incluyen resultado completo.
* No incluyen CSV completo.
* No incluyen datos personales innecesarios.
* No incluyen tokens.

---

## TASK-121 — Agregar métricas

**Estado:** `[ ] Pending`

### Métricas

```text id="izb8vb"
reports_query_total
reports_query_failed_total
reports_export_total
reports_export_failed_total
reports_access_denied_total
reports_query_latency_ms
reports_export_latency_ms
```

### Criterios de aceptación

* Métricas incrementan.
* Labels permitidos: reportKey, category, outcome, scope.
* No usan tenantId.
* No usan actorUserId.
* No usan propertyUnitId.
* No usan traceId.

---

# 27. Fase 21 — CI/CD y smoke tests

## TASK-122 — Agregar scripts de test del módulo

**Estado:** `[ ] Pending`

### Scripts sugeridos

```bash id="cipx2s"
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

### Criterios de aceptación

* Scripts disponibles.
* Corren localmente.
* Documentados.

---

## TASK-123 — Agregar validaciones CI

**Estado:** `[ ] Pending`

### CI mínimo

```text id="kliib1"
lint
typecheck
unit tests
DTO validation tests
application tests
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

### Criterios de aceptación

* Pipeline falla si hay cross-tenant.
* Pipeline falla si usa float para dinero.
* Pipeline falla si exporta sin permiso.
* Pipeline falla si CSV injection pasa.
* Pipeline falla si hay endpoints de escritura.
* Pipeline falla si OpenAPI no coincide.

---

## TASK-124 — Agregar smoke tests

**Estado:** `[ ] Pending`

### Smoke tests

```text id="jkwk4r"
GET /api/v1/health
GET /api/v1/tenant/reports/operational-overview sin token
GET /api/v1/tenant/reports/operational-overview autorizado
GET /api/v1/tenant/reports/operational-overview sin permiso
GET /api/v1/tenant/reports/financial-overview sin permiso financiero
GET /api/v1/tenant/reports/balances/summary autorizado
```

### Criterios de aceptación

* Smoke tests pasan.
* No ejecutan export masivo.
* Errores incluyen traceId.

---

# 28. Fase 22 — Revisión SDD

## TASK-125 — Validar trazabilidad spec → tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Cada FR tiene tests.
* Cada endpoint tiene API tests.
* Cada permiso tiene authorization tests.
* Cada regla financiera tiene regression test.
* Cada regla multitenant tiene test.
* Cada regla de exportación tiene test.

---

## TASK-126 — Validar cumplimiento de ADRs

**Estado:** `[ ] Pending`

### ADRs

```text id="q0nyl8"
ADR-003 Database Strategy
ADR-004 Multitenancy Strategy
ADR-007 Authorization Strategy
ADR-010 Observability Strategy
ADR-011 Testing Strategy
ADR-012 CI/CD Strategy
```

### Criterios de aceptación

* PostgreSQL + Prisma.
* tenant isolation.
* RBAC.
* observability.
* testing.
* CI gates.
* No hay tablas nuevas sin justificación.

---

## TASK-127 — Validar OpenAPI final

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Coincide con api-contract.
* No documenta POST/PUT/PATCH/DELETE.
* Permisos documentados.
* Money as string documentado.
* Exportación documentada.
* Errores documentados.

---

## TASK-128 — Ejecutar suite completa

**Estado:** `[ ] Pending`

### Comandos

```bash id="qjpsvc"
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

### Criterios de aceptación

* Todo pasa.
* No hay tests omitidos sin justificación.
* No hay datos reales.
* No hay secretos.
* No hay operaciones fuera de alcance.

---

## TASK-129 — Preparar evidencia de implementación

**Estado:** `[ ] Pending`

### Evidencia mínima

```text id="iiz52k"
- PR link o commit SHA.
- Reportes implementados.
- Tests ejecutados.
- OpenAPI actualizado.
- Smoke tests ejecutados.
- Riesgos pendientes.
- Diferidos documentados.
```

---

# 29. Fase 23 — Pendientes diferidos controlados

## TASK-130 — Diferir report snapshots

**Estado:** `[-] Deferred`

### Razón

MVP calcula reportes bajo demanda.

### Futuro

```text id="ta9pmo"
docs/specs/00X-report-snapshots/
```

---

## TASK-131 — Diferir report exports persistidos

**Estado:** `[-] Deferred`

### Razón

MVP no almacena archivos de exportación ni historial materializado de exportaciones.

### Futuro

```text id="fj6rqg"
docs/specs/00X-report-exports/
```

---

## TASK-132 — Diferir scheduled reports

**Estado:** `[-] Deferred`

### Razón

Requiere calendario, destinatarios, almacenamiento y delivery.

### Futuro

```text id="a20nib"
docs/specs/00X-scheduled-reports/
```

---

## TASK-133 — Diferir report templates

**Estado:** `[-] Deferred`

### Razón

Requiere constructor de reportes y columnas configurables.

### Futuro

```text id="ca1l0e"
docs/specs/00X-report-templates/
```

---

## TASK-134 — Diferir materialized views

**Estado:** `[-] Deferred`

### Razón

Se evaluará solo si las consultas bajo demanda son insuficientes.

### Futuro

```text id="rr1fqq"
docs/specs/00X-report-performance/
```

---

## TASK-135 — Diferir BI avanzado

**Estado:** `[-] Deferred`

### Razón

No pertenece al MVP de reportes básicos.

### Futuro

```text id="y6kb64"
docs/specs/00X-dashboard-analytics/
```

---

## TASK-136 — Diferir PDF avanzado

**Estado:** `[-] Deferred`

### Razón

MVP solo soporta JSON/CSV.

### Futuro

```text id="wkjgfy"
docs/specs/00X-report-documents/
```

---

## TASK-137 — Diferir envío automático

**Estado:** `[-] Deferred`

### Razón

Requiere comunicación, plantillas, suscripciones y jobs.

### Futuro

```text id="h5ugwr"
docs/specs/00X-report-delivery/
```

---

## TASK-138 — Diferir IA para reportes

**Estado:** `[-] Deferred`

### Razón

Requiere anonimización, políticas de privacidad y casos de uso específicos.

### Futuro

```text id="k1g39g"
docs/specs/00X-ai-assisted-reports/
```

---

## TASK-139 — Diferir reportes contables formales

**Estado:** `[-] Deferred`

### Razón

Requiere modelo contable, cuentas, asientos y criterios normativos.

### Futuro

```text id="omjdl0"
docs/specs/00X-accounting-reports/
```

---

# 30. Definition of Done

El módulo `008-basic-reports` estará terminado cuando:

```text id="g019uy"
[ ] Documentación completa.
[ ] Módulo reports creado.
[ ] Controladores creados.
[ ] No hay tablas nuevas obligatorias.
[ ] Value objects implementados.
[ ] Entidades conceptuales implementadas.
[ ] DTOs implementados.
[ ] Puertos read-only implementados.
[ ] Repositorio Prisma read-only implementado.
[ ] Servicios de reportes implementados.
[ ] Casos de uso implementados.
[ ] Guards/policies implementados.
[ ] Operational Overview implementado.
[ ] Financial Overview implementado.
[ ] Property Units Report implementado.
[ ] Residents Owners Report implementado.
[ ] Charges Summary implementado.
[ ] Payments Summary implementado.
[ ] Pending Payment Validation implementado.
[ ] Balances Summary implementado.
[ ] Account Statements Summary implementado.
[ ] Delinquency Report implementado.
[ ] Collection Summary implementado.
[ ] Activity Report implementado.
[ ] Export JSON implementado.
[ ] Export CSV implementado.
[ ] CSV injection protection implementado.
[ ] Exportaciones auditadas.
[ ] Montos como string.
[ ] No se usa float para dinero.
[ ] Reportes son read-only.
[ ] Reportes filtran por tenant.
[ ] Permisos financieros aplicados.
[ ] Permisos personales aplicados.
[ ] Permisos de actividad aplicados.
[ ] Permisos de exportación aplicados.
[ ] Cargos cancelados/reversados excluidos de deuda activa.
[ ] Pagos reversados excluidos de recaudación activa.
[ ] Allocations reversadas excluidas de pagos aplicados.
[ ] Pagos no asignados separados.
[ ] Reportes detallados paginados.
[ ] sortBy validado por whitelist.
[ ] Logs sanitizados.
[ ] Métricas implementadas.
[ ] OpenAPI actualizado.
[ ] Unit tests pasan.
[ ] DTO tests pasan.
[ ] Application tests pasan.
[ ] Repository integration tests pasan.
[ ] API tests pasan.
[ ] Authorization tests pasan.
[ ] Multitenancy tests pasan.
[ ] Financial regression tests pasan.
[ ] Personal data tests pasan.
[ ] Export tests pasan.
[ ] CSV injection tests pasan.
[ ] Read-only tests pasan.
[ ] Audit integration tests pasan.
[ ] Observability tests pasan.
[ ] OpenAPI tests pasan.
[ ] Smoke tests pasan.
[ ] CI pasa.
[ ] Diferidos documentados.
```

---

## 31. Orden recomendado de ejecución

```text id="xx6j19"
1. TASK-001 a TASK-008      Documentación
2. TASK-009 a TASK-011      Estructura base
3. TASK-012 a TASK-019      Value objects
4. TASK-020 a TASK-025      Entidades, eventos y errores
5. TASK-026 a TASK-033      DTOs
6. TASK-034 a TASK-039      Persistencia read-only y repositorios
7. TASK-040 a TASK-048      Servicios
8. TASK-049 a TASK-061      Use cases
9. TASK-062 a TASK-069      Guards, policies y decorators
10. TASK-070 a TASK-071     Controladores
11. TASK-072 a TASK-073     Errores y responses
12. TASK-074 a TASK-078     Exportación
13. TASK-079 a TASK-083     OpenAPI
14. TASK-084 a TASK-119     Pruebas
15. TASK-120 a TASK-121     Observabilidad
16. TASK-122 a TASK-124     CI/CD y smoke
17. TASK-125 a TASK-129     Revisión SDD
```

---

## 32. Riesgos de ejecución

| Riesgo                          | Impacto | Mitigación                    |
| ------------------------------- | ------- | ----------------------------- |
| Reportes mezclan tenants        | Crítico | tenantId filter + MT tests    |
| Reporte modifica datos fuente   | Crítico | read-only services + RO tests |
| Totales financieros incorrectos | Alto    | financial regression tests    |
| Uso de float para dinero        | Alto    | ReportMoney + tests           |
| Datos personales expuestos      | Alto    | personal data guard + tests   |
| Export sin permiso              | Alto    | ReportExportGuard             |
| Export financiero sin permiso   | Alto    | exportFinancial tests         |
| CSV injection                   | Alto    | CSV sanitizer                 |
| Auditoría de export omitida     | Alto    | ReportAuditService            |
| Logs con datos sensibles        | Alto    | logging tests                 |
| N+1 queries                     | Medio   | repository tests + revisión   |
| Reportes lentos                 | Medio   | índices + filtros             |
| sort injection                  | Alto    | whitelist                     |

---

## 33. Checklist de revisión de PR

```text id="j4tuki"
[ ] Sigue spec.md.
[ ] Sigue plan.md.
[ ] Sigue data-model.md.
[ ] Sigue api-contract.md.
[ ] No crea tablas nuevas sin justificación.
[ ] No implementa BI avanzado fuera de alcance.
[ ] No implementa PDF avanzado fuera de alcance.
[ ] No implementa envío automático fuera de alcance.
[ ] No implementa IA fuera de alcance.
[ ] Módulo es read-only.
[ ] No crea cargos.
[ ] No modifica pagos.
[ ] No recalcula balances.
[ ] No genera statements.
[ ] No modifica audit_logs.
[ ] Todo reporte filtra por tenantId.
[ ] No acepta tenantId desde query/body.
[ ] Reportes financieros requieren reports.readFinancial.
[ ] Reportes personales requieren reports.readPersonalData.
[ ] Activity requiere reports.readActivity o audit.read.
[ ] Export requiere reports.export.
[ ] Export financiero requiere reports.exportFinancial.
[ ] Export personal requiere reports.exportPersonalData.
[ ] Export activity requiere reports.exportActivity.
[ ] Exportaciones auditadas.
[ ] Montos usan Decimal.
[ ] Montos salen como string.
[ ] No se usa float.
[ ] Cargos cancelados no suman deuda activa.
[ ] Cargos reversados no suman deuda activa.
[ ] Pagos reversados no suman recaudación activa.
[ ] Allocations reversadas no suman pagos aplicados.
[ ] Pagos no asignados se muestran separados.
[ ] Reportes detallados paginan.
[ ] sortBy usa whitelist.
[ ] CSV injection neutralizado.
[ ] Logs no contienen resultado completo.
[ ] Logs no contienen CSV completo.
[ ] Logs no contienen datos personales innecesarios.
[ ] Métricas no usan tenantId.
[ ] Métricas no usan actorUserId.
[ ] Métricas no usan resourceId.
[ ] OpenAPI actualizado.
[ ] Tests pasan.
[ ] CI pasa.
```

---

## 34. Resultado final esperado

Al completar estas tareas, RESIDENT Core tendrá un módulo de reportes básicos capaz de entregar visibilidad operativa y financiera inicial sobre:

```text id="yilzze"
- estado general del tenant;
- unidades habitacionales;
- propietarios y residentes;
- cargos;
- pagos;
- saldos;
- estados de cuenta;
- morosidad básica;
- recaudación;
- pagos pendientes de validación;
- actividad administrativa;
- exportaciones JSON/CSV.
```

Este módulo habilita futuras specs:

```text id="n5hl0z"
00X-financial-reports
00X-dashboard-analytics
00X-report-snapshots
00X-scheduled-reports
00X-report-delivery
00X-report-documents
00X-ai-assisted-reports
00X-accounting-reports
```

Antes de cerrar el paquete documental de `008-basic-reports`, debe completarse:

```text id="wexj8h"
docs/specs/008-basic-reports/security-notes.md
```
