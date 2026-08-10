# Data Model — Spec 008 Basic Reports and Operational Dashboards

## 1. Información del documento

| Campo                  | Valor                                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Proyecto               | RESIDENT Core                                                                                                                        |
| Spec ID                | 008                                                                                                                                  |
| Módulo                 | Basic Reports                                                                                                                        |
| Documento              | Data Model                                                                                                                           |
| Ruta                   | `docs/specs/008-basic-reports/data-model.md`                                                                                         |
| Versión                | 0.1                                                                                                                                  |
| Estado                 | needs-review                                                                                                                         |
| Fecha                  | 2026-07-14                                                                                                                           |
| Documento base         | `docs/specs/008-basic-reports/spec.md`                                                                                               |
| Plan técnico           | `docs/specs/008-basic-reports/plan.md`                                                                                               |
| Depende de             | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements`, `007-audit` |
| Base de datos          | PostgreSQL                                                                                                                           |
| ORM                    | Prisma                                                                                                                               |
| Estrategia multitenant | Shared database + shared schema + `tenant_id`                                                                                        |
| Naturaleza del módulo  | Read-only / Reporting                                                                                                                |
| Persistencia MVP       | Sin tablas transaccionales nuevas obligatorias                                                                                       |
| Exportación MVP        | JSON / CSV                                                                                                                           |

---

## 2. Propósito

Este documento define el modelo de datos para el módulo `008-basic-reports`.

A diferencia de los módulos transaccionales anteriores, este módulo no introduce una nueva fuente primaria de datos. Su función es consultar, agregar, combinar y presentar datos existentes de forma segura, consistente y tenant-scoped.

Regla central:

```text id="o6g7en"
Los reportes básicos no deben crear una segunda fuente de verdad; deben derivarse de datos transaccionales auditables ya existentes.
```

---

## 3. Decisión principal del modelo

Para MVP:

```text id="q1mfs8"
No se crearán tablas obligatorias para reportes.
```

Los reportes se calcularán bajo demanda desde tablas existentes.

Motivos:

* evita duplicar datos financieros;
* reduce riesgo de inconsistencias;
* mantiene cargos, pagos, balances y estados de cuenta como fuentes oficiales;
* simplifica el MVP;
* permite validar necesidades reales antes de crear vistas materializadas;
* mantiene bajo el costo operativo inicial;
* facilita la evolución futura hacia reportes avanzados, snapshots, materialized views o data warehouse.

---

## 4. Fuentes de datos principales

El módulo `008-basic-reports` consume datos de:

```text id="l6scf4"
tenants
user_profiles
user_tenant_memberships
roles
membership_roles
property_units
persons
legal_entities
property_ownerships
residencies
leases
vehicles
pets
charge_concepts
fee_schedules
unit_fee_assignments
billing_periods
charges
charge_adjustments
charge_reversals
payments
payment_receipts
payment_allocations
payment_reversals
account_statements
account_statement_lines
unit_balances
balance_snapshots
audit_logs
```

---

## 5. Principios del modelo de reportes

### 5.1. Read-only

El módulo no debe modificar datos fuente.

Prohibido:

```text id="xb5q0g"
INSERT en tablas transaccionales desde reports
UPDATE en tablas transaccionales desde reports
DELETE en tablas transaccionales desde reports
recalcular balances desde reports
generar estados de cuenta desde reports
confirmar pagos desde reports
crear cargos desde reports
modificar auditoría desde reports
```

---

### 5.2. Tenant-scoped obligatorio

Toda consulta debe aplicar:

```text id="rt1vcu"
WHERE tenant_id = currentTenant.id
```

o su equivalente en Prisma.

---

### 5.3. Precisión financiera

Todos los montos deben leerse como Decimal y devolverse como string.

Prohibido:

```text id="m9362c"
float
double
number para dinero sin Decimal
redondeo silencioso
```

---

### 5.4. Datos derivados

Los campos de reportes son derivados.

Ejemplos:

```text id="qg7b8c"
collectionRate
daysOverdue
unitsWithDebt
unitsWithCredit
pendingValidationTotal
unallocatedPaymentsTotal
```

Estos campos no deben persistirse en MVP.

---

### 5.5. Cortes temporales explícitos

Todo reporte debe exponer:

```text id="d0sggq"
generatedAt
asOfDate
dateFrom/dateTo
periodCode
billingPeriodId
```

según aplique.

---

### 5.6. Exportación como vista del resultado

La exportación JSON/CSV representa una salida del reporte, no una entidad financiera persistente.

MVP:

```text id="k8b9yr"
No se almacena el archivo exportado en tabla propia.
```

La exportación se audita en `007-audit`.

---

## 6. Tablas nuevas

## 6.1. Tablas obligatorias MVP

```text id="h28zbb"
Ninguna.
```

---

## 6.2. Tablas diferidas

Posibles tablas futuras:

```text id="h4s2ry"
report_snapshots
report_exports
scheduled_reports
report_templates
report_subscriptions
report_delivery_logs
```

Estas tablas quedan fuera del MVP.

---

# 7. Modelos conceptuales no persistidos

Aunque no se crearán tablas nuevas, el dominio manejará modelos conceptuales.

## 7.1. ReportResult

Representa el resultado completo de un reporte.

```text id="pln5zr"
ReportResult
├── reportKey
├── tenantId
├── generatedAt
├── asOfDate nullable
├── dateFrom nullable
├── dateTo nullable
├── billingPeriodId nullable
├── periodCode nullable
├── filters
├── summary nullable
├── totals nullable
├── rows nullable
├── pagination nullable
└── meta
```

Reglas:

* `tenantId` obligatorio.
* `reportKey` obligatorio.
* `generatedAt` obligatorio.
* `summary`, `totals` y `rows` dependen del tipo de reporte.
* No puede contener datos de otro tenant.
* No puede contener campos no autorizados.

---

## 7.2. ReportRow

Representa una fila individual de reporte.

Ejemplos de filas:

```text id="fbn5pw"
PropertyUnitReportRow
ResidentOwnerReportRow
ChargeSummaryReportRow
PaymentSummaryReportRow
PendingPaymentValidationRow
BalanceSummaryRow
AccountStatementSummaryRow
DelinquencyReportRow
ActivityReportRow
```

Reglas:

* Debe ser serializable a JSON.
* Debe ser exportable a CSV si el reporte lo permite.
* Debe contener solo columnas autorizadas.
* Debe evitar datos personales innecesarios.

---

## 7.3. ReportContext

Representa contexto de ejecución.

```text id="qwgkm4"
ReportContext
├── tenantId
├── actorUserId
├── permissions
├── reportKey
├── reportCategory
├── filters
├── traceId
├── requestId
├── correlationId
└── generatedAt
```

Uso:

* autorización;
* auditoría;
* exportación;
* observabilidad;
* trazabilidad.

---

## 7.4. ReportExport

Representa una exportación en memoria.

```text id="ugybqs"
ReportExport
├── reportKey
├── tenantId
├── actorUserId
├── format
├── filters
├── rowCount
├── generatedAt
├── contentType
├── content
└── traceId
```

Regla MVP:

```text id="l5407q"
ReportExport no se persiste como tabla.
```

---

# 8. Value objects

## 8.1. ReportKey

Valores MVP:

```text id="kgg01x"
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

---

## 8.2. ReportCategory

Valores:

```text id="kcsl0c"
operational
financial
personalData
activity
mixed
```

---

## 8.3. ReportFormat

Valores MVP:

```text id="dgxgs0"
json
csv
```

PDF queda diferido.

---

## 8.4. ReportPeriod

Campos:

```text id="sxyj5f"
billingPeriodId
periodCode
```

Reglas:

* `periodCode` formato `YYYY-MM`.
* `billingPeriodId` debe pertenecer al tenant.
* Si ambos se envían, deben representar el mismo periodo.

---

## 8.5. ReportDateRange

Campos:

```text id="due4bc"
dateFrom
dateTo
```

Reglas:

* `dateFrom <= dateTo`.
* Fechas en ISO 8601.
* Internamente usar UTC.
* Presentación puede usar `America/Guayaquil`.
* Rango máximo configurable por reporte.

---

## 8.6. ReportMoney

Campos:

```text id="v60fi5"
amount
currency
```

Reglas:

* `amount` Decimal.
* `currency = USD` en MVP.
* API devuelve string decimal.
* No float.

---

## 8.7. ReportPagination

Campos:

```text id="vlu9j4"
page
pageSize
total
totalPages
```

Reglas:

```text id="xqrwck"
page default 1
pageSize default 20
pageSize max 100
```

---

## 8.8. ReportSort

Campos:

```text id="vw1c10"
sortBy
sortOrder
```

Reglas:

* `sortBy` depende del reporte.
* `sortOrder` solo `asc` o `desc`.
* No aceptar campos arbitrarios.

---

# 9. Fuentes por reporte

## 9.1. Operational Overview Report

### ReportKey

```text id="jv9khx"
operationalOverview
```

### Fuentes

```text id="p2bwwp"
tenants
property_units
persons
property_ownerships
residencies
vehicles
pets
user_profiles
user_tenant_memberships
invitations
billing_periods
```

### Campos derivados

```text id="k6s85q"
totalUnits
activeUnits
inactiveUnits
archivedUnits
totalOwners
totalResidents
totalVehicles
totalPets
activeUsers
pendingInvitations
activeBillingPeriod
```

### Reglas

* No incluye saldos financieros.
* No expone datos personales detallados.
* Todos los conteos son del tenant activo.

---

## 9.2. Financial Overview Report

### ReportKey

```text id="kv98ld"
financialOverview
```

### Fuentes

```text id="x9kstx"
billing_periods
charges
payments
payment_allocations
payment_reversals
unit_balances
account_statements
```

### Campos derivados

```text id="wvb3be"
chargesIssued
paymentsConfirmed
paymentsAllocated
unallocatedPayments
outstandingBalance
overdueBalance
notDueBalance
creditBalance
unitsWithDebt
unitsOverdue
unitsWithCredit
collectionRate
```

### Reglas

* Requiere `reports.readFinancial`.
* Usa Decimal.
* Montos como string.
* Excluye pagos reversados de recaudación activa.
* Excluye cargos cancelados/reversados de deuda activa.
* Pagos no asignados se muestran separados.

---

## 9.3. Property Units Report

### ReportKey

```text id="zcnwk0"
propertyUnits
```

### Fuentes

```text id="rgy4e3"
property_units
property_ownerships
residencies
unit_balances
```

### Campos

```text id="xyr68e"
propertyUnitId
unitCode
unitType
status
ownerCount
residentCount
currentBalance
overdueBalance
creditBalance
```

### Reglas

* `currentBalance`, `overdueBalance`, `creditBalance` solo si usuario tiene `reports.readFinancial`.
* Sin permiso financiero, omitir campos de saldo.
* Paginar.

---

## 9.4. Residents and Owners Report

### ReportKey

```text id="w5cx6u"
residentsOwners
```

### Fuentes

```text id="lfsjc0"
persons
legal_entities
property_units
property_ownerships
residencies
leases
```

### Campos

```text id="hyp475"
personId
displayName
relationshipType
propertyUnitId
propertyUnitCode
status
startDate
endDate
```

### Reglas

* Requiere `reports.readPersonalData`.
* No exponer identificación completa salvo permiso futuro específico.
* No exponer teléfonos, emails ni direcciones en MVP salvo contrato explícito.
* Paginar.

---

## 9.5. Charges Summary Report

### ReportKey

```text id="r1dg4j"
chargesSummary
```

### Fuentes

```text id="actpdw"
billing_periods
charge_concepts
charges
charge_adjustments
charge_reversals
```

### Campos

```text id="lsjvag"
billingPeriodId
periodCode
chargeConceptId
chargeConceptName
chargesCount
issuedChargesCount
cancelledChargesCount
reversedChargesCount
chargesTotal
adjustmentsTotal
reversalsTotal
activeChargesTotal
```

### Reglas

* Requiere `reports.readFinancial`.
* Cargos cancelados y reversados no cuentan como deuda activa.
* Pueden contarse como actividad histórica si `includeCancelled` o `includeReversed` está habilitado.
* Montos como string.

---

## 9.6. Payments Summary Report

### ReportKey

```text id="y9mjui"
paymentsSummary
```

### Fuentes

```text id="w39n8r"
payments
payment_receipts
payment_allocations
payment_reversals
```

### Campos

```text id="kx857k"
dateFrom
dateTo
paymentMethod
confirmedPaymentsTotal
pendingValidationTotal
rejectedPaymentsTotal
reversedPaymentsTotal
allocatedPaymentsTotal
unallocatedPaymentsTotal
paymentsCount
confirmedPaymentsCount
pendingValidationCount
rejectedPaymentsCount
reversedPaymentsCount
```

### Reglas

* Requiere `reports.readFinancial`.
* Pagos reversados no cuentan como recaudación activa.
* Pagos no asignados se muestran por separado.
* No incluir comprobantes completos.

---

## 9.7. Pending Payment Validation Report

### ReportKey

```text id="zydwb1"
pendingPaymentValidation
```

### Fuentes

```text id="pi8051"
payments
payment_receipts
property_units
user_profiles
```

### Campos

```text id="pr3mmy"
paymentId
propertyUnitId
propertyUnitCode
reportedAt
amount
method
receiptStatus
daysPending
reportedBy
```

### Reglas

* Requiere `reports.readFinancial`.
* No incluye archivo de comprobante.
* Muestra referencia al pago.
* Paginar.

---

## 9.8. Balances Summary Report

### ReportKey

```text id="k1nwyz"
balancesSummary
```

### Fuentes

```text id="l232nw"
unit_balances
property_units
```

### Campos

```text id="jghjeo"
totalOutstandingBalance
totalOverdueBalance
totalNotDueBalance
totalCreditBalance
totalUnallocatedPaymentBalance
unitsWithDebt
unitsWithCredit
unitsOverdue
staleBalancesCount
```

### Reglas

* Requiere `reports.readFinancial`.
* Usa `unit_balances` como fuente resumida.
* Si `isStale = true`, el reporte debe indicar advertencia.
* Montos como string.

---

## 9.9. Account Statements Summary Report

### ReportKey

```text id="s0hvb2"
accountStatementsSummary
```

### Fuentes

```text id="ie5vlj"
account_statements
billing_periods
property_units
```

### Campos

```text id="gii7la"
billingPeriodId
periodCode
generatedCount
publishedCount
closedCount
lockedCount
supersededCount
archivedCount
totalClosingBalance
totalCreditBalance
statementsCount
```

### Reglas

* Requiere `reports.readFinancial`.
* Excluir `archived` de totales activos salvo filtro explícito.
* `superseded` no cuenta como vigente.
* Montos como string.

---

## 9.10. Basic Delinquency Report

### ReportKey

```text id="i2bcke"
delinquency
```

### Fuentes

```text id="itcdhf"
unit_balances
property_units
charges
payment_allocations
payments
```

### Campos

```text id="m5w1ta"
propertyUnitId
propertyUnitCode
overdueBalance
outstandingBalance
oldestDueDate
daysOverdue
pendingChargesCount
lastPaymentDate
lastPaymentAmount
```

### Reglas

* Requiere `reports.readFinancial`.
* No calcula intereses.
* No ejecuta cobranza.
* No envía notificaciones.
* Excluye cargos cancelados/reversados.
* Excluye pagos reversados.
* Paginar.

---

## 9.11. Collection Summary Report

### ReportKey

```text id="sqy8fv"
collectionSummary
```

### Fuentes

```text id="ug4jz3"
payments
payment_allocations
charges
billing_periods
```

### Campos

```text id="lcpyor"
periodCode
dateFrom
dateTo
totalConfirmedPayments
totalAllocatedPayments
totalUnallocatedPayments
chargesIssued
collectionRate
paymentMethodBreakdown
```

### Reglas

* Requiere `reports.readFinancial`.
* `collectionRate` debe documentar fórmula.
* Pagos reversados no cuentan.
* Pagos no asignados se separan.

Fórmula MVP sugerida:

```text id="m68eoj"
collectionRate = totalAllocatedPayments / chargesIssued
```

Si `chargesIssued = 0`, `collectionRate = null`.

---

## 9.12. Administrative Activity Report

### ReportKey

```text id="iu9cuu"
activity
```

### Fuentes

```text id="m4fjqv"
audit_logs
```

### Campos

```text id="dlzm0q"
auditLogId
action
category
actorType
actorUserId
resourceType
resourceId
outcome
occurredAt
```

### Reglas

* Requiere `reports.readActivity` o `audit.read`.
* No reemplaza `007-audit`.
* No expone `oldValue`, `newValue` ni `metadata` completa.
* Permisos de categorías sensibles pueden aplicar.
* Paginar.

---

# 10. Reglas de agregación financiera

## 10.1. Cargos emitidos

Fuente:

```text id="jtdjpk"
charges
```

Incluir:

```text id="pm11xo"
issued
partiallyPaid
paid
unpaid
```

Excluir de deuda activa:

```text id="cjryj8"
cancelled
reversed
archived
```

---

## 10.2. Cargos cancelados

Pueden contarse como actividad histórica si el filtro lo solicita:

```text id="ft7izp"
includeCancelled = true
```

Pero no suman deuda activa.

---

## 10.3. Cargos reversados

Pueden contarse como actividad histórica si:

```text id="wzke9n"
includeReversed = true
```

Pero no suman deuda activa.

---

## 10.4. Pagos confirmados

Fuente:

```text id="xrez9t"
payments
```

Incluir en recaudación bruta:

```text id="zr5dkp"
confirmed
partiallyAllocated
allocated
```

Excluir:

```text id="q0hu89"
rejected
cancelled
reversed
archived
```

---

## 10.5. Pagos asignados

Fuente:

```text id="ergtal"
payment_allocations
```

Incluir:

```text id="rox1b1"
active
```

Excluir:

```text id="t3i5zr"
reversed
cancelled
archived
```

---

## 10.6. Pagos no asignados

Fórmula conceptual:

```text id="ytvy2x"
unallocatedPayments = confirmedPaymentsTotal - allocatedPaymentsTotal
```

o usar campo calculado del módulo de pagos si existe.

Regla:

```text id="owz5wb"
Los pagos no asignados no deben mezclarse con pagos aplicados a cargos.
```

---

## 10.7. Saldo pendiente

Fuente recomendada:

```text id="eoou13"
unit_balances.outstanding_balance
```

Regla:

```text id="x7k7yp"
El reporte no debe recalcular saldos complejos si unit_balances ya existe y no está stale.
```

---

## 10.8. Saldos stale

Si existe:

```text id="mgnkaw"
unit_balances.is_stale = true
```

El reporte debe incluir advertencia.

Ejemplo:

```json id="m56294"
{
  "warnings": [
    {
      "code": "STALE_BALANCES_PRESENT",
      "message": "Some unit balances may require recalculation."
    }
  ]
}
```

---

# 11. Reglas de privacidad

## 11.1. Datos personales en reportes

Reportes con personas requieren:

```text id="x5ex98"
reports.readPersonalData
```

---

## 11.2. Datos personales en exportaciones

Exportar datos personales requiere:

```text id="tuqazm"
reports.exportPersonalData
```

---

## 11.3. Campos personales permitidos MVP

Permitidos con permiso:

```text id="pv3ar1"
personId
displayName
relationshipType
propertyUnitCode
status
startDate
endDate
```

Diferidos:

```text id="u7k9lx"
identificación
email
teléfono
dirección
contacto de emergencia
datos familiares completos
```

---

## 11.4. Reportes financieros con unidad

Los reportes de deuda pueden mostrar:

```text id="uxlmzx"
propertyUnitId
propertyUnitCode
overdueBalance
outstandingBalance
```

No deben mostrar por defecto:

```text id="auxq09"
nombre completo del propietario
identificación
teléfono
email
```

salvo permiso y contrato futuro.

---

# 12. Reglas de exportación de datos

## 12.1. Columnas explícitas

Cada reporte debe declarar columnas exportables.

Regla:

```text id="atdabq"
No exportar campos internos que no estén definidos en el contrato.
```

---

## 12.2. CSV injection

Neutralizar valores textuales que empiecen con:

```text id="cutup7"
=
+
-
@
```

---

## 12.3. Límite de filas

Variable recomendada:

```text id="j8c7du"
REPORTS_MAX_EXPORT_ROWS
```

Valor inicial sugerido:

```text id="xwk6yq"
10000
```

---

## 12.4. Exportación auditada

Toda exportación debe crear evento en `audit_logs` mediante `007-audit`.

Metadata permitida:

```text id="zj0f4q"
reportKey
format
filters sanitizados
rowCount
result
traceId
```

No almacenar:

```text id="w8hzpq"
CSV completo
JSON completo
resultado completo
datos personales innecesarios
```

---

# 13. Contratos de respuesta por reporte

## 13.1. Response base

```json id="nfokbx"
{
  "data": {
    "reportKey": "financialOverview",
    "tenantId": "tenant_uuid",
    "generatedAt": "2026-07-14T10:00:00Z",
    "asOfDate": "2026-07-14",
    "periodCode": "2026-07",
    "summary": {},
    "totals": {},
    "rows": []
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 13.2. Response paginado

```json id="diiqv5"
{
  "data": {
    "reportKey": "propertyUnits",
    "tenantId": "tenant_uuid",
    "generatedAt": "2026-07-14T10:00:00Z",
    "rows": []
  },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5,
    "traceId": "req_123456"
  }
}
```

---

## 13.3. Response con advertencias

```json id="xrn3bz"
{
  "data": {
    "reportKey": "balancesSummary",
    "tenantId": "tenant_uuid",
    "generatedAt": "2026-07-14T10:00:00Z",
    "totals": {
      "totalOutstandingBalance": "1000.00"
    },
    "warnings": [
      {
        "code": "STALE_BALANCES_PRESENT",
        "message": "Some balances may require recalculation."
      }
    ]
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 14. Vistas conceptuales

No se crearán views obligatorias en MVP, pero se definen vistas conceptuales para orientar queries.

## 14.1. `report_unit_balance_view`

Fuente conceptual:

```text id="w55dpl"
property_units
LEFT JOIN unit_balances
```

Campos:

```text id="za9n94"
tenant_id
property_unit_id
unit_code
unit_type
unit_status
outstanding_balance
overdue_balance
not_due_balance
credit_balance
unallocated_payment_balance
is_stale
```

---

## 14.2. `report_charge_summary_view`

Fuente conceptual:

```text id="mbagtr"
charges
charge_concepts
billing_periods
```

Campos:

```text id="n5evyf"
tenant_id
billing_period_id
period_code
charge_concept_id
charge_concept_name
status
effective_amount
original_amount
due_date
```

---

## 14.3. `report_payment_summary_view`

Fuente conceptual:

```text id="i458d4"
payments
payment_allocations
payment_receipts
```

Campos:

```text id="ledhqq"
tenant_id
payment_id
property_unit_id
status
method
amount
allocated_amount
unallocated_amount
reported_at
confirmed_at
receipt_status
```

---

## 14.4. `report_statement_summary_view`

Fuente conceptual:

```text id="efyvp6"
account_statements
billing_periods
```

Campos:

```text id="xnb7bt"
tenant_id
billing_period_id
period_code
status
closing_balance
credit_balance
generated_at
published_at
closed_at
locked_at
```

---

## 14.5. `report_activity_view`

Fuente conceptual:

```text id="na92ip"
audit_logs
```

Campos:

```text id="owcgl5"
tenant_id
action
category
actor_type
actor_user_id
resource_type
resource_id
outcome
occurred_at
```

---

# 15. Índices requeridos en tablas fuente

El módulo no crea tablas nuevas, pero depende de índices existentes o recomendados.

## 15.1. `property_units`

Requeridos/recomendados:

```text id="ea1t51"
tenant_id
tenant_id + status
tenant_id + unit_code
tenant_id + unit_type
```

---

## 15.2. `persons`

Requeridos/recomendados:

```text id="adkax3"
tenant_id
tenant_id + status
```

---

## 15.3. `property_ownerships`

Requeridos/recomendados:

```text id="xvxwqh"
tenant_id
tenant_id + property_unit_id
tenant_id + person_id
tenant_id + status
tenant_id + start_date
tenant_id + end_date
```

---

## 15.4. `residencies`

Requeridos/recomendados:

```text id="jy3xhc"
tenant_id
tenant_id + property_unit_id
tenant_id + person_id
tenant_id + status
tenant_id + start_date
tenant_id + end_date
```

---

## 15.5. `charges`

Requeridos/recomendados:

```text id="wwl6c5"
tenant_id
tenant_id + billing_period_id
tenant_id + property_unit_id
tenant_id + status
tenant_id + charge_concept_id
tenant_id + due_date
tenant_id + billing_period_id + status
```

---

## 15.6. `payments`

Requeridos/recomendados:

```text id="zqmmju"
tenant_id
tenant_id + property_unit_id
tenant_id + status
tenant_id + method
tenant_id + reported_at
tenant_id + confirmed_at
tenant_id + status + confirmed_at
```

---

## 15.7. `payment_allocations`

Requeridos/recomendados:

```text id="ob4xg3"
tenant_id
tenant_id + payment_id
tenant_id + charge_id
tenant_id + property_unit_id
tenant_id + status
```

---

## 15.8. `unit_balances`

Requeridos/recomendados:

```text id="ceius9"
tenant_id
tenant_id + property_unit_id
tenant_id + is_stale
tenant_id + outstanding_balance
tenant_id + overdue_balance
tenant_id + credit_balance
```

---

## 15.9. `account_statements`

Requeridos/recomendados:

```text id="y1q5a6"
tenant_id
tenant_id + billing_period_id
tenant_id + property_unit_id
tenant_id + status
tenant_id + billing_period_id + status
tenant_id + generated_at
tenant_id + published_at
```

---

## 15.10. `audit_logs`

Requeridos/recomendados:

```text id="f5gw7w"
tenant_id
tenant_id + occurred_at
tenant_id + category
tenant_id + action
tenant_id + actor_user_id
tenant_id + resource_type + resource_id
```

---

# 16. Queries conceptuales

## 16.1. Conteo de unidades

```sql id="i6eibp"
SELECT
  COUNT(*) AS total_units,
  COUNT(*) FILTER (WHERE status = 'active') AS active_units,
  COUNT(*) FILTER (WHERE status = 'inactive') AS inactive_units,
  COUNT(*) FILTER (WHERE status = 'archived') AS archived_units
FROM property_units
WHERE tenant_id = $1;
```

---

## 16.2. Resumen de balances

```sql id="s5fun3"
SELECT
  COALESCE(SUM(outstanding_balance), 0) AS total_outstanding_balance,
  COALESCE(SUM(overdue_balance), 0) AS total_overdue_balance,
  COALESCE(SUM(not_due_balance), 0) AS total_not_due_balance,
  COALESCE(SUM(credit_balance), 0) AS total_credit_balance,
  COALESCE(SUM(unallocated_payment_balance), 0) AS total_unallocated_payment_balance,
  COUNT(*) FILTER (WHERE outstanding_balance > 0) AS units_with_debt,
  COUNT(*) FILTER (WHERE overdue_balance > 0) AS units_overdue,
  COUNT(*) FILTER (WHERE credit_balance > 0) AS units_with_credit,
  COUNT(*) FILTER (WHERE is_stale = true) AS stale_balances_count
FROM unit_balances
WHERE tenant_id = $1;
```

---

## 16.3. Resumen de estados de cuenta

```sql id="yc6s3t"
SELECT
  status,
  COUNT(*) AS statements_count,
  COALESCE(SUM(closing_balance), 0) AS total_closing_balance,
  COALESCE(SUM(credit_balance), 0) AS total_credit_balance
FROM account_statements
WHERE tenant_id = $1
  AND billing_period_id = $2
  AND archived_at IS NULL
GROUP BY status;
```

---

## 16.4. Pagos pendientes de validación

```sql id="d5ld0k"
SELECT
  p.id,
  p.property_unit_id,
  pu.unit_code,
  p.reported_at,
  p.amount,
  p.method,
  pr.status AS receipt_status,
  DATE_PART('day', NOW() - p.reported_at) AS days_pending
FROM payments p
JOIN property_units pu
  ON pu.id = p.property_unit_id
 AND pu.tenant_id = p.tenant_id
LEFT JOIN payment_receipts pr
  ON pr.payment_id = p.id
 AND pr.tenant_id = p.tenant_id
WHERE p.tenant_id = $1
  AND p.status IN ('reported', 'pendingValidation')
ORDER BY p.reported_at ASC
LIMIT $2 OFFSET $3;
```

---

## 16.5. Actividad administrativa

```sql id="tpg8ch"
SELECT
  id,
  action,
  category,
  actor_type,
  actor_user_id,
  resource_type,
  resource_id,
  outcome,
  occurred_at
FROM audit_logs
WHERE tenant_id = $1
  AND occurred_at BETWEEN $2 AND $3
ORDER BY occurred_at DESC
LIMIT $4 OFFSET $5;
```

---

# 17. Reglas por estados

## 17.1. Estados de cargos

Para deuda activa, excluir:

```text id="zr5tiv"
cancelled
reversed
archived
```

Para actividad histórica, pueden incluirse con filtros.

---

## 17.2. Estados de pagos

Para recaudación activa, incluir:

```text id="b8el38"
confirmed
partiallyAllocated
allocated
```

Excluir:

```text id="akybsy"
rejected
cancelled
reversed
archived
```

Para pagos pendientes de validación, incluir:

```text id="pewjo4"
reported
pendingValidation
```

---

## 17.3. Estados de payment allocations

Para pagos aplicados, incluir:

```text id="ceg1b7"
active
```

Excluir:

```text id="msjg7t"
reversed
cancelled
archived
```

---

## 17.4. Estados de account statements

Estados válidos:

```text id="geihqi"
draft
generated
published
closed
locked
superseded
archived
```

Para vigentes:

```text id="eh33th"
generated
published
closed
locked
```

Para reportes finales:

```text id="t0lc24"
published
closed
locked
```

Para históricos:

```text id="ay1bki"
superseded
archived
```

---

# 18. Contratos de columnas exportables

## 18.1. Operational Overview

Exportable como una fila resumen.

Columnas:

```text id="b0ff6r"
tenantId
generatedAt
totalUnits
activeUnits
inactiveUnits
archivedUnits
totalOwners
totalResidents
totalVehicles
totalPets
activeUsers
pendingInvitations
activeBillingPeriod
```

---

## 18.2. Property Units

Columnas base:

```text id="sv061s"
propertyUnitId
unitCode
unitType
status
ownerCount
residentCount
```

Columnas financieras con permiso:

```text id="m6e1zz"
currentBalance
overdueBalance
creditBalance
```

---

## 18.3. Residents Owners

Columnas:

```text id="t88pds"
personId
displayName
relationshipType
propertyUnitId
propertyUnitCode
status
startDate
endDate
```

---

## 18.4. Charges Summary

Columnas:

```text id="hau84v"
billingPeriodId
periodCode
chargeConceptId
chargeConceptName
chargesCount
issuedChargesCount
cancelledChargesCount
reversedChargesCount
chargesTotal
adjustmentsTotal
reversalsTotal
activeChargesTotal
```

---

## 18.5. Payments Summary

Columnas:

```text id="icphq0"
dateFrom
dateTo
paymentMethod
confirmedPaymentsTotal
pendingValidationTotal
rejectedPaymentsTotal
reversedPaymentsTotal
allocatedPaymentsTotal
unallocatedPaymentsTotal
paymentsCount
confirmedPaymentsCount
pendingValidationCount
rejectedPaymentsCount
reversedPaymentsCount
```

---

## 18.6. Pending Payment Validation

Columnas:

```text id="xokgit"
paymentId
propertyUnitId
propertyUnitCode
reportedAt
amount
method
receiptStatus
daysPending
reportedBy
```

---

## 18.7. Balances Summary

Columnas:

```text id="g19lkh"
totalOutstandingBalance
totalOverdueBalance
totalNotDueBalance
totalCreditBalance
totalUnallocatedPaymentBalance
unitsWithDebt
unitsWithCredit
unitsOverdue
staleBalancesCount
```

---

## 18.8. Account Statements Summary

Columnas:

```text id="ehv7qp"
billingPeriodId
periodCode
generatedCount
publishedCount
closedCount
lockedCount
supersededCount
archivedCount
totalClosingBalance
totalCreditBalance
statementsCount
```

---

## 18.9. Delinquency

Columnas:

```text id="gcr05a"
propertyUnitId
propertyUnitCode
overdueBalance
outstandingBalance
oldestDueDate
daysOverdue
pendingChargesCount
lastPaymentDate
lastPaymentAmount
```

---

## 18.10. Collection Summary

Columnas:

```text id="d1zvmm"
periodCode
dateFrom
dateTo
totalConfirmedPayments
totalAllocatedPayments
totalUnallocatedPayments
chargesIssued
collectionRate
paymentMethodBreakdown
```

---

## 18.11. Activity

Columnas:

```text id="y77has"
auditLogId
action
category
actorType
actorUserId
resourceType
resourceId
outcome
occurredAt
```

---

# 19. Reglas de paginación

Reportes que deben paginar:

```text id="czrq48"
propertyUnits
residentsOwners
pendingPaymentValidation
delinquency
activity
```

Reportes agregados que no requieren paginación ordinaria:

```text id="k6c4mg"
operationalOverview
financialOverview
chargesSummary
paymentsSummary
balancesSummary
accountStatementsSummary
collectionSummary
```

Aunque sean agregados, pueden tener breakdowns limitados.

---

# 20. Reglas de filtros

## 20.1. Filtros comunes

```text id="fu7zv1"
billingPeriodId
periodCode
dateFrom
dateTo
asOfDate
page
pageSize
sortBy
sortOrder
```

---

## 20.2. Filtros financieros

```text id="oy7a3v"
propertyUnitId
chargeConceptId
paymentMethod
status
includeReversed
includeCancelled
includeUnallocated
```

Defaults:

```text id="jpbkby"
includeReversed = false
includeCancelled = false
includeUnallocated = true
```

---

## 20.3. Filtros de unidad

```text id="t6w4ab"
status
unitType
hasDebt
hasCredit
overdueOnly
```

---

## 20.4. Filtros de residentes/propietarios

```text id="tjlzmd"
relationshipType
propertyUnitId
status
includeEnded
```

---

## 20.5. Filtros de actividad

```text id="pwuxfz"
actorUserId
category
action
resourceType
outcome
```

---

# 21. Ordenamiento permitido

## 21.1. Property Units

```text id="rvgc7f"
unitCode
status
unitType
currentBalance
overdueBalance
creditBalance
```

Los campos financieros solo si el usuario tiene permiso financiero.

---

## 21.2. Residents Owners

```text id="l1jt62"
displayName
relationshipType
propertyUnitCode
status
startDate
endDate
```

---

## 21.3. Pending Payment Validation

```text id="baoe1f"
reportedAt
amount
daysPending
method
propertyUnitCode
```

---

## 21.4. Delinquency

```text id="gqpghy"
overdueBalance
outstandingBalance
oldestDueDate
daysOverdue
propertyUnitCode
lastPaymentDate
```

---

## 21.5. Activity

```text id="vlk5eg"
occurredAt
action
category
outcome
resourceType
actorUserId
```

---

# 22. Reglas de advertencias

Los reportes pueden incluir advertencias no bloqueantes.

Ejemplos:

```text id="u1hxhl"
STALE_BALANCES_PRESENT
NO_ACTIVE_BILLING_PERIOD
PARTIAL_DATA
DATE_RANGE_TRUNCATED
EXPORT_ROW_LIMIT_APPLIED
REPORT_SOURCE_EMPTY
```

Formato:

```json id="xlyzg7"
{
  "warnings": [
    {
      "code": "STALE_BALANCES_PRESENT",
      "message": "Some balances may require recalculation."
    }
  ]
}
```

---

# 23. Reglas de errores

Errores principales:

```text id="k65w95"
REPORT_NOT_FOUND
REPORT_FORBIDDEN
REPORT_FINANCIAL_PERMISSION_REQUIRED
REPORT_PERSONAL_DATA_PERMISSION_REQUIRED
REPORT_ACTIVITY_PERMISSION_REQUIRED
REPORT_EXPORT_FORBIDDEN
REPORT_EXPORT_FORMAT_NOT_SUPPORTED
REPORT_EXPORT_TOO_LARGE
REPORT_INVALID_FILTER
REPORT_INVALID_DATE_RANGE
REPORT_INVALID_PERIOD
REPORT_INVALID_SORT
REPORT_CROSS_TENANT_REFERENCE
```

---

# 24. Prisma

## 24.1. Modelos nuevos

No se agregan modelos Prisma obligatorios para MVP.

```prisma id="h1uq50"
// No required Prisma models for 008-basic-reports MVP.
```

---

## 24.2. Repositorio de lectura

Crear implementación:

```text id="k4y04b"
PrismaReportsReaderRepository
```

Responsabilidad:

* ejecutar consultas read-only;
* usar modelos Prisma existentes;
* aplicar tenant filters;
* devolver DTOs de reporte;
* no exponer entidades transaccionales completas;
* evitar N+1 queries;
* centralizar agregaciones.

---

## 24.3. `$queryRaw` controlado

Se permite usar SQL raw para agregaciones complejas si:

```text id="zlttli"
usa parámetros bind
no concatena input
filtra tenantId
tiene tests
está encapsulado en repositorio
```

Prohibido:

```text id="xrk0a6"
query raw concatenando strings de usuario
sortBy directo sin whitelist
resourceId sin validación
tenantId desde body
```

---

# 25. Seguridad del modelo

## 25.1. Multitenancy

Todo repositorio debe recibir `tenantId` desde `ReportContext`, no desde body.

Regla:

```text id="ekzm5d"
tenantId no se acepta como filtro en endpoints tenant.
```

---

## 25.2. Datos personales

Filtrar columnas según permisos.

Sin `reports.readPersonalData`, no exponer:

```text id="e1apdv"
displayName de personas
identificaciones
emails
teléfonos
direcciones
datos de emergencia
```

---

## 25.3. Datos financieros

Sin `reports.readFinancial`, no exponer:

```text id="p64ig7"
balances
deuda
pagos
cargos
morosidad
recaudación
```

---

## 25.4. Exportación

La exportación debe aplicar las mismas reglas de visibilidad que la consulta.

---

# 26. Auditoría del módulo

## 26.1. Eventos obligatorios

Exportaciones:

```text id="dszsgb"
report.exported
financialReport.exported
personalDataReport.exported
activityReport.exported
```

---

## 26.2. Eventos recomendados

Consultas sensibles:

```text id="y8hvw5"
report.viewedSensitive
financialReport.viewed
personalDataReport.viewed
activityReport.viewed
```

Accesos denegados:

```text id="kw1ov5"
report.accessDenied
financialReport.accessDenied
personalDataReport.accessDenied
```

---

## 26.3. Metadata permitida

```text id="w0m4sr"
reportKey
format
filters sanitizados
rowCount
result
traceId
```

Prohibido:

```text id="i0rgoc"
resultado completo
CSV completo
JSON exportado completo
datos personales innecesarios
payload completo
```

---

# 27. Performance

## 27.1. Objetivos MVP

```text id="in1mjc"
hasta 500 unidades por tenant
hasta 24 periodos consultables
hasta 10.000 movimientos financieros por tenant
```

---

## 27.2. Estrategias

* usar agregaciones SQL;
* filtrar por tenant;
* filtrar por periodo;
* paginar reportes detallados;
* evitar joins innecesarios;
* evitar N+1;
* usar `unit_balances` para saldos;
* usar `account_statements` para statements;
* usar índices existentes.

---

## 27.3. Optimización futura

Si se detectan cuellos de botella:

```text id="lg4tq3"
materialized views
report_snapshots
precomputed aggregates
read replicas
cache con invalidación
partitioning
data warehouse
```

---

# 28. Modelos futuros diferidos

## 28.1. `report_snapshots`

Uso futuro:

* conservar resultados de reportes oficiales;
* permitir comparación histórica;
* evitar recalcular reportes pesados;
* generar evidencia de cierre.

Columnas posibles:

```text id="c1n1g3"
id
tenant_id
report_key
filters
result_hash
summary
generated_by
generated_at
created_at
archived_at
```

---

## 28.2. `report_exports`

Uso futuro:

* almacenar solicitudes de exportación;
* controlar descarga;
* registrar expiración;
* enlazar archivo en storage.

Columnas posibles:

```text id="a4ob61"
id
tenant_id
report_key
format
filters
file_id
row_count
requested_by
requested_at
completed_at
expires_at
status
```

---

## 28.3. `scheduled_reports`

Uso futuro:

* programar reportes;
* integración con email/WhatsApp/n8n;
* reportes periódicos.

Columnas posibles:

```text id="mlxroj"
id
tenant_id
report_key
schedule
format
recipients
created_by
status
last_run_at
next_run_at
```

---

## 28.4. `report_templates`

Uso futuro:

* reportes personalizados;
* filtros guardados;
* columnas configurables.

Columnas posibles:

```text id="kkhl5b"
id
tenant_id
name
report_key
filters
columns
created_by
visibility
created_at
updated_at
```

---

# 29. Seeds

## 29.1. Seeds propios

MVP:

```text id="vs8smx"
No se requieren seeds propios de reportes.
```

---

## 29.2. Fixtures para pruebas

Usar datos de:

```text id="jszedw"
001-tenants
002-users-roles
003-residents-properties
004-dues-fees
005-payments
006-account-statements
007-audit
```

---

## 29.3. Datos requeridos para pruebas

```text id="wxhwgi"
tenant demo A
tenant demo B
unidades activas
unidades inactivas
propietarios
residentes
cargos emitidos
cargos cancelados
cargos reversados
pagos confirmados
pagos pendientes
pagos rechazados
pagos reversados
allocations activas
allocations reversadas
unit balances
account statements
audit logs
```

---

# 30. Tests de modelo requeridos

## 30.1. Unit tests

Probar:

```text id="y5zlrf"
ReportKey
ReportCategory
ReportFormat
ReportPeriod
ReportDateRange
ReportMoney
ReportPagination
ReportSort
```

---

## 30.2. Repository tests

Probar:

```text id="x0ypmn"
operational overview query
financial overview query
property units query
residents owners query
charges summary query
payments summary query
pending validation query
balances summary query
account statements summary query
delinquency query
collection summary query
activity query
```

---

## 30.3. Financial regression tests

Probar:

```text id="k4f3lf"
cargos cancelados no cuentan como deuda activa
cargos reversados no cuentan como deuda activa
pagos reversados no cuentan como recaudación activa
allocations reversadas no cuentan como pagos aplicados
pagos no asignados se muestran separados
unit_balances cuadran con balances summary
account_statements cuadran con statements summary
```

---

## 30.4. Multitenancy tests

Probar:

```text id="prsn5x"
Tenant A no ve datos Tenant B
Tenant A export no incluye datos Tenant B
resourceId de Tenant B no retorna datos en Tenant A
tenantId no se acepta desde query/body en endpoint tenant
```

---

## 30.5. Export tests

Probar:

```text id="k8l8xy"
JSON export
CSV export
CSV injection protection
columnas permitidas
permisos
auditoría de exportación
```

---

# 31. Decisión final del modelo

El módulo `008-basic-reports` no creará tablas obligatorias en MVP.

El modelo se basa en:

```text id="iwvpu1"
reportes bajo demanda
consultas read-only
fuentes transaccionales existentes
tenantId obligatorio en toda consulta
Decimal para montos
strings para montos en API
paginación en reportes detallados
permisos por categoría
exportación JSON/CSV
auditoría de exportaciones
sin materialización inicial
```

El modelo no debe aceptarse si:

```text id="yqft2c"
crea una segunda fuente de verdad financiera
mezcla datos entre tenants
usa float para dinero
modifica datos fuente
expone datos personales sin permiso
exporta campos no autorizados
incluye cargos cancelados como deuda activa
incluye pagos reversados como recaudación activa
oculta pagos no asignados dentro de pagos aplicados
permite CSV injection
omite auditoría de exportaciones
```

---

## 32. Pendientes para evolución

Los siguientes elementos quedan diferidos:

```text id="v6f58o"
report_snapshots
report_exports
scheduled_reports
report_templates
materialized views
precomputed aggregates
BI avanzado
data warehouse
PDF avanzado
envío automático
reportes con IA
comparativos históricos avanzados
reportes contables formales
```

Estos diferidos no bloquean el MVP de `008-basic-reports`.
