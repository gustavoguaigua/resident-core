# Spec 008 — Basic Reports and Operational Dashboards

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                             |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                                     |
| Spec ID         | 008                                                                                                                                                                               |
| Módulo          | Basic Reports                                                                                                                                                                     |
| Documento       | Functional Specification                                                                                                                                                          |
| Ruta            | `docs/specs/008-basic-reports/spec.md`                                                                                                                                            |
| Versión         | 0.1                                                                                                                                                                               |
| Estado          | Borrador inicial                                                                                                                                                                  |
| Fecha           | 2026-07-14                                                                                                                                                                        |
| Prioridad       | Alta                                                                                                                                                                              |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements`, `007-audit`                                              |
| Relacionado con | `constitution.md`, `domain-map.md`, `architecture.md`, `security.md`, `api-guidelines.md`, `data-governance.md`, `ADR-003`, `ADR-004`, `ADR-007`, `ADR-010`, `ADR-011`, `ADR-012` |

---

## 2. Nombre de la funcionalidad

```text id="qf2y51"
Basic Reports and Operational Dashboards
```

---

## 3. Propósito

El módulo `008-basic-reports` define los reportes operativos mínimos que RESIDENT Core debe ofrecer para que la administración de un conjunto residencial pueda consultar información consolidada sobre:

* unidades habitacionales;
* residentes;
* propietarios;
* cargos;
* alícuotas;
* pagos;
* saldos;
* estados de cuenta;
* morosidad básica;
* recaudación;
* ocupación;
* actividad administrativa;
* eventos auditables relevantes.

Este módulo no reemplaza los módulos fuente. Consume información de los módulos anteriores y genera vistas de consulta para operación diaria.

Regla central:

```text id="vezq79"
Los reportes básicos no son fuente primaria de verdad; deben derivarse de datos transaccionales auditables y tenant-scoped.
```

---

## 4. Objetivo funcional

Permitir que usuarios autorizados consulten reportes básicos para responder preguntas como:

* ¿Cuántas unidades existen en el conjunto?
* ¿Cuántas unidades están activas, inactivas o archivadas?
* ¿Cuántos propietarios hay?
* ¿Cuántos residentes hay?
* ¿Cuáles unidades tienen deuda?
* ¿Cuáles unidades tienen saldo a favor?
* ¿Cuánto se ha emitido en cargos durante un periodo?
* ¿Cuánto se ha recaudado durante un periodo?
* ¿Cuánto está pendiente de pago?
* ¿Qué pagos fueron confirmados?
* ¿Qué pagos están pendientes de validación?
* ¿Qué estados de cuenta fueron generados, publicados, cerrados o bloqueados?
* ¿Cuáles son los principales indicadores financieros básicos del tenant?
* ¿Qué eventos administrativos o financieros críticos ocurrieron en un rango de fechas?

---

## 5. Alcance

### 5.1. Incluido en esta spec

Esta spec incluye reportes básicos de:

```text id="ow0w5u"
1. Resumen operativo del tenant.
2. Resumen de unidades habitacionales.
3. Resumen de residentes y propietarios.
4. Resumen de cargos por periodo.
5. Resumen de pagos por periodo.
6. Resumen de saldos por unidad.
7. Resumen de estados de cuenta.
8. Reporte básico de morosidad.
9. Reporte básico de recaudación.
10. Reporte básico de pagos pendientes de validación.
11. Reporte básico de actividad administrativa.
12. Exportación básica JSON/CSV.
13. API REST para consultas.
14. Autorización por permisos.
15. Filtros por periodo, fecha, unidad, estado y categoría.
16. Paginación.
17. Auditoría de consultas/exportaciones sensibles.
18. Pruebas funcionales, financieras, multitenant y de seguridad.
```

---

### 5.2. No incluido en esta spec

Queda fuera de alcance:

```text id="oyrgn6"
- BI avanzado.
- Cubos OLAP.
- Data warehouse.
- Data lake.
- Dashboards con gráficos complejos.
- Reportes predictivos.
- IA para análisis financiero.
- Detección automática de anomalías.
- Forecast de recaudación.
- Mora avanzada con intereses.
- Cobranza automatizada.
- Reportes contables formales.
- Balance general.
- Estado de resultados contable.
- Flujo de caja contable completo.
- Facturación electrónica.
- Conciliación bancaria.
- Reportes regulatorios avanzados.
- PDF avanzado con diseño institucional.
- Programación automática de reportes.
- Envío por email o WhatsApp.
- Reportes personalizados por usuario final.
- Constructor visual de reportes.
```

Estos temas podrán tratarse en specs futuras.

---

## 6. Contexto arquitectónico

Este módulo pertenece al bounded context:

```text id="xvdsj9"
Reporting and Analytics
```

Consume datos de:

```text id="vhk3qn"
001-tenants
002-users-roles
003-residents-properties
004-dues-fees
005-payments
006-account-statements
007-audit
```

No debe modificar:

* cargos;
* pagos;
* asignaciones;
* estados de cuenta;
* balances;
* personas;
* unidades;
* auditoría.

Regla:

```text id="i0x0xz"
El módulo de reportes debe ser read-oriented y no debe ejecutar operaciones financieras transaccionales.
```

---

## 7. Principios

### 7.1. Reportes derivados

Los reportes se calculan desde fuentes transaccionales existentes.

Fuentes principales:

```text id="ka8kul"
property_units
persons
property_ownerships
residencies
charges
payment_allocations
payments
account_statements
unit_balances
audit_logs
```

---

### 7.2. Tenant isolation obligatorio

Todo reporte debe filtrarse por tenant.

Regla:

```text id="lhqhbf"
Todo reporte tenant-scoped debe ejecutarse con tenantId = currentTenant.id.
```

---

### 7.3. No alterar datos fuente

El módulo de reportes no modifica datos de negocio.

Prohibido:

```text id="rxv7ln"
crear cargos
editar cargos
confirmar pagos
reversar pagos
generar estados de cuenta
recalcular balances
modificar auditoría
```

---

### 7.4. Coherencia financiera

Los reportes financieros deben derivarse de módulos financieros ya especificados.

Regla:

```text id="t9wvb0"
Los totales financieros deben cuadrar con cargos, pagos, allocations, balances y estados de cuenta.
```

---

### 7.5. Transparencia de corte

Todo reporte financiero debe indicar su corte temporal.

Ejemplos:

```text id="c4g7zw"
asOfDate
periodCode
dateFrom
dateTo
generatedAt
```

---

### 7.6. Exportación controlada

Todo reporte exportable debe requerir permiso específico.

Regla:

```text id="nnloai"
reports.export no debe asumirse incluido dentro de reports.read.
```

---

### 7.7. Auditoría de exportaciones

Toda exportación de reportes debe auditarse.

Evento recomendado:

```text id="wwtkv3"
report.exported
```

Para reportes financieros sensibles:

```text id="qw13q8"
financialReport.exported
```

---

### 7.8. Datos mínimos

Los reportes deben exponer datos suficientes para gestión, pero no más.

Ejemplo:

* Para dashboard financiero, mostrar saldos agregados.
* Para reporte de deudores, mostrar unidad y saldo, pero no datos personales innecesarios.
* Para pagos, mostrar estado, monto, método y fecha, pero no comprobantes completos.

---

## 8. Actores

### 8.1. TenantAdmin

Puede consultar:

* resumen operativo;
* unidades;
* residentes y propietarios;
* cargos;
* pagos;
* saldos;
* estados de cuenta;
* reportes administrativos;
* reportes financieros si tiene permiso adicional.

Puede exportar si tiene `reports.export`.

---

### 8.2. Treasurer

Puede consultar reportes financieros:

* cargos emitidos;
* pagos recibidos;
* saldos;
* morosidad básica;
* recaudación;
* estados de cuenta;
* pagos pendientes.

Puede exportar reportes financieros si tiene permiso.

---

### 8.3. TenantAuditor

Puede consultar reportes de solo lectura:

* financieros;
* auditoría básica;
* actividad administrativa;
* estados de cuenta;
* pagos;
* cargos.

Puede exportar si tiene permiso.

---

### 8.4. BoardMember

Puede consultar reportes resumidos si el tenant lo permite.

No debe acceder a datos personales o financieros detallados sin permiso.

---

### 8.5. PropertyOwner

No accede a reportes administrativos del tenant en MVP.

Podrá acceder a información propia a través de specs de autoservicio, no mediante este módulo.

---

### 8.6. Resident

No accede a reportes administrativos del tenant en MVP.

---

### 8.7. PlatformAdmin

Puede consultar métricas platform o soporte bajo permisos platform, pero no reportes financieros detallados de tenants sin permiso sensible.

---

## 9. Definiciones

### 9.1. Basic Report

Consulta predefinida que resume información operativa o financiera.

---

### 9.2. Operational Dashboard

Vista agregada de indicadores básicos del tenant.

---

### 9.3. Financial Summary

Resumen de cargos, pagos, saldos, recaudación y deuda.

---

### 9.4. Delinquency Basic Report

Reporte básico de unidades con saldo vencido o deuda pendiente.

No incluye cálculo avanzado de intereses ni gestión de cobranza.

---

### 9.5. Collection Summary

Resumen de recaudación por periodo, fecha, método o estado.

---

### 9.6. Report Snapshot

Resultado generado en un punto de tiempo.

En MVP no se materializa en tabla salvo decisión posterior.

---

### 9.7. Export

Salida JSON o CSV de un reporte bajo permiso.

---

## 10. Supuestos

1. Los tenants ya existen.
2. Usuarios, roles y permisos ya existen.
3. Unidades, propietarios y residentes ya existen.
4. Cargos ya se generan desde `004-dues-fees`.
5. Pagos y asignaciones existen desde `005-payments`.
6. Estados de cuenta y balances existen desde `006-account-statements`.
7. Auditoría existe desde `007-audit`.
8. Los reportes se calculan read-only.
9. El MVP usará PostgreSQL como fuente principal.
10. No habrá data warehouse en MVP.
11. No habrá BI avanzado en MVP.
12. Los reportes financieros usarán Decimal.
13. Los montos se devolverán como string.
14. Los reportes estarán protegidos por permisos.
15. Toda consulta debe respetar multitenancy.
16. Toda exportación debe auditarse.
17. Reportes con datos personales requieren permiso adicional.
18. Reportes financieros requieren permiso financiero.

---

## 11. Reglas de negocio

### BR-001 — Todo reporte debe ser tenant-scoped

Toda consulta debe ejecutarse dentro del tenant activo.

```text id="ws8b4w"
report.tenantId == currentTenant.id
```

---

### BR-002 — Los reportes no modifican datos

El módulo no debe ejecutar operaciones transaccionales.

---

### BR-003 — Los reportes financieros usan fuentes financieras

Todo valor financiero debe derivarse de:

```text id="cayqch"
charges
payments
payment_allocations
account_statements
unit_balances
```

---

### BR-004 — Los reportes deben indicar fecha de corte

Todo reporte debe incluir:

```text id="t2y8f7"
generatedAt
asOfDate o dateFrom/dateTo o periodCode
```

---

### BR-005 — Montos como string decimal

Todos los montos se devuelven como string.

Ejemplo:

```json id="t60v3t"
{
  "totalCharges": "1500.00",
  "totalPayments": "1200.00",
  "outstandingBalance": "300.00"
}
```

---

### BR-006 — Reportes financieros requieren permiso financiero

Reportes con montos, deuda, pagos o saldos requieren:

```text id="mkl4gr"
reports.readFinancial
```

---

### BR-007 — Reportes de datos personales requieren permiso específico

Reportes que incluyan residentes, propietarios o contactos requieren:

```text id="h5vwln"
reports.readPersonalData
```

---

### BR-008 — Exportar requiere permiso separado

Exportar cualquier reporte requiere:

```text id="oyanuh"
reports.export
```

Exportar reportes financieros puede requerir además:

```text id="dvzprl"
reports.exportFinancial
```

---

### BR-009 — Exportación debe auditarse

Toda exportación genera evento:

```text id="jt5dmp"
report.exported
```

Reportes financieros:

```text id="bg7be5"
financialReport.exported
```

---

### BR-010 — No exponer datos de otros tenants

Prohibido mezclar datos entre tenants.

---

### BR-011 — Reportes agregados pueden ocultar detalle sensible

Si el usuario solo tiene permiso de resumen, puede ver agregados, pero no filas detalladas.

---

### BR-012 — No usar datos no publicados en reportes visibles

Si un reporte se basa en estados de cuenta, debe distinguir:

```text id="oa7bwk"
generated
published
closed
locked
superseded
archived
```

MVP recomendado:

* reportes administrativos pueden incluir generated si el usuario tiene permiso financiero;
* reportes para junta/lectura restringida deberían preferir published/closed/locked.

---

### BR-013 — Los pagos no asignados deben mostrarse separados

No mezclar pagos no asignados con recaudación aplicada.

---

### BR-014 — Los reversos deben excluirse o mostrarse explícitamente

Los reportes deben indicar si incluyen reversos.

Default recomendado:

```text id="zxl070"
includeReversed = false
```

---

### BR-015 — Los cargos cancelados/reversados no deben contar como deuda activa

Deben excluirse de deuda activa.

---

### BR-016 — Paginación obligatoria para reportes detallados

Todo reporte de filas debe paginarse.

---

### BR-017 — Filtros obligatorios para exportaciones grandes

Exportaciones sin filtros pueden restringirse.

---

### BR-018 — Reportes deben ser reproducibles

Con los mismos filtros y mismo corte temporal, el resultado debe ser consistente respecto de la base de datos en ese momento.

---

## 12. Categorías de reportes MVP

### 12.1. Operational Overview

Resumen general del tenant:

```text id="wit1eu"
totalUnits
activeUnits
inactiveUnits
archivedUnits
totalOwners
totalResidents
totalVehicles
totalPets
activeBillingPeriod
pendingInvitations
```

---

### 12.2. Property Units Report

Reporte de unidades:

```text id="h3ygw3"
unitCode
unitType
status
ownerCount
residentCount
currentBalance
overdueBalance
creditBalance
```

---

### 12.3. Residents and Owners Report

Reporte básico de personas vinculadas:

```text id="fxiw4d"
personId
displayName opcional según permiso
relationshipType
propertyUnitCode
status
startDate
endDate
```

---

### 12.4. Charges Summary Report

Resumen de cargos:

```text id="mwa7h5"
periodCode
chargeConcept
totalCharges
chargesCount
cancelledCharges
reversedCharges
adjustmentsTotal
```

---

### 12.5. Payments Summary Report

Resumen de pagos:

```text id="yfeqnv"
dateFrom
dateTo
confirmedPaymentsTotal
pendingValidationTotal
rejectedPaymentsTotal
reversedPaymentsTotal
allocatedPaymentsTotal
unallocatedPaymentsTotal
paymentMethodBreakdown
```

---

### 12.6. Balances Summary Report

Resumen de saldos:

```text id="g41ox2"
totalOutstandingBalance
totalOverdueBalance
totalNotDueBalance
totalCreditBalance
totalUnallocatedPaymentBalance
unitsWithDebt
unitsWithCredit
unitsOverdue
```

---

### 12.7. Account Statements Summary Report

Resumen de estados de cuenta:

```text id="cq6z41"
billingPeriod
generatedCount
publishedCount
closedCount
lockedCount
supersededCount
totalClosingBalance
totalCreditBalance
```

---

### 12.8. Basic Delinquency Report

Reporte básico de morosidad:

```text id="dmydn8"
propertyUnitId
propertyUnitCode
overdueBalance
oldestDueDate
daysOverdue
pendingChargesCount
lastPaymentDate
lastPaymentAmount
```

No incluye:

* intereses;
* gestión de cobranza;
* promesas de pago;
* acuerdos de pago;
* notificaciones.

---

### 12.9. Collection Summary Report

Reporte de recaudación:

```text id="vg0egr"
periodCode
dateFrom
dateTo
totalConfirmedPayments
totalAllocatedPayments
totalUnallocatedPayments
collectionRate
paymentMethodBreakdown
```

---

### 12.10. Pending Payment Validation Report

Pagos pendientes de validación:

```text id="w9d8gf"
paymentId
propertyUnitCode
reportedAt
amount
method
receiptStatus
daysPending
reportedBy
```

---

### 12.11. Administrative Activity Report

Actividad administrativa basada en auditoría:

```text id="ouid8w"
action
category
actorUserId
resourceType
resourceId
outcome
occurredAt
```

---

## 13. Historias de usuario

### US-001 — Ver resumen operativo

Como TenantAdmin, quiero ver un resumen del estado operativo del conjunto para conocer unidades, residentes, propietarios e indicadores generales.

#### Criterios de aceptación

* Requiere `reports.read`.
* Solo muestra información del tenant activo.
* Incluye totales generales.
* No expone datos personales detallados sin permiso.
* Incluye `generatedAt`.

---

### US-002 — Ver resumen financiero

Como Treasurer, quiero consultar un resumen financiero del periodo para conocer cargos emitidos, pagos recibidos y saldos pendientes.

#### Criterios de aceptación

* Requiere `reports.readFinancial`.
* Permite filtrar por periodo.
* Muestra cargos, pagos, deuda y saldo a favor.
* Montos salen como string.
* No incluye cargos cancelados como deuda activa.

---

### US-003 — Ver unidades con deuda

Como Treasurer, quiero consultar unidades con deuda para priorizar gestión administrativa.

#### Criterios de aceptación

* Requiere `reports.readFinancial`.
* Permite filtrar por periodo o fecha de corte.
* Muestra unidad, saldo vencido y días de atraso.
* No calcula intereses.
* Permite exportar si tiene permiso.

---

### US-004 — Ver pagos pendientes de validación

Como TenantAdmin o Treasurer, quiero ver pagos reportados que aún no han sido validados.

#### Criterios de aceptación

* Requiere `reports.readFinancial` o permiso específico.
* Muestra pagos pendientes.
* Permite filtrar por fecha y método.
* No muestra comprobante completo.
* Permite ir al detalle del pago mediante su módulo fuente.

---

### US-005 — Ver reportes de estados de cuenta

Como TenantAuditor, quiero revisar el estado de generación/publicación/cierre de estados de cuenta por periodo.

#### Criterios de aceptación

* Requiere `reports.readFinancial`.
* Filtra por periodo.
* Muestra conteos por estado.
* Muestra totales agregados.
* No modifica statements.

---

### US-006 — Exportar reporte básico

Como TenantAuditor, quiero exportar un reporte en CSV o JSON para revisión administrativa.

#### Criterios de aceptación

* Requiere `reports.export`.
* Si es financiero, requiere `reports.exportFinancial`.
* La exportación se audita.
* CSV está protegido contra fórmula injection.
* No incluye datos no autorizados.

---

### US-007 — Ver actividad administrativa

Como TenantAdmin, quiero ver actividad administrativa resumida para identificar cambios recientes.

#### Criterios de aceptación

* Requiere `reports.readActivity` o `audit.read`.
* Consume eventos de auditoría.
* Permite filtrar por fecha, actor, categoría y acción.
* No reemplaza la API completa de auditoría.
* No muestra secretos.

---

## 14. Requisitos funcionales

### FR-001 — Consultar resumen operativo

El sistema debe permitir consultar un resumen operativo del tenant.

---

### FR-002 — Consultar reporte de unidades

El sistema debe permitir listar unidades con información operativa y saldos básicos.

---

### FR-003 — Consultar reporte de residentes y propietarios

El sistema debe permitir consultar relaciones de personas con unidades bajo permisos adecuados.

---

### FR-004 — Consultar resumen de cargos

El sistema debe permitir consultar cargos emitidos, cancelados, reversados y ajustados por periodo.

---

### FR-005 — Consultar resumen de pagos

El sistema debe permitir consultar pagos confirmados, pendientes, rechazados, reversados, asignados y no asignados.

---

### FR-006 — Consultar resumen de saldos

El sistema debe permitir consultar saldos agregados del tenant.

---

### FR-007 — Consultar reporte de estados de cuenta

El sistema debe permitir consultar conteos y totales de estados de cuenta por periodo.

---

### FR-008 — Consultar reporte básico de morosidad

El sistema debe permitir consultar unidades con saldo vencido.

---

### FR-009 — Consultar reporte de recaudación

El sistema debe permitir consultar recaudación por periodo y rango de fechas.

---

### FR-010 — Consultar pagos pendientes de validación

El sistema debe permitir consultar pagos reportados y no confirmados.

---

### FR-011 — Consultar actividad administrativa básica

El sistema debe permitir consultar actividad administrativa resumida desde auditoría.

---

### FR-012 — Filtrar reportes

Los reportes deben soportar filtros según su tipo.

---

### FR-013 — Paginar reportes detallados

Los reportes con filas deben soportar paginación.

---

### FR-014 — Exportar reportes

El sistema debe permitir exportación JSON/CSV bajo permisos.

---

### FR-015 — Auditar exportaciones

Toda exportación debe generar evento de auditoría.

---

### FR-016 — Proteger reportes financieros

Los reportes financieros requieren permisos financieros.

---

### FR-017 — Proteger reportes con datos personales

Los reportes con datos personales requieren permisos específicos.

---

### FR-018 — Mantener aislamiento multitenant

Ningún reporte debe mezclar datos de distintos tenants.

---

### FR-019 — Mostrar fecha de corte

Todo reporte debe incluir fecha de generación y fecha/rango de corte.

---

### FR-020 — No alterar datos fuente

El módulo no debe modificar fuentes transaccionales.

---

## 15. Requisitos no funcionales

### NFR-001 — Seguridad

Todos los reportes deben estar protegidos por autenticación y autorización.

---

### NFR-002 — Multitenancy

Todo reporte debe filtrar por tenant activo.

---

### NFR-003 — Precisión financiera

Los montos deben usar Decimal y exponerse como string.

---

### NFR-004 — Performance

Los reportes MVP deben responder en tiempos aceptables para tenants pequeños/medianos.

Objetivo inicial:

```text id="h3dsgu"
hasta 500 unidades por tenant
hasta 24 periodos consultables
hasta 10.000 movimientos financieros por tenant
```

---

### NFR-005 — Paginación

Reportes detallados deben paginar.

---

### NFR-006 — Exportación segura

Exportaciones deben limitar volumen y proteger CSV.

---

### NFR-007 — Observabilidad

Consultas y exportaciones deben emitir logs y métricas sanitizadas.

---

### NFR-008 — Auditoría

Exportaciones y consultas sensibles deben auditarse.

---

### NFR-009 — Testabilidad

Debe existir cobertura de pruebas de reportes, cálculos, permisos, multitenancy y exportación.

---

## 16. Reportes MVP detallados

## 16.1. Operational Overview Report

### Endpoint preliminar

```text id="to62uz"
GET /api/v1/tenant/reports/operational-overview
```

### Permiso

```text id="eemzxq"
reports.read
```

### Response conceptual

```json id="y1hbl6"
{
  "data": {
    "tenantId": "tenant_uuid",
    "generatedAt": "2026-07-14T10:00:00Z",
    "units": {
      "total": 60,
      "active": 58,
      "inactive": 1,
      "archived": 1
    },
    "people": {
      "owners": 60,
      "residents": 145
    },
    "assets": {
      "vehicles": 80,
      "pets": 15
    },
    "access": {
      "activeUsers": 25,
      "pendingInvitations": 3
    }
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 16.2. Financial Overview Report

### Endpoint preliminar

```text id="cf29qe"
GET /api/v1/tenant/reports/financial-overview
```

### Permiso

```text id="fab9iv"
reports.readFinancial
```

### Query

```text id="qmc2sg"
billingPeriodId
periodCode
asOfDate
```

### Response conceptual

```json id="qtbtdc"
{
  "data": {
    "periodCode": "2026-07",
    "asOfDate": "2026-07-14",
    "generatedAt": "2026-07-14T10:00:00Z",
    "totals": {
      "chargesIssued": "3000.00",
      "paymentsConfirmed": "2500.00",
      "paymentsAllocated": "2400.00",
      "unallocatedPayments": "100.00",
      "outstandingBalance": "600.00",
      "overdueBalance": "400.00",
      "creditBalance": "50.00"
    },
    "counts": {
      "unitsWithDebt": 12,
      "unitsOverdue": 8,
      "unitsWithCredit": 2
    }
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 16.3. Property Units Report

### Endpoint preliminar

```text id="x3jwhf"
GET /api/v1/tenant/reports/property-units
```

### Permiso

```text id="r7xxwv"
reports.read
```

### Permiso adicional

Para incluir saldos:

```text id="seuuz2"
reports.readFinancial
```

### Query

```text id="b7gag2"
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

## 16.4. Basic Delinquency Report

### Endpoint preliminar

```text id="qjgqm2"
GET /api/v1/tenant/reports/delinquency
```

### Permiso

```text id="p2ej9w"
reports.readFinancial
```

### Query

```text id="rwjm4l"
asOfDate
billingPeriodId
periodCode
minOverdueBalance
daysOverdueMin
page
pageSize
sortBy
sortOrder
```

---

## 16.5. Payments Pending Validation Report

### Endpoint preliminar

```text id="m5e3wx"
GET /api/v1/tenant/reports/payments/pending-validation
```

### Permiso

```text id="idgo3u"
reports.readFinancial
```

### Query

```text id="ag19zr"
dateFrom
dateTo
method
receiptStatus
daysPendingMin
page
pageSize
```

---

## 16.6. Account Statements Summary Report

### Endpoint preliminar

```text id="bay79f"
GET /api/v1/tenant/reports/account-statements/summary
```

### Permiso

```text id="sawana"
reports.readFinancial
```

### Query

```text id="se5cza"
billingPeriodId
periodCode
status
```

---

## 16.7. Administrative Activity Report

### Endpoint preliminar

```text id="iv30x7"
GET /api/v1/tenant/reports/activity
```

### Permiso

```text id="u9p4t8"
reports.readActivity
```

Alternativa:

```text id="lgnzgx"
audit.read
```

### Query

```text id="uraw8o"
dateFrom
dateTo
actorUserId
category
action
resourceType
outcome
page
pageSize
```

---

## 17. API preliminar consolidada

```text id="b6ybg6"
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
GET /api/v1/tenant/reports/{reportKey}/export
```

---

## 18. Permisos iniciales

### 18.1. Permisos generales

```text id="keg7i7"
reports.read
reports.export
```

---

### 18.2. Permisos financieros

```text id="ltcg4c"
reports.readFinancial
reports.exportFinancial
```

---

### 18.3. Permisos de datos personales

```text id="w3vvi2"
reports.readPersonalData
reports.exportPersonalData
```

---

### 18.4. Permisos de actividad

```text id="la7zrw"
reports.readActivity
reports.exportActivity
```

---

### 18.5. Permisos platform futuros

```text id="tsn35k"
reports.platform.read
reports.platform.export
reports.platform.readSensitive
```

MVP puede diferir reportes platform detallados.

---

## 19. Matriz inicial de permisos por reporte

| Reporte                    | Permiso base                          | Permiso adicional                          |
| -------------------------- | ------------------------------------- | ------------------------------------------ |
| Operational Overview       | `reports.read`                        | —                                          |
| Property Units             | `reports.read`                        | `reports.readFinancial` si incluye saldos  |
| Residents Owners           | `reports.readPersonalData`            | —                                          |
| Charges Summary            | `reports.readFinancial`               | —                                          |
| Payments Summary           | `reports.readFinancial`               | —                                          |
| Pending Payment Validation | `reports.readFinancial`               | —                                          |
| Balances Summary           | `reports.readFinancial`               | —                                          |
| Account Statements Summary | `reports.readFinancial`               | —                                          |
| Delinquency                | `reports.readFinancial`               | —                                          |
| Collections Summary        | `reports.readFinancial`               | —                                          |
| Activity                   | `reports.readActivity` o `audit.read` | permisos de categoría audit si aplica      |
| Export                     | `reports.export`                      | financiero/personal/activity según reporte |

---

## 20. Eventos auditables

### 20.1. Consultas sensibles

Eventos sugeridos:

```text id="jp9s28"
report.viewedSensitive
financialReport.viewed
personalDataReport.viewed
activityReport.viewed
```

No auditar necesariamente toda consulta ordinaria para evitar volumen excesivo.

---

### 20.2. Exportaciones

Eventos obligatorios:

```text id="bq5y5d"
report.exported
financialReport.exported
personalDataReport.exported
activityReport.exported
```

---

### 20.3. Accesos denegados

Eventos sugeridos:

```text id="jlehz6"
report.accessDenied
financialReport.accessDenied
personalDataReport.accessDenied
```

---

## 21. Datos y privacidad

### 21.1. Datos financieros

Proteger:

```text id="ns0x4u"
saldos
deuda
pagos
cargos
reversos
morosidad
recaudación
```

---

### 21.2. Datos personales

Proteger:

```text id="vb3pgw"
nombres
identificaciones
emails
teléfonos
direcciones
relaciones de residencia
contactos de emergencia
```

---

### 21.3. Regla de minimización

En reportes agregados, evitar detalles personales.

En reportes detallados, exigir permisos específicos.

---

## 22. Exportación

### 22.1. Formatos MVP

```text id="ixcnw4"
json
csv
```

---

### 22.2. Seguridad CSV

Neutralizar valores que empiecen con:

```text id="k6qyfd"
=
+
-
@
```

---

### 22.3. Límites

Recomendado:

```text id="bebhur"
maxExportRows configurable
filtros obligatorios para reportes grandes
date range máximo configurable
```

---

### 22.4. Auditoría

Toda exportación debe registrar:

```text id="m62ynd"
tenantId
actorUserId
reportKey
format
filters sanitizados
rowCount
result
traceId
```

---

## 23. Observabilidad

### 23.1. Logs técnicos

Registrar:

```text id="w28hlt"
report.query.executed
report.query.failed
report.export.requested
report.export.completed
report.export.failed
report.access.denied
```

No registrar:

```text id="r4anc8"
resultado completo
CSV completo
datos personales innecesarios
payloads financieros completos
tokens
secretos
```

---

### 23.2. Métricas

Métricas sugeridas:

```text id="cecnvg"
reports_query_total
reports_query_failed_total
reports_export_total
reports_export_failed_total
reports_access_denied_total
reports_query_latency_ms
reports_export_latency_ms
```

Labels permitidos:

```text id="leozrw"
reportKey
category
outcome
scope
```

No usar labels:

```text id="mv7qfc"
tenantId
actorUserId
resourceId
propertyUnitId
traceId
```

---

## 24. Seguridad

### 24.1. Riesgos principales

| Riesgo                                            | Impacto |
| ------------------------------------------------- | ------- |
| Reporte mezcla tenants                            | Crítico |
| Reporte financiero incorrecto                     | Alto    |
| Reporte expone datos personales                   | Alto    |
| Exportación sin permiso                           | Alto    |
| CSV injection                                     | Alto    |
| Reporte usa datos no auditables                   | Medio   |
| Reporte modifica datos fuente                     | Crítico |
| Reporte de morosidad usado como cobranza avanzada | Medio   |
| Performance deficiente                            | Medio   |
| Métricas con alta cardinalidad                    | Medio   |

---

### 24.2. Controles

* tenant filtering;
* permisos por reporte;
* permisos financieros;
* permisos de datos personales;
* exportación separada;
* auditoría de exportación;
* CSV sanitization;
* read-only use cases;
* Decimal;
* tests financieros;
* tests multitenant;
* tests de autorización.

---

## 25. Testing

### 25.1. Unit tests

Probar:

* report keys;
* DTO validation;
* filter validation;
* money formatting;
* export format;
* permission policies.

---

### 25.2. Integration tests

Probar:

* consultas a fuentes;
* agregaciones financieras;
* saldos;
* recaudación;
* morosidad básica;
* auditoría de exportación;
* multitenancy.

---

### 25.3. API tests

Probar:

* endpoints de reportes;
* filtros;
* paginación;
* exportación;
* permisos;
* errores.

---

### 25.4. Financial regression tests

Probar que:

* cargos cancelados no cuentan como deuda activa;
* cargos reversados no cuentan como deuda activa;
* pagos reversados no reducen deuda;
* allocations reversadas no reducen deuda;
* pagos no asignados se separan;
* saldos coinciden con `unit_balances`;
* estados de cuenta coinciden con `account_statements`.

---

### 25.5. Security tests

Probar:

* Tenant A no ve Tenant B;
* sin permiso financiero no ve reportes financieros;
* sin permiso personal no ve datos personales;
* export sin permiso falla;
* CSV injection neutralizado;
* logs no contienen export completo.

---

## 26. Criterios de aceptación globales

La spec se considera implementada si:

* existe módulo de reportes básicos;
* todos los reportes son tenant-scoped;
* los reportes no modifican datos;
* los reportes financieros usan fuentes transaccionales;
* los montos usan Decimal/string;
* los reportes detallados paginan;
* los filtros validan;
* los permisos se aplican;
* los reportes financieros requieren permiso financiero;
* los reportes personales requieren permiso personal;
* las exportaciones requieren permiso;
* las exportaciones se auditan;
* CSV export es seguro;
* los reportes excluyen cargos cancelados/reversados de deuda activa;
* los reportes excluyen pagos reversados de recaudación activa;
* los pagos no asignados se muestran separados;
* OpenAPI está actualizado;
* pruebas unitarias pasan;
* pruebas de integración pasan;
* pruebas API pasan;
* pruebas de autorización pasan;
* pruebas multitenant pasan;
* pruebas financieras pasan;
* pruebas de exportación pasan;
* CI pasa.

---

## 27. Casos borde

| Caso                                                     | Resultado esperado                     |
| -------------------------------------------------------- | -------------------------------------- |
| Usuario sin token                                        | 401                                    |
| Usuario sin `reports.read`                               | 403                                    |
| Usuario sin `reports.readFinancial` consulta financiero  | 403                                    |
| Usuario sin `reports.readPersonalData` consulta personas | 403                                    |
| Tenant A consulta datos Tenant B                         | 403/404 o vacío                        |
| periodCode inválido                                      | 422                                    |
| dateFrom > dateTo                                        | 422                                    |
| pageSize > 100                                           | 422                                    |
| sortBy arbitrario                                        | 422                                    |
| export sin permiso                                       | 403                                    |
| export CSV con fórmula                                   | neutralizado                           |
| reporte sin datos                                        | totales 0/lista vacía                  |
| pagos reversados                                         | excluidos por defecto                  |
| cargos cancelados                                        | excluidos de deuda activa              |
| pagos no asignados                                       | mostrados separados                    |
| tenant suspendido                                        | política define solo lectura o bloqueo |
| rango muy grande                                         | 422 o requerir filtros                 |
| reportKey inválido en export                             | 404/422                                |

---

## 28. Dependencias hacia specs futuras

Este módulo habilita:

```text id="crak9x"
00X-financial-reports
00X-dashboard-analytics
00X-late-fees
00X-collections
00X-bank-reconciliation
00X-n8n-automations
00X-ai-assisted-reports
00X-data-warehouse
```

---

## 29. Archivos derivados esperados

```text id="s0em2i"
docs/specs/008-basic-reports/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

---

## 30. Preguntas abiertas

1. ¿Se materializarán reportes en tablas o se calcularán bajo demanda en MVP?
2. ¿Qué reportes necesita ver la junta directiva en MVP?
3. ¿Se permitirá exportar datos personales en CSV?
4. ¿Qué límite de filas se aplicará a exportaciones?
5. ¿Qué reportes serán visibles para BoardMember?
6. ¿Qué reportes se expondrán en el portal WordPress, si alguno?
7. ¿Se auditarán todas las consultas financieras o solo exportaciones?
8. ¿Se permitirá comparar periodos en MVP?
9. ¿Se incluirá porcentaje de recaudación por periodo?
10. ¿Se incluirá ranking de deudores o se evitará por privacidad?
11. ¿Se incluirá identificación de propietarios en reportes de deuda?
12. ¿Los reportes de morosidad requieren aprobación antes de exportar?
13. ¿Qué reportes se diferirán a `00X-financial-reports`?
14. ¿Se permitirá programar reportes en futuro?
15. ¿Se integrarán reportes con n8n para envío automático futuro?

---

## 31. Decisión inicial para MVP

Para MVP se recomienda:

```text id="un1znx"
- Crear módulo reports.
- Implementar reportes bajo demanda.
- No materializar reportes en tablas.
- Usar consultas optimizadas a PostgreSQL.
- Usar unit_balances para saldos.
- Usar account_statements para resúmenes por periodo.
- Usar charges/payments para resúmenes financieros.
- Usar audit_logs para actividad administrativa.
- Exponer endpoints REST bajo /api/v1/tenant/reports.
- Permitir exportación JSON/CSV.
- Auditar exportaciones.
- Proteger reportes financieros con reports.readFinancial.
- Proteger reportes personales con reports.readPersonalData.
- Diferir BI avanzado.
- Diferir reportes contables formales.
- Diferir PDF avanzado.
- Diferir envío automático.
```

---

## 32. Conclusión

El módulo `008-basic-reports` entregará la primera capa de visibilidad operativa y financiera de RESIDENT Core.

Debe mantenerse como un módulo:

```text id="w482s8"
read-only
tenant-scoped
permissioned
auditable
derivado de fuentes transaccionales
financieramente consistente
seguro para exportación
preparado para analítica futura
```

No debe aceptarse una implementación que mezcle tenants, modifique datos fuente, calcule montos con float, exponga datos personales sin permiso, exporte reportes sin auditoría, incluya cargos cancelados como deuda activa, incluya pagos reversados como recaudación activa o permita CSV vulnerable a fórmula injection.
