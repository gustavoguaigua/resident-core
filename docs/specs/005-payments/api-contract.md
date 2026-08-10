# API Contract — Spec 005 Payments, Receipts and Payment Allocation

## 1. Información del documento

| Campo           | Valor                                                                         |
| --------------- | ----------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                 |
| Spec ID         | 005                                                                           |
| Módulo          | Payments                                                                      |
| Documento       | API Contract                                                                  |
| Ruta            | `docs/specs/005-payments/api-contract.md`                                     |
| Versión         | 0.1                                                                           |
| Estado          | needs-review                                                                  |
| Fecha           | 2026-07-14                                                                    |
| Documento base  | `docs/specs/005-payments/spec.md`                                             |
| Plan técnico    | `docs/specs/005-payments/plan.md`                                             |
| Modelo de datos | `docs/specs/005-payments/data-model.md`                                       |
| API Style       | REST                                                                          |
| API Version     | `/api/v1`                                                                     |
| Formato         | JSON                                                                          |
| Autorización    | Tenant-aware RBAC + permisos financieros + `.own` policies                    |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees` |

---

## 2. Propósito

Este documento define el contrato API del módulo `005-payments`.

El objetivo es establecer:

* endpoints administrativos;
* endpoints propios;
* endpoints de comprobantes;
* endpoints de asignaciones;
* métodos HTTP;
* permisos requeridos;
* requests;
* responses;
* errores;
* validaciones;
* estados;
* reglas de idempotencia;
* reglas de carga y descarga de comprobantes;
* reglas de confirmación;
* reglas de rechazo;
* reglas de asignación;
* reglas de autoasignación;
* reglas de reverso;
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
* integración futura con estados de cuenta y conciliación bancaria.

---

## 3. Principios del contrato API

### 3.1. Tenant como frontera financiera

Todo endpoint administrativo de pagos opera dentro del tenant activo.

Regla:

```text id="b7d4a3"
Un endpoint /api/v1/tenant/* nunca debe crear, consultar, confirmar, rechazar, asignar, reversar o descargar pagos de otro tenant.
```

---

### 3.2. Unidad como base del pago

Todo pago debe estar asociado a una unidad habitacional.

```text id="x6zhxq"
Payment.propertyUnitId requerido.
```

La unidad debe pertenecer al tenant activo.

---

### 3.3. Cargo como destino de asignación

Todo `PaymentAllocation` debe aplicar un pago a un cargo existente.

Regla MVP:

```text id="m845lx"
Payment.propertyUnitId == Charge.propertyUnitId
```

---

### 3.4. Dinero como decimal

Todos los montos monetarios se envían y reciben como string decimal.

Ejemplo:

```json id="uwnuv5"
{
  "amount": "100.00",
  "currency": "USD"
}
```

Prohibido en contrato:

```text id="8bqpbr"
float
double
number sin control decimal para dinero
```

---

### 3.5. Idempotencia en creación de pagos

La creación de pagos debe soportar idempotencia.

Regla:

```text id="3qoz85"
Reintentar el mismo registro de pago no debe crear pagos duplicados.
```

---

### 3.6. Monto original del pago inmutable

El `amount` de un pago registrado no debe sobrescribirse.

Las correcciones se realizan con:

```text id="hjasfm"
rechazo
cancelación
reverso
reverso de asignación
nuevo pago correctivo si aplica
```

---

### 3.7. No eliminación física

No se exponen endpoints `DELETE` para pagos, comprobantes, asignaciones o reversos.

---

### 3.8. Comprobantes privados

Los comprobantes de pago no deben exponerse públicamente.

La descarga debe pasar por:

```text id="xmpzmy"
autenticación
tenant activo
membership activa
permiso
validación de recurso
URL temporal o stream controlado
```

---

## 4. Respuesta estándar

### 4.1. Respuesta individual

```json id="r0xh91"
{
  "data": {},
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

### 4.2. Respuesta paginada

```json id="eu61cn"
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

```json id="arw3vy"
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

| Header             |        Requerido | Descripción                                              |
| ------------------ | ---------------: | -------------------------------------------------------- |
| `Authorization`    |               Sí | Bearer token                                             |
| `Content-Type`     | Sí en POST/PATCH | `application/json` o `multipart/form-data` para archivos |
| `Accept`           |      Recomendado | `application/json`                                       |
| `X-Request-Id`     |         Opcional | ID de request                                            |
| `X-Correlation-Id` |         Opcional | ID de correlación                                        |
| `Idempotency-Key`  |         Opcional | Recomendado para creación de pagos                       |

---

### 5.2. Response headers

| Header             | Descripción                 |
| ------------------ | --------------------------- |
| `Content-Type`     | `application/json`          |
| `X-Request-Id`     | ID de request               |
| `X-Correlation-Id` | ID de correlación si aplica |

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
|    409 | Conflicto de estado, duplicidad o idempotencia                 |
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

```text id="gr0akb"
GET /api/v1/tenant/payments?page=1&pageSize=20
```

---

## 8. Ordenamiento

Parámetros:

| Query param | Tipo   | Default     |
| ----------- | ------ | ----------- |
| `sortBy`    | string | `createdAt` |
| `sortOrder` | string | `desc`      |

Valores permitidos para `sortOrder`:

```text id="ot78xq"
asc
desc
```

Campos permitidos:

```text id="rq5d92"
createdAt
updatedAt
paidAt
reportedAt
confirmedAt
amount
allocatedAmount
unallocatedAmount
status
method
```

No permitir ordenamiento por campos arbitrarios.

---

# 9. Payments API administrativa

Ruta base:

```text id="l2bpki"
/api/v1/tenant/payments
```

Requiere:

```text id="psdjag"
AuthGuard
TenantGuard
TenantPermissionGuard
```

---

## 9.1. Listar pagos

### Endpoint

```http id="r6w2ys"
GET /api/v1/tenant/payments
```

### Permiso

```text id="bqwwax"
payments.read
```

### Query params

| Nombre                 | Tipo   | Descripción         |
| ---------------------- | ------ | ------------------- |
| `page`                 | number | Página              |
| `pageSize`             | number | Tamaño              |
| `status`               | string | Estado del pago     |
| `method`               | string | Método de pago      |
| `propertyUnitId`       | string | Filtrar por unidad  |
| `paidAtFrom`           | date   | Fecha de pago desde |
| `paidAtTo`             | date   | Fecha de pago hasta |
| `createdBy`            | string | Usuario creador     |
| `reportedBy`           | string | Usuario que reportó |
| `transactionReference` | string | Referencia          |
| `sortBy`               | string | Campo permitido     |
| `sortOrder`            | string | asc/desc            |

### Response 200

```json id="shn3md"
{
  "data": [
    {
      "id": "payment_uuid",
      "tenantId": "tenant_uuid",
      "propertyUnit": {
        "id": "property_unit_uuid",
        "code": "Casa 01"
      },
      "method": "bankTransfer",
      "amount": "100.00",
      "allocatedAmount": "50.00",
      "unallocatedAmount": "50.00",
      "currency": "USD",
      "paidAt": "2026-07-14T09:30:00Z",
      "reportedAt": "2026-07-14T10:00:00Z",
      "confirmedAt": "2026-07-14T11:00:00Z",
      "status": "partiallyAllocated",
      "transactionReference": "DEMO-TRANSFER-001",
      "externalReference": null,
      "createdAt": "2026-07-14T10:00:00Z",
      "updatedAt": "2026-07-14T11:15:00Z"
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

## 9.2. Crear pago administrativo

### Endpoint

```http id="smljib"
POST /api/v1/tenant/payments
```

### Permiso

```text id="n8o4fm"
payments.create
```

### Headers

```text id="hxa7do"
Idempotency-Key: optional-client-key
```

### Request body

```json id="ctqvlj"
{
  "propertyUnitId": "property_unit_uuid",
  "method": "bankTransfer",
  "amount": "100.00",
  "currency": "USD",
  "paidAt": "2026-07-14T09:30:00Z",
  "transactionReference": "DEMO-TRANSFER-001",
  "externalReference": null,
  "notes": "Transferencia registrada por tesorería."
}
```

### Validaciones

* `propertyUnitId` requerido.
* Unidad debe pertenecer al tenant.
* Unidad debe estar activa o permitir pagos históricos según política.
* `method` requerido.
* `amount` decimal positivo.
* `currency = USD`.
* `paidAt` requerido.
* `transactionReference` requerida para `bankTransfer` y `deposit` según política.
* No se acepta `tenantId` en body.
* No se acepta `allocatedAmount` ni `unallocatedAmount` en body.
* No se acepta `status` arbitrario desde body.

### Estado inicial recomendado

Pago administrativo:

```text id="nskymy"
confirmed
```

si el usuario tiene `payments.create` y la política lo permite.

Alternativa:

```text id="x0upxz"
pendingValidation
```

si se requiere validación posterior incluso para pagos administrativos.

### Response 201

```json id="fqog4p"
{
  "data": {
    "id": "payment_uuid",
    "tenantId": "tenant_uuid",
    "propertyUnitId": "property_unit_uuid",
    "method": "bankTransfer",
    "amount": "100.00",
    "allocatedAmount": "0.00",
    "unallocatedAmount": "100.00",
    "currency": "USD",
    "paidAt": "2026-07-14T09:30:00Z",
    "reportedAt": null,
    "confirmedAt": "2026-07-14T10:00:00Z",
    "confirmedBy": "user_uuid",
    "status": "confirmed",
    "transactionReference": "DEMO-TRANSFER-001",
    "externalReference": null,
    "createdAt": "2026-07-14T10:00:00Z",
    "updatedAt": "2026-07-14T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Idempotencia

Si se repite el mismo `Idempotency-Key` con el mismo payload financiero:

```text id="raf4md"
200 o 201 con el mismo Payment existente, según política de implementación.
```

Si se repite el mismo `Idempotency-Key` con payload distinto:

```text id="tgxw5e"
409 IDEMPOTENCY_CONFLICT
```

### Auditoría

```text id="ibspbh"
payment.created
```

### Evento

```text id="vp1kek"
PaymentCreated
```

---

## 9.3. Consultar pago

### Endpoint

```http id="jlcz1x"
GET /api/v1/tenant/payments/{paymentId}
```

### Permiso

```text id="fdqu0o"
payments.read
```

### Response 200

```json id="ifjnah"
{
  "data": {
    "id": "payment_uuid",
    "tenantId": "tenant_uuid",
    "propertyUnit": {
      "id": "property_unit_uuid",
      "code": "Casa 01"
    },
    "method": "bankTransfer",
    "amount": "100.00",
    "allocatedAmount": "50.00",
    "unallocatedAmount": "50.00",
    "currency": "USD",
    "paidAt": "2026-07-14T09:30:00Z",
    "reportedAt": "2026-07-14T10:00:00Z",
    "reportedBy": "user_uuid",
    "createdBy": "user_uuid",
    "confirmedAt": "2026-07-14T11:00:00Z",
    "confirmedBy": "treasurer_user_uuid",
    "rejectedAt": null,
    "rejectedBy": null,
    "rejectionReason": null,
    "cancelledAt": null,
    "cancelledBy": null,
    "cancellationReason": null,
    "status": "partiallyAllocated",
    "transactionReference": "DEMO-TRANSFER-001",
    "externalReference": null,
    "notes": "Transferencia registrada.",
    "receipts": [
      {
        "id": "receipt_uuid",
        "status": "accepted",
        "fileName": "demo-receipt-001.pdf",
        "mimeType": "application/pdf",
        "fileSize": 123456,
        "uploadedAt": "2026-07-14T10:05:00Z"
      }
    ],
    "allocations": [
      {
        "id": "allocation_uuid",
        "chargeId": "charge_uuid",
        "amount": "50.00",
        "currency": "USD",
        "status": "active",
        "allocatedAt": "2026-07-14T11:15:00Z"
      }
    ],
    "createdAt": "2026-07-14T10:00:00Z",
    "updatedAt": "2026-07-14T11:15:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 9.4. Confirmar pago

### Endpoint

```http id="qpi4aj"
POST /api/v1/tenant/payments/{paymentId}/confirm
```

### Permiso

```text id="x1zos0"
payments.confirm
```

### Request body

```json id="b6a5ss"
{
  "notes": "Comprobante revisado y pago confirmado."
}
```

### Validaciones

* Pago pertenece al tenant.
* Pago está en estado confirmable.
* Actor tiene permiso.
* Si el método requiere comprobante, debe existir comprobante o referencia válida.
* Pago no está rechazado.
* Pago no está reversado.
* Pago no está cancelado.

### Response 200

```json id="vw1vai"
{
  "data": {
    "id": "payment_uuid",
    "status": "confirmed",
    "confirmedAt": "2026-07-14T11:00:00Z",
    "confirmedBy": "user_uuid",
    "amount": "100.00",
    "allocatedAmount": "0.00",
    "unallocatedAmount": "100.00",
    "currency": "USD"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="s8nsqj"
payment.confirmed
```

### Evento

```text id="s2z0ia"
PaymentConfirmed
```

---

## 9.5. Rechazar pago

### Endpoint

```http id="qtwux1"
POST /api/v1/tenant/payments/{paymentId}/reject
```

### Permiso

```text id="au1w4w"
payments.reject
```

### Request body

```json id="oex565"
{
  "reason": "El comprobante no corresponde al pago reportado."
}
```

### Validaciones

* Pago pertenece al tenant.
* Pago está en estado rechazable.
* Motivo requerido.
* Pago no tiene asignaciones activas.
* Pago no está confirmado, asignado o reversado salvo política explícita.

### Response 200

```json id="ai90dw"
{
  "data": {
    "id": "payment_uuid",
    "status": "rejected",
    "rejectedAt": "2026-07-14T11:20:00Z",
    "rejectedBy": "user_uuid",
    "rejectionReason": "El comprobante no corresponde al pago reportado.",
    "amount": "100.00",
    "allocatedAmount": "0.00",
    "unallocatedAmount": "0.00",
    "currency": "USD"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="br44ai"
payment.rejected
```

### Evento

```text id="i2r66b"
PaymentRejected
```

---

## 9.6. Asignar pago a cargos

### Endpoint

```http id="rhfv30"
POST /api/v1/tenant/payments/{paymentId}/allocate
```

### Permiso

```text id="f3du8n"
payments.allocate
```

### Request body

```json id="v7y092"
{
  "allocations": [
    {
      "chargeId": "charge_uuid_1",
      "amount": "50.00"
    },
    {
      "chargeId": "charge_uuid_2",
      "amount": "25.00"
    }
  ]
}
```

### Validaciones

* Pago pertenece al tenant.
* Pago debe estar `confirmed` o `partiallyAllocated`.
* Pago no debe estar `rejected`, `cancelled` o `reversed`.
* Cada cargo pertenece al tenant.
* Cada cargo pertenece a la misma unidad que el pago en MVP.
* Cada cargo tiene saldo pendiente.
* Cada amount es Decimal positivo.
* La suma asignada no excede `Payment.unallocatedAmount`.
* Cada asignación no excede saldo pendiente del cargo.
* La operación debe ejecutarse en transacción.
* No se acepta `tenantId` en body.

### Response 200

```json id="fvfswq"
{
  "data": {
    "paymentId": "payment_uuid",
    "status": "partiallyAllocated",
    "amount": "100.00",
    "allocatedAmount": "75.00",
    "unallocatedAmount": "25.00",
    "currency": "USD",
    "allocations": [
      {
        "id": "allocation_uuid_1",
        "chargeId": "charge_uuid_1",
        "amount": "50.00",
        "currency": "USD",
        "status": "active",
        "allocatedAt": "2026-07-14T11:30:00Z"
      },
      {
        "id": "allocation_uuid_2",
        "chargeId": "charge_uuid_2",
        "amount": "25.00",
        "currency": "USD",
        "status": "active",
        "allocatedAt": "2026-07-14T11:30:00Z"
      }
    ]
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Estados resultantes

```text id="ox1ij4"
unallocatedAmount > 0  → partiallyAllocated
unallocatedAmount = 0  → allocated
```

### Auditoría

```text id="ef0a1u"
payment.allocated
paymentAllocation.created
```

### Evento

```text id="tqnhcw"
PaymentAllocated
PaymentAllocationCreated
```

---

## 9.7. Autoasignar pago

### Endpoint

```http id="nxlyhz"
POST /api/v1/tenant/payments/{paymentId}/auto-allocate
```

### Permiso

```text id="rxi70z"
payments.allocate
```

### Request body

```json id="zn48rg"
{
  "strategy": "oldestDueDateFirst"
}
```

### Validaciones

* Pago pertenece al tenant.
* Pago debe estar `confirmed` o `partiallyAllocated`.
* Pago tiene monto no asignado.
* Solo considera cargos pendientes de la misma unidad.
* Estrategia MVP: `oldestDueDateFirst`.
* La operación debe ejecutarse en transacción.

### Response 200

```json id="d33a1e"
{
  "data": {
    "paymentId": "payment_uuid",
    "strategy": "oldestDueDateFirst",
    "status": "allocated",
    "amount": "100.00",
    "allocatedAmount": "100.00",
    "unallocatedAmount": "0.00",
    "currency": "USD",
    "allocations": [
      {
        "id": "allocation_uuid_1",
        "chargeId": "charge_uuid_1",
        "amount": "50.00",
        "status": "active"
      },
      {
        "id": "allocation_uuid_2",
        "chargeId": "charge_uuid_2",
        "amount": "50.00",
        "status": "active"
      }
    ]
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="fwnb1r"
payment.autoAllocated
paymentAllocation.created
```

### Evento

```text id="dwlsiu"
PaymentAutoAllocated
PaymentAllocationCreated
```

---

## 9.8. Reversar pago

### Endpoint

```http id="y4y7jv"
POST /api/v1/tenant/payments/{paymentId}/reverse
```

### Permiso

```text id="y96ehz"
payments.reverse
```

### Request body

```json id="ho605w"
{
  "reason": "Pago registrado por error administrativo."
}
```

### Validaciones

* Pago pertenece al tenant.
* Pago está en estado reversible.
* Pago no tiene reverso previo.
* Motivo requerido.
* Actor tiene permiso.
* Deben reversarse asignaciones activas.
* Deben recalcularse cargos afectados.
* La operación debe ejecutarse en transacción.

### Response 200

```json id="b0lw9p"
{
  "data": {
    "paymentId": "payment_uuid",
    "status": "reversed",
    "amount": "100.00",
    "allocatedAmount": "0.00",
    "unallocatedAmount": "0.00",
    "currency": "USD",
    "reversal": {
      "id": "payment_reversal_uuid",
      "reason": "Pago registrado por error administrativo.",
      "reversedBy": "user_uuid",
      "reversedAt": "2026-07-14T12:00:00Z"
    },
    "reversedAllocations": [
      {
        "id": "allocation_uuid_1",
        "chargeId": "charge_uuid_1",
        "amount": "50.00",
        "status": "reversed"
      }
    ]
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="gnd8pt"
payment.reversed
paymentAllocation.reversed
```

### Evento

```text id="krawqh"
PaymentReversed
PaymentAllocationReversed
```

---

# 10. Payment Receipts API

Rutas base:

```text id="t79dm2"
/api/v1/tenant/payments/{paymentId}/receipts
/api/v1/tenant/payment-receipts/{receiptId}
```

Requiere:

```text id="bcvk5c"
AuthGuard
TenantGuard
TenantPermissionGuard
```

---

## 10.1. Listar comprobantes de un pago

### Endpoint

```http id="pclhpm"
GET /api/v1/tenant/payments/{paymentId}/receipts
```

### Permiso

```text id="dn5bxc"
paymentReceipts.read
```

### Response 200

```json id="orcxii"
{
  "data": [
    {
      "id": "receipt_uuid",
      "paymentId": "payment_uuid",
      "fileName": "demo-receipt-001.pdf",
      "mimeType": "application/pdf",
      "fileSize": 123456,
      "receiptNumber": null,
      "transactionReference": "DEMO-TRANSFER-001",
      "status": "uploaded",
      "uploadedBy": "user_uuid",
      "uploadedAt": "2026-07-14T10:05:00Z",
      "reviewedBy": null,
      "reviewedAt": null,
      "rejectionReason": null
    }
  ],
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 10.2. Subir comprobante a un pago

### Endpoint

```http id="mjuo0r"
POST /api/v1/tenant/payments/{paymentId}/receipts
```

### Permiso

```text id="yjhddx"
paymentReceipts.create
```

### Content-Type

```text id="u6m1od"
multipart/form-data
```

### Form fields

| Campo                  | Tipo   | Requerido | Descripción            |
| ---------------------- | ------ | --------: | ---------------------- |
| `file`                 | file   |        No | Archivo de comprobante |
| `receiptNumber`        | string |        No | Número de comprobante  |
| `transactionReference` | string |        No | Referencia             |
| `notes`                | string |        No | Notas                  |

### Validaciones

* Pago pertenece al tenant.
* Debe existir al menos `file`, `receiptNumber` o `transactionReference`.
* Archivo permitido: PDF, JPG, PNG, WEBP opcional.
* Tamaño máximo recomendado: 5 MB.
* Nombre de archivo sanitizado.
* Storage privado.
* No aceptar rutas de archivo desde cliente.
* No exponer URL pública permanente.

### Response 201

```json id="u2xkuq"
{
  "data": {
    "id": "receipt_uuid",
    "tenantId": "tenant_uuid",
    "paymentId": "payment_uuid",
    "fileId": "private_file_id",
    "fileName": "demo-receipt-001.pdf",
    "mimeType": "application/pdf",
    "fileSize": 123456,
    "receiptNumber": null,
    "transactionReference": "DEMO-TRANSFER-001",
    "status": "uploaded",
    "uploadedBy": "user_uuid",
    "uploadedAt": "2026-07-14T10:05:00Z",
    "createdAt": "2026-07-14T10:05:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="j4plej"
paymentReceipt.uploaded
```

### Evento

```text id="fa5e8k"
PaymentReceiptUploaded
```

---

## 10.3. Consultar comprobante

### Endpoint

```http id="ttv5gi"
GET /api/v1/tenant/payment-receipts/{receiptId}
```

### Permiso

```text id="o66wrb"
paymentReceipts.read
```

### Response 200

```json id="tkz13w"
{
  "data": {
    "id": "receipt_uuid",
    "tenantId": "tenant_uuid",
    "paymentId": "payment_uuid",
    "fileName": "demo-receipt-001.pdf",
    "mimeType": "application/pdf",
    "fileSize": 123456,
    "receiptNumber": null,
    "transactionReference": "DEMO-TRANSFER-001",
    "status": "uploaded",
    "uploadedBy": "user_uuid",
    "uploadedAt": "2026-07-14T10:05:00Z",
    "reviewedBy": null,
    "reviewedAt": null,
    "rejectionReason": null,
    "createdAt": "2026-07-14T10:05:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 10.4. Descargar comprobante

### Endpoint

```http id="k6ci5z"
GET /api/v1/tenant/payment-receipts/{receiptId}/download
```

### Permiso

```text id="bi8z05"
paymentReceipts.download
```

### Validaciones

* Receipt pertenece al tenant.
* Receipt tiene `fileId`.
* Actor tiene permiso.
* Archivo existe en storage privado.
* No devolver URL permanente.

### Response 200 — opción URL temporal

```json id="rbznee"
{
  "data": {
    "downloadUrl": "https://storage.example.com/signed-temporary-url",
    "expiresAt": "2026-07-14T10:15:00Z",
    "fileName": "demo-receipt-001.pdf",
    "mimeType": "application/pdf",
    "fileSize": 123456
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Response 200 — opción stream

```text id="jb3wfz"
application/pdf
```

### Auditoría

```text id="cq6x2u"
paymentReceipt.downloaded
```

---

## 10.5. Aceptar comprobante

### Endpoint

```http id="z507fx"
POST /api/v1/tenant/payment-receipts/{receiptId}/accept
```

### Permiso

```text id="xf07d0"
paymentReceipts.review
```

### Request body

```json id="amuej7"
{
  "notes": "Comprobante legible y coincidente."
}
```

### Response 200

```json id="v3x2fz"
{
  "data": {
    "id": "receipt_uuid",
    "status": "accepted",
    "reviewedBy": "user_uuid",
    "reviewedAt": "2026-07-14T11:05:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="sa00uj"
paymentReceipt.accepted
```

### Evento

```text id="fkxzdy"
PaymentReceiptAccepted
```

---

## 10.6. Rechazar comprobante

### Endpoint

```http id="i6xuae"
POST /api/v1/tenant/payment-receipts/{receiptId}/reject
```

### Permiso

```text id="iqbb38"
paymentReceipts.reject
```

### Request body

```json id="enc22l"
{
  "reason": "El comprobante está borroso o incompleto."
}
```

### Validaciones

* Receipt pertenece al tenant.
* Motivo requerido.
* Receipt está en estado revisable.

### Response 200

```json id="bip6ef"
{
  "data": {
    "id": "receipt_uuid",
    "status": "rejected",
    "reviewedBy": "user_uuid",
    "reviewedAt": "2026-07-14T11:10:00Z",
    "rejectionReason": "El comprobante está borroso o incompleto."
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="j0l2zd"
paymentReceipt.rejected
```

### Evento

```text id="hkn9hx"
PaymentReceiptRejected
```

---

# 11. Payment Allocations API

Rutas base:

```text id="en8nm5"
/api/v1/tenant/payments/{paymentId}/allocations
/api/v1/tenant/payment-allocations/{allocationId}
```

---

## 11.1. Listar asignaciones de un pago

### Endpoint

```http id="mhpovv"
GET /api/v1/tenant/payments/{paymentId}/allocations
```

### Permiso

```text id="skyptw"
payments.read
```

### Response 200

```json id="p2mo5z"
{
  "data": [
    {
      "id": "allocation_uuid",
      "paymentId": "payment_uuid",
      "chargeId": "charge_uuid",
      "propertyUnitId": "property_unit_uuid",
      "amount": "50.00",
      "currency": "USD",
      "status": "active",
      "allocatedBy": "user_uuid",
      "allocatedAt": "2026-07-14T11:30:00Z",
      "reversedAt": null,
      "reversedBy": null,
      "reversalReason": null
    }
  ],
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 11.2. Consultar asignación

### Endpoint

```http id="i58rg3"
GET /api/v1/tenant/payment-allocations/{allocationId}
```

### Permiso

```text id="bg8thk"
payments.read
```

### Response 200

```json id="eftw1s"
{
  "data": {
    "id": "allocation_uuid",
    "tenantId": "tenant_uuid",
    "paymentId": "payment_uuid",
    "chargeId": "charge_uuid",
    "propertyUnitId": "property_unit_uuid",
    "amount": "50.00",
    "currency": "USD",
    "status": "active",
    "allocatedBy": "user_uuid",
    "allocatedAt": "2026-07-14T11:30:00Z",
    "reversedAt": null,
    "reversedBy": null,
    "reversalReason": null,
    "createdAt": "2026-07-14T11:30:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 11.3. Reversar asignación

### Endpoint

```http id="v0z8o2"
POST /api/v1/tenant/payment-allocations/{allocationId}/reverse
```

### Permiso

```text id="jan45o"
payments.allocate
```

Permiso futuro opcional:

```text id="izd0vs"
payments.allocations.reverse
```

### Request body

```json id="f6p5a1"
{
  "reason": "Asignación aplicada al cargo incorrecto."
}
```

### Validaciones

* Allocation pertenece al tenant.
* Allocation está activa.
* Motivo requerido.
* Actor tiene permiso.
* Debe recalcular pago.
* Debe recalcular cargo afectado.
* Operación transaccional.

### Response 200

```json id="i2gck8"
{
  "data": {
    "id": "allocation_uuid",
    "paymentId": "payment_uuid",
    "chargeId": "charge_uuid",
    "amount": "50.00",
    "currency": "USD",
    "status": "reversed",
    "reversedAt": "2026-07-14T12:10:00Z",
    "reversedBy": "user_uuid",
    "reversalReason": "Asignación aplicada al cargo incorrecto.",
    "payment": {
      "id": "payment_uuid",
      "allocatedAmount": "0.00",
      "unallocatedAmount": "100.00",
      "status": "confirmed"
    }
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="rlex9t"
paymentAllocation.reversed
```

### Evento

```text id="etduvr"
PaymentAllocationReversed
```

---

# 12. Own Payments API

Ruta base:

```text id="kasmvz"
/api/v1/me
```

Requiere:

```text id="d0xegp"
AuthGuard
TenantGuard
TenantPermissionGuard o PolicyGuard
OwnPaymentPolicyService
```

---

## 12.1. Consultar mis pagos

### Endpoint

```http id="dj97rg"
GET /api/v1/me/payments
```

### Permiso

```text id="o10xid"
payments.read.own
```

### Query params

| Nombre           | Tipo   | Descripción               |
| ---------------- | ------ | ------------------------- |
| `propertyUnitId` | string | Filtrar por unidad propia |
| `status`         | string | Estado                    |
| `method`         | string | Método                    |
| `paidAtFrom`     | date   | Desde                     |
| `paidAtTo`       | date   | Hasta                     |
| `page`           | number | Página                    |
| `pageSize`       | number | Tamaño                    |

### Response 200

```json id="jumxab"
{
  "data": [
    {
      "id": "payment_uuid",
      "propertyUnit": {
        "id": "property_unit_uuid",
        "code": "Casa 01"
      },
      "method": "bankTransfer",
      "amount": "100.00",
      "allocatedAmount": "50.00",
      "unallocatedAmount": "50.00",
      "currency": "USD",
      "paidAt": "2026-07-14T09:30:00Z",
      "reportedAt": "2026-07-14T10:00:00Z",
      "confirmedAt": "2026-07-14T11:00:00Z",
      "status": "partiallyAllocated",
      "transactionReference": "DEMO-TRANSFER-001",
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

### Reglas

* Resolver unidades propias.
* Filtrar por `propertyUnitId IN ownPropertyUnitIds`.
* No devolver pagos de unidades ajenas.
* No devolver pagos de otro tenant.
* No exponer notas internas si no están permitidas.

---

## 12.2. Reportar pago propio

### Endpoint

```http id="yffk9t"
POST /api/v1/me/payments
```

### Permiso

```text id="ovgwvq"
payments.create.own
```

### Headers

```text id="lohayy"
Idempotency-Key: optional-client-key
```

### Request body

```json id="yvxfci"
{
  "propertyUnitId": "property_unit_uuid",
  "method": "bankTransfer",
  "amount": "100.00",
  "currency": "USD",
  "paidAt": "2026-07-14T09:30:00Z",
  "transactionReference": "DEMO-TRANSFER-001",
  "notes": "Pago reportado por propietario."
}
```

### Validaciones

* Unidad debe ser propia.
* Usuario debe tener `Person` vinculada.
* Monto Decimal positivo.
* Moneda USD.
* Método válido.
* `bankTransfer` o `deposit` requieren referencia o comprobante según política.
* Estado inicial `pendingValidation`.
* No se acepta `tenantId`.
* No se acepta `status`.

### Response 201

```json id="woxw84"
{
  "data": {
    "id": "payment_uuid",
    "propertyUnitId": "property_unit_uuid",
    "method": "bankTransfer",
    "amount": "100.00",
    "allocatedAmount": "0.00",
    "unallocatedAmount": "100.00",
    "currency": "USD",
    "paidAt": "2026-07-14T09:30:00Z",
    "reportedAt": "2026-07-14T10:00:00Z",
    "status": "pendingValidation",
    "transactionReference": "DEMO-TRANSFER-001",
    "createdAt": "2026-07-14T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="jnphb2"
payment.reported
```

### Evento

```text id="xo5a9q"
PaymentReported
```

---

## 12.3. Consultar mi pago

### Endpoint

```http id="ha2dnq"
GET /api/v1/me/payments/{paymentId}
```

### Permiso

```text id="rvc8jl"
payments.read.own
```

### Validaciones

* Pago pertenece al tenant.
* Pago pertenece a unidad propia.
* Si no es propio, responder 404 recomendado.

### Response 200

```json id="n06mwq"
{
  "data": {
    "id": "payment_uuid",
    "propertyUnit": {
      "id": "property_unit_uuid",
      "code": "Casa 01"
    },
    "method": "bankTransfer",
    "amount": "100.00",
    "allocatedAmount": "50.00",
    "unallocatedAmount": "50.00",
    "currency": "USD",
    "paidAt": "2026-07-14T09:30:00Z",
    "reportedAt": "2026-07-14T10:00:00Z",
    "confirmedAt": "2026-07-14T11:00:00Z",
    "status": "partiallyAllocated",
    "transactionReference": "DEMO-TRANSFER-001",
    "receipts": [
      {
        "id": "receipt_uuid",
        "fileName": "demo-receipt-001.pdf",
        "mimeType": "application/pdf",
        "fileSize": 123456,
        "status": "accepted",
        "uploadedAt": "2026-07-14T10:05:00Z"
      }
    ],
    "allocations": [
      {
        "id": "allocation_uuid",
        "chargeId": "charge_uuid",
        "amount": "50.00",
        "currency": "USD",
        "status": "active",
        "allocatedAt": "2026-07-14T11:30:00Z"
      }
    ]
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 12.4. Subir comprobante a mi pago

### Endpoint

```http id="w57aj7"
POST /api/v1/me/payments/{paymentId}/receipts
```

### Permiso

```text id="cizwv5"
payments.receipts.upload.own
```

### Content-Type

```text id="q50d7z"
multipart/form-data
```

### Form fields

| Campo                  | Tipo   | Requerido | Descripción           |
| ---------------------- | ------ | --------: | --------------------- |
| `file`                 | file   |        No | Archivo               |
| `receiptNumber`        | string |        No | Número de comprobante |
| `transactionReference` | string |        No | Referencia            |
| `notes`                | string |        No | Notas                 |

### Validaciones

* Pago pertenece a unidad propia.
* Pago está en estado que permite comprobante.
* Debe existir al menos archivo, número o referencia.
* Archivo permitido.
* Tamaño permitido.
* Storage privado.

### Response 201

```json id="jv5re9"
{
  "data": {
    "id": "receipt_uuid",
    "paymentId": "payment_uuid",
    "fileName": "demo-receipt-001.pdf",
    "mimeType": "application/pdf",
    "fileSize": 123456,
    "transactionReference": "DEMO-TRANSFER-001",
    "status": "uploaded",
    "uploadedAt": "2026-07-14T10:05:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="m44ft8"
paymentReceipt.uploaded
```

---

## 12.5. Descargar mi comprobante

### Endpoint

```http id="ijrc91"
GET /api/v1/me/payment-receipts/{receiptId}/download
```

### Permiso

```text id="zuuh5d"
paymentReceipts.download.own
```

### Validaciones

* Receipt pertenece a un pago propio.
* Receipt pertenece al tenant.
* Receipt tiene archivo.
* Usuario tiene relación vigente con la unidad.
* No exponer URL permanente.

### Response 200 — URL temporal

```json id="rb8kq9"
{
  "data": {
    "downloadUrl": "https://storage.example.com/signed-temporary-url",
    "expiresAt": "2026-07-14T10:15:00Z",
    "fileName": "demo-receipt-001.pdf",
    "mimeType": "application/pdf",
    "fileSize": 123456
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="l4xzz9"
paymentReceipt.downloaded
```

---

# 13. DTOs principales

## 13.1. PaymentResponseDto

```json id="venb5h"
{
  "id": "payment_uuid",
  "tenantId": "tenant_uuid",
  "propertyUnitId": "property_unit_uuid",
  "method": "bankTransfer",
  "amount": "100.00",
  "allocatedAmount": "50.00",
  "unallocatedAmount": "50.00",
  "currency": "USD",
  "paidAt": "2026-07-14T09:30:00Z",
  "reportedAt": "2026-07-14T10:00:00Z",
  "confirmedAt": "2026-07-14T11:00:00Z",
  "status": "partiallyAllocated",
  "transactionReference": "DEMO-TRANSFER-001",
  "externalReference": null,
  "createdAt": "2026-07-14T10:00:00Z",
  "updatedAt": "2026-07-14T11:30:00Z"
}
```

---

## 13.2. PaymentReceiptResponseDto

```json id="idb3lf"
{
  "id": "receipt_uuid",
  "paymentId": "payment_uuid",
  "fileName": "demo-receipt-001.pdf",
  "mimeType": "application/pdf",
  "fileSize": 123456,
  "receiptNumber": null,
  "transactionReference": "DEMO-TRANSFER-001",
  "status": "uploaded",
  "uploadedBy": "user_uuid",
  "uploadedAt": "2026-07-14T10:05:00Z",
  "reviewedBy": null,
  "reviewedAt": null,
  "rejectionReason": null
}
```

---

## 13.3. PaymentAllocationResponseDto

```json id="w0us13"
{
  "id": "allocation_uuid",
  "paymentId": "payment_uuid",
  "chargeId": "charge_uuid",
  "propertyUnitId": "property_unit_uuid",
  "amount": "50.00",
  "currency": "USD",
  "status": "active",
  "allocatedBy": "user_uuid",
  "allocatedAt": "2026-07-14T11:30:00Z",
  "reversedAt": null,
  "reversedBy": null,
  "reversalReason": null
}
```

---

## 13.4. PaymentReversalResponseDto

```json id="sg44s8"
{
  "id": "payment_reversal_uuid",
  "paymentId": "payment_uuid",
  "reason": "Pago registrado por error administrativo.",
  "reversedBy": "user_uuid",
  "reversedAt": "2026-07-14T12:00:00Z",
  "createdAt": "2026-07-14T12:00:00Z"
}
```

---

# 14. Validaciones generales

## 14.1. `tenantId`

El `tenantId` no debe recibirse desde el body en endpoints tenant-scoped.

Debe resolverse desde:

```text id="pjd3ia"
CurrentTenant
TenantGuard
Membership context
```

Si el cliente envía `tenantId`:

```text id="e1s7no"
422 VALIDATION_ERROR
```

---

## 14.2. IDs

Validar formato de:

```text id="tevryu"
paymentId
paymentReceiptId
paymentAllocationId
paymentReversalId
propertyUnitId
chargeId
```

---

## 14.3. Fechas

Reglas:

```text id="irgz13"
paidAt requerida
paidAt válida
paidAt no debe ser absurda o fuera de rango razonable
reportedAt generado por sistema
confirmedAt generado por sistema
rejectedAt generado por sistema
reversedAt generado por sistema
```

---

## 14.4. Montos

Reglas:

```text id="dwa61n"
amount decimal string
amount > 0
currency = USD en MVP
máximo 2 decimales
sin redondeo silencioso
```

---

## 14.5. Métodos de pago

Valores válidos:

```text id="zya6x9"
cash
bankTransfer
deposit
other
```

Reservados:

```text id="g1097b"
check
online
```

---

## 14.6. Comprobantes

Archivo permitido:

```text id="pveqrw"
application/pdf
image/jpeg
image/png
image/webp opcional
```

Tamaño máximo recomendado:

```text id="bktk7b"
5 MB
```

---

## 14.7. Asignaciones

Reglas:

```text id="m0778g"
payment status debe ser confirmed o partiallyAllocated
charge debe pertenecer al tenant
charge debe pertenecer a la misma unidad
amount de allocation debe ser positivo
suma de allocations no excede Payment.unallocatedAmount
allocation no excede saldo pendiente del cargo
```

---

# 15. Catálogo de errores

| Código                                      |    HTTP | Descripción                                  |
| ------------------------------------------- | ------: | -------------------------------------------- |
| `UNAUTHORIZED`                              |     401 | No autenticado                               |
| `FORBIDDEN`                                 |     403 | Sin permiso                                  |
| `TENANT_NOT_ACTIVE`                         |     403 | Tenant no activo                             |
| `MEMBERSHIP_NOT_ACTIVE`                     |     403 | Membership no activa                         |
| `PAYMENT_NOT_FOUND`                         |     404 | Pago no encontrado                           |
| `PAYMENT_ALREADY_CONFIRMED`                 |     409 | Pago ya confirmado                           |
| `PAYMENT_ALREADY_REJECTED`                  |     409 | Pago ya rechazado                            |
| `PAYMENT_ALREADY_REVERSED`                  |     409 | Pago ya reversado                            |
| `PAYMENT_NOT_CONFIRMABLE`                   |     409 | Pago no confirmable                          |
| `PAYMENT_NOT_REJECTABLE`                    |     409 | Pago no rechazable                           |
| `PAYMENT_NOT_ALLOCATABLE`                   |     409 | Pago no asignable                            |
| `PAYMENT_NOT_REVERSIBLE`                    |     409 | Pago no reversible                           |
| `PAYMENT_RECEIPT_REQUIRED`                  |     422 | Comprobante o referencia requerido           |
| `PAYMENT_RECEIPT_NOT_FOUND`                 |     404 | Comprobante no encontrado                    |
| `PAYMENT_RECEIPT_NOT_DOWNLOADABLE`          |     409 | Comprobante no descargable                   |
| `PAYMENT_RECEIPT_NOT_REVIEWABLE`            |     409 | Comprobante no revisable                     |
| `PAYMENT_RECEIPT_REJECTED`                  |     409 | Comprobante rechazado                        |
| `PAYMENT_ALLOCATION_NOT_FOUND`              |     404 | Asignación no encontrada                     |
| `PAYMENT_ALLOCATION_ALREADY_REVERSED`       |     409 | Asignación ya reversada                      |
| `PAYMENT_ALLOCATION_AMOUNT_EXCEEDS_PAYMENT` |     422 | Asignación excede monto disponible           |
| `PAYMENT_ALLOCATION_AMOUNT_EXCEEDS_CHARGE`  |     422 | Asignación excede saldo del cargo            |
| `PAYMENT_AND_CHARGE_UNIT_MISMATCH`          |     422 | Pago y cargo no pertenecen a la misma unidad |
| `PAYMENT_REVERSAL_NOT_FOUND`                |     404 | Reverso no encontrado                        |
| `PAYMENT_REVERSAL_ALREADY_EXISTS`           |     409 | Ya existe reverso del pago                   |
| `PROPERTY_UNIT_NOT_FOUND`                   |     404 | Unidad no encontrada                         |
| `PROPERTY_UNIT_NOT_ACTIVE`                  |     409 | Unidad no activa                             |
| `CHARGE_NOT_FOUND`                          |     404 | Cargo no encontrado                          |
| `CHARGE_NOT_PAYABLE`                        |     409 | Cargo no pagable                             |
| `CHARGE_ALREADY_PAID`                       |     409 | Cargo ya pagado                              |
| `MONEY_AMOUNT_INVALID`                      |     422 | Monto inválido                               |
| `CURRENCY_NOT_SUPPORTED`                    |     422 | Moneda no soportada                          |
| `PAYMENT_METHOD_NOT_SUPPORTED`              |     422 | Método no soportado                          |
| `IDEMPOTENCY_CONFLICT`                      |     409 | Conflicto de idempotencia                    |
| `FILE_TYPE_NOT_ALLOWED`                     |     422 | Tipo de archivo no permitido                 |
| `FILE_TOO_LARGE`                            |     422 | Archivo demasiado grande                     |
| `FILE_NOT_FOUND`                            |     404 | Archivo no encontrado                        |
| `OWN_PAYMENT_NOT_FOUND`                     |     404 | Pago propio no encontrado                    |
| `OWN_PERSON_NOT_LINKED`                     |     403 | Usuario sin persona vinculada                |
| `CROSS_TENANT_REFERENCE`                    | 403/422 | Recurso de otro tenant                       |
| `VALIDATION_ERROR`                          |     422 | Error de validación                          |
| `RATE_LIMITED`                              |     429 | Rate limit                                   |
| `INTERNAL_ERROR`                            |     500 | Error interno                                |

---

# 16. Ejemplos de errores

## 16.1. Pago no asignable

```json id="jbxvpc"
{
  "error": {
    "code": "PAYMENT_NOT_ALLOCATABLE",
    "message": "Only confirmed or partially allocated payments can be allocated to charges.",
    "details": {
      "paymentId": "payment_uuid"
    },
    "traceId": "req_123456"
  }
}
```

---

## 16.2. Asignación excede pago

```json id="aqc6ef"
{
  "error": {
    "code": "PAYMENT_ALLOCATION_AMOUNT_EXCEEDS_PAYMENT",
    "message": "The allocation amount exceeds the available payment amount.",
    "details": {
      "paymentId": "payment_uuid",
      "availableAmount": "50.00"
    },
    "traceId": "req_123456"
  }
}
```

---

## 16.3. Asignación excede cargo

```json id="n2e7o4"
{
  "error": {
    "code": "PAYMENT_ALLOCATION_AMOUNT_EXCEEDS_CHARGE",
    "message": "The allocation amount exceeds the outstanding charge amount.",
    "details": {
      "chargeId": "charge_uuid",
      "outstandingAmount": "25.00"
    },
    "traceId": "req_123456"
  }
}
```

---

## 16.4. Pago y cargo de unidades distintas

```json id="s03n9b"
{
  "error": {
    "code": "PAYMENT_AND_CHARGE_UNIT_MISMATCH",
    "message": "In MVP, a payment can only be allocated to charges from the same property unit.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

## 16.5. Comprobante requerido

```json id="ruxqu2"
{
  "error": {
    "code": "PAYMENT_RECEIPT_REQUIRED",
    "message": "This payment method requires a receipt or transaction reference.",
    "details": {
      "method": "bankTransfer"
    },
    "traceId": "req_123456"
  }
}
```

---

## 16.6. Referencia cross-tenant

```json id="rizzrw"
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

# 17. Auditoría por endpoint

| Endpoint                                        | Auditoría                                            |
| ----------------------------------------------- | ---------------------------------------------------- |
| `POST /tenant/payments`                         | `payment.created`                                    |
| `POST /tenant/payments/{id}/confirm`            | `payment.confirmed`                                  |
| `POST /tenant/payments/{id}/reject`             | `payment.rejected`                                   |
| `POST /tenant/payments/{id}/allocate`           | `payment.allocated`, `paymentAllocation.created`     |
| `POST /tenant/payments/{id}/auto-allocate`      | `payment.autoAllocated`, `paymentAllocation.created` |
| `POST /tenant/payments/{id}/reverse`            | `payment.reversed`, `paymentAllocation.reversed`     |
| `POST /tenant/payments/{id}/receipts`           | `paymentReceipt.uploaded`                            |
| `GET /tenant/payment-receipts/{id}/download`    | `paymentReceipt.downloaded`                          |
| `POST /tenant/payment-receipts/{id}/accept`     | `paymentReceipt.accepted`                            |
| `POST /tenant/payment-receipts/{id}/reject`     | `paymentReceipt.rejected`                            |
| `POST /tenant/payment-allocations/{id}/reverse` | `paymentAllocation.reversed`                         |
| `POST /me/payments`                             | `payment.reported`                                   |
| `POST /me/payments/{id}/receipts`               | `paymentReceipt.uploaded`                            |
| `GET /me/payment-receipts/{id}/download`        | `paymentReceipt.downloaded`                          |

---

# 18. Eventos por endpoint

| Endpoint                                        | Evento                                             |
| ----------------------------------------------- | -------------------------------------------------- |
| `POST /tenant/payments`                         | `PaymentCreated`                                   |
| `POST /tenant/payments/{id}/confirm`            | `PaymentConfirmed`                                 |
| `POST /tenant/payments/{id}/reject`             | `PaymentRejected`                                  |
| `POST /tenant/payments/{id}/allocate`           | `PaymentAllocated`, `PaymentAllocationCreated`     |
| `POST /tenant/payments/{id}/auto-allocate`      | `PaymentAutoAllocated`, `PaymentAllocationCreated` |
| `POST /tenant/payments/{id}/reverse`            | `PaymentReversed`, `PaymentAllocationReversed`     |
| `POST /tenant/payments/{id}/receipts`           | `PaymentReceiptUploaded`                           |
| `POST /tenant/payment-receipts/{id}/accept`     | `PaymentReceiptAccepted`                           |
| `POST /tenant/payment-receipts/{id}/reject`     | `PaymentReceiptRejected`                           |
| `POST /tenant/payment-allocations/{id}/reverse` | `PaymentAllocationReversed`                        |
| `POST /me/payments`                             | `PaymentReported`                                  |
| `POST /me/payments/{id}/receipts`               | `PaymentReceiptUploaded`                           |

---

# 19. Observabilidad

Todos los endpoints deben registrar:

```text id="ti80f0"
traceId
method
path
status
latencyMs
actorUserId
tenantId
resourceType
resourceId si aplica
paymentId si aplica
propertyUnitId si aplica
chargeId si aplica
receiptId si aplica
allocationId si aplica
errorCode si aplica
```

No registrar:

```text id="ku59d4"
Authorization header
access token
payload completo
contenido de comprobantes
datos bancarios completos
datos personales de propietarios/residentes
stack trace en producción
```

Métricas sugeridas:

```text id="tb837h"
payments_created_total
payments_reported_total
payments_confirmed_total
payments_rejected_total
payments_reversed_total
payment_allocations_created_total
payment_allocations_reversed_total
payment_receipts_uploaded_total
payment_receipts_rejected_total
payment_authorization_denied_total
own_payment_access_denied_total
payment_duplicate_attempts_total
payment_receipt_downloads_total
```

---

# 20. Rate limiting

Rate limiting recomendado para:

```text id="lf8spq"
POST /api/v1/tenant/payments
POST /api/v1/tenant/payments/{paymentId}/confirm
POST /api/v1/tenant/payments/{paymentId}/reject
POST /api/v1/tenant/payments/{paymentId}/allocate
POST /api/v1/tenant/payments/{paymentId}/auto-allocate
POST /api/v1/tenant/payments/{paymentId}/reverse
POST /api/v1/tenant/payments/{paymentId}/receipts
GET /api/v1/tenant/payment-receipts/{receiptId}/download
POST /api/v1/me/payments
POST /api/v1/me/payments/{paymentId}/receipts
GET /api/v1/me/payment-receipts/{receiptId}/download
```

Objetivos:

* evitar pagos duplicados por abuso;
* proteger comprobantes;
* reducir intentos de enumeración;
* proteger operaciones financieras críticas;
* limitar scraping de pagos propios.

---

# 21. CORS

Endpoints financieros autenticados no deben usar CORS abierto en producción.

Prohibido:

```text id="x1mh58"
Access-Control-Allow-Origin: *
```

Permitir solo orígenes oficiales de RESIDENT Core.

---

# 22. OpenAPI

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
* file upload metadata cuando aplique.

Tags sugeridos:

```text id="ixj8r0"
Payments
Payment Receipts
Payment Allocations
Own Payments
```

---

## 23. Extensiones OpenAPI sugeridas

Para endpoints administrativos financieros:

```yaml id="wfghj9"
x-required-permission: payments.create
x-audit-event: payment.created
x-tenant-scope: tenant
x-financial-operation: true
```

Para asignaciones:

```yaml id="xresr1"
x-required-permission: payments.allocate
x-audit-event: payment.allocated
x-tenant-scope: tenant
x-financial-operation: true
```

Para comprobantes:

```yaml id="egf6gx"
x-required-permission: paymentReceipts.download
x-audit-event: paymentReceipt.downloaded
x-tenant-scope: tenant
x-private-file-access: true
```

Para endpoints propios:

```yaml id="uo78oi"
x-required-permission: payments.read.own
x-own-resource-policy: true
x-tenant-scope: tenant
```

Para creación idempotente:

```yaml id="xysuwf"
x-idempotent-operation: true
x-idempotency-header: Idempotency-Key
```

---

# 24. Pruebas de contrato requeridas

## 24.1. Payments API

Probar:

* listar;
* crear;
* consultar;
* confirmar;
* rechazar;
* asignar;
* autoasignar;
* reversar;
* idempotencia;
* estado inválido;
* monto inválido;
* unidad cross-tenant;
* sin permiso.

---

## 24.2. Payment Receipts API

Probar:

* listar comprobantes;
* subir comprobante;
* consultar comprobante;
* descargar comprobante;
* aceptar comprobante;
* rechazar comprobante;
* archivo inválido;
* archivo grande;
* receipt cross-tenant;
* comprobante ajeno.

---

## 24.3. Payment Allocations API

Probar:

* listar allocations;
* consultar allocation;
* reversar allocation;
* monto excede pago;
* monto excede cargo;
* cargo de otro tenant;
* cargo de otra unidad;
* allocation ya reversada.

---

## 24.4. Own Payments API

Probar:

* listar mis pagos;
* reportar pago propio;
* consultar mi pago;
* subir comprobante propio;
* descargar comprobante propio;
* usuario sin Person;
* unidad ajena;
* pago ajeno;
* receipt ajeno;
* sin permiso `.own`.

---

# 25. Matriz resumen de endpoints

| Método | Ruta                                              | Auth | Permiso                        | Auditoría                    |
| ------ | ------------------------------------------------- | ---: | ------------------------------ | ---------------------------- |
| GET    | `/api/v1/tenant/payments`                         |   Sí | `payments.read`                | No obligatoria               |
| POST   | `/api/v1/tenant/payments`                         |   Sí | `payments.create`              | `payment.created`            |
| GET    | `/api/v1/tenant/payments/{id}`                    |   Sí | `payments.read`                | No obligatoria               |
| POST   | `/api/v1/tenant/payments/{id}/confirm`            |   Sí | `payments.confirm`             | `payment.confirmed`          |
| POST   | `/api/v1/tenant/payments/{id}/reject`             |   Sí | `payments.reject`              | `payment.rejected`           |
| POST   | `/api/v1/tenant/payments/{id}/allocate`           |   Sí | `payments.allocate`            | `payment.allocated`          |
| POST   | `/api/v1/tenant/payments/{id}/auto-allocate`      |   Sí | `payments.allocate`            | `payment.autoAllocated`      |
| POST   | `/api/v1/tenant/payments/{id}/reverse`            |   Sí | `payments.reverse`             | `payment.reversed`           |
| GET    | `/api/v1/tenant/payments/{id}/receipts`           |   Sí | `paymentReceipts.read`         | No obligatoria               |
| POST   | `/api/v1/tenant/payments/{id}/receipts`           |   Sí | `paymentReceipts.create`       | `paymentReceipt.uploaded`    |
| GET    | `/api/v1/tenant/payment-receipts/{id}`            |   Sí | `paymentReceipts.read`         | No obligatoria               |
| GET    | `/api/v1/tenant/payment-receipts/{id}/download`   |   Sí | `paymentReceipts.download`     | `paymentReceipt.downloaded`  |
| POST   | `/api/v1/tenant/payment-receipts/{id}/accept`     |   Sí | `paymentReceipts.review`       | `paymentReceipt.accepted`    |
| POST   | `/api/v1/tenant/payment-receipts/{id}/reject`     |   Sí | `paymentReceipts.reject`       | `paymentReceipt.rejected`    |
| GET    | `/api/v1/tenant/payments/{id}/allocations`        |   Sí | `payments.read`                | No obligatoria               |
| GET    | `/api/v1/tenant/payment-allocations/{id}`         |   Sí | `payments.read`                | No obligatoria               |
| POST   | `/api/v1/tenant/payment-allocations/{id}/reverse` |   Sí | `payments.allocate`            | `paymentAllocation.reversed` |
| GET    | `/api/v1/me/payments`                             |   Sí | `payments.read.own`            | No obligatoria               |
| POST   | `/api/v1/me/payments`                             |   Sí | `payments.create.own`          | `payment.reported`           |
| GET    | `/api/v1/me/payments/{id}`                        |   Sí | `payments.read.own`            | No obligatoria               |
| POST   | `/api/v1/me/payments/{id}/receipts`               |   Sí | `payments.receipts.upload.own` | `paymentReceipt.uploaded`    |
| GET    | `/api/v1/me/payment-receipts/{id}/download`       |   Sí | `paymentReceipts.download.own` | `paymentReceipt.downloaded`  |

---

# 26. Casos borde del contrato

| Caso                                              | Resultado esperado                           |
| ------------------------------------------------- | -------------------------------------------- |
| Crear pago con monto negativo                     | 422                                          |
| Crear pago sin unidad                             | 422                                          |
| Crear pago con unidad de otro tenant              | 403/422                                      |
| Crear pago con moneda no USD                      | 422                                          |
| Crear pago con método no soportado                | 422                                          |
| Crear pago con `tenantId` en body                 | 422                                          |
| Crear transferencia sin comprobante ni referencia | 422                                          |
| Repetir `Idempotency-Key` con mismo payload       | retorna pago existente                       |
| Repetir `Idempotency-Key` con payload distinto    | 409                                          |
| Confirmar pago ya confirmado                      | 409                                          |
| Confirmar pago rechazado                          | 409                                          |
| Rechazar pago confirmado                          | 409                                          |
| Rechazar pago sin motivo                          | 422                                          |
| Asignar pago pendingValidation                    | 409                                          |
| Asignar pago rejected                             | 409                                          |
| Asignar pago reversed                             | 409                                          |
| Asignar más del monto disponible                  | 422                                          |
| Asignar más del saldo del cargo                   | 422                                          |
| Asignar a cargo de otro tenant                    | 403/422                                      |
| Asignar a cargo de otra unidad                    | 422                                          |
| Autoasignar sin cargos pendientes                 | 200 con allocations vacías o 409 documentado |
| Reversar pago ya reversado                        | 409                                          |
| Reversar allocation ya reversada                  | 409                                          |
| Descargar comprobante sin permiso                 | 403                                          |
| Descargar comprobante ajeno                       | 404 recomendado                              |
| Subir archivo no permitido                        | 422                                          |
| Subir archivo demasiado grande                    | 422                                          |
| Usuario sin Person reporta pago propio            | 403                                          |
| Usuario reporta pago de unidad ajena              | 404/403                                      |
| Tenant suspendido registra pago                   | 403                                          |
| Intentar borrar pago físicamente                  | endpoint no existe                           |

---

# 27. Decisión final del contrato API

El módulo `005-payments` expondrá endpoints administrativos bajo:

```text id="zhda7g"
/api/v1/tenant/*
```

y endpoints propios bajo:

```text id="iyvo4s"
/api/v1/me/*
```

Los endpoints administrativos permitirán a TenantAdmin, Treasurer y roles autorizados registrar, validar, asignar y reversar pagos.

Los endpoints propios permitirán a propietarios o residentes autorizados reportar pagos, subir comprobantes y consultar únicamente pagos de unidades propias.

La autorización no dependerá solo del rol, sino también de:

```text id="wiwpg5"
tenant activo
membership activa
permiso financiero requerido
tenantId del recurso
unidad asociada al pago
cargo asociado a la asignación
relación UserProfile → Person → PropertyUnit para .own
```

Este contrato prepara a RESIDENT Core para `006-account-statements`, asegurando que los pagos existan con precisión decimal, comprobantes protegidos, idempotencia, trazabilidad financiera, asignación correcta a cargos y auditoría reforzada.
