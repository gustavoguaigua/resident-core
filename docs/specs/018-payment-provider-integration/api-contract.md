# API Contract — Spec 018 Payment Provider Integration

## 1. Información del documento

| Campo           | Valor                                                                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                     |
| Spec ID         | 018                                                                                                                                               |
| Módulo          | Payment Provider Integration                                                                                                                      |
| Documento       | API Contract                                                                                                                                      |
| Ruta            | `docs/specs/018-payment-provider-integration/api-contract.md`                                                                                     |
| Versión         | 0.1                                                                                                                                               |
| Estado          | Borrador inicial                                                                                                                                  |
| Fecha           | 2026-07-23                                                                                                                                        |
| Documento base  | `docs/specs/018-payment-provider-integration/spec.md`                                                                                             |
| Plan técnico    | `docs/specs/018-payment-provider-integration/plan.md`                                                                                             |
| Modelo de datos | `docs/specs/018-payment-provider-integration/data-model.md`                                                                                       |
| API Style       | REST                                                                                                                                              |
| API Version     | `/api/v1`                                                                                                                                         |
| Naturaleza      | Tenant-scoped / Provider-agnostic / Webhook-driven / Idempotent / Payment-aware / Audit-heavy / PCI-minimized / Non-public administrative surface |

---

## 2. Propósito

Este documento define el contrato REST del módulo `018-payment-provider-integration`.

El contrato cubre endpoints, permisos, DTOs, filtros, respuestas, errores, reglas de autorización, reglas de multitenancy, reglas de idempotencia, validación de webhooks, integración con Payments, integración con Account Statements, integración con Bank Reconciliation, auditoría, observabilidad, OpenAPI y restricciones de seguridad.

Regla central:

```text id="pn8wma"
Toda API de Payment Provider Integration debe ser autenticada cuando corresponda, tenant-scoped, provider-agnostic, idempotente, segura frente a webhooks falsos, libre de datos sensibles de tarjeta, libre de secretos expuestos, auditada, compatible con Payments y sin endpoints públicos administrativos.
```

---

## 3. Principios generales de la API

### 3.1. Base path

```text id="k3oe3d"
/api/v1
```

---

### 3.2. Superficies de API

El módulo expone cinco superficies:

```text id="vtn0z4"
1. Platform API
2. Tenant Admin API
3. Own API
4. Webhook API
5. Reports API
```

---

### 3.3. Platform API

Para administración de proveedores soportados por RESIDENT:

```text id="czvxhf"
/api/v1/platform/payment-provider-definitions
```

Requiere permisos platform.

---

### 3.4. Tenant Admin API

Para configuración, consulta, auditoría operativa y reportes por tenant:

```text id="eoknn7"
/api/v1/tenant/payment-providers
/api/v1/tenant/payment-intents
/api/v1/tenant/payment-provider-webhook-events
/api/v1/tenant/provider-transactions
/api/v1/tenant/provider-payment-mappings
/api/v1/tenant/provider-settlements
/api/v1/tenant/payment-provider-reports
```

Requiere autenticación, membership tenant y permisos financieros.

---

### 3.5. Own API

Para usuarios propietarios o residentes autorizados:

```text id="dyi810"
/api/v1/me/payment-intents
```

Requiere autenticación, relación válida `UserProfile -> Person -> PropertyUnit` y permisos `.own`.

---

### 3.6. Webhook API

Para proveedores externos:

```text id="kmpjui"
/api/v1/webhooks/payment-providers/{providerKey}
```

Técnicamente puede estar expuesta a internet, pero no es una API pública funcional de usuario. Debe aceptar únicamente eventos firmados, verificables e idempotentes.

---

### 3.7. Endpoints públicos administrativos

No existen endpoints administrativos públicos para pagos por proveedor en MVP.

---

## 4. Autenticación

### 4.1. Endpoints autenticados

Todos los endpoints `platform`, `tenant` y `me` requieren:

```http id="dm7yno"
Authorization: Bearer <access_token>
```

---

### 4.2. Webhook endpoint

El endpoint de webhook no usa sesión de usuario, pero exige:

```text id="fpigfq"
- providerKey válido;
- firma del proveedor;
- timestamp válido si el proveedor lo soporta;
- payload íntegro;
- replay protection;
- idempotencia;
- configuración tenant resoluble;
- provider config enabled, salvo política explícita para eventos tardíos.
```

---

### 4.3. Responsabilidad

```text id="x4ri9p"
Keycloak autentica usuarios.
RESIDENT Core autoriza usuarios, tenants, permisos, recursos propios y efectos financieros.
PaymentProviderIntegration valida eventos externos firmados.
```

---

## 5. Tenant efectivo

### 5.1. Tenant Admin API

El tenant efectivo se obtiene desde el contexto autenticado:

```text id="cyod38"
currentTenant.id
```

Prohibido aceptar `tenantId` desde body, query o path en operaciones tenant-scoped.

---

### 5.2. Own API

El tenant efectivo se obtiene desde el contexto autenticado y la membership activa del usuario.

Además, se valida relación:

```text id="pvbw00"
UserProfile -> Person -> PropertyUnit
```

---

### 5.3. Webhook API

El tenant se resuelve desde el evento y la configuración del proveedor:

```text id="k5of7h"
providerKey
providerEventId
providerIntentId
providerSessionId
providerTransactionId
tenantProviderConfig
signature verification context
```

Si no puede resolverse de forma segura, el evento debe rechazarse o registrarse como evento técnico sanitizado sin efectos financieros.

---

## 6. Formato general

### 6.1. JSON

Request y response usan JSON `camelCase`.

Base de datos usa `snake_case`.

---

### 6.2. Fechas

Fechas en ISO 8601.

```text id="uprq1f"
2026-07-23T10:30:00-05:00
```

Internamente se normaliza a UTC.

---

### 6.3. Dinero

Montos como string decimal.

```json id="fge3ut"
{
  "amount": "125.50",
  "currency": "USD"
}
```

Prohibido usar `number`, `float` o `double` como fuente de verdad monetaria.

---

### 6.4. Paginación

Parámetros estándar:

```text id="ghpmff"
page
pageSize
sortBy
sortOrder
```

Reglas:

```text id="zce5ac"
page >= 1
pageSize default = 20
pageSize max = 100
sortOrder = asc | desc
```

---

### 6.5. Respuesta estándar

```json id="qzpj4j"
{
  "data": {},
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

### 6.6. Error estándar

```json id="a4r5rk"
{
  "error": {
    "code": "PAYMENT_INTENT_NOT_FOUND",
    "message": "Payment intent not found.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

## 7. Headers

### 7.1. Headers generales

```http id="qrdmlu"
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
X-Request-Id: <request-id>
X-Correlation-Id: <correlation-id>
Idempotency-Key: <idempotency-key>
```

---

### 7.2. Headers de webhook

Los nombres específicos dependen del proveedor. El contrato interno debe soportar una abstracción.

Ejemplo conceptual:

```http id="m3gxwp"
Content-Type: application/json
X-Provider-Signature: <signature>
X-Provider-Timestamp: <timestamp>
X-Provider-Event-Id: <event-id>
```

Reglas:

```text id="d2m8cw"
- conservar raw body para verificación;
- no registrar firma completa en logs;
- no registrar payload completo;
- calcular payloadHash;
- calcular signatureHeaderHash si se requiere trazabilidad.
```

---

## 8. Idempotencia

### 8.1. Operaciones idempotentes

Deben soportar `Idempotency-Key`:

```text id="judlnr"
- crear PaymentIntent;
- crear CheckoutSession;
- procesar webhook;
- reprocesar webhook;
- crear Payment desde proveedor;
- crear ProviderPaymentMapping;
- vincular settlement con BankTransaction;
- exportar reporte persistido.
```

---

### 8.2. Reglas

```text id="lrdear"
- misma Idempotency-Key con payload lógico equivalente retorna mismo resultado;
- misma Idempotency-Key con payload diferente retorna conflicto;
- mismo providerEventId no procesa dos veces;
- mismo providerTransactionId no crea dos Payments;
- mismo PaymentIntent succeeded no crea otro Payment;
```

---

## 9. Seguridad transversal

### 9.1. Reglas obligatorias

```text id="kryxrb"
- no aceptar tenantId desde body;
- no aceptar createdBy, updatedBy, enabledBy, processedBy o actor fields desde body;
- no aceptar amount arbitrario del cliente como fuente de verdad para cargos/saldos;
- no aceptar status directo salvo endpoints de transición;
- no exponer secretos;
- no exponer credentialSecret value;
- no exponer webhookSecret value;
- no exponer raw webhook payload;
- no exponer raw signature;
- no exponer checkoutUrl en logs;
- no almacenar PAN;
- no almacenar CVV;
- no almacenar raw card data;
- no crear Payment desde redirect del navegador;
- no crear Payment sin webhook verificado;
- no duplicar Payment por webhook repetido;
- no crear endpoints públicos administrativos;
- no enviar datos reales a IA externa.
```

---

### 9.2. Datos de tarjeta

Prohibido recibir, guardar o devolver:

```text id="u3pcuy"
PAN
CVV
trackData
PIN
rawCardData
fullCardToken
fullAuthorizationPayload
3DS raw payload
```

Permitido de forma minimizada:

```text id="e8d00d"
paymentMethodType
cardBrand
cardLast4
authorizationCodePreview
providerTransactionId
providerReference
```

---

### 9.3. Respuesta ante cross-tenant

Recomendación general:

```text id="jme6ga"
Responder 404 para recursos pertenecientes a otro tenant.
```

Puede usarse 403 si la política del módulo lo requiere, pero nunca se debe revelar existencia de recursos externos.

---

## 10. Permisos

### 10.1. Provider definitions platform

```text id="uuk2x2"
paymentProviderDefinitions.create
paymentProviderDefinitions.read
paymentProviderDefinitions.update
paymentProviderDefinitions.activate
paymentProviderDefinitions.deprecate
paymentProviderDefinitions.archive
```

---

### 10.2. Tenant provider configs

```text id="as646p"
tenantPaymentProviders.create
tenantPaymentProviders.read
tenantPaymentProviders.update
tenantPaymentProviders.enable
tenantPaymentProviders.disable
tenantPaymentProviders.testConnection
tenantPaymentProviders.archive
```

---

### 10.3. Payment intents

```text id="le3kc5"
paymentIntents.create
paymentIntents.read
paymentIntents.cancel
paymentIntents.expire
paymentIntents.create.own
paymentIntents.read.own
paymentIntents.cancel.own
```

---

### 10.4. Checkout sessions

```text id="s4jcz7"
paymentCheckoutSessions.create
paymentCheckoutSessions.read
paymentCheckoutSessions.create.own
paymentCheckoutSessions.read.own
```

---

### 10.5. Webhook events

```text id="codvtg"
paymentProviderWebhooks.read
paymentProviderWebhooks.reprocess
paymentProviderWebhooks.archive
```

---

### 10.6. Provider transactions

```text id="qcj7dr"
providerTransactions.read
providerTransactions.review
providerTransactions.archive
```

---

### 10.7. Provider mappings

```text id="in1643"
providerPaymentMappings.read
providerPaymentMappings.reverse
```

---

### 10.8. Settlements

```text id="dcyz28"
providerSettlements.read
providerSettlements.linkToBankTransaction
providerSettlements.archive
```

---

### 10.9. Reports

```text id="zrppoy"
paymentProviderReports.read
paymentProviderReports.export
```

---

### 10.10. Audit

```text id="wenxb3"
paymentProvider.audit.read
```

---

## 11. Enums expuestos por API

### 11.1. `PaymentProviderDefinitionStatus`

```text id="iaarkz"
draft
active
inactive
deprecated
archived
```

---

### 11.2. `PaymentProviderEnvironment`

```text id="wj3ecs"
sandbox
production
```

---

### 11.3. `TenantPaymentProviderConfigStatus`

```text id="jt9xoj"
draft
enabled
disabled
invalid
archived
```

---

### 11.4. `PaymentMethodType`

```text id="loelws"
card
bankTransfer
wallet
paymentButton
qr
cashNetwork
other
```

MVP recomendado:

```text id="lmtwgq"
card
paymentButton
other
```

---

### 11.5. `PaymentIntentStatus`

```text id="is34zo"
draft
created
checkoutCreated
pendingProviderConfirmation
succeeded
failed
cancelled
expired
reversed
archived
```

---

### 11.6. `PaymentIntentPurpose`

```text id="d9u9ty"
payCharges
payAccountBalance
payFine
payReservation
payOther
```

---

### 11.7. `PaymentIntentItemType`

```text id="f2ctd0"
charge
fine
reservation
accountBalance
manualItem
other
```

---

### 11.8. `CheckoutSessionStatus`

```text id="j3bu20"
created
opened
completed
failed
cancelled
expired
archived
```

---

### 11.9. `ProviderWebhookSignatureStatus`

```text id="t1nyxo"
notVerified
verified
invalid
missing
unsupported
```

---

### 11.10. `ProviderWebhookProcessingStatus`

```text id="fn42sp"
received
ignored
processing
processed
duplicate
failed
rejected
archived
```

---

### 11.11. `ProviderTransactionStatus`

```text id="rofo63"
pending
authorized
captured
succeeded
failed
cancelled
expired
refunded
partiallyRefunded
chargeback
unknown
```

---

### 11.12. `InternalProviderPaymentStatus`

```text id="b9gpcj"
pending
verified
paymentCreated
paymentLinked
failed
cancelled
reversed
requiresReview
ignored
```

---

### 11.13. `ProviderPaymentMappingStatus`

```text id="yes2ch"
active
reversed
failed
archived
```

---

### 11.14. `ProviderSettlementStatus`

```text id="lg3595"
pending
settled
failed
reversed
unknown
```

---

### 11.15. `Currency`

```text id="evq8c5"
USD
```

---

# 12. API — Platform Payment Provider Definitions

## 12.1. `GET /api/v1/platform/payment-provider-definitions`

Lista proveedores soportados por la plataforma.

### Permiso

```text id="zjxozf"
paymentProviderDefinitions.read
```

### Query params

```text id="r42dyd"
providerKey
status
supportsHostedCheckout
supportsWebhooks
supportsRefunds
supportsSettlements
page
pageSize
sortBy
sortOrder
```

### Response `200`

```json id="ais3si"
{
  "data": [
    {
      "id": "provider_definition_uuid",
      "providerKey": "mockHostedCheckout",
      "displayName": "Mock Hosted Checkout",
      "description": "Proveedor mock para desarrollo y pruebas",
      "status": "active",
      "supportedEnvironments": ["sandbox"],
      "supportedCurrencies": ["USD"],
      "supportedPaymentMethods": ["card", "paymentButton"],
      "supportsHostedCheckout": true,
      "supportsWebhooks": true,
      "supportsRefunds": false,
      "supportsInstallments": false,
      "supportsSettlements": false,
      "createdAt": "2026-07-23T10:00:00Z",
      "updatedAt": "2026-07-23T10:00:00Z"
    }
  ],
  "meta": {
    "traceId": "req_123456",
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

---

## 12.2. `POST /api/v1/platform/payment-provider-definitions`

Crea una definición de proveedor soportado.

### Permiso

```text id="me5rlt"
paymentProviderDefinitions.create
```

### Request body

```json id="cgcmy7"
{
  "providerKey": "mockHostedCheckout",
  "displayName": "Mock Hosted Checkout",
  "description": "Proveedor mock para desarrollo y pruebas",
  "supportedEnvironments": ["sandbox"],
  "supportedCurrencies": ["USD"],
  "supportedPaymentMethods": ["card", "paymentButton"],
  "supportsHostedCheckout": true,
  "supportsWebhooks": true,
  "supportsRefunds": false,
  "supportsInstallments": false,
  "supportsSettlements": false,
  "metadata": {
    "adapter": "mock"
  }
}
```

### Reglas

```text id="ee9axo"
- providerKey único;
- providerKey estable;
- no credenciales tenant;
- no secretos;
- no datos de tarjeta;
- status inicial draft salvo decisión explícita;
- audita paymentProviderDefinition.created.
```

### Response `201`

```json id="bmjajd"
{
  "data": {
    "id": "provider_definition_uuid",
    "providerKey": "mockHostedCheckout",
    "displayName": "Mock Hosted Checkout",
    "status": "draft",
    "supportedEnvironments": ["sandbox"],
    "supportedCurrencies": ["USD"],
    "supportedPaymentMethods": ["card", "paymentButton"],
    "supportsHostedCheckout": true,
    "supportsWebhooks": true,
    "supportsRefunds": false,
    "supportsInstallments": false,
    "supportsSettlements": false,
    "createdAt": "2026-07-23T10:00:00Z",
    "updatedAt": "2026-07-23T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Rechazar

```text id="bdq7y4"
tenantId
credentialSecret
webhookSecret
credentialSecretRef
webhookSecretRef
raw provider secret
status
createdBy
updatedBy
createdAt
updatedAt
```

---

## 12.3. `GET /api/v1/platform/payment-provider-definitions/{providerDefinitionId}`

Obtiene una definición de proveedor.

### Permiso

```text id="x0vhqy"
paymentProviderDefinitions.read
```

### Response `200`

Devuelve `PaymentProviderDefinitionDto`.

---

## 12.4. `PATCH /api/v1/platform/payment-provider-definitions/{providerDefinitionId}`

Actualiza metadata no sensible de la definición.

### Permiso

```text id="odb6ca"
paymentProviderDefinitions.update
```

### Request body

```json id="sqbd4b"
{
  "displayName": "Mock Hosted Checkout",
  "description": "Proveedor mock actualizado",
  "supportedPaymentMethods": ["card", "paymentButton"],
  "supportsHostedCheckout": true,
  "supportsWebhooks": true,
  "metadata": {
    "adapter": "mock"
  }
}
```

### Response `200`

Devuelve `PaymentProviderDefinitionDto`.

---

## 12.5. `POST /api/v1/platform/payment-provider-definitions/{providerDefinitionId}/activate`

Activa una definición.

### Permiso

```text id="a24mmc"
paymentProviderDefinitions.activate
```

### Request body

```json id="vfaygx"
{
  "reason": "Proveedor validado para sandbox"
}
```

### Response `200`

```json id="jgj2bz"
{
  "data": {
    "id": "provider_definition_uuid",
    "status": "active",
    "activatedAt": "2026-07-23T10:05:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 12.6. `POST /api/v1/platform/payment-provider-definitions/{providerDefinitionId}/deprecate`

Marca proveedor como deprecado.

### Permiso

```text id="fs6x17"
paymentProviderDefinitions.deprecate
```

### Request body

```json id="m7gcrp"
{
  "reason": "Proveedor reemplazado por nueva versión"
}
```

### Response `200`

```json id="ik85fa"
{
  "data": {
    "id": "provider_definition_uuid",
    "status": "deprecated",
    "deprecatedAt": "2026-07-23T11:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 12.7. `POST /api/v1/platform/payment-provider-definitions/{providerDefinitionId}/archive`

Archiva proveedor.

### Permiso

```text id="n7g8ej"
paymentProviderDefinitions.archive
```

### Request body

```json id="jvypdp"
{
  "reason": "Proveedor histórico archivado"
}
```

### Response `200`

```json id="u42aju"
{
  "data": {
    "id": "provider_definition_uuid",
    "status": "archived",
    "archivedAt": "2026-07-23T12:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 13. API — Tenant Payment Providers

## 13.1. `GET /api/v1/tenant/payment-providers`

Lista configuraciones de proveedor del tenant.

### Permiso

```text id="yu51pt"
tenantPaymentProviders.read
```

### Query params

```text id="lknly6"
providerKey
environment
status
currency
settlementBankAccountId
createdFrom
createdTo
enabledFrom
enabledTo
page
pageSize
sortBy
sortOrder
```

### Response `200`

```json id="pe72hw"
{
  "data": [
    {
      "id": "tenant_provider_config_uuid",
      "providerDefinitionId": "provider_definition_uuid",
      "providerKey": "mockHostedCheckout",
      "environment": "sandbox",
      "status": "enabled",
      "displayName": "Pago en línea",
      "currency": "USD",
      "credentialSecretConfigured": true,
      "webhookSecretConfigured": true,
      "publicConfig": {
        "brandLabel": "Pago seguro"
      },
      "settlementBankAccountId": "bank_account_uuid",
      "webhookEndpointPath": "/api/v1/webhooks/payment-providers/mockHostedCheckout",
      "createdAt": "2026-07-23T10:00:00Z",
      "updatedAt": "2026-07-23T10:00:00Z",
      "enabledAt": "2026-07-23T10:10:00Z"
    }
  ],
  "meta": {
    "traceId": "req_123456",
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

### No debe incluir

```text id="a3ifss"
credentialSecret value
webhookSecret value
raw API key
raw token
raw private key
```

---

## 13.2. `POST /api/v1/tenant/payment-providers`

Crea configuración de proveedor para el tenant.

### Permiso

```text id="kr0rpf"
tenantPaymentProviders.create
```

### Request body

```json id="lyiaer"
{
  "providerDefinitionId": "provider_definition_uuid",
  "providerKey": "mockHostedCheckout",
  "environment": "sandbox",
  "displayName": "Pago en línea",
  "currency": "USD",
  "credentialSecretInput": {
    "mode": "secretRef",
    "secretRef": "secret://tenant/demo/provider/mock/credentials"
  },
  "webhookSecretInput": {
    "mode": "secretRef",
    "secretRef": "secret://tenant/demo/provider/mock/webhook"
  },
  "publicConfig": {
    "brandLabel": "Pago seguro"
  },
  "settlementBankAccountId": "bank_account_uuid",
  "returnUrl": "https://app.resident.example/payments/return",
  "cancelUrl": "https://app.resident.example/payments/cancel",
  "allowedOrigins": [
    "https://app.resident.example"
  ],
  "metadata": {
    "notes": "Configuración sandbox"
  }
}
```

### Reglas

```text id="b7j3wd"
- providerDefinition debe existir y estar active;
- bankAccount, si se envía, debe pertenecer al tenant;
- secret values no deben quedar persistidos en la tabla;
- si se recibe valor de secreto, debe almacenarse mediante PaymentProviderSecretPort y convertirse a SecretRef;
- status inicial draft o disabled;
- no habilita automáticamente salvo decisión explícita;
- audita tenantPaymentProviderConfig.created.
```

### Response `201`

```json id="aezyvj"
{
  "data": {
    "id": "tenant_provider_config_uuid",
    "providerDefinitionId": "provider_definition_uuid",
    "providerKey": "mockHostedCheckout",
    "environment": "sandbox",
    "status": "draft",
    "displayName": "Pago en línea",
    "currency": "USD",
    "credentialSecretConfigured": true,
    "webhookSecretConfigured": true,
    "publicConfig": {
      "brandLabel": "Pago seguro"
    },
    "settlementBankAccountId": "bank_account_uuid",
    "createdAt": "2026-07-23T10:00:00Z",
    "updatedAt": "2026-07-23T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Rechazar

```text id="a0xbmw"
tenantId
credentialSecret value en metadata
webhookSecret value en metadata
status
createdBy
enabledBy
archivedBy
createdAt
updatedAt
```

---

## 13.3. `GET /api/v1/tenant/payment-providers/{tenantProviderConfigId}`

Obtiene configuración del proveedor.

### Permiso

```text id="ljput3"
tenantPaymentProviders.read
```

### Response `200`

Devuelve `TenantPaymentProviderConfigDto`.

---

## 13.4. `PATCH /api/v1/tenant/payment-providers/{tenantProviderConfigId}`

Actualiza configuración permitida.

### Permiso

```text id="e3p5zs"
tenantPaymentProviders.update
```

### Request body

```json id="rkypjt"
{
  "displayName": "Pago en línea actualizado",
  "publicConfig": {
    "brandLabel": "Paga seguro"
  },
  "settlementBankAccountId": "bank_account_uuid",
  "returnUrl": "https://app.resident.example/payments/return",
  "cancelUrl": "https://app.resident.example/payments/cancel",
  "allowedOrigins": [
    "https://app.resident.example"
  ],
  "metadata": {
    "notes": "Actualización operativa"
  }
}
```

### Reglas

```text id="abbabo"
- no actualiza secretos mediante este endpoint salvo subestructura explícita controlada;
- no cambia providerKey;
- no cambia tenantId;
- no cambia status directo;
- si cambia settlementBankAccountId, validar tenant;
- audita tenantPaymentProviderConfig.updated.
```

### Response `200`

Devuelve `TenantPaymentProviderConfigDto`.

---

## 13.5. `POST /api/v1/tenant/payment-providers/{tenantProviderConfigId}/enable`

Habilita proveedor para crear PaymentIntent.

### Permiso

```text id="vy9ir2"
tenantPaymentProviders.enable
```

### Request body

```json id="f8c8sv"
{
  "reason": "Credenciales validadas"
}
```

### Reglas

```text id="b2yh5r"
- config debe pertenecer al tenant;
- provider definition debe estar active;
- credenciales requeridas deben estar configuradas;
- webhookSecret debe estar configurado si provider soporta webhooks;
- puede ejecutar testConnection antes de habilitar;
- solo un provider enabled por tenant/provider/environment si aplica índice parcial;
- audita tenantPaymentProviderConfig.enabled.
```

### Response `200`

```json id="z57kvg"
{
  "data": {
    "id": "tenant_provider_config_uuid",
    "status": "enabled",
    "enabledAt": "2026-07-23T10:15:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 13.6. `POST /api/v1/tenant/payment-providers/{tenantProviderConfigId}/disable`

Deshabilita proveedor.

### Permiso

```text id="nyalru"
tenantPaymentProviders.disable
```

### Request body

```json id="vaec75"
{
  "reason": "Mantenimiento del proveedor"
}
```

### Response `200`

```json id="pmz0mh"
{
  "data": {
    "id": "tenant_provider_config_uuid",
    "status": "disabled",
    "disabledAt": "2026-07-23T11:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 13.7. `POST /api/v1/tenant/payment-providers/{tenantProviderConfigId}/test-connection`

Prueba conexión con proveedor.

### Permiso

```text id="rfqzc2"
tenantPaymentProviders.testConnection
```

### Request body

```json id="s55wti"
{
  "mode": "safe",
  "reason": "Validación previa a habilitación"
}
```

### Reglas

```text id="qg9z4g"
- no exponer secretos;
- no loggear respuestas completas del proveedor;
- no ejecutar cargo real;
- usar ambiente sandbox para pruebas MVP;
- audita tenantPaymentProviderConfig.tested.
```

### Response `200`

```json id="l3bmgq"
{
  "data": {
    "id": "tenant_provider_config_uuid",
    "providerKey": "mockHostedCheckout",
    "environment": "sandbox",
    "connectionStatus": "ok",
    "testedAt": "2026-07-23T11:10:00Z",
    "details": {
      "supportsHostedCheckout": true,
      "supportsWebhooks": true
    }
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 13.8. `POST /api/v1/tenant/payment-providers/{tenantProviderConfigId}/archive`

Archiva configuración.

### Permiso

```text id="rvoes3"
tenantPaymentProviders.archive
```

### Request body

```json id="q1mkfv"
{
  "reason": "Proveedor reemplazado"
}
```

### Response `200`

```json id="mhgnrf"
{
  "data": {
    "id": "tenant_provider_config_uuid",
    "status": "archived",
    "archivedAt": "2026-07-23T12:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 14. API — Tenant Payment Intents

## 14.1. `GET /api/v1/tenant/payment-intents`

Lista intents del tenant para administración.

### Permiso

```text id="w66i9u"
paymentIntents.read
```

### Query params

```text id="m47byr"
tenantProviderConfigId
initiatedByUserId
personId
propertyUnitId
sourceModule
sourceResourceType
sourceResourceId
paymentPurpose
status
amountMin
amountMax
currency
createdFrom
createdTo
expiresFrom
expiresTo
page
pageSize
sortBy
sortOrder
```

### Response `200`

```json id="ciugzs"
{
  "data": [
    {
      "id": "payment_intent_uuid",
      "tenantProviderConfigId": "tenant_provider_config_uuid",
      "providerKey": "mockHostedCheckout",
      "personId": "person_uuid",
      "propertyUnitId": "property_unit_uuid",
      "paymentPurpose": "payCharges",
      "amount": "125.50",
      "currency": "USD",
      "status": "checkoutCreated",
      "expiresAt": "2026-07-23T10:30:00Z",
      "checkoutUrlExpiresAt": "2026-07-23T10:30:00Z",
      "confirmedPaymentId": null,
      "createdAt": "2026-07-23T10:00:00Z",
      "updatedAt": "2026-07-23T10:02:00Z"
    }
  ],
  "meta": {
    "traceId": "req_123456",
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

### No debe incluir

```text id="md9obi"
checkoutUrl en listados
secret refs
raw provider payload
webhook data
datos de tarjeta
```

---

## 14.2. `POST /api/v1/tenant/payment-intents`

Crea PaymentIntent administrativo.

### Permiso

```text id="yq09yb"
paymentIntents.create
```

### Request body — cargos específicos

```json id="qmbmaw"
{
  "tenantProviderConfigId": "tenant_provider_config_uuid",
  "paymentPurpose": "payCharges",
  "sourceModule": "duesFees",
  "sourceResourceType": "charges",
  "propertyUnitId": "property_unit_uuid",
  "items": [
    {
      "itemType": "charge",
      "chargeId": "charge_uuid"
    }
  ],
  "returnUrl": "https://app.resident.example/payments/return",
  "cancelUrl": "https://app.resident.example/payments/cancel",
  "metadata": {
    "notes": "Intent administrativo"
  }
}
```

### Request body — saldo total

```json id="g9bxb9"
{
  "tenantProviderConfigId": "tenant_provider_config_uuid",
  "paymentPurpose": "payAccountBalance",
  "sourceModule": "accountStatements",
  "sourceResourceType": "propertyUnitBalance",
  "propertyUnitId": "property_unit_uuid",
  "items": [
    {
      "itemType": "accountBalance",
      "propertyUnitId": "property_unit_uuid"
    }
  ],
  "returnUrl": "https://app.resident.example/payments/return",
  "cancelUrl": "https://app.resident.example/payments/cancel"
}
```

### Reglas

```text id="f4q8u4"
- tenantProviderConfig debe estar enabled;
- propertyUnit debe pertenecer al tenant;
- chargeIds deben pertenecer al tenant;
- cargos deben ser pagables;
- monto se calcula en servidor;
- no aceptar amount final del cliente como fuente de verdad;
- crear PaymentIntentItems;
- status inicial created;
- expiresAt server-side;
- audita paymentIntent.created.
```

### Response `201`

```json id="i112uw"
{
  "data": {
    "id": "payment_intent_uuid",
    "tenantProviderConfigId": "tenant_provider_config_uuid",
    "providerKey": "mockHostedCheckout",
    "paymentPurpose": "payCharges",
    "amount": "125.50",
    "currency": "USD",
    "status": "created",
    "expiresAt": "2026-07-23T10:30:00Z",
    "items": [
      {
        "id": "payment_intent_item_uuid",
        "itemType": "charge",
        "chargeId": "charge_uuid",
        "propertyUnitId": "property_unit_uuid",
        "description": "Alícuota julio 2026",
        "amount": "125.50",
        "currency": "USD"
      }
    ],
    "createdAt": "2026-07-23T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Rechazar

```text id="ijw2hq"
tenantId
amount arbitrario para cargos/saldo
currency no soportada
status
confirmedPaymentId
providerIntentId manual no controlado
providerSessionId manual
checkoutUrl
cardNumber
PAN
CVV
createdBy
createdAt
```

---

## 14.3. `GET /api/v1/tenant/payment-intents/{paymentIntentId}`

Obtiene PaymentIntent.

### Permiso

```text id="m9kvzn"
paymentIntents.read
```

### Response `200`

Devuelve `PaymentIntentDto` con `items`, sin `checkoutUrl`.

---

## 14.4. `POST /api/v1/tenant/payment-intents/{paymentIntentId}/checkout-sessions`

Crea sesión de checkout.

### Permiso

```text id="obdcf9"
paymentCheckoutSessions.create
```

### Request body

```json id="m6qtro"
{
  "metadata": {
    "clientFlow": "admin"
  }
}
```

### Reglas

```text id="v7oemi"
- PaymentIntent debe pertenecer al tenant;
- PaymentIntent debe estar created o checkoutCreated compatible;
- PaymentIntent no debe estar expired/cancelled/succeeded/failed/archived;
- tenantProviderConfig debe estar enabled;
- adapter crea sesión externa;
- checkoutUrl temporal puede devolverse solo en esta respuesta;
- checkoutUrl no debe registrarse en logs;
- audita paymentCheckoutSession.created y paymentIntent.checkoutCreated.
```

### Response `201`

```json id="fgsj5p"
{
  "data": {
    "id": "checkout_session_uuid",
    "paymentIntentId": "payment_intent_uuid",
    "providerKey": "mockHostedCheckout",
    "providerSessionId": "provider_session_123",
    "providerCheckoutUrl": "https://checkout.example/session/provider_session_123",
    "status": "created",
    "expiresAt": "2026-07-23T10:30:00Z",
    "createdAt": "2026-07-23T10:01:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

Nota:

```text id="x8iwsf"
providerCheckoutUrl solo se devuelve en la respuesta inmediata de creación a un usuario autorizado. No debe aparecer en listados, logs ni auditoría.
```

---

## 14.5. `POST /api/v1/tenant/payment-intents/{paymentIntentId}/cancel`

Cancela una intención.

### Permiso

```text id="ips295"
paymentIntents.cancel
```

### Request body

```json id="s7sesu"
{
  "reason": "Usuario solicitó cancelar el pago"
}
```

### Response `200`

```json id="u5ynfz"
{
  "data": {
    "id": "payment_intent_uuid",
    "status": "cancelled",
    "cancelledAt": "2026-07-23T10:10:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 14.6. `POST /api/v1/tenant/payment-intents/{paymentIntentId}/expire`

Expira una intención.

### Permiso

```text id="g5utiu"
paymentIntents.expire
```

### Request body

```json id="avgpik"
{
  "reason": "TTL vencido"
}
```

### Response `200`

```json id="l6ab4k"
{
  "data": {
    "id": "payment_intent_uuid",
    "status": "expired",
    "expiredAt": "2026-07-23T10:30:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 15. API — Own Payment Intents

## 15.1. `GET /api/v1/me/payment-intents`

Lista intenciones propias del usuario.

### Permiso

```text id="i3al5g"
paymentIntents.read.own
```

### Query params

```text id="n0gzm0"
propertyUnitId
paymentPurpose
status
createdFrom
createdTo
page
pageSize
sortBy
sortOrder
```

### Response `200`

```json id="yy4ioi"
{
  "data": [
    {
      "id": "payment_intent_uuid",
      "paymentPurpose": "payCharges",
      "amount": "125.50",
      "currency": "USD",
      "status": "checkoutCreated",
      "expiresAt": "2026-07-23T10:30:00Z",
      "safeProviderDisplayName": "Pago en línea",
      "createdAt": "2026-07-23T10:00:00Z",
      "confirmedAt": null,
      "items": [
        {
          "itemType": "charge",
          "description": "Alícuota julio 2026",
          "amount": "125.50",
          "currency": "USD"
        }
      ]
    }
  ],
  "meta": {
    "traceId": "req_123456",
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

### No debe incluir

```text id="uvk9q5"
tenantProviderConfigId interno si la política no lo requiere
secret refs
provider raw data
webhook events
admin metadata
checkoutUrl en listados
```

---

## 15.2. `POST /api/v1/me/payment-intents`

Crea intención propia.

### Permiso

```text id="su4np3"
paymentIntents.create.own
```

### Request body — cargos propios

```json id="ul0gdt"
{
  "tenantProviderConfigId": "tenant_provider_config_uuid",
  "paymentPurpose": "payCharges",
  "propertyUnitId": "property_unit_uuid",
  "items": [
    {
      "itemType": "charge",
      "chargeId": "charge_uuid"
    }
  ],
  "returnUrl": "https://app.resident.example/me/payments/return",
  "cancelUrl": "https://app.resident.example/me/payments/cancel"
}
```

### Request body — saldo propio

```json id="zpm0yl"
{
  "tenantProviderConfigId": "tenant_provider_config_uuid",
  "paymentPurpose": "payAccountBalance",
  "propertyUnitId": "property_unit_uuid",
  "items": [
    {
      "itemType": "accountBalance",
      "propertyUnitId": "property_unit_uuid"
    }
  ],
  "returnUrl": "https://app.resident.example/me/payments/return",
  "cancelUrl": "https://app.resident.example/me/payments/cancel"
}
```

### Reglas

```text id="xdbkpw"
- usuario debe estar autenticado;
- usuario debe tener relación válida con propertyUnit;
- tenantProviderConfig debe estar enabled;
- cargos deben pertenecer a propertyUnit autorizada;
- cargos deben ser pagables;
- monto se calcula en servidor;
- no se permite pago anónimo;
- no se permite pagar unidad ajena;
- audita paymentIntent.created.
```

### Response `201`

Devuelve `OwnPaymentIntentDto`.

---

## 15.3. `GET /api/v1/me/payment-intents/{paymentIntentId}`

Obtiene intención propia.

### Permiso

```text id="emjfqy"
paymentIntents.read.own
```

### Response `200`

Devuelve `OwnPaymentIntentDto`.

---

## 15.4. `POST /api/v1/me/payment-intents/{paymentIntentId}/checkout-sessions`

Crea checkout session propia.

### Permiso

```text id="ky9wl1"
paymentCheckoutSessions.create.own
```

### Request body

```json id="camkwl"
{
  "metadata": {
    "clientFlow": "residentPortal"
  }
}
```

### Response `201`

```json id="fnd22s"
{
  "data": {
    "id": "checkout_session_uuid",
    "paymentIntentId": "payment_intent_uuid",
    "providerKey": "mockHostedCheckout",
    "providerCheckoutUrl": "https://checkout.example/session/provider_session_123",
    "status": "created",
    "expiresAt": "2026-07-23T10:30:00Z",
    "createdAt": "2026-07-23T10:01:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 15.5. `POST /api/v1/me/payment-intents/{paymentIntentId}/cancel`

Cancela intención propia si aún no fue confirmada.

### Permiso

```text id="cck16w"
paymentIntents.cancel.own
```

### Request body

```json id="ua0kxx"
{
  "reason": "Ya no deseo continuar con este pago"
}
```

### Response `200`

```json id="mbjrjp"
{
  "data": {
    "id": "payment_intent_uuid",
    "status": "cancelled",
    "cancelledAt": "2026-07-23T10:10:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 16. API — Webhook Endpoint

## 16.1. `POST /api/v1/webhooks/payment-providers/{providerKey}`

Recibe webhook del proveedor.

### Autenticación

No usa Bearer token de usuario.

### Seguridad obligatoria

```text id="zdj4yz"
provider signature required
timestamp validation if supported
payloadHash
replay protection
providerEventId idempotency
providerTransactionId uniqueness
safe error response
no raw payload in logs
```

### Headers conceptuales

```http id="pujimt"
Content-Type: application/json
X-Provider-Signature: <signature>
X-Provider-Timestamp: <timestamp>
X-Provider-Event-Id: <event-id>
```

### Request body

El body depende del proveedor. El adaptador debe parsearlo.

Ejemplo mock:

```json id="a9239x"
{
  "eventId": "evt_123",
  "eventType": "payment.succeeded",
  "providerKey": "mockHostedCheckout",
  "providerTransactionId": "txn_123",
  "providerSessionId": "provider_session_123",
  "paymentIntentId": "payment_intent_uuid",
  "amount": "125.50",
  "currency": "USD",
  "status": "succeeded",
  "paymentMethod": {
    "type": "card",
    "brand": "visa",
    "last4": "4242"
  },
  "processedAt": "2026-07-23T10:05:00Z"
}
```

### Reglas

```text id="zoif86"
- no confiar en paymentIntentId sin validación;
- resolver provider config;
- validar firma antes de efectos financieros;
- detectar duplicados;
- verificar amount/currency;
- crear ProviderWebhookEvent;
- crear ProviderTransaction;
- crear Payment interno solo si evento verificado y exitoso;
- crear ProviderPaymentMapping;
- actualizar PaymentIntent;
- auditar.
```

### Response `200`

```json id="mzbycs"
{
  "received": true,
  "processed": true
}
```

### Response duplicado `200`

```json id="hg8xew"
{
  "received": true,
  "processed": false,
  "duplicate": true
}
```

### Response firma inválida `401` o `403`

```json id="ypzxlf"
{
  "error": {
    "code": "PROVIDER_WEBHOOK_SIGNATURE_INVALID",
    "message": "Webhook signature is invalid.",
    "traceId": "req_123456"
  }
}
```

### No revelar

```text id="mvhhax"
tenant existe
paymentIntent existe
secreto esperado
detalle interno de firma
stack trace
payload completo
```

---

# 17. API — Tenant Webhook Events

## 17.1. `GET /api/v1/tenant/payment-provider-webhook-events`

Lista eventos de webhook recibidos.

### Permiso

```text id="gvt64l"
paymentProviderWebhooks.read
```

### Query params

```text id="nd0yas"
providerKey
tenantProviderConfigId
paymentIntentId
providerEventId
eventType
signatureStatus
processingStatus
receivedFrom
receivedTo
processedFrom
processedTo
page
pageSize
sortBy
sortOrder
```

### Response `200`

```json id="xdg6gc"
{
  "data": [
    {
      "id": "webhook_event_uuid",
      "providerKey": "mockHostedCheckout",
      "tenantProviderConfigId": "tenant_provider_config_uuid",
      "paymentIntentId": "payment_intent_uuid",
      "providerEventId": "evt_123",
      "eventType": "payment.succeeded",
      "signatureStatus": "verified",
      "processingStatus": "processed",
      "receivedAt": "2026-07-23T10:05:00Z",
      "processedAt": "2026-07-23T10:05:01Z",
      "retryCount": 0,
      "payloadHashPrefix": "a1b2c3d4"
    }
  ],
  "meta": {
    "traceId": "req_123456",
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

---

## 17.2. `GET /api/v1/tenant/payment-provider-webhook-events/{webhookEventId}`

Obtiene evento sanitizado.

### Permiso

```text id="dkmwkw"
paymentProviderWebhooks.read
```

### Response `200`

Devuelve `ProviderWebhookEventDto`.

### No debe incluir

```text id="y6u4li"
raw payload
raw signature
webhook secret
datos de tarjeta
tokens
cookies
Authorization header
```

---

## 17.3. `POST /api/v1/tenant/payment-provider-webhook-events/{webhookEventId}/reprocess`

Reprocesa evento fallido.

### Permiso

```text id="ncva1j"
paymentProviderWebhooks.reprocess
```

### Request body

```json id="uh0j5h"
{
  "reason": "Error temporal corregido"
}
```

### Reglas

```text id="pxtq6c"
- evento debe pertenecer al tenant;
- solo failed puede reprocesarse ordinariamente;
- rejected por firma inválida no debe reprocesarse;
- duplicate no debe reprocesarse;
- processed no debe reprocesarse salvo flujo excepcional futuro;
- idempotencia se mantiene;
- incrementa retryCount;
- audita providerWebhook.reprocessed.
```

### Response `200`

```json id="qcwgxb"
{
  "data": {
    "id": "webhook_event_uuid",
    "processingStatus": "processed",
    "retryCount": 1,
    "processedAt": "2026-07-23T11:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 17.4. `POST /api/v1/tenant/payment-provider-webhook-events/{webhookEventId}/archive`

Archiva evento.

### Permiso

```text id="h95gly"
paymentProviderWebhooks.archive
```

### Request body

```json id="u4c3gi"
{
  "reason": "Evento histórico archivado"
}
```

### Response `200`

```json id="v76oem"
{
  "data": {
    "id": "webhook_event_uuid",
    "processingStatus": "archived",
    "archivedAt": "2026-07-23T12:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 18. API — Provider Transactions

## 18.1. `GET /api/v1/tenant/provider-transactions`

Lista transacciones externas.

### Permiso

```text id="sxddsb"
providerTransactions.read
```

### Query params

```text id="zz56ax"
paymentIntentId
providerWebhookEventId
tenantProviderConfigId
providerKey
providerTransactionId
providerReference
providerStatus
internalStatus
paymentMethodType
amountMin
amountMax
currency
createdFrom
createdTo
processedFrom
processedTo
settledFrom
settledTo
page
pageSize
sortBy
sortOrder
```

### Response `200`

```json id="nljjrn"
{
  "data": [
    {
      "id": "provider_transaction_uuid",
      "paymentIntentId": "payment_intent_uuid",
      "providerWebhookEventId": "webhook_event_uuid",
      "providerKey": "mockHostedCheckout",
      "providerTransactionId": "txn_123",
      "providerReference": "REF-123",
      "providerStatus": "succeeded",
      "internalStatus": "paymentCreated",
      "amount": "125.50",
      "currency": "USD",
      "feeAmount": "3.00",
      "netAmount": "122.50",
      "paymentMethodType": "card",
      "cardBrand": "visa",
      "cardLast4": "4242",
      "authorizationCodePreview": "AUTH***45",
      "processedAt": "2026-07-23T10:05:01Z",
      "settledAt": null,
      "createdAt": "2026-07-23T10:05:01Z"
    }
  ],
  "meta": {
    "traceId": "req_123456",
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

### No debe incluir

```text id="ibfyae"
PAN
CVV
raw card data
raw provider payload
checkoutUrl
secretos
```

---

## 18.2. `GET /api/v1/tenant/provider-transactions/{providerTransactionId}`

Obtiene transacción externa.

### Permiso

```text id="zoi4lm"
providerTransactions.read
```

### Response `200`

Devuelve `ProviderTransactionDto`.

---

## 18.3. `POST /api/v1/tenant/provider-transactions/{providerTransactionId}/mark-review-required`

Marca transacción como requiere revisión.

### Permiso

```text id="ilcj9y"
providerTransactions.review
```

### Request body

```json id="h963sr"
{
  "reason": "Diferencia entre monto del proveedor e intent interno"
}
```

### Response `200`

```json id="vtdtpd"
{
  "data": {
    "id": "provider_transaction_uuid",
    "internalStatus": "requiresReview",
    "requiresReviewAt": "2026-07-23T11:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 18.4. `POST /api/v1/tenant/provider-transactions/{providerTransactionId}/archive`

Archiva transacción.

### Permiso

```text id="e16v9a"
providerTransactions.archive
```

### Request body

```json id="fxrtzt"
{
  "reason": "Transacción histórica archivada"
}
```

### Response `200`

```json id="d3jlii"
{
  "data": {
    "id": "provider_transaction_uuid",
    "internalStatus": "ignored",
    "archivedAt": "2026-07-23T12:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 19. API — Provider Payment Mappings

## 19.1. `GET /api/v1/tenant/provider-payment-mappings`

Lista mappings entre proveedor y Payment interno.

### Permiso

```text id="tx303o"
providerPaymentMappings.read
```

### Query params

```text id="b8yv16"
paymentIntentId
providerTransactionId
paymentId
mappingStatus
createdFrom
createdTo
reversedFrom
reversedTo
page
pageSize
sortBy
sortOrder
```

### Response `200`

```json id="m28l1h"
{
  "data": [
    {
      "id": "mapping_uuid",
      "paymentIntentId": "payment_intent_uuid",
      "providerTransactionId": "provider_transaction_uuid",
      "paymentId": "payment_uuid",
      "mappingStatus": "active",
      "createdAt": "2026-07-23T10:05:02Z",
      "reversedAt": null
    }
  ],
  "meta": {
    "traceId": "req_123456",
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

---

## 19.2. `GET /api/v1/tenant/provider-payment-mappings/{mappingId}`

Obtiene mapping.

### Permiso

```text id="vesfod"
providerPaymentMappings.read
```

### Response `200`

Devuelve `ProviderPaymentMappingDto`.

---

## 19.3. `POST /api/v1/tenant/provider-payment-mappings/{mappingId}/reverse`

Marca mapping como revertido.

### Permiso

```text id="sw02aj"
providerPaymentMappings.reverse
```

### Request body

```json id="kvf31d"
{
  "reason": "Pago revertido por revisión administrativa"
}
```

### Reglas MVP

```text id="bmlivd"
- no ejecuta refund automático;
- no elimina Payment;
- no elimina ProviderTransaction;
- requiere reason;
- audita providerPaymentMapping.reversed;
- cualquier reverso financiero real debe coordinarse con Payments y futuras specs de refunds/disputas.
```

### Response `200`

```json id="t08mg1"
{
  "data": {
    "id": "mapping_uuid",
    "mappingStatus": "reversed",
    "reversedAt": "2026-07-23T12:30:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 20. API — Provider Settlements

## 20.1. `GET /api/v1/tenant/provider-settlements`

Lista settlements reportados por proveedor.

### Permiso

```text id="h60uzo"
providerSettlements.read
```

### Query params

```text id="r902nh"
tenantProviderConfigId
providerKey
providerSettlementId
settlementDateFrom
settlementDateTo
status
bankAccountId
bankTransactionId
page
pageSize
sortBy
sortOrder
```

### Response `200`

```json id="inkjf6"
{
  "data": [
    {
      "id": "settlement_uuid",
      "tenantProviderConfigId": "tenant_provider_config_uuid",
      "providerKey": "mockHostedCheckout",
      "providerSettlementId": "set_123",
      "settlementDate": "2026-07-24",
      "grossAmount": "500.00",
      "feeAmount": "12.50",
      "netAmount": "487.50",
      "currency": "USD",
      "status": "settled",
      "bankAccountId": "bank_account_uuid",
      "bankTransactionId": null,
      "createdAt": "2026-07-24T09:00:00Z",
      "linkedAt": null
    }
  ],
  "meta": {
    "traceId": "req_123456",
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

---

## 20.2. `GET /api/v1/tenant/provider-settlements/{settlementId}`

Obtiene settlement.

### Permiso

```text id="yzrr7v"
providerSettlements.read
```

### Response `200`

Devuelve `ProviderSettlementRecordDto`.

---

## 20.3. `POST /api/v1/tenant/provider-settlements/{settlementId}/link-bank-transaction`

Vincula settlement con movimiento bancario.

### Permiso

```text id="psnjz8"
providerSettlements.linkToBankTransaction
```

### Request body

```json id="htobxl"
{
  "bankAccountId": "bank_account_uuid",
  "bankTransactionId": "bank_transaction_uuid",
  "reason": "Liquidación identificada en estado bancario"
}
```

### Reglas

```text id="tokl41"
- settlement debe pertenecer al tenant;
- bankAccount debe pertenecer al tenant;
- bankTransaction debe pertenecer al tenant;
- no marca conciliación bancaria final por sí solo;
- Bank Reconciliation conserva validación final;
- audita providerSettlement.linkedToBankTransaction.
```

### Response `200`

```json id="nhe3cp"
{
  "data": {
    "id": "settlement_uuid",
    "bankAccountId": "bank_account_uuid",
    "bankTransactionId": "bank_transaction_uuid",
    "linkedAt": "2026-07-24T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 20.4. `POST /api/v1/tenant/provider-settlements/{settlementId}/archive`

Archiva settlement.

### Permiso

```text id="z0v07k"
providerSettlements.archive
```

### Request body

```json id="n62reg"
{
  "reason": "Settlement histórico archivado"
}
```

### Response `200`

```json id="r7u47q"
{
  "data": {
    "id": "settlement_uuid",
    "status": "unknown",
    "archivedAt": "2026-07-24T11:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 21. API — Payment Provider Reports

## 21.1. `GET /api/v1/tenant/payment-provider-reports/summary`

Resumen de pagos por proveedor.

### Permiso

```text id="psn4ky"
paymentProviderReports.read
```

### Query params

```text id="d2iipu"
providerKey
environment
status
periodStart
periodEnd
currency
```

### Response `200`

```json id="zfqxr7"
{
  "data": {
    "periodStart": "2026-07-01",
    "periodEnd": "2026-07-31",
    "providerKey": "mockHostedCheckout",
    "environment": "sandbox",
    "paymentIntentsCreated": 20,
    "paymentIntentsSucceeded": 15,
    "paymentIntentsFailed": 3,
    "paymentIntentsCancelled": 2,
    "grossAmount": "1875.00",
    "feeAmount": "45.00",
    "netAmount": "1830.00",
    "paymentsCreated": 15,
    "webhooksReceived": 18,
    "webhooksRejected": 1,
    "requiresReviewCount": 2,
    "currency": "USD"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 21.2. `GET /api/v1/tenant/payment-provider-reports/transactions`

Reporte de transacciones.

### Permiso

```text id="b6ka47"
paymentProviderReports.read
```

### Query params

```text id="him89z"
providerKey
providerStatus
internalStatus
paymentMethodType
periodStart
periodEnd
page
pageSize
```

### Response `200`

```json id="e0208u"
{
  "data": [
    {
      "providerTransactionId": "txn_123",
      "paymentIntentId": "payment_intent_uuid",
      "paymentId": "payment_uuid",
      "providerStatus": "succeeded",
      "internalStatus": "paymentCreated",
      "amount": "125.50",
      "currency": "USD",
      "feeAmount": "3.00",
      "netAmount": "122.50",
      "paymentMethodType": "card",
      "createdAt": "2026-07-23T10:05:01Z",
      "processedAt": "2026-07-23T10:05:01Z"
    }
  ],
  "meta": {
    "traceId": "req_123456",
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

---

## 21.3. `GET /api/v1/tenant/payment-provider-reports/failures`

Reporte de fallos.

### Permiso

```text id="qrd9sh"
paymentProviderReports.read
```

### Query params

```text id="dx6f27"
providerKey
errorCode
processingStatus
periodStart
periodEnd
page
pageSize
```

### Response `200`

```json id="c1nu68"
{
  "data": [
    {
      "paymentIntentId": "payment_intent_uuid",
      "webhookEventId": "webhook_event_uuid",
      "errorCode": "PROVIDER_TRANSACTION_AMOUNT_MISMATCH",
      "errorMessage": "Provider amount does not match payment intent.",
      "status": "requiresReview",
      "createdAt": "2026-07-23T10:05:01Z",
      "retryCount": 0
    }
  ],
  "meta": {
    "traceId": "req_123456",
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

---

## 21.4. `GET /api/v1/tenant/payment-provider-reports/settlements`

Reporte de settlements.

### Permiso

```text id="mmdss5"
paymentProviderReports.read
```

### Query params

```text id="x73ohi"
providerKey
status
settlementDateFrom
settlementDateTo
bankAccountId
page
pageSize
```

### Response `200`

```json id="if644o"
{
  "data": [
    {
      "providerSettlementId": "set_123",
      "settlementDate": "2026-07-24",
      "grossAmount": "500.00",
      "feeAmount": "12.50",
      "netAmount": "487.50",
      "currency": "USD",
      "status": "settled",
      "bankAccountId": "bank_account_uuid",
      "bankTransactionId": null
    }
  ],
  "meta": {
    "traceId": "req_123456",
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

---

## 21.5. `GET /api/v1/tenant/payment-provider-reports/export`

Exporta reporte.

### Permiso

```text id="yafkn1"
paymentProviderReports.export
```

### Query params

```text id="f6o9kb"
reportType
providerKey
periodStart
periodEnd
format
```

Valores:

```text id="ocy5df"
reportType = summary | transactions | failures | settlements
format = csv | xlsx | pdf
```

### Reglas

```text id="nthrc3"
- export tenant-scoped;
- si se persiste, usar Secure Document Storage;
- no exponer storageKey;
- no incluir secretos;
- no incluir raw payloads;
- no incluir checkoutUrl;
- no incluir PAN/CVV/raw card data;
- audita paymentProviderReport.exported.
```

### Response `200`

```json id="irbp18"
{
  "data": {
    "reportType": "transactions",
    "format": "xlsx",
    "secureDocumentId": "secure_document_uuid",
    "secureDocumentFileId": "secure_document_file_uuid",
    "downloadAvailable": true,
    "createdAt": "2026-07-23T16:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 22. Endpoints públicos prohibidos

No crear:

```text id="el0q6r"
GET  /api/v1/public/payment-providers
GET  /api/v1/public/payment-intents
POST /api/v1/public/payment-intents
GET  /api/v1/public/provider-transactions
GET  /api/v1/public/payment-provider-reports
GET  /api/v1/public/tenants/{slug}/payment-providers
POST /api/v1/public/tenants/{slug}/payment-intents
GET  /api/v1/public/tenants/{slug}/payment-provider-reports
```

Resultado esperado:

```text id="j3jslm"
404 route not found
```

Sin revelar:

```text id="axu1f7"
si el tenant existe
si el provider existe
si el intent existe
si una unidad tiene deuda
si el usuario tendría acceso
```

---

# 23. DTOs

## 23.1. `CreatePaymentProviderDefinitionDto`

```typescript id="ox8sbj"
type CreatePaymentProviderDefinitionDto = {
  providerKey: string;
  displayName: string;
  description?: string;
  supportedEnvironments: Array<"sandbox" | "production">;
  supportedCurrencies: Array<"USD">;
  supportedPaymentMethods: Array<
    "card" | "bankTransfer" | "wallet" | "paymentButton" | "qr" | "cashNetwork" | "other"
  >;
  supportsHostedCheckout?: boolean;
  supportsWebhooks?: boolean;
  supportsRefunds?: boolean;
  supportsInstallments?: boolean;
  supportsSettlements?: boolean;
  metadata?: Record<string, unknown>;
};
```

---

## 23.2. `PaymentProviderDefinitionDto`

```typescript id="j2k8ig"
type PaymentProviderDefinitionDto = {
  id: string;
  providerKey: string;
  displayName: string;
  description?: string | null;
  status: string;
  supportedEnvironments: string[];
  supportedCurrencies: string[];
  supportedPaymentMethods: string[];
  supportsHostedCheckout: boolean;
  supportsWebhooks: boolean;
  supportsRefunds: boolean;
  supportsInstallments: boolean;
  supportsSettlements: boolean;
  createdAt: string;
  updatedAt: string;
  activatedAt?: string | null;
  deprecatedAt?: string | null;
  archivedAt?: string | null;
  metadata?: Record<string, unknown>;
};
```

---

## 23.3. `CreateTenantPaymentProviderConfigDto`

```typescript id="a9dxoy"
type CreateTenantPaymentProviderConfigDto = {
  providerDefinitionId: string;
  providerKey: string;
  environment: "sandbox" | "production";
  displayName?: string;
  currency: "USD";
  credentialSecretInput?: {
    mode: "secretRef" | "secretValue";
    secretRef?: string;
    secretValue?: string;
  };
  webhookSecretInput?: {
    mode: "secretRef" | "secretValue";
    secretRef?: string;
    secretValue?: string;
  };
  publicConfig?: Record<string, unknown>;
  settlementBankAccountId?: string;
  returnUrl?: string;
  cancelUrl?: string;
  allowedOrigins?: string[];
  metadata?: Record<string, unknown>;
};
```

Regla:

```text id="bxmcpu"
Si secretValue se recibe, debe transformarse inmediatamente en SecretRef y nunca persistirse en la tabla ni registrarse en logs/auditoría.
```

---

## 23.4. `TenantPaymentProviderConfigDto`

```typescript id="sdohvj"
type TenantPaymentProviderConfigDto = {
  id: string;
  providerDefinitionId: string;
  providerKey: string;
  environment: "sandbox" | "production";
  status: string;
  displayName?: string | null;
  currency: "USD";
  credentialSecretConfigured: boolean;
  webhookSecretConfigured: boolean;
  publicConfig?: Record<string, unknown>;
  settlementBankAccountId?: string | null;
  webhookEndpointPath?: string | null;
  returnUrl?: string | null;
  cancelUrl?: string | null;
  allowedOrigins?: string[];
  createdAt: string;
  updatedAt: string;
  enabledAt?: string | null;
  disabledAt?: string | null;
  testedAt?: string | null;
  invalidatedAt?: string | null;
  archivedAt?: string | null;
  metadata?: Record<string, unknown>;
};
```

No incluye:

```text id="e7gdky"
credentialSecret value
webhookSecret value
raw token
raw key
raw private key
```

---

## 23.5. `CreatePaymentIntentDto`

```typescript id="e76joj"
type CreatePaymentIntentDto = {
  tenantProviderConfigId: string;
  paymentPurpose:
    | "payCharges"
    | "payAccountBalance"
    | "payFine"
    | "payReservation"
    | "payOther";
  sourceModule:
    | "duesFees"
    | "payments"
    | "accountStatements"
    | "fines"
    | "reservations"
    | "system"
    | "other";
  sourceResourceType?: string;
  sourceResourceId?: string;
  propertyUnitId?: string;
  items: Array<{
    itemType: "charge" | "fine" | "reservation" | "accountBalance" | "manualItem" | "other";
    chargeId?: string;
    fineId?: string;
    reservationId?: string;
    accountStatementId?: string;
    propertyUnitId?: string;
    description?: string;
  }>;
  returnUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, unknown>;
};
```

Prohibido:

```text id="s75wah"
amount como fuente de verdad externa
tenantId
status
confirmedPaymentId
providerTransactionId
card data
```

---

## 23.6. `PaymentIntentDto`

```typescript id="qljbl2"
type PaymentIntentDto = {
  id: string;
  tenantProviderConfigId: string;
  providerKey?: string;
  personId?: string | null;
  propertyUnitId?: string | null;
  sourceModule: string;
  sourceResourceType?: string | null;
  sourceResourceId?: string | null;
  paymentPurpose: string;
  amount: string;
  currency: "USD";
  status: string;
  expiresAt: string;
  checkoutUrlExpiresAt?: string | null;
  confirmedPaymentId?: string | null;
  createdAt: string;
  updatedAt: string;
  checkoutCreatedAt?: string | null;
  confirmedAt?: string | null;
  failedAt?: string | null;
  cancelledAt?: string | null;
  expiredAt?: string | null;
  items: PaymentIntentItemDto[];
  metadata?: Record<string, unknown>;
};
```

---

## 23.7. `OwnPaymentIntentDto`

```typescript id="kjdmu9"
type OwnPaymentIntentDto = {
  id: string;
  paymentPurpose: string;
  amount: string;
  currency: "USD";
  status: string;
  expiresAt: string;
  safeProviderDisplayName: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string | null;
  failedAt?: string | null;
  cancelledAt?: string | null;
  expiredAt?: string | null;
  items: Array<{
    itemType: string;
    description: string;
    amount: string;
    currency: "USD";
  }>;
};
```

---

## 23.8. `PaymentIntentItemDto`

```typescript id="a87tu8"
type PaymentIntentItemDto = {
  id: string;
  itemType: string;
  chargeId?: string | null;
  fineId?: string | null;
  reservationId?: string | null;
  accountStatementId?: string | null;
  propertyUnitId?: string | null;
  description?: string | null;
  amount: string;
  currency: "USD";
};
```

---

## 23.9. `CreatePaymentCheckoutSessionDto`

```typescript id="yemhu2"
type CreatePaymentCheckoutSessionDto = {
  metadata?: Record<string, unknown>;
};
```

---

## 23.10. `PaymentCheckoutSessionDto`

```typescript id="l2g094"
type PaymentCheckoutSessionDto = {
  id: string;
  paymentIntentId: string;
  providerKey: string;
  providerSessionId?: string | null;
  providerCheckoutUrl?: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};
```

Regla:

```text id="gki1gl"
providerCheckoutUrl solo se permite en respuesta inmediata autorizada de creación de checkout.
```

---

## 23.11. `ProviderWebhookEventDto`

```typescript id="zgibqj"
type ProviderWebhookEventDto = {
  id: string;
  providerKey: string;
  tenantProviderConfigId?: string | null;
  paymentIntentId?: string | null;
  providerEventId?: string | null;
  eventType?: string | null;
  signatureStatus: string;
  processingStatus: string;
  receivedAt: string;
  processedAt?: string | null;
  rejectedAt?: string | null;
  failedAt?: string | null;
  retryCount: number;
  lastRetryAt?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  payloadHashPrefix: string;
  metadata?: Record<string, unknown>;
};
```

---

## 23.12. `ProviderTransactionDto`

```typescript id="d8hmln"
type ProviderTransactionDto = {
  id: string;
  paymentIntentId?: string | null;
  providerWebhookEventId?: string | null;
  providerKey: string;
  providerTransactionId?: string | null;
  providerReference?: string | null;
  providerStatus: string;
  internalStatus: string;
  amount: string;
  currency: "USD";
  feeAmount?: string | null;
  netAmount?: string | null;
  paymentMethodType?: string | null;
  cardBrand?: string | null;
  cardLast4?: string | null;
  authorizationCodePreview?: string | null;
  providerProcessedAt?: string | null;
  processedAt?: string | null;
  settledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  requiresReviewAt?: string | null;
  reviewReason?: string | null;
  metadata?: Record<string, unknown>;
};
```

---

## 23.13. `ProviderPaymentMappingDto`

```typescript id="e2dfnl"
type ProviderPaymentMappingDto = {
  id: string;
  paymentIntentId: string;
  providerTransactionId: string;
  paymentId: string;
  mappingStatus: string;
  createdAt: string;
  reversedAt?: string | null;
  reverseReason?: string | null;
  metadata?: Record<string, unknown>;
};
```

---

## 23.14. `ProviderSettlementRecordDto`

```typescript id="tc9bc7"
type ProviderSettlementRecordDto = {
  id: string;
  tenantProviderConfigId: string;
  providerKey: string;
  providerSettlementId?: string | null;
  settlementDate: string;
  grossAmount: string;
  feeAmount?: string | null;
  netAmount?: string | null;
  currency: "USD";
  status: string;
  bankAccountId?: string | null;
  bankTransactionId?: string | null;
  createdAt: string;
  updatedAt: string;
  linkedAt?: string | null;
  metadata?: Record<string, unknown>;
};
```

---

# 24. Matriz de endpoints

| Endpoint                                                  | Método | Permiso                                     | Audit event                                  |
| --------------------------------------------------------- | -----: | ------------------------------------------- | -------------------------------------------- |
| `/platform/payment-provider-definitions`                  |    GET | `paymentProviderDefinitions.read`           | —                                            |
| `/platform/payment-provider-definitions`                  |   POST | `paymentProviderDefinitions.create`         | `paymentProviderDefinition.created`          |
| `/platform/payment-provider-definitions/{id}`             |    GET | `paymentProviderDefinitions.read`           | —                                            |
| `/platform/payment-provider-definitions/{id}`             |  PATCH | `paymentProviderDefinitions.update`         | `paymentProviderDefinition.updated`          |
| `/platform/payment-provider-definitions/{id}/activate`    |   POST | `paymentProviderDefinitions.activate`       | `paymentProviderDefinition.activated`        |
| `/platform/payment-provider-definitions/{id}/deprecate`   |   POST | `paymentProviderDefinitions.deprecate`      | `paymentProviderDefinition.deprecated`       |
| `/platform/payment-provider-definitions/{id}/archive`     |   POST | `paymentProviderDefinitions.archive`        | `paymentProviderDefinition.archived`         |
| `/tenant/payment-providers`                               |    GET | `tenantPaymentProviders.read`               | —                                            |
| `/tenant/payment-providers`                               |   POST | `tenantPaymentProviders.create`             | `tenantPaymentProviderConfig.created`        |
| `/tenant/payment-providers/{id}`                          |    GET | `tenantPaymentProviders.read`               | —                                            |
| `/tenant/payment-providers/{id}`                          |  PATCH | `tenantPaymentProviders.update`             | `tenantPaymentProviderConfig.updated`        |
| `/tenant/payment-providers/{id}/enable`                   |   POST | `tenantPaymentProviders.enable`             | `tenantPaymentProviderConfig.enabled`        |
| `/tenant/payment-providers/{id}/disable`                  |   POST | `tenantPaymentProviders.disable`            | `tenantPaymentProviderConfig.disabled`       |
| `/tenant/payment-providers/{id}/test-connection`          |   POST | `tenantPaymentProviders.testConnection`     | `tenantPaymentProviderConfig.tested`         |
| `/tenant/payment-providers/{id}/archive`                  |   POST | `tenantPaymentProviders.archive`            | `tenantPaymentProviderConfig.archived`       |
| `/tenant/payment-intents`                                 |    GET | `paymentIntents.read`                       | —                                            |
| `/tenant/payment-intents`                                 |   POST | `paymentIntents.create`                     | `paymentIntent.created`                      |
| `/tenant/payment-intents/{id}`                            |    GET | `paymentIntents.read`                       | —                                            |
| `/tenant/payment-intents/{id}/checkout-sessions`          |   POST | `paymentCheckoutSessions.create`            | `paymentCheckoutSession.created`             |
| `/tenant/payment-intents/{id}/cancel`                     |   POST | `paymentIntents.cancel`                     | `paymentIntent.cancelled`                    |
| `/tenant/payment-intents/{id}/expire`                     |   POST | `paymentIntents.expire`                     | `paymentIntent.expired`                      |
| `/me/payment-intents`                                     |    GET | `paymentIntents.read.own`                   | —                                            |
| `/me/payment-intents`                                     |   POST | `paymentIntents.create.own`                 | `paymentIntent.created`                      |
| `/me/payment-intents/{id}`                                |    GET | `paymentIntents.read.own`                   | —                                            |
| `/me/payment-intents/{id}/checkout-sessions`              |   POST | `paymentCheckoutSessions.create.own`        | `paymentCheckoutSession.created`             |
| `/me/payment-intents/{id}/cancel`                         |   POST | `paymentIntents.cancel.own`                 | `paymentIntent.cancelled`                    |
| `/webhooks/payment-providers/{providerKey}`               |   POST | Provider signature                          | `providerWebhook.received`                   |
| `/tenant/payment-provider-webhook-events`                 |    GET | `paymentProviderWebhooks.read`              | —                                            |
| `/tenant/payment-provider-webhook-events/{id}`            |    GET | `paymentProviderWebhooks.read`              | —                                            |
| `/tenant/payment-provider-webhook-events/{id}/reprocess`  |   POST | `paymentProviderWebhooks.reprocess`         | `providerWebhook.reprocessed`                |
| `/tenant/payment-provider-webhook-events/{id}/archive`    |   POST | `paymentProviderWebhooks.archive`           | `providerWebhook.archived`                   |
| `/tenant/provider-transactions`                           |    GET | `providerTransactions.read`                 | —                                            |
| `/tenant/provider-transactions/{id}`                      |    GET | `providerTransactions.read`                 | —                                            |
| `/tenant/provider-transactions/{id}/mark-review-required` |   POST | `providerTransactions.review`               | `providerTransaction.requiresReview`         |
| `/tenant/provider-transactions/{id}/archive`              |   POST | `providerTransactions.archive`              | `providerTransaction.archived`               |
| `/tenant/provider-payment-mappings`                       |    GET | `providerPaymentMappings.read`              | —                                            |
| `/tenant/provider-payment-mappings/{id}`                  |    GET | `providerPaymentMappings.read`              | —                                            |
| `/tenant/provider-payment-mappings/{id}/reverse`          |   POST | `providerPaymentMappings.reverse`           | `providerPaymentMapping.reversed`            |
| `/tenant/provider-settlements`                            |    GET | `providerSettlements.read`                  | —                                            |
| `/tenant/provider-settlements/{id}`                       |    GET | `providerSettlements.read`                  | —                                            |
| `/tenant/provider-settlements/{id}/link-bank-transaction` |   POST | `providerSettlements.linkToBankTransaction` | `providerSettlement.linkedToBankTransaction` |
| `/tenant/provider-settlements/{id}/archive`               |   POST | `providerSettlements.archive`               | `providerSettlement.archived`                |
| `/tenant/payment-provider-reports/summary`                |    GET | `paymentProviderReports.read`               | —                                            |
| `/tenant/payment-provider-reports/transactions`           |    GET | `paymentProviderReports.read`               | —                                            |
| `/tenant/payment-provider-reports/failures`               |    GET | `paymentProviderReports.read`               | —                                            |
| `/tenant/payment-provider-reports/settlements`            |    GET | `paymentProviderReports.read`               | —                                            |
| `/tenant/payment-provider-reports/export`                 |    GET | `paymentProviderReports.export`             | `paymentProviderReport.exported`             |

---

# 25. Códigos de error

## 25.1. Generales

```text id="kqp5gs"
UNAUTHORIZED
FORBIDDEN
VALIDATION_ERROR
NOT_FOUND
CONFLICT
RATE_LIMITED
INTERNAL_ERROR
```

---

## 25.2. Provider definitions

```text id="p7aqvz"
PAYMENT_PROVIDER_DEFINITION_NOT_FOUND
PAYMENT_PROVIDER_DEFINITION_FORBIDDEN
PAYMENT_PROVIDER_DEFINITION_INVALID_STATUS
PAYMENT_PROVIDER_DEFINITION_ARCHIVED
PAYMENT_PROVIDER_UNSUPPORTED
PAYMENT_PROVIDER_DEPRECATED
```

---

## 25.3. Tenant provider configs

```text id="cqvi15"
TENANT_PAYMENT_PROVIDER_CONFIG_NOT_FOUND
TENANT_PAYMENT_PROVIDER_CONFIG_FORBIDDEN
TENANT_PAYMENT_PROVIDER_CONFIG_INVALID_STATUS
TENANT_PAYMENT_PROVIDER_CONFIG_DISABLED
TENANT_PAYMENT_PROVIDER_CONFIG_INVALID
TENANT_PAYMENT_PROVIDER_CONFIG_ARCHIVED
TENANT_PAYMENT_PROVIDER_CONFIG_CROSS_TENANT_REFERENCE
TENANT_PAYMENT_PROVIDER_SECRET_INVALID
TENANT_PAYMENT_PROVIDER_CONNECTION_FAILED
```

---

## 25.4. Payment intents

```text id="hdd6yg"
PAYMENT_INTENT_NOT_FOUND
PAYMENT_INTENT_FORBIDDEN
PAYMENT_INTENT_INVALID_STATUS
PAYMENT_INTENT_EXPIRED
PAYMENT_INTENT_CANCELLED
PAYMENT_INTENT_ALREADY_SUCCEEDED
PAYMENT_INTENT_CROSS_TENANT_REFERENCE
PAYMENT_INTENT_NO_ITEMS
PAYMENT_INTENT_AMOUNT_MISMATCH
PAYMENT_INTENT_CURRENCY_UNSUPPORTED
PAYMENT_INTENT_SOURCE_INVALID
PAYMENT_INTENT_SOURCE_CROSS_TENANT
PAYMENT_INTENT_OWNERSHIP_FORBIDDEN
PAYMENT_INTENT_IDEMPOTENCY_CONFLICT
```

---

## 25.5. Checkout sessions

```text id="z7ueyc"
CHECKOUT_SESSION_NOT_FOUND
CHECKOUT_SESSION_FORBIDDEN
CHECKOUT_SESSION_INVALID_STATUS
CHECKOUT_SESSION_CREATION_FAILED
CHECKOUT_SESSION_EXPIRED
CHECKOUT_URL_EXPOSURE_FORBIDDEN
```

---

## 25.6. Webhooks

```text id="i0sbh3"
PROVIDER_WEBHOOK_SIGNATURE_MISSING
PROVIDER_WEBHOOK_SIGNATURE_INVALID
PROVIDER_WEBHOOK_TIMESTAMP_EXPIRED
PROVIDER_WEBHOOK_REPLAY_DETECTED
PROVIDER_WEBHOOK_DUPLICATE
PROVIDER_WEBHOOK_PAYLOAD_INVALID
PROVIDER_WEBHOOK_PROCESSING_FAILED
PROVIDER_WEBHOOK_REPROCESS_FORBIDDEN
PROVIDER_WEBHOOK_EVENT_NOT_FOUND
```

---

## 25.7. Provider transactions

```text id="bkizz0"
PROVIDER_TRANSACTION_NOT_FOUND
PROVIDER_TRANSACTION_FORBIDDEN
PROVIDER_TRANSACTION_DUPLICATE
PROVIDER_TRANSACTION_AMOUNT_MISMATCH
PROVIDER_TRANSACTION_CURRENCY_MISMATCH
PROVIDER_TRANSACTION_REQUIRES_REVIEW
PROVIDER_TRANSACTION_NOT_PAYABLE
PROVIDER_TRANSACTION_CROSS_TENANT_REFERENCE
```

---

## 25.8. Mappings

```text id="k4ne5t"
PROVIDER_PAYMENT_MAPPING_NOT_FOUND
PROVIDER_PAYMENT_MAPPING_FORBIDDEN
PROVIDER_PAYMENT_MAPPING_DUPLICATE
PROVIDER_PAYMENT_MAPPING_INVALID_STATUS
PROVIDER_PAYMENT_MAPPING_REVERSE_REASON_REQUIRED
```

---

## 25.9. Settlements

```text id="dobcmd"
PROVIDER_SETTLEMENT_NOT_FOUND
PROVIDER_SETTLEMENT_FORBIDDEN
PROVIDER_SETTLEMENT_CROSS_TENANT_REFERENCE
PROVIDER_SETTLEMENT_BANK_TRANSACTION_INVALID
```

---

## 25.10. Payments integration

```text id="b58kc0"
PAYMENT_CREATION_FROM_PROVIDER_FAILED
PAYMENT_ALREADY_CREATED_FROM_PROVIDER
PAYMENT_ALLOCATION_FROM_PROVIDER_FAILED
PAYMENT_SOURCE_NOT_SUPPORTED
PAYMENT_PROVIDER_MAPPING_FAILED
```

---

## 25.11. Security

```text id="fxk28a"
CARD_DATA_FORBIDDEN
SECRET_EXPOSURE_FORBIDDEN
RAW_PROVIDER_PAYLOAD_FORBIDDEN
PUBLIC_PAYMENT_ENDPOINT_FORBIDDEN
CHECKOUT_URL_LOGGING_FORBIDDEN
EXTERNAL_AI_PAYMENT_DATA_FORBIDDEN
```

---

# 26. Integración con `005-payments`

## 26.1. Creación de Payment

El módulo debe crear Payment interno solo mediante puerto controlado:

```text id="ysdk2e"
PaymentsIntegrationPort.createPaymentFromProvider
```

Condiciones:

```text id="bknfph"
- webhook verificado;
- PaymentIntent tenant-scoped;
- ProviderTransaction tenant-scoped;
- amount coincide;
- currency coincide;
- providerTransactionId único;
- no existe Payment previo para esa transacción;
- items siguen siendo pagables;
- operación idempotente.
```

---

## 26.2. Datos hacia Payments

```text id="yeqrsp"
tenantId
propertyUnitId
personId
amount
currency
paymentDate
paymentSource=provider
providerKey
providerTransactionId
providerReference
providerPaymentMappingId
providerVerifiedAt
items/cargos a asignar
metadata segura
```

---

## 26.3. Datos prohibidos hacia Payments

```text id="uuufcg"
PAN
CVV
raw card payload
provider secret
webhook secret
full webhook payload
checkoutUrl
raw signature
tokens
cookies
```

---

## 26.4. Account Statements

```text id="ourb6p"
Account Statements se actualiza por efecto del Payment interno, no por ProviderTransaction directamente.
```

---

# 27. Integración con `017-bank-reconciliation`

## 27.1. Regla

```text id="fzf5es"
Provider payment verificado no equivale automáticamente a conciliación bancaria final.
```

---

## 27.2. Uso

```text id="jgcfdo"
- ProviderTransaction puede ayudar a identificar pago;
- ProviderSettlementRecord puede vincularse con BankTransaction;
- Bank Reconciliation valida movimiento bancario real;
- Payment puede marcarse provider-verified pero no bank-reconciled automáticamente.
```

---

# 28. Integración con `016-secure-document-storage`

## 28.1. Usos

```text id="lc26ti"
- comprobantes del proveedor;
- recibos generados;
- exports de reportes;
- evidencia técnica resumida.
```

---

## 28.2. Reglas

```text id="nvhv8v"
- no exponer storageKey;
- no almacenar raw provider payload sensible como documento ordinario;
- clasificar documentos financieros como confidential/restricted;
- visibility owners para comprobantes propios;
- visibility administrative para reportes internos;
- sourceModule = paymentProviderIntegration.
```

---

# 29. Auditoría

## 29.1. Eventos obligatorios

```text id="owsf05"
paymentProviderDefinition.created
paymentProviderDefinition.updated
paymentProviderDefinition.activated
paymentProviderDefinition.deprecated
paymentProviderDefinition.archived

tenantPaymentProviderConfig.created
tenantPaymentProviderConfig.updated
tenantPaymentProviderConfig.enabled
tenantPaymentProviderConfig.disabled
tenantPaymentProviderConfig.tested
tenantPaymentProviderConfig.invalidated
tenantPaymentProviderConfig.archived

paymentIntent.created
paymentIntent.checkoutCreated
paymentIntent.cancelled
paymentIntent.expired
paymentIntent.succeeded
paymentIntent.failed

paymentCheckoutSession.created
paymentCheckoutSession.opened
paymentCheckoutSession.completed
paymentCheckoutSession.cancelled
paymentCheckoutSession.expired

providerWebhook.received
providerWebhook.verified
providerWebhook.rejected
providerWebhook.duplicate
providerWebhook.processed
providerWebhook.failed
providerWebhook.reprocessed
providerWebhook.archived

providerTransaction.created
providerTransaction.updated
providerTransaction.succeeded
providerTransaction.failed
providerTransaction.requiresReview
providerTransaction.archived

payment.createdFromProvider
providerPaymentMapping.created
providerPaymentMapping.reversed
providerSettlement.created
providerSettlement.linkedToBankTransaction
paymentProviderReport.exported
```

---

## 29.2. Metadata permitida

```text id="vrg87y"
providerKey
environment
tenantProviderConfigId
paymentIntentId
checkoutSessionId
webhookEventId
providerEventId
providerTransactionId
paymentId
mappingId
settlementId
amount
currency
status
internalStatus
paymentMethodType
cardBrand
cardLast4
hashPrefix
outcome
traceId
```

---

## 29.3. Metadata prohibida

```text id="ewd0ax"
PAN
CVV
track data
PIN
full card token
provider secret
webhook secret
credentialSecret value
webhookSecret value
full webhook payload
full signature
checkoutUrl
storageKey
signedUrl
Authorization header
cookies
tokens
SQL raw
stack trace
datos personales completos innecesarios
```

---

# 30. Observabilidad

## 30.1. Logs seguros

Eventos sugeridos:

```text id="ltokxx"
paymentIntent.created
checkoutSession.created
providerWebhook.received
providerWebhook.verified
providerWebhook.rejected
providerWebhook.duplicate
providerWebhook.failed
providerTransaction.succeeded
providerTransaction.failed
payment.createdFromProvider
paymentProviderReport.exported
```

Campos permitidos:

```text id="wiqm2p"
traceId
requestId
correlationId
action
outcome
providerKey
environment
status
internalStatus
eventType
signatureStatus
processingStatus
paymentMethodType
currency
durationMs
errorCode
```

Campos prohibidos:

```text id="rx76vx"
tenantId como label de métrica
userId como label
personId como label
propertyUnitId como label
paymentIntentId como label
providerTransactionId como label
providerEventId como label
paymentId como label
credentialSecretRef
webhookSecretRef
checkoutUrl
cardLast4 como label
authorizationCode
raw payload
raw signature
tokens
cookies
Authorization header
SQL raw
stack trace en producción
```

---

## 30.2. Métricas

```text id="eqljyr"
payment_provider_configs_total
payment_intents_created_total
payment_intents_succeeded_total
payment_intents_failed_total
checkout_sessions_created_total
provider_webhooks_received_total
provider_webhooks_verified_total
provider_webhooks_rejected_total
provider_webhooks_duplicate_total
provider_transactions_succeeded_total
provider_transactions_failed_total
payments_created_from_provider_total
payment_provider_processing_errors_total
payment_provider_reprocess_attempts_total
```

Labels permitidos:

```text id="p82bj9"
providerKey
environment
status
internalStatus
eventType
signatureStatus
processingStatus
paymentMethodType
currency
outcome
```

Labels prohibidos:

```text id="n8uz5v"
tenantId
userId
personId
propertyUnitId
paymentIntentId
providerTransactionId
providerEventId
paymentId
credentialSecretRef
webhookSecretRef
checkoutUrl
cardLast4
authorizationCode
traceId
```

---

# 31. OpenAPI

## 31.1. Tags

```text id="r04wn4"
Payment Provider Definitions
Tenant Payment Providers
Payment Intents
My Payment Intents
Payment Checkout Sessions
Payment Provider Webhooks
Provider Transactions
Provider Payment Mappings
Provider Settlements
Payment Provider Reports
```

---

## 31.2. Extensiones requeridas

Para endpoints platform:

```yaml id="f0i3ht"
x-platform-scope: true
x-auth-required: true
x-payment-provider-integration: true
x-secrets-exposed: false
```

Para endpoints tenant:

```yaml id="wbotnv"
x-tenant-scope: true
x-auth-required: true
x-payment-provider-integration: true
x-public-exposure: false
x-card-data-stored: false
```

Para endpoints own:

```yaml id="tbhu2s"
x-own-resource: true
x-auth-required: true
x-payment-provider-integration: true
x-public-exposure: false
x-card-data-stored: false
```

Para webhooks:

```yaml id="x3t80m"
x-webhook-endpoint: true
x-provider-signature-required: true
x-idempotent-processing: true
x-public-user-endpoint: false
x-audit-event: providerWebhook.received
```

Para checkout:

```yaml id="wyxbfy"
x-hosted-checkout: true
x-checkout-url-temporary: true
x-card-data-captured-by-provider: true
x-card-data-stored: false
```

Para secretos:

```yaml id="b4sg92"
x-secrets-exposed: false
```

Regla:

```text id="b61apt"
OpenAPI no debe documentar endpoints públicos funcionales de pago ni campos sensibles.
```

---

# 32. Casos borde obligatorios

| Caso                                           | Resultado esperado      |
| ---------------------------------------------- | ----------------------- |
| Crear provider definition con secreto          | 422                     |
| Crear tenant provider con `tenantId`           | 422                     |
| Crear tenant provider con bankAccount tenant B | 404/403                 |
| Habilitar provider sin credenciales requeridas | 409                     |
| Crear PaymentIntent con provider disabled      | 409                     |
| Crear PaymentIntent con charge tenant B        | 404/403                 |
| Crear PaymentIntent sin items                  | 422                     |
| Crear PaymentIntent con amount arbitrario      | Rechaza o ignora amount |
| Crear checkout para intent expired             | 409                     |
| Crear checkout para intent succeeded           | 409                     |
| Redirect del navegador indica éxito            | No crea Payment         |
| Webhook sin firma                              | 401/403                 |
| Webhook con firma inválida                     | 401/403                 |
| Webhook con timestamp expirado                 | 401/403                 |
| Webhook duplicado                              | No duplica Payment      |
| providerTransactionId repetido                 | No duplica Payment      |
| amount mismatch                                | requiresReview/rejected |
| currency mismatch                              | requiresReview/rejected |
| provider failed event                          | No crea Payment         |
| provider succeeded/captured verificado         | Crea Payment una vez    |
| provider refund event MVP                      | requiresReview          |
| provider chargeback event MVP                  | requiresReview          |
| DTO expone secret                              | Falla crítica           |
| Log contiene checkoutUrl                       | Falla crítica           |
| Log contiene raw payload                       | Falla crítica           |
| Se almacena PAN/CVV                            | Falla crítica           |
| Endpoint público administrativo existe         | Falla crítica           |
| WordPress confirma pago                        | Falla crítica           |

---

# 33. No aceptación del contrato

La API no debe aceptarse si:

```text id="ldy3sz"
- acepta tenantId desde body;
- permite provider config cross-tenant;
- permite payment intent cross-tenant;
- permite checkout session cross-tenant;
- permite webhook event cross-tenant;
- permite provider transaction cross-tenant;
- permite payment mapping cross-tenant;
- permite settlement cross-tenant;
- permite crear PaymentIntent con charge de otro tenant;
- permite crear PaymentIntent sobre unidad ajena;
- acepta amount enviado por cliente como fuente de verdad;
- expone credentialSecret value;
- expone webhookSecret value;
- expone raw signature;
- expone raw webhook payload;
- expone checkoutUrl en logs;
- guarda PAN;
- guarda CVV;
- guarda raw card data;
- crea Payment desde redirect del navegador;
- crea Payment sin webhook firmado/verificado;
- duplica Payment por webhook repetido;
- permite amount mismatch sin revisión;
- permite currency mismatch sin revisión;
- omite PaymentAllocation cuando corresponde;
- rompe Account Statements;
- marca conciliado bancariamente sin Bank Reconciliation;
- crea endpoints públicos administrativos;
- documenta endpoints públicos administrativos en OpenAPI;
- permite WordPress confirmar pagos;
- envía datos reales a IA externa;
- omite auditoría financiera crítica.
```

---

# 34. Resultado esperado

Este contrato API define una superficie REST segura para `018-payment-provider-integration`.

Debe permitir:

```text id="c70crz"
- administrar definiciones platform de proveedores;
- configurar proveedores por tenant;
- proteger credenciales mediante SecretRef;
- habilitar/deshabilitar proveedores;
- probar conexión sin exponer secretos;
- crear PaymentIntent;
- crear PaymentIntentItems;
- calcular montos server-side;
- crear CheckoutSession;
- devolver checkoutUrl temporal solo en respuesta autorizada;
- consultar intenciones administrativas;
- consultar intenciones propias;
- cancelar/expirar intenciones;
- recibir webhooks firmados;
- validar firma;
- prevenir replay;
- procesar webhooks idempotentemente;
- registrar ProviderWebhookEvent sanitizado;
- registrar ProviderTransaction;
- crear Payment interno desde proveedor verificado;
- crear ProviderPaymentMapping;
- registrar settlement básico;
- vincular settlement con Bank Reconciliation;
- generar reportes;
- exportar reportes;
- integrar Payments;
- integrar Account Statements;
- integrar Secure Document Storage;
- integrar Audit;
- mantener tenant isolation;
- no almacenar datos de tarjeta;
- no exponer secretos;
- no crear endpoints públicos administrativos.
```

---

# 35. Decisión final del contrato

El módulo `018-payment-provider-integration` expondrá APIs privadas platform, tenant y own; además, expondrá un endpoint técnico de webhook protegido por firma.

No habrá endpoints públicos administrativos.

El contrato prioriza:

```text id="z7b42s"
1. Tenant isolation.
2. No almacenamiento de datos de tarjeta.
3. SecretRef strategy.
4. Hosted checkout.
5. Server-side amount calculation.
6. Webhook signed verification.
7. Idempotency.
8. No duplicate Payment.
9. Payments integration.
10. Account Statements consistency.
11. Bank Reconciliation readiness.
12. Audit trail.
13. Safe logs.
14. Safe OpenAPI.
15. No external AI with real payment data.
```

---

# 36. Expediente actualizado

```text id="d6ez9w"
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
│   │   └── 018-payment-provider-integration/
│   │       ├── spec.md
│   │       ├── plan.md
│   │       ├── data-model.md
│   │       └── api-contract.md
```
