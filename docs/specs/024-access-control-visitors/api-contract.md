# API Contract — 024 Access Control and Visitors

## 1. Información del documento

| Campo           | Valor                                                                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                             |
| Spec ID         | 024                                                                                                                                       |
| Módulo          | Access Control and Visitors                                                                                                               |
| Documento       | API Contract                                                                                                                              |
| Ruta            | `docs/specs/024-access-control-visitors/api-contract.md`                                                                                  |
| Versión         | 0.1                                                                                                                                       |
| Estado          | needs-review                                                                                                                              |
| Fecha           | 2026-07-30                                                                                                                                |
| Documento base  | `docs/specs/024-access-control-visitors/spec.md`                                                                                          |
| Plan técnico    | `docs/specs/024-access-control-visitors/plan.md`                                                                                          |
| Modelo de datos | `docs/specs/024-access-control-visitors/data-model.md`                                                                                    |
| API Style       | REST                                                                                                                                      |
| Base path       | `/api/v1`                                                                                                                                 |
| Formato         | JSON                                                                                                                                      |
| Autenticación   | Bearer Token / Keycloak OIDC                                                                                                              |
| Autorización    | RESIDENT Core tenant-aware permissions                                                                                                    |
| Naturaleza      | Tenant-scoped / Security-sensitive / Privacy-sensitive / Visitor-driven / Resident-authorized / Guard-operated / Audit-heavy / Non-public |

---

## 2. Propósito

Este documento define el contrato API del módulo `024-access-control-visitors`.

El contrato cubre endpoints, DTOs, responses, errores, permisos, validaciones, superficies API, límites de privacidad, reglas de autorización, OpenAPI extensions, auditoría, observabilidad e integraciones internas para gestionar control de acceso y visitantes dentro de RESIDENT Core.

Regla central del contrato:

```text
Toda API de Access Control and Visitors debe ser autenticada, tenant-scoped, permission-based, privacy-safe, audit-heavy y explícitamente no pública; debe permitir operación administrativa, operación de guardia y acceso /me limitado para residentes, sin exponer datos completos de identificación, placas, códigos, storageKey, signedUrl persistente, biometría, reconocimiento facial, apertura automática de portones, control físico de hardware, acceso WordPress público ni IA externa con datos reales.
```

---

## 3. Convenciones generales

### 3.1. Base URL

```text
/api/v1
```

---

### 3.2. Superficies API permitidas

```text
Tenant Admin API:
  /api/v1/tenant/access-*

Guard API:
  /api/v1/tenant/guard/access-*

Own User API:
  /api/v1/me/access-*
```

---

### 3.3. Superficies API prohibidas

No se implementan endpoints públicos:

```text
/api/v1/public/access-*
/api/v1/public/tenants/{slug}/access-*
```

Respuesta esperada:

```http
404 Not Found
```

---

### 3.4. Content-Type

```http
Content-Type: application/json
Accept: application/json
```

---

### 3.5. Fechas

Todas las fechas se reciben y devuelven en ISO 8601 UTC.

Ejemplo:

```json
{
  "checkedInAt": "2026-07-30T19:31:00.000Z"
}
```

---

### 3.6. Campos JSON

API JSON:

```text
camelCase
```

Base de datos:

```text
snake_case
```

---

### 3.7. Response envelope

Respuesta simple:

```json
{
  "data": {
    "id": "uuid"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Respuesta paginada:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 100,
    "traceId": "trace-id"
  }
}
```

Error estándar:

```json
{
  "error": {
    "code": "ACCESS_VISITOR_NOT_FOUND",
    "message": "Visitor not found.",
    "details": {},
    "traceId": "trace-id"
  }
}
```

---

## 4. Autenticación

Todos los endpoints permitidos requieren:

```http
Authorization: Bearer <access_token>
```

Reglas:

```text
- Keycloak autentica.
- RESIDENT Core resuelve UserProfile.
- RESIDENT Core resuelve TenantMembership.
- RESIDENT Core resuelve currentTenant.
- RESIDENT Core autoriza por permisos, recurso y relación propia.
```

Prohibido:

```text
- API anónima.
- API key pública.
- token por query string.
- autenticación delegada a WordPress.
- userId enviado por cliente como actor.
- tenantId enviado por cliente como autoridad.
```

---

## 5. Tenant context

El tenant se resuelve server-side desde el contexto autenticado.

No se acepta `tenantId` en body, query o path para operaciones tenant ordinarias.

Prohibido:

```json
{
  "tenantId": "uuid"
}
```

Respuesta esperada:

```http
422 Unprocessable Entity
```

Regla cross-tenant:

```text
Si un recurso existe pero pertenece a otro tenant, la API debe responder 404 Not Found.
```

---

## 6. Paginación, filtros y ordenamiento

### 6.1. Parámetros estándar

```text
page
pageSize
sortBy
sortDirection
```

Reglas:

```text
- page inicia en 1.
- pageSize default = 25.
- pageSize máximo = 100.
- sortDirection = asc | desc.
- sortBy debe pertenecer a whitelist por endpoint.
```

---

### 6.2. Filtros de fecha

```text
dateFrom
dateTo
```

Regla:

```text
dateFrom <= dateTo
```

---

### 6.3. Búsquedas sensibles

Para búsquedas por identificación, teléfono, placa o código:

```text
- El cliente puede enviar valor raw temporal.
- El backend normaliza.
- El backend calcula HMAC/hash tenant-aware.
- La búsqueda se hace contra hash.
- El valor raw no se persiste.
- El valor raw no se loggea.
- El hash no se devuelve por API.
```

---

## 7. Permisos

### 7.1. Visitantes

```text
accessVisitors.create
accessVisitors.read
accessVisitors.update
accessVisitors.archive
accessVisitors.block
accessVisitors.watchlist
```

---

### 7.2. Vehículos visitantes

```text
accessVisitorVehicles.create
accessVisitorVehicles.read
accessVisitorVehicles.update
accessVisitorVehicles.archive
accessVisitorVehicles.block
accessVisitorVehicles.watchlist
```

---

### 7.3. Gates

```text
accessGates.create
accessGates.read
accessGates.update
accessGates.archive
```

---

### 7.4. Autorizaciones

```text
accessAuthorizations.create
accessAuthorizations.read
accessAuthorizations.cancel
accessAuthorizations.revoke
accessAuthorizations.expire
accessAuthorizations.own.create
accessAuthorizations.own.read
accessAuthorizations.own.cancel
```

---

### 7.5. Pases

```text
accessPasses.create
accessPasses.read
accessPasses.validate
accessPasses.revoke
```

---

### 7.6. Eventos, check-in y check-out

```text
accessEvents.read
accessEvents.correct
accessEvents.void

accessCheckIns.create
accessCheckIns.read
accessCheckIns.manualOverride
accessCheckIns.void

accessCheckOuts.create
accessCheckOuts.read
accessCheckOuts.manualOverride
accessCheckOuts.void
```

---

### 7.7. Guard API

```text
guardAccess.authorizations.read
guardAccess.pass.validate
guardAccess.checkIns.create
guardAccess.checkOuts.create
guardAccess.events.recent.read
guardAccess.deniedAccess.create
guardAccess.incidents.create
guardAccess.deliveries.create
```

---

### 7.8. Entregas y proveedores visitantes

```text
accessDeliveries.create
accessDeliveries.read
accessDeliveries.update
accessDeliveries.close
accessDeliveries.archive

accessSupplierVisits.create
accessSupplierVisits.read
accessSupplierVisits.update
accessSupplierVisits.close
accessSupplierVisits.cancel
accessSupplierVisits.deny
accessSupplierVisits.archive
```

---

### 7.9. Recurrentes, comentarios, documentos y reportes

```text
accessRecurringAuthorizations.create
accessRecurringAuthorizations.read
accessRecurringAuthorizations.cancel
accessRecurringAuthorizations.revoke
accessRecurringAuthorizations.archive

accessComments.create
accessComments.read
accessComments.archive

accessDocuments.create
accessDocuments.read
accessDocuments.archive
accessDocuments.download

accessReports.events
accessReports.visitors
accessReports.authorizations
accessReports.incidents
accessReports.openCheckIns
accessReports.deliveries
accessReports.supplierVisits
accessReports.exports
```

---

# 8. Endpoints — Visitor Profiles

## 8.1. List visitors

```http
GET /api/v1/tenant/access-visitors
```

Permiso:

```text
accessVisitors.read
```

Query params:

```text
status
visitorType
search
identificationNumber
phone
createdFrom
createdTo
page
pageSize
sortBy
sortDirection
```

Reglas:

```text
- identificationNumber se usa solo para búsqueda hash.
- phone se usa solo para búsqueda hash.
- No se devuelven valores raw.
- Results son tenant-scoped.
```

Response:

```json
{
  "data": [
    {
      "id": "uuid",
      "fullName": "Juan Pérez",
      "identificationType": "cedula",
      "identificationNumberMasked": "17******90",
      "phoneMasked": "09*****321",
      "visitorType": "guest",
      "status": "active",
      "createdAt": "2026-07-30T19:31:00.000Z",
      "updatedAt": "2026-07-30T19:31:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 1,
    "traceId": "trace-id"
  }
}
```

---

## 8.2. Create visitor

```http
POST /api/v1/tenant/access-visitors
```

Permiso:

```text
accessVisitors.create
```

Request:

```json
{
  "fullName": "Juan Pérez",
  "identificationType": "cedula",
  "identificationNumber": "1723456790",
  "phone": "0991234321",
  "visitorType": "guest",
  "notes": "Visitante frecuente de la unidad A-101."
}
```

Reglas:

```text
- identificationNumber es raw temporal.
- phone es raw temporal.
- Backend genera masked/hash.
- raw no se persiste.
- raw no se devuelve.
- notes se sanitiza.
```

Response:

```http
201 Created
```

```json
{
  "data": {
    "id": "uuid",
    "fullName": "Juan Pérez",
    "identificationType": "cedula",
    "identificationNumberMasked": "17******90",
    "phoneMasked": "09*****321",
    "visitorType": "guest",
    "status": "active",
    "createdAt": "2026-07-30T19:31:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 8.3. Get visitor

```http
GET /api/v1/tenant/access-visitors/{visitorId}
```

Permiso:

```text
accessVisitors.read
```

Response:

```json
{
  "data": {
    "id": "uuid",
    "fullName": "Juan Pérez",
    "identificationType": "cedula",
    "identificationNumberMasked": "17******90",
    "phoneMasked": "09*****321",
    "visitorType": "guest",
    "status": "active",
    "watchlistReason": null,
    "blockReason": null,
    "notes": "Visitante frecuente de la unidad A-101.",
    "createdAt": "2026-07-30T19:31:00.000Z",
    "updatedAt": "2026-07-30T19:31:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

No debe devolver:

```text
identificationNumber
identificationNumberHash
phone
phoneHash
emailHash
raw values
```

---

## 8.4. Update visitor

```http
PATCH /api/v1/tenant/access-visitors/{visitorId}
```

Permiso:

```text
accessVisitors.update
```

Request:

```json
{
  "fullName": "Juan Carlos Pérez",
  "phone": "0991234321",
  "visitorType": "family",
  "notes": "Actualización solicitada por administración."
}
```

Prohibido:

```json
{
  "tenantId": "uuid",
  "status": "blockedTenant",
  "createdBy": "uuid",
  "identificationNumberHash": "hash"
}
```

---

## 8.5. Watchlist visitor

```http
POST /api/v1/tenant/access-visitors/{visitorId}/watchlist
```

Permiso:

```text
accessVisitors.watchlist
```

Request:

```json
{
  "reason": "Requiere validación adicional en garita."
}
```

Response:

```json
{
  "data": {
    "id": "uuid",
    "status": "watchlistedTenant",
    "watchlistedAt": "2026-07-30T19:31:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 8.6. Block visitor

```http
POST /api/v1/tenant/access-visitors/{visitorId}/block
```

Permiso:

```text
accessVisitors.block
```

Request:

```json
{
  "reason": "Ingreso no autorizado previo registrado por seguridad."
}
```

Regla:

```text
blockedTenant es local al tenant y no se comparte globalmente.
```

---

## 8.7. Archive visitor

```http
POST /api/v1/tenant/access-visitors/{visitorId}/archive
```

Permiso:

```text
accessVisitors.archive
```

Request:

```json
{
  "archiveReason": "Registro duplicado consolidado."
}
```

---

# 9. Endpoints — Visitor Vehicles

## 9.1. List vehicles

```http
GET /api/v1/tenant/access-visitor-vehicles
```

Permiso:

```text
accessVisitorVehicles.read
```

Query params:

```text
status
vehicleType
visitorId
plate
page
pageSize
sortBy
sortDirection
```

Reglas:

```text
- plate se usa como raw temporal para búsqueda hash.
- plate raw no se persiste.
- plateHash no se devuelve.
```

---

## 9.2. Create vehicle

```http
POST /api/v1/tenant/access-visitor-vehicles
```

Permiso:

```text
accessVisitorVehicles.create
```

Request:

```json
{
  "visitorId": "uuid",
  "plate": "PBA1234",
  "vehicleType": "car",
  "vehicleColor": "Blanco",
  "vehicleBrand": "Toyota",
  "vehicleModel": "Corolla"
}
```

Response:

```http
201 Created
```

```json
{
  "data": {
    "id": "uuid",
    "visitorId": "uuid",
    "plateMasked": "PB*-***4",
    "vehicleType": "car",
    "vehicleColor": "Blanco",
    "vehicleBrand": "Toyota",
    "vehicleModel": "Corolla",
    "status": "active",
    "createdAt": "2026-07-30T19:31:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 9.3. Get vehicle

```http
GET /api/v1/tenant/access-visitor-vehicles/{vehicleId}
```

Permiso:

```text
accessVisitorVehicles.read
```

---

## 9.4. Update vehicle

```http
PATCH /api/v1/tenant/access-visitor-vehicles/{vehicleId}
```

Permiso:

```text
accessVisitorVehicles.update
```

Request:

```json
{
  "vehicleColor": "Gris",
  "vehicleBrand": "Toyota"
}
```

---

## 9.5. Watchlist vehicle

```http
POST /api/v1/tenant/access-visitor-vehicles/{vehicleId}/watchlist
```

Permiso:

```text
accessVisitorVehicles.watchlist
```

Request:

```json
{
  "reason": "Validar placa en próximos ingresos."
}
```

---

## 9.6. Block vehicle

```http
POST /api/v1/tenant/access-visitor-vehicles/{vehicleId}/block
```

Permiso:

```text
accessVisitorVehicles.block
```

Request:

```json
{
  "reason": "Vehículo asociado a incidente de seguridad."
}
```

---

## 9.7. Archive vehicle

```http
POST /api/v1/tenant/access-visitor-vehicles/{vehicleId}/archive
```

Permiso:

```text
accessVisitorVehicles.archive
```

Request:

```json
{
  "archiveReason": "Vehículo ya no utilizado."
}
```

---

# 10. Endpoints — Access Gates

## 10.1. List gates

```http
GET /api/v1/tenant/access-gates
```

Permiso:

```text
accessGates.read
```

Query params:

```text
status
gateType
search
page
pageSize
sortBy
sortDirection
```

---

## 10.2. Create gate

```http
POST /api/v1/tenant/access-gates
```

Permiso:

```text
accessGates.create
```

Request:

```json
{
  "gateCode": "MAIN_GATE",
  "gateName": "Garita principal",
  "gateType": "main",
  "description": "Ingreso principal del conjunto",
  "isEntryAllowed": true,
  "isExitAllowed": true
}
```

Response:

```http
201 Created
```

---

## 10.3. Get gate

```http
GET /api/v1/tenant/access-gates/{gateId}
```

Permiso:

```text
accessGates.read
```

---

## 10.4. Update gate

```http
PATCH /api/v1/tenant/access-gates/{gateId}
```

Permiso:

```text
accessGates.update
```

Request:

```json
{
  "gateName": "Garita principal actualizada",
  "isEntryAllowed": true,
  "isExitAllowed": true
}
```

Prohibido:

```json
{
  "gateOpenCommand": true,
  "hardwareDeviceCommand": "OPEN"
}
```

---

## 10.5. Archive gate

```http
POST /api/v1/tenant/access-gates/{gateId}/archive
```

Permiso:

```text
accessGates.archive
```

Request:

```json
{
  "archiveReason": "Punto de acceso deshabilitado permanentemente."
}
```

---

# 11. Endpoints — Access Authorizations

## 11.1. List authorizations

```http
GET /api/v1/tenant/access-authorizations
```

Permiso:

```text
accessAuthorizations.read
```

Query params:

```text
status
authorizationType
authorizationScope
visitorId
vehicleId
propertyUnitId
authorizedByUserId
validFrom
validUntil
dateFrom
dateTo
page
pageSize
sortBy
sortDirection
```

---

## 11.2. Create authorization

```http
POST /api/v1/tenant/access-authorizations
```

Permiso:

```text
accessAuthorizations.create
```

Request:

```json
{
  "visitorId": "uuid",
  "vehicleId": "uuid",
  "propertyUnitId": "uuid",
  "authorizationType": "oneTime",
  "authorizationScope": "unit",
  "validFrom": "2026-07-30T20:00:00.000Z",
  "validUntil": "2026-07-31T02:00:00.000Z",
  "maxEntries": 1,
  "reason": "Visita familiar autorizada por administración.",
  "generateAccessPass": true
}
```

Reglas:

```text
- visitorId debe pertenecer al tenant.
- vehicleId debe pertenecer al tenant si existe.
- propertyUnitId debe pertenecer al tenant si existe.
- validFrom < validUntil.
- maxEntries > 0 si se informa.
- authorizationNumber se genera server-side.
- authorizedByUserId se resuelve server-side.
```

Response:

```http
201 Created
```

```json
{
  "data": {
    "id": "uuid",
    "authorizationNumber": "AA-202607-000001",
    "visitorId": "uuid",
    "visitorName": "Juan Pérez",
    "vehicleId": "uuid",
    "vehiclePlateMasked": "PB*-***4",
    "propertyUnitId": "uuid",
    "authorizationType": "oneTime",
    "authorizationScope": "unit",
    "validFrom": "2026-07-30T20:00:00.000Z",
    "validUntil": "2026-07-31T02:00:00.000Z",
    "maxEntries": 1,
    "entriesUsed": 0,
    "status": "active",
    "accessPass": {
      "id": "uuid",
      "passCodeMasked": "AB**91",
      "passType": "shortCode",
      "expiresAt": "2026-07-31T02:00:00.000Z"
    },
    "createdAt": "2026-07-30T19:31:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

No debe devolver:

```text
passCodeRaw
passCodeHash
identificationNumberRaw
plateRaw
```

---

## 11.3. Get authorization

```http
GET /api/v1/tenant/access-authorizations/{authorizationId}
```

Permiso:

```text
accessAuthorizations.read
```

---

## 11.4. Cancel authorization

```http
POST /api/v1/tenant/access-authorizations/{authorizationId}/cancel
```

Permiso:

```text
accessAuthorizations.cancel
```

Request:

```json
{
  "cancelReason": "La visita fue cancelada por el residente."
}
```

Reglas:

```text
- Solo active/draft puede cancelarse.
- cancelled no permite ingreso.
- Pases activos asociados deben revocarse.
- Debe auditarse.
```

---

## 11.5. Revoke authorization

```http
POST /api/v1/tenant/access-authorizations/{authorizationId}/revoke
```

Permiso:

```text
accessAuthorizations.revoke
```

Request:

```json
{
  "revokeReason": "Revocación por incidente de seguridad."
}
```

Reglas:

```text
- Revoke es administrativo.
- Revoked no permite ingreso.
- Pases activos asociados deben revocarse.
- Debe auditarse.
```

---

# 12. Endpoints — Access Passes

## 12.1. List passes

```http
GET /api/v1/tenant/access-passes
```

Permiso:

```text
accessPasses.read
```

Query params:

```text
authorizationId
status
passType
expiresFrom
expiresTo
page
pageSize
sortBy
sortDirection
```

---

## 12.2. Create pass for authorization

```http
POST /api/v1/tenant/access-authorizations/{authorizationId}/passes
```

Permiso:

```text
accessPasses.create
```

Request:

```json
{
  "passType": "shortCode",
  "expiresAt": "2026-07-31T02:00:00.000Z"
}
```

Response:

```http
201 Created
```

```json
{
  "data": {
    "id": "uuid",
    "authorizationId": "uuid",
    "passCodeMasked": "AB**91",
    "passType": "shortCode",
    "expiresAt": "2026-07-31T02:00:00.000Z",
    "status": "active",
    "createdAt": "2026-07-30T19:31:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 12.3. Validate pass

```http
POST /api/v1/tenant/access-passes/validate
```

Permiso:

```text
accessPasses.validate
```

Request:

```json
{
  "passCode": "AB8291",
  "gateId": "uuid"
}
```

Response válido:

```json
{
  "data": {
    "valid": true,
    "authorizationId": "uuid",
    "visitorId": "uuid",
    "visitorName": "Juan Pérez",
    "vehicleId": "uuid",
    "vehiclePlateMasked": "PB*-***4",
    "propertyUnitId": "uuid",
    "authorizationType": "oneTime",
    "validUntil": "2026-07-31T02:00:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Response inválido:

```json
{
  "data": {
    "valid": false,
    "reasonCode": "ACCESS_PASS_EXPIRED"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Reglas:

```text
- passCode es raw temporal.
- passCode se hashea para búsqueda.
- passCode raw no se persiste.
- passCode raw no se loggea.
```

---

## 12.4. Revoke pass

```http
POST /api/v1/tenant/access-passes/{passId}/revoke
```

Permiso:

```text
accessPasses.revoke
```

Request:

```json
{
  "revokeReason": "Código comprometido."
}
```

---

# 13. Endpoints — Access Events

## 13.1. List events

```http
GET /api/v1/tenant/access-events
```

Permiso:

```text
accessEvents.read
```

Query params:

```text
eventType
eventStatus
visitorId
vehicleId
authorizationId
propertyUnitId
gateId
recordedByUserId
dateFrom
dateTo
page
pageSize
sortBy
sortDirection
```

Response:

```json
{
  "data": [
    {
      "id": "uuid",
      "eventNumber": "AE-202607-000001",
      "eventType": "checkIn",
      "eventStatus": "recorded",
      "visitorId": "uuid",
      "visitorName": "Juan Pérez",
      "vehicleId": "uuid",
      "vehiclePlateMasked": "PB*-***4",
      "propertyUnitId": "uuid",
      "gateId": "uuid",
      "gateName": "Garita principal",
      "occurredAt": "2026-07-30T19:31:00.000Z",
      "recordedByUserId": "uuid"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 1,
    "traceId": "trace-id"
  }
}
```

---

## 13.2. Get event

```http
GET /api/v1/tenant/access-events/{eventId}
```

Permiso:

```text
accessEvents.read
```

---

## 13.3. Correct event

```http
POST /api/v1/tenant/access-events/{eventId}/correct
```

Permiso:

```text
accessEvents.correct
```

Request:

```json
{
  "correctionReason": "Corrección de observación operativa.",
  "notes": "Se corrigió la nota visible del evento."
}
```

Reglas:

```text
- No cambia tenant.
- No cambia actor original.
- No borra historial.
- Debe auditarse.
```

---

## 13.4. Void event

```http
POST /api/v1/tenant/access-events/{eventId}/void
```

Permiso:

```text
accessEvents.void
```

Request:

```json
{
  "voidReason": "Evento registrado por error."
}
```

Reglas:

```text
- Requiere permiso reforzado.
- No elimina físicamente.
- Debe conservar trazabilidad.
```

---

# 14. Endpoints — Check-ins

## 14.1. List check-ins

```http
GET /api/v1/tenant/access-check-ins
```

Permiso:

```text
accessCheckIns.read
```

Query params:

```text
status
visitorId
vehicleId
authorizationId
propertyUnitId
gateId
entryMethod
checkedInFrom
checkedInTo
openOnly
page
pageSize
sortBy
sortDirection
```

---

## 14.2. Create check-in

```http
POST /api/v1/tenant/access-check-ins
```

Permiso:

```text
accessCheckIns.create
```

Request con autorización:

```json
{
  "authorizationId": "uuid",
  "accessPassCode": "AB8291",
  "gateId": "uuid",
  "entryMethod": "accessPass",
  "notes": "Ingreso validado en garita."
}
```

Request manual:

```json
{
  "visitorId": "uuid",
  "vehicleId": "uuid",
  "propertyUnitId": "uuid",
  "gateId": "uuid",
  "entryMethod": "manual",
  "manualReason": "Autorización verbal confirmada por administración.",
  "notes": "Ingreso manual autorizado."
}
```

Reglas:

```text
- checkedInAt se genera server-side.
- checkedInByUserId se resuelve server-side.
- Si authorizationId existe, debe estar active y vigente.
- Si accessPassCode existe, se valida por hash.
- entryMethod manual requiere manualReason.
- visitor blockedTenant se rechaza salvo override permitido.
- vehicle blockedTenant se rechaza salvo override permitido.
- Crea AccessEvent checkIn.
- Crea AccessCheckIn open.
- Marca AccessPass used si aplica.
- Incrementa entriesUsed en AccessAuthorization si aplica.
```

Response:

```http
201 Created
```

```json
{
  "data": {
    "id": "uuid",
    "accessEventId": "uuid",
    "eventNumber": "AE-202607-000001",
    "visitorId": "uuid",
    "visitorName": "Juan Pérez",
    "vehicleId": "uuid",
    "vehiclePlateMasked": "PB*-***4",
    "authorizationId": "uuid",
    "propertyUnitId": "uuid",
    "gateId": "uuid",
    "entryMethod": "accessPass",
    "checkedInAt": "2026-07-30T19:31:00.000Z",
    "status": "open"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 14.3. Get check-in

```http
GET /api/v1/tenant/access-check-ins/{checkInId}
```

Permiso:

```text
accessCheckIns.read
```

---

## 14.4. Void check-in

```http
POST /api/v1/tenant/access-check-ins/{checkInId}/void
```

Permiso:

```text
accessCheckIns.void
```

Request:

```json
{
  "voidReason": "Ingreso registrado por error."
}
```

Reglas:

```text
- No elimina físicamente.
- Debe auditarse.
- Si ya tiene check-out, requiere política reforzada.
```

---

# 15. Endpoints — Check-outs

## 15.1. List check-outs

```http
GET /api/v1/tenant/access-check-outs
```

Permiso:

```text
accessCheckOuts.read
```

Query params:

```text
status
visitorId
vehicleId
gateId
checkInId
checkedOutFrom
checkedOutTo
page
pageSize
sortBy
sortDirection
```

---

## 15.2. Create check-out

```http
POST /api/v1/tenant/access-check-outs
```

Permiso:

```text
accessCheckOuts.create
```

Request normal:

```json
{
  "checkInId": "uuid",
  "gateId": "uuid",
  "exitMethod": "normal",
  "notes": "Salida registrada sin novedades."
}
```

Request manual sin check-in:

```json
{
  "visitorId": "uuid",
  "vehicleId": "uuid",
  "gateId": "uuid",
  "exitMethod": "manual",
  "manualReason": "Salida registrada sin check-in previo por contingencia operativa."
}
```

Reglas:

```text
- checkedOutAt se genera server-side.
- checkedOutByUserId se resuelve server-side.
- checkInId debe pertenecer al tenant si existe.
- No se permite doble check-out activo para el mismo check-in.
- Si checkInId existe, se cierra AccessCheckIn.
- Crea AccessEvent checkOut.
- Crea AccessCheckOut.
- Salida sin check-in requiere manualReason y permiso.
```

Response:

```http
201 Created
```

```json
{
  "data": {
    "id": "uuid",
    "accessEventId": "uuid",
    "eventNumber": "AE-202607-000002",
    "checkInId": "uuid",
    "visitorId": "uuid",
    "vehicleId": "uuid",
    "vehiclePlateMasked": "PB*-***4",
    "gateId": "uuid",
    "exitMethod": "normal",
    "checkedOutAt": "2026-07-30T22:31:00.000Z",
    "status": "recorded"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 15.3. Get check-out

```http
GET /api/v1/tenant/access-check-outs/{checkOutId}
```

Permiso:

```text
accessCheckOuts.read
```

---

## 15.4. Void check-out

```http
POST /api/v1/tenant/access-check-outs/{checkOutId}/void
```

Permiso:

```text
accessCheckOuts.void
```

Request:

```json
{
  "voidReason": "Salida registrada por error."
}
```

---

# 16. Guard API

## 16.1. List active authorizations

```http
GET /api/v1/tenant/guard/access-authorizations/active
```

Permiso:

```text
guardAccess.authorizations.read
```

Query params:

```text
search
passCode
plate
propertyUnitId
gateId
page
pageSize
```

Reglas:

```text
- Solo autorizaciones active y vigentes.
- passCode y plate se usan como raw temporal para hash.
- No devuelve datos completos sensibles.
```

---

## 16.2. Validate pass from guard

```http
POST /api/v1/tenant/guard/access-passes/validate
```

Permiso:

```text
guardAccess.pass.validate
```

Request:

```json
{
  "passCode": "AB8291",
  "gateId": "uuid"
}
```

---

## 16.3. Guard check-in

```http
POST /api/v1/tenant/guard/access-check-ins
```

Permiso:

```text
guardAccess.checkIns.create
```

Request:

```json
{
  "authorizationId": "uuid",
  "accessPassCode": "AB8291",
  "gateId": "uuid",
  "entryMethod": "accessPass",
  "notes": "Ingreso registrado por garita."
}
```

---

## 16.4. Guard check-out

```http
POST /api/v1/tenant/guard/access-check-outs
```

Permiso:

```text
guardAccess.checkOuts.create
```

Request:

```json
{
  "checkInId": "uuid",
  "gateId": "uuid",
  "exitMethod": "normal",
  "notes": "Salida registrada por garita."
}
```

---

## 16.5. Recent guard events

```http
GET /api/v1/tenant/guard/access-events/recent
```

Permiso:

```text
guardAccess.events.recent.read
```

Query params:

```text
gateId
eventType
minutes
page
pageSize
```

Reglas:

```text
- minutes default = 120.
- pageSize máximo = 50 para operación de garita.
- Solo eventos del tenant.
```

---

## 16.6. Guard denied access

```http
POST /api/v1/tenant/guard/access-denied
```

Permiso:

```text
guardAccess.deniedAccess.create
```

Request:

```json
{
  "visitorId": "uuid",
  "vehicleId": "uuid",
  "propertyUnitId": "uuid",
  "gateId": "uuid",
  "denialReason": "No existe autorización vigente.",
  "createIncident": true,
  "incidentSeverity": "medium"
}
```

Reglas:

```text
- Crea AccessEvent deniedAccess.
- Puede crear AccessIncident.
- Debe auditarse.
```

---

## 16.7. Guard incident

```http
POST /api/v1/tenant/guard/access-incidents
```

Permiso:

```text
guardAccess.incidents.create
```

Request:

```json
{
  "visitorId": "uuid",
  "vehicleId": "uuid",
  "gateId": "uuid",
  "incidentType": "unauthorizedAttempt",
  "severity": "medium",
  "description": "Visitante intentó ingresar sin autorización vigente."
}
```

---

## 16.8. Guard delivery

```http
POST /api/v1/tenant/guard/access-deliveries
```

Permiso:

```text
guardAccess.deliveries.create
```

Request:

```json
{
  "visitorId": "uuid",
  "propertyUnitId": "uuid",
  "deliveryCompany": "Delivery ficticio",
  "packageDescription": "Paquete pequeño",
  "status": "receivedAtGate"
}
```

---

# 17. `/me` API — Residentes

## 17.1. List own visitors

```http
GET /api/v1/me/access-visitors
```

Permiso:

```text
accessAuthorizations.own.read
```

Reglas:

```text
- Solo visitantes creados por el usuario o asociados a sus autorizaciones propias.
- No muestra visitantes de otras unidades.
- No muestra notas internas.
```

---

## 17.2. Create own visitor

```http
POST /api/v1/me/access-visitors
```

Permiso:

```text
accessAuthorizations.own.create
```

Request:

```json
{
  "fullName": "María López",
  "identificationType": "cedula",
  "identificationNumber": "1723456790",
  "phone": "0991234321",
  "visitorType": "family"
}
```

Response:

```http
201 Created
```

```json
{
  "data": {
    "id": "uuid",
    "fullName": "María López",
    "identificationType": "cedula",
    "identificationNumberMasked": "17******90",
    "phoneMasked": "09*****321",
    "visitorType": "family",
    "status": "active"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 17.3. List own authorizations

```http
GET /api/v1/me/access-authorizations
```

Permiso:

```text
accessAuthorizations.own.read
```

Query params:

```text
status
propertyUnitId
dateFrom
dateTo
page
pageSize
```

Reglas:

```text
- propertyUnitId debe ser unidad propia.
- No devuelve autorizaciones de unidades ajenas.
```

---

## 17.4. Create own authorization

```http
POST /api/v1/me/access-authorizations
```

Permiso:

```text
accessAuthorizations.own.create
```

Request:

```json
{
  "visitorId": "uuid",
  "vehicleId": "uuid",
  "propertyUnitId": "uuid",
  "authorizationType": "oneTime",
  "validFrom": "2026-07-30T20:00:00.000Z",
  "validUntil": "2026-07-31T02:00:00.000Z",
  "maxEntries": 1,
  "reason": "Visita familiar",
  "generateAccessPass": true
}
```

Reglas:

```text
- propertyUnitId debe pertenecer a unidad propia o autorizada.
- Resident no puede crear autorización para unidad ajena.
- Resident no puede usar authorizationScope administrative.
- Resident no puede crear autorización para visitor blockedTenant.
```

---

## 17.5. Get own authorization

```http
GET /api/v1/me/access-authorizations/{authorizationId}
```

Permiso:

```text
accessAuthorizations.own.read
```

Reglas:

```text
- Debe pertenecer a unidad propia.
- No devuelve datos internos.
- No devuelve audit.
- No devuelve guard notes internas.
```

---

## 17.6. Cancel own authorization

```http
POST /api/v1/me/access-authorizations/{authorizationId}/cancel
```

Permiso:

```text
accessAuthorizations.own.cancel
```

Request:

```json
{
  "cancelReason": "La visita fue cancelada."
}
```

Reglas:

```text
- Solo autorizaciones futuras propias.
- Si ya existe check-in, no puede cancelarse desde /me.
- Revoca pases activos.
```

---

## 17.7. List own access events

```http
GET /api/v1/me/access-events
```

Permiso:

```text
accessAuthorizations.own.read
```

Query params:

```text
propertyUnitId
dateFrom
dateTo
eventType
page
pageSize
```

Response:

```json
{
  "data": [
    {
      "id": "uuid",
      "eventType": "checkIn",
      "visitorName": "Juan Pérez",
      "vehiclePlateMasked": "PB*-***4",
      "propertyUnitId": "uuid",
      "occurredAt": "2026-07-30T19:31:00.000Z",
      "status": "recorded"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 1,
    "traceId": "trace-id"
  }
}
```

No debe devolver:

```text
guard internal notes
audit metadata
identification raw
plate raw
accessPass raw
other units
```

---

# 18. Endpoints — Deliveries

## 18.1. List deliveries

```http
GET /api/v1/tenant/access-deliveries
```

Permiso:

```text
accessDeliveries.read
```

Query params:

```text
status
propertyUnitId
visitorId
recipientPersonId
dateFrom
dateTo
page
pageSize
sortBy
sortDirection
```

---

## 18.2. Create delivery

```http
POST /api/v1/tenant/access-deliveries
```

Permiso:

```text
accessDeliveries.create
```

Request:

```json
{
  "visitorId": "uuid",
  "propertyUnitId": "uuid",
  "recipientPersonId": "uuid",
  "deliveryCompany": "Delivery ficticio",
  "packageDescription": "Paquete pequeño",
  "status": "receivedAtGate"
}
```

Reglas:

```text
- propertyUnitId debe pertenecer al tenant.
- packageDescription debe ser mínima y sanitizada.
- No se debe registrar contenido sensible innecesario.
```

---

## 18.3. Get delivery

```http
GET /api/v1/tenant/access-deliveries/{deliveryId}
```

Permiso:

```text
accessDeliveries.read
```

---

## 18.4. Mark delivery delivered

```http
POST /api/v1/tenant/access-deliveries/{deliveryId}/deliver
```

Permiso:

```text
accessDeliveries.close
```

Request:

```json
{
  "reason": "Entrega entregada a la unidad."
}
```

---

## 18.5. Mark delivery returned

```http
POST /api/v1/tenant/access-deliveries/{deliveryId}/return
```

Permiso:

```text
accessDeliveries.close
```

Request:

```json
{
  "returnReason": "Destinatario no disponible."
}
```

---

## 18.6. Cancel delivery

```http
POST /api/v1/tenant/access-deliveries/{deliveryId}/cancel
```

Permiso:

```text
accessDeliveries.update
```

Request:

```json
{
  "cancelReason": "Registro duplicado."
}
```

---

# 19. Endpoints — Supplier Visits

## 19.1. List supplier visits

```http
GET /api/v1/tenant/access-supplier-visits
```

Permiso:

```text
accessSupplierVisits.read
```

Query params:

```text
status
supplierId
visitorId
propertyUnitId
commonAreaId
maintenanceWorkOrderId
dateFrom
dateTo
page
pageSize
sortBy
sortDirection
```

---

## 19.2. Create supplier visit

```http
POST /api/v1/tenant/access-supplier-visits
```

Permiso:

```text
accessSupplierVisits.create
```

Request:

```json
{
  "supplierId": "uuid",
  "visitorId": "uuid",
  "vehicleId": "uuid",
  "propertyUnitId": "uuid",
  "maintenanceWorkOrderId": "uuid",
  "reason": "Visita técnica para revisión de bomba de agua.",
  "scheduledFrom": "2026-07-31T14:00:00.000Z",
  "scheduledUntil": "2026-07-31T16:00:00.000Z"
}
```

Reglas:

```text
- supplierId debe pertenecer al tenant si existe.
- supplier debe estar active.
- supplier blocked se rechaza salvo override administrativo auditado.
- maintenanceWorkOrderId debe pertenecer al tenant si existe.
- No crea SupplierPayable.
- No crea SupplierPaymentOrder.
- No crea Payment.
- No modifica Maintenance Work Orders.
```

---

## 19.3. Get supplier visit

```http
GET /api/v1/tenant/access-supplier-visits/{supplierVisitId}
```

Permiso:

```text
accessSupplierVisits.read
```

---

## 19.4. Check in supplier visit

```http
POST /api/v1/tenant/access-supplier-visits/{supplierVisitId}/check-in
```

Permiso:

```text
accessSupplierVisits.update
```

Request:

```json
{
  "gateId": "uuid",
  "notes": "Proveedor ingresó con herramientas."
}
```

---

## 19.5. Check out supplier visit

```http
POST /api/v1/tenant/access-supplier-visits/{supplierVisitId}/check-out
```

Permiso:

```text
accessSupplierVisits.close
```

Request:

```json
{
  "gateId": "uuid",
  "notes": "Proveedor salió sin novedades."
}
```

---

## 19.6. Cancel supplier visit

```http
POST /api/v1/tenant/access-supplier-visits/{supplierVisitId}/cancel
```

Permiso:

```text
accessSupplierVisits.cancel
```

Request:

```json
{
  "cancelReason": "La visita fue reprogramada."
}
```

---

## 19.7. Deny supplier visit

```http
POST /api/v1/tenant/access-supplier-visits/{supplierVisitId}/deny
```

Permiso:

```text
accessSupplierVisits.deny
```

Request:

```json
{
  "denialReason": "Proveedor no autorizado para el horario indicado."
}
```

---

# 20. Endpoints — Recurring Authorizations

## 20.1. List recurring authorizations

```http
GET /api/v1/tenant/access-recurring-authorizations
```

Permiso:

```text
accessRecurringAuthorizations.read
```

Query params:

```text
status
visitorId
vehicleId
propertyUnitId
authorizedByUserId
dateFrom
dateTo
page
pageSize
sortBy
sortDirection
```

---

## 20.2. Create recurring authorization

```http
POST /api/v1/tenant/access-recurring-authorizations
```

Permiso:

```text
accessRecurringAuthorizations.create
```

Request:

```json
{
  "visitorId": "uuid",
  "vehicleId": "uuid",
  "propertyUnitId": "uuid",
  "validFrom": "2026-08-01",
  "validUntil": "2026-12-31",
  "daysOfWeek": ["monday", "wednesday", "friday"],
  "timeFrom": "08:00",
  "timeUntil": "17:00",
  "maxEntriesPerDay": 1,
  "reason": "Personal de servicio autorizado."
}
```

Reglas:

```text
- validFrom <= validUntil.
- daysOfWeek debe ser válido.
- timeFrom < timeUntil si ambos existen.
- No equivale a pase permanente sin control.
```

---

## 20.3. Get recurring authorization

```http
GET /api/v1/tenant/access-recurring-authorizations/{recurringAuthorizationId}
```

Permiso:

```text
accessRecurringAuthorizations.read
```

---

## 20.4. Cancel recurring authorization

```http
POST /api/v1/tenant/access-recurring-authorizations/{recurringAuthorizationId}/cancel
```

Permiso:

```text
accessRecurringAuthorizations.cancel
```

Request:

```json
{
  "cancelReason": "Autorización recurrente cancelada por residente."
}
```

---

## 20.5. Revoke recurring authorization

```http
POST /api/v1/tenant/access-recurring-authorizations/{recurringAuthorizationId}/revoke
```

Permiso:

```text
accessRecurringAuthorizations.revoke
```

Request:

```json
{
  "revokeReason": "Revocación administrativa por seguridad."
}
```

---

# 21. Endpoints — Incidents

## 21.1. List incidents

```http
GET /api/v1/tenant/access-incidents
```

Permiso:

```text
accessIncidents.read
```

Query params:

```text
status
severity
incidentType
visitorId
vehicleId
accessEventId
propertyUnitId
gateId
dateFrom
dateTo
page
pageSize
sortBy
sortDirection
```

---

## 21.2. Create incident

```http
POST /api/v1/tenant/access-incidents
```

Permiso:

```text
accessIncidents.create
```

Request:

```json
{
  "visitorId": "uuid",
  "vehicleId": "uuid",
  "accessEventId": "uuid",
  "propertyUnitId": "uuid",
  "gateId": "uuid",
  "incidentType": "unauthorizedAttempt",
  "severity": "medium",
  "description": "Intento de ingreso sin autorización vigente."
}
```

Response:

```http
201 Created
```

---

## 21.3. Get incident

```http
GET /api/v1/tenant/access-incidents/{incidentId}
```

Permiso:

```text
accessIncidents.read
```

---

## 21.4. Update incident

```http
PATCH /api/v1/tenant/access-incidents/{incidentId}
```

Permiso:

```text
accessIncidents.update
```

Request:

```json
{
  "severity": "high",
  "description": "Actualización de incidente luego de revisión inicial."
}
```

---

## 21.5. Resolve incident

```http
POST /api/v1/tenant/access-incidents/{incidentId}/resolve
```

Permiso:

```text
accessIncidents.resolve
```

Request:

```json
{
  "resolutionReason": "Incidente revisado y cerrado por seguridad."
}
```

---

## 21.6. Dismiss incident

```http
POST /api/v1/tenant/access-incidents/{incidentId}/dismiss
```

Permiso:

```text
accessIncidents.dismiss
```

Request:

```json
{
  "dismissReason": "Incidente descartado por duplicidad."
}
```

---

# 22. Endpoints — Comments

## 22.1. List comments

```http
GET /api/v1/tenant/access-comments
```

Permiso:

```text
accessComments.read
```

Query params:

```text
entityType
entityId
visibility
page
pageSize
sortBy
sortDirection
```

---

## 22.2. Create comment

```http
POST /api/v1/tenant/access-comments
```

Permiso:

```text
accessComments.create
```

Request:

```json
{
  "entityType": "event",
  "entityId": "uuid",
  "commentBody": "Comentario interno de seguridad.",
  "visibility": "internal"
}
```

Reglas:

```text
- entityId debe pertenecer al tenant según entityType.
- commentBody debe sanitizarse.
- visibility=system solo server-side.
- visibility=internal no se expone en /me.
```

---

## 22.3. Archive comment

```http
POST /api/v1/tenant/access-comments/{commentId}/archive
```

Permiso:

```text
accessComments.archive
```

Request:

```json
{
  "archiveReason": "Comentario archivado por consolidación de evento."
}
```

---

# 23. Endpoints — Documents

## 23.1. List documents

```http
GET /api/v1/tenant/access-documents
```

Permiso:

```text
accessDocuments.read
```

Query params:

```text
entityType
entityId
documentType
visibility
status
page
pageSize
sortBy
sortDirection
```

---

## 23.2. Create document link

```http
POST /api/v1/tenant/access-documents
```

Permiso:

```text
accessDocuments.create
```

Request:

```json
{
  "entityType": "incident",
  "entityId": "uuid",
  "secureDocumentId": "uuid",
  "documentType": "incidentSupport",
  "visibility": "administrative",
  "description": "Soporte documental del incidente."
}
```

Reglas:

```text
- secureDocumentId debe pertenecer al tenant.
- entityId debe pertenecer al tenant.
- No se acepta storageKey.
- No se acepta signedUrl persistente.
- No se acepta base64.
```

Response:

```http
201 Created
```

```json
{
  "data": {
    "id": "uuid",
    "entityType": "incident",
    "entityId": "uuid",
    "secureDocumentId": "uuid",
    "documentType": "incidentSupport",
    "visibility": "administrative",
    "status": "active",
    "downloadAvailable": true,
    "createdAt": "2026-07-30T19:31:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 23.3. Get document

```http
GET /api/v1/tenant/access-documents/{documentId}
```

Permiso:

```text
accessDocuments.read
```

No debe devolver:

```text
storageKey
signedUrl persistente
base64
raw file payload
```

---

## 23.4. Archive document

```http
POST /api/v1/tenant/access-documents/{documentId}/archive
```

Permiso:

```text
accessDocuments.archive
```

Request:

```json
{
  "archiveReason": "Documento vinculado por error."
}
```

---

# 24. Endpoints — Reports and Exports

## 24.1. Events report

```http
GET /api/v1/tenant/access-reports/events
```

Permiso:

```text
accessReports.events
```

Query params:

```text
dateFrom
dateTo
gateId
propertyUnitId
visitorType
eventType
eventStatus
page
pageSize
sortBy
sortDirection
```

---

## 24.2. Visitors report

```http
GET /api/v1/tenant/access-reports/visitors
```

Permiso:

```text
accessReports.visitors
```

Query params:

```text
dateFrom
dateTo
propertyUnitId
visitorType
status
page
pageSize
sortBy
sortDirection
```

---

## 24.3. Authorizations report

```http
GET /api/v1/tenant/access-reports/authorizations
```

Permiso:

```text
accessReports.authorizations
```

Query params:

```text
dateFrom
dateTo
authorizationType
authorizationScope
status
propertyUnitId
authorizedByUserId
page
pageSize
sortBy
sortDirection
```

---

## 24.4. Incidents report

```http
GET /api/v1/tenant/access-reports/incidents
```

Permiso:

```text
accessReports.incidents
```

Query params:

```text
dateFrom
dateTo
severity
status
incidentType
gateId
propertyUnitId
page
pageSize
sortBy
sortDirection
```

---

## 24.5. Open check-ins report

```http
GET /api/v1/tenant/access-reports/open-check-ins
```

Permiso:

```text
accessReports.openCheckIns
```

Query params:

```text
gateId
propertyUnitId
visitorType
olderThanMinutes
page
pageSize
sortBy
sortDirection
```

---

## 24.6. Deliveries report

```http
GET /api/v1/tenant/access-reports/deliveries
```

Permiso:

```text
accessReports.deliveries
```

Query params:

```text
dateFrom
dateTo
status
propertyUnitId
page
pageSize
sortBy
sortDirection
```

---

## 24.7. Supplier visits report

```http
GET /api/v1/tenant/access-reports/supplier-visits
```

Permiso:

```text
accessReports.supplierVisits
```

Query params:

```text
dateFrom
dateTo
status
supplierId
maintenanceWorkOrderId
propertyUnitId
page
pageSize
sortBy
sortDirection
```

---

## 24.8. Export report

```http
GET /api/v1/tenant/access-reports/export
```

Permiso:

```text
accessReports.exports
```

Query params:

```text
reportType
format
dateFrom
dateTo
gateId
propertyUnitId
visitorType
eventType
status
severity
supplierId
maintenanceWorkOrderId
```

Valores:

```text
reportType = events | visitors | authorizations | incidents | openCheckIns | deliveries | supplierVisits
format = csv | xlsx | pdf
```

Response:

```json
{
  "data": {
    "exportId": "uuid",
    "reportType": "events",
    "format": "xlsx",
    "status": "completed",
    "secureDocumentId": "uuid",
    "downloadAvailable": true,
    "createdAt": "2026-07-30T19:31:00.000Z",
    "completedAt": "2026-07-30T19:31:04.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

No debe devolver:

```text
storageKey
signedUrl persistente
base64
raw file payload
identificationNumberRaw
plateRaw
accessPassCodeRaw
```

---

# 25. DTOs principales

## 25.1. `CreateVisitorProfileDto`

```typescript
type CreateVisitorProfileDto = {
  fullName: string;
  identificationType?: VisitorIdentificationType;
  identificationNumber?: string;
  phone?: string;
  email?: string;
  visitorType: VisitorType;
  notes?: string;
};
```

---

## 25.2. `CreateVisitorVehicleDto`

```typescript
type CreateVisitorVehicleDto = {
  visitorId?: string;
  plate: string;
  vehicleType: VisitorVehicleType;
  vehicleColor?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
};
```

---

## 25.3. `CreateAccessGateDto`

```typescript
type CreateAccessGateDto = {
  gateCode: string;
  gateName: string;
  gateType: AccessGateType;
  description?: string;
  isEntryAllowed: boolean;
  isExitAllowed: boolean;
};
```

---

## 25.4. `CreateAccessAuthorizationDto`

```typescript
type CreateAccessAuthorizationDto = {
  visitorId: string;
  vehicleId?: string;
  propertyUnitId?: string;
  authorizationType: AccessAuthorizationType;
  authorizationScope: AccessAuthorizationScope;
  validFrom: string;
  validUntil: string;
  maxEntries?: number;
  reason?: string;
  generateAccessPass?: boolean;
};
```

---

## 25.5. `CreateOwnAccessAuthorizationDto`

```typescript
type CreateOwnAccessAuthorizationDto = {
  visitorId: string;
  vehicleId?: string;
  propertyUnitId: string;
  authorizationType: "oneTime" | "dateRange" | "recurringBasic";
  validFrom: string;
  validUntil: string;
  maxEntries?: number;
  reason?: string;
  generateAccessPass?: boolean;
};
```

---

## 25.6. `CreateAccessPassDto`

```typescript
type CreateAccessPassDto = {
  passType: AccessPassType;
  expiresAt: string;
};
```

---

## 25.7. `ValidateAccessPassDto`

```typescript
type ValidateAccessPassDto = {
  passCode: string;
  gateId?: string;
};
```

---

## 25.8. `CreateAccessCheckInDto`

```typescript
type CreateAccessCheckInDto = {
  authorizationId?: string;
  accessPassCode?: string;
  visitorId?: string;
  vehicleId?: string;
  propertyUnitId?: string;
  gateId: string;
  entryMethod: AccessEntryMethod;
  manualReason?: string;
  notes?: string;
};
```

---

## 25.9. `CreateAccessCheckOutDto`

```typescript
type CreateAccessCheckOutDto = {
  checkInId?: string;
  visitorId?: string;
  vehicleId?: string;
  gateId: string;
  exitMethod: AccessExitMethod;
  manualReason?: string;
  notes?: string;
};
```

---

## 25.10. `CreateAccessIncidentDto`

```typescript
type CreateAccessIncidentDto = {
  visitorId?: string;
  vehicleId?: string;
  accessEventId?: string;
  checkInId?: string;
  checkOutId?: string;
  propertyUnitId?: string;
  gateId?: string;
  incidentType: AccessIncidentType;
  severity: AccessIncidentSeverity;
  description: string;
};
```

---

## 25.11. `CreateAccessDocumentDto`

```typescript
type CreateAccessDocumentDto = {
  entityType: AccessDocumentEntityType;
  entityId: string;
  secureDocumentId: string;
  documentType: AccessDocumentType;
  visibility: AccessDocumentVisibility;
  description?: string;
};
```

---

## 25.12. `AccessReportExportDto`

```typescript
type AccessReportExportDto = {
  reportType: AccessReportType;
  format: AccessExportFormat;
  dateFrom?: string;
  dateTo?: string;
  gateId?: string;
  propertyUnitId?: string;
  visitorType?: VisitorType;
  eventType?: AccessEventType;
  status?: string;
  severity?: AccessIncidentSeverity;
  supplierId?: string;
  maintenanceWorkOrderId?: string;
};
```

---

# 26. Campos prohibidos en DTOs externos

Todos los DTOs externos deben rechazar:

```text
tenantId
createdBy
updatedBy
authorizedBy
authorizedByUserId arbitrario
checkedInBy
checkedInByUserId
checkedOutBy
checkedOutByUserId
recordedBy
recordedByUserId
cancelledBy
revokedBy
archivedBy
voidedBy
correctedBy
resolvedBy
dismissedBy
requestedBy
status directo fuera de endpoint de transición
authorizationNumber
eventNumber
deliveryNumber
supplierVisitNumber
incidentNumber
identificationNumberHash
phoneHash
emailHash
plateHash
passCodeHash
storageKey
signedUrl
base64
rawFilePayload
fullDocumentImage
biometricTemplate
faceEmbedding
cameraStreamUrl
gateOpenCommand
hardwareDeviceCommand
paymentId
paymentOrderId
supplierPaymentOrderId
journalEntryId
bankTransactionId
reconciliationMatchId
externalAiEnabled
```

Respuesta esperada:

```http
422 Unprocessable Entity
```

---

# 27. Campos prohibidos en responses

```text
identificationNumberRaw
phoneRaw
emailRaw
plateRaw
accessPassCodeRaw
identificationNumberHash
phoneHash
emailHash
plateHash
passCodeHash
storageKey
signedUrl persistente
base64
rawFilePayload
biometricTemplate
faceEmbedding
cameraStreamUrl
gateOpenCommand
hardwareDeviceCommand
tokens
secrets
passwords
SQL raw
stack trace productivo
datos cross-tenant
```

---

# 28. Enums API

## 28.1. Visitantes y vehículos

```text
VisitorIdentificationType:
- cedula
- passport
- driverLicense
- ruc
- other
- unknown

VisitorType:
- guest
- family
- delivery
- supplier
- technician
- serviceWorker
- administrative
- emergency
- other

VisitorProfileStatus:
- active
- watchlistedTenant
- blockedTenant
- archived

VisitorVehicleType:
- car
- motorcycle
- truck
- bicycle
- van
- taxi
- deliveryVehicle
- emergencyVehicle
- other

VisitorVehicleStatus:
- active
- watchlistedTenant
- blockedTenant
- archived
```

---

## 28.2. Gates

```text
AccessGateType:
- main
- vehicle
- pedestrian
- supplier
- secondary
- emergency
- other

AccessGateStatus:
- active
- inactive
- archived
```

---

## 28.3. Autorizaciones y pases

```text
AccessAuthorizationType:
- oneTime
- dateRange
- recurringBasic
- delivery
- supplierVisit
- administrative

AccessAuthorizationScope:
- unit
- supplier
- commonArea
- administrative

AccessAuthorizationStatus:
- draft
- active
- used
- expired
- cancelled
- revoked
- archived

AccessPassType:
- shortCode
- qrLogical
- token

AccessPassStatus:
- active
- used
- expired
- revoked
- archived
```

---

## 28.4. Eventos, ingresos y salidas

```text
AccessEventType:
- checkIn
- checkOut
- deniedAccess
- manualReview
- incident
- systemNote

AccessEventStatus:
- recorded
- corrected
- voided
- archived

AccessEntryMethod:
- authorization
- accessPass
- manual
- override
- supplierVisit
- delivery

AccessExitMethod:
- normal
- manual
- override

AccessCheckInStatus:
- open
- closed
- voided
- archived

AccessCheckOutStatus:
- recorded
- voided
- archived
```

---

## 28.5. Entregas, proveedores, incidentes y reportes

```text
VisitorDeliveryStatus:
- registered
- receivedAtGate
- deliveredToUnit
- returned
- cancelled
- archived

VisitorSupplierVisitStatus:
- scheduled
- checkedIn
- checkedOut
- cancelled
- denied
- archived

AccessIncidentType:
- unauthorizedAttempt
- expiredAuthorization
- cancelledAuthorization
- revokedAuthorization
- visitorBlocked
- vehicleBlocked
- documentIssue
- plateMismatch
- behaviorIssue
- missingCheckOut
- guardNote
- deliveryIssue
- supplierIssue
- emergency
- other

AccessIncidentSeverity:
- info
- low
- medium
- high
- critical

AccessIncidentStatus:
- open
- underReview
- resolved
- dismissed
- archived

AccessReportType:
- events
- visitors
- authorizations
- incidents
- openCheckIns
- deliveries
- supplierVisits

AccessExportFormat:
- csv
- xlsx
- pdf
```

---

# 29. Errores

## 29.1. Visitantes y vehículos

```text
ACCESS_VISITOR_NOT_FOUND
ACCESS_VISITOR_INVALID_STATUS
ACCESS_VISITOR_BLOCKED
ACCESS_VISITOR_ARCHIVED
ACCESS_VISITOR_CROSS_TENANT_REFERENCE

ACCESS_VEHICLE_NOT_FOUND
ACCESS_VEHICLE_INVALID_STATUS
ACCESS_VEHICLE_BLOCKED
ACCESS_VEHICLE_ARCHIVED
ACCESS_VEHICLE_CROSS_TENANT_REFERENCE
```

---

## 29.2. Gates, autorizaciones y pases

```text
ACCESS_GATE_NOT_FOUND
ACCESS_GATE_INACTIVE
ACCESS_GATE_ARCHIVED
ACCESS_GATE_CROSS_TENANT_REFERENCE

ACCESS_AUTHORIZATION_NOT_FOUND
ACCESS_AUTHORIZATION_INVALID_STATUS
ACCESS_AUTHORIZATION_EXPIRED
ACCESS_AUTHORIZATION_CANCELLED
ACCESS_AUTHORIZATION_REVOKED
ACCESS_AUTHORIZATION_USED
ACCESS_AUTHORIZATION_INVALID_VALIDITY_WINDOW
ACCESS_AUTHORIZATION_OWN_UNIT_REQUIRED
ACCESS_AUTHORIZATION_MAX_ENTRIES_EXCEEDED

ACCESS_PASS_NOT_FOUND
ACCESS_PASS_INVALID
ACCESS_PASS_EXPIRED
ACCESS_PASS_USED
ACCESS_PASS_REVOKED
```

---

## 29.3. Eventos, check-in y check-out

```text
ACCESS_EVENT_NOT_FOUND
ACCESS_EVENT_INVALID_STATUS
ACCESS_EVENT_VOID_REASON_REQUIRED
ACCESS_EVENT_CORRECTION_REASON_REQUIRED

ACCESS_CHECK_IN_NOT_FOUND
ACCESS_CHECK_IN_ALREADY_CLOSED
ACCESS_CHECK_IN_INVALID_STATUS
ACCESS_CHECK_IN_MANUAL_REASON_REQUIRED
ACCESS_CHECK_IN_OPEN_NOT_FOUND

ACCESS_CHECK_OUT_NOT_FOUND
ACCESS_CHECK_OUT_DUPLICATE
ACCESS_CHECK_OUT_MANUAL_REASON_REQUIRED
ACCESS_CHECK_OUT_INVALID_STATUS
```

---

## 29.4. Entregas, proveedores e incidentes

```text
ACCESS_DELIVERY_NOT_FOUND
ACCESS_DELIVERY_INVALID_STATUS
ACCESS_DELIVERY_UNIT_REQUIRED
ACCESS_DELIVERY_RETURN_REASON_REQUIRED
ACCESS_DELIVERY_CANCEL_REASON_REQUIRED

ACCESS_SUPPLIER_VISIT_NOT_FOUND
ACCESS_SUPPLIER_VISIT_INVALID_STATUS
ACCESS_SUPPLIER_INVALID
ACCESS_SUPPLIER_BLOCKED
ACCESS_SUPPLIER_CROSS_TENANT_REFERENCE
ACCESS_SUPPLIER_VISIT_CANCEL_REASON_REQUIRED
ACCESS_SUPPLIER_VISIT_DENIAL_REASON_REQUIRED

ACCESS_INCIDENT_NOT_FOUND
ACCESS_INCIDENT_INVALID_STATUS
ACCESS_INCIDENT_RESOLUTION_REASON_REQUIRED
ACCESS_INCIDENT_DISMISS_REASON_REQUIRED
```

---

## 29.5. Documentos, reportes y seguridad

```text
ACCESS_DOCUMENT_NOT_FOUND
ACCESS_DOCUMENT_STORAGE_KEY_FORBIDDEN
ACCESS_DOCUMENT_CROSS_TENANT_REFERENCE

ACCESS_REPORT_INVALID_TYPE
ACCESS_REPORT_INVALID_FORMAT
ACCESS_REPORT_EXPORT_FAILED

ACCESS_PUBLIC_ENDPOINT_FORBIDDEN
ACCESS_WORDPRESS_ACCESS_FORBIDDEN
ACCESS_BIOMETRIC_PROCESSING_FORBIDDEN
ACCESS_FACE_RECOGNITION_FORBIDDEN
ACCESS_GATE_OPENING_FORBIDDEN
ACCESS_HARDWARE_CONTROL_FORBIDDEN
ACCESS_EXTERNAL_AI_FORBIDDEN
```

---

# 30. Códigos HTTP

| Caso                                     |                      Código |
| ---------------------------------------- | --------------------------: |
| Creación exitosa                         |               `201 Created` |
| Lectura exitosa                          |                    `200 OK` |
| Actualización exitosa                    |                    `200 OK` |
| Transición exitosa                       |                    `200 OK` |
| Validación fallida                       |               `400` o `422` |
| No autenticado                           |          `401 Unauthorized` |
| Sin permiso                              |             `403 Forbidden` |
| Recurso no encontrado                    |             `404 Not Found` |
| Recurso cross-tenant                     |             `404 Not Found` |
| Estado inválido                          |              `409 Conflict` |
| Pase expirado/usado/revocado             |              `409 Conflict` |
| Autorización expirada/cancelada/revocada |              `409 Conflict` |
| Check-out duplicado                      |              `409 Conflict` |
| Rate limit                               |     `429 Too Many Requests` |
| Error interno                            | `500 Internal Server Error` |

---

# 31. Integración con Secure Document Storage

## 31.1. Uso permitido

```text
access_documents.secureDocumentId
access_report_exports.secureDocumentId
documentos de incidentes
documentos de entregas
documentos de visitas de proveedor
exportaciones
```

---

## 31.2. Validaciones

Para todo `secureDocumentId`:

```text
- pertenece al tenant;
- está activo;
- sourceModule compatible;
- visibility compatible;
- sensitivity = internal | restricted;
- usuario tiene permiso.
```

---

## 31.3. Prohibiciones

```text
storageKey
signedUrl persistente
base64
raw file payload
binary payload
```

---

# 32. Integración con Notifications

Eventos notificables:

```text
accessAuthorization.created
accessAuthorization.cancelled
accessAuthorization.revoked
accessVisitor.arrived
accessCheckIn.recorded
accessDenied.recorded
accessIncident.created
accessDelivery.received
accessDelivery.returned
```

Reglas:

```text
- No incluir identificación completa.
- No incluir placa completa.
- No incluir accessPassCode completo salvo canal seguro y política explícita.
- No incluir documentos adjuntos completos.
- No incluir notas internas.
- Si falla notificación, no necesariamente falla el check-in salvo política estricta.
```

---

# 33. Integración con Supplier Payments

Uso permitido:

```text
supplierId en VisitorSupplierVisit
validar proveedor
consultar resumen mínimo del proveedor
```

Prohibido:

```text
crear SupplierPayable
crear SupplierPaymentOrder
marcar paid
crear Payment
crear PaymentAllocation
modificar cuenta bancaria de proveedor
modificar estado financiero de proveedor
```

---

# 34. Integración con Maintenance Work Orders

Uso permitido:

```text
maintenanceWorkOrderId en VisitorSupplierVisit
validar WorkOrder
consultar resumen mínimo de WorkOrder
```

Prohibido:

```text
cerrar WorkOrder
cambiar estado de WorkOrder
crear MaintenanceCost
aprobar MaintenanceCost
crear SupplierPayable
crear Payment
```

---

# 35. Límites explícitos del módulo

## 35.1. Hardware y portones

Prohibido en MVP:

```text
gateOpenCommand
hardwareDeviceCommand
cameraStreamUrl
RFID/NFC command
control de torniquete
control de cerradura inteligente
apertura automática de portón
```

---

## 35.2. Biometría y reconocimiento facial

Prohibido en MVP:

```text
biometricTemplate
faceEmbedding
faceRecognitionResult
fingerprintTemplate
irisTemplate
voicePrint
```

---

## 35.3. OCR de placas

Prohibido en MVP:

```text
plateOcrPayload
cameraFrame
ocrConfidence
automaticPlateRecognition
```

---

## 35.4. IA externa

Prohibido:

```text
enviar visitantes reales
enviar identificaciones reales
enviar placas reales
enviar eventos reales
enviar reportes reales
enviar incidentes reales
enviar documentos reales
```

---

# 36. Auditoría

Eventos mínimos:

```text
accessVisitor.created
accessVisitor.updated
accessVisitor.watchlisted
accessVisitor.blocked
accessVisitor.archived

accessVehicle.created
accessVehicle.updated
accessVehicle.watchlisted
accessVehicle.blocked
accessVehicle.archived

accessGate.created
accessGate.updated
accessGate.archived

accessAuthorization.created
accessAuthorization.activated
accessAuthorization.cancelled
accessAuthorization.revoked
accessAuthorization.expired
accessAuthorization.used

accessPass.created
accessPass.validated
accessPass.used
accessPass.expired
accessPass.revoked

accessCheckIn.recorded
accessCheckIn.voided

accessCheckOut.recorded
accessCheckOut.voided

accessEvent.recorded
accessEvent.corrected
accessEvent.voided

accessDelivery.created
accessDelivery.received
accessDelivery.delivered
accessDelivery.returned
accessDelivery.cancelled

accessSupplierVisit.created
accessSupplierVisit.checkedIn
accessSupplierVisit.checkedOut
accessSupplierVisit.cancelled
accessSupplierVisit.denied

accessIncident.created
accessIncident.updated
accessIncident.resolved
accessIncident.dismissed

accessComment.created
accessComment.archived

accessDocument.created
accessDocument.downloaded
accessDocument.archived

accessReport.generated
accessReport.exported
```

Metadata permitida:

```text
visitorId
vehicleId
authorizationId
accessPassId
eventId
checkInId
checkOutId
propertyUnitId
gateId
visitorType
authorizationType
eventType
eventStatus
incidentSeverity
incidentStatus
supplierId
maintenanceWorkOrderId
reportType
format
traceId
```

Metadata prohibida:

```text
identificationNumberRaw
plateRaw
phoneRaw
emailRaw
accessPassCodeRaw
identificationNumberHash
plateHash
passCodeHash
storageKey
signedUrl
base64
biometricTemplate
faceEmbedding
cameraStreamUrl
gateOpenCommand
tokens
secrets
passwords
raw file payload
datos cross-tenant
```

---

# 37. Observabilidad

## 37.1. Logs seguros

Eventos loggeables:

```text
accessAuthorization.created
accessAuthorization.cancelled
accessPass.validated
accessCheckIn.recorded
accessCheckOut.recorded
accessDenied.recorded
accessIncident.created
accessReport.exported
```

Campos permitidos:

```text
traceId
requestId
correlationId
action
outcome
eventType
authorizationType
visitorType
gateType
incidentSeverity
reportType
durationMs
errorCode
```

Campos prohibidos:

```text
tenantId como label
visitorId como label de métrica
vehicleId como label de métrica
propertyUnitId como label de métrica
identificationNumberRaw
phoneRaw
plateRaw
accessPassCodeRaw
storageKey
signedUrl
base64
faceEmbedding
biometricTemplate
raw payload
```

---

## 37.2. Métricas

```text
access_authorizations_total
access_authorizations_active_total
access_pass_validations_total
access_checkins_total
access_checkouts_total
access_denied_total
access_open_checkins_total
access_incidents_total
access_reports_exported_total
```

Labels permitidos:

```text
eventType
authorizationType
visitorType
gateType
incidentSeverity
status
outcome
reportType
```

Labels prohibidos:

```text
tenantId
visitorId
vehicleId
propertyUnitId
personId
identificationNumber
plate
traceId
```

---

# 38. Rate limiting

Aplicar rate limit reforzado en:

```text
POST /api/v1/tenant/access-check-ins
POST /api/v1/tenant/access-check-outs
POST /api/v1/tenant/guard/access-check-ins
POST /api/v1/tenant/guard/access-check-outs
POST /api/v1/tenant/guard/access-passes/validate
POST /api/v1/tenant/access-passes/validate
POST /api/v1/me/access-authorizations
GET  /api/v1/tenant/access-reports/export
```

Objetivo:

```text
- evitar abuso de validación de códigos;
- evitar enumeración de pases;
- proteger operación de garita;
- evitar exportaciones masivas;
- proteger datos personales.
```

---

# 39. Headers de seguridad

Todas las respuestas deben incluir:

```http
Cache-Control: no-store
Pragma: no-cache
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
```

CORS:

```text
- no wildcard;
- no WordPress público;
- solo frontends autenticados permitidos;
- orígenes explícitos por ambiente;
- credentials solo si están justificados y configurados de forma segura.
```

---

# 40. OpenAPI

## 40.1. Tags

```text
Access Visitors
Access Visitor Vehicles
Access Gates
Access Authorizations
Access Passes
Access Events
Access Check Ins
Access Check Outs
Access Deliveries
Access Supplier Visits
Access Recurring Authorizations
Access Incidents
Access Comments
Access Documents
Access Reports
Guard Access
Me Access
```

---

## 40.2. Extensiones globales

Todas las rutas privadas deben incluir:

```yaml
x-tenant-scope: true
x-auth-required: true
x-access-control-visitors: true
x-public-exposure: false
x-wordpress-access: false
```

Rutas `/me`:

```yaml
x-own-resource-scope: true
x-resident-visible: true
x-admin-only: false
```

Rutas de guardia:

```yaml
x-guard-operated: true
x-public-exposure: false
```

Rutas documentales:

```yaml
x-secure-document-storage: true
x-storage-key-exposed: false
```

Restricciones globales:

```yaml
x-biometric-processing: false
x-face-recognition: false
x-gate-opening: false
x-hardware-control: false
x-plate-ocr: false
x-external-ai-real-data: false
```

---

## 40.3. OpenAPI no debe documentar

```text
/api/v1/public/access-*
/api/v1/public/tenants/{slug}/access-*
tenantId en DTOs externos
actor fields en DTOs externos
identificationNumberHash
phoneHash
emailHash
plateHash
passCodeHash
storageKey
signedUrl persistente
base64
rawFilePayload
biometricTemplate
faceEmbedding
cameraStreamUrl
gateOpenCommand
hardwareDeviceCommand
paymentId
journalEntryId
bankTransactionId
externalAiEnabled
```

---

# 41. Endpoints públicos prohibidos

No implementar:

```text
GET    /api/v1/public/access-visitors
GET    /api/v1/public/access-visitor-vehicles
GET    /api/v1/public/access-authorizations
GET    /api/v1/public/access-events
GET    /api/v1/public/access-check-ins
GET    /api/v1/public/access-check-outs
POST   /api/v1/public/access-check-ins
POST   /api/v1/public/access-check-outs
GET    /api/v1/public/tenants/{slug}/access-visitors
GET    /api/v1/public/tenants/{slug}/access-events
```

Respuesta esperada:

```http
404 Not Found
```

---

# 42. Casos de borde

## 42.1. Autorización expirada

Respuesta:

```http
409 Conflict
```

Error:

```json
{
  "error": {
    "code": "ACCESS_AUTHORIZATION_EXPIRED",
    "message": "Access authorization is expired.",
    "details": {},
    "traceId": "trace-id"
  }
}
```

---

## 42.2. Pase usado

Respuesta:

```http
409 Conflict
```

Error:

```json
{
  "error": {
    "code": "ACCESS_PASS_USED",
    "message": "Access pass has already been used.",
    "details": {},
    "traceId": "trace-id"
  }
}
```

---

## 42.3. Residente intenta autorizar unidad ajena

Respuesta:

```http
404 Not Found
```

Error:

```json
{
  "error": {
    "code": "ACCESS_AUTHORIZATION_OWN_UNIT_REQUIRED",
    "message": "Property unit not found.",
    "details": {},
    "traceId": "trace-id"
  }
}
```

---

## 42.4. Check-out duplicado

Respuesta:

```http
409 Conflict
```

Error:

```json
{
  "error": {
    "code": "ACCESS_CHECK_OUT_DUPLICATE",
    "message": "Check-out already exists for this check-in.",
    "details": {},
    "traceId": "trace-id"
  }
}
```

---

## 42.5. Envío de storageKey

Respuesta:

```http
422 Unprocessable Entity
```

Error:

```json
{
  "error": {
    "code": "ACCESS_DOCUMENT_STORAGE_KEY_FORBIDDEN",
    "message": "Storage keys are not accepted by Access Control API.",
    "details": {},
    "traceId": "trace-id"
  }
}
```

---

## 42.6. Intento de abrir portón

Respuesta:

```http
422 Unprocessable Entity
```

Error:

```json
{
  "error": {
    "code": "ACCESS_GATE_OPENING_FORBIDDEN",
    "message": "Gate opening commands are not supported in MVP.",
    "details": {},
    "traceId": "trace-id"
  }
}
```

---

## 42.7. Intento de biometría

Respuesta:

```http
422 Unprocessable Entity
```

Error:

```json
{
  "error": {
    "code": "ACCESS_BIOMETRIC_PROCESSING_FORBIDDEN",
    "message": "Biometric processing is not supported in MVP.",
    "details": {},
    "traceId": "trace-id"
  }
}
```

---

# 43. Validaciones críticas por endpoint

## 43.1. Create visitor

```text
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard.
[ ] Rechaza tenantId.
[ ] Rechaza actor fields.
[ ] Normaliza fullName.
[ ] Enmascara identificación.
[ ] Hashea identificación.
[ ] Enmascara teléfono.
[ ] Hashea teléfono.
[ ] No persiste raw.
[ ] No devuelve raw.
[ ] Audita accessVisitor.created.
```

---

## 43.2. Create own authorization

```text
[ ] AuthGuard.
[ ] TenantGuard.
[ ] OwnResourceGuard.
[ ] Valida unidad propia.
[ ] Valida visitorId tenant-scoped.
[ ] Valida vehicleId tenant-scoped.
[ ] Rechaza administrative scope.
[ ] Valida vigencia.
[ ] Genera authorizationNumber server-side.
[ ] Genera AccessPass si aplica.
[ ] No devuelve passCodeHash.
[ ] Audita accessAuthorization.created.
```

---

## 43.3. Guard check-in

```text
[ ] AuthGuard.
[ ] TenantGuard.
[ ] GuardOperationGuard.
[ ] PermissionGuard.
[ ] Valida gate tenant-scoped.
[ ] Valida autorización si existe.
[ ] Valida pass si existe.
[ ] Rechaza pass expired/used/revoked.
[ ] Rechaza visitor blocked salvo override.
[ ] Crea AccessEvent.
[ ] Crea AccessCheckIn.
[ ] Marca pass used si aplica.
[ ] Audita accessCheckIn.recorded.
```

---

## 43.4. Guard check-out

```text
[ ] AuthGuard.
[ ] TenantGuard.
[ ] GuardOperationGuard.
[ ] Valida checkIn tenant-scoped.
[ ] Rechaza checkOut duplicado.
[ ] Crea AccessEvent.
[ ] Crea AccessCheckOut.
[ ] Cierra AccessCheckIn.
[ ] Audita accessCheckOut.recorded.
```

---

## 43.5. Export report

```text
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard.
[ ] Valida filtros tenant-scoped.
[ ] Sanitiza filtros.
[ ] Enmascara identificación.
[ ] Enmascara placa.
[ ] Crea AccessReportExport.
[ ] Crea SecureDocument.
[ ] Devuelve secureDocumentId.
[ ] No devuelve storageKey.
[ ] Audita accessReport.exported.
```

---

# 44. Criterios de aceptación API

```text
[ ] Todas las rutas permitidas requieren autenticación.
[ ] Todas las rutas tenant requieren TenantGuard.
[ ] Todas las rutas usan permisos.
[ ] Guard API no es pública.
[ ] /me API solo expone recursos propios.
[ ] Public API no existe.
[ ] WordPress público no accede.
[ ] Visitantes CRUD lógico funciona.
[ ] Vehículos CRUD lógico funciona.
[ ] Gates CRUD lógico funciona.
[ ] Autorizaciones funcionan.
[ ] Pases temporales funcionan.
[ ] Pass validation no filtra código raw.
[ ] Check-in crea AccessEvent.
[ ] Check-in crea AccessCheckIn open.
[ ] Check-out crea AccessEvent.
[ ] Check-out crea AccessCheckOut.
[ ] Check-out cierra check-in.
[ ] Check-out duplicado falla.
[ ] Autorización expirada no permite ingreso.
[ ] Autorización cancelada no permite ingreso.
[ ] Pase usado no se reutiliza.
[ ] Resident no ve unidad ajena.
[ ] Guard no cambia tenant.
[ ] Reportes son tenant-scoped.
[ ] Exportaciones usan SDS.
[ ] No se expone storageKey.
[ ] No se expone identification raw.
[ ] No se expone plate raw.
[ ] No se expone passCode raw persistente.
[ ] No hay biometría.
[ ] No hay reconocimiento facial.
[ ] No hay apertura de portones.
[ ] No hay control físico de hardware.
[ ] No hay IA externa con datos reales.
```

---

# 45. No aceptación

No se acepta el contrato si:

```text
- define endpoints públicos de visitantes;
- define endpoints públicos de accesos;
- permite acceso desde WordPress público;
- permite tenantId en body;
- permite actor fields en body;
- permite status directo fuera de endpoint de transición;
- permite que residente vea otra unidad;
- permite que guardia opere otro tenant;
- expone identificación completa por defecto;
- expone teléfono completo por defecto;
- expone placa completa por defecto;
- expone passCode raw persistente;
- expone passCodeHash;
- expone identificationNumberHash;
- expone plateHash;
- acepta storageKey;
- devuelve storageKey;
- acepta signedUrl persistente;
- acepta base64;
- acepta rawFilePayload;
- acepta biometricTemplate;
- acepta faceEmbedding;
- acepta cameraStreamUrl;
- acepta gateOpenCommand;
- implementa apertura automática de portones;
- implementa control físico de hardware;
- implementa reconocimiento facial;
- implementa biometría;
- implementa OCR automático de placas;
- crea Payment;
- crea SupplierPaymentOrder;
- crea JournalEntry;
- modifica Maintenance Work Orders;
- envía datos reales a IA externa;
- omite auditoría de check-in;
- omite auditoría de check-out;
- exporta reportes sin SDS.
```

---

# 46. Resultado esperado

Al implementar este contrato, `024-access-control-visitors` tendrá una API REST privada, segura, tenant-scoped, privacy-safe y auditable para administrar visitantes, vehículos, gates, autorizaciones, pases, ingresos, salidas, entregas, proveedores visitantes, incidentes, comentarios, documentos, reportes y exportaciones.

Resultado esperado:

```text
Tenant Admin API definida
Guard API definida
/me API limitada definida
Public API prohibida
visitors API definida
vehicles API definida
gates API definida
authorizations API definida
passes API definida
events API definida
check-ins API definida
check-outs API definida
deliveries API definida
supplier visits API definida
recurring authorizations API definida
incidents API definida
comments API definida
documents API definida
reports API definida
exports API definida
permissions definidos
DTOs definidos
errors definidos
OpenAPI extensions definidas
tenant isolation definido
own-resource access definido
guard operation definido
privacy masking definido
secure hashing definido
SDS boundary definido
Supplier Payments boundary definido
Maintenance Work Orders boundary definido
no public endpoints
no WordPress access
no biometric processing
no face recognition
no gate opening
no hardware control
no external AI with real data
audit definido
observability definida
```

---

# 47. Expediente actualizado

```text
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
│   │   └── 024-access-control-visitors/
│   │       ├── spec.md
│   │       ├── plan.md
│   │       ├── data-model.md
│   │       └── api-contract.md
```
