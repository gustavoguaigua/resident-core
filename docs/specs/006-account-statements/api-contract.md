# API Contract — Spec 006 Account Statements, Balances and Financial Position by Property Unit

## 1. Información del documento

| Campo           | Valor                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                 |
| Spec ID         | 006                                                                                           |
| Módulo          | Account Statements                                                                            |
| Documento       | API Contract                                                                                  |
| Ruta            | `docs/specs/006-account-statements/api-contract.md`                                           |
| Versión         | 0.1                                                                                           |
| Estado          | Borrador inicial                                                                              |
| Fecha           | 2026-07-14                                                                                    |
| Documento base  | `docs/specs/006-account-statements/spec.md`                                                   |
| Plan técnico    | `docs/specs/006-account-statements/plan.md`                                                   |
| Modelo de datos | `docs/specs/006-account-statements/data-model.md`                                             |
| API Style       | REST                                                                                          |
| API Version     | `/api/v1`                                                                                     |
| Formato         | JSON                                                                                          |
| Autorización    | Tenant-aware RBAC + permisos financieros + `.own` policies                                    |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments` |

---

## 2. Propósito

Este documento define el contrato API del módulo `006-account-statements`.

El objetivo es establecer:

* endpoints administrativos de estados de cuenta;
* endpoints administrativos de balances;
* endpoints administrativos de movimientos financieros;
* endpoints propios para propietarios y residentes;
* métodos HTTP;
* permisos requeridos;
* requests;
* responses;
* errores;
* validaciones;
* paginación;
* filtros;
* generación individual;
* generación en lote;
* publicación;
* cierre;
* bloqueo;
* regeneración;
* recálculo de balances;
* exportación básica;
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
* integración futura con mora, cobranza, notificaciones y reportes financieros.

---

## 3. Principios del contrato API

### 3.1. Estado de cuenta reconstruible

El API no debe presentar estados de cuenta que no puedan justificarse desde movimientos base.

Fuente primaria:

```text id="yx3h7p"
charges
charge_adjustments
charge_reversals
payments
payment_allocations
payment_reversals
```

Regla:

```text id="w8n9xd"
AccountStatement es una representación reconstruible y auditable; no es una fuente independiente de verdad financiera.
```

---

### 3.2. Tenant como frontera financiera

Todo endpoint administrativo opera dentro del tenant activo.

Regla:

```text id="asngfy"
Un endpoint /api/v1/tenant/* nunca debe crear, consultar, publicar, cerrar, regenerar, exportar o recalcular estados de cuenta de otro tenant.
```

---

### 3.3. Unidad habitacional como eje de balance

Todo estado de cuenta, balance y movimiento financiero se asocia a una unidad habitacional.

```text id="sf7wio"
propertyUnitId requerido para operaciones por unidad.
```

La unidad debe pertenecer al tenant activo.

---

### 3.4. Periodo financiero requerido para statements

Todo `AccountStatement` de periodo requiere:

```text id="oayt5y"
billingPeriodId
```

El periodo debe pertenecer al tenant activo.

---

### 3.5. Dinero como decimal

Todos los montos monetarios se envían y reciben como string decimal.

Ejemplo:

```json id="tk5n21"
{
  "openingBalance": "0.00",
  "chargesTotal": "60.00",
  "paymentsTotal": "50.00",
  "closingBalance": "10.00",
  "currency": "USD"
}
```

Prohibido en contrato:

```text id="zwihh5"
float
double
number sin control decimal para dinero
```

---

### 3.6. Source references en líneas

Toda línea originada en un movimiento financiero debe incluir:

```text id="n0bj9y"
sourceType
sourceId
```

Ejemplo:

```json id="bafopv"
{
  "lineType": "paymentAllocation",
  "sourceType": "paymentAllocation",
  "sourceId": "payment_allocation_uuid"
}
```

---

### 3.7. No eliminación física

No se exponen endpoints `DELETE` para:

```text id="l19h20"
account-statements
account-statement-lines
unit-balances
balance-snapshots
```

Correcciones se manejan con:

```text id="fu14e4"
regenerate
supersede
archive lógico futuro
snapshot nuevo
auditoría
```

---

### 3.8. Acceso propio restringido

Los endpoints `/api/v1/me/*` solo deben devolver estados, balances y movimientos de unidades propias.

Regla:

```text id="mnrg8o"
UserProfile → Person → PropertyUnit
```

---

## 4. Respuesta estándar

### 4.1. Respuesta individual

```json id="g0ujzu"
{
  "data": {},
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

### 4.2. Respuesta paginada

```json id="rshk9u"
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

```json id="gt5b6z"
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

| Header             |   Requerido | Descripción                                       |
| ------------------ | ----------: | ------------------------------------------------- |
| `Authorization`    |          Sí | Bearer token                                      |
| `Content-Type`     |  Sí en POST | `application/json`                                |
| `Accept`           | Recomendado | `application/json`, `text/csv` en exportación CSV |
| `X-Request-Id`     |    Opcional | ID de request                                     |
| `X-Correlation-Id` |    Opcional | ID de correlación                                 |

---

### 5.2. Response headers

| Header             | Descripción                                       |
| ------------------ | ------------------------------------------------- |
| `Content-Type`     | `application/json` o `text/csv` según exportación |
| `X-Request-Id`     | ID de request                                     |
| `X-Correlation-Id` | ID de correlación si aplica                       |

---

## 6. Estados HTTP

| Código | Uso                                                            |
| -----: | -------------------------------------------------------------- |
|    200 | Consulta o transición exitosa                                  |
|    201 | Recurso creado                                                 |
|    202 | Operación aceptada si se ejecuta asincrónicamente en el futuro |
|    204 | Operación exitosa sin body                                     |
|    400 | Request mal formado                                            |
|    401 | No autenticado                                                 |
|    403 | Sin permiso o acceso prohibido                                 |
|    404 | Recurso no encontrado                                          |
|    409 | Conflicto de estado, duplicidad o regeneración                 |
|    422 | Validación semántica fallida                                   |
|    429 | Rate limit                                                     |
|    500 | Error interno                                                  |

---

## 7. Paginación

Listados usan:

| Query param |   Tipo | Default | Máximo |
| ----------- | -----: | ------: | -----: |
| `page`      | number |       1 |      — |
| `pageSize`  | number |      20 |    100 |

Ejemplo:

```text id="z0atqe"
GET /api/v1/tenant/account-statements?page=1&pageSize=20
```

---

## 8. Ordenamiento

Parámetros:

| Query param | Tipo   | Default       |
| ----------- | ------ | ------------- |
| `sortBy`    | string | `generatedAt` |
| `sortOrder` | string | `desc`        |

Valores permitidos para `sortOrder`:

```text id="chwhkn"
asc
desc
```

Campos permitidos:

```text id="fe4scg"
createdAt
updatedAt
generatedAt
publishedAt
closedAt
statementNumber
status
openingBalance
closingBalance
overdueBalance
propertyUnitCode
periodCode
```

No permitir ordenamiento por campos arbitrarios.

---

# 9. Account Statements API administrativa

Ruta base:

```text id="zwvthk"
/api/v1/tenant/account-statements
```

Requiere:

```text id="jsdx2m"
AuthGuard
TenantGuard
TenantPermissionGuard
```

---

## 9.1. Listar estados de cuenta

### Endpoint

```http id="kb6lgd"
GET /api/v1/tenant/account-statements
```

### Permiso

```text id="g35kzi"
accountStatements.read
```

### Query params

| Nombre            | Tipo    | Descripción                             |
| ----------------- | ------- | --------------------------------------- |
| `page`            | number  | Página                                  |
| `pageSize`        | number  | Tamaño                                  |
| `propertyUnitId`  | string  | Filtrar por unidad                      |
| `billingPeriodId` | string  | Filtrar por periodo                     |
| `periodCode`      | string  | Filtrar por código de periodo `YYYY-MM` |
| `status`          | string  | Estado                                  |
| `statementNumber` | string  | Número de estado                        |
| `generatedFrom`   | date    | Fecha generación desde                  |
| `generatedTo`     | date    | Fecha generación hasta                  |
| `publishedOnly`   | boolean | Solo publicados                         |
| `sortBy`          | string  | Campo permitido                         |
| `sortOrder`       | string  | asc/desc                                |

### Response 200

```json id="ezrg9a"
{
  "data": [
    {
      "id": "statement_uuid",
      "tenantId": "tenant_uuid",
      "propertyUnit": {
        "id": "property_unit_uuid",
        "code": "Casa 01"
      },
      "billingPeriod": {
        "id": "billing_period_uuid",
        "periodCode": "2026-07"
      },
      "statementNumber": "ST-villa-club-2026-07-CASA-01",
      "status": "published",
      "currency": "USD",
      "openingBalance": "0.00",
      "chargesTotal": "60.00",
      "adjustmentsTotal": "0.00",
      "paymentsTotal": "50.00",
      "reversalsTotal": "0.00",
      "creditBalance": "0.00",
      "closingBalance": "10.00",
      "overdueBalance": "10.00",
      "notDueBalance": "0.00",
      "lineCount": 5,
      "generatedAt": "2026-07-14T10:00:00Z",
      "publishedAt": "2026-07-14T11:00:00Z",
      "closedAt": null,
      "lockedAt": null,
      "createdAt": "2026-07-14T10:00:00Z",
      "updatedAt": "2026-07-14T11:00:00Z"
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

## 9.2. Generar estado de cuenta individual

### Endpoint

```http id="e9vdy0"
POST /api/v1/tenant/account-statements/generate
```

### Permiso

```text id="cyalvn"
accountStatements.generate
```

### Request body

```json id="rbxqfk"
{
  "propertyUnitId": "property_unit_uuid",
  "billingPeriodId": "billing_period_uuid",
  "mode": "failIfExists",
  "reason": null
}
```

### Valores permitidos para `mode`

```text id="sks1cf"
create
failIfExists
regenerateIfExists
```

### Validaciones

* `propertyUnitId` requerido.
* `billingPeriodId` requerido.
* Unidad pertenece al tenant.
* Periodo pertenece al tenant.
* Actor tiene permiso.
* No se acepta `tenantId` en body.
* Si existe statement activo y `mode = failIfExists`, responder `409`.
* Si existe statement activo y `mode = regenerateIfExists`, `reason` es requerido.
* El cálculo debe usar Decimal.
* Deben excluirse cargos cancelados/reversados.
* Deben excluirse pagos reversados.
* Deben excluirse allocations reversadas.
* Cada línea financiera debe tener `sourceType` y `sourceId`.

### Response 201

```json id="fuj1n7"
{
  "data": {
    "id": "statement_uuid",
    "tenantId": "tenant_uuid",
    "propertyUnitId": "property_unit_uuid",
    "billingPeriodId": "billing_period_uuid",
    "statementNumber": "ST-villa-club-2026-07-CASA-01",
    "status": "generated",
    "currency": "USD",
    "openingBalance": "0.00",
    "chargesTotal": "60.00",
    "adjustmentsTotal": "0.00",
    "paymentsTotal": "50.00",
    "reversalsTotal": "0.00",
    "creditBalance": "0.00",
    "closingBalance": "10.00",
    "overdueBalance": "10.00",
    "notDueBalance": "0.00",
    "lineCount": 5,
    "sourceHash": "hash_value",
    "generatedAt": "2026-07-14T10:00:00Z",
    "generatedBy": "user_uuid",
    "createdAt": "2026-07-14T10:00:00Z",
    "updatedAt": "2026-07-14T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="cdh4tu"
accountStatement.generated
balance.snapshotCreated
```

### Eventos

```text id="htrtvr"
AccountStatementGenerated
BalanceSnapshotCreated
```

---

## 9.3. Generar estados de cuenta en lote

### Endpoint

```http id="gij61o"
POST /api/v1/tenant/account-statements/generate-batch
```

### Permiso

```text id="wh2xki"
accountStatements.generate
```

### Request body

```json id="g8qh1t"
{
  "billingPeriodId": "billing_period_uuid",
  "propertyUnitIds": [
    "property_unit_uuid_1",
    "property_unit_uuid_2"
  ],
  "mode": "failIfExists",
  "dryRun": false,
  "reason": null
}
```

### Reglas

* Si `propertyUnitIds` no se envía, generar para todas las unidades activas del tenant.
* Si `propertyUnitIds` se envía, validar cada unidad.
* `dryRun = true` no persiste statements, lines ni snapshots.
* `mode = regenerateIfExists` requiere `reason`.
* Debe manejar errores parciales por unidad.
* La operación no debe mezclar tenants.

### Response 200

```json id="e1fggj"
{
  "data": {
    "billingPeriodId": "billing_period_uuid",
    "periodCode": "2026-07",
    "dryRun": false,
    "mode": "failIfExists",
    "totalUnits": 2,
    "generatedCount": 1,
    "skippedCount": 1,
    "failedCount": 0,
    "supersededCount": 0,
    "statements": [
      {
        "propertyUnitId": "property_unit_uuid_1",
        "statementId": "statement_uuid_1",
        "statementNumber": "ST-villa-club-2026-07-CASA-01",
        "status": "generated",
        "closingBalance": "10.00"
      }
    ],
    "skipped": [
      {
        "propertyUnitId": "property_unit_uuid_2",
        "reason": "ACCOUNT_STATEMENT_ALREADY_EXISTS"
      }
    ],
    "failed": []
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="el0uot"
accountStatement.batchGenerated
```

### Evento

```text id="xwha5r"
AccountStatementBatchGenerated
```

---

## 9.4. Consultar estado de cuenta

### Endpoint

```http id="i7exk4"
GET /api/v1/tenant/account-statements/{statementId}
```

### Permiso

```text id="v6pgdy"
accountStatements.read
```

### Response 200

```json id="rtqk90"
{
  "data": {
    "id": "statement_uuid",
    "tenantId": "tenant_uuid",
    "propertyUnit": {
      "id": "property_unit_uuid",
      "code": "Casa 01",
      "label": "Casa 01"
    },
    "billingPeriod": {
      "id": "billing_period_uuid",
      "periodCode": "2026-07",
      "startsAt": "2026-07-01T00:00:00Z",
      "endsAt": "2026-07-31T23:59:59Z"
    },
    "statementNumber": "ST-villa-club-2026-07-CASA-01",
    "status": "published",
    "currency": "USD",
    "openingBalance": "0.00",
    "chargesTotal": "60.00",
    "adjustmentsTotal": "0.00",
    "paymentsTotal": "50.00",
    "reversalsTotal": "0.00",
    "creditBalance": "0.00",
    "closingBalance": "10.00",
    "overdueBalance": "10.00",
    "notDueBalance": "0.00",
    "lineCount": 5,
    "sourceHash": "hash_value",
    "generatedAt": "2026-07-14T10:00:00Z",
    "generatedBy": "user_uuid",
    "publishedAt": "2026-07-14T11:00:00Z",
    "publishedBy": "user_uuid",
    "closedAt": null,
    "closedBy": null,
    "closeReason": null,
    "lockedAt": null,
    "lockedBy": null,
    "lockReason": null,
    "previousStatementId": null,
    "supersededBy": null,
    "regenerationReason": null,
    "lines": [
      {
        "id": "line_uuid_1",
        "lineType": "openingBalance",
        "sourceType": "openingBalance",
        "sourceId": null,
        "description": "Saldo inicial",
        "lineDate": "2026-07-01T00:00:00Z",
        "dueDate": null,
        "debitAmount": "0.00",
        "creditAmount": "0.00",
        "balanceAfterLine": "0.00",
        "currency": "USD",
        "sortOrder": 1,
        "isVisibleToResident": true
      },
      {
        "id": "line_uuid_2",
        "lineType": "charge",
        "sourceType": "charge",
        "sourceId": "charge_uuid",
        "description": "Alícuota mensual julio 2026",
        "lineDate": "2026-07-01T00:00:00Z",
        "dueDate": "2026-07-10T00:00:00Z",
        "debitAmount": "50.00",
        "creditAmount": "0.00",
        "balanceAfterLine": "50.00",
        "currency": "USD",
        "sortOrder": 2,
        "isVisibleToResident": true
      },
      {
        "id": "line_uuid_3",
        "lineType": "paymentAllocation",
        "sourceType": "paymentAllocation",
        "sourceId": "payment_allocation_uuid",
        "description": "Pago aplicado",
        "lineDate": "2026-07-14T00:00:00Z",
        "dueDate": null,
        "debitAmount": "0.00",
        "creditAmount": "50.00",
        "balanceAfterLine": "0.00",
        "currency": "USD",
        "sortOrder": 3,
        "isVisibleToResident": true
      }
    ],
    "createdAt": "2026-07-14T10:00:00Z",
    "updatedAt": "2026-07-14T11:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 9.5. Publicar estado de cuenta

### Endpoint

```http id="ukpmgc"
POST /api/v1/tenant/account-statements/{statementId}/publish
```

### Permiso

```text id="njtdp1"
accountStatements.publish
```

### Request body

```json id="tdwl4e"
{
  "notes": "Estado revisado y publicado."
}
```

### Validaciones

* Statement pertenece al tenant.
* Statement está en estado publicable.
* Statement no está `superseded`.
* Statement no está `archived`.
* Statement tiene líneas válidas.
* Statement tiene totales consistentes.
* Actor tiene permiso.

### Response 200

```json id="kt4njs"
{
  "data": {
    "id": "statement_uuid",
    "status": "published",
    "publishedAt": "2026-07-14T11:00:00Z",
    "publishedBy": "user_uuid",
    "statementNumber": "ST-villa-club-2026-07-CASA-01"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="eiqgb3"
accountStatement.published
```

### Evento

```text id="t0r55l"
AccountStatementPublished
```

---

## 9.6. Cerrar estado de cuenta

### Endpoint

```http id="boc7ov"
POST /api/v1/tenant/account-statements/{statementId}/close
```

### Permiso

```text id="d4lzu3"
accountStatements.close
```

### Request body

```json id="h4rj5a"
{
  "reason": "Cierre de periodo financiero julio 2026."
}
```

### Validaciones

* Statement pertenece al tenant.
* Statement está en estado cerrable.
* Motivo requerido.
* Actor tiene permiso.
* No cerrar statement `superseded` o `archived`.

### Response 200

```json id="alj91t"
{
  "data": {
    "id": "statement_uuid",
    "status": "closed",
    "closedAt": "2026-07-14T12:00:00Z",
    "closedBy": "user_uuid",
    "closeReason": "Cierre de periodo financiero julio 2026."
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="p2o4y9"
accountStatement.closed
```

### Evento

```text id="y7ehbi"
AccountStatementClosed
```

---

## 9.7. Bloquear estado de cuenta

### Endpoint

```http id="cezzi7"
POST /api/v1/tenant/account-statements/{statementId}/lock
```

### Permiso

```text id="l8gx8u"
accountStatements.lock
```

### Request body

```json id="hu562v"
{
  "reason": "Bloqueo administrativo por cierre auditado."
}
```

### Validaciones

* Statement pertenece al tenant.
* Motivo requerido.
* Actor tiene permiso.
* Statement no está `superseded` ni `archived`.
* Statement no está ya `locked`.

### Response 200

```json id="j901ru"
{
  "data": {
    "id": "statement_uuid",
    "status": "locked",
    "lockedAt": "2026-07-14T12:30:00Z",
    "lockedBy": "user_uuid",
    "lockReason": "Bloqueo administrativo por cierre auditado."
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="h62nmr"
accountStatement.locked
```

### Evento

```text id="xefjb6"
AccountStatementLocked
```

---

## 9.8. Regenerar estado de cuenta

### Endpoint

```http id="pvx44n"
POST /api/v1/tenant/account-statements/{statementId}/regenerate
```

### Permiso

```text id="k9j33x"
accountStatements.regenerate
```

### Request body

```json id="zfn0xo"
{
  "reason": "Corrección financiera posterior por reverso de pago.",
  "mode": "supersede"
}
```

### Valores permitidos para `mode`

```text id="s0t4z8"
supersede
```

Valores futuros:

```text id="w0pxmd"
draftOnly
requireApproval
```

### Validaciones

* Statement pertenece al tenant.
* Motivo requerido.
* Statement es regenerable.
* Si está `locked`, requiere política especial o error.
* Statement anterior queda `superseded`.
* Nuevo statement referencia `previousStatementId`.
* Statement anterior referencia `supersededBy`.
* Nuevas líneas se crean desde movimientos actuales.
* Debe auditarse.
* Debe ser transaccional.

### Response 200

```json id="mnvx8v"
{
  "data": {
    "previousStatement": {
      "id": "old_statement_uuid",
      "status": "superseded",
      "supersededBy": "new_statement_uuid"
    },
    "newStatement": {
      "id": "new_statement_uuid",
      "statementNumber": "ST-villa-club-2026-07-CASA-01-R1",
      "status": "generated",
      "previousStatementId": "old_statement_uuid",
      "regenerationReason": "Corrección financiera posterior por reverso de pago.",
      "openingBalance": "0.00",
      "chargesTotal": "60.00",
      "paymentsTotal": "40.00",
      "closingBalance": "20.00",
      "currency": "USD"
    }
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="saw7av"
accountStatement.regenerated
accountStatement.superseded
balance.snapshotCreated
```

### Eventos

```text id="wv1c16"
AccountStatementRegenerated
AccountStatementSuperseded
BalanceSnapshotCreated
```

---

## 9.9. Exportar estado de cuenta administrativo

### Endpoint

```http id="k66d58"
GET /api/v1/tenant/account-statements/{statementId}/export
```

### Permiso

```text id="bgzyxm"
accountStatements.export
```

### Query params

| Nombre                    | Tipo    | Default | Descripción                  |
| ------------------------- | ------- | ------- | ---------------------------- |
| `format`                  | string  | `json`  | `json` o `csv`               |
| `includeLines`            | boolean | `true`  | Incluir líneas               |
| `includeSourceReferences` | boolean | `true`  | Incluir sourceType/sourceId  |
| `includeInternalFields`   | boolean | `false` | Campos internos restringidos |

### Validaciones

* Statement pertenece al tenant.
* Actor tiene permiso.
* Formato soportado.
* Exportación se audita.
* No exportar datos de otro tenant.

### Response 200 — JSON

```json id="usclzj"
{
  "data": {
    "statement": {
      "id": "statement_uuid",
      "statementNumber": "ST-villa-club-2026-07-CASA-01",
      "status": "published",
      "propertyUnit": {
        "id": "property_unit_uuid",
        "code": "Casa 01"
      },
      "billingPeriod": {
        "periodCode": "2026-07"
      },
      "currency": "USD",
      "openingBalance": "0.00",
      "chargesTotal": "60.00",
      "paymentsTotal": "50.00",
      "closingBalance": "10.00"
    },
    "lines": []
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Response 200 — CSV

```text id="xw1bwi"
Content-Type: text/csv
```

### Auditoría

```text id="ag77le"
accountStatement.exported
```

### Evento

```text id="x5jqnc"
AccountStatementExported
```

---

# 10. Balances API administrativa

Rutas base:

```text id="l7f5s7"
/api/v1/tenant/balances
/api/v1/tenant/property-units/{propertyUnitId}/balance
/api/v1/tenant/property-units/{propertyUnitId}/financial-movements
```

Requiere:

```text id="hwe2zq"
AuthGuard
TenantGuard
TenantPermissionGuard
```

---

## 10.1. Listar balances

### Endpoint

```http id="k0r5ri"
GET /api/v1/tenant/balances
```

### Permiso

```text id="l5ehk1"
balances.read
```

### Query params

| Nombre                  | Tipo           | Descripción            |
| ----------------------- | -------------- | ---------------------- |
| `page`                  | number         | Página                 |
| `pageSize`              | number         | Tamaño                 |
| `propertyUnitId`        | string         | Unidad                 |
| `hasDebt`               | boolean        | Con deuda              |
| `hasCredit`             | boolean        | Con saldo a favor      |
| `overdueOnly`           | boolean        | Solo con saldo vencido |
| `isStale`               | boolean        | Requiere recálculo     |
| `minOutstandingBalance` | decimal string | Saldo mínimo           |
| `sortBy`                | string         | Campo permitido        |
| `sortOrder`             | string         | asc/desc               |

### Response 200

```json id="ynysse"
{
  "data": [
    {
      "id": "unit_balance_uuid",
      "tenantId": "tenant_uuid",
      "propertyUnit": {
        "id": "property_unit_uuid",
        "code": "Casa 01"
      },
      "currency": "USD",
      "outstandingBalance": "10.00",
      "overdueBalance": "10.00",
      "notDueBalance": "0.00",
      "creditBalance": "0.00",
      "unallocatedPaymentBalance": "0.00",
      "lastCalculatedAt": "2026-07-14T10:00:00Z",
      "lastMovementAt": "2026-07-14T09:30:00Z",
      "isStale": false
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

## 10.2. Consultar balance de una unidad

### Endpoint

```http id="f3yn46"
GET /api/v1/tenant/property-units/{propertyUnitId}/balance
```

### Permiso

```text id="oi329h"
balances.read
```

### Query params

| Nombre        | Tipo    | Default      | Descripción                             |
| ------------- | ------- | ------------ | --------------------------------------- |
| `asOfDate`    | date    | current date | Fecha de corte                          |
| `recalculate` | boolean | false        | Recalcular en tiempo real sin persistir |

### Validaciones

* Unidad pertenece al tenant.
* Actor tiene permiso.
* No mezcla movimientos de otro tenant.
* Usa Decimal.

### Response 200

```json id="zho1s2"
{
  "data": {
    "propertyUnit": {
      "id": "property_unit_uuid",
      "code": "Casa 01"
    },
    "currency": "USD",
    "outstandingBalance": "10.00",
    "overdueBalance": "10.00",
    "notDueBalance": "0.00",
    "creditBalance": "0.00",
    "unallocatedPaymentBalance": "0.00",
    "asOfDate": "2026-07-14",
    "lastCalculatedAt": "2026-07-14T10:00:00Z",
    "lastMovementAt": "2026-07-14T09:30:00Z",
    "isStale": false,
    "calculationMode": "materialized"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 10.3. Recalcular balance de una unidad

### Endpoint

```http id="uyd5fh"
POST /api/v1/tenant/property-units/{propertyUnitId}/balance/recalculate
```

### Permiso

```text id="b9tptd"
balances.recalculate
```

### Request body

```json id="ewjge1"
{
  "reason": "Recálculo manual posterior a corrección de pagos.",
  "createSnapshot": true
}
```

### Validaciones

* Unidad pertenece al tenant.
* Motivo recomendado; requerido si política lo exige.
* Actor tiene permiso.
* Cálculo usa movimientos base.
* No modifica movimientos fuente.
* Crea snapshot si `createSnapshot = true`.

### Response 200

```json id="d0glk0"
{
  "data": {
    "propertyUnitId": "property_unit_uuid",
    "currency": "USD",
    "outstandingBalance": "10.00",
    "overdueBalance": "10.00",
    "notDueBalance": "0.00",
    "creditBalance": "0.00",
    "unallocatedPaymentBalance": "0.00",
    "lastCalculatedAt": "2026-07-14T12:00:00Z",
    "isStale": false,
    "snapshotId": "balance_snapshot_uuid"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="co9em8"
balance.recalculated
balance.snapshotCreated
```

### Eventos

```text id="hipp36"
UnitBalanceRecalculated
BalanceSnapshotCreated
```

---

## 10.4. Consultar movimientos financieros de una unidad

### Endpoint

```http id="pc5oex"
GET /api/v1/tenant/property-units/{propertyUnitId}/financial-movements
```

### Permiso

```text id="j8d221"
balances.read
```

### Query params

| Nombre            | Tipo    | Descripción        |
| ----------------- | ------- | ------------------ |
| `billingPeriodId` | string  | Periodo            |
| `dateFrom`        | date    | Desde              |
| `dateTo`          | date    | Hasta              |
| `sourceType`      | string  | Tipo de fuente     |
| `includeReversed` | boolean | Incluir reversados |
| `page`            | number  | Página             |
| `pageSize`        | number  | Tamaño             |

### Response 200

```json id="n61tvh"
{
  "data": [
    {
      "sourceType": "charge",
      "sourceId": "charge_uuid",
      "propertyUnitId": "property_unit_uuid",
      "billingPeriodId": "billing_period_uuid",
      "movementDate": "2026-07-01T00:00:00Z",
      "dueDate": "2026-07-10T00:00:00Z",
      "description": "Alícuota mensual julio 2026",
      "debitAmount": "50.00",
      "creditAmount": "0.00",
      "currency": "USD",
      "status": "issued",
      "isReversed": false,
      "sortOrder": 1
    },
    {
      "sourceType": "paymentAllocation",
      "sourceId": "payment_allocation_uuid",
      "propertyUnitId": "property_unit_uuid",
      "billingPeriodId": "billing_period_uuid",
      "movementDate": "2026-07-14T00:00:00Z",
      "dueDate": null,
      "description": "Pago aplicado",
      "debitAmount": "0.00",
      "creditAmount": "50.00",
      "currency": "USD",
      "status": "active",
      "isReversed": false,
      "sortOrder": 2
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 2,
    "totalPages": 1,
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="p0cvfb"
financialMovements.viewed
```

### Evento

```text id="q10jlh"
FinancialMovementsViewed
```

---

# 11. Own Account Statements API

Ruta base:

```text id="b3xzn9"
/api/v1/me
```

Requiere:

```text id="zh7es7"
AuthGuard
TenantGuard
TenantPermissionGuard o PolicyGuard
OwnAccountStatementPolicyService
```

---

## 11.1. Consultar mis estados de cuenta

### Endpoint

```http id="zcpv4p"
GET /api/v1/me/account-statements
```

### Permiso

```text id="dp357q"
accountStatements.read.own
```

### Query params

| Nombre            | Tipo   | Descripción       |
| ----------------- | ------ | ----------------- |
| `propertyUnitId`  | string | Unidad propia     |
| `billingPeriodId` | string | Periodo           |
| `periodCode`      | string | Código de periodo |
| `status`          | string | Estado visible    |
| `page`            | number | Página            |
| `pageSize`        | number | Tamaño            |

### Reglas

* Resolver unidades propias.
* Filtrar por `propertyUnitId IN ownPropertyUnitIds`.
* Mostrar solo statements visibles para `.own`.
* MVP recomendado: `published`, `closed`, `locked`.
* No mostrar `draft`, `generated` no publicado, `superseded` ni `archived`.
* No exponer auditoría interna.

### Response 200

```json id="vbjdu8"
{
  "data": [
    {
      "id": "statement_uuid",
      "propertyUnit": {
        "id": "property_unit_uuid",
        "code": "Casa 01"
      },
      "billingPeriod": {
        "id": "billing_period_uuid",
        "periodCode": "2026-07"
      },
      "statementNumber": "ST-villa-club-2026-07-CASA-01",
      "status": "published",
      "currency": "USD",
      "openingBalance": "0.00",
      "chargesTotal": "60.00",
      "paymentsTotal": "50.00",
      "creditBalance": "0.00",
      "closingBalance": "10.00",
      "overdueBalance": "10.00",
      "notDueBalance": "0.00",
      "publishedAt": "2026-07-14T11:00:00Z"
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

## 11.2. Consultar mi estado de cuenta

### Endpoint

```http id="sjjqo6"
GET /api/v1/me/account-statements/{statementId}
```

### Permiso

```text id="pi7ras"
accountStatements.read.own
```

### Validaciones

* Statement pertenece al tenant.
* Statement pertenece a unidad propia.
* Statement está visible para `.own`.
* Si no es propio, responder 404 recomendado.
* No exponer auditoría interna.
* No exponer líneas marcadas como `isVisibleToResident = false`.

### Response 200

```json id="v5yurt"
{
  "data": {
    "id": "statement_uuid",
    "propertyUnit": {
      "id": "property_unit_uuid",
      "code": "Casa 01"
    },
    "billingPeriod": {
      "id": "billing_period_uuid",
      "periodCode": "2026-07"
    },
    "statementNumber": "ST-villa-club-2026-07-CASA-01",
    "status": "published",
    "currency": "USD",
    "openingBalance": "0.00",
    "chargesTotal": "60.00",
    "paymentsTotal": "50.00",
    "creditBalance": "0.00",
    "closingBalance": "10.00",
    "overdueBalance": "10.00",
    "notDueBalance": "0.00",
    "publishedAt": "2026-07-14T11:00:00Z",
    "lines": [
      {
        "id": "line_uuid_1",
        "lineType": "openingBalance",
        "description": "Saldo inicial",
        "lineDate": "2026-07-01T00:00:00Z",
        "dueDate": null,
        "debitAmount": "0.00",
        "creditAmount": "0.00",
        "balanceAfterLine": "0.00",
        "currency": "USD",
        "sortOrder": 1
      },
      {
        "id": "line_uuid_2",
        "lineType": "charge",
        "description": "Alícuota mensual julio 2026",
        "lineDate": "2026-07-01T00:00:00Z",
        "dueDate": "2026-07-10T00:00:00Z",
        "debitAmount": "50.00",
        "creditAmount": "0.00",
        "balanceAfterLine": "50.00",
        "currency": "USD",
        "sortOrder": 2
      }
    ]
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 11.3. Consultar balance de mi unidad

### Endpoint

```http id="ztxgjm"
GET /api/v1/me/property-units/{propertyUnitId}/balance
```

### Permiso

```text id="l5rsr8"
balances.read.own
```

### Validaciones

* Unidad pertenece al tenant.
* Unidad es propia.
* Si no es propia, responder 404 recomendado.
* La política del tenant permite ver balance actual.

### Response 200

```json id="eaps4e"
{
  "data": {
    "propertyUnit": {
      "id": "property_unit_uuid",
      "code": "Casa 01"
    },
    "currency": "USD",
    "outstandingBalance": "10.00",
    "overdueBalance": "10.00",
    "notDueBalance": "0.00",
    "creditBalance": "0.00",
    "unallocatedPaymentBalance": "0.00",
    "lastCalculatedAt": "2026-07-14T12:00:00Z",
    "isStale": false
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 11.4. Consultar mis movimientos financieros

### Endpoint

```http id="d2h64q"
GET /api/v1/me/property-units/{propertyUnitId}/financial-movements
```

### Permiso

```text id="jnjkot"
balances.read.own
```

Permiso futuro opcional:

```text id="l4zxso"
financialMovements.read.own
```

### Query params

| Nombre            | Tipo   | Descripción    |
| ----------------- | ------ | -------------- |
| `billingPeriodId` | string | Periodo        |
| `dateFrom`        | date   | Desde          |
| `dateTo`          | date   | Hasta          |
| `sourceType`      | string | Tipo de fuente |
| `page`            | number | Página         |
| `pageSize`        | number | Tamaño         |

### Reglas

* Unidad debe ser propia.
* Mostrar solo movimientos visibles al residente.
* No exponer auditoría interna.
* No exponer sourceHash.
* No exponer actorUserId.
* No exponer datos de otras unidades.

### Response 200

```json id="bjxf1f"
{
  "data": [
    {
      "sourceType": "charge",
      "sourceId": "charge_uuid",
      "movementDate": "2026-07-01T00:00:00Z",
      "dueDate": "2026-07-10T00:00:00Z",
      "description": "Alícuota mensual julio 2026",
      "debitAmount": "50.00",
      "creditAmount": "0.00",
      "currency": "USD",
      "status": "issued"
    },
    {
      "sourceType": "paymentAllocation",
      "sourceId": "payment_allocation_uuid",
      "movementDate": "2026-07-14T00:00:00Z",
      "dueDate": null,
      "description": "Pago aplicado",
      "debitAmount": "0.00",
      "creditAmount": "50.00",
      "currency": "USD",
      "status": "active"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 2,
    "totalPages": 1,
    "traceId": "req_123456"
  }
}
```

---

## 11.5. Exportar mi estado de cuenta

### Endpoint

```http id="u4qkmx"
GET /api/v1/me/account-statements/{statementId}/export
```

### Permiso

```text id="pbasnz"
accountStatements.export.own
```

### Query params

| Nombre   | Tipo   | Default | Descripción    |
| -------- | ------ | ------- | -------------- |
| `format` | string | `json`  | `json` o `csv` |

### Validaciones

* Statement pertenece a unidad propia.
* Statement está visible para `.own`.
* No incluir campos internos.
* Exportación se audita según política.
* Si no es propio, responder 404 recomendado.

### Response 200 — JSON

```json id="krdtds"
{
  "data": {
    "statement": {
      "id": "statement_uuid",
      "statementNumber": "ST-villa-club-2026-07-CASA-01",
      "status": "published",
      "propertyUnit": {
        "id": "property_unit_uuid",
        "code": "Casa 01"
      },
      "billingPeriod": {
        "periodCode": "2026-07"
      },
      "currency": "USD",
      "openingBalance": "0.00",
      "chargesTotal": "60.00",
      "paymentsTotal": "50.00",
      "closingBalance": "10.00"
    },
    "lines": []
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="rz6mac"
accountStatement.exported
```

---

# 12. DTOs principales

## 12.1. AccountStatementResponseDto

```json id="fn7on0"
{
  "id": "statement_uuid",
  "tenantId": "tenant_uuid",
  "propertyUnitId": "property_unit_uuid",
  "billingPeriodId": "billing_period_uuid",
  "statementNumber": "ST-villa-club-2026-07-CASA-01",
  "status": "published",
  "currency": "USD",
  "openingBalance": "0.00",
  "chargesTotal": "60.00",
  "adjustmentsTotal": "0.00",
  "paymentsTotal": "50.00",
  "reversalsTotal": "0.00",
  "creditBalance": "0.00",
  "closingBalance": "10.00",
  "overdueBalance": "10.00",
  "notDueBalance": "0.00",
  "lineCount": 5,
  "generatedAt": "2026-07-14T10:00:00Z",
  "publishedAt": "2026-07-14T11:00:00Z",
  "createdAt": "2026-07-14T10:00:00Z",
  "updatedAt": "2026-07-14T11:00:00Z"
}
```

---

## 12.2. AccountStatementDetailResponseDto

Incluye `lines`.

```json id="g27wwp"
{
  "id": "statement_uuid",
  "statementNumber": "ST-villa-club-2026-07-CASA-01",
  "status": "published",
  "currency": "USD",
  "openingBalance": "0.00",
  "chargesTotal": "60.00",
  "paymentsTotal": "50.00",
  "closingBalance": "10.00",
  "lines": []
}
```

---

## 12.3. AccountStatementLineResponseDto

```json id="sup1a9"
{
  "id": "line_uuid",
  "lineType": "charge",
  "sourceType": "charge",
  "sourceId": "charge_uuid",
  "description": "Alícuota mensual julio 2026",
  "lineDate": "2026-07-01T00:00:00Z",
  "dueDate": "2026-07-10T00:00:00Z",
  "debitAmount": "50.00",
  "creditAmount": "0.00",
  "balanceAfterLine": "50.00",
  "currency": "USD",
  "sortOrder": 2,
  "isVisibleToResident": true
}
```

---

## 12.4. UnitBalanceResponseDto

```json id="ld70n3"
{
  "propertyUnitId": "property_unit_uuid",
  "currency": "USD",
  "outstandingBalance": "10.00",
  "overdueBalance": "10.00",
  "notDueBalance": "0.00",
  "creditBalance": "0.00",
  "unallocatedPaymentBalance": "0.00",
  "lastCalculatedAt": "2026-07-14T12:00:00Z",
  "lastMovementAt": "2026-07-14T09:30:00Z",
  "isStale": false
}
```

---

## 12.5. FinancialMovementResponseDto

```json id="r2gy5o"
{
  "sourceType": "paymentAllocation",
  "sourceId": "payment_allocation_uuid",
  "propertyUnitId": "property_unit_uuid",
  "billingPeriodId": "billing_period_uuid",
  "movementDate": "2026-07-14T00:00:00Z",
  "dueDate": null,
  "description": "Pago aplicado",
  "debitAmount": "0.00",
  "creditAmount": "50.00",
  "currency": "USD",
  "status": "active",
  "isReversed": false,
  "sortOrder": 2
}
```

---

# 13. Validaciones generales

## 13.1. `tenantId`

El `tenantId` no debe recibirse desde el body.

Debe resolverse desde:

```text id="k1htcs"
CurrentTenant
TenantGuard
Membership context
```

Si el cliente envía `tenantId`:

```text id="lobp3x"
422 VALIDATION_ERROR
```

---

## 13.2. IDs

Validar formato de:

```text id="xb5afg"
statementId
propertyUnitId
billingPeriodId
snapshotId
sourceId
```

---

## 13.3. Period code

Formato requerido:

```text id="wfz6bb"
YYYY-MM
```

---

## 13.4. Montos

Reglas:

```text id="cxz8gx"
amount decimal string
currency = USD en MVP
máximo 2 decimales
sin redondeo silencioso
```

---

## 13.5. Estados

Validar estados permitidos:

```text id="vilg63"
draft
generated
published
closed
locked
superseded
archived
```

---

## 13.6. Motivos

Motivo requerido para:

```text id="wtu2rf"
close
lock
regenerate
```

---

## 13.7. Export format

Valores permitidos:

```text id="d8t5yh"
json
csv
```

PDF avanzado queda diferido.

---

# 14. Catálogo de errores

| Código                                 |    HTTP | Descripción                                    |
| -------------------------------------- | ------: | ---------------------------------------------- |
| `UNAUTHORIZED`                         |     401 | No autenticado                                 |
| `FORBIDDEN`                            |     403 | Sin permiso                                    |
| `TENANT_NOT_ACTIVE`                    |     403 | Tenant no activo                               |
| `MEMBERSHIP_NOT_ACTIVE`                |     403 | Membership no activa                           |
| `ACCOUNT_STATEMENT_NOT_FOUND`          |     404 | Estado de cuenta no encontrado                 |
| `ACCOUNT_STATEMENT_ALREADY_EXISTS`     |     409 | Ya existe statement activo para unidad/periodo |
| `ACCOUNT_STATEMENT_NOT_GENERATABLE`    |     409 | No se puede generar                            |
| `ACCOUNT_STATEMENT_NOT_PUBLISHABLE`    |     409 | No se puede publicar                           |
| `ACCOUNT_STATEMENT_NOT_CLOSABLE`       |     409 | No se puede cerrar                             |
| `ACCOUNT_STATEMENT_NOT_LOCKABLE`       |     409 | No se puede bloquear                           |
| `ACCOUNT_STATEMENT_NOT_REGENERABLE`    |     409 | No se puede regenerar                          |
| `ACCOUNT_STATEMENT_ALREADY_PUBLISHED`  |     409 | Ya publicado                                   |
| `ACCOUNT_STATEMENT_ALREADY_CLOSED`     |     409 | Ya cerrado                                     |
| `ACCOUNT_STATEMENT_ALREADY_LOCKED`     |     409 | Ya bloqueado                                   |
| `ACCOUNT_STATEMENT_SUPERSEDED`         |     409 | Statement reemplazado                          |
| `ACCOUNT_STATEMENT_ARCHIVED`           |     409 | Statement archivado                            |
| `ACCOUNT_STATEMENT_LINES_INCONSISTENT` |     409 | Líneas no cuadran con totales                  |
| `ACCOUNT_STATEMENT_SOURCE_CHANGED`     |     409 | Movimientos fuente cambiaron                   |
| `BALANCE_NOT_FOUND`                    |     404 | Balance no encontrado                          |
| `BALANCE_RECALCULATION_REQUIRED`       |     409 | Balance stale                                  |
| `BALANCE_CALCULATION_FAILED`           |     409 | Cálculo falló                                  |
| `FINANCIAL_MOVEMENTS_NOT_FOUND`        |     404 | Movimientos no encontrados                     |
| `PROPERTY_UNIT_NOT_FOUND`              |     404 | Unidad no encontrada                           |
| `PROPERTY_UNIT_NOT_ACTIVE`             |     409 | Unidad no activa                               |
| `BILLING_PERIOD_NOT_FOUND`             |     404 | Periodo no encontrado                          |
| `BILLING_PERIOD_NOT_VALID`             |     422 | Periodo inválido                               |
| `MONEY_AMOUNT_INVALID`                 |     422 | Monto inválido                                 |
| `CURRENCY_NOT_SUPPORTED`               |     422 | Moneda no soportada                            |
| `REASON_REQUIRED`                      |     422 | Motivo requerido                               |
| `EXPORT_FORMAT_NOT_SUPPORTED`          |     422 | Formato no soportado                           |
| `OWN_ACCOUNT_STATEMENT_NOT_FOUND`      |     404 | Statement propio no encontrado                 |
| `OWN_BALANCE_NOT_FOUND`                |     404 | Balance propio no encontrado                   |
| `OWN_PERSON_NOT_LINKED`                |     403 | Usuario sin persona vinculada                  |
| `CROSS_TENANT_REFERENCE`               | 403/422 | Recurso de otro tenant                         |
| `VALIDATION_ERROR`                     |     422 | Error de validación                            |
| `RATE_LIMITED`                         |     429 | Rate limit                                     |
| `INTERNAL_ERROR`                       |     500 | Error interno                                  |

---

# 15. Ejemplos de errores

## 15.1. Statement ya existe

```json id="ees7yv"
{
  "error": {
    "code": "ACCOUNT_STATEMENT_ALREADY_EXISTS",
    "message": "An active account statement already exists for this property unit and billing period.",
    "details": {
      "propertyUnitId": "property_unit_uuid",
      "billingPeriodId": "billing_period_uuid"
    },
    "traceId": "req_123456"
  }
}
```

---

## 15.2. Motivo requerido

```json id="tomoxh"
{
  "error": {
    "code": "REASON_REQUIRED",
    "message": "A reason is required for this financial operation.",
    "details": {
      "operation": "regenerate"
    },
    "traceId": "req_123456"
  }
}
```

---

## 15.3. Líneas inconsistentes

```json id="sab1eq"
{
  "error": {
    "code": "ACCOUNT_STATEMENT_LINES_INCONSISTENT",
    "message": "The account statement lines do not match the calculated totals.",
    "details": {
      "statementId": "statement_uuid"
    },
    "traceId": "req_123456"
  }
}
```

---

## 15.4. Source changed

```json id="ftc8rp"
{
  "error": {
    "code": "ACCOUNT_STATEMENT_SOURCE_CHANGED",
    "message": "The source financial movements have changed since this statement was generated.",
    "details": {
      "statementId": "statement_uuid"
    },
    "traceId": "req_123456"
  }
}
```

---

## 15.5. Consulta propia de statement ajeno

```json id="mx4f1u"
{
  "error": {
    "code": "OWN_ACCOUNT_STATEMENT_NOT_FOUND",
    "message": "Account statement not found.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

## 15.6. Referencia cross-tenant

```json id="kuem5x"
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

# 16. Auditoría por endpoint

| Endpoint                                               | Auditoría                                                     |
| ------------------------------------------------------ | ------------------------------------------------------------- |
| `POST /tenant/account-statements/generate`             | `accountStatement.generated`, `balance.snapshotCreated`       |
| `POST /tenant/account-statements/generate-batch`       | `accountStatement.batchGenerated`                             |
| `POST /tenant/account-statements/{id}/publish`         | `accountStatement.published`                                  |
| `POST /tenant/account-statements/{id}/close`           | `accountStatement.closed`                                     |
| `POST /tenant/account-statements/{id}/lock`            | `accountStatement.locked`                                     |
| `POST /tenant/account-statements/{id}/regenerate`      | `accountStatement.regenerated`, `accountStatement.superseded` |
| `GET /tenant/account-statements/{id}/export`           | `accountStatement.exported`                                   |
| `GET /tenant/property-units/{id}/balance`              | opcional `balance.calculated`                                 |
| `POST /tenant/property-units/{id}/balance/recalculate` | `balance.recalculated`, `balance.snapshotCreated`             |
| `GET /tenant/property-units/{id}/financial-movements`  | `financialMovements.viewed`                                   |
| `GET /me/account-statements/{id}`                      | opcional `accountStatement.viewedSensitive`                   |
| `GET /me/account-statements/{id}/export`               | `accountStatement.exported`                                   |

---

# 17. Eventos por endpoint

| Endpoint                                               | Evento                                                      |
| ------------------------------------------------------ | ----------------------------------------------------------- |
| `POST /tenant/account-statements/generate`             | `AccountStatementGenerated`, `BalanceSnapshotCreated`       |
| `POST /tenant/account-statements/generate-batch`       | `AccountStatementBatchGenerated`                            |
| `POST /tenant/account-statements/{id}/publish`         | `AccountStatementPublished`                                 |
| `POST /tenant/account-statements/{id}/close`           | `AccountStatementClosed`                                    |
| `POST /tenant/account-statements/{id}/lock`            | `AccountStatementLocked`                                    |
| `POST /tenant/account-statements/{id}/regenerate`      | `AccountStatementRegenerated`, `AccountStatementSuperseded` |
| `GET /tenant/account-statements/{id}/export`           | `AccountStatementExported`                                  |
| `POST /tenant/property-units/{id}/balance/recalculate` | `UnitBalanceRecalculated`, `BalanceSnapshotCreated`         |
| `GET /tenant/property-units/{id}/financial-movements`  | `FinancialMovementsViewed`                                  |
| `GET /me/account-statements/{id}/export`               | `AccountStatementExported`                                  |

---

# 18. Observabilidad

Todos los endpoints deben registrar:

```text id="x5rcn6"
traceId
method
path
status
latencyMs
actorUserId
tenantId
resourceType
resourceId si aplica
propertyUnitId si aplica
billingPeriodId si aplica
statementId si aplica
errorCode si aplica
```

No registrar:

```text id="xlhvlf"
Authorization header
access token
payload completo
datos personales innecesarios
export completo
sourceHash si se considera interno
stack trace en producción
```

Métricas sugeridas:

```text id="gozskn"
account_statements_generated_total
account_statements_batch_generated_total
account_statements_published_total
account_statements_closed_total
account_statements_locked_total
account_statements_regenerated_total
account_statements_exported_total
unit_balances_calculated_total
unit_balances_recalculated_total
balance_snapshots_created_total
financial_movements_viewed_total
account_statement_authorization_denied_total
own_account_statement_access_denied_total
account_statement_generation_failures_total
```

---

# 19. Rate limiting

Rate limiting recomendado para:

```text id="ntw8sn"
POST /api/v1/tenant/account-statements/generate
POST /api/v1/tenant/account-statements/generate-batch
POST /api/v1/tenant/account-statements/{statementId}/publish
POST /api/v1/tenant/account-statements/{statementId}/close
POST /api/v1/tenant/account-statements/{statementId}/lock
POST /api/v1/tenant/account-statements/{statementId}/regenerate
GET /api/v1/tenant/account-statements/{statementId}/export
POST /api/v1/tenant/property-units/{propertyUnitId}/balance/recalculate
GET /api/v1/me/account-statements/{statementId}/export
```

Objetivos:

* evitar regeneraciones abusivas;
* proteger exportaciones financieras;
* reducir enumeración de statements;
* proteger operaciones financieras críticas;
* evitar carga excesiva en batch generation.

---

# 20. CORS

Endpoints financieros autenticados no deben usar CORS abierto en producción.

Prohibido:

```text id="ztar9t"
Access-Control-Allow-Origin: *
```

Permitir solo orígenes oficiales de RESIDENT Core.

---

# 21. OpenAPI

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
* own policy cuando aplique;
* export metadata cuando aplique.

Tags sugeridos:

```text id="uq4wnb"
Account Statements
Balances
Financial Movements
Own Account Statements
```

---

## 22. Extensiones OpenAPI sugeridas

Para generación de statements:

```yaml id="onyoow"
x-required-permission: accountStatements.generate
x-audit-event: accountStatement.generated
x-tenant-scope: tenant
x-financial-operation: true
```

Para publicación:

```yaml id="rfzfwe"
x-required-permission: accountStatements.publish
x-audit-event: accountStatement.published
x-tenant-scope: tenant
x-financial-operation: true
```

Para regeneración:

```yaml id="kp4q06"
x-required-permission: accountStatements.regenerate
x-audit-event: accountStatement.regenerated
x-tenant-scope: tenant
x-financial-operation: true
x-requires-reason: true
```

Para exportación:

```yaml id="y3ev1l"
x-required-permission: accountStatements.export
x-audit-event: accountStatement.exported
x-tenant-scope: tenant
x-financial-export: true
```

Para endpoints propios:

```yaml id="gkb12y"
x-required-permission: accountStatements.read.own
x-own-resource-policy: true
x-tenant-scope: tenant
```

Para balances:

```yaml id="i4u1of"
x-required-permission: balances.read
x-tenant-scope: tenant
x-financial-operation: true
```

---

# 23. Pruebas de contrato requeridas

## 23.1. Account Statements API

Probar:

* listar;
* generar individual;
* generar batch;
* consultar;
* publicar;
* cerrar;
* bloquear;
* regenerar;
* exportar;
* modo duplicado;
* motivo requerido;
* unidad cross-tenant;
* periodo cross-tenant;
* sin permiso.

---

## 23.2. Balances API

Probar:

* listar balances;
* consultar balance por unidad;
* recalcular balance;
* consultar movimientos financieros;
* excluir movimientos inválidos;
* filtros;
* paginación;
* tenant isolation.

---

## 23.3. Own Account Statements API

Probar:

* listar mis statements;
* consultar mi statement;
* consultar mi balance;
* consultar mis movimientos;
* exportar mi statement;
* usuario sin Person;
* unidad ajena;
* statement ajeno;
* solo statements visibles;
* líneas no visibles no aparecen.

---

# 24. Matriz resumen de endpoints

| Método | Ruta                                                     | Auth | Permiso                        | Auditoría                         |
| ------ | -------------------------------------------------------- | ---: | ------------------------------ | --------------------------------- |
| GET    | `/api/v1/tenant/account-statements`                      |   Sí | `accountStatements.read`       | No obligatoria                    |
| POST   | `/api/v1/tenant/account-statements/generate`             |   Sí | `accountStatements.generate`   | `accountStatement.generated`      |
| POST   | `/api/v1/tenant/account-statements/generate-batch`       |   Sí | `accountStatements.generate`   | `accountStatement.batchGenerated` |
| GET    | `/api/v1/tenant/account-statements/{id}`                 |   Sí | `accountStatements.read`       | No obligatoria                    |
| POST   | `/api/v1/tenant/account-statements/{id}/publish`         |   Sí | `accountStatements.publish`    | `accountStatement.published`      |
| POST   | `/api/v1/tenant/account-statements/{id}/close`           |   Sí | `accountStatements.close`      | `accountStatement.closed`         |
| POST   | `/api/v1/tenant/account-statements/{id}/lock`            |   Sí | `accountStatements.lock`       | `accountStatement.locked`         |
| POST   | `/api/v1/tenant/account-statements/{id}/regenerate`      |   Sí | `accountStatements.regenerate` | `accountStatement.regenerated`    |
| GET    | `/api/v1/tenant/account-statements/{id}/export`          |   Sí | `accountStatements.export`     | `accountStatement.exported`       |
| GET    | `/api/v1/tenant/balances`                                |   Sí | `balances.read`                | No obligatoria                    |
| GET    | `/api/v1/tenant/property-units/{id}/balance`             |   Sí | `balances.read`                | Opcional                          |
| POST   | `/api/v1/tenant/property-units/{id}/balance/recalculate` |   Sí | `balances.recalculate`         | `balance.recalculated`            |
| GET    | `/api/v1/tenant/property-units/{id}/financial-movements` |   Sí | `balances.read`                | `financialMovements.viewed`       |
| GET    | `/api/v1/me/account-statements`                          |   Sí | `accountStatements.read.own`   | No obligatoria                    |
| GET    | `/api/v1/me/account-statements/{id}`                     |   Sí | `accountStatements.read.own`   | Opcional                          |
| GET    | `/api/v1/me/property-units/{id}/balance`                 |   Sí | `balances.read.own`            | No obligatoria                    |
| GET    | `/api/v1/me/property-units/{id}/financial-movements`     |   Sí | `balances.read.own`            | Opcional                          |
| GET    | `/api/v1/me/account-statements/{id}/export`              |   Sí | `accountStatements.export.own` | `accountStatement.exported`       |

---

# 25. Casos borde del contrato

| Caso                                                      | Resultado esperado                 |
| --------------------------------------------------------- | ---------------------------------- |
| Generar statement sin periodo                             | 422                                |
| Generar statement sin unidad                              | 422                                |
| Generar statement para unidad de otro tenant              | 403/422                            |
| Generar statement para periodo de otro tenant             | 403/422                            |
| Generar statement sin movimientos                         | statement con saldos en cero       |
| Generar dos veces mismo periodo/unidad con `failIfExists` | 409                                |
| Generar dos veces con `regenerateIfExists` sin motivo     | 422                                |
| Generar batch con una unidad inválida                     | error parcial o 422 según política |
| Publicar statement draft inválido                         | 409                                |
| Publicar statement ya published                           | 409 o idempotente documentado      |
| Publicar statement superseded                             | 409                                |
| Cerrar sin motivo                                         | 422                                |
| Cerrar statement superseded                               | 409                                |
| Bloquear sin motivo                                       | 422                                |
| Bloquear sin permiso                                      | 403                                |
| Regenerar locked sin permiso especial                     | 403/409                            |
| Regenerar sin motivo                                      | 422                                |
| Consultar statement ajeno `.own`                          | 404 recomendado                    |
| Consultar balance de unidad ajena `.own`                  | 404 recomendado                    |
| Exportar statement ajeno `.own`                           | 404 recomendado                    |
| Cálculo con pago reversado                                | pago no reduce saldo               |
| Cálculo con allocation reversada                          | allocation no reduce saldo         |
| Cálculo con cargo cancelado                               | cargo no suma                      |
| Cálculo con cargo reversado                               | cargo no suma                      |
| Monto con más de dos decimales                            | 422                                |
| Tenant suspendido genera statements                       | 403                                |
| Intentar borrar statement                                 | endpoint no existe                 |
| Export format no soportado                                | 422                                |
| Enviar tenantId en body                                   | 422                                |

---

# 26. Decisión final del contrato API

El módulo `006-account-statements` expondrá endpoints administrativos bajo:

```text id="gfdomx"
/api/v1/tenant/*
```

y endpoints propios bajo:

```text id="vq28fd"
/api/v1/me/*
```

Los endpoints administrativos permitirán a TenantAdmin, Treasurer, TenantAuditor y roles autorizados consultar, generar, publicar, cerrar, bloquear, regenerar y exportar estados de cuenta, así como consultar balances y movimientos financieros.

Los endpoints propios permitirán a propietarios o residentes autorizados consultar únicamente estados de cuenta, balances y movimientos de unidades propias.

La autorización dependerá de:

```text id="d44vj2"
tenant activo
membership activa
permiso financiero requerido
tenantId del recurso
unidad asociada al statement o balance
periodo asociado
relación UserProfile → Person → PropertyUnit para .own
```

Este contrato prepara a RESIDENT Core para mora, cobranza, notificaciones, reportes financieros y conciliación bancaria, asegurando que los estados de cuenta sean reconstruibles, auditables, tenant-scoped, precisos y seguros.
