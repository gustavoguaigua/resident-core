# API Contract — 030 Resident Self-Service Basic

## 1. Información del documento

| Campo      | Valor                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------ |
| Proyecto   | RESIDENT Core                                                                                                |
| Spec ID    | 030                                                                                                          |
| Módulo     | Resident Self-Service Basic                                                                                  |
| Documento  | API Contract                                                                                                 |
| Ruta       | `docs/specs/030-resident-self-service-basic/api-contract.md`                                                 |
| Versión    | 0.1                                                                                                          |
| Estado     | Borrador inicial                                                                                             |
| Fecha      | 2026-08-04                                                                                                   |
| Tipo       | Resident-facing API Consumption Contract                                                                     |
| Base API   | `/api/v1`                                                                                                    |
| Auth       | Keycloak OIDC / Bearer token                                                                                 |
| Naturaleza | Tenant-scoped / Property-scoped / Person-scoped / Permission-aware / Self-service / Non-public transactional |

---

## 2. Propósito

Definir el contrato API que consumirá el portal privado de residentes, propietarios y ocupantes autorizados.

Este documento establece los endpoints self-service mínimos requeridos, sus reglas de seguridad, autorización, errores, permisos y restricciones para evitar exposición de información de otros tenants, otras unidades o recursos no autorizados.

Regla central:

```text id="rss-api-rule"
Resident Self-Service Basic debe consumir únicamente APIs oficiales, autenticadas, versionadas y documentadas de RESIDENT Core; todas las operaciones deben ser tenant-scoped, property-scoped, person-scoped y permission-aware, sin sesión WordPress, sin endpoints públicos transaccionales, sin tenantId editable, sin propertyUnitId como autoridad final, sin actor fields, sin storageKey, sin validación administrativa de pagos, sin creación de cargos administrativos, sin asientos contables, sin conciliación bancaria, sin control de hardware, sin biometría y sin IA externa con datos reales.
```

---

## 3. Principios de contrato API

```text id="rss-api-principles"
1. RESIDENT Core API es la fuente de verdad.
2. Todo endpoint self-service requiere autenticación.
3. Todo endpoint self-service requiere tenant activo cuando aplique.
4. Todo endpoint property-scoped requiere unidad vinculada al usuario.
5. El backend resuelve UserProfile -> Person -> PropertyUnit.
6. El frontend no decide qué unidad pertenece al usuario.
7. El frontend puede enviar una unidad seleccionada como hint, pero el backend valida.
8. Toda respuesta debe estar filtrada por permisos .own.
9. No se exponen datos de otras unidades.
10. No se exponen datos cross-tenant.
11. No se exponen storageKey.
12. No se exponen signedUrl persistentes.
13. No se usan endpoints públicos para datos privados.
14. No se usa WordPress como backend transaccional.
15. No se inventan endpoints fuera de OpenAPI.
```

---

## 4. Convenciones generales

### 4.1. Base URL

```text id="rss-api-base-url"
NEXT_PUBLIC_RESIDENT_API_BASE_URL=https://api.resident.example.com/api/v1
```

Reglas:

```text id="rss-api-base-rules"
- No hardcodear URLs por ambiente.
- No apuntar a PostgreSQL.
- No apuntar a Redis.
- No apuntar a storage interno.
- No apuntar a Keycloak Admin API.
- No usar WordPress como API transaccional.
```

---

### 4.2. Headers estándar

```http id="rss-api-headers"
Authorization: Bearer <access_token>
Accept: application/json
Content-Type: application/json
X-Request-Source: resident-web
```

Tenant/property context opcional según convención del Core:

```http id="rss-api-context-headers"
X-Tenant-Slug: <tenant-slug>
X-Property-Unit-Code: <property-unit-code>
```

Regla:

```text id="rss-api-context-rule"
Los headers de tenant o unidad son hints de contexto para la experiencia de usuario. El backend debe validar membresía, tenant isolation, relación persona-unidad, permisos .own y elegibilidad antes de devolver o modificar datos.
```

---

### 4.3. Response envelope

```json id="rss-api-response-envelope"
{
  "data": {},
  "meta": {
    "traceId": "trace-id"
  }
}
```

Para listas:

```json id="rss-api-list-envelope"
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

---

### 4.4. Error envelope

```json id="rss-api-error-envelope"
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to access this resource.",
    "details": {},
    "traceId": "trace-id"
  }
}
```

---

## 5. Autenticación

Flujo requerido:

```text id="rss-api-auth-flow"
Authorization Code Flow with PKCE
```

Reglas:

```text id="rss-api-auth-rules"
- Todo endpoint /resident requiere Bearer token válido.
- No se permite usuario anónimo.
- No se permite sesión WordPress.
- No se permite implicit flow.
- No se aceptan tokens en query params.
- No se registran tokens en logs.
- Keycloak autentica identidad.
- RESIDENT Core resuelve contexto aplicativo.
```

---

## 6. Contexto inicial

### 6.1. Perfil actual

```http id="rss-api-me"
GET /api/v1/me
```

Permiso:

```text id="rss-api-me-permission"
authenticated
```

Response:

```json id="rss-api-me-response"
{
  "data": {
    "userProfileId": "uuid",
    "keycloakSubjectId": "keycloak-sub",
    "email": "resident@example.com",
    "displayName": "Residente Demo",
    "status": "active"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="rss-api-me-rules"
- El frontend no deduce autorización desde claims sin Core.
- El perfil aplicativo viene de RESIDENT Core.
```

---

### 6.2. Tenants disponibles

```http id="rss-api-me-tenants"
GET /api/v1/me/tenants
```

Response:

```json id="rss-api-me-tenants-response"
{
  "data": [
    {
      "tenantId": "uuid",
      "slug": "san-jose-la-salle-2",
      "name": "San José La Salle 2",
      "membershipStatus": "active",
      "residentPortalEnabled": true,
      "roles": ["resident"],
      "permissions": [
        "residentPortal.access",
        "residentDashboard.readOwn",
        "residentPayments.readOwn"
      ]
    }
  ],
  "meta": {
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="rss-api-me-tenants-rules"
- Solo tenants con membresía activa y portal residente habilitado son seleccionables.
- Tenant inactivo, suspendido o sin residentPortalEnabled no debe permitir acceso self-service.
```

---

### 6.3. Unidades vinculadas del usuario

```http id="rss-api-me-properties"
GET /api/v1/me/tenants/{tenantSlug}/properties
```

Permiso:

```text id="rss-api-me-properties-permission"
residentProperties.readOwn
```

Response:

```json id="rss-api-me-properties-response"
{
  "data": [
    {
      "propertyUnitId": "uuid",
      "code": "casa-12",
      "label": "Casa 12",
      "type": "house",
      "relationshipType": "owner",
      "relationshipStatus": "active",
      "financialAccessLevel": "full",
      "canCreateReservations": true,
      "canCreateVisitors": true,
      "canCreateMaintenanceRequests": true
    }
  ],
  "meta": {
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="rss-api-me-properties-rules"
- El backend filtra únicamente unidades vinculadas al usuario.
- El frontend no debe poder solicitar unidades arbitrarias.
- Si el usuario no tiene unidades, devolver lista vacía y estado manejable.
```

---

### 6.4. Permisos efectivos self-service

```http id="rss-api-effective-permissions"
GET /api/v1/me/tenants/{tenantSlug}/resident-permissions
```

Response:

```json id="rss-api-effective-permissions-response"
{
  "data": {
    "tenantSlug": "san-jose-la-salle-2",
    "permissions": [
      "residentPortal.access",
      "residentDashboard.readOwn",
      "residentPayments.readOwn"
    ],
    "permissionHash": "hash"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="rss-api-effective-permissions-rules"
- La UI usa permisos para navegación y visibilidad.
- El backend sigue autorizando cada endpoint.
- permissionHash puede usarse para cache sensible.
```

---

## 7. Endpoints self-service principales

### 7.1. Dashboard residente

```http id="rss-api-dashboard"
GET /api/v1/resident/dashboard
```

Query params permitidos:

```text id="rss-api-dashboard-query"
propertyUnitCode
periodFrom
periodTo
```

Permiso:

```text id="rss-api-dashboard-permission"
residentDashboard.readOwn
```

Response:

```json id="rss-api-dashboard-response"
{
  "data": {
    "tenantSlug": "san-jose-la-salle-2",
    "propertyUnitCode": "casa-12",
    "periodFrom": "2026-08-01",
    "periodTo": "2026-08-31",
    "balanceSummary": {
      "currency": "USD",
      "currentBalance": "125.50",
      "overdueAmount": "25.50",
      "nextDueAmount": "100.00",
      "nextDueDate": "2026-08-15"
    },
    "upcomingDueDates": [],
    "recentPayments": [],
    "upcomingReservations": [],
    "pendingFines": [],
    "unreadCommunicationsCount": 2,
    "openMaintenanceRequestsCount": 1,
    "activeVisitorAuthorizationsCount": 0
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="rss-api-dashboard-rules"
- Backend calcula y filtra todo.
- Frontend no calcula saldo final.
- Si financialAccessLevel=none, balanceSummary puede omitirse o venir limitado.
```

---

### 7.2. Estado de cuenta propio

```http id="rss-api-account-statement"
GET /api/v1/resident/account-statement
```

Query params permitidos:

```text id="rss-api-account-statement-query"
propertyUnitCode
periodFrom
periodTo
includeLines
```

Permiso:

```text id="rss-api-account-statement-permission"
residentAccountStatements.readOwn
```

Response:

```json id="rss-api-account-statement-response"
{
  "data": {
    "accountStatementId": "uuid",
    "propertyUnitId": "uuid",
    "propertyUnitCode": "casa-12",
    "periodFrom": "2026-08-01",
    "periodTo": "2026-08-31",
    "currency": "USD",
    "openingBalance": "25.50",
    "totalCharges": "100.00",
    "totalPayments": "0.00",
    "endingBalance": "125.50",
    "generatedAt": "2026-08-04T05:31:00Z",
    "lines": [
      {
        "lineId": "uuid",
        "date": "2026-08-01",
        "type": "charge",
        "description": "Alícuota agosto 2026",
        "amount": "100.00",
        "balanceAfter": "125.50",
        "referenceId": "uuid"
      }
    ],
    "downloadableDocument": {
      "secureDocumentId": "uuid",
      "fileName": "estado-cuenta-casa-12-agosto-2026.pdf",
      "mimeType": "application/pdf",
      "classification": "financialSensitive"
    }
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="rss-api-account-statement-rules"
- Backend valida que la unidad pertenece al usuario.
- Backend aplica financialAccessLevel.
- Backend devuelve montos como string decimal.
- No se devuelve storageKey.
- No se devuelve signedUrl persistente.
```

---

### 7.3. Cargos propios

```http id="rss-api-charges"
GET /api/v1/resident/charges
```

Query params:

```text id="rss-api-charges-query"
propertyUnitCode
page
pageSize
status
periodFrom
periodTo
```

Permiso:

```text id="rss-api-charges-permission"
residentCharges.readOwn
```

Response:

```json id="rss-api-charges-response"
{
  "data": [
    {
      "chargeId": "uuid",
      "propertyUnitId": "uuid",
      "concept": "Alícuota agosto 2026",
      "period": "2026-08",
      "dueDate": "2026-08-15",
      "amount": "100.00",
      "currency": "USD",
      "status": "pending",
      "sourceType": "dues"
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

Reglas:

```text id="rss-api-charges-rules"
- Residente no crea cargos.
- Residente no modifica cargos.
- Residente no cambia estado del cargo.
- Backend filtra por unidad propia.
```

---

### 7.4. Pagos propios

```http id="rss-api-payments"
GET /api/v1/resident/payments
```

Query params:

```text id="rss-api-payments-query"
propertyUnitCode
page
pageSize
status
dateFrom
dateTo
```

Permiso:

```text id="rss-api-payments-permission"
residentPayments.readOwn
```

Response:

```json id="rss-api-payments-response"
{
  "data": [
    {
      "paymentId": "uuid",
      "propertyUnitId": "uuid",
      "amount": "100.00",
      "currency": "USD",
      "paymentDate": "2026-08-02",
      "method": "bankTransfer",
      "status": "pendingReview",
      "receipt": {
        "receiptId": "uuid",
        "secureDocumentId": "uuid",
        "fileName": "comprobante-agosto.pdf",
        "uploadedAt": "2026-08-02T18:00:00Z",
        "status": "pendingReview"
      }
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

Reglas:

```text id="rss-api-payments-rules"
- Backend filtra pagos propios.
- No se devuelven pagos de otras unidades.
- No se devuelve storageKey de comprobantes.
```

---

### 7.5. Registrar pago o comprobante propio

```http id="rss-api-submit-payment"
POST /api/v1/resident/payments
```

Permisos:

```text id="rss-api-submit-payment-permissions"
residentPayments.submitOwn
residentPaymentReceipts.uploadOwn
```

Request:

```json id="rss-api-submit-payment-request"
{
  "propertyUnitCode": "casa-12",
  "amount": "100.00",
  "paymentDate": "2026-08-02",
  "method": "bankTransfer",
  "reference": "DEP-123456",
  "secureDocumentId": "uuid",
  "notes": "Pago de agosto"
}
```

Response:

```json id="rss-api-submit-payment-response"
{
  "data": {
    "paymentId": "uuid",
    "status": "pendingReview",
    "receipt": {
      "receiptId": "uuid",
      "secureDocumentId": "uuid",
      "status": "pendingReview"
    }
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="rss-api-submit-payment-rules"
- Backend valida unidad propia.
- Backend valida método permitido.
- Backend valida secureDocumentId tenant/property-scoped.
- El pago queda pendingReview salvo flujo distinto definido por Core.
- Residente no aprueba su propio pago.
- Residente no valida administrativamente.
- Residente no crea asiento contable.
- Residente no confirma conciliación.
```

Prohibido en request:

```text id="rss-api-submit-payment-forbidden"
approvedBy
validatedBy
status
storageKey
signedUrl
journalEntryId
bankReconciliationId
providerCaptureId
```

---

## 8. Reservas propias

### 8.1. Listar reservas

```http id="rss-api-reservations"
GET /api/v1/resident/reservations
```

Query params:

```text id="rss-api-reservations-query"
propertyUnitCode
page
pageSize
status
dateFrom
dateTo
```

Permiso:

```text id="rss-api-reservations-permission"
residentReservations.readOwn
```

---

### 8.2. Crear reserva propia

```http id="rss-api-create-reservation"
POST /api/v1/resident/reservations
```

Permiso:

```text id="rss-api-create-reservation-permission"
residentReservations.createOwn
```

Request:

```json id="rss-api-create-reservation-request"
{
  "propertyUnitCode": "casa-12",
  "commonAreaId": "uuid",
  "startsAt": "2026-08-20T14:00:00Z",
  "endsAt": "2026-08-20T18:00:00Z",
  "purpose": "Reunión familiar",
  "guestsCount": 10
}
```

Response:

```json id="rss-api-create-reservation-response"
{
  "data": {
    "reservationId": "uuid",
    "commonAreaId": "uuid",
    "commonAreaName": "Casa comunal",
    "propertyUnitId": "uuid",
    "startsAt": "2026-08-20T14:00:00Z",
    "endsAt": "2026-08-20T18:00:00Z",
    "status": "requested",
    "feeAmount": "20.00",
    "currency": "USD",
    "canCancel": true
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="rss-api-create-reservation-rules"
- Backend valida disponibilidad.
- Backend valida políticas del tenant.
- Backend valida unidad propia.
- Backend define si requiere aprobación.
- Frontend no aprueba reservas administrativamente.
```

---

### 8.3. Cancelar reserva propia

```http id="rss-api-cancel-reservation"
POST /api/v1/resident/reservations/{reservationId}/cancel
```

Permiso:

```text id="rss-api-cancel-reservation-permission"
residentReservations.cancelOwn
```

Request:

```json id="rss-api-cancel-reservation-request"
{
  "reason": "Cambio de planes"
}
```

Reglas:

```text id="rss-api-cancel-reservation-rules"
- Backend valida que la reserva pertenece al usuario/unidad.
- Backend valida si la política permite cancelación.
- 404 no debe revelar reservas ajenas.
```

---

## 9. Multas propias

### 9.1. Listar multas

```http id="rss-api-fines"
GET /api/v1/resident/fines
```

Query params:

```text id="rss-api-fines-query"
propertyUnitCode
page
pageSize
status
dateFrom
dateTo
```

Permiso:

```text id="rss-api-fines-permission"
residentFines.readOwn
```

---

### 9.2. Apelar multa propia

```http id="rss-api-appeal-fine"
POST /api/v1/resident/fines/{fineId}/appeals
```

Permiso:

```text id="rss-api-appeal-fine-permission"
residentFines.appealOwn
```

Request:

```json id="rss-api-appeal-fine-request"
{
  "reason": "Solicito revisión porque el hecho reportado no corresponde a mi unidad.",
  "evidenceSecureDocumentIds": ["uuid"]
}
```

Reglas:

```text id="rss-api-appeal-fine-rules"
- Backend valida que la multa pertenece a unidad propia.
- Backend valida plazo de apelación.
- Backend valida documentos adjuntos.
- Frontend no resuelve apelación.
- Frontend no revoca multa.
```

---

## 10. Comunicados dirigidos

### 10.1. Listar comunicados

```http id="rss-api-communications"
GET /api/v1/resident/communications
```

Query params:

```text id="rss-api-communications-query"
page
pageSize
category
priority
dateFrom
dateTo
readStatus
```

Permiso:

```text id="rss-api-communications-permission"
residentCommunications.readOwn
```

Reglas:

```text id="rss-api-communications-rules"
- Backend devuelve solo comunicados cuya audiencia incluye al usuario/unidad.
- Adjuntos usan secureDocumentId.
- No se devuelven comunicaciones de audiencias no autorizadas.
```

---

### 10.2. Marcar comunicado como leído

```http id="rss-api-mark-communication-read"
POST /api/v1/resident/communications/{communicationId}/read
```

Permiso:

```text id="rss-api-mark-communication-read-permission"
residentCommunications.markReadOwn
```

Request:

```json id="rss-api-mark-communication-read-request"
{
  "readAtClient": "2026-08-04T05:31:00Z"
}
```

Reglas:

```text id="rss-api-mark-communication-read-rules"
- Backend valida audiencia autorizada.
- Backend registra readAt oficial server-side.
- readAtClient es solo referencia opcional.
```

---

## 11. Reuniones, asistencia, votaciones y actas

### 11.1. Reuniones visibles

```http id="rss-api-meetings"
GET /api/v1/resident/meetings
```

Permiso:

```text id="rss-api-meetings-permission"
residentMeetings.readOwn
```

---

### 11.2. Confirmar asistencia

```http id="rss-api-confirm-attendance"
POST /api/v1/resident/meetings/{meetingId}/attendance/confirm
```

Permiso:

```text id="rss-api-confirm-attendance-permission"
residentAttendance.readOwn
```

Request:

```json id="rss-api-confirm-attendance-request"
{
  "propertyUnitCode": "casa-12",
  "attendanceIntent": "willAttend"
}
```

Reglas:

```text id="rss-api-confirm-attendance-rules"
- Backend valida reunión visible.
- Backend valida unidad vinculada.
- Backend registra asistencia server-side.
```

---

### 11.3. Votaciones elegibles

```http id="rss-api-votes"
GET /api/v1/resident/voting
```

Permiso:

```text id="rss-api-votes-permission"
residentVoting.participateOwn
```

Reglas:

```text id="rss-api-votes-rules"
- Backend devuelve solo votaciones donde el usuario es elegible o puede ver convocatoria.
- Elegibilidad se calcula en backend.
```

---

### 11.4. Emitir voto

```http id="rss-api-submit-vote"
POST /api/v1/resident/voting/{voteId}/submit
```

Permiso:

```text id="rss-api-submit-vote-permission"
residentVoting.participateOwn
```

Request:

```json id="rss-api-submit-vote-request"
{
  "propertyUnitCode": "casa-12",
  "optionId": "uuid"
}
```

Reglas:

```text id="rss-api-submit-vote-rules"
- Backend valida elegibilidad.
- Backend impide doble voto.
- Backend respeta modo de privacidad de la votación.
- Frontend no calcula resultados.
- Frontend no modifica cierre/apertura de votación.
```

---

### 11.5. Actas publicadas

```http id="rss-api-minutes"
GET /api/v1/resident/minutes
```

Permiso:

```text id="rss-api-minutes-permission"
residentMinutes.readPublishedOwn
```

Reglas:

```text id="rss-api-minutes-rules"
- Solo actas publicadas para residentes.
- Documento se descarga vía secureDocumentId.
- Frontend no certifica ni edita actas.
```

---

## 12. Documentos autorizados

### 12.1. Listar documentos

```http id="rss-api-documents"
GET /api/v1/resident/documents
```

Query params:

```text id="rss-api-documents-query"
page
pageSize
classification
category
dateFrom
dateTo
propertyUnitCode
```

Permiso:

```text id="rss-api-documents-permission"
residentDocuments.readOwn
```

Response:

```json id="rss-api-documents-response"
{
  "data": [
    {
      "secureDocumentId": "uuid",
      "fileName": "acta-publicada.pdf",
      "mimeType": "application/pdf",
      "sizeBytes": 120000,
      "classification": "internal"
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

Reglas:

```text id="rss-api-documents-rules"
- No se devuelve storageKey.
- No se devuelve signedUrl persistente.
- Descarga temporal debe pasar por endpoints autorizados del módulo 016.
- Backend valida clasificación, audiencia, tenant y unidad.
```

---

## 13. Solicitudes de mantenimiento propias

### 13.1. Listar solicitudes

```http id="rss-api-maintenance"
GET /api/v1/resident/maintenance-requests
```

Query params:

```text id="rss-api-maintenance-query"
propertyUnitCode
page
pageSize
status
dateFrom
dateTo
```

Permiso:

```text id="rss-api-maintenance-permission"
residentMaintenanceRequests.readOwn
```

---

### 13.2. Crear solicitud

```http id="rss-api-create-maintenance"
POST /api/v1/resident/maintenance-requests
```

Permiso:

```text id="rss-api-create-maintenance-permission"
residentMaintenanceRequests.createOwn
```

Request:

```json id="rss-api-create-maintenance-request"
{
  "propertyUnitCode": "casa-12",
  "title": "Fuga de agua",
  "description": "Existe una fuga visible en el área externa cercana al medidor.",
  "category": "plumbing",
  "priority": "normal",
  "attachmentSecureDocumentIds": ["uuid"]
}
```

Reglas:

```text id="rss-api-create-maintenance-rules"
- Backend valida unidad propia.
- Backend valida adjuntos.
- Frontend no asigna proveedor.
- Frontend no aprueba costos.
- Frontend no cierra administrativamente si no está permitido.
```

---

## 14. Visitantes propios

### 14.1. Listar visitantes/autorizaciones

```http id="rss-api-visitors"
GET /api/v1/resident/visitors
```

Query params:

```text id="rss-api-visitors-query"
propertyUnitCode
page
pageSize
status
dateFrom
dateTo
```

Permiso:

```text id="rss-api-visitors-permission"
residentVisitors.readOwn
```

---

### 14.2. Crear autorización de visitante

```http id="rss-api-create-visitor"
POST /api/v1/resident/visitors
```

Permiso:

```text id="rss-api-create-visitor-permission"
residentVisitors.createOwn
```

Request:

```json id="rss-api-create-visitor-request"
{
  "propertyUnitCode": "casa-12",
  "visitorDisplayName": "Juan Pérez",
  "visitDate": "2026-08-10",
  "validFrom": "2026-08-10T14:00:00Z",
  "validTo": "2026-08-10T18:00:00Z",
  "notes": "Visita familiar"
}
```

Reglas:

```text id="rss-api-create-visitor-rules"
- Backend valida unidad propia.
- Backend aplica políticas de visitante del tenant.
- Backend minimiza datos del visitante.
- No se aceptan datos biométricos.
- No se aceptan imágenes faciales.
- No se envían comandos de hardware.
- No se abre portón desde este endpoint.
```

Prohibido:

```text id="rss-api-create-visitor-forbidden"
biometricData
faceImage
faceTemplate
gateOpenCommand
hardwareCommand
deviceId
```

---

## 15. Perfil propio

### 15.1. Leer perfil propio

```http id="rss-api-profile"
GET /api/v1/resident/profile
```

Permiso:

```text id="rss-api-profile-permission"
residentProfile.readOwn
```

---

### 15.2. Actualizar perfil limitado

```http id="rss-api-update-profile"
PATCH /api/v1/resident/profile
```

Permiso:

```text id="rss-api-update-profile-permission"
residentProfile.updateOwnLimited
```

Request:

```json id="rss-api-update-profile-request"
{
  "displayName": "Gustavo G.",
  "phone": "+593999999999",
  "notificationPreferences": {
    "emailEnabled": true,
    "whatsappEnabled": true
  }
}
```

Reglas:

```text id="rss-api-update-profile-rules"
- Frontend no modifica roles.
- Frontend no modifica permisos.
- Frontend no modifica membresías.
- Frontend no modifica relaciones con unidades.
- Backend define qué campos son editables.
```

---

## 16. Upload y documentos seguros

Patrón autorizado:

```text id="rss-api-upload-pattern"
1. Usuario selecciona archivo.
2. UI solicita flujo autorizado a Core/SDS.
3. Core valida permiso y contexto.
4. Archivo se registra en Secure Document Storage.
5. Core devuelve secureDocumentId.
6. UI usa secureDocumentId en la operación correspondiente.
```

Prohibido:

```text id="rss-api-upload-forbidden"
- storageKey;
- signedUrl persistente;
- base64 en JSON salvo endpoint explícito;
- upload desde WordPress público;
- URL manual al bucket;
- envío de documentos reales a IA externa.
```

---

## 17. Query params permitidos y prohibidos

Permitidos:

```text id="rss-api-query-allowed"
page
pageSize
sort
search
status
dateFrom
dateTo
periodFrom
periodTo
propertyUnitCode
category
priority
readStatus
classification
```

Prohibidos:

```text id="rss-api-query-forbidden"
tenantId editable
propertyUnitId como autoridad final
rawSql
sql
script
formulaCode
storageKey
signedUrl
token
secret
password
apiKey
authorization
```

---

## 18. Campos prohibidos en requests

```text id="rss-api-forbidden-request-fields"
tenantId
propertyUnitId como autoridad final no validada
createdBy
updatedBy
approvedBy
executedBy
cancelledBy
archivedBy
uploadedBy
requestedBy
status directo indebido
storageKey
signedUrl
rawSql
sql
script
javascript
functionBody
executableCode
formulaCode
eval
Function
secret
token
password
apiKey
privateKey
clientSecret
webhookSecret
databaseUrl
externalAiEnabled
externalAiRealDataAllowed
journalEntryId
bankReconciliationId
gateOpenCommand
hardwareCommand
biometricData
faceImage
faceTemplate
```

Respuesta si aparecen:

```http id="rss-api-forbidden-request-response"
422 Unprocessable Entity
```

---

## 19. Campos prohibidos en responses

```text id="rss-api-forbidden-response-fields"
storageKey
signedUrl persistente
secret
token
password
apiKey
privateKey
clientSecret
webhookSecret
databaseUrl
rawSql
script
functionBody
executableCode
raw file content
authorization header
cookie
datos cross-tenant
datos de otra unidad
datos personales completos sin permiso
payload financiero raw innecesario
biometricData
faceTemplate
```

---

## 20. Manejo de errores

Mapeo obligatorio:

```text id="rss-api-error-mapping"
400 -> BadRequestState
401 -> SessionExpiredState
403 -> ForbiddenState
404 -> NotFoundState
409 -> ConflictState
413 -> PayloadTooLargeState
415 -> UnsupportedMediaTypeState
422 -> FormErrorSummary
429 -> RateLimitState
500 -> ApiErrorState con traceId
```

Reglas:

```text id="rss-api-error-rules"
- Mostrar traceId si existe.
- No mostrar stack traces.
- No mostrar payload sensible.
- No revelar si 404 es recurso de otro tenant.
- No revelar si 404 es recurso de otra unidad.
- 422 debe mapear fieldErrors a formularios.
```

---

## 21. Mutaciones críticas

Requieren confirmación UI antes de llamar API:

```text id="rss-api-critical-mutations"
- cargar comprobante de pago;
- registrar pago;
- crear reserva;
- cancelar reserva;
- apelar multa;
- confirmar asistencia;
- emitir voto;
- crear solicitud de mantenimiento;
- crear autorización de visitante;
- actualizar datos personales.
```

Reglas:

```text id="rss-api-critical-rules"
- Deshabilitar submit durante mutación.
- Evitar doble submit.
- Mostrar resumen antes de confirmar.
- Enviar reason si API lo exige.
- No enviar actor fields.
- Mostrar resultado y traceId si falla.
```

---

## 22. Rate limiting y reintentos

Reglas UI:

```text id="rss-api-retry-rules"
- No reintentar automáticamente mutaciones críticas.
- Reintentar lecturas seguras con backoff limitado.
- No repetir submit por doble click.
- Mostrar RateLimitState ante 429.
- Respetar Retry-After si API lo devuelve.
```

Mutaciones sin retry automático:

```text id="rss-api-no-auto-retry"
- submit payment;
- upload receipt;
- create reservation;
- cancel reservation;
- appeal fine;
- submit vote;
- create maintenance request;
- create visitor authorization;
- update profile.
```

---

## 23. Caching API

Patrón:

```typescript id="rss-api-query-key"
["resident", tenantSlug, propertyUnitCode, "module", moduleKey, "resource", resourceKey, filtersHash]
```

Reglas:

```text id="rss-api-cache-rules"
- Toda query tenant-scoped incluye tenant.
- Toda query property-scoped incluye unidad.
- Toda query sensible considera permissionHash si aplica.
- Cambio de tenant invalida cache.
- Cambio de unidad invalida cache property-scoped.
- Logout limpia cache.
- Mutación exitosa invalida queries relacionadas.
- No cachear storageKey.
- No cachear signedUrl.
- No persistir estados de cuenta completos localmente.
```

---

## 24. Auditoría

La app no escribe auditoría directa. Core audita eventos.

Eventos esperados:

```text id="rss-api-audit-events"
residentPayment.submitted
residentPaymentReceipt.uploaded
residentReservation.created
residentReservation.cancelled
residentFine.appealSubmitted
residentCommunication.read
residentMeeting.attendanceConfirmed
residentVote.submitted
residentDocument.accessed
residentMaintenanceRequest.created
residentVisitorAuthorization.created
residentProfile.updated
```

Reglas:

```text id="rss-api-audit-rules"
- Frontend no envía actorId.
- Frontend no envía createdBy.
- Frontend no falsifica timestamps.
- Frontend envía reason solo cuando API lo exige.
- Backend registra actor, tenant, unidad y traceId.
```

---

## 25. Observabilidad frontend

Eventos permitidos:

```text id="rss-api-observability-events"
residentApp.loaded
residentApp.route.changed
residentApp.api.error
residentApp.auth.sessionExpired
residentApp.tenant.changed
residentApp.unit.changed
residentApp.criticalAction.submitted
residentApp.criticalAction.failed
```

Datos prohibidos:

```text id="rss-api-observability-forbidden"
tokens
passwords
authorization headers
cookies
storageKey
signedUrl
identificaciones completas
placas completas
comprobantes
estados de cuenta completos
payload financiero raw
payloads de visitantes
payloads de votación secreta
datos cross-tenant
datos de otras unidades
```

---

## 26. Endpoints prohibidos

No implementar ni consumir:

```text id="rss-api-forbidden-endpoints"
/api/v1/public/resident/account-statement
/api/v1/public/resident/payments
/api/v1/public/resident/documents
/api/v1/public/resident/visitors
/api/v1/resident/admin/payments/validate
/api/v1/resident/admin/charges
/api/v1/resident/accounting/journal-entries
/api/v1/resident/bank-reconciliation/confirm
/api/v1/resident/access/open-gate
/api/v1/resident/access/hardware-command
/wp/resident-private
/wp-admin/resident-self-service
/embed/resident-dashboard
```

Respuesta esperada ante rutas públicas inexistentes:

```http id="rss-api-forbidden-endpoints-response"
404 Not Found
```

---

## 27. OpenAPI requirements

Extensiones esperadas:

```yaml id="rss-api-openapi-extensions"
x-auth-required: true
x-tenant-scope: true
x-property-scope: true
x-person-scope: true
x-self-service: true
x-public-exposure: false
x-wordpress-access: false
x-storage-key-exposed: false
x-admin-payment-action: false
x-accounting-execution: false
x-bank-reconciliation-confirmation: false
x-hardware-control: false
x-biometric-processing: false
x-external-ai-real-data: false
```

CI debe fallar si:

```text id="rss-api-openapi-ci-fail"
- OpenAPI no está disponible.
- Cliente generado falla.
- Se consume endpoint no documentado.
- DTO externo expone storageKey.
- DTO externo expone tenantId editable.
- DTO externo expone actor fields.
- DTO externo expone rawSql/script/formulaCode.
- DTO externo expone biometricData.
- DTO externo habilita acciones administrativas de pago.
- DTO externo habilita hardwareCommand.
```

---

## 28. Si se implementa BFF

Endpoints BFF permitidos:

```text id="rss-api-bff-allowed"
/resident/api/auth/login
/resident/api/auth/callback
/resident/api/auth/logout
/resident/api/auth/session
```

Reglas:

```text id="rss-api-bff-rules"
- Cookies httpOnly.
- Secure cookies en producción.
- SameSite=Lax o Strict según flujo.
- No exponer accessToken al JavaScript del browser.
- No guardar clientSecret en bundle frontend.
- No convertir BFF en proxy público.
- No agregar endpoints transaccionales sin autorización Core.
```

Prohibido:

```text id="rss-api-bff-forbidden"
/resident/api/public/proxy
/resident/api/proxy/storage-key
/resident/api/proxy/raw-sql
/resident/api/proxy/payment-admin
/resident/api/proxy/accounting
/resident/api/proxy/open-gate
/resident/api/proxy/biometric
```

---

## 29. Contrato de estados UI por response

```text id="rss-api-ui-states"
2xx con data vacía -> EmptyState si aplica.
200 listado -> List/DataTable.
201 -> SuccessState + invalidar cache.
202 -> Pending/QueuedState + polling controlado si aplica.
401 -> SessionExpiredState.
403 -> ForbiddenState.
404 -> NotFoundState.
409 -> ConflictState.
413 -> PayloadTooLargeState.
415 -> UnsupportedMediaTypeState.
422 -> FormErrorSummary.
429 -> RateLimitState.
5xx -> ApiErrorState.
```

Polling permitido:

```text id="rss-api-polling-allowed"
- estado de comprobante;
- estado de pago submitted;
- estado de reporte/estado de cuenta si se genera asíncrono;
- estado de solicitud de mantenimiento;
```

Reglas:

```text id="rss-api-polling-rules"
- backoff gradual;
- límite de tiempo;
- detener al salir de pantalla;
- detener al cambiar tenant;
- detener al cambiar unidad;
- no usar polling para recursos públicos inexistentes.
```

---

## 30. Criterios de aceptación

```text id="rss-api-acceptance"
[ ] La app consume /api/v1.
[ ] La app usa cliente API centralizado.
[ ] La app obtiene perfil desde Core.
[ ] La app obtiene tenants autorizados desde Core.
[ ] La app obtiene unidades vinculadas desde Core.
[ ] La app obtiene permisos efectivos desde Core.
[ ] La app consume endpoints resident .own.
[ ] La app maneja 401/403/404/409/422/429/500 correctamente.
[ ] La app conserva traceId en errores.
[ ] La app no consume endpoints públicos transaccionales.
[ ] La app no consume WordPress como backend transaccional.
[ ] La app no envía tenantId editable.
[ ] La app no usa propertyUnitId como autoridad final sin validación backend.
[ ] La app no envía actor fields.
[ ] La app no envía status directo indebido.
[ ] La app no muestra storageKey.
[ ] La app no guarda signedUrl persistente.
[ ] La app no valida pagos administrativamente.
[ ] La app no crea cargos administrativos.
[ ] La app no crea JournalEntry.
[ ] La app no confirma conciliación.
[ ] La app no controla hardware.
[ ] La app no usa biometría.
[ ] La app no usa IA externa con datos reales.
```

---

## 31. No aceptación

No se acepta el contrato si:

```text id="rss-api-no-acceptance"
- define endpoints públicos para datos privados;
- depende de sesión WordPress;
- consume wp-admin como backend transaccional;
- permite datos cross-tenant;
- permite datos de otra unidad;
- acepta tenantId editable;
- acepta propertyUnitId como autoridad final sin validación backend;
- acepta createdBy/updatedBy/approvedBy/executedBy;
- acepta status directo indebido;
- expone storageKey;
- guarda signedUrl persistente;
- guarda tokens inseguros;
- imprime tokens en console;
- llama directamente a PostgreSQL;
- usa Prisma en frontend;
- calcula saldos finales;
- valida pagos administrativamente;
- crea cargos administrativos;
- crea JournalEntry directo;
- confirma conciliación bancaria;
- abre portones;
- controla hardware;
- procesa biometría;
- usa reconocimiento facial;
- usa IA externa con datos reales;
- oculta 403/404/422 como error genérico;
- omite traceId cuando existe.
```

---

## 32. Resultado esperado

```text id="rss-api-expected-result"
contrato API resident self-service definido
contexto /me definido
tenants autorizados definidos
unidades vinculadas definidas
permisos efectivos definidos
dashboard residente definido
estado de cuenta propio definido
cargos propios definidos
pagos propios definidos
registro de comprobante definido
reservas propias definidas
multas y apelaciones definidas
comunicados dirigidos definidos
reuniones y asistencia definidas
votaciones elegibles definidas
actas publicadas definidas
documentos autorizados definidos
mantenimiento propio definido
visitantes propios definidos
perfil propio definido
error handling definido
cache tenant/property-scoped definida
OpenAPI requirements definidos
no public transactional endpoints
no WordPress auth
no storageKey
no admin payment validation
no accounting
no bank reconciliation
no hardware control
no biometrics
no external AI with real data
```

---

## 33. Expediente actualizado

```text id="rss-api-expediente"
resident-core/
├── docs/
│   ├── specs/
│   │   └── 030-resident-self-service-basic/
│   │       ├── spec.md
│   │       ├── plan.md
│   │       ├── data-model.md
│   │       └── api-contract.md
```
