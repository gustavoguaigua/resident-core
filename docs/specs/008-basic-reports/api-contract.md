# API Contract — Spec 008 Basic Reports and Operational Dashboards

## 1. Información del documento

| Campo           | Valor                                                                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Proyecto        | RESIDENT Core                                                                                                                        |
| Spec ID         | 008                                                                                                                                  |
| Módulo          | Basic Reports                                                                                                                        |
| Documento       | API Contract                                                                                                                         |
| Ruta            | `docs/specs/008-basic-reports/api-contract.md`                                                                                       |
| Versión         | 0.1                                                                                                                                  |
| Estado          | needs-review                                                                                                                         |
| Fecha           | 2026-07-14                                                                                                                           |
| Documento base  | `docs/specs/008-basic-reports/spec.md`                                                                                               |
| Plan técnico    | `docs/specs/008-basic-reports/plan.md`                                                                                               |
| Modelo de datos | `docs/specs/008-basic-reports/data-model.md`                                                                                         |
| API Style       | REST                                                                                                                                 |
| API Version     | `/api/v1`                                                                                                                            |
| Formato         | JSON / CSV para exportación                                                                                                          |
| Autorización    | Tenant-aware RBAC + permisos de reportes                                                                                             |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements`, `007-audit` |

---

## 2. Propósito

Este documento define el contrato API del módulo `008-basic-reports`.

El módulo expone endpoints de consulta y exportación para reportes básicos operativos, financieros, personales y de actividad administrativa.

La API debe permitir:

* consultar resumen operativo;
* consultar resumen financiero;
* consultar unidades habitacionales;
* consultar residentes y propietarios;
* consultar cargos;
* consultar pagos;
* consultar pagos pendientes de validación;
* consultar saldos;
* consultar estados de cuenta;
* consultar morosidad básica;
* consultar recaudación;
* consultar actividad administrativa;
* exportar reportes en JSON o CSV;
* auditar exportaciones;
* proteger reportes por permisos;
* mantener aislamiento multitenant.

Regla central:

```text id="ucmx96"
La API de reportes debe ser read-only, tenant-scoped, permissioned, financieramente consistente y segura para exportación.
```

---

## 3. Principios del contrato API

### 3.1. API read-only

La API de reportes solo permite consultas y exportaciones.

Permitido:

```text id="r0t32k"
GET reportes
GET exportaciones
```

No permitido:

```text id="becd6l"
POST para crear reportes transaccionales
PUT para modificar reportes
PATCH para modificar datos fuente
DELETE para eliminar reportes
crear cargos desde reportes
confirmar pagos desde reportes
generar estados de cuenta desde reportes
recalcular balances desde reportes
```

---

### 3.2. Tenant-scoped obligatorio

Todos los endpoints están bajo:

```text id="dvr4nl"
/api/v1/tenant/reports
```

Regla:

```text id="ugz44s"
Todos los reportes deben ejecutarse con tenantId = currentTenant.id.
```

El cliente no debe enviar `tenantId` en query, body ni path en endpoints tenant.

---

### 3.3. Permisos por categoría

No todos los reportes tienen la misma sensibilidad.

Categorías:

```text id="vug4rh"
operational
financial
personalData
activity
mixed
```

Permisos base:

```text id="ioriyg"
reports.read
reports.readFinancial
reports.readPersonalData
reports.readActivity
reports.export
reports.exportFinancial
reports.exportPersonalData
reports.exportActivity
```

---

### 3.4. Exportación controlada

Toda exportación requiere permiso explícito.

Regla:

```text id="j0zrkg"
reports.read no implica reports.export.
```

Toda exportación debe auditarse usando `007-audit`.

---

### 3.5. Montos como string

Todo monto monetario debe devolverse como string decimal.

Ejemplo:

```json id="eihdhq"
{
  "totalOutstandingBalance": "1250.75"
}
```

Prohibido devolver dinero como float.

---

### 3.6. CSV seguro

Toda exportación CSV debe neutralizar valores que empiecen con:

```text id="dbjqx0"
=
+
-
@
```

---

### 3.7. Respuestas consistentes

Todos los endpoints deben usar wrapper estándar:

```json id="pkmucn"
{
  "data": {},
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 4. Respuesta estándar

### 4.1. Respuesta individual

```json id="lzpd4s"
{
  "data": {},
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

### 4.2. Respuesta paginada

```json id="yswq86"
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

### 4.3. Respuesta con advertencias

```json id="k47tgu"
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

### 4.4. Error estándar

```json id="o5hmxb"
{
  "error": {
    "code": "REPORT_FORBIDDEN",
    "message": "You are not allowed to access this report.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

## 5. Headers

### 5.1. Request headers

| Header             |   Requerido | Descripción                     |
| ------------------ | ----------: | ------------------------------- |
| `Authorization`    |          Sí | Bearer token                    |
| `Accept`           | Recomendado | `application/json` o `text/csv` |
| `X-Request-Id`     |    Opcional | ID del request                  |
| `X-Correlation-Id` |    Opcional | ID de correlación               |

---

### 5.2. Response headers

| Header             | Descripción                     |
| ------------------ | ------------------------------- |
| `Content-Type`     | `application/json` o `text/csv` |
| `X-Request-Id`     | ID del request                  |
| `X-Correlation-Id` | ID de correlación si aplica     |

---

## 6. Estados HTTP

| Código | Uso                            |
| -----: | ------------------------------ |
|    200 | Consulta o exportación exitosa |
|    400 | Request mal formado            |
|    401 | No autenticado                 |
|    403 | Sin permiso                    |
|    404 | Reporte no encontrado          |
|    409 | Conflicto de política          |
|    422 | Validación semántica fallida   |
|    429 | Rate limit                     |
|    500 | Error interno                  |

---

## 7. Paginación

Parámetros comunes:

| Query param |   Tipo | Default | Máximo |
| ----------- | -----: | ------: | -----: |
| `page`      | number |       1 |      — |
| `pageSize`  | number |      20 |    100 |

Aplica a:

```text id="lnn50l"
propertyUnits
residentsOwners
pendingPaymentValidation
delinquency
activity
```

Regla:

```text id="za90mj"
pageSize > 100 debe retornar 422.
```

---

## 8. Ordenamiento

Parámetros comunes:

| Query param | Tipo   | Default             |
| ----------- | ------ | ------------------- |
| `sortBy`    | string | depende del reporte |
| `sortOrder` | string | `asc` o `desc`      |

Regla:

```text id="agtzhr"
Cada reporte debe definir su propia whitelist de sortBy.
```

No permitir:

```text id="f3y7us"
sortBy arbitrario
sortBy interpolado directamente en SQL
sortBy enviado sin validación
```

---

## 9. Filtros comunes

Filtros compartidos:

```text id="esrtj3"
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

Reglas:

* `periodCode` debe tener formato `YYYY-MM`;
* `dateFrom <= dateTo`;
* `billingPeriodId` debe pertenecer al tenant;
* `asOfDate` debe ser fecha válida;
* `pageSize <= 100`.

---

# 10. API base

Ruta base:

```text id="pfqz6l"
/api/v1/tenant/reports
```

Guards requeridos en todos los endpoints:

```text id="w5bklj"
AuthGuard
TenantGuard
TenantPermissionGuard
ReportPermissionGuard
```

Guards adicionales según reporte:

```text id="ksfvlw"
FinancialReportGuard
PersonalDataReportGuard
ReportExportGuard
```

---

# 11. Operational Overview Report

## 11.1. Endpoint

```http id="gpay9n"
GET /api/v1/tenant/reports/operational-overview
```

## 11.2. ReportKey

```text id="fszt05"
operationalOverview
```

## 11.3. Permiso

```text id="flclnn"
reports.read
```

## 11.4. Query params

No requiere filtros obligatorios.

Opcional:

| Nombre     | Tipo | Descripción             |
| ---------- | ---- | ----------------------- |
| `asOfDate` | date | Fecha de corte opcional |

## 11.5. Response 200

```json id="r4ktqp"
{
  "data": {
    "reportKey": "operationalOverview",
    "tenantId": "tenant_uuid",
    "generatedAt": "2026-07-14T10:00:00Z",
    "asOfDate": "2026-07-14",
    "summary": {
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
      },
      "billing": {
        "activeBillingPeriodId": "billing_period_uuid",
        "activePeriodCode": "2026-07"
      }
    }
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 12. Financial Overview Report

## 12.1. Endpoint

```http id="s5j2vy"
GET /api/v1/tenant/reports/financial-overview
```

## 12.2. ReportKey

```text id="feploh"
financialOverview
```

## 12.3. Permiso

```text id="ez8eou"
reports.readFinancial
```

## 12.4. Query params

| Nombre               | Tipo    | Requerido | Descripción        |
| -------------------- | ------- | --------: | ------------------ |
| `billingPeriodId`    | string  |        No | Periodo financiero |
| `periodCode`         | string  |        No | Formato `YYYY-MM`  |
| `asOfDate`           | date    |        No | Fecha de corte     |
| `includeReversed`    | boolean |        No | Default `false`    |
| `includeCancelled`   | boolean |        No | Default `false`    |
| `includeUnallocated` | boolean |        No | Default `true`     |

Regla:

```text id="rlu3mp"
Si billingPeriodId y periodCode se envían juntos, deben representar el mismo periodo.
```

## 12.5. Response 200

```json id="kl4v0q"
{
  "data": {
    "reportKey": "financialOverview",
    "tenantId": "tenant_uuid",
    "generatedAt": "2026-07-14T10:00:00Z",
    "asOfDate": "2026-07-14",
    "periodCode": "2026-07",
    "totals": {
      "chargesIssued": "3000.00",
      "paymentsConfirmed": "2500.00",
      "paymentsAllocated": "2400.00",
      "unallocatedPayments": "100.00",
      "outstandingBalance": "600.00",
      "overdueBalance": "400.00",
      "notDueBalance": "200.00",
      "creditBalance": "50.00",
      "collectionRate": "0.80"
    },
    "counts": {
      "unitsWithDebt": 12,
      "unitsOverdue": 8,
      "unitsWithCredit": 2,
      "staleBalancesCount": 0
    },
    "warnings": []
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 13. Property Units Report

## 13.1. Endpoint

```http id="rb453u"
GET /api/v1/tenant/reports/property-units
```

## 13.2. ReportKey

```text id="oqob36"
propertyUnits
```

## 13.3. Permiso base

```text id="j7fzda"
reports.read
```

## 13.4. Permiso adicional

Para incluir saldos:

```text id="buu0cl"
reports.readFinancial
```

## 13.5. Query params

| Nombre            | Tipo    | Descripción                       |
| ----------------- | ------- | --------------------------------- |
| `status`          | string  | Estado de unidad                  |
| `unitType`        | string  | Tipo de unidad                    |
| `hasDebt`         | boolean | Filtra unidades con deuda         |
| `hasCredit`       | boolean | Filtra unidades con saldo a favor |
| `overdueOnly`     | boolean | Filtra unidades con mora          |
| `includeBalances` | boolean | Incluye saldos si hay permiso     |
| `page`            | number  | Página                            |
| `pageSize`        | number  | Tamaño                            |
| `sortBy`          | string  | Campo permitido                   |
| `sortOrder`       | string  | asc/desc                          |

`sortBy` permitido:

```text id="i4cckx"
unitCode
status
unitType
currentBalance
overdueBalance
creditBalance
```

Campos financieros de ordenamiento requieren permiso financiero.

## 13.6. Response 200 sin saldos

```json id="hjf7yj"
{
  "data": {
    "reportKey": "propertyUnits",
    "tenantId": "tenant_uuid",
    "generatedAt": "2026-07-14T10:00:00Z",
    "rows": [
      {
        "propertyUnitId": "property_unit_uuid",
        "unitCode": "Casa 01",
        "unitType": "house",
        "status": "active",
        "ownerCount": 1,
        "residentCount": 4
      }
    ]
  },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1,
    "traceId": "req_123456"
  }
}
```

## 13.7. Response 200 con saldos

```json id="wx04pw"
{
  "data": {
    "reportKey": "propertyUnits",
    "tenantId": "tenant_uuid",
    "generatedAt": "2026-07-14T10:00:00Z",
    "rows": [
      {
        "propertyUnitId": "property_unit_uuid",
        "unitCode": "Casa 01",
        "unitType": "house",
        "status": "active",
        "ownerCount": 1,
        "residentCount": 4,
        "currentBalance": "100.00",
        "overdueBalance": "50.00",
        "creditBalance": "0.00"
      }
    ]
  },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1,
    "traceId": "req_123456"
  }
}
```

---

# 14. Residents and Owners Report

## 14.1. Endpoint

```http id="av9ewo"
GET /api/v1/tenant/reports/residents-owners
```

## 14.2. ReportKey

```text id="gt5t06"
residentsOwners
```

## 14.3. Permiso

```text id="g7nezl"
reports.readPersonalData
```

## 14.4. Query params

| Nombre             | Tipo    | Descripción                    |
| ------------------ | ------- | ------------------------------ |
| `relationshipType` | string  | owner/resident/tenant          |
| `propertyUnitId`   | string  | Unidad                         |
| `status`           | string  | Estado                         |
| `includeEnded`     | boolean | Incluir relaciones finalizadas |
| `page`             | number  | Página                         |
| `pageSize`         | number  | Tamaño                         |
| `sortBy`           | string  | Campo                          |
| `sortOrder`        | string  | asc/desc                       |

`sortBy` permitido:

```text id="uxy5as"
displayName
relationshipType
propertyUnitCode
status
startDate
endDate
```

## 14.5. Response 200

```json id="j3r6n6"
{
  "data": {
    "reportKey": "residentsOwners",
    "tenantId": "tenant_uuid",
    "generatedAt": "2026-07-14T10:00:00Z",
    "rows": [
      {
        "personId": "person_uuid",
        "displayName": "Persona Demo",
        "relationshipType": "owner",
        "propertyUnitId": "property_unit_uuid",
        "propertyUnitCode": "Casa 01",
        "status": "active",
        "startDate": "2026-01-01",
        "endDate": null
      }
    ]
  },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1,
    "traceId": "req_123456"
  }
}
```

---

# 15. Charges Summary Report

## 15.1. Endpoint

```http id="zve29s"
GET /api/v1/tenant/reports/charges/summary
```

## 15.2. ReportKey

```text id="zfbu5c"
chargesSummary
```

## 15.3. Permiso

```text id="s0ofg1"
reports.readFinancial
```

## 15.4. Query params

| Nombre             | Tipo    | Descripción     |
| ------------------ | ------- | --------------- |
| `billingPeriodId`  | string  | Periodo         |
| `periodCode`       | string  | `YYYY-MM`       |
| `chargeConceptId`  | string  | Concepto        |
| `includeCancelled` | boolean | Default `false` |
| `includeReversed`  | boolean | Default `false` |

## 15.5. Response 200

```json id="j3iovj"
{
  "data": {
    "reportKey": "chargesSummary",
    "tenantId": "tenant_uuid",
    "generatedAt": "2026-07-14T10:00:00Z",
    "periodCode": "2026-07",
    "rows": [
      {
        "billingPeriodId": "billing_period_uuid",
        "periodCode": "2026-07",
        "chargeConceptId": "charge_concept_uuid",
        "chargeConceptName": "Alícuota ordinaria",
        "chargesCount": 60,
        "issuedChargesCount": 58,
        "cancelledChargesCount": 1,
        "reversedChargesCount": 1,
        "chargesTotal": "3000.00",
        "adjustmentsTotal": "0.00",
        "reversalsTotal": "50.00",
        "activeChargesTotal": "2950.00"
      }
    ],
    "totals": {
      "chargesTotal": "3000.00",
      "activeChargesTotal": "2950.00",
      "adjustmentsTotal": "0.00",
      "reversalsTotal": "50.00"
    }
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 16. Payments Summary Report

## 16.1. Endpoint

```http id="osk9a3"
GET /api/v1/tenant/reports/payments/summary
```

## 16.2. ReportKey

```text id="jrzl2e"
paymentsSummary
```

## 16.3. Permiso

```text id="ohnsx8"
reports.readFinancial
```

## 16.4. Query params

| Nombre               | Tipo     | Descripción     |
| -------------------- | -------- | --------------- |
| `dateFrom`           | datetime | Desde           |
| `dateTo`             | datetime | Hasta           |
| `billingPeriodId`    | string   | Periodo         |
| `periodCode`         | string   | `YYYY-MM`       |
| `paymentMethod`      | string   | Método          |
| `status`             | string   | Estado          |
| `includeReversed`    | boolean  | Default `false` |
| `includeUnallocated` | boolean  | Default `true`  |

## 16.5. Response 200

```json id="lhh2bb"
{
  "data": {
    "reportKey": "paymentsSummary",
    "tenantId": "tenant_uuid",
    "generatedAt": "2026-07-14T10:00:00Z",
    "dateFrom": "2026-07-01T00:00:00Z",
    "dateTo": "2026-07-31T23:59:59Z",
    "totals": {
      "confirmedPaymentsTotal": "2500.00",
      "pendingValidationTotal": "300.00",
      "rejectedPaymentsTotal": "100.00",
      "reversedPaymentsTotal": "50.00",
      "allocatedPaymentsTotal": "2400.00",
      "unallocatedPaymentsTotal": "100.00"
    },
    "counts": {
      "paymentsCount": 40,
      "confirmedPaymentsCount": 35,
      "pendingValidationCount": 3,
      "rejectedPaymentsCount": 1,
      "reversedPaymentsCount": 1
    },
    "paymentMethodBreakdown": [
      {
        "method": "bankTransfer",
        "amount": "2000.00",
        "count": 30
      },
      {
        "method": "cash",
        "amount": "500.00",
        "count": 5
      }
    ]
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 17. Pending Payment Validation Report

## 17.1. Endpoint

```http id="bdr3wj"
GET /api/v1/tenant/reports/payments/pending-validation
```

## 17.2. ReportKey

```text id="eibyv7"
pendingPaymentValidation
```

## 17.3. Permiso

```text id="w53c68"
reports.readFinancial
```

## 17.4. Query params

| Nombre           | Tipo     | Descripción            |
| ---------------- | -------- | ---------------------- |
| `dateFrom`       | datetime | Desde                  |
| `dateTo`         | datetime | Hasta                  |
| `method`         | string   | Método                 |
| `receiptStatus`  | string   | Estado comprobante     |
| `daysPendingMin` | number   | Días mínimos pendiente |
| `page`           | number   | Página                 |
| `pageSize`       | number   | Tamaño                 |
| `sortBy`         | string   | Campo                  |
| `sortOrder`      | string   | asc/desc               |

`sortBy` permitido:

```text id="xvxn2c"
reportedAt
amount
daysPending
method
propertyUnitCode
```

## 17.5. Response 200

```json id="csui6l"
{
  "data": {
    "reportKey": "pendingPaymentValidation",
    "tenantId": "tenant_uuid",
    "generatedAt": "2026-07-14T10:00:00Z",
    "rows": [
      {
        "paymentId": "payment_uuid",
        "propertyUnitId": "property_unit_uuid",
        "propertyUnitCode": "Casa 01",
        "reportedAt": "2026-07-10T14:00:00Z",
        "amount": "100.00",
        "method": "bankTransfer",
        "receiptStatus": "uploaded",
        "daysPending": 4,
        "reportedBy": "user_uuid"
      }
    ]
  },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1,
    "traceId": "req_123456"
  }
}
```

---

# 18. Balances Summary Report

## 18.1. Endpoint

```http id="f0pu95"
GET /api/v1/tenant/reports/balances/summary
```

## 18.2. ReportKey

```text id="nv85ws"
balancesSummary
```

## 18.3. Permiso

```text id="lmmecr"
reports.readFinancial
```

## 18.4. Query params

| Nombre         | Tipo    | Descripción            |
| -------------- | ------- | ---------------------- |
| `asOfDate`     | date    | Fecha de corte         |
| `includeStale` | boolean | Incluir saldos stale   |
| `overdueOnly`  | boolean | Solo unidades con mora |

## 18.5. Response 200

```json id="q24gql"
{
  "data": {
    "reportKey": "balancesSummary",
    "tenantId": "tenant_uuid",
    "generatedAt": "2026-07-14T10:00:00Z",
    "asOfDate": "2026-07-14",
    "totals": {
      "totalOutstandingBalance": "1000.00",
      "totalOverdueBalance": "600.00",
      "totalNotDueBalance": "400.00",
      "totalCreditBalance": "80.00",
      "totalUnallocatedPaymentBalance": "120.00"
    },
    "counts": {
      "unitsWithDebt": 15,
      "unitsWithCredit": 3,
      "unitsOverdue": 10,
      "staleBalancesCount": 0
    },
    "warnings": []
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 19. Account Statements Summary Report

## 19.1. Endpoint

```http id="uz51wa"
GET /api/v1/tenant/reports/account-statements/summary
```

## 19.2. ReportKey

```text id="tt0a3b"
accountStatementsSummary
```

## 19.3. Permiso

```text id="vs50f6"
reports.readFinancial
```

## 19.4. Query params

| Nombre            | Tipo   | Descripción |
| ----------------- | ------ | ----------- |
| `billingPeriodId` | string | Periodo     |
| `periodCode`      | string | `YYYY-MM`   |
| `status`          | string | Estado      |

## 19.5. Response 200

```json id="mcrh1d"
{
  "data": {
    "reportKey": "accountStatementsSummary",
    "tenantId": "tenant_uuid",
    "generatedAt": "2026-07-14T10:00:00Z",
    "periodCode": "2026-07",
    "rows": [
      {
        "status": "generated",
        "statementsCount": 10,
        "totalClosingBalance": "500.00",
        "totalCreditBalance": "20.00"
      },
      {
        "status": "published",
        "statementsCount": 50,
        "totalClosingBalance": "2500.00",
        "totalCreditBalance": "60.00"
      }
    ],
    "totals": {
      "generatedCount": 10,
      "publishedCount": 50,
      "closedCount": 0,
      "lockedCount": 0,
      "supersededCount": 0,
      "archivedCount": 0,
      "totalClosingBalance": "3000.00",
      "totalCreditBalance": "80.00",
      "statementsCount": 60
    }
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 20. Basic Delinquency Report

## 20.1. Endpoint

```http id="f5pyjy"
GET /api/v1/tenant/reports/delinquency
```

## 20.2. ReportKey

```text id="zlk45u"
delinquency
```

## 20.3. Permiso

```text id="gktash"
reports.readFinancial
```

## 20.4. Query params

| Nombre              | Tipo   | Descripción    |
| ------------------- | ------ | -------------- |
| `asOfDate`          | date   | Fecha de corte |
| `billingPeriodId`   | string | Periodo        |
| `periodCode`        | string | `YYYY-MM`      |
| `minOverdueBalance` | string | Monto mínimo   |
| `daysOverdueMin`    | number | Días mínimos   |
| `page`              | number | Página         |
| `pageSize`          | number | Tamaño         |
| `sortBy`            | string | Campo          |
| `sortOrder`         | string | asc/desc       |

`sortBy` permitido:

```text id="oq5g1z"
overdueBalance
outstandingBalance
oldestDueDate
daysOverdue
propertyUnitCode
lastPaymentDate
```

## 20.5. Response 200

```json id="z5bak0"
{
  "data": {
    "reportKey": "delinquency",
    "tenantId": "tenant_uuid",
    "generatedAt": "2026-07-14T10:00:00Z",
    "asOfDate": "2026-07-14",
    "rows": [
      {
        "propertyUnitId": "property_unit_uuid",
        "propertyUnitCode": "Casa 01",
        "overdueBalance": "100.00",
        "outstandingBalance": "150.00",
        "oldestDueDate": "2026-06-10",
        "daysOverdue": 34,
        "pendingChargesCount": 2,
        "lastPaymentDate": "2026-06-01",
        "lastPaymentAmount": "50.00"
      }
    ]
  },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1,
    "traceId": "req_123456"
  }
}
```

---

# 21. Collection Summary Report

## 21.1. Endpoint

```http id="uzhe5s"
GET /api/v1/tenant/reports/collections/summary
```

## 21.2. ReportKey

```text id="kq1zwx"
collectionSummary
```

## 21.3. Permiso

```text id="o3td6z"
reports.readFinancial
```

## 21.4. Query params

| Nombre            | Tipo     | Descripción |
| ----------------- | -------- | ----------- |
| `billingPeriodId` | string   | Periodo     |
| `periodCode`      | string   | `YYYY-MM`   |
| `dateFrom`        | datetime | Desde       |
| `dateTo`          | datetime | Hasta       |
| `paymentMethod`   | string   | Método      |

## 21.5. Fórmula MVP

```text id="wnk2fq"
collectionRate = totalAllocatedPayments / chargesIssued
```

Si `chargesIssued = 0`:

```text id="b7fbli"
collectionRate = null
```

## 21.6. Response 200

```json id="r4u28e"
{
  "data": {
    "reportKey": "collectionSummary",
    "tenantId": "tenant_uuid",
    "generatedAt": "2026-07-14T10:00:00Z",
    "periodCode": "2026-07",
    "dateFrom": "2026-07-01T00:00:00Z",
    "dateTo": "2026-07-31T23:59:59Z",
    "totals": {
      "totalConfirmedPayments": "2500.00",
      "totalAllocatedPayments": "2400.00",
      "totalUnallocatedPayments": "100.00",
      "chargesIssued": "3000.00",
      "collectionRate": "0.80"
    },
    "paymentMethodBreakdown": [
      {
        "method": "bankTransfer",
        "amount": "2000.00",
        "count": 30
      },
      {
        "method": "cash",
        "amount": "500.00",
        "count": 5
      }
    ]
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 22. Administrative Activity Report

## 22.1. Endpoint

```http id="xhs6zc"
GET /api/v1/tenant/reports/activity
```

## 22.2. ReportKey

```text id="wll076"
activity
```

## 22.3. Permiso

Opción principal:

```text id="ux2sd5"
reports.readActivity
```

Alternativa compatible:

```text id="t4mid1"
audit.read
```

## 22.4. Query params

| Nombre         | Tipo     | Descripción     |
| -------------- | -------- | --------------- |
| `dateFrom`     | datetime | Desde           |
| `dateTo`       | datetime | Hasta           |
| `actorUserId`  | string   | Usuario actor   |
| `category`     | string   | Categoría audit |
| `action`       | string   | Acción          |
| `resourceType` | string   | Recurso         |
| `outcome`      | string   | Resultado       |
| `page`         | number   | Página          |
| `pageSize`     | number   | Tamaño          |
| `sortBy`       | string   | Campo           |
| `sortOrder`    | string   | asc/desc        |

`sortBy` permitido:

```text id="u6l22s"
occurredAt
action
category
outcome
resourceType
actorUserId
```

## 22.5. Response 200

```json id="nynir6"
{
  "data": {
    "reportKey": "activity",
    "tenantId": "tenant_uuid",
    "generatedAt": "2026-07-14T10:00:00Z",
    "rows": [
      {
        "auditLogId": "audit_log_uuid",
        "action": "payment.confirmed",
        "category": "payments",
        "actorType": "user",
        "actorUserId": "user_uuid",
        "resourceType": "payment",
        "resourceId": "payment_uuid",
        "outcome": "success",
        "occurredAt": "2026-07-14T09:00:00Z"
      }
    ]
  },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1,
    "traceId": "req_123456"
  }
}
```

---

# 23. Export Report API

## 23.1. Endpoint

```http id="jnk6n7"
GET /api/v1/tenant/reports/{reportKey}/export
```

## 23.2. Path params

| Nombre      | Tipo   | Descripción       |
| ----------- | ------ | ----------------- |
| `reportKey` | string | Clave del reporte |

Valores permitidos:

```text id="lekzsn"
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

## 23.3. Query params

| Nombre            | Tipo     | Default | Descripción    |
| ----------------- | -------- | ------- | -------------- |
| `format`          | string   | `json`  | `json` o `csv` |
| `dateFrom`        | datetime | —       | Desde          |
| `dateTo`          | datetime | —       | Hasta          |
| `billingPeriodId` | string   | —       | Periodo        |
| `periodCode`      | string   | —       | `YYYY-MM`      |
| `asOfDate`        | date     | —       | Fecha de corte |

Además, acepta los filtros propios de cada reporte.

## 23.4. Permisos

Permiso base:

```text id="ow5zxt"
reports.export
```

Permisos adicionales:

| Reporte                    | Permiso adicional            |
| -------------------------- | ---------------------------- |
| `financialOverview`        | `reports.exportFinancial`    |
| `chargesSummary`           | `reports.exportFinancial`    |
| `paymentsSummary`          | `reports.exportFinancial`    |
| `pendingPaymentValidation` | `reports.exportFinancial`    |
| `balancesSummary`          | `reports.exportFinancial`    |
| `accountStatementsSummary` | `reports.exportFinancial`    |
| `delinquency`              | `reports.exportFinancial`    |
| `collectionSummary`        | `reports.exportFinancial`    |
| `residentsOwners`          | `reports.exportPersonalData` |
| `activity`                 | `reports.exportActivity`     |

## 23.5. Reglas

* Toda exportación se audita.
* Formatos permitidos: JSON y CSV.
* PDF queda diferido.
* CSV debe neutralizar fórmula injection.
* Se debe aplicar el mismo control de permisos que en lectura.
* No exportar columnas no autorizadas.
* No loggear el contenido completo.
* Aplicar `REPORTS_MAX_EXPORT_ROWS`.

## 23.6. Response 200 — JSON

```json id="hpb5ic"
{
  "data": {
    "reportKey": "propertyUnits",
    "format": "json",
    "tenantId": "tenant_uuid",
    "generatedAt": "2026-07-14T10:00:00Z",
    "rowCount": 1,
    "items": [
      {
        "propertyUnitId": "property_unit_uuid",
        "unitCode": "Casa 01",
        "unitType": "house",
        "status": "active",
        "ownerCount": 1,
        "residentCount": 4
      }
    ]
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

## 23.7. Response 200 — CSV

```text id="q9c09f"
Content-Type: text/csv
```

Ejemplo conceptual:

```csv id="pnvw54"
propertyUnitId,unitCode,unitType,status,ownerCount,residentCount
property_unit_uuid,Casa 01,house,active,1,4
```

## 23.8. Eventos auditables generados

Según reporte:

```text id="g8lhtd"
report.exported
financialReport.exported
personalDataReport.exported
activityReport.exported
```

Metadata permitida:

```json id="v7yiw6"
{
  "reportKey": "propertyUnits",
  "format": "csv",
  "rowCount": 60,
  "filters": {
    "status": "active"
  }
}
```

---

# 24. Matriz de permisos por endpoint

| Método | Ruta                                                 | ReportKey                  | Permiso                               |
| ------ | ---------------------------------------------------- | -------------------------- | ------------------------------------- |
| GET    | `/api/v1/tenant/reports/operational-overview`        | `operationalOverview`      | `reports.read`                        |
| GET    | `/api/v1/tenant/reports/financial-overview`          | `financialOverview`        | `reports.readFinancial`               |
| GET    | `/api/v1/tenant/reports/property-units`              | `propertyUnits`            | `reports.read`                        |
| GET    | `/api/v1/tenant/reports/residents-owners`            | `residentsOwners`          | `reports.readPersonalData`            |
| GET    | `/api/v1/tenant/reports/charges/summary`             | `chargesSummary`           | `reports.readFinancial`               |
| GET    | `/api/v1/tenant/reports/payments/summary`            | `paymentsSummary`          | `reports.readFinancial`               |
| GET    | `/api/v1/tenant/reports/payments/pending-validation` | `pendingPaymentValidation` | `reports.readFinancial`               |
| GET    | `/api/v1/tenant/reports/balances/summary`            | `balancesSummary`          | `reports.readFinancial`               |
| GET    | `/api/v1/tenant/reports/account-statements/summary`  | `accountStatementsSummary` | `reports.readFinancial`               |
| GET    | `/api/v1/tenant/reports/delinquency`                 | `delinquency`              | `reports.readFinancial`               |
| GET    | `/api/v1/tenant/reports/collections/summary`         | `collectionSummary`        | `reports.readFinancial`               |
| GET    | `/api/v1/tenant/reports/activity`                    | `activity`                 | `reports.readActivity` o `audit.read` |
| GET    | `/api/v1/tenant/reports/{reportKey}/export`          | dinámico                   | `reports.export` + permiso específico |

---

# 25. DTOs principales

## 25.1. OperationalOverviewReportDto

```json id="wnw0b1"
{
  "reportKey": "operationalOverview",
  "tenantId": "tenant_uuid",
  "generatedAt": "2026-07-14T10:00:00Z",
  "asOfDate": "2026-07-14",
  "summary": {
    "units": {},
    "people": {},
    "assets": {},
    "access": {},
    "billing": {}
  }
}
```

---

## 25.2. FinancialOverviewReportDto

```json id="seqxds"
{
  "reportKey": "financialOverview",
  "tenantId": "tenant_uuid",
  "generatedAt": "2026-07-14T10:00:00Z",
  "periodCode": "2026-07",
  "asOfDate": "2026-07-14",
  "totals": {
    "chargesIssued": "3000.00",
    "paymentsConfirmed": "2500.00",
    "paymentsAllocated": "2400.00",
    "unallocatedPayments": "100.00",
    "outstandingBalance": "600.00",
    "overdueBalance": "400.00",
    "creditBalance": "50.00",
    "collectionRate": "0.80"
  }
}
```

---

## 25.3. PropertyUnitReportRowDto

```json id="z32k60"
{
  "propertyUnitId": "property_unit_uuid",
  "unitCode": "Casa 01",
  "unitType": "house",
  "status": "active",
  "ownerCount": 1,
  "residentCount": 4,
  "currentBalance": "100.00",
  "overdueBalance": "50.00",
  "creditBalance": "0.00"
}
```

---

## 25.4. ResidentOwnerReportRowDto

```json id="c3ysrn"
{
  "personId": "person_uuid",
  "displayName": "Persona Demo",
  "relationshipType": "owner",
  "propertyUnitId": "property_unit_uuid",
  "propertyUnitCode": "Casa 01",
  "status": "active",
  "startDate": "2026-01-01",
  "endDate": null
}
```

---

## 25.5. PendingPaymentValidationRowDto

```json id="mfwy2n"
{
  "paymentId": "payment_uuid",
  "propertyUnitId": "property_unit_uuid",
  "propertyUnitCode": "Casa 01",
  "reportedAt": "2026-07-10T14:00:00Z",
  "amount": "100.00",
  "method": "bankTransfer",
  "receiptStatus": "uploaded",
  "daysPending": 4,
  "reportedBy": "user_uuid"
}
```

---

## 25.6. DelinquencyReportRowDto

```json id="vx2igr"
{
  "propertyUnitId": "property_unit_uuid",
  "propertyUnitCode": "Casa 01",
  "overdueBalance": "100.00",
  "outstandingBalance": "150.00",
  "oldestDueDate": "2026-06-10",
  "daysOverdue": 34,
  "pendingChargesCount": 2,
  "lastPaymentDate": "2026-06-01",
  "lastPaymentAmount": "50.00"
}
```

---

## 25.7. ActivityReportRowDto

```json id="ff3qgx"
{
  "auditLogId": "audit_log_uuid",
  "action": "payment.confirmed",
  "category": "payments",
  "actorType": "user",
  "actorUserId": "user_uuid",
  "resourceType": "payment",
  "resourceId": "payment_uuid",
  "outcome": "success",
  "occurredAt": "2026-07-14T09:00:00Z"
}
```

---

# 26. Validaciones generales

## 26.1. Fechas

Validar:

```text id="ev0xyf"
dateFrom <= dateTo
asOfDate válido
date range máximo configurable
```

---

## 26.2. Periodos

Validar:

```text id="msvhxc"
periodCode formato YYYY-MM
billingPeriodId UUID válido
billingPeriodId pertenece al tenant
periodCode existe dentro del tenant
billingPeriodId y periodCode coinciden si ambos se envían
```

---

## 26.3. Money filters

Para filtros como `minOverdueBalance`:

```text id="mxayia"
string decimal válido
no float
no negativo si la regla lo requiere
```

---

## 26.4. Boolean filters

Defaults:

```text id="kl7500"
includeReversed = false
includeCancelled = false
includeUnallocated = true
includeBalances = false
includeEnded = false
```

---

## 26.5. Export format

Valores permitidos:

```text id="pd3j89"
json
csv
```

Valores rechazados:

```text id="vfqi8i"
pdf
xlsx
html
xml
```

---

# 27. Catálogo de errores

| Código                                            |    HTTP | Descripción                             |
| ------------------------------------------------- | ------: | --------------------------------------- |
| `UNAUTHORIZED`                                    |     401 | No autenticado                          |
| `FORBIDDEN`                                       |     403 | Sin permiso                             |
| `TENANT_NOT_ACTIVE`                               |     403 | Tenant no activo                        |
| `MEMBERSHIP_NOT_ACTIVE`                           |     403 | Membership no activa                    |
| `REPORT_NOT_FOUND`                                |     404 | Reporte no encontrado                   |
| `REPORT_FORBIDDEN`                                |     403 | Reporte no permitido                    |
| `REPORT_FINANCIAL_PERMISSION_REQUIRED`            |     403 | Requiere permiso financiero             |
| `REPORT_PERSONAL_DATA_PERMISSION_REQUIRED`        |     403 | Requiere permiso de datos personales    |
| `REPORT_ACTIVITY_PERMISSION_REQUIRED`             |     403 | Requiere permiso de actividad           |
| `REPORT_EXPORT_FORBIDDEN`                         |     403 | Exportación no permitida                |
| `REPORT_EXPORT_FINANCIAL_PERMISSION_REQUIRED`     |     403 | Export financiero no permitido          |
| `REPORT_EXPORT_PERSONAL_DATA_PERMISSION_REQUIRED` |     403 | Export de datos personales no permitido |
| `REPORT_EXPORT_ACTIVITY_PERMISSION_REQUIRED`      |     403 | Export de actividad no permitido        |
| `REPORT_EXPORT_FORMAT_NOT_SUPPORTED`              |     422 | Formato no soportado                    |
| `REPORT_EXPORT_TOO_LARGE`                         |     422 | Exportación demasiado grande            |
| `REPORT_INVALID_FILTER`                           |     422 | Filtro inválido                         |
| `REPORT_INVALID_DATE_RANGE`                       |     422 | Rango de fechas inválido                |
| `REPORT_DATE_RANGE_TOO_LARGE`                     |     422 | Rango demasiado amplio                  |
| `REPORT_INVALID_PERIOD`                           |     422 | Periodo inválido                        |
| `REPORT_INVALID_SORT`                             |     422 | Ordenamiento inválido                   |
| `REPORT_INVALID_MONEY_FILTER`                     |     422 | Filtro monetario inválido               |
| `REPORT_CROSS_TENANT_REFERENCE`                   | 403/422 | Referencia a recurso de otro tenant     |
| `VALIDATION_ERROR`                                |     422 | Error de validación                     |
| `RATE_LIMITED`                                    |     429 | Rate limit                              |
| `INTERNAL_ERROR`                                  |     500 | Error interno                           |

---

# 28. Ejemplos de errores

## 28.1. Sin permiso financiero

```json id="ijfd22"
{
  "error": {
    "code": "REPORT_FINANCIAL_PERMISSION_REQUIRED",
    "message": "This report requires financial report permissions.",
    "details": {
      "requiredPermission": "reports.readFinancial"
    },
    "traceId": "req_123456"
  }
}
```

---

## 28.2. Sin permiso de exportación

```json id="cnmoc2"
{
  "error": {
    "code": "REPORT_EXPORT_FORBIDDEN",
    "message": "You are not allowed to export reports.",
    "details": {
      "requiredPermission": "reports.export"
    },
    "traceId": "req_123456"
  }
}
```

---

## 28.3. Formato de exportación no soportado

```json id="kvhomg"
{
  "error": {
    "code": "REPORT_EXPORT_FORMAT_NOT_SUPPORTED",
    "message": "The requested export format is not supported.",
    "details": {
      "format": "pdf",
      "supportedFormats": ["json", "csv"]
    },
    "traceId": "req_123456"
  }
}
```

---

## 28.4. Periodo inválido

```json id="x0miih"
{
  "error": {
    "code": "REPORT_INVALID_PERIOD",
    "message": "The requested billing period is invalid.",
    "details": {
      "periodCode": "2026-13"
    },
    "traceId": "req_123456"
  }
}
```

---

## 28.5. Exportación demasiado grande

```json id="p54kdt"
{
  "error": {
    "code": "REPORT_EXPORT_TOO_LARGE",
    "message": "The report export exceeds the maximum allowed number of rows.",
    "details": {
      "maxExportRows": 10000
    },
    "traceId": "req_123456"
  }
}
```

---

# 29. Auditoría de reportes

## 29.1. Eventos obligatorios

Toda exportación debe auditarse.

Eventos:

```text id="nemout"
report.exported
financialReport.exported
personalDataReport.exported
activityReport.exported
```

---

## 29.2. Eventos recomendados para consultas sensibles

```text id="bdcm4a"
report.viewedSensitive
financialReport.viewed
personalDataReport.viewed
activityReport.viewed
```

---

## 29.3. Eventos de acceso denegado

```text id="h4t5i3"
report.accessDenied
financialReport.accessDenied
personalDataReport.accessDenied
```

---

## 29.4. Metadata permitida

```json id="kozmi6"
{
  "reportKey": "financialOverview",
  "format": "json",
  "filters": {
    "periodCode": "2026-07"
  },
  "rowCount": 1,
  "result": "success"
}
```

Prohibido:

```text id="qf9xb3"
resultado completo
CSV completo
JSON completo
datos personales innecesarios
payload completo
```

---

# 30. Seguridad de exportación CSV

## 30.1. Valores peligrosos

Neutralizar celdas que comiencen con:

```text id="xdvkdu"
=
+
-
@
```

---

## 30.2. Campos afectados

Aplica a todos los campos textuales, especialmente:

```text id="tv7or9"
unitCode
displayName
propertyUnitCode
chargeConceptName
method
receiptStatus
reportedBy
action
category
resourceType
outcome
metadata serializada
```

---

## 30.3. Regla

```text id="ni55pq"
El CSV exportado nunca debe permitir fórmula ejecutable al abrirse en una hoja de cálculo.
```

---

# 31. Rate limiting

Aplicar rate limiting a:

```text id="jmyk4i"
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

Rate limit más estricto para:

```text id="zw5rhv"
exportaciones
reportes financieros
reportes de datos personales
activity report
```

---

# 32. CORS

No usar CORS abierto en producción.

Prohibido:

```text id="s85tkx"
Access-Control-Allow-Origin: *
```

Permitir solo orígenes oficiales de RESIDENT.

---

# 33. OpenAPI

Cada endpoint debe documentar:

* `summary`;
* `description`;
* `tags`;
* `security`;
* permisos requeridos;
* query params;
* path params;
* responses;
* errores;
* ejemplos;
* rate limiting;
* export format;
* tenant scope;
* advertencias;
* campos monetarios string.

Tags sugeridos:

```text id="u32bxp"
Reports
Operational Reports
Financial Reports
Property Reports
Personal Data Reports
Activity Reports
Report Export
```

---

## 34. Extensiones OpenAPI sugeridas

### 34.1. Reporte operacional

```yaml id="qx5z3b"
x-required-permission: reports.read
x-report-key: operationalOverview
x-report-category: operational
x-tenant-scope: tenant
x-read-only: true
```

---

### 34.2. Reporte financiero

```yaml id="nfmn6r"
x-required-permission: reports.readFinancial
x-report-key: financialOverview
x-report-category: financial
x-tenant-scope: tenant
x-money-as-string: true
x-read-only: true
```

---

### 34.3. Reporte personal

```yaml id="myqee4"
x-required-permission: reports.readPersonalData
x-report-key: residentsOwners
x-report-category: personalData
x-tenant-scope: tenant
x-sensitive-personal-data: true
x-read-only: true
```

---

### 34.4. Exportación

```yaml id="e8ocvw"
x-required-permission: reports.export
x-audit-event: report.exported
x-tenant-scope: tenant
x-sensitive-export: true
x-csv-injection-protection: true
```

---

### 34.5. Exportación financiera

```yaml id="uwtm27"
x-required-permission: reports.exportFinancial
x-audit-event: financialReport.exported
x-report-category: financial
x-money-as-string: true
x-sensitive-export: true
x-csv-injection-protection: true
```

---

# 35. Pruebas de contrato requeridas

## 35.1. Reportes operativos

Probar:

* consulta exitosa;
* sin token;
* sin permiso;
* tenant isolation;
* response shape.

---

## 35.2. Reportes financieros

Probar:

* requiere `reports.readFinancial`;
* montos como string;
* exclusión de cargos cancelados;
* exclusión de pagos reversados;
* pagos no asignados separados;
* filtros por periodo.

---

## 35.3. Reportes personales

Probar:

* requiere `reports.readPersonalData`;
* no expone campos no contratados;
* paginación;
* tenant isolation.

---

## 35.4. Activity report

Probar:

* requiere `reports.readActivity` o `audit.read`;
* no expone `oldValue/newValue/metadata` completos;
* filtra por fecha, acción, categoría y actor;
* tenant isolation.

---

## 35.5. Exportación

Probar:

* JSON export;
* CSV export;
* permisos base;
* permisos adicionales;
* límite de filas;
* CSV injection;
* auditoría de exportación;
* no exporta campos no autorizados.

---

# 36. Casos borde

| Caso                                                     | Resultado esperado                     |
| -------------------------------------------------------- | -------------------------------------- |
| Sin token                                                | 401                                    |
| Usuario sin membership                                   | 403                                    |
| Usuario sin `reports.read`                               | 403                                    |
| Usuario sin `reports.readFinancial` consulta financiero  | 403                                    |
| Usuario sin `reports.readPersonalData` consulta personal | 403                                    |
| Usuario sin `reports.export` exporta                     | 403                                    |
| `periodCode` inválido                                    | 422                                    |
| `billingPeriodId` de otro tenant                         | 403/422                                |
| `dateFrom > dateTo`                                      | 422                                    |
| `pageSize > 100`                                         | 422                                    |
| `sortBy` arbitrario                                      | 422                                    |
| Export formato `pdf`                                     | 422                                    |
| Export demasiado grande                                  | 422                                    |
| CSV con fórmula                                          | neutralizado                           |
| Reporte sin datos                                        | totales 0/lista vacía                  |
| Cargos cancelados                                        | excluidos de deuda activa              |
| Pagos reversados                                         | excluidos de recaudación activa        |
| Pagos no asignados                                       | mostrados separados                    |
| Saldos stale                                             | warning                                |
| Tenant suspendido                                        | política define solo lectura o bloqueo |
| `reportKey` inválido                                     | 404/422                                |

---

# 37. Decisión final del contrato API

El módulo `008-basic-reports` expondrá endpoints bajo:

```text id="b2tpf5"
/api/v1/tenant/reports
```

La API será estrictamente read-only y permitirá exportación controlada.

Reportes MVP:

```text id="zxprtn"
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

La API debe garantizar:

```text id="niyp11"
tenant isolation
permissioned access
read-only behavior
financial consistency
money as string
safe filters
safe sorting
pagination
safe export
CSV injection protection
export audit
OpenAPI consistency
```

La implementación no debe aceptarse si permite reportes cross-tenant, modifica datos fuente, devuelve dinero como float, expone datos personales sin permiso, exporta sin permiso, omite auditoría de exportación, incluye cargos cancelados como deuda activa, incluye pagos reversados como recaudación activa o permite CSV vulnerable a fórmula injection.
