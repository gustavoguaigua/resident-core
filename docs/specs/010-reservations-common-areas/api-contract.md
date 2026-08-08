# API Contract — Spec 010 Reservations and Common Areas

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                   |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                           |
| Spec ID         | 010                                                                                                                                                                     |
| Módulo          | Reservations and Common Areas                                                                                                                                           |
| Documento       | API Contract                                                                                                                                                            |
| Ruta            | `docs/specs/010-reservations-common-areas/api-contract.md`                                                                                                              |
| Versión         | 0.1                                                                                                                                                                     |
| Estado          | Borrador inicial                                                                                                                                                        |
| Fecha           | 2026-07-18                                                                                                                                                              |
| Documento base  | `docs/specs/010-reservations-common-areas/spec.md`                                                                                                                      |
| Plan técnico    | `docs/specs/010-reservations-common-areas/plan.md`                                                                                                                      |
| Modelo de datos | `docs/specs/010-reservations-common-areas/data-model.md`                                                                                                                |
| API Style       | REST                                                                                                                                                                    |
| API Version     | `/api/v1`                                                                                                                                                               |
| Naturaleza      | Tenant-scoped / Permissioned / Auditable / Calendar-aware                                                                                                               |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements`, `007-audit`, `009-wordpress-integration-basic` |

---

## 2. Propósito

Este documento define el contrato API del módulo `010-reservations-common-areas`.

El módulo permite administrar áreas comunales, disponibilidad, bloqueos administrativos, reservas, flujos de aprobación, cancelación, cierre, consulta de calendario y generación opcional de cargos asociados.

Regla central:

```text id="mwr7bb"
Toda operación de reservas debe estar autenticada, autorizada, tenant-scoped, auditable y protegida contra doble reserva, excepto el catálogo público limitado de áreas comunales expuesto hacia WordPress bajo reglas public-safe.
```

---

## 3. Principios del contrato API

### 3.1. Tenant scope obligatorio

Todos los endpoints administrativos y propios operan dentro del tenant activo del usuario autenticado.

Regla:

```text id="x20ea3"
currentTenant.id debe usarse como tenant_id efectivo en toda consulta y mutación.
```

No se acepta que el cliente envíe `tenantId` en el body para operaciones tenant-scoped.

---

### 3.2. Autorización por permiso

Cada acción requiere permiso explícito.

Ejemplos:

```text id="ci7yxa"
commonAreas.create
commonAreas.update
reservations.approve
reservations.create.own
reservations.cancel.own
```

---

### 3.3. Protección de recursos propios

Los endpoints `/me` solo permiten operar sobre reservas y unidades asociadas al usuario autenticado.

Regla conceptual:

```text id="crgaoz"
actorUserId -> personId -> propertyUnitId -> reservation
```

---

### 3.4. Prevención de doble reserva

Toda creación o aprobación debe validar solapamientos contra reservas activas y blackouts.

Regla de solapamiento:

```text id="if1kup"
new.startAt < existing.endAt
AND new.endAt > existing.startAt
```

---

### 3.5. Estados controlados

Las reservas solo pueden cambiar de estado mediante endpoints explícitos y transiciones permitidas.

---

### 3.6. Integración financiera desacoplada

El módulo puede solicitar generación de cargo al módulo financiero, pero no procesa pagos.

Prohibido:

```text id="d1p507"
confirmar pagos desde reservas
asignar pagos desde reservas
modificar comprobantes desde reservas
revertir cargos automáticamente al cancelar
```

---

### 3.7. Dinero como string

Todo monto monetario debe exponerse como string decimal.

Ejemplo:

```json id="wztkl2"
{
  "feeAmount": "25.00",
  "feeCurrency": "USD"
}
```

---

### 3.8. WordPress solo catálogo público

WordPress puede consultar áreas públicas, pero no puede crear reservas, consultar calendario interno, ver reservas existentes ni acceder a datos personales o financieros.

---

## 4. Rutas base

### 4.1. Common Areas

```text id="bgyzvz"
/api/v1/tenant/common-areas
```

---

### 4.2. Availability Windows

```text id="vggd2s"
/api/v1/tenant/common-areas/{commonAreaId}/availability-windows
```

---

### 4.3. Blackouts

```text id="d6r8to"
/api/v1/tenant/common-areas/{commonAreaId}/blackouts
```

---

### 4.4. Reservations administrativas

```text id="ud6f1l"
/api/v1/tenant/reservations
```

---

### 4.5. Reservations propias

```text id="tsrabf"
/api/v1/me/reservations
```

---

### 4.6. Calendar

```text id="momngl"
/api/v1/tenant/common-areas/{commonAreaId}/calendar
/api/v1/me/common-areas/{commonAreaId}/calendar
```

---

### 4.7. Public Common Areas vía WordPress Integration

```text id="w7f1mk"
/api/v1/public/tenants/{slug}/common-areas
/api/v1/public/tenants/{slug}/common-areas/{commonAreaSlug}
```

Estos endpoints se coordinan con `009-wordpress-integration-basic`.

---

## 5. Headers

### 5.1. Request headers autenticados

| Header             |                          Requerido | Descripción              |
| ------------------ | ---------------------------------: | ------------------------ |
| `Authorization`    |                                 Sí | Bearer token             |
| `Content-Type`     |                 Sí para POST/PATCH | `application/json`       |
| `Accept`           |                        Recomendado | `application/json`       |
| `X-Request-Id`     |                           Opcional | ID de request            |
| `X-Correlation-Id` |                           Opcional | ID de correlación        |
| `Idempotency-Key`  | Recomendado en generación de cargo | Prevención de duplicidad |

---

### 5.2. Request headers públicos

| Header             |   Requerido | Descripción                 |
| ------------------ | ----------: | --------------------------- |
| `Accept`           | Recomendado | `application/json`          |
| `Origin`           | Condicional | Validación CORS según `009` |
| `X-Request-Id`     |    Opcional | ID de request               |
| `X-Correlation-Id` |    Opcional | ID de correlación           |

---

### 5.3. Response headers

| Header             | Descripción                              |
| ------------------ | ---------------------------------------- |
| `Content-Type`     | `application/json`                       |
| `X-Request-Id`     | ID de request                            |
| `X-Correlation-Id` | ID de correlación si aplica              |
| `Cache-Control`    | Solo para endpoints públicos public-safe |
| `ETag`             | Opcional para catálogo público           |
| `Last-Modified`    | Opcional para catálogo público           |

---

## 6. Formato estándar de respuesta

### 6.1. Respuesta individual

```json id="vqzf55"
{
  "data": {},
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

### 6.2. Respuesta paginada

```json id="fm8or9"
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

### 6.3. Error estándar

```json id="j3kjl7"
{
  "error": {
    "code": "RESERVATION_CONFLICT",
    "message": "The requested time range conflicts with an existing reservation.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

## 7. Estados HTTP

| Código | Uso                                                    |
| -----: | ------------------------------------------------------ |
|    200 | Consulta o acción exitosa con respuesta                |
|    201 | Recurso creado                                         |
|    204 | Acción exitosa sin cuerpo, si se adopta                |
|    400 | Request mal formado                                    |
|    401 | No autenticado                                         |
|    403 | Sin permiso o sin acceso al recurso                    |
|    404 | Recurso no encontrado o no accesible dentro del tenant |
|    409 | Conflicto de estado, solapamiento o duplicidad         |
|    422 | Validación semántica fallida                           |
|    429 | Rate limit                                             |
|    500 | Error interno                                          |

---

## 8. Permisos

### 8.1. Common Areas

```text id="lmbkoj"
commonAreas.create
commonAreas.read
commonAreas.update
commonAreas.archive
commonAreas.manageAvailability
commonAreas.manageBlackouts
```

---

### 8.2. Reservations administrativas

```text id="c9j7w9"
reservations.create
reservations.read
reservations.approve
reservations.reject
reservations.cancel
reservations.complete
reservations.markNoShow
reservations.readCalendar
reservations.generateCharge
```

---

### 8.3. Reservations propias

```text id="am7grp"
reservations.create.own
reservations.read.own
reservations.cancel.own
reservations.readCalendar.own
```

---

### 8.4. Auditoría y reportes

```text id="lz31pg"
reservations.audit.read
reservations.reports.read
```

---

## 9. Validaciones comunes

### 9.1. UUID/path ids

Todos los IDs de ruta deben validarse.

Campos frecuentes:

```text id="qpfiog"
commonAreaId
windowId
blackoutId
reservationId
propertyUnitId
chargeId
```

---

### 9.2. Fechas y horas

Fechas completas:

```text id="e8q986"
ISO 8601 UTC
```

Ejemplo:

```text id="n8bkdd"
2026-08-20T14:00:00Z
```

Horas locales de disponibilidad:

```text id="mblkh2"
HH:mm
```

Ejemplo:

```text id="l2f8u5"
08:00
18:00
```

---

### 9.3. Rango de reserva

```text id="w86qvm"
startAt < endAt
```

No permitir en MVP:

```text id="zn1dee"
reservas que crucen medianoche local
reservas multi-día
reservas recurrentes
```

---

### 9.4. Rango de calendario

Máximo MVP:

```text id="fqu3id"
31 días
```

---

### 9.5. Dinero

Montos:

```text id="dv0m8k"
string decimal
```

Ejemplo válido:

```text id="dk0cle"
25.00
```

Ejemplos inválidos:

```text id="skny2y"
25
25.001
-10.00
NaN
```

---

### 9.6. Paginación

| Query param |   Tipo | Default | Máximo |
| ----------- | -----: | ------: | -----: |
| `page`      | number |       1 |      — |
| `pageSize`  | number |      20 |    100 |

---

## 10. Enums API

### 10.1. CommonAreaStatus

```text id="hh9r5c"
active
inactive
maintenance
archived
```

---

### 10.2. CommonAreaType

```text id="mctk4a"
hall
court
bbq
pool
terrace
park
gym
meetingRoom
other
```

---

### 10.3. DayOfWeek

```text id="t4dfzl"
monday
tuesday
wednesday
thursday
friday
saturday
sunday
```

---

### 10.4. CommonAreaBlackoutStatus

```text id="npyu78"
active
cancelled
expired
archived
```

---

### 10.5. ReservationStatus

```text id="e5p839"
draft
requested
pendingApproval
approved
rejected
cancelled
completed
noShow
expired
archived
```

---

### 10.6. ReservationPaymentStatusSnapshot

```text id="uljd8j"
notRequired
pendingCharge
chargeGenerated
pendingPayment
paid
partiallyPaid
waived
cancelled
```

---

# 11. Common Areas — Endpoints administrativos

## 11.1. Listar áreas comunales

### Endpoint

```http id="m2a1lu"
GET /api/v1/tenant/common-areas
```

### Autenticación

Requiere Bearer token.

### Permiso

```text id="ja3eex"
commonAreas.read
```

### Query params

| Nombre            | Tipo    | Requerido | Descripción                                               |
| ----------------- | ------- | --------: | --------------------------------------------------------- |
| `status`          | string  |        No | `active`, `inactive`, `maintenance`, `archived`           |
| `type`            | string  |        No | Tipo de área                                              |
| `isReservable`    | boolean |        No | Filtrar reservables                                       |
| `isPublicVisible` | boolean |        No | Filtrar visibles públicamente                             |
| `q`               | string  |        No | Búsqueda por nombre/código                                |
| `page`            | number  |        No | Página                                                    |
| `pageSize`        | number  |        No | Tamaño                                                    |
| `sortBy`          | string  |        No | `code`, `name`, `type`, `status`, `capacity`, `createdAt` |
| `sortOrder`       | string  |        No | `asc`, `desc`                                             |

### Response 200

```json id="j3vjm3"
{
  "data": [
    {
      "id": "common_area_uuid",
      "code": "SALON-COMUNAL",
      "slug": "salon-comunal",
      "name": "Salón comunal",
      "description": "Espacio para eventos comunitarios.",
      "type": "hall",
      "capacity": 60,
      "status": "active",
      "isReservable": true,
      "isPublicVisible": true,
      "requiresApproval": true,
      "requiresPayment": true,
      "feeAmount": "25.00",
      "feeCurrency": "USD",
      "minimumDurationMinutes": 60,
      "maximumDurationMinutes": 240,
      "reservationAdvanceDays": 30,
      "cancellationLimitHours": 24
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

## 11.2. Crear área comunal

### Endpoint

```http id="wcstnw"
POST /api/v1/tenant/common-areas
```

### Permiso

```text id="nc24vm"
commonAreas.create
```

### Request body

```json id="y7cc3b"
{
  "code": "SALON-COMUNAL",
  "slug": "salon-comunal",
  "name": "Salón comunal",
  "description": "Espacio para eventos comunitarios.",
  "type": "hall",
  "capacity": 60,
  "locationDescription": "Planta baja junto a la administración",
  "isReservable": true,
  "isPublicVisible": true,
  "requiresApproval": true,
  "requiresPayment": true,
  "feeAmount": "25.00",
  "feeCurrency": "USD",
  "feeChargeConceptId": "charge_concept_uuid",
  "minimumDurationMinutes": 60,
  "maximumDurationMinutes": 240,
  "reservationAdvanceDays": 30,
  "cancellationLimitHours": 24,
  "publicRulesSummary": "Uso sujeto a reglamento interno.",
  "internalRules": "Reglas internas visibles solo para administración.",
  "coverImageUrl": "https://cdn.example.com/salon.jpg",
  "galleryUrls": []
}
```

### Response 201

```json id="s7jcl9"
{
  "data": {
    "id": "common_area_uuid",
    "code": "SALON-COMUNAL",
    "slug": "salon-comunal",
    "name": "Salón comunal",
    "type": "hall",
    "capacity": 60,
    "status": "active",
    "isReservable": true,
    "isPublicVisible": true,
    "requiresApproval": true,
    "requiresPayment": true,
    "feeAmount": "25.00",
    "feeCurrency": "USD"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Eventos auditables

```text id="y59d3o"
commonArea.created
```

---

## 11.3. Obtener área comunal

### Endpoint

```http id="oe5gj3"
GET /api/v1/tenant/common-areas/{commonAreaId}
```

### Permiso

```text id="dpqgbu"
commonAreas.read
```

### Response 200

```json id="i0b9r2"
{
  "data": {
    "id": "common_area_uuid",
    "code": "SALON-COMUNAL",
    "slug": "salon-comunal",
    "name": "Salón comunal",
    "description": "Espacio para eventos comunitarios.",
    "type": "hall",
    "capacity": 60,
    "locationDescription": "Planta baja junto a la administración",
    "status": "active",
    "isReservable": true,
    "isPublicVisible": true,
    "requiresApproval": true,
    "requiresPayment": true,
    "feeAmount": "25.00",
    "feeCurrency": "USD",
    "feeChargeConceptId": "charge_concept_uuid",
    "minimumDurationMinutes": 60,
    "maximumDurationMinutes": 240,
    "reservationAdvanceDays": 30,
    "cancellationLimitHours": 24,
    "publicRulesSummary": "Uso sujeto a reglamento interno.",
    "internalRules": "Reglas internas visibles solo para administración.",
    "coverImageUrl": "https://cdn.example.com/salon.jpg",
    "galleryUrls": [],
    "createdAt": "2026-07-18T10:00:00Z",
    "updatedAt": "2026-07-18T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 11.4. Actualizar área comunal

### Endpoint

```http id="gd4t1q"
PATCH /api/v1/tenant/common-areas/{commonAreaId}
```

### Permiso

```text id="ka4kiw"
commonAreas.update
```

### Request body

```json id="nh6bz2"
{
  "name": "Salón comunal principal",
  "capacity": 80,
  "requiresApproval": true,
  "requiresPayment": true,
  "feeAmount": "30.00",
  "feeCurrency": "USD",
  "feeChargeConceptId": "charge_concept_uuid",
  "publicRulesSummary": "Reserva previa obligatoria."
}
```

### Response 200

```json id="vvhztz"
{
  "data": {
    "id": "common_area_uuid",
    "code": "SALON-COMUNAL",
    "slug": "salon-comunal",
    "name": "Salón comunal principal",
    "capacity": 80,
    "status": "active",
    "requiresPayment": true,
    "feeAmount": "30.00",
    "feeCurrency": "USD"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Eventos auditables

```text id="i7r4jk"
commonArea.updated
```

---

## 11.5. Activar área comunal

```http id="kg9vgj"
POST /api/v1/tenant/common-areas/{commonAreaId}/activate
```

Permiso:

```text id="e2ryob"
commonAreas.update
```

Response 200:

```json id="g2no81"
{
  "data": {
    "id": "common_area_uuid",
    "status": "active"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

Evento:

```text id="r7xnft"
commonArea.activated
```

---

## 11.6. Desactivar área comunal

```http id="rj5kct"
POST /api/v1/tenant/common-areas/{commonAreaId}/deactivate
```

Permiso:

```text id="m5rvc8"
commonAreas.update
```

Regla:

```text id="dvpkwp"
No cancela reservas existentes automáticamente.
```

Evento:

```text id="j0a0jy"
commonArea.deactivated
```

---

## 11.7. Marcar área en mantenimiento

```http id="y4zdia"
POST /api/v1/tenant/common-areas/{commonAreaId}/mark-maintenance
```

Permiso:

```text id="u5vufr"
commonAreas.update
```

Request body:

```json id="yd1aws"
{
  "reason": "Mantenimiento preventivo."
}
```

Evento:

```text id="y1suy5"
commonArea.markedMaintenance
```

---

## 11.8. Archivar área comunal

```http id="lqwrs1"
POST /api/v1/tenant/common-areas/{commonAreaId}/archive
```

Permiso:

```text id="s71arc"
commonAreas.archive
```

Regla:

```text id="h3isni"
El archivo lógico impide nuevas reservas y conserva historial.
```

Evento:

```text id="onyzdu"
commonArea.archived
```

---

# 12. Availability Windows

## 12.1. Listar ventanas de disponibilidad

```http id="e7swar"
GET /api/v1/tenant/common-areas/{commonAreaId}/availability-windows
```

Permiso:

```text id="e5anvq"
commonAreas.read
```

Response 200:

```json id="cza0h1"
{
  "data": [
    {
      "id": "window_uuid",
      "commonAreaId": "common_area_uuid",
      "dayOfWeek": "saturday",
      "startTime": "08:00",
      "endTime": "18:00",
      "isActive": true,
      "validFrom": "2026-08-01",
      "validTo": null
    }
  ],
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 12.2. Crear ventana de disponibilidad

```http id="r59fal"
POST /api/v1/tenant/common-areas/{commonAreaId}/availability-windows
```

Permiso:

```text id="p12npw"
commonAreas.manageAvailability
```

Request body:

```json id="cwi7n6"
{
  "dayOfWeek": "saturday",
  "startTime": "08:00",
  "endTime": "18:00",
  "isActive": true,
  "validFrom": "2026-08-01",
  "validTo": null
}
```

Response 201:

```json id="pyb73w"
{
  "data": {
    "id": "window_uuid",
    "commonAreaId": "common_area_uuid",
    "dayOfWeek": "saturday",
    "startTime": "08:00",
    "endTime": "18:00",
    "isActive": true,
    "validFrom": "2026-08-01",
    "validTo": null
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

Evento:

```text id="oftg70"
commonAreaAvailability.created
```

---

## 12.3. Actualizar ventana de disponibilidad

```http id="fn40my"
PATCH /api/v1/tenant/common-areas/{commonAreaId}/availability-windows/{windowId}
```

Permiso:

```text id="r4q12z"
commonAreas.manageAvailability
```

Request body:

```json id="c2qmfu"
{
  "startTime": "09:00",
  "endTime": "17:00",
  "isActive": true
}
```

Evento:

```text id="jyifkn"
commonAreaAvailability.updated
```

---

## 12.4. Archivar ventana de disponibilidad

```http id="o2wntn"
POST /api/v1/tenant/common-areas/{commonAreaId}/availability-windows/{windowId}/archive
```

Permiso:

```text id="gyz3z9"
commonAreas.manageAvailability
```

Evento:

```text id="jkvz6k"
commonAreaAvailability.archived
```

---

# 13. Blackouts

## 13.1. Listar blackouts

```http id="j7w2bb"
GET /api/v1/tenant/common-areas/{commonAreaId}/blackouts
```

Permiso:

```text id="y9gu70"
commonAreas.read
```

Query params:

| Nombre     | Tipo      | Requerido | Descripción                                  |
| ---------- | --------- | --------: | -------------------------------------------- |
| `status`   | string    |        No | `active`, `cancelled`, `expired`, `archived` |
| `dateFrom` | date-time |        No | Inicio                                       |
| `dateTo`   | date-time |        No | Fin                                          |
| `page`     | number    |        No | Página                                       |
| `pageSize` | number    |        No | Tamaño                                       |

Response 200:

```json id="ybcdb2"
{
  "data": [
    {
      "id": "blackout_uuid",
      "commonAreaId": "common_area_uuid",
      "startAt": "2026-08-15T08:00:00Z",
      "endAt": "2026-08-15T18:00:00Z",
      "reason": "Mantenimiento programado",
      "status": "active"
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

## 13.2. Crear blackout

```http id="mndvis"
POST /api/v1/tenant/common-areas/{commonAreaId}/blackouts
```

Permiso:

```text id="a63ccc"
commonAreas.manageBlackouts
```

Request body:

```json id="h5ibuv"
{
  "startAt": "2026-08-15T08:00:00Z",
  "endAt": "2026-08-15T18:00:00Z",
  "reason": "Mantenimiento programado"
}
```

Response 201:

```json id="zo2p0n"
{
  "data": {
    "id": "blackout_uuid",
    "commonAreaId": "common_area_uuid",
    "startAt": "2026-08-15T08:00:00Z",
    "endAt": "2026-08-15T18:00:00Z",
    "reason": "Mantenimiento programado",
    "status": "active"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

Evento:

```text id="c8gbep"
commonAreaBlackout.created
```

---

## 13.3. Cancelar blackout

```http id="rjv7tm"
POST /api/v1/tenant/common-areas/{commonAreaId}/blackouts/{blackoutId}/cancel
```

Permiso:

```text id="nygztx"
commonAreas.manageBlackouts
```

Request body:

```json id="e3pd3h"
{
  "reason": "Mantenimiento reprogramado."
}
```

Response 200:

```json id="xwwzq0"
{
  "data": {
    "id": "blackout_uuid",
    "status": "cancelled",
    "cancelledAt": "2026-08-10T15:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

Evento:

```text id="rnqv1w"
commonAreaBlackout.cancelled
```

---

# 14. Reservations — Endpoints administrativos

## 14.1. Listar reservas administrativas

```http id="b7h8dp"
GET /api/v1/tenant/reservations
```

Permiso:

```text id="jrxgir"
reservations.read
```

Query params:

| Nombre                  | Tipo      | Requerido | Descripción                                                                     |
| ----------------------- | --------- | --------: | ------------------------------------------------------------------------------- |
| `commonAreaId`          | string    |        No | Área comunal                                                                    |
| `propertyUnitId`        | string    |        No | Unidad                                                                          |
| `requesterUserId`       | string    |        No | Solicitante                                                                     |
| `status`                | string    |        No | Estado                                                                          |
| `dateFrom`              | date-time |        No | Inicio                                                                          |
| `dateTo`                | date-time |        No | Fin                                                                             |
| `requiresPayment`       | boolean   |        No | Requiere pago                                                                   |
| `paymentStatusSnapshot` | string    |        No | Snapshot de pago                                                                |
| `page`                  | number    |        No | Página                                                                          |
| `pageSize`              | number    |        No | Tamaño                                                                          |
| `sortBy`                | string    |        No | `startAt`, `endAt`, `status`, `createdAt`, `commonAreaName`, `propertyUnitCode` |
| `sortOrder`             | string    |        No | `asc`, `desc`                                                                   |

Response 200:

```json id="vx7qeq"
{
  "data": [
    {
      "id": "reservation_uuid",
      "commonAreaId": "common_area_uuid",
      "commonAreaName": "Salón comunal",
      "propertyUnitId": "property_unit_uuid",
      "propertyUnitCode": "Casa 01",
      "startAt": "2026-08-20T14:00:00Z",
      "endAt": "2026-08-20T17:00:00Z",
      "status": "pendingApproval",
      "purpose": "Reunión familiar",
      "attendeeCount": 20,
      "requiresApproval": true,
      "requiresPayment": true,
      "feeAmount": "25.00",
      "feeCurrency": "USD",
      "chargeId": null,
      "paymentStatusSnapshot": "pendingCharge"
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

## 14.2. Crear reserva administrativa

```http id="dlst6z"
POST /api/v1/tenant/reservations
```

Permiso:

```text id="gwi9o2"
reservations.create
```

Request body:

```json id="teqjoo"
{
  "commonAreaId": "common_area_uuid",
  "propertyUnitId": "property_unit_uuid",
  "requesterUserId": "user_uuid",
  "startAt": "2026-08-20T14:00:00Z",
  "endAt": "2026-08-20T17:00:00Z",
  "purpose": "Reunión familiar",
  "attendeeCount": 20,
  "notes": "Solicitud creada por administración."
}
```

Response 201:

```json id="z4wevf"
{
  "data": {
    "id": "reservation_uuid",
    "commonAreaId": "common_area_uuid",
    "commonAreaName": "Salón comunal",
    "propertyUnitId": "property_unit_uuid",
    "propertyUnitCode": "Casa 01",
    "startAt": "2026-08-20T14:00:00Z",
    "endAt": "2026-08-20T17:00:00Z",
    "status": "pendingApproval",
    "purpose": "Reunión familiar",
    "attendeeCount": 20,
    "requiresApproval": true,
    "requiresPayment": true,
    "feeAmount": "25.00",
    "feeCurrency": "USD",
    "chargeId": null,
    "paymentStatusSnapshot": "pendingCharge"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

Eventos:

```text id="ykhaqo"
reservation.created
reservation.requested
```

---

## 14.3. Obtener reserva administrativa

```http id="c73tpy"
GET /api/v1/tenant/reservations/{reservationId}
```

Permiso:

```text id="vcisuc"
reservations.read
```

Response 200:

```json id="fgypnm"
{
  "data": {
    "id": "reservation_uuid",
    "commonAreaId": "common_area_uuid",
    "commonAreaName": "Salón comunal",
    "propertyUnitId": "property_unit_uuid",
    "propertyUnitCode": "Casa 01",
    "requesterUserId": "user_uuid",
    "requesterPersonId": "person_uuid",
    "startAt": "2026-08-20T14:00:00Z",
    "endAt": "2026-08-20T17:00:00Z",
    "status": "pendingApproval",
    "purpose": "Reunión familiar",
    "attendeeCount": 20,
    "requiresApproval": true,
    "requiresPayment": true,
    "feeAmount": "25.00",
    "feeCurrency": "USD",
    "chargeId": null,
    "paymentStatusSnapshot": "pendingCharge",
    "approvedBy": null,
    "approvedAt": null,
    "rejectedBy": null,
    "rejectedAt": null,
    "rejectionReason": null,
    "cancelledBy": null,
    "cancelledAt": null,
    "cancellationReason": null,
    "closedBy": null,
    "closedAt": null,
    "notes": "Solicitud creada por administración.",
    "createdAt": "2026-07-18T10:00:00Z",
    "updatedAt": "2026-07-18T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 14.4. Aprobar reserva

```http id="q3hm3z"
POST /api/v1/tenant/reservations/{reservationId}/approve
```

Permiso:

```text id="uojgqi"
reservations.approve
```

Request body:

```json id="hgpqpj"
{
  "notes": "Aprobada según disponibilidad."
}
```

Response 200:

```json id="bq63vs"
{
  "data": {
    "id": "reservation_uuid",
    "status": "approved",
    "approvedBy": "user_uuid",
    "approvedAt": "2026-07-18T15:00:00Z",
    "chargeId": "charge_uuid",
    "paymentStatusSnapshot": "chargeGenerated"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

Reglas:

* revalidar disponibilidad;
* revalidar conflictos;
* generar cargo si `requiresPayment = true`;
* usar idempotencia;
* registrar historial.

Eventos:

```text id="wb7s16"
reservation.approved
reservation.chargeGenerated
```

---

## 14.5. Rechazar reserva

```http id="qafbj2"
POST /api/v1/tenant/reservations/{reservationId}/reject
```

Permiso:

```text id="ho68vt"
reservations.reject
```

Request body:

```json id="cmpfko"
{
  "reason": "El área estará en mantenimiento."
}
```

Response 200:

```json id="c4kxae"
{
  "data": {
    "id": "reservation_uuid",
    "status": "rejected",
    "rejectedBy": "user_uuid",
    "rejectedAt": "2026-07-18T15:00:00Z",
    "rejectionReason": "El área estará en mantenimiento."
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

Evento:

```text id="zicjpw"
reservation.rejected
```

---

## 14.6. Cancelar reserva administrativa

```http id="p162yy"
POST /api/v1/tenant/reservations/{reservationId}/cancel
```

Permiso:

```text id="ojobdd"
reservations.cancel
```

Request body:

```json id="ss84yo"
{
  "reason": "Cancelación administrativa solicitada por la directiva."
}
```

Response 200:

```json id="vfsw4a"
{
  "data": {
    "id": "reservation_uuid",
    "status": "cancelled",
    "cancelledBy": "user_uuid",
    "cancelledAt": "2026-07-18T15:00:00Z",
    "cancellationReason": "Cancelación administrativa solicitada por la directiva."
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

Regla:

```text id="mlrdnt"
No revierte cargo automáticamente.
```

Evento:

```text id="jo0g6h"
reservation.cancelled
```

---

## 14.7. Completar reserva

```http id="xnzjer"
POST /api/v1/tenant/reservations/{reservationId}/complete
```

Permiso:

```text id="x5qxhl"
reservations.complete
```

Response 200:

```json id="yoz658"
{
  "data": {
    "id": "reservation_uuid",
    "status": "completed",
    "closedBy": "user_uuid",
    "closedAt": "2026-08-20T18:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

Evento:

```text id="tpdx96"
reservation.completed
```

---

## 14.8. Marcar no show

```http id="yhsqf2"
POST /api/v1/tenant/reservations/{reservationId}/mark-no-show
```

Permiso:

```text id="krm3x7"
reservations.markNoShow
```

Request body opcional:

```json id="vws346"
{
  "reason": "El solicitante no hizo uso del área reservada."
}
```

Evento:

```text id="dwkpro"
reservation.noShow
```

---

## 14.9. Generar cargo de reserva

```http id="o6qvrf"
POST /api/v1/tenant/reservations/{reservationId}/generate-charge
```

Permiso:

```text id="nwawhi"
reservations.generateCharge
```

Headers recomendados:

```text id="d45yu1"
Idempotency-Key: reservation:{reservationId}:charge
```

Response 200:

```json id="gbqjgo"
{
  "data": {
    "reservationId": "reservation_uuid",
    "chargeId": "charge_uuid",
    "feeAmount": "25.00",
    "feeCurrency": "USD",
    "paymentStatusSnapshot": "chargeGenerated"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

Reglas:

* si ya existe `chargeId`, retornar el cargo existente o error controlado;
* no generar duplicados;
* no procesar pagos;
* no crear comprobantes.

Eventos:

```text id="u1fn9y"
reservation.chargeGenerated
reservation.chargeGenerationFailed
```

---

# 15. Reservations — Endpoints propios `/me`

## 15.1. Listar mis reservas

```http id="v6rhds"
GET /api/v1/me/reservations
```

Permiso:

```text id="z9gbv5"
reservations.read.own
```

Query params:

| Nombre           | Tipo      | Requerido | Descripción                |
| ---------------- | --------- | --------: | -------------------------- |
| `propertyUnitId` | string    |        No | Debe pertenecer al usuario |
| `commonAreaId`   | string    |        No | Área                       |
| `status`         | string    |        No | Estado                     |
| `dateFrom`       | date-time |        No | Inicio                     |
| `dateTo`         | date-time |        No | Fin                        |
| `page`           | number    |        No | Página                     |
| `pageSize`       | number    |        No | Tamaño                     |

Response 200:

```json id="baip2l"
{
  "data": [
    {
      "id": "reservation_uuid",
      "commonAreaId": "common_area_uuid",
      "commonAreaName": "Salón comunal",
      "propertyUnitId": "property_unit_uuid",
      "propertyUnitCode": "Casa 01",
      "startAt": "2026-08-20T14:00:00Z",
      "endAt": "2026-08-20T17:00:00Z",
      "status": "pendingApproval",
      "purpose": "Reunión familiar",
      "attendeeCount": 20,
      "requiresApproval": true,
      "requiresPayment": true,
      "feeAmount": "25.00",
      "feeCurrency": "USD",
      "paymentStatusSnapshot": "pendingCharge"
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

## 15.2. Crear reserva propia

```http id="g6wln1"
POST /api/v1/me/reservations
```

Permiso:

```text id="io81z9"
reservations.create.own
```

Request body:

```json id="x7sysb"
{
  "commonAreaId": "common_area_uuid",
  "propertyUnitId": "property_unit_uuid",
  "startAt": "2026-08-20T14:00:00Z",
  "endAt": "2026-08-20T17:00:00Z",
  "purpose": "Reunión familiar",
  "attendeeCount": 20
}
```

Response 201:

```json id="koacgs"
{
  "data": {
    "id": "reservation_uuid",
    "commonAreaId": "common_area_uuid",
    "commonAreaName": "Salón comunal",
    "propertyUnitId": "property_unit_uuid",
    "propertyUnitCode": "Casa 01",
    "startAt": "2026-08-20T14:00:00Z",
    "endAt": "2026-08-20T17:00:00Z",
    "status": "pendingApproval",
    "purpose": "Reunión familiar",
    "attendeeCount": 20,
    "requiresApproval": true,
    "requiresPayment": true,
    "feeAmount": "25.00",
    "feeCurrency": "USD",
    "paymentStatusSnapshot": "pendingCharge"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

Reglas:

* `propertyUnitId` debe pertenecer al usuario autenticado;
* no puede usar unidad ajena;
* no puede crear reserva en área inactiva/no reservable;
* debe respetar disponibilidad;
* debe evitar conflictos;
* debe aplicar estado según política.

---

## 15.3. Obtener reserva propia

```http id="v040gl"
GET /api/v1/me/reservations/{reservationId}
```

Permiso:

```text id="wqjog0"
reservations.read.own
```

Regla:

```text id="hqko5s"
La reserva debe estar asociada a una unidad accesible por el usuario.
```

---

## 15.4. Cancelar reserva propia

```http id="pz3vg5"
POST /api/v1/me/reservations/{reservationId}/cancel
```

Permiso:

```text id="k6dsll"
reservations.cancel.own
```

Request body:

```json id="il3eei"
{
  "reason": "Cambio de planes."
}
```

Reglas:

* reserva propia;
* estado cancelable;
* cumple `cancellationLimitHours`;
* no revierte cargo automáticamente;
* audita operación.

---

# 16. Calendar

## 16.1. Calendario administrativo

```http id="o8ulxt"
GET /api/v1/tenant/common-areas/{commonAreaId}/calendar
```

Permiso:

```text id="skyv9s"
reservations.readCalendar
```

Query params:

| Nombre                | Tipo    | Requerido | Descripción             |
| --------------------- | ------- | --------: | ----------------------- |
| `dateFrom`            | date    |        Sí | Fecha inicial           |
| `dateTo`              | date    |        Sí | Fecha final             |
| `timezone`            | string  |        No | Default tenant timezone |
| `includeAvailability` | boolean |        No | Default `true`          |
| `includeBlackouts`    | boolean |        No | Default `true`          |

Response 200:

```json id="npfek7"
{
  "data": {
    "commonAreaId": "common_area_uuid",
    "from": "2026-08-01",
    "to": "2026-08-31",
    "timezone": "America/Guayaquil",
    "availabilityWindows": [
      {
        "dayOfWeek": "saturday",
        "startTime": "08:00",
        "endTime": "18:00"
      }
    ],
    "blackouts": [
      {
        "id": "blackout_uuid",
        "startAt": "2026-08-15T08:00:00Z",
        "endAt": "2026-08-15T18:00:00Z",
        "status": "active",
        "reason": "Mantenimiento programado"
      }
    ],
    "reservations": [
      {
        "id": "reservation_uuid",
        "startAt": "2026-08-20T14:00:00Z",
        "endAt": "2026-08-20T17:00:00Z",
        "status": "approved",
        "propertyUnitId": "property_unit_uuid",
        "propertyUnitCode": "Casa 01",
        "label": "Reserva aprobada"
      }
    ]
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 16.2. Calendario propio

```http id="vnntpx"
GET /api/v1/me/common-areas/{commonAreaId}/calendar
```

Permiso:

```text id="beq0x9"
reservations.readCalendar.own
```

Query params:

| Nombre     | Tipo   | Requerido | Descripción             |
| ---------- | ------ | --------: | ----------------------- |
| `dateFrom` | date   |        Sí | Fecha inicial           |
| `dateTo`   | date   |        Sí | Fecha final             |
| `timezone` | string |        No | Default tenant timezone |

Response 200:

```json id="v3swz6"
{
  "data": {
    "commonAreaId": "common_area_uuid",
    "from": "2026-08-01",
    "to": "2026-08-31",
    "timezone": "America/Guayaquil",
    "availabilityWindows": [
      {
        "dayOfWeek": "saturday",
        "startTime": "08:00",
        "endTime": "18:00"
      }
    ],
    "blackouts": [
      {
        "startAt": "2026-08-15T08:00:00Z",
        "endAt": "2026-08-15T18:00:00Z",
        "status": "active",
        "label": "unavailable"
      }
    ],
    "reservations": [
      {
        "startAt": "2026-08-20T14:00:00Z",
        "endAt": "2026-08-20T17:00:00Z",
        "status": "busy",
        "label": "busy",
        "isOwn": false
      },
      {
        "id": "reservation_uuid",
        "startAt": "2026-08-22T14:00:00Z",
        "endAt": "2026-08-22T17:00:00Z",
        "status": "approved",
        "label": "Mi reserva",
        "isOwn": true
      }
    ]
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

Regla:

```text id="rxfblk"
Las reservas de terceros se muestran como busy, sin identidad, unidad, propósito ni notas.
```

---

# 17. Public Common Areas — WordPress

## 17.1. Listar áreas públicas

```http id="abn7o2"
GET /api/v1/public/tenants/{slug}/common-areas
```

Controlado por:

```text id="m9ribu"
009-wordpress-integration-basic
```

Fuente funcional:

```text id="v2g2no"
010-reservations-common-areas
```

Response 200:

```json id="uk3kvc"
{
  "data": [
    {
      "id": "public_common_area_id",
      "slug": "salon-comunal",
      "name": "Salón comunal",
      "description": "Espacio para eventos comunitarios.",
      "type": "hall",
      "capacity": 60,
      "coverImageUrl": "https://cdn.example.com/salon.jpg",
      "galleryUrls": [],
      "publicRulesSummary": "Uso sujeto a reglamento interno."
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

No debe devolver:

```text id="oaerii"
reservations
calendar
blackouts
availability windows completas
internalRules
propertyUnitId
requesterUserId
chargeId
paymentStatusSnapshot
audit data
```

---

## 17.2. Obtener área pública

```http id="p2bo5g"
GET /api/v1/public/tenants/{slug}/common-areas/{commonAreaSlug}
```

Response 200:

```json id="hju69p"
{
  "data": {
    "id": "public_common_area_id",
    "slug": "salon-comunal",
    "name": "Salón comunal",
    "description": "Espacio para eventos comunitarios.",
    "type": "hall",
    "capacity": 60,
    "coverImageUrl": "https://cdn.example.com/salon.jpg",
    "galleryUrls": [],
    "publicRulesSummary": "Uso sujeto a reglamento interno."
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 18. Matriz de endpoints

| Método | Ruta                                                                                 | Scope  | Auth | Permiso                          |
| ------ | ------------------------------------------------------------------------------------ | ------ | ---- | -------------------------------- |
| GET    | `/api/v1/tenant/common-areas`                                                        | tenant | Sí   | `commonAreas.read`               |
| POST   | `/api/v1/tenant/common-areas`                                                        | tenant | Sí   | `commonAreas.create`             |
| GET    | `/api/v1/tenant/common-areas/{commonAreaId}`                                         | tenant | Sí   | `commonAreas.read`               |
| PATCH  | `/api/v1/tenant/common-areas/{commonAreaId}`                                         | tenant | Sí   | `commonAreas.update`             |
| POST   | `/api/v1/tenant/common-areas/{commonAreaId}/activate`                                | tenant | Sí   | `commonAreas.update`             |
| POST   | `/api/v1/tenant/common-areas/{commonAreaId}/deactivate`                              | tenant | Sí   | `commonAreas.update`             |
| POST   | `/api/v1/tenant/common-areas/{commonAreaId}/mark-maintenance`                        | tenant | Sí   | `commonAreas.update`             |
| POST   | `/api/v1/tenant/common-areas/{commonAreaId}/archive`                                 | tenant | Sí   | `commonAreas.archive`            |
| GET    | `/api/v1/tenant/common-areas/{commonAreaId}/availability-windows`                    | tenant | Sí   | `commonAreas.read`               |
| POST   | `/api/v1/tenant/common-areas/{commonAreaId}/availability-windows`                    | tenant | Sí   | `commonAreas.manageAvailability` |
| PATCH  | `/api/v1/tenant/common-areas/{commonAreaId}/availability-windows/{windowId}`         | tenant | Sí   | `commonAreas.manageAvailability` |
| POST   | `/api/v1/tenant/common-areas/{commonAreaId}/availability-windows/{windowId}/archive` | tenant | Sí   | `commonAreas.manageAvailability` |
| GET    | `/api/v1/tenant/common-areas/{commonAreaId}/blackouts`                               | tenant | Sí   | `commonAreas.read`               |
| POST   | `/api/v1/tenant/common-areas/{commonAreaId}/blackouts`                               | tenant | Sí   | `commonAreas.manageBlackouts`    |
| POST   | `/api/v1/tenant/common-areas/{commonAreaId}/blackouts/{blackoutId}/cancel`           | tenant | Sí   | `commonAreas.manageBlackouts`    |
| GET    | `/api/v1/tenant/reservations`                                                        | tenant | Sí   | `reservations.read`              |
| POST   | `/api/v1/tenant/reservations`                                                        | tenant | Sí   | `reservations.create`            |
| GET    | `/api/v1/tenant/reservations/{reservationId}`                                        | tenant | Sí   | `reservations.read`              |
| POST   | `/api/v1/tenant/reservations/{reservationId}/approve`                                | tenant | Sí   | `reservations.approve`           |
| POST   | `/api/v1/tenant/reservations/{reservationId}/reject`                                 | tenant | Sí   | `reservations.reject`            |
| POST   | `/api/v1/tenant/reservations/{reservationId}/cancel`                                 | tenant | Sí   | `reservations.cancel`            |
| POST   | `/api/v1/tenant/reservations/{reservationId}/complete`                               | tenant | Sí   | `reservations.complete`          |
| POST   | `/api/v1/tenant/reservations/{reservationId}/mark-no-show`                           | tenant | Sí   | `reservations.markNoShow`        |
| POST   | `/api/v1/tenant/reservations/{reservationId}/generate-charge`                        | tenant | Sí   | `reservations.generateCharge`    |
| GET    | `/api/v1/me/reservations`                                                            | own    | Sí   | `reservations.read.own`          |
| POST   | `/api/v1/me/reservations`                                                            | own    | Sí   | `reservations.create.own`        |
| GET    | `/api/v1/me/reservations/{reservationId}`                                            | own    | Sí   | `reservations.read.own`          |
| POST   | `/api/v1/me/reservations/{reservationId}/cancel`                                     | own    | Sí   | `reservations.cancel.own`        |
| GET    | `/api/v1/tenant/common-areas/{commonAreaId}/calendar`                                | tenant | Sí   | `reservations.readCalendar`      |
| GET    | `/api/v1/me/common-areas/{commonAreaId}/calendar`                                    | own    | Sí   | `reservations.readCalendar.own`  |
| GET    | `/api/v1/public/tenants/{slug}/common-areas`                                         | public | No   | —                                |
| GET    | `/api/v1/public/tenants/{slug}/common-areas/{commonAreaSlug}`                        | public | No   | —                                |

---

# 19. Catálogo de errores

| Código                                   | HTTP | Descripción                          |
| ---------------------------------------- | ---: | ------------------------------------ |
| `COMMON_AREA_NOT_FOUND`                  |  404 | Área no encontrada o no accesible    |
| `COMMON_AREA_NOT_RESERVABLE`             |  422 | Área no reservable                   |
| `COMMON_AREA_INACTIVE`                   |  422 | Área inactiva                        |
| `COMMON_AREA_MAINTENANCE`                |  422 | Área en mantenimiento                |
| `COMMON_AREA_DUPLICATE_CODE`             |  409 | Código duplicado en tenant           |
| `COMMON_AREA_DUPLICATE_SLUG`             |  409 | Slug duplicado en tenant             |
| `AVAILABILITY_WINDOW_NOT_FOUND`          |  404 | Ventana no encontrada                |
| `AVAILABILITY_WINDOW_INVALID`            |  422 | Ventana inválida                     |
| `BLACKOUT_NOT_FOUND`                     |  404 | Blackout no encontrado               |
| `BLACKOUT_INVALID_RANGE`                 |  422 | Rango inválido                       |
| `RESERVATION_NOT_FOUND`                  |  404 | Reserva no encontrada o no accesible |
| `RESERVATION_FORBIDDEN`                  |  403 | Usuario sin acceso a la reserva      |
| `RESERVATION_CONFLICT`                   |  409 | Solapamiento con reserva activa      |
| `RESERVATION_BLACKOUT_CONFLICT`          |  409 | Solapamiento con blackout            |
| `RESERVATION_OUTSIDE_AVAILABILITY`       |  422 | Fuera de ventana disponible          |
| `RESERVATION_INVALID_TRANSITION`         |  409 | Transición de estado inválida        |
| `RESERVATION_INVALID_TIME_RANGE`         |  422 | Rango de tiempo inválido             |
| `RESERVATION_CROSSES_MIDNIGHT`           |  422 | Reserva cruza medianoche local       |
| `RESERVATION_DURATION_TOO_SHORT`         |  422 | Duración menor al mínimo             |
| `RESERVATION_DURATION_TOO_LONG`          |  422 | Duración mayor al máximo             |
| `RESERVATION_ADVANCE_LIMIT_EXCEEDED`     |  422 | Anticipación máxima excedida         |
| `RESERVATION_CAPACITY_EXCEEDED`          |  422 | Capacidad excedida                   |
| `RESERVATION_CANCELLATION_WINDOW_CLOSED` |  409 | Cancelación fuera del plazo          |
| `RESERVATION_UNIT_FORBIDDEN`             |  403 | Unidad no pertenece al usuario       |
| `RESERVATION_CROSS_TENANT_REFERENCE`     |  403 | Referencia cruza tenants             |
| `RESERVATION_CHARGE_CONCEPT_REQUIRED`    |  422 | Concepto de cargo requerido          |
| `RESERVATION_CHARGE_ALREADY_GENERATED`   |  409 | Cargo ya generado                    |
| `RESERVATION_CHARGE_GENERATION_FAILED`   |  500 | Falló generación de cargo            |
| `VALIDATION_ERROR`                       |  422 | Error de validación                  |
| `UNAUTHORIZED`                           |  401 | No autenticado                       |
| `FORBIDDEN`                              |  403 | Sin permiso                          |
| `RATE_LIMITED`                           |  429 | Rate limit                           |
| `INTERNAL_ERROR`                         |  500 | Error interno                        |

---

# 20. Ejemplos de errores

## 20.1. Conflicto de reserva

```json id="d28dro"
{
  "error": {
    "code": "RESERVATION_CONFLICT",
    "message": "The requested time range conflicts with an existing reservation.",
    "details": {
      "commonAreaId": "common_area_uuid",
      "startAt": "2026-08-20T14:00:00Z",
      "endAt": "2026-08-20T17:00:00Z"
    },
    "traceId": "req_123456"
  }
}
```

---

## 20.2. Fuera de disponibilidad

```json id="kl2asf"
{
  "error": {
    "code": "RESERVATION_OUTSIDE_AVAILABILITY",
    "message": "The requested time range is outside the configured availability window.",
    "details": {
      "commonAreaId": "common_area_uuid"
    },
    "traceId": "req_123456"
  }
}
```

---

## 20.3. Unidad no autorizada

```json id="zmmrlz"
{
  "error": {
    "code": "RESERVATION_UNIT_FORBIDDEN",
    "message": "You are not allowed to create reservations for this property unit.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

## 20.4. Transición inválida

```json id="se9guk"
{
  "error": {
    "code": "RESERVATION_INVALID_TRANSITION",
    "message": "The reservation cannot transition from cancelled to approved.",
    "details": {
      "fromStatus": "cancelled",
      "toStatus": "approved"
    },
    "traceId": "req_123456"
  }
}
```

---

## 20.5. Cargo ya generado

```json id="j6c34n"
{
  "error": {
    "code": "RESERVATION_CHARGE_ALREADY_GENERATED",
    "message": "This reservation already has an associated charge.",
    "details": {
      "reservationId": "reservation_uuid",
      "chargeId": "charge_uuid"
    },
    "traceId": "req_123456"
  }
}
```

---

# 21. Reglas de seguridad por contrato

## 21.1. Endpoints administrativos

Deben aplicar:

```text id="o46pe5"
AuthGuard
TenantGuard
TenantPermissionGuard
permission checks
tenant_id filter
safe DTO validation
audit events
safe errors
```

---

## 21.2. Endpoints `/me`

Deben aplicar:

```text id="c7dpqo"
AuthGuard
TenantGuard
TenantPermissionGuard
OwnReservationGuard
property unit access validation
no third-party personal data exposure
```

---

## 21.3. Endpoints públicos

Deben aplicar:

```text id="clw85j"
public-safe DTO
tenant by slug
CORS policy from 009
rate limiting
cache safe headers
no reservation data
no calendar data
no private data
```

---

# 22. Auditoría

## 22.1. Eventos obligatorios

```text id="c999bg"
commonArea.created
commonArea.updated
commonArea.activated
commonArea.deactivated
commonArea.markedMaintenance
commonArea.archived
commonAreaAvailability.created
commonAreaAvailability.updated
commonAreaAvailability.archived
commonAreaBlackout.created
commonAreaBlackout.cancelled
reservation.created
reservation.requested
reservation.approved
reservation.rejected
reservation.cancelled
reservation.completed
reservation.noShow
reservation.expired
reservation.chargeGenerated
reservation.chargeGenerationFailed
reservation.conflictDetected
```

---

## 22.2. Metadata permitida

```json id="i7kmxb"
{
  "commonAreaId": "common_area_uuid",
  "reservationId": "reservation_uuid",
  "propertyUnitId": "property_unit_uuid",
  "fromStatus": "requested",
  "toStatus": "approved",
  "startAt": "2026-08-20T14:00:00Z",
  "endAt": "2026-08-20T17:00:00Z",
  "chargeId": "charge_uuid",
  "traceId": "req_123456"
}
```

---

## 22.3. Metadata prohibida

```text id="gdsf4y"
payload completo
tokens
secretos
cookies
comprobantes
datos personales innecesarios
datos financieros detallados no necesarios
```

---

# 23. Observabilidad

## 23.1. Logs sugeridos

```text id="whzl5b"
commonArea.created
commonArea.updated
commonArea.archived
reservation.created
reservation.approved
reservation.rejected
reservation.cancelled
reservation.completed
reservation.noShow
reservation.conflictDetected
reservation.chargeGenerated
reservation.chargeGenerationFailed
calendar.query.executed
calendar.query.failed
```

---

## 23.2. Métricas sugeridas

```text id="zx3qor"
reservations_created_total
reservations_approved_total
reservations_rejected_total
reservations_cancelled_total
reservations_completed_total
reservations_no_show_total
reservations_conflict_total
reservations_charge_generated_total
reservations_charge_generation_failed_total
common_area_calendar_query_latency_ms
```

Labels permitidos:

```text id="o2xndj"
status
action
outcome
areaType
```

Labels prohibidos:

```text id="u5vxdm"
tenantId
reservationId
commonAreaId
propertyUnitId
personId
userId
traceId
```

---

# 24. OpenAPI

## 24.1. Tags sugeridos

```text id="fvvu7m"
Common Areas
Common Area Availability
Common Area Blackouts
Reservations
My Reservations
Common Area Calendar
Public Common Areas
```

---

## 24.2. Extensiones OpenAPI sugeridas

### Endpoint tenant

```yaml id="av4ywn"
x-tenant-scope: true
x-auth-required: true
x-required-permission: reservations.approve
x-audit-event: reservation.approved
```

---

### Endpoint `/me`

```yaml id="fpjiwh"
x-tenant-scope: true
x-auth-required: true
x-own-resource: true
x-required-permission: reservations.create.own
```

---

### Endpoint público

```yaml id="fr96bp"
x-public-safe: true
x-auth-required: false
x-no-reservation-data: true
x-no-calendar-data: true
x-no-private-personal-data: true
x-controlled-by: 009-wordpress-integration-basic
```

---

## 24.3. OpenAPI no debe documentar

```text id="t11duk"
POST /api/v1/public/tenants/{slug}/common-areas
POST /api/v1/public/tenants/{slug}/reservations
GET /api/v1/public/tenants/{slug}/calendar
GET /api/v1/public/tenants/{slug}/reservations
endpoints públicos de pago de reservas
endpoints públicos de comprobantes
endpoints públicos de estados de cuenta
```

---

# 25. Casos borde del contrato

| Caso                               | Resultado esperado            |
| ---------------------------------- | ----------------------------- |
| Área inexistente                   | 404                           |
| Área de otro tenant                | 404/403                       |
| Área inactiva                      | 422                           |
| Área en mantenimiento              | 422                           |
| Área no reservable                 | 422                           |
| Código de área duplicado           | 409                           |
| Slug de área duplicado             | 409                           |
| Ventana con `startTime >= endTime` | 422                           |
| Blackout con `startAt >= endAt`    | 422                           |
| Reserva fuera de horario           | 422                           |
| Reserva solapada                   | 409                           |
| Reserva sobre blackout             | 409                           |
| Reserva cruza medianoche local     | 422                           |
| Duración menor al mínimo           | 422                           |
| Duración mayor al máximo           | 422                           |
| Anticipación excedida              | 422                           |
| Capacidad excedida                 | 422                           |
| Unidad ajena en `/me`              | 403                           |
| Usuario sin permiso                | 403                           |
| Aprobar reserva cancelada          | 409                           |
| Rechazar reserva aprobada          | 409                           |
| Cancelar reserva completada        | 409                           |
| Cancelar fuera de plazo            | 409                           |
| Generar cargo sin concepto         | 422                           |
| Generar cargo duplicado            | 409 o 200 con cargo existente |
| WordPress solicita calendario      | endpoint no existe            |
| WordPress intenta crear reserva    | endpoint no existe            |
| Pago desde reservas                | endpoint no existe            |

---

# 26. Pruebas de contrato requeridas

## 26.1. Common Areas

```text id="otcfwg"
GET /api/v1/tenant/common-areas
POST /api/v1/tenant/common-areas
GET /api/v1/tenant/common-areas/{commonAreaId}
PATCH /api/v1/tenant/common-areas/{commonAreaId}
POST /api/v1/tenant/common-areas/{commonAreaId}/activate
POST /api/v1/tenant/common-areas/{commonAreaId}/deactivate
POST /api/v1/tenant/common-areas/{commonAreaId}/mark-maintenance
POST /api/v1/tenant/common-areas/{commonAreaId}/archive
```

Casos mínimos:

* 401 sin token;
* 403 sin permiso;
* 200/201 con permiso;
* 409 duplicado;
* 422 tarifa inválida;
* audit event.

---

## 26.2. Availability

```text id="kg55yu"
GET /availability-windows
POST /availability-windows
PATCH /availability-windows/{windowId}
POST /availability-windows/{windowId}/archive
```

Casos mínimos:

* ventana válida;
* ventana inválida;
* área de otro tenant;
* permisos;
* audit event.

---

## 26.3. Blackouts

```text id="bk5h29"
GET /blackouts
POST /blackouts
POST /blackouts/{blackoutId}/cancel
```

Casos mínimos:

* blackout válido;
* rango inválido;
* razón obligatoria;
* cancelación;
* permisos;
* audit event.

---

## 26.4. Reservations administrativas

```text id="m3jl27"
GET /api/v1/tenant/reservations
POST /api/v1/tenant/reservations
GET /api/v1/tenant/reservations/{reservationId}
POST /api/v1/tenant/reservations/{reservationId}/approve
POST /api/v1/tenant/reservations/{reservationId}/reject
POST /api/v1/tenant/reservations/{reservationId}/cancel
POST /api/v1/tenant/reservations/{reservationId}/complete
POST /api/v1/tenant/reservations/{reservationId}/mark-no-show
POST /api/v1/tenant/reservations/{reservationId}/generate-charge
```

Casos mínimos:

* crear reserva válida;
* bloquear solapamiento;
* bloquear blackout;
* validar transiciones;
* generar cargo idempotente;
* no procesar pago;
* audit event.

---

## 26.5. Reservations propias

```text id="s2hwrc"
GET /api/v1/me/reservations
POST /api/v1/me/reservations
GET /api/v1/me/reservations/{reservationId}
POST /api/v1/me/reservations/{reservationId}/cancel
```

Casos mínimos:

* usuario ve solo reservas propias;
* usuario no usa unidad ajena;
* usuario no cancela reserva ajena;
* límite de cancelación;
* no exposición de datos de terceros.

---

## 26.6. Calendar

```text id="l2n6gz"
GET /api/v1/tenant/common-areas/{commonAreaId}/calendar
GET /api/v1/me/common-areas/{commonAreaId}/calendar
```

Casos mínimos:

* rango válido;
* rango mayor a 31 días falla;
* admin ve detalle permitido;
* usuario ve terceros como `busy`;
* no exposición de datos personales de terceros.

---

## 26.7. Public Common Areas

```text id="ochg8n"
GET /api/v1/public/tenants/{slug}/common-areas
GET /api/v1/public/tenants/{slug}/common-areas/{commonAreaSlug}
```

Casos mínimos:

* solo áreas activas y públicas;
* no internalRules;
* no reservas;
* no calendario;
* no datos financieros privados;
* no datos personales.

---

# 27. Decisión final del contrato API

El módulo `010-reservations-common-areas` expondrá endpoints REST para:

```text id="y3tlo7"
1. Gestión administrativa de áreas comunales.
2. Gestión de ventanas de disponibilidad.
3. Gestión de blackouts.
4. Gestión administrativa de reservas.
5. Gestión de reservas propias.
6. Consulta de calendario administrativa y propia.
7. Catálogo público limitado de áreas para WordPress.
```

El contrato API debe garantizar:

```text id="npcbe1"
tenant isolation
permissioned access
own-resource authorization
safe state transitions
conflict detection
blackout validation
availability validation
Decimal money as string
idempotent charge generation
no payment processing
audit trail
privacy-safe calendar
public-safe WordPress exposure
OpenAPI consistency
```

La implementación no debe aceptarse si permite doble reserva, mezcla tenants, permite reservas sobre unidades ajenas, expone reservas privadas a WordPress, expone calendario interno públicamente, genera cargos duplicados, usa float para dinero, procesa pagos directamente, elimina historial o permite transiciones de estado no autorizadas.
