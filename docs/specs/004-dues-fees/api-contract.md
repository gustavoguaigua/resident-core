# API Contract — Spec 004 Dues, Fees, Charge Concepts and Charge Generation

## 1. Información del documento

| Campo           | Valor                                                        |
| --------------- | ------------------------------------------------------------ |
| Proyecto        | RESIDENT Core                                                |
| Spec ID         | 004                                                          |
| Módulo          | Dues and Fees                                                |
| Documento       | API Contract                                                 |
| Ruta            | `docs/specs/004-dues-fees/api-contract.md`                   |
| Versión         | 0.1                                                          |
| Estado          | Borrador inicial                                             |
| Fecha           | 2026-07-14                                                   |
| Documento base  | `docs/specs/004-dues-fees/spec.md`                           |
| Plan técnico    | `docs/specs/004-dues-fees/plan.md`                           |
| Modelo de datos | `docs/specs/004-dues-fees/data-model.md`                     |
| API Style       | REST                                                         |
| API Version     | `/api/v1`                                                    |
| Formato         | JSON                                                         |
| Autorización    | Tenant-aware RBAC + permisos financieros + `.own` policies   |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties` |

---

## 2. Propósito

Este documento define el contrato API del módulo `004-dues-fees`.

El objetivo es establecer:

* endpoints;
* métodos HTTP;
* permisos requeridos;
* requests;
* responses;
* errores;
* status codes;
* filtros;
* paginación;
* ordenamiento;
* reglas de generación mensual;
* reglas de idempotencia;
* reglas de cancelación;
* reglas de reverso;
* reglas de ajuste;
* reglas de acceso propio;
* auditoría;
* eventos;
* observabilidad;
* OpenAPI.

Este contrato será la base para:

* controladores NestJS;
* DTOs;
* guards;
* policies;
* pruebas API;
* pruebas financieras;
* pruebas de autorización;
* pruebas multitenant;
* documentación OpenAPI;
* integración futura con pagos y estados de cuenta.

---

## 3. Principios del contrato API

### 3.1. Tenant como frontera financiera

Todo endpoint administrativo financiero opera dentro del tenant activo.

Regla:

```text id="f3rq9p"
Un endpoint /api/v1/tenant/* nunca debe crear, consultar, actualizar, cancelar, reversar o ajustar cargos de otro tenant.
```

---

### 3.2. Unidad como base del cargo

Todo cargo financiero debe estar asociado a una unidad habitacional.

```text id="umq397"
Charge.propertyUnitId requerido.
```

La unidad debe pertenecer al tenant activo.

---

### 3.3. Dinero como decimal

Todos los montos monetarios se envían y reciben como string decimal.

Ejemplo:

```json id="hgp4r5"
{
  "amount": "50.00",
  "currency": "USD"
}
```

Prohibido en contrato:

```text id="2rl9xy"
float
double
number sin control decimal para dinero
```

---

### 3.4. Idempotencia en generación

La generación mensual debe ser idempotente.

Regla:

```text id="8f7hjg"
Ejecutar dos veces la generación del mismo periodo, schedule y unidad no debe duplicar cargos.
```

---

### 3.5. Monto original inmutable

El `originalAmount` de un cargo emitido no debe sobrescribirse.

Las correcciones se realizan con:

```text id="h4y4gq"
cancel
reverse
adjustments
```

---

### 3.6. No eliminación física

No se exponen endpoints `DELETE` para cargos, conceptos, schedules, periodos, batches, ajustes o reversos.

---

## 4. Respuesta estándar

### 4.1. Respuesta individual

```json id="v57oh2"
{
  "data": {},
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

### 4.2. Respuesta paginada

```json id="bl57lf"
{
  "data": [],
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

### 4.3. Error estándar

```json id="gpzyq0"
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You are not allowed to perform this action.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

## 5. Headers generales

### 5.1. Request headers

| Header             |        Requerido | Descripción                                        |
| ------------------ | ---------------: | -------------------------------------------------- |
| `Authorization`    |               Sí | Bearer token                                       |
| `Content-Type`     | Sí en POST/PATCH | `application/json`                                 |
| `Accept`           |      Recomendado | `application/json`                                 |
| `X-Request-Id`     |         Opcional | ID de request                                      |
| `X-Correlation-Id` |         Opcional | ID de correlación                                  |
| `Idempotency-Key`  |         Opcional | Recomendado para cargos manuales o extraordinarios |

---

### 5.2. Response headers

| Header             | Descripción                 |
| ------------------ | --------------------------- |
| `Content-Type`     | `application/json`          |
| `X-Request-Id`     | ID de request               |
| `X-Correlation-Id` | ID de correlación si aplica |

---

## 6. Estados HTTP

| Código | Uso                                                             |
| -----: | --------------------------------------------------------------- |
|    200 | Consulta o actualización exitosa                                |
|    201 | Recurso creado                                                  |
|    202 | Generación aceptada si se ejecuta asincrónicamente en el futuro |
|    204 | Operación exitosa sin body                                      |
|    400 | Request mal formado                                             |
|    401 | No autenticado                                                  |
|    403 | Sin permiso o acceso prohibido                                  |
|    404 | Recurso no encontrado                                           |
|    409 | Conflicto de estado, duplicidad o periodo cerrado               |
|    422 | Validación semántica fallida                                    |
|    429 | Rate limit                                                      |
|    500 | Error interno                                                   |

---

## 7. Paginación

Listados usan:

| Query param |   Tipo | Default | Máximo |
| ----------- | -----: | ------: | -----: |
| `page`      | number |       1 |      — |
| `pageSize`  | number |      20 |    100 |

Ejemplo:

```text id="p24txn"
GET /api/v1/tenant/charges?page=1&pageSize=20
```

---

## 8. Ordenamiento

Parámetros:

| Query param | Tipo   | Default     |
| ----------- | ------ | ----------- |
| `sortBy`    | string | `createdAt` |
| `sortOrder` | string | `desc`      |

Valores permitidos para `sortOrder`:

```text id="q8m4dc"
asc
desc
```

Campos permitidos:

```text id="bhp7vp"
createdAt
updatedAt
periodCode
dueDate
issuedDate
status
amount
code
name
```

No permitir ordenamiento por campos arbitrarios.

---

# 9. Charge Concepts API

Ruta base:

```text id="miltt3"
/api/v1/tenant/charge-concepts
```

Requiere:

```text id="p0yx46"
AuthGuard
TenantGuard
TenantPermissionGuard
```

---

## 9.1. Listar conceptos de cobro

### Endpoint

```http id="fj7op3"
GET /api/v1/tenant/charge-concepts
```

### Permiso

```text id="k3mi9h"
chargeConcepts.read
```

### Query params

| Nombre      | Tipo   | Descripción                                                |
| ----------- | ------ | ---------------------------------------------------------- |
| `page`      | number | Página                                                     |
| `pageSize`  | number | Tamaño                                                     |
| `status`    | string | active, inactive, archived                                 |
| `category`  | string | ordinary, extraordinary, service, fine, reservation, other |
| `search`    | string | Busca por code, name, description                          |
| `sortBy`    | string | Campo permitido                                            |
| `sortOrder` | string | asc/desc                                                   |

### Response 200

```json id="m92hil"
{
  "data": [
    {
      "id": "charge_concept_uuid",
      "tenantId": "tenant_uuid",
      "code": "monthly-dues",
      "name": "Alícuota mensual",
      "description": "Cargo mensual ordinario del conjunto.",
      "category": "ordinary",
      "defaultAmount": "50.00",
      "currency": "USD",
      "status": "active",
      "isSystem": false,
      "createdAt": "2026-07-14T10:00:00Z",
      "updatedAt": "2026-07-14T10:00:00Z"
    }
  ],
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

## 9.2. Crear concepto de cobro

### Endpoint

```http id="fppqub"
POST /api/v1/tenant/charge-concepts
```

### Permiso

```text id="vt1bgc"
chargeConcepts.create
```

### Request body

```json id="d3soif"
{
  "code": "monthly-dues",
  "name": "Alícuota mensual",
  "description": "Cargo mensual ordinario del conjunto.",
  "category": "ordinary",
  "defaultAmount": "50.00",
  "currency": "USD"
}
```

### Validaciones

* `code` requerido.
* `code` único por tenant.
* `name` requerido.
* `defaultAmount` decimal positivo si existe.
* `currency` debe ser `USD` en MVP.
* No se acepta `tenantId` en body.

### Response 201

```json id="q2d8rv"
{
  "data": {
    "id": "charge_concept_uuid",
    "tenantId": "tenant_uuid",
    "code": "monthly-dues",
    "name": "Alícuota mensual",
    "description": "Cargo mensual ordinario del conjunto.",
    "category": "ordinary",
    "defaultAmount": "50.00",
    "currency": "USD",
    "status": "active",
    "isSystem": false,
    "createdAt": "2026-07-14T10:00:00Z",
    "updatedAt": "2026-07-14T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="rxxvcd"
chargeConcept.created
```

### Evento

```text id="ea6yn6"
ChargeConceptCreated
```

---

## 9.3. Consultar concepto de cobro

### Endpoint

```http id="qa4dw9"
GET /api/v1/tenant/charge-concepts/{chargeConceptId}
```

### Permiso

```text id="y8hrvz"
chargeConcepts.read
```

### Response 200

```json id="3ieb4f"
{
  "data": {
    "id": "charge_concept_uuid",
    "tenantId": "tenant_uuid",
    "code": "monthly-dues",
    "name": "Alícuota mensual",
    "description": "Cargo mensual ordinario del conjunto.",
    "category": "ordinary",
    "defaultAmount": "50.00",
    "currency": "USD",
    "status": "active",
    "isSystem": false,
    "createdAt": "2026-07-14T10:00:00Z",
    "updatedAt": "2026-07-14T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 9.4. Actualizar concepto de cobro

### Endpoint

```http id="x9m0ic"
PATCH /api/v1/tenant/charge-concepts/{chargeConceptId}
```

### Permiso

```text id="6zhnj4"
chargeConcepts.update
```

### Request body

```json id="6egvun"
{
  "name": "Alícuota mensual ordinaria",
  "description": "Cargo mensual ordinario actualizado.",
  "defaultAmount": "55.00",
  "status": "active"
}
```

### Campos restringidos

No modificar por este endpoint:

```text id="zz8xjx"
id
tenantId
createdAt
isSystem si no existe permiso especial
```

### Response 200

```json id="mqu52h"
{
  "data": {
    "id": "charge_concept_uuid",
    "code": "monthly-dues",
    "name": "Alícuota mensual ordinaria",
    "defaultAmount": "55.00",
    "currency": "USD",
    "status": "active",
    "updatedAt": "2026-07-14T11:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="gfbwrh"
chargeConcept.updated
```

---

## 9.5. Archivar concepto de cobro

### Endpoint

```http id="jpu2df"
POST /api/v1/tenant/charge-concepts/{chargeConceptId}/archive
```

### Permiso

```text id="3hzozq"
chargeConcepts.archive
```

### Request body

```json id="vjjxyi"
{
  "reason": "Concepto reemplazado por una nueva configuración."
}
```

### Response 200

```json id="0hcak1"
{
  "data": {
    "id": "charge_concept_uuid",
    "status": "archived",
    "archivedAt": "2026-07-14T11:10:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Regla

No eliminar físicamente.

### Auditoría

```text id="775lnz"
chargeConcept.archived
```

---

# 10. Fee Schedules API

Ruta base:

```text id="relx2o"
/api/v1/tenant/fee-schedules
```

---

## 10.1. Listar configuraciones de alícuotas

### Endpoint

```http id="vvz35m"
GET /api/v1/tenant/fee-schedules
```

### Permiso

```text id="6ye5oh"
feeSchedules.read
```

### Query params

| Nombre            | Tipo   | Descripción                         |
| ----------------- | ------ | ----------------------------------- |
| `page`            | number | Página                              |
| `pageSize`        | number | Tamaño                              |
| `status`          | string | active, inactive, archived          |
| `chargeConceptId` | string | Filtrar por concepto                |
| `frequency`       | string | monthly, quarterly, annual, oneTime |
| `effectiveDate`   | date   | Schedules vigentes en una fecha     |

### Response 200

```json id="0pxu35"
{
  "data": [
    {
      "id": "fee_schedule_uuid",
      "tenantId": "tenant_uuid",
      "chargeConceptId": "charge_concept_uuid",
      "chargeConcept": {
        "id": "charge_concept_uuid",
        "code": "monthly-dues",
        "name": "Alícuota mensual"
      },
      "name": "Alícuota mensual estándar",
      "amount": "50.00",
      "currency": "USD",
      "frequency": "monthly",
      "effectiveFrom": "2026-07-01",
      "effectiveTo": null,
      "status": "active",
      "createdAt": "2026-07-14T10:00:00Z",
      "updatedAt": "2026-07-14T10:00:00Z"
    }
  ],
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

## 10.2. Crear FeeSchedule

### Endpoint

```http id="8w0gyr"
POST /api/v1/tenant/fee-schedules
```

### Permiso

```text id="2kk0iz"
feeSchedules.create
```

### Request body

```json id="1m1g8b"
{
  "chargeConceptId": "charge_concept_uuid",
  "name": "Alícuota mensual estándar",
  "amount": "50.00",
  "currency": "USD",
  "frequency": "monthly",
  "effectiveFrom": "2026-07-01",
  "effectiveTo": null
}
```

### Validaciones

* `chargeConceptId` requerido.
* Concepto debe pertenecer al tenant.
* Concepto debe estar activo.
* `amount` debe ser decimal positivo.
* `currency` debe ser `USD`.
* `frequency` válida.
* `effectiveTo >= effectiveFrom` si existe.
* No se acepta `tenantId` en body.

### Response 201

```json id="hfqkkk"
{
  "data": {
    "id": "fee_schedule_uuid",
    "tenantId": "tenant_uuid",
    "chargeConceptId": "charge_concept_uuid",
    "name": "Alícuota mensual estándar",
    "amount": "50.00",
    "currency": "USD",
    "frequency": "monthly",
    "effectiveFrom": "2026-07-01",
    "effectiveTo": null,
    "status": "active",
    "createdAt": "2026-07-14T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="mhqokf"
feeSchedule.created
```

### Evento

```text id="nxlu3f"
FeeScheduleCreated
```

---

## 10.3. Consultar FeeSchedule

```http id="p77g8i"
GET /api/v1/tenant/fee-schedules/{feeScheduleId}
```

### Permiso

```text id="5lyy7l"
feeSchedules.read
```

---

## 10.4. Actualizar FeeSchedule

### Endpoint

```http id="hf55ll"
PATCH /api/v1/tenant/fee-schedules/{feeScheduleId}
```

### Permiso

```text id="0i9fr8"
feeSchedules.update
```

### Request body

```json id="obwwt0"
{
  "name": "Alícuota mensual estándar 2026",
  "amount": "55.00",
  "effectiveTo": null,
  "status": "active"
}
```

### Regla financiera

Actualizar un FeeSchedule no modifica cargos ya emitidos.

### Auditoría

```text id="ci5pds"
feeSchedule.updated
```

---

## 10.5. Archivar FeeSchedule

### Endpoint

```http id="d5b8h6"
POST /api/v1/tenant/fee-schedules/{feeScheduleId}/archive
```

### Permiso

```text id="wcd5vg"
feeSchedules.archive
```

### Request body

```json id="by5p20"
{
  "reason": "Nueva configuración de alícuota vigente."
}
```

### Auditoría

```text id="83qunm"
feeSchedule.archived
```

---

# 11. Unit Fee Assignments API

Ruta base:

```text id="s5kq9o"
/api/v1/tenant/unit-fees
```

---

## 11.1. Listar asignaciones de alícuotas

### Endpoint

```http id="oczz8i"
GET /api/v1/tenant/unit-fees
```

### Permiso

```text id="6sijba"
unitFees.read
```

### Query params

| Nombre           | Tipo   | Descripción                       |
| ---------------- | ------ | --------------------------------- |
| `propertyUnitId` | string | Filtrar por unidad                |
| `feeScheduleId`  | string | Filtrar por schedule              |
| `status`         | string | active, ended, inactive, archived |
| `page`           | number | Página                            |
| `pageSize`       | number | Tamaño                            |

### Response 200

```json id="06kr8a"
{
  "data": [
    {
      "id": "unit_fee_assignment_uuid",
      "tenantId": "tenant_uuid",
      "propertyUnit": {
        "id": "property_unit_uuid",
        "code": "Casa 01"
      },
      "feeSchedule": {
        "id": "fee_schedule_uuid",
        "name": "Alícuota mensual estándar",
        "amount": "50.00",
        "currency": "USD",
        "frequency": "monthly"
      },
      "status": "active",
      "startDate": "2026-07-01",
      "endDate": null,
      "createdAt": "2026-07-14T10:00:00Z"
    }
  ],
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

## 11.2. Asignar alícuota a unidad

### Endpoint

```http id="a4oshh"
POST /api/v1/tenant/unit-fees
```

### Permiso

```text id="hqlmsg"
unitFees.assign
```

### Request body

```json id="hct9fx"
{
  "propertyUnitId": "property_unit_uuid",
  "feeScheduleId": "fee_schedule_uuid",
  "startDate": "2026-07-01",
  "endDate": null
}
```

### Validaciones

* Unidad debe pertenecer al tenant.
* Unidad debe estar activa.
* FeeSchedule debe pertenecer al tenant.
* FeeSchedule debe estar activo.
* No debe existir asignación activa incompatible.
* `endDate >= startDate` si existe.

### Response 201

```json id="jist6l"
{
  "data": {
    "id": "unit_fee_assignment_uuid",
    "tenantId": "tenant_uuid",
    "propertyUnitId": "property_unit_uuid",
    "feeScheduleId": "fee_schedule_uuid",
    "status": "active",
    "startDate": "2026-07-01",
    "endDate": null,
    "createdAt": "2026-07-14T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="qjqsbj"
unitFee.assigned
```

### Evento

```text id="2iiaxd"
UnitFeeAssigned
```

---

## 11.3. Consultar asignación

```http id="du880o"
GET /api/v1/tenant/unit-fees/{unitFeeAssignmentId}
```

### Permiso

```text id="jxn3bu"
unitFees.read
```

---

## 11.4. Finalizar asignación

### Endpoint

```http id="kyk2mn"
POST /api/v1/tenant/unit-fees/{unitFeeAssignmentId}/end
```

### Permiso

```text id="g2ckl6"
unitFees.end
```

### Request body

```json id="y1gex4"
{
  "endDate": "2026-12-31",
  "reason": "Cambio de política de alícuota."
}
```

### Response 200

```json id="d7v82v"
{
  "data": {
    "id": "unit_fee_assignment_uuid",
    "status": "ended",
    "endDate": "2026-12-31",
    "endedAt": "2026-07-14T11:10:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="pddvcs"
unitFee.ended
```

---

# 12. Billing Periods API

Ruta base:

```text id="6mgdtd"
/api/v1/tenant/billing-periods
```

---

## 12.1. Listar periodos

### Endpoint

```http id="4y7r3l"
GET /api/v1/tenant/billing-periods
```

### Permiso

```text id="pxkwgw"
billingPeriods.read
```

### Query params

| Nombre       | Tipo   | Descripción                    |
| ------------ | ------ | ------------------------------ |
| `status`     | string | open, closed, locked, archived |
| `periodCode` | string | YYYY-MM                        |
| `from`       | string | Fecha inicio                   |
| `to`         | string | Fecha fin                      |
| `page`       | number | Página                         |
| `pageSize`   | number | Tamaño                         |

### Response 200

```json id="fpzb05"
{
  "data": [
    {
      "id": "billing_period_uuid",
      "tenantId": "tenant_uuid",
      "periodCode": "2026-07",
      "startsAt": "2026-07-01",
      "endsAt": "2026-07-31",
      "dueDate": "2026-07-10",
      "status": "open",
      "createdAt": "2026-07-14T10:00:00Z"
    }
  ],
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

## 12.2. Crear periodo

### Endpoint

```http id="2j58lo"
POST /api/v1/tenant/billing-periods
```

### Permiso

```text id="6pyk4w"
billingPeriods.create
```

### Request body

```json id="httwnn"
{
  "periodCode": "2026-07",
  "dueDate": "2026-07-10"
}
```

### Validaciones

* `periodCode` formato `YYYY-MM`.
* Único por tenant.
* `dueDate` válida.
* Tenant activo.
* No se acepta `tenantId`.

### Response 201

```json id="sm06e2"
{
  "data": {
    "id": "billing_period_uuid",
    "tenantId": "tenant_uuid",
    "periodCode": "2026-07",
    "startsAt": "2026-07-01",
    "endsAt": "2026-07-31",
    "dueDate": "2026-07-10",
    "status": "open",
    "createdAt": "2026-07-14T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="4frwqo"
billingPeriod.created
```

### Evento

```text id="9xskde"
BillingPeriodCreated
```

---

## 12.3. Consultar periodo

```http id="hejeha"
GET /api/v1/tenant/billing-periods/{billingPeriodId}
```

### Permiso

```text id="ibfutg"
billingPeriods.read
```

---

## 12.4. Cerrar periodo

### Endpoint

```http id="niiffp"
POST /api/v1/tenant/billing-periods/{billingPeriodId}/close
```

### Permiso

```text id="ojz5gv"
billingPeriods.close
```

### Request body

```json id="y83dm2"
{
  "reason": "Cierre mensual de julio 2026."
}
```

### Response 200

```json id="wn576s"
{
  "data": {
    "id": "billing_period_uuid",
    "periodCode": "2026-07",
    "status": "closed",
    "closedAt": "2026-07-31T23:00:00Z",
    "closedBy": "user_uuid"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="s6tcbr"
billingPeriod.closed
```

---

## 12.5. Bloquear periodo

### Endpoint

```http id="mpbsrk"
POST /api/v1/tenant/billing-periods/{billingPeriodId}/lock
```

### Permiso

```text id="aztub2"
billingPeriods.lock
```

### Request body

```json id="lb5647"
{
  "reason": "Periodo bloqueado después de revisión financiera."
}
```

### Response 200

```json id="4yycom"
{
  "data": {
    "id": "billing_period_uuid",
    "periodCode": "2026-07",
    "status": "locked",
    "lockedAt": "2026-08-01T09:00:00Z",
    "lockedBy": "user_uuid"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="8ro331"
billingPeriod.locked
```

---

# 13. Charge Generation API

Ruta base:

```text id="x1hkl9"
/api/v1/tenant/charges/generate-monthly
```

---

## 13.1. Generar cargos mensuales

### Endpoint

```http id="d5cp8d"
POST /api/v1/tenant/charges/generate-monthly
```

### Permiso

```text id="a121ae"
fees.generate
```

### Request body

```json id="pw4hlc"
{
  "billingPeriodId": "billing_period_uuid",
  "feeScheduleId": null,
  "dryRun": false
}
```

### Parámetros

| Campo             | Tipo        | Requerido | Descripción                                     |
| ----------------- | ----------- | --------: | ----------------------------------------------- |
| `billingPeriodId` | string      |        Sí | Periodo open                                    |
| `feeScheduleId`   | string/null |        No | Si se omite, genera todos los schedules activos |
| `dryRun`          | boolean     |        No | Si true, simula sin persistir                   |

### Validaciones

* Tenant activo.
* Membership activa.
* Permiso `fees.generate`.
* Periodo pertenece al tenant.
* Periodo debe estar `open`.
* FeeSchedule, si existe, pertenece al tenant.
* FeeSchedule debe estar activo.
* Unidades deben estar activas.
* Asignaciones deben estar activas.
* Generación idempotente.

### Response 200

```json id="to4dwx"
{
  "data": {
    "chargeBatchId": "charge_batch_uuid",
    "billingPeriodId": "billing_period_uuid",
    "status": "completed",
    "dryRun": false,
    "totalItems": 60,
    "successItems": 58,
    "skippedItems": 2,
    "failedItems": 0,
    "createdCharges": 58,
    "alreadyExistingCharges": 2,
    "currency": "USD",
    "totalAmount": "2900.00",
    "startedAt": "2026-07-14T10:00:00Z",
    "completedAt": "2026-07-14T10:00:05Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Response 200 para dryRun

```json id="fm8tqa"
{
  "data": {
    "chargeBatchId": null,
    "billingPeriodId": "billing_period_uuid",
    "status": "dryRunCompleted",
    "dryRun": true,
    "totalItems": 60,
    "wouldCreate": 58,
    "wouldSkip": 2,
    "wouldFail": 0,
    "estimatedTotalAmount": "2900.00",
    "currency": "USD"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="5ctvbp"
chargeBatch.created
chargeBatch.processing
chargeBatch.completed
```

### Evento

```text id="3gfxct"
MonthlyFeesGenerated
```

---

# 14. Charge Batches API

Ruta base:

```text id="9hkd8o"
/api/v1/tenant/charge-batches
```

---

## 14.1. Listar batches

### Endpoint

```http id="3wgyys"
GET /api/v1/tenant/charge-batches
```

### Permiso

```text id="nh7l1f"
fees.readBatches
```

### Query params

| Nombre            | Tipo   | Descripción                                                            |
| ----------------- | ------ | ---------------------------------------------------------------------- |
| `billingPeriodId` | string | Filtrar por periodo                                                    |
| `feeScheduleId`   | string | Filtrar por schedule                                                   |
| `type`            | string | monthlyGeneration, extraordinaryGeneration, manualGeneration, other    |
| `status`          | string | draft, processing, completed, completedWithErrors, cancelled, reversed |
| `requestedBy`     | string | Usuario solicitante                                                    |
| `page`            | number | Página                                                                 |
| `pageSize`        | number | Tamaño                                                                 |

### Response 200

```json id="dl9s9o"
{
  "data": [
    {
      "id": "charge_batch_uuid",
      "tenantId": "tenant_uuid",
      "billingPeriodId": "billing_period_uuid",
      "feeScheduleId": null,
      "type": "monthlyGeneration",
      "status": "completed",
      "requestedBy": "user_uuid",
      "totalItems": 60,
      "successItems": 58,
      "failedItems": 0,
      "skippedItems": 2,
      "startedAt": "2026-07-14T10:00:00Z",
      "completedAt": "2026-07-14T10:00:05Z",
      "createdAt": "2026-07-14T10:00:00Z"
    }
  ],
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

## 14.2. Consultar batch

### Endpoint

```http id="29p6ok"
GET /api/v1/tenant/charge-batches/{chargeBatchId}
```

### Permiso

```text id="3er8jb"
fees.readBatches
```

### Response 200

```json id="v1tmfj"
{
  "data": {
    "id": "charge_batch_uuid",
    "tenantId": "tenant_uuid",
    "billingPeriodId": "billing_period_uuid",
    "feeScheduleId": null,
    "type": "monthlyGeneration",
    "status": "completed",
    "requestedBy": "user_uuid",
    "totalItems": 60,
    "successItems": 58,
    "failedItems": 0,
    "skippedItems": 2,
    "errorSummary": null,
    "startedAt": "2026-07-14T10:00:00Z",
    "completedAt": "2026-07-14T10:00:05Z",
    "charges": [
      {
        "id": "charge_uuid",
        "propertyUnitId": "property_unit_uuid",
        "chargeConceptId": "charge_concept_uuid",
        "originalAmount": "50.00",
        "effectiveAmount": "50.00",
        "currency": "USD",
        "status": "issued"
      }
    ]
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 15. Charges API

Ruta base:

```text id="czqxys"
/api/v1/tenant/charges
```

---

## 15.1. Listar cargos

### Endpoint

```http id="q1ddeo"
GET /api/v1/tenant/charges
```

### Permiso

```text id="5t4wtf"
charges.read
```

### Query params

| Nombre            | Tipo   | Descripción                                 |
| ----------------- | ------ | ------------------------------------------- |
| `billingPeriodId` | string | Filtrar por periodo                         |
| `propertyUnitId`  | string | Filtrar por unidad                          |
| `chargeConceptId` | string | Filtrar por concepto                        |
| `chargeBatchId`   | string | Filtrar por batch                           |
| `status`          | string | issued, cancelled, reversed, disputed, etc. |
| `type`            | string | ordinary, extraordinary, manual, etc.       |
| `dueDateFrom`     | date   | Desde vencimiento                           |
| `dueDateTo`       | date   | Hasta vencimiento                           |
| `page`            | number | Página                                      |
| `pageSize`        | number | Tamaño                                      |

### Response 200

```json id="pmyv37"
{
  "data": [
    {
      "id": "charge_uuid",
      "tenantId": "tenant_uuid",
      "billingPeriodId": "billing_period_uuid",
      "propertyUnit": {
        "id": "property_unit_uuid",
        "code": "Casa 01"
      },
      "chargeConcept": {
        "id": "charge_concept_uuid",
        "code": "monthly-dues",
        "name": "Alícuota mensual"
      },
      "chargeBatchId": "charge_batch_uuid",
      "type": "ordinary",
      "description": "Alícuota mensual 2026-07",
      "originalAmount": "50.00",
      "effectiveAmount": "50.00",
      "currency": "USD",
      "issuedDate": "2026-07-01",
      "dueDate": "2026-07-10",
      "status": "issued",
      "createdAt": "2026-07-14T10:00:00Z",
      "updatedAt": "2026-07-14T10:00:00Z"
    }
  ],
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

## 15.2. Crear cargo manual o extraordinario

### Endpoint

```http id="wbbof2"
POST /api/v1/tenant/charges
```

### Permiso

```text id="hx1v9j"
charges.create
```

### Request body

```json id="g2yera"
{
  "propertyUnitId": "property_unit_uuid",
  "billingPeriodId": "billing_period_uuid",
  "chargeConceptId": "charge_concept_uuid",
  "type": "extraordinary",
  "description": "Cuota extraordinaria para mantenimiento de portón.",
  "amount": "25.00",
  "currency": "USD",
  "issuedDate": "2026-07-14",
  "dueDate": "2026-07-30",
  "reason": "Aprobado por administración."
}
```

### Validaciones

* `propertyUnitId` requerido.
* Unidad pertenece al tenant.
* `billingPeriodId` requerido.
* Periodo pertenece al tenant.
* Periodo debe estar `open`.
* `chargeConceptId` requerido.
* Concepto pertenece al tenant.
* Concepto debe estar activo.
* `amount` decimal positivo.
* `currency = USD`.
* `type` permitido.
* `reason` requerido para extraordinarios.
* No se acepta `tenantId`.

### Header opcional

```text id="yuut4g"
Idempotency-Key: external-request-key
```

### Response 201

```json id="jz1rd9"
{
  "data": {
    "id": "charge_uuid",
    "tenantId": "tenant_uuid",
    "billingPeriodId": "billing_period_uuid",
    "propertyUnitId": "property_unit_uuid",
    "chargeConceptId": "charge_concept_uuid",
    "chargeBatchId": null,
    "type": "extraordinary",
    "description": "Cuota extraordinaria para mantenimiento de portón.",
    "originalAmount": "25.00",
    "effectiveAmount": "25.00",
    "currency": "USD",
    "issuedDate": "2026-07-14",
    "dueDate": "2026-07-30",
    "status": "issued",
    "createdAt": "2026-07-14T11:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="2mwm73"
charge.created
```

### Evento

```text id="cgy01g"
ExtraordinaryChargesCreated
ManualChargeCreated
```

---

## 15.3. Consultar cargo

### Endpoint

```http id="l0y2bm"
GET /api/v1/tenant/charges/{chargeId}
```

### Permiso

```text id="n8ywzh"
charges.read
```

### Response 200

```json id="7pos22"
{
  "data": {
    "id": "charge_uuid",
    "tenantId": "tenant_uuid",
    "billingPeriod": {
      "id": "billing_period_uuid",
      "periodCode": "2026-07"
    },
    "propertyUnit": {
      "id": "property_unit_uuid",
      "code": "Casa 01"
    },
    "chargeConcept": {
      "id": "charge_concept_uuid",
      "code": "monthly-dues",
      "name": "Alícuota mensual"
    },
    "chargeBatchId": "charge_batch_uuid",
    "type": "ordinary",
    "description": "Alícuota mensual 2026-07",
    "originalAmount": "50.00",
    "effectiveAmount": "50.00",
    "currency": "USD",
    "issuedDate": "2026-07-01",
    "dueDate": "2026-07-10",
    "status": "issued",
    "adjustments": [],
    "reversals": [],
    "createdAt": "2026-07-14T10:00:00Z",
    "updatedAt": "2026-07-14T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 15.4. Cancelar cargo

### Endpoint

```http id="0l7mcn"
POST /api/v1/tenant/charges/{chargeId}/cancel
```

### Permiso

```text id="a44xp1"
charges.cancel
```

### Request body

```json id="ysl449"
{
  "reason": "Cargo generado por error administrativo."
}
```

### Validaciones

* Cargo pertenece al tenant.
* Cargo está en estado cancelable.
* Motivo requerido.
* Cargo no debe estar pagado cuando `005-payments` exista.
* No se elimina el cargo.

### Response 200

```json id="kyj099"
{
  "data": {
    "id": "charge_uuid",
    "status": "cancelled",
    "originalAmount": "50.00",
    "effectiveAmount": "0.00",
    "cancelledAt": "2026-07-14T11:30:00Z",
    "cancelledBy": "user_uuid",
    "cancellationReason": "Cargo generado por error administrativo."
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="g67ge9"
charge.cancelled
```

### Evento

```text id="she1i9"
ChargeCancelled
```

---

## 15.5. Reversar cargo

### Endpoint

```http id="w3mm5s"
POST /api/v1/tenant/charges/{chargeId}/reverse
```

### Permiso

```text id="eg2l9p"
charges.reverse
```

### Request body

```json id="eunpyz"
{
  "reason": "Reverso autorizado por corrección financiera."
}
```

### Validaciones

* Cargo pertenece al tenant.
* Cargo está en estado reversible.
* No existe reverso previo.
* Motivo requerido.
* No se elimina el cargo.
* `originalAmount` se conserva.
* `effectiveAmount` pasa a `0.00`.

### Response 200

```json id="cb2t2z"
{
  "data": {
    "chargeId": "charge_uuid",
    "status": "reversed",
    "originalAmount": "50.00",
    "effectiveAmount": "0.00",
    "reversal": {
      "id": "charge_reversal_uuid",
      "reason": "Reverso autorizado por corrección financiera.",
      "reversedBy": "user_uuid",
      "reversedAt": "2026-07-14T11:40:00Z"
    }
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="d903oz"
charge.reversed
```

### Evento

```text id="z3kphe"
ChargeReversed
```

---

## 15.6. Registrar ajuste

### Endpoint

```http id="mzpnwx"
POST /api/v1/tenant/charges/{chargeId}/adjustments
```

### Permiso

```text id="m87zpb"
charges.adjust
```

### Request body

```json id="o0bhqb"
{
  "type": "discount",
  "amount": "5.00",
  "reason": "Descuento autorizado por administración."
}
```

### Validaciones

* Cargo pertenece al tenant.
* Cargo está en estado ajustable.
* `amount` decimal positivo.
* `reason` requerido.
* No se modifica `originalAmount`.
* Se recalcula `effectiveAmount`.

### Response 201

```json id="3ov36b"
{
  "data": {
    "chargeId": "charge_uuid",
    "adjustment": {
      "id": "charge_adjustment_uuid",
      "type": "discount",
      "amount": "5.00",
      "reason": "Descuento autorizado por administración.",
      "createdBy": "user_uuid",
      "createdAt": "2026-07-14T11:50:00Z"
    },
    "originalAmount": "50.00",
    "effectiveAmount": "45.00",
    "currency": "USD"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="3rx0tk"
charge.adjusted
```

### Evento

```text id="vr8wak"
ChargeAdjusted
```

---

# 16. Own Charges API

Ruta base:

```text id="14ca67"
/api/v1/me
```

Requiere:

```text id="lndmk7"
AuthGuard
TenantGuard
TenantPermissionGuard o PolicyGuard
OwnChargePolicyService
```

---

## 16.1. Consultar mis cargos

### Endpoint

```http id="hz7b0d"
GET /api/v1/me/charges
```

### Permiso

```text id="cvpqip"
charges.read.own
```

### Query params

| Nombre            | Tipo   | Descripción               |
| ----------------- | ------ | ------------------------- |
| `billingPeriodId` | string | Filtrar por periodo       |
| `propertyUnitId`  | string | Filtrar por unidad propia |
| `status`          | string | Filtrar por estado        |
| `type`            | string | Filtrar por tipo          |
| `page`            | number | Página                    |
| `pageSize`        | number | Tamaño                    |

### Response 200

```json id="dvfkgq"
{
  "data": [
    {
      "id": "charge_uuid",
      "propertyUnit": {
        "id": "property_unit_uuid",
        "code": "Casa 01"
      },
      "billingPeriod": {
        "id": "billing_period_uuid",
        "periodCode": "2026-07"
      },
      "chargeConcept": {
        "code": "monthly-dues",
        "name": "Alícuota mensual"
      },
      "type": "ordinary",
      "description": "Alícuota mensual 2026-07",
      "originalAmount": "50.00",
      "effectiveAmount": "50.00",
      "currency": "USD",
      "issuedDate": "2026-07-01",
      "dueDate": "2026-07-10",
      "status": "issued"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1,
    "traceId": "req_123456"
  }
}
```

### Reglas

* Resolver unidades propias mediante `UserProfile → Person → PropertyUnit`.
* Filtrar por `propertyUnitId IN ownPropertyUnitIds`.
* No devolver cargos de unidades ajenas.
* No devolver cargos de otro tenant.

---

## 16.2. Consultar cargos de una unidad propia

### Endpoint

```http id="ypknk4"
GET /api/v1/me/property-units/{propertyUnitId}/charges
```

### Permiso

```text id="g37bel"
charges.read.own
```

### Validaciones

* Unidad debe ser propia.
* Si unidad no es propia, responder `404` o `403` según política.
* Recomendación: `404` para no revelar existencia.

### Response 200

```json id="25tuqd"
{
  "data": [
    {
      "id": "charge_uuid",
      "billingPeriod": {
        "id": "billing_period_uuid",
        "periodCode": "2026-07"
      },
      "chargeConcept": {
        "code": "monthly-dues",
        "name": "Alícuota mensual"
      },
      "type": "ordinary",
      "originalAmount": "50.00",
      "effectiveAmount": "50.00",
      "currency": "USD",
      "dueDate": "2026-07-10",
      "status": "issued"
    }
  ],
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

# 17. DTOs principales

## 17.1. ChargeConceptResponseDto

```json id="i10xe7"
{
  "id": "charge_concept_uuid",
  "tenantId": "tenant_uuid",
  "code": "monthly-dues",
  "name": "Alícuota mensual",
  "description": "Cargo mensual ordinario.",
  "category": "ordinary",
  "defaultAmount": "50.00",
  "currency": "USD",
  "status": "active",
  "isSystem": false,
  "createdAt": "2026-07-14T10:00:00Z",
  "updatedAt": "2026-07-14T10:00:00Z"
}
```

---

## 17.2. FeeScheduleResponseDto

```json id="d2tigz"
{
  "id": "fee_schedule_uuid",
  "tenantId": "tenant_uuid",
  "chargeConceptId": "charge_concept_uuid",
  "name": "Alícuota mensual estándar",
  "amount": "50.00",
  "currency": "USD",
  "frequency": "monthly",
  "effectiveFrom": "2026-07-01",
  "effectiveTo": null,
  "status": "active"
}
```

---

## 17.3. BillingPeriodResponseDto

```json id="pfw6sk"
{
  "id": "billing_period_uuid",
  "tenantId": "tenant_uuid",
  "periodCode": "2026-07",
  "startsAt": "2026-07-01",
  "endsAt": "2026-07-31",
  "dueDate": "2026-07-10",
  "status": "open"
}
```

---

## 17.4. ChargeResponseDto

```json id="3jo5ph"
{
  "id": "charge_uuid",
  "tenantId": "tenant_uuid",
  "billingPeriodId": "billing_period_uuid",
  "propertyUnitId": "property_unit_uuid",
  "chargeConceptId": "charge_concept_uuid",
  "chargeBatchId": "charge_batch_uuid",
  "type": "ordinary",
  "description": "Alícuota mensual 2026-07",
  "originalAmount": "50.00",
  "effectiveAmount": "50.00",
  "currency": "USD",
  "issuedDate": "2026-07-01",
  "dueDate": "2026-07-10",
  "status": "issued"
}
```

---

# 18. Validaciones generales

## 18.1. `tenantId`

El `tenantId` no debe recibirse desde el body en endpoints tenant-scoped.

Debe resolverse desde:

```text id="ra4qsh"
CurrentTenant
TenantGuard
Membership context
```

---

## 18.2. IDs

Validar formato de:

```text id="cv28xm"
chargeConceptId
feeScheduleId
unitFeeAssignmentId
billingPeriodId
chargeBatchId
chargeId
propertyUnitId
adjustmentId
reversalId
```

---

## 18.3. Fechas

Reglas:

```text id="jvbq0p"
effectiveTo >= effectiveFrom
endDate >= startDate
endsAt >= startsAt
dueDate válida
issuedDate válida
```

---

## 18.4. Montos

Reglas:

```text id="m2b7ik"
amount decimal string
amount > 0 para cargos ordinarios, extraordinarios y manuales
currency = USD en MVP
```

---

## 18.5. Estado del periodo

Para generación ordinaria:

```text id="tusxfd"
BillingPeriod.status = open
```

---

## 18.6. Estado de unidad

Para generación ordinaria:

```text id="8j7ngv"
PropertyUnit.status = active
```

---

## 18.7. Estado de concepto

Para crear cargo:

```text id="73b6fv"
ChargeConcept.status = active
```

---

## 18.8. Estado de FeeSchedule

Para generación:

```text id="9l2ow6"
FeeSchedule.status = active
```

---

# 19. Catálogo de errores

| Código                               |    HTTP | Descripción                   |
| ------------------------------------ | ------: | ----------------------------- |
| `UNAUTHORIZED`                       |     401 | No autenticado                |
| `FORBIDDEN`                          |     403 | Sin permiso                   |
| `TENANT_NOT_ACTIVE`                  |     403 | Tenant no activo              |
| `MEMBERSHIP_NOT_ACTIVE`              |     403 | Membership no activa          |
| `CHARGE_CONCEPT_NOT_FOUND`           |     404 | Concepto no encontrado        |
| `CHARGE_CONCEPT_CODE_ALREADY_EXISTS` |     409 | Código duplicado              |
| `CHARGE_CONCEPT_NOT_ACTIVE`          |     409 | Concepto no activo            |
| `FEE_SCHEDULE_NOT_FOUND`             |     404 | Schedule no encontrado        |
| `FEE_SCHEDULE_NOT_ACTIVE`            |     409 | Schedule no activo            |
| `UNIT_FEE_ASSIGNMENT_NOT_FOUND`      |     404 | Asignación no encontrada      |
| `UNIT_FEE_ASSIGNMENT_ALREADY_ACTIVE` |     409 | Asignación activa duplicada   |
| `UNIT_FEE_ASSIGNMENT_ALREADY_ENDED`  |     409 | Asignación ya finalizada      |
| `BILLING_PERIOD_NOT_FOUND`           |     404 | Periodo no encontrado         |
| `BILLING_PERIOD_ALREADY_EXISTS`      |     409 | Periodo duplicado             |
| `BILLING_PERIOD_NOT_OPEN`            |     409 | Periodo no abierto            |
| `BILLING_PERIOD_ALREADY_CLOSED`      |     409 | Periodo ya cerrado            |
| `BILLING_PERIOD_LOCKED`              |     409 | Periodo bloqueado             |
| `PROPERTY_UNIT_NOT_FOUND`            |     404 | Unidad no encontrada          |
| `PROPERTY_UNIT_NOT_ACTIVE`           |     409 | Unidad no activa              |
| `CHARGE_BATCH_NOT_FOUND`             |     404 | Batch no encontrado           |
| `CHARGE_NOT_FOUND`                   |     404 | Cargo no encontrado           |
| `CHARGE_ALREADY_EXISTS`              |     409 | Cargo duplicado               |
| `CHARGE_ALREADY_CANCELLED`           |     409 | Cargo ya cancelado            |
| `CHARGE_ALREADY_REVERSED`            |     409 | Cargo ya reversado            |
| `CHARGE_NOT_ADJUSTABLE`              |     409 | Cargo no ajustable            |
| `CHARGE_NOT_CANCELABLE`              |     409 | Cargo no cancelable           |
| `CHARGE_NOT_REVERSIBLE`              |     409 | Cargo no reversible           |
| `MONEY_AMOUNT_INVALID`               |     422 | Monto inválido                |
| `CURRENCY_NOT_SUPPORTED`             |     422 | Moneda no soportada           |
| `IDEMPOTENCY_CONFLICT`               |     409 | Conflicto de idempotencia     |
| `OWN_PROPERTY_UNIT_NOT_FOUND`        |     404 | Unidad propia no encontrada   |
| `OWN_PERSON_NOT_LINKED`              |     403 | Usuario sin persona vinculada |
| `CROSS_TENANT_REFERENCE`             | 403/422 | Recurso de otro tenant        |
| `VALIDATION_ERROR`                   |     422 | Error de validación           |
| `RATE_LIMITED`                       |     429 | Rate limit                    |
| `INTERNAL_ERROR`                     |     500 | Error interno                 |

---

# 20. Ejemplos de errores

## 20.1. Periodo no abierto

```json id="u38ch0"
{
  "error": {
    "code": "BILLING_PERIOD_NOT_OPEN",
    "message": "Monthly charges can only be generated for an open billing period.",
    "details": {
      "billingPeriodId": "billing_period_uuid"
    },
    "traceId": "req_123456"
  }
}
```

---

## 20.2. Monto inválido

```json id="mny0hb"
{
  "error": {
    "code": "MONEY_AMOUNT_INVALID",
    "message": "The amount must be a positive decimal value.",
    "details": {
      "field": "amount"
    },
    "traceId": "req_123456"
  }
}
```

---

## 20.3. Referencia cross-tenant

```json id="df08u4"
{
  "error": {
    "code": "CROSS_TENANT_REFERENCE",
    "message": "The referenced resource does not belong to the active tenant.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

## 20.4. Cargo ya reversado

```json id="07z5n3"
{
  "error": {
    "code": "CHARGE_ALREADY_REVERSED",
    "message": "This charge has already been reversed.",
    "details": {
      "chargeId": "charge_uuid"
    },
    "traceId": "req_123456"
  }
}
```

---

# 21. Auditoría por endpoint

| Endpoint                                    | Auditoría                                      |
| ------------------------------------------- | ---------------------------------------------- |
| `POST /tenant/charge-concepts`              | `chargeConcept.created`                        |
| `PATCH /tenant/charge-concepts/{id}`        | `chargeConcept.updated`                        |
| `POST /tenant/charge-concepts/{id}/archive` | `chargeConcept.archived`                       |
| `POST /tenant/fee-schedules`                | `feeSchedule.created`                          |
| `PATCH /tenant/fee-schedules/{id}`          | `feeSchedule.updated`                          |
| `POST /tenant/fee-schedules/{id}/archive`   | `feeSchedule.archived`                         |
| `POST /tenant/unit-fees`                    | `unitFee.assigned`                             |
| `POST /tenant/unit-fees/{id}/end`           | `unitFee.ended`                                |
| `POST /tenant/billing-periods`              | `billingPeriod.created`                        |
| `POST /tenant/billing-periods/{id}/close`   | `billingPeriod.closed`                         |
| `POST /tenant/billing-periods/{id}/lock`    | `billingPeriod.locked`                         |
| `POST /tenant/charges/generate-monthly`     | `chargeBatch.created`, `chargeBatch.completed` |
| `POST /tenant/charges`                      | `charge.created`                               |
| `POST /tenant/charges/{id}/cancel`          | `charge.cancelled`                             |
| `POST /tenant/charges/{id}/reverse`         | `charge.reversed`                              |
| `POST /tenant/charges/{id}/adjustments`     | `charge.adjusted`                              |

---

# 22. Eventos por endpoint

| Endpoint                                    | Evento                                                |
| ------------------------------------------- | ----------------------------------------------------- |
| `POST /tenant/charge-concepts`              | `ChargeConceptCreated`                                |
| `PATCH /tenant/charge-concepts/{id}`        | `ChargeConceptUpdated`                                |
| `POST /tenant/charge-concepts/{id}/archive` | `ChargeConceptArchived`                               |
| `POST /tenant/fee-schedules`                | `FeeScheduleCreated`                                  |
| `PATCH /tenant/fee-schedules/{id}`          | `FeeScheduleUpdated`                                  |
| `POST /tenant/fee-schedules/{id}/archive`   | `FeeScheduleArchived`                                 |
| `POST /tenant/unit-fees`                    | `UnitFeeAssigned`                                     |
| `POST /tenant/unit-fees/{id}/end`           | `UnitFeeEnded`                                        |
| `POST /tenant/billing-periods`              | `BillingPeriodCreated`                                |
| `POST /tenant/billing-periods/{id}/close`   | `BillingPeriodClosed`                                 |
| `POST /tenant/billing-periods/{id}/lock`    | `BillingPeriodLocked`                                 |
| `POST /tenant/charges/generate-monthly`     | `MonthlyFeesGenerated`                                |
| `POST /tenant/charges`                      | `ManualChargeCreated` / `ExtraordinaryChargesCreated` |
| `POST /tenant/charges/{id}/cancel`          | `ChargeCancelled`                                     |
| `POST /tenant/charges/{id}/reverse`         | `ChargeReversed`                                      |
| `POST /tenant/charges/{id}/adjustments`     | `ChargeAdjusted`                                      |

---

# 23. Observabilidad

Todos los endpoints deben registrar:

```text id="13nf3s"
traceId
method
path
status
latencyMs
actorUserId
tenantId
resourceType
resourceId si aplica
billingPeriodId si aplica
propertyUnitId si aplica
chargeId si aplica
errorCode si aplica
```

No registrar:

```text id="lx47yk"
Authorization header
access token
payload completo
datos personales de propietarios/residentes
stack trace en producción
```

Métricas sugeridas:

```text id="yuzogv"
charge_concepts_created_total
fee_schedules_created_total
unit_fee_assignments_created_total
billing_periods_created_total
charges_generated_total
charges_created_total
charges_cancelled_total
charges_reversed_total
charge_adjustments_created_total
charge_generation_batches_total
charge_generation_failures_total
financial_authorization_denied_total
own_charge_access_denied_total
```

---

# 24. Rate limiting

Rate limiting recomendado para:

```text id="hv6ow9"
POST /api/v1/tenant/charges/generate-monthly
POST /api/v1/tenant/charges
POST /api/v1/tenant/charges/{chargeId}/cancel
POST /api/v1/tenant/charges/{chargeId}/reverse
POST /api/v1/tenant/charges/{chargeId}/adjustments
GET /api/v1/me/charges
```

Objetivos:

* evitar generación masiva abusiva;
* proteger operaciones financieras críticas;
* evitar scraping de cargos propios;
* reducir intentos de enumeración.

---

# 25. CORS

Endpoints financieros autenticados no deben usar CORS abierto en producción.

Prohibido:

```text id="k28ujj"
Access-Control-Allow-Origin: *
```

Permitir solo orígenes oficiales de RESIDENT Core.

---

# 26. OpenAPI

Cada endpoint debe documentarse con:

* summary;
* description;
* tags;
* security;
* parameters;
* requestBody;
* responses;
* errores;
* examples;
* required permission;
* tenant scope;
* audit event;
* financial operation flag;
* own policy cuando aplique.

Tags sugeridos:

```text id="1lzaol"
Charge Concepts
Fee Schedules
Unit Fees
Billing Periods
Charge Generation
Charge Batches
Charges
Own Charges
```

---

## 27. Extensiones OpenAPI sugeridas

Para endpoints administrativos financieros:

```yaml id="jv7stp"
x-required-permission: charges.create
x-audit-event: charge.created
x-tenant-scope: tenant
x-financial-operation: true
```

Para generación mensual:

```yaml id="705xz5"
x-required-permission: fees.generate
x-audit-event: chargeBatch.completed
x-tenant-scope: tenant
x-financial-operation: true
x-idempotent-operation: true
```

Para endpoints propios:

```yaml id="vm1bjg"
x-required-permission: charges.read.own
x-own-resource-policy: true
x-tenant-scope: tenant
```

---

# 28. Pruebas de contrato requeridas

## 28.1. Charge Concepts API

Probar:

* listar;
* crear;
* consultar;
* actualizar;
* archivar;
* código duplicado;
* concepto de otro tenant;
* sin permiso.

---

## 28.2. Fee Schedules API

Probar:

* listar;
* crear;
* concepto inactivo;
* concepto de otro tenant;
* monto inválido;
* fechas inválidas;
* archivar.

---

## 28.3. Unit Fees API

Probar:

* asignar a unidad;
* unidad de otro tenant;
* FeeSchedule de otro tenant;
* asignación duplicada;
* finalizar asignación;
* no eliminar historial.

---

## 28.4. Billing Periods API

Probar:

* crear periodo;
* periodo duplicado;
* formato inválido;
* cerrar periodo;
* bloquear periodo;
* generar en periodo cerrado debe fallar.

---

## 28.5. Charge Generation API

Probar:

* generación mensual exitosa;
* generación idempotente;
* dryRun;
* periodo cerrado;
* tenant suspendido;
* unidad archivada omitida;
* batch completed;
* batch completedWithErrors.

---

## 28.6. Charges API

Probar:

* listar;
* crear cargo manual;
* crear cargo extraordinario;
* consultar;
* cancelar;
* reversar;
* ajustar;
* monto original inmutable;
* effectiveAmount correcto;
* no eliminación física.

---

## 28.7. Own Charges API

Probar:

* propietario ve cargos propios;
* residente autorizado ve cargos propios;
* usuario sin Person vinculada;
* usuario no ve unidad ajena;
* usuario no ve cargos de otro tenant;
* sin permiso `.own`.

---

# 29. Matriz resumen de endpoints

| Método | Ruta                                          | Auth | Permiso                  | Auditoría                |
| ------ | --------------------------------------------- | ---: | ------------------------ | ------------------------ |
| GET    | `/api/v1/tenant/charge-concepts`              |   Sí | `chargeConcepts.read`    | No obligatoria           |
| POST   | `/api/v1/tenant/charge-concepts`              |   Sí | `chargeConcepts.create`  | `chargeConcept.created`  |
| GET    | `/api/v1/tenant/charge-concepts/{id}`         |   Sí | `chargeConcepts.read`    | No obligatoria           |
| PATCH  | `/api/v1/tenant/charge-concepts/{id}`         |   Sí | `chargeConcepts.update`  | `chargeConcept.updated`  |
| POST   | `/api/v1/tenant/charge-concepts/{id}/archive` |   Sí | `chargeConcepts.archive` | `chargeConcept.archived` |
| GET    | `/api/v1/tenant/fee-schedules`                |   Sí | `feeSchedules.read`      | No obligatoria           |
| POST   | `/api/v1/tenant/fee-schedules`                |   Sí | `feeSchedules.create`    | `feeSchedule.created`    |
| PATCH  | `/api/v1/tenant/fee-schedules/{id}`           |   Sí | `feeSchedules.update`    | `feeSchedule.updated`    |
| POST   | `/api/v1/tenant/fee-schedules/{id}/archive`   |   Sí | `feeSchedules.archive`   | `feeSchedule.archived`   |
| GET    | `/api/v1/tenant/unit-fees`                    |   Sí | `unitFees.read`          | No obligatoria           |
| POST   | `/api/v1/tenant/unit-fees`                    |   Sí | `unitFees.assign`        | `unitFee.assigned`       |
| POST   | `/api/v1/tenant/unit-fees/{id}/end`           |   Sí | `unitFees.end`           | `unitFee.ended`          |
| GET    | `/api/v1/tenant/billing-periods`              |   Sí | `billingPeriods.read`    | No obligatoria           |
| POST   | `/api/v1/tenant/billing-periods`              |   Sí | `billingPeriods.create`  | `billingPeriod.created`  |
| POST   | `/api/v1/tenant/billing-periods/{id}/close`   |   Sí | `billingPeriods.close`   | `billingPeriod.closed`   |
| POST   | `/api/v1/tenant/billing-periods/{id}/lock`    |   Sí | `billingPeriods.lock`    | `billingPeriod.locked`   |
| POST   | `/api/v1/tenant/charges/generate-monthly`     |   Sí | `fees.generate`          | `chargeBatch.completed`  |
| GET    | `/api/v1/tenant/charge-batches`               |   Sí | `fees.readBatches`       | No obligatoria           |
| GET    | `/api/v1/tenant/charge-batches/{id}`          |   Sí | `fees.readBatches`       | No obligatoria           |
| GET    | `/api/v1/tenant/charges`                      |   Sí | `charges.read`           | No obligatoria           |
| POST   | `/api/v1/tenant/charges`                      |   Sí | `charges.create`         | `charge.created`         |
| GET    | `/api/v1/tenant/charges/{id}`                 |   Sí | `charges.read`           | No obligatoria           |
| POST   | `/api/v1/tenant/charges/{id}/cancel`          |   Sí | `charges.cancel`         | `charge.cancelled`       |
| POST   | `/api/v1/tenant/charges/{id}/reverse`         |   Sí | `charges.reverse`        | `charge.reversed`        |
| POST   | `/api/v1/tenant/charges/{id}/adjustments`     |   Sí | `charges.adjust`         | `charge.adjusted`        |
| GET    | `/api/v1/me/charges`                          |   Sí | `charges.read.own`       | No obligatoria           |
| GET    | `/api/v1/me/property-units/{id}/charges`      |   Sí | `charges.read.own`       | No obligatoria           |

---

# 30. Casos borde del contrato

| Caso                                                | Resultado esperado         |
| --------------------------------------------------- | -------------------------- |
| Crear concepto con código duplicado en mismo tenant | 409                        |
| Crear concepto con código existente en otro tenant  | permitido                  |
| Crear FeeSchedule con concepto de otro tenant       | 403/422                    |
| Crear FeeSchedule con monto negativo                | 422                        |
| Asignar FeeSchedule a unidad de otro tenant         | 403/422                    |
| Asignar FeeSchedule inactivo                        | 409                        |
| Crear periodo duplicado                             | 409                        |
| Crear periodo con formato inválido                  | 422                        |
| Generar cargos en periodo cerrado                   | 409                        |
| Generar cargos dos veces                            | no duplica                 |
| Generar cargos para unidad archivada                | omitida o error controlado |
| Crear cargo con monto negativo                      | 422                        |
| Crear cargo sin unidad                              | 422                        |
| Crear cargo con concepto de otro tenant             | 403/422                    |
| Cancelar cargo ya cancelado                         | 409                        |
| Reversar cargo ya reversado                         | 409                        |
| Ajustar cargo cancelado                             | 409                        |
| Propietario consulta cargo de unidad ajena          | 403/404                    |
| Tenant suspendido intenta generar cargos            | 403                        |
| Usuario sin permiso financiero crea cargo           | 403                        |
| Enviar `tenantId` en body                           | 422 recomendado            |
| Intentar borrar físicamente cargo                   | endpoint no existe         |

---

# 31. Decisión final del contrato API

El módulo `004-dues-fees` expondrá endpoints administrativos bajo:

```text id="9k0b4s"
/api/v1/tenant/*
```

y endpoints de consulta propia bajo:

```text id="r87lwu"
/api/v1/me/*
```

Los endpoints administrativos permitirán a TenantAdmin, Treasurer y roles autorizados configurar conceptos, alícuotas, periodos y cargos.

Los endpoints propios permitirán a propietarios o residentes autorizados consultar únicamente cargos de unidades propias.

La autorización no dependerá solo del rol, sino también de:

```text id="9im32f"
tenant activo
membership activa
permiso financiero requerido
tenantId del recurso
unidad asociada al cargo
relación UserProfile → Person → PropertyUnit para .own
```

Este contrato prepara a RESIDENT Core para `005-payments` y `006-account-statements`, asegurando que los cargos existan con precisión decimal, idempotencia, trazabilidad financiera y auditoría reforzada.
