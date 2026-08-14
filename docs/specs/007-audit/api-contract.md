# API Contract — Spec 007 Audit, Traceability and Compliance Events

> **Frontera de Sprint 2:** no existe API pública de Audit. Los endpoints de consulta,
> detalle, modificación, eliminación y exportación de este documento están diferidos.
> La única superficie autorizada es el puerto interno de escritura definido en
> `docs/changes/GAP-S2-007-AUDIT-BASE-SEMANTICS-2026-08-13.md`.

## 1. Información del documento

| Campo           | Valor                                                                                                                   |
| --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                           |
| Spec ID         | 007                                                                                                                     |
| Módulo          | Audit                                                                                                                   |
| Documento       | API Contract                                                                                                            |
| Ruta            | `docs/specs/007-audit/api-contract.md`                                                                                  |
| Versión         | 0.1                                                                                                                     |
| Estado          | needs-review                                                                                                            |
| Fecha           | 2026-07-14                                                                                                              |
| Documento base  | `docs/specs/007-audit/spec.md`                                                                                          |
| Plan técnico    | `docs/specs/007-audit/plan.md`                                                                                          |
| Modelo de datos | `docs/specs/007-audit/data-model.md`                                                                                    |
| API Style       | REST                                                                                                                    |
| API Version     | `/api/v1`                                                                                                               |
| Formato         | JSON / CSV para exportación                                                                                             |
| Autorización    | Tenant-aware RBAC + permisos de auditoría + permisos platform                                                           |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements` |

---

## 2. Propósito

Este documento define el contrato API del módulo `007-audit`.

El objetivo es establecer:

* endpoints de consulta de auditoría por tenant;
* endpoints de consulta de auditoría platform;
* endpoints de consulta de auditoría por recurso;
* endpoints de exportación;
* permisos requeridos;
* filtros;
* paginación;
* ordenamiento;
* respuestas estándar;
* errores;
* DTOs;
* reglas de visibilidad por categoría;
* reglas de sanitización;
* reglas de exportación;
* auditoría del propio módulo;
* OpenAPI esperado.

Regla central:

```text id="ud06do"
La API de auditoría debe permitir consultar evidencia funcional y de seguridad sin romper aislamiento multitenant, sin exponer secretos y sin permitir modificación ordinaria de eventos.
```

---

## 3. Principios del contrato API

### 3.1. Solo lectura y exportación controlada

La API pública del módulo Audit permite:

```text id="yxmpzg"
consultar
filtrar
ver detalle
exportar bajo permiso
```

No permite:

```text id="c853vz"
crear eventos manualmente desde cliente externo
actualizar audit logs
eliminar audit logs
truncar auditoría
modificar oldValue/newValue
modificar metadata
```

La escritura de auditoría se realiza internamente mediante:

```text id="fyvo6h"
AuditWriterPort
```

---

### 3.2. Tenant-scoped por defecto

Todo endpoint `/api/v1/tenant/*` consulta únicamente eventos del tenant activo.

Regla:

```text id="f771fs"
auditLog.tenantId == currentTenant.id
```

---

### 3.3. Platform audit separado

Todo endpoint `/api/v1/platform/*` requiere permisos platform explícitos.

Regla:

```text id="ykbd87"
Un usuario tenant ordinario no puede consultar auditoría platform.
```

---

### 3.4. Auditoría por recurso

La consulta por recurso debe validar que el recurso pertenece al tenant activo.

Regla:

```text id="lxu2m9"
resource.tenantId == currentTenant.id
```

cuando el recurso sea resoluble.

---

### 3.5. Exportación restringida

Toda exportación de auditoría requiere permiso explícito y debe auditarse.

Evento auditable:

```text id="ly3cl3"
audit.exported
```

Para platform:

```text id="auhkrl"
audit.platformExported
```

---

### 3.6. Sanitización de salida

La API nunca debe devolver:

```text id="et0atc"
tokens
passwords
authorization headers
cookies completas
secretos
payloads completos
comprobantes completos
exports completos dentro de metadata
stack traces completos
```

---

### 3.7. Visibilidad por categoría

No todo usuario con `audit.read` puede ver todo.

Categorías sensibles pueden requerir permisos específicos:

```text id="btkmfo"
audit.readFinancial
audit.readSecurity
audit.readAccess
audit.readPersonalData
audit.platform.readSensitive
```

---

## 4. Respuesta estándar

### 4.1. Respuesta individual

```json id="jddvej"
{
  "data": {},
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

### 4.2. Respuesta paginada

```json id="wzq8ey"
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

```json id="gqk5z3"
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

## 5. Headers

### 5.1. Request headers

| Header             |         Requerido | Descripción                     |
| ------------------ | ----------------: | ------------------------------- |
| `Authorization`    |                Sí | Bearer token                    |
| `Accept`           |       Recomendado | `application/json` o `text/csv` |
| `Content-Type`     | Sí en POST futuro | `application/json`              |
| `X-Request-Id`     |          Opcional | ID del request                  |
| `X-Correlation-Id` |          Opcional | Correlación entre operaciones   |

---

### 5.2. Response headers

| Header             | Descripción                     |
| ------------------ | ------------------------------- |
| `Content-Type`     | `application/json` o `text/csv` |
| `X-Request-Id`     | ID del request                  |
| `X-Correlation-Id` | ID de correlación si aplica     |

---

## 6. Estados HTTP

| Código | Uso                               |
| -----: | --------------------------------- |
|    200 | Consulta o exportación exitosa    |
|    400 | Request mal formado               |
|    401 | No autenticado                    |
|    403 | Sin permiso                       |
|    404 | Audit log o recurso no encontrado |
|    409 | Conflicto de política             |
|    422 | Validación semántica fallida      |
|    429 | Rate limit                        |
|    500 | Error interno                     |

---

## 7. Paginación

Parámetros:

| Query param |   Tipo | Default | Máximo |
| ----------- | -----: | ------: | -----: |
| `page`      | number |       1 |      — |
| `pageSize`  | number |      20 |    100 |

Ejemplo:

```text id="egaitn"
GET /api/v1/tenant/audit-logs?page=1&pageSize=20
```

---

## 8. Ordenamiento

Parámetros:

| Query param | Tipo   | Default      |
| ----------- | ------ | ------------ |
| `sortBy`    | string | `occurredAt` |
| `sortOrder` | string | `desc`       |

Valores permitidos para `sortBy`:

```text id="yjej9x"
occurredAt
createdAt
action
category
severity
outcome
actorType
resourceType
```

Valores permitidos para `sortOrder`:

```text id="z93ofy"
asc
desc
```

No permitir ordenamiento por campos arbitrarios.

---

# 9. Tenant Audit API

Ruta base:

```text id="trhluj"
/api/v1/tenant/audit-logs
```

Guards requeridos:

```text id="dqgv69"
AuthGuard
TenantGuard
TenantPermissionGuard
AuditCategoryGuard opcional
```

---

## 9.1. Listar audit logs del tenant

### Endpoint

```http id="dfibul"
GET /api/v1/tenant/audit-logs
```

### Permiso base

```text id="qigwqx"
audit.read
```

### Permisos adicionales por categoría

| Categoría           | Permiso adicional        |
| ------------------- | ------------------------ |
| `financial`         | `audit.readFinancial`    |
| `payments`          | `audit.readFinancial`    |
| `accountStatements` | `audit.readFinancial`    |
| `access`            | `audit.readAccess`       |
| `security`          | `audit.readSecurity`     |
| `personalData`      | `audit.readPersonalData` |

### Query params

| Nombre          | Tipo     | Descripción                                                 |
| --------------- | -------- | ----------------------------------------------------------- |
| `actorUserId`   | string   | Filtrar por usuario actor                                   |
| `actorType`     | string   | user/system/integration/job/webhook/platformSupport/unknown |
| `action`        | string   | Acción auditable                                            |
| `category`      | string   | Categoría                                                   |
| `severity`      | string   | Severidad                                                   |
| `outcome`       | string   | Resultado                                                   |
| `resourceType`  | string   | Tipo de recurso                                             |
| `resourceId`    | string   | ID del recurso                                              |
| `dateFrom`      | datetime | Fecha desde                                                 |
| `dateTo`        | datetime | Fecha hasta                                                 |
| `traceId`       | string   | Trace ID                                                    |
| `correlationId` | string   | Correlation ID                                              |
| `requestId`     | string   | Request ID                                                  |
| `q`             | string   | Búsqueda textual limitada                                   |
| `page`          | number   | Página                                                      |
| `pageSize`      | number   | Tamaño                                                      |
| `sortBy`        | string   | Campo permitido                                             |
| `sortOrder`     | string   | asc/desc                                                    |

### Reglas

* Solo devuelve eventos del tenant activo.
* Filtra categorías según permisos.
* No devuelve secretos.
* No devuelve payloads completos.
* `pageSize` máximo 100.
* Si el usuario no tiene permiso para una categoría, esa categoría se oculta o se rechaza según política.
* Para `category=financial` sin `audit.readFinancial`, devolver `403`.

### Response 200

```json id="dkkjej"
{
  "data": [
    {
      "id": "audit_log_uuid",
      "tenantId": "tenant_uuid",
      "actorType": "user",
      "actorUserId": "user_uuid",
      "actorDisplayName": "Tesorería Demo",
      "action": "payment.confirmed",
      "category": "payments",
      "severity": "notice",
      "outcome": "success",
      "resourceType": "payment",
      "resourceId": "payment_uuid",
      "resourceDisplay": "Pago #PAY-2026-0001",
      "reason": null,
      "traceId": "req_123456",
      "correlationId": "corr_123456",
      "occurredAt": "2026-07-14T10:00:00Z",
      "createdAt": "2026-07-14T10:00:01Z"
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

## 9.2. Consultar detalle de audit log del tenant

### Endpoint

```http id="d64m8e"
GET /api/v1/tenant/audit-logs/{auditLogId}
```

### Permiso base

```text id="sd3oyu"
audit.read
```

### Validaciones

* `auditLogId` UUID válido.
* AuditLog existe.
* `auditLog.tenantId == currentTenant.id`.
* Usuario tiene permiso para la categoría.
* Campos sensibles se filtran según permisos.

### Response 200

```json id="bkq0an"
{
  "data": {
    "id": "audit_log_uuid",
    "tenantId": "tenant_uuid",
    "actorType": "user",
    "actorUserId": "user_uuid",
    "actorDisplayName": "Tesorería Demo",
    "actorMembershipId": "membership_uuid",
    "action": "payment.confirmed",
    "category": "payments",
    "severity": "notice",
    "outcome": "success",
    "resourceType": "payment",
    "resourceId": "payment_uuid",
    "resourceDisplay": "Pago #PAY-2026-0001",
    "oldValue": {
      "status": "pendingValidation"
    },
    "newValue": {
      "status": "confirmed"
    },
    "metadata": {
      "amount": "100.00",
      "currency": "USD",
      "method": "bankTransfer"
    },
    "reason": null,
    "ipAddress": "192.0.2.10",
    "userAgent": "Mozilla/5.0",
    "requestId": "req_123456",
    "correlationId": "corr_123456",
    "causationId": null,
    "traceId": "req_123456",
    "sourceModule": "payments",
    "sourceVersion": "0.1",
    "occurredAt": "2026-07-14T10:00:00Z",
    "createdAt": "2026-07-14T10:00:01Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Response 404

```json id="h2oqny"
{
  "error": {
    "code": "AUDIT_LOG_NOT_FOUND",
    "message": "Audit log not found.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

## 9.3. Exportar audit logs del tenant

### Endpoint

```http id="p3kbdu"
GET /api/v1/tenant/audit-logs/export
```

### Permiso

```text id="q2t7af"
audit.export
```

### Permisos adicionales

La exportación respeta las categorías visibles del usuario.

Ejemplo:

```text id="zwxko6"
audit.export + audit.readFinancial permite exportar eventos financieros.
audit.export sin audit.readFinancial no debe exportar eventos financial/payments/accountStatements.
```

### Query params

| Nombre          | Tipo     | Default | Descripción    |
| --------------- | -------- | ------- | -------------- |
| `format`        | string   | `json`  | `json` o `csv` |
| `actorUserId`   | string   | —       | Actor          |
| `actorType`     | string   | —       | Tipo actor     |
| `action`        | string   | —       | Acción         |
| `category`      | string   | —       | Categoría      |
| `severity`      | string   | —       | Severidad      |
| `outcome`       | string   | —       | Resultado      |
| `resourceType`  | string   | —       | Tipo recurso   |
| `resourceId`    | string   | —       | Recurso        |
| `dateFrom`      | datetime | —       | Desde          |
| `dateTo`        | datetime | —       | Hasta          |
| `traceId`       | string   | —       | Trace          |
| `correlationId` | string   | —       | Correlación    |
| `requestId`     | string   | —       | Request        |

### Reglas

* Requiere filtros o límite máximo de filas.
* Formatos permitidos: `json`, `csv`.
* No exporta secretos.
* No exporta categorías no permitidas.
* CSV debe proteger contra fórmula injection.
* Toda exportación genera `audit.exported`.
* No loggear contenido completo del export.

### Response 200 — JSON

```json id="nvxtjs"
{
  "data": {
    "format": "json",
    "rowCount": 2,
    "generatedAt": "2026-07-14T10:30:00Z",
    "items": [
      {
        "id": "audit_log_uuid",
        "tenantId": "tenant_uuid",
        "actorType": "user",
        "actorUserId": "user_uuid",
        "action": "payment.confirmed",
        "category": "payments",
        "severity": "notice",
        "outcome": "success",
        "resourceType": "payment",
        "resourceId": "payment_uuid",
        "traceId": "req_123456",
        "occurredAt": "2026-07-14T10:00:00Z"
      }
    ]
  },
  "meta": {
    "traceId": "req_789"
  }
}
```

### Response 200 — CSV

```text id="o7i4j4"
Content-Type: text/csv
```

### Auditoría generada

```text id="zf2cex"
audit.exported
```

---

# 10. Resource Audit API

Ruta base:

```text id="a1ff4m"
/api/v1/tenant/resources/{resourceType}/{resourceId}/audit-logs
```

Guards:

```text id="jz9fs8"
AuthGuard
TenantGuard
TenantPermissionGuard
```

---

## 10.1. Consultar auditoría de un recurso

### Endpoint

```http id="a6k5ua"
GET /api/v1/tenant/resources/{resourceType}/{resourceId}/audit-logs
```

### Permiso base

```text id="y5rb4x"
audit.read
```

### Path params

| Nombre         | Tipo   | Descripción     |
| -------------- | ------ | --------------- |
| `resourceType` | string | Tipo de recurso |
| `resourceId`   | string | ID del recurso  |

### Query params

| Nombre     | Tipo     | Descripción |
| ---------- | -------- | ----------- |
| `action`   | string   | Acción      |
| `category` | string   | Categoría   |
| `outcome`  | string   | Resultado   |
| `dateFrom` | datetime | Desde       |
| `dateTo`   | datetime | Hasta       |
| `page`     | number   | Página      |
| `pageSize` | number   | Tamaño      |

### Validaciones

* `resourceType` permitido.
* `resourceId` válido.
* El recurso pertenece al tenant.
* Usuario tiene permiso de auditoría.
* Usuario tiene permiso de categoría si aplica.
* No devolver eventos de otro tenant.

### Response 200

```json id="pm2gal"
{
  "data": [
    {
      "id": "audit_log_uuid",
      "tenantId": "tenant_uuid",
      "actorType": "user",
      "actorUserId": "user_uuid",
      "action": "payment.confirmed",
      "category": "payments",
      "severity": "notice",
      "outcome": "success",
      "resourceType": "payment",
      "resourceId": "payment_uuid",
      "resourceDisplay": "Pago #PAY-2026-0001",
      "traceId": "req_123456",
      "occurredAt": "2026-07-14T10:00:00Z",
      "createdAt": "2026-07-14T10:00:01Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1,
    "traceId": "req_789"
  }
}
```

### Errores esperados

* `RESOURCE_TYPE_NOT_SUPPORTED`
* `RESOURCE_NOT_FOUND`
* `AUDIT_QUERY_FORBIDDEN`
* `CROSS_TENANT_REFERENCE`

---

# 11. Platform Audit API

Ruta base:

```text id="g9i6ly"
/api/v1/platform/audit-logs
```

Guards:

```text id="tsg1r2"
AuthGuard
PlatformPermissionGuard
```

---

## 11.1. Listar audit logs platform

### Endpoint

```http id="xofxr1"
GET /api/v1/platform/audit-logs
```

### Permiso

```text id="o8yu4w"
audit.platform.read
```

### Permiso adicional para eventos sensibles de tenants

```text id="e31x34"
audit.platform.readSensitive
```

### Query params

| Nombre                  | Tipo     | Descripción                |
| ----------------------- | -------- | -------------------------- |
| `tenantId`              | string   | Filtrar por tenant         |
| `tenantSlug`            | string   | Filtrar por slug           |
| `includePlatformEvents` | boolean  | Incluir eventos sin tenant |
| `actorUserId`           | string   | Actor                      |
| `actorType`             | string   | Tipo actor                 |
| `action`                | string   | Acción                     |
| `category`              | string   | Categoría                  |
| `severity`              | string   | Severidad                  |
| `outcome`               | string   | Resultado                  |
| `resourceType`          | string   | Tipo recurso               |
| `resourceId`            | string   | Recurso                    |
| `dateFrom`              | datetime | Desde                      |
| `dateTo`                | datetime | Hasta                      |
| `traceId`               | string   | Trace                      |
| `correlationId`         | string   | Correlación                |
| `requestId`             | string   | Request                    |
| `page`                  | number   | Página                     |
| `pageSize`              | number   | Tamaño                     |
| `sortBy`                | string   | Campo                      |
| `sortOrder`             | string   | asc/desc                   |

### Reglas

* Sin `audit.platform.readSensitive`, no devolver detalles sensibles de tenants.
* Platform events con `tenantId = null` se permiten si `includePlatformEvents = true`.
* Consultas amplias pueden requerir filtros obligatorios.
* Toda consulta platform sensible puede auditarse como `audit.platformQueried`.

### Response 200

```json id="s65hfv"
{
  "data": [
    {
      "id": "audit_log_uuid",
      "tenantId": null,
      "actorType": "platformSupport",
      "actorUserId": "platform_user_uuid",
      "action": "tenant.suspended",
      "category": "platform",
      "severity": "warning",
      "outcome": "success",
      "resourceType": "tenant",
      "resourceId": "tenant_uuid",
      "resourceDisplay": "Villa Club Demo",
      "traceId": "req_platform_123",
      "occurredAt": "2026-07-14T10:00:00Z",
      "createdAt": "2026-07-14T10:00:01Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1,
    "traceId": "req_789"
  }
}
```

---

## 11.2. Consultar detalle platform audit log

### Endpoint

```http id="azyp79"
GET /api/v1/platform/audit-logs/{auditLogId}
```

### Permiso

```text id="x88i8q"
audit.platform.read
```

### Permiso adicional si el evento contiene datos sensibles

```text id="hlz5i9"
audit.platform.readSensitive
```

### Response 200

```json id="b069me"
{
  "data": {
    "id": "audit_log_uuid",
    "tenantId": "tenant_uuid",
    "actorType": "user",
    "actorUserId": "user_uuid",
    "actorDisplayName": "Administrador Demo",
    "action": "permission.granted",
    "category": "access",
    "severity": "warning",
    "outcome": "success",
    "resourceType": "membership",
    "resourceId": "membership_uuid",
    "oldValue": {
      "permissionIds": ["payments.read"]
    },
    "newValue": {
      "permissionIds": ["payments.read", "payments.confirm"]
    },
    "metadata": {
      "sourceModule": "users-roles"
    },
    "reason": "Actualización de rol de tesorería.",
    "ipAddress": "192.0.2.10",
    "userAgent": "Mozilla/5.0",
    "requestId": "req_123456",
    "correlationId": "corr_123456",
    "causationId": null,
    "traceId": "req_123456",
    "occurredAt": "2026-07-14T10:00:00Z",
    "createdAt": "2026-07-14T10:00:01Z"
  },
  "meta": {
    "traceId": "req_789"
  }
}
```

---

## 11.3. Exportar audit logs platform

### Endpoint

```http id="kuw2gv"
GET /api/v1/platform/audit-logs/export
```

### Permiso

```text id="snwtt6"
audit.platform.export
```

### Permiso adicional para datos sensibles

```text id="zfij0q"
audit.platform.readSensitive
```

### Query params

Iguales a `GET /api/v1/platform/audit-logs`, más:

| Nombre   | Tipo   | Default | Descripción |
| -------- | ------ | ------- | ----------- |
| `format` | string | json    | json/csv    |

### Reglas

* Exportación platform debe auditarse.
* Debe limitar volumen.
* Debe respetar sensibilidad.
* CSV debe sanitizar fórmulas.
* No loggear export completo.

### Auditoría generada

```text id="ijvfa0"
audit.platformExported
```

---

# 12. DTOs principales

## 12.1. AuditLogListItemDto

```json id="cdux01"
{
  "id": "audit_log_uuid",
  "tenantId": "tenant_uuid",
  "actorType": "user",
  "actorUserId": "user_uuid",
  "actorDisplayName": "Tesorería Demo",
  "action": "payment.confirmed",
  "category": "payments",
  "severity": "notice",
  "outcome": "success",
  "resourceType": "payment",
  "resourceId": "payment_uuid",
  "resourceDisplay": "Pago #PAY-2026-0001",
  "traceId": "req_123456",
  "occurredAt": "2026-07-14T10:00:00Z",
  "createdAt": "2026-07-14T10:00:01Z"
}
```

---

## 12.2. AuditLogDetailDto

```json id="f0d06f"
{
  "id": "audit_log_uuid",
  "tenantId": "tenant_uuid",
  "actorType": "user",
  "actorUserId": "user_uuid",
  "actorDisplayName": "Tesorería Demo",
  "actorMembershipId": "membership_uuid",
  "action": "payment.confirmed",
  "category": "payments",
  "severity": "notice",
  "outcome": "success",
  "resourceType": "payment",
  "resourceId": "payment_uuid",
  "resourceDisplay": "Pago #PAY-2026-0001",
  "oldValue": {
    "status": "pendingValidation"
  },
  "newValue": {
    "status": "confirmed"
  },
  "metadata": {
    "amount": "100.00",
    "currency": "USD"
  },
  "reason": null,
  "ipAddress": "192.0.2.10",
  "userAgent": "Mozilla/5.0",
  "requestId": "req_123456",
  "correlationId": "corr_123456",
  "causationId": null,
  "traceId": "req_123456",
  "sourceModule": "payments",
  "sourceVersion": "0.1",
  "occurredAt": "2026-07-14T10:00:00Z",
  "createdAt": "2026-07-14T10:00:01Z"
}
```

---

## 12.3. AuditExportResponseDto

```json id="b2b0ac"
{
  "format": "json",
  "scope": "tenant",
  "rowCount": 25,
  "generatedAt": "2026-07-14T10:30:00Z",
  "items": []
}
```

---

## 12.4. ListAuditLogsQueryDto

```json id="aeabuh"
{
  "actorUserId": "user_uuid",
  "actorType": "user",
  "action": "payment.confirmed",
  "category": "payments",
  "severity": "notice",
  "outcome": "success",
  "resourceType": "payment",
  "resourceId": "payment_uuid",
  "dateFrom": "2026-07-01T00:00:00Z",
  "dateTo": "2026-07-31T23:59:59Z",
  "traceId": "req_123456",
  "page": 1,
  "pageSize": 20,
  "sortBy": "occurredAt",
  "sortOrder": "desc"
}
```

---

# 13. Validaciones generales

## 13.1. IDs

Validar formato de:

```text id="oytz4i"
auditLogId
tenantId
actorUserId
resourceId cuando sea UUID
```

---

## 13.2. Fechas

Reglas:

```text id="xztsgn"
dateFrom <= dateTo
date range máximo configurable
usar UTC
```

---

## 13.3. Enums

Validar:

```text id="w0891s"
actorType
category
severity
outcome
format
sortOrder
```

---

## 13.4. Action

Validar formato:

```text id="yioi7r"
lower/dot notation
longitud máxima
sin espacios
sin caracteres peligrosos
```

Ejemplos válidos:

```text id="kk71fo"
payment.confirmed
accountStatement.generated
crossTenant.accessDenied
```

---

## 13.5. Resource type

Validar contra catálogo inicial o política flexible.

Ejemplos válidos:

```text id="pxl9us"
tenant
userProfile
propertyUnit
charge
payment
accountStatement
auditLog
export
```

---

## 13.6. Export format

Valores permitidos:

```text id="bxr3ez"
json
csv
```

---

## 13.7. Page size

```text id="vq4w9k"
pageSize <= 100
```

Para exportaciones se define límite separado:

```text id="xosf7u"
maxExportRows configurable
```

---

# 14. Catálogo de errores

| Código                              |    HTTP | Descripción                                            |
| ----------------------------------- | ------: | ------------------------------------------------------ |
| `UNAUTHORIZED`                      |     401 | No autenticado                                         |
| `FORBIDDEN`                         |     403 | Sin permiso                                            |
| `TENANT_NOT_ACTIVE`                 |     403 | Tenant no activo                                       |
| `MEMBERSHIP_NOT_ACTIVE`             |     403 | Membership no activa                                   |
| `AUDIT_LOG_NOT_FOUND`               |     404 | Audit log no encontrado                                |
| `AUDIT_QUERY_FORBIDDEN`             |     403 | Consulta de auditoría no permitida                     |
| `AUDIT_EXPORT_FORBIDDEN`            |     403 | Exportación no permitida                               |
| `AUDIT_CATEGORY_FORBIDDEN`          |     403 | Categoría no permitida                                 |
| `AUDIT_PLATFORM_FORBIDDEN`          |     403 | Consulta platform no permitida                         |
| `AUDIT_SENSITIVE_FORBIDDEN`         |     403 | Datos sensibles no permitidos                          |
| `AUDIT_EXPORT_FORMAT_NOT_SUPPORTED` |     422 | Formato no soportado                                   |
| `AUDIT_EXPORT_TOO_LARGE`            |     422 | Exportación excede límite                              |
| `AUDIT_DATE_RANGE_TOO_LARGE`        |     422 | Rango de fechas excede límite                          |
| `AUDIT_INVALID_DATE_RANGE`          |     422 | Rango de fechas inválido                               |
| `AUDIT_INVALID_ACTION`              |     422 | Acción inválida                                        |
| `AUDIT_INVALID_RESOURCE_TYPE`       |     422 | Tipo de recurso inválido                               |
| `RESOURCE_TYPE_NOT_SUPPORTED`       |     422 | Tipo de recurso no soportado para consulta por recurso |
| `RESOURCE_NOT_FOUND`                |     404 | Recurso no encontrado                                  |
| `CROSS_TENANT_REFERENCE`            | 403/422 | Recurso de otro tenant                                 |
| `VALIDATION_ERROR`                  |     422 | Error de validación                                    |
| `RATE_LIMITED`                      |     429 | Rate limit                                             |
| `INTERNAL_ERROR`                    |     500 | Error interno                                          |

---

# 15. Ejemplos de errores

## 15.1. Categoría no permitida

```json id="b46aso"
{
  "error": {
    "code": "AUDIT_CATEGORY_FORBIDDEN",
    "message": "You are not allowed to view audit logs for this category.",
    "details": {
      "category": "payments",
      "requiredPermission": "audit.readFinancial"
    },
    "traceId": "req_123456"
  }
}
```

---

## 15.2. Audit log no encontrado

```json id="fs2gif"
{
  "error": {
    "code": "AUDIT_LOG_NOT_FOUND",
    "message": "Audit log not found.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

## 15.3. Exportación demasiado grande

```json id="d6axz3"
{
  "error": {
    "code": "AUDIT_EXPORT_TOO_LARGE",
    "message": "The audit export exceeds the maximum allowed number of rows.",
    "details": {
      "maxExportRows": 10000
    },
    "traceId": "req_123456"
  }
}
```

---

## 15.4. Consulta platform prohibida

```json id="zg088r"
{
  "error": {
    "code": "AUDIT_PLATFORM_FORBIDDEN",
    "message": "You are not allowed to query platform audit logs.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

## 15.5. Recurso cross-tenant

```json id="llldti"
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

# 16. Auditoría del propio módulo

## 16.1. Eventos generados por consulta

Consulta ordinaria puede no auditarse siempre para evitar volumen excesivo.

Consulta sensible debe auditarse:

```text id="zshwoi"
audit.queriedSensitive
```

Casos sensibles:

* consulta de eventos de seguridad;
* consulta de eventos financieros;
* consulta de oldValue/newValue;
* consulta platform;
* consulta por actor;
* consulta por resourceId sensible.

---

## 16.2. Eventos generados por exportación

Toda exportación debe auditarse:

```text id="eqhxq8"
audit.exported
audit.platformExported
```

---

## 16.3. Eventos generados por acceso denegado

Accesos denegados relevantes:

```text id="xkcf4b"
audit.accessDenied
audit.platformAccessDenied
```

---

## 16.4. Protección anti-recursión

El sistema debe evitar recursión infinita al auditar eventos del propio módulo.

Regla:

```text id="qidmj5"
audit.exported debe persistirse una sola vez por operación de exportación.
```

---

# 17. Reglas de sanitización de salida

## 17.1. Listados

En listados, evitar devolver:

```text id="x7uf1v"
oldValue completo
newValue completo
metadata completa
ipAddress si no hay permiso sensible
userAgent si no hay permiso sensible
```

---

## 17.2. Detalle

En detalle, devolver oldValue/newValue/metadata solo si:

```text id="q1xgxt"
usuario tiene permiso para categoría
AND usuario tiene permiso sensible si aplica
```

---

## 17.3. Exportación

La exportación debe aplicar las mismas reglas de visibilidad que la consulta.

---

## 17.4. Campos redactados

Si un valor fue redactado en persistencia, se devuelve:

```text id="ofoqnb"
[REDACTED]
```

---

# 18. CSV export security

Al exportar CSV, neutralizar celdas que comiencen con:

```text id="wndv1z"
=
+
-
@
```

Regla:

```text id="n4gj7p"
Toda celda textual potencialmente ejecutable debe escaparse o prefijarse con apóstrofe.
```

Aplica a:

```text id="ppf7fv"
actorDisplayName
resourceDisplay
reason
action
metadata serializada
oldValue serializado
newValue serializado
```

---

# 19. Rate limiting

Aplicar rate limiting a:

```text id="m8a4ta"
GET /api/v1/tenant/audit-logs
GET /api/v1/tenant/audit-logs/{auditLogId}
GET /api/v1/tenant/audit-logs/export
GET /api/v1/tenant/resources/{resourceType}/{resourceId}/audit-logs
GET /api/v1/platform/audit-logs
GET /api/v1/platform/audit-logs/{auditLogId}
GET /api/v1/platform/audit-logs/export
```

Objetivos:

* evitar scraping de auditoría;
* evitar consultas masivas;
* proteger exportaciones;
* proteger eventos sensibles;
* reducir riesgo de enumeración.

---

# 20. CORS

No usar CORS abierto en producción para endpoints de auditoría.

Prohibido:

```text id="l61m0m"
Access-Control-Allow-Origin: *
```

Permitir únicamente orígenes oficiales.

---

# 21. OpenAPI

Cada endpoint debe documentar:

* summary;
* description;
* tags;
* security;
* path params;
* query params;
* responses;
* errores;
* permisos;
* categoría sensible;
* ejemplos;
* rate limiting;
* export format;
* tenant scope;
* platform scope.

Tags sugeridos:

```text id="q926cb"
Audit Logs
Tenant Audit
Resource Audit
Platform Audit
Audit Export
```

---

## 22. Extensiones OpenAPI sugeridas

### Tenant audit list

```yaml id="m3xmsp"
x-required-permission: audit.read
x-tenant-scope: tenant
x-audit-query: true
```

---

### Financial audit query

```yaml id="tc3yx6"
x-required-permission: audit.readFinancial
x-sensitive-category: financial
x-tenant-scope: tenant
```

---

### Tenant audit export

```yaml id="d2rb0d"
x-required-permission: audit.export
x-audit-event: audit.exported
x-tenant-scope: tenant
x-financial-export: false
x-sensitive-export: true
```

---

### Platform audit query

```yaml id="w8zahj"
x-required-permission: audit.platform.read
x-platform-scope: true
x-audit-query: true
```

---

### Platform audit export

```yaml id="i3d45d"
x-required-permission: audit.platform.export
x-audit-event: audit.platformExported
x-platform-scope: true
x-sensitive-export: true
```

---

### Resource audit query

```yaml id="dfvoh9"
x-required-permission: audit.read
x-tenant-scope: tenant
x-resource-ownership-check: true
```

---

# 23. Pruebas de contrato requeridas

## 23.1. Tenant Audit API

Probar:

* listar audit logs;
* consultar detalle;
* filtros;
* paginación;
* sort;
* categorías visibles;
* categorías prohibidas;
* tenant isolation.

---

## 23.2. Resource Audit API

Probar:

* consultar auditoría de recurso válido;
* recurso de otro tenant;
* resourceType no soportado;
* resourceId inválido;
* sin permiso;
* categoría sensible.

---

## 23.3. Platform Audit API

Probar:

* listar platform logs;
* filtrar por tenant;
* consultar detalle;
* bloquear sin permiso platform;
* bloquear sensitive sin permiso;
* exportar platform;
* auditar consulta/export sensible.

---

## 23.4. Export API

Probar:

* export JSON;
* export CSV;
* formato inválido;
* export sin permiso;
* export con categoría no permitida;
* export demasiado grande;
* CSV injection protection;
* audit.exported.

---

# 24. Matriz resumen de endpoints

| Método | Ruta                                                              | Scope           | Permiso                 |
| ------ | ----------------------------------------------------------------- | --------------- | ----------------------- |
| GET    | `/api/v1/tenant/audit-logs`                                       | tenant          | `audit.read`            |
| GET    | `/api/v1/tenant/audit-logs/{auditLogId}`                          | tenant          | `audit.read`            |
| GET    | `/api/v1/tenant/audit-logs/export`                                | tenant          | `audit.export`          |
| GET    | `/api/v1/tenant/resources/{resourceType}/{resourceId}/audit-logs` | tenant/resource | `audit.read`            |
| GET    | `/api/v1/platform/audit-logs`                                     | platform        | `audit.platform.read`   |
| GET    | `/api/v1/platform/audit-logs/{auditLogId}`                        | platform        | `audit.platform.read`   |
| GET    | `/api/v1/platform/audit-logs/export`                              | platform        | `audit.platform.export` |

---

# 25. Casos borde

| Caso                                                 | Resultado esperado             |
| ---------------------------------------------------- | ------------------------------ |
| Sin token                                            | 401                            |
| Sin permiso `audit.read`                             | 403                            |
| Usuario tenant consulta platform                     | 403                            |
| Tenant A consulta audit log Tenant B                 | 404/403                        |
| Tenant A consulta recurso Tenant B                   | 403/404                        |
| `category=payments` sin `audit.readFinancial`        | 403                            |
| `category=access` sin `audit.readAccess`             | 403                            |
| `category=personalData` sin `audit.readPersonalData` | 403                            |
| `pageSize > 100`                                     | 422                            |
| `sortBy` arbitrario                                  | 422                            |
| `dateFrom > dateTo`                                  | 422                            |
| rango de fechas demasiado amplio                     | 422 o requerir filtros         |
| export sin permiso                                   | 403                            |
| export CSV con fórmula                               | celda neutralizada             |
| export demasiado grande                              | 422                            |
| audit log platform sin permiso sensitive             | campos sensibles ocultos o 403 |
| resourceType no soportado                            | 422                            |
| action con caracteres inválidos                      | 422                            |

---

# 26. Decisión final del contrato API

El módulo `007-audit` expondrá endpoints tenant bajo:

```text id="pq1k23"
/api/v1/tenant/audit-logs
```

endpoints por recurso bajo:

```text id="mn67bp"
/api/v1/tenant/resources/{resourceType}/{resourceId}/audit-logs
```

y endpoints platform bajo:

```text id="j02tcg"
/api/v1/platform/audit-logs
```

La API será estrictamente de consulta y exportación controlada.

No se expondrán endpoints ordinarios para crear, actualizar o eliminar auditoría. La escritura se realizará internamente mediante `AuditWriterPort`.

La autorización dependerá de:

```text id="bmfdir"
usuario autenticado
tenant activo para scope tenant
membership activa
permiso audit.read o audit.export
permisos de categoría sensible
permisos platform cuando aplique
validación de recurso perteneciente al tenant
```

El contrato prepara a RESIDENT Core para cumplimiento, investigación de incidentes, reportes, monitoreo de seguridad e integraciones futuras, preservando aislamiento multitenant, sanitización, control de exportaciones y trazabilidad suficiente para reconstruir acciones críticas.
